// 중1 과학 Ⅳ 도입(opener) 네 장면의 그림(손그림 코드 그림). intro-u1.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   lid   (u4l1) 배식대의 큰 통과 뚜껑, 퍼져 가는 냄새, 가까운 아이와 먼 아이
//   spill (u4l2) 넘어진 컵, 쏟아진 주스, 얼음 세 조각, 접시
//   wrap  (u4l4) 뜨거운 국그릇과 그 위에 씌운 랩
//   ramen (u4l5) 가열 장치 위의 냄비, 불꽃, 기포, 온도계
// 실행: node qa/sketch/build-intro.mjs u4  →  src/ui/introArt.u4.generated.ts
import { Sk, C, curve, dense, ell, poly, rrect, squiggle, emark, qmark } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const floor = (sk, y, sd) => sk.ink(dense([[30, y], [930, y + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: sd });

/* ══════════ 1. 뚜껑을 열면 (u4l1) ══════════ */
export const LD = {
  smell: [0.14, 0.34, 0.68, 0.88], // 냄새 묶음이 보이기 시작하는 진행
  near: 0.46, // 가까운 아이가 냄새를 맡는 진행
};
export function lidBase() {
  const sk = new Sk(W, H, { id: "ld" });
  floor(sk, 508, 3);
  // 배식대
  const table = rrect(40, 392, 330, 116, 10);
  sk.fill(table, C.woodLight, { dx: 0.8, dy: 1, wob: 0.8, seed: 5, tex: true });
  sk.ink(table, { w: 9, wob: 0.9, seed: 6 });
  // 큰 통
  const pot = rrect(100, 262, 210, 130, 16);
  sk.fill(pot, "#C3CED9", { dx: 0.8, dy: 1, wob: 0.7, seed: 11, tex: true });
  sk.ink(pot, { w: 10, wob: 0.9, seed: 12 });
  sk.ink(dense([[124, 300], [124, 360]]), { w: 6, color: C.white, wob: 0.4, seed: 13 });
  // 통 속의 음식(뚜껑이 들리면 보인다)
  const food = curve([[112, 262], [150, 246], [205, 240], [260, 246], [298, 262]], false, 3);
  sk.fill([...food, food[0]], C.orange, { dx: 0, dy: 0, wob: 0.5, seed: 14, tex: 0.8 });
  sk.ink(food, { w: 7, wob: 0.6, seed: 15 });
  // 뚜껑
  g(sk, "opn-u4-ld-lid", () => {
    const lid = [...curve([[88, 264], [120, 226], [205, 210], [290, 226], [322, 264]], false, 4), ...dense([[322, 264], [88, 264]], 6)];
    sk.fill(lid, "#9FB0C2", { dx: 0.8, dy: 1, wob: 0.7, seed: 21, tex: true });
    sk.ink(lid, { w: 10, wob: 0.9, seed: 22 });
    const knob = rrect(187, 188, 36, 22, 9);
    sk.fill(knob, C.ink, { dx: 0, dy: 0, wob: 0.3, seed: 23 });
  });
  // 냄새: 구불선 묶음 넷(왼쪽부터 차례로 보인다)
  [372, 478, 690, 772].forEach((x, i) => {
    g(sk, `opn-u4-ld-sm s${i + 1}`, () => {
      [0, 1].forEach((j) => sk.ink(squiggle(x + j * 34, 330 - j * 26, 86, 13, 2, i + j * 1.7, 0.1), { w: 8, color: C.teal, wob: 0.4, seed: 31 + i * 3 + j }));
    });
  });
  // 가까운 아이와 먼 아이
  drawFigure(sk, 590, 506, 0.5, pose({}), { ...STUDENT });
  drawFigure(sk, 866, 506, 0.5, pose({}), { hair: "knit", capColor: "#3F7CC0", seed: 71 });
  g(sk, "opn-u4-ld-em e1", () => emark(sk, 590, 196, 0.62, { seed: 41 }));
  g(sk, "opn-u4-ld-em e2", () => emark(sk, 866, 196, 0.62, { seed: 43 }));
  return { sk };
}

/* ══════════ 2. 쏟아진 얼음과 주스 (u4l2) ══════════ */
export const SP = {
  ice: [[548, 452], [640, 462], [724, 448]], // 바닥의 얼음 가운데
  to: [[792, 300], [846, 292], [900, 302]], // 접시 위의 자리
  iceHit: 104,
  juiceHit: [150, 366, 340, 150],
};
const JUICE = "#F7A93B";
export function spillBase() {
  const sk = new Sk(W, H, { id: "sp" });
  floor(sk, 492, 3);
  // 넘어진 컵
  const cup = poly([[52, 404], [150, 384], [162, 470], [64, 486]], 5);
  sk.fill(cup, "#E8F1F8", { dx: 0.8, dy: 1, wob: 0.6, seed: 5 });
  sk.ink(cup, { w: 9, wob: 0.8, seed: 6 });
  sk.ink(ell(157, 427, 12, 44), { w: 8, wob: 0.6, seed: 7 });
  // 쏟아진 주스
  const puddle = curve([[150, 452], [210, 424], [330, 430], [440, 420], [486, 452], [450, 486], [320, 494], [200, 488]], true, 4);
  sk.fill(puddle, JUICE, { dx: 0.6, dy: 0.8, wob: 0.8, seed: 11, tex: 0.6 });
  sk.ink(puddle, { w: 9, color: "#C97A12", wob: 1, seed: 12 });
  // 집으려다 흘러내리는 주스(앱이 올렸다 내린다)
  g(sk, "opn-u4-sp-scoop", () => {
    const blob = curve([[286, 420], [300, 396], [340, 392], [366, 410], [352, 432], [306, 436]], true, 3);
    sk.fill(blob, JUICE, { dx: 0, dy: 0, wob: 0.5, seed: 15 });
    sk.ink(blob, { w: 7, color: "#C97A12", wob: 0.6, seed: 16 });
    [[300, 452], [328, 466], [352, 450]].forEach(([x, y], i) => {
      const d = curve([[x, y - 16], [x + 8, y], [x, y + 10], [x - 8, y]], true, 3);
      sk.fill(d, JUICE, { dx: 0, dy: 0, wob: 0.3, seed: 17 + i });
      sk.ink(d, { w: 5, color: "#C97A12", wob: 0.3, seed: 20 + i });
    });
  });
  // 접시가 놓인 받침
  const stool = rrect(770, 336, 150, 156, 10);
  sk.fill(stool, C.woodLight, { dx: 0.8, dy: 1, wob: 0.8, seed: 25, tex: true });
  sk.ink(stool, { w: 9, wob: 0.9, seed: 26 });
  sk.fill(ell(846, 330, 96, 20), C.white, { dx: 0, dy: 0, wob: 0.5, seed: 27 });
  sk.ink(ell(846, 330, 96, 20), { w: 9, wob: 0.7, seed: 28 });
  // 얼음 세 조각
  SP.ice.forEach(([x, y], i) => {
    g(sk, `opn-u4-sp-ice i${i + 1}`, () => {
      const c = rrect(x - 30, y - 30, 60, 60, 10);
      sk.fill(c, "#D6EEFA", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 31 + i * 3 });
      sk.ink(c, { w: 9, color: C.blue, wob: 0.8, seed: 32 + i * 3 });
      sk.ink(dense([[x - 14, y - 12], [x - 2, y - 18]]), { w: 6, color: C.white, wob: 0.3, seed: 33 + i * 3 });
    });
  });
  g(sk, "opn-u4-sp-q", () => qmark(sk, 320, 330, 0.7, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 3. 국그릇 위의 랩 (u4l4) ══════════ */
export const WR = { rimY: 300 };
export function wrapBase() {
  const sk = new Sk(W, H, { id: "wr" });
  floor(sk, 478, 3);
  // 김(랩 안쪽, 뜨거울 때만 보인다)
  g(sk, "opn-u4-wr-steam", () => {
    [400, 480, 560].forEach((x, i) => sk.ink(squiggle(x, 292, 70, 12, 1.5, i * 1.3), { w: 8, color: C.gray, wob: 0.4, seed: 11 + i }));
  });
  // 랩: 볼록한 모양으로 그려 두고 앱이 세로로 눌렀다 폈다 한다(바닥 기준)
  g(sk, "opn-u4-wr-wrap", () => {
    const dome = curve([[286, 300], [340, 214], [480, 176], [620, 214], [674, 300]], false, 4);
    sk.fill([...dome, ...dense([[674, 300], [286, 300]], 6)], "#BFE2F4", { dx: 0, dy: 0, wob: 0.5, seed: 21, alpha: 0.45, tex: false });
    sk.ink(dome, { w: 9, color: C.blue, wob: 0.8, seed: 22 });
    sk.ink(curve([[370, 232], [420, 208], [470, 200]]), { w: 6, color: C.white, wob: 0.4, seed: 23 });
  });
  // 그릇과 국
  const soup = [...dense([[306, 318], [654, 318]], 6), ...curve([[654, 318], [630, 400], [590, 446], [370, 446], [330, 400], [306, 318]], false, 4)];
  sk.fill(soup, "#E3A15A", { dx: 0, dy: 0, wob: 0.5, seed: 31, tex: 0.6 });
  const bowl = curve([[286, 300], [316, 404], [372, 462], [588, 462], [644, 404], [674, 300]], false, 4);
  sk.ink(bowl, { w: 11, wob: 0.9, seed: 32 });
  sk.ink(dense([[306, 318], [654, 318]], 6), { w: 7, color: "#B9743A", wob: 0.6, seed: 33 });
  sk.ink(dense([[420, 478], [540, 478]], 6), { w: 10, wob: 0.6, seed: 34 });
  // 랩 가장자리(그릇 밖으로 늘어진 부분)
  sk.ink(curve([[286, 300], [268, 318], [262, 344]]), { w: 8, color: C.blue, wob: 0.5, seed: 35 });
  sk.ink(curve([[674, 300], [692, 318], [698, 344]]), { w: 8, color: C.blue, wob: 0.5, seed: 36 });
  // 식은 뒤의 랩: 그릇 안쪽으로 오목하게 처진다(앱이 위쪽 기준으로 폈다 접는다)
  g(sk, "opn-u4-wr-dent", () => {
    const dent = curve([[286, 300], [370, 334], [480, 346], [590, 334], [674, 300]], false, 4);
    sk.fill([...dent, ...dense([[674, 300], [286, 300]], 6)], "#BFE2F4", { dx: 0, dy: 0, wob: 0.4, seed: 37, alpha: 0.5, tex: false });
    sk.ink(dent, { w: 9, color: C.blue, wob: 0.7, seed: 38 });
  });
  g(sk, "opn-u4-wr-q", () => qmark(sk, 800, 240, 0.8, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 4. 끓는 물과 센 불 (u4l5) ══════════ */
export const RM = { levels: 4 };
export function ramenBase() {
  const sk = new Sk(W, H, { id: "rm" });
  floor(sk, 508, 3);
  // 가열 장치
  const burner = rrect(330, 452, 300, 54, 12);
  sk.fill(burner, "#5B6470", { dx: 0.8, dy: 1, wob: 0.6, seed: 5, tex: true });
  sk.ink(burner, { w: 9, wob: 0.8, seed: 6 });
  // 불꽃(앱이 바닥 기준으로 키운다)
  g(sk, "opn-u4-rm-flame", () => {
    [[420, 0.8], [480, 1], [540, 0.8]].forEach(([x, k], i) => {
      const fl = curve([[x - 20, 452], [x - 14, 452 - 30 * k], [x, 452 - 58 * k], [x + 14, 452 - 30 * k], [x + 20, 452]], false, 3);
      sk.fill([...fl, fl[0]], i === 1 ? C.orange : C.yellow, { dx: 0, dy: 0, wob: 0.4, seed: 11 + i });
      sk.ink(fl, { w: 7, color: C.red, wob: 0.5, seed: 14 + i });
    });
  });
  // 김(불이 세질수록 많이 보인다)
  [[400, 1], [480, 2], [540, 3]].forEach(([x, lv], i) => {
    g(sk, `opn-u4-rm-steam v${lv}`, () => sk.ink(squiggle(x, 236, 90, 14, 1.6, i * 1.4), { w: 8, color: C.gray, wob: 0.4, seed: 21 + i }));
  });
  // 냄비와 물
  const pot = rrect(340, 262, 280, 140, 18);
  sk.fill(pot, "#C3CED9", { dx: 0.8, dy: 1, wob: 0.7, seed: 31, tex: true });
  const water = rrect(352, 286, 256, 104, 12);
  sk.fill(water, "#A9D8F2", { dx: 0, dy: 0, wob: 0.4, seed: 32 });
  sk.ink(pot, { w: 10, wob: 0.9, seed: 33 });
  sk.ink(dense([[352, 286], [608, 286]], 6), { w: 7, color: C.blue, wob: 0.7, seed: 34 });
  sk.ink(curve([[340, 300], [304, 300], [300, 322]]), { w: 10, wob: 0.6, seed: 35 });
  sk.ink(curve([[620, 300], [656, 300], [660, 322]]), { w: 10, wob: 0.6, seed: 36 });
  // 기포(불이 세질수록 많이 보인다)
  const BUB = [
    [[400, 372, 9], [470, 364, 11], [540, 374, 9]],
    [[436, 340, 12], [506, 334, 10]],
    [[380, 322, 13], [470, 312, 14], [556, 320, 12]],
    [[420, 300, 15], [510, 296, 16], [590, 344, 11], [366, 350, 10]],
  ];
  BUB.forEach((list, lv) => {
    g(sk, `opn-u4-rm-bub v${lv + 1}`, () => list.forEach(([x, y, r], i) => {
      sk.fill(ell(x, y, r, r), C.white, { dx: 0, dy: 0, wob: 0.3, seed: 41 + lv * 5 + i });
      sk.ink(ell(x, y, r, r), { w: 5, color: C.blue, wob: 0.4, seed: 61 + lv * 5 + i });
    }));
  });
  // 온도계: 물에 꽂은 유리관과 빨간 기둥(높이는 변하지 않는다), 기둥 끝을 가리키는 표시
  const tube = rrect(726, 70, 34, 370, 17);
  sk.fill(tube, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 71 });
  sk.raw(`<rect class="opn-u4-rm-col" x="735" y="150" width="16" height="278" rx="8" fill="${C.red}"/>`);
  sk.ink(tube, { w: 8, wob: 0.5, seed: 72 });
  for (let y = 100, i = 0; y < 420; y += 50, i++) sk.ink(dense([[766, y], [i % 2 ? 780 : 790, y]]), { w: 4, color: C.gray, wob: 0.2, seed: 73 + i });
  sk.ink(curve([[620, 380], [680, 420], [743, 440]]), { w: 6, color: C.gray, wob: 0.5, seed: 81, dash: [14, 12] });
  g(sk, "opn-u4-rm-mark", () => {
    sk.ink(dense([[800, 150], [860, 150]], 6), { w: 9, color: C.orange, wob: 0.5, seed: 85 });
    sk.ink(dense([[800, 150], [822, 136]]), { w: 9, color: C.orange, wob: 0.3, seed: 86 });
    sk.ink(dense([[800, 150], [822, 164]]), { w: 9, color: C.orange, wob: 0.3, seed: 87 });
  });
  return { sk };
}

export function build(add) {
  return {
    lid: { ...LD, ...add("lidBase", lidBase()) },
    spill: { ...SP, ...add("spillBase", spillBase()) },
    wrap: { ...WR, ...add("wrapBase", wrapBase()) },
    ramen: { ...RM, ...add("ramenBase", ramenBase()) },
  };
}
