// 중1 과학 u6l2 만화 v2(배선 전 미리보기): 계단 위의 J자 유리관(보일 법칙). 8컷.
// 조사와 콘티: qa/sketch/research/v2/u6l2.md
//   1 1661년, 공기가 수은 기둥을 떠받칠까 → 2 끝을 막은 J자 관(갇힌 공기, 바깥 공기만큼 눌림) → 3 절반이 된 공기(누르는 힘 2배)
//   → 4 첫 관이 깨지고, 계단에 매단 더 긴 관 → 5 4배로 누르면 4분의 1 → 6 촛불을 대 보니(온도) → 7 반대로 늘이면(보일 법칙)
//   → 8 오늘날: 입자로 보면
// 보일 자신의 설명은 "공기의 용수철"이었다. 입자 설명은 마지막 컷에서 쌤이 한다. 수은을 부은 사람의 이름은 기록에 없어 이름 없는 조수로 그린다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, hash, emark, qmark, xmark, check, sparkle, drop, arrow } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, HOOKE, R } from "../../lib/figure.mjs";
import { notebook, openBook } from "../../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
// 보일: 밝은 곱슬 가발 + 푸른 외투(지금 만화의 보일과 같은 모습). 훅은 세포 만화의 그 훅. 조수: 짧은 머리 + 가죽 앞치마(이름 없음)
const BOYLE = { hair: "curls", hairColor: "#DAD3C3", coat: { color: "#3F5E8C", buttons: C.gold, seam: "#2A3F5F" }, seed: 231, mini: true, face: "calm" };
const HELPER = { hair: "short", hairColor: "#6B4A32", fringe: 24, coat: { color: "#A8794A", seam: "#7A5634", len: 52 }, seed: 251 };
const AIR = "#BFE9E2", HG = "#AEB6C0", GLASS = "#F6FBFD", PUSH = C.red, OUTSIDE = C.teal;
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

/* ---------- 유리관과 수은 ---------- */

// J자 유리관: 긴 다리(xl, 위가 열림)와 짧은 다리(xs, 위가 막힘)가 아래에서 굽어 이어진다.
//   top: 긴 다리 꼭대기, sTop: 짧은 다리 꼭대기(막힌 끝), yb: 굽은 곳 중심 높이, air: 갇힌 공기 길이, hgL: 긴 다리 수은 면(y)
function jtube(sk, o) {
  const { xl, xs, top, sTop, yb, air } = o, tw = o.tw ?? 26, sd = o.sd ?? 301, r = (xl - xs) / 2;
  const bend = ell((xl + xs) / 2, yb, r, r, 0, Math.PI);
  const path = (yL, yS) => [...dense([[xl, yL], [xl, yb]], 6), ...bend, ...dense([[xs, yb], [xs, yS]], 6)];
  const yS = sTop + air;
  thin(sk, o.k ?? 1, () => {
    sk.ink(path(top, sTop), { w: tw + 12, seed: sd, wob: 0.5, cap: "butt" });
    sk.ink(path(top, sTop + 4), { w: tw, color: GLASS, seed: sd, wob: 0.5, cap: "butt" });
    for (const sg of [-1, 1]) sk.ink(dense([[xl + sg * (tw / 2 + 3), top + 2], [xl + sg * (tw / 2 + 13), top - 6]]), { w: 6, seed: sd + 7 + sg, wob: 0.2 });
    sk.ink(path(o.hgL ?? yS, yS), { w: tw - 6, color: HG, seed: sd, wob: 0.5, cap: "butt" });
    sk.ink(dense([[xs, yS], [xs, sTop + 7]], 6), { w: tw - 6, color: o.airColor ?? AIR, seed: sd, wob: 0.5, cap: "butt" });
    sk.fill(circ(xs, sTop - 2, tw * 0.62, { over: 0, seed: sd + 2 }), GLASS, { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 });
    sk.ink(ell(xs, sTop - 2, tw * 0.62 + 2, tw * 0.62 + 2, Math.PI, Math.PI * 2), { w: 10, seed: sd + 4, wob: 0.3 });
  });
  return { yS };
}
// 종이 눈금(눈금선만, 숫자 없음): 관 옆에 붙인 종이 띠. side = 눈금이 관 쪽(-1 왼쪽에 붙임, 1 오른쪽)
function scaleStrip(sk, x, y0, y1, step, sd) {
  const strip = poly([[x - 9, y0], [x + 9, y0], [x + 9, y1], [x - 9, y1]], 3);
  sk.fill(strip, "#F5E9C9", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  for (let y = y0 + step / 2, i = 0; y < y1; y += step, i++) sk.ink(dense([[x - 9, y], [x + (i % 4 ? -1 : 6), y]]), { w: 3, color: "#8A6A4A", seed: sd + 1 + i, wob: 0 });
  sk.ink(strip, { w: 5, color: "#8A6A4A", seed: sd + 60, wob: 0.3 });
}
// 누르는 힘의 크기를 화살표 개수로(위로 향한 빨간 화살표 n개): 갇힌 공기의 아래 경계(y) 왼쪽에 둔다
function pushArrows(sk, x, y, n, sd) {
  for (let i = 0; i < n; i++) arrow(sk, [[x - i * 24, y + 52], [x - i * 24, y + 8]], { w: 6, color: PUSH, seed: sd + i, straight: true, head: 13, wob: 0.2 });
}
// 바깥 공기가 위에서 누르는 화살표(청록)
const outsidePush = (sk, x, y0, y1, sd) => arrow(sk, [[x, y0], [x, y1]], { w: 7, color: OUTSIDE, seed: sd, straight: true, head: 16, wob: 0.2 });
// 처음 공기 길이(점선)와 지금 길이(청록 실선)를 짧은 다리 옆에 나란히
function airLengths(sk, x, y0, yNow, yWas, sd) {
  sk.ink(dense([[x, y0], [x, yWas]]), { w: 5, color: C.gray, dash: [9, 9], seed: sd, wob: 0 });
  sk.ink(dense([[x - 10, yWas], [x + 10, yWas]]), { w: 5, color: C.gray, seed: sd + 1, wob: 0 });
  sk.ink(dense([[x - 22, y0 + 4], [x - 22, yNow]]), { w: 7, color: OUTSIDE, seed: sd + 2, wob: 0.2 });
  for (const y of [y0 + 4, yNow]) sk.ink(dense([[x - 32, y], [x - 12, y]]), { w: 6, color: OUTSIDE, seed: sd + 3 + y, wob: 0 });
}
// 높이 표시 괄호(주황)
function bracket(sk, x, y0, y1, sd) {
  sk.ink(dense([[x, y0], [x, y1]]), { w: 7, color: C.orange, seed: sd, wob: 0.2 });
  for (const y of [y0, y1]) sk.ink(dense([[x - 10, y], [x + 10, y]]), { w: 6, color: C.orange, seed: sd + 1 + y, wob: 0 });
}
// 토리첼리의 수은 기둥: 수은 그릇에 거꾸로 세운 관. (x, dish) = 그릇 수은 면, colH = 그릇 면 위 수은 기둥 높이, tubeH = 관 높이
function barometer(sk, x, dish, colH, tubeH, sd, o = {}) {
  const d = curve([[x - 70, dish - 6], [x - 58, dish + 30], [x + 58, dish + 30], [x + 70, dish - 6]], false, 3);
  sk.fill([...d, d[0]], HG, { dx: 0, dy: 0, wob: 0.4, seed: sd });
  thin(sk, 0.9, () => {
    sk.ink(dense([[x, dish + 12], [x, dish - tubeH]]), { w: 34, seed: sd + 1, wob: 0.4 });
    sk.ink(dense([[x, dish + 12], [x, dish - tubeH + 6]]), { w: 22, color: GLASS, seed: sd + 1, wob: 0.4, cap: "butt" });
    sk.ink(dense([[x, dish + 12], [x, dish - colH]]), { w: 18, color: HG, seed: sd + 1, wob: 0.4, cap: "butt" });
    sk.ink(d, { w: 9, seed: sd + 2 });
  });
  if (o.push) for (const dx of [-46, 46]) outsidePush(sk, x + dx, dish - 64, dish - 12, sd + 4 + dx);
}

/* ---------- 소품 ---------- */

function table(sk, x0, x1, y, sd, bottom = 704) {
  thin(sk, 0.85, () => {
    for (const lx of [x0 + 24, x1 - 24]) sk.ink(dense([[lx, y + 20], [lx, bottom]]), { w: 11, color: "#6B4A32", seed: sd + lx, wob: 0.3 });
    const top = rrect(x0, y, x1 - x0, 24, 8); sk.fill(top, C.wood, { seed: sd, tex: true, texAng: 0.02 }); sk.ink(top, { w: 10, seed: sd + 1 });
  });
}
// 유리를 구부리던 기름 등잔: 놋쇠 몸통 + 주둥이 심지의 맨 불꽃(유리 갓 없음). (x, y) = 바닥 가운데
function oilLamp(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const base = curve([[-40, 0], [-34, -30], [-14, -44], [14, -44], [34, -30], [40, 0]], false, 3);
    sk.fill([...base, base[0]], "#C9A24A", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd }); sk.ink([...base, base[0]], { w: 8, seed: sd + 1 });
    const spout = poly([[24, -40], [62, -52], [64, -44], [30, -30]], 3);
    sk.fill(spout, "#C9A24A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 }); sk.ink(spout, { w: 6, seed: sd + 3 });
    const fl = curve([[62, -52], [50, -74], [62, -104], [74, -74]], true, 3); sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 }); sk.ink(fl, { w: 5, color: C.red, seed: sd + 5, wob: 0.3 });
    const core = curve([[62, -58], [56, -70], [62, -86], [68, -70]], true, 3); sk.fill(core, C.yellow, { dx: 0, dy: 0, wob: 0.2, seed: sd + 6 });
  });
}
// 촛불. (x, y) = 촛대 바닥
function candle(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const dish = ell(0, 0, 40, 10); sk.fill(dish, "#C9A24A", { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(dish, { w: 7, seed: sd + 1 });
    const c = rrect(-14, -110, 28, 110, 6); sk.fill(c, "#FBF6E6", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 2 }); sk.ink(c, { w: 8, seed: sd + 3 });
    sk.ink(dense([[0, -110], [0, -122]]), { w: 4, seed: sd + 4, wob: 0 });
    const fl = curve([[0, -118], [-14, -140], [0, -178], [14, -140]], true, 3); sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: sd + 5 }); sk.ink(fl, { w: 5, color: C.red, seed: sd + 6, wob: 0.3 });
    const core = curve([[0, -124], [-6, -136], [0, -152], [6, -136]], true, 3); sk.fill(core, C.yellow, { dx: 0, dy: 0, wob: 0.2, seed: sd + 7 });
  });
}
// 깨진 유리 조각
function shards(sk, list, sd) {
  list.forEach(([x, y, rot], i) => sk.at(x, y, 1, () => { const s = poly([[-16, 9], [0, -18], [17, 11]], 2); sk.fill(s, "#E6F2F9", { dx: 0, dy: 0, wob: 0.3, seed: sd + i }); sk.ink(s, { w: 5, seed: sd + 20 + i, wob: 0.3 }); }, rot));
}
// 수은 방울
const beads = (sk, list, sd) => list.forEach(([x, y, r], i) => { const b = circ(x, y, r, { over: 0.15, seed: sd + i }); sk.fill(b, HG, { dx: 0, dy: 0, wob: 0.4, seed: sd + 20 + i }); sk.ink(b, { w: Math.max(4, r * 0.4), seed: sd + 40 + i, wob: 0.4 }); sk.dot(x - r * 0.3, y - r * 0.3, r * 0.22, C.white); });
// 손거울(수은 면을 비춰 보던 작은 거울). (x, y) = 손잡이 끝
function handMirror(sk, x, y, s, rot, sd) {
  sk.at(x, y, s, () => {
    sk.ink(dense([[0, 0], [0, -40]]), { w: 9, color: "#8A5A33", seed: sd, wob: 0.2 });
    const m = ell(0, -72, 26, 34); sk.fill(m, "#CFE6F5", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 }); sk.ink(m, { w: 8, color: "#B8892E", seed: sd + 2, wob: 0.3 });
    sk.ink(curve([[-10, -86], [-2, -96], [8, -98]]), { w: 4, color: C.white, seed: sd + 3, wob: 0.1 });
  }, rot);
}
// 잰 값을 적은 표(칸만 있고 숫자는 없다). (x, y) = 가운데
function tablePaper(sk, x, y, s, rot, sd) {
  sk.at(x, y, s, () => {
    const p = poly([[-60, -76], [60, -76], [60, 76], [-60, 76]], 4);
    sk.fill(p, C.parchment, { dx: 1, dy: 1.2, wob: 0.4, seed: sd }); sk.ink(p, { w: 8, seed: sd + 1 });
    for (let i = 1; i < 5; i++) sk.ink(dense([[-50, -76 + i * 30], [50, -76 + i * 30]]), { w: 3, color: C.gray, seed: sd + 2 + i, wob: 0.1 });
    for (const cx of [-20, 18]) sk.ink(dense([[cx, -66], [cx, 66]]), { w: 3, color: C.gray, seed: sd + 10 + cx, wob: 0.1 });
    for (let i = 0; i < 4; i++) for (const cx of [-40, -2, 36]) sk.ink(dense([[cx, -38 + i * 30], [cx + 12, -38 + i * 30]]), { w: 4, color: "#5A5F68", seed: sd + 20 + i + cx, wob: 0.2 });
  }, rot);
}
// 끝을 막은 주사기와 그 속의 입자(옆에서 본 단면). (x0, y) = 통 왼쪽 끝 가운데, len = 통 길이, px = 피스톤 위치(x)
function syringe(sk, x0, y, len, px, sd, hit) {
  const x1 = x0 + len;
  const barrel = rrect(x0, y - 50, len, 100, 16);
  sk.fill(barrel, GLASS, { dx: 0, dy: 0, wob: 0.4, seed: sd });
  sk.fill(poly([[px + 14, y - 42], [x1 - 8, y - 42], [x1 - 8, y + 42], [px + 14, y + 42]], 4), "#E4F6F3", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
  sk.ink(barrel, { w: 9, seed: sd + 2 });
  const pis = rrect(px - 10, y - 46, 24, 92, 6); sk.fill(pis, "#5A5F68", { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 }); sk.ink(pis, { w: 6, seed: sd + 4 });
  const hx = px - 250; // 손잡이는 피스톤과 함께 움직인다(막대 길이 일정)
  sk.ink(dense([[px - 10, y], [hx, y]]), { w: 12, color: "#8A9099", seed: sd + 5, wob: 0.3 });
  sk.ink(dense([[hx, y - 44], [hx, y + 44]]), { w: 12, seed: sd + 6, wob: 0.4 });
  sk.ink(dense([[x0, y - 62], [x0, y + 62]]), { w: 9, seed: sd + 11, wob: 0.4 });
  const tip = rrect(x1, y - 12, 40, 24, 6); sk.fill(tip, GLASS, { dx: 0, dy: 0, wob: 0.3, seed: sd + 7 }); sk.ink(tip, { w: 7, seed: sd + 8 });
  const cap = rrect(x1 + 36, y - 18, 22, 36, 6); sk.fill(cap, C.red, { dx: 0, dy: 0, wob: 0.3, seed: sd + 9 }); sk.ink(cap, { w: 7, seed: sd + 10 });
  // 입자 여덟 개: 피스톤과 끝 사이에 고르게
  const room = x1 - 10 - (px + 20), pts = [[0.12, 0.25], [0.38, 0.7], [0.62, 0.22], [0.86, 0.68], [0.24, 0.78], [0.5, 0.42], [0.74, 0.86], [0.92, 0.3]];
  pts.forEach(([u, v], i) => { const c = circ(px + 20 + u * room, y - 34 + v * 68, 11, { over: 0.15, seed: sd + 20 + i }); sk.fill(c, C.teal, { dx: 0, dy: 0, wob: 0.3, seed: sd + 30 + i }); sk.ink(c, { w: 5, seed: sd + 40 + i, wob: 0.3 }); });
  if (hit) for (const [hx, hy, a] of [[x1 - 6, y - 20, 0], [x1 - 6, y + 22, 0], [(px + x1) / 2, y - 50, -Math.PI / 2], [(px + x1) / 2, y + 50, Math.PI / 2], [px + 16, y, Math.PI]]) for (const da of [-0.5, 0, 0.5]) sk.ink(dense([[hx + 12 * Math.cos(a + da), hy + 12 * Math.sin(a + da)], [hx + 28 * Math.cos(a + da), hy + 28 * Math.sin(a + da)]]), { w: 4.5, color: C.orange, seed: sd + 60, wob: 0 });
}

/* ---------- 1. 1661년: 공기가 수은 기둥을 떠받칠까 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  ground(sk, 704, 11);
  table(sk, 470, 900, 600, 13);
  // 토리첼리의 수은 기둥: 바깥 공기가 그릇의 수은을 눌러 기둥을 떠받친다
  barometer(sk, 640, 584, 360, 420, 15, { push: true });
  bracket(sk, 696, 224, 580, 21);
  // 반박하는 책과 물음표
  openBook(sk, 820, 600, 0.8, { color: "#7A5A45", seed: 23 });
  qmark(sk, 820, 470, 0.7, { color: C.gray, seed: 25 });
  const P = pose({ elR: [96, -320], haR: [170, -360], elL: [-56, -262], haL: [-40, -214], tilt: 0.06 });
  drawFigure(sk, 250, 704, 0.72, P, { ...BOYLE, name: "boyle", face: "determined" });
  return sk;
}

/* ---------- 2. 끝을 막은 J자 관 ---------- */
const XS = 470, XL = 550, STOP = 380, YB = 640, AIR0 = 168;
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 704, 31);
  // 관을 구부린 등잔
  table(sk, 730, 920, 560, 33);
  oilLamp(sk, 820, 560, 1, 35);
  const t = jtube(sk, { xl: XL, xs: XS, top: 110, sTop: STOP, yb: YB, air: AIR0, hgL: STOP + AIR0, sd: 301 });
  scaleStrip(sk, XS - 36, STOP + 6, STOP + 200, 14, 311);
  scaleStrip(sk, XL + 36, 130, YB - 40, 18, 331);
  outsidePush(sk, XL, 40, 100, 37);
  pushArrows(sk, XS - 78, t.yS, 1, 39);
  const P = pose({ elR: [96, -296], haR: [176, -306], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 200, 704, 0.66, P, { ...BOYLE, name: "boyle" });
  return sk;
}

/* ---------- 3. 절반이 된 공기 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 704, 51);
  const air = AIR0 / 2, Hh = 406;
  const yS = STOP + air;
  jtube(sk, { xl: XL, xs: XS, top: 40, sTop: STOP, yb: YB, air, hgL: yS - Hh, sd: 303 });
  airLengths(sk, XS - 40, STOP, yS, STOP + AIR0, 53);
  pushArrows(sk, XS - 96, yS, 2, 57);
  bracket(sk, XL + 40, yS - Hh, yS, 59);
  // 옆에 세운 수은 기둥: 같은 높이
  barometer(sk, 790, 650, Hh, Hh + 50, 61);
  bracket(sk, 846, 650 - Hh, 646, 67);
  for (const dy of [0, 18]) sk.ink(dense([[640, 360 + dy], [690, 360 + dy]]), { w: 7, color: C.orange, seed: 69 + dy, wob: 0.2 });
  const P = pose({ elR: [96, -300], haR: [172, -300], elL: [-60, -300], haL: [-110, -360], tilt: 0.06 });
  drawFigure(sk, 200, 704, 0.66, P, { ...BOYLE, name: "boyle", face: "happy" });
  return sk;
}

/* ---------- 4. 첫 관이 깨지고, 계단에 매단 더 긴 관 ---------- */
// 계단(오른쪽으로 올라간다) + 난간
function stairs(sk, x0, y0, n, rise, run, sd = 321) {
  const pts = [[x0, y0]];
  for (let i = 0; i < n; i++) { pts.push([x0 + i * run, y0 - (i + 1) * rise]); pts.push([x0 + (i + 1) * run, y0 - (i + 1) * rise]); }
  pts.push([980, y0 - n * rise], [980, y0 + 40], [x0, y0 + 40]);
  thin(sk, 0.8, () => {
    sk.fill(poly(pts, 4), "#D9B07A", { seed: sd, tex: true, texAng: 0.03 }); sk.ink(poly(pts, 4), { w: 10, seed: sd + 1 });
    for (let i = 0; i < n; i++) { const bx = x0 + i * run + run * 0.5, by = y0 - (i + 1) * rise; sk.ink(dense([[bx, by], [bx, by - 150]]), { w: 6, color: "#8A5A33", seed: sd + 3 + i, wob: 0.3 }); }
    sk.ink(dense([[x0 + run * 0.5 - 20, y0 - rise - 150 + rise * 0.4], [x0 + (n - 0.5) * run + 40, y0 - n * rise - 150 - rise * 0.4]]), { w: 12, color: "#8A5A33", seed: sd + 30, wob: 0.5 });
  });
}
// 쏟아지는 수은을 받는 나무 상자
function box(sk, x0, x1, y, sd = 341) {
  thin(sk, 0.85, () => {
    const b = poly([[x0, y - 74], [x1, y - 74], [x1 - 6, y], [x0 + 6, y]], 4);
    sk.fill(b, "#C49A5E", { seed: sd, tex: true, texAng: 0.03 }); sk.ink(b, { w: 9, seed: sd + 1 });
    sk.ink(dense([[x0 + 3, y - 38], [x1 - 3, y - 38]]), { w: 5, color: C.woodDark, seed: sd + 2, wob: 0.4 });
  });
}
// 깨진 첫 관: 굽은 토막 + 곧은 토막(끝이 들쭉날쭉) + 흩어진 수은
function brokenTube(sk, sd) {
  sk.at(150, 662, 1, () => {
    const bend = ell(0, 0, 34, 34, 0, Math.PI);
    const legs = [...dense([[34, -70], [34, 0]], 6), ...bend, ...dense([[-34, 0], [-34, -40]], 6)];
    sk.ink(legs, { w: 30, seed: sd, wob: 0.4, cap: "butt" }); sk.ink(legs, { w: 18, color: GLASS, seed: sd, wob: 0.4, cap: "butt" });
    for (const [x, y] of [[34, -70], [-34, -40]]) sk.ink(dense([[x - 15, y], [x - 6, y - 12], [x + 3, y + 2], [x + 15, y - 10]], 3), { w: 5, seed: sd + x, wob: 0.2 });
  }, 1.35);
  sk.at(70, 690, 1, () => {
    sk.ink(dense([[0, 0], [110, -6]]), { w: 30, seed: sd + 5, wob: 0.4, cap: "butt" }); sk.ink(dense([[0, 0], [110, -6]]), { w: 18, color: GLASS, seed: sd + 5, wob: 0.4, cap: "butt" });
    sk.ink(dense([[110, -21], [100, -10], [114, -2], [106, 9]], 3), { w: 5, seed: sd + 6, wob: 0.2 });
  }, -0.05);
  beads(sk, [[230, 694, 14], [262, 690, 9], [196, 698, 8], [290, 696, 7], [120, 700, 6]], sd + 10);
}
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  ground(sk, 704, 71);
  stairs(sk, 430, 704, 6, 62, 54, 321);
  // 끈으로 층계참 난간에 매단 긴 관: 굽은 곳은 나무 상자 안, 입구는 층계참 바로 위
  const xs = 630, xl = 700, sTop = 520, yb = 660;
  for (const [y, i] of [[330, 0], [470, 1]]) { sk.ink(dense([[xl + 2, y], [790, y - 120]]), { w: 3.5, color: "#8A6A4A", seed: 73 + i, wob: 0.3 }); sk.ink(dense([[xl - 18, y], [xl + 18, y + 2]]), { w: 6, color: "#8A6A4A", seed: 75 + i, wob: 0.3 }); }
  jtube(sk, { xl, xs, top: 296, sTop, yb, air: 44, hgL: 470, sd: 305, tw: 22 });
  scaleStrip(sk, xs - 30, sTop + 4, sTop + 64, 8, 313);
  box(sk, 580, 750, 704, 341);
  brokenTube(sk, 77);
  // 조수: 층계참에 서서 관 입구 위에서 조금씩 붓는다
  const hp = pose({ elL: [-70, -360], haL: [-150, -330], elR: [56, -268], haR: [30, -220], tilt: -0.1 });
  const hx0 = 806, hy0 = 704 - 6 * 62, hs = 0.48;
  drawFigure(sk, hx0, hy0, hs, hp, { ...HELPER, name: "helper", hands: "R" });
  const fx = hx0 - hs * 150, fy = hy0 - hs * 330;
  sk.at(fx - 10, fy + 4, 1, () => { const fl = curve([[-14, -30], [-20, 6], [0, 22], [20, 6], [14, -30]], false, 3); sk.fill([...fl, fl[0]], "#DCE4EA", { dx: 0, dy: 0, wob: 0.4, seed: 85 }); sk.ink([...fl, fl[0]], { w: 7, seed: 86 }); }, -2.0);
  sk.ink(curve([[fx - 30, fy + 18], [xl + 8, fy + 40], [xl, 300]]), { w: 6, color: HG, seed: 87, wob: 0.3 });
  handDot(sk, [fx + 4, fy + 4], C.skin, 88, 8);
  // 보일: 아래에서 손거울로 짧은 쪽 수은 면을 보며 알려 준다
  const bp = pose({ elR: [80, -300], haR: [150, -330], elL: [-50, -260], haL: [-24, -218], tilt: 0.08 });
  const bx = 400, bs = 0.6;
  drawFigure(sk, bx, 704, bs, bp, { ...BOYLE, name: "boyle", hands: "L" });
  handMirror(sk, bx + bs * 150, 704 - bs * 330, 0.8, 0.3, 89);
  handDot(sk, [bx + bs * 150, 704 - bs * 330], C.skin, 91, 9);
  return sk;
}

/* ---------- 5. 4배로 누르면 4분의 1 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  ground(sk, 704, 101);
  // 가까이 본 관: 긴 쪽 수은 기둥은 그림 위로 한참 더 이어진다
  const xs = 450, xl = 530, sTop = 330, yb = 640, air = AIR0 / 4;
  const t = jtube(sk, { xl, xs, top: -30, sTop, yb, air, hgL: -30, sd: 307 });
  airLengths(sk, xs - 40, sTop, t.yS, sTop + AIR0, 103);
  pushArrows(sk, xs - 96, t.yS, 4, 107);
  arrow(sk, [[xl + 56, 200], [xl + 56, 70]], { w: 8, color: C.orange, seed: 111, straight: true, head: 20, wob: 0.2 });
  // 보일: 잰 값을 적은 표를 들고 있다
  const P = pose({ elL: [-70, -300], haL: [-130, -330], elR: [56, -262], haR: [40, -214], tilt: -0.04 });
  const fx = 780, fy = 704, fs = 0.66;
  drawFigure(sk, fx, fy, fs, P, { ...BOYLE, name: "boyle", face: "smile", hands: "R" });
  tablePaper(sk, fx - fs * 130 - 40, fy - fs * 330, 0.9, -0.1, 113);
  handDot(sk, [fx - fs * 130, fy - fs * 330], C.skin, 115, 10);
  check(sk, fx - fs * 130 - 20, fy - fs * 330 - 100, 0.6);
  return sk;
}

/* ---------- 6. 촛불을 대 보니 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 704, 121);
  // 가까이 본 짧은 다리: 눌린 공기에 촛불을 대자 공기가 늘어나 수은을 밀어낸다
  const xs = 560, xl = 680, sTop = 170, yb = 600, air = 120;
  const t = jtube(sk, { xl, xs, top: -30, sTop, yb, air, hgL: -30, sd: 309, tw: 46, airColor: "#F7D9B8" });
  sk.ink(dense([[xs - 60, sTop + 6], [xs - 60, sTop + 92]]), { w: 5, color: C.gray, dash: [9, 9], seed: 123, wob: 0 });
  sk.ink(dense([[xs - 70, sTop + 92], [xs - 50, sTop + 92]]), { w: 5, color: C.gray, seed: 124, wob: 0 });
  arrow(sk, [[xs + 46, t.yS - 40], [xs + 46, t.yS + 20]], { w: 7, color: C.orange, seed: 125, straight: true, head: 16, wob: 0.2 });
  for (const [y, i] of [[206, 0], [234, 1], [262, 2]]) sk.ink(curve([[420, y], [440, y - 8], [462, y + 6], [484, y - 6], [506, y + 4], [524, y]]), { w: 5, color: C.orange, seed: 127 + i, wob: 0.3, alpha: 0.85 });
  // 보일: 촛불을 갇힌 공기 높이로 들고, 깨질까 걱정한다
  const P = pose({ elR: [100, -430], haR: [176, -540], elL: [-50, -260], haL: [-24, -218], tilt: 0.04 });
  const fx = 300, fy = 704, fs = 0.66;
  drawFigure(sk, fx, fy, fs, P, { ...BOYLE, name: "boyle", face: "wide", hands: "L" });
  candle(sk, fx + fs * 176 + 2, fy - fs * 540 + 44, 0.6, 131);
  handDot(sk, [fx + fs * 176, fy - fs * 540 + 30], C.skin, 133, 10);
  drop(sk, 206, 336, 1);
  return sk;
}

/* ---------- 7. 반대로 늘이면 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  ground(sk, 704, 141);
  // 수은을 채운 굵은 관 + 그 속에 꽂은 가는 관. 가는 관을 끌어올리면 꼭대기에 갇힌 공기가 늘어난다
  const wx = 560, top = 300;
  thin(sk, 0.9, () => {
    const wide = poly([[wx - 46, top], [wx + 46, top], [wx + 46, 690], [wx - 46, 690]], 5);
    sk.fill(wide, HG, { dx: 0, dy: 0, wob: 0.5, seed: 143, tex: 0.5, texAng: 1.5 });
    sk.ink(dense([[wx - 46, top - 14], [wx - 46, 690], [wx + 46, 690], [wx + 46, top - 14]], 5), { w: 10, seed: 144 });
    sk.ink(dense([[wx, 90], [wx, 640]]), { w: 32, seed: 145, wob: 0.4 });
    sk.ink(dense([[wx, 96], [wx, 646]]), { w: 20, color: GLASS, seed: 145, wob: 0.4, cap: "butt" });
    sk.ink(dense([[wx, 236], [wx, 646]]), { w: 16, color: HG, seed: 145, wob: 0.4, cap: "butt" });
    sk.ink(dense([[wx, 100], [wx, 236]]), { w: 16, color: AIR, seed: 145, wob: 0.4, cap: "butt" });
    const wax = circ(wx, 88, 20, { over: 0.15, seed: 146, lump: 0.1 }); sk.fill(wax, "#B0504A", { dx: 0, dy: 0, wob: 0.4, seed: 147 }); sk.ink(wax, { w: 7, seed: 148 });
  });
  // 처음 공기 길이(점선)와 늘어난 길이
  sk.ink(dense([[wx + 44, 102], [wx + 44, 168]]), { w: 5, color: C.gray, dash: [9, 9], seed: 149, wob: 0 });
  sk.ink(dense([[wx + 34, 168], [wx + 54, 168]]), { w: 5, color: C.gray, seed: 150, wob: 0 });
  sk.ink(dense([[wx + 70, 102], [wx + 70, 236]]), { w: 7, color: OUTSIDE, seed: 151, wob: 0.2 });
  for (const y of [102, 236]) sk.ink(dense([[wx + 60, y], [wx + 80, y]]), { w: 6, color: OUTSIDE, seed: 152 + y, wob: 0 });
  arrow(sk, [[wx + 130, 250], [wx + 130, 140]], { w: 9, color: C.teal, seed: 155, straight: true, head: 22, wob: 0.3 });
  // 보일: 두 손을 들어 가는 관을 끌어올린다. 훅: 굵은 관을 붙든다
  const bp = pose({ elR: [96, -470], haR: [196, -600], elL: [92, -420], haL: [190, -540], tilt: 0.04 });
  const bx = 410, bs = 0.68;
  drawFigure(sk, bx, 704, bs, bp, { ...BOYLE, name: "boyle", face: "happy" });
  const hp = pose({ elL: [-90, -290], haL: [-150, -262], elR: [56, -262], haR: [30, -214], tilt: -0.04 });
  drawFigure(sk, 712, 704, 0.62, hp, { ...HOOKE, name: "hooke", face: "smile" });
  return sk;
}

/* ---------- 8. 오늘날: 입자로 보면 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  ground(sk, 704, 161);
  // 끝을 막은 주사기 둘: 피스톤을 누르면 입자의 개수는 그대로, 사이만 가까워지고 벽에 더 자주 부딪힌다
  syringe(sk, 520, 220, 380, 556, 163, false);
  syringe(sk, 520, 480, 380, 746, 201, true);
  arrow(sk, [[396, 480], [478, 480]], { w: 9, color: C.red, seed: 241, straight: true, head: 22, wob: 0.3 });
  const P = pose({ elR: [88, -316], haR: [158, -340], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 150, 704, 0.66, P, { ...TEACHER, name: "teacher" });
  return sk;
}

export const META = {
  title: "계단 위의<br><em>J자 유리관</em>",
  lead: "1661년 영국, 공기를 가두고 수은으로 눌러 본 보일의 실험을 따라가요.",
  narrator: "보이지도 않는 공기가 얼마나 세게 되밀어 낼까요? 보일은 끝을 막은 유리관에 공기를 가두고 <b>수은</b>을 부어 그 힘을 쟀어요.",
  cta: "주사기 연구소 열기",
};

const CUTS = [
  {
    fn: p1, when: "1661년, 영국", stage: "궁금증", title: "공기가 수은을 떠받칠까",
    caption: "수은을 채운 유리관을 수은 그릇에 거꾸로 세우면 수은이 75 cm쯤 높이에서 멈춰요. <b>로버트 보일</b>은 바깥 공기가 그릇의 수은을 눌러 이 기둥을 떠받친다고 보았어요. 그런데 한 학자가 공기의 힘만으로는 어림없고 보이지 않는 끈이 수은을 매단다고 반박했어요. 보일은 공기가 얼마나 세게 버티는지 재 보기로 했지요.",
    bubbles: [{ who: "boyle", text: "공기가<br>떠받쳐요!" }],
  },
  {
    fn: p2, when: "1661년, 영국", stage: "실험 준비", title: "끝을 막은 J자 관",
    caption: "솜씨 좋은 사람이 등불로 긴 유리관의 아래를 J자로 구부렸어요. 짧은 쪽 끝은 막고 양쪽에 종이 눈금을 붙였지요. 수은을 조금 부어 양쪽 높이를 맞추자 짧은 쪽 끝에 <b>공기가 갇혔어요</b>. 이 공기는 바깥 공기와 같은 힘으로 눌려 있어요.",
    bubbles: [{ who: "boyle", text: "공기를<br>가뒀어요" }],
  },
  {
    fn: p3, when: "1661년, 영국", stage: "놀라운 결과", title: "절반이 된 공기",
    caption: "긴 쪽에 수은을 부어 갇힌 공기를 눌렀어요. 공기가 처음의 <b>절반</b>이 되었을 때, 긴 쪽 수은은 짧은 쪽보다 29인치(약 74 cm) 높았어요. 그날 바깥 공기가 떠받치던 수은 기둥과 같은 높이예요. 처음부터 누르던 바깥 공기에 그만큼을 더했으니 누르는 힘이 <b>2배</b>가 된 거예요.",
    bubbles: [{ who: "boyle", text: "절반이<br>됐어!" }],
  },
  {
    fn: p4, when: "1661년, 영국", stage: "다시 도전", title: "계단에 매단 더 긴 관",
    caption: "그런데 첫 관이 그만 깨지고 말았어요. 보일은 방에 세울 수 없을 만큼 긴 관을 구해 밝은 계단에 끈으로 매달고, 아래에는 수은을 받을 나무 상자를 두었어요. 두 사람이 함께했는데, 한 사람은 위에서 수은을 붓고 다른 한 사람은 아래에서 눈금을 보며 조금씩 부으라고 알려 주었어요.",
    bubbles: [{ who: "boyle", text: "조금씩<br>부어요!" }],
  },
  {
    fn: p5, when: "1661년, 영국", stage: "더 세게", title: "4분의 1이 된 공기",
    caption: "긴 쪽 수은이 짧은 쪽보다 88인치(약 2.25 m)나 높아지도록 부어 누르는 힘을 처음의 4배로 만들자, 공기는 처음의 <b>4분의 1</b>이 되었어요. 2배로 누르면 절반, 4배로 누르면 4분의 1. 보일이 표에 적은 값은 이 규칙으로 짐작한 값과 100분의 1쯤밖에 다르지 않았어요.",
    bubbles: [{ who: "boyle", text: "4배면<br>4분의 1!" }],
  },
  {
    fn: p6, when: "1661년, 영국", stage: "뜻밖의 발견", title: "촛불을 대 보니",
    caption: "보일은 눌린 공기에 촛불을 가까이 대 보았어요. 그러자 공기가 늘어나며 수은을 밀어냈어요. 유리가 깨질까 봐 더 데우지는 못했지요. 공기의 부피는 누르는 힘뿐 아니라 <b>온도</b>에 따라서도 달라져요. 그래서 누르는 힘과 부피의 규칙은 온도가 같을 때의 이야기예요.",
    bubbles: [{ who: "boyle", text: "유리가<br>깨질라!" }],
  },
  {
    fn: p7, when: "1661년, 영국", stage: "반대로 늘이면", title: "늘어나는 공기",
    caption: "이번엔 수은 속에 꽂은 가는 관을 끌어올려 갇힌 공기를 늘였어요. 조수 <b>훅</b>이 도운 것으로 보여요. 누르는 힘이 절반으로 줄자 부피는 2배가 되었어요. 한쪽이 2배가 되면 다른 쪽은 절반이 되는 <b>반비례</b>예요. 친구 타운리가 짐작한 규칙을 보일이 실험으로 확인한 거예요.",
    term: { name: "보일 법칙", def: "온도가 일정할 때, 기체의 압력과 부피는 반비례해요." },
    bubbles: [{ who: "boyle", text: "늘이면<br>늘어나네!", side: "right" }],
  },
  {
    fn: p8, stage: "오늘날", title: "입자로 보면",
    caption: "보일은 눌린 공기가 되밀어 내는 힘을 '공기의 용수철'이라고 불렀지만 왜 그런지는 정하지 못했어요. 오늘날에는 <b>입자</b>로 설명해요. 끝을 막은 주사기를 누르면 입자의 개수는 그대로인 채 사이만 가까워져, 벽에 더 자주 부딪혀요. 그래서 압력이 커지지요.",
    bubbles: [{ who: "teacher", text: "개수는<br>그대로!" }],
  },
];

export function panels() {
  return CUTS.map(c => ({ sk: c.fn(), bubbles: c.bubbles, when: c.when, whenPos: c.whenPos, stage: c.stage, title: c.title, caption: c.caption, term: c.term }));
}
