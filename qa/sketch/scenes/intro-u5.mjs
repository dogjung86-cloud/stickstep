// 중1 과학 Ⅴ 힘의 작용 도입(opener) 여섯 장면의 그림(손그림 코드 그림). intro-u1.mjs와 같은 엔진, 같은 무대(960×544).
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   sponge  (u5l1) 탁자 위의 스펀지 공과 누르는 손(누르면 납작해지고 떼면 톡 튀어 오른다)
//   tug     (u5l2) 줄다리기 하는 두 사람, 가운데 리본, 힘쓰는 표시 세 단계
//   bow     (u5l4) 활을 든 학생, 활시위(앱이 그린다), 화살, 과녁
//   sled    (u5l5) 흙길과 빙판길 두 줄, 줄마다 썰매 하나
//   float   (u5l6) 수조와 물, 떠 있는 비치볼, 누르는 손
//   roll    (u5l7) 잔디밭, 공을 찬 학생, 굴러가는 공, 멀리 있는 깃발
// build-intro.mjs u5 가 build(add)를 불러 src/ui/introArt.u5.generated.ts에 싣는다.
import { Sk, C, curve, dense, circ, ell, arc, poly, rrect, arrow, drop, rays } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT, TEACHER, handDot } from "../lib/figure.mjs";
import { ball, cloud } from "../lib/props.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const ground = (sk, y = 506, color = C.grayLight, sd = 3) => sk.ink(dense([[40, y], [920, y + 2]], 8), { w: 9, color, wob: 1.2, seed: sd });

/* ══════════ 1. 탁자 위의 스펀지 공 (u5l1) ══════════
   손이 위에서 공을 누른다. 앱이 공 묶음(opn-u5-sp)을 바닥 기준으로 세로로 줄이고 옆으로 조금 넓히며 손(opn-u5-hand)을 그만큼 내린다.
   손을 떼면 바깥 묶음(opn-u5-sp-hop)이 위로 톡 튀었다가 내려앉는다(CSS). 공의 바닥은 탁자 윗면(top)에 닿아 있다. */
export const SPG = { cx: 560, top: 404, r: 76, squash: 0.36, hit: [440, 140, 240, 272] };
export function spongeBase() {
  const sk = new Sk(W, H, { id: "u5b" });
  ground(sk);
  const { cx, top, r } = SPG;
  const cy = top - r;
  // 탁자: 윗판과 다리 둘
  const board = poly([[300, top], [850, top], [850, top + 18], [300, top + 18]], 6);
  sk.fill(board, C.wood, { dx: 0.6, dy: 0.8, wob: 0.5, seed: 3, tex: true });
  sk.ink(board, { w: 8, wob: 0.6, seed: 4 });
  for (const [x, i] of [[332, 0], [818, 1]]) sk.ink(dense([[x, top + 18], [x, 504]], 6), { w: 11, color: C.woodDark, wob: 0.5, seed: 5 + i });
  // 탁자에 닿은 공의 그림자
  sk.fill(ell(cx, top + 2, 62, 7), "#2A3A5E", { dx: 0, dy: 0, wob: 0.2, seed: 7, alpha: 0.12, tex: false });
  drawFigure(sk, 170, 502, 0.56, pose({ elR: [80, -290], haR: [170, -330] }), { ...TEACHER });
  // 공: 바깥 묶음은 튀어 오를 때, 안쪽 묶음은 눌릴 때 움직인다
  g(sk, "opn-u5-sp-hop", () => g(sk, "opn-u5-sp", () => {
    const b = circ(cx, cy, r, { over: 0.12, seed: 11 });
    sk.fill(b, C.lemon, { dx: 1, dy: 1.2, wob: 0.7, seed: 12, tex: true });
    // 스펀지 구멍: 크기와 자리가 고르지 않은 작은 타원(같은 그림이 매번 같게 정해진 수열로)
    for (let i = 0; i < 15; i++) {
      const a = i * 2.39996, d = r * 0.78 * Math.sqrt((i + 0.6) / 15.6);
      const x = cx + d * Math.cos(a), y = cy + d * Math.sin(a), rx = 5 + ((i * 7) % 5);
      sk.fill(ell(x, y, rx, rx * 0.72), "#E0A92A", { dx: 0, dy: 0, wob: 0.3, seed: 20 + i, tex: false });
    }
    sk.ink(b, { w: 9, wob: 0.8, seed: 13 });
    sk.ink(arc(cx - 6, cy - 8, r * 0.66, -2.6, -1.8), { w: 7, color: "#FFFFFF", wob: 0.3, seed: 14 });
  }));
  // 튀어 오를 때 탁자 위의 짧은 표시
  g(sk, "opn-u5-sp-mark", () => {
    for (const [sg, i] of [[-1, 0], [1, 1]]) sk.ink(curve([[cx + sg * 74, top - 10], [cx + sg * 92, top - 26], [cx + sg * 104, top - 48]]), { w: 6, color: C.orange, wob: 0.3, seed: 41 + i });
  });
  // 누르는 손(앱이 공을 따라 옮긴다)
  g(sk, "opn-u5-hand", () => {
    const py = cy - r - 16;
    sk.ink(dense([[cx, -30], [cx, py - 10]], 5), { w: 13, wob: 0.6, seed: 51 });
    const palm = ell(cx, py, 36, 17);
    sk.fill(palm, C.skin, { dx: 0.8, dy: 1, wob: 0.6, seed: 52 });
    sk.ink(palm, { w: 8, wob: 0.6, seed: 53 });
  });
  return { sk };
}

/* ══════════ 2. 줄다리기 (u5l2) ══════════ */
export const TUG = { cx: 480 };
export function tugBase() {
  const sk = new Sk(W, H, { id: "u5t" });
  ground(sk);
  const s = 0.56, y = 502, ry = 362;
  const lean = (d) => pose({ hip: [-20 * d, -200], neck: [-58 * d, -322], head: [-84 * d, -412], elR: [40 * d, -270], haR: [128 * d, -250], elL: [30 * d, -246], haL: [104 * d, -250], knR: [50 * d, -110], ftR: [96 * d, 0], knL: [-6 * d, -104], ftL: [22 * d, 0] });
  // 가운데 표시
  sk.ink(dense([[TUG.cx, 300], [TUG.cx, 500]], 6), { w: 6, color: C.gray, wob: 0.3, seed: 21, dash: [14, 14] });
  // 줄
  sk.ink(dense([[200 + 128 * s, ry], [760 - 128 * s, ry]], 6), { w: 9, color: C.woodDark, wob: 0.6, seed: 22 });
  drawFigure(sk, 200, y, s, lean(1), { ...STUDENT });
  drawFigure(sk, 760, y, s, lean(-1), { ...TEACHER });
  g(sk, "opn-u5-rib", () => {
    const f = poly([[TUG.cx - 16, ry - 4], [TUG.cx + 16, ry - 4], [TUG.cx + 16, ry + 62], [TUG.cx, ry + 44], [TUG.cx - 16, ry + 62]], 4);
    sk.fill(f, C.red, { dx: 0, dy: 0, wob: 0.5, seed: 23 });
    sk.ink(f, { w: 7, wob: 0.6, seed: 24 });
  });
  // 힘쓰는 표시 세 단계(앱이 차례로 켠다)
  g(sk, "opn-u5-eff e1", () => { drop(sk, 106, 190, 1, { seed: 31 }); drop(sk, 854, 190, 1, { seed: 33 }); });
  g(sk, "opn-u5-eff e2", () => { drop(sk, 72, 250, 1.2, { seed: 35 }); drop(sk, 888, 250, 1.2, { seed: 37 }); });
  g(sk, "opn-u5-eff e3", () => {
    rays(sk, 150, 150, 26, 60, 5, { color: C.orange, w: 8, seed: 41 });
    rays(sk, 810, 150, 26, 60, 5, { color: C.orange, w: 8, seed: 45 });
  });
  return { sk };
}

/* ══════════ 3. 활과 화살 (u5l4) ══════════ */
export const BOW = { tipX: 321, top: 198, bot: 402, midY: 300, len: 150, target: 872 };
export function bowBase() {
  const sk = new Sk(W, H, { id: "u5w" });
  ground(sk);
  // 과녁(옆에서 본 모습)과 받침
  sk.ink(dense([[894, 392], [912, 504]], 5), { w: 8, color: C.woodDark, wob: 0.6, seed: 51 });
  [[26, 96, "#FFFFFF"], [18, 66, C.red], [10, 34, "#FFFFFF"]].forEach(([rx, ry, col], i) => {
    const e = ell(886, 300, rx, ry);
    sk.fill(e, col, { dx: 0, dy: 0, wob: 0.4, seed: 52 + i });
    sk.ink(e, { w: 6, wob: 0.5, seed: 56 + i });
  });
  // 활(나무)과 시위(앱이 polyline의 점을 옮긴다)
  sk.ink(arc(240, 300, 130, -0.9, 0.9), { w: 12, color: C.woodDark, wob: 0.6, seed: 61 });
  sk.raw(`<polyline class="opn-u5-string" points="${BOW.tipX},${BOW.top} ${BOW.tipX},${BOW.midY} ${BOW.tipX},${BOW.bot}" fill="none" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>`);
  g(sk, "opn-u5-arw", () => {
    arrow(sk, [[BOW.tipX, BOW.midY], [BOW.tipX + BOW.len, BOW.midY]], { straight: true, w: 8, color: C.navy, head: 22, seed: 63, wob: 0.2 });
    sk.ink(dense([[BOW.tipX + 4, BOW.midY - 12], [BOW.tipX + 26, BOW.midY]]), { w: 6, color: C.red, wob: 0.2, seed: 65 });
    sk.ink(dense([[BOW.tipX + 4, BOW.midY + 12], [BOW.tipX + 26, BOW.midY]]), { w: 6, color: C.red, wob: 0.2, seed: 66 });
  });
  drawFigure(sk, 196, 502, 0.6, pose({ elR: [150, -330], haR: [290, -337], elL: [120, -300], haL: [196, -337] }), { ...STUDENT });
  return { sk };
}

/* ══════════ 4. 흙길과 빙판길 (u5l5) ══════════ */
export const SLED = { x: 190, dirtY: 236, iceY: 486, dirt: 150, ice: 620 };
function sled(sk, x, y, sd) {
  const b = poly([[x - 44, y - 54], [x + 44, y - 54], [x + 40, y - 14], [x - 40, y - 14]], 4);
  sk.fill(b, C.wood, { dx: 0.6, dy: 0.8, wob: 0.6, seed: sd, tex: true });
  sk.ink(b, { w: 8, wob: 0.8, seed: sd + 1 });
  sk.ink(curve([[x - 52, y - 2], [x + 46, y - 2], [x + 62, y - 14]]), { w: 8, color: C.navy, wob: 0.4, seed: sd + 2 });
  sk.ink(dense([[x - 30, y - 14], [x - 30, y - 2]]), { w: 6, color: C.navy, wob: 0.2, seed: sd + 3 });
  sk.ink(dense([[x + 30, y - 14], [x + 30, y - 2]]), { w: 6, color: C.navy, wob: 0.2, seed: sd + 4 });
}
export function sledBase() {
  const sk = new Sk(W, H, { id: "u5s" });
  // 흙길: 갈색 띠와 자갈
  const dirt = poly([[30, SLED.dirtY], [930, SLED.dirtY], [930, SLED.dirtY + 34], [30, SLED.dirtY + 34]], 8);
  sk.fill(dirt, "#D9B98A", { dx: 0, dy: 0, wob: 1, seed: 71, tex: true });
  sk.ink(dense([[30, SLED.dirtY], [930, SLED.dirtY]], 8), { w: 8, color: C.woodDark, wob: 1.6, seed: 72 });
  for (let i = 0; i < 16; i++) sk.ink(circ(70 + i * 55, SLED.dirtY + 14 + (i % 3) * 5, 5, { seed: 73 + i }), { w: 4, color: C.woodDark, wob: 0.3, seed: 90 + i });
  // 빙판길: 하늘색 띠와 반짝임
  const ice = poly([[30, SLED.iceY], [930, SLED.iceY], [930, SLED.iceY + 34], [30, SLED.iceY + 34]], 8);
  sk.fill(ice, "#CDE8FA", { dx: 0, dy: 0, wob: 0.6, seed: 111 });
  sk.ink(dense([[30, SLED.iceY], [930, SLED.iceY]], 8), { w: 8, color: C.seaDeep, wob: 0.5, seed: 112 });
  [[330, 0], [560, 1], [800, 2]].forEach(([x, i]) => sk.ink(dense([[x, SLED.iceY + 22], [x + 46, SLED.iceY + 12]]), { w: 6, color: "#FFFFFF", wob: 0.3, seed: 113 + i }));
  // 미는 사람(줄마다 한 명)
  const push = pose({ elR: [70, -262], haR: [150, -250], elL: [56, -240], haL: [140, -226], neck: [24, -338], head: [44, -430] });
  drawFigure(sk, 84, SLED.dirtY, 0.34, push, { ...STUDENT });
  drawFigure(sk, 84, SLED.iceY, 0.34, push, { ...STUDENT, seed: 37 });
  g(sk, "opn-u5-sled s-dirt", () => sled(sk, SLED.x, SLED.dirtY, 121));
  g(sk, "opn-u5-sled s-ice", () => sled(sk, SLED.x, SLED.iceY, 131));
  return { sk };
}

/* ══════════ 5. 수조 속 비치볼 (u5l6) ══════════
   공기를 넣은 비치볼은 아주 가벼워 대부분 물 위로 떠 있다(바닥 쪽 4분의 1쯤만 잠김).
   down: 꾹 눌렀을 때 내려가는 거리(공 전체가 물에 잠기게). 물은 공 앞에 반투명하게 덮어 잠긴 부분이 물속처럼 보인다. */
export const FLT = { cx: 490, water: 300, r: 72, down: 150, hit: [370, 100, 240, 280] };
function beachBall(sk, cx, cy, r) {
  const side = (a, t0, t1) => { const out = []; for (let i = 0; i <= 24; i++) { const t = t0 + (t1 - t0) * i / 24; out.push([cx + a * Math.cos(t), cy + r * Math.sin(t)]); } return out; };
  const band = (aOut, aIn, left) => left
    ? [...side(aOut, Math.PI / 2, Math.PI * 1.5), ...side(aIn, Math.PI * 1.5, Math.PI / 2)]
    : [...side(aOut, -Math.PI / 2, Math.PI / 2), ...side(aIn, Math.PI / 2, -Math.PI / 2)];
  const body = circ(cx, cy, r, { over: 0.1, seed: 141 });
  sk.fill(body, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 142 });
  sk.fill(band(r, r * 0.7, true), C.blue, { dx: 0, dy: 0, wob: 0.3, seed: 143 });
  sk.fill(band(r * 0.7, r * 0.3, false), C.yellow, { dx: 0, dy: 0, wob: 0.3, seed: 144 });
  sk.fill(side(r * 0.3, 0, Math.PI * 2), C.red, { dx: 0, dy: 0, wob: 0.3, seed: 145 });
  for (const [a, i] of [[0.7, 0], [0.3, 1]]) { sk.ink(side(r * a, Math.PI / 2, Math.PI * 1.5), { w: 4, wob: 0.2, seed: 146 + i }); sk.ink(side(r * a, -Math.PI / 2, Math.PI / 2), { w: 4, wob: 0.2, seed: 148 + i }); }
  const cap = ell(cx, cy - r + 7, 13, 6);
  sk.fill(cap, C.white, { dx: 0, dy: 0, wob: 0.2, seed: 150 });
  sk.ink(cap, { w: 4, wob: 0.2, seed: 151 });
  sk.ink(body, { w: 9, wob: 0.7, seed: 152 });
  sk.ink(arc(cx - 6, cy - 6, r * 0.7, -2.7, -1.9), { w: 7, color: "#FFFFFF", wob: 0.3, seed: 153 });
}
export function floatBase() {
  const sk = new Sk(W, H, { id: "u5p" });
  ground(sk, 510);
  drawFigure(sk, 170, 506, 0.56, pose({ elR: [80, -290], haR: [170, -330] }), { ...TEACHER });
  const { cx, water, r } = FLT;
  const cy = water + r * 0.5 - r; // 바닥 쪽 4분의 1만 잠긴다
  // 공(앱이 위아래로 옮긴다)
  g(sk, "opn-u5-fb", () => beachBall(sk, cx, cy, r));
  // 물(공 앞에 반투명하게 덮는다)과 수조
  const wat = poly([[306, water], [674, water], [674, 498], [306, 498]], 6);
  sk.fill(wat, C.sea, { dx: 0, dy: 0, wob: 0.6, seed: 161, alpha: 0.62, tex: false });
  sk.ink(dense([[306, water], [674, water]], 6), { w: 7, color: C.seaDeep, wob: 1.4, seed: 162 });
  sk.ink(dense([[300, 170], [300, 504], [680, 504], [680, 170]], 6), { w: 10, wob: 0.8, seed: 163 });
  // 누르는 손(앱이 공을 따라 옮긴다)
  g(sk, "opn-u5-hand", () => {
    const py = cy - r - 14;
    sk.ink(dense([[cx, -30], [cx, py - 10]], 5), { w: 13, wob: 0.6, seed: 171 });
    const palm = ell(cx, py, 34, 16);
    sk.fill(palm, C.skin, { dx: 0.8, dy: 1, wob: 0.6, seed: 172 });
    sk.ink(palm, { w: 8, wob: 0.6, seed: 173 });
  });
  // 솟아오를 때의 물방울
  g(sk, "opn-u5-splash", () => {
    drop(sk, 420, 262, 1.1, { seed: 181 });
    drop(sk, 560, 256, 1.2, { seed: 183 });
    drop(sk, 386, 286, 0.9, { seed: 185 });
    drop(sk, 598, 284, 0.9, { seed: 187 });
  });
  return { sk };
}

/* ══════════ 6. 굴러가다 멈추는 공 (u5l7) ══════════ */
export const ROLL = { x: 262, y: 468, far: 520 };
export function rollBase() {
  const sk = new Sk(W, H, { id: "u5r" });
  // 잔디
  sk.ink(dense([[30, 504], [930, 506]], 8), { w: 9, color: C.green, wob: 1.4, seed: 181 });
  for (let i = 0; i < 22; i++) {
    const x = 60 + i * 40;
    sk.ink(dense([[x, 504], [x - 5, 486]]), { w: 5, color: C.green, wob: 0.3, seed: 182 + i });
    sk.ink(dense([[x + 8, 504], [x + 13, 490]]), { w: 5, color: C.green, wob: 0.3, seed: 210 + i });
  }
  cloud(sk, 640, 110, 200, 70, { seed: 7 });
  // 깃발(공이 닿지 못한 곳)
  sk.ink(dense([[900, 504], [900, 330]], 5), { w: 8, color: C.woodDark, wob: 0.4, seed: 241 });
  const fl = poly([[900, 332], [846, 352], [900, 374]], 4);
  sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.4, seed: 242 });
  sk.ink(fl, { w: 6, wob: 0.5, seed: 243 });
  drawFigure(sk, 150, 502, 0.6, pose({ knR: [70, -90], ftR: [128, -44], elL: [-60, -270], haL: [-96, -220], elR: [50, -270], haR: [84, -214] }), { ...STUDENT });
  g(sk, "opn-u5-ball", () => ball(sk, ROLL.x, ROLL.y, 34));
  return { sk };
}

/** build-intro.mjs가 부른다: 그림을 싣고 장면별 좌표를 돌려준다. */
export function build(add) {
  return {
    sponge: { ...SPG, ...add("spongeBase", spongeBase()) },
    tug: { ...TUG, ...add("tugBase", tugBase()) },
    bow: { ...BOW, ...add("bowBase", bowBase()) },
    sled: { ...SLED, ...add("sledBase", sledBase()) },
    float: { ...FLT, ...add("floatBase", floatBase()) },
    roll: { ...ROLL, ...add("rollBase", rollBase()) },
  };
}
