// 중1 과학 u3l3 도입 만화: 캠핑장에서 만난 열의 이동(전도, 대류, 복사). 8컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u3l3.md.
//   1 해는 멀리 있는데 등이 뜨끈(질문) → 2 쇠집게 손잡이가 뜨거워짐(전도) → 3 입자의 흔들림 릴레이(전도 이름)
//   → 4 열화상 카메라로 쇠와 나무 비교 → 5 주전자 속 물의 대류(대류 이름) → 6 모닥불 연기와 공기의 대류
//   → 7 가로막으면 끊기는 온기(복사 이름) → 8 밤의 열화상 카메라, 사람 몸의 복사
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, sparkle, drop, squiggle, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../lib/figure.mjs";
import { sun, moon } from "../lib/props.mjs";

const W = 960, H = 720;
// 캠핑 온 쌤(가운 대신 주황 조끼)과 친구(파란 조끼)
const CAMPER = { ...TEACHER, coat: { color: "#EFA53A", seam: "#B5741F", len: 6 } };
const FRIEND = { ...STUDENT, coat: { color: "#5B9BD5", seam: "#3A6FA0", len: 6 } };
// 열화상 색: 0(차가움, 파랑) ~ 1(뜨거움, 빨강)
const HEAT = ["#2B3A8C", "#3F7CC0", "#3FB8A0", "#F2D03B", "#F08A2E", "#E0503A"];
const heat = t => { const u = Math.max(0, Math.min(0.999, t)) * (HEAT.length - 1), i = Math.floor(u); return mix(HEAT[i], HEAT[i + 1], u - i); };
// 곧게 나아가는 물결 선(복사하는 열). 끝으로 갈수록 물결이 잦아든다
const wavy = (a, b, amp = 7, waves = 5) => {
  const n = 64, out = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 0; i <= n; i++) { const u = i / n, o = amp * Math.sin(u * waves * 2 * Math.PI) * Math.min(1, (1 - u) * 5); out.push([a[0] + dx * u + nx * o, a[1] + dy * u + ny * o]); }
  return out;
};
const ray = (sk, a, b, sd, o = {}) => arrow(sk, wavy(a, b, o.amp ?? 7, o.waves ?? 5), { w: o.w ?? 7, color: o.color ?? C.orange, seed: sd, wob: 0.3, head: 20 });
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

function campfire(sk, x, y, s = 1, sd = 501) {
  sk.at(x, y, s, () => {
    for (const [rot, i] of [[0.22, 0], [-0.22, 1]]) sk.at(0, -18, 1, () => { const lg = rrect(-96, -15, 192, 30, 14); sk.fill(lg, "#8A5A33", { seed: sd + i, tex: true, texAng: 0.05 }); sk.ink(lg, { w: 9, seed: sd + 2 + i }); }, rot);
    const fl = curve([[0, -210], [34, -152], [68, -112], [60, -60], [26, -36], [-26, -36], [-60, -60], [-66, -108], [-36, -136], [-22, -172]], true, 4);
    sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.8, seed: sd + 4 }); sk.ink(fl, { w: 8, color: C.red, seed: sd + 5, wob: 0.8 });
    const fi = curve([[2, -142], [22, -106], [30, -72], [10, -50], [-12, -50], [-30, -74], [-18, -106]], true, 3);
    sk.fill(fi, C.lemon, { dx: 0, dy: 0, wob: 0.5, seed: sd + 6 });
  });
}
function tent(sk, x, y, w, h, o = {}) {
  const sd = o.seed ?? 521, col = o.color ?? "#6FAE5B";
  const body = poly([[x - w / 2, y], [x, y - h], [x + w / 2, y]], 5);
  sk.fill(body, col, { seed: sd, tex: true, texAng: 1.1 });
  const door = poly([[x - w * 0.14, y], [x, y - h * 0.62], [x + w * 0.14, y]], 4);
  sk.fill(door, mix(col, "#000000", 0.35), { dx: 0, dy: 0, wob: 0.6, seed: sd + 1 }); sk.ink(door, { w: 7, seed: sd + 2 });
  sk.ink(body, { w: 11, seed: sd + 3 });
}
// 열화상 카메라(손에 드는 납작한 기기). (x, y) = 가운데
function camera(sk, x, y, sd = 541, flip = 1) {
  sk.at(x, y, 1, () => {
    const b = rrect(-48, -34, 96, 68, 12);
    sk.fill(b, "#55606E", { seed: sd, dx: 1, dy: 1.2 }); sk.ink(b, { w: 9, seed: sd + 1 });
    const l = circ(50, 0, 17, { over: 0.15, seed: sd + 2 });
    sk.fill(l, "#22262E", { dx: 0, dy: 0, wob: 0.4, seed: sd + 3 }); sk.ink(l, { w: 7, seed: sd + 4 });
    sk.dot(-28, -18, 5, C.red);
  }, 0, flip);
}
// 화로: 다리 달린 낮은 상자 + 빨간 숯. (x, y) = 윗면 가운데
function brazier(sk, x, y, w, sd = 561) {
  for (const sg of [-1, 1]) sk.ink(dense([[x + sg * (w / 2 - 34), y + 64], [x + sg * (w / 2 - 14), 700]]), { w: 11, seed: sd + (sg > 0 ? 1 : 0) });
  for (let i = 0; i < 6; i++) { const cx = x - w / 2 + 34 + i * (w - 68) / 5, r = 24 + (i % 2) * 5; const c = circ(cx, y - 12, r, { over: 0.15, seed: sd + 2 + i, lump: 0.1 }); sk.fill(c, i % 2 ? C.orange : C.red, { dx: 0, dy: 0, wob: 0.6, seed: sd + 8 + i }); sk.ink(c, { w: 7, color: "#8E2A1E", seed: sd + 14 + i, wob: 0.6 }); }
  const box = poly([[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 24, y + 72], [x - w / 2 + 24, y + 72]], 5);
  sk.fill(box, "#4A4A52", { seed: sd + 20, tex: true, texAng: 0.04 }); sk.ink(box, { w: 11, seed: sd + 21 });
}
// 색이 변하는 굵은 막대(뜨거운 쪽에서 식은 쪽으로): 검은 테 위에 색 토막을 얹는다
function hotBar(sk, a, b, colorAt, w, sd) {
  sk.ink(dense([a, b]), { w: w + 13, seed: sd, wob: 0.6 });
  const n = 14;
  for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n + 0.02; sk.ink(dense([[a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0], [a[0] + (b[0] - a[0]) * Math.min(1, u1), a[1] + (b[1] - a[1]) * Math.min(1, u1)]]), { w, color: colorAt((u0 + u1) / 2), seed: sd, wob: 0, cap: "butt" }); }
}
const ironAt = u => mix(C.red, "#9AA3AD", Math.min(1, u * 1.25));

/* ---------- 1. 낮, 캠핑장: 해는 멀리 있는데 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  sun(sk, 836, 122, 56, { seed: 701 });
  ground(sk, 690, 11);
  tent(sk, 226, 688, 340, 300);
  // 쌤: 텐트 줄을 당긴다
  const pull = pose({ elL: [-70, -276], haL: [-124, -262], elR: [-10, -262], haR: [-76, -236], knL: [-34, -104], ftL: [-66, 0], knR: [30, -108], ftR: [64, 0], tilt: 0.06 });
  const fx = 610, fy = 690, fs = 0.6;
  sk.ink(dense([[226, 392], [fx - fs * 124, fy - fs * 262]]), { w: 6, color: "#8A6A4A", seed: 13, wob: 0.6 });
  drawFigure(sk, fx, fy, fs, pull, { ...CAMPER, name: "teacher" });
  // 햇볕이 등으로
  ray(sk, [776, 196], [668, 392], 15); ray(sk, [806, 222], [700, 430], 16); ray(sk, [742, 176], [640, 348], 17);
  drop(sk, 706, 318, 1.1);
  return sk;
}

/* ---------- 2. 저녁, 전도: 앗, 손잡이가 뜨거워! ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  moon(sk, 850, 112, 42);
  sparkle(sk, 720, 84, 9, { seed: 21, w: 3 }); sparkle(sk, 620, 150, 7, { seed: 22, w: 3 });
  ground(sk, 700, 23);
  brazier(sk, 690, 572, 300);
  // 쌤은 화로 옆에 비켜 서서 집게 끝만 숯에 댄다
  const P = pose({ elR: [78, -276], haR: [140, -250], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  const fx = 236, fy = 700, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...CAMPER, name: "teacher", hands: "L" });
  const hx = fx + fs * 140, hy = fy - fs * 250;
  hotBar(sk, [606, 556], [hx - 26, hy - 2], ironAt, 11, 25);
  handDot(sk, [hx, hy], C.skin, 27, 12);
  // 손잡이에서 올라오는 열
  for (const [dx, i] of [[-22, 0], [0, 1], [22, 2]]) sk.ink(squiggle(hx + dx, hy - 26, 44, 5, 2, i), { w: 5, color: C.red, seed: 28 + i, wob: 0 });
  emark(sk, hx + 70, hy - 76, 0.7, { color: C.red, rot: 0.2 });
  return sk;
}

/* ---------- 3. 전도, 확대: 흔들림의 릴레이 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  // 아래: 숯에 한쪽 끝을 댄 쇠집게
  for (const [cx, r, i] of [[52, 34, 0], [104, 28, 1], [78, 60, 2]]) { const c = circ(cx, 668 - (i === 2 ? 44 : 0), r * (i === 2 ? 0.5 : 1), { over: 0.15, seed: 31 + i, lump: 0.1 }); sk.fill(c, i % 2 ? C.orange : C.red, { dx: 0, dy: 0, wob: 0.6, seed: 34 + i }); sk.ink(c, { w: 7, color: "#8E2A1E", seed: 37 + i, wob: 0.6 }); }
  hotBar(sk, [96, 640], [900, 640], ironAt, 16, 41);
  // 돋보기 원
  const cx = 480, cy = 316, r = 240;
  sk.ink(dense([[404, 628], [cx - 150, cy + 186]]), { w: 5, color: C.gray, dash: [12, 10], seed: 43, wob: 0.4 });
  sk.ink(dense([[556, 628], [cx + 150, cy + 186]]), { w: 5, color: C.gray, dash: [12, 10], seed: 44, wob: 0.4 });
  const ring = circ(cx, cy, r, { over: 0.12, seed: 45 });
  sk.fill(ring, "#FFF9EC", { dx: 0, dy: 0, wob: 0.6, seed: 46 });
  // 한 줄로 늘어선 입자: 불 쪽(왼쪽)은 크게, 먼 쪽은 작게 흔들린다
  for (let i = 0; i < 6; i++) {
    const x = cx + (i - 2.5) * 74, t = 1 - i / 5 * 0.92, shakes = 3 - Math.floor(i / 2);
    for (let j = 0; j < shakes; j++) for (const sg of [-1, 1]) {
      const rr = 42 + j * 11, a0 = sg > 0 ? -0.55 : Math.PI - 0.55;
      sk.ink(ell(x, cy, rr, rr * 1.15, a0, a0 + 1.1), { w: 4.5, color: mix(heat(t), "#000000", 0.1), seed: 47 + i * 6 + j, wob: 0, alpha: 0.95 - j * 0.2 });
    }
    const b = circ(x, cy, 31, { over: 0.12, seed: 85 + i });
    sk.fill(b, heat(t), { dx: 0.8, dy: 1, wob: 0.5, seed: 91 + i }); sk.ink(b, { w: 8, seed: 97 + i, wob: 0.5 });
    sk.ink(curve([[x - 15, cy - 9], [x - 8, cy - 18], [x + 3, cy - 20]]), { w: 4, color: C.white, seed: 103 + i, wob: 0.2 });
    if (i < 5) arrow(sk, [[x + 16, cy - 104], [x + 58, cy - 104]], { w: 5, color: C.gray, seed: 109 + i, straight: true, head: 13, wob: 0.3 });
  }
  sk.ink(ring, { w: 13, seed: 115, color: "#B8892E" });
  return sk;
}

/* ---------- 4. 전도, 비교: 쇠는 뜨겁고 나무는 멀쩡 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  // 열화상 카메라의 화면(크게)
  const scr = rrect(396, 120, 530, 440, 30);
  sk.fill(scr, "#1F2A60", { dx: 0, dy: 0, wob: 0.6, seed: 121, tex: 0.5 });
  // 숯불
  for (const [x, y, r, t, i] of [[452, 300, 66, 0.9, 0], [448, 300, 40, 0.7, 1]]) { const c = circ(x, y, r, { over: 0.15, seed: 123 + i, lump: 0.08 }); sk.fill(c, i ? "#FFF0B8" : heat(t), { dx: 0, dy: 0, wob: 0.6, seed: 125 + i }); }
  // 쇠집게(끝이 이어진 두 가닥): 빨간색이 손잡이 쪽까지 번진다
  const metal = u => heat(1 - u * 0.42);
  hotBar(sk, [480, 232], [868, 214], metal, 13, 127); hotBar(sk, [480, 262], [868, 246], metal, 13, 129);
  sk.ink(ell(868, 230, 14, 17, -1.5, 1.5), { w: 13, color: metal(1), seed: 131, wob: 0 });
  // 나무젓가락(따로 떨어진 두 가닥): 끝만 빨갛다
  const wood = u => heat(Math.max(0.06, 1 - u * 5.2));
  hotBar(sk, [480, 352], [868, 370], wood, 10, 133); hotBar(sk, [480, 380], [868, 408], wood, 10, 135);
  // 색 눈금 띠(글자 없이)
  for (let i = 0; i < 12; i++) sk.ink(dense([[452 + i * 20, 508], [452 + (i + 1) * 20 + 1, 508]]), { w: 16, color: heat(i / 11), seed: 137, wob: 0, cap: "butt" });
  sk.ink(rrect(446, 496, 252, 24, 6), { w: 5, color: C.white, seed: 138, wob: 0.3 });
  sk.ink(scr, { w: 12, seed: 139 });
  // 쌤과 카메라
  const P = pose({ elR: [70, -290], haR: [124, -322], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  const fx = 170, fy = 704, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...CAMPER, name: "teacher", hands: "L" });
  const hx = fx + fs * 124, hy = fy - fs * 322;
  sk.ink(dense([[hx + 74, hy - 30], [396, 160]]), { w: 5, color: C.gray, dash: [12, 10], seed: 141, wob: 0.4 });
  sk.ink(dense([[hx + 74, hy + 14], [396, 520]]), { w: 5, color: C.gray, dash: [12, 10], seed: 142, wob: 0.4 });
  camera(sk, hx + 30, hy - 10, 541);
  handDot(sk, [hx, hy + 22], C.skin, 143, 11);
  return sk;
}

/* ---------- 5. 대류, 물: 주전자 속 물이 빙글빙글 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  ground(sk, 700, 151);
  // 버너와 파란 불꽃
  const stove = rrect(520, 618, 250, 76, 14);
  sk.fill(stove, "#8A9099", { seed: 153, tex: true, texAng: 0.04 }); sk.ink(stove, { w: 10, seed: 154 });
  sk.dot(560, 658, 9, "#3A3F47");
  for (let i = 0; i < 6; i++) { const x = 560 + i * 34; const f = curve([[x, 572], [x + 13, 598], [x + 8, 616], [x - 8, 616], [x - 13, 598]], true, 3); sk.fill(f, "#5BA8EE", { dx: 0, dy: 0, wob: 0.4, seed: 155 + i }); sk.ink(f, { w: 5, color: "#2F6DB5", seed: 161 + i, wob: 0.4 }); }
  // 속이 보이는 주전자
  sk.ink(curve([[520, 286], [500, 176], [645, 132], [790, 176], [770, 286]]), { w: 12, seed: 167 });
  const spout = curve([[826, 388], [900, 338], [924, 292], [898, 284], [874, 320], [820, 350]], true, 3);
  sk.fill(spout, "#B9C7D4", { dx: 0.8, dy: 1, wob: 0.6, seed: 168 }); sk.ink(spout, { w: 10, seed: 169 });
  const body = curve([[476, 288], [446, 420], [470, 540], [524, 568], [766, 568], [820, 540], [844, 420], [814, 288]], false, 5);
  const shell = [...body, body[0]];
  sk.fill(shell, "#D6EEFA", { dx: 0, dy: 0, wob: 0.8, seed: 170 });
  // 대류 화살표: 가운데는 위로(뜨거운 물), 양옆은 아래로(차가운 물)
  arrow(sk, [[622, 530], [620, 440], [612, 348]], { w: 10, color: C.red, seed: 171, wob: 0.5 });
  arrow(sk, [[668, 530], [670, 440], [678, 348]], { w: 10, color: C.red, seed: 172, wob: 0.5 });
  arrow(sk, [[576, 330], [516, 340], [498, 420], [512, 506]], { w: 10, color: C.blue, seed: 173, wob: 0.5 });
  arrow(sk, [[714, 330], [774, 340], [792, 420], [778, 506]], { w: 10, color: C.blue, seed: 174, wob: 0.5 });
  sk.ink(shell, { w: 12, seed: 175 });
  const lid = curve([[486, 290], [540, 250], [750, 250], [804, 290]], false, 4);
  sk.fill([...lid, lid[0]], "#9FB4C7", { dx: 0.8, dy: 1, wob: 0.6, seed: 176 }); sk.ink([...lid, lid[0]], { w: 11, seed: 177 });
  sk.fill(circ(645, 240, 13, { over: 0.2, seed: 178 }), C.ink, { dx: 0, dy: 0, wob: 0.3 });
  // 쌤
  const P = pose({ elR: [86, -306], haR: [156, -318], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  drawFigure(sk, 200, 700, 0.72, P, { ...CAMPER, name: "teacher" });
  return sk;
}

/* ---------- 6. 대류, 공기: 연기는 왜 위로 갈까 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 690, 181);
  // 연기와 불티
  for (const [x, len, ph, i] of [[520, 330, 0, 0], [568, 380, 1.4, 1], [612, 300, 2.6, 2]]) sk.ink(squiggle(x, 440, len, 22, 2.5, ph, i === 1 ? 0 : (i ? 0.06 : -0.06)), { w: 12, color: "#B8BDC4", seed: 183 + i, wob: 0.8 });
  for (const [x, y, r] of [[544, 360, 6], [596, 300, 5], [528, 240, 5], [600, 190, 4], [560, 130, 4], [640, 250, 5]]) sk.dot(x, y, r, C.yellow);
  campfire(sk, 566, 690, 1.12, 501);
  // 데워진 공기는 위로, 옆의 차가운 공기는 아래로 들어온다
  arrow(sk, [[716, 470], [730, 320], [714, 150]], { w: 12, color: C.red, seed: 187, wob: 0.6, head: 30 });
  arrow(sk, [[912, 520], [850, 620], [716, 652]], { w: 11, color: C.blue, seed: 188, wob: 0.6, head: 28 });
  arrow(sk, [[300, 560], [350, 640], [436, 656]], { w: 11, color: C.blue, seed: 189, wob: 0.6, head: 28 });
  // 친구: 위를 가리킨다
  const P = pose({ elL: [-100, -336], haL: [-156, -436], elR: [50, -260], haR: [24, -218], tilt: 0.08 });
  drawFigure(sk, 172, 690, 0.72, P, { ...FRIEND, name: "friend", mirror: true }); // 모자챙이 왼쪽을 보게 뒤집어 든 팔이 챙에 가리지 않게
  return sk;
}

/* ---------- 7. 복사: 닿지 않아도 뜨겁다 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  ground(sk, 694, 191);
  campfire(sk, 150, 694, 1.05, 511);
  // 불에서 곧게 날아오는 열. 친구가 막아서자 그 뒤로는 끊긴다
  for (const [y, i] of [[430, 0], [506, 1], [582, 2]]) {
    ray(sk, [246, y + 10], [404, y], 193 + i, { waves: 4 });
    sk.ink(dense([[560, y], [690, y - 4]]), { w: 5, color: "#C9CED6", dash: [10, 12], seed: 196 + i, wob: 0.3 });
  }
  const block = pose({ elL: [-70, -280], haL: [-96, -216], elR: [70, -280], haR: [96, -216] });
  drawFigure(sk, 480, 694, 0.72, block, { ...FRIEND, name: "friend" });
  const P = pose({ elR: [56, -262], haR: [30, -222], elL: [-56, -262], haL: [-30, -222], tilt: 0.1 });
  drawFigure(sk, 800, 694, 0.72, P, { ...CAMPER, name: "teacher" });
  qmark(sk, 916, 300, 0.7, { color: C.teal, seed: 199 });
  return sk;
}

/* ---------- 8. 밤: 사람 몸도 열을 내보내요 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  // 밤하늘
  const sky = [[-12, -12], [972, -12], ...curve([[972, 420], [760, 436], [480, 424], [220, 438], [-12, 426]], false, 5)];
  sky.push(sky[0]);
  sk.fill(sky, "#2C3A70", { dx: 0, dy: 0, wob: 0, seed: 201, tex: 0.6, texAng: 0.1 });
  moon(sk, 120, 108, 40);
  for (const [x, y, r, i] of [[300, 70, 9, 0], [420, 150, 6, 1], [760, 80, 8, 2], [880, 190, 6, 3], [600, 60, 5, 4], [220, 230, 5, 5]]) sparkle(sk, x, y, r, { seed: 203 + i, color: "#FFF3C4", w: 3 });
  tent(sk, 884, 462, 150, 130, { color: "#3F6B4A", seed: 531 });
  sk.ink(curve([[-12, 426], [220, 438], [480, 424], [760, 436], [972, 420]]), { w: 9, seed: 209 });
  // 카메라 화면: 어둠 속에서도 환한 친구
  const scr = rrect(380, 118, 300, 330, 26);
  sk.fill(scr, "#1F2A60", { dx: 0, dy: 0, wob: 0.6, seed: 211, tex: 0.5 });
  const bx = 530;
  for (const pts of [[[bx, 300], [bx, 372]], [[bx, 372], [bx - 34, 432]], [[bx, 372], [bx + 34, 432]], [[bx, 312], [bx - 56, 350]], [[bx, 312], [bx + 60, 262]]]) { sk.ink(dense(pts), { w: 30, color: heat(0.62), seed: 213, wob: 0.5 }); }
  for (const pts of [[[bx, 300], [bx, 372]], [[bx, 372], [bx - 34, 432]], [[bx, 372], [bx + 34, 432]], [[bx, 312], [bx - 56, 350]], [[bx, 312], [bx + 60, 262]]]) { sk.ink(dense(pts), { w: 15, color: heat(0.86), seed: 214, wob: 0.5 }); }
  const hd = circ(bx, 236, 56, { over: 0.15, seed: 215 });
  sk.fill(hd, heat(0.8), { dx: 0, dy: 0, wob: 0.6, seed: 216 });
  sk.fill(circ(bx, 236, 40, { over: 0.15, seed: 217 }), heat(0.99), { dx: 0, dy: 0, wob: 0.5, seed: 218 });
  sk.fill(circ(bx, 238, 24, { over: 0.15, seed: 219 }), "#FFF0B8", { dx: 0, dy: 0, wob: 0.4, seed: 220 });
  sk.ink(scr, { w: 12, seed: 221 });
  // 쌤과 카메라
  const P = pose({ elR: [70, -290], haR: [124, -322], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  const fx = 180, fy = 704, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...CAMPER, name: "teacher", hands: "L" });
  const hx = fx + fs * 124, hy = fy - fs * 322;
  sk.ink(dense([[hx + 74, hy - 30], [380, 150]]), { w: 5, color: C.gray, dash: [12, 10], seed: 223, wob: 0.4 });
  sk.ink(dense([[hx + 74, hy + 14], [380, 420]]), { w: 5, color: C.gray, dash: [12, 10], seed: 224, wob: 0.4 });
  camera(sk, hx + 30, hy - 10, 551);
  handDot(sk, [hx, hy + 22], C.skin, 225, 11);
  // 친구: 손을 흔든다
  const wave = pose({ elR: [84, -330], haR: [120, -424], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 772, 704, 0.66, wave, { ...FRIEND, name: "friend" });
  return sk;
}

const BUBBLES = [
  [{ who: "teacher", text: "등이 뜨끈해!", side: "right" }],
  [{ who: "teacher", text: "앗, 뜨거!" }],
  null,
  [{ who: "teacher", text: "나무는<br>멀쩡해!" }],
  [{ who: "teacher", text: "물이 돌고<br>있었네!" }],
  [{ who: "friend", text: "연기가<br>위로 가!" }],
  [{ who: "teacher", text: "어, 온기가<br>뚝!" }],
  [{ who: "teacher", text: "깜깜한데<br>보여!" }],
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7, p8].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
