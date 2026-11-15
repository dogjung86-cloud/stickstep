// [중1 Ⅴ v5] 힘 단원 랩 공용: 캔버스 무대, 숫자 표시, 꾹 누르는 버튼, 기록 줄.
// 뼈대는 Ⅱ단원의 bvFrame을 그대로 쓴다(질문 한 줄, 지금 할 일 두 줄, 무대 230, 높이 고정 조작 칸 208).
// 무대는 지금까지의 힘 단원처럼 캔버스에 그린다(ui/forceProps의 화살표, 용수철, 밧줄, 상자와 ui/stick의 막대 인물).
// 그리기 루프는 core/anim의 Loop를 쓰고 cleanup에서 반드시 멈춘다.

import { localPt, stageDpr } from "../../../core/wide";
import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawForceArrow } from "../../../ui/forceProps";
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
      return localPt(cv, e.clientX, e.clientY); // 넓은 화면의 확대(zoom)를 되돌린 무대 px
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

/** 힘 화살표(ui/forceProps의 drawForceArrow) 둘레에 테를 먼저 두른다. 물체(상자, 추, 용수철) 위를 지나는 화살표가 묻히지 않게.
 *  테 색의 기본은 무대 바탕색(어두운 남색)이라 빈 무대 위에서는 보이지 않고 물체 위에서만 화살표의 가장자리가 선다. halo에 색을 주면 그 색으로.
 *  화살표의 약속(단원 전체): 시작점 = 작용점(물체에 닿은 자리나 물체 가운데), 길이 = 값에 비례(덧붙이는 길이 없이),
 *  색 = 가한 힘 파랑(U5.push), 중력과 방해하는 힘과 되당기는 힘 빨강(U5.back), 떠받치는 힘과 부력과 합친 힘 초록(U5.up). */
export function u5Arrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, o: { color: string; width?: number; alpha?: number; halo?: boolean | string; dash?: boolean }): void {
  const len = Math.hypot(dx, dy);
  if (len < 3) return;
  const w = o.width ?? 4;
  const a = o.alpha ?? 1;
  const ux = dx / len;
  const uy = dy / len;
  const headL = Math.min(16, 8 + len * 0.12); // drawForceArrow와 같은 촉 길이
  const tipX = x + dx;
  const tipY = y + dy;
  if (o.dash) {
    // 옅은 점선 화살표(견주어 보는 자리, 다른 장면의 값). 촉은 속이 빈 꼴
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = o.color;
    ctx.lineWidth = Math.max(2, w * 0.6);
    ctx.lineCap = "round";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tipX - ux * headL, tipY - uy * headL);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - ux * headL - uy * headL * 0.52, tipY - uy * headL + ux * headL * 0.52);
    ctx.lineTo(tipX - ux * headL + uy * headL * 0.52, tipY - uy * headL - ux * headL * 0.52);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (o.halo !== false) {
    const hc = typeof o.halo === "string" ? o.halo : "#0B1524";
    ctx.save();
    ctx.globalAlpha = 0.92 * a;
    ctx.strokeStyle = hc;
    ctx.fillStyle = hc;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = w + 3.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tipX - ux * (headL - 2), tipY - uy * (headL - 2));
    ctx.stroke();
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - ux * headL - uy * headL * 0.52, tipY - uy * headL + ux * headL * 0.52);
    ctx.lineTo(tipX - ux * headL + uy * headL * 0.52, tipY - uy * headL - ux * headL * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2.6, w * 0.6) + 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  drawForceArrow(ctx, x, y, dx, dy, { color: o.color, width: w, alpha: a });
}

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
