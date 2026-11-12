// 중2 과학 Ⅵ단원(동물과 에너지) 개념 컷 코드 그림.
// 목록은 Ⅵ단원 v5 세션이 낸 것(D:\Brilliant Science\output\g2-v5\u6\concept-cuts.md): g2u6l1 ~ g2u6l6 열한 줄.
// 색의 뜻: 허용된 흐름과 되돌아가는 것은 초록·청록 화살표, 막힌 것은 빨간 가위표와 회색 화살표.
// 공기는 하늘색 화살표. 산소(새 상자)는 빨간 화살표, 이산화 탄소(빈 상자)는 파란 화살표. 연료는 주황.
// 두 고리 길(g2u6l3b)은 빨강과 파랑을 쓰지 않는다(회색 길에 짙은 회색 화살표).
import { Sk, C, curve, dense, circ, ell, poly, rrect, arrow, emark, drop, xmark, sparkle, heart, hash } from "../../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { orange } from "../../lib/props.mjs";
import { W, H, lerpx, thin } from "./common.mjs";

const GREEN = "#2FA36B", TEAL = "#12A594", AIR = "#4FA8DC", O2 = "#E0503A", CO2 = "#3F7CC0", FUEL = "#F08A2E";
const STEEL = "#9AA7B4", WOOD = "#C99A62", WOODD = "#A9773F", GRAYD = "#7F8A99";
const ground = (sk, y, sd, x0 = 14, x1 = 946, o = {}) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd, ...o });
// 화면 좌표로 잡은 관절을 인물 좌표(발 사이 원점, 배율 s)로 바꾼다
const local = (ox, oy, s, j) => Object.fromEntries(Object.entries(j).map(([k, v]) => [k, Array.isArray(v) ? [(v[0] - ox) / s, (v[1] - oy) / s] : v]));
const box = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 6);
// 채움 + 외곽선
const shp = (sk, pts, col, sd, w = 7, o = {}) => { sk.fill(pts, col, { dx: 0, dy: 0, wob: 0.3, seed: sd, ...o }); sk.ink(pts, { w, seed: sd + 1, wob: 0.4, color: o.line }); };
// 색이 있는 굵은 줄: 검은 테 위에 색 선
const pipe = (sk, pts, w, col, sd, wob = 0.5) => { sk.ink(pts, { w: w + 7, seed: sd, wob }); sk.ink(pts, { w, color: col, seed: sd, wob }); };
function table(sk, x0, x1, ty, gy, sd) {
  thin(sk, 0.8, () => {
    for (const [x, i] of [[x0 + 16, 0], [x1 - 16, 1]]) sk.ink(dense([[x, ty + 16], [x, gy]]), { w: 10, seed: sd + i });
    shp(sk, rrect(x0, ty, x1 - x0, 18, 7), WOOD, sd + 2, 9, { tex: 0.8, texAng: 0.02 });
  });
}
const WALK = { knL: [-30, -108], ftL: [-72, 0], knR: [28, -104], ftR: [56, -4], elL: [-34, -262], haL: [-66, -200], elR: [36, -258], haR: [46, -184] };

/* ---------- g2u6l1: 급식 식판에 밥, 생선구이, 나물, 과일, 우유, 물이 골고루 ---------- */
function cutL1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 676, TX = 352, TY = 118, TW = 576, TH = 428;
  ground(sk, GY, 11);
  thin(sk, 0.8, () => {
    // 급식대(비스듬히 내려다본 모습)
    for (const x of [TX - 2, 928]) sk.ink(dense([[x, TY + TH + 44], [x, GY]]), { w: 10, seed: 3 + x });
    shp(sk, box(TX - 26, TY + TH + 24, 952, TY + TH + 46), WOODD, 5, 8);
    shp(sk, poly([[TX - 6, TY - 22], [946, TY - 22], [952, TY + TH + 24], [TX - 26, TY + TH + 24]], 5), "#EBD9BA", 7, 8, { tex: 0.8, texAng: 0.02 });
    shp(sk, rrect(TX, TY, TW, TH, 44), "#C5CEDA", 13, 10);
    [[24, 24, 164, 166], [206, 24, 164, 166], [388, 24, 164, 166], [24, 214, 256, 190], [298, 214, 254, 190]].forEach(([x, y, w, h], i) => shp(sk, rrect(TX + x, TY + y, w, h, 26), "#F1F4F8", 17 + i * 2, 6));
  });
  // 나물
  const c0 = [TX + 106, TY + 112];
  shp(sk, circ(c0[0], c0[1], 60, { over: 0.05, seed: 31, lump: 0.08, sy: 0.72 }), "#8CCB7A", 33, 6);
  for (let i = 0; i < 6; i++) sk.ink(curve([[c0[0] - 42 + i * 16, c0[1] + 20], [c0[0] - 36 + i * 16, c0[1] - 2], [c0[0] - 22 + i * 16, c0[1] - 20]]), { w: 4.5, color: i % 3 === 1 ? "#F08A2E" : "#3F8F4F", seed: 35 + i, wob: 0.3 });
  // 생선구이
  sk.at(TX + 288, TY + 108, 1.05, () => {
    shp(sk, poly([[44, 0], [78, -28], [70, 0], [78, 28]], 3), "#C9853F", 43, 6);
    shp(sk, curve([[-64, 0], [-34, -27], [18, -25], [52, -5], [52, 5], [18, 25], [-34, 27]], true, 3), "#DFA057", 45, 6);
    for (let i = 0; i < 3; i++) sk.ink(dense([[-18 + i * 24, -17], [-4 + i * 24, 17]]), { w: 5, color: "#7A4526", seed: 47 + i, wob: 0.2 });
    sk.dot(-44, -4, 4.5);
  }, -0.12);
  // 과일
  orange(sk, TX + 442, TY + 120, 39, { leaf: false, seed: 51 });
  orange(sk, TX + 504, TY + 104, 36, { color: "#E0503A", seed: 61 });
  // 밥
  const c3 = [TX + 152, TY + 316];
  shp(sk, [...ell(c3[0], c3[1], 86, 66, Math.PI, Math.PI * 2), [c3[0] - 86, c3[1]]], C.white, 71, 6);
  for (const [dx, dy, i] of [[-38, -22, 0], [-8, -40, 1], [26, -26, 2], [-20, -10, 3], [44, -8, 4], [8, -14, 5]]) sk.ink(dense([[c3[0] + dx, c3[1] + dy], [c3[0] + dx + 9, c3[1] + dy - 3]]), { w: 3.5, color: C.gray, seed: 73 + i, wob: 0 });
  shp(sk, [...ell(c3[0], c3[1], 100, 72, 0, Math.PI), [c3[0] + 100, c3[1]]], "#BFD3EA", 81, 7);
  // 우유와 물
  const mx = TX + 358, my = TY + 388;
  shp(sk, box(mx - 36, my - 128, mx + 36, my), C.white, 91, 6);
  sk.fill(box(mx - 33, my - 84, mx + 33, my - 40), "#7DB6E8", { dx: 0, dy: 0, wob: 0.2, seed: 93 });
  shp(sk, poly([[mx - 36, my - 128], [mx - 20, my - 156], [mx + 20, my - 156], [mx + 36, my - 128]], 3), C.white, 95, 6);
  shp(sk, box(mx - 20, my - 166, mx + 20, my - 156), C.white, 97, 5);
  const gx = TX + 476;
  sk.fill(poly([[gx - 37, my - 100], [gx + 37, my - 100], [gx + 30, my - 3], [gx - 30, my - 3]], 3), "#BFE3F7", { dx: 0, dy: 0, wob: 0.2, seed: 101 });
  sk.ink(dense([[gx - 41, my - 134], [gx - 31, my], [gx + 31, my], [gx + 41, my - 134]]), { w: 6, seed: 103, wob: 0.3 });
  sk.ink(dense([[gx - 37, my - 100], [gx + 37, my - 100]]), { w: 4, color: "#5FAEDD", seed: 105, wob: 0.3 });
  sparkle(sk, TX - 44, TY + 26, 24, { seed: 111 }); sparkle(sk, TX - 84, TY + 92, 16, { seed: 115 });
  // 학생: 한 손으로 식판을 잡고 흐뭇해한다
  const kx = 228, ks = 0.66, hand = [TX + 4, 470];
  const PK = pose({ ...local(kx, GY, ks, { haR: hand, elR: [hand[0] - 52, hand[1] + 36] }), elL: [-88, -296], haL: [-128, -386], tilt: 0.08 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  handDot(sk, hand, C.skin, 121, 15 * ks);
  heart(sk, kx - 40, 232, 1.25, { rot: -0.15 });
  return sk;
}

/* ---------- g2u6l1b: 감자 단면에 갈색 용액 한 방울, 그 자리만 짙은 남색 ---------- */
function cutL1b() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 676, TT = 590, PC = [566, 492], BROWN = "#9A5A2A", NAVY = "#2B2F77", SKIN = "#B07F45";
  ground(sk, GY, 11);
  table(sk, 404, 850, TT, GY, 13);
  // 감자 반쪽: 자른 면이 위를 보고, 갈색 껍질이 둘레와 아래를 감싼다
  const M = pts => pts.map(([x, y]) => [PC[0] + x, PC[1] + y]);
  shp(sk, curve(M([[-160, -6], [-150, -52], [-70, -80], [30, -82], [122, -64], [162, -14], [160, 44], [112, 90], [10, 102], [-96, 92], [-152, 50]]), true, 4), SKIN, 21, 8, { tex: 0.8 });
  for (const [dx, dy] of [[-118, 62], [-40, 84], [52, 84], [124, 56], [148, 14], [-146, 20]]) sk.dot(PC[0] + dx, PC[1] + dy, 4.5, "#70502A");
  shp(sk, curve(M([[-138, -6], [-122, -40], [-60, -62], [28, -64], [104, -48], [138, -10], [116, 24], [50, 44], [-44, 46], [-114, 28]]), true, 4), "#F8ECB8", 25, 6);
  // 나머지 반쪽(자른 면이 아래)
  const half = curve([[682, 590], [686, 548], [718, 514], [770, 506], [816, 528], [836, 590]], false, 4);
  shp(sk, [...half, half[0]], SKIN, 27, 7, { tex: 0.8 });
  for (const [x, y] of [[716, 556], [752, 532], [790, 546], [806, 572], [744, 574]]) sk.dot(x, y, 4.5, "#70502A");
  sk.ink(dense([[690, 587], [828, 587]]), { w: 5, color: "#F8ECB8", seed: 29, wob: 0.2 });
  // 용액이 떨어진 자리만 짙은 남색(청람색)
  sk.fill(circ(PC[0] - 2, PC[1] - 10, 46, { over: 0, seed: 31, lump: 0.08, sy: 0.46 }), NAVY, { dx: 0, dy: 0, wob: 0.5, seed: 33 });
  // 스포이트와 떨어지는 갈색 방울
  const tip = [560, 386], d = [0.71, 0.71], Hd = [tip[0] - d[0] * 112, tip[1] - d[1] * 112], bulb = [Hd[0] - d[0] * 34, Hd[1] - d[1] * 34];
  const tube = dense([[Hd[0] - d[0] * 10, Hd[1] - d[1] * 10], [tip[0] - d[0] * 20, tip[1] - d[1] * 20]]);
  sk.ink(tube, { w: 19, seed: 41, wob: 0.2 }); sk.ink(tube, { w: 12, color: "#EAF2F8", seed: 41, wob: 0.2 });
  sk.ink(dense([[Hd[0] + d[0] * 40, Hd[1] + d[1] * 40], [tip[0] - d[0] * 20, tip[1] - d[1] * 20]]), { w: 12, color: BROWN, seed: 43, wob: 0.2 });
  sk.ink(dense([[tip[0] - d[0] * 22, tip[1] - d[1] * 22], tip]), { w: 9, seed: 45, wob: 0.1 }); sk.ink(dense([[tip[0] - d[0] * 22, tip[1] - d[1] * 22], tip]), { w: 4, color: BROWN, seed: 45, wob: 0.1 });
  shp(sk, circ(bulb[0], bulb[1], 25, { over: 0.05, seed: 47 }), "#4A5568", 48, 6);
  drop(sk, tip[0] + 2, tip[1] + 42, 1.1, { color: BROWN, line: "#5E3415" });
  // 쌤: 스포이트를 쥐고 떨어뜨린다
  const tx = 336, ts = 0.72;
  const PT = pose({ ...local(tx, GY, ts, { haR: Hd, elR: [Hd[0] - 42, Hd[1] + 88] }), elL: [-52, -262], haL: [-80, -196], tilt: 0.06 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher", hands: "L" });
  handDot(sk, Hd, C.skin, 51, 15 * ts);
  // 학생: 놀란다
  const kx = 890, ks = 0.56;
  const PK = pose({ elL: [-70, -280], haL: [-118, -356], elR: [70, -280], haR: [108, -360], tilt: -0.08 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", flip: -1 });
  emark(sk, kx - 8, 256, 0.95);
  return sk;
}

/* ---------- g2u6l2: 큰 블록 성은 작은 문을 못 지나고, 낱개 블록만 지난다 ---------- */
const BCOL = ["#F28B50", "#F7C948", "#6FBF73", "#6FA8DC", "#C9A7E0"];
function brick(sk, x, y, w, h, col, sd, studs = true) {
  if (studs) for (const u of [0.27, 0.73]) shp(sk, box(x + w * u - 10, y - 10, x + w * u + 10, y + 3), col, sd + 5 + u * 10, 4.5);
  shp(sk, rrect(x, y, w, h, 5), col, sd, 5.5);
}
function cutL2() {
  const sk = new Sk(W, H, { id: "c" });
  const GY = 676, BW = 76, BH = 58, X0 = 22, WL = 572, DX = 718, DW = 98, DH = 86;
  ground(sk, GY, 11);
  // 벽과 문틀이 있는 작은 문(낱개 블록 하나가 겨우 지나가는 크기)
  thin(sk, 0.8, () => {
    shp(sk, box(WL, 64, 950, GY), "#E6EAEF", 101, 9);
    for (let y = 126, i = 0; y < GY - 20; y += 62, i++) {
      sk.ink(dense([[WL + 4, y], [946, y]]), { w: 3, color: "#B4BEC9", seed: 103 + i, wob: 0.3 });
      for (let x = WL + (i % 2 ? 46 : 94); x < 940; x += 96) sk.ink(dense([[x, y - 62], [x, y]]), { w: 3, color: "#B4BEC9", seed: 113 + i * 7 + x, wob: 0.2 });
    }
    shp(sk, box(DX - 16, GY - DH - 16, DX + DW + 16, GY), WOODD, 121, 7, { tex: 0.8 });
    shp(sk, box(DX, GY - DH, DX + DW, GY), "#4A5568", 123, 5);
  });
  // 문을 지나가는 중인 낱개 블록
  brick(sk, DX + 11, GY - BH, BW, BH, BCOL[4], 141);
  // 블록 성
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) brick(sk, X0 + c * BW, GY - (r + 1) * BH, BW, BH, BCOL[(r * 2 + c) % 5], 21 + r * 17 + c * 3, r === 3 && (c === 1 || c === 3));
  for (const c of [0, 2]) brick(sk, X0 + c * BW, GY - 5 * BH, BW, BH, BCOL[(c + 3) % 5], 91 + c * 5);
  // 성은 통째로는 문을 못 지난다: 성에서 문으로 가는 화살표와 가위표
  arrow(sk, [[X0 + 4 * BW + 14, 430], [410, 286], [600, 268], [DX + 36, 470]], { w: 9, color: GRAYD, seed: 175, head: 22, wob: 0.3 });
  xmark(sk, DX + DW / 2, GY - DH - 66, 0.9, { w: 14 });
  // 학생: 떼어 낸 블록 하나를 들고 문 쪽으로
  const kx = 420, ks = 0.58, hand = [506, 528];
  const PK = pose({ ...local(kx, GY, ks, { haR: hand, elR: [hand[0] - 50, hand[1] + 14] }), elL: [-56, -262], haL: [-92, -204], tilt: 0.05 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  brick(sk, 484, 468, BW, BH, BCOL[0], 181);
  handDot(sk, hand, C.skin, 191, 15 * ks);
  arrow(sk, [[578, 520], [640, 580], [DX - 30, GY - 40]], { w: 10, color: GREEN, seed: 171, head: 24, wob: 0.2 });
  return sk;
}

/* ---------- g2u6l2b: 매끈한 비닐로 닦으면 물이 그대로, 올이 빽빽한 수건으로 닦으면 싹 닦인다 ---------- */
function deck(sk, x0, x1, ty, gy, sd, dep = 160) { // 비스듬히 내려다본 허리 높이의 탁자
  thin(sk, 0.8, () => {
    for (const [x, i] of [[x0 + 18, 0], [x1 - 18, 1]]) sk.ink(dense([[x, ty + 20], [x, gy]]), { w: 10, seed: sd + i });
    shp(sk, box(x0, ty, x1, ty + 20), WOODD, sd + 2, 8);
    shp(sk, poly([[x0 + 34, ty - dep], [x1 - 34, ty - dep], [x1, ty], [x0, ty]], 5), "#EBD9BA", sd + 4, 8, { tex: 0.8, texAng: 0.02 });
  });
}
function cutL2b() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 676, TY = 574, WATER = "#BFE3F7", WLINE = "#5FAEDD", s = 0.7;
  ground(sk, GY, 11);
  deck(sk, 178, 474, TY, GY, 13); deck(sk, 486, 782, TY, GY, 23);
  // 왼쪽: 물이 그대로 남았다
  const pud = curve([[212, TY - 66], [254, TY - 138], [336, TY - 126], [398, TY - 142], [440, TY - 80], [422, TY - 22], [326, TY - 10], [238, TY - 14]], true, 4);
  sk.fill(pud, WATER, { dx: 0, dy: 0, wob: 0.4, seed: 31 }); sk.ink(pud, { w: 5.5, color: WLINE, seed: 32, wob: 0.5 });
  sk.ink(curve([[384, TY - 112], [410, TY - 116], [424, TY - 96]]), { w: 4.5, color: C.white, seed: 33, wob: 0.2 });
  // 반들반들한 투명 비닐(물이 비쳐 보이고 빛이 반사된다)
  const vin = poly([[236, TY - 122], [354, TY - 122], [380, TY - 24], [214, TY - 24]], 4);
  sk.fill(vin, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 35, alpha: 0.5 }); sk.ink(vin, { w: 5, color: GRAYD, seed: 36, wob: 0.4 });
  for (const [x, l, i] of [[300, 62, 0], [326, 40, 1]]) sk.ink(dense([[x, TY - 40], [x + l * 0.5, TY - 40 - l]]), { w: 6, color: C.white, seed: 37 + i, wob: 0.1 });
  sparkle(sk, 356, TY - 122, 15, { color: C.white, seed: 39, w: 3.5 });
  drop(sk, 396, TY - 196, 1.4, { line: WLINE }); drop(sk, 442, TY - 180, 1.1, { line: WLINE, rot: 0.3 });
  // 오른쪽: 올이 보이는 수건(양 끝에 술)이 물을 빨아들여 탁자가 말랐다
  const tx0 = 552, tx1 = 730, tb = TY - 22, tt = TY - 126, TOW = "#FFD66B";
  const tow = poly([[tx0 + 8, tt], [tx1 - 8, tt], [tx1, tb], [tx0, tb]], 4);
  for (let y = tt + 5, i = 0; y < tb; y += 8, i++) { const u = (y - tt) / (tb - tt); sk.ink(dense([[tx0 + 8 - 8 * u, y], [tx0 - 18 - 8 * u, y + 2]]), { w: 4, color: "#C98A00", seed: 41 + i, wob: 0.2 }); sk.ink(dense([[tx1 - 8 + 8 * u, y], [tx1 + 18 + 8 * u, y + 2]]), { w: 4, color: "#C98A00", seed: 61 + i, wob: 0.2 }); }
  sk.fill(tow, TOW, { dx: 0, dy: 0, wob: 0.3, seed: 81 });
  sk.fill(poly([[tx0 + 2, tb - 2], [tx1 - 2, tb - 2], [tx1 - 3, tb - 40], [tx0 + 90, tb - 32], [tx0 + 3, tb - 42]], 4), "#8CC8EC", { dx: 0, dy: 0, wob: 0.6, seed: 83 });
  for (let r = 0; r < 5; r++) for (let x = tx0 + 20 + (r % 2) * 10, i = 0; x < tx1 - 12; x += 20, i++) sk.ink(ell(x, tt + 12 + r * 19, 6.5, 8, Math.PI * 0.1, Math.PI * 0.9), { w: 3.2, color: r >= 4 ? "#4E97C4" : "#D49A1C", seed: 85 + i + r * 20, wob: 0 });
  sk.ink(tow, { w: 6.5, seed: 87, wob: 0.3 });
  sparkle(sk, 536, TY - 140, 18, { seed: 91 }); sparkle(sk, 762, TY - 30, 20, { seed: 95 });
  // 두 학생: 팔이 어깨에서 나와 탁자 위로 뻗는다
  const hL = [250, TY - 72], hR = [708, TY - 76];
  const PL = pose({ ...local(126, GY, s, { haR: hL, elR: [186, 478] }), tilt: 0.1 });
  drawFigure(sk, 126, GY, s, PL, { ...STUDENT, name: "left", hands: "L" });
  handDot(sk, hL, C.skin, 71, 15 * s);
  const PR = pose({ ...local(834, GY, s, { haL: hR, elL: [774, 478] }), tilt: -0.1 });
  drawFigure(sk, 834, GY, s, PR, { hair: "bob", hairColor: "#B9703A", seed: 221, name: "right", hands: "R" });
  handDot(sk, hR, C.skin, 75, 15 * s);
  return sk;
}

/* ---------- g2u6l3: 한쪽으로만 도는 회전문. 차례로 나가고, 거꾸로 가려는 사람은 막힌다 ---------- */
function cutL3() {
  const sk = new Sk(W, H, { id: "e" });
  const cx = 486, cy = 440, RX = 232, RY = 104, HH = 276, GLASS = "#CFE6F5", PI = Math.PI, s = 0.56;
  const rim = (a, up = 0) => [cx + RX * Math.cos(a), cy + RY * Math.sin(a) - up];
  const wing = (a, sd) => { const q = poly([[cx, cy], rim(a), rim(a, HH), [cx, cy - HH]], 5); sk.fill(q, GLASS, { dx: 0, dy: 0, wob: 0.2, seed: sd, alpha: 0.72 }); sk.ink(q, { w: 6.5, seed: sd + 1, wob: 0.4 }); };
  thin(sk, 0.8, () => {
    shp(sk, ell(cx, cy, RX, RY), "#EEF1F4", 13, 8);
    // 뒤쪽 절반은 막힌 벽, 앞쪽 절반이 지나는 길
    shp(sk, [...ell(cx, cy, RX, RY, PI, PI * 2), ...ell(cx, cy - HH, RX, RY, PI * 2, PI)], "#BCC8D7", 15, 8, { tex: 0.8 });
    wing(PI * 1.1, 21); wing(PI * 1.6, 25);
    wing(PI * 0.1, 29); wing(PI * 0.6, 33);
    sk.ink(dense([[cx, cy], [cx, cy - HH]]), { w: 12, seed: 37, wob: 0.3 });
  });
  // 도는 방향이자 지나가는 방향(하나뿐)
  arrow(sk, ell(cx, cy + 16, RX + 54, RY + 46, PI * 0.13, PI * 0.76), { w: 13, color: GREEN, seed: 41, head: 32, wob: 0.3 });
  // 지나가는 중인 사람과 차례를 기다리는 사람(스스로 걷는다)
  drawFigure(sk, cx + 86, cy + 74, s, pose({ ...WALK, tilt: -0.04 }), { ...STUDENT, name: "a", flip: -1 });
  drawFigure(sk, cx + RX + 104, cy + 54, s, pose({ ...WALK, tilt: -0.04 }), { hair: "bob", hairColor: "#B9703A", seed: 221, name: "b", flip: -1 });
  // 거꾸로 들어가려는 사람: 날개가 거꾸로는 돌지 않아 막힌다
  const fx = 176, fy = cy + 66, e = rim(PI * 1.1), hand = [e[0] - 4, e[1] - 76];
  const PC = pose({ ...local(fx, fy, s, { haR: hand, elR: [hand[0] - 44, hand[1] + 26] }), elL: [-44, -262], haL: [-70, -196], tilt: 0.1 });
  drawFigure(sk, fx, fy, s, PC, { hair: "knit", capColor: "#9B7FD1", seed: 271, name: "c", hands: "L" });
  handDot(sk, hand, C.skin, 51, 15 * s);
  for (const [dy, i] of [[-28, 0], [0, 1], [28, 2]]) sk.ink(dense([[hand[0] + 22, hand[1] + dy], [hand[0] + 40, hand[1] + dy * 1.5]]), { w: 4.5, color: C.gray, seed: 53 + i, wob: 0.2 });
  xmark(sk, cx - 118, cy - 196, 1.0, { w: 15 });
  return sk;
}

/* ---------- g2u6l3b: 가운데 정류장 하나에서 만나는 두 고리 길을 순환 버스가 돈다 ---------- */
function cutL3b() {
  const sk = new Sk(W, H, { id: "f" });
  const cx = 436, cy = 336, AR = 396, BR = 224, AL = 276, BL = 160, PI = Math.PI, ARW = "#39424E";
  const P = t => { const sn = Math.sin(t), r = sn >= 0; return [cx + (r ? AR : AL) * sn, cy + (r ? BR : BL) * Math.sin(2 * t)]; };
  const seg = (t0, t1, n = 24) => Array.from({ length: n + 1 }, (_, i) => P(t0 + (t1 - t0) * i / n));
  // 숲(작은 고리 안)과 마을(큰 고리 안)
  const tree = (x, y, k, sd) => { shp(sk, box(x - 7 * k, y - 34 * k, x + 7 * k, y), WOODD, sd, 4.5); shp(sk, circ(x, y - 62 * k, 36 * k, { over: 0.05, seed: sd + 2, lump: 0.07 }), "#7CC47F", sd + 3, 5.5); };
  tree(cx - 206, cy + 52, 0.9, 11); tree(cx - 150, cy + 64, 1.15, 17); tree(cx - 96, cy + 50, 0.85, 23);
  const house = (x, y, k, col, sd) => { shp(sk, box(x - 38 * k, y - 58 * k, x + 38 * k, y), "#F6EFDC", sd, 5); shp(sk, poly([[x - 52 * k, y - 56 * k], [x, y - 104 * k], [x + 52 * k, y - 56 * k]], 3), col, sd + 2, 5.5); shp(sk, box(x - 10 * k, y - 30 * k, x + 10 * k, y), WOODD, sd + 4, 4); };
  house(cx + 150, cy + 56, 0.85, "#F08A2E", 31); house(cx + 236, cy + 70, 1.08, "#C9A7E0", 37); house(cx + 320, cy + 54, 0.82, "#F7C948", 43);
  // 길: 하나로 이어진 두 고리
  const road = seg(0, PI * 2, 260);
  sk.ink(road, { w: 58, color: "#5A6470", seed: 51, wob: 0.5 }); sk.ink(road, { w: 49, color: "#DDE2E8", seed: 51, wob: 0.5 });
  // 가운데 정류장
  shp(sk, circ(cx, cy, 44, { over: 0.05, seed: 55 }), "#FFD84A", 56, 7);
  shp(sk, rrect(cx - 19, cy - 13, 38, 24, 6), C.white, 58, 4.5);
  sk.dot(cx - 10, cy + 13, 4.5); sk.dot(cx + 10, cy + 13, 4.5);
  // 달리는 방향(한 방향으로 이어진다)
  for (const [t0, t1, i] of [[0.2, 0.47, 0], [1.22, 1.6, 1], [1.92, 2.3, 2], [2.62, 2.93, 3], [PI + 0.22, PI + 0.56, 4], [PI + 1.3, PI + 1.84, 5], [PI + 2.56, PI + 2.92, 6]])
    arrow(sk, seg(t0, t1), { w: 8, color: ARW, seed: 61 + i * 5, head: 22, wob: 0.2 });
  // 버스(큰 고리 아래쪽을 지나는 중)
  const b = P(PI / 4);
  sk.at(b[0], b[1] - 16, 1, () => {
    shp(sk, rrect(-84, -44, 168, 76, 16), "#F58A2E", 71, 7);
    for (const [x, i] of [[-70, 0], [-26, 1], [18, 2]]) shp(sk, rrect(x, -32, 36, 30, 5), "#DCEFFA", 73 + i * 2, 4);
    shp(sk, rrect(60, -32, 18, 44, 4), "#DCEFFA", 81, 4);
    for (const x of [-48, 46]) { shp(sk, circ(x, 34, 17, { over: 0, seed: 83 + x }), "#39424E", 85 + x, 5); sk.dot(x, 34, 5.5, "#C9D2DE"); }
  });
  // 정류장 표지판과 기다리는 학생
  const GY = 706, kx = cx - 6, ks = 0.44;
  ground(sk, GY, 91, cx - 96, cx + 122, { w: 7 });
  thin(sk, 0.8, () => sk.ink(dense([[cx + 72, GY], [cx + 72, 552]]), { w: 7, seed: 93, wob: 0.2 }));
  shp(sk, circ(cx + 72, 532, 25, { over: 0.05, seed: 95 }), "#3FAE5A", 96, 5.5);
  shp(sk, rrect(cx + 59, 523, 26, 16, 4), C.white, 98, 3.5);
  const PK = pose({ elL: [-86, -300], haL: [-126, -386], tilt: -0.06 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- g2u6l4: 풀무를 벌리면 부풀며 공기가 들어오고, 오므리면 나가 불이 살아난다 ---------- */
function fire(sk, x, gy, k, lean, sd) {
  thin(sk, 0.8, () => { pipe(sk, dense([[x - 62, gy - 8], [x + 62, gy - 26]]), 15, WOODD, sd); pipe(sk, dense([[x - 62, gy - 26], [x + 62, gy - 8]]), 15, WOOD, sd + 1); });
  const fl = (m, col, s2) => { const pts = curve([[-40, 0], [-52, -50], [-24, -86], [-8, -150], [26, -96], [50, -52], [40, 0]].map(([px, py]) => [x + (px * m + lean * -py * 0.3 * m) * k, gy - 22 + py * m * k]), true, 3); sk.fill(pts, col, { dx: 0, dy: 0, wob: 0.3, seed: s2 }); if (m === 1) sk.ink(pts, { w: 6, seed: s2 + 1, wob: 0.4 }); };
  fl(1, "#F58A2E", sd + 3); fl(0.55, "#FFD84A", sd + 5);
}
function bellowsRow(sk, GY, open, sd) {
  const s = 0.52, kx = 118, L = 320, half = open ? 46 : 13, ROT = 0.15, Hc = [198, GY - 138];
  ground(sk, GY, sd);
  const T = (x, y) => [Hc[0] + x * Math.cos(ROT) - y * Math.sin(ROT), Hc[1] + x * Math.sin(ROT) + y * Math.cos(ROT)];
  const U = x => -(6 + (half - 6) * (L - x) / L), Lw = x => -U(x);
  sk.at(Hc[0], Hc[1], 1, () => {
    // 가죽 주머니
    const lx = 54, bulge = open ? 22 : 5;
    const skin = [...dense([[lx, U(lx)], [L - 14, U(L - 14)], [L - 14, Lw(L - 14)], [lx, Lw(lx)]]), ...curve([[lx, Lw(lx)], [lx - bulge, 0], [lx, U(lx)]])];
    shp(sk, skin, "#C07A4F", sd + 2, 6, { tex: 0.8 });
    for (let x = lx + 34, i = 0; x < L - 40; x += 44, i++) sk.ink(curve([[x, U(x) + 3], [x - (open ? 9 : 3), 0], [x, Lw(x) - 3]]), { w: 4, color: "#7A4526", seed: sd + 5 + i, wob: 0.2 });
    // 두 나무판과 손잡이, 바람 구멍
    thin(sk, 0.8, () => {
      pipe(sk, dense([[-18, U(-18)], [L, -6]]), 12, WOOD, sd + 15, 0.3);
      pipe(sk, dense([[-18, Lw(-18)], [L, 6]]), 12, WOOD, sd + 16, 0.3);
      shp(sk, poly([[L - 6, -13], [L + 56, -5], [L + 56, 5], [L - 6, 13]], 3), STEEL, sd + 17, 6);
    });
    // 공기
    const tipx = L + 66;
    for (const [dy, i] of [[-46, 0], [0, 1], [46, 2]]) {
      const far = [tipx + 112 - Math.abs(dy) * 0.3, dy], near = [tipx + 8, dy * 0.2];
      arrow(sk, open ? [far, near] : [near, far], { w: 9, color: AIR, straight: true, seed: sd + 21 + i * 5, head: 22, wob: 0.2 });
    }
  }, ROT);
  // 모닥불: 바람 구멍이 향하는 자리
  fire(sk, 782, GY, open ? 0.5 : 1.15, open ? 0 : 1, sd + 40);
  // 학생: 두 손잡이를 잡는다(팔은 어깨에서 내려와 손잡이로)
  const hu = T(0, U(0) - 2), hl = T(0, Lw(0) + 2);
  const PK = pose({ ...local(kx, GY, s, { haR: hu, elR: [hu[0] - 40, hu[1] + (open ? 30 : 22)], haL: hl, elL: [hl[0] - 50, hl[1] - (open ? 30 : 4)] }), tilt: 0.04 });
  drawFigure(sk, kx, GY, s, PK, { ...STUDENT, name: open ? "open" : "shut", hands: false });
  handDot(sk, hu, C.skin, sd + 61, 15 * s); handDot(sk, hl, C.skin, sd + 63, 15 * s);
}
function cutL4() {
  const sk = new Sk(W, H, { id: "g" });
  bellowsRow(sk, 342, true, 11);
  bellowsRow(sk, 704, false, 111);
  return sk;
}

/* ---------- g2u6l4b: 새 상자와 빈 상자가 서로 반대 방향으로 오간다 ---------- */
function cutL4b() {
  const sk = new Sk(W, H, { id: "h" });
  const GY = 676, s = 0.66;
  // 집과 문
  thin(sk, 0.8, () => {
    sk.fill(box(640, 92, 960, GY), "#F6EAD6", { dx: 0, dy: 0, wob: 0, seed: 11 });
    sk.ink(dense([[640, GY], [640, 92], [960, 92]]), { w: 9, seed: 12, wob: 0.5 });
    shp(sk, box(676, 176, 872, GY), "#FFF8E6", 13, 8);
    shp(sk, poly([[872, 176], [918, 196], [918, GY - 2], [872, GY]], 5), WOOD, 15, 7, { tex: 0.8 });
    sk.dot(904, 440, 7, "#E2B23C");
  });
  ground(sk, GY, 17);
  // 새 상자(위쪽, 집으로)
  const nx = 338, ny = 348, nw = 150, nh = 122, BOXC = "#D9A566";
  shp(sk, box(nx, ny, nx + nw, ny + nh), BOXC, 21, 7, { tex: 0.8 });
  sk.fill(box(nx + nw / 2 - 12, ny + 3, nx + nw / 2 + 12, ny + nh - 3), "#F4E3BE", { dx: 0, dy: 0, wob: 0.2, seed: 23 });
  sk.ink(dense([[nx + 4, ny + 26], [nx + nw - 4, ny + 26]]), { w: 4, color: "#9A6B33", seed: 25, wob: 0.3 });
  sparkle(sk, nx + nw + 26, ny - 8, 22, { seed: 27 }); sparkle(sk, nx + 16, ny - 28, 15, { seed: 31 });
  // 다 쓴 빈 상자(아래쪽, 배달원에게): 뚜껑이 열려 속이 비었다
  const ex = 524, ey = 506, ew = 144, eh = 104, EMP = "#CFC4AE";
  shp(sk, poly([[ex, ey], [ex + ew, ey], [ex + ew + 26, ey - 30], [ex + 26, ey - 30]], 4), "#8F8168", 41, 5.5);
  shp(sk, poly([[ex, ey], [ex + 26, ey - 30], [ex - 6, ey - 52], [ex - 32, ey - 22]], 4), EMP, 43, 5.5);
  shp(sk, poly([[ex + ew, ey], [ex + ew + 26, ey - 30], [ex + ew + 58, ey - 12], [ex + ew + 32, ey + 18]], 4), EMP, 45, 5.5);
  shp(sk, box(ex, ey, ex + ew, ey + eh), EMP, 47, 7);
  sk.ink(dense([[ex + 30, ey + 40], [ex + 70, ey + 40]]), { w: 4, color: "#9C917B", seed: 49, wob: 0.4 }); sk.ink(dense([[ex + 84, ey + 70], [ex + 118, ey + 70]]), { w: 4, color: "#9C917B", seed: 50, wob: 0.4 });
  // 서로 반대 방향
  arrow(sk, [[330, 282], [628, 282]], { w: 13, color: O2, straight: true, seed: 51, head: 30, wob: 0.3 });
  arrow(sk, [[672, 648], [352, 648]], { w: 13, color: CO2, straight: true, seed: 55, head: 30, wob: 0.3 });
  // 배달원(초록 모자와 조끼)
  const kx = 238, hn = [nx + 2, ny + 78];
  const PD = pose({ ...local(kx, GY, s, { haR: hn, elR: [hn[0] - 56, hn[1] + 30] }), elL: [-50, -262], haL: [-78, -196], tilt: 0.05 });
  drawFigure(sk, kx, GY, s, PD, { hair: "knit", capColor: "#3FAE5A", coat: { color: "#8FD19E", seam: "#2E7D46", len: 16 }, seed: 271, name: "courier", hands: "L" });
  handDot(sk, hn, C.skin, 61, 15 * s);
  // 집주인
  const ox = 770, he = [ex + ew + 2, ey + 58];
  const PO = pose({ ...local(ox, GY, s, { haL: he, elL: [he[0] + 56, he[1] - 34] }), elR: [50, -262], haR: [78, -196], tilt: -0.05 });
  drawFigure(sk, ox, GY, s, PO, { ...STUDENT, name: "owner", flip: -1, hands: "R" });
  handDot(sk, he, C.skin, 65, 15 * s);
  return sk;
}

/* ---------- g2u6l5: 방에서 생긴 쓰레기를 봉투에 묶어 문밖 수거함에. 방 안은 깨끗하다 ---------- */
function cutL5() {
  const sk = new Sk(W, H, { id: "i" });
  const GY = 676;
  // 방
  thin(sk, 0.8, () => {
    sk.fill(box(40, 110, 530, GY), "#FFF8E6", { dx: 0, dy: 0, wob: 0, seed: 11 });
    sk.ink(dense([[40, GY], [40, 110], [530, 110], [530, 286]]), { w: 9, seed: 12, wob: 0.5 });
    shp(sk, rrect(96, 178, 150, 124, 8), "#CFE9F8", 13, 7);
    shp(sk, poly([[530, 286], [580, 306], [580, GY - 2], [530, GY]], 5), WOOD, 17, 7, { tex: 0.8 });
    sk.dot(566, 480, 6, "#E2B23C");
    sk.ink(dense([[171, 180], [171, 300]]), { w: 5, seed: 15, wob: 0.2 }); sk.ink(dense([[98, 240], [244, 240]]), { w: 5, seed: 16, wob: 0.2 });
  });
  table(sk, 84, 318, 500, GY, 21);
  shp(sk, poly([[176, 500], [184, 458], [232, 458], [240, 500]], 3), "#E8996B", 25, 6);
  for (const [dx, r, i] of [[-22, -0.5, 0], [0, 0, 1], [22, 0.5, 2]]) shp(sk, curve([[208, 458], [208 + dx - 12, 420], [208 + dx * 1.6, 384], [208 + dx + 12, 420]], true, 3), "#6FBF73", 27 + i * 2, 5);
  sparkle(sk, 364, 232, 26, { seed: 31 }); sparkle(sk, 440, 420, 20, { seed: 35 }); sparkle(sk, 396, 596, 24, { seed: 39 });
  ground(sk, GY, 41);
  arrow(sk, [[330, 646], [586, 646]], { w: 10, color: TEAL, straight: true, seed: 43, head: 26, wob: 0.3 });
  // 묶은 쓰레기 봉투
  const hand = [770, 428], bc = [820, 506];
  const bag = circ(bc[0], bc[1], 72, { over: 0.05, seed: 61, lump: 0.07, sy: 1.02 });
  sk.fill(bag, "#EEF2F6", { dx: 0, dy: 0, wob: 0.4, seed: 62 });
  shp(sk, circ(bc[0] - 22, bc[1] + 18, 20, { over: 0, seed: 63, lump: 0.2 }), "#F7C948", 64, 3.5, { line: "#C9A227" });
  shp(sk, circ(bc[0] + 24, bc[1] + 6, 17, { over: 0, seed: 65, lump: 0.2 }), "#F2A7A0", 66, 3.5, { line: "#C77B74" });
  shp(sk, circ(bc[0] + 2, bc[1] + 40, 15, { over: 0, seed: 67, lump: 0.2 }), "#B9C7D6", 68, 3.5, { line: "#8E9AAB" });
  sk.ink(bag, { w: 7, seed: 69, wob: 0.5 });
  sk.ink(curve([[bc[0] - 40, bc[1] - 34], [bc[0] - 20, bc[1] - 14], [bc[0] - 28, bc[1] + 4]]), { w: 4, color: "#B4BEC9", seed: 70, wob: 0.3 });
  for (const sg of [-1, 1]) sk.ink(curve([[bc[0] - 34, bc[1] - 66], [bc[0] - 34 + sg * 16, bc[1] - 88], [bc[0] - 34 + sg * 30, bc[1] - 84]]), { w: 7, seed: 71 + sg, wob: 0.3 });
  shp(sk, circ(bc[0] - 34, bc[1] - 66, 11, { over: 0, seed: 77 }), "#EEF2F6", 78, 5);
  // 수거함
  thin(sk, 0.8, () => {
    shp(sk, poly([[908, 574], [926, 446], [946, 450], [928, 578]], 4), "#4E9E6A", 51, 7);
    shp(sk, poly([[748, 574], [916, 574], [902, GY - 2], [762, GY - 2]], 4), "#6FBF73", 53, 9, { tex: 0.8 });
    sk.ink(dense([[756, 602], [908, 602]]), { w: 5, color: "#3F8F4F", seed: 55, wob: 0.3 });
  });
  // 학생
  const kx = 652, ks = 0.64;
  const PK = pose({ ...local(kx, GY, ks, { haR: hand, elR: [hand[0] - 58, hand[1] + 30] }), elL: [-48, -262], haL: [-76, -196], tilt: 0.05 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  handDot(sk, hand, C.skin, 81, 15 * ks);
  return sk;
}

/* ---------- g2u6l5b: 체 위에 큰 돌이 남고, 빠진 고운 흙에서 구슬만 다시 줍는다 ---------- */
function marble(sk, x, y, r, sd) {
  shp(sk, circ(x, y, r, { over: 0.05, seed: sd }), "#2FC4B2", sd + 1, 5);
  sk.ink(curve([[x - r * 0.5, y - r * 0.2], [x - r * 0.3, y - r * 0.5], [x, y - r * 0.6]]), { w: 3, color: C.white, seed: sd + 3, wob: 0 });
}
function cutL5b() {
  const sk = new Sk(W, H, { id: "j" });
  const GY = 676, cx = 250, cy = 258, RX = 182, RY = 58, DEP = 36, SOIL = "#B98A52";
  ground(sk, GY, 11);
  // 받침(곧은 다리)
  thin(sk, 0.8, () => { for (const sg of [-1, 1]) sk.ink(dense([[cx + sg * 168, cy + 30], [cx + sg * 168, GY]]), { w: 10, seed: 13 + sg, wob: 0.4 }); });
  // 그물 아래로 빠지는 고운 흙과 구슬
  for (let i = 0; i < 34; i++) { const x = cx - 108 + 216 * hash(i * 3.7 + 1), y = cy + 84 + (GY - 196 - cy) * hash(i * 5.3 + 2); sk.dot(x, y, 3.2 + 2.4 * hash(i * 1.9), SOIL); }
  arrow(sk, [[cx - 4, cy + 84], [cx - 4, cy + 170]], { w: 8, color: "#8A6A4A", straight: true, seed: 17, head: 20, wob: 0.2 });
  marble(sk, cx - 56, 452, 13, 21); marble(sk, cx + 60, 400, 13, 25);
  // 흙더미(구슬은 남기지 않는다)
  const heap = curve([[cx - 150, GY - 2], [cx - 96, GY - 50], [cx - 8, GY - 80], [cx + 88, GY - 54], [cx + 150, GY - 2]], false, 4);
  sk.fill([...heap, heap[0]], SOIL, { dx: 0, dy: 0, wob: 0.4, seed: 31, tex: 0.8 }); thin(sk, 0.8, () => sk.ink(heap, { w: 8, seed: 32, wob: 0.8 }));
  // 체: 둥근 나무 테와 그물망, 그 위에 남은 큰 돌
  thin(sk, 0.8, () => {
    shp(sk, ell(cx, cy, RX, RY), WOOD, 51, 8);
    shp(sk, ell(cx, cy, RX - 20, RY - 11), "#F7F8FA", 53, 5);
    for (let dx = -144; dx <= 144; dx += 24) { const h = (RY - 13) * Math.sqrt(1 - (dx / (RX - 20)) ** 2); sk.ink(dense([[cx + dx, cy - h], [cx + dx, cy + h]]), { w: 3, color: GRAYD, seed: 55 + dx, wob: 0 }); }
    for (let dy = -36; dy <= 36; dy += 12) { const w = (RX - 22) * Math.sqrt(1 - (dy / (RY - 11)) ** 2); sk.ink(dense([[cx - w, cy + dy], [cx + w, cy + dy]]), { w: 3, color: GRAYD, seed: 75 + dy, wob: 0 }); }
  });
  for (const [dx, dy, r, col, i] of [[-84, -30, 44, "#9AA7B4", 0], [6, -40, 54, "#8793A2", 1], [96, -26, 40, "#A9B4C0", 2]]) {
    shp(sk, circ(cx + dx, cy + dy, r, { over: 0.05, seed: 81 + i * 3, lump: 0.1, sy: 0.84 }), col, 83 + i * 3, 7, { tex: 0.8 });
    sk.ink(curve([[cx + dx - r * 0.5, cy + dy - r * 0.2], [cx + dx - r * 0.25, cy + dy - r * 0.48], [cx + dx + r * 0.1, cy + dy - r * 0.55]]), { w: 4, color: "#D5DCE4", seed: 91 + i, wob: 0.2 });
  }
  thin(sk, 0.8, () => shp(sk, [...ell(cx, cy, RX, RY, 0, Math.PI), ...ell(cx, cy + DEP, RX, RY, Math.PI, 0)], WOOD, 95, 8, { tex: 0.8, texAng: 0 }));
  // 구슬은 모두 주머니로: 흙더미에서 주머니 입구로
  const hand = [650, 560], pc = [612, 518];
  arrow(sk, [[cx + 116, GY - 86], [424, 480], [500, 402], [566, 404], [594, 444]], { w: 10, color: TEAL, seed: 101, head: 26, wob: 0.3 });
  marble(sk, 414, 500, 15, 105); marble(sk, 470, 424, 15, 109); marble(sk, 536, 394, 15, 113);
  shp(sk, curve([[pc[0] - 32, pc[1] - 48], [pc[0] - 56, pc[1] - 6], [pc[0] - 42, pc[1] + 40], [pc[0], pc[1] + 52], [pc[0] + 42, pc[1] + 40], [pc[0] + 56, pc[1] - 6], [pc[0] + 32, pc[1] - 48]], true, 3), "#A98BE0", 121, 7, { tex: 0.8 });
  shp(sk, ell(pc[0], pc[1] - 50, 35, 13), "#5E4A8C", 123, 5.5);
  marble(sk, pc[0] - 8, pc[1] - 54, 14, 117);
  sk.ink(curve([[pc[0] - 44, pc[1] - 26], [pc[0], pc[1] - 16], [pc[0] + 44, pc[1] - 26]]), { w: 4.5, color: "#5E4A8C", seed: 125, wob: 0.2 });
  sparkle(sk, 548, 516, 15, { seed: 127 });
  // 학생
  const kx = 738, ks = 0.66;
  const PK = pose({ ...local(kx, GY, ks, { haL: hand, elL: [hand[0] + 66, hand[1] - 16] }), elR: [90, -296], haR: [132, -384], tilt: -0.08 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", flip: -1, hands: "R" });
  handDot(sk, hand, C.skin, 131, 15 * ks);
  return sk;
}

/* ---------- g2u6l6: 자동차는 연료와 공기를 받아 달리고, 배기구로 김이 나온다 ---------- */
function cutL6() {
  const sk = new Sk(W, H, { id: "k" });
  const GY = 626, CAR = "#3DBBA6";
  ground(sk, GY, 11);
  // 배기구의 김
  for (const [x, y, r, i] of [[112, 520, 24, 0], [70, 478, 33, 1], [62, 408, 42, 2]]) shp(sk, circ(x, y, r, { over: 0.05, seed: 13 + i * 3, lump: 0.12 }), "#F4F6F8", 15 + i * 3, 5, { line: STEEL });
  thin(sk, 0.8, () => {
    pipe(sk, dense([[190, 528], [146, 528]]), 11, STEEL, 23, 0.2);
    // 차체
    shp(sk, poly([[318, 400], [372, 280], [606, 280], [680, 400]], 5), CAR, 25, 9);
    shp(sk, rrect(176, 392, 612, 150, 44), CAR, 27, 9, { tex: 0.8, texAng: 0 });
    shp(sk, poly([[350, 392], [388, 300], [594, 300], [650, 392]], 5), "#DCEFFA", 29, 6);
    sk.ink(dense([[544, 300], [544, 392]]), { w: 7, seed: 31, wob: 0.2 });
    shp(sk, ell(770, 440, 14, 22), "#FFD84A", 33, 5);
    for (const y of [486, 504]) sk.ink(dense([[752, y], [786, y]]), { w: 4.5, seed: 35 + y, wob: 0.1 });
    shp(sk, circ(238, 446, 17, { over: 0, seed: 37 }), "#2C9886", 38, 5);
  });
  // 운전하는 학생
  sk.save(); sk.translate(458, 352); sk.scale(0.36); drawHead(sk, STUDENT); sk.restore();
  // 바퀴와 속도 선
  for (const x of [304, 664]) {
    shp(sk, circ(x, 562, 62, { over: 0.05, seed: 41 + x }), "#39424E", 43 + x, 8);
    shp(sk, circ(x, 562, 25, { over: 0, seed: 45 + x }), "#C9D2DE", 47 + x, 5);
  }
  for (const [x0, x1, y, i] of [[118, 214, 584, 0], [96, 196, 606, 1], [426, 536, 590, 2], [404, 500, 610, 3], [26, 120, 330, 4], [50, 150, 300, 5]]) sk.ink(dense([[x0, y], [x1, y]]), { w: 6, color: C.gray, seed: 51 + i, wob: 0.3 });
  // 앞으로 들어오는 공기
  for (const [y, i] of [[430, 0], [476, 1], [522, 2]]) arrow(sk, [[944, y], [812, y]], { w: 10, color: AIR, straight: true, seed: 61 + i * 5, head: 24, wob: 0.3 });
  // 연료
  const fx = 178, fy = 96;
  thin(sk, 0.8, () => {
    pipe(sk, dense([[fx + 100, fy + 22], [fx + 136, fy - 8]]), 11, FUEL, 71, 0.2);
    shp(sk, rrect(fx, fy, 116, 132, 14), FUEL, 73, 8, { tex: 0.8 });
    shp(sk, rrect(fx + 14, fy - 24, 52, 30, 9), FUEL, 75, 6);
  });
  drop(sk, fx + 58, fy + 72, 1.7, { color: "#FFE9C7", line: C.ink });
  arrow(sk, [[fx + 60, fy + 150], [fx + 60, 418]], { w: 11, color: FUEL, straight: true, seed: 81, head: 26, wob: 0.3 });
  return sk;
}

export function cuts() {
  return [
    { name: "g2u6l1", theme: "body", orig: null, sk: cutL1(), alt: "밥, 생선구이, 나물, 과일, 우유, 물이 골고루 담긴 급식 식판이 급식대 위에 놓여 있고 스틱맨이 식판을 잡고 흐뭇해하는 장면", cap: "식판에 밥, 생선, 나물, 과일, 우유, 물이 골고루 담겼어요" },
    { name: "g2u6l1b", theme: "body", orig: null, sk: cutL1b(), alt: "스틱맨 쌤이 반으로 자른 감자의 단면에 갈색 용액을 한 방울 떨어뜨리자 그 자리만 짙은 남색으로 변하고 옆에서 스틱맨이 놀라는 장면", cap: "감자 단면에 갈색 용액을 떨어뜨리니 그 자리만 청람색으로 변했어요" },
    { name: "g2u6l2", theme: "body", orig: null, sk: cutL2(), alt: "블록으로 쌓은 큰 성은 벽의 작은 문을 지나지 못하고, 스틱맨이 낱개로 떼어 낸 블록만 문을 지나가는 장면", cap: "큰 성은 작은 문을 못 지나가고, 낱개로 뗀 블록만 문을 지나가요" },
    { name: "g2u6l2b", theme: "body", orig: null, sk: cutL2b(), alt: "엎지른 물을 매끈한 비닐로 닦는 스틱맨의 탁자에는 물이 그대로 남아 있고, 올이 빽빽한 수건으로 닦는 스틱맨의 탁자는 말라 있는 장면", cap: "반들반들한 비닐은 물을 못 닦고, 올이 빽빽한 수건은 물을 빨아들여요" },
    { name: "g2u6l3", theme: "body", orig: null, sk: cutL3(), alt: "비스듬히 내려다본 날개 넷짜리 회전문을 한 사람이 화살표 방향으로 지나가고 다음 사람이 차례를 기다리며, 반대쪽에서 거꾸로 들어가려는 사람은 문 날개에 막혀 서 있는 장면", cap: "회전문은 화살표 쪽으로만 돌아서, 거꾸로 들어가려는 사람은 날개에 막혀요" },
    { name: "g2u6l3b", theme: "body", orig: null, sk: cutL3b(), alt: "가운데 정류장 하나에서 만나는 크고 작은 두 고리 모양의 길을 순환 버스가 한 방향으로 달리고, 작은 고리 안에는 숲이, 큰 고리 안에는 마을이 있는 장면", cap: "버스는 숲 고리와 마을 고리를 번갈아 돌며 가운데 정류장을 지나요" },
    { name: "g2u6l4", theme: "body", orig: null, sk: cutL4(), alt: "위쪽에서는 스틱맨이 손풀무의 손잡이를 벌려 풀무가 부풀며 공기가 들어가고, 아래쪽에서는 손잡이를 오므려 풀무가 납작해지며 공기가 모닥불 쪽으로 밀려 나가는 장면", cap: "풀무를 벌려 안이 넓어지면 공기가 들어오고, 오므려 좁아지면 공기가 밀려 나가요" },
    { name: "g2u6l4b", theme: "body", orig: null, sk: cutL4b(), alt: "집 문 앞에서 배달원이 새 상자를 건네고 집주인은 다 쓴 빈 상자를 건네며, 두 상자 곁의 화살표가 서로 반대 방향을 가리키는 장면", cap: "새 상자는 집으로, 빈 상자는 밖으로 서로 반대로 오가요" },
    { name: "g2u6l5", theme: "body", orig: null, sk: cutL5(), alt: "스틱맨이 방에서 생긴 쓰레기를 봉투에 담아 묶어 문밖 수거함에 내놓고, 방 안은 깨끗하게 반짝이는 장면", cap: "방에서 생긴 쓰레기를 묶어 문밖 수거함에 내놓아요" },
    { name: "g2u6l5b", theme: "body", orig: null, sk: cutL5b(), alt: "체 위에는 큰 돌이 남고 아래로 고운 흙과 구슬이 빠지며, 흙더미에서 나온 구슬이 모두 스틱맨이 든 주머니 입구로 들어가는 장면", cap: "큰 돌은 체 위에 남고, 아래로 빠진 것 가운데 구슬은 모두 다시 주머니에 담아요" },
    { name: "g2u6l6", theme: "body", orig: null, sk: cutL6(), alt: "스틱맨이 탄 자동차가 연료와 앞쪽의 공기를 받아 달리고 뒤쪽 배기구로 김이 나오는 장면", cap: "자동차는 연료와 공기를 받아 달리고, 배기구로 김을 내보내요" },
  ];
}
