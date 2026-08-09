// plant3Figures — 중2 Ⅴ v3 문제·recap 그림(SVG)과 미니아트.
// 파운드리 문법(3스톱 그라데이션·좌상단 키라이트·접촉 그림자·재질별 최암색 외곽선)을 지킨다.
// 퀴즈용 그림은 정답 유출 가림 인자를 받고, concept·recap용은 무인자 완성본을 쓴다.
// 물질 색 시맨틱은 plant3Kit.P3가 단일 진실 공급원.

import { P3 } from "./plant3Kit";

/** 공통 SVG 래퍼 — 루트에 fill="none"(사진·rect 검정 채움 사고 방지). */
const svg = (vb: string, body: string, aria = ""): string =>
  `<svg viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${aria}">${body}</svg>`;

// ── recap 미니아트(64×64 플랫 문법 — 과학 *Figures 관례) ─────────────────
const MINI: Record<string, () => string> = {
  // L1: 잎 + 해 — 광합성
  leafSun: () =>
    svg("0 0 64 64", `
      <circle cx="46" cy="16" r="9" fill="${P3.light}"/>
      <path d="M46 2 v5 M46 25 v5 M32 16 h5 M55 16 h5 M36 6 l3.5 3.5 M52.5 22.5 l3.5 3.5 M56 6 l-3.5 3.5 M39.5 22.5 L36 26" stroke="${P3.light}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M30 22 C46 30 50 44 44 54 C34 60 20 56 14 44 C10 34 18 24 30 22 Z" fill="#69C77E" stroke="#1E5A2A" stroke-width="2.6"/>
      <path d="M28 26 C32 36 34 46 38 52" stroke="#1E5A2A" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    `, "햇빛을 받는 잎"),
  // L1: 엽록체 알갱이
  chloroGrain: () =>
    svg("0 0 64 64", `
      <ellipse cx="32" cy="33" rx="24" ry="16" fill="#69DB7C" stroke="#1E5A2A" stroke-width="2.8"/>
      <ellipse cx="24" cy="32" rx="6.5" ry="4.5" fill="#1E7A34"/>
      <ellipse cx="38" cy="27" rx="6.5" ry="4.5" fill="#1E7A34"/>
      <ellipse cx="40" cy="39" rx="6.5" ry="4.5" fill="#1E7A34"/>
      <path d="M14 12 l6 6 M24 8 l4 7" stroke="${P3.light}" stroke-width="3" stroke-linecap="round"/>
    `, "엽록체"),
  // L1: 들어가는 화살표 둘 · 나오는 화살표 둘(재료·산물)
  inOut: () =>
    svg("0 0 64 64", `
      <rect x="22" y="18" width="20" height="28" rx="8" fill="#69DB7C" stroke="#1E5A2A" stroke-width="2.6"/>
      <path d="M4 26 h12 M12 22 l6 4 -6 4 Z" stroke="${P3.co2}" stroke-width="2.8" stroke-linecap="round" fill="${P3.co2}"/>
      <path d="M4 40 h12 M12 36 l6 4 -6 4 Z" stroke="${P3.water}" stroke-width="2.8" stroke-linecap="round" fill="${P3.water}"/>
      <path d="M46 26 h10 M52 22 l6 4 -6 4 Z" stroke="${P3.glucose}" stroke-width="2.8" stroke-linecap="round" fill="${P3.glucose}"/>
      <path d="M46 40 h10 M52 36 l6 4 -6 4 Z" stroke="${P3.o2}" stroke-width="2.8" stroke-linecap="round" fill="${P3.o2}"/>
      <path d="M26 6 l6 8 M38 6 l-4 8" stroke="${P3.light}" stroke-width="2.8" stroke-linecap="round"/>
    `, "들어가는 재료와 나오는 산물"),
} as const as Record<string, () => string>;

/** recap 카드 미니아트 — 키가 없으면 잎 기본. */
export function p3MiniArt(key: string): string {
  return (MINI[key] ?? MINI.leafSun)();
}

// ── 광합성 과정 도식(psFlowFig) — 교과서 그림 V-2 구도의 자체 도해 ──────────
// blanks에 넣은 키의 이름표가 ㉠㉡㉢…으로 가려진다(퀴즈 정답 유출 차단).
// 키: light · co2 · water · glucose · o2 · starch · place(엽록체)
export type PsFlowKey = "light" | "co2" | "water" | "glucose" | "o2" | "starch" | "place";

export function psFlowFig(o?: { blanks?: PsFlowKey[] }): string {
  const blanks = o?.blanks ?? [];
  const MASK = ["㉠", "㉡", "㉢", "㉣"];
  let mi = 0;
  const name = (key: PsFlowKey, label: string): string =>
    blanks.includes(key) ? MASK[Math.min(mi++, MASK.length - 1)] : label;
  const pill = (x: number, y: number, w: number, label: string, c: string, dark = false): string =>
    `<g><rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${dark ? c : "#FFFFFF"}" stroke="${c}" stroke-width="2.2"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${dark ? "#FFFFFF" : "#333D4B"}">${label}</text></g>`;
  const arrow = (x1: number, y1: number, x2: number, y2: number, c: string): string => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = x2 - 9 * Math.cos(ang);
    const hy = y2 - 9 * Math.sin(ang);
    const px = 5.2 * Math.cos(ang + Math.PI / 2);
    const py = 5.2 * Math.sin(ang + Math.PI / 2);
    return `<line x1="${x1}" y1="${y1}" x2="${hx}" y2="${hy}" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M${x2} ${y2} L${hx + px} ${hy + py} L${hx - px} ${hy - py} Z" fill="${c}"/>`;
  };
  return svg(
    "0 0 340 218",
    `
    <ellipse cx="170" cy="206" rx="120" ry="8" fill="#2A3A5E" opacity="0.08"/>
    <!-- 엽록체(장소) -->
    <ellipse cx="170" cy="112" rx="86" ry="56" fill="#69DB7C" stroke="#1E5A2A" stroke-width="3.2"/>
    <ellipse cx="170" cy="112" rx="72" ry="44" fill="none" stroke="#B2F2BB" stroke-width="2" opacity="0.8"/>
    <ellipse cx="142" cy="102" rx="13" ry="8" fill="#1E7A34"/>
    <ellipse cx="176" cy="94" rx="13" ry="8" fill="#1E7A34"/>
    <ellipse cx="196" cy="122" rx="13" ry="8" fill="#1E7A34"/>
    <ellipse cx="154" cy="130" rx="13" ry="8" fill="#1E7A34"/>
    <path d="M104 84 C118 66 146 56 170 56" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" opacity="0.5"/>
    ${pill(170, 112, 72, name("place", "엽록체"), "#1E5A2A", true)}
    <!-- 빛에너지(위) -->
    <circle cx="66" cy="30" r="13" fill="${P3.light}"/>
    <path d="M66 10 v6 M66 44 v6 M46 30 h6 M80 30 h6 M52 16 l4 4 M76 40 l4 4 M80 16 l-4 4 M56 40 l-4 4" stroke="${P3.light}" stroke-width="2.6" stroke-linecap="round"/>
    ${arrow(84, 42, 122, 72, P3.light)}
    ${pill(140, 26, blanks.includes("light") ? 40 : 78, name("light", "빛에너지"), "#B8860B")}
    <!-- 들어가는 것(왼쪽) -->
    ${arrow(58, 96, 96, 100, P3.co2)}
    ${pill(44, 96, blanks.includes("co2") ? 40 : 92, name("co2", "이산화 탄소"), P3.co2)}
    ${arrow(58, 152, 100, 134, P3.water)}
    ${pill(44, 156, blanks.includes("water") ? 40 : 46, name("water", "물"), P3.water)}
    <!-- 나오는 것(오른쪽) -->
    ${arrow(248, 96, 288, 88, P3.glucose)}
    ${pill(300, 84, blanks.includes("glucose") ? 40 : 66, name("glucose", "포도당"), P3.glucose)}
    ${arrow(250, 140, 288, 152, P3.o2)}
    ${pill(300, 158, blanks.includes("o2") ? 40 : 54, name("o2", "산소"), P3.o2)}
    <!-- 포도당 → 녹말 저장 -->
    ${arrow(300, 98, 300, 116, "#8B95A1")}
    ${pill(300, 130, blanks.includes("starch") ? 40 : 54, name("starch", "녹말"), P3.starch)}
    `,
    "광합성 과정 도식 — 빛에너지·이산화 탄소·물이 엽록체로 들어가고 포도당(녹말로 저장)과 산소가 나온다",
  );
}
