// u6Kit: 중1 Ⅵ v5 랩 다섯 판이 함께 쓰는 무대 도구.
// 뼈대는 Ⅱ단원과 같은 bvFrame(질문 한 줄, 도움말 두 줄, 무대 230px, 높이 고정 조작 칸 208px)이다.
// 무대는 캔버스 하나다. 346×230 설계 좌표로 그리고, 무대 폭이 달라지면 통째로 비율을 맞춘다.
// 입자는 ui/gasKit의 GasBox(자유 입자, 벽 충돌 번쩍임, 충돌 수)를 그대로 쓴다.
import { stageDpr } from "../../../core/wide";
import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { bvFrame, bvTimers, type BvFrame, type BvTimers } from "../bio6/b6Lab";
import type { StepAPI } from "../../types";

export const SW = 346;
export const SH = 230;
export const FONT = `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif`;

export type Draw = (ctx: CanvasRenderingContext2D, dt: number, tMs: number) => void;

export interface U6Lab {
  frame: BvFrame;
  tm: BvTimers;
  cv: HTMLCanvasElement;
  /** 그리기 루프를 건다(한 번만). */
  run: (draw: Draw) => void;
  /** 화면 좌표를 설계 좌표(346×230)로 바꾼다. */
  toDesign: (clientX: number, clientY: number) => { x: number; y: number };
  /** 검사 도구가 읽는 국면 표식 */
  phase: (name: string) => void;
  /** 랩마다 첫 채점 판정 한 번만 기록한다. */
  grade: (ok: boolean) => void;
  cleanup: () => void;
}

export function u6Lab(host: HTMLElement, api: StepAPI, o: { title: string; steps: number; cls: string; label: string; wait: string }): U6Lab {
  host.classList.add("u6x-step");
  const frame = bvFrame(host, { title: o.title, steps: o.steps, cls: `u6x-stage ${o.cls}`, qCls: "u6x-q", api });
  const cv = el("canvas", { class: "u6x-cv", attrs: { role: "img", "aria-label": o.label } }) as HTMLCanvasElement;
  frame.stage.appendChild(cv);
  api.setCTA(o.wait, { enabled: false });
  const tm = bvTimers();
  let loop: Loop | null = null;
  let cw = 0;
  let ch = 0;
  let k = 1;
  let oy = 0;
  let dpr = 1;
  const fit = (): CanvasRenderingContext2D | null => {
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    if (!w || !h) return null;
    if (w !== cw || h !== ch) {
      cw = w;
      ch = h;
      dpr = stageDpr();
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      k = Math.min(w / SW, h / SH);
      oy = (h - SH * k) / 2;
    }
    return cv.getContext("2d");
  };
  let graded = false;
  return {
    frame,
    tm,
    cv,
    run(draw) {
      if (loop) return;
      loop = createLoop((dt, t) => {
        const ctx = fit();
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.setTransform(dpr * k, 0, 0, dpr * k, (dpr * (cw - SW * k)) / 2, dpr * oy);
        draw(ctx, dt, t);
      }).start();
    },
    toDesign(clientX, clientY) {
      const r = cv.getBoundingClientRect();
      return { x: (clientX - r.left - (cw - SW * k) / 2) / k, y: (clientY - r.top - oy) / k };
    },
    phase(name) {
      host.dataset.u6Phase = name;
    },
    grade(ok) {
      if (graded) return;
      graded = true;
      api.recordQuiz(ok);
    },
    cleanup() {
      loop?.stop();
      loop = null;
      tm.clear();
    },
  };
}

// ── 그리기 도우미 ───────────────────────────────────────────────────
export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const q = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + q, y);
  ctx.arcTo(x + w, y, x + w, y + h, q);
  ctx.arcTo(x + w, y + h, x, y + h, q);
  ctx.arcTo(x, y + h, x, y, q);
  ctx.arcTo(x, y, x + w, y, q);
  ctx.closePath();
}

export function txt(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  o: { size?: number; color?: string; align?: CanvasTextAlign; weight?: number; base?: CanvasTextBaseline } = {},
): void {
  ctx.font = `${o.weight ?? 700} ${o.size ?? 12}px ${FONT}`;
  ctx.fillStyle = o.color ?? "#C9D6EC";
  ctx.textAlign = o.align ?? "left";
  ctx.textBaseline = o.base ?? "middle";
  ctx.fillText(s, x, y);
}

/** 알약 모양 이름표(무대 안의 값 읽기). 돌려주는 값은 폭. */
export function pill(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, o: { dot?: string; size?: number; align?: "left" | "right"; bg?: string; color?: string } = {}): number {
  const size = o.size ?? 12.5;
  ctx.font = `700 ${size}px ${FONT}`;
  const w = ctx.measureText(s).width + (o.dot ? 30 : 20);
  const x0 = o.align === "right" ? x - w : x;
  rr(ctx, x0, y, w, 26, 13);
  ctx.fillStyle = o.bg ?? "rgba(255,255,255,.09)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.lineWidth = 1;
  ctx.stroke();
  if (o.dot) {
    ctx.fillStyle = o.dot;
    ctx.beginPath();
    ctx.arc(x0 + 13, y + 13, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  txt(ctx, s, x0 + (o.dot ? 21 : 10), y + 13.5, { size, color: o.color ?? "#E8EEF9" });
  return w;
}

/** 세로 막대 계기(0~1). 이름은 위, 값 글자는 아래. */
export function vbar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, v: number, color: string): void {
  rr(ctx, x, y, w, h, w / 2);
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.fill();
  const fh = Math.max(w, h * Math.max(0, Math.min(1, v)));
  rr(ctx, x, y + h - fh, w, fh, w / 2);
  ctx.fillStyle = color;
  ctx.fill();
}

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
export const ease = (cur: number, to: number, rate: number, dt: number): number => cur + (to - cur) * Math.min(1, rate * dt);

// ── 둥근 그릇 속 입자(방울, 풍선) ──────────────────────────────────
export interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
/** 반지름 r인 원 안에 입자 n개를 뿌린다(가운데 기준 좌표). */
export function dots(n: number, r: number, speed = 1): Dot[] {
  return Array.from({ length: n }, () => {
    const a = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random()) * (r - 6);
    const va = Math.random() * Math.PI * 2;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, vx: Math.cos(va) * speed, vy: Math.sin(va) * speed };
  });
}
/** 원 안에서 움직이고 벽에서 튕긴다. 벽에 부딪힌 횟수를 돌려준다. */
export function stepDots(ps: Dot[], r: number, dt: number, scale = 1): number {
  let hits = 0;
  const lim = Math.max(2, r - 4);
  for (const p of ps) {
    p.x += p.vx * scale * dt;
    p.y += p.vy * scale * dt;
    const d = Math.hypot(p.x, p.y);
    if (d > lim) {
      const nx = p.x / d;
      const ny = p.y / d;
      const dot = p.vx * nx + p.vy * ny;
      if (dot > 0) {
        p.vx -= 2 * dot * nx;
        p.vy -= 2 * dot * ny;
        hits++;
      }
      p.x = nx * lim;
      p.y = ny * lim;
    }
  }
  return hits;
}
export function drawDots(ctx: CanvasRenderingContext2D, ps: Dot[], cx: number, cy: number, hue = 205, r = 3.4): void {
  for (const p of ps) {
    const x = cx + p.x;
    const y = cy + p.y;
    const g = ctx.createRadialGradient(x, y, 0.4, x, y, r * 2.8);
    g.addColorStop(0, `hsla(${hue}, 90%, 74%, .5)`);
    g.addColorStop(1, `hsla(${hue}, 90%, 60%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsl(${hue}, 92%, 80%)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** 조작 칸의 한 줄 안내(값 읽기). 조각마다 가운뎃점으로 나뉜다. */
export function noteRow(): { el: HTMLElement; set: (...parts: string[]) => void } {
  const node = el("div", { class: "u6x-note" });
  return { el: node, set: (...parts) => (node.innerHTML = parts.map((p) => `<span>${p}</span>`).join("")) };
}
/** 해 볼 일 표시(끝내면 체크). */
export function chip(text: string): { el: HTMLElement; done: () => void } {
  const node = el("div", { class: "u6x-chip", text });
  return { el: node, done: () => node.classList.add("done") };
}

/** 벽 충돌의 잦기: 최근 한동안(프레임 100개 분량의 시간)의 충돌 수를 흐른 시간으로 나눈다. 화면이 느려도 값이 같다. */
export class HitRate {
  private win: [number, number][] = [];
  private hits = 0;
  private time = 0;
  push(hits: number, dt: number): void {
    this.win.push([hits, dt]);
    this.hits += hits;
    this.time += dt;
    while (this.time > 100 && this.win.length > 1) {
      const [h, t] = this.win.shift()!;
      this.hits -= h;
      this.time -= t;
    }
  }
  /** 프레임 하나(1/60초)마다의 충돌 수 */
  value(): number {
    return this.time > 0 ? this.hits / this.time : 0;
  }
}
