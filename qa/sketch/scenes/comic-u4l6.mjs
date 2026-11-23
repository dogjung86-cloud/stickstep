// 중1 과학 u4l6 도입 만화(v2): 연못은 왜 천천히 얼까?(응고, 액화는 열에너지를 방출한다). 8컷.
// 조사와 콘티는 qa/sketch/research/u4l6.md.
//   1 겨울 아침 글래스고, 블랙: 밤새 꽁꽁 추웠는데 연못은 가장자리만 살얼음이다(궁금증)
//   2 1761년 겨울 글래스고, 블랙: 찬 공기 속 온도계를 얼어 가는 물에 넣으면 눈금이 올라간다
//   3 블랙의 생각: 물은 얼면서 열을 내놓는다, 다 얼 때까지 온도가 일정하다(응고 = 방출)
//   4 수수께끼 풀이: 어는 물이 내놓는 열이 찬 공기로 빠져나가야 더 얼 수 있어 연못은 천천히 언다(크게 본 단면)
//   5 이슬(액화도 방출) → 6 함박눈(승화도 방출) → 7 사막의 물주머니(반대로 기화는 흡수)
//   → 8 열이 나오는 길(빨강)과 들어가는 길(파랑)
// 2026-11-23 저작권 손질: 옛 1, 4컷(과수원에서 꽃에 물 뿌리기)을 블랙의 연못으로 바꿨다. 6컷(함박눈)은 사용자 결정으로 장면을 그대로 두고 캡션만 새로 썼다.
// 화살표 색: 빨강 = 상태가 변하는 물질에서 열이 나온다(방출), 파랑 = 상태가 변하는 물질로 열이 들어간다(흡수). 찬 공기는 화살촉 없는 옅은 바람 선.
// 이글루 벽에 물을 뿌려 집을 데운다는 이야기는 근거가 약해 쓰지 않는다.
// 블랙의 과냉각 이야기(파렌하이트가 본, 0 ℃ 아래에서도 얼지 않은 물)는 0 ℃에서 온도가 멈추는 냉각 곡선 랩과 헷갈릴 수 있어 쓰지 않는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, sparkle, drop, squiggle, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../lib/figure.mjs";
import { sun, cloud } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
const ICE = "#D6EEFA", ICELINE = "#7FB6D6", VAPOR = "#7FA8C9", SNOW = "#F1F6FA", LEATHER = "#B9814A";
const HOT = C.red, COOL = "#2F8EE0";
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });
function snowGround(sk, y, sd) {
  const top = curve([[-12, y + 4], [220, y - 6], [480, y + 4], [740, y - 4], [972, y + 2]], false, 5);
  const sh = [...top, [972, 732], [-12, 732]]; sh.push(sh[0]);
  sk.fill(sh, SNOW, { dx: 0, dy: 0, wob: 0, seed: sd }); sk.ink(top, { w: 9, seed: sd + 1 });
}
const scarf = (sk, col, sd) => () => {
  const s = curve([[-44, -352], [-10, -334], [34, -336], [48, -352], [40, -326], [0, -314], [-38, -326]], true, 3);
  sk.fill(s, col, { dx: 1, dy: 1.2, wob: 0.6, seed: sd }); sk.ink(s, { w: 8, seed: sd + 1, wob: 0.7 });
  const t = poly([[14, -326], [38, -326], [44, -262], [20, -262]], 3);
  sk.fill(t, col, { dx: 1, dy: 1.2, wob: 0.6, seed: sd + 2 }); sk.ink(t, { w: 8, seed: sd + 3, wob: 0.7 });
};
// 눈에 안 보이는 수증기: 점선 물결(len 이 음수면 아래로)
const vapor = (sk, x, y, len, sd, o = {}) => {
  const pts = squiggle(x, y, Math.abs(len), o.amp ?? 9, o.waves ?? 2, sd, o.lean ?? 0).map(([px, py]) => [px, len < 0 ? 2 * y - py : py]);
  sk.ink(pts, { w: o.w ?? 5, color: VAPOR, dash: [9, 11], seed: Math.round(sd * 10), wob: 0 });
};
// 열이 드나드는 표시: 가운데에서 바깥으로(out) 또는 바깥에서 가운데로(inward) 향하는 짧은 빨간 화살표
function heatArrows(sk, x, y, r0, r1, angs, sd, inward = false, color = HOT) {
  angs.forEach((a, i) => {
    const p0 = [x + r0 * Math.cos(a), y + r0 * Math.sin(a)], p1 = [x + r1 * Math.cos(a), y + r1 * Math.sin(a)];
    arrow(sk, inward ? [p1, p0] : [p0, p1], { w: 6, color, seed: sd + i, straight: true, head: 14, wob: 0.3 });
  });
}
// 찬 바람: 화살촉 없는 옅은 물결 선(차가움이 들어온다고 읽히지 않게)
const wind = (sk, x, y, len, sd) => sk.ink(curve([[x, y], [x + len * 0.33, y - 8], [x + len * 0.66, y + 6], [x + len, y - 4]]), { w: 5, color: "#B9CCDB", seed: sd, wob: 0.3 });
// 유리 온도계(세로). (x, y) = 둥근 알, level 0~1. 숫자 없이 눈금만
function thermo(sk, x, y, len, level, sd, o = {}) {
  const tw = o.w ?? 16, br = o.br ?? 14;
  const tube = rrect(x - tw / 2, y - len, tw, len + 4, tw / 2);
  sk.fill(tube, "#F6FBFD", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  const top = y - 10 - (len - 20) * level;
  sk.ink(dense([[x, y], [x, top]]), { w: tw - 7, color: C.red, seed: sd + 1, wob: 0.2, cap: "butt" });
  sk.ink(tube, { w: 5.5, seed: sd + 2, wob: 0.4 });
  for (let i = 1; i <= 6; i++) { const ty = y - 10 - (len - 20) * i / 7; sk.ink(dense([[x + tw / 2 + 2, ty], [x + tw / 2 + (i % 2 ? 10 : 6), ty]]), { w: 3.5, color: C.gray, seed: sd + 3 + i, wob: 0 }); }
  const b = circ(x, y, br, { over: 0.15, seed: sd + 12 });
  sk.fill(b, C.red, { dx: 0, dy: 0, wob: 0.4, seed: sd + 13 }); sk.ink(b, { w: 5.5, seed: sd + 14, wob: 0.4 });
  return { top };
}

/* ---------- 인물 ---------- */
// 조지프 블랙(1761, 서른셋): 분을 바른 머리와 귀 옆 말림, 짙은 외투. 작은 얼굴
const BLACK = { hair: "short", hairColor: "#E8E4DC", fringe: 24, coat: { color: "#3E434C", buttons: "#C9B48A", seam: "#262A30", len: 40 }, seed: 541, mini: true, face: "calm" };
function wigRolls(sk, x, y, s, p, o = {}) {
  const col = o.wig ?? "#ECE8E0", sd = o.seed ?? 951;
  sk.save(); sk.translate(x, y); sk.scale(s * (o.mirror ? -1 : 1), s); sk.translate(p.head[0], p.head[1]); sk.rotate(p.tilt ?? 0);
  for (const sg of [-1, 1]) for (const [cy, rr, i] of [[-2, 23, 0], [38, 20, 1]]) {
    const c = circ(sg * (98 + i * 2), cy, rr, { over: 0.25, seed: sd + i + (sg > 0 ? 4 : 0), lump: 0.05 });
    sk.fill(c, col, { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 10 + i });
    sk.ink(c, { w: 9, wob: 0.8, seed: sd + 20 + i });
    sk.ink(curve([[sg * (90 + i * 2), cy - 6], [sg * (102 + i * 2), cy - 2], [sg * (98 + i * 2), cy + 9]]), { w: 5, wob: 0.4, seed: sd + 30 + i, color: "#B9B3A7" });
  }
  sk.restore();
}
function black(sk, x, y, s, p, extra = {}) {
  const o = { ...BLACK, name: "black", ...extra };
  drawFigure(sk, x, y, s, p, o);
  wigRolls(sk, x, y, s, p, { mirror: o.mirror });
}
// 사막 길손: 챙 넓은 모자 + 긴 옷. 얼굴 없음
const TRAVELER = { hair: "short", hairColor: "#5B463A", fringe: 24, hat: "brim", hatColor: "#D9B77A", coat: { color: "#EADDBB", seam: "#B59B6A", len: 90 }, seed: 571 };
const SSAM = { ...TEACHER, name: "teacher" };
const KID = { ...STUDENT, name: "student" };

/* ---------- 소품 ---------- */
// 연못(비스듬히 내려다본 타원). edge = 가장자리 살얼음 띠의 두께(0~1)
function pond(sk, cx, cy, rx, ry, edge, sd) {
  const outer = ell(cx, cy, rx, ry);
  sk.fill(outer, ICE, { dx: 0, dy: 0, wob: 0.4, seed: sd });
  const ix = cx + rx * 0.04, iy = cy + ry * 0.06, irx = rx * (1 - edge), iry = ry * (1 - edge * 1.25);
  const inner = ell(ix, iy, irx, iry);
  sk.fill(inner, "#9FD0EE", { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 });
  sk.ink(inner, { w: 4, color: ICELINE, seed: sd + 2, wob: 0.7 });
  // 살얼음의 금(가장자리에서 안쪽 물가로)
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7 + 0.3;
    const p0 = [ix + irx * Math.cos(a), iy + iry * Math.sin(a)], p1 = [cx + rx * 0.96 * Math.cos(a + 0.06), cy + ry * 0.96 * Math.sin(a + 0.06)];
    sk.ink(dense([p0, [(p0[0] + p1[0]) / 2 + 6, (p0[1] + p1[1]) / 2], p1], 3), { w: 3, color: ICELINE, seed: sd + 3 + i, wob: 0.4 });
  }
  // 얼지 않은 물의 잔물결
  for (const [dx, dy, i] of [[-0.25, -0.1, 0], [0.12, 0.18, 1]]) sk.ink(curve([[ix + irx * (dx - 0.16), iy + iry * dy], [ix + irx * (dx - 0.05), iy + iry * dy - 5], [ix + irx * (dx + 0.06), iy + iry * dy], [ix + irx * (dx + 0.17), iy + iry * dy - 5]]), { w: 4, color: "#5E9FCB", seed: sd + 12 + i, wob: 0.3 });
  sk.ink(outer, { w: 8, seed: sd + 15, wob: 0.5 });
}
// 서리 앉은 마른 갈대: 가는 줄기와 흰 끝
function frostReeds(sk, x, y, n, sd) {
  for (let i = 0; i < n; i++) {
    const bx = x + i * 15, h = 96 + 34 * Math.sin(i * 2.3 + 1), lean = (i % 2 ? 1 : -1) * (8 + i * 2);
    sk.ink(curve([[bx, y], [bx + lean * 0.4, y - h * 0.5], [bx + lean, y - h]]), { w: 5, color: "#8A7A4A", seed: sd + i, wob: 0.3 });
    sk.ink(dense([[bx + lean * 0.82, y - h * 0.84], [bx + lean, y - h]]), { w: 7, color: C.white, seed: sd + 20 + i, wob: 0.1 });
  }
}
// 고드름 달린 나뭇가지(오른쪽 위에서 들어온다)
function icyBranch(sk, sd) {
  const br = curve([[980, 96], [880, 122], [790, 164], [716, 190]]);
  sk.ink(br, { w: 28, seed: sd, wob: 0.8 }); sk.ink(br, { w: 15, color: "#7A5A3A", seed: sd, wob: 0.8 });
  const tw = curve([[860, 132], [830, 92], [800, 70]]);
  sk.ink(tw, { w: 18, seed: sd + 1, wob: 0.6 }); sk.ink(tw, { w: 8, color: "#7A5A3A", seed: sd + 1, wob: 0.6 });
  const snow = curve([[976, 84], [900, 104], [820, 138], [740, 172], [712, 180], [744, 162], [826, 124], [904, 94]], true, 3);
  sk.fill(snow, SNOW, { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 }); sk.ink(snow, { w: 4, color: "#B9CCDB", seed: sd + 3, wob: 0.4 });
  for (const [x, y, len, i] of [[934, 116, 58, 0], [884, 134, 86, 1], [836, 154, 52, 2], [790, 174, 74, 3], [748, 190, 44, 4]]) {
    const ic = poly([[x - 10, y], [x + 10, y], [x + 1, y + len]], 2);
    sk.fill(ic, ICE, { dx: 0, dy: 0, wob: 0.3, seed: sd + 10 + i }); sk.ink(ic, { w: 4, color: ICELINE, seed: sd + 20 + i, wob: 0.3 });
  }
}
// 원 안에서 두 가로선 사이(y0~y1)를 채우는 다각형(원을 칼로 자른 띠)
function circleBand(cx, cy, r, y0, y1) {
  const a = Math.max(y0, cy - r + 0.5), b = Math.min(y1, cy + r - 0.5), right = [], left = [];
  for (let k = 0; k <= 24; k++) { const y = a + (b - a) * k / 24, dx = Math.sqrt(Math.max(0, r * r - (y - cy) ** 2)); right.push([cx + dx, y]); left.push([cx - dx, y]); }
  const pts = [...right, ...left.reverse()]; pts.push(pts[0]);
  return pts;
}
// 작은 나무 통의 살얼음 물(8컷의 응고 예)
function miniTub(sk, x, y, sd) {
  thin(sk, 0.8, () => {
    const tub = poly([[x - 34, y - 18], [x + 34, y - 18], [x + 28, y + 26], [x - 28, y + 26]], 3);
    sk.fill(tub, C.wood, { seed: sd, tex: true, texAng: 1.5 }); sk.ink(tub, { w: 6, seed: sd + 1 });
  });
  const water = ell(x, y - 18, 33, 8);
  sk.fill(water, "#9FD0EE", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 });
  const ice = ell(x - 8, y - 18, 18, 5); sk.fill(ice, C.white, { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 }); sk.ink(ice, { w: 3, color: ICELINE, seed: sd + 4, wob: 0.3 });
  sk.ink(water, { w: 4, seed: sd + 5, wob: 0.3 });
}
function snowflake(sk, x, y, r, sd, rot = 0) {
  sk.at(x, y, 1, () => {
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
      sk.ink(dense([[0, 0], [r * c, r * s]]), { w: Math.max(4, r * 0.13), color: ICELINE, seed: sd + i, wob: 0.3 });
      for (const sg of [-1, 1]) { const b = a + sg * 0.8; sk.ink(dense([[r * 0.58 * c, r * 0.58 * s], [r * 0.58 * c + r * 0.3 * Math.cos(b), r * 0.58 * s + r * 0.3 * Math.sin(b)]]), { w: Math.max(3.5, r * 0.11), color: ICELINE, seed: sd + 6 + i, wob: 0.2 }); }
    }
  }, rot);
}
// 물주머니: 둥근 가죽 자루 + 묶은 목. cut 이면 속의 물이 보이는 창
function waterbag(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 231;
  sk.at(x, y, s, () => {
    const body = curve([[-16, -78], [-58, -50], [-74, 4], [-56, 56], [0, 76], [56, 56], [74, 4], [58, -50], [16, -78]], false, 4);
    const shape = [...body, body[0]];
    sk.fill(shape, LEATHER, { dx: 1, dy: 1.4, wob: 0.8, seed: sd, tex: true, texAng: 0.8 });
    if (o.cut) {
      const w = curve([[-46, -6], [-22, -14], [0, -6], [22, -14], [46, -6], [42, 34], [0, 54], [-42, 34]], true, 4);
      sk.fill(w, "#4A90D9", { dx: 0, dy: 0, wob: 0.4, seed: sd + 1, tex: 0.6 }); sk.ink(w, { w: 4 / s + 2, color: "#2F6DB5", seed: sd + 2, wob: 0.4 });
    }
    sk.ink(shape, { w: 9 / Math.sqrt(s), seed: sd + 3, wob: 0.8 });
    const neck = poly([[-18, -80], [18, -80], [22, -104], [-22, -104]], 3);
    sk.fill(neck, mix(LEATHER, "#000000", 0.2), { dx: 0, dy: 0, wob: 0.4, seed: sd + 4 }); sk.ink(neck, { w: 8 / Math.sqrt(s), seed: sd + 5, wob: 0.5 });
    sk.ink(dense([[-24, -80], [24, -80]]), { w: 7 / Math.sqrt(s), color: C.red, seed: sd + 6, wob: 0.3 });
  });
  for (const [dx, dy, k] of (o.drops ?? [[-52, 30, 0.9], [44, 42, 0.8], [-20, 66, 0.7], [58, -6, 0.7]])) drop(sk, x + dx * s, y + dy * s, k * Math.sqrt(s));
}

/* ---------- 1. 겨울 아침, 글래스고: 밤새 추웠는데 연못은 가장자리만 얼었다 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  snowGround(sk, 470, 11);
  icyBranch(sk, 21);
  pond(sk, 610, 600, 290, 72, 0.3, 41);
  frostReeds(sk, 862, 586, 5, 61);
  frostReeds(sk, 318, 610, 3, 71);
  // 연못 위의 찬 바람(화살촉 없는 옅은 선)
  for (const [x, y, len, i] of [[430, 380, 120, 0], [600, 352, 110, 1], [700, 408, 96, 2]]) wind(sk, x, y, len, 81 + i);
  // 블랙: 연못을 가리키며 고개를 갸웃한다
  const P = pose({ elR: [92, -318], haR: [172, -284], elL: [-50, -262], haL: [-18, -222], tilt: 0.08 });
  black(sk, 170, 692, 0.74, P, { face: "curious" });
  return sk;
}

/* ---------- 2. 1761년 겨울, 글래스고: 블랙의 온도계 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  snowGround(sk, 676, 101);
  // 바깥에 둔 나무 통: 물 위에 살얼음이 덮이는 중
  const tx = 600, top = 440;
  thin(sk, 0.86, () => {
    const tub = poly([[tx - 130, top], [tx + 130, top], [tx + 112, 676], [tx - 112, 676]], 4);
    sk.fill(tub, C.wood, { seed: 103, tex: true, texAng: 1.5 });
    for (const y of [500, 600]) sk.ink(dense([[tx - 126 + (y - top) * 0.07, y], [tx + 126 - (y - top) * 0.07, y]]), { w: 8, color: "#7A5A3A", seed: 104 + y, wob: 0.3 });
    sk.ink(tub, { w: 11, seed: 105 });
  });
  const water = ell(tx, top, 128, 26);
  sk.fill(water, "#9FD0EE", { dx: 0, dy: 0, wob: 0.4, seed: 106 });
  for (const [x, y, w, h, i] of [[tx - 70, top - 4, 46, 12, 0], [tx + 60, top + 2, 52, 13, 1], [tx - 4, top + 12, 30, 8, 2]]) { const ic = ell(x, y, w, h); sk.fill(ic, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 107 + i }); sk.ink(ic, { w: 4, color: ICELINE, seed: 110 + i, wob: 0.4 }); }
  sk.ink(water, { w: 7, seed: 113, wob: 0.4 });
  // 기둥에 매단 온도계(찬 공기 속): 눈금이 낮다
  thin(sk, 0.86, () => { sk.ink(dense([[850, 676], [850, 230]]), { w: 12, color: "#7A5A3A", seed: 115, wob: 0.3 }); sk.ink(dense([[850, 250], [806, 250]]), { w: 9, color: "#7A5A3A", seed: 116, wob: 0.3 }); });
  sk.ink(dense([[806, 250], [806, 268]]), { w: 3, seed: 117, wob: 0 });
  thermo(sk, 806, 470, 200, 0.18, 121);
  // 블랙: 얼어 가는 물속에 넣은 온도계를 들고 본다. 눈금이 높다
  thermo(sk, tx - 40, top + 66, 230, 0.62, 131);
  const P = pose({ elR: [110, -450], haR: [178, -548], elL: [-50, -262], haL: [-18, -222], tilt: 0.04 });
  black(sk, 424, 700, 0.74, P, { face: "curious" });
  return sk;
}

/* ---------- 3. 블랙의 생각: 물은 얼면서 열을 내놓는다 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 704, 201);
  // 생각 구름 속: 얼어 가는 통. 얼음이 생기는 물 위로 열이 빠져나오고, 온도계는 같은 눈금에 머문다
  cloud(sk, 600, 300, 600, 470, { seed: 211, tail: [[330, 520, 18, 0], [300, 570, 12, 1]] });
  // 왼쪽 통은 이제 막 살얼음, 오른쪽 통은 얼음이 많이 생겼다. 두 온도계는 같은 눈금(=)
  const tubAt = (cx, iceW, sd) => {
    const top = 360;
    thin(sk, 0.8, () => {
      const tub = poly([[cx - 84, top], [cx + 84, top], [cx + 72, 470], [cx - 72, 470]], 4);
      sk.fill(tub, C.wood, { seed: sd, tex: true, texAng: 1.5 }); sk.ink(tub, { w: 10, seed: sd + 1 });
    });
    const water = ell(cx, top, 82, 18);
    sk.fill(water, "#9FD0EE", { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 });
    const ice = ell(cx - (82 - iceW) * 0.4, top + 1, iceW, Math.max(8, iceW * 0.2));
    sk.fill(ice, C.white, { dx: 0, dy: 0, wob: 0.4, seed: sd + 3 }); sk.ink(ice, { w: 4, color: ICELINE, seed: sd + 4, wob: 0.4 });
    sk.ink(water, { w: 6, seed: sd + 5, wob: 0.4 });
    for (const [x, i] of [[cx - 50, 0], [cx + 10, 1]]) arrow(sk, [[x, top - 16], [x + (i ? 8 : -8), top - 96]], { w: 7, color: HOT, seed: sd + 6 + i, straight: true, head: 16, wob: 0.3 });
    return top;
  };
  const top = tubAt(470, 26, 251);
  tubAt(730, 70, 271);
  const tl = thermo(sk, 520, 440, 190, 0.42, 291, { w: 14, br: 11 });
  thermo(sk, 780, 440, 190, 0.42, 311, { w: 14, br: 11 });
  for (const [dy, i] of [[-7, 0], [7, 1]]) sk.ink(dense([[566, tl.top + dy], [598, tl.top + dy]]), { w: 6, color: C.ink, seed: 331 + i, wob: 0.2 });
  for (const [x, y, len, i] of [[352, 210, 74, 0], [360, 250, 60, 1], [790, 196, 66, 2], [800, 236, 56, 3]]) wind(sk, x, y, len, 341 + i);
  // 블랙: 손가락을 세운다
  const P = pose({ elR: [70, -330], haR: [86, -420], elL: [-50, -262], haL: [-18, -222], tilt: -0.04 });
  black(sk, 190, 704, 0.74, P, { face: "smile" });
  return sk;
}

/* ---------- 4. 수수께끼 풀이: 어는 물이 내놓는 열이 빠져나가야 더 언다 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  snowGround(sk, 560, 301);
  pond(sk, 690, 650, 230, 46, 0.5, 311);
  // 연못 겉의 한 곳을 크게: 위는 찬 공기, 가운데 얼음, 아래 물
  const cx = 632, cy = 300, r = 176, yi0 = 292, yi1 = 326;
  const zx = 650, zy = 640;
  sk.ink(poly([[zx - 18, zy - 10], [zx + 18, zy - 10], [zx + 18, zy + 10], [zx - 18, zy + 10]], 2), { w: 4, seed: 321, wob: 0.2 });
  for (const [a, b, i] of [[[zx - 18, zy - 10], [cx - r * 0.82, cy + r * 0.57]], [[zx + 18, zy - 10], [cx + r * 0.82, cy + r * 0.57]]].map((v, i) => [...v, i])) sk.ink(dense([a, b]), { w: 4, color: C.gray, dash: [10, 9], seed: 323 + i, wob: 0 });
  sk.fill(circleBand(cx, cy, r, cy - r, yi0), "#F2F7FB", { dx: 0, dy: 0, wob: 0.2, seed: 331 });
  sk.fill(circleBand(cx, cy, r, yi1, cy + r), "#9FD0EE", { dx: 0, dy: 0, wob: 0.2, seed: 332 });
  sk.fill(circleBand(cx, cy, r, yi0, yi1), ICE, { dx: 0, dy: 0, wob: 0.2, seed: 333 });
  sk.ink(dense([[cx - Math.sqrt(r * r - (yi0 - cy) ** 2), yi0], [cx + Math.sqrt(r * r - (yi0 - cy) ** 2), yi0]]), { w: 5, color: ICELINE, seed: 334, wob: 0.3 });
  sk.ink(dense([[cx - Math.sqrt(r * r - (yi1 - cy) ** 2), yi1], [cx + Math.sqrt(r * r - (yi1 - cy) ** 2), yi1]]), { w: 5, color: ICELINE, seed: 335, wob: 0.3 });
  // 얼음이 아래로 자라는 자리: 물과 닿은 얼음 밑면의 작은 얼음 바늘
  for (const [x, i] of [[540, 0], [600, 1], [660, 2], [720, 3]]) sk.ink(dense([[x, yi1], [x + (i % 2 ? 6 : -6), yi1 + 16]]), { w: 4, color: ICELINE, seed: 341 + i, wob: 0.2 });
  // 얼음이 자라는 밑면(물과 닿은 곳)에서 나온 열이 얼음을 지나 찬 공기로 빠져나간다(빨강)
  for (const [x, i] of [[548, 0], [632, 1], [716, 2]]) arrow(sk, [[x, yi1 - 2], [x + (i - 1) * 8, yi0 - 92]], { w: 8, color: HOT, seed: 351 + i, straight: true, head: 18, wob: 0.3 });
  for (const [x, y, len, i] of [[500, 166, 70, 0], [680, 150, 76, 1]]) wind(sk, x, y, len, 361 + i);
  // 얼음 아래 물에 꽂은 온도계: 3컷과 같은 눈금
  thermo(sk, 740, 440, 104, 0.42, 371, { w: 13, br: 11 });
  sk.ink(circ(cx, cy, r, { over: 0.06, seed: 381 }), { w: 8, seed: 382, wob: 0.4 });
  // 블랙: 크게 본 단면을 가리킨다
  const P = pose({ elR: [96, -350], haR: [174, -404], elL: [-50, -262], haL: [-18, -222], tilt: 0.06 });
  black(sk, 200, 700, 0.74, P, { face: "smile" });
  return sk;
}

/* ---------- 5. 여름 새벽, 이슬: 액화도 열을 내놓는다 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  ground(sk, 694, 501);
  const blade = (x, h, lean, sd) => { const b = curve([[x - 26, 694], [x - 12 + lean * 0.4, 694 - h * 0.55], [x + lean, 694 - h], [x + 22 + lean * 0.5, 694 - h * 0.5], [x + 26, 694]], false, 4); sk.fill([...b, b[0]], sd % 2 ? "#6BB55A" : "#7DBE6A", { dx: 0, dy: 0, wob: 0.6, seed: sd, tex: 0.7, texAng: 1.4 }); sk.ink(b, { w: 9, seed: sd + 1 }); };
  blade(470, 300, -60, 511); blade(580, 420, 30, 513); blade(700, 340, 80, 515); blade(810, 400, -30, 517); blade(900, 260, 50, 519);
  const dews = [[452, 480, 1.9], [596, 360, 2.2], [742, 440, 2], [798, 380, 1.8], [906, 520, 1.6], [560, 560, 1.5]];
  for (const [x, y, k] of dews) drop(sk, x, y, k);
  // 공기 속 수증기가 풀잎으로 내려와 맺힌다
  for (const [x, y, i] of [[520, 240, 0], [660, 190, 1], [860, 230, 2]]) vapor(sk, x, y, -110, 1.3 + i * 1.7);
  heatArrows(sk, 596, 366, 52, 92, [-2.5, -0.6, 0.5], 531); heatArrows(sk, 742, 446, 48, 86, [-0.9, 0.2, 2.6], 535); heatArrows(sk, 452, 486, 46, 82, [-2.4, 2.7], 539);
  const K = pose({ elR: [84, -280], haR: [152, -250], elL: [-50, -260], haL: [-24, -218], tilt: 0.1 });
  drawFigure(sk, 190, 694, 0.72, K, KID);
  return sk;
}

/* ---------- 6. 함박눈: 승화(기체 → 고체)도 열을 내놓는다 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  snowGround(sk, 664, 601);
  const cl = [[-12, -12], [972, -12], ...curve([[972, 196], [880, 214], [800, 196], [700, 218], [600, 198], [500, 220], [400, 200], [300, 220], [200, 198], [100, 216], [-12, 198]], false, 5)];
  cl.push(cl[0]);
  sk.fill(cl, "#E4E9EF", { dx: 0, dy: 0, wob: 0, seed: 603 });
  sk.ink(curve([[972, 196], [880, 214], [800, 196], [700, 218], [600, 198], [500, 220], [400, 200], [300, 220], [200, 198], [100, 216], [-12, 198]], false, 5), { w: 8, color: "#9AA6B4", seed: 604 });
  // 구름 속: 수증기가 곧장 얼음 알갱이가 되며 열을 내놓는다
  for (const [x, y, r, rot, i] of [[520, 104, 30, 0.3, 0], [700, 120, 34, 0.1, 1], [880, 92, 28, 0.5, 2]]) { snowflake(sk, x, y, r, 611 + i * 12, rot); heatArrows(sk, x, y, r + 14, r + 46, [-0.4, 2.7, 3.6], 711 + i * 4); }
  // 땅으로 내리는 눈
  for (const [x, y, r, rot, i] of [[330, 320, 30, 0.2, 0], [880, 380, 28, 0.4, 1], [690, 460, 24, 0.3, 2], [440, 480, 22, 0.6, 3], [860, 570, 20, 0.2, 4], [540, 300, 22, 0.1, 5]]) snowflake(sk, x, y, r, 651 + i * 12, rot);
  // 쌤: 두 팔을 벌린다. 학생: 손바닥으로 눈을 받는다
  const T = pose({ elL: [-96, -300], haL: [-164, -318], elR: [96, -300], haR: [164, -318], tilt: -0.04 });
  drawFigure(sk, 600, 668, 0.74, T, { ...SSAM, under: scarf(sk, C.red, 5) });
  const K = pose({ elR: [70, -300], haR: [130, -350], elL: [-50, -262], haL: [-18, -222], tilt: 0.06 });
  drawFigure(sk, 190, 668, 0.7, K, { ...KID, under: scarf(sk, "#3FAE5A", 9) });
  return sk;
}

/* ---------- 7. 사막: 반대로 기화는 열을 흡수한다 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  sun(sk, 880, 100, 46, { seed: 801 });
  const dune = [...curve([[-12, 640], [200, 660], [430, 630], [660, 664], [972, 620]], false, 5), [972, 732], [-12, 732]];
  dune.push(dune[0]);
  sk.fill(dune, "#F6E7C3", { dx: 0, dy: 0, wob: 0, seed: 803, tex: 0.5, texAng: 0.1 });
  sk.ink(curve([[-12, 640], [200, 660], [430, 630], [660, 664], [972, 620]]), { w: 9, seed: 804 });
  // 길손이 내민 물주머니(속이 보인다). 겉의 물이 날아가며 속의 물에서 열을 가져간다
  const wx = 510, wy = 400, ws = 1.5;
  waterbag(sk, wx, wy, ws, { seed: 811, cut: true, drops: [[-62, 24, 0.9], [60, 30, 0.9], [-40, 62, 0.8], [40, 64, 0.8], [68, -20, 0.8], [-66, -22, 0.8]] });
  for (const [x, y, i] of [[400, 330, 0], [420, 440, 1], [612, 320, 2], [600, 450, 3]]) vapor(sk, x, y, 90, 2.2 + i * 1.3, { amp: 7 });
  heatArrows(sk, wx, wy + 26, 50, 112, [Math.PI - 0.2, Math.PI + 0.3, -0.3, 0.2, Math.PI / 2 - 0.5, Math.PI / 2 + 0.5], 821, false, COOL);
  const Tp = pose({ elL: [-70, -300], haL: [-130, -300], elR: [50, -262], haR: [24, -218], tilt: -0.04 });
  drawFigure(sk, 740, 680, 0.7, Tp, { ...TRAVELER, name: "traveler" });
  sk.ink(curve([[740 - 0.7 * 130, 680 - 0.7 * 300], [wx + 110, wy - 120], [wx + 14, wy - 150]]), { w: 6, color: "#6B4A32", seed: 831, wob: 0.5 });
  const P = pose({ elR: [96, -330], haR: [156, -362], elL: [-50, -262], haL: [-18, -222], tilt: 0.06 });
  drawFigure(sk, 290, 680, 0.72, P, SSAM);
  return sk;
}

/* ---------- 8. 열이 나오는 길, 들어가는 길 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  ground(sk, 704, 901);
  // 세 모습: 얼음(왼쪽 아래), 물(오른쪽 아래), 수증기(위)
  const S = [400, 520], L = [760, 520], G = [580, 200];
  const cube = rrect(S[0] - 54, S[1] - 54, 108, 108, 18);
  sk.fill(cube, "#BFE2F4", { dx: 0, dy: 0, wob: 0.4, seed: 903 }); sk.ink(cube, { w: 8, seed: 904 });
  sk.ink(dense([[S[0] - 28, S[1] - 32], [S[0] - 8, S[1] - 4]]), { w: 5, color: C.white, seed: 905, wob: 0.2 });
  drop(sk, L[0], L[1] + 4, 3.0);
  for (const [dx, i] of [[-40, 0], [0, 1], [40, 2]]) vapor(sk, G[0] + dx, G[1] + 54, 108, 1.3 + i * 1.9, { amp: 9, w: 6 });
  // 방출(빨강)은 삼각형 바깥쪽, 흡수(파랑)는 안쪽
  const one = (a, b, side, col, sd) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], Lh = Math.hypot(dx, dy), ux = dx / Lh, uy = dy / Lh;
    const c = [(S[0] + L[0] + G[0]) / 3, (S[1] + L[1] + G[1]) / 3], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let nx = -uy, ny = ux; if ((mx + nx - c[0]) ** 2 + (my + ny - c[1]) ** 2 < (mx - c[0]) ** 2 + (my - c[1]) ** 2) { nx = -nx; ny = -ny; }
    const o = side * 22, p0 = [a[0] + ux * 90 + nx * o, a[1] + uy * 90 + ny * o], p1 = [b[0] - ux * 90 + nx * o, b[1] - uy * 90 + ny * o];
    arrow(sk, [p0, p1], { w: 10, color: col, seed: sd, straight: true, head: 22, wob: 0.3 });
    return [(p0[0] + p1[0]) / 2 + nx * 70, (p0[1] + p1[1]) / 2 + ny * 70];
  };
  const fr = one(L, S, 1, HOT, 911); one(S, L, -1, COOL, 913);
  const cd = one(G, L, 1, HOT, 915); one(L, G, -1, COOL, 917);
  const dp = one(G, S, 1, HOT, 919); one(S, G, -1, COOL, 921);
  // 방출의 예: 살얼음 낀 통(응고), 이슬(액화), 눈송이(승화)
  miniTub(sk, fr[0], fr[1] + 6, 931);
  drop(sk, cd[0] + 4, cd[1], 1.3);
  snowflake(sk, dp[0] - 4, dp[1], 26, 941, 0.2);
  // 쌤
  const T = pose({ elR: [96, -330], haR: [170, -370], elL: [-50, -262], haL: [-18, -222], tilt: 0.05 });
  drawFigure(sk, 130, 704, 0.7, T, SSAM);
  return sk;
}

export const META = {
  title: "연못은 왜<br><em>천천히 얼까?</em>",
  lead: "아무리 추운 밤에도 연못은 한꺼번에 꽁꽁 얼지 않아요. 260여 년 전 한 과학자가 온도계로 그 까닭을 찾아냈지요.",
  narrator: "앞에서는 상태가 변할 때 <b>열에너지를 흡수</b>하는 경우를 배웠지요. 오늘은 반대로 <b>열에너지를 방출하는</b> 상태 변화를 만나 볼게요.",
  cta: "실험으로 확인하기",
};

const TEXT = [
  {
    when: "1760년 무렵 겨울, 영국 글래스고", stage: "궁금증", title: "왜 한꺼번에 얼지 않지?",
    caption: "스코틀랜드의 과학자 <b>조지프 블랙</b>은 겨울마다 눈여겨본 것이 있었어요. 서리가 내린 추운 밤이 지나도 연못은 한꺼번에 두꺼운 얼음으로 덮이지 않고 살얼음만 끼었지요. 날씨가 이렇게 추운데 물은 왜 이렇게 천천히 얼까요?",
    bubbles: [{ who: "black", text: "밤새 추웠는데<br>살얼음뿐이네?" }],
  },
  {
    when: "1761년 겨울, 영국 글래스고", stage: "실마리", title: "블랙의 온도계",
    caption: "블랙은 온도계로 그 까닭을 살펴보았어요. 찬 공기 속에 두었던 온도계를 얼어 가는 물에 넣었더니, 눈금이 <b>0 ℃</b>로 올라가 물이 다 얼 때까지 그대로 머물렀지요.",
    bubbles: [{ who: "black", text: "눈금이<br>올라가네?" }],
  },
  {
    when: "1761년 겨울, 영국 글래스고", stage: "응고 = 방출", title: "얼면서 내놓는 열",
    caption: "블랙은 물이 얼어 얼음이 될 때(<b>응고</b>) 품고 있던 <b>열에너지를 밖으로 내놓는다</b>는 사실을 알아냈어요. 물이 얼면서 열을 방출하기 때문에 물이 다 얼 때까지 온도가 내려가지 않고 일정하게 유지되는 거예요.",
    term: { name: "응고 = 열에너지 방출", def: "액체가 고체로 변할 때는 열에너지를 <b>방출</b>해요. 다 얼 때까지 온도가 일정하고, 둘레의 온도는 덜 내려가요." },
  },
  {
    when: "1761년 겨울, 영국 글래스고", stage: "수수께끼 풀이", title: "연못이 천천히 어는 까닭",
    caption: "이제 연못의 수수께끼가 풀렸어요. 물이 얼려면 품고 있던 <b>열에너지를 밖으로 내놓아야</b> 하는데, 그 열이 얼음을 지나 찬 공기로 빠져나가는 데 시간이 걸려요. 그래서 아무리 추운 밤에도 연못은 겉에서부터 조금씩 천천히 얼지요.",
    bubbles: [{ who: "black", text: "그래서<br>천천히 어는군!" }],
  },
  {
    when: "여름 새벽, 풀밭", stage: "액화도 방출", title: "이슬이 맺힐 때",
    caption: "새벽녘 풀잎에 이슬이 맺힐 때도 열에너지가 나와요. 공기 속 수증기가 차가운 풀잎에 닿아 물방울로 바뀌는 <b>액화</b>가 일어나면서 주위로 <b>열에너지를 방출하기</b> 때문에 기온이 급격히 떨어지지 않아요.",
    bubbles: [{ who: "student", text: "이슬이<br>맺혔어요!" }],
  },
  {
    when: "겨울, 함박눈 오는 날", stage: "승화도 방출", title: "눈 오는 날은 포근해",
    caption: "함박눈이 펑펑 오는 날은 생각보다 덜 춥게 느껴질 때가 많아요. 구름 속에서 수증기가 물을 거치지 않고 곧바로 얼음 알갱이인 눈송이가 되는 <b>승화</b>가 일어나는데, 이때 나오는 <b>열에너지</b>가 추위를 누그러뜨리는 데 한몫하거든요.",
    bubbles: [{ who: "student", text: "생각보다<br>포근해요!" }],
  },
  {
    when: "한낮, 사막", stage: "반대로 흡수", title: "땀 흘리는 물주머니",
    caption: "반대로 상태가 변하며 <b>열에너지를 흡수</b>하면 주위가 시원해져요. 사막에서 쓰는 가죽 물주머니는 겉으로 배어 나온 물이 증발(<b>기화</b>)하면서 안쪽 물의 열을 빼앗아 가기 때문에 더운 날씨에도 물이 시원하게 유지돼요.",
    bubbles: [{ who: "traveler", text: "마셔<br>봐요" }, { who: "teacher", text: "와,<br>시원해!", dy: 6 }],
  },
  {
    stage: "정리", title: "열이 나오는 길, 들어가는 길",
    caption: "응고·액화·승화(기체→고체)가 일어날 때는 <b>열에너지를 방출해</b> 주위가 따뜻해지고, 융해·기화·승화(고체→기체)가 일어날 때는 <b>열에너지를 흡수해</b> 주위가 시원해져요. 이제 실험으로 상태 변화와 열에너지의 관계를 확인해 봐요!",
    term: { name: "열에너지를 방출하는 상태 변화", def: "<b>응고, 액화, 승화(기체 → 고체)</b>가 일어나는 동안 둘레의 온도가 높아지거나 덜 내려가요." },
  },
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7, p8].map((fn, i) => ({ sk: fn(), ...TEXT[i] }));
}
