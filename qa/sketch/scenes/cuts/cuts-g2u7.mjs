// 중2 과학 Ⅶ단원(전기와 자기) 개념 컷 코드 그림.
// 목록은 Ⅶ단원 v5 세션이 낸 것(D:\Brilliant Science\output\g2-v5\u7\concept-cuts.md): g2u7l1 ~ g2u7l8 열한 줄.
// 색의 뜻: 자석의 N극은 빨강, S극은 파랑(글자 없음). (+)전하는 빨간 더하기, (−)전하는 파란 빼기.
// 전류가 흐르는 코일과 전선 속 금속은 구리색. 물의 흐름(전류의 비유)은 파란 화살표, 떨림은 청록 화살표.
// 켜진 전구는 노란 알과 빛살, 꺼진 전구는 회색 알, 빠진 전구는 점선 알과 가위표.
import { Sk, C, curve, dense, circ, ell, poly, rrect, arrow, emark, qmark, drop, xmark, mix } from "../../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { kettle, note, openBook, phone } from "../../lib/props.mjs";
import { W, H, lerpx, lerp2, thin, steam } from "./common.mjs";

const NRED = "#E0503A", SBLUE = "#3F7CC0", COPPER = "#D98A4E", TEAL = "#12A594", FLOW = "#1F6FB8";
const WATER = "#BFE3F7", WATERD = "#5FAEDD", STEEL = "#9AA7B4", LIT = "#FFD84A";
const ground = (sk, y, sd, x0 = 14, x1 = 946, o = {}) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd, ...o });
// 화면 좌표로 잡은 관절을 인물 좌표(발 사이 원점, 배율 s)로 바꾼다
const local = (ox, oy, s, j) => Object.fromEntries(Object.entries(j).map(([k, v]) => [k, Array.isArray(v) ? [(v[0] - ox) / s, (v[1] - oy) / s] : v]));
const box = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 6);
// 색이 있는 굵은 줄(관, 호스, 기둥): 검은 테 위에 색 선
const pipe = (sk, pts, w, col, sd, wob = 0.5) => { sk.ink(pts, { w: w + 7, seed: sd, wob }); sk.ink(pts, { w, color: col, seed: sd, wob }); };
// 전하 기호: 흰 동그라미 안의 더하기(빨강)나 빼기(파랑)
function sign(sk, x, y, plus, sd, r = 17) {
  const col = plus ? NRED : SBLUE, c = circ(x, y, r, { over: 0, seed: sd });
  sk.fill(c, C.white, { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(c, { w: 4.5, color: col, seed: sd + 1, wob: 0.3 });
  sk.ink(dense([[x - r * 0.52, y], [x + r * 0.52, y]]), { w: 5.5, color: col, seed: sd + 2, wob: 0 });
  if (plus) sk.ink(dense([[x, y - r * 0.52], [x, y + r * 0.52]]), { w: 5.5, color: col, seed: sd + 3, wob: 0 });
}
// 번개 기호(전류가 흐른다)
function bolt(sk, x, y, s, sd, rot = 0) {
  sk.at(x, y, s, () => {
    const p = poly([[8, -32], [-15, 4], [-1, 4], [-9, 32], [16, -7], [2, -7]], 3);
    sk.fill(p, "#FFD23D", { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(p, { w: 5, seed: sd + 1, wob: 0.3 });
  }, rot);
}
// 전구: (x, y) = 유리알 가운데, 소켓은 위쪽(o.up 이면 아래쪽). on = 켜짐, o.ghost = 빠진 자리
function bulb(sk, x, y, r, on, sd, o = {}) {
  const d = o.up ? 1 : -1;
  if (on) sk.glow(x, y, r * 2.4, LIT, 0.75, 0.3);
  if (o.ghost) { sk.ink(circ(x, y, r, { over: 0, seed: sd }), { w: 4.5, color: C.gray, dash: [8, 7], seed: sd + 1, wob: 0.2 }); }
  else {
    const g = circ(x, y, r, { over: 0.1, seed: sd });
    sk.fill(g, on ? LIT : "#D5D9E0", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 }); sk.ink(g, { w: 6.5, seed: sd + 3, wob: 0.4 });
    if (o.filament) { // 필라멘트: 두 받침 사이의 돌돌 감긴 선(글자로 읽히지 않게)
      const fc = on ? "#E0742A" : C.gray, L = r * 0.3, coil = [];
      for (let i = 0; i <= 60; i++) { const t = i / 60, a = t * Math.PI * 2 * 4.5 + Math.PI; coil.push([x - L + 2 * L * t + r * 0.1 * Math.cos(a) + r * 0.1, y - d * r * 0.08 + r * 0.17 * Math.sin(a)]); }
      for (const sg of [-1, 1]) sk.ink(dense([[x + sg * r * 0.2, y + d * r * 0.8], [x + sg * L, y - d * r * 0.08]]), { w: 3.5, color: fc, seed: sd + 4 + sg, wob: 0 });
      sk.ink(coil, { w: 3.5, color: fc, seed: sd + 5, wob: 0 });
    }
    if (on) for (let i = 0; i < 8; i++) {
      const a = (o.up ? -Math.PI / 2 : Math.PI / 2) + (i - 3.5) * 0.62;
      sk.ink(dense([[x + (r + 9) * Math.cos(a), y + (r + 9) * Math.sin(a)], [x + (r + 9 + (o.ray ?? r * 0.6)) * Math.cos(a), y + (r + 9 + (o.ray ?? r * 0.6)) * Math.sin(a)]]), { w: 5, color: "#F2A31B", seed: sd + 6 + i, wob: 0.2 });
    }
  }
  const sock = box(x - r * 0.44, y + d * r * 0.82, x + r * 0.44, y + d * r * 1.5);
  sk.fill(sock, "#8E9AAB", { dx: 0, dy: 0, wob: 0.2, seed: sd + 20 }); sk.ink(sock, { w: 5, seed: sd + 21, wob: 0.3 });
}

/* ---------- g2u7l1: 플라스틱 미끄럼틀을 타고 내려온 아이의 머리카락이 사방으로 선다 ---------- */
function cutL1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 676, SL = "#EF7B5A", FR = "#6FA8DC";
  ground(sk, GY, 11);
  thin(sk, 0.8, () => {
    for (const [x, i] of [[52, 0], [112, 1]]) pipe(sk, dense([[x, GY - 4], [x, 150]]), 9, FR, 13 + i);
    for (let y = 308, i = 0; y < 640; y += 66, i++) pipe(sk, dense([[52, y], [112, y]]), 7, FR, 17 + i);
    pipe(sk, dense([[210, 262], [210, GY - 4]]), 9, FR, 25);
    pipe(sk, dense([[560, 628], [560, GY - 4]]), 9, FR, 26);
    pipe(sk, curve([[112, 150], [170, 132], [214, 168], [214, 240]]), 8, FR, 27);
    const pf = rrect(40, 238, 188, 22, 8);
    sk.fill(pf, FR, { dx: 0, dy: 0, wob: 0.3, seed: 28 }); sk.ink(pf, { w: 9, seed: 29 });
    const slope = curve([[220, 246], [296, 270], [378, 372], [440, 510], [498, 598], [590, 622]]);
    pipe(sk, slope, 30, SL, 31, 0.6);
    sk.ink(slope.slice(8, -8).map(([x, y]) => [x + 3, y - 7]), { w: 4, color: "#FFD3C4", seed: 33, wob: 0.3 });
  });
  // 아이: 모자를 벗어 들었고, 머리카락이 서로 밀어내 사방으로 곤두섰다
  const kx = 676, ks = 0.64, hc = [kx, GY - ks * 436], R = ks * 100;
  const PK = pose({ elL: [-92, -262], haL: [-150, -204], elR: [80, -258], haR: [122, -196], tilt: 0 });
  drawFigure(sk, kx, GY, ks, PK, { hair: "short", hairColor: C.hair, seed: 31, name: "student", hands: "R" });
  for (let i = 0; i < 15; i++) {
    const a = -Math.PI - 0.28 + (Math.PI + 0.56) * i / 14, len = 44 + ((i * 7) % 3) * 9, bend = (i % 2 ? 1 : -1) * 0.07;
    const p0 = [hc[0] + (R - 6) * Math.cos(a), hc[1] + (R - 6) * Math.sin(a)], p1 = [hc[0] + (R + len * 0.55) * Math.cos(a + bend), hc[1] + (R + len * 0.55) * Math.sin(a + bend)], p2 = [hc[0] + (R + len) * Math.cos(a), hc[1] + (R + len) * Math.sin(a)];
    sk.ink(curve([p0, p1, p2]), { w: 7.5, color: C.hair, seed: 41 + i, wob: 0.4 });
  }
  // 벗어 든 노란 모자
  const ch = [kx - ks * 150, GY - ks * 204];
  const brim = curve([[ch[0] - 34, ch[1] - 6], [ch[0] - 78, ch[1] - 10], [ch[0] - 84, ch[1] + 6], [ch[0] - 40, ch[1] + 8]], true, 3);
  sk.fill(brim, "#F2A81D", { dx: 0, dy: 0, wob: 0.3, seed: 61 }); sk.ink(brim, { w: 6, seed: 62, wob: 0.4 });
  const dome = [...ell(ch[0], ch[1] + 6, 42, 44, Math.PI, Math.PI * 2), [ch[0] - 42, ch[1] + 6]];
  sk.fill(dome, C.yellow, { dx: 0, dy: 0, wob: 0.3, seed: 63 }); sk.ink(dome, { w: 7, seed: 64, wob: 0.4 });
  handDot(sk, [ch[0] + 4, ch[1] + 8], C.skin, 65, 15 * ks);
  // 쌤: 깜짝 놀라 두 손을 든다
  const tx = 882, ts = 0.6;
  const PT = pose({ elL: [-84, -258], haL: [-112, -330], elR: [84, -262], haR: [116, -340], tilt: 0.06 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher", mirror: true });
  emark(sk, tx + 6, GY - ts * 590 - 52, 0.9);
  return sk;
}

/* ---------- g2u7l2: 문지른 자를 닿지 않게 가까이 대자 실에 매단 클립이 자 쪽으로 끌려와 기운다 ---------- */
function cutL2() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 676, P0 = [300, 92], TH = 0.3, dir = [Math.sin(TH), Math.cos(TH)];
  ground(sk, GY, 11);
  // 받침대
  thin(sk, 0.8, () => {
    const base = rrect(24, GY - 24, 170, 24, 8);
    sk.fill(base, STEEL, { dx: 0, dy: 0, wob: 0.3, seed: 13 }); sk.ink(base, { w: 9, seed: 14 });
    sk.ink(dense([[96, GY - 24], [96, 84], [P0[0] + 8, 84]]), { w: 11, seed: 15 });
  });
  // 처음 자리(곧게 늘어진 실)와 지금 자리(기운 실)
  sk.ink(dense([[P0[0], 96], [P0[0], 566]]), { w: 4.5, color: C.gray, dash: [9, 9], seed: 21, wob: 0 });
  const T = [P0[0] + dir[0] * 190, P0[1] + dir[1] * 190];
  sk.ink(dense([P0, T]), { w: 4.5, seed: 23, wob: 0.3 });
  // 금속 클립(크게)
  const CL = 230, CK = 1.35, mid = [T[0] + dir[0] * CL / 2, T[1] + dir[1] * CL / 2];
  sk.at(mid[0], mid[1], CK, () => {
    const h = CL / 2 / CK;
    const wire = [[-13, -h + 40], [-13, h - 28], ...ell(4, h - 28, 17, 17, Math.PI, 0), [21, -h + 26], ...ell(-4, -h + 26, 25, 25, 0, -Math.PI), [-29, h - 22], ...ell(0, h - 22, 29, 22, Math.PI, 0), [29, -h + 44]];
    const pts = dense(wire, 3);
    sk.ink(pts, { w: 13, seed: 25, wob: 0.3 }); sk.ink(pts, { w: 6.5, color: "#C9D2DE", seed: 25, wob: 0.3 });
  }, -TH);
  const bot = [T[0] + dir[0] * CL, T[1] + dir[1] * CL];
  // 플라스틱 자(닿지 않는다: 클립과 자 사이의 틈)
  const RX = bot[0] + 86, RY = bot[1] - 30, RL = 300, RH = 72;
  const ruler = rrect(RX, RY - RH / 2, RL, RH, 7);
  sk.fill(ruler, "#BDEBDD", { dx: 0, dy: 0, wob: 0.3, seed: 31 });
  thin(sk, 0.8, () => {
    sk.ink(ruler, { w: 8, seed: 32, wob: 0.5 });
    for (let i = 1; i < 15; i++) sk.ink(dense([[RX + i * 20, RY - RH / 2 + 2], [RX + i * 20, RY - RH / 2 + (i % 5 ? 12 : 20)]]), { w: 3.5, seed: 33 + i, wob: 0 });
  });
  // 전하: 자는 (−), 클립의 자와 가까운 쪽에는 (+), 먼 쪽에는 (−)
  for (const [x, i] of [[RX + 36, 0], [RX + 94, 1], [RX + 152, 2]]) sign(sk, x, RY + 10, false, 51 + i * 4, 20);
  sign(sk, bot[0] + 44, bot[1] - 78, true, 65, 20); sign(sk, bot[0] + 34, bot[1] + 16, true, 69, 20);
  sign(sk, T[0] - 54, T[1] + 14, false, 73, 20); sign(sk, T[0] - 38, T[1] + 74, false, 77, 20);
  // 끌려오는 쪽 화살표
  arrow(sk, [[P0[0] + 14, 600], [bot[0] + 30, 600]], { w: 8, color: TEAL, straight: true, seed: 81, head: 20, wob: 0.2 });
  // 학생: 한 손에 자, 다른 손에 문지른 천
  const kx = 880, ks = 0.6, hand = [RX + RL - 26, RY];
  const PK = pose({ ...local(kx, GY, ks, { haL: hand, elL: [hand[0] + 34, hand[1] + 56] }), elR: [52, -262], haR: [84, -200], tilt: -0.05 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", flip: -1, hands: "R" });
  handDot(sk, hand, C.skin, 91, 15 * ks);
  const cl = [kx + ks * 84, GY - ks * 200];
  const cloth = curve([[cl[0] - 14, cl[1] - 8], [cl[0] + 18, cl[1] - 14], [cl[0] + 26, cl[1] + 22], [cl[0] + 10, cl[1] + 52], [cl[0] - 6, cl[1] + 34], [cl[0] - 20, cl[1] + 50], [cl[0] - 22, cl[1] + 12]], true, 3);
  sk.fill(cloth, "#C9A7E0", { dx: 0, dy: 0, wob: 0.3, seed: 93, tex: 0.7 }); sk.ink(cloth, { w: 6, seed: 94, wob: 0.5 });
  return sk;
}

/* ---------- g2u7l3: 흐르는 풀. 물은 한 방향으로 돌고, 펌프가 물을 밀어 흐름을 이어 준다 ---------- */
const RIDERS = [
  { hair: "cap", seed: 31 }, { hair: "bob", hairColor: "#B9703A", seed: 221 }, { hair: "knit", capColor: "#3FAE5A", seed: 271 },
];
function rider(sk, x, y, k, cfg, col, sd) {
  const ring = ell(x, y, 58 * k, 26 * k);
  sk.fill(ring, col, { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(ring, { w: 7 * k, seed: sd + 1, wob: 0.4 });
  const hole = ell(x, y - 3 * k, 27 * k, 10 * k);
  sk.fill(hole, WATERD, { dx: 0, dy: 0, wob: 0.2, seed: sd + 2 }); sk.ink(hole, { w: 5 * k, seed: sd + 3, wob: 0.3 });
  const sh = [x, y - 50 * k];
  sk.ink(dense([[x, y - 4 * k], sh]), { w: 9 * k, seed: sd + 4, wob: 0.4 });
  sk.ink(curve([sh, [x - 34 * k, y - 34 * k], [x - 50 * k, y - 10 * k]]), { w: 8 * k, seed: sd + 5, wob: 0.4 });
  sk.ink(curve([sh, [x + 34 * k, y - 66 * k], [x + 52 * k, y - 102 * k]]), { w: 8 * k, seed: sd + 6, wob: 0.4 });
  handDot(sk, [x - 50 * k, y - 10 * k], C.skin, sd + 7, 8 * k); handDot(sk, [x + 52 * k, y - 102 * k], C.skin, sd + 9, 8 * k);
  sk.save(); sk.translate(x, y - 84 * k); sk.scale(0.36 * k); drawHead(sk, cfg); sk.restore();
}
function cutL3() {
  const sk = new Sk(W, H, { id: "c" });
  const cx = 398, cy = 396, ORX = 378, ORY = 236, IRX = 204, IRY = 108, MRX = (ORX + IRX) / 2, MRY = (ORY + IRY) / 2;
  const at = a => [cx + MRX * Math.cos(a), cy + MRY * Math.sin(a)];
  // 풀(고리 모양 물길)과 가운데 섬
  const outer = ell(cx, cy, ORX, ORY), inner = ell(cx, cy, IRX, IRY);
  sk.fill(outer, WATER, { dx: 0, dy: 0, wob: 0.6, seed: 11 });
  sk.fill(inner, "#CFE8B9", { dx: 0, dy: 0, wob: 0.5, seed: 12 });
  thin(sk, 0.8, () => { sk.ink(outer, { w: 10, seed: 13, wob: 0.9 }); sk.ink(inner, { w: 9, seed: 14, wob: 0.8 }); });
  // 물의 흐름: 한 방향으로 한 바퀴
  for (const [a0, a1, i] of [[0.42, 1.12, 0], [2.3, 3.02, 1], [3.86, 4.5, 2], [5.3, 5.98, 3]]) {
    const pts = []; for (let j = 0; j <= 6; j++) pts.push(at(a0 + (a1 - a0) * j / 6));
    arrow(sk, pts, { w: 11, color: FLOW, seed: 21 + i * 5, head: 28, wob: 0.3 });
  }
  // 튜브를 탄 사람들
  const r2 = at(4.9), r1 = at(3.45), r0 = at(1.72);
  rider(sk, r2[0], r2[1] + 6, 0.84, RIDERS[2], "#F7C948", 41);
  rider(sk, r1[0], r1[1] + 6, 0.96, RIDERS[1], "#F28BA0", 55);
  rider(sk, r0[0], r0[1] + 10, 1.14, RIDERS[0], "#F08A2E", 69);
  // 펌프: 물길을 가로질러 놓여 물을 밀어 준다
  thin(sk, 0.8, () => {
    const px0 = cx + IRX - 10, px1 = cx + ORX + 10;
    const body = rrect(px0, cy - 62, px1 - px0, 112, 16);
    sk.fill(body, "#7F8FA6", { dx: 0, dy: 0, wob: 0.3, seed: 81, tex: 0.8 }); sk.ink(body, { w: 10, seed: 82 });
    const fc = [(px0 + px1) / 2, cy - 6], fan = circ(fc[0], fc[1], 40, { over: 0.06, seed: 83 });
    sk.fill(fan, C.white, { dx: 0, dy: 0, wob: 0.2, seed: 84 }); sk.ink(fan, { w: 7, seed: 85, wob: 0.4 });
    for (let i = 0; i < 3; i++) { const a = 0.5 + i * Math.PI * 2 / 3; const bl = curve([[fc[0], fc[1]], [fc[0] + 22 * Math.cos(a - 0.5), fc[1] + 22 * Math.sin(a - 0.5)], [fc[0] + 32 * Math.cos(a), fc[1] + 32 * Math.sin(a)], [fc[0] + 16 * Math.cos(a + 0.5), fc[1] + 16 * Math.sin(a + 0.5)]], true, 3); sk.fill(bl, "#F08A2E", { dx: 0, dy: 0, wob: 0.2, seed: 86 + i }); sk.ink(bl, { w: 4.5, seed: 89 + i, wob: 0.3 }); }
    sk.dot(fc[0], fc[1], 6);
  });
  // 펌프가 미는 쪽
  arrow(sk, [[cx + MRX, cy + 62], [cx + MRX - 8, cy + 108]], { w: 13, color: "#F08A2E", straight: true, seed: 93, head: 26, wob: 0.2 });
  // 쌤: 펌프를 가리킨다
  const tx = 884, GY = 690, ts = 0.52;
  ground(sk, GY, 95, 806, 950);
  const PT = pose({ elL: [-104, -316], haL: [-176, -336], tilt: -0.05 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- g2u7l4: 똑같은 수도꼭지, 굵은 호스에서는 물이 콸콸, 가는 호스에서는 졸졸 ---------- */
function tap(sk, x, y, sg, sd) {
  thin(sk, 0.8, () => {
    pipe(sk, dense([[x, 676], [x, y - 26]]), 13, STEEL, sd);
    pipe(sk, dense([[x, y], [x + sg * 42, y], [x + sg * 42, y + 26]]), 13, STEEL, sd + 1);
    sk.ink(dense([[x + sg * 14, y - 12], [x + sg * 14, y - 32]]), { w: 7, seed: sd + 2, wob: 0.2 });
    sk.ink(dense([[x + sg * 14 - 22, y - 34], [x + sg * 14 + 22, y - 34]]), { w: 11, color: NRED, seed: sd + 3, wob: 0.2 });
  });
}
function cutL4() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 680, kx = 480, ks = 0.66, HOSE = "#3FAE5A";
  ground(sk, GY, 11);
  tap(sk, 58, 500, 1, 13); tap(sk, 902, 500, -1, 19);
  const hl = [kx - ks * 172, GY - ks * 318], hr = [kx + ks * 172, GY - ks * 318];
  // 굵은 호스와 콸콸 솟는 물
  const big = curve([[352, 404], [318, 258], [246, 138], [166, 112], [108, 172], [84, 262]]);
  sk.ink(big, { w: 40, color: WATERD, seed: 25, wob: 0.8 }); sk.ink(big, { w: 27, color: WATER, seed: 25, wob: 0.8 });
  for (const [x, y, s, r, i] of [[52, 316, 1.25, 0.2, 0], [100, 334, 1.1, -0.1, 1], [128, 296, 0.95, -0.3, 2], [28, 262, 1, 0.3, 3], [70, 384, 1.1, 0, 4], [150, 356, 0.9, -0.2, 5]]) drop(sk, x, y, s, { rot: r, line: FLOW });
  pipe(sk, curve([[100, 530], [112, 612], [200, 662], [300, 646], [350, 560], [366, 470], [358, 426], [352, 398]]), 26, HOSE, 31, 0.8);
  // 가는 호스와 졸졸 나오는 물
  sk.ink(curve([[607, 404], [622, 366], [644, 356], [662, 380], [670, 420]]), { w: 7, color: WATERD, seed: 41, wob: 0.4 });
  for (const [x, y, s, i] of [[676, 452, 0.8, 0], [664, 492, 0.7, 1]]) drop(sk, x, y, s, { line: FLOW });
  pipe(sk, curve([[860, 530], [848, 612], [760, 662], [660, 646], [610, 560], [594, 470], [602, 426], [607, 400]]), 6.5, HOSE, 45, 0.8);
  // 학생: 두 호스를 한 손에 하나씩 들고 고개를 갸웃한다
  const PK = pose({ elL: [-118, -268], haL: [-172, -318], elR: [118, -268], haR: [172, -318], tilt: 0.2, head: [14, -432] });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student" });
  qmark(sk, kx + 112, GY - ks * 436 - 96, 1.0, { color: NRED });
  return sk;
}

/* ---------- g2u7l4b: 껍질을 조금 벗긴 전선. 속은 금속 선(도체), 겉은 껍질(부도체) ---------- */
function cutL4b() {
  const sk = new Sk(W, H, { id: "e" });
  const GY = 676, tx = 176, ts = 0.7, GLOVE = "#F0707F", SHEATH = "#4C86C6";
  ground(sk, GY, 11);
  const hand = [tx + ts * 152, GY - ts * 318], rot = -0.4;
  const PT = pose({ elR: [98, -276], haR: [152, -318], elL: [-52, -262], haL: [-84, -196], tilt: -0.04 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher", hands: false });
  // 전선(크게): 껍질과, 벗긴 끝에서 드러난 금속 선
  const SE = 372, CE = 566;
  // 손 뒤로 늘어져 바닥에 놓인 나머지 전선
  thin(sk, 0.8, () => pipe(sk, curve([[hand[0] - 10, hand[1] + 4], [hand[0] - 44, hand[1] + 34], [hand[0] - 40, hand[1] + 130], [hand[0] + 6, GY - 40], [hand[0] + 110, GY - 26], [hand[0] + 250, GY - 28], [hand[0] + 330, GY - 26]]), 50, SHEATH, 17, 0.8));
  sk.at(hand[0], hand[1], 1, () => {
    const sheath = [[-24, -31], [SE, -31], ...ell(SE, 0, 12, 31, -Math.PI / 2, Math.PI / 2), [-24, 31]];
    sk.fill(sheath, SHEATH, { dx: 0, dy: 0, wob: 0.4, seed: 21, tex: 0.8, texAng: 0 }); sk.ink(sheath, { w: 9, seed: 22, wob: 0.6 });
    sk.ink(dense([[-10, -17], [SE - 24, -17]]), { w: 5, color: "#A9CBEE", seed: 23, wob: 0.3 });
    const face = ell(SE, 0, 12, 31);
    sk.fill(face, mix(SHEATH, "#000000", 0.25), { dx: 0, dy: 0, wob: 0.2, seed: 24 }); sk.ink(face, { w: 6, seed: 25, wob: 0.3 });
    const core = [[SE, -15], [CE, -15], [CE, 15], [SE, 15]];
    sk.fill(poly(core, 4), COPPER, { dx: 0, dy: 0, wob: 0.3, seed: 26 }); sk.ink(dense([[SE, -15], [CE, -15]]), { w: 7, seed: 27, wob: 0.4 }); sk.ink(dense([[SE, 15], [CE, 15]]), { w: 7, seed: 28, wob: 0.4 });
    for (const [y, i] of [[-6, 0], [6, 1]]) sk.ink(dense([[SE + 16, y], [CE, y]]), { w: 3.5, color: "#A8602C", seed: 29 + i, wob: 0.3 });
    for (let i = 0; i < 5; i++) { const y = -12 + i * 6, fy = -44 + i * 22; const st = curve([[CE - 4, y], [CE + 26, y + (fy - y) * 0.35], [CE + 58, fy]]); sk.ink(st, { w: 10, seed: 33 + i, wob: 0.3 }); sk.ink(st, { w: 5, color: COPPER, seed: 33 + i, wob: 0.3 }); }
  }, rot);
  // 고무장갑 낀 두 손
  const glove = (p, el, sd) => {
    const c = lerp2(p, el, 0.42);
    sk.ink(dense([p, c]), { w: 25, seed: sd, wob: 0.3 }); sk.ink(dense([p, c]), { w: 17, color: GLOVE, seed: sd, wob: 0.3 });
    handDot(sk, p, GLOVE, sd + 2, 21);
  };
  glove(hand, [tx + ts * 98, GY - ts * 276], 41);
  glove([tx - ts * 84, GY - ts * 196], [tx - ts * 52, GY - ts * 262], 47);
  // 학생: 드러난 금속 선을 가리킨다
  const kx = 806, ks = 0.58;
  const PK = pose({ elL: [-104, -318], haL: [-186, -352], elR: [56, -262], haR: [88, -198], tilt: -0.14 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", flip: -1 });
  return sk;
}

/* ---------- g2u7l5: 줄 전구 두 줄. 한 줄로 이은 줄은 하나가 빠지면 다 꺼지고, 사다리처럼 이은 줄은 나머지가 켜져 있다 ---------- */
function cutL5() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 680, TX = 388, XS = [200, 294, 388, 482, 576], BR = 28;
  ground(sk, GY, 11);
  // 나무
  thin(sk, 0.8, () => {
    const trunk = box(TX - 34, 500, TX + 34, GY - 2);
    sk.fill(trunk, "#A9773F", { dx: 0, dy: 0, wob: 0.3, seed: 13, tex: 0.8 }); sk.ink(trunk, { w: 10, seed: 14 });
    const can = circ(TX, 296, 232, { over: 0.05, seed: 15, lump: 0.045, sx: 1.3 });
    sk.fill(can, "#BFE3B4", { dx: 0, dy: 0, wob: 0.6, seed: 16 }); sk.ink(can, { w: 10, seed: 17, wob: 1 });
  });
  const sag = (y0, d) => x => y0 + d * (1 - ((x - TX) / 250) ** 2);
  // 위: 전선 한 가닥이 전구를 차례로 꿰고 지나간다(직렬). 하나가 빠진 자리에서 선이 끊겨 전부 꺼졌다
  const y1 = sag(150, 40), ends = [TX - 272, ...XS.flatMap(x => [x - BR - 12, x + BR + 12]), TX + 272];
  for (let i = 0; i < ends.length; i += 2) { const seg = []; for (let x = ends[i]; x <= ends[i + 1]; x += 4) seg.push([x, y1(x)]); seg.push([ends[i + 1], y1(ends[i + 1])]); sk.ink(seg, { w: 7.5, seed: 21 + i, wob: 0.3 }); }
  XS.forEach((x, i) => {
    const y = y1(x), miss = i === 3;
    if (miss) { sk.ink(circ(x, y, BR, { over: 0, seed: 31 }), { w: 4.5, color: C.gray, dash: [8, 7], seed: 32, wob: 0.2 }); xmark(sk, x, y, 0.5, { w: 13 }); }
    else { const g = circ(x, y, BR, { over: 0.1, seed: 33 + i }); sk.fill(g, "#D5D9E0", { dx: 0, dy: 0, wob: 0.3, seed: 38 + i }); sk.ink(g, { w: 6.5, seed: 43 + i, wob: 0.4 }); }
    for (const sg of [-1, 1]) { const cp = box(x + sg * (BR + 1), y - 11, x + sg * (BR + 14), y + 11); sk.fill(cp, "#8E9AAB", { dx: 0, dy: 0, wob: 0.2, seed: 51 + i }); sk.ink(cp, { w: 5, seed: 56 + i * 2 + sg, wob: 0.3 }); }
  });
  // 아래: 위아래 두 가닥 사이에 전구가 사다리 가로대처럼 하나씩 걸렸다(병렬). 하나가 빠져도 두 가닥은 이어져 있어 나머지는 켜져 있다
  const ya = sag(296, 30), yb = sag(468, 30), wa = [], wb = [];
  for (let x = TX - 282; x <= TX + 282; x += 6) { wa.push([x, ya(x)]); wb.push([x, yb(x)]); }
  XS.forEach((x, i) => { if (i !== 1) sk.glow(x, (ya(x) + yb(x)) / 2 + 10, 84, LIT, 0.8, 0.25); });
  sk.ink(wa, { w: 8.5, seed: 23, wob: 0.4 }); sk.ink(wb, { w: 8.5, seed: 24, wob: 0.4 });
  XS.forEach((x, i) => {
    const y = (ya(x) + yb(x)) / 2 + 10, miss = i === 1;
    sk.ink(dense([[x, ya(x)], [x, miss ? ya(x) + 22 : y - BR * 1.5]]), { w: 6, seed: 201 + i, wob: 0.2 });
    sk.ink(dense([[x, miss ? yb(x) - 22 : y + BR], [x, yb(x)]]), { w: 6, seed: 211 + i, wob: 0.2 });
    sk.dot(x, ya(x), 7); sk.dot(x, yb(x), 7);
    if (miss) { sk.ink(circ(x, y, BR, { over: 0, seed: 221 }), { w: 4.5, color: C.gray, dash: [8, 7], seed: 222, wob: 0.2 }); xmark(sk, x, y, 0.5, { w: 13 }); }
    else bulb(sk, x, y, BR, true, 221 + i * 30, { ray: 11 });
  });
  // 학생: 켜져 있는 아래 줄을 가리킨다
  const kx = 848, ks = 0.62;
  const PK = pose({ elL: [-104, -330], haL: [-178, -372], elR: [56, -262], haR: [88, -198], tilt: -0.1 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", flip: -1 });
  return sk;
}

/* ---------- g2u7l6: 자전거 발전기. 작은 전구는 가볍게 밟아도 켜지고, 전기 주전자는 땀을 뻘뻘 흘려야 한다 ---------- */
function bike(sk, ox, gy, k, sd) {
  const P = (x, y) => [ox + k * x, gy + k * y];
  thin(sk, 0.8, () => {
    for (const [hx, i] of [[-95, 0], [150, 1]]) {
      const c = P(hx, -80), wh = circ(c[0], c[1], 76 * k, { over: 0.06, seed: sd + i });
      sk.ink(wh, { w: 10, seed: sd + 2 + i, wob: 0.6 });
      for (let j = 0; j < 4; j++) { const a = 0.3 + j * Math.PI / 4; sk.ink(dense([[c[0] - 70 * k * Math.cos(a), c[1] - 70 * k * Math.sin(a)], [c[0] + 70 * k * Math.cos(a), c[1] + 70 * k * Math.sin(a)]]), { w: 3, color: C.gray, seed: sd + 5 + j + i * 4, wob: 0.2 }); }
    }
    // 뒷바퀴를 띄운 받침과 발전기
    for (const [x, i] of [[-140, 0], [-50, 1]]) sk.ink(dense([P(-95, -80), P(x, 0)]), { w: 8, seed: sd + 14 + i });
    const gen = rrect(ox + k * -208, gy + k * -74, k * 44, k * 56, 7);
    sk.fill(gen, "#F2B600", { dx: 0, dy: 0, wob: 0.2, seed: sd + 16 }); sk.ink(gen, { w: 7, seed: sd + 17 });
    // 차체
    const fr = "#D9534F";
    pipe(sk, dense([P(10, -72), P(-38, -200)]), 7, fr, sd + 20);
    pipe(sk, dense([P(-34, -186), P(96, -196)]), 7, fr, sd + 21);
    pipe(sk, dense([P(96, -196), P(10, -72)]), 7, fr, sd + 22);
    pipe(sk, dense([P(10, -72), P(-95, -80), P(-34, -186)]), 7, fr, sd + 23);
    pipe(sk, dense([P(104, -246), P(96, -196), P(150, -80)]), 7, fr, sd + 24);
    sk.ink(dense([P(82, -250), P(128, -244)]), { w: 11, seed: sd + 25, wob: 0.3 });
    const seat = rrect(ox + k * -70, gy + k * -214, k * 62, k * 16, 6);
    sk.fill(seat, "#39424E", { dx: 0, dy: 0, wob: 0.2, seed: sd + 26 }); sk.ink(seat, { w: 6, seed: sd + 27 });
    sk.ink(dense([P(-14, -104), P(36, -38)]), { w: 8, seed: sd + 28, wob: 0.2 });
    sk.dot(...P(10, -72), 9 * k);
  });
}
function table(sk, x0, x1, ty, gy, sd) {
  thin(sk, 0.8, () => {
    for (const [x, i] of [[x0 + 14, 0], [x1 - 14, 1]]) sk.ink(dense([[x, ty + 16], [x, gy]]), { w: 10, seed: sd + i });
    const top = rrect(x0, ty, x1 - x0, 18, 7);
    sk.fill(top, C.wood, { dx: 0, dy: 0, wob: 0.3, seed: sd + 2, tex: 0.8, texAng: 0.02 }); sk.ink(top, { w: 9, seed: sd + 3 });
  });
}
function cutL6() {
  const sk = new Sk(W, H, { id: "g" });
  const GY = 668, k = 0.74, s = 0.7, TY = GY - 168;
  ground(sk, GY, 11);
  const ride = (ox, hard, sd) => {
    const hp = [ox + k * -40, GY + k * -214], bb = [ox + k * 10, GY + k * -72];
    const bar = [ox + k * 104, GY + k * -248], pa = [bb[0] + k * 26, bb[1] + k * 34], pb = [bb[0] - k * 24, bb[1] - k * 32];
    const neck = hard ? [hp[0] + 50, hp[1] - 76] : [hp[0] + 24, hp[1] - 87];
    const head = hard ? [neck[0] + 30, neck[1] - 58] : [neck[0] + 8, neck[1] - 65];
    const j = { hip: hp, neck, head, knL: [hp[0] + 46, hp[1] + 62], ftL: pa, knR: [hp[0] + 66, hp[1] + 24], ftR: pb,
      elR: hard ? [neck[0] + 26, neck[1] + 60] : [neck[0] + 42, neck[1] + 52], haR: bar,
      elL: hard ? [neck[0] + 14, neck[1] + 64] : [neck[0] - 62, neck[1] + 6], haL: hard ? [bar[0] - 8, bar[1] + 4] : [neck[0] - 122, neck[1] - 44], tilt: hard ? 0.42 : 0.08 };
    drawFigure(sk, hp[0], GY, s, pose(local(hp[0], GY, s, j)), { ...STUDENT, name: hard ? "hard" : "easy", seed: 31 });
    return head;
  };
  // 왼쪽: 작은 전구, 가볍게
  const o1 = 164;
  table(sk, 346, 436, TY, GY, 21);
  sk.ink(curve([[o1 + k * -186, GY - 14], [o1 - 40, GY - 9], [324, GY - 9], [358, GY - 30], [362, TY + 2]]), { w: 6, color: "#C98A00", seed: 25, wob: 0.4 });
  bike(sk, o1, GY, k, 31);
  ride(o1, false, 0);
  bulb(sk, 391, TY - 62, 40, true, 61, { up: true, filament: true, ray: 24 });
  // 오른쪽: 전기 주전자, 땀을 뻘뻘
  const o2 = 638;
  table(sk, 818, 936, TY, GY, 71);
  sk.ink(curve([[o2 + k * -186, GY - 14], [o2 - 40, GY - 9], [798, GY - 9], [830, GY - 30], [834, TY + 2]]), { w: 6, color: "#C98A00", seed: 75, wob: 0.4 });
  bike(sk, o2, GY, k, 81);
  const hd = ride(o2, true, 0);
  kettle(sk, 874, TY, 0.5, { lift: 10 });
  steam(sk, 878, TY - 96, 2, 62, 111, 26);
  for (const [dx, dy, r, sc, i] of [[-96, -42, -0.9, 1.15, 0], [-108, 4, -1.3, 1.0, 1], [-70, -84, -0.5, 1.0, 2], [-98, 46, -1.6, 0.9, 3], [34, -96, 0.5, 0.9, 4]]) drop(sk, hd[0] + dx, hd[1] + dy, sc, { rot: r });
  return sk;
}

/* ---------- g2u7l6b: 똑같이 밝은 두 전등. 한쪽은 전구가 뜨거워 손부채질, 다른 쪽은 편안히 책을 읽는다 ---------- */
function cutL6b() {
  const sk = new Sk(W, H, { id: "h" });
  const GY = 676, BY = 150, BR = 46;
  // 똑같은 빛(같은 밝기)
  for (const [bx, i] of [[248, 0], [712, 1]]) {
    sk.fill(poly([[bx - 34, BY + 30], [bx + 34, BY + 30], [bx + 190, GY], [bx - 190, GY]], 6), "#FFE08A", { dx: 0, dy: 0, wob: 0, seed: 11 + i, alpha: 0.38 });
    thin(sk, 0.8, () => sk.ink(dense([[bx, 0], [bx, BY - BR * 1.4]]), { w: 7, seed: 13 + i, wob: 0.3 }));
  }
  ground(sk, GY, 15);
  // 왼쪽: 뜨거운 전구(필라멘트, 붉은 열기)
  bulb(sk, 248, BY, BR, true, 21, { filament: true, ray: 22 });
  steam(sk, 248 - 104, BY + 4, 2, 78, 51, 26, "#E8604C"); steam(sk, 248 + 104, BY + 4, 2, 78, 55, 26, "#E8604C");
  // 오른쪽: 뜨겁지 않은 전구(아래쪽만 빛나는 둥근 덮개)
  const lx = 712;
  sk.glow(lx, BY, BR * 2.4, LIT, 0.75, 0.3);
  const led = [...ell(lx, BY - 6, BR, BR, 0, Math.PI), [lx - BR, BY - 6]];
  sk.fill(led, LIT, { dx: 0, dy: 0, wob: 0.3, seed: 61 }); sk.ink(led, { w: 6.5, seed: 62, wob: 0.4 });
  const fin = poly([[lx - BR, BY - 6], [lx - BR * 0.5, BY - BR * 1.4], [lx + BR * 0.5, BY - BR * 1.4], [lx + BR, BY - 6]], 4);
  sk.fill(fin, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 63 }); sk.ink(fin, { w: 6.5, seed: 64, wob: 0.4 });
  for (const [dx, i] of [[-0.36, 0], [0, 1], [0.36, 2]]) sk.ink(dense([[lx + dx * BR * 1.5, BY - 12], [lx + dx * BR, BY - BR * 1.3]]), { w: 3.5, color: C.gray, seed: 65 + i, wob: 0.2 });
  for (let i = 0; i < 8; i++) { const a = Math.PI / 2 + (i - 3.5) * 0.62; sk.ink(dense([[lx + (BR + 9) * Math.cos(a), BY + (BR + 9) * Math.sin(a)], [lx + (BR + 31) * Math.cos(a), BY + (BR + 31) * Math.sin(a)]]), { w: 5, color: "#F2A31B", seed: 27 + i, wob: 0.2 }); }
  // 학생: 더워서 손부채질
  const kx = 248, ks = 0.62;
  const PK = pose({ elR: [96, -300], haR: [132, -392], elL: [-60, -262], haL: [-92, -198], tilt: 0.08 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student" });
  const fh = [kx + ks * 132, GY - ks * 392];
  for (const [d, i] of [[20, 0], [36, 1]]) for (const sg of [-1, 1]) sk.ink(curve([[fh[0] + sg * d, fh[1] - 20], [fh[0] + sg * (d + 9), fh[1]], [fh[0] + sg * d, fh[1] + 20]]), { w: 5, color: C.gray, seed: 71 + i * 2 + sg, wob: 0.2 });
  drop(sk, kx - 86, GY - ks * 436 - 16, 1.1, { rot: -0.7 }); drop(sk, kx - 96, GY - ks * 436 + 40, 0.95, { rot: -1.2 });
  // 쌤: 편안히 책을 읽는다
  const tx = 712, ts = 0.62;
  const PT = pose({ elL: [-66, -284], haL: [-74, -232], elR: [66, -284], haR: [74, -232], tilt: 0.1, head: [0, -432] });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher", hands: false });
  openBook(sk, tx, GY - ts * 206, 0.62, { color: TEAL });
  handDot(sk, [tx - ts * 74, GY - ts * 232], C.skin, 81, 15 * ts); handDot(sk, [tx + ts * 74, GY - ts * 232], C.skin, 83, 15 * ts);
  return sk;
}

/* ---------- g2u7l7: 종이 밑의 막대자석, 종이 위의 쇳가루가 두 끝을 잇는 굽은 줄무늬로 늘어선다 ---------- */
// 두 극(점 둘)이 만드는 자기장을 따라 줄을 긋는다: N극에서 나와 S극으로 들어간다
function fieldLines(a, hw, hh) {
  const N = [-a, 0], S = [a, 0], out = [];
  const E = p => { const d1 = [p[0] - N[0], p[1] - N[1]], d2 = [p[0] - S[0], p[1] - S[1]], r1 = Math.hypot(d1[0], d1[1]) ** 3, r2 = Math.hypot(d2[0], d2[1]) ** 3; return [d1[0] / r1 - d2[0] / r2, d1[1] / r1 - d2[1] / r2]; };
  for (const deg of [24, 48, 74, 102, 130, 156, 180, -24, -48, -74, -102, -130, -156]) {
    const f = deg * Math.PI / 180; let p = [N[0] + 18 * Math.cos(f), N[1] + 18 * Math.sin(f)], done = false; const pts = [p];
    for (let i = 0; i < 4000; i++) {
      const e = E(p), L = Math.hypot(e[0], e[1]); p = [p[0] + 3 * e[0] / L, p[1] + 3 * e[1] / L];
      if (Math.abs(p[0]) > hw || Math.abs(p[1]) > hh) break;
      pts.push(p);
      if (Math.hypot(p[0] - S[0], p[1] - S[1]) < 18) { done = true; break; }
    }
    out.push(pts); if (!done) out.push(pts.map(([x, y]) => [-x, y]));
  }
  return out;
}
function cutL7() {
  const sk = new Sk(W, H, { id: "i" });
  const GY = 696, TX0 = 40, TX1 = 712, TY0 = 22, TY1 = 462, MC = [376, 242], PW = 300, PH = 196, A = 118;
  // 책상(위에서 내려다본 모습)과 흰 종이
  thin(sk, 0.75, () => {
    for (const [x, i] of [[TX0 + 44, 0], [TX1 - 44, 1]]) { const leg = box(x - 16, TY1 - 10, x + 16, GY - 2); sk.fill(leg, "#A9773F", { dx: 0, dy: 0, wob: 0.3, seed: 5 + i }); sk.ink(leg, { w: 10, seed: 7 + i }); }
    const top = rrect(TX0, TY0, TX1 - TX0, TY1 - TY0, 22);
    sk.fill(top, "#E3C08F", { seed: 11, tex: true, texAng: 0.05 }); sk.ink(top, { w: 11, seed: 12 });
    const paper = rrect(MC[0] - PW, MC[1] - PH, PW * 2, PH * 2, 6);
    sk.fill(paper, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 13 }); sk.ink(paper, { w: 6, seed: 14, wob: 0.5 });
  });
  // 종이 밑에 비치는 막대자석: N극 빨강, S극 파랑
  const MH = 38, ML = 146;
  sk.fill(box(MC[0] - ML, MC[1] - MH, MC[0], MC[1] + MH), NRED, { dx: 0, dy: 0, wob: 0.2, seed: 21, alpha: 0.62 });
  sk.fill(box(MC[0], MC[1] - MH, MC[0] + ML, MC[1] + MH), SBLUE, { dx: 0, dy: 0, wob: 0.2, seed: 22, alpha: 0.62 });
  sk.ink(box(MC[0] - ML, MC[1] - MH, MC[0] + ML, MC[1] + MH), { w: 4.5, color: "#7F8A99", dash: [10, 8], seed: 23, wob: 0.2 });
  // 쇳가루: 극 근처는 촘촘하고, 두 끝을 잇는 굽은 줄로 늘어선다
  const FIL = "#3A3F47";
  fieldLines(A, PW - 14, PH - 12).forEach((ln, i) => sk.ink(ln.map(([x, y]) => [MC[0] + x, MC[1] + y]), { w: 5.5, color: FIL, dash: [9, 6.5], seed: 31 + i, wob: 0.9 }));
  for (const sg of [-1, 1]) for (let i = 0; i < 18; i++) {
    const a = i * Math.PI / 9 + 0.17, r0 = 9 + (i % 3) * 4, r1 = 26 + (i % 4) * 5, c = [MC[0] + sg * A, MC[1]];
    sk.ink(dense([[c[0] + r0 * Math.cos(a), c[1] + r0 * Math.sin(a)], [c[0] + r1 * Math.cos(a), c[1] + r1 * Math.sin(a)]]), { w: 4.5, color: FIL, seed: 81 + i + (sg > 0 ? 20 : 0), wob: 0.3 });
  }
  // 학생: 줄무늬를 들여다보며 가리킨다
  ground(sk, GY, 121);
  const kx = 846, ks = 0.64;
  const PK = pose({ elL: [-100, -326], haL: [-178, -376], elR: [56, -262], haR: [88, -198], tilt: 0.3 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", flip: -1 });
  return sk;
}

/* ---------- g2u7l7b: 기중기의 전자석. 스위치를 켠 동안 쇠붙이를 들어 올린다 ---------- */
function scrap(sk, x, y, kind, k, sd, rot = 0) {
  const cols = ["#AEB9C8", "#8E9AAB", "#C3CCD5"], col = cols[sd % 3];
  sk.at(x, y, k, () => {
    let p;
    if (kind === "nut") { p = poly(Array.from({ length: 6 }, (_, i) => [22 * Math.cos(i * Math.PI / 3), 22 * Math.sin(i * Math.PI / 3)]), 3); }
    else if (kind === "gear") { const g = []; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 27 : 20; g.push([r * Math.cos(a - 0.1), r * Math.sin(a - 0.1)], [r * Math.cos(a + 0.1), r * Math.sin(a + 0.1)]); } p = poly(g, 3); }
    else if (kind === "bolt") { p = poly([[-26, -13], [-10, -13], [-10, -6], [28, -6], [28, 6], [-10, 6], [-10, 13], [-26, 13]], 3); }
    else { p = rrect(-26, -15, 52, 30, 5); }
    sk.fill(p, col, { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(p, { w: 5.5, seed: sd + 1, wob: 0.3 });
    if (kind === "nut" || kind === "gear") { const h = circ(0, 0, 8, { over: 0, seed: sd + 2 }); sk.fill(h, C.white, { dx: 0, dy: 0, wob: 0.1, seed: sd + 3 }); sk.ink(h, { w: 4, seed: sd + 4, wob: 0.2 }); }
  }, rot);
}
function cutL7b() {
  const sk = new Sk(W, H, { id: "j" });
  const GY = 680, MX = 610, MT = 214, YEL = "#F2B63A";
  ground(sk, GY, 11);
  // 기중기
  thin(sk, 0.8, () => {
    const base = rrect(286, GY - 34, 120, 34, 8);
    sk.fill(base, "#7F8FA6", { dx: 0, dy: 0, wob: 0.3, seed: 13 }); sk.ink(base, { w: 9, seed: 14 });
    pipe(sk, dense([[346, GY - 34], [346, 62]]), 17, YEL, 15);
    pipe(sk, dense([[346, 150], [444, 66]]), 9, YEL, 17);
    pipe(sk, dense([[322, 66], [736, 66]]), 17, YEL, 16);
    sk.ink(dense([[MX, 76], [MX, MT - 4]]), { w: 6, seed: 18, wob: 0.3 });
  });
  // 전자석: 쇠 심에 코일을 감았다
  const core = rrect(MX - 112, MT, 224, 100, 16);
  sk.fill(core, "#8E9AAB", { dx: 0, dy: 0, wob: 0.3, seed: 21, tex: 0.8 });
  const cx0 = MX - 84, cx1 = MX + 84, coil = box(cx0, MT - 8, cx1, MT + 70);
  sk.fill(coil, COPPER, { dx: 0, dy: 0, wob: 0.2, seed: 23 });
  thin(sk, 0.8, () => {
    for (let x = cx0 + 14, i = 0; x < cx1; x += 17, i++) sk.ink(dense([[x + 5, MT - 8], [x - 5, MT + 70]]), { w: 4.5, color: "#8E4A1C", seed: 25 + i, wob: 0.2 });
    sk.ink(coil, { w: 7, seed: 41, wob: 0.4 }); sk.ink(core, { w: 9, seed: 22, wob: 0.5 });
  });
  // 붙어 올라온 쇠붙이와, 바닥의 고물 더미에서 끌려 올라오는 쇠붙이
  const MB = MT + 100;
  for (const [x, y, kd, k, r, i] of [[MX - 78, MB + 22, "nut", 1.05, 0.3, 0], [MX - 18, MB + 26, "gear", 1.05, 0, 1], [MX + 50, MB + 14, "bolt", 1.1, 0.1, 2], [MX + 86, MB + 40, "can", 0.9, 1.2, 3], [MX - 50, MB + 66, "bolt", 1.0, 1.4, 4], [MX + 14, MB + 74, "nut", 0.9, 0.5, 5]]) scrap(sk, x, y, kd, k, 51 + i * 7, r);
  scrap(sk, MX - 12, 498, "can", 1.0, 101, -0.3);
  for (const [dx, i] of [[-34, 0], [0, 1], [34, 2]]) sk.ink(dense([[MX - 12 + dx, 530], [MX - 12 + dx, 556 - Math.abs(dx) * 0.3]]), { w: 5, color: C.gray, seed: 105 + i, wob: 0.2 });
  const heap = curve([[MX - 150, GY - 2], [MX - 96, GY - 50], [MX - 20, GY - 78], [MX + 60, GY - 62], [MX + 138, GY - 2]], false, 4);
  sk.fill([...heap, heap[0]], "#C9CED6", { dx: 0, dy: 0, wob: 0.4, seed: 111 }); thin(sk, 0.8, () => sk.ink(heap, { w: 8, seed: 112, wob: 0.8 }));
  for (const [x, y, kd, k, r, i] of [[MX - 84, GY - 26, "gear", 0.9, 0, 0], [MX - 24, GY - 46, "nut", 0.9, 0.4, 1], [MX + 40, GY - 34, "bolt", 0.95, -0.4, 2], [MX + 92, GY - 20, "nut", 0.8, 0.2, 3], [MX - 36, GY - 16, "can", 0.8, 0.1, 4]]) scrap(sk, x, y, kd, k, 121 + i * 7, r);
  // 전선: 코일에서 기둥을 따라 스위치로
  const BX = 240, BY = 470;
  sk.ink(dense([[MX - 22, MT - 8], [MX - 22, 90], [368, 90], [368, BY + 44], [BX + 52, BY + 44]]), { w: 5, color: NRED, seed: 131, wob: 0.8 });
  bolt(sk, MX + 150, MT + 30, 1.0, 141, 0.2); bolt(sk, MX - 150, MT + 44, 0.9, 145, -0.2);
  // 스위치 상자(손잡이를 올려 켠 모습, 초록 불)
  thin(sk, 0.8, () => {
    sk.ink(dense([[BX + 6, BY + 78], [BX + 6, GY]]), { w: 11, seed: 151 });
    const bx = rrect(BX - 40, BY, 92, 84, 10);
    sk.fill(bx, C.cloth, { dx: 0, dy: 0, wob: 0.3, seed: 152 }); sk.ink(bx, { w: 9, seed: 153 });
  });
  const lamp = circ(BX + 28, BY + 24, 11, { over: 0, seed: 155 });
  sk.glow(BX + 28, BY + 24, 30, "#3FAE5A", 0.7, 0.3); sk.fill(lamp, "#3FAE5A", { dx: 0, dy: 0, wob: 0.1, seed: 156 }); sk.ink(lamp, { w: 4.5, seed: 157, wob: 0.2 });
  const hdl = [BX - 56, BY + 6];
  sk.ink(dense([[BX - 4, BY + 44], hdl]), { w: 10, seed: 158, wob: 0.3 });
  sk.dot(BX - 4, BY + 44, 7);
  // 학생: 스위치 손잡이를 잡고 있다
  const kx = 108, ks = 0.6;
  const PK = pose({ ...local(kx, GY, ks, { haR: hdl, elR: [hdl[0] - 34, hdl[1] + 44] }), tilt: 0.06 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", hands: "L" });
  handDot(sk, hdl, C.skin, 161, 15 * ks);
  return sk;
}

/* ---------- g2u7l8: 잘라 보인 스피커. 자석 곁의 코일이 떨리고, 코일에 붙은 얇은 판 위에서 종이 조각이 튄다 ---------- */
function cutL8() {
  const sk = new Sk(W, H, { id: "k" });
  const GY = 684, cx = 462, RIM = 304, RW = 258, BT = 404, BW = 92, BB = 580, MW = 58, MT = 440, MB = 620;
  ground(sk, GY, 11);
  // 틀과 받침
  thin(sk, 0.8, () => {
    for (const sg of [-1, 1]) sk.ink(dense([[cx + sg * (RW + 12), RIM + 4], [cx + sg * 150, MB + 4]]), { w: 8, color: "#7F8A99", seed: 13 + sg, wob: 0.5 });
    const base = rrect(cx - 168, MB, 336, 44, 9);
    sk.fill(base, STEEL, { dx: 0, dy: 0, wob: 0.3, seed: 15, tex: 0.8 }); sk.ink(base, { w: 9, seed: 16 });
    sk.ink(dense([[cx - 60, MB + 44], [cx - 60, GY]]), { w: 9, seed: 17 }); sk.ink(dense([[cx + 60, MB + 44], [cx + 60, GY]]), { w: 9, seed: 18 });
  });
  // 코일의 뒤쪽 감긴 선(자석 뒤로 지나간다)
  for (let i = 0; i < 5; i++) { const y = 452 + i * 27, turn = dense([[cx - BW - 16, y], [cx + BW + 16, y + 9]]); sk.ink(turn, { w: 9, seed: 31 + i, wob: 0.3 }); sk.ink(turn, { w: 4.5, color: COPPER, seed: 31 + i, wob: 0.3 }); }
  // 자석(위쪽 N극 빨강, 아래쪽 S극 파랑)
  const mid = (MT + MB) / 2;
  sk.fill(box(cx - MW, MT, cx + MW, mid), NRED, { dx: 0, dy: 0, wob: 0.2, seed: 21 });
  sk.fill(box(cx - MW, mid, cx + MW, MB), SBLUE, { dx: 0, dy: 0, wob: 0.2, seed: 22 });
  thin(sk, 0.8, () => sk.ink(box(cx - MW, MT, cx + MW, MB), { w: 9, seed: 23, wob: 0.5 }));
  // 코일: 자석을 둘러싼 통에 감겨 있고, 통은 얇은 판에 붙어 있다
  thin(sk, 0.8, () => { for (const sg of [-1, 1]) sk.ink(dense([[cx + sg * BW, BT], [cx + sg * BW, BB]]), { w: 6, seed: 25 + sg, wob: 0.3 }); });
  for (let i = 0; i < 5; i++) {
    const y = 452 + i * 27;
    for (const sg of [-1, 1]) { const c = circ(cx + sg * (BW + 16), y + (sg > 0 ? 9 : 0), 14, { over: 0, seed: 41 + i * 2 + sg }); sk.fill(c, COPPER, { dx: 0, dy: 0, wob: 0.1, seed: 51 + i }); sk.ink(c, { w: 4.5, seed: 61 + i * 2 + sg, wob: 0.2 }); }
  }
  // 코일에서 나온 전선과 음악이 나오는 휴대 전화
  sk.ink(curve([[cx + BW + 30, 572], [cx + 170, 592], [cx + 236, 640], [760, 652]]), { w: 5, color: "#C98A00", seed: 71, wob: 0.4 });
  phone(sk, 776, 640, 1.15, { rot: 0.12, icon: "play" });
  // 얇은 판(진동판): 떨린 자리는 점선
  const CONE = "#F6E7B8";
  const cone = y => [[cx - RW, RIM + y], [cx - BW, BT + y], ...curve([[cx - BW, BT + y], [cx, BT - 30 + y], [cx + BW, BT + y]], false, 4), [cx + RW, RIM + y]];
  sk.ink(dense(cone(-26), 4), { w: 5, color: TEAL, dash: [10, 8], seed: 81, wob: 0.2 });
  pipe(sk, dense(cone(0), 4), 10, CONE, 83, 0.4);
  arrow(sk, [[cx + RW + 48, RIM - 4], [cx + RW + 48, RIM - 48]], { w: 8, color: TEAL, straight: true, seed: 85, head: 18, wob: 0.2 });
  arrow(sk, [[cx + RW + 48, RIM - 4], [cx + RW + 48, RIM + 40]], { w: 8, color: TEAL, straight: true, seed: 89, head: 18, wob: 0.2 });
  // 통통 튀는 종이 조각
  const PC = ["#F28BA0", "#F7C948", "#6FA8DC", "#8FD19E", "#F08A2E", "#C9A7E0"];
  for (const [x, y, r, i] of [[-190, 232, 0.3, 0], [-128, 150, -0.4, 1], [-64, 262, 0.7, 2], [-6, 176, 0.1, 3], [58, 96, -0.6, 4], [112, 236, 0.5, 5], [176, 168, -0.2, 6], [-78, 70, 0.9, 7]]) {
    sk.at(cx + x, y, 1, () => { const p = poly([[-16, -12], [16, -12], [16, 12], [-16, 12]], 3); sk.fill(p, PC[i % 6], { dx: 0, dy: 0, wob: 0.2, seed: 101 + i }); sk.ink(p, { w: 5, seed: 111 + i, wob: 0.3 }); }, r);
    for (const d of [-9, 9]) sk.ink(dense([[cx + x + d, y + 26], [cx + x + d, y + 42]]), { w: 4, color: C.gray, seed: 121 + i * 2 + d, wob: 0.2 });
  }
  note(sk, cx + 262, 116, 1.25, { color: SBLUE, seed: 131 }); note(sk, cx + 206, 66, 0.95, { color: SBLUE, seed: 135, rot: -0.2 });
  // 학생: 튀는 종이 조각을 보고 놀란다
  const kx = 96, ks = 0.56;
  const PK = pose({ elL: [-96, -300], haL: [-140, -384], elR: [96, -300], haR: [140, -384], tilt: 0.1 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student" });
  // 쌤: 자석 곁의 코일을 가리킨다
  const tx = 884, ts = 0.56;
  const PT = pose({ elL: [-98, -342], haL: [-166, -372], elR: [52, -262], haR: [82, -198], tilt: -0.05 });
  drawFigure(sk, tx, GY, ts, PT, { ...TEACHER, name: "teacher" });
  return sk;
}

export function cuts() {
  return [
    { name: "g2u7l1", theme: "elec", orig: null, sk: cutL1(), alt: "플라스틱 미끄럼틀을 타고 내려온 아이의 머리카락이 사방으로 곤두서 있고, 옆에서 스틱맨 쌤이 놀라 두 손을 든 장면", cap: "미끄럼틀을 탔더니 머리카락이 서로 밀어내며 곤두섰어요" },
    { name: "g2u7l2", theme: "elec", orig: null, sk: cutL2(), alt: "옷에 문지른 플라스틱 자를 실에 매단 금속 클립에 닿지 않게 가까이 대자 클립이 자 쪽으로 끌려와 실이 기울어진 장면", cap: "닿지도 않았는데 클립이 자 쪽으로 끌려와요" },
    { name: "g2u7l3", theme: "elec", orig: null, sk: cutL3(), alt: "흐르는 풀에서 튜브를 탄 사람들이 한 방향으로 떠가고, 물길 한쪽의 펌프가 물을 밀어 흐름을 이어 주는 장면", cap: "물은 한 방향으로 돌고, 펌프가 그 흐름을 이어 줘요" },
    { name: "g2u7l4", theme: "elec", orig: null, sk: cutL4(), alt: "똑같은 수도꼭지에 굵은 호스와 가는 호스를 끼워 들었는데, 굵은 호스에서는 물이 콸콸 솟고 가는 호스에서는 졸졸 나와 스틱맨이 고개를 갸웃하는 장면", cap: "가는 호스에서는 같은 시간에 나오는 물이 훨씬 적어요" },
    { name: "g2u7l4b", theme: "elec", orig: null, sk: cutL4b(), alt: "고무장갑을 낀 스틱맨 쌤이 껍질을 조금 벗긴 전선을 들어 보이고, 벗긴 끝에 속의 금속 선이 드러나 보이는 장면", cap: "전선의 속은 금속 선, 겉은 껍질이에요" },
    { name: "g2u7l5", theme: "elec", orig: null, sk: cutL5(), alt: "나무에 두른 줄 전구 두 줄 가운데 한 줄로 이은 위쪽 줄은 전구 하나가 빠져 전부 꺼져 있고, 두 가닥 사이에 걸친 아래쪽 줄은 하나가 빠졌는데도 나머지가 켜져 있는 장면", cap: "위 줄은 하나가 빠지자 다 꺼지고, 아래 줄은 나머지가 켜져 있어요" },
    { name: "g2u7l6", theme: "elec", orig: null, sk: cutL6(), alt: "자전거 발전기에 작은 전구를 연결하면 가볍게 밟아도 불이 켜지는데, 전기 주전자를 연결하자 스틱맨이 땀을 뻘뻘 흘리며 페달을 밟는 장면", cap: "전구는 가볍게, 전기 주전자는 땀을 뻘뻘 흘려야 해요" },
    { name: "g2u7l6b", theme: "elec", orig: null, sk: cutL6b(), alt: "똑같이 밝은 두 전등 아래에서 한 스틱맨은 전구가 뜨거워 손부채질을 하고, 다른 스틱맨은 편안히 책을 읽는 장면", cap: "밝기는 같은데 한쪽 전구만 뜨거워요" },
    { name: "g2u7l7", theme: "elec", orig: null, sk: cutL7(), alt: "종이 밑에 막대자석을 두고 쇳가루를 뿌리자 쇳가루가 자석의 두 끝을 잇는 굽은 줄무늬로 늘어서고, 스틱맨이 그 무늬를 들여다보는 장면", cap: "쇳가루가 자석의 두 끝을 잇는 줄무늬로 늘어서요" },
    { name: "g2u7l7b", theme: "elec", orig: null, sk: cutL7b(), alt: "고물 처리장의 기중기 끝에 달린 전자석이 쇠붙이를 들어 올리고, 스틱맨이 켜 둔 스위치 손잡이를 잡고 있는 장면", cap: "스위치를 켠 동안에만 전자석이 쇠붙이를 들어 올려요" },
    { name: "g2u7l8", theme: "elec", orig: null, sk: cutL8(), alt: "잘라 보인 스피커 속에 자석과 감긴 코일이 보이고, 코일에 붙은 얇은 판 위에서 종이 조각이 통통 튀는 장면", cap: "자석 곁의 코일이 떨리면 얇은 판도 함께 떨려요" },
  ];
}
