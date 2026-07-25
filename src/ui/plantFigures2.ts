// plantFigures2 — 중2 Ⅴ 식물과 에너지(v2) 문제·개념 도해와 recap 미니아트.
// 손코딩 SVG만 쓴다(라벨이 본질인 도해는 발주 사진이 아니라 벡터가 정본 — CLAUDE.md 규칙).
// 색은 tokens.css의 --plant-* / plant2.css의 --pgx-* 변수를 그대로 참조한다.

const DEFS = `<linearGradient id="pf-leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--plant-leaf-hi)"/><stop offset=".55" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></linearGradient>
<linearGradient id="pf-soil" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8C6242"/><stop offset="1" stop-color="#4E3421"/></linearGradient>
<radialGradient id="pf-sun" cx=".4" cy=".35" r=".7"><stop stop-color="#FFF0C2"/><stop offset=".6" stop-color="var(--plant-sun)"/><stop offset="1" stop-color="#F3A93B"/></radialGradient>
<linearGradient id="pf-stem" x1="0" y1="0" x2="1" y2="0"><stop stop-color="var(--plant-stem-hi)"/><stop offset=".5" stop-color="var(--plant-stem)"/><stop offset="1" stop-color="var(--plant-stem-lo)"/></linearGradient>
<radialGradient id="pf-chl" cx=".32" cy=".26" r=".9"><stop stop-color="var(--plant-leaf-hi)"/><stop offset=".6" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></radialGradient>
<marker id="pf-ar" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9Z" fill="context-stroke"/></marker>`;

const wrap = (vb: string, inner: string, label: string): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}"><defs>${DEFS}</defs>${inner}</svg>`;

/** 화살표 — marker가 context-stroke를 못 받는 브라우저를 위해 머리를 직접 그린다. */
function arrow(x0: number, y0: number, x1: number, y1: number, color: string, w = 2.6): string {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const h = Math.max(2.4, w * 2.6);
  const p1 = `${x1 - Math.cos(a - 0.45) * h} ${y1 - Math.sin(a - 0.45) * h}`;
  const p2 = `${x1 - Math.cos(a + 0.45) * h} ${y1 - Math.sin(a + 0.45) * h}`;
  return `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${color}" stroke-width="${w}"/><path d="M${x1} ${y1} L${p1} L${p2}Z" fill="${color}"/>`;
}

const txt = (x: number, y: number, s: string, size = 12, color = "var(--n700)", anchor = "middle", weight = 850): string =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${color}">${s}</text>`;

/** 흰 할로를 두른 라벨 — 그림 위에 얹어도 읽힌다. */
const label = (x: number, y: number, s: string, size = 12, color = "var(--n800)"): string =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="900" fill="${color}" stroke="#fff" stroke-width="3.4" paint-order="stroke">${s}</text>`;

// ── L1 · 잎세포와 엽록체 ─────────────────────────────────────
export function leafCellFig(): string {
  const cells: string[] = [];
  // 3×2 세포 격자 — 세포벽으로 나뉘고, 각 세포 안에 엽록체가 들어 있다.
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 26 + c * 92;
      const y = 42 + r * 58;
      cells.push(`<rect x="${x}" y="${y}" width="86" height="52" rx="13" fill="#F2FAF1" stroke="var(--plant-leaf-lo)" stroke-width="2"/>`);
      for (let i = 0; i < 4; i++) {
        const cx = x + 20 + (i % 2) * 40;
        const cy = y + 17 + Math.floor(i / 2) * 19;
        cells.push(`<ellipse cx="${cx}" cy="${cy}" rx="12" ry="7.5" transform="rotate(${i % 2 ? 18 : -14} ${cx} ${cy})" fill="url(#pf-chl)" stroke="var(--plant-leaf-lo)" stroke-width="1.1"/>`);
      }
    }
  }
  return wrap("0 0 320 200",
    `<rect x="4" y="4" width="312" height="192" rx="16" fill="#FBFEFA"/>
     ${cells.join("")}
     ${arrow(250, 182, 232, 158, "var(--n700)", 2.2)}
     ${label(252, 194, "초록색 알갱이", 12)}
     ${txt(160, 26, "현미경으로 본 잎세포", 12.5, "var(--n600)")}`,
    "현미경으로 본 잎세포와 그 안의 초록색 알갱이");
}

// ── L2 · 광합성의 재료가 들어오는 길 ────────────────────────
const FIG_BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

/**
 * 식물 전체 발주 일러스트 + ㉠~㉣ 화살표 SVG 오버레이(하이브리드 표준 — 라스터가 구조를,
 * 벡터가 경로·라벨을 맡는다). 초판은 전부 손코딩 SVG였는데 잎이 공중에 떠 보여
 * 화살표의 출발점이 안 읽힌다는 실사용 지적을 받았다(2026-07-26 재작도).
 *
 * 좌표 규약: 원본 1456×1092(정확히 4:3)에서 실측한 뒤 viewBox 100×75(=폭 %)로 환산했다.
 *   줄기 x=49.8 · 흙 표면 y=50.5 · 뿌리 뭉치 y 52~70
 *   왼위 잎 x 25~46 / y 12.7~22.5 · 오른위 잎 x 55~75 / y 12.7~23
 *   왼아래 잎 x 24~45 / y 29~41 · 오른아래 잎 x 55~75 / y 29~41
 * 라벨은 비어 있는 하늘(좌상·우상·우중)과 줄기 왼쪽 빈칸에만 놓는다.
 */
export function photoPathFig(): string {
  // 흰 케이싱을 먼저 깔아 잎·흙 위에서도 화살표가 또렷하게 읽히도록 한다.
  const ar = (x0: number, y0: number, x1: number, y1: number, color: string): string =>
    `${arrow(x0, y0, x1, y1, "#FFFFFF", 2.6)}${arrow(x0, y0, x1, y1, color, 1.2)}`;
  const tag = (x: number, y: number, s: string, color: string): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="5.4" font-weight="900" fill="${color}" stroke="#fff" stroke-width="1.7" paint-order="stroke">${s}</text>`;

  const overlay = `<svg viewBox="0 0 100 75" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
    <defs><radialGradient id="pf-sun2" cx=".4" cy=".35" r=".7"><stop stop-color="#FFF0C2"/><stop offset=".6" stop-color="#FFC44F"/><stop offset="1" stop-color="#F3A93B"/></radialGradient></defs>
    <circle cx="10" cy="9" r="5.6" fill="url(#pf-sun2)"/>
    <path d="M10 1.4V.2M10 18.4v-1.2M1.4 9H.2M19.8 9h-1.2M4.2 3.2l-.9-.9M16.7 15.7l.9.9M15.8 3.2l.9-.9M4.2 14.8l-.9.9" stroke="#FFC44F" stroke-width="1.1"/>
    ${ar(15.4, 12.4, 30.5, 16.4, "#E8A33D")}
    ${tag(25.5, 8.6, "㉠", "#A96410")}
    ${ar(92, 13.5, 71.5, 18, "#4B5563")}
    ${tag(93.5, 8.4, "㉡", "#374151")}
    ${ar(70, 35, 92, 29.5, "#0E8F8A")}
    ${tag(93.5, 36.5, "㉢", "#0A6F6B")}
    ${ar(49.8, 65, 49.8, 30, "#1E6FBF")}
    ${tag(54.5, 46.5, "㉣", "#1655A0")}
  </svg>`;

  return `<span class="pgx-photo-frame" style="display:block;position:relative">
    <img src="${FIG_BASE}plant2/figs/whole-plant.webp" alt="뿌리와 줄기가 이어진 식물 한 그루" style="display:block;width:100%;height:auto"/>
    ${overlay}
  </span>`;
}

/** 광합성 한 줄 도식 — 개념 스텝·recap 공용. */
export function photoSummaryFig(): string {
  const box = (x: number, s: string, color: string, sub: string): string =>
    `<rect x="${x}" y="70" width="72" height="46" rx="14" fill="#fff" stroke="${color}" stroke-width="2"/>
     ${txt(x + 36, 92, s, 13, "var(--n800)")}${txt(x + 36, 108, sub, 10.5, "var(--n500)", "middle", 750)}`;
  return wrap("0 0 320 170",
    `<rect x="4" y="4" width="312" height="162" rx="16" fill="#FBFEFA"/>
     ${box(14, "이산화 탄소", "var(--plant-carbon)", "기공으로")}
     ${txt(100, 98, "+", 18, "var(--n500)")}
     ${box(112, "물", "var(--plant-xylem)", "뿌리에서")}
     ${arrow(192, 93, 226, 93, "var(--subj-plant, #27864B)", 3)}
     ${box(234, "포도당", "var(--plant-glucose)", "+ 산소")}
     <circle cx="209" cy="52" r="15" fill="url(#pf-sun)"/>
     ${arrow(209, 68, 209, 84, "var(--plant-sun)", 2.6)}
     ${label(209, 30, "빛에너지", 12)}
     ${txt(160, 140, "광합성이 일어나는 곳: 잎세포의 엽록체", 12, "var(--n600)", "middle", 800)}`,
    "이산화 탄소와 물이 빛에너지를 받아 포도당과 산소가 되는 광합성 도식");
}

// ── L3 · 센서 그래프 두 장 ──────────────────────────────────
/**
 * 빛을 비춘 밀폐 용기 안 기체 농도 변화. 플롯 영역 x=[ox+22, ox+126] · y=[44(위), 118(아래)].
 * 값 v(0~1)를 y로 옮기는 식은 단 하나: y = 118 − v·74.
 * (초판은 감소 곡선에 반전을 두 번 걸어 이산화 탄소가 '증가'하는 과학 오류가 있었다 — 2026-07-26 수정.)
 */
export function sensorGraphFig(): string {
  const panel = (ox: number, title: string, rising: boolean, color: string): string => {
    const pts: string[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const v = rising ? 1 - Math.exp(-2.0 * t) : Math.exp(-2.2 * t); // 남은 양(0~1)
      const x = ox + 22 + t * 104;
      const y = 118 - v * 74;
      pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return `<rect x="${ox + 6}" y="30" width="132" height="112" rx="12" fill="#fff" stroke="var(--n200)"/>
      <path d="M${ox + 22} 40 V118 H${ox + 130}" stroke="var(--n400)" stroke-width="1.6"/>
      <path d="${pts.join(" ")}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
      ${txt(ox + 74, 22, `${title} 농도`, 12, "var(--n700)")}
      ${txt(ox + 76, 136, "시간", 11, "var(--n500)", "middle", 750)}`;
  };
  return wrap("0 0 320 160",
    `<rect x="4" y="4" width="312" height="152" rx="16" fill="#FBFEFA"/>
     ${panel(4, "이산화 탄소", false, "var(--plant-carbon)")}
     ${panel(160, "산소", true, "var(--plant-oxygen)")}`,
    "빛을 비춘 용기 안에서 이산화 탄소 농도는 내려가고 산소 농도는 올라가는 두 그래프");
}

/** 아이오딘 검정 결과 — 빛 받은 잎만 청람색. */
export function iodineResultFig(): string {
  const dish = (cx: number, name: string, blue: boolean): string =>
    `<circle cx="${cx}" cy="86" r="46" fill="#F4F8FB" stroke="#9FB6C6" stroke-width="2"/>
     <ellipse cx="${cx}" cy="86" rx="34" ry="22" transform="rotate(-12 ${cx} 86)" fill="${blue ? "#2B3A8F" : "#E4E2C8"}" stroke="${blue ? "#1B2668" : "#B9B694"}" stroke-width="1.6"/>
     ${txt(cx, 152, name, 12, "var(--n700)")}`;
  return wrap("0 0 320 170",
    `<rect x="4" y="4" width="312" height="162" rx="16" fill="#FBFEFA"/>
     ${dish(84, "빛을 받은 잎", true)}
     ${dish(236, "빛을 받지 못한 잎", false)}
     ${txt(160, 26, "아이오딘 용액을 떨어뜨린 뒤", 12, "var(--n600)")}`,
    "아이오딘 용액을 떨어뜨린 두 잎 조각의 색깔 비교");
}

// ── L4 · 전등 거리별 결과 막대 ─────────────────────────────
export function distanceBarFig(): string {
  const rows = [
    { name: "10 cm", v: 0.72, w: 168 },
    { name: "30 cm", v: 0.41, w: 96 },
    { name: "60 cm", v: 0.15, w: 35 },
  ];
  const bars = rows.map((r, i) => {
    const y = 52 + i * 38;
    return `${txt(46, y + 15, r.name, 12, "var(--n700)", "middle")}
      <rect x="78" y="${y}" width="176" height="20" rx="10" fill="var(--n100)"/>
      <rect x="78" y="${y}" width="${r.w}" height="20" rx="10" fill="var(--subj-plant, #27864B)"/>
      ${txt(286, y + 15, `${r.v.toFixed(2)}`, 11.5, "var(--n600)", "middle", 800)}`;
  }).join("");
  return wrap("0 0 320 180",
    `<rect x="4" y="4" width="312" height="172" rx="16" fill="#FBFEFA"/>
     ${txt(160, 30, "전등과의 거리에 따른 10분 뒤 산소 농도 증가량(%)", 11.5, "var(--n600)")}
     ${bars}`,
    "전등과의 거리에 따른 산소 농도 증가량 막대그래프");
}

// ── L5 · 환경요인 그래프 세 장 ─────────────────────────────
export type FactorKind = "sat" | "sat2" | "drop";

export function factorGraphFig(): string {
  const curve = (kind: FactorKind): string => {
    const pts: string[] = [];
    for (let i = 0; i <= 24; i++) {
      const x = i / 24;
      let y: number;
      // 꺾이는 지점을 살짝 둥글게(교과서 그림처럼) — 폭 w 구간에서 2차식으로 이어 붙인다.
      const soft = (v: number, k: number): number => {
        const w = 0.12;
        if (v <= k - w) return v / k;
        if (v >= k + w) return 1;
        const u = (v - (k - w)) / (2 * w);
        return (k - w) / k + (1 - (k - w) / k) * (2 * u - u * u);
      };
      if (kind === "drop") y = x <= 0.62 ? soft(x, 0.62) * 0.995 : Math.max(0.05, 1 - (x - 0.62) * 3.4);
      else if (kind === "sat") y = soft(x, 0.55);
      else y = soft(x, 0.42);
      pts.push(`${i === 0 ? "M" : "L"}${20 + x * 68} ${102 - y * 62}`);
    }
    return pts.join(" ");
  };
  const panel = (ox: number, tag: string, kind: FactorKind): string =>
    `<g transform="translate(${ox} 0)">
      <rect x="6" y="24" width="96" height="106" rx="12" fill="#fff" stroke="var(--n200)"/>
      <path d="M20 38 V102 H96" stroke="var(--n400)" stroke-width="1.6"/>

      <path d="${curve(kind)}" stroke="var(--subj-plant, #27864B)" stroke-width="3"/>
      ${txt(54, 150, tag, 13, "var(--n700)")}
    </g>`;
  return wrap("0 0 320 166",
    `<rect x="4" y="4" width="312" height="158" rx="16" fill="#FBFEFA"/>
     ${txt(160, 14, "세로축: 광합성량", 11, "var(--n500)", "middle", 800)}
     ${panel(2, "(가)", "sat")}${panel(108, "(나)", "sat2")}${panel(214, "(다)", "drop")}`,
    "세로축이 광합성량인 세 가지 그래프 (가) (나) (다)");
}

// ── L6 · 낮과 밤의 기체 출입 ───────────────────────────────
export function dayNightFig(): string {
  const scene = (ox: number, night: boolean, tagIn: string, tagOut: string): string =>
    `<g transform="translate(${ox} 0)">
      <rect x="6" y="16" width="142" height="132" rx="14" fill="${night ? "#1B2B4D" : "#EAF6FF"}" stroke="var(--n200)"/>
      ${night
        ? `<path d="M118 40 a12 12 0 1 1-12-12 9 9 0 0 0 12 12Z" fill="#F5E9B8"/>`
        : `<circle cx="112" cy="40" r="13" fill="url(#pf-sun)"/>`}
      <path d="M77 130 V74" stroke="var(--plant-stem)" stroke-width="5"/>
      <path d="M77 92 Q66 90 58 88" stroke="var(--plant-stem)" stroke-width="3" fill="none"/>
      <path d="M77 84 Q88 82 96 80" stroke="var(--plant-stem)" stroke-width="3" fill="none"/>
      <ellipse cx="40" cy="86" rx="22" ry="10" transform="rotate(-14 40 86)" fill="url(#pf-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.4"/>
      <ellipse cx="114" cy="77" rx="21" ry="10" transform="rotate(12 114 77)" fill="url(#pf-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.4"/>
      <path d="M55 130 H99 L94 148 H60Z" fill="#D08A54" stroke="#7A4526" stroke-width="1.2"/>
      <rect x="51" y="124" width="52" height="9" rx="4" fill="#E09A62" stroke="#7A4526" stroke-width="1.2"/>
      ${arrow(20, 62, 44, 80, "#5A6472", 2.6)}
      ${arrow(112, 68, 136, 50, "#0E8F8A", 2.6)}
      ${label(20, 50, tagIn, 14, night ? "#F2F6FF" : "var(--n800)")}
      ${label(140, 38, tagOut, 14, night ? "#F2F6FF" : "var(--n800)")}
      ${txt(77, 164, night ? "밤" : "낮", 13, "var(--n700)")}
    </g>`;
  return wrap("0 0 320 176",
    `<rect x="4" y="4" width="312" height="168" rx="16" fill="#FBFEFA"/>
     ${scene(2, false, "㉠", "㉡")}${scene(164, true, "㉢", "㉣")}`,
    "낮과 밤에 식물에 드나드는 기체를 나타낸 그림");
}

/** 광합성과 호흡의 관계 — 물질이 서로 오가는 고리(개념·recap용). */
export function photoRespCycleFig(): string {
  return wrap("0 0 320 180",
    `<rect x="4" y="4" width="312" height="172" rx="16" fill="#FBFEFA"/>
     <rect x="24" y="52" width="104" height="76" rx="18" fill="#EAF7EF" stroke="var(--subj-plant, #27864B)" stroke-width="2"/>
     ${txt(76, 84, "광합성", 13.5, "var(--subj-plant-press, #1D6B3B)")}
     ${txt(76, 104, "양분 합성", 11, "var(--n600)", "middle", 750)}
     ${txt(76, 119, "빛에너지 흡수", 11, "var(--n600)", "middle", 750)}
     <rect x="192" y="52" width="104" height="76" rx="18" fill="#FFF3E8" stroke="#D9822B" stroke-width="2"/>
     ${txt(244, 84, "호흡", 13.5, "#A85A12")}
     ${txt(244, 104, "양분 분해", 11, "var(--n600)", "middle", 750)}
     ${txt(244, 119, "에너지 방출", 11, "var(--n600)", "middle", 750)}
     ${arrow(130, 74, 190, 74, "var(--plant-oxygen)", 2.6)}
     ${arrow(190, 108, 130, 108, "var(--plant-carbon)", 2.6)}
     ${label(160, 64, "포도당·산소", 11)}
     ${label(160, 128, "이산화 탄소·물", 11)}
     ${txt(160, 158, "한쪽에서 만든 물질을 다른 쪽이 쓴다", 11.5, "var(--n600)", "middle", 800)}`,
    "광합성과 호흡이 서로 물질을 주고받는 관계");
}

// ── L7 · 양분의 이동 경로 ──────────────────────────────────
/**
 * 꽃·열매가 달린 식물 발주 일러스트 + 이동 화살표 오버레이(photoPathFig와 같은 하이브리드).
 * 좌표 규약: 원본 960×720(4:3) 실측 → viewBox 100×75(=폭 %).
 *   줄기 x=63 · 흙 표면 y=51 · 뿌리 y 54~72 · 꽃 (62.3, 9.4)
 *   왼잎 x 36~62 / y 22~33 · 오른잎 x 66~89 / y 22~33 · 열매 (73.2, 44.6) r≈3.4
 * 양분(분홍)은 잎에서 꽃·열매·뿌리 세 방향으로, 물(파랑)은 뿌리에서 잎으로 — 줄기 좌우로 갈라 그린다.
 */
export function sugarRouteFig(): string {
  const ar = (x0: number, y0: number, x1: number, y1: number, color: string): string =>
    `${arrow(x0, y0, x1, y1, "#FFFFFF", 2.2)}${arrow(x0, y0, x1, y1, color, 1.05)}`;
  const tag = (x: number, y: number, s: string, color: string): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="4.6" font-weight="900" fill="${color}" stroke="#fff" stroke-width="1.6" paint-order="stroke">${s}</text>`;
  const FOOD = "#C2255C";
  const WATER = "#1E6FBF";

  const overlay = `<svg viewBox="0 0 100 75" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
    ${ar(60.5, 22, 61.6, 15.5, FOOD)}
    ${tag(53, 14.5, "꽃으로", FOOD)}
    ${ar(68.5, 31, 72, 41.2, FOOD)}
    ${tag(85, 36, "열매로", FOOD)}
    ${ar(66.2, 31, 66.2, 55, FOOD)}
    ${tag(74, 58, "뿌리로", FOOD)}
    ${ar(60.2, 55, 60.2, 31, WATER)}
    ${tag(54.5, 45, "물", WATER)}
  </svg>`;

  return `<span class="pgx-photo-frame" style="display:block;position:relative">
    <img src="${FIG_BASE}plant2/figs/plant-flower-fruit.webp" alt="꽃과 열매가 달린 식물 한 그루" style="display:block;width:100%;height:auto"/>
    ${overlay}
  </span>`;
}

/** 저장 형태 네 가지 — 발주 재료 사진 + 부위·형태 라벨(하이브리드). */
export function storageFormFig(): string {
  const card = (x: number, y: number, file: string, name: string, part: string, form: string, color: string): string =>
    `<rect x="${x}" y="${y}" width="142" height="66" rx="14" fill="#fff" stroke="${color}" stroke-width="2"/>
     <clipPath id="cp-${file}"><rect x="${x + 8}" y="${y + 9}" width="48" height="48" rx="12"/></clipPath>
     <image href="${FIG_BASE}plant2/items/${file}.webp" x="${x + 8}" y="${y + 9}" width="48" height="48" clip-path="url(#cp-${file})" preserveAspectRatio="xMidYMid slice"/>
     ${txt(x + 100, y + 28, name, 12.5, "var(--n800)")}
     ${txt(x + 100, y + 47, `${part} · ${form}`, 11, "var(--n600)", "middle", 750)}`;
  return wrap("0 0 320 176",
    `<rect x="4" y="4" width="312" height="168" rx="16" fill="#FBFEFA"/>
     ${card(12, 14, "sweetpotato", "고구마", "뿌리", "녹말", "var(--plant-starch)")}
     ${card(166, 14, "sugarcane", "사탕수수", "줄기", "설탕", "var(--pgx-sugar, #FF922B)")}
     ${card(12, 96, "soybean", "콩", "씨", "단백질", "var(--pgx-protein, #F2C14E)")}
     ${card(166, 96, "sesame", "깨", "씨", "지방", "#C9A227")}`,
    "식물마다 다른 양분의 저장 부위와 형태");
}

// ── recap 미니아트(64×64) ──────────────────────────────────
const mini = (inner: string): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${DEFS}</defs>${inner}</svg>`;

const ART: Record<string, string> = {
  photosynthesis: mini(`<circle cx="18" cy="16" r="8" fill="url(#pf-sun)"/><path d="M32 52 C14 46 10 26 32 20 C54 26 50 46 32 52Z" fill="url(#pf-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.6"/><path d="M32 50 V22" stroke="var(--plant-vein)" stroke-width="2"/>`),
  chloroplast: mini(`<rect x="8" y="14" width="48" height="36" rx="12" fill="#F2FAF1" stroke="var(--plant-leaf-lo)" stroke-width="2"/><ellipse cx="24" cy="28" rx="9" ry="6" transform="rotate(-16 24 28)" fill="url(#pf-chl)"/><ellipse cx="42" cy="38" rx="9" ry="6" transform="rotate(14 42 38)" fill="url(#pf-chl)"/>`),
  stoma: mini(`<path d="M6 32 C18 18 46 18 58 32 C46 46 18 46 6 32Z" fill="#EAF7EF" stroke="var(--plant-leaf-lo)" stroke-width="1.6"/><ellipse cx="32" cy="24" rx="17" ry="6" fill="url(#pf-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/><ellipse cx="32" cy="40" rx="17" ry="6" fill="url(#pf-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/><ellipse cx="32" cy="32" rx="9" ry="4" fill="#22402F"/>`),
  xylem: mini(`<rect x="24" y="8" width="16" height="48" rx="7" fill="none" stroke="var(--plant-xylem)" stroke-width="3"/><path d="M32 48 V18" stroke="var(--plant-xylem)" stroke-width="3"/><path d="M32 16 l-5 7 h10Z" fill="var(--plant-xylem)"/>`),
  phloem: mini(`<rect x="24" y="8" width="16" height="48" rx="7" fill="none" stroke="var(--plant-phloem)" stroke-width="3"/><path d="M32 16 V46" stroke="var(--plant-phloem)" stroke-width="3"/><path d="M32 48 l-5-7 h10Z" fill="var(--plant-phloem)"/>`),
  glucose: mini(`<path d="M32 12 L49 22 V42 L32 52 L15 42 V22Z" fill="var(--plant-glucose)" stroke="#5F3DC4" stroke-width="1.8"/>`),
  starch: mini(`<g fill="var(--plant-starch)" stroke="#7048B6" stroke-width="1.4"><path d="M20 14 L30 20 V32 L20 38 L10 32 V20Z"/><path d="M44 14 L54 20 V32 L44 38 L34 32 V20Z"/><path d="M32 34 L42 40 V52 L32 58 L22 52 V40Z"/></g>`),
  sugar: mini(`<g fill="var(--pgx-sugar, #FF922B)" stroke="#B45309" stroke-width="1.6"><path d="M22 18 L33 24 V38 L22 44 L11 38 V24Z"/><path d="M42 18 L53 24 V38 L42 44 L31 38 V24Z"/></g>`),
  oxygen: mini(`<circle cx="24" cy="32" r="13" fill="var(--plant-oxygen)" stroke="#0E8F8A" stroke-width="1.8"/><circle cx="42" cy="32" r="13" fill="var(--plant-oxygen)" stroke="#0E8F8A" stroke-width="1.8"/>`),
  carbon: mini(`<circle cx="16" cy="32" r="9" fill="var(--plant-carbon)" stroke="#5A6472" stroke-width="1.6"/><circle cx="32" cy="32" r="11" fill="var(--plant-carbon)" stroke="#5A6472" stroke-width="1.6"/><circle cx="48" cy="32" r="9" fill="var(--plant-carbon)" stroke="#5A6472" stroke-width="1.6"/>`),
  water: mini(`<path d="M32 10 C46 28 44 40 32 46 C20 40 18 28 32 10Z" fill="var(--plant-water)" stroke="#1E6FBF" stroke-width="1.8"/>`),
  light: mini(`<circle cx="32" cy="32" r="13" fill="url(#pf-sun)"/><path d="M32 8v-2M32 58v-2M8 32H6M58 32h-2M15 15l-2-2M51 51l2 2M51 15l2-2M15 51l-2 2" stroke="var(--plant-sun)" stroke-width="3"/>`),
  iodine: mini(`<path d="M24 10 h16 v18 l8 20 a12 12 0 0 1-11 16 h-10 a12 12 0 0 1-11-16 l8-20Z" fill="#F4F8FB" stroke="#7E93A6" stroke-width="1.8"/><path d="M20 40 h24 l4 8 a12 12 0 0 1-11 16 h-10 a12 12 0 0 1-11-16Z" fill="#2B3A8F"/>`),
  darkbox: mini(`<path d="M12 20 H52 V52 H12Z" fill="#2C3440" stroke="#161B22" stroke-width="1.8"/><path d="M12 20 H52 L44 10 H20Z" fill="#3A4450" stroke="#161B22" stroke-width="1.6"/>`),
  sensor: mini(`<rect x="10" y="16" width="44" height="34" rx="8" fill="#fff" stroke="var(--n400)" stroke-width="2"/><path d="M16 42 C24 42 26 26 32 26 C38 26 40 36 48 24" stroke="var(--plant-oxygen)" stroke-width="3"/>`),
  control: mini(`<rect x="8" y="18" width="20" height="30" rx="6" fill="#EAF7EF" stroke="var(--subj-plant, #27864B)" stroke-width="2"/><rect x="36" y="18" width="20" height="30" rx="6" fill="#EAF7EF" stroke="var(--subj-plant, #27864B)" stroke-width="2"/><path d="M18 44 V30 M46 44 V26" stroke="var(--plant-stem)" stroke-width="3"/><circle cx="18" cy="12" r="5" fill="url(#pf-sun)"/><circle cx="46" cy="8" r="4" fill="url(#pf-sun)"/>`),
  temp: mini(`<rect x="26" y="8" width="12" height="34" rx="6" fill="#fff" stroke="#C0392B" stroke-width="2"/><circle cx="32" cy="48" r="10" fill="#E74C3C" stroke="#C0392B" stroke-width="2"/><rect x="29" y="22" width="6" height="22" fill="#E74C3C"/>`),
  graph: mini(`<path d="M12 52 V12 M12 52 H54" stroke="var(--n400)" stroke-width="2.4"/><path d="M14 46 C24 46 28 22 40 20 C48 19 50 19 52 19" stroke="var(--subj-plant, #27864B)" stroke-width="3"/>`),
  respiration: mini(`<ellipse cx="32" cy="32" rx="22" ry="14" fill="#FFE8CC" stroke="#D9822B" stroke-width="2"/><path d="M14 32 C20 24 26 40 32 32 C38 24 44 40 50 32" stroke="#D9822B" stroke-width="2.4"/>`),
  mitochondria: mini(`<ellipse cx="32" cy="32" rx="24" ry="14" fill="#FFD8A8" stroke="#B4650F" stroke-width="2"/><path d="M16 30 C22 40 26 22 32 32 C38 42 42 24 48 32" stroke="#B4650F" stroke-width="2"/>`),
  daynight: mini(`<path d="M6 32 a26 26 0 0 1 52 0Z" fill="#EAF6FF" stroke="var(--n300)"/><path d="M6 32 a26 26 0 0 0 52 0Z" fill="#1B2B4D" stroke="var(--n300)"/><circle cx="20" cy="24" r="6" fill="url(#pf-sun)"/><path d="M48 44 a7 7 0 1 1-7-7 5 5 0 0 0 7 7Z" fill="#F5E9B8"/>`),
  storage: mini(`<path d="M32 14 C48 18 52 34 44 44 C38 52 26 52 20 44 C12 34 16 18 32 14Z" fill="#C97B3E" stroke="#8A5330" stroke-width="1.8"/><path d="M32 14 C32 26 30 36 26 46" stroke="#7A4526" stroke-width="1.6"/>`),
  fruit: mini(`<ellipse cx="32" cy="38" rx="20" ry="18" fill="#E4574F" stroke="#A5322D" stroke-width="2"/><path d="M32 20 V12" stroke="#4E7A32" stroke-width="3"/><path d="M32 16 C40 10 46 12 46 16 C42 22 34 22 32 16Z" fill="url(#pf-leaf)"/>`),
  seed: mini(`<ellipse cx="22" cy="34" rx="11" ry="14" transform="rotate(-16 22 34)" fill="var(--pgx-protein, #F2C14E)" stroke="#9A7318" stroke-width="1.6"/><ellipse cx="42" cy="36" rx="10" ry="13" transform="rotate(12 42 36)" fill="var(--pgx-fat, #E8D5A3)" stroke="#9A7318" stroke-width="1.6"/>`),
  scale: mini(`<path d="M32 12 V44" stroke="var(--n600)" stroke-width="3"/><path d="M12 22 H52" stroke="var(--n600)" stroke-width="3"/><path d="M12 22 L6 36 h12Z" fill="#EAF7EF" stroke="var(--subj-plant, #27864B)" stroke-width="1.6"/><path d="M52 22 L46 36 h12Z" fill="#EAF7EF" stroke="var(--subj-plant, #27864B)" stroke-width="1.6"/><path d="M22 50 h20" stroke="var(--n600)" stroke-width="3"/>`),
};

/** recap 카드 미니아트 — 없는 키는 빈 문자열(폴백 rc-dot은 신규 콘텐츠에서 금지). */
export function plantMiniArt(key: string): string {
  return ART[key] ?? "";
}
