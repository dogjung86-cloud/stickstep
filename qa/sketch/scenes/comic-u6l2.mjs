// 중1 과학 u6l2 도입 만화: 계단 위의 J자 유리관(보일 법칙). 7컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u6l2.md.
//   1 공기에 용수철이? → 2 계단에 매단 J자 관 → 3 위에서 붓고 아래서 재고 → 4 관이 깨졌다(첫 시도)
//   → 5 다시 잰 결과, 두 배로 누르면 절반 → 6 반대로 당기면 늘어나는 공기(보일 법칙, 온도 일정)
//   → 7 오늘날: 용수철 대신 입자로
// 보일 자신의 설명은 "공기의 용수철"이었다. 입자 사이 빈 공간은 오늘날의 설명이라 마지막 컷에서 쌤이 한다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, check, sparkle, drop, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, HOOKE } from "../lib/figure.mjs";
import { notebook, quill } from "../lib/props.mjs";

const W = 960, H = 720;
// 보일: 밝은 곱슬 가발 + 푸른 외투. 훅은 세포 만화의 그 훅(갈색 곱슬머리 + 갈색 외투). 다른 학자: 챙 넓은 모자 + 잿빛 망토
const BOYLE = { hair: "curls", hairColor: "#DAD3C3", coat: { color: "#3F5E8C", buttons: C.gold, seam: "#2A3F5F" }, seed: 231 };
const CRITIC = { hair: "short", hairColor: "#5B463A", fringe: 24, hat: "brim", hatColor: "#3A3A40", coat: { color: "#7A7F88", seam: "#55595F" }, seed: 241 };
const AIR = "#BFE9E2", HG = "#AEB6C0", GLASS = "#F6FBFD";
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

// J자 유리관. 긴 다리(xl, 위가 열림)와 짧은 다리(xs, 위가 막힘)가 아래에서 굽어 이어진다.
//   top: 긴 다리 꼭대기, shortTop: 짧은 다리 꼭대기, yb: 굽은 곳의 중심 높이
//   air: 갇힌 공기 기둥의 길이, long: 긴 다리 수은 면의 높이(y), stub: 긴 다리가 깨져 남은 꼭대기(y)
function jtube(sk, o) {
  const { xl, xs, top, shortTop, yb, air } = o, tw = o.tw ?? 26, sd = o.sd ?? 301, r = (xl - xs) / 2;
  const bend = ell((xl + xs) / 2, yb, r, r, 0, Math.PI);
  const lTop = o.stub ?? top;
  const cl = [...dense([[xl, lTop], [xl, yb]], 6), ...bend, ...dense([[xs, yb], [xs, shortTop]], 6)];
  sk.ink(cl, { w: tw + 12, seed: sd, wob: 0.5 });
  sk.ink([...dense([[xl, lTop - 9], [xl, yb]], 6), ...bend, ...dense([[xs, yb], [xs, shortTop + 4]], 6)], { w: tw, color: GLASS, seed: sd, wob: 0.5, cap: "butt" });
  const yS = shortTop + air;
  if (o.long !== undefined) sk.ink([...dense([[xl, o.long], [xl, yb]], 6), ...bend, ...dense([[xs, yb], [xs, yS]], 6)], { w: tw - 5, color: HG, seed: sd, wob: 0.5, cap: "butt" });
  sk.ink(dense([[xs, yS], [xs, shortTop + 6]], 6), { w: tw - 5, color: AIR, seed: sd, wob: 0.5, cap: "butt" });
  // 짧은 다리의 종이 눈금
  if (o.scale !== false) for (let i = 0; i <= 8; i++) sk.ink(dense([[xs - tw / 2 - 20, shortTop + 10 + i * 17], [xs - tw / 2 - (i % 4 ? 10 : 4), shortTop + 10 + i * 17]]), { w: 3.5, color: "#8A6A4A", seed: sd + 3 + i, wob: 0 });
  return { yS };
}
// 계단: 오른쪽으로 내려가는 층계. 위 층계참에 조수가 선다
function stairs(sk, sd = 321) {
  const st = poly([[610, 404], [792, 404], [792, 474], [838, 474], [838, 544], [884, 544], [884, 614], [930, 614], [930, 684], [974, 684], [974, 734], [610, 734]], 5);
  sk.fill(st, "#D9B07A", { seed: sd, tex: true, texAng: 0.03 }); sk.ink(st, { w: 10, seed: sd + 1 });
}
// 관을 매단 걸이와 끈
function hanger(sk, xl, sd = 331) {
  sk.ink(dense([[630, 404], [630, 226]]), { w: 10, color: "#6B4A32", seed: sd, wob: 0.5 });
  sk.ink(dense([[634, 228], [xl - 30, 228]]), { w: 10, color: "#6B4A32", seed: sd + 1, wob: 0.5 });
  for (const [y, i] of [[262, 0], [376, 1]]) { sk.ink(dense([[xl - 20, 230], [xl - 18, y]]), { w: 3.5, color: "#8A6A4A", seed: sd + 2 + i, wob: 0.4 }); sk.ink(dense([[xl - 20, y], [xl + 20, y + 3]]), { w: 6, color: "#8A6A4A", seed: sd + 4 + i, wob: 0.3 }); }
}
// 쏟아지는 수은을 받는 나무 상자
function tray(sk, x0, x1, sd = 341) {
  const b = poly([[x0, 630], [x1, 630], [x1 - 6, 704], [x0 + 6, 704]], 4);
  sk.fill(b, "#C49A5E", { seed: sd, tex: true, texAng: 0.03 }); sk.ink(b, { w: 9, seed: sd + 1 });
  sk.ink(dense([[x0 + 3, 664], [x1 - 3, 664]]), { w: 5, color: C.woodDark, seed: sd + 2, wob: 0.4 });
}
const beads = (sk, list, sd) => list.forEach(([x, y, r], i) => { const b = circ(x, y, r, { over: 0.15, seed: sd + i }); sk.fill(b, HG, { dx: 0, dy: 0, wob: 0.4, seed: sd + 20 + i }); sk.ink(b, { w: Math.max(4, r * 0.4), seed: sd + 40 + i, wob: 0.4 }); sk.dot(x - r * 0.3, y - r * 0.3, r * 0.22, C.white); });
const XL = 560, XS = 490, TOP = 200, STOP = 440, YB = 612;

/* ---------- 1. 1661년, 영국: 공기에 용수철이? ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  ground(sk, 700, 11);
  // 보일: 두 손 사이의 공기를 누른다(공기는 용수철처럼 되밀어낸다)
  const P = pose({ elL: [10, -300], haL: [84, -328], elR: [60, -262], haR: [240, -328] });
  const fx = 236, fy = 700, fs = 0.76;
  drawFigure(sk, fx, fy, fs, P, { ...BOYLE, name: "boyle", hands: false });
  const ax = fx + fs * 162, ay = fy - fs * 328;
  const blob = circ(ax, ay, 46, { over: 0.15, seed: 13, lump: 0.08 });
  sk.fill(blob, AIR, { dx: 0, dy: 0, wob: 0.8, seed: 14 }); sk.ink(blob, { w: 7, color: "#5FB7AA", seed: 15, dash: [10, 9], wob: 0.5 });
  for (const [sg, i] of [[-1, 0], [1, 1]]) { arrow(sk, [[ax + sg * 14, ay], [ax + sg * 40, ay]], { w: 6, color: C.teal, seed: 16 + i, straight: true, head: 13, wob: 0.2 }); const h = rrect(ax + sg * 54 - 9, ay - 34, 18, 68, 8); sk.fill(h, C.skin, { dx: 0, dy: 0, wob: 0.4, seed: 18 + i }); sk.ink(h, { w: 7, seed: 20 + i, wob: 0.5 }); }
  arrow(sk, [[ax, ay - 12], [ax, ay - 80]], { w: 6, color: C.teal, seed: 22, straight: true, head: 13, wob: 0.2 });
  arrow(sk, [[ax, ay + 12], [ax, ay + 80]], { w: 6, color: C.teal, seed: 23, straight: true, head: 13, wob: 0.2 });
  // 다른 학자
  const C2 = pose({ elL: [-52, -262], haL: [-10, -238], elR: [52, -262], haR: [10, -226], tilt: -0.08 });
  drawFigure(sk, 760, 700, 0.76, C2, { ...CRITIC, name: "critic" });
  qmark(sk, 900, 250, 0.7, { color: C.gray, seed: 25 });
  return sk;
}

// 계단에 매단 J자 관(2~4컷이 함께 쓴다)
function rig(sk, o) {
  stairs(sk);
  hanger(sk, XL);
  const t = jtube(sk, { xl: XL, xs: XS, top: TOP, shortTop: STOP, yb: YB, air: o.air, long: o.long, stub: o.stub, sd: 301 });
  tray(sk, 432, 606);
  return t;
}

/* ---------- 2. 실험 준비: 계단에 매단 J자 관 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 700, 31);
  rig(sk, { air: 132, long: STOP + 132 });
  arrow(sk, [[XL, 120], [XL, 180]], { w: 7, color: C.teal, seed: 33, straight: true, head: 18, wob: 0.3 });
  // 훅: 층계참에서 관을 붙잡는다
  const hp = pose({ elL: [-86, -322], haL: [-176, -330], elR: [50, -260], haR: [24, -218], tilt: -0.06 });
  drawFigure(sk, 680, 404, 0.46, hp, { ...HOOKE, name: "hooke" });
  // 보일: 갇힌 공기를 가리킨다
  const bp = pose({ elR: [86, -296], haR: [160, -290], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 236, 700, 0.62, bp, { ...BOYLE, name: "boyle" });
  return sk;
}

/* ---------- 3. 수은을 붓다: 위에서 붓고, 아래서 재고 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 700, 41);
  rig(sk, { air: 96, long: 388 });
  // 훅: 위에서 수은을 붓는다
  const hp = pose({ elL: [-96, -372], haL: [-150, -436], elR: [50, -260], haR: [24, -218], tilt: -0.08 });
  const hx0 = 680, hy0 = 404, hs = 0.46;
  drawFigure(sk, hx0, hy0, hs, hp, { ...HOOKE, name: "hooke", hands: "R" });
  const fx = hx0 - hs * 150, fy = hy0 - hs * 436;
  sk.at(fx - 8, fy - 6, 1, () => { const fl = curve([[-14, -30], [-20, 6], [0, 22], [20, 6], [14, -30]], false, 3); sk.fill([...fl, fl[0]], "#DCE4EA", { dx: 0, dy: 0, wob: 0.4, seed: 43 }); sk.ink([...fl, fl[0]], { w: 7, seed: 44 }); }, -2.2);
  sk.ink(curve([[fx - 32, fy + 4], [XL + 4, fy + 14], [XL, TOP + 4]]), { w: 7, color: HG, seed: 45, wob: 0.4 });
  handDot(sk, [fx + 6, fy + 2], C.skin, 46, 8);
  // 보일: 눈금을 들여다보며 적는다
  const bp = pose({ elR: [70, -290], haR: [124, -314], elL: [40, -262], haL: [96, -262], tilt: 0.1 });
  const bx = 250, by = 700, bs = 0.62;
  drawFigure(sk, bx, by, bs, bp, { ...BOYLE, name: "boyle", hands: false });
  notebook(sk, bx + bs * 130, by - bs * 276, 0.72, { rot: -0.12, seed: 47 });
  quill(sk, bx + bs * 124 + 12, by - bs * 314 + 6, 0.5, { rot: 0.5, seed: 48 });
  handDot(sk, [bx + bs * 96, by - bs * 262], C.skin, 49, 9);
  // 갇힌 공기가 눌린다
  arrow(sk, [[XS - 62, STOP + 30], [XS - 62, STOP + 86]], { w: 6, color: C.red, seed: 50, straight: true, head: 15, wob: 0.3 });
  return sk;
}

/* ---------- 4. 와장창: 관이 깨졌다 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  ground(sk, 700, 51);
  rig(sk, { air: 66, long: 420, stub: 372 });
  // 깨진 자리와 매달려 흔들리는 윗동강
  sk.ink(dense([[XL - 20, 372], [XL - 8, 356], [XL + 4, 374], [XL + 20, 354]], 3), { w: 6, seed: 53, wob: 0.3 });
  sk.at(XL - 6, 232, 1, () => { sk.ink(dense([[0, 0], [0, 96]]), { w: 38, seed: 54, wob: 0.4 }); sk.ink(dense([[0, -8], [0, 96]]), { w: 26, color: GLASS, seed: 54, wob: 0.4, cap: "butt" }); sk.ink(dense([[-18, 100], [-6, 116], [6, 98], [18, 114]], 3), { w: 6, seed: 55, wob: 0.3 }); }, 0.22);
  for (const [x, y, rot, i] of [[520, 420, 0.4, 0], [606, 470, -0.6, 1], [470, 520, 1.1, 2], [590, 560, 0.2, 3]]) sk.at(x, y, 1, () => { const sh = poly([[-14, 8], [0, -16], [15, 10]], 2); sk.fill(sh, "#E6F2F9", { dx: 0, dy: 0, wob: 0.3, seed: 56 + i }); sk.ink(sh, { w: 5, seed: 60 + i, wob: 0.3 }); }, rot);
  beads(sk, [[384, 684, 17], [338, 690, 12], [416, 652, 10], [296, 694, 9], [640, 688, 12], [470, 616, 11], [540, 620, 9], [592, 614, 8]], 65);
  // 훅: 두 팔을 번쩍
  const hp = pose({ elL: [-104, -362], haL: [-156, -448], elR: [104, -362], haR: [156, -448], tilt: 0.06 });
  drawFigure(sk, 706, 404, 0.46, hp, { ...HOOKE, name: "hooke" });
  drop(sk, 800, 190, 1);
  // 보일: 기록을 꼭 쥔다
  const bp = pose({ elR: [56, -262], haR: [70, -210], elL: [-56, -262], haL: [-70, -206], tilt: -0.05 });
  const bx = 220, by = 700, bs = 0.62;
  drawFigure(sk, bx, by, bs, bp, { ...BOYLE, name: "boyle", hands: "L" });
  notebook(sk, bx + bs * 70 + 14, by - bs * 210 - 10, 0.7, { rot: 0.1, seed: 95, check: true });
  handDot(sk, [bx + bs * 70, by - bs * 210], C.skin, 96, 9);
  emark(sk, 372, 300, 0.8, { color: C.red, rot: -0.1 });
  return sk;
}

/* ---------- 5. 놀라운 규칙: 두 배로 누르면 절반 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  ground(sk, 700, 101);
  // 새로 만든 관: 공기가 절반이 되었을 때
  const xl = 600, xs = 520, sTop = 400, air0 = 136, air = 68, lv = sTop + air - 236;
  jtube(sk, { xl, xs, top: 70, shortTop: sTop, yb: 606, air, long: lv, sd: 311, tw: 30, scale: false });
  tray(sk, 462, 656, 351);
  // 처음 공기 기둥의 길이(점선)와 지금 길이
  const bx0 = xs - 42;
  sk.ink(dense([[bx0, sTop + 6], [bx0, sTop + air0]]), { w: 5, color: C.gray, dash: [9, 9], seed: 103, wob: 0 });
  sk.ink(dense([[bx0 - 10, sTop + air0], [bx0 + 10, sTop + air0]]), { w: 5, color: C.gray, seed: 104, wob: 0 });
  sk.ink(dense([[bx0 - 26, sTop + 6], [bx0 - 26, sTop + air]]), { w: 7, color: C.teal, seed: 105, wob: 0.2 });
  for (const y of [sTop + 6, sTop + air]) sk.ink(dense([[bx0 - 36, y], [bx0 - 16, y]]), { w: 6, color: C.teal, seed: 106 + y, wob: 0 });
  // 더한 수은 기둥의 높이 = 대기가 받치는 수은 기둥의 높이
  const rx = xl + 46;
  sk.ink(dense([[rx, lv], [rx, sTop + air]]), { w: 7, color: C.orange, seed: 109, wob: 0.2 });
  for (const y of [lv, sTop + air]) sk.ink(dense([[rx - 10, y], [rx + 10, y]]), { w: 6, color: C.orange, seed: 110 + y, wob: 0 });
  // 옆의 기압계: 같은 높이의 수은 기둥
  const gx = 800, dish = 630, h = 236;
  const d = curve([[gx - 62, dish - 26], [gx - 50, dish + 8], [gx + 50, dish + 8], [gx + 62, dish - 26]], false, 3);
  sk.fill([...d, d[0]], HG, { dx: 0, dy: 0, wob: 0.4, seed: 113 });
  sk.ink(dense([[gx, dish - 10], [gx, dish - h - 50]]), { w: 34, seed: 114, wob: 0.4 });
  sk.ink(dense([[gx, dish - 6], [gx, dish - h - 46]]), { w: 22, color: GLASS, seed: 114, wob: 0.4, cap: "butt" });
  sk.ink(dense([[gx, dish - 6], [gx, dish - h]]), { w: 18, color: HG, seed: 114, wob: 0.4, cap: "butt" });
  sk.ink(d, { w: 9, seed: 115 });
  sk.ink(dense([[gx + 40, dish - 14], [gx + 40, dish - h]]), { w: 7, color: C.orange, seed: 116, wob: 0.2 });
  for (const y of [dish - 14, dish - h]) sk.ink(dense([[gx + 30, y], [gx + 50, y]]), { w: 6, color: C.orange, seed: 117 + y, wob: 0 });
  for (const dy of [0, 16]) sk.ink(dense([[706, 372 + dy], [740, 372 + dy]]), { w: 7, color: C.orange, seed: 119 + dy, wob: 0.2 });
  // 보일
  const bp = pose({ elR: [86, -300], haR: [160, -300], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 220, 700, 0.74, bp, { ...BOYLE, name: "boyle" });
  emark(sk, 380, 300, 0.8, { color: C.red, rot: 0.1 });
  return sk;
}

/* ---------- 6. 반대로 당기면: 늘어나는 공기 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 700, 131);
  // 수은을 채운 굵은 관과 그 속에 꽂은 가는 관
  const wx = 600;
  const wide = poly([[wx - 44, 300], [wx + 44, 300], [wx + 44, 690], [wx - 44, 690]], 5);
  sk.fill(wide, HG, { dx: 0, dy: 0, wob: 0.5, seed: 133, tex: 0.5, texAng: 1.5 });
  sk.ink(dense([[wx - 44, 286], [wx - 44, 690], [wx + 44, 690], [wx + 44, 286]], 5), { w: 10, seed: 134 });
  // 가는 관: 꼭대기에 갇힌 공기가 길게 늘어났다
  sk.ink(dense([[wx, 86], [wx, 560]]), { w: 34, seed: 135, wob: 0.4 });
  sk.ink(dense([[wx, 92], [wx, 566]]), { w: 22, color: GLASS, seed: 135, wob: 0.4, cap: "butt" });
  sk.ink(dense([[wx, 262], [wx, 566]]), { w: 18, color: HG, seed: 135, wob: 0.4, cap: "butt" });
  sk.ink(dense([[wx, 96], [wx, 262]]), { w: 18, color: AIR, seed: 135, wob: 0.4, cap: "butt" });
  // 처음 길이(짧았던 공기)
  const bx0 = wx + 40;
  sk.ink(dense([[bx0, 96], [bx0, 138]]), { w: 5, color: C.gray, dash: [9, 9], seed: 137, wob: 0 });
  sk.ink(dense([[bx0 - 10, 138], [bx0 + 10, 138]]), { w: 5, color: C.gray, seed: 138, wob: 0 });
  sk.ink(dense([[bx0 + 26, 96], [bx0 + 26, 262]]), { w: 7, color: C.teal, seed: 139, wob: 0.2 });
  for (const y of [96, 262]) sk.ink(dense([[bx0 + 16, y], [bx0 + 36, y]]), { w: 6, color: C.teal, seed: 140 + y, wob: 0 });
  arrow(sk, [[wx + 118, 250], [wx + 118, 130]], { w: 9, color: C.teal, seed: 143, straight: true, head: 22, wob: 0.4 });
  // 온도는 그대로(온도계 + 체크)
  const tx = 840, ty = 600;
  sk.ink(dense([[tx, ty - 150], [tx, ty]]), { w: 26, seed: 145, wob: 0.3 }); sk.ink(dense([[tx, ty - 146], [tx, ty]]), { w: 14, color: C.white, seed: 145, wob: 0.3, cap: "butt" });
  const bulb = circ(tx, ty + 18, 24, { over: 0.15, seed: 146 }); sk.fill(bulb, C.red, { dx: 0, dy: 0, wob: 0.4, seed: 147 }); sk.ink(bulb, { w: 7, seed: 148 });
  sk.ink(dense([[tx, ty - 70], [tx, ty + 6]]), { w: 8, color: C.red, seed: 149, wob: 0, cap: "butt" });
  check(sk, tx + 62, ty - 80, 0.8);
  // 보일: 가는 관을 끌어올린다
  const bp = pose({ elR: [140, -372], haR: [246, -432], elL: [128, -316], haL: [234, -360], tilt: 0.05 });
  const fx = 400, fy = 700, fs = 0.74;
  drawFigure(sk, fx, fy, fs, bp, { ...BOYLE, name: "boyle" });
  return sk;
}

/* ---------- 7. 오늘날: 용수철 대신 입자로 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  ground(sk, 704, 151);
  // 확대해 본 주사기 속: 같은 개수의 입자가 좁은 곳에 모인다
  const box = (x, w, sd, hit) => {
    const b = rrect(x, 96, w, 200, 22);
    sk.fill(b, "#EAF7F5", { dx: 0, dy: 0, wob: 0.5, seed: sd }); sk.ink(b, { w: 10, seed: sd + 1 });
    const pts = [[0.2, 0.22], [0.62, 0.16], [0.84, 0.4], [0.4, 0.46], [0.16, 0.7], [0.58, 0.72], [0.82, 0.82], [0.4, 0.86]];
    pts.forEach(([u, v], i) => { const c = circ(x + 18 + u * (w - 36), 114 + v * 164, 13, { over: 0.15, seed: sd + 2 + i }); sk.fill(c, C.teal, { dx: 0, dy: 0, wob: 0.3, seed: sd + 12 + i }); sk.ink(c, { w: 5, seed: sd + 22 + i, wob: 0.3 }); });
    if (hit) for (const [hx, hy, a] of [[x + w, 150, 0], [x + w, 250, 0], [x, 200, Math.PI], [x + w * 0.5, 96, -Math.PI / 2], [x + w * 0.5, 296, Math.PI / 2]]) for (const da of [-0.5, 0, 0.5]) sk.ink(dense([[hx + 12 * Math.cos(a + da), hy + 12 * Math.sin(a + da)], [hx + 28 * Math.cos(a + da), hy + 28 * Math.sin(a + da)]]), { w: 4.5, color: C.orange, seed: sd + 40, wob: 0 });
  };
  box(416, 280, 153, false);
  arrow(sk, [[716, 196], [770, 196]], { w: 9, color: C.gray, seed: 155, straight: true, head: 22, wob: 0.3 });
  box(800, 130, 173, true);
  // 끝을 막은 주사기
  const sy = 470, x0 = 470, x1 = 800, px = 610;
  const barrel = rrect(x0, sy - 44, x1 - x0, 88, 14);
  sk.fill(barrel, GLASS, { dx: 0, dy: 0, wob: 0.4, seed: 201 });
  const gas = poly([[px + 14, sy - 36], [x1 - 8, sy - 36], [x1 - 8, sy + 36], [px + 14, sy + 36]], 4);
  sk.fill(gas, AIR, { dx: 0, dy: 0, wob: 0.3, seed: 202 });
  sk.ink(barrel, { w: 9, seed: 203 });
  const pis = rrect(px - 12, sy - 40, 26, 80, 6); sk.fill(pis, "#5A5F68", { dx: 0, dy: 0, wob: 0.3, seed: 204 }); sk.ink(pis, { w: 6, seed: 205 });
  sk.ink(dense([[px - 12, sy], [x0 - 70, sy]]), { w: 12, color: "#8A9099", seed: 206, wob: 0.3 });
  sk.ink(dense([[x0 - 70, sy - 46], [x0 - 70, sy + 46]]), { w: 12, seed: 207, wob: 0.4 });
  sk.ink(dense([[x0, sy - 60], [x0, sy + 60]]), { w: 9, seed: 208, wob: 0.4 });
  const tip = rrect(x1, sy - 12, 44, 24, 6); sk.fill(tip, GLASS, { dx: 0, dy: 0, wob: 0.3, seed: 209 }); sk.ink(tip, { w: 7, seed: 210 });
  const cap = rrect(x1 + 40, sy - 18, 22, 36, 6); sk.fill(cap, C.red, { dx: 0, dy: 0, wob: 0.3, seed: 211 }); sk.ink(cap, { w: 7, seed: 212 });
  arrow(sk, [[x0 - 150, sy + 84], [x0 - 92, sy + 84]], { w: 8, color: C.red, seed: 213, straight: true, head: 20, wob: 0.3 });
  // 쌤: 피스톤을 누른다
  const P = pose({ elR: [84, -300], haR: [162, -316], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  const fx = 240, fy = 704, fs = 0.74;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher" });
  // 구석의 작은 J자 관(옛 실험의 흔적)
  jtube(sk, { xl: 900, xs: 868, top: 520, shortTop: 610, yb: 660, air: 22, long: 560, sd: 321, tw: 12, scale: false });
  return sk;
}

const BUBBLES = [
  [{ who: "boyle", text: "눌러도<br>버텨요!" }, { who: "critic", text: "그럴<br>리가요?" }],
  [{ who: "boyle", text: "아래엔<br>상자를!" }, { who: "hooke", text: "꽉 묶었어요" }],
  [{ who: "boyle", text: "줄어든다,<br>줄어들어!" }, { who: "hooke", text: "더 붓습니다!" }],
  [{ who: "boyle", text: "절반까지는<br>봤어요" }, { who: "hooke", text: "으악, 관이!" }],
  [{ who: "boyle", text: "2배면<br>절반!" }],
  [{ who: "boyle", text: "당기면<br>늘어나네!" }],
  [{ who: "teacher", text: "개수는<br>그대로!" }],
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
