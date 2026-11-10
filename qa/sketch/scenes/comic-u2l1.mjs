// 중1 과학 u2l1 도입 만화: 1665년, 작은 방의 발견(로버트 훅과 코르크, 세포라는 이름). 7컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u2v3l1.md.
//   1 작은 것을 크게 보는 사람 → 2 코르크는 왜 가벼울까 → 3 종잇장보다 얇게(등잔 빛을 유리공으로 모은다)
//   → 4 벌집 같은 빈 칸과 얇은 벽 → 5 작은 방, 셀 → 6 10년쯤 뒤 레이우엔훅의 살아 있는 세포 → 7 오늘, 너의 몸도
import { Sk, C, curve, dense, circ, ell, poly, rrect, emark, qmark, sparkle, squiggle } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, HOOKE, LEEUWENHOEK, STUDENT } from "../lib/figure.mjs";
import { microscope, cellsView } from "../lib/props.mjs";

const W = 960, H = 720;
const CORK = "#D9A866";
const table = (sk, x, y, w, sd) => {
  sk.ink(dense([[x + 40, y + 24], [x + 32, 706]]), { w: 12, seed: sd }); sk.ink(dense([[x + w - 40, y + 24], [x + w - 32, 706]]), { w: 12, seed: sd + 1 });
  const top = rrect(x, y, w, 28, 10);
  sk.fill(top, C.wood, { seed: sd + 2, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: sd + 3 });
};
// 기름 등잔: 받침 + 작은 불꽃. 원점 = 바닥 가운데. 불꽃 중심을 돌려준다
function lamp(sk, x, y, s = 1, sd = 21) {
  let tip = null;
  sk.at(x, y, s, () => {
    const base = curve([[-34, 0], [-40, -26], [-16, -44], [16, -44], [40, -26], [34, 0]], false, 3);
    sk.fill([...base, base[0]], "#B9772F", { seed: sd, tex: true }); sk.ink([...base, base[0]], { w: 9, seed: sd + 1 });
    sk.ink(dense([[0, -44], [0, -58]]), { w: 7, seed: sd + 2 });
    const fl = curve([[0, -112], [16, -84], [10, -62], [0, -56], [-10, -62], [-16, -84]], true, 3);
    sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.5, seed: sd + 3 }); sk.ink(fl, { w: 6, color: C.red, seed: sd + 4, wob: 0.5 });
    sk.fill(curve([[0, -92], [7, -78], [0, -66], [-7, -78]], true, 2), C.lemon, { dx: 0, dy: 0, wob: 0.3, seed: sd + 5 });
  });
  return [x, y - 84 * s];
}
// 물을 채운 유리공(빛을 모으는 데 썼다). 원점 = 받침 바닥 가운데. 공의 중심을 돌려준다
function globe(sk, x, y, r, sd = 31) {
  sk.ink(dense([[x, y], [x, y - 40]]), { w: 9, seed: sd });
  sk.ink(dense([[x - 28, y], [x + 28, y]]), { w: 10, seed: sd + 1 });
  const g = circ(x, y - 40 - r, r, { over: 0.15, seed: sd + 2 });
  sk.fill(g, "#D4EEF9", { dx: 0, dy: 0, wob: 0.5, seed: sd + 3, alpha: 0.92 });
  sk.ink(curve([[x - r * 0.5, y - 40 - r * 1.3], [x - r * 0.72, y - 40 - r], [x - r * 0.5, y - 40 - r * 0.66]]), { w: 5, color: C.white, seed: sd + 4, wob: 0.3 });
  sk.ink(g, { w: 9, seed: sd + 5 });
  return [x, y - 40 - r];
}

/* ---------- 1. 1665년, 런던: 작은 것을 크게 보는 사람 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  table(sk, 470, 548, 450, 11);
  microscope(sk, 640, 548, 1.05, { seed: 881, sample: false });
  lamp(sk, 842, 548, 1.0, 21);
  // 훅: 벼룩을 크게 그린 종이를 들어 보인다
  const show = pose({ elR: [72, -312], haR: [104, -388], elL: [-56, -262], haL: [-22, -222], tilt: 0.05 });
  const fx = 176, fy = 704, fs = 0.78;
  drawFigure(sk, fx, fy, fs, show, { ...HOOKE, name: "hooke", hands: "L" });
  const paper = poly([[250, 196], [436, 186], [444, 398], [258, 408]], 5);
  sk.fill(paper, "#FBF6E6", { seed: 15, dx: 1.5, dy: 2 }); sk.ink(paper, { w: 9, seed: 16 });
  // 벼룩 그림(먹)
  const INK = "#3A3A40";
  const body = curve([[296, 300], [316, 262], [366, 252], [400, 276], [404, 310], [372, 336], [322, 336]], true, 3);
  sk.fill(body, "#8A8A90", { dx: 0, dy: 0, wob: 0.6, seed: 17 }); sk.ink(body, { w: 6, color: INK, seed: 18, wob: 0.6 });
  for (const [x, i] of [[330, 0], [352, 1], [376, 2]]) sk.ink(dense([[x, 258 + i * 3], [x + 4, 332]]), { w: 4, color: INK, seed: 19 + i, wob: 0.3 });
  sk.ink(circ(290, 290, 15, { over: 0.2, seed: 22 }), { w: 6, color: INK, seed: 23 });
  sk.ink(curve([[282, 278], [268, 262], [262, 244]]), { w: 4, color: INK, seed: 24, wob: 0.3 });
  for (const [x0, i] of [[322, 0], [348, 1], [376, 2]]) sk.ink(dense([[x0, 334], [x0 - 14, 362], [x0 + (i === 2 ? 30 : 6), 384]], 3), { w: 5, color: INK, seed: 25 + i, wob: 0.4 });
  handDot(sk, [fx + fs * 104, fy - fs * 388], C.skin, 28, 12);
  sparkle(sk, 590, 260, 14, { seed: 29 });
  return sk;
}

/* ---------- 2. 궁금증: 코르크는 왜 가벼울까 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  table(sk, 480, 548, 430, 41);
  // 물그릇에 둥둥 뜬 코르크
  const bx = 694, by = 548;
  const bowl = curve([[bx - 132, by - 84], [bx - 112, by - 22], [bx - 64, by], [bx + 64, by], [bx + 112, by - 22], [bx + 132, by - 84]], false, 4);
  sk.fill([...bowl, bowl[0]], C.white, { seed: 45, dx: 1, dy: 1.2 });
  const water = [...ell(bx, by - 78, 124, 15, Math.PI, Math.PI * 2), ...curve([[bx + 124, by - 78], [bx + 104, by - 26], [bx + 60, by - 6], [bx - 60, by - 6], [bx - 104, by - 26], [bx - 124, by - 78]], false, 4)];
  sk.fill(water, C.sea, { seed: 46, dx: 0, dy: 0, wob: 0.6, tex: 0.8 });
  sk.ink([...bowl, bowl[0]], { w: 10, seed: 47 });
  const cork = rrect(bx - 34, by - 112, 68, 44, 10);
  sk.fill(cork, CORK, { seed: 48, tex: true }); sk.ink(cork, { w: 8, seed: 49 });
  sk.ink(curve([[bx - 96, by - 74], [bx - 76, by - 80], [bx - 56, by - 74]]), { w: 5, color: C.white, seed: 50, wob: 0.3 });
  sk.ink(curve([[bx + 52, by - 74], [bx + 74, by - 80], [bx + 96, by - 74]]), { w: 5, color: C.white, seed: 51, wob: 0.3 });
  // 훅: 코르크 조각을 들고 갸웃
  const hold = pose({ elR: [74, -312], haR: [118, -384], elL: [-56, -262], haL: [-22, -222], tilt: 0.14 });
  const fx = 214, fy = 704, fs = 0.8;
  drawFigure(sk, fx, fy, fs, hold, { ...HOOKE, name: "hooke", hands: "L" });
  const hx = fx + fs * 118, hy = fy - fs * 384;
  const c2 = rrect(hx - 8, hy - 52, 56, 40, 9);
  sk.fill(c2, CORK, { seed: 52, tex: true }); sk.ink(c2, { w: 8, seed: 53 });
  handDot(sk, [hx, hy], C.skin, 54, 12);
  qmark(sk, 452, 318, 0.8, { color: C.teal, seed: 55 });
  return sk;
}

/* ---------- 3. 관찰 준비: 종잇장보다 얇게 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  table(sk, 250, 548, 670, 61);
  // 등잔 불빛을 유리공으로 모아 검은 받침 위의 얇은 조각에 비춘다
  const [fx0, fy0] = lamp(sk, 842, 548, 1.0, 21);
  const [gx, gy] = globe(sk, 708, 548, 48, 31);
  const plate = rrect(480, 530, 136, 18, 6);
  sk.fill(plate, "#2E2E33", { seed: 65, dx: 0.6, dy: 0.8 }); sk.ink(plate, { w: 7, seed: 66 });
  const slice = ell(548, 526, 34, 7);
  sk.fill(slice, "#F0D6A8", { dx: 0, dy: 0, wob: 0.4, seed: 67 }); sk.ink(slice, { w: 5, color: "#A9773F", seed: 68, wob: 0.4 });
  for (const [dy, i] of [[-20, 0], [0, 1], [20, 2]]) {
    sk.ink(dense([[fx0 - 22, fy0 + dy * 0.3], [gx + 50, gy + dy]]), { w: 6, color: C.yellow, seed: 69 + i, wob: 0.4 });
    sk.ink(dense([[gx - 50, gy + dy], [556, 516 + dy * 0.1]]), { w: 6, color: C.yellow, seed: 72 + i, wob: 0.4 });
  }
  sparkle(sk, 548, 506, 11, { seed: 75, color: C.lemon, w: 4 });
  // 코르크 덩이와 칼
  const block = rrect(322, 496, 76, 52, 10);
  sk.fill(block, CORK, { seed: 76, tex: true }); sk.ink(block, { w: 8, seed: 77 });
  // 훅: 칼로 저민다
  const cutP = pose({ neck: [14, -338], head: [34, -428], tilt: 0.16, elR: [86, -276], haR: [152, -252], elL: [-48, -260], haL: [-58, -188] });
  const fx = 138, fy = 704, fs = 0.74;
  drawFigure(sk, fx, fy, fs, cutP, { ...HOOKE, name: "hooke", hands: "L" });
  const hx = fx + fs * 152, hy = fy - fs * 252;
  const blade = poly([[hx + 4, hy - 8], [hx + 92, hy - 20], [hx + 96, hy - 8], [hx + 8, hy + 6]], 3);
  sk.fill(blade, "#C9CED6", { dx: 0, dy: 0, wob: 0.4, seed: 78 }); sk.ink(blade, { w: 6, seed: 79, wob: 0.4 });
  handDot(sk, [hx, hy], C.skin, 80, 11);
  return sk;
}

/* ---------- 4. 발견: 벌집 같은 작은 칸들 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  cellsView(sk, 672, 346, 262, { seed: 901, empty: true, wall: "#A9773F", w: 7, ringColor: "#B8892E", ringW: 14 });
  sparkle(sk, 930, 96, 16, { seed: 91 });
  const joy = pose({ elL: [-104, -362], haL: [-156, -452], elR: [104, -362], haR: [156, -452], tilt: -0.05 });
  drawFigure(sk, 196, 704, 0.8, joy, { ...HOOKE, name: "hooke" });
  emark(sk, 372, 250, 0.9, { color: C.red });
  return sk;
}

/* ---------- 5. 이름 짓기: 작은 방, 셀(cell) ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  // 칸을 그린 종이
  const paper = poly([[388, 250], [560, 244], [566, 462], [394, 468]], 5);
  sk.fill(paper, "#FBF6E6", { seed: 101, dx: 1.5, dy: 2 }); sk.ink(paper, { w: 9, seed: 102 });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const cell = rrect(412 + c * 46 + (r % 2 ? 10 : 0), 270 + r * 46, 38, 38, 7); sk.ink(cell, { w: 5, color: "#A9773F", seed: 103 + r * 3 + c, wob: 0.6 }); }
  // 닮은꼴 기호
  for (const dy of [0, 22]) sk.ink(curve([[592, 342 + dy], [606, 334 + dy], [620, 342 + dy], [634, 350 + dy], [648, 342 + dy]]), { w: 7, color: C.gray, seed: 120 + dy, wob: 0.3 });
  // 나란히 붙은 작은 방 세 칸
  for (let i = 0; i < 3; i++) {
    const x = 676 + i * 88;
    const room = poly([[x, 270], [x + 88, 270], [x + 88, 470], [x, 470]], 5);
    sk.fill(room, "#E9E6DF", { seed: 121 + i, tex: true }); sk.ink(room, { w: 9, seed: 124 + i });
    const door = [...ell(x + 44, 400, 24, 34, Math.PI, Math.PI * 2), [x + 68, 470], [x + 20, 470]];
    door.push(door[0]);
    sk.fill(door, "#6B5A4A", { dx: 0, dy: 0, wob: 0.5, seed: 127 + i }); sk.ink(door, { w: 6, seed: 130 + i, wob: 0.5 });
    const win = rrect(x + 30, 298, 28, 30, 6);
    sk.fill(win, "#BFE2F4", { dx: 0, dy: 0, wob: 0.4, seed: 133 + i }); sk.ink(win, { w: 5, seed: 136 + i, wob: 0.4 });
  }
  sk.ink(dense([[662, 270], [954, 270]], 5), { w: 11, seed: 139 });
  // 훅: 둘을 가리킨다
  const show = pose({ elR: [84, -318], haR: [156, -334], elL: [-54, -262], haL: [-20, -222], tilt: 0.04 });
  drawFigure(sk, 186, 704, 0.8, show, { ...HOOKE, name: "hooke" });
  return sk;
}

/* ---------- 6. 10년쯤 뒤: 살아 있는 작은 방 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  // 크게 본 물 한 방울 속의 작은 생물
  const cx = 690, cy = 346, r = 252;
  const ring = circ(cx, cy, r, { over: 0.12, seed: 141 });
  sk.fill(ring, "#EAF6FC", { dx: 0, dy: 0, wob: 0.6, seed: 142 });
  const bug = (x, y, rot, col, sd) => sk.at(x, y, 1, () => {
    const b = ell(0, 0, 44, 24);
    sk.fill(b, col, { dx: 0, dy: 0, wob: 0.6, seed: sd, tex: 0.7 }); sk.ink(b, { w: 6, color: "#2F7D46", seed: sd + 1, wob: 0.6 });
    sk.ink(squiggle(-44, 0, 60, 8, 2, 0).map(([x1, y1]) => [-44 + (y1), (x1 + 44)]), { w: 5, color: "#2F7D46", seed: sd + 2, wob: 0 });
    sk.dot(14, -4, 5, "#2F7D46");
    sk.ink(curve([[56, -22], [70, -10], [70, 8]]), { w: 4, color: C.gray, seed: sd + 3, wob: 0.2 });
  }, rot);
  bug(600, 250, -0.3, "#9BD67A", 143); bug(784, 300, 0.5, "#6CC38A", 148); bug(650, 436, 0.2, "#B7E08A", 153); bug(820, 468, -0.6, "#8FD0A0", 158);
  sk.ink(ring, { w: 13, seed: 163, color: "#B8892E" });
  // 레이우엔훅: 손바닥만 한 현미경을 눈앞에
  const P = pose({ elR: [70, -322], haR: [96, -402], elL: [-56, -262], haL: [-22, -222], tilt: 0.06 });
  const fx = 196, fy = 704, fs = 0.8;
  drawFigure(sk, fx, fy, fs, P, { ...LEEUWENHOEK, name: "leeu", hands: "L" });
  const hx = fx + fs * 96, hy = fy - fs * 402;
  const plate = rrect(hx - 6, hy - 76, 40, 66, 8);
  sk.fill(plate, "#D2A84A", { seed: 164, tex: true }); sk.ink(plate, { w: 7, seed: 165 });
  sk.dot(hx + 14, hy - 52, 6, "#DDF1FB");
  handDot(sk, [hx + 8, hy], C.skin, 166, 12);
  sk.ink(dense([[hx + 44, hy - 60], [cx - r + 30, cy - 60]]), { w: 5, color: C.gray, dash: [12, 10], seed: 167, wob: 0.4 });
  emark(sk, 78, 250, 0.9, { color: C.red, rot: -0.1 });
  return sk;
}

/* ---------- 7. 오늘: 너의 몸도 작은 방투성이 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  cellsView(sk, 684, 300, 226, { seed: 911, fill: "#F9D3DA", wall: "#D9788A", w: 6, nucleus: "#B24C63", bg: "#FFF4F6" });
  // 학생: 손바닥을 들여다본다
  const P = pose({ elR: [66, -300], haR: [112, -356], elL: [-56, -262], haL: [-22, -222], tilt: 0.1 });
  const fx = 200, fy = 704, fs = 0.8;
  drawFigure(sk, fx, fy, fs, P, { ...STUDENT, name: "student", hands: "L" });
  const hx = fx + fs * 112, hy = fy - fs * 356;
  handDot(sk, [hx, hy], C.skin, 171, 20);
  sk.ink(dense([[hx + 22, hy - 12], [476, 212]]), { w: 5, color: C.gray, dash: [12, 10], seed: 173, wob: 0.4 });
  sk.ink(dense([[hx + 22, hy + 12], [500, 420]]), { w: 5, color: C.gray, dash: [12, 10], seed: 174, wob: 0.4 });
  // 양파 반쪽과 나뭇잎
  const on = curve([[430, 668], [404, 640], [410, 600], [446, 574], [470, 552], [494, 574], [530, 600], [536, 640], [510, 668]], false, 4);
  sk.fill([...on, on[0]], "#F1E3F0", { seed: 175 }); sk.ink([...on, on[0]], { w: 9, seed: 176 });
  for (const k of [0.36, 0.68]) sk.ink(curve([[470 - 62 * k, 664], [470 - 56 * k, 620], [470, 568 + 40 * (1 - k)], [470 + 56 * k, 620], [470 + 62 * k, 664]]), { w: 5, color: "#B58DB0", seed: 177 + k * 10, wob: 0.4 });
  const leaf = curve([[770, 660], [800, 604], [870, 584], [900, 610], [876, 664], [816, 682]], true, 4);
  sk.fill(leaf, C.green, { seed: 180, tex: true }); sk.ink(leaf, { w: 9, seed: 181 });
  sk.ink(curve([[782, 662], [836, 630], [890, 606]]), { w: 5, color: "#2F7D46", seed: 182, wob: 0.4 });
  return sk;
}

const BUBBLES = [
  [{ who: "hooke", text: "오늘은<br>뭘 볼까?" }],
  [{ who: "hooke", text: "왜 이리<br>가볍지?" }],
  [{ who: "hooke", text: "더 얇게,<br>더 얇게" }],
  [{ who: "hooke", text: "온통<br>작은 방!" }],
  null,
  [{ who: "leeu", text: "움직인다!" }],
  [{ who: "student", text: "내 몸도<br>칸칸이?" }],
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
