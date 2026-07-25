// plantKit2 — 중2 Ⅴ 식물과 에너지(v2) 공용 킷.
// 식물 색·물질 토큰·관(물관/체관)·잎/기공/엽록체 소품과 "랩 골격 조립기"의 단일 진실 공급원이다.
// 랩 8종은 반드시 이 파일의 헬퍼로 그린다(색·모양 하드코딩 금지 — 단원 전체의 표현이 한 벌로 유지된다).
// 규격: 논리 좌표 BASE_W=360 기준으로 그리고, buildLab이 준 sc()로 스케일한다.

import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";
import { fitCanvas } from "./canvas";
import { curioCard, type Curio } from "./curio";

export const BASE_W = 360;

// ── 색 ────────────────────────────────────────────────────────
export type PlantTone =
  | "leafHi" | "leaf" | "leafLo" | "vein"
  | "xylem" | "phloem" | "sun" | "water" | "carbon" | "oxygen"
  | "glucose" | "starch" | "sugar" | "protein" | "fat"
  | "soil" | "stemHi" | "stem" | "stemLo" | "night" | "shadow" | "ink" | "paper";

const VAR: Record<PlantTone, [string, string]> = {
  leafHi: ["--plant-leaf-hi", "#7FD66D"],
  leaf: ["--plant-leaf", "#39A85A"],
  leafLo: ["--plant-leaf-lo", "#17643A"],
  vein: ["--plant-vein", "#B8E88F"],
  xylem: ["--plant-xylem", "#4DA3F5"],
  phloem: ["--plant-phloem", "#E45A92"],
  sun: ["--plant-sun", "#FFC44F"],
  water: ["--plant-water", "#55B8F2"],
  carbon: ["--plant-carbon", "#8A96A8"],
  oxygen: ["--plant-oxygen", "#69D5D0"],
  glucose: ["--plant-glucose", "#8D72D9"],
  starch: ["--plant-starch", "#C4A4E8"],
  sugar: ["--pgx-sugar", "#FF922B"],
  protein: ["--pgx-protein", "#F2C14E"],
  fat: ["--pgx-fat", "#E8D5A3"],
  soil: ["--plant-soil", "#765235"],
  stemHi: ["--plant-stem-hi", "#65BE67"],
  stem: ["--plant-stem", "#2D8650"],
  stemLo: ["--plant-stem-lo", "#194E34"],
  night: ["--plant-night-deep", "#132344"],
  shadow: ["--plant-shadow", "#263B34"],
  ink: ["--n900", "#0C1522"],
  paper: ["--n0", "#FFFFFF"],
};

const cache = new Map<PlantTone, string>();
export function plantColor(k: PlantTone): string {
  const hit = cache.get(k);
  if (hit) return hit;
  const [name, fallback] = VAR[k];
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const out = v || fallback;
  cache.set(k, out);
  return out;
}

/** rgba 문자열 — 토큰 색에 투명도를 얹을 때. */
export function alpha(k: PlantTone, a: number): string {
  const hex = plantColor(k).replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = parseInt(full.slice(0, 6) || "000000", 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** 합성 PointerEvent(E2E)에서 throw하는 setPointerCapture 방어 — 전 랩 필수. */
export function safeCapture(target: Element, pointerId: number): void {
  try {
    (target as Element & { setPointerCapture(id: number): void }).setPointerCapture(pointerId);
  } catch {
    // 합성 포인터에는 활성 포인터가 없다.
  }
}

// ── 물질 토큰 ─────────────────────────────────────────────────
export type Matter = "water" | "carbon" | "oxygen" | "glucose" | "starch" | "sugar" | "light";

const MATTER_TONE: Record<Matter, PlantTone> = {
  water: "water", carbon: "carbon", oxygen: "oxygen",
  glucose: "glucose", starch: "starch", sugar: "sugar", light: "sun",
};

/** 물질 알갱이 — 종류마다 모양이 다르다(색맹·흑백에서도 구분되게).
 *  물=물방울 · 이산화 탄소=알갱이 3개 사슬 · 산소=알갱이 2개 · 포도당=육각형 ·
 *  녹말=육각형 사슬 · 설탕=육각형 2개 · 빛=별. */
export function drawMatter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, kind: Matter,
  opts: { label?: string; ghost?: boolean } = {},
): void {
  const tone = MATTER_TONE[kind];
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = opts.ghost ? 0.42 : 1;
  const g = ctx.createRadialGradient(-r * 0.32, -r * 0.36, r * 0.08, 0, 0, r * 1.15);
  g.addColorStop(0, "rgba(255,255,255,.92)");
  g.addColorStop(0.42, plantColor(tone));
  g.addColorStop(1, plantColor(tone));
  ctx.fillStyle = g;
  ctx.strokeStyle = alpha("ink", 0.55);
  ctx.lineWidth = Math.max(1, r * 0.13);
  const hex = (cx: number, cy: number, rr: number): void => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 3;
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  const ball = (cx: number, cy: number, rr: number): void => {
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };
  if (kind === "water") {
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.15);
    ctx.bezierCurveTo(r * 0.95, -r * 0.1, r * 0.74, r, 0, r);
    ctx.bezierCurveTo(-r * 0.74, r, -r * 0.95, -r * 0.1, 0, -r * 1.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === "carbon") {
    ball(-r * 0.78, 0, r * 0.54);
    ball(r * 0.78, 0, r * 0.54);
    ball(0, 0, r * 0.66);
  } else if (kind === "oxygen") {
    ball(-r * 0.44, 0, r * 0.7);
    ball(r * 0.44, 0, r * 0.7);
  } else if (kind === "glucose") {
    hex(0, 0, r);
  } else if (kind === "starch") {
    hex(-r * 0.72, r * 0.28, r * 0.62);
    hex(r * 0.72, r * 0.28, r * 0.62);
    hex(0, -r * 0.5, r * 0.62);
  } else if (kind === "sugar") {
    hex(-r * 0.55, 0, r * 0.68);
    hex(r * 0.55, 0, r * 0.68);
  } else {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? r * 1.1 : r * 0.46;
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (opts.label) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = alpha("ink", 0.75);
    ctx.lineWidth = 2.6;
    ctx.font = `900 ${Math.max(9, r * 0.86)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(opts.label, 0, r * 1.95);
    ctx.fillText(opts.label, 0, r * 1.95);
  }
  ctx.restore();
}

// ── 소품 ──────────────────────────────────────────────────────
/** 잎 한 장(끝이 뾰족한 타원 + 주맥·측맥). rot는 라디안. */
export function drawLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, len: number, wid: number, rot = 0,
  opts: { tone?: PlantTone; veins?: boolean; wilt?: number } = {},
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  const wilt = opts.wilt ?? 0;
  const g = ctx.createLinearGradient(-len / 2, -wid / 2, len / 2, wid / 2);
  const base = opts.tone ?? "leaf";
  g.addColorStop(0, plantColor("leafHi"));
  g.addColorStop(0.55, plantColor(base));
  g.addColorStop(1, plantColor("leafLo"));
  ctx.fillStyle = wilt > 0.5 ? "#9AA36B" : g;
  ctx.strokeStyle = plantColor("leafLo");
  ctx.lineWidth = 1.4;
  const droop = wilt * wid * 0.5;
  ctx.beginPath();
  ctx.moveTo(-len / 2, droop * 0.2);
  ctx.bezierCurveTo(-len * 0.2, -wid / 2 + droop, len * 0.2, -wid / 2 + droop, len / 2, droop * 0.6);
  ctx.bezierCurveTo(len * 0.2, wid / 2 + droop, -len * 0.2, wid / 2 + droop, -len / 2, droop * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (opts.veins !== false) {
    ctx.strokeStyle = alpha("vein", 0.85);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-len * 0.44, droop * 0.24);
    ctx.quadraticCurveTo(0, droop * 0.5, len * 0.46, droop * 0.6);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      const t = i * 0.16;
      const bx = len * t;
      const by = droop * 0.4;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + len * 0.1, by - wid * 0.3);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + len * 0.1, by + wid * 0.3);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** 엽록체 — 초록 타원 + 안쪽 층(그라나) 점. glow 0~1이면 빛을 받는 연출. */
export function drawChloroplast(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, rx: number, ry: number, rot = 0, glow = 0,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  if (glow > 0.02) {
    ctx.shadowColor = alpha("sun", 0.75 * glow);
    ctx.shadowBlur = 14 * glow;
  }
  const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, ry * 0.15, 0, 0, rx);
  g.addColorStop(0, plantColor("leafHi"));
  g.addColorStop(0.6, plantColor("leaf"));
  g.addColorStop(1, plantColor("leafLo"));
  ctx.fillStyle = g;
  ctx.strokeStyle = plantColor("leafLo");
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.stroke();
  ctx.fillStyle = alpha("leafLo", 0.55);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(i * rx * 0.42, ry * 0.1, rx * 0.16, ry * 0.42, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** 기공 — 콩팥 모양 공변세포 두 개 + 그 사이 구멍. open 0~1. */
export function drawStoma(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, open = 1,
): void {
  const gap = Math.max(0.8, w * 0.2 * open);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = alpha("ink", 0.82);
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.34, gap, 0, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createLinearGradient(0, -w * 0.4, 0, w * 0.4);
  g.addColorStop(0, plantColor("leafHi"));
  g.addColorStop(0.6, plantColor("leaf"));
  g.addColorStop(1, plantColor("leafLo"));
  ctx.fillStyle = g;
  ctx.strokeStyle = plantColor("leafLo");
  ctx.lineWidth = 1.2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(0, side * (gap + w * 0.2), w * 0.5, w * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/** 관(물관·체관) — 3겹 튜브. flow>0이면 진행 방향으로 알갱이가 흐른다. */
export function drawPipe(
  ctx: CanvasRenderingContext2D,
  pts: readonly [number, number][],
  kind: "xylem" | "phloem",
  width = 12,
  flow = 0,
  tMs = 0,
): void {
  if (pts.length < 2) return;
  const tone: PlantTone = kind === "xylem" ? "xylem" : "phloem";
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = alpha("ink", 0.28);
  ctx.lineWidth = width + 4;
  ctx.stroke();
  ctx.strokeStyle = alpha(tone, 0.34);
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.strokeStyle = alpha(tone, 0.95);
  ctx.lineWidth = Math.max(1.6, width * 0.2);
  ctx.stroke();
  ctx.restore();
  if (flow !== 0) {
    const total = pathLength(pts);
    const speed = 0.00016 * Math.abs(flow) * (flow < 0 ? -1 : 1);
    const n = Math.max(3, Math.round(total / 34));
    ctx.save();
    ctx.fillStyle = alpha(tone, 0.95);
    for (let i = 0; i < n; i++) {
      let t = (i / n + tMs * speed) % 1;
      if (t < 0) t += 1;
      const [px, py] = pointOn(pts, t);
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1.6, width * 0.18), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/** 흙 화분 — 아래가 좁은 사다리꼴 + 테두리 링 + 흙. */
export function drawPot(ctx: CanvasRenderingContext2D, cx: number, top: number, w: number, h: number): void {
  ctx.save();
  const halfTop = w / 2;
  const halfBot = w * 0.36;
  const g = ctx.createLinearGradient(cx - halfTop, top, cx + halfTop, top + h);
  g.addColorStop(0, "#F0B27C");
  g.addColorStop(0.55, "#D08A54");
  g.addColorStop(1, "#8A5330");
  ctx.fillStyle = g;
  ctx.strokeStyle = "#7A4526";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - halfTop, top);
  ctx.lineTo(cx + halfTop, top);
  ctx.lineTo(cx + halfBot, top + h);
  ctx.lineTo(cx - halfBot, top + h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = plantColor("soil");
  ctx.beginPath();
  ctx.ellipse(cx, top + 3, halfTop * 0.94, h * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 바닥 접촉 그림자(파운드리 재질 문법). */
export function contact(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, o = 0.13): void {
  ctx.save();
  ctx.fillStyle = alpha("shadow", o);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, Math.max(2.5, rx * 0.16), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 햇빛 — 위에서 내려오는 평행 광선 다발. amount 0~1로 세기. */
export function drawSunbeam(
  ctx: CanvasRenderingContext2D,
  x0: number, x1: number, yTop: number, yBottom: number, amount: number, tMs = 0,
): void {
  if (amount <= 0.01) return;
  ctx.save();
  const g = ctx.createLinearGradient(0, yTop, 0, yBottom);
  g.addColorStop(0, alpha("sun", 0.42 * amount));
  g.addColorStop(1, alpha("sun", 0));
  ctx.fillStyle = g;
  ctx.fillRect(x0, yTop, x1 - x0, yBottom - yTop);
  ctx.strokeStyle = alpha("sun", 0.75 * amount);
  ctx.lineWidth = 2;
  ctx.setLineDash([9, 12]);
  const n = Math.max(2, Math.round((x1 - x0) / 30));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    ctx.lineDashOffset = -((tMs / 26) % 21) - i * 4;
    ctx.beginPath();
    ctx.moveTo(x, yTop);
    ctx.lineTo(x - 6, yBottom);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

/** 흰 배지 라벨 — 어두운 무대에서도 읽히는 이름표(랩 공용, 12px 하한 규칙). */
export function badge(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, text: string, tone: PlantTone = "leaf", sc = 1,
): void {
  ctx.save();
  const size = Math.max(11, 11.5 * sc);
  ctx.font = `900 ${size}px Pretendard, sans-serif`;
  const w = ctx.measureText(text).width + 18 * sc;
  const h = 23 * sc;
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.strokeStyle = plantColor(tone);
  ctx.lineWidth = 1.3 * sc;
  ctx.beginPath();
  (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
    .roundRect(x - w / 2, y - h / 2, w, h, 11 * sc);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = plantColor(tone);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ── 기하 헬퍼 ─────────────────────────────────────────────────
export function pathLength(pts: readonly [number, number][]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return d;
}

export function pointOn(pts: readonly [number, number][], t: number): [number, number] {
  const total = pathLength(pts);
  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (target <= seg) {
      const f = seg === 0 ? 0 : target / seg;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
    }
    target -= seg;
  }
  return [pts[pts.length - 1][0], pts[pts.length - 1][1]];
}

/** 점에서 경로에 가장 가까운 진행률 t와 거리 — 경로 드래그 판정 공용. */
export function nearestOn(pts: readonly [number, number][], px: number, py: number): { t: number; dist: number } {
  const total = pathLength(pts) || 1;
  let acc = 0;
  let best = { t: 0, dist: Infinity };
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const dx = bx - ax;
    const dy = by - ay;
    const seg = Math.hypot(dx, dy) || 1;
    const u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (seg * seg)));
    const cx = ax + dx * u;
    const cy = ay + dy * u;
    const dist = Math.hypot(px - cx, py - cy);
    if (dist < best.dist) best = { t: (acc + u * seg) / total, dist };
    acc += seg;
  }
  return best;
}

// ── 랩 골격 조립기 ────────────────────────────────────────────
export interface GoalSpec { id: string; name: string; hint: string }

export interface LabShell {
  /** 목표 칩 줄 · 지시 helper · 무대 · 조작부(무대 아래) */
  goalsEl: HTMLElement;
  helper: HTMLElement;
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  controls: HTMLElement;
  /** 무대 좌상단 상태 필 */
  setRead(text: string): void;
  toast(msg: string): void;
  /** 목표 달성 — 전부 모으면 onAll이 한 번 불린다. */
  collect(id: string, msg?: string): void;
  has(id: string): boolean;
  /** 캔버스를 DPR·논리좌표에 맞춰 준비하고 스케일을 돌려준다. */
  frame(): { ctx: CanvasRenderingContext2D; w: number; h: number; sc: number };
  dispose(): void;
}

/**
 * 랩의 공통 골격을 만든다 — 배치는 CLAUDE.md 규칙(목표 칩 → helper → 무대 → 조작부) 고정.
 * height는 CSS 픽셀 기준 무대 높이(논리 좌표 y의 최댓값과 같게 잡는다).
 */
export function buildLab(
  host: HTMLElement,
  opts: {
    title: string; lead?: string; height: number; goals: GoalSpec[];
    helper: string; read?: string; curio?: Curio; ariaLabel: string;
    onAll?: () => void;
  },
): LabShell {
  host.appendChild(el("div", { class: "h1", html: opts.title }));
  if (opts.lead) host.appendChild(el("div", { class: "sub", html: opts.lead }));

  const goalsEl = el("div", { class: `pn-badges${opts.goals.length >= 3 ? " force3" : ""}` });
  for (const g of opts.goals) {
    goalsEl.appendChild(
      el("div", { class: "pn-badge plant", dataset: { g: g.id } },
        el("b", { text: g.name }), el("span", { text: g.hint })),
    );
  }
  const helper = el("div", { class: "helper", html: opts.helper });
  const canvas = el("canvas", {
    class: "pgx-canvas",
    style: `height:${opts.height}px`,
    attrs: { role: "img", "aria-label": opts.ariaLabel },
  }) as HTMLCanvasElement;
  const readPill = el("span", { text: opts.read ?? "" });
  const toastEl = el("div", { class: "toast" });
  const stage = el("div", { class: "stage pgx-stage" },
    canvas,
    el("div", { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${plantColor("leaf")}` }), readPill)),
    toastEl,
  );
  const controls = el("div", { class: "pgx-controls" });
  host.append(goalsEl, helper, stage, controls);
  if (opts.curio) host.appendChild(curioCard(opts.curio));

  const done = new Set<string>();
  let toastTimer = 0;
  let fired = false;

  const toast = (msg: string): void => {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1750);
  };

  return {
    goalsEl, helper, stage, canvas, controls,
    setRead: (t) => { readPill.textContent = t; },
    toast,
    has: (id) => done.has(id),
    collect(id, msg) {
      if (done.has(id)) return;
      done.add(id);
      const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement | null;
      if (chip) {
        chip.classList.add("on");
        const span = chip.querySelector("span");
        if (span) span.textContent = "완료";
      }
      haptic(HAPTIC.ctaUnlock);
      if (msg) toast(msg);
      if (done.size >= opts.goals.length && !fired) {
        fired = true;
        opts.onAll?.();
      }
    },
    frame() {
      const fit = fitCanvas(canvas, opts.height, 1.75);
      return { ctx: fit.ctx, w: fit.w, h: fit.h, sc: fit.w / BASE_W };
    },
    dispose() {
      window.clearTimeout(toastTimer);
    },
  };
}

/** 무대 아래 조작 버튼 — 랩 공용(.pgx-btn). */
export function labButton(label: string, onClick: () => void, opts: { tone?: "primary" | "ghost"; sub?: string } = {}): HTMLButtonElement {
  const b = el("button", {
    class: `pgx-btn${opts.tone === "primary" ? " primary" : ""}`,
    attrs: { type: "button" },
  }, el("b", { text: label }), opts.sub ? el("i", { text: opts.sub }) : el("span")) as HTMLButtonElement;
  b.addEventListener("click", () => { haptic(HAPTIC.tap); onClick(); });
  return b;
}

/** 세그먼트 토글(모드 전환) — 랩 공용(.pgx-seg). */
export function labSeg(
  items: { id: string; label: string }[],
  onPick: (id: string) => void,
  initial?: string,
): HTMLElement {
  const wrap = el("div", { class: "pgx-seg", attrs: { role: "tablist" } });
  let cur = initial ?? items[0]?.id;
  const buttons = items.map((it) => {
    const b = el("button", {
      class: `pgx-seg-btn${it.id === cur ? " on" : ""}`,
      attrs: { type: "button", role: "tab", "aria-selected": String(it.id === cur) },
      dataset: { seg: it.id },
      text: it.label,
    }) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (cur === it.id) return;
      cur = it.id;
      buttons.forEach((x) => {
        const on = x.dataset.seg === cur;
        x.classList.toggle("on", on);
        x.setAttribute("aria-selected", String(on));
      });
      haptic(HAPTIC.tap);
      onPick(it.id);
    });
    return b;
  });
  buttons.forEach((b) => wrap.appendChild(b));
  return wrap;
}
