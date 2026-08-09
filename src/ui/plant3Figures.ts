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
  // L2: 가위처럼 교차하는 두 곡선(기체 그래프)
  gasSwap: () =>
    svg("0 0 64 64", `
      <line x1="10" y1="10" x2="10" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <line x1="10" y1="54" x2="58" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <path d="M14 20 C28 22 40 38 56 44" stroke="${P3.co2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M14 46 C28 44 40 28 56 20" stroke="${P3.o2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <circle cx="56" cy="44" r="3.4" fill="${P3.co2}"/>
      <circle cx="56" cy="20" r="3.4" fill="${P3.o2}"/>
    `, "교차하는 이산화 탄소·산소 그래프"),
  // L2: 청람색 반점이 생긴 잎 + 방울
  starchBlue: () =>
    svg("0 0 64 64", `
      <path d="M32 8 C48 16 54 32 50 44 C46 54 38 58 32 58 C26 58 18 54 14 44 C10 32 16 16 32 8 Z" fill="#F2EFDB" stroke="#B8B294" stroke-width="2.6"/>
      <path d="M32 12 L32 56" stroke="#B8B294" stroke-width="1.8" opacity="0.7"/>
      <ellipse cx="32" cy="34" rx="11" ry="8" fill="${P3.starch}"/>
      <ellipse cx="40" cy="40" rx="4.5" ry="3.4" fill="#3B5BDB"/>
      <path d="M50 10 c0 -4 3 -8 3 -8 c0 0 3 4 3 8 a3 3 0 0 1 -6 0 Z" fill="#E8590C"/>
    `, "청람색으로 물든 잎"),
  // L2: 해 화분 vs 상자 화분(비교)
  comparePots: () =>
    svg("0 0 64 64", `
      <circle cx="16" cy="12" r="6" fill="${P3.light}"/>
      <path d="M10 30 h16 l-2 14 h-12 Z" fill="#C9885A" stroke="#8A5A30" stroke-width="2"/>
      <path d="M18 30 v-8 M18 24 c-5 -2 -7 -7 -6 -10 c5 0 8 4 8 8 M18 26 c5 -2 7 -7 6 -10 c-5 0 -8 4 -8 8" fill="#69C77E" stroke="#2E7D46" stroke-width="2"/>
      <rect x="36" y="14" width="22" height="22" rx="2" fill="#4E5968" stroke="#333D4B" stroke-width="2.2"/>
      <path d="M40 36 h16 l-2 12 h-12 Z" fill="#C9885A" stroke="#8A5A30" stroke-width="2"/>
    `, "햇빛 화분과 어둠상자 화분의 비교"),
  // L3: 증가 후 일정 곡선(빛·CO₂)
  curvePlateau: () =>
    svg("0 0 64 64", `
      <line x1="10" y1="10" x2="10" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <line x1="10" y1="54" x2="58" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <path d="M12 52 L32 20 L56 18" stroke="${P3.leaf}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `, "증가하다 일정해지는 곡선"),
  // L3: 산봉우리 곡선(온도)
  curvePeak: () =>
    svg("0 0 64 64", `
      <line x1="10" y1="10" x2="10" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <line x1="10" y1="54" x2="58" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <path d="M12 52 L38 16 L54 48" stroke="#F03E3E" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `, "정점을 지나 빠르게 감소하는 곡선"),
  // L3: 온실 다이얼
  greenhouseDial: () =>
    svg("0 0 64 64", `
      <path d="M8 52 v-18 a24 24 0 0 1 48 0 v18 Z" fill="none" stroke="${P3.leaf}" stroke-width="3.2"/>
      <line x1="4" y1="52" x2="60" y2="52" stroke="${P3.leaf}" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="32" cy="36" r="9" fill="#FFFFFF" stroke="#4E5968" stroke-width="2.6"/>
      <line x1="32" y1="36" x2="37" y2="30" stroke="#4E5968" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="18" cy="20" r="4.5" fill="${P3.light}"/>
    `, "온실 안 조건 다이얼"),
  // L4: 상자에서 번개(양분→에너지)
  boltBox: () =>
    svg("0 0 64 64", `
      <path d="M14 34 h36 v20 a4 4 0 0 1 -4 4 h-28 a4 4 0 0 1 -4 -4 Z" fill="#F4E3C2" stroke="#A9854A" stroke-width="2.6"/>
      <path d="M12 34 l6 -8 h28 l6 8 Z" fill="#E8CB92" stroke="#A9854A" stroke-width="2.4"/>
      <path d="M36 4 l-9 16 h7 l-6 15 15 -19 h-7 l6 -12 Z" fill="${P3.energy}" stroke="#E8A80C" stroke-width="2" stroke-linejoin="round"/>
    `, "양분 상자에서 솟는 에너지"),
  // L4: 마이토콘드리아 콩
  mitoBean: () =>
    svg("0 0 64 64", `
      <path d="M14 26 c8 -12 28 -14 38 -4 c-2 14 -16 24 -30 21 c-10 -2 -12 -10 -8 -17 Z" fill="${P3.danger}" stroke="#B02525" stroke-width="2.8"/>
      <path d="M22 30 c7 -6 16 -7 23 -3 M20 37 c7 -5 16 -6 23 -3" stroke="#FFD3D3" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <path d="M48 10 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z" fill="${P3.energy}"/>
    `, "마이토콘드리아"),
  // L4: 해+달 아래 늘 켜진 초록불
  alwaysOn: () =>
    svg("0 0 64 64", `
      <circle cx="18" cy="14" r="8" fill="${P3.light}"/>
      <path d="M46 8 a9 9 0 1 0 5 16 a7 7 0 0 1 -5 -16" fill="#8B95A1"/>
      <rect x="18" y="34" width="28" height="20" rx="7" fill="#FFFFFF" stroke="#8B95A1" stroke-width="2.6"/>
      <circle cx="32" cy="44" r="6" fill="#20C997" stroke="#0CA678" stroke-width="2.2"/>
    `, "낮과 밤 모두 켜진 표시등"),
} as const as Record<string, () => string>;

/** recap 카드 미니아트 — 키가 없으면 잎 기본. */
export function p3MiniArt(key: string): string {
  return (MINI[key] ?? MINI.leafSun)();
}

// ── 그래프 모양 3종 비교(factorShapesFig) — (가)(나)(다) 무명 곡선(퀴즈용) ──
// (가) 증가 후 일정 · (나) 정점 뒤 빠른 감소 · (다) 계속 증가(직선). 축 라벨은 광합성량/요인 값.
export function factorShapesFig(): string {
  const panel = (ox: number, label: string, curve: string, color: string): string => `
    <g transform="translate(${ox} 0)">
      <rect x="0" y="8" width="100" height="96" rx="10" fill="#FFFFFF" stroke="#E1EBE4" stroke-width="2"/>
      <line x1="16" y1="20" x2="16" y2="84" stroke="#A9B6A9" stroke-width="2"/>
      <line x1="16" y1="84" x2="90" y2="84" stroke="#A9B6A9" stroke-width="2"/>
      <path d="${curve}" stroke="${color}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="50" y="122" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">${label}</text>
    </g>`;
  return svg(
    "0 0 340 132",
    `
    ${panel(6, "(가)", "M18 82 L44 34 L86 32", P3.leaf)}
    ${panel(120, "(나)", "M18 82 L52 28 L84 76", "#F03E3E")}
    ${panel(234, "(다)", "M18 82 L86 24", "#4DABF7")}
    <text x="8" y="12" font-size="10.5" font-weight="700" fill="#8B95A1">세로축: 광합성량 · 가로축: 요인 값</text>
    `,
    "요인 값에 따른 광합성량 그래프 세 가지 모양 — (가) 증가 후 일정, (나) 정점 뒤 감소, (다) 계속 증가",
  );
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
