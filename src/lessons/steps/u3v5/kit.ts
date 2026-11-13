// 중1 Ⅲ v5 랩 공용 부품. 뼈대는 Ⅱ단원의 bvFrame(../bio6/b6Lab)을 그대로 쓰고, 여기에는 이 단원의 무대 부품만 둔다.
//   u3Frame   bvFrame + 열 단원 색(.u3x-step)
//   u3Canvas  무대에 캔버스 하나를 깔고 설계 좌표(346×230)로 그리게 한다. 그리기 루프는 stop()으로 돌려준다.
//   u3Hold    꾹 누르는 동안만 일이 일어나는 버튼(가열)
//   그리기 도우미: 글자, 알약 표시, 비커, 그래프 축, 온도계
// 무대 안 글자는 12px 이상으로 쓴다.

import { stageDpr } from "../../../core/wide";
import { el } from "../../../core/dom";
import { createLoop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepAPI } from "../../types";
import { bvFrame, type BvFrame } from "../bio6/b6Lab";

export const SW = 346;
export const SH = 230;
export const INK = "#E8EEF9";
export const SUB = "#9FB0C8";
export const HOT = "#FF8A4C";
export const COLD = "#5AA9FF";
export const FONT = "Pretendard, system-ui, sans-serif";

export function u3Frame(host: HTMLElement, o: { title: string; steps: number; cls: string; api: Pick<StepAPI, "setCTA"> }): BvFrame {
  host.classList.add("u3x-step");
  return bvFrame(host, { title: o.title, steps: o.steps, cls: `u3x-stage ${o.cls}`, qCls: "u3x-q", api: o.api });
}

export type Ctx = CanvasRenderingContext2D;

export interface U3Canvas {
  el: HTMLCanvasElement;
  /** 화면 좌표를 설계 좌표로 */
  pt: (clientX: number, clientY: number) => { x: number; y: number };
  stop: () => void;
}

/** draw(ctx, dt, tMs): dt는 60fps 기준 프레임 수(1이 한 프레임). */
export function u3Canvas(stage: HTMLElement, draw: (ctx: Ctx, dt: number, tMs: number) => void): U3Canvas {
  const cv = el("canvas", { class: "u3x-cv", attrs: { "aria-hidden": "true" } }) as HTMLCanvasElement;
  stage.appendChild(cv);
  const ctx = cv.getContext("2d")!;
  let w = 0;
  let h = 0;
  let k = 1;
  let ox = 0;
  let dpr = 1;
  const fit = (): void => {
    const cw = stage.clientWidth || SW;
    const ch = stage.clientHeight || SH;
    const d = stageDpr();
    if (cw === w && ch === h && d === dpr) return;
    w = cw;
    h = ch;
    dpr = d;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    k = Math.min(w / SW, h / SH);
    ox = (w - SW * k) / 2;
  };
  const loop = createLoop((dt, t) => {
    fit();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr * k, 0, 0, dpr * k, ox * dpr, 0);
    draw(ctx, dt, t);
  }).start();
  return {
    el: cv,
    pt(cx, cy) {
      const r = cv.getBoundingClientRect();
      return { x: (cx - r.left - ox) / k, y: (cy - r.top) / k };
    },
    stop: () => loop.stop(),
  };
}

/** 꾹 누르는 버튼. 누르는 동안 on(true), 떼면 on(false). 키보드는 스페이스와 엔터. */
export function u3Hold(text: string, on: (down: boolean) => void): HTMLButtonElement {
  const b = el("button", { class: "bv-btn main u3x-hold", text, attrs: { type: "button" } }) as HTMLButtonElement;
  let down = false;
  const set = (v: boolean): void => {
    if (v === down || (v && b.disabled)) return;
    down = v;
    b.classList.toggle("down", v);
    if (v) haptic(HAPTIC.tap);
    on(v);
  };
  // 누르는 동안 버튼이 잠기면(disabled) 버튼은 떼는 이벤트를 받지 못한다. 그래서 떼는 것은 창에서 듣는다.
  const up = (): void => {
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
    set(false);
  };
  b.addEventListener("pointerdown", () => {
    if (b.disabled) return;
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    set(true);
  });
  b.addEventListener("contextmenu", (e) => e.preventDefault());
  b.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") set(true);
  });
  b.addEventListener("keyup", () => set(false));
  b.addEventListener("blur", () => set(false));
  return b;
}

// ── 그리기 도우미 ───────────────────────────────────────────────
export function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  const q = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + q, y);
  ctx.arcTo(x + w, y, x + w, y + h, q);
  ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q);
  ctx.arcTo(x, y, x + w, y, q);
  ctx.closePath();
}

export function txt(ctx: Ctx, s: string, x: number, y: number, o: { size?: number; color?: string; align?: CanvasTextAlign; weight?: number } = {}): void {
  ctx.font = `${o.weight ?? 700} ${o.size ?? 12}px ${FONT}`;
  ctx.fillStyle = o.color ?? INK;
  ctx.textAlign = o.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
}

/** 알약 모양 표시. (x, y)는 가운데. dot을 주면 앞에 색 점이 붙는다. 너비를 돌려준다. */
export function pill(ctx: Ctx, s: string, x: number, y: number, o: { size?: number; color?: string; bg?: string; dot?: string } = {}): number {
  const size = o.size ?? 12.5;
  ctx.font = `700 ${size}px ${FONT}`;
  const tw = ctx.measureText(s).width;
  const w = tw + 20 + (o.dot ? 11 : 0);
  const h = size + 11;
  rr(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = o.bg ?? "rgba(255,255,255,.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.lineWidth = 1;
  ctx.stroke();
  if (o.dot) {
    ctx.fillStyle = o.dot;
    ctx.beginPath();
    ctx.arc(x - w / 2 + 12, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  txt(ctx, s, x + (o.dot ? 5.5 : 0), y + 0.5, { size, color: o.color ?? INK });
  return w;
}

/** 유리 비커(옆모습). 벽과 바닥만 그린다. 안의 물은 부르는 쪽이 먼저 그린다. */
export function beaker(ctx: Ctx, x: number, y: number, w: number, h: number, o: { color?: string; lw?: number; r?: number } = {}): void {
  const r = o.r ?? 9;
  ctx.strokeStyle = o.color ?? "rgba(205,225,250,.78)";
  ctx.lineWidth = o.lw ?? 2.4;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x, y + 4);
  ctx.lineTo(x, y + h - r);
  ctx.arcTo(x, y + h, x + r, y + h, r);
  ctx.lineTo(x + w - r, y + h);
  ctx.arcTo(x + w, y + h, x + w, y + h - r, r);
  ctx.lineTo(x + w, y + 4);
  ctx.lineTo(x + w + 4, y);
  ctx.stroke();
  // 왼쪽 위의 빛 줄기
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + 14);
  ctx.lineTo(x + 6, y + h * 0.5);
  ctx.stroke();
}

/** 물(반투명 면 + 수면 선). */
export function water(ctx: Ctx, x: number, top: number, w: number, bottom: number, rgba: string, line: string, r = 8): void {
  rr(ctx, x, top, w, bottom - top, r);
  ctx.fillStyle = rgba;
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x + 1, top);
  ctx.lineTo(x + w - 1, top);
  ctx.stroke();
}

export interface Graph {
  px: (t: number) => number;
  py: (v: number) => number;
}
/** 시간과 온도 그래프의 축. 왼쪽 위 (x, y), 크기 (w, h)는 그림 영역(축 안쪽)이다. */
export function graphAxes(ctx: Ctx, o: { x: number; y: number; w: number; h: number; tMax: number; vMin: number; vMax: number; ticks: number[]; xLabel: string; yLabel?: string }): Graph {
  const px = (t: number): number => o.x + (Math.min(t, o.tMax) / o.tMax) * o.w;
  const py = (v: number): number => o.y + o.h - ((v - o.vMin) / (o.vMax - o.vMin)) * o.h;
  ctx.strokeStyle = "rgba(255,255,255,.08)";
  ctx.lineWidth = 1;
  for (const v of o.ticks) {
    ctx.beginPath();
    ctx.moveTo(o.x, py(v));
    ctx.lineTo(o.x + o.w, py(v));
    ctx.stroke();
    txt(ctx, String(v), o.x - 5, py(v), { size: 12, color: SUB, align: "right", weight: 600 });
  }
  ctx.strokeStyle = "rgba(255,255,255,.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(o.x, o.y - 4);
  ctx.lineTo(o.x, o.y + o.h);
  ctx.lineTo(o.x + o.w + 4, o.y + o.h);
  ctx.stroke();
  txt(ctx, o.xLabel, o.x + o.w, o.y + o.h + 11, { size: 12, color: SUB, align: "right", weight: 600 });
  if (o.yLabel) txt(ctx, o.yLabel, o.x - 4, o.y - 13, { size: 12, color: SUB, align: "left", weight: 600 });
  return { px, py };
}

/** 꺾은선. pts는 [시간, 값]. */
export function graphLine(ctx: Ctx, g: Graph, pts: [number, number][], color: string, lw = 2.6): void {
  if (pts.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  pts.forEach(([t, v], i) => (i ? ctx.lineTo(g.px(t), g.py(v)) : ctx.moveTo(g.px(t), g.py(v))));
  ctx.stroke();
  const [lt, lv] = pts[pts.length - 1];
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(g.px(lt), g.py(lv), 3.4, 0, Math.PI * 2);
  ctx.fill();
}

/** 가열 장치(납작한 판). on이면 빨갛게 달아오른다. */
export function hotPlate(ctx: Ctx, x: number, y: number, w: number, on: number): void {
  rr(ctx, x, y, w, 9, 4);
  ctx.fillStyle = `rgb(${Math.round(70 + 185 * on)},${Math.round(78 + 30 * on)},${Math.round(96 - 30 * on)})`;
  ctx.fill();
  rr(ctx, x + 6, y + 9, w - 12, 12, 4);
  ctx.fillStyle = "#2A3A55";
  ctx.fill();
  if (on > 0.02) {
    const g = ctx.createLinearGradient(0, y - 16, 0, y);
    g.addColorStop(0, "rgba(255,120,60,0)");
    g.addColorStop(1, `rgba(255,120,60,${0.35 * on})`);
    ctx.fillStyle = g;
    ctx.fillRect(x, y - 16, w, 16);
  }
}

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
