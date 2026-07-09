// atomFigures — 중2 IV(물질의 구성) 퀴즈·개념 그림 — 손코딩 교육용 SVG(라이트 카드 기준) + recap 미니아트.
// 입자 표현 관례: 원자핵 +N 라벨, 전자(−) 파랑, CPK 색(O 빨강·H 흰색·N 파랑), NaCl은 격자.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

const nucleus = (x: number, y: number, p: number, r = 20): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#E8836B"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.32}" r="${r * 0.32}" fill="#FFC0AE" opacity=".8"/>
   <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#A8442E" stroke-width="1.6"/>
   <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="${r * 0.62}" font-weight="800" fill="#fff">+${p}</text>`;
const electron = (x: number, y: number, r = 7): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#5A9AE0" stroke="#2A5AA0" stroke-width="1.4"/><line x1="${x - r * 0.45}" y1="${y}" x2="${x + r * 0.45}" y2="${y}" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;

/** 원자 모형(+p 핵, e개 전자 — 파라미터형, 전자 최대 8개) — 원자 구조 판독 문제용 */
export function atomModelFig(p: number, e: number): string {
  const pos = [[-58, -26], [58, -20], [-30, 46], [44, 44], [0, -58], [-62, 22], [62, 22], [0, 58]].slice(0, e);
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="원자 모형 — 원자핵 +${p}, 전자 ${e}개">
    <ellipse cx="172" cy="85" rx="96" ry="66" stroke="#C9D2DC" stroke-width="1.6" stroke-dasharray="5 6"/>
    ${nucleus(172, 85, p, 22)}
    ${pos.map(([dx, dy]) => electron(172 + dx, 85 + dy)).join("")}
  </svg>`;
}

/** 주기율표 일부 — 1주기(H·He)·2주기(Be·O·Ne)·3주기(Na), 족·주기 성질 판독 문제용 */
export function miniTableFig(): string {
  const cell = (col: number, row: number, z: number | null, sym: string): string => {
    const x = 34 + col * 34;
    const y = 30 + row * 40;
    if (!sym) return "";
    return `<rect x="${x}" y="${y}" width="30" height="36" rx="5" fill="#F7F9FC" stroke="#B0B8C1" stroke-width="1.4"/>
      ${z ? `<text x="${x + 4}" y="${y + 11}" font-size="8.5" fill="#8B95A1">${z}</text>` : ""}
      <text x="${x + 15}" y="${y + 27}" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">${sym}</text>`;
  };
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="주기율표 일부 — 1주기 수소 헬륨, 2주기 베릴륨 산소 네온, 3주기 나트륨">
    ${["1", "2", "13", "14", "15", "16", "17", "18"].map((g, i) => `<text x="${49 + i * 34}" y="22" text-anchor="middle" font-size="9.5" fill="#8B95A1">${g}족</text>`).join("")}
    <text x="16" y="52" font-size="9.5" fill="#8B95A1">1</text><text x="16" y="92" font-size="9.5" fill="#8B95A1">2</text><text x="16" y="132" font-size="9.5" fill="#8B95A1">3</text>
    ${cell(0, 0, 1, "H")}${cell(7, 0, 2, "He")}
    ${cell(1, 1, 4, "Be")}${cell(5, 1, 8, "O")}${cell(7, 1, 10, "Ne")}
    ${cell(0, 2, 11, "Na")}
  </svg>`;
}

/** 4가지 물질의 입자 모형 — 산소 분자·물 분자·철 원자 배열·NaCl 이온 격자(원자/분자/이온 구분 문제용) */
export function fourModelFig(): string {
  const ball = (x: number, y: number, r: number, fill: string, line: string, label = ""): string =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${line}" stroke-width="1.4"/>${label ? `<text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="${r * 0.9}" font-weight="800" fill="#333D4B">${label}</text>` : ""}`;
  const H = (x: number, y: number, r = 9): string => ball(x, y, r, "#F4F7FB", "#9AA5B4");
  const O = (x: number, y: number, r = 12): string => ball(x, y, r, "#E8695A", "#A8342A");
  const fe = (x: number, y: number): string => ball(x, y, 10, "#A87858", "#6B4630");
  const na = (x: number, y: number): string => ball(x, y, 7.5, "#C0A2E8", "#7A54B0");
  const cl = (x: number, y: number): string => ball(x, y, 12, "#8ED0A0", "#3E8A54");
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="네 가지 물질의 입자 모형 — 산소 분자, 물 분자, 철 원자 배열, 염화 나트륨 이온 배열">
    <g><line x1="66" y1="52" x2="94" y2="52" stroke="#9AA5B4" stroke-width="4"/>${O(60, 52)}${O(100, 52)}
      <text x="80" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">산소</text></g>
    <g><line x1="252" y1="44" x2="224" y2="66" stroke="#9AA5B4" stroke-width="4"/><line x1="252" y1="44" x2="280" y2="66" stroke="#9AA5B4" stroke-width="4"/>
      ${H(224, 68, 8)}${H(280, 68, 8)}${O(252, 44, 12)}
      <text x="252" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">물</text></g>
    <g>${[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => fe(44 + c * 24 + (r % 2) * 12, 124 + r * 21))).join("")}
      <text x="80" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">철</text></g>
    <g>${[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => ((r + c) % 2 ? na(216 + c * 26, 126 + r * 24) : cl(216 + c * 26, 126 + r * 24)))).join("")}
      <text x="255" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">염화 나트륨</text></g>
  </svg>`;
}

/** 이온 생성 모형 — 원자 A(+4, 전자 4개)는 전자 2개를 잃어 (가) A²⁺, 원자 B(+9, 전자 9개)는 전자 1개를 얻어 (나) B⁻.
 *  전하 검산: 중성 원자는 양성자수 = 전자 수, (가) +4/전자 2 → 2+, (나) +9/전자 10 → 1−. */
export function ionFormFig(): string {
  const ring = (cx: number, cy: number, n: number, rx: number, ry: number): string =>
    Array.from({ length: n }, (_, i) => {
      const th = (Math.PI * 2 * i) / n - Math.PI / 2;
      return electron(Math.round(cx + rx * Math.cos(th)), Math.round(cy + ry * Math.sin(th)), 6);
    }).join("");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="원자 A는 전자 2개를 잃어 양이온 (가)가 되고, 원자 B는 전자 1개를 얻어 음이온 (나)가 된다">
    <g>${nucleus(62, 56, 4, 15)}${electron(36, 34)}${electron(88, 34)}${electron(30, 70)}${electron(94, 70)}
      <path d="M116 56h44M152 50l8 6-8 6" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
      <text x="138" y="44" text-anchor="middle" font-size="10" fill="#F04452">전자 2개 잃음</text>
      ${nucleus(228, 56, 4, 15)}${electron(204, 38)}${electron(252, 38)}
      <text x="290" y="60" font-size="13" font-weight="800" fill="#4E5968">(가)</text></g>
    <g>${nucleus(62, 146, 9, 15)}${ring(62, 146, 9, 34, 22)}
      <path d="M116 146h44M152 140l8 6-8 6" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
      <text x="138" y="134" text-anchor="middle" font-size="10" fill="#3182F6">전자 1개 얻음</text>
      ${nucleus(232, 146, 9, 15)}${ring(232, 146, 10, 34, 22)}
      <text x="292" y="150" font-size="13" font-weight="800" fill="#4E5968">(나)</text></g>
    <text x="62" y="92" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">원자 A</text>
    <text x="62" y="192" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">원자 B</text>
  </svg>`;
}

/** 물 vs 과산화 수소 분자 모형 — 같은 원소, 다른 개수 */
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

/** 이온의 이동 장치 — 거름종이 + 전극 */
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

/** L2 개념 — 화학식 해부도: 아래 숫자의 뜻(H₂O) */
export function formulaAnatomyFig(): string {
  return `<svg viewBox="0 0 344 150" ${NS} fill="none" role="img" aria-label="화학식 H2O에서 아래 숫자 2는 수소 원자의 개수, 산소의 1은 생략">
    <text x="118" y="76" text-anchor="middle" font-size="52" font-weight="800" fill="#333D4B">H</text>
    <text x="152" y="92" text-anchor="middle" font-size="34" font-weight="800" fill="#0B9E62">2</text>
    <text x="196" y="76" text-anchor="middle" font-size="52" font-weight="800" fill="#333D4B">O</text>
    <circle cx="152" cy="81" r="21" stroke="#0B9E62" stroke-width="1.8" stroke-dasharray="4 4"/>
    <path d="M152 104v14" stroke="#0B9E62" stroke-width="1.8"/>
    <text x="152" y="134" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0B9E62">수소 원자 2개 (기호 오른쪽 아래!)</text>
    <text x="226" y="92" text-anchor="middle" font-size="26" font-weight="800" fill="#C9D2DC">1</text>
    <path d="M226 44v22" stroke="#B0B8C1" stroke-width="1.6" stroke-dasharray="3 4"/>
    <text x="226" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8B95A1">산소 원자 1개 — 1은 생략!</text>
  </svg>`;
}

/** L4 개념 — 주기율표 칸 읽는 법(교과서 그림 IV-6의 수소 칸 해부도) */
export function cellAnatomyFig(): string {
  const callout = (y: number, label: string, tx: number, ty: number, color: string): string => `
    <text x="118" y="${y + 4}" text-anchor="end" font-size="13" font-weight="800" fill="${color}">${label}</text>
    <line x1="126" y1="${y}" x2="${tx}" y2="${ty}" stroke="${color}" stroke-width="1.6"/>
    <circle cx="${tx}" cy="${ty}" r="2.6" fill="${color}"/>`;
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="주기율표 칸 읽는 법 — 위 숫자는 원자 번호, 가운데는 원소 기호, 아래는 원소 이름">
    <!-- 수소 칸(살구 카드 — 입체감) -->
    <rect x="186" y="34" width="96" height="132" rx="10" fill="#E8C4B0"/>
    <rect x="180" y="28" width="96" height="132" rx="10" fill="#FBDCCB" stroke="#D8A88E" stroke-width="1.6"/>
    <path d="M188 38q30 -6 60 0" stroke="#FFF0E4" stroke-width="3" opacity=".8"/>
    <text x="192" y="52" font-size="16" font-weight="800" fill="#7A4A34">1</text>
    <text x="228" y="112" text-anchor="middle" font-size="46" font-weight="800" fill="#4A2E20" font-family="Georgia, serif">H</text>
    <text x="228" y="146" text-anchor="middle" font-size="15" font-weight="700" fill="#7A4A34">수소</text>
    ${callout(46, "원자 번호", 188, 46, "#C43A2E")}
    ${callout(100, "원소 기호", 204, 100, "#2E5AA8")}
    ${callout(142, "원소 이름", 206, 142, "#0B8A5E")}
    <text x="118" y="66" text-anchor="end" font-size="10" fill="#8B95A1">= 양성자수</text>
    <rect x="20" y="176" width="304" height="26" rx="9" fill="#F7F9FC"/>
    <text x="172" y="193" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">위에서부터 번호 → 기호 → 이름 — 어떤 칸이든 똑같이 읽어요!</text>
  </svg>`;
}

/** L5 개념 — 이온식 쓰는 법: 잃으면 +, 얻으면 −, 숫자는 부호 앞(오른쪽 위) */
export function ionNotationFig(): string {
  const ex = (x: number, y: number, from: string, to: string, sup: string, supColor: string, note: string): string => `
    <text x="${x}" y="${y}" text-anchor="middle" font-size="26" font-weight="800" fill="#8B95A1">${from}</text>
    <path d="M${x + 26} ${y - 8}h22M${x + 42} ${y - 13}l7 5-7 5" stroke="#8B95A1" stroke-width="2" fill="none"/>
    <text x="${x + 74}" y="${y}" text-anchor="middle" font-size="30" font-weight="800" fill="#333D4B">${to}</text>
    <text x="${x + 74 + (to.length > 1 ? 26 : 17)}" y="${y - 16}" font-size="19" font-weight="800" fill="${supColor}">${sup}</text>
    <text x="${x + 40}" y="${y + 22}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#6B7684">${note}</text>`;
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="이온식 쓰는 법 — 전자를 잃으면 +, 얻으면 −를 원소 기호 오른쪽 위에 쓴다">
    <rect x="10" y="10" width="158" height="30" rx="15" fill="#FDEBEA"/>
    <text x="89" y="30" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C43A2E">전자를 잃으면 → 양이온 +</text>
    <rect x="176" y="10" width="158" height="30" rx="15" fill="#E8F1FD"/>
    <text x="255" y="30" text-anchor="middle" font-size="12.5" font-weight="800" fill="#2E5AA8">전자를 얻으면 → 음이온 −</text>
    ${ex(30, 84, "Na", "Na", "+", "#C43A2E", "전자 1개 잃음 (1은 생략)")}
    ${ex(30, 152, "Mg", "Mg", "2+", "#C43A2E", "전자 2개 잃음 → 숫자 먼저!")}
    ${ex(196, 84, "Cl", "Cl", "−", "#2E5AA8", "전자 1개 얻음 · 염화 이온")}
    ${ex(196, 152, "O", "O", "2−", "#2E5AA8", "전자 2개 얻음 · 산화 이온")}
    <rect x="24" y="196" width="296" height="30" rx="10" fill="#F7F9FC"/>
    <text x="172" y="216" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">자리는 언제나 기호의 <tspan font-weight="800">오른쪽 위</tspan> — 아래 숫자(원자 개수)와 헷갈리지 않기!</text>
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
    <text x="32" y="36" text-anchor="middle" font-size="9" font-weight="800" fill="#fff">+5</text>
    <circle cx="10" cy="26" r="5" fill="#5A9AE0"/><circle cx="52" cy="24" r="5" fill="#5A9AE0"/><circle cx="32" cy="13" r="5" fill="#5A9AE0"/><circle cx="16" cy="46" r="5" fill="#5A9AE0"/><circle cx="48" cy="46" r="5" fill="#5A9AE0"/>`,
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
