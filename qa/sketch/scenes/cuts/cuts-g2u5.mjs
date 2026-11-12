// 중2 과학 Ⅴ단원(식물과 에너지) 개념 컷 코드 그림.
// 목록은 Ⅴ단원 v5 세션이 낸 것(D:\Brilliant Science\output\g2-v5\u5\concept-cuts.md): g2u5l1 ~ g2u5l6b 여덟 줄.
// 색의 뜻(중2 만화 g2u5l1 과 같은 약속): 물이 가는 길은 파란 화살표, 이산화 탄소는 회색 화살표와 회색 점,
// 산소는 하늘색 방울. 햇빛은 주황 물결 화살표. 에너지는 노란 번개 기호.
// 아이오딘-아이오딘화 칼륨 용액은 갈색, 녹말을 만난 자리는 짙은 남색(청람색).
import { Sk, C, curve, dense, circ, ell, poly, rrect, arrow, drop, sparkle, mix } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { sun, moon } from "../../lib/props.mjs";
import { W, H, lerpx, thin, ray } from "./common.mjs";

const LEAF = "#6FBF5A", LEAF_D = "#2F7D46", STEM = "#4E9E4A", SOIL = "#7A5234", POT = "#C9773F";
const CO2 = "#7E848C", O2 = "#BFE6F7", O2L = "#3F9AD6", WATER = "#CFEAF8", WATERD = "#5FAEDD";
const SKY = "#DFF1FB", NIGHT = "#2B3A6B", IODINE = "#B5762A", NAVY = "#27306F", BERRY = "#E8463C";
const ground = (sk, y, sd, x0 = 14, x1 = 946, o = {}) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd, ...o });
const box = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 6);
const pipe = (sk, pts, w, col, sd, wob = 0.5) => { sk.ink(pts, { w: w + 7, seed: sd, wob }); sk.ink(pts, { w, color: col, seed: sd, wob }); };
const blob = (sk, pts, col, sd, w = 6, o = {}) => { sk.fill(pts, col, { dx: 0, dy: 0, wob: 0.3, seed: sd, ...o }); if (w) sk.ink(pts, { w, seed: sd + 1, wob: 0.4 }); };
// 번개 기호(에너지)
function bolt(sk, x, y, s, sd, rot = 0) {
  sk.at(x, y, s, () => {
    const p = poly([[8, -32], [-15, 4], [-1, 4], [-9, 32], [16, -7], [2, -7]], 3);
    sk.fill(p, "#FFD23D", { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(p, { w: 5, seed: sd + 1, wob: 0.3 });
  }, rot);
}
// 잎 한 장: (x, y) = 잎자루 쪽 끝, ang 쪽으로 len 만큼 뻗는다
function leaf(sk, x, y, len, ang, sd, o = {}) {
  sk.at(x, y, 1, () => {
    const l = curve([[0, 0], [len * 0.3, -len * 0.26], [len * 0.75, -len * 0.17], [len, 0], [len * 0.75, len * 0.17], [len * 0.3, len * 0.26]], true, 3);
    sk.fill(l, o.col ?? LEAF, { dx: 0, dy: 0, wob: 0.3, seed: sd });
    sk.ink(l, { w: o.w ?? 6, seed: sd + 1, wob: 0.4 });
    sk.ink(dense([[len * 0.08, 0], [len * 0.84, 0]]), { w: 3.5, color: LEAF_D, seed: sd + 2, wob: 0.3 });
  }, ang);
}
// 질그릇 화분: (x, y) = 바닥 가운데. 흙 윗면의 높이를 돌려준다
function pot(sk, x, y, w, h, sd) {
  const ty = y - h - 22;
  thin(sk, 0.8, () => {
    const b = poly([[x - w / 2 + 8, y - h], [x + w / 2 - 8, y - h], [x + w * 0.36, y], [x - w * 0.36, y]], 4);
    sk.fill(b, POT, { dx: 0, dy: 0, wob: 0.3, seed: sd, tex: 0.8, texAng: 0.05 }); sk.ink(b, { w: 9, seed: sd + 1 });
    const rim = rrect(x - w / 2 - 6, y - h - 26, w + 12, 30, 10);
    sk.fill(rim, mix(POT, "#ffffff", 0.2), { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 }); sk.ink(rim, { w: 8, seed: sd + 3 });
    const top = ell(x, ty, w / 2 - 6, 11);
    sk.fill(top, SOIL, { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 }); sk.ink(top, { w: 6, seed: sd + 5, wob: 0.4 });
  });
  return ty;
}
// 줄기와 마주난 잎: (x, y) = 줄기 밑. 잎마다 { base, tip } 을 돌려준다
function plant(sk, x, y, h, sd, o = {}) {
  const lean = o.lean ?? 0, len = o.len ?? h * 0.36, n = o.pairs ?? 2, out = [];
  const stem = curve([[x, y], [x + lean * 0.3 - 3, y - h * 0.5], [x + lean, y - h]]);
  pipe(sk, stem, o.sw ?? 9, STEM, sd, 0.5);
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / (n + 0.6), p = stem[Math.floor(t * (stem.length - 1))];
    for (const sg of [1, -1]) {
      const L = len * (1 - 0.12 * i) * (sg > 0 ? 1 : 0.92), ang = sg > 0 ? -0.42 - i * 0.08 : Math.PI + 0.42 + i * 0.08, by = p[1] - (sg > 0 ? 0 : h * 0.06);
      leaf(sk, p[0], by, L, ang, sd + 10 + i * 8 + (sg > 0 ? 0 : 4), { w: o.lw });
      out.push({ base: [p[0], by], tip: [p[0] + L * Math.cos(ang), by + L * Math.sin(ang)] });
    }
  }
  const top = stem[stem.length - 1];
  leaf(sk, top[0], top[1] + 4, len * 0.8, -Math.PI / 2 + (o.topAng ?? 0.14), sd + 60, { w: o.lw });
  return out;
}
// 창문: 하늘색을 칠하고 inside 로 창밖 풍경을 그린 뒤 틀을 얹는다
function windowFrame(sk, x0, y0, x1, y1, sky, sd, inside) {
  sk.fill(box(x0, y0, x1, y1), sky, { dx: 0, dy: 0, wob: 0.3, seed: sd });
  if (inside) inside();
  thin(sk, 0.8, () => {
    sk.ink(dense([[(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1]]), { w: 6, seed: sd + 2, wob: 0.3, color: sky === NIGHT ? "#C9D4EE" : C.ink });
    sk.ink(box(x0, y0, x1, y1), { w: 10, seed: sd + 1 });
    sk.ink(dense([[x0 - 16, y1 + 7], [x1 + 16, y1 + 7]]), { w: 11, seed: sd + 3 });
  });
}
function table(sk, x0, x1, ty, gy, sd) {
  thin(sk, 0.8, () => {
    for (const [x, i] of [[x0 + 18, 0], [x1 - 18, 1]]) sk.ink(dense([[x, ty + 16], [x, gy]]), { w: 10, seed: sd + i });
    const top = rrect(x0, ty, x1 - x0, 20, 7);
    sk.fill(top, C.wood, { dx: 0, dy: 0, wob: 0.3, seed: sd + 2, tex: 0.8, texAng: 0.02 }); sk.ink(top, { w: 9, seed: sd + 3 });
  });
}
// 산소 방울(하늘색)
function o2(sk, x, y, r, sd) {
  const b = circ(x, y, r, { over: 0.1, seed: sd });
  sk.fill(b, O2, { dx: 0, dy: 0, wob: 0.2, seed: sd + 1 }); sk.ink(b, { w: 5.5, color: O2L, seed: sd + 2, wob: 0.2 });
  sk.ink(curve([[x - r * 0.5, y - r * 0.2], [x - r * 0.28, y - r * 0.52], [x + r * 0.08, y - r * 0.6]]), { w: 3.5, color: C.white, seed: sd + 3, wob: 0.1 });
}
function strawberry(sk, x, y, s, sd, rot = 0) {
  sk.at(x, y, s, () => {
    blob(sk, curve([[0, -20], [20, -19], [27, -2], [13, 22], [0, 33], [-13, 22], [-27, -2], [-20, -19]], true, 3), BERRY, sd, 5);
    for (const [dx, dy] of [[-10, -4], [9, -6], [0, 9], [-8, 16], [10, 12]]) sk.dot(dx, dy, 2.4, "#FFE08A");
    blob(sk, poly([[-18, -20], [-8, -30], [0, -22], [8, -30], [18, -20], [0, -13]], 3), LEAF, sd + 3, 4);
  }, rot);
}

/* ---------- g2u5l1: 친구는 도시락을 먹고, 창가의 화분은 햇빛을 받아 스스로 양분을 만든다 ---------- */
function cutL1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 676;
  ground(sk, GY, 11);
  // 창과 해
  windowFrame(sk, 392, 40, 668, 286, SKY, 13, () => sun(sk, 462, 118, 32));
  // 학생: 책상 앞에서 도시락을 먹는다
  const kx = 176, ks = 0.64;
  const PK = pose({ elR: [112, -280], haR: [132, -350], elL: [-66, -292], haL: [-84, -252], tilt: 0.05 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  const hand = [kx + ks * 132, GY - ks * 350];
  // 숟가락(밥 한 술): 챙 아래 얼굴 앞으로
  pipe(sk, dense([[hand[0] + 8, hand[1] + 18], [hand[0] - 12, hand[1] - 24]]), 4, "#C9D2DE", 21, 0.2);
  blob(sk, ell(hand[0] - 16, hand[1] - 32, 16, 11), C.white, 23, 5);
  handDot(sk, hand, C.skin, 25, 15 * ks);
  table(sk, 40, 356, GY - 152, GY, 31);
  // 도시락: 밥과 반찬
  const bx = 250, by = GY - 152;
  thin(sk, 0.8, () => {
    blob(sk, rrect(bx - 78, by - 46, 156, 46, 9), "#F6A8A0", 41, 8);
    blob(sk, [...ell(bx - 34, by - 46, 34, 20, Math.PI, Math.PI * 2), [bx - 68, by - 46]], C.white, 43, 6);
    blob(sk, circ(bx + 18, by - 52, 14, { over: 0, seed: 45 }), "#F2C230", 45, 5);
    blob(sk, circ(bx + 50, by - 50, 13, { over: 0, seed: 47 }), LEAF, 47, 5);
    sk.ink(dense([[bx + 2, by - 44], [bx + 2, by - 4]]), { w: 5, seed: 49, wob: 0.2 });
  });
  // 화분(창가의 받침대 위)
  table(sk, 596, 800, GY - 92, GY, 51);
  const sy = pot(sk, 698, GY - 92, 138, 88, 55);
  plant(sk, 698, sy, 238, 61, { len: 112, sw: 10 });
  // 햇빛이 잎에 닿는다
  ray(sk, [512, 148], [604, 226], 71, { w: 8 }); ray(sk, [494, 182], [590, 318], 75, { w: 8 });
  // 쌤: 잎을 가리킨다
  const tx = 890, ts = 0.62;
  const PT = pose({ elL: [-84, -400], haL: [-106, -500], elR: [52, -262], haR: [82, -198], tilt: -0.05 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- g2u5l1b: 물은 흙에서 줄기를 따라 위로(파랑), 이산화 탄소는 공기에서 잎 뒷면으로(회색) ---------- */
function cutL1b() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 676, px = 486;
  ground(sk, GY, 11);
  const sy = pot(sk, px, GY, 214, 128, 13);
  const lv = plant(sk, px, sy, 336, 21, { len: 156, sw: 20 });
  // 물이 가는 길: 흙에서 줄기 속을 따라 위로
  arrow(sk, [[px, GY - 60], [px - 2, sy - 150], [px, sy - 300]], { w: 11, color: C.blue, seed: 31, head: 30, wob: 0.3 });
  // 학생: 물뿌리개로 흙에 물을 준다
  const kx = 132, ks = 0.56;
  const PK = pose({ elR: [84, -262], haR: [150, -300], elL: [-52, -262], haL: [-80, -196], tilt: 0.04 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  const hand = [kx + ks * 150, GY - ks * 300], CAN = "#F7C948";
  thin(sk, 0.8, () => {
    sk.ink(curve([[hand[0] + 16, hand[1] - 30], [hand[0] - 6, hand[1] - 22], [hand[0] - 6, hand[1] + 20], [hand[0] + 16, hand[1] + 28]]), { w: 9, seed: 41 });
    pipe(sk, dense([[hand[0] + 92, hand[1] + 20], [hand[0] + 156, hand[1] - 50]]), 12, CAN, 43, 0.3);
    blob(sk, rrect(hand[0] + 14, hand[1] - 38, 84, 76, 10), CAN, 45, 9, { tex: 0.8 });
    blob(sk, poly([[hand[0] + 146, hand[1] - 62], [hand[0] + 170, hand[1] - 62], [hand[0] + 164, hand[1] - 40], [hand[0] + 150, hand[1] - 44]], 3), CAN, 47, 6);
  });
  handDot(sk, hand, C.skin, 49, 15 * ks);
  for (const [dx, dy, i] of [[166, -22, 0], [180, 6, 1], [160, 16, 2]]) drop(sk, hand[0] + dx, hand[1] + dy, 0.85, { line: C.blue });
  // 이산화 탄소가 가는 길: 공기에서 잎 뒷면으로
  const L0 = lv[1], under = [(L0.base[0] + L0.tip[0]) / 2 - 4, (L0.base[1] + L0.tip[1]) / 2 + 26];
  arrow(sk, [[176, 196], [262, 318], [under[0] - 22, under[1] + 10]], { w: 11, color: CO2, seed: 51, head: 30, wob: 0.3 });
  for (const [x, y] of [[146, 148], [200, 132], [228, 180], [122, 208]]) sk.dot(x, y, 12, CO2);
  // 쌤: 잎 뒷면을 돋보기로 들여다본다(돋보기 속에 작은 구멍들)
  const tx = 806, ts = 0.58, R0 = lv[0], lc = [(R0.base[0] + R0.tip[0]) / 2 + 26, (R0.base[1] + R0.tip[1]) / 2 + 40], LR = 54;
  const th = [tx - ts * 178, GY - ts * 356];
  const PT = pose({ elL: [-104, -300], haL: [-178, -356], elR: [52, -262], haR: [82, -198], tilt: -0.08 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher", hands: "R" });
  sk.ink(dense([[lc[0] + LR * 0.72, lc[1] + LR * 0.72], th]), { w: 16, color: "#8A5A33", seed: 61, wob: 0.3 });
  const lens = circ(lc[0], lc[1], LR, { over: 0, seed: 63 });
  sk.fill(lens, "#CDEBC0", { dx: 0, dy: 0, wob: 0.2, seed: 64 });
  for (const [dx, dy, r, i] of [[-20, -14, 0.3, 0], [18, -4, -0.4, 1], [-6, 22, 0.1, 2]]) sk.at(lc[0] + dx, lc[1] + dy, 1, () => { blob(sk, ell(0, 0, 15, 9), "#A6D68F", 65 + i * 3, 0); sk.ink(ell(0, 0, 15, 9), { w: 4, color: LEAF_D, seed: 66 + i * 3, wob: 0.2 }); sk.ink(dense([[-7, 0], [7, 0]]), { w: 4, color: LEAF_D, seed: 67 + i * 3, wob: 0 }); }, r);
  sk.ink(lens, { w: 13, color: "#B8892E", seed: 75, wob: 0.4 });
  handDot(sk, th, C.skin, 77, 15 * ts);
  return sk;
}

/* ---------- g2u5l2: 갈색 용액 한 방울. 감자는 그 자리만 짙은 남색, 오이는 갈색 그대로 ---------- */
function slice(sk, cx, cy, rx, ry, th, top, side, sd) {
  const s = [...ell(cx, cy, rx, ry, 0, Math.PI), ...ell(cx, cy + th, rx, ry, Math.PI, 0)];
  thin(sk, 0.8, () => {
    blob(sk, [...ell(cx, cy + th, rx, ry, 0, Math.PI), [cx - rx, cy], [cx + rx, cy]], side, sd, 0);
    sk.ink([[cx + rx, cy], ...ell(cx, cy + th, rx, ry, 0, Math.PI), [cx - rx, cy]], { w: 8, seed: sd + 1, wob: 0.4 });
    blob(sk, ell(cx, cy, rx, ry), top, sd + 2, 8);
  });
  return s;
}
function cutL2() {
  const sk = new Sk(W, H, { id: "c" });
  const GY = 676, TY = 592;
  ground(sk, GY, 11);
  table(sk, 280, 944, TY, GY, 13);
  const spot = (x, y, rx, ry, col, sd) => { const b = curve([[x - rx, y + 2], [x - rx * 0.6, y - ry], [x + rx * 0.2, y - ry * 1.1], [x + rx, y - ry * 0.3], [x + rx * 0.8, y + ry * 0.8], [x - rx * 0.1, y + ry * 1.1]], true, 3); sk.fill(b, col, { dx: 0, dy: 0, wob: 0.4, seed: sd }); sk.fill(ell(x - rx * 0.1, y, rx * 0.5, ry * 0.5), mix(col, "#000000", 0.18), { dx: 0, dy: 0, wob: 0.2, seed: sd + 1 }); };
  // 반으로 자른 감자(녹말이 있다): 갈색 껍질, 울퉁불퉁한 단면. 방울이 떨어진 자리만 짙은 남색
  const pc = [410, 532], SKIN = "#B98A52";
  const face = curve([[pc[0] - 104, pc[1] + 4], [pc[0] - 88, pc[1] - 26], [pc[0] - 40, pc[1] - 40], [pc[0] + 10, pc[1] - 34], [pc[0] + 56, pc[1] - 42], [pc[0] + 100, pc[1] - 18], [pc[0] + 106, pc[1] + 10], [pc[0] + 70, pc[1] + 32], [pc[0] + 6, pc[1] + 40], [pc[0] - 62, pc[1] + 32]], true, 3);
  thin(sk, 0.8, () => {
    blob(sk, curve([[pc[0] - 104, pc[1] + 4], [pc[0] - 96, pc[1] + 40], [pc[0] - 50, pc[1] + 60], [pc[0] + 10, pc[1] + 62], [pc[0] + 70, pc[1] + 58], [pc[0] + 104, pc[1] + 36], [pc[0] + 106, pc[1] + 10], [pc[0], pc[1] - 10]], true, 3), SKIN, 21, 8, { tex: 0.8 });
    for (const [dx, dy] of [[-70, 44], [-10, 52], [58, 48]]) sk.dot(pc[0] + dx, pc[1] + dy, 3.4, "#7E5A30");
    sk.fill(face, "#F7E9A9", { dx: 0, dy: 0, wob: 0.3, seed: 23 });
    sk.ink(face.map(([x, y]) => [pc[0] + (x - pc[0]) * 0.93, pc[1] + (y - pc[1]) * 0.88]), { w: 7, color: SKIN, seed: 24, wob: 0.3 });
    sk.ink(face, { w: 8, seed: 25, wob: 0.4 });
  });
  spot(pc[0] - 62, pc[1] - 2, 28, 12, NAVY, 27);
  // 통감자
  thin(sk, 0.8, () => {
    blob(sk, curve([[548, TY - 2], [540, TY - 34], [566, TY - 58], [606, TY - 54], [624, TY - 26], [616, TY - 2]], true, 3), SKIN, 61, 8, { tex: 0.8 });
    for (const [x, y] of [[566, TY - 32], [596, TY - 40], [588, TY - 16]]) sk.dot(x, y, 3.4, "#7E5A30");
  });
  // 오이 조각(녹말이 없다): 초록 껍질 테, 씨. 방울 자리는 갈색 그대로
  const cc = [730, 538], RIND = "#2F7D46";
  thin(sk, 0.8, () => {
    blob(sk, [...ell(cc[0], cc[1] + 22, 92, 38, 0, Math.PI), [cc[0] - 92, cc[1]], [cc[0] + 92, cc[1]]], RIND, 31, 0);
    sk.ink([[cc[0] + 92, cc[1]], ...ell(cc[0], cc[1] + 22, 92, 38, 0, Math.PI), [cc[0] - 92, cc[1]]], { w: 8, seed: 32, wob: 0.4 });
    blob(sk, ell(cc[0], cc[1], 92, 38), RIND, 33, 8);
  });
  blob(sk, ell(cc[0], cc[1], 78, 30), "#CFEBB4", 35, 0);
  blob(sk, ell(cc[0], cc[1], 52, 19), "#E9F6D6", 36, 0);
  for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9 + 0.3; sk.at(cc[0] + 50 * Math.cos(a), cc[1] + 18 * Math.sin(a), 1, () => { blob(sk, ell(0, 0, 9, 4.5), "#FBFCEC", 37 + i, 0); sk.ink(ell(0, 0, 9, 4.5), { w: 2.5, color: "#7FB86A", seed: 47 + i, wob: 0.1 }); }, a); }
  spot(cc[0] - 4, cc[1] - 2, 26, 11, IODINE, 57);
  thin(sk, 0.8, () => {
    blob(sk, [[862, TY - 2], [862, TY - 50], ...ell(908, TY - 26, 34, 24, -Math.PI / 2, Math.PI / 2), [862, TY - 2]], "#3E8E4A", 65, 8);
    blob(sk, ell(862, TY - 26, 10, 24), "#DDF2C6", 67, 6);
  });
  // 학생: 스포이트로 갈색 용액을 떨어뜨린다(챙이 감자 쪽)
  const kx = 172, ks = 0.66;
  const PK = pose({ elR: [120, -300], haR: [240, -334], elL: [-52, -262], haL: [-80, -196], tilt: 0.06 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  const hand = [kx + ks * 240, GY - ks * 334], d = [-0.26, 0.966];
  const P = t => [hand[0] + d[0] * t, hand[1] + d[1] * t], tip = P(50);
  // 고무 꼭지 + 투명한 유리관(아래쪽에 갈색 용액) + 가는 끝
  sk.at(P(-44)[0], P(-44)[1], 1, () => blob(sk, ell(0, 0, 14, 25), "#E0503A", 75, 6), 0.26);
  sk.ink(dense([P(-24), P(34)]), { w: 21, seed: 71, wob: 0.2, cap: "butt" }); sk.ink(dense([P(-24), P(34)]), { w: 12, color: "#EAF4FA", seed: 71, wob: 0.2, cap: "butt" });
  sk.ink(dense([P(10), P(34)]), { w: 12, color: IODINE, seed: 73, wob: 0.2, cap: "butt" });
  sk.ink(dense([P(34), tip]), { w: 9, seed: 72, wob: 0.1 }); sk.ink(dense([P(34), tip]), { w: 3.5, color: IODINE, seed: 72, wob: 0.1 });
  handDot(sk, hand, C.skin, 77, 15 * ks);
  drop(sk, tip[0] - 2, tip[1] + 17, 0.6, { color: "#D79A4A", line: "#8A5A1E" });
  return sk;
}

/* ---------- g2u5l3: 밖은 눈, 온실 안은 빛과 온도와 이산화 탄소를 알맞게 맞춰 딸기가 익는다 ---------- */
function cutL3() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 676;
  // 겨울 바깥과 온실
  sk.fill(box(0, 0, W, H), "#E3EBF3", { dx: 0, dy: 0, wob: 0, seed: 5 });
  const arch = curve([[92, GY], [104, 330], [250, 118], [480, 52], [710, 118], [856, 330], [868, GY]]);
  sk.fill([...arch, arch[0]], "#EDF8FC", { dx: 0, dy: 0, wob: 0.3, seed: 7 });
  // 유리 온실의 창살
  for (const [x, y0, i] of [[250, 118, 0], [480, 52, 1], [710, 118, 2]]) sk.ink(dense([[x, y0], [x, GY]]), { w: 4, color: "#A9C6D8", seed: 3 + i, wob: 0.3 });
  sk.ink(dense([[104, 330], [856, 330]]), { w: 4, color: "#A9C6D8", seed: 6, wob: 0.3 });
  sk.ink(dense([[98, 510], [862, 510]]), { w: 4, color: "#A9C6D8", seed: 8, wob: 0.3 });
  thin(sk, 0.8, () => { sk.ink(arch, { w: 10, seed: 9, wob: 0.8 }); for (const [a, b, i] of [[[250, 118], [250, 150], 0], [[710, 118], [710, 150], 1], [[480, 52], [480, 84], 2]]) sk.ink(dense([a, b]), { w: 6, seed: 10 + i, wob: 0.2 }); });
  ground(sk, GY, 11, 92, 868);
  // 눈
  for (const [x, y, r] of [[40, 70, 11], [130, 40, 9], [60, 200, 10], [28, 340, 9], [66, 470, 11], [320, 30, 9], [640, 28, 10], [820, 60, 11], [912, 150, 10], [884, 250, 9], [924, 380, 11], [900, 520, 9], [180, 120, 8], [770, 130, 8], [36, 580, 9], [926, 610, 9]]) for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3 + (x % 7) * 0.1; sk.ink(dense([[x - (r + 4) * Math.cos(a), y - (r + 4) * Math.sin(a)], [x + (r + 4) * Math.cos(a), y + (r + 4) * Math.sin(a)]]), { w: 4, color: "#7F9CBC", seed: x + k, wob: 0 }); }
  for (const [x0, x1, i] of [[0, 92, 0], [868, 960, 1]]) { const m = curve([[x0, GY + 30], [x0, GY - 20], [(x0 + x1) / 2, GY - 44], [x1, GY - 14], [x1, GY + 30]], true, 4); sk.fill(m, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 15 + i }); sk.ink(curve([[x0, GY - 20], [(x0 + x1) / 2, GY - 44], [x1, GY - 14]]), { w: 6, color: "#8FA6C0", seed: 17 + i, wob: 0.4 }); }
  // 조절판: 손잡이 셋(빛, 온도, 이산화 탄소)
  thin(sk, 0.8, () => {
    sk.ink(dense([[480, 356], [480, GY]]), { w: 13, seed: 21 });
    blob(sk, rrect(306, 150, 348, 208, 18), "#E9EEF3", 23, 10);
  });
  const KX = [372, 480, 588], KY = 304, IY = 204;
  KX.forEach((x, i) => {
    const k = circ(x, KY, 32, { over: 0.05, seed: 31 + i });
    sk.fill(k, C.white, { dx: 0, dy: 0, wob: 0.2, seed: 34 + i }); sk.ink(k, { w: 6.5, seed: 37 + i, wob: 0.3 });
    const a = -Math.PI / 2 + [0.5, 0.2, 0.7][i];
    sk.ink(dense([[x, KY], [x + 24 * Math.cos(a), KY + 24 * Math.sin(a)]]), { w: 7, color: C.teal, seed: 40 + i, wob: 0 }); sk.dot(x, KY, 5);
  });
  // 해 기호
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2; sk.ink(dense([[KX[0] + 25 * Math.cos(a), IY + 25 * Math.sin(a)], [KX[0] + 36 * Math.cos(a), IY + 36 * Math.sin(a)]]), { w: 5, color: C.orange, seed: 51 + i, wob: 0.1 }); }
  blob(sk, circ(KX[0], IY, 18, { over: 0, seed: 59 }), C.yellow, 59, 5);
  // 온도계 기호
  blob(sk, rrect(KX[1] - 9, IY - 38, 18, 54, 9), C.white, 61, 5);
  sk.ink(dense([[KX[1], IY - 14], [KX[1], IY + 14]]), { w: 7, color: C.red, seed: 63, wob: 0 });
  blob(sk, circ(KX[1], IY + 22, 15, { over: 0, seed: 65 }), C.red, 65, 5);
  // 공기 방울 기호(이산화 탄소)
  for (const [dx, dy, r, i] of [[-16, 10, 15, 0], [14, -6, 12, 1], [-4, -26, 9, 2], [24, 22, 8, 3]]) { const c = circ(KX[2] + dx, IY + dy, r, { over: 0, seed: 71 + i }); sk.fill(c, "#D9DDE2", { dx: 0, dy: 0, wob: 0.2, seed: 75 + i }); sk.ink(c, { w: 4.5, color: CO2, seed: 79 + i, wob: 0.2 }); }
  // 딸기 두둑
  thin(sk, 0.8, () => blob(sk, rrect(338, 598, 284, 78, 10), C.wood, 85, 9, { tex: 0.8, texAng: 0.02 }));
  for (const [x, i] of [[390, 0], [480, 1], [570, 2]]) {
    for (const [a, j] of [[-2.5, 0], [-1.57, 1], [-0.64, 2]]) leaf(sk, x, 600, 52, a, 91 + i * 9 + j * 3, { w: 5 });
    strawberry(sk, x - 24, 628, 0.78, 121 + i * 8, 0.1); strawberry(sk, x + 26, 640, 0.7, 125 + i * 8, -0.15);
  }
  // 학생: 잘 익은 딸기 바구니를 들고 있다
  const kx = 212, ks = 0.6, by = GY - ks * 262;
  const PK = pose({ elL: [-100, -296], haL: [-122, -238], elR: [100, -296], haR: [122, -238], tilt: 0.05 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: false });
  for (const [dx, dy, r, i] of [[-44, -6, -0.3, 0], [-14, -16, 0.1, 1], [18, -14, -0.1, 2], [46, -4, 0.3, 3], [0, -34, 0, 4]]) strawberry(sk, kx + dx, by + dy, 0.8, 141 + i * 6, r);
  thin(sk, 0.8, () => {
    const b = poly([[kx - 84, by], [kx + 84, by], [kx + 62, by + 76], [kx - 62, by + 76]], 4);
    blob(sk, b, "#D9A85F", 171, 8, { tex: 0.8, texAng: 0.6 });
    for (const dy of [26, 50]) sk.ink(dense([[kx - 74, by + dy], [kx + 74, by + dy]]), { w: 4, color: "#9A6B33", seed: 173 + dy, wob: 0.3 });
  });
  handDot(sk, [kx - ks * 122, GY - ks * 238], C.skin, 181, 15 * ks); handDot(sk, [kx + ks * 122, GY - ks * 238], C.skin, 183, 15 * ks);
  // 쌤: 조절판을 가리킨다
  const tx = 738, ts = 0.6;
  const PT = pose({ elL: [-76, -420], haL: [-146, -534], elR: [52, -262], haR: [82, -198], tilt: -0.05 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- g2u5l4: 달리고 온 학생도, 화단의 식물도(잎과 뿌리 모두) 양분에서 에너지를 얻는다 ---------- */
function cutL4() {
  const sk = new Sk(W, H, { id: "e" });
  const GY = 676, BX0 = 508, BX1 = 932, BT = 446, px = 712;
  ground(sk, GY, 11);
  // 화단(앞면을 잘라 흙 속 뿌리가 보인다)
  const bed = box(BX0, BT, BX1, GY - 2);
  sk.fill(bed, "#CFAE80", { dx: 0, dy: 0, wob: 0.3, seed: 13, tex: 0.9, texAng: 0.1 });
  thin(sk, 0.8, () => sk.ink(bed, { w: 10, seed: 14 }));
  for (const [x, y] of [[548, 500], [600, 620], [560, 580], [880, 480], [846, 640], [900, 560], [640, 500], [800, 520]]) sk.dot(x, y, 4, "#9A7A4E");
  // 뿌리
  for (const [dx, dy, i] of [[-128, 120, 0], [-70, 176, 1], [-8, 200, 2], [58, 178, 3], [120, 128, 4]]) {
    const r = curve([[px, BT - 2], [px + dx * 0.45, BT + dy * 0.42], [px + dx, BT + dy]]);
    sk.ink(r, { w: 16, seed: 21 + i, wob: 0.8 }); sk.ink(r, { w: 8.5, color: "#FFF6E0", seed: 21 + i, wob: 0.8 });
    const m = r[Math.floor(r.length * 0.55)], b = curve([m, [m[0] + (i % 2 ? 26 : -26), m[1] + 22], [m[0] + (i % 2 ? 40 : -40), m[1] + 52]]);
    sk.ink(b, { w: 11, seed: 31 + i, wob: 0.5 }); sk.ink(b, { w: 5, color: "#FFF6E0", seed: 31 + i, wob: 0.5 });
  }
  plant(sk, px, BT, 310, 41, { len: 138, sw: 13 });
  for (const [x, i] of [[540, 0], [590, 1], [846, 2], [896, 3]]) for (const a of [-1.9, -1.57, -1.2]) sk.ink(dense([[x, BT], [x + 22 * Math.cos(a), BT + 22 * Math.sin(a)]]), { w: 5, color: STEM, seed: 51 + i, wob: 0.2 });
  // 에너지 기호: 잎 둘레와 뿌리 둘레
  bolt(sk, 866, 206, 1.15, 61, 0.1); bolt(sk, 858, 592, 1.15, 65, 0.1);
  // 학생: 주먹밥을 먹는다(챙 아래 얼굴 앞)
  const kx = 226, ks = 0.68;
  const PK = pose({ elR: [116, -268], haR: [136, -336], elL: [-88, -272], haL: [-34, -214], tilt: 0.06 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  const hand = [kx + ks * 136, GY - ks * 336], rb = [hand[0] - 4, hand[1] - 30];
  blob(sk, curve([[rb[0], rb[1] - 38], [rb[0] + 38, rb[1] + 24], [rb[0] - 38, rb[1] + 24]], true, 3), C.white, 71, 6.5);
  blob(sk, poly([[rb[0] - 17, rb[1] + 4], [rb[0] + 17, rb[1] + 4], [rb[0] + 17, rb[1] + 27], [rb[0] - 17, rb[1] + 27]], 3), "#2F3A33", 73, 0);
  handDot(sk, hand, C.skin, 75, 15 * ks);
  bolt(sk, kx + 78, 566, 1.15, 85, 0.1);
  return sk;
}

/* ---------- g2u5l5: 같은 화분의 낮과 밤. 산소 방울이 낮에는 잎 밖으로, 밤에는 잎 안으로 ---------- */
function cutL5() {
  const sk = new Sk(W, H, { id: "f" });
  const TY = 612;
  const half = (ox, night, sd) => {
    windowFrame(sk, ox + 44, 34, ox + 436, 246, night ? NIGHT : SKY, sd, () => {
      if (night) { moon(sk, ox + 330, 136, 44); for (const [x, y, r, i] of [[110, 96, 17, 0], [176, 178, 13, 1], [230, 84, 12, 2]]) sparkle(sk, ox + x, y, r, { seed: sd + 5 + i, w: 3.5, color: "#FFE08A" }); }
      else sun(sk, ox + 334, 134, 36);
    });
    table(sk, ox + 30, ox + 450, TY, 706, sd + 10);
    const px = ox + 156, sy = pot(sk, px, TY, 156, 96, sd + 20);
    const lv = plant(sk, px, sy, 176, sd + 30, { len: 124, sw: 10 });
    // 산소 방울과 방향 화살표
    const a = [lv[0].tip[0] + 24, lv[0].tip[1] + 14], b = [ox + 440, a[1] - 62];
    for (let i = 0; i < 3; i++) { const t = 0.14 + i * 0.36; o2(sk, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 40, 21, sd + 50 + i * 5); }
    const p0 = [a[0] + 6, a[1] + 34], p1 = [b[0] - 10, b[1] + 34];
    arrow(sk, night ? [p1, p0] : [p0, p1], { w: 11, color: O2L, straight: true, seed: sd + 70, head: 30, wob: 0.2 });
  };
  half(0, false, 11); half(480, true, 111);
  sk.ink(dense([[480, 16], [480, 704]]), { w: 5, color: C.gray, dash: [12, 11], seed: 201, wob: 0 });
  return sk;
}

/* ---------- g2u5l6: 각설탕은 물에 녹아 맑고, 밀가루 덩이는 녹지 않고 바닥에 가라앉아 있다 ---------- */
function tumbler(sk, x, y, w, h, sd, inner, col = WATER) {
  const wt = w / 2, wb = w * 0.4, lvl = y - h * 0.8, wl = wb + (wt - wb) * 0.8;
  sk.fill(poly([[x - wl + 3, lvl], [x + wl - 3, lvl], [x + wb - 4, y - 5], [x - wb + 4, y - 5]], 4), col, { dx: 0, dy: 0, wob: 0.3, seed: sd });
  if (inner) inner(lvl);
  sk.ink(curve([[x - wl + 4, lvl], [x - wl / 2, lvl - 4], [x, lvl], [x + wl / 2, lvl + 4], [x + wl - 4, lvl]]), { w: 5, color: WATERD, seed: sd + 1, wob: 0.3 });
  thin(sk, 0.8, () => sk.ink(dense([[x - wt, y - h], [x - wb, y], [x + wb, y], [x + wt, y - h]], 4), { w: 10, seed: sd + 2, wob: 0.6 }));
}
function cube(sk, x, y, s, sd) { // 각설탕: (x, y) = 앞면 왼쪽 아래
  blob(sk, poly([[x, y - s], [x + s * 0.34, y - s * 1.3], [x + s * 1.34, y - s * 1.3], [x + s * 1.34, y - s * 0.3], [x + s, y], [x, y]], 3), C.white, sd, 5.5);
  sk.ink(dense([[x, y - s], [x + s, y - s], [x + s, y]]), { w: 4.5, seed: sd + 2, wob: 0.2 }); sk.ink(dense([[x + s, y - s], [x + s * 1.34, y - s * 1.3]]), { w: 4.5, seed: sd + 3, wob: 0.2 });
}
function cutL6() {
  const sk = new Sk(W, H, { id: "g" });
  const GY = 676, TY = 600, FX = 150, SX = 640, GW = 190, GH = 214;
  ground(sk, GY, 11);
  const spoon = (a, b, sd) => { pipe(sk, dense([a, b]), 6, "#C9D2DE", sd, 0.2); };
  // 학생(책상 뒤): 각설탕 컵을 숟가락으로 젓는다(챙이 컵 쪽)
  const kx = 396, ks = 0.7, hand = [kx + ks * 204, GY - ks * 414];
  const PK = pose({ elR: [112, -344], haR: [204, -414], elL: [-60, -280], haL: [-84, -226], tilt: 0.06 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  table(sk, 30, 846, TY, GY, 13);
  // 밀가루 컵: 저었는데도 물이 뿌옇고 바닥에 가라앉은 것이 있다
  tumbler(sk, FX, TY, GW, GH, 21, () => {
    for (const [dx, dy, r] of [[-40, -120, 5], [22, -134, 4.5], [-12, -96, 4], [44, -92, 5], [-52, -78, 4], [10, -150, 4], [-28, -146, 4.5], [34, -112, 4]]) sk.dot(FX + dx, TY + dy, r, "#FBF8EE");
    blob(sk, curve([[FX - 64, TY - 8], [FX - 62, TY - 40], [FX - 32, TY - 60], [FX + 2, TY - 46], [FX + 30, TY - 64], [FX + 62, TY - 40], [FX + 66, TY - 8]], true, 3), "#FBF6E6", 23, 7);
    for (const [dx, dy] of [[-28, -26], [12, -24], [36, -36], [-8, -42]]) sk.dot(FX + dx, TY + dy, 3.6, "#C9B88F");
  }, "#E3DCC8");
  spoon([FX + 92, TY - GH - 26], [FX + 20, TY - 70], 27);
  // 밀가루 자루
  thin(sk, 0.8, () => {
    blob(sk, curve([[264, TY - 2], [258, TY - 60], [272, TY - 92], [316, TY - 92], [330, TY - 60], [324, TY - 2]], true, 3), "#E6D2A8", 31, 8, { tex: 0.8 });
    blob(sk, [...ell(294, TY - 92, 24, 9)], "#FBF6E8", 33, 5);
    const ear = [294, TY - 30];
    sk.ink(dense([[ear[0], ear[1] + 20], [ear[0], ear[1] - 26]]), { w: 4, color: "#A9773F", seed: 35, wob: 0.1 });
    for (let i = 0; i < 3; i++) for (const sg of [-1, 1]) sk.ink(dense([[ear[0], ear[1] - 2 - i * 9], [ear[0] + sg * 11, ear[1] - 12 - i * 9]]), { w: 4.5, color: "#A9773F", seed: 37 + i * 2 + sg, wob: 0.1 });
  });
  // 설탕 컵: 다 녹아 물이 맑다(녹아 사라진 각설탕 자리는 점선)
  tumbler(sk, SX, TY, GW, GH, 41, lvl => {
    sk.ink(poly([[SX - 50, TY - 66], [SX - 14, TY - 66], [SX - 14, TY - 30], [SX - 50, TY - 30]], 3), { w: 5, color: "#7FA9C8", dash: [8, 7], seed: 43, wob: 0.1 });
    for (const [y, i] of [[lvl + 40, 0], [lvl + 84, 1]]) sk.ink(ell(SX + 10, y, 46, 10, 0.3, Math.PI * 1.25), { w: 5, color: WATERD, seed: 45 + i, wob: 0.2 });
  });
  spoon(hand, [SX + 30, TY - 46], 51);
  handDot(sk, hand, C.skin, 53, 15 * ks);
  // 접시 위의 각설탕
  thin(sk, 0.8, () => blob(sk, ell(796, TY - 4, 40, 8), C.white, 55, 6));
  cube(sk, 768, TY - 6, 26, 61); cube(sk, 795, TY - 6, 26, 65); cube(sk, 782, TY - 32, 26, 69);
  // 쌤: 빨대로 맑은 컵을 가리킨다
  const tx = 898, ts = 0.58, th = [tx - ts * 138, GY - ts * 300];
  const PT = pose({ elL: [-84, -268], haL: [-138, -300], elR: [48, -262], haR: [70, -198], tilt: -0.06 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher", hands: "R" });
  const st = dense([[th[0] + 14, th[1] + 8], [SX + GW / 2 + 12, TY - GH + 62]]);
  pipe(sk, st, 7, "#F28BA0", 71, 0.2);
  sk.ink(st, { w: 7, color: C.white, dash: [9, 13], seed: 73, wob: 0.2, cap: "butt" });
  handDot(sk, th, C.skin, 75, 15 * ts);
  return sk;
}

/* ---------- g2u5l6b: 밭의 식물이 저장한 양분(고구마, 감자, 포도, 콩, 깨)을 먹고 힘이 난다 ---------- */
function cutL6b() {
  const sk = new Sk(W, H, { id: "h" });
  const GY = 676, TY = 566;
  ground(sk, GY, 11);
  // 창밖의 밭
  windowFrame(sk, 408, 40, 904, 322, SKY, 13, () => {
    sk.fill(box(408, 236, 904, 322), "#E4CFA6", { dx: 0, dy: 0, wob: 0.3, seed: 15 });
    sk.ink(curve([[408, 238], [560, 232], [760, 240], [904, 234]]), { w: 5, color: "#A9773F", seed: 16, wob: 0.4 });
    sun(sk, 838, 96, 26);
    for (const [x, i] of [[470, 0], [576, 1], [742, 2], [838, 3]]) plant(sk, x, 262 + (i % 2) * 20, 92, 21 + i * 70, { len: 50, sw: 5, lw: 4.5, pairs: 2 });
  });
  table(sk, 268, 944, TY, GY, 91);
  // 접시 다섯
  const PX = [342, 468, 594, 720, 846], py = TY - 4;
  thin(sk, 0.8, () => PX.forEach((x, i) => blob(sk, ell(x, py, 58, 11), C.white, 101 + i * 3, 6)));
  thin(sk, 0.85, () => {
    // 고구마
    blob(sk, curve([[PX[0] - 54, py - 22], [PX[0] - 22, py - 46], [PX[0] + 22, py - 46], [PX[0] + 46, py - 34], [PX[0] + 42, py - 12], [PX[0] + 20, py - 6], [PX[0] - 24, py - 6]], true, 3), "#B5527A", 121, 7, { tex: 0.8 });
    sk.at(PX[0] + 44, py - 23, 1, () => blob(sk, ell(0, 0, 9, 14), "#F2C04A", 127, 5), 0.25);
    for (const [dx, dy] of [[-18, -28], [10, -24], [28, -30]]) sk.ink(dense([[PX[0] + dx - 5, py + dy], [PX[0] + dx + 5, py + dy]]), { w: 3, color: "#7E3355", seed: 123 + dx, wob: 0.1 });
    // 감자
    blob(sk, curve([[PX[1] - 44, py - 10], [PX[1] - 46, py - 40], [PX[1] - 14, py - 60], [PX[1] + 28, py - 56], [PX[1] + 46, py - 30], [PX[1] + 38, py - 8]], true, 3), "#D2A965", 131, 7, { tex: 0.8 });
    for (const [dx, dy] of [[-20, -34], [8, -44], [22, -22], [-6, -18]]) sk.dot(PX[1] + dx, py + dy, 3.2, "#8A6A3E");
    // 포도
    sk.ink(curve([[PX[2], py - 62], [PX[2] + 6, py - 78], [PX[2] + 20, py - 84]]), { w: 5, color: "#6B4A32", seed: 141, wob: 0.2 });
    for (const [dx, dy, i] of [[-28, -50, 0], [0, -54, 1], [28, -50, 2], [-14, -32, 3], [14, -32, 4], [0, -14, 5]]) blob(sk, circ(PX[2] + dx, py + dy, 15, { over: 0, seed: 143 + i }), "#7A4FB0", 143 + i * 2, 4.5);
    // 콩
    for (const [dx, dy, r, i] of [[-30, -12, 0.2, 0], [0, -12, -0.2, 1], [30, -12, 0.3, 2], [-15, -30, -0.1, 3], [15, -30, 0.2, 4], [0, -47, 0, 5]]) sk.at(PX[3] + dx * 1.25, py + dy * 1.3 + 2, 1, () => blob(sk, ell(0, 0, 19, 14), "#EBD58C", 161 + i * 2, 5), r);
    // 깨
    blob(sk, [...ell(PX[4], py - 6, 56, 56, Math.PI, Math.PI * 2), [PX[4] - 56, py - 6]], "#F0E2B6", 181, 6);
    for (let i = 0; i < 14; i++) { const a = Math.PI + (i + 0.5) * Math.PI / 14, rr = 14 + (i * 37 % 30); sk.at(PX[4] + rr * Math.cos(a) * 1.05, py - 10 + rr * Math.sin(a) * 0.95, 1, () => blob(sk, ell(0, 0, 5.5, 3.2), "#B8964E", 183 + i, 0), i * 0.7); }
  });
  // 학생: 포크에 꽂은 고구마 조각을 먹으며(챙 아래 얼굴 앞) 다른 팔에 힘이 난다
  const kx = 176, ks = 0.66;
  const PK = pose({ elL: [-118, -338], haL: [-150, -452], elR: [112, -262], haR: [136, -318], tilt: 0.04 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  const fh = [kx + ks * 136, GY - ks * 318], ft = [fh[0] - 8, fh[1] - 40];
  pipe(sk, dense([[fh[0] + 4, fh[1] + 22], ft]), 4, "#C9D2DE", 191, 0.2);
  // 고구마 조각: 노란 속, 위아래에 자주색 껍질
  sk.at(ft[0] - 2, ft[1] - 14, 1, () => {
    const c = poly([[-24, -15], [22, -17], [26, 13], [-22, 16]], 3);
    sk.fill(c, "#F2C04A", { dx: 0, dy: 0, wob: 0.3, seed: 193 });
    sk.ink(dense([[-22, -11], [20, -13]]), { w: 9, color: "#B5527A", seed: 194, wob: 0.2, cap: "butt" }); sk.ink(dense([[-20, 12], [24, 9]]), { w: 9, color: "#B5527A", seed: 195, wob: 0.2, cap: "butt" });
    sk.ink(c, { w: 5.5, seed: 196, wob: 0.3 });
  }, -0.12);
  handDot(sk, fh, C.skin, 197, 15 * ks);
  bolt(sk, kx - ks * 150 - 6, GY - ks * 452 - 66, 1.2, 199, 0.12);
  return sk;
}

export function cuts() {
  return [
    { name: "g2u5l1", theme: "plant", orig: null, sk: cutL1(), alt: "점심시간에 학생은 도시락을 먹고, 창가의 화분은 햇빛을 받으며 서 있고, 스틱맨 쌤이 화분의 잎을 가리키는 장면", cap: "친구는 도시락을 먹고, 화분은 햇빛을 받아 잎에서 양분을 스스로 만들어요" },
    { name: "g2u5l1b", theme: "plant", orig: null, sk: cutL1b(), alt: "학생이 물뿌리개로 화분의 흙에 물을 주고 쌤은 잎 뒷면을 돋보기로 들여다보며, 흙에서 줄기를 따라 올라가는 파란 화살표와 공기에서 잎으로 들어가는 회색 화살표가 그려진 장면", cap: "물은 흙에서 줄기로 올라오고, 이산화 탄소는 잎의 작은 구멍인 기공으로 들어와요" },
    { name: "g2u5l2", theme: "plant", orig: null, sk: cutL2(), alt: "학생이 반으로 자른 감자의 단면에 스포이트로 갈색 용액을 한 방울 떨어뜨리자 그 자리만 짙은 남색으로 변하고, 옆의 오이 조각에 떨어뜨린 방울은 갈색 그대로인 장면", cap: "갈색 용액을 떨어뜨리자 감자는 그 자리만 청람색이 되고, 오이는 갈색 그대로예요" },
    { name: "g2u5l3", theme: "plant", orig: null, sk: cutL3(), alt: "눈이 내리는 날 딸기 온실 안에서 쌤이 해, 온도계, 공기 방울 기호가 붙은 조절판의 손잡이 세 개를 가리키고 학생이 잘 익은 딸기 바구니를 든 장면", cap: "밖은 눈이 와도 온실 안은 빛, 온도, 이산화 탄소를 알맞게 맞춰 딸기가 익어요" },
    { name: "g2u5l4", theme: "plant", orig: null, sk: cutL4(), alt: "학생이 주먹밥을 먹고 있고, 옆 화단의 식물 잎 둘레와 흙 속 뿌리 둘레, 학생 곁에 번개 기호가 하나씩 떠 있는 장면", cap: "주먹밥을 먹은 친구도, 식물의 잎과 뿌리도 양분에서 에너지를 얻어요" },
    { name: "g2u5l5", theme: "plant", orig: null, sk: cutL5(), alt: "왼쪽은 해가 뜬 창가, 오른쪽은 달이 뜬 창가의 같은 화분으로, 낮에는 하늘색 방울이 잎 밖으로 나가고 밤에는 잎 안으로 들어가는 화살표가 그려진 장면", cap: "산소는 낮에는 잎 밖으로 나가고, 밤에는 잎 안으로 들어와요" },
    { name: "g2u5l6", theme: "plant", orig: null, sk: cutL6(), alt: "숟가락으로 저은 두 물컵 가운데 각설탕을 넣은 컵은 물이 맑고 밀가루를 넣은 컵은 뿌옇고 바닥에 덩이가 가라앉아 있으며, 쌤이 맑은 컵을 빨대로 가리키는 장면", cap: "똑같이 저어도 각설탕은 녹아 물이 맑고, 밀가루는 녹지 않아 뿌옇게 가라앉아요" },
    { name: "g2u5l6b", theme: "plant", orig: null, sk: cutL6b(), alt: "식탁 위 접시에 고구마, 감자, 포도, 콩, 깨가 놓여 있고 학생이 그것을 먹으며 팔에 힘이 나는 모습이며, 창밖으로 밭의 식물이 보이는 장면", cap: "고구마, 감자, 포도, 콩, 깨에는 식물이 저장한 양분이 있어 먹으면 힘이 나요" },
  ];
}
