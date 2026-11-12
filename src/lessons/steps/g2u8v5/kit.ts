// [중2 Ⅷ v5] 별과 우주 랩 공용: 틀, 고르기 버튼, 꾹 누르는 버튼, 기록 줄, 밤하늘과 별 그리기.
// 뼈대는 bvFrame(질문 한 줄, 지금 할 일 두 줄, 무대 230, 높이 고정 조작 칸 208)을 그대로 쓴다.
// 캔버스 무대와 글자 도구는 중1 Ⅴ v5의 u5Kit에서 내보낸 것을 가져다 쓴다(무대 캔버스의 클래스가 u5x-cv다).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepAPI } from "../../types";
import { bvCapture, bvFrame, type BvFrame } from "../bio6/b6Lab";

export { u5Canvas as sCanvas, u5Text as sText, u5Pill as sPill, u5Read as sRead, clamp, type U5Stage as SStage } from "../u5v5/u5Kit";

export const S = {
  star: "#FFE9A8", // 별빛
  gold: "#FFD166",
  sky: "#8FB4FF", // 보조선, 시선
  hot: "#9CC4FF", // 뜨거운 별
  cool: "#FF8A5C", // 차가운 별
  earth: "#5AA2F8",
  sun: "#FFC94A",
  ok: "#7FE3C4",
  ink: "#E8EEF9",
  dim: "rgba(232,238,249,.55)",
  line: "rgba(178,204,238,.45)",
};

export interface LabStep {
  title: string;
  cta?: string;
}

/** 랩 틀. 별 단원의 색을 입힌다. */
export function sFrame(host: HTMLElement, o: { title: string; steps: number; api: Pick<StepAPI, "setCTA"> }): BvFrame {
  host.classList.add("g2u8x-step");
  return bvFrame(host, { title: o.title, steps: o.steps, cls: "g2u8x-stage", qCls: "g2u8x-q", api: o.api });
}

/** 고르기 버튼 한 줄(48px). 하나만 켜진다. init이 null이면 처음에는 아무것도 켜지지 않는다. */
export interface SSegs<K extends string> {
  el: HTMLElement;
  value: () => K | null;
  set: (k: K | null) => void;
  lock: (v: boolean) => void;
  btn: (k: K) => HTMLButtonElement;
}
export function sSegs<K extends string>(items: { k: K; t: string }[], init: K | null, onPick: (k: K) => void, same = false): SSegs<K> {
  let cur: K | null = init;
  const btns = new Map<K, HTMLButtonElement>();
  const row = el("div", { class: "g2u8x-segs" });
  row.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
  const paint = (): void => btns.forEach((b, k) => b.classList.toggle("on", k === cur));
  items.forEach((it) => {
    const b = el("button", { class: "g2u8x-seg", text: it.t, attrs: { type: "button" } }) as HTMLButtonElement;
    b.dataset.k = it.k;
    b.addEventListener("click", () => {
      if (it.k === cur && !same) return;
      haptic(HAPTIC.tap);
      cur = it.k;
      paint();
      onPick(it.k);
    });
    btns.set(it.k, b);
    row.appendChild(b);
  });
  paint();
  return {
    el: row,
    value: () => cur,
    set(k) {
      cur = k;
      paint();
    },
    lock: (v) => btns.forEach((b) => (b.disabled = v)),
    btn: (k) => btns.get(k)!,
  };
}

/** 버튼 여럿을 한 줄에. */
export function sRow(...nodes: HTMLElement[]): HTMLElement {
  const row = el("div", { class: "g2u8x-row" }, ...nodes);
  row.style.gridTemplateColumns = `repeat(${nodes.length}, 1fr)`;
  return row;
}

/** 조작 칸의 작은 글(한 줄). */
export function sCap(text: string): HTMLElement {
  return el("div", { class: "g2u8x-cap", html: text });
}

/** 꾹 누르는 동안 켜지는 버튼. 손을 떼거나 밖으로 나가면 꺼진다. 키보드는 누를 때마다 켜고 끈다. */
export function sHold(cls: string, text: string, on: (held: boolean) => void): HTMLButtonElement {
  const b = el("button", { class: `bv-btn g2u8x-hold ${cls}`, text, attrs: { type: "button" } }) as HTMLButtonElement;
  let held = false;
  const set = (v: boolean): void => {
    if (held === v) return;
    held = v;
    b.classList.toggle("on", v);
    if (v) haptic(HAPTIC.tap);
    on(v);
  };
  b.addEventListener("pointerdown", (e) => {
    if (b.disabled) return;
    bvCapture(b, e.pointerId);
    set(true);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => b.addEventListener(t, () => set(false)));
  b.addEventListener("click", (e) => {
    if ((e as MouseEvent).detail === 0 && !b.disabled) set(!held);
  });
  b.addEventListener("contextmenu", (e) => e.preventDefault());
  return b;
}

/** 기록 줄(해 본 것이 차례로 채워진다). */
export interface SLog {
  el: HTMLElement;
  set: (i: number, value: string, bad?: boolean) => void;
  clear: (i: number) => void;
  has: (i: number) => boolean;
}
export function sLog(rows: string[], cols = 1, tight = false): SLog {
  const items = rows.map((name) => {
    const v = el("b", { class: "g2u8x-log-v", text: "아직" });
    return { row: el("div", { class: "g2u8x-log-row" }, el("span", { class: "g2u8x-log-n", text: name }), v), v, on: false };
  });
  const box = el("div", { class: `g2u8x-log${tight ? " tight" : ""}` }, ...items.map((i) => i.row));
  box.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  return {
    el: box,
    set(i, value, bad = false) {
      items[i].v.textContent = value;
      items[i].row.classList.toggle("on", !bad);
      items[i].row.classList.toggle("bad", bad);
      items[i].on = !bad;
    },
    clear(i) {
      items[i].v.textContent = "아직";
      items[i].row.classList.remove("on", "bad");
      items[i].on = false;
    },
    has: (i) => items[i].on,
  };
}

/** 무대에 실사 한 장을 얹는다(lazy 금지). 경로는 public/photos/star 아래의 파일 이름. */
const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
export const starPhoto = (file: string): string => `${BASE}photos/star/${file}`;
export function sPhoto(cls: string, file: string, alt: string): HTMLImageElement {
  return el("img", { class: `g2u8x-photo ${cls}`, attrs: { src: starPhoto(file), alt, draggable: "false" } }) as HTMLImageElement;
}

// ── 캔버스 그리기 ───────────────────────────────────────────────────
/** 흔들리지 않는 난수(같은 n이면 같은 값). */
export const rnd = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** 배경의 잔별. seed가 같으면 늘 같은 자리. */
export function sField(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, n: number, seed = 1, alpha = 0.7): void {
  ctx.save();
  for (let i = 0; i < n; i++) {
    const px = x + rnd(seed + i * 3.1) * w;
    const py = y + rnd(seed + i * 7.7 + 1) * h;
    const r = 0.5 + rnd(seed + i * 1.3 + 2) * 0.9;
    ctx.globalAlpha = alpha * (0.35 + rnd(seed + i * 5.9) * 0.65);
    ctx.fillStyle = "#DCE6FF";
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** 빛나는 별(가운데 점 + 번지는 빛). r은 번지는 빛의 반지름. */
export function sGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color = S.star, core = 0.28): void {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(0.25, color);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.2, r * core), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 테두리 없는 글자(밝은 바탕 위에 쓴다). */
export function sInk(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: { color?: string; px?: number; align?: CanvasTextAlign; w?: number } = {}): void {
  ctx.save();
  ctx.font = `${o.w ?? 800} ${o.px ?? 13}px Pretendard, system-ui, sans-serif`;
  ctx.textAlign = o.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = o.color ?? "#1B2A44";
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** 직선(점선 선택). */
export function sLine(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, w = 1.5, dash?: number[]): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

/** 화살표. 머리는 끝점에 붙는다. */
export function sArrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, w = 2.5, head = 8): void {
  const a = Math.atan2(y1 - y0, x1 - x0);
  sLine(ctx, x0, y0, x1 - Math.cos(a) * head * 0.7, y1 - Math.sin(a) * head * 0.7, color, w);
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head);
  ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 둥근 사각형 채우기(테두리 선택). */
export function sBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 1.5): void {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  ctx.restore();
}

/** 원(채우기와 테두리). */
export function sDisk(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke?: string, lw = 1.5): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  ctx.restore();
}

/** 표면 온도(K)에서 별의 색을 얻는다(흑체 근사, 2500~30000 K). */
export function tempColor(k: number): [number, number, number] {
  const t = k / 100;
  const c = (v: number): number => Math.max(0, Math.min(255, Math.round(v)));
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [c(r), c(g), c(b)];
}
export const rgb = (c: [number, number, number], a = 1): string => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
