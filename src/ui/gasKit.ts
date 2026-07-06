// gasKit — VI 단원(기체) 공용: 상자 속 자유 입자 물리 + 발광 입자·충돌 플래시 렌더.
// 입자 수·속력 배율·경계를 밖에서 조종하고, 벽 충돌을 집계해 "압력" 게이지로 쓴다.
// 렌더는 thermo의 발광 입자 문법(코어+글로우)을 따른다.

export interface GasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GasBounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface WallFlash {
  x: number;
  y: number;
  side: "L" | "R" | "T" | "B";
  age: number; // 0..1
}

export class GasBox {
  parts: GasParticle[] = [];
  flashes: WallFlash[] = [];
  hits = { L: 0, R: 0, T: 0, B: 0 }; // 누적 충돌(면별)
  hitWindow: number[] = []; // 최근 프레임별 충돌 수(압력 게이지용)
  baseSpeed: number;

  constructor(baseSpeed = 1.1) {
    this.baseSpeed = baseSpeed;
  }

  setCount(n: number, b: GasBounds): void {
    while (this.parts.length < n) {
      const a = Math.random() * Math.PI * 2;
      const sp = this.baseSpeed * (0.75 + Math.random() * 0.5);
      this.parts.push({
        x: b.x0 + 8 + Math.random() * (b.x1 - b.x0 - 16),
        y: b.y0 + 8 + Math.random() * (b.y1 - b.y0 - 16),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
      });
    }
    if (this.parts.length > n) this.parts.length = n;
  }

  /** speedScale: 온도 비례 속력 배율(샤를), 1=기준. dt: 프레임(≈1). */
  step(dt: number, b: GasBounds, speedScale = 1): number {
    let frameHits = 0;
    for (const p of this.parts) {
      p.x += p.vx * speedScale * dt;
      p.y += p.vy * speedScale * dt;
      if (p.x < b.x0 + 4) {
        p.x = b.x0 + 4;
        p.vx = Math.abs(p.vx);
        this.hits.L++;
        frameHits++;
        this.flashes.push({ x: b.x0 + 2, y: p.y, side: "L", age: 0 });
      } else if (p.x > b.x1 - 4) {
        p.x = b.x1 - 4;
        p.vx = -Math.abs(p.vx);
        this.hits.R++;
        frameHits++;
        this.flashes.push({ x: b.x1 - 2, y: p.y, side: "R", age: 0 });
      }
      if (p.y < b.y0 + 4) {
        p.y = b.y0 + 4;
        p.vy = Math.abs(p.vy);
        this.hits.T++;
        frameHits++;
        this.flashes.push({ x: p.x, y: b.y0 + 2, side: "T", age: 0 });
      } else if (p.y > b.y1 - 4) {
        p.y = b.y1 - 4;
        p.vy = -Math.abs(p.vy);
        this.hits.B++;
        frameHits++;
        this.flashes.push({ x: p.x, y: b.y1 - 2, side: "B", age: 0 });
      }
    }
    // 충돌률 창(최근 60프레임)
    this.hitWindow.push(frameHits);
    if (this.hitWindow.length > 60) this.hitWindow.shift();
    // 플래시 노화
    for (const f of this.flashes) f.age += 0.06 * dt;
    this.flashes = this.flashes.filter((f) => f.age < 1);
    return frameHits;
  }

  /** 최근 1초 충돌 수(게이지 원료) */
  hitRate(): number {
    return this.hitWindow.reduce((a, x) => a + x, 0);
  }

  draw(ctx: CanvasRenderingContext2D, hue = 205, speedScale = 1): void {
    // 입자(발광점 — 코어 + 글로우), 속력 배율이 크면 살짝 더 밝게
    for (const p of this.parts) {
      const r = 4.6;
      const glow = ctx.createRadialGradient(p.x, p.y, 0.5, p.x, p.y, r * 3.2);
      glow.addColorStop(0, `hsla(${hue}, 90%, 72%, ${0.5 + 0.15 * (speedScale - 1)})`);
      glow.addColorStop(1, `hsla(${hue}, 90%, 60%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
      ctx.fill();
      const core = ctx.createRadialGradient(p.x - 1.2, p.y - 1.4, 0.4, p.x, p.y, r);
      core.addColorStop(0, "#FFFFFF");
      core.addColorStop(0.45, `hsla(${hue}, 92%, 78%, .98)`);
      core.addColorStop(1, `hsla(${hue}, 88%, 56%, .92)`);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
      // 꼬리(속도 방향 반대) — 빠를수록 길게
      ctx.strokeStyle = `hsla(${hue}, 90%, 75%, .35)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * speedScale * 4.5, p.y - p.vy * speedScale * 4.5);
      ctx.stroke();
    }
    // 벽 충돌 플래시
    for (const f of this.flashes) {
      const a = (1 - f.age) * 0.55;
      const len = 10 + f.age * 8;
      ctx.strokeStyle = `rgba(255,214,138,${a.toFixed(3)})`;
      ctx.lineWidth = 3 - f.age * 2;
      ctx.beginPath();
      if (f.side === "L" || f.side === "R") {
        ctx.moveTo(f.x, f.y - len / 2);
        ctx.lineTo(f.x, f.y + len / 2);
      } else {
        ctx.moveTo(f.x - len / 2, f.y);
        ctx.lineTo(f.x + len / 2, f.y);
      }
      ctx.stroke();
    }
  }
}
