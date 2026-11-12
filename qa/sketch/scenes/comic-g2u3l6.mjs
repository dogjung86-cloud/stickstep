// 중2 과학 g2u3l6 만화 v2(배선 전 미리보기): 흰빛을 나누고, 세 빛으로 다시 짓다(빛의 합성). 8컷.
// 조사와 콘티: qa/sketch/research/g2u3l6.md
//   1 벽에 펼쳐진 색 띠(둥글 줄 알았는데 길쭉하다) → 2 결정적 실험(한 색만 골라 둘째 프리즘으로) → 3 렌즈로 모으니 다시 흰빛(백색광)
//   → 4 물체의 색은 되돌려 보낸 빛 → 5 1704년 『광학』: 몇 가지 빛이면 될까 → 6 1861년: 세 번 찍은 리본
//   → 7 세 빛을 한곳에(빛의 합성) → 8 오늘: 세 빛으로 짓는 색(빛의 삼원색)
// 빛의 길: 프리즘은 꼭지를 아래로 두어 빛이 위(밑면 쪽)로 꺾인다. 빨강이 가장 적게, 보라가 가장 많이 꺾인다.
// 암실은 위쪽 띠만 어둡게 칠하고 인물은 밝은 바닥에 둔다. 랩의 답(둘씩 겹친 색 이름, 색 조명 아래 물체의 색)은 그리지 않는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, qmark, arrow } from "../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, TEACHER, STUDENT } from "../lib/figure.mjs";
import { quill, phone } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
// 뉴턴: 중력 만화(u5l3)와 같은 사람(밝은 곱슬 긴 머리 + 자줏빛 외투). 나이 든 뉴턴은 머리만 희게
const NEWTON = { hair: "curls", hairColor: "#C4AC80", coat: { color: "#7E3B45", buttons: C.gold, seam: "#55242C" }, seed: 191, mini: true, face: "calm" };
const NEWTON_OLD = { ...NEWTON, hairColor: "#D8D2C4" };
// 맥스웰: 짧고 짙은 머리 + 짙은 턱수염 + 짙은 웃옷. 서턴: 사진기의 검은 천을 뒤집어쓴 사진사(얼굴이 보이지 않는다)
const MAXWELL = { hair: "short", hairColor: "#3A2E28", fringe: 24, coat: { color: "#4A5568", buttons: C.gold, seam: "#2D3748" }, seed: 311, mini: true, face: "calm" };
const SUTTON = { hair: "short", hairColor: "#6B4A32", coat: { color: "#8A6A4A", seam: "#5E4630", len: 40 }, seed: 331 };

const DARK = "#3D455C", WALL = "#69728A", GLASSC = "#DDF1FA", BRASS = "#C9A24A", WOODD = "#8A6A4A";
const RED = "#E0503A", GREEN = "#3FAE5A", BLUE = "#2F8EE0";
const SPEC = [RED, "#F58A2E", "#F2C230", GREEN, BLUE, "#4B4FC4", "#8E4EC6"]; // 빨강 → 보라
const WHITE = "#FFF6D0"; // 흰빛(옅은 노란 기)
const BAND = 336; // 어두운 띠의 아래 끝
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });
const lin = (a, b, i, n) => a + (b - a) * i / (n - 1);
// 암실 세 컷은 빛이 오른쪽 덧창에서 들어와 왼쪽으로 간다(인물과 말풍선을 왼쪽에 두려고). 장치는 왼쪽에서 오는 것으로 짜고 통째로 뒤집어 그린다
const flipX = (sk, fn) => { sk.save(); sk.translate(W, 0); sk.scale(-1, 1); fn(); sk.restore(); };
// 턱을 따라 난 짧은 턱수염(머리 위에 덧그린다). (hx, hy) = 머리 중심
function shortBeard(sk, hx, hy, s, tilt, color, sd) {
  sk.at(hx, hy, s, () => {
    const b = curve([[-101, 4], [-84, 30], [-52, 52], [-24, 44], [0, 50], [24, 44], [52, 52], [84, 30], [101, 4], [104, 44], [84, 88], [46, 116], [0, 126], [-46, 116], [-84, 88], [-104, 44]], true, 4);
    sk.fill(b, color, { dx: 1, dy: 1.4, wob: 1.2, seed: sd });
    sk.ink(b, { w: 10, wob: 1.2, seed: sd + 1 });
    for (const [bx, by, i] of [[-48, 84, 0], [0, 94, 1], [48, 84, 2]]) sk.ink(curve([[bx - 12, by - 7], [bx, by + 5], [bx + 12, by - 7]]), { w: 5, wob: 0.4, seed: sd + 2 + i, color: mix(color, "#ffffff", 0.25) });
  }, tilt);
}
function maxwell(sk, x, s, P, o = {}) {
  drawFigure(sk, x, 704, s, P, { ...MAXWELL, name: "maxwell", ...o });
  shortBeard(sk, x + s * P.head[0], 704 + s * P.head[1], s, P.tilt ?? 0, "#3A2E28", 315);
}

/* ---------- 암실과 빛 ---------- */

function darkBand(sk, sd) {
  sk.fill(poly([[-20, -20], [980, -20], [980, BAND], [-20, BAND]], 10), DARK, { dx: 0, dy: 0, wob: 1.6, seed: sd });
}
// 덧창(왼쪽 끝의 나무 판)과 작은 구멍. 빛은 (34, hy)에서 들어온다
function shutter(sk, hy, sd) {
  thin(sk, 0.8, () => {
    const p = poly([[-10, -10], [34, -10], [34, 430], [-10, 430]], 6);
    sk.fill(p, WOODD, { dx: 0, dy: 0, wob: 0.6, seed: sd, tex: true, texAng: 1.5 });
    sk.ink(dense([[34, -10], [34, 430], [-10, 430]], 6), { w: 8, seed: sd + 1 });
  });
  sk.glow(22, hy, 40, "#FFF3B0", 0.9, 0.1);
  sk.dot(22, hy, 10, "#FFFBE6");
}
const ray = (sk, pts, color, sd, o = {}) => sk.ink(dense(pts, 6), { w: o.w ?? 6, color, seed: sd, wob: 0.2, alpha: o.alpha, dash: o.dash });
// 세모 프리즘(끝면이 보이게). 꼭지가 아래. 돌려주는 값: 들어가는 점과 나오는 점(두 빗면의 가운데)
function prism(sk, cx, cy, r, sd) {
  const c = r * Math.cos(Math.PI / 6);
  const tri = poly([[cx - c, cy - r / 2], [cx + c, cy - r / 2], [cx, cy + r]], 4);
  sk.fill(tri, GLASSC, { dx: 0, dy: 0, wob: 0.4, seed: sd, alpha: 0.92 });
  thin(sk, 0.8, () => {
    sk.ink(tri, { w: 8, seed: sd + 1, wob: 0.6 });
    sk.ink(dense([[cx - c * 0.55, cy - r / 2 + 9], [cx + c * 0.2, cy - r / 2 + 9]]), { w: 4, color: C.white, seed: sd + 2, wob: 0.2 });
  });
  return { inP: [cx - c / 2, cy + r / 4], outP: [cx + c / 2, cy + r / 4] };
}
// 받침대: 기둥 + 발. (x, y) = 기둥 꼭대기
function stand(sk, x, y, sd, cradle = 0) {
  thin(sk, 0.8, () => {
    sk.ink(dense([[x, y], [x, 700]], 6), { w: 8, color: WOODD, seed: sd, wob: 0.4 });
    sk.ink(dense([[x - 34, 702], [x + 34, 702]], 6), { w: 9, color: WOODD, seed: sd + 1, wob: 0.4 });
    if (cradle) sk.ink(dense([[x - cradle, y - cradle * 0.9], [x, y], [x + cradle, y - cradle * 0.9]], 4), { w: 7, color: WOODD, seed: sd + 2, wob: 0.3 });
  });
}
// 맞은편 벽(빛을 받는 면)
function wallPanel(sk, x0, x1, y0, sd, color = WALL) {
  const p = poly([[x0, y0 + 12], [x1, y0], [x1, BAND - 2], [x0, BAND - 2]], 6);
  sk.fill(p, color, { dx: 0, dy: 0, wob: 0.6, seed: sd });
  thin(sk, 0.8, () => sk.ink(p, { w: 7, seed: sd + 1, wob: 0.8 }));
}
// 구멍 뚫은 나무 판(옆에서 본 모습): 구멍 자리만 비운 두 토막
function board(sk, x, top, hy, gap, sd) {
  thin(sk, 0.8, () => {
    for (const [y0, y1, i] of [[top, hy - gap, 0], [hy + gap, 700, 1]]) {
      const p = poly([[x - 8, y0], [x + 8, y0], [x + 8, y1], [x - 8, y1]], 6);
      sk.fill(p, "#B98A55", { dx: 0, dy: 0, wob: 0.4, seed: sd + i });
      sk.ink(p, { w: 6, seed: sd + 3 + i, wob: 0.5 });
    }
  });
}

/* ---------- 1. 벽에 펼쳐진 색 띠 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  darkBand(sk, 11);
  ground(sk, 704, 13);
  flipX(sk, () => {
  const cx = 190, cy = 262, r = 54;
  stand(sk, cx, cy + r, 15, 14);
  const c = r * Math.cos(Math.PI / 6), inP = [cx - c / 2, cy + r / 4], outP = [cx + c / 2, cy + r / 4];
  const hy = inP[1] - 0.42 * (inP[0] - 34);
  shutter(sk, hy, 17);
  // 맞은편 벽과 길쭉한 색 띠: 보라가 위(가장 많이 꺾임), 빨강이 아래
  wallPanel(sk, 428, 574, 50, 21);
  const bx = 478, yTop = 104, yBot = 274;
  ray(sk, [[34, hy], inP], WHITE, 23, { w: 9 });
  SPEC.forEach((col, i) => {
    const y0 = lin(yBot, yTop, i, 7 + 1), y1 = lin(yBot, yTop, i + 1, 7 + 1);
    ray(sk, [[outP[0] - 4, outP[1] + (i - 3) * -1.2], [bx - 14, (y0 + y1) / 2]], col, 31 + i, { w: 5 });
  });
  SPEC.forEach((col, i) => {
    const y0 = lin(yBot, yTop, i, 8), y1 = lin(yBot, yTop, i + 1, 8);
    sk.ink(dense([[bx, y0 + (i === 0 ? 0 : 1)], [bx, y1 - (i === 6 ? 0 : 1)]], 4), { w: 34, color: col, seed: 41 + i, wob: 0.2, cap: i === 0 || i === 6 ? "round" : "butt" });
  });
  for (let i = 1; i < 6; i++) { const y0 = lin(yBot, yTop, i, 8), y1 = lin(yBot, yTop, i + 1, 8); sk.ink(dense([[bx, y0 + 2], [bx, y1 - 2]], 4), { w: 34, color: SPEC[i], seed: 51 + i, wob: 0.2, cap: "butt" }); }
  prism(sk, cx, cy, r, 61);
  ray(sk, [inP, outP], WHITE, 63, { w: 6, alpha: 0.9 });
  // 기대했던 둥근 모양(점선)과 물음표
  sk.ink(circ(538, 150, 24, { over: 0, seed: 65 }), { w: 5, color: "#F5E9C9", dash: [9, 8], seed: 66, wob: 0.2 });
  });
  qmark(sk, W - 538, 236, 0.5, { color: "#F5E9C9", seed: 67 });
  const P = pose({ elR: [104, -316], haR: [196, -372], elL: [-50, -262], haL: [-30, -214], tilt: 0.06 });
  drawFigure(sk, 168, 704, 0.63, P, { ...NEWTON, name: "newton", face: "curious" });
  return sk;
}

/* ---------- 2. 결정적 실험: 한 색만 골라 보내다 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  darkBand(sk, 71);
  ground(sk, 704, 73);
  flipX(sk, () => {
  const r = 44, c = r * Math.cos(Math.PI / 6);
  const c1 = [150, 262], in1 = [c1[0] - c / 2, c1[1] + r / 4], out1 = [c1[0] + c / 2, c1[1] + r / 4];
  const hy = in1[1] - 0.42 * (in1[0] - 34);
  shutter(sk, hy, 75);
  stand(sk, c1[0], c1[1] + r, 77, 12);
  const B1 = 214, B2 = 366;
  // 첫 프리즘에서 갈라진 빛: 보라 쪽만 둘째 판의 구멍을 지난다. 나머지는 판에 막힌다
  const slopes = [0.2, 0.15, 0.1, 0.04, -0.03, -0.08, -0.13]; // 빨강 → 보라
  const yAt = (s, x) => out1[1] + s * (x - out1[0]);
  const holeY = yAt(slopes[6], B2);
  wallPanel(sk, 538, 576, 96, 79);
  ray(sk, [[34, hy], in1], WHITE, 81, { w: 9 });
  slopes.forEach((s, i) => { if (i < 6) ray(sk, [out1, [B2 - 9, yAt(s, B2 - 9)]], SPEC[i], 83 + i, { w: 4.5 }); });
  // 둘째 프리즘: 구멍을 지난 보랏빛이 다시 꺾인다
  const in2x = 420, in2 = [in2x, yAt(slopes[6], in2x)], c2 = [in2x + c / 2, in2[1] - r / 4], out2 = [in2x + c, in2[1]];
  stand(sk, c2[0], c2[1] + r, 91, 12);
  ray(sk, [out1, in2], SPEC[6], 93, { w: 5.5 });
  const wx = 550, vY = out2[1] - 0.62 * (wx - out2[0]), rY = out2[1] - 0.24 * (wx - out2[0]);
  ray(sk, [out2, [wx, rY]], RED, 95, { w: 4.5, dash: [9, 8], alpha: 0.75 });
  ray(sk, [out2, [wx, vY]], SPEC[6], 97, { w: 5.5 });
  board(sk, B1, 150, yAt(0.03, B1), 16, 101);
  board(sk, B2, 150, holeY, 9, 105);
  prism(sk, c1[0], c1[1], r, 111);
  prism(sk, c2[0], c2[1], r, 113);
  ray(sk, [in1, out1], WHITE, 115, { w: 5, alpha: 0.9 });
  ray(sk, [in2, out2], SPEC[6], 117, { w: 5 });
  // 벽의 두 점: 보라(지금)는 높이, 빨강(다른 때 보낸 것)은 낮게
  sk.dot(wx + 8, rY, 11, mix(RED, WALL, 0.25)); sk.dot(wx + 8, vY, 12, SPEC[6]);
  // 첫 프리즘을 돌린다
  arrow(sk, ell(c1[0], c1[1] + 6, 70, 70, -2.5, -0.75), { w: 6, color: "#F5E9C9", seed: 119, head: 16, wob: 0.2, straight: true });
  });
  const P = pose({ elR: [104, -322], haR: [190, -392], elL: [-56, -262], haL: [-40, -214], tilt: 0.06 });
  drawFigure(sk, 168, 704, 0.63, P, { ...NEWTON, name: "newton", face: "determined" });
  return sk;
}

/* ---------- 3. 렌즈로 모으니 흰빛 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  darkBand(sk, 131);
  ground(sk, 704, 133);
  flipX(sk, () => {
  const cx = 160, cy = 268, r = 46, c = r * Math.cos(Math.PI / 6);
  const inP = [cx - c / 2, cy + r / 4], outP = [cx + c / 2, cy + r / 4];
  const hy = inP[1] - 0.42 * (inP[0] - 34);
  shutter(sk, hy, 135);
  stand(sk, cx, cy + r, 137, 12);
  const lx = 336, ly = 214, lh = 112, focus = [528, 222];
  stand(sk, lx, ly + lh, 139);
  // 종이(빛을 받는 면)
  const paper = poly([[498, 116], [574, 100], [574, BAND - 4], [498, BAND - 12]], 6);
  sk.fill(paper, "#8E96AB", { dx: 0, dy: 0, wob: 0.6, seed: 141 });
  thin(sk, 0.8, () => sk.ink(paper, { w: 7, seed: 142, wob: 0.8 }));
  stand(sk, 538, BAND - 6, 143);
  ray(sk, [[34, hy], inP], WHITE, 145, { w: 9 });
  SPEC.forEach((col, i) => {
    const yl = lin(ly + 84, ly - 84, i, 7);
    ray(sk, [outP, [lx, yl]], col, 147 + i, { w: 5 });
    ray(sk, [[lx, yl], focus], col, 157 + i, { w: 5 });
  });
  // 큰 볼록 렌즈(옆에서 본 모습)
  const t = 20;
  const lens = curve([[lx, ly - lh], [lx + t * 0.8, ly - lh * 0.55], [lx + t, ly], [lx + t * 0.8, ly + lh * 0.55], [lx, ly + lh], [lx - t * 0.8, ly + lh * 0.55], [lx - t, ly], [lx - t * 0.8, ly - lh * 0.55]], true, 4);
  sk.fill(lens, GLASSC, { dx: 0, dy: 0, wob: 0.3, seed: 167, alpha: 0.8 });
  thin(sk, 0.8, () => { sk.ink(lens, { w: 7, seed: 168, wob: 0.5 }); sk.ink(curve([[lx - 6, ly - lh * 0.7], [lx - 11, ly - lh * 0.3], [lx - 11, ly]]), { w: 4, color: C.white, seed: 169, wob: 0.2 }); });
  prism(sk, cx, cy, r, 171);
  ray(sk, [inP, outP], WHITE, 173, { w: 5, alpha: 0.9 });
  // 모인 자리: 흰 동그라미
  sk.glow(focus[0] + 6, focus[1], 62, "#FFFBE6", 0.95, 0.25);
  const spot = circ(focus[0] + 6, focus[1], 22, { over: 0.1, seed: 175 });
  sk.fill(spot, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 176 });
  sk.ink(spot, { w: 4, color: "#F2DF9A", seed: 177, wob: 0.3 });
  });
  const P = pose({ elL: [-104, -322], haL: [-180, -400], elR: [100, -322], haR: [170, -400], tilt: 0.04 });
  drawFigure(sk, 168, 704, 0.63, P, { ...NEWTON, name: "newton", face: "wide" });
  return sk;
}

/* ---------- 4. 물체의 색은 되돌려 보낸 빛 ---------- */
// 햇빛 화살표: 흰 화살표에 노란 테
function sunArrow(sk, pts, sd) {
  arrow(sk, pts, { w: 13, color: "#EDB92E", seed: sd, straight: true, head: 24, wob: 0.2 });
  arrow(sk, pts, { w: 5, color: C.white, seed: sd, straight: true, head: 24, wob: 0.2 });
}
// 안료 가루를 담은 얕은 접시. (x, y) = 접시 테 높이의 가운데
function dish(sk, x, y, color, sd) {
  const mound = curve([[-48, 0], [-30, -20], [0, -32], [30, -20], [48, 0]], false, 3).map(([a, b]) => [x + a, y + b]);
  sk.fill([...mound, mound[0]], color, { dx: 0, dy: 0, wob: 0.5, seed: sd, tex: 0.6 });
  sk.ink(mound, { w: 5, color: mix(color, "#000000", 0.3), seed: sd + 1, wob: 0.5 });
  const bowl = curve([[-64, -2], [-46, 22], [46, 22], [64, -2]], false, 3).map(([a, b]) => [x + a, y + b]);
  sk.fill([...bowl, bowl[0]], "#F1EEE6", { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 });
  sk.ink([...bowl, bowl[0]], { w: 8, seed: sd + 3 });
}
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  ground(sk, 704, 191);
  // 창: 햇빛이 드는 곳
  thin(sk, 0.8, () => {
    const win = rrect(610, 26, 300, 120, 10);
    sk.fill(win, "#FFF3B0", { dx: 0, dy: 0, wob: 0.5, seed: 193 });
    sk.ink(win, { w: 10, color: WOODD, seed: 194 });
    sk.ink(dense([[760, 28], [760, 144]]), { w: 7, color: WOODD, seed: 195, wob: 0.3 });
    sk.ink(dense([[612, 86], [908, 86]]), { w: 7, color: WOODD, seed: 196, wob: 0.3 });
  });
  // 탁자
  thin(sk, 0.85, () => {
    for (const lx of [250, 880]) sk.ink(dense([[lx, 590], [lx, 704]]), { w: 11, color: "#6B4A32", seed: 197 + lx, wob: 0.3 });
    const top = rrect(214, 566, 706, 26, 8); sk.fill(top, C.wood, { seed: 199, tex: true, texAng: 0.02 }); sk.ink(top, { w: 10, seed: 200 });
  });
  const A = 500, Bx = 780, dy = 540;
  dish(sk, A, dy, "#E2572B", 201);
  dish(sk, Bx, dy, "#3C7BD0", 211);
  // 들어오는 햇빛(흰빛)
  sunArrow(sk, [[A + 128, 168], [A + 34, dy - 62]], 221);
  sunArrow(sk, [[Bx + 110, 168], [Bx + 34, dy - 62]], 223);
  // 되돌려 보내는 빛: 붉은 가루는 빨간 빛을 많이, 푸른 가루는 파란 빛을 많이
  arrow(sk, [[A - 22, dy - 62], [A - 124, 300]], { w: 12, color: RED, seed: 225, straight: true, head: 30, wob: 0.3 });
  arrow(sk, [[A - 56, dy - 44], [A - 96, dy - 108]], { w: 5, color: GREEN, seed: 227, straight: true, head: 12, wob: 0.2 });
  arrow(sk, [[A - 82, dy - 30], [A - 126, dy - 86]], { w: 5, color: BLUE, seed: 229, straight: true, head: 12, wob: 0.2 });
  arrow(sk, [[Bx - 22, dy - 62], [Bx - 124, 300]], { w: 12, color: BLUE, seed: 231, straight: true, head: 30, wob: 0.3 });
  arrow(sk, [[Bx - 56, dy - 44], [Bx - 96, dy - 108]], { w: 5, color: GREEN, seed: 233, straight: true, head: 12, wob: 0.2 });
  arrow(sk, [[Bx - 82, dy - 30], [Bx - 126, dy - 86]], { w: 5, color: RED, seed: 235, straight: true, head: 12, wob: 0.2 });
  // 편지를 쓰는 뉴턴
  const letter = poly([[236, 562], [338, 562], [356, 530], [254, 530]], 4);
  sk.fill(letter, C.parchment, { dx: 0, dy: 0, wob: 0.4, seed: 237 }); sk.ink(letter, { w: 6, seed: 238, wob: 0.5 });
  for (let i = 0; i < 3; i++) sk.ink(dense([[262 + i * 5, 554 - i * 8], [326 + i * 5 - (i === 2 ? 26 : 0), 554 - i * 8]]), { w: 3.5, color: C.gray, seed: 239 + i, wob: 0.2 });
  const fx = 138, fy = 704, fs = 0.66;
  const P = pose({ elR: [92, -262], haR: [176, -248], elL: [-50, -260], haL: [-30, -214], tilt: 0.08 });
  drawFigure(sk, fx, fy, fs, P, { ...NEWTON, face: "smile", hands: "L" });
  const hx = fx + fs * 176, hyy = fy - fs * 248;
  quill(sk, hx - 12, hyy + 18, 0.9, { seed: 243 });
  handDot(sk, [hx, hyy], C.skin, 245, 10);
  return sk;
}

/* ---------- 5. 1704년: 몇 가지 빛이면 될까 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  ground(sk, 704, 251);
  // 받침에 세운 큰 종이
  thin(sk, 0.8, () => {
    sk.ink(dense([[470, 610], [446, 702]]), { w: 9, color: WOODD, seed: 253, wob: 0.4 });
    sk.ink(dense([[830, 610], [854, 702]]), { w: 9, color: WOODD, seed: 254, wob: 0.4 });
    const sheet = poly([[396, 112], [904, 112], [904, 628], [396, 628]], 6);
    sk.fill(sheet, C.parchment, { dx: 1, dy: 1.2, wob: 0.8, seed: 255 });
    sk.ink(sheet, { w: 9, seed: 256, wob: 1.2 });
  });
  // 색 원: 둘레를 음계의 비율로 나눈 일곱 칸(칸 너비가 서로 다르다)
  const cx = 650, cy = 370, r0 = 118, r1 = 204;
  const part = [1 / 9, 1 / 16, 1 / 10, 1 / 9, 1 / 10, 1 / 16, 1 / 9], sum = part.reduce((a, b) => a + b, 0);
  let a = -Math.PI / 2;
  const cuts = [];
  part.forEach((f, i) => {
    const a1 = a + f / sum * Math.PI * 2;
    const sec = [...ell(cx, cy, r1, r1, a, a1), ...ell(cx, cy, r0, r0, a1, a)]; sec.push(sec[0]);
    sk.fill(sec, SPEC[i], { dx: 0, dy: 0, wob: 0.3, seed: 261 + i });
    cuts.push(a); a = a1;
  });
  thin(sk, 0.8, () => {
    for (const [i, an] of cuts.entries()) sk.ink(dense([[cx + r0 * Math.cos(an), cy + r0 * Math.sin(an)], [cx + r1 * Math.cos(an), cy + r1 * Math.sin(an)]]), { w: 5, seed: 271 + i, wob: 0.3 });
    sk.ink(circ(cx, cy, r1, { over: 0.05, seed: 281 }), { w: 7, seed: 282, wob: 0.6 });
    sk.ink(circ(cx, cy, r0, { over: 0.05, seed: 283 }), { w: 6, seed: 284, wob: 0.5 });
  });
  // 가운데의 흰 점과 물음표, 둘레의 세 곳에서 가운데로 가는 점선 화살표
  for (const [k, an] of [-Math.PI / 2 + 0.33, Math.PI / 6 + 0.33, Math.PI * 5 / 6 + 0.33].entries()) arrow(sk, [[cx + (r0 - 10) * Math.cos(an), cy + (r0 - 10) * Math.sin(an)], [cx + 50 * Math.cos(an), cy + 50 * Math.sin(an)]], { w: 5, color: "#6B7280", dash: [8, 7], seed: 291 + k, straight: true, head: 13, wob: 0.1 });
  const dot = circ(cx, cy, 36, { over: 0.1, seed: 295 });
  sk.fill(dot, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 296 }); sk.ink(dot, { w: 5, color: C.gray, seed: 297, wob: 0.3 });
  qmark(sk, cx, cy + 4, 0.42, { color: C.ink, seed: 299 });
  const P = pose({ elR: [100, -310], haR: [186, -356], elL: [-50, -260], haL: [-30, -214], tilt: 0.06 });
  drawFigure(sk, 178, 704, 0.66, P, { ...NEWTON_OLD, name: "newton", face: "curious" });
  return sk;
}

/* ---------- 6. 1861년: 세 번 찍은 리본 ---------- */
// 타탄 무늬 리본꽃
function rosette(sk, cx, cy, r, sd) {
  const TR = "#C8443A", TG = "#2F8F52", TB = "#2F62C0";
  for (const sg of [-1, 1]) {
    const tail = poly([[cx + sg * r * 0.1, cy + r * 0.5], [cx + sg * r * 0.5, cy + r * 0.6], [cx + sg * r * 0.95, cy + r * 1.75], [cx + sg * r * 0.62, cy + r * 1.6], [cx + sg * r * 0.42, cy + r * 1.86]], 3);
    sk.fill(tail, TR, { dx: 0, dy: 0, wob: 0.3, seed: sd + (sg > 0 ? 1 : 0) });
    sk.ink(dense([[cx + sg * r * 0.3, cy + r * 0.62], [cx + sg * r * 0.66, cy + r * 1.7]], 4), { w: r * 0.1, color: TG, seed: sd + 2, wob: 0.2, cap: "butt" });
    for (const k of [0.95, 1.35]) sk.ink(dense([[cx + sg * r * (0.22 + (k - 0.6) * 0.42), cy + r * k + 4], [cx + sg * r * (0.62 + (k - 0.6) * 0.42), cy + r * k - 6]], 4), { w: r * 0.08, color: TB, seed: sd + 3, wob: 0.2, cap: "butt" });
    sk.ink(tail, { w: Math.max(3.5, r * 0.08), seed: sd + 4 + (sg > 0 ? 1 : 0), wob: 0.4 });
  }
  const body = circ(cx, cy, r, { over: 0.05, seed: sd + 6, lump: 0.05 });
  sk.fill(body, TR, { dx: 0, dy: 0, wob: 0.4, seed: sd + 7 });
  for (const [k, i] of [[-0.55, 0], [0.55, 1]]) {
    const h = Math.sqrt(1 - k * k) * r - 3;
    sk.ink(dense([[cx - h, cy + k * r], [cx + h, cy + k * r]], 4), { w: r * 0.17, color: TG, seed: sd + 8 + i, wob: 0.2, cap: "butt" });
    sk.ink(dense([[cx + k * r, cy - h], [cx + k * r, cy + h]], 4), { w: r * 0.17, color: TB, seed: sd + 10 + i, wob: 0.2, cap: "butt" });
  }
  sk.ink(dense([[cx - r + 3, cy], [cx + r - 3, cy]], 4), { w: r * 0.07, color: TB, seed: sd + 12, wob: 0.2, cap: "butt" });
  sk.ink(dense([[cx, cy - r + 3], [cx, cy + r - 3]], 4), { w: r * 0.07, color: TG, seed: sd + 13, wob: 0.2, cap: "butt" });
  sk.ink(body, { w: Math.max(4, r * 0.1), seed: sd + 14, wob: 0.6 });
  const knot = circ(cx, cy, r * 0.3, { over: 0.1, seed: sd + 15 });
  sk.fill(knot, "#9E2F2A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 16 }); sk.ink(knot, { w: Math.max(3.5, r * 0.08), seed: sd + 17, wob: 0.4 });
}
// 색 액체를 담은 납작한 유리 통. (x, y) = 왼쪽 위
function cell(sk, x, y, w, h, color, sd) {
  const g = rrect(x, y, w, h, 4);
  sk.fill(g, "#F6FBFD", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  sk.fill(poly([[x + 3, y + h * 0.14], [x + w - 3, y + h * 0.14], [x + w - 3, y + h - 3], [x + 3, y + h - 3]], 4), color, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1, alpha: 0.85 });
  thin(sk, 0.8, () => sk.ink(g, { w: 6, seed: sd + 2, wob: 0.4 }));
}
// 나무 상자 사진기(오른쪽을 본다). (x, y) = 몸통 왼쪽 위. 렌즈 끝의 좌표를 돌려준다
function camera(sk, x, y, sd) {
  thin(sk, 0.85, () => {
    for (const fx of [x + 6, x + 66, x + 126]) sk.ink(dense([[x + 66, y + 112], [fx, 702]], 6), { w: 8, color: WOODD, seed: sd + fx, wob: 0.4 });
    const front = rrect(x + 122, y + 16, 46, 80, 6); sk.fill(front, "#A9773F", { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 }); sk.ink(front, { w: 8, seed: sd + 2 });
    const body = rrect(x, y, 130, 112, 8); sk.fill(body, "#C99A62", { seed: sd + 3, tex: true, texAng: 0.03 }); sk.ink(body, { w: 9, seed: sd + 4 });
    const barrel = rrect(x + 166, y + 38, 48, 36, 6); sk.fill(barrel, BRASS, { dx: 0, dy: 0, wob: 0.3, seed: sd + 5 }); sk.ink(barrel, { w: 7, seed: sd + 6 });
    sk.ink(dense([[x + 182, y + 40], [x + 182, y + 72]]), { w: 4, color: "#8A6A2A", seed: sd + 7, wob: 0.2 });
  });
  return [x + 214, y + 56];
}
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 704, 301);
  // 검은 판에 꽂은 리본꽃
  stand(sk, 846, 520, 303);
  thin(sk, 0.8, () => { const bd = rrect(766, 316, 160, 208, 8); sk.fill(bd, "#39424E", { dx: 0, dy: 0, wob: 0.5, seed: 305 }); sk.ink(bd, { w: 8, seed: 306 }); });
  rosette(sk, 846, 392, 50, 307);
  // 사진사: 사진기 뒤에서 검은 천을 뒤집어썼다
  const sx = 356, ss = 0.6;
  const SP = pose({ elR: [84, -300], haR: [150, -352], elL: [-44, -258], haL: [-52, -190], tilt: 0.1 });
  drawFigure(sk, sx, 704, ss, SP, { ...SUTTON, hands: "L" });
  const [lxE, lyE] = camera(sk, 440, 378, 311);
  const cloth = curve([[296, 398], [322, 352], [400, 344], [478, 354], [520, 370], [516, 392], [452, 398], [440, 470], [426, 512], [372, 522], [316, 512], [294, 466]], true, 4);
  sk.fill(cloth, "#2E2E33", { dx: 1, dy: 1.2, wob: 1, seed: 313, tex: true });
  sk.ink(cloth, { w: 9, seed: 314, wob: 1.2 });
  sk.ink(curve([[340, 372], [352, 430], [344, 496]]), { w: 4, color: "#55555C", seed: 315, wob: 0.4 });
  sk.ink(curve([[400, 366], [408, 420], [400, 500]]), { w: 4, color: "#55555C", seed: 316, wob: 0.4 });
  handDot(sk, [sx + ss * 150, 704 - ss * 352], C.skin, 317, 9);
  // 렌즈 앞의 빨간 액체 통, 바닥의 초록과 파란 액체 통
  stand(sk, lxE + 30, lyE + 54, 319);
  cell(sk, lxE + 14, lyE - 52, 32, 106, RED, 321);
  cell(sk, 690, 606, 32, 96, GREEN, 325);
  cell(sk, 740, 606, 32, 96, BLUE, 329);
  // 사진기가 리본꽃을 본다(점선)
  sk.ink(dense([[lxE + 54, lyE], [782, 400]]), { w: 4, color: C.gray, dash: [9, 9], seed: 333, wob: 0 });
  const P = pose({ elR: [96, -300], haR: [170, -326], elL: [-50, -260], haL: [-30, -214], tilt: 0.06 });
  maxwell(sk, 140, 0.64, P);
  return sk;
}

/* ---------- 7. 세 빛을 한곳에 ---------- */
// 환등기(오른쪽을 본다): 굴뚝 달린 상자 + 놋쇠 렌즈 통 + 색 액체 통. (x, ly) = 몸통 왼쪽, 렌즈 높이. 빛이 나가는 점을 돌려준다
function lantern(sk, x, ly, color, sd) {
  thin(sk, 0.8, () => {
    sk.ink(dense([[x + 14, ly + 44], [x + 14, 700]], 6), { w: 9, color: WOODD, seed: sd, wob: 0.4 });
    sk.ink(dense([[x - 12, ly + 46], [x + 104, ly + 46]], 6), { w: 9, color: WOODD, seed: sd + 1, wob: 0.4 });
    const ch = rrect(x + 26, ly - 92, 34, 54, 5); sk.fill(ch, "#5A5F68", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 }); sk.ink(ch, { w: 7, seed: sd + 3 });
    sk.ink(dense([[x + 16, ly - 94], [x + 70, ly - 94]]), { w: 8, seed: sd + 4, wob: 0.3 });
    const body = rrect(x, ly - 44, 92, 86, 8); sk.fill(body, "#7A808C", { dx: 0, dy: 0, wob: 0.4, seed: sd + 5, tex: 0.7 }); sk.ink(body, { w: 8, seed: sd + 6 });
    const barrel = rrect(x + 90, ly - 16, 48, 32, 6); sk.fill(barrel, BRASS, { dx: 0, dy: 0, wob: 0.3, seed: sd + 7 }); sk.ink(barrel, { w: 7, seed: sd + 8 });
  });
  cell(sk, x + 144, ly - 30, 16, 60, color, sd + 10);
  return [x + 162, ly];
}
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  darkBand(sk, 341);
  ground(sk, 704, 343);
  // 스크린
  const scr = poly([[764, 84], [918, 66], [918, BAND - 2], [764, BAND - 10]], 6);
  sk.fill(scr, "#F4F1E8", { dx: 0, dy: 0, wob: 0.6, seed: 345 });
  thin(sk, 0.8, () => sk.ink(scr, { w: 8, seed: 346, wob: 0.8 }));
  stand(sk, 842, BAND - 6, 347);
  const img = [840, 196], ir = 74;
  // 환등기 세 대(층층이 놓았다)와 세 빛의 뿔: 스크린의 같은 자리에 모인다
  const tips = [[336, 282, RED, 351], [396, 412, GREEN, 371], [456, 542, BLUE, 391]].map(([x, ly, col, sd]) => [lantern(sk, x, ly, col, sd), col]);
  tips.forEach(([tp, col], i) => {
    const cone = poly([tp, [img[0], img[1] - ir], [img[0], img[1] + ir]], 6);
    sk.fill(cone, col, { dx: 0, dy: 0, wob: 0.3, seed: 401 + i, alpha: 0.3 });
    for (const sg of [-1, 1]) sk.ink(dense([tp, [img[0], img[1] + sg * ir]], 6), { w: 3.5, color: col, seed: 405 + i * 2 + sg, wob: 0.2, alpha: 0.9 });
  });
  // 세 빛이 겹친 자리에 떠오른 색 있는 리본꽃
  rosette(sk, img[0], img[1] - 22, 44, 411);
  // 관객(뒷모습)
  [[610, { hair: "tophat", seed: 421 }], [742, { hair: "bob", hairColor: "#8A5A33", seed: 431 }], [872, { hair: "short", hairColor: "#3F3A36", seed: 441 }]].forEach(([x, o]) => sk.at(x, 716, 0.5, () => drawHead(sk, o)));
  const P = pose({ elR: [96, -310], haR: [170, -372], elL: [-50, -260], haL: [-30, -214], tilt: 0.06 });
  maxwell(sk, 150, 0.64, P, { face: "happy" });
  return sk;
}

/* ---------- 8. 오늘: 세 빛으로 짓는 색 ---------- */
function flowerPot(sk, x, y, sd) {
  sk.ink(curve([[x, y - 60], [x - 6, y - 110], [x + 2, y - 160]]), { w: 8, color: "#2F8F52", seed: sd, wob: 0.6 });
  for (const sg of [-1, 1]) { const lf = curve([[x, y - 84], [x + sg * 30, y - 112], [x + sg * 58, y - 100], [x + sg * 30, y - 80]], true, 3); sk.fill(lf, "#5CBF74", { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 }); sk.ink(lf, { w: 6, seed: sd + 2 + sg, wob: 0.5 }); }
  for (let i = 0; i < 6; i++) { const an = i * Math.PI / 3 + 0.2; const pt = circ(x + 2 + 30 * Math.cos(an), y - 170 + 30 * Math.sin(an), 20, { over: 0.1, seed: sd + 4 + i }); sk.fill(pt, "#F28BB0", { dx: 0, dy: 0, wob: 0.3, seed: sd + 10 + i }); sk.ink(pt, { w: 5, seed: sd + 16 + i, wob: 0.4 }); }
  const ct = circ(x + 2, y - 170, 17, { over: 0.1, seed: sd + 22 }); sk.fill(ct, C.yellow, { dx: 0, dy: 0, wob: 0.3, seed: sd + 23 }); sk.ink(ct, { w: 5, seed: sd + 24, wob: 0.4 });
  const pot = poly([[x - 46, y - 62], [x + 46, y - 62], [x + 34, y], [x - 34, y]], 4);
  sk.fill(pot, "#D98A5B", { seed: sd + 25, tex: true }); sk.ink(pot, { w: 9, seed: sd + 26 });
  const rim = rrect(x - 54, y - 76, 108, 20, 8); sk.fill(rim, "#D98A5B", { dx: 0, dy: 0, wob: 0.3, seed: sd + 27 }); sk.ink(rim, { w: 8, seed: sd + 28 });
}
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  ground(sk, 704, 451);
  thin(sk, 0.85, () => {
    for (const lx of [452, 596]) sk.ink(dense([[lx, 600], [lx, 704]]), { w: 11, color: "#6B4A32", seed: 453 + lx, wob: 0.3 });
    const top = rrect(424, 578, 200, 24, 8); sk.fill(top, C.wood, { seed: 455, tex: true, texAng: 0.02 }); sk.ink(top, { w: 10, seed: 456 });
  });
  flowerPot(sk, 524, 578, 461);
  // 학생: 휴대 전화로 꽃을 찍는다
  const fx = 176, fs = 0.66;
  const P = pose({ elR: [92, -296], haR: [176, -318], elL: [-50, -260], haL: [-30, -214], tilt: 0.06 });
  drawFigure(sk, fx, 704, fs, P, { ...STUDENT, name: "student", hands: "L" });
  const hx = fx + fs * 176, hy = 704 - fs * 318;
  phone(sk, hx + 14, hy - 16, 1.5, { rot: 0.08, seed: 491 });
  handDot(sk, [hx + 4, hy + 16], C.skin, 493, 10);
  // 꽃에서 온 빛을 세 가지 빛으로 나눠 받는다
  [[RED, -26], [GREEN, 0], [BLUE, 26]].forEach(([col, d], i) => arrow(sk, [[462, 420 + d], [352, 462 + d * 0.7]], { w: 7, color: col, seed: 495 + i, straight: true, head: 17, wob: 0.2 }));
  const T = pose({ elL: [-96, -300], haL: [-172, -322], elR: [50, -260], haR: [30, -214], tilt: -0.06 });
  drawFigure(sk, 722, 704, 0.66, T, { ...TEACHER, name: "teacher" });
  return sk;
}

export const META = {
  title: "흰빛을 나누고,<br><em>세 빛으로 다시 짓다</em>",
  lead: "1666년 무렵 뉴턴의 프리즘에서 1861년 맥스웰의 세 빛 사진까지, 빛을 나누고 합친 사람들을 따라가요.",
  narrator: "햇빛은 그냥 흰 빛일까요? 뉴턴은 <b>프리즘</b>으로 햇빛을 나누었다가 다시 합쳐 보았어요. 그리고 200년쯤 뒤, 맥스웰은 단 <b>세 가지 빛</b>으로 색을 지어 냈어요.",
  cta: "실험실 열기",
};

const CUTS = [
  {
    fn: p1, when: "1666년 무렵, 영국", stage: "궁금증", title: "벽에 펼쳐진 색 띠",
    caption: "1672년, <b>뉴턴</b>은 왕립학회에 보낸 편지에 1666년 초의 실험을 적었어요. 방을 캄캄하게 막고 덧창의 작은 구멍으로 햇빛을 들여 세모 유리 <b>프리즘</b>에 비추자, 맞은편 벽에 여러 색의 띠가 생겼어요. 뉴턴이 놀란 건 색이 아니라 모양이었어요. 둥글 줄 알았던 띠가 너비보다 다섯 배쯤 길었거든요.",
    bubbles: [{ who: "newton", text: "둥글 줄<br>알았는데?" }],
  },
  {
    fn: p2, when: "1666년 무렵, 영국", stage: "결정적 실험", title: "한 색만 골라 보내다",
    caption: "그 무렵에는 색은 유리가 흰빛을 바꿔서 만든다는 생각이 흔했어요. 편지에 따르면 뉴턴은 구멍 뚫은 판 두 장을 세우고 첫 프리즘을 천천히 돌려, 색 띠에서 <b>한 가지 색</b>만 두 번째 프리즘에 보냈어요. 보라 쪽 빛은 두 번째 프리즘에서도 빨강 쪽 빛보다 더 많이 꺾였고, 한번 골라 낸 색은 끝까지 제 색을 지켰어요. 뉴턴은 이것을 결정적 실험이라고 불렀어요.",
    bubbles: [{ who: "newton", text: "색마다<br>꺾임이 달라!" }],
  },
  {
    fn: p3, when: "1666년 무렵, 영국", stage: "다시 합치기", title: "렌즈로 모으니 흰빛",
    caption: "뉴턴은 프리즘에서 퍼져 나온 색 빛들을 큰 <b>렌즈</b>로 한곳에 모아 종이에 비춰 보았어요. 그러자 여러 색이 섞여 다시 하얀 빛이 되었어요. 햇빛 속에 여러 색의 빛이 처음부터 들어 있었다는 증거예요.",
    term: { name: "백색광", def: "여러 가지 색의 빛이 고르게 합쳐진 빛이에요. 햇빛이 대표적이고, 프리즘을 지나면 여러 색으로 나뉘어요." },
    bubbles: [{ who: "newton", text: "다시<br>하얘졌어!" }],
  },
  {
    fn: p4, when: "1672년, 영국", stage: "물체의 색", title: "색은 되돌려 보낸 빛",
    caption: "1672년 편지에서 뉴턴은 물체의 색도 빛으로 설명했어요. 붉은 가루는 받은 햇빛 가운데 빨간 빛을, 푸른 가루는 파란 빛을 다른 빛보다 많이 <b>되돌려 보내서</b> 그 색으로 보인다는 거예요. 물체가 색을 만드는 게 아니라, 들어온 빛 가운데 어떤 빛을 되돌려 보내느냐가 색을 정해요.",
  },
  {
    fn: p5, when: "1704년, 런던", stage: "남은 물음", title: "몇 가지 빛이면 될까",
    caption: "1704년에 낸 책 『광학』에서 뉴턴은 색 띠를 음계처럼 일곱 색으로 나눠 둥글게 늘어놓았어요. 그런데 몇 가지 빛만 섞어도 흰빛이 될지는 확신하지 못했어요. 둘레에 고르게 놓인 <b>세 가지 빛</b>을 섞으면 될지는 \"모르겠다\"고 적었지요.",
    bubbles: [{ who: "newton", text: "셋이면<br>될지는 몰라요" }],
  },
  {
    fn: p6, when: "1861년, 영국", stage: "새 생각", title: "세 번 찍은 리본",
    caption: "1801년, 영국의 토머스 영은 우리 눈에 빛을 느끼는 것이 몇 가지뿐일 거라고 생각했어요. 1861년 <b>맥스웰</b>은 이 생각을 사진으로 시험했어요. 사진가 서턴이 같은 리본꽃을 빨강, 초록, 파랑 액체를 담은 유리 통 너머로 한 번씩, 모두 <b>세 번</b> 찍었어요.",
    bubbles: [{ who: "maxwell", text: "세 번<br>찍어요" }],
  },
  {
    fn: p7, when: "1861년, 런던", stage: "놀라운 결과", title: "세 빛을 한곳에",
    caption: "1861년 5월 런던의 강연장에서 맥스웰은 세 사진을 환등기 세 대로 한 스크린에 겹쳐 비췄어요. 환등기마다 사진을 찍을 때와 같은 색 액체를 대자, 세 빛이 겹친 자리에 <b>색이 있는 리본</b>이 떠올랐어요. 색이 완벽하진 않았지만, 세 가지 빛으로 색을 짓는 길이 열렸어요.",
    term: { name: "빛의 합성", def: "두 가지 색 이상의 빛을 한곳에 비추었을 때, 빛이 합쳐져 다른 색의 빛으로 보이는 현상이에요." },
    bubbles: [{ who: "maxwell", text: "색이 있는<br>상이에요" }],
  },
  {
    fn: p8, stage: "오늘날", title: "세 빛으로 짓는 색",
    caption: "오늘날 휴대 전화 사진기도 빛을 빨강, 초록, 파랑으로 나눠 기록하고, 화면은 그 세 빛을 다시 합쳐 색을 보여 줘요. 세 빛의 밝기만 바꾸면 정말 여러 가지 색이 될까요? 이제 실험실에서 조명을 직접 켜고 겹쳐 봐요.",
    term: { name: "빛의 삼원색", def: "빨간색, 초록색, 파란색 빛이에요. 이 세 빛의 밝기를 바꿔 합성하면 여러 가지 색의 빛을 만들 수 있어요." },
    bubbles: [{ who: "student", text: "세 빛으로<br>다?" }, { who: "teacher", text: "실험실에서<br>봐요!" }],
  },
];

export function panels() {
  return CUTS.map(c => ({ sk: c.fn(), bubbles: c.bubbles, when: c.when, whenPos: c.whenPos, stage: c.stage, title: c.title, caption: c.caption, term: c.term }));
}
