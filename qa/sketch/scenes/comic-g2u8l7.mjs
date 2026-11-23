// 중2 과학 g2u8l7 만화 v2(배선 전 미리보기): 뿌연 성운에서 멀어지는 은하까지(팽창하는 우주의 도입). 8컷.
// 조사와 콘티: qa/sketch/research/g2u8l7.md
//   1 18세기부터 풀리지 않던 물음(성운은 우리은하 안인가 밖인가, 허셜의 망원경) → 2 1912년 리비트의 규칙(밝을수록 느리게 깜빡이는 별)
//   → 3 1923년 후커 망원경 → 4 건판의 밝기가 변하는 별 → 5 1924년 우리은하 밖의 은하 → 6 슬라이퍼의 빛 띠
//   → 7 1929년 그래프(르메트르는 글로만) → 8 오늘: 그럼 우리가 한가운데? (답하지 않고 풍선 랩으로 넘긴다)
// 화살표 색: 주황 = 멀다, 멀어진다. 청록 = 우리은하 안쪽, 우리은하의 크기(견주는 길이).
// 대폭발, 우주의 나이, 우주 배경 복사, "중심이 없다"는 답은 만화에 넣지 않는다(뒤 스텝과 랩의 몫).
// 2026-11-23 저작권 손질: 옛 1컷(1920년 워싱턴의 두 학자 강연)을 허셜의 밤하늘 관측과 생각 구름으로 바꿨다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, hash, emark, qmark, sparkle, arrow, TAU } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT, R } from "../lib/figure.mjs";
import { board, desk, openBook, cloud } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
const NIGHT = "#1B2138", FAR = C.orange, NEAR = "#2FC4B2", NEB = "#B9CBE0", MW = "#FFE08A", GLASSP = "#DDE2E6";

// 허블: 옆으로 넘긴 짙은 머리 + 갈색 트위드 재킷 + 파이프(장면에서 덧그린다). 다른 인물보다 조금 크게 그린다
const HUBBLE = { hair: "short", hairColor: "#3A2E28", fringe: 24, coat: { color: "#9A7B55", buttons: "#5B463A", seam: "#6B5236" }, seed: 311, mini: true, face: "calm" };
// 리비트: 틀어 올린 머리(장면에서 머리 뒤에 덧그린다) + 발목까지 오는 긴 옷
const LEAVITT = { hair: "short", hairColor: "#6B4A32", fringe: 24, coat: { color: "#7A7391", buttons: "#F4F1EA", seam: "#544E69", len: 186 }, seed: 331, mini: true, face: "calm" };
// 생김새의 근거를 찾지 못한 인물: 그 시대 정장의 학자로만 그린다(옷 색으로만 구분)
const SLIPHER = { hair: "short", hairColor: "#5B463A", fringe: 24, coat: { color: "#5E6F5A", seam: "#3E4C3C" }, seed: 391, mini: true, face: "calm" };
const HUMASON = { hair: "short", hairColor: "#4E3B2E", fringe: 24, coat: { color: "#7A7F8A", seam: "#50545C" }, seed: 411, mini: true, face: "calm" };

const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

/* ---------- 소품 ---------- */

// 나선 은하(뿌연 타원 + 두 나선팔 + 밝은 가운데). q = 납작한 정도, rot = 기울기
function spiral(sk, x, y, r, o = {}) {
  const q = o.q ?? 1, col = o.color ?? NEB, sd = o.sd ?? 1;
  sk.at(x, y, 1, () => {
    sk.fill(ell(0, 0, r, r * q), col, { dx: 0, dy: 0, wob: 0.4, seed: sd, alpha: o.haze ?? 0.35 });
    for (const [ph, i] of [[0, 0], [Math.PI, 1]]) {
      const pts = [];
      for (let k = 0; k <= 40; k++) { const a = k / 40 * 4.2 + ph, rr = r * (0.12 + 0.84 * k / 40); pts.push([rr * Math.cos(a), rr * Math.sin(a) * q]); }
      sk.ink(pts, { w: Math.max(2.5, r * 0.13), color: col, seed: sd + 1 + i, wob: 0.3 });
    }
    sk.fill(ell(0, 0, r * 0.24, r * 0.24 * q), o.core ?? "#FFF6D8", { dx: 0, dy: 0, wob: 0.2, seed: sd + 5 });
  }, o.rot ?? 0);
}
// 밤하늘의 작은 별
function star(sk, x, y, r, sd) {
  const pts = [];
  for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * 0.32 : r; pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); }
  sk.fill(poly(pts, 3), "#FFF3C4", { dx: 0, dy: 0, wob: 0.3, seed: sd });
}
// 양쪽 화살표
function darrow(sk, a, b, o) {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  arrow(sk, [m, b], { ...o, straight: true }); arrow(sk, [m, a], { ...o, straight: true, seed: (o.seed ?? 1) + 9 });
}
// 허블의 파이프: 머리 중심(hx, hy)과 인물 축척 s. 입에서 옆으로 나온 굽은 갈색 막대
function pipe(sk, hx, hy, s, sgn = 1) {
  const p0 = [hx + sgn * s * 14, hy + s * 54], p1 = [hx + sgn * s * 124, hy + s * 70];
  sk.ink(curve([p0, [hx + sgn * s * 70, hy + s * 72], p1]), { w: Math.max(3.5, s * 8), color: "#6B4A32", seed: 501, wob: 0.2 });
  const bowl = poly([[p1[0] - s * 15, p1[1] - s * 34], [p1[0] + s * 15, p1[1] - s * 34], [p1[0] + s * 12, p1[1] + s * 8], [p1[0] - s * 12, p1[1] + s * 8]], 2);
  sk.fill(bowl, "#6B4A32", { dx: 0, dy: 0, wob: 0.2, seed: 503 }); sk.ink(bowl, { w: Math.max(2.5, s * 6), seed: 504, wob: 0.3 });
}
// 유리 건판(음화: 연한 회색 유리에 별이 검은 점). (x, y) = 왼쪽 위. 점은 고정된 무늬
function plate(sk, x, y, w, h, sd, o = {}) {
  const p = rrect(x, y, w, h, Math.min(8, w * 0.08));
  sk.fill(p, GLASSP, { dx: 0, dy: 0, wob: 0.4, seed: sd });
  const n = o.n ?? 22;
  for (let i = 0; i < n; i++) sk.dot(x + w * (0.08 + 0.84 * hash(sd + i * 3.7)), y + h * (0.1 + 0.8 * hash(sd + i * 9.1 + 5)), Math.max(1.6, w * (0.008 + 0.012 * hash(sd + i * 1.3))), "#2E2E33");
  sk.ink(p, { w: o.lw ?? 7, seed: sd + 1, wob: 0.5 });
}
// 무지개 띠(왼쪽 보라, 오른쪽 빨강)와 그 속의 검은 줄. lines = 줄의 x 자리
const RAINBOW = ["#7B4FD0", "#4A66E0", "#2FA9DC", "#3FAE5A", "#FFD84A", "#F58A2E", "#E0503A"];
function band(sk, x, y, w, h, lines, sd) {
  const n = 28;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1) * (RAINBOW.length - 1), k = Math.min(RAINBOW.length - 2, Math.floor(u));
    const x0 = x + w * i / n, x1 = x + w * (i + 1) / n + 1;
    sk.fill(poly([[x0, y], [x1, y], [x1, y + h], [x0, y + h]], 8), mix(RAINBOW[k], RAINBOW[k + 1], u - k), { dx: 0, dy: 0, wob: 0, seed: sd + i });
  }
  for (const [lx, i] of lines.map((v, i) => [v, i])) sk.ink(dense([[lx, y + 2], [lx, y + h - 2]]), { w: 9, seed: sd + 40 + i, wob: 0, cap: "butt" });
  sk.ink(rrect(x, y, w, h, 6), { w: 7, seed: sd + 50, wob: 0.6 });
}

/* ---------- 1. 1780년대: 저 성운은 어디에 있을까 ---------- */
// 윌리엄 허셜(1780년대 마흔 무렵): 분을 바른 머리와 귀 옆 말림 + 짙은 자주 외투. 작은 얼굴
const HERSCHEL = { hair: "short", hairColor: "#ECE8E0", fringe: 24, coat: { color: "#5A4660", buttons: "#C9B48A", seam: "#3B2E40", len: 46 }, seed: 331, mini: true, face: "curious" };
function wigRolls(sk, x, y, s, p, sd = 951) {
  sk.save(); sk.translate(x + s * p.head[0], y + s * p.head[1]); sk.scale(s, s); sk.rotate(p.tilt ?? 0);
  for (const sg of [-1, 1]) for (const [cy, rr, i] of [[-2, 23, 0], [38, 20, 1]]) {
    const c = circ(sg * (98 + i * 2), cy, rr, { over: 0.25, seed: sd + i + (sg > 0 ? 4 : 0), lump: 0.05 });
    sk.fill(c, "#ECE8E0", { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 10 + i }); sk.ink(c, { w: 9, wob: 0.8, seed: sd + 20 + i });
  }
  sk.restore();
}
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  // 위쪽 띠만 밤하늘: 별과 뿌연 얼룩(안드로메다 성운)
  sk.fill(poly([[-10, -10], [970, -10], [970, 262], [-10, 262]], 6), NIGHT, { dx: 0, dy: 0, wob: 0, seed: 11, tex: false });
  for (const [x, y, r, i] of [[470, 40, 6, 0], [560, 150, 5, 1], [640, 52, 7, 2], [930, 70, 5, 3], [890, 220, 4, 4], [720, 200, 5, 5], [500, 220, 4, 6]]) star(sk, x, y, r, 13 + i);
  const nx = 820, ny = 132;
  sk.fill(ell(nx, ny, 58, 22), "#C9D8EA", { dx: 0, dy: 0, wob: 0.4, seed: 21, alpha: 0.35 });
  sk.fill(ell(nx, ny, 34, 13), "#DCE6F2", { dx: 0, dy: 0, wob: 0.3, seed: 22, alpha: 0.55 });
  sk.fill(ell(nx, ny, 12, 5), "#FFF6D8", { dx: 0, dy: 0, wob: 0.2, seed: 23 });
  sk.ink(dense([[0, 262], [970, 262]]), { w: 6, color: "#8A9099", seed: 24, wob: 0.6 });
  ground(sk, 690, 25);
  // 반사 망원경: 비스듬한 통, 위 끝 옆의 접안부, 나무 받침
  const a0 = [322, 610], a1 = [640, 346], tw = 62;
  const ux = (a1[0] - a0[0]), uy = (a1[1] - a0[1]), L = Math.hypot(ux, uy), tx = ux / L, ty = uy / L, nxp = -ty, nyp = tx;
  thin(sk, 0.85, () => {
    for (const [fx2, i] of [[300, 0], [470, 1], [560, 2]]) sk.ink(dense([[480, 478], [fx2, 690]]), { w: 11, color: "#7A5A3A", seed: 31 + i, wob: 0.3 });
    const tube = poly([[a0[0] + nxp * tw / 2, a0[1] + nyp * tw / 2], [a1[0] + nxp * tw / 2, a1[1] + nyp * tw / 2], [a1[0] - nxp * tw / 2, a1[1] - nyp * tw / 2], [a0[0] - nxp * tw / 2, a0[1] - nyp * tw / 2]], 4);
    sk.fill(tube, "#C9A24A", { seed: 34, tex: true, texAng: Math.atan2(uy, ux) }); sk.ink(tube, { w: 10, seed: 35 });
    const mouth = ell(a1[0], a1[1], tw / 2, 12);
    sk.save(); sk.translate(a1[0], a1[1]); sk.rotate(Math.atan2(uy, ux) + Math.PI / 2); sk.translate(-a1[0], -a1[1]);
    sk.fill(mouth, "#3A3228", { dx: 0, dy: 0, wob: 0.2, seed: 36 }); sk.ink(mouth, { w: 7, seed: 37 });
    sk.restore();
    // 접안부: 통의 위 끝 가까이, 관측자가 선 오른쪽 옆구리에 붙어 있다
    const ep0 = [a1[0] - tx * 26 + nxp * tw / 2 - 4, a1[1] - ty * 26 + nyp * tw / 2 - 6], ep1 = [ep0[0] + 34, ep0[1] - 2];
    sk.ink(dense([ep0, ep1]), { w: 16, color: "#5B5F66", seed: 38, wob: 0.1, cap: "butt" });
  });
  // 통이 겨눈 곳: 성운
  sk.ink(dense([[a1[0] + tx * 30, a1[1] + ty * 30], [nx - 52, ny + 40]]), { w: 4, color: "#C9D8EA", dash: [10, 10], seed: 39, wob: 0 });
  // 허셜의 생각 구름: 우리은하(점선 타원 속 별 무리)와 그 밖의 뿌연 성운. 안쪽일까(청록) 아주 먼 밖일까(주황)
  cloud(sk, 236, 300, 400, 250, { seed: 41, tail: [[500, 300, 14, 0], [572, 318, 10, 1]] });
  const gx = 196, gy = 330, rx = 112, ry = 36;
  sk.ink(ell(gx, gy, rx, ry), { w: 4, color: "#C9B36A", dash: [10, 9], seed: 45, wob: 0.6 });
  for (let i = 0; i < 40; i++) { const a = hash(i * 3.3 + 1) * TAU, rr = Math.sqrt(hash(i * 7.1 + 2)) * 0.9; sk.dot(gx + rx * rr * Math.cos(a), gy + ry * rr * Math.sin(a), 2.2 + 1.4 * hash(i * 1.7), "#E0B33A"); }
  sk.fill(ell(gx, gy, 18, 10), "#F2C94C", { dx: 0, dy: 0, wob: 0.3, seed: 47 });
  const sx = 352, sy = 258;
  sk.fill(ell(sx, sy, 30, 12), "#9FB4CC", { dx: 0, dy: 0, wob: 0.3, seed: 48, alpha: 0.55 });
  sk.fill(ell(sx, sy, 10, 4), "#5C6F92", { dx: 0, dy: 0, wob: 0.2, seed: 49 });
  qmark(sk, sx, sy - 44, 0.34, { seed: 51 });
  arrow(sk, [[sx - 26, sy + 14], [sx - 70, sy + 50], [gx + 60, gy - 6]], { w: 6, color: NEAR, seed: 53, head: 14, wob: 0.4 });
  arrow(sk, [[sx + 30, sy - 4], [sx + 86, sy - 34]], { w: 6, color: FAR, seed: 55, head: 14, straight: true, wob: 0.3 });
  // 허셜: 위 끝의 접안부에 눈을 대고 하늘을 본다(낮은 나무 단 위)
  thin(sk, 0.85, () => { const step = rrect(650, 646, 150, 44, 6); sk.fill(step, C.wood, { seed: 61, tex: true, texAng: 0.02 }); sk.ink(step, { w: 9, seed: 62 }); });
  const P = pose({ elL: [-70, -318], haL: [-118, -372], elR: [50, -262], haR: [24, -218], tilt: -0.16 });
  const hx = 712, hy = 646, hs = 0.6;
  drawFigure(sk, hx, hy, hs, P, { ...HERSCHEL, name: "herschel", look: -0.7 });
  wigRolls(sk, hx, hy, hs, P);
  return sk;
}

/* ---------- 2. 1912년: 밝을수록 느리게 깜빡이는 별 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 704, 31);
  // 찾은 규칙(오른쪽 위 종이): 큰 별 = 느린 물결, 작은 별 = 빠른 물결
  const card = rrect(590, 40, 345, 250, 16);
  sk.fill(card, "#FBF8EE", { dx: 0, dy: 0, wob: 0.5, seed: 33 }); sk.ink(card, { w: 5, color: C.gray, seed: 34, wob: 0.8 });
  sparkle(sk, 652, 108, 38, { seed: 35 });
  sparkle(sk, 652, 228, 19, { seed: 37 });
  const wave = (y, amp, per, sd) => { const pts = []; for (let x = 712; x <= 912; x += 2) pts.push([x, y - amp * Math.sin((x - 712) / per * TAU)]); sk.ink(pts, { w: 6, color: "#4A66E0", seed: sd, wob: 0.3 }); };
  wave(108, 34, 134, 39); wave(228, 14, 40, 41);
  // 책상과 아래에서 빛을 받는 비스듬한 유리판 받침, 그 위의 건판
  sk.glow(628, 450, 190, C.lemon, 0.5);
  thin(sk, 0.85, () => desk(sk, 440, 530, 470, { seed: 43 }));
  thin(sk, 0.85, () => {
    const sup = poly([[735, 528], [772, 372], [800, 528]], 4); sk.fill(sup, C.wood, { seed: 45, tex: true }); sk.ink(sup, { w: 8, seed: 46 });
    const pane = poly([[482, 528], [735, 528], [772, 372], [519, 372]], 4);
    sk.fill(pane, "#FFF6C9", { dx: 0, dy: 0, wob: 0.4, seed: 47 }); sk.ink(pane, { w: 11, color: C.woodDark, seed: 48, wob: 0.8 }); sk.ink(pane, { w: 3, seed: 49, wob: 0.8 });
    const pl = [[548, 506], [694, 506], [720, 396], [574, 396]];
    sk.fill(poly(pl, 4), GLASSP, { dx: 0, dy: 0, wob: 0.3, seed: 51 });
    for (let i = 0; i < 20; i++) { const u = 0.08 + 0.84 * hash(i * 3.7 + 9), v = 0.1 + 0.8 * hash(i * 9.1 + 4); sk.dot(548 + 146 * u + 26 * v, 506 - 110 * v, 2 + 2.2 * hash(i * 1.3), "#2E2E33"); }
    sk.ink(poly(pl, 4), { w: 6, seed: 52, wob: 0.5 });
  });
  // 리비트: 돋보기로 건판의 별을 견준다
  const fx = 330, fs = 0.66, hx = fx, hy = 704 - fs * 436;
  const bun = circ(hx - fs * 64, hy - fs * 84, fs * 42, { over: 0.2, seed: 53, lump: 0.05 });
  sk.fill(bun, LEAVITT.hairColor, { dx: 1, dy: 1.2, wob: 0.8, seed: 54, tex: true }); sk.ink(bun, { w: 7, seed: 55, wob: 0.8 });
  const P = pose({ elR: [92, -296], haR: [152, -372], elL: [-50, -262], haL: [-40, -206] });
  drawFigure(sk, fx, 704, fs, P, { ...LEAVITT, name: "leavitt", face: "smile", hands: "L" });
  const hd = [fx + fs * 152, 704 - fs * 372];
  sk.ink(dense([hd, [hd[0] + 44, hd[1] - 22]]), { w: 16, color: "#8A5A33", seed: 57, wob: 0.3 });
  const lens = circ(hd[0] + 78, hd[1] - 40, 36, { over: 0.1, seed: 58 });
  sk.fill(lens, "#DCEFFA", { dx: 0, dy: 0, wob: 0.3, seed: 59, alpha: 0.7 }); sk.ink(lens, { w: 13, color: "#B8892E", seed: 60, wob: 0.5 });
  sk.dot(hd[0] + 72, hd[1] - 36, 4.5, "#2E2E33"); sk.dot(hd[0] + 92, hd[1] - 50, 3, "#2E2E33");
  handDot(sk, hd, C.skin, 61, 10);
  return sk;
}

/* ---------- 3. 1923년: 세계에서 가장 큰 망원경 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  // 돔: 벽의 뼈대(옅은 선)와 열린 틈 너머의 밤하늘(위쪽 창)
  for (const [pts, i] of [[[[560, -12], [370, 64], [180, 250], [66, 480], [44, 704]], 0], [[[900, -12], [936, 200], [946, 704]], 1], [[[600, 124], [430, 200], [270, 390], [200, 704]], 2]]) sk.ink(curve(pts), { w: 5, color: "#C4C9CF", seed: 71 + i, wob: 1 });
  const slit = poly([[560, -12], [900, -12], [866, 124], [600, 124]], 4);
  sk.fill(slit, NIGHT, { dx: 0, dy: 0, wob: 0, seed: 75 });
  for (const [x, y, r, i] of [[612, 40, 6, 0], [668, 88, 5, 1], [820, 36, 6, 2], [846, 92, 5, 3], [700, 22, 4, 4]]) star(sk, x, y, r, 77 + i);
  spiral(sk, 756, 66, 30, { q: 0.5, rot: -0.5, sd: 83, haze: 0.5 });
  sk.ink(dense([[560, -12], [600, 124], [866, 124], [900, -12]], 5), { w: 6, color: "#8A9099", seed: 85, wob: 0.6 });
  ground(sk, 704, 87);
  const cx = 545, cy = 400;
  thin(sk, 0.5, () => {
    // 두 받침 기둥과 그 사이에 비스듬히 걸친 멍에(긴 네모 틀)
    for (const [x, y, i] of [[285, 550, 0], [805, 250, 1]]) { const pr = poly([[x - 38, y], [x + 38, y], [x + 56, 704], [x - 56, 704]], 5); sk.fill(pr, "#E4E1D8", { seed: 89 + i, tex: true, texAng: 1.5 }); sk.ink(pr, { w: 10, seed: 91 + i }); }
    sk.at(cx, cy, 1, () => {
      const fr = rrect(-310, -84, 620, 168, 22);
      sk.ink(fr, { w: 30, color: "#9AA3AD", seed: 93, wob: 0.6 }); sk.ink(fr, { w: 20, color: "#DDE3E9", seed: 93, wob: 0.6 });
    }, -0.5236);
    // 격자 뼈대의 원통: 아래 끝은 거울이 든 통, 위는 뼈대만
    sk.at(cx, cy, 1, () => {
      const cell = poly([[-270, -62], [-170, -62], [-170, 62], [-270, 62]], 5);
      sk.fill(cell, "#5F6E82", { seed: 95, tex: true }); sk.ink(cell, { w: 17, seed: 96 });
      const xs = [-170, -52, 66, 184, 302];
      sk.fill(poly([[-170, -60], [302, -60], [302, 60], [-170, 60]], 6), "#F3F5F7", { dx: 0, dy: 0, wob: 0.3, seed: 94 });
      for (let i = 0; i < xs.length - 1; i++) { sk.ink(dense([[xs[i], -58], [xs[i + 1], 58]]), { w: 7, color: "#4A5568", seed: 97 + i, wob: 0.4 }); sk.ink(dense([[xs[i], 58], [xs[i + 1], -58]]), { w: 7, color: "#4A5568", seed: 103 + i, wob: 0.4 }); }
      for (const sg of [-1, 1]) sk.ink(dense([[-170, sg * 60], [302, sg * 60]]), { w: 17, seed: 109 + sg, wob: 0.6 });
      xs.forEach((x, i) => sk.ink(dense([[x, -60], [x, 60]]), { w: i === xs.length - 1 ? 18 : 12, seed: 113 + i, wob: 0.4 }));
    }, -0.924);
  });
  // 허블: 유리 건판을 들고 망원경을 올려다본다(망원경이 사람보다 훨씬 크다)
  const fx = 104, fs = 0.46, P = pose({ elR: [92, -300], haR: [150, -350], elL: [-50, -262], haL: [-40, -206] });
  drawFigure(sk, fx, 704, fs, P, { ...HUBBLE, name: "hubble", hands: "L" });
  pipe(sk, fx, 704 - fs * 436, fs, -1);
  const hd = [fx + fs * 150, 704 - fs * 350];
  plate(sk, hd[0] - 6, hd[1] - 50, 58, 46, 123, { n: 9, lw: 5 });
  handDot(sk, hd, C.skin, 125, 7);
  return sk;
}

/* ---------- 4. 1923년: 새 별이 아니었어 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  ground(sk, 704, 131);
  sk.glow(560, 400, 210, C.lemon, 0.55);
  thin(sk, 0.85, () => desk(sk, 540, 540, 390, { seed: 133 }));
  // 책상 등불
  thin(sk, 0.85, () => {
    const base = ell(628, 536, 44, 10); sk.fill(base, "#5A5F68", { dx: 0, dy: 0, wob: 0.3, seed: 135 }); sk.ink(base, { w: 8, seed: 136 });
    sk.ink(curve([[628, 530], [632, 450], [612, 404]]), { w: 9, seed: 137, wob: 0.5 });
    const shade = poly([[560, 398], [628, 352], [662, 398], [600, 440]], 4); sk.fill(shade, "#3E7A5E", { seed: 139, tex: true }); sk.ink(shade, { w: 9, seed: 140 });
    const bulb = circ(578, 424, 15, { seed: 141 }); sk.fill(bulb, C.lemon, { dx: 0, dy: 0, wob: 0.3, seed: 142 }); sk.ink(bulb, { w: 5, seed: 143 });
  });
  // 예전에 찍어 둔 건판 더미와 펼친 공책
  thin(sk, 0.85, () => {
    for (let i = 0; i < 5; i++) { const p = rrect(716 + (i % 2) * 8 - 4, 526 - i * 13, 108, 12, 3); sk.fill(p, GLASSP, { dx: 0, dy: 0, wob: 0.3, seed: 145 + i }); sk.ink(p, { w: 5, seed: 151 + i, wob: 0.4 }); }
    openBook(sk, 880, 540, 0.55, { color: "#7A5A45", seed: 157 });
  });
  // 허블: 건판을 등불에 비춰 본다
  const fx = 220, fs = 0.7, P = pose({ elR: [110, -300], haR: [196, -372], elL: [-50, -262], haL: [-40, -206] });
  drawFigure(sk, fx, 704, fs, P, { ...HUBBLE, name: "hubble", face: "wide", hands: "L" });
  pipe(sk, fx, 704 - fs * 436, fs, -1);
  const hd = [fx + fs * 196, 704 - fs * 372];
  plate(sk, hd[0] + 6, hd[1] - 156, 204, 160, 161, { n: 26 });
  // 밝기가 변하는 별: 빨간 동그라미. 그 옆은 줄을 그어 지운 처음의 표시
  const sx = hd[0] + 160, sy = hd[1] - 112;
  sk.fill(circ(sx, sy, 22, { over: 0, seed: 162 }), GLASSP, { dx: 0, dy: 0, wob: 0, seed: 162 });
  sk.dot(sx, sy, 6, "#2E2E33");
  sk.ink(circ(sx, sy, 19, { seed: 163, over: 0.3 }), { w: 5, color: C.red, seed: 164, wob: 0.6 });
  sk.fill(circ(sx - 52, sy - 6, 17, { over: 0, seed: 168 }), GLASSP, { dx: 0, dy: 0, wob: 0, seed: 168 });
  for (const sg of [-1, 1]) sk.ink(dense([[sx - 60, sy - 6 - sg * 8], [sx - 44, sy - 6 + sg * 8]]), { w: 4, color: "#7A808A", seed: 165 + sg, wob: 0.2 });
  sk.ink(dense([[sx - 70, sy - 6], [sx - 34, sy - 6]]), { w: 4.5, color: C.red, seed: 166, wob: 0.3 });
  emark(sk, 640, 262, 0.85, { seed: 167 });
  handDot(sk, hd, C.skin, 169, 10);
  return sk;
}

/* ---------- 5. 1924년: 우리은하 밖의 은하 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  const sky = poly([[-12, -12], [972, -12], [972, 372], [-12, 372]], 6);
  sk.fill(sky, NIGHT, { dx: 0, dy: 0, wob: 0, seed: 171 });
  for (const [x, y, r, i] of [[420, 60, 6, 0], [520, 250, 5, 1], [760, 300, 6, 2], [660, 70, 5, 3], [900, 280, 5, 4], [60, 330, 5, 5], [380, 320, 4, 6]]) star(sk, x, y, r, 173 + i);
  // 위에서 본 우리은하(연노랑)와 그 크기(청록), 오른쪽 끝의 안드로메다와 거기까지의 거리(주황)
  spiral(sk, 190, 218, 100, { color: MW, sd: 181, haze: 0.3, core: "#FFF6D8" });
  darrow(sk, [92, 346], [288, 346], { w: 7, color: NEAR, seed: 183, head: 16, wob: 0.3 });
  spiral(sk, 892, 150, 40, { q: 0.48, rot: -0.5, sd: 187, haze: 0.5 });
  darrow(sk, [296, 150], [836, 150], { w: 8, color: FAR, seed: 189, head: 20, wob: 0.4 });
  sk.ink(curve([[-12, 372], [300, 368], [640, 374], [972, 370]]), { w: 6, color: "#3A4468", seed: 193, wob: 0.8 });
  ground(sk, 704, 195);
  // 멀리 보이는 천문대의 둥근 지붕
  thin(sk, 0.8, () => {
    const wall = poly([[690, 704], [690, 610], [890, 610], [890, 704]], 5); sk.fill(wall, "#EFEDE6", { dx: 0, dy: 0, wob: 0.4, seed: 196 });
    const dm = [...ell(790, 610, 100, 96, Math.PI, TAU), [690, 610]]; sk.fill(dm, "#DCE6F0", { dx: 0, dy: 0, wob: 0.4, seed: 197 });
    const sl = poly([[802, 516], [836, 528], [836, 610], [802, 610]], 4); sk.fill(sl, NIGHT, { dx: 0, dy: 0, wob: 0.2, seed: 198 });
    sk.ink(dm, { w: 9, seed: 199 }); sk.ink(dense([[690, 610], [690, 704]]), { w: 9, seed: 200 }); sk.ink(dense([[890, 610], [890, 704]]), { w: 9, seed: 202 }); sk.ink(sl, { w: 5, seed: 206, wob: 0.3 });
  });
  const fx = 500, fs = 0.58, P = pose({ elL: [-90, -330], haL: [-164, -404], elR: [50, -262], haR: [40, -206] });
  drawFigure(sk, fx, 704, fs, P, { ...HUBBLE, name: "hubble", face: "happy" });
  pipe(sk, fx, 704 - fs * 436, fs, 1);
  return sk;
}

/* ---------- 6. 1912~1917년: 빛의 줄이 붉은 쪽으로 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 704, 201);
  // 굴절 망원경과 그 끝에 단 네모 상자(빛을 무지개 띠로 펼치는 장치)
  thin(sk, 0.8, () => {
    const pier = poly([[352, 536], [414, 536], [430, 704], [336, 704]], 5); sk.fill(pier, "#D8D6CF", { seed: 203, tex: true, texAng: 1.5 }); sk.ink(pier, { w: 9, seed: 204 });
    sk.ink(dense([[384, 528], [432, 590]]), { w: 9, seed: 214, wob: 0.3 });
    const wt = circ(440, 600, 19, { seed: 215 }); sk.fill(wt, "#8A9099", { dx: 0, dy: 0, wob: 0.3, seed: 216 }); sk.ink(wt, { w: 8, seed: 217 });
    const a = [262, 580], b = [500, 470];
    sk.ink(dense([a, b]), { w: 58, seed: 205, wob: 0.5, cap: "butt" }); sk.ink(dense([a, b]), { w: 42, color: "#C9A24A", seed: 205, wob: 0.5, cap: "butt" });
    sk.ink(dense([[480, 479], [510, 465]]), { w: 72, seed: 206, wob: 0.3, cap: "butt" }); sk.ink(dense([[482, 478], [508, 466]]), { w: 56, color: "#8A6A2E", seed: 206, wob: 0.3, cap: "butt" });
    const hub = circ(382, 526, 24, { seed: 208 }); sk.fill(hub, "#8A9099", { dx: 0, dy: 0, wob: 0.3, seed: 209 }); sk.ink(hub, { w: 8, seed: 210 });
    // 접안부에 단 네모 상자
    sk.at(226, 597, 1, () => { const bx = rrect(-52, -42, 104, 84, 10); sk.fill(bx, "#6B7280", { seed: 211, tex: true }); sk.ink(bx, { w: 10, seed: 212 }); const win = rrect(-30, -12, 60, 24, 6); sk.fill(win, "#C9D2DB", { dx: 0, dy: 0, wob: 0.3, seed: 213 }); sk.ink(win, { w: 5, seed: 218, wob: 0.3 }); }, -0.43);
  });
  // 위 띠: 실험실의 멈춰 있는 빛(작은 등불). 아래 띠: 성운의 빛. 검은 줄이 붉은색(오른쪽) 쪽으로 밀려 있다
  const bx = 505, bw = 410, shift = 40, fr = [0.2, 0.44, 0.62], y0 = 96, y1 = 232, bh = 62;
  const l0 = fr.map(f => bx + bw * f), l1 = l0.map(x => x + shift);
  band(sk, bx, y0, bw, bh, l0, 221);
  band(sk, bx, y1, bw, bh, l1, 281);
  l0.forEach((x, i) => {
    sk.ink(dense([[x, y0 + bh + 6], [x, y1 - 6]]), { w: 4, color: C.gray, dash: [7, 7], seed: 341 + i, wob: 0 });
    arrow(sk, [[x + 4, (y0 + bh + y1) / 2], [x + shift, (y0 + bh + y1) / 2]], { w: 5, color: FAR, seed: 345 + i, straight: true, head: 11, wob: 0.2 });
  });
  // 작은 등불(실험실의 빛)
  sk.at(456, y0 + bh - 2, 1, () => {
    const base = poly([[-20, 0], [20, 0], [14, -22], [-14, -22]], 3); sk.fill(base, "#C9A24A", { dx: 0, dy: 0, wob: 0.3, seed: 331 }); sk.ink(base, { w: 6, seed: 332 });
    const fl = curve([[0, -24], [-13, -40], [0, -72], [13, -40]], true, 3); sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: 333 }); sk.ink(fl, { w: 4.5, color: C.red, seed: 334, wob: 0.3 });
    const core = curve([[0, -28], [-6, -38], [0, -52], [6, -38]], true, 3); sk.fill(core, C.yellow, { dx: 0, dy: 0, wob: 0.2, seed: 335 });
  });
  spiral(sk, 456, y1 + bh / 2, 24, { q: 0.55, rot: -0.4, sd: 351, haze: 0.5, color: "#8FA6C4" });
  // 멀어지는 나선 성운
  spiral(sk, 668, 392, 46, { q: 0.55, rot: -0.4, sd: 355, haze: 0.45, color: "#8FA6C4" });
  arrow(sk, [[738, 364], [838, 318]], { w: 9, color: FAR, seed: 359, straight: true, head: 22, wob: 0.3 });
  for (const [d, i] of [[-22, 0], [22, 1]]) sk.ink(dense([[604 + d * 0.42, 422 + d * 0.91], [572 + d * 0.42, 437 + d * 0.91]]), { w: 5, color: C.gray, seed: 361 + i, wob: 0.3 });
  const P = pose({ elR: [90, -322], haR: [166, -372], elL: [-50, -262], haL: [-40, -206], tilt: 0.05 });
  drawFigure(sk, 104, 704, 0.62, P, { ...SLIPHER, name: "slipher", face: "curious" });
  return sk;
}

/* ---------- 7. 1929년: 멀수록 더 빨리 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  ground(sk, 704, 371);
  thin(sk, 0.85, () => board(sk, 360, 100, 440, 370, { legs: 234, seed: 373 }));
  // 그래프: 가로 = 거리, 세로 = 멀어지는 빠르기(글자와 숫자 없음). 점은 흩어져 있고 선 하나가 그 사이를 지난다
  const ox = 420, oy = 412, gw = 310, gh = 236;
  arrow(sk, [[ox, oy], [ox + gw + 26, oy]], { w: 5, color: C.white, seed: 375, straight: true, head: 13, wob: 0.4 });
  arrow(sk, [[ox, oy], [ox, oy - gh - 22]], { w: 5, color: C.white, seed: 377, straight: true, head: 13, wob: 0.4 });
  sk.ink(dense([[ox, oy], [ox + gw, oy - gh * 0.84]]), { w: 6, color: FAR, seed: 379, wob: 0.5 });
  for (let i = 0; i < 24; i++) {
    const u = 0.04 + 0.94 * hash(i * 3.1 + 7), v = Math.max(0.02, Math.min(0.98, u * 0.84 + (hash(i * 7.7 + 3) - 0.5) * 0.4));
    sk.dot(ox + gw * u, oy - gh * v, 6, MW);
  }
  const fx = 180, fs = 0.7, P = pose({ elR: [100, -322], haR: [182, -388], elL: [-50, -262], haL: [-40, -206] });
  drawFigure(sk, fx, 704, fs, P, { ...HUBBLE, name: "hubble", face: "smile" });
  pipe(sk, fx, 704 - fs * 436, fs, -1);
  // 휴메이슨: 새로 찍은 건판을 들고 있다
  const hx = 884, hs = 0.6, HP = pose({ elL: [-70, -280], haL: [-96, -340], elR: [50, -262], haR: [40, -206] });
  drawFigure(sk, hx, 704, hs, HP, { ...HUMASON, name: "humason", face: "smile", hands: "R" });
  const hd = [hx - hs * 96, 704 - hs * 340];
  plate(sk, hd[0] - 62, hd[1] - 52, 70, 56, 383, { n: 10, lw: 5 });
  handDot(sk, hd, C.skin, 385, 9);
  return sk;
}

/* ---------- 8. 오늘: 그럼 우리가 한가운데? ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  const sky = poly([[-12, -12], [972, -12], [972, 200], [-12, 200]], 6);
  sk.fill(sky, NIGHT, { dx: 0, dy: 0, wob: 0, seed: 391 });
  // 가운데가 우리은하. 둘레의 은하는 바깥으로, 먼 것일수록 긴 화살표
  const cx = 480, cy = 96;
  spiral(sk, cx, cy, 30, { color: MW, sd: 393, haze: 0.35, q: 0.8 });
  const gal = [[396, 50, 14, 28], [572, 54, 14, 28], [410, 144, 13, 28], [560, 140, 14, 28], [292, 112, 15, 56], [672, 92, 15, 56], [138, 52, 16, 86], [836, 50, 16, 82], [150, 150, 15, 86], [822, 148, 15, 84]];
  gal.forEach(([x, y, r, len], i) => {
    spiral(sk, x, y, r, { q: 0.6, rot: hash(i * 5.1) * 2 - 1, sd: 401 + i * 7, haze: 0.5 });
    const d = Math.hypot(x - cx, y - cy), ux = (x - cx) / d, uy = (y - cy) / d;
    arrow(sk, [[x + ux * (r + 8), y + uy * (r + 8)], [x + ux * (r + 8 + len), y + uy * (r + 8 + len)]], { w: 5, color: FAR, seed: 471 + i, straight: true, head: 12, wob: 0.2 });
  });
  for (const [x, y, r, i] of [[60, 24, 5, 0], [250, 30, 4, 1], [700, 24, 5, 2], [920, 104, 4, 3], [480, 178, 4, 4], [40, 110, 4, 5]]) star(sk, x, y, r, 491 + i);
  ground(sk, 704, 497);
  // 학생: 하늘을 가리킨다. 쌤: 붙임딱지를 붙인 풍선
  const sp = pose({ elL: [-92, -336], haL: [-158, -452], elR: [50, -262], haR: [40, -206], tilt: -0.05 });
  drawFigure(sk, 300, 704, 0.5, sp, { ...STUDENT, name: "student", mirror: true });
  const tx = 660, ts = 0.52, tp = pose({ elR: [92, -296], haR: [150, -336], elL: [-50, -262], haL: [-40, -206], tilt: 0.04 });
  drawFigure(sk, tx, 704, ts, tp, { ...TEACHER, name: "teacher", hands: "L" });
  const hd = [tx + ts * 150, 704 - ts * 336];
  thin(sk, 0.85, () => {
    const bl = curve([[hd[0] + 10, hd[1] - 12], [hd[0] - 28, hd[1] - 70], [hd[0] + 4, hd[1] - 150], [hd[0] + 84, hd[1] - 150], [hd[0] + 112, hd[1] - 78], [hd[0] + 60, hd[1] - 24]], true, 4);
    sk.fill(bl, "#8FCDF2", { dx: 1, dy: 1.2, wob: 0.6, seed: 501 }); sk.ink(bl, { w: 9, seed: 502 });
    sk.ink(curve([[hd[0] + 4, hd[1] - 118], [hd[0] + 16, hd[1] - 134], [hd[0] + 34, hd[1] - 138]]), { w: 5, color: C.white, seed: 503, wob: 0.2 });
    for (const [dx, dy, col, i] of [[20, -62, C.red, 0], [62, -112, C.lemon, 1], [78, -60, C.green, 2], [34, -106, C.orange, 3]]) { const st = circ(hd[0] + dx, hd[1] + dy, 10, { seed: 505 + i }); sk.fill(st, col, { dx: 0, dy: 0, wob: 0.3, seed: 509 + i }); sk.ink(st, { w: 4, seed: 513 + i, wob: 0.3 }); }
    const kn = poly([[hd[0] + 6, hd[1] - 14], [hd[0] + 20, hd[1] - 2], [hd[0] + 2, hd[1] + 2]], 3); sk.fill(kn, "#8FCDF2", { dx: 0, dy: 0, wob: 0.3, seed: 517 }); sk.ink(kn, { w: 5, seed: 518 });
  });
  handDot(sk, hd, C.skin, 519, 10);
  return sk;
}

export const META = {
  title: "우주가 커지고<br><em>있다고?</em>",
  lead: "18세기 밤하늘의 뿌연 얼룩에서 1929년 허블의 그래프까지, 인류가 알던 우주가 넓어진 이야기를 따라가 봐요.",
  narrator: "밤하늘의 뿌연 <b>안드로메다 성운</b>은 우리은하 안에 있을까, 밖에 있을까? 오래된 이 물음의 답이 <b>우주의 크기</b>에 대한 생각을 완전히 바꾸어 놓았답니다.",
  cta: "풍선 우주 열기",
};

const CUTS = [
  {
    fn: p1, when: "1780년대, 영국", stage: "궁금증", title: "저 성운은 어디에 있을까",
    caption: "18세기 프랑스의 메시에는 혜성과 헷갈리지 않으려고 밤하늘의 뿌연 얼룩, 곧 <b>성운</b>들을 목록으로 남겼어요. 영국의 <b>허셜</b>은 더 큰 망원경으로 성운과 별 무리를 2,500개나 찾아냈지요. 하지만 안드로메다 성운 같은 성운이 우리은하 안의 구름인지, 우리은하 밖의 또 다른 별 무리인지는 거리를 잴 방법이 없어 오랫동안 풀리지 않았어요.",
  },
  {
    fn: p2, when: "1912년, 하버드 천문대", stage: "거리의 자", title: "밝을수록 느리게 깜빡이는 별",
    caption: "미국 하버드 대학 천문대의 <b>헨리에타 리비트</b>는 별을 찍은 사진 건판들을 꼼꼼히 <b>비교했어요</b>. 그 결과 밝기가 주기적으로 변하는 변광성은 실제로 밝은 별일수록 천천히 깜빡인다는 규칙을 찾아냈지요. 깜빡이는 주기로 별의 진짜 밝기를 알아내어 눈에 보이는 밝기와 <b>비교하면</b> 별까지의 <b>거리</b>를 구할 수 있어요.",
    bubbles: [{ who: "leavitt", text: "밝은 별일수록<br>천천히 깜빡여요" }],
  },
  {
    fn: p3, when: "1923년, 윌슨산 천문대", stage: "관측", title: "세계에서 가장 큰 망원경",
    caption: "1923년 10월, <b>에드윈 허블</b>은 미국 윌슨산 천문대의 후커 망원경으로 안드로메다 성운을 찍었어요. 거울 지름이 약 2.5 m로, 그때 세계에서 가장 큰 망원경이었어요. 손바닥만 한 유리 건판에 45분 동안 빛을 모아 희미한 별까지 담았지요.",
  },
  {
    fn: p4, when: "1923년, 윌슨산 천문대", stage: "발견", title: "새 별이 아니었어",
    caption: "허블은 안드로메다 성운을 찍은 사진 건판에서 밝은 점을 찾아 처음에는 새로 폭발한 별이라고 표시했어요. 하지만 예전에 찍어 둔 건판들과 <b>비교해 보니</b> 약 31일마다 밝아졌다 어두워지기를 되풀이하는 별이었어요. 허블은 표시를 지우고 거리를 잴 수 있는 열쇠인 <b>'변광성!'</b>이라고 기쁘게 고쳐 적었지요.",
    bubbles: [{ who: "hubble", text: "밝기가<br>변하는 별이야!" }],
  },
  {
    fn: p5, when: "1924년, 미국", stage: "놀라운 결과", title: "우리은하 밖의 은하",
    caption: "1924년, 허블은 밝기가 변하는 별로 안드로메다 성운까지의 거리를 약 90만 광년으로 계산했어요. 우리은하의 크기보다 훨씬 먼 거리라서, 이 성운은 우리은하 밖에 있는 또 하나의 <b>은하</b>였어요. 오늘날 다시 잰 거리는 약 250만 광년이에요.",
    term: { name: "외부 은하", def: "우리은하 밖에 있는 은하로, 우리은하처럼 수많은 별로 이루어져 있어요." },
    bubbles: [{ who: "hubble", text: "우리은하 크기보다<br>훨씬 멀어!" }],
  },
  {
    fn: p6, when: "1912~1917년, 로웰 천문대", stage: "또 하나의 단서", title: "빛의 줄이 붉은 쪽으로",
    caption: "미국 로웰 천문대의 <b>베스토 슬라이퍼</b>는 여러 은하에서 오는 빛을 스펙트럼 띠로 펼쳐 실험실의 빛과 <b>비교해 보았어요</b>. 놀랍게도 대부분의 은하에서 스펙트럼의 검은 흡수선이 <b>붉은색 쪽으로</b> 밀려 있었어요. 이는 은하들이 우리에게서 빠르게 <b>멀어지고 있다</b>는 뜻이었지요.",
  },
  {
    fn: p7, when: "1929년, 윌슨산 천문대", stage: "법칙", title: "멀수록 더 빨리",
    caption: "1929년, 허블은 여러 은하까지의 거리와 멀어지는 속도를 그래프에 나타내 보았어요. 그러자 <b>멀리 있는 은하일수록 더 빠른 속도로</b> 멀어진다는 뚜렷한 규칙이 나타났어요. 이는 앞서 벨기에의 과학자 르메트르가 계산했던 <b>팽창하는 우주</b>의 모습과 정확히 들어맞는 결과였지요.",
    term: { name: "우주 팽창", def: "우주 공간이 늘어나 은하 사이 거리가 점점 멀어지는 현상이에요." },
    bubbles: [{ who: "hubble", text: "멀수록<br>빨리 멀어져" }],
  },
  {
    fn: p8, stage: "다음 물음", title: "그럼 우리가 한가운데?",
    caption: "대부분의 은하가 우리에게서 멀어지고 먼 은하일수록 더 빨리 멀어진다면, 우리은하가 우주의 중심이라는 뜻일까요? 아니면 우주 공간 자체가 모든 방향으로 고르게 늘어나고 있는 걸까요? 이제 붙임딱지를 붙인 풍선 실험으로 우주가 팽창하는 모습을 직접 확인해 봐요!",
    bubbles: [{ who: "student", text: "우리가 우주의<br>한가운데예요?" }, { who: "teacher", text: "풍선으로<br>알아봐요" }],
  },
];

export function panels() {
  return CUTS.map(c => ({ sk: c.fn(), bubbles: c.bubbles, when: c.when, whenPos: c.whenPos, stage: c.stage, title: c.title, caption: c.caption, term: c.term }));
}
