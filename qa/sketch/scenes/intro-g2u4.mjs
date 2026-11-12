// 중2 과학 Ⅳ 물질의 구성 도입(opener) 다섯 장면의 그림(손그림 코드 그림). intro-u4.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   split (g2u4l1) 물방울 하나, 둘, 넷, 여덟(반으로 나눌 때마다 다음 묶음이 보인다)
//   marks (g2u4l2) 칠판의 동그라미 그림 기호(누를 때마다 세 개씩 늘어난다)와 쌤
//   peek  (g2u4l3) 큰 공 하나(원자)와 돋보기, 공이 비치면 보이는 속
//   salt  (g2u4l5) 물이 든 유리잔, 소금 숟가락, 떨어지는 소금 알갱이
//   blot  (g2u4l6) 위에서 본 접시와 젖은 거름종이, 스포이트, 번지는 파란 얼룩
// (g2u4l4는 만화로 시작해서 도입 장면이 없다.)
// 실행: node qa/sketch/build-intro.mjs g2u4  →  src/ui/introArt.g2u4.generated.ts
import { Sk, C, circ, curve, dense, ell, poly, rrect, qmark, dizzy, drop } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT, TEACHER } from "../lib/figure.mjs";
import { glass } from "../lib/props.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const floor = (sk, y, sd) => sk.ink(dense([[30, y], [930, y + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: sd });

/* ══════════ 1. 물방울 나누기 (g2u4l1) ══════════ */
export function splitBase() {
  const sk = new Sk(W, H, { id: "gsp" });
  floor(sk, 486, 3);
  const sets = [
    { s: 5.2, y: 300, xs: [340] },
    { s: 3.7, y: 330, xs: [250, 430] },
    { s: 2.5, y: 362, xs: [190, 290, 390, 490] },
    { s: 1.55, y: 392, xs: [128, 188, 248, 308, 368, 428, 488, 548] },
  ];
  sets.forEach((st, i) => {
    g(sk, `opn-g2u4-sp-d d${i}`, () => st.xs.forEach((x) => drop(sk, x, st.y, st.s, { color: "#BFE2F4", w: 9 / st.s })));
  });
  drawFigure(sk, 790, 500, 0.54, pose({ elL: [-60, -290], haL: [-128, -322] }), { ...STUDENT });
  return { sk };
}

/* ══════════ 2. 그림 기호가 늘어나면 (g2u4l2) ══════════ */
export function marksBase() {
  const sk = new Sk(W, H, { id: "gmk" });
  floor(sk, 508, 3);
  const board = rrect(48, 44, 640, 400, 14);
  sk.fill(board, C.board, { dx: 0.8, dy: 1, wob: 0.8, seed: 5, tex: true });
  sk.ink(board, { w: 12, color: C.woodDark, wob: 0.9, seed: 6 });
  const chalk = { color: C.white, wob: 0.6 };
  const inner = [
    (x, y) => sk.dot(x, y, 9, C.white),
    (x, y) => sk.ink(dense([[x, y - 30], [x, y + 30]]), { ...chalk, w: 7, seed: 11 }),
    (x, y) => sk.ink(dense([[x - 30, y], [x + 30, y]]), { ...chalk, w: 7, seed: 12 }),
    (x, y) => { sk.ink(dense([[x, y - 30], [x, y + 30]]), { ...chalk, w: 7, seed: 13 }); sk.ink(dense([[x - 30, y], [x + 30, y]]), { ...chalk, w: 7, seed: 14 }); },
    (x, y) => { sk.dot(x - 13, y, 7, C.white); sk.dot(x + 13, y, 7, C.white); },
    (x, y) => sk.ink(circ(x, y, 17, { seed: 15 }), { ...chalk, w: 6, seed: 15 }),
    (x, y) => sk.fill([...ell(x, y, 34, 34, Math.PI / 2, Math.PI * 1.5), [x, y + 34]], C.white, { dx: 0, dy: 0, wob: 0.3, seed: 16 }),
    (x, y) => sk.ink(dense([[x - 22, y + 22], [x + 22, y - 22]]), { ...chalk, w: 7, seed: 17 }),
    (x, y) => { sk.dot(x, y - 14, 6.5, C.white); sk.dot(x - 13, y + 10, 6.5, C.white); sk.dot(x + 13, y + 10, 6.5, C.white); },
    (x, y) => { sk.ink(dense([[x - 22, y - 22], [x + 22, y + 22]]), { ...chalk, w: 7, seed: 18 }); sk.ink(dense([[x - 22, y + 22], [x + 22, y - 22]]), { ...chalk, w: 7, seed: 19 }); },
    (x, y) => { sk.ink(dense([[x - 28, y - 8], [x + 28, y - 8]]), { ...chalk, w: 6, seed: 20 }); sk.ink(dense([[x - 28, y + 10], [x + 28, y + 10]]), { ...chalk, w: 6, seed: 21 }); },
    (x, y) => { sk.ink(dense([[x - 26, y - 14], [x + 26, y - 14]]), { ...chalk, w: 7, seed: 22 }); sk.ink(dense([[x, y - 14], [x, y + 28]]), { ...chalk, w: 7, seed: 23 }); },
  ];
  for (let b = 0; b < 4; b++) {
    g(sk, `opn-g2u4-mk-b b${b}`, () => {
      for (let i = 0; i < 3; i++) {
        const n = b * 3 + i;
        const x = 138 + (n % 4) * 153, y = 122 + Math.floor(n / 4) * 122;
        sk.ink(circ(x, y, 42, { seed: 30 + n }), { ...chalk, w: 8, seed: 30 + n });
        inner[n](x, y);
      }
    });
  }
  drawFigure(sk, 822, 508, 0.52, pose({ elL: [-62, -300], haL: [-120, -350] }), { ...TEACHER });
  g(sk, "opn-g2u4-mk-dz", () => dizzy(sk, 822, 196, 1.3, { n: 2, color: C.orange, w: 8 }));
  return { sk };
}

/* ══════════ 3. 원자 속 들여다보기 (g2u4l3) ══════════ */
export function peekBase() {
  const sk = new Sk(W, H, { id: "gpk" });
  floor(sk, 500, 3);
  // 속: 가운데의 작은 덩어리와 둘레의 더 작은 알갱이(정체는 랩이 밝힌다)
  g(sk, "opn-g2u4-pk-in", () => {
    sk.ink(circ(330, 262, 118, { seed: 41 }), { w: 5, color: C.gray, wob: 0.4, seed: 41, dash: [16, 16] });
    sk.dot(330, 262, 30, C.red);
    sk.ink(circ(330, 262, 30, { seed: 42 }), { w: 7, wob: 0.4, seed: 42 });
    [[330, 144], [226, 318], [436, 322]].forEach(([x, y], i) => { sk.dot(x, y, 15, C.blue); sk.ink(circ(x, y, 15, { seed: 43 + i }), { w: 6, wob: 0.3, seed: 43 + i }); });
  });
  // 겉: 흐릿한 공
  g(sk, "opn-g2u4-pk-shell", () => {
    const ballPts = circ(330, 262, 168, { seed: 51 });
    sk.fill(ballPts, "#CFE6F7", { dx: 1, dy: 1.2, wob: 0.8, seed: 52, tex: true });
    sk.ink(ballPts, { w: 11, wob: 0.9, seed: 53 });
    sk.ink(curve([[236, 176], [262, 150], [300, 136]]), { w: 9, color: C.white, wob: 0.4, seed: 54 });
  });
  g(sk, "opn-g2u4-pk-q", () => qmark(sk, 330, 262, 1.5, { color: C.navy, w: 13, seed: 55 }));
  // 돋보기와 학생
  sk.ink(dense([[604, 372], [668, 438]], 5), { w: 16, color: "#8A5A33", wob: 0.5, seed: 61 });
  sk.ink(circ(566, 332, 56, { seed: 62 }), { w: 13, color: "#B8892E", wob: 0.5, seed: 62 });
  drawFigure(sk, 800, 502, 0.54, pose({ elL: [-58, -262], haL: [-126, -218] }), { ...STUDENT });
  return { sk };
}

/* ══════════ 4. 소금을 물에 넣으면 (g2u4l5) ══════════ */
export function saltBase() {
  const sk = new Sk(W, H, { id: "gst" });
  floor(sk, 486, 3);
  const lw = sk.lwK;
  sk.lwK = 0.36; // 크게 키운 잔의 선이 인물보다 굵어지지 않게
  glass(sk, 470, 482, 3.3, { seed: 71 });
  sk.lwK = lw;
  // 떨어지는 알갱이(물 위에서 물속으로)
  g(sk, "opn-g2u4-st-gr", () => {
    [[440, 250], [468, 232], [498, 254], [452, 330], [486, 352], [470, 400], [444, 420], [500, 426]].forEach(([x, y], i) => {
      const sq = rrect(x - 7, y - 7, 14, 14, 3);
      sk.fill(sq, C.white, { dx: 0, dy: 0, wob: 0.2, seed: 80 + i });
      sk.ink(sq, { w: 4, color: C.gray, wob: 0.2, seed: 90 + i });
    });
  });
  // 숟가락과 소금
  g(sk, "opn-g2u4-st-spoon", () => {
    sk.ink(dense([[546, 150], [716, 96]], 6), { w: 13, color: C.gray, wob: 0.5, seed: 101 });
    const bowlPts = ell(506, 162, 52, 22);
    sk.fill(bowlPts, "#D9DEE5", { dx: 0, dy: 0, wob: 0.4, seed: 102 });
    sk.ink(bowlPts, { w: 8, wob: 0.5, seed: 103 });
    const heap = [...curve([[466, 158], [488, 128], [512, 120], [534, 132], [548, 158]], false, 3)];
    sk.fill([...heap, [466, 158]], C.white, { dx: 0, dy: 0, wob: 0.3, seed: 104 });
    sk.ink(heap, { w: 6, color: C.gray, wob: 0.4, seed: 105 });
  });
  drawFigure(sk, 170, 500, 0.54, pose({ elR: [58, -262], haR: [124, -226] }), { ...STUDENT });
  return { sk };
}

/* ══════════ 5. 파란 방울이 번지면 (g2u4l6) ══════════ */
export function blotBase() {
  const sk = new Sk(W, H, { id: "gbl" });
  const dish = circ(420, 284, 232, { seed: 111 });
  sk.fill(dish, "#EEF5FA", { dx: 1, dy: 1.2, wob: 0.6, seed: 112 });
  sk.ink(dish, { w: 10, color: "#8FA3BC", wob: 0.7, seed: 113 });
  const paper = rrect(196, 212, 448, 144, 10);
  sk.fill(paper, "#D5E0EC", { dx: 0.8, dy: 1, wob: 0.5, seed: 114, tex: 0.7 });
  sk.ink(paper, { w: 8, wob: 0.7, seed: 115 });
  g(sk, "opn-g2u4-bl-spot", () => {
    sk.fill(circ(420, 284, 66, { seed: 121, lump: 0.05 }), C.blue, { dx: 0, dy: 0, wob: 0.8, seed: 122, alpha: 0.82 });
  });
  // 스포이트(오른쪽 위에서 가운데를 향한다)와 끝에 맺힌 방울
  g(sk, "opn-g2u4-bl-dr", () => {
    const body = poly([[452, 232], [476, 214], [650, 86], [668, 108], [494, 238], [464, 250]], 5);
    sk.fill(body, "#F4F8FB", { dx: 0, dy: 0, wob: 0.4, seed: 131 });
    sk.ink(body, { w: 7, wob: 0.5, seed: 132 });
    sk.fill(poly([[470, 226], [560, 160], [574, 178], [486, 240]], 5), C.blue, { dx: 0, dy: 0, wob: 0.3, seed: 133, alpha: 0.8 });
    const bulb = ell(706, 62, 58, 36);
    sk.fill(bulb, C.red, { dx: 0, dy: 0, wob: 0.5, seed: 134 });
    sk.ink(bulb, { w: 8, wob: 0.6, seed: 135 });
  });
  g(sk, "opn-g2u4-bl-drop", () => drop(sk, 440, 262, 1.25, { color: C.blue, line: C.navy, w: 5 }));
  return { sk };
}

export function build(add) {
  return {
    split: { ...add("splitBase", splitBase()) },
    marks: { ...add("marksBase", marksBase()) },
    peek: { ...add("peekBase", peekBase()) },
    salt: { ...add("saltBase", saltBase()) },
    blot: { ...add("blotBase", blotBase()) },
  };
}
