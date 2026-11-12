// 중2 과학 Ⅶ 전기와 자기: 도입(opener) 여덟 장면의 그림(손그림 코드 그림). intro-u4.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 조작으로 바뀌는 부분은 <g class>로 묶고 앱의 CSS가 보이고 감춘다.
//   묶음 이름: opn-g2u7-s0(조작 전에만 보인다) · -s1, -s2(첫째, 둘째 조작 뒤에 보인다) · -mv(조작하면 움직인다)
//   comb  (g2u7l1) 빗을 든 아이, 가라앉은 머리카락과 빗 쪽으로 선 머리카락
//   foil  (g2u7l2) 책상 위 알루미늄박 인형(누운 것, 선 것)과 내려오는 풍선
//   clock (g2u7l3) 멈춘 벽시계, 빈 전지 칸과 끼운 전지, 돌아가는 초침
//   dim   (g2u7l4) 전구와 전지 하나, 더 끼운 전지와 커진 빛
//   tap   (g2u7l5) 멀티탭, 스탠드(켜진 빛과 뽑히는 플러그), 충전 중인 휴대 전화
//   meter (g2u7l6) 계량기의 돌아가는 원판, 선풍기와 헤어드라이어
//   wire  (g2u7l7) 나침반 위를 지나는 전선, 전지와 스위치, 돌아가는 바늘
//   bike  (g2u7l8) 전기 자전거의 뒷바퀴와 전동기(덮개, 속의 자석과 코일)
// 실행: node qa/sketch/build-intro.mjs g2u7  →  src/ui/introArt.g2u7.generated.ts
import { Sk, C, curve, dense, ell, poly, rrect, squiggle, rays, emark, qmark } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const S0 = "opn-g2u7-s0", S1 = "opn-g2u7-s1", S2 = "opn-g2u7-s2", MV = "opn-g2u7-mv";
const floor = (sk, y, sd) => sk.ink(dense([[30, y], [930, y + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: sd });
const box = (sk, x, y, w, h, r, fill, sd, o = {}) => {
  const p = rrect(x, y, w, h, r);
  if (fill) sk.fill(p, fill, { dx: 0.8, dy: 1, wob: 0.7, seed: sd, tex: o.tex ?? true });
  sk.ink(p, { w: o.w ?? 9, wob: 0.8, seed: sd + 1, color: o.color });
};
const disk = (sk, x, y, rx, ry, fill, sd, o = {}) => {
  const p = ell(x, y, rx, ry);
  if (fill) sk.fill(p, fill, { dx: 0.6, dy: 0.8, wob: 0.6, seed: sd, tex: o.tex ?? false });
  sk.ink(p, { w: o.w ?? 9, wob: 0.7, seed: sd + 1, color: o.color });
};
const line = (sk, pts, w, color, sd, o = {}) => sk.ink(pts.length > 2 ? curve(pts) : dense(pts), { w, color, wob: o.wob ?? 0.6, seed: sd, dash: o.dash });
/** 전지(가로). (+)극 쪽에 꼭지가 있다. 글자 대신 색으로 두 극을 가른다(주황이 (+)극 쪽). */
const cell = (sk, x, y, w, h, sd, flip = false) => {
  box(sk, x, y, w, h, 8, "#DDE5EE", sd);
  const px = flip ? x : x + w * 0.62;
  sk.fill(rrect(px, y + 3, w * 0.38, h - 6, 6), C.orange, { dx: 0, dy: 0, wob: 0.4, seed: sd + 3 });
  const nx = flip ? x - 10 : x + w;
  box(sk, nx, y + h * 0.3, 10, h * 0.4, 3, C.gray, sd + 5, { w: 6, tex: false });
};
/** 전구. 꺼진 유리알과 꼭지쇠. */
const bulb = (sk, x, y, r, sd, lit = false) => {
  disk(sk, x, y, r, r, lit ? C.lemon : "#F4F1E4", sd);
  box(sk, x - r * 0.42, y + r * 0.86, r * 0.84, r * 0.6, 5, C.gray, sd + 4, { w: 7, tex: false });
  line(sk, [[x - r * 0.3, y + r * 0.3], [x - r * 0.12, y - r * 0.2], [x + r * 0.12, y + r * 0.1], [x + r * 0.3, y - r * 0.3]], 5, C.ink, sd + 7);
};

/* ══════════ 1. 머리 빗기 (g2u7l1) ══════════ */
export function combBase() {
  const sk = new Sk(W, H, { id: "cb" });
  floor(sk, 516, 3);
  // 아이(모자 없이): 머리는 (400, 226) 둘레, 반지름 76
  drawFigure(sk, 400, 548, 0.76, pose({ elR: [96, -300], haR: [176, -470], elL: [-44, -250], haL: [-60, -176] }), { hair: "bald", seed: 31 });
  const top = [[352, 168], [372, 156], [392, 150], [412, 150], [432, 156], [450, 168]];
  // 가라앉은 머리카락
  g(sk, S0, () => top.forEach(([x, y], i) => line(sk, [[x, y], [x + (i - 2.5) * 16, y + 18], [x + (i - 2.5) * 30, y + 64]], 8, C.hair, 41 + i)));
  // 빗 쪽으로 선 머리카락
  g(sk, S1, () => {
    top.forEach(([x, y], i) => line(sk, [[x, y], [x + 34 + i * 6, y - 40], [x + 96 + i * 8, y - 78 + i * 6]], 8, C.hair, 51 + i));
    emark(sk, 300, 110, 0.66, { seed: 61 });
  });
  // 빗(손에 든 것). 조작하면 머리 위에서 오른쪽 위로 뗀다
  g(sk, MV, () => {
    box(sk, 470, 96, 180, 30, 8, C.teal, 71);
    for (let i = 0; i < 9; i++) line(sk, [[484 + i * 19, 126], [484 + i * 19, 158]], 7, C.teal, 73 + i);
  });
  return { sk };
}

/* ══════════ 2. 풍선과 알루미늄박 인형 (g2u7l2) ══════════ */
export function foilBase() {
  const sk = new Sk(W, H, { id: "fo" });
  floor(sk, 516, 3);
  box(sk, 190, 404, 580, 30, 8, C.woodLight, 5);
  line(sk, [[250, 434], [250, 512]], 10, C.woodDark, 8);
  line(sk, [[710, 434], [710, 512]], 10, C.woodDark, 9);
  const foil = "#D5DDE6";
  // 누운 인형
  g(sk, S0, () => {
    disk(sk, 396, 386, 20, 14, foil, 21, { w: 7 });
    box(sk, 418, 376, 110, 22, 8, foil, 23, { w: 7 });
    line(sk, [[528, 384], [578, 376]], 8, C.gray, 26);
    line(sk, [[528, 392], [580, 398]], 8, C.gray, 27);
  });
  // 일어선 인형
  g(sk, S1, () => {
    disk(sk, 480, 262, 20, 20, foil, 31, { w: 7 });
    box(sk, 468, 284, 24, 84, 8, foil, 33, { w: 7 });
    line(sk, [[472, 368], [456, 402]], 8, C.gray, 36);
    line(sk, [[488, 368], [504, 402]], 8, C.gray, 37);
    line(sk, [[468, 300], [436, 276]], 8, C.gray, 38);
    line(sk, [[492, 300], [524, 276]], 8, C.gray, 39);
    emark(sk, 640, 250, 0.62, { seed: 45 });
  });
  // 풍선(내려온다)
  g(sk, MV, () => {
    disk(sk, 480, 96, 78, 88, C.red, 51, { tex: true });
    sk.ink(curve([[452, 60], [440, 84], [444, 108]]), { w: 7, color: C.white, wob: 0.4, seed: 54 });
    const knot = poly([[480, 184], [468, 204], [492, 204]], 3);
    sk.fill(knot, C.red, { dx: 0, dy: 0, wob: 0.3, seed: 55 });
    sk.ink(knot, { w: 7, wob: 0.4, seed: 56 });
  });
  return { sk };
}

/* ══════════ 3. 멈춘 시계 (g2u7l3) ══════════ */
export const CK = { cx: 330, cy: 250 };
export function clockBase() {
  const sk = new Sk(W, H, { id: "ck" });
  const { cx, cy } = CK;
  disk(sk, cx, cy, 170, 170, "#FFFDF4", 5, { w: 12 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    line(sk, [[cx + Math.cos(a) * 138, cy + Math.sin(a) * 138], [cx + Math.cos(a) * 156, cy + Math.sin(a) * 156]], i % 3 ? 6 : 10, C.ink, 11 + i, { wob: 0.2 });
  }
  line(sk, [[cx, cy], [cx + 62, cy - 50]], 12, C.ink, 31);
  line(sk, [[cx, cy], [cx - 26, cy - 112]], 9, C.ink, 32);
  // 초침(전지를 끼우면 돈다)
  g(sk, "opn-g2u7-hand", () => line(sk, [[cx, cy + 26], [cx, cy - 132]], 5, C.red, 35, { wob: 0.2 }));
  disk(sk, cx, cy, 10, 10, C.ink, 37, { w: 4 });
  // 전지 칸(시계 옆에 크게 꺼내 보인 것)
  box(sk, 610, 196, 250, 110, 16, "#EEF1F5", 41);
  g(sk, S0, () => {
    sk.ink(rrect(640, 222, 190, 58, 10), { w: 6, color: C.gray, wob: 0.5, seed: 45, dash: [16, 12] });
    qmark(sk, 735, 150, 0.6, { color: C.orange, seed: 47 });
  });
  g(sk, S1, () => cell(sk, 642, 224, 176, 54, 51));
  line(sk, [[500, 250], [560, 250], [610, 250]], 7, C.gray, 61, { dash: [14, 12] });
  return { sk };
}

/* ══════════ 4. 전지를 하나 더 (g2u7l4) ══════════ */
export function dimBase() {
  const sk = new Sk(W, H, { id: "dm" });
  floor(sk, 500, 3);
  // 전선: 전지 칸에서 전구로
  line(sk, [[250, 400], [170, 400], [170, 210], [404, 210]], 8, C.gray, 11);
  line(sk, [[710, 400], [790, 400], [790, 210], [556, 210]], 8, C.gray, 12);
  // 약한 빛과 센 빛
  g(sk, S0, () => rays(sk, 480, 196, 92, 112, 9, { color: C.yellow, w: 7, seed: 21, a0: -3.3, a1: 0.16 }));
  g(sk, S1, () => {
    rays(sk, 480, 196, 96, 168, 13, { color: C.orange, w: 10, seed: 25, a0: -3.3, a1: 0.16 });
    emark(sk, 700, 110, 0.62, { seed: 29 });
  });
  bulb(sk, 480, 196, 74, 31, true);
  // 전지 칸: 하나는 끼워져 있고 하나는 비어 있다
  cell(sk, 260, 372, 200, 56, 41);
  g(sk, S0, () => sk.ink(rrect(490, 372, 210, 56, 10), { w: 6, color: C.gray, wob: 0.5, seed: 47, dash: [16, 12] }));
  g(sk, S1, () => cell(sk, 492, 372, 200, 56, 51));
  return { sk };
}

/* ══════════ 5. 멀티탭 (g2u7l5) ══════════ */
export function tapBase() {
  const sk = new Sk(W, H, { id: "tp" });
  floor(sk, 508, 3);
  // 멀티탭
  box(sk, 300, 396, 360, 64, 14, "#F2F0EA", 5);
  [372, 588].forEach((x, i) => {
    disk(sk, x, 428, 24, 20, "#D9DEE4", 11 + i * 3, { w: 6 });
  });
  line(sk, [[660, 428], [760, 440], [900, 430]], 9, C.ink, 19);
  // 스탠드와 그 플러그(뽑힌다)
  box(sk, 96, 470, 120, 22, 8, C.navy, 21);
  line(sk, [[156, 470], [156, 300], [214, 244]], 11, C.navy, 24);
  const shade = poly([[176, 252], [262, 208], [286, 262], [214, 300]], 5);
  sk.fill(shade, C.teal, { dx: 0.8, dy: 1, wob: 0.6, seed: 26, tex: true });
  sk.ink(shade, { w: 9, wob: 0.7, seed: 27 });
  g(sk, S0, () => rays(sk, 262, 296, 26, 92, 5, { color: C.yellow, w: 8, seed: 31, a0: 0.3, a1: 1.5 }));
  g(sk, MV, () => {
    line(sk, [[216, 484], [300, 470], [372, 404]], 8, C.ink, 35);
    box(sk, 352, 376, 40, 40, 8, C.ink, 37, { tex: false });
  });
  // 충전 중인 휴대 전화
  line(sk, [[588, 404], [600, 330], [690, 300]], 8, C.ink, 41);
  box(sk, 568, 380, 40, 36, 8, C.ink, 43, { tex: false });
  box(sk, 690, 196, 120, 200, 16, "#2E3A4E", 45);
  box(sk, 702, 212, 96, 156, 8, "#DFF3E6", 48, { w: 5, tex: false });
  const bolt = poly([[756, 232], [728, 296], [750, 296], [740, 348], [776, 276], [752, 276]], 3);
  sk.fill(bolt, C.green, { dx: 0, dy: 0, wob: 0.3, seed: 51 });
  sk.ink(bolt, { w: 5, wob: 0.3, seed: 52 });
  g(sk, S1, () => emark(sk, 860, 160, 0.6, { seed: 55 }));
  return { sk };
}

/* ══════════ 6. 계량기 (g2u7l6) ══════════ */
export const MT = { cx: 480, cy: 250 };
export function meterBase() {
  const sk = new Sk(W, H, { id: "mt" });
  floor(sk, 508, 3);
  // 계량기
  box(sk, 360, 96, 240, 330, 22, "#E9EDF2", 5);
  box(sk, 392, 124, 176, 60, 8, "#FFFFFF", 8, { w: 6, tex: false });
  for (let i = 0; i < 5; i++) line(sk, [[412 + i * 34, 140], [412 + i * 34, 168]], 6, C.gray, 11 + i, { wob: 0.2 });
  disk(sk, MT.cx, MT.cy, 84, 30, "#C9D2DC", 17, { w: 7 });
  // 원판의 표시(돌아간다)
  g(sk, "opn-g2u7-disc", () => {
    const m = rrect(MT.cx - 14, MT.cy - 8, 28, 16, 4);
    sk.fill(m, C.red, { dx: 0, dy: 0, wob: 0.3, seed: 21 });
  });
  line(sk, [[420, 340], [540, 340]], 6, C.gray, 25);
  line(sk, [[420, 372], [510, 372]], 6, C.gray, 26);
  // 선풍기
  line(sk, [[150, 500], [150, 330]], 11, C.navy, 31);
  box(sk, 96, 488, 108, 20, 8, C.navy, 33);
  disk(sk, 150, 268, 72, 72, "#EEF6FF", 35);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    disk(sk, 150 + Math.cos(a) * 30, 268 + Math.sin(a) * 30, 26, 14, C.blue, 38 + i * 2, { w: 5 });
  }
  g(sk, S1, () => [0, 1, 2].forEach((i) => line(sk, squiggle(244, 232 + i * 36, 70, 9, 2, i, 0), 7, C.blue, 45 + i)));
  // 헤어드라이어
  box(sk, 716, 236, 160, 84, 30, C.orange, 51);
  box(sk, 690, 252, 34, 52, 6, C.ink, 54, { tex: false });
  const grip = poly([[800, 316], [846, 316], [834, 440], [796, 436]], 5);
  sk.fill(grip, C.orange, { dx: 0.8, dy: 1, wob: 0.6, seed: 56, tex: true });
  sk.ink(grip, { w: 9, wob: 0.7, seed: 57 });
  g(sk, S2, () => [0, 1, 2].forEach((i) => line(sk, squiggle(608, 250 + i * 28, 70, 10, 2, i, 0), 8, C.red, 61 + i)));
  return { sk };
}

/* ══════════ 7. 전선과 나침반 (g2u7l7) ══════════ */
export const WR = { cx: 480, cy: 330 };
export function wireBase() {
  const sk = new Sk(W, H, { id: "wr" });
  const { cx, cy } = WR;
  // 나침반
  disk(sk, cx, cy, 128, 128, "#FFFDF4", 5, { w: 12 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    line(sk, [[cx + Math.cos(a) * 102, cy + Math.sin(a) * 102], [cx + Math.cos(a) * 118, cy + Math.sin(a) * 118]], 8, C.ink, 11 + i, { wob: 0.2 });
  }
  // 바늘(위쪽 빨간 끝이 N극, 전류가 흐르면 돈다)
  g(sk, "opn-g2u7-needle", () => {
    const n = poly([[cx, cy - 96], [cx - 20, cy], [cx + 20, cy]], 3);
    const s = poly([[cx, cy + 96], [cx - 20, cy], [cx + 20, cy]], 3);
    sk.fill(n, C.red, { dx: 0, dy: 0, wob: 0.3, seed: 21 });
    sk.fill(s, C.blue, { dx: 0, dy: 0, wob: 0.3, seed: 22 });
    sk.ink(n, { w: 6, wob: 0.3, seed: 23 });
    sk.ink(s, { w: 6, wob: 0.3, seed: 24 });
  });
  disk(sk, cx, cy, 9, 9, C.ink, 27, { w: 4 });
  // 나침반 위를 남북으로 지나는 전선, 전지와 스위치
  line(sk, [[cx, 474], [cx, 120], [300, 70], [200, 70]], 11, C.orange, 31);
  line(sk, [[cx, 474], [cx, 506], [140, 506], [140, 170]], 11, C.orange, 32);
  cell(sk, 100, 96, 80, 74, 41);
  g(sk, S0, () => line(sk, [[200, 70], [164, 40]], 11, C.ink, 45));
  g(sk, S1, () => {
    line(sk, [[200, 70], [150, 96]], 11, C.ink, 47);
    [200, 300].forEach((y, i) => {
      const a = poly([[cx + 34, y], [cx + 22, y + 26], [cx + 46, y + 26]], 3);
      sk.fill(a, C.yellow, { dx: 0, dy: 0, wob: 0.3, seed: 51 + i });
      sk.ink(a, { w: 5, wob: 0.3, seed: 53 + i });
    });
    emark(sk, 700, 170, 0.66, { seed: 57 });
  });
  return { sk };
}

/* ══════════ 8. 전기 자전거의 전동기 (g2u7l8) ══════════ */
export function bikeBase() {
  const sk = new Sk(W, H, { id: "bk" });
  floor(sk, 500, 3);
  const cx = 480, cy = 290;
  // 뒷바퀴와 바퀴살, 차체의 한 토막
  disk(sk, cx, cy, 206, 206, null, 5, { w: 16 });
  disk(sk, cx, cy, 182, 182, null, 7, { w: 5, color: C.gray });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    line(sk, [[cx + Math.cos(a) * 98, cy + Math.sin(a) * 98], [cx + Math.cos(a) * 180, cy + Math.sin(a) * 180]], 4, C.gray, 11 + i, { wob: 0.2 });
  }
  line(sk, [[cx, cy], [760, 170], [900, 150]], 14, C.teal, 25);
  line(sk, [[cx, cy], [800, 330], [920, 330]], 14, C.teal, 26);
  // 전동기: 닫힌 덮개
  g(sk, S0, () => {
    disk(sk, cx, cy, 96, 96, "#B9C4D4", 31, { tex: true });
    disk(sk, cx, cy, 22, 22, C.gray, 34, { w: 6 });
    qmark(sk, cx, cy - 150, 0.66, { color: C.orange, seed: 37 });
  });
  // 전동기 속: 양쪽의 자석(빨강, 파랑)과 가운데 코일
  g(sk, S1, () => {
    disk(sk, cx, cy, 96, 96, "#F6F3EA", 41);
    const l = [...ell(cx, cy, 86, 86, 2.2, 4.08), ...ell(cx, cy, 62, 62, 4.08, 2.2)];
    const r = [...ell(cx, cy, 86, 86, -0.94, 0.94), ...ell(cx, cy, 62, 62, 0.94, -0.94)];
    sk.fill(l, C.red, { dx: 0, dy: 0, wob: 0.4, seed: 44 });
    sk.ink([...l, l[0]], { w: 6, wob: 0.4, seed: 45 });
    sk.fill(r, C.blue, { dx: 0, dy: 0, wob: 0.4, seed: 46 });
    sk.ink([...r, r[0]], { w: 6, wob: 0.4, seed: 47 });
    for (let i = 0; i < 5; i++) sk.ink(rrect(cx - 40 + i * 4, cy - 34 + i * 3, 80 - i * 8, 68 - i * 6, 10), { w: 5, color: C.orange, wob: 0.4, seed: 51 + i });
    emark(sk, cx + 250, 96, 0.62, { seed: 57 });
  });
  return { sk };
}

export function build(add) {
  return {
    comb: add("combBase", combBase()),
    foil: add("foilBase", foilBase()),
    clock: { ...CK, ...add("clockBase", clockBase()) },
    dim: add("dimBase", dimBase()),
    tap: add("tapBase", tapBase()),
    meter: { ...MT, ...add("meterBase", meterBase()) },
    wire: { ...WR, ...add("wireBase", wireBase()) },
    bike: add("bikeBase", bikeBase()),
  };
}
