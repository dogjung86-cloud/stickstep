// 중1 과학 Ⅰ 도입(opener) 세 장면의 그림(손그림 코드 그림). intro-u2.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   suncups (u1l2) 해, 색종이로 감싼 물컵 셋과 온도계, 검은 컵 위의 파라솔
//   speaker (u1l4) 아이, 스피커, 둘 사이의 말소리, 스피커 위의 물음표와 음표
//   blanket (u1l5) 지구와 굴뚝, 지구를 덮은 기체 세 겹, 지구가 내보내는 열, 온도계
// build-intro.mjs가 build(add)를 불러 introArt.generated.ts에 싣는다.
import { Sk, C, curve, dense, circ, ell, arc, poly, rrect, arrow, qmark } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";
import { sun, note, earth } from "../lib/props.mjs";

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

/* ══════════ 1. 햇빛과 세 컵 (u1l2) ══════════
   빛은 왼쪽 위에서 비스듬히 내려온다(기울기 0.15). 검은 컵만 파라솔 그늘 안에 있다. */
export const SC = {
  sun: [150, 126, 62], // 해의 가운데와 반지름
  hit: [44, 20, 212, 212], // 해를 누르는 자리(x, y, w, h)
  cups: { white: 330, blue: 560, black: 800 },
};
const CUP = { white: ["#FDFDFB", 11], blue: ["#3F8FE8", 21], black: ["#3B4048", 31] };
const RIM = 344, FOOT = 480;

function cup(sk, cx, key) {
  const [color, sd] = CUP[key];
  const back = ell(cx, RIM, 58, 13);
  sk.fill(back, "#C9D3DC", { dx: 0, dy: 0, wob: 0.4, seed: sd });
  sk.ink(ell(cx, RIM, 58, 13, Math.PI, Math.PI * 2), { w: 7, wob: 0.5, seed: sd + 1 });
  tube(sk, cx, 178, 356, 13, `opn-sc-col c-${key}`, sd + 2);
  const front = ell(cx, RIM, 58, 13, 0, Math.PI);
  const body = [...front, ...dense([[cx - 58, RIM], [cx - 46, FOOT], [cx + 46, FOOT], [cx + 58, RIM]], 5)];
  sk.fill(body, color, { dx: 0.6, dy: 0.8, wob: 0.6, seed: sd + 12, tex: key !== "white" });
  sk.ink(body, { w: 9, wob: 0.8, seed: sd + 13 });
}

export function suncupsBase() {
  const sk = new Sk(W, H, { id: "sc" });
  const K = 0.15;
  // 탁자
  sk.ink(dense([[214, FOOT + 4], [940, FOOT + 6]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: 3 });
  // 그늘(파라솔 아래)
  g(sk, "opn-sc-shade", () => {
    const sh = poly([[694, 150], [936, 150], [956, 300], [956, FOOT], [694 + K * (FOOT - 150), FOOT]], 6);
    sk.fill(sh, "#5A6B7F", { dx: 0, dy: 0, wob: 0.6, seed: 41, alpha: 0.26, tex: false });
  });
  // 햇빛: 비스듬한 점선(검은 컵 쪽은 파라솔에서 끊긴다)
  g(sk, "opn-sc-rays", () => {
    const ray = (x1, y1, y0, i) => sk.ink(dense([[x1 - K * (y1 - y0), y0], [x1, y1]], 6), { w: 8, color: C.yellow, wob: 0.4, seed: 51 + i, dash: [20, 18] });
    [[286, 322], [372, 322], [516, 322], [602, 322]].forEach(([x, y], i) => ray(x, y, 150, i));
    [[742, 112], [812, 88], [884, 108]].forEach(([x, y], i) => ray(x, y, 14, 5 + i));
  });
  // 파라솔: 기운 대와 빨간 지붕
  sk.ink(dense([[928, FOOT + 2], [832, 150]], 6), { w: 10, color: C.woodDark, wob: 0.8, seed: 61 });
  const top = [...curve([[694, 150], [728, 104], [815, 82], [902, 104], [936, 150]], false, 4), ...dense([[936, 150], [694, 150]], 6)];
  sk.fill(top, RED, { dx: 0.8, dy: 1, wob: 0.8, seed: 62, tex: true });
  sk.ink(top, { w: 9, wob: 0.9, seed: 63 });
  sk.ink(curve([[775, 150], [790, 108], [815, 84]]), { w: 5, color: "#9E3324", wob: 0.4, seed: 64 });
  sk.ink(curve([[855, 150], [840, 108], [815, 84]]), { w: 5, color: "#9E3324", wob: 0.4, seed: 65 });
  for (const key of ["white", "blue", "black"]) cup(sk, SC.cups[key], key);
  // 끝에서 검은 컵과 파라솔을 가리키는 점선 테두리
  g(sk, "opn-sc-mark", () => sk.ink(ell(808, 292, 142, 214), { w: 8, color: C.orange, wob: 1.2, seed: 71, dash: [22, 20] }));
  // 해
  g(sk, "opn-sc-sun", () => sun(sk, SC.sun[0], SC.sun[1], SC.sun[2]));
  return { sk };
}

/* ══════════ 2. 말을 배우는 스피커 (u1l4) ══════════ */
export const SP = { speakerX: 724 };

export function speakerBase() {
  const sk = new Sk(W, H, { id: "sp" });
  sk.ink(dense([[40, 506], [920, 508]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: 3 });
  // 아이: 한 팔로 스피커 쪽을 가리킨다
  drawFigure(sk, 168, 502, 0.76, pose({ elR: [70, -300], haR: [136, -322], elL: [-42, -262], haL: [-58, -190] }), { ...STUDENT });
  // 말소리: 같은 물결 묶음 셋(앱이 오른쪽으로 흘려 보낸다)
  [[300, 196, 0], [300, 128, 1], [300, 264, 2]].forEach(([x, y, i]) => {
    g(sk, `opn-sp-wave w${i + 1}`, () => {
      [26, 50, 74].forEach((r, j) => sk.ink(arc(x, y, r, -0.62, 0.62), { w: 9, color: C.teal, wob: 0.4, seed: 21 + i * 5 + j }));
    });
  });
  // 스피커
  const cx = SP.speakerX;
  g(sk, "opn-sp-body", () => {
    const body = rrect(cx - 118, 196, 236, 306, 56);
    sk.fill(body, "#5B6B8C", { dx: 1, dy: 1.2, wob: 0.8, seed: 31, tex: true });
    sk.ink(body, { w: 10, wob: 0.9, seed: 32 });
    const cone = circ(cx, 392, 72, { over: 0.15, seed: 33 });
    sk.fill(cone, "#2F3A4F", { dx: 0, dy: 0, wob: 0.6, seed: 34 });
    sk.ink(cone, { w: 8, wob: 0.6, seed: 35 });
    sk.ink(circ(cx, 392, 30, { over: 0.15, seed: 36 }), { w: 7, color: "#8FA0BF", wob: 0.5, seed: 37 });
    // 배운 만큼 켜지는 등 셋
    [-56, 0, 56].forEach((dx, i) => sk.raw(`<circle class="opn-sp-lamp l${i + 1}" cx="${cx + dx}" cy="258" r="17" fill="#C9CED6" stroke="${C.ink}" stroke-width="5"/>`));
  });
  // 못 알아들었을 때의 물음표, 알아들었을 때의 음표
  g(sk, "opn-sp-q", () => qmark(sk, cx, 124, 1.05, { color: C.orange, w: 14, seed: 41 }));
  g(sk, "opn-sp-notes", () => {
    g(sk, "opn-sp-note n1", () => note(sk, cx - 86, 138, 1.35, { seed: 51 }));
    g(sk, "opn-sp-note n2", () => note(sk, cx - 6, 108, 1.6, { color: C.orange, seed: 55 }));
    g(sk, "opn-sp-note n3", () => note(sk, cx + 78, 146, 1.3, { color: C.blue, seed: 59 }));
  });
  return { sk };
}

/* ══════════ 3. 지구를 덮은 기체 (u1l5) ══════════
   기체는 세 겹의 고리다(앱이 겹을 켜고 끈다). 지구가 내보내는 열 화살표 넷은 겹이 늘수록 되돌아오는 것으로 바뀐다. */
export const BL = { cx: 392, cy: 300, r: 116 };

export function blanketBase() {
  const sk = new Sk(W, H, { id: "bl" });
  const { cx, cy, r } = BL;
  const P = (a, d) => [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  [1, 2, 3].forEach((i) => {
    g(sk, `opn-bl-layer l${i}`, () => sk.ink(circ(cx, cy, r + 2 + 25 * i, { over: 0.06, seed: 10 + i, lump: 0.02 }), { w: 23, color: i === 1 ? "#C3CAD6" : i === 2 ? "#AEB7C6" : "#98A3B5", wob: 1.6, seed: 14 + i }));
  });
  earth(sk, cx, cy, r, { w: 10 });
  // 굴뚝 달린 공장(지구 위)
  const fy = cy - r + 4;
  const box = poly([[cx - 40, fy], [cx - 40, fy - 34], [cx + 4, fy - 34], [cx + 4, fy]], 4);
  sk.fill(box, "#D9B38C", { dx: 0, dy: 0, wob: 0.5, seed: 21 }); sk.ink(box, { w: 7, wob: 0.6, seed: 22 });
  const chim = poly([[cx + 10, fy], [cx + 13, fy - 62], [cx + 33, fy - 62], [cx + 36, fy]], 4);
  sk.fill(chim, "#C9CDD2", { dx: 0, dy: 0, wob: 0.5, seed: 23 }); sk.ink(chim, { w: 7, wob: 0.6, seed: 24 });
  g(sk, "opn-bl-puff", () => {
    const p = circ(cx + 24, fy - 84, 17, { over: 0.2, seed: 25, lump: 0.08 });
    sk.fill(p, "#E6E8EC", { dx: 0, dy: 0, wob: 0.5, seed: 26 }); sk.ink(p, { w: 6, color: C.gray, wob: 0.6, seed: 27 });
  });
  // 열 화살표: 빠져나가는 것(주황)과 되돌아오는 것(빨강)
  [-2.36, -0.72, 0.8, 2.36].forEach((a, k) => {
    g(sk, `opn-bl-out a${k}`, () => arrow(sk, [P(a, r + 12), P(a, r + 122)], { straight: true, w: 11, color: C.orange, head: 28, seed: 31 + k * 4, wob: 0.6 }));
    g(sk, `opn-bl-back a${k}`, () => arrow(sk, [P(a - 0.3, r + 12), P(a - 0.12, r + 66), P(a + 0.14, r + 66), P(a + 0.3, r + 14)], { w: 11, color: RED, head: 28, seed: 51 + k * 4, wob: 0.6 }));
  });
  // 온도계
  const tx = 812;
  const bulb = circ(tx, 436, 38, { over: 0.15, seed: 61 });
  tube(sk, tx, 92, 410, 19, "opn-bl-col", 62);
  sk.fill(bulb, RED, { dx: 0, dy: 0, wob: 0.5, seed: 71 }); sk.ink(bulb, { w: 8, wob: 0.6, seed: 72 });
  return { sk };
}

/** build-intro.mjs가 부른다: 그림을 싣고 장면별 좌표를 돌려준다. */
export function build(add) {
  return {
    suncups: { ...SC, ...add("suncupsBase", suncupsBase()) },
    speaker: { ...SP, ...add("speakerBase", speakerBase()) },
    blanket: { ...BL, ...add("blanketBase", blanketBase()) },
  };
}
