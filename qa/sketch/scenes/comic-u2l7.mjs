// 중1 과학 u2l7 도입 만화: 다윈의 이상한 섬들(변이, 환경에 적합한 쪽이 살아남는다). 8컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u2v3l7.md.
//   1 측량선 비글호에 오르다 → 2 갈라파고스에서 표본 모으기 → 3 섬마다 다른 거북(로슨의 말, 흘려들음)
//   → 4 귀국 뒤 굴드의 분류 → 5 왜 섬마다 다를까 → 6 한 무리 안의 작은 차이(변이) → 7 1859년의 책
//   → 8 그랜트 부부가 지켜본 가뭄
// extras(): 거북 문제(mcq)가 쓰는 두 섬 그림(인물 없음). 왼쪽 (가) = 키 큰 선인장, 오른쪽 (나) = 낮은 풀.
import { Sk, C, curve, dense, circ, ell, poly, rrect, lerp, mix, emark, qmark, check, sparkle, drop, squiggle } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, DARWIN, DARWIN_OLD, LAWSON, GOULD, GRANT_A, GRANT_B } from "../lib/figure.mjs";
import { sea, cloud, sun, desk } from "../lib/props.mjs";

const W = 960, H = 720;
const BIRD = "#8E6E53", SHELL = "#A8845A", TSKIN = "#9BA383", ROCK = "#5E5A58";

/* ---------- 소품 ---------- */
// 옆모습 새: 몸통은 모두 같고 부리만 다르다. 원점 = 발밑, 오른쪽을 본다. beak 0(가늘고 뾰족) ~ 1(굵고 짧음)
function finch(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 301, col = o.color ?? BIRD, k = o.beak ?? 0.5, dark = mix(col, "#000000", 0.28);
  sk.at(x, y, s, () => {
    if (o.legs !== false) { sk.ink(dense([[-8, -32], [-10, 0]]), { w: 6, seed: sd, wob: 0.3 }); sk.ink(dense([[14, -32], [16, 0]]), { w: 6, seed: sd + 1, wob: 0.3 }); }
    const tail = poly([[-52, -66], [-108, -44], [-100, -68], [-56, -84]], 3);
    sk.fill(tail, dark, { dx: 0, dy: 0, wob: 0.5, seed: sd + 2 }); sk.ink(tail, { w: 7, seed: sd + 3, wob: 0.6 });
    const body = curve([[-62, -68], [-40, -98], [10, -108], [50, -94], [62, -64], [38, -36], [-10, -28], [-46, -42]], true, 4);
    sk.fill(body, col, { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 4, tex: 0.8 }); sk.ink(body, { w: 8, seed: sd + 5, wob: 0.8 });
    const head = circ(52, -112, 33, { over: 0.12, seed: sd + 6 });
    sk.fill(head, col, { dx: 0.8, dy: 1, wob: 0.6, seed: sd + 7 }); sk.ink(head, { w: 8, seed: sd + 8, wob: 0.6 });
    sk.ink(curve([[-38, -72], [-6, -54], [28, -68]]), { w: 5, color: dark, seed: sd + 9, wob: 0.4 });
    const bh = lerp(8, 27, k), bl = lerp(44, 32, k);
    const beak = poly([[80, -112 - bh], [80 + bl, -108], [80, -112 + bh * 0.75]], 3);
    sk.fill(beak, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: sd + 10 }); sk.ink(beak, { w: 6, seed: sd + 11, wob: 0.4 });
    sk.dot(58, -120, 5.5);
  }, o.rot ?? 0, o.flip ?? 1);
}
// 새끼 새(작은 노란 덩이)
function chick(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const b = circ(0, -26, 26, { over: 0.15, seed: sd });
    sk.fill(b, "#F6DC7A", { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 }); sk.ink(b, { w: 7, seed: sd + 2, wob: 0.5 });
    const bk = poly([[22, -32], [40, -26], [22, -20]], 2);
    sk.fill(bk, C.orange, { dx: 0, dy: 0, wob: 0.2, seed: sd + 3 }); sk.ink(bk, { w: 5, seed: sd + 4, wob: 0.3 });
    sk.dot(8, -32, 4.5);
  });
}
// 거북 옆모습. 원점 = 발밑 가운데, 오른쪽을 본다. kind: "saddle"(앞이 들린 등딱지 + 긴 목) | "dome"(둥근 등딱지 + 짧은 목)
function tortoise(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 331, saddle = o.kind === "saddle", lh = saddle ? 78 : 50;
  sk.at(x, y, s, () => {
    const tube = (pts, w) => { sk.ink(pts, { w: w + 17, wob: 0.8, seed: sd }); sk.ink(pts, { w, color: TSKIN, wob: 0.8, seed: sd }); };
    // 꼬리, 목, 머리
    const tl = poly([[-112, -lh - 10], [-142, -lh + 4], [-112, -lh + 8]], 3);
    sk.fill(tl, TSKIN, { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 }); sk.ink(tl, { w: 7, seed: sd + 2, wob: 0.5 });
    const neck = saddle ? curve([[84, -lh - 50], [118, -lh - 110], [132, -lh - 180], [144, -lh - 226]]) : curve([[92, -lh - 30], [126, -lh - 36], [150, -lh - 40]]);
    tube(neck, 30);
    const [hx, hy] = saddle ? [156, -lh - 246] : [172, -lh - 44];
    const head = ell(hx, hy, 36, 27);
    sk.fill(head, TSKIN, { dx: 0.8, dy: 1, wob: 0.6, seed: sd + 3 }); sk.ink(head, { w: 8, seed: sd + 4, wob: 0.6 });
    sk.dot(hx + 12, hy - 7, 5);
    sk.ink(curve([[hx + 12, hy + 10], [hx + 24, hy + 9], [hx + 33, hy + 4]]), { w: 4, seed: sd + 5, wob: 0.2 });
    // 다리
    for (const [lx, i] of [[-70, 0], [60, 1]]) { const p = rrect(lx - 22, -lh - 10, 44, lh + 10, 14); sk.fill(p, TSKIN, { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 6 + i }); sk.ink(p, { w: 8, seed: sd + 8 + i, wob: 0.6 }); }
    // 등딱지
    const top = saddle
      ? curve([[-122, -lh + 4], [-118, -lh - 62], [-72, -lh - 108], [0, -lh - 120], [58, -lh - 124], [102, -lh - 148], [126, -lh - 150], [112, -lh - 98], [114, -lh + 4]], false, 4)
      : curve([[-122, -lh + 4], [-114, -lh - 74], [-62, -lh - 128], [0, -lh - 142], [62, -lh - 128], [114, -lh - 74], [122, -lh + 4]], false, 4);
    const shell = [...top, top[0]];
    sk.fill(shell, SHELL, { dx: 1.5, dy: 2, wob: 1, seed: sd + 10, tex: true, texAng: 0.5 });
    const dk = mix(SHELL, "#000000", 0.3);
    sk.ink(curve([[-110, -lh - 16], [0, -lh - 26], [108, -lh - 16]]), { w: 6, color: dk, seed: sd + 11, wob: 0.5 });
    for (const [a, b, i] of [[[-58, -lh - 22], [-44, -lh - (saddle ? 104 : 122)], 0], [[2, -lh - 26], [4, -lh - (saddle ? 116 : 138)], 1], [[58, -lh - 22], [52, -lh - (saddle ? 118 : 124)], 2]]) sk.ink(dense([a, b]), { w: 5, color: dk, seed: sd + 12 + i, wob: 0.5 });
    sk.ink(shell, { w: 10, seed: sd + 15, wob: 1 });
  }, 0, o.flip ?? 1);
}
// 키 큰 선인장(나무처럼 자라는 부채선인장). 원점 = 밑동
function cactus(sk, x, y, h, sd = 361) {
  const trunk = dense([[x, y], [x + 4, y - h * 0.6]]);
  sk.ink(trunk, { w: 40, seed: sd, wob: 0.8 }); sk.ink(trunk, { w: 25, color: "#B5814C", seed: sd, wob: 0.8 });
  const G = "#72B25E";
  for (const [dx, dy, rx, ry, rot, i] of [[-58, -0.62, 40, 58, -0.6, 0], [60, -0.64, 40, 58, 0.6, 1], [-22, -0.8, 42, 62, -0.15, 2], [44, -0.86, 36, 52, 0.4, 3], [-74, -0.88, 30, 42, -0.5, 4]]) {
    sk.at(x + dx, y + dy * h, 1, () => {
      const pad = ell(0, 0, rx, ry);
      sk.fill(pad, G, { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 2 + i, tex: 0.8 }); sk.ink(pad, { w: 9, seed: sd + 8 + i, wob: 0.8 });
      for (const [px, py] of [[-12, -18], [12, -4], [-6, 16]]) sk.dot(px, py, 3.2, "#3F7D3A");
    }, rot);
  }
}
function grass(sk, x, y, n, sd = 381, h = 44) {
  for (let i = 0; i < n; i++) { const gx = x + i * 15, lean = ((i * 37 + sd) % 5 - 2) * 5; sk.ink(curve([[gx, y], [gx + lean * 0.5, y - h * 0.6], [gx + lean, y - h - (i % 3) * 8]]), { w: 7, color: i % 2 ? "#4E9A46" : "#6BB55A", seed: sd + i, wob: 0.4 }); }
}
// 돛대 셋 달린 작은 범선. 원점 = 물에 닿는 배 가운데
function beagle(sk, x, y, s, sd = 401) {
  sk.at(x, y, s, () => {
    for (const [mx, mh, i] of [[-112, 250, 0], [0, 300, 1], [112, 236, 2]]) {
      sk.ink(dense([[mx, -44], [mx, -52 - mh]]), { w: 9, seed: sd + i });
      for (const [sy, sw, sh, j] of [[-44 - mh, 96, mh * 0.4, 0], [-44 - mh * 0.54, 122, mh * 0.42, 1]]) {
        const sail = curve([[mx - sw / 2, sy], [mx + sw / 2, sy], [mx + sw / 2 + 9, sy + sh / 2], [mx + sw / 2, sy + sh], [mx - sw / 2, sy + sh], [mx - sw / 2 + 9, sy + sh / 2]], true, 4);
        sk.fill(sail, C.sail, { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 4 + i * 2 + j, tex: 0.7, texAng: 1.3 }); sk.ink(sail, { w: 7, seed: sd + 12 + i * 2 + j, wob: 0.8 });
      }
    }
    sk.ink(dense([[196, -70], [270, -100]]), { w: 8, seed: sd + 20 });
    const hull = [...dense([[-206, -72], [206, -72]], 5), ...curve([[206, -72], [190, -22], [150, 8], [-150, 8], [-192, -22], [-206, -72]], false, 4)];
    sk.fill(hull, C.wood, { seed: sd + 21, tex: true, texAng: 0.03 });
    sk.ink(curve([[-194, -42], [0, -36], [194, -42]]), { w: 6, color: C.woodDark, seed: sd + 22 });
    sk.ink(hull, { w: 10, seed: sd + 23 });
  });
}
// 굵은 씨앗 무더기
function seeds(sk, list, sd = 421, col = "#6B4A32") {
  list.forEach(([x, y, r], i) => { const c = circ(x, y, r, { over: 0.15, seed: sd + i, lump: 0.08 }); sk.fill(c, col, { dx: 0, dy: 0, wob: 0.5, seed: sd + 20 + i }); sk.ink(c, { w: 6, seed: sd + 40 + i, wob: 0.5 }); sk.ink(curve([[x - r * 0.45, y - r * 0.2], [x - r * 0.2, y - r * 0.5], [x + r * 0.15, y - r * 0.5]]), { w: 3.5, color: "#C9A27A", seed: sd + 60 + i, wob: 0.2 }); });
}
// 두 섬의 거북(문제 그림과 3컷이 함께 쓴다). 원점 = 섬 땅의 가운데
function islandA(sk, x, y, s) { // 키 큰 선인장 + 목 긴 거북
  sk.at(x, y, s, () => {
    sk.ink(curve([[-190, 6], [-60, -4], [80, 0], [200, 8]]), { w: 9, seed: 441 });
    cactus(sk, 122, 0, 400, 361);
    tortoise(sk, -52, 0, 0.84, { kind: "saddle", seed: 331 });
  });
}
function islandB(sk, x, y, s) { // 낮은 풀 + 목 짧은 거북
  sk.at(x, y, s, () => {
    sk.ink(curve([[-200, 8], [-70, -2], [70, 0], [200, 6]]), { w: 9, seed: 443 });
    grass(sk, -196, 2, 5, 381, 40);
    tortoise(sk, -40, 0, 0.84, { kind: "dome", seed: 341 });
    grass(sk, 110, 4, 6, 383, 46);
  });
}
const satchel = sk => () => { sk.ink(dense([[-24, -330], [36, -226]]), { w: 8, color: "#6B4A32", seed: 451, wob: 0.6 }); const bag = rrect(12, -238, 58, 52, 12); sk.fill(bag, "#C49A5E", { seed: 452, dx: 1, dy: 1.2 }); sk.ink(bag, { w: 8, seed: 453, wob: 0.7 }); };

/* ---------- 1. 1831년, 영국: 청년 다윈, 배에 오르다 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  cloud(sk, 820, 96, 170, 64, { seed: 3 });
  sea(sk, -10, 970, 600, 730, { seed: 25 });
  beagle(sk, 660, 616, 0.96);
  // 부두
  for (const [x, i] of [[70, 0], [230, 1], [360, 2]]) { const post = poly([[x - 15, 584], [x + 15, 584], [x + 12, 730], [x - 12, 730]], 4); sk.fill(post, C.woodDark, { seed: 31 + i, tex: true, texAng: 1.5 }); sk.ink(post, { w: 9, seed: 34 + i }); }
  const dock = poly([[-12, 548], [398, 548], [398, 590], [-12, 590]], 5);
  sk.fill(dock, C.wood, { seed: 37, tex: true, texAng: 0.02 }); sk.ink(dock, { w: 10, seed: 38 });
  for (const x of [96, 196, 296]) sk.ink(dense([[x, 552], [x, 586]]), { w: 5, color: C.woodDark, seed: 39 + x, wob: 0.3 });
  // 다윈: 상자를 들고 배 쪽으로 걷는다
  const walk = pose({ knL: [-32, -104], ftL: [-74, 0], knR: [36, -110], ftR: [66, 0], elR: [66, -262], haR: [112, -232], elL: [-48, -256], haL: [-66, -190], tilt: 0.05 });
  const fx = 176, fy = 548, fs = 0.62;
  drawFigure(sk, fx, fy, fs, walk, { ...DARWIN, name: "darwin", hands: "L", under: satchel(sk) });
  const hx = fx + fs * 112, hy = fy - fs * 232;
  const box = poly([[hx - 4, hy - 30], [hx + 84, hy - 34], [hx + 86, hy + 30], [hx - 2, hy + 32]], 4);
  sk.fill(box, C.woodLight ?? "#D9B07A", { seed: 44, tex: true, texAng: 0.04 }); sk.ink(box, { w: 8, seed: 45 });
  sk.ink(dense([[hx - 2, hy], [hx + 85, hy - 2]]), { w: 5, color: C.woodDark, seed: 46, wob: 0.3 });
  handDot(sk, [hx, hy + 6], C.skin, 47, 10);
  return sk;
}

/* ---------- 2. 1835년, 갈라파고스: 화산섬에서 표본 모으기 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  // 먼 섬들(하나는 연기)
  for (const [x0, x1, h, i] of [[470, 650, 86, 0], [640, 800, 130, 1], [810, 960, 70, 2]]) {
    const m = curve([[x0, 392], [lerp(x0, x1, 0.3), 392 - h * 0.8], [lerp(x0, x1, 0.5), 392 - h], [lerp(x0, x1, 0.72), 392 - h * 0.7], [x1, 392]], false, 4);
    sk.fill([...m, m[0]], ROCK, { seed: 51 + i, tex: true, texAng: 0.6 }); sk.ink(m, { w: 9, seed: 54 + i });
  }
  sk.ink(curve([[722, 258], [712, 226], [734, 200], [718, 168], [740, 138]]), { w: 9, color: C.gray, seed: 57, wob: 1 });
  sea(sk, -10, 970, 388, 730, { seed: 58, waves: 6 });
  beagle(sk, 560, 470, 0.3, 601);
  // 앞쪽 바위 해안
  const shore = [...curve([[-12, 566], [140, 548], [330, 560], [520, 588], [640, 640], [700, 730]], false, 5), [-12, 730]];
  shore.push(shore[0]);
  sk.fill(shore, ROCK, { seed: 59, tex: true, texAng: 0.3 }); sk.ink(shore.slice(0, -2), { w: 11, seed: 60 });
  // 다윈과 잠자리채
  const P = pose({ elR: [84, -300], haR: [120, -356], elL: [-52, -260], haL: [-30, -214], tilt: -0.04 });
  const fx = 196, fy = 584, fs = 0.64;
  const hx = fx + fs * 120, hy = fy - fs * 356;
  sk.ink(dense([[hx - 30, hy + 70], [hx + 96, hy - 116]]), { w: 9, color: C.woodDark, seed: 61, wob: 0.6 });
  const NX = hx + 128, NY = hy - 158;
  const hoop = ell(NX, NY, 44, 52);
  sk.fill(hoop, C.white, { dx: 0, dy: 0, wob: 0.5, seed: 62, alpha: 0.7 }); sk.ink(hoop, { w: 8, seed: 63 });
  for (const k of [-0.5, 0, 0.5]) sk.ink(curve([[NX + k * 60, NY - 40], [NX + k * 40, NY], [NX + k * 60, NY + 40]]), { w: 3, color: C.gray, seed: 64 + k * 10, wob: 0.2 });
  drawFigure(sk, fx, fy, fs, P, { ...DARWIN, name: "darwin", under: satchel(sk) });
  // 가득 찬 표본 상자
  const bx = 420, by = 604;
  for (const [dx, col, i] of [[-48, "#72B25E", 0], [0, "#E9D9B0", 1], [46, "#C96A4A", 2]]) { const it = circ(bx + dx, by - 74, 24, { over: 0.15, seed: 66 + i, lump: 0.1 }); sk.fill(it, col, { dx: 0, dy: 0, wob: 0.6, seed: 69 + i }); sk.ink(it, { w: 7, seed: 72 + i, wob: 0.6 }); }
  const box = poly([[bx - 84, by - 66], [bx + 84, by - 66], [bx + 78, by], [bx - 78, by]], 4);
  sk.fill(box, "#D9B07A", { seed: 75, tex: true, texAng: 0.04 }); sk.ink(box, { w: 9, seed: 76 });
  sk.ink(dense([[bx - 81, by - 34], [bx + 81, by - 34]]), { w: 6, color: C.woodDark, seed: 77, wob: 0.4 });
  return sk;
}

/* ---------- 3. 섬마다 다른 거북: 등딱지만 봐도 안다고? ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  // 두 섬 사이의 바다
  sk.ink(curve([[606, 668], [624, 660], [642, 668], [660, 660], [678, 668]]), { w: 8, color: C.blue, seed: 81, wob: 0.4 });
  sk.ink(curve([[614, 694], [632, 686], [650, 694], [668, 686]]), { w: 7, color: C.blue, seed: 82, wob: 0.4 });
  islandA(sk, 440, 654, 0.8);
  islandB(sk, 800, 654, 0.8);
  // 다윈은 손에 든 돌을 들여다보느라 흘려듣는다
  const busy = pose({ elL: [-70, -300], haL: [-104, -372], elR: [50, -262], haR: [22, -222], tilt: -0.16 });
  const dx = 76, dy = 704, ds = 0.46;
  drawFigure(sk, dx, dy, ds, busy, { ...DARWIN, name: "darwin", hands: "R", under: satchel(sk) });
  const rx = dx - ds * 104, ry = dy - ds * 372;
  const rock = circ(rx - 4, ry - 22, 22, { over: 0.15, seed: 83, lump: 0.12 });
  sk.fill(rock, ROCK, { dx: 0, dy: 0, wob: 0.6, seed: 84 }); sk.ink(rock, { w: 7, seed: 85, wob: 0.6 });
  handDot(sk, [rx, ry], C.skin, 86, 9);
  // 로슨: 거북을 가리킨다
  const point = pose({ elR: [84, -312], haR: [160, -330], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  drawFigure(sk, 200, 704, 0.46, point, { ...LAWSON, name: "lawson" });
  return sk;
}

/* ---------- 4. 1837년, 런던: 새 전문가의 놀라운 말 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  desk(sk, 286, 540, 412, { seed: 91 });
  // 부리만 다른 새 넷(표본 받침 위)
  [[1, 0], [0.68, 1], [0.34, 2], [0, 3]].forEach(([k, i]) => {
    const x = 346 + i * 100;
    const st = rrect(x - 30, 524, 60, 16, 6);
    sk.fill(st, "#E9E6DF", { dx: 0, dy: 0, wob: 0.3, seed: 93 + i }); sk.ink(st, { w: 6, seed: 97 + i, wob: 0.4 });
    finch(sk, x - 6, 524, 0.46, { beak: k, seed: 301 + i * 13, color: i % 2 ? "#6E5A4A" : BIRD });
  });
  const point = pose({ elR: [86, -300], haR: [150, -292], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  drawFigure(sk, 150, 704, 0.72, point, { ...GOULD, name: "gould" });
  const wow = pose({ elL: [-104, -362], haL: [-158, -448], elR: [104, -362], haR: [158, -448], tilt: 0.04 });
  drawFigure(sk, 812, 704, 0.72, wow, { ...DARWIN, name: "darwin" });
  emark(sk, 640, 250, 0.9, { color: C.red, rot: -0.12 });
  return sk;
}

/* ---------- 5. 질문: 왜 섬마다 다를까? ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  // 섬과 새를 그려 둔 종이
  const paper = poly([[430, 150], [912, 138], [922, 566], [440, 580]], 5);
  sk.fill(paper, "#FBF6E6", { seed: 101, dx: 1.5, dy: 2 }); sk.ink(paper, { w: 10, seed: 102 });
  [[540, 300, 1, 0], [800, 268, 0.5, 1], [680, 474, 0, 2]].forEach(([x, y, k, i]) => {
    const isl = curve([[x - 84, y + 30], [x - 60, y - 6], [x - 10, y - 24], [x + 50, y - 12], [x + 86, y + 22], [x + 40, y + 46], [x - 40, y + 48]], true, 4);
    sk.fill(isl, "#C9B48A", { dx: 0, dy: 0, wob: 0.8, seed: 103 + i, tex: 0.7 }); sk.ink(isl, { w: 7, seed: 106 + i, wob: 0.8 });
    sk.ink(curve([[x - 104, y + 56], [x - 84, y + 50], [x - 64, y + 56]]), { w: 5, color: C.blue, seed: 109 + i, wob: 0.3 });
    sk.ink(curve([[x + 60, y + 58], [x + 80, y + 52], [x + 100, y + 58]]), { w: 5, color: C.blue, seed: 112 + i, wob: 0.3 });
    finch(sk, x - 8, y + 10, 0.52, { beak: k, seed: 311 + i * 13 });
  });
  qmark(sk, 668, 330, 0.72, { color: C.teal, seed: 115 });
  // 다윈: 턱에 손을 대고 생각한다
  const think = pose({ elR: [70, -300], haR: [44, -356], elL: [-50, -262], haL: [-16, -226], tilt: 0.12 });
  drawFigure(sk, 196, 704, 0.8, think, { ...DARWIN, name: "darwin", under: satchel(sk) });
  return sk;
}

/* ---------- 6. 생각: 같은 무리 안의 작은 차이 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 486;
  sk.ink(curve([[20, GY + 4], [300, GY - 2], [660, GY + 2], [940, GY - 2]]), { w: 9, seed: 121 });
  const ks = [0.06, 0.3, 0.52, 0.78, 1];
  ks.forEach((k, i) => finch(sk, 96 + i * 184, GY, 0.82, { beak: k, seed: 321 + i * 13 }));
  // 크고 단단한 씨앗
  seeds(sk, [[150, 560, 24], [286, 610, 28], [420, 556, 23], [548, 620, 27], [668, 566, 25], [800, 612, 28], [888, 552, 22], [60, 640, 22], [716, 664, 20]], 421);
  // 굵은 부리 둘은 잘 먹고 새끼를 남긴다
  for (const i of [3, 4]) {
    const x = 96 + i * 184 + 10;
    check(sk, x - 6, 304, 0.9);
    chick(sk, x - 44, 262, 0.72, 131 + i * 5); chick(sk, x + 28, 262, 0.72, 141 + i * 5);
  }
  // 가는 부리는 씨앗을 못 깬다
  drop(sk, 190, 326, 1.2); drop(sk, 366, 336, 1.1);
  return sk;
}

/* ---------- 7. 1859년: 20년 넘게 다듬은 생각 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  desk(sk, 500, 548, 420, { seed: 151 });
  // 종이 더미와 수첩
  for (let i = 0; i < 9; i++) { const y = 540 - i * 17; const sh = poly([[560 + (i % 3) * 5, y - 14], [712 - (i % 2) * 6, y - 15], [714 - (i % 2) * 6, y], [558 + (i % 3) * 5, y + 1]], 3); sk.fill(sh, i % 3 === 1 ? "#EDE8DC" : C.white, { dx: 0, dy: 0, wob: 0.4, seed: 153 + i }); sk.ink(sh, { w: 6, seed: 163 + i, wob: 0.5 }); }
  for (let i = 0; i < 4; i++) { const y = 540 - i * 20; const nb = poly([[760, y - 17], [884, y - 18], [886, y], [758, y + 1]], 3); sk.fill(nb, ["#B5814C", "#6E8FA8", "#C96A4A", "#B5814C"][i], { dx: 0, dy: 0, wob: 0.4, seed: 173 + i }); sk.ink(nb, { w: 6, seed: 177 + i, wob: 0.5 }); }
  // 나이 든 다윈: 두꺼운 책을 들어 올린다
  const up = pose({ elR: [96, -340], haR: [150, -428], elL: [-52, -262], haL: [-22, -222], tilt: -0.04 });
  const fx = 210, fy = 704, fs = 0.8;
  drawFigure(sk, fx, fy, fs, up, { ...DARWIN_OLD, name: "darwin", hands: "L" });
  const hx = fx + fs * 150, hy = fy - fs * 428;
  sk.at(hx + 44, hy - 46, 1, () => {
    const pages = poly([[-50, -58], [58, -58], [58, 62], [-50, 62]], 4);
    sk.fill(pages, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 181 }); sk.ink(pages, { w: 7, seed: 182 });
    const cover = poly([[-62, -64], [46, -64], [46, 56], [-62, 56]], 4);
    sk.fill(cover, "#3F7D4E", { seed: 183, tex: true, dx: 1, dy: 1.4 }); sk.ink(cover, { w: 9, seed: 184 });
    sk.ink(dense([[-40, -64], [-40, 56]]), { w: 5, color: "#2A5A36", seed: 185, wob: 0.3 });
    finch(sk, 0, 22, 0.34, { beak: 0.8, seed: 186, color: C.gold, legs: false });
  }, 0.12);
  handDot(sk, [hx, hy], C.skin, 187, 12);
  sparkle(sk, hx + 132, hy - 120, 15, { seed: 188 });
  sparkle(sk, hx - 30, hy - 132, 10, { seed: 189 });
  return sk;
}

/* ---------- 8. 1977년, 갈라파고스: 눈앞에서 지켜본 변화 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  sun(sk, 128, 124, 56, { seed: 701 });
  // 마른 땅과 단단한 씨앗
  sk.ink(curve([[10, 706], [300, 700], [640, 706], [950, 700]]), { w: 9, seed: 191 });
  for (const [x, i] of [[90, 0], [468, 1], [560, 2], [880, 3]]) sk.ink(dense([[x, 704], [x + 14, 680], [x + 4, 664]], 3), { w: 5, color: "#B5814C", seed: 192 + i, wob: 0.4 });
  seeds(sk, [[440, 684, 17], [500, 690, 15], [596, 686, 18], [70, 688, 15]], 431);
  // 한 사람은 새를 손에 얹고, 다른 사람은 부리를 잰다
  const hold = pose({ elR: [84, -288], haR: [140, -300], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  const ax = 250, ay = 702, as = 0.72;
  drawFigure(sk, ax, ay, as, hold, { ...GRANT_A, name: "grantA" });
  const bx0 = ax + as * 140, by0 = ay - as * 300;
  finch(sk, bx0 + 44, by0 - 12, 0.56, { beak: 1, seed: 351, legs: false });
  const meas = pose({ elL: [-86, -296], haL: [-150, -318], elR: [50, -260], haR: [24, -218], tilt: -0.05 });
  const gx = 700, gy = 702;
  drawFigure(sk, gx, gy, as, meas, { ...GRANT_B, name: "grantB", hands: "R" });
  const mx = gx - as * 150, my = gy - as * 318;
  // 부리에 댄 자(캘리퍼스)
  sk.ink(dense([[mx + 6, my - 4], [mx - 96, my - 26]]), { w: 9, color: "#8A9099", seed: 195, wob: 0.3 });
  sk.ink(dense([[mx - 96, my - 26], [mx - 90, my - 58]]), { w: 7, color: "#8A9099", seed: 196, wob: 0.3 });
  sk.ink(dense([[mx - 56, my - 18], [mx - 50, my - 48]]), { w: 7, color: "#8A9099", seed: 197, wob: 0.3 });
  handDot(sk, [mx, my], C.skin, 198, 11);
  drop(sk, 420, 262, 1.1); drop(sk, 880, 330, 1.1);
  return sk;
}

const BUBBLES = [
  [{ who: "darwin", text: "드디어<br>출발이다!" }],
  [{ who: "darwin", text: "상자가<br>꽉 찼네!" }],
  [{ who: "lawson", text: "등딱지만<br>봐도 알지!" }],
  [{ who: "gould", text: "모두 핀치<br>무리요!" }],
  [{ who: "darwin", text: "어떻게<br>달라졌지?" }],
  null,
  [{ who: "darwin", text: "드디어<br>책으로!" }],
  [{ who: "grantB", text: "부리 큰 새가<br>살아남았어!" }],
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7, p8].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}

// 거북 문제 그림: 섬 (가) 키 큰 선인장, 섬 (나) 낮은 풀. 3컷과 같은 거북을 인물 없이 한 섬씩 따로 그린다.
export function extras() {
  const a = new Sk(480, 420, { id: "xa" }); islandA(a, 226, 392, 0.88);
  const b = new Sk(480, 420, { id: "xb" }); islandB(b, 232, 392, 0.88);
  return [{ name: "island-a", sk: a }, { name: "island-b", sk: b }];
}
