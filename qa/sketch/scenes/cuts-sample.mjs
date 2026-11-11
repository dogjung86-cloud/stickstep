// 개념 컷(cut()) 코드 그림 화풍 샘플. 빌드 목록(build.mjs)에는 아직 넣지 않았다. 미리보기 전용.
// 원본: Ⅲ 재제작 브랜치(sci-u3-v3)의 public/heat3/cuts/*.webp 네 장, Ⅱ(main unit2v5)의 public/bio4/cuts/*.webp 두 장.
//   u3l1  돋보기로 본 뜨거운 물속 입자(소품 + 확대 원)
//   u3l3  금속 숟가락 손잡이에 깜짝(인물 동작) + 옆의 멀쩡한 나무 숟가락
//   u3l3b 온돌방 단면(장치 중심): 아궁이 → 구들장 → 방 공기의 대류, 바닥의 온기
//   u3l4  같은 불 위 두 냄비, 한쪽만 펄펄(장치 둘 + 인물)
//   u2l8b 당나귀와 말, 그 사이의 노새(동물 + 작은 인물)
//   u2l2b 육각 성벽(세포벽) 안 마당에 태양 전지판(엽록체)을 들이는 두 사람(인물 둘 + 큰 구조물)
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, drop, squiggle, arrow, hash } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT, KID } from "../lib/figure.mjs";

const W = 960, H = 720;
const lerpx = (a, b, t) => a + (b - a) * t;
const HEAT = ["#2B3A8C", "#3F7CC0", "#3FB8A0", "#F2D03B", "#F08A2E", "#E0503A"];
const heat = t => { const u = Math.max(0, Math.min(0.999, t)) * (HEAT.length - 1), i = Math.floor(u); return mix(HEAT[i], HEAT[i + 1], u - i); };
// 입자 하나 + 흔들림 호(comic-u3l3 3컷 문법)
function jiggle(sk, x, y, r, t, shakes, sd) {
  for (let j = 0; j < shakes; j++) for (const sg of [-1, 1]) {
    const rr = r * 1.35 + j * r * 0.36, a0 = sg > 0 ? -0.55 : Math.PI - 0.55;
    sk.ink(ell(x, y, rr, rr * 1.15, a0, a0 + 1.1), { w: 4, color: mix(heat(t), "#000000", 0.1), seed: sd + j * 2 + (sg > 0 ? 1 : 0), wob: 0, alpha: 0.95 - j * 0.25 });
  }
  const b = circ(x, y, r, { over: 0.12, seed: sd + 9 });
  sk.fill(b, heat(t), { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 10 }); sk.ink(b, { w: 7, seed: sd + 11, wob: 0.5 });
  sk.ink(curve([[x - r * 0.5, y - r * 0.3], [x - r * 0.26, y - r * 0.58], [x + r * 0.1, y - r * 0.64]]), { w: 3.5, color: C.white, seed: sd + 12, wob: 0.2 });
}
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; }; // 크게 그린 구조물의 선이 인물보다 굵어지지 않게
// 곧게 나아가는 물결 선(복사하는 열, comic-u3l3 문법)
const wavy = (a, b, amp = 7, waves = 5) => {
  const n = 64, out = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 0; i <= n; i++) { const u = i / n, o = amp * Math.sin(u * waves * 2 * Math.PI) * Math.min(1, (1 - u) * 5); out.push([a[0] + dx * u + nx * o, a[1] + dy * u + ny * o]); }
  return out;
};
const ray = (sk, a, b, sd, o = {}) => arrow(sk, wavy(a, b, o.amp ?? 7, o.waves ?? 5), { w: o.w ?? 7, color: o.color ?? C.orange, seed: sd, wob: 0.3, head: 20 });
const steam = (sk, x, y, n, len, sd, gap = 30, col = "#B8BDC4") => { for (let i = 0; i < n; i++) sk.ink(squiggle(x + (i - (n - 1) / 2) * gap, y, len, 7, 2, i * 1.3), { w: 7, color: col, seed: sd + i, wob: 0 }); };

/* ---------- u3l1: 돋보기로 보면 뜨거운 물속은 입자들의 운동회 ---------- */
function hotMug(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    sk.ink(curve([[56, -110], [104, -112], [110, -60], [62, -42]], false, 3), { w: 12, wob: 0.6, seed: sd });
    const b = poly([[-64, -150], [64, -150], [58, 0], [-58, 0]], 4);
    sk.fill(b, "#EF8A3C", { seed: sd + 1, tex: true, dx: 1, dy: 1.2 });
    sk.ink(b, { w: 11, wob: 0.9, seed: sd + 2 });
    const top = ell(0, -150, 64, 14);
    sk.fill(top, "#C9E7F7", { dx: 0, dy: 0, wob: 0.4, seed: sd + 3 });
    sk.ink(top, { w: 9, wob: 0.5, seed: sd + 4 });
  });
}
function iceGlass(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const water = poly([[-50, -96], [50, -96], [42, -6], [-42, -6]], 3);
    sk.fill(water, "#CFEAF8", { dx: 0, dy: 0, wob: 0.5, seed: sd, tex: 0.8 });
    // 얼음은 대부분 물에 잠기고 윗부분만 조금 나온다
    for (const [cx, cy, r, i] of [[-16, -80, 22, 0], [20, -82, 19, 1]]) {
      const ice = rrect(cx - r, cy - r, r * 2, r * 2, 6);
      sk.fill(ice, "#F4FBFF", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 2 + i });
      sk.ink(ice, { w: 6, wob: 0.4, seed: sd + 4 + i });
    }
    sk.fill(water, "#CFEAF8", { dx: 0, dy: 0, wob: 0.5, seed: sd + 8, alpha: 0.45 });
    sk.ink(dense([[-48, -96], [48, -96]]), { w: 5, color: C.seaDeep, wob: 0.4, seed: sd + 9 });
    sk.ink(dense([[-58, -156], [-46, 0], [46, 0], [58, -156]], 4), { w: 10, wob: 0.8, seed: sd + 6 });
  });
}
function magnifier(sk, cx, cy, r, hand, sd, inside) {
  // 만화의 돋보기 문법(u7l3 4컷): 금색 테 13 + 외곽선 없는 갈색 손잡이 16
  const dx = hand[0] - cx, dy = hand[1] - cy, L = Math.hypot(dx, dy);
  const rim = [cx + dx / L * r, cy + dy / L * r];
  sk.ink(dense([rim, hand]), { w: 16, color: "#8A5A33", seed: sd, wob: 0.5 });
  const lens = circ(cx, cy, r, { over: 0.12, seed: sd + 2 });
  sk.fill(lens, "#FFF6E6", { dx: 0, dy: 0, wob: 0.6, seed: sd + 3 });
  inside();
  sk.ink(curve([[cx - r * 0.62, cy - r * 0.42], [cx - r * 0.4, cy - r * 0.66], [cx - r * 0.12, cy - r * 0.76]]), { w: 7, color: C.white, seed: sd + 4, wob: 0.3 });
  sk.ink(lens, { w: 13, seed: sd + 5, color: "#B8892E" });
}
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function cutU3l1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 664;
  sk.ink(curve([[14, GY + 2], [480, GY - 2], [946, GY + 2]]), { w: 9, seed: 11 });
  hotMug(sk, 520, GY, 1, 21);
  steam(sk, 520, 496, 3, 70, 31);
  iceGlass(sk, 790, GY, 1, 41);
  // 쌤: 오른손으로 돋보기를 들고 들여다본다
  const P = pose({ elR: [92, -300], haR: [150, -344], elL: [-40, -262], haL: [-14, -214], tilt: 0.12, head: [10, -436] });
  const fx = 170, fy = GY, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
  const hand = [fx + fs * 150, fy - fs * 344];
  const cx = 520, cy = 250, r = 150;
  magnifier(sk, cx, cy, r, hand, 51, () => {
    // 물(액체) 입자: 서로 가깝지만 규칙 없이 놓인다(규칙 배열은 고체로 읽힌다). 뜨거우니 흔들린다
    const pts = [];
    for (let k = 0; k < 6000 && pts.length < 30; k++) {
      const ang = hash(k * 12.9898 + 4.1) * Math.PI * 2, rad = Math.sqrt(hash(k * 78.233 + 1.7)) * (r - 32);
      const x = cx + rad * Math.cos(ang), y = cy + rad * Math.sin(ang);
      if (pts.every(([px, py]) => Math.hypot(px - x, py - y) > 35)) pts.push([x, y]);
    }
    pts.forEach(([x, y], i) => jiggle(sk, x, y, 15, 0.78 + 0.2 * hash(i * 3.3), 1, 61 + i * 13));
  });
  handDot(sk, hand, C.skin, 201, 13);
  return sk;
}

/* ---------- u3l3: 금속 숟가락은 열의 고속도로, 나무 숟가락은 비포장길 ---------- */
function soupBowl(sk, cx, base, w, sd) {
  const rimY = base - 150;
  const body = curve([[cx - w / 2, rimY], [cx - w * 0.44, rimY + 80], [cx - w * 0.26, base - 12], [cx + w * 0.26, base - 12], [cx + w * 0.44, rimY + 80], [cx + w / 2, rimY]], false, 4);
  sk.fill([...body, body[0]], "#4F7FB8", { seed: sd, tex: true, texAng: 0.1 });
  const foot = rrect(cx - w * 0.18, base - 18, w * 0.36, 18, 6);
  sk.fill(foot, "#3E6A9E", { seed: sd + 1, dx: 0.8, dy: 1 }); sk.ink(foot, { w: 9, seed: sd + 2 });
  sk.ink([...body, body[0]], { w: 12, seed: sd + 3 });
  sk.ink(curve([[cx - w * 0.44, rimY + 50], [cx, rimY + 64], [cx + w * 0.44, rimY + 50]]), { w: 6, color: C.white, seed: sd + 4, wob: 0.5 });
  const soup = ell(cx, rimY, w / 2 - 6, 30);
  sk.fill(soup, "#E3A04E", { dx: 0, dy: 0, wob: 0.5, seed: sd + 5, tex: 0.7 });
  for (const [x, y, i] of [[-70, 4, 0], [34, -8, 1], [96, 8, 2]]) sk.fill(rrect(cx + x - 14, rimY + y - 9, 28, 18, 5), i === 1 ? C.green : "#F6E7C8", { dx: 0, dy: 0, wob: 0.4, seed: sd + 6 + i });
  sk.ink(ell(cx, rimY, w / 2, 34), { w: 11, seed: sd + 9 });
  return rimY;
}
function woodSpoon(sk, x, y, len, rot, sd) {
  sk.at(x, y, 1, () => {
    const handle = rrect(0, -9, len, 18, 9);
    sk.fill(handle, C.wood, { seed: sd, tex: true, texAng: 0.02, dx: 0.8, dy: 1 }); sk.ink(handle, { w: 8, seed: sd + 1 });
    const bowl = ell(-40, 0, 46, 26);
    sk.fill(bowl, C.wood, { seed: sd + 2, tex: true, dx: 0.8, dy: 1 }); sk.ink(bowl, { w: 9, seed: sd + 3 });
    sk.ink(ell(-40, 0, 30, 14, 2.6, 5.4), { w: 5, color: C.woodDark, seed: sd + 4, wob: 0.3 });
  }, rot);
}
// 은빛 금속 숟가락(손잡이만 보인다): a = 국에 잠긴 쪽, b = 손잡이 끝(납작하고 넓다)
function metalSpoon(sk, a, b, sd) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const P = (t, w) => [a[0] + ux * t + nx * w, a[1] + uy * t + ny * w];
  const shape = curve([P(0, -7), P(L * 0.62, -8), P(L - 46, -15), P(L - 8, -12), P(L, 0), P(L - 8, 12), P(L - 46, 15), P(L * 0.62, 8), P(0, 7)], true, 3);
  sk.fill(shape, "#C9D1D9", { seed: sd, dx: 0.6, dy: 0.8, wob: 0.4 });
  sk.ink(dense([P(30, -2), P(L - 30, -5)]), { w: 4, color: C.white, seed: sd + 1, wob: 0.2 });
  sk.ink(shape, { w: 8, seed: sd + 2, wob: 0.5 });
}
function cutU3l3() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 676;
  sk.ink(curve([[14, GY + 2], [480, GY - 2], [946, GY + 2]]), { w: 9, seed: 11 });
  const rimY = soupBowl(sk, 270, GY, 360, 21);
  steam(sk, 210, rimY - 50, 3, 80, 31, 34);
  // 국에 꽂힌 금속 숟가락: 국의 열이 손잡이를 타고 끝까지 올라온다(국 온도라 빨갛게 달아오르지는 않는다)
  const tip = [552, 300];
  metalSpoon(sk, [330, rimY + 6], tip, 41);
  arrow(sk, [[382, rimY - 52], [450, rimY - 128], [512, rimY - 198]], { w: 6, color: C.red, seed: 44, wob: 0.3, head: 16, dash: [12, 9] });
  for (const [dx, i] of [[-26, 0], [0, 1], [26, 2]]) sk.ink(squiggle(tip[0] + dx - 4, tip[1] - 30, 44, 5, 2, i), { w: 5, color: C.red, seed: 45 + i, wob: 0 });
  // 바닥에 놓인 나무 숟가락: 멀쩡하다
  woodSpoon(sk, 520, GY - 22, 150, -0.02, 51);
  // 쌤: 데어서 손을 확 빼며 뒤로 물러난다
  const P = pose({ hip: [16, -212], neck: [34, -340], head: [52, -432], tilt: 0.2,
    elL: [-46, -300], haL: [-96, -356], elR: [100, -312], haR: [150, -378],
    knL: [-10, -112], ftL: [-56, 0], knR: [60, -100], ftR: [96, -4] });
  drawFigure(sk, 760, GY, 0.72, P, { ...TEACHER, name: "teacher" });
  emark(sk, 650, 236, 0.85, { color: C.red, rot: -0.15 });
  drop(sk, 896, 300, 1.1, { rot: 0.3 }); drop(sk, 914, 360, 0.8, { rot: 0.4 });
  return sk;
}

/* ---------- u3l3b: 온돌방 하나에 전도, 대류, 복사 ---------- */
function flame(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const fl = curve([[0, -150], [26, -108], [50, -80], [44, -40], [18, -24], [-18, -24], [-44, -40], [-48, -78], [-26, -98], [-16, -124]], true, 4);
    sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.8, seed: sd }); sk.ink(fl, { w: 8, color: C.red, seed: sd + 1, wob: 0.8 });
    const fi = curve([[2, -100], [16, -74], [22, -50], [8, -34], [-8, -34], [-22, -52], [-12, -74]], true, 3);
    sk.fill(fi, C.lemon, { dx: 0, dy: 0, wob: 0.5, seed: sd + 2 });
  });
}
function cutU3l3b() {
  const sk = new Sk(W, H, { id: "c" });
  const L = 150, Rt = 830, FLOOR = 508, SLAB = 50, BOT = 640;
  sk.ink(curve([[14, BOT + 3], [480, BOT - 1], [946, BOT + 2]]), { w: 9, seed: 9 });
  thin(sk, 0.72, () => {
    // 기와지붕: 처마 끝이 살짝 들린 곡선
    const TOP = [[36, 138], [96, 112], [170, 80], [230, 64], [480, 58], [730, 64], [790, 80], [864, 112], [924, 138]];
    const BTM = [[36, 138], [88, 150], [480, 156], [872, 150], [924, 138]];
    const at = (list, x) => { for (let i = 0; i < list.length - 1; i++) { const [x0, y0] = list[i], [x1, y1] = list[i + 1]; if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return list[0][1]; };
    const roof = curve([...TOP, [872, 150], [480, 156], [88, 150]], true, 4);
    sk.fill(roof, "#5E6670", { seed: 11, tex: true, texAng: 0.02 });
    for (let x = 122, i = 0; x <= 838; x += 36, i++) { const y0 = at(TOP, x) + 9, y1 = at(BTM, x) - 7; if (y1 - y0 > 20) sk.ink(dense([[x, y0], [x, y1]]), { w: 6, color: "#3D434B", seed: 12 + i, wob: 0.3 }); }
    sk.ink(roof, { w: 13, seed: 31 });
    // 방: 벽과 기둥
    sk.fill(poly([[L, 160], [Rt, 160], [Rt, FLOOR], [L, FLOOR]], 5), "#FBF3E2", { dx: 0, dy: 0, wob: 0.5, seed: 33 });
    sk.ink(dense([[L - 16, 164], [Rt + 16, 164]]), { w: 11, seed: 32, color: "#8A5A33" });
    for (const x of [L, Rt]) sk.ink(dense([[x, 160], [x, BOT]]), { w: 14, seed: 34 + (x > 400 ? 1 : 0), color: "#8A5A33" });
    // 구들장(돌판) 아래 고래(뜨거운 연기가 지나는 길): 밝은 바탕이라 검은 선이 묻히지 않는다
    const flue = poly([[L, BOT], [Rt, BOT], [Rt, FLOOR + SLAB], [L, FLOOR + SLAB]], 4);
    sk.fill(flue, "#F3D9BC", { dx: 0, dy: 0, wob: 0.4, seed: 41 });
    for (let i = 0; i < 6; i++) {
      const x0 = L + 8 + i * (Rt - L - 16) / 6, x1 = x0 + (Rt - L - 16) / 6 - 10;
      const st = rrect(x0, FLOOR, x1 - x0, SLAB, 10);
      sk.fill(st, "#B5ABA0", { seed: 42 + i, tex: 0.8, dx: 0.8, dy: 1 }); sk.ink(st, { w: 11, seed: 48 + i });
    }
    for (let i = 0; i < 5; i++) { const x = L + 74 + i * 136; const pil = rrect(x - 13, FLOOR + SLAB, 26, BOT - FLOOR - SLAB, 6); sk.fill(pil, "#9C8F82", { seed: 54 + i, dx: 0.6, dy: 0.8 }); sk.ink(pil, { w: 10, seed: 59 + i }); }
    sk.ink(flue, { w: 11, seed: 40 });
    // 바닥 장판
    sk.fill(rrect(L, FLOOR - 14, Rt - L, 16, 4), "#E9C46A", { dx: 0, dy: 0, wob: 0.3, seed: 64 });
    sk.ink(dense([[L, FLOOR - 14], [Rt, FLOOR - 14]]), { w: 11, seed: 65 });
    // 아궁이(왼쪽 아래)
    const hole = poly([[24, BOT], [24, 548], [L - 4, 548], [L - 4, BOT]], 4);
    sk.fill(hole, "#4A4A52", { dx: 0, dy: 0, wob: 0.4, seed: 66 }); sk.ink(hole, { w: 12, seed: 67 });
    // 굴뚝(오른쪽)
    const chim = rrect(Rt + 28, 360, 44, BOT - 360, 6);
    sk.fill(chim, "#B5ABA0", { seed: 74, tex: 0.8 }); sk.ink(chim, { w: 12, seed: 75 });
    sk.ink(dense([[Rt, FLOOR + SLAB + 30], [Rt + 28, FLOOR + SLAB + 30]]), { w: 11, seed: 76 });
  });
  flame(sk, 86, BOT - 4, 0.62, 71);
  steam(sk, Rt + 50, 330, 2, 120, 77, 22);
  // 고래를 따라 흐르는 뜨거운 연기
  arrow(sk, [[176, BOT - 40], [420, BOT - 46], [690, BOT - 40], [800, BOT - 44]], { w: 9, color: C.red, seed: 81, wob: 0.4, head: 24 });
  // 전도: 데워진 돌이 바닥을 데운다
  for (let i = 0; i < 6; i++) sk.ink(squiggle(206 + i * 112, FLOOR + 38, 32, 5, 1.6, i), { w: 6, color: C.red, seed: 83 + i, wob: 0 });
  // 대류: 따뜻한 바닥 가운데서 데워진 공기가 오르고(빨강) 차가운 벽 쪽에서 식은 공기가 내려온다(파랑).
  // 원본 컷은 오른쪽 고리의 두 화살촉이 서로 반대를 가리켜 방향이 정해져 있지 않았다
  const arcPts = (cx, a0, a1) => { const out = []; for (let i = 0; i <= 24; i++) { const a = a0 + (a1 - a0) * i / 24; out.push([cx + 84 * Math.cos(a), 284 + 72 * Math.sin(a)]); } return out; };
  for (const [cx, m, sd] of [[340, 1, 91], [640, -1, 95]]) {
    const A = t => (m > 0 ? t : Math.PI - t);
    arrow(sk, arcPts(cx, A(0.7), A(-2.3)), { w: 10, color: C.red, seed: sd, wob: 0.4, head: 24, straight: true });
    arrow(sk, arcPts(cx, A(-2.7), A(-5.2)), { w: 10, color: C.blue, seed: sd + 2, wob: 0.4, head: 24, straight: true });
  }
  // 복사: 따뜻한 바닥이 방 안으로 열을 내보낸다
  for (const [x, i] of [[640, 0], [720, 1], [800, 2]]) ray(sk, [x, FLOOR - 28], [x - 6, FLOOR - 120], 97 + i, { amp: 6, waves: 3.5 });
  // 바닥에 누운 사람: 등이 뜨끈. 머리는 바로 세운다(안경이 가로로)
  sk.at(470, FLOOR - 14 - 50, 1, () => {
    const lie = pose({ hip: [-58, -212], neck: [-38, -342], head: [0, -440], tilt: Math.PI / 2 - 0.22,
      elL: [24, -300], haL: [36, -232], elR: [-6, -292], haR: [16, -236],
      knL: [40, -118], ftL: [-96, -6], knR: [26, -112], ftR: [-98, 14] });
    drawFigure(sk, 0, 0, 0.5, lie, { ...KID, seed: 23 });
  }, -Math.PI / 2);
  return sk;
}

/* ---------- u3l4: 같은 불, 같은 시간인데 한쪽만 펄펄 ---------- */
function stove(sk, cx, y, sd) {
  const st = rrect(cx - 116, y, 232, 66, 14);
  sk.fill(st, "#8A9099", { seed: sd, tex: true, texAng: 0.04 }); sk.ink(st, { w: 10, seed: sd + 1 });
  sk.dot(cx - 80, y + 36, 9, "#3A3F47");
  for (let i = 0; i < 5; i++) { const x = cx - 64 + i * 32; const f = curve([[x, y - 44], [x + 12, y - 20], [x + 8, y - 2], [x - 8, y - 2], [x - 12, y - 20]], true, 3); sk.fill(f, "#5BA8EE", { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 + i }); sk.ink(f, { w: 5, color: "#2F6DB5", seed: sd + 8 + i, wob: 0.4 }); }
}
function pot(sk, cx, y, sd, boil) {
  const w = 230, h = 150;
  for (const sg of [-1, 1]) sk.ink(curve([[cx + sg * w / 2, y - h + 34], [cx + sg * (w / 2 + 34), y - h + 30], [cx + sg * (w / 2 + 34), y - h + 50]]), { w: 11, seed: sd + (sg > 0 ? 1 : 0) });
  const body = poly([[cx - w / 2, y - h], [cx + w / 2, y - h], [cx + w / 2 - 8, y], [cx - w / 2 + 8, y]], 4);
  sk.fill(body, "#B9C7D4", { seed: sd + 2, tex: true, texAng: 0.05 });
  sk.ink(dense([[cx - w / 2 + 14, y - h + 40], [cx - w / 2 + 12, y - 20]]), { w: 6, color: C.white, seed: sd + 3, wob: 0.3 });
  sk.ink(body, { w: 11, seed: sd + 4 });
  const top = ell(cx, y - h, w / 2, 20);
  sk.fill(top, "#9ED3F2", { dx: 0, dy: 0, wob: 0.4, seed: sd + 5 });
  if (boil) for (const [x, r, i] of [[-62, 13, 0], [-20, 17, 1], [28, 12, 2], [70, 15, 3]]) { const b = circ(cx + x, y - h - 10 - (i % 2) * 8, r, { over: 0.1, seed: sd + 6 + i }); sk.fill(b, "#E2F3FC", { dx: 0, dy: 0, wob: 0.3, seed: sd + 10 + i }); sk.ink(b, { w: 6, color: C.blue, seed: sd + 14 + i, wob: 0.4 }); }
  sk.ink(top, { w: 10, seed: sd + 18 });
}
function stopwatch(sk, x, y, r, sd) {
  sk.ink(dense([[x, y - r - 4], [x, y - r - 18]]), { w: 9, seed: sd });
  sk.fill(rrect(x - 12, y - r - 30, 24, 14, 4), C.red, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
  sk.ink(rrect(x - 12, y - r - 30, 24, 14, 4), { w: 6, seed: sd + 2, wob: 0.3 });
  const c = circ(x, y, r, { over: 0.15, seed: sd + 3 });
  sk.fill(c, C.white, { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 4 });
  sk.ink(c, { w: 9, seed: sd + 5 });
  sk.ink(dense([[x, y], [x + r * 0.5, y - r * 0.45]]), { w: 6, seed: sd + 6, wob: 0.1 });
  sk.dot(x, y, 4);
}
function cutU3l4() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 684;
  sk.ink(curve([[14, GY + 2], [480, GY - 2], [946, GY + 2]]), { w: 9, seed: 11 });
  stove(sk, 180, GY - 66, 21); stove(sk, 780, GY - 66, 41);
  pot(sk, 180, GY - 110, 61, true); pot(sk, 780, GY - 110, 81, false);
  // 왼쪽 냄비만 김이 펄펄
  for (let i = 0; i < 4; i++) sk.ink(squiggle(116 + i * 42, 384, 150 + (i % 2) * 40, 12, 2.4, i * 1.3), { w: 9, color: "#B8BDC4", seed: 101 + i, wob: 0 });
  sk.ink(squiggle(780, 400, 40, 5, 1.4, 0.4), { w: 6, color: "#C9CED6", seed: 109, wob: 0 });
  // 쌤: 한 손엔 초시계, 한 손은 머리를 긁적
  const P = pose({ elL: [-118, -360], haL: [-124, -470], elR: [86, -300], haR: [140, -358], tilt: -0.08 });
  const fx = 480, fy = GY, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher" });
  stopwatch(sk, fx + fs * 140 + 18, fy - fs * 358 - 46, 30, 121);
  handDot(sk, [fx + fs * 140, fy - fs * 358], C.skin, 131);
  qmark(sk, 600, 200, 0.62, { color: C.teal, seed: 133, rot: 0.12 });
  return sk;
}

/* ---------- u2l8b: 새끼를 낳을 수 있어도 같은 종이 아닐 수 있다? ---------- */
// 네발짐승(옆모습, 오른쪽을 본다). o: body 색, mane 색, ear 길이, tail 모양. 원점 = 앞발과 뒷발 사이 바닥
function equid(sk, x, y, s, o) {
  const sd = o.seed, col = o.color, dark = mix(col, "#000000", 0.32);
  sk.at(x, y, s, () => {
    // 꼬리
    if (o.tail === "brush") { sk.ink(curve([[-118, -228], [-150, -200], [-156, -150]]), { w: 9, seed: sd, wob: 0.5 }); const tf = curve([[-156, -164], [-140, -120], [-156, -96], [-176, -120], [-170, -156]], true, 3); sk.fill(tf, o.mane, { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 }); sk.ink(tf, { w: 7, seed: sd + 2, wob: 0.4 }); }
    else { const tl = curve([[-112, -236], [-150, -224], [-172, -170], [-170, -110], [-152, -122], [-146, -176], [-120, -208]], true, 3); sk.fill(tl, o.mane, { dx: 0, dy: 0, wob: 0.5, seed: sd + 1, tex: 0.6 }); sk.ink(tl, { w: 8, seed: sd + 2, wob: 0.5 }); }
    // 다리 네 개(뒤쪽 두 개는 조금 어둡게)
    for (const [lx, back, i] of [[-96, true, 0], [64, true, 1], [-76, false, 2], [86, false, 3]]) {
      const leg = poly([[lx - 13, -186], [lx + 13, -186], [lx + 9, -14], [lx - 9, -14]], 4);
      sk.fill(leg, back ? mix(col, "#000000", 0.14) : col, { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 3 + i });
      sk.ink(leg, { w: 8, seed: sd + 7 + i, wob: 0.5 });
      const hoof = rrect(lx - 12, -18, 24, 18, 5);
      sk.fill(hoof, "#3A3A40", { dx: 0, dy: 0, wob: 0.3, seed: sd + 11 + i }); sk.ink(hoof, { w: 7, seed: sd + 15 + i, wob: 0.3 });
    }
    // 몸통
    const body = curve([[-126, -232], [-60, -262], [70, -262], [124, -232], [118, -170], [60, -150], [-70, -150], [-128, -176]], true, 4);
    sk.fill(body, col, { seed: sd + 19, tex: true, texAng: 0.1 });
    sk.ink(body, { w: 10, seed: sd + 20 });
    if (o.belly) sk.fill(curve([[-70, -160], [0, -154], [70, -160], [40, -176], [-40, -176]], true, 3), o.belly, { dx: 0, dy: 0, wob: 0.4, seed: sd + 21 });
    // 목과 머리
    const neck = curve([[84, -246], [118, -320], [150, -362], [186, -346], [150, -280], [128, -210]], true, 4);
    sk.fill(neck, col, { seed: sd + 22, dx: 1, dy: 1.2 }); sk.ink(neck, { w: 10, seed: sd + 23 });
    const ear = o.ear;
    for (const [ex, i] of [[150, 0], [166, 1]]) { const e = curve([[ex - 8, -364], [ex - 4 + i * 6, -364 - ear], [ex + 10, -362]], true, 3); sk.fill(e, i ? col : dark, { dx: 0, dy: 0, wob: 0.3, seed: sd + 24 + i }); sk.ink(e, { w: 7, seed: sd + 26 + i, wob: 0.4 }); }
    const head = curve([[140, -376], [178, -380], [244, -314], [250, -290], [230, -278], [168, -318]], true, 4);
    sk.fill(head, col, { seed: sd + 28, dx: 1, dy: 1.2 }); sk.ink(head, { w: 10, seed: sd + 29 });
    if (o.muzzle) sk.fill(curve([[220, -320], [250, -296], [234, -280], [212, -296]], true, 3), o.muzzle, { dx: 0, dy: 0, wob: 0.3, seed: sd + 30 });
    sk.dot(186, -336, 6.5);
    // 갈기
    if (o.maneLong) { const mn = curve([[128, -362], [100, -320], [80, -262], [98, -258], [118, -306], [150, -350]], true, 3); sk.fill(mn, o.mane, { dx: 0, dy: 0, wob: 0.5, seed: sd + 31, tex: 0.6 }); sk.ink(mn, { w: 7, seed: sd + 32, wob: 0.5 }); }
    else sk.ink(curve([[146, -366], [124, -330], [100, -282], [88, -256]]), { w: 9, color: o.mane, seed: sd + 31, wob: 0.4 });
  });
}
function cutU2l8b() {
  const sk = new Sk(W, H, { id: "e" });
  // 원본 구도: 부모 둘은 양옆 앞쪽, 새끼 노새는 가운데 뒤쪽(위), 학생은 가운데 맨 앞. 땅은 저마다 짧은 선으로
  const patch = (x0, x1, y, sd) => sk.ink(curve([[x0, y + 2], [(x0 + x1) / 2, y - 2], [x1, y + 1]]), { w: 9, seed: sd });
  // 당나귀(왼쪽, 회색, 긴 귀, 끝만 술 달린 꼬리)
  patch(30, 380, 560, 11);
  equid(sk, 180, 560, 0.72, { seed: 21, color: "#A7A3A0", mane: "#4E4A48", ear: 74, tail: "brush", belly: "#E2DED8", muzzle: "#E2DED8" });
  // 말(오른쪽, 크고 갈색, 긴 갈기와 꼬리). 노새 쪽을 보게 뒤집는다
  patch(570, 944, 560, 12);
  sk.at(804, 560, 1, () => equid(sk, 0, 0, 0.84, { seed: 61, color: "#B5713E", mane: "#4A2E1C", ear: 30, maneLong: true }), 0, -1);
  // 노새(가운데 뒤, 둘의 중간: 말 같은 몸과 꼬리 + 당나귀처럼 긴 귀). 새끼라 작다
  patch(404, 584, 322, 13);
  equid(sk, 486, 322, 0.5, { seed: 101, color: "#8F6B52", mane: "#3E2C22", ear: 58, belly: "#D8C6B4", muzzle: "#D8C6B4" });
  // 부모 둘 → 새끼
  arrow(sk, [[336, 430], [404, 404], [456, 352]], { w: 8, color: C.teal, seed: 131, wob: 0.4, head: 22 });
  arrow(sk, [[652, 430], [584, 404], [532, 352]], { w: 8, color: C.teal, seed: 133, wob: 0.4, head: 22 });
  // 학생: 가운데 앞에서 갸웃
  patch(420, 540, 704, 14);
  const P = pose({ elR: [56, -262], haR: [30, -222], elL: [-56, -262], haL: [-30, -222], tilt: 0.14 });
  drawFigure(sk, 480, 704, 0.44, P, { ...STUDENT, name: "student" });
  qmark(sk, 590, 520, 0.5, { color: C.teal, seed: 141, rot: 0.15 });
  return sk;
}

/* ---------- u2l2b: 식물 공장엔 태양 전지판과 담장이 추가! ---------- */
function stoneRow(sk, pts, rows, sd, col) {
  // 앞면 사각형(네 점) 안에 엇갈린 돌 줄
  const [a, b, c, d] = pts; // a 왼위, b 오른위, c 오른아래, d 왼아래
  const joint = mix(col, "#000000", 0.38);
  sk.fill(poly([a, b, c, d], 4), col, { seed: sd, tex: 0.5, dx: 0.8, dy: 1 });
  for (let r = 1; r < rows; r++) { const t = r / rows; sk.ink(dense([lerp2(a, d, t), lerp2(b, c, t)]), { w: 6, color: joint, seed: sd + r, wob: 0.6 }); }
  for (let r = 0; r < rows; r++) {
    const t0 = r / rows, t1 = (r + 1) / rows, n = 3;
    for (let k = 1; k < n + (r % 2); k++) { const u = (k - (r % 2 ? 0.5 : 0)) / n; if (u <= 0.08 || u >= 0.92) continue; sk.ink(dense([lerp2(lerp2(a, b, u), lerp2(d, c, u), t0), lerp2(lerp2(a, b, u), lerp2(d, c, u), t1)]), { w: 6, color: joint, seed: sd + 20 + r * 5 + k, wob: 0.4 }); }
  }
  sk.ink(poly([a, b, c, d], 4), { w: 13, seed: sd + 60 });
}
function panel(sk, cx, cy, w, h, sd, rot = 0) {
  sk.at(cx, cy, 1, () => {
    const p = poly([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], 4);
    sk.fill(p, "#3FAE5A", { seed: sd, tex: 0.8, texAng: 1.2 });
    for (let i = 1; i < 4; i++) sk.ink(dense([[-w / 2 + w * i / 4, -h / 2], [-w / 2 + w * i / 4, h / 2]]), { w: 4, color: "#2A7A3E", seed: sd + i, wob: 0.2 });
    sk.ink(dense([[-w / 2, 0], [w / 2, 0]]), { w: 4, color: "#2A7A3E", seed: sd + 5, wob: 0.2 });
    sk.ink(p, { w: 8, seed: sd + 6 });
  }, rot);
}
function cutU2l2b() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 676;
  // 육각 성벽(위에서 비스듬히 본 모습): 앞 모서리 두 개가 땅선에 닿는다
  const cx = 540, ty = 326, rx = 270, ry = 92, wallH = 270;
  const hex = (k, dy = 0) => { const out = []; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; out.push([cx + rx * k * Math.cos(a), ty + dy + ry * k * Math.sin(a)]); } return out; };
  const top = hex(1); // 0=오른쪽, 1=오른앞, 2=왼앞, 3=왼쪽, 4=왼뒤, 5=오른뒤
  const dn = p => [p[0], p[1] + wallH];
  // 땅: 사람과 사다리 쪽, 그리고 성벽 앞
  sk.ink(curve([[14, GY + 2], [180, GY - 2], [330, GY + 1]]), { w: 9, seed: 11 });
  sk.ink(curve([[top[2][0] - 30, GY + 3], [cx, GY + 1], [top[1][0] + 30, GY + 3]]), { w: 9, seed: 12 });
  thin(sk, 0.72, () => {
    stoneRow(sk, [top[2], top[1], dn(top[1]), dn(top[2])], 4, 21, "#C7BBA8");
    stoneRow(sk, [top[3], top[2], dn(top[2]), dn(top[3])], 4, 101, "#B3A691");
    stoneRow(sk, [top[1], top[0], dn(top[0]), dn(top[1])], 4, 181, "#B3A691");
    // 윗면: 성벽 두께 띠(돌 색) + 안쪽 마당(세포 안)
    const outer = poly(top, 4), inner = poly(hex(0.8, 4), 4);
    sk.fill(outer, "#D9CFBF", { dx: 0, dy: 0, wob: 0.5, seed: 261 });
    sk.fill(inner, "#DFF0D2", { dx: 0, dy: 0, wob: 0.5, seed: 262 });
    sk.ink(inner, { w: 11, seed: 263 });
    sk.ink(outer, { w: 13, seed: 264 });
  });
  // 마당에 이미 놓인 전지판(엽록체)
  panel(sk, cx + 20, ty - 2, 120, 56, 271, -0.05);
  panel(sk, cx + 130, ty + 20, 104, 50, 281, 0.05);
  // 위의 쌤: 전지판을 하나 더 내려놓는다
  const Pt = pose({ elL: [-70, -300], haL: [-120, -280], elR: [60, -300], haR: [16, -268], tilt: -0.1 });
  drawFigure(sk, 420, ty + 12, 0.42, Pt, { ...TEACHER, name: "teacher", mirror: true, seed: 21 });
  panel(sk, 420 + 0.42 * 112, ty + 12 - 0.42 * 282, 92, 44, 291, -0.25);
  // 사다리(왼쪽 앞면에 기댄다)
  const lx0 = 196, lx1 = 252, topY = 392, lean = 102;
  for (const [x, i] of [[lx0, 0], [lx1, 1]]) sk.ink(dense([[x, GY], [x + lean, topY]]), { w: 10, color: C.woodDark, seed: 301 + i });
  for (let k = 1; k < 8; k++) { const t = k / 8; sk.ink(dense([[lerpx(lx0, lx0 + lean, t), lerpx(GY, topY, t)], [lerpx(lx1, lx1 + lean, t), lerpx(GY, topY, t)]]), { w: 8, color: C.woodDark, seed: 311 + k }); }
  // 아래의 학생: 전지판을 머리 위로 받쳐 올린다(판은 몸 밖에서 원래 굵기로)
  const sx = 100, ss = 0.44;
  panel(sk, sx, GY - ss * 560 - 24, 124, 54, 331, 0.06);
  const Pb = pose({ elL: [-150, -400], haL: [-118, -560], elR: [150, -400], haR: [118, -560], tilt: 0 });
  drawFigure(sk, sx, GY, ss, Pb, { ...STUDENT, name: "student", mirror: true });
  return sk;
}

export function samples() {
  return [
    { name: "u3l1", note: "돋보기로 본 뜨거운 물속 입자", sk: cutU3l1() },
    { name: "u3l3", note: "금속 숟가락에 깜짝, 나무 숟가락은 멀쩡", sk: cutU3l3() },
    { name: "u3l3b", note: "온돌방 단면", sk: cutU3l3b() },
    { name: "u3l4", note: "같은 불, 한쪽만 펄펄", sk: cutU3l4() },
    { name: "u2l8b", note: "당나귀, 말, 노새", sk: cutU2l8b() },
    { name: "u2l2b", note: "세포벽 성벽과 태양 전지판", sk: cutU2l2b() },
  ];
}
