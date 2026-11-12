// 중2 과학 Ⅰ 도입(opener) 아홉 장면의 그림(손그림 코드 그림). intro-u4.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   rings  (g2u1l1) 윗접시저울과 똑같아 보이는 반지 둘
//   sea    (g2u1l2) 수영장과 소금 호수에 누운 두 사람
//   cocoa  (g2u1l3) 유리컵의 코코아와 설탕
//   fish   (g2u1l4) 연못의 물고기와 해
//   gallium(g2u1l5) 손바닥 위의 갈륨 동전과 철 동전
//   milk   (g2u1l6) 우유 컵과 확대해 본 동그란 창
//   soy    (g2u1l7) 간장과 올리브유를 섞은 병
//   syrup  (g2u1l8) 설탕 시럽 병과 바닥의 흰 알갱이
//   pot    (g2u1l9) 바닷물 냄비와 기울인 뚜껑, 물방울을 받는 컵
// 실행: node qa/sketch/build-intro.mjs g2u1  →  src/ui/introArt.g2u1.generated.ts
import { Sk, C, curve, dense, ell, poly, rrect, squiggle, qmark } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";
import { sun } from "../lib/props.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const floor = (sk, y, sd) => sk.ink(dense([[30, y], [930, y + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: sd });
const SILVER = "#C9D1D9";
const closed = (pts) => [...pts, pts[0]];
// 가로 물결선(수면)
const wave = (x0, x1, y, amp, n) => curve(Array.from({ length: n * 2 + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / (n * 2), y + (i % 2 ? -amp : amp)]), false, 4);

/* ══════════ 1. 똑같아 보이는 반지 둘 (g2u1l1) ══════════ */
export const RG = { ring: [[150, 452], [810, 452]], pan: [[300, 318], [660, 318]], drop: 30 };
function ring(sk, x, y, sd) {
  sk.ink(ell(x, y, 30, 30), { w: 17, color: SILVER, wob: 0.4, seed: sd });
  sk.ink(ell(x, y, 39, 39), { w: 5, wob: 0.5, seed: sd + 1 });
  sk.ink(ell(x, y, 21, 21), { w: 5, wob: 0.5, seed: sd + 2 });
  sk.ink(dense([[x - 26, y - 18], [x - 14, y - 28]]), { w: 5, color: C.white, wob: 0.2, seed: sd + 3 });
}
export function ringsBase() {
  const sk = new Sk(W, H, { id: "rg" });
  floor(sk, 500, 3);
  const base = rrect(410, 462, 140, 36, 10);
  sk.fill(base, C.woodLight, { dx: 0.8, dy: 1, wob: 0.6, seed: 5, tex: true });
  sk.ink(base, { w: 9, wob: 0.8, seed: 6 });
  sk.ink(dense([[480, 462], [480, 176]], 6), { w: 12, wob: 0.6, seed: 7 });
  g(sk, "opn-g2u1-rg-beam", () => {
    sk.ink(dense([[290, 190], [670, 190]], 6), { w: 12, wob: 0.6, seed: 11 });
    [300, 660].forEach((x, i) => {
      sk.ink(dense([[x, 190], [x - 62, 334]], 6), { w: 5, color: C.gray, wob: 0.4, seed: 13 + i });
      sk.ink(dense([[x, 190], [x + 62, 334]], 6), { w: 5, color: C.gray, wob: 0.4, seed: 15 + i });
      const pan = closed(curve([[x - 84, 334], [x - 50, 360], [x + 50, 360], [x + 84, 334]], false, 4));
      sk.fill(pan, "#E8EDF2", { dx: 0, dy: 0, wob: 0.4, seed: 17 + i });
      sk.ink(pan, { w: 8, wob: 0.6, seed: 19 + i });
    });
  });
  sk.fill(ell(480, 190, 15, 15), C.orange, { dx: 0, dy: 0, wob: 0.3, seed: 21 });
  sk.ink(ell(480, 190, 15, 15), { w: 6, wob: 0.4, seed: 22 });
  RG.ring.forEach(([x, y], i) => g(sk, `opn-g2u1-rg-ring r${i + 1}`, () => ring(sk, x, y, 31 + i * 5)));
  g(sk, "opn-g2u1-q", () => qmark(sk, 480, 96, 0.7, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 2. 수영장과 소금 호수 (g2u1l2) ══════════ */
export const SE = { hit: [[40, 150, 410, 360], [510, 150, 410, 360]], sink: 64 };
export function seaBase() {
  const sk = new Sk(W, H, { id: "se" });
  [[40, "#A9D8F2", C.blue], [510, "#9ADBC9", C.teal]].forEach(([x, fill, line], i) => {
    const pool = rrect(x, 290, 410, 220, 16);
    sk.fill(pool, fill, { dx: 0, dy: 0, wob: 0.5, seed: 5 + i, tex: 0.5 });
    sk.ink(dense([[x, 290], [x, 500], [x + 410, 500], [x + 410, 290]], 6), { w: 10, wob: 0.8, seed: 7 + i });
    sk.ink(wave(x + 8, x + 402, 292, 4, 5), { w: 7, color: line, wob: 0.4, seed: 9 + i });
  });
  // 수영장의 사다리, 소금 호수 가장자리의 소금 덩이
  sk.ink(dense([[70, 230], [70, 330]], 6), { w: 8, color: C.gray, wob: 0.4, seed: 11 });
  sk.ink(dense([[104, 230], [104, 330]], 6), { w: 8, color: C.gray, wob: 0.4, seed: 12 });
  [256, 286, 316].forEach((y, i) => sk.ink(dense([[70, y], [104, y]]), { w: 6, color: C.gray, wob: 0.3, seed: 13 + i }));
  [[530, 280, 30], [888, 276, 36], [846, 286, 22], [574, 286, 20]].forEach(([x, y, r], i) => {
    const lump = closed(curve([[x - r, y + 10], [x - r * 0.6, y - r * 0.7], [x, y - r], [x + r * 0.7, y - r * 0.6], [x + r, y + 10]], false, 3));
    sk.fill(lump, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 21 + i });
    sk.ink(lump, { w: 6, color: C.gray, wob: 0.5, seed: 25 + i });
  });
  // 누운 두 사람(앱이 아래로 내린다). 누운 자세는 사람을 90도 돌려 그린다.
  [[245, 31], [715, 71]].forEach(([x, sd], i) => {
    g(sk, `opn-g2u1-se-man m${i + 1}`, () => {
      sk.at(x - 150, 262, 0.52, () => drawFigure(sk, 0, 0, 1, pose({ haL: [-70, -250], haR: [70, -250], elL: [-52, -300], elR: [52, -300] }), i ? { hair: "knit", capColor: "#3F7CC0", seed: sd } : { ...STUDENT }), Math.PI / 2);
    });
  });
  g(sk, "opn-g2u1-q", () => qmark(sk, 480, 110, 0.7, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 3. 코코아와 설탕 (g2u1l3) ══════════ */
export const CC = { spoons: 6, limit: 4 };
export function cocoaBase() {
  const sk = new Sk(W, H, { id: "cc" });
  floor(sk, 500, 3);
  const liquid = poly([[352, 220], [608, 220], [590, 480], [370, 480]], 6);
  sk.fill(liquid, "#B9783F", { dx: 0, dy: 0, wob: 0.5, seed: 5, tex: 0.6 });
  // 바닥에 쌓이는 설탕(다섯째, 여섯째 숟갈)
  [[480, 462, 70, 16], [480, 448, 96, 28]].forEach(([x, y, rx, ry], i) => {
    g(sk, `opn-g2u1-cc-pile p${i + 1}`, () => {
      const pile = closed(curve([[x - rx, 478], [x - rx * 0.5, 478 - ry], [x, 478 - ry * 1.3], [x + rx * 0.5, 478 - ry], [x + rx, 478]], false, 3));
      sk.fill(pile, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 11 + i });
      sk.ink(pile, { w: 6, color: C.gray, wob: 0.5, seed: 13 + i });
    });
  });
  const cup = dense([[330, 150], [366, 490], [594, 490], [630, 150]], 6);
  sk.ink(cup, { w: 11, wob: 0.8, seed: 15 });
  sk.ink(dense([[352, 220], [608, 220]], 6), { w: 7, color: "#8A5526", wob: 0.6, seed: 16 });
  sk.ink(dense([[352, 180], [360, 250]]), { w: 6, color: C.white, wob: 0.3, seed: 17 });
  // 숟가락과 떨어지는 설탕(앱이 넣을 때마다 떨어뜨린다)
  g(sk, "opn-g2u1-cc-spoon", () => {
    sk.ink(dense([[700, 60], [560, 130]], 6), { w: 10, color: C.gray, wob: 0.5, seed: 21 });
    const bowl = ell(530, 142, 40, 18);
    sk.fill(bowl, "#E8EDF2", { dx: 0, dy: 0, wob: 0.3, seed: 22 });
    sk.ink(bowl, { w: 7, wob: 0.5, seed: 23 });
  });
  g(sk, "opn-g2u1-cc-fall", () => {
    [[470, 190], [492, 176], [512, 196], [484, 214], [504, 226], [462, 222]].forEach(([x, y], i) => {
      sk.fill(rrect(x - 7, y - 7, 14, 14, 3), C.white, { dx: 0, dy: 0, wob: 0.2, seed: 31 + i });
      sk.ink(rrect(x - 7, y - 7, 14, 14, 3), { w: 4, color: C.gray, wob: 0.2, seed: 41 + i });
    });
  });
  g(sk, "opn-g2u1-q", () => qmark(sk, 790, 300, 0.8, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 4. 한여름 연못의 물고기 (g2u1l4) ══════════ */
export const FS = { rise: 118, sunUp: 150 };
function fish(sk, x, y, s, color, sd) {
  const body = closed(curve([[x - 46 * s, y], [x - 10 * s, y - 22 * s], [x + 34 * s, y - 12 * s], [x + 50 * s, y], [x + 34 * s, y + 12 * s], [x - 10 * s, y + 22 * s]], false, 3));
  sk.fill(body, color, { dx: 0, dy: 0, wob: 0.4, seed: sd });
  sk.ink(body, { w: 7, wob: 0.6, seed: sd + 1 });
  sk.ink(dense([[x - 46 * s, y], [x - 74 * s, y - 20 * s], [x - 74 * s, y + 20 * s], [x - 46 * s, y]], 4), { w: 7, wob: 0.5, seed: sd + 2 });
  sk.fill(ell(x + 30 * s, y - 4 * s, 4, 4), C.ink, { dx: 0, dy: 0, wob: 0, seed: sd + 3 });
}
export function fishBase() {
  const sk = new Sk(W, H, { id: "fs" });
  g(sk, "opn-g2u1-fs-sun", () => sun(sk, 800, 250, 52, { seed: 3 }));
  const water = rrect(40, 250, 880, 264, 18);
  sk.fill(water, "#A9D8F2", { dx: 0, dy: 0, wob: 0.5, seed: 5, tex: 0.5 });
  sk.ink(wave(48, 912, 252, 5, 8), { w: 8, color: C.blue, wob: 0.5, seed: 6 });
  const bed = closed(curve([[40, 514], [40, 484], [200, 470], [420, 492], [640, 468], [920, 486], [920, 514]], false, 4));
  sk.fill(bed, C.woodLight, { dx: 0, dy: 0, wob: 0.5, seed: 7, tex: true });
  sk.ink(curve([[40, 484], [200, 470], [420, 492], [640, 468], [920, 486]], false, 4), { w: 8, color: C.woodDark, wob: 0.6, seed: 8 });
  [[250, 432, 1, C.orange], [470, 446, 0.85, C.yellow], [680, 428, 0.95, C.red]].forEach(([x, y, s, col], i) => {
    g(sk, `opn-g2u1-fs-fish f${i + 1}`, () => {
      fish(sk, x, y, s, col, 21 + i * 5);
      g(sk, "opn-g2u1-fs-gulp", () => {
        sk.ink(ell(x + 66 * s, y - 20, 7, 7), { w: 4, color: C.blue, wob: 0.2, seed: 41 + i });
        sk.ink(ell(x + 80 * s, y - 40, 5, 5), { w: 4, color: C.blue, wob: 0.2, seed: 44 + i });
      });
    });
  });
  g(sk, "opn-g2u1-q", () => qmark(sk, 150, 150, 0.7, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 5. 손바닥 위의 갈륨 동전 (g2u1l5) ══════════ */
export const GA = { coin: [360, 300], iron: [600, 300] };
export function galliumBase() {
  const sk = new Sk(W, H, { id: "ga" });
  // 손바닥(위에서 본 모양): 손목, 손바닥, 손가락 넷과 엄지
  const palm = closed(curve([[250, 500], [230, 380], [240, 250], [330, 200], [640, 200], [730, 250], [740, 380], [720, 500]], false, 4));
  sk.fill(palm, C.skin, { dx: 0, dy: 0, wob: 0.6, seed: 5, tex: 0.5 });
  sk.ink(curve([[250, 500], [230, 380], [240, 250], [330, 200], [640, 200], [730, 250], [740, 380], [720, 500]], false, 4), { w: 10, wob: 0.8, seed: 6 });
  [[330, 0], [430, -22], [530, -22], [630, 0]].forEach(([x, dy], i) => {
    const fg = rrect(x - 36, 60 + dy, 72, 170, 34);
    sk.fill(fg, C.skin, { dx: 0, dy: 0, wob: 0.5, seed: 11 + i });
    sk.ink(dense([[x - 36, 214], [x - 36, 96 + dy]], 6), { w: 9, wob: 0.6, seed: 15 + i });
    sk.ink(curve([[x - 36, 96 + dy], [x - 30, 66 + dy], [x, 58 + dy], [x + 30, 66 + dy], [x + 36, 96 + dy]], false, 3), { w: 9, wob: 0.6, seed: 19 + i });
    sk.ink(dense([[x + 36, 96 + dy], [x + 36, 214]], 6), { w: 9, wob: 0.6, seed: 23 + i });
  });
  const thumb = closed(curve([[740, 330], [800, 250], [850, 190], [880, 210], [850, 290], [760, 400]], false, 3));
  sk.fill(thumb, C.skin, { dx: 0, dy: 0, wob: 0.5, seed: 27 });
  sk.ink(curve([[740, 320], [800, 250], [850, 190], [880, 210], [850, 290], [750, 410]], false, 3), { w: 9, wob: 0.6, seed: 28 });
  sk.ink(curve([[300, 330], [420, 380], [560, 370], [660, 320]], false, 4), { w: 5, color: "#D9A98A", wob: 0.6, seed: 29 });
  // 녹아 퍼진 갈륨(앱이 키운다)
  g(sk, "opn-g2u1-ga-pool", () => {
    const pool = curve([[270, 306], [300, 262], [370, 250], [440, 268], [462, 310], [430, 346], [352, 356], [290, 340]], true, 3);
    sk.fill(pool, SILVER, { dx: 0, dy: 0, wob: 0.5, seed: 31 });
    sk.ink(pool, { w: 7, wob: 0.6, seed: 32 });
    sk.ink(curve([[300, 290], [330, 272], [370, 268]]), { w: 6, color: C.white, wob: 0.3, seed: 33 });
  });
  // 갈륨 동전(앱이 줄인다)과 철 동전(그대로)
  [[GA.coin, "opn-g2u1-ga-coin", 41], [GA.iron, "opn-g2u1-ga-iron", 51]].forEach(([[x, y], cls, sd]) => {
    g(sk, cls, () => {
      sk.fill(ell(x, y, 54, 54), SILVER, { dx: 0, dy: 0, wob: 0.4, seed: sd });
      sk.ink(ell(x, y, 54, 54), { w: 9, wob: 0.6, seed: sd + 1 });
      sk.ink(ell(x, y, 40, 40), { w: 4, color: C.gray, wob: 0.4, seed: sd + 2 });
      sk.ink(dense([[x - 30, y - 22], [x - 14, y - 34]]), { w: 6, color: C.white, wob: 0.2, seed: sd + 3 });
    });
  });
  g(sk, "opn-g2u1-q", () => qmark(sk, 480, 470, 0.6, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 6. 우유 컵과 확대 창 (g2u1l6) ══════════ */
export const MK = { lens: [640, 250, 190] };
export function milkBase() {
  const sk = new Sk(W, H, { id: "mk" });
  floor(sk, 500, 3);
  const milk = poly([[140, 230], [330, 230], [316, 488], [154, 488]], 6);
  sk.fill(milk, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 5 });
  sk.ink(dense([[122, 150], [150, 494], [320, 494], [348, 150]], 6), { w: 11, wob: 0.8, seed: 6 });
  sk.ink(dense([[140, 230], [330, 230]], 6), { w: 7, color: C.gray, wob: 0.6, seed: 7 });
  // 확대해 보는 곳을 가리키는 작은 네모와 이어지는 선
  sk.ink(rrect(216, 330, 44, 44, 6), { w: 6, color: C.orange, wob: 0.4, seed: 9 });
  g(sk, "opn-g2u1-mk-lens", () => {
    const [x, y, r] = MK.lens;
    sk.ink(dense([[260, 336], [x - r * 0.72, y - r * 0.7]], 6), { w: 5, color: C.orange, wob: 0.4, seed: 11, dash: [14, 12] });
    sk.ink(dense([[260, 370], [x - r * 0.72, y + r * 0.7]], 6), { w: 5, color: C.orange, wob: 0.4, seed: 12, dash: [14, 12] });
    sk.fill(ell(x, y, r, r), "#EAF4FB", { dx: 0, dy: 0, wob: 0.4, seed: 13 });
    // 기름방울(큰 노란 방울)과 작은 알갱이들
    [[-80, -60, 40], [60, -90, 30], [90, 40, 46], [-40, 70, 34], [-110, 30, 22], [10, -10, 26]].forEach(([dx, dy, rr], i) => {
      sk.fill(ell(x + dx, y + dy, rr, rr), C.lemon, { dx: 0, dy: 0, wob: 0.3, seed: 21 + i });
      sk.ink(ell(x + dx, y + dy, rr, rr), { w: 6, color: C.gold, wob: 0.4, seed: 31 + i });
    });
    [[-20, -110], [120, -30], [30, 110], [-130, -20], [70, -30], [-70, 130], [140, 100], [-10, 60]].forEach(([dx, dy], i) => sk.fill(ell(x + dx, y + dy, 8, 8), C.teal, { dx: 0, dy: 0, wob: 0.2, seed: 41 + i }));
    sk.ink(ell(x, y, r, r), { w: 12, wob: 0.7, seed: 51 });
    sk.ink(dense([[x + r * 0.7, y + r * 0.72], [x + r * 1.2, y + r * 1.28]], 6), { w: 20, color: C.woodDark, wob: 0.5, seed: 52 });
  });
  g(sk, "opn-g2u1-q", () => qmark(sk, 240, 96, 0.7, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 7. 간장과 올리브유 (g2u1l7) ══════════ */
export const SY = { split: 330 };
const bottleInk = (sk, sd) => {
  sk.ink(dense([[440, 60], [440, 130]], 6), { w: 10, wob: 0.5, seed: sd });
  sk.ink(dense([[520, 60], [520, 130]], 6), { w: 10, wob: 0.5, seed: sd + 1 });
  sk.ink(curve([[440, 130], [380, 170], [360, 230]], false, 3), { w: 10, wob: 0.6, seed: sd + 2 });
  sk.ink(curve([[520, 130], [580, 170], [600, 230]], false, 3), { w: 10, wob: 0.6, seed: sd + 3 });
  sk.ink(dense([[360, 230], [360, 480], [600, 480], [600, 230]], 6), { w: 11, wob: 0.8, seed: sd + 4 });
  sk.fill(rrect(430, 30, 100, 34, 8), C.woodDark, { dx: 0, dy: 0, wob: 0.3, seed: sd + 5 });
  sk.ink(rrect(430, 30, 100, 34, 8), { w: 8, wob: 0.5, seed: sd + 6 });
};
export function soyBase() {
  const sk = new Sk(W, H, { id: "sy" });
  floor(sk, 500, 3);
  // 나뉜 뒤: 위는 올리브유, 아래는 간장
  g(sk, "opn-g2u1-sy-split", () => {
    sk.fill(rrect(366, 200, 228, SY.split - 200, 4), "#F2D24B", { dx: 0, dy: 0, wob: 0.3, seed: 5 });
    sk.fill(rrect(366, SY.split, 228, 474 - SY.split, 4), "#5A3219", { dx: 0, dy: 0, wob: 0.3, seed: 6 });
    sk.ink(dense([[366, SY.split], [594, SY.split]], 6), { w: 6, wob: 0.5, seed: 7 });
  });
  // 섞인 때: 탁한 갈색 바탕에 기름방울(앱이 서서히 지운다)
  g(sk, "opn-g2u1-sy-mix", () => {
    sk.fill(rrect(366, 200, 228, 274, 4), "#A9783C", { dx: 0, dy: 0, wob: 0.3, seed: 11, tex: 0.6 });
    [[410, 250, 18], [520, 240, 22], [460, 310, 16], [550, 330, 20], [400, 380, 22], [490, 400, 18], [560, 430, 14], [430, 440, 14]].forEach(([x, y, r], i) => {
      sk.fill(ell(x, y, r, r), "#F2D24B", { dx: 0, dy: 0, wob: 0.3, seed: 21 + i });
      sk.ink(ell(x, y, r, r), { w: 5, color: C.gold, wob: 0.3, seed: 31 + i });
    });
  });
  bottleInk(sk, 41);
  sk.ink(dense([[384, 250], [384, 420]], 6), { w: 7, color: C.white, wob: 0.3, seed: 49, alpha: 0.7 });
  g(sk, "opn-g2u1-q", () => qmark(sk, 760, 260, 0.8, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 8. 냉장고 속 설탕 시럽 (g2u1l8) ══════════ */
export function syrupBase() {
  const sk = new Sk(W, H, { id: "sr" });
  floor(sk, 500, 3);
  sk.fill(rrect(366, 200, 228, 274, 4), "#F6D98B", { dx: 0, dy: 0, wob: 0.3, seed: 5, tex: 0.4 });
  // 바닥의 흰 알갱이(앱이 키운다)
  g(sk, "opn-g2u1-sr-xtal", () => {
    [[390, 452], [420, 440], [452, 456], [484, 442], [516, 454], [548, 440], [574, 456], [436, 462], [500, 464], [560, 464], [404, 466]].forEach(([x, y], i) => {
      const c = poly([[x - 12, y + 8], [x - 4, y - 12], [x + 10, y - 8], [x + 14, y + 8]], 4);
      sk.fill(c, C.white, { dx: 0, dy: 0, wob: 0.2, seed: 11 + i });
      sk.ink(c, { w: 4, color: C.gray, wob: 0.3, seed: 31 + i });
    });
  });
  bottleInk(sk, 61);
  // 차가움을 알리는 눈 결정 기호(앱이 보이게 한다)
  g(sk, "opn-g2u1-sr-cold", () => {
    [[230, 200, 44], [730, 170, 36], [760, 380, 46], [200, 400, 34]].forEach(([x, y, r], i) => {
      for (let k = 0; k < 3; k++) {
        const a = (Math.PI / 3) * k;
        sk.ink(dense([[x - r * Math.cos(a), y - r * Math.sin(a)], [x + r * Math.cos(a), y + r * Math.sin(a)]], 6), { w: 7, color: C.blue, wob: 0.3, seed: 71 + i * 3 + k });
      }
    });
  });
  g(sk, "opn-g2u1-q", () => qmark(sk, 760, 96, 0.7, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 9. 바닷물 끓이기 (g2u1l9) ══════════ */
export function potBase() {
  const sk = new Sk(W, H, { id: "pt" });
  floor(sk, 508, 3);
  const burner = rrect(200, 452, 320, 54, 12);
  sk.fill(burner, "#5B6470", { dx: 0.8, dy: 1, wob: 0.6, seed: 5, tex: true });
  sk.ink(burner, { w: 9, wob: 0.8, seed: 6 });
  g(sk, "opn-g2u1-pt-flame", () => {
    [[300, 0.8], [360, 1], [420, 0.8]].forEach(([x, k], i) => {
      const fl = curve([[x - 20, 452], [x - 14, 452 - 30 * k], [x, 452 - 58 * k], [x + 14, 452 - 30 * k], [x + 20, 452]], false, 3);
      sk.fill(closed(fl), i === 1 ? C.orange : C.yellow, { dx: 0, dy: 0, wob: 0.4, seed: 11 + i });
      sk.ink(fl, { w: 7, color: C.red, wob: 0.5, seed: 14 + i });
    });
  });
  const pot = rrect(220, 262, 280, 140, 18);
  sk.fill(pot, "#C3CED9", { dx: 0.8, dy: 1, wob: 0.7, seed: 21, tex: true });
  sk.fill(rrect(232, 290, 256, 100, 12), "#9FD3EE", { dx: 0, dy: 0, wob: 0.4, seed: 22 });
  sk.ink(pot, { w: 10, wob: 0.9, seed: 23 });
  sk.ink(dense([[232, 290], [488, 290]], 6), { w: 7, color: C.blue, wob: 0.7, seed: 24 });
  g(sk, "opn-g2u1-pt-steam", () => {
    [280, 350, 420].forEach((x, i) => sk.ink(squiggle(x, 200, 70, 12, 1.5, i * 1.3), { w: 8, color: C.gray, wob: 0.4, seed: 31 + i }));
  });
  // 기울인 유리 뚜껑(냄비 위에서 오른쪽 컵 쪽으로 내려간다)
  sk.ink(dense([[200, 150], [640, 236]], 6), { w: 13, color: C.blue, wob: 0.6, seed: 41 });
  sk.fill(ell(420, 172, 16, 12), C.ink, { dx: 0, dy: 0, wob: 0.2, seed: 42 });
  // 뚜껑 안쪽에 맺혀 흘러내리는 물방울과 컵에 고인 물(앱이 보이게 한다)
  g(sk, "opn-g2u1-pt-drops", () => {
    [[300, 186], [380, 202], [460, 218], [540, 234], [612, 248]].forEach(([x, y], i) => {
      const d = closed(curve([[x, y - 4], [x + 9, y + 12], [x, y + 22], [x - 9, y + 12]], false, 3));
      sk.fill(d, "#9FD3EE", { dx: 0, dy: 0, wob: 0.2, seed: 51 + i });
      sk.ink(d, { w: 4, color: C.blue, wob: 0.3, seed: 56 + i });
    });
  });
  g(sk, "opn-g2u1-pt-got", () => {
    sk.fill(rrect(630, 420, 116, 66, 6), "#9FD3EE", { dx: 0, dy: 0, wob: 0.3, seed: 61 });
    const d = closed(curve([[660, 300], [670, 320], [660, 332], [650, 320]], false, 3));
    sk.fill(d, "#9FD3EE", { dx: 0, dy: 0, wob: 0.2, seed: 62 });
    sk.ink(d, { w: 4, color: C.blue, wob: 0.3, seed: 63 });
  });
  sk.ink(dense([[616, 360], [630, 494], [746, 494], [760, 360]], 6), { w: 10, wob: 0.7, seed: 71 });
  g(sk, "opn-g2u1-q", () => qmark(sk, 840, 250, 0.8, { color: C.orange, seed: 45 }));
  return { sk };
}

export function build(add) {
  return {
    rings: { ...RG, ...add("ringsBase", ringsBase()) },
    sea: { ...SE, ...add("seaBase", seaBase()) },
    cocoa: { ...CC, ...add("cocoaBase", cocoaBase()) },
    fish: { ...FS, ...add("fishBase", fishBase()) },
    gallium: { ...GA, ...add("galliumBase", galliumBase()) },
    milk: { ...MK, ...add("milkBase", milkBase()) },
    soy: { ...SY, ...add("soyBase", soyBase()) },
    syrup: { ...add("syrupBase", syrupBase()) },
    pot: { ...add("potBase", potBase()) },
  };
}
