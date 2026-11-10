// 중1 과학 u4l6 도입 만화: 물을 쓰는 두 가지 지혜(기화는 흡수, 응고·액화·승화는 방출). 7컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u4l6.md.
//   이글루 벽에 물을 뿌려 집을 데운다는 이야기는 근거가 약해 쓰지 않는다. 방출의 척추는 서리 내리는 밤의 과수원이다.
//   1 사막의 축축한 물주머니 → 2 기화 = 흡수 → 3 봄밤, 사과나무에 물을 뿌리는 농부 → 4 응고 = 방출(얼음 옷 입은 꽃)
//   → 5 이슬(액화도 방출) → 6 함박눈(승화도 방출) → 7 열이 들어가고 나오는 길
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, sparkle, drop, squiggle, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER } from "../lib/figure.mjs";
import { sun, moon } from "../lib/props.mjs";

const W = 960, H = 720;
const TRAVELER = { hair: "short", hairColor: "#5B463A", fringe: 24, hat: "brim", hatColor: "#D9B77A", coat: { color: "#EADDBB", seam: "#B59B6A" }, seed: 211 };
const FARMER = { hair: "short", hairColor: "#9A9A9A", fringe: 24, hat: "brim", hatColor: "#E8C96A", coat: { color: "#4F7FB8", seam: "#365A85", len: 30 }, seed: 221 };
const ICE = "#D6EEFA", ICELINE = "#7FB6D6", LEATHER = "#B9814A";
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });
const scarf = sk => () => { const s = curve([[-44, -352], [-10, -334], [34, -336], [48, -352], [40, -326], [0, -314], [-38, -326]], true, 3); sk.fill(s, C.red, { dx: 1, dy: 1.2, wob: 0.6, seed: 5 }); sk.ink(s, { w: 8, seed: 6, wob: 0.7 }); const t = poly([[14, -326], [38, -326], [44, -262], [20, -262]], 3); sk.fill(t, C.red, { dx: 1, dy: 1.2, wob: 0.6, seed: 7 }); sk.ink(t, { w: 8, seed: 8, wob: 0.7 }); };
// 눈에 안 보이는 수증기: 점선 물결(위로 올라가거나, len 이 음수면 아래로 내려온다)
const vapor = (sk, x, y, len, sd, o = {}) => sk.ink(squiggle(x, y, len, o.amp ?? 9, o.waves ?? 2, sd, 0), { w: o.w ?? 5, color: "#7FA8C9", dash: [9, 11], seed: sd, wob: 0 });
// 열이 드나드는 표시: 가운데에서 바깥으로(out) 또는 바깥에서 가운데로(in) 향하는 짧은 빨간 화살표들
function heat(sk, x, y, r0, r1, list, sd, inward = false) {
  list.forEach((a, i) => {
    const p0 = [x + r0 * Math.cos(a), y + r0 * Math.sin(a)], p1 = [x + r1 * Math.cos(a), y + r1 * Math.sin(a)];
    arrow(sk, inward ? [p1, p0] : [p0, p1], { w: 6, color: C.red, seed: sd + i, straight: true, head: 14, wob: 0.3 });
  });
}
// 물주머니: 둥근 가죽 자루 + 묶은 목. 원점 = 자루 가운데. cut 이면 속의 물이 보인다
function waterbag(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 231;
  sk.at(x, y, s, () => {
    const body = curve([[-16, -78], [-58, -50], [-74, 4], [-56, 56], [0, 76], [56, 56], [74, 4], [58, -50], [16, -78]], false, 4);
    const shape = [...body, body[0]];
    sk.fill(shape, LEATHER, { dx: 1, dy: 1.4, wob: 0.8, seed: sd, tex: true, texAng: 0.8 });
    if (o.cut) {
      const w = curve([[-52, -8], [-26, -16], [0, -8], [26, -16], [52, -8], [48, 36], [0, 60], [-48, 36]], true, 4);
      sk.fill(w, "#4A90D9", { dx: 0, dy: 0, wob: 0.4, seed: sd + 1, tex: 0.6 }); sk.ink(w, { w: 4 / s + 2, color: "#2F6DB5", seed: sd + 2, wob: 0.4 });
    }
    sk.ink(shape, { w: 9 / Math.sqrt(s), seed: sd + 3, wob: 0.8 });
    const neck = poly([[-18, -80], [18, -80], [22, -104], [-22, -104]], 3);
    sk.fill(neck, mix(LEATHER, "#000000", 0.2), { dx: 0, dy: 0, wob: 0.4, seed: sd + 4 }); sk.ink(neck, { w: 8 / Math.sqrt(s), seed: sd + 5, wob: 0.5 });
    sk.ink(dense([[-24, -80], [24, -80]]), { w: 7 / Math.sqrt(s), color: C.red, seed: sd + 6, wob: 0.3 });
  });
  // 겉에 맺힌 물방울
  for (const [dx, dy, k] of (o.drops ?? [[-52, 30, 0.9], [44, 42, 0.8], [-20, 66, 0.7], [58, -6, 0.7]])) drop(sk, x + dx * s, y + dy * s, k * Math.sqrt(s));
}
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
// 사과나무: 줄기 + 둥근 잎 뭉치 + 꽃
function appleTree(sk, x, y, s, sd = 251) {
  sk.at(x, y, s, () => {
    const trunk = poly([[-26, 0], [-18, -190], [18, -190], [28, 0]], 4);
    sk.fill(trunk, "#8A5A33", { seed: sd, tex: true, texAng: 1.5 }); sk.ink(trunk, { w: 10, seed: sd + 1 });
    const top = curve([[-40, -180], [-150, -200], [-190, -300], [-150, -400], [-60, -460], [40, -470], [140, -420], [196, -320], [160, -210], [50, -180]], true, 5);
    sk.fill(top, "#7DBE6A", { seed: sd + 2, tex: true, texAng: 0.6 }); sk.ink(top, { w: 11, seed: sd + 3 });
  });
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

/* ---------- 1. 사막: 땀 흘리는 물주머니 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  sun(sk, 874, 100, 52, { seed: 701 });
  const dune = [...curve([[-12, 610], [200, 640], [430, 600], [660, 646], [972, 590]], false, 5), [972, 732], [-12, 732]];
  dune.push(dune[0]);
  sk.fill(dune, "#F4E2B4", { dx: 0, dy: 0, wob: 0, seed: 11, tex: 0.5, texAng: 0.1 });
  sk.ink(curve([[-12, 610], [200, 640], [430, 600], [660, 646], [972, 590]]), { w: 9, seed: 12 });
  // 여행자와 어깨에 멘 물주머니
  const tp = pose({ elL: [-56, -262], haL: [-76, -200], elR: [56, -262], haR: [70, -196] });
  const tx = 640, ty = 690, ts = 0.72;
  drawFigure(sk, tx, ty, ts, tp, { ...TRAVELER, name: "traveler" });
  sk.ink(curve([[tx - 6, ty - ts * 330], [520, 420], [462, 428]]), { w: 7, color: "#6B4A32", seed: 13, wob: 0.6 });
  waterbag(sk, 452, 500, 0.9, { seed: 231 });
  // 쌤: 주머니에 손을 대 본다
  const P = pose({ elR: [84, -292], haR: [146, -272], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  const fx = 236, fy = 690, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher" });
  drop(sk, 760, 330, 1.1);
  return sk;
}

/* ---------- 2. 기화 = 흡수: 마르면서 열을 가져가요 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  sun(sk, 846, 110, 46, { seed: 701 });
  waterbag(sk, 470, 420, 3, { seed: 241, cut: true, drops: [[-64, 24, 0.9], [62, 32, 0.9], [-44, 62, 0.8], [40, 66, 0.8], [70, -22, 0.8], [-70, -24, 0.8]] });
  // 겉의 물이 수증기로 날아간다
  vapor(sk, 220, 360, 150, 1.1); vapor(sk, 262, 470, 130, 2.6); vapor(sk, 716, 360, 150, 3.4); vapor(sk, 680, 480, 130, 0.4); vapor(sk, 760, 250, 110, 2);
  // 속의 물에서 겉으로 빠져나가는 열
  heat(sk, 470, 470, 112, 196, [Math.PI - 0.25, Math.PI + 0.35, -0.35, 0.25, Math.PI / 2 - 0.5, Math.PI / 2 + 0.5], 21);
  return sk;
}

/* ---------- 3. 과수원: 서리 내리는 봄밤 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  moon(sk, 112, 104, 40);
  for (const [x, y, r, i] of [[270, 70, 9, 0], [420, 130, 6, 1], [900, 110, 8, 2], [560, 60, 5, 3]]) sparkle(sk, x, y, r, { seed: 31 + i, w: 3 });
  ground(sk, 694, 35);
  appleTree(sk, 720, 694, 1.02, 251);
  // 농부: 호스로 물을 뿌린다
  const fp = pose({ elR: [84, -300], haR: [150, -322], elL: [40, -262], haL: [96, -250], tilt: 0.04 });
  const gx = 372, gy = 694, gs = 0.66;
  const hx = gx + gs * 150, hy = gy - gs * 322;
  sk.ink(curve([[300, 690], [330, 640], [gx + gs * 96, gy - gs * 250], [hx, hy]]), { w: 10, color: "#4E9A46", seed: 37, wob: 0.8 });
  drawFigure(sk, gx, gy, gs, fp, { ...FARMER, name: "farmer" });
  for (const [ex, ey, i] of [[640, 270, 0], [680, 370, 1], [650, 460, 2]]) sk.ink(curve([[hx + 14, hy - 6], [(hx + ex) / 2, Math.min(hy, ey) - 60 + i * 26], [ex, ey]]), { w: 6, color: "#5BA8EE", dash: [14, 12], seed: 39 + i, wob: 0.5 });
  drop(sk, 610, 330, 1); drop(sk, 660, 430, 0.9); drop(sk, 596, 420, 0.8);
  // 쌤: 깜짝 놀란다
  const wow = pose({ elL: [-104, -362], haL: [-156, -448], elR: [104, -362], haR: [156, -448], tilt: -0.04 });
  drawFigure(sk, 150, 694, 0.66, wow, { ...TEACHER, name: "teacher" });
  emark(sk, 116, 214, 0.8, { color: C.red, rot: -0.1 }); qmark(sk, 176, 222, 0.62, { color: C.teal, seed: 43 });
  return sk;
}

/* ---------- 4. 응고 = 방출: 얼음 옷 입은 꽃 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  // 크게 본 가지
  const br = curve([[420, 680], [520, 560], [640, 430], [780, 330], [930, 250]]);
  sk.ink(br, { w: 40, seed: 51, wob: 1 }); sk.ink(br, { w: 26, color: "#8A5A33", seed: 51, wob: 1 });
  const tw = curve([[640, 430], [650, 330], [698, 236]]);
  sk.ink(tw, { w: 28, seed: 52, wob: 1 }); sk.ink(tw, { w: 16, color: "#8A5A33", seed: 52, wob: 1 });
  for (const [x, y, r, i] of [[540, 470, 54, 0], [704, 214, 50, 1], [820, 400, 52, 2], [880, 196, 38, 3]]) {
    blossom(sk, x, y, r, 61 + i * 30, true);
    heat(sk, x, y, r * 1.5, r * 1.5 + 42, i === 3 ? [-2.2, -0.9] : [-2.6, -1.57, -0.5, 0.6, 2.5].slice(0, i === 2 ? 4 : 5), 181 + i * 6);
  }
  sparkle(sk, 620, 300, 12, { seed: 205 });
  const P = pose({ elR: [88, -310], haR: [158, -324], elL: [-50, -260], haL: [-24, -218], tilt: 0.08 });
  drawFigure(sk, 190, 704, 0.74, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 5. 액화도 방출: 이슬이 맺히는 새벽 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  ground(sk, 694, 211);
  // 크게 본 풀잎과 이슬
  const blade = (x, h, lean, sd) => { const b = curve([[x - 26, 694], [x - 12 + lean * 0.4, 694 - h * 0.55], [x + lean, 694 - h], [x + 22 + lean * 0.5, 694 - h * 0.5], [x + 26, 694]], false, 4); sk.fill([...b, b[0]], sd % 2 ? "#6BB55A" : "#7DBE6A", { dx: 0, dy: 0, wob: 0.6, seed: sd, tex: 0.7, texAng: 1.4 }); sk.ink(b, { w: 9, seed: sd + 1 }); };
  blade(470, 300, -60, 213); blade(580, 420, 30, 214); blade(700, 340, 80, 215); blade(810, 400, -30, 216); blade(900, 260, 50, 217);
  const dews = [[452, 480, 1.9], [596, 360, 2.2], [742, 440, 2], [798, 380, 1.8], [906, 520, 1.6], [560, 560, 1.5]];
  for (const [x, y, k] of dews) drop(sk, x, y, k);
  // 공기 속 수증기가 풀잎으로 내려와 맺힌다
  for (const [x, y, i] of [[520, 250, 0], [660, 190, 1], [860, 230, 2]]) sk.ink(squiggle(x, y, 120, 9, 2, i, 0), { w: 5, color: "#7FA8C9", dash: [9, 11], seed: 221 + i, wob: 0 });
  heat(sk, 596, 366, 52, 96, [-2.5, -0.6, 0.5], 225); heat(sk, 742, 446, 48, 90, [-0.9, 0.2, 2.6], 229); heat(sk, 452, 486, 46, 86, [-2.4, 2.7], 233);
  const P = pose({ elR: [84, -280], haR: [152, -250], elL: [-50, -260], haL: [-24, -218], tilt: 0.1 });
  drawFigure(sk, 190, 694, 0.74, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 6. 승화도 방출: 눈 오는 날은 포근해 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  // 쌓인 눈
  const snow = [...curve([[-12, 664], [200, 648], [470, 668], [730, 646], [972, 662]], false, 5), [972, 732], [-12, 732]];
  snow.push(snow[0]);
  sk.fill(snow, "#EEF5FA", { dx: 0, dy: 0, wob: 0, seed: 241 }); sk.ink(curve([[-12, 664], [200, 648], [470, 668], [730, 646], [972, 662]]), { w: 9, seed: 242 });
  const flakes = [[110, 150, 44, 0.2], [270, 330, 34, 0.5], [760, 120, 46, 0.1], [880, 330, 36, 0.4], [690, 420, 28, 0.3], [150, 480, 28, 0.6], [860, 540, 24, 0.2], [300, 110, 26, 0.4]];
  flakes.forEach(([x, y, r, rot], i) => snowflake(sk, x, y, r, 251 + i * 12, rot));
  heat(sk, 110, 150, 58, 98, [-0.5, 0.7, 2.2], 351); heat(sk, 760, 120, 60, 100, [0.6, 2.2, 3.4], 355); heat(sk, 880, 330, 48, 86, [-2.4, 2.2], 359); heat(sk, 270, 330, 46, 84, [-0.9, 0.5], 363);
  const P = pose({ elL: [-96, -300], haL: [-164, -318], elR: [96, -300], haR: [164, -318], tilt: -0.04 });
  drawFigure(sk, 490, 668, 0.76, P, { ...TEACHER, name: "teacher", under: scarf(sk) });
  return sk;
}

/* ---------- 7. 정리: 열이 들어가고 나오는 길 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  // 왼쪽: 열을 흡수하는 변화(시원), 오른쪽: 열을 방출하는 변화(따뜻)
  const cool = curve([[40, 330], [70, 190], [210, 150], [330, 210], [356, 370], [300, 520], [150, 548], [56, 470]], true, 5);
  sk.fill(cool, "#E3F1FB", { dx: 0, dy: 0, wob: 1, seed: 371 });
  const warm = curve([[604, 330], [640, 170], [790, 120], [900, 190], [926, 360], [880, 520], [720, 560], [620, 480]], true, 5);
  sk.fill(warm, "#FDEBD8", { dx: 0, dy: 0, wob: 1, seed: 372 });
  waterbag(sk, 200, 370, 1.1, { seed: 261 });
  vapor(sk, 150, 270, 80, 1.2); vapor(sk, 250, 262, 80, 3);
  heat(sk, 200, 372, 96, 142, [Math.PI - 0.4, Math.PI + 0.5, -0.5, 0.4], 373, true);
  blossom(sk, 700, 250, 38, 381, true); heat(sk, 700, 250, 58, 94, [-2.4, -1.2, 2.6], 391);
  drop(sk, 840, 290, 2.2); heat(sk, 840, 294, 44, 80, [-0.8, 0.5], 395);
  snowflake(sk, 770, 440, 44, 401, 0.2); heat(sk, 770, 440, 58, 96, [-0.3, 1.3, 2.9], 421);
  const P = pose({ elL: [-96, -296], haL: [-166, -300], elR: [96, -296], haR: [166, -300], tilt: 0.02 });
  drawFigure(sk, 480, 704, 0.74, P, { ...TEACHER, name: "teacher" });
  return sk;
}

const BUBBLES = [
  [{ who: "teacher", text: "어, 시원해!" }, { who: "traveler", text: "마셔 봐요" }],
  null,
  [{ who: "farmer", text: "지켜봐요" }],
  [{ who: "teacher", text: "꽃이<br>멀쩡해!" }],
  [{ who: "teacher", text: "이슬도<br>같은 편!" }],
  [{ who: "teacher", text: "의외로<br>안 춥네!" }],
  null,
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
