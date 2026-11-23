// 중2 II 단원(지권의 변화) 퀴즈·개념 그림, 손코딩 교육용 SVG. 라이트(흰 카드) 기준.
// 정답을 유출하는 라벨은 절대 그리지 않는다, 빈칸은 (가)~(라)로만.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 지구 내부 단면 4분원, 두께 비례(지각 0~35 / 맨틀 ~2900 / 외핵 ~5100 / 내핵 ~6400 km).
 *  층 이름은 쓰지 않고 (가)~(라)만. (가)=지각(테두리 얇은 띠),
 *  (나)=맨틀, (다)=외핵, (라)=내핵 자리. */
export function earthLayersFig(): string {
  const cx = 47; // 왼쪽 깊이 숫자(13.5px)가 그림 밖으로 잘리지 않게 조금 오른쪽으로
  const cy = 192;
  const R = 168;
  const rOf = (depth: number): number => R * (1 - depth / 6400);
  const ring = (r0: number, r1: number, fill: string, stroke: string): string =>
    `<path d="M${cx} ${cy - r1} A${r1} ${r1} 0 0 1 ${cx + r1} ${cy} L${cx + r0} ${cy} A${r0} ${r0} 0 0 0 ${cx} ${cy - r0} Z" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
  const rMantle = rOf(35);
  const rOuter = rOf(2900);
  const rInner = rOf(5100);
  // 아래 눈금: 각 층이 수평 변과 만나는 x 자리 = cx + r
  const tick = (r: number, label: string): string =>
    `<line x1="${cx + r}" y1="${cy}" x2="${cx + r}" y2="${cy + 8}" stroke="#B0B8C1" stroke-width="1.4"/>
     <text x="${cx + r}" y="${cy + 22}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 224" ${NS} fill="none" role="img" aria-label="지구 내부 단면 사분원. 겉에서부터 가, 나, 다, 라 네 층이 있고 깊이 눈금은 0, 35, 2900, 5100, 6400 킬로미터예요">
    ${ring(rOuter, rMantle, "#F29A66", "#C4602E")}
    ${ring(rInner, rOuter, "#FFC85E", "#D99A1E")}
    <path d="M${cx} ${cy} L${cx} ${cy - rInner} A${rInner} ${rInner} 0 0 1 ${cx + rInner} ${cy} Z" fill="#FFE9A8" stroke="#E8B54A" stroke-width="1.2"/>
    <!-- (가) 지각: 실제 비례로는 선 굵기 수준의 얇은 껍질 -->
    <path d="M${cx} ${cy - R} A${R} ${R} 0 0 1 ${cx + R} ${cy}" stroke="#7A5C3E" stroke-width="3"/>
    <path d="M${cx} ${cy - R} L${cx} ${cy} L${cx + R} ${cy}" stroke="#8B95A1" stroke-width="1.4"/>
    <!-- 세로 절단면의 깊이 라벨(고체와 액체의 경계를 읽는 근거라 폰에서 12px 이상: 설계 13.5) -->
    <text x="${cx - 7}" y="${cy - R + 5}" text-anchor="end" font-size="13.5" font-weight="600" fill="#6B7684">0</text>
    <line x1="${cx - 4}" y1="${cy - rMantle + 7}" x2="${cx + 14}" y2="${cy - rMantle + 15}" stroke="#C4CAD2" stroke-width="1.2"/>
    <text x="${cx - 7}" y="${cy - rMantle + 19}" text-anchor="end" font-size="13.5" font-weight="600" fill="#6B7684">35</text>
    <text x="${cx - 7}" y="${cy - rOuter + 5}" text-anchor="end" font-size="13.5" font-weight="600" fill="#6B7684">2900</text>
    <text x="${cx - 7}" y="${cy - rInner + 5}" text-anchor="end" font-size="13.5" font-weight="600" fill="#6B7684">5100</text>
    <text x="${cx - 7}" y="${cy + 5}" text-anchor="end" font-size="13.5" font-weight="600" fill="#6B7684">6400</text>
    <text x="0" y="12" font-size="13.5" font-weight="600" fill="#4E5968">깊이(km)</text>
    <!-- (가)~(라) 눈금(수평 변 아래) -->
    ${tick((R + rMantle) / 2, "(가)")}
    ${tick((rMantle + rOuter) / 2, "(나)")}
    ${tick((rOuter + rInner) / 2, "(다)")}
    ${tick(rInner / 2, "(라)")}
    <!-- 지표 장식(호 위, 깊이 제목과 겹치지 않게 오른쪽으로) -->
    <path d="M${cx + 26} ${cy - R - 2} q5 -7 10 0 M${cx + 46} ${cy - R + 2} q4 -6 8 0" stroke="#0CA678" stroke-width="1.6"/>
  </svg>`;
}

/** 화성암 2×2 분류표, x축 색(어둡다↔밝다), y축 결정 크기(작다↔크다), 빈칸 (가)~(라).
 *  (가)=어둡다·크다(반려암), (나)=밝다·크다(화강암), (다)=어둡다·작다(현무암), (라)=밝다·작다(유문암) 자리. */
export function igneousGridFig(o: { lab?: boolean } = {}): string {
  if (o.lab) return igneousTableFig();
  const cell = (x: number, y: number, label: string): string =>
    `<rect x="${x}" y="${y}" width="116" height="62" rx="10" fill="#F8FAFC" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 4"/>
     <text x="${x + 58}" y="${y + 37}" text-anchor="middle" font-size="15" font-weight="800" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="화성암 분류표. 가로축은 암석의 색이 어둡다에서 밝다로, 세로축은 결정 크기가 작다에서 크다로 변하고 네 칸은 가, 나, 다, 라 빈칸이에요">
    <!-- 세로축(결정 크기) -->
    <line x1="62" y1="168" x2="62" y2="26" stroke="#8B95A1" stroke-width="1.6"/>
    <path d="M62 26 l-4 8 h8 z" fill="#8B95A1"/>
    <text x="20" y="14" font-size="10.5" fill="#4E5968">결정 크기</text>
    <text x="54" y="40" text-anchor="end" font-size="10.5" font-weight="700" fill="#8B95A1">크다</text>
    <text x="54" y="162" text-anchor="end" font-size="10.5" font-weight="700" fill="#8B95A1">작다</text>
    <!-- 가로축(암석의 색) -->
    <line x1="62" y1="168" x2="326" y2="168" stroke="#8B95A1" stroke-width="1.6"/>
    <path d="M326 168 l-8 -4 v8 z" fill="#8B95A1"/>
    <text x="128" y="186" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8B95A1">어둡다</text>
    <text x="262" y="186" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8B95A1">밝다</text>
    <text x="326" y="204" text-anchor="end" font-size="10.5" fill="#4E5968">암석의 색</text>
    <!-- 2×2 칸: 위 줄 = 결정 크다, 아래 줄 = 결정 작다 -->
    ${cell(70, 30, "(가)")}
    ${cell(204, 30, "(나)")}
    ${cell(70, 100, "(다)")}
    ${cell(204, 100, "(라)")}
  </svg>`;
}

/** 레슨 문제용 화성암 분류표: 바로 앞 분류표 랩의 표와 같은 배치(위 줄 = 결정이 작다, 아래 줄 = 결정이 크다,
 *  왼쪽 = 색이 어둡다, 오른쪽 = 색이 밝다). (가)=어둡고 작다(현무암), (나)=밝고 작다(유문암), (다)=어둡고 크다(반려암), (라)=밝고 크다(화강암).
 *  시험 문항은 위의 igneousGridFig() 축 그림(위가 크다)을 그대로 쓴다(정답 짝이 그 배치에 묶여 있다). */
function igneousTableFig(): string {
  const CX = [88, 214], CY = [34, 106], CW = 118, CH = 64;
  const cell = (x: number, y: number, label: string): string =>
    `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="12" fill="#F8FAFC" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 4"/>
     <text x="${x + CW / 2}" y="${y + CH / 2 + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#4E5968">${label}</text>`;
  const head = (x: number, y: number, t: string, anchor = "middle"): string =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="13.5" font-weight="700" fill="#4E5968">${t}</text>`;
  return `<svg viewBox="0 0 344 180" ${NS} fill="none" role="img" aria-label="화성암 분류표. 열은 왼쪽이 색이 어둡다, 오른쪽이 색이 밝다이고, 줄은 위가 결정이 작다, 아래가 결정이 크다예요. 네 칸은 가, 나, 다, 라 빈칸이에요">
    ${head(CX[0] + CW / 2, 22, "색이 어둡다")}${head(CX[1] + CW / 2, 22, "색이 밝다")}
    ${head(44, CY[0] + CH / 2 - 3, "결정이")}${head(44, CY[0] + CH / 2 + 14, "작다")}
    ${head(44, CY[1] + CH / 2 - 3, "결정이")}${head(44, CY[1] + CH / 2 + 14, "크다")}
    ${cell(CX[0], CY[0], "(가)")}${cell(CX[1], CY[0], "(나)")}
    ${cell(CX[0], CY[1], "(다)")}${cell(CX[1], CY[1], "(라)")}
  </svg>`;
}

/** 광물 네 가지 A~D를 겉보기 색, 조흔색, 클립, 묽은 염산으로 시험한 결과 표(L2 문제용). 이름은 쓰지 않는다.
 *  A = 자철석, B = 장석, C = 흑운모, D = 방해석 자리(문항 선지와 반드시 맞출 것). */
export function mineralTestFig(): string {
  const head = ["광물", "겉보기 색", "조흔색", "클립", "묽은 염산"];
  const rows = [
    ["A", "검은색", "검은색", "붙는다", "변화 없음"],
    ["B", "흰색", "흰색", "안 붙는다", "변화 없음"],
    ["C", "검은색", "흰색", "안 붙는다", "변화 없음"],
    ["D", "무색투명", "흰색", "안 붙는다", "거품"],
  ];
  const X0 = 8, W0 = 44, CW = 71, RH = 33, TOP = 8;
  const colX = (c: number): number => (c === 0 ? X0 : X0 + W0 + (c - 1) * CW);
  const colW = (c: number): number => (c === 0 ? W0 : CW);
  let cells = `<rect x="${X0}" y="${TOP}" width="${W0 + CW * 4}" height="${RH}" fill="#F2F4F7"/>`;
  rows.forEach((_, i) => { cells += `<rect x="${X0}" y="${TOP + RH * (i + 1)}" width="${W0}" height="${RH}" fill="#F7F8FA"/>`; });
  head.forEach((h, c) => {
    cells += `<text x="${colX(c) + colW(c) / 2}" y="${TOP + RH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${h}</text>`;
  });
  rows.forEach((r, i) => r.forEach((v, c) => {
    cells += `<text x="${colX(c) + colW(c) / 2}" y="${TOP + RH * (i + 1) + RH / 2 + 4.5}" text-anchor="middle" font-size="13" font-weight="${c === 0 ? 800 : 600}" fill="#333D4B">${v}</text>`;
  }));
  let grid = "";
  for (let i = 0; i <= rows.length + 1; i++) grid += `<line x1="${X0}" y1="${TOP + RH * i}" x2="${X0 + W0 + CW * 4}" y2="${TOP + RH * i}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  for (let c = 0; c <= head.length; c++) {
    const x = c === head.length ? X0 + W0 + CW * 4 : colX(c);
    grid += `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${TOP + RH * (rows.length + 1)}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  }
  return `<svg viewBox="0 0 344 ${TOP * 2 + RH * (rows.length + 1)}" ${NS} fill="none" role="img" aria-label="광물 A, B, C, D의 겉보기 색, 조흔색, 클립이 붙는지, 묽은 염산에서 거품이 생기는지를 정리한 표. 광물 이름은 적혀 있지 않다">${cells}${grid}</svg>`;
}

/** 토양 단면 4층, 층 이름·설명 없이 (가)~(라)만. 위에서부터
 *  (가)=식물이 자랄 수 있는 층, (나)=빗물에 녹은 물질·진흙이 쌓인 층,
 *  (다)=암석 조각·모래 층, (라)=풍화받지 않은 암석 자리. */
export function soilLayersFig(): string {
  const lead = (y: number, label: string): string =>
    `<line x1="252" y1="${y}" x2="278" y2="${y}" stroke="#C4CAD2" stroke-width="1.4"/>
     <text x="286" y="${y + 5}" font-size="14" font-weight="800" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="토양 단면. 맨 위 풀이 자란 어두운 층, 그 아래 고운 흙 층, 암석 조각과 모래 층, 맨 아래 통짜 암석 층이 있고 위에서부터 가, 나, 다, 라예요">
    <!-- (가) 풀 + 어두운 겉흙 -->
    <rect x="70" y="24" width="180" height="40" fill="#6E4E2E"/>
    <g fill="#4E3820">
      <circle cx="92" cy="38" r="1.6"/><circle cx="130" cy="46" r="1.4"/><circle cx="172" cy="36" r="1.7"/><circle cx="214" cy="48" r="1.4"/><circle cx="112" cy="56" r="1.3"/><circle cx="196" cy="58" r="1.5"/>
    </g>
    <path d="M84 24q3-9 6 0M100 24q3-9 6 0M132 24q3-9 6 0M164 24q3-9 6 0M196 24q3-9 6 0M228 24q3-9 6 0" stroke="#3F9B4F" stroke-width="2"/>
    <path d="M96 30q-4 8 2 14M170 28q4 8-2 16M226 30q-3 9 2 15" stroke="#8A6844" stroke-width="1.3"/>
    <!-- (나) 고운 흙(진흙) -->
    <rect x="70" y="64" width="180" height="44" fill="#A97C4F"/>
    <g fill="#8E6238">
      <circle cx="96" cy="80" r="1.2"/><circle cx="142" cy="90" r="1.3"/><circle cx="188" cy="78" r="1.2"/><circle cx="226" cy="94" r="1.3"/><circle cx="118" cy="100" r="1.1"/>
    </g>
    <!-- (다) 암석 조각 + 모래 -->
    <rect x="70" y="108" width="180" height="44" fill="#C9A26A"/>
    <g fill="#9A7846" stroke="#7E5E30" stroke-width="1">
      <path d="M88 122 l12 -6 8 8 -10 8 z"/><path d="M130 134 l10 -8 10 6 -8 9 z"/>
      <path d="M176 118 l11 -5 7 8 -11 7 z"/><path d="M214 132 l10 -7 9 7 -9 8 z"/>
    </g>
    <g fill="#B08D52"><circle cx="112" cy="142" r="1.6"/><circle cx="160" cy="120" r="1.5"/><circle cx="204" cy="146" r="1.6"/></g>
    <!-- (라) 기반암(통짜) -->
    <rect x="70" y="152" width="180" height="44" fill="#8B95A1"/>
    <path d="M70 168 q34 -6 62 2 t62 -2 56 2 M104 152 v44 M186 152 v44" stroke="#6E7888" stroke-width="1.4" opacity=".7"/>
    <!-- 테두리 + 리드선 -->
    <rect x="70" y="24" width="180" height="172" rx="2" stroke="#5E5040" stroke-width="1.8"/>
    ${lead(44, "(가)")}
    ${lead(86, "(나)")}
    ${lead(130, "(다)")}
    ${lead(174, "(라)")}
  </svg>`;
}

/** 판의 구조 단면, 대륙 지각 + 해양 지각 + 맨틀의 윗부분 = 판(두께 약 100 km). */
export function plateSectionFig(): string {
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="판의 구조 단면. 왼쪽 대륙 지각과 오른쪽 해양 지각, 그 아래 맨틀의 윗부분까지가 판이고, 더 아래는 맨틀이 이어져요">
    <!-- 바다(오른쪽 위) -->
    <path d="M188 40 h132 v26 h-132 z" fill="#BFE0F8"/>
    <path d="M196 46 q10 4 20 0 M250 52 q10 4 20 0" stroke="#8FBBF2" stroke-width="1.6"/>
    <!-- 대륙 지각(왼쪽, 두껍고 뿌리가 깊다) -->
    <path d="M24 40 h164 v26 l-14 0 q-6 42 -34 46 q-40 6 -84 0 q-26 -4 -32 -40 z" fill="#C9A26A" stroke="#8E6A34" stroke-width="1.6"/>
    <path d="M34 48 q30 -6 60 0" stroke="#E8CB9C" stroke-width="3" opacity=".8"/>
    <path d="M52 40 q4 -8 10 0 M96 40 q4 -8 10 0" stroke="#3F9B4F" stroke-width="1.8"/>
    <!-- 해양 지각(오른쪽, 얇다) -->
    <path d="M174 66 h146 v20 h-146 z" fill="#8B7355" stroke="#5E4A30" stroke-width="1.5"/>
    <!-- 맨틀의 윗부분(판에 포함, 딱딱한 부분) -->
    <path d="M24 72 q6 36 32 40 q44 6 84 0 q28 -4 34 -46 l146 20 v64 h-296 z" fill="#F29A66" stroke="#C4602E" stroke-width="1.4"/>
    <!-- 판의 아랫면(약 100 km) -->
    <line x1="24" y1="150" x2="320" y2="150" stroke="#7E3A14" stroke-width="2.2" stroke-dasharray="8 6"/>
    <!-- 그 아래 맨틀(물렁하게 움직이는 부분) -->
    <rect x="24" y="150" width="296" height="46" fill="#E07038" opacity=".85"/>
    <path d="M48 172 q14 -8 28 0 M120 178 q14 -8 28 0 M210 170 q14 -8 28 0 M280 180 q12 -7 24 0" stroke="#FFB98C" stroke-width="2" opacity=".8"/>
    <rect x="24" y="40" width="296" height="156" stroke="#4E4432" stroke-width="1.6"/>
    <!-- 라벨 -->
    <text x="70" y="28" font-size="11.5" font-weight="800" fill="#8E6A34">대륙 지각</text>
    <path d="M96 32 v10" stroke="#C4CAD2" stroke-width="1.3"/>
    <text x="236" y="28" font-size="11.5" font-weight="800" fill="#5E4A30">해양 지각</text>
    <path d="M260 32 v38" stroke="#C4CAD2" stroke-width="1.3"/>
    <text x="120" y="132" font-size="11.5" font-weight="800" fill="#8E3E10">맨틀의 윗부분</text>
    <text x="176" y="188" font-size="11.5" font-weight="700" fill="#FFF0E4">맨틀(천천히 움직임)</text>
    <!-- 판 브레이스(왼쪽) -->
    <path d="M16 40 q-8 2 -8 12 v34 q0 8 -6 10 q6 2 6 10 v34 q0 8 8 10" stroke="#4E5968" stroke-width="1.8"/>
    <text x="10" y="112" text-anchor="end" font-size="12.5" font-weight="800" fill="#191F28" transform="rotate(-90 10 112)">판 (약 100 km)</text>
    <!-- 깊이 눈금(오른쪽) -->
    <line x1="326" y1="40" x2="326" y2="196" stroke="#B0B8C1" stroke-width="1.4"/>
    <line x1="322" y1="40" x2="330" y2="40" stroke="#B0B8C1" stroke-width="1.4"/>
    <line x1="322" y1="150" x2="330" y2="150" stroke="#B0B8C1" stroke-width="1.4"/>
    <text x="336" y="44" font-size="9.5" fill="#8B95A1">0</text>
    <text x="336" y="154" font-size="9.5" fill="#8B95A1">100</text>
    <text x="336" y="208" font-size="9.5" fill="#8B95A1">km</text>
  </svg>`;
}

/** 암석 순환 다이어그램, 마그마·화성암·퇴적물·퇴적암·변성암 + 과정 화살표. recap·문제용. */
export function rockCycleFig(): string {
  const node = (cx: number, cy: number, name: string, bg: string, line: string, ink: string): string =>
    `<rect x="${cx - 42}" y="${cy - 17}" width="84" height="34" rx="17" fill="${bg}" stroke="${line}" stroke-width="1.5"/>
     <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="${ink}">${name}</text>`;
  const arrow = (d: string, tip: [number, number, number]): string =>
    `<path d="${d}" stroke="#8B95A1" stroke-width="1.9" fill="none"/>
     <path d="M${tip[0]} ${tip[1]} l-8 -3 l2 8 z" fill="#8B95A1" transform="rotate(${tip[2]} ${tip[0]} ${tip[1]})"/>`;
  const lbl = (x: number, y: number, t: string): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#6B7684">${t}</text>`;
  return `<svg viewBox="0 0 344 250" ${NS} fill="none" role="img" aria-label="암석의 순환. 마그마가 식어서 굳어지면 화성암, 암석이 잘게 부서지면 퇴적물, 퇴적물이 다져지고 굳어지면 퇴적암, 열과 압력을 받으면 변성암, 변성암이 녹으면 다시 마그마가 됩니다">
    ${arrow("M76 190 C56 160 48 148 46 134", [46, 134, -14])}
    ${lbl(30, 168, "식어서")}${lbl(30, 181, "굳어짐")}
    ${arrow("M58 92 C70 68 94 52 126 44", [126, 44, 68])}
    ${lbl(74, 50, "잘게 부서짐")}
    ${arrow("M218 44 C250 52 274 68 286 92", [286, 92, 148])}
    ${lbl(276, 46, "다져지고")}${lbl(276, 59, "굳어짐")}
    ${arrow("M298 134 C296 148 288 160 268 190", [268, 190, 205])}
    ${lbl(316, 168, "열과")}${lbl(316, 181, "압력")}
    ${arrow("M202 214 L144 214", [144, 214, 0])}
    ${lbl(173, 232, "녹음")}
    ${node(100, 214, "마그마", "#FFE3E0", "#F25C54", "#C0362E")}
    ${node(46, 110, "화성암", "#FDE7EE", "#E64980", "#B03668")}
    ${node(172, 36, "퇴적물", "#F2F4F6", "#8B95A1", "#4E5968")}
    ${node(298, 110, "퇴적암", "#FFF4E6", "#C9A26A", "#8E6A34")}
    ${node(244, 214, "변성암", "#E6FCF5", "#12B886", "#087F5B")}
  </svg>`;
}

/** 대륙 이동 4단계 지도: 순서를 섞어 (가)~(라)로 배치(순서 맞추기 문제).
 *  정답 순서: (나) 판게아 → (라) 분리 시작 → (가) 이동 → (다) 현재.
 *  칸마다 앱에 있는 옛 지도(PALEOMAP, C.R. Scotese, public/geo/maps의 640px 사본)를 잘라 넣는다:
 *  (나) 약 2억 8천만 년 전, (라) 약 1억 5천만 년 전, (가) 약 6천6백만 년 전, (다) 현재. 칸 안에 연도는 쓰지 않는다(답이 드러난다). */
const MAP_BASE = (import.meta as unknown as { env: { BASE_URL?: string } }).env?.BASE_URL || "/";
export function driftStagesFig(): string {
  const uid = Math.random().toString(36).slice(2, 8);
  const map = (i: number, x: number, y: number, label: string, file: string): string => `
    <g>
      <clipPath id="dsf${uid}${i}"><rect x="${x}" y="${y}" width="158" height="86" rx="10"/></clipPath>
      <rect x="${x}" y="${y}" width="158" height="86" rx="10" fill="#17406E"/>
      <image href="${MAP_BASE}geo/maps/${file}-640.webp" x="${x}" y="${y}" width="158" height="86" preserveAspectRatio="xMidYMid slice" clip-path="url(#dsf${uid}${i})"/>
      <rect x="${x}" y="${y}" width="158" height="86" rx="10" stroke="#B8D6EC" stroke-width="1.5"/>
      <rect x="${x + 6}" y="${y + 6}" width="36" height="20" rx="10" fill="#FFFFFF" stroke="#C4CAD2" stroke-width="1.2"/>
      <text x="${x + 24}" y="${y + 20.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>
    </g>`;
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="대륙 분포 지도 네 장이 순서 없이 놓여 있어요. 가는 여러 대륙이 흩어져 이동하는 모습, 나는 대륙이 한 덩어리로 모인 모습, 다는 지금의 대륙 모습, 라는 한 덩어리가 갈라지기 시작한 모습이에요">
    ${map(0, 10, 10, "(가)", "Map16a_KT_Boundary_066")}
    ${map(1, 176, 10, "(나)", "Map54a_EP_Artinskian_280")}
    ${map(2, 10, 104, "(다)", "Map01a_PALEOMAP_PaleoAtlas_000")}
    ${map(3, 176, 104, "(라)", "Map33a_LtJ_Tithonian_150")}
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
const MINI: Record<string, string> = {
  earthMini: `<path d="M14 54 A38 38 0 0 1 52 16 L52 54 Z" fill="#F29A66" stroke="#C4602E" stroke-width="1.6"/>
    <path d="M30 54 A22 22 0 0 1 52 32 L52 54 Z" fill="#FFC85E" stroke="#D99A1E" stroke-width="1.4"/>
    <path d="M42 54 A10 10 0 0 1 52 44 L52 54 Z" fill="#FFE9A8" stroke="#E8B54A" stroke-width="1.2"/>
    <path d="M14 54 A38 38 0 0 1 52 16" stroke="#7A5C3E" stroke-width="2.6"/>`,
  mineralMini: `<path d="M20 52 l6 -22 6 8 v14 z" fill="#CFE6F8" stroke="#5AA2F8" stroke-width="1.8"/>
    <path d="M32 52 v-18 l8 -12 8 14 v16 z" fill="#EAF6FF" stroke="#5AA2F8" stroke-width="1.8"/>
    <path d="M14 52 h38" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M46 18 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z" fill="#F0A422"/>`,
  igneousMini: `<path d="M18 40 L32 14 L46 40 Z" fill="#8B95A1" stroke="#5E6B7E" stroke-width="1.8"/>
    <path d="M32 14 l-4 8 h8 z" fill="#F25C54"/>
    <path d="M12 48 h40" stroke="#8B7355" stroke-width="2.4"/>
    <ellipse cx="32" cy="54" rx="10" ry="5" fill="#FFB03A" stroke="#D97706" stroke-width="1.6"/>`,
  strataMini: `<rect x="12" y="14" width="40" height="9" rx="2" fill="#F2DFB2" stroke="#C09B5C" stroke-width="1.2"/>
    <rect x="12" y="23" width="40" height="9" fill="#E8A45E" stroke="#C26838" stroke-width="1.2"/>
    <rect x="12" y="32" width="40" height="9" fill="#C46E8C" stroke="#A25470" stroke-width="1.2"/>
    <rect x="12" y="41" width="40" height="9" rx="2" fill="#E0B45C" stroke="#C29438" stroke-width="1.2"/>`,
  foliMini: `<path d="M32 6 v8 M32 14 l-4 -6 M32 14 l4 -6" stroke="#F25C54" stroke-width="2.4"/>
    <path d="M32 58 v-8 M32 50 l-4 6 M32 50 l4 6" stroke="#F25C54" stroke-width="2.4"/>
    <rect x="14" y="20" width="36" height="24" rx="5" fill="#E6FCF5" stroke="#12B886" stroke-width="1.8"/>
    <path d="M18 27 h28 M18 32 h28 M18 37 h28" stroke="#0CA678" stroke-width="1.8"/>`,
  cycleMini: `<path d="M32 12 a20 20 0 0 1 18 12" stroke="#E64980" stroke-width="2.6" fill="none"/>
    <path d="M50 24 l-7 -1 5 -5z" fill="#E64980"/>
    <path d="M50 36 a20 20 0 0 1 -26 14" stroke="#F0A422" stroke-width="2.6" fill="none"/>
    <path d="M24 50 l6 -4 -1 7z" fill="#F0A422"/>
    <path d="M16 44 a20 20 0 0 1 4 -28" stroke="#12B886" stroke-width="2.6" fill="none"/>
    <path d="M20 16 l1 7 -6 -3z" fill="#12B886"/>`,
  soilMini: `<rect x="14" y="20" width="36" height="10" fill="#6E4E2E"/>
    <rect x="14" y="30" width="36" height="9" fill="#A97C4F"/>
    <rect x="14" y="39" width="36" height="9" fill="#C9A26A"/>
    <rect x="14" y="48" width="36" height="8" fill="#8B95A1"/>
    <rect x="14" y="20" width="36" height="36" stroke="#5E5040" stroke-width="1.8"/>
    <path d="M22 20 q2.5 -7 5 0 M36 20 q2.5 -7 5 0" stroke="#3F9B4F" stroke-width="2"/>`,
  driftMini: `<path d="M14 18 q10 -4 14 4 q4 8 -2 14 q-4 8 -10 4 q-8 -10 -2 -22z" fill="#94C878" stroke="#4E7A38" stroke-width="1.6"/>
    <path d="M34 20 q10 -6 16 2 q4 10 -2 18 q-8 6 -14 0 q-6 -10 0 -20z" fill="#DDB868" stroke="#8E6A24" stroke-width="1.6"/>
    <path d="M30 24 q2 8 -1 14" stroke="#5AA2F8" stroke-width="1.8" stroke-dasharray="3 3"/>
    <path d="M20 50 h24" stroke="#8FBBF2" stroke-width="2.2"/>`,
  plateMini: `<rect x="10" y="14" width="44" height="32" rx="6" fill="#DDF0FB" stroke="#7FB8DC" stroke-width="1.6"/>
    <path d="M18 22 q8 -4 12 4 t-4 12" fill="#C9A26A" stroke="#8E6A34" stroke-width="1"/>
    <path d="M38 20 q10 -2 10 8 t-10 10" fill="#C9A26A" stroke="#8E6A34" stroke-width="1"/>
    <g fill="#F04452"><circle cx="34" cy="18" r="1.7"/><circle cx="37" cy="26" r="1.7"/><circle cx="34" cy="34" r="1.7"/><circle cx="37" cy="42" r="1.7"/></g>
    <path d="M20 54 h24" stroke="#8B95A1" stroke-width="2.2"/>`,
  weatherMini: `<path d="M16 52 q-4 -18 8 -28 q14 -8 24 4 q8 12 0 24 z" fill="#C2C9D4" stroke="#6E7888" stroke-width="1.8"/>
    <path d="M32 24 l-3 10 4 8 -3 10" stroke="#57616F" stroke-width="1.8"/>
    <path d="M33 34 q5 -8 10 -8 M33 34 q-1 -8 4 -12" stroke="#0CA678" stroke-width="2.2"/>
    <circle cx="43" cy="25" r="2.4" fill="#12B886"/>`,
  // ── 보조 카드 글리프(recap 전 카드 미니아트 표준, 2026-07-10) ──
  // 지구계: 지구 + 기권 고리 + 외권 별 + 생물권 잎
  sysMini: `<circle cx="32" cy="34" r="13" fill="#DDF0FB" stroke="#5AA2F8" stroke-width="1.8"/>
    <path d="M25 28 q6 -3 9 2 q2 5 -3 7 q-6 1 -8 -3 q-1 -4 2 -6z" fill="#94C878" stroke="#4E7A38" stroke-width="1"/>
    <path d="M36 41 q4 -1 5 3" stroke="#4E7A38" stroke-width="2"/>
    <circle cx="32" cy="34" r="19" fill="none" stroke="#8FBBF2" stroke-width="1.8" stroke-dasharray="4 4"/>
    <path d="M53 11 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z" fill="#F0A422"/>
    <path d="M11 51 q-2 6 3 8 q5 -1 4 -7 q-3 -3 -7 -1z M14 58 q2 -4 4 -6" fill="#B7E4CE" stroke="#12B886" stroke-width="1.6"/>`,
  // 굳기·자성·염산 반응: 긁기 지그재그 + 자석에 붙은 클립 + 거품
  probeMini: `<path d="M20 30 v-6 a12 12 0 0 1 24 0 v6" fill="none" stroke="#F25C54" stroke-width="7"/>
    <rect x="16.5" y="26" width="7" height="6" fill="#8B99AC"/>
    <rect x="40.5" y="26" width="7" height="6" fill="#8B99AC"/>
    <ellipse cx="31" cy="41" rx="6.5" ry="3" fill="none" stroke="#4E5968" stroke-width="1.8" transform="rotate(-18 31 41)"/>
    <circle cx="53" cy="20" r="2.4" fill="none" stroke="#5AA2F8" stroke-width="1.5"/>
    <circle cx="56" cy="28" r="2" fill="none" stroke="#5AA2F8" stroke-width="1.5"/>
    <circle cx="51" cy="34" r="1.7" fill="none" stroke="#5AA2F8" stroke-width="1.5"/>
    <path d="M10 54 l7 -5 7 5 7 -5 7 5" fill="none" stroke="#C9A26A" stroke-width="2.2"/>`,
  // 암석 색 = 광물 조성: 어두운 광물 많은 돌 vs 밝은 돌
  rockShadeMini: `<rect x="9" y="20" width="21" height="25" rx="5" fill="#5E6B7E" stroke="#3E4550" stroke-width="1.8"/>
    <circle cx="15" cy="27" r="2.4" fill="#2E3540"/><circle cx="24" cy="30" r="2.6" fill="#2E3540"/>
    <circle cx="17" cy="38" r="2.6" fill="#2E3540"/><circle cx="25" cy="40" r="2.2" fill="#2E3540"/>
    <rect x="34" y="20" width="21" height="25" rx="5" fill="#EDEFF2" stroke="#8B95A1" stroke-width="1.8"/>
    <circle cx="41" cy="29" r="2.2" fill="#C4CAD2"/><circle cx="49" cy="38" r="2.2" fill="#C4CAD2"/>
    <path d="M14 54 h32" stroke="#C4CAD2" stroke-width="2.4"/>`,
  // 화석: 돌 속 암모나이트 나선
  fossilMini: `<path d="M14 40 q-4 -16 10 -24 q16 -8 24 4 q6 12 -2 22 q-14 10 -32 -2z" fill="#F4E9D2" stroke="#C9A26A" stroke-width="2"/>
    <path d="M32 32 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0" fill="none" stroke="#0CA678" stroke-width="2.2"/>
    <path d="M20 52 h24" stroke="#C4CAD2" stroke-width="2.2"/>`,
  // 엽리 없는 변성암: 치밀한 입자 돌 + 줄무늬 금지 배지
  nofoliMini: `<rect x="10" y="24" width="34" height="24" rx="9" fill="#F0F4F8" stroke="#8B95A1" stroke-width="2"/>
    <circle cx="18" cy="32" r="1.8" fill="#B8C4D0"/><circle cx="27" cy="30" r="1.8" fill="#B8C4D0"/><circle cx="36" cy="33" r="1.8" fill="#B8C4D0"/>
    <circle cx="22" cy="40" r="1.8" fill="#B8C4D0"/><circle cx="31" cy="42" r="1.8" fill="#B8C4D0"/><circle cx="38" cy="40" r="1.8" fill="#B8C4D0"/>
    <circle cx="50" cy="18" r="9" fill="#FFFFFF" stroke="#F25C54" stroke-width="2"/>
    <path d="M45 15 h10 M45 18 h10 M45 21 h10" stroke="#8B95A1" stroke-width="1.4"/>
    <path d="M44 24 L56 12" stroke="#F25C54" stroke-width="2.2"/>`,
  // 순환의 원동력: 누르는 압력 + 열(불꽃) + 물방울
  forceMini: `<path d="M22 10 v8 M18 14 l4 5 4 -5 M42 10 v8 M38 14 l4 5 4 -5" stroke="#8A6BB8" stroke-width="2.2" fill="none"/>
    <path d="M32 30 q-7 8 -4 15 q3 7 10 5 q7 -3 5 -11 q-1 -5 -5 -9 q0 5 -3 6 q-2 -3 -3 -6z" fill="#FF9A4A" stroke="#D95F14" stroke-width="1.6"/>
    <path d="M13 38 q-4 6 0 10 q5 3 8 -2 q2 -5 -3 -10 q-2 -2 -5 2z" fill="#BFE0F8" stroke="#5AA2F8" stroke-width="1.6"/>`,
  // 네 가지 증거: 맞물리는 두 대륙 퍼즐 + 화석 분포 연결
  evidMini: `<path d="M10 20 h13 v7 a5 5 0 1 0 0 10 v7 h-13 z" fill="#94C878" stroke="#4E7A38" stroke-width="1.8"/>
    <path d="M39 20 h15 v24 h-15 v-7 a5 5 0 1 1 0 -10 z" fill="#DDB868" stroke="#8E6A24" stroke-width="1.8"/>
    <circle cx="17" cy="27" r="2.2" fill="#D6336C"/>
    <circle cx="47" cy="27" r="2.2" fill="#D6336C"/>
    <path d="M20 27 h24" stroke="#D6336C" stroke-width="1.6" stroke-dasharray="3 3"/>
    <path d="M22 52 h20" stroke="#8FBBF2" stroke-width="2.2"/>`,
  // 화산대·지진대: 지도 위 띠를 이루는 지진 점 + 화산
  beltMini: `<rect x="8" y="14" width="48" height="36" rx="6" fill="#DDF0FB" stroke="#7FB8DC" stroke-width="1.6"/>
    <path d="M13 44 Q28 36 34 30 T51 19" fill="none" stroke="#F04452" stroke-width="7" opacity=".16"/>
    <g fill="#F04452"><circle cx="14" cy="43" r="1.8"/><circle cx="20" cy="39" r="1.8"/><circle cx="26" cy="35" r="1.8"/>
    <circle cx="33" cy="31" r="1.8"/><circle cx="40" cy="26" r="1.8"/><circle cx="47" cy="22" r="1.8"/></g>
    <path d="M19 34 l4 -7 4 7 z" fill="#FF9A4A" stroke="#D95F14" stroke-width="1.2"/>
    <path d="M41 21 l3.4 -6 3.4 6 z" fill="#FF9A4A" stroke="#D95F14" stroke-width="1.2"/>`,
  // 색과 조흔색: 겉이 똑같이 검은 조각 둘, 그 아래 조흔판에 검은 줄과 적갈색 줄(자철석과 적철석)
  streakMini: `<path d="M8 25 l4 -10 l9 -4 l8 6 l-1 8 l-9 4 z" fill="#2B2B31" stroke="#141418" stroke-width="1.6"/>
    <path d="M35 25 l4 -10 l9 -4 l8 6 l-1 8 l-9 4 z" fill="#2B2B31" stroke="#141418" stroke-width="1.6"/>
    <path d="M13 15 l6 -3 M40 15 l6 -3" stroke="#77777F" stroke-width="1.6"/>
    <rect x="6" y="35" width="52" height="23" rx="4" fill="#F4EFE6" stroke="#A89F8C" stroke-width="1.6"/>
    <path d="M11 40 l9 3 l-9 3 l9 3 l-7 3" fill="none" stroke="#1C1C20" stroke-width="2.6"/>
    <path d="M38 40 l9 3 l-9 3 l9 3 l-7 3" fill="none" stroke="#A0432F" stroke-width="2.6"/>`,
  // 암석의 세 갈래: 맞물린 결정(화성암), 둥근 알갱이가 쌓인 층(퇴적암), 물결 줄무늬(변성암). 색이 아니라 만들어진 흔적으로 나눈다
  rockTypesMini: `<rect x="3" y="18" width="18" height="28" rx="4" fill="#E9E4DC" stroke="#6B6157" stroke-width="1.6"/>
    <path d="M3 29 l7 -2 l5 5 l6 -1 M10 27 l1 -9 M15 32 l-2 14 M3 38 l10 1" fill="none" stroke="#6B6157" stroke-width="1.2"/>
    <path d="M10.5 18.6 l9.8 0 l0 8.6 l-5.4 4.6 l-4 -4.8 z" fill="#5A5560"/><path d="M13.2 39.2 l7.6 -1.2 l0 7.4 l-7.9 0 z" fill="#E7B9A6"/>
    <rect x="23" y="18" width="18" height="28" rx="4" fill="#E2C48A" stroke="#8E6A34" stroke-width="1.6"/>
    <path d="M23 27.5 h18 M23 37 h18" stroke="#8E6A34" stroke-width="1.2"/>
    <circle cx="27.5" cy="41.5" r="2.4" fill="#B9A894" stroke="#5E4A30" stroke-width="1"/><circle cx="33" cy="42" r="2.2" fill="#B9A894" stroke="#5E4A30" stroke-width="1"/><circle cx="37.8" cy="41.2" r="2.3" fill="#B9A894" stroke="#5E4A30" stroke-width="1"/>
    <g fill="#A77B22"><circle cx="27" cy="32" r=".9"/><circle cx="31" cy="30.5" r=".9"/><circle cx="35" cy="33" r=".9"/><circle cx="38" cy="30" r=".9"/></g>
    <rect x="43" y="18" width="18" height="28" rx="4" fill="#D9D2C8" stroke="#6B6157" stroke-width="1.6"/>
    <path d="M43 24.5 q4.5 -3 9 0 t9 0 M43 31.5 q4.5 -3 9 0 t9 0 M43 38.5 q4.5 -3 9 0 t9 0" fill="none" stroke="#4A4540" stroke-width="2"/>
    <path d="M8 54 h48" stroke="#C4CAD2" stroke-width="2.4"/>`,
};

export function geoMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
