// 중1 과학 Ⅳ 도입(opener) 네 장면의 그림(손그림 코드 그림). intro-u1.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   lid   (u4l1) 배식대의 큰 통과 뚜껑, 퍼져 가는 냄새, 가까운 아이와 먼 아이
//   spill (u4l2) 그릇 위에 걸친 구멍 뚫린 체, 구슬 얼음이 든 컵, 물 컵(체에 차례로 붓는다)
//   wrap  (u4l4) 따뜻한 물을 조금 넣고 뚜껑을 닫은 얇은 페트병, 뜨거운 물 대야, 얼음물 대야
//   ramen (u4l5) 가열 장치 위의 냄비, 불꽃, 기포, 온도계
// 실행: node qa/sketch/build-intro.mjs u4  →  src/ui/introArt.u4.generated.ts
import { Sk, C, curve, dense, ell, poly, rrect, squiggle, emark, qmark, circ, drop } from "../lib/sk.mjs";
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

/* ══════════ 2. 체에 붓는 구슬 얼음과 물 (u4l2) ══════════
   가운데 유리 그릇 위에 구멍 뚫린 체가 걸쳐 있다. 왼쪽 컵에는 구슬 얼음 셋, 오른쪽 컵에는 물.
   컵을 누르면 들어 기울인 컵(.b)이 보이고, 얼음은 체 바닥으로 옮겨 가 그대로 남는다. 물은 체의 구멍으로 빠져나가 그릇에 고인다. */
export const SP = {
  ice: [[128, 412], [170, 408], [148, 448]], // 컵 속 구슬 얼음의 가운데
  to: [[438, 360], [482, 366], [526, 360]], // 체 바닥의 자리
  cupHit: [70, 330, 170, 170], // 얼음 컵을 누르는 자리(x, y, w, h)
  jugHit: [726, 330, 190, 170], // 물 컵을 누르는 자리
};
const GLASS = "#EAF4FB", WATER = "#8EC9EE", WATER_LINE = "#4E9BD3";
function iceBall(sk, x, y, r, sd) {
  const b = circ(x, y, r, { over: 0.1, seed: sd });
  sk.fill(b, "#DDF1FB", { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd + 1 });
  sk.ink(b, { w: 8, color: C.blue, wob: 0.6, seed: sd + 2 });
  sk.ink(curve([[x - r * 0.5, y - r * 0.2], [x - r * 0.3, y - r * 0.55], [x, y - r * 0.62]]), { w: 5, color: C.white, wob: 0.2, seed: sd + 3 });
}
// 컵(원점 = 바닥 가운데, 위가 음수). full이면 물을 채운다
function cupShape(sk, full, sd) {
  const body = poly([[-50, -116], [50, -116], [42, 0], [-42, 0]], 4);
  sk.fill(body, GLASS, { dx: 0, dy: 0, wob: 0.5, seed: sd, alpha: 0.85, tex: false });
  if (full) {
    const w = poly([[-46, -78], [46, -78], [42, -6], [-42, -6]], 4);
    sk.fill(w, WATER, { dx: 0, dy: 0, wob: 0.4, seed: sd + 1, alpha: 0.9, tex: false });
    sk.ink(dense([[-46, -78], [46, -78]]), { w: 6, color: WATER_LINE, wob: 0.4, seed: sd + 2 });
  }
  sk.ink(body, { w: 9, wob: 0.7, seed: sd + 3 });
  sk.ink(dense([[-30, -100], [-26, -24]]), { w: 5, color: C.white, wob: 0.3, seed: sd + 4 });
}
export function spillBase() {
  const sk = new Sk(W, H, { id: "sp" });
  floor(sk, 492, 3);
  // 유리 그릇
  const bowl = curve([[330, 356], [350, 440], [400, 486], [560, 486], [610, 440], [630, 356]], false, 4);
  sk.fill([...bowl, [330, 356]], GLASS, { dx: 0, dy: 0, wob: 0.5, seed: 5, alpha: 0.8, tex: false });
  // 그릇에 고이는 물(앱이 바닥 기준으로 키운다)
  g(sk, "opn-u4-sp-pool", () => {
    const pool = curve([[362, 430], [598, 430], [588, 456], [556, 480], [404, 480], [372, 456]], true, 4);
    sk.fill(pool, WATER, { dx: 0, dy: 0, wob: 0.4, seed: 7, alpha: 0.95, tex: false });
    sk.ink(dense([[364, 430], [596, 430]]), { w: 6, color: WATER_LINE, wob: 0.4, seed: 8 });
  });
  // 체 구멍으로 떨어지는 물방울(물을 부을 때만 보인다)
  g(sk, "opn-u4-sp-drip", () => {
    [[446, 412], [482, 420], [518, 410], [464, 438], [502, 440]].forEach(([x, y], i) => drop(sk, x, y, 0.55, { seed: 11 + i, color: "#BFE2F4", line: WATER_LINE }));
  });
  sk.ink(bowl, { w: 10, wob: 0.9, seed: 9 });
  // 구멍 뚫린 체: 반구 바구니 + 구멍 + 테두리 + 손잡이
  const basket = curve([[352, 302], [372, 350], [420, 384], [480, 394], [540, 384], [588, 350], [608, 302]], false, 4);
  sk.fill([...basket, [352, 302]], "#DCE2E8", { dx: 0.6, dy: 0.8, wob: 0.5, seed: 21, tex: true });
  for (let row = 0; row < 6; row++) {
    const y = 316 + row * 13;
    const half = Math.sqrt(Math.max(0, 1 - ((y - 302) / 92) ** 2)) * 122 - 12;
    for (let x = 480 - half; x <= 480 + half; x += 17) sk.raw(`<circle cx="${(x + (row % 2) * 8).toFixed(1)}" cy="${y}" r="3.4" fill="#7B8794"/>`);
  }
  sk.ink(basket, { w: 9, wob: 0.8, seed: 22 });
  sk.ink(ell(480, 302, 130, 20), { w: 9, color: "#5B6470", wob: 0.6, seed: 23 });
  sk.ink(dense([[606, 298], [712, 262]]), { w: 16, color: "#5B6470", wob: 0.4, seed: 24 });
  sk.ink(dense([[700, 266], [738, 252]]), { w: 22, color: C.ink, wob: 0.3, seed: 25 });
  // 왼쪽: 얼음 컵(서 있는 것 .a, 들어 기울인 것 .b)
  g(sk, "opn-u4-sp-cup a", () => sk.at(150, 490, 1, () => cupShape(sk, false, 31)));
  g(sk, "opn-u4-sp-cup b", () => sk.at(318, 220, 1, () => cupShape(sk, false, 36), 2.15));
  // 오른쪽: 물 컵(서 있는 것 .a, 들어 기울인 것 .b)과 물줄기
  g(sk, "opn-u4-sp-jug a", () => sk.at(820, 490, 1, () => cupShape(sk, true, 41)));
  g(sk, "opn-u4-sp-jug b", () => sk.at(650, 214, 1, () => cupShape(sk, true, 46), -2.15));
  g(sk, "opn-u4-sp-stream", () => sk.ink(curve([[596, 262], [560, 282], [526, 312], [506, 340]]), { w: 14, color: WATER_LINE, wob: 0.4, seed: 51 }));
  // 구슬 얼음 셋(앱이 컵 속에서 체 바닥으로 옮긴다)
  SP.ice.forEach(([x, y], i) => g(sk, `opn-u4-sp-ice i${i + 1}`, () => iceBall(sk, x, y, 22, 61 + i * 5)));
  return { sk };
}

/* ══════════ 3. 따뜻한 물을 조금 넣고 닫은 페트병 (u4l4) ══════════
   병(바닥 가운데 BT.start)을 뜨거운 물 대야(BT.hot)로 옮기면 볼록해지고, 얼음물 대야(BT.cold)로 옮기면 찌그러진다.
   병 묶음(.opn-u4-bt-move)은 앱이 옮기고, 바로 선 병(.opn-u4-bt-body)은 가로로 부풀리며, 찌그러진 병(.opn-u4-bt-dent)은 끝에 바꿔 보인다.
   대야의 앞 물은 병보다 나중에 그려 병의 아랫부분이 물에 잠겨 보이게 한다. */
export const BT = { start: [480, 470], hot: [250, 404], cold: [710, 404] }; // 공기가 든 병은 물에 떠 아랫부분만 잠긴다
function basin(sk, cx, water, line, sd) {
  const back = ell(cx, 330, 128, 22);
  sk.fill(back, "#EEF2F6", { dx: 0, dy: 0, wob: 0.4, seed: sd });
  sk.ink(ell(cx, 330, 128, 22, Math.PI, Math.PI * 2), { w: 8, wob: 0.5, seed: sd + 1 });
  return () => {
    const front = curve([[cx - 128, 330], [cx - 116, 420], [cx - 92, 470], [cx + 92, 470], [cx + 116, 420], [cx + 128, 330]], false, 4);
    const wat = curve([[cx - 122, 362], [cx + 122, 362], [cx + 112, 420], [cx + 90, 462], [cx - 90, 462], [cx - 112, 420]], true, 4);
    sk.fill(wat, water, { dx: 0, dy: 0, wob: 0.4, seed: sd + 2, alpha: 0.62, tex: false });
    sk.ink(dense([[cx - 122, 362], [cx + 122, 362]], 6), { w: 6, color: line, wob: 0.5, seed: sd + 3 });
    sk.ink(front, { w: 10, wob: 0.8, seed: sd + 4 });
    sk.ink(ell(cx, 330, 128, 22, 0, Math.PI), { w: 8, wob: 0.5, seed: sd + 5 });
  };
}
// 페트병(원점 = 바닥 가운데). dent면 찌그러진 모양
function petBottle(sk, dent, sd) {
  const L = dent
    ? [[-34, 0], [-24, -24], [-6, -42], [-30, -62], [-8, -84], [-30, -106], [-12, -128], [-26, -146]]
    : [[-36, 0], [-38, -20], [-38, -134], [-36, -146]];
  const SHIFT = [0, 8, 18, -4, 16, -6, 12, 0];
  const R = L.map(([x, y], i) => [dent ? -x + SHIFT[i] : -x, y]).reverse();
  const body = curve([...L, [-24, -160], [-14, -172], [-14, -182], [14, -182], [14, -172], [24, -160], ...R], true, 4);
  sk.fill(body, "#E4F2FA", { dx: 0, dy: 0, wob: 0.4, seed: sd, alpha: 0.85, tex: false });
  const water = dent ? poly([[-30, -26], [32, -24], [34, -6], [-32, -6]], 4) : poly([[-34, -34], [34, -34], [34, -6], [-34, -6]], 4);
  sk.fill(water, "#9CCFF0", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1, alpha: 0.95, tex: false });
  sk.ink(body, { w: 8, color: dent ? "#2F7FBF" : "#4E9BD3", wob: 0.5, seed: sd + 2 });
  if (dent) {
    [[-6, -42, 22, -36], [-8, -84, 22, -80], [-12, -128, 18, -122], [-24, -24, 10, -62], [-8, -84, 16, -106]].forEach(([x1, y1, x2, y2], i) => sk.ink(dense([[x1, y1], [x2, y2]]), { w: 5, color: "#2F7FBF", wob: 0.3, seed: sd + 3 + i }));
  } else {
    [-70, -104].forEach((y, i) => sk.ink(dense([[-34, y], [34, y]]), { w: 5, color: "#B9DDF2", wob: 0.3, seed: sd + 3 + i }));
    sk.ink(dense([[-24, -126], [-24, -50]]), { w: 6, color: C.white, wob: 0.2, seed: sd + 6 });
  }
  const cap = rrect(-17, -198, 34, 20, 5);
  sk.fill(cap, "#3FAE5A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 7 });
  sk.ink(cap, { w: 7, wob: 0.3, seed: sd + 8 });
}
export function wrapBase() {
  const sk = new Sk(W, H, { id: "wr" });
  floor(sk, 478, 3);
  // 뜨거운 물 대야(왼쪽)와 김
  const hotFront = basin(sk, BT.hot[0], "#F7B38A", "#D9773F", 11);
  g(sk, "opn-u4-bt-steam", () => [BT.hot[0] - 70, BT.hot[0] + 70].forEach((x, i) => sk.ink(squiggle(x, 300, 74, 12, 1.5, i * 1.3), { w: 8, color: C.gray, wob: 0.4, seed: 17 + i })));
  // 얼음물 대야(오른쪽)
  const coldFront = basin(sk, BT.cold[0], "#BFE2F4", C.blue, 21);
  // 병 묶음: 바로 선 병, 찌그러진 병, 식을 때 안쪽에 맺히는 물방울
  g(sk, "opn-u4-bt-move", () => {
    g(sk, "opn-u4-bt-body", () => sk.at(BT.start[0], BT.start[1], 1, () => petBottle(sk, false, 31)));
    g(sk, "opn-u4-bt-dent", () => sk.at(BT.start[0], BT.start[1], 1, () => petBottle(sk, true, 41)));
    g(sk, "opn-u4-bt-dew", () => [[-20, -120], [18, -100], [-24, -78], [22, -60]].forEach(([dx, dy]) => sk.raw(`<ellipse cx="${BT.start[0] + dx}" cy="${BT.start[1] + dy}" rx="4.5" ry="6" fill="#BFE6FF" stroke="#4E9BD3" stroke-width="2.5"/>`)));
  });
  hotFront();
  coldFront();
  // 얼음물에 뜬 얼음 조각
  [[BT.cold[0] - 84, 380], [BT.cold[0] + 80, 376], [BT.cold[0] + 62, 418]].forEach(([x, y], i) => {
    const cube = rrect(x - 20, y - 18, 40, 36, 8);
    sk.fill(cube, "#F2FBFF", { dx: 0.4, dy: 0.6, wob: 0.4, seed: 51 + i * 2 });
    sk.ink(cube, { w: 6, color: C.blue, wob: 0.5, seed: 52 + i * 2 });
  });
  g(sk, "opn-u4-wr-q", () => qmark(sk, 480, 150, 0.8, { color: C.orange, seed: 45 }));
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
    wrap: { ...BT, ...add("wrapBase", wrapBase()) },
    ramen: { ...RM, ...add("ramenBase", ramenBase()) },
  };
}
