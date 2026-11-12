// 중2 과학 Ⅲ 빛과 파동 도입(opener) 여덟 장면의 그림(손그림 코드 그림). intro-u5.mjs와 같은 엔진, 같은 무대(960×544).
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   town   (g2u3l1) 산에 가린 마을, 맞은편 언덕의 거울(앱이 돌리고 햇빛 줄기를 긋는다)
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

/** build-intro.mjs가 부른다: 그림을 싣고 장면별 좌표를 돌려준다. */
export function build(add) {
  return {
    town: { ...TOWN, ...add("townBase", townBase()) },
  };
}
