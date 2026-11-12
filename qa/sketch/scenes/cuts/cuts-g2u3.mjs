// 중2 과학 Ⅲ단원(빛과 파동) 개념 컷 코드 그림.
// 목록은 Ⅲ단원 v5 세션이 낸 것(D:\Brilliant Science\output\g2-v5\u3\concept-cuts.md): g2u3l1 ~ g2u3l7b(단원 세션이 레슨을 끝낼 때마다 줄이 는다).
// 색의 뜻: 빛이 가는 길은 노란 주황(LIGHT) 화살표. 견주는 두 쪽(들어간 길과 나온 길)은 주황과 청록.
// 눈이 느끼는 길(연장선)과 실제 자리는 점선. 거울 속과 물속은 옅은 하늘색 면.
// 빛의 길은 눈대중이 아니라 계산으로 놓는다(반사 = 법선에 대칭, 굴절 = 스넬 법칙, 거울 상 = 거울 면에 대칭).
import { Sk, C, curve, dense, circ, ell, poly, rrect, arrow, emark } from "../../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { W, H, lerpx, lerp2, thin } from "./common.mjs";

const LIGHT = "#F2A31B", ORG = "#F08A2E", TEAL = "#12A594";
const ground = (sk, y, sd, x0 = 14, x1 = 946, o = {}) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd, ...o });
// 화면 좌표로 잡은 관절을 인물 좌표(발 사이 원점, 배율 s)로 바꾼다
const local = (ox, oy, s, j) => Object.fromEntries(Object.entries(j).map(([k, v]) => [k, Array.isArray(v) ? [(v[0] - ox) / s, (v[1] - oy) / s] : v]));
const box = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 6);
// 큐대: 굵은 쪽 a 에서 가는 쪽 b 로(끝에 파란 초크)
function cue(sk, a, b, sd) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const body = poly([[a[0] + nx * 6.5, a[1] + ny * 6.5], [b[0] + nx * 3, b[1] + ny * 3], [b[0] - nx * 3, b[1] - ny * 3], [a[0] - nx * 6.5, a[1] - ny * 6.5]], 4);
  sk.fill(body, "#EBCB8E", { dx: 0, dy: 0, wob: 0.2, seed: sd });
  const m = lerp2(a, b, 0.28);
  sk.fill(poly([[a[0] + nx * 6.5, a[1] + ny * 6.5], [m[0] + nx * 5.5, m[1] + ny * 5.5], [m[0] - nx * 5.5, m[1] - ny * 5.5], [a[0] - nx * 6.5, a[1] - ny * 6.5]], 4), "#8A5A33", { dx: 0, dy: 0, wob: 0.2, seed: sd + 1 });
  sk.ink(body, { w: 5, seed: sd + 2, wob: 0.3 });
  sk.ink(dense([lerp2(a, b, 0.975), b]), { w: 8, color: "#3F8FD8", seed: sd + 3, wob: 0 });
}

/* ---------- g2u3l1: 당구공이 쿠션에 맞고 같은 기울기로 튀어 나간다. 쿠션에 수직인 큐대가 법선 ---------- */
function cutL1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 700, s = 0.58;
  // 당구대(위에서 내려다본 모습이라 각이 그대로 보인다)
  const TX0 = 110, TX1 = 850, TY0 = 18, TY1 = 386, RAIL = 26;
  const FX0 = TX0 + RAIL, FX1 = TX1 - RAIL, FY0 = TY0 + RAIL, FY1 = TY1 - RAIL;
  const P = [480, FY0], DX = 222, DY = 250; // 쿠션에 닿는 점. 들어간 길과 나온 길은 법선(세로선)에 대칭
  const S = [P[0] - DX, P[1] + DY], E = [P[0] + DX, P[1] + DY];
  thin(sk, 0.75, () => {
    const outer = rrect(TX0, TY0, TX1 - TX0, TY1 - TY0, 26);
    sk.fill(outer, "#B9824A", { seed: 11, tex: true, texAng: 0.05 });
    const felt = rrect(FX0, FY0, FX1 - FX0, FY1 - FY0, 10);
    sk.fill(felt, "#A9DDBB", { dx: 0, dy: 0, wob: 0.4, seed: 13 });
    sk.ink(felt, { w: 7, seed: 14, wob: 0.6 });
    sk.ink(outer, { w: 11, seed: 12 });
    for (const [x, y, i] of [[FX0 + 4, FY0 + 4, 0], [FX1 - 4, FY0 + 4, 1], [FX0 + 4, FY1 - 4, 2], [FX1 - 4, FY1 - 4, 3]]) sk.fill(circ(x, y, 17, { over: 0, seed: 16 + i }), "#3A3F47", { dx: 0, dy: 0, wob: 0.3, seed: 20 + i });
  });
  // 두 각(법선과 길 사이): 같은 크기의 부채꼴
  const aS = Math.atan2(S[1] - P[1], S[0] - P[0]), aE = Math.atan2(E[1] - P[1], E[0] - P[0]), aN = Math.PI / 2, AR = 122;
  for (const [a0, a1, col, i] of [[aN, aS, ORG, 0], [aE, aN, TEAL, 1]]) {
    const arc = ell(P[0], P[1], AR, AR, a0, a1);
    sk.fill([P, ...arc, P], col, { dx: 0, dy: 0, wob: 0, seed: 31 + i, alpha: 0.3 });
    sk.ink(arc, { w: 7, color: col, seed: 33 + i, wob: 0.2 });
    const am = (a0 + a1) / 2; // 같다는 표시(짧은 눈금 하나씩)
    sk.ink(dense([[P[0] + (AR - 13) * Math.cos(am), P[1] + (AR - 13) * Math.sin(am)], [P[0] + (AR + 13) * Math.cos(am), P[1] + (AR + 13) * Math.sin(am)]]), { w: 6, color: col, seed: 35 + i, wob: 0 });
  }
  // 법선 노릇을 하는 큐대(쿠션에 수직)
  cue(sk, [P[0], FY1 - 8], [P[0], P[1] + 5], 41);
  // 들어간 길(주황)과 나온 길(청록)
  sk.ink(circ(S[0], S[1], 20, { over: 0.1, seed: 51 }), { w: 5, color: "#7E9A8A", dash: [9, 8], seed: 52, wob: 0.2 });
  const s1 = lerp2(S, P, 0.1), e1 = lerp2(P, E, 0.86);
  arrow(sk, [s1, lerp2(S, P, 0.6)], { w: 10, color: ORG, straight: true, seed: 53, head: 26, wob: 0.3 });
  sk.ink(dense([lerp2(S, P, 0.6), P]), { w: 10, color: ORG, seed: 55, wob: 0.3 });
  arrow(sk, [P, lerp2(P, E, 0.6)], { w: 10, color: TEAL, straight: true, seed: 57, head: 26, wob: 0.3 });
  sk.ink(dense([lerp2(P, E, 0.6), e1]), { w: 10, color: TEAL, seed: 59, wob: 0.3 });
  const b = circ(E[0], E[1], 21, { over: 0.1, seed: 61 });
  sk.fill(b, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 62 }); sk.ink(b, { w: 7, seed: 63, wob: 0.4 });
  // 학생: 방금 친 큐대를 세워 들고 공이 간 쪽을 가리킨다
  ground(sk, GY, 71);
  const kx = 178;
  const PK = pose({ elL: [-100, -290], haL: [-152, -268], elR: [100, -300], haR: [168, -372], tilt: -0.05 });
  cue(sk, [kx - s * 152 - 2, GY - 4], [kx - s * 152 + 4, GY - 318], 75);
  drawFigure(sk, kx, GY, s, PK, { ...STUDENT, name: "student" });
  handDot(sk, [kx - s * 152, GY - s * 268], C.skin, 79, 15 * s);
  // 쌤: 큐대(법선) 바로 앞에서 두 팔을 양쪽 길 쪽으로 벌려 견준다
  const PT = pose({ elL: [-112, -300], haL: [-200, -388], elR: [112, -300], haR: [200, -388] });
  drawFigure(sk, P[0], GY, s, PT, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- g2u3l2: 수면 위의 머리와 물속의 몸통이 어긋나 보이는 물개 ---------- */
function cutL2() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 668, X0 = 340, X1 = 760, RIM = 438, WY = 470, BOT = 662, N = 1.33;
  ground(sk, GY, 11);
  // 학생(왼쪽, 수조를 내려다본다)과 눈의 자리
  const kx = 230, ks = 0.72, EYE = [kx + 50, GY - ks * 436 + 4];
  // 물개의 한 점 T 에서 나온 빛이 수면의 Q 에서 꺾여 눈으로 간다: 1.33 sin(물속 각) = sin(공기 중 각)
  const SX = -50, T = [562 + SX, 628]; // SX: 물개를 학생 쪽으로 당긴 만큼
  let lo = EYE[0], hi = T[0];
  for (let i = 0; i < 40; i++) {
    const q = (lo + hi) / 2;
    const sa = (q - EYE[0]) / Math.hypot(q - EYE[0], WY - EYE[1]), sw = (T[0] - q) / Math.hypot(T[0] - q, T[1] - WY);
    if (N * sw > sa) lo = q; else hi = q;
  }
  const Q = [(lo + hi) / 2, WY];
  const slope = (WY - EYE[1]) / (Q[0] - EYE[0]);
  const A = [T[0], WY + (T[0] - Q[0]) * slope]; // 눈이 느끼는 자리(공기 중 빛을 거슬러 곧게 이은 선 위)
  const K = (A[1] - WY) / (T[1] - WY);          // 떠 보이는 비율. 물속 몸통 전체를 이 비율로 끌어올려 그린다
  const up = p => [p[0], WY + (p[1] - WY) * K];
  // 물
  sk.fill(box(X0 + 6, WY, X1 - 6, BOT), "#CFE9F7", { dx: 0, dy: 0, wob: 0.3, seed: 21 });
  // 물속 몸통: 실제 자리(점선)와 보이는 자리(떠오른 자리, 칠한 몸통)
  const SEAL = "#9AA7B4";
  sk.save(); sk.translate(SX, 0);
  const side = [[589, WY], [564, 522], [544, 574], [528, 620], [536, 646], [566, 652], [596, 630], [626, 588], [650, 530], [661, WY]];
  const real = curve(side, false, 4);
  sk.ink(real, { w: 7, color: "#557F9E", dash: [12, 9], seed: 23, wob: 0.2 });
  const seen = curve(side.map(up), false, 4);
  sk.fill([...seen, seen[0]], SEAL, { dx: 0, dy: 0, wob: 0.3, seed: 25 });
  sk.ink(seen, { w: 9, seed: 26, wob: 0.6 });
  // 수면 위: 목과 머리(실제 자리 그대로)
  const neck = [...curve([[589, WY], [600, 446], [612, 424]], false, 4), ...curve([[690, 424], [678, 448], [661, WY]], false, 4)];
  sk.fill([...neck, neck[0]], SEAL, { dx: 0, dy: 0, wob: 0.3, seed: 31 });
  sk.ink(curve([[589, WY], [600, 446], [612, 424]], false, 4), { w: 9, seed: 32, wob: 0.5 });
  sk.ink(curve([[690, 424], [678, 448], [661, WY]], false, 4), { w: 9, seed: 33, wob: 0.5 });
  const head = circ(652, 396, 47, { over: 0.1, seed: 34 });
  sk.fill(head, SEAL, { dx: 0, dy: 0, wob: 0.4, seed: 35 }); sk.ink(head, { w: 9, seed: 36, wob: 0.6 });
  const sn = ell(612, 406, 22, 16);
  sk.fill(sn, "#C3CCD5", { dx: 0, dy: 0, wob: 0.3, seed: 37 }); sk.ink(sn, { w: 7, seed: 38, wob: 0.4 });
  sk.dot(594, 400, 6); sk.dot(640, 380, 6);
  for (const [dy, i] of [[-8, 0], [2, 1], [12, 2]]) sk.ink(dense([[606, 410 + dy * 0.4], [578, 412 + dy * 1.5]]), { w: 3.5, seed: 39 + i, wob: 0.2 });
  sk.restore();
  // 수조와 수면
  thin(sk, 0.8, () => {
    sk.ink(curve([[X0 + 6, WY + 1], [450, WY - 3], [560, WY + 2], [660, WY - 2], [X1 - 6, WY + 1]]), { w: 8, color: "#3F8FC8", seed: 41, wob: 0.6 });
    sk.ink(dense([[X0, RIM], [X0, BOT + 2], [X1, BOT + 2], [X1, RIM]]), { w: 11, seed: 42 });
    sk.ink(dense([[X0 + 16, RIM + 44], [X0 + 16, BOT - 30]]), { w: 5, color: C.white, seed: 43, wob: 0.2 });
  });
  // 빛의 길: 물속에서 수면까지, 수면에서 꺾여 눈으로. 눈이 느끼는 길은 점선
  sk.ink(dense([[Q[0], WY - 62], [Q[0], WY + 62]]), { w: 4, color: C.gray, dash: [8, 7], seed: 51, wob: 0 });
  sk.ink(dense([Q, A]), { w: 6, color: LIGHT, dash: [10, 9], seed: 52, wob: 0 });
  sk.ink(dense([T, Q]), { w: 9, color: LIGHT, seed: 53, wob: 0.3 });
  const tip = lerp2(Q, EYE, 0.8);
  arrow(sk, [Q, tip], { w: 9, color: LIGHT, straight: true, seed: 54, head: 24, wob: 0.3 });
  sk.dot(T[0], T[1], 8, LIGHT);
  // 학생: 깜짝 놀라 한 팔을 든다
  const PK = pose({ elL: [-104, -300], haL: [-176, -384], elR: [62, -262], haR: [110, -212], tilt: 0.1 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student" });
  emark(sk, kx + 104, GY - ks * 436 - 138, 0.95);
  // 쌤: 수면을 가리킨다
  const PT = pose({ elR: [102, -292], haR: [178, -322], tilt: 0.05 });
  drawFigure(sk, 872, GY, 0.6, PT, { ...TEACHER, name: "teacher", mirror: true });
  return sk;
}

/* ---------- g2u3l3: 영사기의 빛이 스크린에 닿았다가 객석의 눈으로 온다 ---------- */
function cutL3() {
  const sk = new Sk(W, H, { id: "c" });
  const GY = 668, BAND = 262;
  // 어두운 영화관은 위쪽 띠로만
  sk.fill(box(0, 0, W, BAND), "#27304A", { dx: 0, dy: 0, wob: 0, seed: 11 });
  // 스크린
  const SX0 = 50, SX1 = 340, SY0 = 64, SY1 = 344, SC = [206, 204];
  const scr = rrect(SX0, SY0, SX1 - SX0, SY1 - SY0, 8);
  sk.fill(scr, "#FFF6CF", { dx: 0, dy: 0, wob: 0.3, seed: 13 });
  // 영사기의 빛(부채꼴)
  const PX = 36, LENS = [770 + PX, 162];
  sk.fill(poly([LENS, [SC[0], SY0 + 26], [SC[0], SY1 - 26]], 6), "#FFE08A", { dx: 0, dy: 0, wob: 0, seed: 15, alpha: 0.42 });
  // 스크린에 비친 그림(산과 해)
  sk.fill(poly([[86, 318], [156, 206], [198, 262], [236, 218], [306, 318]], 4), "#9CCB8E", { dx: 0, dy: 0, wob: 0.4, seed: 17 });
  sk.fill(circ(262, 134, 26, { over: 0, seed: 18 }), "#F7B955", { dx: 0, dy: 0, wob: 0.3, seed: 19 });
  thin(sk, 0.8, () => sk.ink(scr, { w: 10, seed: 14 }));
  // 영사기(높은 삼각대 위)
  thin(sk, 0.78, () => {
    for (const [x, i] of [[800 + PX, 0], [844 + PX, 1], [888 + PX, 2]]) sk.ink(dense([[844 + PX, 196], [x, GY]]), { w: 9, seed: 21 + i });
    for (const [x, i] of [[818 + PX, 0], [868 + PX, 1]]) {
      const r = circ(x, 112, 23, { over: 0.1, seed: 25 + i });
      sk.fill(r, "#AEB9C8", { dx: 0, dy: 0, wob: 0.3, seed: 27 + i }); sk.ink(r, { w: 8, seed: 29 + i, wob: 0.4 });
      sk.dot(x, 112, 6, "#27304A");
    }
    const body = rrect(790 + PX, 132, 106, 64, 10);
    sk.fill(body, "#D3DAE4", { dx: 0, dy: 0, wob: 0.3, seed: 31 }); sk.ink(body, { w: 10, seed: 32 });
    const lens = rrect(766 + PX, 147, 26, 30, 5);
    sk.fill(lens, "#8FA0B5", { dx: 0, dy: 0, wob: 0.3, seed: 33 }); sk.ink(lens, { w: 8, seed: 34 });
  });
  ground(sk, GY, 41);
  // 객석의 학생(스크린을 본다)
  const HP = [572, 580], s = 0.66;
  thin(sk, 0.8, () => {
    sk.ink(dense([[HP[0] + 4, HP[1] + 34], [HP[0] + 4, GY]]), { w: 14, seed: 43 });
    const back = rrect(HP[0] + 22, HP[1] - 128, 32, 150, 12);
    sk.fill(back, "#D9534F", { dx: 0, dy: 0, wob: 0.3, seed: 44, tex: 0.7 }); sk.ink(back, { w: 9, seed: 45 });
    const seat = rrect(HP[0] - 58, HP[1] + 10, 114, 28, 11);
    sk.fill(seat, "#D9534F", { dx: 0, dy: 0, wob: 0.3, seed: 46, tex: 0.7 }); sk.ink(seat, { w: 9, seed: 47 });
  });
  const HEAD = [HP[0] - 10, HP[1] - 148];
  const PS = pose(local(HP[0], GY, s, { hip: HP, neck: [HP[0] - 4, HP[1] - 86], head: HEAD,
    knL: [HP[0] - 62, HP[1] + 2], ftL: [HP[0] - 68, GY], knR: [HP[0] - 56, HP[1] - 4], ftR: [HP[0] - 50, GY - 2],
    elL: [HP[0] - 24, HP[1] - 44], haL: [HP[0] - 56, HP[1] - 14], elR: [HP[0] - 16, HP[1] - 40], haR: [HP[0] - 46, HP[1] - 8], tilt: 0.36 }));
  drawFigure(sk, HP[0], GY, s, PS, { ...STUDENT, name: "student", flip: -1 });
  // 쌤: 한 팔은 영사기 쪽, 한 팔은 스크린과 학생 쪽
  const PT = pose({ elR: [100, -304], haR: [150, -380], elL: [-106, -286], haL: [-176, -262], tilt: -0.04 });
  drawFigure(sk, 742, GY, 0.58, PT, { ...TEACHER, name: "teacher" });
  // 빛의 길 둘: 영사기에서 스크린으로, 스크린에서 눈으로
  arrow(sk, [lerp2(LENS, SC, 0.06), lerp2(LENS, SC, 0.72)], { w: 11, color: LIGHT, straight: true, seed: 51, head: 30, wob: 0.3 });
  const eye = [HEAD[0] - 50, HEAD[1] + 24], from = [318, 322];
  arrow(sk, [from, lerp2(from, eye, 0.8)], { w: 11, color: LIGHT, straight: true, seed: 55, head: 30, wob: 0.3 });
  return sk;
}

/* ---------- g2u3l4: 거울 앞과 거울 속, 같은 거리에 같은 크기로 마주 선 모습 ---------- */
function cutL4() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 636, MX = 480, kx = 292, ks = 0.76, tx = 78, ts = 0.58, GLASS = "#E4F1F8";
  const mir = x => 2 * MX - x; // 거울 면에 대칭인 자리
  // 거울 속(옅은 하늘색 면)
  sk.fill(box(MX, 50, 948, 704), GLASS, { dx: 0, dy: 0, wob: 0, seed: 11 });
  for (const [x, i] of [[560, 0], [600, 1]]) sk.ink(dense([[x + 60, 78], [x, 168]]), { w: 7, color: C.white, seed: 13 + i, wob: 0.3 });
  const PK = pose({ elL: [-124, -352], haL: [-176, -468], elR: [70, -262], haR: [104, -196], tilt: 0.03 });
  const PT = pose({ elR: [84, -262], haR: [152, -200], tilt: 0.06 });
  // 줄자: 발에서 거울까지. 거울 속에도 같은 길이로 놓인다(눈금 칸 수가 같다)
  const D = MX - kx, TY = 654, TH = 26, NT = 10;
  const tape = (x0, x1, sd, reelX) => {
    const strip = box(x0, TY, x1, TY + TH);
    sk.fill(strip, "#FFD84A", { dx: 0, dy: 0, wob: 0.2, seed: sd });
    thin(sk, 0.8, () => {
      sk.ink(strip, { w: 7, seed: sd + 1, wob: 0.4 });
      for (let i = 1; i < NT; i++) { const x = lerpx(x0, x1, i / NT); sk.ink(dense([[x, TY + 1], [x, TY + (i === NT / 2 ? 17 : 11)]]), { w: 4, seed: sd + 2 + i, wob: 0 }); }
      const reel = rrect(reelX - 22, TY - 8, 44, TH + 16, 9);
      sk.fill(reel, "#E0503A", { dx: 0, dy: 0, wob: 0.2, seed: sd + 20 }); sk.ink(reel, { w: 8, seed: sd + 21 });
    });
  };
  // 거울 속의 상: 거울 면에 대칭(같은 거리, 같은 크기, 좌우가 바뀐 모습)
  ground(sk, GY, 21, MX + 6, 946, { color: "#7F9FB3" });
  tape(MX, MX + D, 31, mir(kx - 22));
  drawFigure(sk, mir(tx), GY, ts, PT, { ...TEACHER, mirror: true });
  drawFigure(sk, mir(kx), GY, ks, PK, { ...STUDENT, name: "image", mirror: true });
  sk.fill(box(MX, 50, 948, 704), GLASS, { dx: 0, dy: 0, wob: 0, seed: 12, alpha: 0.42 }); // 유리 너머라 살짝 옅게
  // 거울 앞
  ground(sk, GY, 23, 14, MX - 6);
  tape(kx, MX, 61, kx - 22);
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher" });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student" });
  // 거울(옆에서 본 유리판)
  thin(sk, 0.8, () => {
    const pane = rrect(MX - 7, 44, 14, 664, 5);
    sk.fill(pane, "#A9D4EA", { dx: 0, dy: 0, wob: 0.2, seed: 91 }); sk.ink(pane, { w: 8, seed: 92, wob: 0.5 });
  });
  return sk;
}

/* ---------- g2u3l5: 천장 구석의 볼록 거울(넓고 작게)과 얼굴을 바짝 댄 오목 거울(크고 바로) ---------- */
const COLS3 = ["#E0503A", "#3F8FD8", "#F2B63A"];
function cutL5() {
  const sk = new Sk(W, H, { id: "e" });
  const GY = 668, kx = 205, ks = 0.7, AY = GY - ks * 436, MX = 352, MAG = 1.6, GLASS = "#E4F1F8";
  ground(sk, GY, 11);
  // 천장과 벽의 구석, 뒤쪽 진열대
  thin(sk, 0.7, () => {
    sk.ink(dense([[590, 40], [934, 40], [934, 318]]), { w: 8, color: C.gray, seed: 12, wob: 0.6 });
    const fr = box(772, 336, 930, GY - 4);
    sk.fill(fr, "#F3EEE4", { dx: 0, dy: 0, wob: 0.2, seed: 13 });
    const cols = ["#E0503A", "#3F8FD8", "#F2B63A", "#3FAE5A", "#F08A2E"];
    for (let r = 0; r < 3; r++) {
      const by = 430 + r * 100;
      for (let i = 0; i < 4; i++) { const bx = 786 + i * 35, bh = 44 + ((i * 7 + r * 5) % 3) * 9; const b = rrect(bx, by - bh, 27, bh, 4); sk.fill(b, cols[(i + r * 2) % 5], { dx: 0, dy: 0, wob: 0.2, seed: 15 + r * 9 + i }); sk.ink(b, { w: 5, seed: 16 + r * 9 + i, wob: 0.3 }); }
      sk.ink(dense([[772, by], [930, by]]), { w: 8, seed: 50 + r });
    }
    sk.ink(fr, { w: 9, seed: 14 });
  });
  // 볼록 거울: 가운데가 볼록 나온 둥근 거울. 가게 안이 넓고 작게, 바로 선 모습으로 비친다
  const DC = [836, 140], DR = 98;
  thin(sk, 0.8, () => {
    sk.ink(dense([[930, 44], [DC[0] + 60, DC[1] - 60]]), { w: 12, seed: 61 });
    const back = ell(DC[0] + 20, DC[1] - 16, DR - 4, DR - 4);
    sk.fill(back, "#8FA0B5", { dx: 0, dy: 0, wob: 0.3, seed: 62 }); sk.ink(back, { w: 8, seed: 63, wob: 0.4 });
    const dome = circ(DC[0], DC[1], DR, { over: 0.06, seed: 64 });
    sk.fill(dome, "#DCEBF4", { dx: 0, dy: 0, wob: 0.3, seed: 65 });
    // 비친 가게(작게, 굽어 보인다)
    sk.ink(curve([[DC[0] - 76, DC[1] + 34], [DC[0], DC[1] + 52], [DC[0] + 70, DC[1] + 30]]), { w: 4, color: "#7F9FB3", seed: 67, wob: 0.2 });
    for (const [dx, i] of [[-62, 0], [36, 1]]) {
      const sh = poly([[DC[0] + dx, DC[1] - 26 + i * 4], [DC[0] + dx + 26, DC[1] - 30 + (1 - i) * 8], [DC[0] + dx + 26, DC[1] + 36 - i * 2], [DC[0] + dx, DC[1] + 34 + i * 4]], 3);
      sk.fill(sh, "#F3EEE4", { dx: 0, dy: 0, wob: 0.1, seed: 68 + i }); sk.ink(sh, { w: 4, seed: 70 + i, wob: 0.2 });
      for (let r = 0; r < 3; r++) sk.dot(DC[0] + dx + 13, DC[1] - 14 + r * 18, 5, COLS3[(r + i) % 3]);
    }
    drawFigure(sk, DC[0] - 2, DC[1] + 48, 0.15, pose({ elR: [70, -262], haR: [104, -196] }), { ...STUDENT, lw: 30 });
    sk.ink(dome, { w: 9, seed: 72, wob: 0.5 });
    sk.ink(ell(DC[0], DC[1], DR - 16, DR - 16, 3.5, 4.3), { w: 7, color: C.white, seed: 73, wob: 0.2 });
  });
  // 오목 거울 속에 보이는 얼굴: 거울 뒤로 더 멀리, 더 크게, 바로 선 모습(좌우는 바뀐다)
  const ix = MX + (MX - kx) * MAG;
  sk.fill(ell(ix - 30, AY, 204, 152), GLASS, { dx: 0, dy: 0, wob: 0.6, seed: 81 });
  sk.save(); sk.translate(ix, AY); sk.scale(ks * MAG); drawHead(sk, { ...STUDENT, flip: -1 }); sk.restore();
  sk.fill(ell(ix - 30, AY, 204, 152), GLASS, { dx: 0, dy: 0, wob: 0.6, seed: 81, alpha: 0.45 });
  // 계산대
  thin(sk, 0.8, () => {
    for (const [x, i] of [[330, 0], [690, 1]]) sk.ink(dense([[x, 562], [x, GY]]), { w: 12, seed: 83 + i });
    const top = rrect(296, 540, 428, 24, 8);
    sk.fill(top, C.wood, { seed: 85, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 86 });
  });
  // 오목 거울(옆모습): 가운데가 오목하게 들어가 얼굴을 감싸는 쪽으로 굽었다
  const RC = 224, A0 = 0.5;
  const front = ell(MX - RC, AY, RC, RC, -A0, A0), backA = ell(MX - RC, AY, RC + 15, RC + 15, A0, -A0);
  thin(sk, 0.8, () => {
    sk.ink(dense([[MX + 10, AY + 60], [MX + 10, 540]]), { w: 10, seed: 91 });
    const base = rrect(MX - 26, 528, 72, 14, 6);
    sk.fill(base, "#8FA0B5", { dx: 0, dy: 0, wob: 0.2, seed: 92 }); sk.ink(base, { w: 8, seed: 93 });
    const shell = [...front, ...backA, front[0]];
    sk.fill(shell, "#8FC6E4", { dx: 0, dy: 0, wob: 0.2, seed: 94 }); sk.ink(shell, { w: 8, seed: 95, wob: 0.4 });
  });
  // 학생: 얼굴을 거울에 바짝 댄다
  const PK = pose({ elR: [84, -250], haR: [150, -196], tilt: 0.04 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- g2u3l5b: 돋보기(볼록 렌즈)로는 개미가 크게, 안경알(오목 렌즈) 너머로는 나무가 작게 ---------- */
function ant(sk, x, y, k, sd) {
  sk.at(x, y, k, () => {
    for (const [lx, i] of [[-10, 0], [0, 1], [10, 2]]) for (const sg of [-1, 1]) sk.ink(curve([[lx, 0], [lx + sg * 4 + (i - 1) * 5, sg * 9], [lx + (i - 1) * 9, sg * 15]]), { w: 2.2, seed: sd + i * 2 + (sg > 0 ? 1 : 0), wob: 0 });
    for (const sg of [-1, 1]) sk.ink(curve([[17, 0], [23, sg * 6], [29, sg * 7]]), { w: 2, seed: sd + 8 + sg, wob: 0 });
    for (const [cx, rx, ry] of [[-13, 9, 6.5], [0, 6, 4.5], [13, 6.5, 5.5]]) sk.fill(ell(cx, 0, rx, ry), "#2B2B2E", { dx: 0, dy: 0, wob: 0, seed: sd + 10 });
  });
}
// 렌즈의 옆모습(단면) 기호: kind = "convex"(가운데가 두껍다) | "concave"(가장자리가 두껍다)
function lensGlyph(sk, x, y, kind, sd) {
  const h = 40, pts = [];
  const prof = t => kind === "convex" ? 3 + 13 * (1 - t * t) : 5 + 12 * t * t; // 반 두께
  for (let i = 0; i <= 20; i++) { const t = -1 + i / 10; pts.push([x + prof(t), y + t * h]); }
  for (let i = 20; i >= 0; i--) { const t = -1 + i / 10; pts.push([x - prof(t), y + t * h]); }
  pts.push(pts[0]);
  sk.fill(pts, "#BFE3F4", { dx: 0, dy: 0, wob: 0, seed: sd });
  sk.ink(pts, { w: 5, color: "#2F7FB8", seed: sd + 1, wob: 0.2 });
}
function tree(sk, x, gy, top, r, sd, k = 1) {
  sk.ink(dense([[x, gy], [x, top + r]]), { w: 16 * k, color: "#8A5A33", seed: sd, wob: 0.4 * k });
  const cr = circ(x, top, r, { over: 0.1, seed: sd + 1, lump: 0.05 });
  sk.fill(cr, "#7CC58A", { dx: 0, dy: 0, wob: 0.4, seed: sd + 2, tex: k === 1 ? 0.8 : false }); sk.ink(cr, { w: 9 * k, seed: sd + 3, wob: 0.8 * k });
}
function cutL5b() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 660;
  // 풀밭과 멀리 선 나무
  ground(sk, GY, 11, 14, 946, { color: "#4E9A5B" });
  for (const [x, i] of [[60, 0], [330, 1], [470, 2], [720, 3], [930, 4]]) for (const d of [-9, 0, 9]) sk.ink(dense([[x + d, GY], [x + d * 1.8, GY - 16]]), { w: 5, color: "#4E9A5B", seed: 13 + i * 3 + d, wob: 0.2 });
  thin(sk, 0.85, () => tree(sk, 884, GY, 236, 62, 21));
  // 학생: 돋보기로 개미를 내려다본다
  const kx = 180, ks = 0.7, LC = [400, 584], LR = 68;
  const PK = pose({ elR: [96, -262], haR: [168, -206], tilt: 0.22, head: [10, -432] });
  const hand = [kx + ks * 168, GY - ks * 206];
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  const ang = Math.atan2(hand[1] - LC[1], hand[0] - LC[0]);
  sk.ink(dense([[LC[0] + (LR + 4) * Math.cos(ang), LC[1] + (LR + 4) * Math.sin(ang)], [hand[0] + 16 * Math.cos(ang), hand[1] + 16 * Math.sin(ang)]]), { w: 16, color: "#8A5A33", seed: 31, wob: 0.3 });
  const lens = circ(LC[0], LC[1], LR, { over: 0.05, seed: 32 });
  sk.fill(lens, "#E8F5FB", { dx: 0, dy: 0, wob: 0.2, seed: 33 });
  ant(sk, LC[0] + 2, LC[1] + 8, 2.5, 35);                       // 돋보기 속: 크고 바로
  sk.ink(lens, { w: 13, color: "#B8892E", seed: 34, wob: 0.4 });
  sk.ink(ell(LC[0], LC[1], LR - 15, LR - 15, 3.5, 4.4), { w: 6, color: C.white, seed: 36, wob: 0.2 });
  handDot(sk, hand, C.skin, 37, 15 * ks);
  for (const [x, i] of [[500, 0], [552, 1]]) ant(sk, x, GY - 12, 0.85, 41 + i * 12); // 맨눈으로 본 개미
  // 쌤: 벗어 든 안경. 안경알 너머로 나무가 작게, 바로 보인다
  const tx = 622, ts = 0.66;
  const PT = pose({ elR: [108, -292], haR: [160, -356], tilt: -0.04 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, glasses: false, name: "teacher", hands: "L" });
  const G1 = [778, 412], G2 = [886, 412], GR = 48, th = [tx + ts * 160, GY - ts * 356];
  sk.ink(dense([th, [G1[0] - GR, G1[1] - 6]]), { w: 7, seed: 61, wob: 0.3 });
  for (const [g, i] of [[G1, 0], [G2, 1]]) {
    const c = circ(g[0], g[1], GR, { over: 0.06, seed: 63 + i });
    sk.fill(c, "#F2FAFD", { dx: 0, dy: 0, wob: 0.2, seed: 65 + i });
    sk.ink(dense([[g[0] - 32, g[1] + 22], [g[0] + 32, g[1] + 22]]), { w: 3.5, color: "#4E9A5B", seed: 67 + i, wob: 0.2 });
    if (i === 1) sk.at(g[0] - 2, g[1] + 22, 0.5, () => tree(sk, 0, 0, -78, 26, 71, 0.9));
    sk.ink(c, { w: 8, seed: 69 + i, wob: 0.5 });
  }
  sk.ink(curve([[G1[0] + GR, G1[1] - 6], [(G1[0] + G2[0]) / 2, G1[1] - 15], [G2[0] - GR, G2[1] - 6]]), { w: 7, seed: 75, wob: 0.3 });
  handDot(sk, th, C.skin, 77, 15 * ts);
  // 두 렌즈의 옆모습
  sk.ink(dense([[LC[0] + LR + 12, LC[1] - 6], [506, 548]]), { w: 4, color: C.gray, dash: [7, 7], seed: 81, wob: 0 });
  lensGlyph(sk, 530, 536, "convex", 83);
  sk.ink(dense([[G1[0] - 10, G1[1] + GR + 10], [792, 520]]), { w: 4, color: C.gray, dash: [7, 7], seed: 85, wob: 0 });
  lensGlyph(sk, 796, 566, "concave", 87);
  return sk;
}

/* ---------- g2u3l6: 빨강, 초록, 파랑 조명 셋이 한 자리에 모이면 가운데가 하얗다 ---------- */
function cutL6() {
  const sk = new Sk(W, H, { id: "g" });
  const GY = 676, BAND = 214, CX = 420, CY = 560, R = 122, D = 76, KY = 0.46;
  const RED = "#F2493A", GRN = "#3DBE55", BLU = "#3F6FE8", YEL = "#FFE23D", MAG = "#EA62D6", CYA = "#4FD9EA";
  const cen = [[0, -D], [-D * 0.866, D * 0.5], [D * 0.866, D * 0.5]]; // 빨강(뒤), 초록(왼쪽 앞), 파랑(오른쪽 앞)
  const scr = p => [CX + p[0], CY + p[1] * KY];
  const disc = c => { const o = []; for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 2; o.push(scr([c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)])); } return o; };
  const inter = cs => { // 원들이 겹친 곳의 테두리
    const pts = [];
    for (const c of cs) for (let i = 0; i < 240; i++) { const a = i / 240 * Math.PI * 2, p = [c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)]; if (cs.every(o => Math.hypot(p[0] - o[0], p[1] - o[1]) <= R + 1e-6)) pts.push(p); }
    const m = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
    pts.sort((a, b) => Math.atan2(a[1] - m[1], a[0] - m[0]) - Math.atan2(b[1] - m[1], b[0] - m[0]));
    return [...pts, pts[0]].map(scr);
  };
  // 어두운 공연장은 위쪽 띠로만. 무대 바닥은 옅은 회색 판
  sk.fill(box(0, 0, W, BAND), "#27304A", { dx: 0, dy: 0, wob: 0, seed: 11 });
  const mat = ell(CX, CY + 2, 316, 106);
  sk.fill(mat, "#D5D9E0", { dx: 0, dy: 0, wob: 0.6, seed: 13 });
  thin(sk, 0.7, () => sk.ink(mat, { w: 7, color: "#9AA3B0", seed: 14, wob: 0.8 }));
  ground(sk, GY, 15);
  // 조명 셋과 빛줄기
  const lampX = [CX, CX - 190, CX + 190], col = [RED, GRN, BLU], LY = 112;
  thin(sk, 0.8, () => sk.ink(dense([[CX - 300, 52], [CX + 300, 52]]), { w: 12, color: "#C9D2DE", seed: 17, wob: 0.6 }));
  for (const i of [1, 2, 0]) {
    const c = scr(cen[i]);
    sk.fill(poly([[lampX[i] - 16, LY + 20], [lampX[i] + 16, LY + 20], [c[0] + R, c[1]], [c[0] - R, c[1]]], 6), col[i], { dx: 0, dy: 0, wob: 0, seed: 21 + i, alpha: 0.2 });
  }
  thin(sk, 0.8, () => {
    for (let i = 0; i < 3; i++) {
      sk.ink(dense([[lampX[i], 54], [lampX[i], LY - 30]]), { w: 8, color: "#C9D2DE", seed: 25 + i, wob: 0.2 });
      const body = poly([[lampX[i] - 20, LY - 32], [lampX[i] + 20, LY - 32], [lampX[i] + 30, LY + 20], [lampX[i] - 30, LY + 20]], 4);
      sk.fill(body, "#D3DAE4", { dx: 0, dy: 0, wob: 0.2, seed: 28 + i }); sk.ink(body, { w: 8, seed: 31 + i, wob: 0.4 });
      const gl = ell(lampX[i], LY + 22, 30, 9);
      sk.fill(gl, col[i], { dx: 0, dy: 0, wob: 0.1, seed: 34 + i }); sk.ink(gl, { w: 6, seed: 37 + i, wob: 0.3 });
    }
  });
  // 바닥의 빛: 하나씩, 둘이 겹친 곳, 셋이 겹친 가운데
  for (let i = 0; i < 3; i++) sk.fill(disc(cen[i]), col[i], { dx: 0, dy: 0, wob: 0, seed: 41 + i });
  sk.fill(inter([cen[0], cen[1]]), YEL, { dx: 0, dy: 0, wob: 0, seed: 45 });
  sk.fill(inter([cen[0], cen[2]]), MAG, { dx: 0, dy: 0, wob: 0, seed: 46 });
  sk.fill(inter([cen[1], cen[2]]), CYA, { dx: 0, dy: 0, wob: 0, seed: 47 });
  sk.fill(inter(cen), C.white, { dx: 0, dy: 0, wob: 0, seed: 48 });
  thin(sk, 0.7, () => { for (let i = 0; i < 3; i++) sk.ink(disc(cen[i]), { w: 6, seed: 51 + i, wob: 0.5 }); });
  // 쌤: 조명 셋을 손가락 셋으로 센다
  const tx = 836, ts = 0.64;
  const PT = pose({ elL: [-108, -300], haL: [-168, -392], elR: [60, -262], haR: [96, -196], tilt: -0.05 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher", hands: "R" });
  const hx = tx - ts * 168, hy = GY - ts * 392;
  for (const [dx, i] of [[-24, 0], [0, 1], [24, 2]]) {
    const fg = dense([[hx + dx * 0.3, hy - 4], [hx + dx, hy - 50 - (i === 1 ? 6 : 0)]]);
    sk.ink(fg, { w: 14, seed: 61 + i, wob: 0.3 });
    sk.ink(fg, { w: 7.5, color: C.skin, seed: 64 + i, wob: 0.3 });
  }
  handDot(sk, [hx, hy], C.skin, 67, 14);
  return sk;
}

/* ---------- g2u3l7: 파도타기 응원. 사람은 제자리에서 오르내릴 뿐인데 물결은 옆으로 간다 ---------- */
const CROWD = [
  { hair: "short", hairColor: "#3F3A36", seed: 201 }, { hair: "knit", capColor: "#3F7CC0", seed: 211 }, { hair: "bob", hairColor: "#B9703A", seed: 221 },
  { hair: "cap", capColor: "#E0503A", brimColor: "#B8402E", seed: 231 }, { hair: "short", hairColor: "#C58B3A", seed: 241 }, { hair: "cap", seed: 31 },
  { hair: "bob", hairColor: "#3F3A36", seed: 261 }, { hair: "knit", capColor: "#3FAE5A", seed: 271 }, { hair: "short", hairColor: "#8A5A33", seed: 281 },
];
function cutL7() {
  const sk = new Sk(W, H, { id: "h" });
  const GY = 690, BT = 480, BB = 610, X0 = 76, GAP = 104, cs = 0.38, PEAK = 4, RISE = 80, NP = 7;
  ground(sk, GY, 11);
  // 관중: 앉은 사람은 머리와 어깨만, 일어선 사람은 몸까지 보인다. 자리는 그대로다
  for (let i = 0; i < NP; i++) {
    const r = Math.exp(-(((i - PEAK) / 1.25) ** 2)), x = X0 + i * GAP, fy = BT + 95 - r * RISE;
    const P = r > 0.5 ? pose({ elL: [-112, -356], haL: [-172, -466], elR: [112, -356], haR: [172, -466] })
      : r > 0.1 ? pose({ elL: [-92, -300], haL: [-128, -352], elR: [92, -300], haR: [128, -352] }) : pose();
    drawFigure(sk, x, fy, cs, P, CROWD[i + 1]);
  }
  // 관중석 앞 가림판과 기둥
  thin(sk, 0.8, () => {
    for (const [x, i] of [[X0 - 20, 0], [X0 + 3 * GAP, 1], [X0 + 6 * GAP + 20, 2]]) sk.ink(dense([[x, BB], [x, GY]]), { w: 12, seed: 21 + i });
    const board = rrect(X0 - 56, BT, 6 * GAP + 112, BB - BT, 12);
    sk.fill(board, "#DCE6F0", { dx: 0, dy: 0, wob: 0.3, seed: 25 }); sk.ink(board, { w: 10, seed: 26 });
    for (let i = 0; i < NP; i++) if (i !== PEAK) sk.ink(dense([[X0 + i * GAP - 14, BB - 16], [X0 + i * GAP + 14, BB - 16]]), { w: 6, color: "#9AA9BA", seed: 31 + i, wob: 0.2 });
  });
  // 한 사람은 제자리에서 위아래로만(주황), 물결은 옆으로(청록)
  const px = X0 + PEAK * GAP;
  arrow(sk, [[px, BT + 66], [px, BT + 18]], { w: 9, color: ORG, straight: true, seed: 41, head: 20, wob: 0.2 });
  arrow(sk, [[px, BT + 66], [px, BB - 30]], { w: 9, color: ORG, straight: true, seed: 45, head: 20, wob: 0.2 });
  sk.ink(dense([[px - 22, BB - 16], [px + 22, BB - 16]]), { w: 8, color: ORG, seed: 49, wob: 0.2 });
  arrow(sk, [[130, 236], [700, 236]], { w: 12, color: TEAL, straight: true, seed: 51, head: 32, wob: 0.3 });
  // 쌤: 한 손은 그 사람의 자리, 한 손은 물결이 가는 쪽
  const PT = pose({ elL: [-104, -286], haL: [-184, -246], elR: [96, -306], haR: [120, -392], tilt: -0.04 });
  drawFigure(sk, 862, GY, 0.56, PT, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- g2u3l7b: 흔드는 줄에 높은 곳과 낮은 곳이 번갈아 생기고, 리본은 제자리에서 오르내린다 ---------- */
function ribbon(sk, x, y, col, sd, o = {}) {
  for (const sg of [-1, 1]) {
    const w = poly([[x, y], [x + sg * 24, y - 15], [x + sg * 24, y + 15]], 3);
    if (o.ghost) sk.ink(w, { w: 4, color: col, dash: [6, 6], seed: sd + (sg > 0 ? 1 : 0), wob: 0.2 });
    else { sk.fill(w, col, { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(w, { w: 6, seed: sd + 2 + (sg > 0 ? 1 : 0), wob: 0.3 }); }
  }
  if (!o.ghost) sk.dot(x, y, 6.5);
}
function cutL7b() {
  const sk = new Sk(W, H, { id: "i" });
  const GY = 668, tx = 112, ts = 0.66, MY = 300, AMP = 62, LAM = 240, PX = 884;
  ground(sk, GY, 11);
  const hand = [tx + ts * 168, MY];
  const yAt = x => MY - AMP * Math.sin((x - hand[0]) / LAM * Math.PI * 2);
  // 줄을 묶은 기둥
  thin(sk, 0.8, () => sk.ink(dense([[PX, GY], [PX, MY - 96]]), { w: 18, color: "#8A5A33", seed: 13, wob: 0.5 }));
  // 줄: 높은 곳과 낮은 곳이 번갈아
  const rope = []; for (let x = hand[0]; x <= PX; x += 4) rope.push([x, yAt(x)]);
  sk.ink(rope, { w: 9, color: "#C28A3E", seed: 15, wob: 0.6 });
  sk.ink(rope, { w: 3, color: "#8A5A33", seed: 16, wob: 0.6, dash: [6, 12] });
  // 리본: 지금은 높은 곳에 있고, 제자리에서 낮은 곳까지 오르내린다
  const rx = hand[0] + LAM * 1.25;
  ribbon(sk, rx, MY + AMP, "#E0503A", 21, { ghost: true });
  arrow(sk, [[rx + 44, MY], [rx + 44, MY - AMP + 6]], { w: 8, color: ORG, straight: true, seed: 25, head: 18, wob: 0.2 });
  arrow(sk, [[rx + 44, MY], [rx + 44, MY + AMP - 6]], { w: 8, color: ORG, straight: true, seed: 29, head: 18, wob: 0.2 });
  ribbon(sk, rx, MY - AMP, "#E0503A", 33);
  // 쌤: 줄 끝을 위아래로 흔든다
  const PT = pose({ elR: [108, -420], haR: [168, (MY - GY) / ts], elL: [-60, -262], haL: [-92, -196], tilt: 0.04 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher", hands: "L" });
  handDot(sk, hand, C.skin, 41, 15 * ts);
  for (const sg of [-1, 1]) sk.ink(curve([[hand[0] - 26, MY + sg * 30], [hand[0], MY + sg * 44], [hand[0] + 26, MY + sg * 30]]), { w: 6, color: C.gray, seed: 43 + sg, wob: 0.2 });
  // 학생: 초시계를 들고 리본이 오르내리는 것을 센다
  const kx = 650, ks = 0.5;
  const PK = pose({ elL: [-96, -300], haL: [-150, -372], elR: [70, -262], haR: [104, -196], tilt: -0.14 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", flip: -1, hands: "R" });
  const wc = [kx - ks * 150, GY - ks * 372 - 30];
  thin(sk, 0.8, () => {
    sk.ink(dense([[wc[0], wc[1] - 26], [wc[0], wc[1] - 38]]), { w: 9, seed: 51, wob: 0 });
    const w = circ(wc[0], wc[1], 27, { over: 0.08, seed: 52 });
    sk.fill(w, C.white, { dx: 0, dy: 0, wob: 0.2, seed: 53 }); sk.ink(w, { w: 8, seed: 54, wob: 0.4 });
    sk.ink(dense([[wc[0], wc[1]], [wc[0] + 11, wc[1] - 14]]), { w: 5, color: C.red, seed: 55, wob: 0 });
    sk.dot(wc[0], wc[1], 4);
  });
  handDot(sk, [kx - ks * 150, GY - ks * 372], C.skin, 57, 15 * ks);
  return sk;
}

export function cuts() {
  return [
    { name: "g2u3l1", theme: "light", orig: null, sk: cutL1(), alt: "당구대에서 공이 쿠션에 비스듬히 맞고 같은 기울기로 튀어 나가고, 쿠션에 수직으로 놓인 큐대를 가운데 두고 스틱맨이 두 팔을 양쪽 길로 벌려 견주는 장면", cap: "큐대를 가운데 두면 들어간 길과 나온 길의 기울기가 같아요" },
    { name: "g2u3l2", theme: "light", orig: null, sk: cutL2(), alt: "유리 수조 속 물개의 수면 위 머리와 물속 몸통이 어긋나 보여 스틱맨이 깜짝 놀라고, 다른 스틱맨이 수면을 가리키는 장면", cap: "수면을 지나며 꺾인 빛 때문에 몸통이 떠올라 보여요" },
    { name: "g2u3l3", theme: "light", orig: null, sk: cutL3(), alt: "어두운 영화관에서 영사기의 빛이 스크린에 닿았다가 객석에 앉은 스틱맨의 눈으로 돌아오는 길을 화살표 둘로 나타낸 장면", cap: "빛은 영사기에서 스크린으로, 스크린에서 눈으로 와요" },
    { name: "g2u3l4", theme: "light", orig: null, sk: cutL4(), alt: "벽 거울 앞에 한 팔을 들고 선 스틱맨과 거울 속에 같은 크기로 마주 선 모습, 바닥에는 거울 앞과 거울 속에 같은 길이의 줄자가 놓인 장면", cap: "거울 앞 거리와 거울 속 거리, 줄자로 재면 같아요" },
    { name: "g2u3l5", theme: "light", orig: null, sk: cutL5(), alt: "편의점 천장 구석의 둥근 볼록 거울에 가게 안이 넓고 작게 비치고, 계산대 옆에서 스틱맨이 오목한 확대 거울에 얼굴을 바짝 대어 크게 비춰 보는 장면", cap: "볼록 거울은 넓고 작게, 오목 거울은 바짝 대면 크게" },
    { name: "g2u3l5b", theme: "light", orig: null, sk: cutL5b(), alt: "풀밭에서 스틱맨이 돋보기로 개미를 크게 들여다보고, 옆에서 다른 스틱맨이 벗어 든 안경알 너머로 나무가 작게 보이는 장면", cap: "가운데가 두꺼우면 크게, 가장자리가 두꺼우면 작게 보여요" },
    { name: "g2u3l6", theme: "light", orig: null, sk: cutL6(), alt: "무대에서 빨간색, 초록색, 파란색 조명 세 개가 한 자리에 모여 가운데가 하얗게 빛나고, 스틱맨이 손가락 셋을 펴 보이는 장면", cap: "세 가지 빛이 다 모인 가운데는 하얗게 빛나요" },
    { name: "g2u3l7", theme: "light", orig: null, sk: cutL7(), alt: "관중석의 파도타기 응원에서 사람들은 제자리에서 일어났다 앉을 뿐인데 물결 모양이 옆으로 옮겨 가고, 스틱맨이 한 사람의 자리와 물결이 가는 방향을 따로 가리키는 장면", cap: "사람은 제자리에서 오르내리고, 물결만 옆으로 가요" },
    { name: "g2u3l7b", theme: "light", orig: null, sk: cutL7b(), alt: "스틱맨이 긴 줄의 한쪽 끝을 위아래로 흔들어 줄에 높은 곳과 낮은 곳이 번갈아 생기고, 다른 스틱맨이 초시계를 들고 줄에 묶인 리본이 오르내리는 것을 세는 장면", cap: "줄에는 높은 곳과 낮은 곳이, 리본은 제자리에서 오르내려요" },
  ];
}
