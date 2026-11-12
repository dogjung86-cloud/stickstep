// 중2 과학 Ⅴ 식물과 에너지 도입(opener) 다섯 장면의 그림(손그림 코드 그림). intro-u4.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 켜고 끈다.
//   iodine (g2u5l2) 접시 셋(밥, 식빵, 달걀흰자)과 갈색 용액 병. 용액을 떨어뜨린 자리의 얼룩이 묶음마다 따로 있다
//   shade  (g2u5l3) 창가의 화분과 방 안쪽의 화분. 한 주가 지날 때마다 두 상추의 모습이 바뀐다
//   flood  (g2u5l4) 받침에 물이 고이는 화분. 물을 줄 때마다 물이 차오르고 잎이 처진다
//   jar    (g2u5l5) 뚜껑을 닫은 유리병 속의 식물, 병 밖의 해와 달
//   thin   (g2u5l6) 사과나무 가지와 어린 열매 여섯 개. 솎아 낸 뒤 남은 셋이 크게 익는다
// (g2u5l1은 만화로 시작해서 도입 장면이 없다.)
// 실행: node qa/sketch/build-intro.mjs g2u5  →  src/ui/introArt.g2u5.generated.ts
import { Sk, C, circ, curve, dense, ell, poly, rrect, drop } from "../lib/sk.mjs";
import { sun, moon } from "../lib/props.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const floor = (sk, y, sd) => sk.ink(dense([[30, y], [930, y + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: sd });
const LEAF = "#58B86A", LEAF_D = "#2C7A45", PALE = "#C9D29A", PALE_D = "#8E9A5A", POT = "#CF8556", POT_D = "#8A4F2A";

// 잎 한 장: 밑동 (x, y)에서 rot(라디안, 0이 위쪽)으로 뻗는다.
function leaf(sk, x, y, len, wid, rot, o = {}) {
  const pts = curve([[0, 0], [-wid, -len * 0.42], [-wid * 0.5, -len * 0.9], [0, -len], [wid * 0.5, -len * 0.9], [wid, -len * 0.42]], true, 3);
  sk.at(x, y, 1, () => {
    sk.fill(pts, o.color ?? LEAF, { dx: 0, dy: 0, wob: 0.6, seed: (o.seed ?? 1) + 1 });
    sk.ink(pts, { w: o.w ?? 7, color: o.line ?? LEAF_D, wob: 0.6, seed: (o.seed ?? 1) + 2 });
    sk.ink(dense([[0, -6], [0, -len * 0.78]], 5), { w: (o.w ?? 7) * 0.55, color: o.line ?? LEAF_D, wob: 0.4, seed: (o.seed ?? 1) + 3 });
  }, rot);
}
// 화분: (x, y)는 바닥 가운데. 흙 윗면은 y - 62s.
function pot(sk, x, y, s, sd, o = {}) {
  const body = poly([[x - 42 * s, y - 62 * s], [x + 42 * s, y - 62 * s], [x + 30 * s, y], [x - 30 * s, y]], 4);
  sk.fill(body, POT, { dx: 0, dy: 0, wob: 0.6, seed: sd, tex: 0.6 });
  sk.ink(body, { w: 8, color: POT_D, wob: 0.7, seed: sd + 1 });
  const rim = rrect(x - 48 * s, y - 74 * s, 96 * s, 18 * s, 6);
  sk.fill(rim, o.wet ? "#7A4B2A" : "#DB9667", { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 });
  sk.ink(rim, { w: 7, color: POT_D, wob: 0.6, seed: sd + 3 });
}
// 상추처럼 잎이 퍼진 식물: 밑동 (x, y). droop이 클수록 잎이 옆으로 눕는다.
function plant(sk, x, y, s, o = {}) {
  const n = o.n ?? 5, droop = o.droop ?? 0, pale = !!o.pale;
  for (let i = 0; i < n; i++) {
    const k = n === 1 ? 0 : -1 + (2 * i) / (n - 1);
    const rot = k * (0.85 + droop * 0.95);
    const mid = Math.abs(k) < 0.34;
    leaf(sk, x, y, (mid ? 100 : 84) * s * (1 - droop * 0.12), (mid ? 30 : 26) * s, rot + (mid ? droop * 0.5 * (i % 2 ? 1 : -1) : 0), { color: pale ? PALE : i % 2 ? LEAF : "#74CC80", line: pale ? PALE_D : LEAF_D, seed: (o.seed ?? 10) + i * 7 });
  }
}

/* ══════════ 1. 갈색 용액 한 방울 (g2u5l2) ══════════ */
export function iodineBase() {
  const sk = new Sk(W, H, { id: "gio" });
  floor(sk, 452, 3);
  const X = [190, 440, 690];
  X.forEach((x, i) => {
    const plate = ell(x, 396, 118, 34);
    sk.fill(plate, "#F3F6FA", { dx: 0, dy: 0, wob: 0.5, seed: 11 + i });
    sk.ink(plate, { w: 8, color: "#8FA3BC", wob: 0.6, seed: 21 + i });
  });
  // 밥 한 덩이
  const rice = curve([[110, 392], [118, 330], [160, 296], [214, 294], [258, 326], [270, 392]], false, 3);
  sk.fill([...rice, [110, 392]], C.white, { dx: 0, dy: 0, wob: 0.8, seed: 31, tex: 0.5 });
  sk.ink(rice, { w: 8, color: C.gray, wob: 1, seed: 32 });
  [[150, 340], [186, 322], [224, 344], [170, 368], [212, 372]].forEach(([x, y], i) => sk.ink(curve([[x - 8, y], [x, y - 5], [x + 8, y]]), { w: 4, color: C.grayLight, wob: 0.3, seed: 33 + i }));
  // 식빵 한 장
  const bread = curve([[366, 392], [360, 316], [352, 292], [378, 268], [410, 280], [440, 266], [470, 280], [502, 268], [528, 292], [520, 316], [514, 392]], false, 3);
  sk.fill([...bread, [366, 392]], "#F5E6BE", { dx: 0, dy: 0, wob: 0.6, seed: 41, tex: 0.7 });
  sk.ink([...bread, [366, 392]], { w: 9, color: C.woodDark, wob: 0.8, seed: 42 });
  // 삶은 달걀흰자 반쪽
  const egg = ell(690, 344, 82, 56);
  sk.fill(egg, C.white, { dx: 0, dy: 0, wob: 0.5, seed: 51 });
  sk.ink(egg, { w: 8, color: C.gray, wob: 0.7, seed: 52 });
  sk.ink(ell(690, 344, 34, 24), { w: 5, color: C.grayLight, wob: 0.5, seed: 53 });
  // 얼룩: 밥과 식빵은 청람색으로 번지고, 달걀흰자는 갈색 방울 그대로
  const blot = (x, y, r, color, sd) => sk.fill(circ(x, y, r, { seed: sd, lump: 0.08 }), color, { dx: 0, dy: 0, wob: 1, seed: sd + 1, alpha: 0.92 });
  g(sk, "opn-g2u5-io-b b0", () => blot(192, 340, 44, "#2B2F8A", 61));
  g(sk, "opn-g2u5-io-b b1", () => blot(440, 334, 46, "#2B2F8A", 71));
  g(sk, "opn-g2u5-io-b b2", () => blot(690, 344, 20, "#C58A2E", 81));
  // 갈색 용액 병과 스포이트
  const bottle = rrect(836, 318, 78, 124, 14);
  sk.fill(bottle, "#B9772A", { dx: 0, dy: 0, wob: 0.5, seed: 91, tex: 0.6 });
  sk.ink(bottle, { w: 9, wob: 0.7, seed: 92 });
  sk.ink(dense([[875, 318], [875, 250]], 5), { w: 14, color: C.gray, wob: 0.4, seed: 93 });
  const bulb = ell(875, 232, 22, 28);
  sk.fill(bulb, C.red, { dx: 0, dy: 0, wob: 0.4, seed: 94 });
  sk.ink(bulb, { w: 8, wob: 0.6, seed: 95 });
  drop(sk, 875, 392, 1.2, { color: "#E0A85A", line: "#7A4A12", w: 5 });
  return { sk };
}

/* ══════════ 2. 창가와 방 안쪽 (g2u5l3) ══════════ */
export function shadeBase() {
  const sk = new Sk(W, H, { id: "gsh" });
  floor(sk, 500, 3);
  // 방 안쪽의 그늘
  sk.fill(rrect(540, 40, 390, 462, 16), "#E3E6EC", { dx: 0, dy: 0, wob: 0.6, seed: 5, tex: 0.5 });
  // 창과 햇빛
  const win = rrect(60, 50, 330, 290, 10);
  sk.fill(win, "#DDF0FB", { dx: 0, dy: 0, wob: 0.5, seed: 6 });
  sun(sk, 150, 132, 34, { seed: 7 });
  sk.ink(win, { w: 12, color: C.woodDark, wob: 0.7, seed: 8 });
  sk.ink(dense([[225, 54], [225, 338]], 6), { w: 8, color: C.woodDark, wob: 0.5, seed: 9 });
  sk.ink(dense([[30, 352], [430, 352]], 6), { w: 16, color: C.wood, wob: 0.6, seed: 10 });
  // 방 안쪽의 낮은 탁자
  sk.ink(dense([[610, 420], [880, 420]], 6), { w: 14, color: C.wood, wob: 0.6, seed: 12 });
  sk.ink(dense([[640, 428], [636, 498]], 6), { w: 10, wob: 0.5, seed: 13 });
  sk.ink(dense([[850, 428], [854, 498]], 6), { w: 10, wob: 0.5, seed: 14 });
  pot(sk, 225, 344, 1, 21);
  pot(sk, 745, 412, 1, 31);
  const A = [{ s: 0.55, n: 3 }, { s: 0.95, n: 5 }, { s: 1.35, n: 7 }];
  const B = [{ s: 0.55, n: 3 }, { s: 0.7, n: 3, pale: true, droop: 0.25 }, { s: 0.78, n: 3, pale: true, droop: 0.8 }];
  A.forEach((p, i) => g(sk, `opn-g2u5-sh-p a${i}`, () => plant(sk, 225, 272, p.s, { ...p, seed: 40 + i * 30 })));
  B.forEach((p, i) => g(sk, `opn-g2u5-sh-p b${i}`, () => plant(sk, 745, 340, p.s, { ...p, seed: 140 + i * 30 })));
  return { sk };
}

/* ══════════ 3. 물에 잠긴 화분 (g2u5l4) ══════════ */
export function floodBase() {
  const sk = new Sk(W, H, { id: "gfl" });
  floor(sk, 492, 3);
  // 받침
  const saucer = poly([[300, 440], [660, 440], [630, 486], [330, 486]], 5);
  sk.fill(saucer, "#F1E3D2", { dx: 0, dy: 0, wob: 0.5, seed: 11 });
  // 고인 물(세 단계)
  g(sk, "opn-g2u5-fl-w w1", () => sk.fill(poly([[324, 470], [636, 470], [630, 484], [332, 484]], 5), "#9CD3F2", { dx: 0, dy: 0, wob: 0.4, seed: 21 }));
  g(sk, "opn-g2u5-fl-w w2", () => sk.fill(poly([[312, 452], [648, 452], [630, 484], [332, 484]], 5), "#7FC4EE", { dx: 0, dy: 0, wob: 0.4, seed: 22 }));
  g(sk, "opn-g2u5-fl-w w3", () => {
    sk.fill(poly([[304, 442], [656, 442], [630, 484], [332, 484]], 5), "#62B4E8", { dx: 0, dy: 0, wob: 0.4, seed: 23 });
    drop(sk, 276, 470, 1, {});
    drop(sk, 688, 466, 0.9, {});
  });
  sk.ink(saucer, { w: 9, color: POT_D, wob: 0.7, seed: 12 });
  // 화분(마른 흙과 젖은 흙)
  g(sk, "opn-g2u5-fl-pot dry", () => pot(sk, 480, 470, 2.1, 31));
  g(sk, "opn-g2u5-fl-pot wet", () => pot(sk, 480, 470, 2.1, 31, { wet: true }));
  const P = [{ droop: 0 }, { droop: 0.15 }, { droop: 0.6, pale: false }, { droop: 1.05, pale: true }];
  P.forEach((p, i) => g(sk, `opn-g2u5-fl-p p${i}`, () => plant(sk, 480, 318, 1.5, { n: 5, ...p, seed: 60 + i * 40 })));
  // 물방울(물을 줄 때 잠깐 보인다)
  g(sk, "opn-g2u5-fl-d", () => { drop(sk, 420, 120, 1.5, {}); drop(sk, 482, 84, 1.7, {}); drop(sk, 546, 124, 1.5, {}); });
  return { sk };
}

/* ══════════ 4. 뚜껑을 닫은 유리병 (g2u5l5) ══════════ */
export function jarBase() {
  const sk = new Sk(W, H, { id: "gjr" });
  floor(sk, 496, 3);
  g(sk, "opn-g2u5-jr-sun", () => sun(sk, 150, 130, 42, { seed: 7 }));
  g(sk, "opn-g2u5-jr-moon", () => { moon(sk, 800, 130, 48, { seed: 9 }); [[690, 70], [870, 230], [720, 220]].forEach(([x, y]) => sk.dot(x, y, 6, "#C9D4EE")); });
  // 병 속: 흙과 식물
  const soil = poly([[338, 420], [622, 420], [612, 482], [348, 482]], 5);
  sk.fill(soil, "#8A5A3A", { dx: 0, dy: 0, wob: 0.6, seed: 21, tex: 0.7 });
  g(sk, "opn-g2u5-jr-p p0", () => { plant(sk, 420, 420, 0.7, { n: 3, seed: 31 }); plant(sk, 540, 420, 0.8, { n: 3, seed: 51 }); });
  g(sk, "opn-g2u5-jr-p p1", () => { plant(sk, 410, 420, 1.05, { n: 5, seed: 71 }); plant(sk, 548, 420, 1.2, { n: 5, seed: 101 }); });
  // 유리병: 몸통, 목, 뚜껑
  const body = curve([[400, 150], [340, 190], [322, 260], [326, 470], [344, 488], [616, 488], [634, 470], [638, 260], [620, 190], [560, 150]], false, 4);
  sk.ink(body, { w: 10, color: "#7FA7C9", wob: 0.7, seed: 41 });
  sk.ink(dense([[400, 150], [400, 112]], 5), { w: 10, color: "#7FA7C9", wob: 0.4, seed: 42 });
  sk.ink(dense([[560, 150], [560, 112]], 5), { w: 10, color: "#7FA7C9", wob: 0.4, seed: 43 });
  sk.ink(curve([[352, 250], [346, 330], [350, 400]]), { w: 7, color: "#CFE3F2", wob: 0.4, seed: 44 });
  const cork = rrect(388, 70, 184, 50, 10);
  sk.fill(cork, C.wood, { dx: 0, dy: 0, wob: 0.5, seed: 45, tex: 0.8 });
  sk.ink(cork, { w: 9, color: C.woodDark, wob: 0.7, seed: 46 });
  return { sk };
}

/* ══════════ 5. 어린 열매 솎아 내기 (g2u5l6) ══════════ */
export function thinBase() {
  const sk = new Sk(W, H, { id: "gth" });
  const branch = curve([[20, 150], [220, 118], [470, 132], [720, 108], [940, 122]], false, 4);
  sk.ink(branch, { w: 26, color: "#8A5A33", wob: 1, seed: 5 });
  const X = [130, 270, 410, 550, 690, 830];
  const top = (x) => 136 - ((x - 20) / 920) * 22;
  // 잎
  X.forEach((x, i) => { leaf(sk, x - 46, top(x) - 8, 86, 26, -0.5 + (i % 2) * 0.25, { seed: 20 + i * 5 }); leaf(sk, x + 40, top(x) - 8, 82, 25, 0.55 - (i % 2) * 0.2, { color: "#74CC80", seed: 60 + i * 5 }); });
  const apple = (x, y, r, color, line, sd) => {
    sk.ink(dense([[x, top(x) + 8], [x, y - r + 4]], 5), { w: 6, color: "#6B4A32", wob: 0.4, seed: sd });
    const c = circ(x, y, r, { seed: sd + 1, lump: 0.04 });
    sk.fill(c, color, { dx: 0, dy: 0, wob: 0.5, seed: sd + 2 });
    sk.ink(c, { w: Math.max(6, r * 0.14), color: line, wob: 0.6, seed: sd + 3 });
    sk.ink(curve([[x - r * 0.5, y - r * 0.3], [x - r * 0.3, y - r * 0.6], [x - r * 0.05, y - r * 0.66]]), { w: Math.max(4, r * 0.1), color: C.white, wob: 0.3, seed: sd + 4 });
  };
  X.forEach((x, i) => g(sk, `opn-g2u5-th-f f${i}`, () => apple(x, 236, 30, "#B7DB7A", "#5E8A2E", 100 + i * 9)));
  g(sk, "opn-g2u5-th-big", () => [X[0], X[2], X[4]].forEach((x, i) => apple(x, 300, 78, "#E5533F", "#8E2A1E", 200 + i * 9)));
  return { sk };
}

export function build(add) {
  return {
    iodine: { ...add("iodineBase", iodineBase()) },
    shade: { ...add("shadeBase", shadeBase()) },
    flood: { ...add("floodBase", floodBase()) },
    jar: { ...add("jarBase", jarBase()) },
    thin: { ...add("thinBase", thinBase()) },
  };
}
