// 중1 과학 u7l3 도입 만화: 고려사에 적힌 태양의 점(흑점, 쌀알 무늬, 채층·코로나, 홍염·플레어, 태양풍). 8컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u7l3.md.
//   1 1151년, 해에 검은 점 → 2 흐린 해와 큰 점(맨눈 금지, 투영판) → 3 점의 정체(광구, 흑점)
//   → 4 쌀알 무늬와 대류 → 5 개기일식, 가려야 보이는 대기 → 6 홍염과 플레어 → 7 11년의 박자 → 8 태양풍과 지구
// 그림 속에 글자와 숫자는 넣지 않는다(한자 표기도 넣지 않는다).
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, xmark, check, sparkle, drop, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT, OFFICIAL } from "../lib/figure.mjs";
import { earth, satellite, openBook, desk } from "../lib/props.mjs";

const W = 960, H = 720;
const SUN = "#FFC93C", RED = "#F0603A", NIGHT = "#1B2138";
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

// 태양 원반. spots: [[dx, dy, r]](반지름에 대한 비율), rays: 둘레 빛살 수
function sunDisc(sk, cx, cy, r, o = {}) {
  const sd = o.seed ?? 401;
  if (o.rays) for (let i = 0; i < o.rays; i++) { const a = i * Math.PI * 2 / o.rays + 0.2, r0 = r * 1.2, r1 = r * (1.2 + (o.rayLen ?? 0.3) * (i % 2 ? 0.7 : 1)); sk.ink(dense([[cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)], [cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)]]), { w: Math.max(5, r * 0.1), color: C.orange, wob: 0.4, seed: sd + 60 + i }); }
  const g = circ(cx, cy, r, { over: 0.1, seed: sd });
  sk.fill(g, o.color ?? SUN, { dx: 1, dy: 1.2, wob: 0.8, seed: sd + 1, tex: o.tex ?? true, texAng: 0.5 });
  sk.ink(g, { w: o.w ?? Math.max(7, Math.min(12, r * 0.07)), seed: sd + 2 });
  (o.spots ?? []).forEach(([dx, dy, k], i) => spot(sk, cx + dx * r, cy + dy * r, k * r, sd + 10 + i * 3));
}
// 흑점: 가운데는 진하고 둘레는 조금 연하다
function spot(sk, x, y, r, sd) {
  const pen = circ(x, y, r, { over: 0.15, seed: sd, lump: 0.12 });
  sk.fill(pen, "#9A5A2A", { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 });
  sk.fill(circ(x, y, r * 0.58, { over: 0.15, seed: sd + 2, lump: 0.12 }), "#2E211C", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 });
}
// 태양에서 흘러나오는 입자의 흐름: 점을 줄지어 찍고 끝에 화살촉
function stream(sk, a, b, sd, n = 7) {
  for (let i = 0; i < n; i++) { const u = i / n; sk.dot(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 5.5 - u * 1.5, C.orange); }
  arrow(sk, [[a[0] + (b[0] - a[0]) * 0.86, a[1] + (b[1] - a[1]) * 0.86], b], { w: 6, color: C.orange, seed: sd, straight: true, head: 16, wob: 0.2 });
}
// 흐린 안개(가로 물결 줄)
const haze = (sk, x0, x1, ys, sd) => ys.forEach((y, i) => sk.ink(curve([[x0 + i * 14, y], [(x0 + x1) / 2 - 60, y - 8], [(x0 + x1) / 2 + 60, y + 6], [x1 - i * 18, y - 2]]), { w: 16, color: "#E9E6DF", seed: sd + i, wob: 0.8, alpha: 0.92 }));

/* ---------- 1. 고려, 1151년: 해에 검은 점이 있다 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  // 지평선 낮게 걸린 붉은 해와 검은 점 하나
  sunDisc(sk, 290, 400, 170, { color: RED, seed: 401, spots: [[0.22, -0.18, 0.13]] });
  haze(sk, 40, 560, [452, 496, 540], 11);
  const hill = [...curve([[-12, 610], [150, 560], [330, 596], [520, 566], [700, 600], [972, 580]], false, 5), [972, 732], [-12, 732]];
  hill.push(hill[0]);
  sk.fill(hill, "#E7EFE2", { dx: 0, dy: 0, wob: 0, seed: 15 }); sk.ink(hill.slice(0, -3), { w: 9, seed: 16 });
  // 낮은 상과 펼친 책
  desk(sk, 786, 600, 160, { seed: 17, bottom: 700 });
  openBook(sk, 866, 604, 0.78, { color: "#6E8FA8", seed: 19 });
  // 천문 관리: 해를 가리키며 붓을 든다
  const P = pose({ elL: [-98, -340], haL: [-170, -400], elR: [56, -268], haR: [92, -224], tilt: -0.08 });
  const fx = 650, fy = 700, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...OFFICIAL, name: "official", hands: "L" });
  const bx = fx + fs * 92, by = fy - fs * 224;
  sk.ink(dense([[bx - 6, by + 18], [bx + 20, by - 62]]), { w: 6, color: "#8A5A33", seed: 21, wob: 0.3 });
  sk.ink(dense([[bx - 6, by + 18], [bx - 12, by + 34]]), { w: 8, seed: 22, wob: 0.2 });
  handDot(sk, [bx, by], C.skin, 23, 11);
  return sk;
}

/* ---------- 2. 맨눈의 비밀: 흐린 해, 큰 점 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 700, 31);
  // 왼쪽: 흐린 해와 쌓인 기록
  sunDisc(sk, 116, 214, 74, { color: RED, seed: 411, spots: [[0.1, 0.1, 0.2]] });
  haze(sk, 20, 226, [246, 278], 33);
  for (let i = 0; i < 4; i++) { const y = 692 - i * 34; const b = poly([[70 + (i % 2) * 8, y - 30], [214 - (i % 2) * 6, y - 31], [216 - (i % 2) * 6, y], [68 + (i % 2) * 8, y + 1]], 3); sk.fill(b, ["#6E8FA8", "#B5814C", "#5E7B5A", "#B0504A"][i], { dx: 0, dy: 0, wob: 0.4, seed: 35 + i, tex: 0.6 }); sk.ink(b, { w: 7, seed: 39 + i, wob: 0.5 }); }
  sparkle(sk, 236, 540, 11, { seed: 43 });
  // 오른쪽: 맨눈으로는 절대 보지 않는다
  sunDisc(sk, 866, 110, 50, { seed: 421, rays: 10, rayLen: 0.32 });
  // 망원경과 투영판
  const tube = poly([[640, 392], [668, 420], [792, 300], [764, 272]], 4);
  sk.ink(dense([[706, 372], [662, 700]]), { w: 9, seed: 45 }); sk.ink(dense([[712, 372], [770, 700]]), { w: 9, seed: 46 }); sk.ink(dense([[709, 372], [716, 700]]), { w: 8, seed: 47 });
  sk.fill(tube, "#C9A24A", { seed: 48, tex: true, texAng: -0.78 }); sk.ink(tube, { w: 10, seed: 49 });
  sk.ink(dense([[650, 410], [596, 462]]), { w: 6, color: "#5A5F68", seed: 50, wob: 0.3 });
  const board = poly([[470, 424], [596, 412], [612, 560], [486, 572]], 4);
  sk.fill(board, C.white, { dx: 1, dy: 1.2, wob: 0.5, seed: 51 }); sk.ink(board, { w: 9, seed: 52 });
  sunDisc(sk, 541, 492, 46, { seed: 431, color: "#FFE48A", w: 5, tex: false, spots: [[-0.3, -0.2, 0.2], [0.34, 0.1, 0.16], [0.02, 0.42, 0.12]] });
  for (const [a, b, i] of [[[648, 398], [590, 452], 0], [[660, 412], [600, 520], 1]]) sk.ink(dense([a, b]), { w: 4, color: C.yellow, dash: [8, 8], seed: 53 + i, wob: 0 });
  check(sk, 610, 610, 0.8);
  // 쌤: 투영판을 가리킨다. 해 쪽으로는 눈을 두지 않는다
  const P = pose({ elR: [86, -300], haR: [156, -296], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  const fx = 336, fy = 700, fs = 0.7;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher" });
  sk.ink(dense([[fx + 70, fy - fs * 470], [800, 150]]), { w: 5, color: C.gray, dash: [12, 12], seed: 57, wob: 0.3 });
  xmark(sk, 600, 236, 0.62, { w: 14, seed: 58 });
  return sk;
}

/* ---------- 3. 점의 정체: 구멍이 아니라 덜 뜨거운 곳 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 704, 61);
  sunDisc(sk, 630, 350, 270, { seed: 441, spots: [[-0.36, -0.2, 0.15], [0.3, 0.26, 0.09], [0.42, 0.12, 0.06], [-0.1, 0.5, 0.07]] });
  // 가장 큰 흑점 옆에 지구를 놓아 크기를 견준다
  const sx = 630 - 0.36 * 270, sy = 350 - 0.2 * 270;
  earth(sk, sx + 84, sy - 30, 20, { seed: 941, w: 5 });
  sk.ink(dense([[sx + 60, sy - 22], [sx + 44, sy - 14]]), { w: 4, color: C.white, seed: 63, wob: 0.2 });
  const P = pose({ elR: [88, -316], haR: [158, -340], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 200, 704, 0.74, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 4. 광구 확대: 끓는 국 같은 쌀알 무늬 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  ground(sk, 704, 71);
  // 돋보기 속 쌀알 무늬: 밝은 알갱이와 어두운 경계
  const cx = 250, cy = 300, r = 208;
  const lens = circ(cx, cy, r, { over: 0.1, seed: 73 });
  sk.fill(lens, "#C9772B", { dx: 0, dy: 0, wob: 0.6, seed: 74 });
  let n = 0;
  for (let row = -3; row <= 3; row++) for (let col = -3; col <= 3; col++) {
    const x = cx + col * 62 + (row % 2 ? 31 : 0), y = cy + row * 56;
    if (Math.hypot(x - cx, y - cy) > r - 34) continue;
    const g = circ(x, y, 27, { over: 0.15, seed: 75 + n, lump: 0.16 });
    sk.fill(g, n % 3 ? SUN : "#FFD970", { dx: 0, dy: 0, wob: 0.6, seed: 120 + n }); n++;
  }
  // 알갱이 하나의 대류: 가운데는 올라오고 가장자리는 내려간다
  arrow(sk, [[cx, cy + 16], [cx, cy - 20]], { w: 6, color: C.red, seed: 171, straight: true, head: 13, wob: 0.2 });
  arrow(sk, [[cx - 31, cy - 16], [cx - 31, cy + 18]], { w: 5, color: C.blue, seed: 172, straight: true, head: 11, wob: 0.2 });
  arrow(sk, [[cx + 31, cy - 16], [cx + 31, cy + 18]], { w: 5, color: C.blue, seed: 173, straight: true, head: 11, wob: 0.2 });
  sk.ink(lens, { w: 13, color: "#B8892E", seed: 175 });
  sk.ink(dense([[cx + r * 0.72, cy + r * 0.72], [cx + r * 0.72 + 70, cy + r * 0.72 + 76]]), { w: 16, color: "#8A5A33", seed: 176, wob: 0.5 });
  // 끓는 국 냄비
  const px = 640, py = 560;
  const pot = poly([[px - 120, py - 70], [px + 120, py - 70], [px + 108, py + 60], [px - 108, py + 60]], 5);
  sk.fill(pot, "#8A9099", { seed: 177, tex: true, texAng: 0.05 });
  const soup = ell(px, py - 70, 118, 30);
  sk.fill(soup, "#E9A23B", { dx: 0, dy: 0, wob: 0.5, seed: 178 });
  for (const [dx, dy, i] of [[-70, 0, 0], [-24, -8, 1], [24, 6, 2], [70, -2, 3], [0, 14, 4]]) sk.ink(circ(px + dx, py - 70 + dy, 14, { over: 0.2, seed: 179 + i, lump: 0.1 }), { w: 4.5, color: "#B5741F", seed: 184 + i, wob: 0.3 });
  sk.ink(soup, { w: 8, seed: 189 }); sk.ink(pot, { w: 10, seed: 190 });
  for (const sg of [-1, 1]) sk.ink(dense([[px + sg * 120, py - 40], [px + sg * 156, py - 40]]), { w: 12, seed: 191 + sg, wob: 0.4 });
  arrow(sk, [[px, py - 96], [px, py - 170]], { w: 8, color: C.red, seed: 193, straight: true, head: 19, wob: 0.3 });
  arrow(sk, [[px - 86, py - 176], [px - 86, py - 104]], { w: 7, color: C.blue, seed: 194, straight: true, head: 17, wob: 0.3 });
  arrow(sk, [[px + 86, py - 176], [px + 86, py - 104]], { w: 7, color: C.blue, seed: 195, straight: true, head: 17, wob: 0.3 });
  for (let i = 0; i < 5; i++) { const f = curve([[px - 80 + i * 40, py + 66], [px - 68 + i * 40, py + 88], [px - 80 + i * 40, py + 104], [px - 92 + i * 40, py + 88]], true, 3); sk.fill(f, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: 196 + i }); sk.ink(f, { w: 5, color: C.red, seed: 201 + i, wob: 0.3 }); }
  // 쌤
  const P = pose({ elL: [-86, -300], haL: [-156, -300], elR: [50, -260], haR: [24, -218], tilt: -0.05 });
  drawFigure(sk, 866, 704, 0.66, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 5. 개기일식: 가려야 보이는 대기 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  const sky = [[-12, -12], [972, -12], ...curve([[972, 420], [720, 408], [480, 418], [230, 406], [-12, 420]], false, 5)];
  sky.push(sky[0]);
  sk.fill(sky, NIGHT, { dx: 0, dy: 0, wob: 0, seed: 211 });
  for (const [x, y, r, i] of [[90, 70, 7, 0], [250, 190, 5, 1], [800, 60, 6, 2], [900, 250, 5, 3], [140, 320, 4, 4], [760, 330, 4, 5]]) sparkle(sk, x, y, r, { seed: 213 + i, color: "#FFF3C4", w: 3 });
  // 코로나(멀리 뻗은 하얀 빛), 채층(붉고 얇은 띠), 해를 가린 달
  const ex = 480, ey = 196, er = 96;
  const N = 14, cor = [];
  for (let i = 0; i < N * 2; i++) { const a = i * Math.PI / N, rr = er * (i % 2 ? 1.28 : (1.9 + 0.5 * Math.sin(i * 2.3))); cor.push([ex + rr * Math.cos(a), ey + rr * Math.sin(a)]); }
  const corona = curve(cor, true, 4);
  sk.fill(corona, "#F4F1E4", { dx: 0, dy: 0, wob: 1, seed: 221, alpha: 0.96 });
  sk.fill(circ(ex, ey, er + 13, { over: 0.1, seed: 223 }), "#F0503A", { dx: 0, dy: 0, wob: 0.4, seed: 224 });
  sk.fill(circ(ex, ey, er, { over: 0.1, seed: 225 }), "#101320", { dx: 0, dy: 0, wob: 0.4, seed: 226 });
  sk.ink(curve([[-12, 420], [230, 406], [480, 418], [720, 408], [972, 420]]), { w: 9, seed: 227 });
  // 쌤과 학생: 하늘을 가리킨다
  const P1 = pose({ elR: [96, -336], haR: [150, -430], elL: [-50, -260], haL: [-24, -218], tilt: 0.08 });
  drawFigure(sk, 150, 704, 0.5, P1, { ...TEACHER, name: "teacher" });
  const P2 = pose({ elL: [-100, -336], haL: [-156, -436], elR: [50, -260], haR: [24, -218], tilt: 0.08 });
  drawFigure(sk, 812, 704, 0.5, P2, { ...STUDENT, name: "student", mirror: true });
  return sk;
}

/* ---------- 6. 태양의 폭발: 솟구치는 홍염, 번쩍 플레어 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  const cx = 846, cy = 540, r = 430;
  // 가장자리에서 솟아 휘어지는 홍염(원반 뒤에서 나온다)
  const pa = Math.PI * 1.17, bx = cx + r * Math.cos(pa), by = cy + r * Math.sin(pa);
  const loop = curve([[bx + 16, by + 40], [bx - 96, by - 12], [bx - 136, by - 120], [bx - 60, by - 184], [bx + 34, by - 150], [bx + 76, by - 70]]);
  sk.ink(loop, { w: 38, seed: 231, wob: 1 }); sk.ink(loop, { w: 24, color: "#F0503A", seed: 231, wob: 1 });
  sunDisc(sk, cx, cy, r, { seed: 451, w: 12, spots: [[-0.36, -0.42, 0.05], [-0.26, -0.5, 0.035], [-0.42, -0.3, 0.03], [0.1, -0.6, 0.04]] });
  // 흑점 부근에서 번쩍 터지는 플레어
  const fx0 = cx - 0.3 * r, fy0 = cy - 0.34 * r, st = [];
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? 26 : 70; st.push([fx0 + rr * Math.cos(a), fy0 + rr * Math.sin(a)]); }
  const star = poly(st, 3);
  sk.fill(star, "#FFF3A8", { dx: 0, dy: 0, wob: 0.5, seed: 233 }); sk.ink(star, { w: 7, color: C.orange, seed: 234, wob: 0.5 });
  // 우주로 쏟아져 나가는 물질
  stream(sk, [376, 440], [250, 530], 235); stream(sk, [346, 340], [230, 400], 236); stream(sk, [470, 240], [390, 140], 237, 6);
  const P = pose({ elR: [96, -336], haR: [160, -420], elL: [-50, -260], haL: [-24, -218], tilt: -0.06 });
  drawFigure(sk, 130, 706, 0.6, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 7. 11년의 박자: 많아졌다, 줄었다 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  ground(sk, 704, 241);
  // 흑점이 적은 해와 많은 해가 번갈아 온다
  const few = [[0.2, -0.1, 0.13]], many = [[-0.4, -0.2, 0.15], [-0.1, 0.3, 0.13], [0.3, -0.34, 0.12], [0.42, 0.2, 0.14], [0, -0.1, 0.1], [-0.3, 0.44, 0.09], [0.14, 0.52, 0.09]];
  const xs = [110, 295, 480, 665, 850];
  // 수의 오르내림을 따라가는 물결(눈금과 숫자 없이)
  sk.ink(curve([[60, 110], [110, 124], [200, 70], [295, 22], [390, 72], [480, 124], [570, 70], [665, 22], [760, 72], [850, 124], [900, 110]]), { w: 8, color: C.teal, seed: 243, wob: 0.5 });
  xs.forEach((x, i) => { const act = i % 2 === 1; sunDisc(sk, x, 246, act ? 70 : 60, { seed: 461 + i * 20, spots: act ? many : few, rays: act ? 12 : 8, rayLen: act ? 0.42 : 0.16 }); });
  // 옛 기록과 오늘을 잇는 두 사람
  const P1 = pose({ elR: [60, -270], haR: [110, -250], elL: [30, -262], haL: [80, -236] });
  const ox = 200, oy = 704, os = 0.4;
  drawFigure(sk, ox, oy, os, P1, { ...OFFICIAL, name: "official", hands: false });
  openBook(sk, ox + os * 100 + 16, oy - os * 232, 0.44, { color: "#6E8FA8", seed: 245 });
  const P2 = pose({ elL: [-96, -336], haL: [-150, -430], elR: [50, -260], haR: [24, -218], tilt: -0.06 });
  drawFigure(sk, 760, 704, 0.4, P2, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 8. 지구까지: 태양에서 부는 바람 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  sunDisc(sk, 130, 124, 94, { seed: 471, rays: 14, rayLen: 0.34, spots: [[-0.3, -0.2, 0.13], [0.2, 0.3, 0.12], [0.34, -0.3, 0.1], [-0.1, 0.44, 0.09], [0.04, -0.06, 0.09]] });
  // 태양풍
  stream(sk, [262, 200], [520, 370], 251, 10); stream(sk, [250, 262], [488, 450], 252, 9); stream(sk, [276, 146], [560, 300], 253, 10);
  // 지구와 극지방의 오로라
  const ex = 700, ey = 520, er = 150;
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.16, x0 = ex + (er - 6) * Math.cos(a), y0 = ey + (er - 6) * Math.sin(a), len = 54 + (i % 3) * 22; sk.ink(curve([[x0, y0], [x0 + 8 * Math.sin(i), y0 - len * 0.5], [x0 - 6 * Math.sin(i * 2), y0 - len]]), { w: 13, color: i % 2 ? "#4ED28A" : "#7BE0A8", seed: 255 + i, wob: 0.6, alpha: 0.92 }); }
  earth(sk, ex, ey, er, { seed: 941 });
  // 인공위성 고장, 끊긴 통신, 정전
  satellite(sk, 880, 250, 0.5, { seed: 961 });
  const bolt = poly([[826, 196], [800, 240], [820, 242], [800, 284], [846, 230], [824, 228]], 3);
  sk.fill(bolt, C.yellow, { dx: 0, dy: 0, wob: 0.3, seed: 265 }); sk.ink(bolt, { w: 5, seed: 266, wob: 0.3 });
  // 안테나(전파)와 X
  const tx = ex - 96, ty = ey + 10;
  sk.ink(dense([[tx, ty], [tx, ty - 84]]), { w: 7, seed: 267, wob: 0.3 }); sk.ink(dense([[tx - 22, ty], [tx, ty - 50], [tx + 22, ty]], 3), { w: 6, seed: 268, wob: 0.3 });
  for (const rr of [20, 36]) sk.ink(ell(tx, ty - 84, rr, rr, -2.5, -0.64), { w: 5, color: C.blue, seed: 269 + rr, wob: 0.2 });
  xmark(sk, tx + 4, ty - 124, 0.34, { w: 13, seed: 271 });
  // 꺼진 전구
  const lx = ex + 70, ly = ey + 60;
  const bulb = circ(lx, ly - 22, 24, { over: 0.15, seed: 273 });
  sk.fill(bulb, "#8A9099", { dx: 0, dy: 0, wob: 0.4, seed: 274 }); sk.ink(bulb, { w: 6, seed: 275 });
  const sock = rrect(lx - 12, ly, 24, 20, 5); sk.fill(sock, "#55595F", { dx: 0, dy: 0, wob: 0.3, seed: 276 }); sk.ink(sock, { w: 5, seed: 277 });
  xmark(sk, lx + 40, ly - 44, 0.3, { w: 13, seed: 278 });
  // 쌤
  const P = pose({ elR: [88, -316], haR: [158, -340], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 140, 706, 0.5, P, { ...TEACHER, name: "teacher" });
  return sk;
}

const BUBBLES = [
  [{ who: "official", text: "해에 점이<br>있다!" }],
  [{ who: "teacher", text: "종이에<br>비춰 봐요!" }],
  [{ who: "teacher", text: "지구보다<br>커요!" }],
  [{ who: "teacher", text: "대류,<br>기억나요?" }],
  [{ who: "student", text: "왕관<br>같아요!" }, { who: "teacher", text: "늘 있던<br>거예요" }],
  [{ who: "teacher", text: "홍염과<br>플레어!" }],
  [{ who: "official", text: "기록을 모았더니" }, { who: "teacher", text: "박자가 보여요!" }],
  [{ who: "teacher", text: "우주 날씨도<br>예보해요" }],
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7, p8].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
