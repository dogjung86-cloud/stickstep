// 열 단원(III) 공용 비주얼 언어 — 온도 색 램프, 발광 입자, 불꽃, 자유 입자 물리.
// 모든 열 랩(heatParticles·heatContact·conduction·convection·radiation)이 공유한다.
// 램프는 초록을 지나지 않는 열화상풍(파랑→보라→붉은 주황→주황)으로, 다크 무대 기준.

import { clamp } from "../core/dom";

const TAU = Math.PI * 2;

/** 온도 램프 앵커 — 0(차가움) → 1(뜨거움) */
const RAMP: [number, number, number][] = [
  [61, 141, 255], // 파랑
  [124, 108, 246], // 보라
  [242, 92, 84], // 붉은 주황
  [255, 176, 58], // 주황(백열 직전)
];
const STOPS = [0, 0.35, 0.68, 1];

export function tempRGB(t: number): [number, number, number] {
  const x = clamp(t, 0, 1);
  for (let i = 1; i < STOPS.length; i++) {
    if (x <= STOPS[i]) {
      const f = (x - STOPS[i - 1]) / (STOPS[i] - STOPS[i - 1]);
      const a = RAMP[i - 1];
      const b = RAMP[i];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    }
  }
  return RAMP[RAMP.length - 1];
}

export function tempColor(t: number, alpha = 1): string {
  const [r, g, b] = tempRGB(t);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
}

/** 입자 운동의 활발한 정도를 말로 — HUD·헬퍼 공용 */
export function motionWord(t: number): string {
  return t < 0.34 ? "둔해요" : t < 0.67 ? "보통이에요" : "활발해요";
}

/** 발광 입자 — 글로우 + 코어 + 하이라이트 */
export function drawGlowParticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t01: number,
  glow = 2.2,
): void {
  const [R, G, B] = tempRGB(t01);
  const rr = Math.round(R);
  const gg = Math.round(G);
  const bb = Math.round(B);
  if (glow > 1) {
    const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * glow);
    grad.addColorStop(0, `rgba(${rr},${gg},${bb},.5)`);
    grad.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * glow, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.32)";
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.34, r * 0.34, 0, TAU);
  ctx.fill();
}

function tear(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + w, y - h * 0.32, x + w * 0.52, y - h * 0.82, x, y - h);
  ctx.bezierCurveTo(x - w * 0.52, y - h * 0.82, x - w, y - h * 0.32, x, y);
  ctx.fill();
}

/** 버너·아궁이 불꽃 — 층진 물방울 + 플리커. (x,y)=불꽃 바닥 중심, s=높이 */
export function drawFlame(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tMs: number): void {
  const fl = 1 + Math.sin(tMs / 90) * 0.07 + Math.sin(tMs / 47 + 1.7) * 0.05;
  const sway = Math.sin(tMs / 150) * s * 0.05;
  ctx.save();
  ctx.translate(sway, 0);
  ctx.fillStyle = "rgba(255,122,61,.85)";
  tear(ctx, x, y, s * 0.42, s * fl);
  ctx.fillStyle = "rgba(255,176,58,.95)";
  tear(ctx, x, y - s * 0.04, s * 0.28, s * 0.66 * fl);
  ctx.fillStyle = "rgba(255,233,168,.95)";
  tear(ctx, x, y - s * 0.06, s * 0.15, s * 0.36 * fl);
  ctx.restore();
}

/** 자유 입자 — 랜덤 워크 + 목표 속도 + 벽 반사 (+선택적 상호 반발) */
export interface FreeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  px: number; // 이전 위치(속도 잔상용)
  py: number;
  seed: number; // 개별 변주(0.75~1.25)
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function makeParticles(n: number, box: Box): FreeParticle[] {
  const ps: FreeParticle[] = [];
  // 균등에 가까운 배치(격자 + 흔들림) — 초기부터 뭉치지 않게
  const cols = Math.ceil(Math.sqrt((n * box.w) / Math.max(1, box.h)));
  const rows = Math.ceil(n / cols);
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    ps.push({
      x: box.x + ((c + 0.5 + (Math.random() - 0.5) * 0.5) / cols) * box.w,
      y: box.y + ((r + 0.5 + (Math.random() - 0.5) * 0.5) / rows) * box.h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      px: 0,
      py: 0,
      seed: 0.75 + Math.random() * 0.5,
    });
  }
  for (const p of ps) {
    p.px = p.x;
    p.py = p.y;
  }
  return ps;
}

/**
 * 한 프레임 진행. speed = 목표 속력(px/프레임@60fps), repel = 반발 반경(0이면 생략).
 * 온도가 높을수록 speed를 크게 주면 "활발한 입자 운동"이 된다.
 */
export function stepFree(ps: FreeParticle[], box: Box, dt: number, speed: number, repel = 0): void {
  const steer = 0.22 * dt;
  for (const p of ps) {
    p.px = p.x;
    p.py = p.y;
    p.vx += (Math.random() - 0.5) * steer;
    p.vy += (Math.random() - 0.5) * steer;
    const target = Math.max(0.02, speed * p.seed);
    const v = Math.hypot(p.vx, p.vy) || 1e-4;
    const k = 1 + (target / v - 1) * Math.min(1, 0.12 * dt);
    p.vx *= k;
    p.vy *= k;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < box.x) { p.x = box.x; p.vx = Math.abs(p.vx); }
    if (p.x > box.x + box.w) { p.x = box.x + box.w; p.vx = -Math.abs(p.vx); }
    if (p.y < box.y) { p.y = box.y; p.vy = Math.abs(p.vy); }
    if (p.y > box.y + box.h) { p.y = box.y + box.h; p.vy = -Math.abs(p.vy); }
  }
  if (repel > 0) {
    const r2 = repel * repel;
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i];
        const b = ps[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 1e-6 && d2 < r2) {
          const d = Math.sqrt(d2);
          const push = ((repel - d) / repel) * 0.5 * dt;
          const ux = dx / d;
          const uy = dy / d;
          a.x -= ux * push; a.y -= uy * push;
          b.x += ux * push; b.y += uy * push;
        }
      }
    }
  }
}
