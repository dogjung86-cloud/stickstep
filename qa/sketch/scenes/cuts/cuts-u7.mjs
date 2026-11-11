// 중1 과학 Ⅶ단원(태양계) 개념 컷 코드 그림.
// 목록은 Ⅶ단원 v5 세션이 새 개념 스텝을 쓰며 낸 것(D:\Brilliant Science\output\g1-v5\u7\concept-cuts.md): u7l1, u7l1b, u7l2, u7l4, u7l4b, u7l5, u7l6.
// u7l3 은 만화가 용어를 정의해 개념 스텝이 없다.
// 움직이는 길과 도는 방향은 청록, 겉보기로 흘러가는 움직임은 회색. 어두운 바탕은 위쪽 띠로만 깐다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, drop, squiggle, arrow, hash, sparkle } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { W, H, lerpx, lerp2, thin } from "./common.mjs";

const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
const KIDS = [{ hair: "short", hairColor: "#3F3A36", seed: 141 }, { hair: "bob", hairColor: "#8A5A33", seed: 151 }, { hair: "knit", capColor: "#3F7CC0", seed: 171 }, { hair: "short", hairColor: "#C58B3A", seed: 181 }];
const WALK = pose({ elL: [-44, -268], haL: [-78, -206], elR: [54, -262], haR: [86, -212], knL: [-32, -106], ftL: [-64, 0], knR: [38, -100], ftR: [72, -6] });
// 타원 위의 점(각도는 화면 좌표: 90° = 앞쪽)
const onEll = (cx, cy, rx, ry, deg) => [cx + rx * Math.cos(deg * Math.PI / 180), cy + ry * Math.sin(deg * Math.PI / 180)];
// 타원을 따라가는 화살촉 조각(a0 → a1, 도 단위)
function ellArrow(sk, cx, cy, rx, ry, a0, a1, sd, o = {}) {
  const pts = []; for (let i = 0; i <= 12; i++) pts.push(onEll(cx, cy, rx, ry, lerpx(a0, a1, i / 12)));
  arrow(sk, pts, { w: o.w ?? 8, color: o.color ?? C.teal, seed: sd, head: o.head ?? 20, wob: 0.2, straight: true });
}
// 점선 타원(도는 길)
const orbit = (sk, cx, cy, rx, ry, sd, col = "#9AA3AD") => sk.ink(ell(cx, cy, rx, ry), { w: 5, color: col, dash: [14, 12], seed: sd, wob: 0.2 });

/* ---------- u7l1: 운동장 태양계 ---------- */
function heldLamp(sk, x, y, sd) {
  // 손에 든 전등: 빛 번짐 + 전구 + 금속 받침. (x, y) = 전구 가운데
  sk.glow(x, y, 120, "#FFD84A", 0.6, 0.12);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2; sk.ink(dense([[x + 28 * Math.cos(a), y + 28 * Math.sin(a)], [x + 42 * Math.cos(a), y + 42 * Math.sin(a)]]), { w: 5, color: C.orange, seed: sd + i, wob: 0.2 }); }
  const b = circ(x, y, 19, { over: 0.1, seed: sd + 9 });
  sk.fill(b, C.lemon, { dx: 0, dy: 0, wob: 0.3, seed: sd + 10 }); sk.ink(b, { w: 6, seed: sd + 11, wob: 0.3 });
  const base = rrect(x - 10, y + 15, 20, 18, 4);
  sk.fill(base, "#9AA3AD", { dx: 0, dy: 0, wob: 0.2, seed: sd + 12 }); sk.ink(base, { w: 5, seed: sd + 13, wob: 0.2 });
}
function cutU7l1() {
  const sk = new Sk(W, H, { id: "a" });
  const cx = 480, cy = 452;
  // 운동장 흙바닥(비스듬히 내려다본 모습)
  const field = ell(cx, cy + 8, 462, 214);
  sk.fill(field, "#F4EDDF", { dx: 0, dy: 0, wob: 0.4, seed: 11 });
  thin(sk, 0.6, () => sk.ink(field, { w: 9, seed: 12, color: "#D9CDB5" }));
  // 저마다 다른 거리의 도는 길(앞쪽은 오른쪽으로 = 위에서 보면 시계 반대 방향)
  const R = [[140, 62], [262, 116], [392, 176]];
  R.forEach(([rx, ry], i) => { orbit(sk, cx, cy, rx, ry, 21 + i); ellArrow(sk, cx, cy, rx, ry, 106, 78, 25 + i); });
  const scaleAt = y => 0.27 + 0.1 * (y - 280) / 360;
  const kid = (o, a, k, m, sd) => { const p = onEll(cx, cy, R[o][0], R[o][1], a); drawFigure(sk, p[0], p[1], scaleAt(p[1]), WALK, { ...k, mirror: m, seed: sd }); return p; };
  // 뒤쪽 아이들
  kid(2, -112, KIDS[0], true, 141);
  kid(1, -30, KIDS[3], true, 181);
  // 쌤(태양): 가운데에서 전등을 높이 든다
  const ts = 0.36;
  const T = pose({ elR: [76, -420], haR: [98, -568], elL: [-50, -262], haL: [-24, -220], tilt: 0 });
  drawFigure(sk, cx, cy, ts, T, { ...TEACHER, name: "teacher", hands: "L" });
  const h = [cx + ts * 98, cy - ts * 568];
  heldLamp(sk, h[0] + 2, h[1] - 28, 41);
  handDot(sk, h, C.skin, 51, 8);
  // 옆과 앞쪽 아이들
  kid(0, 0, KIDS[2], true, 171);
  kid(1, 184, KIDS[1], false, 151);
  // 앞쪽 학생 둘레를 작은 공을 든 친구가 돈다(위성)
  const p = onEll(cx, cy, R[2][0], R[2][1], 66), s = scaleAt(p[1]);
  orbit(sk, p[0], p[1] + 2, 84, 24, 61, "#7FC9BF");
  ellArrow(sk, p[0], p[1] + 2, 84, 24, 118, 66, 62, { w: 6, head: 14 });
  const fp = onEll(p[0], p[1] + 2, 84, 24, 196), fs = s * 0.8;
  const F = pose({ elR: [64, -330], haR: [96, -420], elL: [-40, -266], haL: [-64, -206] });
  drawFigure(sk, fp[0], fp[1], fs, F, { ...KIDS[1], seed: 191, hands: "L" });
  const fh = [fp[0] + fs * 96, fp[1] - fs * 420];
  const ball = circ(fh[0] + 4, fh[1] - 14, 11, { over: 0.1, seed: 63 });
  sk.fill(ball, "#D9D6CF", { dx: 0, dy: 0, wob: 0.2, seed: 64 }); sk.ink(ball, { w: 5, seed: 65, wob: 0.2 });
  handDot(sk, fh, C.skin, 66, 7);
  drawFigure(sk, p[0], p[1], s, WALK, { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- u7l1b: 선풍기 앞의 눈 뭉치(혜성), 울퉁불퉁 돌멩이, 작고 둥근 구슬 ---------- */
function fan(sk, x, y, r, sd) {
  // 선 선풍기(오른쪽으로 바람을 보낸다). (x, y) = 날개 가운데, 기둥은 바닥 GY 까지
  const blades = [0, 2.09, 4.19].map((a, i) => { const p = curve([[x, y], [x + r * 0.5 * Math.cos(a - 0.5), y + r * 0.5 * Math.sin(a - 0.5)], [x + r * 0.82 * Math.cos(a), y + r * 0.82 * Math.sin(a)], [x + r * 0.5 * Math.cos(a + 0.45), y + r * 0.5 * Math.sin(a + 0.45)]], true, 3); return p; });
  const cage = circ(x, y, r, { over: 0.1, seed: sd });
  sk.fill(cage, "#EEF4F8", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
  blades.forEach((b, i) => { sk.fill(b, "#7FB2E5", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 + i }); sk.ink(b, { w: 5, seed: sd + 5 + i, wob: 0.3 }); });
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; sk.ink(dense([[x + 22 * Math.cos(a), y + 22 * Math.sin(a)], [x + r * 0.97 * Math.cos(a), y + r * 0.97 * Math.sin(a)]]), { w: 3, color: "#9AA3AD", seed: sd + 8 + i, wob: 0.1 }); }
  sk.dot(x, y, 14, "#4A5568");
  sk.ink(cage, { w: 9, seed: sd + 21 });
}
function cutU7l1b() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 668;
  ground(sk, GY, 11);
  // 선풍기(태양 노릇)
  const FX = 150, FY = 236, FR = 82;
  thin(sk, 0.8, () => {
    sk.ink(dense([[FX, FY + FR], [FX, GY - 12]]), { w: 13, seed: 21, color: "#4A5568" });
    const base = ell(FX, GY - 8, 70, 16);
    sk.fill(base, "#8A9099", { dx: 0, dy: 0, wob: 0.3, seed: 22 }); sk.ink(base, { w: 9, seed: 23 });
  });
  fan(sk, FX, FY, FR, 31);
  // 바람(회색 곡선)
  for (const [y, i] of [[196, 0], [236, 1], [276, 2]]) sk.ink(curve([[FX + FR + 18, y], [FX + FR + 46, y - 8], [FX + FR + 76, y + 4], [FX + FR + 100, y - 4]]), { w: 5, color: C.gray, seed: 61 + i, wob: 0.2 });
  // 탁자: 울퉁불퉁한 돌멩이(소행성)와 작고 둥근 구슬(왜소 행성)
  thin(sk, 0.8, () => {
    for (const [x, i] of [[600, 0], [890, 1]]) sk.ink(dense([[x, 548], [x - 4, GY]]), { w: 12, seed: 71 + i });
    const top = rrect(560, 524, 370, 24, 8);
    sk.fill(top, C.wood, { seed: 73, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 74 });
  });
  const rock = curve([[640, 520], [626, 490], [640, 462], [676, 452], [706, 468], [722, 494], [712, 520]], true, 3);
  sk.fill(rock, "#A39684", { seed: 75, tex: 0.7, dx: 0.6, dy: 0.8 });
  for (const [x, y, r, i] of [[662, 478, 8, 0], [694, 498, 6, 1], [688, 470, 4, 2]]) sk.ink(circ(x, y, r, { over: 0.1, seed: 76 + i }), { w: 4, color: "#6E6252", seed: 79 + i, wob: 0.2 });
  sk.ink(rock, { w: 8, seed: 82 });
  const mb = circ(826, 502, 22, { over: 0.1, seed: 83 });
  sk.fill(mb, "#E8D2B0", { dx: 0, dy: 0, wob: 0.3, seed: 84 });
  sk.ink(curve([[814, 494], [820, 486], [830, 484]]), { w: 4, color: C.white, seed: 85, wob: 0.1 });
  sk.ink(mb, { w: 7, seed: 86 });
  // 쌤: 바람 앞에 긴 리본이 달린 눈 뭉치를 높이 든다(왼쪽, 선풍기 쪽을 본다)
  const fx = 400, fs = 0.64;
  const T = pose({ elR: [150, -430], haR: [172, -652], elL: [-50, -262], haL: [-24, -220], tilt: -0.04 });
  const hand = [fx - fs * 172, GY - fs * 652];
  const sb = [hand[0] - 6, hand[1] - 30];
  // 리본: 눈 뭉치에서 선풍기 반대쪽(오른쪽)으로 날린다
  [["#9ED3F2", -14, 0], ["#FFF1AE", 2, 1], ["#C9E7F7", 16, 2]].forEach(([col, dy, i]) => {
    const pts = []; for (let k = 0; k <= 30; k++) { const u = k / 30, x = sb[0] + 20 + u * (430 - i * 40); pts.push([x, sb[1] + dy + u * (dy * 2.2) + 14 * Math.sin(u * 7 + i * 1.7) * u]); }
    sk.ink(pts, { w: 16 - i * 2, color: C.ink, seed: 91 + i, wob: 0.3 });
    sk.ink(pts, { w: 9 - i * 2, color: col, seed: 91 + i, wob: 0.3 });
  });
  drawFigure(sk, fx, GY, fs, T, { ...TEACHER, name: "teacher", mirror: true, hands: "L" });
  const ball = circ(sb[0], sb[1], 30, { over: 0.15, seed: 101, lump: 0.08 });
  sk.fill(ball, "#F4F8FB", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 102 });
  sk.fill(ell(sb[0] + 6, sb[1] + 8, 16, 10), "#D8E6F0", { dx: 0, dy: 0, wob: 0.4, seed: 103 });
  sk.ink(ball, { w: 8, seed: 104, wob: 0.5 });
  handDot(sk, hand, C.skin, 105, 10);
  return sk;
}

/* ---------- u7l2: 작고 단단한 돌 공 넷, 크고 가벼운 풍선 공 넷 ---------- */
function rockBall(sk, x, y, r, col, sd) {
  const b = circ(x, y, r, { over: 0.1, seed: sd, lump: 0.05 });
  sk.fill(b, col, { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 1, tex: 0.6 });
  for (const [dx, dy, k, i] of [[-0.3, -0.1, 0.22, 0], [0.28, 0.24, 0.16, 1], [0.1, -0.38, 0.12, 2]]) sk.ink(circ(x + dx * r, y + dy * r, r * k, { over: 0.1, seed: sd + 2 + i }), { w: Math.max(3, r * 0.12), color: mix(col, "#000000", 0.32), seed: sd + 5 + i, wob: 0.1 });
  sk.ink(b, { w: Math.max(6, r * 0.3), seed: sd + 8, wob: 0.3 });
}
// 풍선 공: 줄무늬 + 고리 띠(뒤쪽 절반은 공 뒤로 숨는다)
function gasBall(sk, x, y, r, col, sd, o = {}) {
  const rx = r * (o.ring ?? 1.55), ry = r * 0.32, tilt = o.tilt ?? -0.18, rc = o.ringColor ?? "#C9B48A";
  const ringPts = (a0, a1) => ell(0, 0, rx, ry, a0, a1).map(([u, v]) => [x + u * Math.cos(tilt) - v * Math.sin(tilt), y + u * Math.sin(tilt) + v * Math.cos(tilt)]);
  sk.ink(ringPts(Math.PI, Math.PI * 2), { w: 9, color: C.ink, seed: sd, wob: 0.2 });
  sk.ink(ringPts(Math.PI, Math.PI * 2), { w: 4, color: rc, seed: sd, wob: 0.2 });
  const b = circ(x, y, r, { over: 0.1, seed: sd + 1 });
  sk.fill(b, col, { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 2 });
  for (const [dy, k, i] of (o.bands ?? []).map((v, i) => [...v, i])) sk.ink(dense([[x - Math.sqrt(Math.max(0, r * r - (dy * r) ** 2)) + 4, y + dy * r], [x + Math.sqrt(Math.max(0, r * r - (dy * r) ** 2)) - 4, y + dy * r]]), { w: k, color: o.bandColor ?? mix(col, "#000000", 0.18), seed: sd + 3 + i, wob: 0.3 });
  sk.ink(curve([[x - r * 0.56, y - r * 0.34], [x - r * 0.36, y - r * 0.6], [x - r * 0.08, y - r * 0.7]]), { w: Math.max(4, r * 0.14), color: C.white, seed: sd + 8, wob: 0.2, alpha: 0.8 });
  sk.ink(b, { w: Math.max(6, r * 0.18), seed: sd + 9 });
  sk.ink(ringPts(0, Math.PI), { w: 9, color: C.ink, seed: sd + 10, wob: 0.2 });
  sk.ink(ringPts(0, Math.PI), { w: 4, color: rc, seed: sd + 10, wob: 0.2 });
}
function basket(sk, x0, x1, top, bot, sd, inner) {
  const b = poly([[x0, top], [x1, top], [x1 - 18, bot], [x0 + 18, bot]], 4);
  sk.fill(b, "#C9965C", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd });
  if (inner) inner();
  for (let i = 1; i < 4; i++) { const y = lerpx(top, bot, i / 4); sk.ink(dense([[lerpx(x0, x0 + 18, i / 4) + 4, y], [lerpx(x1, x1 - 18, i / 4) - 4, y]]), { w: 4, color: "#9C7244", seed: sd + 1 + i, wob: 0.3 }); }
  for (let x = x0 + 26; x < x1 - 20; x += 26) sk.ink(dense([[x, top + 4], [x + (x < (x0 + x1) / 2 ? 5 : -5), bot - 4]]), { w: 4, color: "#9C7244", seed: sd + 10 + x, wob: 0.3 });
  sk.ink(b, { w: 9, seed: sd + 8 });
  sk.ink(dense([[x0 - 6, top], [x1 + 6, top]]), { w: 12, seed: sd + 9, color: "#8A5A33" });
}
function cutU7l2() {
  const sk = new Sk(W, H, { id: "c" });
  const GY = 668, TT = 476;
  ground(sk, GY, 11);
  // 학생(탁자 뒤): 풍선 공 하나를 들어 오른쪽 바구니로
  const fx = 392, fs = 0.72;
  const gb = [626, 318], gr = 52;
  const P = pose({ elR: [150, -330], haR: [(gb[0] + 18 - fx) / fs, -(GY - gb[1] - 46) / fs], elL: [120, -360], haL: [(gb[0] - 44 - fx) / fs, -(GY - gb[1] - 24) / fs], tilt: 0.06 });
  drawFigure(sk, fx, GY, fs, P, { ...STUDENT, name: "student", hands: false });
  // 탁자
  thin(sk, 0.8, () => {
    for (const [x, i] of [[90, 0], [870, 1]]) sk.ink(dense([[x, TT + 24], [x - 4, GY]]), { w: 12, seed: 21 + i });
    const top = rrect(50, TT, 860, 26, 8);
    sk.fill(top, C.wood, { seed: 23, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 24 });
  });
  // 왼쪽 작은 바구니: 돌 공 셋 + 탁자 위에 남은 돌 공 하나
  const stones = [["#B8B4AE", 0], ["#E8D49A", 1], ["#6FB0E0", 2], ["#D06A44", 3]];
  basket(sk, 100, 300, TT - 70, TT, 31, () => {
    rockBall(sk, 148, TT - 76, 22, stones[0][0], 41);
    rockBall(sk, 200, TT - 84, 25, stones[1][0], 51);
    rockBall(sk, 252, TT - 76, 24, stones[2][0], 61);
  });
  rockBall(sk, 340, TT - 20, 20, stones[3][0], 71);
  // 오른쪽 큰 바구니: 풍선 공 셋(고리 띠)
  basket(sk, 660, 900, TT - 92, TT, 81, () => {
    gasBall(sk, 716, TT - 120, 46, "#EED9A0", 91, { ring: 1.9, ringColor: "#D9C38C", bands: [[-0.2, 6], [0.25, 5]] });
    gasBall(sk, 846, TT - 116, 42, "#5B8FE0", 101, { tilt: -0.3 });
    gasBall(sk, 782, TT - 148, 44, "#A6E3E9", 111, { tilt: 0.9, ring: 1.4 });
  });
  // 들고 있는 풍선 공(목성: 띠 무늬)
  gasBall(sk, gb[0], gb[1], gr, "#E8B07A", 121, { bands: [[-0.45, 7], [-0.1, 9], [0.3, 8]], bandColor: "#C07A45" });
  handDot(sk, [gb[0] + 18, gb[1] + 46], C.skin, 131, 12);
  handDot(sk, [gb[0] - 44, gb[1] + 24], C.skin, 132, 12);
  return sk;
}

/* ---------- u7l4: 회전의자에서 도는 학생, 창문과 전등은 반대쪽으로 흘러간다 ---------- */
// 뒤에서 본 머리(노란 모자의 뒷모습): 귀 둘 + 뒷머리 + 모자 돔과 뒤 여밈
// 뒤에서 본 머리: 뒷머리가 머리 전체를 덮고(살갗이 보이면 얼굴로 읽힌다), 양옆에 귀, 위에 노란 모자의 뒷모습
function backHead(sk, x, y, r, sd) {
  for (const [sg, i] of [[-1, 0], [1, 1]]) { const e = circ(x + sg * r * 0.98, y + r * 0.16, r * 0.22, { over: 0.1, seed: sd + i }); sk.fill(e, C.skin, { dx: 0, dy: 0, wob: 0.2, seed: sd + 2 + i }); sk.ink(e, { w: 6, seed: sd + 4 + i, wob: 0.2 }); }
  sk.ink(dense([[x, y + r * 0.9], [x, y + r * 1.25]]), { w: 12, seed: sd + 5, wob: 0.4 });
  const head = circ(x, y, r, { over: 0.1, seed: sd + 6 });
  sk.fill(head, C.hair, { dx: 0.8, dy: 1, wob: 0.6, seed: sd + 7, tex: 0.7 });
  for (const [dx, i] of [[-0.3, 0], [0.05, 1], [0.38, 2]]) sk.ink(curve([[x + dx * r, y + r * 0.1], [x + dx * r - r * 0.06, y + r * 0.45], [x + dx * r + r * 0.02, y + r * 0.8]]), { w: 4, color: mix(C.hair, "#000000", 0.3), seed: sd + 8 + i, wob: 0.2 });
  const dome = [...ell(x, y, r * 1.08, r * 1.08, Math.PI * 1.02, Math.PI * 1.98), ...curve([[x + r * 1.06, y - r * 0.1], [x, y - r * 0.24], [x - r * 1.06, y - r * 0.1]], false, 3)];
  sk.fill(dome, C.yellow, { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 10, tex: true });
  sk.ink(dome, { w: 9, seed: sd + 11, wob: 0.5 });
  // 모자 뒤쪽 여밈(반달 구멍과 끈)
  const gap = [...ell(x, y - r * 0.1, r * 0.3, r * 0.24, Math.PI, Math.PI * 2), [x - r * 0.3, y - r * 0.1]];
  sk.fill(gap, C.hair, { dx: 0, dy: 0, wob: 0.2, seed: sd + 12 });
  sk.ink(gap, { w: 6, seed: sd + 13, wob: 0.2 });
  sk.ink(dense([[x - r * 0.3, y - r * 0.12], [x + r * 0.3, y - r * 0.12]]), { w: 7, color: "#F2A81D", seed: sd + 14, wob: 0.2 });
  sk.dot(x, y - r * 1.08, 8, C.yellow);
  sk.ink(head, { w: 11, seed: sd + 15, wob: 0.6 });
}
function cutU7l4() {
  const sk = new Sk(W, H, { id: "d" });
  const FL = 600, GY = 676;
  // 방: 벽과 바닥의 경계
  thin(sk, 0.7, () => sk.ink(dense([[14, FL], [946, FL]]), { w: 9, seed: 11, color: "#B7AC9C" }));
  ground(sk, GY, 12);
  // 창문(왼쪽 벽): 오른쪽으로 흘러가는 듯(왼쪽에 흐름 선)
  const WX = 230, WY = 220;
  thin(sk, 0.75, () => {
    const win = rrect(WX - 110, WY - 90, 220, 180, 8);
    sk.fill(win, "#DDEFFB", { dx: 0, dy: 0, wob: 0.3, seed: 21 });
    sk.ink(dense([[WX, WY - 86], [WX, WY + 86]]), { w: 9, seed: 22, color: "#8A9099" });
    sk.ink(dense([[WX - 106, WY], [WX + 106, WY]]), { w: 9, seed: 23, color: "#8A9099" });
    sk.ink(win, { w: 12, seed: 24 });
  });
  for (const [dy, len, i] of [[-60, 70, 0], [-10, 96, 1], [44, 64, 2]]) sk.ink(dense([[WX - 128 - len, WY + dy], [WX - 128, WY + dy]]), { w: 6, color: C.gray, seed: 31 + i, wob: 0.2 });
  arrow(sk, [[WX - 60, WY - 118], [WX + 60, WY - 118]], { w: 8, color: C.gray, straight: true, seed: 35, head: 20, wob: 0.2 });
  // 천장 전등(오른쪽): 역시 오른쪽으로 흘러가는 듯
  const LX = 778, LY = 150;
  sk.ink(dense([[LX, 0], [LX, LY - 30]]), { w: 6, seed: 41, color: "#4A5568" });
  sk.glow(LX, LY + 20, 110, "#FFD84A", 0.45, 0.1);
  const shade = poly([[LX - 30, LY - 30], [LX + 30, LY - 30], [LX + 64, LY + 16], [LX - 64, LY + 16]], 3);
  sk.fill(shade, "#7FB2E5", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 42 }); sk.ink(shade, { w: 9, seed: 43 });
  const bulb = circ(LX, LY + 24, 14, { over: 0.1, seed: 44 });
  sk.fill(bulb, C.lemon, { dx: 0, dy: 0, wob: 0.2, seed: 45 }); sk.ink(bulb, { w: 6, seed: 46 });
  for (const [dy, len, i] of [[-20, 60, 0], [14, 84, 1]]) sk.ink(dense([[LX - 82 - len, LY + dy], [LX - 82, LY + dy]]), { w: 6, color: C.gray, seed: 47 + i, wob: 0.2 });
  arrow(sk, [[LX - 60, LY + 70], [LX + 60, LY + 70]], { w: 8, color: C.gray, straight: true, seed: 49, head: 20, wob: 0.2 });
  // 회전의자(뒤에서 본 모습)와 학생
  const cx = 470, seatY = 488;
  thin(sk, 0.82, () => {
    for (let i = 0; i < 5; i++) { const a = Math.PI * (0.1 + i * 0.2); const e = [cx + 116 * Math.cos(a), GY - 18 + 22 * Math.sin(a)]; sk.ink(dense([[cx, GY - 30], e]), { w: 11, seed: 51 + i, color: "#4A5568" }); const w = circ(e[0], e[1] + 6, 11, { over: 0.1, seed: 56 + i }); sk.fill(w, "#3A3F47", { dx: 0, dy: 0, wob: 0.2, seed: 61 + i }); }
    sk.ink(dense([[cx, seatY + 20], [cx, GY - 30]]), { w: 14, seed: 66, color: "#4A5568" });
    const seat = ell(cx, seatY + 10, 104, 24);
    sk.fill(seat, "#3F7CC0", { dx: 0, dy: 0, wob: 0.3, seed: 67 }); sk.ink(seat, { w: 10, seed: 68 });
  });
  // 학생: 두 팔을 벌리고 의자째 왼쪽으로 돈다
  const hy = 280, r = 74;
  for (const [sg, i] of [[-1, 0], [1, 1]]) {
    const sh = [cx + sg * 34, hy + r + 34], el = [cx + sg * 104, hy + r + 20], ha = [cx + sg * 168, hy + r - 30];
    sk.ink(curve([sh, el, ha]), { w: 10, seed: 71 + i, wob: 1.2 });
    handDot(sk, ha, C.skin, 73 + i, 11);
  }
  sk.ink(curve([[cx, hy + r - 2], [cx + 2, hy + r + 60], [cx, seatY + 4]]), { w: 11, seed: 75, wob: 1.2 });
  thin(sk, 0.82, () => {
    const back = rrect(cx - 84, hy + r + 64, 168, seatY - (hy + r + 64) + 6, 26);
    sk.fill(back, "#5B97D6", { seed: 76, tex: 0.6, dx: 0.6, dy: 0.8 }); sk.ink(back, { w: 10, seed: 77 });
  });
  backHead(sk, cx, hy, r, 81);
  // 내가 도는 쪽(청록): 머리 위로 왼쪽을 향해 휘는 화살표
  arrow(sk, ell(cx, hy - r - 24, 104, 28, -0.2, -Math.PI + 0.25), { w: 9, color: C.teal, seed: 91, head: 22, wob: 0.2, straight: true });
  // 의자 아래 도는 자국
  for (const [a0, a1, i] of [[0.3, 1.1, 0], [2.0, 2.8, 1]]) sk.ink(ell(cx, GY - 12, 150, 30, a0, a1), { w: 5, color: C.gray, seed: 95 + i, wob: 0.2 });
  return sk;
}

/* ---------- u7l4b: 전등 둘레를 걸어서 돈다. 전등 너머의 액자가 걸음마다 달라진다 ---------- */
function starFrame(sk, x, y, w, h, stars, sd) {
  const f = rrect(x - w / 2, y - h / 2, w, h, 6);
  sk.fill(f, "#2B3554", { dx: 0, dy: 0, wob: 0.2, seed: sd });
  const pts = stars.map(([u, v]) => [x + u * w * 0.4, y + v * h * 0.4]);
  sk.ink(pts, { w: 3, color: "#9FB6E0", seed: sd + 1, wob: 0.1 });
  pts.forEach(([px, py], i) => sk.dot(px, py, 5, C.lemon));
  thin(sk, 0.75, () => { sk.ink(f, { w: 11, seed: sd + 2, color: "#8A5A33" }); });
}
// 지나온 자리의 학생(회색 점선 윤곽)
function ghost(sk, x, y, s, P, sd, flip = 1) {
  const T = p => [x + flip * p[0] * s, y + p[1] * s];
  const o = { w: 6, color: "#B9C2CC", dash: [10, 8], wob: 0.2 };
  sk.ink(curve([T(P.hip), T(P.knL), T(P.ftL)]), { ...o, seed: sd });
  sk.ink(curve([T(P.hip), T(P.knR), T(P.ftR)]), { ...o, seed: sd + 1 });
  sk.ink(curve([T(P.neck), T(P.hip)]), { ...o, seed: sd + 2 });
  sk.ink(curve([T(P.neck), T(P.elL), T(P.haL)]), { ...o, seed: sd + 3 });
  sk.ink(curve([T(P.neck), T(P.elR), T(P.haR)]), { ...o, seed: sd + 4 });
  const h = T(P.head);
  sk.ink(circ(h[0], h[1], 100 * s, { over: 0, seed: sd + 5 }), { ...o, seed: sd + 5 });
}
function cutU7l4b() {
  const sk = new Sk(W, H, { id: "e" });
  const FL = 352, GY = 690;
  // 벽의 별자리 액자 다섯
  const frames = [[96, [[-1, 0.4], [-0.3, -0.5], [0.4, 0.2], [1, -0.6]]], [270, [[-1, -0.2], [-0.2, 0.6], [0.3, -0.6], [1, 0.3]]], [450, [[-0.9, 0.5], [0, -0.7], [0.9, 0.5], [-0.9, 0.5]]], [664, [[-1, -0.5], [-0.4, 0.4], [0.3, 0.5], [1, -0.3]]], [852, [[-0.8, 0.6], [-0.2, -0.2], [0.5, -0.6], [0.9, 0.4]]]];
  frames.forEach(([x, st], i) => starFrame(sk, x, 156, 132, 104, st, 21 + i * 4));
  thin(sk, 0.7, () => sk.ink(dense([[14, FL], [946, FL]]), { w: 9, seed: 11, color: "#B7AC9C" }));
  // 가운데 전등(서 있는 등)
  const cx = 480, bulb = [cx, 312];
  thin(sk, 0.82, () => {
    sk.ink(dense([[cx, bulb[1] + 30], [cx, 600]]), { w: 12, seed: 41, color: "#4A5568" });
    const base = ell(cx, 604, 44, 11);
    sk.fill(base, "#8A9099", { dx: 0, dy: 0, wob: 0.2, seed: 42 }); sk.ink(base, { w: 8, seed: 43 });
  });
  sk.glow(bulb[0], bulb[1], 120, "#FFD84A", 0.55, 0.12);
  const b = circ(bulb[0], bulb[1], 24, { over: 0.1, seed: 44 });
  sk.fill(b, C.lemon, { dx: 0, dy: 0, wob: 0.3, seed: 45 }); sk.ink(b, { w: 7, seed: 46 });
  // 도는 길(바닥)
  const ox = cx, oy = 616, rx = 300, ry = 60;
  orbit(sk, ox, oy, rx, ry, 51);
  ellArrow(sk, ox, oy, rx, ry, 112, 70, 52);
  // 지나온 자리(왼쪽 앞)와 지금 자리(오른쪽 앞): 전등 너머로 보이는 액자가 다르다
  const s = 0.5;
  const pPrev = onEll(ox, oy, rx, ry, 140), pNow = onEll(ox, oy, rx, ry, 40);
  const look = pose({ elL: [-40, -262], haL: [-60, -200], elR: [44, -262], haR: [66, -204], tilt: 0 });
  const eye = (p, flip) => [p[0] + flip * s * 10, p[1] - s * 436];
  const sight = (p, flip, col, sd) => { const e = eye(p, flip), d = [bulb[0] - e[0], bulb[1] - e[1]], t = (e[1] - 210) / -d[1]; sk.ink(dense([e, [e[0] + d[0] * t, e[1] + d[1] * t]]), { w: 6, color: col, dash: [12, 10], seed: sd, wob: 0.2 }); return [e[0] + d[0] * t, e[1] + d[1] * t]; };
  const endPrev = sight(pPrev, 1, "#B9C2CC", 61);
  const endNow = sight(pNow, -1, C.teal, 62);
  for (const [e, col, i] of [[endPrev, "#B9C2CC", 0], [endNow, C.teal, 1]]) sk.ink(circ(e[0], e[1] - 50, 64, { over: 0.1, seed: 63 + i }), { w: 7, color: col, seed: 65 + i, wob: 0.3 });
  ghost(sk, pPrev[0], pPrev[1], s, look, 71, 1);
  drawFigure(sk, pNow[0], pNow[1], s, look, { ...STUDENT, name: "student", mirror: true });
  return sk;
}

/* ---------- u7l5: 어두운 방, 스탠드 불빛을 받는 공을 머리 위로 든 학생 ---------- */
function cutU7l5() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 668, DARK = 330;
  // 어두운 방(위쪽 띠)과 밝은 아래
  sk.fill(poly([[0, 0], [W, 0], [W, DARK], [0, DARK]], 4), "#2B3554", { dx: 0, dy: 0, wob: 0, seed: 11 });
  sk.fill(poly([[0, DARK], [W, DARK], [W, H], [0, H]], 4), "#EEF0F4", { dx: 0, dy: 0, wob: 0, seed: 12 });
  // 스탠드(오른쪽 탁자 위): 불빛이 왼쪽 위의 공으로
  const lamp = [770, 300], bc = [462, 162], br = 56;
  sk.fill(poly([[lamp[0] - 30, lamp[1] - 26], [bc[0] - 40, bc[1] - 130], [bc[0] - 70, bc[1] + 120], [lamp[0] - 30, lamp[1] + 26]], 3), "#F7EDBC", { dx: 0, dy: 0, wob: 0.2, seed: 13 });
  thin(sk, 0.8, () => {
    for (const [x, i] of [[740, 0], [900, 1]]) sk.ink(dense([[x, 470], [x - 4, GY]]), { w: 12, seed: 21 + i });
    const top = rrect(700, 446, 240, 24, 8);
    sk.fill(top, C.wood, { seed: 23, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 24 });
    sk.ink(curve([[820, 446], [832, 380], [806, 330], [lamp[0] + 14, lamp[1] + 6]]), { w: 11, seed: 25, color: "#4A5568" });
    const base = ell(820, 444, 40, 9);
    sk.fill(base, "#4A5568", { dx: 0, dy: 0, wob: 0.2, seed: 26 });
  });
  sk.glow(lamp[0] - 16, lamp[1], 70, "#FFD84A", 0.7, 0.2);
  sk.at(lamp[0], lamp[1], 1, () => {
    const hd = poly([[30, -18], [30, 18], [-24, 34], [-24, -34]], 3);
    sk.fill(hd, "#7FB2E5", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 27 }); sk.ink(hd, { w: 8, seed: 28 });
    const bl = circ(-26, 0, 14, { over: 0.1, seed: 29 }); sk.fill(bl, C.lemon, { dx: 0, dy: 0, wob: 0.2, seed: 30 }); sk.ink(bl, { w: 5, seed: 31 });
  }, 0.36);
  ground(sk, GY, 32);
  // 학생: 공을 머리 위로 들고 제자리에서 돈다
  const fx = 462, s = 0.72;
  const P = pose({ elL: [-156, -470], haL: [-84, -650], elR: [156, -470], haR: [84, -650], tilt: 0 });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student", hands: false });
  // 공: 불빛 쪽(오른쪽) 절반만 밝다
  const ball = circ(bc[0], bc[1], br, { over: 0.1, seed: 41 });
  sk.fill(ball, "#4B5470", { dx: 0, dy: 0, wob: 0.3, seed: 42 });
  sk.fill([...ell(bc[0], bc[1], br - 2, br - 2, -Math.PI / 2, Math.PI / 2), ...ell(bc[0] + 4, bc[1], 6, br - 2, Math.PI / 2, Math.PI * 1.5)], "#FFF6D5", { dx: 0, dy: 0, wob: 0.2, seed: 43 });
  sk.ink(ball, { w: 9, seed: 44, color: C.ink });
  for (const [sg, i] of [[-1, 0], [1, 1]]) handDot(sk, [fx + sg * s * 84, GY - s * 650], C.skin, 45 + i, 12);
  // 제자리에서 도는 화살표
  ellArrow(sk, fx, GY - 6, 110, 22, 120, 60, 51, { w: 8 });
  sk.ink(ell(fx, GY - 6, 110, 22, -2.6, -0.5), { w: 5, color: "#7FC9BF", dash: [12, 10], seed: 52, wob: 0.2 });
  return sk;
}

/* ---------- u7l6: 손전등, 작은 공, 큰 공을 한 줄로. 작은 공의 그림자가 큰 공에 점처럼 ---------- */
function cutU7l6() {
  const sk = new Sk(W, H, { id: "g" });
  const GY = 700, TT = 612, LY = 566;
  ground(sk, GY, 11);
  const fl = [228, LY], small = [462, LY], sR = 22, big = [738, 542], bR = 68;
  const dx = Math.sqrt(bR * bR - (LY - big[1]) ** 2), dot = [big[0] - dx + 5, LY];
  // 쌤(왼쪽, 탁자 뒤): 늘어놓은 것을 손으로 보여 준다
  const T = pose({ elR: [96, -300], haR: [160, -322], elL: [-80, -290], haL: [-120, -320], tilt: 0.04 });
  drawFigure(sk, 116, GY, 0.72, T, { ...TEACHER, name: "teacher" });
  // 학생(두 공 사이 뒤): 큰 공 위의 점을 가리킨다. 몸통은 빛줄기보다 위에 있다
  const sx = 586, ss = 0.8;
  const S = pose({ elR: [96, -340], haR: [(dot[0] - 24 - sx) / ss, -(GY - dot[1] + 36) / ss], elL: [-50, -262], haL: [-26, -220], tilt: 0.12 });
  drawFigure(sk, sx, GY, ss, S, { ...STUDENT, name: "student" });
  // 탁자(천을 덮어 뒤쪽 사람들의 다리를 가린다)
  thin(sk, 0.8, () => {
    const cloth = poly([[50, TT], [910, TT], [902, 664], [58, 664]], 4);
    sk.fill(cloth, "#F4EFE6", { dx: 0, dy: 0, wob: 0.3, seed: 21 }); sk.ink(cloth, { w: 10, seed: 22 });
    for (const [x, i] of [[96, 0], [864, 1]]) sk.ink(dense([[x, 664], [x, GY]]), { w: 12, seed: 23 + i });
    const top = rrect(36, TT - 14, 890, 22, 8);
    sk.fill(top, C.wood, { seed: 25, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 26 });
  });
  // 빛(손전등에서 큰 공 쪽으로 퍼진다)
  sk.fill(poly([[fl[0] + 52, LY - 22], [dot[0] + 4, LY - 40], [dot[0] + 4, LY + 40], [fl[0] + 52, LY + 22]], 3), "#FFF3B0", { dx: 0, dy: 0, wob: 0.2, seed: 31, alpha: 0.7 });
  // 손전등
  sk.at(fl[0], fl[1], 1, () => {
    const body = rrect(-64, -18, 94, 36, 10);
    sk.fill(body, "#4A5568", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 32 }); sk.ink(body, { w: 8, seed: 33 });
    const head = poly([[28, -22], [56, -30], [56, 30], [28, 22]], 3);
    sk.fill(head, "#8A9099", { dx: 0, dy: 0, wob: 0.2, seed: 34 }); sk.ink(head, { w: 8, seed: 35 });
    sk.fill(ell(56, 0, 7, 28), C.lemon, { dx: 0, dy: 0, wob: 0.2, seed: 36 });
  });
  // 받침 둘
  thin(sk, 0.8, () => {
    sk.ink(dense([[small[0], small[1] + sR], [small[0], TT - 14]]), { w: 9, seed: 41, color: "#4A5568" });
    for (const [x, w, i] of [[small[0], 26, 0], [big[0], 44, 1]]) { const bs = ell(x, TT - 16, w, 7); sk.fill(bs, "#8A9099", { dx: 0, dy: 0, wob: 0.2, seed: 43 + i }); sk.ink(bs, { w: 7, seed: 45 + i }); }
  });
  // 공 둘: 손전등 쪽 절반이 밝다
  const shadeBall = (c, r, lit, dark, sd) => {
    const b = circ(c[0], c[1], r, { over: 0.1, seed: sd });
    sk.fill(b, dark, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
    sk.fill([...ell(c[0], c[1], r - 2, r - 2, Math.PI / 2, Math.PI * 1.5), ...ell(c[0] - 3, c[1], r * 0.12, r - 2, -Math.PI / 2, Math.PI / 2)], lit, { dx: 0, dy: 0, wob: 0.2, seed: sd + 2 });
    sk.ink(b, { w: Math.max(7, r * 0.12), seed: sd + 3 });
  };
  shadeBall(small, sR, "#F2F0EA", "#9A9AA4", 51);
  shadeBall(big, bR, "#9ED3F2", "#5C7FA6", 55);
  // 작은 공의 그림자가 큰 공에 점처럼 떨어진다(진한 가운데 + 옅은 둘레)
  sk.fill(ell(dot[0] + 2, dot[1], 12, 17), "#3E5A7E", { dx: 0, dy: 0, wob: 0.2, seed: 61, alpha: 0.55 });
  sk.fill(ell(dot[0] + 2, dot[1], 7, 9.5), "#1C2A3E", { dx: 0, dy: 0, wob: 0.2, seed: 62 });
  // 손전등 → 작은 공 → 큰 공이 한 줄(점선)
  sk.ink(dense([[fl[0] + 62, LY], [small[0] - sR - 4, LY]]), { w: 4, color: "#C9A43A", dash: [8, 10], seed: 63, wob: 0.1 });
  sk.ink(dense([[small[0] + sR + 4, LY], [dot[0] - 12, LY]]), { w: 4, color: "#C9A43A", dash: [8, 10], seed: 64, wob: 0.1 });
  return sk;
}

export function cuts() {
  return [
    { name: "u7l1", theme: "space7", orig: null, sk: cutU7l1(), alt: "운동장 가운데에서 전등을 든 쌤의 둘레를 학생들이 저마다 다른 거리에서 돌고, 한 학생 둘레를 작은 공을 든 친구가 도는 장면", cap: "가운데서 빛나는 태양, 그 둘레를 도는 행성, 행성 둘레를 도는 위성" },
    { name: "u7l1b", theme: "space7", orig: null, sk: cutU7l1b(), alt: "선풍기 앞에서 쌤이 긴 리본이 달린 눈 뭉치를 들고, 리본은 선풍기 반대쪽으로 날린다. 탁자에는 울퉁불퉁한 돌멩이와 작고 둥근 구슬", cap: "꼬리 달린 눈 뭉치, 울퉁불퉁 돌멩이, 작고 둥근 구슬" },
    { name: "u7l2", theme: "space7", orig: null, sk: cutU7l2(), alt: "학생이 탁자 위의 공들을 두 바구니에 나눠 담는다. 한쪽은 작고 단단한 돌 공, 다른 쪽은 고리 띠를 두른 크고 가벼운 풍선 공", cap: "작고 단단한 무리, 크고 가벼운 무리" },
    { name: "u7l4", theme: "space7", orig: null, sk: cutU7l4(), alt: "회전의자에 앉아 제자리에서 도는 학생의 뒷모습, 학생은 왼쪽으로 도는데 창문과 전등은 오른쪽으로 흘러가는 것처럼 보인다", cap: "내가 돌면 방이 반대로 도는 것처럼 보여요" },
    { name: "u7l4b", theme: "space7", orig: null, sk: cutU7l4b(), alt: "방 가운데 전등 둘레를 학생이 걸어서 돌고, 전등 너머로 보이는 별자리 액자가 걸음마다 달라지는 장면", cap: "한 걸음 옮길 때마다 전등 너머의 액자가 바뀌어요" },
    { name: "u7l5", theme: "space7", orig: null, sk: cutU7l5(), alt: "어두운 방에서 스탠드 불빛을 받는 공을 머리 위로 든 학생이 제자리에서 돈다. 공은 불빛 쪽 절반만 밝다", cap: "밝은 쪽을 얼마나 보느냐에 따라 달의 모양이 달라져요" },
    { name: "u7l6", theme: "space7", orig: null, sk: cutU7l6(), alt: "손전등, 작은 공, 큰 공을 탁자에 한 줄로 놓은 쌤, 작은 공의 그림자가 큰 공에 점처럼 떨어지고 학생이 그 점을 가리킨다", cap: "한 줄로 서면 작은 공의 그림자가 큰 공에 떨어져요" },
  ];
}
