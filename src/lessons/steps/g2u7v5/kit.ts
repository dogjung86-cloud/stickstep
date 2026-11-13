// [중2 Ⅶ v5] 전기와 자기 랩 공용: 틀, 고르기 버튼, 꾹 누르는 버튼, 기록 줄, 캔버스 글자.
// 뼈대는 bvFrame(질문 한 줄, 지금 할 일 두 줄, 무대 230, 높이 고정 조작 칸 208)을 그대로 쓴다.
// 캔버스 무대와 글자 도구는 중1 Ⅴ v5의 u5Kit에서 내보낸 것을 가져다 쓴다(다시 만들지 않는다).
// 전하와 회로 소품은 ui/elecKit(전자는 chemKit과 같은 파란 알갱이)만 쓴다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepAPI } from "../../types";
import { bvCapture, bvFrame, type BvFrame } from "../bio6/b6Lab";

export { u5Canvas as xCanvas, u5Text as xText, u5Pill as xPill, u5Read as xRead, clamp, type U5Stage as XStage } from "../u5v5/u5Kit";

export const X = {
  minus: "#6FB6FF", // 전자, (−)전기
  plus: "#FF9D8A", // (+)전기
  cur: "#FFD400", // 전류(구리 코일과 헷갈리지 않게 볼트 옐로. 코일 위에서는 진갈색 테두리를 두른다)
  field: "#FF7B6B", // 자기장
  force: "#3FD6C0", // 힘
  ink: "#E8EEF9",
  dim: "rgba(232,238,249,.55)",
  line: "rgba(178,204,238,.5)",
};

export interface LabStep {
  title: string;
  cta?: string;
}

/** 랩 틀. 전기 단원의 색을 입힌다. */
export function xFrame(host: HTMLElement, o: { title: string; steps: number; api: Pick<StepAPI, "setCTA"> }): BvFrame {
  host.classList.add("g2u7x-step");
  return bvFrame(host, { title: o.title, steps: o.steps, cls: "g2u7x-stage", qCls: "g2u7x-q", api: o.api });
}

/** 고르기 버튼 한 줄(48px). 하나만 켜진다. guard가 false를 돌려주면 바뀌지 않는다. */
export interface XSegs<K extends string> {
  el: HTMLElement;
  value: () => K;
  set: (k: K) => void;
  lock: (v: boolean) => void;
  btn: (k: K) => HTMLButtonElement;
}
export function xSegs<K extends string>(items: { k: K; t: string }[], init: K, onPick: (k: K) => void, guard?: (k: K) => boolean): XSegs<K> {
  let cur = init;
  const btns = new Map<K, HTMLButtonElement>();
  const row = el("div", { class: "g2u7x-segs" });
  row.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
  const paint = (): void => btns.forEach((b, k) => b.classList.toggle("on", k === cur));
  items.forEach((it) => {
    const b = el("button", { class: "g2u7x-seg", text: it.t, attrs: { type: "button" } }) as HTMLButtonElement;
    b.dataset.k = it.k;
    b.addEventListener("click", () => {
      if (it.k === cur) return;
      if (guard && !guard(it.k)) return;
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
export function xRow(...nodes: HTMLElement[]): HTMLElement {
  const row = el("div", { class: "g2u7x-row" }, ...nodes);
  row.style.gridTemplateColumns = `repeat(${nodes.length}, 1fr)`;
  return row;
}

/** 조작 칸의 작은 글(한 줄). */
export function xCap(text: string): HTMLElement {
  return el("div", { class: "g2u7x-cap", html: text });
}

/** 꾹 누르는 동안 켜지는 버튼. 손을 떼거나 밖으로 나가면 꺼진다. 키보드는 누를 때마다 켜고 끈다. */
export function xHold(cls: string, text: string, on: (held: boolean) => void): HTMLButtonElement {
  const b = el("button", { class: `bv-btn g2u7x-hold ${cls}`, text, attrs: { type: "button" } }) as HTMLButtonElement;
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
export interface XLog {
  el: HTMLElement;
  set: (i: number, value: string) => void;
  /** 줄을 다시 비운다(조건을 바꿔 다시 잴 때). */
  clear: (i: number) => void;
  has: (i: number) => boolean;
}
export function xLog(rows: string[], cols = 1, tight = false): XLog {
  const items = rows.map((name) => {
    const v = el("b", { class: "g2u7x-log-v", text: "아직" });
    return { row: el("div", { class: "g2u7x-log-row" }, el("span", { class: "g2u7x-log-n", text: name }), v), v, on: false };
  });
  const box = el("div", { class: `g2u7x-log${tight ? " tight" : ""}` }, ...items.map((i) => i.row));
  box.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  return {
    el: box,
    set(i, value) {
      items[i].v.textContent = value;
      items[i].row.classList.add("on");
      items[i].on = true;
    },
    clear(i) {
      items[i].v.textContent = "아직";
      items[i].row.classList.remove("on");
      items[i].on = false;
    },
    has: (i) => items[i].on,
  };
}

/** 화살표(캔버스). 머리는 끝점에 붙는다. */
export function xArrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, w = 3, head = 9): void {
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1 - Math.cos(a) * head * 0.7, y1 - Math.sin(a) * head * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head);
  ctx.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** (+) 또는 (−) 기호만 있는 작은 표시(전하 분포를 보일 때). */
export function xSign(ctx: CanvasRenderingContext2D, x: number, y: number, plus: boolean, r = 6, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = plus ? "#E8836B" : "#4C9AF0";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y);
  ctx.lineTo(x + r * 0.5, y);
  if (plus) {
    ctx.moveTo(x, y - r * 0.5);
    ctx.lineTo(x, y + r * 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

/** 둥근 사각형 채우기(테두리 선택). */
export function xBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 1.5): void {
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
