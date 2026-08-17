// photoBuildLab — 중2 Ⅴ 식물과 에너지 · "광합성 공장"을 손으로 조립하는 기함 랩.
//  · 위 2/3 = 잎 단면 확대도(잎 몸통 · 엽록체 3개가 든 큰 잎세포 · 아래 표피의 기공 2개).
//  · 아래 1/3 = 흙과 뿌리(물방울 3개) — 물관이 뿌리에서 잎세포까지 이어진다.
//  · 조작 ① 물방울을 물관 경로로 끌어올리기(진행률 판정) ② 이산화 탄소를 기공에 넣기(기공만 통과)
//         ③ 빛 켜기(재료가 다 있어야 생산 시작) ④ 만들어진 산소를 기공 밖으로 끌어내기.
// 과학 가드: 물은 기공이 아니라 **뿌리**로 들어오고, 빛이 없으면 재료가 있어도 광합성은 일어나지 않는다.
// 표현은 전부 ui/plantKit2.ts 헬퍼로만 그린다(색·모양 하드코딩 금지). 난수 금지 — 애니메이션은 tMs 기반.

import { clamp, el } from "../../../core/dom";
import { createLoop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { Curio } from "../../../ui/curio";
import {
  BASE_W, alpha, badge, buildLab, drawChloroplast, drawMatter, drawPipe, drawStoma, drawSunbeam,
  nearestOn, plantColor, pointOn, safeCapture,
} from "../../../ui/plantKit2";
import type { StepRenderer } from "../../types";

interface PhotoBuildStep { title: string; lead?: string; cta?: string; curio?: Curio }

// ── 논리 좌표(360×360). 그릴 때 shell.frame()의 sc를 곱한다. ──────────────
const STAGE_H = 360;
/** 잎 단면 몸통(가로로 누운 둥근 사각형). */
const LEAF = { x0: 26, y0: 40, x1: 334, y1: 180, r: 30 };
/** 잎 속 큰 잎세포(엽록체 3개가 들어 있다). */
const CELL = { x0: 92, y0: 58, x1: 278, y1: 166, r: 26 };
/** 아래 표피 선 — 산소는 이 선을 기공 근처에서만 넘을 수 있다. */
const EPI = 178;
/** 기공 2개(아래 표피). */
const STOMA: readonly [number, number][] = [[140, EPI], [230, EPI]];
/** 흙 띠 윗면. */
const SOIL_Y = 300;
/** 물관 — 뿌리(110,320) → 줄기 → 잎자루 → 잎세포 근처(170,120). */
const XYLEM: readonly [number, number][] = [
  [110, 320], [110, 288], [108, 256], [106, 224], [104, 194], [112, 170], [140, 143], [170, 120],
];
/** 줄기 몸통(물관을 감싸는 초록 기둥). */
const STEM: readonly [number, number][] = [
  [110, 322], [110, 288], [108, 256], [106, 224], [104, 194], [109, 179],
];
/** 뿌리 갈래(굵기 + 마디). */
const ROOTS: readonly { w: number; pts: readonly [number, number][] }[] = [
  { w: 10, pts: [[110, 298], [111, 322], [113, 350]] },
  { w: 6, pts: [[110, 308], [88, 324], [68, 340]] },
  { w: 6, pts: [[111, 314], [136, 330], [157, 343]] },
  { w: 4, pts: [[112, 332], [95, 346], [86, 356]] },
  { w: 4, pts: [[112, 338], [133, 349], [142, 357]] },
];
/** 흙 알갱이(고정 배치 — 난수 금지). */
const GRAIN: readonly [number, number, number][] = [
  [30, 312, 3], [52, 341, 2.4], [96, 353, 2.6], [128, 309, 2.2], [176, 334, 3],
  [200, 312, 2.4], [222, 345, 2.8], [252, 316, 2.2], [276, 338, 3], [300, 309, 2.4],
  [324, 341, 2.6], [341, 317, 2], [186, 356, 2.2], [66, 356, 2.4], [246, 356, 2.6],
];
/** 잎 속 다른 세포들(옅은 윤곽 — 잎 단면의 결). */
const GHOST: readonly [number, number, number, number][] = [
  [40, 60, 44, 36], [40, 118, 44, 44], [286, 60, 44, 36], [286, 118, 44, 44],
];
/** 엽록체 3개 [x, y, 회전]. */
const CHLORO: readonly [number, number, number][] = [[128, 84, -0.22], [185, 84, 0.06], [242, 84, 0.24]];
/** 세포 안 물질 자리 — 물 2칸(→ 포도당), 이산화 탄소 2칸(→ 산소). */
const SLOT_W: readonly [number, number][] = [[126, 120], [156, 120]];
const SLOT_C: readonly [number, number][] = [[214, 120], [248, 120]];
/** 흙 속 물방울 3개(2개만 올리면 재료 절반 충족). */
const WATER_HOME: readonly [number, number][] = [[70, 318], [110, 332], [150, 318]];
/** 잎 바깥 공중의 이산화 탄소 2개. */
const CO2_HOME: readonly [number, number][] = [[290, 215], [320, 250]];

const TOKEN_R = 14;   // drawMatter 라벨 크기(r*0.86)가 12*sc를 넘는 최소 반지름
const CELL_R = 9;     // 세포 안에 쌓이는 재료 알갱이
const GRAB = 26;      // 토큰 잡기 반경
const PIPE_OFF = 40;  // 물관에서 이만큼 벗어나면 진행률 갱신 무시
const STOMA_R = 26;   // 기공 드롭 판정 반경
const STOMA_GATE = 34; // 산소가 표피를 넘을 수 있는 기공 좌우 폭
const OUT_Y = 200;    // 이 아래로 내려가면 산소 방출
const PROD_MS = 700;  // 생산 애니메이션 길이

const HELP_START =
  "흙 속 <b>물방울</b>을 물관을 따라 잎까지 끌어올리고, 공중의 <b>이산화 탄소</b>를 기공에 넣어 보세요.";
const HELP_LIGHT = "재료가 다 들어왔어요. 이제 <b>빛 비추기</b>를 눌러 공장을 돌려 보세요.";
const HELP_DARK = "빛에너지가 없으면 공장이 멈춰 있어요. <b>빛 비추기</b>를 눌러 보세요.";
const HELP_OUT = "엽록체에서 <b>포도당</b>과 <b>산소</b>가 만들어졌어요. 산소를 기공 밖으로 끌어내 보세요.";
const HELP_ALL =
  "빛에너지로 <b>이산화 탄소와 물</b>이 <b>포도당과 산소</b>로 바뀌었어요. " +
  "이 과정이 광합성이고, 일어난 장소는 잎세포의 <b>엽록체</b>예요.";

type Kind = "water" | "carbon" | "oxygen";
type TState = "free" | "drag" | "in" | "out";

interface Token {
  kind: Kind;
  x: number; y: number;   // 논리 좌표
  hx: number; hy: number; // 제자리(스냅백 목적지)
  t: number;              // 물관 진행률(물 전용)
  onPipe: boolean;        // 물관에 올라탔는지
  escaped: boolean;       // 산소가 기공을 빠져나갔는지
  state: TState;
  sbAt: number; sbX: number; sbY: number; // 스냅백 트윈
}

const ease = (p: number): number => 1 - Math.pow(1 - p, 3);

export const photoBuildLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PhotoBuildStep;

  let allDone = false;
  const shell = buildLab(host, {
    title: s.title,
    lead: s.lead,
    height: STAGE_H,
    goals: [
      { id: "stuff", name: "재료 넣기", hint: "물·이산화 탄소" },
      { id: "make", name: "포도당", hint: "빛 켜기" },
      { id: "out", name: "산소 내보내기", hint: "기공 밖으로" },
    ],
    helper: HELP_START,
    read: "물 0/2 · 이산화 탄소 0/2",
    curio: s.curio,
    ariaLabel:
      "잎 단면과 뿌리가 함께 보이는 무대, 물과 이산화 탄소를 잎세포로 옮기고 빛을 비춰 포도당과 산소를 만드는 광합성 실험",
    onAll: () => {
      allDone = true;
      shell.helper.innerHTML = HELP_ALL;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    },
  });

  const canvas = shell.canvas;
  const toastEl = shell.stage.querySelector<HTMLElement>(".toast");
  /** 강조(<b>)가 든 안내 토스트 — shell.toast는 textContent라 뒤에서 한 번 더 얹는다. */
  const say = (html: string): void => {
    shell.toast(html.replace(/<[^>]*>/g, ""));
    if (toastEl) toastEl.innerHTML = html;
  };

  // ── 조작부 ────────────────────────────────────────────────
  const lightName = el("b", { text: "빛 비추기" });
  const lightSub = el("i", { text: "해를 잎에 비춰요" });
  const lightBtn = el(
    "button",
    { class: "pgx-btn", attrs: { type: "button" }, dataset: { act: "light" } },
    lightName, lightSub,
  );
  const resetBtn = el(
    "button",
    { class: "pgx-btn", attrs: { type: "button" }, dataset: { act: "reset" } },
    el("b", { text: "처음부터" }), el("i", { text: "토큰 자리 되돌리기" }),
  );
  shell.controls.classList.add("two");
  shell.controls.append(lightBtn, resetBtn);

  // ── 상태 ──────────────────────────────────────────────────
  const mk = (kind: Kind, hx: number, hy: number): Token => ({
    kind, x: hx, y: hy, hx, hy, t: 0, onPipe: false, escaped: false, state: "free",
    sbAt: -1e9, sbX: hx, sbY: hy,
  });
  const waters = WATER_HOME.map(([x, y]) => mk("water", x, y));
  const carbons = CO2_HOME.map(([x, y]) => mk("carbon", x, y));
  const oxygens = SLOT_C.map(([x, y]) => mk("oxygen", x, y));
  const ALL: readonly Token[] = [...waters, ...carbons, ...oxygens];

  let lightOn = false;
  let lightAmt = 0;
  let produced = false;
  let prodAt = 0;
  let waterIn = 0;
  let co2In = 0;
  let outCount = 0;
  let hintTimer = 0;
  let gateHinted = false;
  let drag: Token | null = null;

  const updateRead = (): void => {
    if (produced) shell.setRead(outCount >= 2 ? "광합성 완료" : `산소 내보내기 ${outCount}/2`);
    else if (waterIn >= 2 && co2In >= 2) shell.setRead(lightOn ? "빛이 켜졌어요" : "빛을 기다리는 중");
    else shell.setRead(`물 ${Math.min(waterIn, 2)}/2 · 이산화 탄소 ${co2In}/2`);
  };

  const startDarkHint = (): void => {
    window.clearTimeout(hintTimer);
    hintTimer = window.setTimeout(() => {
      if (!lightOn && !produced && !allDone) shell.helper.innerHTML = HELP_DARK;
    }, 1200);
  };

  const maybeProduce = (): void => {
    if (produced || waterIn < 2 || co2In < 2 || !lightOn) return;
    produced = true;
    prodAt = performance.now();
    window.clearTimeout(hintTimer);
    if (!allDone) shell.helper.innerHTML = HELP_OUT;
    shell.collect("make", "빛에너지로 포도당이 만들어졌어요");
    updateRead();
  };

  // 재료가 다 찼을 때의 갈림길. "처음부터" 뒤에도 그대로 다시 흐르도록 목표 보유 여부로 막지 않는다
  // (collect 자체가 중복을 걸러 준다 — 여기서 막으면 재도전 때 생산이 시작되지 않는다).
  const checkStuff = (): void => {
    if (waterIn < 2 || co2In < 2) return;
    shell.collect("stuff", "물은 뿌리에서 물관을 타고, 이산화 탄소는 기공으로 들어와요");
    if (lightOn) { maybeProduce(); return; }
    if (!allDone && !produced) shell.helper.innerHTML = HELP_LIGHT;
    startDarkHint();
  };

  const setLight = (on: boolean, announce: boolean): void => {
    lightOn = on;
    lightBtn.classList.toggle("on", on);
    lightName.textContent = on ? "빛 끄기" : "빛 비추기";
    lightSub.textContent = on ? "햇빛이 잎에 닿는 중" : "해를 잎에 비춰요";
    if (on) {
      window.clearTimeout(hintTimer);
      if (waterIn < 2 || co2In < 2) {
        if (announce) say("재료가 모자라요. 물과 이산화 탄소가 모두 필요해요");
      } else maybeProduce();
    }
    updateRead();
  };

  const absorbWater = (tk: Token): void => {
    tk.state = "in";
    if (drag === tk) drag = null;
    waterIn += 1;
    haptic(HAPTIC.select);
    if (waterIn === 2 && co2In < 2) say("물은 <b>뿌리</b>에서 물관을 타고 잎까지 올라와요");
    checkStuff();
    updateRead();
  };

  const enterCarbon = (tk: Token): void => {
    tk.state = "in";
    co2In += 1;
    haptic(HAPTIC.select);
    if (co2In === 2 && waterIn < 2) say("이산화 탄소는 <b>기공</b>으로 잎에 들어와요");
    checkStuff();
    updateRead();
  };

  const releaseOxygen = (tk: Token): void => {
    tk.state = "out";
    if (drag === tk) drag = null;
    outCount += 1;
    haptic(HAPTIC.select);
    if (outCount >= 2) shell.collect("out", "산소는 기공을 통해 밖으로 나가요");
    else say("산소가 <b>기공</b>을 빠져나갔어요");
    updateRead();
  };

  const snapBack = (tk: Token): void => {
    tk.sbX = tk.x; tk.sbY = tk.y; tk.sbAt = performance.now();
    tk.x = tk.hx; tk.y = tk.hy; tk.state = "free";
  };

  const reset = (): void => {
    for (const tk of ALL) {
      tk.x = tk.hx; tk.y = tk.hy; tk.t = 0;
      tk.onPipe = false; tk.escaped = false; tk.state = "free"; tk.sbAt = -1e9;
    }
    drag = null;
    waterIn = 0; co2In = 0; outCount = 0;
    produced = false; prodAt = 0; gateHinted = false;
    window.clearTimeout(hintTimer);
    setLight(false, false);
    if (!allDone) shell.helper.innerHTML = HELP_START;
    updateRead();
  };

  // ── 포인터(캔버스 드래그) ─────────────────────────────────
  const grabbable = (tk: Token): boolean => {
    if (tk.state === "in" || tk.state === "out") return false;
    return tk.kind === "oxygen" ? produced : !produced;
  };
  const pick = (px: number, py: number): Token | null => {
    let best: Token | null = null;
    let bd = GRAB;
    for (const tk of ALL) {
      if (!grabbable(tk)) continue;
      const d = Math.hypot(px - tk.x, py - tk.y);
      if (d < bd) { bd = d; best = tk; }
    }
    return best;
  };
  const stomaDist = (px: number, py: number): number => {
    let d = Infinity;
    for (const [sx, sy] of STOMA) d = Math.min(d, Math.hypot(px - sx, py - sy));
    return d;
  };
  const atStomaX = (px: number): boolean => STOMA.some(([sx]) => Math.abs(px - sx) <= STOMA_GATE);
  const onLeaf = (px: number, py: number): boolean =>
    px > LEAF.x0 - 10 && px < LEAF.x1 + 10 && py > LEAF.y0 - 10 && py < LEAF.y1 + 10;

  const toLogical = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    const sc = (r.width || BASE_W) / BASE_W;
    return { x: (e.clientX - r.left) / sc, y: (e.clientY - r.top) / sc };
  };

  const onDown = (e: PointerEvent): void => {
    const p = toLogical(e);
    const tk = pick(p.x, p.y);
    if (!tk) return;
    drag = tk;
    tk.state = "drag";
    tk.sbAt = -1e9;
    safeCapture(canvas, e.pointerId);
    haptic(HAPTIC.tap);
  };

  const onMove = (e: PointerEvent): void => {
    const tk = drag;
    if (!tk) return;
    const p = toLogical(e);
    if (tk.kind === "water") {
      const hit = nearestOn(XYLEM, p.x, p.y);
      if (hit.dist <= PIPE_OFF) { tk.t = Math.max(tk.t, hit.t); tk.onPipe = true; }
      if (tk.onPipe) {
        const [qx, qy] = pointOn(XYLEM, tk.t);
        tk.x = qx; tk.y = qy;
      } else { tk.x = p.x; tk.y = p.y; }
      if (tk.t > 0.97) absorbWater(tk);
      return;
    }
    if (tk.kind === "carbon") { tk.x = p.x; tk.y = p.y; return; }
    // 산소 — 아래 표피는 기공 자리에서만 통과한다.
    let ny = p.y;
    if (!tk.escaped && ny > EPI) {
      if (atStomaX(p.x)) tk.escaped = true;
      else {
        ny = EPI - 3;
        if (!gateHinted) { gateHinted = true; say("산소도 <b>기공</b>으로만 드나들 수 있어요"); }
      }
    }
    tk.x = p.x; tk.y = ny;
    if (tk.y > OUT_Y) releaseOxygen(tk);
  };

  const onUp = (): void => {
    const tk = drag;
    if (!tk) return;
    drag = null;
    if (tk.state !== "drag") return;
    if (tk.kind === "carbon") {
      if (stomaDist(tk.x, tk.y) <= STOMA_R) { enterCarbon(tk); return; }
      if (onLeaf(tk.x, tk.y)) say("이산화 탄소는 <b>기공</b>으로 드나들어요");
      snapBack(tk);
      return;
    }
    tk.state = "free"; // 물·산소는 놓은 자리에서 이어서 끌 수 있다.
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  const onLightClick = (): void => { haptic(HAPTIC.tap); setLight(!lightOn, true); };
  const onResetClick = (): void => { haptic(HAPTIC.tap); reset(); };
  lightBtn.addEventListener("click", onLightClick);
  resetBtn.addEventListener("click", onResetClick);

  // ── 그리기 ────────────────────────────────────────────────
  const shownPos = (tk: Token, tMs: number): [number, number] => {
    const p = (tMs - tk.sbAt) / 280;
    if (p >= 0 && p < 1) {
      const e = ease(p);
      return [tk.sbX + (tk.x - tk.sbX) * e, tk.sbY + (tk.y - tk.sbY) * e];
    }
    return [tk.x, tk.y];
  };

  const paint = (ctx: CanvasRenderingContext2D, w: number, h: number, k: number, tMs: number): void => {
    const S = (v: number): number => v * k;
    const rr = (x: number, y: number, bw: number, bh: number, r: number): void => {
      (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
        .roundRect(x, y, bw, bh, r);
    };
    const poly = (pts: readonly [number, number][], dx = 0): void => {
      ctx.beginPath();
      ctx.moveTo(S(pts[0][0] + dx), S(pts[0][1]));
      for (let i = 1; i < pts.length; i++) ctx.lineTo(S(pts[i][0] + dx), S(pts[i][1]));
    };
    const gr = produced ? clamp((tMs - prodAt) / PROD_MS, 0, 1) : 0;

    // ① 배경(하늘) ─ 빛을 켜면 위쪽이 밝아진다.
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, alpha("night", 0.54 - 0.3 * lightAmt));
    sky.addColorStop(1, alpha("night", 0.12));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // ② 햇빛
    if (lightAmt > 0.01) drawSunbeam(ctx, S(40), S(330), 0, S(198), lightAmt, tMs);

    // ③ 흙 띠(캔버스 바닥까지) + 알갱이
    const soilTop = S(SOIL_Y);
    ctx.fillStyle = plantColor("soil");
    ctx.fillRect(0, soilTop, w, h - soilTop);
    const shade = ctx.createLinearGradient(0, soilTop, 0, h);
    shade.addColorStop(0, alpha("ink", 0.04));
    shade.addColorStop(1, alpha("ink", 0.38));
    ctx.fillStyle = shade;
    ctx.fillRect(0, soilTop, w, h - soilTop);
    ctx.fillStyle = alpha("paper", 0.12);
    ctx.fillRect(0, soilTop, w, Math.max(1, S(2)));
    ctx.fillStyle = alpha("ink", 0.18);
    for (const [gx, gy, grr] of GRAIN) {
      ctx.beginPath();
      ctx.arc(S(gx), S(gy), S(grr), 0, Math.PI * 2);
      ctx.fill();
    }

    // ④ 뿌리
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const root of ROOTS) {
      ctx.strokeStyle = plantColor("stemLo");
      ctx.lineWidth = S(root.w);
      poly(root.pts);
      ctx.stroke();
      ctx.strokeStyle = alpha("stemHi", 0.35);
      ctx.lineWidth = S(root.w * 0.3);
      poly(root.pts, -root.w * 0.22);
      ctx.stroke();
    }
    ctx.restore();

    // ⑤ 줄기(물관을 감싸는 기둥)
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = plantColor("stemLo");
    ctx.lineWidth = S(26);
    poly(STEM);
    ctx.stroke();
    ctx.strokeStyle = plantColor("stem");
    ctx.lineWidth = S(21);
    poly(STEM);
    ctx.stroke();
    ctx.strokeStyle = alpha("stemHi", 0.45);
    ctx.lineWidth = S(4.5);
    poly(STEM, -7);
    ctx.stroke();
    ctx.restore();

    // ⑥ 잎 몸통(단면)
    const lw = LEAF.x1 - LEAF.x0;
    const lh = LEAF.y1 - LEAF.y0;
    ctx.save();
    const leafG = ctx.createLinearGradient(0, S(LEAF.y0), 0, S(LEAF.y1));
    leafG.addColorStop(0, plantColor("leafHi"));
    leafG.addColorStop(0.46, plantColor("leaf"));
    leafG.addColorStop(1, plantColor("leafLo"));
    ctx.fillStyle = leafG;
    ctx.strokeStyle = plantColor("leafLo");
    ctx.lineWidth = S(1.8);
    ctx.beginPath();
    rr(S(LEAF.x0), S(LEAF.y0), S(lw), S(lh), S(LEAF.r));
    ctx.fill();
    ctx.stroke();
    // 잎 속 다른 세포들(옅은 결)
    ctx.strokeStyle = alpha("leafLo", 0.45);
    ctx.lineWidth = S(1.2);
    for (const [gx, gy, gw, gh] of GHOST) {
      ctx.beginPath();
      rr(S(gx), S(gy), S(gw), S(gh), S(12));
      ctx.stroke();
    }
    // 위·아래 표피 경계선
    ctx.strokeStyle = alpha("leafLo", 0.55);
    ctx.lineWidth = S(1.4);
    for (const ey of [54, 170]) {
      ctx.beginPath();
      ctx.moveTo(S(LEAF.x0 + 16), S(ey));
      ctx.lineTo(S(LEAF.x1 - 16), S(ey));
      ctx.stroke();
    }
    // 빛을 받는 동안의 따뜻한 결
    if (lightAmt > 0.02) {
      ctx.beginPath();
      rr(S(LEAF.x0), S(LEAF.y0), S(lw), S(lh), S(LEAF.r));
      ctx.clip();
      ctx.fillStyle = alpha("sun", 0.16 * lightAmt);
      ctx.fillRect(S(LEAF.x0), S(LEAF.y0), S(lw), S(lh));
    }
    ctx.restore();

    // ⑦ 물관(뿌리 → 잎세포)
    const flow = waterIn > 0 || waters.some((wt) => wt.onPipe && wt.state !== "in") ? 1 : 0;
    drawPipe(ctx, XYLEM.map(([x, y]) => [S(x), S(y)] as [number, number]), "xylem", S(11), flow, tMs);

    // ⑧ 잎세포(세포벽 + 세포질)
    ctx.save();
    ctx.beginPath();
    rr(S(CELL.x0), S(CELL.y0), S(CELL.x1 - CELL.x0), S(CELL.y1 - CELL.y0), S(CELL.r));
    ctx.fillStyle = alpha("paper", 0.17);
    ctx.fill();
    ctx.strokeStyle = plantColor("leafLo");
    ctx.lineWidth = S(3.2);
    ctx.stroke();
    ctx.strokeStyle = alpha("vein", 0.5);
    ctx.lineWidth = S(1.2);
    ctx.beginPath();
    rr(S(CELL.x0 + 5), S(CELL.y0 + 5), S(CELL.x1 - CELL.x0 - 10), S(CELL.y1 - CELL.y0 - 10), S(CELL.r - 5));
    ctx.stroke();
    ctx.restore();

    // ⑨ 엽록체(빛을 받으면 빛난다) + 생산 파문
    const pulse = 0.72 + 0.28 * Math.sin(tMs / 320);
    for (const [cx, cy, rot] of CHLORO) {
      drawChloroplast(ctx, S(cx), S(cy), S(24), S(13), rot, Math.max(0, lightAmt * pulse));
    }
    if (produced && gr < 1) {
      ctx.save();
      ctx.lineWidth = S(2.4);
      ctx.strokeStyle = alpha("sun", 0.55 * (1 - gr));
      for (const [cx, cy] of CHLORO) {
        ctx.beginPath();
        ctx.arc(S(cx), S(cy), S(15 + 26 * gr), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ⑩ 기공 2개(+ 이산화 탄소를 끌고 있으면 드롭 존 표시)
    for (const [sx, sy] of STOMA) drawStoma(ctx, S(sx), S(sy), S(28), 1);
    if (drag && drag.kind === "carbon") {
      ctx.save();
      ctx.setLineDash([S(5), S(5)]);
      ctx.lineWidth = S(2);
      ctx.strokeStyle = alpha("paper", 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(tMs / 240)));
      for (const [sx, sy] of STOMA) {
        ctx.beginPath();
        ctx.arc(S(sx), S(sy), S(STOMA_R), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ⑪ 세포 안 재료 → 생산물
    const matR = CELL_R * (1 - clamp(gr / 0.4, 0, 1));
    const prodR = TOKEN_R * ease(clamp((gr - 0.2) / 0.8, 0, 1));
    if (matR > 0.8) {
      for (let i = 0; i < Math.min(waterIn, 2); i++) {
        drawMatter(ctx, S(SLOT_W[i][0]), S(SLOT_W[i][1]), S(matR), "water");
      }
      for (let i = 0; i < Math.min(co2In, 2); i++) {
        drawMatter(ctx, S(SLOT_C[i][0]), S(SLOT_C[i][1]), S(matR), "carbon");
      }
    }
    if (produced && prodR > 1) {
      for (let i = 0; i < SLOT_W.length; i++) {
        drawMatter(ctx, S(SLOT_W[i][0]), S(SLOT_W[i][1]), S(prodR), "glucose",
          i === 0 && gr >= 1 ? { label: "포도당" } : {});
      }
    }

    // ⑫ 토큰(물·이산화 탄소·산소)
    const ring = (tk: Token): void => {
      const p = 0.5 + 0.5 * Math.sin(tMs / 420);
      const [px, py] = shownPos(tk, tMs);
      ctx.save();
      ctx.strokeStyle = alpha("paper", 0.24 + 0.34 * p);
      ctx.lineWidth = S(2);
      ctx.beginPath();
      ctx.arc(S(px), S(py), S(TOKEN_R + 5 + 3 * p), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };
    const named = (list: readonly Token[]): Token | null => {
      for (const tk of list) if (tk.state === "free" || tk.state === "drag") return tk;
      return null;
    };
    const drawToken = (tk: Token, label: string | null, r: number): void => {
      const [bx, by] = shownPos(tk, tMs);
      const fy = tk.state === "out" ? by + Math.sin(tMs / 720 + bx * 0.1) * 2.5 : by;
      if (tk === drag) {
        ctx.save();
        ctx.fillStyle = alpha("paper", 0.16);
        ctx.beginPath();
        ctx.arc(S(bx), S(fy), S(r * 1.75), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      drawMatter(ctx, S(bx), S(fy), S(r), tk.kind, label ? { label } : {});
    };

    const waterLabel = named(waters);
    const carbonLabel = named(carbons);
    for (const tk of waters) {
      if (tk.state === "in") continue;
      drawToken(tk, tk === waterLabel ? "물" : null, TOKEN_R);
    }
    for (const tk of carbons) {
      if (tk.state === "in") continue;
      drawToken(tk, tk === carbonLabel ? "이산화 탄소" : null, TOKEN_R);
    }
    if (produced && prodR > 1) {
      for (let i = 0; i < oxygens.length; i++) {
        drawToken(oxygens[i], i === 0 && gr >= 1 ? "산소" : null, prodR);
      }
    }
    // 다음에 잡을 토큰 안내
    if (!drag) {
      if (!produced && waterIn < 2 && waterLabel) ring(waterLabel);
      if (!produced && co2In < 2 && carbonLabel) ring(carbonLabel);
      if (produced && gr >= 1 && outCount < 2) {
        const next = named(oxygens);
        if (next) ring(next);
      }
    }

    // ⑬ 이름표
    ctx.save();
    ctx.strokeStyle = alpha("paper", 0.5);
    ctx.lineWidth = S(1.4);
    ctx.beginPath();
    ctx.moveTo(S(84), S(108));
    ctx.lineTo(S(105), S(91));
    ctx.moveTo(S(81), S(192));
    ctx.lineTo(S(123), S(180));
    ctx.moveTo(S(81), S(244));
    ctx.lineTo(S(96), S(241));
    ctx.moveTo(S(211), S(322));
    ctx.lineTo(S(168), S(336));
    ctx.stroke();
    ctx.restore();
    badge(ctx, S(58), S(108), "엽록체", "leaf", k);
    badge(ctx, S(306), S(108), "잎세포", "leaf", k);
    badge(ctx, S(60), S(196), "기공", "leaf", k);
    badge(ctx, S(60), S(244), "물관", "xylem", k);
    badge(ctx, S(232), S(320), "뿌리", "soil", k);
    // 빛에너지 이름표는 잉크 톤 — 흰 배지 위 앰버 글자는 대비가 모자란다.
    if (lightAmt > 0.35) badge(ctx, S(272), S(24), "빛에너지", "ink", k);
  };

  const loop = createLoop((dt, tMs) => {
    const f = shell.frame();
    f.ctx.clearRect(0, 0, f.w, f.h);
    lightAmt += ((lightOn ? 1 : 0) - lightAmt) * Math.min(1, 0.14 * dt);
    paint(f.ctx, f.w, f.h, f.sc, tMs);
  });

  const rafId = requestAnimationFrame(() => loop.start());
  api.setCTA("재료를 넣고 빛을 켜 보세요", { enabled: false });

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(hintTimer);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    lightBtn.removeEventListener("click", onLightClick);
    resetBtn.removeEventListener("click", onResetClick);
    shell.dispose();
  };
};
