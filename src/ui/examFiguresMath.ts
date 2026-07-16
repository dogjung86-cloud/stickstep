// examFiguresMath — 수학 단원 종합 평가 전용 그림(전부 파라미터형 SVG).
// 과학 examFigures.ts와 파일 분리(동시 세션 충돌 방지 — 수학 시험 그림은 전부 여기, 과학 파일 수정 금지).
// 문법은 mathFigures 계승(밝은 카드 · 잉크 라인 · NAVY/ROSE/GREEN 절제). 시험 그림 두 규칙:
// ① 정답이 되는 수치는 반드시 "그려진(라벨 붙은)" 눈금선 위에 얹는다 — 눈금 사이 값 출제 금지.
//    histo 계열은 yMax ≤ 8(전 정수 눈금 표시), 상대도수 다각형은 라벨된 주눈금(0.05 배수) 위만.
// ② aria-label은 중립 서술만 — 그림 속 값·정오·판독 결과를 낭독하지 않는다(crudeTowerFig 소급 수정 계보).
// m1u6 통계: mExamStemFig(줄기와 잎) · mExamTableFig(도수/상대도수 표) · mExamRelPolyFig(두 집단 비교) ·
//            mExamTornHistoFig(찢어진 히스토그램) · mExamAxisPairFig(눈금 조작 쌍).
// 히스토그램·다각형 단독, 자료 칩, 점 그림은 mathFigures의 histoFig/statDataFig/dotPlotFig를 재사용한다
// (파라미터형이라 레슨과 "수치·소재 교체"만 지키면 됨 — 레슨 앵커: histoFig [1,7,9,14,5]/20/20 회피).
import { planeSpec } from "./mathKit";

import { GEO, angleArc, angleOf, dot, polar, ptLabel, rightMark, tickMark } from "./geoKit";

const INK = "#334155";
const FAINT = "#94A3B8";
const NAVY = "#364FC7";
const NAVY_SOFT = "#8B99EE";
const ROSE = "#E8547E";
const GREEN = "#2F9E44";
const GRID = "#EDF0F6";
const LINE = "#DDE3EC";

const svg = (vb: string, aria: string, inner: string): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${aria}">${inner}</svg>`;

export interface MExamPlanePoint {
  label: string;
  x: number;
  y: number;
  color?: string;
  labelDx?: number;
  labelDy?: number;
  showCoordinate?: boolean;
}

export interface MExamPlaneSpec {
  min: number;
  max: number;
  size?: number;
  labelEvery?: number;
  points: MExamPlanePoint[];
}

/**
 * 좌표평면 시험용 점 그림. 전달한 spec이 좌표·축 범위·눈금·라벨의 단일 진실 공급원이다.
 * aria-label에는 점 이름만 넣고 좌표값이나 사분면 판정은 넣지 않는다.
 */
export function mExamPlaneFig(spec: MExamPlaneSpec): string {
  const p = planeSpec({ min: spec.min, max: spec.max, size: spec.size ?? 320, labelEvery: spec.labelEvery });
  let inner = p.grid;
  for (const point of spec.points) {
    const cx = p.px(point.x);
    const cy = p.py(point.y);
    const color = point.color ?? NAVY;
    const label = point.showCoordinate
      ? `${point.label}(${String(point.x).replace("-", "−")}, ${String(point.y).replace("-", "−")})`
      : point.label;
    const dx = point.labelDx ?? 0;
    const dy = point.labelDy ?? (cy > 34 ? -10 : 18);
    inner +=
      `<circle cx="${cx}" cy="${cy}" r="5" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>` +
      `<text x="${cx + dx}" y="${cy + dy}" text-anchor="middle" font-size="12" font-weight="900" fill="${INK}">${label}</text>`;
  }
  return svg(p.vb, `좌표평면에 표시된 점 ${spec.points.map((point) => point.label).join(", ")}`, inner);
}

export interface MExamGraphSeries {
  points: Array<[number, number]>;
  label?: string;
  color?: string;
  dashed?: boolean;
  smooth?: boolean;
}

export interface MExamChangeGraphSpec {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xTicks: number[];
  yTicks: number[];
  xLabel: string;
  yLabel: string;
  series: MExamGraphSeries[];
  width?: number;
  height?: number;
}

/** 변화·활용 그래프. 축 범위·라벨·눈금·선의 실제 점을 한 spec에서 렌더한다. */
export function mExamChangeGraphFig(spec: MExamChangeGraphSpec): string {
  const width = spec.width ?? 340;
  const height = spec.height ?? 220;
  const left = 54;
  const right = 18;
  const top = 22;
  const bottom = 42;
  const X = (x: number): number => left + ((x - spec.xMin) / (spec.xMax - spec.xMin)) * (width - left - right);
  const Y = (y: number): number => height - bottom - ((y - spec.yMin) / (spec.yMax - spec.yMin)) * (height - top - bottom);
  let inner =
    `<line x1="${left}" y1="${height - bottom}" x2="${width - right + 6}" y2="${height - bottom}" stroke="#64748B" stroke-width="1.8"/>` +
    `<path d="M${width - right + 6} ${height - bottom} l-7 -4 v8 z" fill="#64748B"/>` +
    `<line x1="${left}" y1="${height - bottom + 6}" x2="${left}" y2="${top - 6}" stroke="#64748B" stroke-width="1.8"/>` +
    `<path d="M${left} ${top - 6} l-4 7 h8 z" fill="#64748B"/>`;
  for (const x of spec.xTicks) {
    const px = X(x);
    inner +=
      `<line x1="${px}" y1="${top}" x2="${px}" y2="${height - bottom}" stroke="${GRID}" stroke-width="1"/>` +
      `<text x="${px}" y="${height - bottom + 16}" text-anchor="middle" font-size="9" font-weight="700" fill="#8093A8">${String(x).replace("-", "−")}</text>`;
  }
  for (const y of spec.yTicks) {
    const py = Y(y);
    inner +=
      `<line x1="${left}" y1="${py}" x2="${width - right}" y2="${py}" stroke="${GRID}" stroke-width="1"/>` +
      `<text x="${left - 7}" y="${py + 3}" text-anchor="end" font-size="9" font-weight="700" fill="#8093A8">${String(y).replace("-", "−")}</text>`;
  }
  inner +=
    `<text x="${width - right}" y="${height - 8}" text-anchor="end" font-size="10.5" font-weight="800" fill="#64748B">${spec.xLabel}</text>` +
    `<text x="8" y="14" font-size="10.5" font-weight="800" fill="#64748B">${spec.yLabel}</text>`;
  spec.series.forEach((series, index) => {
    const color = series.color ?? [NAVY, ROSE, GREEN, "#F08C2E"][index % 4];
    const coords = series.points.map(([x, y]) => [X(x), Y(y)] as const);
    const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    inner += `<path d="${d}" stroke="${color}" stroke-width="2.7" ${series.dashed ? 'stroke-dasharray="5 4"' : ""} fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (const [x, y] of coords) inner += `<circle cx="${x}" cy="${y}" r="3.4" fill="#FFFFFF" stroke="${color}" stroke-width="1.8"/>`;
    if (series.label && coords.length) {
      const [x, y] = coords[coords.length - 1];
      inner += `<text x="${x - 3}" y="${y - 8}" text-anchor="end" font-size="10" font-weight="900" fill="${color}">${series.label}</text>`;
    }
  });
  return svg(`${0} ${0} ${width} ${height}`, `${spec.xLabel}과 ${spec.yLabel}의 관계를 나타낸 그래프`, inner);
}

export interface MExamRelationPlaneSpec extends Omit<MExamPlaneSpec, "points"> {
  points?: MExamPlanePoint[];
  lines?: Array<{ a: number; b?: number; label?: string; color?: string }>;
  inverseCurves?: Array<{ a: number; label?: string; color?: string }>;
}

/** 정비례 직선·반비례 두 갈래 곡선·표시점을 같은 planeSpec 좌표계에 그린다. */
export function mExamRelationPlaneFig(spec: MExamRelationPlaneSpec): string {
  const p = planeSpec({ min: spec.min, max: spec.max, size: spec.size ?? 320, labelEvery: spec.labelEvery });
  let inner = p.grid;
  spec.lines?.forEach((line, index) => {
    const color = line.color ?? [NAVY, ROSE, GREEN][index % 3];
    const b = line.b ?? 0;
    inner += `<line x1="${p.px(spec.min)}" y1="${p.py(line.a * spec.min + b)}" x2="${p.px(spec.max)}" y2="${p.py(line.a * spec.max + b)}" stroke="${color}" stroke-width="2.7" stroke-linecap="round"/>`;
    if (line.label) inner += `<text x="${p.px(spec.max - 0.4)}" y="${p.py(line.a * (spec.max - 0.4) + b) - 7}" text-anchor="end" font-size="10.5" font-weight="900" fill="${color}">${line.label}</text>`;
  });
  spec.inverseCurves?.forEach((curve, index) => {
    const color = curve.color ?? [NAVY, ROSE, GREEN][index % 3];
    for (const sign of [-1, 1] as const) {
      const closest = Math.max(Math.abs(curve.a) / Math.max(Math.abs(spec.min), Math.abs(spec.max)), 0.08);
      let d = "";
      for (let i = 0; i <= 64; i++) {
        const absX = closest + (i / 64) * (Math.max(Math.abs(spec.min), Math.abs(spec.max)) - closest);
        const x = sign * absX;
        const y = curve.a / x;
        d += `${i === 0 ? "M" : "L"}${p.px(x).toFixed(1)} ${p.py(y).toFixed(1)} `;
      }
      inner += `<path d="${d}" stroke="${color}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    }
    if (curve.label) inner += `<text x="${p.px(spec.max - 0.4)}" y="${p.py(curve.a / (spec.max - 0.4)) - 8}" text-anchor="end" font-size="10.5" font-weight="900" fill="${color}">${curve.label}</text>`;
  });
  for (const point of spec.points ?? []) {
    const cx = p.px(point.x);
    const cy = p.py(point.y);
    const color = point.color ?? NAVY;
    const label = point.showCoordinate
      ? `${point.label}(${String(point.x).replace("-", "−")}, ${String(point.y).replace("-", "−")})`
      : point.label;
    inner +=
      `<circle cx="${cx}" cy="${cy}" r="5" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>` +
      `<text x="${cx + (point.labelDx ?? 0)}" y="${cy + (point.labelDy ?? (cy > 34 ? -10 : 18))}" text-anchor="middle" font-size="12" font-weight="900" fill="${INK}">${label}</text>`;
  }
  const names = (spec.points ?? []).map((point) => point.label).join(", ");
  return svg(p.vb, `좌표평면의 관계 그래프${names ? `와 점 ${names}` : ""}`, inner);
}

/* ── 줄기와 잎 그림 ─────────────────────────────────────────
 * stems: [줄기, 잎 배열] — 잎은 크기순 정렬해 넘긴다(그림은 받은 순서 그대로 그린다).
 * 잎은 줄기당 최대 9개(폭 300 제약). key 예: "(1|5는 15회)" — 읽는 법 표시는 필수. */
export function mExamStemFig(stems: Array<[number, number[]]>, opts: { title: string; key: string }): string {
  const rowH = 24;
  const top = 64; // 제목 18 + 읽는 법 34 + 헤더 54
  const H = top + stems.length * rowH + 12;
  const DIV = 92; // 줄기|잎 세로 구분선 x
  let out = `<text x="150" y="18" text-anchor="middle" font-size="11.5" font-weight="900" fill="${INK}">${opts.title}</text>`;
  out += `<text x="288" y="36" text-anchor="end" font-size="9.5" font-weight="700" fill="${FAINT}">${opts.key}</text>`;
  out += `<text x="${DIV - 22}" y="56" text-anchor="middle" font-size="10" font-weight="800" fill="${FAINT}">줄기</text>`;
  out += `<text x="${DIV + 16}" y="56" font-size="10" font-weight="800" fill="${FAINT}">잎</text>`;
  out += `<line x1="${DIV}" y1="44" x2="${DIV}" y2="${H - 8}" stroke="${INK}" stroke-width="1.6"/>`;
  out += `<line x1="24" y1="62" x2="276" y2="62" stroke="${LINE}" stroke-width="1.2"/>`;
  stems.forEach(([stem, leaves], r) => {
    const y = top + r * rowH + 16;
    out += `<text x="${DIV - 22}" y="${y}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${NAVY}">${stem}</text>`;
    leaves.forEach((lf, i) => {
      out += `<text x="${DIV + 16 + i * 20}" y="${y}" font-size="12.5" font-weight="800" fill="${INK}">${lf}</text>`;
    });
  });
  return svg(`0 0 300 ${H}`, "줄기와 잎 그림", out);
}

/* ── 통계 표(도수분포표 · 상대도수 분포표 겸용) ────────────────
 * cols: 헤더 행(예 ["기록(회)", "학생 수(명)", "상대도수"]) — 전부 빈 문자열이면 헤더 행을 생략
 * (m2u1 마방진처럼 헤더 없는 표). A~E·㉠·㉡ 한 글자 셀은 빈칸(미지수)으로 간주해 네이비 강조.
 * "합계" 행은 위 경계선을 굵게. colw: 열 폭 비율(합 100) — 생략 시 첫 열 40, 나머지 균등.
 * aria: 용도별 중립 서술(기본 "통계 표" — 마방진 등 비통계 용도는 반드시 지정). */
export function mExamTableFig(cols: string[], rows: string[][], opts: { title?: string; colw?: number[]; aria?: string } = {}): string {
  const W = 300;
  const X0 = 10;
  const TW = W - 20;
  const nc = cols.length;
  const colw = opts.colw ?? [40, ...Array.from({ length: nc - 1 }, () => 60 / (nc - 1))];
  const xs: number[] = [X0];
  for (const w of colw) xs.push(xs[xs.length - 1] + (w / 100) * TW);
  const cx = (c: number): number => (xs[c] + xs[c + 1]) / 2;
  const titleH = opts.title ? 22 : 0;
  const hasHead = cols.some((c) => c);
  const headH = hasHead ? 26 : 0;
  const rowH = 24;
  const H = titleH + headH + rows.length * rowH + 14;
  let out = "";
  if (opts.title) out += `<text x="150" y="16" text-anchor="middle" font-size="11.5" font-weight="900" fill="${INK}">${opts.title}</text>`;
  const gy0 = titleH + 6;
  if (hasHead) {
    out += `<rect x="${X0}" y="${gy0}" width="${TW}" height="${headH}" rx="0" fill="#EEF1FB"/>`;
    cols.forEach((c, i) => {
      out += `<text x="${cx(i)}" y="${gy0 + 17}" text-anchor="middle" font-size="10" font-weight="800" fill="${INK}">${c}</text>`;
    });
  }
  rows.forEach((row, r) => {
    const y = gy0 + headH + r * rowH;
    const isTotal = row[0].includes("합계");
    if (r % 2 === 1 && !isTotal) out += `<rect x="${X0}" y="${y}" width="${TW}" height="${rowH}" fill="#F8FAFC"/>`;
    if (isTotal) out += `<line x1="${X0}" y1="${y}" x2="${X0 + TW}" y2="${y}" stroke="${INK}" stroke-width="1.6"/>`;
    row.forEach((cell, c) => {
      const blank = /^([A-E]|㉠|㉡)$/.test(cell);
      out += `<text x="${cx(c)}" y="${y + 16}" text-anchor="middle" font-size="10.5" font-weight="${blank || isTotal ? 900 : 700}" fill="${blank ? NAVY : INK}">${cell}</text>`;
    });
  });
  const gy1 = gy0 + headH + rows.length * rowH;
  out += `<rect x="${X0}" y="${gy0}" width="${TW}" height="${gy1 - gy0}" stroke="${LINE}" stroke-width="1.4"/>`;
  for (let c = 1; c < nc; c++) out += `<line x1="${xs[c]}" y1="${gy0}" x2="${xs[c]}" y2="${gy1}" stroke="${LINE}" stroke-width="1.2"/>`;
  if (hasHead) out += `<line x1="${X0}" y1="${gy0 + headH}" x2="${X0 + TW}" y2="${gy0 + headH}" stroke="${LINE}" stroke-width="1.2"/>`;
  return svg(`0 0 ${W} ${H}`, opts.aria ?? "통계 표", out);
}

/* ── 상대도수 다각형 두 집단 비교(파라미터형 — 레슨 relCompareFig의 시험판) ──
 * a·b: 계급별 상대도수(같은 길이). 유령 계급 0점으로 양 끝을 축 안에서 닫는다.
 * 주눈금(라벨) yTicks 기본 [0.1, 0.2, 0.3] + 절반 간격 보조선 — 정답에 쓰는 값은 주눈금 위만.
 * x0·cw: 첫 계급 경계·계급 크기(경계 라벨 = x0 + i·cw). */
export function mExamRelPolyFig(opts: {
  a: number[];
  b: number[];
  la: string;
  lb: string;
  x0: number;
  cw: number;
  xUnit: string;
  yTicks?: number[];
}): string {
  const { a, b } = opts;
  const n = a.length;
  const W = 300;
  const AXY = 156;
  const L = 36;
  const yTicks = opts.yTicks ?? [0.1, 0.2, 0.3];
  const maxT = yTicks[yTicks.length - 1];
  const S = 116 / maxT;
  const ty = (r: number): number => AXY - r * S;
  const step = Math.floor(246 / (n + 1));
  const XB = (i: number): number => L + step / 2 + 8 + i * step;
  let out = "";
  const minor = yTicks[0] / 2;
  for (let r = minor; r < maxT + 1e-9; r += minor) {
    const major = yTicks.some((t) => Math.abs(t - r) < 1e-9);
    out += `<line x1="${L}" y1="${ty(r).toFixed(1)}" x2="${W - 8}" y2="${ty(r).toFixed(1)}" stroke="${GRID}" stroke-width="${major ? 1.3 : 0.8}"/>`;
    if (major)
      out += `<text x="${L - 6}" y="${(ty(r) + 3.5).toFixed(1)}" text-anchor="end" font-size="8.5" font-weight="700" fill="${FAINT}">${+r.toFixed(2)}</text>`;
  }
  out += `<line x1="${L}" y1="${AXY}" x2="${W - 8}" y2="${AXY}" stroke="${INK}" stroke-width="1.8"/>`;
  out += `<line x1="${L}" y1="${AXY}" x2="${L}" y2="22" stroke="${INK}" stroke-width="1.8"/>`;
  for (let i = 0; i <= n; i++)
    out += `<text x="${XB(i)}" y="${AXY + 14}" text-anchor="middle" font-size="8.5" font-weight="700" fill="${FAINT}">${opts.x0 + i * opts.cw}</text>`;
  out += `<text x="${W - 8}" y="${AXY + 27}" text-anchor="end" font-size="8" font-weight="700" fill="${FAINT}">(${opts.xUnit})</text>`;
  out += `<text x="16" y="14" font-size="8" font-weight="700" fill="${FAINT}">(상대도수)</text>`;
  const line = (arr: number[], color: string): string => {
    const pts: Array<[number, number]> = [[XB(0) - step / 2, AXY]];
    arr.forEach((r, i) => pts.push([XB(i) + step / 2, ty(r)]));
    pts.push([XB(n) + step / 2, AXY]);
    const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    return (
      `<path d="${d}" stroke="${color}" stroke-width="2.2" fill="none" stroke-linejoin="round"/>` +
      pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#FFFFFF" stroke="${color}" stroke-width="1.7"/>`).join("")
    );
  };
  out += line(a, NAVY) + line(b, GREEN);
  out += `<rect x="212" y="16" width="11" height="11" rx="3" fill="${NAVY}"/><text x="228" y="25" font-size="9.5" font-weight="800" fill="${INK}">${opts.la}</text>`;
  out += `<rect x="212" y="34" width="11" height="11" rx="3" fill="${GREEN}"/><text x="228" y="43" font-size="9.5" font-weight="800" fill="${INK}">${opts.lb}</text>`;
  return svg(`0 0 ${W} 186`, "두 집단의 상대도수 분포 비교 그래프", out);
}

/* ── 일부가 찢어진 히스토그램 ───────────────────────────────
 * tornIdx 막대는 높이를 숨긴 찢김 조각으로 그린다(찢김 높이는 고정 42px — 실제 도수와 무관한 장식).
 * 나머지 기하는 mathFigures histoFig와 동일(yMax ≤ 8 유지 — 전 정수 눈금이 라벨과 함께 그려진다). */
export function mExamTornHistoFig(
  freqs: number[],
  x0: number,
  cw: number,
  tornIdx: number,
  opts: { xUnit?: string; yUnit?: string; yMax?: number } = {},
): string {
  const n = freqs.length;
  const yMax = opts.yMax ?? Math.max(...freqs.filter((_, i) => i !== tornIdx)) + 1;
  const W = 300;
  const H = 190;
  const L = 34;
  const AXY = 158;
  const bw = (W - L - 20) / n;
  const ty = (f: number): number => AXY - (f / yMax) * 120;
  let out = "";
  for (let f = 1; f <= yMax; f++) {
    if (yMax > 8 && f % 2 === 1) continue;
    out += `<line x1="${L}" y1="${ty(f)}" x2="${W - 12}" y2="${ty(f)}" stroke="${GRID}" stroke-width="1.1"/><text x="${L - 8}" y="${ty(f) + 3.5}" text-anchor="middle" font-size="8.5" font-weight="700" fill="${FAINT}">${f}</text>`;
  }
  out += `<line x1="${L}" y1="${AXY}" x2="${W - 12}" y2="${AXY}" stroke="${INK}" stroke-width="1.8"/>`;
  out += `<line x1="${L}" y1="${AXY}" x2="${L}" y2="${ty(yMax) - 8}" stroke="${INK}" stroke-width="1.8"/>`;
  for (let i = 0; i <= n; i++)
    out += `<text x="${(L + i * bw).toFixed(1)}" y="${AXY + 14}" text-anchor="middle" font-size="8.5" font-weight="700" fill="${FAINT}">${x0 + i * cw}</text>`;
  if (opts.xUnit) out += `<text x="${W - 10}" y="${AXY + 27}" text-anchor="end" font-size="8" font-weight="700" fill="${FAINT}">(${opts.xUnit})</text>`;
  if (opts.yUnit) out += `<text x="${L - 14}" y="${ty(yMax) - 12}" font-size="8" font-weight="700" fill="${FAINT}">(${opts.yUnit})</text>`;
  freqs.forEach((f, i) => {
    const xL = L + i * bw;
    if (i === tornIdx) {
      // 찢김 조각: 지그재그 윗변(y=AXY−42 부근) — 실제 막대 높이를 짐작할 수 없게 그린다
      const yT = AXY - 42;
      const teeth = 4;
      const tw = bw / teeth;
      let d = `M${xL.toFixed(1)} ${AXY} L${xL.toFixed(1)} ${(yT + 4).toFixed(1)}`;
      for (let k = 0; k < teeth; k++)
        d += ` L${(xL + tw * (k + 0.5)).toFixed(1)} ${(yT + (k % 2 === 0 ? -6 : 6)).toFixed(1)} L${(xL + tw * (k + 1)).toFixed(1)} ${(yT + (k % 2 === 0 ? 6 : -2)).toFixed(1)}`;
      d += ` L${(xL + bw).toFixed(1)} ${AXY} Z`;
      out += `<path d="${d}" fill="#F1F3F8" stroke="#C9D2E4" stroke-width="1.4" stroke-linejoin="round"/>`;
      out += `<text x="${(xL + bw / 2).toFixed(1)}" y="${AXY - 16}" text-anchor="middle" font-size="13" font-weight="900" fill="${FAINT}">?</text>`;
    } else {
      out += `<rect x="${xL.toFixed(1)}" y="${ty(f).toFixed(1)}" width="${bw.toFixed(1)}" height="${(AXY - ty(f)).toFixed(1)}" fill="${NAVY_SOFT}" fill-opacity=".45" stroke="${NAVY}" stroke-width="1.4"/>`;
    }
  });
  return svg(`0 0 ${W} ${H}`, "일부가 찢어져 한 막대가 보이지 않는 히스토그램", out);
}

/* ── 눈금 조작 두 그래프(파라미터형 — 레슨 fakeAxisFig의 시험판) ──
 * 같은 자료(vals)를 ㄱ: 0~fullMax 축 / ㄴ: zoomLo~zoomHi 확대 축으로 나란히.
 * 편집 캡션("대폭락이야!" 류)은 판독 결과를 유출하므로 넣지 않는다 — 축 라벨과 값만.
 * showVals(기본 true): 점 위에 값 표기 — "같은 자료"임이 그림에서 읽히는 장치. */
export function mExamAxisPairFig(opts: {
  vals: number[];
  fullMax: number;
  zoomLo: number;
  zoomHi: number;
  xLabels?: string[];
  unit?: string;
  ta?: string;
  tb?: string;
  showVals?: boolean;
}): string {
  const { vals } = opts;
  const n = vals.length;
  const showVals = opts.showVals !== false;
  const panel = (px: number, title: string, y0: number, y1: number, color: string): string => {
    const ty = (v: number): number => 150 - ((v - y0) / (y1 - y0)) * 100;
    const dx = n > 1 ? 76 / (n - 1) : 0;
    const X = (i: number): number => px + 24 + i * dx;
    const d = vals.map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)} ${ty(v).toFixed(1)}`).join(" ");
    let p =
      `<rect x="${px}" y="16" width="136" height="168" rx="10" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.4"/>` +
      `<text x="${px + 68}" y="34" text-anchor="middle" font-size="10" font-weight="900" fill="${color}">${title}</text>` +
      `<line x1="${px + 16}" y1="150" x2="${px + 124}" y2="150" stroke="${FAINT}" stroke-width="1.5"/>` +
      `<line x1="${px + 16}" y1="150" x2="${px + 16}" y2="42" stroke="${FAINT}" stroke-width="1.5"/>` +
      `<text x="${px + 12}" y="${(ty(y1) + 3).toFixed(1)}" text-anchor="end" font-size="7.5" font-weight="700" fill="${FAINT}">${y1}</text>` +
      `<text x="${px + 12}" y="153" text-anchor="end" font-size="7.5" font-weight="700" fill="${FAINT}">${y0}</text>` +
      `<path d="${d}" stroke="${color}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    vals.forEach((v, i) => {
      p += `<circle cx="${X(i).toFixed(1)}" cy="${ty(v).toFixed(1)}" r="3" fill="#FFFFFF" stroke="${color}" stroke-width="1.8"/>`;
      if (showVals) p += `<text x="${X(i).toFixed(1)}" y="${(ty(v) - 7).toFixed(1)}" text-anchor="middle" font-size="7.5" font-weight="800" fill="${INK}">${v}</text>`;
      if (opts.xLabels?.[i])
        p += `<text x="${X(i).toFixed(1)}" y="162" text-anchor="middle" font-size="7.5" font-weight="700" fill="${FAINT}">${opts.xLabels[i]}</text>`;
    });
    if (opts.unit) p += `<text x="${px + 124}" y="176" text-anchor="end" font-size="7" font-weight="700" fill="${FAINT}">(${opts.unit})</text>`;
    return p;
  };
  return svg(
    "0 0 300 190",
    "같은 자료를 세로축 눈금만 다르게 그린 두 그래프",
    panel(6, opts.ta ?? "그래프 ㄱ", 0, opts.fullMax, NAVY) + panel(158, opts.tb ?? "그래프 ㄴ", opts.zoomLo, opts.zoomHi, ROSE),
  );
}

/* ══════════════ m1u1 수와 연산 섹션 ══════════════
 * 전부 파라미터형 — 문항 저작 시 레슨(unit1.ts) 앵커 수치와 다른 값을 넘긴다.
 * aria는 중립 서술만(소수 개수·정답 수치·판독 결과 낭독 금지). */

/** 수 카드 한 줄(고르기·분류 문항). vals는 표시 문자열(음수는 U+2212 −). 최대 6장. */
export function mExamCardsFig(vals: string[], opts: { title?: string } = {}): string {
  const n = Math.min(vals.length, 6);
  // 6장이면 42px로 좁혀야 뷰박스(300) 안에 든다(6×42+5×6=282 — 50px 시절 340px 오버플로 실사고)
  const cw = n >= 6 ? 42 : n >= 5 ? 50 : 58;
  const gap = n >= 6 ? 6 : 8;
  const total = n * cw + (n - 1) * gap;
  const x0 = (300 - total) / 2;
  const titleH = opts.title ? 24 : 0;
  const H = titleH + 66;
  let out = "";
  if (opts.title) out += `<text x="150" y="17" text-anchor="middle" font-size="11.5" font-weight="900" fill="${INK}">${opts.title}</text>`;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * (cw + gap);
    out +=
      `<rect x="${x}" y="${titleH + 8}" width="${cw}" height="46" rx="10" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.5"/>` +
      `<rect x="${x}" y="${titleH + 8}" width="${cw}" height="5" rx="2.5" fill="${NAVY_SOFT}" opacity=".45"/>` +
      `<text x="${x + cw / 2}" y="${titleH + 38}" text-anchor="middle" font-size="${vals[i].length >= 5 ? 11.5 : 14}" font-weight="900" fill="${INK}">${vals[i]}</text>`;
  }
  return svg(`0 0 300 ${H}`, "수 카드", out);
}

/** 체질(에라토스테네스의 체)이 끝난 격자 — lo~hi, 6열. 남은 수(소수)는 네이비 칩,
 *  지워진 수는 흐린 빗금 처리. 소수 판정은 내장 검산. */
export function mExamSieveFig(lo: number, hi: number): string {
  const isPrime = (v: number): boolean => {
    if (v < 2) return false;
    for (let d = 2; d * d <= v; d++) if (v % d === 0) return false;
    return true;
  };
  const cols = 6;
  const nums: number[] = [];
  for (let v = lo; v <= hi; v++) nums.push(v);
  const rows = Math.ceil(nums.length / cols);
  const cell = 44;
  const gap = 5;
  const x0 = (300 - (cols * cell + (cols - 1) * gap)) / 2;
  const H = rows * (cell * 0.82 + gap) + 16;
  let out = "";
  nums.forEach((v, i) => {
    const cx = x0 + (i % cols) * (cell + gap);
    const cy = 8 + Math.floor(i / cols) * (cell * 0.82 + gap);
    const h = cell * 0.82;
    const p = isPrime(v);
    out += `<rect x="${cx}" y="${cy}" width="${cell}" height="${h}" rx="9" fill="${p ? "#EEF1FB" : "#F8FAFC"}" stroke="${p ? NAVY : LINE}" stroke-width="${p ? 1.8 : 1.2}"/>`;
    out += `<text x="${cx + cell / 2}" y="${cy + h / 2 + 4.5}" text-anchor="middle" font-size="13" font-weight="${p ? 900 : 700}" fill="${p ? NAVY : FAINT}">${v}</text>`;
    if (!p) out += `<line x1="${cx + 9}" y1="${cy + h - 9}" x2="${cx + cell - 9}" y2="${cy + 9}" stroke="${FAINT}" stroke-width="1.4" opacity=".7"/>`;
  });
  return svg(`0 0 300 ${H}`, `${lo}부터 ${hi}까지 체질이 끝난 수 격자`, out);
}

/** 소인수 벤 다이어그램(파라미터형) — la·lb는 원 제목(두 수), left/mid/right는 소인수 칩 배열. */
export function mExamVennFig(o: { la: string; lb: string; left: string[]; mid: string[]; right: string[] }): string {
  const chip = (x: number, y: number, v: string, hot: boolean): string =>
    `<circle cx="${x}" cy="${y}" r="13" fill="${hot ? "#EEF1FB" : "#FFFFFF"}" stroke="${hot ? NAVY : INK}" stroke-width="1.6"/>` +
    `<text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="900" fill="${hot ? NAVY : INK}">${v}</text>`;
  const place = (arr: string[], cxm: number, hot: boolean): string => {
    let s = "";
    const slots: Array<[number, number]> =
      arr.length <= 1 ? [[cxm, 96]] : arr.length === 2 ? [[cxm, 76], [cxm, 118]] : [[cxm, 68], [cxm - 10, 106], [cxm + 12, 132]];
    arr.forEach((v, i) => {
      const sl = slots[Math.min(i, slots.length - 1)];
      s += chip(sl[0] + (i > 2 ? 14 : 0), sl[1], v, hot);
    });
    return s;
  };
  let out =
    `<circle cx="112" cy="100" r="62" fill="#F1F5FF" opacity=".55" stroke="${NAVY}" stroke-width="1.8"/>` +
    `<circle cx="188" cy="100" r="62" fill="#FFF0F4" opacity=".55" stroke="${ROSE}" stroke-width="1.8"/>` +
    `<text x="84" y="26" text-anchor="middle" font-size="12.5" font-weight="900" fill="${NAVY}">${o.la}</text>` +
    `<text x="216" y="26" text-anchor="middle" font-size="12.5" font-weight="900" fill="${ROSE}">${o.lb}</text>`;
  out += place(o.left, 78, false);
  out += place(o.mid, 150, true);
  out += place(o.right, 222, false);
  return svg("0 0 300 176", `두 수 ${o.la}와 ${o.lb}의 소인수 벤 다이어그램`, out);
}

/** 인수 트리(파라미터형) — root가 l·r로 갈라지고, lch/rch가 있으면 그 아래가 한 번 더 갈라진다.
 *  값이 숫자가 아니면(㉠ 등) 빈칸 노드(네이비 점선), 숫자면 소수 판정해 소수는 그린. */
export function mExamTreeFig(o: {
  root: number | string;
  l: number | string;
  r: number | string;
  lch?: [number | string, number | string];
  rch?: [number | string, number | string];
}): string {
  const isPrime = (v: number): boolean => {
    if (v < 2) return false;
    for (let d = 2; d * d <= v; d++) if (v % d === 0) return false;
    return true;
  };
  const node = (x: number, y: number, v: number | string): string => {
    const blank = typeof v !== "number";
    const prime = typeof v === "number" && isPrime(v);
    const col = blank ? NAVY : prime ? GREEN : INK;
    const dash = blank ? ` stroke-dasharray="4 3"` : "";
    return (
      `<circle cx="${x}" cy="${y}" r="17" fill="${blank ? "#EEF1FB" : prime ? "#EAF7EE" : "#FFFFFF"}" stroke="${col}" stroke-width="1.8"${dash}/>` +
      `<text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${col}">${v}</text>`
    );
  };
  const edge = (x1: number, y1: number, x2: number, y2: number): string =>
    `<line x1="${x1}" y1="${y1 + 14}" x2="${x2}" y2="${y2 - 14}" stroke="${FAINT}" stroke-width="1.6"/>`;
  const deep = o.lch || o.rch;
  const H = deep ? 208 : 138;
  let out = edge(150, 34, 92, 96) + edge(150, 34, 208, 96) + node(150, 34, o.root) + node(92, 96, o.l) + node(208, 96, o.r);
  if (o.lch) out += edge(92, 96, 56, 166) + edge(92, 96, 128, 166) + node(56, 166, o.lch[0]) + node(128, 166, o.lch[1]);
  if (o.rch) out += edge(208, 96, 172, 166) + edge(208, 96, 244, 166) + node(172, 166, o.rch[0]) + node(244, 166, o.rch[1]);
  return svg(`0 0 300 ${H}`, "인수 트리", out);
}

/** 나눗셈 사다리(파라미터형) — a·b를 divs로 차례로 함께 나눈다(나누어떨어지는 값만 넘길 것).
 *  blankDiv: 그 순번의 나눈 수를 ㉠으로 감춘다(빈칸 추론 문항용). */
export function mExamLadderFig(a: number, b: number, divs: number[], opts: { blankDiv?: number } = {}): string {
  const rows: Array<[number, number]> = [[a, b]];
  for (const d of divs) {
    const [x, y] = rows[rows.length - 1];
    rows.push([x / d, y / d]);
  }
  const rowH = 34;
  const X = 150;
  const CW = 56;
  const H = 18 + rows.length * rowH + 6;
  let out = "";
  rows.forEach(([x, y], r) => {
    const yy = 18 + r * rowH + 14;
    const last = r === rows.length - 1;
    if (last) out += `<rect x="${X - CW - 8}" y="${yy - 14}" width="${CW * 2 + 16}" height="26" rx="8" fill="#EAF7EE" opacity=".6"/>`;
    out += `<text x="${X - CW / 2}" y="${yy + 4}" text-anchor="middle" font-size="13.5" font-weight="900" fill="${last ? GREEN : INK}">${x}</text>`;
    out += `<text x="${X + CW / 2}" y="${yy + 4}" text-anchor="middle" font-size="13.5" font-weight="900" fill="${last ? GREEN : INK}">${y}</text>`;
    if (!last) {
      const blank = opts.blankDiv === r;
      out += `<path d="M ${X - CW - 26} ${yy + 12} L ${X + CW + 22} ${yy + 12} M ${X - CW - 26} ${yy + 12} L ${X - CW - 26} ${yy - 10}" stroke="${INK}" stroke-width="1.6" fill="none"/>`;
      out += blank
        ? `<circle cx="${X - CW - 46}" cy="${yy + 5}" r="12" fill="#EEF1FB" stroke="${NAVY}" stroke-width="1.6" stroke-dasharray="4 3"/><text x="${X - CW - 46}" y="${yy + 9}" text-anchor="middle" font-size="11" font-weight="900" fill="${NAVY}">㉠</text>`
        : `<text x="${X - CW - 46}" y="${yy + 9}" text-anchor="middle" font-size="13.5" font-weight="900" fill="${NAVY}">${divs[r]}</text>`;
    }
  });
  return svg(`0 0 300 ${H}`, "두 수를 공약수로 함께 나눈 나눗셈 사다리", out);
}

/** 거듭제곱 칩(파라미터형) — groups: [밑, 개수][]. 같은 밑 칩이 개수만큼 이어진다. */
export function mExamPowChipsFig(groups: Array<[number, number]>): string {
  const total = groups.reduce((s, [, c]) => s + c, 0);
  const cw = total >= 6 ? 38 : 46;
  const gap = 7;
  const width = total * cw + (total - 1) * gap;
  const x0 = (300 - width) / 2;
  let out = "";
  let i = 0;
  const palette = [NAVY, ROSE, GREEN, "#F08C00"];
  groups.forEach(([base, cnt], g) => {
    for (let k = 0; k < cnt; k++) {
      const x = x0 + i * (cw + gap);
      out +=
        `<circle cx="${x + cw / 2}" cy="40" r="${cw / 2}" fill="#FFFFFF" stroke="${palette[g % 4]}" stroke-width="2"/>` +
        `<text x="${x + cw / 2}" y="46" text-anchor="middle" font-size="15" font-weight="900" fill="${palette[g % 4]}">${base}</text>`;
      if (i < total - 1) out += `<text x="${x + cw + gap / 2}" y="45" text-anchor="middle" font-size="11" font-weight="800" fill="${FAINT}">×</text>`;
      i++;
    }
  });
  return svg("0 0 300 82", "같은 수 칩의 곱", out);
}

/** 분배법칙 넓이 그림(파라미터형) — 세로 a, 가로 (b+c) 직사각형을 점선으로 가른다.
 *  넓이 값은 인쇄하지 않는다(정답 유출 방지) — 변 라벨만. */
export function mExamAreaSplitFig(a: number, b: number, c: number): string {
  const W1 = 150;
  const W2 = 90;
  const HT = 92;
  const x0 = 34;
  const y0 = 40;
  const out =
    `<rect x="${x0}" y="${y0}" width="${W1}" height="${HT}" fill="#F1F5FF" stroke="${NAVY}" stroke-width="1.8"/>` +
    `<rect x="${x0 + W1}" y="${y0}" width="${W2}" height="${HT}" fill="#FFF7ED" stroke="#F08C00" stroke-width="1.8"/>` +
    `<line x1="${x0 + W1}" y1="${y0 - 6}" x2="${x0 + W1}" y2="${y0 + HT + 6}" stroke="${INK}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
    `<text x="${x0 - 12}" y="${y0 + HT / 2 + 4}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${INK}">${a}</text>` +
    `<text x="${x0 + W1 / 2}" y="${y0 - 10}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${NAVY}">${b}</text>` +
    `<text x="${x0 + W1 + W2 / 2}" y="${y0 - 10}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#F08C00">${c}</text>` +
    `<path d="M ${x0} ${y0 + HT + 14} L ${x0 + W1 + W2} ${y0 + HT + 14}" stroke="${FAINT}" stroke-width="1.3"/>` +
    `<text x="${x0 + (W1 + W2) / 2}" y="${y0 + HT + 30}" text-anchor="middle" font-size="11" font-weight="800" fill="${FAINT}">가로 ${b}+${c}</text>`;
  return svg("0 0 300 186", "직사각형을 두 조각으로 가른 넓이 그림", out);
}

/** 배수 점등표(파라미터형) — 0부터 until까지 눈금, 두 줄이 각각 pa·pb의 배수에서 점등.
 *  라벨은 until ≤ 16이면 전부, 넘으면 짝수 눈금만 — 정답(첫 공통 점등)은 반드시 라벨 눈금에 오도록 설계. */
export function mExamPulseFig(pa: number, pb: number, until: number, opts: { la?: string; lb?: string; unit?: string } = {}): string {
  const x = (v: number): number => 40 + (v / until) * 236;
  const rowY = [78, 122];
  const labelEvery = until <= 16 ? 1 : 2;
  let out = `<text x="40" y="24" font-size="10.5" font-weight="800" fill="${FAINT}">${opts.unit ?? ""}</text>`;
  [pa, pb].forEach((p, r) => {
    const col = r === 0 ? NAVY : ROSE;
    out += `<text x="30" y="${rowY[r] + 4}" text-anchor="end" font-size="10.5" font-weight="900" fill="${col}">${r === 0 ? opts.la ?? "A" : opts.lb ?? "B"}</text>`;
    out += `<line x1="40" y1="${rowY[r]}" x2="276" y2="${rowY[r]}" stroke="${LINE}" stroke-width="1.4"/>`;
    for (let v = 0; v <= until; v++) {
      const on = v % p === 0;
      out += on
        ? `<circle cx="${x(v)}" cy="${rowY[r]}" r="6.5" fill="${col}"/>`
        : `<circle cx="${x(v)}" cy="${rowY[r]}" r="2.2" fill="${FAINT}" opacity=".6"/>`;
    }
  });
  for (let v = 0; v <= until; v += labelEvery)
    out += `<text x="${x(v)}" y="150" text-anchor="middle" font-size="8.5" font-weight="700" fill="${FAINT}">${v}</text>`;
  return svg("0 0 300 160", "두 줄의 배수 점등표", out);
}

/** 절댓값 호(파라미터형) — 원점에서 −neg·+pos까지의 거리 호 두 개(비대칭 허용). */
export function mExamAbsArcsFig(neg: number, pos: number): string {
  const R = Math.max(neg, pos) + 1;
  const x = (v: number): number => 150 + (v / R) * 130;
  let out = `<line x1="14" y1="96" x2="286" y2="96" stroke="${INK}" stroke-width="1.8"/>`;
  for (let v = -R; v <= R; v++) {
    out += `<line x1="${x(v)}" y1="91" x2="${x(v)}" y2="101" stroke="${v === 0 ? INK : FAINT}" stroke-width="${v === 0 ? 1.8 : 1.1}"/>`;
    if (v === 0 || v === -neg || v === pos)
      out += `<text x="${x(v)}" y="118" text-anchor="middle" font-size="10.5" font-weight="${v !== 0 ? 900 : 700}" fill="${v === -neg ? ROSE : v === pos ? NAVY : FAINT}">${v === 0 ? "0" : v > 0 ? `+${v}` : `−${Math.abs(v)}`}</text>`;
  }
  out += `<path d="M ${x(-neg)} 88 Q ${x(-neg / 2)} ${88 - 16 - neg * 3} ${x(0)} 88" stroke="${ROSE}" stroke-width="2.2" fill="none"/>`;
  out += `<path d="M ${x(0)} 88 Q ${x(pos / 2)} ${88 - 16 - pos * 3} ${x(pos)} 88" stroke="${NAVY}" stroke-width="2.2" fill="none"/>`;
  out += `<circle cx="${x(-neg)}" cy="96" r="5" fill="${ROSE}"/><circle cx="${x(pos)}" cy="96" r="5" fill="${NAVY}"/>`;
  return svg("0 0 300 132", "원점에서 두 점까지의 거리를 나타낸 호", out);
}

 /* ── 문자와 식: 이어 붙인 정사각형 패턴 ─────────────────────
 * steps는 각 묶음에 이어 붙일 정사각형 수다. 막대 개수는 표시하지 않아
 * 일반항이나 정답을 그림 자체가 인쇄하지 않도록 한다. */
export function mExamSquareChainFig(steps: number[]): string {
  const safe = steps.slice(0, 4).map((n) => Math.max(1, Math.min(5, Math.trunc(n))));
  const panelW = 82;
  const gap = 8;
  const W = safe.length * panelW + Math.max(0, safe.length - 1) * gap + 12;
  let out = "";
  safe.forEach((count, panelIndex) => {
    const x0 = 6 + panelIndex * (panelW + gap);
    const side = Math.min(26, 66 / count);
    const chainW = side * count;
    const start = x0 + (panelW - chainW) / 2;
    for (let i = 0; i < count; i += 1) {
      out += `<rect x="${(start + i * side).toFixed(1)}" y="24" width="${side.toFixed(1)}" height="${side.toFixed(1)}" fill="${NAVY_SOFT}" fill-opacity=".16" stroke="${NAVY}" stroke-width="2"/>`;
    }
    out += `<text x="${x0 + panelW / 2}" y="72" text-anchor="middle" font-size="10.5" font-weight="800" fill="${INK}">${count}개</text>`;
  });
  return svg(`0 0 ${W} 84`, "이어 붙인 정사각형 패턴", out);
}

/* ── 문자와 식: 항의 묶음을 올린 양팔저울 ───────────────────
 * boxes는 문자 상자 수, weight는 수로 된 추의 라벨이다. 주어진 등식을
 * 시각화할 뿐 해를 색이나 위치로 강조하지 않는다. */
export function mExamBalanceFig(opts: {
  leftBoxes: number;
  rightBoxes: number;
  leftWeight?: string;
  rightWeight?: string;
  boxLabel?: string;
}): string {
  const boxLabel = opts.boxLabel ?? "x";
  const items = (cx: number, boxes: number, weight?: string): string => {
    const parts: string[] = [];
    const count = Math.max(0, Math.min(4, Math.trunc(boxes)));
    const total = count + (weight ? 1 : 0);
    const start = cx - ((Math.max(total, 1) - 1) * 25) / 2;
    for (let i = 0; i < count; i += 1) {
      const x = start + i * 25;
      parts.push(`<rect x="${x - 10}" y="63" width="20" height="20" rx="4" fill="${NAVY_SOFT}" stroke="${NAVY}" stroke-width="1.4"/>`);
      parts.push(`<text x="${x}" y="77" text-anchor="middle" font-size="11" font-weight="900" font-style="italic" fill="#FFFFFF">${boxLabel}</text>`);
    }
    if (weight) {
      const x = start + count * 25;
      parts.push(`<path d="M${x - 11} 83 L${x - 8} 65 Q${x} 58 ${x + 8} 65 L${x + 11} 83 Z" fill="#FFE4A8" stroke="#C88720" stroke-width="1.4"/>`);
      parts.push(`<text x="${x}" y="77" text-anchor="middle" font-size="8.5" font-weight="900" fill="#7A4B00">${weight}</text>`);
    }
    return parts.join("");
  };
  const beamY = 43;
  const out =
    `<path d="M150 ${beamY} L138 126 L162 126 Z" fill="#D6A76A" stroke="#815B2C" stroke-width="1.4"/>` +
    `<rect x="106" y="124" width="88" height="7" rx="3.5" fill="#C18D52"/>` +
    `<rect x="54" y="${beamY - 3}" width="192" height="6" rx="3" fill="#9AA7B8" stroke="#526174" stroke-width="1.2"/>` +
    `<circle cx="150" cy="${beamY}" r="5" fill="#526174"/>` +
    `<line x1="60" y1="${beamY + 3}" x2="48" y2="88" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<line x1="60" y1="${beamY + 3}" x2="72" y2="88" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<line x1="240" y1="${beamY + 3}" x2="228" y2="88" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<line x1="240" y1="${beamY + 3}" x2="252" y2="88" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<ellipse cx="60" cy="91" rx="43" ry="7" fill="#E7ECF3" stroke="#718096" stroke-width="1.3"/>` +
    `<ellipse cx="240" cy="91" rx="43" ry="7" fill="#E7ECF3" stroke="#718096" stroke-width="1.3"/>` +
    items(60, opts.leftBoxes, opts.leftWeight) +
    items(240, opts.rightBoxes, opts.rightWeight);
  return svg("0 0 300 138", "수평을 이룬 양팔저울", out);
}

 /* ── m1u4 기본 도형 시험 그림 ───────────────────────────────
 * 모든 helper는 점 이름과 구조를 매개변수로 받고, 색·굵기로 정답을 강조하지 않는다.
 * aria-label은 대상 종류만 말하며 점 이름, 수치, 정답 관계는 낭독하지 않는다. */

export function m4AngleExamFig(opts: { left: string; vertex: string; right: string; degrees?: number }): string {
  const cx = 150, cy = 118, r = 92;
  const a0 = 18;
  const a1 = a0 + (opts.degrees ?? 68);
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  let out = `<line x1="${cx}" y1="${cy}" x2="${p0.x.toFixed(1)}" y2="${p0.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>`;
  out += `<line x1="${cx}" y1="${cy}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>`;
  out += angleArc(cx, cy, 34, a0, a1, GEO.hlA, undefined, { fill: true });
  out += dot(cx, cy) + dot(p0.x, p0.y) + dot(p1.x, p1.y);
  out += ptLabel(p0.x, p0.y, opts.right, 10, 4) + ptLabel(cx, cy, opts.vertex, 0, 18) + ptLabel(p1.x, p1.y, opts.left, -8, -7);
  return svg("0 0 300 165", "두 반직선이 한 점에서 만나는 각 그림", out);
}

export function m4PerpDistanceFig(opts: { point: string; foot: string; otherA: string; otherB: string }): string {
  const py = 38, ly = 144;
  const px = 82, hx = 82, jx = 174, kx = 252;
  let out = `<line x1="28" y1="${ly}" x2="276" y2="${ly}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>`;
  out += `<line x1="${px}" y1="${py}" x2="${hx}" y2="${ly}" stroke="${GEO.ink}" stroke-width="2.5"/>`;
  out += `<line x1="${px}" y1="${py}" x2="${jx}" y2="${ly}" stroke="${GEO.soft}" stroke-width="2.2"/>`;
  out += `<line x1="${px}" y1="${py}" x2="${kx}" y2="${ly}" stroke="${GEO.soft}" stroke-width="2.2"/>`;
  out += rightMark(hx, ly, 0, 12, GEO.ink);
  out += dot(px, py) + dot(hx, ly) + dot(jx, ly) + dot(kx, ly);
  out += ptLabel(px, py, opts.point, 0, -10) + ptLabel(hx, ly, opts.foot, 0, 19) + ptLabel(jx, ly, opts.otherA, 0, 19) + ptLabel(kx, ly, opts.otherB, 0, 19);
  out += `<text x="276" y="136" text-anchor="end" font-size="12" font-style="italic" fill="${GEO.soft}">l</text>`;
  return svg("0 0 300 172", "한 점에서 직선 위 여러 점을 이은 선분 그림", out);
}

export function m4BoxRelationsFig(labels: [string, string, string, string, string, string, string, string]): string {
  const [A, B, C, D, E, F, G, H] = labels;
  const p = {
    A: [112, 34], B: [58, 76], C: [168, 76], D: [220, 34],
    E: [112, 142], F: [58, 184], G: [168, 184], H: [220, 142],
  } as const;
  const edge = (u: keyof typeof p, v: keyof typeof p, dash = false) =>
    `<line x1="${p[u][0]}" y1="${p[u][1]}" x2="${p[v][0]}" y2="${p[v][1]}" stroke="${GEO.ink}" stroke-width="2.5"${dash ? ' stroke-dasharray="6 5"' : ""} stroke-linecap="round"/>`;
  let out = edge("B", "C") + edge("C", "G") + edge("G", "F") + edge("F", "B");
  out += edge("A", "B") + edge("D", "C") + edge("H", "G") + edge("E", "F");
  out += edge("A", "D", true) + edge("A", "E", true) + edge("E", "H", true) + edge("D", "H", true);
  const names = { A, B, C, D, E, F, G, H };
  const offsets: Record<keyof typeof p, [number, number]> = { A: [0, -9], B: [-10, 2], C: [10, 2], D: [0, -9], E: [0, 18], F: [-10, 12], G: [10, 12], H: [10, 3] };
  for (const key of Object.keys(p) as Array<keyof typeof p>) out += dot(p[key][0], p[key][1], GEO.pt, 3.2) + ptLabel(p[key][0], p[key][1], names[key], offsets[key][0], offsets[key][1]);
  return svg("0 0 280 210", "보이는 모서리와 가려진 모서리가 있는 직육면체 그림", out);
}

export function m4TransversalExamFig(opts: { upper: string; lower: string; cross: string; labels: [string, string, string, string, string, string, string, string] }): string {
  const [a, b, c, d, e, f, g, h] = opts.labels;
  let out = `<line x1="24" y1="58" x2="278" y2="72" stroke="${GEO.ink}" stroke-width="2.8"/>`;
  out += `<line x1="20" y1="150" x2="276" y2="136" stroke="${GEO.ink}" stroke-width="2.8"/>`;
  out += `<line x1="116" y1="18" x2="190" y2="184" stroke="${GEO.ink}" stroke-width="2.8"/>`;
  const txt = (x: number, y: number, s: string) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="13" font-weight="800" fill="${GEO.ink}">${s}</text>`;
  out += txt(128, 47, a) + txt(157, 49, b) + txt(163, 83, c) + txt(133, 82, d);
  out += txt(165, 123, e) + txt(194, 122, f) + txt(199, 154, g) + txt(169, 157, h);
  out += `<text x="278" y="61" text-anchor="end" font-size="12" font-style="italic" fill="${GEO.soft}">${opts.upper}</text>`;
  out += `<text x="276" y="132" text-anchor="end" font-size="12" font-style="italic" fill="${GEO.soft}">${opts.lower}</text>`;
  out += `<text x="194" y="182" font-size="12" font-style="italic" fill="${GEO.soft}">${opts.cross}</text>`;
  return svg("0 0 300 194", "한 직선이 두 직선을 만날 때 생기는 여덟 각 그림", out);
}

export function m4ConstructionBisectorFig(opts: { a: string; b: string; m: string; n: string }): string {
  const ax = 76, bx = 224, y = 104;
  const mx = 150, my = 38, ny = 170;
  const r = Math.hypot(mx - ax, my - y);
  let out = `<line x1="${ax}" y1="${y}" x2="${bx}" y2="${y}" stroke="${GEO.ink}" stroke-width="3"/>`;
  out += `<path d="M${mx} ${my} A${r} ${r} 0 0 1 ${mx} ${ny}" stroke="${GEO.hlB}" stroke-width="2" fill="none" stroke-dasharray="5 4"/>`;
  out += `<path d="M${mx} ${my} A${r} ${r} 0 0 0 ${mx} ${ny}" stroke="${GEO.hlB}" stroke-width="2" fill="none" stroke-dasharray="5 4"/>`;
  out += `<line x1="${mx}" y1="20" x2="${mx}" y2="188" stroke="${GEO.ink}" stroke-width="2.7"/>`;
  out += rightMark(mx, y, 0, 11, GEO.ink);
  out += dot(ax, y) + dot(bx, y) + dot(mx, my) + dot(mx, ny);
  out += ptLabel(ax, y, opts.a, 0, 18) + ptLabel(bx, y, opts.b, 0, 18) + ptLabel(mx, my, opts.m, 13, 0) + ptLabel(mx, ny, opts.n, 13, 7);
  return svg("0 0 300 202", "두 끝점을 중심으로 그린 원호와 두 교점을 이은 직선 그림", out);
}

export function m4TriangleConditionFig(opts: { a: string; b: string; c: string; mode: "sas" | "asa" }): string {
  const A = { x: 146, y: 34 }, B = { x: 50, y: 164 }, C = { x: 252, y: 164 };
  let out = `<path d="M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y} Z" stroke="${GEO.ink}" stroke-width="3" fill="#F8FAFC"/>`;
  out += dot(A.x, A.y) + dot(B.x, B.y) + dot(C.x, C.y);
  out += ptLabel(A.x, A.y, opts.a, 0, -10) + ptLabel(B.x, B.y, opts.b, -9, 14) + ptLabel(C.x, C.y, opts.c, 9, 14);
  if (opts.mode === "sas") {
    out += tickMark(A.x, A.y, B.x, B.y, 1, GEO.hlB) + tickMark(A.x, A.y, C.x, C.y, 2, GEO.hlB);
    out += angleArc(A.x, A.y, 30, 233, 307, GEO.hlA, undefined, { fill: true });
  } else {
    out += tickMark(B.x, B.y, C.x, C.y, 1, GEO.hlB);
    out += angleArc(B.x, B.y, 27, 0, 54, GEO.hlA, undefined, { fill: true }) + angleArc(C.x, C.y, 27, 126, 180, GEO.hlC, undefined, { fill: true });
  }
  return svg("0 0 300 194", "삼각형에 주어진 변과 각의 위치를 표시한 그림", out);
}

export function m4CongruenceExamFig(opts: { left: [string, string, string]; right: [string, string, string] }): string {
  const tri = (ox: number, names: [string, string, string], flip = false) => {
    const A = { x: ox + 58, y: 28 }, B = { x: ox + (flip ? 108 : 12), y: 142 }, C = { x: ox + (flip ? 12 : 108), y: 142 };
    let s = `<path d="M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y} Z" stroke="${GEO.ink}" stroke-width="2.7" fill="#F8FAFC"/>`;
    s += tickMark(A.x, A.y, B.x, B.y, 1, GEO.hlB) + tickMark(A.x, A.y, C.x, C.y, 2, GEO.hlB);
    const a0 = angleOf(A.x, A.y, B.x, B.y);
    const a1 = angleOf(A.x, A.y, C.x, C.y);
    s += angleArc(A.x, A.y, 25, Math.min(a0, a1), Math.max(a0, a1), GEO.hlA, undefined, { fill: true });
    s += ptLabel(A.x, A.y, names[0], 0, -9) + ptLabel(B.x, B.y, names[1], flip ? 9 : -9, 14) + ptLabel(C.x, C.y, names[2], flip ? -9 : 9, 14);
    return s;
  };
  return svg("0 0 300 172", "두 삼각형에 대응하는 두 변과 끼인각을 표시한 그림", tri(14, opts.left) + tri(158, opts.right, true));
}

export function m4SurveyFig(opts: { mode: "reflect" | "cross" | "offset"; labels: string[] }): string {
  if (opts.mode === "cross") {
    const [A, B, O, C, D] = opts.labels;
    const pA = { x: 48, y: 36 }, pB = { x: 54, y: 166 }, pO = { x: 150, y: 101 }, pC = { x: 246, y: 36 }, pD = { x: 240, y: 166 };
    let out = `<line x1="${pA.x}" y1="${pA.y}" x2="${pD.x}" y2="${pD.y}" stroke="${GEO.ink}" stroke-width="2.8"/>`;
    out += `<line x1="${pB.x}" y1="${pB.y}" x2="${pC.x}" y2="${pC.y}" stroke="${GEO.ink}" stroke-width="2.8"/>`;
    out += tickMark(pA.x, pA.y, pO.x, pO.y, 1, GEO.hlB) + tickMark(pO.x, pO.y, pC.x, pC.y, 1, GEO.hlB);
    out += tickMark(pB.x, pB.y, pO.x, pO.y, 2, GEO.hlC) + tickMark(pO.x, pO.y, pD.x, pD.y, 2, GEO.hlC);
    out += angleArc(pO.x, pO.y, 25, 146, 214, GEO.hlA, undefined, { fill: true }) + angleArc(pO.x, pO.y, 25, 326, 34, GEO.hlA, undefined, { fill: true });
    for (const [pt, name, dx, dy] of [[pA, A, -8, -6], [pB, B, -9, 14], [pO, O, 0, -10], [pC, C, 8, -6], [pD, D, 9, 14]] as const) out += dot(pt.x, pt.y) + ptLabel(pt.x, pt.y, name, dx, dy);
    return svg("0 0 300 196", "두 직선이 만나 생긴 두 삼각형의 대응 표시 그림", out);
  }
  if (opts.mode === "reflect") {
    const [P, Q, X, Y] = opts.labels;
    const p = { x: 76, y: 104 }, q = { x: 224, y: 104 }, x = { x: 146, y: 24 }, y = { x: 154, y: 184 };
    let out = `<path d="M${p.x} ${p.y} L${x.x} ${x.y} L${q.x} ${q.y} L${y.x} ${y.y} Z" stroke="${GEO.ink}" stroke-width="2.6" fill="none"/>`;
    out += `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="${GEO.ink}" stroke-width="3"/>`;
    out += angleArc(p.x, p.y, 24, 0, 48, GEO.hlA, undefined, { fill: true }) + angleArc(p.x, p.y, 24, 312, 360, GEO.hlA, undefined, { fill: true });
    out += angleArc(q.x, q.y, 24, 132, 180, GEO.hlB, undefined, { fill: true }) + angleArc(q.x, q.y, 24, 180, 228, GEO.hlB, undefined, { fill: true });
    for (const [pt, name, dx, dy] of [[p, P, -9, 4], [q, Q, 9, 4], [x, X, 0, -8], [y, Y, 0, 18]] as const) out += dot(pt.x, pt.y) + ptLabel(pt.x, pt.y, name, dx, dy);
    return svg("0 0 300 208", "공통 선분의 양쪽에 놓인 두 삼각형의 대응각 표시 그림", out);
  }
  const [X, A, B, Y, C, D] = opts.labels;
  const t1 = [{ x: 32, y: 154 }, { x: 84, y: 36 }, { x: 138, y: 154 }];
  const t2 = [{ x: 166, y: 154 }, { x: 218, y: 36 }, { x: 272, y: 154 }];
  let out = `<path d="M${t1[0].x} ${t1[0].y} L${t1[1].x} ${t1[1].y} L${t1[2].x} ${t1[2].y} Z" stroke="${GEO.ink}" stroke-width="2.6" fill="none"/>`;
  out += `<path d="M${t2[0].x} ${t2[0].y} L${t2[1].x} ${t2[1].y} L${t2[2].x} ${t2[2].y} Z" stroke="${GEO.ink}" stroke-width="2.6" fill="none"/>`;
  out += tickMark(t1[0].x, t1[0].y, t1[2].x, t1[2].y, 1, GEO.hlB) + tickMark(t2[0].x, t2[0].y, t2[2].x, t2[2].y, 1, GEO.hlB);
  out += angleArc(t1[0].x, t1[0].y, 22, 0, 66, GEO.hlA, undefined, { fill: true }) + angleArc(t2[0].x, t2[0].y, 22, 0, 66, GEO.hlA, undefined, { fill: true });
  out += angleArc(t1[2].x, t1[2].y, 22, 114, 180, GEO.hlC, undefined, { fill: true }) + angleArc(t2[2].x, t2[2].y, 22, 114, 180, GEO.hlC, undefined, { fill: true });
  const names = [[t1[1], X], [t1[0], A], [t1[2], B], [t2[1], Y], [t2[0], C], [t2[2], D]] as const;
  for (const [pt, name] of names) out += dot(pt.x, pt.y) + ptLabel(pt.x, pt.y, name, 0, pt.y < 100 ? -8 : 17);
  return svg("0 0 300 182", "서로 떨어진 두 삼각형의 대응변과 대응각 표시 그림", out);
}

/* ══════════════ m2u1 유리수의 표현과 식의 계산 ══════════════
 * 문자 라벨은 font-style="italic"만 붙인다(math.css 전역 룰이 세리프를 입힘 — font-family 직접 지정 금지).
 * 판정 결과·구할 값(높이·넓이 식 등)은 그림에 인쇄하지 않는다 — 빈칸은 ㉠·㉡·? 기호만.
 * SVG 텍스트는 mfmt 밖이므로 지수는 위첨자 유니코드(a²·10³)로 적는다. */

const ital = (s: string): string => (/[a-z]/.test(s) ? ' font-style="italic"' : "");

/** 소수점 아래 자릿수 띠(파라미터형) — int.digits… 를 한 칸씩, 자리 번호 눈금 포함.
 *  마디 표시·강조는 하지 않는다(마디 찾기가 과제인 문항의 정오 단서 방지). digits ≤ 8 권장. */
export function m2ExamDigitStripFig(int: string, digits: string): string {
  const pre = `${int}.`;
  const xC = 18 + pre.length * 10 + 4;
  const n = digits.length;
  let out = `<text x="18" y="61" font-size="15" font-weight="800" fill="${INK}">${pre}</text>`;
  for (let i = 0; i < n; i++) {
    const x = xC + i * 32;
    out +=
      `<rect x="${x}" y="38" width="26" height="34" rx="7" fill="#FFFFFF" stroke="#C9D3E0" stroke-width="1.4"/>` +
      `<text x="${x + 13}" y="61" text-anchor="middle" font-size="15" font-weight="900" fill="${INK}">${digits[i]}</text>` +
      `<text x="${x + 13}" y="88" text-anchor="middle" font-size="8.5" font-weight="700" fill="${FAINT}">${i + 1}</text>`;
  }
  out += `<text x="${xC + n * 32 + 4}" y="61" font-size="15" font-weight="800" fill="${FAINT}">…</text>`;
  return svg(`0 0 ${xC + n * 32 + 30} 96`, "소수점 아래 자릿수를 차례로 적은 띠", out);
}

/** 유한소수 판별 순서도(파라미터형) — 분수 → 기약분수 → 분모 소인수 → 갈림 ㉠/㉡.
 *  결론 칸은 ㉠·㉡ 기호만(정오 미인쇄, geoCycleQuizFig 계보). fac 예: "2²×3". */
export function m2ExamJudgeFlowFig(o: { n1: string; d1: string; n2: string; d2: string; fac: string }): string {
  const frac = (n: string, d: string, top: number): string => {
    const bw = Math.max(26, Math.max(n.length, d.length) * 8.5 + 8);
    return (
      `<text x="155" y="${top + 20}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${INK}">${n}</text>` +
      `<line x1="${155 - bw / 2}" y1="${top + 26}" x2="${155 + bw / 2}" y2="${top + 26}" stroke="${INK}" stroke-width="1.5"/>` +
      `<text x="155" y="${top + 42}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${INK}">${d}</text>`
    );
  };
  const box = (top: number, h: number): string =>
    `<rect x="110" y="${top}" width="90" height="${h}" rx="9" fill="#FFFFFF" stroke="#C4CEDC" stroke-width="1.4"/>`;
  const cap = (label: string, midY: number): string =>
    `<text x="102" y="${midY}" text-anchor="end" font-size="9.5" font-weight="800" fill="${FAINT}">${label}</text>`;
  const arrow = (y1: number, y2: number): string =>
    `<line x1="155" y1="${y1}" x2="155" y2="${y2 - 4}" stroke="${FAINT}" stroke-width="1.6"/><path d="M150 ${y2 - 7} L155 ${y2} L160 ${y2 - 7}" fill="none" stroke="${FAINT}" stroke-width="1.6"/>`;
  let out = box(20, 52) + cap("주어진 분수", 48) + frac(o.n1, o.d1, 20) + arrow(72, 90);
  out += box(90, 52) + cap("기약분수로", 118) + frac(o.n2, o.d2, 90) + arrow(142, 160);
  out += box(160, 36) + cap("분모의 소인수", 184) + `<text x="155" y="184" text-anchor="middle" font-size="13" font-weight="900" fill="${NAVY}">${o.fac}</text>` + arrow(196, 212);
  out +=
    `<path d="M155 214 L237 240 L155 266 L73 240 Z" fill="#FDFBF3" stroke="#D9B44A" stroke-width="1.5"/>` +
    `<text x="155" y="244" text-anchor="middle" font-size="10.5" font-weight="800" fill="${INK}">소인수가 2, 5뿐?</text>`;
  out +=
    `<path d="M73 240 L44 240 L44 272" fill="none" stroke="${GREEN}" stroke-width="1.6"/><path d="M39 267 L44 274 L49 267" fill="none" stroke="${GREEN}" stroke-width="1.6"/>` +
    `<text x="56" y="233" text-anchor="middle" font-size="10" font-weight="900" fill="${GREEN}">예</text>` +
    `<path d="M237 240 L266 240 L266 272" fill="none" stroke="${ROSE}" stroke-width="1.6"/><path d="M261 267 L266 274 L271 267" fill="none" stroke="${ROSE}" stroke-width="1.6"/>` +
    `<text x="252" y="233" text-anchor="middle" font-size="10" font-weight="900" fill="${ROSE}">아니요</text>`;
  out +=
    `<rect x="14" y="278" width="120" height="40" rx="10" fill="#F4F7FE" stroke="${NAVY}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
    `<text x="74" y="303" text-anchor="middle" font-size="14" font-weight="900" fill="${NAVY}">㉠</text>` +
    `<rect x="166" y="278" width="120" height="40" rx="10" fill="#FEF5F7" stroke="${ROSE}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
    `<text x="226" y="303" text-anchor="middle" font-size="14" font-weight="900" fill="${ROSE}">㉡</text>`;
  return svg("0 0 300 330", "분수를 소수로 나타낼 때의 판별 순서도(결론 칸은 기호로 가림)", out);
}

/** 곱 나열 칩 스트립(파라미터형) — top 칩들을 ×로 잇고, bot이 있으면 분수 꼴(가로줄 아래).
 *  칩 라벨은 문자·수 혼용("2"·"a"). 각 줄 6칩 이하. */
export function m2ExamPowStripFig(o: { top: string[]; bot?: string[] }): string {
  const row = (arr: string[], cy: number, col: string): string => {
    const w = arr.length * 40 - 12;
    const x0 = 150 - w / 2 + 14;
    let g = "";
    arr.forEach((s, i) => {
      const cx = x0 + i * 40;
      g +=
        `<circle cx="${cx}" cy="${cy}" r="14" fill="#FFFFFF" stroke="${col}" stroke-width="1.8"/>` +
        `<text x="${cx}" y="${cy + 4.5}" text-anchor="middle" font-size="13.5" font-weight="900"${ital(s)} fill="${col}">${s}</text>`;
      if (i < arr.length - 1) g += `<text x="${cx + 20}" y="${cy + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="${FAINT}">×</text>`;
    });
    return g;
  };
  if (!o.bot) return svg("0 0 300 88", "칩으로 나열한 곱", row(o.top, 44, NAVY));
  const out =
    row(o.top, 36, NAVY) +
    `<line x1="48" y1="78" x2="252" y2="78" stroke="${INK}" stroke-width="1.8"/>` +
    row(o.bot, 120, ROSE);
  return svg("0 0 300 156", "위아래로 나열한 칩 곱을 분수 꼴로 나타낸 그림", out);
}

/** 문자 치수 분배 넓이 그림(파라미터형) — 세로 h, 가로 (w1+w2) 직사각형을 점선으로 가른다.
 *  넓이 식은 인쇄하지 않는다(정답 유출 방지) — 변 라벨만. */
export function m2ExamRectSplitFig(o: { h: string; w1: string; w2: string }): string {
  const W1 = 140;
  const W2 = 92;
  const HT = 92;
  const x0 = 36;
  const y0 = 40;
  const out =
    `<rect x="${x0}" y="${y0}" width="${W1}" height="${HT}" fill="#F1F5FF" stroke="${NAVY}" stroke-width="1.8"/>` +
    `<rect x="${x0 + W1}" y="${y0}" width="${W2}" height="${HT}" fill="#FFF7ED" stroke="#F08C00" stroke-width="1.8"/>` +
    `<line x1="${x0 + W1}" y1="${y0 - 6}" x2="${x0 + W1}" y2="${y0 + HT + 6}" stroke="${INK}" stroke-width="1.4" stroke-dasharray="5 4"/>` +
    `<text x="${x0 - 13}" y="${y0 + HT / 2 + 4}" text-anchor="middle" font-size="13" font-weight="800"${ital(o.h)} fill="${INK}">${o.h}</text>` +
    `<text x="${x0 + W1 / 2}" y="${y0 - 10}" text-anchor="middle" font-size="13" font-weight="800"${ital(o.w1)} fill="${NAVY}">${o.w1}</text>` +
    `<text x="${x0 + W1 + W2 / 2}" y="${y0 - 10}" text-anchor="middle" font-size="13" font-weight="800"${ital(o.w2)} fill="#F08C00">${o.w2}</text>` +
    `<path d="M ${x0} ${y0 + HT + 14} L ${x0 + W1 + W2} ${y0 + HT + 14}" stroke="${FAINT}" stroke-width="1.3"/>` +
    `<text x="${x0 + (W1 + W2) / 2}" y="${y0 + HT + 31}" text-anchor="middle" font-size="11.5" font-weight="800" font-style="italic" fill="${FAINT}">${o.w1}+${o.w2}</text>`;
  return svg("0 0 300 186", "직사각형을 두 조각으로 가른 넓이 그림", out);
}

/** 넓이가 주어진 직사각형(파라미터형) — 넓이·가로는 인쇄(주어진 값), 세로는 ㉠ 기호로 가린다.
 *  (다항식)÷(단항식) 거꾸로 재기 문항용. area 예: "12a²+8ab". */
export function m2ExamRectAreaFig(o: { area: string; w: string; hLabel?: string }): string {
  const hl = o.hLabel ?? "㉠";
  const out =
    `<rect x="52" y="44" width="208" height="96" fill="#F6F9FF" stroke="${NAVY}" stroke-width="1.8"/>` +
    `<text x="156" y="84" text-anchor="middle" font-size="10.5" font-weight="700" fill="${FAINT}">넓이</text>` +
    `<text x="156" y="106" text-anchor="middle" font-size="14.5" font-weight="900" font-style="italic" fill="${NAVY}">${o.area}</text>` +
    `<path d="M52 150 h208 M52 144 v12 M260 144 v12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="156" y="170" text-anchor="middle" font-size="13" font-weight="800"${ital(o.w)} fill="${INK}">${o.w}</text>` +
    `<rect x="14" y="80" width="30" height="24" rx="8" fill="#FDF0F1" stroke="#E8434F" stroke-width="1.4" stroke-dasharray="4 3"/>` +
    `<text x="29" y="97" text-anchor="middle" font-size="13" font-weight="900" fill="#C4303C">${hl}</text>`;
  return svg("0 0 300 182", "넓이와 가로가 적힌 직사각형(세로는 기호로 가림)", out);
}

/** 직육면체(파라미터형) — 가로 w·세로(깊이) d·높이 h 문자 라벨, vol을 주면 부피 카드.
 *  구하는 값의 자리에는 "㉠"·"?"를 넣어 호출한다(식 인쇄 금지). */
export function m2ExamBoxFig(o: { w: string; d: string; h: string; vol?: string }): string {
  let out =
    `<path d="M46 72 L96 42 L246 42 L196 72 Z" fill="#E7EEFB" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<path d="M196 72 L246 42 L246 142 L196 172 Z" fill="#DCE6F8" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<rect x="46" y="72" width="150" height="100" fill="#F1F5FF" stroke="${INK}" stroke-width="1.8"/>` +
    `<path d="M46 182 h150 M46 176 v12 M196 176 v12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="121" y="201" text-anchor="middle" font-size="13" font-weight="800"${ital(o.w)} fill="${INK}">${o.w}</text>` +
    `<path d="M204 178 L254 148" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="242" y="174" text-anchor="middle" font-size="13" font-weight="800"${ital(o.d)} fill="${INK}">${o.d}</text>` +
    `<path d="M32 72 v100 M26 72 h12 M26 172 h12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="16" y="126" text-anchor="middle" font-size="13" font-weight="800"${ital(o.h)} fill="${o.h === "㉠" || o.h === "?" ? "#C4303C" : INK}">${o.h}</text>`;
  if (o.vol)
    out +=
      `<rect x="250" y="86" width="88" height="40" rx="10" fill="#FFFFFF" stroke="#D6DEEA" stroke-width="1.3"/>` +
      `<text x="294" y="102" text-anchor="middle" font-size="10.5" font-weight="700" fill="${FAINT}">부피</text>` +
      `<text x="294" y="119" text-anchor="middle" font-size="13" font-weight="900" font-style="italic" fill="${NAVY}">${o.vol}</text>`;
  return svg("0 0 344 212", "가로·세로·높이가 문자로 적힌 직육면체", out);
}

/** 원기둥(파라미터형) — 밑면 반지름 r·높이 h 문자 라벨, vol을 주면 부피 카드. */
export function m2ExamCylFig(o: { r: string; h: string; vol?: string }): string {
  let out =
    `<path d="M58 54 L58 152 A62 17 0 0 0 182 152 L182 54" fill="#F1F5FF" stroke="${INK}" stroke-width="1.8"/>` +
    `<path d="M58 152 A62 17 0 0 1 182 152" fill="none" stroke="${FAINT}" stroke-width="1.3" stroke-dasharray="5 4"/>` +
    `<ellipse cx="120" cy="54" rx="62" ry="17" fill="#EAF1FC" stroke="${INK}" stroke-width="1.6"/>` +
    `<circle cx="120" cy="54" r="2.2" fill="${INK}"/>` +
    `<line x1="120" y1="54" x2="182" y2="54" stroke="${NAVY}" stroke-width="1.6"/>` +
    `<text x="151" y="46" text-anchor="middle" font-size="13" font-weight="800"${ital(o.r)} fill="${NAVY}">${o.r}</text>` +
    `<path d="M198 54 v98 M192 54 h12 M192 152 h12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="216" y="108" text-anchor="middle" font-size="13" font-weight="800"${ital(o.h)} fill="${INK}">${o.h}</text>`;
  if (o.vol)
    out +=
      `<rect x="230" y="84" width="86" height="40" rx="10" fill="#FFFFFF" stroke="#D6DEEA" stroke-width="1.3"/>` +
      `<text x="273" y="100" text-anchor="middle" font-size="10.5" font-weight="700" fill="${FAINT}">부피</text>` +
      `<text x="273" y="117" text-anchor="middle" font-size="13" font-weight="900" font-style="italic" fill="${NAVY}">${o.vol}</text>`;
  return svg("0 0 322 192", "밑면의 반지름과 높이가 문자로 적힌 원기둥", out);
}

/** 사다리꼴(파라미터형) — 윗변·아랫변·높이 문자 라벨(높이는 오른쪽 점선). */
export function m2ExamTrapFig(o: { top: string; bot: string; h: string }): string {
  const out =
    `<path d="M96 48 L210 48 L258 152 L46 152 Z" fill="#F4F8FF" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
    `<line x1="210" y1="48" x2="210" y2="152" stroke="${FAINT}" stroke-width="1.5" stroke-dasharray="5 4"/>` +
    `<path d="M204 152 L204 146 L210 146" fill="none" stroke="${FAINT}" stroke-width="1.3"/>` +
    `<text x="153" y="38" text-anchor="middle" font-size="13" font-weight="800"${ital(o.top)} fill="${NAVY}">${o.top}</text>` +
    `<text x="152" y="173" text-anchor="middle" font-size="13" font-weight="800"${ital(o.bot)} fill="${INK}">${o.bot}</text>` +
    `<text x="224" y="104" text-anchor="middle" font-size="13" font-weight="800"${ital(o.h)} fill="${ROSE}">${o.h}</text>`;
  return svg("0 0 300 188", "윗변·아랫변·높이가 문자로 적힌 사다리꼴", out);
}

/* ══════════════ m2u2 부등식과 연립방정식 ══════════════
 * 격자 그림에 직선을 긋지 않는다(일차함수는 중2 Ⅲ 선행 — crossLab 점 관행). 해 점은 점·고리만.
 * 수직선 해 표시(○●+방향 화살)는 mathFigures2 solLineFig(kind, v)를 재사용한다(v는 정수).
 * 구할 값·판정 결과는 ㉠·?만 인쇄, aria는 중립 서술(값·정오 낭독 금지). 식 문자열의 뺄셈은 U+2212. */

/** 수직선 구간 띠(파라미터형) — lo~hi를 step 간격 눈금으로 깔고, 그 위에 반열린 구간 띠를 얹는다.
 *  to가 null이면 오른쪽 끝까지(이상~). mark는 띠 판독용 값 점(정오 문구 없이 위치만). */
export function m2ExamRangeBandFig(o: {
  lo: number;
  hi: number;
  step: number;
  bands: Array<{ from: number; to: number | null; label: string }>;
  unit: string;
  mark?: { v: number; label: string };
}): string {
  const X0 = 30;
  const X1 = 330;
  const x = (v: number): number => X0 + ((v - o.lo) / (o.hi - o.lo)) * (X1 - X0);
  const PAL = [
    ["#F1F5FF", NAVY],
    ["#FFF7ED", "#F08C00"],
    ["#F2FBF6", GREEN],
    ["#FEF5F7", ROSE],
  ] as const;
  let out = "";
  o.bands.forEach((b, i) => {
    const [fillC, strokeC] = PAL[i % PAL.length];
    const xa = x(b.from);
    const xb = b.to === null ? X1 + 8 : x(b.to);
    out +=
      `<rect x="${xa}" y="64" width="${xb - xa}" height="32" rx="8" fill="${fillC}" stroke="${strokeC}" stroke-width="1.4"/>` +
      `<text x="${(xa + xb) / 2}" y="85" text-anchor="middle" font-size="11.5" font-weight="800" fill="${strokeC}">${b.label}</text>` +
      `<line x1="${xa}" y1="60" x2="${xa}" y2="118" stroke="${strokeC}" stroke-width="1.3" stroke-dasharray="3 3"/>`;
  });
  out += `<line x1="${X0 - 8}" y1="114" x2="${X1 + 10}" y2="114" stroke="${INK}" stroke-width="1.8"/><path d="M${X1 + 10} 114 l-6 -3.4 v6.8 z" fill="${INK}"/>`;
  for (let v = o.lo; v <= o.hi; v += o.step)
    out +=
      `<line x1="${x(v)}" y1="110" x2="${x(v)}" y2="118" stroke="${FAINT}" stroke-width="1.4"/>` +
      `<text x="${x(v)}" y="134" text-anchor="middle" font-size="10.5" font-weight="800" fill="${INK}">${String(v).replace("-", "−")}</text>`;
  out += `<text x="${X1 + 22}" y="26" text-anchor="end" font-size="9.5" font-weight="700" fill="${FAINT}">(${o.unit})</text>`;
  if (o.mark)
    out +=
      `<circle cx="${x(o.mark.v)}" cy="114" r="5" fill="${GREEN}" stroke="#1E7A34" stroke-width="1.4"/>` +
      `<text x="${x(o.mark.v)}" y="50" text-anchor="middle" font-size="11" font-weight="800" fill="${GREEN}">${o.mark.label}</text>` +
      `<line x1="${x(o.mark.v)}" y1="54" x2="${x(o.mark.v)}" y2="106" stroke="${GREEN}" stroke-width="1.2" stroke-dasharray="3 3"/>`;
  return svg("0 0 360 142", "수직선 위에 구간을 띠로 나타낸 그림", out);
}

/** 기운 양팔 저울(파라미터형) — 접시 라벨은 짧은 식 문자열(뺄셈은 U+2212), heavier 쪽이 내려간다.
 *  부등식의 뜻·대소 비교 문항용. 정오·부등호는 인쇄하지 않는다. */
export function m2ExamTiltScaleFig(o: { left: string; right: string; heavier: "left" | "right" }): string {
  const down = o.heavier === "left" ? -1 : 1;
  const ANG = 9 * down;
  const rad = (ANG * Math.PI) / 180;
  const cx = 150;
  const cy = 96;
  const L = 96;
  const lx = cx - L * Math.cos(rad);
  const ly = cy - L * Math.sin(rad);
  const rx = cx + L * Math.cos(rad);
  const ry = cy + L * Math.sin(rad);
  const pan = (px: number, py: number, label: string, col: string): string =>
    `<line x1="${px}" y1="${py}" x2="${px - 26}" y2="${py + 26}" stroke="${FAINT}" stroke-width="1.5"/>` +
    `<line x1="${px}" y1="${py}" x2="${px + 26}" y2="${py + 26}" stroke="${FAINT}" stroke-width="1.5"/>` +
    `<path d="M${px - 32} ${py + 26} A32 13 0 0 0 ${px + 32} ${py + 26}" fill="#FFFFFF" stroke="${col}" stroke-width="1.8"/>` +
    `<text x="${px}" y="${py + 52}" text-anchor="middle" font-size="13.5" font-weight="900"${ital(label)} fill="${col}">${label}</text>`;
  const out =
    `<path d="M${cx - 16} 176 h32 l-8 -14 h-16 z" fill="#E2E8F2" stroke="${INK}" stroke-width="1.5"/>` +
    `<path d="M${cx} 162 L${cx} ${cy}" stroke="${INK}" stroke-width="2.4"/>` +
    `<line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
    `<circle cx="${cx}" cy="${cy}" r="4.6" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>` +
    pan(lx, ly, o.left, NAVY) +
    pan(rx, ry, o.right, "#F08C00");
  return svg("0 0 300 196", "양쪽 접시에 식이 놓인 양팔 저울 그림", out);
}

/** 수직선 위 문자 점(파라미터형) — 0 눈금 하나만 라벨, 나머지 점은 문자 라벨(이탤릭).
 *  pos는 -5~5 논리 좌표(등간격 아님을 허용 — 위치 관계 추론용, 값 눈금 없음). */
export function m2ExamNumPtsFig(o: { pts: Array<{ label: string; pos: number }>; zeroPos?: number }): string {
  const x = (p: number): number => 165 + p * 29;
  let out = `<line x1="20" y1="66" x2="340" y2="66" stroke="${INK}" stroke-width="1.8"/><path d="M340 66 l-6 -3.4 v6.8 z" fill="${INK}"/>`;
  const zp = o.zeroPos ?? 0;
  out +=
    `<line x1="${x(zp)}" y1="58" x2="${x(zp)}" y2="74" stroke="${INK}" stroke-width="1.6"/>` +
    `<text x="${x(zp)}" y="92" text-anchor="middle" font-size="11.5" font-weight="800" fill="${INK}">0</text>`;
  for (const p of o.pts)
    out +=
      `<circle cx="${x(p.pos)}" cy="66" r="5.2" fill="${NAVY}" stroke="#243B96" stroke-width="1.4"/>` +
      `<text x="${x(p.pos)}" y="46" text-anchor="middle" font-size="13.5" font-weight="900" font-style="italic" fill="${NAVY}">${p.label}</text>`;
  return svg("0 0 360 100", "수직선 위에 문자로 이름 붙인 점들을 나타낸 그림", out);
}

/** 모눈 해 점 그림(파라미터형) — 두 방정식의 해를 점(파랑 ●)과 고리(주황 ○)로만 찍는다.
 *  직선 금지(중2 Ⅲ 선행). mark를 주면 그 자리에 점선 원+기호만(결론 문구 인쇄 금지). max ≤ 8. */
export function m2ExamGridPairFig(o: {
  max: number;
  a: { label: string; pts: Array<[number, number]> };
  b: { label: string; pts: Array<[number, number]> };
  mark?: { at: [number, number]; label: string };
}): string {
  const S = 216;
  const P = 26;
  const U = (S - P * 2) / o.max;
  const gx = (v: number): number => 44 + P + (v - 0) * U;
  const gy = (v: number): number => S - P - (v - 0) * U + 10;
  let grid = "";
  for (let v = 0; v <= o.max; v++) {
    grid += `<line x1="${gx(0)}" y1="${gy(v)}" x2="${gx(o.max)}" y2="${gy(v)}" stroke="${GRID}" stroke-width="1"/>`;
    grid += `<line x1="${gx(v)}" y1="${gy(0)}" x2="${gx(v)}" y2="${gy(o.max)}" stroke="${GRID}" stroke-width="1"/>`;
    if (v > 0) {
      grid += `<text x="${gx(v)}" y="${gy(0) + 15}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${FAINT}">${v}</text>`;
      grid += `<text x="${gx(0) - 7}" y="${gy(v) + 3.4}" text-anchor="end" font-size="9.5" font-weight="700" fill="${FAINT}">${v}</text>`;
    }
  }
  let out =
    grid +
    `<line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(o.max) + 7}" y2="${gy(0)}" stroke="${INK}" stroke-width="1.7"/>` +
    `<line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(0)}" y2="${gy(o.max) - 7}" stroke="${INK}" stroke-width="1.7"/>` +
    `<text x="${gx(0) - 7}" y="${gy(0) + 15}" text-anchor="end" font-size="10" font-weight="800" fill="${INK}">O</text>` +
    `<text x="${gx(o.max) + 12}" y="${gy(0) + 4}" font-size="11" font-weight="800" font-style="italic" fill="${INK}">x</text>` +
    `<text x="${gx(0)}" y="${gy(o.max) - 12}" text-anchor="middle" font-size="11" font-weight="800" font-style="italic" fill="${INK}">y</text>`;
  for (const [px, py] of o.a.pts) out += `<circle cx="${gx(px)}" cy="${gy(py)}" r="5.6" fill="rgba(54,79,199,.9)" stroke="#243B96" stroke-width="1.6"/>`;
  for (const [px, py] of o.b.pts) out += `<circle cx="${gx(px)}" cy="${gy(py)}" r="9.4" fill="none" stroke="#F08C00" stroke-width="2.8"/>`;
  if (o.mark)
    out +=
      `<circle cx="${gx(o.mark.at[0])}" cy="${gy(o.mark.at[1])}" r="14" fill="none" stroke="${ROSE}" stroke-width="1.8" stroke-dasharray="4 3"/>` +
      `<text x="${gx(o.mark.at[0]) + 20}" y="${gy(o.mark.at[1]) - 12}" font-size="12.5" font-weight="900" fill="${ROSE}">${o.mark.label}</text>`;
  out +=
    `<rect x="252" y="46" width="100" height="24" rx="12" fill="#FFFFFF" stroke="#243B96" stroke-width="1.2"/>` +
    `<circle cx="266" cy="58" r="4.6" fill="rgba(54,79,199,.9)"/>` +
    `<text x="276" y="62" font-size="9.8" font-weight="800" font-style="italic" fill="${NAVY}">${o.a.label}</text>` +
    `<rect x="252" y="78" width="100" height="24" rx="12" fill="#FFFFFF" stroke="#B36200" stroke-width="1.2"/>` +
    `<circle cx="266" cy="90" r="5.2" fill="none" stroke="#F08C00" stroke-width="2.4"/>` +
    `<text x="276" y="94" font-size="9.8" font-weight="800" font-style="italic" fill="#B36200">${o.b.label}</text>`;
  return svg("0 0 360 236", "모눈 위에 두 방정식의 해를 점과 고리로 나타낸 그림", out);
}

/** 가감법 세로 정렬(파라미터형) — 두 식을 = 기준으로 줄 맞추고 연산 배지(＋/−), 결과 행은
 *  res 생략 시 ㉠로 가린다. 식은 "4x+2y=26" 꼴 문자열(뺄셈·음수는 U+2212). */
export function m2ExamElimFig(o: { top: string; bot: string; op: "+" | "−"; res?: string }): string {
  const split = (eq: string): [string, string] => {
    const i = eq.indexOf("=");
    return i < 0 ? [eq, ""] : [eq.slice(0, i), eq.slice(i + 1)];
  };
  const row = (eq: string, y: number, col: string): string => {
    const [lhs, rhs] = split(eq);
    return (
      `<text x="168" y="${y}" text-anchor="end" font-size="17" font-weight="800"${ital(lhs)} fill="${col}">${lhs}</text>` +
      `<text x="184" y="${y}" text-anchor="middle" font-size="15" font-weight="700" fill="${FAINT}">=</text>` +
      `<text x="202" y="${y}" font-size="17" font-weight="800"${ital(rhs)} fill="${col}">${rhs}</text>`
    );
  };
  let out =
    `<rect x="36" y="12" width="288" height="146" rx="14" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.4"/>` +
    row(o.top, 52, INK) +
    `<circle cx="66" cy="80" r="13" fill="#FDF4E7" stroke="#F08C00" stroke-width="1.6"/>` +
    `<text x="66" y="85.5" text-anchor="middle" font-size="15" font-weight="900" fill="#B36200">${o.op}</text>` +
    row(o.bot, 86, INK) +
    `<line x1="56" y1="100" x2="304" y2="100" stroke="${INK}" stroke-width="2"/>`;
  if (o.res) out += row(o.res, 132, NAVY);
  else
    out +=
      `<rect x="150" y="112" width="60" height="30" rx="9" fill="#F4F7FE" stroke="${NAVY}" stroke-width="1.5" stroke-dasharray="4 3"/>` +
      `<text x="180" y="133" text-anchor="middle" font-size="14" font-weight="900" fill="${NAVY}">㉠</text>`;
  return svg("0 0 360 170", "두 방정식을 세로로 나란히 적어 더하거나 빼는 그림", out);
}

/** 가로·세로 문자 직사각형(파라미터형) — 연립 활용(둘레·길이 관계)용. cap은 조건 배지 문구. */
export function m2ExamRectXYFig(o: { w: string; h: string; cap?: string }): string {
  let out =
    `<rect x="64" y="46" width="180" height="104" fill="#F6F9FF" stroke="${NAVY}" stroke-width="2"/>` +
    `<path d="M64 160 h180 M64 154 v12 M244 154 v12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="154" y="180" text-anchor="middle" font-size="13" font-weight="800"${ital(o.w)} fill="${INK}">${o.w}</text>` +
    `<path d="M50 46 v104 M44 46 h12 M44 150 h12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="32" y="102" text-anchor="middle" font-size="13" font-weight="800"${ital(o.h)} fill="${INK}">${o.h}</text>`;
  if (o.cap)
    out +=
      `<rect x="250" y="82" width="96" height="32" rx="10" fill="#FFFFFF" stroke="#D6DEEA" stroke-width="1.3"/>` +
      `<text x="298" y="103" text-anchor="middle" font-size="11.5" font-weight="800" fill="${NAVY}">${o.cap}</text>`;
  return svg("0 0 360 194", "가로와 세로가 문자로 적힌 직사각형", out);
}
