// mathFigures, 수학 퀴즈 그림 SVG + recap 미니아트(mathMiniArt).
// 밝은 카드 위 그림, 얇은 잉크 라인 + 부호 색(--m-pos/--m-neg 대응 고정색)만 절제해 쓴다.
// 좌표 주석을 남겨 스팟·라벨과 1:1 대응(geoFigures 관례).
// Ⅲ 좌표평면 그림은 mathKit의 planeSpec(축·모눈 단일 진실 공급원)을 재사용한다.
import { planeSpec } from "./mathKit";
import { angleArc, rightMark, tickMark, arrowHead, lineSvg, dot as gdot, ptLabel } from "./geoKit";

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

/** 수직선 위 점 4개(A~D), 대응 수 찾기·대소 문제용.
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

/** 절댓값 거리 호, |−3|과 |+3|이 같은 거리임을 보여주는 그림. */
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

/** 수직선 산책 그림, a 이동 후 b 이동(덧셈 문제용). */
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

/** 셈돌 그림, (+) 파랑 n개, (−) 빨강 m개. 상쇄 쌍 표시 옵션. */
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

/** 소인수 벤 그림, 36과 60(교집합 2·2·3). GCD/LCM 문제용. */
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

/** 인수 트리 빈칸 그림, 84 = 2×42, 42 = ?×7, … (빈칸 □ 포함). */
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

/** 온도 카드 그림, 네 도시의 아침 기온(대소 비교 문제). */
export function tempCardsFig(): string {
  const card = (x: number, name: string, t: string, cold: boolean): string =>
    `<rect x="${x}" y="26" width="76" height="86" rx="12" fill="#fff" stroke="#D5DDE6" stroke-width="1.6"/>` +
    `<text x="${x + 38}" y="50" text-anchor="middle" font-size="13" font-weight="800" fill="${INK}">${name}</text>` +
    `<text x="${x + 38}" y="86" text-anchor="middle" font-size="18" font-weight="900" fill="${cold ? POS : NEG}">${t}</text>`;
  // 주의: 음수 온도는 빨강이 아니라 '추움' 직관과 반대라, 양수 NEG/음수 POS 색이 아니라
  // 온도 표기는 전부 잉크색이 안전하지만, 부호 학습 중이므로 +빨강/−파랑(온도 관례)을 쓴다.
  return svg(
    "0 0 360 130",
    card(10, "서울", "−3℃", true) + card(98, "부산", "+2℃", false) + card(186, "대전", "−5℃", true) + card(274, "제주", "+6℃", false),
  );
}

/** 거듭제곱 칩 그림, 2·2·2·5·5 (표기 문제). */
export function powChipsFig(): string {
  const chip = (x: number, v: number, col: string): string =>
    `<rect x="${x}" y="34" width="52" height="52" rx="14" fill="${col}"/><text x="${x + 26}" y="68" text-anchor="middle" font-size="21" font-weight="900" fill="#fff">${v}</text>`;
  return svg(
    "0 0 360 120",
    chip(24, 2, CYAN) + chip(88, 2, CYAN) + chip(152, 2, CYAN) + chip(228, 5, VIOLET) + chip(292, 5, VIOLET) +
      `<text x="180" y="110" text-anchor="middle" font-size="12.5" font-weight="700" fill="${FAINT}">같은 수끼리 몇 번 곱했을까요?</text>`,
  );
}

/** 분배법칙 넓이 그림, 5×(10+3)을 두 조각으로. */
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

/** 버스 시간표 그림, 4분·6분 배수 점등(최소공배수 문제). */
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

/** 체질이 끝난 1~24 격자, 소수만 남은 그림(소수 찾기 문제). */
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

/** 약수 격자, 63 = 3²×7의 약수를 (1,3,9)×(1,7)로 만드는 표. */
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

/** 소인수분해 정렬 비교(교과서 방식), 54·90을 세로로 맞추고 공통 소인수 기둥을 하이라이트.
 *  mode gcd = 공통만·지수 작은 쪽 / lcm = 공통은 큰 쪽 + 공통 아닌 것 전부. */
export function alignedFactorFig(mode: "gcd" | "lcm"): string {
  const isG = mode === "gcd";
  const X = { n: 52, eq: 84, two: 118, x1: 150, three: 188, x2: 234, five: 264 };
  const row = (y: number, label: string, threeSup: string, hasFive: boolean): string =>
    `<text x="${X.n}" y="${y}" text-anchor="middle" font-size="17" font-weight="800" fill="${INK}">${label}</text>` +
    `<text x="${X.eq}" y="${y}" text-anchor="middle" font-size="15" font-weight="700" fill="${FAINT}">=</text>` +
    `<text x="${X.two}" y="${y}" text-anchor="middle" font-size="17" font-weight="800" fill="${INK}">2</text>` +
    `<text x="${X.x1}" y="${y}" text-anchor="middle" font-size="13" font-weight="700" fill="${FAINT}">×</text>` +
    `<text x="${X.three}" y="${y}" text-anchor="middle" font-size="17" font-weight="800" fill="${INK}">3<tspan font-size="11" dy="-7">${threeSup}</tspan></text>` +
    (hasFive
      ? `<text x="${X.x2}" y="${y}" text-anchor="middle" font-size="13" font-weight="700" fill="${FAINT}">×</text>` +
        `<text x="${X.five}" y="${y}" text-anchor="middle" font-size="17" font-weight="800" fill="${INK}">5</text>`
      : "");
  const band = (cx: number, w: number, col: string): string =>
    `<rect x="${cx - w / 2}" y="18" width="${w}" height="72" rx="9" fill="${col}"/>`;
  return svg(
    "0 0 360 186",
    band(X.two, 32, "rgba(13,165,198,.12)") +
      band(X.three, 46, "rgba(13,165,198,.12)") +
      (isG ? "" : band(X.five, 32, "rgba(240,140,46,.16)")) +
      row(44, "54", "3", false) +
      row(78, "90", "2", true) +
      `<line x1="30" y1="94" x2="330" y2="94" stroke="${FAINT}" stroke-width="1.6"/>` +
      `<text x="60" y="122" text-anchor="middle" font-size="12.5" font-weight="800" fill="${INK}">${isG ? "최대공약수" : "최소공배수"}</text>` +
      `<text x="104" y="122" text-anchor="middle" font-size="15" font-weight="700" fill="${FAINT}">=</text>` +
      `<text x="122" y="123" text-anchor="start" font-size="17" font-weight="900" fill="#0A87A3">2 × 3<tspan font-size="11" dy="-7">${isG ? "2" : "3"}</tspan>${isG ? "" : `<tspan dy="7"> × 5</tspan>`}</text>` +
      `<text x="252" y="123" text-anchor="start" font-size="14" font-weight="800" fill="${FAINT}">= ${isG ? "18" : "270"}</text>` +
      `<text x="${X.three}" y="152" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0A87A3">공통: 지수가 ${isG ? "작은" : "큰"} 쪽</text>` +
      (isG
        ? `<text x="${X.five + 14}" y="152" text-anchor="middle" font-size="11.5" font-weight="700" fill="${FAINT}">공통 아님: 제외</text>`
        : `<text x="${X.five + 22}" y="152" text-anchor="middle" font-size="11.5" font-weight="800" fill="#B3771A">공통 아닌 것도 전부</text>`),
  );
}

/** 나눗셈 사다리(교과서 왼쪽 여백의 방법).
 *  kind factor = 60을 소수로 계속 나눠 소인수분해 / gcd = 54·90을 공약수로 함께 나눠 18. */
export function ladderFig(kind: "factor" | "gcd"): string {
  const rows: { div: string; a: string; b?: string }[] =
    kind === "factor"
      ? [
          { div: "2", a: "60" },
          { div: "2", a: "30" },
          { div: "3", a: "15" },
          { div: "", a: "5" },
        ]
      : [
          { div: "2", a: "54", b: "90" },
          { div: "3", a: "27", b: "45" },
          { div: "3", a: "9", b: "15" },
          { div: "", a: "3", b: "5" },
        ];
  const x0 = kind === "factor" ? 128 : 104;
  const colA = x0 + 52;
  const colB = x0 + 112;
  let out = "";
  rows.forEach((r, i) => {
    const y = 36 + i * 36;
    if (r.div) {
      out +=
        `<rect x="${x0 - 28}" y="${y - 20}" width="30" height="28" rx="8" fill="rgba(13,165,198,.12)"/>` +
        `<text x="${x0 - 13}" y="${y}" text-anchor="middle" font-size="16" font-weight="900" fill="#0A87A3">${r.div}</text>` +
        `<path d="M ${x0 + 8} ${y - 22} v 28 M ${x0 + 8} ${y + 6} h ${r.b ? 146 : 88}" stroke="${FAINT}" stroke-width="1.6" fill="none"/>`;
    }
    out += `<text x="${colA}" y="${y}" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}">${r.a}</text>`;
    if (r.b) out += `<text x="${colB}" y="${y}" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}">${r.b}</text>`;
  });
  const cap =
    kind === "factor"
      ? "몫이 소수가 될 때까지 나눠요. 60 = 2×2×3×5 = 2²×3×5"
      : "함께 나눈 수(왼쪽 기둥)를 모두 곱하면 2×3×3 = 18";
  return svg(
    "0 0 360 196",
    out +
      (kind === "gcd"
        ? `<rect x="${x0 - 32}" y="12" width="38" height="116" rx="10" fill="none" stroke="#0DA5C6" stroke-width="1.6" stroke-dasharray="4 4"/>`
        : "") +
      `<text x="180" y="${36 + rows.length * 36 + 6}" text-anchor="middle" font-size="12" font-weight="700" fill="${FAINT}">${cap}</text>`,
  );
}

/** 정삼각형 막대 패턴 그림, 1개(3), 2개(5), 3개(7)… 문자의 필요(Ⅱ L1). */
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
      `<text x="38" y="102" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">1개: 3</text>` +
      `<text x="134" y="102" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">2개: 5</text>` +
      `<text x="256" y="102" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">3개: 7</text>` +
      `<text x="330" y="70" text-anchor="middle" font-size="17" font-weight="900" fill="${FAINT}">…</text>`,
  );
}

/** 양팔저울 그림, 왼쪽 x상자+구슬 2, 오른쪽 구슬 6(평형). 등식의 성질 문제용. */
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
  // ── Ⅲ 좌표평면과 그래프 ──
  plane: svg(
    "0 0 84 84",
    `<path d="M10 42 H74 M42 10 V74" stroke="${FAINT}" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M74 42 l-6 -3.4 v6.8 z M42 10 l-3.4 6 h6.8 z" fill="${FAINT}"/>` +
      `<circle cx="58" cy="26" r="6" fill="${CYAN}"/>` +
      `<path d="M58 26 V42 M58 26 H42" stroke="${CYAN}" stroke-width="1.6" stroke-dasharray="3 3"/>`,
  ),
  story: svg(
    "0 0 84 84",
    `<path d="M14 68 H72 M14 68 V14" stroke="${FAINT}" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M14 62 L32 34 L46 34 L58 52 L70 20" stroke="${CYAN}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="46" cy="34" r="3.4" fill="${VIOLET}"/>`,
  ),
  prop: svg(
    "0 0 84 84",
    `<path d="M10 42 H74 M42 10 V74" stroke="${FAINT}" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M16 66 L68 18" stroke="${CYAN}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<circle cx="42" cy="42" r="3.6" fill="${INK}"/>`,
  ),
  inv: svg(
    "0 0 84 84",
    `<path d="M10 42 H74 M42 10 V74" stroke="${FAINT}" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M48 14 Q50 36 72 38 M36 70 Q34 48 12 46" stroke="${VIOLET}" stroke-width="3.2" stroke-linecap="round"/>`,
  ),
};

export function mathMiniArt(key: string): string {
  return MINI[key] ?? "";
}

/* ============================================================
   Ⅲ 좌표평면과 그래프
   ============================================================ */

/** 좌표평면 배경 + 동적 조각을 svg로 감싸는 공용 래퍼. */
function planeFig(o: { min: number; max: number; size?: number; labelEvery?: number }, inner: (p: ReturnType<typeof planeSpec>) => string): string {
  const p = planeSpec({ min: o.min, max: o.max, size: o.size ?? 320, labelEvery: o.labelEvery });
  return svg(p.vb, p.grid + inner(p));
}

/** 점 + 라벨(위/아래 자동). */
function dotAt(p: ReturnType<typeof planeSpec>, x: number, y: number, label: string, col = CYAN, dy = 0): string {
  const cx = p.px(x);
  const cy = p.py(y);
  const above = cy > 34;
  return (
    `<circle cx="${cx}" cy="${cy}" r="5" fill="${col}" stroke="#FFFFFF" stroke-width="1.4"/>` +
    `<text x="${cx}" y="${(above ? cy - 10 : cy + 18) + dy}" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">${label}</text>`
  );
}

/** L1 관광 지도: 역(−1,2)·호수(2,4)·공원(3,0)·극장(−3,−1)·기념품점(1,−2).
 *  아이콘은 점 위(y−26~−12), 이름표는 항상 점 아래(y+17) — 서로 겹치지 않게. */
export function mapPointsFig(): string {
  return planeFig({ min: -4, max: 4, size: 320 }, (p) => {
    const spot = (x: number, y: number, name: string, ic: string, col: string): string => {
      const cx = p.px(x);
      const cy = p.py(y);
      return (
        `<g transform="translate(${cx} ${cy})">${ic}</g>` +
        `<circle cx="${cx}" cy="${cy}" r="4.6" fill="${col}" stroke="#FFFFFF" stroke-width="1.4"/>` +
        `<text x="${cx}" y="${cy + 17}" text-anchor="middle" font-size="11" font-weight="800" fill="${INK}">${name}</text>`
      );
    };
    return (
      spot(-1, 2, "역", `<path d="M-7 -14 h14 v-7 h-14 z M-5 -21 v-4 h10 v4" stroke="${VIOLET}" stroke-width="1.7" fill="#F4F0FF"/>`, VIOLET) +
      spot(2, 4, "호수", `<ellipse cx="0" cy="-17" rx="10" ry="5.5" fill="#DDF0FF" stroke="${POS}" stroke-width="1.6"/>`, POS) +
      spot(3, 0, "공원", `<path d="M0 -26 l7 11 h-14 z M0 -15 v4" stroke="#0CA678" stroke-width="1.7" fill="#E6F9F1"/>`, "#0CA678") +
      spot(-3, -1, "극장", `<rect x="-8" y="-23" width="16" height="10" rx="2" fill="#FEF0F1" stroke="${NEG}" stroke-width="1.6"/><path d="M-4 -20 l3 4 3 -4" stroke="${NEG}" stroke-width="1.3"/>`, NEG) +
      spot(1, -2, "기념품점", `<path d="M-7 -13 h14 l-2 -9 h-10 z" fill="#FFFBEE" stroke="${AMBER}" stroke-width="1.6"/>`, AMBER)
    );
  });
}

/** L1 점 읽기: A(3,6)·B(−4,−3)·C(5,0) (교과서 108쪽 문제 2). */
export function coordReadFig(): string {
  return planeFig({ min: -6, max: 6, size: 320, labelEvery: 2 }, (p) =>
    dotAt(p, 3, 6, "A", CYAN) + dotAt(p, -4, -3, "B", VIOLET) + dotAt(p, 5, 0, "C", AMBER, 2),
  );
}

/* ── 미니 그래프 스트립(상황·모양 매칭 공용) ── */
export type MiniKind =
  | "up" // 일정하게 증가(직선)
  | "upflat" // 증가 후 수평
  | "upflatup" // 증가·수평·다시 증가
  | "updown" // 증가 후 감소
  | "twoup" // 완만한 직선 → 가파른 직선(꺾임)
  | "curvefast" // 점점 빠르게(위로 휨)
  | "curveslow" // 점점 느리게(눕는 곡선)
  | "wave" // 오르내림 반복
  | "spike"; // 점점 빠르게 증가 후 급락

const MINI_PATH: Record<MiniKind, string> = {
  up: "M8 56 L64 12",
  upflat: "M8 56 L34 22 L64 22",
  upflatup: "M8 56 L26 38 L44 38 L64 10",
  updown: "M8 56 L36 12 L64 56",
  twoup: "M8 56 L40 42 L64 8",
  curvefast: "M8 56 Q42 52 64 10",
  curveslow: "M8 56 Q16 14 64 8",
  wave: "M8 40 Q15 12 22 40 Q29 68 36 40 Q43 12 50 40 Q57 68 64 40",
  spike: "M8 56 Q34 40 46 14 L64 54",
};

/** 미니 그래프 나열((가)(나)(다)… 라벨), 상황↔그래프 매칭 문제용. 셀 88×84. */
export function miniGraphRow(kinds: MiniKind[], labels?: string[]): string {
  const W = kinds.length * 88;
  let out = "";
  kinds.forEach((k, i) => {
    const ox = i * 88 + 8;
    out +=
      `<g transform="translate(${ox} 6)">` +
      `<rect x="0" y="0" width="72" height="62" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>` +
      `<path d="M8 56 H64 M8 56 V8" stroke="${FAINT}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="${MINI_PATH[k]}" stroke="${CYAN}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
      `</g>` +
      `<text x="${ox + 36}" y="84" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">${labels?.[i] ?? ["(가)", "(나)", "(다)", "(라)"][i]}</text>`;
  });
  return svg(`0 0 ${W + 16} 94`, out);
}

/** L3 물병 A(아래 넓은 원기둥 위에 좁은 원기둥) + 후보 그래프 ㄱ~ㄹ (교과서 112쪽). */
export function bottleQuizFig(): string {
  const bottle =
    `<g transform="translate(10 10)">` +
    `<ellipse cx="42" cy="86" rx="38" ry="4" fill="#2A3A5E" opacity=".08"/>` +
    `<path d="M14 84 V38 H30 V10 H54 V38 H70 V84 Z" fill="#E8F3FB" stroke="#5E86A4" stroke-width="2"/>` +
    `<line x1="20" y1="78" x2="20" y2="20" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round" opacity=".6"/>` +
    `<text x="42" y="102" text-anchor="middle" font-size="11.5" font-weight="800" fill="${INK}">물병 A</text>` +
    `</g>`;
  const cell = (k: MiniKind, label: string, ox: number, oy: number): string =>
    `<g transform="translate(${ox} ${oy})">` +
    `<rect x="0" y="0" width="86" height="58" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>` +
    `<path d="M9 50 H78 M9 50 V8" stroke="${FAINT}" stroke-width="1.5" stroke-linecap="round"/>` +
    `<path d="${MINI_PATH[k]}" transform="translate(2 -4) scale(1.06 .96)" stroke="${CYAN}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `<text x="-9" y="34" text-anchor="middle" font-size="12.5" font-weight="900" fill="${INK}">${label}</text>` +
    `</g>`;
  return svg(
    "0 0 340 140",
    bottle + cell("twoup", "ㄱ", 122, 4) + cell("upflat", "ㄴ", 238, 4) + cell("up", "ㄷ", 122, 74) + cell("curveslow", "ㄹ", 238, 74),
  );
}

/* ── 시간 그래프 공용 축(1사분면 전용) ── */
function axes1Q(o: { x0: number; y0: number; x1: number; y1: number; xl: string; yl: string }): string {
  return (
    `<path d="M${o.x0} ${o.y0} H${o.x1 + 8} M${o.x0} ${o.y0} V${o.y1 - 8}" stroke="#64748B" stroke-width="1.8" stroke-linecap="round"/>` +
    `<path d="M${o.x1 + 8} ${o.y0} l-7 -4 v8 z" fill="#64748B"/><path d="M${o.x0} ${o.y1 - 8} l-4 7 h8 z" fill="#64748B"/>` +
    `<text x="${o.x1 + 4}" y="${o.y0 + 16}" text-anchor="end" font-size="10.5" font-weight="800" fill="#64748B">${o.xl}</text>` +
    `<text x="${o.x0 - 4}" y="${o.y1 - 12}" font-size="10.5" font-weight="800" fill="#64748B">${o.yl}</text>`
  );
}

/** L4 자전거 나들이: 집(0)→박물관(18km)→음식점(9km)→집. 시각 9~15시.
 *  경로: (9,0)(10,12)(10.5,12)(11,18)(12.5,18)(13,9)(14,9)(14.75,0) — 문제 답과 1:1. */
export function bikeTripFig(): string {
  const X = (t: number): number => 44 + ((t - 9) / 6) * 280;
  const Y = (d: number): number => 168 - (d / 18) * 130;
  const pts: [number, number][] = [[9, 0], [10, 12], [10.5, 12], [11, 18], [12.5, 18], [13, 9], [14, 9], [14.75, 0]];
  const path = pts.map(([t, d], i) => `${i === 0 ? "M" : "L"}${X(t).toFixed(1)} ${Y(d).toFixed(1)}`).join(" ");
  let grid = "";
  for (let t = 9; t <= 15; t++)
    grid += `<line x1="${X(t)}" y1="168" x2="${X(t)}" y2="30" stroke="#EEF2F7" stroke-width="1"/><text x="${X(t)}" y="183" text-anchor="middle" font-size="9.5" font-weight="700" fill="${FAINT}">${t}시</text>`;
  for (const d of [3, 6, 9, 12, 15, 18])
    grid += `<line x1="44" y1="${Y(d)}" x2="330" y2="${Y(d)}" stroke="#EEF2F7" stroke-width="1"/><text x="38" y="${Y(d) + 3}" text-anchor="end" font-size="9.5" font-weight="700" fill="${FAINT}">${d}</text>`;
  return svg(
    "0 0 360 196",
    grid +
      axes1Q({ x0: 44, y0: 168, x1: 330, y1: 30, xl: "시각(시)", yl: "거리(km)" }) +
      `<path d="${path}" stroke="${CYAN}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
      `<text x="${X(11.75)}" y="${Y(18) - 8}" text-anchor="middle" font-size="10" font-weight="800" fill="${INK}">박물관</text>` +
      `<text x="${X(13.5)}" y="${Y(9) - 8}" text-anchor="middle" font-size="10" font-weight="800" fill="${AMBER}">음식점</text>`,
  );
}

/** L4 음료수 대결: 은수 직선(24초 완주), 예지 4~14초 휴식 후 18초 완주, 준호 22초에 100mL 남김. */
export function drinkRaceFig(): string {
  const X = (t: number): number => 44 + (t / 24) * 286;
  const Y = (v: number): number => 168 - (v / 600) * 132;
  const lineOf = (pts: [number, number][], col: string): string =>
    `<path d="${pts.map(([t, v], i) => `${i === 0 ? "M" : "L"}${X(t).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ")}" stroke="${col}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  let grid = "";
  for (let t = 4; t <= 24; t += 4)
    grid += `<line x1="${X(t)}" y1="168" x2="${X(t)}" y2="30" stroke="#EEF2F7" stroke-width="1"/><text x="${X(t)}" y="183" text-anchor="middle" font-size="9.5" font-weight="700" fill="${FAINT}">${t}</text>`;
  for (const v of [100, 200, 300, 400, 500, 600])
    grid += `<line x1="44" y1="${Y(v)}" x2="336" y2="${Y(v)}" stroke="#EEF2F7" stroke-width="1"/><text x="38" y="${Y(v) + 3}" text-anchor="end" font-size="9" font-weight="700" fill="${FAINT}">${v}</text>`;
  return svg(
    "0 0 360 196",
    grid +
      axes1Q({ x0: 44, y0: 168, x1: 336, y1: 30, xl: "시간(초)", yl: "남은 양(mL)" }) +
      lineOf([[0, 600], [24, 0]], CYAN) +
      lineOf([[0, 600], [4, 350], [14, 350], [18, 0]], VIOLET) +
      lineOf([[0, 600], [22, 100], [24, 100]], AMBER) +
      `<text x="${X(21)}" y="${Y(180)}" font-size="10.5" font-weight="800" fill="${CYAN}">은수</text>` +
      `<text x="${X(8)}" y="${Y(350) - 8}" font-size="10.5" font-weight="800" fill="${VIOLET}">예지</text>` +
      `<text x="${X(16.6)}" y="${Y(210)}" font-size="10.5" font-weight="800" fill="${AMBER}">준호</text>`,
  );
}

/** L6 정비례 그래프 a 읽기: y=ax 직선 + 격자점 강조 (교과서 125쪽 문제 6). */
export function propReadFig(a: number, mx: number): string {
  const my = Math.round(a * mx * 1000) / 1000; // 부동소수 꼬리 제거((2/3)×3 = 1.999… 방지)
  return planeFig({ min: -4, max: 4, size: 300 }, (p) => {
    const xEnd = Math.min(4, 4 / Math.abs(a));
    const x0 = -xEnd;
    return (
      `<line x1="${p.px(x0)}" y1="${p.py(a * x0)}" x2="${p.px(xEnd)}" y2="${p.py(a * xEnd)}" stroke="${CYAN}" stroke-width="2.8" stroke-linecap="round"/>` +
      `<line x1="${p.px(mx)}" y1="${p.py(0)}" x2="${p.px(mx)}" y2="${p.py(my)}" stroke="${VIOLET}" stroke-width="1.5" stroke-dasharray="4 4"/>` +
      `<line x1="${p.px(0)}" y1="${p.py(my)}" x2="${p.px(mx)}" y2="${p.py(my)}" stroke="${VIOLET}" stroke-width="1.5" stroke-dasharray="4 4"/>` +
      dotAt(p, mx, my, `(${String(mx).replace("-", "−")}, ${String(my).replace("-", "−")})`, "#E8608A")
    );
  });
}

/** L8 반비례 그래프 a 읽기: y=a/x 곡선 한 쌍 + 격자점 강조. torn=true면 한 가지가 찢겨 안 보인다. */
export function invReadFig(a: number, mx: number, torn = false): string {
  const my = a / mx;
  return planeFig({ min: -4, max: 4, size: 300 }, (p) => {
    const branch = (sign: 1 | -1): string => {
      const xMin = Math.abs(a) / 4;
      let d = "";
      for (let i = 0; i <= 36; i++) {
        const x = sign * (xMin + (i / 36) * (4 - xMin));
        d += `${i === 0 ? "M" : "L"}${p.px(x).toFixed(1)} ${p.py(a / x).toFixed(1)} `;
      }
      return `<path d="${d}" stroke="${CYAN}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
    };
    let tear = "";
    if (torn) {
      // 3사분면을 덮는 찢긴 종이: 대각 지그재그 가장자리 + 흰 면
      const x0 = p.px(-4) - 8;
      const y0 = p.py(-0.12);
      const x1 = p.px(-0.12);
      const y1 = p.py(-4) + 8;
      let d = `M${x0} ${y0}`;
      const N = 7;
      for (let i = 1; i <= N; i++) {
        const t = i / N;
        const bx = x0 + (x1 - x0) * t;
        const by = y0 + (y1 - y0) * t;
        const off = i % 2 === 1 ? 9 : -3;
        d += ` L${(bx + off).toFixed(1)} ${(by + off * 0.7).toFixed(1)}`;
      }
      d += ` L${x1} ${y1} L${x0} ${y1} Z`;
      tear =
        `<path d="${d}" fill="#FBFCFE" stroke="#C9D4E0" stroke-width="1.6" stroke-dasharray="6 4"/>` +
        `<text x="${p.px(-2.7)}" y="${p.py(-2.7)}" text-anchor="middle" font-size="11" font-weight="800" fill="${FAINT}" transform="rotate(-38 ${p.px(-2.7)} ${p.py(-2.7)})">찢어진 부분</text>`;
    }
    return (
      branch(1) +
      (torn ? "" : branch(-1)) +
      tear +
      `<line x1="${p.px(mx)}" y1="${p.py(0)}" x2="${p.px(mx)}" y2="${p.py(my)}" stroke="${VIOLET}" stroke-width="1.5" stroke-dasharray="4 4"/>` +
      `<line x1="${p.px(0)}" y1="${p.py(my)}" x2="${p.px(mx)}" y2="${p.py(my)}" stroke="${VIOLET}" stroke-width="1.5" stroke-dasharray="4 4"/>` +
      dotAt(p, mx, my, `(${String(mx).replace("-", "−")}, ${String(my).replace("-", "−")})`, "#E8608A")
    );
  });
}

/** L9 지진 조기 경보(교과서 134쪽): P파 y=6x·S파 y=4x, 72 km 수평선과 초기 미동 시간. */
export function quakeGraphFig(withGap = true): string {
  const X = (t: number): number => 44 + (t / 20) * 286;
  const Y = (d: number): number => 168 - (d / 120) * 132;
  let grid = "";
  for (let t = 5; t <= 20; t += 5)
    grid += `<line x1="${X(t)}" y1="168" x2="${X(t)}" y2="30" stroke="#EEF2F7" stroke-width="1"/><text x="${X(t)}" y="183" text-anchor="middle" font-size="9.5" font-weight="700" fill="${FAINT}">${t}</text>`;
  for (const d of [30, 60, 90, 120])
    grid += `<line x1="44" y1="${Y(d)}" x2="330" y2="${Y(d)}" stroke="#EEF2F7" stroke-width="1"/><text x="38" y="${Y(d) + 3}" text-anchor="end" font-size="9" font-weight="700" fill="${FAINT}">${d}</text>`;
  const gap = withGap
    ? `<line x1="44" y1="${Y(72)}" x2="${X(18)}" y2="${Y(72)}" stroke="${INK}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
      `<circle cx="${X(12)}" cy="${Y(72)}" r="4.5" fill="${CYAN}"/><circle cx="${X(18)}" cy="${Y(72)}" r="4.5" fill="${NEG}"/>` +
      `<path d="M${X(12)} ${Y(72) - 12} H${X(18)}" stroke="${AMBER}" stroke-width="2.4"/>` +
      `<path d="M${X(12)} ${Y(72) - 16} v8 M${X(18)} ${Y(72) - 16} v8" stroke="${AMBER}" stroke-width="2.4"/>` +
      `<text x="${X(15)}" y="${Y(72) - 20}" text-anchor="middle" font-size="10" font-weight="900" fill="${AMBER}">초기 미동 시간</text>` +
      `<text x="60" y="${Y(72) - 6}" font-size="10" font-weight="800" fill="${INK}">72 km</text>`
    : "";
  return svg(
    "0 0 360 196",
    grid +
      axes1Q({ x0: 44, y0: 168, x1: 330, y1: 30, xl: "시간(초)", yl: "거리(km)" }) +
      `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(20)}" y2="${Y(120)}" stroke="${CYAN}" stroke-width="2.8" stroke-linecap="round"/>` +
      `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(20)}" y2="${Y(80)}" stroke="${NEG}" stroke-width="2.8" stroke-linecap="round"/>` +
      `<text x="${X(17.4)}" y="${Y(114)}" font-size="11" font-weight="900" fill="${CYAN}">P파</text>` +
      `<text x="${X(18)}" y="${Y(66)}" font-size="11" font-weight="900" fill="${NEG}">S파</text>` +
      gap,
  );
}

/** L9 교점 문제(중단원 도전 8): y=ax와 y=24/x가 x좌표 6인 점 P에서 만난다. */
export function crossFig(): string {
  const X = (x: number): number => 40 + (x / 9) * 290;
  const Y = (y: number): number => 170 - (y / 9) * 140;
  let curve = "";
  for (let i = 0; i <= 40; i++) {
    const x = 2.7 + (i / 40) * 6.3;
    curve += `${i === 0 ? "M" : "L"}${X(x).toFixed(1)} ${Y(24 / x).toFixed(1)} `;
  }
  return svg(
    "0 0 360 196",
    axes1Q({ x0: 40, y0: 170, x1: 330, y1: 30, xl: "x", yl: "y" }) +
      `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(9)}" y2="${Y(6)}" stroke="${CYAN}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="${curve}" stroke="${VIOLET}" stroke-width="2.6" stroke-linecap="round" fill="none"/>` +
      `<line x1="${X(6)}" y1="${Y(0)}" x2="${X(6)}" y2="${Y(4)}" stroke="${INK}" stroke-width="1.4" stroke-dasharray="4 4"/>` +
      `<circle cx="${X(6)}" cy="${Y(4)}" r="5" fill="#E8608A" stroke="#FFFFFF" stroke-width="1.4"/>` +
      `<text x="${X(6) + 10}" y="${Y(4) - 8}" font-size="12" font-weight="900" fill="${INK}">P</text>` +
      `<text x="${X(6)}" y="${Y(0) + 16}" text-anchor="middle" font-size="11" font-weight="800" fill="${INK}">6</text>` +
      `<text x="${X(8.2)}" y="${Y(5.9)}" font-size="11" font-weight="900" fill="${CYAN}">y=ax</text>` +
      `<text x="${X(3.1)}" y="${Y(8.6)}" font-size="11" font-weight="900" fill="${VIOLET}">y=24/x</text>`,
  );
}

/* ════════════════════ Ⅳ 기본 도형 ════════════════════ */
/* 기하 그림은 geoKit(angleArc·rightMark·tickMark·lineSvg 등)을 재사용한다.
   숨은 모서리는 교과서 관례대로 점선. 좌표 주석을 남긴다. */

/** 입체 한 쌍(가: 삼각기둥, 나: 사각뿔) — 교점·교선 세기 문제(교과서 145쪽 문제 1 각색).
 *  기하: 삼각기둥 앞면 (60,52)(24,128)(106,128), 깊이 오프셋 (+52,-20). 사각뿔 밑면 마름모, 꼭짓점 위. */
export function solidsPairFig(): string {
  // (가) 삼각기둥
  const F = [[60, 52], [24, 128], [106, 128]] as const;
  const B = F.map(([x, y]) => [x + 52, y - 20]);
  let prism = "";
  // 숨은 모서리: 뒤 왼쪽 아래 꼭짓점 B[1]에 모이는 3개
  prism += lineSvg(B[0][0], B[0][1], B[1][0], B[1][1], FAINT, 1.6, "5 5");
  prism += lineSvg(B[1][0], B[1][1], B[2][0], B[2][1], FAINT, 1.6, "5 5");
  prism += lineSvg(F[1][0], F[1][1], B[1][0], B[1][1], FAINT, 1.6, "5 5");
  prism += lineSvg(F[0][0], F[0][1], F[1][0], F[1][1], INK, 2.2);
  prism += lineSvg(F[1][0], F[1][1], F[2][0], F[2][1], INK, 2.2);
  prism += lineSvg(F[2][0], F[2][1], F[0][0], F[0][1], INK, 2.2);
  prism += lineSvg(F[0][0], F[0][1], B[0][0], B[0][1], INK, 2.2);
  prism += lineSvg(F[2][0], F[2][1], B[2][0], B[2][1], INK, 2.2);
  prism += lineSvg(B[0][0], B[0][1], B[2][0], B[2][1], INK, 2.2);
  // (나) 사각뿔: 밑면 마름모 (216,120)(262,104)(316,120)(268,140), 꼭짓점 (264,40)
  const P = [[216, 120], [262, 102], [316, 120], [268, 142]] as const;
  const APX = 264;
  const APY = 40;
  let pyr = "";
  pyr += lineSvg(P[0][0], P[0][1], P[1][0], P[1][1], FAINT, 1.6, "5 5");
  pyr += lineSvg(P[1][0], P[1][1], P[2][0], P[2][1], FAINT, 1.6, "5 5");
  pyr += lineSvg(APX, APY, P[1][0], P[1][1], FAINT, 1.6, "5 5");
  pyr += lineSvg(P[2][0], P[2][1], P[3][0], P[3][1], INK, 2.2);
  pyr += lineSvg(P[3][0], P[3][1], P[0][0], P[0][1], INK, 2.2);
  pyr += lineSvg(APX, APY, P[0][0], P[0][1], INK, 2.2);
  pyr += lineSvg(APX, APY, P[2][0], P[2][1], INK, 2.2);
  pyr += lineSvg(APX, APY, P[3][0], P[3][1], INK, 2.2);
  const tag = (x: number, t: string): string =>
    `<rect x="${x - 22}" y="152" width="44" height="20" rx="10" fill="#F1F5F9" stroke="#C6D2DE" stroke-width="1"/><text x="${x}" y="166" text-anchor="middle" font-size="11.5" font-weight="800" fill="${INK}">${t}</text>`;
  return svg("0 0 360 180", prism + pyr + tag(66, "(가)") + tag(266, "(나)"));
}

/** 한 직선 위의 세 점 A·B·C(같은 도형 찾기 — 교과서 146쪽 문제 3). A(64) B(196) C(292). */
export function collinearFig(): string {
  const y = 56;
  return svg(
    "0 0 360 96",
    lineSvg(18, y, 342, y, INK, 2.2) +
      arrowHead(342, y, 0, INK) +
      arrowHead(18, y, 180, INK) +
      gdot(64, y, INK, 4.5) + ptLabel(64, y, "A", 0, -12) +
      gdot(196, y, INK, 4.5) + ptLabel(196, y, "B", 0, -12) +
      gdot(292, y, INK, 4.5) + ptLabel(292, y, "C", 0, -12),
  );
}

/** 중점 사슬: 점 M은 AB의 중점, 점 N은 MB의 중점(교과서 147쪽 문제 4). AB 위 브레이스 길이 라벨. */
export function midChainFig(total = 12): string {
  const y = 64;
  const A = 34;
  const Bx = 326;
  const M = (A + Bx) / 2;
  const N = (M + Bx) / 2;
  return svg(
    "0 0 360 108",
    `<path d="M${A} 30 Q${(A + Bx) / 2} 8 ${Bx} 30" stroke="${FAINT}" stroke-width="1.6" fill="none"/>` +
      `<text x="${(A + Bx) / 2}" y="24" text-anchor="middle" font-size="12.5" font-weight="800" fill="${INK}">${total} cm</text>` +
      lineSvg(A, y, Bx, y, INK, 2.4) +
      tickMark(A, y, M, y, 1, CYAN) +
      tickMark(M, y, Bx, y, 1, CYAN) +
      tickMark(M, y, N, y, 2, AMBER) +
      tickMark(N, y, Bx, y, 2, AMBER) +
      gdot(A, y, INK, 4.5) + ptLabel(A, y, "A", 0, 22) +
      gdot(M, y, INK, 4.5) + ptLabel(M, y, "M", 0, 22) +
      gdot(N, y, INK, 4.5) + ptLabel(N, y, "N", 0, 22) +
      gdot(Bx, y, INK, 4.5) + ptLabel(Bx, y, "B", 0, 22),
  );
}

/** 삼각형에서 표시된 각 읽기(기호 표기 문제 — 교과서 148쪽 스스로 확인).
 *  A(178,28) B(64,128) C(300,128), ∠x는 꼭짓점 B의 안쪽 각. */
export function angleNameFig(): string {
  const Ax = 178;
  const Ay = 28;
  const Bx = 64;
  const By = 128;
  const Cx = 300;
  const Cy = 128;
  const aToA = Math.atan2(By - Ay, Ax - Bx) * (180 / Math.PI); // B에서 A 방향(수학 각도)
  return svg(
    "0 0 360 156",
    lineSvg(Ax, Ay, Bx, By, INK, 2.4) +
      lineSvg(Bx, By, Cx, Cy, INK, 2.4) +
      lineSvg(Cx, Cy, Ax, Ay, INK, 2.4) +
      angleArc(Bx, By, 26, 0, aToA, AMBER, "x", { fill: true, labelR: 40, fontSize: 13 }) +
      ptLabel(Ax, Ay, "A", 0, -10) +
      ptLabel(Bx, By, "B", -12, 14) +
      ptLabel(Cx, Cy, "C", 12, 14),
  );
}

/** 두 직선의 교차와 맞꼭지각(교과서 150쪽 문제 8): 한 각이 known°, ∠a는 맞꼭지각, ∠b는 이웃각.
 *  중심 (180,78), 직선1 기울기 12°, 직선2 기울기 12+known°. */
export function vertXFig(known = 50): string {
  const cx = 180;
  const cy = 78;
  const a1 = 12;
  const a2 = 12 + known;
  const L = (ang: number): string => {
    const r = 150;
    const x1 = cx + r * Math.cos((ang * Math.PI) / 180);
    const y1 = cy - r * Math.sin((ang * Math.PI) / 180);
    const x2 = cx - r * Math.cos((ang * Math.PI) / 180);
    const y2 = cy + r * Math.sin((ang * Math.PI) / 180);
    return lineSvg(x1, y1, x2, y2, INK, 2.4);
  };
  return svg(
    "0 0 360 156",
    L(a1) + L(a2) +
      angleArc(cx, cy, 26, a1, a2, AMBER, `${known}°`, { fill: true, labelR: 44, fontSize: 12.5 }) +
      angleArc(cx, cy, 26, a1 + 180, a2 + 180, CYAN, "a", { fill: true, labelR: 44, fontSize: 13 }) +
      angleArc(cx, cy, 20, a2, a1 + 180, VIOLET, "b", { labelR: 36, fontSize: 13 }) +
      gdot(cx, cy, INK, 3),
  );
}

/** 세 직선이 한 점에서 만나는 그림(위쪽 반원의 세 각이 평각 — 수치는 자체 제작, 교과서와 다르게).
 *  각 라벨: (x+20)° · 2x° · (3x−20)°, 답 x=30에 맞춘 각도(50°·60°·70°)로 그린다. */
export function threeLinesFig(): string {
  const cx = 180;
  const cy = 92;
  // 세 직선의 기울기 0°·50°·110°: 위 반원이 (x+20)=50° · 2x=60° · (3x−20)=70°로 나뉜다(합 180)
  const L = (ang: number): string => {
    const r = 150;
    const x1 = cx + r * Math.cos((ang * Math.PI) / 180);
    const y1 = cy - r * Math.sin((ang * Math.PI) / 180);
    const x2 = cx - r * Math.cos((ang * Math.PI) / 180);
    const y2 = cy + r * Math.sin((ang * Math.PI) / 180);
    return lineSvg(x1, y1, x2, y2, INK, 2.2);
  };
  const lab = (a0: number, a1: number, txt: string, col: string, r: number): string => {
    const mid = ((a0 + a1) / 2) * (Math.PI / 180);
    return (
      angleArc(cx, cy, 22, a0, a1, col, undefined, { width: 2.2 }) +
      `<text x="${(cx + r * Math.cos(mid)).toFixed(1)}" y="${(cy - r * Math.sin(mid) + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${col}">${txt}</text>`
    );
  };
  return svg(
    "0 0 360 184",
    L(0) + L(50) + L(110) +
      lab(0, 50, `(<tspan font-style="italic">x</tspan>+20)°`, CYAN, 54) +
      lab(50, 110, `2<tspan font-style="italic">x</tspan>°`, AMBER, 48) +
      lab(110, 180, `(3<tspan font-style="italic">x</tspan>−20)°`, VIOLET, 54) +
      gdot(cx, cy, INK, 3),
  );
}

/** 맞꼭지각이 아닌 마주 봄(교과서 150쪽 문제 9): 네 반직선 OA(160°)·OB(205°)·OD(20°)·OC(−25°).
 *  ∠AOB=45°, ∠COD=45°는 마주 보지만, A·O·C가 한 직선이 아니므로 맞꼭지각이 아니다. */
export function notVertFig(): string {
  const cx = 180;
  const cy = 104;
  const ray = (ang: number, name: string, lr = 132): string => {
    const x = cx + lr * Math.cos((ang * Math.PI) / 180);
    const y = cy - lr * Math.sin((ang * Math.PI) / 180);
    return (
      lineSvg(cx, cy, x, y, INK, 2.2) +
      arrowHead(x, y, ang, INK, 6) +
      ptLabel(x, y, name, 10 * Math.cos((ang * Math.PI) / 180), -8 * Math.sin((ang * Math.PI) / 180) + 4)
    );
  };
  return svg(
    "0 0 360 190",
    ray(160, "A") + ray(205, "B") + ray(20, "D") + ray(-25, "C") +
      angleArc(cx, cy, 26, 160, 205, AMBER, "45°", { fill: true, labelR: 44, fontSize: 12 }) +
      angleArc(cx, cy, 26, -25, 20, CYAN, "45°", { fill: true, labelR: 44, fontSize: 12 }) +
      angleArc(cx, cy, 18, 20, 160, FAINT, "140°", { labelR: 34, fontSize: 11 }) +
      gdot(cx, cy, INK, 3.4) +
      ptLabel(cx, cy, "O", 0, 20),
  );
}

/** 사다리꼴 ABCD(수선의 발·거리 문제 — 수치는 자체 제작 6·8·12·10, 교과서 수치와 다르게):
 *  AD∥BC, ∠A=∠B=90°, AB=8·AD=6·BC=12·CD=10(가로 차 6, 세로 8의 6-8-10 직각삼각형).
 *  기하: A(70,28) D(166,28) B(70,156) C(262,156), 1cm=16px. */
export function trapezoidFig(): string {
  const Ax = 70;
  const Ay = 28;
  const Dx = 166;
  const Bx = 70;
  const By = 156;
  const Cx = 262;
  const dim = (x: number, y: number, t: string, col = INK): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="800" fill="${col}">${t}</text>`;
  return svg(
    "0 0 360 196",
    lineSvg(Ax, Ay, Dx, Ay, INK, 2.4) +
      lineSvg(Ax, Ay, Bx, By, INK, 2.4) +
      lineSvg(Bx, By, Cx, By, INK, 2.4) +
      lineSvg(Dx, Ay, Cx, By, INK, 2.4) +
      rightMark(Ax, Ay, -90, 11, CYAN) +
      rightMark(Bx, By, 0, 11, CYAN) +
      dim((Ax + Dx) / 2, Ay - 12, "6 cm", AMBER) +
      dim(Ax - 26, (Ay + By) / 2 + 4, "8 cm", AMBER) +
      dim((Bx + Cx) / 2, By + 20, "12 cm", AMBER) +
      dim((Dx + Cx) / 2 + 20, (Ay + By) / 2 - 6, "10 cm", AMBER) +
      ptLabel(Ax, Ay, "A", -12, -6) + ptLabel(Dx, Ay, "D", 12, -6) +
      ptLabel(Bx, By, "B", -12, 14) + ptLabel(Cx, By, "C", 12, 14),
  );
}

/** 평행사변형 ABCD(교과서 153쪽 문제 2). A(96,40) D(288,40) B(56,150) C(248,150). */
export function pgramFig(): string {
  const A2 = { x: 96, y: 40 };
  const D2 = { x: 288, y: 40 };
  const B2 = { x: 56, y: 150 };
  const C2 = { x: 248, y: 150 };
  return svg(
    "0 0 360 190",
    lineSvg(A2.x, A2.y, D2.x, D2.y, INK, 2.4) +
      lineSvg(B2.x, B2.y, C2.x, C2.y, INK, 2.4) +
      lineSvg(A2.x, A2.y, B2.x, B2.y, INK, 2.4) +
      lineSvg(D2.x, D2.y, C2.x, C2.y, INK, 2.4) +
      ptLabel(A2.x, A2.y, "A", -12, -6) + ptLabel(D2.x, D2.y, "D", 12, -6) +
      ptLabel(B2.x, B2.y, "B", -12, 16) + ptLabel(C2.x, C2.y, "C", 12, 16),
  );
}

/** 직육면체 ABCD-EFGH(교과서 155쪽 문제 6): 윗면 ABCD, 아래로 A→E·B→F·C→G·D→H.
 *  숨은 모서리(뒤 왼쪽 아래 H에 모이는 3개)는 점선. 기하: 앞면 (92,64)-(240,64)-(240,160)-(92,160),
 *  깊이 오프셋 (+58,-26). */
export function boxQuizFig(): string {
  const o = { x: 58, y: -26 };
  const E = { x: 92, y: 160 };
  const F = { x: 240, y: 160 };
  const B = { x: 240, y: 64 };
  const A = { x: 92, y: 64 };
  const H = { x: E.x + o.x, y: E.y + o.y };
  const G = { x: F.x + o.x, y: F.y + o.y };
  const C = { x: B.x + o.x, y: B.y + o.y };
  const D = { x: A.x + o.x, y: A.y + o.y };
  return svg(
    "0 0 360 196",
    // 숨은 모서리(점선): H에 모이는 3개
    lineSvg(H.x, H.y, G.x, G.y, FAINT, 1.6, "5 5") +
      lineSvg(H.x, H.y, D.x, D.y, FAINT, 1.6, "5 5") +
      lineSvg(H.x, H.y, E.x, E.y, FAINT, 1.6, "5 5") +
      // 보이는 모서리
      lineSvg(A.x, A.y, B.x, B.y, INK, 2.3) +
      lineSvg(B.x, B.y, F.x, F.y, INK, 2.3) +
      lineSvg(F.x, F.y, E.x, E.y, INK, 2.3) +
      lineSvg(E.x, E.y, A.x, A.y, INK, 2.3) +
      lineSvg(A.x, A.y, D.x, D.y, INK, 2.3) +
      lineSvg(B.x, B.y, C.x, C.y, INK, 2.3) +
      lineSvg(F.x, F.y, G.x, G.y, INK, 2.3) +
      lineSvg(D.x, D.y, C.x, C.y, INK, 2.3) +
      lineSvg(C.x, C.y, G.x, G.y, INK, 2.3) +
      ptLabel(A.x, A.y, "A", -11, -5) + ptLabel(B.x, B.y, "B", 11, 3) +
      ptLabel(C.x, C.y, "C", 12, -4) + ptLabel(D.x, D.y, "D", -4, -10) +
      ptLabel(E.x, E.y, "E", -11, 14) + ptLabel(F.x, F.y, "F", 4, 17) +
      ptLabel(G.x, G.y, "G", 13, 8) + ptLabel(H.x, H.y, "H", -8, -9),
  );
}

/** 각도 정규화·중간각(그림 전용 지역 헬퍼). */
const nd = (d: number): number => ((d % 360) + 360) % 360;
const midOf = (a0: number, a1: number): number => a0 + nd(a1 - a0) / 2;

/** 두 직선 l·m + 횡단선 n의 8개 각 a~h(교과서 157쪽 그림, 평행 아님 — anglePairLab과 같은
 *  시계 방향 라벨: 각 교점에서 위-왼 → 위-오 → 아래-오 → 아래-왼).
 *  기하: P(198,62)=n×l(l 기울기 −7°), Q(142,150)=n×m(m 기울기 +8°), nUp≈57.5°. */
export function transversalQuizFig(): string {
  const P = { x: 198, y: 62 };
  const Q = { x: 142, y: 150 };
  const TL = -7;
  const TM = 8;
  const nUp = (Math.atan2(Q.y - P.y, P.x - Q.x) * 180) / Math.PI; // Q→P(위쪽) 방향 = atan2(88,56) ≈ 57.5°
  const line2 = (c: { x: number; y: number }, ang: number, half: number, col = INK, w = 2.2): string => {
    const r = (ang * Math.PI) / 180;
    return lineSvg(c.x - half * Math.cos(r), c.y + half * Math.sin(r), c.x + half * Math.cos(r), c.y - half * Math.sin(r), col, w);
  };
  const lab = (c: { x: number; y: number }, ang: number, t: string): string =>
    `<text x="${(c.x + 30 * Math.cos((ang * Math.PI) / 180)).toFixed(1)}" y="${(c.y - 30 * Math.sin((ang * Math.PI) / 180) + 4).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" font-style="italic" fill="${INK}">${t}</text>`;
  const four = (c: { x: number; y: number }, tilt: number, names: [string, string, string, string]): string =>
    lab(c, midOf(nUp, tilt + 180), names[0]) + // 위-왼
    lab(c, midOf(tilt, nUp), names[1]) + // 위-오
    lab(c, midOf(nUp + 180, tilt + 360), names[2]) + // 아래-오
    lab(c, midOf(tilt + 180, nUp + 180), names[3]); // 아래-왼
  return svg(
    "0 0 360 208",
    line2(P, TL, 150) +
      line2(Q, TM, 150) +
      line2({ x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 }, nUp, 120, FAINT, 2) +
      `<text x="340" y="${P.y - 12}" font-size="12.5" font-style="italic" font-weight="700" fill="#64748B">l</text>` +
      `<text x="286" y="${Q.y + 34}" font-size="12.5" font-style="italic" font-weight="700" fill="#64748B">m</text>` +
      `<text x="${P.x + 36}" y="22" font-size="12.5" font-style="italic" font-weight="700" fill="#64748B">n</text>` +
      gdot(P.x, P.y, INK, 3) + gdot(Q.x, Q.y, INK, 3) +
      four(P, TL, ["a", "b", "c", "d"]) +
      four(Q, TM, ["e", "f", "g", "h"]),
  );
}

/** 평행선 l∥m과 횡단선(교과서 158~159쪽 문제 2·3 구도): 위 교점 P의 아래-왼 각이 known°.
 *  kind "co": ∠a = Q의 아래-왼(동위각) → a=known, ∠b = Q의 아래-오 → b=180−known.
 *  kind "alt": ∠a = Q의 위-오(엇각) → a=known, ∠b = Q의 위-왼 → b=180−known.
 *  기하: 두 직선 수평, n의 위쪽 방향 수학 각도 = known(예각이 known과 일치하도록 계산). */
export function parallelAngleFig(kind: "co" | "alt", known: number): string {
  const P = { x: 214, y: 58 };
  const span = 96; // 두 직선 사이 세로 간격
  const rad = (known * Math.PI) / 180;
  const Q = { x: P.x - span / Math.tan(rad), y: P.y + span }; // n 아래 방향으로 span만큼
  const up = known; // n 위쪽 방향의 수학 각도
  const dn = known + 180;
  const H = (c: { x: number; y: number }): string => lineSvg(24, c.y, 340, c.y, INK, 2.3);
  const ux = Math.cos(rad);
  const uy = -Math.sin(rad);
  const tr = lineSvg(P.x + ux * 42, P.y + uy * 42, Q.x - ux * 42, Q.y - uy * 42, FAINT, 2);
  let marks = angleArc(P.x, P.y, 20, 180, dn, AMBER, `${known}°`, { fill: true, labelR: 38, fontSize: 12 });
  if (kind === "co") {
    marks += angleArc(Q.x, Q.y, 20, 180, dn, CYAN, "a", { fill: true, labelR: 38, fontSize: 13 });
    marks += angleArc(Q.x, Q.y, 15, dn, 360, VIOLET, "b", { labelR: 30, fontSize: 13 });
  } else {
    marks += angleArc(Q.x, Q.y, 20, 0, up, CYAN, "a", { fill: true, labelR: 38, fontSize: 13 });
    marks += angleArc(Q.x, Q.y, 15, up, 180, VIOLET, "b", { labelR: 30, fontSize: 13 });
  }
  return svg(
    "0 0 360 208",
    H(P) + H(Q) + tr +
      `<text x="348" y="${P.y + 4}" text-anchor="end" font-size="12.5" font-style="italic" font-weight="700" fill="#64748B">l</text>` +
      `<text x="348" y="${Q.y + 4}" text-anchor="end" font-size="12.5" font-style="italic" font-weight="700" fill="#64748B">m</text>` +
      `<path d="M28 ${P.y - 7} l9 7 l-9 7 M28 ${Q.y - 7} l9 7 l-9 7" stroke="${CYAN}" stroke-width="2" fill="none"/>` +
      gdot(P.x, P.y, INK, 3) + gdot(Q.x, Q.y, INK, 3) + marks,
  );
}

/** 꺾인 점 보조선 문제(l∥m, 꺾인 점 ∠x=a+b — 수치는 자체 제작 26°·45°, 교과서와 다르게).
 *  기하 검산: V는 P에서 수학 각도 −a 방향, Q는 V에서 각도 b가 정확히 서도록 역산. */
export function zigzagFig(a = 26, b = 45): string {
  const ly = 48;
  const my = 168;
  const P = { x: 92, y: ly };
  const V = { x: P.x + 96, y: ly + 96 * Math.tan((a * Math.PI) / 180) }; // ∠(l, PV)=a
  const Q = { x: V.x - (my - V.y) / Math.tan((b * Math.PI) / 180), y: my }; // ∠(m, QV)=b
  return svg(
    "0 0 360 208",
    lineSvg(20, ly, 340, ly, INK, 2.3) +
      lineSvg(20, my, 340, my, INK, 2.3) +
      `<path d="M326 ${ly - 7} l9 7 l-9 7 M326 ${my - 7} l9 7 l-9 7" stroke="${CYAN}" stroke-width="2" fill="none"/>` +
      lineSvg(P.x, P.y, V.x, V.y, INK, 2.3) +
      lineSvg(Q.x, Q.y, V.x, V.y, INK, 2.3) +
      angleArc(P.x, P.y, 22, -a, 0, AMBER, `${a}°`, { labelR: 40, fontSize: 12 }) +
      angleArc(Q.x, Q.y, 22, 0, b, AMBER, `${b}°`, { labelR: 40, fontSize: 12 }) +
      angleArc(V.x, V.y, 18, 180 - a, 180 + b, VIOLET, "x", { fill: true, labelR: 36, fontSize: 13.5 }) +
      `<text x="348" y="${ly + 4}" text-anchor="end" font-size="12.5" font-style="italic" font-weight="700" fill="#64748B">l</text>` +
      `<text x="348" y="${my + 4}" text-anchor="end" font-size="12.5" font-style="italic" font-weight="700" fill="#64748B">m</text>`,
  );
}

/** 평행 판별: 세 직선 p·q·r가 횡단선과 이루는 각 108°·72°·108°(수치 자체 제작).
 *  p와 r만 평행(동위각 108°=108°). q는 72°라 탈락. */
export function parallelTestFig(): string {
  const xs = [86, 190, 294];
  const names = ["p", "q", "r"];
  const degs = [108, 72, 108];
  const ty = 108;
  let out = lineSvg(16, ty, 344, ty, FAINT, 2); // 횡단선(수평)
  xs.forEach((x, i) => {
    // 각 직선: 횡단선과 degs[i]°(오른쪽 위 기준)로 교차하는 직선
    const a = (degs[i] * Math.PI) / 180;
    const hx = 92 * Math.cos(a);
    const hy = 92 * Math.sin(a);
    out += lineSvg(x - hx, ty + hy, x + hx, ty - hy, INK, 2.3);
    out += angleArc(x, ty, 17, 0, degs[i], i === 1 ? VIOLET : AMBER, `${degs[i]}°`, { labelR: 33, fontSize: 11 });
    out += `<text x="${x + 92 * Math.cos(a) + 10}" y="${ty - 92 * Math.sin(a) - 6}" font-size="12.5" font-style="italic" font-weight="700" fill="#64748B">${names[i]}</text>`;
    out += gdot(x, ty, INK, 2.6);
  });
  return svg("0 0 360 208", out);
}

/** 합동인 두 삼각형 △ABC≡△DEF(수치 자체 제작 — 교과서와 다르게).
 *  왼쪽 △ABC: AB에 10cm, ∠B에 30° 표시. 오른쪽 △DEF(거울 배치): ∠D에 40°, EF에 8cm 표시.
 *  대응: A↔D, B↔E, C↔F(∠A=∠D=40°, ∠B=∠E=30°, ∠C=∠F=110°). 실제 각도로 정확히 작도. */
export function congTwinFig(): string {
  const B = { x: 26, y: 150 };
  const C = { x: 152, y: 150 };
  // ∠B=30° → BA 방향 30°, ∠C=110°(내각) → CA 방향 70°. A = 두 반직선의 교점.
  const tanB = Math.tan((30 * Math.PI) / 180);
  const tan70 = Math.tan((70 * Math.PI) / 180);
  const ax = (tanB * B.x + tan70 * C.x) / (tanB + tan70);
  const ay = 150 - tanB * (ax - B.x);
  const D = { x: 334, y: 150 };
  const E = { x: 208, y: 150 };
  // △DEF: D가 오른쪽 끝(∠D=40), E 왼쪽(∠E=30), 거울 배치
  const tanD = Math.tan((40 * Math.PI) / 180);
  const tanE = Math.tan((30 * Math.PI) / 180);
  const fx = (tanD * D.x + tanE * E.x) / (tanD + tanE);
  const fy = 150 - tanE * (fx - E.x);
  return svg(
    "0 0 360 176",
    // △ABC
    lineSvg(B.x, B.y, C.x, C.y, INK, 2.3) +
      lineSvg(B.x, B.y, ax, ay, INK, 2.3) +
      lineSvg(C.x, C.y, ax, ay, INK, 2.3) +
      angleArc(B.x, B.y, 18, 0, 30, AMBER, "30°", { labelR: 34, fontSize: 11 }) +
      `<text x="${((B.x + ax) / 2 - 12).toFixed(1)}" y="${((B.y + ay) / 2 - 8).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${CYAN}">10 cm</text>` +
      ptLabel(ax, ay, "A", 0, -9) + ptLabel(B.x, B.y, "B", -10, 14) + ptLabel(C.x, C.y, "C", 8, 14) +
      // △DEF (거울: E 왼쪽, D 오른쪽)
      lineSvg(E.x, E.y, D.x, D.y, INK, 2.3) +
      lineSvg(D.x, D.y, fx, fy, INK, 2.3) +
      lineSvg(E.x, E.y, fx, fy, INK, 2.3) +
      angleArc(D.x, D.y, 18, 140, 180, AMBER, "40°", { labelR: 34, fontSize: 11 }) +
      `<text x="${((E.x + D.x) / 2).toFixed(1)}" y="166" text-anchor="middle" font-size="11.5" font-weight="800" fill="${CYAN}">8 cm</text>` +
      ptLabel(fx, fy, "F", 0, -9) + ptLabel(E.x, E.y, "E", -10, 14) + ptLabel(D.x, D.y, "D", 8, 14) +
      `<text x="180" y="42" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">△ABC ≡ △DEF</text>`,
  );
}

/** Ⅳ recap 미니아트(64×64). key: dot(점선면)·trio(선 삼형제)·ang(각)·vert(맞꼭지각)·
 *  perp(수직)·skew(꼬인 위치)·pair(동위·엇각)·para(평행)·comp(컴퍼스)·tri(삼각형)·cong(합동). */
export function geoMiniArt(key: string): string {
  const A: Record<string, string> = {
    dot:
      `<circle cx="18" cy="40" r="5" fill="${INK}"/>` +
      `<path d="M18 40 Q34 14 50 26" stroke="${AMBER}" stroke-width="4" fill="none" stroke-linecap="round"/>` +
      `<rect x="38" y="38" width="16" height="14" rx="3" fill="${CYAN}" opacity=".5"/>`,
    trio:
      lineSvg(10, 18, 54, 18, INK, 3.4) + arrowHead(54, 18, 0, INK, 5) + arrowHead(10, 18, 180, INK, 5) +
      lineSvg(14, 33, 54, 33, AMBER, 3.4) + arrowHead(54, 33, 0, AMBER, 5) + `<circle cx="14" cy="33" r="3.4" fill="${AMBER}"/>` +
      lineSvg(16, 48, 48, 48, CYAN, 3.4) + `<circle cx="16" cy="48" r="3.4" fill="${CYAN}"/><circle cx="48" cy="48" r="3.4" fill="${CYAN}"/>`,
    ang:
      lineSvg(14, 50, 56, 50, INK, 3) +
      lineSvg(14, 50, 46, 16, INK, 3) +
      angleArc(14, 50, 15, 0, 47, AMBER, undefined, { fill: true, width: 2.6 }),
    vert:
      lineSvg(8, 20, 56, 46, INK, 2.8) +
      lineSvg(8, 46, 56, 20, INK, 2.8) +
      angleArc(32, 33, 12, -28, 28, AMBER, undefined, { fill: true, width: 2.2 }) +
      angleArc(32, 33, 12, 152, 208, AMBER, undefined, { fill: true, width: 2.2 }),
    perp:
      lineSvg(8, 50, 56, 50, INK, 3) +
      lineSvg(32, 50, 32, 12, AMBER, 3.2) +
      rightMark(32, 50, 90, 8, CYAN),
    skew:
      lineSvg(10, 24, 54, 14, AMBER, 3.2) +
      lineSvg(12, 44, 52, 52, CYAN, 3.2) +
      `<path d="M28 32 q6 -4 10 2" stroke="${FAINT}" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/>`,
    pair:
      lineSvg(8, 22, 56, 22, INK, 2.6) +
      lineSvg(8, 46, 56, 46, INK, 2.6) +
      lineSvg(16, 58, 48, 8, FAINT, 2.2) +
      angleArc(38, 22, 9, 0, 122, AMBER, undefined, { fill: true, width: 2 }) +
      angleArc(28, 46, 9, 0, 122, AMBER, undefined, { fill: true, width: 2 }),
    para:
      lineSvg(10, 22, 54, 22, CYAN, 3.2) +
      lineSvg(10, 44, 54, 44, CYAN, 3.2) +
      `<path d="M28 18 l6 4 l-6 4 M28 40 l6 4 l-6 4" stroke="${INK}" stroke-width="2" fill="none"/>`,
    comp:
      `<circle cx="32" cy="14" r="4" fill="${AMBER}"/>` +
      lineSvg(30, 17, 18, 52, INK, 3) +
      lineSvg(34, 17, 46, 52, INK, 3) +
      `<path d="M18 52 a30 30 0 0 1 28 0" stroke="${CYAN}" stroke-width="2.4" fill="none" stroke-dasharray="4 4"/>`,
    tri:
      `<path d="M32 12 L10 52 H54 Z" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
      tickMark(10, 52, 54, 52, 1, AMBER),
    cong:
      `<path d="M22 14 L8 40 H36 Z" fill="none" stroke="${AMBER}" stroke-width="2.8" stroke-linejoin="round"/>` +
      `<path d="M42 26 L28 52 H56 Z" fill="none" stroke="${CYAN}" stroke-width="2.8" stroke-linejoin="round"/>`,
  };
  return svg("0 0 64 64", A[key] ?? A.dot);
}

/** L9 정사각형 ABCD(대단원 13): A는 y=3x 위, D는 y=a/x 위, 한 변 3, B·C는 x축. */
export function squareCurveFig(): string {
  const X = (x: number): number => 40 + (x / 7) * 290;
  const Y = (y: number): number => 170 - (y / 7) * 140;
  let curve = "";
  for (let i = 0; i <= 40; i++) {
    const x = 1.8 + (i / 40) * 5.2;
    curve += `${i === 0 ? "M" : "L"}${X(x).toFixed(1)} ${Y(12 / x).toFixed(1)} `;
  }
  return svg(
    "0 0 360 196",
    axes1Q({ x0: 40, y0: 170, x1: 330, y1: 30, xl: "x", yl: "y" }) +
      `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(2.1)}" y2="${Y(6.3)}" stroke="${CYAN}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="${curve}" stroke="${VIOLET}" stroke-width="2.6" stroke-linecap="round" fill="none"/>` +
      `<rect x="${X(1)}" y="${Y(3)}" width="${X(4) - X(1)}" height="${Y(0) - Y(3)}" fill="${AMBER}" fill-opacity=".12" stroke="${AMBER}" stroke-width="1.8"/>` +
      `<circle cx="${X(1)}" cy="${Y(3)}" r="4" fill="${CYAN}"/><circle cx="${X(4)}" cy="${Y(3)}" r="4" fill="${VIOLET}"/>` +
      `<text x="${X(1) - 10}" y="${Y(3) - 6}" font-size="11.5" font-weight="900" fill="${INK}">A</text>` +
      `<text x="${X(1) - 10}" y="${Y(0) + 14}" font-size="11.5" font-weight="900" fill="${INK}">B</text>` +
      `<text x="${X(4) + 4}" y="${Y(0) + 14}" font-size="11.5" font-weight="900" fill="${INK}">C</text>` +
      `<text x="${X(4) + 8}" y="${Y(3) - 6}" font-size="11.5" font-weight="900" fill="${INK}">D</text>` +
      `<text x="${X(1.2)}" y="${Y(6.5)}" font-size="11" font-weight="900" fill="${CYAN}">y=3x</text>` +
      `<text x="${X(5.4)}" y="${Y(3.4)}" font-size="11" font-weight="900" fill="${VIOLET}">y=a/x</text>`,
  );
}
