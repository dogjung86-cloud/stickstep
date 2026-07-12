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
 * cols: 헤더 행(예 ["기록(회)", "학생 수(명)", "상대도수"]), rows: 셀 문자열 행렬.
 * A~E 한 글자 셀은 빈칸(미지수)으로 간주해 네이비 강조. "합계" 행은 위 경계선을 굵게.
 * colw: 열 폭 비율(합 100) — 생략 시 첫 열 40, 나머지 균등. */
export function mExamTableFig(cols: string[], rows: string[][], opts: { title?: string; colw?: number[] } = {}): string {
  const W = 300;
  const X0 = 10;
  const TW = W - 20;
  const nc = cols.length;
  const colw = opts.colw ?? [40, ...Array.from({ length: nc - 1 }, () => 60 / (nc - 1))];
  const xs: number[] = [X0];
  for (const w of colw) xs.push(xs[xs.length - 1] + (w / 100) * TW);
  const cx = (c: number): number => (xs[c] + xs[c + 1]) / 2;
  const titleH = opts.title ? 22 : 0;
  const headH = 26;
  const rowH = 24;
  const H = titleH + headH + rows.length * rowH + 14;
  let out = "";
  if (opts.title) out += `<text x="150" y="16" text-anchor="middle" font-size="11.5" font-weight="900" fill="${INK}">${opts.title}</text>`;
  const gy0 = titleH + 6;
  out += `<rect x="${X0}" y="${gy0}" width="${TW}" height="${headH}" rx="0" fill="#EEF1FB"/>`;
  cols.forEach((c, i) => {
    out += `<text x="${cx(i)}" y="${gy0 + 17}" text-anchor="middle" font-size="10" font-weight="800" fill="${INK}">${c}</text>`;
  });
  rows.forEach((row, r) => {
    const y = gy0 + headH + r * rowH;
    const isTotal = row[0].includes("합계");
    if (r % 2 === 1 && !isTotal) out += `<rect x="${X0}" y="${y}" width="${TW}" height="${rowH}" fill="#F8FAFC"/>`;
    if (isTotal) out += `<line x1="${X0}" y1="${y}" x2="${X0 + TW}" y2="${y}" stroke="${INK}" stroke-width="1.6"/>`;
    row.forEach((cell, c) => {
      const blank = /^[A-E]$/.test(cell);
      out += `<text x="${cx(c)}" y="${y + 16}" text-anchor="middle" font-size="10.5" font-weight="${blank || isTotal ? 900 : 700}" fill="${blank ? NAVY : INK}">${cell}</text>`;
    });
  });
  const gy1 = gy0 + headH + rows.length * rowH;
  out += `<rect x="${X0}" y="${gy0}" width="${TW}" height="${gy1 - gy0}" stroke="${LINE}" stroke-width="1.4"/>`;
  for (let c = 1; c < nc; c++) out += `<line x1="${xs[c]}" y1="${gy0}" x2="${xs[c]}" y2="${gy1}" stroke="${LINE}" stroke-width="1.2"/>`;
  out += `<line x1="${X0}" y1="${gy0 + headH}" x2="${X0 + TW}" y2="${gy0 + headH}" stroke="${LINE}" stroke-width="1.2"/>`;
  return svg(`0 0 ${W} ${H}`, "통계 표", out);
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
