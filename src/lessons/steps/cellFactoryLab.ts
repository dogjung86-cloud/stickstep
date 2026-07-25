// cellFactoryLab — 세포를 빵공장에 견주어 구조와 하는 일을 짝짓는 랩(중1 Ⅱ L2).
//  · 공장 소품 3개(출입문과 벽 · 중앙 통제실 · 발전기)를 세포 그림의 알맞은 구조로 끌어다 놓는다.
//    출입문과 벽 → 세포막·세포벽 / 중앙 통제실 → 핵 / 발전기 → 마이토콘드리아.
//  · 맞으면 그 구조가 "실제로 하는 일"이 애니메이션으로 살아난다 —
//    막을 드나드는 물질 점(일부는 막에서 되돌아간다 = 조절), 핵에서 퍼지는 신호 파동, 마이토콘드리아의 에너지 반짝임.
//  · 틀리면 되돌려 놓고, 두 구조가 하는 일이 어떻게 다른지 토스트로 짚는다(그냥 "틀렸어요" 금지).
//  · 목표 3개 = 대응 3쌍.
//
// 그림은 식물 세포다(세포벽이 짝의 한쪽이라 식물 세포여야 성립한다). 엽록체는 짝 대상이 아니라
// 처음엔 이름 없이 놓아두고, 세 쌍을 다 맞춘 뒤에 "식물 세포에만 있는 엽록체"로 이름을 밝힌다.
// 드래그는 safePointerCapture 문법 필수(합성 PointerEvent에서 throw로 리스너가 죽는 것을 막는 장치).
//
// ── 그림 규격(2026-07-26 재작도 — 실사용 지적 "그림이 조잡하다") ────────────────────
// 세포는 이 단원 발주본(public/bio3/figs/plant-cell.webp)의 인상을 그대로 따른다:
//   ① 각진 육각 세포벽(두껍고 단단·베벨) ② 그 안쪽에 얇은 막 한 겹 ③ 연둣빛 세포질 + 알갱이
//   ④ 또렷한 보라 핵(핵막·유전물질 알갱이·인) ⑤ 콩 모양 마이토콘드리아(안쪽 주름)
//   ⑥ 초록 렌즈 알갱이(엽록체, 결 무늬)
// 소품 3종과 세포 모두 파운드리 재질 문법을 지킨다 — ① 근-동조 3스톱 그라데이션 면
// ② 좌상단 키라이트 ③ 바닥 접촉 그림자 ④ 외곽선은 재질별 최암색 1.4~1.6px(균일 검은 선 금지).

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { contactShadow, softGlow } from "../../ui/labProps";
import { haptic, HAPTIC } from "../../core/haptics";
import { safePointerCapture } from "../../ui/bodyKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3-cell.css";

interface CellFactoryStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "wall" | "nucleus" | "mito";
type TokenId = "gate" | "control" | "power";
type Ctx = CanvasRenderingContext2D;
interface Pt { x: number; y: number }

const CVH = 348;
const BASE_W = 360;
/** 논리 좌표계의 세로 기준 — 넓은 화면에서도 소품 트레이가 잘리지 않게 letterbox 스케일을 쓴다. */
const BASE_H = 334;
const TAU = Math.PI * 2;

const MEM = "#12B886";
const WALL_C = "#7FB53E";
const NUC_C = "#8B5CD6";
const MITO_C = "#E1682F";
const CHLORO_C = "#4E9B33";

// 무대 위쪽 14~52는 HUD 필 자리 — 세포 그림은 그 아래에서 시작한다.
const CELL = { x0: 22, x1: 338, y0: 54, y1: 232, cut: 46 };
const CELL_CY = (CELL.y0 + CELL.y1) / 2;
/** 세포벽 두께(각진 벽) · 세포막은 그 안쪽에 붙은 얇은 한 겹. */
const WALL_T = 13;
const NUC = { x: 200, y: 120, rx: 42, ry: 38 };
const MITOS: { x: number; y: number; a: number }[] = [
  { x: 86, y: 178, a: -0.32 },
  { x: 272, y: 190, a: 0.22 },
];
const CHLOROS: { x: number; y: number; a: number }[] = [
  { x: 76, y: 106, a: 0.34 }, { x: 122, y: 132, a: -0.28 }, { x: 152, y: 172, a: 0.5 },
  { x: 222, y: 196, a: -0.36 }, { x: 300, y: 132, a: 0.3 }, { x: 256, y: 80, a: -0.22 },
];
/** 세포질 알갱이(고정 배치 — 매 프레임 흔들리면 지저분하다). */
const GRAINS: { x: number; y: number; r: number; big: boolean }[] = [
  { x: 60, y: 148, r: 3.4, big: true }, { x: 104, y: 92, r: 2.2, big: false },
  { x: 96, y: 214, r: 2.6, big: false }, { x: 140, y: 108, r: 3.2, big: true },
  { x: 170, y: 208, r: 2.4, big: false }, { x: 186, y: 74, r: 2.6, big: false },
  { x: 244, y: 142, r: 3.4, big: true }, { x: 268, y: 118, r: 2.2, big: false },
  { x: 288, y: 178, r: 2.8, big: false }, { x: 312, y: 100, r: 2.4, big: false },
  { x: 208, y: 168, r: 2.2, big: false }, { x: 128, y: 214, r: 2.2, big: false },
];
const TRAY_Y = 276;
const CARD_W = 100;
const CARD_H = 68;

interface Token {
  id: TokenId;
  goal: Goal;
  label: string;
  home: { x: number; y: number };
  x: number;
  y: number;
  placed: boolean;
}

/** 틀린 짝마다 "왜 그 일이 아닌지"를 짚어 준다. */
const WRONG: Record<TokenId, Record<Goal, string>> = {
  gate: {
    wall: "",
    nucleus: "핵은 드나드는 문이 아니라 세포 전체를 조절하는 곳이에요",
    mito: "마이토콘드리아는 에너지를 만드는 곳이라 출입문과 하는 일이 달라요",
  },
  control: {
    wall: "세포막과 세포벽은 드나듦을 조절하고 세포를 보호해요. 공장 전체를 지휘하는 곳은 따로 있어요",
    nucleus: "",
    mito: "마이토콘드리아는 지휘하는 곳이 아니라 에너지를 만드는 곳이에요",
  },
  power: {
    wall: "벽과 문은 에너지를 만들지 않아요. 세포에서 에너지를 만드는 곳을 찾아보세요",
    nucleus: "핵은 조절하는 곳이에요. 에너지를 만드는 구조는 따로 있어요",
    mito: "",
  },
};

/** 긴 설명은 줄바꿈이 되는 helper가 맡는다(캔버스 위 토스트는 한 줄이라 잘린다). */
const DONE_MSG: Record<Goal, string> = {
  wall: "<b>세포막</b>은 필요한 물질만 드나들게 조절하고, <b>세포벽</b>은 두껍고 단단해서 식물 세포를 보호하고 모양을 잡아 줘요.",
  nucleus: "<b>핵</b> 속에는 유전물질이 들어 있어서 세포의 생명활동을 조절해요.",
  mito: "<b>마이토콘드리아</b>는 양분을 써서 세포가 쓸 에너지를 만들어요.",
};
/** 짝을 맞춘 뒤 트레이 빈자리에 남는 요약 카드(소품 → 구조). */
const PAIR_NAME: Record<TokenId, string> = {
  gate: "세포막·세포벽",
  control: "핵",
  power: "마이토콘드리아",
};

// ── 도형 헬퍼 ──────────────────────────────────────────────────────────
/** 근-동조 3스톱 그라데이션(파운드리 재질 문법 ①) — 좌상단이 밝고 우하단이 잠긴다. */
function tone3(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, a: string, b: string, c: string): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, a);
  g.addColorStop(0.52, b);
  g.addColorStop(1, c);
  return g;
}

/** 각진 세포벽의 바깥 윤곽 — 발주본과 같은 가로로 긴 육각형. */
function hexPts(): Pt[] {
  const { x0, x1, y0, y1, cut } = CELL;
  return [
    { x: x0, y: CELL_CY }, { x: x0 + cut, y: y0 }, { x: x1 - cut, y: y0 },
    { x: x1, y: CELL_CY }, { x: x1 - cut, y: y1 }, { x: x0 + cut, y: y1 },
  ];
}

/** 볼록 다각형을 안쪽으로 d만큼 민 다각형(각 변을 평행이동해 교점을 다시 구한다). */
function insetPoly(pts: Pt[], d: number): Pt[] {
  const n = pts.length;
  const lines: { p: Pt; dx: number; dy: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const dx = (b.x - a.x) / len;
    const dy = (b.y - a.y) / len;
    // 시계 방향(화면 좌표) 다각형의 안쪽 법선 = (-dy, dx)
    lines.push({ p: { x: a.x - dy * d, y: a.y + dx * d }, dx, dy });
  }
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const l1 = lines[(i - 1 + n) % n];
    const l2 = lines[i];
    const den = l1.dx * l2.dy - l1.dy * l2.dx;
    if (Math.abs(den) < 1e-6) { out.push(l2.p); continue; }
    const t = ((l2.p.x - l1.p.x) * l2.dy - (l2.p.y - l1.p.y) * l2.dx) / den;
    out.push({ x: l1.p.x + l1.dx * t, y: l1.p.y + l1.dy * t });
  }
  return out;
}

function polyPath(ctx: Ctx, pts: Pt[]): void {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
}

/** 다각형 변 위의 점과 바깥 방향 단위 법선. */
function edgePoint(pts: Pt[], i: number, t: number): { x: number; y: number; nx: number; ny: number } {
  const a = pts[i];
  const b = pts[(i + 1) % pts.length];
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    nx: (b.y - a.y) / len,
    ny: -(b.x - a.x) / len,
  };
}

function segDist(px: number, py: number, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / l2));
  return Math.hypot(px - (a.x + dx * t), py - (a.y + dy * t));
}

function roundRectPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export const cellFactoryLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CellFactoryStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "wall" } }, el("b", { text: "출입문과 벽" }), el("span", { text: "짝 찾기" })),
    el("div", { class: "pn-badge bio", dataset: { g: "nucleus" } }, el("b", { text: "중앙 통제실" }), el("span", { text: "짝 찾기" })),
    el("div", { class: "pn-badge bio", dataset: { g: "mito" } }, el("b", { text: "발전기" }), el("span", { text: "짝 찾기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "세포는 빵공장을 닮았어요. 아래 <b>공장 소품을 끌어</b> 같은 일을 하는 세포 구조 위에 놓아 보세요.",
  });
  const canvas = el("canvas", {
    class: "b3-canvas cfl-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0", role: "img",
      "aria-label": "육각 세포벽 안에 핵·마이토콘드리아·엽록체가 있는 식물 세포 그림과 공장 소품 세 개를 끌어다 놓는 무대",
    },
  });
  const readPill = el("span", { text: "소품 0 / 3 짝지음" });
  const toast = el("div", { class: "toast low" });
  const stage = el(
    "div", { class: "stage b3-stage cfl-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${MEM}` }), readPill)),
    toast,
  );
  host.append(goalsEl, helper, stage);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 상태 ────────────────────────────────────────────────────────────
  let W = BASE_W;
  let k = 1;
  let ox = 0;
  let toastTimer = 0;
  let finished = false;
  let drag: Token | null = null;
  let grabDX = 0;
  let grabDY = 0;
  const goals = new Set<Goal>();

  const OUTER = hexPts();
  const MEMBRANE = insetPoly(OUTER, WALL_T);
  const CYTO = insetPoly(OUTER, WALL_T + 3.5);

  const tokens: Token[] = [
    { id: "gate", goal: "wall", label: "출입문과 벽", home: { x: 62, y: TRAY_Y }, x: 62, y: TRAY_Y, placed: false },
    { id: "control", goal: "nucleus", label: "중앙 통제실", home: { x: 180, y: TRAY_Y }, x: 180, y: TRAY_Y, placed: false },
    { id: "power", goal: "mito", label: "발전기", home: { x: 298, y: TRAY_Y }, x: 298, y: TRAY_Y, placed: false },
  ];

  const fpx = (v: number): number => Math.max(v, 12 / k);

  const toastMsg = (msg: string, ms = 2800): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), ms);
  };

  const collect = (id: Goal): void => {
    if (goals.has(id)) return;
    goals.add(id);
    (goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement).classList.add("on");
    (goalsEl.querySelector(`[data-g="${id}"] span`) as HTMLElement).textContent = "맞았어요";
    haptic(HAPTIC.correct);
    toastMsg("짝을 찾았어요");
    readPill.textContent = `소품 ${goals.size} / 3 짝지음`;
    helper.innerHTML = DONE_MSG[id] + (goals.size === 3
      ? " 세포는 이렇게 여러 구조가 함께 일하는 작은 공장이에요. 초록 알갱이는 식물 세포에만 있는 <b>엽록체</b>랍니다."
      : ` 남은 소품 ${3 - goals.size}개도 놓아 볼까요?`);
    if (goals.size === 3 && !finished) {
      finished = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "세포의 구조 정리하기");
    }
  };

  // ── 판정 좌표 ────────────────────────────────────────────────────────
  /** 세포벽(육각 테두리)까지의 거리 — 안쪽이든 바깥쪽이든 가장 가까운 변까지. */
  function distToWall(px: number, py: number): number {
    let m = Infinity;
    for (let i = 0; i < OUTER.length; i++) {
      m = Math.min(m, segDist(px, py, OUTER[i], OUTER[(i + 1) % OUTER.length]));
    }
    return m;
  }
  function targetAt(px: number, py: number): Goal | null {
    if (Math.hypot((px - NUC.x) / 1.1, py - NUC.y) < 52) return "nucleus";
    for (const m of MITOS) if (Math.hypot(px - m.x, py - m.y) < 42) return "mito";
    if (distToWall(px, py) < 30) return "wall";
    return null;
  }

  // ── 세포 그리기 ──────────────────────────────────────────────────────
  function drawCell(ctx: Ctx, tMs: number): void {
    const wallOn = goals.has("wall");

    // 바닥에 놓인 느낌 — 세포 아래 접촉 그림자
    contactShadow(ctx, 180, CELL.y1 + 6, 150, 0.34);

    // ① 두껍고 단단한 세포벽(각진 육각) — 좌상단이 밝은 3스톱 면
    ctx.save();
    polyPath(ctx, OUTER);
    ctx.fillStyle = tone3(ctx, CELL.x0, CELL.y0, CELL.x1, CELL.y1, "#9ACB5D", "#71A43D", "#55802C");
    ctx.fill();
    ctx.strokeStyle = "#3B6A1E";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // 벽 안쪽 베벨(빛을 받은 안쪽 모서리)
    polyPath(ctx, insetPoly(OUTER, WALL_T * 0.42));
    ctx.strokeStyle = "rgba(226,244,196,.34)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // ② 세포질 — 연둣빛 3스톱 + 알갱이
    ctx.save();
    polyPath(ctx, CYTO);
    ctx.fillStyle = tone3(ctx, CELL.x0, CELL.y0, CELL.x1, CELL.y1, "#D9EBAB", "#C4DD8D", "#ABCB72");
    ctx.fill();
    ctx.clip();
    // 좌상단 키라이트
    const key = ctx.createRadialGradient(CELL.x0 + 70, CELL.y0 + 24, 6, CELL.x0 + 70, CELL.y0 + 24, 190);
    key.addColorStop(0, "rgba(255,255,255,.32)");
    key.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = key;
    ctx.fillRect(CELL.x0, CELL.y0, CELL.x1 - CELL.x0, CELL.y1 - CELL.y0);
    for (const g of GRAINS) {
      ctx.fillStyle = g.big ? "rgba(150,192,96,.65)" : "rgba(246,252,224,.75)";
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // ③ 세포막 — 벽 안쪽에 붙은 얇은 한 겹(발주본의 크림빛 선)
    ctx.save();
    polyPath(ctx, MEMBRANE);
    ctx.strokeStyle = "#F1E5B0";
    ctx.lineWidth = 4;
    ctx.stroke();
    if (wallOn) {
      ctx.shadowColor = "rgba(18,184,134,.75)";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = MEM;
      ctx.lineWidth = 2.6;
      ctx.stroke();
    }
    ctx.restore();
    if (wallOn) drawMembraneFlow(ctx, tMs);

    // ④ 엽록체(짝 대상 아님 — 마지막에 이름을 밝힌다)
    for (const c of CHLOROS) drawChloroplast(ctx, c.x, c.y, c.a, goals.size === 3 ? 1 : 0.62);

    // ⑤ 마이토콘드리아 — 콩 모양 + 안쪽 주름
    const mitoOn = goals.has("mito");
    for (const m of MITOS) {
      if (mitoOn) {
        const pulse = 0.5 + 0.5 * Math.sin(tMs / 380);
        softGlow(ctx, m.x, m.y, 46, "255,170,60", 0.16 + pulse * 0.2);
      }
      drawMito(ctx, m.x, m.y, m.a, mitoOn);
    }
    if (mitoOn) {
      ctx.save();
      polyPath(ctx, CYTO);
      ctx.clip();
      for (const m of MITOS) drawSparks(ctx, m.x, m.y, tMs);
      ctx.restore();
    }

    // ⑥ 핵 — 또렷한 보라 구 + 핵막 + 유전물질
    const nucOn = goals.has("nucleus");
    if (nucOn) drawSignalRings(ctx, tMs);
    drawNucleus(ctx, nucOn);

    // 이름표(맞춘 구조부터) — HUD 필(무대 위 14~52)과 겹치지 않는 자리에만 둔다.
    if (wallOn) tag(ctx, "세포막 · 세포벽", 100, 70, "#EAF7CF", "#4B7A24");
    if (nucOn) tag(ctx, "핵", NUC.x, NUC.y + NUC.ry + 20, "#EFE2FF", NUC_C);
    if (mitoOn) tag(ctx, "마이토콘드리아", 116, 214, "#FFE3CB", MITO_C);
    if (goals.size === 3) tag(ctx, "엽록체", 210, 218, "#DCF2C4", CHLORO_C);
  }

  /** 핵 — 핵막(테두리 한 겹) · 유전물질 알갱이와 실 · 인. */
  function drawNucleus(ctx: Ctx, on: boolean): void {
    ctx.save();
    // 핵막
    ctx.beginPath();
    ctx.ellipse(NUC.x, NUC.y, NUC.rx + 4.5, NUC.ry + 4.5, 0, 0, TAU);
    ctx.strokeStyle = on ? "rgba(206,170,242,.95)" : "rgba(190,160,220,.6)";
    ctx.lineWidth = 3.4;
    ctx.stroke();
    // 몸체
    const g = ctx.createRadialGradient(NUC.x - NUC.rx * 0.4, NUC.y - NUC.ry * 0.45, 4, NUC.x, NUC.y, NUC.rx * 1.15);
    g.addColorStop(0, on ? "#CFA3EE" : "#BE95DC");
    g.addColorStop(0.55, on ? "#9C5FD2" : "#8E5BC0");
    g.addColorStop(1, on ? "#7A3AB2" : "#6F3AA2");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(NUC.x, NUC.y, NUC.rx, NUC.ry, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#53207F";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 유전물질 — 알갱이 결
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(NUC.x, NUC.y, NUC.rx, NUC.ry, 0, 0, TAU);
    ctx.clip();
    for (let i = 0; i < 16; i++) {
      const a = i * 2.399;
      const rr = Math.sqrt((i + 0.5) / 16) * NUC.rx * 0.92;
      ctx.fillStyle = i % 3 === 0 ? "rgba(238,220,255,.5)" : "rgba(74,26,116,.34)";
      ctx.beginPath();
      ctx.arc(NUC.x + Math.cos(a) * rr, NUC.y + Math.sin(a) * rr * 0.9, 1.5 + (i % 3) * 0.5, 0, TAU);
      ctx.fill();
    }
    // 유전물질 실타래
    ctx.strokeStyle = "rgba(242,228,255,.8)";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(NUC.x - 24 + i * 6, NUC.y + 14);
      ctx.bezierCurveTo(NUC.x - 8 + i * 10, NUC.y - 4, NUC.x + 4 + i * 4, NUC.y + 8, NUC.x + 20, NUC.y - 12 + i * 8);
      ctx.stroke();
    }
    // 인
    const ng = ctx.createRadialGradient(NUC.x + 8, NUC.y + 2, 1, NUC.x + 11, NUC.y + 5, 13);
    ng.addColorStop(0, "#8E4CC6");
    ng.addColorStop(1, "#4B1B7A");
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(NUC.x + 11, NUC.y + 5, 11, 0, TAU);
    ctx.fill();
    ctx.restore();
    // 좌상단 키라이트
    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(NUC.x, NUC.y, NUC.rx - 5, NUC.ry - 5, 0, Math.PI * 1.08, Math.PI * 1.52);
    ctx.stroke();
    ctx.restore();
  }

  /** 마이토콘드리아 — 콩(캡슐) 껍질 + 안쪽 밝은 방 + 굽이치는 주름. */
  function drawMito(ctx: Ctx, cx: number, cy: number, a: number, on: boolean): void {
    const L = 29;
    const H = 13;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(a);
    // 껍질
    roundRectPath(ctx, -L, -H, L * 2, H * 2, H);
    ctx.fillStyle = tone3(ctx, -L, -H, L, H, on ? "#F6AE64" : "#E9A063", on ? "#DE6B31" : "#CE6837", on ? "#B94619" : "#A9491F");
    ctx.fill();
    ctx.strokeStyle = "#8A3211";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 안쪽 방
    roundRectPath(ctx, -L + 3.6, -H + 3.6, (L - 3.6) * 2, (H - 3.6) * 2, H - 3.6);
    ctx.fillStyle = on ? "rgba(252,213,166,.95)" : "rgba(243,205,163,.8)";
    ctx.fill();
    // 주름(크리스타) — 굽이치는 한 줄
    ctx.strokeStyle = on ? "#D2552A" : "#C25B2E";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const x0 = -L + 8;
    const x1 = L - 8;
    const steps = 5;
    ctx.moveTo(x0, 0);
    for (let i = 0; i < steps; i++) {
      const xa = x0 + ((x1 - x0) * i) / steps;
      const xb = x0 + ((x1 - x0) * (i + 1)) / steps;
      const dir = i % 2 === 0 ? -1 : 1;
      ctx.quadraticCurveTo((xa + xb) / 2, dir * (H - 4.4), xb, 0);
    }
    ctx.stroke();
    // 좌상단 스펙큘러
    ctx.strokeStyle = "rgba(255,244,226,.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-L + H, 0, H - 2.6, Math.PI * 1.12, Math.PI * 1.62);
    ctx.stroke();
    ctx.restore();
  }

  /** 엽록체 — 초록 렌즈 알갱이 + 결(그라나) 무늬. */
  function drawChloroplast(ctx: Ctx, cx: number, cy: number, a: number, alpha: number): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 9, 0, 0, TAU);
    ctx.fillStyle = tone3(ctx, -17, -9, 17, 9, "#8CCB52", "#54A336", CHLORO_C);
    ctx.fill();
    ctx.strokeStyle = "#2B5A1B";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 결 무늬
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 9, 0, 0, TAU);
    ctx.clip();
    ctx.strokeStyle = "rgba(31,84,24,.55)";
    ctx.lineWidth = 1.8;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 7 - 2.5, -8);
      ctx.lineTo(i * 7 + 2.5, 8);
      ctx.stroke();
    }
    ctx.restore();
    // 좌상단 하이라이트
    ctx.strokeStyle = "rgba(240,255,214,.6)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 5.6, 0, Math.PI * 1.06, Math.PI * 1.6);
    ctx.stroke();
    ctx.restore();
  }

  function tag(ctx: Ctx, text: string, cx: number, cy: number, ink: string, edge: string): void {
    const fs = fpx(12);
    ctx.save();
    ctx.font = `800 ${fs}px Pretendard, sans-serif`;
    const w = ctx.measureText(text).width + 16;
    const h = fs + 10;
    roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 9);
    ctx.fillStyle = "rgba(9,17,30,.9)";
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cx, cy);
    ctx.restore();
  }

  /** 세포막의 일: 필요한 물질만 들여보내고 어떤 것은 되돌려 보낸다. */
  const FLOW: { e: number; t: number; inbound: boolean; blocked: boolean }[] = [
    { e: 0, t: 0.5, inbound: true, blocked: false },
    { e: 5, t: 0.45, inbound: true, blocked: true },
    { e: 1, t: 0.3, inbound: true, blocked: false },
    { e: 1, t: 0.72, inbound: false, blocked: false },
    { e: 2, t: 0.5, inbound: true, blocked: true },
    { e: 3, t: 0.5, inbound: false, blocked: false },
    { e: 4, t: 0.35, inbound: false, blocked: false },
    { e: 4, t: 0.7, inbound: true, blocked: false },
  ];
  function drawMembraneFlow(ctx: Ctx, tMs: number): void {
    ctx.save();
    FLOW.forEach((f, i) => {
      const ph = ((tMs / 2200) + i / FLOW.length) % 1;
      const p = edgePoint(MEMBRANE, f.e, f.t);
      let off: number;
      if (f.blocked) off = 26 - Math.sin(ph * Math.PI) * 24; // 막까지 왔다가 되돌아간다
      else if (f.inbound) off = 26 - ph * 50;
      else off = -24 + ph * 50;
      const x = p.x + p.nx * off;
      const y = p.y + p.ny * off;
      ctx.fillStyle = f.blocked ? "rgba(214,226,240,.9)" : MEM;
      if (!f.blocked) {
        ctx.shadowColor = "rgba(18,184,134,.7)";
        ctx.shadowBlur = 6;
      }
      ctx.beginPath();
      ctx.arc(x, y, 3.6, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (f.blocked) {
        ctx.strokeStyle = "rgba(150,170,196,.9)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  /** 핵의 일: 세포 전체로 퍼지는 조절 신호. */
  function drawSignalRings(ctx: Ctx, tMs: number): void {
    ctx.save();
    polyPath(ctx, CYTO);
    ctx.clip();
    for (let i = 0; i < 3; i++) {
      const ph = ((tMs / 1600) + i / 3) % 1;
      const r = NUC.rx + ph * 108;
      ctx.strokeStyle = `rgba(150,92,222,${(1 - ph) * 0.55})`;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(NUC.x, NUC.y, r, r * 0.86, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** 마이토콘드리아의 일: 양분으로 만든 에너지의 반짝임. */
  function drawSparks(ctx: Ctx, cx: number, cy: number, tMs: number): void {
    ctx.save();
    for (let j = 0; j < 6; j++) {
      const ph = ((tMs / 900) + j / 6) % 1;
      const a = (j / 6) * TAU + tMs / 1400;
      const rr = 22 + ph * 20;
      const alpha = Math.sin(ph * Math.PI);
      ctx.fillStyle = `rgba(255,186,60,${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7, 2.6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── 소품 토큰 ────────────────────────────────────────────────────────
  function drawToken(ctx: Ctx, t: Token, active: boolean): void {
    const w = CARD_W;
    const h = CARD_H;
    ctx.save();
    ctx.translate(t.x, t.y);
    if (active) {
      ctx.shadowColor = "rgba(0,0,0,.5)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 7;
    }
    roundRectPath(ctx, -w / 2, -h / 2, w, h, 15);
    ctx.fillStyle = tone3(ctx, -w / 2, -h / 2, w / 2, h / 2,
      active ? "#2A4568" : "#22395A", active ? "#1B2F4C" : "#182A45", "#12203A");
    ctx.fill();
    ctx.strokeStyle = active ? MEM : "rgba(150,180,220,.42)";
    ctx.lineWidth = active ? 2.4 : 1.4;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // 카드 윗면 하이라이트(좌상단 키라이트)
    ctx.strokeStyle = "rgba(255,255,255,.16)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 14, -h / 2 + 1.6);
    ctx.lineTo(w / 2 - 14, -h / 2 + 1.6);
    ctx.stroke();
    ctx.save();
    roundRectPath(ctx, -w / 2, -h / 2, w, h, 15);
    ctx.clip();
    if (t.id === "gate") drawGateGlyph(ctx);
    else if (t.id === "control") drawControlGlyph(ctx);
    else drawPowerGlyph(ctx);
    ctx.restore();
    ctx.restore();
    // 이름 — 끌고 다니는 동안 밝은 세포질 위에 놓여도 읽히도록 어두운 할로를 두른다
    ctx.save();
    ctx.font = `800 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = 3.6;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(9,17,30,.8)";
    ctx.strokeText(t.label, t.x, t.y + h / 2 + 7);
    ctx.fillStyle = "#C8D8EE";
    ctx.fillText(t.label, t.x, t.y + h / 2 + 7);
    ctx.restore();
  }

  /** 출입문과 벽 — 벽돌 벽에 난 문으로 상자가 드나든다(양방향 화살표는 문 안에). */
  function drawGateGlyph(ctx: Ctx): void {
    const WY0 = -22;
    const WY1 = 22;
    const doorX0 = 7;
    const doorX1 = 35;
    const doorTop = -12; // 위 한 줄은 상인방으로 남겨 "벽에 난 문"으로 읽히게
    contactShadow(ctx, 0, WY1 + 3, 40, 0.42);
    // 벽돌 — 벽 덩어리로 잘라 내 가장자리를 가지런히
    ctx.save();
    roundRectPath(ctx, -44, WY0, 88, WY1 - WY0, 3);
    ctx.clip();
    const bh = 9.5;
    for (let r = 0; r < 4; r++) {
      const y = WY0 + r * (bh + 2);
      const shift = r % 2 ? 8.5 : 0;
      for (let x = -51 + shift; x < 46; x += 17) {
        roundRectPath(ctx, x, y, 15, bh, 2);
        ctx.fillStyle = tone3(ctx, x, y, x + 15, y + bh, "#AFC58C", "#8AA365", "#6B8550");
        ctx.fill();
        ctx.strokeStyle = "#4C6237";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }
    // 문 — 벽에 뚫린 구멍(안쪽은 어둡고 위쪽에 공장 불빛)
    roundRectPath(ctx, doorX0, doorTop, doorX1 - doorX0, WY1 - doorTop + 2, 3);
    ctx.fillStyle = tone3(ctx, doorX0, doorTop, doorX1, WY1, "#2A3A33", "#16211D", "#0C1310");
    ctx.fill();
    softGlow(ctx, (doorX0 + doorX1) / 2, doorTop + 5, 20, "255,206,124", 0.55);
    ctx.strokeStyle = "#4C6237";
    ctx.lineWidth = 1.8;
    roundRectPath(ctx, doorX0, doorTop, doorX1 - doorX0, WY1 - doorTop + 2, 3);
    ctx.stroke();
    // 상인방 밝은 면(빛을 받는 위쪽 모서리)
    ctx.strokeStyle = "rgba(232,244,206,.5)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(doorX0 + 2, doorTop - 1.4);
    ctx.lineTo(doorX1 - 2, doorTop - 1.4);
    ctx.stroke();
    ctx.restore();
    // 드나듦 — 문 안의 양방향 화살표
    ctx.strokeStyle = MEM;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(11, -4);
    ctx.lineTo(31, -4);
    ctx.moveTo(15, -8);
    ctx.lineTo(11, -4);
    ctx.lineTo(15, 0);
    ctx.moveTo(27, -8);
    ctx.lineTo(31, -4);
    ctx.lineTo(27, 0);
    ctx.stroke();
    // 상자 하나가 문을 지나 나오는 중 — 문턱을 넘어 걸치게 둔다
    const bx = 12;
    const by = 7;
    roundRectPath(ctx, bx, by, 19, 16, 2.5);
    ctx.fillStyle = tone3(ctx, bx, by, bx + 19, by + 16, "#EAC48C", "#C08B4A", "#8F5E2A");
    ctx.fill();
    ctx.strokeStyle = "#6F4A20";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx, by + 6);
    ctx.lineTo(bx + 19, by + 6);
    ctx.moveTo(bx + 9.5, by);
    ctx.lineTo(bx + 9.5, by + 6);
    ctx.stroke();
  }

  /** 중앙 통제실 — 화면과 레버가 있는 조종대. */
  function drawControlGlyph(ctx: Ctx): void {
    contactShadow(ctx, 0, 25, 38, 0.42);
    // 화면
    roundRectPath(ctx, -36, -27, 50, 24, 4);
    ctx.fillStyle = tone3(ctx, -36, -27, 14, -3, "#7E6BC6", "#5A47A0", "#3E2E78");
    ctx.fill();
    ctx.strokeStyle = "#2C1F5C";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    roundRectPath(ctx, -32.5, -23.5, 43, 17, 2.5);
    ctx.fillStyle = "#161235";
    ctx.fill();
    // 화면 속 신호 파형
    ctx.strokeStyle = "#C9B5FF";
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-29, -13);
    ctx.lineTo(-23, -13);
    ctx.lineTo(-19, -20);
    ctx.lineTo(-14, -9);
    ctx.lineTo(-9, -16);
    ctx.lineTo(-4, -13);
    ctx.lineTo(6, -13);
    ctx.stroke();
    // 화면 유리 스펙큘러
    ctx.fillStyle = "rgba(255,255,255,.14)";
    ctx.beginPath();
    ctx.moveTo(-32, -23);
    ctx.lineTo(-16, -23);
    ctx.lineTo(-28, -7);
    ctx.lineTo(-32, -7);
    ctx.closePath();
    ctx.fill();
    // 조종대 상판(원근 사다리꼴)
    ctx.beginPath();
    ctx.moveTo(-30, 2);
    ctx.lineTo(30, 2);
    ctx.lineTo(38, 15);
    ctx.lineTo(-38, 15);
    ctx.closePath();
    ctx.fillStyle = tone3(ctx, -38, 2, 38, 15, "#B9C6E4", "#8C9BC0", "#6B799C");
    ctx.fill();
    ctx.strokeStyle = "#454F6E";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 앞면
    roundRectPath(ctx, -38, 15, 76, 9, 2);
    ctx.fillStyle = tone3(ctx, -38, 15, 38, 24, "#6C7A9E", "#525F80", "#3C4762");
    ctx.fill();
    ctx.strokeStyle = "#333C55";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 레버 두 개 — 화면 오른쪽 빈 상판에 세워 파형을 가리지 않게 한다
    const lever = (x: number, tilt: number, knob: string, deep: string): void => {
      ctx.save();
      ctx.translate(x, 5);
      ctx.rotate(tilt);
      ctx.strokeStyle = "#4A5473";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -13);
      ctx.stroke();
      const g = ctx.createRadialGradient(-1.6, -15.6, 0.6, 0, -14, 5.4);
      g.addColorStop(0, knob);
      g.addColorStop(1, deep);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, -14, 4.6, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = deep;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    };
    lever(21, -0.32, "#C6A6F2", "#6A3AA8");
    lever(33, 0.26, "#FFD08A", "#A96A18");
    // 조작 슬라이더 — 상판 왼쪽
    ctx.strokeStyle = "rgba(48,58,84,.7)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const y = 5.5 + i * 3.6;
      ctx.beginPath();
      ctx.moveTo(-28 + i * 1.6, y);
      ctx.lineTo(-4 + i * 1.6, y);
      ctx.stroke();
      ctx.fillStyle = "#DDE6FA";
      ctx.beginPath();
      ctx.arc(-22 + i * 6, y, 1.9, 0, TAU);
      ctx.fill();
    }
  }

  /** 발전기 — 회전자가 돌고 전기 불꽃이 튄다. */
  function drawPowerGlyph(ctx: Ctx): void {
    contactShadow(ctx, 0, 24, 38, 0.42);
    // 몸체
    roundRectPath(ctx, -36, -6, 70, 27, 6);
    ctx.fillStyle = tone3(ctx, -36, -6, 34, 21, "#F2AE6A", "#D9773A", "#A94D1E");
    ctx.fill();
    ctx.strokeStyle = "#7E3610";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 받침
    roundRectPath(ctx, -30, 20, 58, 5, 2);
    ctx.fillStyle = "#5B4634";
    ctx.fill();
    // 회전자
    const rx = -17;
    const ry = 8;
    ctx.beginPath();
    ctx.arc(rx, ry, 12.5, 0, TAU);
    ctx.fillStyle = tone3(ctx, rx - 12, ry - 12, rx + 12, ry + 12, "#5D6A80", "#414C61", "#2C3546");
    ctx.fill();
    ctx.strokeStyle = "#232B3A";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(226,238,255,.7)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + 0.3;
      ctx.beginPath();
      ctx.moveTo(rx + Math.cos(a) * 3.4, ry + Math.sin(a) * 3.4);
      ctx.lineTo(rx + Math.cos(a) * 9.6, ry + Math.sin(a) * 9.6);
      ctx.stroke();
    }
    ctx.fillStyle = "#D7E2F2";
    ctx.beginPath();
    ctx.arc(rx, ry, 3, 0, TAU);
    ctx.fill();
    // 오른쪽 방열구
    ctx.strokeStyle = "rgba(120,50,16,.7)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(24 + i * 4, 1);
      ctx.lineTo(24 + i * 4, 16);
      ctx.stroke();
    }
    // 전기 불꽃 — 몸체 위로 튀어 오른다
    softGlow(ctx, 9, -17, 19, "255,205,90", 0.5);
    ctx.fillStyle = "#FFD24D";
    ctx.strokeStyle = "#B87708";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(9, -29);
    ctx.lineTo(2.5, -17);
    ctx.lineTo(7.5, -17);
    ctx.lineTo(3.5, -7);
    ctx.lineTo(14.5, -19);
    ctx.lineTo(9.5, -19);
    ctx.lineTo(15, -29);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,224,150,.9)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-2, -21);
    ctx.lineTo(-6, -26);
    ctx.moveTo(20, -21);
    ctx.lineTo(24, -26);
    ctx.stroke();
  }

  /** 짝을 맞춘 소품 자리에 남기는 요약 카드 — 트레이가 빈 공백으로 남지 않게. */
  function drawPairCard(ctx: Ctx, t: Token): void {
    const w = CARD_W + 4;
    const h = 58;
    const color = t.goal === "wall" ? WALL_C : t.goal === "nucleus" ? NUC_C : MITO_C;
    ctx.save();
    ctx.translate(t.home.x, t.home.y);
    roundRectPath(ctx, -w / 2, -h / 2, w, h, 13);
    ctx.fillStyle = tone3(ctx, -w / 2, -h / 2, w / 2, h / 2, "#1D3252", "#182A45", "#12203A");
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#9FB3D4";
    ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.fillText(t.label, 0, -15);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 3);
    ctx.moveTo(-3.5, -0.5);
    ctx.lineTo(0, 3);
    ctx.lineTo(3.5, -0.5);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = `800 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.fillText(PAIR_NAME[t.id], 0, 15);
    ctx.restore();
  }

  // ── 포인터 ───────────────────────────────────────────────────────────
  const ptOf = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left - ox) / k, y: (e.clientY - r.top) / k };
  };

  const onDown = (e: PointerEvent): void => {
    const p = ptOf(e);
    for (const t of tokens) {
      if (t.placed) continue;
      if (Math.abs(p.x - t.x) <= CARD_W / 2 + 6 && Math.abs(p.y - t.y) <= CARD_H / 2 + 8) {
        drag = t;
        grabDX = t.x - p.x;
        grabDY = t.y - p.y;
        safePointerCapture(canvas, e.pointerId);
        haptic(HAPTIC.tap);
        return;
      }
    }
  };

  const onMove = (e: PointerEvent): void => {
    if (!drag) return;
    const p = ptOf(e);
    drag.x = p.x + grabDX;
    drag.y = p.y + grabDY;
  };

  const onUp = (): void => {
    const t = drag;
    drag = null;
    if (!t) return;
    const hit = targetAt(t.x, t.y);
    if (hit === t.goal) {
      t.placed = true;
      collect(t.goal);
      return;
    }
    t.x = t.home.x;
    t.y = t.home.y;
    haptic(HAPTIC.wrong);
    toastMsg("그 짝이 아니에요");
    helper.innerHTML = hit
      ? `${WRONG[t.id][hit]}. 다시 놓아 볼까요?`
      : "세포 그림 위의 알맞은 <b>구조</b>에 정확히 놓아 보세요.";
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ── 프레임 ───────────────────────────────────────────────────────────
  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    // 넓은 화면에서도 트레이가 잘리지 않게 가로·세로 중 작은 배율을 쓰고 가운데 정렬한다.
    k = Math.min(W / BASE_W, CVH / BASE_H);
    ox = (W - BASE_W * k) / 2;
    ctx.clearRect(0, 0, W, fit.h);
    ctx.save();
    ctx.translate(ox, 0);
    ctx.scale(k, k);

    drawCell(ctx, tMs);

    // 끌고 있는 동안 남은 자리(어디에 놓을 수 있는지)를 점선으로 알린다 — 정답을 알려 주진 않는다.
    if (drag) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 2;
      if (!goals.has("wall")) {
        ctx.strokeStyle = "rgba(255,255,255,.6)";
        polyPath(ctx, insetPoly(OUTER, -6));
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(20,38,26,.55)";
      if (!goals.has("nucleus")) {
        ctx.beginPath();
        ctx.ellipse(NUC.x, NUC.y, NUC.rx + 11, NUC.ry + 11, 0, 0, TAU);
        ctx.stroke();
      }
      if (!goals.has("mito")) {
        for (const m of MITOS) {
          ctx.beginPath();
          ctx.ellipse(m.x, m.y, 38, 23, m.a, 0, TAU);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    for (const t of tokens) {
      if (t.placed) drawPairCard(ctx, t);
      else if (t !== drag) drawToken(ctx, t, false);
    }
    if (drag) drawToken(ctx, drag, true);

    ctx.restore();
  });

  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("공장 소품 3개를 세포 구조에 짝지어 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
  };
};
