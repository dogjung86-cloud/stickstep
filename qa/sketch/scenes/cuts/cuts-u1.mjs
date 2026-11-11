// 중1 과학 Ⅰ단원(과학과 인류의 지속가능한 삶) 개념 컷 코드 그림.
// 목록은 Ⅰ단원 v5 세션이 새 개념 스텝을 쓰며 낸 것(D:\Brilliant Science\output\g1-v5\u1\concept-cuts.md). 원본 발주 그림은 없다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, qmark, sparkle, squiggle, arrow, check } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { earth, phone } from "../../lib/props.mjs";
import { W, H, lerpx, thin } from "./common.mjs";

const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
const KID_A = { hair: "short", hairColor: "#3F3A36", seed: 141 };
const KID_B = { hair: "bob", hairColor: "#8A5A33", seed: 151 };
// 달리기 준비 자세(앞으로 살짝 숙이고 한 발을 앞에)
const READY = pose({ hip: [0, -206], neck: [22, -332], head: [40, -424], tilt: 0.16,
  elL: [-30, -262], haL: [-6, -214], elR: [70, -272], haR: [96, -232],
  knL: [-30, -104], ftL: [-60, 0], knR: [46, -108], ftR: [64, 0] });

/* ---------- u1l2: 변인 통제, 모두 같은 출발선에 ---------- */
function cutU1l2() {
  const sk = new Sk(W, H, { id: "a" });
  // 앞에서 본 달리기 길: 줄은 멀어질수록 모인다. 가로로 그은 흰 출발선에 셋이 나란히 서고, 한 명만 선을 넘어 앞에 서 있다
  const T0 = 372, T1 = 704;
  const track = poly([[14, T0], [946, T0], [946, T1], [14, T1]], 4);
  sk.fill(track, "#F2C3A4", { dx: 0, dy: 0, wob: 0.3, seed: 11, tex: 0.4, texAng: 0.02 });
  sk.ink(dense([[14, T0], [946, T0]]), { w: 9, seed: 12 });
  const laneX = (k, y) => lerpx([300, 460, 620, 780][k], [216, 432, 648, 864][k], (y - T0) / (T1 - T0));
  for (let k = 0; k < 4; k++) sk.ink(dense([[laneX(k, T0), T0], [laneX(k, T1), T1]]), { w: 6, color: C.white, seed: 13 + k, wob: 0.3 });
  const LY = 560;
  sk.ink(dense([[laneX(0, LY) - 10, LY], [laneX(3, LY) + 10, LY]]), { w: 16, color: C.white, seed: 17, wob: 0.3 });
  const mid = (k, y) => (laneX(k, y) + laneX(k + 1, y)) / 2;
  const STAND = pose({ elL: [-56, -264], haL: [-40, -214], elR: [56, -264], haR: [40, -214] });
  // 출발선 위의 둘(발이 선에 닿는다)과 선을 넘어 앞으로 나온 하나
  drawFigure(sk, mid(0, LY), LY - 4, 0.48, STAND, { ...KID_A, name: "a" });
  drawFigure(sk, mid(2, LY), LY - 4, 0.48, STAND, { ...KID_B, name: "c" });
  const FY = 664;
  drawFigure(sk, mid(1, FY), FY, 0.54, STAND, { ...STUDENT, name: "b" });
  arrow(sk, [[mid(1, FY) + 60, FY - 24], [mid(1, FY) + 74, FY - 70], [mid(1, LY) + 58, LY + 14]], { w: 7, color: C.teal, seed: 21, wob: 0.3, head: 18 });
  // 쌤: 왼쪽에서 손바닥을 펴 "선으로!" 하고 출발선을 가리킨다
  const P = pose({ elR: [96, -330], haR: [178, -372], elL: [-50, -262], haL: [-26, -220], tilt: 0.06 });
  drawFigure(sk, 108, 700, 0.62, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- u1l2b: 자료 해석과 결론 도출 ---------- */
function cutU1l2b() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 672;
  ground(sk, GY, 11);
  // 왼쪽: 낙서처럼 빼곡한 공책(글자 대신 구불구불한 줄)
  sk.at(170, 470, 1, () => {
    const pg = poly([[-110, -84], [110, -84], [110, 84], [-110, 84]], 4);
    sk.fill(pg, C.parchment, { seed: 31, dx: 1, dy: 1.2 });
    for (let i = 0; i < 7; i++) sk.ink(curve(Array.from({ length: 9 }, (_, k) => [-96 + k * 23 + (i % 3) * 2, -66 + i * 22 + ((k * 7 + i * 3) % 5 - 2) * 2.4])), { w: 4, color: C.gray, seed: 32 + i, wob: 0.6 });
    sk.ink(dense([[0, -84], [0, 84]]), { w: 5, color: "#C9B58C", seed: 40 });
    sk.ink(pg, { w: 9, seed: 41 });
  }, -0.06);
  qmark(sk, 156, 330, 0.62, { color: C.gray, seed: 42, rot: -0.1 });
  arrow(sk, [[300, 420], [348, 392], [396, 400]], { w: 7, color: C.teal, seed: 43, wob: 0.3, head: 18 });
  // 오른쪽: 받침대 위 꺾은선 그림. 가장 높이 오르는 선 끝을 짚는다
  const bx = 420, by = 200, bw = 330, bh = 250;
  thin(sk, 0.8, () => {
    for (const [x, i] of [[bx + 60, 0], [bx + bw - 60, 1]]) sk.ink(dense([[x, by + bh], [x + (i ? 16 : -16), GY]]), { w: 11, color: C.woodDark, seed: 50 + i });
    const bd = rrect(bx, by, bw, bh, 10);
    sk.fill(bd, C.white, { dx: 0.8, dy: 1, wob: 0.4, seed: 52 }); sk.ink(bd, { w: 11, seed: 53 });
  });
  const ox = bx + 44, oy = by + bh - 40, gw = bw - 80, gh = bh - 80;
  sk.ink(dense([[ox, by + 30], [ox, oy], [ox + gw, oy]]), { w: 6, seed: 54, wob: 0.2 });
  const lines = [[C.blue, [0.15, 0.25, 0.3, 0.38, 0.42]], [C.green, [0.1, 0.2, 0.34, 0.5, 0.62]], [C.red, [0.12, 0.3, 0.52, 0.74, 0.92]]];
  lines.forEach(([col, ys], j) => {
    const pts = ys.map((v, k) => [ox + 16 + k * (gw - 30) / 4, oy - v * gh]);
    sk.ink(dense(pts), { w: 7, color: col, seed: 55 + j, wob: 0.3 });
    for (const p of pts) sk.dot(p[0], p[1], 6.5, col);
  });
  const top = [ox + 16 + 4 * (gw - 30) / 4, oy - 0.92 * gh];
  sparkle(sk, top[0] + 30, top[1] - 26, 16, { seed: 60 });
  // 학생: 손가락으로 가장 높은 점을 짚는다(모자챙은 왼쪽, 짚는 팔은 오른쪽)
  const P = pose({ elL: [-110, -360], haL: [-196, -430], elR: [50, -262], haR: [26, -220], tilt: -0.06 });
  const fx = 800, fs = 0.66;
  drawFigure(sk, fx, GY, fs, P, { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- u1l4: 인공지능과 증강 현실 ---------- */
function cutU1l4() {
  const sk = new Sk(W, H, { id: "c" });
  const GY = 672;
  ground(sk, GY, 11);
  // 길(실제): 아무 표시도 없다
  sk.ink(dense([[14, GY - 30], [946, GY - 30]]), { w: 5, color: C.grayLight, seed: 12, dash: [30, 24], wob: 0.2 });
  // 걸어가며 폰을 앞으로 든 사람
  const P = pose({ elR: [76, -300], haR: [130, -340], elL: [-40, -258], haL: [-60, -214], knL: [-36, -104], ftL: [-74, 0], knR: [40, -110], ftR: [70, -4], tilt: 0.06 });
  const fx = 200, fs = 0.7;
  drawFigure(sk, fx, GY, fs, P, { ...STUDENT, name: "student", hands: "L" });
  const hx = fx + fs * 130, hy = GY - fs * 340;
  phone(sk, hx + 14, hy - 18, 1.1, { seed: 21, rot: 0.1 });
  handDot(sk, [hx, hy], C.skin, 22, 12);
  // 폰 화면을 크게: 같은 길 위에 화살표가 겹쳐 보인다(증강 현실)
  const sx = 470, sy = 90, sw = 300, sh = 470;
  sk.ink(dense([[hx + 30, hy - 50], [sx, sy + 120]]), { w: 5, color: C.gray, dash: [12, 10], seed: 23, wob: 0.3 });
  sk.ink(dense([[hx + 30, hy + 8], [sx, sy + sh - 80]]), { w: 5, color: C.gray, dash: [12, 10], seed: 24, wob: 0.3 });
  const body = rrect(sx, sy, sw, sh, 40);
  sk.fill(body, "#39424E", { seed: 25, dx: 1, dy: 1.2 });
  const scr = rrect(sx + 20, sy + 40, sw - 40, sh - 80, 18);
  sk.fill(scr, "#BFE3F5", { dx: 0, dy: 0, wob: 0.3, seed: 26 });
  // 화면 속 길(원근)과 길가
  const road = poly([[sx + 120, sy + 150], [sx + 180, sy + 150], [sx + 268, sy + sh - 44], [sx + 32, sy + sh - 44]], 3);
  sk.fill(poly([[sx + 20, sy + 150], [sx + sw - 20, sy + 150], [sx + sw - 20, sy + sh - 40], [sx + 20, sy + sh - 40]], 3), "#9ED08A", { dx: 0, dy: 0, wob: 0.2, seed: 27 });
  sk.fill(road, "#A9AFB7", { dx: 0, dy: 0, wob: 0.3, seed: 28 });
  sk.ink(dense([[sx + 150, sy + 170], [sx + 150, sy + sh - 60]]), { w: 5, color: C.white, dash: [18, 16], seed: 29, wob: 0.2 });
  // 길 위에 겹친 화살표(앞으로 가다 오른쪽으로)
  arrow(sk, [[sx + 140, sy + sh - 80], [sx + 146, sy + 290], [sx + 170, sy + 230], [sx + 236, sy + 210]], { w: 18, color: C.teal, seed: 30, wob: 0.2, head: 34 });
  sk.ink(scr, { w: 7, seed: 31, color: "#22262E" });
  sk.ink(body, { w: 11, seed: 32 });
  sk.dot(sx + sw / 2, sy + 22, 6, "#22262E");
  // 인공지능이 길을 골라 준다는 표시: 화면 위 반짝임
  sparkle(sk, sx + 248, sy + 120, 14, { seed: 33 });
  return sk;
}

/* ---------- u1l4b: 사물 인터넷, 멀리 있는 창문을 폰으로 닫는다 ---------- */
function rainCloud(sk, x, y, w, h, sd) {
  const pts = [];
  for (let i = 0; i <= 24; i++) { const a = Math.PI + i / 24 * Math.PI; pts.push([x + Math.cos(a) * w / 2, y + Math.sin(a) * h * (0.7 + 0.3 * Math.abs(Math.sin(a * 3)))]); }
  const c = [...curve([[x - w / 2, y], [x - w * 0.36, y - h * 0.62], [x - w * 0.12, y - h * 0.82], [x + w * 0.1, y - h * 1.0], [x + w * 0.32, y - h * 0.7], [x + w / 2, y]], false, 4)];
  const shape = [...c, [x + w / 2, y + 8], [x - w / 2, y + 8], c[0]];
  sk.fill(shape, "#B9C1CB", { dx: 0.8, dy: 1, wob: 0.6, seed: sd });
  sk.ink(shape, { w: 9, seed: sd + 1 });
}
function cutU1l4b() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 672;
  ground(sk, GY, 11);
  rainCloud(sk, 240, 150, 300, 90, 21);
  rainCloud(sk, 720, 130, 300, 90, 23);
  for (let i = 0; i < 26; i++) { const x = 70 + (i * 37) % 860, y = 200 + ((i * 53) % 190); sk.ink(dense([[x, y], [x - 8, y + 26]]), { w: 5, color: C.blue, seed: 30 + i, wob: 0.1 }); }
  // 집(멀리): 창문이 스르르 닫힌다
  const hx = 700, hy = GY;
  thin(sk, 0.8, () => {
    const wall = poly([[hx - 140, hy], [hx - 140, hy - 210], [hx + 140, hy - 210], [hx + 140, hy]], 4);
    sk.fill(wall, "#F3E3C6", { seed: 61, tex: 0.6 }); sk.ink(wall, { w: 11, seed: 62 });
    const roof = poly([[hx - 170, hy - 206], [hx, hy - 320], [hx + 170, hy - 206]], 4);
    sk.fill(roof, "#C0574A", { seed: 63, tex: 0.7, texAng: 0.6 }); sk.ink(roof, { w: 11, seed: 64 });
    const door = rrect(hx + 40, hy - 120, 60, 120, 8);
    sk.fill(door, C.wood, { dx: 0.6, dy: 0.8, wob: 0.3, seed: 65 }); sk.ink(door, { w: 9, seed: 66 });
    const win = rrect(hx - 104, hy - 170, 110, 86, 6);
    sk.fill(win, "#9FD8F5", { dx: 0, dy: 0, wob: 0.3, seed: 67 });
    // 창문 유리가 오른쪽에서 왼쪽으로 미끄러져 닫히는 중
    const pane = rrect(hx - 70, hy - 170, 76, 86, 4);
    sk.fill(pane, "#D7EEF8", { dx: 0, dy: 0, wob: 0.3, seed: 68, alpha: 0.95 }); sk.ink(pane, { w: 7, seed: 69 });
    sk.ink(win, { w: 9, seed: 70 });
  });
  arrow(sk, [[hx + 30, hy - 192], [hx - 56, hy - 192]], { w: 7, color: C.teal, straight: true, seed: 71, head: 16 });
  // 밖에 있는 사람: 폰을 누른다. 폰에서 집으로 신호가 간다
  const P = pose({ elR: [80, -282], haR: [118, -290], elL: [-50, -262], haL: [-26, -220], tilt: 0.12 });
  const fx = 200, fs = 0.7;
  drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
  const px = fx + fs * 132, py = GY - fs * 300;
  phone(sk, px, py, 1.1, { seed: 72, rot: -0.2 });
  handDot(sk, [px - 12, py + 22], C.skin, 73, 12);
  sk.ink(curve([[px + 34, py - 50], [380, 300], [470, 330], [hx - 110, hy - 196]]), { w: 5, color: C.teal, dash: [12, 10], seed: 75, wob: 0.3 });
  for (const [r, i] of [[16, 0], [30, 1], [44, 2]]) sk.ink(ell(px + 10, py - 40, r, r, -2.1, -0.7), { w: 5, color: C.teal, seed: 76 + i, wob: 0.2 });
  return sk;
}

/* ---------- u1l5: 깨끗한 지구를 다음 사람에게 ---------- */
function cutU1l5() {
  const sk = new Sk(W, H, { id: "e" });
  const GY = 672;
  ground(sk, GY, 11);
  for (const [x, i] of [[90, 0], [870, 1], [520, 2]]) for (let k = 0; k < 4; k++) sk.ink(curve([[x + k * 10, GY], [x + k * 10 + 2, GY - 16], [x + k * 10 + ((k % 2) * 2 - 1) * 4, GY - 28]]), { w: 6, color: k % 2 ? "#4E9A46" : "#6BB55A", seed: 11 + i * 4 + k, wob: 0.4 });
  // 어른(쌤)이 두 손으로 지구를 내민다
  const P = pose({ elR: [92, -306], haR: [160, -300], elL: [60, -300], haL: [128, -282], tilt: 0.06 });
  const fx = 300, fs = 0.74;
  drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: false });
  const ex = 506, ey = GY - 262;
  earth(sk, ex, ey, 70, { seed: 21 });
  for (const [x, y, r, i] of [[ex - 90, ey - 70, 14, 0], [ex + 84, ey - 84, 18, 1], [ex + 96, ey + 4, 11, 2]]) sparkle(sk, x, y, r, { seed: 30 + i });
  handDot(sk, [ex - 70, ey + 30], C.skin, 34, 13); handDot(sk, [fx + fs * 160, GY - fs * 300], C.skin, 35, 13);
  // 아이(학생)가 두 팔을 벌려 받는다
  const Q = pose({ elL: [-78, -300], haL: [-130, -330], elR: [-40, -290], haR: [-96, -350], tilt: -0.08 });
  const cx = 680, cs = 0.56;
  drawFigure(sk, cx, GY, cs, Q, { ...STUDENT, name: "student" });
  return sk;
}

export function cuts() {
  return [
    { name: "u1l2", theme: "civ", sk: cutU1l2(), alt: "달리기 출발선에서 한 사람만 몇 걸음 앞에 서 있고 스틱맨 쌤이 모두를 같은 선에 세우는 장면", cap: "모두 같은 선에서 출발해야 누가 빠른지 알 수 있어요" },
    { name: "u1l2b", theme: "civ", sk: cutU1l2b(), alt: "빼곡한 공책을 꺾은선 그림으로 바꿔 그리고 가장 높이 올라간 선을 짚는 학생", cap: "자료를 그림으로 바꾸면 결론이 보여요" },
    { name: "u1l4", theme: "civ", sk: cutU1l4(), alt: "폰으로 길을 비추자 화면 속 길 위에 화살표가 겹쳐 보이는 장면", cap: "화면 속 길 위에 길잡이 화살표가 겹쳐 보여요" },
    { name: "u1l4b", theme: "civ", sk: cutU1l4b(), alt: "비가 오자 밖에서 폰을 눌러 멀리 있는 집의 창문을 닫는 장면", cap: "멀리 있는 창문도 폰으로 닫을 수 있어요" },
    { name: "u1l5", theme: "civ", sk: cutU1l5(), alt: "어른이 깨끗이 닦은 지구를 아이에게 건네는 장면", cap: "깨끗한 지구를 다음 세대에게" },
  ];
}
