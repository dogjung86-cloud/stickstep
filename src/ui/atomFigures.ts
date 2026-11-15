// atomFigures — 중2 IV(물질의 구성) 퀴즈·개념 그림 — 손코딩 교육용 SVG(라이트 카드 기준) + recap 미니아트.
// 입자 표현 관례: 원자핵 +N 라벨, 전자(−) 파랑, CPK 색(O 빨강·H 흰색·N 파랑), NaCl은 격자.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

const nucleus = (x: number, y: number, p: number, r = 20): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#E8836B"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.32}" r="${r * 0.32}" fill="#FFC0AE" opacity=".8"/>
   <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#A8442E" stroke-width="1.6"/>
   <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="${r * 0.62}" font-weight="800" fill="#fff">+${p}</text>`;
const electron = (x: number, y: number, r = 7): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#5A9AE0" stroke="#2A5AA0" stroke-width="1.4"/><line x1="${x - r * 0.45}" y1="${y}" x2="${x + r * 0.45}" y2="${y}" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;

/** 옅은 파란 구름(밝은 카드용). 그라데이션 id 없이 반지름이 조금씩 작은 원을 겹쳐 가운데로 갈수록 진하게 한다
 *  (같은 그림이 화면 여러 곳에 놓여도 id가 겹치지 않게. 겹이 촘촘해 고리 무늬로 보이지 않는다). 가장자리 한 겹은 조금 진하게 해 원자의 크기가 보인다. */
function cloudLight(cx: number, cy: number, R: number, layers = 24, edge = 0.24, step = 0.05): string {
  let out = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#9FD5F4" fill-opacity="${edge}"/>`;
  for (let i = 1; i < layers; i++) out += `<circle cx="${cx}" cy="${cy}" r="${(R * (1 - i / layers)).toFixed(1)}" fill="#9FD5F4" fill-opacity="${step}"/>`;
  return out;
}
/** 구름 안 전자 자리(해바라기 배치: 넓이가 고르게, 고리 없이). 랩의 구름 모형(steps/g2u4v5/kit의 cloudSpots)과 같은 배치. */
function cloudSpots(cx: number, cy: number, n: number, rIn: number, rOut: number, phase: number): [number, number][] {
  const gold = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const r = Math.sqrt(rIn * rIn + (rOut * rOut - rIn * rIn) * ((i + 0.5) / n));
    const a = phase + i * gold;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

/** 원자 모형(+p 핵, e개 전자, 파라미터형): 책과 같은 구름 모형. 옅은 파란 구름 가운데 원자핵, 전자는 궤도선 없이 구름 안에 고르게. 원자 구조 판독 문제용 */
export function atomModelFig(p: number, e: number): string {
  // aria는 중립: 핵 라벨 값·전자 수가 곧 문항의 판독 과제라 수치를 말하지 않는다(시험 aria 유출 규칙 소급).
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="원자 모형, 가운데 원자핵에 전하 라벨이 적혀 있고, 둘레의 옅은 파란 구름 속에 전자 알갱이들이 흩어져 있어요. 라벨 값과 알갱이 수를 살펴보세요">
    ${cloudLight(172, 85, 76)}
    ${nucleus(172, 85, p, 22)}
    ${cloudSpots(172, 85, e, 36, 64, -0.6).map(([x, y]) => electron(x, y)).join("")}
  </svg>`;
}

/** 주기율표 일부: 1주기(H·He)·2주기(Be·O·Ne)·3주기(Na), 족·주기 성질 판독 문제용.
 *  족 머리(파란 띠)와 주기 머리(초록 띠)를 색 띠로, 3~12족이 빠진 자리는 물결 끊김으로. 폰에서 원자 번호와 머리 글자가 12px 넘게 보이게(화면 배율 약 0.94). */
export function miniTableFig(): string {
  const GX = [40, 76.5, 125.5, 162, 198.5, 235, 271.5, 308]; // 1, 2, 13~18족 칸의 왼쪽
  const W = 34.5;
  const H = 44;
  const rowY = (r: number): number => 34 + r * 48;
  const empty = GX.flatMap((x) => [0, 1, 2].map((r) => `<rect x="${x}" y="${rowY(r)}" width="${W}" height="${H}" rx="5" fill="#F6F8FA" stroke="#E3E7EC" stroke-width="1"/>`)).join("");
  const cell = (col: number, row: number, z: number, sym: string): string => {
    const x = GX[col];
    const y = rowY(row);
    return `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="5" fill="#FFFFFF" stroke="#8E9AAB" stroke-width="1.5"/>
      <text x="${x + 4}" y="${y + 14}" font-size="13" font-weight="700" fill="#4E5968">${z}</text>
      <text x="${x + W / 2}" y="${y + 36}" text-anchor="middle" font-size="18" font-weight="800" fill="#262F3D">${sym}</text>`;
  };
  const wave = Array.from({ length: 15 }, (_, i) => `q${i % 2 ? -4 : 4} 6 0 12`).join(" ");
  return `<svg viewBox="0 0 344 182" ${NS} fill="none" role="img" aria-label="주기율표 일부, 1주기 수소 헬륨, 2주기 베릴륨 산소 네온, 3주기 나트륨">
    <rect x="38" y="4" width="304" height="26" rx="6" fill="#DCEAFB"/>
    <rect x="4" y="32" width="32" height="146" rx="6" fill="#DFF2E5"/>
    <rect x="4" y="4" width="32" height="26" rx="6" fill="#EEF1F5"/><path d="M6 6 L34 28" stroke="#B9C1CC" stroke-width="1"/>
    <text x="34" y="16" text-anchor="end" font-size="12.5" font-weight="700" fill="#2E5AA8">족</text>
    <text x="6" y="28" font-size="12.5" font-weight="700" fill="#2B7A45">주기</text>
    ${["1", "2", "13", "14", "15", "16", "17", "18"].map((g, i) => `<text x="${GX[i] + W / 2}" y="22" text-anchor="middle" font-size="13.5" font-weight="800" fill="#2E5AA8">${g}</text>`).join("")}
    ${[1, 2, 3].map((n, r) => `<text x="20" y="${rowY(r) + 27}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#2B7A45">${n}</text>`).join("")}
    ${empty}
    <rect x="112" y="2" width="12" height="178" fill="#FFFFFF"/>
    <path d="M116 2 ${wave}" stroke="#8B95A1" stroke-width="1.4"/><path d="M121 2 ${wave}" stroke="#8B95A1" stroke-width="1.4"/>
    ${cell(0, 0, 1, "H")}${cell(7, 0, 2, "He")}
    ${cell(1, 1, 4, "Be")}${cell(5, 1, 8, "O")}${cell(7, 1, 10, "Ne")}
    ${cell(0, 2, 11, "Na")}
  </svg>`;
}

/** 4가지 물질의 입자 모형: 산소 분자·물 분자(굽은형, 결합 각 104.5°)·철 원자 배열·NaCl 이온 격자(원자/분자/이온 구분 문제용).
 *  아래 이름표는 알갱이 묶음과 떨어지게 두고 흰 테를 두른다(염화 나트륨 이름표가 맨 아래 줄 염화 이온에 닿아 가리던 것을 고쳤다). */
export function fourModelFig(): string {
  const ball = (x: number, y: number, r: number, fill: string, line: string, label = ""): string =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${line}" stroke-width="1.4"/>${label ? `<text x="${x}" y="${y + 3.5}" text-anchor="middle" font-size="${r * 0.9}" font-weight="800" fill="#333D4B">${label}</text>` : ""}`;
  const H = (x: number, y: number, r = 9): string => ball(x, y, r, "#F4F7FB", "#9AA5B4");
  const O = (x: number, y: number, r = 12): string => ball(x, y, r, "#E8695A", "#A8342A");
  const fe = (x: number, y: number): string => ball(x, y, 10, "#A87858", "#6B4630");
  const na = (x: number, y: number): string => ball(x, y, 7.5, "#C0A2E8", "#7A54B0");
  const cl = (x: number, y: number): string => ball(x, y, 12, "#8ED0A0", "#3E8A54");
  // aria는 중립 — 입자 종류(분자/원자/이온) 판정이 곧 문항의 과제라 종류를 말하지 않는다(시험 aria 유출 규칙 소급).
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="산소, 물, 철, 염화 나트륨 네 가지 물질의 입자 모형, 각 모형에서 알갱이들이 어떻게 배열되어 있는지 살펴보세요">
    <g><line x1="66" y1="52" x2="94" y2="52" stroke="#9AA5B4" stroke-width="4"/>${O(60, 52)}${O(100, 52)}
      <text x="80" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">산소</text></g>
    <g><line x1="252" y1="44" x2="222.8" y2="66.6" stroke="#9AA5B4" stroke-width="4"/><line x1="252" y1="44" x2="281.2" y2="66.6" stroke="#9AA5B4" stroke-width="4"/>
      ${H(222.8, 66.6, 8)}${H(281.2, 66.6, 8)}${O(252, 44, 12)}
      <text x="252" y="96" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">물</text></g>
    <g>${[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => fe(44 + c * 24 + (r % 2) * 12, 120 + r * 21))).join("")}
      <text x="80" y="202" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968" stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke">철</text></g>
    <g>${[0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => ((r + c) % 2 ? na(216 + c * 26, 122 + r * 24) : cl(216 + c * 26, 122 + r * 24)))).join("")}
      <text x="255" y="202" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968" stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke">염화 나트륨</text></g>
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
    <circle cx="47" cy="34" r="10" fill="#F0685A"/><text x="47" y="38.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">+</text>
    <circle cx="297" cy="34" r="10" fill="#5A88D8"/><text x="297" y="38.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">−</text>
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
    <text x="226" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8B95A1">산소 원자 1개, 1은 생략!</text>
  </svg>`;
}

/** L4 개념 — 주기율표 칸 읽는 법(교과서 그림 IV-6의 수소 칸 해부도) */
export function cellAnatomyFig(): string {
  const callout = (y: number, label: string, tx: number, ty: number, color: string): string => `
    <text x="118" y="${y + 4}" text-anchor="end" font-size="13" font-weight="800" fill="${color}">${label}</text>
    <line x1="126" y1="${y}" x2="${tx}" y2="${ty}" stroke="${color}" stroke-width="1.6"/>
    <circle cx="${tx}" cy="${ty}" r="2.6" fill="${color}"/>`;
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="주기율표 칸 읽는 법, 위 숫자는 원자 번호, 가운데는 원소 기호, 아래는 원소 이름">
    <!-- 수소 칸(살구 카드, 입체감) -->
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
    <text x="172" y="193" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">위에서부터 번호 → 기호 → 이름, 어떤 칸이든 똑같이 읽어요!</text>
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
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="이온식 쓰는 법, 전자를 잃으면 +, 얻으면 −를 원소 기호 오른쪽 위에 쓴다">
    <rect x="10" y="10" width="158" height="30" rx="15" fill="#FDEBEA"/>
    <text x="89" y="30" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C43A2E">전자를 잃으면 → 양이온 +</text>
    <rect x="176" y="10" width="158" height="30" rx="15" fill="#E8F1FD"/>
    <text x="255" y="30" text-anchor="middle" font-size="12.5" font-weight="800" fill="#2E5AA8">전자를 얻으면 → 음이온 −</text>
    ${ex(30, 84, "Na", "Na", "+", "#C43A2E", "전자 1개 잃음 (1은 생략)")}
    ${ex(30, 152, "Mg", "Mg", "2+", "#C43A2E", "전자 2개 잃음 → 숫자 먼저!")}
    ${ex(196, 84, "Cl", "Cl", "−", "#2E5AA8", "전자 1개 얻음 · 염화 이온")}
    ${ex(196, 152, "O", "O", "2−", "#2E5AA8", "전자 2개 얻음 · 산화 이온")}
    <rect x="24" y="196" width="296" height="30" rx="10" fill="#F7F9FC"/>
    <text x="172" y="216" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">자리는 언제나 기호의 <tspan font-weight="800">오른쪽 위</tspan>, 아래 숫자(원자 개수)와 헷갈리지 않기!</text>
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
// 정리 카드의 아트는 32px로 줄어 보인다(배율 0.5). 글자는 쓰지 않고 도상으로, 기호만 크게.

/** 원자핵 알갱이 묶음(미니): 양성자(빨강)와 중성자(회색)를 번갈아 육각으로 쌓는다. */
function miniCore(cx: number, cy: number, p: number, n: number, br: number): string {
  const kinds: boolean[] = [];
  for (let lp = p, ln = n; lp + ln > 0; ) {
    if (lp > 0 && (kinds.length % 2 === 0 || ln === 0)) {
      kinds.push(true);
      lp -= 1;
    } else {
      kinds.push(false);
      ln -= 1;
    }
  }
  const pts: [number, number][] = [];
  for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) pts.push([i + j / 2, (j * Math.sqrt(3)) / 2]);
  pts.sort((a, b) => Math.round(Math.hypot(a[0], a[1]) * 1000) - Math.round(Math.hypot(b[0], b[1]) * 1000) || Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]));
  const d = br * 1.8;
  const use = pts.slice(0, kinds.length);
  const mx = use.reduce((s, q) => s + q[0], 0) / use.length;
  const my = use.reduce((s, q) => s + q[1], 0) / use.length;
  let out = "";
  for (let i = use.length - 1; i >= 0; i--) {
    const x = (cx + (use[i][0] - mx) * d).toFixed(1);
    const y = (cy + (use[i][1] - my) * d).toFixed(1);
    out += `<circle cx="${x}" cy="${y}" r="${br}" fill="${kinds[i] ? "#E8735A" : "#A7B1C0"}" stroke="${kinds[i] ? "#A8442E" : "#66728A"}" stroke-width=".9"/>`;
  }
  return out;
}
const miniCloud = (cx: number, cy: number, R: number): string => cloudLight(cx, cy, R, 10, 0.36, 0.08);
const miniElectron = (x: number, y: number): string =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="#3F86E6" stroke="#245FB8" stroke-width="1"/><path d="M${(x - 2.3).toFixed(1)} ${y.toFixed(1)}h4.6" stroke="#fff" stroke-width="1.5"/>`;

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
  // 원자핵과 전자: 책의 구름 모형(옅은 파란 구름 가운데 + 원자핵, 구름 안에 (−) 전자). 궤도선과 숫자 글자 없이.
  atomCore: `${miniCloud(32, 32, 29)}
    <circle cx="32" cy="32" r="7.5" fill="#E8836B" stroke="#A8442E" stroke-width="1.2"/><path d="M28.4 32h7.2M32 28.4v7.2" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/>
    ${cloudSpots(32, 32, 4, 15, 22.5, -2.1).map(([x, y]) => miniElectron(x, y)).join("")}`,
  // 양성자수가 정하는 것: 알갱이 수가 다른 원자핵 둘(위 양성자 6, 아래 8)과 그 옆의 원소 기호 C, O를 크게.
  protonKey: `${miniCore(16, 16, 6, 6, 3.4)}${miniCore(16, 48, 8, 8, 3.4)}
    <text x="47" y="26" text-anchor="middle" font-size="28" font-weight="800" fill="#333D4B">C</text>
    <text x="47" y="58" text-anchor="middle" font-size="28" font-weight="800" fill="#333D4B">O</text>`,
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
  // 이온은 반대 전하의 극으로: 띠 양 끝에 랩과 같은 좌우의 극 칩(왼쪽 (−), 오른쪽 (+)), (+) 표시를 크게 단 양이온이 (−)극 쪽으로.
  moveMini: `<path d="M10 25v6M54 25v6" stroke="#8B95A1" stroke-width="1.6"/>
    <rect x="5" y="30" width="54" height="15" rx="4" fill="#EEF2F7" stroke="#B0B8C1" stroke-width="1.4"/>
    <circle cx="10" cy="17" r="8" fill="#4A7FD6"/><path d="M6.2 17h7.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="54" cy="17" r="8" fill="#E8604F"/><path d="M50.2 17h7.6M54 13.2v7.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M31 37.5H15.5M20 33l-4.5 4.5 4.5 4.5" stroke="#4A7FD6" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="42" cy="37.5" r="9" fill="#FFFFFF" stroke="#E8604F" stroke-width="2.2"/><path d="M37.2 37.5h9.6M42 32.7v9.6" stroke="#E8604F" stroke-width="2.6" stroke-linecap="round"/>`,
  // 색으로 이온을 따라가는 실험: 띠 하나에서 파란 얼룩과 보라 얼룩이 서로 반대쪽으로 번진다(가운데 점선은 떨어뜨린 자리).
  colorTrack: `<rect x="4" y="25" width="56" height="18" rx="4" fill="#EEF2F7" stroke="#B0B8C1" stroke-width="1.4"/>
    <circle cx="32" cy="34" r="4" fill="none" stroke="#9AA5B4" stroke-width="1.2" stroke-dasharray="2 2"/>
    <ellipse cx="17" cy="34" rx="10" ry="6.5" fill="#2F7BE8" opacity=".85"/><ellipse cx="47" cy="34" rx="10" ry="6.5" fill="#8E3FD0" opacity=".85"/>
    <path d="M24 16H10M14 12l-4 4 4 4" stroke="#2F7BE8" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M40 16h14M50 12l4 4-4 4" stroke="#8E3FD0" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
};

export function atomMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
