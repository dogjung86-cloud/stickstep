// 중2 과학 Ⅲ 빛과 파동 도입(opener) 여덟 장면의 그림(손그림 코드 그림). intro-u5.mjs와 같은 엔진, 같은 무대(960×544).
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   town   (g2u3l1) 산에 가린 마을, 맞은편 언덕의 거울(앱이 돌리고 햇빛 줄기를 긋는다)
//   straw  (g2u3l2) 탁자 위의 유리컵과 지켜보는 학생(물과 빨대는 앱이 그린다)
// build-intro.mjs g2u3 이 build(add)를 불러 src/ui/introArt.g2u3.generated.ts에 싣는다.
import { Sk, C, curve, dense, circ, ell, arc, poly, rrect, arrow, rays } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT, TEACHER } from "../lib/figure.mjs";
import { sun, cloud } from "../lib/props.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const ground = (sk, y = 506, color = C.grayLight, sd = 3) => sk.ink(dense([[40, y], [920, y + 2]], 8), { w: 9, color, wob: 1.2, seed: sd });
const house = (sk, x, y, s, roof, sd) => {
  const b = poly([[x - 34 * s, y], [x - 34 * s, y - 46 * s], [x + 34 * s, y - 46 * s], [x + 34 * s, y]], 4);
  sk.fill(b, C.woodLight, { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd });
  sk.ink(b, { w: 6, wob: 0.6, seed: sd + 1 });
  const r = poly([[x - 44 * s, y - 44 * s], [x, y - 84 * s], [x + 44 * s, y - 44 * s]], 4);
  sk.fill(r, roof, { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd + 2 });
  sk.ink(r, { w: 6, wob: 0.6, seed: sd + 3 });
};

/* ══════════ 1. 산에 가린 마을과 거울 (g2u3l1) ══════════ */
export const TOWN = { sun: [112, 92], mir: [836, 214], spots: [[800, 400], [752, 474], [640, 486], [520, 420], [400, 296]], plaza: 2 };
export function townBase() {
  const sk = new Sk(W, H, { id: "g3a" });
  sun(sk, TOWN.sun[0], TOWN.sun[1], 40);
  ground(sk);
  // 큰 산(해와 마을 사이)
  const mt = poly([[60, 506], [250, 268], [380, 166], [500, 300], [560, 506]], 6);
  sk.fill(mt, "#CFE3C8", { dx: 1, dy: 1.2, wob: 1.4, seed: 11, tex: true });
  sk.ink(dense([[60, 506], [250, 268], [380, 166], [500, 300], [560, 506]], 6), { w: 9, wob: 1.6, seed: 12 });
  // 맞은편 언덕
  const hill = curve([[716, 506], [770, 380], [836, 262], [900, 330], [930, 506]]);
  sk.fill([...hill, [716, 506]], "#DDE9C9", { dx: 1, dy: 1.2, wob: 1, seed: 15, tex: true });
  sk.ink(hill, { w: 9, wob: 1.4, seed: 16 });
  // 마을(집 셋)
  house(sk, 586, 504, 0.8, C.red, 21);
  house(sk, 650, 504, 1, C.blue, 31);
  house(sk, 706, 504, 0.7, C.orange, 41);
  // 산 그늘(앱이 걷는다)
  g(sk, "opn-g2u3-shade", () => sk.raw(`<path d="M548 506 L560 392 L740 392 L740 506 Z" fill="#2F4168" opacity=".34"/>`));
  // 밝아진 광장(앱이 켠다)
  g(sk, "opn-g2u3-lit", () => { sk.glow(646, 470, 120, C.yellow, 0.75, 0.15); rays(sk, 646, 404, 20, 46, 5, { color: C.orange, w: 7, seed: 51 }); });
  // 거울 기둥
  sk.ink(dense([[TOWN.mir[0] + 8, TOWN.mir[1] + 6], [TOWN.mir[0] + 14, 270]], 5), { w: 8, color: C.navy, wob: 0.4, seed: 61 });
  // 거울(옆에서 본 모습, 앱이 돌린다). 거울 면은 왼쪽을 본다
  g(sk, "opn-g2u3-mir", () => {
    const [mx, my] = TOWN.mir;
    const m = poly([[mx - 7, my - 58], [mx + 7, my - 58], [mx + 7, my + 58], [mx - 7, my + 58]], 4);
    sk.fill(m, C.sea, { dx: 0, dy: 0, wob: 0.3, seed: 63 });
    sk.ink(m, { w: 6, wob: 0.4, seed: 64 });
    sk.ink(dense([[mx + 7, my - 58], [mx + 7, my + 58]], 5), { w: 8, color: C.navy, wob: 0.2, seed: 65 });
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

/* ══════════ 4. 거울 앞의 고양이 (g2u3l4) ══════════ */
export const CATM = { mirror: 480, step: 62, steps: 3 };
export function catBase() {
  const sk = new Sk(W, H, { id: "g3e" });
  // 거울 속(오른쪽)은 옅은 하늘색으로 깐다
  sk.raw(`<rect x="${CATM.mirror}" y="40" width="440" height="466" fill="#DCEEFB"/>`);
  ground(sk);
  // 거울(옆에서 본 모습)과 받침
  const m = poly([[CATM.mirror - 8, 60], [CATM.mirror + 8, 60], [CATM.mirror + 8, 504], [CATM.mirror - 8, 504]], 6);
  sk.fill(m, C.sea, { dx: 0, dy: 0, wob: 0.3, seed: 101 });
  sk.ink(m, { w: 7, wob: 0.5, seed: 102 });
  // 진짜 고양이(왼쪽, 거울을 본다)
  g(sk, "opn-g2u3-cat", () => sk.at(CATM.mirror - 290, 500, 1, () => cat(sk, 0, 0, 1.05, 111), 0, -1));
  // 거울 속 고양이(오른쪽, 마주 본다)
  g(sk, "opn-g2u3-cat2", () => sk.at(CATM.mirror + 290, 500, 1, () => cat(sk, 0, 0, 1.05, 111)));
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

/* ══════════ 6. 점으로 그린 물고기 (g2u3l6) ══════════ */
export const DOTS = { body: [606, 262, 168, 96], tail: [[446, 262], [352, 186], [352, 338]], eye: [704, 236], gap: 25, r: 10 };
export function dotsBase() {
  const sk = new Sk(W, H, { id: "g3g" });
  ground(sk);
  // 이젤 위의 도화지(물고기는 앱이 점으로 찍는다)
  const paper = rrect(300, 58, 610, 410, 18);
  sk.fill(paper, "#FFFDF6", { dx: 0, dy: 0, wob: 0.6, seed: 151 });
  sk.ink(paper, { w: 9, color: C.woodDark, wob: 1, seed: 152 });
  sk.ink(dense([[380, 470], [350, 506]], 5), { w: 9, color: C.woodDark, wob: 0.5, seed: 153 });
  sk.ink(dense([[830, 470], [860, 506]], 5), { w: 9, color: C.woodDark, wob: 0.5, seed: 154 });
  drawFigure(sk, 150, 512, 0.58, pose({ elR: [100, -290], haR: [170, -330] }), { ...STUDENT });
  return { sk };
}

/* ══════════ 7. 연못의 낚시찌 (g2u3l7) ══════════ */
export const FLOAT = { water: 340, cone: [250, 150], splash: [250, 340], float: [640, 340], hit: [150, 60, 210, 200] };
export function floatBase() {
  const sk = new Sk(W, H, { id: "g3h" });
  // 연못
  sk.raw(`<rect x="40" y="${FLOAT.water}" width="800" height="170" fill="${C.sea}" opacity=".55"/>`);
  sk.ink(dense([[40, FLOAT.water], [840, FLOAT.water + 2]], 8), { w: 8, color: C.seaDeep, wob: 1.6, seed: 161 });
  // 둑과 학생
  const bank = poly([[820, 300], [930, 296], [930, 512], [800, 512]], 6);
  sk.fill(bank, "#DDE9C9", { dx: 0, dy: 0, wob: 1, seed: 162, tex: true });
  sk.ink(dense([[800, 512], [820, 300], [930, 296]], 6), { w: 9, wob: 1.2, seed: 163 });
  drawFigure(sk, 872, 300, 0.42, pose({ elR: [-110, -300], haR: [-190, -350] }), { ...STUDENT });
  // 낚싯대
  sk.ink(dense([[792, 152], [700, 60]], 6), { w: 6, color: C.woodDark, wob: 0.4, seed: 165 });
  // 소나무 가지
  sk.ink(curve([[40, 96], [170, 84], [300, 104]]), { w: 14, color: C.woodDark, wob: 1, seed: 166 });
  [[90, 78], [150, 70], [210, 78]].forEach(([x, y], i) => rays(sk, x, y, 6, 34, 5, { color: C.green, w: 6, seed: 167 + i * 5 }));
  // 솔방울(앱이 떨어뜨린다)
  g(sk, "opn-g2u3-cone", () => {
    const [x, y] = FLOAT.cone;
    const cn = ell(x, y, 22, 30);
    sk.fill(cn, C.wood, { dx: 0, dy: 0, wob: 0.5, seed: 181, tex: true });
    sk.ink(cn, { w: 7, wob: 0.6, seed: 182 });
    sk.ink(dense([[x - 16, y - 8], [x + 16, y - 8]], 4), { w: 4, color: C.woodDark, wob: 0.3, seed: 183 });
    sk.ink(dense([[x - 18, y + 8], [x + 18, y + 8]], 4), { w: 4, color: C.woodDark, wob: 0.3, seed: 184 });
  });
  // 낚시찌(앱이 위아래로 움직인다)와 낚싯줄
  g(sk, "opn-g2u3-flt", () => {
    const [x, y] = FLOAT.float;
    sk.ink(dense([[700, 60], [x, y - 56]], 6), { w: 3, color: C.gray, wob: 0.2, seed: 191 });
    const top = poly([[x - 9, y - 54], [x + 9, y - 54], [x + 11, y - 6], [x - 11, y - 6]], 4);
    sk.fill(top, C.red, { dx: 0, dy: 0, wob: 0.3, seed: 192 });
    sk.ink(top, { w: 6, wob: 0.4, seed: 193 });
    const bot = poly([[x - 11, y - 6], [x + 11, y - 6], [x + 5, y + 30], [x - 5, y + 30]], 4);
    sk.fill(bot, C.white, { dx: 0, dy: 0, wob: 0.3, seed: 194 });
    sk.ink(bot, { w: 6, wob: 0.4, seed: 195 });
  });
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
    straw: { ...STRAW, ...add("strawBase", strawBase()), ...add("strawCup", strawCup()) },
  };
}
