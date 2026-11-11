// 중1 과학 Ⅴ단원(힘의 작용) 개념 컷 코드 그림.
// 목록은 Ⅴ단원 v5 세션이 새 개념 스텝을 쓰며 낸 것(D:\Brilliant Science\output\g1-v5\u5\concept-cuts.md): u5l1, u5l2, u5l4 ~ u5l7.
// u5l3 은 만화가 중력, 무게, 질량을 정의해 개념 스텝이 없다.
// 화살표 문법: 힘은 빨강(꼬리 = 작용점, 길이 = 크기, 촉 = 방향). 물체 위에 그릴 때는 흰 테를 깔아 바탕과 떼어 놓는다.
// 움직임(지나온 길, 갈 길, 짚는 순서)은 청록, 되돌아가는 움직임 같은 보조 표시는 회색.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, drop, squiggle, arrow, hash } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { W, H, lerpx, lerp2, thin } from "./common.mjs";

const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
// 힘의 화살표: 빨강 + 흰 테
function force(sk, a, b, sd, o = {}) {
  const w = o.w ?? 12, head = o.head ?? 30;
  if (o.halo !== false) arrow(sk, [a, b], { w: w + 10, color: C.white, straight: true, seed: sd, head, wob: 0.2 });
  arrow(sk, [a, b], { w, color: o.color ?? C.red, straight: true, seed: sd, head, wob: 0.2 });
}
// 화면 좌표로 잡은 관절을 인물 좌표(발 사이 원점, 배율 s)로 바꾼다(splash.mjs 와 같은 도우미)
const local = (ox, oy, s, j) => Object.fromEntries(Object.entries(j).map(([k, v]) => [k, Array.isArray(v) ? [(v[0] - ox) / s, (v[1] - oy) / s] : v]));

/* ---------- u5l1: 문을 미는 힘을 화살표 하나에 ---------- */
// 문은 옆으로 밀어 여는 미닫이로 그린다. 화살표의 꼬리(작용점)가 손이 닿은 문 위에 오고, 몸통과 촉이 문이 밀려 갈 쪽으로 문 위에 눕는다
function cutU5l1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 672;
  ground(sk, GY, 11);
  const DL = 300, DR = 604, DT = 196; // 문틀(열린 자리)
  const L0 = 334, L1 = 640;           // 문짝(오른쪽으로 조금 밀려 왼쪽에 틈이 보인다)
  thin(sk, 0.72, () => {
    const wall = poly([[268, 112], [946, 112], [946, GY], [268, GY]], 4);
    sk.fill(wall, "#F4EEE4", { dx: 0, dy: 0, wob: 0.4, seed: 21 });
    sk.ink(dense([[268, GY], [268, 112], [946, 112]]), { w: 9, seed: 22, color: "#B7AC9C" });
    const hole = poly([[DL, DT], [DR, DT], [DR, GY], [DL, GY]], 4);
    sk.fill(hole, "#D9E4EE", { dx: 0, dy: 0, wob: 0.3, seed: 23 });
    sk.ink(dense([[DL, GY], [DL, DT], [DR, DT], [DR, GY]]), { w: 11, seed: 24 });
    // 문을 매다는 레일과 바퀴
    const rail = rrect(290, 164, 640, 16, 6);
    sk.fill(rail, "#8A9099", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 25 }); sk.ink(rail, { w: 9, seed: 26 });
    for (const [x, i] of [[L0 + 50, 0], [L1 - 50, 1]]) { sk.ink(dense([[x, 180], [x, DT - 2]]), { w: 9, seed: 27 + i }); const wh = circ(x, 176, 13, { over: 0.1, seed: 29 + i }); sk.fill(wh, "#C9D1D9", { dx: 0, dy: 0, wob: 0.3, seed: 31 + i }); sk.ink(wh, { w: 8, seed: 33 + i }); }
    // 문짝
    const leaf = rrect(L0, DT - 4, L1 - L0, GY - DT + 2, 6);
    sk.fill(leaf, C.wood, { seed: 35, tex: 0.55, texAng: 1.55 });
    for (const [y0, y1, i] of [[DT + 30, 404, 0], [440, GY - 34, 1]]) sk.ink(rrect(L0 + 30, y0, L1 - L0 - 60, y1 - y0, 6), { w: 7, color: C.woodDark, seed: 36 + i, wob: 0.5 });
    sk.ink(leaf, { w: 12, seed: 38 });
  });
  // 힘의 화살표: 손이 닿은 곳에서 시작해 문이 밀려 갈 쪽(오른쪽)으로
  const AY = 462, A0 = [L0 + 8, AY], A1 = [L0 + 252, AY];
  force(sk, A0, A1, 41, { w: 13, head: 32 });
  // 쌤이 짚은 순서: 시작점 → 몸통 → 촉(청록 점선으로 통통 건너뛴다)
  const hopY = AY - 24, hx = [A0[0] + 8, (A0[0] + A1[0]) / 2, A1[0] - 10];
  for (let i = 0; i < 2; i++) sk.ink(curve([[hx[i], hopY], [(hx[i] + hx[i + 1]) / 2, hopY - 86], [hx[i + 1], hopY]]), { w: 7, color: C.teal, dash: [14, 10], seed: 43 + i, wob: 0.3 });
  hx.forEach((x, i) => { const d = circ(x, hopY, 9, { over: 0.1, seed: 46 + i }); sk.fill(d, C.teal, { dx: 0, dy: 0, wob: 0.2, seed: 49 + i }); sk.ink(d, { w: 4, color: C.white, seed: 52 + i, wob: 0.2 }); });
  // 학생: 두 손으로 문 왼쪽 끝을 민다
  const P = pose({ hip: [-6, -208], neck: [34, -336], head: [52, -428], tilt: 0.12,
    elR: [118, -310], haR: [200, -292], elL: [112, -298], haL: [196, -276],
    knL: [-48, -106], ftL: [-92, 0], knR: [34, -110], ftR: [40, 0] });
  drawFigure(sk, 186, GY, 0.72, P, { ...STUDENT, name: "student" });
  // 쌤: 오른쪽에서 지시봉으로 화살촉을 짚는다
  const T = pose({ elR: [96, -330], haR: [150, -372], elL: [-50, -262], haL: [-24, -220], tilt: -0.04 });
  const tx = 826, ts = 0.72;
  drawFigure(sk, tx, GY, ts, T, { ...TEACHER, name: "teacher", mirror: true, hands: "L" });
  const th = [tx - ts * 150, GY - ts * 372];
  sk.ink(dense([th, [hx[2] + 12, hopY - 8]]), { w: 8, color: C.woodDark, seed: 51, wob: 0.2 });
  handDot(sk, th, C.skin, 52, 12);
  return sk;
}

/* ---------- u5l2: 양쪽에서 똑같이 밀면 책장은 꼼짝 않는다 ---------- */
const BOOKS = ["#E0503A", "#3F7CC0", "#3FAE5A", "#F2D03B", "#8E6BBF", "#F58A2E", "#2F8EE0", "#C0392B"];
function bookcase(sk, x0, x1, top, bot, sd) {
  const mid = top + 236;
  thin(sk, 0.72, () => {
    const body = rrect(x0, top, x1 - x0, bot - top, 8);
    sk.fill(body, "#B98652", { seed: sd, tex: true, texAng: 0.03 });
    // 책 칸 셋
    const rows = [[top + 18, top + 84], [top + 98, top + 164], [top + 178, mid - 12]];
    rows.forEach(([y0, y1], r) => {
      const back = poly([[x0 + 16, y0], [x1 - 16, y0], [x1 - 16, y1], [x0 + 16, y1]], 4);
      sk.fill(back, "#7A5634", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 + r });
      let x = x0 + 22, k = 0;
      while (x < x1 - 40) {
        const bw = 18 + Math.floor(hash(sd + r * 31 + k * 7.3) * 16), bh = (y1 - y0) - 6 - Math.floor(hash(sd + r * 17 + k * 3.1) * 16);
        if (x + bw > x1 - 22) break;
        const lean = (r + k) % 7 === 4 ? 0.16 : 0;
        const bk = lean ? poly([[x + 8, y1 - bh], [x + bw + 8, y1 - bh + 4], [x + bw, y1], [x, y1]], 3) : rrect(x, y1 - bh, bw, bh, 3);
        sk.fill(bk, BOOKS[(r * 3 + k * 5) % BOOKS.length], { dx: 0, dy: 0, wob: 0.3, seed: sd + 10 + r * 20 + k });
        sk.ink(bk, { w: 5, seed: sd + 11 + r * 20 + k, wob: 0.3 });
        x += bw + 3 + (lean ? 8 : 0); k++;
      }
      sk.ink(dense([[x0 + 10, y1 + 6], [x1 - 10, y1 + 6]]), { w: 9, seed: sd + 80 + r, color: "#6B4A2E" });
    });
    // 아래 수납장 문 두 짝
    for (const [a, b, i] of [[x0 + 18, (x0 + x1) / 2 - 4, 0], [(x0 + x1) / 2 + 4, x1 - 18, 1]]) {
      const d = rrect(a, mid + 6, b - a, bot - mid - 26, 6);
      sk.fill(d, "#CC9A62", { dx: 0, dy: 0, wob: 0.3, seed: sd + 90 + i });
      sk.ink(d, { w: 8, seed: sd + 92 + i });
      sk.dot(i ? a + 18 : b - 18, mid + 60, 7, "#6B4A2E");
    }
    sk.ink(body, { w: 12, seed: sd + 95 });
  });
}
function cutU5l2() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 672;
  ground(sk, GY, 11);
  const x0 = 330, x1 = 630;
  bookcase(sk, x0, x1, 236, GY, 21);
  // 미는 자세(오른쪽을 보고 민다). 쌤은 같은 자세를 거울로 뒤집는다
  const push = pose({ hip: [-6, -206], neck: [26, -334], head: [40, -426], tilt: 0.22,
    elR: [110, -300], haR: [196, -256], elL: [102, -290], haL: [190, -244],
    knL: [-50, -104], ftL: [-96, 0], knR: [32, -110], ftR: [38, 0] });
  const s = 0.72, AY = GY - s * 256;
  // 크기가 같고 방향이 반대인 두 힘(화살표 길이가 같다)
  force(sk, [x0 + 6, AY], [x0 + 118, AY], 41, { w: 13, head: 30 });
  force(sk, [x1 - 6, AY], [x1 - 118, AY], 45, { w: 13, head: 30 });
  drawFigure(sk, x0 - s * 196, GY, s, push, { ...STUDENT, name: "student" });
  drawFigure(sk, x1 + s * 196, GY, s, { ...push, tilt: 0.3 }, { ...TEACHER, name: "teacher", mirror: true });
  // 둘 다 어리둥절
  qmark(sk, 252, 214, 0.62, { color: C.teal, seed: 61, rot: 0.12 });
  qmark(sk, 712, 214, 0.62, { color: C.teal, seed: 63, rot: -0.12 });
  drop(sk, 168, 300, 0.9, { rot: -0.3 });
  drop(sk, 796, 296, 0.9, { rot: 0.3 });
  return sk;
}

/* ---------- u5l4: 눌린 트램펄린이 되돌아가며 밀어 올린다 ---------- */
// 발이 아직 매트에 닿아 있는 순간을 그린다(탄성력은 닿아 있는 동안 작용한다). 화살표 꼬리는 발이 닿은 곳
function cutU5l4() {
  const sk = new Sk(W, H, { id: "c" });
  const GY = 690, MY = 520, M0 = 252, M1 = 708, MX = (M0 + M1) / 2, DIP = 70;
  ground(sk, GY, 11);
  // 틀: 다리 둘씩 + 테두리 관
  thin(sk, 0.55, () => {
    for (const [x, i] of [[216, 0], [744, 1]]) {
      sk.ink(dense([[x, MY + 8], [x - 40, GY]]), { w: 12, seed: 21 + i, color: "#4A5568" });
      sk.ink(dense([[x, MY + 8], [x + 40, GY]]), { w: 12, seed: 23 + i, color: "#4A5568" });
    }
    sk.ink(dense([[196, MY + 6], [764, MY + 6]]), { w: 16, seed: 25, color: "#4A5568" });
  });
  // 용수철(테두리와 매트 사이)
  for (const [a, b, i] of [[202, M0, 0], [M1, 758, 1]]) {
    const pts = []; const n = 7;
    for (let k = 0; k <= n * 2; k++) pts.push([lerpx(a, b, k / (n * 2)), MY - 2 + (k % 2 ? -8 : 8) * (k > 0 && k < n * 2 ? 1 : 0)]);
    sk.ink(pts, { w: 5, seed: 27 + i, wob: 0.2, color: "#8A9099" });
  }
  // 되돌아갈 평평한 자리(회색 점선)와 아직 눌린 매트(실선)
  sk.ink(dense([[M0, MY - 2], [M1, MY - 2]]), { w: 6, color: C.gray, dash: [14, 11], seed: 31, wob: 0.2 });
  const matPts = curve([[M0, MY - 2], [M0 + 110, MY + DIP * 0.62], [MX, MY + DIP], [M1 - 110, MY + DIP * 0.62], [M1, MY - 2]], false, 4);
  sk.ink(matPts, { w: 10, color: C.navy, seed: 33, wob: 0.3 });
  // 매트가 제자리로 돌아가는 움직임(회색 작은 화살표)
  for (const [x, i] of [[M0 + 92, 0], [M1 - 92, 1]]) arrow(sk, [[x, MY + DIP * 0.5], [x, MY + 10]], { w: 6, color: C.gray, straight: true, seed: 35 + i, head: 14, wob: 0.2 });
  // 학생: 눌린 매트 바닥에 발을 딛고 두 팔을 번쩍 들며 튀어 오르려 한다
  const fy = MY + DIP - 4, s = 0.66;
  const P = pose({ elL: [-100, -432], haL: [-168, -548], elR: [100, -432], haR: [168, -548],
    knL: [-12, -106], ftL: [-16, 0], knR: [12, -106], ftR: [18, 0], tilt: -0.04 });
  drawFigure(sk, MX, fy, s, P, { ...STUDENT, name: "student" });
  // 탄성력: 발이 닿은 곳에서 위로(다리 옆으로 비켜 그린다)
  force(sk, [MX + 30, fy - 4], [MX + 30, fy - 150], 41, { w: 13, head: 30 });
  return sk;
}

/* ---------- u5l5: 미끄럼틀 중간에서 멈춘 쌤(맞닿은 곳에 뒤쪽 화살표) ---------- */
function cutU5l5() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 676, PT = 380, PX0 = 150, PX1 = 300;
  const k = 0.5, ys = x => PT + (x - PX1) * k; // 미끄럼판 윗면
  const END = 820, BAND = 28;
  ground(sk, GY, 11);
  thin(sk, 0.8, () => {
    // 기둥과 사다리
    for (const [x, i] of [[PX0 + 12, 0], [PX1 - 12, 1]]) sk.ink(dense([[x, PT + 16], [x, GY]]), { w: 12, seed: 21 + i, color: "#4A5568" });
    for (const [x, i] of [[ys(560) > 0 ? 560 : 560, 0], [770, 1]]) sk.ink(dense([[x, ys(x) + BAND], [x, GY]]), { w: 12, seed: 23 + i, color: "#4A5568" });
    for (const [a, b, i] of [[[78, GY], [PX0, PT]], [[112, GY], [PX0 + 34, PT + 6]]].map((p, i) => [...p, i])) sk.ink(dense([a, b]), { w: 10, seed: 25 + i, color: "#4A5568" });
    for (let r = 1; r < 7; r++) { const t = r / 7; sk.ink(dense([lerp2([78, GY], [PX0, PT], t), lerp2([112, GY], [PX0 + 34, PT + 6], t)]), { w: 8, seed: 27 + r, color: "#4A5568" }); }
    // 꼭대기 발판
    const deck = rrect(PX0 - 6, PT, PX1 - PX0 + 12, 18, 5);
    sk.fill(deck, "#3F7CC0", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 35 }); sk.ink(deck, { w: 9, seed: 36 });
    // 미끄럼판: 윗면 + 옆판(두께 띠) + 끝의 평평한 출구
    const top = [], bot = [];
    for (let x = PX1; x <= END; x += 20) { top.push([x, ys(x)]); bot.push([x, ys(x) + BAND]); }
    top.push([END + 30, ys(END) + 10], [END + 96, ys(END) + 14]);
    bot.push([END + 30, ys(END) + 10 + BAND], [END + 96, ys(END) + 14 + BAND]);
    const chute = [...dense(top), ...dense(bot.slice().reverse()), top[0]];
    sk.fill(chute, "#F5B841", { seed: 37, tex: true, texAng: Math.atan(k) });
    sk.ink(chute, { w: 11, seed: 38 });
    sk.ink(curve(top.map(([x, y]) => [x, y + 9])), { w: 5, color: "#FFE08A", seed: 39, wob: 0.3 });
  });
  // 학생: 꼭대기에서 허리에 손을 얹고 기다린다
  const S = pose({ elL: [-74, -276], haL: [-24, -222], elR: [74, -276], haR: [24, -222], tilt: 0.16 });
  drawFigure(sk, 214, PT, 0.55, S, { ...STUDENT, name: "student" });
  // 쌤: 미끄럼판 중간에 앉은 채 멈췄다(다리는 비탈을 따라 뻗고, 한 손은 판 가장자리를 짚고, 한 손은 번쩍)
  const hip = [540, ys(540) - 13], ox = 540, oy = 676, s = 0.72;
  const dir = [Math.cos(Math.atan(k)), Math.sin(Math.atan(k))];
  const at = (p, d) => [p[0] + dir[0] * d, p[1] + dir[1] * d];
  const kn0 = at(hip, 74), ft = at(hip, 146), kn = [kn0[0], kn0[1] - 24];
  const sit = pose(local(ox, oy, s, { hip, neck: [hip[0] - 14, hip[1] - 94], head: [hip[0] - 22, hip[1] - 162],
    knL: [kn[0], kn[1]], ftL: [ft[0], ft[1] - 8], knR: [kn[0] + 8, kn[1] - 6], ftR: [ft[0] + 10, ft[1] - 14],
    elL: [hip[0] + 26, hip[1] - 40], haL: [kn[0] - 6, kn[1] - 10], elR: [hip[0] + 52, hip[1] - 106], haR: [hip[0] + 98, hip[1] - 156], tilt: -0.1 }));
  drawFigure(sk, ox, oy, s, sit, { ...TEACHER, name: "teacher", coat: { ...TEACHER.coat, len: 18 } });
  drop(sk, hip[0] + 64, hip[1] - 236, 1, { rot: 0.3 });
  // 마찰력: 맞닿은 곳에서 미끄러지려는 쪽과 반대(비탈 위쪽)로
  const c = [hip[0] + 8, ys(hip[0] + 8) + 9];
  force(sk, c, at(c, -150), 41, { w: 13, head: 30 });
  return sk;
}

/* ---------- u5l6: 튜브를 끼고 뜬 학생, 물이 아래에서 떠받친다 ---------- */
function cutU5l6() {
  const sk = new Sk(W, H, { id: "e" });
  const WL = 452; // 물높이
  const wave = x => WL + 5 * Math.sin(x / 38) + 2 * Math.sin(x / 13);
  // 오른쪽 수영장 가장자리(타일 벽 + 바닥)와 사다리 손잡이
  const DECK = WL - 70, EDGE = 800;
  thin(sk, 0.78, () => {
    const deck = poly([[EDGE, DECK], [946, DECK], [946, 712], [EDGE, 712]], 4);
    sk.fill(deck, "#E8F1F6", { dx: 0, dy: 0, wob: 0.3, seed: 21 });
    for (let y = DECK + 46; y < 712; y += 46) sk.ink(dense([[EDGE + 4, y], [944, y]]), { w: 4, color: "#B9CFDC", seed: 22 + y, wob: 0.2 });
    for (let x = EDGE + 48; x < 946; x += 48) sk.ink(dense([[x, DECK + 4], [x, 710]]), { w: 4, color: "#B9CFDC", seed: 23 + x, wob: 0.2 });
    sk.ink(dense([[EDGE, 712], [EDGE, DECK], [946, DECK]]), { w: 11, seed: 24 });
    for (const [dx, i] of [[0, 0], [40, 1]]) sk.ink(curve([[EDGE + 40 + dx, DECK + 2], [EDGE + 40 + dx, DECK - 70], [EDGE + 14 + dx, DECK - 94], [EDGE - 18 + dx, DECK - 80], [EDGE - 22 + dx, DECK - 20], [EDGE - 22 + dx, DECK + 170]]), { w: 9, color: "#9AA3AD", seed: 25 + i, wob: 0.3 });
  });
  // 학생(물속 다리는 물빛 아래로 비친다)
  const fx = 420, s = 0.72, hipY = WL - 4, fy = hipY + s * 212;
  const P = pose({ elL: [-118, -262], haL: [-166, -250], elR: [118, -262], haR: [166, -250], tilt: 0.06,
    knL: [-30, -104], ftL: [-44, 0], knR: [36, -110], ftR: [64, -14] });
  drawFigure(sk, fx, fy, s, P, { ...STUDENT, name: "student", hands: false, mirror: true });
  // 물
  const top = []; for (let x = 14; x <= EDGE; x += 6) top.push([x, wave(x)]);
  sk.fill([...top, [EDGE, 712], [14, 712], top[0]], "#9ED3F2", { dx: 0, dy: 0, wob: 0, seed: 31, alpha: 0.62 });
  // 튜브(빨강 흰 줄무늬), 물에 반쯤 잠겨 뜬다
  const TX0 = fx - 150, TX1 = fx + 150, TY = WL - 34, TH = 68;
  const tube = rrect(TX0, TY, TX1 - TX0, TH, 34);
  sk.fill(tube, "#F7C548", { dx: 0.8, dy: 1, wob: 0.4, seed: 33 });
  for (const [x, i] of [[TX0 + 50, 0], [fx - 16, 1], [TX1 - 84, 2]]) sk.fill(poly([[x, TY + 3], [x + 34, TY + 3], [x + 27, TY + TH - 3], [x - 7, TY + TH - 3]], 3), C.white, { dx: 0, dy: 0, wob: 0.3, seed: 34 + i });
  sk.ink(curve([[TX0 + 30, TY + 15], [fx, TY + 9], [TX1 - 30, TY + 15]]), { w: 5, color: "#FFF1AE", seed: 37, wob: 0.3 });
  sk.ink(tube, { w: 9, seed: 38 });
  // 튜브 위에 얹은 손
  for (const [sg, i] of [[-1, 0], [1, 1]]) handDot(sk, [fx + sg * s * 166, fy - s * 250], C.skin, 39 + i, 13);
  // 물높이 선(튜브 뒤는 지나지 않는다)과 잔물결
  sk.ink(top.filter(([x]) => x < TX0 - 4), { w: 8, color: "#3F8FC4", seed: 41, wob: 0.3 });
  sk.ink(top.filter(([x]) => x > TX1 + 4), { w: 8, color: "#3F8FC4", seed: 42, wob: 0.3 });
  for (const [x, i] of [[TX0 - 56, 0], [TX1 + 48, 1]]) sk.ink(curve([[x - 24, WL + 20], [x, WL + 13], [x + 24, WL + 20]]), { w: 5, color: "#3F8FC4", seed: 43 + i, wob: 0.2 });
  // 부력: 물에 닿은 튜브 바닥에서 위로 하나(꼬리 = 작용점)
  const ax = TX1 - 14;
  force(sk, [ax, TY + TH - 10], [ax, TY - 118], 51, { w: 14, head: 32 });
  return sk;
}

/* ---------- u5l7: 곧게 가던 퍽을 옆에서 톡, 길이 꺾인다 ---------- */
function puckAt(sk, x, y, sd) {
  // 납작한 검은 원기둥(비스듬히 내려다본 모습). (x, y) = 윗면 가운데
  const rx = 38, ry = 14, h = 14;
  sk.fill([...ell(x, y, rx, ry, Math.PI, Math.PI * 2), ...ell(x, y + h, rx, ry, 0, Math.PI), [x - rx, y]], "#2B2B30", { dx: 0, dy: 0, wob: 0.2, seed: sd });
  sk.fill(ell(x, y, rx, ry), "#4A4A52", { dx: 0, dy: 0, wob: 0.2, seed: sd + 1 });
  sk.ink(ell(x, y, rx, ry), { w: 5, seed: sd + 2, wob: 0.2 });
  sk.ink(dense([[x - rx, y], [x - rx, y + h]]), { w: 5, seed: sd + 3, wob: 0.1 });
  sk.ink(dense([[x + rx, y], [x + rx, y + h]]), { w: 5, seed: sd + 4, wob: 0.1 });
  sk.ink(ell(x, y + h, rx, ry, 0, Math.PI), { w: 5, seed: sd + 5, wob: 0.1 });
}
function cutU5l7() {
  const sk = new Sk(W, H, { id: "f" });
  const BT = 214, BB = 282; // 링크 벽 위아래
  thin(sk, 0.78, () => {
    const ice = poly([[14, BB], [946, BB], [946, 712], [14, 712]], 4);
    sk.fill(ice, "#EEF7FC", { dx: 0, dy: 0, wob: 0.3, seed: 21 });
    const board = poly([[14, BT], [946, BT], [946, BB], [14, BB]], 4);
    sk.fill(board, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 22 });
    sk.fill(poly([[14, BT], [946, BT], [946, BT + 16], [14, BT + 16]], 3), "#7FB2E5", { dx: 0, dy: 0, wob: 0.3, seed: 23 });
    sk.ink(dense([[14, BT], [946, BT]]), { w: 9, seed: 24 });
    sk.ink(dense([[14, BB], [946, BB]]), { w: 9, seed: 25 });
    for (let x = 160; x < 946; x += 240) sk.ink(dense([[x, BT + 16], [x, BB]]), { w: 5, color: C.grayLight, seed: 26 + x, wob: 0.2 });
  });
  for (const [a, b, i] of [[[60, 360], [230, 352]], [[650, 400], [880, 392]], [[90, 660], [320, 654]], [[690, 628], [900, 622]]].map((p, i) => [...p, i])) sk.ink(dense([a, b]), { w: 5, color: "#CFE5F2", seed: 31 + i, wob: 0.3 });
  const PY = 566, P = [478, PY];
  // 가던 길(점선): 왼쪽에서 와서 그대로 곧게 갈 뻔한 길
  sk.ink(dense([[40, PY + 6], [926, PY + 6]]), { w: 7, color: C.teal, dash: [2, 16], seed: 41, wob: 0.1 });
  arrow(sk, [[880, PY + 6], [926, PY + 6]], { w: 7, color: C.teal, straight: true, seed: 42, head: 18, wob: 0.1 });
  // 꺾인 길(실선)
  arrow(sk, [[P[0] + 44, PY + 18], [756, 700]], { w: 9, color: C.teal, straight: true, seed: 43, head: 24, wob: 0.2 });
  // 학생: 길 뒤쪽에 서서 스틱으로 퍽의 옆을 톡 친다(두 손은 허리 아래에서 스틱을 잡는다)
  const fx = 346, fy = 500, s = 0.66;
  const end = [398, 366], heel = [446, 544];
  const along = t => lerp2(end, heel, t);
  const hT = along(0.14), hL = along(0.34);
  const toL = q => [(q[0] - fx) / s, (q[1] - fy) / s];
  const B = pose({ hip: [0, -192], neck: [62, -298], head: [82, -386], tilt: 0.2,
    elR: [96, -230], haR: toL(hT), elL: [104, -200], haL: toL(hL),
    knL: [-40, -98], ftL: [-74, 0], knR: [44, -100], ftR: [52, 0] });
  drawFigure(sk, fx, fy, s, B, { ...STUDENT, name: "student", hands: false });
  // 스케이트 날
  for (const [x, i] of [[fx - 74 * s, 0], [fx + 52 * s, 1]]) { sk.ink(dense([[x - 20, fy + 11], [x + 24, fy + 11]]), { w: 5, color: "#8A9099", seed: 51 + i, wob: 0.1 }); sk.ink(dense([[x - 10, fy + 2], [x - 10, fy + 10]]), { w: 4, seed: 53 + i, wob: 0.1 }); sk.ink(dense([[x + 12, fy + 2], [x + 12, fy + 10]]), { w: 4, seed: 55 + i, wob: 0.1 }); }
  // 스틱(날은 퍽의 뒤쪽 옆면에 닿는다)
  sk.ink(dense([end, heel]), { w: 10, color: "#6B4A2E", seed: 57, wob: 0.2 });
  sk.ink(curve([[heel[0] - 4, heel[1] - 2], [heel[0] + 30, heel[1] + 1], [heel[0] + 60, heel[1] - 1]]), { w: 13, color: "#3A3A40", seed: 58, wob: 0.2 });
  handDot(sk, hT, C.skin, 59, 11); handDot(sk, hL, C.skin, 60, 11);
  puckAt(sk, P[0], PY - 6, 61);
  // 스틱이 퍽에 준 힘(옆에서 톡)
  force(sk, [P[0] - 4, PY - 18], [P[0] - 4, PY + 92], 71, { w: 12, head: 28 });
  return sk;
}

export function cuts() {
  return [
    { name: "u5l1", theme: "force5", orig: null, sk: cutU5l1(), alt: "미닫이문을 미는 학생의 손에서 문 위로 빨간 화살표가 뻗고, 쌤이 지시봉으로 화살표의 시작점과 몸통과 촉을 차례로 짚는 장면", cap: "어디를, 얼마나 세게, 어느 쪽으로. 화살표 하나면 충분해요" },
    { name: "u5l2", theme: "force5", orig: null, sk: cutU5l2(), alt: "무거운 책장을 학생과 쌤이 양쪽에서 같은 크기로 밀어 꼼짝 않아 둘 다 어리둥절한 장면, 양쪽 화살표의 길이가 같다", cap: "양쪽에서 똑같이 밀면 남는 힘이 없어요" },
    { name: "u5l4", theme: "force5", orig: null, sk: cutU5l4(), alt: "학생이 트램펄린에서 튕겨 오르고, 눌렸던 매트가 평평하게 돌아가며 위쪽 화살표로 밀어 주는 장면", cap: "눌린 트램펄린은 되돌아가며 나를 밀어 올려요" },
    { name: "u5l5", theme: "force5", orig: null, sk: cutU5l5(), alt: "미끄럼틀 중간에서 멈춰 버린 쌤, 바지와 미끄럼판이 맞닿은 곳에 비탈 위쪽을 향한 화살표, 꼭대기에서 기다리는 학생", cap: "맞닿은 곳에서 미끄러짐을 막는 힘이 있어요" },
    { name: "u5l6", theme: "force5", orig: null, sk: cutU5l6(), alt: "수영장에서 튜브를 끼고 떠 있는 학생, 물이 튜브를 위로 떠받치는 화살표가 튜브 바닥에서 위로 뻗는다", cap: "물이 아래에서 위로 떠받쳐 줘요" },
    { name: "u5l7", theme: "force5", orig: null, sk: cutU5l7(), alt: "얼음판 위를 곧게 미끄러지던 퍽을 학생이 스틱으로 옆에서 톡 쳐서 길이 꺾이는 장면, 가던 길은 점선이고 꺾인 길은 실선", cap: "옆에서 톡, 힘을 받으면 가던 길이 꺾여요" },
  ];
}
