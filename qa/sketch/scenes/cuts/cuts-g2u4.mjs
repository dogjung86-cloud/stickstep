// 중2 과학 Ⅳ단원(물질의 구성) 개념 컷 코드 그림.
// 목록은 Ⅳ단원 v5 세션이 낸 것(D:\Brilliant Science\output\g2-v5\u4\concept-cuts.md): g2u4l1 ~ g2u4l5b 일곱 컷.
// 색의 뜻: 원자 공은 앱 chemKit 관례(수소 흰색, 산소 빨강). 전자와 (−)는 파랑, (+)는 빨강.
// 비유 소품(구슬, 블록, 의자)은 일상 물건 색으로 그리고, 견주는 두 쪽은 청록과 주황으로 가른다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, arrow, check, xmark, sparkle } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { W, H, lerpx, thin } from "./common.mjs";

const RED = "#E63A2C", WHITE = "#F1F4F9", BLUE = "#4A90E0";
const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
// 공 하나: 테두리 + 밝은 점(구슬, 원자 공, 전자에 함께 쓴다)
function ball(sk, x, y, r, col, sd, lw) {
  const b = circ(x, y, r, { over: 0.1, seed: sd });
  sk.fill(b, col, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
  sk.ink(b, { w: lw ?? Math.max(4, Math.min(9, r * 0.32)), seed: sd + 2, wob: 0.3 });
  sk.ink(curve([[x - r * 0.52, y - r * 0.2], [x - r * 0.34, y - r * 0.5], [x - r * 0.04, y - r * 0.6]]), { w: Math.max(2.5, r * 0.13), color: C.white, seed: sd + 3, wob: 0.1 });
}
const plus = (sk, x, y, s, col, sd) => { sk.ink(dense([[x - s, y], [x + s, y]]), { w: 15, color: col, seed: sd, wob: 0.4 }); sk.ink(dense([[x, y - s], [x, y + s]]), { w: 15, color: col, seed: sd + 1, wob: 0.4 }); };
const minus = (sk, x, y, s, col, sd, w = 15) => sk.ink(dense([[x - s, y], [x + s, y]]), { w, color: col, seed: sd, wob: 0.4 });
function table(sk, x0, x1, y, GY, sd, k = 0.8) {
  thin(sk, k, () => {
    for (const [x, i] of [[x0 + 30, 0], [x1 - 30, 1]]) sk.ink(dense([[x, y + 22], [x - 3 + i * 6, GY]]), { w: 12, seed: sd + i });
    const top = rrect(x0, y, x1 - x0, 24, 8);
    sk.fill(top, C.wood, { seed: sd + 2, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: sd + 3 });
  });
}

/* ---------- g2u4l1: 같은 구슬만 든 병과, 두 색 구슬이 붙은 쌍만 든 병 ---------- */
function jar(sk, cx, by, w, h, sd, inside) {
  const body = rrect(cx - w / 2, by - h, w, h, 28);
  sk.fill(body, "#EEF7FC", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  inside();
  thin(sk, 0.8, () => {
    sk.ink(dense([[cx - w / 2 + 20, by - h + 44], [cx - w / 2 + 20, by - 60]]), { w: 6, color: C.white, seed: sd + 1, wob: 0.2 });
    sk.ink(body, { w: 10, seed: sd + 2 });
    const rim = rrect(cx - w / 2 - 8, by - h - 12, w + 16, 24, 10);
    sk.fill(rim, "#D5E6F2", { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 }); sk.ink(rim, { w: 9, seed: sd + 4 });
  });
}
function cutL1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 668, fx = 480, s = 0.8, JB = 398;
  ground(sk, GY, 11);
  const P = pose({ elL: [-112, -286], haL: [-192, -326], elR: [112, -286], haR: [192, -326], tilt: -0.07 });
  drawFigure(sk, fx, GY, s, P, { ...TEACHER, name: "teacher", hands: false });
  // 왼쪽 병: 한 가지 색 구슬만
  const L = 276, R = 684;
  jar(sk, L, JB, 190, 236, 21, () => {
    const pts = [[-63, -30], [-21, -30], [21, -30], [63, -30], [-42, -66], [0, -67], [42, -66], [-21, -102], [21, -102]];
    pts.forEach(([dx, dy], i) => ball(sk, L + dx, JB + dy, 21, BLUE, 31 + i * 4));
  });
  // 오른쪽 병: 서로 다른 색 구슬 둘이 꼭 붙은 쌍만
  jar(sk, R, JB, 190, 236, 81, () => {
    const pairs = [[-50, -30, 0.12], [50, -32, -0.2], [0, -104, 0.45]];
    pairs.forEach(([dx, dy, a], i) => {
      const cx = R + dx, cy = JB + dy, ox = Math.cos(a) * 16, oy = Math.sin(a) * 16;
      ball(sk, cx - ox, cy - oy, 20, "#F2B63A", 91 + i * 8);
      ball(sk, cx + ox, cy + oy, 20, "#E0503A", 95 + i * 8);
    });
  });
  // 병을 받쳐 든 두 손
  handDot(sk, [fx - s * 192, GY - s * 326 + 4], C.skin, 151, 13);
  handDot(sk, [fx + s * 192, GY - s * 326 + 4], C.skin, 153, 13);
  return sk;
}

/* ---------- g2u4l2: 세 나라 과학자가 금속 덩이의 빈 이름표 하나를 함께 가리킨다 ---------- */
// 셋 다 시리즈의 쌤이 아닌 차림(머리 모양, 모자, 옷 색이 서로 다르다)
const SCI_A = { hair: "short", hairColor: "#3F3A36", fringe: 24, hat: "brim", hatColor: "#6B4A32", coat: { color: "#5E7B5A", buttons: C.gold, seam: "#3E5540", len: 34 }, seed: 131 };
const SCI_B = { hair: "bob", hairColor: "#B9703A", coat: { color: "#3E5C76", buttons: C.gold, seam: "#2A3F52" }, seed: 181 };
const SCI_C = { hair: "curls", hairColor: "#2E2E33", coat: { color: "#B5483B", buttons: C.gold, seam: "#7E2E25" }, seed: 151 };
function cutL2() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 668, s = 0.6;
  ground(sk, GY, 11);
  // 가운데 과학자는 낮은 탁자 뒤에 선다(온몸이 보인다)
  const PB = pose({ elR: [108, -284], haR: [124, -226], tilt: 0.05 });
  drawFigure(sk, 574, GY, s, PB, { ...SCI_B, name: "b", mirror: true });
  table(sk, 262, 648, 604, GY, 21, 0.7);
  // 낮고 작은 금속 덩이와 반짝임
  const nx = 452, ny = 604;
  const nug = curve([[nx - 50, ny], [nx - 56, ny - 22], [nx - 34, ny - 44], [nx - 6, ny - 52], [nx + 26, ny - 46], [nx + 50, ny - 26], [nx + 54, ny]], false, 3);
  sk.fill([...nug, nug[0]], "#E2B23C", { dx: 0, dy: 0, wob: 0.3, seed: 31 });
  thin(sk, 0.8, () => {
    sk.ink(curve([[nx - 34, ny - 26], [nx - 18, ny - 38], [nx + 4, ny - 40]]), { w: 6, color: "#F8E3A0", seed: 32, wob: 0.2 });
    sk.ink(curve([[nx + 8, ny - 14], [nx + 26, ny - 22], [nx + 36, ny - 12]]), { w: 5, color: "#B8892E", seed: 33, wob: 0.2 });
    sk.ink([...nug, nug[0]], { w: 9, seed: 34 });
  });
  sparkle(sk, nx + 6, ny - 88, 19, { seed: 35 }); sparkle(sk, nx - 50, ny - 72, 12, { seed: 37 });
  // 덩이에 끈으로 건 빈 이름표
  sk.ink(curve([[nx - 44, ny - 20], [nx - 62, ny - 30], [nx - 74, ny - 22]]), { w: 4, color: "#8A5A33", seed: 41, wob: 0.2 });
  const tag = poly([[nx - 68, ny - 24], [nx - 86, ny - 50], [nx - 172, ny - 44], [nx - 168, ny + 2], [nx - 82, ny - 2]], 3);
  sk.fill(tag, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 42 });
  thin(sk, 0.8, () => sk.ink(tag, { w: 8, seed: 43 }));
  sk.dot(nx - 86, ny - 26, 5, "#8A5A33");
  // 양옆의 두 과학자
  const PA = pose({ elR: [104, -292], haR: [182, -262], tilt: 0.06 });
  drawFigure(sk, 170, GY, s, PA, { ...SCI_A, name: "a" });
  drawFigure(sk, 806, GY, s, PA, { ...SCI_C, name: "c", mirror: true });
  // 같은 약속에 고개를 끄덕인다: 머리 위 체크
  check(sk, 170, 256, 0.8); check(sk, 574, 292, 0.8); check(sk, 806, 282, 0.8);
  return sk;
}

/* ---------- g2u4l2b: 큰 공 하나에 작은 공 둘. 작은 공을 가리키며 손가락 둘 ---------- */
function cutL2b() {
  const sk = new Sk(W, H, { id: "c" });
  const GY = 690, fx = 318, s = 0.95;
  ground(sk, GY, 11);
  table(sk, 452, 930, 506, GY, 21);
  // 모형: 작은 흰 공 둘이 탁자에 닿고 큰 빨간 공이 위에 얹힌다(굽은 모양)
  const mx = 694, sy = 506 - 54;
  ball(sk, mx - 116, sy, 54, WHITE, 31, 9);
  ball(sk, mx + 116, sy, 54, WHITE, 36, 9);
  ball(sk, mx, sy - 90, 92, RED, 41, 10);
  // 쌤: 한 손은 작은 공을 가리키고, 다른 손은 손가락 둘을 편다
  const P = pose({ elR: [104, -286], haR: [176, -262], elL: [-108, -300], haL: [-176, -384], tilt: 0.05, head: [4, -436] });
  drawFigure(sk, fx, GY, s, P, { ...TEACHER, name: "teacher", hands: "R" });
  const hx = fx - s * 176, hy = GY - s * 384;
  for (const [dx, i] of [[-20, 0], [20, 1]]) {
    const f = dense([[hx + dx * 0.3, hy - 6], [hx + dx, hy - 58]]);
    sk.ink(f, { w: 17, seed: 51 + i, wob: 0.3 });
    sk.ink(f, { w: 9, color: C.skin, seed: 53 + i, wob: 0.3 });
  }
  handDot(sk, [hx, hy], C.skin, 55, 17);
  return sk;
}

/* ---------- g2u4l3: 넓은 운동장 한가운데의 작은 구슬, 가장자리 멀리의 더 작은 점들 ---------- */
function cutL3() {
  const sk = new Sk(W, H, { id: "d" });
  const cx = 480, cy = 474, rx = 436, ry = 196;
  // 운동장(위에서 비스듬히 본 타원)
  const field = ell(cx, cy, rx, ry);
  sk.fill(field, "#EAF4DF", { dx: 0, dy: 0, wob: 0.6, seed: 11 });
  thin(sk, 0.7, () => {
    sk.ink(ell(cx, cy, rx - 34, ry - 22), { w: 6, color: C.white, seed: 12, wob: 0.6 });
    sk.ink(field, { w: 9, seed: 13, color: "#7FA86A", wob: 0.8 });
  });
  // 한가운데의 작은 구슬(원자핵)
  const bx = 446, by = 498;
  sk.fill(ell(bx + 2, by + 15, 18, 5), "#C9D8BC", { dx: 0, dy: 0, wob: 0.2, seed: 21 });
  ball(sk, bx, by, 15, RED, 22, 5);
  for (const [a, i] of [[-2.5, 0], [-1.9, 1], [-1.3, 2]]) sk.ink(dense([[bx + 26 * Math.cos(a), by + 26 * Math.sin(a)], [bx + 42 * Math.cos(a), by + 42 * Math.sin(a)]]), { w: 4, color: C.gray, seed: 26 + i, wob: 0.2 });
  // 내려다보는 학생(작게: 운동장이 넓다)
  const P = pose({ tilt: 0.3, head: [16, -430], elR: [60, -262], haR: [92, -206] });
  drawFigure(sk, 540, 512, 0.42, P, { ...STUDENT, name: "student", mirror: true });
  // 가장자리 멀리 떠 있는 더 작은 점들(전자)
  const es = [[104, 318], [296, 408], [236, 590], [702, 318], [812, 548], [636, 628], [78, 520], [906, 400]]; // 구슬에서의 거리를 서로 달리해 흩는다(고리 하나로 읽히지 않게)
  es.forEach(([x, y], i) => {
    ball(sk, x, y, 10, BLUE, 41 + i * 5, 4);
    const sg = x < cx ? -1 : 1;
    sk.ink(ell(x, y, 19, 19, sg > 0 ? -0.6 : Math.PI - 0.6, sg > 0 ? 0.6 : Math.PI + 0.6), { w: 3.5, color: "#8DB9E8", seed: 44 + i * 5, wob: 0 });
  });
  return sk;
}

/* ---------- g2u4l4: 줄지어 놓인 빈 의자. 세로 한 줄과 가로 한 줄 ---------- */
function chair(sk, cx, sy, col, sd) {
  const back = rrect(cx - 27, sy - 76, 54, 56, 12), seat = rrect(cx - 33, sy - 20, 66, 20, 8);
  for (const sg of [-1, 1]) sk.ink(dense([[cx + sg * 23, sy], [cx + sg * 25, sy + 22]]), { w: 8, seed: sd + (sg > 0 ? 1 : 0), wob: 0.4 });
  sk.fill(back, col, { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 }); sk.ink(back, { w: 8, seed: sd + 3, wob: 0.6 });
  sk.fill(seat, col, { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 }); sk.ink(seat, { w: 8, seed: sd + 5, wob: 0.6 });
}
function cutL4() {
  const sk = new Sk(W, H, { id: "e" });
  const GY = 668;
  const cols = [404, 496, 588, 680, 772, 864], rows = [176, 306, 436, 566], CI = 2, RI = 2;
  const TEAL = "#12A594", ORG = "#F08A2E";
  // 세로 한 줄(청록)과 가로 한 줄(주황)의 띠
  sk.fill(rrect(cols[CI] - 44, 84, 88, 520, 22), "#CDEFEA", { dx: 0, dy: 0, wob: 0.4, seed: 11 });
  sk.fill(rrect(354, rows[RI] - 88, 560, 122, 22), "#FFE2C4", { dx: 0, dy: 0, wob: 0.4, seed: 12, alpha: 0.85 });
  thin(sk, 0.62, () => rows.forEach((sy, r) => cols.forEach((x, c) => chair(sk, x, sy, c === CI ? "#7FD3C8" : r === RI ? "#F9BE86" : "#E4E7EB", 21 + r * 60 + c * 8))));
  // 띠 끝의 양방향 화살표
  for (const [a, b, i] of [[[cols[CI], 96], [cols[CI], 50]], [[cols[CI], 606], [cols[CI], 660]]].map((p, i) => [...p, i])) arrow(sk, [a, b], { w: 9, color: TEAL, straight: true, seed: 301 + i * 5, head: 20, wob: 0.2 });
  arrow(sk, [[906, rows[RI] - 27], [946, rows[RI] - 27]], { w: 9, color: ORG, straight: true, seed: 311, head: 20, wob: 0.2 });
  // 학생: 한 팔은 위로(번호표를 들고), 한 팔은 옆으로
  ground(sk, GY, 13, 30, 330);
  const fx = 186, s = 0.7;
  const P = pose({ elL: [-104, -372], haL: [-150, -492], elR: [104, -318], haR: [196, -322], tilt: 0.04 });
  const hx = fx - s * 150, hy = GY - s * 492;
  const tk = poly([[hx - 40, hy - 62], [hx + 40, hy - 66], [hx + 42, hy - 12], [hx - 38, hy - 8]], 3);
  sk.fill(tk, "#FFE9A6", { dx: 0, dy: 0, wob: 0.3, seed: 321 });
  thin(sk, 0.8, () => { sk.ink(tk, { w: 8, seed: 322 }); sk.ink(dense([[hx - 22, hy - 46], [hx + 22, hy - 48]]), { w: 5, color: "#C9A23C", seed: 323, wob: 0.2 }); sk.ink(dense([[hx - 22, hy - 30], [hx + 8, hy - 31]]), { w: 5, color: "#C9A23C", seed: 324, wob: 0.2 }); });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student" });
  arrow(sk, [[fx + s * 196 + 18, GY - s * 322], [352, GY - s * 322 - 2]], { w: 9, color: ORG, straight: true, seed: 331, head: 18, wob: 0.2 });
  return sk;
}

/* ---------- g2u4l5: 블록 셋으로 조립한 자동차는 굴러가고, 낱개 블록 셋은 굴러가지 못한다 ---------- */
function brick(sk, x, y, w, h, sd) {
  // (x, y) = 왼쪽 아래. 위에 돌기 둘
  for (const [k, i] of [[0.28, 0], [0.72, 1]]) { const st = rrect(x + w * k - 20, y - h - 14, 40, 20, 5); sk.fill(st, "#E0503A", { dx: 0, dy: 0, wob: 0.2, seed: sd + i }); sk.ink(st, { w: 7, seed: sd + 2 + i, wob: 0.4 }); }
  const b = rrect(x, y - h, w, h, 8);
  sk.fill(b, "#E0503A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 4, tex: 0.7 }); sk.ink(b, { w: 9, seed: sd + 5 });
}
function wheel(sk, x, y, r, sd) {
  const c = circ(x, y, r, { over: 0.1, seed: sd });
  sk.fill(c, "#4A5568", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 }); sk.ink(c, { w: 8, seed: sd + 2, wob: 0.4 });
  const h = circ(x, y, r * 0.42, { over: 0.1, seed: sd + 3 });
  sk.fill(h, "#F2D03B", { dx: 0, dy: 0, wob: 0.2, seed: sd + 4 }); sk.ink(h, { w: 5, seed: sd + 5, wob: 0.3 });
}
function cutL5() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 656;
  ground(sk, GY, 11);
  // 왼쪽: 조립한 자동차가 굴러간다
  const cx0 = 112, cw = 232;
  brick(sk, cx0, GY - 54, cw, 74, 21);
  wheel(sk, cx0 + 52, GY - 46, 46, 31); wheel(sk, cx0 + cw - 52, GY - 46, 46, 41);
  for (const [y, len, i] of [[GY - 118, 44, 0], [GY - 84, 62, 1], [GY - 50, 40, 2]]) sk.ink(dense([[cx0 - 20 - len, y], [cx0 - 20, y]]), { w: 6, color: C.gray, seed: 51 + i, wob: 0.3 });
  arrow(sk, [[cx0 + 16, GY - 276], [cx0 + cw - 40, GY - 276]], { w: 11, color: C.teal, straight: true, seed: 55, head: 24, wob: 0.2 });
  // 오른쪽: 낱개로 흩어진 블록 셋(바퀴는 바닥에 누워 있다)
  brick(sk, 664, GY - 2, 196, 66, 61);
  for (const [x, y, i] of [[604, GY - 20, 0], [884, GY - 20, 1]]) {
    const side = rrect(x - 50, y - 6, 100, 26, 12), top = ell(x, y - 6, 50, 17);
    sk.fill(side, "#3A4352", { dx: 0, dy: 0, wob: 0.2, seed: 71 + i * 6 }); sk.ink(side, { w: 8, seed: 72 + i * 6, wob: 0.3 });
    sk.fill(top, "#4A5568", { dx: 0, dy: 0, wob: 0.2, seed: 73 + i * 6 }); sk.ink(top, { w: 8, seed: 74 + i * 6, wob: 0.3 });
    const hub = ell(x, y - 6, 21, 7.5);
    sk.fill(hub, "#F2D03B", { dx: 0, dy: 0, wob: 0.1, seed: 75 + i * 6 }); sk.ink(hub, { w: 5, seed: 76 + i * 6, wob: 0.2 });
  }
  arrow(sk, [[668, GY - 276], [846, GY - 276]], { w: 11, color: C.gray, straight: true, seed: 85, head: 24, wob: 0.2 });
  xmark(sk, 752, GY - 276, 0.85, { w: 13 });
  // 학생: 두 쪽을 번갈아 본다(두 팔을 양쪽으로)
  const P = pose({ elL: [-96, -296], haL: [-172, -262], elR: [96, -296], haR: [172, -262], tilt: -0.06 });
  drawFigure(sk, 470, GY, 0.82, P, { ...STUDENT, name: "student", mirror: true });
  return sk;
}

/* ---------- g2u4l5b: 구슬을 건넨 쪽에 더하기, 받은 쪽에 빼기 ---------- */
function cutL5b() {
  const sk = new Sk(W, H, { id: "g" });
  const GY = 668, s = 0.78;
  ground(sk, GY, 11);
  const P = pose({ elR: [112, -274], haR: [188, -290], tilt: 0.04 });
  drawFigure(sk, 244, GY, s, P, { ...TEACHER, name: "giver" });
  drawFigure(sk, 716, GY, s, P, { ...STUDENT, name: "taker", mirror: true });
  // 건너가는 작은 구슬(전자) 하나와 가는 길
  const hy = GY - s * 290;
  arrow(sk, [[410, hy - 54], [480, hy - 92], [552, hy - 56]], { w: 8, color: C.gray, seed: 21, head: 20, wob: 0.3 });
  ball(sk, 480, hy - 24, 27, BLUE, 31, 7);
  minus(sk, 480, hy - 24, 11, C.white, 35, 7);
  // 머리 위의 기호
  plus(sk, 250, 122, 34, C.red, 41);
  minus(sk, 712, 148, 34, C.blue, 45);
  return sk;
}

export function cuts() {
  return [
    { name: "g2u4l1", theme: "atom", orig: null, sk: cutL1(), alt: "같은 색 구슬만 담긴 유리병과, 서로 다른 색 구슬 둘이 꼭 붙은 쌍만 담긴 유리병을 양손에 들고 견주어 보는 스틱맨", cap: "한 가지 구슬만 든 병, 두 구슬이 짝을 이룬 병" },
    { name: "g2u4l2", theme: "atom", orig: null, sk: cutL2(), alt: "옷차림이 서로 다른 세 과학자가 금속 덩어리에 걸린 빈 이름표 하나를 함께 가리키고, 머리 위에 체크 표시가 뜬 장면", cap: "나라가 달라도 이름표는 하나로 통해요" },
    { name: "g2u4l2b", theme: "atom", orig: null, sk: cutL2b(), alt: "큰 공 하나에 작은 공 둘이 붙은 모형을 탁자에 놓고, 작은 공을 가리키며 손가락 두 개를 펴 보이는 스틱맨", cap: "어떤 공이 몇 개인지, 그대로 적으면 돼요" },
    { name: "g2u4l3", theme: "atom", orig: null, sk: cutL3(), alt: "넓은 운동장 한가운데 놓인 작은 구슬 하나를 스틱맨이 내려다보고, 운동장 가장자리 멀리 더 작은 점들이 떠 있는 장면", cap: "가운데에 작은 원자핵, 그 주위에 더 작은 전자" },
    { name: "g2u4l4", theme: "atom", orig: null, sk: cutL4(), alt: "줄지어 놓인 빈 의자들 앞에서 번호표를 든 스틱맨이 세로 한 줄과 가로 한 줄을 두 팔로 가리키는 장면", cap: "번호대로 앉으면 세로줄과 가로줄이 생겨요" },
    { name: "g2u4l5", theme: "atom", orig: null, sk: cutL5(), alt: "블록 세 개로 조립한 작은 자동차는 굴러가고, 옆에 낱개로 흩어진 블록 세 개는 굴러가지 못하는 것을 스틱맨이 번갈아 보는 장면", cap: "낱개로 나누면 굴러가는 성질이 사라져요" },
    { name: "g2u4l5b", theme: "atom", orig: null, sk: cutL5b(), alt: "마주 선 두 스틱맨 가운데 한 사람이 작은 구슬 하나를 건네고, 건넨 사람 머리 위에는 더하기, 받은 사람 머리 위에는 빼기 기호가 뜬 장면", cap: "하나를 건네면 더하기, 하나를 받으면 빼기" },
  ];
}
