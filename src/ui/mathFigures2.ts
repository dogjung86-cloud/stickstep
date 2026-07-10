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

/* ════════════════════════════════════════════════════════════
   중2 Ⅳ 삼각형과 사각형의 성질 — 퀴즈·concept 그림 + proveMiniArt
   기하 원소는 geoKit(각 호·직각 표시·틱·점 라벨)만 사용, 좌표는 전부 계산.
   팔레트: 코발트 #1971C2(진한 #12579B), 보조 앰버 #E8A93E·시안 #0DA5C6·로즈 #E8547E.
   ════════════════════════════════════════════════════════════ */
import { angleArc, rightMark, tickMark, dot as gdot, ptLabel, angleOf, normDeg, polar, arrowHead } from "./geoKit";

const P4 = { main: "#1971C2", deep: "#12579B", fill: "#D9E9F9", amber: "#E8A93E", cyan: "#0DA5C6", rose: "#E8547E", ink: "#334155" } as const;

/** 세 꼭짓점 path. */
const triPath = (a: [number, number], b: [number, number], c: [number, number], fill: string = P4.fill): string =>
  `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} Z" fill="${fill}" stroke="${P4.deep}" stroke-width="2.2" stroke-linejoin="round"/>`;

/** 꼭짓점 p에서 p1·p2로 벌어진 내각 호(항상 짧은 쪽). */
function arcIn(p: [number, number], p1: [number, number], p2: [number, number], color: string, label?: string, r = 22): string {
  const a1 = angleOf(p[0], p[1], p1[0], p1[1]);
  const a2 = angleOf(p[0], p[1], p2[0], p2[1]);
  return normDeg(a2 - a1) <= 180
    ? angleArc(p[0], p[1], r, a1, a2, color, label)
    : angleArc(p[0], p[1], r, a2, a1, color, label);
}

/* ── L1 isoPropFig: 이등변삼각형의 성질 도해(밑각 같음 + 꼭지각 이등분선의 수직이등분) ── */
export function isoPropFig(): string {
  const A: [number, number] = [180, 34];
  const B: [number, number] = [84, 172];
  const C: [number, number] = [276, 172];
  const D: [number, number] = [180, 172];
  return svg(
    "0 0 360 208",
    `<ellipse cx="180" cy="192" rx="120" ry="6" fill="#2A3A5E" opacity=".08"/>` +
      triPath(A, B, C) +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${D[0]}" y2="${D[1]}" stroke="${P4.rose}" stroke-width="2.2" stroke-dasharray="6 4"/>` +
      tickMark(A[0], A[1], B[0], B[1], 1, P4.main) + tickMark(A[0], A[1], C[0], C[1], 1, P4.main) +
      arcIn(B, A, C, P4.amber) + arcIn(C, B, A, P4.amber) +
      angleArc(A[0], A[1], 20, 235, 270, P4.rose) + angleArc(A[0], A[1], 20, 270, 305, P4.rose) +
      rightMark(D[0], D[1], 90, 10, P4.rose) +
      tickMark(B[0], B[1], D[0], D[1], 2, P4.cyan) + tickMark(D[0], D[1], C[0], C[1], 2, P4.cyan) +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(D[0], D[1], P4.rose, 3.2) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 14) + ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(D[0], D[1], "D", 0, 17, "#C2255C"),
  );
}

/* ── L1 isoExtFig: 외각 문제(C의 외각 112° → 밑각 68° → 꼭지각 x=44°) ── */
export function isoExtFig(): string {
  const A: [number, number] = [150, 34];
  const B: [number, number] = [64, 168];
  const C: [number, number] = [236, 168];
  const E: [number, number] = [318, 168];
  return svg(
    "0 0 360 204",
    `<ellipse cx="180" cy="190" rx="130" ry="6" fill="#2A3A5E" opacity=".08"/>` +
      `<line x1="${C[0]}" y1="${C[1]}" x2="${E[0]}" y2="${E[1]}" stroke="#8093A8" stroke-width="2" stroke-dasharray="6 4"/>` +
      triPath(A, B, C) +
      tickMark(A[0], A[1], B[0], B[1], 1, P4.main) + tickMark(A[0], A[1], C[0], C[1], 1, P4.main) +
      arcIn(A, B, C, P4.rose, "x") +
      arcIn(C, A, E, P4.amber, "112°", 24) +
      gdot(...A) + gdot(...B) + gdot(...C) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 14) + ptLabel(C[0], C[1], "C", 0, 17),
  );
}

/* ── L2 foldIsoFig: 종이 띠 접기 → 겹침 삼각형(접은 각 ●=엇각 ● → 이등변) ── */
export function foldIsoFig(): string {
  const x0 = 96;
  const spread = 128;
  const x1 = x0 + spread;
  return svg(
    "0 0 360 200",
    `<ellipse cx="180" cy="184" rx="130" ry="6" fill="#2A3A5E" opacity=".08"/>` +
      `<rect x="24" y="66" width="312" height="54" rx="6" fill="url(#fi-strip)" stroke="#B8925C" stroke-width="1.6"/>` +
      `<rect x="24" y="70" width="312" height="7" fill="#fff" opacity=".35"/>` +
      `<path d="M${x0} 66 L${x0} 120 L${x1} 120 Z" fill="url(#fi-fold)" stroke="#0F4674" stroke-width="2" stroke-linejoin="round" opacity=".94"/>` +
      `<path d="M${x0} 66 L${x1} 120" stroke="#0F4674" stroke-width="1.4" stroke-dasharray="4 3" opacity=".5"/>` +
      angleArc(x0, 120, 17, 0, Math.round((Math.atan2(54, spread) * 180) / Math.PI) + 90 - 90 + 23, P4.amber, "●", { labelR: 26 }) +
      angleArc(x1, 120, 17, 180 - 23, 180, P4.cyan, "○", { labelR: 26 }) +
      angleArc(x1, 120, 30, 157, 180, P4.cyan) +
      `<text x="${x0 + spread / 2}" y="152" text-anchor="middle" font-size="12" font-weight="800" fill="#12579B">접은 각 ● 와 엇갈린 위치의 각 ○</text>`,
    `<linearGradient id="fi-strip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCEFD8"/><stop offset=".5" stop-color="#F2DDB4"/><stop offset="1" stop-color="#E3C68E"/></linearGradient>
    <linearGradient id="fi-fold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A9CDF2"/><stop offset=".55" stop-color="#5CA4E8"/><stop offset="1" stop-color="#2B79C0"/></linearGradient>`,
  );
}

/* ── L3 rhaRhsFig: 직각삼각형 합동 조건 2종 도해(빗변+예각 / 빗변+다른 한 변) ── */
export function rhaRhsFig(): string {
  const one = (ox: number, kind: "rha" | "rhs"): string => {
    const C: [number, number] = [ox, 150];
    const B: [number, number] = [ox + 118, 150];
    const A: [number, number] = [ox, 66];
    return (
      triPath(A, B, C) +
      rightMark(C[0], C[1], 0, 11, P4.ink) +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${P4.main}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<text x="${(A[0] + B[0]) / 2 + 10}" y="${(A[1] + B[1]) / 2 - 8}" font-size="10.5" font-weight="900" fill="${P4.deep}">빗변</text>` +
      (kind === "rha"
        ? arcIn(B, A, C, P4.amber, "예각")
        : `<line x1="${C[0]}" y1="${C[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${P4.cyan}" stroke-width="3.4" stroke-linecap="round"/>` +
          `<text x="${(C[0] + B[0]) / 2}" y="${C[1] + 16}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#0B7285">다른 한 변</text>`)
    );
  };
  return svg(
    "0 0 360 200",
    `<ellipse cx="180" cy="184" rx="130" ry="6" fill="#2A3A5E" opacity=".08"/>` +
      one(36, "rha") + one(206, "rhs") +
      `<text x="95" y="38" text-anchor="middle" font-size="12.5" font-weight="900" fill="#12579B">RHA: 빗변 + 한 예각</text>` +
      `<text x="265" y="38" text-anchor="middle" font-size="12.5" font-weight="900" fill="#0B7285">RHS: 빗변 + 다른 한 변</text>`,
  );
}

/* ── L3 rhPairsFig: 합동 짝 찾기 4형제 (가)빗8·40° (나)빗8·변5 (다)빗8·50°(나머지 40°) (라)변5·40° ── */
export function rhPairsFig(): string {
  const one = (ox: number, oy: number, tag: string, hyp: boolean, angLabel: string, sideLabel: string, angAtTop = false): string => {
    const C: [number, number] = [ox, oy];
    const B: [number, number] = [ox + 92, oy];
    const A: [number, number] = [ox, oy - 62];
    let g = triPath(A, B, C, "#EAF3FC") + rightMark(C[0], C[1], 0, 9, P4.ink);
    if (hyp)
      g +=
        `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${P4.main}" stroke-width="3" stroke-linecap="round"/>` +
        `<text x="${(A[0] + B[0]) / 2 + 8}" y="${(A[1] + B[1]) / 2 - 6}" font-size="10.5" font-weight="900" fill="${P4.deep}">8</text>`;
    if (angLabel) g += angAtTop ? arcIn(A, C, B, P4.amber, angLabel, 16) : arcIn(B, A, C, P4.amber, angLabel, 20);
    if (sideLabel)
      g +=
        `<line x1="${C[0]}" y1="${C[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${P4.cyan}" stroke-width="3" stroke-linecap="round"/>` +
        `<text x="${(C[0] + B[0]) / 2}" y="${C[1] + 15}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#0B7285">${sideLabel}</text>`;
    g += `<text x="${ox + 40}" y="${oy + 32}" text-anchor="middle" font-size="12" font-weight="900" fill="#334155">${tag}</text>`;
    return g;
  };
  return svg(
    "0 0 360 250",
    one(34, 92, "(가)", true, "40°", "") +
      one(226, 92, "(나)", true, "", "5") +
      one(34, 210, "(다)", true, "50°", "") +
      one(226, 210, "(라)", false, "40°", "5"),
  );
}

/* ── L4 rightCircumFig: 직각삼각형의 외접원(외심 = 빗변의 중점, 빗변 12 → r 6) ── */
export function rightCircumFig(): string {
  const B: [number, number] = [96, 60];
  const C: [number, number] = [96, 168];
  const A: [number, number] = [252, 168];
  const O: [number, number] = [(B[0] + A[0]) / 2, (B[1] + A[1]) / 2];
  const r = Math.hypot(A[0] - O[0], A[1] - O[1]);
  return svg(
    "0 0 360 234",
    `<circle cx="${O[0]}" cy="${O[1]}" r="${r.toFixed(1)}" stroke="${P4.main}" stroke-width="2.4" fill="rgba(25,113,194,.05)"/>` +
      triPath(A, B, C) +
      rightMark(C[0], C[1], 0, 11, P4.ink) +
      `<line x1="${B[0]}" y1="${B[1]}" x2="${A[0]}" y2="${A[1]}" stroke="${P4.amber}" stroke-width="3" stroke-linecap="round"/>` +
      `<text x="${O[0] + 4}" y="${O[1] - 32}" font-size="12" font-weight="900" fill="#B26200">빗변 12 cm</text>` +
      tickMark(B[0], B[1], O[0], O[1], 1, P4.rose) + tickMark(O[0], O[1], A[0], A[1], 1, P4.rose) +
      gdot(O[0], O[1], P4.rose, 4.5) + ptLabel(O[0], O[1], "O", 12, 14, "#C2255C") +
      gdot(...A) + gdot(...B) + gdot(...C) +
      ptLabel(A[0], A[1], "A", 12, 5) + ptLabel(B[0], B[1], "B", -4, -10) + ptLabel(C[0], C[1], "C", -12, 12),
  );
}

/* ── L4 circumAngleFig: 외심 각 유도(∠OBA=24°, ∠OCA=36° → ∠BAC=60°) ── */
export function circumAngleFig(): string {
  const A: [number, number] = [176, 36];
  const B: [number, number] = [62, 186];
  const C: [number, number] = [300, 172];
  // 외심 계산
  const d = 2 * (A[0] * (B[1] - C[1]) + B[0] * (C[1] - A[1]) + C[0] * (A[1] - B[1]));
  const ux = ((A[0] ** 2 + A[1] ** 2) * (B[1] - C[1]) + (B[0] ** 2 + B[1] ** 2) * (C[1] - A[1]) + (C[0] ** 2 + C[1] ** 2) * (A[1] - B[1])) / d;
  const uy = ((A[0] ** 2 + A[1] ** 2) * (C[0] - B[0]) + (B[0] ** 2 + B[1] ** 2) * (A[0] - C[0]) + (C[0] ** 2 + C[1] ** 2) * (B[0] - A[0])) / d;
  const O: [number, number] = [ux, uy];
  return svg(
    "0 0 360 224",
    triPath(A, B, C) +
      `<line x1="${O[0]}" y1="${O[1]}" x2="${A[0]}" y2="${A[1]}" stroke="#8FB6DC" stroke-width="1.8" stroke-dasharray="5 4"/>` +
      `<line x1="${O[0]}" y1="${O[1]}" x2="${B[0]}" y2="${B[1]}" stroke="#8FB6DC" stroke-width="1.8" stroke-dasharray="5 4"/>` +
      `<line x1="${O[0]}" y1="${O[1]}" x2="${C[0]}" y2="${C[1]}" stroke="#8FB6DC" stroke-width="1.8" stroke-dasharray="5 4"/>` +
      arcIn(B, O, A, P4.amber, "24°", 24) +
      arcIn(C, A, O, P4.cyan, "36°", 24) +
      arcIn(A, B, C, P4.rose, "x", 20) +
      gdot(O[0], O[1], "#C2255C", 4) + ptLabel(O[0], O[1], "O", 0, 18, "#C2255C") +
      gdot(...A) + gdot(...B) + gdot(...C) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 13) + ptLabel(C[0], C[1], "C", 12, 12),
  );
}

/* ── L5 incenterAngleFig: 내심 각 유도(∠IBA=26°, ∠ICA=33° → ∠BAC=x) ── */
export function incenterAngleFig(): string {
  const A: [number, number] = [168, 34];
  const B: [number, number] = [58, 188];
  const C: [number, number] = [304, 176];
  const a = Math.hypot(B[0] - C[0], B[1] - C[1]);
  const b = Math.hypot(A[0] - C[0], A[1] - C[1]);
  const c = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const I: [number, number] = [(a * A[0] + b * B[0] + c * C[0]) / (a + b + c), (a * A[1] + b * B[1] + c * C[1]) / (a + b + c)];
  return svg(
    "0 0 360 224",
    triPath(A, B, C) +
      `<line x1="${I[0]}" y1="${I[1]}" x2="${A[0]}" y2="${A[1]}" stroke="#8FB6DC" stroke-width="1.8" stroke-dasharray="5 4"/>` +
      `<line x1="${I[0]}" y1="${I[1]}" x2="${B[0]}" y2="${B[1]}" stroke="#8FB6DC" stroke-width="1.8" stroke-dasharray="5 4"/>` +
      `<line x1="${I[0]}" y1="${I[1]}" x2="${C[0]}" y2="${C[1]}" stroke="#8FB6DC" stroke-width="1.8" stroke-dasharray="5 4"/>` +
      arcIn(B, A, I, P4.amber, "26°", 24) + arcIn(B, I, C, P4.amber, "●", 38) +
      arcIn(C, I, A, P4.cyan, "33°", 24) + arcIn(C, B, I, P4.cyan, "○", 40) +
      arcIn(A, B, C, P4.rose, "x", 20) +
      gdot(I[0], I[1], "#C2255C", 4) + ptLabel(I[0], I[1], "I", 0, 18, "#C2255C") +
      gdot(...A) + gdot(...B) + gdot(...C) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 13) + ptLabel(C[0], C[1], "C", 12, 12),
  );
}

/* ── L6 paraXYFig: 평행사변형 x·y(AB=7, AD=9, ∠A=105° → x=BC=9, y=∠B=75°) ── */
export function paraXYFig(): string {
  const B: [number, number] = [58, 172];
  const C: [number, number] = [258, 172];
  const A: [number, number] = [108, 62];
  const D: [number, number] = [A[0] + (C[0] - B[0]), A[1]];
  return svg(
    "0 0 360 210",
    `<path d="M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} L${D[0]} ${D[1]} Z" fill="${P4.fill}" stroke="${P4.deep}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<text x="${(A[0] + B[0]) / 2 - 16}" y="${(A[1] + B[1]) / 2 + 4}" font-size="12.5" font-weight="900" fill="#334155">7 cm</text>` +
      `<text x="${(A[0] + D[0]) / 2}" y="${A[1] - 10}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#334155">9 cm</text>` +
      `<text x="${(B[0] + C[0]) / 2}" y="${B[1] + 20}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#C2255C">x cm</text>` +
      arcIn(A, B, D, P4.amber, "105°", 22) +
      arcIn(B, C, A, P4.rose, "y°", 22) +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(...D) +
      ptLabel(A[0], A[1], "A", -10, -8) + ptLabel(B[0], B[1], "B", -11, 14) + ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(D[0], D[1], "D", 11, -8),
  );
}

/* ── L7 trapCounterFig: 함정 조건의 반례(AD∥BC + AB=DC인데 평행사변형이 아닌 사다리꼴) ── */
export function trapCounterFig(): string {
  const A: [number, number] = [124, 66];
  const D: [number, number] = [236, 66];
  const B: [number, number] = [64, 168];
  const C: [number, number] = [296, 168];
  return svg(
    "0 0 360 206",
    `<path d="M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} L${D[0]} ${D[1]} Z" fill="#FDF0F3" stroke="#C2255C" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M${(A[0] + D[0]) / 2 - 8} ${A[1] - 8} l8 4 l-8 4" stroke="${P4.main}" stroke-width="2" fill="none"/>` +
      `<path d="M${(B[0] + C[0]) / 2 - 8} ${B[1] + 6} l8 4 l-8 4" stroke="${P4.main}" stroke-width="2" fill="none"/>` +
      tickMark(A[0], A[1], B[0], B[1], 1, P4.cyan) + tickMark(D[0], D[1], C[0], C[1], 1, P4.cyan) +
      `<text x="180" y="40" text-anchor="middle" font-size="12" font-weight="800" fill="#12579B">AD ∥ BC (평행)</text>` +
      `<text x="180" y="196" text-anchor="middle" font-size="12" font-weight="800" fill="#0B7285">AB = DC (다른 쌍의 길이)</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(...D) +
      ptLabel(A[0], A[1], "A", -10, -8) + ptLabel(B[0], B[1], "B", -11, 14) + ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(D[0], D[1], "D", 11, -8),
  );
}

/* ── L8 rectDiagFig: 직사각형 대각선(OA=5cm → 나머지·BD 유도) ── */
export function rectDiagFig(): string {
  const A: [number, number] = [70, 60];
  const B: [number, number] = [70, 168];
  const C: [number, number] = [290, 168];
  const D: [number, number] = [290, 60];
  const O: [number, number] = [180, 114];
  return svg(
    "0 0 360 206",
    `<path d="M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} L${D[0]} ${D[1]} Z" fill="${P4.fill}" stroke="${P4.deep}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${C[0]}" y2="${C[1]}" stroke="${P4.main}" stroke-width="2.2"/>` +
      `<line x1="${B[0]}" y1="${B[1]}" x2="${D[0]}" y2="${D[1]}" stroke="${P4.rose}" stroke-width="2.2"/>` +
      `<text x="${(A[0] + O[0]) / 2 - 12}" y="${(A[1] + O[1]) / 2 - 6}" font-size="12.5" font-weight="900" fill="${P4.deep}">5 cm</text>` +
      gdot(O[0], O[1], P4.ink, 4) + ptLabel(O[0], O[1], "O", 2, -10) +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(...D) +
      ptLabel(A[0], A[1], "A", -11, -6) + ptLabel(B[0], B[1], "B", -11, 14) + ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(D[0], D[1], "D", 11, -6),
  );
}

/* ── L8 rhombusDiagFig: 마름모 대각선(수직 + ∠ABO=32° → x=∠BAO) ── */
export function rhombusDiagFig(): string {
  const A: [number, number] = [180, 42];
  const B: [number, number] = [84, 118];
  const C: [number, number] = [180, 194];
  const D: [number, number] = [276, 118];
  const O: [number, number] = [180, 118];
  return svg(
    "0 0 360 226",
    `<path d="M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} L${D[0]} ${D[1]} Z" fill="${P4.fill}" stroke="${P4.deep}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${C[0]}" y2="${C[1]}" stroke="${P4.main}" stroke-width="2"/>` +
      `<line x1="${B[0]}" y1="${B[1]}" x2="${D[0]}" y2="${D[1]}" stroke="${P4.rose}" stroke-width="2"/>` +
      rightMark(O[0], O[1], 90, 10, "#C2255C") +
      arcIn(B, A, O, P4.amber, "32°", 26) +
      arcIn(A, O, B, P4.cyan, "x", 26) +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(...D) + gdot(O[0], O[1], P4.ink, 3.4) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -12, 5) + ptLabel(C[0], C[1], "C", 0, 18) + ptLabel(D[0], D[1], "D", 12, 5) + ptLabel(O[0], O[1], "O", 12, 14),
  );
}

/* ── L9 quadTreeFig: 사각형 가족 관계 계단(빈칸 퀴즈 겸용: blank ㉠=평사→직사 조건) ── */
export function quadTreeFig(blank = false): string {
  const node = (x: number, y: number, w: number, label: string): string =>
    `<rect x="${x - w / 2}" y="${y - 15}" width="${w}" height="30" rx="10" fill="url(#qt-node)" stroke="#12579B" stroke-width="1.6"/>` +
    `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#12579B">${label}</text>`;
  const arrow = (x1: number, y1: number, x2: number, y2: number, label: string, hi = false): string => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    return (
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hi ? "#C2255C" : "#8FB6DC"}" stroke-width="2"/>` +
      `<path d="M${x2} ${y2} l-5 -8 l9 -1 z" fill="${hi ? "#C2255C" : "#8FB6DC"}"/>` +
      (label
        ? `<rect x="${mx - 52}" y="${my - 12}" width="104" height="21" rx="8" fill="#FFFFFF" stroke="${hi ? "#C2255C" : "#C9DCEF"}" stroke-width="1.2"/>` +
          `<text x="${mx}" y="${my + 3}" text-anchor="middle" font-size="10" font-weight="800" fill="${hi ? "#C2255C" : "#5A6B7E"}">${label}</text>`
        : "")
    );
  };
  return svg(
    "0 0 360 322",
    node(180, 24, 96, "사각형") +
      arrow(180, 39, 180, 74, "한 쌍의 대변이 평행") +
      node(180, 90, 104, "사다리꼴") +
      arrow(180, 105, 180, 140, "다른 쌍도 평행") +
      node(180, 156, 124, "평행사변형") +
      arrow(126, 168, 92, 216, blank ? "㉠ ?" : "한 내각이 직각", blank) +
      arrow(234, 168, 268, 216, "이웃하는 두 변이 같음") +
      node(92, 232, 104, "직사각형") +
      node(268, 232, 96, "마름모") +
      arrow(112, 247, 158, 288, "이웃하는 두 변이 같음") +
      arrow(248, 247, 202, 288, "한 내각이 직각") +
      node(180, 304, 104, "정사각형"),
    `<linearGradient id="qt-node" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E7F1FB"/></linearGradient>`,
  );
}

/* ── L10 areaParaFig: 평행선 사이 삼각형(밑변 공통 BC, △ABC=15cm² → △DBC=?) ── */
export function areaParaFig(): string {
  const l = 54;
  const m = 168;
  const A: [number, number] = [104, l];
  const Dp: [number, number] = [252, l];
  const B: [number, number] = [88, m];
  const C: [number, number] = [212, m];
  return svg(
    "0 0 360 206",
    `<line x1="26" y1="${l}" x2="334" y2="${l}" stroke="#8093A8" stroke-width="2"/>` +
      `<line x1="26" y1="${m}" x2="334" y2="${m}" stroke="#8093A8" stroke-width="2"/>` +
      `<text x="342" y="${l + 4}" font-size="12" font-style="italic" font-weight="800" fill="#5A6B7E">l</text>` +
      `<text x="340" y="${m + 4}" font-size="12" font-style="italic" font-weight="800" fill="#5A6B7E">m</text>` +
      `<path d="M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z" fill="rgba(25,113,194,.13)" stroke="${P4.main}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M${Dp[0]} ${Dp[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z" fill="rgba(232,84,126,.1)" stroke="${P4.rose}" stroke-width="2.2" stroke-dasharray="7 4" stroke-linejoin="round"/>` +
      `<text x="${A[0] - 2}" y="${A[1] - 10}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#12579B">A</text>` +
      `<text x="${Dp[0]}" y="${Dp[1] - 10}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#C2255C">D</text>` +
      ptLabel(B[0], B[1], "B", -10, 16) + ptLabel(C[0], C[1], "C", 8, 16) +
      `<text x="134" y="142" font-size="11.5" font-weight="900" fill="#12579B">15 cm²</text>` +
      `<text x="206" y="112" font-size="11.5" font-weight="900" fill="#C2255C">?</text>`,
  );
}

/* ── L10 trapAreaFig: 사다리꼴 대각선 넓이(△ABC=24, △OBC=15 → △DOC=9) ── */
export function trapAreaFig(): string {
  const A: [number, number] = [118, 56];
  const D: [number, number] = [252, 56];
  const B: [number, number] = [58, 172];
  const C: [number, number] = [308, 172];
  // 대각선 AC·BD 교점
  const O: [number, number] = (() => {
    const d1x = C[0] - A[0];
    const d1y = C[1] - A[1];
    const d2x = D[0] - B[0];
    const d2y = D[1] - B[1];
    const t = ((B[0] - A[0]) * d2y - (B[1] - A[1]) * d2x) / (d1x * d2y - d1y * d2x);
    return [A[0] + d1x * t, A[1] + d1y * t];
  })();
  return svg(
    "0 0 360 210",
    `<path d="M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} L${D[0]} ${D[1]} Z" fill="${P4.fill}" stroke="${P4.deep}" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M${(A[0] + D[0]) / 2 - 8} ${A[1] - 9} l8 4 l-8 4" stroke="${P4.main}" stroke-width="1.8" fill="none"/>` +
      `<path d="M${(B[0] + C[0]) / 2 - 8} ${B[1] + 5} l8 4 l-8 4" stroke="${P4.main}" stroke-width="1.8" fill="none"/>` +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${C[0]}" y2="${C[1]}" stroke="${P4.main}" stroke-width="2"/>` +
      `<line x1="${B[0]}" y1="${B[1]}" x2="${D[0]}" y2="${D[1]}" stroke="${P4.rose}" stroke-width="2"/>` +
      gdot(O[0], O[1], P4.ink, 3.6) + ptLabel(O[0], O[1], "O", 0, -10) +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(...D) +
      ptLabel(A[0], A[1], "A", -10, -8) + ptLabel(B[0], B[1], "B", -11, 14) + ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(D[0], D[1], "D", 11, -8),
  );
}

/* ── proveMiniArt: 중2 Ⅳ recap 미니아트(코발트 팔레트, 72×72) ── */
const MINI4: Record<string, string> = {
  proof: `<rect x="20" y="12" width="30" height="12" rx="5" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.4"/>
    <path d="M24 24 h22 l3 12 h-28 z" fill="url(#m4-deep)" stroke="#0F4674" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="14" y="42" width="42" height="14" rx="4" fill="url(#m4-paper)" stroke="#B8C6D6" stroke-width="1.2"/>
    <path d="M28 49 l4 4 8 -9" stroke="#1971C2" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  iso: `<path d="M36 14 L14 52 L58 52 Z" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M36 14 L36 52" stroke="#C2255C" stroke-width="1.6" stroke-dasharray="4 3"/>
    <path d="M20.5 45 A11 11 0 0 1 23 52" stroke="#E8A93E" stroke-width="2.4" fill="none"/>
    <path d="M51.5 45 A11 11 0 0 0 49 52" stroke="#E8A93E" stroke-width="2.4" fill="none"/>`,
  isoCond: `<path d="M36 16 L16 50 L56 50 Z" fill="none" stroke="#0F4674" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M22 44 A10 10 0 0 1 24.5 50" stroke="#E8A93E" stroke-width="2.6" fill="none"/>
    <path d="M50 44 A10 10 0 0 0 47.5 50" stroke="#E8A93E" stroke-width="2.6" fill="none"/>
    <path d="M28 30 h16 M28 34 h16" stroke="#1971C2" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M40 24 l6 8 -6 8" stroke="#04B45F" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="translate(-14 0)"/>`,
  rh: `<path d="M14 52 L14 22 L48 52 Z" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M14 46 h6 v6" stroke="#33475C" stroke-width="1.6" fill="none"/>
    <line x1="14" y1="22" x2="48" y2="52" stroke="#1971C2" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 18 a9 9 0 0 1 9 9" stroke="#E8A93E" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  ccenter: `<circle cx="36" cy="35" r="21" stroke="#1971C2" stroke-width="2.2" fill="rgba(25,113,194,.07)"/>
    <path d="M36 16 L20 44 L54 41 Z" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="36" cy="34.5" r="2.6" fill="#E8A93E" stroke="#9C5A10" stroke-width="1"/>`,
  icenter: `<path d="M36 12 L14 54 L60 50 Z" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.7" stroke-linejoin="round"/>
    <circle cx="37" cy="41" r="12.5" fill="rgba(255,255,255,.75)" stroke="#E8547E" stroke-width="2.2"/>
    <circle cx="37" cy="41" r="2.4" fill="#C2255C"/>`,
  para: `<path d="M22 22 L12 50 L50 50 L60 22 Z" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M46 14 a16 16 0 0 1 10 14 l-5 -3 m5 3 l2 -5" stroke="#E8A93E" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="36" cy="36" r="2.4" fill="#C2255C"/>`,
  keys: `<circle cx="24" cy="26" r="9" fill="none" stroke="#E8A93E" stroke-width="3"/>
    <path d="M31 33 L48 50 M42 44 l5 -5 M46 52 l5 -5" stroke="#E8A93E" stroke-width="3" stroke-linecap="round"/>
    <path d="M16 52 l8 -8 M14 44 l4 -4" stroke="#1971C2" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`,
  diag: `<path d="M18 20 L54 52 M54 20 L18 52" stroke="#1971C2" stroke-width="3" stroke-linecap="round"/>
    <path d="M18 20 L54 20 L54 52 L18 52 Z" stroke="#8FB6DC" stroke-width="1.6" fill="none" stroke-dasharray="4 3"/>
    <circle cx="36" cy="36" r="3" fill="#E8A93E" stroke="#9C5A10" stroke-width="1"/>`,
  family: `<rect x="26" y="10" width="20" height="10" rx="4" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.3"/>
    <rect x="12" y="30" width="20" height="10" rx="4" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.3"/>
    <rect x="40" y="30" width="20" height="10" rx="4" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.3"/>
    <rect x="26" y="50" width="20" height="10" rx="4" fill="url(#m4-gold)" stroke="#9C5A10" stroke-width="1.3"/>
    <path d="M32 20 L24 30 M40 20 L48 30 M24 40 L32 50 M48 40 L40 50" stroke="#8FB6DC" stroke-width="1.8"/>`,
  area: `<line x1="10" y1="18" x2="62" y2="18" stroke="#8093A8" stroke-width="2"/>
    <line x1="10" y1="54" x2="62" y2="54" stroke="#8093A8" stroke-width="2"/>
    <path d="M22 18 L14 54 L38 54 Z" fill="rgba(25,113,194,.2)" stroke="#1971C2" stroke-width="2"/>
    <path d="M52 18 L34 54 L58 54 Z" fill="rgba(232,84,126,.14)" stroke="#E8547E" stroke-width="2" stroke-dasharray="5 3"/>
    <path d="M28 12 h14 l-4 -3 m4 3 l-4 3" stroke="#E8A93E" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  compare: `<circle cx="26" cy="34" r="17" fill="none" stroke="#1971C2" stroke-width="2.2"/>
    <path d="M26 20 L14 42 L39 42 Z" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M46 22 L34 48 L62 46 Z" fill="none" stroke="#0F4674" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="47" cy="41" r="7.5" fill="rgba(232,84,126,.15)" stroke="#E8547E" stroke-width="2"/>
    <circle cx="26" cy="34" r="2" fill="#1971C2"/><circle cx="47" cy="41" r="2" fill="#C2255C"/>`,
  adj: `<path d="M22 20 L12 50 L46 50 L56 20 Z" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="20" cy="44" r="8" fill="none" stroke="#E8A93E" stroke-width="2.6" stroke-dasharray="12.6 38" transform="rotate(-90 20 44)"/>
    <circle cx="26" cy="26" r="8" fill="none" stroke="#0DA5C6" stroke-width="2.6" stroke-dasharray="21 30" transform="rotate(72 26 26)"/>
    <path d="M14 14 q10 -6 20 0" stroke="#C2255C" stroke-width="2" fill="none" stroke-dasharray="4 3" stroke-linecap="round" transform="translate(9 46)"/>`,
  rect: `<rect x="12" y="20" width="48" height="32" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.8"/>
    <line x1="12" y1="20" x2="60" y2="52" stroke="#1971C2" stroke-width="2.4"/>
    <line x1="60" y1="20" x2="12" y2="52" stroke="#E8547E" stroke-width="2.4"/>
    <line x1="21" y1="30" x2="27" y2="21" stroke="#1971C2" stroke-width="2" stroke-linecap="round"/>
    <line x1="45" y1="30" x2="51" y2="21" stroke="#E8547E" stroke-width="2" stroke-linecap="round"/>
    <circle cx="36" cy="36" r="2.6" fill="#E8A93E" stroke="#9C5A10" stroke-width="1"/>`,
  kite: `<path d="M36 10 L56 34 L36 60 L16 34 Z" fill="url(#m4-bd)" stroke="#0F4674" stroke-width="1.8" stroke-linejoin="round"/>
    <line x1="36" y1="10" x2="36" y2="60" stroke="#1971C2" stroke-width="2.2"/>
    <line x1="16" y1="34" x2="56" y2="34" stroke="#E8547E" stroke-width="2.2"/>
    <path d="M36 28 h6 v6" stroke="#C2255C" stroke-width="1.8" fill="none"/>`,
};

/** 중2 Ⅳ recap 미니아트 — proveMiniArt("proof"|"iso"|"isoCond"|"rh"|"ccenter"|"icenter"|"para"|"keys"|"diag"|"family"|"area") */
export function proveMiniArt(key: string): string {
  const m = MINI4[key];
  if (!m) return "";
  return svg(
    "0 0 72 72",
    `<ellipse cx="36" cy="62" rx="20" ry="3.5" fill="#2A3A5E" opacity=".1"/>${m}`,
    `<linearGradient id="m4-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9E9F9"/><stop offset="1" stop-color="#A9CDF2"/></linearGradient>
    <linearGradient id="m4-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B79C0"/><stop offset="1" stop-color="#114E85"/></linearGradient>
    <linearGradient id="m4-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9F0F7"/></linearGradient>
    <linearGradient id="m4-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9B0"/><stop offset="1" stop-color="#E8B54A"/></linearGradient>`,
  );
}

/* ══════════════════════════════════════════════════════════════
   중2 Ⅴ. 도형의 닮음과 피타고라스 정리 — 퀴즈·개념 그림 + simMiniArt
   기하 원소는 geoKit(각 호·직각·틱·점 라벨)만 사용, 좌표는 전부 계산.
   팔레트: 라즈베리 #C2255C(진한 #8C1843·연한 #FBE3EC), 각 하이라이트는
   GEO 순서(앰버 #E8A93E → 시안 #0DA5C6 → 로즈 #E8547E → 그린 #12B886).
   구하는 값은 반드시 ?/x 로만 — 그림·라벨에 정답 수치 노출 금지.
   ══════════════════════════════════════════════════════════════ */

const P5 = {
  main: "#C2255C", deep: "#8C1843", fill: "#FBE3EC",
  amber: "#E8A93E", amberT: "#B26200", cyan: "#0DA5C6", cyanT: "#0B7285",
  green: "#12B886", ink: "#334155",
} as const;

/** 다각형 path(라즈베리 톤 기본). */
const poly5 = (pts: [number, number][], fill: string = P5.fill, stroke: string = P5.deep, w = 2.2): string =>
  `<path d="M${pts.map((p) => `${p[0]} ${p[1]}`).join(" L")} Z" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`;

/** 평행 표시 화살촉(교과서 > 표기). 선분 x1y1→x2y2 방향, t는 위치(0~1), n개 겹침. */
function paraTick(x1: number, y1: number, x2: number, y2: number, n = 1, color: string = P5.ink, t = 0.5): string {
  const a = angleOf(x1, y1, x2, y2);
  let s = "";
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * 7;
    const c = polar(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, off, a);
    s += arrowHead(c.x, c.y, a, color, 6.5);
  }
  return s;
}

/* ── L1 simQuadFig: 닮은 두 사각형(큰 ABCD ∽ 작은 EFGH, 2/3 축소 동일 방향) ──
   큰: BC=9cm·∠B=70°, AD=? / 작은: FG=6cm·EH=4cm. 작은 쪽 ∠F에도 무라벨 호(대응 읽기). */
export function simQuadFig(): string {
  const A: [number, number] = [72, 61];
  const B: [number, number] = [34, 166];
  const C: [number, number] = [174, 166];
  const D: [number, number] = [166, 58];
  const E: [number, number] = [254, 80];
  const F: [number, number] = [228, 150];
  const G: [number, number] = [321, 150];
  const H: [number, number] = [316, 78];
  return svg(
    "0 0 360 200",
    `<ellipse cx="104" cy="174" rx="82" ry="6" fill="#2A3A5E" opacity=".08"/>` +
      `<ellipse cx="274" cy="158" rx="58" ry="5" fill="#2A3A5E" opacity=".08"/>` +
      poly5([A, B, C, D]) +
      poly5([E, F, G, H]) +
      arcIn(B, A, C, P5.amber, "70°", 20) +
      arcIn(F, E, G, P5.amber, undefined, 14) +
      `<text x="104" y="186" text-anchor="middle" font-size="12" font-weight="900" fill="${P5.ink}">9 cm</text>` +
      `<text x="275" y="168" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.ink}">6 cm</text>` +
      `<text x="285" y="66" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.ink}">4 cm</text>` +
      `<text x="119" y="48" text-anchor="middle" font-size="14" font-weight="900" fill="${P5.main}">?</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(...D) +
      gdot(...E) + gdot(...F) + gdot(...G) + gdot(...H) +
      ptLabel(A[0], A[1], "A", -9, -8) + ptLabel(B[0], B[1], "B", -11, 14) +
      ptLabel(C[0], C[1], "C", 9, 16) + ptLabel(D[0], D[1], "D", 9, -7) +
      ptLabel(E[0], E[1], "E", -3, -9) + ptLabel(F[0], F[1], "F", -11, 13) +
      ptLabel(G[0], G[1], "G", 10, 13) + ptLabel(H[0], H[1], "H", 9, -6),
  );
}
/* ── L2 frameFig: 직사각형 액자 반례(바깥 30×24 : 안쪽 24×18 — 닮음 아님) ──
   8px/cm. 바깥 (64,18)~(304,210), 테두리 3cm=24px, 안쪽 (88,42)~(280,186). */
export function frameFig(): string {
  return svg(
    "0 0 360 248",
    `<ellipse cx="184" cy="216" rx="128" ry="6" fill="#2A3A5E" opacity=".1"/>
    <rect x="64" y="18" width="240" height="192" rx="4" fill="url(#fr-wood)" stroke="#6E4514" stroke-width="1.8"/>
    <rect x="66" y="20" width="236" height="6" rx="3" fill="#FFFFFF" opacity=".28"/>
    <path d="M64 18 L88 42 M304 18 L280 42 M64 210 L88 186 M304 210 L280 186" stroke="#8C5A1E" stroke-width="1.2" opacity=".55"/>
    <rect x="88" y="42" width="192" height="144" fill="url(#fr-win)" stroke="#B8925C" stroke-width="1.4"/>
    <path d="M196 18 v24" stroke="#B26200" stroke-width="2"/>
    <path d="M196 18 l-3.4 5.6 h6.8 z M196 42 l-3.4 -5.6 h6.8 z" fill="#B26200"/>
    <text x="206" y="35" font-size="11.5" font-weight="900" fill="#B26200">3 cm</text>
    <path d="M64 230 h240 M64 225 v10 M304 225 v10" stroke="#8093A8" stroke-width="1.5"/>
    <rect x="157" y="220" width="54" height="20" rx="10" fill="#FFFFFF" stroke="#E4C9D7" stroke-width="1.2"/>
    <text x="184" y="234" text-anchor="middle" font-size="12" font-weight="800" fill="#5A6B7E">30 cm</text>
    <path d="M44 18 v192 M39 18 h10 M39 210 h10" stroke="#8093A8" stroke-width="1.5"/>
    <rect x="19" y="104" width="50" height="20" rx="10" fill="#FFFFFF" stroke="#E4C9D7" stroke-width="1.2"/>
    <text x="44" y="118" text-anchor="middle" font-size="12" font-weight="800" fill="#5A6B7E">24 cm</text>
    <path d="M100 174 h168 M100 169 v10 M268 169 v10" stroke="#A98BA0" stroke-width="1.3"/>
    <text x="184" y="168" text-anchor="middle" font-size="11.5" font-weight="800" fill="#7A5A70">24 cm</text>
    <path d="M264 54 v108 M259 54 h10 M259 162 h10" stroke="#A98BA0" stroke-width="1.3"/>
    <text x="250" y="112" text-anchor="end" font-size="11.5" font-weight="800" fill="#7A5A70">18 cm</text>`,
    `<linearGradient id="fr-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E3B476"/><stop offset=".5" stop-color="#C98A3D"/><stop offset="1" stop-color="#8C5A1E"/></linearGradient>
    <linearGradient id="fr-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F5EBF1"/></linearGradient>`,
  );
}

/* ── L3 coneWaterFig: 뒤집힌 원뿔 그릇 + 아래 1/3 높이 물(닮음비 1:3) ──
   꼭짓점 (150,180), 입구 y=44 rx=84. 물 수면 y=135(1/3 지점), rx=28. */
export function coneWaterFig(): string {
  return svg(
    "0 0 360 210",
    `<ellipse cx="150" cy="192" rx="58" ry="6" fill="#2A3A5E" opacity=".1"/>
    <path d="M66 44 L150 180 L234 44 A84 13 0 0 1 66 44 Z" fill="url(#cw-glass)" stroke="#6E8296" stroke-width="1.8" stroke-linejoin="round" opacity=".92"/>
    <path d="M122 135 L150 180 L178 135 A28 5 0 0 1 122 135 Z" fill="url(#cw-wat)" stroke="#1E6FB8" stroke-width="1.4" stroke-linejoin="round"/>
    <ellipse cx="150" cy="135" rx="28" ry="5" fill="url(#cw-wats)" stroke="#1E6FB8" stroke-width="1.2"/>
    <ellipse cx="150" cy="44" rx="84" ry="13" fill="url(#cw-rim)" stroke="#6E8296" stroke-width="1.6"/>
    <path d="M104 62 L136 126" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".35"/>
    <path d="M234 44 h28 M178 135 h84 M150 180 h112" stroke="#8093A8" stroke-width="1.2" stroke-dasharray="4 3"/>
    <path d="M262 44 v136 M256 44 h12 M256 180 h12" stroke="#8093A8" stroke-width="1.6"/>
    <text x="272" y="86" font-size="10.5" font-weight="700" fill="#7A8698">전체 높이</text>
    <path d="M262 135 v45" stroke="#2F86D6" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M256 135 h12" stroke="#2F86D6" stroke-width="1.8"/>
    <text x="272" y="162" font-size="11" font-weight="900" fill="#1E6FB8">높이의 1/3</text>`,
    `<linearGradient id="cw-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF2F8"/><stop offset=".55" stop-color="#CFDEEA"/><stop offset="1" stop-color="#B7CBDC"/></linearGradient>
    <linearGradient id="cw-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6FAFD"/><stop offset="1" stop-color="#DDE9F2"/></linearGradient>
    <linearGradient id="cw-wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC1F2"/><stop offset="1" stop-color="#2F86D6"/></linearGradient>
    <linearGradient id="cw-wats" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A5D5F7"/><stop offset="1" stop-color="#5FA8E6"/></linearGradient>`,
  );
}
/* ── L4 simCondFig: 삼각형의 닮음 조건 3단 비교(SSS·SAS·AA) ──
   열마다 작은/큰 닮은 삼각형 쌍. SSS는 세 변 수치(6·8·10 : 9·12·15 = 2:3),
   SAS는 두 변(6·8 : 9·12)+끼인각 로즈 호, AA는 두 각(앰버·시안 호)만. */
export function simCondFig(): string {
  const col = (ox: number, kind: "sss" | "sas" | "aa", name: string): string => {
    const S1: [number, number] = [ox + 26, 88];
    const S2: [number, number] = [ox + 80, 88];
    const S3: [number, number] = [ox + 38, 46];
    const B1: [number, number] = [ox + 18, 182];
    const B2: [number, number] = [ox + 99, 182];
    const B3: [number, number] = [ox + 36, 119];
    let g = poly5([S1, S2, S3], "#FDF0F5", P5.deep, 1.8) + poly5([B1, B2, B3], P5.fill, P5.deep, 2);
    const side = (p: [number, number], q: [number, number], c: string): string =>
      `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>`;
    const num = (x: number, y: number, t: string, c: string, anchor = "middle"): string =>
      `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="10" font-weight="900" fill="${c}">${t}</text>`;
    if (kind === "sss" || kind === "sas") {
      g += side(S1, S2, P5.amber) + side(B1, B2, P5.amber) + side(S1, S3, P5.cyan) + side(B1, B3, P5.cyan);
      g += num(ox + 53, 101, "8", P5.amberT) + num(ox + 58, 196, "12", P5.amberT);
      g += num(ox + 24, 66, "6", P5.cyanT, "end") + num(ox + 19, 150, "9", P5.cyanT, "end");
    }
    if (kind === "sss") {
      g += side(S2, S3, "#E8547E") + side(B2, B3, "#E8547E");
      g += num(ox + 68, 58, "10", "#C2255C") + num(ox + 78, 141, "15", "#C2255C");
    }
    if (kind === "sas") {
      g += arcIn(S1, S2, S3, "#E8547E", undefined, 11) + arcIn(B1, B2, B3, "#E8547E", undefined, 13);
    }
    if (kind === "aa") {
      g += arcIn(S1, S2, S3, P5.amber, undefined, 11) + arcIn(B1, B2, B3, P5.amber, undefined, 13);
      g += arcIn(S2, S3, S1, P5.cyan, undefined, 13) + arcIn(B2, B3, B1, P5.cyan, undefined, 15);
    }
    g += `<rect x="${ox + 8}" y="198" width="104" height="24" rx="12" fill="url(#sc5-tag)"/>
      <text x="${ox + 60}" y="214.5" text-anchor="middle" font-size="11.5" font-weight="900" fill="#FFFFFF">${name}</text>`;
    return g;
  };
  return svg(
    "0 0 360 232",
    `<line x1="120" y1="26" x2="120" y2="188" stroke="#EED4E0" stroke-width="1.4"/>
    <line x1="240" y1="26" x2="240" y2="188" stroke="#EED4E0" stroke-width="1.4"/>` +
      col(0, "sss", "SSS 닮음") + col(120, "sas", "SAS 닮음") + col(240, "aa", "AA 닮음"),
    `<linearGradient id="sc5-tag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E0447F"/><stop offset="1" stop-color="#C2255C"/></linearGradient>`,
  );
}

/* ── L4 condPairFig: SAS 닮음 쌍(4·6cm 끼인각 50° vs 6·9cm 끼인각 50°, 방향 살짝 회전) ── */
export function condPairFig(): string {
  const V0: [number, number] = [38, 160];
  const B0: [number, number] = [140, 160];
  const C0: [number, number] = [82, 108];
  const V1: [number, number] = [215, 120];
  const B1: [number, number] = [325, 160];
  const C1: [number, number] = [283, 81];
  return svg(
    "0 0 360 200",
    `<ellipse cx="90" cy="176" rx="64" ry="5" fill="#2A3A5E" opacity=".08"/>
    <ellipse cx="268" cy="176" rx="70" ry="5" fill="#2A3A5E" opacity=".08"/>` +
      poly5([V0, B0, C0], "#FDF0F5", P5.deep, 2) +
      poly5([V1, B1, C1], P5.fill, P5.deep, 2.2) +
      `<line x1="${V0[0]}" y1="${V0[1]}" x2="${B0[0]}" y2="${B0[1]}" stroke="${P5.amber}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<line x1="${V0[0]}" y1="${V0[1]}" x2="${C0[0]}" y2="${C0[1]}" stroke="${P5.cyan}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<line x1="${V1[0]}" y1="${V1[1]}" x2="${B1[0]}" y2="${B1[1]}" stroke="${P5.amber}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<line x1="${V1[0]}" y1="${V1[1]}" x2="${C1[0]}" y2="${C1[1]}" stroke="${P5.cyan}" stroke-width="3.2" stroke-linecap="round"/>` +
      angleArc(V0[0], V0[1], 15, 0, 50, "#E8547E", "50°", { labelR: 28 }) +
      angleArc(V1[0], V1[1], 15, -20, 30, "#E8547E", "50°", { labelR: 28 }) +
      `<text x="89" y="178" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.amberT}">6 cm</text>` +
      `<text x="52" y="128" text-anchor="end" font-size="11.5" font-weight="900" fill="${P5.cyanT}">4 cm</text>` +
      `<text x="268" y="155" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.amberT}">9 cm</text>` +
      `<text x="242" y="89" text-anchor="end" font-size="11.5" font-weight="900" fill="${P5.cyanT}">6 cm</text>`,
  );
}
/* ── L5 overlapFig: 공통각 겹침(△ABC 안 D·E, ∠AED=∠ABC 같은 색 호) ──
   AD=4·DB=8(→AB=12)·AE=6, AC는 ?(바깥 치수선). 픽셀은 12.5px/cm 실축척이라
   △AED∽△ABC(SAS)가 실제로 성립 — 두 호의 각이 진짜 같다. DE∦BC 배치. */
export function overlapFig(): string {
  const A: [number, number] = [150, 34];
  const B: [number, number] = [99, 175];
  const C: [number, number] = [200, 121];
  const D: [number, number] = [133, 81];
  const E: [number, number] = [187.5, 99.3];
  const n = [0.866, -0.5]; // AC 바깥쪽 법선
  return svg(
    "0 0 360 198",
    poly5([A, B, C]) +
      `<line x1="${D[0]}" y1="${D[1]}" x2="${E[0]}" y2="${E[1]}" stroke="${P5.main}" stroke-width="2.4" stroke-linecap="round"/>` +
      arcIn(E, A, D, P5.amber, undefined, 13) +
      arcIn(B, A, C, P5.amber, undefined, 16) +
      `<line x1="${A[0] + n[0] * 14}" y1="${A[1] + n[1] * 14}" x2="${A[0] + n[0] * 24}" y2="${A[1] + n[1] * 24}" stroke="#B98CA0" stroke-width="1.2"/>` +
      `<line x1="${C[0] + n[0] * 14}" y1="${C[1] + n[1] * 14}" x2="${C[0] + n[0] * 24}" y2="${C[1] + n[1] * 24}" stroke="#B98CA0" stroke-width="1.2"/>` +
      `<line x1="${A[0] + n[0] * 22}" y1="${A[1] + n[1] * 22}" x2="${C[0] + n[0] * 22}" y2="${C[1] + n[1] * 22}" stroke="#B98CA0" stroke-width="1.5"/>` +
      `<text x="204" y="66" text-anchor="middle" font-size="14" font-weight="900" fill="${P5.main}">?</text>` +
      `<text x="131" y="60" text-anchor="end" font-size="11" font-weight="900" fill="${P5.ink}">4 cm</text>` +
      `<text x="104" y="132" text-anchor="end" font-size="11" font-weight="900" fill="${P5.ink}">8 cm</text>` +
      `<text x="172" y="76" text-anchor="end" font-size="11" font-weight="900" fill="${P5.ink}">6 cm</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) +
      gdot(D[0], D[1], P5.main, 3.4) + gdot(E[0], E[1], P5.main, 3.4) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 13) +
      ptLabel(C[0], C[1], "C", 8, 16) + ptLabel(D[0], D[1], "D", -13, 3, "#C2255C") +
      ptLabel(E[0], E[1], "E", 8, 16, "#C2255C"),
  );
}

/* ── L5 butterflyFig: 맞꼭지각 나비(AD·BE가 C에서 교차, AB∥DE 실배치) ──
   위 △ABC: AC=9·BC=12 / 아래 △DEC: CE=4·CD=?. ∠A=∠D 앰버, 맞꼭지각 C 로즈 2개. */
export function butterflyFig(): string {
  const C: [number, number] = [186, 104];
  const A: [number, number] = [93, 70];
  const B: [number, number] = [294, 28];
  const D: [number, number] = [228, 119.3];
  const E: [number, number] = [138.5, 137.4];
  return svg(
    "0 0 360 170",
    poly5([A, B, C], "rgba(194,37,92,.08)", P5.deep, 2.2) +
      poly5([D, E, C], "rgba(13,165,198,.1)", P5.deep, 2.2) +
      arcIn(A, B, C, P5.amber, undefined, 22) +
      arcIn(D, E, C, P5.amber, undefined, 17) +
      // 맞꼭지각 표시: 125° 부채를 통째로 그리면 원처럼 보여, 마주 보는 짧은 호 2개만
      angleArc(C[0], C[1], 11, 73.5, 121.5, "#E8547E") +
      angleArc(C[0], C[1], 11, 253.5, 301.5, "#E8547E") +
      `<text x="134" y="78" text-anchor="middle" font-size="11" font-weight="900" fill="${P5.ink}">9 cm</text>` +
      `<text x="249" y="80" text-anchor="middle" font-size="11" font-weight="900" fill="${P5.ink}">12 cm</text>` +
      `<text x="148" y="106" text-anchor="middle" font-size="11" font-weight="900" fill="${P5.ink}">4 cm</text>` +
      `<text x="216" y="102" text-anchor="middle" font-size="13" font-weight="900" fill="${P5.main}">?</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(...D) + gdot(...E) +
      ptLabel(A[0], A[1], "A", -12, 0) + ptLabel(B[0], B[1], "B", 11, -4) +
      ptLabel(C[0], C[1], "C", -14, 8) + ptLabel(D[0], D[1], "D", 12, 10) +
      ptLabel(E[0], E[1], "E", -6, 16),
  );
}
/* ── L5 altitudeFig: 직각삼각형 수선의 발(∠A=90°, AD⊥BC, BD=4·CD=9, AD=?) ──
   16px/cm 실축척(BD=64·CD=144·AD=96px) — ∠A가 진짜 90°가 되는 배치. */
export function altitudeFig(): string {
  const A: [number, number] = [128, 72];
  const B: [number, number] = [64, 168];
  const C: [number, number] = [272, 168];
  const D: [number, number] = [128, 168];
  return svg(
    "0 0 360 204",
    `<ellipse cx="168" cy="186" rx="120" ry="6" fill="#2A3A5E" opacity=".08"/>` +
      poly5([A, B, C]) +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${D[0]}" y2="${D[1]}" stroke="#E8547E" stroke-width="2.2" stroke-dasharray="6 4"/>` +
      rightMark(D[0], D[1], 0, 10, "#C2255C") +
      rightMark(A[0], A[1], angleOf(A[0], A[1], B[0], B[1]), 10, P5.ink) +
      `<text x="96" y="188" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.ink}">4 cm</text>` +
      `<text x="204" y="188" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.ink}">9 cm</text>` +
      `<text x="120" y="126" text-anchor="end" font-size="13" font-weight="900" fill="${P5.main}">?</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(D[0], D[1], "#C2255C", 3.4) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 14) +
      ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(D[0], D[1], "D", 5, 16, "#C2255C"),
  );
}

/* ── L6 triParaFig: 삼각형 속 평행선 두 구도(변 위 D·E / 연장선 위 D·E) ──
   두 패널 모두 AD 앰버·(AB 또는 DB) 시안 색 구분 + DE·BC 평행 화살촉. */
export function triParaFig(): string {
  const seg = (p: [number, number], q: [number, number], c: string, w = 3.6): string =>
    `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  // 왼쪽: 기본형(D·E가 변 위)
  const A1: [number, number] = [88, 44];
  const B1: [number, number] = [28, 172];
  const C1: [number, number] = [162, 172];
  const D1: [number, number] = [59.2, 105.4];
  const E1: [number, number] = [123.5, 105.4];
  // 오른쪽: 연장선형(D·E가 A 반대편 — 나비꼴)
  const A2: [number, number] = [272, 104];
  const B2: [number, number] = [214, 172];
  const C2: [number, number] = [330, 172];
  const D2: [number, number] = [308, 62];
  const E2: [number, number] = [236, 62];
  return svg(
    "0 0 360 206",
    `<line x1="186" y1="24" x2="186" y2="184" stroke="#EED4E0" stroke-width="1.4"/>` +
      poly5([A1, B1, C1], "#FDF3F7") +
      seg(A1, D1, P5.amber) + seg(D1, B1, P5.cyan) + seg(A1, E1, P5.amber) + seg(E1, C1, P5.cyan) +
      `<line x1="${D1[0]}" y1="${D1[1]}" x2="${E1[0]}" y2="${E1[1]}" stroke="${P5.main}" stroke-width="2.6" stroke-linecap="round"/>` +
      paraTick(D1[0], D1[1], E1[0], E1[1], 1, P5.ink) +
      paraTick(B1[0], B1[1], C1[0], C1[1], 1, P5.ink) +
      gdot(...A1) + gdot(...B1) + gdot(...C1) +
      gdot(D1[0], D1[1], P5.main, 3.4) + gdot(E1[0], E1[1], P5.main, 3.4) +
      ptLabel(A1[0], A1[1], "A", 0, -10) + ptLabel(B1[0], B1[1], "B", -11, 14) +
      ptLabel(C1[0], C1[1], "C", 11, 14) + ptLabel(D1[0], D1[1], "D", -13, 2, "#C2255C") +
      ptLabel(E1[0], E1[1], "E", 13, 2, "#C2255C") +
      `<text x="95" y="198" text-anchor="middle" font-size="11" font-weight="700" fill="#8093A8">D·E가 변 위</text>` +
      `<line x1="${B2[0]}" y1="${B2[1]}" x2="${D2[0]}" y2="${D2[1]}" stroke="${P5.ink}" stroke-width="2" opacity=".45"/>` +
      `<line x1="${C2[0]}" y1="${C2[1]}" x2="${E2[0]}" y2="${E2[1]}" stroke="${P5.ink}" stroke-width="2" opacity=".45"/>` +
      `<line x1="${B2[0]}" y1="${B2[1]}" x2="${C2[0]}" y2="${C2[1]}" stroke="${P5.deep}" stroke-width="2.4" stroke-linecap="round"/>` +
      seg(A2, D2, P5.amber) + seg(A2, B2, P5.cyan) + seg(A2, E2, P5.amber) + seg(A2, C2, P5.cyan) +
      `<line x1="${D2[0]}" y1="${D2[1]}" x2="${E2[0]}" y2="${E2[1]}" stroke="${P5.main}" stroke-width="2.6" stroke-linecap="round"/>` +
      paraTick(E2[0], E2[1], D2[0], D2[1], 1, P5.ink) +
      paraTick(B2[0], B2[1], C2[0], C2[1], 1, P5.ink) +
      gdot(...A2) + gdot(...B2) + gdot(...C2) +
      gdot(D2[0], D2[1], P5.main, 3.4) + gdot(E2[0], E2[1], P5.main, 3.4) +
      ptLabel(A2[0], A2[1], "A", 14, 3) + ptLabel(B2[0], B2[1], "B", -11, 14) +
      ptLabel(C2[0], C2[1], "C", 11, 14) + ptLabel(D2[0], D2[1], "D", 11, -4, "#C2255C") +
      ptLabel(E2[0], E2[1], "E", -11, -4, "#C2255C") +
      `<text x="272" y="198" text-anchor="middle" font-size="11" font-weight="700" fill="#8093A8">D·E가 연장선 위</text>`,
  );
}
/* ── L6 triParaQuizFig: BC∥DE 수치판(AD=4·DB=6로 AB=10이 읽힘, DE=6 → BC=?) ──
   AD 구간 앰버·DB 구간 시안으로 구분 표기(D 점이 경계). */
export function triParaQuizFig(): string {
  const A: [number, number] = [150, 36];
  const B: [number, number] = [66, 188];
  const C: [number, number] = [296, 188];
  const D: [number, number] = [116.4, 96.8];
  const E: [number, number] = [208.4, 96.8];
  return svg(
    "0 0 360 216",
    poly5([A, B, C]) +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${D[0]}" y2="${D[1]}" stroke="${P5.amber}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<line x1="${D[0]}" y1="${D[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${P5.cyan}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<line x1="${D[0]}" y1="${D[1]}" x2="${E[0]}" y2="${E[1]}" stroke="${P5.main}" stroke-width="2.6" stroke-linecap="round"/>` +
      paraTick(D[0], D[1], E[0], E[1], 1, P5.ink) +
      paraTick(B[0], B[1], C[0], C[1], 1, P5.ink) +
      `<text x="127" y="69" text-anchor="end" font-size="11.5" font-weight="900" fill="${P5.amberT}">4 cm</text>` +
      `<text x="84" y="146" text-anchor="end" font-size="11.5" font-weight="900" fill="${P5.cyanT}">6 cm</text>` +
      `<text x="162" y="90" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.ink}">6 cm</text>` +
      `<text x="181" y="208" text-anchor="middle" font-size="13.5" font-weight="900" fill="${P5.main}">?</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) +
      gdot(D[0], D[1], P5.main, 3.6) + gdot(E[0], E[1], P5.main, 3.6) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 14) +
      ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(D[0], D[1], "D", -13, 2, "#C2255C") +
      ptLabel(E[0], E[1], "E", 13, 2, "#C2255C"),
  );
}

/* ── L7 midsegFig: 중점연결정리(M·N 중점 틱, MN∥BC 화살촉, MN=½BC 태그) ── */
export function midsegFig(): string {
  const A: [number, number] = [180, 36];
  const B: [number, number] = [76, 180];
  const C: [number, number] = [292, 180];
  const M: [number, number] = [128, 108];
  const N: [number, number] = [236, 108];
  return svg(
    "0 0 360 208",
    poly5([A, B, C]) +
      `<line x1="${M[0]}" y1="${M[1]}" x2="${N[0]}" y2="${N[1]}" stroke="${P5.main}" stroke-width="2.8" stroke-linecap="round"/>` +
      tickMark(A[0], A[1], M[0], M[1], 1, P5.amber) + tickMark(M[0], M[1], B[0], B[1], 1, P5.amber) +
      tickMark(A[0], A[1], N[0], N[1], 2, P5.cyan) + tickMark(N[0], N[1], C[0], C[1], 2, P5.cyan) +
      paraTick(M[0], M[1], N[0], N[1], 1, P5.ink, 0.62) +
      paraTick(B[0], B[1], C[0], C[1], 1, P5.ink, 0.56) +
      gdot(...A) + gdot(...B) + gdot(...C) +
      gdot(M[0], M[1], P5.main, 3.6) + gdot(N[0], N[1], P5.main, 3.6) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 14) +
      ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(M[0], M[1], "M", -14, 3, "#C2255C") +
      ptLabel(N[0], N[1], "N", 14, 3, "#C2255C") +
      `<rect x="246" y="26" width="96" height="26" rx="13" fill="url(#ms5-tag)"/>
      <text x="294" y="44" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF">MN = ½BC</text>`,
    `<linearGradient id="ms5-tag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E0447F"/><stop offset="1" stop-color="#C2255C"/></linearGradient>`,
  );
}

/* ── L7 midsegQuizFig: 중점연결 수치판(MN=7cm·∠AMN=65° → BC=?·∠B=?) ── */
export function midsegQuizFig(): string {
  const A: [number, number] = [180, 36];
  const B: [number, number] = [76, 180];
  const C: [number, number] = [292, 180];
  const M: [number, number] = [128, 108];
  const N: [number, number] = [236, 108];
  return svg(
    "0 0 360 212",
    poly5([A, B, C]) +
      `<line x1="${M[0]}" y1="${M[1]}" x2="${N[0]}" y2="${N[1]}" stroke="${P5.main}" stroke-width="2.8" stroke-linecap="round"/>` +
      tickMark(A[0], A[1], M[0], M[1], 1, P5.amber) + tickMark(M[0], M[1], B[0], B[1], 1, P5.amber) +
      tickMark(A[0], A[1], N[0], N[1], 2, P5.cyan) + tickMark(N[0], N[1], C[0], C[1], 2, P5.cyan) +
      arcIn(M, N, A, P5.amber, "65°", 15) +
      arcIn(B, C, A, "#E8547E", "?", 17) +
      `<text x="182" y="99" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.ink}">7 cm</text>` +
      `<text x="184" y="201" text-anchor="middle" font-size="13.5" font-weight="900" fill="${P5.main}">?</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) +
      gdot(M[0], M[1], P5.main, 3.6) + gdot(N[0], N[1], P5.main, 3.6) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 14) +
      ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(M[0], M[1], "M", -14, 3, "#C2255C") +
      ptLabel(N[0], N[1], "N", 14, 3, "#C2255C"),
  );
}
/* ── L7 midQuadFig: 사각형 네 변 중점 연결(바리뇽 평행사변형 PQRS) ──
   볼록 사각형 ABCD + 대각선 AC=16cm(앰버 점선)·BD=12cm(시안 점선). */
export function midQuadFig(): string {
  const A: [number, number] = [84, 40];
  const B: [number, number] = [30, 150];
  const C: [number, number] = [220, 196];
  const D: [number, number] = [320, 84];
  const P: [number, number] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const Q: [number, number] = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
  const R: [number, number] = [(C[0] + D[0]) / 2, (C[1] + D[1]) / 2];
  const S: [number, number] = [(D[0] + A[0]) / 2, (D[1] + A[1]) / 2];
  return svg(
    "0 0 360 218",
    poly5([A, B, C, D], "#FDF4F8") +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${C[0]}" y2="${C[1]}" stroke="${P5.amber}" stroke-width="2" stroke-dasharray="6 4"/>` +
      `<line x1="${B[0]}" y1="${B[1]}" x2="${D[0]}" y2="${D[1]}" stroke="${P5.cyan}" stroke-width="2" stroke-dasharray="6 4"/>` +
      poly5([P, Q, R, S], "rgba(194,37,92,.14)", "#C2255C", 2.2) +
      `<text x="130" y="100" text-anchor="end" font-size="11" font-weight="900" fill="${P5.amberT}">16 cm</text>` +
      `<text x="245" y="89" font-size="11" font-weight="900" fill="${P5.cyanT}">12 cm</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(...D) +
      gdot(P[0], P[1], "#C2255C", 3.6) + gdot(Q[0], Q[1], "#C2255C", 3.6) +
      gdot(R[0], R[1], "#C2255C", 3.6) + gdot(S[0], S[1], "#C2255C", 3.6) +
      ptLabel(A[0], A[1], "A", -8, -8) + ptLabel(B[0], B[1], "B", -12, 6) +
      ptLabel(C[0], C[1], "C", 6, 17) + ptLabel(D[0], D[1], "D", 12, -4) +
      ptLabel(P[0], P[1], "P", -12, 2, "#C2255C") + ptLabel(Q[0], Q[1], "Q", -2, 17, "#C2255C") +
      ptLabel(R[0], R[1], "R", 13, 8, "#C2255C") + ptLabel(S[0], S[1], "S", 6, -9, "#C2255C"),
  );
}

/* ── L8 paraLines 공통 밑그림: 평행선 l·m·n + 사선 p·q(교점 6개) ──
   개념판은 a·b·c·d 문자, 퀴즈판은 4·6·x·9 수치(4:6=x:9). */
function paraLinesBase(la: string, lb: string, lc: string, ld: string, tag: string): string {
  const line = (y: number, name: string): string =>
    `<line x1="22" y1="${y}" x2="338" y2="${y}" stroke="${P5.ink}" stroke-width="2" stroke-linecap="round"/>` +
    paraTick(22, y, 338, y, 1, P5.ink, 0.92) +
    `<text x="344" y="${y + 4}" font-size="11.5" font-weight="800" font-style="italic" fill="#5A6B7E">${name}</text>`;
  const px = (y: number): number => 86 + ((y - 30) / 170) * 64;
  const qx = (y: number): number => 232 + ((y - 26) / 178) * 68;
  const piece = (x1: number, y1: number, x2: number, y2: number, c: string): string =>
    `<line x1="${x1.toFixed(1)}" y1="${y1}" x2="${x2.toFixed(1)}" y2="${y2}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
  const dots = [54, 110, 178]
    .map((y) => gdot(px(y), y, P5.ink, 2.6) + gdot(qx(y), y, P5.ink, 2.6))
    .join("");
  return (
    line(54, "l") + line(110, "m") + line(178, "n") +
    `<line x1="86" y1="30" x2="150" y2="200" stroke="#8093A8" stroke-width="2"/>` +
    `<line x1="232" y1="26" x2="300" y2="204" stroke="#8093A8" stroke-width="2"/>` +
    piece(px(54), 54, px(110), 110, P5.amber) +
    piece(px(110), 110, px(178), 178, P5.cyan) +
    piece(qx(54), 54, qx(110), 110, P5.amber) +
    piece(qx(110), 110, qx(178), 178, P5.cyan) +
    dots +
    `<text x="98" y="86" text-anchor="end" font-size="12.5" font-weight="900" fill="${P5.amberT}">${la}</text>` +
    `<text x="119" y="150" text-anchor="end" font-size="12.5" font-weight="900" fill="${P5.cyanT}">${lb}</text>` +
    `<text x="262" y="86" font-size="12.5" font-weight="900" fill="${lc.includes("x") ? P5.main : P5.amberT}">${lc}</text>` +
    `<text x="286" y="150" font-size="12.5" font-weight="900" fill="${P5.cyanT}">${ld}</text>` +
    tag
  );
}

/** L8 평행선 사이 비 규칙(l∥m∥n, a:b=c:d 태그). */
export function paraLinesFig(): string {
  return svg(
    "0 0 360 240",
    paraLinesBase(
      "a", "b", "c", "d",
      `<rect x="112" y="206" width="136" height="26" rx="13" fill="url(#pl5-tag)"/>
      <text x="180" y="224" text-anchor="middle" font-size="12.5" font-weight="900" font-style="italic" fill="#FFFFFF">a : b = c : d</text>`,
    ),
    `<linearGradient id="pl5-tag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E0447F"/><stop offset="1" stop-color="#C2255C"/></linearGradient>`,
  );
}

/** L8 퀴즈(l∥m∥n, 왼쪽 4·6 / 오른쪽 x·9). */
export function paraLinesQuizFig(): string {
  return svg("0 0 360 212", paraLinesBase("4 cm", "6 cm", "x cm", "9 cm", ""));
}
/* ── L8 perspectFig: 미술관 복도 원근(세로 기둥 AD∥BE∥CF, 천장·바닥 사선) ──
   천장 y=60−0.12(x−56), 바닥 y=150+0.18(x−56). 기둥 x=56·150·291(가로 2:3).
   위 AB=10·BC=15, 아래 DE=14·EF=?(같은 2:3 비 — 그림도 실제 비례). */
export function perspectFig(): string {
  const ceil = (x: number): number => 60 - 0.12 * (x - 56);
  const floor = (x: number): number => 150 + 0.18 * (x - 56);
  const pillar = (x: number): string =>
    `<rect x="${x - 4}" y="${ceil(x).toFixed(1)}" width="8" height="${(floor(x) - ceil(x)).toFixed(1)}" rx="2.5" fill="url(#pv-col)" stroke="#5F5470" stroke-width="1.3"/>` +
    paraTick(x, ceil(x), x, floor(x), 1, "#5F5470", 0.56);
  return svg(
    "0 0 360 224",
    `<line x1="36" y1="${ceil(36).toFixed(1)}" x2="326" y2="${ceil(326).toFixed(1)}" stroke="${P5.ink}" stroke-width="2.2"/>` +
      `<line x1="36" y1="${floor(36).toFixed(1)}" x2="326" y2="${floor(326).toFixed(1)}" stroke="${P5.ink}" stroke-width="2.2"/>` +
      `<rect x="66" y="86" width="20" height="15" fill="#F7F2EA" stroke="#8C5A1E" stroke-width="1.6"/>` +
      `<rect x="70" y="89.5" width="12" height="8" fill="#D9C0E8" stroke="#B8925C" stroke-width=".8"/>` +
      `<rect x="196" y="92" width="24" height="18" fill="#F7F2EA" stroke="#8C5A1E" stroke-width="1.6"/>` +
      `<rect x="200.5" y="96" width="15" height="10" fill="#BBD3EA" stroke="#B8925C" stroke-width=".8"/>` +
      pillar(56) + pillar(150) + pillar(291) +
      gdot(56, ceil(56)) + gdot(150, ceil(150)) + gdot(291, ceil(291)) +
      gdot(56, floor(56)) + gdot(150, floor(150)) + gdot(291, floor(291)) +
      ptLabel(56, ceil(56), "A", -2, -10) + ptLabel(150, ceil(150), "B", 0, -10) + ptLabel(291, ceil(291), "C", 2, -10) +
      ptLabel(56, floor(56), "D", -2, 17) + ptLabel(150, floor(150), "E", 0, 17) + ptLabel(291, floor(291), "F", 2, 17) +
      `<text x="103" y="76" text-anchor="middle" font-size="11" font-weight="900" fill="${P5.ink}">10 cm</text>` +
      `<text x="220" y="66" text-anchor="middle" font-size="11" font-weight="900" fill="${P5.ink}">15 cm</text>` +
      `<text x="103" y="149" text-anchor="middle" font-size="11" font-weight="900" fill="${P5.ink}">14 cm</text>` +
      `<text x="220" y="170" text-anchor="middle" font-size="13" font-weight="900" fill="${P5.main}">?</text>`,
    `<linearGradient id="pv-col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F1EBF4"/><stop offset=".5" stop-color="#CFC4D8"/><stop offset="1" stop-color="#A99BB8"/></linearGradient>`,
  );
}

/* ── L9 centroidFig: 무게중심(세 중선 + G, 중선 AMa의 2:1 구간 색·라벨) ── */
export function centroidFig(): string {
  const A: [number, number] = [178, 32];
  const B: [number, number] = [54, 190];
  const C: [number, number] = [310, 178];
  const Ma: [number, number] = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
  const Mb: [number, number] = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
  const Mc: [number, number] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const G: [number, number] = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
  return svg(
    "0 0 360 212",
    poly5([A, B, C], "#FDF4F8") +
      `<line x1="${B[0]}" y1="${B[1]}" x2="${Mb[0]}" y2="${Mb[1]}" stroke="#D8A9BE" stroke-width="1.8"/>` +
      `<line x1="${C[0]}" y1="${C[1]}" x2="${Mc[0]}" y2="${Mc[1]}" stroke="#D8A9BE" stroke-width="1.8"/>` +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${G[0].toFixed(1)}" y2="${G[1].toFixed(1)}" stroke="${P5.amber}" stroke-width="3.6" stroke-linecap="round"/>` +
      `<line x1="${G[0].toFixed(1)}" y1="${G[1].toFixed(1)}" x2="${Ma[0]}" y2="${Ma[1]}" stroke="${P5.cyan}" stroke-width="3.6" stroke-linecap="round"/>` +
      tickMark(B[0], B[1], Ma[0], Ma[1], 1, P5.ink) + tickMark(Ma[0], Ma[1], C[0], C[1], 1, P5.ink) +
      tickMark(A[0], A[1], Mb[0], Mb[1], 2, P5.ink) + tickMark(Mb[0], Mb[1], C[0], C[1], 2, P5.ink) +
      tickMark(A[0], A[1], Mc[0], Mc[1], 3, P5.ink) + tickMark(Mc[0], Mc[1], B[0], B[1], 3, P5.ink) +
      `<text x="192" y="88" font-size="12.5" font-weight="900" fill="${P5.amberT}">2</text>` +
      `<text x="193" y="164" font-size="12.5" font-weight="900" fill="${P5.cyanT}">1</text>` +
      gdot(Ma[0], Ma[1], P5.ink, 3) + gdot(Mb[0], Mb[1], P5.ink, 3) + gdot(Mc[0], Mc[1], P5.ink, 3) +
      gdot(...A) + gdot(...B) + gdot(...C) +
      gdot(G[0], G[1], "#C2255C", 4.5) +
      ptLabel(G[0], G[1], "G", 13, 4, "#C2255C") +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 13) + ptLabel(C[0], C[1], "C", 12, 10),
  );
}

/* ── L9 areaSixFig: 세 중선의 6조각 등분할(전부 같은 넓이 S) ── */
export function areaSixFig(): string {
  const A: [number, number] = [178, 32];
  const B: [number, number] = [54, 190];
  const C: [number, number] = [310, 178];
  const Ma: [number, number] = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
  const Mb: [number, number] = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
  const Mc: [number, number] = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const G: [number, number] = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
  const pieces: [[number, number], [number, number], string][] = [
    [A, Mc, "rgba(232,169,62,.38)"],
    [Mc, B, "rgba(13,165,198,.3)"],
    [B, Ma, "rgba(232,84,126,.3)"],
    [Ma, C, "rgba(18,184,134,.3)"],
    [C, Mb, "rgba(124,107,255,.28)"],
    [Mb, A, "rgba(61,91,192,.26)"],
  ];
  let g = "";
  for (const [p, q, fill] of pieces) {
    g += `<path d="M${p[0]} ${p[1]} L${q[0]} ${q[1]} L${G[0].toFixed(1)} ${G[1].toFixed(1)} Z" fill="${fill}"/>`;
    const cx = (p[0] + q[0] + G[0]) / 3;
    const cy = (p[1] + q[1] + G[1]) / 3;
    g += `<text x="${cx.toFixed(1)}" y="${(cy + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" font-style="italic" fill="${P5.ink}">S</text>`;
  }
  return svg(
    "0 0 360 212",
    g +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${Ma[0]}" y2="${Ma[1]}" stroke="${P5.ink}" stroke-width="1.6"/>` +
      `<line x1="${B[0]}" y1="${B[1]}" x2="${Mb[0]}" y2="${Mb[1]}" stroke="${P5.ink}" stroke-width="1.6"/>` +
      `<line x1="${C[0]}" y1="${C[1]}" x2="${Mc[0]}" y2="${Mc[1]}" stroke="${P5.ink}" stroke-width="1.6"/>` +
      `<path d="M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z" fill="none" stroke="${P5.deep}" stroke-width="2.2" stroke-linejoin="round"/>` +
      gdot(G[0], G[1], "#C2255C", 4) +
      ptLabel(G[0], G[1], "G", 3, -9, "#C2255C") +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 13) + ptLabel(C[0], C[1], "C", 12, 10),
  );
}
/* ── L9 centroidQuizFig: 중선 AD=18cm 안내문·G 표시 → AG 구간 ? ──
   AG 앰버·GD 시안(개념 그림 2:1 색 문법 계승). 전체 길이는 텍스트 안내
   "AD = 18 cm"(trapCounterFig 문법 — 중선은 내부 선분이라 바깥 치수선 불가). */
export function centroidQuizFig(): string {
  const A: [number, number] = [160, 34];
  const B: [number, number] = [52, 186];
  const C: [number, number] = [300, 186];
  const D: [number, number] = [176, 186];
  const G: [number, number] = [A[0] + (D[0] - A[0]) * (2 / 3), A[1] + (D[1] - A[1]) * (2 / 3)];
  return svg(
    "0 0 360 210",
    poly5([A, B, C]) +
      `<line x1="${A[0]}" y1="${A[1]}" x2="${G[0].toFixed(1)}" y2="${G[1].toFixed(1)}" stroke="${P5.amber}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<line x1="${G[0].toFixed(1)}" y1="${G[1].toFixed(1)}" x2="${D[0]}" y2="${D[1]}" stroke="${P5.cyan}" stroke-width="3.4" stroke-linecap="round"/>` +
      tickMark(B[0], B[1], D[0], D[1], 1, P5.ink) + tickMark(D[0], D[1], C[0], C[1], 1, P5.ink) +
      `<text x="248" y="56" text-anchor="middle" font-size="12.5" font-weight="800" fill="${P5.ink}">AD = 18 cm</text>` +
      `<text x="${(A[0] + (G[0] - A[0]) / 2 - 9).toFixed(1)}" y="${(A[1] + (G[1] - A[1]) / 2 + 8).toFixed(1)}" text-anchor="end" font-size="13" font-weight="900" fill="${P5.main}">?</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) + gdot(D[0], D[1], P5.ink, 3.4) +
      gdot(G[0], G[1], "#C2255C", 4.5) +
      ptLabel(G[0], G[1], "G", -13, 4, "#C2255C") +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", -11, 14) +
      ptLabel(C[0], C[1], "C", 11, 14) + ptLabel(D[0], D[1], "D", 0, 17),
  );
}

/* ── L10 pythaFig: 피타고라스 표준 그림(3·4·5 비 직각삼각형 + 세 변 위 정사각형) ──
   C(120,168) 직각, 가로 a=96·세로 b=72·빗변 c=120. 넓이 라벨은 a²·b²·c²만. */
export function pythaFig(): string {
  return svg(
    "0 0 360 288",
    `<rect x="120" y="168" width="96" height="96" fill="rgba(232,169,62,.32)" stroke="#B26200" stroke-width="2"/>
    <rect x="48" y="96" width="72" height="72" fill="rgba(13,165,198,.24)" stroke="#0B7285" stroke-width="2"/>
    <path d="M120 96 L216 168 L312 96 L216 24 Z" fill="rgba(194,37,92,.16)" stroke="#C2255C" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M120 96 L120 168 L216 168 Z" fill="#FFFFFF" stroke="${P5.ink}" stroke-width="2.4" stroke-linejoin="round"/>` +
      rightMark(120, 168, 0, 11, P5.ink) +
      `<text x="168" y="222" text-anchor="middle" font-size="15" font-weight="800" font-style="italic" fill="#8C5E00">a²</text>
    <text x="84" y="137" text-anchor="middle" font-size="15" font-weight="800" font-style="italic" fill="#0B7285">b²</text>
    <text x="216" y="101" text-anchor="middle" font-size="15" font-weight="800" font-style="italic" fill="#A61E4D">c²</text>
    <text x="168" y="162" text-anchor="middle" font-size="13" font-weight="800" font-style="italic" fill="#B26200">a</text>
    <text x="131" y="137" text-anchor="middle" font-size="13" font-weight="800" font-style="italic" fill="#0DA5C6">b</text>
    <text x="176" y="123" text-anchor="middle" font-size="13" font-weight="800" font-style="italic" fill="#C2255C">c</text>
    <rect x="24" y="30" width="118" height="28" rx="14" fill="url(#py5-tag)"/>
    <text x="83" y="49" text-anchor="middle" font-size="13.5" font-weight="900" font-style="italic" fill="#FFFFFF">a²+b²=c²</text>`,
    `<linearGradient id="py5-tag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E0447F"/><stop offset="1" stop-color="#C2255C"/></linearGradient>`,
  );
}

/* ── L10 pythaQuizFig: 빗변 17cm·한 변 8cm → 나머지 변 ?(직각 C 명확히) ──
   10px/cm 실축척(80·150·170px = 8·15·17). */
export function pythaQuizFig(): string {
  const A: [number, number] = [84, 96];
  const C: [number, number] = [84, 176];
  const B: [number, number] = [234, 176];
  return svg(
    "0 0 360 212",
    `<ellipse cx="160" cy="192" rx="110" ry="6" fill="#2A3A5E" opacity=".08"/>` +
      poly5([A, B, C]) +
      rightMark(C[0], C[1], 0, 12, P5.ink) +
      `<text x="76" y="140" text-anchor="end" font-size="12" font-weight="900" fill="${P5.ink}">8 cm</text>` +
      `<text x="172" y="129" text-anchor="middle" font-size="12" font-weight="900" fill="${P5.ink}">17 cm</text>` +
      `<text x="159" y="196" text-anchor="middle" font-size="13.5" font-weight="900" fill="${P5.main}">?</text>` +
      gdot(...A) + gdot(...B) + gdot(...C) +
      ptLabel(A[0], A[1], "A", 0, -10) + ptLabel(B[0], B[1], "B", 12, 14) + ptLabel(C[0], C[1], "C", -11, 14),
  );
}
/* ── L10 ladderWallFig: 벽에 기댄 사다리 장면(10m 빗변·바닥 6m·높이 ?) ──
   17px/m 실축척: 벽 접점 (156,52)·발 (258,188) → 가로 102=6m·세로 136=8m·빗변 170=10m. */
export function ladderWallFig(): string {
  const T: [number, number] = [156, 52];
  const F: [number, number] = [258, 188];
  const p = [0.8 * 4, -0.6 * 4]; // 사다리 폭 절반(빗변의 수직 방향)
  let rungs = "";
  for (const t of [0.16, 0.31, 0.46, 0.61, 0.76]) {
    const cx = F[0] + (T[0] - F[0]) * t;
    const cy = F[1] + (T[1] - F[1]) * t;
    rungs += `<line x1="${(cx + p[0]).toFixed(1)}" y1="${(cy + p[1]).toFixed(1)}" x2="${(cx - p[0]).toFixed(1)}" y2="${(cy - p[1]).toFixed(1)}" stroke="#A9702C" stroke-width="3"/>`;
  }
  return svg(
    "0 0 360 232",
    `<ellipse cx="258" cy="193" rx="36" ry="5" fill="#2A3A5E" opacity=".12"/>
    <ellipse cx="150" cy="193" rx="28" ry="4" fill="#2A3A5E" opacity=".1"/>
    <rect x="140" y="30" width="16" height="158" fill="url(#lw-wall)" stroke="#5F6B7A" stroke-width="1.6"/>
    <path d="M140 62 h16 M140 94 h16 M140 126 h16 M140 158 h16" stroke="#8A98A8" stroke-width="1.1" opacity=".5"/>
    <rect x="104" y="188" width="216" height="8" fill="url(#lw-gnd)"/>
    <line x1="104" y1="188" x2="320" y2="188" stroke="${P5.ink}" stroke-width="2.2"/>` +
      `<line x1="${(F[0] + p[0]).toFixed(1)}" y1="${(F[1] + p[1]).toFixed(1)}" x2="${(T[0] + p[0]).toFixed(1)}" y2="${(T[1] + p[1]).toFixed(1)}" stroke="#C98A3D" stroke-width="3.5" stroke-linecap="round"/>` +
      `<line x1="${(F[0] - p[0]).toFixed(1)}" y1="${(F[1] - p[1]).toFixed(1)}" x2="${(T[0] - p[0]).toFixed(1)}" y2="${(T[1] - p[1]).toFixed(1)}" stroke="#C98A3D" stroke-width="3.5" stroke-linecap="round"/>` +
      rungs +
      rightMark(156, 188, 0, 12, P5.ink) +
      `<path d="M156 206 h102 M156 201 v10 M258 201 v10" stroke="#8093A8" stroke-width="1.5"/>
    <text x="207" y="222" text-anchor="middle" font-size="12" font-weight="800" fill="#5A6B7E">6 m</text>
    <path d="M156 52 h-32" stroke="#8093A8" stroke-width="1.2" stroke-dasharray="4 3"/>
    <path d="M124 52 v136 M119 52 h10 M119 188 h10" stroke="#8093A8" stroke-width="1.5"/>
    <rect x="110" y="110" width="28" height="22" rx="8" fill="#FFFFFF" stroke="#E4C9D7" stroke-width="1.2"/>
    <text x="124" y="126" text-anchor="middle" font-size="14" font-weight="900" fill="${P5.main}">?</text>
    <text x="222" y="112" font-size="12" font-weight="800" fill="#8C5E00">10 m</text>`,
    `<linearGradient id="lw-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8EDF2"/><stop offset=".5" stop-color="#C9D3DC"/><stop offset="1" stop-color="#A9B6C2"/></linearGradient>
    <linearGradient id="lw-gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9C7A8"/><stop offset="1" stop-color="#B89A6E"/></linearGradient>`,
  );
}

/* ── L10 lunesFig: 히포크라테스의 초승달(6·8·10 직각삼각형, 20px/cm 실축척) ──
   빗변 반원은 안쪽(삼각형 쪽 — C를 지나는 큰 반원), 두 변 반원은 바깥.
   초승달 = 변 반원에서 빗변 반원 밖으로 남는 노란 조각 2개. */
export function lunesFig(): string {
  return svg(
    "0 0 360 190",
    `<path d="M80 150 A100 100 0 0 1 280 150 Z" fill="rgba(51,65,85,.06)" stroke="#8093A8" stroke-width="1.8"/>
    <path d="M80 150 A60 60 0 0 1 152 54 A100 100 0 0 0 80 150 Z" fill="url(#ln5-y)" stroke="#E0A800" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M152 54 A80 80 0 0 1 280 150 A100 100 0 0 0 152 54 Z" fill="url(#ln5-y)" stroke="#E0A800" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M80 150 L152 54 L280 150 Z" fill="#FFF7FA" stroke="${P5.ink}" stroke-width="2.2" stroke-linejoin="round"/>
    <line x1="80" y1="150" x2="280" y2="150" stroke="${P5.ink}" stroke-width="2.2"/>` +
      rightMark(152, 54, angleOf(152, 54, 80, 150), 10, P5.ink) +
      `<text x="129" y="112" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.ink}">6 cm</text>
    <text x="205" y="113" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.ink}">8 cm</text>
    <text x="180" y="170" text-anchor="middle" font-size="11.5" font-weight="900" fill="${P5.ink}">10 cm</text>`,
    `<linearGradient id="ln5-y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3C4"/><stop offset=".55" stop-color="#FFD43B"/><stop offset="1" stop-color="#F5B915"/></linearGradient>`,
  );
}

/* ── MINI5: 중2 Ⅴ recap 미니아트 도감(라즈베리 팔레트, 72×72) ── */
const MINI5: Record<string, string> = {
  // 큰 마트료시카·작은 마트료시카(같은 모양 다른 크기)
  sim: `<ellipse cx="25" cy="42" rx="12" ry="15" fill="url(#m5-deep)" stroke="#8C1843" stroke-width="1.4"/>
    <circle cx="25" cy="22" r="8" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.4"/>
    <circle cx="22.4" cy="21" r="1.3" fill="#5C1130"/><circle cx="27.6" cy="21" r="1.3" fill="#5C1130"/>
    <ellipse cx="51" cy="48" rx="8" ry="10" fill="url(#m5-deep)" stroke="#8C1843" stroke-width="1.3"/>
    <circle cx="51" cy="34.5" r="5.4" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.3"/>
    <circle cx="49.2" cy="33.8" r="1" fill="#5C1130"/><circle cx="52.8" cy="33.8" r="1" fill="#5C1130"/>`,
  // 카드 위 닮음 기호 ∽ + 1:2 태그
  symbol: `<rect x="12" y="12" width="48" height="32" rx="8" fill="url(#m5-paper)" stroke="#D9A8BC" stroke-width="1.4"/>
    <path d="M20 28 q8 -11 16 0 q8 11 16 0" fill="none" stroke="url(#m5-deep)" stroke-width="4.6" stroke-linecap="round"/>
    <rect x="20" y="48" width="32" height="14" rx="7" fill="url(#m5-deep)" stroke="#8C1843" stroke-width="1.2"/>
    <text x="36" y="58.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="#FFFFFF">1:2</text>`,
  // 닮은 두 삼각형 + 대응변 비 화살표
  prop: `<path d="M10 50 L34 50 L26 32 Z" fill="url(#m5-deep)" stroke="#8C1843" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M36 56 L64 56 L55 32 Z" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M26 24 q13 -12 26 2" fill="none" stroke="#E8A93E" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M52 26 l-6 -1 m6 1 l-1.4 -5.6" stroke="#E8A93E" stroke-width="2.2" stroke-linecap="round"/>`,
  // 정사각형·원엔 체크, 길쭉한 직사각형엔 X(항상 닮음 판별)
  always: `<rect x="10" y="12" width="15" height="15" rx="2.5" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.4"/>
    <circle cx="45" cy="19.5" r="8" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.4"/>
    <path d="M13 33 l3 3 5.5 -6 M41 33 l3 3 5.5 -6" stroke="#04B45F" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="12" y="44" width="42" height="10" rx="2.5" fill="#F1E4EA" stroke="#B98CA0" stroke-width="1.3"/>
    <path d="M58 44 l6 10 m0 -10 l-6 10" stroke="#F04452" stroke-width="2.4" stroke-linecap="round"/>`,
  // 큰 정사각형 안 작은 정사각형 4장(닮음비 1:2 → 넓이 1:4)
  area2: `<rect x="16" y="14" width="40" height="40" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.6"/>
    <path d="M36 14 V54 M16 34 H56" stroke="#8C1843" stroke-width="1.3" opacity=".7"/>
    <rect x="16" y="14" width="20" height="20" fill="url(#m5-deep)" stroke="#8C1843" stroke-width="1.3"/>`,
  // 아이소메트릭 큐브 2×2×2(부피 1:8)
  vol3: `<path d="M20 24 L36 16 L52 24 L36 32 Z" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M20 24 L36 32 L36 52 L20 44 Z" fill="#F7C6D8" stroke="#8C1843" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M36 32 L52 24 L52 44 L36 52 Z" fill="url(#m5-deep)" stroke="#8C1843" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M28 20 L44 28 M44 20 L28 28 M28 28 V48 M20 34 L36 42 M44 28 V48 M36 42 L52 34" stroke="#8C1843" stroke-width="1" opacity=".55" fill="none"/>`,
  // 미니 카드 3장(SSS·SAS·AA)
  cond: `<g transform="rotate(-8 17 34)"><rect x="8" y="22" width="18" height="24" rx="4" fill="url(#m5-paper)" stroke="#C2255C" stroke-width="1.3"/><text x="17" y="37" text-anchor="middle" font-size="7" font-weight="800" fill="#A61E4D">SSS</text></g>
    <g><rect x="27" y="18" width="18" height="24" rx="4" fill="url(#m5-paper)" stroke="#C2255C" stroke-width="1.3"/><text x="36" y="33" text-anchor="middle" font-size="7" font-weight="800" fill="#A61E4D">SAS</text></g>
    <g transform="rotate(8 55 34)"><rect x="46" y="22" width="18" height="24" rx="4" fill="url(#m5-paper)" stroke="#C2255C" stroke-width="1.3"/><text x="55" y="37" text-anchor="middle" font-size="7" font-weight="800" fill="#A61E4D">AA</text></g>`,
  // 삼각형 하나에 두 각 호 강조(AA)
  aa: `<path d="M36 12 L12 54 L62 54 Z" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M23 54 A11 11 0 0 0 17.5 44.5" fill="none" stroke="#E8A93E" stroke-width="2.6"/>
    <path d="M56.2 44.7 A11 11 0 0 0 51 54" fill="none" stroke="#0DA5C6" stroke-width="2.6"/>`,
  // 겹친 두 삼각형과 분리 화살표(숨은 닮음 찾기)
  hidden: `<path d="M26 12 L10 50 L52 50 Z" fill="none" stroke="#8C1843" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M26 12 L18.4 30 L38.3 30 Z" fill="url(#m5-deep)" stroke="#8C1843" stroke-width="1.3" stroke-linejoin="round" opacity=".9"/>
    <path d="M40 34 h8 m0 0 l-3 -2.6 m3 2.6 l-3 2.6" stroke="#E8A93E" stroke-width="2" stroke-linecap="round"/>
    <path d="M50 28 L43.6 43.3 L60.5 43.3 Z" fill="url(#m5-bd)" stroke="#C2255C" stroke-width="1.4" stroke-dasharray="3 2" stroke-linejoin="round"/>`,
  // 직각삼각형 속 수선의 발(작은 삼각형 3형제)
  triplet: `<path d="M10 52 L28.7 52 L28.7 27 Z" fill="rgba(232,169,62,.4)"/>
    <path d="M28.7 52 L62 52 L28.7 27 Z" fill="rgba(13,165,198,.3)"/>
    <path d="M10 52 L62 52 L28.7 27 Z" fill="none" stroke="#C2255C" stroke-width="1.8" stroke-linejoin="round"/>
    <line x1="28.7" y1="27" x2="28.7" y2="52" stroke="#8C1843" stroke-width="1.6"/>
    <path d="M28.7 47 h-4 v5" fill="none" stroke="#334155" stroke-width="1.3"/>`,
  // 삼각형 속 평행 슬라이스 선
  tripara: `<path d="M36 10 L12 56 L62 56 Z" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.6" stroke-linejoin="round"/>
    <line x1="22.4" y1="36" x2="50.9" y2="36" stroke="#C2255C" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M33.5 33.4 L38 36 L33.5 38.6 M33.5 53.4 L38 56 L33.5 58.6" fill="none" stroke="#334155" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  // 두 선분 비 2:1=2:1 → 평행 판정
  parajudge: `<text x="36" y="10" text-anchor="middle" font-size="8.5" font-weight="800" fill="#A61E4D">2:1=2:1</text>
    <path d="M36 16 L12 58 L60 58 Z" fill="none" stroke="#8C1843" stroke-width="1.5" stroke-linejoin="round"/>
    <line x1="36" y1="16" x2="20" y2="44" stroke="#E8A93E" stroke-width="3"/>
    <line x1="20" y1="44" x2="12" y2="58" stroke="#0DA5C6" stroke-width="3"/>
    <line x1="36" y1="16" x2="52" y2="44" stroke="#E8A93E" stroke-width="3"/>
    <line x1="52" y1="44" x2="60" y2="58" stroke="#0DA5C6" stroke-width="3"/>
    <line x1="20" y1="44" x2="52" y2="44" stroke="#12B886" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M33 41.4 L38 44 L33 46.6 M33 55.4 L38 58 L33 60.6" fill="none" stroke="#12B886" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  // 중점 연결선(절반 태그)
  midseg: `<path d="M36 14 L12 58 L60 58 Z" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.6" stroke-linejoin="round"/>
    <line x1="24" y1="36" x2="48" y2="36" stroke="#C2255C" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M27.4 23.6 L32.6 26.4 M15.4 45.6 L20.6 48.4 M44.6 23.6 L39.4 26.4 M56.6 45.6 L51.4 48.4" stroke="#8C1843" stroke-width="1.8" stroke-linecap="round"/>
    <text x="36" y="30" text-anchor="middle" font-size="10" font-weight="800" fill="#A61E4D">½</text>`,
  // 찌그러진 사각형 속 평행사변형
  midquad: `<path d="M18 18 L8 46 L50 58 L62 14 Z" fill="#FDF0F5" stroke="#8C1843" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M13 32 L29 52 L56 36 L40 16 Z" fill="rgba(194,37,92,.25)" stroke="#C2255C" stroke-width="1.8" stroke-linejoin="round"/>`,
  // 평행선 3줄과 사선
  plines: `<path d="M10 20 H62 M10 36 H62 M10 52 H62" stroke="#8C1843" stroke-width="2" stroke-linecap="round"/>
    <path d="M52 17.2 L57 20 L52 22.8 M52 33.2 L57 36 L52 38.8 M52 49.2 L57 52 L52 54.8" fill="none" stroke="#8C1843" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="24" y1="12" x2="48" y2="60" stroke="#E8A93E" stroke-width="2.6" stroke-linecap="round"/>`,
  // 3단 접힌 편지지(같은 폭으로 나뉜 평행선)
  foldmagic: `<path d="M18 14 h36 l-8 12 h-36 z" fill="url(#m5-paper)" stroke="#B98CA0" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M10 26 h36 l8 12 h-36 z" fill="url(#m5-bd)" stroke="#B98CA0" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M18 38 h36 l-8 12 h-36 z" fill="url(#m5-paper)" stroke="#B98CA0" stroke-width="1.3" stroke-linejoin="round"/>`,
  // 세 중선과 무게중심
  centroid: `<path d="M36 12 L10 56 L62 52 Z" fill="url(#m5-bd)" stroke="#8C1843" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M36 12 L36 54 M10 56 L49 32 M62 52 L23 34" stroke="#8C1843" stroke-width="1.3" opacity=".6"/>
    <circle cx="36" cy="40" r="3.6" fill="#C2255C" stroke="#FFFFFF" stroke-width="1.2"/>`,
  // 6색 조각 삼각형(넓이 6등분)
  sixpart: `<path d="M36 12 L23 34 L36 40 Z" fill="rgba(232,169,62,.5)"/>
    <path d="M23 34 L10 56 L36 40 Z" fill="rgba(13,165,198,.4)"/>
    <path d="M10 56 L36 54 L36 40 Z" fill="rgba(232,84,126,.42)"/>
    <path d="M36 54 L62 52 L36 40 Z" fill="rgba(18,184,134,.4)"/>
    <path d="M62 52 L49 32 L36 40 Z" fill="rgba(124,107,255,.38)"/>
    <path d="M49 32 L36 12 L36 40 Z" fill="rgba(61,91,192,.36)"/>
    <path d="M36 12 L10 56 L62 52 Z" fill="none" stroke="#8C1843" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="36" cy="40" r="2.6" fill="#C2255C"/>`,
  // 세 정사각형 붙은 직각삼각형(피타고라스)
  pytha: `<rect x="28" y="44" width="16" height="16" fill="rgba(232,169,62,.45)" stroke="#B26200" stroke-width="1.3"/>
    <rect x="16" y="32" width="12" height="12" fill="rgba(13,165,198,.35)" stroke="#0B7285" stroke-width="1.3"/>
    <path d="M28 32 L44 44 L56 28 L40 16 Z" fill="rgba(194,37,92,.3)" stroke="#C2255C" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M28 32 L28 44 L44 44 Z" fill="#FFFFFF" stroke="#334155" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M28 41 h3 v3" fill="none" stroke="#334155" stroke-width="1.2"/>`,
  // 정사각형 틀 속 직각삼각형 4개와 가운데 구멍(퍼즐 증명)
  puzzle: `<rect x="14" y="14" width="44" height="44" fill="none" stroke="#8C1843" stroke-width="1.6"/>
    <path d="M14 14 L30 14 L14 42 Z M30 14 L58 14 L58 30 Z M58 30 L58 58 L42 58 Z M42 58 L14 58 L14 42 Z" fill="url(#m5-deep)" stroke="#8C1843" stroke-width="1.1" stroke-linejoin="round" opacity=".85"/>
    <path d="M30 14 L58 30 L42 58 L14 42 Z" fill="none" stroke="#C2255C" stroke-width="1.5" stroke-dasharray="4 3" stroke-linejoin="round"/>`,
  // 매듭 로프 직각삼각형(3·4·5)
  judge345: `<path d="M14 52 L50 52 L14 25 Z" fill="none" stroke="#C98A3D" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M19 52 v-5 h-5" fill="none" stroke="#334155" stroke-width="1.3"/>
    ${[[14, 52], [23, 52], [32, 52], [41, 52], [50, 52], [14, 43], [14, 34], [14, 25], [21.2, 30.4], [28.4, 35.8], [35.6, 41.2], [42.8, 46.6]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.1" fill="#8C5A1E"/>`)
      .join("")}`,
  // 크기 다른 직각삼각형 2개 겹침(3·4·5와 6·8·10)
  family: `<path d="M14 56 L58 56 L14 23 Z" fill="none" stroke="#8C1843" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M14 56 L36 56 L14 39.5 Z" fill="url(#m5-bd)" stroke="#C2255C" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M18 56 v-4 h-4" fill="none" stroke="#334155" stroke-width="1.3"/>`,
};

/** 중2 Ⅴ recap 미니아트 — simMiniArt(72×72, 라즈베리 m5- 그라데이션).
 *  키: sim·symbol·prop·always·area2·vol3·cond·aa·hidden·triplet·tripara·parajudge·
 *  midseg·midquad·plines·foldmagic·centroid·sixpart·pytha·puzzle·judge345·family */
export function simMiniArt(key: string): string {
  const m = MINI5[key];
  if (!m) return "";
  return svg(
    "0 0 72 72",
    `<ellipse cx="36" cy="62" rx="20" ry="3.5" fill="#2A3A5E" opacity=".1"/>${m}`,
    `<linearGradient id="m5-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBDFE9"/><stop offset="1" stop-color="#F3AECB"/></linearGradient>
    <linearGradient id="m5-deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EE7FAC"/><stop offset="1" stop-color="#C2255C"/></linearGradient>
    <linearGradient id="m5-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F9EEF3"/></linearGradient>`,
  );
}
