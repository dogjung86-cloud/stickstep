// 중2 과학 Ⅱ단원(지권의 변화) 개념 컷 코드 그림.
// 목록은 Ⅱ단원 v5 세션이 낸 것(D:\Brilliant Science\output\g2-v5\u2\concept-cuts.md).
// g2u2l3(녹인 설탕 굳히기)은 사실과 다른 비유라 그리지 않고 보류했다(판정 자료 README 참조).
// 색의 뜻: 지구 속 네 층은 복숭아의 실제 색(껍질 붉은색, 과육 노랑, 씨 겉 짙은 갈색, 씨 속 밝은 살구색).
// 누르는 힘은 빨간 화살표, 차례(아래에서 위로)는 청록 화살표. 그 밖의 소품은 일상 물건 색이다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, arrow, emark, sparkle, hash } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { cloud, moon } from "../../lib/props.mjs";
import { W, H, lerpx, thin, steam } from "./common.mjs";

const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
function table(sk, x0, x1, y, GY, sd, k = 0.8) {
  thin(sk, k, () => {
    for (const [x, i] of [[x0 + 30, 0], [x1 - 30, 1]]) sk.ink(dense([[x, y + 22], [x - 3 + i * 6, GY]]), { w: 12, seed: sd + i });
    const top = rrect(x0, y, x1 - x0, 24, 8);
    sk.fill(top, C.wood, { seed: sd + 2, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: sd + 3 });
  });
}
const flat = { dx: 0, dy: 0, wob: 0.3 };

/* ---------- g2u2l1: 비 오는 날, 우산을 쓰고 화분의 풀을 가리킨다. 웅덩이, 젖은 흙, 구름 사이의 달 ---------- */
function cutL1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 632, fx = 330, s = 0.66, ux = fx - s * 122;
  // 젖은 흙(밝은 띠)과 땅 선
  const soil = poly([[16, GY], [944, GY - 1], [944, GY + 46], [16, GY + 46]], 6);
  sk.fill(soil, "#DDBE96", { dx: 0, dy: 0, wob: 1.2, seed: 11, tex: 0.8, texAng: 0.05 });
  for (let i = 0; i < 16; i++) sk.dot(50 + i * 57 + 20 * hash(i * 3.3), GY + 16 + 18 * hash(i * 7.1), 5 + 3 * hash(i), "#B98A5E");
  // 달과 구름
  thin(sk, 0.55, () => moon(sk, 716, 104, 50));
  thin(sk, 0.8, () => {
    cloud(sk, 500, 88, 290, 120, { color: "#E6EAF0", seed: 31 });
    cloud(sk, 872, 96, 180, 104, { color: "#E6EAF0", seed: 51 });
    cloud(sk, 120, 80, 190, 92, { color: "#E6EAF0", seed: 71 });
  });
  // 빗줄기
  for (let gx = 34; gx < 940; gx += 58) for (let gy = 186; gy < GY - 30; gy += 62) {
    const k = gx * 0.37 + gy * 1.13, x = gx + 26 * (hash(k) - 0.5), y = gy + 30 * (hash(k + 5) - 0.5);
    if (Math.abs(x - ux) < 222 && y > 150) continue;
    if (x > 520 && x < 730 && y > GY - 150) continue;
    sk.ink(dense([[x, y], [x + 7, y + 26]]), { w: 5, color: "#5FAEDD", seed: 100 + gx + gy, wob: 0.2 });
  }
  // 바람(공기)
  for (const [y, i] of [[372, 0], [434, 1]]) sk.ink(curve([[20, y], [70, y - 12], [112, y + 2], [98, y + 20], [82, y + 8]]), { w: 5, color: C.gray, seed: 91 + i, wob: 0.3 });
  // 우산
  const top = 150, rim = 248, hw = 208;
  sk.ink(dense([[ux, rim - 30], [ux, GY - s * 318]]), { w: 8, seed: 201, wob: 0.4 });
  const up = curve([[ux - hw, rim], [ux - hw * 0.8, top + 44], [ux - hw * 0.4, top + 8], [ux, top], [ux + hw * 0.4, top + 8], [ux + hw * 0.8, top + 44], [ux + hw, rim]], false, 4);
  const sc = [];
  for (let i = 0; i < 4; i++) { const x1 = ux + hw - i * hw / 2, x0 = x1 - hw / 2; sc.push(...curve([[x1, rim], [(x0 + x1) / 2, rim - 20], [x0, rim]], false, 4)); }
  const can = [...up, ...sc, up[0]];
  sk.fill(can, "#2FB6A6", { dx: 0, dy: 0, wob: 0.6, seed: 203, tex: 0.9, texAng: 0.3 });
  thin(sk, 0.8, () => {
    for (const [dx, i] of [[-hw / 2, 0], [0, 1], [hw / 2, 2]]) sk.ink(curve([[ux, top + 2], [ux + dx * 0.6, top + 30], [ux + dx, rim - 2]]), { w: 5, color: "#0E7C70", seed: 205 + i, wob: 0.3 });
    sk.ink(can, { w: 10, seed: 209, wob: 0.8 });
    sk.ink(dense([[ux, top], [ux, top - 20]]), { w: 9, seed: 210, wob: 0.2 });
  });
  // 화분과 풀
  const px = 626, pw = 78, ph = 78;
  thin(sk, 0.8, () => {
    for (let i = 0; i < 7; i++) { const x = px - 54 + i * 18, lean = (i - 3) * 9; sk.ink(curve([[x, GY - ph - 6], [x + lean * 0.4, GY - ph - 50], [x + lean, GY - ph - 84 - 14 * hash(i * 2.2)]]), { w: 8, color: C.green, seed: 221 + i, wob: 0.4 }); }
    const pot = poly([[px - pw, GY - ph], [px + pw, GY - ph], [px + pw - 16, GY - 2], [px - pw + 16, GY - 2]], 4);
    sk.fill(pot, "#D98A5B", { dx: 0, dy: 0, wob: 0.4, seed: 231, tex: 0.8 });
    sk.ink(pot, { w: 10, seed: 232 });
    const lip = rrect(px - pw - 8, GY - ph - 14, pw * 2 + 16, 24, 8);
    sk.fill(lip, "#7A5236", { dx: 0, dy: 0, wob: 0.4, seed: 233 }); sk.ink(lip, { w: 9, seed: 234 });
  });
  for (const [dx, dy, i] of [[-40, -128, 0], [28, -150, 1], [58, -112, 2]]) { const d = curve([[0, -11], [7, 0], [5, 8], [0, 10], [-5, 8], [-7, 0]], true, 2).map(p => [px + dx + p[0], GY + dy + p[1]]); sk.fill(d, "#8CC8EC", { ...flat, seed: 241 + i }); sk.ink(d, { w: 3.5, color: "#3F8FD0", seed: 244 + i, wob: 0.2 }); }
  // 웅덩이
  const pud = ell(826, GY + 14, 96, 17);
  sk.fill(pud, "#A9D8F2", { ...flat, seed: 251 });
  sk.ink(pud, { w: 5, color: "#3F8FD0", seed: 252, wob: 0.5 });
  sk.ink(ell(806, GY + 13, 30, 6), { w: 3.5, color: C.white, seed: 253, wob: 0.2 });
  sk.ink(ell(862, GY + 16, 16, 4), { w: 3.5, color: C.white, seed: 254, wob: 0.2 });
  // 학생
  const P = pose({ elL: [-62, -270], haL: [-122, -330], elR: [104, -292], haR: [190, -262], tilt: 0.05 });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- g2u2l1b: 반으로 자른 복숭아. 얇은 껍질, 두꺼운 과육, 씨의 겉과 속 ---------- */
function cutL1b() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 668, cx = 612, cy = 316, R = 202, TY = 522;
  ground(sk, GY, 11);
  table(sk, 384, 944, TY, GY, 21);
  // 뒤에 엎어 둔 나머지 반쪽
  const dome = [...curve([[790, TY], [800, 468], [846, 440], [896, 466], [908, TY]], false, 4), [790, TY]];
  sk.fill(dome, "#F29A8A", { dx: 0, dy: 0, wob: 0.5, seed: 31, tex: 0.9 });
  thin(sk, 0.8, () => sk.ink(dome, { w: 10, seed: 32 }));
  // 자른 면: 복숭아 꼴(위가 살짝 패고 아래가 조금 뾰족하다)
  const shape = k => { const p = []; for (let i = 0; i <= 72; i++) { const a = -Math.PI / 2 + i / 72 * Math.PI * 2, d = Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2)), b = Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)); const r = R * k * (1 - 0.06 * Math.exp(-(d * d) / 0.05) + 0.035 * Math.exp(-(b * b) / 0.08)); p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; };
  // 꼭지와 잎
  thin(sk, 0.8, () => {
    sk.ink(curve([[cx, cy - R + 14], [cx + 4, cy - R - 16], [cx + 14, cy - R - 34]]), { w: 10, color: "#7A5236", seed: 41, wob: 0.3 });
    const leaf = curve([[cx + 12, cy - R - 22], [cx + 50, cy - R - 58], [cx + 104, cy - R - 50], [cx + 62, cy - R - 16]], true, 3);
    sk.fill(leaf, C.green, { ...flat, seed: 42 }); sk.ink(leaf, { w: 8, seed: 43, wob: 0.5 });
  });
  const outer = shape(1);
  sk.fill(outer, "#D9415E", { ...flat, seed: 51 });                 // 껍질: 얇은 붉은 테
  sk.fill(shape(0.955), "#FFD27A", { ...flat, seed: 52, tex: 1.3, texAng: 0.6, texDark: 0.06 }); // 과육
  thin(sk, 0.75, () => {
    sk.ink(outer, { w: 9, seed: 53, wob: 0.8 });
    // 씨의 겉(짙고 울퉁불퉁하다)과 속(밝은 알맹이)
    const pit = circ(cx, cy + 6, R * 0.52, { over: 0.05, seed: 61, lump: 0.05 });
    sk.fill(pit, "#8A5A33", { ...flat, seed: 62, tex: 0.6, texAng: 1.2 });
    sk.ink(pit, { w: 9, seed: 63, wob: 1.4 });
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3, r0 = R * 0.3, r1 = R * 0.44; sk.ink(curve([[cx + r0 * Math.cos(a), cy + 6 + r0 * Math.sin(a)], [cx + (r0 + r1) / 2 * Math.cos(a + 0.12), cy + 6 + (r0 + r1) / 2 * Math.sin(a + 0.12)], [cx + r1 * Math.cos(a), cy + 6 + r1 * Math.sin(a)]]), { w: 4, color: "#5E3B20", seed: 64 + i, wob: 0.3 }); }
    const ker = circ(cx, cy + 6, R * 0.2, { over: 0.05, seed: 75 });
    sk.fill(ker, "#F3DDB0", { ...flat, seed: 76 }); sk.ink(ker, { w: 7, seed: 77, wob: 0.5 });
  });
  // 쌤: 손가락으로 얇은 껍질을 짚는다
  const fx = 198, s = 0.8;
  const P = pose({ elR: [112, -296], haR: [204, -338], tilt: 0.06 });
  drawFigure(sk, fx, GY, s, P, { ...TEACHER, name: "teacher", hands: "L" });
  const hx = fx + s * 204, hy = GY - s * 338;
  const f = dense([[hx + 6, hy - 2], [hx + 44, hy - 12]]);
  sk.ink(f, { w: 16, seed: 81, wob: 0.3 }); sk.ink(f, { w: 8, color: C.skin, seed: 82, wob: 0.3 });
  handDot(sk, [hx, hy], C.skin, 83, 13);
  return sk;
}

/* ---------- g2u2l2: 잡곡밥 한 그릇. 흰 쌀, 검은콩, 노란 조를 젓가락으로 가리킨다 ---------- */
function cutL2() {
  const sk = new Sk(W, H, { id: "c" });
  const GY = 668, TY = 548, bx = 668, RIM = 440, hw = 178, MH = 132;
  ground(sk, GY, 11);
  table(sk, 404, 944, TY, GY, 21);
  // 밥 봉우리
  const top = x => RIM - MH * Math.sqrt(Math.max(0, 1 - ((x - bx) / (hw - 6)) ** 2));
  const mound = []; for (let i = 0; i <= 60; i++) { const x = bx - hw + 6 + i / 60 * (hw - 6) * 2; mound.push([x, top(x) + 5 * Math.sin(i * 0.9)]); }
  const mp = [...mound, [bx + hw - 6, RIM + 20], [bx - hw + 6, RIM + 20], mound[0]];
  sk.fill(mp, "#F8F3E6", { ...flat, seed: 31 });
  // 알갱이: 정한 자리의 검은콩과 조 무리, 나머지는 흰 쌀
  const beans = [[556, 392], [640, 350], [726, 372], [792, 410], [604, 420], [700, 424]];
  const millet = [[590, 362], [680, 388], [760, 404], [650, 414], [548, 426], [742, 340], [690, 334]];
  for (let gx = bx - hw + 30; gx < bx + hw - 20; gx += 31) for (let gy = RIM - MH + 14; gy < RIM + 6; gy += 23) {
    const k = gx * 0.71 + gy * 0.29, x = gx + 10 * (hash(k) - 0.5), y = gy + 8 * (hash(k + 3) - 0.5);
    if (y < top(x) + 16) continue;
    if ([...beans, ...millet].some(([px, py]) => Math.hypot(px - x, py - y) < 26)) continue;
    sk.at(x, y, 1, () => { const g = ell(0, 0, 14, 7.5); sk.fill(g, C.white, { ...flat, seed: k }); sk.ink(g, { w: 3, color: "#B9AE96", seed: k + 1, wob: 0.2 }); }, hash(k + 7) * 3);
  }
  millet.forEach(([x, y], i) => { for (const [dx, dy, j] of [[-9, 2, 0], [8, -3, 1], [1, 10, 2]]) { const m = circ(x + dx, y + dy, 7.5, { over: 0.1, seed: 60 + i * 3 + j }); sk.fill(m, "#F2C230", { ...flat, seed: 61 + i }); sk.ink(m, { w: 3, color: "#B8892E", seed: 62 + i * 3 + j, wob: 0.2 }); } });
  beans.forEach(([x, y], i) => sk.at(x, y, 1, () => { const b = ell(0, 0, 17, 13); sk.fill(b, "#2E2A2A", { ...flat, seed: 81 + i }); sk.ink(b, { w: 4, seed: 82 + i, wob: 0.3 }); sk.ink(curve([[-9, -3], [-4, -8], [3, -8]]), { w: 3, color: C.white, seed: 83 + i, wob: 0.1 }); }, (hash(i * 5.1) - 0.5) * 1.4));
  thin(sk, 0.8, () => {
    sk.ink(mound, { w: 8, seed: 33, wob: 0.6 });
    // 그릇
    const bowl = [...curve([[bx - hw, RIM], [bx - hw + 22, RIM + 62], [bx - 96, TY - 6], [bx + 96, TY - 6], [bx + hw - 22, RIM + 62], [bx + hw, RIM]], false, 4), [bx - hw, RIM]];
    sk.fill(bowl, C.white, { ...flat, seed: 41 });
    sk.ink(curve([[bx - hw + 12, RIM + 30], [bx, RIM + 40], [bx + hw - 12, RIM + 30]]), { w: 9, color: "#3F7CC0", seed: 42, wob: 0.3 });
    sk.ink(bowl, { w: 10, seed: 43 });
  });
  // 학생과 젓가락
  const fx = 214, s = 0.82;
  const P = pose({ elR: [104, -290], haR: [180, -300], tilt: 0.08, head: [6, -436] });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student", hands: "L" });
  const hx = fx + s * 180, hy = GY - s * 300;
  for (const [dy0, dy1, i] of [[-6, -8, 0], [8, 4, 1]]) sk.ink(dense([[hx - 30, hy + dy0 + 6], [beans[0][0] - 26, beans[0][1] + dy1]]), { w: 6.5, color: "#8A5A33", seed: 91 + i, wob: 0.3 });
  handDot(sk, [hx, hy], C.skin, 95, 13);
  return sk;
}

/* ---------- g2u2l2b: 겉이 같은 분필 두 자루. 그은 자국은 한 줄은 흰색, 한 줄은 붉은색 ---------- */
function cutL2b() {
  const sk = new Sk(W, H, { id: "d" });
  const GY = 668, fx = 480, s = 0.8;
  ground(sk, GY, 11);
  // 칠판(위쪽 띠)
  thin(sk, 0.8, () => {
    const outer = rrect(118, 44, 724, 404, 14), inner = rrect(136, 62, 688, 368, 6);
    sk.fill(outer, C.wood, { seed: 21, tex: true, texAng: 0.05 });
    sk.fill(inner, C.board, { seed: 22, tex: true, dx: 1, dy: 1.2 });
    sk.ink(inner, { w: 7, wob: 1.2, seed: 23 }); sk.ink(outer, { w: 11, wob: 1.6, seed: 24 });
  });
  const hy = GY - s * 452, hl = fx - s * 204, hr = fx + s * 204;
  // 그은 자국: 왼쪽 흰색, 오른쪽 붉은색
  for (const [x, sg, col, i] of [[hl, -1, "#F7F4EC", 0], [hr, 1, "#FF6A4D", 1]]) {
    const st = curve([[x + sg * 2, hy - 62], [x + sg * 16, hy - 120], [x + sg * 6, hy - 176], [x + sg * 22, hy - 222]]);
    sk.ink(st, { w: 20, color: col, seed: 31 + i, wob: 1.6, alpha: 0.96 });
    for (let j = 0; j < 4; j++) sk.dot(x + sg * (30 + 10 * hash(j + i * 9)), hy - 104 - j * 40, 3, col);
  }
  // 쌤: 두 팔을 들어 분필을 한 자루씩 쥔다
  const P = pose({ elL: [-124, -372], haL: [-204, -452], elR: [124, -372], haR: [204, -452] });
  drawFigure(sk, fx, GY, s, P, { ...TEACHER, name: "teacher", hands: false });
  for (const [x, sg, i] of [[hl, -1, 0], [hr, 1, 1]]) {
    const ch = poly([[x - 10, hy + 6], [x + 10, hy + 6], [x + 10 + sg * 3, hy - 56], [x - 10 + sg * 3, hy - 56]], 3);
    sk.fill(ch, "#EDE7D6", { ...flat, seed: 41 + i }); sk.ink(ch, { w: 5.5, seed: 43 + i, wob: 0.4 });
    handDot(sk, [x, hy + 8], C.skin, 45 + i * 2, 13);
  }
  emark(sk, 896, 250, 1);
  return sk;
}

/* ---------- g2u2l4: 유리컵에 시리얼과 요거트를 한 겹씩. 옆에서 본 줄무늬 ---------- */
function cutL4() {
  const sk = new Sk(W, H, { id: "e" });
  const GY = 668, TY = 560, gx = 610, top = 238, hwT = 116, hwB = 92;
  ground(sk, GY, 11);
  table(sk, 424, 930, TY, GY, 21);
  const hwAt = y => lerpx(hwB, hwT, (TY - 8 - y) / (TY - 8 - top));
  // 켜: 아래에서 위로(시리얼, 요거트, 시리얼, 요거트, 시리얼)
  const layers = [[62, "#E3A63F", "#B9772A", 1], [46, "#FBF8F0", null, 0], [62, "#8A5A33", "#5E3B20", 1], [46, "#F8C9D2", null, 0], [50, "#E36A4A", "#B5483B", 1]];
  let y = TY - 12;
  layers.forEach(([h, col, dk, cereal], i) => {
    const y0 = y, y1 = y - h, a = hwAt(y0) - 9, b = hwAt(y1) - 9;
    const wav = (yy, hw, ph) => { const p = []; for (let j = 0; j <= 16; j++) p.push([gx - hw + j / 16 * hw * 2, yy + (i === 0 && yy === y0 ? 0 : 4 * Math.sin(j * 1.1 + ph))]); return p; };
    const lo = wav(y0, a, i), hi = wav(y1, b, i + 1).reverse();
    sk.fill([...lo, ...hi, lo[0]], col, { ...flat, seed: 31 + i });
    if (cereal) for (let k = 0; k < 15; k++) { const u = hash(i * 31 + k * 7.7), v = hash(i * 17 + k * 3.3), cy0 = lerpx(y0 - 12, y1 + 12, v), hw = hwAt(cy0) - 26; const r = circ(gx + (u * 2 - 1) * hw, cy0, 9, { over: 0.1, seed: 300 + i * 20 + k }); sk.ink(r, { w: 5, color: dk, seed: 301 + i * 20 + k, wob: 0.2 }); }
    y = y1;
  });
  thin(sk, 0.8, () => {
    sk.ink(dense([[gx - hwT + 24, top + 30], [gx - hwAt(TY - 60) + 22, TY - 70]]), { w: 6, color: C.white, seed: 41, wob: 0.2, alpha: 0.9 });
    const g = dense([[gx - hwT, top], [gx - hwB, TY - 6], [gx + hwB, TY - 6], [gx + hwT, top]], 4);
    sk.ink(g, { w: 10, seed: 42 });
    sk.ink(ell(gx, top, hwT, 12), { w: 7, seed: 43, wob: 0.3 });
  });
  // 차례: 아래가 먼저
  arrow(sk, [[822, TY - 26], [822, top + 40]], { w: 11, color: C.teal, straight: true, seed: 51, head: 26, wob: 0.2 });
  // 학생(챙이 왼쪽): 숟가락으로 맨 위 켜를 얹으며 옆에서 들여다본다
  const fx = 286, s = 0.8;
  const P = pose({ elL: [-118, -380], haL: [-204, -470], tilt: -0.1, head: [-8, -434] });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student", mirror: true, hands: "R" });
  const hx = fx + s * 204, hy = GY - s * 470;
  thin(sk, 0.8, () => {
    sk.ink(dense([[hx - 14, hy + 6], [hx + 100, hy - 88]]), { w: 8, color: "#8E99A6", seed: 61, wob: 0.3 });
    const sp = ell(hx + 124, hy - 104, 30, 17).map(([x, y]) => { const dx = x - (hx + 124), dy = y - (hy - 104), c = Math.cos(-0.5), q = Math.sin(-0.5); return [hx + 124 + dx * c - dy * q, hy - 104 + dx * q + dy * c]; });
    sk.fill(sp, "#D5DEE6", { ...flat, seed: 62 }); sk.ink(sp, { w: 7, seed: 63, wob: 0.3 });
  });
  for (const [dx, dy, i] of [[134, -66, 0], [146, -34, 1], [128, -6, 2]]) { const r = circ(hx + dx, hy + dy, 9, { over: 0.1, seed: 71 + i }); sk.ink(r, { w: 5, color: "#B5483B", seed: 74 + i, wob: 0.2 }); }
  handDot(sk, [hx, hy], C.skin, 81, 13);
  return sk;
}

/* ---------- g2u2l5: 책 더미 사이에 낀 낙엽. 누르자 모두 납작하게 나란히 눕는다 ---------- */
const LEAF = ["#F08A2E", "#D9543A", "#F2C230", "#B9703A", "#E36A4A"];
function leaf(sk, x, y, len, w, ang, col, sd) {
  sk.at(x, y, 1, () => {
    const p = curve([[-len / 2, 0], [-len / 5, -w], [len / 5, -w * 0.85], [len / 2, 0], [len / 5, w * 0.85], [-len / 5, w]], true, 3);
    sk.fill(p, col, { ...flat, seed: sd });
    sk.ink(dense([[-len / 2 - 14, 0], [len / 2 - 8, 0]]), { w: 3.5, color: "#7A4A26", seed: sd + 1, wob: 0.2 });
    sk.ink(p, { w: 6, seed: sd + 2, wob: 0.5 });
  }, ang);
}
function book(sk, x0, x1, y1, h, col, sd, flip) {
  const cover = rrect(x0, y1 - h, x1 - x0, h, 8);
  sk.fill(cover, col, { ...flat, seed: sd, tex: 0.9, texAng: 0.03 });
  const px0 = flip ? x0 + 6 : x0 + 30, pages = rrect(px0, y1 - h + 10, x1 - x0 - 36, h - 20, 4);
  sk.fill(pages, "#FBF8F0", { ...flat, seed: sd + 1 });
  for (const k of [0.36, 0.64]) sk.ink(dense([[px0 + 6, y1 - h + h * k], [px0 + x1 - x0 - 44, y1 - h + h * k]]), { w: 3, color: "#C9C2B2", seed: sd + 2 + k, wob: 0.2 });
  sk.ink(cover, { w: 9, seed: sd + 4 });
}
function cutL5() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 668;
  ground(sk, GY, 11);
  // 왼쪽: 누르기 전, 제멋대로인 낙엽 뭉치
  const heap = [[112, 618, 1.25], [178, 590, -0.5], [236, 622, 0.15], [150, 548, -1.15], [214, 540, 0.85], [262, 574, -1.45], [96, 566, 0.5]];
  heap.forEach(([x, y, a], i) => leaf(sk, x, y, 104, 21, a, LEAF[i % 5], 31 + i * 5));
  arrow(sk, [[316, 572], [382, 572]], { w: 10, color: C.gray, straight: true, seed: 71, head: 22, wob: 0.2 });
  // 오른쪽: 책 더미 사이에 납작하게 나란히 누운 낙엽
  const x0 = 414, x1 = 716, bh = 56, ly = 34;
  thin(sk, 0.8, () => {
    book(sk, x0, x1, GY - 4, bh, "#3E5C76", 81, false);
    book(sk, x0 + 10, x1 - 6, GY - 4 - bh, bh, "#B5483B", 91, true);
  });
  const lc = GY - 4 - bh * 2 - ly / 2;
  [[x0 - 4, -8, 0], [x0 + 78, 8, 1], [x0 + 160, -7, 2], [x0 + 236, 8, 3], [x1 + 2, -7, 4], [x0 + 40, 9, 2], [x0 + 196, -1, 0], [x0 + 118, -2, 3], [x1 - 40, 9, 1]].forEach(([x, dy, c], i) => leaf(sk, x, lc + dy, 104, 7.5, i % 2 ? Math.PI : 0, LEAF[c], 101 + i * 5));
  const ty = GY - 4 - bh * 2 - ly;
  thin(sk, 0.8, () => {
    book(sk, x0 + 6, x1 - 10, ty, bh, "#5E7B5A", 151, false);
    book(sk, x0, x1, ty - bh, bh, "#E2B23C", 161, true);
  });
  const topY = ty - bh * 2;
  // 누르는 힘
  for (const [x, i] of [[x0 + 62, 0], [x0 + 158, 1]]) arrow(sk, [[x, topY - 132], [x, topY - 22]], { w: 12, color: C.red, straight: true, seed: 171 + i * 5, head: 26, wob: 0.2 });
  // 학생: 두 손으로 책 더미를 내리누른다
  const fx = 812, s = 0.78;
  const hy = -(GY - topY + 12) / s;
  const P = pose({ elL: [-112, -300], haL: [-(fx - (x1 - 62)) / s, hy], elR: [-36, -286], haR: [-(fx - (x1 - 8)) / s, hy], tilt: -0.1, head: [-10, -434] });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- g2u2l6: 크레파스 조각을 부수어 틀에 눌러 담고, 녹여 굳힌 새 크레파스를 꺼낸다 ---------- */
const CRAY = ["#E0503A", "#3F7CC0", "#F2C230", "#3FAE5A", "#9B6BD6"];
function cutL6() {
  const sk = new Sk(W, H, { id: "g" });
  const GY = 668, TY = 486, fx = 462, s = 0.8;
  ground(sk, GY, 11);
  const P = pose({ elL: [-116, -300], haL: [-190, -306], elR: [124, -356], haR: [214, -452], tilt: 0.05 });
  drawFigure(sk, fx, GY, s, P, { ...TEACHER, name: "teacher", hands: false });
  table(sk, 40, 930, TY, GY, 21);
  // 부순 조각 더미
  [[76, -12, 0.2, 0], [126, -12, -0.1, 1], [176, -13, 0.12, 2], [100, -36, -0.3, 3], [152, -37, 0.35, 4], [126, -60, 0.05, 0], [58, -34, 1.0, 2], [196, -34, -0.9, 1]].forEach(([x, dy, a, c], i) => sk.at(x, TY + dy, 1, () => { const b = rrect(-24, -11, 48, 22, 6); sk.fill(b, CRAY[c], { ...flat, seed: 31 + i }); sk.ink(b, { w: 5.5, seed: 32 + i * 3, wob: 0.4 }); }, a));
  arrow(sk, [[200, TY - 92], [236, TY - 72]], { w: 9, color: C.gray, straight: true, seed: 61, head: 18, wob: 0.2 });
  // 틀: 조각을 꾹꾹 눌러 담았다
  const mx0 = 240, mx1 = 404;
  thin(sk, 0.8, () => {
    const seg = (mx1 - mx0 - 24) / 6;
    for (let i = 0; i < 6; i++) { const b = rrect(mx0 + 12 + i * seg, TY - 58, seg + 2, 26, 4); sk.fill(b, CRAY[(i * 2 + 1) % 5], { ...flat, seed: 71 + i }); sk.ink(b, { w: 4.5, seed: 77 + i, wob: 0.3 }); }
    const tray = poly([[mx0, TY - 40], [mx1, TY - 40], [mx1 - 10, TY - 1], [mx0 + 10, TY - 1]], 4);
    sk.fill(tray, "#C9D2DA", { ...flat, seed: 85 }); sk.ink(tray, { w: 9, seed: 86 });
  });
  const lh = [fx - s * 190, GY - s * 306 - 2];
  arrow(sk, [[lh[0] + 4, lh[1] - 112], [lh[0] + 4, lh[1] - 34]], { w: 10, color: C.red, straight: true, seed: 91, head: 22, wob: 0.2 });
  handDot(sk, lh, C.skin, 95, 13);
  // 녹이는 냄비와 불
  const px = 800;
  thin(sk, 0.8, () => {
    for (const sg of [-1, 1]) sk.ink(dense([[px + sg * 58, TY - 58], [px + sg * 70, TY - 1]]), { w: 9, seed: 101 + sg, wob: 0.3 });
    const fl = curve([[px, TY - 54], [px + 17, TY - 26], [px + 12, TY - 8], [px, TY - 2], [px - 12, TY - 8], [px - 17, TY - 26]], true, 3);
    sk.fill(fl, C.orange, { ...flat, seed: 105 }); sk.ink(fl, { w: 6, seed: 106, wob: 0.4 });
    const fi = curve([[px, TY - 30], [px + 7, TY - 16], [px, TY - 8], [px - 7, TY - 16]], true, 3);
    sk.fill(fi, C.lemon, { ...flat, seed: 107 });
    const pot = rrect(px - 72, TY - 122, 144, 64, 12);
    sk.fill(pot, "#AEB8C2", { ...flat, seed: 111, tex: 0.9 }); sk.ink(pot, { w: 10, seed: 112 });
    sk.ink(dense([[px + 72, TY - 104], [px + 118, TY - 110]]), { w: 11, seed: 113, wob: 0.3 });
    const melt = ell(px, TY - 122, 62, 13);
    sk.fill(melt, "#9B6BD6", { ...flat, seed: 114 });
    sk.ink(curve([[px - 40, TY - 122], [px - 14, TY - 128], [px + 8, TY - 119], [px + 36, TY - 124]]), { w: 5, color: "#F2C230", seed: 115, wob: 0.2 });
    sk.ink(curve([[px - 26, TY - 116], [px, TY - 113], [px + 24, TY - 116]]), { w: 4, color: "#E0503A", seed: 116, wob: 0.2 });
    sk.ink(melt, { w: 7, seed: 117, wob: 0.4 });
  });
  steam(sk, px, TY - 144, 3, 58, 121, 34);
  // 꺼낸 새 크레파스(여러 색이 섞여 굳었다)
  const rh = [fx + s * 214, GY - s * 452];
  arrow(sk, [[px - 60, TY - 200], [px - 104, TY - 246], [rh[0] + 66, rh[1] - 44]], { w: 9, color: C.gray, seed: 131, head: 18, wob: 0.3 });
  sk.at(rh[0] + 4, rh[1] - 6, 1, () => {
    const bw = 27, L = 118;
    const band = (y0, y1, col, sd) => sk.fill(poly([[-bw, y0], [bw, y0 - 6], [bw, y1 - 6], [-bw, y1]], 3), col, { ...flat, seed: sd });
    band(8, -22, "#3F7CC0", 141); band(-22, -50, "#F2C230", 142); band(-50, -76, "#E0503A", 143); band(-76, -L + 6, "#3FAE5A", 144);
    const tip = poly([[-bw + 6, -L], [bw - 6, -L], [7, -L - 34], [-7, -L - 34]], 3);
    sk.fill(tip, "#9B6BD6", { ...flat, seed: 145 });
    thin(sk, 0.8, () => { sk.ink(tip, { w: 8, seed: 146, wob: 0.4 }); sk.ink(rrect(-bw, -L, bw * 2, L + 8, 7), { w: 9, seed: 147, wob: 0.5 }); });
  }, 0.16);
  handDot(sk, rh, C.skin, 151, 13);
  sparkle(sk, rh[0] - 46, rh[1] - 132, 22, { seed: 155 });
  return sk;
}

/* ---------- g2u2l7: 오래된 돌계단. 모서리가 닳아 둥글고 틈마다 풀이 돋아 돌이 벌어졌다 ---------- */
function tuft(sk, x, y, n, h, sd) {
  for (let i = 0; i < n; i++) { const lean = (i - (n - 1) / 2) * 11; sk.ink(curve([[x + lean * 0.3, y], [x + lean * 0.7, y - h * 0.6], [x + lean * 1.3, y - h * (0.85 + 0.3 * hash(sd + i))]]), { w: 7, color: C.green, seed: sd + i, wob: 0.3 }); }
}
function cutL7() {
  const sk = new Sk(W, H, { id: "h" });
  const GY = 668;
  ground(sk, GY, 11, 14, 340);
  const st = dense([[326, GY], [326, 600], [333, 578], [350, 564], [378, 558], [520, 560], [520, 490], [527, 468], [544, 454], [572, 448], [712, 450], [712, 380], [719, 358], [736, 344], [764, 338], [946, 340], [946, GY], [326, GY]], 5);
  sk.fill(st, "#DADDE1", { dx: 0, dy: 0, wob: 0.8, seed: 21, tex: 1.2, texAng: 0.1, texDark: 0.08 });
  thin(sk, 0.8, () => {
    // 돌과 돌 사이의 이음
    for (const [a, b, i] of [[[520, 560], [946, 562], 0], [[712, 450], [946, 452], 1], [[640, 562], [642, GY], 2], [[830, 452], [832, 562], 3], [[790, 562], [792, GY], 4]]) sk.ink(dense([a, b]), { w: 4, color: "#9AA1A8", seed: 31 + i, wob: 0.8 });
    sk.ink(st, { w: 10, seed: 23, wob: 1.2 });
    // 벌어진 틈(쐐기 꼴)과 가는 금
    for (const [x, y, w, d, i] of [[436, 559, 15, 76, 0], [628, 449, 21, 96, 1], [852, 339, 12, 62, 2]]) {
      const g = poly([[x - w, y - 4], [x + w, y - 4], [x + 3, y + d * 0.55], [x - 2, y + d]], 3);
      sk.fill(g, C.white, { ...flat, seed: 41 + i });
      sk.ink(dense([[x - w, y - 2], [x - 3, y + d * 0.5], [x - 2, y + d]]), { w: 6, seed: 44 + i, wob: 0.6 });
      sk.ink(dense([[x + w, y - 2], [x + 3, y + d * 0.55], [x - 2, y + d]]), { w: 6, seed: 47 + i, wob: 0.6 });
    }
    sk.ink(dense([[560, 500], [574, 530], [566, 556]]), { w: 4, color: "#6B7279", seed: 51, wob: 0.5 });
    sk.ink(dense([[900, 380], [888, 410], [896, 440]]), { w: 4, color: "#6B7279", seed: 52, wob: 0.5 });
  });
  tuft(sk, 436, 566, 4, 64, 61); tuft(sk, 628, 458, 5, 84, 71); tuft(sk, 852, 346, 3, 50, 81);
  tuft(sk, 526, 560, 3, 40, 91); tuft(sk, 718, 450, 3, 40, 95);
  // 떨어져 나온 부스러기
  for (const [x, y, r, i] of [[300, 656, 11, 0], [276, 660, 7, 1], [312, 640, 6, 2], [498, 552, 6, 3]]) { const c = circ(x, y, r, { over: 0.1, seed: 101 + i, lump: 0.1 }); sk.fill(c, "#C9CDD2", { ...flat, seed: 105 + i }); sk.ink(c, { w: 4, seed: 109 + i, wob: 0.4 }); }
  // 빗방울 몇 개
  for (const [x, y, i] of [[470, 250, 0], [560, 180, 1], [650, 290, 2], [760, 150, 3], [840, 230, 4], [910, 120, 5], [690, 110, 6]]) sk.ink(dense([[x, y], [x + 7, y + 28]]), { w: 5, color: "#5FAEDD", seed: 121 + i, wob: 0.2 });
  // 학생: 올려다본다
  const P = pose({ elR: [100, -300], haR: [176, -338], tilt: -0.2, head: [-8, -432] });
  drawFigure(sk, 164, GY, 0.74, P, { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- g2u2l7b: 삽으로 판 땅의 단면. 위는 검은 흙, 아래로 갈수록 자갈과 돌 ---------- */
function cutL7b() {
  const sk = new Sk(W, H, { id: "i" });
  const GY = 384, x0 = 16, x1 = 944, B = 704, hx0 = 548, hx1 = 668, hd = 52;
  const wav = (y, ph, amp = 5) => { const p = []; for (let i = 0; i <= 40; i++) p.push([x0 + i / 40 * (x1 - x0), y + amp * Math.sin(i * 0.55 + ph)]); return p; };
  const surf = [[x0, GY], [hx0, GY], [hx0 + 14, GY + hd], [hx1 - 14, GY + hd], [hx1, GY], [x1, GY]];
  const b1 = wav(GY + 74, 0.5), b2 = wav(GY + 150, 2.1), b3 = wav(GY + 236, 4.0, 7);
  const band = (topPts, botPts, col, sd, o = {}) => sk.fill([...topPts, ...botPts.slice().reverse(), topPts[0]], col, { dx: 0, dy: 0, wob: 0.4, seed: sd, ...o });
  band(dense(surf, 6), b1, "#7A5236", 21, { tex: 0.9, texAng: 0.05 });   // 식물이 자라는 검은 흙
  band(b1, b2, "#CFA36A", 22);                                            // 진흙 등이 쌓인 층
  band(b2, b3, "#EAD9B8", 23);                                            // 암석 조각과 모래
  band(b3, [[x0, B], [x1, B]], "#D3D7DB", 24, { tex: 1.4, texAng: 0.2, texDark: 0.07 }); // 풍화를 받지 않은 암석
  thin(sk, 0.8, () => {
    // 자갈과 돌: 아래로 갈수록 크다
    for (let i = 0; i < 17; i++) { const u = hash(i * 3.7), v = hash(i * 9.1 + 2), x = x0 + 40 + u * (x1 - x0 - 80), y = GY + 172 + v * 50, r = 9 + v * 15; const c = circ(x, y, r, { over: 0.1, seed: 31 + i, lump: 0.16, sy: 0.72 }); sk.fill(c, "#B4BAC0", { ...flat, seed: 51 + i }); sk.ink(c, { w: 4.5, seed: 71 + i, wob: 0.4 }); }
    for (const [a, b, i] of [[[150, GY + 250], [210, B - 10], 0], [[430, GY + 246], [392, B - 6], 1], [[640, GY + 252], [700, B - 20], 2], [[840, GY + 248], [818, B - 8], 3], [[210, B - 60], [392, B - 44], 4], [[700, B - 52], [818, B - 70], 5]]) sk.ink(dense([a, [(a[0] + b[0]) / 2 + 10, (a[1] + b[1]) / 2 - 6], b]), { w: 5, color: "#8E959C", seed: 91 + i, wob: 0.8 });
    for (const [b, i] of [[b1, 0], [b2, 1], [b3, 2]]) sk.ink(b, { w: 4, color: "#6B4A32", seed: 101 + i, wob: 0.3, alpha: 0.7 });
    // 뿌리
    for (const [x, i] of [[110, 0], [250, 1], [450, 2], [780, 3], [890, 4]]) sk.ink(curve([[x, GY + 4], [x + 6, GY + 28], [x - 8, GY + 52]]), { w: 3.5, color: "#E9D9B0", seed: 111 + i, wob: 0.3 });
    sk.ink(dense([...surf, [x1, B], [x0, B], [x0, GY]], 6), { w: 10, seed: 121, wob: 0.8 });
  });
  for (const [x, i] of [[70, 0], [250, 1], [470, 2], [760, 3], [880, 4]]) tuft(sk, x, GY - 2, 3, 30, 131 + i * 5);
  // 파낸 흙더미
  const md = [...curve([[690, GY - 2], [716, GY - 44], [760, GY - 56], [806, GY - 40], [830, GY - 2]], false, 4), [690, GY - 2]];
  sk.fill(md, "#7A5236", { ...flat, seed: 151, tex: 0.9 }); thin(sk, 0.8, () => sk.ink(md, { w: 9, seed: 152 }));
  // 심을 모종
  thin(sk, 0.8, () => {
    sk.ink(curve([[150, GY - 50], [152, GY - 84], [148, GY - 110]]), { w: 8, color: C.green, seed: 161, wob: 0.3 });
    for (const sg of [-1, 1]) { const lf = curve([[149, GY - 96], [149 + sg * 30, GY - 128], [149 + sg * 52, GY - 108], [149 + sg * 24, GY - 90]], true, 3); sk.fill(lf, C.green, { ...flat, seed: 163 }); sk.ink(lf, { w: 6, seed: 164 + sg, wob: 0.4 }); }
    const pot = poly([[116, GY - 52], [184, GY - 52], [174, GY - 2], [126, GY - 2]], 3);
    sk.fill(pot, "#3A3F47", { ...flat, seed: 167 }); sk.ink(pot, { w: 8, seed: 168 });
  });
  // 학생과 삽
  const fx = 340, s = 0.62;
  const P = pose({ elR: [96, -292], haR: [170, -262], elL: [-20, -280], haL: [84, -330], tilt: 0.1, head: [8, -434] });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student", hands: false });
  const h1 = [fx + s * 84, GY - s * 330], tipx = (hx0 + hx1) / 2, tipy = GY + hd - 6;
  const dx = tipx - h1[0], dy = tipy - h1[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  thin(sk, 0.8, () => {
    sk.ink(dense([[h1[0] - ux * 26, h1[1] - uy * 26], [tipx - ux * 66, tipy - uy * 66]]), { w: 10, color: "#8A5A33", seed: 171, wob: 0.3 });
    const bl = poly([[tipx - ux * 70 - uy * 24, tipy - uy * 70 + ux * 24], [tipx - ux * 70 + uy * 24, tipy - uy * 70 - ux * 24], [tipx - ux * 16 + uy * 20, tipy - uy * 16 - ux * 20], [tipx, tipy], [tipx - ux * 16 - uy * 20, tipy - uy * 16 + ux * 20]], 3);
    sk.fill(bl, "#AEB8C2", { ...flat, seed: 172 }); sk.ink(bl, { w: 8, seed: 173 });
  });
  handDot(sk, h1, C.skin, 175, 11); handDot(sk, [fx + s * 170, GY - s * 262], C.skin, 177, 11);
  return sk;
}

/* ---------- g2u2l8: 깨진 접시 조각. 가장자리가 맞물리고 꽃무늬까지 이어진다 ---------- */
function cutL8() {
  const sk = new Sk(W, H, { id: "j" });
  const GY = 668, cx = 620, cy = 388, rx = 236, ry = 172;
  ground(sk, GY, 11);
  // 식탁(비스듬히 내려다본 윗면)
  thin(sk, 0.8, () => {
    for (const [x, i] of [[340, 0], [906, 1]]) sk.ink(dense([[x, 596], [x, GY]]), { w: 12, seed: 21 + i });
    const top = poly([[376, 190], [868, 190], [944, 600], [298, 600]], 5);
    sk.fill(top, C.woodLight, { seed: 23, tex: 1.3, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 24 });
  });
  // 접시(온전한 그림을 먼저 그리고, 금을 식탁 색 틈으로 벌린다)
  const pl = ell(cx, cy, rx, ry);
  sk.fill(pl, C.white, { ...flat, seed: 31 });
  sk.ink(ell(cx, cy, rx - 26, ry - 20), { w: 13, color: "#3F7CC0", seed: 32, wob: 0.4 });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.2; sk.at(cx + 66 * Math.cos(a), cy + 50 * Math.sin(a), 1, () => { const pt = ell(0, 0, 50, 26); sk.fill(pt, "#F0627A", { ...flat, seed: 41 + i }); sk.ink(pt, { w: 5, seed: 47 + i, wob: 0.4 }); }, Math.atan2(50 * Math.sin(a), 66 * Math.cos(a))); }
  const ct = ell(cx, cy, 34, 26); sk.fill(ct, C.yellow, { ...flat, seed: 55 }); sk.ink(ct, { w: 5, seed: 56, wob: 0.4 });
  thin(sk, 0.8, () => sk.ink(pl, { w: 10, seed: 33, wob: 0.6 }));
  // 금: 가운데 근처에서 세 갈래
  const hub = [cx + 14, cy - 8];
  const edge = a => [cx + (rx + 6) * Math.cos(a), cy + (ry + 6) * Math.sin(a)];
  [[-1.9, 0], [0.35, 1], [2.6, 2]].forEach(([a, i]) => {
    const e = edge(a), n = 7, pts = [], nx = -(e[1] - hub[1]), ny = e[0] - hub[0], L = Math.hypot(nx, ny);
    for (let j = 0; j <= n; j++) { const t = j / n, off = (j === 0 || j === n) ? 0 : (j % 2 ? 1 : -1) * (9 + 7 * hash(i * 5 + j)); pts.push([hub[0] + (e[0] - hub[0]) * t + nx / L * off, hub[1] + (e[1] - hub[1]) * t + ny / L * off]); }
    const d = dense(pts, 4);
    sk.ink(d, { w: 22, color: C.woodLight, seed: 61 + i, wob: 0 });
    for (const sg of [-1, 1]) sk.ink(d.map(([x, y]) => [x + sg * nx / L * 10, y + sg * ny / L * 10]), { w: 5, seed: 64 + i * 2 + sg, wob: 0.2 });
  });
  // 맞추는 방향
  for (const [a, b, i] of [[[cx - 150, cy - 232], [cx - 112, cy - 196], 0], [[cx + 40, cy - 240], [cx - 2, cy - 200], 1]]) arrow(sk, [a, b], { w: 8, color: C.teal, straight: true, seed: 81 + i * 5, head: 16, wob: 0.2 });
  // 학생
  const fx = 178, s = 0.76;
  const P = pose({ elR: [104, -292], haR: [196, -306], tilt: 0.08, head: [6, -436] });
  drawFigure(sk, fx, GY, s, P, { ...STUDENT, name: "student", hands: "L" });
  const hx = fx + s * 196, hy = GY - s * 306;
  const f = dense([[hx + 6, hy - 2], [hx + 46, hy - 12]]);
  sk.ink(f, { w: 16, seed: 91, wob: 0.3 }); sk.ink(f, { w: 8, color: C.skin, seed: 92, wob: 0.3 });
  handDot(sk, [hx, hy], C.skin, 93, 13);
  return sk;
}

/* ---------- g2u2l9: 금이 간 삶은 달걀. 조각의 한가운데는 멀쩡하고 금이 간 곳만 들썩인다 ---------- */
function cutL9() {
  const sk = new Sk(W, H, { id: "k" });
  const GY = 668, TY = 566, cx = 650, cy = 338, rx = 158, ry = 200;
  ground(sk, GY, 11);
  table(sk, 452, 930, TY, GY, 21);
  const ep = a => [cx + rx * (1 + 0.13 * Math.sin(a)) * Math.cos(a), cy + ry * Math.sin(a)];
  const egg = []; for (let i = 0; i <= 80; i++) egg.push(ep(-Math.PI / 2 + i / 80 * Math.PI * 2));
  sk.fill(egg, "#F6E7D2", { ...flat, seed: 31, tex: 1.5, texDark: 0.05 });
  // 금
  const N = { A: [cx - 24, cy - 86], B: [cx + 66, cy - 10], C: [cx - 64, cy + 44], D: [cx + 26, cy + 104] };
  const cracks = [[N.A, ep(-2.25)], [N.A, ep(-1.05)], [N.A, N.B], [N.B, ep(0.02)], [N.A, N.C], [N.C, ep(3.0)], [N.C, N.D], [N.B, N.D], [N.D, ep(1.45)]];
  const mids = [];
  thin(sk, 0.8, () => {
    cracks.forEach(([a, b], i) => {
      const n = 5, pts = [], nx = -(b[1] - a[1]), ny = b[0] - a[0], L = Math.hypot(nx, ny);
      for (let j = 0; j <= n; j++) { const t = j / n, off = (j === 0 || j === n) ? 0 : (j % 2 ? 1 : -1) * (6 + 6 * hash(i * 7 + j)); pts.push([a[0] + (b[0] - a[0]) * t + nx / L * off, a[1] + (b[1] - a[1]) * t + ny / L * off]); }
      sk.ink(dense(pts, 4), { w: 6, seed: 41 + i, wob: 0.3 });
      mids.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, nx / L, ny / L]);
    });
    sk.ink(egg, { w: 10, seed: 33, wob: 0.6 });
  });
  // 들썩임: 금 양쪽의 짧은 떨림 선
  mids.forEach(([mx, my, nx, ny], i) => { if (i === 5 || i === 8) return; for (const sg of [-1, 1]) for (const d of [16, 26]) { const tx = -ny, ty = nx, hl = d === 16 ? 15 : 9; sk.ink(dense([[mx + sg * nx * d - tx * hl, my + sg * ny * d - ty * hl], [mx + sg * nx * d + tx * hl, my + sg * ny * d + ty * hl]]), { w: 4.5, color: C.red, seed: 61 + i * 4 + d + sg, wob: 0.3 }); } });
  // 달걀 받침
  thin(sk, 0.8, () => {
    const cup = poly([[cx - 92, cy + 150], [cx + 92, cy + 150], [cx + 58, TY - 2], [cx - 58, TY - 2]], 4);
    sk.fill(cup, "#2FB6A6", { ...flat, seed: 81, tex: 0.9 }); sk.ink(cup, { w: 10, seed: 82 });
  });
  // 쌤: 손가락으로 살짝 누른다
  const fx = 300, s = 0.8;
  const press = ep(Math.PI + 0.42);
  const hx = press[0] - 46, hy = press[1] - 14;
  const P = pose({ elR: [112, -366], haR: [(hx - fx) / s, -(GY - hy) / s], tilt: 0.06, head: [-6, -436] });
  drawFigure(sk, fx, GY, s, P, { ...TEACHER, name: "teacher", hands: "L" });
  const f = dense([[hx + 6, hy + 2], [press[0] - 6, press[1] - 2]]);
  sk.ink(f, { w: 16, seed: 91, wob: 0.3 }); sk.ink(f, { w: 8, color: C.skin, seed: 92, wob: 0.3 });
  handDot(sk, [hx, hy], C.skin, 93, 13);
  arrow(sk, [[hx - 6, hy - 78], [hx + 14, hy - 30]], { w: 9, color: C.red, straight: true, seed: 95, head: 18, wob: 0.2 });
  return sk;
}

export function cuts() {
  return [
    { name: "g2u2l1", theme: "geo", orig: null, sk: cutL1(), alt: "비 오는 날 우산을 쓴 스틱맨이 화분의 풀을 가리키고, 곁에 웅덩이와 젖은 흙, 구름 사이로 달이 보이는 장면", cap: "비, 흙, 풀, 웅덩이, 달이 한 장면에 이어져 있어요" },
    { name: "g2u2l1b", theme: "geo", orig: null, sk: cutL1b(), alt: "반으로 자른 복숭아의 얇은 껍질을 스틱맨이 손가락으로 짚고, 자른 면에 두꺼운 과육과 씨의 겉과 속이 보이는 장면", cap: "껍질은 종이처럼 얇고, 과육이 가장 두꺼워요" },
    { name: "g2u2l2", theme: "geo", orig: null, sk: cutL2(), alt: "잡곡밥 한 그릇에 섞인 흰 쌀, 검은콩, 노란 조를 스틱맨이 젓가락으로 가리키는 장면", cap: "밥 한 그릇에 여러 알갱이가 섞여 있어요" },
    { name: "g2u2l2b", theme: "geo", orig: null, sk: cutL2b(), alt: "스틱맨이 색이 같은 분필 두 자루를 칠판에 그었는데 한 줄은 흰색, 한 줄은 붉은색으로 그어진 장면", cap: "겉은 같아도 그은 자국의 색은 달라요" },
    { name: "g2u2l4", theme: "geo", orig: null, sk: cutL4(), alt: "유리컵에 색이 다른 시리얼과 요거트를 한 겹씩 번갈아 담고 옆에서 줄무늬를 들여다보는 스틱맨", cap: "먼저 담은 것이 아래에 있어요" },
    { name: "g2u2l5", theme: "geo", orig: null, sk: cutL5(), alt: "제멋대로 놓인 낙엽 뭉치와, 두꺼운 책 더미 사이에 끼워 누르자 모두 납작하게 나란히 누운 낙엽을 견주는 장면", cap: "위에서 누르면 옆으로 나란히 누워요" },
    { name: "g2u2l6", theme: "geo", orig: null, sk: cutL6(), alt: "스틱맨이 부순 크레파스 조각을 틀에 눌러 담고, 다른 손으로는 녹여 굳힌 새 크레파스를 들어 보이는 장면", cap: "부수고, 누르고, 녹이고, 굳히면 다른 모습이 돼요" },
    { name: "g2u2l7", theme: "geo", orig: null, sk: cutL7(), alt: "모서리가 닳아 둥글고 틈마다 풀이 돋아 돌이 벌어진 오래된 돌계단을 스틱맨이 올려다보는 장면", cap: "비와 풀이 오랫동안 돌을 부숴요" },
    { name: "g2u2l7b", theme: "geo", orig: null, sk: cutL7b(), alt: "스틱맨이 삽으로 땅을 파자 위는 검은 흙, 아래로 갈수록 자갈과 돌이 드러나는 땅의 단면이 보이는 장면", cap: "위는 검은 흙, 아래로 갈수록 돌이에요" },
    { name: "g2u2l8", theme: "geo", orig: null, sk: cutL8(), alt: "식탁 위에서 깨진 접시 조각들을 맞추자 가장자리가 맞물리고 꽃무늬까지 이어지는 장면", cap: "모양도 무늬도 이어지면 원래 하나였어요" },
    { name: "g2u2l9", theme: "geo", orig: null, sk: cutL9(), alt: "금이 간 삶은 달걀을 스틱맨이 손가락으로 살짝 누르자 껍데기 조각의 한가운데는 멀쩡하고 금이 간 곳만 들썩이는 장면", cap: "일은 조각의 가장자리에서 일어나요" },
  ];
}
