// 물질 단원(IV) 열 색 파이프라인 — 온도→hue(212→370), hue→uniform 3색(core/deep/glow).
// 프로토타입 수치 그대로(KICKOFF 확정): 바꾸지 말 것.
// 3단원 열 램프(ui/thermo.ts)와 별개 — 이 단원은 상태 아이덴티티(파랑 고체→보라 액체→붉은 기체)가 언어다.

import { clamp } from "../core/dom";

/** 온도(℃) → hue. -20℃=212(찬 파랑) … 120℃=370(뜨거운 빨강). */
export function hueFor(T: number): number {
  return 212 + clamp((T + 20) / 140, 0, 1) * 158;
}

/** 온도색 hsla 문자열 — HUD 점·슬라이더 등 DOM 쪽에서 사용. */
export function colFor(T: number, l = 64, a = 1): string {
  return `hsla(${hueFor(T)},85%,${l}%,${a})`;
}

export type RGB = [number, number, number];

/** h:0-360, s/l:0-1 → [r,g,b] 0-1 */
export function hslRgb(h: number, s: number, l: number): RGB {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [r + m, g + m, b + m];
}

export function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export interface ThermalColors {
  core: RGB;
  deep: RGB;
  glow: RGB;
}

/** thermal hue → 메타볼 uniform 3색. 고체(sol)일수록 얼음빛(흰 파랑)으로 끌어당긴다. */
export function thermalColors(T: number, sol: number): ThermalColors {
  const hue = hueFor(T);
  let core = hslRgb(hue, 0.9, 0.78);
  let deep = hslRgb(hue, 0.72, 0.32);
  const glow = hslRgb(hue, 0.95, 0.62);
  core = mixRgb(core, [0.93, 0.97, 1.0], sol * 0.5);
  deep = mixRgb(deep, [0.42, 0.6, 0.85], sol * 0.4);
  return { core, deep, glow };
}
