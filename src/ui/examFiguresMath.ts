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

import { GEO, angleArc, angleOf, arcPath, arrowHead, dot, lineSvg, normDeg, polar, ptLabel, rightMark, tickMark } from "./geoKit";

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

export function m4AngleExamFig(opts: {
  left: string; vertex: string; right: string; degrees?: number;
  /** m1u4 v2 확장 — 각 수치 라벨(호 곁 인쇄, 문두+그림 이중 제시용). 기존 호출 무영향. */
  degLabel?: string;
}): string {
  const cx = 150, cy = 118, r = 92;
  const a0 = 18;
  const a1 = a0 + (opts.degrees ?? 68);
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  let out = `<line x1="${cx}" y1="${cy}" x2="${p0.x.toFixed(1)}" y2="${p0.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>`;
  out += `<line x1="${cx}" y1="${cy}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>`;
  out += angleArc(cx, cy, 34, a0, a1, GEO.hlA, undefined, { fill: true });
  if (opts.degLabel) {
    const m = polar(cx, cy, 54, a0 + (a1 - a0) / 2);
    out += `<text x="${m.x.toFixed(1)}" y="${(m.y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">${fxv(opts.degLabel)}</text>`;
  }
  out += dot(cx, cy) + dot(p0.x, p0.y) + dot(p1.x, p1.y);
  out += ptLabel(p0.x, p0.y, opts.right, 10, 4) + ptLabel(cx, cy, opts.vertex, 0, 18) + ptLabel(p1.x, p1.y, opts.left, -8, -7);
  return svg("0 0 300 165", "두 반직선이 한 점에서 만나는 각 그림", out);
}

export function m4PerpDistanceFig(opts: {
  point: string; foot: string; otherA: string; otherB?: string;
  /** m1u4 v2 확장 — 길이 라벨(흰 할로): ph = 수선 P-H 곁, pa = P-otherA 곁, pb = P-otherB 곁. 기존 호출 무영향. */
  lens?: { ph?: string; pa?: string; pb?: string };
}): string {
  const py = 38, ly = 144;
  const px = 82, hx = 82, jx = 174, kx = 252;
  let out = `<line x1="28" y1="${ly}" x2="276" y2="${ly}" stroke="${GEO.ink}" stroke-width="3" stroke-linecap="round"/>`;
  out += `<line x1="${px}" y1="${py}" x2="${hx}" y2="${ly}" stroke="${GEO.ink}" stroke-width="2.5"/>`;
  out += `<line x1="${px}" y1="${py}" x2="${jx}" y2="${ly}" stroke="${GEO.soft}" stroke-width="2.2"/>`;
  if (opts.otherB) out += `<line x1="${px}" y1="${py}" x2="${kx}" y2="${ly}" stroke="${GEO.soft}" stroke-width="2.2"/>`;
  out += rightMark(hx, ly, 0, 12, GEO.ink);
  out += dot(px, py) + dot(hx, ly) + dot(jx, ly);
  out += ptLabel(px, py, opts.point, 0, -10) + ptLabel(hx, ly, opts.foot, 0, 19) + ptLabel(jx, ly, opts.otherA, 0, 19);
  if (opts.otherB) out += dot(kx, ly) + ptLabel(kx, ly, opts.otherB, 0, 19);
  const halo = `stroke="#fff" stroke-width="3.5" paint-order="stroke"`;
  const lenText = (x: number, y: number, s: string, anchor: "start" | "end") =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="800" fill="${GEO.ink}" ${halo}>${fxv(s)}</text>`;
  if (opts.lens?.ph) out += lenText(px - 9, (py + ly) / 2 + 4, opts.lens.ph, "end");
  if (opts.lens?.pa) out += lenText((px + jx) / 2 + 2, (py + ly) / 2 + 18, opts.lens.pa, "start");
  if (opts.lens?.pb && opts.otherB) out += lenText((px + kx) / 2 + 10, (py + ly) / 2 - 16, opts.lens.pb, "start");
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
  // 겨냥도 시점(앞·위·오른쪽 면이 보임) — 숨은 꼭짓점은 E 하나, 점선은 E에 모이는 세 모서리뿐.
  let out = edge("B", "C") + edge("C", "G") + edge("G", "F") + edge("F", "B");
  out += edge("A", "B") + edge("D", "C") + edge("H", "G") + edge("A", "D") + edge("D", "H");
  out += edge("A", "E", true) + edge("E", "H", true) + edge("E", "F", true);
  const names = { A, B, C, D, E, F, G, H };
  const offsets: Record<keyof typeof p, [number, number]> = { A: [0, -9], B: [-10, 2], C: [10, 2], D: [0, -9], E: [0, 18], F: [-10, 12], G: [10, 12], H: [10, 3] };
  for (const key of Object.keys(p) as Array<keyof typeof p>) out += dot(p[key][0], p[key][1], GEO.pt, 3.2) + ptLabel(p[key][0], p[key][1], names[key], offsets[key][0], offsets[key][1]);
  return svg("0 0 280 210", "보이는 모서리와 가려진 모서리가 있는 직육면체 그림", out);
}

export function m4TransversalExamFig(opts: {
  upper: string;
  lower: string;
  cross: string;
  labels: [string, string, string, string, string, string, string, string];
  parallel?: boolean;
  /** 선 위 점 이름 — ul·ur: 윗직선 양 끝, ui·li: 두 교점, ll·lr: 아랫직선 양 끝, ct·cb: 횡단선 위·아래 끝. */
  pts?: { ul?: string; ui?: string; ur?: string; ll?: string; li?: string; lr?: string; ct?: string; cb?: string };
}): string {
  // parallel: true면 두 직선을 같은 기울기로 그린다(l∥m 문항용 — 기본 구도는 의도적으로 비평행).
  const U1 = opts.parallel ? { x: 24, y: 60 } : { x: 24, y: 58 };
  const U2 = opts.parallel ? { x: 278, y: 66 } : { x: 278, y: 72 };
  const D1 = opts.parallel ? { x: 20, y: 142 } : { x: 20, y: 150 };
  const D2 = opts.parallel ? { x: 274, y: 148 } : { x: 276, y: 136 };
  const T1 = { x: 116, y: 18 }, T2 = { x: 190, y: 184 };
  const ln = (p: { x: number; y: number }, q: { x: number; y: number }) =>
    `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="${GEO.ink}" stroke-width="2.8"/>`;
  let out = ln(U1, U2) + ln(D1, D2) + ln(T1, T2);
  const txt = (x: number, y: number, s: string) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="13" font-weight="800" fill="${GEO.ink}">${fxv(s)}</text>`;
  // 여덟 라벨은 교점을 실계산해 각 부채꼴의 이등분선 위에 둔다(선에 붙은 라벨은 어느 각인지 모호 — 파일럿 검수).
  // 수치·식 라벨("76°"·"x°"·"(3x−20)°")은 해당 부채꼴 호를 함께 그려 어느 각인지 못 박는다.
  const meet = (p: { x: number; y: number }, q: { x: number; y: number }) => {
    const dx = q.x - p.x, dy = q.y - p.y;
    const ex = T2.x - T1.x, ey = T2.y - T1.y;
    const t = ((T1.x - p.x) * ey - (T1.y - p.y) * ex) / (dx * ey - dy * ex);
    return { x: p.x + dx * t, y: p.y + dy * t };
  };
  const four = (ix: number, iy: number, right: { x: number; y: number }, labs: [string, string, string, string]) => {
    const aR = angleOf(ix, iy, right.x, right.y);
    const aU = angleOf(ix, iy, T1.x, T1.y);
    const aL = aR + 180, aD = aU + 180;
    // 라벨 순서 [왼위, 오른위, 오른아래, 왼아래] = 부채꼴 [위~왼, 오른~위, 아래~오른, 왼~아래]
    const wedges: Array<[number, number]> = [[aU, aL], [aR, aU + 360], [aD, aR + 360], [aL, aD]];
    labs.forEach((lab, i) => {
      if (!lab) return;
      const [w0, w1] = wedges[i];
      const span = normDeg(w1 - w0);
      const mid = w0 + span / 2;
      const valued = lab.includes("°");
      const p = polar(ix, iy, valued ? 31 : 26, mid);
      out += txt(p.x, p.y + 5, lab);
      if (valued) out += angleArc(ix, iy, 15, w0, w0 + span, GEO.hlA);
    });
  };
  const UI = meet(U1, U2), DI = meet(D1, D2);
  four(UI.x, UI.y, U2, [opts.labels[0], opts.labels[1], opts.labels[2], opts.labels[3]]);
  four(DI.x, DI.y, D2, [opts.labels[4], opts.labels[5], opts.labels[6], opts.labels[7]]);
  out += `<text x="278" y="61" text-anchor="end" font-size="12" font-style="italic" fill="${GEO.soft}">${opts.upper}</text>`;
  out += `<text x="276" y="132" text-anchor="end" font-size="12" font-style="italic" fill="${GEO.soft}">${opts.lower}</text>`;
  out += `<text x="194" y="182" font-size="12" font-style="italic" fill="${GEO.soft}">${opts.cross}</text>`;
  if (opts.pts) {
    const P = opts.pts;
    const anchor: Array<[string | undefined, number, number, number, number]> = [
      [P.ul, 26, opts.parallel ? 60 : 58, -2, -8],
      [P.ui, 138, 64, -14, -6],
      [P.ur, 276, opts.parallel ? 66 : 72, 4, -8],
      [P.ll, 22, opts.parallel ? 142 : 150, -2, 16],
      [P.li, 171, 144, -15, 8],
      [P.lr, 274, opts.parallel ? 148 : 136, 4, 16],
      [P.ct, 116, 18, -10, 4],
      [P.cb, 190, 184, 11, 2],
    ];
    for (const [name, x, y, dx, dy] of anchor) {
      if (!name) continue;
      out += dot(x, y, GEO.pt, 3) + ptLabel(x, y, name, dx, dy);
    }
  }
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

export function m4TriangleConditionFig(opts: { a: string; b: string; c: string; mode: "sas" | "asa" | "ss" }): string {
  const A = { x: 146, y: 34 }, B = { x: 50, y: 164 }, C = { x: 252, y: 164 };
  let out = `<path d="M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y} Z" stroke="${GEO.ink}" stroke-width="3" fill="#F8FAFC"/>`;
  out += dot(A.x, A.y) + dot(B.x, B.y) + dot(C.x, C.y);
  out += ptLabel(A.x, A.y, opts.a, 0, -10) + ptLabel(B.x, B.y, opts.b, -9, 14) + ptLabel(C.x, C.y, opts.c, 9, 14);
  if (opts.mode === "ss") {
    // v2 확장: 두 변만 주어진 상태(끼인각 미지) — 각 쐐기를 그리면 정답(끼인각) 단서가 인쇄된다(경량 검산).
    out += tickMark(A.x, A.y, B.x, B.y, 1, GEO.hlB) + tickMark(A.x, A.y, C.x, C.y, 2, GEO.hlB);
  } else if (opts.mode === "sas") {
    out += tickMark(A.x, A.y, B.x, B.y, 1, GEO.hlB) + tickMark(A.x, A.y, C.x, C.y, 2, GEO.hlB);
    out += angleArc(A.x, A.y, 30, 233, 307, GEO.hlA, undefined, { fill: true });
  } else {
    out += tickMark(B.x, B.y, C.x, C.y, 1, GEO.hlB);
    out += angleArc(B.x, B.y, 27, 0, 54, GEO.hlA, undefined, { fill: true }) + angleArc(C.x, C.y, 27, 126, 180, GEO.hlC, undefined, { fill: true });
  }
  return svg("0 0 300 194", "삼각형에 주어진 변과 각의 위치를 표시한 그림", out);
}

export function m4CongruenceExamFig(opts: {
  left: [string, string, string];
  right: [string, string, string];
  /** m1u4 v2 확장 — 변 수치 라벨 [꼭짓점0-1 변, 꼭짓점0-2 변, 밑변]. 기존 호출 무영향. */
  sides?: { left?: [string?, string?, string?]; right?: [string?, string?, string?] };
  /** m1u4 v2 확장 — 꼭짓점 곁 각 수치 라벨(끼인각 자리). */
  apex?: { left?: string; right?: string };
  /** m1u4 v2 확장 — 틱·각 마크 생략(조건 나열 판별의 중립 배경용 — 마크가 조건으로 읽히는 것 방지). */
  plain?: boolean;
}): string {
  const halo = `stroke="#fff" stroke-width="3.5" paint-order="stroke"`;
  const tri = (ox: number, names: [string, string, string], flip = false, sides?: [string?, string?, string?], apexLab?: string) => {
    const A = { x: ox + 58, y: 28 }, B = { x: ox + (flip ? 108 : 12), y: 142 }, C = { x: ox + (flip ? 12 : 108), y: 142 };
    let s = `<path d="M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y} Z" stroke="${GEO.ink}" stroke-width="2.7" fill="#F8FAFC"/>`;
    if (!opts.plain) {
      s += tickMark(A.x, A.y, B.x, B.y, 1, GEO.hlB) + tickMark(A.x, A.y, C.x, C.y, 2, GEO.hlB);
      const a0 = angleOf(A.x, A.y, B.x, B.y);
      const a1 = angleOf(A.x, A.y, C.x, C.y);
      s += angleArc(A.x, A.y, 25, Math.min(a0, a1), Math.max(a0, a1), GEO.hlA, undefined, { fill: true });
    }
    s += ptLabel(A.x, A.y, names[0], 0, -9) + ptLabel(B.x, B.y, names[1], flip ? 9 : -9, 14) + ptLabel(C.x, C.y, names[2], flip ? -9 : 9, 14);
    if (sides) {
      const put = (p: { x: number; y: number }, q: { x: number; y: number }, lab: string | undefined, dx: number, dy: number, anchor: string) => {
        if (!lab) return;
        s += `<text x="${((p.x + q.x) / 2 + dx).toFixed(1)}" y="${((p.y + q.y) / 2 + dy).toFixed(1)}" text-anchor="${anchor}" font-size="11.5" font-weight="800" fill="${GEO.ink}" ${halo}>${fxv(lab)}</text>`;
      };
      put(A, B, sides[0], flip ? 9 : -9, 4, flip ? "start" : "end");
      put(A, C, sides[1], flip ? -9 : 9, 4, flip ? "end" : "start");
      put(B, C, sides[2], 0, 17, "middle");
    }
    if (apexLab) s += `<text x="${A.x}" y="${A.y + 44}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GEO.ink}" ${halo}>${fxv(apexLab)}</text>`;
    return s;
  };
  // aria는 중립 서술만 — "두 변과 끼인각" 문구는 합동 조건 명명 문항의 정답을 낭독한다(경량 검산 적발).
  return svg(
    "0 0 300 172",
    "서로 포개어지는 두 삼각형 그림",
    tri(14, opts.left, false, opts.sides?.left, opts.apex?.left) + tri(158, opts.right, true, opts.sides?.right, opts.apex?.right),
  );
}

export function m4SurveyFig(opts: {
  mode: "reflect" | "cross" | "offset";
  labels: string[];
  /** m1u4 v2 확장(cross 전용) — 강 쪽 AB·잴 수 있는 CD 선분 곁 길이 라벨(흰 할로). 기존 호출 무영향. */
  lens?: { ab?: string; cd?: string };
}): string {
  if (opts.mode === "cross") {
    const [A, B, O, C, D] = opts.labels;
    const pA = { x: 48, y: 36 }, pB = { x: 54, y: 166 }, pO = { x: 150, y: 101 }, pC = { x: 246, y: 36 }, pD = { x: 240, y: 166 };
    let out = `<line x1="${pA.x}" y1="${pA.y}" x2="${pD.x}" y2="${pD.y}" stroke="${GEO.ink}" stroke-width="2.8"/>`;
    out += `<line x1="${pB.x}" y1="${pB.y}" x2="${pC.x}" y2="${pC.y}" stroke="${GEO.ink}" stroke-width="2.8"/>`;
    out += `<line x1="${pA.x}" y1="${pA.y}" x2="${pB.x}" y2="${pB.y}" stroke="${GEO.soft}" stroke-width="2" stroke-dasharray="6 5"/>`;
    out += `<line x1="${pC.x}" y1="${pC.y}" x2="${pD.x}" y2="${pD.y}" stroke="${GEO.ink}" stroke-width="2.2"/>`;
    out += tickMark(pA.x, pA.y, pO.x, pO.y, 1, GEO.hlB) + tickMark(pO.x, pO.y, pC.x, pC.y, 1, GEO.hlB);
    out += tickMark(pB.x, pB.y, pO.x, pO.y, 2, GEO.hlC) + tickMark(pO.x, pO.y, pD.x, pD.y, 2, GEO.hlC);
    out += angleArc(pO.x, pO.y, 25, 146, 214, GEO.hlA, undefined, { fill: true }) + angleArc(pO.x, pO.y, 25, 326, 34, GEO.hlA, undefined, { fill: true });
    const halo = `stroke="#fff" stroke-width="3.5" paint-order="stroke"`;
    if (opts.lens?.ab) out += `<text x="${(pA.x + pB.x) / 2 - 9}" y="${(pA.y + pB.y) / 2 + 4}" text-anchor="end" font-size="11.5" font-weight="800" fill="${GEO.ink}" ${halo}>${fxv(opts.lens.ab)}</text>`;
    if (opts.lens?.cd) out += `<text x="${(pC.x + pD.x) / 2 + 9}" y="${(pC.y + pD.y) / 2 + 4}" text-anchor="start" font-size="11.5" font-weight="800" fill="${GEO.ink}" ${halo}>${fxv(opts.lens.cd)}</text>`;
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

/* ════════════════════════════════════════════════════════════
   m2u3(중2 Ⅲ 일차함수) 시험 전용 — 직선 그림 자체는 mathFigures2 lineFig 재사용이 1순위
   (좌표평면 직선·점·계단 세모·x=m 세로선 전부 lineFig 파라미터로, 레슨과 수치 교체 필수).
   여기엔 lineFig가 못 그리는 3종만: 대응 화살표 · 미니 그래프 고르기 · 선분 좌표평면.
   구할 값·판정 결과는 ㉠·?만 인쇄, aria는 중립 서술(값·정오 낭독 금지). 뺄셈·음수는 U+2212.
   ════════════════════════════════════════════════════════════ */

const FUNC_PAL = ["#0CA678", "#E8608A", "#3D5BC0", "#E8A93E"] as const;

/** 두 모둠 사이 대응 화살표 그림(파라미터형) — 함수 판별용. arrows는 [왼쪽 인덱스, 오른쪽 인덱스] 쌍.
 *  한 원소에서 화살표 0개(대응 없음)·2개(두 값 대응)도 그대로 그린다(함수가 아닌 사례).
 *  원소는 4개 이하 권장(세로 공간), 라벨 기본값 X·Y. */
export function m2ExamArrowMapFig(o: {
  xs: string[];
  ys: string[];
  arrows: Array<[number, number]>;
  la?: string;
  lb?: string;
}): string {
  const n = Math.max(o.xs.length, o.ys.length);
  const yAt = (i: number): number => 62 + i * 40;
  const H = yAt(n - 1) + 46;
  const cyL = 62 + ((o.xs.length - 1) * 40) / 2;
  const cyR = 62 + ((o.ys.length - 1) * 40) / 2;
  let out =
    `<ellipse cx="96" cy="${cyL}" rx="52" ry="${((o.xs.length - 1) * 40) / 2 + 27}" fill="#F2FBF7" stroke="#0CA678" stroke-width="1.6"/>` +
    `<ellipse cx="264" cy="${cyR}" rx="52" ry="${((o.ys.length - 1) * 40) / 2 + 27}" fill="#F6F9FF" stroke="${NAVY}" stroke-width="1.6"/>` +
    `<text x="96" y="24" text-anchor="middle" font-size="12.5" font-weight="900"${ital(o.la ?? "X")} fill="#087F5B">${o.la ?? "X"}</text>` +
    `<text x="264" y="24" text-anchor="middle" font-size="12.5" font-weight="900"${ital(o.lb ?? "Y")} fill="#243B96">${o.lb ?? "Y"}</text>`;
  o.xs.forEach((v, i) => {
    out += `<text x="96" y="${yAt(i) + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="${INK}">${v}</text>`;
  });
  o.ys.forEach((v, i) => {
    out += `<text x="264" y="${yAt(i) + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="${INK}">${v}</text>`;
  });
  for (const [xi, yi] of o.arrows) {
    const x1 = 152;
    const y1 = yAt(xi);
    const x2 = 208;
    const y2 = yAt(yi);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const w1 = ang + 2.65;
    const w2 = ang - 2.65;
    out +=
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5C7080" stroke-width="1.9" stroke-linecap="round"/>` +
      `<path d="M${x2} ${y2} L${(x2 + 8.5 * Math.cos(w1)).toFixed(1)} ${(y2 + 8.5 * Math.sin(w1)).toFixed(1)} M${x2} ${y2} L${(x2 + 8.5 * Math.cos(w2)).toFixed(1)} ${(y2 + 8.5 * Math.sin(w2)).toFixed(1)}" stroke="#5C7080" stroke-width="1.9" stroke-linecap="round"/>`;
  }
  return svg(`0 0 360 ${H}`, "두 모둠 사이의 대응을 화살표로 나타낸 그림", out);
}

/** 미니 그래프 고르기(①~⑤ 고정 라벨) — 눈금 없는 작은 좌표축에 직선 하나씩(방향·절편 부호·가파름만
 *  판독하는 모양 고르기 전용). vert를 주면 x=vert 세로선. |a|≤3·|b|≤2.5 권장(칸 밖 이탈 방지).
 *  shuffle:false와 세트 — 정답을 ①에 두지 않는다(그림 단계에서 정답 위치 설계, u6 관행). */
export function m2ExamLineChoicesFig(items: Array<{ a?: number; b?: number; vert?: number }>): string {
  const U = 12;
  const HW = 46;
  const HH = 40;
  let out = "";
  items.forEach((it, i) => {
    const row = i < 3 ? 0 : 1;
    const col = i < 3 ? i : i - 3;
    const x0 = (items.length <= 3 || row === 0 ? 4 : 64) + col * 120;
    const y0 = 4 + row * 108;
    const cx = x0 + 56;
    const cy = y0 + 58;
    out +=
      `<rect x="${x0}" y="${y0}" width="112" height="102" rx="10" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.3"/>` +
      `<text x="${x0 + 13}" y="${y0 + 19}" font-size="12.5" font-weight="900" fill="${INK}">${"①②③④⑤⑥"[i]}</text>` +
      `<line x1="${cx - HW}" y1="${cy}" x2="${cx + HW}" y2="${cy}" stroke="#94A3B8" stroke-width="1.3"/>` +
      `<path d="M${cx + HW} ${cy} l-5 -2.8 v5.6 z" fill="#94A3B8"/>` +
      `<line x1="${cx}" y1="${cy + HH}" x2="${cx}" y2="${cy - HH}" stroke="#94A3B8" stroke-width="1.3"/>` +
      `<path d="M${cx} ${cy - HH} l-2.8 5 h5.6 z" fill="#94A3B8"/>`;
    if (it.vert != null) {
      const lx = it.vert * U;
      out += `<line x1="${cx + lx}" y1="${cy - HH + 4}" x2="${cx + lx}" y2="${cy + HH - 4}" stroke="${FUNC_PAL[0]}" stroke-width="2.6" stroke-linecap="round"/>`;
      return;
    }
    const a = it.a ?? 1;
    const b = it.b ?? 0;
    // 로컬 px 공간에서 직선 ly = −a·lx − b·U 를 칸 상자(|lx|≤HW−4, |ly|≤HH−4)로 클리핑
    const bw = HW - 4;
    const bh = HH - 4;
    const cand: Array<[number, number]> = [];
    if (a === 0) {
      const ly = -b * U;
      if (Math.abs(ly) <= bh) cand.push([-bw, ly], [bw, ly]);
    } else {
      for (const lx of [-bw, bw]) {
        const ly = -a * lx - b * U;
        if (Math.abs(ly) <= bh + 0.01) cand.push([lx, ly]);
      }
      for (const ly of [-bh, bh]) {
        const lx = (-ly - b * U) / a;
        if (Math.abs(lx) <= bw + 0.01) cand.push([lx, ly]);
      }
    }
    const uniq: Array<[number, number]> = [];
    for (const p of cand) if (!uniq.some((q) => Math.abs(q[0] - p[0]) < 0.5 && Math.abs(q[1] - p[1]) < 0.5)) uniq.push(p);
    if (uniq.length >= 2)
      out += `<line x1="${(cx + uniq[0][0]).toFixed(1)}" y1="${(cy + uniq[0][1]).toFixed(1)}" x2="${(cx + uniq[1][0]).toFixed(1)}" y2="${(cy + uniq[1][1]).toFixed(1)}" stroke="${FUNC_PAL[0]}" stroke-width="2.6" stroke-linecap="round"/>`;
  });
  const H = items.length <= 3 ? 114 : 222;
  return svg(`0 0 360 ${H}`, "작은 좌표평면에 그린 직선 그래프 보기들", out);
}

/** 좌표평면 위 선분·점·직선 혼합(파라미터형) — 선분과 만나는 직선의 범위·움직이는 점·도형 넓이용.
 *  좌표계는 lineFig와 동일한 planeSpec(격자 전 눈금 라벨) — 선분 끝점엔 점을 함께 찍는다.
 *  직선은 lineFig 문법(a·b 또는 vert), 라벨 lx 위치의 직선 위에 얹는다. */
export function m2ExamSegPlaneFig(o: {
  min?: number;
  max?: number;
  lines?: Array<{ a?: number; b?: number; vert?: number; color?: string; dash?: boolean; label?: string; lx?: number }>;
  segs?: Array<{ x1: number; y1: number; x2: number; y2: number; color?: string; label?: string }>;
  dots?: Array<{ x: number; y: number; color?: string; label?: string; below?: boolean; left?: boolean }>;
}): string {
  const p = planeSpec({ min: o.min ?? -5, max: o.max ?? 5, size: 260 });
  let g = "";
  (o.lines ?? []).forEach((ln, i) => {
    const color = ln.color ?? FUNC_PAL[i % FUNC_PAL.length];
    if (ln.vert != null) {
      g += `<line x1="${p.px(ln.vert)}" y1="${p.py(p.min - 0.6)}" x2="${p.px(ln.vert)}" y2="${p.py(p.max + 0.6)}" stroke="${color}" stroke-width="3"${ln.dash ? ' stroke-dasharray="7 5"' : ""} stroke-linecap="round"/>`;
      if (ln.label) g += `<text x="${p.px(ln.vert) + 7}" y="${p.py(p.max - 0.8)}" font-size="11" font-weight="800" font-style="italic" fill="${color}">${ln.label}</text>`;
      return;
    }
    const a = ln.a ?? 1;
    const b = ln.b ?? 0;
    const t = p.max + 1.2;
    g += `<line x1="${p.px(-t)}" y1="${p.py(a * -t + b)}" x2="${p.px(t)}" y2="${p.py(a * t + b)}" stroke="${color}" stroke-width="3"${ln.dash ? ' stroke-dasharray="7 5"' : ""} stroke-linecap="round"/>`;
    if (ln.label) {
      const lx = ln.lx ?? 2.6;
      g += `<text x="${p.px(lx)}" y="${p.py(a * lx + b) + (a >= 0 ? -9 : 15)}" font-size="11" font-weight="800" font-style="italic" fill="${color}">${ln.label}</text>`;
    }
  });
  for (const s of o.segs ?? []) {
    const color = s.color ?? "#3D5BC0";
    g +=
      `<line x1="${p.px(s.x1)}" y1="${p.py(s.y1)}" x2="${p.px(s.x2)}" y2="${p.py(s.y2)}" stroke="${color}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<circle cx="${p.px(s.x1)}" cy="${p.py(s.y1)}" r="4.6" fill="${color}" stroke="#FFFFFF" stroke-width="1.4"/>` +
      `<circle cx="${p.px(s.x2)}" cy="${p.py(s.y2)}" r="4.6" fill="${color}" stroke="#FFFFFF" stroke-width="1.4"/>`;
    if (s.label)
      g += `<text x="${(p.px(s.x1) + p.px(s.x2)) / 2 + 9}" y="${(p.py(s.y1) + p.py(s.y2)) / 2 - 8}" font-size="11" font-weight="900" fill="${color}">${s.label}</text>`;
  }
  for (const d of o.dots ?? []) {
    const color = d.color ?? "#E8A93E";
    g += `<circle cx="${p.px(d.x)}" cy="${p.py(d.y)}" r="5" fill="${color}" stroke="#4A3208" stroke-width="1.2" opacity=".95"/>`;
    if (d.label)
      g += `<text x="${p.px(d.x) + (d.left ? -8 : 8)}"${d.left ? ' text-anchor="end"' : ""} y="${p.py(d.y) + (d.below ? 15 : -8)}" font-size="10.5" font-weight="900" fill="#334155">${d.label}</text>`;
  }
  return svg(p.vb, "좌표평면 위의 선분과 직선을 나타낸 그림", p.grid + g);
}

/** 눈금 없는 부호 판독 그래프(m2u3 v2 신설) — 부호 추론(그래프 개형 → a·b 부호, 3사 공통 단골)은
 *  눈금이 있으면 a·b 실값이 역산되어 과제가 붕괴한다. 축 화살표+원점 O+직선 하나만: 방향(기울기
 *  부호)과 y절편의 위아래만 읽힌다. a: 1 우상향 / -1 우하향, b: 1 y절편 양 / -1 음.
 *  label은 직선 옆 식 이름(라틴만 이탤릭 — 서체는 math.css의 SVG 이탤릭 규칙이 mvar로 통일). */
export function m2ExamSignLineFig(o: { a: 1 | -1; b: 1 | -1; label: string }): string {
  const cx = 120;
  const cy = 97;
  const by = cy - o.b * 30;
  const slope = o.a > 0 ? -0.62 : 0.62;
  const x1 = cx - 84;
  const x2 = cx + 84;
  const y1 = by + slope * (x1 - cx);
  const y2 = by + slope * (x2 - cx);
  const lab = o.label.replace(/[a-z]/g, (ch) => `<tspan font-style="italic">${ch}</tspan>`);
  const labX = x2 - 4;
  // 상승이 가파른 조합(a=1·b=1)에서 라벨이 위 모서리에 끼지 않게 상하 클램프
  const labY = o.a > 0 ? Math.max(14, y2 - 10) : Math.min(184, y2 + 18);
  const body =
    `<line x1="18" y1="${cy}" x2="228" y2="${cy}" stroke="#64748B" stroke-width="1.8"/>` +
    `<path d="M228 ${cy} l-7 -4 v8 z" fill="#64748B"/>` +
    `<line x1="${cx}" y1="184" x2="${cx}" y2="12" stroke="#64748B" stroke-width="1.8"/>` +
    `<path d="M${cx} 12 l-4 7 h8 z" fill="#64748B"/>` +
    `<text x="230" y="${cy + 15}" font-size="12" font-weight="800" font-style="italic" fill="#64748B">x</text>` +
    `<text x="${cx + 7}" y="20" font-size="12" font-weight="800" font-style="italic" fill="#64748B">y</text>` +
    `<text x="${cx - 7}" y="${cy + 14}" text-anchor="end" font-size="11.5" font-weight="800" fill="#64748B">O</text>` +
    `<line x1="${x1}" y1="${y1.toFixed(1)}" x2="${x2}" y2="${y2.toFixed(1)}" stroke="#0CA678" stroke-width="3" stroke-linecap="round"/>` +
    `<text x="${labX}" y="${labY.toFixed(1)}" text-anchor="end" font-size="11.5" font-weight="800" fill="#087F5B">${lab}</text>`;
  return `<svg viewBox="0 0 240 196" role="img" aria-label="좌표축 위에 직선 하나를 그린 그림">${body}</svg>`;
}

/* ════════════════════════════════════════════════════════════
   m1u2(중1 Ⅱ 문자와 식) 시험 전용 — 2026-07 개보수(그림 17문항 확충)에서 신설.
   재사용이 1순위: 저울 mExamBalanceFig(상자 ≤4 제약) · 표 mExamTableFig ·
   직사각형 m2ExamRectXYFig · 정사각형 사슬 mExamSquareChainFig. 여기엔 그 넷이
   못 그리는 6종만 추가한다. 규칙 동일: 정답·판정을 색이나 위치로 강조하지 않고,
   aria는 중립 서술만(개수·수치·정답 낭독 금지). 뺄셈·음수는 호출부가 U+2212로 넘긴다.
   ════════════════════════════════════════════════════════════ */

/** SVG text 안 라틴 문자만 이탤릭 tspan으로 — 한글·수 혼합 라벨용(ital은 통짜 이탤릭이라 부적합). */
const fxv = (s: string): string => s.replace(/[a-z]/g, (ch) => `<tspan font-style="italic">${ch}</tspan>`);

/** 단계마다 커지는 타일 배열(파라미터형) — 규칙 찾기용. stages는 [가로 칸, 세로 칸] 쌍 최대 4개.
 *  개수 라벨은 찍지 않는다(개수 나열은 문두 몫 — 그림은 "어떻게 늘어나는지" 구조만 보여 준다). */
export function mExamTileStagesFig(stages: Array<[number, number]>): string {
  const safe = stages.slice(0, 4).map(([c, r]) => [Math.max(1, Math.min(9, Math.trunc(c))), Math.max(1, Math.min(4, Math.trunc(r)))] as [number, number]);
  const maxCols = Math.max(...safe.map((s) => s[0]));
  const maxRows = Math.max(...safe.map((s) => s[1]));
  const side = Math.min(16, 80 / maxCols);
  const panelW = Math.max(84, maxCols * side + 12);
  const gap = 10;
  const W = safe.length * panelW + (safe.length - 1) * gap + 12;
  const gridH = maxRows * side;
  let out = "";
  safe.forEach(([cols, rows], pi) => {
    const x0 = 6 + pi * (panelW + gap);
    const sx = x0 + (panelW - cols * side) / 2;
    const sy = 12 + (gridH - rows * side) / 2;
    for (let r = 0; r < rows; r += 1)
      for (let c = 0; c < cols; c += 1)
        out += `<rect x="${(sx + c * side).toFixed(1)}" y="${(sy + r * side).toFixed(1)}" width="${side.toFixed(1)}" height="${side.toFixed(1)}" fill="${NAVY_SOFT}" fill-opacity=".16" stroke="${NAVY}" stroke-width="1.6"/>`;
    out += `<text x="${x0 + panelW / 2}" y="${12 + gridH + 20}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${INK}">${pi + 1}단계</text>`;
  });
  return svg(`0 0 ${W} ${12 + gridH + 30}`, "단계마다 규칙적으로 커지는 타일 배열", out);
}

/** 정사각형 테두리 바둑돌(파라미터형) — 한 변 n개짜리 빈 정사각형 배치를 나란히 보여 준다.
 *  sizes는 한 변의 돌 개수(2~6) 최대 3개. 돌 개수 라벨은 "한 변 n개"만 적는다. */
export function mExamBorderDotsFig(sizes: number[]): string {
  const safe = sizes.slice(0, 3).map((n) => Math.max(2, Math.min(6, Math.trunc(n))));
  const maxN = Math.max(...safe);
  const pitch = Math.min(17, 74 / (maxN - 1));
  const panelW = 96;
  const gap = 10;
  const W = safe.length * panelW + (safe.length - 1) * gap + 12;
  const gridH = (maxN - 1) * pitch;
  let out = "";
  safe.forEach((n, pi) => {
    const x0 = 6 + pi * (panelW + gap);
    const span = (n - 1) * pitch;
    const sx = x0 + (panelW - span) / 2;
    const sy = 15 + (gridH - span) / 2;
    for (let i = 0; i < n; i += 1)
      for (let j = 0; j < n; j += 1) {
        if (i !== 0 && j !== 0 && i !== n - 1 && j !== n - 1) continue;
        out += `<circle cx="${(sx + j * pitch).toFixed(1)}" cy="${(sy + i * pitch).toFixed(1)}" r="5" fill="#4A463F" stroke="#23211D" stroke-width="1"/>`;
      }
    out += `<text x="${x0 + panelW / 2}" y="${15 + gridH + 22}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${INK}">한 변 ${n}개</text>`;
  });
  return svg(`0 0 ${W} ${15 + gridH + 32}`, "정사각형 테두리를 따라 놓은 바둑돌 배치", out);
}

/** ㄱ자(요철) 도형 — 위 가로·왼쪽 세로 전체 길이와 파인 안쪽 세로 한 변의 라벨.
 *  모서리를 직각으로 잘라낸 도형이라 둘레는 감싸는 직사각형과 같다(그 통찰이 출제 의도). */
export function mExamLShapeFig(o: { top: string; left: string; notch?: string }): string {
  let out =
    `<polygon points="64,40 252,40 252,98 182,98 182,150 64,150" fill="#F6F9FF" stroke="${NAVY}" stroke-width="2"/>` +
    `<path d="M64 53 L77 53 L77 40" fill="none" stroke="${FAINT}" stroke-width="1.2"/>` +
    `<path d="M182 111 L195 111 L195 98" fill="none" stroke="${FAINT}" stroke-width="1.2"/>` +
    `<path d="M64 26 h188 M64 20 v12 M252 20 v12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="158" y="16" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">${fxv(o.top)}</text>` +
    `<path d="M48 40 v110 M42 40 h12 M42 150 h12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="30" y="99" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">${fxv(o.left)}</text>`;
  if (o.notch)
    out += `<text x="192" y="130" text-anchor="start" font-size="11.5" font-weight="800" fill="${INK}">${fxv(o.notch)}</text>`;
  return svg("0 0 320 168", "모서리가 직각으로 파인 도형", out);
}

/** 세 변에 길이 라벨이 붙은 삼각형(파라미터형).
 *  m1u4 v2 확장(기존 m1u2 호출 무영향) — verts: 꼭짓점 이름 [위, 왼쪽 아래, 오른쪽 아래].
 *  shape: 밑변 양 끝 실각(도) — 주면 꼭짓점을 실각으로 역산해 라벨-기하 일치 보장(뷰박스 초과 시 균일 축소).
 *  angles: 각 라벨(호+수치) — shape와 함께 써서 라벨 수치 = 실제 각을 지킨다. */
export function mExamTriSidesFig(o: {
  left: string; right: string; bottom: string;
  verts?: [string, string, string];
  shape?: { left: number; right: number };
  angles?: Partial<Record<"top" | "left" | "right", string>>;
}): string {
  let BL = { x: 46, y: 138 }, BR = { x: 262, y: 138 };
  let T = { x: 150, y: 26 };
  if (o.shape) {
    const cot = (d: number) => 1 / Math.tan((d * Math.PI) / 180);
    const cl = cot(o.shape.left), cr = cot(o.shape.right);
    let h = (BR.x - BL.x) / (cl + cr);
    if (h > 112) {
      const k = 112 / h;
      const cx = (BL.x + BR.x) / 2, half = ((BR.x - BL.x) / 2) * k;
      BL = { x: cx - half, y: 138 }; BR = { x: cx + half, y: 138 };
      h = 112;
    }
    T = { x: BL.x + h * cl, y: 138 - h };
  }
  const m4 = !!(o.verts || o.shape || o.angles);
  let out = `<polygon points="${T.x.toFixed(1)},${T.y.toFixed(1)} ${BL.x.toFixed(1)},${BL.y} ${BR.x.toFixed(1)},${BR.y}" fill="${m4 ? "#F8FAFC" : "#F6F9FF"}" stroke="${m4 ? GEO.ink : NAVY}" stroke-width="${m4 ? 2.7 : 2}"/>`;
  const mid = (p: { x: number; y: number }, q: { x: number; y: number }) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  const ml = mid(T, BL), mr = mid(T, BR), mb = mid(BL, BR);
  out +=
    `<text x="${(ml.x - 10).toFixed(1)}" y="${(ml.y + 4).toFixed(1)}" text-anchor="end" font-size="12" font-weight="800" fill="${INK}">${fxv(o.left)}</text>` +
    `<text x="${(mr.x + 10).toFixed(1)}" y="${(mr.y + 4).toFixed(1)}" text-anchor="start" font-size="12" font-weight="800" fill="${INK}">${fxv(o.right)}</text>` +
    `<text x="${mb.x.toFixed(1)}" y="${mb.y + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}">${fxv(o.bottom)}</text>`;
  if (o.angles) {
    const put = (v: { x: number; y: number }, a0: number, a1: number, s: string | undefined, color: string) => {
      if (!s) return;
      out += angleArc(v.x, v.y, 20, a0, a1, color);
      const m = polar(v.x, v.y, 34, a0 + normDeg(a1 - a0) / 2);
      out += `<text x="${m.x.toFixed(1)}" y="${(m.y + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GEO.ink}">${fxv(s)}</text>`;
    };
    put(BL, 0, angleOf(BL.x, BL.y, T.x, T.y), o.angles.left, GEO.hlA);
    put(BR, angleOf(BR.x, BR.y, T.x, T.y), 180, o.angles.right, GEO.hlB);
    put(T, angleOf(T.x, T.y, BR.x, BR.y), angleOf(T.x, T.y, BL.x, BL.y), o.angles.top, GEO.hlC);
  }
  if (o.verts) {
    out += dot(T.x, T.y) + dot(BL.x, BL.y) + dot(BR.x, BR.y);
    out += ptLabel(T.x, T.y, o.verts[0], 0, -10) + ptLabel(BL.x, BL.y, o.verts[1], -9, 15) + ptLabel(BR.x, BR.y, o.verts[2], 9, 15);
  }
  return svg("0 0 300 172", "세 변에 길이가 적힌 삼각형", out);
}

/** 거리 구간 띠(파라미터형) — 구간 분할·왕복 이동을 띠로 보여 준다.
 *  행마다 note(갈 때·올 때 등)를 왼쪽에, 구간마다 top(거리)·bot(속력) 라벨. total은 전체 거리 괄호. */
export function mExamDistBandFig(o: {
  rows: Array<{ note?: string; segs: Array<{ top?: string; bot?: string; w?: number }> }>;
  total?: string;
}): string {
  const X0 = 74;
  const X1 = 326;
  const topPad = o.total ? 40 : 14;
  const rowH = 60;
  const H = topPad + o.rows.length * rowH;
  let out = "";
  if (o.total)
    out +=
      `<path d="M${X0} ${topPad - 18} h${X1 - X0} M${X0} ${topPad - 24} v12 M${X1} ${topPad - 24} v12" stroke="${FAINT}" stroke-width="1.4"/>` +
      `<text x="${(X0 + X1) / 2}" y="${topPad - 26}" text-anchor="middle" font-size="11.5" font-weight="900" fill="${INK}">${fxv(o.total)}</text>`;
  o.rows.forEach((row, ri) => {
    const y = topPad + ri * rowH + 14;
    if (row.note)
      out += `<text x="${X0 - 10}" y="${y + 12}" text-anchor="end" font-size="11" font-weight="900" fill="${NAVY}">${row.note}</text>`;
    const weights = row.segs.map((s) => s.w ?? 1);
    const wsum = weights.reduce((a, b) => a + b, 0);
    let x = X0;
    row.segs.forEach((seg, si) => {
      const w = ((X1 - X0) * (seg.w ?? 1)) / wsum;
      out += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="16" rx="3" fill="${si % 2 ? "#FDF1E2" : "#EAF1FE"}" stroke="${si % 2 ? "#E8A93E" : NAVY}" stroke-width="1.5"/>`;
      if (seg.top)
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${y - 6}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${INK}">${fxv(seg.top)}</text>`;
      if (seg.bot)
        out += `<text x="${(x + w / 2).toFixed(1)}" y="${y + 30}" text-anchor="middle" font-size="10" font-weight="700" fill="#64748B">${fxv(seg.bot)}</text>`;
      x += w;
    });
  });
  return svg(`0 0 340 ${H}`, "이동 거리를 구간으로 나눈 띠 그림", out);
}

/** 등식의 성질 풀이 과정 상자 — 등식들을 세로로 나열하고 사이마다 조작 설명을 단다.
 *  notes에는 ㉮·㉯ 같은 빈칸 원문자를 그대로 넣는다(어떤 수·연산인지 채우는 게 과제). */
export function mExamEqStepsFig(o: { eqs: string[]; notes: string[] }): string {
  const n = o.eqs.length;
  const H = 34 + (n - 1) * 66 + 22;
  let out = `<rect x="10" y="6" width="300" height="${H - 12}" rx="14" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.4"/>`;
  o.eqs.forEach((eq, i) => {
    const y = 34 + i * 66;
    out += `<text x="120" y="${y}" text-anchor="middle" font-size="15.5" font-weight="900" fill="${INK}">${fxv(eq)}</text>`;
    if (i < n - 1 && o.notes[i]) {
      out +=
        `<path d="M92 ${y + 10} v34 m0 0 l-5 -8 m5 8 l5 -8" fill="none" stroke="${NAVY}" stroke-width="1.8" stroke-linecap="round"/>` +
        `<text x="106" y="${y + 32}" text-anchor="start" font-size="10.5" font-weight="800" fill="${NAVY}">${fxv(o.notes[i])}</text>`;
    }
  });
  return svg(`0 0 320 ${H}`, "등식을 한 단계씩 바꾸어 가는 풀이 과정", out);
}

/** 정사각형을 늘이고 줄여 만든 직사각형 — 원래 정사각형은 점선, 새 직사각형은 실선.
 *  side는 정사각형 한 변, ext는 가로로 늘인 길이, cut은 세로로 줄인 길이 라벨(x cm 등). */
export function mExamAreaMorphFig(o: { side: string; ext: string; cut: string }): string {
  const out =
    `<rect x="64" y="40" width="108" height="108" fill="none" stroke="${FAINT}" stroke-width="1.8" stroke-dasharray="6 4"/>` +
    `<rect x="64" y="40" width="144" height="74" fill="#F6F9FF" fill-opacity=".85" stroke="${NAVY}" stroke-width="2"/>` +
    `<path d="M64 26 h108 M64 20 v12 M172 20 v12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="118" y="16" text-anchor="middle" font-size="11.5" font-weight="800" fill="${INK}">${fxv(o.side)}</text>` +
    `<path d="M172 26 h36 M208 20 v12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="196" y="16" text-anchor="middle" font-size="11.5" font-weight="800" fill="${INK}">${fxv(o.ext)}</text>` +
    `<path d="M48 40 v108 M42 40 h12 M42 148 h12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="30" y="98" text-anchor="middle" font-size="11.5" font-weight="800" fill="${INK}">${fxv(o.side)}</text>` +
    `<path d="M220 114 v34 M214 114 h12 M214 148 h12" stroke="${FAINT}" stroke-width="1.4"/>` +
    `<text x="238" y="135" text-anchor="start" font-size="11.5" font-weight="800" fill="${INK}">${fxv(o.cut)}</text>`;
  return svg("0 0 300 168", "정사각형을 가로로 늘이고 세로로 줄여 만든 직사각형", out);
}

/* ════════════════════════════════════════════════════════════
   m1u4(중1 Ⅳ 기본 도형) 개보수 추가분 — 좌표 서술 문항의 그림화용.
   위 m4* 8종(각·수선·직육면체·횡단선·작도·삼각형·합동·측량)이 1순위 재사용이고,
   여기엔 그 여덟이 못 그리는 9종만 추가한다. geoKit 프리미티브(GEO·angleArc·dot·
   ptLabel·rightMark·polar)를 그대로 쓰고, 정답이 되는 관계를 색·굵기로 강조하지 않는다.
   ════════════════════════════════════════════════════════════ */

/** 두 직선이 한 점에서 교차하는 X자 그림 — 맞꼭지각·교각용.
 *  ends: 네 반직선 끝 라벨 [오른위, 왼위, 왼아래, 오른아래], vertex: 교점 라벨.
 *  angles: 네 벌어진 자리 라벨 [위, 왼, 아래, 오른] (수치 "64°"나 "∠a", 빈칸은 "").
 *  perp: true면 직각 교차 + 직각 표시. */
export function mExamXAnglesFig(o: {
  ends?: [string, string, string, string];
  vertex?: string;
  /** 네 자리 라벨 [위, 왼, 아래, 오른] — 빈 자리는 null. 호가 부채꼴 전체를 감싸므로 수치 라벨은 실각과 일치 필수 —
   *  자리 0(위) 실각 = slope2−a1(기본 152−24=128), 자리 1(왼) = 180−그 값. (2x+16)° 같은 식도 대입값 기준. */
  angles?: [string | null, string | null, string | null, string | null];
  /** 두 직선이 수직(네 각 전부 90°) — 직교 표기·판독 전용. 90° 아닌 각 라벨과 함께 쓰면 라벨-실각 모순(금지). */
  perp?: boolean;
  /** m1u4 v2 확장 — 교점에서 뻗는 반직선(비상 CD⊥OE 원형). deg = 수학 각도, perpToLine2를 주면
   *  둘째 직선과의 직각 마크를 함께 그린다(deg는 a2−90으로 넘겨 실제 수직을 지킬 것). */
  ray?: { deg: number; label?: string; perpToLine2?: boolean };
  /** m1u4 v2 확장 — 커스텀 호 라벨(AF 문법): [a,b] 구간(수학 각도)에 호+라벨. angles(4각 중앙 고정)와 택일.
   *  라벨 수치는 반드시 구간 실각과 일치시킬 것(라벨=실각 원칙 — 저작 검산). */
  arcs?: Array<{ a: number; b: number; label: string }>;
  /** m1u4 v2 확장 — 둘째 직선의 수학 각도 커스텀(기본 152). ray·arcs와 함께 실각 설계에 쓴다. perp면 무시. */
  slope2?: number;
}): string {
  const cx = 150, cy = 100, r = 118;
  const a1 = o.perp ? 90 : 24;
  const a2 = o.perp ? 0 : (o.slope2 ?? 152);
  const pt = (deg: number) => polar(cx, cy, r, deg);
  const [p1, p2, p3, p4] = [pt(a1), pt(a2), pt(a1 + 180), pt(a2 + 180)];
  let out =
    `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p3.x.toFixed(1)}" y2="${p3.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.8" stroke-linecap="round"/>` +
    `<line x1="${p2.x.toFixed(1)}" y1="${p2.y.toFixed(1)}" x2="${p4.x.toFixed(1)}" y2="${p4.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.8" stroke-linecap="round"/>` +
    dot(cx, cy);
  if (o.perp) out += rightMark(cx, cy, 0, 13, GEO.ink);
  if (o.vertex) {
    // 교점 라벨은 반직선들 사이 가장 넓은 빈 부채꼴의 이등분선에 둔다(선 위에 얹히는 것 방지 — 파일럿 검수).
    const dirs = [a1, a2, a1 + 180, a2 + 180];
    if (o.ray) dirs.push(o.ray.deg);
    const sorted = dirs.map(normDeg).sort((p, q) => p - q);
    let best = { score: -1, mid: 270 };
    sorted.forEach((d0, i) => {
      const d1 = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + 360;
      const mid = normDeg((d0 + d1) / 2);
      const score = d1 - d0 + (Math.sin((mid * Math.PI) / 180) < 0 ? 8 : 0);
      if (score > best.score) best = { score, mid };
    });
    const lp = polar(cx, cy, 21, best.mid);
    out += ptLabel(lp.x, lp.y, o.vertex, 0, 4);
  }
  if (o.ray) {
    const rp = polar(cx, cy, r - 36, o.ray.deg);
    out += `<line x1="${cx}" y1="${cy}" x2="${rp.x.toFixed(1)}" y2="${rp.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>` + dot(rp.x, rp.y);
    if (o.ray.label) out += ptLabel(rp.x, rp.y, o.ray.label, o.ray.deg > 90 ? -10 : 10, -6);
    if (o.ray.perpToLine2) out += rightMark(cx, cy, o.ray.deg, 12, GEO.ink);
  }
  if (o.ends) {
    const off: Array<[number, number]> = [[10, -6], [-10, -6], [-10, 12], [10, 12]];
    [p1, p2, p3, p4].forEach((p, i) => {
      out += dot(p.x, p.y) + ptLabel(p.x, p.y, o.ends![i], off[i][0], off[i][1]);
    });
  }
  if (o.angles) {
    // 호는 두 직선이 만드는 실제 부채꼴 전체를 감싼다(mid±14 스텁은 "그리다 만" 호 — 파일럿 검수).
    const bounds: Array<[number, number]> = [[a1, a2], [a2, a1 + 180], [a1 + 180, a2 + 180], [a2 + 180, a1 + 360]];
    const rr = 46;
    o.angles.forEach((lab, i) => {
      if (!lab) return;
      const [s0, s1] = bounds[i];
      const p = polar(cx, cy, rr, (s0 + s1) / 2);
      out += `<text x="${p.x.toFixed(1)}" y="${(p.y + 5).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="800" fill="${GEO.ink}">${fxv(lab)}</text>`;
      out += angleArc(cx, cy, 24, s0, s1, GEO.hlA);
    });
  }
  if (o.arcs) {
    o.arcs.forEach((arc, i) => {
      const rr = 26 + (i % 2) * 15;
      out += angleArc(cx, cy, rr, arc.a, arc.b, i % 2 ? GEO.hlB : GEO.hlA);
      const m = polar(cx, cy, rr + 17, arc.a + normDeg(arc.b - arc.a) / 2);
      out += `<text x="${m.x.toFixed(1)}" y="${(m.y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">${fxv(arc.label)}</text>`;
    });
  }
  return svg("0 0 300 200", "두 직선이 한 점에서 만나 생긴 네 각 그림", out);
}

/** 평각 위에 반직선을 세운 부챗살 그림 — 평각 분할·이웃각용.
 *  기준선은 왼쪽 left ~ 오른쪽 right(평각), rays는 오른쪽에서 잰 수학 각도(0~180)와 끝 라벨.
 *  arcs: [a, b] 구간(도)에 호와 라벨 — 각 크기 수치나 (2x+15)° 같은 식을 넣는다. */
export function mExamAngleFanFig(o: {
  left: string;
  vertex: string;
  right: string;
  rays: Array<{ deg: number; label?: string }>;
  arcs: Array<{ a: number; b: number; label: string }>;
  perpAt?: number;
}): string {
  const cx = 160, cy = 156, r = 120;
  let out =
    `<line x1="${cx - 130}" y1="${cy}" x2="${cx + 130}" y2="${cy}" stroke="${GEO.ink}" stroke-width="2.8" stroke-linecap="round"/>` +
    dot(cx, cy) + dot(cx - 130, cy) + dot(cx + 130, cy) +
    ptLabel(cx - 130, cy, o.left, -2, 18) + ptLabel(cx, cy, o.vertex, 0, 20) + ptLabel(cx + 130, cy, o.right, 2, 18);
  if (o.perpAt !== undefined) out += rightMark(cx, cy, o.perpAt, 12, GEO.ink);
  for (const ray of o.rays) {
    const p = polar(cx, cy, r - 14, ray.deg);
    out += `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>` + dot(p.x, p.y);
    if (ray.label) out += ptLabel(p.x, p.y, ray.label, ray.deg > 90 ? -9 : 9, -7);
  }
  o.arcs.forEach((arc, i) => {
    const mid = (arc.a + arc.b) / 2;
    const rr = 34 + (i % 2) * 17;
    out += angleArc(cx, cy, rr, arc.a, arc.b, i % 2 ? GEO.hlB : GEO.hlA);
    const p = polar(cx, cy, rr + 17, mid);
    out += `<text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">${fxv(arc.label)}</text>`;
  });
  return svg("0 0 320 176", "평각을 반직선으로 나눈 각 그림", out);
}

/** 한 직선 위에 놓인 점들 — 점 이름은 위, 구간 라벨(길이)은 아래 괄호로.
 *  pos(0~1 상대 위치, v2 확장): 중점·비 조건 문항은 실제 비율대로 배치해 "그림상 같아 보이는" 오독을
 *  막는다(라벨=실각 원칙의 길이판 — 경량 검산 반영). 생략 시 균등 간격(순서만 의미 있는 문항용). */
export function mExamPointsLineFig(o: {
  pts: string[];
  segs?: Array<{ from: number; to: number; label: string }>;
  pos?: number[];
}): string {
  const y = 74;
  const X0 = 42, X1 = 278;
  const n = o.pts.length;
  const xAt = (i: number) => X0 + (X1 - X0) * (o.pos ? o.pos[i] : i / Math.max(1, n - 1));
  let out = `<line x1="${X0 - 20}" y1="${y}" x2="${X1 + 20}" y2="${y}" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  o.pts.forEach((name, i) => {
    out += dot(xAt(i), y) + ptLabel(xAt(i), y, name, 0, -10);
  });
  let H = 108;
  (o.segs ?? []).forEach((seg, k) => {
    const x1 = xAt(seg.from), x2 = xAt(seg.to);
    const yy = y + 20 + k * 26;
    out +=
      `<path d="M${x1} ${yy} h${x2 - x1} M${x1} ${yy - 6} v12 M${x2} ${yy - 6} v12" stroke="${FAINT}" stroke-width="1.4" fill="none"/>` +
      `<text x="${(x1 + x2) / 2}" y="${yy + 16}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${INK}">${fxv(seg.label)}</text>`;
    H = Math.max(H, yy + 30);
  });
  return svg(`0 0 320 ${H}`, "한 직선 위에 놓인 점들을 나타낸 그림", out);
}

/** 종이 띠 접기 그림 — fold는 실제 접기 각(윗변 오른쪽 방향과 접는 선 사이, 도).
 *  반사 계산으로 접힌 부분을 정확히 그리므로 라벨 수치는 기하와 일치한다.
 *  given은 접는 선과 원래 윗변(점선 쪽) 사이 각 라벨, x는 접힌 변과 남은 윗변 사이 각 라벨(m1u4 유형).
 *  m2u4 확장(전부 옵셔널 — 기존 호출 무영향): fold>90°면 접힌 아랫변이 윗변과 교점 P에서 만나
 *  이등변삼각형 P·위 끝·아래 끝이 생긴다(두 밑각 = 180−fold, 꼭지각 = 2·fold−180 — 저작 검산 병기).
 *  tri를 주면 P·이름 라벨(names=[P, 위 끝, 아래 끝], 기본 A·C·B)을 그리고, lens는 길이 라벨
 *  (top: P~위 끝 · fold: 접는 선 곁 · slant: 접힌 변 곁), angles는 삼각형 각 호(at "P"|"T"|"B"). */
export function mExamFoldFig(o: {
  fold: number;
  given?: string;
  x?: string;
  tri?: boolean;
  names?: [string, string, string];
  lens?: { top?: string; fold?: string; slant?: string };
  angles?: Array<{ at: "P" | "T" | "B"; label: string }>;
}): string {
  const top = 58, bot = 122;
  const E = { x: 172, y: top };
  const rad = (o.fold * Math.PI) / 180;
  const F = { x: E.x + (bot - top) / Math.tan(rad), y: bot };
  // tri 모드는 접히는 오른쪽 날개 폭을 줄여 위로 선 플랩이 뷰박스를 넘지 않게 한다.
  const wing = o.tri ? 88 : 124;
  const R1 = { x: E.x + wing, y: top };
  const R2 = { x: E.x + wing, y: bot };
  // 접는 선 EF에 대한 반사
  const refl = (p: { x: number; y: number }) => {
    const dx = F.x - E.x, dy = F.y - E.y;
    const t = ((p.x - E.x) * dx + (p.y - E.y) * dy) / (dx * dx + dy * dy);
    const hx = E.x + t * dx, hy = E.y + t * dy;
    return { x: 2 * hx - p.x, y: 2 * hy - p.y };
  };
  const R1p = refl(R1);
  const R2p = refl(R2);
  let out =
    `<path d="M24 ${top} L${E.x} ${E.y} L${F.x.toFixed(1)} ${F.y} L24 ${bot} Z" fill="#F8FAFC" stroke="${GEO.ink}" stroke-width="2.4"/>` +
    `<path d="M${E.x} ${E.y} L${R1.x} ${R1.y} L${R2.x} ${R2.y} L${F.x.toFixed(1)} ${F.y}" fill="none" stroke="${FAINT}" stroke-width="1.6" stroke-dasharray="6 4"/>` +
    `<path d="M${E.x} ${E.y} L${R1p.x.toFixed(1)} ${R1p.y.toFixed(1)} L${R2p.x.toFixed(1)} ${R2p.y.toFixed(1)} L${F.x.toFixed(1)} ${F.y} Z" fill="#EAF1FE" fill-opacity=".8" stroke="${GEO.ink}" stroke-width="2.4"/>`;
  // 접는 선 E→F의 수학 각도는 -fold. 주어진 각 호는 접는 선~원래 윗변(동쪽 점선) 사이의
  // 실각 fold°만 감싸야 한다(-(180-fold)로 잡으면 호가 접는 선을 가로지르는 실사고).
  const foldDirDeg = -o.fold;
  const east = 0;
  if (o.given) {
    out += angleArc(E.x, E.y, 26, foldDirDeg, east, GEO.hlA);
    const g = polar(E.x, E.y, 44, (foldDirDeg + east) / 2);
    out += `<text x="${g.x.toFixed(1)}" y="${(g.y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">${fxv(o.given)}</text>`;
  }
  if (o.x) {
    const reflDeg = (Math.atan2(-(R1p.y - E.y), R1p.x - E.x) * 180) / Math.PI;
    out += angleArc(E.x, E.y, 22, 180, reflDeg + 360, GEO.hlB);
    const xm = polar(E.x, E.y, 40, (180 + reflDeg + 360) / 2);
    out += `<text x="${xm.x.toFixed(1)}" y="${(xm.y + 4).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${GEO.ink}">${fxv(o.x)}</text>`;
  }
  if (o.tri && R2p.y < top - 4) {
    // 접힌 아랫변(F→R2p)이 윗변과 만나는 교점 P — fold>90°에서만 존재(저작 검산 의무).
    const P = { x: F.x + ((R2p.x - F.x) * (top - F.y)) / (R2p.y - F.y), y: top };
    const deg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      (Math.atan2(-(b.y - a.y), b.x - a.x) * 180) / Math.PI;
    const label = (x: number, y: number, s: string, fs = 11.5): string =>
      `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${GEO.ink}" stroke="#fff" stroke-width="3" paint-order="stroke">${s}</text>`;
    for (const a of o.angles ?? []) {
      let v = P;
      let a1 = deg(P, F);
      let a2 = 0;
      let color: string = GEO.hlA;
      if (a.at === "T") {
        v = E;
        a1 = 180;
        a2 = deg(E, F) + 360;
        color = GEO.hlB;
      } else if (a.at === "B") {
        v = F;
        a1 = deg(F, E);
        a2 = deg(F, P);
        color = GEO.hlD;
      }
      out += angleArc(v.x, v.y, 20, Math.min(a1, a2), Math.max(a1, a2), color);
      const m = polar(v.x, v.y, 37, (a1 + a2) / 2);
      out += label(m.x, m.y + 4, fxv(a.label), 12);
    }
    if (o.lens?.top) out += label((P.x + E.x) / 2, top - 9, o.lens.top);
    if (o.lens?.fold) {
      const dx = F.x - E.x, dy = F.y - E.y;
      const len = Math.hypot(dx, dy) || 1;
      out += label((E.x + F.x) / 2 + (dy / len) * 19, (E.y + F.y) / 2 - (dx / len) * 19 + 4, o.lens.fold);
    }
    if (o.lens?.slant) {
      const dx = P.x - F.x, dy = P.y - F.y;
      const len = Math.hypot(dx, dy) || 1;
      out += label((F.x + P.x) / 2 - (dy / len) * 19, (F.y + P.y) / 2 + (dx / len) * 19 + 4, o.lens.slant);
    }
    const [nP, nT, nB] = o.names ?? ["A", "C", "B"];
    // 교점 라벨은 위-살짝 오른쪽: 접힌 변이 좌상향으로 지나가 왼쪽 오프셋은 선에 겹친다(검수 반영).
    out += dot(P.x, P.y) + ptLabel(P.x, P.y, nP, 4, -11);
    out += ptLabel(E.x, E.y, nT, 8, -8) + ptLabel(F.x, F.y, nB, 3, 18);
  }
  out += dot(E.x, E.y) + dot(F.x, F.y);
  return svg(o.tri ? "0 -18 320 226" : "0 0 320 190", "직사각형 종이를 한 번 접은 그림", out);
}

/** 정육면체 십자 전개도 — 세로 4칸 + 가운데 행 양옆 1칸. 격자 꼭짓점 (c, r)에 라벨을 단다.
 *  셀 한 변 42px, 원점 (117, 12) = (c0, r0). c는 -1~2, r은 0~4 범위. */
export function mExamCubeNetFig(labels: Array<{ c: number; r: number; s: string; dx?: number; dy?: number }>): string {
  const S = 42, X0 = 117, Y0 = 12;
  const cell = (c: number, r: number) =>
    `<rect x="${X0 + c * S}" y="${Y0 + r * S}" width="${S}" height="${S}" fill="#F6F9FF" stroke="${GEO.ink}" stroke-width="2"/>`;
  let out = cell(0, 0) + cell(0, 1) + cell(0, 2) + cell(0, 3) + cell(-1, 1) + cell(1, 1);
  for (const l of labels) {
    const x = X0 + l.c * S, y = Y0 + l.r * S;
    out += dot(x, y, GEO.pt, 2.8) + ptLabel(x, y, l.s, l.dx ?? -8, l.dy ?? -5);
  }
  return svg("0 0 300 194", "정육면체의 전개도", out);
}

/** 직육면체에서 위 앞쪽 삼각기둥을 잘라 내고 남은 입체(고정 구도, 라벨 8개).
 *  꼭짓점: [뒤위왼, 뒤위오른, 앞중왼, 앞중오른, 뒤아래왼, 앞아래왼, 앞아래오른, 뒤아래오른].
 *  면: 경사면(0-2-3-1), 앞면(2-3-6-5), 뒷면(0-1-7-4), 밑면(4-5-6-7), 옆 사다리꼴 2. */
export function mExamCutBoxFig(labels: [string, string, string, string, string, string, string, string]): string {
  const p = [
    [112, 34], [220, 34], [58, 96], [168, 96],
    [112, 142], [58, 184], [168, 184], [220, 142],
  ] as const;
  const edge = (u: number, v: number, dash = false) =>
    `<line x1="${p[u][0]}" y1="${p[u][1]}" x2="${p[v][0]}" y2="${p[v][1]}" stroke="${GEO.ink}" stroke-width="2.5"${dash ? ' stroke-dasharray="6 5"' : ""} stroke-linecap="round"/>`;
  let out =
    edge(0, 1) + edge(0, 2) + edge(1, 3) + edge(2, 3) +
    edge(2, 5) + edge(3, 6) + edge(5, 6) + edge(6, 7) + edge(1, 7) +
    edge(0, 4, true) + edge(4, 5, true) + edge(4, 7, true);
  const offs: Array<[number, number]> = [[0, -9], [0, -9], [-10, 2], [11, 2], [-2, 16], [-10, 12], [10, 12], [11, 3]];
  labels.forEach((name, i) => {
    out += dot(p[i][0], p[i][1], GEO.pt, 3) + ptLabel(p[i][0], p[i][1], name, offs[i][0], offs[i][1]);
  });
  return svg("0 0 280 210", "직육면체에서 삼각기둥을 잘라 내고 남은 입체 그림", out);
}

/** 겨냥도 3종 — 교점·교선 세기용(기본 라벨 없음). kind: 사각뿔 | 오각기둥 | 삼각기둥.
 *  labels를 주면 꼭짓점에 이름을 단다(pyr4는 [꼭대기, 밑면 4], prism3은 [윗면 3, 밑면 3]). */
export function mExamSolidFig(kind: "pyr4" | "prism5" | "prism3", labels?: string[]): string {
  const L = (a: readonly number[], b: readonly number[], dash = false) =>
    `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${GEO.ink}" stroke-width="2.5"${dash ? ' stroke-dasharray="6 5"' : ""} stroke-linecap="round"/>`;
  const name = (p: readonly number[], i: number, dx: number, dy: number) =>
    labels?.[i] ? dot(p[0], p[1], GEO.pt, 3) + ptLabel(p[0], p[1], labels[i], dx, dy) : "";
  if (kind === "pyr4") {
    const T = [150, 26] as const;
    const A = [64, 148] as const, B = [162, 172] as const, C = [238, 138] as const, D = [140, 120] as const;
    let out = L(A, B) + L(B, C) + L(C, D, true) + L(D, A, true) + L(T, A) + L(T, B) + L(T, C) + L(T, D, true);
    out += name(T, 0, 0, -9) + name(A, 1, -10, 12) + name(B, 2, 0, 18) + name(C, 3, 11, 8) + name(D, 4, 10, -6);
    return svg("0 0 300 190", "사각뿔 겨냥도", out);
  }
  if (kind === "prism3") {
    // 시점: 위에서 내려봄 — 윗면 전부 실선, 뒤 옆면(J-K 쪽)이 숨어 밑면 뒤 변 M-N만 점선(세로 모서리는 전부 윤곽선).
    const J = [96, 40] as const, K = [222, 52] as const, Lp = [156, 84] as const;
    const M = [96, 150] as const, N = [222, 162] as const, O = [156, 194] as const;
    let out = L(J, K) + L(J, Lp) + L(K, Lp) + L(M, N, true) + L(M, O) + L(N, O) + L(J, M) + L(K, N) + L(Lp, O);
    out += name(J, 0, -10, -5) + name(K, 1, 11, -5) + name(Lp, 2, 10, -7) + name(M, 3, -10, 12) + name(N, 4, 11, 12) + name(O, 5, 4, 17);
    return svg("0 0 300 216", "삼각기둥 겨냥도", out);
  }
  const top: Array<[number, number]> = [];
  const bot: Array<[number, number]> = [];
  for (let i = 0; i < 5; i += 1) {
    const deg = 90 + i * 72;
    const x = 150 + 84 * Math.cos((deg * Math.PI) / 180);
    const y = 62 - 26 * Math.sin((deg * Math.PI) / 180);
    top.push([Math.round(x), Math.round(y)]);
    bot.push([Math.round(x), Math.round(y) + 92]);
  }
  // 시점: 위에서 내려봄(원기둥 겨냥도와 동일 원리) — 윗면 전부 실선, 뒤를 향한 옆면의 밑변만 점선,
  // 세로 모서리는 양옆 면이 모두 숨은 "가운데 뒤" 하나만 점선(파일럿 검수 반영).
  const faceHidden = (i: number, j: number) => (top[i][1] + top[j][1]) / 2 < 62;
  let out = "";
  for (let i = 0; i < 5; i += 1) {
    const j = (i + 1) % 5;
    const prev = (i + 4) % 5;
    out += L(top[i], top[j]);
    out += L(bot[i], bot[j], faceHidden(i, j));
    out += L(top[i], bot[i], faceHidden(prev, i) && faceHidden(i, j));
  }
  // labels(v2 확대 — 슬롯 93·94): [윗면 5, 밑면 5]를 앞왼→앞오른→뒤오른→뒤가운데→뒤왼 시계 한 바퀴 순으로.
  // A~E·F~J를 순서대로 주면 A(앞왼) 아래가 F가 되어 세로 모서리 AF·BG·…가 성립한다.
  if (labels?.length) {
    const ring = [2, 3, 4, 0, 1];
    const offT: Array<[number, number]> = [[-12, 3], [12, 3], [12, -4], [0, -9], [-12, -4]];
    const offB: Array<[number, number]> = [[-6, 17], [6, 17], [13, 6], [4, 16], [-13, 6]];
    ring.forEach((gi, ri) => {
      out += name(top[gi], ri, offT[ri][0], offT[ri][1]);
      out += name(bot[gi], ri + 5, offB[ri][0], offB[ri][1]);
    });
  }
  return svg("0 0 300 200", "오각기둥 겨냥도", out);
}

/** 크기가 같은 각의 작도 그림 — 왼쪽 원각 ∠XOY와 오른쪽 반직선 PQ 위 옮긴 각.
 *  호와 교점(M·N, C·D)을 표시한다. deg는 원각 크기(기하 그대로 그림). */
export function mExamCopyAngleFig(o: { deg?: number; labels?: Partial<Record<"o" | "x" | "y" | "m" | "n" | "p" | "q" | "c" | "d", string>> }): string {
  const deg = o.deg ?? 52;
  const lab = o.labels ?? { o: "O", x: "X", y: "Y", m: "M", n: "N", p: "P", q: "Q", c: "C", d: "D" };
  const draw = (cx: number, cy: number, withAngle: boolean) => {
    const r = 46, rayLen = 108;
    const pE = { x: cx + rayLen, y: cy };
    const pU = polar(cx, cy, rayLen, deg);
    const N = { x: cx + r, y: cy };
    const M = polar(cx, cy, r, deg);
    let s = `<line x1="${cx}" y1="${cy}" x2="${pE.x}" y2="${pE.y}" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
    s += withAngle
      ? `<line x1="${cx}" y1="${cy}" x2="${pU.x.toFixed(1)}" y2="${pU.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>`
      : `<line x1="${cx}" y1="${cy}" x2="${pU.x.toFixed(1)}" y2="${pU.y.toFixed(1)}" stroke="${GEO.soft}" stroke-width="2.2" stroke-dasharray="6 4" stroke-linecap="round"/>`;
    s += `<path d="M${(cx + r + 13).toFixed(1)} ${cy} A${r + 13} ${r + 13} 0 0 0 ${polar(cx, cy, r + 13, deg + 13).x.toFixed(1)} ${polar(cx, cy, r + 13, deg + 13).y.toFixed(1)}" stroke="${GEO.hlB}" stroke-width="1.8" fill="none" stroke-dasharray="5 4"/>`;
    // 폭(MN=CD) 옮기기 호 — 실제 작도대로 N(D)을 중심으로 반지름 MN인 호가 M(C)을 지나게 그린다
    // (꼭짓점 중심 동심호는 작도 논리에 없는 가짜 호 — 파일럿 검수 반영).
    const wr = Math.hypot(M.x - N.x, M.y - N.y);
    const phi = (Math.atan2(-(M.y - N.y), M.x - N.x) * 180) / Math.PI;
    const w0 = polar(N.x, N.y, wr, phi - 15);
    const w1 = polar(N.x, N.y, wr, phi + 15);
    s += `<path d="M${w0.x.toFixed(1)} ${w0.y.toFixed(1)} A${wr.toFixed(1)} ${wr.toFixed(1)} 0 0 0 ${w1.x.toFixed(1)} ${w1.y.toFixed(1)}" stroke="${GEO.hlC}" stroke-width="1.8" fill="none" stroke-dasharray="5 4"/>`;
    s += dot(cx, cy) + dot(N.x, N.y) + dot(M.x, M.y);
    return { s, pE, pU, M, N };
  };
  const left = draw(46, 132, true);
  const right = draw(190, 132, false);
  let out = left.s + right.s;
  const put = (p: { x: number; y: number }, key: keyof NonNullable<typeof o.labels>, dx: number, dy: number) => {
    const s = (lab as Record<string, string | undefined>)[key];
    if (s) out += ptLabel(p.x, p.y, s, dx, dy);
  };
  put({ x: 46, y: 132 }, "o", -2, 18);
  put(left.pU, "x", 2, -8);
  put(left.pE, "y", 8, 5);
  put(left.M, "m", -12, -4);
  put(left.N, "n", 6, 16);
  put({ x: 190, y: 132 }, "p", -2, 18);
  put(right.pE, "q", 8, 5);
  put(right.M, "c", -12, -4);
  put(right.N, "d", 6, 16);
  return svg("0 0 320 168", "각을 옮겨 그리는 작도 과정 그림", out);
}

/** 정삼각형 합동 심화 그림 2종.
 *  "in": 정삼각형 ABC의 변 BC 위 D, 변 CA 위 E(BD=CE), 선분 AD·BE와 교점 P의 각 ㉮.
 *  "twin": 정삼각형 ABC와, BC의 연장선 위 D를 한 변으로 하는 정삼각형 ECD를 잇댄 그림(AD·BE). */
export function mExamTwinEquiFig(mode: "in" | "twin"): string {
  const L = (a: readonly number[], b: readonly number[], w = 2.5) =>
    `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${GEO.ink}" stroke-width="${w}" stroke-linecap="round"/>`;
  if (mode === "in") {
    const A = [150, 30] as const, B = [58, 178] as const, C = [242, 178] as const;
    const t = 0.4;
    const D = [B[0] + (C[0] - B[0]) * t, 178] as const;
    const E = [C[0] + (A[0] - C[0]) * t, C[1] + (A[1] - C[1]) * t] as const;
    // 교점 P = AD ∩ BE
    const inter = () => {
      const d1 = [D[0] - A[0], D[1] - A[1]];
      const d2 = [E[0] - B[0], E[1] - B[1]];
      const den = d1[0] * d2[1] - d1[1] * d2[0];
      const s = ((B[0] - A[0]) * d2[1] - (B[1] - A[1]) * d2[0]) / den;
      return [A[0] + d1[0] * s, A[1] + d1[1] * s] as const;
    };
    const P = inter();
    let out = `<path d="M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z" stroke="${GEO.ink}" stroke-width="2.7" fill="#F8FAFC"/>`;
    out += L(A, D, 2.3) + L(B, E, 2.3);
    out += tickMark(B[0], B[1], D[0], D[1], 1, GEO.hlB) + tickMark(C[0], C[1], E[0], E[1], 1, GEO.hlB);
    const aAD = angleOf(P[0], P[1], A[0], A[1]);
    const aBE = angleOf(P[0], P[1], E[0], E[1]);
    out += angleArc(P[0], P[1], 17, Math.min(aAD, aBE), Math.max(aAD, aBE), GEO.hlA, undefined, { fill: true });
    out += `<text x="${(P[0] + 20).toFixed(1)}" y="${(P[1] - 12).toFixed(1)}" font-size="12.5" font-weight="800" fill="${GEO.ink}">㉮</text>`;
    out += dot(A[0], A[1]) + dot(B[0], B[1]) + dot(C[0], C[1]) + dot(D[0], D[1]) + dot(E[0], E[1]) + dot(P[0], P[1], GEO.pt, 2.6);
    out += ptLabel(A[0], A[1], "A", 0, -9) + ptLabel(B[0], B[1], "B", -9, 14) + ptLabel(C[0], C[1], "C", 9, 14) + ptLabel(D[0], D[1], "D", 2, 17) + ptLabel(E[0], E[1], "E", 12, -2);
    out += ptLabel(P[0], P[1], "P", -11, 13); // 문두가 "교점 P"를 지칭 — 라벨 누락은 파일럿 검수 지적
    return svg("0 0 300 208", "정삼각형 안에 두 선분을 그은 그림", out);
  }
  // 두 정삼각형은 크기를 다르게 그린다 — 같은 크기로 그리면 좌우 대칭이 생겨
  // △ACD≡△ECB 같은 거짓 진술이 그림상 참이 되는 복수 정답 사고(경량 검산 적발).
  const B = [34, 168] as const, C = [158, 168] as const, D = [252, 168] as const;
  const h1 = (C[0] - B[0]) * 0.866, h2 = (D[0] - C[0]) * 0.866;
  const A = [(B[0] + C[0]) / 2, 168 - h1] as const;
  const E = [(C[0] + D[0]) / 2, 168 - h2] as const;
  // 교점 F = AD ∩ BE(실계산 — 크기 파라미터를 바꿔도 라벨이 따라온다)
  const d1 = [D[0] - A[0], D[1] - A[1]] as const;
  const d2 = [E[0] - B[0], E[1] - B[1]] as const;
  const den = d1[0] * d2[1] - d1[1] * d2[0];
  const s = ((B[0] - A[0]) * d2[1] - (B[1] - A[1]) * d2[0]) / den;
  const F = [A[0] + d1[0] * s, A[1] + d1[1] * s] as const;
  let out =
    `<path d="M${A[0]} ${A[1].toFixed(1)} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z" stroke="${GEO.ink}" stroke-width="2.7" fill="#F8FAFC"/>` +
    `<path d="M${E[0]} ${E[1].toFixed(1)} L${C[0]} ${C[1]} L${D[0]} ${D[1]} Z" stroke="${GEO.ink}" stroke-width="2.7" fill="#F6F9FF"/>` +
    `<line x1="${B[0]}" y1="${B[1]}" x2="${D[0]}" y2="${D[1]}" stroke="${GEO.ink}" stroke-width="2.2"/>`;
  out += L(A, D, 2.2) + L(B, E, 2.2);
  out += dot(A[0], A[1]) + dot(B[0], B[1]) + dot(C[0], C[1]) + dot(D[0], D[1]) + dot(E[0], E[1]) + dot(F[0], F[1], GEO.pt, 2.6);
  out += ptLabel(A[0], A[1], "A", -2, -9) + ptLabel(B[0], B[1], "B", -9, 16) + ptLabel(C[0], C[1], "C", 0, 18) + ptLabel(D[0], D[1], "D", 9, 16) + ptLabel(E[0], E[1], "E", 2, -9) + ptLabel(F[0], F[1], "F", -13, -3);
  return svg("0 0 300 200", "정삼각형 두 개를 잇대어 두 선분을 그은 그림", out);
}

/** 평행선 사이 꺾임 보조선 그림(m1u4 v2 신작 — 3사 최다 계보 ⑧).
 *  실각 a·b(·c, 도)에서 좌표를 역산해 라벨 = 실제 각을 구조 보장한다(FoldFig 계보).
 *  mode "in"  : l 위 A → 꺾임 P(오른쪽) → m 위 B. 마킹 a(A, 오른쪽 아래 쐐기)·b(B, 오른쪽 위 쐐기)·x(P) — x = a+b.
 *  mode "out" : 같은 뼈대인데 두 사선이 l·m을 뚫고 지나가고, b 마킹이 m 아래 바깥 쐐기(맞꼭지각·평각을 한 단계
 *               더 경유하는 난도 변형 — 천재 계보) — x = a+b.
 *  mode "w"   : 꺾임 2개(P1 오른쪽·P2 왼쪽). c = 중간 세그먼트의 기울기 각 — x = a+c, y = b+c(x+y = a+b+2c).
 *  mode "tri" : m 위 두 점에서 오른 두 사선이 l 위쪽 정점 V에서 만남(삼각형 낀 구도 — 비상 계보).
 *               a·b = m에서의 밑각, 정점각 x = 180−a−b, l 교차 쐐기 lLeft = 180−a·lRight = 180−b.
 *  labels에 준 키만 그린다 — 값 문자열("34°"·"x°")은 저작이 위 공식으로 검산해 넣는다. */
export function mExamZigzagFig(o: {
  mode: "in" | "out" | "w" | "tri";
  a: number;
  b: number;
  c?: number;
  labels: Partial<Record<"a" | "b" | "x" | "y" | "lLeft" | "lRight", string>>;
}): string {
  const seg = (p: { x: number; y: number }, q: { x: number; y: number }, w = 2.6) =>
    `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="${w}" stroke-linecap="round"/>`;
  const hline = (y: number) => `<line x1="24" y1="${y}" x2="296" y2="${y}" stroke="${GEO.ink}" stroke-width="2.8"/>`;
  const txt = (x: number, y: number, s: string, size = 11.5) =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="${size}" font-weight="800" fill="${GEO.ink}">${fxv(s)}</text>`;
  const lm = (yl: number, ym: number) =>
    `<text x="294" y="${yl - 7}" text-anchor="end" font-size="12" font-style="italic" fill="${GEO.soft}">l</text>` +
    `<text x="294" y="${ym - 7}" text-anchor="end" font-size="12" font-style="italic" fill="${GEO.soft}">m</text>`;
  const arcLab = (v: { x: number; y: number }, a0: number, a1: number, color: string, s: string | undefined, r = 20, lr = 34) => {
    if (!s) return "";
    const m = polar(v.x, v.y, lr, a0 + normDeg(a1 - a0) / 2);
    return angleArc(v.x, v.y, r, a0, a1, color) + txt(m.x, m.y + 4, s);
  };
  const sin = (d: number) => Math.sin((d * Math.PI) / 180);

  if (o.mode === "in" || o.mode === "out") {
    const yl = 52, ym = 160;
    const A = { x: 78, y: yl };
    const P = polar(A.x, A.y, (106 - yl) / sin(o.a), -o.a);
    const B = polar(P.x, P.y, (ym - 106) / sin(o.b), o.b - 180);
    let out = hline(yl) + hline(ym) + lm(yl, ym);
    if (o.mode === "out") {
      const A2 = polar(A.x, A.y, 30, 180 - o.a);
      const B2 = polar(B.x, B.y, 30, o.b - 180);
      out += seg(A2, P) + seg(P, B2);
    } else {
      out += seg(A, P) + seg(P, B);
    }
    out += arcLab(A, -o.a, 0, GEO.hlA, o.labels.a);
    out += o.mode === "out"
      ? arcLab(B, 180, 180 + o.b, GEO.hlB, o.labels.b)
      : arcLab(B, 0, o.b, GEO.hlB, o.labels.b);
    out += arcLab(P, 180 - o.a, 180 + o.b, GEO.hlC, o.labels.x, 15, 29);
    out += dot(A.x, A.y) + dot(P.x, P.y) + dot(B.x, B.y);
    return svg("0 0 320 212", "평행한 두 직선 사이에서 꺾인 선 그림", out);
  }

  if (o.mode === "w") {
    const c = o.c ?? 24;
    const yl = 48, ym = 172;
    const A = { x: 70, y: yl };
    const P1 = polar(A.x, A.y, (95 - yl) / sin(o.a), -o.a);
    const P2 = polar(P1.x, P1.y, (140 - 95) / sin(c), 180 + c);
    const B = polar(P2.x, P2.y, (ym - 140) / sin(o.b), -o.b);
    let out = hline(yl) + hline(ym) + lm(yl, ym);
    out += seg(A, P1) + seg(P1, P2) + seg(P2, B);
    out += arcLab(A, -o.a, 0, GEO.hlA, o.labels.a, 18, 31);
    out += arcLab(P1, 180 - o.a, 180 + c, GEO.hlC, o.labels.x, 14, 27);
    out += arcLab(P2, -o.b, c, GEO.hlC, o.labels.y, 14, 27);
    out += arcLab(B, 180 - o.b, 180, GEO.hlB, o.labels.b, 18, 31);
    out += dot(A.x, A.y) + dot(P1.x, P1.y) + dot(P2.x, P2.y) + dot(B.x, B.y);
    return svg("0 0 320 220", "평행한 두 직선 사이에서 두 번 꺾인 선 그림", out);
  }

  const yl = 92, ym = 166;
  const cot = (d: number) => 1 / Math.tan((d * Math.PI) / 180);
  const Lb = { x: 72, y: ym }, Rb = { x: 218, y: ym };
  const h = (Rb.x - Lb.x) / (cot(o.a) + cot(o.b));
  const V = { x: Lb.x + h * cot(o.a), y: ym - h };
  const C1 = { x: Lb.x + (ym - yl) * cot(o.a), y: yl };
  const C2 = { x: Rb.x - (ym - yl) * cot(o.b), y: yl };
  let out = hline(yl) + hline(ym) + lm(yl, ym);
  out += seg(Lb, V) + seg(Rb, V);
  out += arcLab(Lb, 0, o.a, GEO.hlA, o.labels.a, 20, 34);
  out += arcLab(Rb, 180 - o.b, 180, GEO.hlB, o.labels.b, 20, 34);
  out += arcLab(V, 180 + o.a, 360 - o.b, GEO.hlC, o.labels.x, 15, 33);
  out += arcLab(C1, 180 + o.a, 360, GEO.hlA, o.labels.lLeft, 16, 29);
  out += arcLab(C2, 180, 360 - o.b, GEO.hlB, o.labels.lRight, 16, 29);
  out += dot(V.x, V.y) + dot(Lb.x, Lb.y) + dot(Rb.x, Rb.y);
  return svg("0 0 320 214", "평행한 두 직선과 그 사이에 걸친 삼각형 모양 그림", out);
}

/** 세 직선이 한 점에서 만나는 6각 그림(m1u4 v2 확대 신작 — 슬롯 54·57).
 *  실각 a·b(도)만 받고 셋째 각 c=180−a−b를 헬퍼가 역산해 그린다(위쪽 세 각 합 180 구조 보장 — 라벨=실각 원칙).
 *  labels: 위쪽 세 부채꼴 a(0~a)·b(a~a+b)·c(a+b~180)와 각각의 맞꼭지각 a2·b2·c2 — 준 키만 그린다. */
export function mExamStarCrossFig(o: {
  a: number;
  b: number;
  labels: Partial<Record<"a" | "b" | "c" | "a2" | "b2" | "c2", string>>;
  vertex?: string;
}): string {
  const cx = 150, cy = 100, r = 118;
  const line = (deg: number) => {
    const p = polar(cx, cy, r, deg);
    const q = polar(cx, cy, r, deg + 180);
    return `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.8" stroke-linecap="round"/>`;
  };
  let out = line(0) + line(o.a) + line(o.a + o.b) + dot(cx, cy);
  const sectors: Array<["a" | "b" | "c" | "a2" | "b2" | "c2", number, number, string]> = [
    ["a", 0, o.a, GEO.hlA],
    ["b", o.a, o.a + o.b, GEO.hlB],
    ["c", o.a + o.b, 180, GEO.hlC],
    ["a2", 180, 180 + o.a, GEO.hlA],
    ["b2", 180 + o.a, 180 + o.a + o.b, GEO.hlB],
    ["c2", 180 + o.a + o.b, 360, GEO.hlC],
  ];
  let k = 0;
  for (const [key, s0, s1, color] of sectors) {
    const lab = o.labels[key];
    if (!lab) continue;
    const rr = 24 + (k % 2) * 13;
    out += angleArc(cx, cy, rr, s0, s1, color);
    const m = polar(cx, cy, rr + 20, s0 + (s1 - s0) / 2);
    out += `<text x="${m.x.toFixed(1)}" y="${(m.y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">${fxv(lab)}</text>`;
    k += 1;
  }
  if (o.vertex) {
    let best = { score: -1, mid: 270 };
    for (const [key, s0, s1] of sectors) {
      if (o.labels[key]) continue;
      const mid = normDeg((s0 + s1) / 2);
      const score = s1 - s0 + (Math.sin((mid * Math.PI) / 180) < 0 ? 8 : 0);
      if (score > best.score) best = { score, mid };
    }
    const lp = polar(cx, cy, 20, best.mid);
    out += ptLabel(lp.x, lp.y, o.vertex, 0, 4);
  }
  return svg("0 0 300 200", "세 직선이 한 점에서 만나 생긴 여섯 각 그림", out);
}

/** 직사각형·사다리꼴·정육각형 변 위치 관계 그림(m1u4 v2 확대 신작 — 슬롯 83·84·86·90).
 *  labels = 꼭짓점 이름. rect·trap은 4개를 좌상→좌하→우하→우상 순으로(A·B·C·D면 AB가 왼 변, AD가 윗변 —
 *  trap은 윗변 AD ∥ 아랫변 BC), hex는 6개를 좌상부터 시계 방향으로(A·B·…·F면 AB가 윗변, 평행 변은 DE).
 *  extend: 각 변을 양쪽으로 연장한 점선("변을 포함하는 직선" 문두와 세트 — 슬롯 86). */
export function mExamQuadSidesFig(o: { shape: "rect" | "trap" | "hex"; labels?: string[]; extend?: boolean }): string {
  let pts: Array<{ x: number; y: number }>;
  let offs: Array<[number, number]>;
  if (o.shape === "rect") {
    pts = [{ x: 74, y: 40 }, { x: 74, y: 148 }, { x: 226, y: 148 }, { x: 226, y: 40 }];
    offs = [[-10, -6], [-10, 15], [10, 15], [10, -6]];
  } else if (o.shape === "trap") {
    pts = [{ x: 104, y: 42 }, { x: 58, y: 148 }, { x: 242, y: 148 }, { x: 196, y: 42 }];
    offs = [[-9, -7], [-10, 15], [10, 15], [9, -7]];
  } else {
    pts = [];
    for (let i = 0; i < 6; i += 1) pts.push(polar(150, 96, 76, 120 - i * 60));
    offs = [[-9, -7], [9, -7], [14, 4], [9, 16], [-9, 16], [-14, 4]];
  }
  const n = pts.length;
  let out = `<path d="M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z" fill="#F8FAFC" stroke="${GEO.ink}" stroke-width="2.7"/>`;
  if (o.extend) {
    for (let i = 0; i < n; i += 1) {
      const p = pts[i], q = pts[(i + 1) % n];
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      const ux = (q.x - p.x) / d, uy = (q.y - p.y) / d;
      out += `<line x1="${(p.x - ux * 24).toFixed(1)}" y1="${(p.y - uy * 24).toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${GEO.soft}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      out += `<line x1="${q.x.toFixed(1)}" y1="${q.y.toFixed(1)}" x2="${(q.x + ux * 24).toFixed(1)}" y2="${(q.y + uy * 24).toFixed(1)}" stroke="${GEO.soft}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
    }
  }
  if (o.shape === "rect") {
    out += rightMark(74, 40, 270, 10) + rightMark(74, 148, 0, 10) + rightMark(226, 148, 90, 10) + rightMark(226, 40, 180, 10);
  }
  (o.labels ?? []).forEach((name, i) => {
    if (!name || !pts[i]) return;
    out += dot(pts[i].x, pts[i].y, GEO.pt, 3.2) + ptLabel(pts[i].x, pts[i].y, name, offs[i][0], offs[i][1]);
  });
  return svg("0 0 300 196", "여러 변으로 이루어진 도형에서 변 사이의 위치 관계 그림", out);
}

/** 길이가 같은 선분의 작도 그림(m1u4 v2 확대 신작 — 슬롯 145·147·151).
 *  위 = 원본 AB(길이 라벨 옵션), 아래 = 직선 l 위 점 C를 중심으로 반지름 AB인 원호(점선)를 그려 교점 D.
 *  CD 길이는 AB와 픽셀 단위로 같게 그린다(작도 의미 그대로). */
export function mExamCopyLenFig(o: { ab?: string; labels?: Partial<Record<"a" | "b" | "c" | "d", string>> } = {}): string {
  const lab = { a: "A", b: "B", c: "C", d: "D", ...(o.labels ?? {}) };
  const ax = 88, bx = 212, ty = 40;
  const ly = 132, cxp = 92;
  const R = bx - ax;
  const dxp = cxp + R;
  let out = `<line x1="${ax}" y1="${ty}" x2="${bx}" y2="${ty}" stroke="${GEO.ink}" stroke-width="2.8" stroke-linecap="round"/>`;
  out += dot(ax, ty) + dot(bx, ty) + ptLabel(ax, ty, lab.a, 0, -9) + ptLabel(bx, ty, lab.b, 0, -9);
  if (o.ab) out += `<text x="${(ax + bx) / 2}" y="${ty + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">${fxv(o.ab)}</text>`;
  out += `<line x1="30" y1="${ly}" x2="292" y2="${ly}" stroke="${GEO.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  out += `<text x="292" y="${ly - 8}" text-anchor="end" font-size="12" font-style="italic" fill="${GEO.soft}">l</text>`;
  const a0 = polar(cxp, ly, R, -24);
  const a1 = polar(cxp, ly, R, 24);
  out += `<path d="M${a0.x.toFixed(1)} ${a0.y.toFixed(1)} A${R} ${R} 0 0 0 ${a1.x.toFixed(1)} ${a1.y.toFixed(1)}" stroke="${GEO.hlB}" stroke-width="1.8" fill="none" stroke-dasharray="5 4"/>`;
  out += dot(cxp, ly) + dot(dxp, ly) + ptLabel(cxp, ly, lab.c, 0, 18) + ptLabel(dxp, ly, lab.d, 0, 18);
  return svg("0 0 320 196", "컴퍼스로 선분의 길이를 옮겨 그리는 작도 그림", out);
}

/** 정사각형 겹침 회전 그림(m1u4 v2 확대 신작 — 슬롯 194·195, 미래엔 ⑳ 계보).
 *  정사각형 ABCD의 두 대각선의 교점 O에 합동 정사각형의 한 꼭짓점을 고정하고 rot(도)만큼 돌린 상태.
 *  겹친 부분만 옅게 칠하고, 넓이·비율 등 정답 수치는 인쇄하지 않는다. side = 변 길이 라벨("12 cm"). */
export function mExamSquareOverlapFig(o: { side?: string; rot?: number; labels2?: [string, string, string] } = {}): string {
  const s = 96;
  const A = { x: 58, y: 30 }, B = { x: 58, y: 126 }, C = { x: 154, y: 126 }, D = { x: 154, y: 30 };
  const O = { x: 106, y: 78 };
  const rot = o.rot ?? 24;
  const cr = Math.cos((rot * Math.PI) / 180), sr = Math.sin((rot * Math.PI) / 180);
  const F = { x: O.x + s * cr, y: O.y + s * sr };
  const G = { x: F.x - s * sr, y: F.y + s * cr };
  const H = { x: O.x - s * sr, y: O.y + s * cr };
  // 회전 사각형의 두 변이 원본과 만나는 점(오른 변·아랫변) — 겹친 부분 = O·P1·C·P2
  const t1 = (C.x - O.x) / cr;
  const P1 = { x: C.x, y: O.y + t1 * sr };
  const t2 = (C.y - O.y) / cr;
  const P2 = { x: O.x - t2 * sr, y: C.y };
  let out = `<path d="M${O.x} ${O.y} L${P1.x.toFixed(1)} ${P1.y.toFixed(1)} L${C.x} ${C.y} L${P2.x.toFixed(1)} ${P2.y.toFixed(1)} Z" fill="#EAF1FE" fill-opacity=".85"/>`;
  out += `<line x1="${A.x}" y1="${A.y}" x2="${C.x}" y2="${C.y}" stroke="${FAINT}" stroke-width="1.4" stroke-dasharray="4 4"/>`;
  out += `<line x1="${B.x}" y1="${B.y}" x2="${D.x}" y2="${D.y}" stroke="${FAINT}" stroke-width="1.4" stroke-dasharray="4 4"/>`;
  out += `<path d="M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y} L${D.x} ${D.y} Z" fill="none" stroke="${GEO.ink}" stroke-width="2.7"/>`;
  out += `<path d="M${O.x} ${O.y} L${F.x.toFixed(1)} ${F.y.toFixed(1)} L${G.x.toFixed(1)} ${G.y.toFixed(1)} L${H.x.toFixed(1)} ${H.y.toFixed(1)} Z" fill="none" stroke="${GEO.ink}" stroke-width="2.4"/>`;
  if (o.side) out += `<text x="${(A.x + D.x) / 2}" y="${A.y - 10}" text-anchor="middle" font-size="12" font-weight="800" fill="${GEO.ink}">${fxv(o.side)}</text>`;
  out += dot(O.x, O.y, GEO.pt, 3.2);
  out += ptLabel(A.x, A.y, "A", -9, -6) + ptLabel(B.x, B.y, "B", -9, 14) + ptLabel(C.x, C.y, "C", -11, -8) + ptLabel(D.x, D.y, "D", 9, -6);
  out += ptLabel(O.x, O.y, "O", -11, -4);
  const l2 = o.labels2 ?? ["F", "G", "H"];
  out += ptLabel(F.x, F.y, l2[0], 11, 0) + ptLabel(G.x, G.y, l2[1], 6, 15) + ptLabel(H.x, H.y, l2[2], -11, 6);
  return svg("0 0 300 230", "두 정사각형이 겹쳐 놓인 그림", out);
}

/* ── m1u3 개보수(2026-07) 신작 — 그래프 개형 ①~⑤ 고르기 카드 ─────────────
 * 작은 좌표평면 카드에 정비례 직선·반비례 두 갈래 곡선·원점 이탈 직선·한 갈래 함정을 그린다.
 * 카드에는 눈금이 없으므로 "방향·원점 통과·갈래 수·축 교차"처럼 모양만으로 정답이 하나가
 * 되도록 문항을 설계한다(기울어진 정도의 크기 비교를 근거로 쓰지 않는다).
 * 라벨 보기(shuffle:false)와 짝이므로 정답 카드는 ①에 두지 않는다(u6 gasTvChoicesFig 관행). */
export interface MExamRelChoiceCell {
  /** 직선: a는 방향(양수 = 오른쪽 위). bPx를 주면 세로로 bPx만큼 평행 이동한 원점 이탈 함정. */
  line?: { a: number; bPx?: number };
  /** 반비례 두 갈래: 1 = 제1·3사분면, -1 = 제2·4사분면. single이면 한 갈래(x>0 쪽)만 그린다. */
  inv?: 1 | -1;
  single?: boolean;
}

export function mExamRelChoicesFig(items: MExamRelChoiceCell[]): string {
  const HW = 46;
  const HH = 40;
  const K = 280; // 곡선 상수(px²) — 축에 다가가되 닿지 않는 모양이 되는 값
  let out = "";
  items.forEach((item, i) => {
    const row = i < 3 ? 0 : 1;
    const col = i < 3 ? i : i - 3;
    const x0 = (items.length <= 3 || row === 0 ? 4 : 64) + col * 120;
    const y0 = 4 + row * 108;
    const cx = x0 + 56;
    const cy = y0 + 58;
    out +=
      `<rect x="${x0}" y="${y0}" width="112" height="102" rx="10" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.3"/>` +
      `<text x="${x0 + 13}" y="${y0 + 19}" font-size="12.5" font-weight="900" fill="${INK}">${"①②③④⑤⑥"[i]}</text>` +
      `<line x1="${cx - HW}" y1="${cy}" x2="${cx + HW}" y2="${cy}" stroke="#94A3B8" stroke-width="1.3"/>` +
      `<path d="M${cx + HW} ${cy} l-5 -2.8 v5.6 z" fill="#94A3B8"/>` +
      `<line x1="${cx}" y1="${cy + HH}" x2="${cx}" y2="${cy - HH}" stroke="#94A3B8" stroke-width="1.3"/>` +
      `<path d="M${cx} ${cy - HH} l-2.8 5 h5.6 z" fill="#94A3B8"/>`;
    if (item.line) {
      const bw = HW - 4;
      const bh = HH - 4;
      const a = item.line.a;
      const bPx = item.line.bPx ?? 0;
      const candidates: Array<[number, number]> = [];
      for (const lx of [-bw, bw]) {
        const ly = -a * lx - bPx;
        if (Math.abs(ly) <= bh + 0.01) candidates.push([lx, ly]);
      }
      for (const ly of [-bh, bh]) {
        const lx = (-ly - bPx) / a;
        if (Math.abs(lx) <= bw + 0.01) candidates.push([lx, ly]);
      }
      const ends: Array<[number, number]> = [];
      for (const p of candidates) if (!ends.some((q) => Math.abs(q[0] - p[0]) < 0.5 && Math.abs(q[1] - p[1]) < 0.5)) ends.push(p);
      if (ends.length >= 2)
        out += `<line x1="${(cx + ends[0][0]).toFixed(1)}" y1="${(cy + ends[0][1]).toFixed(1)}" x2="${(cx + ends[1][0]).toFixed(1)}" y2="${(cy + ends[1][1]).toFixed(1)}" stroke="${NAVY}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    if (item.inv) {
      const bh = HH - 4;
      const xNear = K / bh;
      for (const sign of item.single ? ([1] as const) : ([-1, 1] as const)) {
        let d = "";
        for (let step = 0; step <= 24; step++) {
          const absX = xNear + (step / 24) * (HW - 4 - xNear);
          const lx = sign * absX;
          const ly = (-item.inv * K) / lx;
          d += `${step === 0 ? "M" : "L"}${(cx + lx).toFixed(1)} ${(cy + ly).toFixed(1)} `;
        }
        out += `<path d="${d}" stroke="${NAVY}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      }
    }
  });
  const height = items.length <= 3 ? 112 : 222;
  const width = items.length <= 3 ? items.length * 120 + 8 : 364;
  return svg(`0 0 ${width} ${height}`, "번호가 붙은 작은 좌표평면들에 서로 다른 모양의 그래프가 그려진 그림", out);
}

/* ════════════════════════════════════════════════════════════
   m2u4(중2 Ⅳ 삼각형과 사각형의 성질) — 시험 전용 파라미터형 신작 13종.
   레슨 그림(mathFigures2 Ⅳ 15종)은 수치 고정형이라 시험 재사용 금지가 원칙이고,
   여기 헬퍼는 실제 각도(도)를 인자로 받아 좌표를 "계산"하므로 라벨과 기하가 항상 일치한다.
   저작 규약: ① 실각 인자(apexDeg·B·C·angleB·th·phi)와 인쇄 라벨을 반드시 일치시킨다(기하 검산 의무)
   ② 구할 각·길이는 그림에 인쇄하지 않는다(x°·㉠·? 라벨만) ③ aria는 중립 서술만.
   각 호 색: 조건 각은 앰버(hlA)→시안(hlB)→그린(hlD) 순, 라벨에 x·㉠·?가 들어가면 로즈(hlC) 자동.
   ════════════════════════════════════════════════════════════ */

type GPt = { x: number; y: number };
const F4 = "#F6F9FF"; // 도형 면 채움
const F4B = "#DCEAFB"; // 보조 면(음영)
const isAskLabel = (s: string): boolean => /[x㉠㉡㉢?]/.test(s);
const g4line = (a: GPt, b: GPt, color: string = GEO.ink, w = 2.5, dash = ""): string =>
  lineSvg(a.x, a.y, b.x, b.y, color, w, dash);
const g4poly = (pts: GPt[], fill = F4, w = 2.5): string =>
  `<path d="M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z" fill="${fill}" stroke="${GEO.ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
const g4text = (x: number, y: number, s: string, fs = 12.5, color: string = GEO.ink, anchor = "middle"): string =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-size="${fs}" font-weight="800" fill="${color}">${fxv(s)}</text>`;
const g4cen = (pts: GPt[]): GPt => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
});
/** 꼭짓점 v에서 p1→p2로 벌어진 내각 호(항상 짧은 쪽) + 잉크 라벨. 라벨에 x·㉠·?가 있으면 로즈 호. */
const g4arc = (v: GPt, p1: GPt, p2: GPt, color: string, label?: string, r = 22, labelR?: number, fs = 12): string => {
  let a0 = angleOf(v.x, v.y, p1.x, p1.y);
  let a1 = angleOf(v.x, v.y, p2.x, p2.y);
  if (normDeg(a1 - a0) > 180) [a0, a1] = [a1, a0];
  const c = label && isAskLabel(label) ? GEO.hlC : color;
  let out = angleArc(v.x, v.y, r, a0, a1, c);
  if (label) {
    const mid = polar(v.x, v.y, labelR ?? r + 15, a0 + normDeg(a1 - a0) / 2);
    out += g4text(mid.x, mid.y + 4.2, label, fs);
  }
  return out;
};
/** 이등분 표시 — 반각 호 중간에 작은 ●○× 기호. */
const g4bisMark = (v: GPt, p1: GPt, p2: GPt, sym: string, r = 30): string => {
  let a0 = angleOf(v.x, v.y, p1.x, p1.y);
  let a1 = angleOf(v.x, v.y, p2.x, p2.y);
  if (normDeg(a1 - a0) > 180) [a0, a1] = [a1, a0];
  const mid = polar(v.x, v.y, r, a0 + normDeg(a1 - a0) / 2);
  return g4text(mid.x, mid.y + 3.6, sym, 10, GEO.soft);
};
/** 꼭짓점 v의 직각 표시 — 두 변(v→p1, v→p2)이 90°일 때 안쪽 꺾쇠. */
const g4right = (v: GPt, p1: GPt, p2: GPt, size = 10): string => {
  const a1 = angleOf(v.x, v.y, p1.x, p1.y);
  const a2 = angleOf(v.x, v.y, p2.x, p2.y);
  return Math.abs(normDeg(a2 - a1) - 90) < 2 ? rightMark(v.x, v.y, a1, size) : rightMark(v.x, v.y, a2, size);
};
/** 변 라벨 — 도형 무게중심 반대쪽(바깥)에 배치. inside면 안쪽.
 *  라벨은 가로쓰기라 가파른 변 옆에서는 텍스트 반폭이 변을 도로 덮는다(2026-07-22 파일럿 눈검수) —
 *  법선의 수평 성분만큼 반폭을 간격에 더해 겹침을 구조적으로 막는다(수평 변은 기존 간격 그대로,
 *  inside 라벨은 반대편 변을 뚫지 않게 +6px 상한). */
const g4side = (a: GPt, b: GPt, label: string, cen: GPt, distance = 15, inside = false, fs = 11.5): string => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = dy / len;
  const ny = -dx / len;
  const toCen = (cen.x - mx) * nx + (cen.y - my) * ny;
  const s = (toCen > 0 ? -1 : 1) * (inside ? -1 : 1);
  const need = Math.abs(nx) * label.length * fs * 0.3 + Math.abs(ny) * fs * 0.55 + 5;
  const eff = inside ? Math.min(Math.max(distance, need), distance + 6) : Math.max(distance, need);
  // 뷰박스(0~360) 밖으로 밀려 반쪽이 잘리는 것 방지 — 텍스트 반폭만큼 안쪽으로 클램프.
  const half = label.length * fs * 0.3 + 2;
  const lx = Math.min(360 - half, Math.max(half, mx + nx * s * eff));
  return g4text(lx, my + ny * s * eff + 4, label, fs, INK);
};

/** 이등변삼각형 범용 — apexDeg가 "실제" 꼭지각(도)이라 그림과 라벨이 늘 일치한다.
 *  apex/baseL/baseR: 각 라벨(생략 시 미표시) · ext: 밑변 오른쪽 연장 위 외각 라벨 ·
 *  foot: 꼭지각 이등분선의 발 D(+직각 표시), tickBase: BD=DC 틱(2개) ·
 *  tickSides: AB=AC 틱(기본 true) · sideL/sideR/base: 변 길이 라벨. */
export function m2ExamIsoFig(o: {
  apexDeg: number;
  apex?: string;
  baseL?: string;
  baseR?: string;
  ext?: string;
  foot?: boolean;
  footLabel?: string;
  footRight?: boolean;
  tickBase?: boolean;
  tickSides?: boolean;
  sideL?: string;
  sideR?: string;
  base?: string;
  names?: [string, string, string];
}): string {
  const beta = (o.apexDeg / 2) * (Math.PI / 180);
  const extW = o.ext ? 62 : 0;
  const L = Math.min(158, 122 / Math.sin(beta), 172 / Math.cos(beta));
  const w = L * Math.sin(beta);
  const h = L * Math.cos(beta);
  const H = Math.round(h) + 86;
  const cx = 180 - extW / 2;
  const gy = H - 44;
  const A = { x: cx, y: gy - h };
  const B = { x: cx - w, y: gy };
  const C = { x: cx + w, y: gy };
  const E = { x: C.x + extW, y: gy };
  const cen = g4cen([A, B, C]);
  const [nA, nB, nC] = o.names ?? ["A", "B", "C"];
  let out = "";
  if (o.ext) out += g4line(C, E, GEO.ink, 2.2);
  out += g4poly([A, B, C]);
  if (o.tickSides !== false) out += tickMark(A.x, A.y, B.x, B.y, 1) + tickMark(A.x, A.y, C.x, C.y, 1);
  if (o.foot) {
    const D = { x: cx, y: gy };
    out += g4line(A, D, GEO.ink, 2.2);
    if (o.footRight !== false) out += g4right(D, C, A);
    out += dot(D.x, D.y, GEO.pt, 3) + ptLabel(D.x, D.y, o.footLabel ?? "D", 0, 17);
    if (o.tickBase) out += tickMark(B.x, B.y, D.x, D.y, 2) + tickMark(D.x, D.y, C.x, C.y, 2);
  }
  if (o.apex) out += g4arc(A, B, C, GEO.hlA, o.apex, 24);
  if (o.baseL) out += g4arc(B, A, C, GEO.hlB, o.baseL, 22);
  if (o.baseR) out += g4arc(C, A, B, GEO.hlB, o.baseR, 22);
  if (o.ext) out += g4arc(C, A, E, GEO.hlD, o.ext, 20);
  if (o.sideL) out += g4side(A, B, o.sideL, cen, 20);
  if (o.sideR) out += g4side(A, C, o.sideR, cen, 20);
  if (o.base) out += g4side(B, C, o.base, cen, o.foot ? 32 : 15);
  out += ptLabel(A.x, A.y, nA, 0, -10) + ptLabel(B.x, B.y, nB, -7, 17) + ptLabel(C.x, C.y, nC, 7, 17);
  return svg(`0 0 360 ${H}`, "이등변삼각형 그림", out);
}

/** 이등변 이어붙이기 — 바닥 반직선 B→C→D 위에서 AB=AC=CD(각 1틱).
 *  ∠B=th(실각)이면 ∠ACB=th, △ACD가 이등변이라 ∠ADC=∠CAD=th/2(짝수 th로 설계).
 *  askAt: 물음표 각 위치("D"=∠ADC · "CAD" · "ACD"). */
export function m2ExamIsoChainFig(o: {
  th: number;
  thLabel?: string;
  ask?: string;
  askAt?: "D" | "CAD" | "ACD";
  names?: [string, string, string, string];
}): string {
  const t = (o.th * Math.PI) / 180;
  const L = Math.min(128, 250 / (2 * Math.cos(t) + 1));
  const H = Math.round(L * Math.sin(t)) + 84;
  const gy = H - 42;
  const B = { x: 50, y: gy };
  const A = { x: 50 + L * Math.cos(t), y: gy - L * Math.sin(t) };
  const C = { x: 50 + 2 * L * Math.cos(t), y: gy };
  const D = { x: C.x + L, y: gy };
  const [nA, nB, nC, nD] = o.names ?? ["A", "B", "C", "D"];
  let out = g4line(B, { x: D.x + 24, y: gy }, GEO.ink, 2.2);
  out += g4poly([A, B, C], F4) + g4line(A, D, GEO.ink, 2.5);
  out += tickMark(A.x, A.y, B.x, B.y, 1) + tickMark(A.x, A.y, C.x, C.y, 1) + tickMark(C.x, C.y, D.x, D.y, 1);
  if (o.thLabel) out += g4arc(B, A, C, GEO.hlA, o.thLabel, 24);
  const at = o.askAt ?? "D";
  if (o.ask) {
    if (at === "D") out += g4arc(D, A, C, GEO.hlB, o.ask, 24);
    else if (at === "CAD") out += g4arc(A, C, D, GEO.hlB, o.ask, 20);
    else out += g4arc(C, A, D, GEO.hlB, o.ask, 20);
  }
  out +=
    ptLabel(A.x, A.y, nA, 0, -10) +
    ptLabel(B.x, B.y, nB, -6, 17) +
    ptLabel(C.x, C.y, nC, 0, 17) +
    ptLabel(D.x, D.y, nD, 5, 17);
  return svg(`0 0 360 ${H}`, "길이가 같은 선분 세 개로 이어 붙인 삼각형 그림", out);
}

/** 이등변삼각형(AB=AC) + 밑변 연장 위 점 D와 선분 AD — 외각 관계 유형.
 *  th=∠B(실각), phi=∠ADC(실각). 라벨은 인쇄할 것만 넘긴다(∠ACB=th, ∠CAD=th−phi가 실제 값). */
export function m2ExamExtIsoFig(o: {
  th: number;
  phi: number;
  labelB?: string;
  labelD?: string;
  labelCAD?: string;
  labelACB?: string;
  names?: [string, string, string, string];
}): string {
  const tt = Math.tan((o.th * Math.PI) / 180);
  const tp = Math.tan((o.phi * Math.PI) / 180);
  const w = Math.min(96, 262 / (1 + tt / tp), 156 / tt);
  const h = w * tt;
  const H = Math.round(h) + 86;
  const gy = H - 44;
  const B = { x: 46, y: gy };
  const C = { x: 46 + 2 * w, y: gy };
  const A = { x: 46 + w, y: gy - h };
  const D = { x: A.x + h / tp, y: gy };
  const [nA, nB, nC, nD] = o.names ?? ["A", "B", "C", "D"];
  let out = g4line(B, { x: D.x + 20, y: gy }, GEO.ink, 2.2);
  out += g4poly([A, B, C], F4) + g4line(A, D, GEO.ink, 2.5);
  out += tickMark(A.x, A.y, B.x, B.y, 1) + tickMark(A.x, A.y, C.x, C.y, 1);
  if (o.labelB) out += g4arc(B, A, C, GEO.hlA, o.labelB, 23);
  if (o.labelD) out += g4arc(D, A, B, GEO.hlB, o.labelD, 24);
  if (o.labelCAD) out += g4arc(A, C, D, GEO.hlD, o.labelCAD, 20);
  if (o.labelACB) out += g4arc(C, A, B, GEO.hlD, o.labelACB, 18);
  out +=
    ptLabel(A.x, A.y, nA, 0, -10) +
    ptLabel(B.x, B.y, nB, -6, 17) +
    ptLabel(C.x, C.y, nC, -2, 17) +
    ptLabel(D.x, D.y, nD, 6, 17);
  return svg(`0 0 360 ${H}`, "이등변삼각형과 밑변의 연장선 위 점을 이은 그림", out);
}

/** 직각삼각형 카드 나열((가)(나)(다)(라)) — RHA·RHS 판별용.
 *  acute: 실제 예각(도, ∠C=밑변 오른쪽 각 기준), hyp/leg(밑변)/vleg(세로 변)/ang(각 라벨).
 *  angAt "C"(밑각)·"A"(꼭대기 각 — 라벨은 90−acute와 일치시킬 것), flip: 좌우 반전. */
export function m2ExamRhPairsFig(items: Array<{
  acute: number;
  name?: string;
  hyp?: string;
  leg?: string;
  vleg?: string;
  ang?: string;
  angAt?: "C" | "A";
  flip?: boolean;
}>): string {
  const n = items.length;
  const cols = n <= 2 ? n : 2;
  const rows = Math.ceil(n / cols);
  const cw = 360 / cols;
  // 카드 1장이면 크게 그린다(v2 확대 눈검수 반영 — 소형 렌더는 각 라벨 판독이 어려움).
  const ch = n === 1 ? 172 : 138;
  let out = "";
  items.forEach((it, i) => {
    const ox = (i % cols) * cw;
    const oy = Math.floor(i / cols) * ch;
    const ac = (it.acute * Math.PI) / 180;
    const Hh = Math.min(n === 1 ? 126 : 96, (n === 1 ? 122 : 88) / Math.sin(ac), (cw - 66) / Math.cos(ac));
    const legW = Hh * Math.cos(ac);
    const legH = Hh * Math.sin(ac);
    const s = it.flip ? -1 : 1;
    const bx = it.flip ? ox + cw / 2 + legW / 2 : ox + cw / 2 - legW / 2;
    const by = oy + (n === 1 ? 150 : 118);
    const B = { x: bx, y: by };
    const C = { x: bx + s * legW, y: by };
    const A = { x: bx, y: by - legH };
    const cen = g4cen([A, B, C]);
    out += g4poly([A, B, C]);
    out += g4right(B, C, A);
    if (it.name) out += g4text(ox + cw / 2, oy + 16, it.name, 12.5, GEO.soft);
    if (it.hyp) out += g4side(A, C, it.hyp, cen, 15);
    if (it.leg) out += g4side(B, C, it.leg, cen, 13);
    if (it.vleg) out += g4side(A, B, it.vleg, cen, 13);
    if (it.ang) {
      if ((it.angAt ?? "C") === "C") out += g4arc(C, A, B, GEO.hlA, it.ang, 20, 33, 11.5);
      else out += g4arc(A, B, C, GEO.hlA, it.ang, 18, 30, 11.5);
    }
  });
  const H = rows * ch + 6;
  return svg(`0 0 360 ${H}`, "직각삼각형 여러 개를 나란히 놓은 그림", out);
}

/** 삼각형 밑각 B·C(실각, 도)로 좌표를 만든다 — m2u4 삼각형 헬퍼 공용. */
const g4tri = (Bdeg: number, Cdeg: number, W0 = 232): { A: GPt; B: GPt; C: GPt; gy: number; H: number } => {
  const tb = Math.tan((Bdeg * Math.PI) / 180);
  const tc = Math.tan((Cdeg * Math.PI) / 180);
  const invb = Bdeg === 90 ? 0 : 1 / tb;
  const invc = Cdeg === 90 ? 0 : 1 / tc;
  let W = W0;
  let h = W / (invb + invc || 1);
  if (h > 168) {
    W = (W * 168) / h;
    h = 168;
  }
  const lx = (360 - W) / 2;
  const H = Math.round(h) + 88;
  const gy = H - 46;
  return { A: { x: lx + h * invb, y: gy - h }, B: { x: lx, y: gy }, C: { x: lx + W, y: gy }, gy, H };
};
/** 세 글자 각 키("OBC"류 — 가운데 글자가 꼭짓점) 라벨들을 그린다. 색은 hlA→hlB→hlD 순환.
 *  같은 꼭짓점에 호가 여러 개면 좁은 각을 안쪽(작은 반지름), 넓은 각을 바깥쪽으로 스태거해
 *  같은 반지름 겹침을 막는다(전체 내각+반각을 함께 표시하는 문항용). */
const g4marks = (pts: Record<string, GPt>, marks: Array<{ at: string; label: string }>, adj: Record<string, [string, string]>): string => {
  const rot = [GEO.hlA, GEO.hlB, GEO.hlD];
  const resolved = marks.map((m, i) => {
    const v = m.at.length === 1 ? m.at : m.at[1];
    const [p1, p2] = m.at.length === 1 ? adj[m.at] : [m.at[0], m.at[2]];
    const a0 = angleOf(pts[v].x, pts[v].y, pts[p1].x, pts[p1].y);
    const a1 = angleOf(pts[v].x, pts[v].y, pts[p2].x, pts[p2].y);
    const span = Math.min(normDeg(a1 - a0), normDeg(a0 - a1));
    return { m, i, v, p1, p2, span };
  });
  const byVertex: Record<string, number> = {};
  for (const r of resolved) byVertex[r.v] = (byVertex[r.v] ?? 0) + 1;
  const rank: Record<string, number> = {};
  let out = "";
  for (const r of [...resolved].sort((x, y) => (x.v === y.v ? x.span - y.span : x.v < y.v ? -1 : 1))) {
    const bump = byVertex[r.v] > 1 ? (rank[r.v] = (rank[r.v] ?? -1) + 1) : 0;
    out += g4arc(pts[r.v], pts[r.p1], pts[r.p2], rot[r.i % 3], r.m.label, 21 + bump * 9, 21 + bump * 9 + 15);
  }
  return out;
};

/** 일반 삼각형 + 꼭짓점 A에서 밑변 BC로 내린 선(cev: 수선·각 이등분선·중선).
 *  B·C가 실제 밑각(도) — ∠A=180−B−C. marks의 at은 "A"|"B"|"C"(내각)나
 *  세 글자 각 키("BAD"·"DAC"·"ADB"·"ADC"). rightAt: 직각 꺾쇠 위치. bisMark: 반각 ● 표시. */
export function m2ExamTriCevFig(o: {
  B: number;
  C: number;
  cev?: "perp" | "bisect" | "median" | null;
  footLabel?: string;
  marks?: Array<{ at: string; label: string }>;
  sides?: Partial<Record<"AB" | "AC" | "BC" | "BD" | "DC" | "AD", string>>;
  tickAB_AC?: boolean;
  tickBD_DC?: boolean;
  rightAt?: "A" | "B" | "C" | "D";
  bisMark?: boolean;
  names?: [string, string, string];
}): string {
  const { A, B, C, gy, H } = g4tri(o.B, o.C);
  const cen = g4cen([A, B, C]);
  const [nA, nB, nC] = o.names ?? ["A", "B", "C"];
  let D: GPt | null = null;
  if (o.cev === "perp") D = { x: A.x, y: gy };
  else if (o.cev === "median") D = { x: (B.x + C.x) / 2, y: gy };
  else if (o.cev === "bisect") {
    const ab = Math.hypot(A.x - B.x, A.y - B.y);
    const ac = Math.hypot(A.x - C.x, A.y - C.y);
    D = { x: B.x + ((C.x - B.x) * ab) / (ab + ac), y: gy };
  }
  let out = g4poly([A, B, C]);
  if (D) {
    out += g4line(A, D, GEO.ink, 2.2);
    out += dot(D.x, D.y, GEO.pt, 3) + ptLabel(D.x, D.y, o.footLabel ?? "D", 0, 17);
    if (o.cev === "perp") out += g4right(D, C, A);
    if (o.cev === "median") out += tickMark(B.x, B.y, D.x, D.y, 2) + tickMark(D.x, D.y, C.x, C.y, 2);
    if (o.tickBD_DC) out += tickMark(B.x, B.y, D.x, D.y, 2) + tickMark(D.x, D.y, C.x, C.y, 2);
    if (o.cev === "bisect" && o.bisMark !== false) out += g4bisMark(A, B, D, "●", 26) + g4bisMark(A, D, C, "●", 26);
  }
  if (o.tickAB_AC) out += tickMark(A.x, A.y, B.x, B.y, 1) + tickMark(A.x, A.y, C.x, C.y, 1);
  if (o.rightAt) {
    if (o.rightAt === "A") out += g4right(A, B, C);
    else if (o.rightAt === "B") out += g4right(B, C, A);
    else if (o.rightAt === "C") out += g4right(C, A, B);
    else if (D) out += g4right(D, C, A);
  }
  const pts: Record<string, GPt> = { A, B, C, ...(D ? { D } : {}) };
  const adj: Record<string, [string, string]> = { A: ["B", "C"], B: ["A", "C"], C: ["A", "B"] };
  if (o.marks) out += g4marks(pts, o.marks, adj);
  const sidePairs: Record<string, [GPt, GPt] | null> = {
    AB: [A, B],
    AC: [A, C],
    BC: [B, C],
    BD: D ? [B, D] : null,
    DC: D ? [D, C] : null,
    AD: D ? [A, D] : null,
  };
  for (const [key, lab] of Object.entries(o.sides ?? {})) {
    const pair = sidePairs[key];
    if (pair && lab) out += key === "AD" ? g4side(pair[0], pair[1], lab, { x: cen.x + 200, y: cen.y }, 13) : g4side(pair[0], pair[1], lab, cen);
  }
  out += ptLabel(A.x, A.y, nA, 0, -10) + ptLabel(B.x, B.y, nB, -7, 17) + ptLabel(C.x, C.y, nC, 7, 17);
  return svg(`0 0 360 ${H}`, "삼각형 그림", out);
}

/** 삼각형의 외심(O)·내심(I) — B·C(실각)로 삼각형·중심·원·접점이 전부 계산된다.
 *  segs: 중심→꼭짓점 선분, feet: 수선의 발(O=변 중점)/접점(I) D·E·F(+직각 표시),
 *  circle: 외접원/내접원, marks: 각 라벨(세 글자 키 — "OBC"=꼭짓점 B, "BIC"=꼭짓점 I),
 *  rLabel: 중심→BC 수직 반지름 + 라벨, tickR: 중심→꼭짓점 같은 거리 틱(외심),
 *  tickFeet: 발 조각 틱(수직이등분선 강조, 외심). */
export function m2ExamCenterFig(o: {
  kind: "O" | "I";
  B: number;
  C: number;
  segs?: Array<"A" | "B" | "C">;
  feet?: boolean;
  feetLabels?: [string, string, string];
  circle?: boolean;
  marks?: Array<{ at: string; label: string }>;
  sideLabels?: Partial<Record<"AB" | "BC" | "CA", string>>;
  /** 발이 나눈 반변 조각 라벨(v2 확대 확장 — feet:true 필요, 외심 "발=중점" 유형 비Ⅳ1-03). */
  segLabels?: Array<{ on: "AD" | "DB" | "BE" | "EC" | "CF" | "FA"; label: string }>;
  /** 내심 I를 지나는 BC 평행선 D~E(v2 확대 확장 — kind I 전용, 미06-06 둘레 치환). */
  paraLine?: boolean;
  paraNames?: [string, string];
  rLabel?: string;
  tickR?: boolean;
  tickFeet?: boolean;
  names?: [string, string, string];
  centerName?: string;
}): string {
  const { A, B, C, gy, H } = g4tri(o.B, o.C, 244);
  const cen = g4cen([A, B, C]);
  let ctr: GPt;
  let r = 0;
  if (o.kind === "O") {
    const ox = (B.x + C.x) / 2;
    const oy = ((A.x - ox) * (A.x - ox) + A.y * A.y - (B.x - ox) * (B.x - ox) - B.y * B.y) / (2 * (A.y - B.y));
    ctr = { x: ox, y: oy };
    r = Math.hypot(ctr.x - B.x, ctr.y - B.y);
  } else {
    const a = Math.hypot(B.x - C.x, B.y - C.y);
    const b = Math.hypot(A.x - C.x, A.y - C.y);
    const c = Math.hypot(A.x - B.x, A.y - B.y);
    ctr = { x: (a * A.x + b * B.x + c * C.x) / (a + b + c), y: (a * A.y + b * B.y + c * C.y) / (a + b + c) };
    r = gy - ctr.y;
  }
  const [nA, nB, nC] = o.names ?? ["A", "B", "C"];
  const cName = o.centerName ?? o.kind;
  let out = "";
  if (o.circle)
    out += `<circle cx="${ctr.x.toFixed(1)}" cy="${ctr.y.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${o.kind === "O" ? GEO.soft : GEO.hlB}" stroke-width="1.8"/>`;
  out += g4poly([A, B, C], o.kind === "I" && o.circle ? "none" : F4);
  const proj = (P: GPt, Q: GPt): GPt => {
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    const t = ((ctr.x - P.x) * dx + (ctr.y - P.y) * dy) / (dx * dx + dy * dy);
    return { x: P.x + t * dx, y: P.y + t * dy };
  };
  if (o.feet) {
    const fAB = o.kind === "O" ? { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 } : proj(A, B);
    const fBC = o.kind === "O" ? { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 } : proj(B, C);
    const fCA = o.kind === "O" ? { x: (C.x + A.x) / 2, y: (C.y + A.y) / 2 } : proj(C, A);
    const [lD, lE, lF] = o.feetLabels ?? ["D", "E", "F"];
    out += g4line(ctr, fAB, GEO.ink, 1.8, "5 4") + g4line(ctr, fBC, GEO.ink, 1.8, "5 4") + g4line(ctr, fCA, GEO.ink, 1.8, "5 4");
    out += g4right(fAB, B, ctr, 8) + g4right(fBC, C, ctr, 8) + g4right(fCA, A, ctr, 8);
    out += dot(fAB.x, fAB.y, GEO.pt, 3) + dot(fBC.x, fBC.y, GEO.pt, 3) + dot(fCA.x, fCA.y, GEO.pt, 3);
    out += ptLabel(fAB.x, fAB.y, lD, -13, 2) + ptLabel(fBC.x, fBC.y, lE, 0, 18) + ptLabel(fCA.x, fCA.y, lF, 14, 2);
    if (o.tickFeet && o.kind === "O")
      out +=
        tickMark(A.x, A.y, fAB.x, fAB.y, 1) +
        tickMark(fAB.x, fAB.y, B.x, B.y, 1) +
        tickMark(B.x, B.y, fBC.x, fBC.y, 2) +
        tickMark(fBC.x, fBC.y, C.x, C.y, 2) +
        tickMark(C.x, C.y, fCA.x, fCA.y, 3) +
        tickMark(fCA.x, fCA.y, A.x, A.y, 3);
    if (o.segLabels) {
      const segMap: Record<string, [GPt, GPt]> = {
        AD: [A, fAB], DB: [fAB, B], BE: [B, fBC], EC: [fBC, C], CF: [C, fCA], FA: [fCA, A],
      };
      for (const s of o.segLabels) {
        const pair = segMap[s.on];
        if (pair) out += g4side(pair[0], pair[1], s.label, cen, 15);
      }
    }
  }
  for (const v of o.segs ?? []) {
    const P = v === "A" ? A : v === "B" ? B : C;
    out += g4line(ctr, P, GEO.ink, 2.2);
    if (o.tickR && o.kind === "O") out += tickMark(ctr.x, ctr.y, P.x, P.y, 1);
  }
  if (o.paraLine && o.kind === "I") {
    // I를 지나는 BC 평행선(수평) — AB·AC와의 교점 D·E 실계산, 평행 화살표 이중.
    const tD = (ctr.y - A.y) / (B.y - A.y);
    const Dp = { x: A.x + (B.x - A.x) * tD, y: ctr.y };
    const tE = (ctr.y - A.y) / (C.y - A.y);
    const Ep = { x: A.x + (C.x - A.x) * tE, y: ctr.y };
    const [nD, nE] = o.paraNames ?? ["D", "E"];
    out += g4line(Dp, Ep, GEO.ink, 2.2);
    out += arrowHead((Dp.x + Ep.x) / 2 + 5, ctr.y, 0) + arrowHead((B.x + C.x) / 2 + 5, gy, 0);
    out += dot(Dp.x, Dp.y, GEO.pt, 3) + dot(Ep.x, Ep.y, GEO.pt, 3);
    out += ptLabel(Dp.x, Dp.y, nD, -12, -2) + ptLabel(Ep.x, Ep.y, nE, 13, -2);
  }
  if (o.rLabel) {
    const f = { x: ctr.x, y: gy };
    out += g4line(ctr, f, GEO.hlB, 2.2) + g4right(f, C, ctr, 8);
    out += g4text(ctr.x + 16, (ctr.y + gy) / 2 + 4, o.rLabel, 12, GEO.hlB);
  }
  const pts: Record<string, GPt> = { A, B, C, O: ctr, I: ctr };
  const adj: Record<string, [string, string]> = { A: ["B", "C"], B: ["A", "C"], C: ["A", "B"] };
  if (o.marks) out += g4marks(pts, o.marks, adj);
  for (const [key, lab] of Object.entries(o.sideLabels ?? {})) {
    if (!lab) continue;
    const pair = key === "AB" ? [A, B] : key === "BC" ? [B, C] : [C, A];
    out += g4side(pair[0], pair[1], lab, cen);
  }
  out += dot(ctr.x, ctr.y, GEO.pt, 3.4) + ptLabel(ctr.x, ctr.y, cName, 12, -5);
  out += ptLabel(A.x, A.y, nA, 0, -10) + ptLabel(B.x, B.y, nB, -8, 16) + ptLabel(C.x, C.y, nC, 8, 16);
  // 둔각삼각형 외심은 BC 아래 외부로 나가고, 외접원은 밑변 아래로 불룩하다 — 뷰박스만 아래로 확장(v2 확대).
  const H2 = Math.max(H, Math.round(ctr.y) + 50, o.circle ? Math.round(ctr.y + r) + 16 : 0);
  return svg(`0 0 360 ${H2}`, o.kind === "O" ? "삼각형과 한 점 O를 나타낸 그림" : "삼각형과 한 점 I를 나타낸 그림", out);
}

/** 직각삼각형(∠B=90°)과 빗변 AC의 중점 O — 외접원 반지름·빗변 유형.
 *  acute: 실제 ∠A(도, 그리기용), hyp: 빗변 라벨, obLabel: OB 라벨, ticks: OA·OB·OC 틱. */
export function m2ExamCircumRightFig(o: {
  acute?: number;
  hyp?: string;
  obLabel?: string;
  circle?: boolean;
  ticks?: boolean;
  names?: [string, string, string];
  oName?: string;
}): string {
  const ac = ((o.acute ?? 47) * Math.PI) / 180;
  const ab = Math.min(138, 236 / Math.tan(ac));
  const bc = ab * Math.tan(ac);
  const H = Math.round(ab) + 90;
  const gy = H - 46;
  const B = { x: (360 - bc) / 2, y: gy };
  const A = { x: B.x, y: gy - ab };
  const C = { x: B.x + bc, y: gy };
  const O = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const cen = g4cen([A, B, C]);
  const [nA, nB, nC] = o.names ?? ["A", "B", "C"];
  let out = "";
  let H2 = H;
  if (o.circle) {
    const r = Math.hypot(O.x - A.x, O.y - A.y);
    out += `<circle cx="${O.x.toFixed(1)}" cy="${O.y.toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="${GEO.soft}" stroke-width="1.8"/>`;
    // 외접원은 밑변 아래로 불룩하다 — 뷰박스 하단 확장(v2 확대 눈검수 반영).
    H2 = Math.max(H, Math.round(O.y + r) + 16);
  }
  out += g4poly([A, B, C]) + g4right(B, C, A);
  out += g4line(O, B, GEO.ink, 2.2);
  if (o.ticks !== false) out += tickMark(O.x, O.y, A.x, A.y, 1) + tickMark(O.x, O.y, C.x, C.y, 1) + tickMark(O.x, O.y, B.x, B.y, 1);
  if (o.hyp) out += g4side(A, O, o.hyp, cen, 17);
  if (o.obLabel) out += g4side(O, B, o.obLabel, { x: cen.x - 200, y: cen.y }, 13);
  out += dot(O.x, O.y, GEO.pt, 3.4) + ptLabel(O.x, O.y, o.oName ?? "O", 10, -8);
  out += ptLabel(A.x, A.y, nA, -8, -4) + ptLabel(B.x, B.y, nB, -8, 16) + ptLabel(C.x, C.y, nC, 8, 16);
  return svg(`0 0 360 ${H2}`, "직각삼각형과 빗변 위의 점 O를 나타낸 그림", out);
}

/** 평행사변형 ▱ABCD 좌표(A 좌상 → B 좌하 → C 우하 → D 우상). angleB가 실제 ∠B(도). */
const g4para = (angleB = 61, w = 208, h = 116): { A: GPt; B: GPt; C: GPt; D: GPt; O: GPt; H: number } => {
  const off = h / Math.tan((angleB * Math.PI) / 180);
  const lx = (360 - w - off) / 2;
  const H = h + 96;
  const gy = H - 48;
  const B = { x: lx, y: gy };
  const C = { x: lx + w, y: gy };
  const A = { x: lx + off, y: gy - h };
  const D = { x: lx + off + w, y: gy - h };
  return { A, B, C, D, O: { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 }, H };
};

/** 평행사변형 범용 — angles/sides 라벨, diag: 대각선, oLabels: 교점 조각 라벨,
 *  ticksOpp: 대변 틱(AD·BC 1, AB·DC 2) · ticksDiag: OA=OC(1)·OB=OD(2) · arrows: 평행 화살표. */
export function m2ExamParaFig(o: {
  angleB?: number;
  w?: number;
  h?: number;
  angles?: Partial<Record<"A" | "B" | "C" | "D", string>>;
  sides?: Partial<Record<"AB" | "BC" | "CD" | "DA", string>>;
  diag?: "AC" | "BD" | "both";
  oName?: string;
  oLabels?: Partial<Record<"OA" | "OB" | "OC" | "OD", string>>;
  ticksOpp?: boolean;
  ticksDiag?: boolean;
  arrows?: boolean;
  /** 세 글자 각 키 부분각 라벨(v2 확대 확장 — 대각선 엇각 유형, 예: "DBC"·"ABD"·"DAC"). */
  marks?: Array<{ at: string; label: string }>;
  /** 5번 조건 시각화(v2 확대 확장): AD·BC 한 쌍에만 틱+평행 화살표. */
  pair5?: boolean;
  names?: [string, string, string, string];
}): string {
  const { A, B, C, D, O, H } = g4para(o.angleB, o.w, o.h);
  const cen = O;
  const [nA, nB, nC, nD] = o.names ?? ["A", "B", "C", "D"];
  let out = g4poly([A, B, C, D]);
  if (o.diag === "AC" || o.diag === "both") out += g4line(A, C, GEO.ink, 2.2);
  if (o.diag === "BD" || o.diag === "both") out += g4line(B, D, GEO.ink, 2.2);
  if (o.diag) {
    out += dot(O.x, O.y, GEO.pt, 3.2);
    if (o.oName !== "") out += ptLabel(O.x, O.y, o.oName ?? "O", 0, -9);
  }
  if (o.ticksOpp)
    out +=
      tickMark(A.x, A.y, D.x, D.y, 1) +
      tickMark(B.x, B.y, C.x, C.y, 1) +
      tickMark(A.x, A.y, B.x, B.y, 2) +
      tickMark(D.x, D.y, C.x, C.y, 2);
  if (o.ticksDiag)
    out +=
      tickMark(A.x, A.y, O.x, O.y, 1) +
      tickMark(O.x, O.y, C.x, C.y, 1) +
      tickMark(B.x, B.y, O.x, O.y, 2) +
      tickMark(O.x, O.y, D.x, D.y, 2);
  if (o.arrows) {
    const mAD = { x: (A.x + D.x) / 2, y: A.y };
    const mBC = { x: (B.x + C.x) / 2, y: B.y };
    out += arrowHead(mAD.x + 5, mAD.y, 0) + arrowHead(mBC.x + 5, mBC.y, 0);
    const dirAB = angleOf(A.x, A.y, B.x, B.y);
    const mAB = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    const mDC = { x: (D.x + C.x) / 2, y: (D.y + C.y) / 2 };
    const off2 = polar(0, 0, 5, dirAB);
    out += arrowHead(mAB.x, mAB.y, dirAB) + arrowHead(mAB.x + off2.x, mAB.y + off2.y, dirAB);
    out += arrowHead(mDC.x, mDC.y, dirAB) + arrowHead(mDC.x + off2.x, mDC.y + off2.y, dirAB);
  }
  const angDefs: Record<string, [GPt, GPt, GPt]> = { A: [A, B, D], B: [B, A, C], C: [C, B, D], D: [D, C, A] };
  const rot = [GEO.hlA, GEO.hlB, GEO.hlD, GEO.hlA];
  let k = 0;
  for (const [key, lab] of Object.entries(o.angles ?? {})) {
    if (!lab) continue;
    const [v, p1, p2] = angDefs[key];
    out += g4arc(v, p1, p2, rot[k % 4], lab, 20);
    k += 1;
  }
  const sideDefs: Record<string, [GPt, GPt]> = { AB: [A, B], BC: [B, C], CD: [C, D], DA: [D, A] };
  for (const [key, lab] of Object.entries(o.sides ?? {})) {
    if (lab) out += g4side(sideDefs[key][0], sideDefs[key][1], lab, cen);
  }
  const oSegDefs: Record<string, [GPt, GPt]> = { OA: [O, A], OB: [O, B], OC: [O, C], OD: [O, D] };
  for (const [key, lab] of Object.entries(o.oLabels ?? {})) {
    if (lab) out += g4side(oSegDefs[key][0], oSegDefs[key][1], lab, cen, 12);
  }
  if (o.pair5) {
    out += tickMark(A.x, A.y, D.x, D.y, 1) + tickMark(B.x, B.y, C.x, C.y, 1);
    out += arrowHead((A.x + D.x) / 2 + 5, A.y, 0) + arrowHead((B.x + C.x) / 2 + 5, B.y, 0);
  }
  if (o.marks) {
    const pts: Record<string, GPt> = { A, B, C, D, O };
    const adj: Record<string, [string, string]> = { A: ["B", "D"], B: ["A", "C"], C: ["B", "D"], D: ["A", "C"] };
    out += g4marks(pts, o.marks, adj);
  }
  out +=
    ptLabel(A.x, A.y, nA, -6, -8) +
    ptLabel(B.x, B.y, nB, -7, 17) +
    ptLabel(C.x, C.y, nC, 7, 17) +
    ptLabel(D.x, D.y, nD, 7, -8);
  return svg(`0 0 360 ${H}`, "평행사변형 그림", out);
}

/** 평행사변형 + 각의 이등분선 — mode "A"(∠A의 이등분선이 BC와 만나는 점 E) ·
 *  "AD"(∠A→E, ∠D→F 둘 다 BC 위) · "Bext"(∠B의 이등분선이 DC의 연장과 만나는 점 E).
 *  angleB(실제 ∠B)·ratio(BC÷AB 실제 비)로 좌표 계산 — 길이 라벨은 labels로. */
export function m2ExamParaBisectFig(o: {
  mode: "A" | "AD" | "Bext";
  angleB?: number;
  ratio?: number;
  labels?: Array<{ on: string; label: string }>;
  eName?: string;
  fName?: string;
  names?: [string, string, string, string];
}): string {
  const beta = o.angleB ?? 62;
  const h = o.mode === "Bext" ? 96 : 112;
  const s = h / Math.sin((beta * Math.PI) / 180);
  const w = (o.ratio ?? 1.55) * s;
  const off = h / Math.tan((beta * Math.PI) / 180);
  const extra = o.mode === "Bext" ? 54 : 0;
  const lx = (360 - w - off) / 2 - extra / 2;
  const H = h + 100 + extra;
  const gy = H - 50;
  const B = { x: lx, y: gy };
  const C = { x: lx + w, y: gy };
  const A = { x: lx + off, y: gy - h };
  const D = { x: lx + off + w, y: gy - h };
  const cen = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const [nA, nB, nC, nD] = o.names ?? ["A", "B", "C", "D"];
  const unit = (p: GPt, q: GPt): GPt => {
    const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return { x: (q.x - p.x) / d, y: (q.y - p.y) / d };
  };
  const bisFoot = (v: GPt, e1: GPt, e2: GPt, lineP: GPt, lineQ: GPt): GPt => {
    const u1 = unit(v, e1);
    const u2 = unit(v, e2);
    const dir = { x: u1.x + u2.x, y: u1.y + u2.y };
    const dx = lineQ.x - lineP.x;
    const dy = lineQ.y - lineP.y;
    const den = dir.x * dy - dir.y * dx;
    const t = ((lineP.x - v.x) * dy - (lineP.y - v.y) * dx) / den;
    return { x: v.x + dir.x * t, y: v.y + dir.y * t };
  };
  let out = g4poly([A, B, C, D]);
  const pts: Record<string, GPt> = { A, B, C, D };
  if (o.mode === "A" || o.mode === "AD") {
    const E = bisFoot(A, B, D, B, C);
    pts[o.eName ?? "E"] = E;
    out += g4line(A, E, GEO.ink, 2.2);
    out += g4bisMark(A, B, E, "●", 24) + g4bisMark(A, E, D, "●", 24);
    out += g4arc(A, B, E, GEO.hlA, undefined, 16) + g4arc(A, E, D, GEO.hlA, undefined, 16);
    out += dot(E.x, E.y, GEO.pt, 3) + ptLabel(E.x, E.y, o.eName ?? "E", 0, 17);
    if (o.mode === "AD") {
      const F = bisFoot(D, A, C, B, C);
      pts[o.fName ?? "F"] = F;
      out += g4line(D, F, GEO.ink, 2.2);
      out += g4bisMark(D, A, F, "○", 24) + g4bisMark(D, F, C, "○", 24);
      out += g4arc(D, C, F, GEO.hlB, undefined, 16) + g4arc(D, F, A, GEO.hlB, undefined, 16);
      out += dot(F.x, F.y, GEO.pt, 3) + ptLabel(F.x, F.y, o.fName ?? "F", 0, 17);
    }
  } else {
    const E = bisFoot(B, A, C, D, C);
    pts[o.eName ?? "E"] = E;
    out += g4line(D, E, GEO.ink, 1.8, "6 5");
    out += g4line(B, E, GEO.ink, 2.2);
    out += g4bisMark(B, A, E, "●", 24) + g4bisMark(B, E, C, "●", 24);
    out += g4arc(B, C, E, GEO.hlA, undefined, 16) + g4arc(B, E, A, GEO.hlA, undefined, 16);
    out += dot(E.x, E.y, GEO.pt, 3) + ptLabel(E.x, E.y, o.eName ?? "E", 8, -6);
  }
  const segMap = (key: string): [GPt, GPt] | null => {
    if (key.length !== 2) return null;
    const p = pts[key[0]];
    const q = pts[key[1]];
    return p && q ? [p, q] : null;
  };
  for (const item of o.labels ?? []) {
    const pair = segMap(item.on);
    if (pair) out += g4side(pair[0], pair[1], item.label, cen, 13);
  }
  out +=
    ptLabel(A.x, A.y, nA, -6, -8) +
    ptLabel(B.x, B.y, nB, -7, 17) +
    ptLabel(C.x, C.y, nC, 7, 17) +
    // Bext 모드는 D 위로 점선(D~E)이 지나가므로 D 라벨을 아래-오른쪽으로 내린다(검수 반영).
    ptLabel(D.x, D.y, nD, o.mode === "Bext" ? 13 : 7, o.mode === "Bext" ? 11 : -8);
  return svg(`0 0 360 ${H}`, "평행사변형과 각의 이등분선 그림", out);
}

/** 직사각형·마름모·정사각형 대각선 그림 — 표준 배치(직사 A좌상→B좌하→C우하→D우상 ·
 *  마름모 A위→B왼→C아래→D오른). marks: 세 글자 각 키(가운데가 꼭짓점, O·P 포함).
 *  pt: 대각선 위 점 P(t는 0~1 위치, segTo로 꼭짓점 연결). */
export function m2ExamQuadDiagFig(o: {
  kind: "rect" | "rhom" | "sq";
  diag?: boolean | "AC" | "BD";
  marks?: Array<{ at: string; label: string }>;
  sides?: Partial<Record<"AB" | "BC" | "CD" | "DA", string>>;
  oSegs?: Partial<Record<"OA" | "OB" | "OC" | "OD" | "AC" | "BD", string>>;
  rightO?: boolean;
  tickSides?: boolean;
  tickDiag?: "all" | "pairs" | null;
  pt?: { on: "AC" | "BD"; t: number; name?: string; segTo?: Array<"A" | "B" | "C" | "D"> };
  oName?: string;
  names?: [string, string, string, string];
  /** 라벨-실각 일치용 실제 비율: rect는 w·h(∠OAD=atan(h/w)), rhom은 d1(가로)·d2(세로) — atan(d2/d1)=∠OBC. */
  shape?: { w?: number; h?: number; d1?: number; d2?: number };
}): string {
  let A: GPt;
  let B: GPt;
  let C: GPt;
  let D: GPt;
  let H: number;
  if (o.kind === "rect") {
    const w = Math.min(o.shape?.w ?? 222, 288);
    const h = Math.min(o.shape?.h ?? 126, 210);
    A = { x: 181 - w / 2, y: 52 };
    B = { x: 181 - w / 2, y: 52 + h };
    C = { x: 181 + w / 2, y: 52 + h };
    D = { x: 181 + w / 2, y: 52 };
    H = 52 + h + 44;
  } else if (o.kind === "sq") {
    A = { x: 98, y: 46 };
    B = { x: 98, y: 214 };
    C = { x: 266, y: 214 };
    D = { x: 266, y: 46 };
    H = 258;
  } else {
    const d1 = Math.min(o.shape?.d1 ?? 228, 300);
    const d2 = Math.min(o.shape?.d2 ?? 164, 210);
    A = { x: 180, y: 120 - d2 / 2 };
    B = { x: 180 - d1 / 2, y: 120 };
    C = { x: 180, y: 120 + d2 / 2 };
    D = { x: 180 + d1 / 2, y: 120 };
    H = 120 + d2 / 2 + 40;
  }
  const O = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const cen = O;
  const [nA, nB, nC, nD] = o.names ?? ["A", "B", "C", "D"];
  let out = g4poly([A, B, C, D]);
  const dm = o.diag ?? true;
  const dAC = dm === true || dm === "AC";
  const dBD = dm === true || dm === "BD";
  if (dAC) out += g4line(A, C, GEO.ink, 2.2);
  if (dBD) out += g4line(B, D, GEO.ink, 2.2);
  if (dAC && dBD) {
    out += dot(O.x, O.y, GEO.pt, 3.2);
    if (o.oName !== "") out += ptLabel(O.x, O.y, o.oName ?? "O", o.kind === "rhom" ? 0 : 12, o.kind === "rhom" ? -9 : -7);
    if (o.rightO !== false && (o.kind === "rhom" || o.kind === "sq")) out += g4right(O, D, A, 9);
  }
  if (o.tickSides) out += tickMark(A.x, A.y, B.x, B.y, 1) + tickMark(B.x, B.y, C.x, C.y, 1) + tickMark(C.x, C.y, D.x, D.y, 1) + tickMark(D.x, D.y, A.x, A.y, 1);
  if (o.tickDiag === "all")
    out += tickMark(O.x, O.y, A.x, A.y, 1) + tickMark(O.x, O.y, B.x, B.y, 1) + tickMark(O.x, O.y, C.x, C.y, 1) + tickMark(O.x, O.y, D.x, D.y, 1);
  else if (o.tickDiag === "pairs")
    out += tickMark(O.x, O.y, A.x, A.y, 1) + tickMark(O.x, O.y, C.x, C.y, 1) + tickMark(O.x, O.y, B.x, B.y, 2) + tickMark(O.x, O.y, D.x, D.y, 2);
  const pts: Record<string, GPt> = { A, B, C, D, O };
  if (o.pt) {
    const [p, q] = o.pt.on === "AC" ? [A, C] : [B, D];
    const P = { x: p.x + (q.x - p.x) * o.pt.t, y: p.y + (q.y - p.y) * o.pt.t };
    pts[o.pt.name ?? "P"] = P;
    for (const v of o.pt.segTo ?? []) out += g4line(P, pts[v], GEO.ink, 2.2);
    out += dot(P.x, P.y, GEO.pt, 3.2) + ptLabel(P.x, P.y, o.pt.name ?? "P", 12, -4);
  }
  const adj: Record<string, [string, string]> = { A: ["B", "D"], B: ["A", "C"], C: ["B", "D"], D: ["C", "A"] };
  if (o.marks) out += g4marks(pts, o.marks, adj);
  const sideDefs: Record<string, [GPt, GPt]> = { AB: [A, B], BC: [B, C], CD: [C, D], DA: [D, A] };
  for (const [key, lab] of Object.entries(o.sides ?? {})) {
    if (lab) out += g4side(sideDefs[key][0], sideDefs[key][1], lab, cen);
  }
  const oSegDefs: Record<string, [GPt, GPt]> = { OA: [O, A], OB: [O, B], OC: [O, C], OD: [O, D], AC: [A, C], BD: [B, D] };
  for (const [key, lab] of Object.entries(o.oSegs ?? {})) {
    if (lab) out += g4side(oSegDefs[key][0], oSegDefs[key][1], lab, cen, 12);
  }
  if (o.kind === "rhom")
    out += ptLabel(A.x, A.y, nA, 0, -9) + ptLabel(B.x, B.y, nB, -14, 4) + ptLabel(C.x, C.y, nC, 0, 18) + ptLabel(D.x, D.y, nD, 14, 4);
  else
    out += ptLabel(A.x, A.y, nA, -8, -7) + ptLabel(B.x, B.y, nB, -8, 16) + ptLabel(C.x, C.y, nC, 8, 16) + ptLabel(D.x, D.y, nD, 8, -7);
  const kindName = o.kind === "rect" ? "직사각형" : o.kind === "sq" ? "정사각형" : "마름모";
  return svg(`0 0 360 ${H}`, `${kindName} 그림`, out);
}

/** 사각형 가족 관계도(조건의 계단) — 화살표 조건 라벨을 hide 순서대로 ㉠㉡㉢로 가리고,
 *  hideNode의 노드 이름은 ㉮㉯로 가린다. variant: "angleSide"(내각·변 조건)·"diag"(대각선 조건).
 *  edge 키: q2t(사각형→사다리꼴) t2p(→평행사변형) p2r(→직사각형) p2m(→마름모) r2s·m2s(→정사각형). */
export function m2ExamFamilyFig(o: {
  hide?: Array<"q2t" | "t2p" | "p2r" | "p2m" | "r2s" | "m2s">;
  hideNode?: Array<"trap" | "para" | "rect" | "rhom" | "sq">;
  variant?: "angleSide" | "diag";
}): string {
  const labelsAS: Record<string, string> = {
    q2t: "한 쌍의 대변이 평행",
    t2p: "다른 한 쌍의 대변도 평행",
    p2r: "한 내각이 직각",
    p2m: "이웃하는 두 변의\n길이가 같음",
    r2s: "이웃하는 두 변의\n길이가 같음",
    m2s: "한 내각이 직각",
  };
  const labelsDG: Record<string, string> = {
    q2t: "한 쌍의 대변이 평행",
    t2p: "다른 한 쌍의 대변도 평행",
    p2r: "두 대각선의\n길이가 같음",
    p2m: "두 대각선이\n서로 수직",
    r2s: "두 대각선이\n서로 수직",
    m2s: "두 대각선의\n길이가 같음",
  };
  const base = o.variant === "diag" ? labelsDG : labelsAS;
  const gname = ["㉠", "㉡", "㉢", "㉣"];
  const nname = ["㉮", "㉯"];
  const lab: Record<string, string> = { ...base };
  (o.hide ?? []).forEach((key, i) => {
    lab[key] = gname[i] ?? "㉠";
  });
  const nodeName: Record<string, string> = { quad: "사각형", trap: "사다리꼴", para: "평행사변형", rect: "직사각형", rhom: "마름모", sq: "정사각형" };
  (o.hideNode ?? []).forEach((key, i) => {
    nodeName[key] = nname[i] ?? "㉮";
  });
  const pos: Record<string, { x: number; y: number }> = {
    quad: { x: 180, y: 26 },
    trap: { x: 180, y: 86 },
    para: { x: 180, y: 146 },
    rect: { x: 84, y: 224 },
    rhom: { x: 276, y: 224 },
    sq: { x: 180, y: 306 },
  };
  const node = (key: string): string => {
    const p = pos[key];
    const hidden = (o.hideNode ?? []).includes(key as "trap");
    const w = nodeName[key].length * 13 + 26;
    return (
      `<rect x="${p.x - w / 2}" y="${p.y - 15}" width="${w}" height="30" rx="10" fill="${hidden ? "#FFF4E0" : "#FFFFFF"}" stroke="${hidden ? GEO.hlA : GEO.ink}" stroke-width="1.8"/>` +
      g4text(p.x, p.y + 4.5, nodeName[key], 13)
    );
  };
  const edge = (from: string, to: string, key: string, side: "L" | "R" | "C"): string => {
    const p = pos[from];
    const q = pos[to];
    const P = { x: p.x, y: p.y + 15 };
    const Q = { x: q.x, y: q.y - 15 };
    const dx = Q.x - P.x;
    const shift = side === "C" ? 0 : side === "L" ? -4 : 4;
    let out2 =
      `<line x1="${P.x + shift}" y1="${P.y + 2}" x2="${Q.x - (dx === 0 ? -shift : 0)}" y2="${Q.y - 4}" stroke="${GEO.soft}" stroke-width="2"/>` +
      arrowHead(Q.x - (dx === 0 ? -shift : 0), Q.y - 3, angleOf(P.x, P.y, Q.x, Q.y + 6), GEO.soft, 6);
    const mx = (P.x + Q.x) / 2;
    const my = (P.y + Q.y) / 2 + 3;
    const text = lab[key];
    const hidden = isAskLabel(text);
    const lines = text.split("\n");
    const tw = Math.max(...lines.map((l) => l.length)) * 11.8 + 14;
    const bh = lines.length * 15.5 + 6;
    // 필 배치(검수 반영): 대각 화살표(L·R)는 필을 화살표 선 옆으로 완전히 비켜 세워 화살표를
    // 가리지 않고, 텍스트는 전부 필 중앙 정렬. 세로(C)는 선 중간을 끊는 중앙 필 관례 유지.
    const tx = side === "C" ? mx : side === "L" ? mx - tw / 2 - 7 : mx + tw / 2 + 7;
    const bx = tx - tw / 2;
    out2 += `<rect x="${bx.toFixed(1)}" y="${my - bh / 2}" width="${tw.toFixed(1)}" height="${bh}" rx="7" fill="${hidden ? "#FFF4E0" : "#F4F7FE"}" stroke="${hidden ? GEO.hlA : "#D5DEF0"}" stroke-width="1.2"/>`;
    lines.forEach((ln, i) => {
      out2 += `<text x="${tx.toFixed(1)}" y="${my - bh / 2 + 15.5 * i + 15}" text-anchor="middle" font-size="12" font-weight="700" fill="${GEO.ink}">${ln}</text>`;
    });
    return out2;
  };
  let out = "";
  out += edge("quad", "trap", "q2t", "C");
  out += edge("trap", "para", "t2p", "C");
  out += edge("para", "rect", "p2r", "L");
  out += edge("para", "rhom", "p2m", "R");
  out += edge("rect", "sq", "r2s", "L");
  out += edge("rhom", "sq", "m2s", "R");
  out += node("quad") + node("trap") + node("para") + node("rect") + node("rhom") + node("sq");
  return svg("0 0 360 334", "사각형 가족의 관계를 조건 화살표로 이은 그림", out);
}

/** 사각형 미니 카드 나열(ㄱ~ㅁ) — kinds 순서대로. diag: 두 대각선(가는 남색).
 *  trap은 좌우 기울기가 다른 "삐딱한" 사다리꼴로 그린다(특수 사다리꼴 명명 금지 원칙). */
export function m2ExamQuadRowFig(o: {
  kinds: Array<"trap" | "para" | "rect" | "rhom" | "sq" | "kite" | "quad">;
  labels?: string[];
  diag?: boolean;
}): string {
  const n = o.kinds.length;
  const cw = 360 / n;
  const SH: Record<string, Array<[number, number]>> = {
    trap: [[4, 50], [60, 50], [46, 10], [22, 10]],
    para: [[2, 50], [46, 50], [60, 10], [16, 10]],
    rect: [[4, 50], [60, 50], [60, 12], [4, 12]],
    rhom: [[31, 4], [6, 29], [31, 54], [56, 29]],
    sq: [[12, 50], [52, 50], [52, 10], [12, 10]],
    kite: [[31, 4], [12, 26], [31, 56], [50, 26]],
    quad: [[6, 44], [32, 54], [58, 24], [22, 8]],
  };
  const sc = n === 1 ? 1.9 : n === 2 ? 1.45 : 1;
  let out = "";
  o.kinds.forEach((kind, i) => {
    const ox = i * cw + (cw - 64 * sc) / 2;
    const oy = 12;
    const pts = SH[kind].map(([x, y]) => ({ x: ox + x * sc, y: oy + y * sc }));
    out += g4poly(pts, F4, 2.2);
    if (o.diag) {
      out += g4line(pts[0], pts[2], NAVY, 1.6) + g4line(pts[1], pts[3], NAVY, 1.6);
    }
    const label = (o.labels ?? ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ"])[i] ?? "";
    if (label) out += g4text(i * cw + cw / 2, 12 + 56 * sc + 22, label, 12.5, GEO.soft);
  });
  const H = Math.round(12 + 56 * sc + 30);
  return svg(`0 0 360 ${H}`, "여러 가지 사각형을 나란히 놓은 그림", out);
}

/** 평행선과 넓이 — mode "twin"(평행선 l·m 사이 같은 밑변 BC의 두 삼각형) ·
 *  "trap"(AD∥BC 사다리꼴 + 두 대각선·교점 O) · "para"(평행사변형 + 대각선 음영) ·
 *  "bent"(꺾인 경계 밭 ABCD + AC와 평행한 보조선 D→E, 경계 펴기).
 *  shade: 음영 도형(꼭짓점 문자열, twin·trap·para) · areaLabel: 음영 안 조건 넓이 라벨. */
export function m2ExamEqAreaFig(o: {
  mode: "twin" | "trap" | "para" | "bent" | "split";
  shade?: string;
  areaLabel?: { in: string; label: string };
  diag?: "AC" | "both";
  aX?: number;
  dX?: number;
  segAD?: boolean;
  lineNames?: [string, string];
  names?: string[];
  /** split(등고 비율 · 천04-08 계보 · v2 확대 확장): D가 BC를 m:n으로 나눈다(실비 렌더). */
  m?: number;
  n?: number;
  splitLabels?: { bd?: string; dc?: string };
  /** bent 전용 라벨(v2 검수 반영): BC·CE 구간과 A~직선 BC 수선(점선+직각 마크) 높이. */
  bentLabels?: { bc?: string; ce?: string; height?: string };
}): string {
  let out = "";
  let H = 240;
  const pts: Record<string, GPt> = {};
  const shadePoly = (letters: string, fill = F4B): string => {
    const ps = letters.split("").map((ch) => pts[ch]).filter(Boolean);
    return ps.length >= 3 ? `<path d="M${ps.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")} Z" fill="${fill}" stroke="none"/>` : "";
  };
  if (o.mode === "twin") {
    H = 238;
    const yT = 52;
    const yB = 190;
    const [lnT, lnB] = o.lineNames ?? ["l", "m"];
    pts.B = { x: 118, y: yB };
    pts.C = { x: 262, y: yB };
    pts.A = { x: o.aX ?? 92, y: yT };
    pts.D = { x: o.dX ?? 234, y: yT };
    out += lineSvg(24, yT, 336, yT, GEO.ink, 2.2) + lineSvg(24, yB, 336, yB, GEO.ink, 2.2);
    out += `<text x="344" y="${yT + 4}" text-anchor="middle" font-size="12.5" font-weight="800" font-style="italic" fill="${GEO.ink}">${lnT}</text>`;
    out += `<text x="344" y="${yB + 4}" text-anchor="middle" font-size="12.5" font-weight="800" font-style="italic" fill="${GEO.ink}">${lnB}</text>`;
    if (o.shade) out += shadePoly(o.shade);
    out += g4line(pts.A, pts.B, GEO.ink, 2.4) + g4line(pts.A, pts.C, GEO.ink, 2.4);
    out += g4line(pts.D, pts.B, GEO.ink, 2.4) + g4line(pts.D, pts.C, GEO.ink, 2.4);
    if (o.segAD) out += g4line(pts.A, pts.D, GEO.ink, 2.4);
    out += ptLabel(pts.A.x, pts.A.y, "A", 0, -10) + ptLabel(pts.D.x, pts.D.y, "D", 0, -10);
    out += ptLabel(pts.B.x, pts.B.y, "B", -6, 18) + ptLabel(pts.C.x, pts.C.y, "C", 6, 18);
    out += dot(pts.A.x, pts.A.y, GEO.pt, 3) + dot(pts.D.x, pts.D.y, GEO.pt, 3) + dot(pts.B.x, pts.B.y, GEO.pt, 3) + dot(pts.C.x, pts.C.y, GEO.pt, 3);
  } else if (o.mode === "trap") {
    H = 244;
    pts.A = { x: 128, y: 56 };
    pts.D = { x: 258, y: 56 };
    pts.B = { x: 72, y: 196 };
    pts.C = { x: 306, y: 196 };
    pts.O = (() => {
      const d1 = { x: pts.C.x - pts.A.x, y: pts.C.y - pts.A.y };
      const d2 = { x: pts.D.x - pts.B.x, y: pts.D.y - pts.B.y };
      const den = d1.x * d2.y - d1.y * d2.x;
      const t = ((pts.B.x - pts.A.x) * d2.y - (pts.B.y - pts.A.y) * d2.x) / den;
      return { x: pts.A.x + d1.x * t, y: pts.A.y + d1.y * t };
    })();
    if (o.shade) out += shadePoly(o.shade);
    out += g4poly([pts.A, pts.B, pts.C, pts.D], "none", 2.5);
    out += g4line(pts.A, pts.C, GEO.ink, 2.2) + g4line(pts.B, pts.D, GEO.ink, 2.2);
    out += arrowHead((pts.A.x + pts.D.x) / 2 + 5, 56, 0) + arrowHead((pts.B.x + pts.C.x) / 2 + 5, 196, 0);
    out += dot(pts.O.x, pts.O.y, GEO.pt, 3.2) + ptLabel(pts.O.x, pts.O.y, "O", 12, -4);
    out += ptLabel(pts.A.x, pts.A.y, "A", -6, -8) + ptLabel(pts.D.x, pts.D.y, "D", 6, -8);
    out += ptLabel(pts.B.x, pts.B.y, "B", -7, 17) + ptLabel(pts.C.x, pts.C.y, "C", 7, 17);
  } else if (o.mode === "para") {
    const g = g4para(63, 214, 118);
    H = g.H;
    pts.A = g.A;
    pts.B = g.B;
    pts.C = g.C;
    pts.D = g.D;
    pts.O = g.O;
    if (o.shade) out += shadePoly(o.shade);
    out += g4poly([g.A, g.B, g.C, g.D], "none", 2.5);
    if (o.diag === "AC" || o.diag === "both") out += g4line(g.A, g.C, GEO.ink, 2.2);
    if (o.diag === "both") out += g4line(g.B, g.D, GEO.ink, 2.2);
    if (o.diag === "both") out += dot(g.O.x, g.O.y, GEO.pt, 3.2) + ptLabel(g.O.x, g.O.y, "O", 0, -9);
    out += ptLabel(g.A.x, g.A.y, "A", -6, -8) + ptLabel(g.B.x, g.B.y, "B", -7, 17) + ptLabel(g.C.x, g.C.y, "C", 7, 17) + ptLabel(g.D.x, g.D.y, "D", 7, -8);
  } else if (o.mode === "bent") {
    H = 246;
    pts.A = { x: 102, y: 76 };
    pts.B = { x: 58, y: 204 };
    pts.C = { x: 240, y: 204 };
    pts.D = { x: 192, y: 76 };
    const dir = { x: pts.C.x - pts.A.x, y: pts.C.y - pts.A.y };
    const t = (204 - pts.D.y) / dir.y;
    pts.E = { x: pts.D.x + dir.x * t, y: 204 };
    out += lineSvg(pts.B.x - 14, 204, pts.E.x + 22, 204, GEO.ink, 2.2);
    if (o.shade) out += shadePoly(o.shade);
    out += g4poly([pts.A, pts.B, pts.C, pts.D], F4, 2.5);
    out += g4line(pts.A, pts.C, NAVY, 1.8, "6 5");
    out += g4line(pts.D, pts.E, NAVY, 1.8, "6 5");
    out += g4line(pts.A, pts.E, GEO.ink, 2.4);
    if (o.bentLabels?.height) {
      const foot = { x: pts.A.x, y: 204 };
      out += g4line(pts.A, foot, GEO.hlB, 1.8, "5 4") + g4right(foot, pts.C, pts.A, 8);
      out += g4text(pts.A.x + 21, (pts.A.y + 204) / 2 + 4, o.bentLabels.height, 11.5, GEO.hlB);
    }
    if (o.bentLabels?.bc) out += g4text((pts.B.x + pts.C.x) / 2, 222, o.bentLabels.bc, 11.5);
    if (o.bentLabels?.ce) out += g4text((pts.C.x + pts.E.x) / 2, 222, o.bentLabels.ce, 11.5);
    out += dot(pts.E.x, pts.E.y, GEO.pt, 3.2) + ptLabel(pts.E.x, pts.E.y, "E", 6, 18);
    out += ptLabel(pts.A.x, pts.A.y, "A", -4, -9) + ptLabel(pts.B.x, pts.B.y, "B", -7, 17) + ptLabel(pts.C.x, pts.C.y, "C", -6, 18) + ptLabel(pts.D.x, pts.D.y, "D", 5, -9);
  } else {
    // split: 삼각형 ABC와 BC 위의 점 D — BD:DC=m:n 실비 위치(간격 비의 정본은 문두, m1u4 PL 교훈).
    H = 232;
    const gy = 186;
    const mm = o.m ?? 1;
    const nn = o.n ?? 1;
    pts.B = { x: 64, y: gy };
    pts.C = { x: 322, y: gy };
    pts.D = { x: 64 + (258 * mm) / (mm + nn), y: gy };
    pts.A = { x: 148, y: 54 };
    if (o.shade) out += shadePoly(o.shade);
    out += g4poly([pts.A, pts.B, pts.C], "none", 2.5);
    out += g4line(pts.A, pts.D, GEO.ink, 2.3);
    if (o.splitLabels?.bd) out += g4text((pts.B.x + pts.D.x) / 2, gy + 20, o.splitLabels.bd, 11.5);
    if (o.splitLabels?.dc) out += g4text((pts.D.x + pts.C.x) / 2, gy + 20, o.splitLabels.dc, 11.5);
    out += dot(pts.D.x, pts.D.y, GEO.pt, 3.2) + ptLabel(pts.D.x, pts.D.y, "D", 0, 18);
    out += ptLabel(pts.A.x, pts.A.y, "A", 0, -10) + ptLabel(pts.B.x, pts.B.y, "B", -8, 17) + ptLabel(pts.C.x, pts.C.y, "C", 8, 17);
  }
  if (o.areaLabel) {
    const ps = o.areaLabel.in.split("").map((ch) => pts[ch]).filter(Boolean);
    if (ps.length) {
      const cx = ps.reduce((s, p) => s + p.x, 0) / ps.length;
      const cy = ps.reduce((s, p) => s + p.y, 0) / ps.length;
      out += g4text(cx, cy + 4, o.areaLabel.label, 12, NAVY);
    }
  }
  return svg(`0 0 360 ${H}`, o.mode === "split" ? "삼각형과 밑변 위의 한 점을 이은 그림" : "평행선과 도형의 넓이 관계 그림", out);
}

/** 이등변 연쇄(누적형 — 3사 최다 단골, m2u4 v2 신작). th가 "실제" 기준각(도)이라 라벨과 그림이
 *  늘 일치한다. mode ray: 바닥 반직선 C→D→E와 사선 C→B→A, CB=BD=DA(각 1틱) —
 *  ∠BCD=∠BDC=th·∠ABD=∠DAB=2th·∠ADE=3th를 좌표로 강제(A는 사선 위 CA=(4cos²th−1)·CB 지점).
 *  mode tri: 삼각형 ABC 안 사슬 D(AB 위)·E(BC 위), BD=DE=EA=AC(각 1틱) — ∠B=th·∠C=3th.
 *  marks의 at: ray는 C|BDC|ABD|DAB|ADE, tri는 B|C|ADE|DAE|AEC. ticks:false + sideLabels로
 *  "두 각이 같으면 두 변도 같다" 역방향(되는 조건) 유형을 만든다. */
export function m2ExamIsoLadderFig(o: {
  mode: "ray" | "tri";
  th: number;
  marks?: Array<{ at: string; label: string }>;
  ticks?: boolean;
  sideLabels?: Partial<Record<"CB" | "BD" | "DA" | "DE" | "EA" | "AC" | "BC", string>>;
  names?: string[];
}): string {
  const t = (o.th * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  let out = "";
  let H = 0;
  const pts: Record<string, GPt> = {};
  if (o.mode === "ray") {
    const span = 4 * c * c - 1; // CA/CB 배율 — DA=CB가 되는 사선 위 지점
    const L = Math.min(150, 272 / (span * c), 216 / (2 * c));
    const ay = span * s * L;
    H = Math.round(ay) + 92;
    const gy = H - 46;
    const C = { x: 42, y: gy };
    const B = { x: C.x + L * c, y: gy - L * s };
    const A = { x: C.x + span * c * L, y: gy - ay };
    const D = { x: C.x + 2 * L * c, y: gy };
    const E = { x: D.x + 52, y: gy };
    Object.assign(pts, { A, B, C, D, E });
    out += g4line(C, { x: D.x + 76, y: gy }, GEO.ink, 2.2);
    out += g4line(C, A, GEO.ink, 2.5) + g4line(B, D, GEO.ink, 2.5) + g4line(D, A, GEO.ink, 2.5);
    if (o.ticks !== false)
      out += tickMark(C.x, C.y, B.x, B.y, 1) + tickMark(B.x, B.y, D.x, D.y, 1) + tickMark(D.x, D.y, A.x, A.y, 1);
    out += dot(E.x, E.y, GEO.pt, 3);
  } else {
    const t3 = (3 * o.th * Math.PI) / 180;
    const h0 = 288 / (1 / Math.tan(t) + 1 / Math.tan(t3));
    const w = h0 > 150 ? (288 * 150) / h0 : 288;
    const h = Math.min(h0, 150);
    H = Math.round(h) + 92;
    const gy = H - 46;
    const lx = (360 - w) / 2;
    const B = { x: lx, y: gy };
    const C = { x: lx + w, y: gy };
    const A = { x: lx + h / Math.tan(t), y: gy - h };
    const len = h / Math.sin(t3); // AC=BD=DE=EA — ∠C=3th에서 역산
    const D = { x: B.x + len * c, y: gy - len * s };
    const E = { x: B.x + 2 * len * c, y: gy };
    Object.assign(pts, { A, B, C, D, E });
    out += g4poly([A, B, C], F4);
    out += g4line(D, E, GEO.ink, 2.3) + g4line(E, A, GEO.ink, 2.3);
    if (o.ticks !== false)
      out +=
        tickMark(B.x, B.y, D.x, D.y, 1) +
        tickMark(D.x, D.y, E.x, E.y, 1) +
        tickMark(E.x, E.y, A.x, A.y, 1) +
        tickMark(A.x, A.y, C.x, C.y, 1);
  }
  const arcDefs: Record<string, [string, string, string]> =
    o.mode === "ray"
      ? { C: ["C", "B", "D"], BDC: ["D", "B", "C"], ABD: ["B", "A", "D"], DAB: ["A", "D", "B"], ADE: ["D", "A", "E"] }
      : { B: ["B", "A", "C"], C: ["C", "A", "B"], ADE: ["D", "A", "E"], DAE: ["A", "D", "E"], AEC: ["E", "A", "C"] };
  const rot = [GEO.hlA, GEO.hlB, GEO.hlD];
  (o.marks ?? []).forEach((m, i) => {
    const def = arcDefs[m.at];
    if (def) out += g4arc(pts[def[0]], pts[def[1]], pts[def[2]], rot[i % 3], m.label, 22);
  });
  const segDefs: Record<string, [string, string]> =
    o.mode === "ray"
      ? { CB: ["C", "B"], BD: ["B", "D"], DA: ["D", "A"] }
      : { BD: ["B", "D"], DE: ["D", "E"], EA: ["E", "A"], AC: ["A", "C"], BC: ["B", "C"] };
  const cen =
    o.mode === "ray"
      ? { x: (pts.C.x + pts.A.x + pts.D.x) / 3, y: (pts.C.y + pts.A.y + pts.D.y) / 3 }
      : g4cen([pts.A, pts.B, pts.C]);
  for (const [key, lab] of Object.entries(o.sideLabels ?? {})) {
    const def = segDefs[key];
    if (def && lab) out += g4side(pts[def[0]], pts[def[1]], lab, cen, 15);
  }
  const nm = o.names ?? ["A", "B", "C", "D", "E"];
  out += ptLabel(pts.A.x, pts.A.y, nm[0], 0, -10);
  out += ptLabel(pts.B.x, pts.B.y, nm[1], -11, o.mode === "ray" ? -5 : 17);
  out += ptLabel(pts.C.x, pts.C.y, nm[2], o.mode === "ray" ? -7 : 8, 17);
  out += ptLabel(pts.D.x, pts.D.y, nm[3], o.mode === "ray" ? 2 : -11, o.mode === "ray" ? 18 : -5);
  out += ptLabel(pts.E.x, pts.E.y, nm[4], o.mode === "ray" ? 6 : 2, 18);
  return svg(`0 0 360 ${H}`, "길이가 같은 선분들을 이어 붙인 삼각형 그림", out);
}

/** 직사각형 모서리 접기(C→A, m2u4 v2 확대 신작 · 천04-07 계보) — phi가 "실제" ∠D′AF(도).
 *  관계식 phi=90−2·atan(h/w)로 직사각형 비율을 역산해 라벨=기하 일치를 구조 보장.
 *  접는 선 F(AD 위)~E(BC 위)는 대각선 AC의 수직이등분선, D′는 D의 반사상(위로 돌출).
 *  askE를 주면 ∠AEF 물음 호. 검산: ∠AEF=(180−(90−phi))÷2. */
export function m2ExamFoldCornerFig(o: { phi: number; phiLabel?: string; askE?: string }): string {
  const th = ((90 - o.phi) / 2) * (Math.PI / 180);
  const w = 250;
  const h = w * Math.tan(th);
  const ox = (360 - w) / 2;
  const oy = Math.round(h * Math.cos(2 * th)) + 28;
  const A = { x: ox, y: oy };
  const B = { x: ox, y: oy + h };
  const C = { x: ox + w, y: oy + h };
  const D = { x: ox + w, y: oy };
  const half = (h * h) / (2 * w);
  const F = { x: ox + w / 2 + half, y: oy };
  const E = { x: ox + w / 2 - half, y: oy + h };
  const Dp = { x: ox + h * Math.sin(2 * th), y: oy - h * Math.cos(2 * th) };
  let out = "";
  // 남은 종이(접는 선 왼쪽) + 원래 자리 점선 + 접힌 플랩(F·D′·A·E)
  out += `<path d="M${A.x} ${A.y} L${F.x.toFixed(1)} ${F.y} L${E.x.toFixed(1)} ${E.y} L${B.x} ${B.y} Z" fill="#F8FAFC" stroke="${GEO.ink}" stroke-width="2.4"/>`;
  out += `<path d="M${F.x.toFixed(1)} ${F.y} L${D.x} ${D.y} L${C.x} ${C.y} L${E.x.toFixed(1)} ${E.y}" fill="none" stroke="${FAINT}" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  out += `<path d="M${F.x.toFixed(1)} ${F.y} L${Dp.x.toFixed(1)} ${Dp.y.toFixed(1)} L${A.x} ${A.y} L${E.x.toFixed(1)} ${E.y} Z" fill="#EAF1FE" fill-opacity=".82" stroke="${GEO.ink}" stroke-width="2.4"/>`;
  if (o.phiLabel) out += g4arc(A, Dp, F, GEO.hlA, o.phiLabel, 24);
  if (o.askE) out += g4arc(E, A, F, GEO.hlB, o.askE, 22);
  out += dot(A.x, A.y) + dot(E.x, E.y) + dot(F.x, F.y);
  out += ptLabel(A.x, A.y, "A", -9, 4) + ptLabel(B.x, B.y, "B", -9, 12) + ptLabel(C.x, C.y, "C", 9, 12);
  out += ptLabel(D.x, D.y, "D", 10, -2) + ptLabel(Dp.x, Dp.y, "D′", 2, -9);
  out += ptLabel(E.x, E.y, "E", 2, 18) + ptLabel(F.x, F.y, "F", 6, -9);
  return svg(`0 0 360 ${Math.round(oy + h) + 46}`, "직사각형 종이의 한 꼭짓점을 다른 꼭짓점에 오도록 접은 그림", out);
}

/** 중점 수선 쌍(m2u4 v2 확대 신작 · 비Ⅳ1-07 계보) — apex가 "실제" 꼭지각(도).
 *  이등변삼각형이라 DM=EM이 구조적으로 성립(RHS 유형의 실각 렌더). M=BC 중점(2틱),
 *  MD⊥AB·ME⊥AC(직각 마크, 1틱). marks: "A"(전각)·"BMD"·"CME"·"B"·"C". */
export function m2ExamMidPerpFig(o: { apex: number; marks?: Array<{ at: string; label: string }> }): string {
  const beta = ((180 - o.apex) / 2) * (Math.PI / 180);
  const W = Math.min(264, 320 / Math.tan(beta));
  const h = (W / 2) * Math.tan(beta);
  const H = Math.round(h) + 92;
  const gy = H - 46;
  const lx = (360 - W) / 2;
  const B = { x: lx, y: gy };
  const C = { x: lx + W, y: gy };
  const A = { x: lx + W / 2, y: gy - h };
  const M = { x: lx + W / 2, y: gy };
  const proj = (W / 2) * Math.cos(beta);
  const D = { x: B.x + proj * Math.cos(beta), y: B.y - proj * Math.sin(beta) };
  const E = { x: C.x - proj * Math.cos(beta), y: C.y - proj * Math.sin(beta) };
  let out = g4poly([A, B, C]);
  out += g4line(M, D, GEO.ink, 2.2) + g4line(M, E, GEO.ink, 2.2);
  out += g4right(D, B, M) + g4right(E, A, M);
  out += tickMark(B.x, B.y, M.x, M.y, 2) + tickMark(M.x, M.y, C.x, C.y, 2);
  out += tickMark(D.x, D.y, M.x, M.y, 1) + tickMark(E.x, E.y, M.x, M.y, 1);
  const pts: Record<string, GPt> = { A, B, C, M, D, E };
  const adj: Record<string, [string, string]> = { A: ["B", "C"], B: ["A", "C"], C: ["A", "B"], M: ["B", "D"] };
  if (o.marks) out += g4marks(pts, o.marks, adj);
  out += dot(M.x, M.y, GEO.pt, 3) + dot(D.x, D.y, GEO.pt, 3) + dot(E.x, E.y, GEO.pt, 3);
  out += ptLabel(A.x, A.y, "A", 0, -10) + ptLabel(B.x, B.y, "B", -8, 16) + ptLabel(C.x, C.y, "C", 8, 16);
  out += ptLabel(M.x, M.y, "M", 0, 18) + ptLabel(D.x, D.y, "D", -12, -4) + ptLabel(E.x, E.y, "E", 12, -4);
  return svg(`0 0 360 ${H}`, "삼각형과 밑변의 중점에서 두 변에 내린 수선을 나타낸 그림", out);
}

/** 직각이등변+직선 수선(m2u4 v2 확대 신작 · 미06-12 계보) — bd·ce 실비로 기울기를 역산해
 *  라벨=기하 일치(BD=k·sinβ·CE=k·cosβ, β=atan(bd/ce)). ∠A=90°(마크)·AB=AC(틱),
 *  D·E는 B·C에서 세로 직선 l에 내린 수선의 발(D가 위 — AD=CE<AE=BD 검산 병기). */
export function m2ExamRightPerpFig(o: { bd: number; ce: number; bdLabel?: string; ceLabel?: string; askDE?: string }): string {
  const beta = Math.atan2(o.bd, o.ce);
  const s = Math.min(150, 128 / Math.sin(beta), 128 / Math.cos(beta));
  const cx = 186;
  const ay = 44;
  const A = { x: cx, y: ay };
  const B = { x: cx - s * Math.sin(beta), y: ay + s * Math.cos(beta) };
  const D = { x: cx, y: B.y };
  const C = { x: cx + s * Math.cos(beta), y: ay + s * Math.sin(beta) };
  const E = { x: cx, y: C.y };
  const H = Math.round(Math.max(B.y, C.y)) + 52;
  let out = lineSvg(cx, 16, cx, H - 18, GEO.ink, 2.2);
  out += `<text x="${cx + 10}" y="26" font-size="12.5" font-weight="800" font-style="italic" fill="${GEO.ink}">l</text>`;
  out += g4line(A, B, GEO.ink, 2.5) + g4line(A, C, GEO.ink, 2.5);
  out += g4line(B, D, GEO.ink, 2.2) + g4line(C, E, GEO.ink, 2.2);
  out += g4right(A, B, C) + g4right(D, B, A) + g4right(E, C, A);
  out += tickMark(A.x, A.y, B.x, B.y, 1) + tickMark(A.x, A.y, C.x, C.y, 1);
  if (o.bdLabel) out += g4text((B.x + D.x) / 2, B.y - 8, o.bdLabel, 11.5);
  if (o.ceLabel) out += g4text((C.x + E.x) / 2, C.y + 16, o.ceLabel, 11.5);
  // g4text가 내부에서 fxv를 적용하므로 여기서 겹쳐 감싸면 마크업이 재치환된다(구현 확정 사고).
  if (o.askDE) out += g4text(cx - 24, (D.y + E.y) / 2 + 4, o.askDE, 12);
  out += dot(A.x, A.y) + dot(D.x, D.y) + dot(E.x, E.y);
  out += ptLabel(A.x, A.y, "A", 12, -4) + ptLabel(B.x, B.y, "B", -12, 4) + ptLabel(C.x, C.y, "C", 12, 8);
  out += ptLabel(D.x, D.y, "D", 12, 0) + ptLabel(E.x, E.y, "E", 13, 8);
  return svg(`0 0 360 ${H}`, "직각이등변삼각형의 두 꼭짓점에서 한 직선에 내린 수선을 나타낸 그림", out);
}

/** 이등변 축 위 외심 O+내심 I 동시(m2u4 v2 확대 신작 · 미06-09·천04-10 계보) — apex가 실제
 *  꼭지각(도). O·I의 y는 실계산(∠A<60°면 O가 위, >60°면 I가 위 — 저작 검산 병기).
 *  좁은 ∠OBI는 호를 그리지 않는다(146 표준 — 문두 지정). marks: "A" 전각 라벨용. */
export function m2ExamIsoOIFig(o: { apex: number; apexLabel?: string; axis?: boolean }): string {
  const beta = ((180 - o.apex) / 2) * (Math.PI / 180);
  const a = Math.tan(beta);
  const L = Math.sqrt(1 + a * a);
  const yO = (a * a - 1) / (2 * a);
  const yI = a / (1 + L);
  const k = Math.min(118, 148 / a);
  const H = Math.round(k * a) + 96;
  const gy = H - 48;
  const cx = 180;
  const B = { x: cx - k, y: gy };
  const C = { x: cx + k, y: gy };
  const A = { x: cx, y: gy - k * a };
  const O = { x: cx, y: gy - k * yO };
  const I = { x: cx, y: gy - k * yI };
  let out = g4poly([A, B, C]);
  if (o.axis !== false) out += g4line(A, { x: cx, y: gy }, GEO.ink, 1.6, "5 4");
  out += g4line(O, B, GEO.ink, 2) + g4line(O, C, GEO.ink, 2);
  out += g4line(I, B, GEO.ink, 2) + g4line(I, C, GEO.ink, 2);
  out += tickMark(A.x, A.y, B.x, B.y, 1) + tickMark(A.x, A.y, C.x, C.y, 1);
  if (o.apexLabel) out += g4arc(A, B, C, GEO.hlA, o.apexLabel, 24);
  out += dot(O.x, O.y, GEO.pt, 3.4) + dot(I.x, I.y, GEO.pt, 3.4);
  out += ptLabel(O.x, O.y, "O", 13, 4) + ptLabel(I.x, I.y, "I", -12, 4);
  out += ptLabel(A.x, A.y, "A", 0, -10) + ptLabel(B.x, B.y, "B", -8, 16) + ptLabel(C.x, C.y, "C", 8, 16);
  return svg(`0 0 360 ${H}`, "이등변삼각형과 두 점 O, I를 나타낸 그림", out);
}

/** 세 변 밖 정삼각형 셋(m2u4 v2 확대 신작 · 천04-11 계보) — △ABC 세 변을 한 변으로 하는
 *  정삼각형 ABD·BCE·ACF(E는 BC 위쪽)와 □DAFE(D~E·E~F 실선). 변 그룹은 틱 1·2·3으로 구분. */
export function m2ExamEquiTriFig(): string {
  const rot = (p: GPt, c: GPt, deg: number): GPt => {
    const r = (deg * Math.PI) / 180;
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    return { x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r) };
  };
  const B = { x: 112, y: 196 };
  const C = { x: 256, y: 196 };
  const A = { x: 172, y: 128 };
  // 화면 y축이 아래로 커서 "바깥" 회전 부호가 수학 관례와 반대다(샘플 눈검수로 확정):
  // D(AB 왼쪽 바깥)=rot(A,B,−60) · E(BC 위쪽)=rot(C,B,−60) · F(AC 오른쪽 바깥)=rot(A,C,+60).
  const D = rot(A, B, -60);
  const F = rot(A, C, 60);
  const E = rot(C, B, -60);
  let out = "";
  out += g4poly([A, B, D], "#F0F6FF", 2.2) + g4poly([A, C, F], "#F0F6FF", 2.2) + g4poly([B, C, E], "#F8FAFC", 2.2);
  out += g4poly([A, B, C], F4, 2.6);
  out += g4line(D, E, GEO.ink, 2.3) + g4line(E, F, GEO.ink, 2.3);
  out += tickMark(A.x, A.y, B.x, B.y, 1) + tickMark(B.x, B.y, D.x, D.y, 1) + tickMark(D.x, D.y, A.x, A.y, 1);
  out += tickMark(A.x, A.y, C.x, C.y, 2) + tickMark(C.x, C.y, F.x, F.y, 2) + tickMark(F.x, F.y, A.x, A.y, 2);
  out += tickMark(B.x, B.y, C.x, C.y, 3) + tickMark(C.x, C.y, E.x, E.y, 3) + tickMark(E.x, E.y, B.x, B.y, 3);
  out += ptLabel(A.x, A.y, "A", 2, -9) + ptLabel(B.x, B.y, "B", -6, 17) + ptLabel(C.x, C.y, "C", 8, 17);
  out += ptLabel(D.x, D.y, "D", -12, 0) + ptLabel(E.x, E.y, "E", 2, -10) + ptLabel(F.x, F.y, "F", 13, 0);
  return svg("0 0 360 224", "삼각형의 세 변을 각각 한 변으로 하는 정삼각형 세 개를 그린 그림", out);
}

/* ── m1u5 개보수(2026-07) 신작 — Ⅴ 평면도형·입체도형 시험 그림 ─────────────
 * 평면 각 그림은 geoKit로 "실제 각도"를 그대로 그린다(라벨 수치 = 그림 각 — m1u4 접기 계보).
 * 라벨은 전부 호출부가 문자열로 정하고("x" 허용) 정답 수치가 그림에 인쇄되지 않게 조합을
 * 손검산한다. 입체는 2D 겨냥도(타원 투영)에 치수 라벨만 붙인다. aria는 중립 서술만. */

const m5seg = (a: { x: number; y: number }, b: { x: number; y: number }, dash = false, w = 2.5, color: string = GEO.ink): string =>
  `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${color}" stroke-width="${w}"${dash ? ' stroke-dasharray="6 5"' : ""} stroke-linecap="round"/>`;

const m5text = (x: number, y: number, s: string, anchor = "middle", color: string = GEO.ink, size = 12): string =>
  `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-size="${size}" font-weight="800" fill="${color}">${s}</text>`;

/** 삼각형 내각·외각 그림. bDeg·cDeg는 밑변 양 끝(왼쪽 B·오른쪽 C)의 실제 내각.
 *  labels로 각 라벨을, ext로 밑변 연장 외각(점선+호+라벨)을 붙인다. */
export function m5TriAngleFig(o: {
  bDeg: number;
  cDeg: number;
  labels?: { A?: string; B?: string; C?: string };
  ext?: Array<{ at: "B" | "C"; label?: string; name?: string }>;
  names?: [string, string, string] | null;
}): string {
  const RAD = Math.PI / 180;
  const tb = Math.tan(o.bDeg * RAD);
  const tc = Math.tan(o.cDeg * RAD);
  const baseW = Math.min(184, (132 * (tb + tc)) / (tb * tc));
  const B = { x: 150 - baseW / 2, y: 170 };
  const C = { x: 150 + baseW / 2, y: 170 };
  const ax = (tb * B.x + tc * C.x) / (tb + tc);
  const A = { x: ax, y: 170 - tb * (ax - B.x) };
  let out = m5seg(A, B) + m5seg(B, C) + m5seg(C, A);
  for (const e of o.ext ?? []) {
    const from = e.at === "C" ? C : B;
    const end = { x: from.x + (e.at === "C" ? 52 : -52), y: 170 };
    out += m5seg(from, end, true, 2.2, GEO.soft);
    const toA = angleOf(from.x, from.y, A.x, A.y);
    if (e.label) {
      if (e.at === "C") out += angleArc(from.x, from.y, 24, 0, toA, GEO.hlC, e.label, { labelR: 42, fontSize: 12.5 });
      else out += angleArc(from.x, from.y, 24, toA, 180, GEO.hlC, e.label, { labelR: 42, fontSize: 12.5 });
    }
    if (e.name) out += ptLabel(end.x, end.y, e.name, e.at === "C" ? 10 : -10, 5);
  }
  if (o.labels?.B) out += angleArc(B.x, B.y, 25, 0, angleOf(B.x, B.y, A.x, A.y), GEO.hlA, o.labels.B, { labelR: 43, fontSize: 12.5 });
  if (o.labels?.C) out += angleArc(C.x, C.y, 25, angleOf(C.x, C.y, A.x, A.y), 180, GEO.hlB, o.labels.C, { labelR: 43, fontSize: 12.5 });
  if (o.labels?.A) {
    const a0 = angleOf(A.x, A.y, C.x, C.y);
    const a1 = angleOf(A.x, A.y, B.x, B.y);
    out += angleArc(A.x, A.y, 23, a1, a0, GEO.hlA, o.labels.A, { labelR: 41, fontSize: 12.5 });
  }
  const names = o.names === null ? null : (o.names ?? ["A", "B", "C"]);
  if (names) out += ptLabel(A.x, A.y, names[0], 0, -8) + ptLabel(B.x, B.y, names[1], -11, 12) + ptLabel(C.x, C.y, names[2], 11, 12);
  return svg("0 0 300 196", "삼각형과 표시된 각 그림", out);
}

/** 볼록 다각형 내각·외각 그림 — angles(실제 내각 목록, 합 = (n−2)·180)로 도형을 걷기
 *  방식으로 만든 뒤 뷰박스에 맞춘다. labels[i]는 내각 라벨, ext는 연장선 외각, rightAt은 직각 표시. */
export function m5PolyAngleFig(o: {
  angles: number[];
  sides?: number[];
  labels: Array<string | null>;
  ext?: Array<{ at: number; label: string }>;
  rightAt?: number[];
}): string {
  const RAD = Math.PI / 180;
  const n = o.angles.length;
  const sides = o.sides ?? Array.from({ length: n }, () => 1);
  // 변 방향은 내각 목록으로 확정되고, 마지막 두 변의 길이는 다각형이 닫히도록 역산한다
  // (임의 길이로는 걷기가 닫히지 않음 — 내각 합이 (n−2)·180이면 항상 양수 해가 있다).
  const headings: number[] = [0];
  for (let i = 1; i < n; i += 1) headings.push(headings[i - 1] + 180 - o.angles[i]);
  const raw: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
  for (let i = 1; i <= n - 2; i += 1) {
    const prev = raw[i - 1];
    raw.push({ x: prev.x + sides[i - 1] * Math.cos(headings[i - 1] * RAD), y: prev.y + sides[i - 1] * Math.sin(headings[i - 1] * RAD) });
  }
  const u = { x: Math.cos(headings[n - 2] * RAD), y: Math.sin(headings[n - 2] * RAD) };
  const v = { x: Math.cos(headings[n - 1] * RAD), y: Math.sin(headings[n - 1] * RAD) };
  const gap = { x: -raw[n - 2].x, y: -raw[n - 2].y };
  const det = u.x * v.y - u.y * v.x;
  const lenA = det === 0 ? 1 : (gap.x * v.y - gap.y * v.x) / det;
  raw.push({ x: raw[n - 2].x + lenA * u.x, y: raw[n - 2].y + lenA * u.y });
  const xs = raw.map((p) => p.x);
  const ys = raw.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX;
  const spanY = Math.max(...ys) - minY;
  const scale = Math.min(212 / Math.max(spanX, 0.01), 144 / Math.max(spanY, 0.01));
  const offX = (300 - spanX * scale) / 2;
  const offY = (196 - spanY * scale) / 2;
  const pts = raw.map((p) => ({ x: (p.x - minX) * scale + offX, y: 196 - offY - (p.y - minY) * scale }));
  let out = "";
  for (let i = 0; i < n; i += 1) out += m5seg(pts[i], pts[(i + 1) % n]);
  const palette = [GEO.hlA, GEO.hlB, GEO.hlC, "#2F9E44", "#8A5CF6", GEO.hlA];
  for (let i = 0; i < n; i += 1) {
    const v = pts[i];
    const dirOut = angleOf(v.x, v.y, pts[(i + 1) % n].x, pts[(i + 1) % n].y);
    const dirIn = angleOf(v.x, v.y, pts[(i - 1 + n) % n].x, pts[(i - 1 + n) % n].y);
    if (o.rightAt?.includes(i)) {
      out += rightMark(v.x, v.y, dirOut, 12);
      continue;
    }
    if (o.labels[i]) out += angleArc(v.x, v.y, 21, dirOut, dirIn, palette[i % palette.length], o.labels[i] ?? undefined, { labelR: 39, fontSize: 12 });
  }
  for (const e of o.ext ?? []) {
    const v = pts[e.at];
    const back = angleOf(v.x, v.y, pts[(e.at - 1 + n) % n].x, pts[(e.at - 1 + n) % n].y);
    const cont = (back + 180) % 360;
    const dirOut = angleOf(v.x, v.y, pts[(e.at + 1) % n].x, pts[(e.at + 1) % n].y);
    out += m5seg(v, polar(v.x, v.y, 44, cont), true, 2.2, GEO.soft);
    out += angleArc(v.x, v.y, 19, cont, dirOut, GEO.hlC, e.label, { labelR: 37, fontSize: 12 });
  }
  return svg("0 0 300 196", "다각형과 표시된 각 그림", out);
}

/** 원의 부품 판독 그림 — 중심 O와 원 위 두 점 A·B. 반지름·현·호 강조·부채꼴/활꼴 색칠을
 *  선택하고 ㉠류 표지를 붙인다. */
export function m5CirclePartsFig(o: {
  aDeg?: number;
  bDeg?: number;
  radii?: boolean;
  chord?: boolean;
  arcBold?: boolean;
  shade?: "sector" | "segment";
  mark?: { target: "radius" | "chord" | "arc" | "region"; text: string };
  names?: { a?: string; b?: string; o?: string };
}): string {
  const cx = 150;
  const cy = 104;
  const R = 82;
  const aDeg = o.aDeg ?? 152;
  const bDeg = o.bDeg ?? 22;
  const A = polar(cx, cy, R, aDeg);
  const B = polar(cx, cy, R, bDeg);
  const span = (bDeg - aDeg + 360) % 360;
  let out = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${GEO.ink}" stroke-width="2.5"/>`;
  const p1 = polar(cx, cy, R, bDeg);
  const arcD = `M${A.x.toFixed(1)} ${A.y.toFixed(1)} A${R} ${R} 0 ${span > 180 ? 1 : 0} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  if (o.shade === "sector") out += `<path d="M${cx} ${cy} L${A.x.toFixed(1)} ${A.y.toFixed(1)} ${arcD.replace(/^M[\d. ]+/, "")} Z" fill="${GEO.hlA}" opacity=".2"/>`;
  if (o.shade === "segment") out += `<path d="${arcD} Z" fill="${GEO.hlB}" opacity=".2"/>`;
  if (o.arcBold) out += `<path d="${arcD}" stroke="${GEO.hlC}" stroke-width="4.6" fill="none" stroke-linecap="round"/>`;
  if (o.radii) out += m5seg({ x: cx, y: cy }, A) + m5seg({ x: cx, y: cy }, B);
  if (o.chord) out += m5seg(A, B);
  out += dot(cx, cy, GEO.pt, 3.4) + ptLabel(cx, cy, o.names?.o ?? "O", 0, 16);
  out += dot(A.x, A.y, GEO.pt, 3.2) + ptLabel(A.x, A.y, o.names?.a ?? "A", A.x < cx ? -12 : 12, A.y < cy ? -6 : 14);
  out += dot(B.x, B.y, GEO.pt, 3.2) + ptLabel(B.x, B.y, o.names?.b ?? "B", B.x < cx ? -12 : 12, B.y < cy ? -6 : 14);
  if (o.mark) {
    const midDeg = aDeg + span / 2;
    if (o.mark.target === "radius") {
      const m = polar(cx, cy, R * 0.52, aDeg);
      out += m5text(m.x - 12, m.y - 6, o.mark.text, "middle", GEO.hlC, 13);
    } else if (o.mark.target === "chord") {
      out += m5text((A.x + B.x) / 2, (A.y + B.y) / 2 - 8, o.mark.text, "middle", GEO.hlC, 13);
    } else if (o.mark.target === "arc") {
      const m = polar(cx, cy, R + 15, midDeg);
      out += m5text(m.x, m.y + 4, o.mark.text, "middle", GEO.hlC, 13);
    } else {
      const m = polar(cx, cy, R * 0.6, midDeg);
      out += m5text(m.x, m.y + 4, o.mark.text, "middle", GEO.hlC, 13);
    }
  }
  return svg("0 0 300 226", "원과 표시된 부분 그림", out);
}

/** 한 원 안 여러 부채꼴 비교 그림 — 각 부채꼴에 중심각 라벨(안쪽)과 값 라벨(호 바깥)을 붙인다. */
export function m5CircleRatioFig(o: {
  sectors: Array<{ from: number; to: number; angleLabel?: string; valueLabel?: string; shade?: boolean }>;
}): string {
  const cx = 150;
  const cy = 106;
  const R = 82;
  let out = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${GEO.ink}" stroke-width="2.5"/>`;
  const palette = [GEO.hlA, GEO.hlB, GEO.hlC];
  o.sectors.forEach((s, i) => {
    const p0 = polar(cx, cy, R, s.from);
    const p1 = polar(cx, cy, R, s.to);
    const span = (s.to - s.from + 360) % 360;
    const large = span > 180 ? 1 : 0;
    const color = palette[i % palette.length];
    if (s.shade)
      out += `<path d="M${cx} ${cy} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${R} ${R} 0 ${large} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z" fill="${color}" opacity=".18"/>`;
    out += m5seg({ x: cx, y: cy }, p0) + m5seg({ x: cx, y: cy }, p1);
    if (s.angleLabel) {
      // 중심각 호 표시를 함께 그린다(라벨만 있으면 어느 각인지 표기가 안 됨 — m1u5 v2 검수 소급).
      out += angleArc(cx, cy, 24, s.from, s.to, color, undefined, { width: 2.2 });
      const m = polar(cx, cy, 42, s.from + span / 2);
      out += m5text(m.x, m.y + 4, s.angleLabel, "middle", color, 12);
    }
    if (s.valueLabel) {
      const m = polar(cx, cy, R + 18, s.from + span / 2);
      out += m5text(m.x, m.y + 4, s.valueLabel, "middle", GEO.ink, 11.5);
    }
  });
  out += dot(cx, cy, GEO.pt, 3.4) + ptLabel(cx, cy, "O", 0, 16);
  return svg("0 0 300 210", "한 원 안의 부채꼴들을 비교하는 그림", out);
}

/** 부채꼴 단독 그림 — 실제 각(deg)으로 그리고 각·반지름·호·넓이 라벨을 선택해 붙인다.
 *  역산 문항용: 구하는 값 자리는 "x"류 라벨을 쓴다. */
export function m5SectorXFig(o: {
  deg: number;
  degLabel?: string;
  rLabel?: string;
  arcLabel?: string;
  areaLabel?: string;
}): string {
  const cx = 128;
  const cy = o.deg > 180 ? 112 : 146;
  const R = 86;
  const a0 = o.deg > 180 ? -((o.deg - 180) / 2) - 8 : 10;
  const a1 = a0 + o.deg;
  const p0 = polar(cx, cy, R, a0);
  const p1 = polar(cx, cy, R, a1);
  const large = o.deg > 180 ? 1 : 0;
  let out = `<path d="M${cx} ${cy} L${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A${R} ${R} 0 ${large} 1 ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} Z" fill="${GEO.hlA}" opacity=".15"/>`;
  out += `<path d="M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A${R} ${R} 0 ${large} 1 ${p0.x.toFixed(1)} ${p0.y.toFixed(1)}" stroke="${GEO.hlA}" stroke-width="4.4" fill="none" stroke-linecap="round"/>`;
  out += m5seg({ x: cx, y: cy }, p0) + m5seg({ x: cx, y: cy }, p1);
  out += dot(cx, cy, GEO.pt, 3.2) + ptLabel(cx, cy, "O", -2, o.deg > 180 ? -8 : 15);
  if (o.degLabel) {
    const m = polar(cx, cy, 34, a0 + o.deg / 2);
    out += m5text(m.x, m.y + 4, o.degLabel, "middle", GEO.hlC, 12.5);
  }
  if (o.rLabel) {
    // 반지름 라벨은 a1 반지름의 수직 바깥쪽(부채꼴 밖)으로 밀어 선과 겹치지 않게(m1u5 v2 파일럿 검수 소급).
    const m = polar(cx, cy, R * 0.56, a1);
    const off = polar(0, 0, 14, a1 + 90);
    out += m5text(m.x + off.x, m.y + off.y + 4, o.rLabel, "middle", GEO.ink, 12);
  }
  if (o.arcLabel) {
    const m = polar(cx, cy, R + 18, a0 + o.deg / 2);
    out += m5text(m.x, m.y + 4, o.arcLabel, "middle", GEO.ink, 12);
  }
  if (o.areaLabel) {
    const m = polar(cx, cy, R * 0.62, a0 + o.deg / 2);
    out += m5text(m.x, m.y + 4, o.areaLabel, "middle", GEO.ink, 11.5);
  }
  return svg("0 0 280 206", "부채꼴과 표시된 값 그림", out);
}

/** 회전체 프로필 그림 — 세로 회전축(점선 l)과 축에 붙은 평면도형, 1회전 화살표, 치수 라벨. */
export function m5RotateFig(o: {
  profile: "rect" | "rtri" | "semi" | "rtrap";
  wLabel?: string;
  hLabel?: string;
  slantLabel?: string;
  topLabel?: string;
  topW?: number;
  wide?: boolean;
}): string {
  const ax = 104;
  const top = 54;
  const bot = 152;
  const W = o.wide ? 96 : 74;
  let shape = "";
  let labels = "";
  if (o.profile === "rect") {
    shape = `<path d="M${ax} ${top} H${ax + W} V${bot} H${ax} Z" fill="${GEO.hlB}" fill-opacity=".16" stroke="${GEO.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (o.hLabel) labels += m5text(ax + W + 10, (top + bot) / 2 + 4, o.hLabel, "start");
    if (o.wLabel) labels += m5text(ax + W / 2, bot + 17, o.wLabel);
  } else if (o.profile === "rtri") {
    shape = `<path d="M${ax} ${top} L${ax + W} ${bot} L${ax} ${bot} Z" fill="${GEO.hlB}" fill-opacity=".16" stroke="${GEO.ink}" stroke-width="2.5" stroke-linejoin="round"/>` + rightMark(ax, bot, 0, 12);
    if (o.hLabel) labels += m5text(ax - 10, (top + bot) / 2 + 4, o.hLabel, "end");
    if (o.wLabel) labels += m5text(ax + W / 2, bot + 17, o.wLabel);
    if (o.slantLabel) labels += m5text(ax + W / 2 + 16, (top + bot) / 2 - 8, o.slantLabel, "start");
  } else if (o.profile === "semi") {
    const r = (bot - top) / 2;
    shape = `<path d="M${ax} ${top} A${r} ${r} 0 0 1 ${ax} ${bot} Z" fill="${GEO.hlB}" fill-opacity=".16" stroke="${GEO.ink}" stroke-width="2.5"/>`;
    if (o.wLabel) {
      shape += `<line x1="${ax}" y1="${(top + bot) / 2}" x2="${ax + r}" y2="${(top + bot) / 2}" stroke="${GEO.soft}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      labels += m5text(ax + r / 2, (top + bot) / 2 - 7, o.wLabel);
    }
  } else {
    const tw = Math.round(W * (o.topW ?? 0.45));
    shape = `<path d="M${ax} ${top} H${ax + tw} L${ax + W} ${bot} H${ax} Z" fill="${GEO.hlB}" fill-opacity=".16" stroke="${GEO.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (o.topLabel) labels += m5text(ax + tw / 2, top - 9, o.topLabel);
    if (o.wLabel) labels += m5text(ax + W / 2, bot + 17, o.wLabel);
    if (o.hLabel) labels += m5text(ax - 10, (top + bot) / 2 + 4, o.hLabel, "end");
    if (o.slantLabel) labels += m5text(ax + (tw + W) / 2 + 14, (top + bot) / 2 - 2, o.slantLabel, "start");
  }
  const axis =
    `<line x1="${ax}" y1="16" x2="${ax}" y2="182" stroke="${GEO.soft}" stroke-width="2" stroke-dasharray="7 6"/>` +
    `<text x="${ax - 13}" y="27" font-size="12" font-weight="800" fill="${GEO.soft}" font-style="italic">l</text>` +
    `<path d="M${ax + 40} 28 a30 13 0 0 1 34 9" stroke="${GEO.hlC}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
    `<path d="M${ax + 78} 40 l-8.2 -3.4 l2.6 8.4 z" fill="${GEO.hlC}"/>` +
    `<text x="${ax + 58}" y="20" font-size="11.5" font-weight="800" fill="${GEO.hlC}">1회전</text>`;
  return svg("0 0 260 202", "회전축과 평면도형 그림", axis + shape + labels);
}

/** 회전 프로필 ①~⑤ 고르기 카드 — 작은 축·도형 카드를 나열한다(정답 ① 금지 관행). */
export function m5RotateChoicesFig(cells: Array<"rtri" | "rect" | "rtrap" | "semi" | "rtriAway">): string {
  let out = "";
  cells.forEach((kind, i) => {
    const row = i < 3 ? 0 : 1;
    const col = i < 3 ? i : i - 3;
    const x0 = (cells.length <= 3 || row === 0 ? 4 : 64) + col * 120;
    const y0 = 4 + row * 108;
    const ax = x0 + 38;
    const top = y0 + 30;
    const bot = y0 + 86;
    out +=
      `<rect x="${x0}" y="${y0}" width="112" height="102" rx="10" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.3"/>` +
      `<text x="${x0 + 12}" y="${y0 + 22}" font-size="16" font-weight="900" fill="${INK}">${"①②③④⑤⑥"[i]}</text>` +
      `<line x1="${ax}" y1="${y0 + 14}" x2="${ax}" y2="${y0 + 94}" stroke="${GEO.soft}" stroke-width="1.8" stroke-dasharray="6 5"/>`;
    const shape = (d: string) => `<path d="${d}" fill="${GEO.hlB}" fill-opacity=".18" stroke="${GEO.ink}" stroke-width="2.2" stroke-linejoin="round"/>`;
    if (kind === "rtri") out += shape(`M${ax} ${top} L${ax + 44} ${bot} L${ax} ${bot} Z`);
    if (kind === "rect") out += shape(`M${ax} ${top} H${ax + 40} V${bot} H${ax} Z`);
    if (kind === "rtrap") out += shape(`M${ax} ${top} H${ax + 22} L${ax + 46} ${bot} H${ax} Z`);
    if (kind === "semi") out += shape(`M${ax} ${top} A${(bot - top) / 2} ${(bot - top) / 2} 0 0 1 ${ax} ${bot} Z`);
    if (kind === "rtriAway") out += shape(`M${ax + 18} ${top} L${ax + 52} ${bot} L${ax + 18} ${bot} Z`);
  });
  const height = cells.length <= 3 ? 112 : 222;
  const width = cells.length <= 3 ? cells.length * 120 + 8 : 364;
  return svg(`0 0 ${width} ${height}`, "번호가 붙은 회전축과 평면도형 카드들", out);
}

/** 입체 겨냥도(2D) — 원기둥·원뿔·구·반구·직육면체·원기둥 속 구. 치수 라벨만 파라미터. */
export function m5SolidDimFig(o: {
  kind: "cyl" | "cone" | "sphere" | "hemi" | "box" | "sphereInCyl";
  rLabel?: string;
  hLabel?: string;
  lLabel?: string;
  wLabel?: string;
  dLabel?: string;
}): string {
  let out = "";
  if (o.kind === "cyl") {
    const cx = 150;
    const rx = 58;
    const ty = 48;
    const by = 158;
    out += `<ellipse cx="${cx}" cy="${by}" rx="${rx}" ry="15" fill="none" stroke="${GEO.ink}" stroke-width="2.3" stroke-dasharray="6 5"/>`;
    out += `<path d="M${cx - rx} ${by} A${rx} 15 0 0 0 ${cx + rx} ${by}" stroke="${GEO.ink}" stroke-width="2.5" fill="none"/>`;
    out += m5seg({ x: cx - rx, y: ty }, { x: cx - rx, y: by }) + m5seg({ x: cx + rx, y: ty }, { x: cx + rx, y: by });
    out += `<ellipse cx="${cx}" cy="${ty}" rx="${rx}" ry="15" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2.5"/>`;
    if (o.rLabel) {
      out += m5seg({ x: cx, y: ty }, { x: cx + rx, y: ty }, false, 2, GEO.hlC) + dot(cx, ty, GEO.hlC, 2.6);
      // 윗면 타원 위 호와 겹치지 않게 반지름 선 바로 위(살짝 안쪽)로(m1u5 v2 파일럿 검수 소급).
      out += m5text(cx + rx / 2 - 6, ty - 2, o.rLabel, "middle", GEO.hlC);
    }
    if (o.hLabel) out += m5text(cx + rx + 12, (ty + by) / 2 + 4, o.hLabel, "start");
  } else if (o.kind === "cone") {
    const cx = 150;
    const rx = 62;
    const ay = 30;
    const by = 162;
    out += `<ellipse cx="${cx}" cy="${by}" rx="${rx}" ry="15" fill="none" stroke="${GEO.ink}" stroke-width="2.3" stroke-dasharray="6 5"/>`;
    out += `<path d="M${cx - rx} ${by} A${rx} 15 0 0 0 ${cx + rx} ${by}" stroke="${GEO.ink}" stroke-width="2.5" fill="none"/>`;
    out += m5seg({ x: cx - rx, y: by }, { x: cx, y: ay }) + m5seg({ x: cx + rx, y: by }, { x: cx, y: ay });
    if (o.hLabel) {
      out += m5seg({ x: cx, y: ay }, { x: cx, y: by }, true, 1.8, GEO.soft) + rightMark(cx, by, 0, 10);
      // 중간 높이에선 왼쪽 모선이 라벨을 지나가므로 아래쪽(모선이 왼쪽으로 벌어진 구간)에 배치(m1u5 v2 검수 소급).
      out += m5text(cx - 8, (ay + by) / 2 + 32, o.hLabel, "end");
    }
    if (o.lLabel) out += m5text(cx + rx / 2 + 16, (ay + by) / 2 - 12, o.lLabel, "start");
    if (o.rLabel) {
      out += m5seg({ x: cx, y: by }, { x: cx + rx, y: by }, false, 2, GEO.hlC) + dot(cx, by, GEO.hlC, 2.6);
      // 반지름 선(위)과 밑면 타원 앞 호(아래) 사이 띠에 배치 — 호와 겹침 해소(m1u5 v2 검수 소급).
      out += m5text(cx + rx / 2 - 8, by + 11, o.rLabel, "middle", GEO.hlC);
    }
  } else if (o.kind === "sphere") {
    const cx = 150;
    const cy = 102;
    const R = 72;
    out += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${GEO.ink}" stroke-width="2.5"/>`;
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="20" fill="none" stroke="${GEO.soft}" stroke-width="1.8" stroke-dasharray="6 5"/>`;
    if (o.rLabel) {
      out += m5seg({ x: cx, y: cy }, { x: cx + R, y: cy }, false, 2, GEO.hlC) + dot(cx, cy, GEO.hlC, 2.8);
      out += m5text(cx + R / 2, cy - 8, o.rLabel, "middle", GEO.hlC);
    }
  } else if (o.kind === "hemi") {
    const cx = 150;
    const cy = 132;
    const R = 74;
    out += `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none" stroke="${GEO.ink}" stroke-width="2.5"/>`;
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="17" fill="none" stroke="${GEO.ink}" stroke-width="2.2"/>`;
    if (o.rLabel) {
      out += m5seg({ x: cx, y: cy }, { x: cx + R, y: cy }, false, 2, GEO.hlC) + dot(cx, cy, GEO.hlC, 2.8);
      out += m5text(cx + R / 2, cy - 8, o.rLabel, "middle", GEO.hlC);
    }
  } else if (o.kind === "box") {
    const x0 = 74;
    const y0 = 78;
    const w = 128;
    const h = 84;
    const ox = 34;
    const oy = 24;
    const P = (x: number, y: number) => ({ x, y });
    out += m5seg(P(x0, y0), P(x0 + w, y0)) + m5seg(P(x0 + w, y0), P(x0 + w, y0 + h)) + m5seg(P(x0 + w, y0 + h), P(x0, y0 + h)) + m5seg(P(x0, y0 + h), P(x0, y0));
    out += m5seg(P(x0 + ox, y0 - oy), P(x0 + w + ox, y0 - oy)) + m5seg(P(x0 + w + ox, y0 - oy), P(x0 + w + ox, y0 + h - oy));
    out += m5seg(P(x0, y0), P(x0 + ox, y0 - oy)) + m5seg(P(x0 + w, y0), P(x0 + w + ox, y0 - oy)) + m5seg(P(x0 + w, y0 + h), P(x0 + w + ox, y0 + h - oy));
    out += m5seg(P(x0 + ox, y0 - oy), P(x0 + ox, y0 + h - oy), true) + m5seg(P(x0 + ox, y0 + h - oy), P(x0 + w + ox, y0 + h - oy), true) + m5seg(P(x0, y0 + h), P(x0 + ox, y0 + h - oy), true);
    if (o.wLabel) out += m5text(x0 + w / 2, y0 + h + 17, o.wLabel);
    if (o.dLabel) out += m5text(x0 + w + ox / 2 + 10, y0 + h - oy / 2 + 10, o.dLabel, "start");
    if (o.hLabel) out += m5text(x0 - 10, y0 + h / 2 + 4, o.hLabel, "end");
  } else {
    const cx = 150;
    const rx = 56;
    const ty = 50;
    const by = 162;
    const cy = (ty + by) / 2;
    out += `<ellipse cx="${cx}" cy="${by}" rx="${rx}" ry="14" fill="none" stroke="${GEO.ink}" stroke-width="2.3" stroke-dasharray="6 5"/>`;
    out += `<path d="M${cx - rx} ${by} A${rx} 14 0 0 0 ${cx + rx} ${by}" stroke="${GEO.ink}" stroke-width="2.5" fill="none"/>`;
    out += m5seg({ x: cx - rx, y: ty }, { x: cx - rx, y: by }) + m5seg({ x: cx + rx, y: ty }, { x: cx + rx, y: by });
    out += `<ellipse cx="${cx}" cy="${ty}" rx="${rx}" ry="14" fill="none" stroke="${GEO.ink}" stroke-width="2.5"/>`;
    out += `<circle cx="${cx}" cy="${cy}" r="${rx}" fill="${GEO.hlB}" fill-opacity=".1" stroke="${GEO.hlB}" stroke-width="2.4"/>`;
    if (o.rLabel) {
      out += m5seg({ x: cx, y: cy }, { x: cx + rx, y: cy }, false, 2, GEO.hlC) + dot(cx, cy, GEO.hlC, 2.8);
      out += m5text(cx + rx / 2, cy - 8, o.rLabel, "middle", GEO.hlC);
    }
    if (o.hLabel) out += m5text(cx + rx + 12, cy + 4, o.hLabel, "start");
  }
  return svg("0 0 300 200", "치수가 표시된 입체도형 겨냥도", out);
}

/** 정사각형과 두 사분원이 만드는 렌즈 색칠 그림 — 꼭짓점 B·D 중심, 반지름 = 한 변. */
export function m5LensFig(sideLabel: string): string {
  const A = { x: 78, y: 44 };
  const D = { x: 222, y: 44 };
  const B = { x: 78, y: 188 };
  const C = { x: 222, y: 188 };
  const R = 144;
  let out = `<path d="M${A.x} ${A.y} A${R} ${R} 0 0 1 ${C.x} ${C.y} A${R} ${R} 0 0 1 ${A.x} ${A.y} Z" fill="${GEO.hlA}" opacity=".3"/>`;
  out += `<path d="M${A.x} ${A.y} A${R} ${R} 0 0 1 ${C.x} ${C.y}" stroke="${GEO.hlA}" stroke-width="3" fill="none"/>`;
  out += `<path d="M${C.x} ${C.y} A${R} ${R} 0 0 1 ${A.x} ${A.y}" stroke="${GEO.hlA}" stroke-width="3" fill="none"/>`;
  out += `<path d="M${A.x} ${A.y} H${D.x} V${C.y} H${B.x} Z" fill="none" stroke="${GEO.ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
  out += ptLabel(A.x, A.y, "A", -11, -5) + ptLabel(D.x, D.y, "D", 11, -5) + ptLabel(B.x, B.y, "B", -11, 13) + ptLabel(C.x, C.y, "C", 11, 13);
  out += m5text(150, 207, sideLabel);
  return svg("0 0 300 214", "정사각형 안에 두 원의 일부로 색칠된 부분을 나타낸 그림", out);
}

// ── m2u5(중2 Ⅴ 도형의 닮음과 피타고라스 정리) 시험 그림 — 전부 "실비·실각 인자 → 좌표 계산" 파라미터형.
// 8호 ③의 Ⅴ판 원칙: 닮음 쌍은 닮음비 인자로 실제 비율 렌더, 분할점(중점·등분점·교점)은 전부
// 좌표로 계산(평행이 참인 배치만 평행하게), 무게중심 = 꼭짓점 평균, 피타 격자는 칸 수 정확.
// 라벨을 넘기는 자리의 항등식은 각 헬퍼 JSDoc에 명문화 — 저작은 그 항등식을 만족하는 값만 인쇄한다.
// 구할 값 자리는 x·㉠·? 라벨만(정답 수치 미인쇄), aria는 중립 서술.

const m2mid = (a: GPt, b: GPt): GPt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const m2lerp = (a: GPt, b: GPt, t: number): GPt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
/** 평행 표시 꺾쇠(진행 방향 >, n개) — 선분 중점에. */
const m2chev = (a: GPt, b: GPt, n = 1, color: string = GEO.soft): string => {
  const dir = angleOf(a.x, a.y, b.x, b.y);
  let s = "";
  for (let i = 0; i < n; i += 1) {
    const c = polar(m2mid(a, b).x, m2mid(a, b).y, (i - (n - 1) / 2) * 8, dir);
    const p1 = polar(c.x, c.y, 6.5, dir + 140);
    const p2 = polar(c.x, c.y, 6.5, dir - 140);
    s += `<path d="M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${c.x.toFixed(1)} ${c.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  return s;
};
/** 꼭짓점 이름 라벨 — 도형 중심 반대쪽(바깥)으로 밀어 배치. */
const m2ptOut = (p: GPt, cen: GPt, name: string, dist = 15): string => {
  const dx = p.x - cen.x;
  const dy = p.y - cen.y;
  const len = Math.hypot(dx, dy) || 1;
  return ptLabel(p.x + (dx / len) * dist, p.y + (dy / len) * dist, name, 0, 4);
};
/** 내각 목록 걷기 생성(m5PolyAngleFig 계보) — angles 합 = (n−2)·180, 마지막 두 변 닫힘 역산.
 *  반환 좌표는 수학 y(위+) 원시값 — 호출부가 배치·스케일한다. */
const m2walk = (angles: number[], sides: number[]): GPt[] => {
  const RAD = Math.PI / 180;
  const n = angles.length;
  const headings: number[] = [0];
  for (let i = 1; i < n; i += 1) headings.push(headings[i - 1] + 180 - angles[i]);
  const raw: GPt[] = [{ x: 0, y: 0 }];
  for (let i = 1; i <= n - 2; i += 1) {
    const prev = raw[i - 1];
    raw.push({ x: prev.x + sides[i - 1] * Math.cos(headings[i - 1] * RAD), y: prev.y + sides[i - 1] * Math.sin(headings[i - 1] * RAD) });
  }
  const u = { x: Math.cos(headings[n - 2] * RAD), y: Math.sin(headings[n - 2] * RAD) };
  const v = { x: Math.cos(headings[n - 1] * RAD), y: Math.sin(headings[n - 1] * RAD) };
  const gap = { x: -raw[n - 2].x, y: -raw[n - 2].y };
  const det = u.x * v.y - u.y * v.x;
  const lenA = det === 0 ? 1 : (gap.x * v.y - gap.y * v.x) / det;
  raw.push({ x: raw[n - 2].x + lenA * u.x, y: raw[n - 2].y + lenA * u.y });
  return raw;
};
/** 원시 좌표 묶음을 y 반전+스케일+가운데 배치. 반환: 변환된 묶음과 전체 높이 H. */
const m2fit = (groups: GPt[][], maxW: number, maxH: number, viewW = 360, padY = 44): { g: GPt[][]; H: number } => {
  const all = groups.flat();
  const minX = Math.min(...all.map((p) => p.x));
  const maxX = Math.max(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  const spanX = Math.max(maxX - minX, 0.01);
  const spanY = Math.max(maxY - minY, 0.01);
  const scale = Math.min(maxW / spanX, maxH / spanY);
  const H = Math.round(spanY * scale) + padY * 2;
  const offX = (viewW - spanX * scale) / 2;
  return { g: groups.map((grp) => grp.map((p) => ({ x: (p.x - minX) * scale + offX, y: H - padY - (p.y - minY) * scale }))), H };
};

/** 닮은 사각형 쌍 — angles(실내각 4개, 합 360 필수)와 sides(AB·BC 논리 길이)로 왼쪽을 걷기
 *  생성하고, 오른쪽 = 왼쪽 × ratio(실비 렌더)라 대응변 비 = ratio가 구조적으로 보장된다.
 *  rect를 주면 직사각형 쌍 모드([w1,h1,w2,h2] 실비 — 반례·비닮음 쌍용, angles 무시).
 *  항등식: 각 라벨 = angles의 그 값(대응점끼리 같음) · 변 라벨 비 = ratio(rect 모드는 w·h 그대로).
 *  labelsL/R는 꼭짓점 순(A→B→C→D) 내각 라벨, sidesL/R는 [AB,BC,CD,DA] 변 라벨. */
export function m2ExamSimQuadPairFig(o: {
  angles?: [number, number, number, number];
  sides?: [number, number];
  ratio?: number;
  rect?: [number, number, number, number];
  labelsL?: Array<string | null>;
  labelsR?: Array<string | null>;
  sidesL?: Array<string | null>;
  sidesR?: Array<string | null>;
  namesL?: [string, string, string, string];
  namesR?: [string, string, string, string];
  flipR?: boolean;
}): string {
  const ratio = o.ratio ?? 0.66;
  let rawL: GPt[];
  let rawR: GPt[];
  if (o.rect) {
    const [w1, h1, w2, h2] = o.rect;
    rawL = [{ x: 0, y: h1 }, { x: 0, y: 0 }, { x: w1, y: 0 }, { x: w1, y: h1 }];
    rawR = [{ x: 0, y: h2 }, { x: 0, y: 0 }, { x: w2, y: 0 }, { x: w2, y: h2 }];
  } else {
    const angles = o.angles ?? [95, 70, 110, 85];
    rawL = m2walk(angles, [...(o.sides ?? [1, 1.25]), 1, 1]);
    rawR = rawL.map((p) => ({ x: p.x * ratio, y: p.y * ratio }));
  }
  if (o.flipR) {
    const mx = Math.max(...rawR.map((p) => p.x));
    rawR = rawR.map((p) => ({ x: mx - p.x, y: p.y }));
  }
  const wL = Math.max(...rawL.map((p) => p.x)) - Math.min(...rawL.map((p) => p.x));
  const wR = Math.max(...rawR.map((p) => p.x)) - Math.min(...rawR.map((p) => p.x));
  const hMax = Math.max(...rawL.map((p) => p.y), ...rawR.map((p) => p.y));
  // 좌우 여백 28씩 + 사이 간격 44 — 바깥 라벨(각·변) 자리를 남기고 오른쪽 잘림을 막는다.
  const scale = Math.min(260 / (wL + wR), 118 / Math.max(hMax, 0.01));
  const H = Math.round(hMax * scale) + 92;
  const place = (raw: GPt[], left: number): GPt[] => {
    const minX = Math.min(...raw.map((p) => p.x));
    const minY = Math.min(...raw.map((p) => p.y));
    return raw.map((p) => ({ x: (p.x - minX) * scale + left, y: H - 52 - (p.y - minY) * scale }));
  };
  const L = place(rawL, 28);
  const R = place(rawR, 28 + wL * scale + 44);
  let out = g4poly(L) + g4poly(R, F4B);
  const cenL = g4cen(L);
  const cenR = g4cen(R);
  const namesL = o.namesL ?? ["A", "B", "C", "D"];
  const namesR = o.namesR ?? ["E", "F", "G", "H"];
  for (let i = 0; i < 4; i += 1) {
    const nx = (i + 1) % 4;
    if (o.labelsL?.[i]) out += g4arc(L[i], L[(i + 3) % 4], L[nx], [GEO.hlA, GEO.hlB, GEO.hlD, GEO.hlC][i], o.labelsL[i] ?? undefined, 17, 33);
    if (o.labelsR?.[i]) out += g4arc(R[i], R[(i + 3) % 4], R[nx], [GEO.hlA, GEO.hlB, GEO.hlD, GEO.hlC][i], o.labelsR[i] ?? undefined, 15, 30);
    if (o.sidesL?.[i]) out += g4side(L[i], L[nx], o.sidesL[i] ?? "", cenL, 14, false, 11.5);
    if (o.sidesR?.[i]) out += g4side(R[i], R[nx], o.sidesR[i] ?? "", cenR, 14, false, 11.5);
    out += m2ptOut(L[i], cenL, namesL[i], 13) + m2ptOut(R[i], cenR, namesR[i], 13);
  }
  return svg(`0 0 360 ${H}`, "두 사각형을 나란히 놓은 그림", out);
}

/** 삼각형 쌍(닮음 조건 판별·닮음비) — 왼쪽은 밑각 B1·C1(실각), 오른쪽은 기본 같은 모양을
 *  ratio 배(실비)로 그린다. B2·C2를 따로 주면 모양이 다른(비닮음) 쌍이 된다.
 *  rot2(도)·flip2로 오른쪽을 돌리거나 뒤집어 "대응 찾기" 난도를 준다(각 호는 실좌표 추적이라 안전).
 *  항등식: 각 라벨 = 실각(∠A=180−B−C) · 같은 모양일 때 변 라벨 비 = ratio.
 *  sides1/2는 { AB, BC, CA } 변 라벨, labels1/2는 { A, B, C } 각 라벨. */
export function m2ExamTriPairFig(o: {
  B1: number;
  C1: number;
  B2?: number;
  C2?: number;
  ratio?: number;
  labels1?: Partial<Record<"A" | "B" | "C", string>>;
  labels2?: Partial<Record<"A" | "B" | "C", string>>;
  sides1?: Partial<Record<"AB" | "BC" | "CA", string>>;
  sides2?: Partial<Record<"AB" | "BC" | "CA", string>>;
  names1?: [string, string, string];
  names2?: [string, string, string];
  flip2?: boolean;
  rot2?: number;
}): string {
  const ratio = o.ratio ?? 0.68;
  const B2 = o.B2 ?? o.B1;
  const C2 = o.C2 ?? o.C1;
  const mk = (Bdeg: number, Cdeg: number, base: number): GPt[] => {
    const tb = Math.tan((Bdeg * Math.PI) / 180);
    const tc = Math.tan((Cdeg * Math.PI) / 180);
    const h = (base * tb * tc) / (tb + tc);
    return [{ x: (base * tc) / (tb + tc), y: h }, { x: 0, y: 0 }, { x: base, y: 0 }];
  };
  const base1 = 150;
  let raw1 = mk(o.B1, o.C1, base1);
  let raw2 = mk(B2, C2, base1 * ratio);
  if (o.flip2) {
    const mx = Math.max(...raw2.map((p) => p.x));
    raw2 = raw2.map((p) => ({ x: mx - p.x, y: p.y }));
  }
  if (o.rot2) {
    const c = { x: raw2.reduce((s, p) => s + p.x, 0) / 3, y: raw2.reduce((s, p) => s + p.y, 0) / 3 };
    const t = (o.rot2 * Math.PI) / 180;
    raw2 = raw2.map((p) => ({
      x: c.x + (p.x - c.x) * Math.cos(t) - (p.y - c.y) * Math.sin(t),
      y: c.y + (p.x - c.x) * Math.sin(t) + (p.y - c.y) * Math.cos(t),
    }));
  }
  const norm = (raw: GPt[]): GPt[] => {
    const minX = Math.min(...raw.map((p) => p.x));
    const minY = Math.min(...raw.map((p) => p.y));
    return raw.map((p) => ({ x: p.x - minX, y: p.y - minY }));
  };
  raw1 = norm(raw1);
  raw2 = norm(raw2);
  const w1 = Math.max(...raw1.map((p) => p.x));
  const w2 = Math.max(...raw2.map((p) => p.x));
  const hMax = Math.max(...raw1.map((p) => p.y), ...raw2.map((p) => p.y));
  const scale = Math.min(160 / w1, 122 / w2, 122 / Math.max(hMax, 0.01), 1.6);
  const H = Math.round(hMax * scale) + 92;
  const place = (raw: GPt[], left: number): GPt[] => raw.map((p) => ({ x: p.x * scale + left, y: H - 52 - p.y * scale }));
  const T1 = place(raw1, 24);
  const T2 = place(raw2, 24 + w1 * scale + 48);
  let out = g4poly(T1) + g4poly(T2, F4B);
  const draw = (T: GPt[], labels?: Partial<Record<"A" | "B" | "C", string>>, sides?: Partial<Record<"AB" | "BC" | "CA", string>>, names?: [string, string, string]): string => {
    const cen = g4cen(T);
    const [A, B, C] = T;
    let s = "";
    if (labels?.A) s += g4arc(A, B, C, GEO.hlA, labels.A, 17, 33);
    if (labels?.B) s += g4arc(B, C, A, GEO.hlB, labels.B, 17, 33);
    if (labels?.C) s += g4arc(C, A, B, GEO.hlD, labels.C, 17, 33);
    if (sides?.AB) s += g4side(A, B, sides.AB, cen, 14, false, 11.5);
    if (sides?.BC) s += g4side(B, C, sides.BC, cen, 14, false, 11.5);
    if (sides?.CA) s += g4side(C, A, sides.CA, cen, 14, false, 11.5);
    const nm = names ?? ["A", "B", "C"];
    return s + m2ptOut(A, cen, nm[0], 13) + m2ptOut(B, cen, nm[1], 13) + m2ptOut(C, cen, nm[2], 13);
  };
  out += draw(T1, o.labels1, o.sides1, o.names1) + draw(T2, o.labels2, o.sides2, o.names2 ?? ["D", "E", "F"]);
  return svg(`0 0 360 ${H}`, "두 삼각형을 나란히 놓은 그림", out);
}

/** 삼각형 내부 가로선(D는 AB 위, E는 AC 위) — 겹친 닮음·평행선 공용.
 *  mode "para": DE∥BC(E는 t 강제 — 평행이 참인 배치만 평행하게 그린다).
 *  mode "free": s를 따로 준다(비평행 — 평행 판정 반례·닮음 아님 사례).
 *  mode "swapped": ∠ADE=∠ACB인 뒤집힌 닮음(△ADE∽△ACB) — s는 t·(AB/AC)²로 자동 역산되어
 *  각이 실제로 일치한다(라벨용 항등식: AD·AB=AE·AC).
 *  t = AD:AB의 t(0~1). labels는 부분 선분 라벨, marks는 세 글자 각 키(g4marks). */
export function m2ExamTriSplitFig(o: {
  B?: number;
  C?: number;
  t: number;
  s?: number;
  mode?: "para" | "free" | "swapped";
  labels?: Partial<Record<"AD" | "DB" | "AB" | "AE" | "EC" | "AC" | "DE" | "BC", string>>;
  marks?: Array<{ at: string; label: string }>;
  names?: [string, string, string, string, string];
  paraMarks?: boolean;
}): string {
  const mode = o.mode ?? "para";
  const { A, B, C, H } = g4tri(o.B ?? 64, o.C ?? 52, 236);
  const lenAB = Math.hypot(B.x - A.x, B.y - A.y);
  const lenAC = Math.hypot(C.x - A.x, C.y - A.y);
  const s = mode === "para" ? o.t : mode === "swapped" ? o.t * ((lenAB * lenAB) / (lenAC * lenAC)) : (o.s ?? o.t);
  const D = m2lerp(A, B, o.t);
  const E = m2lerp(A, C, Math.min(s, 0.96));
  const cen = g4cen([A, B, C]);
  const [nA, nB, nC, nD, nE] = o.names ?? ["A", "B", "C", "D", "E"];
  let out = g4poly([A, B, C]) + g4line(D, E, GEO.hlB, 2.5);
  if ((o.paraMarks ?? mode === "para") && mode === "para") out += m2chev(D, E, 1, GEO.hlB) + m2chev(B, C, 1, GEO.soft);
  if (o.labels?.AD) out += g4side(A, D, o.labels.AD, cen, 14, false, 11.5);
  if (o.labels?.DB) out += g4side(D, B, o.labels.DB, cen, 14, false, 11.5);
  if (o.labels?.AB) out += g4side(A, B, o.labels.AB, cen, 40, false, 11.5);
  if (o.labels?.AE) out += g4side(A, E, o.labels.AE, cen, 14, false, 11.5);
  if (o.labels?.EC) out += g4side(E, C, o.labels.EC, cen, 14, false, 11.5);
  if (o.labels?.AC) out += g4side(A, C, o.labels.AC, cen, 40, false, 11.5);
  if (o.labels?.DE) out += g4side(D, E, o.labels.DE, cen, 13, true, 11.5);
  if (o.labels?.BC) out += g4side(B, C, o.labels.BC, cen, 15, false, 11.5);
  const pts: Record<string, GPt> = { A, B, C, D, E };
  if (o.marks?.length) out += g4marks(pts, o.marks, { A: ["B", "C"], B: ["A", "C"], C: ["A", "B"], D: ["A", "E"], E: ["A", "D"] });
  out += dot(D.x, D.y, GEO.pt, 3) + dot(E.x, E.y, GEO.pt, 3);
  out += ptLabel(A.x, A.y, nA, 0, -10) + ptLabel(B.x, B.y, nB, -8, 16) + ptLabel(C.x, C.y, nC, 8, 16);
  out += ptLabel(D.x, D.y, nD, -13, 2) + ptLabel(E.x, E.y, nE, 14, 2);
  return svg(`0 0 360 ${H}`, "삼각형과 두 변 위의 점을 이은 선을 나타낸 그림", out);
}

/** X자 교차(나비) 구도 — 교점 O에서 네 방향으로 rTop=[OA,OC]·rSide=[OB,OD] 논리 길이만큼
 *  방사해 A·B·C·D를 실좌표로 놓는다(A—O—C, B—O—D가 각각 일직선). 위 선분 AB, 아래 선분 DC.
 *  항등식: OA:OC·OB:OD = 넘긴 논리비 그대로, AB∥DC ⟺ OA/OC=OB/OD — paraMarks는 비가 같은
 *  세팅에서만 켠다(다르면 마크가 자동 생략된다). 라벨: OA·OB·OC·OD·AB·DC + marks(세 글자 각). */
export function m2ExamXCrossFig(o: {
  rTop: [number, number];
  rSide: [number, number];
  labels?: Partial<Record<"OA" | "OB" | "OC" | "OD" | "AB" | "DC", string>>;
  marks?: Array<{ at: string; label: string }>;
  names?: [string, string, string, string, string];
  paraMarks?: boolean;
}): string {
  const unit = Math.min(60, 132 / Math.max(o.rTop[0], o.rTop[1]), 132 / Math.max(o.rSide[0], o.rSide[1]));
  const aA = 38;
  const aB = 142;
  const O = { x: 180, y: 0 };
  const A = polar(O.x, O.y, o.rTop[0] * unit, aA);
  const C = polar(O.x, O.y, o.rTop[1] * unit, aA + 180);
  const B = polar(O.x, O.y, o.rSide[0] * unit, aB);
  const D = polar(O.x, O.y, o.rSide[1] * unit, aB + 180);
  const minY = Math.min(A.y, B.y, C.y, D.y, O.y);
  const maxY = Math.max(A.y, B.y, C.y, D.y, O.y);
  const H = Math.round(maxY - minY) + 80;
  const dy = 40 - minY;
  for (const p of [A, B, C, D, O]) p.y += dy;
  const [nA, nB, nO, nC, nD] = o.names ?? ["A", "B", "O", "C", "D"];
  let out = g4line(A, C, GEO.ink, 2.5) + g4line(B, D, GEO.ink, 2.5);
  out += g4line(A, B, GEO.hlB, 2.6) + g4line(D, C, GEO.hlB, 2.6);
  const isPara = Math.abs(o.rTop[0] / o.rTop[1] - o.rSide[0] / o.rSide[1]) < 1e-9;
  if (o.paraMarks && isPara) out += m2chev(A, B, 1, GEO.hlB) + m2chev(D, C, 1, GEO.hlB);
  const cenT = g4cen([A, B, O]);
  const cenB = g4cen([C, D, O]);
  if (o.labels?.OA) out += g4side(O, A, o.labels.OA, cenT, 13, true, 11.5);
  if (o.labels?.OB) out += g4side(O, B, o.labels.OB, cenT, 13, true, 11.5);
  if (o.labels?.OC) out += g4side(O, C, o.labels.OC, cenB, 13, true, 11.5);
  if (o.labels?.OD) out += g4side(O, D, o.labels.OD, cenB, 13, true, 11.5);
  if (o.labels?.AB) out += g4side(A, B, o.labels.AB, cenT, 15, false, 11.5);
  if (o.labels?.DC) out += g4side(D, C, o.labels.DC, cenB, 15, false, 11.5);
  const pts: Record<string, GPt> = { A, B, C, D, O };
  if (o.marks?.length) out += g4marks(pts, o.marks, { A: ["B", "O"], B: ["A", "O"], C: ["D", "O"], D: ["C", "O"], O: ["A", "B"] });
  out += dot(O.x, O.y, GEO.pt, 3.4);
  out += ptLabel(A.x, A.y, nA, 8, -8) + ptLabel(B.x, B.y, nB, -9, -8) + ptLabel(O.x, O.y, nO, 0, -12);
  out += ptLabel(C.x, C.y, nC, -9, 16) + ptLabel(D.x, D.y, nD, 9, 16);
  return svg(`0 0 360 ${H}`, "두 선분이 한 점에서 엇갈려 만나는 그림", out);
}

/** 직각삼각형 빗변 위 수선 구도 — bd·dc(논리 길이)만 주면 A=(D 위로 √(bd·dc))로 계산해
 *  ∠BAC=90°가 실제로 성립한다(탈레스). 항등식: AD²=BD·DC, AB²=BD·BC, AC²=CD·CB —
 *  라벨 수치는 bd·dc가 그 항등식을 만족하는 완전제곱 조합(4·9, 9·16, 4·25, 16·25, 2·8, 8·18…)으로 저작.
 *  rightAtA(∠A 꺾쇠)·rightAtD(수선 발 꺾쇠, 기본 true). */
export function m2ExamRightAltFig(o: {
  bd: number;
  dc: number;
  labels?: Partial<Record<"BD" | "DC" | "BC" | "AD" | "AB" | "AC", string>>;
  marks?: Array<{ at: string; label: string }>;
  names?: [string, string, string, string];
  rightAtA?: boolean;
  rightAtD?: boolean;
  showAlt?: boolean;
}): string {
  const unit = Math.min(46, 252 / (o.bd + o.dc), 148 / Math.sqrt(o.bd * o.dc));
  const w = (o.bd + o.dc) * unit;
  const h = Math.sqrt(o.bd * o.dc) * unit;
  const H = Math.round(h) + 92;
  const gy = H - 50;
  const lx = (360 - w) / 2;
  const B = { x: lx, y: gy };
  const C = { x: lx + w, y: gy };
  const D = { x: lx + o.bd * unit, y: gy };
  const A = { x: D.x, y: gy - h };
  const cen = g4cen([A, B, C]);
  const [nA, nB, nC, nD] = o.names ?? ["A", "B", "C", "D"];
  let out = g4poly([A, B, C]);
  if (o.showAlt !== false) {
    out += g4line(A, D, GEO.hlC, 2.4);
    if (o.rightAtD !== false) out += rightMark(D.x, D.y, 180, 11);
  }
  // ∠BAC=90°가 이 구도의 전제라 직각 마크는 기본 표시(2026-07-22 파일럿 검수 반영).
  if (o.rightAtA !== false) out += g4right(A, B, C, 11);
  if (o.labels?.BD) out += g4side(B, D, o.labels.BD, cen, 15, false, 11.5);
  if (o.labels?.DC) out += g4side(D, C, o.labels.DC, cen, 15, false, 11.5);
  if (o.labels?.BC) out += g4side(B, C, o.labels.BC, cen, 30, false, 11.5);
  if (o.labels?.AD) out += g4text(A.x + 8, (A.y + D.y) / 2 + 4, o.labels.AD, 11.5, GEO.hlC, "start");
  if (o.labels?.AB) out += g4side(A, B, o.labels.AB, cen, 15, false, 11.5);
  if (o.labels?.AC) out += g4side(A, C, o.labels.AC, cen, 15, false, 11.5);
  const pts: Record<string, GPt> = { A, B, C, D };
  if (o.marks?.length) out += g4marks(pts, o.marks, { A: ["B", "C"], B: ["A", "C"], C: ["A", "B"], D: ["A", "B"] });
  if (o.showAlt !== false) out += dot(D.x, D.y, GEO.pt, 3);
  out += ptLabel(A.x, A.y, nA, 0, -10) + ptLabel(B.x, B.y, nB, -8, 16) + ptLabel(C.x, C.y, nC, 8, 16) + ptLabel(D.x, D.y, nD, 0, 18);
  return svg(`0 0 360 ${H}`, "직각삼각형과 빗변에 내린 수선을 나타낸 그림", out);
}

/** 평행선 3~4개(l∥m∥n)와 사선 — gaps(간격 논리비)로 평행선 y를 놓고, 사선은 위끝 x0 →
 *  아래끝 x1 직선이라 각 구간 길이 비가 gaps 비와 구조적으로 일치한다(교점 전부 실좌표).
 *  cuts[].labels는 위→아래 구간 라벨(gaps 개수만큼, null 생략). 사선 둘의 x 범위를 엇갈리게
 *  주면 교차형(X자) 배치도 실좌표로 성립. names는 평행선 이름(l·m·n·p — 왼쪽 끝 위 라벨). */
export function m2ExamParaLinesFig(o: {
  gaps: number[];
  names?: string[];
  cuts: Array<{ x0: number; x1: number; labels?: Array<string | null>; color?: string }>;
  arrows?: boolean;
}): string {
  const total = o.gaps.reduce((s, g) => s + g, 0);
  const unit = Math.min(64, 168 / total);
  const ys: number[] = [46];
  for (const g of o.gaps) ys.push(ys[ys.length - 1] + g * unit);
  const H = ys[ys.length - 1] + 44;
  const x0 = 34;
  const x1 = 326;
  let out = "";
  o.names?.forEach((nm, i) => {
    if (nm && ys[i] !== undefined) out += g4text(x0 - 12, ys[i] + 4, nm, 12, GEO.soft, "middle");
  });
  for (const y of ys) {
    out += lineSvg(x0, y, x1, y, GEO.ink, 2.2);
    if (o.arrows !== false) out += arrowHead(x1, y, 0, GEO.ink, 6);
  }
  const yTop = ys[0];
  const yBot = ys[ys.length - 1];
  for (const cut of o.cuts) {
    const color = cut.color ?? GEO.hlB;
    const at = (y: number): GPt => ({ x: cut.x0 + ((cut.x1 - cut.x0) * (y - yTop)) / (yBot - yTop), y });
    const pTop = at(yTop - 14);
    const pBot = at(yBot + 14);
    out += lineSvg(pTop.x, pTop.y, pBot.x, pBot.y, color, 2.5);
    const cen = { x: 180, y: (yTop + yBot) / 2 };
    cut.labels?.forEach((lb, i) => {
      if (!lb) return;
      const a = at(ys[i]);
      const b = at(ys[i + 1]);
      out += g4side(a, b, lb, cen, 15, false, 11.5) + dot(a.x, a.y, color, 2.6) + dot(b.x, b.y, color, 2.6);
    });
  }
  return svg(`0 0 360 ${H}`, "평행한 직선들과 그 사이를 가로지르는 선을 나타낸 그림", out);
}

/** 사다리꼴(AD∥BC) 안의 평행 절단선 EF — E는 AB 위 t(AE:EB=t:1−t), F는 DC 위 같은 t라
 *  EF∥AD∥BC가 자동 성립하고 |EF| = top+(bot−top)·t가 실렌더된다.
 *  항등식: EF 라벨 = top+(bot−top)·t (t=0.5 중점이면 (top+bot)/2 — midTicks는 t=0.5에서만).
 *  diag: 대각선 AC와 EF의 교점 G(실교점 — AG 위 EG=½AD? 아님: EG는 △ABC 쪽 비례) 점 표시. */
export function m2ExamTrapCutFig(o: {
  top: number;
  bot: number;
  t: number;
  labels?: Partial<Record<"AD" | "BC" | "EF" | "AE" | "EB" | "DF" | "FC" | "AB" | "DC" | "DH" | "HC", string>>;
  midTicks?: boolean;
  diag?: boolean;
  gName?: string;
  names?: [string, string, string, string, string, string];
  paraMarks?: boolean;
  /** D에서 BC로 내린 수선(발 H + 직각 마크) — 피타고라스 사다리꼴 유형. t를 1로 두고
   *  E·F 라벨 없이 쓰면 순수 사다리꼴 + 수선 그림이 된다(수선 길이 = 사다리꼴 높이 실렌더). */
  perp?: boolean;
  perpName?: string;
  /** 사다리꼴 모양 — "right": ∠A=∠B=90°(왼변 수직, HC=bot−top 실렌더) ·
   *  "iso": 이등변(좌우 대칭, HC=(bot−top)/2 실렌더) · 생략: 일반(좌 오프셋 0.62).
   *  perp와 함께 쓰면 HC 라벨 항등식이 모양으로 보장된다. height를 주면 세로도 실비. */
  shape?: "right" | "iso";
  height?: number;
}): string {
  const unit = Math.min(56, 236 / Math.max(o.top, o.bot), ...(o.height ? [150 / o.height] : []));
  const topW = o.top * unit;
  const botW = o.bot * unit;
  const h = o.height ? o.height * unit : 126;
  const H = Math.round(h) + 96;
  const gy = H - 50;
  const bx = (360 - botW) / 2;
  const ax = bx + (botW - topW) * (o.shape === "right" ? 0 : o.shape === "iso" ? 0.5 : 0.62);
  const A = { x: ax, y: gy - h };
  const D = { x: ax + topW, y: gy - h };
  const B = { x: bx, y: gy };
  const C = { x: bx + botW, y: gy };
  const E = m2lerp(A, B, o.t);
  const F = m2lerp(D, C, o.t);
  const cen = g4cen([A, B, C, D]);
  const [nA, nB, nC, nD, nE, nF] = o.names ?? ["A", "B", "C", "D", "E", "F"];
  const noEF = o.t >= 0.999;
  let out = g4poly([A, B, C, D]) + (noEF ? "" : g4line(E, F, GEO.hlB, 2.5));
  if (o.shape === "right") out += g4right(A, D, B, 9) + g4right(B, A, C, 9);
  if (o.perp) {
    const Hp = { x: D.x, y: gy };
    out += g4line(D, Hp, GEO.hlC, 2.2, "6 5") + rightMark(Hp.x, Hp.y, 180, 11);
    out += dot(Hp.x, Hp.y, GEO.pt, 3) + ptLabel(Hp.x, Hp.y, o.perpName ?? "H", 0, 18);
    if (o.labels?.DH) out += g4text(D.x - 9, (D.y + gy) / 2 + 4, o.labels.DH, 11.5, GEO.hlC, "end");
    if (o.labels?.HC) out += g4side(Hp, C, o.labels.HC, cen, 15, false, 11.5);
  }
  if (o.paraMarks) out += m2chev(A, D, 1, GEO.soft) + m2chev(E, F, 1, GEO.hlB) + m2chev(B, C, 1, GEO.soft);
  if (o.midTicks) out += tickMark(A.x, A.y, E.x, E.y, 1) + tickMark(E.x, E.y, B.x, B.y, 1) + tickMark(D.x, D.y, F.x, F.y, 2) + tickMark(F.x, F.y, C.x, C.y, 2);
  if (o.labels?.AD) out += g4side(A, D, o.labels.AD, cen, 15, false, 11.5);
  // perp 모드에선 수선 발 H 이름(바깥 18px)과 겹치지 않게 BC 라벨을 한 층 더 바깥에.
  if (o.labels?.BC) out += g4side(B, C, o.labels.BC, cen, o.perp ? 32 : 15, false, 11.5);
  if (o.labels?.EF) out += g4text(m2mid(E, F).x, m2mid(E, F).y - 8, o.labels.EF, 11.5, GEO.hlB);
  if (o.labels?.AE) out += g4side(A, E, o.labels.AE, cen, 14, false, 11.5);
  if (o.labels?.EB) out += g4side(E, B, o.labels.EB, cen, 14, false, 11.5);
  if (o.labels?.DF) out += g4side(D, F, o.labels.DF, cen, 14, false, 11.5);
  if (o.labels?.FC) out += g4side(F, C, o.labels.FC, cen, 14, false, 11.5);
  if (o.labels?.AB) out += g4side(A, B, o.labels.AB, cen, 27, false, 11.5);
  if (o.labels?.DC) out += g4side(D, C, o.labels.DC, cen, 27, false, 11.5);
  if (o.diag) {
    out += g4line(A, C, GEO.soft, 2, "5 5");
    const den = (C.x - A.x) * (F.y - E.y) - (C.y - A.y) * (F.x - E.x);
    const s = den === 0 ? 0.5 : ((E.x - A.x) * (F.y - E.y) - (E.y - A.y) * (F.x - E.x)) / den;
    const G = m2lerp(A, C, s);
    // G 이름은 EF 선 아래쪽 — EF 라벨(선 위)과 겹치지 않게.
    out += dot(G.x, G.y, GEO.hlC, 3.2) + ptLabel(G.x, G.y, o.gName ?? "G", 2, 17, GEO.hlC);
  }
  if (!noEF) {
    out += dot(E.x, E.y, GEO.pt, 3) + dot(F.x, F.y, GEO.pt, 3);
    out += ptLabel(E.x, E.y, nE, -13, 3) + ptLabel(F.x, F.y, nF, 14, 3);
  }
  out += ptLabel(A.x, A.y, nA, -8, -8) + ptLabel(D.x, D.y, nD, 8, -8) + ptLabel(B.x, B.y, nB, -8, 16) + ptLabel(C.x, C.y, nC, 8, 16);
  return svg(`0 0 360 ${H}`, "사다리꼴과 두 변 위의 점을 이은 선을 나타낸 그림", out);
}

/** 삼각형의 중점연결 — M·N이 "실제 중점" 좌표라 MN∥BC·MN=½BC가 구조적으로 성립한다.
 *  mode "MN": AB·AC 중점 연결(기본) · "three": 세 중점 삼각형(가운데 채움).
 *  항등식: MN 라벨 = BC 라벨의 절반 · ∠AMN = ∠B(동위각) — marks로 표기.
 *  ticks: AM=MB 1틱·AN=NC 2틱(기본 true). */
export function m2ExamMidsegFig(o: {
  B?: number;
  C?: number;
  mode?: "MN" | "three";
  labels?: Partial<Record<"MN" | "BC" | "AM" | "MB" | "AN" | "NC" | "AB" | "AC" | "MD" | "ND", string>>;
  marks?: Array<{ at: string; label: string }>;
  ticks?: boolean;
  paraMarks?: boolean;
  names?: string[];
}): string {
  const { A, B, C, H } = g4tri(o.B ?? 62, o.C ?? 48, 232);
  const M = m2mid(A, B);
  const N = m2mid(A, C);
  const Dm = m2mid(B, C);
  const cen = g4cen([A, B, C]);
  const nm = o.names ?? (o.mode === "three" ? ["A", "B", "C", "M", "N", "D"] : ["A", "B", "C", "M", "N"]);
  let out = g4poly([A, B, C]);
  if (o.mode === "three") {
    out += g4poly([M, N, Dm], F4B, 2.2);
  } else {
    out += g4line(M, N, GEO.hlB, 2.5);
  }
  if (o.paraMarks) out += m2chev(M, N, 1, GEO.hlB) + m2chev(B, C, 1, GEO.soft);
  if (o.ticks !== false) {
    out += tickMark(A.x, A.y, M.x, M.y, 1) + tickMark(M.x, M.y, B.x, B.y, 1);
    out += tickMark(A.x, A.y, N.x, N.y, 2) + tickMark(N.x, N.y, C.x, C.y, 2);
    if (o.mode === "three") out += tickMark(B.x, B.y, Dm.x, Dm.y, 3) + tickMark(Dm.x, Dm.y, C.x, C.y, 3);
  }
  if (o.labels?.MN) out += g4text(m2mid(M, N).x, m2mid(M, N).y - 8, o.labels.MN, 11.5, GEO.hlB);
  if (o.labels?.BC) out += g4side(B, C, o.labels.BC, cen, o.mode === "three" ? 30 : 15, false, 11.5);
  if (o.labels?.AM) out += g4side(A, M, o.labels.AM, cen, 14, false, 11.5);
  if (o.labels?.MB) out += g4side(M, B, o.labels.MB, cen, 14, false, 11.5);
  if (o.labels?.AN) out += g4side(A, N, o.labels.AN, cen, 14, false, 11.5);
  if (o.labels?.NC) out += g4side(N, C, o.labels.NC, cen, 14, false, 11.5);
  if (o.labels?.AB) out += g4side(A, B, o.labels.AB, cen, 27, false, 11.5);
  if (o.labels?.AC) out += g4side(A, C, o.labels.AC, cen, 27, false, 11.5);
  if (o.mode === "three" && o.labels?.MD) out += g4text(m2mid(M, Dm).x - 6, m2mid(M, Dm).y + 14, o.labels.MD, 11.5, GEO.ink);
  if (o.mode === "three" && o.labels?.ND) out += g4text(m2mid(N, Dm).x + 6, m2mid(N, Dm).y + 14, o.labels.ND, 11.5, GEO.ink);
  const pts: Record<string, GPt> = { A, B, C, M, N, D: Dm };
  if (o.marks?.length) out += g4marks(pts, o.marks, { A: ["B", "C"], B: ["A", "C"], C: ["A", "B"], M: ["A", "N"], N: ["A", "M"], D: ["B", "C"] });
  out += dot(M.x, M.y, GEO.pt, 3) + dot(N.x, N.y, GEO.pt, 3);
  if (o.mode === "three") out += dot(Dm.x, Dm.y, GEO.pt, 3) + ptLabel(Dm.x, Dm.y, nm[5], 14, 17);
  out += ptLabel(A.x, A.y, nm[0], 0, -10) + ptLabel(B.x, B.y, nm[1], -8, 16) + ptLabel(C.x, C.y, nm[2], 8, 16);
  out += ptLabel(M.x, M.y, nm[3], -13, 2) + ptLabel(N.x, N.y, nm[4], 14, 2);
  return svg(`0 0 360 ${H}`, "삼각형과 변의 중점을 이은 선을 나타낸 그림", out);
}

/** 사각형 네 변의 중점을 이은 사각형(바리뇽) — P·Q·R·S가 전부 실제 중점이라 PQRS는
 *  자동으로 평행사변형이 된다. 항등식: PQ=SR=½AC, QR=PS=½BD(중점연결정리 두 번).
 *  preset 0~2: 서로 다른 볼록 일반 사각형(0 기본 · 1 넓적 · 2 오목하지 않게 비틀림 큰).
 *  diag: 대각선 표시("AC"|"BD"|"both"), shade: PQRS 채움. */
export function m2ExamMidQuadFig(o: {
  preset?: 0 | 1 | 2;
  diag?: "AC" | "BD" | "both";
  labels?: Partial<Record<"AC" | "BD" | "PQ" | "QR" | "RS" | "SP", string>>;
  ticks?: boolean;
  shade?: boolean;
  names?: [string, string, string, string];
  midNames?: [string, string, string, string];
}): string {
  const presets: GPt[][] = [
    [{ x: 96, y: 46 }, { x: 34, y: 168 }, { x: 250, y: 196 }, { x: 306, y: 78 }],
    [{ x: 76, y: 56 }, { x: 44, y: 176 }, { x: 300, y: 186 }, { x: 282, y: 42 }],
    [{ x: 132, y: 38 }, { x: 36, y: 150 }, { x: 210, y: 200 }, { x: 316, y: 96 }],
  ];
  const [A, B, C, D] = presets[o.preset ?? 0];
  const P = m2mid(A, B);
  const Q = m2mid(B, C);
  const R = m2mid(C, D);
  const S = m2mid(D, A);
  const cen = g4cen([A, B, C, D]);
  const [nA, nB, nC, nD] = o.names ?? ["A", "B", "C", "D"];
  const [nP, nQ, nR, nS] = o.midNames ?? ["P", "Q", "R", "S"];
  let out = g4poly([A, B, C, D]);
  if (o.diag === "AC" || o.diag === "both") out += g4line(A, C, GEO.soft, 2, "5 5");
  if (o.diag === "BD" || o.diag === "both") out += g4line(B, D, GEO.soft, 2, "5 5");
  out += o.shade ? g4poly([P, Q, R, S], "#DDEBFF", 2.4) : g4poly([P, Q, R, S], "none", 2.4);
  if (o.ticks !== false) {
    out += tickMark(A.x, A.y, P.x, P.y, 1) + tickMark(P.x, P.y, B.x, B.y, 1);
    out += tickMark(B.x, B.y, Q.x, Q.y, 2) + tickMark(Q.x, Q.y, C.x, C.y, 2);
    out += tickMark(C.x, C.y, R.x, R.y, 1) + tickMark(R.x, R.y, D.x, D.y, 1);
    out += tickMark(D.x, D.y, S.x, S.y, 2) + tickMark(S.x, S.y, A.x, A.y, 2);
  }
  if (o.labels?.AC) out += g4side(A, C, o.labels.AC, cen, 13, true, 11.5);
  if (o.labels?.BD) out += g4side(B, D, o.labels.BD, cen, 13, true, 11.5);
  const mcen = g4cen([P, Q, R, S]);
  if (o.labels?.PQ) out += g4side(P, Q, o.labels.PQ, mcen, 12, true, 11);
  if (o.labels?.QR) out += g4side(Q, R, o.labels.QR, mcen, 12, true, 11);
  if (o.labels?.RS) out += g4side(R, S, o.labels.RS, mcen, 12, true, 11);
  if (o.labels?.SP) out += g4side(S, P, o.labels.SP, mcen, 12, true, 11);
  for (const [p, nm2] of [[P, nP], [Q, nQ], [R, nR], [S, nS]] as Array<[GPt, string]>) {
    out += dot(p.x, p.y, GEO.hlB, 3.2) + m2ptOut(p, cen, nm2, 15);
  }
  out += m2ptOut(A, cen, nA, 14) + m2ptOut(B, cen, nB, 14) + m2ptOut(C, cen, nC, 14) + m2ptOut(D, cen, nD, 14);
  return svg("0 0 360 240", "사각형과 네 변의 중점을 이은 사각형을 나타낸 그림", out);
}

/** 삼각형의 무게중심 — D·E·F가 실제 중점, G=(A+B+C)/3(중선 교점과 동치)라 AG:GD=2:1이
 *  구조적으로 성립한다. 항등식: AG=⅔AD·GD=⅓AD(BE·CF도 동일), ef 절단선은 t=⅔ 지점이라
 *  EF∥BC·G 통과가 실좌표로 참, g2(△GBC의 무게중심 G')=(G+B+C)/3이라 GG'=⅔GD.
 *  medians: 그릴 중선 목록(D=BC 중점·E=CA 중점·F=AB 중점). segLabels의 on은 부분 선분 키.
 *  shade: "GBC"류 세 글자 삼각형 채움(넓이 비 문항 — 6조각은 ["GBD","GDC"]처럼 조합).
 *  rightAt "A": ∠A 직각 꺾쇠(B+C=90으로 저작 — 빗변 중선 융합용). */
export function m2ExamCentroidFig(o: {
  B?: number;
  C?: number;
  medians?: Array<"AD" | "BE" | "CF">;
  showG?: boolean;
  gName?: string;
  segLabels?: Array<{ on: "AG" | "GD" | "AD" | "BG" | "GE" | "BE" | "CG" | "GF" | "CF" | "BD" | "DC" | "BC" | "EF" | "GG2"; label: string }>;
  shade?: string[];
  ef?: boolean;
  efNames?: [string, string];
  g2?: boolean;
  g2Name?: string;
  rightAt?: "A";
  ticks?: Array<"BD" | "CE" | "AF">;
  marks?: Array<{ at: string; label: string }>;
  names?: [string, string, string];
}): string {
  const { A, B, C, H } = g4tri(o.B ?? 58, o.C ?? 44, 240);
  const D = m2mid(B, C);
  const E = m2mid(C, A);
  const F = m2mid(A, B);
  const G = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
  const G2 = { x: (G.x + B.x + C.x) / 3, y: (G.y + B.y + C.y) / 3 };
  const cen = g4cen([A, B, C]);
  const meds = o.medians ?? ["AD"];
  const [nA, nB, nC] = o.names ?? ["A", "B", "C"];
  const pts: Record<string, GPt> = { A, B, C, D, E, F, G };
  let out = g4poly([A, B, C]);
  for (const key of o.shade ?? []) {
    const tri = [...key].map((ch) => pts[ch]).filter(Boolean);
    if (tri.length === 3) out += `<path d="M${tri[0].x.toFixed(1)} ${tri[0].y.toFixed(1)} L${tri[1].x.toFixed(1)} ${tri[1].y.toFixed(1)} L${tri[2].x.toFixed(1)} ${tri[2].y.toFixed(1)} Z" fill="${GEO.hlA}" opacity=".2"/>`;
  }
  const medDef: Record<string, [GPt, GPt, string]> = { AD: [A, D, "D"], BE: [B, E, "E"], CF: [C, F, "F"] };
  for (const m of meds) {
    const [from, to, nm2] = medDef[m];
    out += g4line(from, to, GEO.hlB, 2.4);
    out += dot(to.x, to.y, GEO.pt, 3) + m2ptOut(to, cen, nm2, 15);
  }
  if (o.ticks) {
    if (o.ticks.includes("BD")) out += tickMark(B.x, B.y, D.x, D.y, 1) + tickMark(D.x, D.y, C.x, C.y, 1);
    if (o.ticks.includes("CE")) out += tickMark(C.x, C.y, E.x, E.y, 2) + tickMark(E.x, E.y, A.x, A.y, 2);
    if (o.ticks.includes("AF")) out += tickMark(A.x, A.y, F.x, F.y, 3) + tickMark(F.x, F.y, B.x, B.y, 3);
  }
  if (o.ef) {
    const Ee = m2lerp(A, B, 2 / 3);
    const Fe = m2lerp(A, C, 2 / 3);
    const [nEe, nFe] = o.efNames ?? ["E", "F"];
    // BC 꺾쇠는 중점(=D 자리)을 피해 오른쪽 3/4 지점 부근에 찍는다.
    out += g4line(Ee, Fe, GEO.hlD, 2.4) + m2chev(Ee, Fe, 1, GEO.hlD) + m2chev(m2lerp(B, C, 0.55), C, 1, GEO.soft);
    out += dot(Ee.x, Ee.y, GEO.pt, 3) + dot(Fe.x, Fe.y, GEO.pt, 3);
    out += ptLabel(Ee.x, Ee.y, nEe, -13, 2) + ptLabel(Fe.x, Fe.y, nFe, 14, 2);
    pts.E = Ee;
    pts.F = Fe;
  }
  if (o.g2) {
    out += dot(G2.x, G2.y, GEO.hlC, 3.4) + ptLabel(G2.x, G2.y, o.g2Name ?? "G'", 13, 6, GEO.hlC);
  }
  if (o.rightAt === "A") out += g4right(A, B, C);
  const segDef: Record<string, [GPt, GPt]> = {
    AG: [A, G], GD: [G, D], AD: [A, D], BG: [B, G], GE: [G, E], BE: [B, E],
    CG: [C, G], GF: [G, F], CF: [C, F], BD: [B, D], DC: [D, C], BC: [B, C], GG2: [G, G2],
  };
  for (const sl of o.segLabels ?? []) {
    const seg = segDef[sl.on];
    if (!seg) continue;
    // 밑변 계열 라벨은 D 이름(바깥 15px)과 겹치지 않게 한 층 더 바깥(30px)에 둔다.
    if (sl.on === "BD" || sl.on === "DC" || sl.on === "BC") out += g4side(seg[0], seg[1], sl.label, cen, 30, false, 11.5);
    else if (sl.on === "AD" || sl.on === "BE" || sl.on === "CF") {
      // 중선 "전체" 라벨은 중점이 아니라 위쪽 30% 지점 — G 이름·점(⅔ 지점)과 겹치지 않는다.
      // 간격 4→12px: 라벨이 중선 위에 걸리던 파일럿 눈검수(29번) 반영.
      const at = m2lerp(seg[0], seg[1], 0.3);
      const away = { x: at.x - cen.x, y: at.y - cen.y };
      const len = Math.hypot(away.x, away.y) || 1;
      out += g4text(at.x + (away.x / len) * 12 - 15, at.y + (away.y / len) * 12 + 4, sl.label, 11.5, GEO.ink, "end");
    } else out += g4side(seg[0], seg[1], sl.label, cen, 15, true, 11.5);
  }
  if (o.marks?.length) out += g4marks(pts, o.marks, { A: ["B", "C"], B: ["A", "C"], C: ["A", "B"], G: ["B", "C"], D: ["B", "A"], E: ["C", "A"], F: ["A", "B"] });
  if (o.showG !== false) out += dot(G.x, G.y, GEO.hlC, 3.6) + ptLabel(G.x, G.y, o.gName ?? "G", 0, -11, GEO.hlC);
  out += ptLabel(A.x, A.y, nA, 0, -10) + ptLabel(B.x, B.y, nB, -8, 16) + ptLabel(C.x, C.y, nC, 8, 16);
  return svg(`0 0 360 ${H}`, "삼각형과 중선, 그 교점을 나타낸 그림", out);
}

/** 직각삼각형 세 변 위의 정사각형 — a·b(직각변 논리 길이)로 삼각형·정사각형 셋을 전부
 *  실비 렌더한다(빗변 정사각형은 회전 좌표). 항등식: 넓이 라벨 = 변 논리값의 제곱
 *  (areas=[a² 자리, b² 자리, c² 자리] — ㉠ 가림 가능. c²=a²+b²이니 셋 중 인쇄값끼리 합 관계 검산).
 *  직각은 C(좌하) 고정, A 위·B 오른쪽. */
export function m2ExamPythaSquaresFig(o: {
  a: number;
  b: number;
  areas?: [string | null, string | null, string | null];
  sideLabels?: [string | null, string | null, string | null];
  names?: [string, string, string];
}): string {
  const c = Math.hypot(o.a, o.b);
  const spanX = o.b + o.a + ((o.b * o.b) / (c * c)) * o.a;
  const spanYtop = o.b + ((o.a + (o.a * o.a) / c) * o.b) / c;
  const unit = Math.min(196 / spanX, 190 / (spanYtop + o.a));
  const Cp = { x: 0, y: 0 };
  const Bp = { x: o.a * unit, y: 0 };
  const Ap = { x: 0, y: o.b * unit };
  // 정사각형 노멀은 항상 "제3의 꼭짓점 반대쪽"(삼각형 바깥)으로 자동 판정한다.
  const sq = (p: GPt, q: GPt, third: GPt): GPt[] => {
    let nx = q.y - p.y;
    let ny = -(q.x - p.x);
    if ((third.x - p.x) * nx + (third.y - p.y) * ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    return [p, q, { x: q.x + nx, y: q.y + ny }, { x: p.x + nx, y: p.y + ny }];
  };
  const sqA = sq(Bp, Cp, Ap);
  const sqB = sq(Cp, Ap, Bp);
  const sqC = sq(Ap, Bp, Cp);
  const { g, H } = m2fit([[Ap, Bp, Cp], sqA, sqB, sqC], 300, 236, 360, 34);
  const [tri, sA, sB, sC] = g;
  let out = g4poly(sA, "#FFF4E0", 2.3) + g4poly(sB, "#E4F2FF", 2.3) + g4poly(sC, "#E9FBEE", 2.3);
  out += g4poly(tri, F4, 2.5) + g4right(tri[2], tri[0], tri[1], 9);
  const mid4 = (ps: GPt[]): GPt => ({ x: ps.reduce((s2, p) => s2 + p.x, 0) / 4, y: ps.reduce((s2, p) => s2 + p.y, 0) / 4 });
  if (o.areas?.[0]) out += g4text(mid4(sA).x, mid4(sA).y + 5, o.areas[0], 13, "#B4690E");
  if (o.areas?.[1]) out += g4text(mid4(sB).x, mid4(sB).y + 5, o.areas[1], 13, "#1864AB");
  if (o.areas?.[2]) out += g4text(mid4(sC).x, mid4(sC).y + 5, o.areas[2], 13, "#2B8A3E");
  const cenT = g4cen(tri);
  if (o.sideLabels?.[0]) out += g4side(tri[1], tri[2], o.sideLabels[0] ?? "", cenT, 13, true, 11);
  if (o.sideLabels?.[1]) out += g4side(tri[2], tri[0], o.sideLabels[1] ?? "", cenT, 13, true, 11);
  if (o.sideLabels?.[2]) out += g4side(tri[0], tri[1], o.sideLabels[2] ?? "", cenT, 13, true, 11);
  const nm = o.names ?? ["A", "B", "C"];
  out += ptLabel(tri[0].x, tri[0].y, nm[0], -12, -4) + ptLabel(tri[1].x, tri[1].y, nm[1], 12, 12) + ptLabel(tri[2].x, tri[2].y, nm[2], -12, 12);
  return svg(`0 0 360 ${H}`, "직각삼각형의 세 변을 한 변으로 하는 세 정사각형을 나타낸 그림", out);
}

/** 직각삼각형 범용 — a(밑변)·b(세로) 논리 길이로 실비 렌더. 직각은 B(좌하) 고정,
 *  orient "right"면 좌우 반전(직각이 우하). labels: {a: 밑변, b: 세로, c: 빗변}.
 *  dual을 주면 빗변 AC에 직각으로 붙는 둘째 삼각형(∠ACD=90°)을 실좌표로 추가 —
 *  항등식: AD²=a²+b²+d²(연쇄 피타) — (a,b,d)는 합이 완전제곱인 조합만 저작
 *  ((4,12,3)→13은 교과서 직카피 금지: (2,3,6)→7·(1,4,8)→9·(4,4,7)→9·(2,5,14)→15·
 *  (6,6,7)→11·(8,9,12)→17·(2,10,11)→15·(12,15,16)→25 등). */
export function m2ExamRightTriFig(o: {
  a: number;
  b: number;
  labels?: Partial<Record<"a" | "b" | "c", string>>;
  marks?: Array<{ at: "A" | "B" | "C"; label: string }>;
  names?: [string, string, string] | null;
  dual?: { d: number; dLabel?: string; hypLabel?: string; dName?: string };
}): string {
  const raw: GPt[][] = [[{ x: 0, y: o.b }, { x: 0, y: 0 }, { x: o.a, y: 0 }]];
  if (o.dual) {
    const Araw = { x: 0, y: o.b };
    const Craw = { x: o.a, y: 0 };
    const c = Math.hypot(o.a, o.b);
    let nx = (Craw.y - Araw.y) / c;
    let ny = -(Craw.x - Araw.x) / c;
    // D는 항상 오른쪽으로 펼친다 — 왼쪽 접힘은 AD가 AB와 겹쳐 보이는 시각 퇴화(파일럿 36번 검수).
    if (nx < 0) {
      nx = -nx;
      ny = -ny;
    }
    raw.push([Craw, { x: Craw.x + nx * o.dual.d, y: Craw.y + ny * o.dual.d }]);
  }
  const { g, H } = m2fit(raw, 250, 170, 360, 46);
  const [A, B, C] = g[0];
  const cen = g4cen([A, B, C]);
  let out = g4poly([A, B, C]) + g4right(B, A, C, 12);
  if (o.labels?.a) out += g4side(B, C, o.labels.a, cen, 15, false, 11.5);
  if (o.labels?.b) out += g4side(A, B, o.labels.b, cen, 15, false, 11.5);
  if (o.labels?.c) out += g4side(A, C, o.labels.c, cen, 15, false, 11.5);
  if (o.marks?.length) out += g4marks({ A, B, C }, o.marks, { A: ["B", "C"], B: ["A", "C"], C: ["A", "B"] });
  if (o.dual) {
    const D = g[1][1];
    const cen2 = g4cen([A, C, D]);
    out += g4poly([A, C, D], "none", 2.4) + g4right(C, A, D, 11);
    if (o.dual.dLabel) out += g4side(C, D, o.dual.dLabel, cen2, 14, false, 11.5);
    if (o.dual.hypLabel) out += g4side(A, D, o.dual.hypLabel, cen2, 15, false, 11.5);
    out += ptLabel(D.x, D.y, o.dual.dName ?? "D", 12, 4);
  }
  if (o.names !== null) {
    const nm = o.names ?? ["A", "B", "C"];
    out += ptLabel(A.x, A.y, nm[0], 0, -10) + ptLabel(B.x, B.y, nm[1], -10, 15) + ptLabel(C.x, C.y, nm[2], 10, 15);
  }
  return svg(`0 0 360 ${H}`, "직각삼각형 그림", out);
}

/** 모눈 위의 직각삼각형 — cols×rows 격자(칸 수 정확)에 격자점 삼각형을 얹는다.
 *  tri는 [열, 행](왼아래 원점) 세 점 — 직각변이 축과 나란한 배치로 저작(칸 세기 과제).
 *  hypSquare: 빗변 바깥쪽 기울어진 정사각형(꼭짓점 전부 격자점 — 회전 90° 벡터라 자동).
 *  areaLabel: 그 정사각형 중앙 라벨(㉠ 가림용). legLabels: 두 직각변 칸 수 라벨. */
export function m2ExamGridRightFig(o: {
  cols: number;
  rows: number;
  tri: [[number, number], [number, number], [number, number]];
  hypSquare?: boolean;
  areaLabel?: string;
  legLabels?: [string | null, string | null];
  unitNote?: string;
}): string {
  const cell = Math.min(30, 296 / o.cols, 190 / o.rows);
  const w = o.cols * cell;
  const h = o.rows * cell;
  const x0 = (360 - w) / 2;
  const H = Math.round(h) + 70;
  const y0 = H - 38 - h;
  const P = (c: number, r: number): GPt => ({ x: x0 + c * cell, y: y0 + h - r * cell });
  let out = "";
  for (let i = 0; i <= o.cols; i += 1) out += lineSvg(x0 + i * cell, y0, x0 + i * cell, y0 + h, "#DCE4EF", 1.2);
  for (let j = 0; j <= o.rows; j += 1) out += lineSvg(x0, y0 + j * cell, x0 + w, y0 + j * cell, "#DCE4EF", 1.2);
  const [t0, t1, t2] = o.tri.map(([c2, r2]) => P(c2, r2));
  if (o.hypSquare) {
    const legLens = [
      Math.hypot(t1.x - t0.x, t1.y - t0.y),
      Math.hypot(t2.x - t1.x, t2.y - t1.y),
      Math.hypot(t0.x - t2.x, t0.y - t2.y),
    ];
    const hi = legLens.indexOf(Math.max(...legLens));
    const [p, q] = [[t0, t1], [t1, t2], [t2, t0]][hi];
    const third = [t2, t0, t1][hi];
    let nx = q.y - p.y;
    let ny = -(q.x - p.x);
    if ((third.x - p.x) * nx + (third.y - p.y) * ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const sqPts = [p, q, { x: q.x + nx, y: q.y + ny }, { x: p.x + nx, y: p.y + ny }];
    out += g4poly(sqPts, "#FFF1DE", 2.3);
    if (o.areaLabel) {
      const m = { x: sqPts.reduce((s2, pp) => s2 + pp.x, 0) / 4, y: sqPts.reduce((s2, pp) => s2 + pp.y, 0) / 4 };
      out += g4text(m.x, m.y + 5, o.areaLabel, 13.5, "#B4690E");
    }
  }
  out += g4poly([t0, t1, t2], "rgba(54,79,199,.12)", 2.5);
  const cenT = g4cen([t0, t1, t2]);
  if (o.legLabels?.[0]) out += g4side(t0, t1, o.legLabels[0] ?? "", cenT, 14, false, 11.5);
  if (o.legLabels?.[1]) out += g4side(t1, t2, o.legLabels[1] ?? "", cenT, 14, false, 11.5);
  if (o.unitNote) out += g4text(x0 + w, y0 + h + 20, o.unitNote, 11, GEO.soft, "end");
  return svg(`0 0 360 ${H}`, "모눈 위에 그린 직각삼각형 그림", out);
}

/** 원뿔을 밑면에 평행하게 등분 절단한 그림(모선 n등분) — 절단 높이·반지름이 전부 실비라
 *  각 단면 반지름 비 = 1:2:…:n이 구조적으로 성립한다. 항등식: 위에서 k번째까지 닮음비 k/n,
 *  부피비 1³:2³:…:n³(조각은 차). names: 조각 라벨(위→아래), volLabels: 조각 옆 부피 라벨. */
export function m2ExamConeCutFig(o: {
  cuts: 2 | 3;
  names?: string[];
  volLabels?: Array<string | null>;
}): string {
  const cx = 180;
  const ty = 34;
  const R = 108;
  const Hh = 168;
  const by = ty + Hh;
  let out = "";
  out += `<ellipse cx="${cx}" cy="${by}" rx="${R}" ry="17" fill="none" stroke="${GEO.ink}" stroke-width="2.3" stroke-dasharray="6 5"/>`;
  out += `<path d="M${cx - R} ${by} A${R} 17 0 0 0 ${cx + R} ${by}" stroke="${GEO.ink}" stroke-width="2.5" fill="none"/>`;
  out += lineSvg(cx - R, by, cx, ty, GEO.ink, 2.5) + lineSvg(cx + R, by, cx, ty, GEO.ink, 2.5);
  for (let k = 1; k < o.cuts; k += 1) {
    const y = ty + (Hh * k) / o.cuts;
    const r = (R * k) / o.cuts;
    out += `<ellipse cx="${cx}" cy="${y}" rx="${r}" ry="${13 * (k / o.cuts) + 4}" fill="none" stroke="${GEO.hlB}" stroke-width="2.2" stroke-dasharray="7 5"/>`;
  }
  o.names?.forEach((nm, i) => {
    const yMid = ty + (Hh * (i + 0.55)) / o.cuts;
    out += g4text(cx, yMid + 4, nm, 13, GEO.ink);
  });
  o.volLabels?.forEach((lb, i) => {
    if (!lb) return;
    const yMid = ty + (Hh * (i + 0.55)) / o.cuts;
    const xr = cx + (R * (i + 0.72)) / o.cuts + 16;
    out += g4text(xr, yMid + 4, lb, 11.5, GEO.hlC, "start");
  });
  return svg(`0 0 360 ${by + 34}`, "원뿔을 밑면에 평행한 평면으로 자른 그림", out);
}

/** 닮은(또는 닮지 않은) 입체 쌍 — kind별 치수 배열을 실비로 나란히 렌더한다.
 *  cyl [r,h] · cone [r,h] · box [w,d,h] · sphere [r]. 닮음 쌍은 dims2 = dims1×k로 저작
 *  (반례 쌍은 비배수 치수). labels1/2는 dims 순서대로의 치수 라벨(null 생략). */
export function m2ExamSolidPairFig(o: {
  kind: "cyl" | "cone" | "box" | "sphere";
  dims1: number[];
  dims2: number[];
  labels1?: Array<string | null>;
  labels2?: Array<string | null>;
  names?: [string, string];
}): string {
  // 폭 계수: 도형별 렌더 폭(논리 단위) — 두 도형 합이 260px 안에 들어오게 unit을 제약해 잘림을 막는다.
  const wUnits = (dims: number[]): number => (o.kind === "box" ? dims[0] + dims[1] * 0.52 * 0.72 : dims[0] * 2);
  const hUnits = (dims: number[]): number =>
    o.kind === "box" ? dims[2] + dims[1] * 0.52 * 0.5 : o.kind === "sphere" ? dims[0] * 2 : dims[1];
  const maxDim = Math.max(...o.dims1, ...o.dims2);
  const unit = Math.min(
    30,
    128 / maxDim,
    228 / (wUnits(o.dims1) + wUnits(o.dims2)),
    138 / Math.max(hUnits(o.dims1), hUnits(o.dims2)),
  );
  const H = 236;
  const baseY = H - 54;
  const drawOne = (dims: number[], labels: Array<string | null> | undefined, cx: number): string => {
    let s = "";
    if (o.kind === "cyl") {
      const r = dims[0] * unit;
      const hh = dims[1] * unit;
      const ty = baseY - hh;
      s += `<ellipse cx="${cx}" cy="${baseY}" rx="${r}" ry="${Math.max(8, r * 0.24)}" fill="none" stroke="${GEO.ink}" stroke-width="2.2" stroke-dasharray="5 4"/>`;
      s += `<path d="M${cx - r} ${baseY} A${r} ${Math.max(8, r * 0.24)} 0 0 0 ${cx + r} ${baseY}" stroke="${GEO.ink}" stroke-width="2.4" fill="none"/>`;
      s += lineSvg(cx - r, ty, cx - r, baseY, GEO.ink, 2.4) + lineSvg(cx + r, ty, cx + r, baseY, GEO.ink, 2.4);
      s += `<ellipse cx="${cx}" cy="${ty}" rx="${r}" ry="${Math.max(8, r * 0.24)}" fill="none" stroke="${GEO.ink}" stroke-width="2.4"/>`;
      // 반지름 라벨은 윗면 타원 테를 넘겨 얹는다(테에 걸리던 파일럿 눈검수 5번 반영).
      if (labels?.[0]) s += lineSvg(cx, ty, cx + r, ty, GEO.hlC, 2) + dot(cx, ty, GEO.hlC, 2.6) + g4text(cx + r / 2, ty - Math.max(13, r * 0.24 + 8), labels[0], 11.5, GEO.hlC);
      if (labels?.[1]) s += g4text(cx + r + 10, baseY - hh / 2 + 4, labels[1], 11.5, GEO.ink, "start");
    } else if (o.kind === "cone") {
      const r = dims[0] * unit;
      const hh = dims[1] * unit;
      const ty = baseY - hh;
      s += `<ellipse cx="${cx}" cy="${baseY}" rx="${r}" ry="${Math.max(8, r * 0.24)}" fill="none" stroke="${GEO.ink}" stroke-width="2.2" stroke-dasharray="5 4"/>`;
      s += `<path d="M${cx - r} ${baseY} A${r} ${Math.max(8, r * 0.24)} 0 0 0 ${cx + r} ${baseY}" stroke="${GEO.ink}" stroke-width="2.4" fill="none"/>`;
      s += lineSvg(cx - r, baseY, cx, ty, GEO.ink, 2.4) + lineSvg(cx + r, baseY, cx, ty, GEO.ink, 2.4);
      if (labels?.[0]) s += lineSvg(cx, baseY, cx + r, baseY, GEO.hlC, 2) + dot(cx, baseY, GEO.hlC, 2.6) + g4text(cx + r / 2, baseY + 18, labels[0], 11.5, GEO.hlC);
      if (labels?.[1]) s += lineSvg(cx, ty, cx, baseY, GEO.soft, 1.8, "5 4") + g4text(cx - 8, baseY - hh / 2 + 4, labels[1], 11.5, GEO.ink, "end");
    } else if (o.kind === "sphere") {
      const r = dims[0] * unit;
      const cy = baseY - r;
      s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${GEO.ink}" stroke-width="2.4"/>`;
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${Math.max(7, r * 0.26)}" fill="none" stroke="${GEO.soft}" stroke-width="1.7" stroke-dasharray="5 4"/>`;
      if (labels?.[0]) s += lineSvg(cx, cy, cx + r, cy, GEO.hlC, 2) + dot(cx, cy, GEO.hlC, 2.8) + g4text(cx + r / 2, cy - 9, labels[0], 11.5, GEO.hlC);
    } else {
      const w = dims[0] * unit;
      const d = dims[1] * unit * 0.52;
      const hh = dims[2] * unit;
      const ox = d * 0.72;
      const oy = d * 0.5;
      const xL = cx - (w + ox) / 2;
      const yT = baseY - hh - oy;
      const Pf = (dx: number, dy: number): GPt => ({ x: xL + dx, y: yT + dy });
      s += g4line(Pf(0, oy), Pf(w, oy), GEO.ink, 2.3) + g4line(Pf(w, oy), Pf(w, oy + hh), GEO.ink, 2.3) + g4line(Pf(w, oy + hh), Pf(0, oy + hh), GEO.ink, 2.3) + g4line(Pf(0, oy + hh), Pf(0, oy), GEO.ink, 2.3);
      s += g4line(Pf(0, oy), Pf(ox, 0), GEO.ink, 2.1) + g4line(Pf(w, oy), Pf(w + ox, 0), GEO.ink, 2.1) + g4line(Pf(w + ox, 0), Pf(ox, 0), GEO.ink, 2.1);
      s += g4line(Pf(w + ox, 0), Pf(w + ox, hh - oy), GEO.ink, 2.1) + g4line(Pf(w + ox, hh - oy), Pf(w, oy + hh), GEO.ink, 2.1);
      s += g4line(Pf(ox, 0), Pf(ox, hh - oy), GEO.ink, 1.6, "5 4") + g4line(Pf(ox, hh - oy), Pf(0, oy + hh), GEO.ink, 1.6, "5 4") + g4line(Pf(ox, hh - oy), Pf(w + ox, hh - oy), GEO.ink, 1.6, "5 4");
      if (labels?.[0]) s += g4text(xL + w / 2, yT + oy + hh + 16, labels[0], 11.5, GEO.ink);
      if (labels?.[1]) s += g4text(xL + w + ox / 2 + 10, yT + oy + hh - oy / 2 + 8, labels[1], 11.5, GEO.ink, "start");
      if (labels?.[2]) s += g4text(xL - 8, yT + oy + hh / 2, labels[2], 11.5, GEO.ink, "end");
    }
    return s;
  };
  const w1 = wUnits(o.dims1) * unit;
  const w2 = wUnits(o.dims2) * unit;
  const cx1 = 26 + w1 / 2;
  // 오른쪽 도형 옆 높이 라벨("9 cm")이 뷰박스를 넘지 않게 우측 여백 44px 확보.
  const cx2 = 316 - w2 / 2;
  let out = drawOne(o.dims1, o.labels1, cx1) + drawOne(o.dims2, o.labels2, cx2);
  const [n1, n2] = o.names ?? ["(가)", "(나)"];
  out += g4text(cx1, H - 16, n1, 12.5, GEO.soft) + g4text(cx2, H - 16, n2, 12.5, GEO.soft);
  return svg(`0 0 360 ${H}`, "두 입체도형을 나란히 놓은 그림", out);
}

/** 액자(테두리 있는 이중 직사각형) — 바깥 outW×outH, 테두리 폭 pad라 안쪽이
 *  (outW−2pad)×(outH−2pad)로 실비 렌더된다. 항상 닮음 반례 판정용(안팎 닮음 여부 계산 과제).
 *  항등식: 라벨 = 논리 치수 그대로(안쪽 치수도 실값 라벨 가능). */
export function m2ExamFrameFig(o: {
  outW: number;
  outH: number;
  pad: number;
  labels?: Partial<Record<"outW" | "outH" | "inW" | "inH" | "pad", string>>;
}): string {
  const unit = Math.min(56, 232 / o.outW, 160 / o.outH);
  const w = o.outW * unit;
  const h = o.outH * unit;
  const p = o.pad * unit;
  const x0 = (360 - w) / 2;
  const H = Math.round(h) + 76;
  const y0 = (H - h) / 2;
  let out = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#F3E8D8" stroke="${GEO.ink}" stroke-width="2.5"/>`;
  out += `<rect x="${x0 + p}" y="${y0 + p}" width="${w - 2 * p}" height="${h - 2 * p}" fill="#FDFEFF" stroke="${GEO.ink}" stroke-width="2.2"/>`;
  if (o.labels?.outW) out += g4text(x0 + w / 2, y0 - 10, o.labels.outW, 11.5, GEO.ink);
  if (o.labels?.outH) out += g4text(x0 - 10, y0 + h / 2 + 4, o.labels.outH, 11.5, GEO.ink, "end");
  if (o.labels?.inW) out += g4text(x0 + w / 2, y0 + p + 16, o.labels.inW, 11.5, GEO.hlB);
  if (o.labels?.inH) out += g4text(x0 + p + 8, y0 + h / 2 + 4, o.labels.inH, 11.5, GEO.hlB, "start");
  if (o.labels?.pad) {
    out += lineSvg(x0 + w - p, y0 + h / 2, x0 + w, y0 + h / 2, GEO.hlC, 2.2);
    out += g4text(x0 + w + 8, y0 + h / 2 + 4, o.labels.pad, 11.5, GEO.hlC, "start");
  }
  return svg(`0 0 360 ${H}`, "테두리가 있는 액자 모양 그림", out);
}

/** 부채꼴 쌍 — 중심각(실각)·반지름(실비)으로 두 부채꼴을 나란히 렌더.
 *  중심각이 같은 쌍(항상 닮음)·다른 쌍(닮음 아님)을 각도 인자로 정직하게 구분한다.
 *  항등식: 호와 각 라벨 = 넘긴 실값. */
export function m2ExamSectorPairFig(o: {
  deg1: number;
  deg2: number;
  r1: number;
  r2: number;
  labels1?: { deg?: string; r?: string };
  labels2?: { deg?: string; r?: string };
  names?: [string, string];
}): string {
  const unit = Math.min(30, 118 / Math.max(o.r1, o.r2));
  const H = 226;
  const drawSector = (cx: number, cy: number, r: number, deg: number, labels?: { deg?: string; r?: string }): string => {
    const a0 = 90 - deg / 2;
    const a1 = 90 + deg / 2;
    const p0 = polar(cx, cy, r, a0);
    const p1 = polar(cx, cy, r, a1);
    let s = `<path d="M${cx} ${cy} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} ${arcPath(cx, cy, r, a0, a1).replace(/^M[^A]*/, "")} Z" fill="#F3F7FF" stroke="${GEO.ink}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += angleArc(cx, cy, Math.min(22, r * 0.4), a0, a1, GEO.hlA, labels?.deg, { labelR: Math.min(38, r * 0.4 + 16), fontSize: 11.5 });
    if (labels?.r) {
      const m = m2mid({ x: cx, y: cy }, p1);
      s += g4text(m.x - 8, m.y + 2, labels.r, 11.5, GEO.ink, "end");
    }
    return s;
  };
  const cy = H - 58;
  let out = drawSector(102, cy, o.r1 * unit, o.deg1, o.labels1) + drawSector(266, cy, o.r2 * unit, o.deg2, o.labels2);
  const [n1, n2] = o.names ?? ["(가)", "(나)"];
  out += g4text(102, H - 18, n1, 12.5, GEO.soft) + g4text(266, H - 18, n2, 12.5, GEO.soft);
  return svg(`0 0 360 ${H}`, "두 부채꼴을 나란히 놓은 그림", out);
}

/* ══════════════ m2u6 확률 ══════════════
 * 실비 인자 원칙(200제 8호 ③의 확률판): 원판 칸은 확률값 그대로 중심각을 계산해 그리고(1/4 칸=90°),
 * 넓이 모델은 p×q 실비율 직사각형, 나뭇가지는 가지 수를 실제 경우와 정확히 일치시킨다.
 * 곱 결과·경우의 수 합계·확률값 같은 "구할 값"은 인쇄하지 않는다(㉠·?만). 순서쌍 표는
 * mathFigures2 pairGridFig를 pick=()=>false 빈 상태로 재사용한다(강조 칸은 세기 과제 유출 —
 * 200제 7호 ② 계보). aria는 중립 서술만(가짓수·확률·정오 낭독 금지). */

/** 나뭇가지 그림 시험판(파라미터형) — 첫 가지(first[i])마다 둘째 가지 second[i]가 벌어진다.
 *  레슨 branchFig와 달리 곱 결과 상자·잎 순서쌍 목록을 인쇄하지 않는다(세기·계산 과제 유출 방지).
 *  fold에 담긴 첫 가지 인덱스는 둘째 가지 대신 점선 상자(foldLabel, 기본 ㉠)로 접는다 —
 *  "일부를 나타낸 그림" 문항용. 가지 수는 실제 경우의 수와 일치시켜 저작한다(재사용 금지 반영은
 *  호출자가 second 배열로 직접). */
export function m2ExamBranchFig(o: {
  head1: string;
  head2: string;
  first: string[];
  second: string[][];
  fold?: number[];
  foldLabel?: string;
}): string {
  const rowH = 26;
  const gapG = 8;
  const counts = o.first.map((_, i) => (o.fold?.includes(i) ? 1 : Math.max(1, (o.second[i] ?? []).length)));
  const leafY: number[][] = [];
  let y = 40;
  counts.forEach((n) => {
    const ys: number[] = [];
    for (let k = 0; k < n; k++) {
      ys.push(y);
      y += rowH;
    }
    y += gapG;
    leafY.push(ys);
  });
  const H = y + 4;
  const mids = leafY.map((ys) => (ys[0] + ys[ys.length - 1]) / 2);
  const rootY = (mids[0] + mids[mids.length - 1]) / 2;
  let out = "";
  out += `<text x="106" y="20" text-anchor="middle" font-size="11" font-weight="900" fill="${ROSE}">${o.head1}</text>`;
  out += `<text x="226" y="20" text-anchor="middle" font-size="11" font-weight="900" fill="${NAVY}">${o.head2}</text>`;
  out += `<circle cx="34" cy="${rootY.toFixed(1)}" r="4.6" fill="${ROSE}" stroke="#B93A5E" stroke-width="1.3"/>`;
  o.first.forEach((f, i) => {
    const my = mids[i];
    out += `<path d="M39 ${rootY.toFixed(1)} C 58 ${rootY.toFixed(1)} 58 ${my.toFixed(1)} 78 ${my.toFixed(1)}" stroke="${ROSE}" stroke-width="1.7" fill="none"/>`;
    out += `<rect x="78" y="${(my - 12.5).toFixed(1)}" width="56" height="25" rx="8" fill="#FEF5F7" stroke="${ROSE}" stroke-width="1.4"/>`;
    out += `<text x="106" y="${(my + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="#B93A5E">${f}</text>`;
    if (o.fold?.includes(i)) {
      const ly = leafY[i][0];
      out += `<path d="M134 ${my.toFixed(1)} C 156 ${my.toFixed(1)} 156 ${ly} 178 ${ly}" stroke="${FAINT}" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>`;
      out += `<rect x="178" y="${ly - 12.5}" width="96" height="25" rx="8" fill="#FFFFFF" stroke="${FAINT}" stroke-width="1.4" stroke-dasharray="5 4"/>`;
      out += `<text x="226" y="${ly + 4}" text-anchor="middle" font-size="11.5" font-weight="900" fill="${NAVY}">${o.foldLabel ?? "㉠"}</text>`;
    } else {
      (o.second[i] ?? []).forEach((s, k) => {
        const ly = leafY[i][k];
        out += `<path d="M134 ${my.toFixed(1)} C 156 ${my.toFixed(1)} 156 ${ly} 178 ${ly}" stroke="${NAVY}" stroke-width="1.5" fill="none"/>`;
        out += `<rect x="178" y="${ly - 12}" width="56" height="24" rx="8" fill="#F1F5FF" stroke="${NAVY}" stroke-width="1.3"/>`;
        out += `<text x="206" y="${ly + 4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${NAVY}">${s}</text>`;
      });
    }
  });
  return svg(`0 0 320 ${H}`, "나뭇가지 그림", out);
}

/** 원판 시험판(파라미터형) — 각 칸을 deg(중심각)로 실각 렌더한다. slices의 deg 합이 360인지
 *  저작 단계에서 검산할 것(확률 1/4 칸 = 90°). 칸 안에는 라벨만 인쇄(칸 수·확률·등분 수 미인쇄) —
 *  "칸 수가 아니라 중심각(넓이) 비율" 함정 문항은 넓은 칸·좁은 칸이 실각으로 그려져야 성립한다.
 *  균등 등분 원판은 mathFigures2 spinnerFig 재사용이 1순위(이건 불균등·라벨 자유형). */
export function m2ExamSpinnerFig(o: { slices: Array<{ deg: number; label: string; win?: boolean }>; startDeg?: number }): string {
  const CX = 150;
  const CY = 106;
  const R = 82;
  let a = o.startDeg ?? -90;
  let out = `<ellipse cx="${CX}" cy="${CY + R + 10}" rx="70" ry="5" fill="#2A3A5E" opacity=".07"/>`;
  for (const sl of o.slices) {
    const a0 = (a * Math.PI) / 180;
    const a1 = ((a + sl.deg) * Math.PI) / 180;
    const x0 = CX + R * Math.cos(a0);
    const y0 = CY + R * Math.sin(a0);
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY + R * Math.sin(a1);
    const large = sl.deg > 180 ? 1 : 0;
    out += `<path d="M${CX} ${CY} L${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${sl.win ? "#F9D6E0" : "#FFFFFF"}" stroke="${sl.win ? ROSE : "#B9C2D2"}" stroke-width="1.6"/>`;
    const am = ((a + sl.deg / 2) * Math.PI) / 180;
    const lr = R * 0.62;
    out += `<text x="${(CX + lr * Math.cos(am)).toFixed(1)}" y="${(CY + lr * Math.sin(am) + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="${sl.win ? "#B93A5E" : INK}">${sl.label}</text>`;
    a += sl.deg;
  }
  out += `<circle cx="${CX}" cy="${CY}" r="7" fill="#FFFFFF" stroke="${INK}" stroke-width="1.8"/>`;
  out += `<path d="M${CX} ${CY - R - 8} l-7 -11 h14 z" fill="${INK}"/>`;
  return svg("0 0 300 208", "부채꼴 칸으로 나뉜 원판 그림", out);
}

/** 넓이 모델 시험판(파라미터형) — 가로를 pd등분해 pn만큼(사건 A 세로 띠), 세로를 qd등분해
 *  qn만큼(사건 B 가로 띠), 겹침은 진한 칸. 레슨 areaModelFig와 달리 겹침 칸수/전체 칸수(=정답
 *  분수)를 인쇄하지 않는다. mark를 주면 겹침 중앙에 그 기호만. aLabel·bLabel은 호출자 문자열
 *  그대로(확률값을 조건으로 보여줄지 여부도 호출자 몫, bLabel은 8자 이내 권장 — 왼쪽 여백 66px). */
export function m2ExamAreaFig(o: { pn: number; pd: number; qn: number; qd: number; aLabel: string; bLabel: string; mark?: string }): string {
  const S = 150;
  const X0 = 76;
  const Y0 = 26;
  const cw = S / o.pd;
  const rh = S / o.qd;
  let out = `<rect x="${X0}" y="${Y0}" width="${S}" height="${S}" fill="#FFFFFF" stroke="#B9C2D2" stroke-width="1.6"/>`;
  out += `<rect x="${X0}" y="${Y0}" width="${(cw * o.pn).toFixed(1)}" height="${S}" fill="#F9D6E0" opacity=".85"/>`;
  out += `<rect x="${X0}" y="${(Y0 + S - rh * o.qn).toFixed(1)}" width="${S}" height="${(rh * o.qn).toFixed(1)}" fill="#DBE6FB" opacity=".8"/>`;
  out += `<rect x="${X0}" y="${(Y0 + S - rh * o.qn).toFixed(1)}" width="${(cw * o.pn).toFixed(1)}" height="${(rh * o.qn).toFixed(1)}" fill="${ROSE}" opacity=".72"/>`;
  for (let i = 1; i < o.pd; i++) out += `<line x1="${(X0 + i * cw).toFixed(1)}" y1="${Y0}" x2="${(X0 + i * cw).toFixed(1)}" y2="${Y0 + S}" stroke="#C9D2E0" stroke-width="1"/>`;
  for (let j = 1; j < o.qd; j++) out += `<line x1="${X0}" y1="${(Y0 + j * rh).toFixed(1)}" x2="${X0 + S}" y2="${(Y0 + j * rh).toFixed(1)}" stroke="#C9D2E0" stroke-width="1"/>`;
  out += `<text x="${(X0 + (cw * o.pn) / 2).toFixed(1)}" y="${Y0 + S + 20}" text-anchor="middle" font-size="11" font-weight="900" fill="#B93A5E">${o.aLabel}</text>`;
  out += `<text x="${X0 - 10}" y="${(Y0 + S - (rh * o.qn) / 2 + 4).toFixed(1)}" text-anchor="end" font-size="11" font-weight="900" fill="${NAVY}">${o.bLabel}</text>`;
  if (o.mark)
    out += `<text x="${(X0 + (cw * o.pn) / 2).toFixed(1)}" y="${(Y0 + S - (rh * o.qn) / 2 + 5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="900" fill="#8F1D3D">${o.mark}</text>`;
  return svg(`0 0 300 ${Y0 + S + 34}`, "가로세로 띠가 겹치는 정사각형 넓이 모델", out);
}

/** 갈림길 그림(파라미터형) — 지점(stops) 사이 구간마다 counts[i]개의 길 곡선을 그린다
 *  (실비 원칙 — 길 수 정확, 구간당 4개 이하). 길 개수·곱 결과는 텍스트로 인쇄하지 않는다.
 *  stops 2개 = 한 구간, 3개 = 두 구간(경유 세기 문항). */
export function m2ExamRoadsFig(o: { stops: string[]; counts: number[] }): string {
  const H = 168;
  const cy = 84;
  const xs = o.stops.length === 2 ? [58, 262] : [40, 160, 280];
  let out = "";
  o.counts.forEach((n, seg) => {
    const xa = xs[seg] + 26;
    const xb = xs[seg + 1] - 26;
    for (let k = 0; k < n; k++) {
      const off = (k - (n - 1) / 2) * 30;
      out += `<path d="M${xa} ${cy} C ${xa + 34} ${cy + off * 1.5} ${xb - 34} ${cy + off * 1.5} ${xb} ${cy}" stroke="${seg === 0 ? ROSE : NAVY}" stroke-width="2" fill="none" opacity=".85"/>`;
    }
  });
  o.stops.forEach((s, i) => {
    out += `<circle cx="${xs[i]}" cy="${cy}" r="21" fill="#FFFFFF" stroke="${INK}" stroke-width="1.7"/>`;
    out += `<text x="${xs[i]}" y="${cy + 4}" text-anchor="middle" font-size="10.5" font-weight="900" fill="${INK}">${s}</text>`;
  });
  return svg(`0 0 320 ${H}`, "지점 사이의 길을 나타낸 그림", out);
}
