// [중2 Ⅲ v5] 빛과 파동 랩 공용: 랩 틀, 고정 설계 판(346×230) 캔버스, 무대 글자, 기록 칸.
// 뼈대는 b6Lab의 bvFrame 그대로다(질문 한 줄, 지금 할 일 두 줄, 무대 230, 높이 고정 조작 칸 208).
// 무대는 캔버스 한 장에 그린다. 설계 좌표는 늘 346×230이고 무대 폭이 달라지면 통째로 줄이거나 키운다(글자와 그림이 함께 간다).
// 광선은 ui/lightKit의 drawBeam만 쓴다(단원의 약속). 그리기 루프는 cleanup에서 반드시 멈춘다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import type { StepAPI } from "../../types";
import { bvFrame, type BvFrame } from "../bio6/b6Lab";
import { drawAngleArc } from "../../../ui/lightKit";

export const DW = 346;
export const DH = 230;
export const LX = {
  ink: "#E8EEF9",
  dim: "rgba(232,238,249,.62)",
  amber: "255,196,90", // 들어가는 빛의 각
  cyan: "126,214,255", // 반사한 빛, 꺾인 빛의 각
  gold: "#F0A422",
  red: "#FF6B6B",
  green: "#51CF66",
  blue: "#4DABF7",
  font: (px: number, w = 700): string => `${w} ${px}px Pretendard, system-ui, sans-serif`,
};
export const rad = (deg: number): number => (deg * Math.PI) / 180;
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

export interface LxStage {
  cv: HTMLCanvasElement;
  /** 그리기 함수를 걸고 루프를 돈다. 좌표는 설계 판(346×230) 기준이다. */
  run: (draw: (ctx: CanvasRenderingContext2D, tMs: number, dt: number) => void) => void;
  stop: () => void;
  /** 포인터 이벤트의 설계 판 좌표 */
  pt: (e: PointerEvent) => { x: number; y: number };
}

export function lxCanvas(stage: HTMLElement): LxStage {
  const cv = el("canvas", { class: "g2u3x-cv" }) as HTMLCanvasElement;
  stage.appendChild(cv);
  let cw = 0;
  let ch = 0;
  let dpr = 1;
  let k = 1;
  let ox = 0;
  let oy = 0;
  let ctx = cv.getContext("2d")!;
  const fit = (): void => {
    const w = cv.clientWidth || DW;
    const h = cv.clientHeight || DH;
    const d = Math.min(window.devicePixelRatio || 1, 2);
    if (w === cw && h === ch && d === dpr) return;
    cw = w;
    ch = h;
    dpr = d;
    cv.width = Math.round(w * d);
    cv.height = Math.round(h * d);
    ctx = cv.getContext("2d")!;
    k = Math.min(w / DW, h / DH);
    ox = (w - DW * k) / 2;
    oy = (h - DH * k) / 2;
  };
  let loop: Loop | null = null;
  return {
    cv,
    run(draw) {
      loop?.stop();
      loop = createLoop((dt, t) => {
        fit();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
        draw(ctx, t, dt);
      }).start();
    },
    stop() {
      loop?.stop();
      loop = null;
    },
    pt(e) {
      fit();
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left - ox) / k, y: (e.clientY - r.top - oy) / k };
    },
  };
}

/** 랩 틀. 빛 단원의 색을 입힌다. */
export function lxFrame(host: HTMLElement, o: { title: string; steps: number; api: Pick<StepAPI, "setCTA"> }): BvFrame {
  host.classList.add("g2u3x-step");
  return bvFrame(host, { title: o.title, steps: o.steps, cls: "g2u3x-stage", qCls: "g2u3x-q", api: o.api });
}

/** 무대 안의 글자(12.5px 이상, 어두운 테두리로 어느 바탕에서도 읽힌다). */
export function lxText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: { color?: string; px?: number; align?: CanvasTextAlign; w?: number } = {}): void {
  ctx.save();
  ctx.font = LX.font(o.px ?? 12.5, o.w ?? 700);
  ctx.textAlign = o.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(11,21,36,.88)";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = o.color ?? LX.ink;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** 무대 귀퉁이의 알림 필(지금 상태 한마디). right면 오른쪽 위. */
export function lxPill(ctx: CanvasRenderingContext2D, text: string, color = LX.gold, right = false, y = 10): void {
  ctx.save();
  ctx.font = LX.font(12.5);
  const ww = ctx.measureText(text).width + 28;
  const x = right ? DW - 10 - ww : 10;
  ctx.fillStyle = "rgba(11,21,36,.72)";
  ctx.strokeStyle = "rgba(255,255,255,.16)";
  ctx.beginPath();
  ctx.roundRect(x, y, ww, 26, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + 12, y + 13, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = LX.ink;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(text, x + 20, y + 13.5);
  ctx.restore();
}

/** 조작 칸의 기록 칸 줄(해 본 것이 차례로 채워진다). 칸마다 이름 한 줄과 값 한 줄. */
export interface LxLog {
  el: HTMLElement;
  set: (i: number, value: string, name?: string) => void;
  clear: (i: number) => void;
  cur: (i: number) => void;
  filled: () => number;
}
export function lxLog(names: string[], cls = ""): LxLog {
  const cells = names.map((n) => {
    const nm = el("span", { class: "g2u3x-log-n", text: n });
    const v = el("b", { class: "g2u3x-log-v", text: "" });
    return { box: el("div", { class: "g2u3x-log-c" }, nm, v), nm, v };
  });
  const box = el("div", { class: `g2u3x-log ${cls}` }, ...cells.map((c) => c.box));
  box.style.gridTemplateColumns = `repeat(${names.length}, 1fr)`;
  return {
    el: box,
    set(i, value, name) {
      if (name) cells[i].nm.textContent = name;
      cells[i].v.textContent = value;
      cells[i].box.classList.add("on");
      cells[i].box.classList.remove("cur");
    },
    clear(i) {
      cells[i].v.textContent = "";
      cells[i].box.classList.remove("on");
    },
    cur(i) {
      cells.forEach((c, k2) => c.box.classList.toggle("cur", k2 === i && !c.box.classList.contains("on")));
    },
    filled: () => cells.filter((c) => c.box.classList.contains("on")).length,
  };
}

/** 고르기 버튼 줄(하나만 켜진다). */
export interface LxSeg<T extends string> {
  el: HTMLElement;
  btns: Record<T, HTMLButtonElement>;
  set: (k: T) => void;
  value: () => T;
  done: (k: T) => void;
}
export function lxSeg<T extends string>(items: { k: T; t: string; sub?: string }[], init: T, onPick: (k: T) => void, cls = ""): LxSeg<T> {
  let cur = init;
  const btns = {} as Record<T, HTMLButtonElement>;
  const box = el("div", { class: `g2u3x-segs ${cls}` });
  box.style.gridTemplateColumns = `repeat(${items.length}, 1fr)`;
  const paint = (): void => {
    items.forEach((it) => btns[it.k].classList.toggle("on", it.k === cur));
  };
  items.forEach((it) => {
    const b = el("button", { class: "g2u3x-seg", attrs: { type: "button" } }, el("b", { text: it.t }), it.sub ? el("i", { text: it.sub }) : null) as HTMLButtonElement;
    b.dataset.k = it.k;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      cur = it.k;
      paint();
      onPick(it.k);
    });
    btns[it.k] = b;
    box.appendChild(b);
  });
  paint();
  return {
    el: box,
    btns,
    set(k) {
      cur = k;
      paint();
    },
    value: () => cur,
    done: (k) => btns[k].classList.add("done"),
  };
}

/** 어두운 바닥판(수조 바닥, 실험대). */
export function lxFloor(ctx: CanvasRenderingContext2D, y: number): void {
  const g = ctx.createLinearGradient(0, y, 0, DH);
  g.addColorStop(0, "rgba(120,150,200,.18)");
  g.addColorStop(1, "rgba(120,150,200,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, y, DW, DH - y);
  ctx.strokeStyle = "rgba(178,204,238,.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(DW, y);
  ctx.stroke();
}

/** 각 호와 도수. 각이 작아도 두 도수가 수직선 위에서 겹치지 않게 글자를 수직선에서 벌려 놓는다. nDir: 수직선의 방향, rayDir: 빛의 방향(라디안). */
export function lxAngle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, nDir: number, rayDir: number, rgb: string, label: string, labelR = r + 20): void {
  drawAngleArc(ctx, cx, cy, r, nDir, rayDir, rgb);
  let d = rayDir - nDir;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  const off = Math.sign(d || 1) * Math.max(Math.abs(d) / 2, 0.36);
  lxText(ctx, label, cx + Math.cos(nDir + off) * labelR, cy + Math.sin(nDir + off) * labelR, { color: `rgba(${rgb},1)`, w: 800 });
}
