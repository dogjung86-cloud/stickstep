// 중1 과학 u1l3 도입 만화: 과학이 바꾼 세상, 시간 여행. 7컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u1l3.md.
//   1 출발(기차와 폰) → 2 원리의 발견(빛의 굴절과 렌즈) → 3 17세기(훅의 현미경과 세포)
//   → 4 18~19세기(증기 기관) → 5 20세기(페니실린) → 6 20세기 후반부터(인공위성과 인터넷) → 7 과학 밖으로(예술, 정리)
// 인물은 얼굴 없이: 쌤(안경+흰 가운), 학생(노란 모자), 훅(곱슬 긴 머리), 기술자(실크해트), 플레밍(나비넥타이)
import { Sk, C, curve, dense, circ, ell, poly, rrect, squiggle, emark, rays, sparkle, arrow, heart } from "../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, R, TEACHER, STUDENT, HOOKE, ENGINEER, FLEMING, headTop } from "../lib/figure.mjs";
import { glass, note, microscope, cellsView, kettle, earth, satellite, phone, petri } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; }; // 크게 키운 소품의 선이 두꺼워지지 않게

/* ---------- 1. 출발: 몇 시간이면 먼 도시까지 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  // 속도선과 해
  for (const [x, y, l, i] of [[40, 150, 150, 0], [90, 196, 110, 1], [30, 610, 190, 2], [120, 654, 130, 3]]) sk.ink(dense([[x, y], [x + l, y]]), { w: 7, color: C.gray, seed: 11 + i, wob: 0.8 });
  // 열차
  sk.ink(dense([[-10, 566], [970, 566]], 6), { w: 9, seed: 15, color: C.gray });
  const body = curve([[-40, 236], [300, 232], [680, 236], [840, 280], [926, 372], [916, 480], [860, 520], [300, 524], [-40, 520]], true, 5);
  sk.fill(body, C.white, { seed: 16, dx: 2, dy: 2 });
  const stripe = poly([[-40, 446], [922, 446], [912, 486], [-40, 486]], 5);
  sk.fill(stripe, C.blue, { seed: 17, tex: true, texAng: 0.02, dx: 0, dy: 0 });
  // 창과 그 안의 두 사람
  const win = (x, sd) => rrect(x, 284, 262, 136, 34);
  const heads = [[236, TEACHER, 21, "teacher"], [566, STUDENT, 31, "student"]];
  for (const [wx, i] of [[104, 0], [434, 1]]) {
    const w = win(wx, i);
    sk.fill(w, "#DCEFFB", { seed: 18 + i, dx: 0, dy: 0, wob: 1 });
    const [hx, who, sd, name] = heads[i];
    sk.at(hx, 372, 0.5, () => drawHead(sk, { ...who, seed: sd, flip: i ? -1 : 1 }));
    sk.mark(name, hx, 372 - headTop(who) * 0.5);
    sk.ink(w, { w: 10, seed: 20 + i });
  }
  note(sk, 664, 330, 0.9, { color: C.teal, rot: 0.1, seed: 23 });
  const nose = curve([[720, 300], [800, 310], [852, 372], [760, 372]], true, 4);
  sk.fill(nose, "#DCEFFB", { seed: 24, dx: 0, dy: 0, wob: 0.8 }); sk.ink(nose, { w: 9, seed: 25 });
  sk.ink(body, { w: 12, seed: 26 });
  for (const x of [120, 300, 520, 720]) { const wh = ell(x, 530, 34, 16, 0, Math.PI); sk.fill([...wh, wh[0]], "#3A3D44", { dx: 0, dy: 0, wob: 0.4, seed: 27 + x }); }
  emark(sk, 590, 168, 0.95, { color: C.red });
  return sk;
}

/* ---------- 2. 원리의 발견: 빛이 꺾여요 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  // 학생: 탁자 높이에서 물컵을 들여다본다
  const peek = pose({ elR: [56, -272], haR: [104, -300], tilt: 0.12 });
  drawFigure(sk, 112, 700, 0.5, peek, { ...STUDENT, name: "student" });
  // 탁자
  sk.ink(dense([[236, 572], [228, 704]]), { w: 12, seed: 31 }); sk.ink(dense([[872, 572], [880, 704]]), { w: 12, seed: 32 });
  const top = rrect(196, 548, 716, 28, 10);
  sk.fill(top, C.wood, { seed: 33, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 34 });
  // 물컵과 꺾여 보이는 빨대
  const gx = 322, gy = 548, gs = 2.5;
  sk.ink(dense([[gx + 86, gy - 300], [gx + 22, gy - 136]]), { w: 13, color: C.red, seed: 35, wob: 0.6 });
  thin(sk, 0.6, () => glass(sk, gx, gy, gs, { seed: 581 }));
  sk.ink(dense([[gx - 4, gy - 132], [gx - 36, gy - 22]]), { w: 13, color: "#C4553F", seed: 36, wob: 0.6, alpha: 0.9 });
  // 렌즈(옆에서 본 볼록 렌즈)와 받침
  const lx = 620, ly = 316;
  sk.ink(dense([[lx, ly + 112], [lx, 548]]), { w: 10, seed: 37 });
  sk.ink(dense([[lx - 40, 548], [lx + 40, 548]]), { w: 11, seed: 38 });
  const lens = [...ell(lx - 96, ly, 126, 124, -1.06, 1.06), ...ell(lx + 96, ly, 126, 124, Math.PI - 1.06, Math.PI + 1.06)];
  lens.push(lens[0]);
  sk.fill(lens, "#CDEBFA", { seed: 39, dx: 0, dy: 0, wob: 0.6, alpha: 0.9 }); sk.ink(lens, { w: 9, seed: 40 });
  // 빛줄기: 나란히 오다가 렌즈를 지나며 꺾여 한 점에 모인다
  const fx = 826, fy = ly;
  for (const [dy, i] of [[-70, 0], [0, 1], [70, 2]]) {
    arrow(sk, [[486, ly + dy], [lx - 26, ly + dy]], { w: 8, color: C.yellow, straight: true, seed: 41 + i, head: 18 });
    sk.ink(dense([[lx + 26, ly + dy], [fx - 8, fy + dy * 0.06]]), { w: 8, color: C.yellow, seed: 44 + i, wob: 0.6 });
  }
  // 빛이 모이는 종이
  sk.ink(dense([[fx + 18, ly + 96], [fx + 18, 548]]), { w: 10, seed: 47 });
  const card = poly([[fx + 6, ly - 104], [fx + 34, ly - 110], [fx + 34, ly + 104], [fx + 6, ly + 98]], 4);
  sk.fill(card, C.white, { seed: 48, dx: 1, dy: 1 }); sk.ink(card, { w: 9, seed: 49 });
  sparkle(sk, fx - 6, fy, 22, { seed: 50, color: C.lemon });
  return sk;
}

/* ---------- 3. 17세기: 코르크 속 작은 방들 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  // 탁자와 현미경
  sk.ink(dense([[330, 584], [322, 704]]), { w: 12, seed: 51 }); sk.ink(dense([[636, 584], [644, 704]]), { w: 12, seed: 52 });
  const top = rrect(292, 560, 384, 28, 10);
  sk.fill(top, C.wood, { seed: 53, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 54 });
  microscope(sk, 470, 560, 1.12, { seed: 881 });
  // 확대해 본 코르크
  sk.ink(dense([[452, 510], [560, 330]]), { w: 5, color: C.gray, dash: [12, 10], seed: 55, wob: 0.4 });
  sk.ink(dense([[470, 520], [640, 420]]), { w: 5, color: C.gray, dash: [12, 10], seed: 56, wob: 0.4 });
  cellsView(sk, 728, 236, 186, { seed: 901 });
  sparkle(sk, 918, 86, 17, { seed: 57 });
  // 훅: 현미경을 들여다본다
  const lean = pose({ neck: [26, -336], head: [66, -420], tilt: 0.3, elR: [84, -272], haR: [138, -262], elL: [-40, -258], haL: [-52, -186] });
  drawFigure(sk, 176, 704, 0.78, lean, { ...HOOKE, name: "hooke" });
  emark(sk, 86, 246, 0.9, { color: C.red, rot: -0.12 });
  return sk;
}

/* ---------- 4. 18~19세기: 증기가 바퀴를 굴리다 ---------- */
function loco(sk, x, y, s) {
  // 증기 기관차 + 짐칸 하나. 원점 = 맨 앞바퀴 바닥 쪽(선로 위)
  sk.at(x, y, s, () => {
    // 짐칸
    sk.ink(dense([[-306, -66], [-258, -66]]), { w: 9, seed: 71 });
    for (const [bx, c, i] of [[-470, "#C99A62", 0], [-388, "#E0B878", 1]]) { const b = poly([[bx, -150], [bx + 74, -150], [bx + 74, -86], [bx, -86]], 4); sk.fill(b, c, { seed: 72 + i, tex: true }); sk.ink(b, { w: 8, seed: 74 + i }); }
    const wag = poly([[-498, -90], [-306, -90], [-314, -40], [-490, -40]], 4);
    sk.fill(wag, "#8FA3B8", { seed: 76, tex: true, texAng: 0.02 }); sk.ink(wag, { w: 10, seed: 77 });
    // 운전실, 보일러, 굴뚝
    const cab = poly([[-258, -206], [-150, -206], [-150, -44], [-258, -44]], 4);
    sk.fill(cab, C.red, { seed: 78, tex: true }); sk.ink(cab, { w: 10, seed: 79 });
    sk.fill(rrect(-240, -186, 52, 54, 8), "#DCEFFB", { seed: 80, dx: 0, dy: 0, wob: 0.5 }); sk.ink(rrect(-240, -186, 52, 54, 8), { w: 7, seed: 81 });
    const boiler = rrect(-150, -160, 210, 116, 40);
    sk.fill(boiler, "#3F4652", { seed: 82, tex: true, texAng: 0.02 }); sk.ink(boiler, { w: 10, seed: 83 });
    const chim = poly([[4, -162], [42, -162], [50, -226], [-4, -226]], 4);
    sk.fill(chim, "#3F4652", { seed: 84 }); sk.ink(chim, { w: 9, seed: 85 });
    for (const [cx, cy, r, i] of [[30, -266, 26, 0], [72, -312, 34, 1], [132, -356, 42, 2]]) { const c = circ(cx, cy, r, { over: 0.2, seed: 86 + i, lump: 0.08 }); sk.fill(c, "#EEF1F4", { dx: 0, dy: 0, wob: 0.8, seed: 89 + i }); sk.ink(c, { w: 7, color: C.gray, seed: 92 + i, wob: 0.8 }); }
    // 바퀴
    for (const [wx, r, i] of [[-210, 44, 0], [-96, 44, 1], [10, 44, 2], [-448, 30, 3], [-350, 30, 4]]) {
      const c = circ(wx, -r, r, { over: 0.2, seed: 95 + i });
      sk.fill(c, i < 3 ? "#E0503A" : "#6B7480", { dx: 0, dy: 0, wob: 0.5, seed: 100 + i }); sk.ink(c, { w: 9, seed: 105 + i });
      sk.dot(wx, -r, 7);
    }
    sk.ink(dense([[-210, -44], [10, -44]]), { w: 9, seed: 110 });
  });
}
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  // 선로
  sk.ink(dense([[420, 628], [970, 628]], 6), { w: 9, seed: 61, color: C.gray });
  loco(sk, 846, 624, 0.8);
  // 끓는 주전자: 뚜껑이 들썩
  sk.ink(dense([[70, 596], [62, 704]]), { w: 11, seed: 62 }); sk.ink(dense([[232, 596], [240, 704]]), { w: 11, seed: 63 });
  const tb = rrect(40, 572, 222, 26, 10);
  sk.fill(tb, C.wood, { seed: 64, tex: true, texAng: 0.02 }); sk.ink(tb, { w: 10, seed: 65 });
  kettle(sk, 146, 572, 1.02, { seed: 921, lift: 20 });
  for (const [x, i] of [[110, 0], [150, 1], [190, 2]]) sk.ink(squiggle(x, 410, 70, 9, 2, i * 1.4), { w: 7, color: C.gray, wob: 0, seed: 66 + i });
  arrow(sk, [[150, 320], [150, 262]], { w: 9, color: C.orange, straight: true, seed: 69, head: 22 });
  // 기술자: 주전자의 힘을 기관차로
  const point = pose({ elL: [-70, -300], haL: [-128, -284], elR: [84, -318], haR: [156, -334], tilt: 0.04 });
  drawFigure(sk, 344, 704, 0.62, point, { ...ENGINEER, name: "engineer" });
  return sk;
}

/* ---------- 5. 20세기: 곰팡이가 세균을 막다 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  // 크게 본 배양 접시
  sk.ink(dense([[352, 300], [470, 196]]), { w: 5, color: C.gray, dash: [12, 10], seed: 121, wob: 0.4 });
  sk.ink(dense([[362, 356], [500, 470]]), { w: 5, color: C.gray, dash: [12, 10], seed: 122, wob: 0.4 });
  petri(sk, 668, 318, 214, { seed: 1001 });
  // 플레밍: 접시를 들어 올려 본다
  const up = pose({ elR: [74, -316], haR: [118, -400], elL: [-56, -262], haL: [-22, -222], tilt: 0.08 });
  const fx = 206, fy = 704, fs = 0.82;
  drawFigure(sk, fx, fy, fs, up, { ...FLEMING, name: "fleming", hands: "L" });
  const hx = fx + fs * 118, hy = fy - fs * 400;
  thin(sk, 0.7, () => petri(sk, hx + 26, hy - 20, 34, { seed: 1001, ring: false, w: 7 }));
  handDot(sk, [hx, hy + 6], C.skin, 123, 12);
  emark(sk, 74, 250, 0.9, { color: C.red, rot: -0.1 });
  // 약병과 알약
  const bt = rrect(828, 596, 62, 92, 12);
  sk.fill(bt, "#F3E3C2", { seed: 124, tex: true }); sk.ink(bt, { w: 9, seed: 125 });
  const cap = rrect(834, 574, 50, 26, 8);
  sk.fill(cap, C.teal, { seed: 126 }); sk.ink(cap, { w: 8, seed: 127 });
  for (const [x, y, rot, i] of [[760, 676, 0.3, 0], [716, 690, -0.4, 1]]) sk.at(x, y, 1, () => { const pl = rrect(-22, -10, 44, 20, 10); sk.fill(pl, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 128 + i }); sk.fill(poly([[0, -10], [22, -10], [22, 10], [0, 10]], 3), C.teal, { dx: 0, dy: 0, wob: 0.3, seed: 130 + i, alpha: 0.9 }); sk.ink(pl, { w: 6, seed: 132 + i, wob: 0.4 }); }, rot);
  return sk;
}

/* ---------- 6. 20세기 후반부터: 지구 반대편과 실시간으로 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  earth(sk, 480, 1070, 560, { seed: 941, w: 12 });
  thin(sk, 1.2, () => satellite(sk, 480, 92, 0.72, { seed: 961 }));
  // 신호
  for (const [x0, y0, i] of [[258, 408, 0], [702, 408, 1]]) sk.ink(dense([[x0, y0], [480 + (i ? 34 : -34), 132]]), { w: 6, color: C.blue, dash: [14, 12], seed: 141 + i, wob: 0.5 });
  // 양쪽의 두 사람: 지구 위에 서서 폰을 든다
  const L = pose({ elR: [66, -304], haR: [104, -366], tilt: 0.05 }), Rp = pose({ elL: [-66, -304], haL: [-104, -366], tilt: -0.05 });
  sk.at(190, 622, 1, () => drawFigure(sk, 0, 0, 0.56, L, { ...STUDENT, name: "left", hands: "L" }), -0.26);
  sk.at(770, 622, 1, () => drawFigure(sk, 0, 0, 0.56, Rp, { hair: "bob", hairColor: "#3F322C", name: "right", seed: 51, hands: "R" }), 0.26);
  phone(sk, 252, 440, 0.92, { seed: 981, rot: -0.3, icon: "play" });
  handDot(sk, [244, 454], C.skin, 143, 9);
  phone(sk, 708, 440, 0.92, { seed: 985, rot: 0.3, icon: "play" });
  handDot(sk, [716, 454], C.skin, 145, 9);
  note(sk, 352, 520, 0.8, { color: C.teal, rot: -0.1, seed: 147 });
  note(sk, 606, 528, 0.7, { color: C.orange, rot: 0.15, seed: 151 });
  return sk;
}

/* ---------- 7. 과학 밖으로: 예술도, 생활도 바뀌었어요 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  // 위쪽: 지금까지의 여행(렌즈 → 주전자 → 접시 → 위성)
  const iy = 84;
  const lens = [...ell(84 - 34, iy, 46, 44, -1.0, 1.0), ...ell(84 + 34, iy, 46, 44, Math.PI - 1.0, Math.PI + 1.0)]; lens.push(lens[0]);
  sk.fill(lens, "#CDEBFA", { seed: 161, dx: 0, dy: 0, wob: 0.4 }); sk.ink(lens, { w: 7, seed: 162 });
  thin(sk, 1.5, () => kettle(sk, 232, iy + 44, 0.44, { seed: 921, lift: 8 }));
  thin(sk, 0.9, () => petri(sk, 384, iy, 42, { seed: 1001, ring: false, w: 7 }));
  thin(sk, 1.5, () => satellite(sk, 540, iy, 0.42, { seed: 961 }));
  for (const [x, i] of [[124, 0], [294, 1], [440, 2]]) arrow(sk, [[x, iy], [x + 40, iy]], { w: 8, color: C.gray, straight: true, seed: 163 + i, head: 18 });
  // 왼쪽: 삼각대 위의 옛 사진기
  for (const [dx, i] of [[-62, 0], [0, 1], [62, 2]]) sk.ink(dense([[150, 470], [150 + dx, 704]]), { w: 10, seed: 166 + i });
  const box = rrect(84, 372, 132, 100, 12);
  sk.fill(box, C.woodDark, { seed: 169, tex: true }); sk.ink(box, { w: 10, seed: 170 });
  const ln = circ(216, 422, 28, { over: 0.2, seed: 171 });
  sk.fill(ln, "#39424E", { dx: 0, dy: 0, wob: 0.4, seed: 172 }); sk.ink(ln, { w: 8, seed: 173 });
  sk.fill(circ(216, 422, 12, { over: 0, seed: 174 }), "#9FD8F5", { dx: 0, dy: 0, wob: 0.3 });
  for (const [a, i] of [[-0.5, 0], [0, 1], [0.5, 2]]) sk.ink(dense([[260 + 6 * Math.cos(a), 422 + 30 * Math.sin(a)], [292 + 10 * Math.cos(a), 422 + 56 * Math.sin(a)]]), { w: 6, color: C.yellow, seed: 175 + i, wob: 0.3 });
  // 가운데: 가상 현실 기기를 쓴 학생
  const vr = pose({ elL: [-110, -330], haL: [-190, -372], elR: [110, -330], haR: [190, -372], tilt: 0.04 });
  const fx = 500, fy = 704, fs = 0.66;
  drawFigure(sk, fx, fy, fs, vr, { ...STUDENT, name: "student" });
  const hx = fx, hy = fy - fs * 436;
  const visor = rrect(hx - 58, hy - 22, 116, 50, 16);
  sk.fill(visor, "#39424E", { seed: 178, tex: true }); sk.ink(visor, { w: 9, seed: 179 });
  sk.ink(dense([[hx - 30, hy + 2], [hx + 30, hy + 2]]), { w: 6, color: C.teal, seed: 180, wob: 0.4 });
  sparkle(sk, 368, 318, 16, { seed: 181 }); sparkle(sk, 642, 300, 14, { seed: 183, color: C.teal }); sparkle(sk, 610, 420, 11, { seed: 185, color: C.orange });
  // 오른쪽: 쌤이 다음 차례를 넘긴다
  const give = pose({ elL: [-84, -318], haL: [-156, -334], tilt: -0.04 });
  drawFigure(sk, 820, 704, 0.66, give, { ...TEACHER, name: "teacher" });
  return sk;
}

const BUBBLES = [
  [{ who: "teacher", text: "시간 여행 출발!" }],
  [{ who: "student", text: "빨대가<br>부러졌나?" }],
  [{ who: "hooke", text: "작은 방이<br>가득해!" }],
  [{ who: "engineer", text: "이 힘으로<br>달리자!" }],
  [{ who: "fleming", text: "세균이<br>사라졌네?" }],
  [{ who: "left", text: "지금 보여?" }, { who: "right", text: "잘 보여!" }],
  [{ who: "teacher", text: "다음은<br>여러분 차례!" }],
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
