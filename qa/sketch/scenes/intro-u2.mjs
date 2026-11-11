// 중1 과학 Ⅱ 도입 샘플 세 장면의 그림(손그림 코드 그림). 만화와 같은 엔진, 같은 인물을 쓴다.
// 만화와 다른 점: 그림을 겹(레이어)으로 나눠 뽑고, 움직일 부분을 <g class="...">로 묶는다.
// 앱은 이 SVG를 문서에 직접 넣고(src/ui/introArt.generated.ts) CSS와 코드로 그 묶음을 움직인다.
//   longcell  (u2l4) 가장 긴 세포: 아이(고정) + 옆으로 긴 띠(세포와 줄자)
//   baskets   (u2l9) 두 바구니: 바구니 둘(고정) + 버섯(끌 수 있는 묶음)
//   factory   (u2l2) 빵 공장: 건물(고정) + 문, 통제실, 발전기, 빵 줄(상태에 따라 바뀌는 묶음)
// 무대의 좌표계는 960×544(앱에서는 폭 346px 안팎으로 줄어든다). 글자는 넣지 않는다(앱이 얹는다).
// 선 굵기는 만화와 같은 눈대중이 되게 맞췄다(만화 컷 960 폭 = 화면 350px, 이 무대도 960 폭 = 346px).
import { Sk, C, curve, dense, circ, ell, poly, rrect, pathD, mix, qmark, xmark, arrow, sparkle } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";

export const STAGE_W = 960, STAGE_H = 544;

// 신경세포의 색은 랩(cellFitLab)의 그림과 같다
const NERVE = "#F6B26B", NERVE_EDGE = "#B86A1E", NUC = "#7048E8";
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const r1 = (v) => Math.round(v * 10) / 10;

/* ══════════ 1. 가장 긴 세포 (u2l4) ══════════
   아이 겹: 왼쪽 기둥(0~330)에 선 아이. 허리의 세포 몸에서 다리를 따라 발끝까지 주황 선이 자란다(앱이 길이를 정한다).
   띠 겹: 오른쪽 아래 창(330~960 × 344~544)에 비치는 긴 그림. 1 cm = 26. 세포 몸의 오른쪽 끝이 0 cm. */
export const LC = {
  kidX: 165, kidY: 520, kidS: 0.9,
  bandX: 330, bandY: 344, bandW: 630, bandH: 200, // 무대 안에서 띠가 비치는 창
  cm: 26, zeroX: 504, bodyX: 470, fiberY: 76, // 띠 좌표
  worldW: 3300, veil: 110, // 창의 오른쪽 끝 110은 가려 둔다
};

export function longcellKid() {
  const sk = new Sk(STAGE_W, STAGE_H, { id: "lk" });
  const { kidX: x, kidY: y, kidS: s } = LC;
  // 바닥
  sk.ink(dense([[34, y + 6], [318, y + 8]]), { w: 9, seed: 5, color: C.grayLight, wob: 1.2 });
  const p = pose({ elL: [-44, -262], haL: [-64, -192], elR: [50, -268], haR: [84, -214] });
  drawFigure(sk, x, y, s, p, { ...STUDENT });
  // 다리를 따라 자라는 주황 선(세포). 다리 선과 같은 곡선 위에 얹는다.
  const P = (q) => [x + q[0] * s, y + q[1] * s];
  const back = P([0, -236]);
  const leg = [back, P(p.hip), ...curve([p.hip, p.knR, p.ftR], false, 6).map(P)];
  const d = pathD(leg, false, 0.4);
  sk.raw(`<path class="opn-lc-trace" d="${d}" pathLength="100" stroke="${NERVE}" stroke-width="7"/>`);
  // 허리의 세포 몸
  g(sk, "opn-lc-seed", () => {
    sk.raw(`<circle class="opn-lc-ring" cx="${r1(back[0])}" cy="${r1(back[1])}" r="26" stroke="${NERVE}" stroke-width="5"/>`);
    const b = circ(back[0], back[1], 15, { over: 0.2, seed: 61 });
    sk.fill(b, NERVE, { dx: 0, dy: 0, wob: 0.5, seed: 62 });
    sk.ink(b, { w: 6, color: NERVE_EDGE, wob: 0.6, seed: 63 });
    sk.dot(back[0] + 1, back[1], 5, NUC);
  });
  // 끝점(앱이 선 위로 옮긴다)
  sk.raw(`<circle class="opn-lc-tip" cx="${r1(back[0])}" cy="${r1(back[1])}" r="9" fill="#FFE066" stroke="${NERVE_EDGE}" stroke-width="4"/>`);
  // 발끝에 닿았을 때의 반짝임
  const ft = P(p.ftR);
  g(sk, "opn-lc-arrive", () => {
    for (const [a, i] of [[-0.9, 0], [-0.25, 1], [0.4, 2]]) {
      sk.ink(dense([[ft[0] + 24 * Math.cos(a), ft[1] - 6 + 24 * Math.sin(a)], [ft[0] + 46 * Math.cos(a), ft[1] - 6 + 46 * Math.sin(a)]]), { w: 6, color: C.orange, seed: 71 + i, wob: 0.4 });
    }
  });
  // 허리의 세포를 오른쪽 아래에 크게 꺼내 보인다는 점선(밀기 시작하면 사라진다)
  g(sk, "opn-lc-link", () => {
    arrow(sk, [[352, 318], [480, 324], [618, 338], [716, 376]], { w: 7, color: NERVE_EDGE, seed: 81, dash: [4, 20], head: 26, alpha: 0.85 });
  });
  // 아이 머리 옆의 물음표(예측하기 전)
  g(sk, "opn-lc-q", () => qmark(sk, 322, 62, 0.72, { color: C.teal, w: 13, seed: 77 }));
  return { sk, meta: { back, foot: ft } };
}

export function longcellWorld() {
  const { cm, zeroX, bodyX, fiberY, worldW } = LC;
  const sk = new Sk(worldW, LC.bandH, { id: "lw" });
  const endX = zeroX + 100 * cm;
  // 밀라는 손짓(처음 화면의 빈 자리)
  g(sk, "opn-lc-hint", () => {
    arrow(sk, [[392, 158], [250, 154], [112, 158]], { w: 10, color: C.gray, seed: 91, head: 30 });
  });
  // 줄자: 노란 띠와 눈금
  const tape = poly([[zeroX - 14, 120], [endX + 60, 120], [endX + 60, 192], [zeroX - 14, 192]], 12);
  sk.fill(tape, "#FFE27A", { dx: 0, dy: 0, wob: 0.8, seed: 11 });
  sk.ink(dense([[zeroX - 14, 120], [endX + 60, 120]], 12), { w: 7, seed: 12, wob: 1.2, color: "#8A6A1E" });
  sk.ink(dense([[zeroX - 14, 192], [endX + 60, 192]], 12), { w: 7, seed: 13, wob: 1.2, color: "#8A6A1E" });
  sk.ink(dense([[zeroX - 14, 120], [zeroX - 14, 192]], 6), { w: 7, seed: 14, wob: 0.6, color: "#8A6A1E" });
  sk.ink(dense([[endX + 60, 120], [endX + 60, 192]], 6), { w: 7, seed: 15, wob: 0.6, color: "#8A6A1E" });
  let ticks = "";
  for (let c = 0; c <= 100; c++) {
    const x = zeroX + c * cm, len = c % 10 === 0 ? 30 : c % 5 === 0 ? 21 : 12;
    ticks += `M${r1(x)} 122v${len}`;
  }
  sk.raw(`<path d="${ticks}" stroke="#8A6A1E" stroke-width="3.2" stroke-linecap="butt"/>`);
  // 눈금 숫자(자의 숫자는 그림의 일부라 여기서 넣는다. 글꼴은 앱의 것을 물려받는다)
  let nums = "";
  for (let c = 0; c <= 100; c += 10) nums += `<text x="${r1(zeroX + c * cm + (c === 0 ? 6 : 0))}" y="185">${c}</text>`;
  sk.raw(`<g class="opn-lc-num" fill="#5C4A10" stroke="none" font-size="36" font-weight="800" text-anchor="middle">${nums}</g>`);
  // 세포: 가지 돌기 → 긴 줄(바깥 선 + 속) → 몸 → 핵
  for (const [a, len, i] of [[2.2, 44, 0], [2.9, 52, 1], [3.6, 46, 2], [4.4, 38, 3], [1.5, 36, 4]]) {
    const ex = bodyX + (30 + len) * Math.cos(a), ey = fiberY + (30 + len) * Math.sin(a) * 0.8;
    const mx = bodyX + (30 + len * 0.5) * Math.cos(a + 0.12), my = fiberY + (30 + len * 0.5) * Math.sin(a + 0.12) * 0.8;
    sk.ink(curve([[bodyX + 22 * Math.cos(a), fiberY + 22 * Math.sin(a) * 0.8], [mx, my], [ex, ey]]), { w: 9, color: NERVE_EDGE, seed: 21 + i, wob: 0.6 });
    sk.ink(curve([[bodyX + 22 * Math.cos(a), fiberY + 22 * Math.sin(a) * 0.8], [mx, my], [ex, ey]]), { w: 4, color: NERVE, seed: 21 + i, wob: 0.6 });
  }
  const fiber = [];
  for (let x = bodyX + 26; x <= endX; x += 13) fiber.push([x, fiberY + 5 * Math.sin((x - bodyX) / 120)]);
  fiber.push([endX, fiberY + 5 * Math.sin((endX - bodyX) / 120)]);
  sk.ink(fiber, { w: 8, color: NERVE_EDGE, seed: 31, wob: 1.2, freq: 1 / 200 });
  sk.ink(fiber, { w: 3, color: NERVE, seed: 31, wob: 1.2, freq: 1 / 200 });
  // 끝: 짧은 가지 셋과 동그란 끝
  const ey = fiber[fiber.length - 1][1];
  for (const [dy, i] of [[-26, 0], [0, 1], [26, 2]]) {
    const tip = [endX + 52, ey + dy];
    sk.ink(curve([[endX - 2, ey], [endX + 22, ey + dy * 0.5], tip]), { w: 9, color: NERVE_EDGE, seed: 41 + i, wob: 0.5 });
    sk.ink(curve([[endX - 2, ey], [endX + 22, ey + dy * 0.5], tip]), { w: 4, color: NERVE, seed: 41 + i, wob: 0.5 });
    const k = circ(tip[0], tip[1], 8, { over: 0.2, seed: 45 + i });
    sk.fill(k, NERVE, { dx: 0, dy: 0, wob: 0.3, seed: 48 + i }); sk.ink(k, { w: 4, color: NERVE_EDGE, wob: 0.3, seed: 51 + i });
  }
  const body = curve([[bodyX - 34, fiberY - 4], [bodyX - 18, fiberY - 30], [bodyX + 12, fiberY - 32], [bodyX + 34, fiberY - 8], [bodyX + 30, fiberY + 20], [bodyX + 2, fiberY + 34], [bodyX - 26, fiberY + 24]], true, 4);
  sk.fill(body, NERVE, { dx: 0.5, dy: 0.8, wob: 0.8, seed: 55 });
  sk.ink(body, { w: 8, color: NERVE_EDGE, wob: 0.8, seed: 56 });
  const nuc = circ(bodyX - 2, fiberY - 2, 11, { over: 0.2, seed: 57 });
  sk.fill(nuc, NUC, { dx: 0, dy: 0, wob: 0.3, seed: 58 }); sk.ink(nuc, { w: 4, color: "#4A2FB0", wob: 0.3, seed: 59 });
  // 돋보기 테: 세포의 몸은 크게 키워 본 모습이라는 표시(손잡이는 왼쪽 아래로)
  sk.ink(circ(bodyX - 6, fiberY, 66, { over: 0.12, seed: 65 }), { w: 8, color: "#5A6B7F", seed: 66, wob: 0.8 });
  sk.ink(dense([[bodyX - 54, fiberY + 46], [bodyX - 92, fiberY + 92]]), { w: 13, color: "#5A6B7F", seed: 67, wob: 0.6 });
  return { sk, meta: { endX } };
}

/* ══════════ 2. 두 바구니 (u2l9) ══════════
   바탕 겹: 식물 바구니(소나무가 담겨 있다)와 동물 바구니(박새가 담겨 있다). 돌려보냈다는 가위표는 묶음으로 따로.
   버섯 겹: 끌 수 있는 버섯 하나(제 좌표계 200×220, 바닥 가운데가 기준). 앱이 무대 위에 얹어 옮긴다. */
export const BK = {
  h: 860, // 이 장면의 무대는 아래로 길다(960×860): 위는 두 바구니, 아래는 버섯이 놓인 쟁반
  plantX: 236, animalX: 724, top: 306, // 바구니 입 가운데
  homeX: 480, homeY: 792, // 버섯이 놓이는 자리(쟁반 위, 바닥 가운데)
  mushW: 200, mushH: 220, mushScale: 1, // 버섯 그림의 크기와 무대에서의 배율
  dropL: 400, dropR: 560, dropY: 560, // 이 선보다 위에서, 왼쪽에 놓으면 식물, 오른쪽이면 동물
  capY: 22, // 돌려보냈다는 이름표가 뜨는 높이
};
const WICK = "#DDB678", WICK_D = "#8A5A2B";

function basket(sk, cx, top, sd, inner) {
  const rx = 138, ry = 27, h = 176, bot = 100;
  const mouth = ell(cx, top, rx, ry);
  sk.fill(mouth, WICK_D, { dx: 0, dy: 0, wob: 0.6, seed: sd });
  sk.ink(ell(cx, top, rx, ry, Math.PI, Math.PI * 2), { w: 9, seed: sd + 1, wob: 0.8 });
  inner();
  const front = [];
  for (let i = 0; i <= 24; i++) { const a = Math.PI - (Math.PI * i) / 24; front.push([cx + rx * Math.cos(a), top + ry * Math.sin(a)]); }
  const body = [...front, ...curve([[cx + rx, top], [cx + rx - 14, top + h * 0.55], [cx + bot, top + h]], false, 5), ...dense([[cx + bot, top + h], [cx - bot, top + h]], 5), ...curve([[cx - bot, top + h], [cx - rx + 14, top + h * 0.55], [cx - rx, top]], false, 5)];
  sk.fill(body, WICK, { dx: 1, dy: 1.4, wob: 1, seed: sd + 2, tex: true, texAng: 0.05 });
  // 엮은 결: 가로줄 셋과 세로 살
  for (const [f, i] of [[0.3, 0], [0.56, 1], [0.82, 2]]) {
    const y = top + h * f, half = rx - (rx - bot) * f - 6;
    sk.ink(curve([[cx - half, y - 4], [cx - half * 0.5, y + 12], [cx, y + 16], [cx + half * 0.5, y + 12], [cx + half, y - 4]]), { w: 5, color: "#B78A4C", seed: sd + 5 + i, wob: 0.8 });
  }
  for (const [f, i] of [[-0.62, 0], [-0.3, 1], [0.3, 2], [0.62, 3]]) {
    sk.ink(dense([[cx + rx * f, top + 26 - Math.abs(f) * 6], [cx + bot * f, top + h - 6]]), { w: 4.5, color: "#B78A4C", seed: sd + 9 + i, wob: 0.8 });
  }
  sk.ink(body, { w: 10, seed: sd + 3, wob: 1 });
  // 이름표 자리(글자는 앱이 얹는다)
  const tag = rrect(cx - 74, top + 62, 148, 66, 14);
  sk.fill(tag, "#FFF9EC", { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd + 14 });
  sk.ink(tag, { w: 7, seed: sd + 15, wob: 0.6 });
}
function pine(sk, x, base, s, sd) {
  sk.at(x, base, s, () => {
    sk.ink(dense([[0, 0], [0, -70]]), { w: 12, color: "#7A5230", seed: sd, wob: 0.6 });
    for (const [y, w, hh, i] of [[-40, 78, 74, 0], [-88, 62, 66, 1], [-132, 44, 58, 2]]) {
      const tri = poly([[-w, y], [0, y - hh], [w, y]], 4);
      sk.fill(tri, "#4FB36A", { dx: 0.8, dy: 1, wob: 0.9, seed: sd + 2 + i, tex: true });
      sk.ink(tri, { w: 9, seed: sd + 6 + i, wob: 0.9 });
    }
  });
}
function tit(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const body = curve([[-52, 6], [-44, -40], [0, -62], [44, -46], [58, 0], [40, 40], [-6, 52], [-42, 38]], true, 4);
    sk.fill(body, "#F4D95A", { dx: 0.8, dy: 1, wob: 0.8, seed: sd, tex: true });
    const wing = curve([[-6, -8], [34, -18], [60, 14], [40, 36], [6, 28]], true, 3);
    sk.fill(wing, "#8FA3B8", { dx: 0.5, dy: 0.7, wob: 0.6, seed: sd + 1 });
    sk.ink(wing, { w: 7, seed: sd + 2, wob: 0.6 });
    sk.ink(body, { w: 9, seed: sd + 3, wob: 0.8 });
    // 머리: 검은 모자와 흰 뺨
    const head = circ(-34, -58, 38, { over: 0.15, seed: sd + 4 });
    sk.fill(head, "#2E2E33", { dx: 0, dy: 0, wob: 0.6, seed: sd + 5 });
    const cheek = curve([[-52, -62], [-30, -70], [-10, -54], [-22, -36], [-46, -40]], true, 3);
    sk.fill(cheek, C.white, { dx: 0, dy: 0, wob: 0.4, seed: sd + 6 });
    sk.ink(head, { w: 9, seed: sd + 7, wob: 0.7 });
    sk.dot(-50, -72, 4.2, C.white);
    const beak = poly([[-70, -62], [-96, -52], [-70, -46]], 3);
    sk.fill(beak, "#3A3A40", { dx: 0, dy: 0, wob: 0.3, seed: sd + 8 });
    sk.ink(beak, { w: 6, seed: sd + 9, wob: 0.4 });
  });
}

export function basketsBase() {
  const sk = new Sk(STAGE_W, BK.h, { id: "bb" });
  const { plantX, animalX, top, homeX, homeY } = BK;
  sk.ink(dense([[36, top + 190], [924, top + 192]]), { w: 9, seed: 5, color: C.grayLight, wob: 1.4 });
  g(sk, "opn-bk-basket opn-bk-plant", () => {
    basket(sk, plantX, top, 110, () => { pine(sk, plantX - 36, top + 34, 1.05, 131); pine(sk, plantX + 62, top + 40, 0.72, 151); });
  });
  g(sk, "opn-bk-basket opn-bk-animal", () => {
    basket(sk, animalX, top, 210, () => tit(sk, animalX + 8, top - 30, 1.0, 231));
  });
  // 쟁반: 버섯이 놓인 자리
  const tray = curve([[homeX - 190, homeY - 8], [homeX - 150, homeY + 34], [homeX, homeY + 44], [homeX + 150, homeY + 34], [homeX + 190, homeY - 8], [homeX + 120, homeY - 22], [homeX, homeY - 26], [homeX - 120, homeY - 22]], true, 5);
  sk.fill(tray, C.woodLight, { dx: 1, dy: 1.4, wob: 0.8, seed: 321, tex: true, texAng: 0.03 });
  sk.ink(tray, { w: 10, seed: 322, wob: 1 });
  sk.ink(curve([[homeX - 130, homeY + 6], [homeX, homeY + 16], [homeX + 130, homeY + 6]]), { w: 5, color: C.wood, seed: 323, wob: 0.6 });
  // 끌어 올리라는 손짓(처음에만)
  g(sk, "opn-bk-hint", () => {
    arrow(sk, [[homeX - 120, homeY - 150], [homeX - 190, homeY - 226], [homeX - 232, homeY - 286]], { w: 9, color: C.gray, seed: 331, dash: [4, 22], head: 26 });
    arrow(sk, [[homeX + 120, homeY - 150], [homeX + 190, homeY - 226], [homeX + 232, homeY - 286]], { w: 9, color: C.gray, seed: 341, dash: [4, 22], head: 26 });
  });
  // 두 바구니가 모두 돌려보낸 뒤 버섯 옆에 뜨는 물음표
  g(sk, "opn-bk-q", () => qmark(sk, homeX + 150, homeY - 196, 0.9, { color: C.teal, w: 13, seed: 351 }));
  return { sk, meta: {} };
}

export function basketsMush() {
  const sk = new Sk(BK.mushW, BK.mushH, { id: "bm" });
  sk.at(100, 212, 1, () => {
    const stem = curve([[-26, 0], [-22, -60], [-18, -96], [18, -96], [22, -60], [26, 0], [0, 6]], true, 4);
    sk.fill(stem, "#F7EBD3", { dx: 0.8, dy: 1, wob: 0.8, seed: 401 });
    sk.ink(stem, { w: 10, seed: 402, wob: 0.8 });
    const cap = curve([[-92, -92], [-84, -140], [-44, -184], [0, -196], [44, -184], [84, -140], [92, -92], [46, -82], [0, -80], [-46, -82]], true, 4);
    sk.fill(cap, "#E0503A", { dx: 1, dy: 1.4, wob: 1, seed: 403, tex: true });
    for (const [x, y, r, i] of [[-44, -128, 15, 0], [8, -158, 13, 1], [48, -122, 12, 2], [-8, -110, 9, 3]]) {
      const sp = circ(x, y, r, { over: 0.1, seed: 410 + i });
      sk.fill(sp, "#FFF4E6", { dx: 0, dy: 0, wob: 0.4, seed: 420 + i });
    }
    sk.ink(cap, { w: 11, seed: 404, wob: 1 });
  });
  return { sk, meta: {} };
}

/* ══════════ 3. 빵 공장 (u2l2) ══════════ 그림이 길어 파일을 나눴다 */
export { FC, factoryBase } from "./intro-u2-factory.mjs";
