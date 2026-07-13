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
