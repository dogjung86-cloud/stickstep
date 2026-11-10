// 중1 과학 u5l3 도입 만화: 사과에서 달까지(중력, 무게, 질량). 7컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u5l3.md.
//   1 1666년 과수원, 떨어지는 사과 → 2 왜 늘 땅 쪽으로(중력) → 3 오늘의 실험실, 용수철저울(무게)
//   → 4 달에서 다시 매달면 → 5 달에서도 수평인 양팔저울(질량) → 6 다시 1666년, 달까지 닿을까(첫 계산은 어긋남)
//   → 7 1687년, 달도 떨어지고 있다
// 사과가 머리에 맞았다는 이야기는 그리지 않는다. 지구 둘레 사방에서 놓아 보는 그림은 바로 뒤 랩의 몫이라 뺐다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, xmark, check, sparkle, drop, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, R } from "../lib/figure.mjs";
import { cloud, earth, openBook } from "../lib/props.mjs";

const W = 960, H = 720;
// 뉴턴: 어깨까지 오는 밝은 긴 머리 + 붉은 갈색 외투
const NEWTON = { hair: "curls", hairColor: "#C4AC80", coat: { color: "#7E3B45", buttons: C.gold, seam: "#55242C" }, seed: 191 };
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

function apple(sk, x, y, r, sd = 11) {
  const b = curve([[x, y - r * 0.82], [x + r * 0.7, y - r * 0.98], [x + r, y - r * 0.2], [x + r * 0.62, y + r * 0.86], [x, y + r * 0.74], [x - r * 0.62, y + r * 0.86], [x - r, y - r * 0.2], [x - r * 0.7, y - r * 0.98]], true, 4);
  sk.fill(b, C.red, { dx: 0.8, dy: 1, wob: 0.5, seed: sd });
  sk.ink(b, { w: Math.max(4.5, r * 0.22), seed: sd + 1, wob: 0.5 });
  sk.ink(curve([[x - r * 0.5, y - r * 0.1], [x - r * 0.42, y - r * 0.5], [x - r * 0.1, y - r * 0.62]]), { w: Math.max(3, r * 0.14), color: C.white, seed: sd + 2, wob: 0.2 });
  sk.ink(dense([[x, y - r * 0.8], [x + r * 0.14, y - r * 1.3]]), { w: Math.max(3.5, r * 0.16), color: "#6B4A32", seed: sd + 3, wob: 0.2 });
  const lf = curve([[x + r * 0.14, y - r * 1.2], [x + r * 0.6, y - r * 1.5], [x + r * 0.9, y - r * 1.2], [x + r * 0.5, y - r * 1.06]], true, 2);
  sk.fill(lf, C.green, { dx: 0, dy: 0, wob: 0.2, seed: sd + 4 }); sk.ink(lf, { w: Math.max(3, r * 0.12), seed: sd + 5, wob: 0.2 });
}
// 사과나무: 줄기 + 둥근 잎 뭉치 + 빨간 사과. 원점 = 밑동
function tree(sk, x, y, s, apples, sd = 21) {
  sk.at(x, y, s, () => {
    const trunk = poly([[-26, 0], [-18, -200], [18, -200], [28, 0]], 4);
    sk.fill(trunk, "#8A5A33", { seed: sd, tex: true, texAng: 1.5 }); sk.ink(trunk, { w: 10, seed: sd + 1 });
    const top = curve([[-40, -190], [-160, -210], [-200, -320], [-150, -430], [-50, -490], [50, -500], [150, -440], [206, -330], [166, -220], [50, -190]], true, 5);
    sk.fill(top, "#7DBE6A", { seed: sd + 2, tex: true, texAng: 0.6 }); sk.ink(top, { w: 11, seed: sd + 3 });
  });
  apples.forEach(([dx, dy], i) => apple(sk, x + dx * s, y + dy * s, 22 * s, sd + 10 + i * 7));
}
// 받침대(ㄱ자): (x, y) = 기둥 밑, h = 높이, arm = 가로대 길이(음수면 왼쪽으로)
function stand(sk, x, y, h, arm, sd = 51) {
  const base = rrect(x - 70, y - 16, 140, 16, 6);
  sk.fill(base, "#8A9099", { seed: sd, dx: 0.6, dy: 0.8 }); sk.ink(base, { w: 8, seed: sd + 1 });
  sk.ink(dense([[x, y - 16], [x, y - h]]), { w: 11, color: "#5A5F68", seed: sd + 2, wob: 0.5 });
  sk.ink(dense([[x, y - h], [x + arm, y - h]]), { w: 11, color: "#5A5F68", seed: sd + 3, wob: 0.5 });
}
// 용수철저울과 매단 사과: (x, y) = 매다는 점. len = 용수철이 늘어난 길이. 사과 가운데의 y 를 돌려준다
function springScale(sk, x, y, len, sd = 61) {
  sk.ink(circ(x, y + 12, 10, { seed: sd }), { w: 6, seed: sd + 1, wob: 0.3 });
  const body = rrect(x - 26, y + 22, 52, 70, 10);
  sk.fill(body, "#E9A23B", { seed: sd + 2, dx: 0.8, dy: 1 }); sk.ink(body, { w: 8, seed: sd + 3 });
  for (let i = 0; i < 4; i++) sk.ink(dense([[x - 12, y + 38 + i * 13], [x + (i % 2 ? 4 : 12), y + 38 + i * 13]]), { w: 3.5, seed: sd + 4 + i, wob: 0 });
  const y0 = y + 92, n = 9, pts = [[x, y0]];
  for (let i = 1; i <= n; i++) pts.push([x + (i % 2 ? 17 : -17), y0 + len * (i - 0.5) / n]);
  pts.push([x, y0 + len]);
  sk.ink(dense(pts, 3), { w: 6, color: "#5A5F68", seed: sd + 9, wob: 0.3 });
  const hy = y0 + len;
  sk.ink(curve([[x, hy], [x, hy + 16], [x + 10, hy + 24], [x + 14, hy + 14]]), { w: 6, seed: sd + 10, wob: 0.2 });
  apple(sk, x, hy + 58, 34, sd + 11);
  return { top: y0, bottom: hy, appleY: hy + 58 };
}
// 양팔저울: (x, y) = 기둥 밑. 왼쪽 접시에 사과, 오른쪽 접시에 추. 수평
function balance(sk, x, y, s, sd = 81) {
  sk.at(x, y, s, () => {
    const base = rrect(-90, -18, 180, 18, 8);
    sk.fill(base, "#8A9099", { seed: sd, dx: 0.6, dy: 0.8 }); sk.ink(base, { w: 8, seed: sd + 1 });
    sk.ink(dense([[0, -18], [0, -330]]), { w: 12, color: "#5A5F68", seed: sd + 2, wob: 0.5 });
    sk.ink(dense([[-200, -330], [200, -330]]), { w: 11, color: "#5A5F68", seed: sd + 3, wob: 0.4 });
    const piv = poly([[-16, -330], [16, -330], [0, -362]], 3);
    sk.fill(piv, C.gold, { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 }); sk.ink(piv, { w: 6, seed: sd + 5, wob: 0.3 });
    for (const sg of [-1, 1]) {
      const px = sg * 190;
      sk.ink(dense([[px, -330], [px - 62, -214]]), { w: 4.5, seed: sd + 6, wob: 0.3 }); sk.ink(dense([[px, -330], [px + 62, -214]]), { w: 4.5, seed: sd + 7, wob: 0.3 });
      const pan = curve([[px - 72, -214], [px - 40, -192], [px + 40, -192], [px + 72, -214]], false, 3);
      sk.fill([...pan, pan[0]], "#D9DCE2", { dx: 0, dy: 0, wob: 0.4, seed: sd + 8 }); sk.ink([...pan, pan[0]], { w: 7, seed: sd + 9 });
    }
    for (const [wx, i] of [[168, 0], [214, 1]]) { const wt = poly([[wx - 16, -214], [wx - 12, -256], [wx + 12, -256], [wx + 16, -214]], 3); sk.fill(wt, "#B8892E", { dx: 0, dy: 0, wob: 0.3, seed: sd + 12 + i }); sk.ink(wt, { w: 6, seed: sd + 14 + i, wob: 0.3 }); sk.dot(wx, -264, 6, C.ink); }
  });
  apple(sk, x - 190 * s, y - 250 * s, 32 * s, sd + 20);
}
// 달 무대: 위는 검은 하늘, 아래는 회색 땅. 지구가 작게 떠 있다
function moonStage(sk, sd, earthAt = [820, 130]) {
  const sky = [[-12, -12], [972, -12], ...curve([[972, 300], [720, 286], [480, 296], [230, 284], [-12, 298]], false, 5)];
  sky.push(sky[0]);
  sk.fill(sky, "#1B2138", { dx: 0, dy: 0, wob: 0, seed: sd });
  const land = [...curve([[-12, 298], [230, 284], [480, 296], [720, 286], [972, 300]], false, 5), [972, 732], [-12, 732]];
  land.push(land[0]);
  sk.fill(land, "#DADDE3", { dx: 0, dy: 0, wob: 0, seed: sd + 1, tex: 0.5, texAng: 0.05 });
  for (const [x, y, rx, i] of [[130, 610, 60, 0], [880, 560, 46, 1], [420, 668, 40, 2]]) { const c = ell(x, y, rx, rx * 0.3); sk.fill(c, "#BFC4CC", { dx: 0, dy: 0, wob: 0.5, seed: sd + 2 + i }); sk.ink(c, { w: 6, color: "#8A9099", seed: sd + 5 + i, wob: 0.5 }); }
  for (const [x, y, r, i] of [[90, 80, 7, 0], [300, 150, 5, 1], [540, 70, 6, 2], [660, 200, 5, 3], [200, 220, 4, 4]]) sparkle(sk, x, y, r, { seed: sd + 8 + i, color: "#FFF3C4", w: 3 });
  if (earthAt) earth(sk, earthAt[0], earthAt[1], 46, { seed: 941, w: 7 });
}
// 둥근 헬멧(머리 뒤에 먼저 그린다)
function helmet(sk, fx, fy, fs, sd) {
  const h = circ(fx, fy - fs * 440, fs * 168, { over: 0.1, seed: sd });
  sk.fill(h, "#EAF3F9", { dx: 0, dy: 0, wob: 0.6, seed: sd + 1 });
  sk.ink(h, { w: 9, color: "#7F8C99", seed: sd + 2 });
}

/* ---------- 1. 1666년, 영국 울즈소프: 과수원의 젊은이 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  ground(sk, 694, 101);
  tree(sk, 724, 694, 1.02, [[-110, -330], [-20, -420], [90, -350], [140, -270], [20, -290]], 21);
  // 떨어지는 사과
  apple(sk, 476, 500, 26, 103);
  sk.ink(dense([[462, 396], [462, 452]]), { w: 5, color: C.gray, seed: 105, wob: 0.3 }); sk.ink(dense([[490, 380], [490, 446]]), { w: 5, color: C.gray, seed: 106, wob: 0.3 });
  apple(sk, 610, 676, 20, 107);
  // 돌에 걸터앉아 책을 읽던 뉴턴
  const fx = 250, fy = 694, fs = 0.7, seatY = fy - fs * 200;
  const rock = curve([[fx - 96, fy], [fx - 100, seatY + 20], [fx - 40, seatY - 6], [fx + 40, seatY - 2], [fx + 84, seatY + 26], [fx + 90, fy]], false, 4);
  sk.fill([...rock, rock[0]], "#B9BDC4", { seed: 109, tex: true, texAng: 0.4 }); sk.ink(rock, { w: 10, seed: 110 });
  const sit = pose({ hip: [0, -212], neck: [6, -340], head: [12, -434], tilt: 0.12, elL: [50, -262], haL: [112, -250], elR: [72, -300], haR: [136, -280], knL: [96, -224], ftL: [106, -4], knR: [116, -212], ftR: [138, -2] });
  drawFigure(sk, fx, fy, fs, sit, { ...NEWTON, name: "newton", hands: false, coat: { ...NEWTON.coat, len: 26 } });
  openBook(sk, fx + fs * 150, fy - fs * 236, 0.62, { color: "#5E7B5A", rot: -0.1, seed: 113 });
  handDot(sk, [fx + fs * 112, fy - fs * 250], C.skin, 115, 10); handDot(sk, [fx + fs * 136 + 40, fy - fs * 280 + 26], C.skin, 116, 10);
  return sk;
}

/* ---------- 2. 뉴턴의 질문: 왜 늘 아래로 떨어질까 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 700, 121);
  // 생각 속의 지구: 사과는 옆이나 위가 아니라 지구 쪽으로
  cloud(sk, 690, 330, 500, 520, { seed: 461, tail: [[420, 470, 22, 0], [382, 510, 14, 1]] });
  earth(sk, 690, 430, 110, { seed: 941 });
  apple(sk, 690, 250, 26, 123);
  arrow(sk, [[690, 290], [690, 400]], { w: 9, color: C.teal, seed: 125, straight: true, head: 24, wob: 0.4 });
  arrow(sk, [[652, 240], [560, 226]], { w: 7, color: C.gray, seed: 126, straight: true, head: 18, wob: 0.4 });
  arrow(sk, [[720, 216], [778, 150]], { w: 7, color: C.gray, seed: 127, straight: true, head: 18, wob: 0.4 });
  xmark(sk, 534, 222, 0.42, { w: 12, seed: 128 }); xmark(sk, 800, 128, 0.42, { w: 12, seed: 130 });
  // 뉴턴: 사과를 들고 땅을 가리킨다
  const P = pose({ elR: [70, -312], haR: [104, -384], elL: [-60, -260], haL: [-84, -196], tilt: 0.1 });
  const fx = 210, fy = 700, fs = 0.78;
  drawFigure(sk, fx, fy, fs, P, { ...NEWTON, name: "newton", hands: "L" });
  const hx = fx + fs * 104, hy = fy - fs * 384;
  apple(sk, hx + 6, hy - 34, 26, 133);
  handDot(sk, [hx, hy], C.skin, 135, 12);
  qmark(sk, 96, 250, 0.8, { color: C.teal, seed: 137, rot: -0.1 });
  return sk;
}

/* ---------- 3. 오늘의 실험실: 당기는 힘을 재 보자 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 700, 141);
  stand(sk, 800, 700, 560, -150, 51);
  const sp = springScale(sk, 650, 140, 210, 61);
  // 용수철이 늘어난 길이
  arrow(sk, [[564, sp.top + 6], [564, sp.bottom - 4]], { w: 6, color: C.teal, seed: 143, straight: true, head: 16, wob: 0.3 });
  arrow(sk, [[564, sp.bottom - 6], [564, sp.top + 4]], { w: 6, color: C.teal, seed: 144, straight: true, head: 16, wob: 0.3 });
  const P = pose({ elR: [88, -306], haR: [158, -322], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 236, 700, 0.74, P, { ...TEACHER, name: "teacher" });
  sparkle(sk, 760, 520, 12, { seed: 147 });
  return sk;
}

/* ---------- 4. 무대를 달로: 달에서 다시 매달면 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  moonStage(sk, 151, [470, 118]);
  stand(sk, 800, 700, 560, -150, 53);
  const sp = springScale(sk, 650, 140, 62, 63);
  arrow(sk, [[564, sp.top + 4], [564, sp.bottom]], { w: 6, color: C.teal, seed: 153, straight: true, head: 14, wob: 0.3 });
  arrow(sk, [[564, sp.bottom - 4], [564, sp.top]], { w: 6, color: C.teal, seed: 154, straight: true, head: 14, wob: 0.3 });
  const fx = 250, fy = 700, fs = 0.7;
  helmet(sk, fx, fy, fs, 155);
  const P = pose({ elR: [88, -306], haR: [158, -322], elL: [-50, -260], haL: [-24, -218] });
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher" });
  emark(sk, 740, 430, 0.8, { color: C.red, rot: 0.12 });
  return sk;
}

/* ---------- 5. 그런데 이상하다? 양팔저울은 그대로 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  moonStage(sk, 161, null);
  balance(sk, 610, 700, 0.9, 81);
  check(sk, 610, 330, 0.9);
  // 생각 풍선: 지구에서도 수평이었다
  cloud(sk, 820, 130, 250, 190, { seed: 471, tail: [[726, 236, 14, 0], [704, 262, 9, 1]] });
  earth(sk, 760, 126, 34, { seed: 943, w: 6 });
  sk.ink(dense([[810, 120], [906, 120]]), { w: 6, color: "#5A5F68", seed: 163, wob: 0.3 });
  sk.ink(dense([[858, 120], [858, 178]]), { w: 6, color: "#5A5F68", seed: 164, wob: 0.3 });
  sk.ink(dense([[838, 180], [878, 180]]), { w: 6, color: "#5A5F68", seed: 165, wob: 0.3 });
  for (const px of [816, 900]) { sk.ink(dense([[px, 120], [px, 144]]), { w: 3.5, seed: 166 + px, wob: 0.2 }); sk.ink(curve([[px - 14, 144], [px, 152], [px + 14, 144]]), { w: 5, seed: 167 + px, wob: 0.2 }); }
  sk.dot(816, 138, 7, C.red); sk.dot(900, 138, 6, "#B8892E");
  const fx = 220, fy = 700, fs = 0.7;
  helmet(sk, fx, fy, fs, 171);
  const P = pose({ elR: [88, -300], haR: [158, -306], elL: [-50, -260], haL: [-24, -218] });
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 6. 다시 1666년: 달까지 닿을까? ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 694, 181);
  // 보름달과 별
  const mn = circ(800, 140, 70, { over: 0.12, seed: 183 });
  sk.fill(mn, "#F7EBB8", { dx: 1, dy: 1.2, wob: 0.6, seed: 184 }); sk.ink(mn, { w: 10, seed: 185 });
  for (const [x, y, r] of [[776, 120, 13], [826, 160, 10], [790, 172, 7]]) sk.ink(circ(x, y, r, { seed: 186 + x }), { w: 4, color: "#C9B77A", seed: 187 + x, wob: 0.3 });
  for (const [x, y, r, i] of [[420, 70, 8, 0], [560, 170, 6, 1], [930, 300, 6, 2], [640, 60, 5, 3]]) sparkle(sk, x, y, r, { seed: 189 + i, w: 3 });
  tree(sk, 150, 694, 0.86, [[-90, -300], [60, -380], [128, -268]], 31);
  // 사과에서 달까지 이어 본 선
  sk.ink(dense([[282, 452], [726, 172]]), { w: 6, color: C.teal, dash: [14, 12], seed: 193, wob: 0.5 });
  // 계산 종이(첫 계산은 맞지 않았다)
  for (const [x, y, rot, bad, i] of [[720, 668, -0.1, true, 0], [826, 676, 0.14, false, 1]]) sk.at(x, y, 1, () => {
    const p = poly([[-44, -30], [44, -30], [44, 30], [-44, 30]], 3);
    sk.fill(p, "#FBF6E6", { dx: 0.8, dy: 1, wob: 0.4, seed: 195 + i }); sk.ink(p, { w: 7, seed: 197 + i });
    for (let k = 0; k < 3; k++) sk.ink(dense([[-30, -14 + k * 13], [k === 2 ? 6 : 28, -14 + k * 13]]), { w: 3.5, color: C.gray, seed: 199 + i * 3 + k, wob: 0.2 });
    if (bad) xmark(sk, 14, 4, 0.5, { w: 11, seed: 205 });
  }, rot);
  // 뉴턴: 달을 가리킨다
  const P = pose({ elR: [124, -356], haR: [204, -462], elL: [-50, -260], haL: [-24, -218], tilt: -0.08 });
  drawFigure(sk, 480, 694, 0.72, P, { ...NEWTON, name: "newton" });
  drop(sk, 372, 330, 1.1);
  return sk;
}

/* ---------- 7. 1687년: 달도 떨어지고 있다 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  // 지구와 그 둘레를 도는 달
  const ex = 690, ey = 340, ro = 230;
  sk.ink(ell(ex, ey, ro, ro), { w: 6, color: C.gray, dash: [14, 13], seed: 211, wob: 0 });
  earth(sk, ex, ey, 86, { seed: 941 });
  const ma = -0.75, mx = ex + ro * Math.cos(ma), my = ey + ro * Math.sin(ma);
  // 달을 지구 쪽으로 당기는 중력(빨강)과 달이 나아가는 방향(청록)
  arrow(sk, [[mx - 26, my + 24], [ex + 112 * Math.cos(ma), ey + 112 * Math.sin(ma)]], { w: 9, color: C.red, seed: 213, straight: true, head: 24, wob: 0.4 });
  arrow(sk, [[mx + 22, my + 24], [mx + 74, my + 84]], { w: 9, color: C.teal, seed: 214, straight: true, head: 24, wob: 0.4 });
  const mn = circ(mx, my, 34, { over: 0.12, seed: 215 });
  sk.fill(mn, "#F7EBB8", { dx: 0.8, dy: 1, wob: 0.5, seed: 216 }); sk.ink(mn, { w: 8, seed: 217 });
  sk.ink(circ(mx - 8, my - 6, 8, { seed: 218 }), { w: 3.5, color: "#C9B77A", seed: 219, wob: 0.2 });
  // 쌤: 두꺼운 책을 들고 가리킨다
  const P = pose({ elR: [88, -316], haR: [158, -340], elL: [-62, -276], haL: [-100, -240], tilt: 0.05 });
  const fx = 250, fy = 704, fs = 0.74;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher", hands: "R" });
  const bx = fx - fs * 100, by = fy - fs * 240;
  sk.at(bx - 34, by - 8, 1, () => {
    const pages = poly([[-44, -56], [52, -56], [52, 60], [-44, 60]], 4);
    sk.fill(pages, C.white, { dx: 0, dy: 0, wob: 0.4, seed: 221 }); sk.ink(pages, { w: 7, seed: 222 });
    const cover = poly([[-56, -62], [40, -62], [40, 54], [-56, 54]], 4);
    sk.fill(cover, "#7E3B45", { seed: 223, tex: true, dx: 1, dy: 1.4 }); sk.ink(cover, { w: 9, seed: 224 });
    sk.ink(dense([[-36, -62], [-36, 54]]), { w: 5, color: "#55242C", seed: 225, wob: 0.3 });
    sk.dot(2, -4, 12, C.gold);
  }, -0.1);
  handDot(sk, [bx + 6, by + 6], C.skin, 227, 11);
  sparkle(sk, bx - 104, by - 76, 12, { seed: 229 });
  return sk;
}

const BUBBLES = [
  [{ who: "newton", text: "사과가<br>떨어졌네?" }],
  null,
  [{ who: "teacher", text: "쭉<br>늘어났죠?" }],
  [{ who: "teacher", text: "조금만<br>늘어나네!" }],
  [{ who: "teacher", text: "여기서도<br>수평!" }],
  [{ who: "newton", text: "저 달까지<br>닿을까?" }],
  [{ who: "teacher", text: "사과에서<br>달까지!" }],
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
