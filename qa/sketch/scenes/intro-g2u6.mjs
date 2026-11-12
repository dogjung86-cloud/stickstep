// 중2 과학 Ⅵ 동물과 에너지 도입(opener) 다섯 장면의 그림(손그림 코드 그림). intro-u4.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 바뀌는 부분은 <g class="opn-g2u6-g 이름숫자">로 묶고 앱의 CSS와 코드가 켜고 끈다.
//   peanut (g2u6l1) 흰 종이 위의 땅콩. 문지를 때마다 기름 얼룩이 넓어진다
//   chew   (g2u6l2) 밥그릇과 밥을 씹는 학생. 씹을수록 단맛을 나타내는 반짝임이 늘어난다
//   breath (g2u6l4) 가슴에 줄자를 두른 학생. 들이쉬면 줄자의 고리가 넓어진다
//   water  (g2u6l5) 물컵 세 개와 오줌을 받은 컵. 물을 마실수록 오줌이 많아지고 옅어진다
//   run    (g2u6l6) 제자리 뛰기를 하는 학생. 뛸수록 숨, 심장 박동, 땀이 늘어난다
// (g2u6l3은 만화로 시작해서 도입 장면이 없다.)
// 실행: node qa/sketch/build-intro.mjs g2u6  →  src/ui/introArt.g2u6.generated.ts
import { Sk, C, arrow, circ, curve, dense, drop, ell, heart, poly, sparkle } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const floor = (sk, y, sd) => sk.ink(dense([[30, y], [930, y + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: sd });

/* ══════════ 1. 땅콩과 흰 종이 (g2u6l1) ══════════ */
export function peanutBase() {
  const sk = new Sk(W, H, { id: "gpn" });
  floor(sk, 500, 3);
  const paper = poly([[190, 120], [770, 96], [800, 456], [170, 470]], 6);
  sk.fill(paper, C.white, { dx: 0, dy: 0, wob: 0.6, seed: 5 });
  sk.ink(paper, { w: 8, color: C.gray, wob: 0.8, seed: 6 });
  // 기름 얼룩(세 단계): 종이가 비쳐 보이는 누런 회색
  const stain = (r, sd, a) => {
    const c = circ(500, 300, r, { seed: sd, lump: 0.24 });
    sk.fill(c, "#A9A58E", { dx: 0, dy: 0, wob: 1.6, seed: sd + 1, alpha: a });
  };
  g(sk, "opn-g2u6-g s1", () => stain(60, 11, 0.45));
  g(sk, "opn-g2u6-g s2", () => stain(120, 21, 0.55));
  g(sk, "opn-g2u6-g s3", () => stain(175, 31, 0.65));
  // 땅콩 한 알(껍질을 깐 알맹이 두 쪽)
  const nut = curve([[420, 250], [440, 214], [486, 206], [522, 232], [528, 282], [504, 324], [456, 332], [420, 302]], true, 3);
  sk.fill(nut, "#D9A066", { dx: 0, dy: 0, wob: 0.5, seed: 41, tex: 0.6 });
  sk.ink(nut, { w: 9, color: "#8A5A2A", wob: 0.7, seed: 42 });
  sk.ink(curve([[452, 222], [470, 268], [478, 322]]), { w: 6, color: "#8A5A2A", wob: 0.4, seed: 43 });
  // 문지르는 표시
  g(sk, "opn-g2u6-rub", () => {
    arrow(sk, curve([[560, 230], [610, 250], [560, 280]]), { w: 8, color: C.gray });
    arrow(sk, curve([[386, 320], [336, 300], [386, 270]]), { w: 8, color: C.gray });
  });
  return { sk };
}

/* ══════════ 2. 밥 오래 씹기 (g2u6l2) ══════════ */
export function chewBase() {
  const sk = new Sk(W, H, { id: "gch" });
  floor(sk, 506, 3);
  // 밥상과 밥그릇
  sk.ink(dense([[70, 400], [470, 400]], 6), { w: 16, color: C.wood, wob: 0.6, seed: 5 });
  sk.ink(dense([[110, 410], [106, 500]], 6), { w: 10, wob: 0.5, seed: 6 });
  sk.ink(dense([[430, 410], [434, 500]], 6), { w: 10, wob: 0.5, seed: 7 });
  const rice = curve([[180, 316], [196, 250], [270, 222], [344, 250], [360, 316]], false, 3);
  sk.fill([...rice, [180, 316]], C.white, { dx: 0, dy: 0, wob: 0.8, seed: 11, tex: 0.5 });
  sk.ink(rice, { w: 8, color: C.gray, wob: 1, seed: 12 });
  [[226, 270], [270, 252], [312, 274], [250, 296], [296, 300]].forEach(([x, y], i) => sk.ink(curve([[x - 8, y], [x, y - 5], [x + 8, y]]), { w: 4, color: C.grayLight, wob: 0.3, seed: 13 + i }));
  const bowl = curve([[160, 312], [176, 372], [222, 392], [318, 392], [364, 372], [380, 312]], false, 3);
  sk.fill([...bowl, [160, 312]], "#7FB4E0", { dx: 0, dy: 0, wob: 0.5, seed: 21 });
  sk.ink([...bowl, [160, 312]], { w: 9, wob: 0.7, seed: 22 });
  // 학생(숟가락을 든 손)
  drawFigure(sk, 690, 506, 0.82, pose({ elR: [70, -270], haR: [20, -330], elL: [-44, -262], haL: [-60, -190] }), { ...STUDENT });
  // 단맛을 나타내는 반짝임(세 단계)
  const S = [[[596, 120]], [[590, 110], [800, 150], [820, 70]], [[580, 100], [806, 150], [826, 64], [560, 190], [700, 30], [850, 230]]];
  S.forEach((list, i) => g(sk, `opn-g2u6-g p${i + 1}`, () => list.forEach(([x, y], k) => sparkle(sk, x, y, 20 + (k % 2) * 8, { color: "#F2B84B" }))));
  return { sk };
}

/* ══════════ 3. 가슴에 두른 줄자 (g2u6l4) ══════════ */
export function breathBase() {
  const sk = new Sk(W, H, { id: "gbr" });
  floor(sk, 524, 3);
  drawFigure(sk, 480, 522, 0.86, pose({ elL: [-96, -300], haL: [-166, -322], elR: [96, -300], haR: [166, -322] }), { ...STUDENT });
  const cy = 522 - 286 * 0.86;
  const band = (rx, ry, sd) => {
    const ring = ell(480, cy, rx, ry);
    sk.ink(ring, { w: 12, color: "#F2B84B", wob: 0.5, seed: sd });
    sk.ink(ring, { w: 4, color: "#9A6A1C", wob: 0.5, seed: sd + 1 });
    // 줄자의 눈금(짧은 금)
    for (let i = 0; i < 7; i++) {
      const x = 480 - rx * 0.8 + (rx * 1.6 * i) / 6;
      sk.ink(dense([[x, cy + ry - 5], [x, cy + ry + 5]], 3), { w: 3, color: "#9A6A1C", wob: 0.2, seed: sd + 3 + i });
    }
  };
  g(sk, "opn-g2u6-g b0", () => band(44, 13, 11));
  g(sk, "opn-g2u6-g b1", () => {
    band(74, 18, 31);
    arrow(sk, dense([[572, cy], [632, cy]], 5), { w: 8, color: C.red });
    arrow(sk, dense([[388, cy], [328, cy]], 5), { w: 8, color: C.red });
  });
  // 공기의 드나듦
  g(sk, "opn-g2u6-g a1", () => arrow(sk, curve([[250, 70], [330, 96], [396, 130]]), { w: 10, color: "#5AB0F2" }));
  g(sk, "opn-g2u6-g a2", () => arrow(sk, curve([[396, 130], [330, 96], [250, 70]]), { w: 10, color: "#9AA7B8" }));
  return { sk };
}

/* ══════════ 4. 물과 오줌 (g2u6l5) ══════════ */
export function waterBase() {
  const sk = new Sk(W, H, { id: "gwt" });
  floor(sk, 470, 3);
  // 물컵 세 개
  [130, 270, 410].forEach((x, i) => {
    const cup = poly([[x - 50, 250], [x + 50, 250], [x + 38, 460], [x - 38, 460]], 5);
    g(sk, `opn-g2u6-w w${i}`, () => sk.fill(poly([[x - 46, 290], [x + 46, 290], [x + 36, 456], [x - 36, 456]], 5), "#8FCBF2", { dx: 0, dy: 0, wob: 0.4, seed: 11 + i }));
    sk.ink(cup, { w: 9, color: "#7FA7C9", wob: 0.7, seed: 21 + i });
  });
  // 오줌을 받은 컵(네 단계: 점점 많아지고 옅어진다)
  const U = [{ h: 44, c: "#D9A520" }, { h: 84, c: "#E8C247" }, { h: 124, c: "#F0D878" }, { h: 164, c: "#F6E9A8" }];
  U.forEach((u, i) => g(sk, `opn-g2u6-g u${i}`, () => sk.fill(poly([[690, 456 - u.h], [830, 456 - u.h], [820, 456], [700, 456]], 5), u.c, { dx: 0, dy: 0, wob: 0.4, seed: 41 + i })));
  const cup = poly([[676, 240], [844, 240], [822, 460], [698, 460]], 5);
  sk.ink(cup, { w: 10, wob: 0.7, seed: 51 });
  arrow(sk, dense([[500, 350], [620, 350]], 6), { w: 10, color: C.gray });
  return { sk };
}

/* ══════════ 5. 제자리 뛰기 (g2u6l6) ══════════ */
export function runBase() {
  const sk = new Sk(W, H, { id: "grn" });
  floor(sk, 516, 3);
  drawFigure(sk, 470, 500, 0.86, pose({ elL: [-64, -268], haL: [-24, -322], elR: [62, -282], haR: [104, -232], knL: [-46, -124], ftL: [-104, -46], knR: [30, -108], ftR: [26, 0] }), { ...STUDENT });
  // 뛰는 표시(발밑의 짧은 선)
  sk.ink(dense([[360, 496], [330, 488]], 4), { w: 7, color: C.grayLight, wob: 0.4, seed: 5 });
  sk.ink(dense([[352, 474], [318, 470]], 4), { w: 7, color: C.grayLight, wob: 0.4, seed: 6 });
  const puff = (x, y, r, sd) => sk.ink(circ(x, y, r, { seed: sd, lump: 0.12 }), { w: 6, color: "#9AA7B8", wob: 0.8, seed: sd + 1 });
  g(sk, "opn-g2u6-g p1", () => {
    heart(sk, 472, 252, 0.7, { color: C.red });
    puff(610, 150, 20, 11);
  });
  g(sk, "opn-g2u6-g p2", () => {
    heart(sk, 472, 252, 1, { color: C.red });
    puff(610, 150, 22, 21);
    puff(662, 118, 28, 23);
    drop(sk, 356, 96, 1.2, {});
  });
  g(sk, "opn-g2u6-g p3", () => {
    heart(sk, 472, 252, 1.35, { color: C.red });
    puff(610, 150, 24, 31);
    puff(664, 116, 30, 33);
    puff(730, 86, 36, 35);
    drop(sk, 352, 92, 1.3, {});
    drop(sk, 318, 150, 1.1, {});
    drop(sk, 596, 60, 1.2, {});
  });
  return { sk };
}

export function build(add) {
  return {
    peanut: { ...add("peanutBase", peanutBase()) },
    chew: { ...add("chewBase", chewBase()) },
    breath: { ...add("breathBase", breathBase()) },
    water: { ...add("waterBase", waterBase()) },
    run: { ...add("runBase", runBase()) },
  };
}
