// u1 v2 파일럿 40문항 스테이징 · 중1 과학 Ⅰ 과학과 인류의 지속가능한 삶 (신규 출제 · 시리즈 12호)
// 정본 설계표 qa/u1-v2-blueprint.md(실측·회피표·쿼터·헬퍼 명세). 이식은 qa/build-u1v2-lessons.mjs.
// 규격: mcq 135/multi 25/num 0/word 0 · diff 64/64/32 · 시각 112/160 · 사진 15장(exam/u1).
// 신작 헬퍼 9종(IF·PT·VT·CG·BR·EX·CH·TL·DB)은 여기서 로컬 저작하고 이식 때 examFigures "u1 v2" 섹션 승격.
import type { ExamItem } from "../src/content/exams/types";
import { svgTable, dbox } from "../src/ui/examFigures";

const IMG_BASE = "";
const ximg = (file: string, alt: string): string =>
  `<img src="${IMG_BASE}exam/u1/${file}" alt="${alt}" style="display:block;width:100%;border-radius:14px" />`;

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 한글 줄바꿈(공백 단위) · 라벨·말풍선 공용. */
const wrapKo = (s: string, per: number): string[] => {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > per) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
};

// ── IF 탐구 과정 흐름도(세로 사슬 · 빈칸 ㉠ · 되돌아가는 화살표) ────────────
/** o.blank = ㉠ 점선 칸 인덱스 · o.loop = [from, to] 되돌아가는 곡선 화살표. */
export function inquiryFlowFig(o: { steps: string[]; blank?: number; loop?: [number, number] }): string {
  const BW = 168;
  const BH = 31;
  const GAP = 15;
  // loop가 없으면 오른쪽 되돌림 화살표 자리가 통째로 비므로 사슬을 중앙 정렬한다.
  const X = o.loop ? 52 : (344 - BW) / 2;
  const n = o.steps.length;
  const H = 12 + n * BH + (n - 1) * GAP + 12;
  const yOf = (i: number): number => 12 + i * (BH + GAP);
  let body = "";
  o.steps.forEach((s, i) => {
    const y = yOf(i);
    const bl = o.blank === i;
    body += `<rect x="${X}" y="${y}" width="${BW}" height="${BH}" rx="9" fill="${bl ? "#FFFFFF" : "#F2F4F7"}" stroke="${bl ? "#3182F6" : "#C9D0D8"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>
      <text x="${X + BW / 2}" y="${y + BH / 2 + 4.5}" text-anchor="middle" font-size="13" font-weight="${bl ? 800 : 600}" fill="${bl ? "#1B64DA" : "#333D4B"}">${bl ? "㉠" : s}</text>`;
    if (i < n - 1) {
      const ay = y + BH;
      const tip = ay + GAP - 2;
      body += `<path d="M${X + BW / 2} ${ay} V${tip} M${X + BW / 2} ${tip} l-4.5 -6 M${X + BW / 2} ${tip} l4.5 -6" fill="none" stroke="#8B95A1" stroke-width="1.5" stroke-linecap="round"/>`;
    }
  });
  if (o.loop) {
    const [from, to] = o.loop;
    const y1 = yOf(from) + BH / 2;
    const y2 = yOf(to) + BH / 2;
    const R = X + BW + 6;
    const OUT = X + BW + 44;
    body += `<path d="M${R} ${y1} H${OUT} V${y2} H${R + 7}" fill="none" stroke="#F0A422" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${R} ${y2} l7 -4.5 M${R} ${y2} l7 4.5" fill="none" stroke="#F0A422" stroke-width="1.8" stroke-linecap="round"/>
      <text x="${OUT + 6}" y="${(y1 + y2) / 2 - 4}" font-size="10.5" font-weight="700" fill="#B4690E">고쳐서</text>
      <text x="${OUT + 6}" y="${(y1 + y2) / 2 + 8}" font-size="10.5" font-weight="700" fill="#B4690E">다시</text>`;
  }
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="탐구 과정의 단계를 위에서 아래로 이은 흐름도. 한 칸은 비어 있고 기호로 표시되어 있다">${body}</svg>`;
}

// ── PT 탐구 계획표(행 라벨 | 내용 2열 · 빈칸 ㉠) ─────────────────────────
export function planTableFig(o: { rows: [string, string][]; blank?: number }): string {
  const W = 344;
  const LW = 96;
  const RW = W - 16 - LW;
  const heights = o.rows.map(([, v]) => Math.max(1, wrapKo(v, 17).length) * 17 + 15);
  const H = heights.reduce((a, b) => a + b, 0) + 16;
  let body = "";
  let y = 8;
  o.rows.forEach(([k, v], i) => {
    const h = heights[i];
    const bl = o.blank === i;
    body += `<rect x="8" y="${y}" width="${LW}" height="${h}" fill="#F2F4F7"/>
      <text x="${8 + LW / 2}" y="${y + h / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${k}</text>`;
    if (bl) {
      body += `<rect x="${8 + LW + 5}" y="${y + 5}" width="${RW - 10}" height="${h - 10}" rx="7" fill="#FFFFFF" stroke="#3182F6" stroke-width="1.6" stroke-dasharray="5 4"/>
        <text x="${8 + LW + RW / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#1B64DA">㉠</text>`;
    } else {
      const lines = wrapKo(v, 17);
      lines.forEach((ln, j) => {
        body += `<text x="${8 + LW + 10}" y="${y + h / 2 - ((lines.length - 1) * 17) / 2 + j * 17 + 4.5}" font-size="12.5" fill="#333D4B">${ln}</text>`;
      });
    }
    y += h;
  });
  let grid = `<line x1="${8 + LW}" y1="8" x2="${8 + LW}" y2="${y}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  let gy = 8;
  grid += `<line x1="8" y1="8" x2="${W - 8}" y2="8" stroke="#DCE0E6" stroke-width="1.2"/>`;
  for (const h of heights) {
    gy += h;
    grid += `<line x1="8" y1="${gy}" x2="${W - 8}" y2="${gy}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  }
  grid += `<line x1="8" y1="8" x2="8" y2="${y}" stroke="#DCE0E6" stroke-width="1.2"/><line x1="${W - 8}" y1="8" x2="${W - 8}" y2="${y}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="탐구 계획을 항목별로 적은 표. 한 칸은 비어 있고 기호로 표시되어 있다">${body}${grid}</svg>`;
}

// ── VT 변인 배정 표(조건 | 같게 | 다르게 · q = ㉠ 빈칸) ─────────────────
export function variableTableFig(o: { items: string[]; marks: ("same" | "diff" | "q")[] }): string {
  const W = 344;
  const C1 = 176;
  const C2 = (W - 16 - C1) / 2;
  const RH = 30;
  const H = RH * (o.items.length + 1) + 16;
  let body = `<rect x="8" y="8" width="${W - 16}" height="${RH}" fill="#F2F4F7"/>
    <text x="${8 + C1 / 2}" y="${8 + RH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">조건</text>
    <text x="${8 + C1 + C2 / 2}" y="${8 + RH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">같게</text>
    <text x="${8 + C1 + C2 * 1.5}" y="${8 + RH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">다르게</text>`;
  o.items.forEach((it, i) => {
    const y = 8 + RH * (i + 1);
    body += `<text x="18" y="${y + RH / 2 + 4.5}" font-size="12.5" fill="#333D4B">${it}</text>`;
    const m = o.marks[i];
    const cx = m === "diff" ? 8 + C1 + C2 * 1.5 : 8 + C1 + C2 / 2;
    if (m === "q") {
      body += `<text x="${8 + C1 + C2}" y="${y + RH / 2 + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#1B64DA">㉠</text>`;
    } else {
      body += `<path d="M${cx - 6} ${y + RH / 2} l4.5 5 l8 -10" fill="none" stroke="#04B45F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  });
  let grid = "";
  for (let i = 0; i <= o.items.length + 1; i++) {
    grid += `<line x1="8" y1="${8 + RH * i}" x2="${W - 8}" y2="${8 + RH * i}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  }
  for (const x of [8, 8 + C1, 8 + C1 + C2, W - 8]) {
    grid += `<line x1="${x}" y1="8" x2="${x}" y2="${8 + RH * (o.items.length + 1)}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="실험 조건마다 같게 할지 다르게 할지를 표시한 표">${body}${grid}</svg>`;
}

// ── CG 결과 꺾은선 그래프(집단 비교 · 정답 판독값은 눈금선 위) ───────────
export function resultLineFig(o: {
  xTicks: string[];
  series: { name: string; color: string; points: number[] }[];
  yMin: number;
  yMax: number;
  yStep: number;
  yLabel: string;
  xLabel: string;
}): string {
  const L = 44;
  const R = 306;
  const TOP = 26;
  const BASE = 182;
  const n = o.xTicks.length;
  const gx = (i: number): number => L + (i * (R - L)) / (n - 1);
  const gy = (v: number): number => BASE - ((v - o.yMin) / (o.yMax - o.yMin)) * (BASE - TOP);
  let grid = "";
  for (let v = o.yMin; v <= o.yMax; v += o.yStep) {
    grid += `<line x1="${L}" y1="${gy(v)}" x2="${R}" y2="${gy(v)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${L - 8}" y="${gy(v) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  o.xTicks.forEach((t, i) => {
    grid += `<line x1="${gx(i)}" y1="${BASE}" x2="${gx(i)}" y2="${TOP}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(i)}" y="${BASE + 16}" text-anchor="middle" font-size="10.5" fill="#8B95A1">${t}</text>`;
  });
  let lines = "";
  o.series.forEach((s) => {
    const d = s.points.map((p, i) => `${i ? "L" : "M"}${gx(i)},${gy(p)}`).join(" ");
    lines += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    s.points.forEach((p, i) => {
      lines += `<circle cx="${gx(i)}" cy="${gy(p)}" r="3.6" fill="#FFFFFF" stroke="${s.color}" stroke-width="2.4"/>`;
    });
    const last = s.points[s.points.length - 1];
    lines += `<text x="${R + 4}" y="${gy(last) + 4}" font-size="11.5" font-weight="700" fill="${s.color}">${s.name}</text>`;
  });
  return `<svg viewBox="0 0 344 214" ${NS} role="img" aria-label="여러 집단의 측정값을 시간에 따라 이은 꺾은선 그래프">
    ${grid}
    <line x1="${L}" y1="${TOP}" x2="${L}" y2="${BASE}" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${L}" y1="${BASE}" x2="${R}" y2="${BASE}" stroke="#B0B8C1" stroke-width="1.6"/>
    ${lines}
    <text x="6" y="14" font-size="11" fill="#4E5968">${o.yLabel}</text>
    <text x="338" y="210" text-anchor="end" font-size="11" fill="#4E5968">${o.xLabel}</text>
  </svg>`;
}

// ── BR 결과 막대 그래프(값 라벨 미인쇄 · 높이 판독이 과제) ───────────────
export function resultBarFig(o: {
  bars: { label: string; value: number }[];
  yMax: number;
  yStep: number;
  yLabel: string;
}): string {
  const L = 44;
  const R = 320;
  const TOP = 26;
  const BASE = 176;
  const n = o.bars.length;
  const slot = (R - L) / n;
  const bw = Math.min(40, slot * 0.54);
  const gy = (v: number): number => BASE - (v / o.yMax) * (BASE - TOP);
  let grid = "";
  for (let v = 0; v <= o.yMax; v += o.yStep) {
    grid += `<line x1="${L}" y1="${gy(v)}" x2="${R}" y2="${gy(v)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${L - 8}" y="${gy(v) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  let bars = "";
  o.bars.forEach((b, i) => {
    const cx = L + slot * (i + 0.5);
    bars += `<rect x="${cx - bw / 2}" y="${gy(b.value)}" width="${bw}" height="${BASE - gy(b.value)}" rx="3" fill="#7FB2F0"/>
      <rect x="${cx - bw / 2}" y="${gy(b.value)}" width="${bw}" height="4" rx="2" fill="#3182F6"/>`;
    wrapKo(b.label, 6).forEach((ln, j) => {
      bars += `<text x="${cx}" y="${BASE + 16 + j * 13}" text-anchor="middle" font-size="11" fill="#4E5968">${ln}</text>`;
    });
  });
  return `<svg viewBox="0 0 344 212" ${NS} role="img" aria-label="여러 항목의 값을 막대 높이로 나타낸 그래프">
    ${grid}
    <line x1="${L}" y1="${TOP}" x2="${L}" y2="${BASE}" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${L}" y1="${BASE}" x2="${R}" y2="${BASE}" stroke="#B0B8C1" stroke-width="1.6"/>
    ${bars}
    <text x="6" y="14" font-size="11" fill="#4E5968">${o.yLabel}</text>
  </svg>`;
}

// ── EX 실험 장치 (가)(나) 2패널(조건 이름 미인쇄 · 판독이 과제) ──────────
interface SetupSpec {
  liquidH: number;
  liquidColor?: string;
  cubes?: number;
  heat?: boolean;
  lid?: boolean;
}
export function setupPairFig(o: { a: SetupSpec; b: SetupSpec }): string {
  const panel = (s: SetupSpec, ox: number, tag: string): string => {
    const BX = ox + 30;
    const BW = 92;
    const BY = 30;
    const BH = 96;
    const lh = Math.round(BH * s.liquidH);
    const ly = BY + BH - lh;
    let g = `<path d="M${BX} ${BY} v${BH} a10 10 0 0 0 10 10 h${BW - 20} a10 10 0 0 0 10 -10 v${-BH}" fill="rgba(200,225,255,.18)" stroke="#9AA7B8" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M${BX + 2} ${ly} v${lh - 2} a8 8 0 0 0 8 8 h${BW - 20} a8 8 0 0 0 8 -8 v${-(lh - 2)} z" fill="${s.liquidColor ?? "#BFDDFA"}" opacity=".85"/>
      <ellipse cx="${BX + BW / 2}" cy="${ly}" rx="${BW / 2 - 2}" ry="4" fill="#DCEBFB"/>`;
    for (let i = 0; i < (s.cubes ?? 0); i++) {
      const cx = BX + BW / 2 - 11 + i * 22;
      g += `<rect x="${cx - 8}" y="${BY + BH - 20}" width="16" height="16" rx="3" fill="#FFFFFF" stroke="#B0B8C1" stroke-width="1.4"/>`;
    }
    // 뚜껑은 컵 폭 +4까지만(양쪽 2px) · 컵 크기가 달라 보이면 "컵의 크기" 오답이 참처럼 읽힌다.
    if (s.lid) {
      g += `<rect x="${BX - 2}" y="${BY - 7}" width="${BW + 4}" height="7" rx="3" fill="#9AA7B8"/>
        <rect x="${BX + BW / 2 - 7}" y="${BY - 12}" width="14" height="6" rx="3" fill="#9AA7B8"/>`;
    }
    if (s.heat) {
      g += `<path d="M${BX + BW / 2 - 22} 148 h44" stroke="#9AA7B8" stroke-width="3" stroke-linecap="round"/>`;
      for (let i = -1; i <= 1; i++) {
        const fx = BX + BW / 2 + i * 15;
        g += `<path d="M${fx} 146 q-5 -8 0 -14 q5 6 0 14z" fill="#F5A028"/><path d="M${fx} 146 q-2.6 -5 0 -8.5 q2.6 3.5 0 8.5z" fill="#FFD25E"/>`;
      }
    } else {
      g += `<path d="M${BX + BW / 2 - 22} 148 h44" stroke="#9AA7B8" stroke-width="3" stroke-linecap="round"/>`;
    }
    g += `<text x="${BX + BW / 2}" y="172" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${tag}</text>`;
    return g;
  };
  return `<svg viewBox="0 0 344 182" ${NS} role="img" aria-label="같은 모양의 실험 장치 두 개를 나란히 놓고 조건을 달리한 그림">
    ${panel(o.a, 0, "(가)")}${panel(o.b, 172, "(나)")}
  </svg>`;
}

// ── CH 원리 → 기술 → 기기 → 문명 사슬(가로 · 빈칸 ㉠) ─────────────────
export function chainFig(o: { cells: string[]; blank?: number }): string {
  const n = o.cells.length;
  const GAP = 16;
  const W = 344;
  const CW = (W - 16 - GAP * (n - 1)) / n;
  const CH2 = 66;
  let body = "";
  o.cells.forEach((c, i) => {
    const x = 8 + i * (CW + GAP);
    const bl = o.blank === i;
    body += `<rect x="${x}" y="18" width="${CW}" height="${CH2}" rx="10" fill="${bl ? "#FFFFFF" : "#F2F4F7"}" stroke="${bl ? "#3182F6" : "#C9D0D8"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>`;
    if (bl) {
      body += `<text x="${x + CW / 2}" y="${18 + CH2 / 2 + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#1B64DA">㉠</text>`;
    } else {
      const lines = wrapKo(c, 5);
      lines.forEach((ln, j) => {
        body += `<text x="${x + CW / 2}" y="${18 + CH2 / 2 - ((lines.length - 1) * 15) / 2 + j * 15 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="600" fill="#333D4B">${ln}</text>`;
      });
    }
    if (i < n - 1) {
      const ax = x + CW + 2;
      body += `<path d="M${ax} ${18 + CH2 / 2} h${GAP - 6} M${ax + GAP - 6} ${18 + CH2 / 2} l-6 -4 M${ax + GAP - 6} ${18 + CH2 / 2} l-6 4" fill="none" stroke="#8B95A1" stroke-width="1.6" stroke-linecap="round"/>`;
    }
  });
  const aria = o.blank === undefined
    ? "네 칸이 화살표로 이어진 가로 흐름 그림"
    : "네 칸이 화살표로 이어진 가로 흐름 그림. 한 칸은 비어 있고 기호로 표시되어 있다";
  return `<svg viewBox="0 0 344 100" ${NS} role="img" aria-label="${aria}">${body}</svg>`;
}

// ── TL 문명 연표(가로 축 + 사건 카드 · hide는 라벨 가림) ─────────────────
export function timelineFig(o: { events: { era: string; label: string }[]; hide?: number[] }): string {
  const n = o.events.length;
  // 축 양 끝은 카드 반폭만큼 안쪽으로 · 끝 카드가 뷰박스를 넘어 잘리는 것을 막는다.
  const CW = 74;
  const L = CW / 2 + 8;
  const R = 344 - CW / 2 - 8;
  const PER = 5;
  // 카드 높이는 가장 긴 라벨의 줄 수를 따라간다(고정 높이면 세 줄 라벨이 상자 밖으로 흘러넘친다).
  const maxLines = Math.max(1, ...o.events.map((e) => (e.label ? wrapKo(e.label, PER).length : 1)));
  const CH2 = 20 + maxLines * 14;
  const GAPV = 22;
  const AY = CH2 + GAPV + 8;
  const H = AY * 2;
  const gx = (i: number): number => L + (i * (R - L)) / (n - 1);
  const MARK = ["㉠", "㉡", "㉢", "㉣"];
  let body = `<path d="M${L - 14} ${AY} H${R + 14} M${R + 14} ${AY} l-7 -4.5 M${R + 14} ${AY} l-7 4.5" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>`;
  o.events.forEach((e, i) => {
    const x = gx(i);
    const up = i % 2 === 0;
    const cy = up ? AY - GAPV - CH2 : AY + GAPV;
    const hid = (o.hide ?? []).includes(i);
    body += `<line x1="${x}" y1="${AY}" x2="${x}" y2="${up ? cy + CH2 : cy}" stroke="#C9D0D8" stroke-width="1.4"/>
      <circle cx="${x}" cy="${AY}" r="4.6" fill="#FFFFFF" stroke="#3182F6" stroke-width="2.4"/>
      <rect x="${x - CW / 2}" y="${cy}" width="${CW}" height="${CH2}" rx="9" fill="${hid ? "#FFFFFF" : "#F2F4F7"}" stroke="${hid ? "#3182F6" : "#C9D0D8"}" stroke-width="${hid ? 1.7 : 1.3}"${hid ? ' stroke-dasharray="5 4"' : ""}/>
      <text x="${x}" y="${cy + 15}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8B95A1">${e.era}</text>`;
    if (hid) {
      body += `<text x="${x}" y="${cy + CH2 / 2 + 12}" text-anchor="middle" font-size="15" font-weight="800" fill="#1B64DA">${MARK[i] ?? "㉠"}</text>`;
    } else {
      wrapKo(e.label, PER).forEach((ln, j) => {
        body += `<text x="${x}" y="${cy + 30 + j * 14}" text-anchor="middle" font-size="11" font-weight="600" fill="#333D4B">${ln}</text>`;
      });
    }
  });
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="시간 축 위아래로 사건 카드를 번갈아 배치한 연표">${body}</svg>`;
}

// ── DB 두 학생 주장 말풍선 ────────────────────────────────────────────
export function debateFig(o: { a: { name: string; claim: string }; b: { name: string; claim: string } }): string {
  const bubble = (name: string, claim: string, y: number, right: boolean): string => {
    const lines = wrapKo(claim, 20);
    const BH = lines.length * 17 + 22;
    const BX = right ? 44 : 8;
    const BW = 292;
    const tone = right ? "#F0A422" : "#3182F6";
    const fillT = right ? "#FFF7E8" : "#EEF4FF";
    let g = `<rect x="${BX}" y="${y}" width="${BW}" height="${BH}" rx="13" fill="${fillT}" stroke="${tone}" stroke-width="1.4"/>`;
    g += right
      ? `<path d="M${BX + BW - 26} ${y + BH} l-4 11 l16 -11z" fill="${fillT}" stroke="${tone}" stroke-width="1.4" stroke-linejoin="round"/>`
      : `<path d="M${BX + 26} ${y + BH} l4 11 l-16 -11z" fill="${fillT}" stroke="${tone}" stroke-width="1.4" stroke-linejoin="round"/>`;
    lines.forEach((ln, j) => {
      g += `<text x="${BX + 14}" y="${y + 19 + j * 17}" font-size="12.5" fill="#333D4B">${ln}</text>`;
    });
    const nx = right ? BX + BW - 12 : BX + 12;
    g += `<text x="${nx}" y="${y + BH + 24}" text-anchor="${right ? "end" : "start"}" font-size="12" font-weight="800" fill="${tone}">${name}</text>`;
    return g;
  };
  const aLines = wrapKo(o.a.claim, 20).length;
  const y2 = 8 + (aLines * 17 + 22) + 34;
  const H = y2 + (wrapKo(o.b.claim, 20).length * 17 + 22) + 34;
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="두 학생이 각자의 주장을 말하는 말풍선 두 개">
    ${bubble(o.a.name, o.a.claim, 8, false)}${bubble(o.b.name, o.b.claim, y2, true)}
  </svg>`;
}

const L1 = "u1l1";
const L2 = "u1l2";
const L3 = "u1l3";
const L4 = "u1l4";
const L5 = "u1l5";

export const POOL_U1V2_PILOT: ExamItem[] = [
  // ══════════ L1 과학적 탐구 방법 ══════════
  {
    id: "u1e201",
    lessonId: L1,
    type: "mcq",
    diff: 1,
    prompt: "그림은 과학적 탐구가 이루어지는 차례를 나타낸 흐름도예요. <b>㉠</b>에 들어갈 단계의 이름으로 옳은 것은?",
    figure: inquiryFlowFig({
      steps: ["문제 인식", "가설 설정", "탐구 설계", "탐구 수행", "자료 해석", "결론 도출"],
      blank: 2,
    }),
    options: ["문제 인식", "탐구 설계", "탐구 수행", "자료 해석", "결론 도출"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>가설을 세운 다음에는 그 가설이 맞는지 확인할 방법을 짜야 해요. 알아보려는 조건 하나만 다르게 하고 나머지를 모두 같게 맞추는 계획을 세우는 단계, 곧 <b>탐구 설계</b>가 ㉠ 자리에 들어가요. 계획이 서야 비로소 실험을 실행할 수 있죠.<span class='xh'>오답 하나씩 격파</span>'탐구 수행'은 ㉠ 바로 아래 칸에 이미 그려져 있어요 · 흐름도에 있는 이름은 답이 될 수 없죠. '자료 해석'과 '결론 도출'은 실험을 마친 뒤에 오는 단계라 가설 바로 다음에 놓일 수 없고, '문제 인식'은 가설보다 앞선 첫 칸이에요. 흐름도 문제는 <b>빈칸의 앞뒤 칸을 먼저 읽는 것</b>이 요령이에요 · 앞이 가설, 뒤가 수행이면 그 사이는 계획을 짜는 자리랍니다.",
    core: "가설 다음, 수행 앞 = 탐구 설계. 빈칸은 앞뒤 칸으로 좁혀요!",
  },
  {
    id: "u1e203",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt: "다음은 어떤 학생이 식빵의 곰팡이를 알아본 과정이에요. <b>(라)</b>는 탐구의 어느 단계에 해당할까요?",
    figure: dbox([
      ["(가)", "식빵을 며칠 두었더니 한쪽에만 곰팡이가 피었어요. 왜 한쪽에만 폈을까 궁금했어요."],
      ["(나)", "축축한 곳일수록 곰팡이가 잘 필 것이라고 생각했어요."],
      ["(다)", "같은 식빵을 두 조각으로 나눠 한 조각은 마른 접시에, 다른 조각은 젖은 휴지 위에 올려 두기로 했어요."],
      ["(라)", "엿새 동안 아침마다 곰팡이가 퍼진 넓이를 재어 그대로 적었어요."],
    ]),
    options: ["문제 인식", "가설 설정", "탐구 설계", "탐구 수행", "결론 도출"],
    answer: 3,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>(라)는 세운 계획대로 조건을 유지하며 <b>관찰하고 측정해 결과를 그대로 기록</b>한 대목이에요. 이것이 <b>탐구 수행</b> 단계랍니다. '아침마다', '재어', '그대로 적었어요'라는 말이 실행과 기록을 가리키죠.<span class='xh'>오답 하나씩 격파</span>'문제 인식'은 궁금증을 또렷한 질문으로 만든 (가)예요. '가설 설정'은 아는 것을 바탕으로 잠정적인 답을 세운 (나)이고요. '탐구 설계'는 무엇을 다르게 하고 무엇을 같게 할지 정한 (다)죠 · (다)와 (라)를 헷갈리기 쉬운데, <b>계획을 세운 것이 설계, 그 계획을 실행한 것이 수행</b>이에요. '결론 도출'은 자료를 근거로 가설이 맞는지 판단하는 단계라 아직 나오지 않았어요.",
    core: "계획을 세우면 설계, 그대로 실행하고 기록하면 수행!",
  },
  {
    id: "u1e206",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt: "다음은 어떤 학생이 세운 실험 계획이에요. 이 계획의 가장 큰 문제점은?",
    figure: dbox([
      ["알아볼 것", "바람이 빨래가 마르는 빠르기에 영향을 줄까?"],
      ["(가)", "바람이 부는 창가에 큰 수건 한 장을 넌다."],
      ["(나)", "바람이 없는 방 안에 작은 수건 한 장을 넌다."],
      ["잴 것", "수건이 다 마를 때까지 걸린 시간"],
    ]),
    options: [
      "바람 말고 수건의 크기까지 함께 달라서 무엇이 원인인지 가릴 수 없다",
      "수건을 두 장만 써서 결과를 믿을 수 없다",
      "수건 대신 옷을 널어야 정확한 실험이 된다",
      "잴 것을 시간으로 정해서 결과를 숫자로 나타낼 수 없다",
      "알아보려는 것이 무엇인지 정해져 있지 않다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>알아보려는 것은 <b>바람</b> 하나예요. 그렇다면 바람만 다르게 하고 수건의 크기·두께·재질은 모두 같게 맞춰야 하죠. 그런데 이 계획은 바람과 함께 <b>수건의 크기</b>까지 달라서, 마르는 시간이 달라져도 그것이 바람 때문인지 수건이 작아서인지 콕 집어 말할 수 없어요.<span class='xh'>오답 하나씩 격파</span>'수건을 두 장만 썼다'는 가장 큰 문제가 아니에요 · 여러 번 되풀이하면 더 믿음직해지지만, 이 계획의 결정적인 흠은 두 조건이 함께 바뀐 것이거든요. '옷을 널어야 한다'는 알아보려는 것과 상관없는 참견이고, '시간으로 정해서 숫자로 못 나타낸다'는 반대예요 · 시간은 숫자로 재기 좋은 항목이거든요. '알아보려는 것이 없다'도 사실과 달라요 · 맨 윗줄에 또렷하게 적혀 있답니다.",
    core: "알아보려는 것 하나만 다르게! 두 가지가 함께 바뀌면 범인을 못 잡아요.",
    // 소재 배타: 각설탕 녹이기는 213(두 학생 판단)이 선점 · 이 슬롯은 빨래·바람으로 분리했다.
  },
  {
    id: "u1e209",
    lessonId: L1,
    type: "multi",
    diff: 1,
    prompt: "다음 중 <b>가설이 될 수 있는 것</b>을 <b>모두</b> 고르세요.",
    options: [
      "장난감 자동차는 무거울수록 더 멀리 굴러갈 것이다",
      "소리는 공기 중에서보다 물속에서 더 빠르게 전달될 것이다",
      "밤하늘에서 가장 아름다운 별은 무엇일까",
      "지구는 태양의 주위를 돈다",
      "얼음에 소금을 뿌리면 더 빨리 녹을 것이다",
    ],
    answer: [0, 1, 4],
    explain:
      "<span class='xh'>정답 풀이</span>가설은 아는 것을 바탕으로 세운 <b>잠정적인 답</b>이면서, 실험으로 <b>참인지 거짓인지 확인할 수 있어야</b> 해요. '무거울수록 더 멀리 굴러갈 것이다', '물속에서 더 빠를 것이다', '소금을 뿌리면 빨리 녹을 것이다'는 모두 조건을 바꿔 확인해 볼 수 있는 예상이라 가설이 됩니다.<span class='xh'>오답 하나씩 격파</span>'가장 아름다운 별은 무엇일까'는 사람마다 답이 다른 <b>취향의 문제</b>라 실험으로 가릴 수 없어요 · 게다가 예상이 아니라 질문 형태죠. '지구는 태양의 주위를 돈다'는 예상이 아니라 <b>이미 확정된 사실을 단정한 문장</b>이라 가설이 될 수 없어요 · 교실에서 조건을 바꿔 확인해 볼 수 있는 형태도 아니고요. <b>'~할 것이다'라는 예상인가, 조건을 바꿔 확인할 수 있는가</b> · 이 둘을 함께 따져 보세요.",
    core: "가설 = 아직 확인 안 된 예상 + 실험으로 확인 가능. 둘 다 만족해야!",
  },
  {
    id: "u1e213",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt:
      "두 컵은 <b>물의 온도만 다르고</b> 물의 양·각설탕 개수·컵 모양은 모두 같게 맞춘 것이에요. 실험 결과를 본 두 학생의 말에 대한 판단으로 가장 옳은 것은?",
    figure: debateFig({
      a: { name: "지호", claim: "따뜻한 물에서 더 빨리 녹았으니, 물이 따뜻할수록 잘 녹는 거야." },
      b: { name: "나연", claim: "따뜻한 물이 든 컵이 더 예뻤으니까, 컵이 예쁠수록 잘 녹는 거야." },
    }),
    options: [
      "지호가 옳아요. 다르게 한 조건이 물의 온도 하나뿐이니까요",
      "나연이 옳아요. 컵의 생김새도 결과에 영향을 주니까요",
      "둘 다 옳아요. 두 조건이 함께 작용한 결과니까요",
      "둘 다 틀렸어요. 한 번의 실험으로는 아무것도 말할 수 없으니까요",
      "지호가 옳아요. 따뜻한 물이 원래 무엇이든 잘 녹이는 성질이 있으니까요",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>이 실험에서 일부러 다르게 한 조건은 <b>물의 온도 하나뿐</b>이에요. 그래서 녹는 빠르기가 달라진 까닭을 온도로 돌릴 수 있죠. 지호의 말은 결론도 옳고 <b>근거도 실험 자료</b>에 있어서 가장 알맞은 판단이에요.<span class='xh'>오답 하나씩 격파</span>나연의 말은 컵의 생김새를 원인으로 들었는데, 컵 모양은 같게 맞춘 조건이라 결과를 가를 수 없어요 · 겉모습처럼 결과와 관계없는 것을 원인으로 삼는 것이 대표적인 함정이죠. '둘 다 옳다'는 나연의 잘못된 근거까지 인정하는 셈이라 안 됩니다. '한 번의 실험으로는 아무것도 말할 수 없다'는 지나친 말이에요 · 조건을 제대로 통제했다면 결론을 낼 수 있고, 더 확실히 하려면 여러 번 반복하면 되죠. '따뜻한 물이 원래 무엇이든 잘 녹인다'는 보기는 결론은 같지만 근거가 <b>실험 자료가 아니라 미리 아는 생각</b>이라 이 자료의 판단으로는 알맞지 않아요.",
    core: "옳은 판단 = 옳은 결론 + 자료에 있는 근거. 결론만 맞아도 부족해요!",
  },
  {
    id: "u1e217",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt: "표는 어떤 학생의 탐구 계획이에요. <b>㉠(같게 할 조건)</b>에 들어갈 수 <b>없는</b> 것은?",
    figure: planTableFig({
      rows: [
        ["알아볼 것", "경사가 급할수록 공이 빨리 굴러 내려올까?"],
        ["다르게 할 조건", "나무판을 기울인 정도"],
        ["같게 할 조건", ""],
        ["잴 것", "공이 끝까지 내려오는 데 걸린 시간"],
      ],
      blank: 2,
    }),
    options: ["공의 무게", "나무판의 길이", "공을 놓는 위치", "나무판을 기울인 정도", "바닥의 재질"],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>'나무판을 기울인 정도'는 이 탐구에서 <b>일부러 다르게 한 조건</b>이에요. 표에도 '다르게 할 조건' 칸에 그대로 적혀 있죠. 그러니 같게 할 조건 칸에는 들어갈 수 없어요 · 한 조건이 같게이면서 동시에 다르게일 수는 없으니까요.<span class='xh'>오답 하나씩 격파</span>공의 무게, 나무판의 길이, 공을 놓는 위치, 바닥의 재질은 모두 걸린 시간에 영향을 줄 수 있는 것들이라 <b>똑같이 맞춰야</b> 해요. 예를 들어 공을 놓는 위치가 다르면 굴러 내려온 거리가 달라져, 시간 차이가 경사 때문인지 거리 때문인지 알 수 없게 되죠. 이렇게 결과에 영향을 줄 수 있는 조건을 모두 같게 맞추는 것이 공정한 실험의 조건이에요.",
    core: "다르게 할 조건은 딱 하나, 나머지는 전부 같게. 둘을 겸할 수 없어요!",
  },
  {
    id: "u1e220",
    lessonId: L1,
    type: "mcq",
    diff: 2,
    prompt: "표는 같은 운동장에서 햇빛이 드는 곳과 나무 그늘의 온도를 같은 날 세 번 잰 결과예요. 이 표에서 알 수 있는 것으로 옳은 것은?",
    figure: svgTable(
      ["잰 곳", "오전 10시", "낮 12시", "오후 3시"],
      [
        ["햇빛 아래", "22 ℃", "30 ℃", "27 ℃"],
        ["나무 그늘", "20 ℃", "24 ℃", "23 ℃"],
      ],
      { firstColHead: true },
    ),
    options: [
      "잰 시각마다 그늘이 더 낮았고, 낮 12시에 두 곳의 차이가 가장 컸다",
      "나무 그늘에서는 온도가 조금도 오르지 않았다",
      "두 곳의 온도 차이는 시각이 늦어질수록 점점 커졌다",
      "가장 더운 때는 오후 3시였다",
      "나무가 주변 공기를 식혀 주기 때문에 그늘이 시원하다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>세 시각 모두 햇빛 아래가 22·30·27 ℃, 그늘이 20·24·23 ℃로 <b>언제나 그늘이 더 낮아요</b>. 두 곳의 차이는 2 ℃, 6 ℃, 4 ℃이니 <b>낮 12시에 가장 크게 벌어졌죠</b>. 표를 읽을 때는 각 시점의 크기 비교와 시간에 따른 변화를 함께 보는 것이 요령이에요.<span class='xh'>오답 하나씩 격파</span>'조금도 오르지 않았다'는 20에서 24까지 오른 값과 어긋나요 · 덜 올랐을 뿐 오르긴 했죠. '차이가 점점 커졌다'는 2에서 6으로 벌어졌다가 4로 좁아진 흐름과 맞지 않고요. '가장 더운 때가 오후 3시'는 낮 12시의 30 ℃가 더 높다는 점에서 틀렸어요. '나무가 공기를 식혀 준다'는 그럴듯하지만 이 표로는 확인할 수 없는 원인 설명이랍니다 · 표는 온도가 얼마였는지만 알려 줄 뿐, 왜 그런지까지 말해 주지는 않아요.",
    core: "표 읽기 = 값 비교 + 시간에 따른 변화. 자료 밖 이야기는 답이 아니에요!",
  },
  {
    id: "u1e231",
    lessonId: L1,
    type: "mcq",
    diff: 3,
    prompt: "표는 날개 길이만 다르게 만든 종이비행기를 각각 세 번씩 날려 날아간 거리를 잰 결과예요. 옳은 것을 <보기>에서 모두 고른 것은?",
    figure: svgTable(
      ["종이비행기", "1회", "2회", "3회"],
      [
        ["짧은 날개", "5 m", "6 m", "5 m"],
        ["긴 날개", "8 m", "9 m", "8 m"],
      ],
      { firstColHead: true },
    ),
    bogi: [
      "긴 날개 비행기가 짧은 날개 비행기보다 멀리 날아갔어요",
      "같은 비행기를 세 번씩 날린 것은 우연한 차이를 줄이기 위해서예요",
      "이 자료로 날개가 길수록 비행기가 무거워진다는 것도 알 수 있어요",
    ],
    options: ["ㄱ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ ✓ 짧은 날개는 5·6·5 m, 긴 날개는 8·9·8 m로 <b>세 번 모두</b> 긴 날개가 멀리 날아갔어요. ㄴ ✓ 같은 조건이라도 던지는 힘이나 바람 때문에 결과가 조금씩 흔들리죠. 여러 번 재어 견주면 이런 <b>우연한 차이에 속지 않고</b> 규칙을 찾을 수 있어요.<span class='xh'>오답 하나씩 격파</span>ㄷ ✗ 이 표에는 <b>거리만</b> 적혀 있어요. 무게는 재지도, 적지도 않았으니 알 수 없죠. 자료 해석에서 가장 흔한 실수가 '그럴듯하니까 이것도 알 수 있겠지' 하고 <b>재지 않은 것까지 결론에 끼워 넣는 것</b>이에요. 표가 말해 주는 것과 내가 짐작한 것을 또렷이 갈라 두세요.",
    core: "여러 번 재는 건 우연을 줄이려고! 재지 않은 것은 결론에 못 넣어요.",
  },

  // ══════════ L2 직접 탐구하기 ══════════
  {
    id: "u1e233",
    lessonId: L2,
    type: "mcq",
    diff: 1,
    prompt: "사진은 어떤 학생이 꾸민 실험 장치예요. 세 화분에서 <b>일부러 다르게 한 조건</b>은 무엇일까요?",
    figure: ximg(
      "plant-light.webp",
      "탁자 위에 작은 화분 세 개가 나란히 놓여 있고 왼쪽 위에 전등이 하나 켜져 있는 사진",
    ),
    options: ["화분이 받는 빛의 밝기", "화분의 크기", "담은 흙의 양", "심은 식물의 종류", "화분을 놓은 순서"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진 속 세 화분은 크기도 흙의 양도 심은 식물도 모두 같아 보여요. 눈에 띄게 다른 것은 <b>왼쪽은 환하고 오른쪽으로 갈수록 어둡다</b>는 점 하나뿐이죠. 그러니 이 학생이 일부러 다르게 한 조건은 화분이 받는 <b>빛의 밝기</b>랍니다.<span class='xh'>오답 하나씩 격파</span>화분의 크기·흙의 양·심은 식물은 사진에서 셋이 똑같아요 · 이렇게 <b>같게 맞춘 조건</b>은 결과 차이의 원인이 될 수 없죠. '놓은 순서'는 그냥 나란히 늘어놓은 배치일 뿐, 식물이 자라는 데 영향을 주려고 조절한 조건이 아니에요. 장치 사진을 볼 때는 <b>셋 사이에서 무엇이 같고 무엇이 다른지</b>부터 훑어보세요 · 다른 것이 딱 하나면 그게 알아보려는 조건이랍니다.",
    core: "장치 사진은 '같은 것 vs 다른 것' 훑기부터! 다른 하나가 알아보려는 조건.",
  },
  {
    id: "u1e235",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt: "사진의 실험에서 <b>결과를 기록하는 방법</b>으로 가장 알맞은 것은?",
    figure: ximg(
      "plant-light.webp",
      "같은 크기의 화분 세 개가 나란히 놓인 사진. 왼쪽 화분 쪽은 환하고 오른쪽으로 갈수록 주변이 어둡다",
    ),
    options: [
      "며칠에 한 번씩 세 화분의 잎 길이를 재어 표로 정리한다",
      "전등에 가장 가까운 화분 하나만 골라 재어 적는다",
      "잘 자란 것 같은 화분만 적고 나머지는 넘어간다",
      "예상과 다르게 자란 화분은 기록에서 빼 둔다",
      "세 화분을 한 자리에 모아 놓고 마지막 날에 한 번만 본다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>탐구 수행에서 결과는 <b>숫자로 재고, 여러 번에 걸쳐, 있는 그대로</b> 남기는 것이 원칙이에요. 며칠에 한 번씩 세 화분의 잎 길이를 재어 표로 모으면 나중에 그래프로 옮겨 규칙을 찾기도 좋죠.<span class='xh'>오답 하나씩 격파</span>'전등에 가장 가까운 화분 하나만'은 밝기가 다른 세 화분을 견주려는 실험에서 비교 대상을 통째로 버리는 셈이고, '잘 자란 것 같은 화분만'은 내 마음에 드는 것만 골라 남기는 셈이라 결과가 실제와 달라져요. '예상과 다른 화분을 뺀다'는 더 위험해요 · <b>가설이 맞기를 바라는 마음으로 자료를 손보면</b> 그 결론은 아무도 믿을 수 없거든요. '마지막 날에 한 번만 본다'는 자라는 과정을 통째로 놓쳐서, 어느 시점부터 차이가 벌어졌는지 알 수 없게 된답니다.",
    core: "결과는 숫자로 · 여러 번 · 있는 그대로. 골라 적는 순간 탐구가 무너져요!",
  },
  {
    id: "u1e238",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt: "그래프는 같은 씨앗을 서로 다른 온도의 방에 두고 며칠 동안 싹이 튼 개수를 센 결과예요. 이 그래프에서 읽어 낼 수 있는 것으로 옳은 것은?",
    figure: resultLineFig({
      xTicks: ["2일", "4일", "6일", "8일"],
      series: [
        { name: "30 ℃", color: "#F04452", points: [4, 10, 16, 18] },
        { name: "20 ℃", color: "#3182F6", points: [2, 6, 10, 14] },
        { name: "5 ℃", color: "#8B95A1", points: [0, 0, 2, 2] },
      ],
      yMin: 0,
      yMax: 20,
      yStep: 2,
      yLabel: "싹이 튼 개수",
      xLabel: "지난 날수",
    }),
    options: [
      "온도가 높은 방에 둔 씨앗일수록 싹이 더 빨리, 더 많이 텄다",
      "온도가 낮은 방에 둔 씨앗일수록 싹이 더 많이 텄다",
      "세 방에서 싹이 튼 개수는 거의 같았다",
      "8일이 지나자 세 방 모두 싹이 다 텄다",
      "온도와 싹이 트는 것은 아무 관계가 없었다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>같은 날짜에서 세 선의 높이를 견주면 언제나 <b>30 ℃ 선이 가장 위, 5 ℃ 선이 가장 아래</b>예요. 게다가 30 ℃ 선이 가장 가파르게 올라가죠. 그러니 온도가 높은 방일수록 싹이 더 빨리, 더 많이 텄다고 읽을 수 있어요.<span class='xh'>오답 하나씩 격파</span>'낮을수록 많이 텄다'는 선의 위아래가 정반대라 틀렸어요. '거의 같았다'는 8일 뒤 18개와 2개라는 큰 차이와 어긋나고요. '8일에 세 방 모두 다 텄다'는 5 ℃ 선이 여전히 아주 낮은 자리에 머문 것과 맞지 않아요. '아무 관계가 없다'는 선들이 온도 순서대로 나란히 갈라진 모습 자체를 부정하는 말이랍니다. 꺾은선 여러 개를 읽을 때는 <b>같은 시점의 높이 비교</b>와 <b>선의 가파른 정도</b>를 함께 보세요.",
    core: "여러 꺾은선은 같은 날의 높이 비교 + 가파른 정도. 둘을 함께 읽어요!",
  },
  {
    id: "u1e241",
    lessonId: L2,
    type: "multi",
    diff: 1,
    prompt:
      "표는 <b>물의 양이 물이 끓는 데 걸리는 시간에 주는 영향</b>을 알아보려고 어떤 학생이 조건을 정리한 것이에요. <b>잘못 표시한 조건</b>을 <b>모두</b> 고르세요.",
    figure: variableTableFig({
      items: ["냄비의 크기와 모양", "냄비에 붓는 물의 양", "불의 세기", "처음 물의 온도", "시간을 재는 방법"],
      marks: ["same", "diff", "diff", "diff", "same"],
    }),
    options: ["냄비의 크기와 모양", "냄비에 붓는 물의 양", "불의 세기", "처음 물의 온도", "시간을 재는 방법"],
    answer: [2, 3],
    explain:
      "<span class='xh'>정답 풀이</span>알아보려는 것이 <b>물의 양</b>이므로 다르게 할 조건은 '냄비에 붓는 물의 양' 하나뿐이어야 해요. 그런데 표에는 '불의 세기'와 '처음 물의 온도'까지 다르게로 표시돼 있죠 · 이 둘은 <b>같게</b>로 고쳐야 합니다.<span class='xh'>오답 하나씩 격파</span>'냄비의 크기와 모양'과 '시간을 재는 방법'은 같게로 옳게 표시돼 있어요 · 냄비가 다르면 바닥 넓이 때문에 결과가 흔들리고, 재는 방법이 다르면 애초에 견줄 수가 없죠. '냄비에 붓는 물의 양'은 알아보려는 조건이니 다르게가 맞고요. 표를 검토할 때는 <b>다르게에 표시된 줄이 몇 개인지</b>부터 세어 보세요 · 두 개 이상이면 그 순간 공정한 실험이 아니랍니다.",
    core: "다르게 줄은 반드시 하나! 두 줄 이상이면 표부터 틀린 거예요.",
  },
  {
    id: "u1e245",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt: "그래프는 물에 넣은 세제의 양만 다르게 해 비눗방울을 만들고, 터지지 않고 버틴 시간을 잰 결과예요. 이 그래프에서 알 수 있는 것으로 옳은 것은?",
    figure: resultBarFig({
      bars: [
        { label: "아주 조금", value: 8 },
        { label: "조금", value: 16 },
        { label: "보통", value: 20 },
        { label: "많이", value: 12 },
      ],
      yMax: 24,
      yStep: 4,
      yLabel: "버틴 시간(초)",
    }),
    options: [
      "세제를 늘릴수록 오래 버티다가, 어느 정도를 넘자 오히려 짧아졌다",
      "세제를 늘릴수록 버틴 시간이 끝까지 계속 늘어났다",
      "세제의 양과 버틴 시간 사이에는 아무 관계가 없었다",
      "세제를 가장 적게 넣었을 때 가장 오래 버텼다",
      "세제를 가장 많이 넣었을 때 가장 오래 버텼다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>막대 높이를 왼쪽부터 따라가면 8초, 16초, 20초까지 <b>점점 높아지다가</b> 마지막 '많이'에서 12초로 <b>뚝 낮아져요</b>. 그러니 세제를 늘리면 한동안은 오래 버티지만, 어느 정도를 넘어서면 오히려 빨리 터진다고 읽어야 하죠.<span class='xh'>오답 하나씩 격파</span>'끝까지 계속 늘어났다'는 마지막 막대가 내려앉은 것을 못 본 답이에요 · 앞의 세 막대만 보고 성급하게 규칙을 정하는 것이 이 문항의 함정이랍니다. '아무 관계가 없다'기엔 막대 높이가 8초에서 20초까지 뚜렷하게 달라졌고요. '가장 적게 넣었을 때 가장 오래'는 가장 낮은 막대와 정반대, '가장 많이 넣었을 때 가장 오래'도 12초라는 값과 어긋나요. 막대그래프는 <b>끝까지 다 보고</b> 규칙을 말해야 해요.",
    core: "막대는 끝까지 보고 규칙을! 늘리다 줄어드는 모양을 놓치지 마세요.",
  },
  {
    id: "u1e248",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt: "그림은 한 가지 조건만 다르게 꾸민 두 장치예요. 두 컵에 담은 물의 양과 놓아둔 자리는 같아요. 이 실험으로 알아보려는 것은?",
    figure: setupPairFig({ a: { liquidH: 0.55, lid: true }, b: { liquidH: 0.55 } }),
    options: [
      "뚜껑을 덮는 것이 물이 줄어드는 정도에 주는 영향",
      "물의 양이 물이 줄어드는 정도에 주는 영향",
      "컵의 크기가 물이 줄어드는 정도에 주는 영향",
      "물의 온도가 물이 줄어드는 정도에 주는 영향",
      "놓아둔 자리의 밝기가 물이 줄어드는 정도에 주는 영향",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>그림에서 두 컵은 크기도, 담긴 물의 높이도 똑같아요. 눈에 띄게 다른 것은 <b>(가)에만 뚜껑이 덮여 있다</b>는 점 하나뿐이죠. 그러니 이 실험은 뚜껑을 덮는 것이 물이 줄어드는 데 어떤 영향을 주는지 알아보는 것이랍니다.<span class='xh'>오답 하나씩 격파</span>물의 양은 두 컵의 물 높이가 같으니 다르게 한 조건이 아니에요. 컵의 크기도 그림에서 똑같고요. 물의 온도는 두 장치 어디에도 데우거나 식히는 장치가 없으니 다르게 했다고 볼 근거가 없고, 놓아둔 자리의 밝기는 문두에서 같다고 밝혔죠. 이런 장치 그림 문제는 <b>두 그림을 겹쳐 놓고 틀린 그림 찾기</b>를 하듯 훑으면 다른 곳이 딱 하나 보인답니다.",
    core: "장치 두 개는 '틀린 그림 찾기'! 다른 곳 하나가 알아보려는 조건.",
  },
  {
    id: "u1e255",
    lessonId: L2,
    type: "mcq",
    diff: 2,
    prompt:
      "그래프는 크기가 같은 얼음 두 조각 중 하나에만 소금을 뿌리고, 남은 얼음의 높이를 잰 결과예요. 두 얼음의 <b>높이 차이가 가장 크게 벌어진 때</b>는 언제일까요?",
    figure: resultLineFig({
      xTicks: ["처음", "10분 뒤", "20분 뒤", "30분 뒤"],
      series: [
        { name: "안 뿌림", color: "#3182F6", points: [40, 35, 30, 20] },
        { name: "뿌림", color: "#F04452", points: [40, 15, 5, 0] },
      ],
      yMin: 0,
      yMax: 40,
      yStep: 5,
      yLabel: "남은 높이(mm)",
      xLabel: "지난 시간",
    }),
    options: ["처음", "10분 뒤", "20분 뒤", "30분 뒤", "차이는 내내 같았다"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>두 선의 세로 간격을 시점마다 읽어 보면 처음은 0 mm, 10분 뒤는 35와 15로 20 mm, <b>20분 뒤는 30과 5로 25 mm</b>, 30분 뒤는 20과 0으로 20 mm예요. 간격이 가장 크게 벌어진 때는 <b>20분 뒤</b>랍니다.<span class='xh'>오답 하나씩 격파</span>'처음'은 두 조각이 같은 높이에서 출발했으니 차이가 0이에요. '10분 뒤'와 '30분 뒤'는 20 mm로 20분 뒤보다 좁고요. '차이는 내내 같았다'는 간격이 0에서 25까지 달라진 것과 어긋나죠. 두 선의 차이를 묻는 문제는 <b>눈금선 위에서 두 점의 값을 각각 읽고 빼는 것</b>이 정석이에요 · 선이 벌어져 보이는 느낌만으로 고르면 30분 뒤를 고르기 쉬운데, 그때는 이미 뿌린 쪽이 바닥에 닿아 더 벌어질 수가 없답니다.",
    core: "두 선의 차이는 눈금에서 값을 읽어 빼기! 벌어져 보이는 느낌은 속아요.",
  },
  {
    id: "u1e264",
    lessonId: L2,
    type: "mcq",
    diff: 3,
    prompt:
      "그래프는 같은 강낭콩을 심고 <b>물을 주는 양만</b> 다르게 해 키를 잰 결과예요. 이 탐구를 시작할 때 세운 예상은 '물을 많이 줄수록 더 빨리 자랄 것이다'였어요. 옳은 것을 <보기>에서 모두 고른 것은?",
    figure: resultLineFig({
      xTicks: ["심은 날", "15일 뒤", "30일 뒤"],
      series: [
        { name: "보통", color: "#04B45F", points: [10, 25, 40] },
        { name: "많이", color: "#3182F6", points: [10, 20, 30] },
        { name: "적게", color: "#F0A422", points: [10, 15, 20] },
      ],
      yMin: 0,
      yMax: 40,
      yStep: 5,
      yLabel: "키(cm)",
      xLabel: "지난 날수",
    }),
    bogi: [
      "물을 보통으로 준 강낭콩이 가장 많이 자랐어요",
      "처음에 세운 예상은 이 자료로 뒷받침되지 않아요",
      "이 자료만으로는 물의 양과 키 사이에 아무 관계가 없다고 보아야 해요",
    ],
    options: ["ㄱ", "ㄱ, ㄴ", "ㄱ, ㄷ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"],
    answer: 1,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>ㄱ ✓ 30일 뒤 키는 보통 40 cm, 많이 30 cm, 적게 20 cm로 <b>보통을 준 쪽이 가장 큽니다</b>. ㄴ ✓ '많이 줄수록 빨리 자란다'가 맞으려면 '많이' 선이 가장 높아야 하는데, 실제로는 보통보다 아래에 있죠 · 그러니 자료가 예상을 받쳐 주지 않아요.<span class='xh'>오답 하나씩 격파</span>ㄷ ✗ 세 선이 서로 다른 높이로 또렷하게 갈라졌으니 <b>관계가 없다고 볼 수 없어요</b>. 다만 그 관계가 '많이 줄수록 크다'가 아니라 '알맞은 양일 때 가장 크다'였을 뿐이죠. 예상이 빗나간 것은 실패가 아니라 새로운 사실을 알아낸 것이고, 이럴 때는 예상을 고쳐 다시 탐구하면 됩니다 · 자료가 예상과 다를 때 자료를 의심하기 전에 <b>예상을 고칠 준비</b>를 하는 태도가 중요해요.",
    core: "자료가 예상과 다르면 고쳐서 다시! 빗나간 예상도 훌륭한 결과예요.",
  },

  // ══════════ L3 과학과 인류 문명 ══════════
  {
    id: "u1e265",
    lessonId: L3,
    type: "mcq",
    diff: 1,
    prompt: "사진은 300여 년 전에 쓰이던 어떤 기기예요. 이 기기가 사람들에게 열어 준 세계로 가장 알맞은 것은?",
    figure: ximg("old-microscope.webp", "놋쇠로 만든 긴 통과 받침이 달린 옛 기기가 나무 책상 위에 놓여 있는 사진"),
    options: [
      "맨눈으로는 볼 수 없던 아주 작은 세계",
      "아주 멀리 떨어진 별과 행성의 모습",
      "땅속 깊은 곳에 쌓인 지층의 구조",
      "바닷속 깊은 곳에 사는 생물의 모습",
      "몸속에 있는 뼈의 생김새",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진 속 기기는 렌즈를 겹쳐 물체를 크게 확대해 보는 <b>현미경</b>이에요. 이 기기가 만들어지면서 사람들은 맨눈으로는 도저히 볼 수 없던 <b>아주 작은 세계</b>를 처음으로 들여다볼 수 있게 되었죠.<span class='xh'>오답 하나씩 격파</span>'멀리 있는 별과 행성'은 같은 렌즈를 쓰지만 <b>망원경</b>의 몫이에요 · 렌즈라는 재료가 같아도 어느 쪽으로 확대하느냐에 따라 전혀 다른 기기가 되죠. '땅속 지층'은 직접 파거나 깎인 절벽을 관찰해야 알 수 있고, '바닷속 깊은 곳'은 잠수 장비와 탐사선이 있어야 닿는 곳이에요. '몸속 뼈'는 훨씬 뒤에 나온 다른 장치가 맡은 일이고요. 기기 사진 문제는 <b>렌즈가 향하는 방향</b>을 떠올리면 헷갈리지 않아요.",
    core: "렌즈를 겹쳐 작은 것을 크게 = 현미경. 먼 곳을 당기면 망원경!",
  },
  {
    id: "u1e268",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt: "사진은 18~19세기에 등장해 세상을 크게 바꾼 탈것이에요. 이 기기가 널리 쓰이면서 나타난 변화로 가장 알맞은 것은?",
    figure: ximg("steam-locomotive.webp", "굴뚝에서 흰 연기를 내뿜으며 철길 위에 서 있는 검은 탈것의 사진"),
    options: [
      "사람과 물건을 한꺼번에, 멀리, 빠르게 실어 나를 수 있게 되었다",
      "지구 반대편과도 소식을 실시간으로 주고받게 되었다",
      "감염병으로 목숨을 잃는 사람이 크게 줄어들었다",
      "맨눈에 보이지 않던 작은 생물을 관찰하게 되었다",
      "집 밖에서도 집 안의 기계를 켜고 끌 수 있게 되었다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진 속 탈것은 증기의 힘으로 달리는 기관차예요. 이런 탈것과 기계가 퍼지면서 공장은 물건을 한꺼번에 많이 만들고, 그 물건과 사람을 <b>멀리까지 빠르게 실어 나를</b> 수 있게 되었죠.<span class='xh'>오답 하나씩 격파</span>나머지 넷은 모두 <b>실제로 일어난 변화가 맞지만</b>, 이 기기가 만든 변화는 아니에요 · '실시간 연락'은 인터넷과 인공위성, '감염병 사망 감소'는 백신과 항생제, '작은 생물 관찰'은 현미경, '집 밖에서 기계 켜기'는 사물 인터넷의 몫이죠. 이렇게 <b>참인 사실을 엉뚱한 기기에 붙여 놓는 것</b>이 이 유형의 단골 함정이에요. 보기 하나하나를 '이건 무엇이 바꾼 일이지?' 하고 되물으면 걸러낼 수 있답니다.",
    core: "참인 사실도 짝이 틀리면 오답! '이건 무엇이 바꾼 일?'로 되물어요.",
  },
  {
    id: "u1e275",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt: "다음은 어떤 발명이 인류의 생활에 미친 영향을 정리한 것이에요. 이런 변화를 이끈 발명으로 알맞은 것은?",
    figure: dbox([
      ["영향 1", "공장에서 사람의 손 대신 기계가 물건을 한꺼번에 많이 만들게 되었습니다."],
      ["영향 2", "사람과 물건이 예전보다 훨씬 멀리까지, 빠르게 오갈 수 있게 되었습니다."],
      ["영향 3", "일자리를 찾아 공장이 있는 도시로 사람들이 모여들었습니다."],
    ]),
    options: ["증기 기관", "현미경", "백신", "인공위성", "항생제"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>공장의 기계를 돌려 물건을 한꺼번에 만들고, 그 물건과 사람을 멀리까지 실어 나른 힘의 원천은 <b>증기 기관</b>이에요. 증기의 힘으로 기계와 탈것을 움직이면서 공장과 도시의 모습까지 바뀌었죠.<span class='xh'>오답 하나씩 격파</span>'현미경'은 맨눈에 보이지 않던 작은 세계를 열어 준 기기라 공장의 생산과는 이어지지 않아요. '백신'과 '항생제'는 감염병을 막고 치료해 사람들의 수명을 늘린 쪽이고요 · 둘 다 중요한 발견이지만 물건을 만들고 실어 나르는 일과는 다른 갈래죠. '인공위성'은 지구 반대편과 소식을 주고받게 해 준 훨씬 뒤의 기술이에요. 이런 문제는 <b>영향 문장에서 무엇이 움직였는지</b>를 찾는 것이 요령이에요 · 기계와 탈것이 함께 나오면 증기의 힘을 떠올리세요.",
    core: "기계를 돌리고 탈것을 움직인 힘 = 증기 기관. 영향에서 원인을 되짚어요!",
  },
  {
    id: "u1e279",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt: "연표는 과학의 발전이 인류의 생활을 바꾼 순간들을 시간 순서로 정리한 것이에요. <b>㉢</b> 자리에 들어갈 일로 알맞은 것은?",
    figure: timelineFig({
      events: [
        { era: "17세기", label: "작은 세계를 여는 기기" },
        { era: "18~19세기", label: "증기로 달리는 기계" },
        { era: "20세기", label: "" },
        { era: "오늘날", label: "지구를 잇는 통신" },
      ],
      hide: [2],
    }),
    options: [
      "백신과 항생제가 개발되어 감염병과 싸울 수 있게 된 일",
      "렌즈를 겹쳐 만든 기기로 코르크를 관찰한 일",
      "증기의 힘으로 공장의 기계를 돌리기 시작한 일",
      "돌을 갈아 도구를 만들어 쓰기 시작한 일",
      "손안의 작은 기계로 지구 반대편 사람과 얼굴을 보며 이야기하게 된 일",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>㉢은 <b>20세기</b> 자리예요. 이 무렵 백신과 항생제가 개발되면서 수많은 목숨을 앗아가던 감염병과 싸워 이길 수 있게 되었고, 그 덕분에 사람들의 평균 수명이 크게 늘었죠.<span class='xh'>오답 하나씩 격파</span>'렌즈로 코르크를 관찰한 일'은 연표 맨 앞 17세기 칸에 이미 자리 잡고 있어요. '증기의 힘으로 공장 기계를 돌린 일'도 18~19세기의 일이라 20세기 빈칸에는 올 수 없고요 · <b>연표에 이미 그려진 칸의 내용은 빈칸의 답이 될 수 없습니다</b>. '돌을 갈아 도구를 만든 일'은 연표가 다루는 시기보다 훨씬 앞선 아주 먼 옛날이에요. '손안의 기계로 얼굴을 보며 이야기한 일'은 맨 오른쪽 오늘날 칸의 내용이죠. 연표 빈칸 문제는 <b>양옆 칸의 시기와 내용</b>을 먼저 확인하면 후보가 순식간에 줄어든답니다.",
    core: "연표 빈칸은 양옆 칸부터! 이미 그려진 내용은 답이 될 수 없어요.",
  },
  {
    id: "u1e283",
    lessonId: L3,
    type: "mcq",
    diff: 1,
    prompt: "사진 속 탈것을 움직이게 한 <b>과학 원리</b>로 옳은 것은?",
    figure: ximg("steam-locomotive.webp", "굴뚝에서 흰 연기를 내뿜으며 철길 위에 서 있는 검은 탈것의 사진"),
    options: [
      "물이 끓을 때 생기는 증기가 밀어내는 힘",
      "빛이 물이나 유리를 지날 때 꺾이는 성질",
      "물체가 물에 잠기면 위로 떠오르려는 성질",
      "소리가 공기를 타고 퍼져 나가는 성질",
      "자석이 쇠붙이를 끌어당기는 성질",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진 속 탈것은 물을 끓여 만든 <b>증기가 밀어내는 힘</b>으로 바퀴를 돌려요. 굴뚝에서 뿜어져 나오는 흰 김이 바로 그 증기죠. 이 원리를 이용한 기계가 공장과 탈것에 쓰이면서 세상이 크게 바뀌었답니다.<span class='xh'>오답 하나씩 격파</span>'빛이 꺾이는 성질'은 렌즈와 현미경을 만든 원리예요. '물에 떠오르려는 성질'은 배가 물에 뜨는 것과 관련이 있지만 철길 위를 달리는 기관차와는 상관이 없죠. '소리가 퍼지는 성질'은 전화와 스피커 쪽 이야기이고, '자석이 쇠붙이를 끌어당기는 성질'은 전기와 자석을 쓰는 기계의 원리예요. 기기의 원리를 묻는 문제는 <b>그 기기가 실제로 무엇을 뿜고 무엇을 돌리는지</b>를 사진에서 찾아보면 답이 보인답니다.",
    core: "굴뚝의 흰 김 = 증기. 증기가 미는 힘으로 바퀴가 돌아요!",
  },
  {
    id: "u1e287",
    lessonId: L3,
    type: "mcq",
    diff: 3,
    prompt: "표는 과학의 발전으로 나타난 것들을 정리한 자료예요. 이 표 <b>만으로는 알 수 없는</b> 것은?",
    figure: svgTable(
      ["이름", "나온 때", "바뀐 모습"],
      [
        ["현미경", "17세기", "작은 세계 관찰"],
        ["백신", "20세기", "감염병 예방"],
        ["항생제", "20세기", "병을 치료함"],
        ["인터넷", "오늘날", "실시간 연락"],
      ],
      { firstColHead: true },
    ),
    options: [
      "네 가지 가운데 가장 먼저 나온 것이 무엇인지",
      "백신이 사람들에게 어떤 도움을 주었는지",
      "인터넷이 나온 뒤 소식을 주고받는 방식이 어떻게 달라졌는지",
      "백신과 항생제 가운데 어느 것이 더 먼저 나왔는지",
      "현미경이 사람들에게 어떤 세계를 열어 주었는지",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>백신과 항생제는 '나온 때' 칸이 <b>둘 다 20세기</b>로만 적혀 있어요. 같은 세기 안에서 어느 쪽이 먼저인지는 이 표에 담겨 있지 않으니, 표만 보고는 알 수 없답니다.<span class='xh'>오답 하나씩 격파</span>'가장 먼저 나온 것'은 17세기라고 적힌 현미경이라 표에서 바로 읽을 수 있어요. '백신이 준 도움'은 감염병 예방, '인터넷이 바꾼 방식'은 실시간 연락, '현미경이 연 세계'는 작은 세계 관찰이라고 마지막 열에 그대로 적혀 있고요. 자료 해석에서 가장 중요한 감각은 <b>자료가 말해 주는 것과 말해 주지 않는 것을 가르는 눈</b>이에요 · 같은 칸에 묶인 두 항목의 앞뒤 순서처럼, 더 자세한 자료가 있어야만 답할 수 있는 물음이 있다는 걸 기억하세요.",
    core: "같은 세기끼리는 순서를 못 가려요. 자료 밖 물음을 알아채는 눈!",
  },
  {
    id: "u1e291",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt:
      "그림은 과학이 문명을 바꾸는 흐름을 네 칸으로 나타낸 것인데, 두 칸이 서로 자리를 바꿔 놓여 있어요. <b>원리 → 기술 → 기기 → 문명의 변화</b> 순서에 맞게 고치려면 어느 두 칸을 서로 바꿔야 할까요?",
    figure: chainFig({ cells: ["증기의 힘", "증기 기관차", "증기 기관 기술", "산업 혁명"] }),
    options: ["첫째와 둘째", "첫째와 셋째", "둘째와 셋째", "셋째와 넷째", "바꿀 필요가 없다"],
    answer: 2,
    shuffle: false,
    explain:
      "<span class='xh'>정답 풀이</span>흐름의 차례는 <b>자연의 원리 → 그 원리를 쓰는 기술 → 기술로 만든 기기 → 문명의 변화</b>예요. 그림에서 첫째 '증기의 힘'은 원리, 넷째 '산업 혁명'은 문명의 변화로 제자리에 있어요. 그런데 둘째에 기기인 '증기 기관차'가, 셋째에 기술인 '증기 기관 기술'이 놓여 있죠 · <b>둘째와 셋째를 서로 바꾸면</b> 차례가 맞습니다.<span class='xh'>오답 하나씩 격파</span>'첫째와 둘째'를 바꾸면 기기가 맨 앞에 와서 원리보다 기기가 먼저 생긴 셈이 돼요. '첫째와 셋째'도 마찬가지로 원리가 뒤로 밀리고요. '셋째와 넷째'를 바꾸면 문명의 변화가 기기보다 앞서게 되죠. '바꿀 필요가 없다'는 가운데 두 칸이 뒤집힌 것을 못 본 답이에요. 이런 문제는 <b>각 칸이 원리·기술·기기·변화 중 무엇인지 먼저 이름표를 붙여 보면</b> 어긋난 자리가 바로 드러난답니다.",
    core: "원리 → 기술 → 기기 → 변화. 칸마다 이름표를 붙여 보면 보여요!",
  },
  {
    id: "u1e296",
    lessonId: L3,
    type: "mcq",
    diff: 2,
    prompt: "연표는 과학이 사람들의 생활을 바꾼 순간들을 모은 것이에요. 이 연표를 보고 알 수 있는 것으로 가장 알맞은 것은?",
    figure: timelineFig({
      events: [
        { era: "17세기", label: "작은 세계 관찰" },
        { era: "18~19세기", label: "공장을 돌린 기계" },
        { era: "20세기", label: "사진과 영상 예술" },
        { era: "오늘날", label: "실시간 통신" },
      ],
    }),
    options: [
      "과학이 새로운 기기를 낳아 생활을 바꾸는 일이 여러 시대에 걸쳐 되풀이되었다",
      "네 가지 변화는 모두 같은 시기에 한꺼번에 일어났다",
      "20세기 이전에는 사람들의 생활이 거의 바뀌지 않았다",
      "가장 나중에 일어난 변화는 증기로 달리는 기계의 등장이다",
      "연표에 실린 변화들은 서로 아무 관련이 없는 사건들이다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>연표를 왼쪽에서 오른쪽으로 따라가면 17세기·18~19세기·20세기·오늘날마다 새로운 기기와 그에 따른 생활의 변화가 하나씩 놓여 있어요. 즉 과학의 발전이 생활을 바꾸는 일이 <b>한 시대에 그치지 않고 되풀이되어 왔다</b>는 것을 읽을 수 있죠.<span class='xh'>오답 하나씩 격파</span>'같은 시기에 한꺼번에'는 네 카드가 서로 다른 시대에 놓인 것과 어긋나요. '20세기 이전에는 거의 안 바뀌었다'는 17세기와 18~19세기 칸이 통째로 무시된 답이고요. '가장 나중이 증기로 달리는 기계'는 시간 축의 오른쪽 끝이 오늘날이라는 점과 맞지 않아요 · 연표에서 <b>오른쪽으로 갈수록 나중</b>이라는 약속을 확인하세요. '서로 아무 관련이 없다'는 네 사건이 모두 '과학의 발전 → 생활의 변화'라는 같은 흐름을 보여 준다는 점을 놓친 말이랍니다.",
    core: "연표는 오른쪽이 나중! 되풀이되는 흐름을 읽는 것이 연표 읽기예요.",
  },

  // ══════════ L4 첨단 과학기술 ══════════
  {
    id: "u1e297",
    lessonId: L4,
    type: "mcq",
    diff: 1,
    prompt: "다음은 어떤 첨단 과학기술의 특징을 정리한 것이에요. 이 기술의 이름으로 옳은 것은?",
    figure: dbox([
      ["특징 1", "컴퓨터가 아주 많은 자료를 스스로 익혀 그 속의 규칙을 찾아냅니다."],
      ["특징 2", "익힌 것을 바탕으로 새로운 글이나 그림을 만들어 내기도 합니다."],
      ["쓰임", "길 안내, 사진 정리처럼 사람의 판단이 필요하던 일에 쓰입니다."],
    ]),
    options: ["인공지능", "증강 현실", "첨단 바이오", "사물 인터넷", "증기 기관"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>'많은 자료를 <b>스스로 익혀</b> 규칙을 찾아낸다'는 것이 결정적인 단서예요. 컴퓨터가 사람처럼 배우고 판단해 일을 처리하게 만드는 기술, 곧 <b>인공지능</b>이랍니다.<span class='xh'>오답 하나씩 격파</span>'증강 현실'은 실제로 보이는 모습 위에 가상의 이미지를 겹쳐 주는 기술이라 '익힌다'는 설명과 맞지 않아요. '첨단 바이오'는 생물의 유전정보를 다루는 기술이고, '사물 인터넷'은 여러 사물을 무선 통신으로 잇는 기술이라 각각 핵심 낱말이 다르죠. '증기 기관'은 첨단 기술이 아니라 산업 혁명 시기의 기계고요. 이런 문제는 <b>각 기술의 핵심 낱말</b>(익힘 · 겹침 · 유전정보 · 연결)을 하나씩 붙잡아 두면 설명만 보고도 이름을 되찾을 수 있어요.",
    core: "익힘 = 인공지능 · 겹침 = 증강 현실 · 유전정보 = 바이오 · 연결 = 사물 인터넷!",
  },
  {
    id: "u1e299",
    lessonId: L4,
    type: "mcq",
    diff: 2,
    prompt: "사진에서 실제 방은 비어 있는데 화면 속 방에는 가구가 놓여 있어요. 이런 장면을 만드는 데 쓰인 기술은?",
    figure: ximg(
      "ar-tablet.webp",
      "가구가 없는 빈 방 가운데 받침대에 놓인 태블릿이 있고, 화면 속에는 같은 방에 소파와 스탠드가 놓인 모습이 보이는 사진",
    ),
    options: ["증강 현실", "인공지능", "첨단 바이오", "사물 인터넷", "현미경 기술"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>실제로 찍은 방의 모습 위에 <b>가상의 가구 이미지를 겹쳐</b> 하나의 화면으로 보여 주고 있어요. 이렇게 실제 영상에 가상 이미지를 포개는 기술이 <b>증강 현실</b>이랍니다. 물건을 사기 전에 우리 집에 놓아 보는 데 쓰이죠.<span class='xh'>오답 하나씩 격파</span>'인공지능'은 컴퓨터가 자료를 익혀 판단하는 기술이라, 화면에 이미지를 겹치는 일과는 다른 몫이에요. '첨단 바이오'는 생물의 유전정보를 다루고, '사물 인터넷'은 사물끼리 무선으로 잇는 기술이라 이 장면과 연결되지 않죠. '현미경 기술'은 작은 것을 확대해 보는 것이라 아예 다른 갈래고요. 이 장면의 결정적 단서는 <b>실제 방과 화면 속 방의 차이</b>예요 · 화면에만 있는 것이 곧 가상 이미지랍니다.",
    core: "실제 영상 + 가상 이미지 = 증강 현실. 화면에만 있는 것이 단서!",
  },
  {
    id: "u1e302",
    lessonId: L4,
    type: "mcq",
    diff: 2,
    prompt: "사진은 스마트폰 화면의 단추로 집 안 가전을 켜고 끄는 모습이에요. 여기에 쓰인 기술과 그 특징을 옳게 짝 지은 것은?",
    figure: ximg(
      "smart-home.webp",
      "탁자 위 스마트폰 화면에 조작 단추가 여러 개 나란히 있고, 뒤쪽에 에어컨과 선풍기가 흐릿하게 보이는 사진",
    ),
    options: [
      "사물 인터넷 · 여러 사물이 무선 통신으로 이어져 정보를 주고받는다",
      "증강 현실 · 실제 모습 위에 가상의 이미지를 겹쳐 보여 준다",
      "첨단 바이오 · 생물의 유전정보를 이용해 필요한 물질을 만든다",
      "인공지능 · 사람이 하나하나 정해 준 순서대로만 움직인다",
      "사물 인터넷 · 기기들이 서로 떨어진 채 각자 알아서만 움직인다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>스마트폰과 에어컨·선풍기가 <b>무선 통신으로 이어져</b> 명령과 상태를 주고받기 때문에 손안의 화면으로 가전을 켜고 끌 수 있어요. 이렇게 여러 사물을 통신으로 잇는 기술이 <b>사물 인터넷</b>이고, 그 핵심은 '연결'이랍니다.<span class='xh'>오답 하나씩 격파</span>'증강 현실'과 '첨단 바이오'는 기술 이름부터 이 장면과 맞지 않아요. '인공지능 · 정해 준 순서대로만 움직인다'는 <b>기술 이름도 틀리고 설명도 틀린</b> 보기예요 · 인공지능의 핵심은 스스로 익혀 판단하는 것이니까요. 가장 조심할 것은 '전기 자동차는 온실 기체와 관계가 없다'는 보기예요 · 기술 이름은 사물 인터넷으로 맞는데 '서로 떨어진 채 각자 알아서만'이라는 설명이 <b>연결이라는 핵심과 정반대</b>죠. 짝 짓기 문제는 이름과 설명을 <b>따로따로 검사</b>해야 이런 함정에 걸리지 않아요.",
    core: "이름과 설명을 따로 검사! 사물 인터넷의 핵심은 '연결'이에요.",
  },
  {
    id: "u1e304",
    lessonId: L4,
    type: "multi",
    diff: 1,
    prompt: "다음 중 <b>인공지능이 쓰인 사례</b>를 <b>모두</b> 고르세요.",
    options: [
      "사진 속 글자를 읽어 다른 나라 말로 바꿔 주는 프로그램",
      "지난 기록에서 규칙을 찾아 내일의 날씨를 예측하는 프로그램",
      "종이 지도를 펴 놓고 손가락으로 길을 짚어 보는 일",
      "내가 푼 문제를 살펴 다음에 풀 문제를 골라 주는 학습 프로그램",
      "달력에 오늘 날짜를 동그라미로 표시하는 일",
    ],
    answer: [0, 1, 3],
    explain:
      "<span class='xh'>정답 풀이</span>인공지능은 컴퓨터가 <b>많은 자료를 익혀 스스로 판단</b>하는 기술이에요. 글자를 읽고 다른 말로 바꾸는 일, 지난 기록에서 규칙을 찾아 날씨를 예측하는 일, 내가 푼 결과를 분석해 다음 문제를 고르는 일은 모두 컴퓨터가 익히고 판단해야 가능하죠.<span class='xh'>오답 하나씩 격파</span>'종이 지도를 손가락으로 짚는 일'과 '달력에 동그라미를 치는 일'은 사람이 직접 하는 일이라 컴퓨터의 판단이 끼어들 자리가 없어요 · 컴퓨터가 쓰이지 않는 활동은 첨단 기술 사례가 될 수 없답니다. 이 유형은 <b>'컴퓨터가 무엇을 스스로 판단했는가'</b>를 하나씩 물어보면 깔끔하게 갈립니다 · 사람이 손으로 하는 일과 컴퓨터가 익혀서 하는 일을 가르는 것이 핵심이에요.",
    core: "컴퓨터가 익히고 스스로 판단하면 인공지능. 손으로 하는 일은 아니에요!",
  },
  {
    id: "u1e308",
    lessonId: L4,
    type: "mcq",
    diff: 2,
    prompt: "두 학생이 첨단 과학기술에 대해 이야기하고 있어요. 두 사람의 말에 대한 판단으로 가장 알맞은 것은?",
    figure: debateFig({
      a: { name: "유진", claim: "인공지능이 사람 대신 일을 해 주니, 사람이 할 일이 줄어들까 걱정이야." },
      b: { name: "시우", claim: "새로 생겨나는 일자리도 있으니까, 걱정은 하지 않아도 된다고 생각해." },
    }),
    options: [
      "두 사람의 말에는 각각 근거가 있으므로, 좋은 점과 걱정되는 점을 함께 살펴야 한다",
      "유진의 말이 옳으므로 첨단 기술은 더 이상 개발하지 말아야 한다",
      "시우의 말이 옳으므로 기술이 가져올 변화는 살펴볼 필요가 없다",
      "두 사람 모두 틀렸으므로 기술과 사회의 변화는 서로 관계가 없다",
      "기술이 더 발전하면 이런 문제는 스스로 사라지므로 지금 논의할 것이 없다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>첨단 기술은 삶을 편리하게 해 주지만, 사람이 하던 일을 기계가 대신하면서 생기는 <b>일자리 문제</b>처럼 새로운 걱정거리도 함께 가져와요. 그래서 두 사람의 말은 각각 한쪽 면을 짚은 것이고, 옳은 태도는 <b>좋은 점과 걱정되는 점을 함께 살피는 것</b>이랍니다.<span class='xh'>오답 하나씩 격파</span>'더 이상 개발하지 말아야 한다'는 걱정 하나 때문에 기술이 주는 이로움까지 통째로 버리는 결론이에요. '살펴볼 필요가 없다'는 반대로 걱정거리를 아예 못 본 척하는 태도고요. '기술과 사회는 관계가 없다'는 두 사람 모두 실제로 일어나는 변화를 이야기하고 있다는 점과 어긋나죠. '더 발전하면 스스로 사라진다'는 문제를 남에게 미루는 말이에요 · 기술이 어느 방향으로 쓰일지는 <b>사람들이 미리 살피고 정하는 몫</b>이랍니다.",
    core: "기술은 두 얼굴! 좋은 점과 걱정거리를 함께 보는 것이 옳은 태도예요.",
  },
  {
    id: "u1e316",
    lessonId: L4,
    type: "mcq",
    diff: 2,
    prompt: "다음은 어떤 첨단 과학기술의 특징을 정리한 것이에요. 이 기술의 이름으로 옳은 것은?",
    figure: dbox([
      ["특징 1", "생물이 지닌 유전정보를 읽어 내고 분석합니다."],
      ["특징 2", "분석한 정보를 이용해 필요한 물질을 만들거나 병을 미리 살핍니다."],
      ["쓰임", "사람마다 다른 특성에 맞춘 치료 방법을 찾는 데 쓰입니다."],
    ]),
    options: ["첨단 바이오", "인공지능", "증강 현실", "사물 인터넷", "정보 통신"],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>'생물이 지닌 <b>유전정보</b>를 읽고 분석한다'는 대목이 결정적이에요. 유전정보를 다뤄 필요한 물질을 만들거나 병을 미리 살피는 기술이 <b>첨단 바이오</b>랍니다. 사람마다 다른 특성에 맞춘 치료를 찾는 것도 이 기술의 쓰임이죠.<span class='xh'>오답 하나씩 격파</span>'인공지능'은 자료를 익혀 판단하는 기술이라 유전정보라는 재료와는 결이 달라요 · 물론 유전정보를 분석할 때 인공지능을 함께 쓰기도 하지만, 이 설명의 중심은 어디까지나 생물의 정보랍니다. '증강 현실'은 화면에 가상 이미지를 겹치는 기술, '사물 인터넷'은 사물을 잇는 기술, '정보 통신'은 소식을 주고받는 기술이라 모두 이 특징과 맞지 않아요. 설명 카드 문제는 <b>가장 앞줄에 나온 재료가 무엇인지</b>부터 보세요.",
    core: "재료가 유전정보면 첨단 바이오! 설명 카드는 첫 줄의 재료가 단서.",
  },
  {
    id: "u1e320",
    lessonId: L4,
    type: "mcq",
    diff: 2,
    prompt: "첨단 기술을 쓸 때 <b>내 정보를 지키는 행동</b>으로 가장 알맞은 것은?",
    options: [
      "이름이나 연락처를 넣으라고 할 때, 꼭 필요한 곳인지 먼저 확인한다",
      "친한 친구가 부탁하면 내 계정의 비밀번호를 알려 준다",
      "재미있어 보이는 프로그램이면 어떤 정보를 요구하든 그대로 허락한다",
      "다른 사람이 올린 사진을 내려받아 내 이름으로 다시 올린다",
      "인공지능이 만들어 준 글은 어디서 온 내용인지 확인하지 않고 그대로 쓴다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>개인정보는 한번 빠져나가면 되돌리기 어려워요. 그래서 이름·연락처처럼 나를 알아볼 수 있는 정보를 넣기 전에 <b>정말 필요한 곳인지 먼저 확인하는 습관</b>이 가장 기본이 되는 행동이랍니다.<span class='xh'>오답 하나씩 격파</span>'친한 친구에게 비밀번호를 알려 준다'는 아무리 가까운 사이라도 위험해요 · 비밀번호는 나만 알고 있어야 계정이 지켜지니까요. '어떤 정보를 요구하든 허락한다'는 재미와 내 정보를 맞바꾸는 셈이고요. '다른 사람의 사진을 내 이름으로 올린다'는 남의 정보와 권리를 함부로 쓰는 일이라 더 큰 문제예요. '인공지능이 만든 글을 확인 없이 쓴다'는 잘못된 내용을 그대로 퍼뜨릴 수 있죠 · 첨단 기술을 다룰 때는 내 정보를 지키는 것만큼 <b>남의 정보를 존중하고 출처를 확인하는 태도</b>도 함께 필요하답니다.",
    core: "정보를 넣기 전에 '꼭 필요한 곳일까?' 한 번 더! 비밀번호는 나만.",
  },
  {
    id: "u1e328",
    lessonId: L4,
    type: "mcq",
    diff: 3,
    prompt: "첨단 과학기술에 대한 설명으로 <b>옳지 않은</b> 것은?",
    options: [
      "인공지능은 많은 자료를 익혀 그 속의 규칙을 스스로 찾아낸다",
      "사물 인터넷은 여러 사물을 무선 통신으로 이어 정보를 주고받게 한다",
      "첨단 기술이 퍼지면 편리해지는 만큼 새로운 걱정거리도 함께 생긴다",
      "증강 현실은 실제 모습을 지우고 가상으로 만든 세계를 보여 주는 기술이다",
      "기술을 어떤 방향으로 쓸지는 결국 그것을 쓰는 사람의 선택에 달려 있다",
    ],
    answer: 3,
    explain:
      "<span class='xh'>정답 풀이</span>증강 현실은 실제 모습을 <b>지우는</b> 기술이 아니라, 실제로 보이는 영상 <b>위에 가상의 이미지를 겹쳐</b> 하나의 화면으로 만드는 기술이에요. 실제와 가상이 함께 보이는 것이 이 기술의 핵심이니, '실제를 지우고 가상으로 만든 세계를 보여 준다'는 설명은 옳지 않습니다.<span class='xh'>오답 하나씩 격파</span>'인공지능이 자료를 익혀 규칙을 찾는다'와 '사물 인터넷이 사물을 무선으로 잇는다'는 각 기술의 핵심을 그대로 옮긴 옳은 설명이에요. '편리함과 함께 걱정거리도 생긴다'는 일자리·개인정보 문제에서 실제로 확인되는 사실이고요. '어떤 방향으로 쓸지는 사람의 선택'이라는 말도 옳아요 · 같은 기술도 쓰는 사람에 따라 도움이 되기도, 해가 되기도 하니까요. 옳지 않은 것을 고르는 문제는 <b>보기 하나하나에 참·거짓 표시를 해 가며</b> 읽는 것이 안전하답니다.",
    core: "증강 현실 = 실제 위에 가상을 '겹침'. 실제를 지우는 게 아니에요!",
  },

  // ══════════ L5 지속가능한 삶 ══════════
  {
    id: "u1e329",
    lessonId: L5,
    type: "mcq",
    diff: 1,
    prompt: "사진은 햇빛을 받아 전기를 만드는 시설이에요. 이런 시설을 늘릴 때 <b>덜어 낼 수 있는 문제</b>로 가장 알맞은 것은?",
    figure: ximg("solar-farm.webp", "짙은 파란색 판이 들판에 여러 줄로 비스듬히 놓여 있는 사진"),
    options: [
      "석유와 석탄을 태워 쓰면서 생기는 온실 기체와 오염 물질",
      "쓰레기가 바다로 흘러들어 생기는 해양 오염",
      "너무 많은 사람이 한 도시에 모여 사는 문제",
      "밤에 도시의 불빛이 너무 밝아지는 문제",
      "물건을 오래 쓰지 않고 자주 바꾸는 습관",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>사진 속 시설은 <b>햇빛으로 전기를 만드는 태양광</b> 시설이에요. 지금까지 전기를 얻으려면 석유와 석탄 같은 지하자원을 태워야 했고, 그때마다 온실 기체와 오염 물질이 나왔죠. 햇빛으로 전기를 만들면 그만큼 태우는 양을 줄일 수 있답니다.<span class='xh'>오답 하나씩 격파</span>'해양 오염'은 쓰레기를 줄이고 거두어들이는 일로 다뤄야 할 문제라 전기를 만드는 방식과는 이어지지 않아요. '한 도시에 모여 사는 문제'와 '밤의 불빛'은 애초에 전기를 어떻게 만드느냐와 다른 갈래의 이야기고요. '물건을 자주 바꾸는 습관'은 줄이기·재사용으로 풀 문제죠. 지속가능한 기술 문제는 <b>그 기술이 무엇을 대신하는지</b>를 짚는 것이 요령이에요 · 태양광은 '태우는 일'을 대신한답니다.",
    core: "태양광은 '태우는 일'을 대신해요. 무엇을 대신하는지가 핵심!",
  },
  {
    id: "u1e331",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "다음은 어느 마을 신문에 실린 글이에요. 이 글을 읽고 판단한 것으로 가장 알맞은 것은?",
    figure: dbox([
      ["글", "우리 마을은 지난해부터 학교 지붕에 햇빛으로 전기를 만드는 판을 달았습니다. 그 덕분에 학교에서 쓰는 전기의 일부를 스스로 마련하게 되었습니다."],
      ["덧붙임", "다만 흐린 날과 밤에는 전기를 거의 만들지 못해, 아직은 마을 발전소에서 오는 전기도 함께 쓰고 있습니다."],
    ]),
    options: [
      "햇빛으로 만든 전기는 도움이 되지만, 날씨와 시간에 따라 만드는 양이 달라진다",
      "햇빛으로 만든 전기만으로 학교의 모든 전기를 채울 수 있게 되었다",
      "흐린 날에도 전기를 똑같이 만들 수 있어 발전소가 필요 없어졌다",
      "햇빛으로 전기를 만드는 일은 도움이 되지 않으므로 그만두어야 한다",
      "학교에서 쓰는 전기의 양이 지난해보다 늘어났다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>글은 두 가지를 함께 말하고 있어요. 하나는 학교가 전기의 <b>일부</b>를 스스로 마련하게 되었다는 좋은 소식이고, 다른 하나는 흐린 날과 밤에는 거의 만들지 못한다는 <b>한계</b>죠. 두 대목을 모두 반영한 판단이 가장 알맞습니다.<span class='xh'>오답 하나씩 격파</span>'모든 전기를 채울 수 있다'는 글의 '일부'라는 말과 어긋나요. '흐린 날에도 똑같이 만든다'는 덧붙임 문장과 정반대고요. '도움이 되지 않으므로 그만두어야 한다'는 한계 하나만 보고 좋은 점을 통째로 지운 판단이에요 · <b>한계가 있다는 말과 쓸모없다는 말은 전혀 다릅니다</b>. '전기 사용량이 늘었다'는 글에 나오지도 않은 내용이죠. 글을 읽고 판단하는 문제는 <b>좋은 점과 한계를 모두 담은 보기</b>가 정답일 때가 많답니다.",
    core: "글에 좋은 점과 한계가 함께 있으면, 답도 둘을 함께 담아야 해요!",
  },
  {
    id: "u1e334",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "그래프는 어느 학교에서 한 달 동안 모은 재활용품의 양을 종류별로 나타낸 것이에요. 이 그래프에서 알 수 있는 것으로 옳은 것은?",
    figure: resultBarFig({
      bars: [
        { label: "종이", value: 24 },
        { label: "플라스틱", value: 36 },
        { label: "캔", value: 12 },
        { label: "유리병", value: 8 },
      ],
      yMax: 40,
      yStep: 4,
      yLabel: "모은 양(kg)",
    }),
    options: [
      "가장 많이 모인 것은 플라스틱이고, 유리병의 세 배가 넘는다",
      "가장 많이 모인 것은 종이이고, 플라스틱이 그다음이다",
      "네 가지가 거의 비슷한 양으로 모였다",
      "캔은 유리병보다 적게 모였다",
      "종이는 플라스틱보다 많이 모였다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>막대 높이를 눈금에서 읽으면 종이 24 kg, 플라스틱 36 kg, 캔 12 kg, 유리병 8 kg이에요. 가장 높은 막대는 <b>플라스틱</b>이고, 유리병 8 kg의 세 배는 24 kg이니 36 kg은 그보다 크죠 · '세 배가 넘는다'는 설명이 맞습니다.<span class='xh'>오답 하나씩 격파</span>'가장 많은 것이 종이'는 두 번째로 높은 막대를 첫째로 잘못 읽은 것이고, '종이가 플라스틱보다 많다'도 같은 착각이에요. '네 가지가 거의 비슷하다'기엔 36 kg과 8 kg의 차이가 아주 크죠. '캔이 유리병보다 적다'는 12 kg과 8 kg을 뒤집어 읽은 답이고요. 막대그래프에서 크기를 견줄 때는 <b>눈금에서 값을 읽어 적어 두고</b> 비교하세요 · 눈으로만 훑으면 비슷한 높이의 막대에서 실수하기 쉽답니다.",
    core: "막대는 눈금에서 값을 읽어 적어 두고 비교! 몇 배인지도 확인해요.",
  },
  {
    id: "u1e336",
    lessonId: L5,
    type: "multi",
    diff: 1,
    prompt: "다음 중 자원과 에너지를 <b>'줄이기'</b>에 해당하는 실천을 <b>모두</b> 고르세요.",
    options: [
      "겨울에 난방 온도를 조금 낮추고 옷을 한 겹 더 입기",
      "양치하는 동안 수도꼭지를 잠가 두기",
      "다 쓴 유리병을 색깔별로 나누어 내놓기",
      "쓰지 않는 방의 전등을 바로 끄기",
      "동생에게 작아진 자전거를 물려주기",
    ],
    answer: [0, 1, 3],
    explain:
      "<span class='xh'>정답 풀이</span>'줄이기'는 에너지나 자원을 <b>쓰는 양 자체를 적게 하는</b> 실천이에요. 난방 온도를 낮추는 것, 양치하는 동안 물을 잠그는 것, 쓰지 않는 전등을 끄는 것은 모두 쓰는 양을 줄이는 행동이죠.<span class='xh'>오답 하나씩 격파</span>'유리병을 색깔별로 나누어 내놓기'는 버려진 것을 자원으로 되살리는 <b>재활용</b>이에요 · 이미 쓴 물건을 다루는 일이라 쓰는 양을 줄이는 것과는 다르죠. '자전거를 물려주기'는 아직 쓸 수 있는 물건을 다시 쓰는 <b>재사용</b>이고요. 네 가지 실천은 모두 소중하지만 <b>어느 단계에서 일어나는지</b>가 달라요 · 쓰기 전에 줄이고, 쓴 뒤에 다시 쓰고, 더 못 쓰게 되면 자원으로 되살린다고 순서를 잡아 두면 헷갈리지 않는답니다.",
    core: "쓰기 전에 줄이고 · 쓴 뒤 다시 쓰고 · 못 쓰면 되살리기. 단계가 달라요!",
  },
  {
    id: "u1e340",
    lessonId: L5,
    type: "mcq",
    diff: 3,
    prompt: "다음은 어느 학교의 급식 잔반 문제를 두고 나온 세 가지 의견이에요. 자료를 바탕으로 한 판단으로 가장 알맞은 것은?",
    figure: dbox([
      ["조사 결과", "지난달 잔반의 절반 이상이 '먹지 않는 반찬을 미리 받았다가 그대로 버린 것'이었습니다."],
      ["의견 ㉠", "잔반을 처리하는 기계를 새로 들여놓자."],
      ["의견 ㉡", "받기 전에 먹을 만큼만 담을 수 있게 하자."],
      ["의견 ㉢", "급식 시간을 늘려 천천히 먹게 하자."],
    ]),
    options: [
      "㉡이 가장 알맞다. 조사 결과가 가리키는 원인을 바로 줄이는 방법이기 때문이다",
      "㉠이 가장 알맞다. 잔반을 처리하면 문제가 사라지기 때문이다",
      "㉢이 가장 알맞다. 시간이 부족한 것이 잔반의 원인이기 때문이다",
      "세 의견 모두 조사 결과와 관계가 없으므로 새 조사가 필요하다",
      "잔반은 어쩔 수 없는 것이므로 어떤 의견도 도움이 되지 않는다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>조사 결과가 짚은 원인은 <b>먹지 않을 반찬을 미리 받은 것</b>이에요. ㉡은 받는 단계에서 양을 조절하게 하니 그 원인을 곧바로 줄이는 방법이죠. 자료를 근거로 결정할 때는 <b>드러난 원인을 직접 겨냥하는 방법</b>이 가장 알맞답니다.<span class='xh'>오답 하나씩 격파</span>㉠은 이미 생긴 잔반을 처리할 뿐, 잔반이 생기는 것 자체는 그대로예요 · 문제를 뒤에서 수습하는 방법이라 원인 해결과는 다릅니다. ㉢은 시간이 부족해서 남긴 것이라면 도움이 되겠지만, 조사 결과는 '미리 받았다가 그대로 버렸다'고 말하고 있어 근거가 맞지 않아요. '세 의견 모두 관계없다'는 ㉡이 원인과 정확히 이어져 있는 것을 못 본 답이고, '어쩔 수 없다'는 조사까지 해 놓고 아무것도 하지 않겠다는 태도라 알맞지 않죠.",
    core: "자료로 결정할 땐 드러난 원인을 곧바로 겨냥하는 방법을 골라요!",
  },
  {
    id: "u1e344",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "그래프는 어느 도시가 한 해 동안 쓴 전기를 만든 방식별로 나타낸 것이에요. 이 도시가 <b>온실 기체를 더 줄이려고 할 때</b> 늘려야 할 쪽으로 알맞은 것은?",
    figure: resultBarFig({
      bars: [
        { label: "석탄", value: 45 },
        { label: "천연가스", value: 30 },
        { label: "햇빛", value: 15 },
        { label: "바람", value: 10 },
      ],
      yMax: 50,
      yStep: 5,
      yLabel: "만든 전기의 비율(%)",
    }),
    options: [
      "태우는 두 방식이 전체의 4분의 3이나 되므로, 햇빛과 바람으로 만드는 전기를 늘려야 한다",
      "햇빛과 바람이 이미 전체의 절반을 넘으므로, 지금 방식을 그대로 두어도 된다",
      "석탄이 천연가스보다 적으므로, 석탄으로 만드는 전기를 늘리는 편이 낫다",
      "네 가지 방식의 비율이 거의 같으므로, 어느 쪽을 늘려도 효과는 비슷하다",
      "바람이 가장 적으므로, 바람으로 만드는 전기부터 줄여야 한다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>막대를 읽으면 석탄 45 %와 천연가스 30 %를 더해 <b>75 %, 곧 전체의 4분의 3</b>을 태워서 얻고 있어요. 태우는 과정에서 온실 기체가 나오니, 줄이려면 태우지 않는 <b>햇빛(15 %)과 바람(10 %)</b> 쪽을 늘려야 하죠.<span class='xh'>오답 하나씩 격파</span>'햇빛과 바람이 절반을 넘는다'는 두 막대를 더해도 25 %뿐이라 자료와 어긋나요. '석탄이 천연가스보다 적다'도 45 %와 30 %를 뒤집어 읽은 것이고요. '네 비율이 거의 같다'기엔 45 %와 10 %의 차이가 아주 큽니다. '바람이 가장 적으니 줄이자'는 값은 맞게 읽었지만 <b>줄여야 할 쪽을 정반대로</b> 고른 결론이에요 · 자료를 바르게 읽는 것과, 그 자료로 옳은 결정을 내리는 것은 다른 단계랍니다.",
    core: "막대를 더해 보면 4분의 3! 바르게 읽는 것과 옳게 정하는 것은 다른 단계.",
  },
  {
    id: "u1e348",
    lessonId: L5,
    type: "mcq",
    diff: 3,
    prompt:
      "두 학생이 <b>같은 자료</b>를 보고 서로 다른 주장을 폈어요. 자료는 '전기 자동차는 달릴 때 배기가스를 내지 않지만, 충전에 쓰는 전기를 석탄으로 만들면 그만큼 온실 기체가 나온다'는 내용이에요. 두 주장에 대한 판단으로 가장 알맞은 것은?",
    figure: debateFig({
      a: { name: "다은", claim: "전기 자동차는 달릴 때 배기가스가 없으니 온실 기체를 줄이는 데 도움이 돼." },
      b: { name: "현우", claim: "충전할 전기를 어떻게 만드는지도 함께 따져야 진짜 효과를 알 수 있어." },
    }),
    options: [
      "두 사람 모두 자료에 있는 근거를 들었고, 특히 현우의 말은 효과를 판단할 때 빠뜨리기 쉬운 부분을 짚었다",
      "다은의 말에만 자료의 근거가 있고, 현우의 말은 자료에 없는 이야기다",
      "현우의 말만 옳고, 전기 자동차는 온실 기체를 줄이는 데 도움이 되지 않는다",
      "두 사람 모두 자료를 잘못 읽었으므로 어느 쪽 주장도 받아들일 수 없다",
      "자료가 좋은 점과 한계를 함께 담고 있으므로 이 자료로는 판단을 내리기 어렵다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>자료는 두 가지를 함께 말해요 · 달릴 때 배기가스가 없다는 점(다은의 근거)과, 충전용 전기를 만드는 방식에 따라 온실 기체가 나온다는 점(현우의 근거)이죠. 두 사람 모두 자료에 있는 근거를 들었고, 특히 현우는 <b>눈에 보이는 부분만 보면 놓치기 쉬운 뒷단계</b>까지 짚었습니다.<span class='xh'>오답 하나씩 격파</span>'현우의 말은 자료에 없다'는 뒷문장을 못 본 판단이에요. '도움이 되지 않는다'는 지나친 결론이죠 · 전기를 태우지 않는 방식으로 만들면 실제로 줄어드니까요. '두 사람 모두 잘못 읽었다'는 근거가 자료 안에 또렷이 있다는 점과 어긋나고, '판단을 내리기 어렵다'는 두 면을 함께 담은 자료일수록 <b>더 정확한 판단이 가능하다</b>는 점을 놓친 말이에요. 좋은 판단은 한 면만 보고 단정하지 않는 데서 시작한답니다.",
    core: "같은 자료에서 두 면을 함께 보기! 눈에 안 보이는 뒷단계까지 따져요.",
  },
  {
    id: "u1e359",
    lessonId: L5,
    type: "mcq",
    diff: 2,
    prompt: "다음은 어느 학생이 학교 신문에 낸 글의 일부예요. 이 글에서 글쓴이가 말하려는 것으로 가장 알맞은 것은?",
    figure: dbox([
      ["글", "버려지는 물건에 새로운 쓸모를 더하면 쓰레기가 줄고, 그 물건을 새로 만드는 데 드는 자원도 아낄 수 있습니다."],
      ["예시", "낡은 천막으로 만든 가방, 못 쓰게 된 소방 호스로 만든 지갑이 그런 예입니다."],
      ["끝맺음", "버리기 전에 '이걸로 무엇을 만들 수 있을까?' 한 번만 더 생각해 보면 좋겠습니다."],
    ]),
    options: [
      "버려질 물건에 새로운 쓸모를 더하면 쓰레기와 자원을 함께 아낄 수 있다",
      "물건을 자주 새로 사는 것이 경제에 도움이 된다",
      "쓰레기는 모아서 태우는 것이 가장 좋은 방법이다",
      "낡은 물건은 고쳐 쓰지 말고 바로 버리는 것이 위생에 좋다",
      "가방과 지갑은 반드시 천막과 소방 호스로 만들어야 한다",
    ],
    answer: 0,
    explain:
      "<span class='xh'>정답 풀이</span>글은 첫 문장에서 <b>쓰레기가 줄고 자원도 아낀다</b>는 두 가지 이로움을 말하고, 가방·지갑을 예로 든 뒤, 버리기 전에 한 번 더 생각해 보자고 끝맺어요. 글 전체가 이 하나의 주장을 향하고 있죠.<span class='xh'>오답 하나씩 격파</span>'자주 새로 사는 것이 좋다'는 글이 말하는 방향과 정반대예요. '모아서 태우는 것이 가장 좋다'도 글에 나오지 않을뿐더러, 태우면 자원을 되살릴 기회가 사라지죠. '바로 버리는 것이 위생에 좋다'는 그럴듯한 이유를 붙였지만 역시 글의 주장과 어긋나요 · <b>그럴듯한 명분을 앞세워 반대 행동을 권하는 보기</b>는 늘 조심해야 합니다. '반드시 천막과 소방 호스로 만들어야 한다'는 예로 든 두 가지를 규칙처럼 굳혀 버린 답이에요 · 예시는 어디까지나 예시일 뿐이랍니다.",
    core: "글의 주장은 첫 문장과 끝맺음에! 예시를 규칙으로 굳히면 안 돼요.",
  },
];

