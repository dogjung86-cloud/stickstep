// 중2 과학 Ⅰ단원(물질의 특성) 개념 컷 코드 그림.
// 목록은 Ⅰ단원 v5 세션이 낸 것(D:\Brilliant Science\output\g2-v5\u1\concept-cuts.md): g2u1l1, g2u1l3, g2u1l5, g2u1l6, g2u1l8, g2u1l9.
// 색의 뜻: 물은 옅은 하늘색, 설탕과 솜은 흰색, 쇠는 회청색, 얼음은 옅은 파랑, 뜨거운 쪽(불, 온도계 기둥)은 주황과 빨강.
// 과일은 제 색(사과 빨강, 귤 주황, 포도 보라)으로 그려 종류가 색만으로 갈리게 한다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, arrow, sparkle, drop } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { kettle, sun, lemon } from "../../lib/props.mjs";
import { W, H, lerpx, thin, steam, ray } from "./common.mjs";

const WATER = "#BFE3F5", GLASS = "#EEF7FC", STEEL = "#8E9AA8", ICE = "#D3ECFA";
const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
function ball(sk, x, y, r, col, sd, lw) {
  const b = circ(x, y, r, { over: 0.1, seed: sd });
  sk.fill(b, col, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
  sk.ink(b, { w: lw ?? Math.max(4, Math.min(9, r * 0.32)), seed: sd + 2, wob: 0.3 });
  sk.ink(curve([[x - r * 0.52, y - r * 0.2], [x - r * 0.34, y - r * 0.5], [x - r * 0.04, y - r * 0.6]]), { w: Math.max(2.5, r * 0.13), color: C.white, seed: sd + 3, wob: 0.1 });
}
function table(sk, x0, x1, y, GY, sd, k = 0.8) {
  thin(sk, k, () => {
    for (const [x, i] of [[x0 + 30, 0], [x1 - 30, 1]]) sk.ink(dense([[x, y + 22], [x - 3 + i * 6, GY]]), { w: 12, seed: sd + i });
    const top = rrect(x0, y, x1 - x0, 24, 8);
    sk.fill(top, C.wood, { seed: sd + 2, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: sd + 3 });
  });
}

/* ---------- g2u1l1: 크기가 똑같은 두 상자. 솜 상자는 가볍게 들고, 쇠구슬 상자 쪽 팔은 축 처진다 ---------- */
const BW = 184, BH = 164; // 두 상자가 함께 쓰는 크기(부피가 같다)
function box(sk, cx, by, sd, inside) {
  const out = rrect(cx - BW / 2, by - BH, BW, BH, 12), inn = rrect(cx - BW / 2 + 15, by - BH + 15, BW - 30, BH - 30, 6);
  sk.fill(out, C.wood, { dx: 0, dy: 0, wob: 0.3, seed: sd, tex: 0.6 });
  sk.fill(inn, "#DCE6EE", { dx: 0, dy: 0, wob: 0.2, seed: sd + 1 });
  inside();
  thin(sk, 0.8, () => { sk.ink(inn, { w: 7, seed: sd + 2, wob: 0.6 }); sk.ink(out, { w: 11, seed: sd + 3 }); });
}
function cutL1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 668, fx = 462, s = 0.8;
  ground(sk, GY, 11);
  const P = pose({ elL: [-124, -296], haL: [-226, -344], elR: [108, -164], haR: [200, -130], tilt: 0.1, head: [-6, -436] });
  drawFigure(sk, fx, GY, s, P, { ...TEACHER, name: "teacher", hands: false });
  // 왼쪽(가벼운 쪽): 솜이 가득
  const lh = [fx - s * 226, GY - s * 344], rh = [fx + s * 200, GY - s * 130];
  const LX = lh[0] - 24, LB = lh[1] - 6;
  box(sk, LX, LB, 21, () => {
    const pts = [[-48, -40], [0, -38], [48, -40], [-26, -76], [26, -78], [-50, -112], [0, -118], [50, -112], [-24, -134], [26, -134]];
    pts.forEach(([dx, dy], i) => {
      const c = circ(LX + dx, LB + dy, 27, { over: 0.1, seed: 31 + i * 3, lump: 0.08 });
      sk.fill(c, C.white, { dx: 0, dy: 0, wob: 0.5, seed: 32 + i * 3 });
      sk.ink(c, { w: 4, color: "#9AA7B4", seed: 33 + i * 3, wob: 0.8 });
    });
  });
  // 오른쪽(무거운 쪽): 쇠구슬이 가득
  const RX = rh[0] + 72, RB = rh[1] - 6;
  box(sk, RX, RB, 71, () => {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ball(sk, RX + (c - 1) * 49, RB - 38 - r * 44, 21.5, STEEL, 81 + r * 20 + c * 5, 6);
  });
  handDot(sk, lh, C.skin, 151, 13);
  handDot(sk, rh, C.skin, 153, 13);
  // 처지는 쪽: 아래 화살표와 땀방울
  arrow(sk, [[RX + BW / 2 + 34, RB - 132], [RX + BW / 2 + 34, RB - 30]], { w: 10, color: C.gray, straight: true, seed: 161, head: 24, wob: 0.2 });
  drop(sk, fx + 96, GY - s * 436 - 62, 0.9, { seed: 171 });
  return sk;
}

/* ---------- g2u1l3: 작은 컵 바닥에는 설탕이 쌓였고, 큰 물통에는 같은 양이 다 녹았다 ---------- */
function vessel(sk, cx, by, w, h, level, sd, inside, lid, col = WATER, line = "#7FBFE0") {
  const body = rrect(cx - w / 2, by - h, w, h, Math.min(24, w * 0.16));
  sk.fill(body, GLASS, { dx: 0, dy: 0, wob: 0.3, seed: sd });
  sk.fill(rrect(cx - w / 2 + 5, by - level, w - 10, level - 4, Math.min(20, w * 0.14)), col, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
  inside?.();
  thin(sk, 0.8, () => {
    sk.ink(dense([[cx - w / 2 + 8, by - level], [cx + w / 2 - 8, by - level]]), { w: 5, color: line, seed: sd + 2, wob: 0.6 });
    sk.ink(dense([[cx - w / 2 + 16, by - h + 30], [cx - w / 2 + 16, by - h * 0.45]]), { w: 5, color: C.white, seed: sd + 3, wob: 0.2 });
    sk.ink(body, { w: 10, seed: sd + 4 });
    if (lid) { const rim = rrect(cx - w / 2 - 8, by - h - 14, w + 16, 26, 10); sk.fill(rim, "#F2C94C", { dx: 0, dy: 0, wob: 0.3, seed: sd + 5 }); sk.ink(rim, { w: 9, seed: sd + 6 }); }
  });
}
function cubes(sk, cx, y, sd) {
  // 각설탕 셋: 옆면과 윗면이 보이는 흰 덩어리(두 그릇에 넣은 양이 같다)
  for (let i = 0; i < 3; i++) {
    const x = cx - 76 + i * 54, d = 11;
    const side = poly([[x + 40, y], [x + 40 + d, y - d], [x + 40 + d, y + 40 - d], [x + 40, y + 40]], 3), top = poly([[x, y], [x + d, y - d], [x + 40 + d, y - d], [x + 40, y]], 3), face = rrect(x, y, 40, 40, 4);
    sk.fill(side, "#B9C6D3", { dx: 0, dy: 0, wob: 0.2, seed: sd + i }); sk.ink(side, { w: 5, seed: sd + 20 + i, wob: 0.3 });
    sk.fill(top, "#DEE6EE", { dx: 0, dy: 0, wob: 0.2, seed: sd + i }); sk.ink(top, { w: 5, seed: sd + 30 + i, wob: 0.3 });
    sk.fill(face, C.white, { dx: 0, dy: 0, wob: 0.2, seed: sd + i }); sk.ink(face, { w: 6, seed: sd + 4 + i, wob: 0.4 });
    for (const [gx, gy] of [[11, 12], [27, 17], [16, 28], [30, 31]]) sk.dot(x + gx, y + gy, 2.2, "#AEB7C1");
  }
  sparkle(sk, cx + 104, y - 8, 15, { seed: sd + 50 });
  arrow(sk, [[cx, y + 54], [cx, y + 92]], { w: 7, color: C.gray, straight: true, seed: sd + 9, head: 16, wob: 0.2 });
}
function cutL3() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 668, TY = 520;
  ground(sk, GY, 11);
  table(sk, 286, 936, TY, GY, 15);
  // 작은 컵: 바닥에 녹지 못한 설탕이 쌓였다
  const cx = 420, cw = 128, ch = 150;
  vessel(sk, cx, TY, cw, ch, 122, 21, () => {
    const pile = [...curve([[cx - cw / 2 + 9, TY - 7], [cx - 38, TY - 36], [cx - 4, TY - 58], [cx + 34, TY - 38], [cx + cw / 2 - 9, TY - 7]]), [cx - cw / 2 + 9, TY - 7]];
    sk.fill(pile, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 31 });
    sk.ink(pile, { w: 6, seed: 32, wob: 0.6 });
    for (const [dx, dy, i] of [[-22, -22, 0], [8, -30, 1], [26, -16, 2], [-4, -44, 3]]) sk.dot(cx + dx, TY + dy, 2.6, "#B9C2CC");
    for (const [dx, dy] of [[-10, -84], [6, -102], [-4, -70]]) sk.dot(cx + dx, TY + dy, 3.4, C.white);
  });
  cubes(sk, cx, TY - ch - 176, 41);
  // 커다란 물통: 같은 양이 흔적 없이 녹았다
  const tx = 730, tw = 290, th = 330;
  vessel(sk, tx, TY, tw, th, 286, 61, null, true);
  cubes(sk, tx, 52, 81);
  sparkle(sk, tx + 62, TY - 150, 24, { seed: 91 });
  lemon(sk, 548, TY - 22, 24, { seed: 95 });
  // 숟가락을 든 학생
  const fx = 150, s = 0.72;
  const P = pose({ elL: [-60, -250], haL: [-84, -180], elR: [108, -268], haR: [196, -300], tilt: 0.06 });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student", mirror: false, hands: "L" });
  const hx = fx + s * 196, hy = GY - s * 300;
  thin(sk, 0.8, () => {
    sk.ink(dense([[hx - 6, hy + 4], [cx - 48, TY - ch - 22]]), { w: 9, seed: 101, wob: 0.3 });
    const bowl = ell(cx - 30, TY - ch - 26, 24, 12);
    sk.fill(bowl, "#D5DCE4", { dx: 0, dy: 0, wob: 0.2, seed: 102 }); sk.ink(bowl, { w: 7, seed: 103, wob: 0.3 });
    const heap = [...curve([[cx - 50, TY - ch - 28], [cx - 30, TY - ch - 48], [cx - 10, TY - ch - 28]]), [cx - 50, TY - ch - 28]];
    sk.fill(heap, C.white, { dx: 0, dy: 0, wob: 0.2, seed: 104 }); sk.ink(heap, { w: 5, seed: 105, wob: 0.3 });
  });
  handDot(sk, [hx, hy], C.skin, 107, 15 * s);
  return sk;
}

/* ---------- g2u1l5: 처마 끝 고드름은 녹아 떨어지고, 모닥불 위 주전자에서는 김이 솟는다 ---------- */
function thermometer(sk, x, y0, y1, sd) {
  // 숫자 없는 온도계: 유리 대롱 + 빨간 기둥 + 둥근 구부
  const tube = rrect(x - 13, y0, 26, y1 - y0, 13);
  sk.fill(tube, C.white, { dx: 0, dy: 0, wob: 0.2, seed: sd });
  sk.ink(dense([[x, y0 + (y1 - y0) * 0.42], [x, y1]]), { w: 11, color: C.red, seed: sd + 1, wob: 0.1 });
  thin(sk, 0.8, () => sk.ink(tube, { w: 8, seed: sd + 2, wob: 0.5 }));
  ball(sk, x, y1 + 8, 23, C.red, sd + 3, 7);
}
function cutL5() {
  const sk = new Sk(W, H, { id: "c" });
  const GY = 668;
  ground(sk, GY, 11);
  // 처마와 눈
  thin(sk, 0.8, () => {
    const eave = poly([[10, 96], [340, 96], [340, 132], [10, 132]], 3);
    sk.fill(eave, "#A9773F", { dx: 0, dy: 0, wob: 0.3, seed: 21, tex: 0.6 });
    const snow = [...curve([[10, 98], [16, 62], [90, 50], [170, 58], [250, 48], [330, 62], [346, 98]]), [10, 98]];
    sk.fill(snow, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 22 });
    sk.ink(snow, { w: 8, seed: 23 }); sk.ink(eave, { w: 10, seed: 24 });
    // 고드름 셋(가운데가 크다)
    for (const [x, hw, len, i] of [[84, 17, 96, 0], [196, 30, 206, 1], [296, 15, 74, 2]]) {
      const ic = [...curve([[x - hw, 132], [x - hw * 0.5, 132 + len * 0.5], [x, 132 + len]]), ...curve([[x, 132 + len], [x + hw * 0.5, 132 + len * 0.5], [x + hw, 132]]), [x - hw, 132]];
      sk.fill(ic, ICE, { dx: 0, dy: 0, wob: 0.3, seed: 31 + i * 4 });
      sk.ink(ic, { w: 8, seed: 32 + i * 4, wob: 0.6 });
      sk.ink(dense([[x - hw * 0.35, 146], [x - hw * 0.12, 132 + len * 0.5]]), { w: 4, color: C.white, seed: 33 + i * 4, wob: 0.2 });
    }
  });
  // 끝에서 떨어지는 물방울과 바닥의 물웅덩이
  drop(sk, 196, 378, 0.8, { seed: 45 }); drop(sk, 196, 462, 0.95, { seed: 47 });
  const pud = ell(196, GY - 4, 62, 11);
  sk.fill(pud, WATER, { dx: 0, dy: 0, wob: 0.3, seed: 48 }); sk.ink(pud, { w: 6, color: "#5FAEDD", seed: 49, wob: 0.4 });
  // 해와 고드름으로 가는 볕
  sun(sk, 520, 100, 46, { seed: 51 });
  ray(sk, [452, 140], [262, 214], 55, { amp: 6, waves: 4 });
  // 모닥불과 그 위의 주전자
  const kx = 446, ky = 548;
  thin(sk, 0.8, () => {
    for (const [a, b, i] of [[[kx - 92, GY - 6], [kx + 70, GY - 30]], [[kx + 92, GY - 6], [kx - 70, GY - 30]]].map((p, i) => [...p, i])) sk.ink(dense([a, b]), { w: 20, color: "#8A5A33", seed: 61 + i, wob: 0.6 });
    const fl = curve([[kx - 54, GY - 24], [kx - 62, GY - 64], [kx - 30, GY - 92], [kx - 22, GY - 70], [kx, GY - 118], [kx + 22, GY - 72], [kx + 34, GY - 94], [kx + 60, GY - 62], [kx + 52, GY - 24]], true, 4);
    sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.4, seed: 65 }); sk.ink(fl, { w: 8, seed: 66 });
    const fi = curve([[kx - 24, GY - 28], [kx - 26, GY - 54], [kx, GY - 82], [kx + 26, GY - 54], [kx + 24, GY - 28]], true, 4);
    sk.fill(fi, C.lemon, { dx: 0, dy: 0, wob: 0.3, seed: 67 });
    // 삼발이
    for (const sg of [-1, 1]) sk.ink(dense([[kx + sg * 104, ky + 4], [kx + sg * 124, GY]]), { w: 9, seed: 71 + sg, wob: 0.5 });
    sk.ink(dense([[kx - 116, ky + 4], [kx + 116, ky + 4]]), { w: 10, seed: 74, wob: 0.5 });
    kettle(sk, kx, ky, 0.92, { seed: 81, lift: 10 });
  });
  steam(sk, kx + 118, ky - 132, 3, 110, 91, 30, "#9AA3AD");
  // 온도계를 든 학생
  const fx = 800, s = 0.72;
  const P = pose({ elL: [-104, -300], haL: [-176, -364], elR: [44, -256], haR: [62, -182], tilt: -0.06 });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student", hands: "R" });
  const hx = fx - s * 176, hy = GY - s * 364;
  thermometer(sk, hx, hy - 150, hy + 62, 101);
  handDot(sk, [hx, hy], C.skin, 111, 15 * s);
  return sk;
}

/* ---------- g2u1l6: 사과만 든 바구니와 사과, 귤, 포도가 섞인 바구니. 꺼낸 귤은 여전히 귤 ---------- */
const APPLE = "#E0503A", TANG = "#F59A2E", GRAPE = "#8A5FC2";
function apple(sk, x, y, r, sd) {
  ball(sk, x, y, r, APPLE, sd, 7);
  sk.ink(curve([[x, y - r + 4], [x + 3, y - r - 8], [x + 9, y - r - 14]]), { w: 5, color: "#6B4A32", seed: sd + 5, wob: 0.2 });
}
function tangerine(sk, x, y, r, sd) {
  const b = ell(x, y, r, r * 0.88);
  sk.fill(b, TANG, { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(b, { w: 7, seed: sd + 1, wob: 0.4 });
  sk.ink(curve([[x - r * 0.52, y - r * 0.16], [x - r * 0.34, y - r * 0.44], [x - r * 0.04, y - r * 0.52]]), { w: 3.5, color: C.white, seed: sd + 2, wob: 0.1 });
  const lf = ell(x + 2, y - r * 0.88, 9, 5);
  sk.fill(lf, C.green, { dx: 0, dy: 0, wob: 0.1, seed: sd + 3 }); sk.ink(lf, { w: 4, seed: sd + 4, wob: 0.2 });
}
function grapes(sk, x, y, r, sd) {
  // (x, y) = 송이 맨 위 가운데
  sk.ink(curve([[x, y - r], [x + 4, y - r - 14], [x + 14, y - r - 20]]), { w: 5, color: "#6B4A32", seed: sd, wob: 0.2 });
  const pts = [[-1.8, 0], [0, 0], [1.8, 0], [-0.9, 1.5], [0.9, 1.5], [0, 3]];
  pts.forEach(([dx, dy], i) => ball(sk, x + dx * r, y + dy * r, r, GRAPE, sd + 3 + i * 4, 5));
}
function basket(sk, cx, y, by, sd, fruit) {
  fruit();
  thin(sk, 0.8, () => {
    const b = poly([[cx - 128, y], [cx + 128, y], [cx + 100, by], [cx - 100, by]], 3);
    sk.fill(b, "#E2BE86", { dx: 0, dy: 0, wob: 0.3, seed: sd, tex: 0.6 });
    for (const k of [0.36, 0.68]) sk.ink(dense([[cx - 128 + 28 * k, y + (by - y) * k], [cx + 128 - 28 * k, y + (by - y) * k]]), { w: 5, color: "#A9773F", seed: sd + 1 + k * 10, wob: 0.6 });
    for (let i = -3; i <= 3; i++) sk.ink(dense([[cx + i * 36, y + 8], [cx + i * 29, by - 4]]), { w: 4, color: "#A9773F", seed: sd + 12 + i, wob: 0.4 });
    sk.ink(b, { w: 10, seed: sd + 3 });
    const rim = rrect(cx - 138, y - 12, 276, 24, 11);
    sk.fill(rim, "#D2A560", { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 }); sk.ink(rim, { w: 9, seed: sd + 5 });
  });
}
function cutL6() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 668, TY = 540, BY = 424;
  ground(sk, GY, 11);
  table(sk, 24, 636, TY, GY, 15);
  // 사과만 든 바구니
  const A = 176;
  basket(sk, A, BY, TY, 21, () => {
    [[-44, -84], [44, -86], [-88, -34], [0, -40], [88, -34]].forEach(([dx, dy], i) => apple(sk, A + dx, BY + dy, 41, 31 + i * 8));
  });
  // 섞인 바구니: 사과, 귤, 포도
  const B = 476;
  basket(sk, B, BY, TY, 81, () => {
    apple(sk, B - 46, BY - 84, 41, 91);
    tangerine(sk, B + 46, BY - 82, 39, 99);
    tangerine(sk, B - 90, BY - 32, 39, 105);
    grapes(sk, B, BY - 82, 17, 111);
    apple(sk, B + 90, BY - 34, 41, 141);
  });
  // 학생이 섞인 바구니에서 귤 하나를 집어 들어 보인다
  const fx = 800, s = 0.76;
  const P = pose({ elL: [-110, -306], haL: [-184, -392], elR: [44, -256], haR: [62, -182], tilt: -0.05 });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student", hands: "R" });
  const hx = fx - s * 184, hy = GY - s * 392;
  arrow(sk, [[B + 72, BY - 140], [B + 104, BY - 172], [hx - 52, hy - 50]], { w: 7, color: C.gray, seed: 151, head: 17, wob: 0.3 });
  tangerine(sk, hx, hy - 44, 39, 161);
  handDot(sk, [hx, hy], C.skin, 171, 15 * s);
  sparkle(sk, hx + 46, hy - 96, 18, { seed: 175 });
  return sk;
}

/* ---------- g2u1l8: 밤새 식은 꿀단지 바닥에 하얀 결정이 가라앉았고, 숟가락으로 그 결정만 떠 올린다 ---------- */
function crystal(sk, x, y, r, a, sd) {
  const pts = [0, 1, 2, 3, 4, 5].map(i => [x + r * Math.cos(a + i * Math.PI / 3) * (i % 3 === 0 ? 1.25 : 0.9), y + r * Math.sin(a + i * Math.PI / 3) * 0.8]);
  const c = poly(pts, 3);
  sk.fill(c, C.white, { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(c, { w: 4.5, seed: sd + 1, wob: 0.3 });
}
function cutL8() {
  const sk = new Sk(W, H, { id: "e" });
  const GY = 668, TY = 530;
  ground(sk, GY, 11);
  // 겨울 아침의 창
  thin(sk, 0.7, () => {
    const win = rrect(716, 36, 212, 204, 10);
    sk.fill(win, "#A9CFEA", { dx: 0, dy: 0, wob: 0.3, seed: 15 });
    // 큰 눈송이(여섯 갈래)와 창턱에 쌓인 눈
    for (const [x, y, r, i] of [[766, 84, 20, 0], [876, 78, 17, 1], [790, 168, 16, 2], [884, 158, 21, 3]]) for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3 + i * 0.3; sk.ink(dense([[x - r * Math.cos(a), y - r * Math.sin(a)], [x + r * Math.cos(a), y + r * Math.sin(a)]]), { w: 6, color: C.white, seed: 150 + i * 4 + k, wob: 0.2 }); }
    for (const [x, y] of [[822, 62], [838, 118], [742, 128], [906, 116], [846, 190], [744, 196]]) sk.dot(x, y, 5, C.white);
    const heap = [...curve([[718, 240], [730, 214], [790, 206], [850, 216], [900, 204], [926, 240]]), [718, 240]];
    sk.fill(heap, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 19 }); sk.ink(heap, { w: 6, seed: 20, wob: 0.5 });
    sk.ink(dense([[822, 38], [822, 208]]), { w: 7, seed: 16, wob: 0.4 }); sk.ink(dense([[718, 132], [926, 132]]), { w: 7, seed: 17, wob: 0.4 });
    sk.ink(win, { w: 10, seed: 18 });
  });
  table(sk, 380, 936, TY, GY, 21);
  // 꿀단지: 맑은 꿀 아래에 하얀 결정이 가라앉았다
  const cx = 610, cw = 250, ch = 250;
  vessel(sk, cx, TY, cw, ch, 204, 31, () => {
    const pts = [[-92, -18, 0.2], [-52, -20, 1.1], [-12, -18, 0.6], [30, -20, 1.7], [70, -18, 0.3], [96, -16, 0.9], [-72, -44, 0.8], [-30, -46, 0.1], [12, -46, 1.3], [54, -44, 0.5], [-48, -70, 0.4], [-6, -72, 1.0], [34, -68, 0.7]];
    pts.forEach(([dx, dy, a], i) => crystal(sk, cx + dx, TY + dy, 19, a, 41 + i * 3));
  }, false, "#F5C04A", "#D99A1E");
  // 숟가락으로 결정만 떠 올린다
  const fx = 214, s = 0.76;
  const P = pose({ elL: [-52, -252], haL: [-70, -180], elR: [112, -296], haR: [206, -398], tilt: 0.07, head: [4, -436] });
  drawFigure(sk, fx, GY, s, P, { ...TEACHER, name: "teacher", hands: "L" });
  const hx = fx + s * 206, hy = GY - s * 398, bx = cx - 70, by = TY - ch - 52;
  thin(sk, 0.8, () => {
    sk.ink(dense([[hx - 4, hy + 4], [bx - 30, by + 2]]), { w: 9, seed: 91, wob: 0.3 });
    const bowl = ell(bx, by, 40, 15);
    sk.fill(bowl, "#D5DCE4", { dx: 0, dy: 0, wob: 0.2, seed: 92 }); sk.ink(bowl, { w: 7, seed: 93, wob: 0.3 });
  });
  crystal(sk, bx - 18, by - 12, 16, 0.3, 95); crystal(sk, bx + 16, by - 12, 16, 1.2, 98); crystal(sk, bx, by - 30, 16, 0.7, 101);
  drop(sk, bx + 6, by + 44, 0.7, { seed: 105, color: "#F5C04A", line: "#C98A12" });
  handDot(sk, [hx, hy], C.skin, 107, 15 * s);
  sparkle(sk, bx + 62, by - 44, 20, { seed: 109 });
  return sk;
}

/* ---------- g2u1l9: 흙탕물 웅덩이에서 물만 김이 되어 올라가 구름이 되고, 맑은 빗방울이 컵에 모인다 ---------- */
function cutL9() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 668, VAP = "#6FB7E6";
  ground(sk, GY, 11);
  // 흙탕물 웅덩이(흙은 그대로 남는다)
  const px = 286, py = GY - 6;
  const pud = ell(px, py, 214, 30);
  sk.fill(pud, "#C8A06A", { dx: 0, dy: 0, wob: 0.4, seed: 21 });
  for (const [dx, dy, r] of [[-140, 2, 8], [-84, -10, 6], [-40, 8, 9], [20, -8, 7], [70, 6, 9], [128, -4, 7], [-110, 12, 5], [100, 14, 5], [160, 4, 5]]) sk.dot(px + dx, py + dy, r, "#7A5230");
  thin(sk, 0.8, () => sk.ink(pud, { w: 9, color: "#7A5230", seed: 23, wob: 0.6 }));
  // 해
  sun(sk, 104, 104, 44, { seed: 31 });
  ray(sk, [128, 176], [150, 590], 35, { amp: 6, waves: 6 });
  // 구름과 올라가는 김
  const cl = curve([[380, 206], [366, 150], [424, 112], [470, 122], [512, 70], [596, 72], [628, 116], [694, 108], [738, 156], [716, 206]], false, 4);
  const clp = [...cl, cl[0]];
  sk.fill(clp, "#EEF2F6", { dx: 0, dy: 0, wob: 0.4, seed: 41 });
  thin(sk, 0.8, () => sk.ink(clp, { w: 10, seed: 42 }));
  for (const [a, b, i] of [[[236, 590], [420, 262]], [[320, 590], [486, 268]], [[404, 590], [552, 272]]].map((p, i) => [...p, i])) ray(sk, a, b, 51 + i * 5, { amp: 9, waves: 5, color: VAP, w: 7 });
  // 컵을 내민 학생과 맑은 빗방울
  const fx = 806, s = 0.72;
  const P = pose({ elL: [-108, -272], haL: [-220, -262], elR: [44, -256], haR: [62, -182], tilt: -0.05 });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student", hands: "R" });
  const hx = fx - s * 220, hy = GY - s * 262, ccx = hx - 4, cby = hy - 8;
  drop(sk, ccx - 22, 252, 0.85, { seed: 71 }); drop(sk, ccx + 20, 300, 0.85, { seed: 73 }); drop(sk, ccx - 6, 350, 0.85, { seed: 75 });
  const cup = poly([[ccx - 50, cby - 96], [ccx + 50, cby - 96], [ccx + 38, cby], [ccx - 38, cby]], 3);
  sk.fill(cup, GLASS, { dx: 0, dy: 0, wob: 0.3, seed: 81 });
  sk.fill(poly([[ccx - 42, cby - 44], [ccx + 42, cby - 44], [ccx + 35, cby - 5], [ccx - 35, cby - 5]], 3), WATER, { dx: 0, dy: 0, wob: 0.3, seed: 82 });
  thin(sk, 0.8, () => sk.ink(cup, { w: 9, seed: 83 }));
  handDot(sk, [hx, hy], C.skin, 91, 15 * s);
  return sk;
}

export function cuts() {
  return [
    { name: "g2u1l1", theme: "chem", orig: null, sk: cutL1(), alt: "크기가 똑같은 상자 둘을 양손에 든 스틱맨. 솜이 가득한 상자는 가볍게 들고, 쇠구슬이 가득한 상자 쪽 팔은 축 처진 장면", cap: "크기는 같은데 한쪽 팔만 축 처져요" },
    { name: "g2u1l3", theme: "chem", orig: null, sk: cutL3(), alt: "레모네이드 가판대에서 스틱맨이 작은 컵에 설탕을 퍼 넣어 바닥에 설탕이 쌓였고, 옆의 커다란 물통에는 같은 양의 설탕이 흔적 없이 녹아 있는 장면", cap: "같은 설탕인데 물이 적은 컵에서는 다 녹지 못했어요" },
    { name: "g2u1l5", theme: "chem", orig: null, sk: cutL5(), alt: "처마 끝 고드름이 햇볕에 끝부터 녹아 물방울로 떨어지고, 모닥불 위 주전자에서는 김이 솟는 것을 온도계를 든 스틱맨이 지켜보는 장면", cap: "녹을 때도 끓을 때도 온도계를 대 봐요" },
    { name: "g2u1l6", theme: "chem", orig: null, sk: cutL6(), alt: "사과만 가득한 바구니와 사과, 귤, 포도가 섞인 바구니 옆에서 스틱맨이 섞인 바구니의 귤 하나를 집어 들어 보이는 장면", cap: "섞여 있어도 귤은 여전히 귤이에요" },
    { name: "g2u1l8", theme: "chem", orig: null, sk: cutL8(), alt: "겨울 아침 부엌에서 스틱맨이 밤새 식은 꿀단지 바닥에 가라앉은 하얀 결정을 숟가락으로 떠 올리는 장면", cap: "식은 꿀단지 바닥에 하얀 결정이 생겼어요" },
    { name: "g2u1l9", theme: "chem", orig: null, sk: cutL9(), alt: "햇볕을 받은 흙탕물 웅덩이에서 김이 올라가 구름이 되고, 구름에서 떨어지는 맑은 빗방울을 스틱맨이 컵으로 받는 장면. 흙은 웅덩이에 그대로 남아 있다", cap: "물만 올라갔다가 맑은 물로 돌아와요" },
  ];
}
