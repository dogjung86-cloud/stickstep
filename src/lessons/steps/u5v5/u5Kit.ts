// [중1 Ⅴ v5] 힘 단원 랩 공용: 캔버스 무대, 숫자 표시, 꾹 누르는 버튼, 기록 줄.
// 뼈대는 Ⅱ단원의 bvFrame을 그대로 쓴다(질문 한 줄, 지금 할 일 두 줄, 무대 230, 높이 고정 조작 칸 208).
// 무대는 지금까지의 힘 단원처럼 캔버스에 그린다(ui/forceProps의 화살표, 용수철, 밧줄, 상자와 ui/stick의 막대 인물).
// 그리기 루프는 core/anim의 Loop를 쓰고 cleanup에서 반드시 멈춘다.

import { stageDpr } from "../../../core/wide";
import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepAPI } from "../../types";
import { bvCapture, bvFrame, type BvFrame } from "../bio6/b6Lab";

export const U5 = {
  push: "#5AA2F8", // 가한 힘(파랑)
  back: "#F25757", // 되받는 힘, 방해하는 힘(빨강)
  up: "#37C08E", // 떠받치는 힘(초록)
  gold: "#F0A422",
  ink: "#E8EEF9",
  dim: "rgba(232,238,249,.55)",
  font: (px: number, w = 700): string => `${w} ${px}px Pretendard, system-ui, sans-serif`,
};

export interface U5Stage {
  cv: HTMLCanvasElement;
  /** 그리기 함수를 걸고 루프를 돈다. w, h는 CSS px. */
  run: (draw: (ctx: CanvasRenderingContext2D, w: number, h: number, tMs: number, dt: number) => void) => void;
  stop: () => void;
  /** 포인터 이벤트의 무대 안 좌표 */
  pt: (e: PointerEvent) => { x: number; y: number };
  w: () => number;
  h: () => number;
}

/** 무대에 캔버스 한 장을 깔고 돌린다. 크기가 바뀌면 다음 프레임에 스스로 맞춘다. */
export function u5Canvas(stage: HTMLElement): U5Stage {
  const cv = el("canvas", { class: "u5x-cv" }) as HTMLCanvasElement;
  stage.appendChild(cv);
  let w = 346;
  let h = 230;
  let dpr = 1;
  let ctx = cv.getContext("2d")!;
  const fit = (): void => {
    const cw = cv.clientWidth || 346;
    const ch = cv.clientHeight || 230;
    const d = stageDpr();
    if (cw === w && ch === h && d === dpr && cv.width === Math.round(cw * d)) return;
    w = cw;
    h = ch;
    dpr = d;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx = cv.getContext("2d")!;
  };
  let loop: Loop | null = null;
  return {
    cv,
    run(draw) {
      loop?.stop();
      loop = createLoop((dt, t) => {
        fit();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        draw(ctx, w, h, t, dt);
      }).start();
    },
    stop() {
      loop?.stop();
      loop = null;
    },
    pt(e) {
      const r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    },
    w: () => w,
    h: () => h,
  };
}

/** 랩 틀. 힘 단원의 색을 입힌다. */
export function u5Frame(host: HTMLElement, o: { title: string; steps: number; api: Pick<StepAPI, "setCTA"> }): BvFrame {
  host.classList.add("u5x-step");
  return bvFrame(host, { title: o.title, steps: o.steps, cls: "u5x-stage", qCls: "u5x-q", api: o.api });
}

/** 무대 오른쪽 위의 큰 숫자(힘 센서의 값 등). */
export function u5Read(ctx: CanvasRenderingContext2D, w: number, value: string, unit: string, label?: string): void {
  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = U5.dim;
  ctx.font = U5.font(13);
  const uw = ctx.measureText(unit).width;
  ctx.fillText(unit, w - 14, 36);
  ctx.fillStyle = "#fff";
  ctx.font = U5.font(26, 800);
  ctx.fillText(value, w - 18 - uw, 36);
  if (label) {
    ctx.fillStyle = U5.dim;
    ctx.font = U5.font(12, 600);
    ctx.fillText(label, w - 14, 53);
  }
  ctx.restore();
}

/** 무대 안의 작은 글자(12px 이상). */
export function u5Text(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: { color?: string; px?: number; align?: CanvasTextAlign; w?: number } = {}): void {
  ctx.save();
  ctx.font = U5.font(o.px ?? 12.5, o.w ?? 700);
  ctx.textAlign = o.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(11,21,36,.85)";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = o.color ?? U5.ink;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** 무대 왼쪽 위의 알림 필(지금 상태 한마디). */
export function u5Pill(ctx: CanvasRenderingContext2D, text: string, color = U5.gold): void {
  ctx.save();
  ctx.font = U5.font(12.5);
  const tw = ctx.measureText(text).width;
  const x = 12;
  const y = 12;
  const hh = 26;
  const ww = tw + 28;
  ctx.fillStyle = "rgba(255,255,255,.09)";
  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.beginPath();
  ctx.roundRect(x, y, ww, hh, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + 12, y + hh / 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = U5.ink;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 20, y + hh / 2 + 0.5);
  ctx.restore();
}

/** 꾹 누르는 동안 켜지는 버튼(48px 이상). 손을 떼거나 밖으로 나가면 꺼진다. */
export function u5Hold(cls: string, text: string, on: (held: boolean) => void): HTMLButtonElement {
  const b = el("button", { class: `bv-btn u5x-hold ${cls}`, text, attrs: { type: "button" } }) as HTMLButtonElement;
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
  b.addEventListener("contextmenu", (e) => e.preventDefault());
  return b;
}

/** 조작 칸에 놓는 기록 줄(해 본 것이 차례로 채워진다). */
export interface U5Log {
  el: HTMLElement;
  set: (i: number, value: string, note?: string) => void;
  mark: (i: number) => void;
}
export function u5Log(rows: { name: string; hint?: string }[], cols = 1): U5Log {
  const items = rows.map((r) => {
    const v = el("b", { class: "u5x-log-v", text: r.hint ?? "" });
    const row = el("div", { class: "u5x-log-row" }, el("span", { class: "u5x-log-n", text: r.name }), v);
    return { row, v };
  });
  const box = el("div", { class: "u5x-log" }, ...items.map((i) => i.row));
  box.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  return {
    el: box,
    set(i, value, note) {
      items[i].v.textContent = note ? `${value} · ${note}` : value;
      items[i].row.classList.add("on");
      items[i].row.classList.remove("cur");
    },
    mark(i) {
      items.forEach((it, k) => it.row.classList.toggle("cur", k === i && !it.row.classList.contains("on")));
    },
  };
}

export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

/** 바닥(밝은 선 + 아래 어두운 흙). */
export function u5Floor(ctx: CanvasRenderingContext2D, w: number, y: number, h: number, tone = "rgba(178,204,238,.5)"): void {
  const g = ctx.createLinearGradient(0, y, 0, h);
  g.addColorStop(0, "rgba(120,150,200,.16)");
  g.addColorStop(1, "rgba(120,150,200,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, y, w, h - y);
  ctx.strokeStyle = tone;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.stroke();
}
