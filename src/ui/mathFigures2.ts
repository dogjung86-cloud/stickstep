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
};

/** recap 카드 미니아트 — calcMiniArt("divide" | "cycle" | "denom" | "shift" | "pow" | "mono" | "poly" | "expand") */
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
    <radialGradient id="mi-gr" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#7BE3AE"/><stop offset="1" stop-color="#0BA05F"/></radialGradient>`,
  );
}
