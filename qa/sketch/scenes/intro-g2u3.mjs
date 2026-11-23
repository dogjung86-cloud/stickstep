// 중2 과학 Ⅲ 빛과 파동 도입(opener) 여덟 장면의 그림(손그림 코드 그림). intro-u5.mjs와 같은 엔진, 같은 무대(960×544).
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   town   (g2u3l1) 건물 그늘에 놓인 화분, 햇빛 드는 곳에서 손거울을 든 학생(앱이 거울을 돌리고 햇빛 줄기를 긋는다)
//   straw  (g2u3l2) 탁자 위의 유리컵과 지켜보는 학생(물과 빨대는 앱이 그린다)
//   cat    (g2u3l4) 무용실 전신거울 앞의 학생과 거울에 비친 모습
//   dots   (g2u3l6) 이젤 위의 도화지(바나나는 앱이 빨간 점과 초록 점으로 찍는다)
//   float  (g2u3l7) 나뭇잎 끝의 빗방울과 연못에 뜬 탁구공
// 장면 키(town, cat, float)와 움직이는 겹의 클래스 이름은 앞 판에서 물려받아 그대로 쓴다(앱 코드와 검사가 이 이름을 본다).
// build-intro.mjs g2u3 이 build(add)를 불러 src/ui/introArt.g2u3.generated.ts에 싣는다.
import { Sk, C, curve, dense, circ, ell, arc, poly, rrect, rays } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";
import { sun, note } from "../lib/props.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const ground = (sk, y = 506, color = C.grayLight, sd = 3) => sk.ink(dense([[40, y], [920, y + 2]], 8), { w: 9, color, wob: 1.2, seed: sd });

/* ══════════ 1. 건물 그늘의 화분과 손거울 (g2u3l1) ══════════ */
// spots: 손거울에서 반사한 빛이 닿는 자리(학생 발치의 바닥 → 화분 → 건물 벽 위쪽). plaza = 화분의 차례(앞 판의 이름을 물려받았다).
// 해에서 거울로 오는 줄기는 건물 지붕보다 20 px 넘게 위로 지나간다(해 줄기 시작점은 앱이 해 가운데에서 (46, 8) 옮긴 자리).
export const TOWN = { sun: [112, 92], mir: [760, 286], spots: [[690, 500], [596, 500], [486, 432], [392, 360], [392, 262]], plaza: 2 };
export function townBase() {
  const sk = new Sk(W, H, { id: "g3a" });
  sun(sk, TOWN.sun[0], TOWN.sun[1], 40);
  ground(sk);
  // 건물(해와 화분 사이), 창문 여섯
  const bd = poly([[236, 506], [236, 196], [404, 196], [404, 506]], 4);
  sk.fill(bd, "#E8D2B4", { dx: 1, dy: 1.2, wob: 0.8, seed: 11, tex: true });
  sk.ink(bd, { w: 9, wob: 1, seed: 12 });
  [[262, 226], [336, 226], [262, 316], [336, 316], [262, 406], [336, 406]].forEach(([x, y], i) => {
    const wnd = rrect(x, y, 44, 52, 6);
    sk.fill(wnd, C.sea, { dx: 0, dy: 0, wob: 0.4, seed: 13 + i * 2 });
    sk.ink(wnd, { w: 6, wob: 0.5, seed: 14 + i * 2 });
  });
  // 화분과 풀(건물 그늘 속)
  const pot = poly([[458, 506], [514, 506], [524, 458], [448, 458]], 4);
  sk.fill(pot, "#D9774B", { dx: 0.6, dy: 0.8, wob: 0.5, seed: 31 });
  sk.ink(pot, { w: 7, wob: 0.6, seed: 32 });
  sk.ink(dense([[442, 458], [530, 458]], 5), { w: 10, color: "#B85A33", wob: 0.4, seed: 33 });
  sk.ink(curve([[486, 456], [483, 420], [490, 392]]), { w: 7, color: C.green, wob: 0.5, seed: 34 });
  [[466, 430, -0.5], [507, 414, 0.45], [474, 400, -0.35]].forEach(([x, y, r], i) => sk.at(x, y, 1, () => {
    const lf = ell(0, 0, 20, 9);
    sk.fill(lf, C.green, { dx: 0, dy: 0, wob: 0.3, seed: 35 + i * 2 });
    sk.ink(lf, { w: 5, wob: 0.4, seed: 36 + i * 2 });
  }, r));
  const bud = circ(490, 384, 12, { seed: 43 });
  sk.fill(bud, C.red, { dx: 0, dy: 0, wob: 0.3, seed: 44 });
  sk.ink(bud, { w: 5, wob: 0.4, seed: 45 });
  // 건물 그늘(손거울 빛은 화분 한 곳만 밝히므로 그늘은 걷지 않는다)
  g(sk, "opn-g2u3-shade", () => sk.raw(`<path d="M404 506 L404 318 L522 318 L604 506 Z" fill="#2F4168" opacity=".32"/>`));
  // 햇빛이 닿은 화분(앱이 켠다)
  g(sk, "opn-g2u3-lit", () => { sk.glow(486, 432, 92, C.yellow, 0.8, 0.15); rays(sk, 488, 384, 26, 50, 5, { color: C.orange, w: 7, seed: 51 }); });
  // 손거울을 든 학생(오른쪽 햇빛 속, 건물 쪽을 본다). 손은 거울 뒤쪽을 쥔다
  drawFigure(sk, 852, 506, 0.6, pose({ elR: [66, -300], haR: [137, -360] }), { ...STUDENT, mirror: true });
  // 손거울(옆에서 본 모습, 앱이 돌린다). 거울 면은 왼쪽을 본다
  g(sk, "opn-g2u3-mir", () => {
    const [mx, my] = TOWN.mir;
    const m = rrect(mx - 6, my - 34, 12, 68, 6);
    sk.fill(m, C.sea, { dx: 0, dy: 0, wob: 0.3, seed: 63 });
    sk.ink(m, { w: 5, wob: 0.4, seed: 64 });
    sk.ink(dense([[mx + 6, my - 30], [mx + 6, my + 30]], 5), { w: 7, color: C.navy, wob: 0.2, seed: 65 });
  });
  return { sk };
}

/* ══════════ 2. 유리컵과 빨대 (g2u3l2) ══════════ */
export const STRAW = { cup: [392, 150, 176, 318], top: [612, 70], bot: [436, 452], wy0: 462, wy1: 216, bend: 58 };
export function strawBase() {
  const sk = new Sk(W, H, { id: "g3b" });
  // 탁자
  sk.ink(dense([[250, 476], [760, 478]], 8), { w: 10, color: C.woodDark, wob: 1, seed: 71 });
  sk.ink(dense([[300, 480], [296, 540]], 6), { w: 9, color: C.woodDark, wob: 0.6, seed: 72 });
  sk.ink(dense([[712, 480], [716, 540]], 6), { w: 9, color: C.woodDark, wob: 0.6, seed: 73 });
  drawFigure(sk, 150, 520, 0.6, pose({ elR: [96, -300], haR: [170, -340] }), { ...STUDENT });
  return { sk };
}
/** 컵의 테두리는 물과 빨대 위에 얹는다(앱이 겹 차례를 맞춘다). */
export function strawCup() {
  const sk = new Sk(W, H, { id: "g3c" });
  const [x, y, w, h] = STRAW.cup;
  sk.ink(dense([[x, y], [x + 6, y + h], [x + w - 6, y + h], [x + w, y]], 6), { w: 9, color: C.navy, wob: 0.8, seed: 75 });
  sk.ink(arc(x + 34, y + 60, 26, 2.6, 3.6), { w: 6, color: "#FFFFFF", wob: 0.3, seed: 76 });
  return { sk };
}

/* ══════════ 3. 깜깜한 방 (g2u3l3) ══════════ */
export const DARK = { eyes: [196, 246], torch: [372, 308], cat: [720, 420] };
function cat(sk, x, y, s, sd) {
  // 앉은 고양이(옆모습): 몸통, 머리, 귀, 꼬리
  const body = ell(x, y - 46 * s, 62 * s, 50 * s);
  sk.fill(body, "#F2B872", { dx: 1, dy: 1.2, wob: 0.8, seed: sd, tex: true });
  sk.ink(body, { w: 8, wob: 0.8, seed: sd + 1 });
  const head = circ(x - 56 * s, y - 104 * s, 36 * s, { seed: sd + 2 });
  sk.fill(head, "#F2B872", { dx: 1, dy: 1.2, wob: 0.6, seed: sd + 3 });
  sk.ink(head, { w: 8, wob: 0.6, seed: sd + 4 });
  [[-82, -128, -74, -158, -60, -134], [-52, -138, -36, -162, -30, -130]].forEach((e, i) => {
    const ear = poly([[x + e[0] * s, y + e[1] * s], [x + e[2] * s, y + e[3] * s], [x + e[4] * s, y + e[5] * s]], 3);
    sk.fill(ear, "#F2B872", { dx: 0, dy: 0, wob: 0.3, seed: sd + 5 + i });
    sk.ink(ear, { w: 6, wob: 0.3, seed: sd + 7 + i });
  });
  sk.ink(curve([[x + 56 * s, y - 20 * s], [x + 100 * s, y - 30 * s], [x + 108 * s, y - 80 * s]]), { w: 9, color: "#C98A45", wob: 0.5, seed: sd + 9 });
  sk.dot(x - 70 * s, y - 108 * s, 4 * s);
  sk.dot(x - 48 * s, y - 108 * s, 4 * s);
}
export function darkBase() {
  const sk = new Sk(W, H, { id: "g3d" });
  ground(sk);
  // 방석과 고양이
  const cush = ell(DARK.cat[0], DARK.cat[1] + 76, 120, 18);
  sk.fill(cush, C.red, { dx: 0, dy: 0, wob: 0.6, seed: 81 });
  sk.ink(cush, { w: 7, wob: 0.8, seed: 82 });
  cat(sk, DARK.cat[0], DARK.cat[1] + 70, 1.15, 83);
  // 손전등을 든 학생
  drawFigure(sk, 200, 506, 0.6, pose({ elR: [110, -300], haR: [220, -330] }), { ...STUDENT });
  const t = poly([[DARK.torch[0] - 62, DARK.torch[1] - 14], [DARK.torch[0] - 14, DARK.torch[1] - 14], [DARK.torch[0], DARK.torch[1] - 24], [DARK.torch[0], DARK.torch[1] + 24], [DARK.torch[0] - 14, DARK.torch[1] + 14], [DARK.torch[0] - 62, DARK.torch[1] + 14]], 4);
  sk.fill(t, C.navy, { dx: 0, dy: 0, wob: 0.3, seed: 95 });
  sk.ink(t, { w: 6, wob: 0.4, seed: 96 });
  return { sk };
}

/* ══════════ 4. 무용실 전신거울 앞의 학생 (g2u3l4) ══════════ */
// 학생(opn-g2u3-cat)과 거울에 비친 모습(opn-g2u3-cat2)은 거울 면에서 같은 거리(290)에 마주 서고, 앱이 한 걸음(62)씩 함께 옮긴다.
export const CATM = { mirror: 480, step: 62, steps: 3 };
const DANCER = pose({ elR: [70, -296], haR: [126, -338] });
export function catBase() {
  const sk = new Sk(W, H, { id: "g3e" });
  // 거울 속(오른쪽)은 옅은 하늘색으로 깐다
  sk.raw(`<rect x="${CATM.mirror}" y="40" width="440" height="466" fill="#DCEEFB"/>`);
  // 나무 마루
  sk.raw(`<rect x="40" y="506" width="880" height="34" fill="${C.woodLight}"/>`);
  ground(sk, 506, C.woodDark, 3);
  // 벽의 손잡이 봉과 거울에 비친 봉(마주 보는 자리)
  [[70, 466, 120, 416], [494, 890, 544, 840]].forEach(([x0, x1, p0, p1], i) => {
    [p0, p1].forEach((px, j) => sk.ink(dense([[px, 330], [px, 362]], 4), { w: 7, color: C.gray, wob: 0.3, seed: 91 + i * 4 + j }));
    sk.ink(dense([[x0, 330], [x1, 330]], 6), { w: 11, color: C.woodDark, wob: 0.5, seed: 95 + i * 4 });
  });
  // 전신거울(옆에서 본 모습)
  const m = poly([[CATM.mirror - 8, 60], [CATM.mirror + 8, 60], [CATM.mirror + 8, 504], [CATM.mirror - 8, 504]], 6);
  sk.fill(m, C.sea, { dx: 0, dy: 0, wob: 0.3, seed: 101 });
  sk.ink(m, { w: 7, wob: 0.5, seed: 102 });
  // 학생(왼쪽, 거울을 본다)
  g(sk, "opn-g2u3-cat", () => drawFigure(sk, CATM.mirror - 290, 506, 0.6, DANCER, { ...STUDENT }));
  // 거울에 비친 모습(오른쪽, 마주 본다)
  g(sk, "opn-g2u3-cat2", () => drawFigure(sk, CATM.mirror + 290, 506, 0.6, DANCER, { ...STUDENT, mirror: true }));
  return { sk };
}

/* ══════════ 5. 숟가락에 비친 얼굴 (g2u3l5) ══════════ */
export const SPOON = { bowl: [668, 250, 150, 196] };
function miniFace(sk, x, y, s, inv, sd) {
  sk.at(x, y, s, () => {
    // 어깨
    const sh = poly([[-78, 150], [-40, 64], [40, 64], [78, 150]], 4);
    sk.fill(sh, C.cloth, { dx: 0, dy: 0, wob: 0.4, seed: sd });
    sk.ink(sh, { w: 9, wob: 0.5, seed: sd + 1 });
    // 얼굴(비워 둔다)과 노란 모자
    const head = circ(0, 0, 70, { seed: sd + 2 });
    sk.fill(head, C.skin, { dx: 0, dy: 0, wob: 0.5, seed: sd + 3 });
    const capTop = ell(0, -8, 72, 66, PI_, PI_ * 2);
    sk.fill([...capTop, [72, -8]], C.yellow, { dx: 0, dy: 0, wob: 0.4, seed: sd + 4 });
    sk.ink(head, { w: 10, wob: 0.6, seed: sd + 5 });
    sk.ink(dense([[-74, -8], [96, -8]], 5), { w: 11, color: C.orange, wob: 0.4, seed: sd + 6 });
  }, inv ? PI_ : 0);
}
const PI_ = Math.PI;
export function spoonBase() {
  const sk = new Sk(W, H, { id: "g3f" });
  ground(sk);
  const [bx, by, rx, ry] = SPOON.bowl;
  // 손잡이
  sk.ink(dense([[bx - 96, by + 158], [330, 474]], 6), { w: 26, color: "#B9C2CE", wob: 0.6, seed: 121 });
  sk.ink(dense([[bx - 96, by + 170], [330, 486]], 6), { w: 6, wob: 0.8, seed: 122 });
  drawFigure(sk, 170, 512, 0.58, pose({ elR: [120, -250], haR: [250, -130] }), { ...STUDENT });
  // 숟가락의 둥근 부분
  const bowl = ell(bx, by, rx, ry);
  sk.fill(bowl, "#E6EAF0", { dx: 1, dy: 1.2, wob: 1, seed: 123, tex: true });
  // 오목한 쪽: 위쪽 안에 그늘
  g(sk, "opn-g2u3-sp in", () => {
    sk.ink(ell(bx, by + 10, rx - 26, ry - 28, PI_ * 1.08, PI_ * 1.92), { w: 22, color: "#B4BDCA", wob: 0.6, seed: 125 });
    miniFace(sk, bx, by + 6, 0.62, true, 131);
  });
  // 볼록한 쪽: 가운데가 밝게 빛난다
  g(sk, "opn-g2u3-sp out", () => {
    sk.glow(bx - 30, by - 50, 120, "#FFFFFF", 0.9, 0.1);
    miniFace(sk, bx, by - 6, 0.5, false, 141);
  });
  sk.ink(bowl, { w: 10, wob: 1, seed: 124 });
  return { sk };
}

/* ══════════ 6. 점으로 그린 바나나 (g2u3l6) ══════════ */
// 바나나 = 가운데 c, 반지름 R인 원호(각 a0~a1, 아래로 휜다)를 따라 가운데 굵기가 half인 띠. 양 끝으로 갈수록 가늘어진다.
// 앱이 이 띠 안에만 빨간 점과 초록 점을 번갈아 찍는다. 꼭지(stem)만 갈색으로 칠해 둔다.
export const DOTS = { c: [605, 80], R: 200, a0: 0.18 * Math.PI, a1: 0.82 * Math.PI, half: 52, stem: [[435, 186], [419, 161]], gap: 25, r: 10 };
export function dotsBase() {
  const sk = new Sk(W, H, { id: "g3g" });
  ground(sk);
  // 이젤 위의 도화지(바나나는 앱이 점으로 찍는다)
  const paper = rrect(300, 58, 610, 410, 18);
  sk.fill(paper, "#FFFDF6", { dx: 0, dy: 0, wob: 0.6, seed: 151 });
  sk.ink(paper, { w: 9, color: C.woodDark, wob: 1, seed: 152 });
  sk.ink(dense([[380, 470], [350, 506]], 5), { w: 9, color: C.woodDark, wob: 0.5, seed: 153 });
  sk.ink(dense([[830, 470], [860, 506]], 5), { w: 9, color: C.woodDark, wob: 0.5, seed: 154 });
  drawFigure(sk, 150, 512, 0.58, pose({ elR: [100, -290], haR: [170, -330] }), { ...STUDENT });
  return { sk };
}

/* ══════════ 7. 연못에 뜬 탁구공 (g2u3l7) ══════════ */
// cone = 나뭇잎 끝에 맺힌 빗방울의 가운데(앱이 splash까지 떨어뜨린다), float = 탁구공이 뜬 자리(앱이 위아래로 흔든다).
// 탁구공 색은 랩(g2u3BallLab)과 정밀 그림(g2u3l7f1)의 공과 같다: 왼쪽 위 #FFFFFF → #FFB35C.
export const FLOAT = { water: 340, cone: [250, 156], splash: [250, 340], float: [640, 340], hit: [150, 60, 210, 200] };
export function floatBase() {
  const sk = new Sk(W, H, { id: "g3h" });
  // 연못
  sk.raw(`<rect x="40" y="${FLOAT.water}" width="800" height="170" fill="${C.sea}" opacity=".55"/>`);
  sk.ink(dense([[40, FLOAT.water], [840, FLOAT.water + 2]], 8), { w: 8, color: C.seaDeep, wob: 1.6, seed: 161 });
  // 둑과 학생(탁구공 쪽을 본다)
  const bank = poly([[820, 300], [930, 296], [930, 512], [800, 512]], 6);
  sk.fill(bank, "#DDE9C9", { dx: 0, dy: 0, wob: 1, seed: 162, tex: true });
  sk.ink(dense([[800, 512], [820, 300], [930, 296]], 6), { w: 9, wob: 1.2, seed: 163 });
  drawFigure(sk, 872, 300, 0.42, pose({ elR: [80, -290], haR: [150, -312] }), { ...STUDENT, mirror: true });
  // 나뭇가지와 잎. 마지막 잎 끝에 빗방울이 맺혀 있다
  sk.ink(curve([[40, 92], [150, 84], [236, 100]]), { w: 12, color: C.woodDark, wob: 1, seed: 166 });
  [[96, 104, 0.6], [168, 70, -0.45], [234, 116, 1.05]].forEach(([x, y, r], i) => sk.at(x, y, 1, () => {
    const lf = ell(0, 0, 32, 13);
    sk.fill(lf, C.green, { dx: 0, dy: 0, wob: 0.4, seed: 167 + i * 2 });
    sk.ink(lf, { w: 6, wob: 0.5, seed: 168 + i * 2 });
  }, r));
  // 빗방울(앱이 떨어뜨린다)
  g(sk, "opn-g2u3-cone", () => {
    const [x, y] = FLOAT.cone;
    const dp = curve([[x, y - 26], [x + 11, y - 9], [x + 14, y + 3], [x + 8, y + 14], [x, y + 17], [x - 8, y + 14], [x - 14, y + 3], [x - 11, y - 9]], true, 3);
    sk.fill(dp, "#BFE6FB", { dx: 0, dy: 0, wob: 0.3, seed: 181 });
    sk.ink(dp, { w: 5, color: C.seaDeep, wob: 0.3, seed: 182 });
    sk.dot(x - 5, y + 1, 3.2, C.white);
  });
  // 탁구공(앱이 위아래로 움직인다). 아래쪽이 물에 조금 잠겨 있다
  g(sk, "opn-g2u3-flt", () => {
    const [x, y] = FLOAT.float;
    sk.defs.push(`<radialGradient id="g3hPing" cx="36%" cy="30%" r="74%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFB35C"/></radialGradient>`);
    const b = circ(x, y - 12, 26, { seed: 191 });
    sk.fill(b, "url(#g3hPing)", { dx: 0, dy: 0, wob: 0.3, seed: 192 });
    sk.ink(b, { w: 6, color: "#C46816", wob: 0.4, seed: 193 });
    sk.ink(dense([[x - 34, y + 3], [x + 34, y + 3]], 4), { w: 5, color: C.seaDeep, wob: 0.4, seed: 194 });
  });
  return { sk };
}

/* ══════════ 8. 칼림바 (g2u3l8) ══════════ */
export const KAL = { long: [420, 190, 250], mid: [540, 190, 190], short: [660, 190, 130], hitLong: [345, 170, 150, 290], hitShort: [585, 170, 150, 290] };
export function kalimbaBase() {
  const sk = new Sk(W, H, { id: "g3i" });
  ground(sk);
  // 울림통
  const body = rrect(320, 130, 440, 360, 40);
  sk.fill(body, C.wood, { dx: 1, dy: 1.2, wob: 1, seed: 201, tex: true });
  sk.ink(body, { w: 10, wob: 1.2, seed: 202 });
  const hole = circ(540, 420, 34, { seed: 203 });
  sk.fill(hole, C.woodDark, { dx: 0, dy: 0, wob: 0.4, seed: 204 });
  // 막대를 누르는 받침
  sk.ink(dense([[360, 196], [720, 196]], 6), { w: 16, color: C.navy, wob: 0.4, seed: 205 });
  // 금속 막대 셋(긴 것, 가운데, 짧은 것). 앱이 튕긴 막대를 떨게 한다
  [["t-long", KAL.long], ["t-mid", KAL.mid], ["t-short", KAL.short]].forEach(([cls, [x, y, len]], i) => {
    g(sk, `opn-g2u3-tine ${cls}`, () => {
      const t = rrect(x - 17, y - 26, 34, len, 14);
      sk.fill(t, "#DDE3EA", { dx: 0, dy: 0, wob: 0.3, seed: 211 + i * 3 });
      sk.ink(t, { w: 6, wob: 0.4, seed: 212 + i * 3 });
    });
  });
  // 음표: 낮은 소리(아래쪽)와 높은 소리(위쪽). 앱이 켠다
  g(sk, "opn-g2u3-note lo", () => note(sk, 250, 400, 1.5, { seed: 221, color: C.blue }));
  g(sk, "opn-g2u3-note hi", () => note(sk, 836, 150, 1.5, { seed: 225, color: C.red }));
  drawFigure(sk, 130, 512, 0.5, pose({ elR: [90, -300], haR: [60, -390] }), { ...STUDENT });
  return { sk };
}

/** build-intro.mjs가 부른다: 그림을 싣고 장면별 좌표를 돌려준다. */
export function build(add) {
  return {
    town: { ...TOWN, ...add("townBase", townBase()) },
    dark: { ...DARK, ...add("darkBase", darkBase()) },
    cat: { ...CATM, ...add("catBase", catBase()) },
    spoon: { ...SPOON, ...add("spoonBase", spoonBase()) },
    dots: { ...DOTS, ...add("dotsBase", dotsBase()) },
    float: { ...FLOAT, ...add("floatBase", floatBase()) },
    kalimba: { ...KAL, ...add("kalimbaBase", kalimbaBase()) },
    straw: { ...STRAW, ...add("strawBase", strawBase()), ...add("strawCup", strawCup()) },
  };
}
