// mathFigures2 — 중2 수학 트랙 퀴즈 SVG 그림 + recap 미니아트(calcMiniArt).
// mathFigures.ts(중1)와 분리해 병렬 세션 충돌을 없앤다. 루트 svg는 fill="none",
// 파운드리 문법(3스톱 그라데이션·키라이트·접촉 그림자·재질별 최암색 외곽선)을 지킨다.
// 단원 Ⅰ 팔레트: 그레이프 #9C36B5(진한 #7D2A93·연한 #C77BD6), 보조 앰버 #E8A93E.

const svg = (vb: string, inner: string, defs = ""): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none"><defs>${defs}</defs>${inner}</svg>`;

/* ── 순환소수 점 표기 헬퍼 ─────────────────────────────────────
   cyc("2", "1", "35") → "2.13̇5̇"가 아니라 마디 양 끝 위에 점: 2.1 3̇ 5̇ …
   combining dot above(U+0307)로 숫자 위 점을 얹는다(폰트 렌더, SVG 불필요).
   int=정수부, pre=소수점 아래 비순환부(없으면 ""), cycle=순환마디. */
export function cyc(int: string, pre: string, cycle: string): string {
  const dot = "̇";
  let marked: string;
  if (cycle.length === 1) marked = cycle + dot;
  else marked = cycle[0] + dot + cycle.slice(1, -1) + cycle[cycle.length - 1] + dot;
  return `${int}.${pre}${marked}`;
}

/* ── L1 divStopFig: 나눗셈 기계가 멈추는 순간(나머지 0) ──────────
   몫 띠 0.35가 완성되고 나머지 표시가 0, 초록 램프. 좌표: 기계 몸통(40,40~320,150). */
export function divStopFig(): string {
  return svg(
    "0 0 360 200",
    `<ellipse cx="180" cy="176" rx="120" ry="7" fill="#2A3A5E" opacity=".1"/>
    <rect x="40" y="40" width="280" height="120" rx="18" fill="url(#dv-bd)" stroke="#7D2A93" stroke-width="1.6"/>
    <rect x="60" y="60" width="120" height="44" rx="10" fill="url(#dv-sc)" stroke="#7D2A93" stroke-width="1.3"/>
    <text x="120" y="90" text-anchor="middle" font-size="24" font-weight="800" fill="#2A3648">0.35</text>
    <rect x="200" y="60" width="100" height="44" rx="10" fill="url(#dv-sc)" stroke="#7D2A93" stroke-width="1.3"/>
    <text x="250" y="78" text-anchor="middle" font-size="11" font-weight="700" fill="#8A6E96">나머지</text>
    <text x="250" y="96" text-anchor="middle" font-size="17" font-weight="800" fill="#0BA05F">0</text>
    <circle cx="80" cy="132" r="9" fill="url(#dv-lamp)" stroke="#0B7A4A" stroke-width="1.4"/>
    <ellipse cx="77" cy="129" rx="3" ry="2" fill="#fff" opacity=".65"/>
    <text x="100" y="137" font-size="13" font-weight="800" fill="#0BA05F">멈춤!</text>
    <rect x="228" y="120" width="72" height="26" rx="13" fill="url(#dv-tag)" stroke="#7D2A93" stroke-width="1.2"/>
    <text x="264" y="138" text-anchor="middle" font-size="13" font-weight="800" fill="#FFFFFF">유한소수</text>`,
    `<linearGradient id="dv-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6EAFA"/><stop offset=".5" stop-color="#EBD6F2"/><stop offset="1" stop-color="#DDBCE9"/></linearGradient>
    <linearGradient id="dv-sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3E8F8"/></linearGradient>
    <radialGradient id="dv-lamp" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7BE3AE"/><stop offset="1" stop-color="#0BA05F"/></radialGradient>
    <linearGradient id="dv-tag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B85CCB"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>`,
  );
}

/* ── L3 wheelFig: 1/7 나머지 룰렛(재방문 고리) ──────────────────
   원판 중심(120,100) r=62, 나머지 자리 1~6. 방문 순서 3→2→6→4→5→1→(다시 3) 화살 고리.
   오른쪽에 몫 띠 142857…. */
export function wheelFig(): string {
  const cx = 110, cyy = 102, r = 60;
  const pos = (k: number): [number, number] => {
    const a = ((k - 1) / 6) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(a), cyy + r * Math.sin(a)];
  };
  let spots = "";
  for (let k = 1; k <= 6; k++) {
    const [x, y] = pos(k);
    spots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="url(#wh-sp)" stroke="#7D2A93" stroke-width="1.4"/>
      <text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="800" fill="#5E2470">${k}</text>`;
  }
  // 방문 순서 화살(3→2→6→4→5→1→3 고리)
  const seq = [3, 2, 6, 4, 5, 1, 3];
  let arrows = "";
  for (let i = 0; i < seq.length - 1; i++) {
    const [x1, y1] = pos(seq[i]);
    const [x2, y2] = pos(seq[i + 1]);
    const mx = (x1 + x2) / 2 + (cx - (x1 + x2) / 2) * 0.35;
    const my = (y1 + y2) / 2 + (cyy - (y1 + y2) / 2) * 0.35;
    arrows += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${i === 5 ? "#E8434F" : "#9C36B5"}" stroke-width="${i === 5 ? 2.6 : 2}" fill="none" marker-end="url(#wh-ar${i === 5 ? "r" : ""})" opacity="${i === 5 ? 1 : 0.62}"/>`;
  }
  return svg(
    "0 0 360 208",
    `<ellipse cx="110" cy="188" rx="86" ry="6" fill="#2A3A5E" opacity=".09"/>
    <circle cx="${cx}" cy="${cyy}" r="${r + 24}" fill="url(#wh-bd)" stroke="#D9C2E4" stroke-width="1.4"/>
    ${arrows}${spots}
    <text x="${cx}" y="${cyy + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#8A6E96">나머지 자리</text>
    <rect x="216" y="52" width="130" height="40" rx="10" fill="url(#wh-sc)" stroke="#D9C2E4" stroke-width="1.3"/>
    <text x="281" y="70" text-anchor="middle" font-size="11" font-weight="700" fill="#8A6E96">몫</text>
    <text x="281" y="86" text-anchor="middle" font-size="15" font-weight="800" fill="#2A3648">0.142857…</text>
    <rect x="216" y="104" width="130" height="52" rx="10" fill="#FDF0F1" stroke="#EE8B95" stroke-width="1.3"/>
    <text x="281" y="126" text-anchor="middle" font-size="12" font-weight="800" fill="#C4303C">나머지 1이 또!</text>
    <text x="281" y="144" text-anchor="middle" font-size="11.5" font-weight="700" fill="#C4303C">여기부터 몫이 반복</text>`,
    `<radialGradient id="wh-bd" cx=".38" cy=".3" r=".95"><stop offset="0" stop-color="#FBF4FD"/><stop offset="1" stop-color="#EBD8F2"/></radialGradient>
    <radialGradient id="wh-sp" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EFDCF5"/></radialGradient>
    <linearGradient id="wh-sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F5EBF9"/></linearGradient>
    <marker id="wh-ar" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L6 3.5 L0 7 Z" fill="#9C36B5"/></marker>
    <marker id="wh-arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L6 3.5 L0 7 Z" fill="#E8434F"/></marker>`,
  );
}

/* ── L3 flowFig: 유한소수 판별 순서도(교과서 정석 절차의 명문화) ──
   기약분수로 → 분모 소인수분해 → 2·5뿐? 예=유한 / 아니요=순환. */
export function flowFig(): string {
  const box = (x: number, y: number, w: number, h: number, fill: string, stroke: string, t1: string, t2 = "", tc = "#2A3648"): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="11" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>
     <text x="${x + w / 2}" y="${y + (t2 ? h / 2 - 4 : h / 2 + 5)}" text-anchor="middle" font-size="13" font-weight="800" fill="${tc}">${t1}</text>` +
    (t2 ? `<text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-size="13" font-weight="800" fill="${tc}">${t2}</text>` : "");
  return svg(
    "0 0 360 230",
    `${box(20, 16, 150, 38, "url(#fl-a)", "#D9C2E4", "기약분수로 나타내기")}
    <path d="M95 54 v14" stroke="#9C36B5" stroke-width="2" marker-end="url(#fl-ar)"/>
    ${box(20, 72, 150, 38, "url(#fl-a)", "#D9C2E4", "분모를 소인수분해")}
    <path d="M95 110 v14" stroke="#9C36B5" stroke-width="2" marker-end="url(#fl-ar)"/>
    ${box(10, 128, 170, 46, "url(#fl-q)", "#9C36B5", "분모의 소인수가", "2와 5뿐인가요?", "#5E2470")}
    <path d="M180 151 h34" stroke="#0BA05F" stroke-width="2" marker-end="url(#fl-arg)"/>
    <text x="196" y="144" font-size="11.5" font-weight="800" fill="#0BA05F">예</text>
    ${box(218, 128, 128, 46, "url(#fl-yes)", "#0B7A4A", "유한소수", "", "#FFFFFF")}
    <path d="M95 174 v16" stroke="#E8434F" stroke-width="2" marker-end="url(#fl-arr)"/>
    <text x="104" y="186" font-size="11.5" font-weight="800" fill="#C4303C">아니요</text>
    ${box(20, 194, 150, 30, "url(#fl-no)", "#8C1F30", "순환소수", "", "#FFFFFF")}`,
    `<linearGradient id="fl-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3E8F8"/></linearGradient>
    <linearGradient id="fl-q" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FAF0FC"/><stop offset="1" stop-color="#EFDCF5"/></linearGradient>
    <linearGradient id="fl-yes" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3BC488"/><stop offset="1" stop-color="#0BA05F"/></linearGradient>
    <linearGradient id="fl-no" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F27D8E"/><stop offset="1" stop-color="#D8465C"/></linearGradient>
    <marker id="fl-ar" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L6 3.5 L0 7 Z" fill="#9C36B5"/></marker>
    <marker id="fl-arg" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L6 3.5 L0 7 Z" fill="#0BA05F"/></marker>
    <marker id="fl-arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L6 3.5 L0 7 Z" fill="#E8434F"/></marker>`,
  );
}

/* ── L4 subAlignFig: 10x−x 세로 뺄셈 정렬(시험지에 쓰는 손 절차) ── */
export function subAlignFig(): string {
  return svg(
    "0 0 360 170",
    `<rect x="46" y="14" width="268" height="142" rx="14" fill="url(#sa-bd)" stroke="#D9C2E4" stroke-width="1.4"/>
    <text x="96" y="52" text-anchor="end" font-size="19" font-weight="800" fill="#2A3648">10x</text>
    <text x="118" y="52" text-anchor="middle" font-size="17" font-weight="700" fill="#7A8698">=</text>
    <text x="140" y="52" font-size="19" font-weight="800" fill="#2A3648">7.777…</text>
    <text x="72" y="86" font-size="19" font-weight="800" fill="#9C36B5">−</text>
    <text x="96" y="86" text-anchor="end" font-size="19" font-weight="800" fill="#2A3648">x</text>
    <text x="118" y="86" text-anchor="middle" font-size="17" font-weight="700" fill="#7A8698">=</text>
    <text x="140" y="86" font-size="19" font-weight="800" fill="#2A3648">0.777…</text>
    <line x1="64" y1="100" x2="296" y2="100" stroke="#9C36B5" stroke-width="2.2"/>
    <text x="96" y="132" text-anchor="end" font-size="19" font-weight="800" fill="#5E2470">9x</text>
    <text x="118" y="132" text-anchor="middle" font-size="17" font-weight="700" fill="#7A8698">=</text>
    <text x="140" y="132" font-size="19" font-weight="800" fill="#5E2470">7</text>
    <rect x="196" y="30" width="104" height="66" rx="10" fill="#F2FBF6" stroke="#57C793" stroke-width="1.3" opacity=".9"/>
    <text x="248" y="56" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0B7A4A">꼬리가 나란히,</text>
    <text x="248" y="74" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0B7A4A">빼면 사라져요</text>`,
    `<linearGradient id="sa-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F7EFFA"/></linearGradient>`,
  );
}

/* ── L4 numMapFig: 소수의 지도(유한/무한 → 순환/비순환, 유리수 영역) ── */
export function numMapFig(): string {
  return svg(
    "0 0 360 216",
    `<rect x="12" y="12" width="336" height="192" rx="16" fill="url(#nm-bg)" stroke="#D9C2E4" stroke-width="1.4"/>
    <text x="30" y="40" font-size="14" font-weight="800" fill="#5E2470">소수</text>
    <rect x="28" y="52" width="146" height="64" rx="12" fill="url(#nm-fin)" stroke="#0B7A4A" stroke-width="1.5"/>
    <text x="101" y="78" text-anchor="middle" font-size="14" font-weight="800" fill="#0B7A4A">유한소수</text>
    <text x="101" y="98" text-anchor="middle" font-size="12" font-weight="700" fill="#2E8B62">0.5, 0.375</text>
    <rect x="186" y="52" width="146" height="140" rx="12" fill="url(#nm-inf)" stroke="#8A6E96" stroke-width="1.5"/>
    <text x="259" y="74" text-anchor="middle" font-size="14" font-weight="800" fill="#5E2470">무한소수</text>
    <rect x="198" y="84" width="122" height="48" rx="10" fill="url(#nm-cyc)" stroke="#9C36B5" stroke-width="1.4"/>
    <text x="259" y="104" text-anchor="middle" font-size="13" font-weight="800" fill="#7D2A93">순환소수</text>
    <text x="259" y="122" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8A4E9E">0.333…, 1.2̇5̇</text>
    <rect x="198" y="140" width="122" height="42" rx="10" fill="#F2F4F8" stroke="#94A3B8" stroke-width="1.3" stroke-dasharray="4 3"/>
    <text x="259" y="158" text-anchor="middle" font-size="12" font-weight="800" fill="#64748B">순환하지 않는</text>
    <text x="259" y="174" text-anchor="middle" font-size="11.5" font-weight="700" fill="#64748B">무한소수 (π 등)</text>
    <rect x="28" y="134" width="146" height="58" rx="12" fill="url(#nm-rat)" stroke="#0BA05F" stroke-width="1.5"/>
    <text x="101" y="158" text-anchor="middle" font-size="13.5" font-weight="800" fill="#0B7A4A">유리수 =</text>
    <text x="101" y="176" text-anchor="middle" font-size="12" font-weight="700" fill="#2E8B62">유한소수 + 순환소수</text>`,
    `<linearGradient id="nm-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFBFE"/><stop offset="1" stop-color="#F4EBF8"/></linearGradient>
    <linearGradient id="nm-fin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0FBF5"/><stop offset="1" stop-color="#D9F3E5"/></linearGradient>
    <linearGradient id="nm-inf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8F2FB"/><stop offset="1" stop-color="#EDE0F3"/></linearGradient>
    <linearGradient id="nm-cyc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E8FA"/><stop offset="1" stop-color="#E9CDF1"/></linearGradient>
    <linearGradient id="nm-rat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFFBF4"/><stop offset="1" stop-color="#D6F2E3"/></linearGradient>`,
  );
}

/* ── L7 panelFig: 태양광 패널 3×2(가로 3a·세로 2b 치수선) ── */
export function panelFig(): string {
  let cells = "";
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++)
      cells += `<rect x="${66 + c * 76}" y="${52 + r * 56}" width="70" height="50" rx="6" fill="url(#pn-cell)" stroke="#27408B" stroke-width="1.4"/>
        <path d="M${70 + c * 76} ${58 + r * 56} l14 -4 M${70 + c * 76} ${70 + r * 56} l22 -7" stroke="#FFFFFF" stroke-width="1.6" opacity=".5"/>`;
  return svg(
    "0 0 360 210",
    `<ellipse cx="180" cy="186" rx="130" ry="7" fill="#2A3A5E" opacity=".1"/>
    <rect x="58" y="44" width="238" height="122" rx="10" fill="url(#pn-frame)" stroke="#1F2E5C" stroke-width="1.6"/>
    ${cells}
    <path d="M66 182 h222" stroke="#8A6E96" stroke-width="1.6"/>
    <path d="M66 176 v12 M288 176 v12" stroke="#8A6E96" stroke-width="1.6"/>
    <rect x="152" y="172" width="52" height="21" rx="10" fill="#FFFFFF" stroke="#D9C2E4"/>
    <text x="178" y="187" text-anchor="middle" font-size="13.5" font-weight="800" font-style="italic" fill="#5E2470">3a</text>
    <path d="M312 52 v110" stroke="#8A6E96" stroke-width="1.6"/>
    <path d="M306 52 h12 M306 162 h12" stroke="#8A6E96" stroke-width="1.6"/>
    <rect x="296" y="94" width="46" height="21" rx="10" fill="#FFFFFF" stroke="#D9C2E4"/>
    <text x="319" y="109" text-anchor="middle" font-size="13.5" font-weight="800" font-style="italic" fill="#5E2470">2b</text>
    <rect x="66" y="18" width="120" height="22" rx="11" fill="url(#pn-tag)"/>
    <text x="126" y="33" text-anchor="middle" font-size="12" font-weight="800" fill="#FFFFFF">한 장 = a×b</text>`,
    `<linearGradient id="pn-frame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7DEF2"/><stop offset="1" stop-color="#AAB6DD"/></linearGradient>
    <linearGradient id="pn-cell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5B79D9"/><stop offset=".55" stop-color="#3D5BC0"/><stop offset="1" stop-color="#27408B"/></linearGradient>
    <linearGradient id="pn-tag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B85CCB"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>`,
  );
}

/* ── L9 expandFig: 3a(4a+b) 직사각형 절단(전개의 넓이 모델) ── */
export function expandFig(): string {
  // 세로 3a=90px, 가로 4a=176px + b=68px, 원점(52,54)
  return svg(
    "0 0 360 210",
    `<ellipse cx="180" cy="186" rx="130" ry="7" fill="#2A3A5E" opacity=".09"/>
    <rect x="52" y="54" width="176" height="90" fill="url(#ex-a)" stroke="#7D2A93" stroke-width="1.6"/>
    <rect x="232" y="54" width="68" height="90" fill="url(#ex-b)" stroke="#8C5A12" stroke-width="1.6"/>
    <line x1="230" y1="46" x2="230" y2="152" stroke="#E8434F" stroke-width="2.4" stroke-dasharray="6 4"/>
    <path d="M224 40 l6 8 6 -8" fill="none" stroke="#E8434F" stroke-width="2"/>
    <text x="140" y="104" text-anchor="middle" font-size="15" font-weight="800" fill="#5E2470">3a×4a</text>
    <text x="266" y="104" text-anchor="middle" font-size="15" font-weight="800" fill="#7A4A0E">3a×b</text>
    <path d="M52 160 h176 M52 154 v12 M228 154 v12" stroke="#8A6E96" stroke-width="1.5"/>
    <text x="140" y="177" text-anchor="middle" font-size="13" font-weight="800" font-style="italic" fill="#5E2470">4a</text>
    <path d="M232 160 h68 M300 154 v12" stroke="#8A6E96" stroke-width="1.5"/>
    <text x="266" y="177" text-anchor="middle" font-size="13" font-weight="800" font-style="italic" fill="#7A4A0E">b</text>
    <path d="M40 54 v90 M34 54 h12 M34 144 h12" stroke="#8A6E96" stroke-width="1.5"/>
    <text x="26" y="104" text-anchor="middle" font-size="13" font-weight="800" font-style="italic" fill="#5E2470">3a</text>
    <rect x="88" y="14" width="184" height="24" rx="12" fill="url(#ex-tag)"/>
    <text x="180" y="31" text-anchor="middle" font-size="13" font-weight="800" fill="#FFFFFF">잘라도 넓이의 합은 그대로</text>`,
    `<linearGradient id="ex-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBD6F2"/><stop offset="1" stop-color="#D9B5E4"/></linearGradient>
    <linearGradient id="ex-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE7C0"/><stop offset="1" stop-color="#F2CE8C"/></linearGradient>
    <linearGradient id="ex-tag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B85CCB"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>`,
  );
}

/* ── L10 boxFig: 직육면체(밑면 4a×3, 부피 24a²b → 높이 ?) ──
   간이 3D: 앞면(70,70~250,170), 윗면·옆면 평행사변형. */
export function boxFig(): string {
  return svg(
    "0 0 360 220",
    `<ellipse cx="180" cy="196" rx="120" ry="8" fill="#2A3A5E" opacity=".1"/>
    <path d="M70 78 L134 44 L294 44 L230 78 Z" fill="url(#bx-top)" stroke="#7D2A93" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M230 78 L294 44 L294 148 L230 182 Z" fill="url(#bx-side)" stroke="#7D2A93" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="70" y="78" width="160" height="104" fill="url(#bx-front)" stroke="#7D2A93" stroke-width="1.6"/>
    <path d="M70 190 h160 M70 184 v12 M230 184 v12" stroke="#8A6E96" stroke-width="1.5"/>
    <text x="150" y="208" text-anchor="middle" font-size="13.5" font-weight="800" font-style="italic" fill="#5E2470">4a</text>
    <path d="M238 188 L302 154" stroke="#8A6E96" stroke-width="1.5"/>
    <text x="286" y="182" text-anchor="middle" font-size="13.5" font-weight="800" font-style="italic" fill="#5E2470">3b</text>
    <path d="M56 78 v104 M50 78 h12 M50 182 h12" stroke="#8A6E96" stroke-width="1.5"/>
    <rect x="28" y="118" width="26" height="22" rx="8" fill="#FDF0F1" stroke="#E8434F" stroke-width="1.4"/>
    <text x="41" y="134" text-anchor="middle" font-size="14" font-weight="800" fill="#C4303C">?</text>
    <rect x="252" y="88" width="94" height="40" rx="10" fill="#FFFFFF" stroke="#D9C2E4" stroke-width="1.3"/>
    <text x="299" y="105" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8A6E96">부피</text>
    <text x="299" y="121" text-anchor="middle" font-size="14" font-weight="800" fill="#5E2470">24a²b</text>`,
    `<linearGradient id="bx-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E4F8"/><stop offset="1" stop-color="#E3C4EC"/></linearGradient>
    <linearGradient id="bx-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9B5E4"/><stop offset="1" stop-color="#C99BD8"/></linearGradient>
    <linearGradient id="bx-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFDCF5"/><stop offset="1" stop-color="#DDBCE9"/></linearGradient>`,
  );
}

/* ══════════════════ 중2 Ⅱ 부등식과 연립방정식 그림 ══════════════════ */

/* ── L1 eggRangeFig: 계란 등급 범위 띠(수직선 위 구간) ──
   44~52 중란 / 52~60 대란 / 60~68 특란 / 68~ 왕란, 눈금 g 단위. */
export function eggRangeFig(): string {
  const x = (g: number): number => 30 + (g - 40) * 9.6; // 40g~72g → 30~337px
  const band = (a: number, b: number, fill: string, label: string): string =>
    `<rect x="${x(a)}" y="70" width="${x(b) - x(a)}" height="34" rx="8" fill="${fill}" stroke="#B99A70" stroke-width="1.2"/>
     <text x="${(x(a) + x(b)) / 2}" y="91" text-anchor="middle" font-size="12" font-weight="800" fill="#6B4210">${label}</text>`;
  return svg(
    "0 0 360 170",
    `<rect x="10" y="8" width="340" height="154" rx="14" fill="url(#eg-bg)"/>
    ${band(44, 52, "#F8EDDA", "중란")}${band(52, 60, "#F2DFC0", "대란")}${band(60, 68, "#EBCFA0", "특란")}
    <rect x="${x(68)}" y="70" width="${x(72.5) - x(68)}" height="34" rx="8" fill="#E3BE80" stroke="#B99A70" stroke-width="1.2"/>
    <text x="${x(70.4)}" y="91" text-anchor="middle" font-size="12" font-weight="800" fill="#6B4210">왕란</text>
    <line x1="24" y1="122" x2="344" y2="122" stroke="#8C6A3E" stroke-width="2"/>
    <path d="M344 122 l-6 -3.4 v6.8 z" fill="#8C6A3E"/>
    ${[44, 52, 60, 68].map((g) => `<line x1="${x(g)}" y1="66" x2="${x(g)}" y2="126" stroke="#A9631B" stroke-width="1.4" stroke-dasharray="3 3"/>
      <text x="${x(g)}" y="141" text-anchor="middle" font-size="11" font-weight="800" fill="#7F4A12">${g}</text>`).join("")}
    <text x="344" y="141" text-anchor="end" font-size="10" font-weight="700" fill="#A08B6E">무게(g)</text>
    <circle cx="${x(64)}" cy="122" r="5" fill="url(#eg-dot)" stroke="#6B4210" stroke-width="1.3"/>
    <text x="${x(64)}" y="52" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0B7A4A">이 계란은 64g</text>`,
    `<linearGradient id="eg-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCF7EF"/><stop offset="1" stop-color="#F3E7D3"/></linearGradient>
    <radialGradient id="eg-dot" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7BE3AE"/><stop offset="1" stop-color="#0BA05F"/></radialGradient>`,
  );
}

/* ── L3 solLineFig: 부등식 해의 수직선(○ 미포함·● 포함 + 방향 화살) ──
   kind: "gt"(x>v, ○ 오른쪽), "ge"(x≥v, ● 오른쪽), "lt"(x<v, ○ 왼쪽), "le"(x≤v, ● 왼쪽) */
export function solLineFig(kind: "gt" | "ge" | "lt" | "le", v: number): string {
  const lo = v - 3;
  const hi = v + 3;
  const x = (t: number): number => 40 + ((t - lo) / (hi - lo)) * 280;
  const right = kind === "gt" || kind === "ge";
  const filled = kind === "ge" || kind === "le";
  let ticks = "";
  for (let t = lo; t <= hi; t++)
    ticks += `<line x1="${x(t)}" y1="60" x2="${x(t)}" y2="72" stroke="#C2A87F" stroke-width="1.5"/>
      <text x="${x(t)}" y="90" text-anchor="middle" font-size="11.5" font-weight="800" fill="#8C6A3E">${String(t).replace("-", "−")}</text>`;
  const ax = x(v);
  const ex = right ? x(hi) + 14 : x(lo) - 14;
  return svg(
    "0 0 360 110",
    `<line x1="24" y1="66" x2="336" y2="66" stroke="#8C6A3E" stroke-width="2"/>
    <path d="M336 66 l-6 -3.4 v6.8 z" fill="#8C6A3E"/>
    ${ticks}
    <path d="M${ax} 40 H${ex}" stroke="url(#sl-arr)" stroke-width="5" stroke-linecap="round"/>
    <path d="M${ex} 40 l${right ? -8 : 8} -4.6 v9.2 z" fill="#E8A93E"/>
    <circle cx="${ax}" cy="40" r="7" fill="${filled ? "url(#sl-fill)" : "#FFFFFF"}" stroke="#A9631B" stroke-width="2.2"/>`,
    `<linearGradient id="sl-arr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2C468"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>
    <radialGradient id="sl-fill" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#D9A45C"/><stop offset="1" stop-color="#A9631B"/></radialGradient>`,
  );
}

/* ── L4 vsBarFig: 개인 합계 vs 단체 정액 비교 막대(교차 직후 상태) ── */
export function vsBarFig(): string {
  return svg(
    "0 0 360 170",
    `<rect x="10" y="8" width="340" height="154" rx="14" fill="url(#vb-bg)"/>
    <text x="30" y="42" font-size="12" font-weight="800" fill="#2558B8">개인권 합계 (21명)</text>
    <rect x="30" y="50" width="268" height="24" rx="9" fill="url(#vb-a)" stroke="#2558B8" stroke-width="1.4"/>
    <text x="306" y="67" font-size="12" font-weight="800" fill="#2558B8">84000원</text>
    <text x="30" y="104" font-size="12" font-weight="800" fill="#B87A14">단체권 정액</text>
    <rect x="30" y="112" width="256" height="24" rx="9" fill="url(#vb-b)" stroke="#B87A14" stroke-width="1.4"/>
    <text x="294" y="129" font-size="12" font-weight="800" fill="#B87A14">80000원</text>
    <line x1="286" y1="42" x2="286" y2="146" stroke="#E8434F" stroke-width="2" stroke-dasharray="5 4"/>
    <rect x="234" y="146" width="104" height="17" rx="8.5" fill="#FDF0F1" stroke="#EE8B95" stroke-width="1"/>
    <text x="286" y="158.5" text-anchor="middle" font-size="10.5" font-weight="800" fill="#C4303C">여기부터 단체가 이득</text>`,
    `<linearGradient id="vb-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCF7EF"/><stop offset="1" stop-color="#F3E7D3"/></linearGradient>
    <linearGradient id="vb-a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7FA8F2"/><stop offset="1" stop-color="#3D6BD9"/></linearGradient>
    <linearGradient id="vb-b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFC24D"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>`,
  );
}

/* ── L6 gridSolFig: 두 방정식의 해 점 + 공통점(격자, 직선 없음) ── */
export function gridSolFig(): string {
  const S2 = 220;
  const P = 26;
  const U = (S2 - P * 2) / 6;
  const gx = (v: number): number => 60 + P + v * U;
  const gy = (v: number): number => S2 - P - v * U;
  let grid = "";
  for (let v = 0; v <= 6; v++) {
    grid += `<line x1="${gx(0)}" y1="${gy(v)}" x2="${gx(6)}" y2="${gy(v)}" stroke="#E4D6C2" stroke-width="1"/>`;
    grid += `<line x1="${gx(v)}" y1="${gy(0)}" x2="${gx(v)}" y2="${gy(6)}" stroke="#E4D6C2" stroke-width="1"/>`;
    if (v > 0) {
      grid += `<text x="${gx(v)}" y="${gy(0) + 14}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#A08B6E">${v}</text>`;
      grid += `<text x="${gx(0) - 7}" y="${gy(v) + 3.4}" text-anchor="end" font-size="9.5" font-weight="700" fill="#A08B6E">${v}</text>`;
    }
  }
  const blue = [[1, 5], [2, 4], [3, 3], [4, 2], [5, 1]]
    .map(([a, b]) => `<circle cx="${gx(a)}" cy="${gy(b)}" r="6" fill="rgba(47,111,228,.88)" stroke="#2558B8" stroke-width="1.8"/>`)
    .join("");
  const orange = [[1, 4], [4, 2]]
    .map(([a, b]) => `<circle cx="${gx(a)}" cy="${gy(b)}" r="10" fill="none" stroke="#E8830E" stroke-width="3"/>`)
    .join("");
  return svg(
    "0 0 360 230",
    `${grid}
    <line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(6) + 6}" y2="${gy(0)}" stroke="#8C6A3E" stroke-width="1.8"/>
    <line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(0)}" y2="${gy(6) - 6}" stroke="#8C6A3E" stroke-width="1.8"/>
    <text x="${gx(0) - 7}" y="${gy(0) + 14}" text-anchor="end" font-size="10" font-weight="800" fill="#8C6A3E">O</text>
    ${blue}${orange}
    <circle cx="${gx(4)}" cy="${gy(2)}" r="14" fill="none" stroke="#A9631B" stroke-width="2" stroke-dasharray="4 3"/>
    <rect x="240" y="52" width="110" height="26" rx="13" fill="#FFFFFF" stroke="#2558B8" stroke-width="1.3"/>
    <circle cx="256" cy="65" r="5" fill="rgba(47,111,228,.88)"/>
    <text x="268" y="69" font-size="11" font-weight="800" fill="#2558B8">x+y=6 의 해</text>
    <rect x="240" y="86" width="110" height="26" rx="13" fill="#FFFFFF" stroke="#B87A14" stroke-width="1.3"/>
    <circle cx="256" cy="99" r="6" fill="none" stroke="#E8830E" stroke-width="2.6"/>
    <text x="268" y="103" font-size="10.5" font-weight="800" fill="#B87A14">2x+3y=14 의 해</text>
    <rect x="240" y="120" width="110" height="30" rx="13" fill="#FBF3E6" stroke="#A9631B" stroke-width="1.4"/>
    <text x="295" y="133" text-anchor="middle" font-size="10.5" font-weight="800" fill="#7F4A12">두 색이 겹친 점이</text>
    <text x="295" y="145" text-anchor="middle" font-size="10.5" font-weight="800" fill="#7F4A12">연립방정식의 해</text>`,
    ``,
  );
}

/* ── L8 elimAlignFig: 가감법 세로 정석(같은 항끼리 줄 맞춰 빼기) ── */
export function elimAlignFig(): string {
  return svg(
    "0 0 360 170",
    `<rect x="42" y="12" width="276" height="146" rx="14" fill="url(#ea-bd)" stroke="#DFC7A4" stroke-width="1.4"/>
    <text x="150" y="50" text-anchor="end" font-size="18" font-weight="800" fill="#2A3648">4x+2y</text>
    <text x="172" y="50" text-anchor="middle" font-size="16" font-weight="700" fill="#7A8698">=</text>
    <text x="196" y="50" font-size="18" font-weight="800" fill="#2A3648">8800</text>
    <text x="74" y="84" font-size="18" font-weight="800" fill="#A9631B">−</text>
    <text x="150" y="84" text-anchor="end" font-size="18" font-weight="800" fill="#2A3648">2x+2y</text>
    <text x="172" y="84" text-anchor="middle" font-size="16" font-weight="700" fill="#7A8698">=</text>
    <text x="196" y="84" font-size="18" font-weight="800" fill="#2A3648">5600</text>
    <line x1="64" y1="98" x2="296" y2="98" stroke="#A9631B" stroke-width="2.2"/>
    <text x="150" y="128" text-anchor="end" font-size="18" font-weight="800" fill="#7F4A12">2x</text>
    <text x="172" y="128" text-anchor="middle" font-size="16" font-weight="700" fill="#7A8698">=</text>
    <text x="196" y="128" font-size="18" font-weight="800" fill="#7F4A12">3200</text>
    <rect x="216" y="62" width="92" height="34" rx="10" fill="#F2FBF6" stroke="#57C793" stroke-width="1.3"/>
    <text x="262" y="76" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0B7A4A">같은 2y끼리 소거,</text>
    <text x="262" y="89" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0B7A4A">y가 사라져요</text>`,
    `<linearGradient id="ea-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F8EFE1"/></linearGradient>`,
  );
}

/* ── L9 pheasantFig: 손자산경 꿩과 토끼(머리·다리 배지) ── */
export function pheasantFig(): string {
  return svg(
    "0 0 360 200",
    `<ellipse cx="180" cy="182" rx="120" ry="7" fill="#2A3A5E" opacity=".1"/>
    <path d="M96 96 h168 l-12 72 h-144 z" fill="url(#ph-bk)" stroke="#6B4210" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M104 112 h152 M108 132 h144 M112 152 h136" stroke="#8C5A1E" stroke-width="1.3" opacity=".5"/>
    <circle cx="140" cy="84" r="13" fill="url(#ph-bird)" stroke="#245A38" stroke-width="1.4"/>
    <path d="M152 82 l9 3 -9 3.4 z" fill="#E8A93E" stroke="#8C5A1E" stroke-width=".9"/>
    <circle cx="137" cy="81" r="1.8" fill="#1E2A38"/>
    <path d="M132 74 q-4 -7 1 -11" fill="none" stroke="#245A38" stroke-width="2" stroke-linecap="round"/>
    <circle cx="205" cy="86" r="12" fill="url(#ph-rab)" stroke="#8C6A4A" stroke-width="1.4"/>
    <path d="M199 76 q-2.4 -12 3 -14.5 q2.8 8 1.2 14 M211 76 q2.4 -12 -3 -14.5 q-2.8 8 -1.2 14" fill="url(#ph-ear)" stroke="#8C6A4A" stroke-width="1.2"/>
    <circle cx="201.6" cy="83.6" r="1.7" fill="#1E2A38"/><circle cx="208.4" cy="83.6" r="1.7" fill="#1E2A38"/>
    <circle cx="252" cy="88" r="10" fill="url(#ph-bird)" stroke="#245A38" stroke-width="1.3"/>
    <path d="M261 86.5 l7.5 2.5 -7.5 2.8 z" fill="#E8A93E" stroke="#8C5A1E" stroke-width=".8"/>
    <circle cx="249.6" cy="85.6" r="1.5" fill="#1E2A38"/>
    <rect x="42" y="20" width="130" height="30" rx="15" fill="url(#ph-tag1)" stroke="#2558B8" stroke-width="1.4"/>
    <text x="107" y="40" text-anchor="middle" font-size="13" font-weight="900" fill="#FFFFFF">머리 모두 35</text>
    <rect x="190" y="20" width="130" height="30" rx="15" fill="url(#ph-tag2)" stroke="#B87A14" stroke-width="1.4"/>
    <text x="255" y="40" text-anchor="middle" font-size="13" font-weight="900" fill="#5C3A00">다리 모두 94</text>
    <text x="180" y="192" text-anchor="middle" font-size="11" font-weight="700" fill="#8C6A3E">꿩의 다리는 2개, 토끼의 다리는 4개</text>`,
    `<linearGradient id="ph-bk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E3B476"/><stop offset="1" stop-color="#B57226"/></linearGradient>
    <radialGradient id="ph-bird" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7FC79A"/><stop offset="1" stop-color="#3E8B5E"/></radialGradient>
    <radialGradient id="ph-rab" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FBF3E8"/><stop offset="1" stop-color="#DFC5A8"/></radialGradient>
    <linearGradient id="ph-ear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3E8"/><stop offset="1" stop-color="#E8CBAF"/></linearGradient>
    <linearGradient id="ph-tag1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7FA8F2"/><stop offset="1" stop-color="#3D6BD9"/></linearGradient>
    <linearGradient id="ph-tag2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#E8A93E"/></linearGradient>`,
  );
}

/* ── recap 미니아트(calcMiniArt) — 72×72 카드 아이콘 ── */
const MINI: Record<string, [string, string]> = {
  // 나눗셈 기계(멈춤 램프)
  divide: [
    `<rect x="12" y="18" width="48" height="36" rx="9" fill="url(#mi-bd)" stroke="#7D2A93" stroke-width="1.5"/>
     <rect x="18" y="25" width="24" height="14" rx="4" fill="#FFFFFF" stroke="#D9C2E4"/>
     <circle cx="52" cy="32" r="4.5" fill="url(#mi-gr)" stroke="#0B7A4A" stroke-width="1.2"/>
     <circle cx="26" cy="46" r="3" fill="#C77BD6"/><circle cx="36" cy="46" r="3" fill="#C77BD6"/><circle cx="46" cy="46" r="3" fill="#C77BD6"/>`,
    "",
  ],
  // 반복 물결(순환)
  cycle: [
    `<path d="M10 40 q8 -14 16 0 q8 14 16 0 q8 -14 16 0" stroke="url(#mi-gp)" stroke-width="5" stroke-linecap="round" fill="none"/>
     <circle cx="18" cy="30" r="3.2" fill="#9C36B5"/><circle cx="50" cy="30" r="3.2" fill="#9C36B5"/>`,
    "",
  ],
  // 분모 자물쇠(2·5 열쇠)
  denom: [
    `<rect x="18" y="30" width="36" height="28" rx="8" fill="url(#mi-bd)" stroke="#7D2A93" stroke-width="1.5"/>
     <path d="M26 30 v-6 a10 10 0 0 1 20 0 v6" stroke="#7D2A93" stroke-width="3.4" fill="none"/>
     <circle cx="36" cy="42" r="4.6" fill="#7D2A93"/><rect x="34.2" y="44" width="3.6" height="8" rx="1.6" fill="#7D2A93"/>`,
    "",
  ],
  // 10배 시프트 화살(소수점 이동)
  shift: [
    `<circle cx="22" cy="44" r="5" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.3"/>
     <path d="M32 44 h22" stroke="#9C36B5" stroke-width="3.4" stroke-linecap="round"/>
     <path d="M48 37 l9 7 -9 7" stroke="#9C36B5" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
     <path d="M16 26 h40" stroke="#D9C2E4" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="2 5"/>`,
    "",
  ],
  // 지수 탑
  pow: [
    `<rect x="22" y="42" width="28" height="16" rx="4.5" fill="url(#mi-gp)" stroke="#7D2A93" stroke-width="1.4"/>
     <rect x="26" y="27" width="20" height="12" rx="4" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.3"/>
     <rect x="29.5" y="15" width="13" height="9" rx="3.4" fill="#F3E4F8" stroke="#7D2A93" stroke-width="1.2"/>`,
    "",
  ],
  // 헤쳐 모여 트레이 2개
  mono: [
    `<rect x="10" y="38" width="24" height="18" rx="6" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.3"/>
     <rect x="38" y="38" width="24" height="18" rx="6" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.3"/>
     <circle cx="22" cy="26" r="5" fill="#C77BD6" stroke="#7D2A93" stroke-width="1.2"/>
     <circle cx="50" cy="26" r="5" fill="#F2CE8C" stroke="#8C5A12" stroke-width="1.2"/>
     <path d="M22 32 v4 M50 32 v4" stroke="#8A6E96" stroke-width="1.8" stroke-linecap="round"/>`,
    "",
  ],
  // 동류항 칩 겹침
  poly: [
    `<rect x="12" y="30" width="26" height="17" rx="8.5" fill="url(#mi-gp)" stroke="#7D2A93" stroke-width="1.3" transform="rotate(-7 25 38)"/>
     <rect x="32" y="24" width="26" height="17" rx="8.5" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.3" transform="rotate(6 45 32)"/>`,
    "",
  ],
  // 전개 절단 직사각형
  expand: [
    `<rect x="12" y="24" width="30" height="26" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.4"/>
     <rect x="46" y="24" width="14" height="26" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.4"/>
     <line x1="44" y1="18" x2="44" y2="56" stroke="#E8434F" stroke-width="2" stroke-dasharray="4 3"/>`,
    "",
  ],
  // ── 중2 Ⅱ 부등식과 연립방정식 ──
  // 부등호 표지판
  ineq: [
    `<rect x="33.4" y="34" width="5" height="22" rx="2.5" fill="url(#mi-br2)" stroke="#6B4210" stroke-width="1.1"/>
     <circle cx="36" cy="24" r="14" fill="url(#mi-crm)" stroke="#7F4A12" stroke-width="1.8"/>
     <path d="M42.5 17.5 L30 24 L42.5 30.5" fill="none" stroke="#7F4A12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    "",
  ],
  // 원점 반사 화살(음수 곱 반전)
  flip: [
    `<line x1="10" y1="44" x2="62" y2="44" stroke="#8C6A3E" stroke-width="2.2" stroke-linecap="round"/>
     <line x1="36" y1="24" x2="36" y2="52" stroke="#E8A93E" stroke-width="2" stroke-dasharray="3 3"/>
     <circle cx="52" cy="44" r="5" fill="url(#mi-bl)" stroke="#2558B8" stroke-width="1.2"/>
     <circle cx="20" cy="44" r="5" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.2"/>
     <path d="M50 36 q-14 -14 -28 0" fill="none" stroke="#A9631B" stroke-width="2.4" stroke-linecap="round"/>
     <path d="M22 36 l-2 5 5.5 -.6 z" fill="#A9631B"/>`,
    "",
  ],
  // 수직선 범위(○+화살)
  range: [
    `<line x1="10" y1="46" x2="62" y2="46" stroke="#8C6A3E" stroke-width="2.2" stroke-linecap="round"/>
     <line x1="22" y1="42" x2="22" y2="50" stroke="#C2A87F" stroke-width="1.6"/>
     <line x1="46" y1="42" x2="46" y2="50" stroke="#C2A87F" stroke-width="1.6"/>
     <circle cx="30" cy="34" r="5.4" fill="#FFFFFF" stroke="#A9631B" stroke-width="2.2"/>
     <path d="M35 34 h20" stroke="url(#mi-am)" stroke-width="4.4" stroke-linecap="round"/>
     <path d="M56 34 l-5 -3 v6 z" fill="#E8A93E"/>`,
    "",
  ],
  // 격자 교점(공통 해)
  cross: [
    `${[18, 30, 42, 54].map((v) => `<line x1="${v}" y1="16" x2="${v}" y2="54" stroke="#E4D6C2" stroke-width="1.2"/><line x1="12" y1="${v - 2}" x2="58" y2="${v - 2}" stroke="#E4D6C2" stroke-width="1.2"/>`).join("")}
     <circle cx="30" cy="28" r="4.4" fill="url(#mi-bl)" stroke="#2558B8" stroke-width="1.1"/>
     <circle cx="42" cy="40" r="4.4" fill="url(#mi-bl)" stroke="#2558B8" stroke-width="1.1"/>
     <circle cx="42" cy="40" r="8.6" fill="none" stroke="#E8830E" stroke-width="2.6"/>
     <circle cx="18" cy="16" r="4.4" fill="none" stroke="#E8830E" stroke-width="2.2"/>`,
    "",
  ],
  // 대입 슬롯(마트료시카 끼움)
  subst: [
    `<rect x="14" y="26" width="26" height="26" rx="7" fill="url(#mi-crm)" stroke="#7F4A12" stroke-width="1.4"/>
     <rect x="22" y="34" width="10" height="18" rx="4" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.2"/>
     <path d="M46 32 h8 m-8 8 h8" stroke="#A9631B" stroke-width="2.4" stroke-linecap="round"/>
     <rect x="50" y="22" width="12" height="12" rx="4" fill="url(#mi-br2)" stroke="#6B4210" stroke-width="1.2"/>`,
    "",
  ],
  // 가감 소거(두 줄에서 같은 항 지우기)
  elim: [
    `<rect x="12" y="20" width="48" height="13" rx="6.5" fill="url(#mi-crm)" stroke="#B99A70" stroke-width="1.1"/>
     <rect x="12" y="39" width="48" height="13" rx="6.5" fill="url(#mi-crm)" stroke="#B99A70" stroke-width="1.1"/>
     <circle cx="46" cy="26.5" r="5" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.1"/>
     <circle cx="46" cy="45.5" r="5" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.1"/>
     <path d="M39 20 l14 13 m0 -13 l-14 13 M39 39 l14 13 m0 -13 l-14 13" stroke="#E8434F" stroke-width="2" stroke-linecap="round"/>
     <line x1="10" y1="58" x2="62" y2="58" stroke="#A9631B" stroke-width="2.2" stroke-linecap="round"/>`,
    "",
  ],
  // ── 중2 Ⅲ 일차함수(틸 그린) ──
  // 대응 기계(x 하나에 y 하나)
  func: [
    `<rect x="16" y="24" width="40" height="26" rx="8" fill="url(#mi-tl2)" stroke="#067D57" stroke-width="1.5"/>
     <rect x="30" y="18" width="12" height="6" rx="3" fill="#0B3B2C"/>
     <rect x="30" y="50" width="12" height="6" rx="3" fill="#0B3B2C"/>
     <circle cx="36" cy="10" r="4.6" fill="url(#mi-tl)" stroke="#067D57" stroke-width="1.2"/>
     <circle cx="36" cy="62" r="4.6" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.2"/>
     <circle cx="36" cy="37" r="4" fill="#067D57"/>`,
    "",
  ],
  // 계단(시작 단 + 일정 오르기 = ax+b)
  linear: [
    `<rect x="10" y="48" width="18" height="10" rx="3" fill="url(#mi-tl)" stroke="#067D57" stroke-width="1.3"/>
     <path d="M28 48 h12 v-10 h12 v-10 h12" stroke="#0A8F67" stroke-width="3" fill="none" stroke-linejoin="round"/>
     <path d="M28 58 h36 v-40" stroke="#C8DAD2" stroke-width="1.6" fill="none"/>`,
    "",
  ],
  // 나란한 두 직선(평행이동)
  shiftg: [
    `<line x1="12" y1="54" x2="58" y2="20" stroke="url(#mi-tl)" stroke-width="4" stroke-linecap="round"/>
     <line x1="12" y1="40" x2="58" y2="6" stroke="#94A3B8" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 5"/>
     <path d="M30 40 v-10" stroke="#E8A93E" stroke-width="2.4" stroke-linecap="round"/>
     <path d="M30 28 l-3.4 4.6 h6.8 z" fill="#E8A93E"/>`,
    "",
  ],
  // 축과 만나는 두 점(절편)
  icept: [
    `<line x1="8" y1="44" x2="62" y2="44" stroke="#64748B" stroke-width="2"/>
     <line x1="24" y1="60" x2="24" y2="8" stroke="#64748B" stroke-width="2"/>
     <line x1="10" y1="58" x2="60" y2="14" stroke="url(#mi-tl)" stroke-width="3.4" stroke-linecap="round"/>
     <circle cx="42" cy="30" r="5" fill="url(#mi-tl)" stroke="#067D57" stroke-width="1.4" transform="translate(-1.8 14)"/>
     <circle cx="24" cy="45.6" r="5" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.4" transform="translate(0 -20)"/>`,
    "",
  ],
  // 기울기 세모(가로·세로 증가량)
  slope: [
    `<line x1="10" y1="56" x2="60" y2="16" stroke="url(#mi-tl)" stroke-width="3.6" stroke-linecap="round"/>
     <path d="M22 46 h20 v-16" stroke="#E8A93E" stroke-width="2.6" fill="none" stroke-dasharray="4 3" stroke-linejoin="round"/>
     <circle cx="22" cy="46" r="4.2" fill="url(#mi-tl)" stroke="#067D57" stroke-width="1.2"/>
     <circle cx="42" cy="30" r="4.2" fill="url(#mi-tl)" stroke="#067D57" stroke-width="1.2"/>`,
    "",
  ],
  // 방향 두 갈래(a의 부호)
  family: [
    `<line x1="12" y1="52" x2="58" y2="18" stroke="url(#mi-tl)" stroke-width="3.8" stroke-linecap="round"/>
     <line x1="12" y1="18" x2="58" y2="52" stroke="url(#mi-rs)" stroke-width="3.8" stroke-linecap="round"/>
     <path d="M58 18 l-8 .5 4.4 6.6 z" fill="#0A8F67"/>
     <path d="M58 52 l-8 -.5 4.4 -6.6 z" fill="#D8465C"/>`,
    "",
  ],
  // 돋보기 속 직선(단서로 복원)
  build: [
    `<circle cx="32" cy="32" r="18" fill="url(#mi-lens)" stroke="#5E6C78" stroke-width="2.6"/>
     <line x1="22" y1="40" x2="42" y2="24" stroke="url(#mi-tl)" stroke-width="3.2" stroke-linecap="round"/>
     <circle cx="27" cy="36" r="3" fill="#E8A93E" stroke="#8C5A12" stroke-width="1"/>
     <circle cx="38" cy="27" r="3" fill="#E8A93E" stroke="#8C5A12" stroke-width="1"/>
     <line x1="45" y1="46" x2="56" y2="57" stroke="#5E6C78" stroke-width="4.4" stroke-linecap="round"/>`,
    "",
  ],
  // 점들이 이어져 직선(방정식의 그래프)
  reveal: [
    `<line x1="10" y1="56" x2="60" y2="14" stroke="url(#mi-tl)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7"/>
     <circle cx="18" cy="49.3" r="3.6" fill="url(#mi-tl)" stroke="#067D57" stroke-width="1.1"/>
     <circle cx="32" cy="37.5" r="3.6" fill="url(#mi-tl)" stroke="#067D57" stroke-width="1.1"/>
     <circle cx="46" cy="25.8" r="3.6" fill="url(#mi-tl)" stroke="#067D57" stroke-width="1.1"/>
     <line x1="10" y1="30" x2="34" y2="30" stroke="#94A3B8" stroke-width="1.6"/>
     <line x1="22" y1="18" x2="22" y2="42" stroke="#94A3B8" stroke-width="1.6"/>`,
    "",
  ],
  // 교차 X + 교점(연립방정식의 해)
  meet: [
    `<line x1="10" y1="18" x2="60" y2="50" stroke="url(#mi-bl)" stroke-width="3.4" stroke-linecap="round"/>
     <line x1="10" y1="52" x2="60" y2="16" stroke="url(#mi-tl)" stroke-width="3.4" stroke-linecap="round"/>
     <circle cx="34.5" cy="33.7" r="6" fill="#FFFFFF" stroke="#C2255C" stroke-width="2.4"/>`,
    "",
  ],
  // ── Ⅲ 보조 카드 글리프(recap 전 카드 미니아트, 사용자 확정 2026-07-10) ──
  // 함숫값: 슬롯에 구슬을 대입
  fval: [
    `<rect x="20" y="36" width="32" height="20" rx="7" fill="url(#mi-tl2)" stroke="#067D57" stroke-width="1.5"/>
     <circle cx="36" cy="46" r="5.5" fill="none" stroke="#0A8F67" stroke-width="1.6" stroke-dasharray="3 3"/>
     <circle cx="36" cy="16" r="6" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.3"/>
     <path d="M36 25 v7" stroke="#94A3B8" stroke-width="2" stroke-dasharray="2 3" stroke-linecap="round"/>`,
    "",
  ],
  // y=ax+b: 원점 직선을 b만큼 나란히(간격 점선 2개)
  bshift: [
    `<line x1="12" y1="52" x2="60" y2="28" stroke="#94A3B8" stroke-width="2.6" stroke-dasharray="6 5" stroke-linecap="round"/>
     <line x1="12" y1="38" x2="60" y2="14" stroke="url(#mi-tl)" stroke-width="4" stroke-linecap="round"/>
     <path d="M24 46 v-10 M46 35 v-10" stroke="#E8A93E" stroke-width="2.2" stroke-dasharray="3 3" stroke-linecap="round"/>`,
    "",
  ],
  // 두 점이면 직선이 정해진다(절편 두 개로 긋기)
  twopoints: [
    `<line x1="10" y1="54" x2="62" y2="16" stroke="url(#mi-tl)" stroke-width="3.4" stroke-linecap="round"/>
     <circle cx="24" cy="43.8" r="5" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.3"/>
     <circle cx="48" cy="26.2" r="5" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.3"/>`,
    "",
  ],
  // 내려가는 직선(음수 기울기 세모)
  downhill: [
    `<line x1="10" y1="18" x2="62" y2="50" stroke="url(#mi-rs)" stroke-width="4" stroke-linecap="round"/>
     <path d="M26 28 h14 v8.6" fill="none" stroke="#E8608A" stroke-width="2.4" stroke-dasharray="4 3" stroke-linejoin="round"/>
     <circle cx="26" cy="27.8" r="3.8" fill="url(#mi-rs)" stroke="#9C3D5E" stroke-width="1.1"/>
     <circle cx="40" cy="36.4" r="3.8" fill="url(#mi-rs)" stroke="#9C3D5E" stroke-width="1.1"/>`,
    "",
  ],
  // 평행: 나란한 두 직선 + 등간격 틱
  parallel: [
    `<line x1="12" y1="42" x2="60" y2="18" stroke="url(#mi-tl)" stroke-width="3.6" stroke-linecap="round"/>
     <line x1="12" y1="56" x2="60" y2="32" stroke="url(#mi-bl)" stroke-width="3.6" stroke-linecap="round"/>
     <path d="M28 48 l4 -7 M44 40 l4 -7" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>`,
    "",
  ],
  // x=m 세로선 · y=n 가로선(축과 평행한 특수 직선 쌍)
  axpair: [
    `<line x1="8" y1="40" x2="62" y2="40" stroke="#C2CBD6" stroke-width="1.8"/>
     <line x1="22" y1="10" x2="22" y2="58" stroke="#C2CBD6" stroke-width="1.8"/>
     <line x1="46" y1="12" x2="46" y2="58" stroke="url(#mi-tl)" stroke-width="3.4" stroke-linecap="round"/>
     <line x1="10" y1="24" x2="60" y2="24" stroke="url(#mi-am)" stroke-width="3.4" stroke-linecap="round"/>`,
    "",
  ],
  // 일치: 두 직선이 한 몸으로 포개짐(해 무수히)
  coincide: [
    `<line x1="10" y1="50" x2="62" y2="18" stroke="url(#mi-bl)" stroke-width="6.4" stroke-linecap="round" opacity=".4"/>
     <line x1="10" y1="50" x2="62" y2="18" stroke="url(#mi-tl)" stroke-width="3.2" stroke-linecap="round"/>
     <path d="M50 32 v6 M47 35 h6" stroke="#E8A93E" stroke-width="2" stroke-linecap="round"/>
     <path d="M22 46 v4 M20 48 h4" stroke="#E8A93E" stroke-width="1.6" stroke-linecap="round"/>`,
    "",
  ],
  // ── Ⅰ 보조 카드 글리프(recap 전 카드 미니아트 표준, 2026-07-10) ──
  // 멈춤의 조건: 나머지 창의 0 + 초록 통과 체크
  stop0: [
    `<rect x="12" y="24" width="30" height="22" rx="6" fill="#FFFFFF" stroke="#D9C2E4" stroke-width="1.6"/>
     <text x="27" y="40" text-anchor="middle" font-size="15" font-weight="800" fill="#0BA05F">0</text>
     <circle cx="54" cy="35" r="9" fill="url(#mi-gr)" stroke="#0B7A4A" stroke-width="1.4"/>
     <path d="M50 35 l3 3.2 5.5 -6.4" stroke="#FFFFFF" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    "",
  ],
  // 점 두 개의 표기법: 마디 양 끝 숫자 위에 점
  dots2: [
    `<rect x="15" y="32" width="12" height="15" rx="3.5" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.2"/>
     <rect x="30" y="32" width="12" height="15" rx="3.5" fill="#F7EFFA" stroke="#C9A6D6" stroke-width="1.2"/>
     <rect x="45" y="32" width="12" height="15" rx="3.5" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.2"/>
     <circle cx="21" cy="24" r="3" fill="#9C36B5"/><circle cx="51" cy="24" r="3" fill="#9C36B5"/>
     <path d="M15 53 h42" stroke="#C9A6D6" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 4"/>`,
    "",
  ],
  // 함정 주의: 약분 먼저(빗금 지우고 작은 기약분수로)
  reduce: [
    `<rect x="12" y="20" width="18" height="13" rx="4" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.2"/>
     <path d="M10 38 h22" stroke="#5E2470" stroke-width="2.6" stroke-linecap="round"/>
     <rect x="12" y="43" width="18" height="13" rx="4" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.2"/>
     <path d="M10 35 L32 20 M10 58 L32 43" stroke="#E8434F" stroke-width="2.2" stroke-linecap="round"/>
     <path d="M37 38 h7 m0 0 l-3 -2.6 m3 2.6 l-3 2.6" stroke="#8A6E96" stroke-width="1.8" stroke-linecap="round"/>
     <rect x="49" y="24" width="13" height="10" rx="3" fill="url(#mi-gp)" stroke="#7D2A93" stroke-width="1.2"/>
     <path d="M47 38 h17" stroke="#5E2470" stroke-width="2.2" stroke-linecap="round"/>
     <rect x="49" y="42" width="13" height="10" rx="3" fill="url(#mi-gp)" stroke="#7D2A93" stroke-width="1.2"/>`,
    "",
  ],
  // 순환의 정체: 나머지가 고리를 돌아 되돌아온다
  remcycle: [
    `<path d="M36 20 A16 16 0 1 0 49.9 28" fill="none" stroke="#9C36B5" stroke-width="2.8" stroke-linecap="round"/>
     <path d="M49.9 28 l-6.4 -1.2 M49.9 28 l1 -6.4" stroke="#9C36B5" stroke-width="2.4" stroke-linecap="round"/>
     <circle cx="36" cy="20" r="4.4" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.2"/>
     <circle cx="22.1" cy="44" r="3.8" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.2"/>
     <circle cx="49.9" cy="44" r="3.8" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.2"/>`,
    "",
  ],
  // 유리수의 두 얼굴: 끝나는 소수(멈춤 점)와 도는 소수(물결)
  twoface: [
    `<circle cx="25" cy="36" r="14" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.5"/>
     <path d="M18 36 h9" stroke="#5E2470" stroke-width="2.6" stroke-linecap="round"/><circle cx="31" cy="36" r="2.6" fill="#5E2470"/>
     <circle cx="47" cy="36" r="14" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.5"/>
     <path d="M39 36 q4 -7 8 0 q4 7 8 0" fill="none" stroke="#8C5A12" stroke-width="2.4" stroke-linecap="round"/>`,
    "",
  ],
  // (aᵐ)ⁿ: 괄호 속 탑을 통째로 복제하면 지수는 곱셈
  powpow: [
    `<path d="M15 22 q-6 14 0 28" fill="none" stroke="#7D2A93" stroke-width="2.4" stroke-linecap="round"/>
     <path d="M33 22 q6 14 0 28" fill="none" stroke="#7D2A93" stroke-width="2.4" stroke-linecap="round"/>
     <rect x="19" y="38" width="10" height="8" rx="2.5" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.1"/>
     <rect x="19" y="28" width="10" height="8" rx="2.5" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.1"/>
     <path d="M39 36 h6 m0 0 l-2.6 -2.4 m2.6 2.4 l-2.6 2.4" stroke="#8A6E96" stroke-width="1.8" stroke-linecap="round"/>
     <rect x="50" y="46" width="10" height="8" rx="2.5" fill="url(#mi-gp)" stroke="#7D2A93" stroke-width="1.1"/>
     <rect x="50" y="37" width="10" height="8" rx="2.5" fill="url(#mi-gp)" stroke="#7D2A93" stroke-width="1.1"/>
     <rect x="50" y="28" width="10" height="8" rx="2.5" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.1"/>
     <rect x="50" y="19" width="10" height="8" rx="2.5" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.1"/>`,
    "",
  ],
  // (ab)ᵐ: 괄호 안 전원에게 지수가 배달된다
  powall: [
    `<path d="M20 26 q-7 12 0 24" fill="none" stroke="#7D2A93" stroke-width="2.4" stroke-linecap="round"/>
     <path d="M44 26 q7 12 0 24" fill="none" stroke="#7D2A93" stroke-width="2.4" stroke-linecap="round"/>
     <circle cx="27" cy="40" r="6" fill="url(#mi-gp)" stroke="#7D2A93" stroke-width="1.3"/>
     <circle cx="38" cy="40" r="6" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.3"/>
     <circle cx="53" cy="18" r="8" fill="url(#mi-gp)" stroke="#7D2A93" stroke-width="1.3"/>
     <text x="53" y="22" text-anchor="middle" font-size="10" font-weight="800" font-style="italic" fill="#FFFFFF">m</text>
     <path d="M48 25 q-12 4 -19 9" fill="none" stroke="#8A6E96" stroke-width="1.6" stroke-dasharray="3 3" stroke-linecap="round"/>
     <path d="M50 27 q-6 5 -10 7" fill="none" stroke="#8A6E96" stroke-width="1.6" stroke-dasharray="3 3" stroke-linecap="round"/>`,
    "",
  ],
  // 나눗셈: 분수를 뒤집어 곱하기(회전 화살)
  flipdiv: [
    `<rect x="22" y="17" width="18" height="13" rx="4" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.2"/>
     <path d="M18 36 h26" stroke="#5E2470" stroke-width="2.6" stroke-linecap="round"/>
     <rect x="22" y="42" width="18" height="13" rx="4" fill="url(#mi-gp)" stroke="#7D2A93" stroke-width="1.2"/>
     <path d="M50 22 a15 15 0 0 1 0 28" fill="none" stroke="#9C36B5" stroke-width="2.6" stroke-linecap="round"/>
     <path d="M50 50 l6 -1 M50 50 l1.4 -6.2" stroke="#9C36B5" stroke-width="2.2" stroke-linecap="round"/>`,
    "",
  ],
  // 빼기 괄호는 전원 반전: −( ) 속 부호가 모두 뒤집힌다
  minusflip: [
    `<rect x="6" y="34" width="10" height="4" rx="2" fill="#E8434F"/>
     <path d="M24 20 q-8 16 0 32" fill="none" stroke="#7D2A93" stroke-width="2.4" stroke-linecap="round"/>
     <path d="M50 20 q8 16 0 32" fill="none" stroke="#7D2A93" stroke-width="2.4" stroke-linecap="round"/>
     <circle cx="31" cy="30" r="6.5" fill="url(#mi-bl)" stroke="#2558B8" stroke-width="1.2"/>
     <path d="M31 27 v6 M28 30 h6" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
     <circle cx="43" cy="44" r="6.5" fill="#F7D4D8" stroke="#C43A46" stroke-width="1.4"/>
     <path d="M40 44 h6" stroke="#C43A46" stroke-width="1.8" stroke-linecap="round"/>
     <path d="M37 32 q6 3 4.5 8" fill="none" stroke="#8A6E96" stroke-width="1.8" stroke-linecap="round"/>
     <path d="M41.5 40 l0.4 -4.4 M41.5 40 l-4.2 -1.4" stroke="#8A6E96" stroke-width="1.8" stroke-linecap="round"/>`,
    "",
  ],
  // (다항식)÷(단항식): 모든 항이 각자 나눗셈을 받는다
  divterm: [
    `<rect x="14" y="13" width="17" height="13" rx="4" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.2"/>
     <rect x="41" y="13" width="17" height="13" rx="4" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.2"/>
     <path d="M22.5 29 v7 M49.5 29 v7" stroke="#8A6E96" stroke-width="1.8" stroke-linecap="round"/>
     <circle cx="22.5" cy="45" r="8" fill="#FFFFFF" stroke="#7D2A93" stroke-width="1.5"/>
     <text x="22.5" y="50" text-anchor="middle" font-size="12" font-weight="800" fill="#7D2A93">÷</text>
     <circle cx="49.5" cy="45" r="8" fill="#FFFFFF" stroke="#8C5A12" stroke-width="1.5"/>
     <text x="49.5" y="50" text-anchor="middle" font-size="12" font-weight="800" fill="#8C5A12">÷</text>`,
    "",
  ],
  // 거꾸로 재기: 부피 식에서 빠진 모서리를 나눗셈으로 복원
  backlen: [
    `<path d="M18 30 L28 20 L54 20 L44 30 Z" fill="url(#mi-bd)" stroke="#7D2A93" stroke-width="1.4" stroke-linejoin="round"/>
     <path d="M44 30 L54 20 L54 42 L44 52 Z" fill="url(#mi-gp2)" stroke="#7D2A93" stroke-width="1.4" stroke-linejoin="round"/>
     <rect x="18" y="30" width="26" height="22" fill="#FFFFFF" stroke="#7D2A93" stroke-width="1.4"/>
     <path d="M18 30 V52" stroke="#E8A93E" stroke-width="2.6" stroke-dasharray="4 3" stroke-linecap="round"/>
     <text x="10" y="45" text-anchor="middle" font-size="12" font-weight="800" fill="#E8830E">?</text>`,
    "",
  ],
  // ── Ⅱ 보조 카드 글리프(캐러멜) ──
  // 해: 게이트를 통과해 참이 되는 값들(여러 개)
  truthset: [
    `<path d="M16 52 V28 M56 52 V28 M16 28 H56" fill="none" stroke="#7F4A12" stroke-width="3" stroke-linecap="round"/>
     <circle cx="27" cy="44" r="4.5" fill="url(#mi-bl)" stroke="#2558B8" stroke-width="1.1"/>
     <circle cx="36" cy="44" r="4.5" fill="url(#mi-bl)" stroke="#2558B8" stroke-width="1.1"/>
     <circle cx="45" cy="44" r="4.5" fill="url(#mi-bl)" stroke="#2558B8" stroke-width="1.1"/>
     <path d="M52 16 l3.5 3.5 6 -7" stroke="#0BA05F" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    "",
  ],
  // 유리한 선택: 경계 깃대를 넘어선 첫 지점부터 이득
  border: [
    `<line x1="8" y1="46" x2="62" y2="46" stroke="#8C6A3E" stroke-width="2.2" stroke-linecap="round"/>
     <line x1="34" y1="46" x2="34" y2="18" stroke="#A9631B" stroke-width="2.4"/>
     <path d="M34 18 h12 l-4 4.5 4 4.5 h-12 z" fill="#E8434F"/>
     <path d="M14 36 h26" stroke="url(#mi-am)" stroke-width="3.6" stroke-linecap="round"/>
     <path d="M46 36 l-6 -3.4 v6.8 z" fill="#E8A93E"/>
     <circle cx="46" cy="46" r="4.2" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.2"/>`,
    "",
  ],
  // 순서쌍 (x, y): 첫째 자리·둘째 자리의 순서가 생명
  opair: [
    `<path d="M18 20 q-8 16 0 32" fill="none" stroke="#7F4A12" stroke-width="2.6" stroke-linecap="round"/>
     <path d="M54 20 q8 16 0 32" fill="none" stroke="#7F4A12" stroke-width="2.6" stroke-linecap="round"/>
     <circle cx="29" cy="36" r="7" fill="url(#mi-bl)" stroke="#2558B8" stroke-width="1.3"/>
     <text x="29" y="40" text-anchor="middle" font-size="9.5" font-weight="800" fill="#FFFFFF">1</text>
     <circle cx="45" cy="36" r="7" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.3"/>
     <text x="45" y="40" text-anchor="middle" font-size="9.5" font-weight="800" fill="#5C3A00">2</text>
     <circle cx="37" cy="48" r="1.6" fill="#7F4A12"/>`,
    "",
  ],
  // 해의 검산: 두 관문을 모두 통과해야 진짜 해
  bothpass: [
    `<rect x="14" y="24" width="14" height="26" rx="4" fill="url(#mi-crm)" stroke="#7F4A12" stroke-width="1.6"/>
     <rect x="40" y="24" width="14" height="26" rx="4" fill="url(#mi-crm)" stroke="#7F4A12" stroke-width="1.6"/>
     <path d="M6 37 H62" stroke="#E8A93E" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round"/>
     <circle cx="60" cy="37" r="4.5" fill="url(#mi-bl)" stroke="#2558B8" stroke-width="1.2"/>
     <path d="M17 16 l2.6 2.6 4.6 -5.2 M43 16 l2.6 2.6 4.6 -5.2" stroke="#0BA05F" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    "",
  ],
  // 괄호째 꽂기: 식을 통째로 감싸 슬롯에 넣는다
  bracket: [
    `<rect x="16" y="12" width="40" height="16" rx="8" fill="url(#mi-crm)" stroke="#7F4A12" stroke-width="1.5"/>
     <path d="M27 16 q-3 4 0 8 M45 16 q3 4 0 8" fill="none" stroke="#7F4A12" stroke-width="1.8" stroke-linecap="round"/>
     <path d="M30 20 h12" stroke="#B08749" stroke-width="2" stroke-linecap="round"/>
     <path d="M36 31 v6 M33 34 l3 3.6 3 -3.6" fill="none" stroke="#8A6E96" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
     <rect x="20" y="42" width="32" height="18" rx="6" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.4"/>
     <rect x="27" y="46" width="18" height="10" rx="4" fill="none" stroke="#8C5A12" stroke-width="1.4" stroke-dasharray="3 3"/>`,
    "",
  ],
  // 확대경: 양변에 수를 곱해 계수의 절댓값을 맞춘다
  scale2: [
    `<circle cx="30" cy="30" r="17" fill="url(#mi-lens)" stroke="#5E6C78" stroke-width="2.6"/>
     <text x="30" y="35.5" text-anchor="middle" font-size="14" font-weight="800" fill="#A9631B">×3</text>
     <line x1="42" y1="43" x2="55" y2="56" stroke="#5E6C78" stroke-width="4.4" stroke-linecap="round"/>`,
    "",
  ],
  // 풀고, 반드시 확인: 답을 원래 식에 되넣어 검산
  verify: [
    `<rect x="16" y="10" width="36" height="15" rx="5" fill="url(#mi-crm)" stroke="#7F4A12" stroke-width="1.5"/>
     <path d="M22 17.5 h13 M40 17.5 h7" stroke="#B08749" stroke-width="2.2" stroke-linecap="round"/>
     <circle cx="30" cy="48" r="9" fill="url(#mi-am)" stroke="#8C5A12" stroke-width="1.4"/>
     <text x="30" y="52.5" text-anchor="middle" font-size="11" font-weight="800" fill="#5C3A00">3</text>
     <path d="M42 50 a15 15 0 0 0 12 -19" fill="none" stroke="#A9631B" stroke-width="2.4" stroke-linecap="round"/>
     <path d="M54 31 l-5 2 M54 31 l1 5.4" stroke="#A9631B" stroke-width="2.2" stroke-linecap="round"/>
     <path d="M56 14 l3 3 5 -6" stroke="#0BA05F" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    "",
  ],
};

/** recap 카드 미니아트 — calcMiniArt(key). Ⅰ: divide·cycle·denom·shift·pow·mono·poly·expand +
 *  보조 stop0·dots2·reduce·remcycle·twoface·powpow·powall·flipdiv·minusflip·divterm·backlen /
 *  Ⅱ: ineq·flip·range·cross·subst·elim + 보조 truthset·border·opair·bothpass·bracket·scale2·verify /
 *  Ⅲ: func·linear·shiftg·icept·slope·family·build·reveal·meet + 보조 fval·bshift·twopoints·
 *  downhill·parallel·axpair·coincide. 전 카드 미니아트 표준(2026-07-10). */
export function calcMiniArt(key: string): string {
  const m = MINI[key];
  if (!m) return "";
  return svg(
    "0 0 72 72",
    `<ellipse cx="36" cy="62" rx="20" ry="3.5" fill="#2A3A5E" opacity=".1"/>${m[0]}`,
    `<linearGradient id="mi-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6EAFA"/><stop offset="1" stop-color="#E3C4EC"/></linearGradient>
    <linearGradient id="mi-gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77BD6"/><stop offset="1" stop-color="#9C36B5"/></linearGradient>
    <linearGradient id="mi-gp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9CDF1"/><stop offset="1" stop-color="#D9B5E4"/></linearGradient>
    <linearGradient id="mi-am" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE7C0"/><stop offset="1" stop-color="#EDAF45"/></linearGradient>
    <radialGradient id="mi-gr" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7BE3AE"/><stop offset="1" stop-color="#0BA05F"/></radialGradient>
    <linearGradient id="mi-crm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3E4"/><stop offset="1" stop-color="#EDD9B4"/></linearGradient>
    <linearGradient id="mi-br2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98A3D"/><stop offset="1" stop-color="#8C5A1E"/></linearGradient>
    <radialGradient id="mi-bl" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7FA8F2"/><stop offset="1" stop-color="#2F6FE4"/></radialGradient>
    <linearGradient id="mi-tl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ECBA0"/><stop offset="1" stop-color="#0A8F67"/></linearGradient>
    <linearGradient id="mi-tl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DFF5EC"/><stop offset="1" stop-color="#A5E0CC"/></linearGradient>
    <linearGradient id="mi-rs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F58C9C"/><stop offset="1" stop-color="#D8465C"/></linearGradient>
    <radialGradient id="mi-lens" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F2FAFF"/><stop offset="1" stop-color="#CBE2F2"/></radialGradient>`,
  );
}

/* ── 중2 Ⅲ 범용 직선 그림(lineFig) ─────────────────────────────
   좌표평면은 mathKit planeSpec이 단일 진실 공급원(직접 축 그리기 금지 관례).
   lines: y=ax+b(또는 vert: x=m 세로선), dots: 강조점(+라벨), tri: 기울기 계단 세모.
   퀴즈 figure 전용 — 랩은 각 스텝 렌더러가 같은 planeSpec으로 직접 그린다. */
import { planeSpec } from "./mathKit";

export interface LineFigLine {
  a?: number;
  b?: number;
  vert?: number; // x=m 세로선(a·b 대신)
  color?: string;
  dash?: boolean;
  label?: string;
  lx?: number; // 라벨을 얹을 x 위치(기본 2.6)
}

export function lineFig(o: {
  lines: LineFigLine[];
  dots?: { x: number; y: number; color?: string; label?: string; below?: boolean }[];
  tri?: { x1: number; x2: number; a: number; b: number }; // 세모를 그릴 직선의 a·b와 가로 구간
  min?: number;
  max?: number;
}): string {
  const spec = planeSpec({ min: o.min ?? -5, max: o.max ?? 5, size: 260 });
  const PALETTE = ["#0CA678", "#E8608A", "#3D5BC0", "#E8A93E"];
  let g = "";
  o.lines.forEach((ln, i) => {
    const color = ln.color ?? PALETTE[i % PALETTE.length];
    if (ln.vert != null) {
      g += `<line x1="${spec.px(ln.vert)}" y1="${spec.py(spec.min - 0.6)}" x2="${spec.px(ln.vert)}" y2="${spec.py(spec.max + 0.6)}" stroke="${color}" stroke-width="3"${ln.dash ? ' stroke-dasharray="7 5"' : ""} stroke-linecap="round"/>`;
      if (ln.label)
        g += `<text x="${spec.px(ln.vert) + 7}" y="${spec.py(spec.max - 0.8)}" font-size="11" font-weight="800" font-style="italic" fill="${color}">${ln.label}</text>`;
      return;
    }
    const a = ln.a ?? 1;
    const b = ln.b ?? 0;
    const t = spec.max + 1.2;
    g += `<line x1="${spec.px(-t)}" y1="${spec.py(a * -t + b)}" x2="${spec.px(t)}" y2="${spec.py(a * t + b)}" stroke="${color}" stroke-width="3"${ln.dash ? ' stroke-dasharray="7 5"' : ""} stroke-linecap="round"/>`;
    if (ln.label) {
      const lx = ln.lx ?? 2.6;
      g += `<text x="${spec.px(lx)}" y="${spec.py(a * lx + b) + (a >= 0 ? -9 : 15)}" font-size="11" font-weight="800" font-style="italic" fill="${color}">${ln.label}</text>`;
    }
  });
  if (o.tri) {
    const { x1, x2, a, b } = o.tri;
    const cx = spec.px(x2);
    const cy = spec.py(a * x1 + b);
    const run = x2 - x1;
    const rise = a * (x2 - x1);
    g +=
      `<line x1="${spec.px(x1)}" y1="${cy}" x2="${cx}" y2="${cy}" stroke="#E8A93E" stroke-width="2.2" stroke-dasharray="5 4"/>` +
      `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${spec.py(a * x2 + b)}" stroke="${rise >= 0 ? "#0DA5C6" : "#E8608A"}" stroke-width="2.2" stroke-dasharray="5 4"/>` +
      `<text x="${(spec.px(x1) + cx) / 2}" y="${cy + 15}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#B87708">+${run}</text>` +
      `<text x="${cx + 6}" y="${(cy + spec.py(a * x2 + b)) / 2 + 4}" font-size="10.5" font-weight="900" fill="${rise >= 0 ? "#0B7285" : "#C2255C"}">${rise >= 0 ? "+" + rise : "−" + Math.abs(rise)}</text>`;
  }
  for (const d of o.dots ?? []) {
    const color = d.color ?? "#E8A93E";
    g += `<circle cx="${spec.px(d.x)}" cy="${spec.py(d.y)}" r="5" fill="${color}" stroke="#4A3208" stroke-width="1.2" opacity=".95"/>`;
    if (d.label)
      g += `<text x="${spec.px(d.x) + 8}" y="${spec.py(d.y) + (d.below ? 15 : -8)}" font-size="10.5" font-weight="900" fill="#334155">${d.label}</text>`;
  }
  return svg(spec.vb, spec.grid + g);
}
