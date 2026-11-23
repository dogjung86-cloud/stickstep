// 중1 과학 u1l3 도입 만화 v2: 과학이 바꾼 세상, 시간 여행. 8컷.
// 조사와 콘티: qa/sketch/research/u1l3.md. 미리보기: node qa/sketch/mock-comic.mjs comic-u1l3 <출력 PNG> 4
//   전기 사슬을 세 컷으로 끝까지 따라간다: 1 원리(1831년 런던, 패러데이: 코일 속에서 자석을 움직이면 전기가 흐른다)
//   → 2 기술(1870년대, 자석 사이에서 코일을 돌려 전기를 계속 만드는 발전기) → 3 기기와 쓰임(1880년대, 전구와 발전소가 밤을 밝힘).
//   이어서 문명의 변화 넷을 시간순으로: 4 산업(1780년대 영국, 증기 기관이 돌린 방적 공장) → 5 의학(1796년 버클리, 제너의 우두 접종: 미리 막기)
//   → 6 의학(1928년 런던, 플레밍의 접시: 감염 뒤 치료) → 7 통신(1962년 텔스타 생방송) → 8 예술(오늘날 가상 현실 그림, 정리)
// 2026-11-23 저작권 손질: 옛 1~3컷의 렌즈 사슬(빛의 굴절 → 안경 → 훅의 현미경)을 전기 사슬로 바꿨다(훅의 코르크는 u2l1 만화가 맡는다).
// 인물: 이름 있는 과학자(패러데이, 제너, 플레밍)는 작은 얼굴, 기술자와 아이, 일꾼, 시청자, 쌤과 학생은 얼굴 없이. 그림 안에 글자와 숫자는 없다.
import { Sk, C, curve, dense, circ, ell, arc, poly, rrect, mix, squiggle, sparkle, emark, arrow, heart } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, R, TEACHER, STUDENT, FLEMING } from "../lib/figure.mjs";
import { petri, openBook } from "../lib/props.mjs";

const W = 960, H = 720, PI = Math.PI;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; }; // 큰 구조물의 선이 인물보다 굵어지지 않게

// 인물의 머리 중심(화면 좌표)과 기울기. 모자, 터번, 안경처럼 머리에 얹는 것을 그릴 때 쓴다
function headAt(x, y, s, p, mirror = false) {
  const m = mirror ? -1 : 1;
  return { x: x + m * s * p.head[0], y: y + s * p.head[1], rot: m * (p.tilt ?? 0), s, m };
}
// 방 벽과 바닥(배경). 바닥 y = floor
function room(sk, wall, floorCol, floor = 690, sd = 5) {
  sk.fill(poly([[-10, -10], [970, -10], [970, 730], [-10, 730]], 8), wall, { dx: 0, dy: 0, wob: 0, seed: sd, tex: false });
  thin(sk, 0.7, () => {
    const fl = poly([[-10, floor], [970, floor], [970, 730], [-10, 730]], 6);
    sk.fill(fl, floorCol, { dx: 0, dy: 0, wob: 0.5, seed: sd + 1, tex: true, texAng: 0.02 });
    sk.ink(dense([[-10, floor], [970, floor]]), { w: 9, seed: sd + 2 });
  });
}
// 옆에서 본 탁자. (x0..x1) 상판, top = 상판 위 y
function table(sk, x0, x1, top, sd = 31, floor = 690, col = C.wood) {
  thin(sk, 0.85, () => {
    sk.ink(dense([[x0 + 34, top + 22], [x0 + 26, floor]]), { w: 12, seed: sd });
    sk.ink(dense([[x1 - 34, top + 22], [x1 - 26, floor]]), { w: 12, seed: sd + 1 });
    const t = rrect(x0, top, x1 - x0, 26, 9);
    sk.fill(t, col, { seed: sd + 2, tex: true, texAng: 0.02 }); sk.ink(t, { w: 10, seed: sd + 3 });
  });
}
/* ---------- 1. 원리의 발견: 자석을 움직이면 전기가 흘러요 (1831년, 영국 런던) ---------- */
// 패러데이(1831년 마흔): 짙은 갈색 머리 + 짙은 외투. 작은 얼굴
const FARADAY = { hair: "short", hairColor: "#5B3F2E", fringe: 30, coat: { color: "#3E4450", buttons: "#B8A27A", seam: "#262A30" }, seed: 211, mini: true, face: "wide" };
// 코일: 구리 선을 촘촘히 감은 원통(옆에서 본 모습). 왼쪽 끝은 자석이 드나드는 구멍
function coil(sk, x0, x1, cy, r, sd) {
  thin(sk, 0.8, () => {
    const body = rrect(x0, cy - r, x1 - x0, 2 * r, 12);
    sk.fill(body, "#E9D9B4", { dx: 0, dy: 0, wob: 0.3, seed: sd });
    const n = Math.round((x1 - x0) / 15);
    for (let i = 0; i < n; i++) {
      const x = x0 + 10 + (x1 - x0 - 20) * i / (n - 1);
      sk.ink(curve([[x - 4, cy - r + 3], [x + 5, cy], [x + 2, cy + r - 3]]), { w: 7, color: "#B8652C", seed: sd + 1 + i, wob: 0.2 });
    }
    sk.ink(body, { w: 9, seed: sd + 40 });
    const hole = ell(x0, cy, 11, r - 4);
    sk.fill(hole, "#4A3A2E", { dx: 0, dy: 0, wob: 0.3, seed: sd + 41 }); sk.ink(hole, { w: 6, seed: sd + 42 });
  });
}
// 바늘 계기(전기가 흐르면 바늘이 움직인다). (x, y) = 받침 아래 가운데, swing = 바늘이 기운 각
function meter(sk, x, y, s, swing, sd) {
  sk.at(x, y, s, () => {
    const base = rrect(-78, -34, 156, 34, 8);
    sk.fill(base, C.woodDark, { seed: sd, tex: true, texAng: 0.02 }); sk.ink(base, { w: 9, seed: sd + 1 });
    for (const [kx, i] of [[-54, 0], [54, 1]]) { sk.dot(kx, -40, 9, "#B8892E"); sk.ink(circ(kx, -40, 9, { over: 0, seed: sd + 2 + i }), { w: 4, seed: sd + 4 + i, wob: 0.1 }); }
    const face = circ(0, -112, 64, { over: 0.1, seed: sd + 6 });
    sk.fill(face, "#FBF6E6", { dx: 0, dy: 0, wob: 0.4, seed: sd + 7 }); sk.ink(face, { w: 9, seed: sd + 8 });
    for (let i = -4; i <= 4; i++) { const a = -Math.PI / 2 + i * 0.24; sk.ink(dense([[40 * Math.cos(a), -112 + 40 * Math.sin(a)], [52 * Math.cos(a), -112 + 52 * Math.sin(a)]], 2), { w: i ? 3.5 : 5, color: "#8A6A2A", seed: sd + 10 + i, wob: 0.1 }); }
    const a = -Math.PI / 2 + swing;
    sk.ink(dense([[0, -112], [50 * Math.cos(a), -112 + 50 * Math.sin(a)]]), { w: 6, color: C.red, seed: sd + 20, wob: 0.1 });
    sk.dot(0, -112, 7, C.ink);
    // 바늘이 흔들린다
    for (const [r0, i] of [[60, 0], [72, 1]]) sk.ink(arc(0, -112, r0, -Math.PI / 2 + swing - 0.32, -Math.PI / 2 + swing - 0.1), { w: 4, color: C.gray, seed: sd + 22 + i, wob: 0.1 });
  });
}
// 막대자석(두 극을 빨강과 파랑으로만 나눈다. 글자는 쓰지 않는다). (x, y) = 왼쪽 끝 가운데
function barMagnet(sk, x, y, len, h, sd) {
  for (const [x0, col, i] of [[x, C.blue, 0], [x + len / 2, C.red, 1]]) { const p = rrect(x0, y - h / 2, len / 2, h, 4); sk.fill(p, col, { dx: 0, dy: 0, wob: 0.3, seed: sd + i }); }
  sk.ink(rrect(x, y - h / 2, len, h, 5), { w: 7, seed: sd + 2, wob: 0.3 });
}
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  room(sk, "#F1ECE2", "#DDD0B6");
  // 뒷벽의 시렁과 약병(실험실)
  thin(sk, 0.8, () => {
    sk.ink(dense([[600, 214], [930, 214]]), { w: 10, color: "#8A6A44", seed: 11, wob: 0.3 });
    for (const [x, h, col, i] of [[640, 70, "#9FD3EF", 0], [700, 54, "#E8C77E", 1], [756, 80, "#B9DE9B", 2], [880, 62, "#F2C4B8", 3]]) {
      const b = rrect(x - 18, 214 - h, 36, h, 8); sk.fill(b, col, { dx: 0, dy: 0, wob: 0.3, seed: 12 + i, alpha: 0.9 }); sk.ink(b, { w: 7, seed: 16 + i, wob: 0.3 });
    }
  });
  table(sk, 300, 930, 548, 31);
  coil(sk, 520, 688, 486, 54, 41);
  meter(sk, 812, 548, 0.92, 0.62, 61);
  // 코일 두 끝에서 계기로 이은 전선
  sk.ink(curve([[688, 462], [732, 420], [760, 470], [762, 509]]), { w: 5, color: "#7A4A2A", seed: 81, wob: 0.2 });
  sk.ink(curve([[688, 512], [760, 560], [840, 556], [862, 509]]), { w: 5, color: "#7A4A2A", seed: 82, wob: 0.2 });
  // 패러데이: 막대자석을 코일 속으로 밀어 넣는다
  const P = pose({ elR: [116, -298], haR: [226, -276], elL: [-50, -262], haL: [-24, -210], tilt: 0.06 });
  const fx = 214, fy = 690, fs = 0.74;
  const hand = [fx + fs * 226, fy - fs * 276];
  barMagnet(sk, hand[0] - 12, hand[1] + 2, 162, 36, 91);
  drawFigure(sk, fx, fy, fs, P, { ...FARADAY, name: "faraday", look: 0.6 });
  arrow(sk, [[hand[0] + 6, hand[1] - 46], [hand[0] + 92, hand[1] - 46]], { w: 7, color: C.ink, seed: 95, straight: true, head: 16, wob: 0.2 });
  return sk;
}

/* ---------- 2. 기술의 발달: 돌리는 동안 전기가 계속 (1870년대, 유럽) ---------- */
const MECH = { hair: "tophat", hairColor: "#5B463A", coat: { color: "#5A6B7D", buttons: C.gold, seam: "#3E4A57", len: 46 }, seed: 261 };
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  room(sk, "#EFE7DA", "#D9CBB0");
  // 증기 기관의 큰 바퀴(왼쪽, 일부만 보인다)와 벨트
  const wx = 150, wy = 330, wr = 128;
  thin(sk, 0.7, () => {
    sk.ink(circ(wx, wy, wr, { over: 0.06, seed: 11 }), { w: 16, color: "#5B5F66", seed: 12, wob: 0.3 });
    for (let i = 0; i < 6; i++) { const a = i * PI / 3 + 0.3; sk.ink(dense([[wx, wy], [wx + (wr - 8) * Math.cos(a), wy + (wr - 8) * Math.sin(a)]]), { w: 9, color: "#5B5F66", seed: 13 + i, wob: 0.2 }); }
    sk.dot(wx, wy, 16, "#3E4450");
  });
  for (const [a0, i] of [[-1.9, 0], [1.2, 1]]) sk.ink(arc(wx, wy, wr + 22, a0, a0 + 0.8), { w: 5, color: C.gray, seed: 21 + i, wob: 0.2 });
  // 바퀴를 돌리는 증기 기관(바퀴 아래): 화덕 위의 보일러, 실린더에서 바퀴의 크랭크로 이은 막대, 피어오르는 증기
  thin(sk, 0.75, () => {
    const boiler = rrect(36, 560, 196, 130, 44); sk.fill(boiler, "#7E8794", { seed: 61, tex: true, texAng: 0.02 }); sk.ink(boiler, { w: 9, seed: 62 });
    const mouth = rrect(76, 624, 64, 44, 10); sk.fill(mouth, C.orange, { dx: 0, dy: 0, wob: 0.4, seed: 63 }); sk.ink(mouth, { w: 7, seed: 64 });
    const cyl = rrect(160, 508, 56, 54, 10); sk.fill(cyl, "#5B5F66", { seed: 65 }); sk.ink(cyl, { w: 8, seed: 66 });
    const pin = [wx + 64 * Math.cos(1.25), wy + 64 * Math.sin(1.25)];
    sk.ink(dense([[188, 508], pin]), { w: 10, color: "#3E4450", seed: 67, wob: 0.1 }); sk.dot(pin[0], pin[1], 9, C.ink);
  });
  for (const [x, y, rr, i] of [[66, 528, 22, 0], [42, 500, 28, 1], [70, 470, 20, 2]]) { const c = circ(x, y, rr, { over: 0.2, seed: 68 + i, lump: 0.1 }); sk.fill(c, "#F4F6F8", { dx: 0, dy: 0, wob: 0.6, seed: 71 + i }); sk.ink(c, { w: 5, color: C.gray, seed: 74 + i, wob: 0.6 }); }
  const px = 452, py = 470, pr = 24;
  sk.ink(dense([[wx + 10, wy - wr], [px, py - pr]]), { w: 8, color: "#6B4A32", seed: 25, wob: 0.2 });
  sk.ink(dense([[wx + 10, wy + wr], [px, py + pr]]), { w: 8, color: "#6B4A32", seed: 26, wob: 0.2 });
  // 발전기: 코일을 감은 두 자석 기둥 사이에서 구리 고리가 돈다
  thin(sk, 0.78, () => {
    const plinth = rrect(420, 604, 330, 86, 8); sk.fill(plinth, "#B5533C", { seed: 31, tex: true, texAng: 0.02 }); sk.ink(plinth, { w: 9, seed: 32 });
    for (const [x0, i] of [[488, 0], [636, 1]]) {
      const pole = rrect(x0, 370, 56, 234, 16); sk.fill(pole, "#6B717C", { seed: 33 + i, tex: true, texAng: 1.5 }); sk.ink(pole, { w: 9, seed: 35 + i });
      for (let k = 0; k < 4; k++) { const band = rrect(x0 - 6, 400 + k * 44, 68, 26, 8); sk.fill(band, "#C8733A", { dx: 0, dy: 0, wob: 0.3, seed: 37 + i * 4 + k }); sk.ink(band, { w: 5, seed: 45 + i * 4 + k, wob: 0.3 }); }
    }
    // 자석의 두 극(막대자석처럼 빨강과 파랑): 돌아가는 구리 고리를 사이에 두고 마주 본다
    for (const [x0, col, sg, i] of [[528, C.red, 1, 0], [634, C.blue, -1, 1]]) { const shoe = poly([[x0 + (sg > 0 ? 18 : 0), 418], [x0 + (sg > 0 ? 0 : 18), 426], [x0 + (sg > 0 ? 0 : 18), 514], [x0 + (sg > 0 ? 18 : 0), 522]], 3); sk.fill(shoe, col, { dx: 0, dy: 0, wob: 0.3, seed: 57 + i }); sk.ink(shoe, { w: 6, seed: 59 + i, wob: 0.3 }); }
    sk.ink(dense([[px, py], [600, py]]), { w: 10, color: "#3E4450", seed: 53, wob: 0.1 });
    const ring = circ(590, py, 46, { over: 0.08, seed: 54 });
    sk.fill(ring, "#C8733A", { dx: 0, dy: 0, wob: 0.3, seed: 55 });
    for (let i = 0; i < 12; i++) { const a = i * PI / 6; sk.ink(dense([[590 + 22 * Math.cos(a), py + 22 * Math.sin(a)], [590 + 44 * Math.cos(a), py + 44 * Math.sin(a)]]), { w: 4, color: "#7A3E1A", seed: 56 + i, wob: 0.1 }); }
    sk.ink(ring, { w: 8, seed: 70 });
    sk.fill(circ(590, py, 18, { over: 0, seed: 71 }), "#3E4450", { dx: 0, dy: 0, wob: 0.2, seed: 72 });
    const pul = circ(px, py, pr, { over: 0.08, seed: 73 }); sk.fill(pul, "#8A8F98", { dx: 0, dy: 0, wob: 0.3, seed: 74 }); sk.ink(pul, { w: 8, seed: 75 });
  });
  for (const [a0, i] of [[-2.4, 0], [0.7, 1]]) sk.ink(arc(590, py, 64, a0, a0 + 0.9), { w: 5, color: C.gray, seed: 76 + i, wob: 0.2 });
  // 전선을 따라 위의 아크등으로(1870년대에는 아직 전구가 없었다): 유리 공 속 두 탄소 막대 사이에서 불꽃이 환하게 튄다.
  //   기술자의 말풍선은 머리 왼쪽 위(가로 약 570~800)에 앉으므로 등은 그보다 왼쪽 천장에 단다
  const lx = 462, ly = 186;
  sk.ink(dense([[lx, -10], [lx, ly - 60]]), { w: 6, color: "#4A3A30", seed: 80, wob: 0.1 });
  sk.ink(curve([[562, 372], [548, 300], [500, 262], [lx - 4, ly + 56]]), { w: 5, color: "#7A4A2A", seed: 81, wob: 0.2 });
  sk.ink(curve([[620, 372], [606, 286], [530, 248], [lx + 4, ly + 56]]), { w: 5, color: "#7A4A2A", seed: 82, wob: 0.2 });
  sk.glow(lx, ly, 92, "#FFF1B8", 0.85, 0.15);
  const cap = rrect(lx - 18, ly - 64, 36, 22, 5); sk.fill(cap, "#5B5F66", { dx: 0, dy: 0, wob: 0.3, seed: 86 }); sk.ink(cap, { w: 6, seed: 87 });
  const globe = circ(lx, ly, 46, { over: 0.1, seed: 83 });
  sk.fill(globe, "#FFFBEA", { dx: 0, dy: 0, wob: 0.3, seed: 84, alpha: 0.9 });
  sk.ink(dense([[lx, ly - 42], [lx, ly - 8]]), { w: 8, color: "#3E4450", seed: 85, wob: 0.1 });
  sk.ink(dense([[lx, ly + 8], [lx, ly + 40]]), { w: 8, color: "#3E4450", seed: 89, wob: 0.1 });
  sparkle(sk, lx, ly - 2, 16, { seed: 90, color: C.yellow });
  sk.ink(globe, { w: 7, seed: 91 });
  sk.ink(dense([[lx, ly + 46], [lx, ly + 56]]), { w: 5, seed: 92, wob: 0.1 });
  for (const [a, i] of [[-2.7, 0], [-0.45, 1], [2.75, 2], [0.4, 3]]) sk.ink(dense([[lx + 62 * Math.cos(a), ly + 62 * Math.sin(a)], [lx + 84 * Math.cos(a), ly + 84 * Math.sin(a)]]), { w: 6, color: C.yellow, seed: 93 + i, wob: 0.2 });
  // 기술자: 환하게 켜진 등을 올려다본다
  const P = pose({ elL: [-70, -320], haL: [-110, -380], elR: [50, -262], haR: [24, -218], tilt: -0.1 });
  drawFigure(sk, 862, 690, 0.62, P, { ...MECH, name: "mech", look: -0.5 });
  return sk;
}

/* ---------- 3. 기기의 발명과 쓰임: 밤을 밝힌 전구 (1880년대, 미국 뉴욕) ---------- */
const GIRL = { hair: "bob", hairColor: "#8A5A33", coat: { color: "#7A9CC6", seam: "#4E6E96", len: 120 }, seed: 431 };
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  room(sk, "#F3E8D2", "#D8C29A");
  // 창밖의 밤: 굴뚝이 있는 발전소와 전봇대, 멀리 불 켜진 창
  const WX = 630, WY = 120, WW = 280, WH = 236;
  const win = rrect(WX, WY, WW, WH, 10);
  sk.fill(win, "#263052", { dx: 0, dy: 0, wob: 0.3, seed: 11, tex: false });
  for (const [x, y, i] of [[700, 150, 0], [860, 140, 1], [790, 176, 2]]) sk.dot(x, y, 3, "#FFF3C4");
  thin(sk, 0.7, () => {
    const plant = poly([[WX + 20, WY + WH - 4], [WX + 20, WY + 150], [WX + 130, WY + 150], [WX + 130, WY + WH - 4]], 4);
    sk.fill(plant, "#7A4A3A", { seed: 12, tex: true, texAng: 0.02 }); sk.ink(plant, { w: 8, seed: 13 });
    const chim = poly([[WX + 92, WY + 150], [WX + 92, WY + 62], [WX + 114, WY + 62], [WX + 114, WY + 150]], 4);
    sk.fill(chim, "#5E3A2E", { seed: 14 }); sk.ink(chim, { w: 8, seed: 15 });
    for (const [x, i] of [[WX + 40, 0], [WX + 72, 1]]) { const w2 = rrect(x, WY + 176, 20, 24, 3); sk.fill(w2, "#FFE07A", { dx: 0, dy: 0, wob: 0.2, seed: 16 + i }); }
    sk.ink(dense([[WX + 200, WY + WH - 4], [WX + 200, WY + 96]]), { w: 9, color: "#8A6A44", seed: 18, wob: 0.2 });
    sk.ink(dense([[WX + 182, WY + 104], [WX + 218, WY + 104]]), { w: 7, color: "#8A6A44", seed: 19, wob: 0.2 });
  });
  for (const [x, y, rr, i] of [[WX + 110, WY + 46, 14, 0], [WX + 126, WY + 26, 18, 1]]) { const c = circ(x, y, rr, { over: 0.2, seed: 20 + i, lump: 0.1 }); sk.fill(c, "#C9CFD8", { dx: 0, dy: 0, wob: 0.5, seed: 22 + i, alpha: 0.8 }); }
  sk.ink(curve([[WX + 130, WY + 156], [WX + 166, WY + 120], [WX + 200, WY + 104]]), { w: 3.5, color: "#C9CFD8", seed: 24, wob: 0.2 });
  sk.ink(curve([[WX + 200, WY + 104], [WX + 236, WY + 70], [WX + WW, WY + 60]]), { w: 3.5, color: "#C9CFD8", seed: 25, wob: 0.2 });
  thin(sk, 0.8, () => { sk.ink(win, { w: 11, seed: 26 }); sk.ink(dense([[WX + WW / 2, WY], [WX + WW / 2, WY + WH]]), { w: 7, seed: 27 }); });
  // 바깥에서 들어와 천장을 지나 내려온 전선과 전구
  const bx = 400, by = 236;
  sk.ink(curve([[WX - 4, WY + 30], [520, 60], [bx, 52], [bx, by - 44]]), { w: 5, color: "#4A3A30", seed: 31, wob: 0.2 });
  sk.glow(bx, by, 130, "#FFE7A3", 0.8, 0.15);
  const bulb = curve([[bx - 18, by + 30], [bx - 34, by], [bx - 26, by - 30], [bx, by - 42], [bx + 26, by - 30], [bx + 34, by], [bx + 18, by + 30]], true, 3);
  sk.fill(bulb, "#FFF4C2", { dx: 0, dy: 0, wob: 0.3, seed: 32 }); sk.ink(bulb, { w: 7, seed: 33 });
  sk.ink(curve([[bx - 10, by + 14], [bx - 4, by - 10], [bx + 4, by - 10], [bx + 10, by + 14]]), { w: 4, color: C.orange, seed: 34, wob: 0.1 });
  const cap = rrect(bx - 16, by - 58, 32, 20, 4); sk.fill(cap, "#8A8F98", { dx: 0, dy: 0, wob: 0.3, seed: 35 }); sk.ink(cap, { w: 6, seed: 36 });
  for (const [a, i] of [[2.3, 0], [1.57, 1], [0.84, 2], [3.0, 3], [0.15, 4]]) sk.ink(dense([[bx + 62 * Math.cos(a), by + 62 * Math.sin(a)], [bx + 86 * Math.cos(a), by + 86 * Math.sin(a)]]), { w: 6, color: C.yellow, seed: 37 + i, wob: 0.2 });
  // 탁자와 아이: 전구 아래에서 책을 읽는다. 탁자 위에는 이제 켤 일이 줄어든 촛대
  table(sk, 270, 560, 560, 41);
  thin(sk, 0.85, () => {
    const dish = ell(470, 556, 34, 8); sk.fill(dish, "#C9A24A", { dx: 0, dy: 0, wob: 0.3, seed: 45 }); sk.ink(dish, { w: 6, seed: 46 });
    const cdl = rrect(458, 488, 24, 66, 5); sk.fill(cdl, "#FBF6E6", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 47 }); sk.ink(cdl, { w: 7, seed: 48 });
    sk.ink(dense([[470, 488], [472, 474]]), { w: 4, seed: 49, wob: 0.1 });
  });
  const P = pose({ elR: [70, -290], haR: [126, -330], elL: [-30, -280], haL: [60, -318], tilt: 0.1 });
  const gx = 170, gy = 690, gs = 0.66;
  drawFigure(sk, gx, gy, gs, P, { ...GIRL, name: "girl", hands: false });
  openBook(sk, gx + gs * 96, gy - gs * 330, 0.62, { color: "#B5483B", seed: 51, rot: 0.15 });
  handDot(sk, [gx + gs * 126, gy - gs * 330], C.skin, 52, 10);
  handDot(sk, [gx + gs * 60, gy - gs * 318], C.skin, 53, 10);
  return sk;
}

/* ---------- 4. 문명의 변화(산업): 증기가 공장을 돌리다 (1780년대, 영국) ---------- */
const WORKER = { hair: "short", hairColor: "#8A5A33", coat: { color: "#B9A57E", seam: "#8E7A55", len: 64 }, seed: 311 };
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  room(sk, "#F1E8D8", "#D8C6A2");
  thin(sk, 0.62, () => {
    // 위쪽 굴대: 증기 기관의 힘을 기계로 나른다(말풍선 자리를 비켜 오른쪽 위에)
    sk.ink(dense([[330, 112], [760, 112]]), { w: 11, seed: 11, color: "#5B5F66" });
    for (const [x, i] of [[400, 0], [500, 1], [700, 2]]) { const pl = circ(x, 112, 22, { over: 0.1, seed: 12 + i }); sk.fill(pl, "#8A8F98", { dx: 0, dy: 0, wob: 0.3, seed: 15 + i }); sk.ink(pl, { w: 8, seed: 18 + i }); }
    for (const [x, i] of [[400, 0], [500, 1]]) { sk.ink(dense([[x - 20, 118], [x - 20, 382]]), { w: 6, color: "#6B4A32", seed: 21 + i, wob: 0.3 }); sk.ink(dense([[x + 20, 118], [x + 20, 382]]), { w: 6, color: "#6B4A32", seed: 23 + i, wob: 0.3 }); }
    // 증기 기관(오른쪽): 벽돌 화덕 위의 둥근 보일러, 굴뚝, 누운 실린더
    const brick = rrect(784, 560, 166, 130, 8);
    sk.fill(brick, "#B5533C", { seed: 31, tex: true, texAng: 0.02 }); sk.ink(brick, { w: 10, seed: 32 });
    const mouth = rrect(828, 600, 70, 50, 10); sk.fill(mouth, C.orange, { dx: 0, dy: 0, wob: 0.4, seed: 33 }); sk.ink(mouth, { w: 8, seed: 34 });
    const boiler = rrect(786, 452, 164, 116, 50);
    sk.fill(boiler, "#7E8794", { seed: 35, tex: true, texAng: 0.02 }); sk.ink(boiler, { w: 10, seed: 36 });
    const chim = poly([[892, 456], [892, -10], [930, -10], [930, 456]], 4);
    sk.fill(chim, "#6B4A32", { seed: 37, tex: true, texAng: 1.5 }); sk.ink(chim, { w: 10, seed: 38 });
    const cyl = rrect(748, 488, 64, 46, 10); sk.fill(cyl, "#5B5F66", { seed: 39 }); sk.ink(cyl, { w: 9, seed: 40 });
    // 큰 바퀴(플라이휠): 피스톤 막대 → 연결대 → 굴대에서 떨어진 크랭크 핀
    const fw = circ(640, 470, 100, { over: 0.1, seed: 41 });
    sk.ink(fw, { w: 13, seed: 42 });
    for (let i = 0; i < 6; i++) { const a = i * PI / 3 + 0.2; sk.ink(dense([[640, 470], [640 + 96 * Math.cos(a), 470 + 96 * Math.sin(a)]]), { w: 8, seed: 43 + i, wob: 0.2 }); }
    const pin = [640 + 58 * Math.cos(0.5), 470 + 58 * Math.sin(0.5)];
    sk.ink(dense([[640, 470], pin]), { w: 14, seed: 49, color: "#5B5F66", wob: 0.1 });
    sk.dot(640, 470, 12, "#5B5F66");
    sk.ink(dense([[748, 511], [724, 511]]), { w: 8, seed: 50, color: "#5B5F66", wob: 0.1 });
    sk.ink(dense([[724, 511], pin]), { w: 9, seed: 51, color: "#3E4450", wob: 0.1 });
    sk.dot(pin[0], pin[1], 9, C.ink);
    sk.ink(dense([[680, 118], [620, 372]]), { w: 6, color: "#6B4A32", seed: 52, wob: 0.3 });
    sk.ink(dense([[720, 118], [660, 372]]), { w: 6, color: "#6B4A32", seed: 53, wob: 0.3 });
  });
  // 돌아가는 바퀴와 피어오르는 증기
  for (const [r, a0, j] of [[122, -0.6, 0], [122, 2.5, 1]]) sk.ink(arc(640, 470, r, a0, a0 + 0.9), { w: 5, color: C.gray, seed: 60 + j, wob: 0.2 });
  for (const [x, y, rr, i] of [[806, 430, 24, 0], [836, 404, 30, 1], [870, 420, 22, 2]]) { const c = circ(x, y, rr, { over: 0.2, seed: 64 + i, lump: 0.1 }); sk.fill(c, "#F4F6F8", { dx: 0, dy: 0, wob: 0.6, seed: 68 + i }); sk.ink(c, { w: 6, color: C.gray, seed: 72 + i, wob: 0.6 }); }
  // 방적기(가운데): 가는 실톳이 줄지어 돌며 실을 뽑는다
  thin(sk, 0.7, () => {
    const fr = rrect(176, 382, 360, 180, 10);
    sk.fill(fr, "#C99A62", { seed: 76, tex: true, texAng: 0.02 }); sk.ink(fr, { w: 10, seed: 77 });
    for (const [x, i] of [[206, 0], [506, 1]]) sk.ink(dense([[x, 562], [x, 690]]), { w: 11, seed: 78 + i });
    sk.ink(dense([[186, 404], [526, 404]]), { w: 6, seed: 79, color: "#8E6A3E", wob: 0.3 });
    for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) {
      const bx = 206 + i * 38, by = 470 + row * 70;
      sk.ink(dense([[bx, by - 56], [bx, by + 6]]), { w: 4, color: "#6B4A32", seed: 140 + row * 9 + i, wob: 0.1 });
      const cop = curve([[bx - 9, by], [bx - 7, by - 30], [bx, by - 44], [bx + 7, by - 30], [bx + 9, by]], true, 2);
      sk.fill(cop, "#F6EBD0", { dx: 0, dy: 0, wob: 0.3, seed: 80 + row * 9 + i }); sk.ink(cop, { w: 4.5, seed: 100 + row * 9 + i, wob: 0.3 });
      sk.ink(dense([[bx, by - 44], [bx + 4, 404]]), { w: 2.5, color: "#B9A57E", seed: 160 + row * 9 + i, wob: 0.1 });
    }
  });
  // 옷감 두루마리(옆에서 본 원통) 셋과 늘어진 천
  for (const [x, y, c, i] of [[248, 664, "#F4F0E6", 0], [360, 664, "#E9D9F0", 1], [304, 624, "#DCE9F5", 2]]) {
    const body = rrect(x - 50, y - 22, 100, 44, 8);
    sk.fill(body, c, { dx: 0.6, dy: 0.8, wob: 0.4, seed: 130 + i, tex: true, texAng: 0.02 }); sk.ink(body, { w: 6, seed: 134 + i });
    const end = ell(x - 50, y, 11, 22);
    sk.fill(end, mix(c, "#000000", 0.08), { dx: 0, dy: 0, wob: 0.3, seed: 138 + i }); sk.ink(end, { w: 5, seed: 141 + i });
    sk.ink(ell(x - 50, y, 5, 10), { w: 3, seed: 144 + i, wob: 0.1 });
  }
  const drape = curve([[410, 664], [450, 660], [470, 690], [430, 690]], true, 3);
  sk.fill(drape, "#E9D9F0", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 147 }); sk.ink(drape, { w: 6, seed: 148 });
  // 일꾼(왼쪽): 쏟아지는 실과 옷감을 가리킨다
  const P = pose({ elR: [76, -300], haR: [136, -330], elL: [-50, -262], haL: [-30, -204], tilt: 0.05 });
  drawFigure(sk, 96, 690, 0.62, P, { ...WORKER, name: "worker" });
  return sk;
}

/* ---------- 5. 문명의 변화(의학): 병을 미리 막는 백신 (1796년, 영국 버클리) ---------- */
// 제너: 흰 가루를 뿌린 짧은 가발(귀 옆 말림) + 짙은 푸른 외투
const JENNER = { hair: "short", hairColor: "#EDE8DF", fringe: 24, coat: { color: "#3E4E6A", buttons: C.gold, seam: "#2A3650" }, seed: 321, mini: true, face: "calm" };
const BOY = { hair: "short", hairColor: "#8A5A33", seed: 331 };
function wigRolls(sk, h, sd = 341) {
  sk.at(h.x, h.y, h.s, () => {
    for (const sg of [-1, 1]) for (const [cy, rr, i] of [[-4, 24, 0], [38, 21, 1]]) {
      const c = circ(sg * (96 + i * 2), cy, rr, { over: 0.25, seed: sd + i + (sg > 0 ? 4 : 0), lump: 0.05 });
      sk.fill(c, "#EDE8DF", { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 1 + i });
      sk.ink(c, { w: 9, wob: 0.8, seed: sd + 2 + i });
    }
  }, h.rot, h.m);
}
// 소(창밖). 원점 = 발 사이 바닥, 오른쪽을 본다
function cow(sk, x, y, s, sd = 351) {
  sk.at(x, y, s, () => {
    for (const [lx, i] of [[-70, 0], [-40, 1], [44, 2], [72, 3]]) sk.ink(dense([[lx, -60], [lx + 2, 0]]), { w: 12, seed: sd + i });
    const body = rrect(-100, -150, 210, 100, 40);
    sk.fill(body, C.white, { dx: 1, dy: 1.2, wob: 0.6, seed: sd + 5 });
    for (const [px, py, pr, i] of [[-40, -118, 26, 0], [30, -96, 20, 1], [70, -130, 16, 2]]) sk.fill(circ(px, py, pr, { over: 0.1, seed: sd + 6 + i, lump: 0.2 }), "#5B463A", { dx: 0, dy: 0, wob: 0.6, seed: sd + 9 + i });
    sk.ink(body, { w: 9, seed: sd + 12 });
    const head = rrect(100, -186, 70, 64, 22);
    sk.fill(head, C.white, { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 13 }); sk.ink(head, { w: 9, seed: sd + 14 });
    const muz = rrect(128, -146, 46, 30, 12); sk.fill(muz, "#F2C4B8", { dx: 0, dy: 0, wob: 0.3, seed: sd + 15 }); sk.ink(muz, { w: 7, seed: sd + 16 });
    for (const [hx, i] of [[108, 0], [158, 1]]) sk.ink(curve([[hx, -184], [hx - 6 + i * 12, -206], [hx + (i ? 16 : -14), -214]]), { w: 8, seed: sd + 17 + i });
    sk.ink(curve([[-100, -130], [-122, -100], [-118, -70]]), { w: 7, seed: sd + 19 });
  });
}
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  room(sk, "#F4EEE2", "#DCCBAA");
  // 창밖의 소와 풀밭(우두는 소가 앓는 가벼운 병)
  const WX = 686, WY = 72, WW = 240, WH = 200;
  const win = rrect(WX, WY, WW, WH, 10);
  sk.fill(win, "#DFF0FB", { dx: 0, dy: 0, wob: 0.4, seed: 21, tex: false });
  sk.fill(poly([[WX + 4, WY + 136], [WX + WW - 4, WY + 128], [WX + WW - 4, WY + WH - 4], [WX + 4, WY + WH - 4]], 4), "#B9DE9B", { dx: 0, dy: 0, wob: 0.5, seed: 22 });
  cow(sk, WX + 104, WY + 184, 0.52, 351);
  thin(sk, 0.8, () => { sk.ink(win, { w: 11, seed: 23 }); sk.ink(dense([[WX + WW / 2, WY], [WX + WW / 2, WY + WH]]), { w: 8, seed: 24 }); });
  // 제너: 소년의 팔에 우두 고름을 살짝 넣는다
  const P = pose({ elR: [92, -300], haR: [170, -268], elL: [-50, -262], haL: [-24, -210], tilt: 0.08 });
  const fx = 352, fy = 690, fs = 0.8;
  drawFigure(sk, fx, fy, fs, P, { ...JENNER, name: "jenner", face: "calm", look: 0.6 });
  wigRolls(sk, headAt(fx, fy, fs, P));
  const hand = [fx + fs * 170, fy - fs * 268];
  // 소년(여덟 살쯤): 소매를 걷은 팔을 내민다
  const B = pose({ elL: [-62, -300], haL: [-118, -300], elR: [44, -258], haR: [60, -196], tilt: -0.06 });
  const bx = 540, bs = 0.6;
  drawFigure(sk, bx, fy, bs, B, { ...BOY, name: "boy", coat: { color: C.white, seam: "#9AA3AE", len: 30 } });
  const arm = [bx - bs * 31, fy - bs * 316];
  sk.dot(arm[0], arm[1], 5.5, "#D2554A");
  sk.ink(dense([[hand[0] + 6, hand[1] + 4], [arm[0] - 4, arm[1] - 6]]), { w: 5, color: "#8A8F98", seed: 361, wob: 0.1 });
  return sk;
}

/* ---------- 6. 문명의 변화(의학): 감염을 치료하는 항생제 (1928년, 영국 런던) ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  room(sk, "#EEF2F4", "#D5DCE2");
  table(sk, 40, 900, 566, 31, 690, "#B8C1CC");
  // 휴가 동안 쌓아 둔 배양 접시 더미
  for (let i = 0; i < 5; i++) {
    const y = 560 - i * 22;
    const d = rrect(70 + (i % 2) * 8, y - 18, 150, 18, 7);
    sk.fill(d, "#EAF3F6", { dx: 0, dy: 0, wob: 0.3, seed: 41 + i, alpha: 0.95 }); sk.ink(d, { w: 6, seed: 46 + i, wob: 0.3 });
  }
  // 플레밍: 접시 하나를 들어 올려 본다
  const up = pose({ elR: [74, -316], haR: [118, -400], elL: [-56, -262], haL: [-22, -222], tilt: 0.08 });
  const fx = 500, fy = 690, fs = 0.8;
  drawFigure(sk, fx, fy, fs, up, { ...FLEMING, name: "fleming", face: "curious", look: 0.6, hands: "L" });
  const hx = fx + fs * 118, hy = fy - fs * 400;
  thin(sk, 0.7, () => petri(sk, hx + 24, hy - 22, 36, { seed: 1001, ring: false, w: 7 }));
  handDot(sk, [hx, hy + 6], C.skin, 61, 12);
  // 크게 본 접시: 푸른곰팡이 둘레만 세균(노란 점)이 녹아 없어졌다
  sk.ink(dense([[hx + 50, hy - 48], [700, 168]]), { w: 5, color: C.gray, dash: [12, 10], seed: 62, wob: 0.3 });
  sk.ink(dense([[hx + 56, hy - 6], [690, 360]]), { w: 5, color: C.gray, dash: [12, 10], seed: 63, wob: 0.3 });
  petri(sk, 812, 270, 140, { seed: 1001 });
  return sk;
}

/* ---------- 7. 문명의 변화(통신): 바다 건너 그 순간 그대로 (1962년 7월, 대서양 위) ---------- */
// 텔스타: 태양 전지판을 붙인 공 모양 위성. 원점 = 가운데
function telstar(sk, x, y, s, sd = 401) {
  sk.at(x, y, s, () => {
    sk.ink(dense([[0, -54], [0, -84]]), { w: 6, seed: sd, wob: 0.2 });
    const b = circ(0, 0, 54, { over: 0.15, seed: sd + 1 });
    sk.fill(b, "#C9D3E2", { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 });
    for (let i = -2; i <= 2; i++) sk.ink(curve([[-50, i * 18], [0, i * 18 + 6], [50, i * 18]]), { w: 3.5, color: "#5C6F92", seed: sd + 3 + i + 2, wob: 0.1 });
    for (let i = -2; i <= 2; i++) sk.ink(curve([[i * 20, -50], [i * 20 + 6, 0], [i * 20, 50]]), { w: 3.5, color: "#5C6F92", seed: sd + 9 + i + 2, wob: 0.1 });
    sk.ink(ell(0, 0, 64, 14), { w: 6, seed: sd + 15, wob: 0.2 });
    sk.ink(b, { w: 8, seed: sd + 16 });
  });
}
// 접시 안테나(옆에서 본 모습): 기둥 위의 오목한 포물면 접시 + 초점의 수신기. (x, y) = 기둥 바닥 가운데
//   dir = 1 이면 오른쪽 위, -1 이면 왼쪽 위를 본다
function dish(sk, x, y, s, dir = 1, sd = 481) {
  thin(sk, 0.5, () => sk.at(x, y, s, () => {
    const base = poly([[-46, 0], [46, 0], [30, -26], [-30, -26]], 4);
    sk.fill(base, "#9AA3AE", { seed: sd, dx: 0.6, dy: 0.8 }); sk.ink(base, { w: 9, seed: sd + 1 });
    sk.ink(dense([[0, -26], [0, -120]]), { w: 14, seed: sd + 2, wob: 0.2 });
    sk.save(); sk.translate(0, -126); sk.rotate(dir * 0.62);
    // 앞면 y = -a x^2 (위로 열린 접시), 뒷면은 조금 아래
    const a = 46 / 8100, front = [], back = [];
    for (let k = -90; k <= 90; k += 6) { front.push([k, -a * k * k]); back.push([k, -a * k * k + 16 - 0.0012 * k * k]); }
    const shape = [...front, ...back.reverse()];
    shape.push(shape[0]);
    sk.fill(shape, "#F1F4F7", { dx: 0.8, dy: 1, wob: 0.4, seed: sd + 3 });
    sk.ink(shape, { w: 9, seed: sd + 4, wob: 0.5 });
    for (const sg of [-1, 1]) sk.ink(dense([[sg * 70, -a * 4900], [0, -60]]), { w: 5, seed: sd + 5 + (sg > 0 ? 1 : 0), wob: 0.2 });
    const feed = rrect(-10, -76, 20, 20, 5); sk.fill(feed, "#5B5F66", { dx: 0, dy: 0, wob: 0.3, seed: sd + 7 }); sk.ink(feed, { w: 6, seed: sd + 8 });
    sk.restore();
  }));
}
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  sk.fill(poly([[-10, -10], [970, -10], [970, 520], [-10, 520]], 8), "#DDF0FB", { dx: 0, dy: 0, wob: 0, seed: 3, tex: false });
  // 대서양과 양쪽 땅
  sk.fill(poly([[-10, 500], [970, 500], [970, 730], [-10, 730]], 8), C.sea, { dx: 0, dy: 0, wob: 0, seed: 4, tex: true, texAng: 0.02 });
  for (let i = 0; i < 3; i++) { const wx = 380 + i * 80, wy = 570 + (i % 2) * 54; sk.ink(curve([[wx, wy], [wx + 20, wy - 8], [wx + 40, wy], [wx + 60, wy - 8]]), { w: 6, color: C.white, seed: 5 + i, wob: 0.3 }); }
  thin(sk, 0.6, () => {
    for (const [pts, i] of [[[[-10, 470], [150, 452], [330, 470], [360, 730], [-10, 730]], 0], [[[644, 476], [800, 456], [970, 466], [970, 730], [610, 730]], 1]]) {
      const land = curve(pts, true, 4);
      sk.fill(land, "#B9DE9B", { dx: 0, dy: 0, wob: 0.5, seed: 11 + i, tex: true, texAng: 0.02 });
      sk.ink(land, { w: 9, seed: 13 + i });
    }
  });
  // 미국 쪽: 손 흔드는 사람을 찍는 카메라와 하늘로 쏘아 올리는 접시 안테나
  const wave = pose({ elL: [-70, -330], haL: [-96, -410], elR: [44, -258], haR: [58, -196], tilt: 0.04 });
  drawFigure(sk, 84, 690, 0.44, wave, { hair: "short", hairColor: "#3F322C", seed: 431 });
  thin(sk, 0.62, () => {
    for (const [dx, i] of [[-30, 0], [0, 1], [30, 2]]) sk.ink(dense([[226, 560], [226 + dx, 690]]), { w: 9, seed: 421 + i });
    const cam = rrect(190, 500, 90, 62, 10); sk.fill(cam, "#5B5F66", { seed: 424, tex: true }); sk.ink(cam, { w: 9, seed: 425 });
    const lens = rrect(160, 514, 34, 34, 6); sk.fill(lens, "#39424E", { dx: 0, dy: 0, wob: 0.3, seed: 426 }); sk.ink(lens, { w: 8, seed: 427 });
  });
  dish(sk, 318, 560, 0.8, 1, 481);
  // 텔스타와 신호
  telstar(sk, 480, 168, 0.9);
  arrow(sk, [[350, 396], [436, 210]], { w: 6, color: C.blue, dash: [14, 12], seed: 441, head: 18, wob: 0.2 });
  arrow(sk, [[524, 206], [628, 404]], { w: 6, color: C.blue, dash: [14, 12], seed: 443, head: 18, wob: 0.2 });
  // 유럽 쪽: 받는 접시 안테나, 텔레비전 앞의 사람(화면 속에 바다 건너의 손 흔드는 사람)
  dish(sk, 652, 560, 0.74, -1, 491);
  thin(sk, 0.62, () => {
    const tv = rrect(728, 488, 130, 106, 14);
    sk.fill(tv, "#8A6A44", { seed: 451, tex: true }); sk.ink(tv, { w: 9, seed: 452 });
    const scr = rrect(742, 502, 86, 78, 10); sk.fill(scr, "#BFE3F5", { dx: 0, dy: 0, wob: 0.3, seed: 453 }); sk.ink(scr, { w: 6, seed: 454 });
    sk.ink(dense([[752, 594], [746, 690]]), { w: 10, seed: 465 }); sk.ink(dense([[834, 594], [840, 690]]), { w: 10, seed: 466 });
    for (const [sg, i] of [[-1, 0], [1, 1]]) sk.ink(dense([[793, 488], [793 + sg * 32, 446]]), { w: 5, seed: 463 + i, wob: 0.2 });
  });
  sk.at(785, 574, 0.15, () => { sk.ink(dense([[0, -150], [0, -64]]), { w: 18, seed: 455 }); sk.ink(curve([[0, -138], [40, -160], [62, -220]]), { w: 18, seed: 456 }); sk.ink(curve([[0, -138], [-40, -150], [-58, -110]]), { w: 18, seed: 457 }); sk.ink(dense([[0, -64], [-26, 0]]), { w: 18, seed: 458 }); sk.ink(dense([[0, -64], [26, 0]]), { w: 18, seed: 459 }); const hd = circ(0, -196, 44, { over: 0.2, seed: 460 }); sk.fill(hd, C.skin, { dx: 0, dy: 0, wob: 0.5, seed: 461 }); sk.ink(hd, { w: 18, seed: 462 }); });
  const look = pose({ elR: [66, -290], haR: [112, -300], elL: [-50, -262], haL: [-30, -204], tilt: 0.05 });
  drawFigure(sk, 884, 690, 0.46, look, { hair: "bob", hairColor: "#8A5A33", seed: 471, name: "viewer", mirror: true });
  return sk;
}

/* ---------- 8. 문명의 변화(예술): 예술까지 바꾼 과학 (오늘날) ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  room(sk, "#F7F5F0", "#E2DCCF");
  // 삼각대 위의 옛 사진기(1839년 사진의 시작을 떠올리게)
  thin(sk, 0.85, () => {
    for (const [dx, i] of [[-50, 0], [0, 1], [50, 2]]) sk.ink(dense([[100, 470], [100 + dx, 690]]), { w: 10, seed: 21 + i });
    const box = rrect(40, 382, 120, 90, 12);
    sk.fill(box, C.woodDark, { seed: 24, tex: true }); sk.ink(box, { w: 10, seed: 25 });
    const ln = circ(160, 427, 24, { over: 0.2, seed: 26 });
    sk.fill(ln, "#39424E", { dx: 0, dy: 0, wob: 0.4, seed: 27 }); sk.ink(ln, { w: 8, seed: 28 });
  });
  // 가상 현실 속 붓질: 공중에 그린 빛나는 선
  const strokes = [
    [[[560, 360], [630, 290], [720, 300], [750, 380], [700, 430]], "#3FA7E0", 0],
    [[[620, 214], [680, 166], [750, 164], [800, 118]], "#12A594", 2],
  ];
  for (const [pts, col, i] of strokes) { sk.ink(curve(pts), { w: 26, color: mix(col, "#ffffff", 0.55), seed: 31 + i, wob: 0.3 }); sk.ink(curve(pts), { w: 13, color: col, seed: 34 + i, wob: 0.3 }); }
  heart(sk, 744, 420, 1.2, { seed: 41 });
  for (const [x, y, r, c, i] of [[540, 190, 16, C.yellow, 0], [812, 214, 14, C.teal, 1], [600, 480, 12, C.orange, 2]]) sparkle(sk, x, y, r, { seed: 42 + i, color: c });
  // 학생: 가상 현실 기기를 쓰고 손에 든 조종기로 그린다
  const P = pose({ elL: [-76, -330], haL: [-118, -404], elR: [60, -270], haR: [90, -224], tilt: -0.04 });
  const fx = 340, fy = 690, fs = 0.66;
  drawFigure(sk, fx, fy, fs, P, { ...STUDENT, name: "student", hands: "R", mirror: true });
  const h = headAt(fx, fy, fs, P, true);
  sk.at(h.x, h.y, h.s, () => {
    const visor = rrect(-96, -28, 192, 76, 26);
    sk.fill(visor, "#39424E", { seed: 51, tex: true }); sk.ink(visor, { w: 11, seed: 52 });
    sk.ink(dense([[-56, 8], [56, 8]]), { w: 9, color: C.teal, seed: 53, wob: 0.3 });
  }, h.rot);
  const hc = [fx + fs * 118, fy - fs * 404];
  // 지금 긋고 있는 선: 조종기 끝에서 시작한다
  sk.ink(curve([[hc[0] + 4, hc[1] - 52], [hc[0] + 70, hc[1] - 96], [hc[0] + 170, hc[1] - 80], [hc[0] + 250, hc[1] - 150]]), { w: 26, color: mix("#F08A2E", "#ffffff", 0.55), seed: 57, wob: 0.3 });
  sk.ink(curve([[hc[0] + 4, hc[1] - 52], [hc[0] + 70, hc[1] - 96], [hc[0] + 170, hc[1] - 80], [hc[0] + 250, hc[1] - 150]]), { w: 13, color: "#F08A2E", seed: 58, wob: 0.3 });
  const ctl = rrect(hc[0] - 12, hc[1] - 44, 24, 56, 8);
  sk.fill(ctl, "#39424E", { dx: 0, dy: 0, wob: 0.3, seed: 54 }); sk.ink(ctl, { w: 7, seed: 55 });
  sk.glow(hc[0], hc[1] - 50, 34, "#FFE07A", 0.8, 0.2);
  handDot(sk, hc, C.skin, 56, 11);
  // 쌤: 지켜보며 엄지를 든다
  const T = pose({ elL: [-70, -300], haL: [-96, -350], elR: [44, -258], haR: [58, -196], tilt: -0.04 });
  drawFigure(sk, 872, 690, 0.58, T, { ...TEACHER, name: "teacher" });
  return sk;
}

export const META = {
  title: "과학이 바꾼 세상,<br><em>시간 여행</em>",
  lead: "자석으로 전기를 일으킨 과학자부터 가상 현실로 그림을 그리는 오늘까지, 과학이 세상을 바꾼 순간들을 찾아가 봐요.",
  narrator: "저는 <b>스틱맨 쌤</b>이에요. 과학의 <b>원리</b>가 <b>기술</b>이 되고, 기술이 <b>기기</b>가 되어 세상을 바꾼 순간들로 함께 시간 여행을 떠나요!",
  cta: "시간순으로 놓아 보기",
};

const BUBBLES = [
  [{ who: "faraday", text: "움직일 때만<br>바늘이 흔들려!" }],
  [{ who: "mech", text: "돌리는 동안<br>계속 켜져!" }],
  [{ who: "girl", text: "밤에도<br>책이 잘 보여!" }],
  [{ who: "worker", text: "한꺼번에<br>이렇게나!" }],
  [{ who: "boy", text: "따끔해요!" }],
  [{ who: "fleming", text: "곰팡이 둘레만<br>깨끗하네?" }],
  [{ who: "viewer", text: "바로 보여!" }],
  [{ who: "student", text: "그림 속에<br>들어왔어!" }],
];

const P = [
  {
    fn: p1, when: "1831년, 영국 런던", stage: "원리의 발견", title: "자석을 움직이면 전기가",
    caption: "영국의 과학자 <b>마이클 패러데이</b>는 구리 선을 감은 코일 속으로 막대자석을 넣었다 뺐다 해 보았어요. 그러자 코일에 이어 둔 계기의 바늘이 움직였다가, 자석을 멈추면 제자리로 돌아왔지요. 자석이 <b>움직이는 동안</b> 코일에 전기가 흐른다는 <b>원리</b>를 찾아낸 거예요.",
  },
  {
    fn: p2, when: "1870년대, 유럽", stage: "기술의 발달", title: "돌리는 동안 쉬지 않고",
    caption: "패러데이의 발견 뒤, 사람들은 자석 사이에서 코일을 빠르게 돌려 전기를 <b>끊임없이</b> 만드는 기술을 갈고닦았어요. 1870년대에는 증기 기관으로 돌려 많은 전기를 쉬지 않고 만드는 <b>발전기</b>가 공장에서 쓰이기 시작했지요.",
    term: { name: "발전기", def: "자석 사이에서 코일을 돌려 <b>전기를 만들어 내는</b> 기계예요. 오늘날 발전소에서도 물이나 증기, 바람의 힘으로 커다란 발전기를 돌리죠." },
  },
  {
    fn: p3, when: "1880년대, 미국 뉴욕", stage: "기기의 발명과 쓰임", title: "밤을 밝힌 전구",
    caption: "1879년 미국의 <b>에디슨</b>은 오래 빛나는 <b>전구</b>를 선보였고, 1882년 뉴욕에는 발전기로 만든 전기를 전선으로 여러 건물에 나누어 보내는 <b>발전소</b>가 문을 열었어요. 이제 밤에도 집과 거리를 환하게 밝힐 수 있게 되었지요.",
  },
  {
    fn: p4, when: "1780년대, 영국", stage: "문명의 변화: 산업", title: "증기가 공장을 돌리다",
    caption: "<b>제임스 와트</b>가 개량한 <b>증기 기관</b>은 뜨거운 수증기의 힘으로 공장의 기계를 힘차게 돌렸어요. 공장에서 물건을 한꺼번에 많이 만드는 <b>대량 생산</b>이 시작되었고, 증기 기관차와 증기선이 물건을 먼 곳까지 실어 날랐지요. 이 거대한 변화를 <b>산업 혁명</b>이라고 해요.",
    term: { name: "증기 기관", def: "물을 끓여 얻은 <b>수증기의 힘</b>으로 피스톤을 밀어 바퀴를 돌리는 기계예요. 1712년 뉴커먼의 기관이 먼저 나왔고, 와트가 이를 개량해 연료를 훨씬 덜 쓰게 했죠." },
  },
  {
    fn: p5, when: "1796년, 영국 버클리", stage: "문명의 변화: 의학", title: "병을 미리 막는 백신",
    caption: "소의 가벼운 병인 <b>우두</b>를 앓고 나면 무서운 천연두에 잘 걸리지 않는다는 이야기가 있었어요. 영국의 의사 <b>에드워드 제너</b>는 소년의 팔에 우두 고름을 넣는 실험으로 천연두를 막을 수 있다는 것을 증명했지요. 병에 걸리기 전에 <b>미리 막는</b> 백신의 시작이에요.",
    term: { name: "백신", def: "병에 걸리기 전에 미리 맞아 감염을 막는 약이에요. 백신이란 이름은 '소'를 뜻하는 라틴어에서 왔죠." },
  },
  {
    fn: p6, when: "1928년, 영국 런던", stage: "문명의 변화: 의학", title: "감염을 치료하는 항생제",
    caption: "<b>알렉산더 플레밍</b>은 세균을 기르던 접시에서 푸른곰팡이 둘레에만 세균이 녹아 사라진 것을 발견했어요. 이 곰팡이에서 얻은 <b>페니실린</b>은 세균에 <b>감염된 환자</b>를 살려 내는 최초의 항생제가 되었답니다.",
    term: { name: "항생제", def: "세균에 감염됐을 때 세균을 죽이거나 자라지 못하게 해 병을 고치는 약이에요. 백신, 깨끗한 물, 넉넉한 먹거리와 함께 인류의 <b>평균 수명</b>을 크게 늘렸죠(세계 평균 1900년 32세, 2023년 73세)." },
  },
  {
    fn: p7, when: "1962년 7월, 대서양 위", stage: "문명의 변화: 통신", title: "바다 건너 그 순간 그대로",
    caption: "우주에 <b>인공위성</b>이 떠오르면서 미국의 텔레비전 방송이 대서양 건너 유럽에 그 순간 그대로 전해졌어요. 뒤이어 컴퓨터들을 서로 연결한 <b>인터넷</b>까지 등장했지요. 정보 통신 기술 덕분에 이제는 지구 반대편 소식도 <b>실시간</b>으로 주고받아요.",
    term: { name: "정보 통신", def: "전기와 전파로 정보를 <b>실시간으로 주고받는</b> 기술이에요. 대륙 사이의 인터넷 자료는 대부분 바다 밑에 깐 통신선으로 오가죠." },
  },
  {
    fn: p8, when: "오늘날, 우리 곁", stage: "문명의 변화: 예술", title: "예술까지 바꾼 과학",
    caption: "과학은 예술의 모습도 넓혀 놓았어요. 빛으로 순간을 붙잡는 <b>사진</b>, 전자 악기로 만드는 음악, 건물 벽에 빛으로 그림을 그리는 <b>미디어 아트</b>가 생겼고, 이제는 <b>가상 현실</b> 공간에 직접 그림을 그려요. 이처럼 <b>과학 원리의 발견</b>은 새로운 <b>기술</b>과 <b>기기</b>를 낳아 우리 <b>문명</b>을 바꾼답니다.",
    term: { name: "과학과 문명", def: "<b>원리 발견 → 기술 발달 → 기기 발명 → 문명의 변화</b>로 이어지는 흐름이에요. 산업, 의학, 통신, 예술 등 사회 전반을 바꾸죠." },
  },
];

export function panels() {
  return P.map((p, i) => ({ sk: p.fn(), bubbles: BUBBLES[i], when: p.when, whenPos: p.whenPos, stage: p.stage, title: p.title, caption: p.caption, term: p.term }));
}
