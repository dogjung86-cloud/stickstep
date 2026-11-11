// 중1 과학 u3l3 도입 만화(v2): 과학자들이 찾은 열의 세 가지 길(전도, 대류, 복사). 8컷. 배선 전.
// 조사와 콘티는 qa/sketch/research/v2/u3l3.md.
//   1 1757 뉴욕, 프랭클린: 같은 방의 나무 책상과 쇠 자물쇠, 쇠가 더 차갑다
//   2 1780 빈, 잉엔하우스: 밀랍을 입힌 금속 철사, 녹은 거리가 금속마다 다르다
//   3 입자의 눈: 흔들림이 이웃한 입자에 차례로(전도)
//   4 1797 뮌헨, 럼퍼드: 창가에서 식는 큰 온도계 속 먼지가 가운데로 오르고 가장자리로 내려온다
//   5 입자의 눈: 데워진 입자가 직접 옮겨 다니며 돈다(대류)
//   6 1785 만하임, 백작이 되기 전의 럼퍼드: 공기를 뺀 유리공 속 온도계도 끓는 물에서 올라간다
//   7 입자의 눈: 입자가 없는 빈 곳을 곧장 건너는 열(복사), 해의 열도 같은 길
//   8 오늘날: 열화상 카메라로 본 사람 몸
// 과학자들은 열을 입자로 설명하지 않았다(그 시대에는 열을 흐르는 물질로 보았다). 입자 그림은 오늘날의 설명이라 3, 5, 7컷에만 둔다.
// 흐름의 색: 대류는 오름 빨강, 내림 파랑. 복사는 주황 물결 화살표. 온도는 파랑(차가움)에서 빨강(뜨거움).
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, sparkle, squiggle, arrow } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { sun, earth } from "../../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; }; // 큰 장치의 선이 인물보다 굵어지지 않게

/* ---------- 18세기 인물: 분을 바른 머리 + 귀 옆 말림, 긴 외투 ---------- */
// 머리 꼭대기는 밝은 회색 "short" 머리, 귀 옆 말림은 wigRolls 로 덧그린다(drawFigure 와 같은 변환)
const FRANKLIN = { hair: "short", hairColor: "#E2DDD2", fringe: 24, coat: { color: "#8A6A4A", buttons: "#D8C49A", seam: "#5E4630", len: 40 }, seed: 501, mini: true, face: "calm" };
const INGEN = { hair: "short", hairColor: "#ECE8E0", fringe: 24, coat: { color: "#3F4F63", buttons: C.gold, seam: "#28323F", len: 40 }, seed: 511, mini: true, face: "calm" };
const RUMFORD = { hair: "short", hairColor: "#F1EEE8", fringe: 24, coat: { color: C.navy, buttons: C.gold, seam: "#1E2B49", len: 40 }, seed: 521, mini: true, face: "calm" };
function wigRolls(sk, x, y, s, p, o = {}) {
  const col = o.wig ?? "#ECE8E0", sd = o.seed ?? 901;
  sk.save(); sk.translate(x, y); sk.scale(s * (o.mirror ? -1 : 1), s); sk.translate(p.head[0], p.head[1]); sk.rotate(p.tilt ?? 0);
  for (const sg of [-1, 1]) for (const [cy, rr, i] of [[-2, 23, 0], [38, 20, 1]]) {
    const c = circ(sg * (98 + i * 2), cy, rr, { over: 0.25, seed: sd + i + (sg > 0 ? 4 : 0), lump: 0.05 });
    sk.fill(c, col, { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 10 + i });
    sk.ink(c, { w: 9, wob: 0.8, seed: sd + 20 + i });
    sk.ink(curve([[sg * (90 + i * 2), cy - 6], [sg * (102 + i * 2), cy - 2], [sg * (98 + i * 2), cy + 9]]), { w: 5, wob: 0.4, seed: sd + 30 + i, color: "#B9B3A7" });
  }
  sk.restore();
}
// 럼퍼드의 붉은 어깨띠(바이에른 궁정에서 일한 표시). drawFigure 의 under 로 몸통 위에 얹는다
const sash = sk => () => {
  const b = poly([[-40, -336], [-22, -344], [44, -226], [26, -218]], 3);
  sk.fill(b, C.red, { dx: 0.8, dy: 1, wob: 0.5, seed: 531 }); sk.ink(b, { w: 6, wob: 0.6, seed: 532 });
};
function person(sk, x, y, s, p, who, extra = {}) {
  const o = { ...who, ...extra };
  drawFigure(sk, x, y, s, p, o);
  wigRolls(sk, x, y, s, p, { mirror: o.mirror, seed: o.seed + 400 });
}

/* ---------- 공용 그림 ---------- */
const floor = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });
// 온도의 색: 0(차가움, 파랑) ~ 1(뜨거움, 빨강)
const HEAT = ["#2B3A8C", "#3F7CC0", "#3FB8A0", "#F2D03B", "#F08A2E", "#E0503A"];
const heat = t => { const u = Math.max(0, Math.min(0.999, t)) * (HEAT.length - 1), i = Math.floor(u); return mix(HEAT[i], HEAT[i + 1], u - i); };
// 곧게 나아가는 물결 선(복사하는 열). 끝으로 갈수록 물결이 잦아든다
const wavy = (a, b, amp = 7, waves = 5) => {
  const n = 64, out = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 0; i <= n; i++) { const u = i / n, o = amp * Math.sin(u * waves * 2 * Math.PI) * Math.min(1, (1 - u) * 5); out.push([a[0] + dx * u + nx * o, a[1] + dy * u + ny * o]); }
  return out;
};
const ray = (sk, a, b, sd, o = {}) => arrow(sk, wavy(a, b, o.amp ?? 7, o.waves ?? 4), { w: o.w ?? 7, color: o.color ?? C.orange, seed: sd, wob: 0.3, head: o.head ?? 18 });
// 돋보기(크게 본 창): 금색 테 + 외곽선 없는 갈색 손잡이
const lensRing = (sk, cx, cy, r, sd, w = 13) => sk.ink(circ(cx, cy, r, { over: 0.12, seed: sd }), { w, seed: sd, color: "#B8892E" });
const lensFill = (sk, cx, cy, r, sd, col = "#FFF9EC") => sk.fill(circ(cx, cy, r, { over: 0.12, seed: sd }), col, { dx: 0, dy: 0, wob: 0.6, seed: sd + 1 });
// 크게 본 곳을 잇는 점선
const leader = (sk, a, b, sd) => sk.ink(dense([a, b]), { w: 5, color: C.gray, dash: [12, 10], seed: sd, wob: 0.4 });
// 입자 하나: 온도 색으로 칠한 공 + 흔들림 호(shake: 0~3) + 반짝 점
function particle(sk, x, y, r, t, sd, shake = 0) {
  for (let j = 0; j < shake; j++) for (const sg of [-1, 1]) {
    const rr = r + 8 + j * 8, mid = sg > 0 ? -0.62 : -Math.PI + 0.62;
    sk.ink(ell(x, y, rr, rr, mid - 0.42, mid + 0.42), { w: 4, color: mix(heat(t), "#000000", 0.12), seed: sd + 10 + j, wob: 0, alpha: 0.95 - j * 0.22 });
  }
  const b = circ(x, y, r, { over: 0.12, seed: sd });
  sk.fill(b, heat(t), { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 1 }); sk.ink(b, { w: 7, seed: sd + 2, wob: 0.5 });
  sk.ink(curve([[x - r * 0.48, y - r * 0.28], [x - r * 0.26, y - r * 0.58], [x + r * 0.08, y - r * 0.64]]), { w: 3.5, color: C.white, seed: sd + 3, wob: 0.2 });
}
// 유리 온도계(세로). (x, y) = 둥근 알 가운데, len = 관 길이, level 0~1 = 빨간 기둥 높이. 눈금만 있고 숫자는 없다
function thermo(sk, x, y, len, level, sd, o = {}) {
  const tw = o.w ?? 18, br = o.br ?? 17;
  const tube = rrect(x - tw / 2, y - len, tw, len + 4, tw / 2);
  sk.fill(tube, "#F6FBFD", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  const top = y - 10 - (len - 22) * level;
  sk.ink(dense([[x, y], [x, top]]), { w: tw - 8, color: C.red, seed: sd + 1, wob: 0.2, cap: "butt" });
  sk.ink(tube, { w: 6, seed: sd + 2, wob: 0.4 });
  for (let i = 1; i <= (o.ticks ?? 6); i++) sk.ink(dense([[x + tw / 2 + 2, y - 10 - (len - 22) * i / ((o.ticks ?? 6) + 1)], [x + tw / 2 + (i % 2 ? 10 : 6), y - 10 - (len - 22) * i / ((o.ticks ?? 6) + 1)]]), { w: 3.5, color: C.gray, seed: sd + 3 + i, wob: 0 });
  const bulb = circ(x, y, br, { over: 0.15, seed: sd + 12 });
  sk.fill(bulb, C.red, { dx: 0, dy: 0, wob: 0.4, seed: sd + 13 }); sk.ink(bulb, { w: 6, seed: sd + 14, wob: 0.4 });
  return { top };
}

/* ---------- 1. 1757년, 뉴욕: 쇠가 더 차가운 까닭 ---------- */
// 서서 쓰는 나무 책상: 비스듬한 윗판 + 서랍 상자 + 쇠 자물쇠. (x0, y0) = 윗판 왼쪽 끝
function writingDesk(sk, x0, y0, sd = 11) {
  thin(sk, 0.82, () => {
    for (const [lx, i] of [[x0 + 34, 0], [x0 + 300, 1]]) { const lg = poly([[lx - 12, y0 + 150], [lx + 12, y0 + 150], [lx + 10, 700], [lx - 10, 700]], 4); sk.fill(lg, C.woodDark, { seed: sd + i, tex: true, texAng: 1.5 }); sk.ink(lg, { w: 10, seed: sd + 2 + i }); }
    const box = poly([[x0, y0 + 26], [x0 + 340, y0 - 10], [x0 + 340, y0 + 150], [x0, y0 + 150]], 4);
    sk.fill(box, C.wood, { seed: sd + 4, tex: true, texAng: 0.04 }); sk.ink(box, { w: 11, seed: sd + 5 });
    sk.ink(dense([[x0 + 6, y0 + 60], [x0 + 334, y0 + 34]]), { w: 6, color: C.woodDark, seed: sd + 6, wob: 0.4 });
  });
  // 윗판의 편지와 잉크병, 깃펜
  const pp = poly([[x0 + 40, y0 + 12], [x0 + 150, y0 + 2], [x0 + 154, y0 + 24], [x0 + 44, y0 + 34]], 3);
  sk.fill(pp, C.parchment, { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 7 }); sk.ink(pp, { w: 5, seed: sd + 8, wob: 0.4 });
  for (let i = 0; i < 3; i++) sk.ink(dense([[x0 + 56, y0 + 14 + i * 7 - i * 0.6], [x0 + 136, y0 + 7 + i * 7 - i * 0.6]]), { w: 2.5, color: C.gray, seed: sd + 9 + i, wob: 0 });
  const ink = rrect(x0 + 250, y0 - 40, 34, 34, 8);
  sk.fill(ink, "#3A4250", { dx: 0, dy: 0, wob: 0.3, seed: sd + 12 }); sk.ink(ink, { w: 6, seed: sd + 13, wob: 0.3 });
  sk.ink(curve([[x0 + 266, y0 - 40], [x0 + 276, y0 - 92], [x0 + 300, y0 - 128]]), { w: 5, seed: sd + 14, wob: 0.3 });
  const fe = curve([[x0 + 280, y0 - 74], [x0 + 300, y0 - 112], [x0 + 312, y0 - 140], [x0 + 296, y0 - 108]], true, 3);
  sk.fill(fe, C.white, { dx: 0, dy: 0, wob: 0.3, seed: sd + 15 }); sk.ink(fe, { w: 4, seed: sd + 16, wob: 0.3 });
}
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  floor(sk, 700, 21);
  const dx0 = 150, dy0 = 420;
  writingDesk(sk, dx0, dy0);
  // 쇠 자물쇠: 상자 앞면의 쇠판과 열쇠 구멍
  const lx = dx0 + 250, ly = dy0 + 96;
  const plate = rrect(lx - 36, ly - 34, 72, 68, 12);
  sk.fill(plate, "#A9B1BB", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 31 }); sk.ink(plate, { w: 7, seed: 32, wob: 0.4 });
  const kh = [...circ(lx, ly - 6, 8, { over: 0, seed: 33 }), [lx + 5, ly + 18], [lx - 5, ly + 18]];
  sk.fill(kh, C.ink, { dx: 0, dy: 0, wob: 0.2, seed: 34 });
  sk.ink(curve([[lx - 22, ly - 22], [lx - 10, ly - 28], [lx + 4, ly - 26]]), { w: 3.5, color: C.white, seed: 35, wob: 0.2 });
  // 프랭클린: 왼손은 나무 윗판에, 오른손은 쇠 자물쇠에
  const fx = 640, fy = 700, fs = 0.74;
  const P = pose({ elL: [-96, -284], haL: [-186, -332], elR: [-60, -236], haR: [-160, -232], tilt: -0.05 });
  person(sk, fx, fy, fs, P, FRANKLIN, { name: "franklin", face: "curious", hands: false });
  const hL = [fx + fs * -186, fy + fs * -332], hR = [fx + fs * -160, fy + fs * -232];
  handDot(sk, hL, C.skin, 41, 11); handDot(sk, [lx + 26, ly + 4], C.skin, 42, 11);
  sk.ink(curve([[hR[0], hR[1]], [lx + 60, ly - 4], [lx + 32, ly + 2]]), { w: 9.6, seed: 43, wob: 0.6 }); // 자물쇠까지 뻗은 팔 끝
  // 쇠에 댄 손에서 차가운 느낌(파란 떨림 선), 나무에 댄 손은 그대로
  for (const [ax, ay, bx, by, i] of [[lx + 50, ly - 40, lx + 70, ly - 62, 0], [lx + 62, ly - 18, lx + 90, ly - 30, 1], [lx + 58, ly + 22, lx + 88, ly + 30, 2]]) sk.ink(dense([[ax, ay], [bx, by]]), { w: 5, color: C.blue, seed: 44 + i, wob: 0.6 });
  qmark(sk, fx + 120, fy - 470, 0.7, { color: C.teal, seed: 49 });
  return sk;
}

/* ---------- 2. 1780년, 빈: 밀랍이 녹은 거리 ---------- */
const METALS = [ // 위에서부터: 은, 구리, 금, 주석, 쇠, 납(녹은 거리 순)
  ["#CDD3DB", 0.95], ["#C77A4A", 0.82], ["#E2B23C", 0.64], ["#AEB6C0", 0.48], ["#6E7682", 0.33], ["#5A6372", 0.2],
];
const WAX = "#F3E6BF", WAXLINE = "#B49A5E";
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  floor(sk, 700, 51);
  // 뜨거운 기름이 든 통과 아래의 등잔불
  const tx = 150, ty = 320, tw = 150, th = 230;
  thin(sk, 0.82, () => {
    for (const [lx, i] of [[tx + 22, 0], [tx + tw - 22, 1]]) sk.ink(dense([[lx, ty + th], [lx + (i ? 10 : -10), 700]]), { w: 11, seed: 53 + i });
    const box = poly([[tx, ty], [tx + tw, ty], [tx + tw, ty + th], [tx, ty + th]], 4);
    sk.fill(box, "#B7BEC7", { dx: 0, dy: 0, wob: 0.4, seed: 54 });
    const oil = poly([[tx + 10, ty + 34], [tx + tw - 10, ty + 34], [tx + tw - 10, ty + th - 10], [tx + 10, ty + th - 10]], 4);
    sk.fill(oil, "#F0B54C", { dx: 0, dy: 0, wob: 0.4, seed: 55 });
    sk.ink(dense([[tx + 10, ty + 34], [tx + tw - 10, ty + 34]]), { w: 6, color: "#C9862A", seed: 58, wob: 0.4 });
    sk.ink(box, { w: 11, seed: 56 });
  });
  for (const [x, i] of [[tx + 40, 0], [tx + 75, 1], [tx + 110, 2]]) sk.ink(squiggle(x, ty + 30, 70, 6, 2, i * 1.4), { w: 5, color: C.red, seed: 57 + i, wob: 0 });
  const fl = curve([[tx + 75, ty + th + 12], [tx + 98, ty + th + 50], [tx + 92, ty + th + 76], [tx + 58, ty + th + 76], [tx + 52, ty + th + 50]], true, 3);
  sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.6, seed: 61 }); sk.ink(fl, { w: 6, color: C.red, seed: 62, wob: 0.6 });
  const lamp = rrect(tx + 40, ty + th + 76, 70, 34, 10);
  sk.fill(lamp, "#8A9099", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 63 }); sk.ink(lamp, { w: 7, seed: 64, wob: 0.4 });
  // 통 옆으로 나란히 꽂힌 철사 여섯: 통 쪽부터 밀랍이 녹아 맨 금속이 드러났다
  const x0 = tx + tw, x1 = 610;
  METALS.forEach(([col, melt], i) => {
    const y = ty + 66 + i * 30, xm = x0 + (x1 - x0) * melt * 0.92;
    sk.ink(dense([[x0 - 4, y], [x1, y]]), { w: 13, seed: 71 + i, wob: 0.3 });
    sk.ink(dense([[x0 - 2, y], [x1 - 2, y]]), { w: 6, color: col, seed: 71 + i, wob: 0.3, cap: "butt" });
    const wax = rrect(xm, y - 11, x1 - xm, 22, 10);
    sk.fill(wax, WAX, { dx: 0, dy: 0, wob: 0.3, seed: 81 + i }); sk.ink(wax, { w: 4, color: WAXLINE, seed: 91 + i, wob: 0.3 });
    // 녹아 떨어진 밀랍 방울
    if (melt > 0.3) sk.fill(curve([[xm - 26, y + 9], [xm - 20, y + 18], [xm - 26, y + 24], [xm - 32, y + 18]], true, 2), WAX, { dx: 0, dy: 0, wob: 0.2, seed: 101 + i });
  });
  // 잉엔하우스: 가장 멀리 녹은 철사를 가리킨다
  const P = pose({ elL: [-98, -330], haL: [-170, -372], elR: [50, -260], haR: [24, -218], tilt: -0.06 });
  person(sk, 790, 704, 0.74, P, INGEN, { name: "ingen", face: "wide" });
  return sk;
}

/* ---------- 3. 전도: 흔들림의 릴레이(오늘날의 설명) ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  // 아래: 뜨거운 기름 통에 꽂힌 구리 철사 한 가닥(오른쪽은 아직 밀랍)
  thin(sk, 0.82, () => {
    const box = poly([[-10, 560], [120, 560], [120, 730], [-10, 730]], 4);
    sk.fill(box, "#B7BEC7", { dx: 0, dy: 0, wob: 0.4, seed: 110 });
    sk.fill(poly([[-10, 588], [108, 588], [108, 730], [-10, 730]], 4), "#F0B54C", { dx: 0, dy: 0, wob: 0.4, seed: 111 });
    sk.ink(dense([[-10, 588], [108, 588]]), { w: 6, color: "#C9862A", seed: 109, wob: 0.4 });
    sk.ink(box, { w: 11, seed: 112 });
  });
  sk.ink(dense([[116, 640], [930, 640]]), { w: 22, seed: 113, wob: 0.3 });
  const n = 14;
  for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n + 0.02; sk.ink(dense([[120 + 810 * u0, 640], [120 + 810 * Math.min(1, u1), 640]]), { w: 11, color: heat(Math.max(0.12, 0.95 - u0 * 1.2)), seed: 114, wob: 0, cap: "butt" }); }
  const wax = rrect(700, 626, 232, 28, 12);
  sk.fill(wax, WAX, { dx: 0, dy: 0, wob: 0.3, seed: 115 }); sk.ink(wax, { w: 4, color: WAXLINE, seed: 116, wob: 0.3 });
  // 크게 본 철사 속: 입자 세 줄. 기름 쪽(왼쪽)은 크게 흔들리고 빨갛다
  const cx = 480, cy = 300, r = 250;
  leader(sk, [352, 628], [cx - 160, cy + 192], 117); leader(sk, [608, 628], [cx + 160, cy + 192], 118);
  lensFill(sk, cx, cy, r, 119);
  for (let col = 0; col < 6; col++) for (let row = 0; row < 3; row++) {
    const x = cx - 185 + col * 74, y = cy - 66 + row * 66, t = 0.95 - col * 0.17;
    particle(sk, x, y, 24, t, 131 + col * 10 + row * 3, 3 - Math.floor(col / 2));
  }
  for (let col = 0; col < 5; col++) arrow(sk, [[cx - 168 + col * 74, cy - 146], [cx - 126 + col * 74, cy - 146]], { w: 5, color: C.gray, seed: 221 + col, straight: true, head: 13, wob: 0.3 });
  lensRing(sk, cx, cy, r, 231);
  return sk;
}

/* ---------- 4. 1797년, 뮌헨: 온도계 속의 먼지 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  floor(sk, 700, 301);
  // 창: 오른쪽 위. 햇살이 왼쪽 아래로 비스듬히 든다
  const wx = 690, wy = 90, ww = 230, wh = 290;
  const beam = poly([[wx + 10, wy + 40], [wx + ww - 20, wy + wh - 10], [560, 640], [470, 470]], 5);
  sk.fill(beam, "#FFE58A", { dx: 0, dy: 0, wob: 0.5, seed: 303, alpha: 0.42 });
  thin(sk, 0.82, () => {
    const gl = rrect(wx, wy, ww, wh, 14);
    sk.fill(gl, "#DDEFFA", { dx: 0, dy: 0, wob: 0.4, seed: 305 });
    sk.ink(dense([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]]), { w: 9, color: "#8A6A5A", seed: 306, wob: 0.5 });
    sk.ink(dense([[wx, wy + wh / 2], [wx + ww, wy + wh / 2]]), { w: 9, color: "#8A6A5A", seed: 307, wob: 0.5 });
    sk.ink(gl, { w: 12, color: "#6B4A32", seed: 308 });
    const sill = rrect(wx - 20, wy + wh, ww + 40, 20, 8);
    sk.fill(sill, "#B5814C", { seed: 309, tex: true }); sk.ink(sill, { w: 9, seed: 310 });
  });
  sun(sk, wx + 66, wy + 66, 30, { seed: 311 });
  // 탁자 위 큰 온도계: 구리 알 + 긴 유리관(속은 알코올)
  const tx = 612, by = 560;
  thin(sk, 0.82, () => {
    const tb = poly([[492, 610], [744, 610], [744, 632], [492, 632]], 4);
    sk.fill(tb, C.wood, { seed: 313, tex: true }); sk.ink(tb, { w: 10, seed: 314 });
    for (const [lx, i] of [[518, 0], [718, 1]]) sk.ink(dense([[lx, 632], [lx, 700]]), { w: 10, seed: 315 + i });
  });
  const stand = poly([[tx - 50, 610], [tx + 50, 610], [tx + 40, 588], [tx - 40, 588]], 3);
  sk.fill(stand, C.woodDark, { dx: 0.6, dy: 0.8, wob: 0.4, seed: 317 }); sk.ink(stand, { w: 7, seed: 318, wob: 0.4 });
  const tube = rrect(tx - 12, 150, 24, by - 150 - 30, 12);
  sk.fill(tube, "#FBEFC8", { dx: 0, dy: 0, wob: 0.3, seed: 319 });
  for (let i = 0; i < 9; i++) sk.dot(tx - 5 + (i % 3) * 5, 210 + i * 34, 2.4, "#6B5A4A");
  sk.ink(tube, { w: 6, seed: 320, wob: 0.4 });
  const ball = circ(tx, by, 48, { over: 0.15, seed: 321 });
  sk.fill(ball, "#C77A4A", { dx: 1, dy: 1.2, wob: 0.6, seed: 322, tex: true }); sk.ink(ball, { w: 8, seed: 323, wob: 0.5 });
  sk.ink(curve([[tx - 26, by - 18], [tx - 14, by - 32], [tx + 2, by - 36]]), { w: 4, color: C.white, seed: 324, wob: 0.2 });
  // 럼퍼드: 렌즈를 관에 대고 들여다본다. 렌즈 안에는 크게 본 관 속 흐름
  const P = pose({ elR: [96, -312], haR: [166, -356], elL: [-50, -262], haL: [-18, -222], tilt: 0.05 });
  const rx = 250, ry = 704, rs = 0.74;
  person(sk, rx, ry, rs, P, RUMFORD, { name: "rumford", face: "wide", under: sash(sk) });
  const hx = rx + rs * 166, hy = ry - rs * 356;
  const lx = 448, ly = 286, lr = 116;
  sk.ink(dense([[hx, hy], [lx - lr * 0.62, ly + lr * 0.72]]), { w: 16, color: "#8A5A33", seed: 331, wob: 0.4 });
  handDot(sk, [hx, hy], C.skin, 332, 11);
  leader(sk, [lx + lr * 0.86, ly - lr * 0.44], [tx - 13, 250], 333); leader(sk, [lx + lr * 0.86, ly + lr * 0.44], [tx - 13, 330], 334);
  lensFill(sk, lx, ly, lr, 335, "#FFF6DA");
  // 관 벽 두 줄, 가운데로 오르는 빨간 흐름, 벽을 따라 내려오는 파란 흐름, 먼지 알갱이
  for (const sg of [-1, 1]) sk.ink(dense([[lx + sg * 78, ly - 80], [lx + sg * 78, ly + 80]]), { w: 6, color: "#9AA6B2", seed: 336 + (sg > 0 ? 1 : 0), wob: 0.2 });
  arrow(sk, [[lx, ly + 80], [lx - 2, ly], [lx, ly - 78]], { w: 10, color: C.red, seed: 338, wob: 0.4, head: 22 });
  for (const sg of [-1, 1]) arrow(sk, [[lx + sg * 52, ly - 78], [lx + sg * 54, ly], [lx + sg * 52, ly + 78]], { w: 9, color: C.blue, seed: 339 + (sg > 0 ? 1 : 0), wob: 0.4, head: 20 });
  for (const [dx, dy] of [[-20, 44], [18, -22], [-14, -60], [32, 62], [-36, -6], [44, -48], [-50, 34], [24, 16], [6, 66], [-30, -48]]) sk.dot(lx + dx, ly + dy, 3.4, "#6B5A4A");
  lensRing(sk, lx, ly, lr, 341, 11);
  return sk;
}

/* ---------- 5. 대류: 입자가 직접 나른다(오늘날의 설명) ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  floor(sk, 700, 351);
  // 가스 불꽃 위의 냄비. 속을 잘라 보인다
  const stove = rrect(300, 628, 360, 70, 14);
  sk.fill(stove, "#8A9099", { seed: 353, tex: true, texAng: 0.04 }); sk.ink(stove, { w: 10, seed: 354 });
  for (let i = 0; i < 6; i++) { const x = 380 + i * 40; const f = curve([[x, 582], [x + 13, 606], [x + 8, 624], [x - 8, 624], [x - 13, 606]], true, 3); sk.fill(f, "#5BA8EE", { dx: 0, dy: 0, wob: 0.4, seed: 355 + i }); sk.ink(f, { w: 5, color: "#2F6DB5", seed: 361 + i, wob: 0.4 }); }
  const pot = poly([[230, 150], [730, 150], [714, 568], [246, 568]], 5);
  sk.fill(pot, "#DCEFFA", { dx: 0, dy: 0, wob: 0.6, seed: 367 });
  sk.ink(dense([[240, 196], [720, 196]]), { w: 6, color: "#7FB6D6", seed: 368, wob: 0.6 });
  // 데워진 입자는 가운데로 오르고, 식은 입자는 양옆으로 내려온다
  const pts = [
    [480, 520, 0.92, 2], [454, 440, 0.86, 2], [500, 360, 0.8, 1], [470, 280, 0.72, 1], [520, 236, 0.66, 0],
    [620, 236, 0.42, 0], [680, 330, 0.3, 0], [670, 430, 0.22, 0], [610, 520, 0.4, 1],
    [340, 236, 0.42, 0], [280, 330, 0.3, 0], [290, 430, 0.22, 0], [350, 520, 0.4, 1],
    [560, 470, 0.6, 1], [400, 470, 0.6, 1], [600, 300, 0.36, 0], [370, 300, 0.36, 0],
  ];
  pts.forEach(([x, y, t, sh], i) => particle(sk, x, y, 18, t, 371 + i * 7, sh));
  arrow(sk, [[480, 548], [470, 400], [482, 222]], { w: 12, color: C.red, seed: 501, wob: 0.5, head: 30 });
  arrow(sk, [[520, 210], [636, 214], [700, 360], [646, 540]], { w: 11, color: C.blue, seed: 502, wob: 0.5, head: 28 });
  arrow(sk, [[440, 210], [324, 214], [262, 360], [314, 540]], { w: 11, color: C.blue, seed: 503, wob: 0.5, head: 28 });
  sk.ink(pot, { w: 12, seed: 504 });
  for (const sg of [-1, 1]) sk.ink(curve([[480 + sg * 250, 186], [480 + sg * 296, 172], [480 + sg * 306, 200]]), { w: 12, seed: 505 + (sg > 0 ? 1 : 0) });
  return sk;
}

/* ---------- 6. 1785년, 만하임: 공기를 뺀 유리공 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  floor(sk, 700, 551);
  // 화로 위 냄비의 끓는 물. 물속에 유리공이 잠겨 있다
  const cx = 600, wy = 400;
  thin(sk, 0.82, () => {
    for (const sg of [-1, 1]) sk.ink(dense([[cx + sg * 130, 640], [cx + sg * 150, 700]]), { w: 11, seed: 553 + (sg > 0 ? 1 : 0) });
    const br = poly([[cx - 170, 600], [cx + 170, 600], [cx + 150, 650], [cx - 150, 650]], 4);
    sk.fill(br, "#4A4A52", { seed: 555, tex: true, texAng: 0.04 }); sk.ink(br, { w: 10, seed: 556 });
  });
  for (let i = 0; i < 5; i++) { const c = circ(cx - 120 + i * 60, 594, 18 + (i % 2) * 4, { over: 0.15, seed: 557 + i, lump: 0.1 }); sk.fill(c, i % 2 ? C.orange : C.red, { dx: 0, dy: 0, wob: 0.6, seed: 563 + i }); }
  const water = poly([[cx - 176, wy], [cx + 176, wy], [cx + 160, 580], [cx - 160, 580]], 4);
  sk.fill(water, "#9FD0EE", { dx: 0, dy: 0, wob: 0.4, seed: 569, tex: 0.6 });
  // 끓는 물방울
  for (const [x, y, r] of [[cx - 130, 520, 9], [cx - 100, 460, 7], [cx + 110, 500, 9], [cx + 140, 440, 6], [cx - 60, 548, 6], [cx + 70, 556, 7], [cx + 30, 430, 5]]) sk.ink(circ(x, y, r, { over: 0.1, seed: 570 + x }), { w: 4, color: C.white, seed: 571, wob: 0.2 });
  // 유리공: 속이 비어 있고(공기를 뺐다), 가운데에 온도계의 알
  const gy = 500, gr = 72;
  const glass = circ(cx, gy, gr, { over: 0.12, seed: 573 });
  sk.fill(glass, "#FFFFFF", { dx: 0, dy: 0, wob: 0.4, seed: 574 });
  sk.ink(glass, { w: 7, color: "#5B8BB0", seed: 575, wob: 0.4 });
  sk.ink(curve([[cx - 46, gy - 40], [cx - 30, gy - 56], [cx - 8, gy - 62]]), { w: 4, color: "#BFE2F4", seed: 576, wob: 0.2 });
  const pot = poly([[cx - 190, 330], [cx + 190, 330], [cx + 166, 592], [cx - 166, 592]], 5);
  thin(sk, 0.82, () => sk.ink(pot, { w: 12, seed: 577 }));
  for (const [x, i] of [[cx - 110, 0], [cx + 110, 1]]) sk.ink(squiggle(x, 316, 60, 7, 2, i * 1.3), { w: 5, color: C.red, seed: 578 + i, wob: 0 });
  // 유리공 목에서 위로 뻗은 온도계 관. 눈금이 올라간다
  const top = thermo(sk, cx, gy, 330, 0.62, 581, { w: 20, br: 16, ticks: 7 }).top;
  arrow(sk, [[cx + 44, gy - 170], [cx + 44, top - 6]], { w: 7, color: C.red, seed: 595, straight: true, head: 16, wob: 0.3 });
  // 나무 받침대가 온도계 관을 붙든다
  thin(sk, 0.82, () => {
    sk.ink(dense([[cx + 230, 700], [cx + 230, 236]]), { w: 14, color: "#6B4A32", seed: 591, wob: 0.4 });
    sk.ink(dense([[cx + 230, 246], [cx + 16, 246]]), { w: 12, color: "#6B4A32", seed: 592, wob: 0.4 });
    const cl = rrect(cx - 18, 230, 36, 32, 8);
    sk.fill(cl, C.woodDark, { dx: 0.5, dy: 0.6, wob: 0.3, seed: 593 }); sk.ink(cl, { w: 7, seed: 594, wob: 0.3 });
  });
  // 백작이 되기 전의 럼퍼드: 올라가는 눈금을 가리킨다
  const P = pose({ elR: [96, -330], haR: [176, -372], elL: [-50, -262], haL: [-18, -222], tilt: 0.06 });
  person(sk, 250, 704, 0.74, P, RUMFORD, { name: "rumford", face: "shock" });
  return sk;
}

/* ---------- 7. 복사: 빈 곳을 건너는 열(오늘날의 설명) ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  const cx = 480, cy = 300, r = 250;
  lensFill(sk, cx, cy, r, 601, "#FFFDF6");
  // 뜨거운 물 + 유리벽(진한 고리), 안쪽은 텅 빈 곳, 가운데 온도계 알
  const wall = 168, inner = 138;
  sk.fill(circ(cx, cy, r - 6, { over: 0.12, seed: 602 }), "#B9DDF2", { dx: 0, dy: 0, wob: 0.5, seed: 602 });
  const outer = circ(cx, cy, wall, { over: 0.12, seed: 603 });
  sk.fill(outer, "#EAF6FC", { dx: 0, dy: 0, wob: 0.5, seed: 604 });
  const hole = circ(cx, cy, inner, { over: 0.12, seed: 605 });
  sk.fill(hole, "#FFFFFF", { dx: 0, dy: 0, wob: 0.4, seed: 606 });
  sk.ink(outer, { w: 7, color: "#5B8BB0", seed: 607, wob: 0.4 }); sk.ink(hole, { w: 7, color: "#5B8BB0", seed: 608, wob: 0.4 });
  // 바깥 뜨거운 물의 입자들(크게 흔들린다)
  for (const a of [0.3, 1.1, 1.9, 2.7, 3.5, 4.3, 5.1, 5.9]) particle(sk, cx + 205 * Math.cos(a), cy + 205 * Math.sin(a), 16, 0.86, 611 + Math.round(a * 10), 1);
  // 빈 곳을 곧장 건너오는 열
  for (const a of [0.0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6]) ray(sk, [cx + 132 * Math.cos(a), cy + 132 * Math.sin(a)], [cx + 46 * Math.cos(a), cy + 46 * Math.sin(a)], 701 + Math.round(a * 10), { amp: 5, waves: 3, w: 6, head: 14 });
  const bulb = circ(cx, cy, 30, { over: 0.15, seed: 751 });
  sk.fill(bulb, C.red, { dx: 0, dy: 0, wob: 0.4, seed: 752 }); sk.ink(bulb, { w: 6, seed: 753, wob: 0.4 });
  sk.ink(dense([[cx, cy - 30], [cx, cy - r + 10]]), { w: 16, seed: 754, wob: 0.2 });
  sk.ink(dense([[cx, cy - 32], [cx, cy - r + 12]]), { w: 6, color: C.red, seed: 755, wob: 0.2, cap: "butt" });
  lensRing(sk, cx, cy, r, 757);
  // 아래: 해의 열도 텅 빈 우주를 건너온다
  sun(sk, 100, 640, 38, { seed: 761 });
  for (const [y, i] of [[622, 0], [656, 1]]) ray(sk, [160, y], [790, y], 763 + i, { amp: 6, waves: 9, w: 6, head: 16 });
  earth(sk, 860, 640, 44, { seed: 771 });
  return sk;
}

/* ---------- 8. 오늘날: 사람 몸도 열을 내보내요 ---------- */
function camera(sk, x, y, sd = 801) {
  sk.at(x, y, 1, () => {
    const b = rrect(-48, -34, 96, 68, 12);
    sk.fill(b, "#55606E", { seed: sd, dx: 1, dy: 1.2 }); sk.ink(b, { w: 9, seed: sd + 1 });
    const l = circ(50, 0, 17, { over: 0.15, seed: sd + 2 });
    sk.fill(l, "#22262E", { dx: 0, dy: 0, wob: 0.4, seed: sd + 3 }); sk.ink(l, { w: 7, seed: sd + 4 });
    sk.dot(-28, -18, 5, C.red);
  });
}
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  // 불 끈 방: 어두운 면은 위쪽 띠로만
  const dark = [[-12, -12], [972, -12], ...curve([[972, 300], [700, 312], [420, 300], [160, 314], [-12, 302]], false, 5)];
  dark.push(dark[0]);
  sk.fill(dark, "#2C3A70", { dx: 0, dy: 0, wob: 0, seed: 803, tex: 0.6, texAng: 0.1 });
  floor(sk, 704, 805);
  // 카메라 화면: 어둠 속에서도 쌤의 몸이 환하다
  const sx = 330, sy = 70, sw = 300, sh = 330;
  const scr = rrect(sx, sy, sw, sh, 26);
  sk.fill(scr, "#1F2A60", { dx: 0, dy: 0, wob: 0.6, seed: 807, tex: 0.5 });
  const bx = sx + sw / 2;
  const limbs = [[[bx, 252], [bx, 320]], [[bx, 320], [bx - 34, 384]], [[bx, 320], [bx + 34, 384]], [[bx, 262], [bx - 56, 300]], [[bx, 262], [bx + 60, 214]]];
  for (const pts of limbs) sk.ink(dense(pts), { w: 30, color: heat(0.62), seed: 809, wob: 0.5 });
  for (const pts of limbs) sk.ink(dense(pts), { w: 15, color: heat(0.86), seed: 810, wob: 0.5 });
  sk.fill(circ(bx, 186, 56, { over: 0.15, seed: 811 }), heat(0.8), { dx: 0, dy: 0, wob: 0.6, seed: 812 });
  sk.fill(circ(bx, 186, 40, { over: 0.15, seed: 813 }), heat(0.99), { dx: 0, dy: 0, wob: 0.5, seed: 814 });
  sk.fill(circ(bx, 188, 24, { over: 0.15, seed: 815 }), "#FFF0B8", { dx: 0, dy: 0, wob: 0.4, seed: 816 });
  for (let i = 0; i < 12; i++) sk.ink(dense([[sx + 30 + i * 20, sy + sh - 24], [sx + 30 + (i + 1) * 20 + 1, sy + sh - 24]]), { w: 12, color: heat(i / 11), seed: 817, wob: 0, cap: "butt" });
  sk.ink(scr, { w: 12, seed: 818 });
  // 학생: 열화상 카메라를 든다
  const P = pose({ elR: [70, -290], haR: [124, -322], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  const fx = 150, fy = 704, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...STUDENT, name: "student", hands: "L" });
  const hx = fx + fs * 124, hy = fy - fs * 322;
  leader(sk, [hx + 74, hy - 30], [sx, 110], 821); leader(sk, [hx + 74, hy + 14], [sx, 380], 822);
  camera(sk, hx + 30, hy - 10, 831);
  handDot(sk, [hx, hy + 22], C.skin, 823, 11);
  // 쌤: 어둠 속에서 손을 흔든다(겉으로는 잘 안 보인다)
  const wave = pose({ elR: [104, -352], haR: [176, -452], elL: [-50, -260], haL: [-24, -218], tilt: 0.04 });
  drawFigure(sk, 790, 704, 0.7, wave, { ...TEACHER, name: "teacher" });
  return sk;
}

export const META = {
  title: "과학자들이 찾은<br><em>열의 세 가지 길</em>",
  lead: "프랭클린, 잉엔하우스, 럼퍼드. 과학자들의 실험을 따라가며 열이 이동하는 세 가지 길을 찾아봐요.",
  narrator: "같은 방에 있던 나무와 쇠, 그런데 쇠가 더 차갑게 느껴져요. <b>열은 어떻게 이동할까요?</b> 과학자들이 찾은 답을 컷을 넘기며 만나 봐요.",
  cta: "실험으로 확인하기",
};

const TEXT = [
  {
    when: "1757년, 뉴욕", stage: "궁금증", title: "쇠가 더 차가운 까닭",
    caption: "1757년, 벤저민 프랭클린이 편지를 쓰다가 나무 책상과 쇠 자물쇠를 번갈아 만졌어요. 같은 방에 오래 있었으니 온도는 같을 텐데 자물쇠가 훨씬 차갑게 느껴졌어요. 프랭클린은 쇠가 나무보다 손의 열을 빨리 가져가기 때문이라고 생각했어요.",
    bubbles: [{ who: "franklin", text: "자물쇠가<br>더 차갑네?" }],
  },
  {
    when: "1780년, 오스트리아 빈", stage: "실험", title: "밀랍이 녹은 거리",
    caption: "1780년, 의사이자 과학자인 잉엔하우스는 프랭클린의 생각대로 여러 금속 철사에 밀랍을 입히고 한쪽 끝을 뜨거운 기름에 함께 담갔어요. 열이 철사를 타고 퍼지며 밀랍이 녹았는데, 은과 구리에서는 멀리까지, 쇠와 납에서는 조금만 녹았어요.",
    bubbles: [{ who: "ingen", text: "녹은 거리가<br>다 달라!" }],
  },
  {
    stage: "전도", title: "흔들림의 릴레이",
    caption: "오늘날에는 이렇게 설명해요. 철사를 이루는 입자는 제자리에서 흔들려요. 뜨거운 쪽 입자가 활발하게 흔들리면 그 흔들림이 <b>이웃한 입자에 차례로</b> 전해지며 열이 이동해요. 이 빠르기가 물질마다 달라서 같은 온도라도 쇠가 손의 열을 더 빨리 가져가요.",
    term: { name: "전도", def: "입자의 운동이 <b>이웃한 입자에 차례로 전달</b>되어 열이 이동하는 현상. 주로 고체에서 일어나요." },
  },
  {
    when: "1797년, 독일 뮌헨", stage: "발견", title: "온도계 속의 먼지",
    caption: "1797년, 바이에른에서 일하던 과학자 럼퍼드 백작은 알코올을 채운 커다란 온도계를 데운 뒤 햇빛 드는 창가에 두고 식혔어요. 그때 관 속에서 햇빛에 비친 먼지 알갱이가 빠르게 움직였어요. 가운데로는 올라가고 가장자리로는 내려왔어요. 관 속 액체가 통째로 돌고 있었던 거예요.",
    bubbles: [{ who: "rumford", text: "액체가<br>돌고 있어!" }],
  },
  {
    stage: "대류", title: "입자가 직접 나른다",
    caption: "오늘날에는 이렇게 설명해요. 액체나 기체에서는 데워진 부분이 위로 올라가고, 차가운 부분이 아래로 내려오며 돌아요. 입자들이 <b>직접 자리를 옮기며</b> 열을 나르는 거예요. 냄비 바닥만 데워도 물 전체가 뜨거워지는 까닭이에요. 공기도 이렇게 돌아요.",
    term: { name: "대류", def: "물질을 이루는 <b>입자들이 직접 이동</b>하면서 열을 전달하는 현상. 액체와 기체에서 일어나요." },
  },
  {
    when: "1785년, 독일 만하임", stage: "실험", title: "공기를 뺀 유리공",
    caption: "1785년, 백작이 되기 전의 럼퍼드는 공기를 모두 빼낸 유리공 한가운데에 온도계 알을 넣고, 유리공을 끓는 물에 담갔어요. 온도계와 유리벽 사이에 공기가 없는데도 눈금이 올라갔어요. 공기가 있을 때보다는 느렸지만 열은 빈 곳을 건너왔어요.",
    bubbles: [{ who: "rumford", text: "공기가<br>없는데도!" }],
  },
  {
    stage: "복사", title: "빈 곳을 건너는 열",
    caption: "오늘날에는 이렇게 설명해요. 열은 입자가 없는 빈 곳도 <b>곧장 건너갈</b> 수 있어요. 열을 나를 입자가 없어도 되는 길이라, 공기를 뺀 유리공 속 온도계도 데워졌어요. 해의 열이 텅 빈 우주를 건너 지구까지 오는 것도 이 길이에요.",
    term: { name: "복사", def: "열이 <b>물질을 통하지 않고 직접</b> 이동하는 현상. 해의 열, 난로 앞의 열기가 복사예요." },
  },
  {
    when: "오늘날, 불 끈 방", stage: "오늘날", title: "사람 몸도 열을 내보내요",
    caption: "오늘날에는 열화상 카메라로 물체가 내보내는 열을 색으로 볼 수 있어요. 불을 꺼도 화면 속 사람이 환한 까닭은 사람 몸도 <b>복사</b>로 열을 내보내기 때문이에요. 이제 전도, 대류, 복사를 실험으로 하나씩 확인해 봐요!",
    bubbles: [{ who: "student", text: "깜깜한데<br>보여요!" }],
  },
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7, p8].map((fn, i) => ({ sk: fn(), ...TEXT[i] }));
}
