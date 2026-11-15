// plant3Figures — 중2 Ⅴ v3 문제·recap 그림(SVG)과 미니아트.
// 파운드리 문법(3스톱 그라데이션·좌상단 키라이트·접촉 그림자·재질별 최암색 외곽선)을 지킨다.
// 퀴즈용 그림은 정답 유출 가림 인자를 받고, concept·recap용은 무인자 완성본을 쓴다.
// 물질 색 시맨틱은 plant3Kit.P3가 단일 진실 공급원.

import { P3 } from "./plant3Kit";

/** 공통 SVG 래퍼 — 루트에 fill="none"(사진·rect 검정 채움 사고 방지). */
const svg = (vb: string, body: string, aria = ""): string =>
  `<svg viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${aria}">${body}</svg>`;

const r1 = (v: number): string => (Math.round(v * 10) / 10).toString();
/** 육각 고리의 꼭짓점(랩 무대 art.ts와 같은 계산). rot 30이면 위아래가 뾰족하다. */
const hexPts = (x: number, y: number, r: number, rot = 0): string =>
  [0, 1, 2, 3, 4, 5].map((k) => `${r1(x + Math.cos(((k * 60 + rot) * Math.PI) / 180) * r)},${r1(y + Math.sin(((k * 60 + rot) * Math.PI) / 180) * r)}`).join(" ");
/** 설탕(고리 둘, 앰버). 랩 무대의 sucrose를 밝은 카드의 평면 색으로 옮긴 것. vertical이면 고리를 위아래로 잇는다. */
const sugarPair = (x: number, y: number, r: number, vertical = false): string => {
  const d = r * 0.95;
  const [ax, ay, bx, by] = vertical ? [x, y - d, x, y + d] : [x - d, y, x + d, y];
  const rot = vertical ? 30 : 0;
  return `<polygon points="${hexPts(ax, ay, r, rot)}" fill="${P3.sugar}" stroke="#8A5A00" stroke-width="1.2" stroke-linejoin="round"/><polygon points="${hexPts(bx, by, r, rot)}" fill="${P3.sugar}" stroke="#8A5A00" stroke-width="1.2" stroke-linejoin="round"/><circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r * 0.3)}" fill="#FFE9B0" stroke="#8A5A00" stroke-width=".8"/>`;
};
/** 녹말(고리 사슬, 남보라). 랩 무대의 starchChain처럼 고리를 잇고 조금 굽힌다. vertical이면 위아래로. */
const starchLink = (x: number, y: number, n: number, r: number, vertical = false): string => {
  const step = r * 1.72;
  let s = "";
  for (let i = 0; i < n; i++) {
    const u = (i - (n - 1) / 2) * step;
    const w = Math.sin(i * 1.1) * r * 0.3;
    const [cx, cy] = vertical ? [x + w, y + u] : [x + u, y + w];
    s += `<polygon points="${hexPts(cx, cy, r, vertical ? 0 : 30)}" fill="#7474F2" stroke="#2E2E9A" stroke-width="1.1" stroke-linejoin="round"/>`;
  }
  return s;
};

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
  // L4: 호흡의 기체 그래프(빛을 막은 용기). gasSwap과 같은 틀에서 방향만 반대: 이산화 탄소(보라)가 오르고 산소(하늘색)가 내려간다.
  gasSwapResp: () =>
    svg("0 0 64 64", `
      <line x1="10" y1="10" x2="10" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <line x1="10" y1="54" x2="58" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <path d="M14 46 C28 44 40 28 56 20" stroke="${P3.co2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M14 20 C28 22 40 38 56 44" stroke="${P3.o2}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <circle cx="56" cy="20" r="3.4" fill="${P3.co2}"/>
      <circle cx="56" cy="44" r="3.4" fill="${P3.o2}"/>
    `, "이산화 탄소는 오르고 산소는 내려가는 그래프"),
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
  // L3: 산봉우리 곡선(온도 — 부드러운 봉우리)
  curvePeak: () =>
    svg("0 0 64 64", `
      <line x1="10" y1="10" x2="10" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <line x1="10" y1="54" x2="58" y2="54" stroke="#A9B6A9" stroke-width="2.4"/>
      <path d="M12 52 C20 46 28 26 35 17.5 C36.5 15.8 38.5 15.8 40 18.2 C44 25 50 40 54 48" stroke="#F03E3E" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    `, "정점을 지나 빠르게 감소하는 곡선"),
  // L3: 이산화 탄소 농도의 그래프. 빛의 세기 카드(curvePlateau)와 같은 늘다가 눕는 선을 이산화 탄소 색으로 긋고,
  // 가로축 끝 아래에 이산화 탄소 분자(셋 일직선, 가운데 탄소만 조금 어둡게. 랩 무대의 분자 모형과 같은 색) 하나를 둔다.
  // 분자 자리를 내려고 그래프 틀만 6 위로 올렸다(선의 모양은 같다).
  co2Plateau: () =>
    svg("0 0 64 64", `
      <line x1="10" y1="6" x2="10" y2="48" stroke="#A9B6A9" stroke-width="2.4"/>
      <line x1="10" y1="48" x2="58" y2="48" stroke="#A9B6A9" stroke-width="2.4"/>
      <path d="M12 46 L32 14 L56 12" stroke="${P3.co2}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="41" cy="57" r="3.8" fill="#BBA8F5" stroke="#5B45A8" stroke-width="1.3"/>
      <circle cx="53" cy="57" r="3.8" fill="#BBA8F5" stroke="#5B45A8" stroke-width="1.3"/>
      <circle cx="47" cy="57" r="3.7" fill="#8E83B8" stroke="#433A6E" stroke-width="1.3"/>
    `, "이산화 탄소 농도에 따라 늘다가 일정해지는 그래프"),
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
  // L5: 해 아래 잎 — 들어오는 화살표 크게
  dayLeaf: () =>
    svg("0 0 64 64", `
      <circle cx="14" cy="12" r="7" fill="${P3.light}"/>
      <path d="M32 22 C46 30 50 44 45 54 C38 60 26 60 19 54 C14 44 18 30 32 22 Z" fill="#51CF66" stroke="#1E5A2A" stroke-width="2.6"/>
      <path d="M4 34 h14 M14 30 l8 4 -8 4 Z" stroke="${P3.co2}" stroke-width="2.8" fill="${P3.co2}" stroke-linecap="round"/>
      <path d="M46 34 h12 M52 30 l8 4 -8 4 Z" stroke="${P3.o2}" stroke-width="2.8" fill="${P3.o2}" stroke-linecap="round"/>
    `, "낮의 잎, 이산화 탄소 흡수·산소 방출"),
  // L5: 달 아래 잎 — 방향 반대
  nightLeaf: () =>
    svg("0 0 64 64", `
      <rect x="2" y="2" width="60" height="60" rx="12" fill="#2E3650"/>
      <path d="M50 8 a8 8 0 1 0 4 14 a6.5 6.5 0 0 1 -4 -14" fill="#B9C2CC"/>
      <path d="M30 24 C44 32 48 44 43 54 C36 60 24 60 17 54 C12 44 16 32 30 24 Z" fill="#40A85C" stroke="#1E5A2A" stroke-width="2.6"/>
      <path d="M4 36 h12 M12 32 l8 4 -8 4 Z" stroke="${P3.o2}" stroke-width="2.8" fill="${P3.o2}" stroke-linecap="round"/>
      <path d="M44 36 h12 M50 32 l8 4 -8 4 Z" stroke="${P3.co2}" stroke-width="2.8" fill="${P3.co2}" stroke-linecap="round"/>
    `, "밤의 잎, 산소 흡수·이산화 탄소 방출"),
  // L5: 좌우 대칭 비교표 아이콘
  vsTable: () =>
    svg("0 0 64 64", `
      <rect x="6" y="10" width="24" height="44" rx="8" fill="#E6FCF5" stroke="${P3.leaf}" stroke-width="2.6"/>
      <rect x="34" y="10" width="24" height="44" rx="8" fill="#FFF4E6" stroke="#FF922B" stroke-width="2.6"/>
      <path d="M12 22 h12 M12 32 h12 M12 42 h12 M40 22 h12 M40 32 h12 M40 42 h12" stroke="#8B95A1" stroke-width="2.4" stroke-linecap="round"/>
    `, "광합성과 호흡 비교표"),
  // L6: 위아래 화살표가 달린 줄기와 설탕(체관 이동). 설탕은 랩 무대와 책 그림처럼 앰버 고리 둘(줄기에 들게 위아래로 이었다).
  sugarTruck: () =>
    svg("0 0 64 64", `
      <rect x="24" y="6" width="16" height="52" rx="7" fill="#8FBE85" stroke="#4E7C46" stroke-width="2.4"/>
      ${sugarPair(32, 20, 4.4, true)}
      ${sugarPair(32, 44, 4.4, true)}
      <path d="M12 24 v-10 M8 18 l4 -6 4 6 M12 40 v10 M8 46 l4 6 4 -6" stroke="#8B95A1" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      <path d="M54 14 c-4 6 -10 8 -14 8 c1 -7 6 -11 14 -8 Z" fill="#51CF66" stroke="#1E5A2A" stroke-width="2"/>
    `, "체관을 오르내리는 설탕"),
  // L6: 새싹+번개(이용)
  useGrow: () =>
    svg("0 0 64 64", `
      <path d="M24 56 h16 l-2 -12 h-12 Z" fill="#C9885A" stroke="#8A5A30" stroke-width="2.2"/>
      <path d="M32 44 v-14 M32 34 c-7 -2 -10 -9 -9 -14 c7 0 11 6 11 11 M32 36 c7 -2 10 -9 9 -14 c-7 0 -11 6 -11 11" fill="#69C77E" stroke="#2E7D46" stroke-width="2.4"/>
      <path d="M50 8 l-6 10 h5 l-4 10 10 -13 h-5 l4 -7 Z" fill="${P3.energy}" stroke="#E8A80C" stroke-width="1.6" stroke-linejoin="round"/>
    `, "양분으로 자라는 새싹과 에너지"),
  // L6: 저장 단지 셋(형태 다양). 녹말은 고리 사슬(남보라), 설탕은 고리 둘(앰버)로 랩 무대와 같은 기호, 셋째 단지(단백질, 지방)는 점.
  storeJar: () =>
    svg("0 0 64 64", `
      <path d="M4 30 c0 -7 17 -7 17 0 v20 c0 7 -17 7 -17 0 Z" fill="#EAF6EF" stroke="${P3.leafDeep}" stroke-width="2.4"/>
      <path d="M23.5 24 c0 -7 17 -7 17 0 v26 c0 7 -17 7 -17 0 Z" fill="#FFF4E6" stroke="#E8A80C" stroke-width="2.4"/>
      <path d="M43 30 c0 -7 17 -7 17 0 v20 c0 7 -17 7 -17 0 Z" fill="#FFF0F3" stroke="#C2566B" stroke-width="2.4"/>
      ${starchLink(12.5, 41, 3, 3.3, true)}
      ${sugarPair(32, 40, 4.2, true)}
      <circle cx="51.5" cy="41" r="3.4" fill="#C2566B"/>
    `, "녹말, 설탕, 그 밖의 형태로 양분을 담은 저장 단지 셋"),
} as const as Record<string, () => string>;

/** recap 카드 미니아트 — 키가 없으면 잎 기본. */
export function p3MiniArt(key: string): string {
  return (MINI[key] ?? MINI.leafSun)();
}

// ── 잎 공장 장면(leafFactorySceneFig) — 원본 랩(plantFactoryLab)의 연출 재현(사용자 확정) ──
// codex 발주 잎 실사 위로 물·이산화 탄소·빛 입자가 흘러들며 "물"/"이산화 탄소"/"빛에너지"
// 텍스트 박스가 차례로 등장 → 포도당(→녹말 저장)과 산소 배출까지 자동 재생(SMIL — rAF 0).
// 입자 색·라벨 필 스타일은 원본 랩의 캔버스 문법(tokens의 --plant-* 팔레트)을 그대로 따른다.
export function leafFactorySceneFig(o?: { mode?: "play" | "quiz"; blank?: "co2" }): string {
  const mode = o?.mode ?? "play";
  const isQuiz = mode === "quiz";
  const blanks: ("co2")[] = o?.blank ? [o.blank] : [];
  const base = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/") + "plant/labs/leaf-factory-diagram-v2.webp";
  const C = {
    water: "var(--plant-water, #55B8F2)",
    xylem: "var(--plant-xylem, #4DA3F5)",
    carbon: "var(--plant-carbon, #8A96A8)",
    sun: "var(--plant-sun, #FFC44F)",
    oxygen: "var(--plant-oxygen, #69D5D0)",
    glucose: "var(--plant-glucose, #8D72D9)",
    starch: "var(--plant-starch, #5A4FB5)",
    ink: "#333D4B",
  };
  /** 원본 drawTextBox 재현 — 흰 라운드 필 + 액센트 테두리.
   *  play 모드는 begin 시점에 페이드 등장, quiz 모드는 정적(즉시 표시·연출 없음). */
  const box = (x: number, y: number, w: number, label: string, accent: string, begin: string, out?: string): string => {
    if (isQuiz) {
      if (out) return ""; // 퀴즈판에선 사라지는 상자(포도당→녹말 전환 전 단계)는 그리지 않는다
      return `<g>
      <rect x="${x - w / 2}" y="${y - 3.6}" width="${w}" height="7.2" rx="3.6" fill="#FFFFFF" fill-opacity="0.95" stroke="${accent}" stroke-width="0.55"/>
      <text x="${x}" y="${y + 1.45}" text-anchor="middle" font-size="3.9" font-weight="800" fill="${C.ink}">${label}</text>
    </g>`;
    }
    return `
    <g opacity="0">
      <animate attributeName="opacity" values="0;1" dur="0.45s" begin="${begin}" fill="freeze"/>
      ${out ? `<animate attributeName="opacity" values="1;0" dur="0.4s" begin="${out}" fill="freeze"/>` : ""}
      <rect x="${x - w / 2}" y="${y - 3.6}" width="${w}" height="7.2" rx="3.6" fill="#FFFFFF" fill-opacity="0.95" stroke="${accent}" stroke-width="0.55"/>
      <text x="${x}" y="${y + 1.45}" text-anchor="middle" font-size="3.9" font-weight="800" fill="${C.ink}">${label}</text>
    </g>`;
  };
  /** 경로 위를 도는 입자 무리 — begin을 어긋나게 준 SMIL animateMotion 반복(play 전용). */
  const flow = (path: string, n: number, dur: number, r: number, fill: string, begin = 0, glow = false): string =>
    Array.from({ length: n })
      .map(
        (_, i) => `<circle r="${r}" fill="${fill}" ${glow ? `stroke="#FFF6D8" stroke-width="0.5"` : `stroke="#FFFFFF" stroke-width="0.45"`} opacity="0.92">
        <animateMotion path="${path}" dur="${dur}s" begin="${(begin + (i * dur) / n).toFixed(2)}s" repeatCount="indefinite"/>
      </circle>`,
      )
      .join("");
  /** 경로 위 고정 입자(quiz 전용 — 정적 그림에서도 흐름이 읽히게 점만 박는다). */
  const dots = (pts: [number, number][], r: number, fill: string, glow = false): string =>
    pts
      .map(
        ([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${glow ? `stroke="#FFF6D8" stroke-width="0.5"` : `stroke="#FFFFFF" stroke-width="0.45"`} opacity="0.92"/>`,
      )
      .join("");
  /** play는 SMIL 페이드 등장 래퍼, quiz는 즉시 표시. */
  const appear = (begin: string, inner: string): string =>
    isQuiz
      ? `<g>${inner}</g>`
      : `<g opacity="0"><animate attributeName="opacity" values="0;1" dur="0.4s" begin="${begin}" fill="freeze"/>${inner}</g>`;
  const WATER_PATH = "M7 86 L7 58 C7 53 12 49 19 47 C26 45 31 48 35 50";
  const CO2_PATH = "M93 7 C86 11 80 16 76.5 21 C72 28 66 38 62 47";
  const LIGHT_PATH = "M18 12 C27 20 38 28 50 36";
  const O2_PATH = "M74 47 C77 38 75.5 28 76.5 23 C80 20 88 26 94 32";
  return svg(
    "0 0 100 100",
    `
    <image href="${base}" x="0" y="0" width="100" height="100" opacity="0.84" preserveAspectRatio="xMidYMid slice"/>
    <!-- 반응 영역 힌트(원본의 흰 반투명 상자) -->
    <rect x="29" y="41" width="66" height="20" rx="4.5" fill="#FFFFFF" opacity="0.28"/>
    <!-- 물관 통로 + 라벨 -->
    <path d="${WATER_PATH}" stroke="#1E3A5C" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0.35"/>
    <path d="${WATER_PATH}" stroke="${C.xylem}" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.9"/>
    ${box(17, 78, 11, "물관", C.xylem, "0.2s")}
    <!-- 기공(공변세포 한 쌍) + 라벨 -->
    <g transform="translate(76.5 21) rotate(-28)">
      <ellipse cx="-1.7" cy="0" rx="2.1" ry="4.2" fill="#8FD08F" stroke="#2E7D46" stroke-width="0.55"/>
      <ellipse cx="1.7" cy="0" rx="2.1" ry="4.2" fill="#8FD08F" stroke="#2E7D46" stroke-width="0.55"/>
      <ellipse cx="0" cy="0" rx="0.9" ry="3" fill="#1C3A28"/>
    </g>
    ${box(85, 17, 11, "기공", "#2E7D46", "0.2s")}
    <!-- 해 -->
    <circle cx="14" cy="8" r="4" fill="${C.sun}"/>
    <path d="M14 1.8 v1.8 M14 12.4 v1.8 M7.8 8 h1.8 M18.4 8 h1.8 M9.6 3.6 l1.3 1.3 M17.1 11.1 l1.3 1.3 M18.4 3.6 l-1.3 1.3 M10.9 11.1 l-1.3 1.3" stroke="${C.sun}" stroke-width="1" stroke-linecap="round"/>
    <!-- 입자 흐름: play는 SMIL 순환, quiz는 경로 위 고정 점 -->
    ${isQuiz
      ? dots([[7, 78], [7, 62], [14, 49.5]], 2, C.water) +
        dots([[88, 10], [79, 17.5], [70, 30], [65, 41]], 1.25, C.carbon) +
        dots([[26, 18], [37, 26], [46, 33]], 1.35, C.sun, true) +
        dots([[75.5, 40], [76.5, 26], [86, 26]], 1.7, C.oxygen)
      : flow(WATER_PATH, 3, 3.4, 2, C.water) +
        flow(CO2_PATH, 5, 3, 1.25, C.carbon) +
        flow(LIGHT_PATH, 3, 2.5, 1.35, C.sun, 0, true) +
        flow(O2_PATH, 3, 3, 1.7, C.oxygen, 4.6)}
    <!-- 반응식: 물 + 이산화 탄소 →(빛에너지) 포도당(→녹말 저장) + 산소 -->
    ${box(36, 51, 9.5, "물", C.water, "1.3s")}
    ${appear("2.9s", `<text x="44.4" y="52.6" text-anchor="middle" font-size="4.6" font-weight="800" fill="${C.ink}" stroke="#FFFFFF" stroke-width="0.7" paint-order="stroke">+</text>`)}
    ${blanks.includes("co2")
      ? box(57, 51, 8, "㉠", "#6B7684", "2.3s")
      : box(57, 51, 21, "이산화 탄소", C.carbon, "2.3s")}
    ${box(57, 37.5, 15.5, "빛에너지", C.sun, "3.5s")}
    ${appear("3.7s", `<path d="M57 41.6 v4.6 M55.4 44.6 L57 47 L58.6 44.6" stroke="${C.sun}" stroke-width="0.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)}
    ${appear("4.1s", `<path d="M69.5 51 h5.4 M73.2 49.3 L75.7 51 L73.2 52.7" stroke="${C.ink}" stroke-width="0.95" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`)}
    ${isQuiz
      ? box(84.5, 51, 14, "포도당", C.glucose, "0s") + box(88, 34, 11, "산소", C.oxygen, "0s")
      : box(84.5, 51, 14, "포도당", C.glucose, "4.5s", "6.8s") +
        box(84.5, 51, 12, "녹말", C.starch, "6.9s") +
        box(84.5, 58.5, 11, "저장", C.starch, "7.3s") +
        box(88, 34, 11, "산소", C.oxygen, "5s")}
    `,
    isQuiz
      ? "잎 위 광합성 과정, 빛에너지와 물, 그리고 ㉠이 잎으로 들어가고 포도당과 산소가 나온다"
      : "잎 위 광합성 과정 장면, 물과 이산화 탄소가 잎으로 들어오고 빛에너지가 더해져 포도당이 생기며, 포도당은 녹말로 저장되고 산소는 기공으로 나간다",
  );
}

/** 점들을 지나는 매끈한 선(넘치지 않는 단조 3차 보간). 온실 랩(energyLabs.ts)이 잰 점을 잇는 방식과 같다. */
function monoPath(pts: [number, number][]): string {
  const n = pts.length;
  const dx = pts.slice(1).map((p, i) => p[0] - pts[i][0]);
  const sl = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / dx[i]);
  const m = pts.map((_, i) => (i === 0 ? sl[0] : i === n - 1 ? sl[n - 2] : sl[i - 1] * sl[i] <= 0 ? 0 : (sl[i - 1] + sl[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (sl[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / sl[i];
    const b = m[i + 1] / sl[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      m[i] = k * a * sl[i];
      m[i + 1] = k * b * sl[i];
    }
  }
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${r1(pts[i][0] + h)} ${r1(pts[i][1] + m[i] * h)}, ${r1(pts[i + 1][0] - h)} ${r1(pts[i + 1][1] - m[i + 1] * h)}, ${r1(pts[i + 1][0])} ${r1(pts[i + 1][1])}`;
  }
  return d;
}

// ── 그래프 모양 3종 비교(factorShapesFig) — (가)(나)(다) 무명 곡선(퀴즈용) ──
// (가) 증가 후 일정 · (나) 꼭대기를 지나 빠르게 감소 · (다) 계속 증가(직선).
// 칸마다 세로축 '광합성량', 가로축 '요인의 값'(13px, 폰 표시 12px 남짓)을 단다. 세 선은 같은 색이다(모양만으로 고르게, 빨강은 오답 색이라 쓰지 않는다).
// (나)는 온실 랩 온도 그래프의 잰 값(10~45 ℃: 0.2, 0.4, 0.62, 0.84, 1, 0.55, 0.15, 0.03)에 원점 하나를 앞에 두고 같은 방식으로 이었다:
// 완만히 오르다 오른쪽 5/8 자리 꼭대기에서 가파르게 떨어진다. (가)는 정리 카드 미니아트, 온실 랩 이산화 탄소 그래프와 같은 꺾인 선 그대로.
export function factorShapesFig(): string {
  const W = 106;
  const O: [number, number] = [26, 96]; // 칸 안 원점
  const AW = 72; // 가로축 길이
  const AH = 80; // 세로축 길이
  const X = (u: number): number => O[0] + 2 + u * (AW - 6);
  const Y = (v: number): number => O[1] - 2.5 - v * (AH - 12);
  const PEAK = [0, 0.2, 0.4, 0.62, 0.84, 1, 0.55, 0.15, 0.03];
  const curves: string[] = [
    `M${r1(X(0))} ${r1(Y(0))} L${r1(X(0.38))} ${r1(Y(0.92))} L${r1(X(1))} ${r1(Y(0.96))}`,
    monoPath(PEAK.map((v, i) => [X(i / (PEAK.length - 1)), Y(v * 0.98)] as [number, number])),
    `M${r1(X(0))} ${r1(Y(0))} L${r1(X(1))} ${r1(Y(1.03))}`,
  ];
  const panel = (ox: number, label: string, curve: string): string => `
    <g transform="translate(${ox} 0)">
      <rect x="0" y="6" width="${W}" height="116" rx="10" fill="#FFFFFF" stroke="#E1EBE4" stroke-width="2"/>
      <line x1="${O[0]}" y1="${O[1] - AH}" x2="${O[0]}" y2="${O[1]}" stroke="#A9B6A9" stroke-width="2"/>
      <line x1="${O[0]}" y1="${O[1]}" x2="${O[0] + AW}" y2="${O[1]}" stroke="#A9B6A9" stroke-width="2"/>
      <path d="${curve}" stroke="${P3.leaf}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${O[0] - 9}" y="${O[1] - AH / 2}" transform="rotate(-90 ${O[0] - 9} ${O[1] - AH / 2})" text-anchor="middle" font-size="13" font-weight="700" fill="#6B7684">광합성량</text>
      <text x="${O[0] + AW / 2}" y="${O[1] + 17}" text-anchor="middle" font-size="13" font-weight="700" fill="#6B7684">요인의 값</text>
      <text x="${W / 2}" y="141" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">${label}</text>
    </g>`;
  return svg(
    "0 0 340 150",
    `
    ${panel(6, "(가)", curves[0])}
    ${panel(117, "(나)", curves[1])}
    ${panel(228, "(다)", curves[2])}
    `,
    "요인의 값에 따른 광합성량 그래프 세 가지 모양, (가) 늘다가 일정, (나) 늘다가 꼭대기를 지나 빠르게 감소, (다) 계속 증가",
  );
}

// ── 낮·밤 기체 출입(dayNightGasFig) — 교과서 그림 V-4 구도의 자체 도해 ──────
// blank로 라벨 하나를 ㉠으로 가린다(퀴즈용): dayIn(낮 흡수)·dayOut(낮 방출)·nightIn·nightOut.
export function dayNightGasFig(o?: { blank?: "dayIn" | "dayOut" | "nightIn" | "nightOut" }): string {
  const blank = o?.blank;
  const lab = (key: string, label: string): string => (blank === key ? "㉠" : label);
  const wOf = (key: string, w: number): number => (blank === key ? 34 : w);
  const pill = (x: number, y: number, w: number, label: string, c: string, dark = false): string =>
    `<g><rect x="${x - w / 2}" y="${y - 11}" width="${w}" height="22" rx="11" fill="${dark ? "#39445B" : "#FFFFFF"}" stroke="${c}" stroke-width="2.2"/>
     <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="${dark ? "#F2F4F6" : "#333D4B"}">${label}</text></g>`;
  const leaf = (cx: number): string => `
    <path d="M${cx} 64 C${cx + 30} 80 ${cx + 38} 108 ${cx + 31} 128 C${cx + 24} 144 ${cx + 10} 150 ${cx} 150 C${cx - 10} 150 ${cx - 24} 144 ${cx - 31} 128 C${cx - 38} 108 ${cx - 30} 80 ${cx} 64 Z" fill="#51CF66" stroke="#1E5A2A" stroke-width="2.6"/>
    <path d="M${cx} 68 L${cx} 148" stroke="#1E5A2A" stroke-width="1.8" opacity="0.5"/>`;
  const arrIn = (cx: number, c: string): string =>
    `<path d="M${cx - 74} 96 q8 16 34 22" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${cx - 44} 116 l10 3 -7 7 Z" fill="${c}"/>`;
  const arrOut = (cx: number, c: string): string =>
    `<path d="M${cx + 40} 118 q26 -4 34 -20" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${cx + 72} 102 l7 -8 3 10 Z" fill="${c}"/>`;
  return svg(
    "0 0 340 190",
    `
    <rect x="4" y="6" width="162" height="178" rx="14" fill="#EFF8FF" stroke="#D5E8F5" stroke-width="2"/>
    <rect x="174" y="6" width="162" height="178" rx="14" fill="#2E3650" stroke="#232B45" stroke-width="2"/>
    <circle cx="34" cy="34" r="11" fill="${P3.light}"/>
    <path d="M34 18 v4 M34 46 v4 M18 34 h4 M46 34 h4" stroke="${P3.light}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M312 24 a10 10 0 1 0 5 18 a8 8 0 0 1 -5 -18" fill="#B9C2CC"/>
    <text x="85" y="176" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">낮</text>
    <text x="255" y="176" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8F5">밤</text>
    ${leaf(94)}
    ${arrIn(94, P3.co2)}
    ${pill(52, 84, wOf("dayIn", 78), lab("dayIn", "이산화 탄소"), P3.co2)}
    ${arrOut(94, P3.o2)}
    ${pill(140, 88, wOf("dayOut", 44), lab("dayOut", "산소"), P3.o2)}
    ${leaf(254)}
    ${arrIn(254, P3.o2)}
    ${pill(212, 84, wOf("nightIn", 44), lab("nightIn", "산소"), P3.o2, true)}
    ${arrOut(254, P3.co2)}
    ${pill(292, 84, wOf("nightOut", 78), lab("nightOut", "이산화 탄소"), P3.co2, true)}
    `,
    "낮과 밤 잎의 기체 출입, 낮에는 이산화 탄소를 흡수하고 산소를 방출하며, 밤에는 반대",
  );
}

// ── 광합성 과정 도식(psFlowFig) — 교과서 그림 V-2 구도의 자체 도해 ──────────
// blanks에 넣은 키의 이름표가 ㉠㉡㉢…으로 가려진다(퀴즈 정답 유출 차단).
// 키: light · co2 · water · glucose · o2 · starch · place(엽록체)
export type PsFlowKey = "light" | "co2" | "water" | "glucose" | "o2" | "starch" | "place";

export function psFlowFig(o?: { blanks?: PsFlowKey[] }): string {
  const blanks = o?.blanks ?? [];
  const MASK = ["㉠", "㉡", "㉢", "㉣"];
  // 가림 글자는 늘 같은 차례(장소, 빛, 이산화 탄소, 물, 포도당, 산소, 녹말)로 매긴다. 그림 몸과 aria가 같은 표를 쓴다.
  const LABEL: Record<PsFlowKey, string> = { place: "엽록체", light: "빛에너지", co2: "이산화 탄소", water: "물", glucose: "포도당", o2: "산소", starch: "녹말" };
  const N = { ...LABEL };
  let mi = 0;
  (["place", "light", "co2", "water", "glucose", "o2", "starch"] as PsFlowKey[]).forEach((k) => {
    if (blanks.includes(k)) N[k] = MASK[Math.min(mi++, MASK.length - 1)];
  });
  const name = (key: PsFlowKey, _label: string): string => N[key];
  const pill = (x: number, y: number, w: number, label: string, c: string, dark = false): string =>
    `<g><rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${dark ? c : "#FFFFFF"}" stroke="${c}" stroke-width="2.2"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${dark ? "#FFFFFF" : "#333D4B"}">${label}</text></g>`;
  const arrow = (x1: number, y1: number, x2: number, y2: number, c: string, halo = false): string => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = x2 - 9 * Math.cos(ang);
    const hy = y2 - 9 * Math.sin(ang);
    const px = 5.2 * Math.cos(ang + Math.PI / 2);
    const py = 5.2 * Math.sin(ang + Math.PI / 2);
    const head = `M${r1(x2)} ${r1(y2)} L${r1(hx + px)} ${r1(hy + py)} L${r1(hx - px)} ${r1(hy - py)} Z`;
    // halo: 엽록체 테두리를 넘어 들어가는 화살은 흰 테를 먼저 깔아 테두리 위에서도 갈라 보이게 한다
    const under = halo
      ? `<line x1="${x1}" y1="${y1}" x2="${r1(hx)}" y2="${r1(hy)}" stroke="#FFFFFF" stroke-width="6.6" stroke-linecap="round"/><path d="${head}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="3.2" stroke-linejoin="round"/>`
      : "";
    return `${under}<line x1="${x1}" y1="${y1}" x2="${r1(hx)}" y2="${r1(hy)}" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="${head}" fill="${c}"/>`;
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
    <!-- 나오는 것(오른쪽). 포도당 화살은 이름표 왼쪽 아래에서 멈춰 촉이 가리지 않게 한다 -->
    ${arrow(236, 99.5, 264, 91.5, P3.glucose)}
    ${pill(300, 84, blanks.includes("glucose") ? 40 : 66, name("glucose", "포도당"), P3.glucose)}
    ${arrow(250, 140, 288, 152, P3.o2)}
    ${pill(300, 158, blanks.includes("o2") ? 40 : 54, name("o2", "산소"), P3.o2)}
    <!-- 포도당 → 녹말: 포도당에서 이어지는 짧은 화살이 엽록체 안으로 들어가 녹말 이름표에 닿는다(녹말은 엽록체 안에 저장) -->
    ${arrow(292, 98, 236, 138, "#8B95A1", true)}
    ${pill(212, 140, 40, name("starch", "녹말"), P3.starch)}
    `,
    `광합성 과정 도식. 들어가는 것: ${N.light}, ${N.co2}, ${N.water}. 일어나는 곳: ${N.place}. 나오는 것: ${N.glucose}, ${N.o2}. ${N.glucose}은 ${N.place} 안에서 ${N.starch}로 바뀌어 저장된다`,
  );
}
