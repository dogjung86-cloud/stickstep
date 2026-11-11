// 중1 과학 u4l6 도입 만화(v2): 사과꽃을 지킨 얼음 옷(응고, 액화, 승화는 열에너지를 방출한다). 8컷. 배선 전.
// 조사와 콘티는 qa/sketch/research/v2/u4l6.md.
//   1 봄밤 과수원, 서리가 온다는데 나무에 물을 뿌린다(궁금증)
//   2 1761년 겨울 글래스고, 블랙: 찬 공기 속 온도계를 얼어 가는 물에 넣으면 눈금이 올라간다
//   3 블랙의 생각: 물은 얼면서 열을 내놓는다, 다 얼 때까지 온도가 일정하다(응고 = 방출)
//   4 새벽 과수원: 얼음 옷 속 꽃은 0 ℃ 가까이에 머물러 멀쩡하다
//   5 이슬(액화도 방출) → 6 함박눈(승화도 방출) → 7 사막의 물주머니(반대로 기화는 흡수)
//   → 8 열이 나오는 길(빨강)과 들어가는 길(파랑)
// 화살표 색: 빨강 = 상태가 변하는 물질에서 열이 나온다(방출), 파랑 = 상태가 변하는 물질로 열이 들어간다(흡수). 찬 공기는 화살촉 없는 옅은 바람 선.
// 이글루 벽에 물을 뿌려 집을 데운다는 이야기는 근거가 약해 쓰지 않는다.
// 블랙의 과냉각 이야기(파렌하이트가 본, 0 ℃ 아래에서도 얼지 않은 물)는 0 ℃에서 온도가 멈추는 냉각 곡선 랩과 헷갈릴 수 있어 쓰지 않는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, sparkle, drop, squiggle, arrow } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { sun, moon, cloud } from "../../lib/props.mjs";

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
// 과수원 농부: 털모자 + 초록 작업복. 사막 길손: 챙 넓은 모자 + 긴 옷. 둘 다 얼굴 없음
const FARMER = { hair: "knit", capColor: "#C0504A", coat: { color: "#4E7A4A", seam: "#34553A", len: 24 }, seed: 561 };
const TRAVELER = { hair: "short", hairColor: "#5B463A", fringe: 24, hat: "brim", hatColor: "#D9B77A", coat: { color: "#EADDBB", seam: "#B59B6A", len: 90 }, seed: 571 };
const SSAM = { ...TEACHER, name: "teacher" };
const KID = { ...STUDENT, name: "student" };

/* ---------- 소품 ---------- */
// 사과꽃: 분홍 꽃잎 다섯 장. ice 면 투명한 얼음 껍질을 씌운다
function blossom(sk, x, y, r, sd, ice = false) {
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; const p = circ(x + r * 0.56 * Math.cos(a), y + r * 0.56 * Math.sin(a), r * 0.46, { over: 0.15, seed: sd + i }); sk.fill(p, "#F9BFD0", { dx: 0, dy: 0, wob: 0.4, seed: sd + 5 + i }); sk.ink(p, { w: Math.max(3.5, r * 0.13), color: "#D9788F", seed: sd + 10 + i, wob: 0.4 }); }
  sk.dot(x, y, r * 0.24, C.yellow);
  if (ice) {
    const sh = circ(x, y, r * 1.34, { over: 0.15, seed: sd + 20, lump: 0.07 });
    sk.fill(sh, ICE, { dx: 0, dy: 0, wob: 0.6, seed: sd + 21, alpha: 0.55 });
    sk.ink(sh, { w: Math.max(4, r * 0.14), color: ICELINE, seed: sd + 22, wob: 0.6 });
    sk.ink(curve([[x - r * 0.9, y - r * 0.3], [x - r * 0.7, y - r * 0.8], [x - r * 0.2, y - r * 1.02]]), { w: Math.max(3, r * 0.1), color: C.white, seed: sd + 23, wob: 0.2 });
  }
}
function appleTree(sk, x, y, s, sd = 251) {
  thin(sk, 0.86, () => sk.at(x, y, s, () => {
    const trunk = poly([[-26, 0], [-18, -190], [18, -190], [28, 0]], 4);
    sk.fill(trunk, "#8A5A33", { seed: sd, tex: true, texAng: 1.5 }); sk.ink(trunk, { w: 10, seed: sd + 1 });
    const top = curve([[-40, -180], [-150, -200], [-190, -300], [-150, -400], [-60, -460], [40, -470], [140, -420], [196, -320], [160, -210], [50, -180]], true, 5);
    sk.fill(top, "#7DBE6A", { seed: sd + 2, tex: true, texAng: 0.6 }); sk.ink(top, { w: 11, seed: sd + 3 });
  }));
  for (const [dx, dy, i] of [[-110, -290, 0], [-30, -390, 1], [70, -330, 2], [130, -250, 3], [-40, -250, 4], [60, -420, 5], [-120, -370, 6]]) blossom(sk, x + dx * s, y + dy * s, 24 * s, sd + 10 + i * 30);
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

/* ---------- 1. 봄밤, 과수원: 꽃에 물을 뿌린다고? ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  moon(sk, 560, 74, 34);
  for (const [x, y, r, i] of [[650, 60, 7, 0], [460, 70, 6, 1], [900, 120, 6, 2]]) sparkle(sk, x, y, r, { seed: 11 + i, w: 3 });
  ground(sk, 694, 15);
  appleTree(sk, 470, 694, 1.0, 251);
  // 키 큰 관 위의 스프링클러가 나무 위로 물을 뿌린다
  thin(sk, 0.86, () => {
    sk.ink(dense([[690, 694], [690, 236]]), { w: 12, color: "#8A9099", seed: 21, wob: 0.3 });
    const head = rrect(676, 214, 28, 26, 6);
    sk.fill(head, "#5A5F68", { dx: 0, dy: 0, wob: 0.3, seed: 22 }); sk.ink(head, { w: 6, seed: 23, wob: 0.3 });
    const valve = circ(690, 600, 16, { over: 0.15, seed: 24 });
    sk.fill(valve, C.red, { dx: 0, dy: 0, wob: 0.4, seed: 25 }); sk.ink(valve, { w: 6, seed: 26, wob: 0.4 });
  });
  for (const [ex, ey, i] of [[330, 250, 0], [420, 200, 1], [560, 230, 2]]) sk.ink(curve([[680, 214], [(680 + ex) / 2, 150 - i * 12], [ex, ey]]), { w: 6, color: "#5BA8EE", dash: [14, 12], seed: 31 + i, wob: 0.5 });
  for (const [x, y, k] of [[340, 290, 0.9], [430, 250, 0.8], [560, 270, 0.9], [380, 360, 0.7], [520, 330, 0.7]]) drop(sk, x, y, k);
  // 농부: 밸브 곁에 선다
  const F = pose({ elL: [-56, -262], haL: [-96, -232], elR: [50, -262], haR: [24, -218] });
  drawFigure(sk, 840, 694, 0.66, F, { ...FARMER, name: "farmer" });
  // 쌤: 깜짝 놀란다
  const wow = pose({ elL: [-104, -362], haL: [-156, -448], elR: [104, -362], haR: [156, -448], tilt: -0.04 });
  drawFigure(sk, 150, 694, 0.66, wow, SSAM);
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

/* ---------- 4. 새벽 과수원: 얼음 옷 입은 꽃 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  // 크게 본 가지
  const br = curve([[440, 720], [530, 590], [640, 460], [780, 350], [940, 270]]);
  sk.ink(br, { w: 40, seed: 301, wob: 1 }); sk.ink(br, { w: 26, color: "#8A5A33", seed: 301, wob: 1 });
  const tw = curve([[640, 460], [656, 360], [700, 270]]);
  sk.ink(tw, { w: 28, seed: 302, wob: 1 }); sk.ink(tw, { w: 16, color: "#8A5A33", seed: 302, wob: 1 });
  for (const [x, y, r, i] of [[560, 500, 52, 0], [706, 248, 48, 1], [826, 420, 50, 2]]) {
    blossom(sk, x, y, r, 311 + i * 30, true);
    heatArrows(sk, x, y, r * 1.5, r * 1.5 + 40, [-2.6, -1.57, -0.5, 0.6, 2.5].slice(0, i === 2 ? 4 : 5), 411 + i * 6);
  }
  // 얼음 옷을 입은 온도계(가지에 매달아 물을 함께 맞았다): 눈금이 공기보다 높다
  sk.ink(dense([[880, 300], [880, 330]]), { w: 3, seed: 421, wob: 0 });
  thermo(sk, 880, 520, 180, 0.42, 431, { w: 14, br: 12 });
  const shell = curve([[858, 548], [852, 470], [866, 420], [894, 420], [908, 470], [902, 548], [880, 560]], true, 4);
  sk.fill(shell, ICE, { dx: 0, dy: 0, wob: 0.5, seed: 441, alpha: 0.32 }); sk.ink(shell, { w: 5, color: ICELINE, seed: 442, wob: 0.5 });
  // 농부: 공기 속 온도를 재는 온도계를 든다(눈금이 낮다)
  thermo(sk, 194, 590, 150, 0.16, 451, { w: 13, br: 11 });
  const F = pose({ elR: [70, -330], haR: [136, -416], elL: [-56, -262], haL: [-96, -232] });
  drawFigure(sk, 110, 704, 0.62, F, FARMER);
  const P = pose({ elR: [96, -340], haR: [176, -360], elL: [-50, -262], haL: [-18, -222], tilt: 0.06 });
  drawFigure(sk, 290, 704, 0.74, P, SSAM);
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
  // 방출의 예: 얼음 옷 꽃(응고), 이슬(액화), 눈송이(승화)
  blossom(sk, fr[0], fr[1] + 10, 24, 931, true);
  drop(sk, cd[0] + 4, cd[1], 1.3);
  snowflake(sk, dp[0] - 4, dp[1], 26, 941, 0.2);
  // 쌤
  const T = pose({ elR: [96, -330], haR: [170, -370], elL: [-50, -262], haL: [-18, -222], tilt: 0.05 });
  drawFigure(sk, 130, 704, 0.7, T, SSAM);
  return sk;
}

export const META = {
  title: "사과꽃을 지킨<br><em>얼음 옷</em>",
  lead: "추운 봄밤, 과수원에서는 꽃에 일부러 물을 뿌려요. 그 비밀은 260여 년 전 한 과학자의 온도계에서 시작돼요.",
  narrator: "앞에서는 상태가 변할 때 <b>열에너지를 흡수</b>하는 경우를 배웠지요. 오늘은 그 반대, 열에너지를 <b>내놓는</b> 상태 변화가 주인공이에요.",
  cta: "실험으로 확인하기",
};

const TEXT = [
  {
    when: "봄밤, 사과 과수원", stage: "궁금증", title: "꽃에 물을 뿌린다고?",
    caption: "사과꽃이 막 핀 봄밤, 기온이 영하로 떨어진다는 소식이 왔어요. 그런데 과수원에서는 나무에 물을 뿌리기 시작했어요. 추운 밤에 물을 뿌리면 꽃이 더 꽁꽁 얼지 않을까요?",
    bubbles: [{ who: "teacher", text: "물을<br>뿌려요?" }],
  },
  {
    when: "1761년 겨울, 영국 글래스고", stage: "실마리", title: "블랙의 온도계",
    caption: "1761년 겨울, 스코틀랜드의 과학자 조지프 블랙은 아무리 추워도 연못이 한꺼번에 얼지 않는 것을 궁금해했어요. 제자가 남긴 기록에 따르면, 찬 공기 속 온도계를 얼어 가는 물에 넣으면 눈금이 오히려 올라가고, 물이 다 얼 때까지 그 눈금에 머물렀어요.",
    bubbles: [{ who: "black", text: "눈금이<br>올라가네?" }],
  },
  {
    when: "1761년 겨울, 영국 글래스고", stage: "응고 = 방출", title: "얼면서 내놓는 열",
    caption: "블랙은 이렇게 생각했어요. 얼어 가는 물은 찬 공기에 계속 열을 빼앗기는데도 온도가 내려가지 않아요. 물이 얼면서 품고 있던 열을 내놓기 때문이에요. 그래서 다 얼 때까지 온도가 일정하고, 연못도 천천히 얼어요. 오늘날에도 이렇게 설명해요.",
    term: { name: "응고 = 열에너지 방출", def: "액체가 고체로 변할 때는 열에너지를 <b>방출</b>해요. 다 얼 때까지 온도가 일정하고, 둘레의 온도는 덜 내려가요." },
  },
  {
    when: "다음 날 새벽, 사과 과수원", stage: "응고 = 방출", title: "얼음 옷 입은 꽃",
    caption: "밤새 뿌린 물이 꽃을 감싸며 얼어 얼음 옷이 됐어요. 물을 멈추지 않고 뿌리는 동안 물이 계속 얼면서 열을 내놓아, 얼음 옷 속 꽃은 0 ℃ 가까이에 머물렀어요. 둘레의 공기보다 덜 차가웠던 거예요. 아침에도 꽃은 멀쩡했어요.",
    bubbles: [{ who: "teacher", text: "꽃이<br>멀쩡해!" }],
  },
  {
    when: "여름 새벽, 풀밭", stage: "액화도 방출", title: "이슬이 맺힐 때",
    caption: "풀잎에 이슬이 맺힐 때도 열에너지가 나와요. 공기 속 수증기가 차가운 풀잎에 닿아 물방울로 맺히는(액화) 동안 열을 내놓거든요. 그래서 이슬이 맺히는 밤에는 기온이 조금 덜 내려가요.",
    bubbles: [{ who: "student", text: "이슬이<br>맺혔어요!" }],
  },
  {
    when: "겨울, 함박눈 오는 날", stage: "승화도 방출", title: "눈 오는 날은 포근해",
    caption: "함박눈이 오는 날은 생각보다 포근하게 느껴지곤 해요. 하늘의 구름 속에서 수증기가 물을 거치지 않고 곧장 얼음 알갱이(눈)가 될 때(승화) 내놓는 열에너지도 한몫해요.",
    bubbles: [{ who: "student", text: "생각보다<br>포근해요!" }],
  },
  {
    when: "한낮, 사막", stage: "반대로 흡수", title: "땀 흘리는 물주머니",
    caption: "반대로 열에너지를 흡수하는 변화는 둘레를 시원하게 해요. 사막을 오가는 사람들은 겉이 늘 축축한 물주머니를 써요. 겉에 배어 나온 물이 마르면서(기화) 속의 물에서 열을 가져가, 속의 물이 바깥보다 시원해요.",
    bubbles: [{ who: "traveler", text: "마셔<br>봐요" }, { who: "teacher", text: "와,<br>시원해!" }],
  },
  {
    stage: "정리", title: "열이 나오는 길, 들어가는 길",
    caption: "물이 얼 때, 수증기가 물방울이나 얼음이 될 때는 열이 나와 둘레가 덜 추워져요(빨간 화살표). 얼음이 녹거나, 물이 마르거나, 얼음이 곧장 수증기가 될 때는 열이 들어가 둘레가 시원해져요(파란 화살표). 이제 수증기를 식히며 온도가 멈추는 순간을 찾아봐요.",
    term: { name: "열에너지를 방출하는 상태 변화", def: "<b>응고, 액화, 승화(기체 → 고체)</b>. 일어나는 동안 둘레의 온도가 높아지거나 덜 내려가요." },
  },
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7, p8].map((fn, i) => ({ sk: fn(), ...TEXT[i] }));
}
