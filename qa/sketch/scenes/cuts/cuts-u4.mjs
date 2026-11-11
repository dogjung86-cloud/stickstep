// 중1 과학 Ⅳ단원(물질의 상태 변화) 개념 컷 코드 그림.
// 목록은 Ⅳ단원 v5 세션이 새 개념 스텝을 쓰며 낸 것(D:\Brilliant Science\output\g1-v5\u4\concept-cuts.md): u4l1 ~ u4l3.
// 입자는 테두리 있는 작은 공(물은 파랑, 향기는 분홍)으로, 움직임은 청록과 회색 선으로 나타낸다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, drop, squiggle, arrow, hash, sparkle } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { sun } from "../../lib/props.mjs";
import { W, H, lerpx, lerp2, thin, steam, ray } from "./common.mjs";

const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
// 입자 하나: 테두리 있는 작은 공 + 밝은 점
function bead(sk, x, y, r, col, sd) {
  const b = circ(x, y, r, { over: 0.1, seed: sd });
  sk.fill(b, col, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
  sk.ink(b, { w: Math.max(4, r * 0.55), seed: sd + 2, wob: 0.2 });
  sk.dot(x - r * 0.32, y - r * 0.32, r * 0.24, C.white);
}

/* ---------- u4l1: 마르는 수건과 퍼지는 꽃 향기 ---------- */
function cutU4l1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 668;
  ground(sk, GY, 11);
  // 왼쪽 창문과 창턱
  thin(sk, 0.72, () => {
    const win = rrect(40, 96, 260, 270, 8);
    sk.fill(win, "#DDEFFB", { dx: 0, dy: 0, wob: 0.3, seed: 21 });
    sk.ink(dense([[170, 100], [170, 362]]), { w: 9, seed: 22, color: "#8A9099" });
    sk.ink(dense([[44, 230], [296, 230]]), { w: 9, seed: 23, color: "#8A9099" });
    sk.ink(win, { w: 12, seed: 24 });
    const sill = rrect(26, 366, 288, 22, 6);
    sk.fill(sill, "#E9DCC6", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 25 }); sk.ink(sill, { w: 10, seed: 26 });
  });
  // 꽃병과 꽃
  const vx = 186, vy = 366;
  for (const [ex, ey, i] of [[-34, -150], [6, -170], [40, -140]].map((p, i) => [...p, i])) sk.ink(curve([[vx, vy - 70], [vx + ex * 0.5, vy - 110], [vx + ex, vy + ey]]), { w: 6, color: "#4E9A46", seed: 31 + i, wob: 0.3 });
  for (const [ex, ey, c, i] of [[-34, -150, "#F28DB2"], [6, -170, "#C77DBA"], [40, -140, "#F28DB2"]].map((p, i) => [...p, i])) {
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; const pt = circ(vx + ex + Math.cos(a) * 13, vy + ey + Math.sin(a) * 13, 10, { over: 0.1, seed: 35 + i * 5 + k }); sk.fill(pt, c, { dx: 0, dy: 0, wob: 0.2, seed: 36 + i * 5 + k }); sk.ink(pt, { w: 4, seed: 37 + i * 5 + k, wob: 0.2 }); }
    sk.dot(vx + ex, vy + ey, 7, C.yellow);
  }
  const vase = curve([[vx - 26, vy], [vx - 36, vy - 30], [vx - 20, vy - 64], [vx - 14, vy - 76], [vx + 14, vy - 76], [vx + 20, vy - 64], [vx + 36, vy - 30], [vx + 26, vy]], true, 3);
  sk.fill(vase, "#7FB2E5", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 51 }); sk.ink(vase, { w: 8, seed: 52 });
  // 오른쪽 빨래 건조대와 넓게 편 수건
  const LY = 250, X0 = 652, X1 = 916;
  thin(sk, 0.78, () => {
    for (const [x, i] of [[X0 - 22, 0], [X1 + 22, 1]]) sk.ink(dense([[x, LY - 16], [x, GY]]), { w: 11, seed: 61 + i, color: "#8A9099" });
    sk.ink(dense([[X0 - 30, LY], [X1 + 30, LY]]), { w: 7, seed: 63, color: "#4A5568" });
  });
  const towel = poly([[X0, LY], [X1, LY], [X1 - 4, LY + 196], [X0 + 4, LY + 196]], 4);
  sk.fill(towel, "#9ED3F2", { seed: 64, tex: 0.6, texAng: 1.5 });
  for (const [y, i] of [[LY + 150, 0], [LY + 166, 1]]) sk.ink(dense([[X0 + 4, y], [X1 - 4, y]]), { w: 6, color: C.white, seed: 65 + i, wob: 0.2 });
  sk.ink(towel, { w: 9, seed: 67 });
  // 증발: 수건에서 물 알갱이가 떨어져 나와 위로 날아오른다
  const ev = [[680, 222], [736, 190], [796, 214], [852, 186], [898, 222], [704, 130], [768, 112], [830, 136], [890, 100], [740, 52], [822, 60]];
  ev.forEach(([x, y], i) => bead(sk, x, y, 11, "#5FAEDD", 81 + i * 3));
  // 수건 겉면 곳곳에서도 알갱이가 떠난다
  for (const [x, y, i] of [[700, 300, 0], [790, 352, 1], [866, 286, 2]]) { sk.ink(circ(x, y, 15, { over: 0, seed: 111 + i }), { w: 6, color: C.white, seed: 114 + i, wob: 0.1 }); bead(sk, x, y, 11, "#3F8FC4", 117 + i * 3); }
  for (const [x, y, i] of [[704, 176, 0], [872, 150, 1], [794, 86, 2]]) arrow(sk, [[x, y + 26], [x, y - 8]], { w: 5, color: C.gray, straight: true, seed: 121 + i, head: 12, wob: 0.1 });
  // 확산: 꽃에서 향기 알갱이가 방 안으로 퍼진다(꽃 가까이 빽빽, 멀수록 성글게)
  const sc = [], src = [vx + 4, vy - 166];
  for (let i = 0; i < 18; i++) {
    const t = (i + 0.5) / 18, d = 30 + 270 * Math.pow(t, 0.8), a = -0.5 + 1.3 * hash(i * 7.31 + 2.2);
    sc.push([src[0] + d * Math.cos(a), src[1] + d * Math.sin(a) * 0.85]);
  }
  sc.forEach(([x, y], i) => bead(sk, x, y, 9, "#F28DB2", 141 + i * 3));
  for (const [a, b, i] of [[[318, 236], [356, 232]], [[392, 330], [428, 346]]].map((p, i) => [...p, i])) arrow(sk, [a, b], { w: 5, color: C.gray, straight: true, seed: 201 + i, head: 12, wob: 0.1 });
  // 쌤: 향기 알갱이를 손으로 따라가며 본다(왼쪽을 본다)
  const P = pose({ elR: [100, -330], haR: [178, -372], elL: [-50, -262], haL: [-24, -220], tilt: 0.1, head: [6, -436] });
  drawFigure(sk, 556, GY, 0.72, P, { ...TEACHER, name: "teacher", mirror: true });
  return sk;
}

/* ---------- u4l2: 이삿짐 싸기, 벽돌과 물과 공기 ---------- */
function cutU4l2() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 668;
  ground(sk, GY, 11);
  // 벽돌 상자(뚜껑을 연 종이 상자)
  const bx0 = 64, bx1 = 300, bt = 500;
  thin(sk, 0.8, () => {
    for (const [pts, i] of [[[[bx0, bt], [bx0 - 46, bt - 40], [bx0 - 20, bt - 52], [bx0 + 26, bt - 8]], 0], [[[bx1, bt], [bx1 + 46, bt - 40], [bx1 + 20, bt - 52], [bx1 - 26, bt - 8]], 1]]) { const f = poly(pts, 3); sk.fill(f, "#C9965C", { dx: 0, dy: 0, wob: 0.3, seed: 21 + i }); sk.ink(f, { w: 9, seed: 23 + i }); }
    const back = poly([[bx0 + 18, bt - 30], [bx1 - 18, bt - 30], [bx1, bt], [bx0, bt]], 3);
    sk.fill(back, "#9C7244", { dx: 0, dy: 0, wob: 0.3, seed: 25 });
    // 벽돌(상자 위로 살짝 보인다)
    for (const [x, y, i] of [[bx0 + 40, bt - 20, 0], [bx0 + 118, bt - 20, 1], [bx0 + 196, bt - 20, 2], [bx0 + 80, bt - 52, 3], [bx0 + 158, bt - 52, 4]]) {
      const b = rrect(x - 36, y - 16, 72, 32, 4);
      sk.fill(b, "#C0563A", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 31 + i, tex: 0.6 }); sk.ink(b, { w: 8, seed: 36 + i });
    }
    const box = poly([[bx0, bt], [bx1, bt], [bx1 - 8, GY], [bx0 + 8, GY]], 4);
    sk.fill(box, "#D9A86C", { seed: 41, tex: true, texAng: 0.05 });
    sk.ink(dense([[(bx0 + bx1) / 2 - 30, bt + 2], [(bx0 + bx1) / 2 - 30, bt + 60], [(bx0 + bx1) / 2 + 30, bt + 60], [(bx0 + bx1) / 2 + 30, bt + 2]]), { w: 5, color: "#B5895A", seed: 42, wob: 0.3 });
    sk.ink(box, { w: 11, seed: 43 });
  });
  // 물병과 깔때기(물은 병 모양대로 담긴다)
  const wx = 452;
  const bottle = curve([[wx - 18, GY - 196], [wx - 18, GY - 170], [wx - 50, GY - 132], [wx - 50, GY - 8], [wx - 40, GY], [wx + 40, GY], [wx + 50, GY - 8], [wx + 50, GY - 132], [wx + 18, GY - 170], [wx + 18, GY - 196]], false, 3);
  const water = curve([[wx - 46, GY - 104], [wx - 46, GY - 8], [wx - 38, GY - 4], [wx + 38, GY - 4], [wx + 46, GY - 8], [wx + 46, GY - 104]], false, 3);
  sk.fill([...bottle, bottle[0]], "#EEF7FC", { dx: 0, dy: 0, wob: 0.3, seed: 51 });
  sk.fill([...water, water[0]], "#7DB3F0", { dx: 0, dy: 0, wob: 0.3, seed: 52 });
  sk.ink(dense([[wx - 46, GY - 104], [wx + 46, GY - 104]]), { w: 5, color: "#2F6DB5", seed: 53, wob: 0.3 });
  sk.ink(dense([[wx - 36, GY - 120], [wx - 36, GY - 30]]), { w: 5, color: C.white, seed: 54, wob: 0.2 });
  sk.ink(bottle, { w: 9, seed: 55 });
  const fun = poly([[wx - 52, GY - 262], [wx + 52, GY - 262], [wx + 9, GY - 214], [wx + 9, GY - 180], [wx - 9, GY - 180], [wx - 9, GY - 214]], 3);
  sk.fill(fun, "#F2D03B", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 56 }); sk.ink(fun, { w: 8, seed: 57 });
  drop(sk, wx, GY - 290, 0.9, { color: "#9FD0F4" });
  // 이삿짐 상자 더미(뒤)
  thin(sk, 0.78, () => {
    for (const [x, y, w, h, i] of [[892, GY, 104, 104, 0], [892, GY - 104, 88, 84, 1]]) { const b = poly([[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], 4); sk.fill(b, "#D9A86C", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 81 + i, tex: 0.6 }); sk.ink(dense([[x - 14, y - h], [x - 14, y - h + 28], [x + 14, y - h + 28], [x + 14, y - h]]), { w: 5, color: "#B5895A", seed: 83 + i, wob: 0.3 }); sk.ink(b, { w: 10, seed: 85 + i }); }
  });
  // 쌤: 부푼 풍선을 풍선째 앞으로 끌어안는다(오른쪽을 본다)
  const fx = 640, fs = 0.72;
  const P = pose({ elR: [84, -280], haR: [120, -210], elL: [74, -300], haL: [148, -330], tilt: 0.08, head: [8, -436] });
  const bc = [fx + 128, GY - fs * 252], br = 90;
  drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: false });
  sk.ink(curve([[bc[0] + 6, bc[1] + br * 1.08 + 8], [bc[0] - 14, bc[1] + br + 50], [bc[0] + 10, bc[1] + br + 92], [bc[0] - 4, GY - 4]]), { w: 4, color: C.gray, seed: 61, wob: 0.3 });
  const bl = circ(bc[0], bc[1], br, { over: 0.1, seed: 62, sy: 1.08 });
  sk.fill(bl, "#F25C54", { dx: 0.8, dy: 1, wob: 0.4, seed: 63 });
  sk.ink(curve([[bc[0] - 54, bc[1] - 46], [bc[0] - 36, bc[1] - 70], [bc[0] - 10, bc[1] - 80]]), { w: 9, color: "#FFC2BC", seed: 64, wob: 0.3 });
  const knot = poly([[bc[0] - 9, bc[1] + br * 1.08 + 12], [bc[0] + 9, bc[1] + br * 1.08 + 12], [bc[0], bc[1] + br * 1.08 - 2]], 2);
  sk.fill(knot, "#F25C54", { dx: 0, dy: 0, wob: 0.2, seed: 65 }); sk.ink(knot, { w: 6, seed: 66, wob: 0.2 });
  sk.ink(bl, { w: 10, seed: 67 });
  // 앞쪽 팔은 풍선 앞으로 감는다
  const el = [fx + fs * 84, GY - fs * 280], ha = [bc[0] - br * 0.62, bc[1] + br * 0.7];
  sk.ink(curve([el, [lerpx(el[0], ha[0], 0.5) - 6, lerpx(el[1], ha[1], 0.5) + 10], ha]), { w: 13 * fs, seed: 68, wob: 1.6 });
  handDot(sk, ha, C.skin, 70, 12);
  handDot(sk, [bc[0] + br * 0.9, bc[1] - br * 0.42], C.skin, 60, 12);
  return sk;
}

/* ---------- u4l3: 얼리면 얼음, 꺼내 두면 물. 그 사이의 양방향 화살표 ---------- */
function cutU4l3() {
  const sk = new Sk(W, H, { id: "c" });
  const P0 = [16, 472], P1 = [488, 944], PT = 16, PB = 704, GY = 646;
  [[P0, "#EAF3FB"], [P1, "#FFF1E3"]].forEach(([[a, b], c], i) => { const r = rrect(a, PT, b - a, PB - PT, 22); sk.fill(r, c, { dx: 0, dy: 0, wob: 0.3, seed: 11 + i }); thin(sk, 0.6, () => sk.ink(r, { w: 9, seed: 13 + i, color: "#C9CED6" })); });
  // 왼쪽: 쌤보다 큰 냉장고. 위 칸(냉동실) 문을 열고 물을 부은 얼음 틀을 넣는다
  ground(sk, GY, 20, 36, 452);
  const fx0 = 66, fx1 = 236, ft = 150, fm = 334;
  thin(sk, 0.6, () => {
    const body = rrect(fx0, ft, fx1 - fx0, GY - ft, 16);
    sk.fill(body, "#F4F6F8", { dx: 0, dy: 0, wob: 0.3, seed: 21 });
    const inside = rrect(fx0 + 14, ft + 14, fx1 - fx0 - 28, fm - ft - 28, 8);
    sk.fill(inside, "#CFE8F7", { dx: 0, dy: 0, wob: 0.3, seed: 22 });
    // 성에와 고드름, 선반
    sk.ink(curve([[fx0 + 18, ft + 24], [fx0 + 50, ft + 30], [fx0 + 84, ft + 22], [fx0 + 118, ft + 30], [fx1 - 18, ft + 24]]), { w: 7, color: C.white, seed: 23, wob: 0.2 });
    for (const [x, i] of [[fx0 + 40, 0], [fx0 + 92, 1], [fx0 + 134, 2]]) { const ic = poly([[x - 7, ft + 26], [x + 7, ft + 26], [x, ft + 48]], 2); sk.fill(ic, C.white, { dx: 0, dy: 0, wob: 0.1, seed: 24 + i }); sk.ink(ic, { w: 4, color: "#8FC3E8", seed: 27 + i, wob: 0.1 }); }
    sk.ink(dense([[fx0 + 16, ft + 104], [fx1 - 16, ft + 104]]), { w: 7, color: "#9DB6C8", seed: 30, wob: 0.3 });
    sk.ink(inside, { w: 8, seed: 31 });
    sk.ink(body, { w: 12, seed: 32 });
    sk.ink(dense([[fx0, fm], [fx1, fm]]), { w: 10, seed: 33 });
    sk.ink(dense([[fx1 - 22, fm + 40], [fx1 - 22, fm + 150]]), { w: 9, seed: 34, color: "#8A9099" });
    // 열린 냉동실 문(왼쪽으로)
    const door = poly([[fx0, ft + 4], [fx0 - 48, ft + 26], [fx0 - 48, fm - 18], [fx0, fm - 4]], 4);
    sk.fill(door, "#E3E8EE", { dx: 0, dy: 0, wob: 0.3, seed: 35 }); sk.ink(door, { w: 10, seed: 36 });
  });
  // 열린 냉동실에서 흘러나오는 찬 김
  for (const [x, i] of [[fx0 - 18, 0], [fx0 + 2, 1]]) sk.ink(curve([[x, fm - 6], [x - 10, fm + 26], [x + 2, fm + 56], [x - 12, fm + 86]]), { w: 5, color: "#9FC9E6", seed: 37 + i, wob: 0.1 });
  // 쌤: 물을 부은 얼음 틀을 냉동실 선반에 밀어 넣는다(왼쪽을 본다). 든 팔은 머리 밖으로
  const fs = 0.6, px = 336, hy = 300, hx = 252;
  const P = pose({ elR: [170, -420], haR: [(px - hx) / fs, -(GY - hy) / fs], elL: [150, -400], haL: [(px - hx - 16) / fs, -(GY - hy - 10) / fs], tilt: -0.04 });
  drawFigure(sk, px, GY, fs, P, { ...TEACHER, name: "teacher", mirror: true, hands: false });
  // 얼음 틀: 위에서 비스듬히 본 칸마다 물이 찼다
  const tx0 = hx - 150, tx1 = hx - 4, ty = hy - 4;
  const trTop = poly([[tx0 + 10, ty - 16], [tx1 + 8, ty - 16], [tx1, ty + 10], [tx0, ty + 10]], 3);
  const trSide = poly([[tx0, ty + 10], [tx1, ty + 10], [tx1, ty + 20], [tx0, ty + 20]], 2);
  sk.fill(trSide, "#BFD3E2", { dx: 0, dy: 0, wob: 0.2, seed: 41 });
  sk.fill(trTop, "#EAF4FA", { dx: 0, dy: 0, wob: 0.2, seed: 42 });
  for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const cxk = lerpx(tx0 + 22, tx1 - 12, (k + 0.5) / 4) + (1 - r) * 4, cyk = ty - 8 + r * 12; const cell = rrect(cxk - 13, cyk - 4, 26, 9, 3); sk.fill(cell, "#7DB3F0", { dx: 0, dy: 0, wob: 0.1, seed: 43 + r * 4 + k }); }
  sk.ink(trTop, { w: 6, seed: 52 }); sk.ink(trSide, { w: 6, seed: 53 });
  handDot(sk, [hx, hy], C.skin, 54, 11); handDot(sk, [hx + 16, hy + 10], C.skin, 55, 11);
  // 가운데: 양방향 화살표(얼리면 →, 녹이면 ←)
  arrow(sk, [[432, 190], [528, 190]], { w: 10, color: C.teal, straight: true, seed: 51, head: 22, wob: 0.2 });
  arrow(sk, [[528, 190], [432, 190]], { w: 10, color: C.teal, straight: true, seed: 52, head: 22, wob: 0.2 });
  // 오른쪽: 따뜻한 창가 탁자 위 컵 속 얼음이 녹아 간다
  sun(sk, 852, 112, 40, { seed: 61 });
  thin(sk, 0.6, () => {
    for (const [x, i] of [[560, 0], [880, 1]]) sk.ink(dense([[x, 520], [x - 4, GY]]), { w: 12, seed: 71 + i });
    const top = rrect(520, 496, 400, 24, 8);
    sk.fill(top, C.wood, { seed: 73, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 74 });
  });
  ground(sk, GY, 75, 508, 924);
  const cx = 716, cb = 496;
  const cup = poly([[cx - 70, cb - 196], [cx + 70, cb - 196], [cx + 56, cb], [cx - 56, cb]], 3);
  sk.fill(cup, "#EEF7FC", { dx: 0, dy: 0, wob: 0.3, seed: 81 });
  const wl = cb - 92;
  sk.fill(poly([[cx - 62, wl], [cx + 62, wl], [cx + 56, cb - 2], [cx - 56, cb - 2]], 3), "#9ED3F2", { dx: 0, dy: 0, wob: 0.3, seed: 82 });
  // 모서리가 둥글게 녹은 얼음 셋
  for (const [x, y, s, i] of [[cx - 30, wl - 18, 46, 0], [cx + 26, wl - 10, 40, 1], [cx - 4, wl - 52, 36, 2]]) {
    const ic = rrect(x - s / 2, y - s / 2, s, s, s * 0.32);
    sk.fill(ic, "#F4FBFF", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 83 + i }); sk.ink(ic, { w: 6, seed: 86 + i, color: "#5FAEDD" });
  }
  sk.ink(dense([[cx - 62, wl], [cx + 62, wl]]), { w: 5, color: "#2F6DB5", seed: 89, wob: 0.3 });
  sk.ink(dense([[cx - 52, cb - 170], [cx - 44, cb - 30]]), { w: 5, color: C.white, seed: 90, wob: 0.2 });
  sk.ink(dense([[cx - 70, cb - 196], [cx - 56, cb], [cx + 56, cb], [cx + 70, cb - 196]]), { w: 8, seed: 91 });
  // 얼음에서 흘러내리는 물(컵 겉 물방울은 액화라 그리지 않는다)
  for (const [x, i] of [[cx - 30, 0], [cx + 26, 1]]) sk.ink(dense([[x, wl - 36 + i * 8], [x + 2, wl - 4]]), { w: 4, color: "#5FAEDD", seed: 92 + i, wob: 0.1 });
  // 햇살(주황 물결)
  for (const [y, i] of [[180, 0], [236, 1]]) sk.ink(curve([[812, y - 30], [786, y - 4], [760, y + 12]]), { w: 6, color: C.orange, seed: 95 + i, wob: 0.2 });
  return sk;
}

/* ---------- u4l5: 더운 날 얼음 컵을 볼에 대면, 볼의 열이 컵으로 ---------- */
function iceGlass(sk, cx, cb, w, h, sd, melt = 0.36) {
  // 유리컵 + 녹아 가는 얼음. (cx, cb) = 바닥 가운데
  const cup = poly([[cx - w / 2, cb - h], [cx + w / 2, cb - h], [cx + w * 0.4, cb], [cx - w * 0.4, cb]], 3);
  sk.fill(cup, "#EEF7FC", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  const wl = cb - h * melt;
  sk.fill(poly([[cx - w * 0.45, wl], [cx + w * 0.45, wl], [cx + w * 0.4 - 4, cb - 2], [cx - w * 0.4 + 4, cb - 2]], 3), "#9ED3F2", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
  for (const [dx, dy, k, i] of [[-0.18, -0.08, 0.32, 0], [0.16, -0.02, 0.28, 1], [0, -0.26, 0.26, 2]]) {
    const s2 = w * k, x = cx + dx * w, y = wl + dy * h;
    const ic = rrect(x - s2 / 2, y - s2 / 2, s2, s2, s2 * 0.3);
    sk.fill(ic, "#F4FBFF", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 2 + i }); sk.ink(ic, { w: 6, seed: sd + 5 + i, color: "#5FAEDD" });
  }
  sk.ink(dense([[cx - w * 0.45, wl], [cx + w * 0.45, wl]]), { w: 5, color: "#2F6DB5", seed: sd + 8, wob: 0.3 });
  sk.ink(dense([[cx - w * 0.36, cb - h + 20], [cx - w * 0.3, cb - 16]]), { w: 5, color: C.white, seed: sd + 9, wob: 0.2 });
  sk.ink(dense([[cx - w / 2, cb - h], [cx - w * 0.4, cb], [cx + w * 0.4, cb], [cx + w / 2, cb - h]]), { w: 9, seed: sd + 10 });
}
function cutU4l5() {
  const sk = new Sk(W, H, { id: "d" });
  // 더운 날: 해와 아지랑이
  sun(sk, 110, 110, 48, { seed: 11 });
  for (const [x, i] of [[230, 0], [290, 1]]) sk.ink(squiggle(x, 300, 90, 6, 2, i * 1.4), { w: 6, color: "#F5B27A", seed: 21 + i, wob: 0 });
  // 쌤(가슴 위로 크게): 얼음 컵을 오른쪽 볼에 대고 있다
  const fx = 400, s = 1.12, fy = 300 + s * 436;
  const hc = [fx + s * 10, fy - s * 436], R = 100 * s;
  const cw = 132, ch = 172, ccx = hc[0] + R + cw * 0.47, ccb = hc[1] + R * 0.86;
  const P = pose({ elR: [136, -270], haR: [(ccx - fx) / s, -(fy - ccb - 14) / s], elL: [-60, -262], haL: [-30, -214], head: [10, -436], tilt: 0.06 });
  drawFigure(sk, fx, fy, s, P, { ...TEACHER, name: "teacher", hands: "L" });
  iceGlass(sk, ccx, ccb, cw, ch, 31);
  handDot(sk, [ccx, ccb + 14], C.skin, 41, 15);
  // 볼에서 컵으로 가는 열(주황 물결 화살표)
  ray(sk, [hc[0] + R - 8, hc[1] + R * 0.44], [ccx + 18, ccb - ch * 0.46], 43, { amp: 4, waves: 2, w: 7 });
  // 더워서 흐르는 땀(컵 겉 물방울은 액화라 그리지 않는다)
  drop(sk, hc[0] - R - 26, hc[1] - R * 0.3, 1.1, { rot: -0.3 });
  return sk;
}

/* ---------- u4l6: 추운 날, 굳어 가는 촛농 옆에 손을 쬔다 ---------- */
function candle(sk, cx, cb, sd) {
  // 받침 접시 + 막 끈 초 + 흘러내려 굳는 촛농. (cx, cb) = 받침 바닥 가운데. 돌려주는 값 = 촛농 끝자리들
  const dish = curve([[cx - 120, cb - 26], [cx - 104, cb - 4], [cx, cb + 2], [cx + 104, cb - 4], [cx + 120, cb - 26]], false, 3);
  sk.fill([...dish, dish[0]], "#C9D1D9", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd });
  sk.ink([...dish, dish[0]], { w: 9, seed: sd + 1 });
  const bw = 96, top = cb - 270;
  const body = rrect(cx - bw / 2, top, bw, cb - 24 - top, 8);
  sk.fill(body, "#FBF3E2", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 2 });
  sk.ink(body, { w: 9, seed: sd + 3 });
  // 흘러내리는 촛농
  const drips = [[cx - bw / 2 + 4, 0.55], [cx - 8, 0.34], [cx + bw / 2 - 6, 0.7]];
  drips.forEach(([x, len], i) => {
    const y0 = top + 4, y1 = top + (cb - top) * len;
    const d = curve([[x - 12, y0], [x - 13, (y0 + y1) / 2], [x - 10, y1 - 8], [x, y1 + 6], [x + 10, y1 - 8], [x + 13, (y0 + y1) / 2], [x + 12, y0]], true, 3);
    sk.fill(d, "#F4E4C4", { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 + i });
    sk.ink(d, { w: 6, seed: sd + 7 + i, wob: 0.3 });
  });
  // 받침 위에 고여 굳는 촛농
  const pool = curve([[cx - 92, cb - 20], [cx - 60, cb - 34], [cx + 40, cb - 32], [cx + 96, cb - 20], [cx + 40, cb - 12], [cx - 60, cb - 12]], true, 3);
  sk.fill(pool, "#F4E4C4", { dx: 0, dy: 0, wob: 0.3, seed: sd + 10 }); sk.ink(pool, { w: 6, seed: sd + 11, wob: 0.3 });
  // 막 끈 심지와 가는 연기(불꽃은 없다)
  sk.ink(dense([[cx, top], [cx + 2, top - 20]]), { w: 6, seed: sd + 12 });
  sk.ink(squiggle(cx + 2, top - 26, 90, 8, 1.6, 0.4), { w: 5, color: "#B8BDC4", seed: sd + 13, wob: 0 });
  return drips.map(([x, len]) => [x, top + (cb - top) * len - 20]);
}
function cutU4l6() {
  const sk = new Sk(W, H, { id: "e" });
  const GY = 668;
  // 추운 날: 창밖의 눈
  thin(sk, 0.72, () => {
    const win = rrect(640, 70, 260, 230, 8);
    sk.fill(win, "#DDEFFB", { dx: 0, dy: 0, wob: 0.3, seed: 11 });
    sk.ink(dense([[770, 74], [770, 296]]), { w: 9, seed: 12, color: "#8A9099" });
    sk.ink(win, { w: 12, seed: 13 });
  });
  for (const [x, y, i] of [[690, 120], [740, 210], [820, 110], [860, 230], [700, 260]].map((p, i) => [...p, i])) for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3 + 0.3; sk.ink(dense([[x - Math.cos(a) * 11, y - Math.sin(a) * 11], [x + Math.cos(a) * 11, y + Math.sin(a) * 11]]), { w: 4, color: "#8FC3E8", seed: 14 + i * 3 + k, wob: 0.1 }); }
  // 탁자와 초
  thin(sk, 0.8, () => {
    for (const [x, i] of [[480, 0], [900, 1]]) sk.ink(dense([[x, 560], [x - 4, GY]]), { w: 12, seed: 31 + i });
    const top = rrect(440, 536, 500, 24, 8);
    sk.fill(top, C.wood, { seed: 33, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 34 });
  });
  ground(sk, GY, 35);
  const cx = 676;
  const drips = candle(sk, cx, 536, 41);
  // 쌤: 초 옆에 두 손을 쬔다(오른쪽을 본다). 손은 촛농 쪽, 불꽃보다 낮게
  const fx = 396, s = 0.86;
  const hy = 430;
  const P = pose({ elR: [140, -330], haR: [(cx - 140 - fx) / s, -(GY - hy) / s], elL: [110, -300], haL: [(cx - 150 - fx) / s, -(GY - hy - 40) / s], tilt: 0.06, head: [12, -436] });
  drawFigure(sk, fx, GY, s, P, { ...TEACHER, name: "teacher" });
  // 굳는 촛농에서 손 쪽으로 가는 열(주황 물결 화살표)
  ray(sk, [drips[0][0] - 16, drips[0][1] - 10], [cx - 124, hy + 2], 61, { amp: 5, waves: 2.5, w: 7 });
  ray(sk, [drips[0][0] - 16, drips[0][1] + 34], [cx - 134, hy + 42], 62, { amp: 5, waves: 2.5, w: 7 });
  return sk;
}

export function cuts() {
  return [
    { name: "u4l1", theme: "matter4", orig: null, sk: cutU4l1(), alt: "빨랫줄에 넓게 편 수건에서 물 알갱이가 위로 날아오르고, 창가 꽃병의 향기 알갱이가 방 안으로 퍼지는 것을 스틱맨이 손으로 따라가며 보는 장면", cap: "젓지 않아도, 부채질하지 않아도 알갱이는 스스로 움직여요" },
    { name: "u4l2", theme: "matter4", orig: null, sk: cutU4l2(), alt: "이삿짐을 싸는 스틱맨: 벽돌은 그대로 상자에, 물은 병에 따라 담고, 풍선 속 공기는 풍선째 끌어안는다", cap: "벽돌, 물, 공기. 나르는 법이 다 달라요" },
    { name: "u4l3", theme: "matter4", orig: null, sk: cutU4l3(), alt: "얼음 틀에 물을 부어 냉동실에 넣는 쌤과 컵 속에서 녹아 가는 얼음, 그 사이의 양방향 화살표", cap: "얼리면 얼음, 꺼내 두면 다시 물. 방향마다 이름이 있어요" },
    { name: "u4l5", theme: "matter4", orig: null, sk: cutU4l5(), alt: "더운 날 얼음이 든 컵을 볼에 댄 스틱맨, 볼에서 컵 쪽으로 물결 화살표", cap: "얼음이 녹을 때 내 볼의 열을 가져가요" },
    { name: "u4l6", theme: "matter4", orig: null, sk: cutU4l6(), alt: "추운 날 막 끈 초에서 흘러내려 굳어 가는 촛농 옆에 손을 쬐는 스틱맨, 굳는 촛농에서 손 쪽으로 물결 화살표", cap: "촛농이 굳을 때 열을 내놓아요" },
  ];
}
