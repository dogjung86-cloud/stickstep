// sugarFlowLab — 광합성 산물의 생성·이동·저장(책 186~187쪽, 그림 Ⅴ-5)을 손으로 따라가는 랩.
//  국면 1(낮)   잎의 엽록체에 생긴 포도당 3개를 탭·버튼으로 "녹말"로 바꿔 저장한다.
//  국면 2(밤)   밤이 되면 녹말이 "설탕"으로 바뀌어 이동할 준비를 한다.
//  국면 3(배달) 설탕을 체관 세 갈래(꽃·열매·뿌리)로 끌어 배달한다.
//  과학 가드: 물관(파랑)은 물을 뿌리→잎으로 "늘 위로"만 나르고(대비 장치),
//            체관(분홍)은 양분(설탕)을 위·아래 양방향으로 나른다. 이동 형태는 포도당이 아니라 설탕.
//  Math.random 금지(E2E 재현성) — 별·흙 알갱이 좌표까지 전부 고정 배열이다.
//  좌표는 논리 360×360, 그릴 때 shell.frame()의 sc를 곱하고 포인터는 /sc로 되돌린다.

import { clamp, el } from "../../../core/dom";
import { createLoop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import {
  alpha, badge, buildLab, drawLeaf, drawMatter, drawPipe, labButton,
  nearestOn, plantColor, pointOn, safeCapture,
} from "../../../ui/plantKit2";
import type { Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";

interface SugarFlowStep { title: string; lead?: string; cta?: string; curio?: Curio }

type Pt = [number, number];
/** 토큰이 담고 있는 물질(전부 plantKit2의 Matter·PlantTone과 이름이 같다). */
type Stuff = "glucose" | "starch" | "sugar";
/** 국면 — glucose(낮·포도당) → starch(녹말 저장) → sugar(설탕·배달) */
type Phase = "glucose" | "starch" | "sugar";

const STAGE_H = 360;   // 무대 높이 = 논리 y의 최댓값
const R_TOKEN = 9;     // 물질 토큰 반지름(논리)
const GRAB = 28;       // 잡기 반경(논리)
const OFF_PATH = 40;   // 경로 이탈 허용 거리
const ARRIVE = 0.96;   // 도착 판정 진행률
const MORPH_MS = 600;  // 물질 변환 연출 길이

// ── 무대 좌표(논리 360×360) ──────────────────────────────────
const FLOWER_C: Pt = [180, 58];
const FRUIT_C: Pt = [272, 196];
const LEAF_L: Pt = [120, 110];
const LEAF_R: Pt = [240, 110];
const SOIL_Y = 300;

// 물관 — 뿌리(180,318) → 줄기 → 잎(180,120). 알갱이는 항상 위로 흐른다.
const XYLEM: Pt[] = [[180, 318], [176, 302], [174, 258], [174, 176], [177, 136], [180, 120]];

// 체관 세 갈래 — 전부 잎(180,120)에서 출발한다(드래그 판정용 폴리라인).
const P_FLOWER: Pt[] = [[180, 120], [180, 104], [180, 86], [180, 70]];
const P_FRUIT: Pt[] = [[180, 120], [186, 146], [208, 164], [234, 180], [254, 190], [268, 196]];
const P_ROOT: Pt[] = [[180, 120], [186, 146], [186, 200], [186, 254], [183, 292], [180, 310]];

interface Organ {
  path: Pt[];
  dock: Pt;      // 배달된 설탕이 놓이는 자리
  name: string;  // 배달 전 이름표
  label: string; // 배달 뒤 쓰임새 배지
  arrive: string;
  badgeAt: Pt;
  lead: Pt;      // 배지에서 기관으로 잇는 지시선 끝점
}
// 인덱스 0 = 꽃 · 1 = 열매 · 2 = 뿌리
const ORGANS: Organ[] = [
  {
    path: P_FLOWER, dock: [180, 84], name: "꽃", label: "꽃을 피우는 데 이용",
    arrive: "꽃으로 간 양분은 꽃을 피우는 데 쓰여요", badgeAt: [262, 62], lead: [198, 60],
  },
  {
    path: P_FRUIT, dock: [272, 197], name: "열매", label: "저장",
    arrive: "열매에서는 남은 양분을 저장해요", badgeAt: [302, 234], lead: [282, 210],
  },
  {
    path: P_ROOT, dock: [180, 316], name: "뿌리", label: "호흡으로 에너지",
    arrive: "뿌리에서는 호흡으로 에너지를 얻어요", badgeAt: [274, 332], lead: [200, 320],
  },
];

// 토큰 3개는 왼쪽 잎 위(엽록체)에 놓여 있다.
const HOMES: Pt[] = [[96, 99], [120, 103], [144, 107]];

// 고정 장식 좌표(Math.random 금지)
const STARS: [number, number, number][] = [
  [42, 78, 1.5], [78, 54, 1.2], [112, 92, 1.1], [150, 60, 1.4], [210, 76, 1.2], [246, 40, 1.3],
  [276, 118, 1.2], [334, 86, 1.4], [38, 146, 1.1], [320, 158, 1.2], [66, 186, 1], [306, 196, 1.1],
];
const SOIL_DOTS: [number, number, number][] = [
  [58, 318, 2], [96, 338, 1.6], [130, 312, 1.8], [228, 322, 2], [264, 344, 1.7],
  [300, 314, 1.9], [332, 336, 1.6], [44, 350, 1.7], [212, 352, 1.6], [152, 330, 1.5],
];
const GRASS: number[] = [56, 92, 240, 288, 322];
const ROOTS: [number, number, number, number, number, number][] = [
  [180, 306, 160, 314, 142, 326],
  [180, 312, 202, 320, 218, 328],
  [180, 320, 158, 332, 150, 344],
  [180, 326, 198, 336, 208, 346],
];

const STUFF_NAME: Record<Stuff, string> = { glucose: "포도당", starch: "녹말", sugar: "설탕" };
// 녹말(#C4A4E8)은 흰 배지 위에서 옅어 같은 보라 계열의 진한 포도당 색으로 글자를 쓴다.
const STUFF_TONE: Record<Stuff, "glucose" | "sugar"> = { glucose: "glucose", starch: "glucose", sugar: "sugar" };

// ── 문구 ─────────────────────────────────────────────────────
const HELP_START = "잎의 엽록체에서 <b>포도당</b>이 만들어졌어요. 잎을 탭하거나 아래 <b>녹말로 바꾸기</b>를 눌러 보세요.";
const HELP_AFTER_STARCH = "포도당은 물에 잘 녹지 않는 <b>녹말</b>로 바뀌어 엽록체에 저장돼요. 이제 <b>밤으로 바꾸기</b>를 눌러 보세요.";
const HELP_NIGHT = "밤이 되었어요. <b>설탕으로 바꾸기</b>를 눌러 이동할 준비를 해 보세요.";
const HELP_DELIVER = "설탕 3개를 하나씩 잡아 <b>체관</b>을 따라 <b>꽃·열매·뿌리</b>로 끌어 보세요. 체관은 위로도 아래로도 갈 수 있어요.";
const HELP_NEED_STARCH = "먼저 낮에 만든 포도당을 <b>녹말</b>로 바꿔 저장해 보세요.";
const HELP_NIGHT_FIRST = "이동은 주로 <b>밤</b>에 일어나요. <b>밤으로 바꾸기</b>를 먼저 눌러 보세요.";
const MSG_STARCH = "포도당은 물에 잘 녹지 않는 <b>녹말</b>로 바뀌어 저장돼요";
const MSG_SUGAR = "주로 <b>밤</b>에 설탕으로 바뀌어 이동할 준비를 해요";
const MSG_DELIVER = "체관은 <b>위로도 아래로도</b> 양분을 날라요";
const MSG_ALL = "잎에서 만든 포도당은 <b>녹말</b>로 저장되었다가, 주로 밤에 <b>설탕</b>으로 바뀌어 <b>체관</b>을 타고 필요한 기관으로 갑니다. 물관이 물을 위로만 나르는 것과 달리, 체관은 <b>위아래 모두</b>로 양분을 날라요.";

/** 토스트는 textContent라 태그를 그대로 노출한다 — 강조 태그만 걷어낸 평문을 넘긴다. */
const plain = (html: string): string => html.replace(/<[^>]+>/g, "");

interface Token { x: number; y: number; home: Pt; path: number; t: number; target: number }

export const sugarFlowLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SugarFlowStep;

  const shell = buildLab(host, {
    title: s.title,
    lead: s.lead,
    height: STAGE_H,
    goals: [
      { id: "starch", name: "녹말로", hint: "잎에서 저장" },
      { id: "sugar", name: "설탕으로", hint: "밤에 바뀜" },
      { id: "deliver", name: "배달", hint: "꽃·열매·뿌리" },
    ],
    helper: HELP_START,
    read: "낮 · 포도당",
    curio: s.curio,
    ariaLabel: "잎에서 만든 포도당이 녹말로 저장되었다가 밤에 설탕으로 바뀌어 체관을 따라 꽃·열매·뿌리로 이동하는 식물 무대",
    onAll: () => {
      shell.helper.innerHTML = MSG_ALL;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    },
  });

  const canvas = shell.canvas;

  // 범례 — 무대 아래, 조작부 위
  const legend = el("div", {
    class: "pgx-legend",
    html:
      '<span class="xylem"><i></i>물관 · 물</span>'
      + '<span class="phloem"><i></i>체관 · 양분</span>'
      + '<span class="starch"><i></i>녹말</span>'
      + '<span class="sugar"><i></i>설탕</span>',
  });
  host.insertBefore(legend, shell.controls);

  // ── 상태 ───────────────────────────────────────────────────
  let sc = 1;
  let phase: Phase = "glucose";
  let stuff: Stuff = "glucose";
  let morphFrom: Stuff | null = null;
  let morphT0 = 0;
  let nightOn = false;
  let nightF = 0;
  let drag = -1;
  const tokens: Token[] = HOMES.map((h) => ({ x: h[0], y: h[1], home: h, path: -1, t: 0, target: -1 }));
  const takenBy: number[] = [-1, -1, -1];

  // ── 조작부 ─────────────────────────────────────────────────
  const starchBtn = labButton("녹말로 바꾸기", () => doStarch(), { tone: "primary", sub: "포도당 → 녹말" });
  starchBtn.dataset.act = "starch";
  const nightBtn = labButton("밤으로 바꾸기", () => doNight(), { sub: "이동 준비" });
  nightBtn.dataset.act = "night";
  const sugarBtn = labButton("설탕으로 바꾸기", () => doSugar(), { sub: "녹말 → 설탕" });
  sugarBtn.dataset.act = "sugar";
  sugarBtn.disabled = true;
  shell.controls.classList.add("three");
  shell.controls.append(starchBtn, nightBtn, sugarBtn);

  // ── 국면 전환 ──────────────────────────────────────────────
  function nudgeNight(): void {
    shell.helper.innerHTML = HELP_NIGHT_FIRST;
    shell.toast("이동은 주로 밤에 일어나요");
  }

  function doStarch(): void {
    if (phase !== "glucose" || morphFrom) return;
    morphFrom = stuff;
    stuff = "starch";
    morphT0 = performance.now();
    starchBtn.disabled = true;
    starchBtn.classList.remove("primary");
    starchBtn.classList.add("on");
    nightBtn.classList.add("primary");
  }

  function doNight(): void {
    if (nightOn) return;
    if (phase !== "starch") {
      shell.helper.innerHTML = HELP_NEED_STARCH;
      shell.toast("먼저 포도당을 녹말로 바꿔 보세요");
      return;
    }
    nightOn = true;
    nightBtn.disabled = true;
    nightBtn.classList.remove("primary");
    nightBtn.classList.add("on");
    sugarBtn.disabled = false;
    sugarBtn.classList.add("primary");
    shell.setRead("밤 · 이동 준비");
    shell.helper.innerHTML = HELP_NIGHT;
    shell.toast("해가 지고 밤이 되었어요");
  }

  function doSugar(): void {
    if (!nightOn) { nudgeNight(); return; }
    if (phase !== "starch" || morphFrom) return;
    morphFrom = stuff;
    stuff = "sugar";
    morphT0 = performance.now();
    sugarBtn.disabled = true;
    sugarBtn.classList.remove("primary");
    sugarBtn.classList.add("on");
  }

  /** 0.6초 변환 연출이 끝나는 순간의 뒷정리 — 목표·안내는 여기서 한 번만 낸다. */
  function finishMorph(): void {
    if (stuff === "starch" && phase === "glucose") {
      phase = "starch";
      shell.setRead(nightOn ? "밤 · 녹말 저장" : "낮 · 녹말 저장");
      shell.helper.innerHTML = HELP_AFTER_STARCH;
      shell.collect("starch", plain(MSG_STARCH));
    } else if (stuff === "sugar" && phase === "starch") {
      phase = "sugar";
      canvas.classList.add("grab");
      shell.setRead("밤 · 설탕 이동");
      shell.helper.innerHTML = HELP_DELIVER;
      shell.collect("sugar", plain(MSG_SUGAR));
    }
  }

  function deliver(ti: number, oi: number): void {
    const tok = tokens[ti];
    tok.target = oi;
    tok.path = -1;
    tok.t = 0;
    tok.x = ORGANS[oi].dock[0];
    tok.y = ORGANS[oi].dock[1];
    takenBy[oi] = ti;
    drag = -1;
    haptic(HAPTIC.select);
    const left = takenBy.reduce((n, v) => n + (v < 0 ? 1 : 0), 0);
    if (left > 0) {
      shell.setRead(`밤 · 배달 ${3 - left}/3`);
      shell.toast(ORGANS[oi].arrive);
      return;
    }
    canvas.classList.remove("grab");
    shell.setRead("밤 · 배달 완료");
    shell.helper.innerHTML = MSG_DELIVER;
    shell.collect("deliver", plain(MSG_DELIVER));
  }

  // ── 포인터 ─────────────────────────────────────────────────
  const local = (e: PointerEvent): Pt => {
    const r = canvas.getBoundingClientRect();
    const k = sc || 1;
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];
  };
  const leafHit = (px: number, py: number): boolean => {
    for (const [cx, cy] of [LEAF_L, LEAF_R]) {
      const dx = (px - cx) / 54;
      const dy = (py - cy) / 26;
      if (dx * dx + dy * dy <= 1) return true;
    }
    return false;
  };

  const onDown = (e: PointerEvent): void => {
    const [px, py] = local(e);
    if (phase === "sugar") {
      let pick = -1;
      let best = GRAB;
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].target >= 0) continue;
        const d = Math.hypot(px - tokens[i].x, py - tokens[i].y);
        if (d < best) { best = d; pick = i; }
      }
      if (pick >= 0) {
        drag = pick;
        safeCapture(canvas, e.pointerId);
        haptic(HAPTIC.tap);
        return;
      }
      if (tokens.some((t) => t.target < 0)) shell.toast("설탕을 잡아 체관을 따라 끌어 보세요");
      return;
    }
    if (!leafHit(px, py)) return;
    if (phase === "glucose") { doStarch(); return; }
    if (nightOn) shell.helper.innerHTML = HELP_NIGHT;
    else nudgeNight();
  };

  const onMove = (e: PointerEvent): void => {
    if (drag < 0) return;
    const tok = tokens[drag];
    const [px, py] = local(e);
    // 아직 배달되지 않은 기관만 후보 — 배달된 갈래는 판정에서 빠진다.
    let bestI = -1;
    let bestD = Infinity;
    let bestT = 0;
    let curD = Infinity;
    let curT = 0;
    for (let i = 0; i < ORGANS.length; i++) {
      if (takenBy[i] >= 0) continue;
      const hit = nearestOn(ORGANS[i].path, px, py);
      if (hit.dist < bestD) { bestD = hit.dist; bestI = i; bestT = hit.t; }
      if (i === tok.path) { curD = hit.dist; curT = hit.t; }
    }
    if (bestI < 0) return;
    let pi = tok.path;
    if (pi < 0 || curD === Infinity) {
      // 아직 체관에 올라타기 전 — 손끝을 따라오다가 40 안쪽에서 관을 탄다.
      if (bestD > OFF_PATH) { tok.x = px; tok.y = py; return; }
      pi = bestI;
      tok.path = pi;
      tok.t = bestT;
    } else if (tok.t < 0.5 && bestI !== pi && bestD + 6 < curD) {
      // 잎 아래 갈림길(줄기 첫 구간은 뿌리·열매가 공유) — 초반에만 갈아탄다.
      pi = bestI;
      tok.path = pi;
      tok.t = bestT;
    } else if (curD > OFF_PATH) {
      return; // 경로에서 40 이상 벗어나면 무시
    } else {
      tok.t = Math.max(tok.t, curT); // 역주행 무시
    }
    const [tx, ty] = pointOn(ORGANS[pi].path, tok.t);
    tok.x = tx;
    tok.y = ty;
    if (tok.t > ARRIVE) deliver(drag, pi);
  };

  const onUp = (): void => {
    if (drag < 0) return;
    const tok = tokens[drag];
    if (tok.target < 0 && tok.path < 0) { tok.x = tok.home[0]; tok.y = tok.home[1]; }
    drag = -1;
  };

  // 비활성 버튼은 클릭 이벤트를 내지 않는다 — 조작부에서 받아 위치로 판정한다.
  const onControlsDown = (e: PointerEvent): void => {
    if (!sugarBtn.disabled || nightOn || phase === "sugar") return;
    const t = e.target as Node | null;
    if (!(t && (t === sugarBtn || sugarBtn.contains(t)))) {
      const r = sugarBtn.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    }
    nudgeNight();
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  shell.controls.addEventListener("pointerdown", onControlsDown);

  // ── 그리기 ─────────────────────────────────────────────────
  const P = (v: number): number => v * sc;
  const spts = (pts: readonly Pt[]): [number, number][] => pts.map((p) => [p[0] * sc, p[1] * sc] as [number, number]);

  function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();
    ctx.fillStyle = plantColor("paper");
    ctx.fillRect(0, 0, w, h);
    const day = ctx.createLinearGradient(0, 0, 0, h);
    day.addColorStop(0, alpha("xylem", 0.36));
    day.addColorStop(0.62, alpha("xylem", 0.12));
    day.addColorStop(1, alpha("sun", 0.18));
    ctx.fillStyle = day;
    ctx.fillRect(0, 0, w, h);
    if (nightF > 0.004) {
      ctx.globalAlpha = nightF;
      const ng = ctx.createLinearGradient(0, 0, 0, h);
      ng.addColorStop(0, plantColor("night"));
      ng.addColorStop(0.72, alpha("night", 0.94));
      ng.addColorStop(1, alpha("night", 0.86));
      ctx.fillStyle = ng;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  function drawGround(ctx: CanvasRenderingContext2D, w: number): void {
    ctx.save();
    const top = P(SOIL_Y);
    const g = ctx.createLinearGradient(0, top, 0, P(STAGE_H));
    g.addColorStop(0, plantColor("soil"));
    g.addColorStop(1, alpha("ink", 0.72));
    ctx.fillStyle = g;
    ctx.fillRect(0, top, w, P(STAGE_H) - top);
    ctx.fillStyle = alpha("paper", 0.16);
    for (const [x, y, r] of SOIL_DOTS) {
      ctx.beginPath();
      ctx.arc(P(x), P(y), P(r), 0, Math.PI * 2);
      ctx.fill();
    }
    // 지면 풀
    ctx.strokeStyle = plantColor("leaf");
    ctx.lineCap = "round";
    ctx.lineWidth = 2 * sc;
    for (const x of GRASS) {
      ctx.beginPath();
      ctx.moveTo(P(x), P(SOIL_Y + 1));
      ctx.quadraticCurveTo(P(x + 3), P(SOIL_Y - 6), P(x + 8), P(SOIL_Y - 9));
      ctx.moveTo(P(x + 4), P(SOIL_Y + 1));
      ctx.quadraticCurveTo(P(x + 3), P(SOIL_Y - 5), P(x - 2), P(SOIL_Y - 8));
      ctx.stroke();
    }
    // 뿌리 — 흙 위에서 잘 읽히도록 킷의 옅은 크림색 토큰을 쓴다.
    ctx.strokeStyle = plantColor("fat");
    ctx.lineWidth = 5 * sc;
    ctx.beginPath();
    ctx.moveTo(P(180), P(298));
    ctx.lineTo(P(180), P(332));
    ctx.stroke();
    ctx.lineWidth = 3 * sc;
    for (const [x0, y0, x1, y1, x2, y2] of ROOTS) {
      ctx.beginPath();
      ctx.moveTo(P(x0), P(y0));
      ctx.quadraticCurveTo(P(x1), P(y1), P(x2), P(y2));
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSkyBody(ctx: CanvasRenderingContext2D, tMs: number): void {
    const cx = P(312);
    const cy = P(26);
    ctx.save();
    // 해(낮)
    if (nightF < 0.99) {
      ctx.globalAlpha = 1 - nightF;
      ctx.strokeStyle = alpha("sun", 0.8);
      ctx.lineWidth = 2 * sc;
      ctx.lineCap = "round";
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + (tMs / 9000);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * P(17), cy + Math.sin(a) * P(17));
        ctx.lineTo(cx + Math.cos(a) * P(22), cy + Math.sin(a) * P(22));
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(cx - P(4), cy - P(4), P(1), cx, cy, P(14));
      g.addColorStop(0, alpha("paper", 0.95));
      g.addColorStop(1, plantColor("sun"));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, P(14), 0, Math.PI * 2);
      ctx.fill();
    }
    // 달·별(밤)
    if (nightF > 0.01) {
      ctx.globalAlpha = nightF;
      ctx.fillStyle = alpha("paper", 0.92);
      ctx.beginPath();
      ctx.arc(cx, cy, P(13), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = alpha("ink", 0.12);
      for (const [dx, dy, r] of [[-4, -3, 3], [3, 2, 2.2], [-1, 5, 1.6]] as [number, number, number][]) {
        ctx.beginPath();
        ctx.arc(cx + P(dx), cy + P(dy), P(r), 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0; i < STARS.length; i++) {
        const [x, y, r] = STARS[i];
        ctx.globalAlpha = nightF * (0.45 + 0.45 * (0.5 + 0.5 * Math.sin(tMs / 620 + i)));
        ctx.fillStyle = plantColor("paper");
        ctx.beginPath();
        ctx.arc(P(x), P(y), P(r), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawPlant(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // 줄기(원통 느낌의 가로 그라데이션)
    const g = ctx.createLinearGradient(P(169), 0, P(191), 0);
    g.addColorStop(0, plantColor("stemLo"));
    g.addColorStop(0.38, plantColor("stemHi"));
    g.addColorStop(1, plantColor("stem"));
    ctx.strokeStyle = g;
    ctx.lineWidth = 22 * sc;
    ctx.beginPath();
    ctx.moveTo(P(180), P(302));
    ctx.lineTo(P(180), P(112));
    ctx.stroke();
    // 꽃대
    ctx.lineWidth = 12 * sc;
    ctx.beginPath();
    ctx.moveTo(P(180), P(118));
    ctx.lineTo(P(180), P(70));
    ctx.stroke();
    // 열매 가지
    ctx.strokeStyle = plantColor("stem");
    ctx.lineWidth = 13 * sc;
    ctx.beginPath();
    ctx.moveTo(P(182), P(140));
    for (let i = 1; i < P_FRUIT.length; i++) ctx.lineTo(P(P_FRUIT[i][0]), P(P_FRUIT[i][1]));
    ctx.stroke();
    ctx.restore();
    // 잎 두 장(바깥 끝이 살짝 들린다)
    drawLeaf(ctx, P(LEAF_L[0]), P(LEAF_L[1]), 96 * sc, 34 * sc, 0.16);
    drawLeaf(ctx, P(LEAF_R[0]), P(LEAF_R[1]), 96 * sc, 34 * sc, -0.16);
    drawFlower(ctx);
    drawFruit(ctx);
  }

  function drawFlower(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(P(FLOWER_C[0]), P(FLOWER_C[1]));
    ctx.strokeStyle = alpha("ink", 0.22);
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.translate(0, -P(11));
      const g = ctx.createRadialGradient(0, 0, P(1), 0, 0, P(10));
      g.addColorStop(0, alpha("phloem", 0.5));
      g.addColorStop(1, plantColor("phloem"));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, P(6.4), P(9.6), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    const c = ctx.createRadialGradient(-P(2), -P(2), P(1), 0, 0, P(7));
    c.addColorStop(0, alpha("paper", 0.85));
    c.addColorStop(1, plantColor("sun"));
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(0, 0, P(6.6), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawFruit(ctx: CanvasRenderingContext2D): void {
    const [fx, fy] = FRUIT_C;
    ctx.save();
    const g = ctx.createRadialGradient(P(fx - 6), P(fy - 7), P(2), P(fx), P(fy), P(19));
    g.addColorStop(0, alpha("paper", 0.9));
    g.addColorStop(0.42, plantColor("sun"));
    g.addColorStop(1, plantColor("sugar"));
    ctx.fillStyle = g;
    ctx.strokeStyle = alpha("ink", 0.3);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(P(fx), P(fy), P(19), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 꼭지 잎
    ctx.fillStyle = plantColor("leafLo");
    ctx.beginPath();
    ctx.ellipse(P(fx - 4), P(fy - 18), P(7), P(3.4), -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** 배달이 지나간 자국 — 설탕색으로 체관 위를 덧그린다. */
  function drawTrail(ctx: CanvasRenderingContext2D, path: Pt[], t: number): void {
    if (t < 0.02) return;
    ctx.save();
    ctx.strokeStyle = alpha("sugar", 0.85);
    ctx.lineWidth = 5 * sc;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const n = 26;
    for (let i = 0; i <= n; i++) {
      const [x, y] = pointOn(path, (i / n) * t);
      if (i === 0) ctx.moveTo(P(x), P(y));
      else ctx.lineTo(P(x), P(y));
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawToken(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, now: number): void {
    if (!morphFrom) {
      drawMatter(ctx, P(x), P(y), P(r), stuff);
      return;
    }
    const p = clamp((now - morphT0) / MORPH_MS, 0, 1);
    if (p < 0.5) {
      drawMatter(ctx, P(x), P(y), Math.max(1.2, P(r) * (1 - p * 1.7)), morphFrom);
    } else {
      const q = (p - 0.5) * 2;
      const e = 1 - Math.pow(1 - q, 3);
      const pop = 1 + 0.18 * Math.sin(Math.PI * q);
      drawMatter(ctx, P(x), P(y), Math.max(1.2, P(r) * (0.25 + 0.75 * e) * pop), stuff);
    }
    ctx.save();
    ctx.strokeStyle = alpha(stuff, 0.55 * (1 - p));
    ctx.lineWidth = 2 * sc;
    ctx.beginPath();
    ctx.arc(P(x), P(y), P(r) * 1.1 + P(16) * p, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawBadges(ctx: CanvasRenderingContext2D): void {
    // 물질 이름표(잎 아래) — 아직 배달할 토큰이 남아 있을 때만
    if (tokens.some((t) => t.target < 0)) {
      badge(ctx, P(104), P(142), STUFF_NAME[stuff], STUFF_TONE[stuff], sc);
    }
    for (let i = 0; i < ORGANS.length; i++) {
      const o = ORGANS[i];
      const done = takenBy[i] >= 0;
      if (!done && phase !== "sugar") continue;
      ctx.save();
      ctx.strokeStyle = alpha("ink", 0.28);
      ctx.lineWidth = 1.2 * sc;
      ctx.beginPath();
      ctx.moveTo(P(o.badgeAt[0]), P(o.badgeAt[1]));
      ctx.lineTo(P(o.lead[0]), P(o.lead[1]));
      ctx.stroke();
      ctx.restore();
      badge(ctx, P(o.badgeAt[0]), P(o.badgeAt[1]), done ? o.label : o.name, done ? "sugar" : "phloem", sc);
    }
  }

  // ── 루프 ───────────────────────────────────────────────────
  const loop = createLoop((dt, tMs) => {
    const f = shell.frame();
    const ctx = f.ctx;
    sc = f.sc;
    ctx.clearRect(0, 0, f.w, f.h);

    // 낮↔밤 보간
    const target = nightOn ? 1 : 0;
    nightF += (target - nightF) * Math.min(1, 0.09 * dt);
    if (Math.abs(target - nightF) < 0.004) nightF = target;
    // 변환 연출 종료
    if (morphFrom && tMs - morphT0 >= MORPH_MS) { morphFrom = null; finishMorph(); }

    drawSky(ctx, f.w, f.h);
    drawGround(ctx, f.w);
    drawPlant(ctx);
    // 밤 장막 — 무대 밝기를 낮춘다(관·토큰·배지는 그 위에 얹는다)
    if (nightF > 0.01) {
      ctx.fillStyle = alpha("night", 0.34 * nightF);
      ctx.fillRect(0, 0, f.w, f.h);
    }
    drawSkyBody(ctx, tMs);

    // 관 — 물관은 늘 위로, 체관은 배달을 마치면 위·아래로 함께 흐른다.
    drawPipe(ctx, spts(XYLEM), "xylem", 10 * sc, 1, tMs);
    const flow = shell.has("deliver") ? 0.7 : 0;
    for (const o of ORGANS) drawPipe(ctx, spts(o.path), "phloem", 9 * sc, flow, tMs);

    // 지나간 자국
    for (let i = 0; i < ORGANS.length; i++) {
      if (takenBy[i] >= 0) drawTrail(ctx, ORGANS[i].path, 1);
    }
    if (drag >= 0 && tokens[drag].path >= 0) drawTrail(ctx, ORGANS[tokens[drag].path].path, tokens[drag].t);

    // 토큰
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.target >= 0) {
        drawMatter(ctx, P(tok.x), P(tok.y), P(8), "sugar");
        continue;
      }
      if (phase === "sugar" && drag < 0) {
        const pulse = 3 + 2 * Math.sin(tMs / 420 + i * 0.8);
        ctx.save();
        ctx.strokeStyle = alpha("sugar", 0.5);
        ctx.lineWidth = 1.8 * sc;
        ctx.beginPath();
        ctx.arc(P(tok.x), P(tok.y), P(R_TOKEN + pulse), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      drawToken(ctx, tok.x, tok.y, drag === i ? R_TOKEN + 1.5 : R_TOKEN, tMs);
    }

    drawBadges(ctx);
  });
  loop.start();

  api.setCTA("양분을 만들고 필요한 곳으로 보내 보세요", { enabled: false });

  return () => {
    loop.stop();
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    shell.controls.removeEventListener("pointerdown", onControlsDown);
    shell.dispose();
  };
};
