// 일식과 월식 랩(u7l6)의 공용 기하와 그림 조각. 네 랩(alignLab, solarWhereLab, solarSideLab, lunarLab)이 함께 쓴다.
// 무대는 모두 "북극 위에서 내려다본 모습"이다. 좌표는 무대 설계 좌표(346×230, y는 아래로 커진다).
// 달은 지구 둘레를 반시계 방향으로 돈다. 태양은 늘 왼쪽에 있다.
//
// 그림과 판정은 같은 함수에서 나온다(그림자 그림은 접선으로, "그곳에서 본 모습"은 겉보기 각으로 계산한다).
//   solarView : 지구 위 한 곳에서 본 태양과 달. 달이 태양을 다 덮으면 total, 걸치면 partial.
//   lunarState: 달이 지구 그림자에 얼마나 들어갔는지.
//   skyOffset : 보는 사람에게 대상이 얼마나 오른쪽에 있는지(위에서 내려다볼 때 시계 방향이 그 사람의 오른쪽이다).
// 천체의 크기와 거리 비율은 실제와 다르다(책의 그림 Ⅶ-10과 같다). 지구에서 본 달이 태양보다 조금 크게(약 1.26배) 보이도록 맞춰, 그림자의 짙은 곳이 지구에 좁게 닿는다.

export interface Pt {
  x: number;
  y: number;
}

const RAD = Math.PI / 180;
const hyp = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);

// ── 일식 무대: 태양(왼쪽, 잘려 보인다), 달, 지구(오른쪽, 크게) ─────────────
export const SOLAR = {
  S: { x: 6, y: 115 } as Pt, // 태양 중심
  Rs: 33,
  E: { x: 321, y: 115 } as Pt, // 지구 중심
  Re: 95,
  orbit: 180, // 달 궤도 반지름(지구 중심에서)
  rm: 16,
};

/** 달의 자리. deg는 삭(태양과 지구를 잇는 선 위)에서 잰 각이고, 양수면 무대의 위쪽(아직 선에 닿기 전)이다. */
export function solarMoonAt(deg: number): Pt {
  return { x: SOLAR.E.x - SOLAR.orbit * Math.cos(deg * RAD), y: SOLAR.E.y - SOLAR.orbit * Math.sin(deg * RAD) };
}

/** 지구 위(낮인 쪽)의 한 곳. deg는 태양을 정면으로 보는 곳에서 잰 각이고, 양수면 무대의 위쪽이다. */
export function groundAt(deg: number): Pt {
  return { x: SOLAR.E.x - SOLAR.Re * Math.cos(deg * RAD), y: SOLAR.E.y - SOLAR.Re * Math.sin(deg * RAD) };
}

/** P에 선 사람이 look 쪽을 볼 때 target이 얼마나 오른쪽에 있는지(rad). 음수면 왼쪽. */
export function skyOffset(P: Pt, look: Pt, target: Pt): number {
  const ux = look.x - P.x;
  const uy = look.y - P.y;
  const vx = target.x - P.x;
  const vy = target.y - P.y;
  // 화면 좌표(y가 아래)에서 양의 외적은 시계 방향이고, 위에서 내려다본 사람에게 시계 방향은 오른쪽이다.
  return Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
}

export type SolarKind = "total" | "partial" | "none";
export interface SolarView {
  /** 태양의 겉보기 반지름(rad) */
  as: number;
  /** 달의 겉보기 반지름(rad) */
  am: number;
  /** 달이 태양 중심에서 오른쪽으로 벗어난 각(rad). 음수면 왼쪽 */
  off: number;
  kind: SolarKind;
}

/** P에서 본 태양과 달(M은 달의 중심). */
export function solarView(P: Pt, M: Pt): SolarView {
  const as = Math.asin(SOLAR.Rs / hyp(P, SOLAR.S));
  const am = Math.asin(SOLAR.rm / hyp(P, M));
  const off = skyOffset(P, SOLAR.S, M);
  const sep = Math.abs(off);
  const kind: SolarKind = sep + as <= am ? "total" : sep < as + am ? "partial" : "none";
  return { as, am, off, kind };
}

/** 지구 위에서 개기일식, 부분일식이 보이는 범위(달이 M에 있을 때). 각도(도)의 양 끝을 0.1° 간격으로 훑어 찾는다. */
export function solarZones(M: Pt, lo = -60, hi = 60): { total: [number, number] | null; partial: [number, number] | null } {
  let t0 = NaN, t1 = NaN, p0 = NaN, p1 = NaN;
  for (let a = lo; a <= hi + 1e-9; a += 0.1) {
    const k = solarView(groundAt(a), M).kind;
    if (k !== "none") {
      if (Number.isNaN(p0)) p0 = a;
      p1 = a;
    }
    if (k === "total") {
      if (Number.isNaN(t0)) t0 = a;
      t1 = a;
    }
  }
  return { total: Number.isNaN(t0) ? null : [t0, t1], partial: Number.isNaN(p0) ? null : [p0, p1] };
}

/** 빛을 내는 원(S, Rs)과 가리는 원(M, rm)이 만드는 그림자의 두 부분. 짙은 곳(빛이 전혀 안 드는 곳)은 세모, 옅은 곳은 퍼지는 사다리꼴. */
export function shadowPolys(S: Pt, Rs: number, M: Pt, rm: number, len: number): { dark: Pt[]; faint: Pt[] } {
  const d = hyp(S, M);
  const ux = (M.x - S.x) / d;
  const uy = (M.y - S.y) / d;
  const nx = -uy;
  const ny = ux;
  const at = (a: number, b: number): Pt => ({ x: M.x + a * ux + b * nx, y: M.y + a * uy + b * ny });
  // 짙은 곳: 두 원의 바깥 접선이 달 뒤 L만큼 떨어진 점에서 만난다.
  const L = (d * rm) / (Rs - rm);
  const c1 = rm / L;
  const s1 = Math.sqrt(1 - c1 * c1);
  const dark = [at(rm * c1, rm * s1), at(L, 0), at(rm * c1, -rm * s1)];
  // 옅은 곳: 두 원의 안쪽 접선이 달 앞 a만큼 떨어진 점 X에서 엇갈린 뒤 퍼진다.
  const a = (d * rm) / (Rs + rm);
  const c2 = rm / a;
  const s2 = Math.sqrt(1 - c2 * c2);
  const tp = at(-rm * c2, rm * s2);
  const tm = at(-rm * c2, -rm * s2);
  const X = at(-a, 0);
  const far = (t: Pt): Pt => {
    const k = len / hyp(X, t);
    return { x: t.x + (t.x - X.x) * k, y: t.y + (t.y - X.y) * k };
  };
  return { dark, faint: [tp, far(tp), far(tm), tm] };
}

// ── 월식 무대: 햇빛(왼쪽에서), 지구, 지구의 그림자, 달 ───────────────────
export const LUNAR = {
  E: { x: 62, y: 118 } as Pt,
  Re: 28,
  tip: 600, // 그림자가 한 점으로 모이는 곳까지의 거리(지구 중심에서)
  orbit: 150,
  rm: 9,
};

/** 달의 자리. deg는 망(태양, 지구, 달이 한 줄)에서 잰 각이고, 양수면 무대의 아래쪽(아직 그림자에 들기 전)이다. */
export function lunarMoonAt(deg: number): Pt {
  return { x: LUNAR.E.x + LUNAR.orbit * Math.cos(deg * RAD), y: LUNAR.E.y + LUNAR.orbit * Math.sin(deg * RAD) };
}

/** 지구 중심에서 x만큼 떨어진 곳의 그림자 반폭. */
export function lunarShadowHalf(dist: number): number {
  return LUNAR.Re * (1 - dist / LUNAR.tip);
}

export type LunarKind = "total" | "partial" | "none";
export interface LunarState {
  /** 달 중심이 그림자의 가운데 선에서 벗어난 거리. 양수면 지구에서 볼 때 그림자의 오른쪽 */
  h: number;
  /** 달이 있는 곳의 그림자 반폭 */
  w: number;
  kind: LunarKind;
}

export function lunarState(deg: number): LunarState {
  const M = lunarMoonAt(deg);
  const h = M.y - LUNAR.E.y; // 지구에서 +x 쪽을 보면 무대의 아래쪽이 오른쪽이다(skyOffset과 같은 약속)
  const w = lunarShadowHalf(M.x - LUNAR.E.x);
  const kind: LunarKind = Math.abs(h) + LUNAR.rm <= w ? "total" : Math.abs(h) < w + LUNAR.rm ? "partial" : "none";
  return { h, w, kind };
}

// ── 그림 조각 ──────────────────────────────────────────────────────
export const pts = (p: Pt[]): string => p.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");

/** 그라데이션 묶음. id는 랩마다 다른 접두를 준다(앞 스텝의 그림이 아직 문서에 남아 있어도 겹치지 않게). */
export function ecDefs(p: string): string {
  return `<defs>
    <radialGradient id="${p}sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF1BE"/><stop offset=".62" stop-color="#FFC24E"/><stop offset="1" stop-color="#F08A24"/></radialGradient>
    <radialGradient id="${p}glow" cx=".5" cy=".5" r=".5"><stop offset=".45" stop-color="#FFB03A" stop-opacity=".5"/><stop offset="1" stop-color="#FFB03A" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}earth" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#7FB2F0"/><stop offset=".6" stop-color="#2E6FD4"/><stop offset="1" stop-color="#1B4B9E"/></radialGradient>
    <radialGradient id="${p}moon" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#F3EDD8"/><stop offset="1" stop-color="#BDB08A"/></radialGradient>
    <radialGradient id="${p}corona" cx=".5" cy=".5" r=".5"><stop offset=".5" stop-color="#F2F6FF" stop-opacity=".95"/><stop offset=".72" stop-color="#DCE8FF" stop-opacity=".4"/><stop offset="1" stop-color="#DCE8FF" stop-opacity="0"/></radialGradient>
  </defs>`;
}

export function stars(list: [number, number][]): string {
  return list.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 1.2 : 0.9}" fill="#DCE8FF" opacity=".7"/>`).join("");
}

/** "여기서 본 태양" 창의 그림(88×88, 아래 21px은 이름표). 태양은 가운데에 두고 달을 옮긴다. */
export const SUN_INSET = { cx: 44, cy: 34, r: 17 };
export function sunInsetSvg(p: string): string {
  const { cx, cy, r } = SUN_INSET;
  return `<svg viewBox="0 0 88 88" aria-hidden="true">${ecDefs(p)}
    <rect width="88" height="88" fill="#16284a" class="u7x-ec-sky"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 2.5}" fill="url(#${p}corona)" class="u7x-ec-corona" opacity="0"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${p}sun)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" class="u7x-ec-bite" fill="#16284a"/>
  </svg>`;
}

/** 창의 그림을 지금 보이는 모습으로 맞춘다. */
export function paintSunInset(root: Element, v: SolarView): void {
  const { cx, r } = SUN_INSET;
  const bite = root.querySelector(".u7x-ec-bite") as SVGCircleElement;
  const sky = root.querySelector(".u7x-ec-sky") as SVGRectElement;
  const corona = root.querySelector(".u7x-ec-corona") as SVGCircleElement;
  const total = v.kind === "total";
  const col = total ? "#070d1a" : "#16284a"; // 다 가려지면 하늘이 어두워진다
  bite.setAttribute("cx", (cx + (v.off / v.as) * r).toFixed(2));
  bite.setAttribute("r", ((v.am / v.as) * r).toFixed(2));
  bite.setAttribute("fill", col);
  sky.setAttribute("fill", col);
  corona.setAttribute("opacity", total ? "1" : "0");
}
