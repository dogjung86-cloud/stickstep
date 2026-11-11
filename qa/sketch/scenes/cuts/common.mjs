// 개념 컷 코드 그림의 공통 도우미(단원 파일 cuts-uN.mjs 가 함께 쓴다).
// 개념 컷 = 개념 스텝 첫 블록의 스틱맨 그림(cut()). 배선 전에는 qa/sketch/mock-cuts.mjs 로만 본다.
import { C, curve, ell, circ, mix, squiggle, arrow } from "../../lib/sk.mjs";

export const W = 960, H = 720;
export const lerpx = (a, b, t) => a + (b - a) * t;
export const HEAT = ["#2B3A8C", "#3F7CC0", "#3FB8A0", "#F2D03B", "#F08A2E", "#E0503A"];
export const heat = t => { const u = Math.max(0, Math.min(0.999, t)) * (HEAT.length - 1), i = Math.floor(u); return mix(HEAT[i], HEAT[i + 1], u - i); };
// 입자 하나 + 흔들림 호(comic-u3l3 3컷 문법)
export function jiggle(sk, x, y, r, t, shakes, sd) {
  for (let j = 0; j < shakes; j++) for (const sg of [-1, 1]) {
    const rr = r * 1.35 + j * r * 0.36, a0 = sg > 0 ? -0.55 : Math.PI - 0.55;
    sk.ink(ell(x, y, rr, rr * 1.15, a0, a0 + 1.1), { w: 4, color: mix(heat(t), "#000000", 0.1), seed: sd + j * 2 + (sg > 0 ? 1 : 0), wob: 0, alpha: 0.95 - j * 0.25 });
  }
  const b = circ(x, y, r, { over: 0.12, seed: sd + 9 });
  sk.fill(b, heat(t), { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 10 }); sk.ink(b, { w: 7, seed: sd + 11, wob: 0.5 });
  sk.ink(curve([[x - r * 0.5, y - r * 0.3], [x - r * 0.26, y - r * 0.58], [x + r * 0.1, y - r * 0.64]]), { w: 3.5, color: C.white, seed: sd + 12, wob: 0.2 });
}
export const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; }; // 크게 그린 구조물의 선이 인물보다 굵어지지 않게
// 곧게 나아가는 물결 선(복사하는 열, comic-u3l3 문법)
export const wavy = (a, b, amp = 7, waves = 5) => {
  const n = 64, out = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 0; i <= n; i++) { const u = i / n, o = amp * Math.sin(u * waves * 2 * Math.PI) * Math.min(1, (1 - u) * 5); out.push([a[0] + dx * u + nx * o, a[1] + dy * u + ny * o]); }
  return out;
};
export const ray = (sk, a, b, sd, o = {}) => arrow(sk, wavy(a, b, o.amp ?? 7, o.waves ?? 5), { w: o.w ?? 7, color: o.color ?? C.orange, seed: sd, wob: 0.3, head: 20 });
export const steam = (sk, x, y, n, len, sd, gap = 30, col = "#B8BDC4") => { for (let i = 0; i < n; i++) sk.ink(squiggle(x + (i - (n - 1) / 2) * gap, y, len, 7, 2, i * 1.3), { w: 7, color: col, seed: sd + i, wob: 0 }); };
export const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
