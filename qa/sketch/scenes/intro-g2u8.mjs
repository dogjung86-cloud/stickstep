// 중2 과학 Ⅷ 별과 우주: 도입(opener) 일곱 장면의 그림(손그림 코드 그림). intro-u4.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 조작으로 바뀌는 부분은 <g class>로 묶고 앱의 CSS가 보이고 감춘다.
//   묶음 이름: opn-g2u8-s0(조작 전에만 보인다) · -s1(조작 뒤에 보인다) · -mv(조작하면 움직인다) · -far(조금만 움직인다)
//   tree  (g2u8l1) 먼 학교와 가까운 나무(걸어가며 보면 나무가 학교의 반대쪽으로 옮겨 간다)
//   lamps (g2u8l2) 길을 따라 선 똑같은 가로등 넷(켜면 먼 것일수록 빛이 작다)
//   rank  (g2u8l3) 밤하늘의 밝기 다른 별 다섯(줄 세우면 밝은 별부터, 아래에 눈금 표시)
//   lava  (g2u8l4) 화산과 흘러내리는 용암(분화구 쪽은 노랗고 멀수록 검붉다)
//   band  (g2u8l5) 밤하늘의 뿌연 띠와 망원경(들여다보면 수많은 별)
//   dark  (g2u8l6) 별이 빽빽한 하늘의 검은 얼룩(걷으면 뒤에 별이 있다)
//   thermo(g2u8l8) 이마에 대지 않는 온도계(같은 장치가 별을 향한다)
// g2u8l7은 만화로 시작하므로 도입 그림이 없다.
// 실행: node qa/sketch/build-intro.mjs g2u8  →  src/ui/introArt.g2u8.generated.ts
import { Sk, C, curve, dense, ell, rrect, emark, qmark, hash } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const S0 = "opn-g2u8-s0", S1 = "opn-g2u8-s1", MV = "opn-g2u8-mv", FAR = "opn-g2u8-far";
const NIGHT = "#22305C";
const floor = (sk, y, sd) => sk.ink(dense([[30, y], [930, y + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: sd });
const box = (sk, x, y, w, h, r, fill, sd, o = {}) => {
  const p = rrect(x, y, w, h, r);
  if (fill) sk.fill(p, fill, { dx: 0.8, dy: 1, wob: 0.7, seed: sd, tex: o.tex ?? true });
  if (o.ink !== false) sk.ink(p, { w: o.w ?? 9, wob: 0.8, seed: sd + 1, color: o.color });
};
const disk = (sk, x, y, rx, ry, fill, sd, o = {}) => {
  const p = ell(x, y, rx, ry);
  if (fill) sk.fill(p, fill, { dx: 0.6, dy: 0.8, wob: 0.6, seed: sd, tex: o.tex ?? false });
  if (o.ink !== false) sk.ink(p, { w: o.w ?? 9, wob: 0.7, seed: sd + 1, color: o.color });
};
const line = (sk, pts, w, color, sd, o = {}) => sk.ink(pts.length > 2 ? curve(pts) : dense(pts), { w, color, wob: o.wob ?? 0.6, seed: sd, dash: o.dash });
/** 밤하늘 판(위쪽 띠). */
const sky = (sk, y, h, sd) => box(sk, 40, y, 880, h, 26, NIGHT, sd, { ink: false, tex: false });
/** 별 하나(외곽선 없는 점). */
const star = (sk, x, y, r, sd, color = "#FFF3C4") => sk.fill(ell(x, y, r, r), color, { dx: 0, dy: 0, wob: 0.3, seed: sd });
/** 잔별 뿌리기. */
const dots = (sk, x, y, w, h, n, sd, r0 = 2.2, r1 = 3.2) => { for (let i = 0; i < n; i++) star(sk, x + hash(sd + i * 3.1) * w, y + hash(sd + i * 7.7) * h, r0 + hash(sd + i) * r1, sd + i); };

/* ══════════ 1. 걸어가며 본 나무 (g2u8l1) ══════════ */
export function treeBase() {
  const sk = new Sk(W, H, { id: "tr" });
  floor(sk, 470, 3);
  // 먼 학교(작게)
  g(sk, FAR, () => {
    box(sk, 380, 250, 220, 130, 6, "#F3E4C8", 11, { w: 7 });
    box(sk, 462, 214, 56, 40, 4, C.woodLight, 14, { w: 6 });
    for (let i = 0; i < 4; i++) box(sk, 402 + i * 50, 276, 28, 28, 3, C.sea, 17 + i * 2, { w: 5, tex: false });
    box(sk, 474, 330, 34, 50, 3, C.woodDark, 27, { w: 5 });
    line(sk, [[490, 214], [490, 178]], 5, C.ink, 29);
    sk.fill(dense([[490, 178], [524, 188], [490, 198], [490, 178]], 3), C.red, { dx: 0, dy: 0, wob: 0.3, seed: 30 });
  });
  // 가까운 나무(크게). 처음에는 학교의 오른쪽
  g(sk, MV, () => {
    box(sk, 700, 250, 44, 226, 8, C.woodDark, 41);
    disk(sk, 722, 190, 118, 104, C.green, 44, { tex: true });
    disk(sk, 660, 236, 60, 50, C.green, 47, { tex: true, ink: false });
    disk(sk, 790, 236, 60, 50, C.green, 49, { tex: true, ink: false });
  });
  qmark(sk, 150, 150, 0.7, { color: C.orange, seed: 55 });
  return { sk };
}

/* ══════════ 2. 길 따라 선 가로등 (g2u8l2) ══════════ */
export function lampsBase() {
  const sk = new Sk(W, H, { id: "lp" });
  sky(sk, 24, 420, 3);
  // 길(멀어질수록 좁아진다)
  sk.fill(dense([[80, 520], [560, 520], [760, 250], [720, 250], [80, 520]], 6), "#C9CED6", { dx: 0, dy: 0, wob: 0.6, seed: 5 });
  const lamps = [[230, 500, 1], [470, 410, 0.62], [610, 344, 0.4], [690, 300, 0.26]];
  lamps.forEach(([x, y, s], i) => {
    line(sk, [[x, y], [x, y - 300 * s]], 12 * s + 3, "#5A6474", 21 + i * 5);
    box(sk, x - 44 * s, y - 318 * s, 88 * s, 26 * s, 6 * s, "#3F4756", 23 + i * 5, { w: 4 + 4 * s, tex: false });
    g(sk, S0, () => disk(sk, x, y - 284 * s, 26 * s, 18 * s, "#9AA3B2", 24 + i * 5, { w: 3 + 4 * s }));
    // 켠 불빛: 먼 것일수록 훨씬 작고 흐리다
    g(sk, S1, () => {
      const r = [150, 66, 30, 13][i];
      disk(sk, x, y - 284 * s, r, r, ["#FFE27A", "#D9C47E", "#A9A07C", "#7C7B74"][i], 31 + i * 5, { ink: false });
      disk(sk, x, y - 284 * s, 26 * s, 18 * s, "#FFFBE0", 33 + i * 5, { w: 3 + 4 * s, color: C.gold });
    });
  });
  return { sk };
}

/* ══════════ 3. 별 줄 세우기 (g2u8l3) ══════════ */
export function rankBase() {
  const sk = new Sk(W, H, { id: "rk" });
  sky(sk, 24, 470, 3);
  const R = [44, 31, 22, 15, 10];
  // 흩어진 별
  const at = [[620, 150], [250, 330], [460, 250], [780, 360], [170, 130]];
  g(sk, S0, () => R.forEach((r, i) => {
    star(sk, at[i][0], at[i][1], r, 11 + i);
    star(sk, at[i][0], at[i][1], r * 0.5, 17 + i, "#FFFFFF");
  }));
  // 밝은 차례로 선 별과 그 아래의 눈금(하나, 둘, 셋…)
  g(sk, S1, () => {
    R.forEach((r, i) => {
      const x = 180 + i * 150;
      star(sk, x, 210, r, 31 + i);
      star(sk, x, 210, r * 0.5, 37 + i, "#FFFFFF");
      for (let k = 0; k <= i; k++) line(sk, [[x - i * 9 + k * 18, 318], [x - i * 9 + k * 18, 356]], 7, "#FFFFFF", 41 + i * 7 + k, { wob: 0.3 });
    });
    line(sk, [[120, 286], [840, 286]], 5, "#8FA3D8", 77, { wob: 0.4 });
    emark(sk, 866, 110, 0.6, { color: C.lemon, seed: 79 });
  });
  dots(sk, 70, 50, 820, 60, 16, 91, 1.6, 1.6);
  dots(sk, 70, 410, 820, 60, 16, 131, 1.6, 1.6);
  return { sk };
}

/* ══════════ 4. 흘러내리는 용암 (g2u8l4) ══════════ */
export function lavaBase() {
  const sk = new Sk(W, H, { id: "lv" });
  floor(sk, 500, 3);
  // 화산
  const cone = dense([[60, 500], [250, 170], [330, 170], [520, 500], [60, 500]], 6);
  sk.fill(cone, "#8B7B70", { dx: 0.8, dy: 1, wob: 0.8, seed: 11, tex: true });
  sk.ink(cone, { w: 9, wob: 0.9, seed: 12 });
  disk(sk, 290, 172, 44, 14, "#5C4E46", 15, { w: 7 });
  g(sk, S0, () => qmark(sk, 700, 300, 0.8, { color: C.orange, seed: 19 }));
  // 용암: 분화구에서 오른쪽 아래로. 가까울수록 노랗고 멀수록 검붉다
  g(sk, S1, () => {
    const path = [[300, 176], [380, 260], [470, 370], [560, 446], [680, 478], [800, 486], [900, 488]];
    const cols = ["#FFE45C", "#FFB52E", "#F5822A", "#E0503A", "#A83228", "#6E2A26"];
    for (let i = 0; i < 6; i++) line(sk, [path[i], path[i + 1]], 46 - i * 3, cols[i], 31 + i, { wob: 1 });
    disk(sk, 290, 172, 38, 11, "#FFE45C", 41, { w: 5, color: C.orange });
    emark(sk, 760, 330, 0.66, { seed: 45 });
  });
  return { sk };
}

/* ══════════ 5. 은하수와 망원경 (g2u8l5) ══════════ */
export function bandBase() {
  const sk = new Sk(W, H, { id: "bd" });
  sky(sk, 24, 380, 3);
  dots(sk, 70, 44, 820, 340, 30, 7, 1.6, 2);
  // 뿌연 띠(왼쪽 아래에서 오른쪽 위로)
  g(sk, S0, () => {
    const band = curve([[90, 350], [330, 250], [600, 150], [880, 70], [880, 150], [620, 240], [350, 340], [110, 400]], true, 6);
    sk.fill(band, "#C9D3EE", { dx: 0, dy: 0, wob: 2.4, seed: 21 });
  });
  // 망원경으로 본 띠: 같은 자리에 수많은 별
  g(sk, S1, () => {
    for (let i = 0; i < 150; i++) {
      const t = hash(300 + i * 1.7), off = (hash(500 + i * 2.3) - 0.5) * 2;
      const x = 100 + t * 780, y = 370 - t * 270 + off * 42 * (0.6 + Math.sin(t * Math.PI) * 0.7);
      star(sk, x, y, 2.4 + hash(i) * 3.4, 600 + i);
    }
    emark(sk, 140, 110, 0.6, { color: C.lemon, seed: 81 });
  });
  // 학생과 망원경
  floor(sk, 524, 4);
  drawFigure(sk, 250, 540, 0.3, pose({ elR: [70, -300], haR: [130, -360] }), { ...STUDENT, seed: 91 });
  g(sk, MV, () => {
    line(sk, [[310, 470], [420, 392]], 26, "#5A6474", 95);
    line(sk, [[352, 444], [330, 524]], 7, C.ink, 97);
    line(sk, [[352, 444], [392, 524]], 7, C.ink, 98);
  });
  return { sk };
}

/* ══════════ 6. 별밭의 검은 얼룩 (g2u8l6) ══════════ */
export function darkBase() {
  const sk = new Sk(W, H, { id: "dk" });
  sky(sk, 24, 496, 3);
  dots(sk, 70, 44, 820, 456, 170, 11, 2, 3.4);
  // 얼룩(가스와 티끌의 구름). 조작하면 흐려져 뒤의 별이 비친다
  g(sk, MV, () => {
    const blob = curve([[330, 300], [370, 190], [480, 150], [600, 180], [650, 270], [610, 370], [500, 410], [390, 390]], true, 5);
    sk.fill(blob, "#0C1226", { dx: 0, dy: 0, wob: 3, seed: 41 });
    sk.ink(blob, { w: 5, color: "#3B4A7A", wob: 2.4, seed: 42 });
  });
  g(sk, S0, () => qmark(sk, 490, 280, 0.8, { color: "#FFFFFF", seed: 47 }));
  g(sk, S1, () => emark(sk, 760, 120, 0.62, { color: C.lemon, seed: 49 }));
  return { sk };
}

/* ══════════ 7. 닿지 않는 온도계 (g2u8l8) ══════════ */
export function thermoBase() {
  const sk = new Sk(W, H, { id: "th" });
  floor(sk, 516, 3);
  // 온도계(권총 모양): 몸통, 손잡이, 앞의 렌즈
  const gun = (x, y, sd) => {
    box(sk, x, y, 190, 70, 18, "#E5E9EF", sd);
    box(sk, x + 110, y + 60, 54, 110, 12, "#C9D1DC", sd + 3);
    disk(sk, x, y + 35, 16, 26, C.navy, sd + 6, { w: 7 });
    box(sk, x + 120, y + 14, 50, 34, 6, C.teal, sd + 9, { w: 5, tex: false });
  };
  // 이마를 재는 장면
  g(sk, S0, () => {
    drawFigure(sk, 260, 560, 0.62, pose(), { ...STUDENT, seed: 31 });
    gun(520, 196, 41);
    for (let i = 0; i < 3; i++) line(sk, [[500 - i * 44, 232], [476 - i * 44, 232]], 8, C.red, 51 + i, { wob: 0.3 });
  });
  // 같은 장치가 밤하늘의 별을 향한다
  g(sk, S1, () => {
    box(sk, 60, 40, 420, 300, 26, NIGHT, 61, { ink: false, tex: false });
    star(sk, 230, 170, 40, 63, "#FFD36A");
    star(sk, 230, 170, 20, 64, "#FFFFFF");
    dots(sk, 80, 60, 380, 260, 18, 65, 1.8, 2);
    gun(560, 196, 71);
    for (let i = 0; i < 4; i++) line(sk, [[540 - i * 60, 228 - i * 12], [514 - i * 60, 223 - i * 12]], 8, C.red, 81 + i, { wob: 0.3 });
    emark(sk, 840, 110, 0.62, { seed: 87 });
  });
  return { sk };
}

export function build(add) {
  return {
    tree: add("treeBase", treeBase()),
    lamps: add("lampsBase", lampsBase()),
    rank: add("rankBase", rankBase()),
    lava: add("lavaBase", lavaBase()),
    band: add("bandBase", bandBase()),
    dark: add("darkBase", darkBase()),
    thermo: add("thermoBase", thermoBase()),
  };
}
