// 물질의 상태 변화(IV) 입자 엔진 — sample 프로토타입의 Sim을 그대로 이식한 순수 물리.
// 렌더링 코드 없음: 렌더러(renderers/*)는 parts 배열만 읽는다.
// 수치는 프로토타입(renderer-comparison.html·science-app-prototype.html)에서 확정된 값 — 바꾸지 말 것.
//   상: sol = 1-smooth(-2,3,T) · gas = smooth(96,104,T) (T ℃, 물 기준 녹는점 0 / 끓는점 100)
//   격자 간격 r*2.35, 스프링 0.09·sol, 반발 minD r*2.05, 인력 반경 r*3.6, 속도캡 5.5

import { clamp, smooth } from "../core/dom";

export interface MatterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** 입자가 갇히는 사각 영역(그릇). */
export interface SimBounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** 그릇 모양 — 스테이지 크기(w,h)를 받아 내부 영역을 돌려준다. */
export type WallsFn = (w: number, h: number) => SimBounds;

export interface MatterSimOpts {
  count: number; // 입자 수(메타볼 셰이더 상한 48)
  r: number; // 입자 반지름(px)
  pad: number; // walls가 없을 때 기본 여백
  cols: number; // 격자 열 수(0이면 자동)
  temp: number; // 초기 온도(℃)
  walls: WallsFn | null;
}

export interface Phases {
  sol: number;
  liq: number;
  gas: number;
}

const DEFAULTS: MatterSimOpts = { count: 44, r: 6.5, pad: 16, cols: 0, temp: -20, walls: null };

/** 상 혼합비 — 온도만으로 결정되는 순수 함수. */
export function phasesFor(T: number): Phases {
  const sol = 1 - smooth(-2, 3, T);
  const gas = smooth(96, 104, T);
  return { sol, liq: Math.max(0, 1 - sol - gas), gas };
}

export class MatterSim {
  readonly o: MatterSimOpts;
  w: number;
  h: number;
  T: number;
  parts: MatterParticle[] = [];
  homes: { x: number; y: number }[] = [];
  pairs: [number, number][] = [];

  constructor(w: number, h: number, opts?: Partial<MatterSimOpts>) {
    this.o = { ...DEFAULTS, ...opts };
    this.w = w;
    this.h = h;
    this.T = this.o.temp;
    this.buildLattice(true);
  }

  setSize(w: number, h: number): void {
    this.w = w;
    this.h = h;
    this.buildLattice(false);
  }

  setTemp(t: number): void {
    this.T = t;
  }

  /** 그릇 교체(컵→접시 등). 격자 홈만 다시 계산하고 입자는 새 영역으로 밀어 넣는다. */
  setWalls(fn: WallsFn | null): void {
    this.o.walls = fn;
    this.buildLattice(false);
  }

  bounds(): SimBounds {
    if (this.o.walls) return this.o.walls(this.w, this.h);
    const p = this.o.pad;
    return { x0: p, y0: p, x1: this.w - p, y1: this.h - p };
  }

  buildLattice(seed: boolean): void {
    const b = this.bounds();
    const n = this.o.count;
    const r = this.o.r;
    const cols = this.o.cols || Math.max(3, Math.round(Math.sqrt(n * 1.7)));
    const sp = r * 2.35;
    const bw = (cols - 1) * sp;
    const cx = (b.x0 + b.x1) / 2;
    const baseY = b.y1 - r - 2;
    this.homes = [];
    this.pairs = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      this.homes.push({ x: cx - bw / 2 + col * sp, y: baseY - row * sp * 0.9 });
    }
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols);
      if (i % cols < cols - 1 && i + 1 < n && Math.floor((i + 1) / cols) === row) this.pairs.push([i, i + 1]);
      if (i + cols < n) this.pairs.push([i, i + cols]);
    }
    if (seed) {
      this.parts = [];
      for (let i = 0; i < n; i++) this.parts.push({ x: this.homes[i].x, y: this.homes[i].y, vx: 0, vy: 0 });
    } else {
      for (const p of this.parts) {
        p.x = clamp(p.x, b.x0 + r, b.x1 - r);
        p.y = clamp(p.y, b.y0 + r, b.y1 - r);
      }
    }
  }

  phases(): Phases {
    return phasesFor(this.T);
  }

  step(dt: number): void {
    const { sol, liq, gas } = this.phases();
    const b = this.bounds();
    const r = this.o.r;
    const P = this.parts;
    const k = clamp((this.T + 20) / 140, 0, 1);
    const kick = (0.06 + k * k * 1.15) * dt;
    const grav = 0.16 * (1 - sol) * (1 - gas) * dt;
    const damp = Math.pow(0.88 + 0.105 * Math.min(1, liq + gas), dt);
    const spring = 0.09 * sol;
    const minD = r * 2.05;
    const attR = r * 3.6;
    for (let i = 0; i < P.length; i++) {
      for (let j = i + 1; j < P.length; j++) {
        const A = P[i];
        const B = P[j];
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > attR * attR || d2 === 0) continue;
        const d = Math.sqrt(d2);
        if (d < minD) {
          // 겹침 반발 — 고체일수록 격자(스프링)에 맡기고 약하게
          const push = ((minD - d) / d) * 0.42 * (1 - sol * 0.85);
          const px = dx * push;
          const py = dy * push;
          A.x -= px;
          A.y -= py;
          B.x += px;
          B.y += py;
        } else if (liq > 0.05) {
          // 액체 인력 — 방울이 서로 붙는 표면장력의 원천
          const pull = (0.0032 * liq * dt) / d;
          A.vx += dx * pull;
          A.vy += dy * pull;
          B.vx -= dx * pull;
          B.vy -= dy * pull;
        }
      }
    }
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      const home = this.homes[i];
      if (sol > 0.002) {
        p.vx += (home.x - p.x) * spring * dt;
        p.vy += (home.y - p.y) * spring * dt;
      }
      p.vy += grav;
      const kf = sol > 0.5 ? 0.85 : 1;
      p.vx += (Math.random() - 0.5) * 2 * kick * kf;
      p.vy += (Math.random() - 0.5) * 2 * kick * kf;
      if (gas > 0.01) {
        // 기체 목표 속력으로 서서히 수렴 — 사방으로 나는 자유 운동
        const spd = Math.hypot(p.vx, p.vy) || 0.001;
        const target = 1.5 + k * 2.9;
        const f = 1 + ((target - spd) / spd) * 0.05 * gas;
        p.vx *= f;
        p.vy *= f;
      }
      p.vx *= damp;
      p.vy *= damp;
      const s2 = Math.hypot(p.vx, p.vy);
      if (s2 > 5.5) {
        p.vx *= 5.5 / s2;
        p.vy *= 5.5 / s2;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const rest = 0.55 + 0.42 * gas;
      if (p.x < b.x0 + r) {
        p.x = b.x0 + r;
        p.vx = Math.abs(p.vx) * rest;
      }
      if (p.x > b.x1 - r) {
        p.x = b.x1 - r;
        p.vx = -Math.abs(p.vx) * rest;
      }
      if (p.y < b.y0 + r) {
        p.y = b.y0 + r;
        p.vy = Math.abs(p.vy) * rest;
      }
      if (p.y > b.y1 - r) {
        p.y = b.y1 - r;
        p.vy = -Math.abs(p.vy) * rest;
      }
    }
  }
}
