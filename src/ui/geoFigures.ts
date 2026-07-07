// 중2 II 단원(지권의 변화) 퀴즈·개념 그림 — 손코딩 교육용 SVG. 라이트(흰 카드) 기준.
// 정답을 유출하는 라벨은 절대 그리지 않는다 — 빈칸은 (가)~(라)로만.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 지구 내부 단면 4분원 — 두께 비례(지각 0~35 / 맨틀 ~2900 / 외핵 ~5100 / 내핵 ~6400 km).
 *  층 이름은 쓰지 않고 (가)~(라)만 — 마무리 3·4번용. (가)=지각(테두리 얇은 띠),
 *  (나)=맨틀, (다)=외핵, (라)=내핵 자리. */
export function earthLayersFig(): string {
  const cx = 40;
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
    <!-- 세로 절단면의 깊이 라벨 -->
    <text x="${cx - 8}" y="${cy - R + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">0</text>
    <line x1="${cx - 4}" y1="${cy - rMantle + 6}" x2="${cx + 14}" y2="${cy - rMantle + 14}" stroke="#C4CAD2" stroke-width="1.2"/>
    <text x="${cx - 8}" y="${cy - rMantle + 16}" text-anchor="end" font-size="10.5" fill="#8B95A1">35</text>
    <text x="${cx - 8}" y="${cy - rOuter + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">2900</text>
    <text x="${cx - 8}" y="${cy - rInner + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">5100</text>
    <text x="${cx - 8}" y="${cy + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">6400</text>
    <text x="14" y="14" font-size="10.5" fill="#4E5968">깊이(km)</text>
    <!-- (가)~(라) 눈금(수평 변 아래) -->
    ${tick((R + rMantle) / 2, "(가)")}
    ${tick((rMantle + rOuter) / 2, "(나)")}
    ${tick((rOuter + rInner) / 2, "(다)")}
    ${tick(rInner / 2, "(라)")}
    <!-- 지표 장식(수직 변 위 끝) -->
    <path d="M${cx + 6} ${cy - R - 6} q5 -7 10 0 M${cx + 24} ${cy - R - 3} q4 -6 8 0" stroke="#0CA678" stroke-width="1.6"/>
  </svg>`;
}

/** 화성암 2×2 분류표 — x축 색(어둡다↔밝다), y축 결정 크기(작다↔크다), 빈칸 (가)~(라).
 *  (가)=어둡다·크다(반려암), (나)=밝다·크다(화강암), (다)=어둡다·작다(현무암), (라)=밝다·작다(유문암) 자리 — 마무리 6번용. */
export function igneousGridFig(): string {
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

/** 광물 분류 흐름도 — 석영·방해석·자철석을 두 가지 성질 검사로 가르기.
 *  (가)=자철석(클립 끌어당김), (나)=방해석(묽은 염산 반응), (다)=석영 자리 — 마무리 5번용. */
export function mineralFlowFig(): string {
  const arrow = (x1: number, y1: number, x2: number, y2: number): string =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8B95A1" stroke-width="1.8"/>
     ${x1 === x2
       ? `<path d="M${x2} ${y2} l-4.5 -7 h9 z" fill="#8B95A1"/>`
       : `<path d="M${x2} ${y2} l-7 -4.5 v9 z" fill="#8B95A1"/>`}`;
  const result = (x: number, y: number, label: string): string =>
    `<rect x="${x}" y="${y}" width="76" height="40" rx="10" fill="#F8FAFC" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 4"/>
     <text x="${x + 38}" y="${y + 25}" text-anchor="middle" font-size="14.5" font-weight="800" fill="#4E5968">(${label})</text>`;
  return `<svg viewBox="0 0 344 248" ${NS} fill="none" role="img" aria-label="광물 분류 흐름도. 석영, 방해석, 자철석을 클립을 끌어당기는지, 묽은 염산과 반응하는지 두 번 물어 가, 나, 다로 가릅니다">
    <!-- 시작 -->
    <rect x="82" y="10" width="150" height="34" rx="17" fill="#F2F4F6" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="157" y="31" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">석영 · 방해석 · 자철석</text>
    ${arrow(157, 44, 157, 66)}
    <!-- 질문 1 -->
    <rect x="62" y="68" width="190" height="38" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="157" y="91" text-anchor="middle" font-size="12" font-weight="700" fill="#1B64DA">클립을 끌어당기는가?</text>
    <line x1="252" y1="87" x2="284" y2="87" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M284 87 l-7 -4.5 v9 z" fill="#8B95A1"/>
    <text x="266" y="80" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0CA678">예</text>
    ${result(258, 96, "가")}
    ${arrow(157, 106, 157, 130)}
    <text x="144" y="123" text-anchor="end" font-size="10.5" font-weight="800" fill="#8B95A1">아니요</text>
    <!-- 질문 2 -->
    <rect x="62" y="132" width="190" height="38" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="157" y="155" text-anchor="middle" font-size="12" font-weight="700" fill="#1B64DA">묽은 염산과 반응하는가?</text>
    <line x1="252" y1="151" x2="284" y2="151" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M284 151 l-7 -4.5 v9 z" fill="#8B95A1"/>
    <text x="266" y="144" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0CA678">예</text>
    ${result(258, 160, "나")}
    ${arrow(157, 170, 157, 196)}
    <text x="144" y="188" text-anchor="end" font-size="10.5" font-weight="800" fill="#8B95A1">아니요</text>
    ${result(119, 198, "다")}
  </svg>`;
}

/** 토양 단면 4층 — 층 이름·설명 없이 (가)~(라)만. 위에서부터
 *  (가)=식물이 자랄 수 있는 층, (나)=빗물에 녹은 물질·진흙이 쌓인 층,
 *  (다)=암석 조각·모래 층, (라)=풍화받지 않은 암석 자리 — 마무리 8번용. */
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

/** 판의 구조 단면 — 대륙 지각 + 해양 지각 + 맨틀의 윗부분 = 판(두께 약 100 km) — 마무리 10번용. */
export function plateSectionFig(): string {
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="판의 구조 단면. 왼쪽 대륙 지각과 오른쪽 얇은 해양 지각, 그 아래 맨틀의 윗부분까지가 두께 약 100 킬로미터인 판이고, 더 아래는 맨틀이 이어져요">
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

/** 암석 순환 다이어그램 — 마그마·화성암·퇴적물·퇴적암·변성암 + 과정 화살표. recap·문제용. */
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

/** 대륙 이동 4단계 미니 지도 — 순서를 섞어 (가)~(라)로 배치(마무리 13번: 순서 맞추기).
 *  정답 순서: (나) 판게아 → (라) 분리 시작 → (가) 이동 → (다) 현재. */
export function driftStagesFig(): string {
  const panel = (x: number, y: number, label: string, land: string): string => `
    <g>
      <rect x="${x}" y="${y}" width="158" height="86" rx="10" fill="#DDF0FB" stroke="#B8D6EC" stroke-width="1.5"/>
      <g transform="translate(${x} ${y})" fill="#C9A26A" stroke="#8E6A34" stroke-width="1.1">${land}</g>
      <rect x="${x + 8}" y="${y + 8}" width="34" height="19" rx="9.5" fill="#FFFFFF" stroke="#C4CAD2" stroke-width="1.2"/>
      <text x="${x + 25}" y="${y + 21.5}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#4E5968">${label}</text>
    </g>`;
  // 1단계: 판게아(한 덩어리, C자)
  const pangea = `<path d="M62 18 q34 -6 44 14 q6 14 -8 20 q16 8 10 22 q-8 16 -34 12 q-30 -4 -34 -26 q-4 -28 22 -42z"/>`;
  // 2단계: 남북 두 덩어리로 분리 시작(사이에 바다 쐐기)
  const split = `<path d="M56 18 q40 -8 52 12 q4 10 -10 16 q-30 6 -48 -2 q-10 -14 6 -26z"/>
    <path d="M60 52 q30 -8 46 4 q10 12 -2 22 q-22 8 -40 0 q-14 -10 -4 -26z"/>`;
  // 3단계: 여러 조각으로 이동 중(대서양이 벌어짐)
  const moving = `<path d="M34 22 q16 -6 22 6 q2 10 -8 14 q4 8 -2 14 q-10 2 -14 -8 q-6 -14 2 -26z"/>
    <path d="M52 58 q10 -2 12 8 q0 10 -8 16 q-8 -4 -8 -12 q0 -8 4 -12z"/>
    <path d="M84 28 q16 -8 28 2 q8 12 0 24 q-12 10 -24 2 q-10 -14 -4 -28z"/>
    <path d="M120 22 q22 -6 34 6 q6 10 -4 16 q-14 6 -26 0 q-10 -10 -4 -22z"/>
    <path d="M126 62 q10 -4 16 4 q2 8 -8 10 q-8 -4 -8 -14z"/>`;
  // 4단계: 현재(아메리카 / 아프리카·유라시아 / 오세아니아)
  const today = `<path d="M28 22 q14 -4 18 8 q0 8 -8 10 q6 8 0 16 q-4 10 -10 2 q-8 -18 0 -36z"/>
    <path d="M74 30 q10 -4 16 2 q-2 8 -10 8 q-4 -4 -6 -10z"/>
    <path d="M78 44 q12 -4 18 6 q4 12 -4 20 q-10 4 -14 -6 q-4 -12 0 -20z"/>
    <path d="M100 26 q26 -8 42 4 q8 8 -2 14 q-18 8 -32 0 q-12 -8 -8 -18z"/>
    <path d="M130 62 q10 -2 14 6 q-2 8 -12 6 q-6 -6 -2 -12z"/>`;
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="대륙 이동 네 장면이 순서 없이 놓여 있어요. 가는 여러 대륙이 이동 중, 나는 한 덩어리 대륙, 다는 현재 모습, 라는 두 덩어리로 갈라지기 시작한 모습이에요">
    ${panel(10, 10, "(가)", moving)}
    ${panel(176, 10, "(나)", pangea)}
    ${panel(10, 104, "(다)", today)}
    ${panel(176, 104, "(라)", split)}
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
};

export function geoMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
