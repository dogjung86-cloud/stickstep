// 레이저 미로 — 도전 탭 미니게임(프리미엄). 거울을 탭해 돌려서 레이저를 모든 보석까지
// 보내는 격자 퍼즐. 판 생성은 gen.ts가 정답 역산으로 보장(불가능 판 0%), 이 파일은
// 화면 조립·탭 입력·캔버스 렌더(빔 글로우·광자 흐름·입사각=반사각 호)·보상만 담당.
// main.ts openLaserMaze가 프리미엄 게이트 소유. 보상은 새 판 첫 클리어만 +3 스틱.
//
// 교육 장치(중2 III 연결): 거울 접점마다 입사각=반사각 쌍둥이 호를 상시 표시(reflectLab
// 시각 언어), 합성 보석 판은 코치 한 줄로 가산혼합을 짚는다(colorMixLab 문법 — R+G=노랑).
// 빔끼리는 서로 통과한다(빛은 부딪히지 않는다) — 규칙이 곧 물리.
import { el } from "../../core/dom";
import { icon } from "../../core/icons";
import { haptic, HAPTIC } from "../../core/haptics";
import { createLoop } from "../../core/anim";
import { awardXp, bestScore, submitScore } from "../../core/store";
import type { Screen } from "../../core/router";
import { fitCanvas } from "../../ui/canvas";
import { Bgm, Particles, Sfx } from "../gameKit";
import { COLOR_HEX, COLOR_NAME, DX, DY, inspect, puzzleFor, trace, type Dir, type LaserPuzzle, type Traced } from "./gen";

export const LASER_MAZE_ID = "lasermaze";
const SND_KEY = "lzm.sound"; // 기기 설정(동기화 대상 아님) — "0"이면 끔
const REWARD_XP = 3; // 새 판 첫 클리어 보상(한붓그리기와 통일)

const DIR_ANG: Record<Dir, number> = { 0: -Math.PI / 2, 1: 0, 2: Math.PI / 2, 3: Math.PI };

// ── 오디오 에셋(일레븐랩스 발주 — qa/gen-lasermaze-audio.mjs) ──
// BGM 존 2개 = 판 1~6(기초 반사)/판 7+(색 합성 시대). 파일이 없거나 로드 실패면
// Bgm 무음·Sfx 신스 폴백으로 무해(스텝 러시 문법). 회전 틱은 신스 고정.
const AUDIO_BASE = `${import.meta.env.BASE_URL}game/lasermaze/`;
const BGM_TRACKS = [`${AUDIO_BASE}bgm-laser-focus.mp3`, `${AUDIO_BASE}bgm-laser-prism.mp3`];
const SFX_SAMPLES: Record<string, string> = {
  best: `${AUDIO_BASE}sfx-clear.mp3`, // 판 완성 팬페어
  gem: `${AUDIO_BASE}sfx-gem.mp3`, // 보석 점등 유리 차임
  reset: `${AUDIO_BASE}sfx-reset.mp3`, // 처음 배치로(되감기 휘릭)
};

export function laserMazeScreen(o: { onExit: () => void }): Screen {
  // ---- 헤더(미니게임 공통 문법) ----
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "나가기" }, html: icon("x", 20, { sw: 2.4 }) });
  const sfx = new Sfx();
  sfx.enabled = window.localStorage.getItem(SND_KEY) !== "0";
  const sndBtn = el("button", {
    class: `xbtn lzm-snd ${sfx.enabled ? "" : "off"}`,
    attrs: { "aria-label": "소리 켜기/끄기", "aria-pressed": String(sfx.enabled) },
    html: icon("note", 18),
  });
  const bestPill = el("div", { class: "pill mg-best", text: `최고 ${bestScore(LASER_MAZE_ID)}판` });
  const header = el("div", { class: "lheader" }, xbtn, el("div", { class: "mg-title", text: "레이저 미로" }), sndBtn, bestPill);

  // ---- 무대(캔버스 + HUD) ----
  const cv = el("canvas", { class: "lzm-cv", attrs: { "aria-hidden": "true" } }) as unknown as HTMLCanvasElement;
  const prevBtn = el("button", { class: "lzm-nav", attrs: { "aria-label": "이전 판" }, html: icon("back", 16, { sw: 2.6 }) }) as HTMLButtonElement;
  const nextBtn = el("button", { class: "lzm-nav", attrs: { "aria-label": "다음 판" }, html: icon("chevron", 16, { sw: 2.6 }) }) as HTMLButtonElement;
  const stageLbl = el("b", { text: "1판" });
  const gemLbl = el("div", { class: "lzm-gems", attrs: { "aria-label": "켜진 보석 수" }, text: "보석 0/0" });
  const hud = el("div", { class: "lzm-hud" }, el("div", { class: "lzm-stagerow" }, prevBtn, stageLbl, nextBtn), gemLbl);
  const toast = el("div", { class: "lzm-toast", attrs: { role: "status" } });
  const coachMain = el("b", { text: "거울을 톡 누르면 돌아가요. 레이저를 모든 보석에!" });
  const coachSub = el("span", { text: "" });
  const helper = el("div", { class: "lzm-helper" }, coachMain, coachSub);
  const banNum = el("b", { text: "" });
  const banSub = el("div", { class: "lzm-ban-sub", text: "" });
  const banner = el("div", { class: "lzm-banner", attrs: { role: "status" } }, banNum, banSub);
  const stage = el("div", { class: "lzm-stage" }, cv, hud, helper, toast, banner);

  // ---- 조작부 ----
  const resetBtn = el("button", { class: "lzm-abtn" }, el("span", { class: "lzm-bi", html: icon("recycle", 16) }), el("span", { text: "처음 배치로" }));
  const ctrl = el("div", { class: "lzm-ctrl" }, resetBtn);

  const host = el("section", { class: "screen lzm-scr", attrs: { id: "sc-lasermaze" } }, header, stage, ctrl);

  // ---- 오디오(사용자 제스처 안에서 기동 — soundLab 규율) ----
  const bgm = new Bgm(BGM_TRACKS);
  function audioBoot(): void {
    sfx.init();
    sfx.loadSamples(SFX_SAMPLES);
    bgm.init(sfx.context);
    bgm.setMuted(!sfx.enabled);
  }
  sndBtn.addEventListener("click", () => {
    audioBoot();
    sfx.enabled = !sfx.enabled;
    bgm.setMuted(!sfx.enabled);
    window.localStorage.setItem(SND_KEY, sfx.enabled ? "1" : "0");
    sndBtn.classList.toggle("off", !sfx.enabled);
    sndBtn.setAttribute("aria-pressed", String(sfx.enabled));
    haptic(HAPTIC.tap);
  });

  // ---- 타이머 ----
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // ---- 상태 ----
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  let stageNo = bestScore(LASER_MAZE_ID) + 1;
  let pz: LaserPuzzle = puzzleFor(stageNo);
  let curO: (0 | 1)[] = [];
  let dispA: number[] = []; // 거울 표시 각(도) — 탭 시 목표각으로 스프링
  let tr: Traced;
  let litPrev = new Set<number>();
  let phase: "idle" | "clear" = "idle";
  let taps = 0;
  let nowMs = 0;
  const particles = new Particles();

  // ---- 캔버스 좌표계(격자 → 화면 맞춤) ----
  let ctx: CanvasRenderingContext2D | null = null;
  let vw = 0;
  let vh = 0;
  let cellPx = 40;
  let gx0 = 0;
  let gy0 = 0;
  function resize(): void {
    const f = fitCanvas(cv);
    ctx = f.ctx;
    vw = f.w;
    vh = f.h;
    const pad = 26;
    cellPx = Math.max(8, Math.min((vw - pad * 2) / pz.grid, (vh - pad * 2) / pz.grid));
    gx0 = (vw - pz.grid * cellPx) / 2;
    gy0 = (vh - pz.grid * cellPx) / 2;
  }
  const px = (u: number): number => gx0 + u * cellPx; // 칸 단위 → px (x)
  const py = (u: number): number => gy0 + u * cellPx;

  const orient = (i: number): 0 | 1 => curO[i] ?? 0;
  const retrace = (): void => {
    tr = trace(pz, orient);
  };

  let toastTimer = 0;
  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("on"), 1700);
  }

  function litCount(): number {
    let n = 0;
    pz.cells.forEach((c, i) => {
      if (c.kind === "target" && (tr.arrived.get(i) ?? 0) === c.req) n++;
    });
    return n;
  }
  const targetTotal = (): number => pz.cells.filter((c) => c.kind === "target").length;

  function updateHud(): void {
    stageLbl.textContent = `${stageNo}판`;
    gemLbl.textContent = `보석 ${litCount()}/${targetTotal()}`;
    const maxStage = bestScore(LASER_MAZE_ID) + 1;
    prevBtn.disabled = stageNo <= 1;
    nextBtn.disabled = stageNo >= maxStage;
    if (import.meta.env.DEV) {
      host.dataset.lzmStage = String(stageNo);
      host.dataset.lzmPhase = phase;
      host.dataset.lzmGems = `${litCount()}/${targetTotal()}`;
      host.dataset.lzmTaps = String(taps);
      host.dataset.lzmKind = pz.kind;
    }
  }

  function coachFor(): string {
    if (pz.kind === "white") return "빨강·초록·파랑 세 빛이 모두 모이면 하얀빛 — 빛의 삼원색이에요!";
    if (pz.kind === "pair" && pz.pairReq) {
      const parts = [1, 2, 4].filter((b) => (pz.pairReq! & b) !== 0).map((b) => COLOR_NAME[b]);
      return `${parts[0]} 빛과 ${parts[1]} 빛이 한 보석에 모이면 ${COLOR_NAME[pz.pairReq]}빛이 돼요!`;
    }
    if (pz.cells.some((c) => c.kind === "splitter")) return "반거울은 빛을 반은 통과, 반은 반사시켜 둘로 나눠요.";
    if (stageNo < 5) return "입사각과 반사각은 언제나 같아요 — 거울 옆 작은 호를 봐요.";
    return "거울 방향을 잘 조합해 보세요. 몇 번을 돌려도 괜찮아요.";
  }

  function setStage(n: number): void {
    stageNo = n;
    pz = puzzleFor(n);
    bgm.setZone(n <= 6 ? 0 : 1); // 미기동 시에도 무해 — init이 밀린 존을 이어받는다
    bgm.duck(false);
    curO = pz.cells.map((c) => (c.scrO ?? c.solO ?? 0) as 0 | 1);
    dispA = pz.cells.map((_, i) => (curO[i] === 0 ? -45 : 45));
    taps = 0;
    phase = "idle";
    banner.classList.remove("on");
    particles.clear();
    retrace();
    litPrev = new Set();
    pz.cells.forEach((c, i) => {
      if (c.kind === "target" && (tr.arrived.get(i) ?? 0) === c.req) litPrev.add(i);
    });
    coachSub.textContent = coachFor();
    resize(); // 격자 크기가 판마다 달라질 수 있다
    updateHud();
  }

  // ---- 진행: 회전·점등·완성 ----
  function onClear(): void {
    phase = "clear";
    const isNew = submitScore(LASER_MAZE_ID, stageNo);
    if (isNew) {
      awardXp(REWARD_XP);
      bestPill.textContent = `최고 ${stageNo}판`;
    }
    banNum.textContent = `${stageNo}판 완성!`;
    banSub.textContent = isNew ? `+${REWARD_XP} 스틱` : "이미 깬 판이에요";
    banner.classList.add("on");
    bgm.duck(true); // 팬페어 동안 살짝 가라앉힘 — 다음 판 setStage가 복귀시킨다
    sfx.best();
    haptic(HAPTIC.done);
    if (!reduced)
      pz.cells.forEach((c, i) => {
        if (c.kind !== "target") return;
        later(() => particles.burst(px(c.x + 0.5), py(c.y + 0.5), { n: 14, color: COLOR_HEX[c.req ?? 1], speed: 95, up: 30, life: 520, size: 2.6 }), i * 40);
      });
    later(() => setStage(stageNo + 1), 1500);
    updateHud();
  }

  function toggleAt(cx: number, cy: number): void {
    const i = pz.cells.findIndex((c) => c.x === cx && c.y === cy && (c.kind === "mirror" || c.kind === "splitter"));
    if (i < 0) return;
    curO[i] = (curO[i] ^ 1) as 0 | 1;
    taps++;
    sfx.flip();
    haptic(HAPTIC.tap);
    retrace();
    // 새로 켜진 보석 — 반짝 + 골드음
    pz.cells.forEach((c, ti) => {
      if (c.kind !== "target") return;
      const lit = (tr.arrived.get(ti) ?? 0) === c.req;
      if (lit && !litPrev.has(ti)) {
        litPrev.add(ti);
        sfx.gemLit();
        haptic(HAPTIC.correct);
        if (!reduced) particles.burst(px(c.x + 0.5), py(c.y + 0.5), { n: 10, color: COLOR_HEX[c.req ?? 1], speed: 80, up: 20, life: 420, size: 2.2 });
      } else if (!lit) {
        litPrev.delete(ti);
      }
    });
    updateHud();
    if (tr.won) onClear();
  }

  cv.addEventListener("pointerdown", (e) => {
    audioBoot();
    if (phase !== "idle") return;
    const r = cv.getBoundingClientRect();
    const cx = Math.floor((e.clientX - r.left - gx0) / cellPx);
    const cy = Math.floor((e.clientY - r.top - gy0) / cellPx);
    if (cx < 0 || cy < 0 || cx >= pz.grid || cy >= pz.grid) return;
    toggleAt(cx, cy);
  });

  resetBtn.addEventListener("click", () => {
    audioBoot();
    if (phase !== "idle") return;
    curO = pz.cells.map((c) => (c.scrO ?? c.solO ?? 0) as 0 | 1);
    taps = 0;
    retrace();
    litPrev = new Set();
    pz.cells.forEach((c, i) => {
      if (c.kind === "target" && (tr.arrived.get(i) ?? 0) === c.req) litPrev.add(i);
    });
    sfx.resetWhoosh();
    haptic(HAPTIC.tap);
    showToast("처음 배치로 되돌렸어요");
    updateHud();
  });
  prevBtn.addEventListener("click", () => {
    if (phase !== "idle" || stageNo <= 1) return;
    haptic(HAPTIC.select);
    setStage(stageNo - 1);
  });
  nextBtn.addEventListener("click", () => {
    if (phase !== "idle" || stageNo >= bestScore(LASER_MAZE_ID) + 1) return;
    haptic(HAPTIC.select);
    setStage(stageNo + 1);
  });

  // ---- 렌더 ----
  /** #RRGGBB → rgba. */
  function hexA(hex: string, a: number): string {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function strokeSegs(list: { x1: number; y1: number; x2: number; y2: number }[], width: number, style: string, dashOff?: number): void {
    if (!ctx || !list.length) return;
    const g = ctx;
    g.lineWidth = width;
    g.strokeStyle = style;
    if (dashOff !== undefined) {
      g.setLineDash([3, 13]);
      g.lineDashOffset = dashOff;
    }
    for (const s of list) {
      g.beginPath();
      g.moveTo(px(s.x1), py(s.y1));
      g.lineTo(px(s.x2), py(s.y2));
      g.stroke();
    }
    if (dashOff !== undefined) g.setLineDash([]);
  }

  function draw(tMs: number, dtNorm: number): void {
    if (!ctx) return;
    const g = ctx;
    g.clearRect(0, 0, vw, vh);
    const bg = g.createRadialGradient(vw / 2, vh * 0.42, 40, vw / 2, vh / 2, Math.max(vw, vh) * 0.75);
    bg.addColorStop(0, "#11223B");
    bg.addColorStop(1, "#0B1524");
    g.fillStyle = bg;
    g.fillRect(0, 0, vw, vh);
    g.lineCap = "round";

    // 격자
    g.strokeStyle = "rgba(190,210,240,0.07)";
    g.lineWidth = 1;
    for (let i = 0; i <= pz.grid; i++) {
      g.beginPath();
      g.moveTo(px(i), py(0));
      g.lineTo(px(i), py(pz.grid));
      g.stroke();
      g.beginPath();
      g.moveTo(px(0), py(i));
      g.lineTo(px(pz.grid), py(i));
      g.stroke();
    }

    // 빔 — 색별 3겹 글로우 + 광자 흐름(대시가 빔 방향으로 흐른다)
    const byColor = new Map<number, typeof tr.segs>();
    for (const s of tr.segs) {
      if (!byColor.has(s.color)) byColor.set(s.color, []);
      byColor.get(s.color)!.push(s);
    }
    const flow = reduced ? 0 : -((tMs * 0.022) % 16);
    for (const [c, list] of byColor) {
      const hex = COLOR_HEX[c];
      strokeSegs(list, 10, hexA(hex, 0.14));
      strokeSegs(list, 5.5, hexA(hex, 0.42));
      strokeSegs(list, 2.2, hexA(hex, 0.95));
      strokeSegs(list, 3.2, "rgba(255,255,255,0.75)", flow);
    }

    // 입사각=반사각 쌍둥이 호(교육 장치 — 두 호의 크기가 항상 같다)
    g.lineWidth = 1.6;
    for (const h of tr.hits) {
      const cx = px(h.x + 0.5);
      const cy = py(h.y + 0.5);
      const a1 = DIR_ANG[((h.din + 2) % 4) as Dir]; // 들어온 빛 쪽
      const a2 = DIR_ANG[h.dout];
      const v1 = { x: Math.cos(a1), y: Math.sin(a1) };
      const v2 = { x: Math.cos(a2), y: Math.sin(a2) };
      const bis = Math.atan2(v1.y + v2.y, v1.x + v2.x);
      const r = cellPx * 0.34;
      g.strokeStyle = hexA(COLOR_HEX[h.color], 0.4);
      const ccw1 = ((bis - a1 + Math.PI * 3) % (Math.PI * 2)) - Math.PI > 0;
      g.beginPath();
      g.arc(cx, cy, r, a1, bis, !ccw1);
      g.stroke();
      g.beginPath();
      g.arc(cx, cy, r * 0.8, bis, a2, !ccw1);
      g.stroke();
    }

    // 셀
    for (let i = 0; i < pz.cells.length; i++) {
      const c = pz.cells[i];
      const cx = px(c.x + 0.5);
      const cy = py(c.y + 0.5);
      const half = cellPx * 0.5;
      if (c.kind === "block") {
        g.fillStyle = "#17263D";
        g.strokeStyle = "rgba(220,232,250,0.14)";
        g.lineWidth = 1.5;
        roundRect(g, cx - half * 0.72, cy - half * 0.72, half * 1.44, half * 1.44, 6);
        g.fill();
        g.stroke();
      } else if (c.kind === "emitter") {
        // 몸통 + 방향 포신 + 색 LED
        g.fillStyle = "#101F35";
        g.strokeStyle = "rgba(220,232,250,0.3)";
        g.lineWidth = 1.6;
        roundRect(g, cx - half * 0.62, cy - half * 0.62, half * 1.24, half * 1.24, 7);
        g.fill();
        g.stroke();
        const d = c.dir!;
        g.fillStyle = "#2A3D5C";
        const bw = half * 0.34;
        g.fillRect(cx + DX[d] * half * 0.62 - bw / 2 + DX[d] * bw * 0.5, cy + DY[d] * half * 0.62 - bw / 2 + DY[d] * bw * 0.5, bw, bw);
        const hex = COLOR_HEX[c.color!];
        g.beginPath();
        g.arc(cx, cy, half * 0.24, 0, Math.PI * 2);
        g.fillStyle = hex;
        g.fill();
        g.strokeStyle = hexA(hex, 0.35);
        g.lineWidth = 4;
        g.stroke();
      } else if (c.kind === "target") {
        const req = c.req ?? 1;
        const hex = COLOR_HEX[req];
        const arrived = tr.arrived.get(i) ?? 0;
        const lit = arrived === req;
        const rr = half * 0.52 + (lit && !reduced ? Math.sin(tMs / 240) * 1.6 : 0);
        g.beginPath();
        g.moveTo(cx, cy - rr);
        g.lineTo(cx + rr, cy);
        g.lineTo(cx, cy + rr);
        g.lineTo(cx - rr, cy);
        g.closePath();
        if (lit) {
          g.fillStyle = hexA(hex, 0.9);
          g.fill();
          g.lineWidth = 6;
          g.strokeStyle = hexA(hex, 0.28);
          g.stroke();
        } else {
          g.fillStyle = "#0E1B2E";
          g.fill();
        }
        g.lineWidth = 2.2;
        g.strokeStyle = lit ? "rgba(255,255,255,0.92)" : hexA(hex, 0.85);
        g.stroke();
        // 일부 색만 도착 — 안쪽 점으로 피드백("빨강만 오고 있어요")
        if (!lit && arrived) {
          const bits = [1, 2, 4].filter((b) => (arrived & b) !== 0);
          bits.forEach((b, bi) => {
            g.beginPath();
            g.arc(cx + (bi - (bits.length - 1) / 2) * 7, cy, 2.6, 0, Math.PI * 2);
            g.fillStyle = COLOR_HEX[b];
            g.fill();
          });
        }
      } else {
        // 거울·반거울 — 탭 가능 어포던스 링 + 회전 애니메이션
        const tgt = curO[i] === 0 ? -45 : 45;
        dispA[i] += (tgt - dispA[i]) * Math.min(1, 0.3 * dtNorm);
        const ang = (dispA[i] * Math.PI) / 180;
        g.beginPath();
        g.arc(cx, cy, half * 0.74, 0, Math.PI * 2);
        g.strokeStyle = "rgba(220,232,250,0.1)";
        g.lineWidth = 1.4;
        g.stroke();
        const len = half * 0.66;
        const ex = Math.cos(ang) * len;
        const ey = Math.sin(ang) * len;
        if (c.kind === "splitter") {
          g.lineWidth = 7;
          g.strokeStyle = "rgba(140,200,255,0.3)";
          g.beginPath();
          g.moveTo(cx - ex, cy - ey);
          g.lineTo(cx + ex, cy + ey);
          g.stroke();
          g.lineWidth = 1.6;
          g.strokeStyle = "rgba(240,250,255,0.85)";
          g.beginPath();
          g.moveTo(cx - ex, cy - ey);
          g.lineTo(cx + ex, cy + ey);
          g.stroke();
        } else {
          g.lineWidth = 6;
          g.strokeStyle = "rgba(150,170,200,0.35)";
          g.beginPath();
          g.moveTo(cx - ex, cy - ey);
          g.lineTo(cx + ex, cy + ey);
          g.stroke();
          g.lineWidth = 2.6;
          g.strokeStyle = "#DCE7F5";
          g.beginPath();
          g.moveTo(cx - ex, cy - ey);
          g.lineTo(cx + ex, cy + ey);
          g.stroke();
        }
      }
    }

    particles.draw(g);
  }

  function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  // ---- 루프(mount 뒤 시작 — 스텝 러시 함정 계승) ----
  const loop = createLoop((dtNorm, tMs) => {
    nowMs = tMs;
    void nowMs;
    particles.update(dtNorm * 16.7);
    draw(tMs, dtNorm);
  });
  later(() => {
    resize();
    loop.start();
  }, 0);
  const ro = new ResizeObserver(() => resize());
  ro.observe(stage);

  // ---- DEV·e2e 훅 ----
  if (import.meta.env.DEV) {
    (window as unknown as { __lzmDev?: unknown }).__lzmDev = {
      inspect,
      stage: (): number => stageNo,
      wrongCells: (): { x: number; y: number }[] =>
        pz.cells.filter((c, i) => (c.kind === "mirror" || c.kind === "splitter") && curO[i] !== c.solO).map((c) => ({ x: c.x, y: c.y })),
      rot: (): { x: number; y: number; wrong: boolean }[] =>
        pz.cells
          .map((c, i) => ({ c, i }))
          .filter(({ c }) => c.kind === "mirror" || c.kind === "splitter")
          .map(({ c, i }) => ({ x: c.x, y: c.y, wrong: curO[i] !== c.solO })),
      pos: (x: number, y: number): { x: number; y: number } => {
        const r = cv.getBoundingClientRect();
        return { x: r.left + px(x + 0.5), y: r.top + py(y + 0.5) };
      },
      won: (): boolean => tr.won,
    };
  }

  // ---- 시작·정리 ----
  setStage(stageNo);
  let dead = false;
  function cleanup(): void {
    if (dead) return;
    dead = true;
    loop.stop();
    ro.disconnect();
    bgm.dispose(); // 컨텍스트 소유자(sfx)보다 먼저 정리(스텝 러시 관례)
    sfx.dispose();
    window.clearTimeout(toastTimer);
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
    if (import.meta.env.DEV) delete (window as unknown as { __lzmDev?: unknown }).__lzmDev;
  }
  xbtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    cleanup();
    o.onExit();
  });

  return { el: host, onExit: cleanup };
}
