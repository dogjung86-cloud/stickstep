// 중2 과학 Ⅱ 지권의 변화 도입(opener) 아홉 장면의 그림(손그림 코드 그림). intro-u4.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   sea    (g2u2l1) 지구와, 지구의 물을 다 모은 물방울 공
//   grain  (g2u2l2) 암석 한 덩이와 돋보기 속의 알갱이
//   lava   (g2u2l3) 화산의 단면: 지표로 흘러나온 용암과 땅속의 마그마
//   jar    (g2u2l4) 흙탕물 병: 자갈, 모래, 진흙이 차례로 가라앉는다
//   snow   (g2u2l5) 폭신한 눈 더미와 누르는 판
//   pebble (g2u2l6) 강가의 둥근 자갈, 강 중간의 돌, 산의 바위
//   bottle (g2u2l7) 물을 가득 채운 유리병이 얼면서 금이 간다
//   paper  (g2u2l8) 찢어진 종이 두 조각
//   ice    (g2u2l9) 언 호수의 얼음판 세 조각
// 실행: node qa/sketch/build-intro.mjs g2u2  →  src/ui/introArt.g2u2.generated.ts
import { Sk, C, circ, curve, dense, ell, poly, rrect, squiggle, emark, qmark, hash } from "../lib/sk.mjs";
import { earth } from "../lib/props.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const floor = (sk, y, sd) => sk.ink(dense([[30, y], [930, y + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: sd });
// 모난 돌 하나(가운데 x, y, 크기 r, 모난 정도 k)
const rock = (x, y, r, sd, n = 7, k = 0.28) => {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + hash(sd + i) * 0.5; const rr = r * (1 - k + hash(sd + i * 3.1) * k * 2); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8]); }
  return pts;
};
const blob = (sk, pts, color, sd, o = {}) => {
  const p = o.smooth ? curve(pts, true, 4) : poly(pts, 4);
  sk.fill(p, color, { dx: 0.5, dy: 0.7, wob: 0.6, seed: sd, tex: o.tex ?? 0.7, alpha: o.alpha });
  if (o.line !== false) sk.ink(p, { w: o.w ?? 8, color: o.line ?? C.ink, wob: 0.7, seed: sd + 1 });
};

/* ══════════ 1. 지구의 물을 다 모으면 (g2u2l1) ══════════ */
// 지구 반지름 210일 때, 지구의 물을 모두 모은 공의 반지름은 약 23이다(지름 약 1385 km, 지구 지름의 약 11%).
export const SE = { earth: [330, 276, 210], ball: [742, 360, 23] };
export function seaBase() {
  const sk = new Sk(W, H, { id: "se" });
  const [ex, ey, er] = SE.earth;
  earth(sk, ex, ey, er, { sea: "#D8BE94", seed: 941 }); // 물을 걷어 낸 지구(바다 자리가 땅색)
  g(sk, "opn-g2u2-se-wet", () => earth(sk, ex, ey, er, { seed: 941 }));
  const [bx, by, br] = SE.ball;
  g(sk, "opn-g2u2-se-ball", () => {
    const b = circ(bx, by, br, { seed: 5 });
    sk.fill(b, "#7CC4F0", { dx: 0, dy: 0, wob: 0.4, seed: 6 });
    sk.ink(b, { w: 7, color: C.blue, wob: 0.5, seed: 7 });
  });
  g(sk, "opn-g2u2-se-q", () => qmark(sk, bx, by - 120, 0.8, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 2. 암석을 확대하면 (g2u2l2) ══════════ */
export const GR = { lens: [686, 250, 168] };
const GRAIN = ["#F4F1EA", "#F2B6A0", "#3A3A3F", "#F4F1EA", "#F2B6A0"];
export function grainBase() {
  const sk = new Sk(W, H, { id: "gr" });
  floor(sk, 500, 3);
  const body = [[90, 470], [70, 360], [130, 250], [250, 190], [370, 210], [450, 300], [460, 420], [420, 486], [200, 496]];
  blob(sk, body, "#D9C3B6", 11, { smooth: true, w: 10 });
  for (let i = 0; i < 26; i++) {
    const x = 130 + hash(i * 1.7) * 280, y = 250 + hash(i * 2.9 + 4) * 210;
    sk.fill(ell(x, y, 5, 4), i % 3 ? "#8C7A70" : "#F7EFE8", { dx: 0, dy: 0, wob: 0.2, seed: 20 + i, tex: false });
  }
  // 돋보기(처음에는 숨겨 두고 앱이 보인다)
  const [lx, ly, lr] = GR.lens;
  g(sk, "opn-g2u2-gr-lens", () => {
    sk.ink(dense([[lx - 118, ly + 118], [lx - 210, ly + 212]], 6), { w: 22, wob: 0.6, seed: 31 });
    sk.fill(circ(lx, ly, lr, { seed: 32 }), "#E9DCD3", { dx: 0, dy: 0, wob: 0.3, seed: 33, tex: false });
    // 알갱이: 세 가지 색(밝은 회색, 분홍, 검정)
    let n = 0;
    for (let r = 0; r < 5; r++) for (let q = 0; q < 5; q++) {
      const x = lx - 124 + q * 62 + (r % 2) * 28 + (hash(n * 3.3) - 0.5) * 18, y = ly - 120 + r * 60 + (hash(n * 5.1) - 0.5) * 16;
      n++;
      if (Math.hypot(x - lx, y - ly) > lr - 40) continue;
      const col = GRAIN[Math.floor(hash(n * 7.7) * GRAIN.length)];
      const p = poly(rock(x, y, col === "#3A3A3F" ? 24 : 36, 100 + n * 9, 6, 0.22), 4);
      sk.fill(p, col, { dx: 0, dy: 0, wob: 0.4, seed: 200 + n, tex: 0.5 });
      sk.ink(p, { w: 5, color: "#6B5A52", wob: 0.5, seed: 300 + n });
    }
    sk.ink(circ(lx, ly, lr, { seed: 34 }), { w: 16, wob: 0.8, seed: 35 });
  });
  g(sk, "opn-g2u2-gr-q", () => qmark(sk, 690, 250, 1.3, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 3. 용암과 마그마 (g2u2l3) ══════════ */
export const LV = {};
export function lavaBase() {
  const sk = new Sk(W, H, { id: "lv" });
  // 땅속 단면
  const under = poly([[30, 300], [930, 300], [930, 522], [30, 522]], 8);
  sk.fill(under, "#EBDAB8", { dx: 0, dy: 0, wob: 0.6, seed: 3, tex: 0.6 });
  // 화산
  const cone = poly([[250, 300], [430, 120], [520, 120], [700, 300]], 6);
  sk.fill(cone, "#B9A08A", { dx: 0.6, dy: 0.8, wob: 0.7, seed: 5 });
  sk.ink(cone, { w: 10, wob: 0.9, seed: 6 });
  sk.ink(dense([[30, 300], [250, 300]], 8), { w: 10, wob: 0.9, seed: 7 });
  sk.ink(dense([[700, 300], [930, 300]], 8), { w: 10, wob: 0.9, seed: 8 });
  const deep = [[330, 430], [380, 380], [480, 366], [590, 382], [640, 432], [580, 478], [470, 490], [370, 476]];
  const pipe = [[458, 372], [462, 130], [492, 130], [500, 372]];
  const flow = [[474, 120], [520, 116], [600, 190], [680, 272], [790, 286], [820, 304], [640, 306], [560, 232], [500, 160]];
  // 뜨거운 상태
  sk.fill(poly(pipe, 6), C.orange, { dx: 0, dy: 0, wob: 0.4, seed: 11, tex: 0.5 });
  blob(sk, deep, C.orange, 13, { smooth: true, line: C.red });
  blob(sk, flow, C.orange, 15, { smooth: true, line: C.red });
  // 식은 상태(앱이 서서히 보인다)
  g(sk, "opn-g2u2-lv-topcool", () => blob(sk, flow, "#5E5A5C", 21, { smooth: true }));
  g(sk, "opn-g2u2-lv-deepcool", () => blob(sk, deep, "#8E6A55", 23, { smooth: true }));
  // 열기(지표의 용암 위)
  g(sk, "opn-g2u2-lv-heat", () => [640, 720, 790].forEach((x, i) => sk.ink(squiggle(x, 250 - i * 6, 70, 11, 1.5, i * 1.3), { w: 7, color: C.red, wob: 0.4, seed: 31 + i })));
  g(sk, "opn-g2u2-lv-q", () => qmark(sk, 850, 200, 0.8, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 4. 흙탕물 병 (g2u2l4) ══════════ */
export const JR = {};
export function jarBase() {
  const sk = new Sk(W, H, { id: "jr" });
  floor(sk, 504, 3);
  const X0 = 330, X1 = 630, TOP = 110, BOT = 486;
  sk.fill(rrect(X0, TOP, X1 - X0, BOT - TOP, 26), "#DDEFFA", { dx: 0, dy: 0, wob: 0.4, seed: 5, tex: false });
  const rnd = (i) => hash(i * 2.37 + 1);
  // 섞인 상태: 흐린 물과 떠다니는 알갱이
  g(sk, "opn-g2u2-jr-m3", () => sk.fill(rrect(X0 + 8, TOP + 40, X1 - X0 - 16, BOT - TOP - 48, 20), "#B98E62", { dx: 0, dy: 0, wob: 0.3, seed: 7, tex: 0.5, alpha: 0.6 }));
  g(sk, "opn-g2u2-jr-m2", () => { for (let i = 0; i < 46; i++) sk.fill(ell(X0 + 26 + rnd(i) * 250, TOP + 60 + rnd(i + 50) * 300, 5, 5), "#E9B949", { dx: 0, dy: 0, wob: 0.2, seed: 40 + i, tex: false }); });
  g(sk, "opn-g2u2-jr-m1", () => { for (let i = 0; i < 9; i++) blob(sk, rock(X0 + 46 + rnd(i + 9) * 210, TOP + 80 + rnd(i + 70) * 260, 19, 90 + i * 5, 7, 0.14), "#8B7765", 100 + i * 2, { smooth: true, w: 6 }); });
  // 가라앉은 상태: 아래부터 자갈, 모래, 진흙
  g(sk, "opn-g2u2-jr-s1", () => { for (let i = 0; i < 9; i++) blob(sk, rock(X0 + 34 + i * 29.5, BOT - 26 - (i % 2) * 10, 19, 90 + i * 5, 7, 0.14), "#8B7765", 130 + i * 2, { smooth: true, w: 6 }); });
  g(sk, "opn-g2u2-jr-s2", () => {
    sk.fill(rrect(X0 + 8, BOT - 100, X1 - X0 - 16, 46, 6), "#E9B949", { dx: 0, dy: 0, wob: 0.4, seed: 151, tex: 0.9 });
    for (let i = 0; i < 30; i++) sk.fill(ell(X0 + 22 + rnd(i + 5) * 256, BOT - 94 + rnd(i + 31) * 34, 3, 3), "#B9882A", { dx: 0, dy: 0, wob: 0.1, seed: 160 + i, tex: false });
  });
  g(sk, "opn-g2u2-jr-s3", () => sk.fill(rrect(X0 + 8, BOT - 134, X1 - X0 - 16, 34, 6), "#8A6142", { dx: 0, dy: 0, wob: 0.4, seed: 171, tex: 0.6 }));
  // 병
  sk.ink(rrect(X0, TOP, X1 - X0, BOT - TOP, 26), { w: 11, wob: 0.8, seed: 181 });
  const lid = rrect(X0 - 12, TOP - 34, X1 - X0 + 24, 40, 12);
  sk.fill(lid, C.teal, { dx: 0.6, dy: 0.8, wob: 0.5, seed: 183 });
  sk.ink(lid, { w: 10, wob: 0.7, seed: 184 });
  sk.ink(dense([[X0 + 26, TOP + 30], [X0 + 26, BOT - 160]]), { w: 6, color: C.white, wob: 0.4, seed: 185 });
  g(sk, "opn-g2u2-jr-q", () => qmark(sk, 770, 260, 0.9, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 5. 눈을 꾹 누르면 (g2u2l5) ══════════ */
export const SN = { press: 150 };
export function snowBase() {
  const sk = new Sk(W, H, { id: "sn" });
  floor(sk, 470, 3);
  // 다져진 눈(단단한 덩어리)
  g(sk, "opn-g2u2-sn-hard", () => {
    const slab = rrect(300, 380, 360, 88, 14);
    sk.fill(slab, "#BFE3F7", { dx: 0.5, dy: 0.7, wob: 0.5, seed: 5 });
    sk.ink(slab, { w: 10, color: C.blue, wob: 0.8, seed: 6 });
    sk.ink(dense([[330, 402], [420, 398]]), { w: 6, color: C.white, wob: 0.3, seed: 7 });
  });
  // 폭신한 눈 더미(앱이 바닥 기준으로 눌러 줄인다)
  g(sk, "opn-g2u2-sn-soft", () => {
    const pile = curve([[290, 468], [280, 380], [330, 300], [400, 250], [480, 232], [560, 250], [630, 300], [680, 380], [670, 468]], false, 4);
    sk.fill([...pile, pile[0]], C.white, { dx: 0.5, dy: 0.7, wob: 0.6, seed: 11, tex: false });
    sk.ink(pile, { w: 10, color: "#9CC7E3", wob: 1.2, seed: 12 });
    for (let i = 0; i < 22; i++) sk.ink(ell(330 + hash(i * 1.9) * 300, 290 + hash(i * 3.1 + 2) * 150, 7, 7), { w: 4, color: "#B9D8EC", wob: 0.3, seed: 20 + i });
  });
  // 누르는 판과 손잡이
  g(sk, "opn-g2u2-sn-plate", () => {
    const plate = rrect(250, 190, 460, 34, 10);
    sk.fill(plate, C.wood, { dx: 0.6, dy: 0.8, wob: 0.6, seed: 31, tex: true });
    sk.ink(plate, { w: 10, wob: 0.8, seed: 32 });
    sk.ink(dense([[480, 190], [480, 120]], 6), { w: 14, wob: 0.5, seed: 33 });
    sk.ink(dense([[420, 120], [540, 120]], 6), { w: 14, wob: 0.5, seed: 34 });
  });
  g(sk, "opn-g2u2-sn-q", () => qmark(sk, 800, 300, 0.9, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 6. 강가의 자갈 (g2u2l6) ══════════ */
export const PB = { stops: [[800, 446], [520, 330], [200, 170]] };
export function pebbleBase() {
  const sk = new Sk(W, H, { id: "pb" });
  // 산
  const mt = poly([[30, 420], [120, 150], [210, 70], [300, 170], [380, 300], [420, 420]], 6);
  sk.fill(mt, "#C9C3BA", { dx: 0.6, dy: 0.8, wob: 0.7, seed: 5, tex: true });
  sk.ink(mt, { w: 10, wob: 0.9, seed: 6 });
  // 강
  const river = curve([[300, 230], [420, 300], [560, 372], [720, 430], [930, 470]], false, 4);
  sk.ink(river, { w: 46, color: C.sea, wob: 1, seed: 9 });
  sk.ink(curve([[330, 244], [450, 310], [600, 384]], false, 4), { w: 5, color: C.white, wob: 0.5, seed: 10 });
  floor(sk, 508, 3);
  // 강가의 둥근 자갈
  blob(sk, rock(800, 452, 34, 71, 9, 0.06), "#A99A8C", 21, { smooth: true });
  // 강 중간의 돌(조금 크고 덜 둥글다)
  g(sk, "opn-g2u2-pb-mid", () => blob(sk, rock(520, 322, 52, 43, 8, 0.2), "#A99A8C", 31, { smooth: true }));
  // 산의 모난 바위와 떨어져 나온 자리
  g(sk, "opn-g2u2-pb-top", () => {
    blob(sk, rock(214, 176, 74, 17, 7, 0.34), "#A99A8C", 41, { w: 10 });
    emark(sk, 320, 80, 0.7, { seed: 43 });
  });
  g(sk, "opn-g2u2-pb-a1", () => sk.ink(curve([[760, 420], [690, 380], [600, 346]]), { w: 7, color: C.orange, wob: 0.5, seed: 51, dash: [16, 12] }));
  g(sk, "opn-g2u2-pb-a2", () => sk.ink(curve([[460, 290], [380, 240], [300, 206]]), { w: 7, color: C.orange, wob: 0.5, seed: 53, dash: [16, 12] }));
  g(sk, "opn-g2u2-pb-q", () => qmark(sk, 860, 360, 0.7, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 7. 얼어붙은 유리병 (g2u2l7) ══════════ */
export const BT = {};
export function bottleBase() {
  const sk = new Sk(W, H, { id: "bt" });
  floor(sk, 500, 3);
  const body = [...rrect(380, 190, 200, 300, 30)];
  const water = rrect(390, 200, 180, 282, 22);
  sk.fill(water, "#9CD3F2", { dx: 0, dy: 0, wob: 0.4, seed: 5, tex: 0.5 });
  sk.fill(rrect(450, 110, 60, 96, 8), "#9CD3F2", { dx: 0, dy: 0, wob: 0.3, seed: 6, tex: 0.5 });
  // 얼음(앱이 서서히 보인다)
  g(sk, "opn-g2u2-bt-ice", () => {
    sk.fill(water, "#EAF6FF", { dx: 0, dy: 0, wob: 0.4, seed: 11, tex: false });
    sk.fill(rrect(450, 110, 60, 96, 8), "#EAF6FF", { dx: 0, dy: 0, wob: 0.3, seed: 12, tex: false });
    [[420, 250, 470, 300], [500, 330, 540, 290], [430, 400, 500, 440], [520, 420, 548, 460]].forEach(([a, b, c, d], i) => sk.ink(dense([[a, b], [c, d]]), { w: 5, color: "#B5D9EE", wob: 0.5, seed: 13 + i }));
  });
  sk.ink(body, { w: 11, wob: 0.8, seed: 21 });
  sk.ink(rrect(450, 104, 60, 92, 8), { w: 10, wob: 0.6, seed: 22 });
  const cap = rrect(440, 78, 80, 34, 8);
  sk.fill(cap, C.red, { dx: 0.5, dy: 0.7, wob: 0.4, seed: 23 });
  sk.ink(cap, { w: 9, wob: 0.6, seed: 24 });
  // 금(앱이 끝에 보인다)
  g(sk, "opn-g2u2-bt-crack", () => {
    sk.ink(dense([[580, 250], [556, 290], [584, 330], [552, 380], [578, 430]], 5), { w: 8, wob: 0.4, seed: 31 });
    sk.ink(dense([[556, 290], [520, 300]], 5), { w: 6, wob: 0.3, seed: 32 });
    sk.ink(dense([[552, 380], [516, 372]], 5), { w: 6, wob: 0.3, seed: 33 });
    emark(sk, 690, 250, 0.9, { seed: 34 });
  });
  // 추위 기호(눈 결정 모양의 별표)
  g(sk, "opn-g2u2-bt-cold", () => [[250, 180], [200, 340], [760, 400], [290, 440]].forEach(([x, y], i) => {
    for (let k = 0; k < 3; k++) { const a = (k * Math.PI) / 3; sk.ink(dense([[x - Math.cos(a) * 26, y - Math.sin(a) * 26], [x + Math.cos(a) * 26, y + Math.sin(a) * 26]]), { w: 6, color: C.blue, wob: 0.3, seed: 41 + i * 3 + k }); }
  }));
  return { sk };
}

/* ══════════ 8. 찢어진 종이 (g2u2l8) ══════════ */
export const PP = { gap: 60 };
const TEAR = [[0, 96], [22, 140], [-14, 190], [26, 236], [-8, 280], [24, 330], [-18, 376], [14, 420], [0, 452]];
export function paperBase() {
  const sk = new Sk(W, H, { id: "pp" });
  const half = (cls, side) => g(sk, cls, () => {
    const off = side * PP.gap, mid = 480 + off;
    const edge = TEAR.map(([dx, y]) => [mid + dx, y]);
    const outer = side < 0 ? [[150 + off, 452], [150 + off, 96]] : [[810 + off, 96], [810 + off, 452]];
    const shape = side < 0 ? [...outer, ...edge] : [...edge.slice().reverse(), ...outer];
    const p = poly(shape, 5);
    sk.fill(p, C.parchment, { dx: 0.6, dy: 0.8, wob: 0.5, seed: 5 + side, tex: 0.6 });
    sk.ink(p, { w: 9, wob: 0.7, seed: 7 + side });
    // 글줄(글자 대신 선)
    [150, 200, 250, 372, 414].forEach((y, i) => {
      const cut = mid + (TEAR.find(([, ty]) => ty >= y)?.[0] ?? 0) * 0.5;
      const x0 = side < 0 ? 190 + off : cut + 16, x1 = side < 0 ? cut - 16 : 770 + off;
      sk.ink(dense([[x0, y], [x1, y]], 8), { w: 7, color: C.gray, wob: 0.6, seed: 20 + i + side * 3 });
    });
    // 가운데 그림: 찢어진 자리를 가로지르는 산 능선
    const ridge = [[330, 330], [400, 290], [450, 318], [480, 300], [520, 282], [570, 322], [640, 300]].map(([x, y]) => [x + off, y]);
    const part = ridge.filter(([x]) => (side < 0 ? x <= mid + 4 : x >= mid - 4));
    sk.ink(curve(part), { w: 9, color: C.teal, wob: 0.5, seed: 31 + side });
  });
  half("opn-g2u2-pp-l", -1);
  half("opn-g2u2-pp-r", 1);
  g(sk, "opn-g2u2-pp-q", () => qmark(sk, 480, 60, 0.7, { color: C.orange, seed: 45 }));
  return { sk };
}

/* ══════════ 9. 언 호수의 얼음판 (g2u2l9) ══════════ */
export const IC = { push: 26 };
export function iceBase() {
  const sk = new Sk(W, H, { id: "ic" });
  const lake = ell(480, 280, 430, 236);
  sk.fill(lake, "#7FB6DE", { dx: 0, dy: 0, wob: 0.6, seed: 3, tex: 0.6 });
  sk.ink(lake, { w: 11, wob: 1, seed: 4 });
  const A = [[110, 250], [170, 130], [330, 76], [452, 90], [430, 250], [470, 400], [330, 470], [180, 420]];
  const B = [[476, 88], [640, 84], [780, 150], [846, 270], [660, 262], [456, 244]];
  const Cc = [[494, 272], [664, 290], [848, 300], [790, 410], [640, 474], [498, 404]];
  g(sk, "opn-g2u2-ic-a", () => blob(sk, A, "#EEF8FF", 11, { line: "#6FA6CC", w: 9, tex: false }));
  blob(sk, B, "#EEF8FF", 13, { line: "#6FA6CC", w: 9, tex: false });
  blob(sk, Cc, "#EEF8FF", 15, { line: "#6FA6CC", w: 9, tex: false });
  // 부딪힌 자리의 부서짐(앱이 민 뒤에 보인다)
  g(sk, "opn-g2u2-ic-crash", () => {
    [[458, 130], [452, 200], [478, 300], [486, 370]].forEach(([x, y], i) => {
      sk.ink(dense([[x - 16, y - 14], [x, y], [x - 14, y + 14]], 4), { w: 8, color: C.red, wob: 0.3, seed: 21 + i });
      sk.ink(dense([[x + 16, y - 12], [x + 4, y], [x + 18, y + 12]], 4), { w: 8, color: C.red, wob: 0.3, seed: 31 + i });
    });
    emark(sk, 560, 60, 0.6, { seed: 41 });
  });
  g(sk, "opn-g2u2-ic-calm", () => {
    sk.ink(ell(270, 270, 46, 30), { w: 6, color: C.teal, wob: 0.5, seed: 51, dash: [12, 10] });
  });
  return { sk };
}

export function build(add) {
  return {
    sea: { ...SE, ...add("seaBase", seaBase()) },
    grain: { ...GR, ...add("grainBase", grainBase()) },
    lava: { ...LV, ...add("lavaBase", lavaBase()) },
    jar: { ...JR, ...add("jarBase", jarBase()) },
    snow: { ...SN, ...add("snowBase", snowBase()) },
    pebble: { ...PB, ...add("pebbleBase", pebbleBase()) },
    bottle: { ...BT, ...add("bottleBase", bottleBase()) },
    paper: { ...PP, ...add("paperBase", paperBase()) },
    ice: { ...IC, ...add("iceBase", iceBase()) },
  };
}
