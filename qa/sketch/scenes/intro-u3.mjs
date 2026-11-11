// 중1 과학 Ⅲ(열) 도입(opener) 네 장면의 그림(손그림 코드 그림). intro-u1.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   cups  (u3l1) 뚜껑 덮인 똑같은 컵 둘. 뚜껑을 열면 한쪽은 김, 한쪽은 얼음
//   egg   (u3l2) 갓 삶은 달걀, 찬물 그릇, 온도계 둘
//   beach (u3l4) 해, 모래밭과 바다, 온도계 둘
//   wire  (u3l5) 전봇대 둘, 해와 눈구름(전깃줄은 장면 코드가 그린다)
// 빌드: node qa/sketch/build-intro.mjs u3  →  src/ui/introArt.u3.generated.ts
import { Sk, C, curve, dense, circ, ell, poly, rrect, squiggle, sparkle } from "../lib/sk.mjs";
import { sun, sea, cloud } from "../lib/props.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const RED = "#E0503A";

// 온도계: 흰 유리관 + 눈금(기호) + 빨간 기둥(앱이 scaleY로 높이를 바꾼다). 기둥의 바닥은 y1이다.
function tube(sk, cx, y0, y1, hw, cls, sd) {
  const t = rrect(cx - hw, y0, hw * 2, y1 - y0 + hw, hw);
  sk.fill(t, "#FFFFFF", { dx: 0, dy: 0, wob: 0.4, seed: sd });
  const cw = hw * 0.9;
  sk.raw(`<rect class="${cls}" x="${cx - cw / 2}" y="${y0 + 10}" width="${cw}" height="${y1 - y0 - 10}" rx="${cw / 2}" fill="${RED}"/>`);
  sk.ink(t, { w: hw > 14 ? 8 : 6, wob: 0.5, seed: sd + 1 });
  for (let y = y0 + 24, i = 0; y < y1 - 8; y += (y1 - y0) / 6, i++) sk.ink(dense([[cx + hw + 5, y], [cx + hw + (i % 2 ? 13 : 19), y]]), { w: 3.5, color: C.gray, wob: 0.2, seed: sd + 3 + i });
}
const steam = (sk, x, y, n, sd, len = 86) => {
  for (let i = 0; i < n; i++) sk.ink(squiggle(x + (i - (n - 1) / 2) * 34, y, len, 10, 2, i * 1.7), { w: 8, color: "#B9C0CA", wob: 0, seed: sd + i });
};
const flake = (sk, x, y, r, sd) => {
  for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.2; sk.ink(dense([[x - r * Math.cos(a), y - r * Math.sin(a)], [x + r * Math.cos(a), y + r * Math.sin(a)]]), { w: 6, color: "#5FAEDD", wob: 0.3, seed: sd + i }); }
};

/* ══════════ 1. 똑같아 보이는 두 컵 (u3l1) ══════════ */
const TABLE = 472, RIM = 262;
export const CP = {
  left: { x: 300, kind: "cold" }, right: { x: 660, kind: "hot" },
  hit: { w: 250, y: 150, h: 340 }, // 컵마다 누르는 자리(가운데 x 기준 너비, 위, 높이)
};
function tumbler(sk, cx, key, sd) {
  // 속(뚜껑을 열면 보인다): 뜨거운 쪽은 김, 차가운 쪽은 얼음과 서늘한 기호
  if (key === "hot") g(sk, "opn-u3-in hot", () => steam(sk, cx, RIM - 16, 3, sd + 60, 104));
  else g(sk, "opn-u3-in cold", () => {
    for (const [dx, dy, r] of [[-30, -26, 0.2], [22, -34, -0.25]]) {
      const cube = rrect(-24, -24, 48, 48, 9);
      sk.at(cx + dx, RIM + dy, 1, () => { sk.fill(cube, "#CBE9FA", { dx: 0, dy: 0, wob: 0.4, seed: sd + 61 }); sk.ink(cube, { w: 7, color: "#5FAEDD", wob: 0.5, seed: sd + 62 }); }, r);
    }
    flake(sk, cx - 78, RIM - 92, 20, sd + 70);
    flake(sk, cx + 70, RIM - 112, 16, sd + 75);
  });
  const body = poly([[cx - 84, RIM], [cx + 84, RIM], [cx + 64, TABLE], [cx - 64, TABLE]], 5);
  sk.fill(body, "#9FB3C8", { dx: 0.8, dy: 1, wob: 0.6, seed: sd, tex: true });
  sk.ink(body, { w: 10, wob: 0.9, seed: sd + 1 });
  const band = poly([[cx - 78, RIM + 62], [cx + 78, RIM + 62], [cx + 73, RIM + 118], [cx - 73, RIM + 118]], 5);
  sk.fill(band, "#F3F5F8", { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 });
  sk.ink(band, { w: 6, wob: 0.5, seed: sd + 3 });
  g(sk, `opn-u3-lid ${key}`, () => {
    const lid = rrect(cx - 96, RIM - 26, 192, 34, 15);
    sk.fill(lid, "#55657C", { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd + 4, tex: true });
    sk.ink(lid, { w: 9, wob: 0.7, seed: sd + 5 });
    const knob = rrect(cx - 26, RIM - 48, 52, 24, 10);
    sk.fill(knob, "#55657C", { dx: 0, dy: 0, wob: 0.4, seed: sd + 6 });
    sk.ink(knob, { w: 8, wob: 0.6, seed: sd + 7 });
  });
}
export function cupsBase() {
  const sk = new Sk(W, H, { id: "cp" });
  sk.ink(dense([[70, TABLE + 4], [890, TABLE + 6]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: 3 });
  tumbler(sk, CP.left.x, CP.left.kind, 11);
  tumbler(sk, CP.right.x, CP.right.kind, 31);
  return { sk };
}

/* ══════════ 2. 삶은 달걀과 찬물 (u3l2) ══════════ */
export const EG = { bowlX: 330, eggY: 148, dipY: 372, hit: [150, 40, 360, 450], thermoEgg: 700, thermoWater: 846 };
export function eggBase() {
  const sk = new Sk(W, H, { id: "eg" });
  const bx = EG.bowlX, top = 300, bot = 478;
  sk.ink(dense([[60, bot + 4], [900, bot + 6]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: 3 });
  // 물(그릇 안)
  const wat = poly([[bx - 150, top + 34], [bx + 150, top + 34], [bx + 122, bot - 6], [bx - 122, bot - 6]], 5);
  sk.fill(wat, C.sea, { dx: 0, dy: 0, wob: 0.5, seed: 11, tex: 0.8 });
  // 달걀(앱이 위아래로 옮긴다) + 김
  g(sk, "opn-u3-egg", () => {
    g(sk, "opn-u3-eggsteam", () => steam(sk, bx, EG.eggY - 64, 3, 21, 70));
    const egg = curve([[0, -62], [34, -34], [44, 8], [30, 44], [0, 56], [-30, 44], [-44, 8], [-34, -34]], true, 3);
    sk.at(bx, EG.eggY, 1, () => { sk.fill(egg, "#FBE7C8", { dx: 0.8, dy: 1, wob: 0.5, seed: 25 }); sk.ink(egg, { w: 9, wob: 0.6, seed: 26 }); });
  });
  // 그릇 앞면(달걀이 물에 잠겨 보이게 물빛을 한 겹 더)과 테두리
  g(sk, "opn-u3-front", () => sk.fill(poly([[bx - 148, top + 36], [bx + 148, top + 36], [bx + 122, bot - 6], [bx - 122, bot - 6]], 5), C.sea, { dx: 0, dy: 0, wob: 0.4, seed: 12, alpha: 0.55 }));
  sk.ink(curve([[bx - 150, top + 34], [bx - 75, top + 26], [bx, top + 34], [bx + 75, top + 42], [bx + 150, top + 34]]), { w: 6, color: C.seaDeep, wob: 0.3, seed: 13 });
  sk.ink(dense([[bx - 170, top], [bx - 128, bot], [bx + 128, bot], [bx + 170, top]], 5), { w: 10, wob: 0.9, seed: 14 });
  // 온도계 둘: 위의 기호가 무엇의 온도인지 알려 준다(달걀, 물방울)
  const eg2 = curve([[0, -26], [15, -14], [19, 4], [13, 19], [0, 24], [-13, 19], [-19, 4], [-15, -14]], true, 3);
  sk.at(EG.thermoEgg, 74, 1, () => { sk.fill(eg2, "#FBE7C8", { dx: 0, dy: 0, wob: 0.3, seed: 31 }); sk.ink(eg2, { w: 6, wob: 0.4, seed: 32 }); });
  const dr = curve([[0, -28], [15, 0], [11, 17], [0, 23], [-11, 17], [-15, 0]], true, 3);
  sk.at(EG.thermoWater, 74, 1, () => { sk.fill(dr, C.sea, { dx: 0, dy: 0, wob: 0.3, seed: 33 }); sk.ink(dr, { w: 6, color: C.blue, wob: 0.4, seed: 34 }); });
  tube(sk, EG.thermoEgg, 126, 440, 19, "opn-u3-col egg", 41);
  tube(sk, EG.thermoWater, 126, 440, 19, "opn-u3-col water", 51);
  for (const [x, sd] of [[EG.thermoEgg, 61], [EG.thermoWater, 65]]) { const b = circ(x, 466, 34, { over: 0.15, seed: sd }); sk.fill(b, RED, { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 }); sk.ink(b, { w: 8, wob: 0.6, seed: sd + 2 }); }
  // 같은 높이에서 멈췄을 때 켜지는 점선
  g(sk, "opn-u3-level", () => sk.ink(dense([[EG.thermoEgg - 54, 0], [EG.thermoWater + 54, 0]], 8), { w: 7, color: C.orange, wob: 0.3, seed: 71, dash: [18, 16] }));
  return { sk };
}

/* ══════════ 3. 한낮의 해변 (u3l4) ══════════ */
export const BE = { sun: [150, 118, 58], hit: [40, 10, 220, 220], sand: 300, water: 720 };
export function beachBase() {
  const sk = new Sk(W, H, { id: "be" });
  const shore = 506;
  // 햇볕(누르는 동안 흐른다)
  g(sk, "opn-u3-rays", () => {
    [[250, 330], [360, 350], [600, 340], [800, 350]].forEach(([x, y], i) => sk.ink(dense([[190 + i * 14, 168 + i * 4], [x, y]], 6), { w: 8, color: C.yellow, wob: 0.4, seed: 51 + i, dash: [20, 18] }));
  });
  // 모래밭(왼쪽)과 바다(오른쪽)
  const sand = [...curve([[0, 392], [140, 380], [300, 388], [430, 404], [520, 430]], false, 5), ...dense([[520, 430], [520, H], [0, H], [0, 392]], 8)];
  sea(sk, 470, W, 412, H, { seed: 501, waves: 4 });
  sk.fill(sand, "#EAD4A0", { dx: 0, dy: 0, wob: 0.6, seed: 11, tex: true });
  sk.ink(curve([[0, 392], [140, 380], [300, 388], [430, 404], [520, 430], [560, 470], [575, shore + 30]], false, 5), { w: 9, wob: 0.9, seed: 12 });
  for (const [x, y] of [[90, 450], [210, 480], [400, 470], [150, 520], [330, 516]]) sk.dot(x, y, 4, "#C9A566");
  // 온도계 둘(모래에 하나, 바닷물에 하나)
  tube(sk, BE.sand, 150, 420, 19, "opn-u3-col sand", 21);
  tube(sk, BE.water, 150, 440, 19, "opn-u3-col sea", 31);
  for (const [x, y, sd] of [[BE.sand, 446, 41], [BE.water, 466, 45]]) { const b = circ(x, y, 34, { over: 0.15, seed: sd }); sk.fill(b, RED, { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 }); sk.ink(b, { w: 8, wob: 0.6, seed: sd + 2 }); }
  // 바닷물 온도계의 아랫부분은 물에 잠겨 보이게 물빛을 덧칠한다
  sk.fill(poly([[BE.water - 60, 428], [BE.water + 60, 428], [BE.water + 60, 510], [BE.water - 60, 510]], 6), C.sea, { dx: 0, dy: 0, wob: 0.4, seed: 61, alpha: 0.5 });
  // 끝에서 모래 쪽이 뜨겁다는 표시(열기 물결)
  g(sk, "opn-u3-hotmark", () => { for (let i = 0; i < 3; i++) sk.ink(squiggle(96 + i * 44, 372, 64, 8, 2, i * 1.3), { w: 7, color: C.orange, wob: 0, seed: 71 + i }); });
  g(sk, "opn-u3-sun", () => sun(sk, BE.sun[0], BE.sun[1], BE.sun[2]));
  return { sk };
}

/* ══════════ 4. 여름과 겨울의 전깃줄 (u3l5) ══════════
   전깃줄은 장면 코드가 두 전봇대의 이음 자리(tie) 사이에 그린다(늘어지는 정도가 바뀐다). */
export const WR = { tieL: [182, 196], tieR: [778, 196], sagWinter: 14, sagSummer: 96 };
function pole(sk, x, sd) {
  const p = poly([[x - 13, 150], [x + 13, 150], [x + 16, 500], [x - 16, 500]], 5);
  sk.fill(p, C.wood, { dx: 0.6, dy: 0.8, wob: 0.6, seed: sd, tex: true });
  sk.ink(p, { w: 9, wob: 0.8, seed: sd + 1 });
  const bar = rrect(x - 60, 176, 120, 20, 7);
  sk.fill(bar, C.woodDark, { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 });
  sk.ink(bar, { w: 8, wob: 0.6, seed: sd + 3 });
}
export function wireBase() {
  const sk = new Sk(W, H, { id: "wr" });
  sk.ink(dense([[40, 502], [920, 504]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: 3 });
  for (const [x, y] of [[90, 500], [330, 502], [560, 503], [880, 502]]) sk.ink(curve([[x - 14, y], [x - 6, y - 20], [x, y], [x + 8, y - 16], [x + 14, y]]), { w: 6, color: C.green, wob: 0.4, seed: 5 + x });
  // 여름: 해. 겨울: 눈구름과 눈
  g(sk, "opn-u3-summer", () => sun(sk, 480, 92, 46));
  g(sk, "opn-u3-winter", () => {
    cloud(sk, 480, 84, 230, 96, { seed: 461 });
    for (const [x, y, r] of [[400, 164, 13], [470, 186, 15], [548, 160, 13], [612, 190, 11], [342, 196, 11]]) flake(sk, x, y, r, 80 + x);
  });
  pole(sk, WR.tieL[0] - 12, 21);
  pole(sk, WR.tieR[0] + 12, 31);
  // 반짝: 겨울에 팽팽해진 줄 옆
  g(sk, "opn-u3-tight", () => sparkle(sk, 480, 250, 20, { seed: 91 }));
  return { sk };
}

/** build-intro.mjs가 부른다: 그림을 싣고 장면별 좌표를 돌려준다. */
export function build(add) {
  return {
    cups: { ...CP, ...add("cupsBase", cupsBase()) },
    egg: { ...EG, ...add("eggBase", eggBase()) },
    beach: { ...BE, ...add("beachBase", beachBase()) },
    wire: { ...WR, ...add("wireBase", wireBase()) },
  };
}
