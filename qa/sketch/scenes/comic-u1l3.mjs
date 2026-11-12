// 중1 과학 u1l3 도입 만화 v2(배선 전 미리보기): 과학이 바꾼 세상, 시간 여행. 8컷.
// 조사와 콘티: qa/sketch/research/u1l3.md. 미리보기: node qa/sketch/mock-comic.mjs comic-u1l3 <출력 PNG> 4
//   렌즈 사슬을 세 컷으로 끝까지 따라간다: 1 원리(11세기 전반 카이로, 알하이삼의 굴절 연구) → 2 기술(1280년대 이탈리아, 안경)
//   → 3 기기(1663년 런던, 훅의 현미경과 코르크). 이어서 문명의 변화 넷을 시간순으로:
//   4 산업(1780년대 영국, 증기 기관이 돌린 방적 공장) → 5 의학(1796년 버클리, 제너의 우두 접종: 미리 막기)
//   → 6 의학(1928년 런던, 플레밍의 접시: 감염 뒤 치료) → 7 통신(1962년 텔스타 생방송) → 8 예술(오늘날 가상 현실 그림, 정리)
// 인물: 이름 있는 과학자(알하이삼, 훅, 제너, 플레밍)는 작은 얼굴, 수도사와 장인, 일꾼, 아이, 시청자, 쌤과 학생은 얼굴 없이.
// 알하이삼의 초상은 전해지지 않아 그 시대 카이로 학자의 터번과 긴 옷으로만 그린다. 그림 안에 글자와 숫자는 없다.
import { Sk, C, curve, dense, circ, ell, arc, poly, rrect, mix, squiggle, sparkle, emark, arrow, heart } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, R, TEACHER, STUDENT, HOOKE, FLEMING } from "../lib/figure.mjs";
import { microscope, cellsView, petri, openBook, sun } from "../lib/props.mjs";

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
// 아치 창. (x, y) = 왼쪽 위, 안쪽은 inner(그림 함수)가 채운다
function archWindow(sk, x, y, w, h, sd, inner) {
  const top = y + w / 2;
  const shape = [...curve([[x, y + h], [x, top]], false, 4), ...arc(x + w / 2, top, w / 2, PI, 2 * PI), ...curve([[x + w, top], [x + w, y + h]], false, 4)];
  shape.push(shape[0]);
  sk.fill(shape, "#DFF0FB", { dx: 0, dy: 0, wob: 0.4, seed: sd, tex: false });
  if (inner) inner();
  thin(sk, 0.8, () => sk.ink(shape, { w: 11, seed: sd + 1 }));
}

/* ---------- 1. 원리의 발견: 빛은 꺾여서 나아가요 (11세기 전반, 이집트 카이로) ---------- */
// 알하이삼: 흰 터번 + 검은 턱수염 + 긴 옷. 터번은 머리 위에 따로 얹는다
const HAYTHAM = { hair: "bald", beard: "#3E3029", coat: { color: "#5E8A76", seam: "#3E5E50", len: 150 }, seed: 211, mini: true, face: "curious" };
function turban(sk, h, sd = 231) {
  sk.at(h.x, h.y, h.s, () => {
    const mass = curve([[-114, -6], [-124, -70], [-96, -136], [-30, -166], [30, -166], [96, -136], [124, -70], [114, -6], [64, -30], [0, -36], [-64, -30]], true, 4);
    sk.fill(mass, "#F3EEE2", { dx: 1.5, dy: 2, wob: 1, seed: sd, tex: true, texAng: -0.3 });
    for (const [a, b, i] of [[-48, -88, 0], [-86, -128, 1]]) sk.ink(curve([[-108, a + 6], [-40, b + 14], [40, b + 4], [104, a - 6]]), { w: 6, color: "#C9BFA8", seed: sd + 2 + i, wob: 0.5 });
    sk.ink(mass, { w: 11, seed: sd + 1, wob: 1 });
  }, h.rot, h.m);
}
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  room(sk, "#F6EAD3", "#E6CFA2");
  // 아치 창 너머의 해: 햇빛 한 줄기가 들어온다
  archWindow(sk, 74, 128, 170, 200, 11, () => sun(sk, 158, 214, 30, { seed: 701 }));
  table(sk, 236, 704, 566, 31);
  // 굴절 장치: 눈금 원판을 물그릇에 반쯤 담갔다(물은 원판 가운데 높이까지)
  const cx = 470, cy = 430, r = 112;
  const disc = circ(cx, cy, r, { over: 0.12, seed: 41 });
  sk.fill(disc, "#E8C77E", { dx: 0, dy: 0, wob: 0.5, seed: 42, tex: true, texAng: 0.6 });
  for (let i = 0; i < 36; i++) { const a = i * PI / 18, r0 = i % 3 ? r - 14 : r - 26; sk.ink(dense([[cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)], [cx + (r - 4) * Math.cos(a), cy + (r - 4) * Math.sin(a)]], 2), { w: i % 3 ? 3.5 : 5, color: "#8A6A2A", seed: 43 + i, wob: 0.1 }); }
  thin(sk, 0.8, () => sk.ink(disc, { w: 10, seed: 80 }));
  sk.dot(cx, cy, 6, "#8A6A2A");
  // 맑은 물그릇(유리): 원판의 아래쪽 반이 물에 잠겼다(물을 먼저 칠하고 빛줄기를 그 위에)
  const tank = rrect(338, 418, 264, 150, 14);
  sk.fill(rrect(342, cy, 256, 136, 10), "#9FD3EF", { dx: 0, dy: 0, wob: 0.4, seed: 85, alpha: 0.45 });
  sk.ink(curve([[344, cy], [400, cy - 5], [470, cy], [540, cy + 5], [598, cy]]), { w: 5, color: C.seaDeep, seed: 86, wob: 0.2 });
  // 빛: 창에서 원판 가장자리 구멍을 지나 가운데로, 물에 들어가며 꺾인다(입사 45도 → 물속 32도)
  const a1 = 0.785, a2 = 0.56;
  const hole = [cx - r * Math.sin(a1), cy - r * Math.cos(a1)], out = [cx + r * Math.sin(a2), cy + r * Math.cos(a2)];
  sk.ink(dense([[214, 184], hole]), { w: 9, color: C.yellow, seed: 81, wob: 0.3, alpha: 0.85 });
  sk.ink(dense([hole, [cx, cy]]), { w: 10, color: "#F2B21B", seed: 82, wob: 0.2 });
  sk.ink(dense([[cx, cy], [cx + r * Math.sin(a1), cy + r * Math.cos(a1)]]), { w: 5, color: "#8A8F98", dash: [12, 10], seed: 83, wob: 0 });
  arrow(sk, [[cx, cy], out], { w: 10, color: "#F2B21B", straight: true, seed: 84, head: 22, wob: 0.2 });
  sk.dot(hole[0], hole[1], 9, C.ink);
  thin(sk, 0.75, () => sk.ink(tank, { w: 10, seed: 87 }));
  sk.ink(dense([[352, 436], [352, 548]]), { w: 5, color: C.white, seed: 88, wob: 0.2, alpha: 0.9 });
  // 알하이삼: 원판을 가리킨다
  const P = pose({ elL: [-84, -312], haL: [-150, -324], elR: [44, -262], haR: [60, -200], tilt: -0.05 });
  const fx = 800, fy = 690, fs = 0.76;
  drawFigure(sk, fx, fy, fs, P, { ...HAYTHAM, name: "haytham", look: -0.6 });
  turban(sk, headAt(fx, fy, fs, P));
  return sk;
}

/* ---------- 2. 기술의 발달: 유리를 갈아 만든 렌즈 (1280년대, 이탈리아) ---------- */
const FRIAR = { hair: "bald", beard: "#F1EDE4", coat: { color: "#6B4E3A", seam: "#4A3526", len: 160 }, seed: 251 };
const CRAFT = { hair: "short", hairColor: "#5B463A", coat: { color: "#C9B086", seam: "#8E7A55", len: 70 }, seed: 261 };
// 리벳 안경: 볼록 렌즈 두 알, 손잡이 끝을 못 하나로 이었다. (x, y) = 두 렌즈 가운데
function rivetGlasses(sk, x, y, s, sd = 271) {
  sk.at(x, y, s, () => {
    for (const [sg, i] of [[-1, 0], [1, 1]]) {
      sk.ink(curve([[sg * 30, 22], [sg * 14, 56], [0, 84]]), { w: 9, color: "#7A5A33", seed: sd + i, wob: 0.3 });
      const l = circ(sg * 40, 0, 30, { over: 0.15, seed: sd + 2 + i });
      sk.fill(l, "#D8F0FB", { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 + i, alpha: 0.85 });
      sk.ink(l, { w: 9, color: "#7A5A33", seed: sd + 6 + i, wob: 0.4 });
      sk.ink(curve([[sg * 40 - 14, -12], [sg * 40 - 4, -18], [sg * 40 + 6, -16]]), { w: 4, color: C.white, seed: sd + 8 + i, wob: 0.1 });
    }
    sk.dot(0, 84, 7, "#5A3E22");
  });
}
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  room(sk, "#EFE7DA", "#D9CBB0");
  // 돌벽의 줄눈(위쪽만 가볍게)
  for (const [y, x0, i] of [[170, 520, 0], [250, 600, 1], [330, 520, 2]]) sk.ink(dense([[x0, y], [x0 + 300, y]]), { w: 4, color: "#D8CDBA", seed: 11 + i, wob: 0.6 });
  // 장인의 작업대(왼쪽): 렌즈를 가는 둥근 숫돌
  table(sk, 40, 330, 520, 31, 690, C.woodDark);
  const wheel = circ(150, 470, 52, { over: 0.15, seed: 41 });
  sk.fill(wheel, "#B8B3A8", { dx: 0, dy: 0, wob: 0.4, seed: 42, tex: true, texAng: 1.2 }); sk.ink(wheel, { w: 9, seed: 43 });
  sk.dot(150, 470, 7);
  thin(sk, 0.85, () => { sk.ink(dense([[150, 470], [150, 520]]), { w: 9, seed: 44 }); });
  for (const [x, i] of [[246, 0], [290, 1]]) { const l = ell(x, 510, 18, 8); sk.fill(l, "#D8F0FB", { dx: 0, dy: 0, wob: 0.3, seed: 45 + i }); sk.ink(l, { w: 6, seed: 47 + i, wob: 0.3 }); }
  // 장인: 갓 만든 안경을 건넨다
  const give = pose({ elR: [84, -300], haR: [150, -316], elL: [-44, -258], haL: [-60, -196], tilt: 0.05 });
  drawFigure(sk, 380, 690, 0.66, give, { ...CRAFT });
  // 늙은 수도사: 안경을 눈앞에 대고 책을 읽는다
  const read = pose({ elL: [-62, -300], haL: [-5, -348], elR: [62, -262], haR: [100, -250], tilt: -0.08 });
  const fx = 640, fy = 690, fs = 0.8;
  drawFigure(sk, fx, fy, fs, read, { ...FRIAR, name: "friar", hands: "R" });
  const h = headAt(fx, fy, fs, read);
  rivetGlasses(sk, h.x - 4, h.y + 6 * fs, 0.78, 271);
  handDot(sk, [h.x - 4, h.y + 6 * fs + 84 * 0.78], C.skin, 281, 11);
  openBook(sk, fx + fs * 150, fy - fs * 232, 0.86, { color: "#8A5A33", seed: 291, rot: -0.1 });
  sparkle(sk, h.x - 104, h.y - 70, 15, { seed: 301 });
  sparkle(sk, h.x + 92, h.y - 92, 12, { seed: 303 });
  return sk;
}

/* ---------- 3. 기기의 발명: 현미경 속 작은 방들 (1663년, 영국 런던) ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  room(sk, "#F4ECDD", "#E2CDA6");
  table(sk, 300, 860, 560, 31);
  thin(sk, 0.78, () => microscope(sk, 452, 560, 1.12, { seed: 881 }));
  // 밤에 쓴 조명: 작은 등잔 + 맑은 소금물을 채운 유리공으로 빛을 모았다
  const lx = 660, ly = 560;
  const lamp = curve([[lx - 30, ly], [lx - 26, ly - 26], [lx + 22, ly - 30], [lx + 34, ly - 22], [lx + 30, ly]], true, 3);
  sk.fill(lamp, "#C9A36A", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 51 }); sk.ink(lamp, { w: 8, seed: 52 });
  sk.fill(curve([[lx + 26, ly - 30], [lx + 36, ly - 52], [lx + 30, ly - 66], [lx + 20, ly - 48]], true, 2), C.orange, { dx: 0, dy: 0, wob: 0.3, seed: 53 });
  sk.glow(lx + 30, ly - 50, 46, "#FFE7A3", 0.6, 0.1);
  thin(sk, 0.85, () => { sk.ink(dense([[560, 560], [560, 484]]), { w: 9, seed: 54 }); });
  const globe = circ(560, 446, 40, { over: 0.15, seed: 55 });
  sk.fill(globe, "#CFEAF8", { dx: 0, dy: 0, wob: 0.4, seed: 56, alpha: 0.9 }); sk.ink(globe, { w: 8, seed: 57 });
  sk.ink(curve([[540, 430], [548, 420], [560, 418]]), { w: 4, color: C.white, seed: 58, wob: 0.1 });
  sk.ink(dense([[lx + 14, ly - 48], [596, 450]]), { w: 6, color: C.yellow, seed: 59, wob: 0.2, alpha: 0.9 });
  sk.ink(dense([[524, 460], [436, 512]]), { w: 6, color: C.yellow, seed: 60, wob: 0.2, alpha: 0.9 });
  // 렌즈 너머의 코르크: 속이 빈 작은 칸(벽만 남았다)
  sk.ink(dense([[400, 330], [610, 220]]), { w: 5, color: C.gray, dash: [12, 10], seed: 61, wob: 0.3 });
  cellsView(sk, 756, 222, 150, { seed: 901, empty: true, wall: "#A9773F", bg: "#FBF3E2" });
  sparkle(sk, 918, 72, 16, { seed: 62 });
  // 훅: 현미경을 들여다본다
  const lean = pose({ neck: [26, -336], head: [66, -420], tilt: 0.3, elR: [84, -272], haR: [138, -262], elL: [-40, -258], haL: [-52, -186] });
  drawFigure(sk, 214, 704, 0.78, lean, { ...HOOKE, name: "hooke", face: "wide" });
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
  lead: "천 년 전 카이로에서 빛이 꺾이는 모습을 연구하던 과학자부터 가상 현실 속에서 그림을 그리는 오늘까지, 과학이 세상을 바꾼 순간들을 차례로 찾아가 봐요.",
  narrator: "저는 <b>스틱맨 쌤</b>이에요. 과학의 <b>원리</b>가 <b>기술</b>이 되고, 기술이 <b>기기</b>가 되어 세상을 바꾼 순간들로 함께 시간 여행을 떠나요!",
  cta: "시간순으로 놓아 보기",
};

const BUBBLES = [
  [{ who: "haytham", text: "물에 들어가며<br>꺾이는군!" }],
  [{ who: "friar", text: "글자가<br>또렷해!" }],
  [{ who: "hooke", text: "벌집처럼<br>칸이 가득!" }],
  [{ who: "worker", text: "한꺼번에<br>이렇게나!" }],
  [{ who: "boy", text: "따끔해요!" }],
  [{ who: "fleming", text: "곰팡이 둘레만<br>깨끗하네?" }],
  [{ who: "viewer", text: "바로 보여!" }],
  [{ who: "student", text: "그림 속에<br>들어왔어!" }],
];

const P = [
  {
    fn: p1, when: "11세기 전반, 이집트 카이로", stage: "원리의 발견", title: "빛은 꺾여서 나아가요",
    caption: "11세기 전반 이집트 카이로의 과학자 <b>이븐 알하이삼</b>은 빛이 공기에서 물이나 유리로 들어갈 때 어떻게 꺾이는지 연구했어요. 눈금을 새긴 원판을 물에 반쯤 담가, 꺾인 빛이 닿는 자리를 읽는 장치도 고안했지요. 빛이 이렇게 꺾이는 현상을 <b>굴절</b>이라고 해요.",
  },
  {
    fn: p2, when: "1280년대, 이탈리아", stage: "기술의 발달", title: "유리를 갈아 만든 렌즈",
    caption: "유리를 가운데가 볼록하게 갈면, 지나가는 빛이 꺾여 글자가 크게 보여요. 1280년대 이탈리아에서는 이렇게 간 <b>렌즈</b> 두 알을 이어 <b>안경</b>을 만들었어요(누가 처음 만들었는지는 알려지지 않았어요). 눈이 침침해진 노인도 다시 책을 읽을 수 있게 되었지요.",
  },
  {
    fn: p3, when: "1663년, 영국 런던", stage: "기기의 발명과 쓰임", title: "현미경 속 작은 방들",
    caption: "렌즈 여러 장을 통에 겹친 <b>현미경</b>은 1600년 무렵 네덜란드에서 나왔어요. 1663년 런던의 <b>로버트 훅</b>은 현미경으로 얇은 코르크를 보다가 벌집 같은 작은 칸을 발견했지요. 훅은 1665년에 펴낸 책에서 이 칸을 '작은 방'이라는 뜻의 <b>셀(cell)</b>이라 불렀어요. 오늘날 <b>세포</b>라고 부르는 것이에요.",
    term: { name: "현미경", def: "렌즈로 빛을 꺾어 <b>아주 작은 것을 크게</b> 보여 주는 기기. 먼 것을 크게 보는 망원경도 같은 렌즈 기술에서 나왔어요." },
  },
  {
    fn: p4, when: "1780년대, 영국", stage: "문명의 변화: 산업", title: "증기가 공장을 돌리다",
    caption: "1769년 <b>제임스 와트</b>가 크게 고친 <b>증기 기관</b>은 1780년대부터 증기의 힘으로 공장의 기계를 돌렸어요. 공장은 실과 옷감을 한꺼번에 많이 만들어 냈고(<b>대량 생산</b>), 19세기에는 증기 기관차와 증기선이 물건을 먼 곳까지 실어 날랐지요. 이 큰 변화를 <b>산업 혁명</b>이라고 해요.",
    term: { name: "증기 기관", def: "증기의 압력으로 기계를 움직이는 장치. 1712년 뉴커먼의 기관이 먼저 있었고, 와트는 이것을 고쳐 연료를 훨씬 덜 쓰게 만들었어요." },
  },
  {
    fn: p5, when: "1796년, 영국 버클리", stage: "문명의 변화: 의학", title: "병을 미리 막는 백신",
    caption: "소가 앓는 가벼운 병인 <b>우두</b>를 앓은 사람은 무서운 천연두에 잘 걸리지 않는다는 이야기가 있었어요. 1796년 영국의 의사 <b>에드워드 제너</b>는 우두 고름을 여덟 살쯤 된 소년의 팔에 넣었어요. 몇 주 뒤 천연두 고름을 넣어 보았지만 소년은 병에 걸리지 않았지요. 병에 걸리기 전에 <b>미리 막는</b> 백신의 시작이에요.",
    term: { name: "백신", def: "병에 걸리기 전에 미리 맞아 그 병을 막는 것. 백신이라는 이름은 '소'를 뜻하는 라틴어에서 왔어요." },
  },
  {
    fn: p6, when: "1928년, 영국 런던", stage: "문명의 변화: 의학", title: "감염을 치료하는 항생제",
    caption: "1928년 9월 런던, <b>알렉산더 플레밍</b>은 휴가에서 돌아와 세균을 기르던 접시를 정리하다가 푸른곰팡이 둘레에서만 세균이 녹아 사라진 것을 보았어요. 이 곰팡이가 만든 물질 <b>페니실린</b>은 1940년대에 약으로 만들어져, 세균에 <b>감염된 뒤</b> 병을 고치는 항생제로 처음 널리 쓰였어요.",
    term: { name: "항생제", def: "세균에 감염되었을 때 세균을 죽이거나 자라지 못하게 해 병을 고치는 약. 백신, 깨끗한 물, 넉넉한 먹을거리와 함께 사람의 <b>평균 수명</b>을 크게 늘렸어요(세계 평균 1900년 32세, 2023년 73세)." },
  },
  {
    fn: p7, when: "1962년 7월, 대서양 위", stage: "문명의 변화: 통신", title: "바다 건너 그 순간 그대로",
    caption: "1957년 첫 <b>인공위성</b>이 오른 뒤, 1962년 7월에는 통신 위성 텔스타가 미국의 텔레비전 화면을 대서양 건너 유럽에 그 순간 그대로 전했어요. 1969년에는 <b>인터넷</b>의 시작이 된 컴퓨터 연결망도 처음 이어졌지요. 이런 정보 통신 기술로 지금은 지구 반대편 소식도 <b>실시간</b>으로 봐요.",
    term: { name: "정보 통신", def: "전기와 전파를 이용해 정보를 <b>실시간으로 주고받는</b> 기술. 대륙 사이의 인터넷 자료는 대부분 바다 밑에 깐 통신선으로 오가요." },
  },
  {
    fn: p8, when: "오늘날, 우리 곁", stage: "문명의 변화: 예술", title: "예술까지 바꾼 과학",
    caption: "과학은 예술도 바꿨어요. 1839년 파리에서 빛으로 장면을 남기는 <b>사진</b>이 처음 공개되었고, 그 뒤 영화도 나왔어요. 오늘날에는 <b>가상 현실</b> 속에서 그림을 그리기도 해요. 지금까지의 여행에는 규칙이 있었지요. <b>과학 원리의 발견</b>이 <b>기술</b>을 낳고, 기술이 <b>기기</b>가 되어 <b>문명</b>을 바꿔요.",
    term: { name: "과학과 문명", def: "<b>원리 발견 → 기술 발달 → 기기 발명 → 문명의 변화</b>로 이어지는 흐름. 산업, 의학, 통신, 예술처럼 과학 밖의 분야까지 바꿔요." },
  },
];

export function panels() {
  return P.map((p, i) => ({ sk: p.fn(), bubbles: BUBBLES[i], when: p.when, whenPos: p.whenPos, stage: p.stage, title: p.title, caption: p.caption, term: p.term }));
}
