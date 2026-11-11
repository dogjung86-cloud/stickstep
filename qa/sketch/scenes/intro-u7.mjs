// 중1 과학 Ⅶ 태양계 도입(opener) 다섯 장면의 그림(손그림 코드 그림). intro-u1.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
// 도입에서는 만화처럼 손그림 천체를 쓴다(랩과 문제 그림의 천체는 실사다).
//   brightdot  (u7l1) 밤하늘의 밝은 점과 아이, 망원경. 꾹 누르면 커지는 확대 창 안의 고리 두른 행성
//   jupiterrow (u7l2) 큰 목성과 그 지름에 한 줄로 서는 지구 열한 개
//   shadowturn (u7l4) 나무 한 그루, 해 셋(아침, 한낮, 저녁)과 그림자 셋
//   moonweek   (u7l5) 밤하늘의 달(오른쪽 반달에서 보름달까지 여덟 장), 날짜 점 일곱 개, 아이
//   bittensun  (u7l6) 관측 안경을 쓴 아이와 안경으로 본 해. 해를 가리는 둥근 것은 배경과 같은 색이라 파인 자리만 보인다
// build-intro.mjs u7 이 build(add)를 불러 introArt.u7.generated.ts에 싣는다.
import { Sk, C, dense, circ, ell, poly, rrect, arrow, sparkle, TAU } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";
import { earth } from "../lib/props.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const NIGHT = "#2B3760";
const GROUND = 506;
const groundLine = (sk, seed = 3) => sk.ink(dense([[30, GROUND], [930, GROUND + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed });
// 밤하늘: 위쪽 띠로만 깐다(인물의 몸은 밝은 땅 위에 둔다)
function nightBand(sk, bottom, stars) {
  sk.fill(rrect(-20, -20, W + 40, bottom + 20, 0), NIGHT, { dx: 0, dy: 0, wob: 0, seed: 5, tex: false });
  stars.forEach(([x, y, r], i) => sk.fill(circ(x, y, r, { over: 0.1, seed: 40 + i }), "#FFF3C4", { dx: 0, dy: 0, wob: 0.2, seed: 60 + i, tex: false }));
}
const lookUp = pose({ elR: [74, -296], haR: [140, -330], elL: [-40, -262], haL: [-56, -190], tilt: 0.12 });

/* ══════════ 1. 밝은 점 (u7l1) ══════════ */
export const BD = { dot: [660, 150], hit: [552, 42, 216, 216] };
export function brightdotBase() {
  const sk = new Sk(W, H, { id: "bd" });
  nightBand(sk, 318, [[90, 70, 5], [210, 150, 4], [330, 60, 5], [440, 190, 4], [520, 90, 4], [810, 80, 5], [880, 210, 4], [760, 260, 4], [150, 250, 4], [600, 270, 4]]);
  groundLine(sk);
  drawFigure(sk, 170, GROUND - 2, 0.6, lookUp, { ...STUDENT });
  // 망원경: 삼각대와 통
  const tx = 372, ty = 392;
  [[-56, 112], [0, 114], [56, 112]].forEach(([dx, dy], i) => sk.ink(dense([[tx, ty], [tx + dx, ty + dy]]), { w: 8, seed: 21 + i, wob: 0.8 }));
  const tube = poly([[tx - 70, ty + 14], [tx - 52, ty + 44], [tx + 96, ty - 44], [tx + 74, ty - 78]], 4);
  sk.fill(tube, "#8FB6E8", { dx: 1, dy: 1, wob: 0.6, seed: 25 });
  sk.ink(tube, { w: 8, wob: 0.7, seed: 26 });
  // 밝은 점
  g(sk, "opn-u7-bd-dot", () => sparkle(sk, BD.dot[0], BD.dot[1], 30, { seed: 31, w: 6 }));
  // 확대 창: 앱이 0에서 1로 키운다. 안에는 고리를 두른 행성
  g(sk, "opn-u7-bd-zoom", () => {
    const [cx, cy] = [BD.dot[0], BD.dot[1] + 14];
    const lens = circ(cx, cy, 142, { over: 0.1, seed: 33 });
    sk.fill(lens, "#1B2444", { dx: 0, dy: 0, wob: 0.4, seed: 34, tex: false });
    const tilt = -0.3;
    const ring = (a0, a1) => ell(0, 0, 122, 34, a0, a1).map(([x, y]) => [cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
    sk.ink(ring(Math.PI, TAU), { w: 13, color: "#D9B36B", wob: 0.6, seed: 35 }); // 뒤쪽 고리
    const ball = circ(cx, cy, 62, { over: 0.12, seed: 36 });
    sk.fill(ball, "#EBD49A", { dx: 0, dy: 0, wob: 0.5, seed: 37 });
    [-22, 6, 30].forEach((dy, i) => sk.ink(dense([[cx - 52 + Math.abs(dy) * 0.4, cy + dy], [cx + 52 - Math.abs(dy) * 0.4, cy + dy - 6]]), { w: 7, color: "#C9A566", wob: 1, seed: 38 + i }));
    sk.ink(ball, { w: 8, wob: 0.6, seed: 42 });
    sk.ink(ring(0, Math.PI), { w: 13, color: "#D9B36B", wob: 0.6, seed: 43 }); // 앞쪽 고리
    sk.ink(lens, { w: 10, color: "#8FB6E8", wob: 0.7, seed: 44 });
  });
  return { sk };
}

/* ══════════ 2. 목성 옆의 지구 (u7l2) ══════════
   목성의 지름은 지구의 약 11.2배다. 지구 열한 개가 지름에 한 줄로 선다. */
export const JR = { cx: 580, cy: 272, r: 208, n: 11 };
export function jupiterrowBase() {
  const sk = new Sk(W, H, { id: "jr" });
  const { cx, cy, r, n } = JR;
  const er = r / 11.2;
  const ball = circ(cx, cy, r, { over: 0.06, seed: 11 });
  sk.fill(ball, "#EAD2A8", { dx: 0, dy: 0, wob: 0.8, seed: 12, tex: true });
  [-150, -92, 78, 138].forEach((dy, i) => {
    const hc = Math.sqrt(r * r - dy * dy) - 16;
    sk.ink(dense([[cx - hc, cy + dy], [cx + hc, cy + dy + (i % 2 ? 5 : -5)]], 6), { w: i % 2 ? 22 : 17, color: i % 2 ? "#C99A66" : "#D9B282", wob: 2.4, seed: 14 + i });
  });
  const spot = ell(cx + 96, cy + 108, 34, 19);
  sk.fill(spot, "#D0643E", { dx: 0, dy: 0, wob: 0.5, seed: 21 });
  sk.ink([...spot, spot[0]], { w: 5, color: "#A8472A", wob: 0.5, seed: 22 });
  sk.ink(ball, { w: 11, seed: 23 });
  // 견줄 지구 하나(왼쪽)와 세우는 방향
  earth(sk, 150, cy, er, { w: 5, seed: 31 });
  arrow(sk, [[190, cy], [330, cy]], { straight: true, w: 8, color: C.gray, head: 22, seed: 33, wob: 0.6, dash: [4, 16] });
  // 지름에 한 줄로 서는 지구들(앱이 하나씩 켠다)
  for (let i = 0; i < n; i++) {
    const x = cx - r + (r * 2 - n * er * 2) / 2 + er + i * er * 2;
    g(sk, `opn-u7-jr-e e${i + 1}`, () => earth(sk, x, cy, er - 1, { w: 4, seed: 41 + i * 3 }));
  }
  return { sk };
}

/* ══════════ 3. 자리를 옮기는 그림자 (u7l4) ══════════
   남쪽을 보고 선 그림이다. 해는 왼쪽(동)에서 떠서 가운데 높이(남) 지나 오른쪽(서)으로 진다. 그림자는 해의 반대쪽에 눕는다. */
export const ST = { tree: 480 };
export function shadowturnBase() {
  const sk = new Sk(W, H, { id: "st" });
  const gy = 432, tx = ST.tree;
  sk.fill(rrect(-20, gy, W + 40, H - gy + 20, 0), "#F4EEDD", { dx: 0, dy: 0, wob: 0, seed: 3, tex: false });
  sk.ink(dense([[20, gy], [940, gy + 2]], 8), { w: 8, color: C.grayLight, wob: 1.2, seed: 4 });
  // 해가 지나는 길
  sk.ink(ell(tx, gy - 20, 352, 330, Math.PI * 1.06, Math.PI * 1.94), { w: 5, color: C.grayLight, wob: 0.6, seed: 5, dash: [3, 18] });
  // 그림자 셋(앱이 하나만 켠다)
  const shade = (cls, pts, seed) => g(sk, `opn-u7-st-sh ${cls}`, () => sk.fill(pts, "#6B7385", { dx: 0, dy: 0, wob: 0.6, seed, tex: false }));
  shade("h1", ell(tx + 196, gy + 34, 206, 24), 11);
  shade("h2", ell(tx, gy + 26, 92, 20), 12);
  shade("h3", ell(tx - 196, gy + 34, 206, 24), 13);
  // 나무
  const trunk = poly([[tx - 15, gy + 4], [tx - 12, gy - 128], [tx + 12, gy - 128], [tx + 15, gy + 4]], 4);
  sk.fill(trunk, C.wood, { dx: 0, dy: 0, wob: 0.5, seed: 21 });
  sk.ink(trunk, { w: 8, wob: 0.6, seed: 22 });
  const crown = circ(tx, gy - 190, 84, { over: 0.15, seed: 23, lump: 0.07 });
  sk.fill(crown, C.green, { dx: 1, dy: 1, wob: 0.8, seed: 24, tex: true });
  sk.ink(crown, { w: 10, wob: 0.9, seed: 25 });
  // 해 셋(앱이 하나만 켠다)
  const sunAt = (cls, x, y, seed) => g(sk, `opn-u7-st-sun ${cls}`, () => {
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2; sk.ink(dense([[x + 62 * Math.cos(a), y + 62 * Math.sin(a)], [x + 84 * Math.cos(a), y + 84 * Math.sin(a)]]), { w: 10, color: C.orange, wob: 0.4, seed: seed + i }); }
    const c = circ(x, y, 44, { over: 0.2, seed: seed + 9 });
    sk.fill(c, C.yellow, { dx: 1, dy: 1.2, wob: 0.6, seed: seed + 10 });
    sk.ink(c, { w: 10, wob: 0.6, seed: seed + 11 });
  });
  sunAt("s1", 150, 300, 31);
  sunAt("s2", tx + 150, 96, 51);
  sunAt("s3", 810, 300, 71);
  return { sk };
}

/* ══════════ 4. 일주일 뒤의 달 (u7l5) ══════════
   오른쪽 반달(상현)에서 보름달까지 여덟 장. 밝은 쪽은 오른쪽 반원에 왼쪽으로 부푸는 타원을 붙여 만든다. */
export const MW = { cx: 620, cy: 168, r: 112, days: 7 };
export function moonweekBase() {
  const sk = new Sk(W, H, { id: "mw" });
  const { cx, cy, r, days } = MW;
  nightBand(sk, 336, [[80, 80, 5], [200, 200, 4], [330, 70, 5], [420, 250, 4], [860, 70, 5], [900, 240, 4], [790, 300, 4], [140, 300, 4]]);
  groundLine(sk);
  drawFigure(sk, 180, GROUND - 2, 0.6, lookUp, { ...STUDENT });
  for (let k = 0; k <= days; k++) {
    g(sk, `opn-u7-mw-m m${k}`, () => {
      const disc = circ(cx, cy, r, { over: 0.08, seed: 21 });
      sk.fill(disc, "#4A5470", { dx: 0, dy: 0, wob: 0.3, seed: 22, tex: false });
      const f = k / days;
      const lit = [];
      for (let i = 0; i <= 40; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 40; lit.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
      for (let i = 0; i <= 40; i++) { const a = Math.PI / 2 + (Math.PI * i) / 40; lit.push([cx + r * f * Math.cos(a), cy + r * Math.sin(a)]); }
      sk.fill(lit, "#F7E9A9", { dx: 0, dy: 0, wob: 0.3, seed: 23, tex: false });
      [[34, -40, 15], [50, 34, 11], [-8, 58, 9]].forEach(([dx, dy, rr], i) => sk.ink(circ(cx + dx, cy + dy, rr, { over: 0.2, seed: 25 + i }), { w: 4, color: "#D9C777", wob: 0.4, seed: 28 + i }));
      sk.ink(disc, { w: 9, wob: 0.5, seed: 31 });
    });
  }
  // 날짜 점(하루에 하나씩 켜진다)
  for (let i = 0; i < days; i++) sk.raw(`<circle class="opn-u7-mw-day d${i + 1}" cx="${cx - 168 + i * 56}" cy="424" r="15" fill="#E6E9EE" stroke="${C.ink}" stroke-width="5"/>`);
  return { sk };
}

/* ══════════ 5. 한 입 파인 해 (u7l6) ══════════
   안경으로 본 하늘은 어둡고 해만 보인다. 해를 가리는 둥근 것은 하늘과 같은 색이라 파인 자리로만 드러난다(앱이 옮긴다).
   끝에서만 둥근 테두리를 보여 준다. */
export const BS = { cx: 690, cy: 254, view: 204, sun: 122, from: [176, -128], to: [26, -18] };
export function bittensunBase() {
  const sk = new Sk(W, H, { id: "bs" });
  const { cx, cy, view, sun } = BS;
  const DARK = "#1E2433";
  groundLine(sk);
  drawFigure(sk, 170, GROUND - 2, 0.6, lookUp, { ...STUDENT, glasses: true });
  arrow(sk, [[300, 262], [440, 244]], { straight: true, w: 8, color: C.gray, head: 22, seed: 13, wob: 0.6, dash: [4, 16] });
  const lens = circ(cx, cy, view, { over: 0.06, seed: 21 });
  sk.fill(lens, DARK, { dx: 0, dy: 0, wob: 0.4, seed: 22, tex: false });
  sk.raw(`<clipPath id="bs-clip"><circle cx="${cx}" cy="${cy}" r="${view - 6}"/></clipPath><g clip-path="url(#bs-clip)">`);
  const disc = circ(cx, cy, sun, { over: 0.1, seed: 23 });
  sk.fill(disc, C.yellow, { dx: 0, dy: 0, wob: 0.5, seed: 24 });
  sk.ink(disc, { w: 9, color: C.orange, wob: 0.6, seed: 25 });
  g(sk, "opn-u7-bs-moon", () => {
    sk.fill(circ(cx, cy, sun + 4, { over: 0.1, seed: 27 }), DARK, { dx: 0, dy: 0, wob: 0.3, seed: 28, tex: false });
    g(sk, "opn-u7-bs-edge", () => sk.ink(circ(cx, cy, sun + 4, { over: 0.1, seed: 27 }), { w: 6, color: "#9AA8C8", wob: 0.4, seed: 29, dash: [10, 16] }));
  });
  sk.raw("</g>");
  sk.ink(lens, { w: 11, wob: 0.7, seed: 31 });
  return { sk };
}

/** build-intro.mjs가 부른다: 그림을 싣고 장면별 좌표를 돌려준다. */
export function build(add) {
  return {
    brightdot: { ...BD, ...add("brightdotBase", brightdotBase()) },
    jupiterrow: { ...JR, ...add("jupiterrowBase", jupiterrowBase()) },
    shadowturn: { ...ST, ...add("shadowturnBase", shadowturnBase()) },
    moonweek: { ...MW, ...add("moonweekBase", moonweekBase()) },
    bittensun: { ...BS, ...add("bittensunBase", bittensunBase()) },
  };
}
