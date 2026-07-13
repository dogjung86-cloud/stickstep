// plantFigures — 중2 V 식물과 에너지 퀴즈 SVG와 recap 미니아트.
// 생성 이미지가 아니라 좌표·방향·그래프가 정답인 도해를 정확하게 그린다.

const svg = (inner: string, defs = "", viewBox = "0 0 360 220", label = "식물과 에너지 도해"): string =>
  `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${label}"><title>${label}</title><defs>${defs}</defs>${inner}</svg>`;

const arrow = (id: string, color: string): string =>
  `<marker id="${id}" viewBox="0 0 10 10" refX="8.4" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9 Z" fill="${color}"/></marker>`;

export type PlantMiniKind = "factory" | "evidence" | "factor" | "respire" | "cycle" | "journey";

export function plantMiniArt(kind: PlantMiniKind): string {
  const miniLabel: Record<PlantMiniKind, string> = {
    factory: "잎과 엽록체 미니 그림",
    evidence: "아이오딘 녹말 검출 미니 그림",
    factor: "광합성량 그래프 미니 그림",
    respire: "마이토콘드리아 호흡 미니 그림",
    cycle: "광합성과 호흡의 연결 미니 그림",
    journey: "물관과 체관의 이동 미니 그림",
  };
  if (kind === "factory") return svg(
    `<path d="M9 35 C12 12 43 5 56 14 C51 39 37 54 11 49 Z" fill="url(#mleaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.6"/>
     <path d="M14 47 C27 36 38 26 52 16" stroke="var(--plant-vein)" stroke-width="2" stroke-linecap="round"/>
     <ellipse cx="34" cy="31" rx="10" ry="7" fill="var(--plant-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
     <path d="M29 29 h10 M29 32 h10 M29 35 h10" stroke="var(--plant-vein)" stroke-width="1.2"/>`,
    `<linearGradient id="mleaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--plant-leaf-hi)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></linearGradient>`,
    "0 0 64 64",
    miniLabel[kind],
  );
  if (kind === "evidence") return svg(
    `<ellipse cx="20" cy="43" rx="15" ry="6" fill="var(--n100)" stroke="var(--n400)"/>
     <ellipse cx="46" cy="43" rx="15" ry="6" fill="var(--n100)" stroke="var(--n400)"/>
     <path d="M9 39 C13 23 27 18 32 24 C28 37 20 42 9 39 Z" fill="var(--plant-leaf-hi)" stroke="var(--plant-leaf-lo)"/>
     <path d="M35 39 C39 23 53 18 59 24 C55 37 47 42 35 39 Z" fill="var(--plant-leaf)" stroke="var(--plant-leaf-lo)"/>
     <path d="M41 35 C44 27 52 26 55 30 C52 38 45 39 41 35 Z" fill="var(--stage)" opacity=".86"/>`,
    "",
    "0 0 64 64",
    miniLabel[kind],
  );
  if (kind === "factor") return svg(
    `<path d="M9 53 V12 M9 53 H58" stroke="var(--n500)" stroke-width="2" stroke-linecap="round"/>
     <path d="M12 49 C18 31 24 21 34 17 C43 13 50 13 57 13" stroke="var(--subj-plant)" stroke-width="4" stroke-linecap="round"/>
     <circle cx="42" cy="13.5" r="4" fill="var(--plant-sun)" stroke="var(--n0)" stroke-width="1.5"/>`,
    "",
    "0 0 64 64",
    miniLabel[kind],
  );
  if (kind === "respire") return svg(
    `<path d="M13 32 C13 18 23 11 34 16 C43 20 51 18 53 28 C56 40 46 52 34 49 C21 53 12 44 13 32 Z" fill="url(#mito)" stroke="var(--subj-plant-press)" stroke-width="1.8"/>
     <path d="M19 27 C25 18 29 39 36 24 C42 12 47 35 50 28 M18 38 C25 28 31 48 38 34 C44 23 47 45 51 37" stroke="var(--plant-sun)" stroke-width="2.2" stroke-linecap="round"/>`,
    `<linearGradient id="mito" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--plant-phloem)"/><stop offset="1" stop-color="var(--subj-plant-press)"/></linearGradient>`,
    "0 0 64 64",
    miniLabel[kind],
  );
  if (kind === "cycle") return svg(
    `<ellipse cx="20" cy="31" rx="13" ry="18" fill="var(--plant-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.6"/>
     <path d="M14 28 h12 M14 32 h12 M14 36 h12" stroke="var(--plant-vein)" stroke-width="1.6"/>
     <path d="M42 18 C52 14 59 21 57 31 C60 42 50 51 41 46 C31 50 27 39 31 31 C27 23 33 17 42 18 Z" fill="var(--plant-phloem)" stroke="var(--subj-plant-press)" stroke-width="1.6"/>
     <path d="M33 27 C38 19 41 38 46 25 C50 17 53 34 56 28 M33 38 C38 30 43 45 48 35 C52 29 54 42 57 37" stroke="var(--plant-sun)" stroke-width="1.5"/>
     <path d="M26 20 C31 13 36 12 41 15 M39 49 C33 53 27 50 24 44" stroke="var(--n500)" stroke-width="2" marker-end="url(#ma)"/>`,
    arrow("ma", "var(--n500)"),
    "0 0 64 64",
    miniLabel[kind],
  );
  return svg(
    `<path d="M32 55 C31 42 32 30 32 13" stroke="var(--plant-leaf-lo)" stroke-width="5" stroke-linecap="round"/>
     <path d="M32 28 C21 18 13 20 9 27 C17 36 24 34 32 28 Z M32 20 C41 11 52 13 56 19 C49 29 40 27 32 20 Z" fill="var(--plant-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.3"/>
     <path d="M28 51 V18" stroke="var(--plant-xylem)" stroke-width="2.6" marker-end="url(#mx)"/>
     <path d="M36 27 V12" stroke="var(--plant-phloem)" stroke-width="2.6" marker-end="url(#mpu)"/>
     <path d="M39 26 V50" stroke="var(--plant-phloem)" stroke-width="2.6" marker-end="url(#mpd)"/>`,
    arrow("mx", "var(--plant-xylem)") + arrow("mpu", "var(--plant-phloem)") + arrow("mpd", "var(--plant-phloem)"),
    "0 0 64 64",
    miniLabel[kind],
  );
}

export function leafRouteFig(): string {
  return svg(
    `<rect x="8" y="8" width="344" height="204" rx="18" fill="var(--subj-plant-tint)"/>
     <path d="M46 132 C55 48 177 23 252 54 C238 144 165 190 61 168 Z" fill="url(#leaf)" stroke="var(--plant-leaf-lo)" stroke-width="3"/>
     <path d="M61 163 C111 132 169 94 234 58" stroke="var(--plant-vein)" stroke-width="5" stroke-linecap="round"/>
     <path d="M159 112 C132 85 106 82 85 93 M174 100 C151 68 147 52 149 42 M188 91 C216 83 231 89 241 104" stroke="var(--plant-vein)" stroke-width="2.2" opacity=".78"/>
     <g transform="translate(272 95)"><path d="M-10 -28 C-31 -24 -30 27 -10 29 C2 18 3 -18 -10 -28 Z" fill="var(--plant-leaf-hi)" stroke="var(--plant-leaf-lo)" stroke-width="2"/><path d="M10 -28 C31 -24 30 27 10 29 C-2 18 -3 -18 10 -28 Z" fill="var(--plant-leaf-hi)" stroke="var(--plant-leaf-lo)" stroke-width="2"/><ellipse rx="7" ry="23" fill="var(--stage)"/></g>
     <ellipse cx="183" cy="112" rx="39" ry="25" fill="var(--plant-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="2.4"/>
     <path d="M162 105 h42 M162 112 h42 M162 119 h42" stroke="var(--plant-vein)" stroke-width="2.5"/>
     <path d="M24 191 C88 181 116 169 150 144" stroke="var(--plant-xylem)" stroke-width="6" marker-end="url(#water)"/>
     <path d="M337 61 C318 69 300 79 286 91" stroke="var(--plant-carbon)" stroke-width="6" marker-end="url(#co2)"/>
     <text x="166" y="146" font-size="15" font-weight="850" fill="var(--n0)">(가)</text>
     <text x="273" y="139" font-size="15" font-weight="850" fill="var(--n800)">(나)</text>
     <text x="37" y="195" font-size="15" font-weight="850" fill="var(--n800)">(다)</text>`,
    `<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--plant-leaf-hi)"/><stop offset=".55" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></linearGradient>${arrow("water", "var(--plant-xylem)")}${arrow("co2", "var(--plant-carbon)")}`,
    "0 0 360 220",
    "잎의 엽록체와 기공, 물관으로 들어오는 광합성 재료",
  );
}

export function sensorGraphFig(): string {
  const chart = (x: number, color: string, down: boolean, label: string): string =>
    `<g transform="translate(${x} 24)"><rect width="148" height="154" rx="14" fill="var(--n0)" stroke="var(--n200)"/>
     <path d="M24 20 V126 H128" stroke="var(--n500)" stroke-width="1.8"/>
     <path d="M28 ${down ? 35 : 116} C54 ${down ? 50 : 100} 86 ${down ? 85 : 68} 124 ${down ? 112 : 35}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
     <circle cx="124" cy="${down ? 112 : 35}" r="5" fill="${color}"/>
     <text x="74" y="146" text-anchor="middle" font-size="13" font-weight="800" fill="var(--n700)">${label}</text></g>`;
  return svg(
    `<rect x="8" y="8" width="344" height="204" rx="18" fill="var(--subj-plant-tint)"/>
     ${chart(24, "var(--plant-carbon)", true, "이산화 탄소")}
     ${chart(188, "var(--plant-oxygen)", false, "산소")}
     <text x="180" y="202" text-anchor="middle" font-size="12" font-weight="750" fill="var(--n600)">빛을 비춘 밀폐 용기</text>`,
    "",
    "0 0 360 220",
    "빛을 받은 식물 주변의 이산화 탄소 감소와 산소 증가 그래프",
  );
}

export function starchTestFig(): string {
  return svg(
    `<rect x="8" y="8" width="344" height="204" rx="18" fill="var(--subj-plant-tint)"/>
     <g transform="translate(28 24)"><ellipse cx="70" cy="139" rx="70" ry="24" fill="var(--n0)" stroke="var(--n300)" stroke-width="2"/>
     <path d="M18 125 C29 62 101 42 130 68 C119 125 74 150 18 125 Z" fill="var(--blue-press)" stroke="var(--blue-tint-2)" stroke-width="3"/>
     <path d="M25 122 C55 108 78 91 116 73 M54 109 L46 88 M76 96 L88 76" fill="none" stroke="var(--blue-tint-2)" stroke-width="2.2" stroke-linecap="round" opacity=".86"/>
     <text x="70" y="181" text-anchor="middle" font-size="14" font-weight="850" fill="var(--n700)">햇빛 받은 잎</text></g>
     <g transform="translate(192 24)"><ellipse cx="70" cy="139" rx="70" ry="24" fill="var(--n0)" stroke="var(--n300)" stroke-width="2"/>
     <path d="M18 125 C29 62 101 42 130 68 C119 125 74 150 18 125 Z" fill="var(--plant-leaf-hi)" stroke="var(--plant-leaf-lo)" stroke-width="2.4" opacity=".72"/>
     <text x="70" y="181" text-anchor="middle" font-size="14" font-weight="850" fill="var(--n700)">햇빛 가린 잎</text></g>`,
    "",
    "0 0 360 220",
    "빛을 받은 부분과 가린 부분의 아이오딘 녹말 반응 비교",
  );
}

export function factorCurvesFig(): string {
  const chart = (x: number, label: string, mode: "sat" | "temp", color: string, tag: string): string =>
    `<g transform="translate(${x} 28)"><rect width="104" height="152" rx="13" fill="var(--n0)" stroke="var(--n200)"/>
     <path d="M17 19 V118 H91" stroke="var(--n500)" stroke-width="1.5"/>
     ${mode === "sat"
      ? `<path d="M20 111 C29 72 43 46 61 37 C72 32 82 32 89 32" stroke="${color}" stroke-width="3.6" stroke-linecap="round"/>`
      : `<path d="M20 111 C34 104 47 80 61 45 C71 21 83 39 89 108" stroke="${color}" stroke-width="3.6" stroke-linecap="round"/>`}
     <text x="52" y="139" text-anchor="middle" font-size="12" font-weight="800" fill="var(--n700)">${label}</text>
     <circle cx="13" cy="11" r="10" fill="${color}"/><text x="13" y="15" text-anchor="middle" font-size="11" font-weight="900" fill="var(--n0)">${tag}</text></g>`;
  return svg(
    `<rect x="8" y="8" width="344" height="204" rx="18" fill="var(--subj-plant-tint)"/>
     ${chart(16, "빛의 세기", "sat", "var(--plant-sun)", "가")}
     ${chart(128, "이산화 탄소", "sat", "var(--plant-carbon)", "나")}
     ${chart(240, "온도", "temp", "var(--subj-plant)", "다")}
     <text x="180" y="201" text-anchor="middle" font-size="11.5" font-weight="750" fill="var(--n600)">세로축: 광합성량</text>`,
    "",
    "0 0 360 220",
    "빛의 세기와 이산화 탄소 농도, 온도에 따른 광합성량 그래프",
  );
}

export function respirationCycleFig(): string {
  return svg(
    `<rect x="8" y="8" width="344" height="204" rx="18" fill="var(--subj-plant-tint)"/>
     <g transform="translate(90 106)"><ellipse rx="58" ry="38" fill="url(#chl)" stroke="var(--plant-leaf-lo)" stroke-width="2.6"/>
     <path d="M-33 -14 h66 M-33 -5 h66 M-33 5 h66 M-33 14 h66" stroke="var(--plant-vein)" stroke-width="3"/><text y="60" text-anchor="middle" font-size="15" font-weight="900" fill="var(--subj-plant-press)">광합성</text></g>
     <g transform="translate(270 106)"><path d="M-53 2 C-55 -33 -24 -48 6 -35 C34 -46 55 -22 48 7 C58 35 21 50 -6 36 C-35 49 -59 28 -53 2 Z" fill="url(#mito2)" stroke="var(--subj-plant-press)" stroke-width="2.6"/>
     <path d="M-39 -9 C-22 -31 -14 21 2 -14 C16 -38 26 13 42 -10 M-39 14 C-21 -8 -12 38 5 8 C19 -17 29 30 42 12" stroke="var(--plant-sun)" stroke-width="3" stroke-linecap="round"/><text y="60" text-anchor="middle" font-size="15" font-weight="900" fill="var(--subj-plant-press)">호흡</text></g>
     <path d="M146 72 C172 48 203 48 221 70" stroke="var(--plant-oxygen)" stroke-width="5" marker-end="url(#toR)"/>
     <path d="M220 143 C196 164 166 164 145 143" stroke="var(--plant-water)" stroke-width="5" marker-end="url(#toL)"/>
     <text x="182" y="43" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--n700)">포도당 · 산소</text>
     <text x="182" y="188" text-anchor="middle" font-size="12.5" font-weight="800" fill="var(--n700)">이산화 탄소 · 물</text>
     <circle cx="270" cy="30" r="15" fill="var(--plant-sun)"/><text x="270" y="35" text-anchor="middle" font-size="11" font-weight="900" fill="var(--n800)">에너지</text>`,
    `<linearGradient id="chl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--plant-leaf-hi)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></linearGradient>
     <linearGradient id="mito2" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--plant-phloem)"/><stop offset="1" stop-color="var(--subj-plant-press)"/></linearGradient>
     ${arrow("toR", "var(--plant-oxygen)")}${arrow("toL", "var(--plant-water)")}`,
    "0 0 360 220",
    "엽록체의 광합성과 마이토콘드리아의 호흡 사이 물질과 에너지 관계",
  );
}

export function dayNightFlowFig(): string {
  const tree = (x: number, dark: boolean): string =>
    `<g transform="translate(${x} 28)"><rect width="148" height="156" rx="16" fill="${dark ? "var(--stage)" : "var(--subj-plant-tint)"}"/>
     <path d="M74 133 C73 104 75 79 74 50" stroke="var(--plant-soil)" stroke-width="10" stroke-linecap="round"/>
     <circle cx="74" cy="51" r="38" fill="var(--plant-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="2"/>
     <circle cx="${dark ? 27 : 121}" cy="24" r="12" fill="${dark ? "var(--n0)" : "var(--plant-sun)"}" opacity=".9"/>
     ${dark
      ? `<path d="M132 77 H112" stroke="var(--plant-oxygen)" stroke-width="5" marker-end="url(#nightIn)"/><path d="M36 95 H16" stroke="var(--plant-carbon)" stroke-width="5" marker-end="url(#nightOut)"/>`
      : `<path d="M16 77 H38" stroke="var(--plant-carbon)" stroke-width="7" marker-end="url(#dayIn)"/><path d="M110 95 H134" stroke="var(--plant-oxygen)" stroke-width="7" marker-end="url(#dayOut)"/>`}
     <text x="74" y="150" text-anchor="middle" font-size="13" font-weight="850" fill="${dark ? "var(--n0)" : "var(--n800)"}">${dark ? "밤" : "강한 낮"}</text></g>`;
  return svg(
    `${tree(22, false)}${tree(190, true)}
     <text x="96" y="205" text-anchor="middle" font-size="11.5" font-weight="750" fill="var(--n600)">굵은 화살표 = 순변화</text>
     <text x="264" y="205" text-anchor="middle" font-size="11.5" font-weight="750" fill="var(--n600)">호흡은 낮에도 계속</text>`,
    `${arrow("dayIn", "var(--plant-carbon)")}${arrow("dayOut", "var(--plant-oxygen)")}${arrow("nightIn", "var(--plant-oxygen)")}${arrow("nightOut", "var(--plant-carbon)")}`,
    "0 0 360 220",
    "강한 낮과 밤에 나타나는 식물의 순 기체 출입 비교",
  );
}

export function transportFig(): string {
  return svg(
    `<rect x="8" y="8" width="344" height="204" rx="18" fill="var(--subj-plant-tint)"/>
     <path d="M180 194 C177 154 180 106 180 37" stroke="var(--plant-soil)" stroke-width="17" stroke-linecap="round"/>
     <path d="M174 188 V45" stroke="var(--plant-xylem)" stroke-width="5" marker-end="url(#up)"/>
     <path d="M180 81 C133 48 83 50 55 72 C88 112 131 111 180 81 Z M180 63 C222 31 276 35 307 62 C274 99 224 99 180 63 Z" fill="var(--plant-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="2.4"/>
     <path d="M180 132 C225 109 263 114 288 138" stroke="var(--plant-soil)" stroke-width="7"/><circle cx="299" cy="145" r="27" fill="var(--red)" stroke="var(--red-press)" stroke-width="2"/>
     <path d="M180 185 C145 191 118 204 100 211 M180 185 C213 190 239 204 259 211" stroke="var(--plant-soil)" stroke-width="6" stroke-linecap="round"/>
     <path d="M132 75 C151 86 163 96 183 106" stroke="var(--plant-phloem)" stroke-width="4" marker-end="url(#intoStem)"/>
     <path d="M183 104 V38" stroke="var(--plant-phloem)" stroke-width="5" marker-end="url(#sugarUp)"/>
     <path d="M188 106 V188" stroke="var(--plant-phloem)" stroke-width="5" marker-end="url(#sugarDown)"/>
     <path d="M187 111 C222 121 255 130 276 140" stroke="var(--plant-phloem)" stroke-width="4" marker-end="url(#toFruit)"/>
     <text x="42" y="126" font-size="13" font-weight="850" fill="var(--plant-xylem)">(가)</text>
     <text x="200" y="127" font-size="13" font-weight="850" fill="var(--plant-phloem)">(나)</text>
     <text x="283" y="184" font-size="13" font-weight="850" fill="var(--n800)">(다)</text>`,
    `${arrow("up", "var(--plant-xylem)")}${arrow("sugarUp", "var(--plant-phloem)")}${arrow("sugarDown", "var(--plant-phloem)")}${arrow("intoStem", "var(--plant-phloem)")}${arrow("toFruit", "var(--plant-phloem)")}`,
    "0 0 360 220",
    "물관의 물 이동과 체관의 당 양방향 이동, 열매로 가는 양분",
  );
}
