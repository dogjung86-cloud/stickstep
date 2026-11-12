// 중2 과학 Ⅷ단원(별과 우주) 개념 컷 코드 그림.
// 목록은 Ⅷ단원 v5 세션이 낸 것(D:\Brilliant Science\output\g2-v5\u8\concept-cuts.md): g2u8l1 ~ g2u8l8 열한 줄.
// 색의 뜻: 빛은 노랑(밝을수록 짙고 번짐이 크다, 흐릴수록 옅다). 원래 자리나 앞선 때는 회색 점선.
// 보는 방향(시선)은 주황과 파랑 점선, 옮겨 보이는 정도는 주황 화살표, 눈여겨볼 곳은 청록.
// 밤하늘은 위쪽 띠로만 깔고, 띠 안의 물체는 밝은 테로 그린다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, arrow, mix } from "../../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { W, H, lerpx, thin, steam, wavy } from "./common.mjs";

const ORANGE = "#F08A2E", BLUE = "#2F8EE0", TEAL = "#12A594", GH = "#9b9b9b", STEEL = "#9AA7B4";
const NIGHT = "#34427A", LIT = "#FFD84A", PALE = "#F2F5FA";
const F0 = { dx: 0, dy: 0, wob: 0.3 };
const ground = (sk, y, sd, x0 = 14, x1 = 946, o = {}) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd, ...o });
// 화면 좌표로 잡은 관절을 인물 좌표(발 사이 원점, 배율 s)로 바꾼다
const local = (ox, oy, s, j) => Object.fromEntries(Object.entries(j).map(([k, v]) => [k, Array.isArray(v) ? [(v[0] - ox) / s, (v[1] - oy) / s] : v]));
const box = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 6);
const pipe = (sk, pts, w, col, sd, wob = 0.5) => { sk.ink(pts, { w: w + 7, seed: sd, wob }); sk.ink(pts, { w, color: col, seed: sd, wob }); };
// fn 이 그린 것을 통째로 흐리게(지나간 때의 모습)
const faded = (sk, alpha, fn) => { const n = sk.body.length; fn(); const part = sk.body.splice(n); sk.body.push(`<g opacity="${alpha}">${part.join("")}</g>`); };
const shape = (sk, pts, col, sd, w = 7, o = {}) => { sk.fill(pts, col, { ...F0, seed: sd, ...o }); sk.ink(pts, { w, seed: sd + 1, wob: 0.4, color: o.line }); };
const nightBand = (sk, y1, sd) => sk.fill(dense([[-12, -12], [W + 12, -12], [W + 12, y1], ...curve([[W + 12, y1], [W * 0.7, y1 + 7], [W * 0.35, y1 - 5], [-12, y1 + 4]]).slice(1), [-12, -12]], 8), NIGHT, { dx: 0, dy: 0, wob: 0, seed: sd });

/* ---------- g2u8l1: 달리는 기차의 창밖. 가까운 전봇대는 뒤로 크게 밀려나고 먼 산은 거의 제자리 ---------- */
function cutL1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 690, X0 = 26, X1 = 770, Y0 = 34, Y1 = 478, HZ = 300;
  // 창밖 풍경
  sk.fill(rrect(X0, Y0, X1 - X0, Y1 - Y0, 34), "#DDF0FB", { ...F0, seed: 11 });
  sk.fill(poly([[X0 + 3, HZ], [X1 - 3, HZ], [X1 - 3, Y1 - 26], [X1 - 28, Y1 - 3], [X0 + 28, Y1 - 3], [X0 + 3, Y1 - 26]], 6), "#DCEBC6", { ...F0, seed: 12 });
  // 먼 산(작고 옅게, 거의 제자리)
  const mt = [...curve([[330, HZ], [378, 250], [420, 220], [458, 256], [498, 234], [578, HZ]]), [330, HZ]];
  sk.fill(mt, "#B5C3D3", { ...F0, seed: 13 }); sk.ink(mt, { w: 5, color: "#7F8FA6", seed: 14, wob: 0.5 });
  sk.ink(dense([[X0 + 4, HZ], [X1 - 4, HZ]]), { w: 4.5, color: "#8FA58A", seed: 15, wob: 0.5 });
  arrow(sk, [[482, 186], [446, 186]], { w: 7, color: ORANGE, straight: true, seed: 17, head: 13, wob: 0.2 });
  // 가까운 전봇대: 앞선 자리(점선)에서 뒤로 크게 밀려났다
  const pole = (x, gh) => {
    const o = gh ? { w: 6, color: GH, dash: [11, 9], wob: 0.2 } : null;
    const draw = (pts, w, sd) => gh ? sk.ink(pts, { ...o, seed: sd }) : pipe(sk, pts, w, "#A9773F", sd);
    draw(dense([[x, Y1 - 8], [x, Y0 + 12]]), 18, 21);
    draw(dense([[x - 70, 104], [x + 70, 104]]), 12, 23);
    draw(dense([[x - 46, 152], [x + 46, 152]]), 10, 25);
  };
  pole(650, true);
  // 가까운 풍경이 뒤로 흐르는 선
  for (const [x, y, l, i] of [[206, 206, 110, 0], [206, 262, 150, 1], [70, 440, 250, 2], [380, 452, 300, 3], [206, 336, 120, 4]]) sk.ink(dense([[x, y], [x + l, y]]), { w: 6, color: i === 2 || i === 3 ? "#A9C58F" : GH, seed: 31 + i, wob: 0.3 });
  pole(164, false);
  arrow(sk, [[620, 398], [214, 398]], { w: 15, color: ORANGE, straight: true, seed: 37, head: 36, wob: 0.3 });
  // 기차 안: 창틀, 손잡이, 좌석 등받이
  thin(sk, 0.8, () => {
    sk.ink(rrect(X0, Y0, X1 - X0, Y1 - Y0, 34), { w: 14, seed: 41, wob: 0.8 });
    for (const [x, i] of [[820, 0], [912, 1]]) {
      sk.ink(dense([[x, 0], [x, 58]]), { w: 7, seed: 45 + i, wob: 0.2 });
      sk.ink(dense([[x - 24, 58], [x + 24, 58], [x + 15, 100], [x - 15, 100], [x - 24, 58]]), { w: 8, seed: 47 + i, wob: 0.3 });
    }
    for (const [x, i] of [[60, 0], [300, 1], [540, 2]]) {
      const back = rrect(x, 532, 190, 170, 26), head = rrect(x + 40, 500, 110, 46, 16);
      sk.fill(back, "#6FA8DC", { ...F0, seed: 51 + i, tex: 0.9, texAng: 1.57 }); sk.ink(back, { w: 10, seed: 54 + i, wob: 0.6 });
      sk.fill(head, "#A9CBEE", { ...F0, seed: 57 + i }); sk.ink(head, { w: 8, seed: 60 + i, wob: 0.5 });
    }
  });
  ground(sk, GY, 65);
  // 학생: 창밖을 가리킨다
  const kx = 866, ks = 0.56;
  const PK = pose({ elL: [-110, -322], haL: [-192, -356], elR: [56, -262], haR: [86, -198], tilt: -0.08 });
  drawFigure(sk, kx, GY, ks, PK, { ...STUDENT, name: "student", flip: -1 });
  return sk;
}

/* ---------- g2u8l1b: 트랙의 맞은편 두 자리에서 본 가까운 깃대. 두 시선이 깃대에서 엇갈려 먼 나무들의 서로 다른 곳에 닿는다 ---------- */
function tree(sk, x, y, r, sd) {
  thin(sk, 0.8, () => {
    sk.ink(dense([[x, y + r * 0.6], [x, y + r * 1.5]]), { w: 9, color: "#8A5A33", seed: sd, wob: 0.3 });
    const c = circ(x, y, r, { over: 0.08, seed: sd + 1, lump: 0.06 });
    sk.fill(c, "#A9D69A", { ...F0, seed: sd + 2 }); sk.ink(c, { w: 6.5, seed: sd + 3, wob: 0.6 });
  });
}
function cutL1b() {
  const sk = new Sk(W, H, { id: "b" });
  const cx = 480, TY = 604, RX = 356, RY = 86, s = 0.5, FY = TY + 4, TREE = 118;
  const ax = cx - RX + 36, bx = cx + RX - 36;
  const handA = [ax + s * 176, FY - s * 352], handB = [bx - s * 176, FY - s * 352], F = [cx, 300];
  // 한 점에서 깃대(F)를 지나 나무 줄 높이까지 곧게 뻗은 시선이 닿는 곳
  const hit = h => { const t = (TREE - h[1]) / (F[1] - h[1]); return [h[0] + (F[0] - h[0]) * t, TREE]; };
  const hA = hit(handA), hB = hit(handB), gap = (hA[0] - hB[0]) / 5;
  // 먼 나무들(작게, 한 줄)
  sk.ink(dense([[20, TREE + 58], [940, TREE + 58]]), { w: 4.5, color: "#8FA58A", seed: 11, wob: 0.6 });
  for (let i = -1; i <= 6; i++) tree(sk, hB[0] + gap * i, TREE, 38, 13 + i * 5);
  // 트랙
  thin(sk, 0.8, () => {
    const outer = ell(cx, TY, RX, RY), inner = ell(cx, TY, RX - 72, RY - 36);
    sk.fill(outer, "#EDB08F", { dx: 0, dy: 0, wob: 0.5, seed: 61 }); sk.fill(inner, "#D2EABF", { dx: 0, dy: 0, wob: 0.4, seed: 62 });
    sk.ink(outer, { w: 9, seed: 63, wob: 0.8 }); sk.ink(inner, { w: 7, seed: 64, wob: 0.6 });
  });
  // 반 바퀴 도는 길
  arrow(sk, ell(cx, TY, RX - 36, RY - 18, Math.PI - 0.42, 0.42), { w: 7, color: GH, dash: [13, 10], seed: 66, head: 22, wob: 0.2 });
  // 두 시선: 깃대에서 엇갈린다
  for (const [h, t, col, i] of [[handA, hA, ORANGE, 0], [handB, hB, BLUE, 1]]) {
    sk.ink(dense([h, [t[0], t[1] + 30]]), { w: 6.5, color: col, dash: [15, 10], seed: 71 + i, wob: 0 });
    sk.ink(circ(t[0], t[1], 50, { over: 0.05, seed: 73 + i }), { w: 8, color: col, seed: 75 + i, wob: 0.4 });
  }
  // 가까운 깃대(트랙 밖)
  thin(sk, 0.85, () => {
    const mound = ell(cx, 488, 44, 12);
    sk.fill(mound, "#C9B79A", { ...F0, seed: 81 }); sk.ink(mound, { w: 6, seed: 82, wob: 0.3 });
    pipe(sk, dense([[cx, 486], [cx, 214]]), 9, "#E9EDF2", 83, 0.3);
    const fl = poly([[cx + 6, 220], [cx + 104, 252], [cx + 6, 290]], 4);
    sk.fill(fl, C.red, { ...F0, seed: 85 }); sk.ink(fl, { w: 7, seed: 86, wob: 0.5 });
    const b = circ(cx, 208, 11, { seed: 87 }); sk.fill(b, C.gold, { ...F0, seed: 88 }); sk.ink(b, { w: 5, seed: 89, wob: 0.3 });
  });
  // 학생: 지금 자리(왼쪽)와 반 바퀴 돈 뒤의 자리(오른쪽, 흐리게)
  drawFigure(sk, ax, FY, s, pose({ elR: [100, -322], haR: [176, -352], elL: [-52, -262], haL: [-80, -198], tilt: 0.05 }), { ...STUDENT, name: "student" });
  faded(sk, 0.42, () => drawFigure(sk, bx, FY, s, pose({ elL: [-100, -322], haL: [-176, -352], elR: [52, -262], haR: [80, -198], tilt: -0.05 }), { ...STUDENT, flip: -1 }));
  return sk;
}

/* ---------- g2u8l2: 같은 손전등. 가까이서는 빛 동그라미가 작고 밝고, 2배 물러서면 지름 2배로 크고 흐리다 ---------- */
function torch(sk, tip, ang, k, sd) {
  sk.at(tip[0], tip[1], k, () => {
    const body = rrect(-132, -17, 98, 34, 8), head = poly([[-40, -17], [-10, -36], [0, -36], [0, 36], [-10, 36], [-40, 17]], 4);
    shape(sk, body, C.red, sd, 6.5); shape(sk, head, STEEL, sd + 2, 6.5);
    sk.ink(dense([[-100, -17], [-100, 17]]), { w: 4, seed: sd + 4, wob: 0.2 });
  }, ang);
}
function cutL2() {
  const sk = new Sk(W, H, { id: "c" });
  const WX = 866, K = 0.22, s = 0.44, DN = 250;
  const rows = [
    { gy: 318, d: DN, col: "#FFDD2E", ca: 0.62, sa: 1, sd: 11 },
    { gy: 676, d: DN * 2, col: "#FFF2A6", ca: 0.5, sa: 0.5, sd: 51 },
  ];
  for (const r of rows) {
    const ty = r.gy - 118, tip = [WX - r.d, ty], ry = K * r.d, rx = ry * 0.44;
    // 벽(비스듬히 본 어두운 벽)
    const wall = poly([[WX - 74, ty - 168], [WX + 78, ty - 196], [WX + 78, r.gy + 22], [WX - 74, r.gy]], 6);
    thin(sk, 0.8, () => { sk.fill(wall, "#6C79A3", { ...F0, seed: r.sd }); sk.ink(wall, { w: 8, seed: r.sd + 1, wob: 0.5 }); });
    // 빛: 퍼져 나가 벽에 동그라미를 만든다
    sk.fill(dense([tip, [WX, ty - ry], ...ell(WX, ty, rx, ry, -Math.PI / 2, Math.PI / 2), [WX, ty + ry], tip], 6), r.col, { dx: 0, dy: 0, wob: 0, seed: r.sd + 2, alpha: r.ca });
    const spot = ell(WX, ty, rx, ry);
    sk.fill(spot, r.col, { dx: 0, dy: 0, wob: 0, seed: r.sd + 3, alpha: r.sa });
    sk.ink(spot, { w: 4, color: mix(r.col, "#B8860B", 0.35), seed: r.sd + 4, wob: 0.2, alpha: Math.min(1, r.sa + 0.3) });
    ground(sk, r.gy, r.sd + 5, 20, WX - 76);
    // 거리 눈금: 위는 한 칸, 아래는 똑같은 칸 둘
    const by = r.gy + 22, n = Math.round(r.d / DN);
    sk.ink(dense([[tip[0], by], [WX - 80, by]]), { w: 6, color: TEAL, seed: r.sd + 6, wob: 0.2 });
    for (let i = 0; i <= n; i++) { const x = tip[0] + (WX - 80 - tip[0]) * i / n; sk.ink(dense([[x, by - 11], [x, by + 11]]), { w: 6, color: TEAL, seed: r.sd + 7 + i, wob: 0 }); }
    // 학생과 손전등
    const hand = [tip[0] - 62 * 0.8, ty], kx = hand[0] - s * 142;
    drawFigure(sk, kx, r.gy, s, pose({ ...local(kx, r.gy, s, { haR: hand, elR: [hand[0] - 34, hand[1] + 22] }), elL: [-52, -262], haL: [-82, -198], tilt: 0.04 }), { ...STUDENT, name: r.d === DN ? "student" : undefined, hands: "L" });
    torch(sk, tip, 0, 0.8, r.sd + 20);
    handDot(sk, hand, C.skin, r.sd + 30, 15 * s + 3);
  }
  // 뒤로 물러섰다
  arrow(sk, [[330, 338], [250, 372], [176, 400]], { w: 7, color: GH, dash: [12, 9], seed: 91, head: 20, wob: 0.2 });
  return sk;
}

/* ---------- g2u8l3: 시상대. 높은 단일수록 더 밝게 빛나는 별 인형 ---------- */
function starDoll(sk, x, y, r, lv, sd) {
  const col = ["#FFD21F", "#FFE48A", "#EFE8CC"][lv], cy = y - r * 1.18;
  if (lv < 2) sk.glow(x, cy, r * (lv ? 1.9 : 2.9), LIT, lv ? 0.5 : 0.95, lv ? 0.3 : 0.35);
  if (lv < 2) for (let i = 0; i < (lv ? 5 : 10); i++) {
    const a = -Math.PI / 2 + (i + (lv ? 0.5 : 0.5)) * Math.PI * 2 / (lv ? 5 : 10), r0 = r * 1.22, r1 = r * (lv ? 1.5 : 1.95);
    sk.ink(dense([[x + r0 * Math.cos(a), cy + r0 * Math.sin(a)], [x + r1 * Math.cos(a), cy + r1 * Math.sin(a)]]), { w: lv ? 5 : 8, color: "#F2A31B", seed: sd + 10 + i, wob: 0.2 });
  }
  for (const sg of [-1, 1]) sk.ink(dense([[x + sg * r * 0.22, cy + r * 0.6], [x + sg * r * 0.3, y]]), { w: 8, seed: sd + 3 + sg, wob: 0.3 });
  const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.56 : r; pts.push([x + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
  shape(sk, poly(pts, 3), col, sd, 8);
}
function cutL3() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 676, R = 64;
  ground(sk, GY, 11);
  const steps = [[110, 318, 458, 1], [318, 526, 346, 0], [526, 734, 548, 2]];
  thin(sk, 0.8, () => { for (const [x0, x1, ty, lv] of steps) { const b = box(x0, ty, x1, GY - 3); sk.fill(b, ["#CFE0F2", "#DCE9F7", "#C3D6EA"][lv], { ...F0, seed: 13 + lv, tex: 0.9, texAng: 1.57 }); sk.ink(b, { w: 10, seed: 17 + lv, wob: 0.6 }); } });
  for (const [x0, x1, ty, lv] of steps) starDoll(sk, (x0 + x1) / 2, ty - 4, R, lv, 31 + lv * 30);
  // 학생: 가장 높은 단의 별을 가리킨다
  const kx = 856, ks = 0.56;
  drawFigure(sk, kx, GY, ks, pose({ elL: [-110, -326], haL: [-192, -366], elR: [56, -262], haR: [86, -198], tilt: -0.1 }), { ...STUDENT, name: "student", flip: -1 });
  return sk;
}

/* ---------- g2u8l3b: 한 줄 위에 나란히 세운 조명등, 손전등, 촛불. 원래 자리는 점선(조명등은 멀리, 촛불은 가까이) ---------- */
// 세 광원은 (x, y) = 바닥 가운데. gh = 원래 자리(점선 테만)
function flood(sk, x, y, k, sd, gh) {
  const st = gh ? { w: 6 / k, color: GH, dash: [9 / k, 8 / k], wob: 0.2 } : null, hy = -236;
  if (!gh) sk.glow(x, y + hy * k, 250 * k, LIT, 1, 0.3);
  sk.at(x, y, k, () => {
    const line = (pts, w, i) => sk.ink(pts, st ? { ...st, seed: sd + i } : { w, seed: sd + i, wob: 0.4 });
    line(dense([[-66, 0], [66, 0]]), 11, 0);
    line(dense([[0, 0], [0, hy + 76]]), 11, 1);
    const house = rrect(-92, hy - 76, 184, 152, 14), hood = poly([[-104, hy - 76], [104, hy - 76], [84, hy - 108], [-84, hy - 108]], 4), lens = rrect(-72, hy - 56, 144, 112, 8);
    if (gh) { sk.ink(house, { ...st, seed: sd + 2 }); sk.ink(hood, { ...st, seed: sd + 3 }); return; }
    shape(sk, house, "#55606E", sd + 2, 9); shape(sk, hood, "#3E4652", sd + 4, 8);
    shape(sk, lens, "#FFE633", sd + 6, 7);
    for (const dx of [-24, 24]) sk.ink(dense([[dx, hy - 54], [dx, hy + 54]]), { w: 4, color: "#F2B81B", seed: sd + 8 + dx, wob: 0.2 });
    sk.ink(dense([[-70, hy], [70, hy]]), { w: 4, color: "#F2B81B", seed: sd + 9, wob: 0.2 });
    for (const [a, i] of [[-0.35, 0], [0.35, 1], [Math.PI - 0.35, 2], [Math.PI + 0.35, 3]]) sk.ink(dense([[122 * Math.cos(a), hy + 106 * Math.sin(a)], [168 * Math.cos(a), hy + 146 * Math.sin(a)]]), { w: 8, color: "#F2A31B", seed: sd + 12 + i, wob: 0.2 });
  });
}
function torchUp(sk, x, y, k, sd) {
  sk.glow(x, y - 146 * k, 78 * k, LIT, 0.7, 0.2);
  sk.at(x, y, k, () => {
    shape(sk, rrect(-19, -92, 38, 92, 8), C.red, sd, 7);
    shape(sk, poly([[-19, -90], [-38, -122], [38, -122], [19, -90]], 4), STEEL, sd + 2, 7);
    shape(sk, ell(0, -122, 38, 10), "#FFE98A", sd + 4, 5);
    for (const [a, i] of [[-1.9, 0], [-1.24, 1]]) sk.ink(dense([[52 * Math.cos(a), -128 + 52 * Math.sin(a)], [74 * Math.cos(a), -128 + 74 * Math.sin(a)]]), { w: 5, color: "#F2A31B", seed: sd + 6 + i, wob: 0.2 });
  });
}
function candle(sk, x, y, k, sd, gh) {
  const st = gh ? { w: 6 / k, color: GH, dash: [9 / k, 8 / k], wob: 0.2 } : null;
  if (!gh) sk.glow(x, y - 98 * k, 34 * k, LIT, 0.6, 0.2);
  sk.at(x, y, k, () => {
    const body = rrect(-17, -70, 34, 70, 6), fl = curve([[0, -122], [11, -96], [8, -82], [0, -78], [-8, -82], [-11, -96]], true, 3);
    if (gh) { sk.ink(body, { ...st, seed: sd }); sk.ink(fl, { ...st, seed: sd + 1 }); return; }
    shape(sk, body, "#FBF3DF", sd, 6.5);
    sk.ink(dense([[0, -70], [0, -80]]), { w: 4, seed: sd + 2, wob: 0 });
    shape(sk, fl, "#FFB03A", sd + 3, 5);
  });
}
function cutL3b() {
  const sk = new Sk(W, H, { id: "e" });
  const LY = 500, GY = 690;
  // 같은 거리의 줄
  sk.ink(dense([[40, LY + 2], [740, LY - 2]]), { w: 13, color: TEAL, seed: 11, wob: 0.6 });
  // 원래 자리(점선): 조명등은 줄 뒤 멀리, 촛불은 줄 앞 가까이
  flood(sk, 520, 206, 0.5, 21, true);
  candle(sk, 716, 694, 1.3, 25, true);
  arrow(sk, [[452, 112], [408, 120], [372, 150]], { w: 6.5, color: GH, dash: [11, 8], seed: 27, head: 18, wob: 0.2 });
  arrow(sk, [[668, 566], [652, 544], [634, 522]], { w: 6.5, color: GH, dash: [11, 8], seed: 31, head: 18, wob: 0.2 });
  // 줄 위에 나란히 선 세 광원
  flood(sk, 196, LY, 1, 41);
  torchUp(sk, 448, LY, 1, 71);
  candle(sk, 606, LY, 1, 85);
  // 쌤: 줄을 가리킨다
  const tx = 868, ts = 0.56;
  drawFigure(sk, tx, GY, ts, pose({ elL: [-100, -306], haL: [-176, -316], elR: [52, -262], haR: [82, -198], tilt: -0.05 }), { ...TEACHER, name: "teacher" });
  ground(sk, GY, 95, 790, 946);
  return sk;
}

/* ---------- g2u8l4: 대장간. 화덕 속 쇠는 노랗게, 막 꺼낸 쇠는 주황으로, 모루 위에서 식는 쇠는 검붉게 ---------- */
function iron(sk, x, y, rot, col, gcol, gr, ga, sd) {
  if (gr) sk.glow(x, y, gr, gcol, ga, 0.25);
  sk.at(x, y, 1, () => { const b = rrect(-76, -22, 152, 44, 10); sk.fill(b, col, { ...F0, seed: sd }); sk.ink(b, { w: 7, seed: sd + 1, wob: 0.4 }); }, rot);
}
function cutL4() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 676, SMITH = { hair: "kerchief", capColor: "#3F7CC0", coat: { color: "#B98A5A", seam: "#7A5632", len: 44 }, seed: 61 };
  ground(sk, GY, 11);
  // 화덕
  thin(sk, 0.8, () => {
    const ch = box(132, 26, 212, 176), hood = poly([[52, 300], [112, 172], [232, 172], [292, 300]], 6), body = box(30, 300, 314, GY - 3);
    shape(sk, ch, "#8E9AAB", 13, 9); shape(sk, hood, "#8E9AAB", 15, 9);
    sk.fill(body, "#C4775A", { ...F0, seed: 17, tex: 0.9, texAng: 0 }); sk.ink(body, { w: 10, seed: 18, wob: 0.6 });
    const open = dense([[72, 566], [72, 452], ...ell(172, 452, 100, 66, Math.PI, Math.PI * 2), [272, 566], [72, 566]], 5);
    sk.fill(open, "#3B2A22", { ...F0, seed: 19 }); sk.ink(open, { w: 8, seed: 20, wob: 0.5 });
  });
  sk.glow(172, 500, 120, "#FF9A2E", 0.9, 0.2);
  for (const [x, y, r, i] of [[104, 548, 17, 0], [140, 554, 15, 1], [176, 550, 18, 2], [214, 554, 15, 3], [246, 548, 16, 4]]) { const c = circ(x, y, r, { over: 0, seed: 23 + i, lump: 0.08 }); sk.fill(c, i % 2 ? "#E0503A" : "#F58A2E", { ...F0, seed: 28 + i }); sk.ink(c, { w: 4, seed: 33 + i, wob: 0.3 }); }
  // 화덕 속의 쇠: 가장 뜨겁다(노랗고 밝다)
  iron(sk, 250, 486, 0, "#FFE84D", "#FFF3A0", 150, 1, 41);
  // 모루와 식는 쇠: 검붉다
  thin(sk, 0.8, () => {
    const anv = poly([[640, 548], [716, 536], [716, 520], [912, 520], [912, 562], [856, 566], [840, 620], [884, 640], [884, GY - 3], [716, GY - 3], [716, 640], [760, 620], [744, 566], [716, 566]], 5);
    sk.fill(anv, "#6B7480", { ...F0, seed: 51, tex: 0.9 }); sk.ink(anv, { w: 10, seed: 52, wob: 0.6 });
  });
  iron(sk, 812, 497, 0, "#7E2A1F", "#C0392B", 80, 0.35, 55);
  // 대장장이: 집게로 막 꺼낸 쇠(주황)를 들었다
  const tx = 556, ts = 0.6, hand = [tx - ts * 130, GY - ts * 322], pc = [404, 318];
  drawFigure(sk, tx, GY, ts, pose({ elL: [-84, -282], haL: [-130, -322], elR: [58, -262], haR: [100, -206], tilt: -0.06 }), { ...SMITH, name: "smith", hands: false });
  iron(sk, pc[0], pc[1], -0.42, "#F58A2E", "#FFB03A", 112, 0.75, 61);
  thin(sk, 0.8, () => { for (const [d, i] of [[-13, 0], [13, 1]]) sk.ink(dense([[hand[0] + 16 + d * 0.5, hand[1] + 22 - d], [pc[0] + 44 + d, pc[1] - 2 - d * 1.2]]), { w: 8, seed: 65 + i, wob: 0.3 }); });
  handDot(sk, hand, C.skin, 71, 15 * ts + 2);
  // 다른 손에는 망치
  const h2 = [tx + ts * 100, GY - ts * 206];
  thin(sk, 0.8, () => {
    sk.ink(dense([[h2[0] - 8, h2[1] - 12], [h2[0] + 40, h2[1] + 62]]), { w: 9, color: "#A9773F", seed: 75, wob: 0.3 });
    sk.at(h2[0] + 44, h2[1] + 70, 1, () => shape(sk, rrect(-34, -17, 68, 34, 6), "#6B7480", 77, 7), 0.58);
  });
  handDot(sk, h2, C.skin, 81, 15 * ts + 2);
  return sk;
}

/* ---------- g2u8l5: 넓고 납작한 호떡. 가운데가 볼록하고, 깨 한 알은 가장자리 쪽에 있다 ---------- */
function cutL5() {
  const sk = new Sk(W, H, { id: "g" });
  const GY = 690, cx = 392, cy = 492, HW = 332;
  // 옆에서 본 호떡: 납작한 원반이고 가운데만 위아래로 볼록하다
  const edge = dx => 17 * Math.sqrt(Math.max(0, 1 - (dx / HW) ** 2)), bul = dx => Math.exp(-((dx / 112) ** 2));
  const top = dx => cy - edge(dx) - 64 * bul(dx), bot = dx => cy + edge(dx) + 28 * bul(dx);
  // 도마와 상
  thin(sk, 0.8, () => {
    const brd = rrect(22, cy + 48, 760, 28, 8);
    sk.fill(brd, C.wood, { ...F0, seed: 11, tex: 0.8, texAng: 0.02 }); sk.ink(brd, { w: 9, seed: 12, wob: 0.6 });
    for (const [x, i] of [[70, 0], [734, 1]]) sk.ink(dense([[x, cy + 76], [x, GY]]), { w: 11, seed: 13 + i, wob: 0.4 });
  });
  const out = [];
  for (let dx = -HW; dx <= HW; dx += 4) out.push([cx + dx, top(dx)]);
  for (let dx = HW; dx >= -HW; dx -= 4) out.push([cx + dx, bot(dx)]);
  out.push(out[0]);
  sk.fill(out, "#E2A450", { dx: 0, dy: 0, wob: 0.3, seed: 21, tex: 0.9, texAng: 0 });
  // 구운 자국(노릇한 얼룩)
  for (const [dx, f, rx, i] of [[-250, 0.5, 34, 0], [-150, 0.42, 30, 1], [-52, 0.3, 30, 2], [40, 0.5, 34, 3], [120, 0.38, 26, 4], [270, 0.5, 26, 5], [-10, 0.78, 44, 6]]) {
    const y = top(dx) + (bot(dx) - top(dx)) * f;
    sk.fill(ell(cx + dx, y, rx, Math.min(11, (bot(dx) - top(dx)) * 0.2)), "#A9652B", { ...F0, seed: 23 + i, alpha: 0.85 });
  }
  sk.ink(curve([[cx - 60, top(-60) + 12], [cx - 20, top(-20) + 10], [cx + 24, top(24) + 11]]), { w: 6, color: "#F6CF86", seed: 31, wob: 0.3 });
  sk.ink(out, { w: 8.5, seed: 22, wob: 0.6 });
  steam(sk, cx, top(0) - 22, 3, 70, 33, 44);
  // 깨 한 알: 가운데가 아니라 가장자리 쪽
  const sdx = HW * 0.62, sx = cx + sdx, sy = top(sdx) - 9;
  sk.ink(circ(sx, sy, 38, { over: 0.05, seed: 41 }), { w: 7, color: TEAL, seed: 42, wob: 0.4 });
  sk.at(sx, sy, 1, () => { const sd = curve([[-20, 0], [-5, -11], [17, -6], [20, 2], [3, 11], [-15, 7]], true, 3); sk.fill(sd, "#FFFBEF", { ...F0, seed: 43 }); sk.ink(sd, { w: 5.5, seed: 44, wob: 0.2 }); }, -0.2);
  // 학생: 손끝이 깨를 가리킨다
  const kx = 836, ks = 0.64, hand = [sx + 70, sy - 26];
  drawFigure(sk, kx, GY, ks, pose({ ...local(kx, GY, ks, { haL: hand, elL: [hand[0] + 76, hand[1] + 26] }), elR: [56, -262], haR: [86, -198], tilt: -0.1 }), { ...STUDENT, name: "student", flip: -1 });
  ground(sk, GY, 51, 760, 946);
  return sk;
}

/* ---------- g2u8l6: 듬성듬성 흩어진 아이들 몇 명과, 공 모양으로 빽빽이 모인 많은 아이들 ---------- */
const BLUES = ["#3F7CC0", "#6FB3EA", "#2F8EE0", "#8CC8EC"], REDS = ["#E0503A", "#F08A2E", "#D9634A", "#F2A65A", "#C9432F"];
function cutL6() {
  const sk = new Sk(W, H, { id: "h" });
  // 왼쪽: 흩어져 노는 아이들 여섯
  const loose = [
    [96, 236, { elL: [-90, -300], haL: [-130, -384], elR: [90, -300], haR: [130, -384] }],
    [318, 208, { elR: [96, -330], haR: [168, -372] }],
    [420, 420, { elL: [-96, -300], haL: [-150, -260], elR: [96, -300], haR: [150, -260] }],
    [214, 452, { elL: [-96, -330], haL: [-168, -372] }],
    [78, 652, { elR: [90, -300], haR: [130, -384] }],
    [352, 672, { elL: [-90, -300], haL: [-130, -384], elR: [96, -300], haR: [150, -260] }],
  ];
  thin(sk, 1.55, () => loose.forEach(([x, y, p, i]) => {
    const n = loose.findIndex(v => v[0] === x);
    drawFigure(sk, x, y, 0.33, pose({ ...p, tilt: (n % 2 ? 0.08 : -0.08) }), { hair: n % 2 ? "knit" : "cap", capColor: BLUES[n % 4], brimColor: mix(BLUES[n % 4], "#000000", 0.18), seed: 31 + n * 10, flip: n % 3 ? 1 : -1, name: n === 0 ? "student" : undefined, tex: false });
  }));
  // 가운데 가름선
  sk.ink(dense([[484, 60], [484, 660]]), { w: 4.5, color: C.grayLight, dash: [12, 12], seed: 91, wob: 0 });
  // 오른쪽: 공 모양으로 빽빽이 모인 아이들
  const cx = 722, cy = 348, RR = 196, N = 46, hs = 0.275, pts = [];
  for (let i = 0; i < N; i++) { const r = RR * Math.sqrt((i + 0.5) / N), a = i * 2.39996; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a) * 0.96]); }
  pts.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  thin(sk, 1.5, () => pts.forEach(([x, y], i) => {
    sk.ink(dense([[x, y + 20], [x, y + 62]]), { w: 5, seed: 101 + i, wob: 0.2 });
    for (const sg of [-1, 1]) sk.ink(dense([[x, y + 62], [x + sg * 11, y + 92]]), { w: 5, seed: 201 + i * 2 + sg, wob: 0.2 });
    sk.save(); sk.translate(x, y); sk.scale(hs);
    drawHead(sk, { hair: i % 3 ? "knit" : "cap", capColor: REDS[(i * 7) % 5], brimColor: mix(REDS[(i * 7) % 5], "#000000", 0.2), seed: 300 + i * 7, flip: i % 2 ? 1 : -1, tex: false });
    sk.restore();
  }));
  return sk;
}

/* ---------- g2u8l6b: 밤의 안개 낀 길. 가로등 둘레의 안개는 환하고, 가로등 앞을 가린 짙은 안개는 검다 ---------- */
function lamp(sk, x, hy, gy, sd) {
  thin(sk, 0.8, () => {
    pipe(sk, dense([[x, gy - 3], [x, hy + 44]]), 9, "#B4BDCA", sd, 0.3);
    const cap = poly([[x - 46, hy - 34], [x + 46, hy - 34], [x + 30, hy - 56], [x - 30, hy - 56]], 4);
    sk.fill(cap, "#7F8FA6", { ...F0, seed: sd + 2 }); sk.ink(cap, { w: 6, seed: sd + 3, wob: 0.3 });
    const b = circ(x, hy, 36, { over: 0.05, seed: sd + 4 });
    sk.fill(b, "#FFE84D", { ...F0, seed: sd + 5 }); sk.ink(b, { w: 6, seed: sd + 6, wob: 0.4 });
    const base = rrect(x - 26, gy - 30, 52, 28, 6);
    sk.fill(base, "#7F8FA6", { ...F0, seed: sd + 7 }); sk.ink(base, { w: 7, seed: sd + 8, wob: 0.3 });
  });
}
function cutL6b() {
  const sk = new Sk(W, H, { id: "i" });
  const GY = 690, BY = 372, HY = 176, LX = 236, DX = 700;
  nightBand(sk, BY, 11);
  ground(sk, GY, 13);
  // 왼쪽: 가로등 둘레의 옅은 안개가 빛을 받아 환하다
  sk.glow(LX, HY, 232, "#FFF3B0", 0.95, 0.2);
  for (const [dx, dy, r, i] of [[-120, -30, 66, 0], [100, -54, 70, 1], [-70, 76, 74, 2], [110, 62, 68, 3], [-10, -100, 62, 4], [14, 122, 58, 5], [-150, 40, 50, 6], [160, 0, 52, 7], [50, -110, 50, 8]]) sk.fill(circ(LX + dx, HY + dy, r, { over: 0, seed: 21 + i, lump: 0.1 }), "#FFF8DC", { dx: 0, dy: 0, wob: 0.6, seed: 27 + i, alpha: 0.42 });
  lamp(sk, LX, HY, GY, 41);
  // 오른쪽: 가로등 앞을 가린 짙은 안개 덩어리는 검게 보인다(둘레로 빛이 샌다)
  sk.glow(DX, HY, 214, "#FFF3B0", 0.95, 0.3);
  lamp(sk, DX, HY, GY, 61);
  for (const [a, i] of [[-2.75, 0], [-2.2, 1], [-0.94, 2], [-0.4, 3]]) sk.ink(dense([[DX + 62 * Math.cos(a), HY - 8 + 62 * Math.sin(a)], [DX + 104 * Math.cos(a), HY - 8 + 104 * Math.sin(a)]]), { w: 7, color: "#FFE84D", seed: 65 + i, wob: 0.2 });
  const blob = [[-128, 44, 46], [-70, 30, 60], [-4, 40, 66], [64, 34, 58], [122, 48, 44], [-30, 76, 50], [40, 80, 46], [168, 62, 28], [-170, 60, 26]];
  blob.forEach(([dx, dy, r], i) => sk.fill(circ(DX + dx, HY + dy, r + 5, { over: 0, seed: 71 + i, lump: 0.1 }), "#0E1222", { dx: 0, dy: 0, wob: 0.5, seed: 77 + i }));
  blob.forEach(([dx, dy, r], i) => sk.fill(circ(DX + dx, HY + dy, r, { over: 0, seed: 71 + i, lump: 0.1 }), "#262C40", { dx: 0, dy: 0, wob: 0.5, seed: 77 + i }));
  // 길 위에 깔린 안개
  for (const [x0, x1, y, i] of [[30, 330, 470, 0], [560, 930, 452, 1], [120, 400, 560, 2], [600, 900, 584, 3]]) sk.ink(wavy([x0, y], [x1, y], 8, 3), { w: 8, color: "#C9CED6", seed: 85 + i, wob: 0 });
  // 학생: 검게 보이는 안개 덩어리를 가리킨다
  const kx = 474, ks = 0.5;
  drawFigure(sk, kx, GY, ks, pose({ elR: [108, -330], haR: [190, -376], elL: [-52, -262], haL: [-82, -198], tilt: 0.1 }), { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- g2u8l7: 오븐 속에서 부푼 건포도 빵. 건포도 사이는 모두 벌어지고 건포도 크기는 그대로 ---------- */
const RAISINS = [[-0.62, 0.26], [-0.32, 0.6], [0.02, 0.82], [0.14, 0.38], [0.48, 0.6], [0.7, 0.22], [-0.16, 0.13]];
function loaf(sk, cx, by, w, h, sd, gh) {
  const out = dense([[cx - w / 2 + 8, by], [cx - w / 2, by - h * 0.36], ...ell(cx, by - h * 0.36, w / 2, h * 0.64, Math.PI, Math.PI * 2), [cx + w / 2 - 8, by], [cx - w / 2 + 8, by]], 5);
  if (gh) { sk.fill(out, "#FBF4E2", { ...F0, seed: sd }); sk.ink(out, { w: 5.5, color: GH, dash: [11, 9], seed: sd + 1, wob: 0.3 }); }
  else { sk.fill(out, "#E9B865", { dx: 0, dy: 0, wob: 0.4, seed: sd, tex: 0.9, texAng: 0.3 }); sk.ink(out, { w: 8, seed: sd + 1, wob: 0.7 }); }
  RAISINS.forEach(([u, v], i) => {
    const r = circ(cx + u * w / 2, by - v * h, 15, { over: 0.05, seed: sd + 5 + i, lump: 0.09 });
    sk.fill(r, "#5B3350", { ...F0, seed: sd + 15 + i }); sk.ink(r, { w: 4.5, seed: sd + 25 + i, wob: 0.3 });
  });
}
function cutL7() {
  const sk = new Sk(W, H, { id: "j" });
  const GY = 690, K = 1.85, DW = 214, DH = 128;
  ground(sk, GY, 11, 14, 400);
  // 오븐
  thin(sk, 0.8, () => {
    const body = rrect(404, 96, 530, 594, 24);
    sk.fill(body, "#DDE3EA", { ...F0, seed: 13 }); sk.ink(body, { w: 11, seed: 14, wob: 0.7 });
    for (const [x, i] of [[470, 0], [540, 1], [868, 2]]) { const c = circ(x, 146, 19, { over: 0.05, seed: 15 + i }); sk.fill(c, i === 2 ? C.red : C.white, { ...F0, seed: 18 + i }); sk.ink(c, { w: 6, seed: 21 + i, wob: 0.3 }); }
    const win = rrect(436, 198, 466, 440, 22);
    sk.fill(win, "#FFF1CC", { ...F0, seed: 25 }); sk.ink(win, { w: 9, seed: 26, wob: 0.6 });
    sk.ink(dense([[448, 588], [890, 588]]), { w: 8, color: "#7F8FA6", seed: 27, wob: 0.3 });
    sk.ink(dense([[520, 668], [820, 668]]), { w: 10, seed: 28, wob: 0.3 });
  });
  steam(sk, 669, 322, 3, 66, 31, 60, "#E8604C");
  // 부푼 빵
  loaf(sk, 669, 584, DW * K, DH * K, 41);
  // 부풀기 전의 작은 반죽(점선): 건포도 크기는 같다
  loaf(sk, 190, 262, DW, DH, 81, true);
  arrow(sk, [[316, 214], [372, 222], [424, 262]], { w: 8, color: TEAL, seed: 121, head: 22, wob: 0.3 });
  // 학생: 부푼 빵을 가리킨다
  const kx = 190, ks = 0.54;
  drawFigure(sk, kx, GY, ks, pose({ elR: [100, -318], haR: [178, -344], elL: [-52, -262], haL: [-82, -198], tilt: 0.06 }), { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- g2u8l8: 옥상에서 올려다본 밤하늘. 우주 정거장, 인공위성, 우주 망원경, 탐사선이 서로 다른 높이에 ---------- */
// 밤하늘 띠 안의 물체는 밝은 테로 그린다
const LN = { color: PALE, wob: 0.3 };
const panel = (sk, x0, y0, x1, y1, col, sd, n = 2) => {
  const p = box(x0, y0, x1, y1); sk.fill(p, col, { ...F0, seed: sd }); sk.ink(p, { ...LN, w: 5, seed: sd + 1 });
  for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n; sk.ink(dense([[x, y0], [x, y1]]), { ...LN, w: 3, seed: sd + 1 + i }); }
};
function station(sk, x, y, k, sd) {
  sk.at(x, y, k, () => {
    sk.ink(dense([[-150, 0], [150, 0]]), { ...LN, w: 7, seed: sd });
    for (const [px, i] of [[-150, 0], [-96, 1], [96, 2], [150, 3]]) { panel(sk, px - 20, -78, px + 20, -12, "#E2B23C", sd + 2 + i * 6, 1); panel(sk, px - 20, 12, px + 20, 78, "#E2B23C", sd + 5 + i * 6, 1); }
    const m1 = rrect(-52, -20, 104, 40, 14), m2 = rrect(-17, -62, 34, 124, 12);
    sk.fill(m2, "#C9D2DE", { ...F0, seed: sd + 30 }); sk.ink(m2, { ...LN, w: 5, seed: sd + 31 });
    sk.fill(m1, "#E9EDF2", { ...F0, seed: sd + 32 }); sk.ink(m1, { ...LN, w: 5, seed: sd + 33 });
    for (const dx of [-28, 0, 28]) sk.dot(dx, 0, 5, "#4D7FD1");
  }, -0.1);
}
function sat(sk, x, y, k, sd) {
  sk.at(x, y, k, () => {
    for (const sg of [-1, 1]) { sk.ink(dense([[sg * 24, 0], [sg * 40, 0]]), { ...LN, w: 6, seed: sd + sg }); panel(sk, sg > 0 ? 40 : -104, -22, sg > 0 ? 104 : -40, 22, "#4D7FD1", sd + 3 + sg * 2, 2); }
    const b = rrect(-25, -27, 50, 54, 9);
    sk.fill(b, "#F2D36B", { ...F0, seed: sd + 8 }); sk.ink(b, { ...LN, w: 5, seed: sd + 9 });
    sk.ink(dense([[0, 27], [0, 44]]), { ...LN, w: 5, seed: sd + 10 });
    sk.ink(curve([[-20, 42], [0, 56], [20, 42]]), { ...LN, w: 6, seed: sd + 11 });
  }, -0.22);
}
function scope(sk, x, y, k, sd) {
  sk.at(x, y, k, () => {
    for (const sg of [-1, 1]) panel(sk, -26, sg > 0 ? 34 : -84, 26, sg > 0 ? 84 : -34, "#4D7FD1", sd + 3 + sg * 2, 1);
    const tube = dense([[-74, -30], [62, -30], ...ell(62, 0, 13, 30, -Math.PI / 2, Math.PI / 2), [-74, 30], [-74, -30]], 4);
    sk.fill(tube, "#D5DAE2", { ...F0, seed: sd + 8 }); sk.ink(tube, { ...LN, w: 5, seed: sd + 9 });
    const mouth = ell(62, 0, 13, 30);
    sk.fill(mouth, "#1D2444", { ...F0, seed: sd + 10 }); sk.ink(mouth, { ...LN, w: 4.5, seed: sd + 11 });
    sk.ink(dense([[-26, -30], [-26, 30]]), { ...LN, w: 3.5, seed: sd + 12 });
    const lid = poly([[62, -30], [98, -58], [106, -48], [72, -24]], 3);
    sk.fill(lid, "#D5DAE2", { ...F0, seed: sd + 13 }); sk.ink(lid, { ...LN, w: 4.5, seed: sd + 14 });
  }, -0.5);
}
function probe(sk, x, y, k, sd) {
  sk.at(x, y, k, () => {
    sk.ink(dense([[-8, 16], [-70, 58]]), { ...LN, w: 5, seed: sd });
    sk.ink(dense([[10, 16], [52, 70]]), { ...LN, w: 5, seed: sd + 1 });
    const b = rrect(-22, -2, 44, 26, 6);
    sk.fill(b, "#F2D36B", { ...F0, seed: sd + 2 }); sk.ink(b, { ...LN, w: 5, seed: sd + 3 });
    const dish = dense([...ell(0, -4, 44, 40, Math.PI, Math.PI * 2), [-44, -4]], 4);
    sk.fill(dish, "#E9EDF2", { ...F0, seed: sd + 4 }); sk.ink(dish, { ...LN, w: 5, seed: sd + 5 });
    sk.ink(dense([[0, -44], [0, -62]]), { ...LN, w: 4.5, seed: sd + 6 });
  }, 0.75);
}
function cutL8() {
  const sk = new Sk(W, H, { id: "k" });
  const GY = 690, BY = 408;
  nightBand(sk, BY, 11);
  for (const [x, y, r, i] of [[60, 60, 4, 0], [210, 150, 3, 1], [130, 300, 3.5, 2], [380, 60, 3, 3], [560, 366, 3, 4], [720, 250, 3.5, 5], [900, 300, 4, 6], [820, 370, 3, 7], [150, 380, 3, 8], [520, 200, 2.5, 9]]) sk.dot(x, y, r, "#DCE3F5");
  // 지구 둘레를 도는 길(높이가 서로 다르다)
  const orbit = (y0, sag, sd) => sk.ink(curve([[-10, y0 + sag], [240, y0 + sag * 0.25], [480, y0], [720, y0 + sag * 0.25], [970, y0 + sag]]), { w: 3.5, color: "#9FB0E6", dash: [10, 11], seed: sd, wob: 0 });
  orbit(316, 56, 21); orbit(226, 48, 22); orbit(150, 40, 23);
  station(sk, 318, 322, 0.8, 31);
  sat(sk, 548, 226, 0.78, 81);
  scope(sk, 706, 158, 0.72, 101);
  // 탐사선: 가장 멀리, 지구를 떠나 날아간다
  sk.ink(dense([[770, 190], [832, 96]]), { w: 4.5, color: "#FFD84A", dash: [9, 10], seed: 121, wob: 0 });
  arrow(sk, [[908, 40], [946, 28]], { w: 5.5, color: "#FFD84A", straight: true, seed: 123, head: 15, wob: 0.1 });
  probe(sk, 862, 64, 0.95, 131);
  // 옥상 난간
  thin(sk, 0.8, () => {
    sk.ink(dense([[14, 584], [946, 580]]), { w: 8, color: STEEL, seed: 141, wob: 0.5 });
    for (let x = 40, i = 0; x < 940; x += 112, i++) sk.ink(dense([[x, 584], [x, GY - 4]]), { w: 6, color: STEEL, seed: 143 + i, wob: 0.3 });
  });
  ground(sk, GY, 171);
  // 학생: 밤하늘을 올려다보며 가리킨다
  const kx = 130, ks = 0.5;
  drawFigure(sk, kx, GY, ks, pose({ elR: [104, -336], haR: [186, -384], elL: [-52, -262], haL: [-82, -198], tilt: -0.2, head: [-10, -434] }), { ...STUDENT, name: "student" });
  return sk;
}

export function cuts() {
  const T = "star";
  return [
    { name: "g2u8l1", theme: T, orig: null, sk: cutL1(), alt: "달리는 기차의 좌석 옆에서 스틱맨 학생이 큰 창밖을 가리키는데, 가까운 전봇대는 점선으로 남은 앞선 자리에서 뒤로 크게 밀려나 있고 먼 산은 거의 제자리에 있는 장면", cap: "가까운 전봇대는 휙 밀려나는데 먼 산은 거의 그대로예요" },
    { name: "g2u8l1b", theme: T, orig: null, sk: cutL1b(), alt: "둥근 트랙의 맞은편 두 자리에 선 같은 스틱맨 학생이 트랙 밖의 가까운 깃대를 가리키고, 두 시선이 깃대에서 엇갈려 멀리 있는 나무들 가운데 서로 다른 나무에 닿는 장면", cap: "트랙 맞은편에서 보면 깃대가 다른 나무 앞에 겹쳐 보여요" },
    { name: "g2u8l2", theme: T, orig: null, sk: cutL2(), alt: "스틱맨 학생이 손전등으로 벽을 비추는데, 가까이 섰을 때는 벽의 빛 동그라미가 작고 밝고, 두 배 거리로 물러섰을 때는 지름이 두 배로 크고 흐린 장면", cap: "두 배 물러서니 빛 동그라미가 커지면서 흐려졌어요" },
    { name: "g2u8l3", theme: T, orig: null, sk: cutL3(), alt: "달리기 시상대의 가장 높은 단에 가장 밝게 빛나는 별 인형이, 낮은 단으로 갈수록 덜 빛나는 별 인형이 서 있고 스틱맨 학생이 가장 높은 단을 가리키는 장면", cap: "시상대의 1등처럼, 등급의 숫자가 작을수록 더 밝은 별이에요" },
    { name: "g2u8l3b", theme: T, orig: null, sk: cutL3b(), alt: "스틱맨 쌤이 바닥에 그은 한 줄 위에 큰 조명등, 손전등, 촛불을 나란히 세워 놓았고, 조명등이 멀리 있던 자리와 촛불이 가까이 있던 자리가 점선으로 남아 있는 장면", cap: "같은 거리에 세우니 조명등이 촛불보다 훨씬 밝은 것이 드러나요" },
    { name: "g2u8l4", theme: T, orig: null, sk: cutL4(), alt: "대장간에서 대장장이가 집게로 주황색으로 달아오른 쇳덩이를 들고 있고, 화덕 속의 쇠는 노랗게 빛나며 모루 위에서 식는 쇠는 검붉은 장면", cap: "화덕 속 쇠는 노랗고, 꺼낸 쇠는 주황, 식는 쇠는 검붉어요" },
    { name: "g2u8l5", theme: T, orig: null, sk: cutL5(), alt: "옆에서 본 넓고 납작한 호떡이 가운데만 위아래로 볼록하고, 가장자리 쪽에 얹힌 깨 한 알을 스틱맨 학생이 손끝으로 가리키는 장면", cap: "가운데가 볼록한 납작한 원반, 태양계는 이 깨처럼 중심에서 벗어나 있어요" },
    { name: "g2u8l6", theme: T, orig: null, sk: cutL6(), alt: "왼쪽에는 아이들 여섯 명이 듬성듬성 흩어져 놀고, 오른쪽에는 많은 아이들이 공 모양으로 빽빽하게 모여 선 장면", cap: "왼쪽은 몇 명이 듬성듬성, 오른쪽은 여럿이 공 모양으로 빽빽이 모였어요" },
    { name: "g2u8l6b", theme: T, orig: null, sk: cutL6b(), alt: "밤의 안개 낀 길에서 한 가로등 둘레의 안개는 빛을 받아 환하게 보이고, 다른 가로등 앞을 가린 짙은 안개 덩어리는 검게 보이는 장면", cap: "가로등 둘레의 안개는 환하고, 불빛을 가린 짙은 안개는 검게 보여요" },
    { name: "g2u8l7", theme: T, orig: null, sk: cutL7(), alt: "오븐 속에서 건포도 빵이 부풀어 올라, 점선으로 그린 부풀기 전의 작은 반죽과 견주면 건포도 사이가 모두 벌어졌고 건포도의 크기는 그대로인 장면", cap: "빵이 부풀자 건포도 사이가 모두 벌어졌어요. 건포도 크기는 그대로예요" },
    { name: "g2u8l8", theme: T, orig: null, sk: cutL8(), alt: "옥상에서 스틱맨 학생이 밤하늘을 가리키고, 하늘에는 우주 정거장, 인공위성, 우주 망원경이 서로 다른 높이에서 지구 둘레를 돌며 탐사선은 가장 멀리 날아가는 장면", cap: "정거장, 인공위성, 망원경은 지구 둘레를 돌고 탐사선은 멀리 떠나요" },
  ];
}
