// atomFigures — 중2 IV(물질의 구성) 퀴즈·개념 그림 — 손코딩 교육용 SVG(라이트 카드 기준) + recap 미니아트.
// 입자 표현 관례: 원자핵 +N 라벨, 전자(−) 파랑, CPK 색(O 빨강·H 흰색·N 파랑), NaCl은 격자.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

const nucleus = (x: number, y: number, p: number, r = 20): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#E8836B"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.32}" r="${r * 0.32}" fill="#FFC0AE" opacity=".8"/>
   <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#A8442E" stroke-width="1.6"/>
   <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="${r * 0.62}" font-weight="800" fill="#fff">+${p}</text>`;
const electron = (x: number, y: number, r = 7): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#5A9AE0" stroke="#2A5AA0" stroke-width="1.4"/><line x1="${x - r * 0.45}" y1="${y}" x2="${x + r * 0.45}" y2="${y}" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;

/** 원자 모형(+p 핵, e개 전자) — 마무리 4번·중단원 2번 */
export function atomModelFig(p: number, e: number): string {
  const pos = [[-58, -26], [58, -20], [-30, 46], [44, 44], [0, -58], [-62, 22], [62, 22], [0, 58]].slice(0, e);
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="원자 모형 — 원자핵 +${p}, 전자 ${e}개">
    <ellipse cx="172" cy="85" rx="96" ry="66" stroke="#C9D2DC" stroke-width="1.6" stroke-dasharray="5 6"/>
    ${nucleus(172, 85, p, 22)}
    ${pos.map(([dx, dy]) => electron(172 + dx, 85 + dy)).join("")}
  </svg>`;
}

/** 주기율표 일부(마무리 5번) — 1·2주기 + Cl */
export function miniTableFig(): string {
  const cell = (col: number, row: number, z: number | null, sym: string): string => {
    const x = 34 + col * 34;
    const y = 30 + row * 40;
    if (!sym) return "";
    return `<rect x="${x}" y="${y}" width="30" height="36" rx="5" fill="#F7F9FC" stroke="#B0B8C1" stroke-width="1.4"/>
      ${z ? `<text x="${x + 4}" y="${y + 11}" font-size="8.5" fill="#8B95A1">${z}</text>` : ""}
      <text x="${x + 15}" y="${y + 27}" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">${sym}</text>`;
  };
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="주기율표 일부 — 1주기 수소 헬륨, 2주기 리튬 질소 플루오린, 3주기 염소">
    ${["1", "2", "13", "14", "15", "16", "17", "18"].map((g, i) => `<text x="${49 + i * 34}" y="22" text-anchor="middle" font-size="9.5" fill="#8B95A1">${g}족</text>`).join("")}
    <text x="16" y="52" font-size="9.5" fill="#8B95A1">1</text><text x="16" y="92" font-size="9.5" fill="#8B95A1">2</text><text x="16" y="132" font-size="9.5" fill="#8B95A1">3</text>
    ${cell(0, 0, 1, "H")}${cell(7, 0, 2, "He")}
    ${cell(0, 1, 3, "Li")}${cell(4, 1, 7, "N")}${cell(6, 1, 9, "F")}
    ${cell(6, 2, 17, "Cl")}
  </svg>`;
}

/** 4가지 물질 모형(마무리 7번) — 수소 분자·암모니아 분자·구리 배열·NaCl 격자 */
export function fourModelFig(): string {
  const ball = (x: number, y: number, r: number, fill: string, line: string, label = ""): string =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${line}" stroke-width="1.4"/>${label ? `<text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="${r * 0.9}" font-weight="800" fill="#333D4B">${label}</text>` : ""}`;
  const H = (x: number, y: number, r = 9): string => ball(x, y, r, "#F4F7FB", "#9AA5B4");
  const cu = (x: number, y: number): string => ball(x, y, 10, "#E0A26A", "#9E6430");
  const na = (x: number, y: number): string => ball(x, y, 7.5, "#C0A2E8", "#7A54B0");
  const cl = (x: number, y: number): string => ball(x, y, 12, "#8ED0A0", "#3E8A54");
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="네 가지 물질의 입자 모형 — 수소 분자, 암모니아 분자, 구리 원자 배열, 염화 나트륨 이온 배열">
    <g><line x1="66" y1="52" x2="94" y2="52" stroke="#9AA5B4" stroke-width="4"/>${H(60, 52, 10)}${H(100, 52, 10)}
      <text x="80" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">수소</text></g>
    <g>${[[-1, 1], [1, 1], [0, -1.4]].map(([sx, sy]) => `<line x1="${252}" y1="${46}" x2="${252 + Number(sx) * 22}" y2="${46 + Number(sy) * 16}" stroke="#9AA5B4" stroke-width="3.4"/>`).join("")}
      ${H(230, 62, 8)}${H(274, 62, 8)}${H(252, 24, 8)}${ball(252, 46, 12, "#7FA6E0", "#3A6AB0")}
      <text x="252" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">암모니아</text></g>
    <g>${[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => cu(44 + c * 24 + (r % 2) * 12, 124 + r * 21))).join("")}
      <text x="80" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">구리</text></g>
    <g>${[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => ((r + c) % 2 ? na(216 + c * 26, 126 + r * 24) : cl(216 + c * 26, 126 + r * 24)))).join("")}
      <text x="255" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">염화 나트륨</text></g>
  </svg>`;
}

/** 이온 생성 모형(마무리 8번) — A: 전자 2개 잃음 / B: 전자 1개 얻음 */
export function ionFormFig(): string {
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="원자 A는 전자 2개를 잃어 (가)가 되고, 원자 B는 전자 1개를 얻어 (나)가 된다">
    <g>${nucleus(62, 56, 12, 15)}${electron(36, 34)}${electron(88, 34)}${electron(30, 70)}${electron(94, 70)}
      <path d="M116 56h44M152 50l8 6-8 6" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
      <text x="138" y="44" text-anchor="middle" font-size="10" fill="#F04452">전자 2개 잃음</text>
      ${nucleus(228, 56, 12, 15)}${electron(204, 38)}${electron(252, 38)}
      <text x="290" y="60" font-size="13" font-weight="800" fill="#4E5968">(가)</text></g>
    <g>${nucleus(62, 148, 9, 15)}${electron(36, 128)}${electron(88, 128)}${electron(30, 162)}
      <path d="M116 148h44M152 142l8 6-8 6" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
      <text x="138" y="136" text-anchor="middle" font-size="10" fill="#3182F6">전자 1개 얻음</text>
      ${nucleus(228, 148, 9, 15)}${electron(204, 128)}${electron(252, 128)}${electron(198, 162)}${electron(258, 162)}
      <text x="290" y="152" font-size="13" font-weight="800" fill="#4E5968">(나)</text></g>
    <text x="62" y="92" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">원자 A</text>
    <text x="62" y="186" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">원자 B</text>
  </svg>`;
}

/** 물 vs 과산화 수소(마무리 6번) — 같은 원소, 다른 개수 */
export function waterPeroxFig(): string {
  const O = (x: number, y: number): string => `<circle cx="${x}" cy="${y}" r="14" fill="#E8695A" stroke="#A8342A" stroke-width="1.6"/>`;
  const H = (x: number, y: number): string => `<circle cx="${x}" cy="${y}" r="9" fill="#F4F7FB" stroke="#9AA5B4" stroke-width="1.4"/>`;
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="물 분자와 과산화 수소 분자 모형">
    <g><line x1="86" y1="62" x2="64" y2="88" stroke="#9AA5B4" stroke-width="4"/><line x1="86" y1="62" x2="108" y2="88" stroke="#9AA5B4" stroke-width="4"/>
      ${H(60, 92)}${H(112, 92)}${O(86, 60)}
      <text x="86" y="130" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">물 H&#8322;O</text></g>
    <g><line x1="234" y1="70" x2="266" y2="70" stroke="#9AA5B4" stroke-width="4"/>
      <line x1="234" y1="70" x2="216" y2="94" stroke="#9AA5B4" stroke-width="4"/><line x1="266" y1="70" x2="284" y2="94" stroke="#9AA5B4" stroke-width="4"/>
      ${H(212, 98)}${H(288, 98)}${O(234, 68)}${O(266, 68)}
      <text x="250" y="130" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">과산화 수소 H&#8322;O&#8322;</text></g>
  </svg>`;
}

/** 이온의 이동 장치(마무리 12번) — 거름종이 + 전극 */
export function ionMoveFig(): string {
  return `<svg viewBox="0 0 344 160" ${NS} fill="none" role="img" aria-label="거름종이 양끝에 전극을 연결하고 가운데에 수용액을 떨어뜨린 실험 장치">
    <rect x="52" y="56" width="240" height="56" rx="8" fill="#F4F7FB" stroke="#B0B8C1" stroke-width="1.8"/>
    <rect x="40" y="46" width="14" height="76" rx="4" fill="#8B99AC"/><rect x="290" y="46" width="14" height="76" rx="4" fill="#8B99AC"/>
    <path d="M47 46V26h100M297 46V26h-100" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
    <circle cx="47" cy="20" r="10" fill="#F0685A"/><text x="47" y="24.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">+</text>
    <circle cx="297" cy="20" r="10" fill="#5A88D8"/><text x="297" y="24.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">−</text>
    <circle cx="172" cy="84" r="15" fill="#7FB0E8" opacity=".75"/>
    <text x="172" y="132" text-anchor="middle" font-size="11" fill="#4E5968">황산 구리(Ⅱ) 수용액 한 방울</text>
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
const MINI: Record<string, string> = {
  elemPure: `<circle cx="20" cy="24" r="8" fill="#E0A26A"/><circle cx="40" cy="24" r="8" fill="#E0A26A"/><circle cx="30" cy="40" r="8" fill="#E0A26A"/><circle cx="50" cy="40" r="8" fill="#E0A26A"/>
    <path d="M10 56h44" stroke="#8B95A1" stroke-width="2"/>`,
  compoundMix: `<circle cx="22" cy="26" r="9" fill="#8ED0A0"/><circle cx="42" cy="26" r="6" fill="#C0A2E8"/><circle cx="22" cy="46" r="6" fill="#C0A2E8"/><circle cx="43" cy="45" r="9" fill="#8ED0A0"/>
    <path d="M54 14l4-4M56 22h6" stroke="#F0A422" stroke-width="2.2"/>`,
  symbolMini: `<rect x="10" y="12" width="28" height="32" rx="6" fill="#EEF4FF" stroke="#3182F6" stroke-width="2"/>
    <text x="24" y="34" text-anchor="middle" font-size="16" font-weight="800" fill="#1B64DA">H</text>
    <rect x="28" y="24" width="28" height="32" rx="6" fill="#FFF4E0" stroke="#F0A422" stroke-width="2"/>
    <text x="42" y="46" text-anchor="middle" font-size="15" font-weight="800" fill="#C77800">Fe</text>`,
  formulaMini: `<circle cx="24" cy="26" r="10" fill="#E8695A"/><circle cx="13" cy="40" r="7" fill="#F4F7FB" stroke="#9AA5B4" stroke-width="1.4"/><circle cx="36" cy="40" r="7" fill="#F4F7FB" stroke="#9AA5B4" stroke-width="1.4"/>
    <text x="46" y="30" font-size="13" font-weight="800" fill="#333D4B">H</text><text x="54" y="35" font-size="9" font-weight="800" fill="#333D4B">2</text><text x="58" y="30" font-size="13" font-weight="800" fill="#333D4B">O</text>`,
  atomCore: `<ellipse cx="32" cy="32" rx="24" ry="16" stroke="#B0B8C1" stroke-width="1.6" stroke-dasharray="4 4" fill="none"/>
    <circle cx="32" cy="32" r="9" fill="#E8836B" stroke="#A8442E" stroke-width="1.4"/>
    <text x="32" y="36" text-anchor="middle" font-size="9" font-weight="800" fill="#fff">+3</text>
    <circle cx="10" cy="26" r="5" fill="#5A9AE0"/><circle cx="52" cy="24" r="5" fill="#5A9AE0"/><circle cx="34" cy="52" r="5" fill="#5A9AE0"/>`,
  protonKey: `<circle cx="22" cy="32" r="12" fill="#E8836B"/><text x="22" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">+6</text>
    <path d="M40 26h12M46 20v12" stroke="#04B45F" stroke-width="2.6"/>
    <text x="46" y="52" text-anchor="middle" font-size="10" font-weight="800" fill="#4E5968">탄소!</text>`,
  tableMini: `<rect x="8" y="12" width="48" height="40" rx="6" fill="#F3F9E2" stroke="#7CB024" stroke-width="2"/>
    <path d="M8 25h48M24 12v40M40 12v40" stroke="#FFF" stroke-width="2"/>
    <rect x="40" y="25" width="16" height="27" fill="#7CB024" opacity=".3"/>`,
  groupTwin: `<rect x="24" y="8" width="16" height="48" rx="5" fill="#FFE7CC" stroke="#F0B46A" stroke-width="2"/>
    <circle cx="32" cy="18" r="4.5" fill="#E08A3A"/><circle cx="32" cy="32" r="4.5" fill="#E08A3A"/><circle cx="32" cy="46" r="4.5" fill="#E08A3A"/>
    <path d="M46 22q6 10 0 20" stroke="#8B95A1" stroke-width="2" fill="none"/>`,
  moleculeWater: `<line x1="32" y1="26" x2="18" y2="42" stroke="#9AA5B4" stroke-width="3.6"/><line x1="32" y1="26" x2="46" y2="42" stroke="#9AA5B4" stroke-width="3.6"/>
    <circle cx="15" cy="45" r="8" fill="#F4F7FB" stroke="#9AA5B4" stroke-width="1.4"/><circle cx="49" cy="45" r="8" fill="#F4F7FB" stroke="#9AA5B4" stroke-width="1.4"/>
    <circle cx="32" cy="24" r="11" fill="#E8695A" stroke="#A8342A" stroke-width="1.4"/>`,
  ionPair: `<circle cx="22" cy="30" r="11" fill="#E8836B"/><path d="M17 30h10M22 25v10" stroke="#fff" stroke-width="2.2"/>
    <circle cx="46" cy="38" r="9" fill="#5A9AE0"/><path d="M42 38h8" stroke="#fff" stroke-width="2.2"/>
    <path d="M30 12l6 6M60 16l-5 5" stroke="#F0A422" stroke-width="2"/>`,
  naclMini: `${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${16 + c * 16}" cy="${16 + r * 16}" r="${(r + c) % 2 ? 5 : 7.5}" fill="${(r + c) % 2 ? "#C0A2E8" : "#8ED0A0"}"/>`).join("")).join("")}`,
  moveMini: `<rect x="6" y="24" width="52" height="18" rx="5" fill="#F4F7FB" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="30" cy="33" r="5" fill="#5AA2F8"/><path d="M37 33h11M44 29l4 4-4 4" stroke="#5AA2F8" stroke-width="2" fill="none"/>
    <text x="58" y="20" text-anchor="end" font-size="11" font-weight="800" fill="#5A88D8">−</text>
    <text x="8" y="20" font-size="11" font-weight="800" fill="#F0685A">+</text>`,
};

export function atomMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
