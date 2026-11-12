// 중1 과학 u4l3 도입 만화(v2): 겨울 하루, 물의 여섯 가지 변신(응고, 융해, 기화, 승화, 액화, 상태 변화). 7컷. 배선 전.
// 조사와 콘티는 qa/sketch/research/u4l3.md.
//   겨울 하루 안에 실제로 일어나는 일만 쓰고, 바뀌는 방향이 서로 반대인 짝을 이어 붙인다.
//   1 아침, 널자마자 얼어 뻣뻣해진 빨래(응고) → 2 한낮, 고드름 끝의 물방울(융해, 1의 반대)
//   → 3 오후, 거실에서 마른 빨래(기화) → 4 해 질 무렵, 녹지 않고 마른 마당의 언 빨래(승화, 고체에서 기체)
//   → 5 저녁, 집에 들어서자 뿌예진 안경(액화, 3의 반대) → 6 그날 밤, 창의 성에(승화, 기체에서 고체, 4의 반대)
//   → 7 여섯 길의 지도(상태 변화)
// 수증기는 눈에 보이지 않으므로 점선 물결로만 그린다. 끓는 주전자와 김은 그리지 않는다(김은 수증기가 아니라 물방울이다).
// 물에 닿으면 붉어지는 종이(같은 물이라는 증거)는 바로 뒤의 시계 접시 랩이 맡으므로 만화에서는 쓰지 않는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, sparkle, drop, squiggle, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../lib/figure.mjs";
import { sun } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
const ICE = "#BFE2F4", ICELINE = "#7FB6D6", SNOW = "#F1F6FA", VAPOR = "#7FA8C9";
// 겨울이라 쌤과 학생은 목도리를 두른다. drawFigure 의 under 로 목에 얹는다
const scarf = (sk, col, sd) => () => {
  const s = curve([[-44, -352], [-10, -334], [34, -336], [48, -352], [40, -326], [0, -314], [-38, -326]], true, 3);
  sk.fill(s, col, { dx: 1, dy: 1.2, wob: 0.6, seed: sd }); sk.ink(s, { w: 8, seed: sd + 1, wob: 0.7 });
  const t = poly([[14, -326], [38, -326], [44, -262], [20, -262]], 3);
  sk.fill(t, col, { dx: 1, dy: 1.2, wob: 0.6, seed: sd + 2 }); sk.ink(t, { w: 8, seed: sd + 3, wob: 0.7 });
};
const SSAM = sk => ({ ...TEACHER, name: "teacher", under: scarf(sk, C.red, 5) });
const KID = sk => ({ ...STUDENT, name: "student", under: scarf(sk, "#3FAE5A", 9) });
// 눈 덮인 땅(아래가 어두운 면이 되지 않게 아주 밝은 색)
function snowGround(sk, y, sd) {
  const top = curve([[-12, y + 4], [220, y - 6], [480, y + 4], [740, y - 4], [972, y + 2]], false, 5);
  const sh = [...top, [972, 732], [-12, 732]]; sh.push(sh[0]);
  sk.fill(sh, SNOW, { dx: 0, dy: 0, wob: 0, seed: sd });
  sk.ink(top, { w: 9, seed: sd + 1 });
}
const floorLine = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });
// 눈에 보이지 않는 수증기: 점선 물결. len 이 음수면 아래로 내려간다
const vapor = (sk, x, y, len, sd, o = {}) => sk.ink(squiggle(x, y, len, o.amp ?? 9, o.waves ?? 2, sd, o.lean ?? 0), { w: o.w ?? 5, color: VAPOR, dash: [9, 11], seed: Math.round(sd * 10), wob: 0 });

// 처마와 고드름. list = [x, 길이, 반폭], 고드름은 지붕 끝(y)에서 아래로
function eave(sk, x0, y, list, sd = 11, o = {}) {
  thin(sk, 0.86, () => {
    const roof = poly([[x0, y - 54], [980, y - 80], [980, y], [x0 - 22, y]], 5);
    sk.fill(roof, "#8A6A5A", { seed: sd, tex: true, texAng: 0.05 });
    sk.ink(roof, { w: 11, seed: sd + 3 });
    const snowCap = curve([[x0 - 14, y - 50], [x0 + 70, y - 76], [x0 + 220, y - 86], [980, y - 104], [980, y - 70], [x0 + 220, y - 58], [x0 + 70, y - 50]], true, 4);
    sk.fill(snowCap, C.white, { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 });
    sk.ink(snowCap, { w: 8, seed: sd + 2, wob: 0.5 });
  });
  list.forEach(([x, len, w], i) => {
    const ic = curve([[x - w, y], [x - w * 0.55, y + len * 0.5], [x, y + len], [x + w * 0.55, y + len * 0.5], [x + w, y]], false, 4);
    sk.fill([...ic, ic[0]], ICE, { dx: 0, dy: 0, wob: 0.5, seed: sd + 10 + i });
    sk.ink(ic, { w: 7, seed: sd + 20 + i, wob: 0.6 });
    sk.ink(dense([[x - w * 0.3, y + 12], [x - w * 0.12, y + len * 0.45]]), { w: 4, color: C.white, seed: sd + 30 + i, wob: 0.2 });
  });
}
// 빨랫줄 기둥 둘과 줄. 줄의 높이 y, 두 기둥 x0, x1
function line(sk, x0, x1, y, ground, sd = 41) {
  thin(sk, 0.86, () => {
    for (const [x, i] of [[x0, 0], [x1, 1]]) sk.ink(dense([[x, ground], [x, y - 24]]), { w: 14, color: "#7A5A3A", seed: sd + i, wob: 0.4 });
  });
  sk.ink(curve([[x0, y - 12], [(x0 + x1) / 2, y + 6], [x1, y - 12]]), { w: 5, color: "#6B4A32", seed: sd + 2, wob: 0.3 });
}
// 집 그늘: 빨랫줄 밑 눈밭에 옅게 깔린다
const shade = (sk, x0, x1, y, sd) => sk.fill(curve([[x0 - 40, y + 6], [(x0 + x1) / 2, y - 4], [x1 + 40, y + 8], [x1 + 30, y + 40], [(x0 + x1) / 2, y + 46], [x0 - 30, y + 40]], true, 5), "#DCE5EE", { dx: 0, dy: 0, wob: 0.4, seed: sd });
const ropeY = (x0, x1, y, x) => { const u = (x - x0) / (x1 - x0); return y - 12 + 18 * (1 - (2 * u - 1) ** 2); };
const pin = (sk, x, y, sd) => { const p = rrect(x - 6, y - 14, 12, 28, 4); sk.fill(p, "#D9B07A", { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(p, { w: 4, seed: sd + 1, wob: 0.3 }); };
// 티셔츠. (x, y) = 목 가운데(줄에 걸린 자리). stiff 면 소매가 옆으로 뻗고 몸판이 판판하다
function shirt(sk, x, y, s, col, o = {}) {
  const sd = o.seed ?? 61;
  sk.at(x, y, s, () => {
    const pts = o.stiff
      ? [[-20, 0], [-50, 4], [-104, 12], [-104, 50], [-52, 44], [-50, 160], [50, 160], [52, 44], [104, 50], [104, 12], [50, 4], [20, 0], [0, 14]]
      : [[-20, 0], [-50, 4], [-84, 52], [-66, 70], [-50, 48], [-48, 158], [-16, 164], [16, 158], [48, 162], [50, 48], [66, 70], [84, 52], [50, 4], [20, 0], [0, 14]];
    const sh = o.stiff ? poly(pts, 4) : curve(pts, true, 4);
    sk.fill(sh, col, { dx: 1, dy: 1.2, wob: 0.6, seed: sd, tex: true, texAng: 1.3 });
    if (o.stiff) {
      sk.fill(sh, ICE, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1, alpha: 0.28 });
      for (const [gx, gy] of [[-70, 30], [-20, 70], [30, 40], [10, 120], [-34, 136], [70, 28]]) sk.dot(gx, gy, 3.4, C.white);
      for (const [gx, gy, i] of [[-30, 40, 0], [24, 90, 1], [-84, 26, 2]]) sk.ink(dense([[gx, gy], [gx + 12, gy + 22]]), { w: 4, color: C.white, seed: sd + 2 + i, wob: 0.1 });
      for (const [hx, len, i] of [[-36, 22, 0], [-6, 30, 1], [26, 18, 2]]) { const t = poly([[hx - 7, 160], [hx + 7, 160], [hx, 160 + len]], 2); sk.fill(t, ICE, { dx: 0, dy: 0, wob: 0.2, seed: sd + 6 + i }); sk.ink(t, { w: 3.5, color: ICELINE, seed: sd + 9 + i, wob: 0.2 }); }
    }
    sk.ink(sh, { w: 7, seed: sd + 12, wob: 0.6 });
  });
}
// 수건. (x, y) = 위 가운데. stiff 면 판판한 판, 아니면 아랫단이 출렁인다
function towel(sk, x, y, w, h, col, o = {}) {
  const sd = o.seed ?? 81;
  const sh = o.stiff ? poly([[x - w / 2, y], [x + w / 2, y], [x + w / 2 + 4, y + h], [x - w / 2 - 2, y + h]], 4)
    : curve([[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 2, y + h * 0.6], [x + w / 2 - 6, y + h], [x + w / 6, y + h - 8], [x - w / 6, y + h + 2], [x - w / 2 + 4, y + h - 6], [x - w / 2 + 2, y + h * 0.6]], true, 4);
  sk.fill(sh, col, { dx: 1, dy: 1.2, wob: 0.6, seed: sd, tex: true, texAng: 1.5 });
  sk.ink(dense([[x - w / 2 + 6, y + h - 22], [x + w / 2 - 6, y + h - 22]]), { w: 5, color: mix(col, "#000000", 0.2), seed: sd + 1, wob: 0.4 });
  if (o.stiff) {
    sk.fill(sh, ICE, { dx: 0, dy: 0, wob: 0.3, seed: sd + 2, alpha: 0.28 });
    for (const [gx, gy] of [[-w / 3, h * 0.3], [w / 5, h * 0.2], [0, h * 0.55], [w / 3, h * 0.7]]) sk.dot(x + gx, y + gy, 3.4, C.white);
    sk.ink(dense([[x - w / 4, y + 24], [x - w / 4 + 12, y + 50]]), { w: 4, color: C.white, seed: sd + 3, wob: 0.1 });
    for (const [hx, len, i] of [[-w / 3, 20, 0], [0, 28, 1], [w / 3, 16, 2]]) { const t = poly([[x + hx - 7, y + h], [x + hx + 7, y + h], [x + hx, y + h + len]], 2); sk.fill(t, ICE, { dx: 0, dy: 0, wob: 0.2, seed: sd + 4 + i }); sk.ink(t, { w: 3.5, color: ICELINE, seed: sd + 7 + i, wob: 0.2 }); }
  }
  sk.ink(sh, { w: 7, seed: sd + 10, wob: 0.6 });
}
// 서리의 깃털 무늬
function frost(sk, x, y, len, ang, sd, depth = 2) {
  const ex = x + len * Math.cos(ang), ey = y + len * Math.sin(ang);
  sk.ink(dense([[x, y], [ex, ey]]), { w: depth === 2 ? 6 : 4, color: C.white, seed: sd, wob: 0.6 });
  if (!depth) return;
  for (let i = 1; i <= 4; i++) {
    const u = i / 5, bx = x + (ex - x) * u, by = y + (ey - y) * u, bl = len * 0.36 * (1 - u * 0.5);
    frost(sk, bx, by, bl, ang + 0.9, sd + i * 3, depth - 1); frost(sk, bx, by, bl, ang - 0.9, sd + i * 3 + 1, depth - 1);
  }
}

/* ---------- 1. 아침, 응고: 널자마자 얼어 버린 빨래 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  snowGround(sk, 668, 101);
  eave(sk, 660, 110, [[720, 90, 16], [806, 120, 20], [890, 76, 14]], 111);
  const x0 = 60, x1 = 466, ly = 300;
  shade(sk, x0, x1, 676, 120);
  line(sk, x0, x1, ly, 672, 121);
  // 수건과 티셔츠가 꽁꽁 얼어 뻣뻣하다
  const tX = 150, sX = 326;
  towel(sk, tX, ropeY(x0, x1, ly, tX) + 2, 116, 150, "#F2A7B5", { stiff: true, seed: 131 });
  shirt(sk, sX, ropeY(x0, x1, ly, sX) + 2, 0.92, C.yellow, { stiff: true, seed: 141 });
  for (const [x, i] of [[tX - 40, 0], [tX + 40, 1], [sX - 30, 2], [sX + 30, 3]]) pin(sk, x, ropeY(x0, x1, ly, x), 151 + i * 2);
  // 학생: 언 소매를 손가락으로 톡 건드린다
  const P = pose({ elL: [-86, -404], haL: [-152, -486], elR: [50, -260], haR: [24, -218], tilt: -0.04 });
  const kx = 528, ky = 680, ks = 0.7;
  drawFigure(sk, kx, ky, ks, P, KID(sk));
  // 쌤: 빨래 바구니를 든다
  const B = pose({ elL: [-56, -250], haL: [-80, -206], elR: [56, -250], haR: [80, -206], tilt: 0.03 });
  const tx = 846, ty = 690, ts = 0.66;
  drawFigure(sk, tx, ty, ts, B, { ...SSAM(sk), hands: false });
  const bk = poly([[tx - 80, ty - 210], [tx + 80, ty - 210], [tx + 66, ty - 132], [tx - 66, ty - 132]], 4);
  const cloth = curve([[tx - 70, ty - 206], [tx - 40, ty - 236], [tx, ty - 222], [tx + 36, ty - 244], [tx + 70, ty - 206]], false, 4);
  sk.fill([...cloth, cloth[0]], "#8CC8EC", { dx: 0, dy: 0, wob: 0.5, seed: 161 }); sk.ink(cloth, { w: 6, seed: 162, wob: 0.5 });
  sk.fill(bk, "#C99A62", { seed: 163, tex: true, texAng: 0.2 }); sk.ink(bk, { w: 8, seed: 164, wob: 0.5 });
  for (let i = 1; i < 4; i++) sk.ink(dense([[tx - 76 + i * 3, ty - 210 + i * 19], [tx + 76 - i * 3, ty - 210 + i * 19]]), { w: 4, color: C.woodDark, seed: 165 + i, wob: 0.3 });
  handDot(sk, [tx - 74, ty - 196], C.skin, 171, 10); handDot(sk, [tx + 74, ty - 196], C.skin, 172, 10);

  return sk;
}

/* ---------- 2. 한낮, 융해: 고드름 끝의 물방울 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  sun(sk, 470, 74, 32, { seed: 201 });
  snowGround(sk, 668, 203);
  eave(sk, 600, 118, [[660, 66, 13], [770, 116, 17], [880, 74, 13]], 211);
  // 햇볕이 고드름을 데운다
  for (const [a, b, i] of [[[516, 104], [640, 150], 0], [[528, 136], [744, 196], 1]]) arrow(sk, (() => { const n = 40, out = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; for (let k = 0; k <= n; k++) { const u = k / n, o = 5 * Math.sin(u * 3 * 2 * Math.PI) * Math.min(1, (1 - u) * 5); out.push([a[0] + dx * u + nx * o, a[1] + dy * u + ny * o]); } return out; })(), { w: 5, color: C.orange, seed: 221 + i, wob: 0.3, head: 14 });
  // 고드름 끝에서 떨어지는 물방울을 학생이 컵에 받는다
  drop(sk, 770, 280, 1.1); drop(sk, 770, 350, 1.0); drop(sk, 770, 420, 0.9);
  const P = pose({ elR: [110, -300], haR: [222, -262], elL: [90, -270], haL: [196, -240], tilt: 0.02 });
  const kx = 600, ky = 680, ks = 0.7;
  drawFigure(sk, kx, ky, ks, P, { ...KID(sk), hands: false });
  const cx = 770, cy = 512;
  const cup = poly([[cx - 30, cy - 36], [cx + 30, cy - 36], [cx + 24, cy + 18], [cx - 24, cy + 18]], 3);
  sk.fill(cup, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 231 });
  sk.fill(poly([[cx - 27, cy - 8], [cx + 27, cy - 8], [cx + 24, cy + 18], [cx - 24, cy + 18]], 3), "#8CC8EC", { dx: 0, dy: 0, wob: 0.3, seed: 232 });
  sk.ink(cup, { w: 6, seed: 233, wob: 0.3 });
  handDot(sk, [cx - 26, cy], C.skin, 234, 10); handDot(sk, [cx + 26, cy], C.skin, 235, 10);
  // 쌤: 고드름을 가리킨다
  const T = pose({ elR: [96, -330], haR: [170, -380], elL: [-50, -262], haL: [-18, -222], tilt: 0.04 });
  drawFigure(sk, 290, 690, 0.72, T, SSAM(sk));
  return sk;
}

/* ---------- 3. 오후, 기화: 거실에서 마른 빨래 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  floorLine(sk, 700, 301);
  // 창 너머 눈 내린 마당
  thin(sk, 0.86, () => {
    const gl = rrect(620, 80, 270, 230, 14);
    sk.fill(gl, "#DCEBF5", { dx: 0, dy: 0, wob: 0.4, seed: 303 });
    sk.fill(poly([[626, 250], [884, 236], [884, 304], [626, 304]], 4), SNOW, { dx: 0, dy: 0, wob: 0.3, seed: 304 });
    sk.ink(dense([[755, 80], [755, 310]]), { w: 9, color: "#8A6A5A", seed: 305, wob: 0.5 });
    sk.ink(gl, { w: 12, color: "#6B4A32", seed: 306 });
  });
  // 빨래 건조대: 두 다리 + 가로대, 수건 둘이 걸쳐 있다
  thin(sk, 0.86, () => {
    for (const [x, i] of [[300, 0], [640, 1]]) { sk.ink(dense([[x - 40, 700], [x, 360]]), { w: 10, color: "#9AA3AD", seed: 311 + i, wob: 0.3 }); sk.ink(dense([[x + 40, 700], [x, 360]]), { w: 10, color: "#9AA3AD", seed: 313 + i, wob: 0.3 }); }
    sk.ink(dense([[290, 364], [650, 364]]), { w: 10, color: "#9AA3AD", seed: 315, wob: 0.3 });
  });
  for (const [x, col, i] of [[390, "#8CC8EC", 0], [540, "#F2A7B5", 1]]) {
    const t = curve([[x - 50, 364], [x - 48, 470], [x - 40, 540], [x, 534], [x + 40, 540], [x + 48, 470], [x + 50, 364]], false, 4);
    sk.fill([...t, t[0]], col, { dx: 1, dy: 1.2, wob: 0.6, seed: 321 + i, tex: true, texAng: 1.5 }); sk.ink([...t, t[0]], { w: 7, seed: 323 + i, wob: 0.5 });
    // 빨래 속 물이 수증기가 되어 날아간다
    vapor(sk, x - 18, 340, 120, 3.3 + i); vapor(sk, x + 22, 326, 104, 5.1 + i);
  }
  // 학생: 다 마른 수건을 만져 본다
  const P = pose({ elR: [80, -300], haR: [150, -318], elL: [-50, -262], haL: [-18, -222], tilt: 0.05 });
  drawFigure(sk, 226, 700, 0.72, P, KID(sk));
  // 쌤: 빨래 위의 보이지 않는 수증기를 가리킨다
  const T = pose({ elL: [-96, -430], haL: [-170, -530], elR: [50, -262], haR: [18, -222], tilt: -0.04 });
  drawFigure(sk, 790, 700, 0.72, T, SSAM(sk));
  return sk;
}

/* ---------- 4. 해 질 무렵, 승화(고체 → 기체): 녹지 않고 마른 언 빨래 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  snowGround(sk, 668, 403);
  const x0 = 220, x1 = 626, ly = 300;
  shade(sk, x0, x1, 676, 410);
  line(sk, x0, x1, ly, 672, 411);
  const tX = 310, sX = 486;
  towel(sk, tX, ropeY(x0, x1, ly, tX) + 2, 116, 150, "#F2A7B5", { stiff: true, seed: 421 });
  shirt(sk, sX, ropeY(x0, x1, ly, sX) + 2, 0.92, C.yellow, { stiff: true, seed: 431 });
  for (const [x, i] of [[tX - 40, 0], [tX + 40, 1], [sX - 30, 2], [sX + 30, 3]]) pin(sk, x, ropeY(x0, x1, ly, x), 441 + i * 2);
  // 언 빨래에서 곧장 날아가는 수증기. 아래 눈밭은 젖지 않았다
  for (const [x, y, i] of [[270, 276, 0], [350, 272, 1], [446, 276, 2], [536, 272, 3]]) vapor(sk, x, y, 96, 6.1 + i * 1.7, { amp: 8 });
  // 학생: 뻣뻣한 소매 끝을 만져 본다
  const P = pose({ elL: [-86, -404], haL: [-152, -486], elR: [50, -262], haR: [24, -218], tilt: -0.04 });
  drawFigure(sk, 688, 680, 0.7, P, KID(sk));
  // 쌤: 언 빨래에서 곧장 오르는 수증기를 가리킨다
  const T = pose({ elR: [100, -360], haR: [170, -420], elL: [-50, -262], haL: [-18, -222], tilt: 0.06 });
  drawFigure(sk, 110, 690, 0.7, T, SSAM(sk));
  return sk;
}

/* ---------- 5. 저녁, 액화: 집에 들어서자 뿌예진 안경 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  floorLine(sk, 700, 501);
  // 열린 현관문 너머 눈 오는 저녁(밝은 남빛)
  thin(sk, 0.86, () => {
    const out = poly([[50, 150], [262, 150], [262, 698], [50, 698]], 5);
    sk.fill(out, "#7F95C4", { dx: 0, dy: 0, wob: 0.4, seed: 503 });
    for (const [x, y] of [[96, 220], [200, 280], [130, 360], [228, 420], [96, 500], [180, 560], [230, 640]]) sk.dot(x, y, 6, C.white);
    sk.fill(poly([[50, 640], [262, 630], [262, 698], [50, 698]], 4), SNOW, { dx: 0, dy: 0, wob: 0.3, seed: 504 });
    sk.ink(out, { w: 13, color: "#6B4A32", seed: 505 });
    const door = poly([[262, 150], [350, 196], [350, 706], [262, 698]], 5);
    sk.fill(door, "#C49A5E", { seed: 506, tex: true, texAng: 1.5 }); sk.ink(door, { w: 11, seed: 507 });
  });
  sk.dot(330, 450, 8, C.gold);
  // 따뜻한 방의 난로
  thin(sk, 0.86, () => {
    const stove = rrect(790, 540, 120, 156, 18);
    sk.fill(stove, "#5A5F68", { seed: 511, tex: true }); sk.ink(stove, { w: 11, seed: 512 });
    const win = rrect(814, 590, 72, 56, 10);
    sk.fill(win, C.orange, { dx: 0, dy: 0, wob: 0.4, seed: 513 }); sk.ink(win, { w: 7, seed: 514 });
  });
  for (const [x, i] of [[812, 0], [850, 1], [888, 2]]) sk.ink(squiggle(x, 520, 60, 6, 2, i), { w: 6, color: C.red, seed: 515 + i, wob: 0 });
  // 방 공기 속 수증기가 차가운 안경으로
  vapor(sk, 700, 470, 120, 1.2, { lean: -0.5 }); vapor(sk, 620, 300, 60, 3.4); vapor(sk, 470, 320, 70, 2.1);
  // 쌤: 안경이 하얗게 흐려져 두 손을 내민다
  const P = pose({ elL: [-86, -300], haL: [-140, -326], elR: [86, -300], haR: [140, -326], tilt: 0 });
  const fx = 520, fy = 700, fs = 0.74;
  drawFigure(sk, fx, fy, fs, P, SSAM(sk));
  const hx = fx, hy = fy - fs * 436;
  for (const [sg, i] of [[-1, 0], [1, 1]]) {
    const lx = hx + sg * 36 * fs, ly = hy + 8 * fs;
    sk.fill(circ(lx, ly, 27 * fs, { over: 0, seed: 521 + i }), "#E4ECF2", { dx: 0, dy: 0, wob: 0.4, seed: 523 + i });
    for (const [dx, dy] of [[-7, -5], [6, 3], [-2, 9], [9, -9], [-10, 6]]) sk.dot(lx + dx, ly + dy, 2.6, ICELINE);
    sk.ink(circ(lx, ly, 30 * fs, { seed: 525 + i, lump: 0.03 }), { w: 8 * fs + 2, wob: 0.6, seed: 527 + i });
  }
  drop(sk, 612, 296, 1.0);
  // 학생: 뒤에서 웃는다(문가)
  const K = pose({ elR: [56, -282], haR: [36, -330], elL: [-50, -262], haL: [-18, -222], tilt: -0.08 });
  drawFigure(sk, 300, 700, 0.62, K, KID(sk));
  return sk;
}

/* ---------- 6. 그날 밤, 승화(기체 → 고체): 창의 성에 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  floorLine(sk, 704, 601);
  // 큰 창: 바깥은 밤, 유리 안쪽에 깃털 무늬 성에
  thin(sk, 0.86, () => {
    const gl = rrect(420, 70, 470, 470, 16);
    sk.fill(gl, "#5B6F9E", { dx: 0, dy: 0, wob: 0.4, seed: 603 });
    frost(sk, 432, 528, 260, -0.9, 611); frost(sk, 878, 528, 240, -2.25, 621); frost(sk, 432, 84, 200, 0.75, 631); frost(sk, 878, 84, 196, 2.4, 641);
    frost(sk, 655, 528, 150, -1.57, 651, 1); frost(sk, 655, 84, 120, 1.57, 661, 1);
    sk.ink(dense([[655, 70], [655, 540]]), { w: 10, color: "#8A6A5A", seed: 671, wob: 0.5 });
    sk.ink(dense([[420, 305], [890, 305]]), { w: 10, color: "#8A6A5A", seed: 672, wob: 0.5 });
    sk.ink(gl, { w: 13, color: "#6B4A32", seed: 673 });
    const sill = rrect(398, 540, 514, 24, 8);
    sk.fill(sill, "#B5814C", { seed: 674, tex: true }); sk.ink(sill, { w: 9, seed: 675 });
  });
  // 방 안 수증기가 차가운 유리로 가서 곧장 얼음이 된다
  vapor(sk, 330, 470, 120, 1.7, { lean: 0.6 }); vapor(sk, 360, 330, 90, 4.2, { lean: 0.5 });
  // 학생: 성에를 가리킨다. 쌤은 뒤에서 본다
  const P = pose({ elR: [96, -330], haR: [170, -372], elL: [-50, -262], haL: [-18, -222], tilt: 0.05 });
  drawFigure(sk, 250, 704, 0.72, P, KID(sk));
  const T = pose({ elR: [56, -262], haR: [30, -222], elL: [-56, -262], haL: [-30, -222], tilt: -0.04 });
  drawFigure(sk, 96, 704, 0.6, T, SSAM(sk));
  return sk;
}

/* ---------- 7. 상태 변화: 여섯 길의 지도 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  floorLine(sk, 704, 701);
  // 세 모습: 얼음(왼쪽 아래), 물(오른쪽 아래), 수증기(위)
  const S = [380, 520], L = [740, 520], G = [560, 190];
  const cube = rrect(S[0] - 56, S[1] - 56, 112, 112, 18);
  sk.fill(cube, ICE, { dx: 0, dy: 0, wob: 0.4, seed: 703 }); sk.ink(cube, { w: 8, seed: 704 });
  sk.ink(dense([[S[0] - 30, S[1] - 34], [S[0] - 8, S[1] - 4]]), { w: 5, color: C.white, seed: 705, wob: 0.2 });
  drop(sk, L[0], L[1] + 4, 3.1);
  for (const [dx, i] of [[-40, 0], [0, 1], [40, 2]]) vapor(sk, G[0] + dx, G[1] + 56, 112, 1.3 + i * 1.9, { amp: 9, w: 6 });
  // 짝을 이룬 화살표: 융해와 응고(파랑), 기화와 액화(주홍), 승화 두 방향(보라). 정리 카드의 색과 같다
  const pairArrow = (a, b, col, off, sd) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], Lh = Math.hypot(dx, dy), ux = dx / Lh, uy = dy / Lh, nx = -uy * off, ny = ux * off;
    const p0 = [a[0] + ux * 92, a[1] + uy * 92], p1 = [b[0] - ux * 92, b[1] - uy * 92];
    arrow(sk, [[p0[0] + nx, p0[1] + ny], [p1[0] + nx, p1[1] + ny]], { w: 9, color: col, seed: sd, straight: true, head: 22, wob: 0.3 });
    arrow(sk, [[p1[0] - nx, p1[1] - ny], [p0[0] - nx, p0[1] - ny]], { w: 9, color: col, seed: sd + 5, straight: true, head: 22, wob: 0.3 });
  };
  pairArrow(S, L, "#4E9BF5", 22, 711);
  pairArrow(L, G, "#F0705E", 22, 721);
  pairArrow(G, S, "#8A6BFF", 22, 731);
  // 쌤: 지도를 가리킨다
  const T = pose({ elR: [96, -330], haR: [170, -370], elL: [-50, -262], haL: [-18, -222], tilt: 0.05 });
  drawFigure(sk, 150, 704, 0.74, T, SSAM(sk));
  const K = pose({ elR: [84, -300], haR: [156, -326], elL: [-50, -262], haL: [-24, -218], tilt: 0.05 });
  drawFigure(sk, 872, 704, 0.66, K, { ...KID(sk), mirror: true });
  return sk;
}

export const META = {
  title: "겨울 하루,<br>물의 <em>여섯 가지 변신</em>",
  lead: "언 빨래, 고드름, 뿌예진 안경, 창의 성에. 겨울 하루 동안 물이 모습을 바꾸는 순간을 따라가 봐요.",
  narrator: "물은 얼음(고체), 물(액체), 수증기(기체)로 모습을 바꿔요. 바뀔 때마다 붙는 이름이 있어요. <b>어느 상태에서 어느 상태로</b> 바뀌는지 눈여겨보세요!",
  cta: "실험으로 확인하기",
};

const TEXT = [
  {
    when: "겨울 아침, 마당", stage: "응고", title: "빨래가 딱딱해졌어요",
    caption: "꽁꽁 언 겨울 아침, 젖은 빨래를 그늘진 마당에 널었어요. 얼마 지나지 않아 빨래가 막대기처럼 뻣뻣해졌어요. 빨래에 스며 있던 물이 얼어 얼음이 된 거예요. <b>액체가 고체로</b> 바뀌는 이 변화가 <b>응고</b>예요.",
    bubbles: [{ who: "student", text: "빨래가<br>딱딱해!" }],
    term: { name: "응고", def: "<b>액체 → 고체</b>. 물이 얼어 얼음이 되는 변화." },
  },
  {
    when: "한낮, 처마 밑", stage: "융해", title: "고드름 끝의 똑, 똑",
    caption: "한낮이 되자 햇볕을 받은 고드름 끝에서 물방울이 똑똑 떨어졌어요. 단단한 얼음이 녹아 흐르는 물이 된 거예요. 아침의 응고와 반대로 <b>고체가 액체로</b> 바뀌는 이 변화가 <b>융해</b>예요.",
    bubbles: [{ who: "teacher", text: "똑, 똑<br>녹는다!" }],
    term: { name: "융해", def: "<b>고체 → 액체</b>. 얼음이 녹아 물이 되는 변화." },
  },
  {
    when: "오후, 거실", stage: "기화", title: "물은 어디로 갔을까",
    caption: "거실에 넌 빨래는 오후가 되자 바싹 말랐어요. 빨래 속 물이 눈에 보이지 않는 <b>수증기</b>가 되어 공기 속으로 날아간 거예요. <b>액체가 기체로</b> 바뀌는 이 변화가 <b>기화</b>예요.",
    bubbles: [{ who: "student", text: "다<br>말랐어요!" }],
    term: { name: "기화", def: "<b>액체 → 기체</b>. 물이 수증기가 되어 공기 속으로 날아가는 변화." },
  },
  {
    when: "해 질 무렵, 마당", stage: "승화", title: "언 채로 마른 빨래",
    caption: "그늘에 넌 빨래는 하루 종일 뻣뻣하게 언 채였는데도, 해 질 무렵 만져 보니 꽤 말라 있었어요. 얼음이 녹지 않고 <b>곧장 수증기</b>가 되어 날아간 거예요. <b>고체가 기체로</b> 바뀌는 이 변화가 <b>승화</b>예요.",
    bubbles: [{ who: "student", text: "얼었는데<br>말랐어!" }],
    term: { name: "승화", def: "<b>고체 → 기체</b>, <b>기체 → 고체</b> 모두 승화예요. 액체를 건너뛰는 변화." },
  },
  {
    when: "저녁, 현관", stage: "액화", title: "뿌예진 안경",
    caption: "저녁, 추운 밖에서 따뜻한 집 안으로 들어서자 쌤의 안경이 뿌옇게 흐려졌어요. 방 공기 속 <b>수증기</b>가 차가운 안경알에 닿아 작은 물방울로 맺힌 거예요. 오후의 기화와 반대로 <b>기체가 액체로</b> 바뀌는 변화, <b>액화</b>예요.",
    bubbles: [{ who: "teacher", text: "안경이<br>뿌예졌어!" }],
    term: { name: "액화", def: "<b>기체 → 액체</b>. 수증기가 차가운 곳에 닿아 물방울로 맺히는 변화." },
  },
  {
    when: "그날 밤, 창가", stage: "승화", title: "창에 핀 얼음 꽃",
    caption: "밤이 깊어지자 차가운 창유리 안쪽에 하얀 <b>성에</b>가 깃털처럼 피었어요. 방 안 수증기가 물방울을 거치지 않고 곧장 얼음이 된 거예요. <b>기체가 고체로</b> 바뀐 이 변화도 <b>승화</b>예요. 언 빨래가 마른 것과 방향은 반대지만 이름은 같아요.",
    bubbles: [{ who: "student", text: "얼음 꽃이<br>피었어!" }],
  },
  {
    stage: "정리", title: "여섯 가지 길",
    caption: "하루 동안 물은 고체, 액체, 기체 사이를 오가며 여섯 번 모습을 바꿨어요. 이렇게 물질의 상태가 바뀌는 것을 <b>상태 변화</b>라고 해요. 이름은 <b>어느 상태에서 어느 상태로</b> 바뀌는지가 정해요. 화살표 짝마다 방향이 서로 반대예요.",
    term: { name: "상태 변화", def: "물질이 고체, 액체, 기체 가운데 <b>다른 상태로 바뀌는 것</b>. 모습이 바뀌어도 물은 여전히 물이에요." },
  },
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7].map((fn, i) => ({ sk: fn(), ...TEXT[i] }));
}
