// 중1 과학 u4l3 도입 만화: 어느 물방울의 하루(융해, 기화, 액화, 응고, 승화, 상태 변화). 7컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u4l3.md.
//   실제 하루 안에 일어나는 일만 쓰고, 같은 그릇의 물을 따라간다.
//   1 아침 고드름 → 2 한낮, 그릇에 받은 물(융해) → 3 오후, 줄어든 물(기화) → 4 저녁, 뿌예진 안경(액화)
//   → 5 밤, 언 그릇(응고) → 6 새벽, 창의 서리(승화) → 7 두 물에 똑같이 붉어지는 종이(상태 변화)
// 끓는 주전자와 김은 그리지 않는다(김은 수증기가 아니라 작은 물방울이라 바로 뒤 랩과 어긋난다).
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, check, sparkle, drop, squiggle, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER } from "../lib/figure.mjs";
import { sun, moon, desk } from "../lib/props.mjs";

const W = 960, H = 720;
const ICE = "#BFE2F4", WATER = "#8CC8EC", PALE = "#E6F2F9";
// 겨울이라 쌤은 가운 위에 목도리를 둘렀다
const scarf = sk => () => { const s = curve([[-44, -352], [-10, -334], [34, -336], [48, -352], [40, -326], [0, -314], [-38, -326]], true, 3); sk.fill(s, C.red, { dx: 1, dy: 1.2, wob: 0.6, seed: 5 }); sk.ink(s, { w: 8, seed: 6, wob: 0.7 }); const t = poly([[14, -326], [38, -326], [44, -262], [20, -262]], 3); sk.fill(t, C.red, { dx: 1, dy: 1.2, wob: 0.6, seed: 7 }); sk.ink(t, { w: 8, seed: 8, wob: 0.7 }); };
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

// 처마: 지붕 끝 선 + 고드름. hero 번째 고드름만 하늘색(오늘의 주인공)
function eave(sk, x0, y, list, hero, sd = 11) {
  const roof = poly([[x0, y - 64], [972, y - 100], [972, y], [x0 - 30, y]], 5);
  sk.fill(roof, "#8A6A5A", { seed: sd, tex: true, texAng: 0.05 });
  list.forEach(([x, len, w, drip], i) => {
    const ic = curve([[x - w, y], [x - w * 0.55, y + len * 0.5], [x, y + len], [x + w * 0.55, y + len * 0.5], [x + w, y]], false, 4);
    sk.fill([...ic, ic[0]], i === hero ? ICE : PALE, { dx: 0, dy: 0, wob: 0.5, seed: sd + 2 + i });
    sk.ink(ic, { w: 8, seed: sd + 8 + i, wob: 0.6 });
    sk.ink(dense([[x - w * 0.3, y + 14], [x - w * 0.12, y + len * 0.45]]), { w: 4, color: C.white, seed: sd + 14 + i, wob: 0.2 });
  });
  sk.ink(roof, { w: 11, seed: sd + 1 });
}
// 옆에서 본 그릇. (x, y) = 바닥 가운데. level = 물 높이, ice = true 면 얼음
function bowl(sk, x, y, w, h, o = {}) {
  const sd = o.seed ?? 31, bw = w / 2 - 34, hw = lv => bw + (w / 2 - bw) * (lv / h);
  const side = [[x - w / 2, y - h], [x - bw - 8, y - 12], [x - bw + 14, y], [x + bw - 14, y], [x + bw + 8, y - 12], [x + w / 2, y - h]];
  const shape = curve(side, false, 4);
  sk.fill([...shape, shape[0]], o.body ?? "#F4F1EA", { dx: 0, dy: 0, wob: 0.5, seed: sd });
  if (o.level) {
    const lv = o.level, top = y - lv;
    const wtr = [[x - hw(lv) + 5, top], ...curve([[x - hw(lv) + 5, top], [x - bw - 2, y - 12], [x - bw + 16, y - 5], [x + bw - 16, y - 5], [x + bw + 2, y - 12], [x + hw(lv) - 5, top]], false, 4)];
    wtr.push(wtr[0]);
    sk.fill(wtr, o.ice ? ICE : WATER, { dx: 0, dy: 0, wob: 0.4, seed: sd + 1, tex: o.ice ? 0 : 0.7 });
    if (o.ice) { sk.ink(dense([[x - hw(lv) + 8, top], [x + hw(lv) - 8, top]]), { w: 6, color: "#7FB6D6", seed: sd + 2, wob: 0.5 }); for (const [dx, i] of [[-40, 0], [10, 1], [52, 2]]) sk.ink(dense([[x + dx, top + 12], [x + dx + 16, top + 30]]), { w: 4, color: C.white, seed: sd + 3 + i, wob: 0.2 }); }
    else sk.ink(curve([[x - hw(lv) * 0.6, top + 9], [x - hw(lv) * 0.3, top + 3], [x, top + 9]]), { w: 4, color: C.white, seed: sd + 2, wob: 0.2 });
  }
  if (o.mark) sk.ink(dense([[x - hw(o.mark) + 6, y - o.mark], [x + hw(o.mark) - 6, y - o.mark]]), { w: 5, color: C.gray, dash: [12, 10], seed: sd + 6, wob: 0.3 });
  sk.ink(shape, { w: 10, seed: sd + 7 });
}
// 창문: 틀 + 유리 + 가로세로 살. (x, y) = 왼쪽 위
function windowFrame(sk, x, y, w, h, o = {}) {
  const sd = o.seed ?? 51;
  const glass = rrect(x, y, w, h, 14);
  sk.fill(glass, o.glass ?? "#DCEBF5", { dx: 0, dy: 0, wob: 0.5, seed: sd });
  if (o.inside) o.inside();
  sk.ink(dense([[x + w / 2, y], [x + w / 2, y + h]]), { w: 9, color: "#8A6A5A", seed: sd + 1, wob: 0.5 });
  sk.ink(dense([[x, y + h / 2], [x + w, y + h / 2]]), { w: 9, color: "#8A6A5A", seed: sd + 2, wob: 0.5 });
  sk.ink(glass, { w: 13, color: "#6B4A32", seed: sd + 3 });
  const sill = rrect(x - 22, y + h, w + 44, 22, 8);
  sk.fill(sill, "#B5814C", { seed: sd + 4, tex: true }); sk.ink(sill, { w: 9, seed: sd + 5 });
}
// 눈에 안 보이는 수증기: 위로 올라가는 점선 물결
const vapor = (sk, x, y, len, sd, o = {}) => sk.ink(squiggle(x, y, len, o.amp ?? 9, o.waves ?? 2, sd, o.lean ?? 0), { w: 5, color: o.color ?? "#7FA8C9", dash: [9, 11], seed: sd, wob: 0 });
// 서리의 깃털 무늬
function frost(sk, x, y, len, ang, sd, depth = 2) {
  const ex = x + len * Math.cos(ang), ey = y + len * Math.sin(ang);
  sk.ink(dense([[x, y], [ex, ey]]), { w: depth === 2 ? 6 : 4, color: C.white, seed: sd, wob: 0.6 });
  if (!depth) return;
  for (let i = 1; i <= 4; i++) {
    const u = i / 5, bx = x + (ex - x) * u, by = y + (ey - y) * u, bl = len * 0.36 * (1 - u * 0.5);
    frost(sk, bx, by, bl, ang + 0.9, sd + i * 3, depth - 1); frost(sk, bx, by, bl, ang - 0.9, sd + i * 3 + 1, depth - 1);
  }
}
// 물에 닿으면 붉어지는 푸른 종이 띠. (x, y) = 아래 끝, 위로 뻗는다
function strip(sk, x, y, len, rot, sd, wet = true) {
  sk.at(x, y, 1, () => {
    const p = poly([[-11, -len], [11, -len], [11, 0], [-11, 0]], 3);
    sk.fill(p, "#5B9BD5", { dx: 0, dy: 0, wob: 0.3, seed: sd });
    if (wet) { const t = poly([[-11, -40], [11, -40], [11, 0], [-11, 0]], 3); sk.fill(t, "#EE7C93", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 }); }
    sk.ink(p, { w: 6, seed: sd + 2, wob: 0.4 });
  }, rot);
}

/* ---------- 1. 아침: 처마 끝 고드름 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  ground(sk, 700, 61);
  eave(sk, 420, 132, [[520, 150, 20], [640, 236, 28], [760, 130, 18], [870, 180, 22]], 1);
  const P = pose({ elR: [96, -332], haR: [156, -420], elL: [-72, -272], haL: [-124, -240], tilt: -0.06 });
  const fx = 262, fy = 700, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher", under: scarf(sk), hands: "R" });
  bowl(sk, fx - fs * 124 - 44, fy - fs * 240 + 54, 136, 64, { seed: 63 });
  handDot(sk, [fx - fs * 124, fy - fs * 240 + 6], C.skin, 64, 11);
  sparkle(sk, 706, 250, 12, { seed: 65 });
  sparkle(sk, 590, 330, 9, { seed: 66 });
  return sk;
}

/* ---------- 2. 융해: 한낮의 똑, 똑 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  sun(sk, 96, 104, 50, { seed: 701 });
  ground(sk, 700, 71);
  eave(sk, 606, 132, [[660, 176, 27], [770, 96, 16], [876, 140, 20]], 0);
  // 떨어지는 물방울
  drop(sk, 660, 346, 1.25); drop(sk, 660, 410, 1.05); drop(sk, 660, 458, 0.9);
  const P = pose({ elR: [84, -292], haR: [150, -300], elL: [60, -246], haL: [176, -211], tilt: 0.06 });
  const fx = 424, fy = 700, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher", under: scarf(sk), hands: false });
  bowl(sk, 646, 548, 210, 86, { level: 34, seed: 73 });
  handDot(sk, [fx + fs * 150, fy - fs * 300], C.skin, 75, 11);
  handDot(sk, [fx + fs * 112 + 46, fy - fs * 272 + 44], C.skin, 76, 11);
  return sk;
}

/* ---------- 3. 기화: 조금씩 줄어든 물 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  // 볕 드는 창
  windowFrame(sk, 600, 70, 280, 250, { seed: 81, glass: "#FCEFC2", inside: () => { const s = circ(700, 150, 40, { over: 0.15, seed: 83 }); sk.fill(s, C.yellow, { dx: 0, dy: 0, wob: 0.5, seed: 84 }); sk.ink(s, { w: 7, color: C.orange, seed: 85, wob: 0.5 }); } });
  desk(sk, 410, 566, 500, { seed: 87 });
  // 물 자국(처음 높이)보다 낮아진 물
  bowl(sk, 660, 566, 300, 124, { level: 44, mark: 86, seed: 91 });
  vapor(sk, 600, 500, 150, 1); vapor(sk, 660, 496, 180, 2.4); vapor(sk, 722, 500, 150, 4);
  const P = pose({ elR: [88, -296], haR: [158, -280], elL: [-50, -260], haL: [-24, -218], tilt: 0.1 });
  drawFigure(sk, 200, 704, 0.72, P, { ...TEACHER, name: "teacher", under: scarf(sk) });
  qmark(sk, 398, 300, 0.75, { color: C.teal, seed: 95 });
  return sk;
}

/* ---------- 4. 액화: 뿌예진 안경 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  ground(sk, 700, 101);
  // 열린 문 너머 추운 밤
  const out = poly([[60, 150], [282, 150], [282, 698], [60, 698]], 5);
  sk.fill(out, "#2C3A70", { dx: 0, dy: 0, wob: 0.4, seed: 103, tex: 0.5 });
  moon(sk, 200, 236, 30);
  for (const [x, y] of [[110, 330], [230, 400], [150, 470], [240, 540], [110, 600], [190, 660], [96, 220]]) sk.dot(x, y, 6, C.white);
  sk.ink(out, { w: 14, color: "#6B4A32", seed: 104 });
  const door = poly([[282, 150], [372, 196], [372, 706], [282, 698]], 5);
  sk.fill(door, "#C49A5E", { seed: 105, tex: true, texAng: 1.5 }); sk.ink(door, { w: 11, seed: 106 });
  sk.dot(350, 450, 9, C.gold);
  // 따뜻한 방의 난로
  const stove = rrect(770, 540, 130, 158, 18);
  sk.fill(stove, "#5A5F68", { seed: 107, tex: true }); sk.ink(stove, { w: 11, seed: 108 });
  const win = rrect(796, 590, 78, 60, 10);
  sk.fill(win, C.orange, { dx: 0, dy: 0, wob: 0.4, seed: 109 }); sk.ink(win, { w: 7, seed: 110 });
  for (const [x, i] of [[796, 0], [834, 1], [872, 2]]) sk.ink(squiggle(x, 520, 60, 6, 2, i), { w: 6, color: C.red, seed: 111 + i, wob: 0 });
  // 방 공기 속 수증기
  vapor(sk, 640, 420, 120, 1.2); vapor(sk, 700, 330, 110, 3); vapor(sk, 420, 300, 110, 2);
  // 쌤: 안경이 하얗게 흐려져 두 손을 더듬는다
  const P = pose({ elL: [-86, -300], haL: [-140, -326], elR: [86, -300], haR: [140, -326], tilt: 0.04 });
  const fx = 540, fy = 700, fs = 0.74;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher", under: scarf(sk) });
  const hx = fx, hy = fy - fs * 436;
  for (const [sg, i] of [[-1, 0], [1, 1]]) {
    const lx = hx + sg * 36 * fs + 0.04 * 8 * fs, ly = hy + 8 * fs;
    const fog = circ(lx, ly, 28 * fs, { over: 0, seed: 121 + i });
    sk.fill(fog, "#EAF1F6", { dx: 0, dy: 0, wob: 0.4, seed: 123 + i });
    for (const [dx, dy] of [[-7, -5], [6, 3], [-2, 9], [9, -9]]) sk.dot(lx + dx, ly + dy, 2.6, "#7FB6D6");
    sk.ink(circ(lx, ly, 30 * fs, { seed: 125 + i, lump: 0.03 }), { w: 8 * fs + 2, wob: 0.6, seed: 127 + i });
  }
  drop(sk, 648, 300, 1.1);
  return sk;
}

/* ---------- 5. 응고: 뒤집어도 안 쏟아져요 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  moon(sk, 130, 112, 42);
  for (const [x, y, r, i] of [[300, 80, 9, 0], [440, 150, 6, 1], [860, 90, 8, 2], [760, 200, 6, 3], [620, 70, 5, 4]]) sparkle(sk, x, y, r, { seed: 131 + i, w: 3 });
  ground(sk, 700, 137);
  const P = pose({ elR: [92, -318], haR: [150, -372], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  const fx = 330, fy = 700, fs = 0.74;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher", under: scarf(sk), hands: "L" });
  const hx = fx + fs * 150, hy = fy - fs * 372;
  // 거꾸로 든 그릇: 얼음이 그대로 붙어 있다
  sk.at(hx + 96, hy - 96, 1, () => bowl(sk, 0, 0, 240, 100, { level: 46, ice: true, seed: 141 }), 2.45);
  handDot(sk, [hx + 8, hy - 8], C.skin, 143, 12);
  sparkle(sk, hx + 290, hy - 150, 13, { seed: 145 });
  sparkle(sk, hx + 250, hy + 70, 10, { seed: 146 });
  emark(sk, hx + 330, hy - 30, 0.8, { color: C.red, rot: 0.15 });
  return sk;
}

/* ---------- 6. 승화: 새벽 창의 하얀 깃털 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  windowFrame(sk, 440, 86, 440, 450, { seed: 151, glass: "#A9C3DC", inside: () => {
    frost(sk, 452, 524, 250, -0.9, 153); frost(sk, 868, 524, 230, -2.25, 163); frost(sk, 452, 100, 200, 0.75, 173); frost(sk, 868, 100, 190, 2.4, 183);
    frost(sk, 660, 524, 150, -1.57, 193, 1);
  } });
  sparkle(sk, 920, 110, 12, { seed: 197 });
  const P = pose({ elR: [88, -310], haR: [158, -324], elL: [-50, -260], haL: [-24, -218], tilt: 0.08 });
  drawFigure(sk, 196, 704, 0.74, P, { ...TEACHER, name: "teacher", under: scarf(sk) });
  qmark(sk, 386, 250, 0.75, { color: C.teal, seed: 199 });
  return sk;
}

/* ---------- 7. 정리: 이름이 바뀌어도 같은 물 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  // 왼쪽: 서리가 녹아 물방울이 맺힌 창
  windowFrame(sk, 40, 250, 210, 260, { seed: 201, glass: "#DCEBF5", inside: () => { for (const [x, y, s] of [[90, 400, 1], [130, 452, 0.8], [196, 420, 0.9], [170, 330, 0.7], [84, 318, 0.7]]) drop(sk, x, y, s); } });
  // 오른쪽: 그릇의 얼음이 녹은 물
  desk(sk, 600, 566, 330, { seed: 205 });
  bowl(sk, 764, 566, 230, 96, { level: 40, seed: 207 });
  // 고체, 액체, 기체 세 모습과 그 사이를 오가는 화살표
  const ice = rrect(652, 96, 60, 60, 12);
  sk.fill(ice, ICE, { dx: 0, dy: 0, wob: 0.4, seed: 209 }); sk.ink(ice, { w: 7, seed: 210 });
  sk.ink(dense([[666, 110], [680, 132]]), { w: 4, color: C.white, seed: 211, wob: 0.2 });
  drop(sk, 904, 128, 2);
  vapor(sk, 772, 300, 70, 1.2, { amp: 7 }); vapor(sk, 798, 300, 70, 3, { amp: 7 }); vapor(sk, 824, 300, 70, 5, { amp: 7 });
  for (const [a, b, i] of [[[728, 122], [870, 122], 0], [[882, 170], [832, 226], 1], [[764, 226], [702, 170], 2]]) { arrow(sk, [a, b], { w: 5, color: C.gray, seed: 213 + i, straight: true, head: 13, wob: 0.3 }); arrow(sk, [b, a], { w: 5, color: C.gray, seed: 216 + i, straight: true, head: 13, wob: 0.3 }); }
  // 쌤: 두 손의 종이 띠 끝이 모두 붉게 바뀌었다
  const P = pose({ elL: [-96, -300], haL: [-166, -296], elR: [96, -300], haR: [166, -296], tilt: 0.03 });
  const fx = 428, fy = 704, fs = 0.74;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher", under: scarf(sk), hands: false });
  const lx = fx - fs * 166, ly = fy - fs * 296, rx = fx + fs * 166, ry = fy - fs * 296;
  strip(sk, 232, 440, 124, 1.25, 221); handDot(sk, [lx, ly], C.skin, 223, 12);
  strip(sk, 690, 528, 132, -1.0, 225); handDot(sk, [rx, ry], C.skin, 227, 12);
  check(sk, 300, 560, 0.8); check(sk, 600, 500, 0.8);
  return sk;
}

const BUBBLES = [
  [{ who: "teacher", text: "오늘의<br>주인공!" }],
  [{ who: "teacher", text: "녹는다,<br>녹아!" }],
  [{ who: "teacher", text: "어디<br>갔지?" }],
  [{ who: "teacher", text: "앞이 안<br>보여!" }],
  [{ who: "teacher", text: "꽁꽁<br>얼었네!" }],
  [{ who: "teacher", text: "물방울이<br>없네?" }],
  [{ who: "teacher", text: "둘 다<br>붉어졌어!" }],
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
