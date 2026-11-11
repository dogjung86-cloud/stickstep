// 중1 과학 Ⅱ 도입(opener)의 나머지 다섯 장면 그림. build-intro.mjs가 register()를 불러 표에 싣는다.
//   droplens   (u2l3)  물방울 속 글자: 종이(고정) + 물방울(따로 뽑아 앱이 옮긴다). 글자는 앱이 얹는다
//   blockbloom (u2l5)  블록 꽃: 블록 열 개가 저마다 묶음이다. 앱의 CSS가 흩어진 자리, 부품 자리, 꽃 자리로 옮긴다
//   dokdo      (u2l6)  독도: 섬과 바다(고정) + 반짝이는 세 곳 + 누르면 나타나는 생물 셋
//   shelves    (u2l8)  두 상자: 과일 상자와 채소 상자, 친구(고정) + 토마토(따로 뽑아 앱이 옮긴다)
//   beeswitch  (u2l10) 꿀벌 스위치: 식탁의 사과, 딸기, 빵 + 꿀벌(끄면 사라지는 묶음)
// 무대 좌표는 960×544. 글자는 넣지 않는다(앱이 얹는다). 장면마다 물체는 다섯 개 안쪽으로 둔다.
import { Sk, C, curve, dense, circ, poly, rrect, arrow, sparkle } from "../lib/sk.mjs";
import { drawFigure, pose } from "../lib/figure.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn, style = "") => { sk.raw(`<g class="${cls}"${style ? ` style="${style}"` : ""}>`); fn(); sk.raw("</g>"); };

/* ══════════ 1. 물방울 속 글자 (u2l3) ══════════ */
export const DL = {
  y: 236, // 글자 줄의 높이
  x0: 158, // 물방울이 처음 놓인 자리(글자 없는 왼쪽 여백)
  letters: [240, 340, 440, 540, 640, 740], // 글자 여섯 자의 가운데
  minX: 150, maxX: 850, dropW: 200, reach: 74,
};
export function droplensBase() {
  const sk = new Sk(W, H, { id: "dl" });
  const page = rrect(70, 64, 820, 416, 22);
  sk.fill(page, "#FFFBEF", { dx: 1, dy: 1.4, wob: 0.8, seed: 11 });
  sk.ink(page, { w: 10, seed: 12, wob: 1 });
  // 다른 줄의 글(읽을 수 없는 흐린 줄)
  for (const [y, x1, i] of [[128, 820, 0], [344, 820, 1], [404, 620, 2]]) {
    sk.ink(dense([[140, y], [x1, y + 2]], 6), { w: 12, color: "#E4DECB", seed: 21 + i, wob: 1.2, dash: [70, 26] });
  }
  g(sk, "opn-dl-hint", () => arrow(sk, [[150, 330], [220, 338], [300, 330]], { w: 9, color: C.gray, seed: 31, dash: [4, 20], head: 24 }));
  return { sk, meta: {} };
}
export function droplensDrop() {
  const sk = new Sk(DL.dropW, DL.dropW, { id: "dd" });
  const c = circ(100, 100, 80, { over: 0.12, seed: 41, lump: 0.03 });
  sk.fill(c, "#BFE4F8", { dx: 0, dy: 0, wob: 0.5, seed: 42, alpha: 0.3 });
  sk.ink(c, { w: 8, color: C.blue, seed: 43, wob: 0.6 });
  sk.ink(curve([[50, 82], [60, 58], [82, 44]]), { w: 9, color: C.white, seed: 44, wob: 0.3 });
  return { sk, meta: {} };
}

/* ══════════ 2. 블록 꽃 (u2l5) ══════════
   블록마다 꽃 자리(그린 자리), 부품 자리(--px, --py), 흩어진 자리(--sx, --sy, --sr)를 갖는다. */
export const BB = { ground: 424 };
export function blockbloomBase() {
  const sk = new Sk(W, H, { id: "bb2" });
  sk.ink(dense([[60, BB.ground + 4], [900, BB.ground + 6]], 8), { w: 9, color: C.grayLight, seed: 5, wob: 1.2 });
  const PETAL = "#F27A9B", CORE = C.lemon, STEM = "#3FAE5A", LEAF = "#8FD08A";
  // [꽃 자리 x, y, 색, 부품 자리로 가는 dx, dy]
  const blocks = [
    [480, 114, PETAL, -250, 168], [424, 170, PETAL, -250, 168], [480, 170, CORE, -250, 168], [536, 170, PETAL, -250, 168], [480, 226, PETAL, -250, 168],
    [480, 282, STEM, 0, 0], [480, 338, STEM, 0, 0], [480, 394, STEM, 0, 0],
    [424, 366, LEAF, 278, 28], [536, 310, LEAF, 222, 84],
  ];
  const slot = [6, 1, 8, 3, 0, 9, 4, 2, 7, 5], rot = [-14, 10, -6, 18, -10, 8, -16, 12, -8, 6];
  blocks.forEach(([x, y, col, px, py], i) => {
    const sx = 100 + slot[i] * 84 - x, sy = 394 - y;
    g(sk, "opn-bb-b", () => {
      const b = rrect(x - 26, y - 26, 52, 52, 10);
      sk.fill(b, col, { dx: 0.4, dy: 0.6, wob: 0.5, seed: 51 + i, tex: true });
      sk.ink(b, { w: 7, seed: 71 + i, wob: 0.6 });
    }, `--sx:${sx}px;--sy:${sy}px;--sr:${rot[i]}deg;--px:${px}px;--py:${py}px`);
  });
  g(sk, "opn-bb-done", () => {
    sparkle(sk, 640, 120, 30, { seed: 91 }); sparkle(sk, 330, 150, 22, { seed: 93 }); sparkle(sk, 650, 270, 18, { seed: 95 });
  });
  return { sk, meta: {} };
}

/* ══════════ 3. 독도 (u2l6) ══════════ */
export const DK = {
  // 반짝이는 세 곳(가운데 x, y)과 이름표 자리
  spots: [[790, 124], [296, 236], [730, 472]],
};
export function dokdoBase() {
  const sk = new Sk(W, H, { id: "dk" });
  sk.fill(poly([[0, 0], [W, 0], [W, 400], [0, 400]], 8), "#EAF6FD", { dx: 0, dy: 0, wob: 0, seed: 3 });
  const sea = poly([[0, 388], [W, 388], [W, H], [0, H]], 8);
  sk.fill(sea, C.sea, { dx: 0, dy: 0, wob: 0.6, seed: 5 });
  // 섬 둘(큰 섬과 작은 섬)
  const isleA = curve([[130, 392], [176, 300], [236, 186], [300, 142], [362, 196], [416, 300], [452, 392]], false, 5);
  const isleB = curve([[506, 392], [544, 312], [602, 240], [662, 262], [722, 330], [762, 392]], false, 5);
  for (const [isle, sd] of [[isleA, 11], [isleB, 21]]) {
    sk.fill([...isle, isle[0]], "#C2AE93", { dx: 0.8, dy: 1, wob: 0.8, seed: sd, tex: true });
    sk.ink(isle, { w: 10, seed: sd + 1, wob: 1.2 });
  }
  // 섬 꼭대기의 풀밭
  const grassA = curve([[236, 196], [268, 160], [300, 146], [334, 166], [356, 196], [300, 214]], true, 4);
  sk.fill(grassA, "#8DBF6A", { dx: 0, dy: 0, wob: 0.8, seed: 31 });
  const grassB = curve([[582, 262], [606, 244], [650, 258], [668, 278], [620, 288]], true, 4);
  sk.fill(grassB, "#8DBF6A", { dx: 0, dy: 0, wob: 0.8, seed: 33 });
  sk.ink(dense([[0, 390], [W, 392]], 8), { w: 8, color: C.seaDeep, seed: 35, wob: 1.4 });
  for (const [x, y, i] of [[90, 440, 0], [330, 500, 1], [850, 520, 2], [470, 430, 3]]) {
    sk.ink(curve([[x, y], [x + 26, y - 9], [x + 52, y], [x + 78, y - 9]]), { w: 6, color: "#E8F5FC", seed: 41 + i, wob: 0.5 });
  }
  // 생물 셋(처음에는 숨어 있다)
  g(sk, "opn-dk-c c0", () => {
    // 괭이갈매기: 펼친 날개와 흰 몸
    sk.at(DK.spots[0][0], DK.spots[0][1], 1, () => {
      const wingL = curve([[-10, 0], [-50, -42], [-104, -34], [-62, -10], [-22, 14]], true, 3);
      const wingR = curve([[10, 0], [50, -42], [104, -34], [62, -10], [22, 14]], true, 3);
      for (const [wg, sd] of [[wingL, 51], [wingR, 55]]) { sk.fill(wg, "#B8C1CC", { dx: 0, dy: 0, wob: 0.5, seed: sd }); sk.ink(wg, { w: 7, seed: sd + 1, wob: 0.6 }); }
      const body = curve([[-34, 8], [-10, -12], [22, -6], [34, 12], [10, 28], [-18, 26]], true, 3);
      sk.fill(body, C.white, { dx: 0, dy: 0, wob: 0.5, seed: 59 }); sk.ink(body, { w: 7, seed: 60, wob: 0.6 });
      const beak = poly([[-34, 6], [-58, 12], [-34, 18]], 3);
      sk.fill(beak, C.yellow, { dx: 0, dy: 0, wob: 0.3, seed: 61 }); sk.ink(beak, { w: 5, seed: 62, wob: 0.3 });
      sk.dot(-20, 4, 4);
    });
  });
  g(sk, "opn-dk-c c1", () => {
    // 해국: 연보라 꽃잎과 노란 가운데
    sk.at(DK.spots[1][0], DK.spots[1][1], 1, () => {
      sk.ink(curve([[0, 62], [-6, 34], [0, 8]]), { w: 8, color: "#3F8F4A", seed: 71, wob: 0.5 });
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        const p = circ(34 * Math.cos(a), 34 * Math.sin(a) - 6, 15, { over: 0.1, seed: 73 + i });
        sk.fill(p, "#B79BEA", { dx: 0, dy: 0, wob: 0.4, seed: 83 + i }); sk.ink(p, { w: 5, seed: 93 + i, wob: 0.4 });
      }
      const core = circ(0, -6, 17, { over: 0.1, seed: 103 });
      sk.fill(core, C.lemon, { dx: 0, dy: 0, wob: 0.4, seed: 104 }); sk.ink(core, { w: 6, seed: 105, wob: 0.4 });
    });
  });
  g(sk, "opn-dk-c c2", () => {
    // 태평줄새우: 굽은 반투명 몸에 어두운 줄무늬, 긴 더듬이(2025년 조사에서 독도에 처음 확인된 해안무척추동물)
    sk.at(DK.spots[2][0], DK.spots[2][1], 1, () => {
      const fan = poly([[62, 26], [100, 14], [98, 46], [70, 44]], 3);
      sk.fill(fan, "#F2C9B8", { dx: 0, dy: 0, wob: 0.4, seed: 111 }); sk.ink(fan, { w: 6, seed: 112, wob: 0.5 });
      const body = curve([[-74, -6], [-52, -32], [-10, -40], [34, -26], [66, 6], [78, 36], [58, 40], [40, 16], [8, 2], [-30, 4], [-62, 10]], true, 3);
      sk.fill(body, "#FBE3D6", { dx: 0, dy: 0, wob: 0.5, seed: 113 });
      for (const [x0, y0, x1, y1, i] of [[-22, -38, -18, 2, 0], [8, -36, 14, 2, 1], [36, -24, 30, 10, 2], [58, 0, 46, 22, 3]]) sk.ink(dense([[x0, y0], [x1, y1]]), { w: 8, color: "#7A4A3C", seed: 115 + i, wob: 0.5 });
      sk.ink(body, { w: 8, seed: 119, wob: 0.6 });
      for (const [x, i] of [[-34, 0], [-8, 1], [16, 2]]) sk.ink(curve([[x, 4], [x - 6, 22], [x - 14, 30]]), { w: 5, seed: 121 + i, wob: 0.4 });
      sk.ink(curve([[-72, -10], [-104, -34], [-128, -30]]), { w: 5, seed: 125, wob: 0.4 });
      sk.ink(curve([[-72, -4], [-108, -6], [-132, 8]]), { w: 5, seed: 126, wob: 0.4 });
      sk.dot(-56, -14, 5);
    });
  });
  // 반짝이는 곳(찾으면 사라진다)
  DK.spots.forEach(([x, y], i) => g(sk, `opn-dk-spot s${i}`, () => { sparkle(sk, x, y, 34, { seed: 131 + i * 4 }); sparkle(sk, x + 40, y - 30, 15, { seed: 133 + i * 4 }); }));
  return { sk, meta: {} };
}

/* ══════════ 4. 두 상자 (u2l8) ══════════ */
export const SH = {
  fruitX: 216, vegX: 744, top: 236, // 상자의 가운데와 입 높이
  homeX: 480, homeY: 496, landY: 222, // 토마토가 놓인 자리(바닥 가운데), 상자 위에 놓이는 높이
  tomW: 150,
};
function box(sk, cx, top, sd, inside) {
  inside();
  const b = poly([[cx - 136, top], [cx + 136, top], [cx + 122, top + 156], [cx - 122, top + 156]], 5);
  sk.fill(b, C.wood, { dx: 0.8, dy: 1, wob: 0.8, seed: sd, tex: true, texAng: 0.02 });
  sk.ink(b, { w: 10, seed: sd + 1, wob: 1 });
  const tag = rrect(cx - 78, top + 46, 156, 64, 14);
  sk.fill(tag, "#FFF9EC", { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd + 2 });
  sk.ink(tag, { w: 7, seed: sd + 3, wob: 0.6 });
}
export function shelvesBase() {
  const sk = new Sk(W, H, { id: "sh" });
  const { fruitX, vegX, top, homeX, homeY } = SH;
  sk.ink(dense([[40, top + 162], [920, top + 164]], 8), { w: 9, color: C.grayLight, seed: 5, wob: 1.2 });
  // 친구(가운데 뒤)
  drawFigure(sk, homeX, top + 160, 0.5, pose({ elL: [-52, -270], haL: [-88, -240], elR: [52, -270], haR: [88, -240] }), { hair: "bob", hairColor: "#5B463A", seed: 191 });
  g(sk, "opn-sh-box opn-sh-fruit", () => box(sk, fruitX, top, 21, () => {
    for (const [dx, dy, i] of [[-74, -18, 0], [74, -18, 1], [0, -34, 2]]) {
      const a = circ(fruitX + dx, top + dy, 46, { over: 0.12, seed: 31 + i });
      sk.fill(a, "#E0503A", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 35 + i, tex: true }); sk.ink(a, { w: 8, seed: 39 + i, wob: 0.7 });
      sk.ink(curve([[fruitX + dx, top + dy - 42], [fruitX + dx + 6, top + dy - 58]]), { w: 6, color: "#7A5230", seed: 43 + i, wob: 0.3 });
    }
  }));
  g(sk, "opn-sh-box opn-sh-veg", () => box(sk, vegX, top, 51, () => {
    for (const [dx, i] of [[-72, 0], [0, 1], [72, 2]]) {
      const x = vegX + dx;
      for (const lx of [-16, 0, 16]) sk.ink(curve([[x, top - 62], [x + lx * 0.6, top - 86], [x + lx, top - 104]]), { w: 7, color: "#3FAE5A", seed: 61 + i * 3 + lx, wob: 0.4 });
      const cr = curve([[x - 28, top - 62], [x + 28, top - 62], [x + 16, top - 8], [x, top + 30], [x - 16, top - 8]], true, 3);
      sk.fill(cr, C.orange, { dx: 0.6, dy: 0.8, wob: 0.5, seed: 71 + i, tex: true }); sk.ink(cr, { w: 8, seed: 75 + i, wob: 0.6 });
    }
  }));
  // 바닥의 받침과 손짓(처음에만)
  const mat = curve([[homeX - 110, homeY + 2], [homeX, homeY + 22], [homeX + 110, homeY + 2], [homeX, homeY - 12]], true, 5);
  sk.fill(mat, C.woodLight, { dx: 0.8, dy: 1, wob: 0.6, seed: 81 }); sk.ink(mat, { w: 8, seed: 82, wob: 0.8 });
  g(sk, "opn-sh-hint", () => {
    arrow(sk, [[homeX - 100, homeY - 60], [homeX - 190, homeY - 84], [homeX - 250, homeY - 70]], { w: 9, color: C.gray, seed: 91, dash: [4, 20], head: 24 });
    arrow(sk, [[homeX + 100, homeY - 60], [homeX + 190, homeY - 84], [homeX + 250, homeY - 70]], { w: 9, color: C.gray, seed: 95, dash: [4, 20], head: 24 });
  });
  return { sk, meta: {} };
}
export function shelvesTomato() {
  const sk = new Sk(SH.tomW, SH.tomW, { id: "st" });
  const b = curve([[75, 30], [112, 36], [136, 70], [130, 110], [100, 138], [75, 141], [50, 138], [20, 110], [14, 70], [38, 36]], true, 3);
  sk.fill(b, "#E5483A", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 101, tex: true });
  sk.ink(b, { w: 9, seed: 102, wob: 0.8 });
  for (const [dx, dy, i] of [[-26, -4, 0], [26, -4, 1], [-14, 12, 2], [14, 12, 3], [0, -18, 4]]) {
    sk.ink(curve([[75, 34], [75 + dx * 0.5, 34 + dy * 0.4 + 2], [75 + dx, 36 + dy]]), { w: 8, color: "#3F8F4A", seed: 105 + i, wob: 0.3 });
  }
  sk.ink(curve([[40, 78], [46, 62], [58, 54]]), { w: 7, color: "#F7B0A6", seed: 111, wob: 0.3 });
  return { sk, meta: {} };
}

/* ══════════ 5. 꿀벌 스위치 (u2l10) ══════════ */
export const BS = {
  table: 404, // 식탁 윗면의 높이
  items: { apple: 210, berry: 480, bread: 750 }, // 음식 세 가지의 가운데 x
};
function apple(sk, x, y, r, sd) {
  const a = circ(x, y, r, { over: 0.12, seed: sd });
  sk.fill(a, "#E0503A", { dx: 0.6, dy: 0.8, wob: 0.6, seed: sd + 1, tex: true }); sk.ink(a, { w: 8, seed: sd + 2, wob: 0.7 });
  sk.ink(curve([[x, y - r + 6], [x + 6, y - r - 12]]), { w: 6, color: "#7A5230", seed: sd + 3, wob: 0.3 });
  const leaf = curve([[x + 6, y - r - 8], [x + 26, y - r - 20], [x + 34, y - r - 6], [x + 16, y - r]], true, 3);
  sk.fill(leaf, "#3FAE5A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 }); sk.ink(leaf, { w: 5, seed: sd + 5, wob: 0.3 });
}
function berry(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const b = curve([[0, 0], [-30, -30], [-36, -62], [-14, -80], [14, -80], [36, -62], [30, -30]], true, 3);
    sk.fill(b, "#EE4B5A", { dx: 0.5, dy: 0.7, wob: 0.5, seed: sd, tex: true }); sk.ink(b, { w: 8, seed: sd + 1, wob: 0.6 });
    for (const [dx, dy] of [[-14, -54], [12, -58], [0, -36], [-16, -34], [16, -36], [0, -16]]) sk.dot(dx, dy, 3, "#FFE9A8");
    const cap = curve([[-26, -76], [-10, -92], [0, -82], [10, -92], [26, -76], [0, -70]], true, 3);
    sk.fill(cap, "#3FAE5A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 }); sk.ink(cap, { w: 5, seed: sd + 3, wob: 0.3 });
  });
}
export function beeswitchBase() {
  const sk = new Sk(W, H, { id: "bs" });
  const { table } = BS;
  const { apple: ax, berry: bx, bread: lx } = BS.items;
  const top = rrect(50, table, 860, 84, 16);
  sk.fill(top, C.woodLight, { dx: 0.8, dy: 1, wob: 0.8, seed: 11, tex: true, texAng: 0.02 });
  sk.ink(top, { w: 10, seed: 12, wob: 1 });
  // 꿀벌이 사라지면 함께 줄어드는 것(먼저 그려 뒤에 놓는다)
  g(sk, "opn-bs-gone", () => { apple(sk, ax - 72, table - 44, 44, 21); apple(sk, ax + 74, table - 44, 44, 31); });
  apple(sk, ax, table - 52, 52, 41);
  g(sk, "opn-bs-gone", () => { berry(sk, bx - 66, table, 0.86, 51); berry(sk, bx + 66, table, 0.86, 61); });
  berry(sk, bx, table, 1.05, 71);
  // 빵
  sk.at(lx, table, 1.9, () => {
    const body = curve([[-36, 0], [-38, -18], [-26, -34], [0, -38], [26, -34], [38, -18], [36, 0]], false, 3);
    const pts = [...body, body[0]];
    sk.fill(pts, "#E3A553", { dx: 0.4, dy: 0.5, wob: 0.4, seed: 81, tex: true });
    sk.ink(pts, { w: 5, seed: 82, wob: 0.4 });
    for (const dx of [-14, 2, 18]) sk.ink(curve([[dx - 5, -30], [dx, -22], [dx + 3, -13]]), { w: 3, color: "#B5742A", seed: 83 + dx, wob: 0.2 });
  });
  // 꿀벌(위쪽 가운데)과 날아온 길
  g(sk, "opn-bs-bee", () => {
    sk.ink(curve([[250, 96], [310, 150], [370, 110], [420, 132]]), { w: 6, color: C.gray, seed: 91, wob: 0.4, dash: [4, 16] });
    sk.at(486, 132, 1, () => {
      for (const [wx, i] of [[-8, 0], [22, 1]]) {
        const wg = curve([[wx, -22], [wx - 16, -62], [wx + 12, -78], [wx + 30, -50], [wx + 14, -22]], true, 3);
        sk.fill(wg, "#DDF0FB", { dx: 0, dy: 0, wob: 0.4, seed: 93 + i }); sk.ink(wg, { w: 6, color: C.blue, seed: 95 + i, wob: 0.4 });
      }
      const body = curve([[-52, 0], [-30, -30], [14, -34], [52, -12], [56, 8], [22, 30], [-30, 28]], true, 3);
      sk.fill(body, C.yellow, { dx: 0, dy: 0, wob: 0.5, seed: 97 });
      for (const [x, i] of [[-10, 0], [22, 1]]) sk.ink(curve([[x, -30], [x + 8, 0], [x, 28]]), { w: 13, color: "#3A3A40", seed: 99 + i, wob: 0.4 });
      sk.ink(body, { w: 8, seed: 101, wob: 0.6 });
      sk.dot(-34, -6, 5);
    });
  });
  return { sk, meta: {} };
}

/** build-intro.mjs가 부른다: 그림을 표에 싣고 좌표를 meta에 넣는다. */
export function register(add, meta) {
  meta.droplens = { ...DL, ...add("droplensBase", droplensBase()), ...add("droplensDrop", droplensDrop()) };
  meta.blockbloom = { ...BB, ...add("blockbloomBase", blockbloomBase()) };
  meta.dokdo = { ...DK, ...add("dokdoBase", dokdoBase()) };
  meta.shelves = { ...SH, ...add("shelvesBase", shelvesBase()), ...add("shelvesTomato", shelvesTomato()) };
  meta.beeswitch = { ...BS, ...add("beeswitchBase", beeswitchBase()) };
}
