// [중2 Ⅵ v5] 순환 여행 랩(g2u6RideLab, rideLab.ts)의 무대 약속.
// 진행과 글은 랩 파일 하나에 있고, 그림을 그리는 무대는 둘이다.
//   입체 무대(rideStage3d.ts): three.js. 쓸 수 있는 기기에서는 이것이 뜬다.
//   평면 무대(rideStageFlat.ts): SVG. WebGL2를 쓸 수 없거나 입체를 켜다 실패하면 그 자리에서 이것으로 바뀐다.
// 두 무대는 같은 상태(RideState)를 받아 같은 뜻으로 그린다. 상태에는 "언제부터 얼마 동안"이 들어 있어
// 무대는 지금 시각만 보고 그림을 정한다(랩의 진행은 랩 쪽 타이머가 돌리므로 그리기 루프가 멈춰도 랩은 끝까지 간다).
//
// 판은 세로로 긴 설계 판 346×440이다(2026-11-15 사용자 요청 "세로로 길게").
//   큰 그림(몸 전체): 위에 허파, 가운데에 심장, 아래에 온몸의 조직세포. 교과서 그림 「혈액의 순환 경로」와 같은 배치다.
//   앞에서 본 몸이라 화면 왼쪽이 몸의 오른쪽(우심방, 우심실, 대정맥, 폐동맥)이다(circLabs.ts와 같은 관례).
//   확대 판 둘(조직세포 곁의 모세혈관, 허파꽈리를 감싼 모세혈관): 같은 346×440 판에 따로 그린다. 카메라가 큰 그림의
//   그 자리로 들어가면 확대 판이 나타난다.
// 좌표는 전부 이 파일에 있다(설계 판 px, 아래로 갈수록 y가 크다). 두 무대 모두 여기서 읽는다.

import { icon } from "../../../core/icons";
import type { BvTimers } from "../bio6/b6Lab";

export const RW = 346;
export const RH = 440;
export type Pt = [number, number];

// ── 색(단원 팔레트 kit.P와 같은 값) ─────────────────────────────────
export const RC = {
  rich: "#F0606B", // 산소가 많은 혈액
  poor: "#8E4A7A", // 산소가 적은 혈액
  o2: "#7CC8FF",
  co2: "#BBA8F5",
  nut: "#F5B544", // 영양소
  waste: "#9FC86A", // 노폐물(이산화 탄소의 보라와 헷갈리지 않게 연두)
  muscle: "#D98A94",
  valve: "#FFE9A8",
  empty: "#33496E", // 아직 지나지 않은 길
  cell: "#F0A070", // 조직세포(호흡 랩의 조직세포와 같은 색)
  lung: "#F2A7B4",
  air: "#AFC3DD",
  body: "#FFA94D", // 온몸순환 구역(교과서 그림의 주황 바탕)
  lungLoop: "#74C0FC", // 허파순환 구역(교과서 그림의 하늘색 바탕)
};

// ── 큰 그림: 심장 ───────────────────────────────────────────────────
export const HEART_C: Pt = [173, 244];
/** 심장 윤곽(시계 방향). 끝(심첨)은 아래 조금 오른쪽이다(좌심실이 심장 끝을 이룬다). */
export const HEART_OUT: Pt[] = [
  [173, 186], [152, 178], [124, 178], [104, 190], [97, 214], [100, 244], [111, 270], [130, 290], [156, 304],
  [184, 312], [204, 308], [224, 296], [240, 276], [248, 248], [249, 218], [242, 194], [224, 180], [196, 178],
];
export type Room = "ra" | "rv" | "la" | "lv";
/** 네 방(가운데, 가로 반지름, 세로 반지름). 오른쪽 방(그림의 왼쪽)은 산소가 적은 혈액, 왼쪽 방은 산소가 많은 혈액. */
export const ROOM: Record<Room, { c: Pt; rx: number; ry: number; rich: boolean; name: string }> = {
  ra: { c: [127, 208], rx: 22, ry: 19, rich: false, name: "우심방" },
  rv: { c: [140, 261], rx: 28, ry: 27, rich: false, name: "우심실" },
  la: { c: [219, 208], rx: 22, ry: 19, rich: true, name: "좌심방" },
  lv: { c: [205, 264], rx: 28, ry: 31, rich: true, name: "좌심실" },
};
/** 판막 넷: 방실판막(심방과 심실 사이) 둘, 동맥 쪽 판막 둘. w는 폭, up은 동맥 쪽 판막(위로 열린다). */
export const VALVES: { key: string; c: Pt; w: number; up: boolean }[] = [
  { key: "tri", c: [133, 232], w: 28, up: false },
  { key: "mit", c: [212, 232], w: 28, up: false },
  { key: "pul", c: [161, 222], w: 14, up: true },
  { key: "aor", c: [186, 222], w: 16, up: true },
];

// ── 큰 그림: 허파 ───────────────────────────────────────────────────
/** 허파 두 쪽(가운데, 반지름). 화면 왼쪽이 몸의 오른쪽 허파다. */
export const LOBES: { c: Pt; rx: number; ry: number }[] = [
  { c: [114, 76], rx: 66, ry: 60 },
  { c: [232, 76], rx: 66, ry: 60 },
];
/** 기관과 기관지(숨관과 숨관가지) */
export const AIRWAY: Pt[][] = [
  [[173, -6], [173, 20], [173, 38]],
  [[173, 38], [156, 48], [140, 58]],
  [[173, 38], [190, 48], [206, 58]],
];
/** 허파꽈리 묶음(작은 공) */
export const ALV_MACRO: { c: Pt; r: number }[] = [
  [122, 68], [148, 64], [160, 108], [186, 64], [198, 108], [224, 68], [134, 110], [212, 112],
].map(([x, y]) => ({ c: [x, y] as Pt, r: 10 }));

// ── 큰 그림: 온몸(조직세포) ─────────────────────────────────────────
export const CELLS_MACRO: { c: Pt; r: number }[] = [
  [118, 348], [152, 344], [186, 346], [220, 344], [102, 400], [136, 404], [170, 402], [204, 404], [238, 400],
].map(([x, y]) => ({ c: [x, y] as Pt, r: 15 }));
/** 큰 그림의 모세혈관 여러 갈래(동맥 쪽 → 정맥 쪽). 첫 줄이 혈액 한 방울이 지나는 길이다. */
export const BED_BODY: Pt[][] = [
  [[262, 372], [244, 366], [226, 378], [208, 368], [190, 380], [172, 370], [154, 382], [136, 372], [118, 380], [100, 372]],
  [[262, 372], [252, 330], [232, 322], [204, 326], [170, 322], [136, 326], [108, 324], [92, 338], [100, 372]],
  [[262, 372], [262, 418], [232, 424], [196, 422], [160, 424], [124, 422], [92, 418], [86, 392], [100, 372]],
];
export const BED_LUNG: Pt[][] = [
  [[112, 96], [128, 86], [144, 94], [160, 84], [173, 92], [186, 84], [202, 94], [218, 86], [234, 96]],
  [[112, 96], [116, 76], [134, 50], [158, 44], [173, 50], [188, 44], [212, 50], [230, 76], [234, 96]],
  [[112, 96], [124, 122], [146, 126], [173, 120], [200, 126], [222, 122], [234, 96]],
];

// ── 혈액 한 방울이 지나는 길(큰 그림) ─────────────────────────────
// ao: 좌심실 → 대동맥판막 → 대동맥(위로 나와 오른쪽으로 휘어 내려감) → 온몸의 모세혈관 입구
// vc: 모세혈관 출구 → 정맥 → 대정맥(왼쪽으로 올라감) → 우심방
// rv: 우심방 → 방실판막 → 우심실
// pa: 우심실 → 폐동맥판막 → 폐동맥 → 허파의 모세혈관 입구
// pv: 허파의 모세혈관 출구 → 폐정맥 → 좌심방
// lv: 좌심방 → 방실판막 → 좌심실
export type MacroSeg = "ao" | "vc" | "rv" | "pa" | "pv" | "lv";
export const MACRO: Record<MacroSeg, Pt[]> = {
  ao: [[205, 266], [196, 246], [187, 230], [186, 206], [186, 180], [190, 158], [206, 140], [234, 132], [266, 138], [292, 158], [304, 192], [306, 236], [305, 282], [300, 318], [284, 348], [262, 372]],
  vc: [[100, 372], [84, 368], [70, 350], [64, 318], [62, 282], [63, 246], [70, 222], [86, 210], [104, 207], [127, 208]],
  rv: [[127, 208], [131, 222], [134, 236], [138, 250], [140, 261]],
  pa: [[140, 261], [151, 252], [159, 238], [161, 222], [161, 196], [161, 172], [156, 150], [142, 128], [124, 110], [112, 96]],
  pv: [[234, 96], [248, 112], [256, 136], [252, 162], [240, 182], [228, 196], [219, 208]],
  lv: [[219, 208], [215, 222], [212, 236], [208, 252], [205, 264]],
};
/** 굵기(설계 판 px, 혈관 안쪽 반지름) */
export const MACRO_R: Record<MacroSeg, number> = { ao: 6.5, vc: 6, rv: 0, pa: 5.5, pv: 5, lv: 0 };
/** 혈관 이름(이름표). 심장 속의 길(rv, lv)에는 없다. */
export const VESSEL: Partial<Record<MacroSeg, { name: string; at: number; dx: number; dy: number }>> = {
  ao: { name: "대동맥", at: 0.62, dx: -30, dy: 0 },
  vc: { name: "대정맥", at: 0.4, dx: 30, dy: 0 },
  pa: { name: "폐동맥", at: 0.7, dx: 26, dy: 10 },
  pv: { name: "폐정맥", at: 0.42, dx: 34, dy: 0 },
};

// ── 확대 판: 조직세포 곁의 모세혈관 ───────────────────────────────
// 동맥(작은 동맥, 벽이 두껍다)이 오른쪽 위에서 들어와 모세혈관(벽이 매우 얇다)이 조직세포 사이를 굽이쳐 내려가고,
// 정맥(작은 정맥, 벽이 동맥보다 얇다)으로 모여 왼쪽 아래로 나간다.
export type MicroSeg = "mart" | "mcap" | "mven" | "lcap";
export const MICRO: Record<MicroSeg, Pt[]> = {
  mart: [[384, 26], [334, 58], [292, 92], [262, 126]],
  mcap: [[262, 126], [242, 166], [240, 210], [228, 252], [202, 288], [166, 312], [128, 330]],
  mven: [[128, 330], [98, 352], [62, 378], [20, 404], [-30, 430]],
  // 허파꽈리를 감싼 모세혈관: 왼쪽(폐동맥 쪽)에서 들어와 허파꽈리 사이를 지나 오른쪽(폐정맥 쪽)으로 나간다
  lcap: [[-30, 262], [30, 240], [92, 228], [150, 238], [206, 224], [262, 228], [314, 252], [380, 272]],
};
/** 혈관 안쪽 반지름과 벽 바깥 반지름(확대 판 px). 벽의 두께가 혈관마다 다르다: 동맥 > 정맥 > 모세혈관. */
export const MICRO_WALL: Record<MicroSeg, { r: number; wall: number }> = {
  mart: { r: 15, wall: 30 },
  mcap: { r: 12, wall: 14 },
  mven: { r: 16, wall: 23 },
  lcap: { r: 12, wall: 14 },
};
export interface Blob {
  c: Pt;
  r: number;
}
export const MICRO_CELLS: Blob[] = [
  { c: [110, 122], r: 50 },
  { c: [128, 234], r: 44 },
  { c: [300, 220], r: 40 },
  { c: [290, 322], r: 42 },
  { c: [212, 396], r: 40 },
  { c: [42, 300], r: 32 },
  { c: [38, 54], r: 30 },
  { c: [196, 40], r: 30 },
];
/** 확대 판: 허파꽈리(위와 아래 두 줄)와 숨관가지 */
export const MICRO_ALV: Blob[] = [
  { c: [100, 150], r: 62 },
  { c: [230, 140], r: 64 },
  { c: [112, 330], r: 56 },
  { c: [254, 322], r: 52 },
  { c: [334, 116], r: 34 },
  { c: [20, 118], r: 28 },
];
export const MICRO_AIRWAY: Pt[][] = [
  [[173, -30], [173, 20], [168, 52]],
  [[168, 52], [136, 76], [114, 92]],
  [[168, 52], [196, 74], [214, 82]],
];

// ── 기체와 물질의 이동(확대 판). 두 무대가 같은 차례로 움직인다 ─────
// 적혈구에 붙은 자리(b: 산소, 적혈구가 나른다)와 혈장에 실린 자리(p: 이산화 탄소와 노폐물, n: 영양소, 혈장이 나른다).
// b는 적혈구 가운데에서 떨어진 거리(확대 판 px)다. p와 n은 혈관 안에서 적혈구 앞뒤를 따라가므로 길을 따라 잰 거리다
// (화면에서 잰 거리로 두었더니 모세혈관 밖에 떠서 따라갔다. 2026-11-15 눈검수).
export type Slot = "b0" | "b1" | "b2" | "b3" | "p0" | "p1" | "p2" | "n0" | "n1";
export const SLOT: Record<"b0" | "b1" | "b2" | "b3", Pt> = {
  b0: [-8, -5],
  b1: [8, -6],
  b2: [-6, 7],
  b3: [9, 6],
};
export const PLASMA_OFF: Record<"p0" | "p1" | "p2" | "n0" | "n1", number> = { p0: -27, p1: 28, p2: -48, n0: 48, n1: -68 };
export const isBead = (s: Slot): s is "b0" | "b1" | "b2" | "b3" => s[0] === "b";
export type Gas = "o2" | "co2" | "nut" | "waste";
/** 한 알갱이의 이동: from에서 to로(t0~t1 ms, 교환이 시작된 때부터). "hero"는 적혈구의 그 자리(slot)다. */
export interface Flight {
  g: Gas;
  from: Pt | "hero";
  to: Pt | "hero";
  slot: Slot;
  t0: number;
  t1: number;
}
/** 온몸의 모세혈관: 산소(적혈구)와 영양소(혈장)는 세포로, 이산화 탄소와 노폐물은 세포에서 혈장으로. */
export const BODY_FLIGHTS: Flight[] = [
  { g: "o2", from: "hero", to: [286, 212], slot: "b0", t0: 700, t1: 1500 },
  { g: "nut", from: "hero", to: [146, 244], slot: "n0", t0: 1000, t1: 1800 },
  { g: "co2", from: [300, 232], to: "hero", slot: "p0", t0: 1100, t1: 1900 },
  { g: "o2", from: "hero", to: [148, 222], slot: "b1", t0: 1300, t1: 2100 },
  { g: "waste", from: [312, 206], to: "hero", slot: "p2", t0: 1500, t1: 2300 },
  { g: "co2", from: [116, 236], to: "hero", slot: "p1", t0: 1800, t1: 2600 },
  { g: "o2", from: "hero", to: [274, 314], slot: "b2", t0: 2000, t1: 2800 },
  { g: "nut", from: "hero", to: [284, 332], slot: "n1", t0: 2300, t1: 3100 },
  { g: "o2", from: "hero", to: [204, 382], slot: "b3", t0: 2700, t1: 3500 },
];
/** 허파의 모세혈관: 이산화 탄소는 혈장에서 허파꽈리로, 산소는 허파꽈리에서 적혈구로. */
export const LUNG_FLIGHTS: Flight[] = [
  { g: "co2", from: "hero", to: [114, 172], slot: "p0", t0: 500, t1: 1300 },
  { g: "o2", from: [92, 178], to: "hero", slot: "b0", t0: 800, t1: 1600 },
  { g: "co2", from: "hero", to: [222, 166], slot: "p1", t0: 1200, t1: 2000 },
  { g: "o2", from: [240, 170], to: "hero", slot: "b1", t0: 1500, t1: 2300 },
  { g: "co2", from: "hero", to: [250, 298], slot: "p2", t0: 2000, t1: 2800 },
  { g: "o2", from: [118, 300], to: "hero", slot: "b2", t0: 2200, t1: 3000 },
  { g: "o2", from: [262, 300], to: "hero", slot: "b3", t0: 2700, t1: 3500 },
];
/** 숨을 들이쉬면 숨관가지 끝에서 허파꽈리로 산소가 들어온다. */
export const BREATH_IN: { to: Pt; t0: number }[] = [
  [[84, 140], 0], [[214, 120], 80], [[108, 124], 160], [[248, 132], 240], [[98, 318], 320], [[242, 314], 400], [[130, 340], 480], [[270, 328], 560],
].map(([to, t0]) => ({ to: to as Pt, t0: t0 as number }));
export const BREATH_FROM: Pt = [168, 52];
/** 숨을 쉬기 전부터 허파꽈리에 있던 산소(장식) */
export const ALV_O2: Pt[] = [[70, 160], [124, 168], [204, 150], [252, 156], [92, 342], [262, 340], [334, 112], [20, 116]];
/** 조직세포 안에 쌓여 있는 이산화 탄소(교환 전에 보인다)와 노폐물 */
export const CELL_CO2: Pt[] = [[96, 108], [124, 140], [112, 246], [140, 214], [306, 236], [292, 206], [300, 334], [278, 306], [214, 404], [40, 296], [196, 30]];
export const CELL_WASTE: Pt[] = [[132, 104], [318, 222], [196, 384]];
export const BODY_DUR = 4100; // 온몸의 모세혈관을 지나는 시간(교환 장면 전체)
export const LUNG_DUR = 3900;
export const BREATH_DUR = 1500;

// ── 곡선과 길 위의 점 ───────────────────────────────────────────────
/** 점들을 지나는 매끈한 곡선(가운데 잡는 캣멀롬)을 촘촘한 꺾은선으로 바꾼다. */
export function smooth(pts: Pt[], per = 10): Pt[] {
  if (pts.length < 3) return pts.slice();
  const out: Pt[] = [];
  const P = (i: number): Pt => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = P(i - 1);
    const p1 = P(i);
    const p2 = P(i + 1);
    const p3 = P(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number): number => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
export interface Poly {
  pts: Pt[];
  acc: number[]; // 앞에서부터의 길이
  len: number;
}
export function poly(pts: Pt[]): Poly {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, acc, len: acc[acc.length - 1] };
}
/** 길이의 비율 t(0~1)에 있는 점. */
export function along(p: Poly, t: number): Pt {
  const d = Math.max(0, Math.min(1, t)) * p.len;
  let i = 1;
  while (i < p.acc.length - 1 && p.acc[i] < d) i++;
  const a = p.acc[i - 1];
  const b = p.acc[i];
  const k = b > a ? (d - a) / (b - a) : 0;
  return [p.pts[i - 1][0] + (p.pts[i][0] - p.pts[i - 1][0]) * k, p.pts[i - 1][1] + (p.pts[i][1] - p.pts[i - 1][1]) * k];
}
/** 길의 꺾은선(한 번 만들어 두고 함께 쓴다) */
export const PATHS: Record<MacroSeg | MicroSeg, Poly> = Object.fromEntries(
  ([...Object.entries(MACRO), ...Object.entries(MICRO)] as [MacroSeg | MicroSeg, Pt[]][]).map(([k, pts]) => [k, poly(smooth(pts, 12))]),
) as Record<MacroSeg | MicroSeg, Poly>;

export const ease = (x: number): number => x * x * (3 - 2 * x);
export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
/** #RRGGBB 두 색을 섞는다. */
export function mixHex(a: string, b: string, t: number): string {
  const p = (h: string, i: number): number => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * clamp01(t)).toString(16).padStart(2, "0")).join("")}`;
}

// ── 화면 구도 ───────────────────────────────────────────────────────
// 구도 하나 = 큰 그림(또는 확대 판)의 어느 점(c)을 무대 가운데에 두고 몇 배(z)로 보느냐.
// 입체 무대는 카메라를, 평면 무대는 viewBox를 이 값에 맞춘다. 결정 단추의 자리는 구도가 정해진 뒤의 무대 px로 놓는다.
export type FrameKey = "all" | "follow" | "heart" | "pv" | "body" | "lung";
export interface Frame {
  c: Pt;
  z: number;
  /** 확대 판(body, lung)이면 그 판의 좌표다 */
  micro?: "body" | "lung";
}
export const FRAMES: Record<Exclude<FrameKey, "follow">, Frame> = {
  all: { c: [173, 218], z: 1 },
  heart: { c: [156, 250], z: 1.5 },
  pv: { c: [226, 168], z: 1.55 },
  body: { c: [173, 220], z: 1, micro: "body" },
  lung: { c: [173, 220], z: 1, micro: "lung" },
};
export const FOLLOW_Z = 1.6;
/** 확대 판이 큰 그림의 어디에 놓이는가(입체 무대가 카메라를 그곳으로 들이민다). k는 확대 배율. */
export const MICRO_AT: Record<"body" | "lung", { at: Pt; k: number }> = {
  body: { at: [180, 372], k: 6 },
  lung: { at: [173, 92], k: 6 },
};
/** 따라가는 구도: 혈액이 있는 곳을 가운데에 두되 그림 밖이 보이지 않게 가둔다. */
export function followFrame(p: Pt): Frame {
  const hw = RW / 2 / FOLLOW_Z;
  const hh = RH / 2 / FOLLOW_Z;
  return { c: [Math.max(hw - 6, Math.min(RW - hw + 6, p[0])), Math.max(hh - 14, Math.min(RH - hh + 10, p[1]))], z: FOLLOW_Z };
}
/** 큰 그림(또는 확대 판)의 점이 구도 f에서 무대의 어디에 보이는가(무대 px). */
export function toStage(p: Pt, f: Frame): Pt {
  return [RW / 2 + (p[0] - f.c[0]) * f.z, RH / 2 + (p[1] - f.c[1]) * f.z];
}

// ── 무대 안의 이름표, 단추, 글 ─────────────────────────────────────
export type TagKey = Room | "ao" | "vc" | "pa" | "pv" | "lungs" | "tissue" | "mcell" | "malv" | "mcap" | "lcap" | "bodyLoop" | "lungLoop" | "rbc";
/** 결정 단추: 확대 판의 세 혈관(art, cap, ven), 네 방(ra…lv), 폐정맥의 이름(artery, vein), 펌프(pump), 숨(breath) */
export type PickKey = "art" | "cap" | "ven" | Room | "artery" | "vein" | "pump" | "breath";
export interface Pick {
  key: PickKey;
  text: string;
  /** 무대 px(구도가 정해진 뒤의 자리). 없으면 무대가 정한다(네 방의 단추는 방의 가운데). */
  at?: Pt;
  /** 틀렸던 단추(다시 누를 수 없게 흐리게) */
  dim?: boolean;
  /** 크게 빛나는 단추(지금 누를 것: 펌프, 숨) */
  hot?: boolean;
  /** 누른 결과: ok(체크와 "맞아요"), no(가위표와 "아니에요". 다시 누를 수 없다) */
  mark?: "ok" | "no";
  /** 결과를 보이는 동안 잠깐 잠근다 */
  lock?: boolean;
}

// ── 상태 ───────────────────────────────────────────────────────────
export type Seg = MacroSeg | MicroSeg;
/** 혈액 색으로 채우는 큰 그림의 길: 네 혈관과 두 모세혈관 묶음(bed 온몸, lbed 허파) */
export type FillKey = "ao" | "bed" | "vc" | "pa" | "lbed" | "pv";
/** 교환 장면: 동맥이나 정맥에서 물질을 내보내려다 막힘, 몸의 모세혈관에서 주고받음, 숨 들이쉬기, 허파에서 주고받음 */
export type Ex = "" | "bumpArt" | "bumpVen" | "body" | "breath" | "lung";
export interface RideState {
  /** 혈액 한 방울이 있는 길과 그 길에서의 진행(t0부터 dur ms 동안 a → b) */
  seg: Seg;
  a: number;
  b: number;
  t0: number;
  dur: number;
  /** 혈액 한 방울의 산소(1 많음, 0 적음): 색과 산소 알갱이 수가 따른다(o0 → o1, ot0부터 odur ms) */
  o0: number;
  o1: number;
  ot0: number;
  odur: number;
  /** 구도(이전 구도에서 ft0부터 fdur ms 동안 옮겨 간다) */
  frame: FrameKey;
  ft0: number;
  fdur: number;
  /** 심장 박동(수축하는 쪽과 시각, 수축한 자세를 붙잡는 시간 ms). 글이 판막을 말하는 동안 그 자세가 남아 있게 붙잡는다. */
  beat: "" | "atria" | "vent";
  bt0: number;
  bhold: number;
  /** 교환 장면과 시각 */
  ex: Ex;
  et0: number;
  /** 지나온 길(혈액의 색으로 채운 길). 지금 길은 진행만큼 채운다 */
  done: FillKey[];
  /** 두 순환의 구역을 칠한다(0 없음, 1 온몸순환만, 2 둘 다) */
  loops: 0 | 1 | 2;
  /** 정리: 심장 안의 이음매 두 곳(우심방 → 우심실, 좌심방 → 좌심실)에 화살을 띄운다 */
  links: boolean;
  /** 흐리게 할 혈관(결정에서 헷갈리게 하는 이웃 혈관) */
  dim: FillKey[];
  /** 보이는 이름표 */
  tags: TagKey[];
  /** 결정 단추 */
  picks: Pick[];
  /** 틀렸을 때 깜빡여 근거를 보이는 곳: 대정맥이 닿는 곳, 폐정맥의 흐르는 방향 */
  hint: "" | "vc" | "pvdir";
  ht0: number;
  /** 무대 왼쪽 위의 "지금 있는 곳" */
  place: string;
  /** 무대 왼쪽 아래의 범례 */
  legend: "blood" | "gasBody" | "gasLung";
}

export function startState(): RideState {
  const now = performance.now();
  return {
    seg: "ao",
    a: 0,
    b: 0,
    t0: now,
    dur: 1,
    o0: 1,
    o1: 1,
    ot0: now,
    odur: 1,
    frame: "all",
    ft0: now,
    fdur: 1,
    beat: "",
    bt0: 0,
    bhold: 0,
    ex: "",
    et0: 0,
    done: [],
    loops: 0,
    links: false,
    dim: [],
    tags: ["lungs", "tissue", "lv"],
    picks: [],
    hint: "",
    ht0: 0,
    place: "",
    legend: "blood",
  };
}

/** 박동의 세기(0~1): 들어갈 때 0.22초, 붙잡는 동안 1, 풀릴 때 0.3초 */
export function beatAmt(st: RideState, now: number): number {
  if (!st.beat) return 0;
  const t = now - st.bt0;
  const hold = Math.max(220, st.bhold);
  if (t < 0 || t > hold + 300) return 0;
  if (t < 220) return ease(t / 220);
  if (t < hold) return 1;
  return 1 - ease((t - hold) / 300);
}
/** 지금 시각의 진행(0~1, 부드럽게) */
export const progress = (st: RideState, now: number): number => lerp(st.a, st.b, ease(clamp01((now - st.t0) / Math.max(1, st.dur))));
/** 지금 시각의 산소(0~1) */
export const oxygen = (st: RideState, now: number): number => lerp(st.o0, st.o1, ease(clamp01((now - st.ot0) / Math.max(1, st.odur))));
/** 적혈구가 길 path의 t에 있을 때 그 자리(slot)의 점. k는 크기(큰 그림에서는 작게 쓴다). */
export function cargoAt(path: Poly, t: number, slot: Slot, k = 1): Pt {
  if (isBead(slot)) {
    const h = along(path, t);
    return [h[0] + SLOT[slot][0] * k, h[1] + SLOT[slot][1] * k];
  }
  return along(path, t + (PLASMA_OFF[slot] * k) / path.len);
}
export const isMicro = (seg: Seg): seg is MicroSeg => seg === "mart" || seg === "mcap" || seg === "mven" || seg === "lcap";

/** 길마다 혈액의 산소: 처음(0)과 끝(1). 몸의 모세혈관에서 많음 → 적음, 허파의 모세혈관에서 적음 → 많음. */
export function segO2(seg: Seg | "bed" | "lbed"): [number, number] {
  switch (seg) {
    case "ao":
    case "lv":
    case "pv":
    case "mart":
      return [1, 1];
    case "mcap":
    case "bed":
      return [1, 0];
    case "lcap":
    case "lbed":
      return [0, 1];
    default:
      return [0, 0];
  }
}

// ── 무대가 지키는 약속 ─────────────────────────────────────────────
export interface RideStage {
  kind: "3d" | "flat";
  set: (st: RideState) => void;
  dispose: () => void;
}
export interface RideStageOpts {
  tm: BvTimers;
  /** 결정 단추를 눌렀을 때 */
  onPick: (k: PickKey) => void;
  /** 입체 무대: 첫 장면을 그렸을 때 */
  onReady?: () => void;
  /** 입체 무대: 켜지 못했을 때(랩이 평면 무대로 바꾼다) */
  onFail?: () => void;
}

// ── 무대 안의 글(이름표, 단추, 지금 있는 곳, 범례): 두 무대가 같은 것을 쓴다 ──
const TAG_TEXT: Record<TagKey, string> = {
  ra: "우심방",
  rv: "우심실",
  la: "좌심방",
  lv: "좌심실",
  ao: "대동맥",
  vc: "대정맥",
  pa: "폐동맥",
  pv: "폐정맥",
  lungs: "허파",
  tissue: "온몸",
  mcell: "조직세포",
  malv: "허파꽈리",
  mcap: "모세혈관",
  lcap: "모세혈관",
  bodyLoop: "온몸순환",
  lungLoop: "허파순환",
  rbc: "적혈구",
};
const LEGEND: Record<RideState["legend"], string> = {
  blood: `<span><i style="background:${RC.rich}"></i>산소가 많은 혈액</span><span><i style="background:${RC.poor}"></i>산소가 적은 혈액</span>`,
  gasBody: `<span><i style="background:${RC.o2}"></i>산소</span><span><i style="background:${RC.nut}"></i>영양소</span><span><i style="background:${RC.co2}"></i>이산화 탄소</span><span><i style="background:${RC.waste}"></i>노폐물</span>`,
  gasLung: `<span><i style="background:${RC.o2}"></i>산소</span><span><i style="background:${RC.co2}"></i>이산화 탄소</span>`,
};

export interface Overlay {
  /** 이름표와 단추의 자리를 정한다(무대 px를 돌려주는 함수). null이면 숨긴다. hero는 혈액 방울이 보이는 자리(이름표가 덮지 않게). */
  layout: (pos: (k: TagKey) => Pt | null, pickPos: (p: Pick) => Pt, hero?: Pt | null) => void;
  sync: (st: RideState) => void;
  dispose: () => void;
}

/** 무대 상자 위에 이름표, 단추, 글을 놓는다. 자리는 % 로 준다(무대 폭이 달라도 그림과 같이 줄어든다). */
export function makeOverlay(box: HTMLElement, onPick: (k: PickKey) => void): Overlay {
  const layer = document.createElement("div");
  layer.className = "g2u6x-rd-layer";
  const cap = document.createElement("div");
  cap.className = "g2u6x-rd-place";
  const leg = document.createElement("div");
  leg.className = "g2u6x-rd-legend";
  const tagBox = document.createElement("div");
  tagBox.className = "g2u6x-rd-tags";
  const pickBox = document.createElement("div");
  pickBox.className = "g2u6x-rd-picks";
  layer.append(tagBox, cap, leg, pickBox);
  box.appendChild(layer);
  const tags = new Map<TagKey, HTMLElement>();
  const tagSize = new Map<TagKey, [number, number]>();
  let boxSig = "";
  let legRect: [number, number, number, number] | null = null;
  let capRect: [number, number, number, number] | null = null;
  const picks = new Map<PickKey, HTMLButtonElement>();
  let st: RideState | null = null;
  let legendKey = "";
  let picksSig = "";
  const pct = (p: Pt, el: HTMLElement): void => {
    el.style.left = `${((p[0] / RW) * 100).toFixed(2)}%`;
    el.style.top = `${((p[1] / RH) * 100).toFixed(2)}%`;
  };
  return {
    sync(next) {
      st = next;
      if (cap.textContent !== next.place) cap.textContent = next.place;
      cap.hidden = !next.place;
      if (legendKey !== next.legend) {
        legendKey = next.legend;
        leg.innerHTML = LEGEND[next.legend];
      }
      // 이름표: 필요한 것만 만든다
      next.tags.forEach((k) => {
        if (tags.has(k)) return;
        const t = document.createElement("div");
        t.className = `g2u6x-rd-tag t-${k}`;
        t.textContent = TAG_TEXT[k];
        tagBox.appendChild(t);
        tags.set(k, t);
      });
      tags.forEach((t, k) => t.classList.toggle("on", next.tags.includes(k)));
      // 단추: 목록이 바뀔 때만 다시 만든다
      const sig = next.picks.map((p) => `${p.key}:${p.text}:${p.dim ? 1 : 0}:${p.hot ? 1 : 0}:${p.mark ?? ""}:${p.lock ? 1 : 0}`).join("|");
      if (sig !== picksSig) {
        picksSig = sig;
        const keep = new Set(next.picks.map((p) => p.key));
        picks.forEach((b, k) => {
          if (!keep.has(k)) {
            b.remove();
            picks.delete(k);
          }
        });
        next.picks.forEach((p) => {
          let b = picks.get(p.key);
          if (!b) {
            b = document.createElement("button");
            b.type = "button";
            b.className = "g2u6x-rd-pick";
            b.dataset.k = p.key;
            b.addEventListener("click", () => {
              if (b?.disabled) return;
              onPick(p.key);
            });
            pickBox.appendChild(b);
            picks.set(p.key, b);
          }
          // 누른 결과는 단추에 새긴다(맞음: 체크와 "맞아요", 틀림: 가위표와 "아니에요")
          if (p.mark) {
            b.replaceChildren();
            b.insertAdjacentHTML("beforeend", `<span class="g2u6x-rd-pick-l"><span class="g2u6x-rd-pick-ic" aria-hidden="true">${icon(p.mark === "ok" ? "check" : "xThick", 12)}</span><span></span></span><span class="g2u6x-rd-pick-s"></span>`);
            (b.querySelector(".g2u6x-rd-pick-l > span:last-child") as HTMLElement).textContent = p.text;
            (b.querySelector(".g2u6x-rd-pick-s") as HTMLElement).textContent = p.mark === "ok" ? "맞아요" : "아니에요";
          } else b.textContent = p.text;
          b.disabled = !!p.dim || !!p.lock || p.mark === "no";
          b.classList.toggle("dim", !!p.dim);
          b.classList.toggle("lock", !!p.lock);
          b.classList.toggle("hot", !!p.hot);
          b.classList.toggle("ok", p.mark === "ok");
          b.classList.toggle("no", p.mark === "no");
          b.classList.toggle("room", p.key === "ra" || p.key === "rv" || p.key === "la" || p.key === "lv");
        });
      }
    },
    layout(pos, pickPos, hero) {
      if (!st) return;
      // 무대 px로 잰 상자(무대 폭이 346이 아니어도 같은 셈이 되게 비율을 곱한다). 글이 바뀔 때만 다시 잰다.
      const k = RW / (box.clientWidth || RW);
      const rectOf = (e: HTMLElement): [number, number, number, number] => [e.offsetLeft * k, e.offsetTop * k, e.offsetWidth * k, e.offsetHeight * k];
      const sig2 = `${legendKey}|${cap.textContent}|${box.clientWidth}`;
      if (boxSig !== sig2) {
        boxSig = sig2;
        legRect = rectOf(leg);
        capRect = cap.hidden ? null : rectOf(cap);
      }
      const hit = (a: [number, number, number, number], b: [number, number, number, number] | null): boolean =>
        !!b && a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
      tags.forEach((t, kk) => {
        if (!t.classList.contains("on")) return;
        const p = pos(kk);
        let size = tagSize.get(kk);
        if (!size || !size[0]) {
          size = [t.offsetWidth * k, t.offsetHeight * k];
          tagSize.set(kk, size);
        }
        // 무대 가장자리에 잘리거나 범례, 위치 글, 혈액 방울을 덮는 이름표는 그동안 숨긴다(2026-11-15 눈검수)
        const r: [number, number, number, number] | null = p ? [p[0] - size[0] / 2, p[1] - size[1] / 2, size[0], size[1]] : null;
        const off =
          !r ||
          r[0] < 2 ||
          r[1] < 2 ||
          r[0] + r[2] > RW - 2 ||
          r[1] + r[3] > RH - 2 ||
          hit(r, legRect) ||
          hit(r, capRect) ||
          (!!hero && hit(r, [hero[0] - 11, hero[1] - 11, 22, 22]));
        if (off || !p) {
          t.style.visibility = "hidden";
          return;
        }
        t.style.visibility = "";
        pct(p, t);
      });
      st.picks.forEach((p) => {
        const b = picks.get(p.key);
        if (b) pct(pickPos(p), b);
      });
    },
    dispose() {
      layer.remove();
      tags.clear();
      picks.clear();
    },
  };
}

/** 이름표가 가리키는 큰 그림의 점(입체 무대는 이 점을 투영하고, 평면 무대는 구도로 옮긴다). */
export function tagAnchor(k: TagKey): { p: Pt; micro?: "body" | "lung"; dx?: number; dy?: number } | null {
  if (k === "ra" || k === "rv" || k === "la" || k === "lv") return { p: ROOM[k].c };
  if (k === "ao" || k === "vc" || k === "pa" || k === "pv") {
    const v = VESSEL[k];
    if (!v) return null;
    return { p: along(PATHS[k], v.at), dx: v.dx, dy: v.dy };
  }
  switch (k) {
    case "lungs":
      return { p: [300, 24] };
    case "tissue":
      return { p: [312, 400] };
    case "bodyLoop":
      return { p: [46, 390] };
    case "lungLoop":
      return { p: [46, 24] };
    case "mcell":
      return { p: [110, 122], micro: "body" };
    case "malv":
      return { p: [230, 140], micro: "lung" };
    case "mcap":
      return { p: [278, 270], micro: "body" };
    case "lcap":
      return { p: [206, 224], micro: "lung", dx: 0, dy: 34 };
    default:
      return null;
  }
}
