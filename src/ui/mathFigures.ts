// mathFigures — 수학 퀴즈 그림 SVG + recap 미니아트(mathMiniArt).
// 밝은 카드 위 그림 — 얇은 잉크 라인 + 부호 색(--m-pos/--m-neg 대응 고정색)만 절제해 쓴다.
// 좌표 주석을 남겨 스팟·라벨과 1:1 대응(geoFigures 관례).

const POS = "#2F6FE4";
const NEG = "#E8434F";
const INK = "#334155";
const FAINT = "#94A3B8";
const CYAN = "#0DA5C6";
const VIOLET = "#8A6EE0";
const AMBER = "#F08C2E";

const svg = (vb: string, inner: string): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${inner}</svg>`;

/* ── 수직선 공통 조각 ── */
function line(lo: number, hi: number, X: (v: number) => number, y: number, labelEvery = 1): string {
  let out = `<line x1="${X(lo) - 10}" y1="${y}" x2="${X(hi) + 10}" y2="${y}" stroke="${FAINT}" stroke-width="2" stroke-linecap="round"/>`;
  for (let v = lo; v <= hi; v++) {
    const big = v === 0;
    out += `<line x1="${X(v)}" y1="${y - (big ? 8 : 5)}" x2="${X(v)}" y2="${y + (big ? 8 : 5)}" stroke="${big ? INK : "#C2CBD6"}" stroke-width="${big ? 2.2 : 1.4}"/>`;
    if (v % labelEvery === 0)
      out += `<text x="${X(v)}" y="${y + 24}" text-anchor="middle" font-size="12" font-weight="700" fill="${big ? INK : FAINT}">${String(v).replace("-", "−")}</text>`;
  }
  return out;
}

/** 수직선 위 점 4개(A~D) — 대응 수 찾기·대소 문제용.
 *  기하: -5..+5, A=-3.5? 기본 마크 [-4, -1.5, +0.5, +3]. */
export function numlinePointsFig(marks: { v: number; label: string }[] = [
  { v: -4, label: "A" },
  { v: -1.5, label: "B" },
  { v: 0.5, label: "C" },
  { v: 3, label: "D" },
]): string {
  const X = (v: number): number => 30 + ((v + 5) / 10) * 300;
  let pts = "";
  for (const m of marks) {
    pts +=
      `<circle cx="${X(m.v)}" cy="64" r="5.5" fill="${m.v < 0 ? NEG : POS}"/>` +
      `<text x="${X(m.v)}" y="44" text-anchor="middle" font-size="13.5" font-weight="800" fill="${INK}">${m.label}</text>`;
  }
  return svg("0 0 360 110", line(-5, 5, X, 64) + pts);
}

/** 절댓값 거리 호 — |−3|과 |+3|이 같은 거리임을 보여주는 그림. */
export function absArcsFig(): string {
  const X = (v: number): number => 30 + ((v + 5) / 10) * 300;
  const arc = (a: number, b: number, col: string, lift: number): string =>
    `<path d="M ${X(a)} 58 Q ${(X(a) + X(b)) / 2} ${58 - lift} ${X(b)} 58" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/>`;
  return svg(
    "0 0 360 120",
    line(-5, 5, X, 70) +
      arc(-3, 0, NEG, 40) +
      arc(0, 3, POS, 40) +
      `<circle cx="${X(-3)}" cy="70" r="5.5" fill="${NEG}"/><circle cx="${X(3)}" cy="70" r="5.5" fill="${POS}"/><circle cx="${X(0)}" cy="70" r="4" fill="${INK}"/>` +
      `<text x="${X(-1.5)}" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="${NEG}">3칸</text>` +
      `<text x="${X(1.5)}" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="${POS}">3칸</text>`,
  );
}

/** 수직선 산책 그림 — a 이동 후 b 이동(덧셈 문제용). */
export function walkFig(a: number, b: number): string {
  const lo = Math.min(0, a, a + b) - 1;
  const hi = Math.max(0, a, a + b) + 1;
  const X = (v: number): number => 26 + ((v - lo) / (hi - lo)) * 308;
  const arc = (f: number, t: number, col: string, lift: number): string => {
    const dir = t > f ? 1 : -1;
    return (
      `<path d="M ${X(f)} 56 Q ${(X(f) + X(t)) / 2} ${56 - lift} ${X(t)} 56" stroke="${col}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
      `<path d="M ${X(t) - dir * 8} ${50} L ${X(t)} 56 L ${X(t) - dir * 8} ${61}" stroke="${col}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  };
  return svg(
    "0 0 360 116",
    line(lo, hi, X, 66) +
      arc(0, a, a >= 0 ? POS : NEG, 34) +
      arc(a, a + b, b >= 0 ? POS : NEG, 48) +
      `<circle cx="${X(0)}" cy="66" r="4.5" fill="${INK}"/>`,
  );
}

/** 셈돌 그림 — (+) 파랑 n개, (−) 빨강 m개. 상쇄 쌍 표시 옵션. */
export function stonesFig(pos: number, neg: number, pairLines = true): string {
  let out = "";
  const R = 15;
  const y1 = 34;
  const y2 = 82;
  const n = Math.max(pos, neg);
  const x0 = 180 - (n - 1) * 21;
  for (let i = 0; i < pos; i++) {
    out += `<circle cx="${x0 + i * 42}" cy="${y1}" r="${R}" fill="${POS}"/><text x="${x0 + i * 42}" y="${y1 + 5}" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">+</text>`;
  }
  for (let i = 0; i < neg; i++) {
    out += `<circle cx="${x0 + i * 42}" cy="${y2}" r="${R}" fill="${NEG}"/><text x="${x0 + i * 42}" y="${y2 + 5}" text-anchor="middle" font-size="16" font-weight="900" fill="#fff">−</text>`;
  }
  if (pairLines) {
    const pairs = Math.min(pos, neg);
    for (let i = 0; i < pairs; i++) {
      out += `<line x1="${x0 + i * 42}" y1="${y1 + R + 2}" x2="${x0 + i * 42}" y2="${y2 - R - 2}" stroke="${FAINT}" stroke-width="1.6" stroke-dasharray="3 4"/>`;
    }
  }
  return svg("0 0 360 116", out);
}

/** 소인수 벤 그림 — 36과 60(교집합 2·2·3). GCD/LCM 문제용. */
export function vennQuizFig(): string {
  const chip = (x: number, y: number, v: number): string => {
    const col = v === 2 ? POS : v === 3 ? "#0CA678" : AMBER;
    return `<circle cx="${x}" cy="${y}" r="13" fill="${col}"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="900" fill="#fff">${v}</text>`;
  };
  return svg(
    "0 0 360 190",
    `<circle cx="130" cy="100" r="76" fill="rgba(13,165,198,.08)" stroke="${CYAN}" stroke-width="2"/>` +
      `<circle cx="230" cy="100" r="76" fill="rgba(124,107,255,.07)" stroke="${VIOLET}" stroke-width="2"/>` +
      `<text x="66" y="28" font-size="15" font-weight="800" fill="${CYAN}">36</text>` +
      `<text x="282" y="28" font-size="15" font-weight="800" fill="${VIOLET}">60</text>` +
      chip(84, 100, 3) +
      chip(180, 62, 2) +
      chip(180, 100, 2) +
      chip(180, 138, 3) +
      chip(276, 100, 5),
  );
}

/** 인수 트리 빈칸 그림 — 84 = 2×42, 42 = ?×7, … (빈칸 □ 포함). */
export function treeBlankFig(): string {
  const node = (x: number, y: number, t: string, blank = false, prime = false): string =>
    `<circle cx="${x}" cy="${y}" r="19" fill="${blank ? "#FFF4D6" : prime ? "#DCF7EA" : "#EAF5FA"}" stroke="${blank ? AMBER : prime ? "#0CA678" : "#9BB8C8"}" stroke-width="${blank ? 2.2 : 1.8}"/>` +
    `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="15" font-weight="800" fill="${blank ? "#B3771A" : prime ? "#046648" : INK}">${t}</text>`;
  const edge = (x1: number, y1: number, x2: number, y2: number): string =>
    `<line x1="${x1}" y1="${y1 + 19}" x2="${x2}" y2="${y2 - 19}" stroke="#A8BCCB" stroke-width="2.2" stroke-linecap="round"/>`;
  return svg(
    "0 0 360 210",
    edge(180, 34, 110, 100) +
      edge(180, 34, 250, 100) +
      edge(250, 100, 200, 170) +
      edge(250, 100, 300, 170) +
      node(180, 34, "84") +
      node(110, 100, "2", false, true) +
      node(250, 100, "42") +
      node(200, 170, "㉠", true) +
      node(300, 170, "7", false, true) +
      `<text x="66" y="196" font-size="12.5" font-weight="700" fill="${FAINT}">42 = ㉠ × 7</text>`,
  );
}

/** 온도 카드 그림 — 네 도시의 아침 기온(대소 비교 문제). */
export function tempCardsFig(): string {
  const card = (x: number, name: string, t: string, cold: boolean): string =>
    `<rect x="${x}" y="26" width="76" height="86" rx="12" fill="#fff" stroke="#D5DDE6" stroke-width="1.6"/>` +
    `<text x="${x + 38}" y="50" text-anchor="middle" font-size="13" font-weight="800" fill="${INK}">${name}</text>` +
    `<text x="${x + 38}" y="86" text-anchor="middle" font-size="18" font-weight="900" fill="${cold ? POS : NEG}">${t}</text>`;
  // 주의: 음수 온도는 빨강이 아니라 '추움' 직관과 반대라 — 양수 NEG/음수 POS 색이 아니라
  // 온도 표기는 전부 잉크색이 안전하지만, 부호 학습 중이므로 +빨강/−파랑(온도 관례)을 쓴다.
  return svg(
    "0 0 360 130",
    card(10, "서울", "−3℃", true) + card(98, "부산", "+2℃", false) + card(186, "대전", "−5℃", true) + card(274, "제주", "+6℃", false),
  );
}

/** 거듭제곱 칩 그림 — 2·2·2·5·5 (표기 문제). */
export function powChipsFig(): string {
  const chip = (x: number, v: number, col: string): string =>
    `<rect x="${x}" y="34" width="52" height="52" rx="14" fill="${col}"/><text x="${x + 26}" y="68" text-anchor="middle" font-size="21" font-weight="900" fill="#fff">${v}</text>`;
  return svg(
    "0 0 360 120",
    chip(24, 2, CYAN) + chip(88, 2, CYAN) + chip(152, 2, CYAN) + chip(228, 5, VIOLET) + chip(292, 5, VIOLET) +
      `<text x="180" y="110" text-anchor="middle" font-size="12.5" font-weight="700" fill="${FAINT}">같은 수끼리 몇 번 곱했을까요?</text>`,
  );
}

/** 분배법칙 넓이 그림 — 5×(10+3)을 두 조각으로. */
export function areaFig(): string {
  return svg(
    "0 0 360 150",
    `<rect x="40" y="30" width="200" height="86" fill="rgba(13,165,198,.14)" stroke="${CYAN}" stroke-width="2"/>` +
      `<rect x="240" y="30" width="60" height="86" fill="rgba(240,140,46,.16)" stroke="${AMBER}" stroke-width="2"/>` +
      `<text x="140" y="78" text-anchor="middle" font-size="15" font-weight="800" fill="#0A87A3">5 × 10</text>` +
      `<text x="270" y="78" text-anchor="middle" font-size="15" font-weight="800" fill="#B3771A">5 × 3</text>` +
      `<text x="170" y="20" text-anchor="middle" font-size="12.5" font-weight="700" fill="${INK}">가로 10 + 3</text>` +
      `<text x="24" y="78" text-anchor="middle" font-size="12.5" font-weight="700" fill="${INK}" transform="rotate(-90 24 78)">세로 5</text>`,
  );
}

/** 버스 시간표 그림 — 4분·6분 배수 점등(최소공배수 문제). */
export function busTimesFig(): string {
  const row = (y: number, col: string, mul: number, name: string): string => {
    let out = `<text x="14" y="${y + 5}" font-size="12.5" font-weight="800" fill="${col}">${name}</text>`;
    for (let m = 1; m <= 12; m++) {
      const on = m % mul === 0;
      out += `<circle cx="${66 + (m - 1) * 24}" cy="${y}" r="${on ? 8 : 3.4}" fill="${on ? col : "#D5DDE6"}"/>`;
      if (on) out += `<text x="${66 + (m - 1) * 24}" y="${y + 3.5}" text-anchor="middle" font-size="9" font-weight="800" fill="#fff">${m}</text>`;
    }
    return out;
  };
  return svg(
    "0 0 360 120",
    row(34, CYAN, 4, "4분") +
      row(78, "#0CA678", 6, "6분") +
      `<rect x="${66 + 11 * 24 - 13}" y="18" width="26" height="76" rx="9" fill="none" stroke="${AMBER}" stroke-width="2" stroke-dasharray="4 4"/>`,
  );
}

/** 체질이 끝난 1~24 격자 — 소수만 남은 그림(소수 찾기 문제). */
export function sieveGridFig(): string {
  const primes = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
  let out = "";
  for (let v = 1; v <= 24; v++) {
    const c = (v - 1) % 6;
    const r = Math.floor((v - 1) / 6);
    const x = 24 + c * 54;
    const y = 12 + r * 44;
    const p = primes.has(v);
    out +=
      `<rect x="${x}" y="${y}" width="44" height="34" rx="9" fill="${p ? "#DCF7EA" : "#F1F5F9"}" stroke="${p ? "#0CA678" : "#D5DDE6"}" stroke-width="${p ? 1.8 : 1.2}"/>` +
      `<text x="${x + 22}" y="${y + 22}" text-anchor="middle" font-size="14" font-weight="800" fill="${p ? "#046648" : "#B0BCC8"}">${v}</text>` +
      (p ? "" : `<line x1="${x + 10}" y1="${y + 17}" x2="${x + 34}" y2="${y + 17}" stroke="#B0BCC8" stroke-width="1.6" transform="rotate(-8 ${x + 22} ${y + 17})"/>`);
  }
  return svg("0 0 360 190", out);
}

/** 약수 격자 — 63 = 3²×7의 약수를 (1,3,9)×(1,7)로 만드는 표. */
export function divisorGridFig(): string {
  const cell = (x: number, y: number, t: string, head = false): string =>
    `<rect x="${x}" y="${y}" width="86" height="40" rx="8" fill="${head ? "rgba(13,165,198,.12)" : "#fff"}" stroke="${head ? CYAN : "#D5DDE6"}" stroke-width="1.4"/>` +
    `<text x="${x + 43}" y="${y + 25}" text-anchor="middle" font-size="14" font-weight="${head ? 900 : 700}" fill="${head ? "#0A87A3" : INK}">${t}</text>`;
  return svg(
    "0 0 360 190",
    cell(42, 14, "×", true) +
      cell(134, 14, "1", true) +
      cell(226, 14, "7", true) +
      cell(42, 60, "1", true) +
      cell(134, 60, "1") +
      cell(226, 60, "7") +
      cell(42, 106, "3", true) +
      cell(134, 106, "3") +
      cell(226, 106, "21") +
      cell(42, 152, "9", true) +
      cell(134, 152, "9") +
      cell(226, 152, "63"),
  );
}

/** 정삼각형 막대 패턴 그림 — 1개(3), 2개(5), 3개(7)… 문자의 필요(Ⅱ L1). */
export function triPatternFig(): string {
  const tri = (x0: number, n: number): string => {
    let out = "";
    const s = 40;
    const h = 34;
    for (let i = 0; i < n; i++) {
      const up = i % 2 === 0;
      const x = x0 + i * (s / 2);
      out += up
        ? `<path d="M ${x} 76 L ${x + s / 2} ${76 - h} L ${x + s} 76 Z" fill="rgba(13,165,198,.1)" stroke="${CYAN}" stroke-width="2" stroke-linejoin="round"/>`
        : `<path d="M ${x} ${76 - h} L ${x + s / 2} 76 L ${x + s} ${76 - h}" fill="none" stroke="${CYAN}" stroke-width="2" stroke-linejoin="round"/>`;
    }
    return out;
  };
  return svg(
    "0 0 360 130",
    tri(18, 1) +
      tri(94, 2) +
      tri(196, 3) +
      `<text x="38" y="102" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">1개 — 3</text>` +
      `<text x="134" y="102" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">2개 — 5</text>` +
      `<text x="256" y="102" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">3개 — 7</text>` +
      `<text x="330" y="70" text-anchor="middle" font-size="17" font-weight="900" fill="${FAINT}">…</text>`,
  );
}

/** 양팔저울 그림 — 왼쪽 x상자+구슬 2, 오른쪽 구슬 6(평형). 등식의 성질 문제용. */
export function scaleEqFig(): string {
  const bead = (x: number, y: number): string =>
    `<circle cx="${x}" cy="${y}" r="8" fill="#FFD98A" stroke="#D8952E" stroke-width="1.3"/>`;
  const box = (x: number, y: number): string =>
    `<rect x="${x - 11}" y="${y - 10}" width="22" height="20" rx="4" fill="rgba(13,165,198,.85)" stroke="#076074" stroke-width="1.3"/>` +
    `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12" font-weight="900" font-style="italic" fill="#fff">x</text>`;
  return svg(
    "0 0 360 150",
    `<path d="M 180 40 L 168 128 L 192 128 Z" fill="#C89A5E" stroke="#7E5A2E" stroke-width="1.4"/>` +
      `<rect x="130" y="126" width="100" height="8" rx="4" fill="#B8895A" stroke="#7E5A2E" stroke-width="1.2"/>` +
      `<rect x="76" y="36" width="208" height="7" rx="3.5" fill="#94A2B4" stroke="#4E5D6E" stroke-width="1.2"/>` +
      `<circle cx="180" cy="40" r="6" fill="#54677A"/>` +
      `<line x1="80" y1="42" x2="66" y2="72" stroke="${FAINT}" stroke-width="1.5"/><line x1="80" y1="42" x2="94" y2="72" stroke="${FAINT}" stroke-width="1.5"/>` +
      `<line x1="280" y1="42" x2="266" y2="72" stroke="${FAINT}" stroke-width="1.5"/><line x1="280" y1="42" x2="294" y2="72" stroke="${FAINT}" stroke-width="1.5"/>` +
      `<ellipse cx="80" cy="78" rx="42" ry="7" fill="#D8E2EC" stroke="#6E7C8C" stroke-width="1.3"/>` +
      `<ellipse cx="280" cy="78" rx="42" ry="7" fill="#D8E2EC" stroke="#6E7C8C" stroke-width="1.3"/>` +
      box(62, 60) +
      bead(88, 62) +
      bead(104, 66) +
      bead(258, 62) +
      bead(276, 62) +
      bead(294, 62) +
      bead(266, 44) +
      bead(284, 44),
  );
}

/* ── recap 미니아트 ─────────────────────────────────────────── */
const MINI: Record<string, string> = {
  sieve: svg(
    "0 0 84 84",
    `<circle cx="40" cy="44" r="26" fill="#F2E2C0" stroke="#B8965E" stroke-width="2.4"/>` +
      `<path d="M22 36h36M20 44h40M22 52h36M32 22v44M40 20v48M48 22v44" stroke="#C8A468" stroke-width="1.2" opacity=".7"/>` +
      `<circle cx="34" cy="38" r="4.5" fill="${AMBER}"/><circle cx="46" cy="50" r="4.5" fill="${AMBER}"/>` +
      `<path d="M60 26 l14 -12" stroke="#8C6A3E" stroke-width="5" stroke-linecap="round"/>`,
  ),
  pow: svg(
    "0 0 84 84",
    `<rect x="14" y="30" width="38" height="38" rx="11" fill="${CYAN}"/><text x="33" y="56" text-anchor="middle" font-size="19" font-weight="900" fill="#fff">2</text>` +
      `<circle cx="58" cy="28" r="13" fill="#FFB01F" stroke="#fff" stroke-width="2.5"/><text x="58" y="33" text-anchor="middle" font-size="13" font-weight="900" fill="#5C3A00">3</text>`,
  ),
  tree: svg(
    "0 0 84 84",
    `<line x1="42" y1="24" x2="24" y2="52" stroke="#A8BCCB" stroke-width="2.4"/><line x1="42" y1="24" x2="60" y2="52" stroke="#A8BCCB" stroke-width="2.4"/>` +
      `<circle cx="42" cy="20" r="12" fill="#AEE4F0" stroke="#0E7A92" stroke-width="1.8"/>` +
      `<circle cx="24" cy="58" r="10" fill="#9FE8C8" stroke="#0C8A5E" stroke-width="1.8"/><circle cx="60" cy="58" r="10" fill="#9FE8C8" stroke="#0C8A5E" stroke-width="1.8"/>`,
  ),
  venn: svg(
    "0 0 84 84",
    `<circle cx="32" cy="42" r="22" fill="rgba(13,165,198,.16)" stroke="${CYAN}" stroke-width="2"/>` +
      `<circle cx="52" cy="42" r="22" fill="rgba(124,107,255,.14)" stroke="${VIOLET}" stroke-width="2"/>` +
      `<circle cx="42" cy="42" r="5" fill="${AMBER}"/>`,
  ),
  numline: svg(
    "0 0 84 84",
    `<line x1="8" y1="46" x2="76" y2="46" stroke="${FAINT}" stroke-width="2.4" stroke-linecap="round"/>` +
      `<line x1="42" y1="36" x2="42" y2="56" stroke="${INK}" stroke-width="2.4"/>` +
      `<circle cx="22" cy="46" r="5.5" fill="${NEG}"/><circle cx="62" cy="46" r="5.5" fill="${POS}"/>`,
  ),
  abs: svg(
    "0 0 84 84",
    `<line x1="8" y1="52" x2="76" y2="52" stroke="${FAINT}" stroke-width="2.4"/>` +
      `<path d="M22 48 Q32 22 42 48" stroke="${NEG}" stroke-width="2.6" fill="none"/><path d="M42 48 Q52 22 62 48" stroke="${POS}" stroke-width="2.6" fill="none"/>` +
      `<circle cx="22" cy="52" r="5" fill="${NEG}"/><circle cx="62" cy="52" r="5" fill="${POS}"/><circle cx="42" cy="52" r="4" fill="${INK}"/>`,
  ),
  stones: svg(
    "0 0 84 84",
    `<circle cx="30" cy="32" r="13" fill="${POS}"/><text x="30" y="37" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">+</text>` +
      `<circle cx="54" cy="54" r="13" fill="${NEG}"/><text x="54" y="59" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">−</text>` +
      `<path d="M38 40 L46 46" stroke="${FAINT}" stroke-width="2" stroke-dasharray="3 3"/>`,
  ),
  swap: svg(
    "0 0 84 84",
    `<path d="M18 34 h40 l-8 -8 M66 50 h-40 l8 8" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="66" cy="34" r="7" fill="${NEG}"/><circle cx="18" cy="50" r="7" fill="${POS}"/>`,
  ),
  pattern: svg(
    "0 0 84 84",
    `<rect x="16" y="16" width="52" height="12" rx="6" fill="rgba(13,165,198,.25)"/>` +
      `<rect x="16" y="36" width="52" height="12" rx="6" fill="rgba(13,165,198,.45)"/>` +
      `<rect x="16" y="56" width="52" height="12" rx="6" fill="${CYAN}"/>` +
      `<path d="M74 20 v44 l-5 -7 M74 64 l5 -7" stroke="${AMBER}" stroke-width="2.4" stroke-linecap="round"/>`,
  ),
  area: svg(
    "0 0 84 84",
    `<rect x="12" y="24" width="40" height="38" fill="rgba(13,165,198,.2)" stroke="${CYAN}" stroke-width="2"/>` +
      `<rect x="52" y="24" width="20" height="38" fill="rgba(240,140,46,.22)" stroke="${AMBER}" stroke-width="2"/>`,
  ),
  boss: svg(
    "0 0 84 84",
    `<path d="M24 60 L20 30 l14 10 L42 22 l8 18 14 -10 -4 30 z" fill="#FFD98A" stroke="#D8952E" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M24 66 h36" stroke="#D8952E" stroke-width="3.4" stroke-linecap="round"/>`,
  ),
  order: svg(
    "0 0 84 84",
    `<circle cx="24" cy="26" r="11" fill="#FFF4D6" stroke="${AMBER}" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-size="12" font-weight="900" fill="#B3771A">( )</text>` +
      `<rect x="44" y="16" width="22" height="20" rx="6" fill="rgba(13,165,198,.2)" stroke="${CYAN}" stroke-width="1.8"/><text x="55" y="30" text-anchor="middle" font-size="12" font-weight="900" fill="#0A87A3">×÷</text>` +
      `<rect x="30" y="50" width="24" height="20" rx="6" fill="#EEF3F8" stroke="${FAINT}" stroke-width="1.8"/><text x="42" y="64" text-anchor="middle" font-size="12" font-weight="900" fill="${INK}">+−</text>`,
  ),
  recip: svg(
    "0 0 84 84",
    `<text x="30" y="38" text-anchor="middle" font-size="22" font-weight="900" fill="${INK}">2/3</text>` +
      `<path d="M52 30 a12 12 0 1 1 -2 18" stroke="${CYAN}" stroke-width="2.6" stroke-linecap="round"/><path d="M46 44 l4 6 6 -4" stroke="${CYAN}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<text x="36" y="70" text-anchor="middle" font-size="22" font-weight="900" fill="${CYAN}">3/2</text>`,
  ),
};

export function mathMiniArt(key: string): string {
  return MINI[key] ?? "";
}
