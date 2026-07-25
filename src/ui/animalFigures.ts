// animalFigures — 중2 Ⅵ 동물과 에너지 도해 모듈.
//  · 퀴즈 figure용 SVG (라벨이 본질인 도해는 전부 벡터로 직접 그린다)
//  · recap 카드 미니아트 64×64 (anMiniArt) — 전 카드에 미니아트가 붙는 것이 표준
//  · 발주 라스터 + 한글 라벨 오버레이 헬퍼 (anLabeled) — 하이브리드 표준
// 색은 animalKit의 재질 상수만 참조한다(하드코딩 금지).

import { SUBSTANCE, TISSUE, VESSEL, anAsset, anMat } from "./animalKit";

const svg = (inner: string, vb = "0 0 320 200", defs = ""): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"><defs>${defs}</defs>${inner}</svg>`;

const lg = (id: string, hi: string, mid: string, lo: string): string =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient>`;

const rg = (id: string, hi: string, mid: string, lo: string): string =>
  `<radialGradient id="${id}" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="${hi}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></radialGradient>`;

/** 겹침 위험 라벨은 흰 할로로 읽힘을 지킨다(수학 Ⅳ에서 확립한 공용 규칙). */
const T = (
  x: number, y: number, text: string, size = 11, fill = "#37485C",
  anchor = "middle", halo = "#fff",
): string =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="800" fill="${fill}" stroke="${halo}" stroke-width="2.6" paint-order="stroke">${text}</text>`;

/** 발주 라스터 위에 한글 라벨을 얹는 하이브리드 임베드.
 *  좌표는 **이미지 기준 %**. lazy 금지(스크롤 컨테이너에서 안 뜬다). */
export function anLabeled(
  file: string,
  alt: string,
  labels: { x: number; y: number; t: string; dark?: boolean }[] = [],
): string {
  const pins = labels
    .map((l) => `<span class="an-flabel${l.dark ? " dark" : ""}" style="left:${l.x}%;top:${l.y}%">${l.t}</span>`)
    .join("");
  return `<span class="an-figwrap"><img class="an-fig" src="${anAsset(file)}" alt="${alt}"/>${pins}</span>`;
}

// ── 퀴즈 도해 ──────────────────────────────────────────────────────────────

/** 세포막 앞에 선 큰 영양소와 작은 영양소 — "소화가 필요한 까닭". */
export function sizeGateFig(): string {
  const bead = (x: number, y: number, r: number, fill: string, stroke: string): string =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;
  const chain = (x: number, y: number, n: number, fill: string, stroke: string): string => {
    let out = `<path d="M${x} ${y} h${(n - 1) * 17}" stroke="${stroke}" stroke-width="6" stroke-linecap="round"/>`;
    for (let i = 0; i < n; i++) out += bead(x + i * 17, y + (i % 2 ? 5 : -5), 9, fill, stroke);
    return out;
  };
  return svg(
    `<rect x="4" y="8" width="312" height="184" rx="14" fill="#F6FAFC"/>
    <path d="M186 14 q20 24 0 48 q-20 24 0 48 q20 24 0 48 q-20 24 0 28" stroke="url(#sg-mem)" stroke-width="12" fill="none" stroke-linecap="round"/>
    ${T(240, 32, "세포 안", 11, "#3F7C93")}
    ${T(84, 32, "세포 밖", 11, "#8A6A2A")}
    ${chain(24, 78, 6, "url(#sg-st)", SUBSTANCE.starch.lo)}
    ${T(76, 116, "녹말", 12, SUBSTANCE.starch.lo)}
    <path d="M150 78 h20" stroke="#F04452" stroke-width="3" stroke-linecap="round"/>
    <path d="M164 70 l8 8 l-8 8" stroke="#F04452" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M156 62 l16 32 M172 62 l-16 32" stroke="#F04452" stroke-width="3" stroke-linecap="round"/>
    ${bead(232, 150, 9, "url(#sg-su)", SUBSTANCE.sugar.lo)}
    ${bead(262, 160, 9, "url(#sg-su)", SUBSTANCE.sugar.lo)}
    ${T(248, 186, "포도당", 12, SUBSTANCE.sugar.lo)}
    <path d="M150 156 h34" stroke="#04B45F" stroke-width="3" stroke-linecap="round"/>
    <path d="M178 148 l8 8 l-8 8" stroke="#04B45F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    ${T(186, 130, "세포막", 10.5, "#4A7286")}`,
    "0 0 320 200",
    `${lg("sg-mem", TISSUE.membrane.hi, TISSUE.membrane.mid, TISSUE.membrane.lo)}
    ${rg("sg-st", SUBSTANCE.starch.hi, SUBSTANCE.starch.mid, SUBSTANCE.starch.lo)}
    ${rg("sg-su", SUBSTANCE.sugar.hi, SUBSTANCE.sugar.mid, SUBSTANCE.sugar.lo)}`,
  );
}

/** 검출 시약 4종의 색 변화 — 시험관 네 개. (가)~(라) 라벨. */
export function detectFig(): string {
  const COLORS = ["#2A3F91", "#E06A18", "#7B3FA0", "#E8455E"];
  const LABEL = ["(가)", "(나)", "(다)", "(라)"];
  let out = `<rect x="4" y="8" width="312" height="184" rx="14" fill="#F6FAFC"/>`;
  for (let i = 0; i < 4; i++) {
    const x = 52 + i * 72;
    out += `<path d="M${x - 17} 44 h34 v86 a17 17 0 0 1 -34 0 Z" fill="#FFFFFF" stroke="#9AB2C4" stroke-width="1.6"/>
      <path d="M${x - 15} 82 h30 v48 a15 15 0 0 1 -30 0 Z" fill="${COLORS[i]}"/>
      <rect x="${x - 18}" y="40" width="36" height="7" rx="3.5" fill="#DCE6EF" stroke="#9AB2C4" stroke-width="1.2"/>
      ${T(x, 170, LABEL[i], 12.5, "#37485C")}`;
  }
  out += `<rect x="20" y="140" width="280" height="10" rx="5" fill="#C9A876"/>`;
  return svg(out);
}

/** 소화계 구조 — (가)~(라) 라벨을 붙인 벡터 도해. 소화관/소화샘 구분 문제용. */
export function digestMapFig(marks: { x: number; y: number; t: string }[] = []): string {
  const coil = (): string => {
    let d = "M180 212";
    for (let i = 1; i <= 40; i++) {
      const t = i / 40;
      d += ` L${180 + Math.sin(t * Math.PI * 6.2) * 40} ${212 + t * 66}`;
    }
    return `<path d="${d}" stroke="${TISSUE.gut.mid}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  return svg(
    `<rect x="4" y="6" width="352" height="356" rx="16" fill="#F7FAFC"/>
    <path d="M180 22 c34 0 46 28 44 54 c52 16 64 64 62 134 c0 80 -18 130 -36 156 h-140 c-18 -26 -36 -76 -36 -156 c-2 -70 10 -118 62 -134 c-2 -26 10 -54 44 -54 Z" fill="#E8F0F6" stroke="#C6D6E2" stroke-width="1.4"/>
    <ellipse cx="180" cy="44" rx="19" ry="11" fill="${TISSUE.gut.mid}" stroke="${TISSUE.gut.lo}" stroke-width="1.4"/>
    <path d="M180 54 V120" stroke="${TISSUE.gut.mid}" stroke-width="11" stroke-linecap="round"/>
    <path d="M178 120 C140 124 112 144 118 168 C124 192 158 198 172 178 C180 166 176 142 178 120 Z" fill="${TISSUE.gut.mid}" stroke="${TISSUE.gut.lo}" stroke-width="1.6"/>
    <path d="M208 200 C246 208 250 300 180 314 C110 300 114 208 152 200" stroke="${TISSUE.gut.mid}" stroke-width="16" fill="none" stroke-linecap="round"/>
    ${coil()}
    <path d="M180 314 V346" stroke="${TISSUE.gut.mid}" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="122" cy="36" rx="14" ry="10" fill="${TISSUE.gland.mid}" stroke="${TISSUE.gland.lo}" stroke-width="1.4"/>
    <ellipse cx="240" cy="132" rx="22" ry="16" fill="${TISSUE.gland.mid}" stroke="${TISSUE.gland.lo}" stroke-width="1.4"/>
    <ellipse cx="224" cy="168" rx="11" ry="8" fill="${TISSUE.gland.mid}" stroke="${TISSUE.gland.lo}" stroke-width="1.4"/>
    <ellipse cx="120" cy="192" rx="17" ry="10" transform="rotate(-14 120 192)" fill="${TISSUE.gland.mid}" stroke="${TISSUE.gland.lo}" stroke-width="1.4"/>
    ${marks.map((m) => `<circle cx="${m.x}" cy="${m.y}" r="13" fill="#fff" stroke="#37485C" stroke-width="2"/>${T(m.x, m.y + 4.5, m.t, 12, "#37485C")}`).join("")}`,
    "0 0 360 370",
  );
}

/** 영양소의 기능 — 에너지원 / 몸 구성 / 조절 세 갈래. */
export function nutrientRoleFig(): string {
  const box = (x: number, title: string, items: string, tone: string): string =>
    `<rect x="${x}" y="52" width="94" height="104" rx="12" fill="#fff" stroke="${tone}" stroke-width="2"/>
     <rect x="${x}" y="52" width="94" height="26" rx="12" fill="${tone}"/>
     <rect x="${x}" y="66" width="94" height="12" fill="${tone}"/>
     <text x="${x + 47}" y="70" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">${title}</text>
     ${items
       .split("|")
       .map((s, i) => `<text x="${x + 47}" y="${100 + i * 20}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#37485C">${s}</text>`)
       .join("")}`;
  return svg(
    `<rect x="4" y="8" width="312" height="184" rx="14" fill="#F8FAFC"/>
    ${box(14, "에너지원", "탄수화물|단백질|지방", SUBSTANCE.starch.mid)}
    ${box(113, "몸 구성", "단백질|지방|무기염류|물", SUBSTANCE.protein.mid)}
    ${box(212, "조절", "바이타민|무기염류|물", SUBSTANCE.vitamin.mid)}
    ${T(160, 34, "영양소가 하는 일", 13, "#37485C")}`,
  );
}

/** 소화관 vs 소화샘 — 음식물이 지나가는 길과 소화액만 보내는 곳. */
export function tractGlandFig(): string {
  return svg(
    `<rect x="4" y="8" width="312" height="184" rx="14" fill="#F7FBFC"/>
    <path d="M60 34 V166" stroke="${TISSUE.gut.mid}" stroke-width="18" stroke-linecap="round"/>
    ${T(60, 24, "소화관", 12, TISSUE.gut.lo)}
    ${T(60, 184, "음식물이 지나가요", 10.5, "#5C6E80")}
    <ellipse cx="176" cy="70" rx="26" ry="18" fill="${TISSUE.gland.mid}" stroke="${TISSUE.gland.lo}" stroke-width="1.6"/>
    <ellipse cx="176" cy="140" rx="26" ry="18" fill="${TISSUE.gland.mid}" stroke="${TISSUE.gland.lo}" stroke-width="1.6"/>
    ${T(176, 44, "소화샘", 12, TISSUE.gland.lo)}
    ${T(176, 184, "소화액만 보내요", 10.5, "#5C6E80")}
    <path d="M150 74 H80" stroke="${SUBSTANCE.sugar.mid}" stroke-width="3" stroke-dasharray="4 4"/>
    <path d="M150 136 H80" stroke="${SUBSTANCE.sugar.mid}" stroke-width="3" stroke-dasharray="4 4"/>
    <path d="M86 68 l-8 6 l8 6" stroke="${SUBSTANCE.sugar.mid}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M86 130 l-8 6 l8 6" stroke="${SUBSTANCE.sugar.mid}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="60" cy="60" r="7" fill="${SUBSTANCE.starch.mid}"/>
    <circle cx="60" cy="100" r="7" fill="${SUBSTANCE.starch.mid}"/>
    <circle cx="60" cy="140" r="7" fill="${SUBSTANCE.starch.mid}"/>
    ${T(258, 106, "소화액", 11, SUBSTANCE.sugar.lo)}`,
  );
}

/** 영양소의 소화 과정 — 녹말·단백질·지방 3열 × 입·위·작은창자 3행. 이 단원의 핵심 도해. */
export function digestFlowFig(): string {
  const COL = [80, 180, 280];
  const chip = (x: number, y: number, t: string, key: string, w = 76): string => {
    const m = anMat(key);
    return `<rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${m.mid}" stroke="${m.lo}" stroke-width="1.4"/>
      <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">${t}</text>`;
  };
  const arrow = (x: number, y0: number, y1: number, label: string, tone: string): string =>
    `<path d="M${x} ${y0} V${y1 - 7}" stroke="${tone}" stroke-width="2.6" stroke-linecap="round"/>
     <path d="M${x - 5} ${y1 - 10} L${x} ${y1 - 2} L${x + 5} ${y1 - 10}" fill="${tone}"/>
     <text x="${x + 8}" y="${(y0 + y1) / 2 + 3}" text-anchor="start" font-size="9.5" font-weight="800" fill="${tone}" stroke="#fff" stroke-width="2.4" paint-order="stroke">${label}</text>`;
  // 오른쪽 끝 열(지방)은 라벨을 화살표 왼쪽에 둔다 — 도판 밖으로 넘치는 것을 막는다.
  const arrowL = (x: number, y0: number, y1: number, label: string, tone: string): string =>
    `<path d="M${x} ${y0} V${y1 - 7}" stroke="${tone}" stroke-width="2.6" stroke-linecap="round"/>
     <path d="M${x - 5} ${y1 - 10} L${x} ${y1 - 2} L${x + 5} ${y1 - 10}" fill="${tone}"/>
     <text x="${x - 8}" y="${(y0 + y1) / 2 + 3}" text-anchor="end" font-size="9.5" font-weight="800" fill="${tone}" stroke="#fff" stroke-width="2.4" paint-order="stroke">${label}</text>`;
  const pass = (x: number, y0: number, y1: number): string =>
    `<path d="M${x} ${y0} V${y1}" stroke="#C6D6E2" stroke-width="2.2" stroke-dasharray="4 4" stroke-linecap="round"/>`;
  const rowLabel = (y: number, t: string): string =>
    `<rect x="6" y="${y - 12}" width="40" height="24" rx="8" fill="#E9EEF5" stroke="#B8C4D2" stroke-width="1.2"/>
     <text x="26" y="${y + 4}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#5C6E80">${t}</text>`;
  return svg(
    `<rect x="2" y="4" width="356" height="292" rx="14" fill="#FAFCFD"/>
    ${rowLabel(52, "입")}${rowLabel(130, "위")}${rowLabel(208, "작은창자")}
    ${chip(COL[0], 24, "녹말", "starch")}${chip(COL[1], 24, "단백질", "protein")}${chip(COL[2], 24, "지방", "fat")}
    ${arrow(COL[0], 38, 76, "아밀레이스", SUBSTANCE.sugar.lo)}
    ${pass(COL[1], 38, 116)}${pass(COL[2], 38, 194)}
    ${chip(COL[0], 88, "엿당", "sugar", 66)}
    ${pass(COL[0], 102, 194)}
    ${arrow(COL[1], 116, 154, "펩신", SUBSTANCE.protein.lo)}
    ${chip(COL[1], 166, "중간 조각", "protein", 80)}
    ${pass(COL[1], 180, 194)}
    ${arrow(COL[0], 194, 240, "아밀레이스", SUBSTANCE.sugar.lo)}
    ${arrow(COL[1], 194, 240, "트립신", SUBSTANCE.amino.lo)}
    ${arrowL(COL[2], 194, 240, "라이페이스", SUBSTANCE.fatty.lo)}
    ${chip(COL[0], 252, "포도당", "sugar", 72)}
    ${chip(COL[1], 252, "아미노산", "amino", 78)}
    <rect x="${COL[2] - 42}" y="240" width="84" height="36" rx="12" fill="${SUBSTANCE.fatty.mid}" stroke="${SUBSTANCE.fatty.lo}" stroke-width="1.4"/>
    <text x="${COL[2]}" y="253" text-anchor="middle" font-size="10" font-weight="800" fill="#4A3A06">지방산</text>
    <text x="${COL[2]}" y="266" text-anchor="middle" font-size="10" font-weight="800" fill="#4A3A06">모노글리세라이드</text>
    <rect x="150" y="286" width="202" height="21" rx="10.5" fill="#EAF6EE" stroke="${SUBSTANCE.vitamin.mid}" stroke-width="1.2"/>
    <text x="251" y="301" text-anchor="middle" font-size="10" font-weight="800" fill="${SUBSTANCE.vitamin.lo}">쓸개즙은 지방의 소화를 도와줘요</text>
    ${T(180, 322, "소화효소는 정해진 영양소에만 작용해요", 10.5, "#5C6E80")}`,
    "0 0 360 332",
  );
}

/** 작은창자 안쪽 벽 — 주름 위 융털, 그 속의 모세혈관과 암죽관. */
export function villiStructFig(): string {
  let fingers = "";
  for (let i = 0; i < 22; i++) {
    const x = 22 + i * 13.4;
    const h = 26 + (i % 3) * 3;
    fingers += `<path d="M${x} 120 q0 ${-h} 5 ${-h} q5 0 5 ${h} Z" fill="${TISSUE.gut.mid}" stroke="${TISSUE.gut.lo}" stroke-width="1"/>`;
  }
  return svg(
    `<rect x="4" y="6" width="352" height="288" rx="14" fill="#FBFAF8"/>
    <path d="M14 120 q40 -26 80 0 q40 -26 80 0 q40 -26 80 0 q26 -18 40 -6 V160 H14 Z" fill="${TISSUE.gut.lo}"/>
    <g>${fingers}</g>
    ${T(90, 178, "주름 위에 융털이 빽빽하게", 11, "#8A5A3A")}
    <circle cx="268" cy="222" r="62" fill="#fff" stroke="#C6D6E2" stroke-width="1.6"/>
    <path d="M242 272 q-6 -66 26 -80 q32 14 26 80 Z" fill="${TISSUE.gut.mid}" stroke="${TISSUE.gut.lo}" stroke-width="1.4"/>
    <path d="M268 202 V268" stroke="#F3EFDD" stroke-width="8" stroke-linecap="round"/>
    <path d="M254 268 q-8 -44 14 -66" stroke="${VESSEL.capillary.mid}" stroke-width="3" fill="none"/>
    <path d="M282 268 q8 -44 -14 -66" stroke="${VESSEL.capillary.mid}" stroke-width="3" fill="none"/>
    ${T(196, 214, "암죽관", 10.5, "#8A7A2A")}
    ${T(196, 240, "모세혈관", 10.5, VESSEL.capillary.lo)}
    <path d="M216 210 L252 216 M222 236 L248 246" stroke="#8A97A6" stroke-width="1.2"/>
    <path d="M120 138 L226 196" stroke="#8A97A6" stroke-width="1.2" stroke-dasharray="3 3"/>
    ${T(96, 30, "작은창자 안쪽 벽", 12, "#5C6E80")}
    ${T(268, 296, "융털 하나를 자른 모습", 10.5, "#5C6E80")}`,
    "0 0 360 306",
  );
}

/** 심장의 네 방과 판막 — (가)~(라) 라벨을 붙일 수 있다. 심방/심실·연결 혈관 문제용. */
export function heartFig(marks: { x: number; y: number; t: string }[] = []): string {
  const chamber = (x: number, y: number, w: number, h: number, wall: number, rich: boolean): string => {
    const m = rich ? VESSEL.rich : VESSEL.poor;
    return `<rect x="${x - wall}" y="${y - wall}" width="${w + wall * 2}" height="${h + wall * 2}" rx="14" fill="${TISSUE.heart.lo}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${m.mid}" stroke="${m.lo}" stroke-width="1.2"/>`;
  };
  const vessel = (pts: string, rich: boolean): string =>
    `<path d="${pts}" stroke="${rich ? VESSEL.rich.lo : VESSEL.poor.lo}" stroke-width="15" fill="none" stroke-linecap="round"/>
     <path d="${pts}" stroke="${rich ? VESSEL.rich.mid : VESSEL.poor.mid}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  const valve = (x: number, y: number): string =>
    `<path d="M${x - 11} ${y} q11 9 22 0" stroke="#F6E4E7" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  return svg(
    `<rect x="2" y="4" width="356" height="332" rx="14" fill="#FBF7F8"/>
    ${vessel("M96 26 L108 72 L124 108", false)}
    ${vessel("M150 176 L154 108 L158 26", false)}
    ${vessel("M264 26 L252 72 L236 108", true)}
    ${vessel("M212 176 L208 108 L204 22", true)}
    <path d="M180 78 C250 74 286 114 282 182 C278 258 240 314 184 330 C128 314 90 258 86 182 C82 114 118 74 180 78 Z" fill="${TISSUE.heart.mid}" stroke="${TISSUE.heart.lo}" stroke-width="1.6"/>
    ${chamber(100, 100, 68, 56, 3, false)}
    ${chamber(194, 100, 68, 56, 3, true)}
    ${chamber(102, 180, 66, 98, 7, false)}
    ${chamber(192, 180, 68, 110, 12, true)}
    ${valve(134, 172)}${valve(226, 172)}${valve(150, 178)}${valve(212, 178)}
    ${T(66, 24, "대정맥", 10, VESSEL.poor.lo)}
    ${T(158, 16, "폐동맥", 10, VESSEL.poor.lo)}
    ${T(294, 24, "폐정맥", 10, VESSEL.rich.lo)}
    ${T(232, 14, "대동맥", 10, VESSEL.rich.lo)}
    ${marks.length
      ? marks.map((m) => `<circle cx="${m.x}" cy="${m.y}" r="13" fill="#fff" stroke="#37485C" stroke-width="2"/>${T(m.x, m.y + 4.5, m.t, 12, "#37485C")}`).join("")
      : `${T(134, 132, "우심방", 10.5, "#fff", "middle", VESSEL.poor.lo)}${T(228, 132, "좌심방", 10.5, "#fff", "middle", VESSEL.rich.lo)}${T(135, 232, "우심실", 10.5, "#fff", "middle", VESSEL.poor.lo)}${T(226, 238, "좌심실", 10.5, "#fff", "middle", VESSEL.rich.lo)}`}`,
    "0 0 360 340",
  );
}

/** 동맥·모세혈관·정맥 — 벽 두께와 판막의 차이. (가)~(다) 라벨 옵션. */
export function vesselCompareFig(labels = false): string {
  const tube = (cx: number, wall: number, r: number, color: string, dark: string, valve: boolean): string =>
    `<circle cx="${cx}" cy="112" r="${r + wall}" fill="${dark}"/>
     <circle cx="${cx}" cy="112" r="${r}" fill="${color}"/>
     <circle cx="${cx - r * 0.3}" cy="${112 - r * 0.34}" r="${r * 0.22}" fill="#fff" opacity=".3"/>
     ${valve
       ? `<path d="M${cx - r} 112 q${r * 0.55} ${r * 0.7} ${r} 0" stroke="#F6E4E7" stroke-width="3" fill="none"/>
          <path d="M${cx + r} 112 q${-r * 0.55} ${r * 0.7} ${-r} 0" stroke="#F6E4E7" stroke-width="3" fill="none"/>`
       : ""}`;
  return svg(
    `<rect x="2" y="6" width="316" height="200" rx="14" fill="#FBF8F9"/>
    ${tube(62, 15, 22, VESSEL.rich.mid, VESSEL.rich.lo, false)}
    ${tube(160, 3, 9, VESSEL.capillary.mid, VESSEL.capillary.lo, false)}
    ${tube(258, 7, 26, VESSEL.poor.mid, VESSEL.poor.lo, true)}
    ${T(62, 176, labels ? "(가)" : "동맥", 12, VESSEL.rich.lo)}
    ${T(160, 176, labels ? "(나)" : "모세혈관", 12, VESSEL.capillary.lo)}
    ${T(258, 176, labels ? "(다)" : "정맥", 12, VESSEL.poor.lo)}
    ${T(62, 196, "벽이 두껍고 탄력이 강해요", 8.5, "#5C6E80")}
    ${T(160, 196, "벽이 매우 얇아요", 8.5, "#5C6E80")}
    ${T(258, 196, "얇고 판막이 있어요", 8.5, "#5C6E80")}
    ${T(160, 34, "혈관의 단면", 12, "#37485C")}`,
    "0 0 320 210",
  );
}

/** 혈구 3종 — 크기 대소(백혈구 > 적혈구 > 혈소판)와 핵 유무가 그림으로 읽혀야 한다. */
export function bloodCellsFig(labels = false): string {
  const rbc = (x: number, y: number, r: number): string =>
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.94}" fill="#D8404F" stroke="#8A2230" stroke-width="1.6"/>
     <ellipse cx="${x}" cy="${y}" rx="${r * 0.42}" ry="${r * 0.38}" fill="#A81F30"/>`;
  const wbc = (x: number, y: number, r: number): string =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#E4D6F5" stroke="#7A63A2" stroke-width="1.6"/>
     <ellipse cx="${x - 3}" cy="${y - 2}" rx="${r * 0.46}" ry="${r * 0.4}" fill="#7B5FB0" transform="rotate(20 ${x} ${y})"/>
     <ellipse cx="${x + 6}" cy="${y + 6}" rx="${r * 0.3}" ry="${r * 0.26}" fill="#7B5FB0"/>`;
  const plt = (x: number, y: number, r: number): string =>
    `<path d="M${x - r} ${y} l${r * 0.7} ${-r * 0.8} l${r * 0.9} ${r * 0.3} l${r * 0.4} ${r * 0.8} l${-r} ${r * 0.5} Z" fill="#EFC759" stroke="#A0740F" stroke-width="1.4"/>`;
  return svg(
    `<rect x="4" y="8" width="312" height="184" rx="14" fill="#FEF7F8"/>
    <path d="M14 40 q146 -18 292 0 v112 q-146 18 -292 0 Z" fill="#F8DDE2" opacity=".7"/>
    ${rbc(64, 96, 20)}${rbc(112, 74, 16)}${rbc(104, 126, 15)}
    ${wbc(184, 96, 29)}
    ${plt(266, 100, 13)}
    ${T(64, 158, labels ? "(가)" : "적혈구", 12, "#8A2230")}
    ${T(184, 158, labels ? "(나)" : "백혈구", 12, "#5B4482")}
    ${T(266, 158, labels ? "(다)" : "혈소판", 12, "#8A6A18")}
    ${T(160, 28, "혈관 속 혈구", 12, "#37485C")}`,
  );
}

/** 혈액의 순환 경로 — 심장·허파·온몸의 모세혈관. 구간 라벨 옵션. */
export function circulationPathFig(marks: { x: number; y: number; t: string }[] = []): string {
  const seg = (d: string, rich: boolean, w = 10): string =>
    `<path d="${d}" stroke="${rich ? VESSEL.rich.lo : VESSEL.poor.lo}" stroke-width="${w + 3}" fill="none" stroke-linecap="round"/>
     <path d="${d}" stroke="${rich ? VESSEL.rich.mid : VESSEL.poor.mid}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const cap = (cx: number, cy: number, rx: number, ry: number, fill: string): string => {
    let out = "";
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2;
      out += `<circle cx="${(cx + Math.cos(a) * rx).toFixed(1)}" cy="${(cy + Math.sin(a) * ry).toFixed(1)}" r="7" fill="${fill}" opacity=".8"/>`;
    }
    return out;
  };
  return svg(
    `<rect x="2" y="4" width="356" height="392" rx="16" fill="#FBF8F9"/>
    <ellipse cx="96" cy="66" rx="30" ry="38" fill="${TISSUE.lung.mid}" opacity=".55"/>
    <ellipse cx="162" cy="66" rx="30" ry="38" fill="${TISSUE.lung.mid}" opacity=".55"/>
    ${T(129, 20, "허파", 11.5, "#8A4A5F")}
    ${cap(236, 336, 52, 28, TISSUE.cell.mid)}
    ${T(236, 384, "온몸의 조직세포", 11.5, "#A2731F")}
    ${seg("M198 214 C258 214 286 238 286 268 C286 306 268 330 240 336", true)}
    ${seg("M232 336 C196 344 150 340 128 320 C108 300 112 258 132 232", false)}
    ${seg("M138 226 C118 210 96 194 82 176 C68 156 74 128 96 104", false)}
    ${seg("M162 104 C186 122 220 132 246 128 C268 122 262 172 226 196", true)}
    <ellipse cx="166" cy="212" rx="62" ry="46" fill="${TISSUE.heart.mid}" stroke="${TISSUE.heart.lo}" stroke-width="1.6"/>
    ${T(166, 216, "심장", 12, "#fff", "middle", TISSUE.heart.lo)}
    ${marks.map((m) => `<circle cx="${m.x}" cy="${m.y}" r="13.5" fill="#fff" stroke="#37485C" stroke-width="2"/>${T(m.x, m.y + 4.5, m.t, 12, "#37485C")}`).join("")}
    <rect x="14" y="352" width="112" height="18" rx="9" fill="#fff" stroke="#E4E9EF"/>
    <circle cx="26" cy="361" r="5" fill="${VESSEL.rich.mid}"/>
    <text x="36" y="365" font-size="9" font-weight="800" fill="#5C6E80">산소 많은 혈액</text>
    <rect x="14" y="374" width="112" height="18" rx="9" fill="#fff" stroke="#E4E9EF"/>
    <circle cx="26" cy="383" r="5" fill="${VESSEL.poor.mid}"/>
    <text x="36" y="387" font-size="9" font-weight="800" fill="#5C6E80">산소 적은 혈액</text>`,
    "0 0 360 400",
  );
}

/** 들숨과 날숨 — 갈비뼈·가로막의 움직임과 부피·압력·공기 이동을 나란히. */
export function breathCompareFig(): string {
  const side = (x: number, inhale: boolean): string => {
    const dy = inhale ? -8 : 8;
    const lungR = inhale ? 30 : 21;
    const dia = inhale ? 18 : -6;
    return `<g transform="translate(${x} 0)">
      <rect x="-70" y="34" width="140" height="196" rx="16" fill="${inhale ? "#EAF4FB" : "#FBEFE9"}"/>
      <text x="0" y="56" text-anchor="middle" font-size="12.5" font-weight="900" fill="${inhale ? "#1B6E96" : "#9A5A18"}">${inhale ? "들숨" : "날숨"}</text>
      <path d="M0 ${64 + dy} V${96 + dy}" stroke="${VESSEL.airway.lo}" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="${-19}" cy="${132 + dy}" rx="${lungR * 0.72}" ry="${lungR}" fill="${TISSUE.lung.mid}" stroke="${TISSUE.lung.lo}" stroke-width="1.4"/>
      <ellipse cx="${19}" cy="${132 + dy}" rx="${lungR * 0.72}" ry="${lungR}" fill="${TISSUE.lung.mid}" stroke="${TISSUE.lung.lo}" stroke-width="1.4"/>
      ${[0, 1, 2].map((i) => `<path d="M-50 ${104 + i * 28 + dy} q50 -14 100 0" stroke="${TISSUE.bone.mid}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join("")}
      <path d="M-50 ${190} q50 ${dia} 100 0" stroke="${TISSUE.membrane.mid}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M0 ${inhale ? 24 : 40} V${inhale ? 44 : 20}" stroke="${inhale ? "#3182F6" : "#E8590C"}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M0 ${inhale ? 44 : 20} l-5 ${inhale ? -7 : 7} M0 ${inhale ? 44 : 20} l5 ${inhale ? -7 : 7}" stroke="${inhale ? "#3182F6" : "#E8590C"}" stroke-width="3.4" stroke-linecap="round"/>
      <text x="0" y="212" text-anchor="middle" font-size="9.5" font-weight="800" fill="#5C6E80">갈비뼈 ${inhale ? "올라감" : "내려감"} · 가로막 ${inhale ? "내려감" : "올라감"}</text>
      <text x="0" y="226" text-anchor="middle" font-size="9.5" font-weight="800" fill="${inhale ? "#1B6E96" : "#9A5A18"}">부피 ${inhale ? "커짐" : "작아짐"} · 압력 ${inhale ? "낮아짐" : "높아짐"}</text>
    </g>`;
  };
  return svg(
    `<rect x="2" y="6" width="356" height="240" rx="14" fill="#FBFDFE"/>
    ${side(92, true)}${side(268, false)}`,
    "0 0 360 250",
  );
}

/** 기체 교환 두 곳 — 허파꽈리에서, 조직세포에서. 화살표 방향이 본질이라 벡터로 그린다. */
export function gasExchangeFig(): string {
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, label: string, lx: number, ly: number): string =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="3.4" stroke-linecap="round"/>
     <path d="M${x2} ${y2} l${x2 > x1 ? -8 : 8} -5 M${x2} ${y2} l${x2 > x1 ? -8 : 8} 5" stroke="${color}" stroke-width="3.4" stroke-linecap="round"/>
     ${T(lx, ly, label, 9.5, color)}`;
  const panel = (y: number, leftName: string, rightName: string): string =>
    `<rect x="10" y="${y}" width="340" height="112" rx="14" fill="#FBFAFC" stroke="#E4E9EF"/>
     <ellipse cx="86" cy="${y + 56}" rx="46" ry="34" fill="${leftName === "허파꽈리" ? TISSUE.lung.mid : VESSEL.capillary.mid}" opacity=".55"/>
     <ellipse cx="274" cy="${y + 56}" rx="46" ry="34" fill="${rightName === "조직세포" ? TISSUE.cell.mid : VESSEL.capillary.mid}" opacity=".55"/>
     ${T(86, y + 60, leftName, 11, "#37485C")}
     ${T(274, y + 60, rightName, 11, "#37485C")}
     ${arrow(140, y + 38, 220, y + 38, SUBSTANCE.oxygen.lo, "산소", 180, y + 30)}
     ${arrow(220, y + 78, 140, y + 78, SUBSTANCE.carbon.lo, "이산화 탄소", 180, y + 96)}`;
  return svg(
    `<rect x="2" y="4" width="356" height="256" rx="14" fill="#fff"/>
    ${panel(14, "허파꽈리", "모세혈관")}
    ${panel(138, "모세혈관", "조직세포")}`,
    "0 0 360 264",
  );
}

/** 콩팥단위와 오줌이 만들어지는 과정 — 여과·재흡수·분비. */
export function nephronFig(marks: { x: number; y: number; t: string }[] = []): string {
  return svg(
    `<rect x="2" y="4" width="356" height="252" rx="14" fill="#FBF9FA"/>
    <path d="M18 44 L54 62" stroke="${VESSEL.rich.mid}" stroke-width="9" stroke-linecap="round"/>
    <path d="M54 104 L18 122" stroke="${VESSEL.poor.mid}" stroke-width="9" stroke-linecap="round"/>
    <g>${[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2;
      return `<path d="M${(74 + Math.cos(a) * 7).toFixed(1)} ${(84 + Math.sin(a) * 7).toFixed(1)} m-13 0 a13 13 0 1 0 26 0" stroke="${VESSEL.capillary.mid}" stroke-width="4.6" fill="none"/>`;
    }).join("")}</g>
    ${T(74, 46, "토리", 10, VESSEL.capillary.lo)}
    <path d="M110 60 a34 34 0 1 0 0 50" stroke="#EFE7CB" stroke-width="7" fill="none"/>
    ${T(126, 44, "보먼주머니", 10, "#8A7A2A")}
    <path d="M110 96 C150 112 130 140 176 148 L330 148" stroke="${SUBSTANCE.fat.lo}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M110 96 C150 112 130 140 176 148 L330 148" stroke="${SUBSTANCE.fat.mid}" stroke-width="11" fill="none" stroke-linecap="round"/>
    ${T(214, 134, "세뇨관", 10, "#8A6A18")}
    <path d="M120 200 L330 200" stroke="${VESSEL.capillary.lo}" stroke-width="14" stroke-linecap="round"/>
    <path d="M120 200 L330 200" stroke="${VESSEL.capillary.mid}" stroke-width="9" stroke-linecap="round"/>
    ${T(200, 220, "세뇨관을 둘러싼 모세혈관", 10, VESSEL.capillary.lo)}
    <path d="M100 78 L134 78" stroke="#37485C" stroke-width="2.6"/><path d="M134 78 l-7 -4 M134 78 l-7 4" stroke="#37485C" stroke-width="2.6"/>
    <path d="M232 162 L232 186" stroke="#04B45F" stroke-width="2.6"/><path d="M232 186 l-4 -7 M232 186 l4 -7" stroke="#04B45F" stroke-width="2.6"/>
    <path d="M292 186 L292 162" stroke="#F04452" stroke-width="2.6"/><path d="M292 162 l-4 7 M292 162 l4 7" stroke="#F04452" stroke-width="2.6"/>
    ${T(160, 74, "여과", 10.5, "#37485C")}
    ${T(232, 178, "재흡수", 10, "#04B45F", "end")}
    ${T(300, 178, "분비", 10, "#F04452", "start")}
    ${T(330, 168, "→ 오줌", 10, "#8A6A18", "end")}
    ${marks.map((m) => `<circle cx="${m.x}" cy="${m.y}" r="12" fill="#fff" stroke="#37485C" stroke-width="2"/>${T(m.x, m.y + 4, m.t, 11, "#37485C")}`).join("")}`,
    "0 0 360 260",
  );
}

/** 세포호흡 — 영양소 + 산소 → 물 + 이산화 탄소 + 에너지. */
export function cellRespFig(): string {
  return svg(
    `<rect x="4" y="8" width="312" height="184" rx="14" fill="#FFFBF2"/>
    <circle cx="150" cy="100" r="58" fill="${TISSUE.cell.mid}" stroke="${TISSUE.cell.lo}" stroke-width="1.8"/>
    <ellipse cx="140" cy="92" rx="20" ry="12" transform="rotate(-24 140 92)" fill="#E8843A" stroke="#9A4A0E" stroke-width="1.4"/>
    <ellipse cx="164" cy="116" rx="16" ry="10" transform="rotate(18 164 116)" fill="#E8843A" stroke="#9A4A0E" stroke-width="1.4"/>
    ${T(150, 168, "마이토콘드리아에서 주로 일어나요", 10, "#8A5A18")}
    <circle cx="34" cy="70" r="14" fill="${SUBSTANCE.sugar.mid}" stroke="${SUBSTANCE.sugar.lo}" stroke-width="1.4"/>
    ${T(34, 44, "영양소", 10, SUBSTANCE.sugar.lo)}
    <circle cx="34" cy="130" r="14" fill="${SUBSTANCE.oxygen.mid}" stroke="${SUBSTANCE.oxygen.lo}" stroke-width="1.4"/>
    ${T(34, 156, "산소", 10, SUBSTANCE.oxygen.lo)}
    <path d="M52 74 L84 88 M52 126 L84 112" stroke="#8A97A6" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M84 88 l-9 -1 M84 88 l-3 -8 M84 112 l-9 1 M84 112 l-3 8" stroke="#8A97A6" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="272" cy="52" r="12" fill="${SUBSTANCE.water.mid}" stroke="${SUBSTANCE.water.lo}" stroke-width="1.4"/>
    ${T(272, 30, "물", 10, SUBSTANCE.water.lo)}
    <circle cx="272" cy="100" r="12" fill="${SUBSTANCE.carbon.mid}" stroke="${SUBSTANCE.carbon.lo}" stroke-width="1.4"/>
    ${T(300, 100, "이산화 탄소", 9.5, SUBSTANCE.carbon.lo, "end")}
    <circle cx="272" cy="150" r="14" fill="${SUBSTANCE.energy.mid}" stroke="${SUBSTANCE.energy.lo}" stroke-width="1.4"/>
    ${T(272, 176, "에너지", 10, SUBSTANCE.energy.lo)}
    <path d="M212 84 L252 58 M212 100 L254 100 M212 118 L250 142" stroke="#8A97A6" stroke-width="2.4" stroke-linecap="round"/>`,
  );
}

/** 네 기관계의 통합 — 모든 물질이 순환계를 거친다. */
export function integrateFig(marks: { x: number; y: number; t: string }[] = []): string {
  const node = (x: number, y: number, r: number, fill: string, stroke: string, name: string): string =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>${T(x, y + 4, name, 10.5, "#fff", "middle", stroke)}`;
  return svg(
    `<rect x="2" y="4" width="356" height="292" rx="14" fill="#FBFAFC"/>
    <path d="M180 148 L180 66 M180 148 L74 176 M180 148 L286 176 M180 148 L180 236"
          stroke="${TISSUE.heart.mid}" stroke-width="8" stroke-linecap="round" opacity=".4"/>
    ${node(180, 66, 34, TISSUE.lung.mid, TISSUE.lung.lo, "호흡계")}
    ${node(74, 176, 34, TISSUE.gut.mid, TISSUE.gut.lo, "소화계")}
    ${node(286, 176, 34, TISSUE.kidney.mid, TISSUE.kidney.lo, "배설계")}
    ${node(180, 148, 38, TISSUE.heart.mid, TISSUE.heart.lo, "순환계")}
    ${node(180, 240, 36, TISSUE.cell.mid, TISSUE.cell.lo, "조직세포")}
    ${T(126, 106, "산소", 9.5, SUBSTANCE.oxygen.lo)}
    ${T(236, 106, "이산화 탄소", 9.5, SUBSTANCE.carbon.lo)}
    ${T(112, 152, "영양소", 9.5, SUBSTANCE.sugar.lo)}
    ${T(252, 152, "요소", 9.5, SUBSTANCE.urea.lo)}
    ${T(180, 288, "모든 물질은 순환계를 거쳐 오가요", 10.5, "#5C6E80")}
    ${marks.map((m) => `<circle cx="${m.x}" cy="${m.y}" r="13" fill="#fff" stroke="#37485C" stroke-width="2"/>${T(m.x, m.y + 4.5, m.t, 12, "#37485C")}`).join("")}`,
    "0 0 360 300",
  );
}

// ── recap 미니아트 ─────────────────────────────────────────────────────────
const mini = (inner: string, defs = ""): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"><defs>${defs}</defs>${inner}</svg>`;

const ball = (x: number, y: number, r: number, key: string): string => {
  const m = anMat(key);
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${m.mid}" stroke="${m.lo}" stroke-width="1.6"/>`;
};

const ART: Record<string, string> = {
  // L1 영양소
  carb: mini(`${ball(16, 34, 8, "starch")}${ball(32, 28, 8, "starch")}${ball(48, 34, 8, "starch")}
    <path d="M16 34 L32 28 L48 34" stroke="${SUBSTANCE.starch.lo}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M14 50 h36" stroke="${SUBSTANCE.energy.mid}" stroke-width="5" stroke-linecap="round"/>`),
  protein: mini(`${ball(22, 24, 9, "protein")}${ball(42, 34, 9, "protein")}${ball(26, 46, 9, "protein")}
    <path d="M22 24 L42 34 L26 46" stroke="${SUBSTANCE.protein.lo}" stroke-width="3.2" stroke-linecap="round"/>`),
  fat: mini(`<ellipse cx="32" cy="36" rx="20" ry="15" fill="${SUBSTANCE.fat.mid}" stroke="${SUBSTANCE.fat.lo}" stroke-width="1.8"/>
    <path d="M18 20 q14 -8 28 0" stroke="${SUBSTANCE.fat.lo}" stroke-width="3" stroke-linecap="round" fill="none"/>
    ${ball(24, 34, 5, "fatty")}${ball(40, 40, 5, "fatty")}`),
  micro: mini(`${ball(22, 28, 7, "vitamin")}${ball(42, 26, 7, "mineral")}${ball(32, 44, 7, "vitamin")}
    <path d="M12 54 h40" stroke="#B4C2D2" stroke-width="3" stroke-linecap="round"/>`),
  water: mini(`<path d="M32 12 C20 28 14 36 14 42 a18 18 0 0 0 36 0 c0 -6 -6 -14 -18 -30 Z" fill="${SUBSTANCE.water.mid}" stroke="${SUBSTANCE.water.lo}" stroke-width="1.8"/>
    <ellipse cx="25" cy="38" rx="5" ry="3.4" fill="#fff" opacity=".55"/>`),
  balance: mini(`<path d="M32 10 v40" stroke="#8B6A46" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M10 22 h44" stroke="#8B6A46" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M10 22 l-4 12 h20 l-4 -12" fill="${SUBSTANCE.starch.mid}" stroke="${SUBSTANCE.starch.lo}" stroke-width="1.4"/>
    <path d="M54 22 l-4 12 h20 l-4 -12" transform="translate(-16 0)" fill="${SUBSTANCE.vitamin.mid}" stroke="${SUBSTANCE.vitamin.lo}" stroke-width="1.4"/>
    <path d="M20 52 h24" stroke="#8B6A46" stroke-width="4" stroke-linecap="round"/>`),

  // L2 검출 시약
  iodine: mini(`<path d="M22 14 h20 v28 a10 10 0 0 1 -20 0 Z" fill="#fff" stroke="#9AB2C4" stroke-width="1.8"/>
    <path d="M23 30 h18 v12 a9 9 0 0 1 -18 0 Z" fill="#2A3F91"/>
    <circle cx="46" cy="18" r="5" fill="#8A5A1E"/>`),
  benedict: mini(`<path d="M22 12 h20 v28 a10 10 0 0 1 -20 0 Z" fill="#fff" stroke="#9AB2C4" stroke-width="1.8"/>
    <path d="M23 26 h18 v14 a9 9 0 0 1 -18 0 Z" fill="#E06A18"/>
    <path d="M16 52 q8 -8 16 0 q8 8 16 0" stroke="#F04452" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  biuret: mini(`<path d="M22 14 h20 v28 a10 10 0 0 1 -20 0 Z" fill="#fff" stroke="#9AB2C4" stroke-width="1.8"/>
    <path d="M23 30 h18 v12 a9 9 0 0 1 -18 0 Z" fill="#7B3FA0"/>
    <circle cx="46" cy="18" r="5" fill="#4E8FD6"/>`),
  sudan: mini(`<path d="M22 14 h20 v28 a10 10 0 0 1 -20 0 Z" fill="#fff" stroke="#9AB2C4" stroke-width="1.8"/>
    <path d="M23 30 h18 v12 a9 9 0 0 1 -18 0 Z" fill="#E8455E"/>
    <circle cx="46" cy="18" r="5" fill="#D9603E"/>`),
  control: mini(`<path d="M22 14 h20 v28 a10 10 0 0 1 -20 0 Z" fill="#fff" stroke="#9AB2C4" stroke-width="1.8"/>
    <path d="M23 30 h18 v12 a9 9 0 0 1 -18 0 Z" fill="#DCE9F2"/>
    <path d="M14 50 h36" stroke="#B4C2D2" stroke-width="3" stroke-linecap="round"/>`),

  // L3 소화·소화계
  size: mini(`<path d="M32 8 v48" stroke="${TISSUE.membrane.mid}" stroke-width="6" stroke-linecap="round"/>
    ${ball(16, 22, 7, "starch")}${ball(16, 38, 7, "starch")}
    <path d="M10 30 h12" stroke="${SUBSTANCE.starch.lo}" stroke-width="3"/>
    ${ball(48, 32, 6, "sugar")}
    <path d="M38 46 l6 6 l10 -12" stroke="#04B45F" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  tract: mini(`<path d="M32 8 v14 q-14 4 -12 16 q2 12 12 10 q10 -2 10 10 v6" stroke="${TISSUE.gut.mid}" stroke-width="8" fill="none" stroke-linecap="round"/>
    ${ball(32, 12, 5, "starch")}`),
  gland: mini(`<ellipse cx="22" cy="26" rx="13" ry="9" fill="${TISSUE.gland.mid}" stroke="${TISSUE.gland.lo}" stroke-width="1.6"/>
    <path d="M32 34 q8 8 12 16" stroke="${SUBSTANCE.sugar.mid}" stroke-width="3" stroke-dasharray="3 3" fill="none"/>
    <path d="M46 46 v10" stroke="${TISSUE.gut.mid}" stroke-width="7" stroke-linecap="round"/>`),
  chew: mini(`<path d="M14 24 q18 -12 36 0" stroke="#C6D6E2" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M14 42 q18 12 36 0" stroke="#C6D6E2" stroke-width="7" fill="none" stroke-linecap="round"/>
    ${ball(32, 33, 6, "starch")}`),

  // L4 소화효소
  enzyme: mini(`<path d="M14 20 L34 32 M14 44 L34 32" stroke="${SUBSTANCE.sugar.lo}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="14" cy="20" r="5" fill="none" stroke="${SUBSTANCE.sugar.lo}" stroke-width="3"/>
    <circle cx="14" cy="44" r="5" fill="none" stroke="${SUBSTANCE.sugar.lo}" stroke-width="3"/>
    ${ball(44, 24, 6, "starch")}${ball(50, 42, 6, "sugar")}`),
  stomach: mini(`<path d="M30 10 C16 16 10 30 16 40 C22 50 40 50 44 38 C48 28 42 16 30 10 Z" fill="${TISSUE.gut.mid}" stroke="${TISSUE.gut.lo}" stroke-width="1.8"/>
    ${ball(26, 30, 5, "protein")}${ball(36, 36, 5, "amino")}`),
  bile: mini(`<ellipse cx="24" cy="22" rx="13" ry="10" fill="${TISSUE.gland.mid}" stroke="${TISSUE.gland.lo}" stroke-width="1.6"/>
    <path d="M32 30 q8 8 10 14" stroke="${SUBSTANCE.vitamin.mid}" stroke-width="3" stroke-dasharray="3 3" fill="none"/>
    ${ball(46, 48, 6, "fat")}${ball(34, 50, 4.5, "fat")}${ball(54, 38, 4.5, "fat")}`),
  final: mini(`${ball(16, 24, 6, "sugar")}${ball(32, 20, 6, "amino")}${ball(48, 26, 6, "fatty")}
    <path d="M12 44 h40" stroke="#04B45F" stroke-width="4" stroke-linecap="round"/>
    <path d="M22 50 l6 6 l14 -14" stroke="#04B45F" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),

  // L5 흡수
  villi: mini(`<path d="M8 46 h48 v10 H8 Z" fill="${TISSUE.gut.lo}"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${11 + i * 8} 46 q0 -22 3 -22 q3 0 3 22 Z" fill="${TISSUE.gut.mid}" stroke="${TISSUE.gut.lo}" stroke-width="0.9"/>`).join("")}`),
  surface: mini(`<path d="M8 20 h48" stroke="#B4C2D2" stroke-width="4" stroke-linecap="round"/>
    <path d="M8 44 l6 -12 l6 12 l6 -12 l6 12 l6 -12 l6 12 l6 -12 l6 12" stroke="${SUBSTANCE.energy.mid}" stroke-width="3.4" fill="none" stroke-linejoin="round"/>
    <path d="M8 54 h48" stroke="#B4C2D2" stroke-width="2" stroke-dasharray="3 3"/>`),
  largeint: mini(`<path d="M18 50 V22 h28 v28" stroke="${TISSUE.gut.mid}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${ball(32, 36, 5, "water")}${ball(24, 44, 4, "water")}`),

  // L6 심장과 혈관
  heart4: mini(`<rect x="12" y="14" width="18" height="16" rx="4" fill="${VESSEL.poor.mid}" stroke="${VESSEL.poor.lo}" stroke-width="1.4"/>
    <rect x="34" y="14" width="18" height="16" rx="4" fill="${VESSEL.rich.mid}" stroke="${VESSEL.rich.lo}" stroke-width="1.4"/>
    <rect x="12" y="34" width="18" height="20" rx="4" fill="${VESSEL.poor.mid}" stroke="${VESSEL.poor.lo}" stroke-width="2.4"/>
    <rect x="34" y="34" width="18" height="20" rx="4" fill="${VESSEL.rich.mid}" stroke="${VESSEL.rich.lo}" stroke-width="4"/>`),
  valve: mini(`<path d="M18 12 v40 M46 12 v40" stroke="${VESSEL.rich.lo}" stroke-width="4" stroke-linecap="round"/>
    <path d="M18 30 q14 12 28 0" stroke="#F6E4E7" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M32 12 v12" stroke="${VESSEL.rich.mid}" stroke-width="5" stroke-linecap="round"/>
    <path d="M28 44 l4 8 l4 -8" fill="${VESSEL.rich.mid}"/>`),
  // L7 혈액
  plasma: mini(`<path d="M22 10 h20 v30 a10 10 0 0 1 -20 0 Z" fill="#fff" stroke="#9AB2C4" stroke-width="1.8"/>
    <path d="M23 18 h18 v12 h-18 Z" fill="#EBC85A"/>
    <path d="M23 30 h18 v10 a9 9 0 0 1 -18 0 Z" fill="#8E1626"/>
    <path d="M14 54 h36" stroke="#B4C2D2" stroke-width="3" stroke-linecap="round"/>`),
  rbc: mini(`<ellipse cx="24" cy="28" rx="13" ry="12" fill="#D8404F" stroke="#8A2230" stroke-width="1.8"/>
    <ellipse cx="24" cy="28" rx="5" ry="4.6" fill="#A81F30"/>
    <ellipse cx="42" cy="44" rx="10" ry="9" fill="#D8404F" stroke="#8A2230" stroke-width="1.6"/>
    <ellipse cx="42" cy="44" rx="4" ry="3.6" fill="#A81F30"/>`),
  wbc: mini(`<circle cx="32" cy="32" r="19" fill="#E4D6F5" stroke="#7A63A2" stroke-width="2"/>
    <ellipse cx="28" cy="29" rx="9" ry="7.5" fill="#7B5FB0" transform="rotate(20 28 29)"/>
    <ellipse cx="39" cy="39" rx="6" ry="5" fill="#7B5FB0"/>`),
  plt: mini(`<path d="M20 34 l9 -12 l12 4 l6 11 l-13 8 Z" fill="#EFC759" stroke="#A0740F" stroke-width="1.6"/>
    <path d="M12 48 q10 -6 20 0 q10 6 20 0" stroke="#F04452" stroke-width="2.6" fill="none" stroke-linecap="round"/>`),

  // L8 순환 경로
  bodyloop: mini(`<path d="M32 14 C52 14 56 30 56 40 C56 50 44 54 32 54 C20 54 8 50 8 40 C8 30 12 14 32 14 Z" stroke="${VESSEL.rich.mid}" stroke-width="5" fill="none"/>
    <circle cx="32" cy="14" r="6" fill="${TISSUE.heart.mid}"/>
    <circle cx="32" cy="54" r="5" fill="${TISSUE.cell.mid}"/>`),
  lungloop: mini(`<path d="M32 50 C48 50 52 34 44 22 C38 12 26 12 20 22 C12 34 16 50 32 50 Z" stroke="${VESSEL.poor.mid}" stroke-width="5" fill="none"/>
    <ellipse cx="22" cy="20" rx="8" ry="10" fill="${TISSUE.lung.mid}" opacity=".8"/>
    <ellipse cx="42" cy="20" rx="8" ry="10" fill="${TISSUE.lung.mid}" opacity=".8"/>
    <circle cx="32" cy="50" r="6" fill="${TISSUE.heart.mid}"/>`),
  // L9 호흡운동
  respsys: mini(`<path d="M32 10 v14 M32 24 l-10 8 M32 24 l10 8" stroke="${VESSEL.airway.mid}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <ellipse cx="20" cy="42" rx="10" ry="13" fill="${TISSUE.lung.mid}" stroke="${TISSUE.lung.lo}" stroke-width="1.4"/>
    <ellipse cx="44" cy="42" rx="10" ry="13" fill="${TISSUE.lung.mid}" stroke="${TISSUE.lung.lo}" stroke-width="1.4"/>`),
  inhale: mini(`<path d="M32 6 v16" stroke="#3182F6" stroke-width="4" stroke-linecap="round"/>
    <path d="M32 22 l-6 -8 M32 22 l6 -8" stroke="#3182F6" stroke-width="4" stroke-linecap="round"/>
    <path d="M10 32 q22 -10 44 0" stroke="${TISSUE.bone.mid}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M10 52 q22 12 44 0" stroke="${TISSUE.membrane.mid}" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  exhale: mini(`<path d="M32 22 v-16" stroke="#E8590C" stroke-width="4" stroke-linecap="round"/>
    <path d="M32 6 l-6 8 M32 6 l6 8" stroke="#E8590C" stroke-width="4" stroke-linecap="round"/>
    <path d="M10 38 q22 -10 44 0" stroke="${TISSUE.bone.mid}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M10 50 q22 -8 44 0" stroke="${TISSUE.membrane.mid}" stroke-width="5" fill="none" stroke-linecap="round"/>`),

  // L10 기체 교환
  alveoli: mini(`${[0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return `<circle cx="${(32 + Math.cos(a) * 14).toFixed(1)}" cy="${(32 + Math.sin(a) * 14).toFixed(1)}" r="11" fill="${TISSUE.lung.mid}" opacity=".8"/>`;
  }).join("")}<circle cx="32" cy="32" r="9" fill="${TISSUE.lung.hi}" opacity=".9"/>`),
  swap: mini(`<circle cx="18" cy="24" r="8" fill="${SUBSTANCE.oxygen.mid}" stroke="${SUBSTANCE.oxygen.lo}" stroke-width="1.4"/>
    <circle cx="46" cy="42" r="8" fill="${SUBSTANCE.carbon.mid}" stroke="${SUBSTANCE.carbon.lo}" stroke-width="1.4"/>
    <path d="M28 26 h18" stroke="${SUBSTANCE.oxygen.lo}" stroke-width="3" stroke-linecap="round"/>
    <path d="M46 26 l-6 -4 M46 26 l-6 4" stroke="${SUBSTANCE.oxygen.lo}" stroke-width="3" stroke-linecap="round"/>
    <path d="M36 42 h-18" stroke="${SUBSTANCE.carbon.lo}" stroke-width="3" stroke-linecap="round"/>
    <path d="M18 42 l6 -4 M18 42 l6 4" stroke="${SUBSTANCE.carbon.lo}" stroke-width="3" stroke-linecap="round"/>`),

  // L11 배설
  kidney: mini(`<path d="M30 12 C16 14 10 26 14 38 C18 50 34 54 40 44 C46 34 44 14 30 12 Z" fill="${TISSUE.kidney.mid}" stroke="${TISSUE.kidney.lo}" stroke-width="1.8"/>
    <path d="M40 32 h12" stroke="${SUBSTANCE.fat.mid}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="54" cy="46" r="7" fill="${SUBSTANCE.fat.mid}" stroke="${SUBSTANCE.fat.lo}" stroke-width="1.4"/>`),
  filtering: mini(`<path d="M10 20 h44 l-12 16 h-20 Z" fill="none" stroke="${VESSEL.capillary.mid}" stroke-width="3.4" stroke-linejoin="round"/>
    <circle cx="20" cy="14" r="6" fill="${VESSEL.rich.mid}"/><circle cx="44" cy="14" r="6" fill="${SUBSTANCE.protein.mid}"/>
    <circle cx="28" cy="48" r="4.5" fill="${SUBSTANCE.sugar.mid}"/><circle cx="40" cy="52" r="4.5" fill="${SUBSTANCE.urea.mid}"/>`),
  reabs: mini(`<path d="M10 22 h44" stroke="${SUBSTANCE.fat.mid}" stroke-width="9" stroke-linecap="round"/>
    <path d="M10 46 h44" stroke="${VESSEL.capillary.mid}" stroke-width="8" stroke-linecap="round"/>
    <path d="M26 30 v10" stroke="#04B45F" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M26 40 l-4 -6 M26 40 l4 -6" stroke="#04B45F" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M44 40 v-10" stroke="#F04452" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M44 30 l-4 6 M44 30 l4 6" stroke="#F04452" stroke-width="3.4" stroke-linecap="round"/>`),

  // L12 세포호흡·통합
  cellresp: mini(`<circle cx="32" cy="32" r="20" fill="${TISSUE.cell.mid}" stroke="${TISSUE.cell.lo}" stroke-width="1.8"/>
    <ellipse cx="28" cy="28" rx="9" ry="5.5" transform="rotate(-24 28 28)" fill="#E8843A" stroke="#9A4A0E" stroke-width="1.2"/>
    <ellipse cx="38" cy="40" rx="7" ry="4.5" transform="rotate(18 38 40)" fill="#E8843A" stroke="#9A4A0E" stroke-width="1.2"/>
    <path d="M56 14 l-6 12 h7 l-6 12" stroke="${SUBSTANCE.energy.mid}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  integrate: mini(`<circle cx="32" cy="32" r="11" fill="${TISSUE.heart.mid}" stroke="${TISSUE.heart.lo}" stroke-width="1.6"/>
    <circle cx="32" cy="10" r="7" fill="${TISSUE.lung.mid}"/><circle cx="10" cy="42" r="7" fill="${TISSUE.gut.mid}"/>
    <circle cx="54" cy="42" r="7" fill="${TISSUE.kidney.mid}"/><circle cx="32" cy="56" r="7" fill="${TISSUE.cell.mid}"/>
    <path d="M32 21 V17 M23 38 L17 41 M41 38 L47 41 M32 43 V49" stroke="${TISSUE.heart.lo}" stroke-width="2.6" stroke-linecap="round"/>`),
  energyuse: mini(`<circle cx="32" cy="30" r="14" fill="${SUBSTANCE.energy.mid}" stroke="${SUBSTANCE.energy.lo}" stroke-width="1.6"/>
    <path d="M34 22 l-7 10 h6 l-5 10" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 54 h44" stroke="${SUBSTANCE.energy.lo}" stroke-width="3" stroke-linecap="round"/>
    <path d="M16 50 v8 M32 50 v8 M48 50 v8" stroke="${SUBSTANCE.energy.lo}" stroke-width="2.4" stroke-linecap="round"/>`),

  oxycolor: mini(`<circle cx="20" cy="32" r="13" fill="${VESSEL.rich.mid}" stroke="${VESSEL.rich.lo}" stroke-width="1.8"/>
    <circle cx="46" cy="32" r="13" fill="${VESSEL.poor.mid}" stroke="${VESSEL.poor.lo}" stroke-width="1.8"/>
    <path d="M28 20 q6 -8 12 0" stroke="#5C6E80" stroke-width="2.4" fill="none" stroke-linecap="round"/>`),
  vessel3: mini(`<circle cx="15" cy="32" r="11" fill="${VESSEL.rich.lo}"/><circle cx="15" cy="32" r="6" fill="${VESSEL.rich.mid}"/>
    <circle cx="32" cy="32" r="5.5" fill="${VESSEL.capillary.lo}"/><circle cx="32" cy="32" r="4" fill="${VESSEL.capillary.mid}"/>
    <circle cx="49" cy="32" r="10" fill="${VESSEL.poor.lo}"/><circle cx="49" cy="32" r="7" fill="${VESSEL.poor.mid}"/>`),
};

/** recap 카드 미니아트. 없는 키는 빈 문자열(폴백 점) — 신규 카드는 반드시 키를 추가할 것. */
export function anMiniArt(key: string): string {
  return ART[key] ?? "";
}

export const ANIMAL_MINI_KEYS = Object.keys(ART);

/** 혈액 성분 비율 막대 — L7에서 쓰지만 도해 모듈의 일관성을 위해 여기 둔다. */
export function bloodSplitFig(): string {
  return svg(
    `<rect x="4" y="8" width="312" height="184" rx="14" fill="#F8FAFC"/>
    <path d="M126 24 h68 v120 a34 34 0 0 1 -68 0 Z" fill="#fff" stroke="#9AB2C4" stroke-width="2"/>
    <path d="M128 40 h64 v50 h-64 Z" fill="url(#bs-p)"/>
    <path d="M128 90 h64 v54 a32 32 0 0 1 -64 0 Z" fill="url(#bs-c)"/>
    <path d="M128 90 h64" stroke="#fff" stroke-width="2"/>
    <path d="M200 64 h44" stroke="#8A97A6" stroke-width="1.4"/>
    <path d="M200 118 h44" stroke="#8A97A6" stroke-width="1.4"/>
    ${T(268, 68, "혈장", 12, "#B57A1E")}
    ${T(268, 122, "혈구", 12, VESSEL.rich.lo)}
    ${T(160, 176, "혈액을 원심분리하면", 11, "#5C6E80")}`,
    "0 0 320 200",
    `${lg("bs-p", "#FFEFC0", "#F2D06A", "#B58F1E")}${lg("bs-c", "#C43142", "#9E1E30", "#6B1220")}`,
  );
}
