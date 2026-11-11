// 중1 과학 u2l7 도입 만화(v2, 배선 전): 다윈의 이상한 섬들(변이, 환경에 알맞은 쪽이 더 많이 살아남는다). 7컷.
// 조사와 콘티는 qa/sketch/research/v2/u2l7.md (출처: 다윈 「비글호 항해기」 1845년판 원문, 다윈 서한 프로젝트, 그랜트 부부의 대프니메이저섬 연구).
//   1 거북 등에 오른 다윈(1835) → 2 로슨의 거북 이야기를 흘려듣다 → 3 굴드: 모두 핀치였다(1837)
//   → 4 수첩의 나뭇가지 그림(1837) → 5 「종의 기원」(1859, 이때는 턱수염이 없다) → 6 그랜트 부부가 잰 부리(같은 종류 안의 차이 = 변이)
//   → 7 1977년 가뭄: 부리 큰 새가 더 많이 살아남아 새끼를 남겼다
// extras(): 거북 문제(mcq)가 쓰는 두 섬 그림(인물 없음). 왼쪽 (가) = 키 큰 선인장 + 목 긴 거북, 오른쪽 (나) = 낮은 풀 + 목 짧은 거북.
//   옛 장면(scenes/comic-u2l7.mjs)과 같은 그림, 같은 이름(island-a, island-b)이다.
// 그림 속에는 글자와 숫자를 넣지 않는다. 때와 곳은 when 으로 앱이 상자를 얹는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, lerp, mix, emark, qmark, check, sparkle, drop } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, DARWIN, LAWSON, GOULD, GRANT_A, GRANT_B } from "../../lib/figure.mjs";
import { sea, cloud, sun, desk, notebook, quill } from "../../lib/props.mjs";

const W = 960, H = 720;
const BIRD = "#8E6E53", SHELL = "#A8845A", TSKIN = "#9BA383", ROCK = "#5E5A58";

/* ---------- 인물 ---------- */
// 1859년의 다윈: 정수리는 벗어지고 옆머리와 구레나룻만 있다(유명한 흰 턱수염은 1862년부터 길렀다)
const DARWIN_1859 = { hair: "bald", coat: { color: "#3F3F48", buttons: C.gold, seam: "#2A2A30" }, seed: 141, mini: true, face: "smile" };
// 1970년대의 그랜트 부부: 마흔 즈음이라 머리가 아직 짙다(옛 설정의 회색 머리는 요즘 모습)
const PETER = { ...GRANT_A, hairColor: "#6B5040" };
const ROSEMARY = { ...GRANT_B, hairColor: "#A07A50" };
// 옆머리와 구레나룻(머리 둘레 양옆). 인물을 그린 뒤 같은 좌표로 덧그린다
function sideHair(sk, fx, fy, s, p, col, sd = 151) {
  sk.at(fx + s * p.head[0], fy + s * p.head[1], s, () => {
    for (const sg of [-1, 1]) {
      const h = curve([[-82, -60], [-104, -30], [-108, 10], [-100, 48], [-82, 82], [-62, 96], [-60, 70], [-74, 36], [-80, 0], [-76, -40]].map(([x, y]) => [sg * x, y]), true, 4);
      sk.fill(h, col, { dx: 1, dy: 1.2, wob: 0.8, seed: sd + (sg > 0 ? 1 : 0), tex: true });
      sk.ink(h, { w: 9, wob: 0.8, seed: sd + 2 + (sg > 0 ? 1 : 0) });
    }
  }, p.tilt ?? 0);
}

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
// 새끼 새(작은 노란 덩이). big 이면 부리가 굵다
function chick(sk, x, y, s, sd, big = false) {
  sk.at(x, y, s, () => {
    const b = circ(0, -26, 26, { over: 0.15, seed: sd });
    sk.fill(b, "#F6DC7A", { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 }); sk.ink(b, { w: 7, seed: sd + 2, wob: 0.5 });
    const bk = big ? poly([[20, -40], [42, -28], [20, -16]], 2) : poly([[22, -32], [40, -26], [22, -20]], 2);
    sk.fill(bk, C.orange, { dx: 0, dy: 0, wob: 0.2, seed: sd + 3 }); sk.ink(bk, { w: 5, seed: sd + 4, wob: 0.3 });
    sk.dot(8, -32, 4.5);
  });
}
// 거북 옆모습. 원점 = 발밑 가운데, 오른쪽을 본다. kind: "saddle"(앞이 들린 등딱지 + 긴 목) | "dome"(둥근 등딱지 + 짧은 목)
function tortoise(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 331, saddle = o.kind === "saddle", lh = saddle ? 78 : 50;
  sk.at(x, y, s, () => {
    const tube = (pts, w) => { sk.ink(pts, { w: w + 17, wob: 0.8, seed: sd }); sk.ink(pts, { w, color: TSKIN, wob: 0.8, seed: sd }); };
    const tl = poly([[-112, -lh - 10], [-142, -lh + 4], [-112, -lh + 8]], 3);
    sk.fill(tl, TSKIN, { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 }); sk.ink(tl, { w: 7, seed: sd + 2, wob: 0.5 });
    const neck = saddle ? curve([[84, -lh - 50], [118, -lh - 110], [132, -lh - 180], [144, -lh - 226]]) : curve([[92, -lh - 30], [126, -lh - 36], [150, -lh - 40]]);
    tube(neck, 30);
    const [hx, hy] = saddle ? [156, -lh - 246] : [172, -lh - 44];
    const head = ell(hx, hy, 36, 27);
    sk.fill(head, TSKIN, { dx: 0.8, dy: 1, wob: 0.6, seed: sd + 3 }); sk.ink(head, { w: 8, seed: sd + 4, wob: 0.6 });
    sk.dot(hx + 12, hy - 7, 5);
    sk.ink(curve([[hx + 12, hy + 10], [hx + 24, hy + 9], [hx + 33, hy + 4]]), { w: 4, seed: sd + 5, wob: 0.2 });
    for (const [lx, i] of [[-70, 0], [60, 1]]) { const p = rrect(lx - 22, -lh - 10, 44, lh + 10, 14); sk.fill(p, TSKIN, { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 6 + i }); sk.ink(p, { w: 8, seed: sd + 8 + i, wob: 0.6 }); }
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
// 크고 단단한 씨앗(가시 돋친 열매). 원점 = 가운데. split 이면 반으로 쪼개진 두 조각(속살이 보인다)
function hardSeed(sk, x, y, r, sd = 421, split = false) {
  const spikes = (cx, cy, from, n) => { for (let i = 0; i < n; i++) { const a = from + i * Math.PI * 2 / 5; sk.ink(dense([[cx + r * 0.9 * Math.cos(a), cy + r * 0.9 * Math.sin(a)], [cx + r * 1.45 * Math.cos(a), cy + r * 1.45 * Math.sin(a)]]), { w: 5, seed: sd + 3 + i, wob: 0.2 }); } };
  if (!split) {
    const c = circ(x, y, r, { over: 0.15, seed: sd, lump: 0.1 });
    sk.fill(c, "#8A6A3E", { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 }); sk.ink(c, { w: 6, seed: sd + 2, wob: 0.5 });
    spikes(x, y, -Math.PI / 2, 5);
    return;
  }
  for (const [sg, i] of [[-1, 0], [1, 1]]) {
    const cx = x + sg * r * 0.5;
    const half = [...ell(cx, y, r * 0.8, r, sg < 0 ? Math.PI / 2 : -Math.PI / 2, sg < 0 ? Math.PI * 1.5 : Math.PI / 2)];
    half.push(half[0]);
    sk.fill(half, "#8A6A3E", { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 + i }); sk.ink(half, { w: 6, seed: sd + 3 + i, wob: 0.4 });
    sk.fill(ell(cx - sg * r * 0.08, y, r * 0.22, r * 0.62), "#F3E3BF", { dx: 0, dy: 0, wob: 0.2, seed: sd + 5 + i });
  }
}
// 두 섬의 거북(문제 그림과 2컷이 함께 쓴다). 원점 = 섬 땅의 가운데
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

/* ---------- 1. 1835년, 갈라파고스: 거북 등에 오른 다윈 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  // 먼 화산섬과 바다, 닻을 내린 비글호
  const isl = curve([[560, 428], [640, 370], [700, 342], [760, 366], [850, 398], [960, 428]], false, 4);
  sk.fill([...isl, isl[0]], "#9A948C", { seed: 11, tex: true, texAng: 0.6 }); sk.ink(isl, { w: 8, seed: 12 });
  sea(sk, -10, 970, 424, 548, { seed: 13, waves: 3 });
  beagle(sk, 150, 504, 0.28, 601);
  // 화산섬의 땅(밝은 바탕에 검은 용암 돌 몇 개)
  const ground = [...curve([[-12, 548], [220, 540], [520, 548], [760, 540], [972, 546]], false, 5), [972, 730], [-12, 730]];
  ground.push(ground[0]);
  sk.fill(ground, "#E2D6C2", { seed: 14, tex: true, texAng: 0.1 }); sk.ink(ground.slice(0, -3), { w: 9, seed: 15 });
  for (const [x, y, r, i] of [[90, 664, 26, 0], [140, 690, 16, 1], [820, 676, 24, 2], [880, 650, 14, 3]]) { const rk = circ(x, y, r, { over: 0.15, seed: 16 + i, lump: 0.14 }); sk.fill(rk, "#6F6A66", { dx: 0, dy: 0, wob: 0.6, seed: 20 + i }); sk.ink(rk, { w: 7, seed: 24 + i, wob: 0.6 }); }
  // 커다란 거북과 그 등에 걸터앉은 다윈(허벅지는 앞으로, 정강이는 등딱지 옆으로 늘어뜨리고 두 팔을 벌려 균형을 잡는다)
  const tx = 470, ty = 690, ts = 1.12;
  const shellTop = ty - ts * (50 + 142);
  const ride = pose({ hip: [0, -212], knL: [108, -204], ftL: [118, -112], knR: [94, -196], ftR: [104, -104], elL: [-84, -300], haL: [-170, -338], elR: [90, -312], haR: [176, -366], tilt: -0.12 });
  const fs = 0.62, fx = tx - 20, fy = shellTop + 18 + fs * 212;
  tortoise(sk, tx, ty, ts, { kind: "dome", seed: 341 });
  drawFigure(sk, fx, fy, fs, ride, { ...DARWIN, name: "darwin", face: "shock", under: satchel(sk) });
  // 걷는 거북의 움직임 표시와 진땀
  for (const [y, i] of [[ty - 70, 0], [ty - 40, 1]]) sk.ink(dense([[tx - ts * 150, y], [tx - ts * 186, y + 2]]), { w: 6, color: C.gray, seed: 31 + i, wob: 0.3 });
  drop(sk, fx + 84, fy - fs * 520, 1);
  return sk;
}

/* ---------- 2. 찰스섬: 등딱지만 봐도 안다고? ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  // 두 섬 사이의 바다
  sk.ink(curve([[640, 672], [658, 664], [676, 672], [694, 664], [712, 672]]), { w: 8, color: C.blue, seed: 41, wob: 0.4 });
  sk.ink(curve([[648, 698], [666, 690], [684, 698], [702, 690]]), { w: 7, color: C.blue, seed: 42, wob: 0.4 });
  islandA(sk, 500, 660, 0.7);
  islandB(sk, 826, 660, 0.7);
  // 다윈: 손에 든 새를 들여다보느라 등을 돌리고 있다
  const busy = pose({ elL: [-70, -300], haL: [-110, -366], elR: [50, -262], haR: [22, -222], tilt: -0.16 });
  const dx = 92, dy = 704, ds = 0.56;
  drawFigure(sk, dx, dy, ds, busy, { ...DARWIN, name: "darwin", face: "curious", hands: "R", under: satchel(sk) });
  const rx = dx - ds * 110, ry = dy - ds * 366;
  finch(sk, rx + 14, ry + 4, 0.34, { beak: 0.7, seed: 51, legs: false, flip: -1 });
  handDot(sk, [rx, ry], C.skin, 56, 9);
  // 로슨: 거북을 가리킨다
  const point = pose({ elR: [88, -316], haR: [170, -338], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  drawFigure(sk, 236, 704, 0.56, point, { ...LAWSON, name: "lawson", face: "smile" });
  return sk;
}

/* ---------- 3. 1837년, 런던: 모두 핀치였다 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  desk(sk, 300, 540, 380, { seed: 61 });
  // 부리만 다른 새 넷(표본 받침 위)
  [[1, 0], [0.68, 1], [0.36, 2], [0.04, 3]].forEach(([k, i]) => {
    const x = 360 + i * 88;
    const st = rrect(x - 28, 524, 56, 16, 6);
    sk.fill(st, "#E9E6DF", { dx: 0, dy: 0, wob: 0.3, seed: 63 + i }); sk.ink(st, { w: 6, seed: 67 + i, wob: 0.4 });
    finch(sk, x - 8, 524, 0.42, { beak: k, seed: 311 + i * 13, color: i % 2 ? "#6E5A4A" : BIRD });
  });
  const point = pose({ elR: [86, -300], haR: [150, -292], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  drawFigure(sk, 160, 704, 0.72, point, { ...GOULD, name: "gould", face: "smile" });
  // 다윈: 손을 이마에 대고 아쉬워한다(섬마다 적어 두지 않은 표본)
  const oops = pose({ elR: [86, -312], haR: [72, -470], elL: [-50, -262], haL: [-22, -222], tilt: 0.1 });
  drawFigure(sk, 820, 704, 0.72, oops, { ...DARWIN, name: "darwin", face: "shock", under: satchel(sk) });
  drop(sk, 900, 300, 1.1);
  emark(sk, 690, 270, 0.8, { color: C.red, rot: -0.12 });
  return sk;
}

/* ---------- 4. 1837년, 런던: 수첩의 나뭇가지 그림 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  // 생각 구름 속의 나뭇가지: 한 줄기에서 갈라진 가지 끝마다 부리가 다른 새
  cloud(sk, 360, 330, 540, 360, { seed: 71, tail: [[650, 486, 12, 0], [690, 452, 17, 1]] });
  const BR = "#8A5A33";
  const trunk = curve([[360, 480], [356, 440], [360, 404]]);
  sk.ink(trunk, { w: 9, color: BR, seed: 72 });
  const branches = [
    [[360, 404], [300, 360], [236, 300]], [[360, 404], [330, 330], [314, 262]],
    [[360, 404], [392, 340], [408, 262]], [[360, 404], [430, 352], [492, 296]],
  ];
  branches.forEach((b, i) => sk.ink(curve(b), { w: 7, color: BR, seed: 73 + i, wob: 0.5 }));
  sk.ink(curve([[300, 360], [270, 352], [238, 360]]), { w: 6, color: BR, seed: 77, wob: 0.4 });
  sk.ink(curve([[430, 352], [460, 368], [494, 372]]), { w: 6, color: BR, seed: 78, wob: 0.4 });
  // 가지 끝의 새 머리(부리가 조금씩 다르다)
  const tip = (x, y, k, sd) => sk.at(x, y, 0.42, () => {
    const hd = circ(0, -26, 30, { over: 0.12, seed: sd });
    sk.fill(hd, BIRD, { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd + 1 }); sk.ink(hd, { w: 8, seed: sd + 2, wob: 0.5 });
    const bh = lerp(8, 26, k), bl = lerp(42, 30, k);
    const bk = poly([[26, -26 - bh], [26 + bl, -22], [26, -26 + bh * 0.75]], 3);
    sk.fill(bk, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 }); sk.ink(bk, { w: 6, seed: sd + 4, wob: 0.4 });
    sk.dot(8, -34, 5);
  });
  tip(236, 296, 1, 81); tip(240, 362, 0.8, 86); tip(314, 258, 0.55, 91); tip(408, 258, 0.3, 96); tip(492, 292, 0.1, 101); tip(496, 374, 0.4, 106);
  // 다윈: 책상 앞에서 수첩에 적는다
  desk(sk, 640, 560, 300, { seed: 111 });
  notebook(sk, 760, 532, 0.9, { seed: 113, rot: -0.1 });
  const write = pose({ elR: [-40, -270], haR: [-92, -258], elL: [-60, -300], haL: [-120, -300], tilt: -0.08 });
  const fx = 860, fy = 704, fs = 0.72;
  drawFigure(sk, fx, fy, fs, write, { ...DARWIN, name: "darwin", face: "curious", hands: false });
  handDot(sk, [fx - fs * 120, fy - fs * 300], C.skin, 115, 12);
  quill(sk, fx - fs * 92 - 14, fy - fs * 258 + 6, 0.6, { seed: 116, rot: 0.6 });
  handDot(sk, [fx - fs * 92, fy - fs * 258], C.skin, 117, 12);
  return sk;
}

/* ---------- 5. 1859년: 「종의 기원」 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  desk(sk, 520, 560, 400, { seed: 121 });
  // 20년 넘게 쌓인 공책과 원고 더미
  for (let i = 0; i < 9; i++) { const y = 552 - i * 17; const sh = poly([[566 + (i % 3) * 5, y - 14], [716 - (i % 2) * 6, y - 15], [718 - (i % 2) * 6, y], [564 + (i % 3) * 5, y + 1]], 3); sk.fill(sh, i % 3 === 1 ? "#EDE8DC" : C.white, { dx: 0, dy: 0, wob: 0.4, seed: 123 + i }); sk.ink(sh, { w: 6, seed: 133 + i, wob: 0.5 }); }
  for (let i = 0; i < 4; i++) { const y = 552 - i * 20; const nb = poly([[766, y - 17], [890, y - 18], [892, y], [764, y + 1]], 3); sk.fill(nb, ["#B5814C", "#6E8FA8", "#C96A4A", "#B5814C"][i], { dx: 0, dy: 0, wob: 0.4, seed: 143 + i }); sk.ink(nb, { w: 6, seed: 147 + i, wob: 0.5 }); }
  // 쉰 살의 다윈: 펼친 책을 들어 보인다(책 속 그림은 단 하나, 가지를 뻗는 나무)
  const up = pose({ elR: [96, -330], haR: [158, -404], elL: [-52, -262], haL: [-22, -222], tilt: -0.04 });
  const fx = 236, fy = 704, fs = 0.8;
  drawFigure(sk, fx, fy, fs, up, { ...DARWIN_1859, name: "darwin", hands: "L" });
  sideHair(sk, fx, fy, fs, up, "#6E5B4C", 151);
  const hx = fx + fs * 158, hy = fy - fs * 404;
  sk.at(hx + 46, hy - 80, 1, () => {
    for (const sg of [-1, 1]) {
      const pg = curve([[0, 60], [sg * 50, 54], [sg * 98, 60], [sg * 100, -62], [sg * 50, -70], [0, -64]], true, 4);
      sk.fill(pg, "#FBF6E6", { seed: 161 + (sg > 0 ? 1 : 0), dx: 1, dy: 1.2 }); sk.ink(pg, { w: 7, seed: 163 + (sg > 0 ? 1 : 0) });
    }
    const cover = curve([[-104, 66], [0, 70], [104, 66], [104, 74], [0, 78], [-104, 74]], true, 3);
    sk.fill(cover, "#3F7D4E", { dx: 0, dy: 0, wob: 0.3, seed: 165 }); sk.ink(cover, { w: 6, seed: 166, wob: 0.3 });
    sk.ink(dense([[0, -64], [0, 60]]), { w: 5, seed: 167, color: "#8A7A60" });
    // 오른쪽 쪽: 갈라지는 나뭇가지 그림(점선 가지 없이 선만)
    const BR = "#5E5A58";
    sk.ink(dense([[50, 44], [50, 24]]), { w: 4, color: BR, seed: 168 });
    for (const [x2, y2, i] of [[20, -46, 0], [40, -40, 1], [62, -44, 2], [82, -38, 3]]) sk.ink(curve([[50, 24], [lerp(50, x2, 0.5), lerp(24, y2, 0.5) + 6], [x2, y2]]), { w: 4, color: BR, seed: 169 + i, wob: 0.3 });
    // 왼쪽 쪽: 글줄 대신 회색 줄
    for (let i = 0; i < 6; i++) sk.ink(dense([[-86, -44 + i * 17], [-16 - (i % 2) * 10, -44 + i * 17]]), { w: 4, color: C.grayLight, seed: 175 + i, wob: 0.2 });
  }, 0.08);
  handDot(sk, [hx, hy], C.skin, 181, 12);
  sparkle(sk, hx + 196, hy - 116, 15, { seed: 182 });
  sparkle(sk, hx - 10, hy - 140, 10, { seed: 183 });
  return sk;
}

/* ---------- 6. 대프니메이저섬: 같은 새, 다른 부리 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  // 땅에서 솟은 바위 위의 같은 종류 새 셋(부리 크기만 조금씩 다르다)
  const rock = [...curve([[30, 704], [52, 600], [110, 560], [220, 548], [340, 558], [396, 610], [414, 704]], false, 4)];
  rock.push(rock[0]);
  sk.fill(rock, "#CFC3B0", { seed: 191, tex: true, texAng: 0.2 }); sk.ink(rock.slice(0, -1), { w: 9, seed: 192 });
  finch(sk, 112, 566, 0.62, { beak: 0.3, seed: 201 });
  finch(sk, 220, 552, 0.62, { beak: 0.55, seed: 214 });
  finch(sk, 326, 560, 0.62, { beak: 0.85, seed: 227 });
  sk.ink(dense([[20, 704], [940, 704]], 6), { w: 8, seed: 193 });
  // 로즈메리: 새를 손에 얹어 든다. 피터: 부리에 캘리퍼스를 댄다
  const hold = pose({ elR: [84, -288], haR: [140, -300], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  const ax = 530, ay = 702, as = 0.7;
  drawFigure(sk, ax, ay, as, hold, { ...ROSEMARY, name: "rosemary", face: "smile" });
  const bx0 = ax + as * 140, by0 = ay - as * 300;
  finch(sk, bx0 + 42, by0 - 12, 0.5, { beak: 0.7, seed: 241, legs: false });
  const meas = pose({ elL: [-86, -296], haL: [-146, -320], elR: [50, -260], haR: [24, -218], tilt: -0.05 });
  const gx = 846, gy = 702;
  drawFigure(sk, gx, gy, as, meas, { ...PETER, name: "peter", face: "curious", hands: "R" });
  const mx = gx - as * 146, my = gy - as * 320;
  sk.ink(dense([[mx + 4, my - 2], [mx - 70, my - 22]]), { w: 9, color: "#8A9099", seed: 251, wob: 0.3 });
  sk.ink(dense([[mx - 70, my - 22], [mx - 64, my - 56]]), { w: 7, color: "#8A9099", seed: 252, wob: 0.3 });
  sk.ink(dense([[mx - 38, my - 14], [mx - 32, my - 46]]), { w: 7, color: "#8A9099", seed: 253, wob: 0.3 });
  handDot(sk, [mx, my], C.skin, 254, 11);
  return sk;
}

/* ---------- 7. 1977년, 가뭄: 부리 큰 새가 더 많이 살아남았다 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  sun(sk, 896, 124, 40, { seed: 701 });
  // 메마른 땅(갈라진 금)
  const ground = [...curve([[-12, 596], [300, 588], [640, 596], [972, 590]], false, 5), [972, 730], [-12, 730]];
  ground.push(ground[0]);
  sk.fill(ground, "#EBDDBE", { seed: 261, tex: true, texAng: 0.1 }); sk.ink(ground.slice(0, -3), { w: 9, seed: 262 });
  for (const [x, i] of [[150, 0], [420, 1], [560, 2], [880, 3]]) sk.ink(dense([[x, 620], [x + 18, 648], [x + 6, 668], [x + 24, 700]], 3), { w: 5, color: "#B8A07A", seed: 263 + i, wob: 0.3 });
  // 왼쪽: 부리 큰 새가 단단한 씨앗을 깨 먹었다 + 그 뒤에 부리 굵은 새끼 둘
  chick(sk, 50, 612, 0.86, 301, true); chick(sk, 104, 618, 0.86, 311, true);
  finch(sk, 206, 604, 0.78, { beak: 1, seed: 271 });
  hardSeed(sk, 316, 584, 18, 281, true);
  check(sk, 220, 410, 1);
  // 가운데: 부리 작은 새는 단단한 씨앗 앞에서 쩔쩔맨다
  finch(sk, 460, 604, 0.74, { beak: 0.06, seed: 321 });
  hardSeed(sk, 566, 588, 18, 331);
  drop(sk, 458, 470, 1.1); drop(sk, 536, 456, 0.9);
  // 오른쪽: 기록하는 로즈메리
  const note = pose({ elR: [-30, -268], haR: [-70, -300], elL: [-60, -270], haL: [-104, -300], tilt: -0.05 });
  const fx = 680, fy = 704, fs = 0.68;
  drawFigure(sk, fx, fy, fs, note, { ...ROSEMARY, name: "rosemary", face: "wide", hands: false });
  notebook(sk, fx - fs * 88, fy - fs * 312, 0.8, { seed: 341, rot: 0.15 });
  handDot(sk, [fx - fs * 104, fy - fs * 300], C.skin, 342, 11);
  handDot(sk, [fx - fs * 70, fy - fs * 300], C.skin, 343, 11);
  return sk;
}

export const META = {
  title: "다윈의<br><em>이상한 섬들</em>",
  lead: "섬마다 거북도 새도 조금씩 달랐어요. 그 까닭을 찾아간 사람들의 이야기예요.",
  narrator: "1831년 영국을 떠난 측량선 비글호는 남아메리카 해안을 돌며 바다 지도를 그렸어요. 배에는 스물두 살 박물학자 <b>찰스 다윈</b>이 타고 있었지요. 4년 가까이 지나 배는 태평양의 화산섬들에 닿아요.",
  cta: "변이 정리하러 가기",
};

const TEXT = [
  {
    when: "1835년, 갈라파고스 제도", whenPos: "tr", stage: "도착", title: "거북 등에 올라탄 다윈",
    caption: "1835년 9월, 비글호가 남아메리카 서쪽 바다의 <b>갈라파고스 제도</b>에 닿았어요. 다윈은 화산섬을 돌며 새와 식물, 돌을 모았지요. 커다란 거북 등에 올라타 보기도 했는데, 균형을 잡기가 무척 어려웠대요.",
    bubbles: [{ who: "darwin", text: "어이쿠,<br>흔들려!" }],
  },
  {
    when: "1835년, 갈라파고스 찰스섬", stage: "흘려들은 말", title: "등딱지만 봐도 안다고?",
    caption: "섬의 부총독 <b>로슨</b>은 거북 등딱지만 봐도 어느 섬 거북인지 맞힐 수 있다고 했어요. 선인장이 높이 자라는 메마른 섬의 거북은 등딱지 앞이 말안장처럼 들려 있어 목을 높이 뻗을 수 있었지요. 다윈은 이 말을 한동안 흘려들었어요.",
    bubbles: [{ who: "lawson", text: "등딱지만 봐도<br>어느 섬인지 알지" }],
  },
  {
    when: "1837년, 영국 런던", stage: "반전", title: "모두 핀치였다",
    caption: "영국에 돌아온 다윈은 새 표본을 조류학자 <b>굴드</b>에게 맡겼어요. 부리가 제각각이라 서로 먼 새인 줄 알았던 작은 새들이 모두 <b>핀치</b>였어요. 여러 종류였지만 아주 가까운 친척들이었지요. 다윈은 어느 섬에서 잡았는지 적어 두지 않은 것을 아쉬워했어요.",
    bubbles: [{ who: "gould", text: "모두 핀치<br>무리요!" }],
  },
  {
    when: "1837년, 영국 런던", stage: "질문", title: "가지를 치는 생각",
    caption: "섬마다 다른 거북, 섬마다 다른 새. 다윈은 수첩에 나뭇가지처럼 갈라지는 그림을 그렸어요. 한 무리가 여러 섬으로 흩어져 오랜 세월을 지내며 조금씩 달라지다가, 서로 다른 종류로 나뉜 것은 아닐까 생각한 거예요.",
  },
  {
    when: "1859년, 영국", stage: "생각을 책으로", title: "20년 넘게 모은 증거",
    caption: "1859년, 다윈은 20년 넘게 모은 증거로 「종의 기원」을 펴냈어요. 같은 무리 안에서도 생김새는 조금씩 다르고, 사는 곳에 알맞은 생김새를 가진 쪽이 더 많이 살아남아 자손을 남긴다는 생각을 담은 책이에요.",
    bubbles: [{ who: "darwin", text: "드디어<br>나왔다!" }],
  },
  {
    when: "1970년대, 대프니메이저섬", stage: "측정", title: "같은 새, 다른 부리",
    caption: "1973년부터 그랜트 부부는 갈라파고스의 작은 섬 대프니메이저에서 핀치를 해마다 잡아 부리를 쟀어요. 같은 종류의 새인데도 부리 크기가 저마다 조금씩 달랐지요. 이렇게 같은 종류 안에서 나타나는 차이를 <b>변이</b>라고 해요.",
    term: { name: "변이", def: "같은 종류의 생물 사이에서 나타나는 서로 다른 특징" },
    bubbles: [{ who: "peter", text: "부리가<br>다 조금씩 달라" }],
  },
  {
    when: "1977년, 대프니메이저섬", stage: "가뭄", title: "가뭄이 고른 부리",
    caption: "1977년 큰 가뭄으로 작고 무른 씨앗이 바닥나고 크고 단단한 씨앗만 남았어요. 이 씨앗을 깰 수 있는 <b>부리 큰 새가 더 많이 살아남아</b> 새끼를 남겼고, 다음 세대는 부리가 평균 조금 더 커졌어요. 새 한 마리의 부리가 자란 것이 아니에요.",
    bubbles: [{ who: "rosemary", text: "부리 큰 새가<br>살아남았어!" }],
  },
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7].map((fn, i) => ({ sk: fn(), ...TEXT[i] }));
}

// 거북 문제 그림: 섬 (가) 키 큰 선인장, 섬 (나) 낮은 풀. 2컷과 같은 거북을 인물 없이 한 섬씩 따로 그린다(옛 장면과 같은 그림).
export function extras() {
  const a = new Sk(480, 420, { id: "xa" }); islandA(a, 226, 392, 0.88);
  const b = new Sk(480, 420, { id: "xb" }); islandB(b, 232, 392, 0.88);
  return [{ name: "island-a", sk: a }, { name: "island-b", sk: b }];
}
