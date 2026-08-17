// diversityLab — 생물다양성을 이루는 "세 가지 다양함"을 각각 떼어 내 손으로 만져 보는 랩.
//  ① 생태계의 다양함 : 서로 다른 생태계가 몇 곳인가(숲·습지·갯벌·바다·사막)
//  ② 생물 종류의 다양함 : 한 생태계에 사는 생물의 종류가 몇 가지인가
//  ③ 변이의 다양함 : 같은 종류의 생물 사이에 특징이 얼마나 다른가
// 세 조작이 무대의 생물 구성을 실제로 바꾸고, 아래 생물다양성 게이지가 곧바로 반응한다.
//
// ── 과학 정확성 가드 ───────────────────────────────────────────────────────
// 생물다양성은 "어떤 지역에 살고 있는 생물의 다양한 정도"이며 위 세 가지를 **모두 포함**한다.
// 그래서 셋 중 하나라도 가장 낮은 단계면 게이지가 절반을 넘지 못하도록 막고(경고 문구 동반),
// 세 가지를 모두 올려야만 '매우 높음'에 닿는다 — "종류만 많으면 다양성이 높다"는 대표
// 오개념을 조작 자체가 반박하게 만든 설계다.
//
// 마지막 국면은 두 지역 비교 판정: (가) 한 가지 작물만 심은 논 vs (나) 호수가 있는 숲.
// 생물 그림은 전부 캔버스 손코딩 실루엣(발주 이미지 의존 없음).

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3-life.css";

interface DiversityStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "kinds" | "peak" | "verdict";
type Knob = "eco" | "species" | "vary";
type Shape = "tree" | "cactus" | "stalk" | "bird" | "bug" | "fish" | "crab" | "beast" | "blob" | "long";

// 무대 높이 — 게이지·조작부와 한 화면에 들어오도록 낮췄다(구 340). 캔버스는 k = min(W/BASE_W, CVH/BASE_H)로 스케일된다.
const CVH = 214;
const BASE_W = 360;
const BASE_H = 336;
/** 무대 위쪽 52px는 HUD 알약, 아래쪽(294~336)은 토스트 자리로 비워 둔다. */
const TOP_PAD = 52;
const AREA_BOTTOM = 294;
const PI2 = Math.PI * 2;

const ECO_MAX = 5;
const SPECIES_MAX = 5;
const VARY_MAX = 3;
/** 같은 종류 안에서 개체 크기가 벌어지는 폭 — 1단계는 완전히 같다(변이 없음). */
const VARY_SPREAD = [0, 0.17, 0.36];
const VARY_WORD = ["거의 같아요", "조금씩 달라요", "많이 달라요"];

interface Eco { name: string; color: string; species: { name: string; shape: Shape }[] }

const ECOS: Eco[] = [
  {
    name: "숲", color: "#51CF66", species: [
      { name: "참나무", shape: "tree" }, { name: "다람쥐", shape: "beast" },
      { name: "딱따구리", shape: "bird" }, { name: "사슴벌레", shape: "bug" },
      { name: "버섯", shape: "blob" },
    ],
  },
  {
    name: "습지", color: "#38D9A9", species: [
      { name: "갈대", shape: "stalk" }, { name: "개구리", shape: "blob" },
      { name: "잠자리", shape: "bug" }, { name: "왜가리", shape: "bird" },
      { name: "붕어", shape: "fish" },
    ],
  },
  {
    name: "갯벌", color: "#E8B27D", species: [
      { name: "칠면초", shape: "stalk" }, { name: "칠게", shape: "crab" },
      { name: "조개", shape: "blob" }, { name: "갯지렁이", shape: "long" },
      { name: "도요새", shape: "bird" },
    ],
  },
  {
    name: "바다", color: "#74C0FC", species: [
      { name: "미역", shape: "stalk" }, { name: "멸치", shape: "fish" },
      { name: "해파리", shape: "blob" }, { name: "새우", shape: "crab" },
      { name: "갈매기", shape: "bird" },
    ],
  },
  {
    name: "사막", color: "#FFD43B", species: [
      { name: "선인장", shape: "cactus" }, { name: "도마뱀", shape: "long" },
      { name: "전갈", shape: "crab" }, { name: "사막여우", shape: "beast" },
      { name: "매", shape: "bird" },
    ],
  },
];

/** 종류가 다르면 색도 다르게 — 생태계 정체성은 타일 테두리·이름이 맡는다. */
const SPECIES_TINT = ["#8CE0C4", "#FFD8A8", "#A5D8FF", "#FFC9C9", "#D8C7FF"];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexRgb(a);
  const [r2, g2, b2] = hexRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

function drawShape(
  ctx: CanvasRenderingContext2D, shape: Shape, x: number, y: number, r: number, color: string, rot: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (shape === "tree") {
    // 기둥 + 둥근 수관 — 작게 그려도 "나무"로 읽힌다(뾰족 삼각형은 화살표처럼 보였다).
    ctx.lineWidth = r * 0.3;
    ctx.beginPath(); ctx.moveTo(0, r); ctx.lineTo(0, r * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -r * 0.26, r * 0.74, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(-r * 0.52, r * 0.1, r * 0.42, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.52, r * 0.1, r * 0.42, 0, PI2); ctx.fill();
  } else if (shape === "cactus") {
    ctx.lineWidth = r * 0.42;
    ctx.beginPath(); ctx.moveTo(0, r); ctx.lineTo(0, -r * 0.72); ctx.stroke();
    ctx.lineWidth = r * 0.26;
    ctx.beginPath();
    ctx.moveTo(-r * 0.62, r * 0.16); ctx.lineTo(-r * 0.62, -r * 0.12); ctx.lineTo(-r * 0.18, -r * 0.12);
    ctx.moveTo(r * 0.62, r * 0.42); ctx.lineTo(r * 0.62, r * 0.14); ctx.lineTo(r * 0.18, r * 0.14);
    ctx.stroke();
  } else if (shape === "stalk") {
    ctx.lineWidth = r * 0.2;
    for (const dx of [-r * 0.42, 0, r * 0.42]) {
      ctx.beginPath();
      ctx.moveTo(dx, r);
      ctx.quadraticCurveTo(dx + r * 0.3, 0, dx + r * 0.1, -r);
      ctx.stroke();
    }
  } else if (shape === "bird") {
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.82, r * 0.54, -0.24, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.7, -r * 0.5, r * 0.33, 0, PI2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.96, -r * 0.6); ctx.lineTo(r * 1.42, -r * 0.44); ctx.lineTo(r * 0.96, -r * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.86, r * 0.2); ctx.lineTo(-r * 1.44, r * 0.56); ctx.lineTo(-r * 0.66, r * 0.52);
    ctx.closePath(); ctx.fill();
  } else if (shape === "bug") {
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.5, r * 0.78, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -r * 0.86, r * 0.31, 0, PI2); ctx.fill();
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const yy = -r * 0.34 + i * r * 0.42;
      ctx.moveTo(-r * 0.44, yy); ctx.lineTo(-r * 0.94, yy + r * 0.2);
      ctx.moveTo(r * 0.44, yy); ctx.lineTo(r * 0.94, yy + r * 0.2);
    }
    ctx.moveTo(-r * 0.16, -r * 1.06); ctx.lineTo(-r * 0.5, -r * 1.48);
    ctx.moveTo(r * 0.16, -r * 1.06); ctx.lineTo(r * 0.5, -r * 1.48);
    ctx.stroke();
  } else if (shape === "fish") {
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.86, r * 0.5, 0, 0, PI2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.72, 0); ctx.lineTo(-r * 1.38, -r * 0.5); ctx.lineTo(-r * 1.38, r * 0.5);
    ctx.closePath(); ctx.fill();
  } else if (shape === "crab") {
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.78, r * 0.54, 0, 0, PI2); ctx.fill();
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(-r * 0.58, r * 0.3); ctx.lineTo(-r * 1.06, r * 0.72);
    ctx.moveTo(r * 0.58, r * 0.3); ctx.lineTo(r * 1.06, r * 0.72);
    ctx.moveTo(-r * 0.68, -r * 0.3); ctx.lineTo(-r * 1.12, -r * 0.72);
    ctx.moveTo(r * 0.68, -r * 0.3); ctx.lineTo(r * 1.12, -r * 0.72);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(-r * 1.18, -r * 0.84, r * 0.25, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 1.18, -r * 0.84, r * 0.25, 0, PI2); ctx.fill();
  } else if (shape === "beast") {
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.82, r * 0.52, 0, 0, PI2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.82, -r * 0.4, r * 0.35, 0, PI2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.66, -r * 0.7); ctx.lineTo(r * 0.72, -r * 1.12); ctx.lineTo(r * 1.0, -r * 0.68);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = r * 0.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, r * 0.42); ctx.lineTo(-r * 0.4, r * 0.94);
    ctx.moveTo(r * 0.4, r * 0.42); ctx.lineTo(r * 0.4, r * 0.94);
    ctx.stroke();
    ctx.lineWidth = r * 0.18;
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.06);
    ctx.quadraticCurveTo(-r * 1.4, -r * 0.34, -r * 1.16, -r * 0.84);
    ctx.stroke();
  } else if (shape === "blob") {
    ctx.beginPath();
    ctx.moveTo(-r * 0.88, r * 0.5);
    ctx.quadraticCurveTo(-r * 0.88, -r * 0.92, 0, -r * 0.92);
    ctx.quadraticCurveTo(r * 0.88, -r * 0.92, r * 0.88, r * 0.5);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.lineWidth = r * 0.34;
    ctx.beginPath();
    ctx.moveTo(-r * 1.1, r * 0.3);
    ctx.bezierCurveTo(-r * 0.4, -r * 0.72, r * 0.4, r * 0.72, r * 1.1, -r * 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

/** (가) 한 가지 작물만 심은 논 — 똑같은 벼가 줄지어 있을 뿐이다. */
const PADDY_SVG = (() => {
  let stalks = "";
  for (let i = 0; i < 7; i++) {
    const x = 12 + i * 15;
    stalks += `<path d="M${x} 66 V44" stroke="#8CE0C4" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M${x} 46 q5 -5 8 -12 M${x} 46 q-5 -5 -8 -12" stroke="#8CE0C4" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 120 80" role="img" aria-label="한 가지 작물만 줄지어 심은 논">` +
    `<rect width="120" height="80" rx="10" fill="#12233B"/>` +
    `<rect y="58" width="120" height="22" fill="#1B3A5A"/>${stalks}</svg>`;
})();

/** (나) 호수가 있는 숲 — 서로 다른 생태계 두 곳 + 여러 종류 + 크기가 제각각. */
const FOREST_SVG =
  `<svg viewBox="0 0 120 80" role="img" aria-label="크고 작은 나무와 호수, 새와 물고기가 있는 숲">` +
  `<rect width="120" height="80" rx="10" fill="#12233B"/>` +
  `<ellipse cx="84" cy="64" rx="32" ry="13" fill="#2C6FA8"/>` +
  `<path d="M18 68 V52 M18 54 l-9 12 h18 z" stroke="#8C6239" stroke-width="3" fill="#51CF66"/>` +
  `<path d="M36 68 V44 M36 46 l-12 22 h24 z" stroke="#8C6239" stroke-width="3" fill="#38B04A"/>` +
  `<path d="M52 68 V56 M52 58 l-7 10 h14 z" stroke="#8C6239" stroke-width="2.6" fill="#69DB7C"/>` +
  `<ellipse cx="80" cy="63" rx="7" ry="3.4" fill="#A5D8FF"/>` +
  `<path d="M73 63 l-6 -4 v8 z" fill="#A5D8FF"/>` +
  `<ellipse cx="96" cy="26" rx="8" ry="4" fill="#FFD8A8" transform="rotate(-14 96 26)"/>` +
  `<path d="M103 24 l7 2 -7 3 z" fill="#FFD8A8"/>` +
  `<ellipse cx="30" cy="30" rx="5" ry="3" fill="#FFC9C9"/>` +
  `<path d="M35 29 l5 1 -5 2 z" fill="#FFC9C9"/>` +
  `<ellipse cx="62" cy="70" rx="4.6" ry="3" fill="#D8C7FF"/>` +
  `</svg>`;

interface Mark { x: number; y: number; r: number; shape: Shape; color: string; rot: number; phase: number }

export const diversityLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DiversityStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "kinds" } }, el("b", { text: "세 가지 다양함" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge bio", dataset: { g: "peak" } }, el("b", { text: "모두 높이기" }), el("span", { text: "게이지 최고" })),
    el("div", { class: "pn-badge bio", dataset: { g: "verdict" } }, el("b", { text: "두 지역 비교" }), el("span", { text: "판정 1문" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "생물다양성은 무엇으로 정해질까요? 아래 <b>세 가지</b>를 하나씩 올리고 내리면서 무대의 생물 구성과 게이지가 어떻게 달라지는지 살펴보세요.",
  });

  const canvas = el("canvas", {
    class: "b3-canvas",
    style: `height:${CVH}px`,
    attrs: {
      role: "img",
      "aria-label": "생태계 타일마다 여러 종류의 생물이 놓인 무대, 생태계 수·생물 종류 수·변이 폭에 따라 구성이 바뀐다",
    },
  });
  const readPill = el("span", { text: "생태계 1곳 · 생물 1가지" });
  const toast = el("div", { class: "toast low" });
  const stage = el(
    "div", { class: "stage b3-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#12B886" }), readPill)),
    toast,
  );

  const legend = el("div", { class: "dvs-legend" });
  const gaugeLv = el("span", { class: "dvs-lv", text: "매우 낮음" });
  const gaugeFill = el("div", { class: "dvs-fill" });
  const gaugeWarn = el("div", { class: "dvs-warn" });
  const gauge = el(
    "div", { class: "dvs-gauge" },
    el("div", { class: "dvs-gauge-h" }, el("b", { text: "생물다양성 게이지" }), gaugeLv),
    el("div", { class: "dvs-track" }, gaugeFill),
    gaugeWarn,
  );

  const controls = el("div", { class: "b3-controls" });
  // 무대 + 게이지를 한 덩어리로 상단에 고정한다 — 아래 변인을 조작하는 **동안**
  // 무대의 생물 구성이 바뀌는 장면과 게이지가 차오르는 것을 함께 봐야 하기 때문이다
  // (실사용 피드백 2026-07-26: 조작하고 나서 위로 스크롤해야 결과가 보였다).
  // 조작부를 위로 올리지 않은 이유 = "연타하는 손이 무대를 가린다"는 전 과목 배치 규칙.
  const pane = el("div", { class: "dvs-pane" }, stage, gauge);
  host.append(goalsEl, helper, pane, controls, legend);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 상태 ──────────────────────────────────────────────────────────────
  let ecoN = 1;
  let speciesN = 1;
  let varyN = 1;
  const touched = new Set<Knob>();
  const goals = new Set<Goal>();
  let finished = false;
  let compareShown = false;
  let marks: Mark[] = [];
  let tiles: { eco: number; x: number; y: number; w: number; h: number }[] = [];
  let W = BASE_W;
  let toastTimer = 0;
  const timers = new Set<number>();

  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };
  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const finish = (): void => {
    if (finished) return;
    finished = true;
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "생물다양성 정리하기");
  };

  const collect = (id: Goal, msg: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement | null;
    if (chip) {
      chip.classList.add("on");
      const sp = chip.querySelector("span");
      if (sp) sp.textContent = id === "kinds" ? "3 / 3" : "확인";
    }
    haptic(HAPTIC.ctaUnlock);
    toastMsg(msg);
    if (goals.size === 3) finish();
    maybeCompare();
  };

  // ── 무대 레이아웃(논리 좌표) ─────────────────────────────────────────
  function rebuild(): void {
    const rnd = mulberry32(20260726);
    const pad = 10;
    const areaX = pad;
    const areaY = TOP_PAD;
    const areaW = BASE_W - pad * 2;
    const areaH = AREA_BOTTOM - TOP_PAD;
    const gap = 8;
    const cols = ecoN <= 3 ? ecoN : (ecoN === 4 ? 2 : 3);
    const rows = Math.ceil(ecoN / cols);
    const tw = (areaW - gap * (cols - 1)) / cols;
    const th = (areaH - gap * (rows - 1)) / rows;

    tiles = [];
    marks = [];
    for (let k = 0; k < ecoN; k++) {
      const row = Math.floor(k / cols);
      const inRow = Math.min(cols, ecoN - row * cols);
      const col = k - row * cols;
      // 마지막 줄이 덜 찼으면 가운데로 모은다.
      const rowW = inRow * tw + (inRow - 1) * gap;
      const tx = areaX + (areaW - rowW) / 2 + col * (tw + gap);
      const ty = areaY + row * (th + gap);
      tiles.push({ eco: k, x: tx, y: ty, w: tw, h: th });

      const bx = tx + 7;
      const by = ty + 21;
      const bw = tw - 14;
      const bh = th - 28;
      const total = speciesN * 3;
      const cCols = Math.max(1, Math.ceil(Math.sqrt(total * (bw / Math.max(1, bh)))));
      const cRows = Math.ceil(total / cCols);
      const cw = bw / cCols;
      const ch = bh / cRows;
      const base = Math.min(cw, ch) * 0.34;
      for (let i = 0; i < total; i++) {
        const sp = Math.floor(i / 3);
        const j = i % 3;
        const cx = bx + (i % cCols + 0.5) * cw + (rnd() - 0.5) * cw * 0.22;
        const cy = by + (Math.floor(i / cCols) + 0.5) * ch + (rnd() - 0.5) * ch * 0.2;
        const d = VARY_SPREAD[varyN - 1];
        const tint = SPECIES_TINT[sp % SPECIES_TINT.length];
        marks.push({
          x: cx, y: cy,
          r: Math.max(3.4, base * (1 + (j - 1) * d)),
          shape: ECOS[k].species[sp].shape,
          // 변이 폭이 넓을수록 같은 종류 안에서도 색이 조금씩 달라진다.
          color: mixHex(tint, j === 0 ? "#0F2A44" : "#FFFFFF", d * (j === 1 ? 0 : 0.7)),
          rot: (rnd() - 0.5) * 0.25,
          phase: rnd() * PI2,
        });
      }
    }
  }

  // ── 게이지·범례 ───────────────────────────────────────────────────────
  function score(): { v: number; label: string; weak: string[] } {
    const e = (ecoN - 1) / (ECO_MAX - 1);
    const sp = (speciesN - 1) / (SPECIES_MAX - 1);
    const v0 = (varyN - 1) / (VARY_MAX - 1);
    let v = (e + sp + v0) / 3;
    const weak: string[] = [];
    if (ecoN === 1) weak.push("생태계의 다양함");
    if (speciesN === 1) weak.push("생물 종류의 다양함");
    if (varyN === 1) weak.push("변이의 다양함");
    // 셋 중 하나라도 가장 낮으면 "생물다양성이 높다"고 말할 수 없다 — 게이지도 절반을 못 넘는다.
    if (weak.length) v = Math.min(v, 0.5);
    const label = v >= 0.99 ? "매우 높음" : v >= 0.72 ? "높음" : v >= 0.46 ? "보통" : v >= 0.2 ? "낮음" : "매우 낮음";
    return { v: clamp(v, 0, 1), label, weak };
  }

  function renderMeta(): void {
    const sc = score();
    const prev = gaugeFill.style.width;
    const next = `${Math.round(sc.v * 100)}%`;
    gaugeFill.style.width = next;
    // 값이 실제로 바뀐 순간에만 게이지를 한 번 튕겨 준다 — 조작부를 보고 있어도 변화가 눈에 걸린다.
    if (prev && prev !== next) {
      gauge.classList.remove("bump");
      void gauge.offsetWidth; // 리플로로 애니메이션 재시작
      gauge.classList.add("bump");
    }
    gaugeLv.textContent = sc.label;
    gaugeWarn.textContent = sc.weak.length && sc.weak.length < 3
      ? `아직 가장 낮은 단계: ${sc.weak.join(" · ")}. 셋 중 하나라도 낮으면 생물다양성이 높다고 할 수 없어요.`
      : "";
    readPill.textContent = `생태계 ${ecoN}곳 · 생물 ${speciesN}가지 · 변이 ${VARY_WORD[varyN - 1]}`;

    legend.replaceChildren();
    for (let k = 0; k < ecoN; k++) {
      const names = ECOS[k].species.slice(0, speciesN).map((x) => x.name).join(", ");
      legend.appendChild(el(
        "div", { class: "dvs-leg" },
        el("span", { class: "dvs-dot", style: `background:${ECOS[k].color}` }),
        el("b", { text: ECOS[k].name }),
        el("span", { text: names }),
      ));
    }
  }

  // ── 조작부 ────────────────────────────────────────────────────────────
  const valEls: Record<Knob, HTMLElement> = {} as Record<Knob, HTMLElement>;
  const pmEls: Record<Knob, { minus: HTMLButtonElement; plus: HTMLButtonElement }> =
    {} as Record<Knob, { minus: HTMLButtonElement; plus: HTMLButtonElement }>;

  const valueText = (k: Knob): string => {
    // 생태계 이름은 무대 타일과 아래 범례가 이미 보여 준다 — 여기까지 나열하면 값이 세 줄로
    // 넘쳐 카드 높이가 들쭉날쭉해지고, 세 손잡이가 한 화면에서 밀린다.
    if (k === "eco") return `${ecoN}곳`;
    if (k === "species") return `한 곳에 ${speciesN}가지`;
    return VARY_WORD[varyN - 1];
  };
  const valueOf = (k: Knob): number => (k === "eco" ? ecoN : k === "species" ? speciesN : varyN);
  const maxOf = (k: Knob): number => (k === "eco" ? ECO_MAX : k === "species" ? SPECIES_MAX : VARY_MAX);

  function syncControls(): void {
    (["eco", "species", "vary"] as Knob[]).forEach((k) => {
      valEls[k].textContent = valueText(k);
      pmEls[k].minus.disabled = valueOf(k) <= 1;
      pmEls[k].plus.disabled = valueOf(k) >= maxOf(k);
    });
  }

  function bump(k: Knob, d: number): void {
    const next = clamp(valueOf(k) + d, 1, maxOf(k));
    if (next === valueOf(k)) return;
    if (k === "eco") ecoN = next;
    else if (k === "species") speciesN = next;
    else varyN = next;
    haptic(HAPTIC.tap);
    rebuild();
    renderMeta();
    syncControls();

    if (!touched.has(k)) {
      touched.add(k);
      const chip = goalsEl.querySelector('[data-g="kinds"] span') as HTMLElement | null;
      if (chip && !goals.has("kinds")) chip.textContent = `${touched.size} / 3`;
      if (k === "eco") toastMsg("생태계의 종류가 달라졌어요. 첫 번째 다양함이에요");
      else if (k === "species") toastMsg("한 생태계에 사는 생물의 종류가 달라졌어요. 두 번째 다양함이에요");
      else toastMsg("같은 종류 안에서도 크기와 색이 달라졌어요. 세 번째 다양함이에요");
      if (touched.size === 3) {
        collect("kinds", "생태계 · 생물 종류 · 변이, 세 가지를 모두 만져 봤어요");
        helper.innerHTML = "세 가지를 모두 만져 봤어요. 이제 <b>세 가지를 모두 가장 높게</b> 올려 보세요. 하나라도 낮으면 게이지가 절반을 넘지 못해요.";
      }
    }
    if (ecoN === ECO_MAX && speciesN === SPECIES_MAX && varyN === VARY_MAX) {
      collect("peak", "세 가지가 모두 높을 때 비로소 생물다양성이 매우 높아요");
    }
  }

  function knob(k: Knob, title: string, note: string): HTMLElement {
    const val = el("div", { class: "dvs-val" });
    const minus = el("button", {
      class: "dvs-pm", attrs: { type: "button", "aria-label": `${title} 줄이기` },
      dataset: { dvsKnob: k, dvsDir: "-1" }, text: "−",
    });
    const plus = el("button", {
      class: "dvs-pm", attrs: { type: "button", "aria-label": `${title} 늘리기` },
      dataset: { dvsKnob: k, dvsDir: "1" }, text: "+",
    });
    minus.addEventListener("click", () => bump(k, -1));
    plus.addEventListener("click", () => bump(k, 1));
    valEls[k] = val;
    pmEls[k] = { minus, plus };
    return el(
      // 한 줄 구성 — 제목·설명 왼쪽, −/값/+ 오른쪽. 세 손잡이가 무대·게이지와 한 화면에 들어와야
      // 조작하는 동안 무대가 바뀌는 장면을 볼 수 있다(실사용 피드백 2026-07-26).
      "div", { class: "dvs-ctl" },
      el("div", { class: "dvs-ctl-h" }, document.createTextNode(title), el("span", { text: note })),
      el("div", { class: "dvs-row" }, minus, val, plus),
    );
  }

  controls.append(
    knob("eco", "① 생태계의 다양함", "서로 다른 생태계가 몇 곳이나 있나요?"),
    knob("species", "② 생물 종류의 다양함", "한 생태계에 몇 가지 생물이 사나요?"),
    knob("vary", "③ 변이의 다양함", "같은 종류의 생물끼리 특징이 얼마나 다른가요?"),
  );

  // ── 마지막 국면: 두 지역 비교 판정 ────────────────────────────────────
  function maybeCompare(): void {
    if (compareShown || !goals.has("kinds") || !goals.has("peak")) return;
    compareShown = true;
    helper.innerHTML = "세 가지가 모두 높을 때 생물다양성이 높아요. 그럼 실제 두 지역을 견주면 어떨까요?";

    const why = el("div", { class: "dvs-why" });
    const pair = el("div", { class: "dvs-pair" });
    const box = el(
      "div", { class: "dvs-compare" },
      el("div", { class: "dvs-cq", html: "(가)와 (나) 가운데 <b>생물다양성이 더 높은</b> 곳은 어디일까요?" }),
      pair,
      why,
    );

    const regions = [
      {
        label: "(가) 한 가지 작물만 심은 논", sub: "같은 품종의 벼만 줄지어 있어요", art: PADDY_SVG, ok: false,
        miss: "논은 생태계도 한 가지, 자라는 생물도 한 가지, 같은 벼끼리 특징도 거의 같아요",
      },
      {
        label: "(나) 호수가 있는 숲", sub: "숲과 호수, 크고 작은 생물이 함께 있어요", art: FOREST_SVG, ok: true,
        miss: "",
      },
    ];
    let answered = false;
    for (const r of regions) {
      const b = el("button", {
        class: "dvs-region", attrs: { type: "button" }, dataset: { dvsOk: String(r.ok) },
      });
      b.innerHTML = r.art;
      b.append(el("b", { text: r.label }), el("span", { text: r.sub }));
      b.addEventListener("click", () => {
        if (answered) return;
        if (!r.ok) {
          haptic(HAPTIC.wrong);
          b.classList.add("no");
          toastMsg(r.miss);
          later(() => b.classList.remove("no"), 1400);
          return;
        }
        answered = true;
        haptic(HAPTIC.correct);
        b.classList.add("ok");
        why.innerHTML = "(나)가 더 높아요. <b>숲과 호수</b>라는 서로 다른 생태계가 있고(①), 그 안에 사는 <b>생물의 종류</b>도 많고(②), 같은 종류 안에서도 크기와 무늬가 <b>조금씩 다르기</b> 때문이에요(③). (가)는 세 가지가 모두 낮아요. 이렇게 생물다양성은 어떤 지역에 살고 있는 생물의 다양한 정도를 <b>세 가지로 함께</b> 봐요.";
        helper.innerHTML = "생물다양성은 ① 생태계의 다양함 ② 생물 종류의 다양함 ③ 같은 종류 사이 <b>변이</b>의 다양함을 <b>모두</b> 포함해요.";
        collect("verdict", "생태계 · 종류 · 변이를 모두 갖춘 (나)의 생물다양성이 높아요");
      });
      pair.appendChild(b);
    }
    controls.appendChild(box);
    later(() => box.scrollIntoView({ behavior: "smooth", block: "nearest" }), 140);
  }

  // ── 그리기 ────────────────────────────────────────────────────────────
  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    ctx.clearRect(0, 0, W, fit.h);

    const k = Math.min(W / BASE_W, CVH / BASE_H);
    const ox = (W - BASE_W * k) / 2;
    const sx = (x: number): number => ox + x * k;
    const sy = (y: number): number => y * k;

    for (const t of tiles) {
      const eco = ECOS[t.eco];
      ctx.save();
      ctx.fillStyle = `${eco.color}14`;
      ctx.strokeStyle = `${eco.color}66`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(sx(t.x), sy(t.y), t.w * k, t.h * k, 14 * k);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = eco.color;
      ctx.font = `800 ${Math.max(12, 12.5 * k)}px Pretendard, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(eco.name, sx(t.x + 9), sy(t.y + 6));
      ctx.restore();
    }

    for (const m of marks) {
      drawShape(ctx, m.shape, sx(m.x), sy(m.y) + Math.sin(tMs / 760 + m.phase) * 1.4, m.r * k, m.color, m.rot);
    }
  });

  rebuild();
  renderMeta();
  syncControls();

  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("세 가지 다양함을 모두 만져 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
