// DotRenderer — Canvas 2D 발광점(프로토타입 A안 그대로).
// 역할 둘: ① WebGL 실패 시 자동 폴백 ② "입자의 눈" 뷰(입자 모형이 또렷이 보여야 하는 성취기준용).

import { hueFor } from "./palette";
import type { MatterRenderer } from "./types";
import type { MatterSim } from "../engine/matterSim";

// 발광점 스프라이트 캐시 — hue를 6도 단위로 양자화해 캐시 수를 묶는다.
const spriteCache = new Map<string, { cv: HTMLCanvasElement; size: number }>();
function sprite(T: number, r: number): { cv: HTMLCanvasElement; size: number } {
  const h = Math.round(hueFor(T) / 6) * 6;
  const key = `${h}_${r}`;
  const hit = spriteCache.get(key);
  if (hit) return hit;
  const size = Math.ceil(r * 6);
  const cv = document.createElement("canvas");
  const dpr = 2;
  cv.width = size * dpr;
  cv.height = size * dpr;
  const c = cv.getContext("2d")!;
  c.scale(dpr, dpr);
  const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,.96)");
  g.addColorStop(0.22, `hsla(${h},92%,74%,.95)`);
  g.addColorStop(0.45, `hsla(${h},90%,60%,.5)`);
  g.addColorStop(1, `hsla(${h},90%,55%,0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  const sp = { cv, size };
  spriteCache.set(key, sp);
  return sp;
}

export class DotRenderer implements MatterRenderer {
  readonly kind = "dot" as const;
  readonly ok = true;
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  /** 고체 격자 결합선 표시 여부(입자의 눈 뷰에서는 격자 구조가 단서). */
  bonds = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.resize();
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  draw(sim: MatterSim): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    const { sol } = sim.phases();
    if (this.bonds && sol > 0.03) {
      const h = Math.round(hueFor(sim.T));
      ctx.strokeStyle = `hsla(${h},75%,74%,${0.3 * sol})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const lim = sim.o.r * 3.1 * (sim.o.r * 3.1);
      for (const pr of sim.pairs) {
        const A = sim.parts[pr[0]];
        const B = sim.parts[pr[1]];
        const dx = A.x - B.x;
        const dy = A.y - B.y;
        if (dx * dx + dy * dy < lim) {
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(B.x, B.y);
        }
      }
      ctx.stroke();
    }
    const sp = sprite(sim.T, sim.o.r);
    const off = sp.size / 2;
    for (const p of sim.parts) ctx.drawImage(sp.cv, p.x - off, p.y - off, sp.size, sp.size);
  }

  dispose(): void {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }
}
