// bio4Figures — 중1 Ⅱ v3 문제·recap 그림(SVG)과 미니아트.
// 파운드리 문법(3스톱 그라데이션·좌상단 키라이트·접촉 그림자·재질별 최암색 외곽선)을 지킨다.
// 퀴즈용 그림은 정답 유출 가림 인자를 받고, concept·recap용은 무인자 완성본을 쓴다.

import { B4 } from "./bio4Kit";

/** 공통 SVG 래퍼 — 루트에 fill="none"(사진·rect 검정 채움 사고 방지). */
const svg = (vb: string, body: string, aria = ""): string =>
  `<svg viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${aria}">${body}</svg>`;

// ── recap 미니아트(64×64 플랫 문법 — 과학 *Figures 관례) ─────────────────
const MINI: Record<string, () => string> = {
  cellUnit: () =>
    svg("0 0 64 64", `
      <circle cx="32" cy="33" r="21" fill="${B4.cytoAnimal}" stroke="${B4.membrane}" stroke-width="3"/>
      <circle cx="32" cy="33" r="8" fill="${B4.nucleus}" opacity=".85"/>
      <circle cx="21" cy="26" r="2.4" fill="${B4.mito}"/>
      <circle cx="43" cy="41" r="2.4" fill="${B4.mito}"/>
    `, "세포 미니 도해"),
  // L1: 사람 실루엣이 세포 칸으로 채워짐 — "모든 생물은 세포로"
  bodyCells: () => {
    const rows: string[] = [];
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 4; x++)
        rows.push(`<rect x="${21 + x * 6}" y="${22 + y * 6.4}" width="5" height="5.4" rx="1.6" fill="${B4.cytoAnimal}" stroke="${B4.bioDeep}" stroke-width="0.9"/>`);
    return svg("0 0 64 64", `
      <circle cx="32" cy="11" r="7" fill="${B4.cytoAnimal}" stroke="${B4.bioDeep}" stroke-width="2"/>
      <path d="M20 22 h24 v18 c0 8 -4 14 -12 14 c-8 0 -12 -6 -12 -14 Z" fill="#fff" stroke="${B4.bioDeep}" stroke-width="2"/>
      ${rows.join("")}
    `, "세포로 채워진 사람 실루엣");
  },
  // L1: 돋보기 + 아주 작은 점 — "세포는 아주 작다"
  microSize: () => svg("0 0 64 64", `
      <line x1="8" y1="52" x2="56" y2="52" stroke="#A9B6A9" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="8" y1="46" x2="8" y2="52" stroke="#A9B6A9" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="56" y1="46" x2="56" y2="52" stroke="#A9B6A9" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="28" cy="26" r="14" fill="#EAF6FF" stroke="${B4.water}" stroke-width="3"/>
      <line x1="38" y1="36" x2="48" y2="46" stroke="${B4.water}" stroke-width="4.6" stroke-linecap="round"/>
      <circle cx="28" cy="26" r="4.6" fill="${B4.membrane}"/>
    `, "돋보기 속 작은 세포와 눈금"),
  // L2: 공통 3종 세트 — 막(테두리)·핵·마이토콘드리아
  coreTrio: () => svg("0 0 64 64", `
      <circle cx="32" cy="32" r="24" fill="${B4.cytoAnimal}" stroke="${B4.membrane}" stroke-width="4"/>
      <circle cx="32" cy="30" r="9.5" fill="${B4.nucleus}"/>
      <rect x="17" y="42" width="15" height="8" rx="4" fill="${B4.mito}" transform="rotate(-18 24 46)"/>
      <rect x="36" y="17" width="13" height="7" rx="3.5" fill="${B4.mito}" transform="rotate(22 42 20)"/>
    `, "세포막·핵·마이토콘드리아 3종 세트"),
  // L2: 식물의 +2 — 육각 벽 + 엽록체
  plantPlus: () => svg("0 0 64 64", `
      <path d="M20 10 L44 10 L56 32 L44 54 L20 54 L8 32 Z" fill="${B4.cytoPlant}" stroke="${B4.wall}" stroke-width="4.6" stroke-linejoin="round"/>
      <path d="M22.5 14 L41.5 14 L51.5 32 L41.5 50 L22.5 50 L12.5 32 Z" fill="none" stroke="${B4.membrane}" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cx="27" cy="28" rx="8.5" ry="5.5" fill="${B4.chloro}" transform="rotate(-15 27 28)"/>
      <ellipse cx="38" cy="40" rx="8.5" ry="5.5" fill="${B4.chloro}" transform="rotate(12 38 40)"/>
    `, "육각형 세포벽과 엽록체"),
  // L3: 받침 유리 + 덮개 유리 비스듬히
  slideSteps: () => svg("0 0 64 64", `
      <ellipse cx="32" cy="54" rx="24" ry="3.5" fill="#2A3A5E" opacity="0.12"/>
      <rect x="8" y="36" width="48" height="14" rx="3" fill="#EAF4FB" stroke="#9DB8CC" stroke-width="2.4"/>
      <ellipse cx="32" cy="42" rx="10" ry="4.5" fill="${B4.water}" opacity="0.4"/>
      <rect x="20" y="14" width="30" height="20" rx="2" fill="#EAF6FF" opacity="0.75" stroke="#8FB8D8" stroke-width="2.2" transform="rotate(-24 35 24)"/>
    `, "받침 유리에 덮개 유리를 비스듬히 덮는 모습"),
  // L3: 스포이트 염색 방울 + 물든 핵
  stainDrop: () => svg("0 0 64 64", `
      <path d="M40 6 l10 10 M50 16 l-6 6 -10 -10 Z" fill="#C9CDD2" stroke="#6B7684" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M33 30 c0 -5 6 -11 6 -11 c0 0 6 6 6 11 a6 6 0 0 1 -12 0 Z" fill="${B4.water}"/>
      <circle cx="28" cy="46" r="14" fill="#E7F0FF" stroke="#7FA8E0" stroke-width="2.6"/>
      <circle cx="28" cy="46" r="5.5" fill="#3B5BDB"/>
    `, "염색 방울과 푸르게 물든 핵"),
  // L4: 세 세포 실루엣 나란히 — 신경(선)·적혈구(원반)·상피(타일)
  cellTypes: () => svg("0 0 64 64", `
      <path d="M8 50 C16 38 20 26 24 16" stroke="#9775FA" stroke-width="4" stroke-linecap="round"/>
      <circle cx="26" cy="12" r="5" fill="#7048E8"/>
      <ellipse cx="40" cy="30" rx="11" ry="9" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4"/>
      <ellipse cx="40" cy="29" rx="5" ry="3.6" fill="#F03E3E" opacity="0.5"/>
      <path d="M34 48 l16 -3 4 9 -16 3 Z" fill="#A5D8FF" stroke="#1971C2" stroke-width="2.2" stroke-linejoin="round"/>
    `, "신경세포·적혈구·상피세포"),
  // L4: 모양=일 — 퍼즐 조각이 자리에 딱
  fitJob: () => svg("0 0 64 64", `
      <path d="M10 22 h18 v-8 a6 6 0 0 1 12 0 v8 h14 v32 h-44 Z" fill="#E9FAC8" stroke="${B4.bioDeep}" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="32" cy="38" r="7" fill="${B4.bio}" opacity="0.85"/>
      <path d="M46 10 l8 8" stroke="${B4.membrane}" stroke-width="3.4" stroke-linecap="round"/>
    `, "자리에 꼭 맞는 퍼즐 조각"),
  // L5: 구성 단계 계단(작→큰)
  stackLadder: () => svg("0 0 64 64", `
      <path d="M8 54 h12 v-10 h12 v-10 h12 v-10 h12 v-12" stroke="${B4.bioDeep}" stroke-width="3" fill="none" stroke-linejoin="round"/>
      <circle cx="14" cy="48" r="4.5" fill="${B4.membrane}"/>
      <circle cx="24" cy="38" r="3" fill="${B4.bio}"/><circle cx="30" cy="40" r="3" fill="${B4.bio}"/>
      <path d="M38 24 c-4 3 -4 8 0 10 c4 -2 4 -7 0 -10 Z" fill="${B4.mito}"/>
      <circle cx="54" cy="12" r="6.5" fill="none" stroke="${B4.ink}" stroke-width="2.4"/>
      <path d="M54 18 v9 M54 21 l-5 4 M54 21 l5 4" stroke="${B4.ink}" stroke-width="2.4" stroke-linecap="round"/>
    `, "세포에서 개체까지 오르는 계단"),
  // L5: 두 갈래 경로 — 식물(조직계)·동물(기관계)
  twoPath: () => svg("0 0 64 64", `
      <path d="M32 56 v-14 M32 42 C32 32 18 32 18 20 M32 42 C32 32 46 32 46 20" stroke="#8B95A1" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M12 16 h12 v10 h-12 Z" fill="#8CE99A" stroke="#2B8A3E" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="46" cy="18" r="8" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4"/>
      <path d="M42 18 c2 -4 6 -4 8 0 c-2 4 -6 4 -8 0 Z" fill="#E03131" opacity="0.5"/>
    `, "식물과 동물의 갈라지는 단계 경로"),
};

/** recap 카드 미니아트 — 키가 없으면 세포 기본 도해로 폴백(신규 키는 레슨 저작 때 추가). */
export function b4MiniArt(key: string): string {
  return (MINI[key] ?? MINI.cellUnit)();
}

// ── 세포 도해(L2·L3 공용) ──────────────────────────────────────
// 원칙: 동물·식물의 같은 구조는 같은 색(비교 가능성) · 식물세포는 육각형(사용자 확정) ·
// hotspot은 pad0 모드로 스팟 % = 좌표/뷰박스 × 100이 정확히 성립(좌표 주석 유지).

const CELL_DEFS = `
  <defs>
    <radialGradient id="b4CytoA" cx="0.38" cy="0.3" r="1">
      <stop offset="0" stop-color="#FFF6EA"/><stop offset="0.6" stop-color="#FFE8CC"/><stop offset="1" stop-color="#FFD8A8"/>
    </radialGradient>
    <radialGradient id="b4CytoP" cx="0.38" cy="0.3" r="1">
      <stop offset="0" stop-color="#F7FCE8"/><stop offset="0.6" stop-color="#E9FAC8"/><stop offset="1" stop-color="#D8F5A2"/>
    </radialGradient>
    <radialGradient id="b4Nuc" cx="0.36" cy="0.32" r="1">
      <stop offset="0" stop-color="#B197FC"/><stop offset="0.65" stop-color="#845EF7"/><stop offset="1" stop-color="#7048E8"/>
    </radialGradient>
    <linearGradient id="b4Mito" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF8787"/><stop offset="1" stop-color="#F03E3E"/>
    </linearGradient>
    <linearGradient id="b4Chl" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#69DB7C"/><stop offset="1" stop-color="#2F9E44"/>
    </linearGradient>
  </defs>`;

/** 마이토콘드리아(강낭콩 + 속 주름 한 줄) — 회전·위치 파라미터. */
const mito = (x: number, y: number, rot: number, sc = 1): string => `
  <g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">
    <rect x="-17" y="-9.5" width="34" height="19" rx="9.5" fill="url(#b4Mito)" stroke="#C92A2A" stroke-width="2.2"/>
    <path d="M-10 -3 C-6 3 -2 -6 2 0 C5 5 9 -3 12 1" stroke="#FFE3E3" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>`;

/** 엽록체(타원 + 속 알갱이) — 식물 전용. */
const chloro = (x: number, y: number, rot: number): string => `
  <g transform="translate(${x} ${y}) rotate(${rot})">
    <ellipse rx="19" ry="11.5" fill="url(#b4Chl)" stroke="#2B8A3E" stroke-width="2.2"/>
    <circle cx="-7" cy="0" r="2.6" fill="#B2F2BB" opacity="0.9"/>
    <circle cx="1" cy="-3" r="2.6" fill="#B2F2BB" opacity="0.9"/>
    <circle cx="7" cy="3" r="2.6" fill="#B2F2BB" opacity="0.9"/>
  </g>`;

const nucleus = (x: number, y: number, r: number): string => `
  <circle cx="${x}" cy="${y}" r="${r}" fill="url(#b4Nuc)" stroke="#5F3DC4" stroke-width="2.6"/>
  <ellipse cx="${x - r * 0.32}" cy="${y - r * 0.38}" rx="${r * 0.34}" ry="${r * 0.2}" fill="#FFFFFF" opacity="0.35"/>`;

/** 동물세포 도해 — 둥근 세포막(앰버) 안에 핵·마이토콘드리아.
 *  hotspot(pad0) 좌표: 세포막 (246,124)=(76.9%,51.7%) · 핵 (160,118)=(50%,49.2%) · 미토 (215,160)=(67.2%,66.7%). */
export function cellFigAnimal(): string {
  return svg("0 0 320 240", `${CELL_DEFS}
    <ellipse cx="160" cy="222" rx="104" ry="9" fill="#2A3A5E" opacity="0.08"/>
    <path d="M160 28 C230 30 250 80 246 124 C242 172 210 210 158 212 C106 210 72 172 70 122 C74 74 96 30 160 28 Z"
      fill="url(#b4CytoA)" stroke="#E8890C" stroke-width="5.5"/>
    <path d="M108 52 C126 40 146 36 162 36" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
    ${nucleus(160, 118, 34)}
    ${mito(105, 80, -20)}
    ${mito(215, 160, 15)}
    ${mito(112, 168, 40, 0.9)}
  `, "동물세포 도해 — 세포막 속에 핵과 마이토콘드리아");
}

/** 식물세포 도해 — 육각형 세포벽(브라운) + 안쪽 세포막(앰버) + 핵·마이토콘드리아·엽록체.
 *  hotspot(pad0) 좌표: 세포벽 (268,78)=(83.8%,32.5%) · 세포막 (61,157)=(19.1%,65.4%) ·
 *  핵 (150,120)=(46.9%,50%) · 엽록체 (218,90)=(68.1%,37.5%) · 미토 (238,142)=(74.4%,59.2%). */
export function cellFigPlant(): string {
  return svg("0 0 320 240", `${CELL_DEFS}
    <ellipse cx="160" cy="222" rx="120" ry="9" fill="#2A3A5E" opacity="0.08"/>
    <path d="M80 36 L240 36 L296 120 L240 204 L80 204 L24 120 Z"
      fill="url(#b4CytoP)" stroke="#846358" stroke-width="9" stroke-linejoin="round"/>
    <path d="M86 46 L234 46 L284 120 L234 194 L86 194 L36 120 Z"
      fill="none" stroke="#F59F00" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M100 58 C130 50 160 48 184 50" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
    ${nucleus(150, 120, 30)}
    ${chloro(105, 78, -15)}
    ${chloro(218, 90, 10)}
    ${chloro(196, 168, -25)}
    ${mito(98, 160, 30, 0.85)}
    ${mito(238, 142, -12, 0.85)}
  `, "식물세포 도해 — 육각형 세포벽 안에 세포막·핵·엽록체·마이토콘드리아");
}

/** 퀴즈용 — 식물세포에 (가)~(마) 태그만(이름 비표시, 정답 유출 차단).
 *  (가)엽록체(좌상)·(나)세포벽(우상)·(다)핵(중앙→아래)·(라)세포막(좌하)·(마)마이토콘드리아(우하). */
export function cellPartsQuizFig(): string {
  const tag = (x: number, y: number, t: string): string => `
    <rect x="${x - 17}" y="${y - 12}" width="34" height="24" rx="12" fill="#FFFFFF" stroke="#D7DEE6" stroke-width="1.6"/>
    <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${t}</text>`;
  const lead = (x1: number, y1: number, x2: number, y2: number): string =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8B95A1" stroke-width="1.8"/>`;
  return svg("0 0 320 262", `${CELL_DEFS}
    <g transform="translate(0 14)">
      <path d="M80 36 L240 36 L296 120 L240 204 L80 204 L24 120 Z"
        fill="url(#b4CytoP)" stroke="#846358" stroke-width="9" stroke-linejoin="round"/>
      <path d="M86 46 L234 46 L284 120 L234 194 L86 194 L36 120 Z"
        fill="none" stroke="#F59F00" stroke-width="3.2" stroke-linejoin="round"/>
      ${nucleus(150, 120, 30)}
      ${chloro(105, 78, -15)}
      ${chloro(218, 90, 10)}
      ${chloro(196, 168, -25)}
      ${mito(98, 160, 30, 0.85)}
      ${mito(238, 142, -12, 0.85)}
    </g>
    ${lead(105, 92, 52, 40)}${tag(40, 32, "(가)")}
    ${lead(268, 92, 296, 44)}${tag(298, 36, "(나)")}
    ${lead(150, 148, 150, 240)}${tag(150, 246, "(다)")}
    ${lead(53, 182, 30, 226)}${tag(28, 238, "(라)")}
    ${lead(243, 158, 288, 216)}${tag(292, 228, "(마)")}
  `, "식물세포 도해 — 다섯 구조에 (가)~(마) 표시");
}

// ── L4 다양한 세포 도해(카드 크기에서 사진풍은 뭉개짐 — 도해가 정답이라는 확정 관행) ──

/** 세포 유형 아트 — 랩 카드·recap 공용. kind: nerve(신경)·rbc(적혈구)·epi(상피). */
export function cellTypeArt(kind: "nerve" | "rbc" | "epi"): string {
  if (kind === "nerve")
    return svg("0 0 120 120", `
      <path d="M14 96 C34 84 44 72 50 62" stroke="#9775FA" stroke-width="5" stroke-linecap="round"/>
      <path d="M14 96 l-7 6 M14 96 l2 9 M14 96 l-9 -2" stroke="#9775FA" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M50 62 C58 50 62 44 66 40" stroke="#9775FA" stroke-width="6" stroke-linecap="round"/>
      <path d="M78 30 m-16 0 l7 -12 l10 -3 l9 6 l1 11 l-8 9 l-11 -1 Z" fill="#D0BFFF" stroke="#7048E8" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="78" cy="30" r="6" fill="#7048E8"/>
      <path d="M88 15 l6 -9 M97 27 l11 -4 M94 40 l9 7 M66 16 l-4 -10" stroke="#9775FA" stroke-width="3.4" stroke-linecap="round"/>
    `, "가늘고 긴 신경세포 — 신호를 전달해요");
  if (kind === "rbc")
    return svg("0 0 120 120", `
      <ellipse cx="60" cy="64" rx="40" ry="34" fill="#FFA8A8" stroke="#E03131" stroke-width="3.4"/>
      <ellipse cx="60" cy="62" rx="20" ry="15" fill="#F03E3E" opacity="0.45"/>
      <path d="M32 44 C40 36 50 32 58 32" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.65"/>
    `, "가운데가 오목한 원반 모양 적혈구 — 산소를 운반해요");
  return svg("0 0 120 120", `
    <path d="M12 74 L48 66 L58 88 L20 96 Z" fill="#A5D8FF" stroke="#1971C2" stroke-width="3" stroke-linejoin="round"/>
    <path d="M48 66 L88 62 L96 84 L58 88 Z" fill="#D0EBFF" stroke="#1971C2" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 48 L68 42 L76 62 L38 68 Z" fill="#D0EBFF" stroke="#1971C2" stroke-width="3" stroke-linejoin="round"/>
    <path d="M68 42 L104 40 L110 60 L76 62 Z" fill="#A5D8FF" stroke="#1971C2" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="52" cy="55" r="4" fill="#1971C2" opacity="0.6"/>
    <circle cx="88" cy="51" r="4" fill="#1971C2" opacity="0.6"/>
    <circle cx="36" cy="84" r="4" fill="#1971C2" opacity="0.6"/>
  `, "납작하고 편평한 상피세포 — 표면을 덮어 보호해요");
}

// ── 문제 그림 ──────────────────────────────────────────────────

/** L1 크기 눈금 사다리 — (가)1 m·(나)1 cm·(다)0.1 mm·(라)현미경의 세계.
 *  퀴즈용: 세포는 그리지 않는다(정답 유출 차단) — 기준 물체만 보여 주고 자리를 고르게 한다. */
export function sizeLadderFig(): string {
  const box = (x: number, lab: string, size: string, art: string): string => `
    <g>
      <rect x="${x}" y="34" width="72" height="84" rx="12" fill="#FFFFFF" stroke="#D7DEE6" stroke-width="2"/>
      <text x="${x + 36}" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">${lab}</text>
      ${art}
      <text x="${x + 36}" y="108" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${size}</text>
    </g>`;
  // 기준 아이콘(글자 없음): 사람 · 동전 · 머리카락 확대 · 현미경
  const person = `<circle cx="52" cy="52" r="7" fill="none" stroke="#333D4B" stroke-width="2.4"/>
    <path d="M52 59 v18 M52 64 l-9 7 M52 64 l9 7 M52 77 l-7 12 M52 77 l7 12" stroke="#333D4B" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  const coin = `<circle cx="134" cy="68" r="15" fill="#FFE9B8" stroke="#C9A040" stroke-width="2.6"/>
    <circle cx="134" cy="68" r="9" fill="none" stroke="#C9A040" stroke-width="1.8" opacity=".7"/>`;
  const hair = `<circle cx="216" cy="68" r="16" fill="#F4F7FA" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="3 3"/>
    <line x1="216" y1="54" x2="216" y2="82" stroke="#6B4F2E" stroke-width="4" stroke-linecap="round"/>`;
  const micro = `<path d="M292 50 l10 12 M302 62 l-7 6 -10 -12 Z" fill="#5A6B7F" stroke="#3E4C5C" stroke-width="1.6"/>
    <path d="M288 74 c0 8 6 12 12 12 M282 90 h32" stroke="#3E4C5C" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  return `<svg viewBox="0 0 340 132" fill="none" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="큰 것부터 작은 것 순서의 크기 눈금 사다리">
    ${box(16, "(가)", "약 1 m", person)}
    ${box(98, "(나)", "약 1 cm", coin)}
    ${box(180, "(다)", "약 0.1 mm", hair)}
    ${box(262, "(라)", "0.1 mm 미만", micro)}
    <path d="M92 76 h4 M174 76 h4 M256 76 h4" stroke="#8B95A1" stroke-width="2"/>
    <text x="221" y="128" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8B95A1">(다)쯤이 맨눈의 한계 — 그보다 작으면 현미경!</text>
  </svg>`;
}
