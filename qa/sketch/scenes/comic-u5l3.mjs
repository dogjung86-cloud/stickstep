// 중1 과학 u5l3 만화 v2(배선 전 미리보기): 사과에서 달까지(중력, 무게, 질량). 6컷.
// 조사와 콘티: qa/sketch/research/u5l3.md
//   1 1666년 무렵 울즈소프, 떨어지는 사과 → 2 왜 늘 땅 쪽으로(중력) → 3 1687년, 달도 떨어지는 중(프린키피아)
//   → 4 1969년 달, 우주 비행사는 가볍게 걷는다 → 5 1972년 달 착륙선 안, 용수철저울에 단 돌 자루(무게)
//   → 6 상상 실험: 양팔저울은 달에서도 수평(질량)
// 사과가 머리에 맞는 장면은 그리지 않는다(19세기에 덧붙은 이야기). 지구 아래쪽에서 놓은 사과는 바로 뒤 랩의 예측 질문이라 그리지 않는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, hash, emark, qmark, xmark, check, sparkle, drop, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, R } from "../lib/figure.mjs";
import { cloud, earth, openBook, desk } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
// 뉴턴: 어깨까지 오는 밝은 긴 머리 + 붉은 갈색 외투(지금 만화의 뉴턴과 같은 모습). 1687년(마흔네 살)에는 머리가 희끗하다
const NEWTON = { hair: "curls", hairColor: "#C4AC80", coat: { color: "#7E3B45", buttons: C.gold, seam: "#55242C" }, seed: 191, mini: true, face: "calm" };
const NEWTON_OLD = { ...NEWTON, hairColor: "#D8D2C4" };
const MOON_SKY = "#1B2138", MOON_LAND = "#DADDE3";
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

/* ---------- 사과와 과수원 ---------- */

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
// 울즈소프의 돌집(멀리): 밝은 석회암 벽 + 가파른 지붕 + 굴뚝
function stoneHouse(sk, x, y, s, sd = 41) {
  thin(sk, 0.7, () => sk.at(x, y, s, () => {
    const wall = poly([[-150, 0], [-150, -150], [150, -150], [150, 0]], 4);
    sk.fill(wall, "#EFE3C8", { seed: sd, tex: true, texAng: 0.05 }); sk.ink(wall, { w: 10, seed: sd + 1 });
    const roof = poly([[-172, -146], [0, -262], [172, -146]], 4);
    sk.fill(roof, "#9A8F80", { seed: sd + 2, tex: true, texAng: -0.6 }); sk.ink(roof, { w: 10, seed: sd + 3 });
    const ch = poly([[86, -214], [86, -268], [118, -268], [118, -192]], 3);
    sk.fill(ch, "#D8CBB0", { seed: sd + 4 }); sk.ink(ch, { w: 9, seed: sd + 5 });
    for (const [wx, i] of [[-96, 0], [96, 1]]) { const wn = rrect(wx - 26, -118, 52, 50, 4); sk.fill(wn, "#BFD9EA", { dx: 0, dy: 0, wob: 0.4, seed: sd + 6 + i }); sk.ink(wn, { w: 8, seed: sd + 8 + i }); sk.ink(dense([[wx, -118], [wx, -68]]), { w: 5, seed: sd + 10 + i, wob: 0.2 }); }
    const door = rrect(-28, -96, 56, 96, 6); sk.fill(door, "#8A5A33", { dx: 0, dy: 0, wob: 0.4, seed: sd + 12 }); sk.ink(door, { w: 8, seed: sd + 13 });
  }));
}
// 걸터앉는 바위: (x0..x1) 바닥 폭, top = 앉는 높이(y). 앞쪽(x1)은 무릎보다 뒤에 있어 정강이가 바위 앞에서 읽힌다
function rock(sk, x0, x1, top, y, sd = 51) {
  const b = curve([[x0, y], [x0 - 6, top + 34], [x0 + 30, top + 4], [(x0 + x1) / 2, top - 4], [x1 - 14, top + 6], [x1 + 4, top + 40], [x1 + 8, y]], false, 4);
  sk.fill([...b, b[0]], "#C9C2B4", { seed: sd, tex: true, texAng: 0.3 }); sk.ink(b, { w: 9, seed: sd + 1 });
}
// 두꺼운 책(프린키피아). (x, y) = 가운데. 표지에 글자는 없다
function bigBook(sk, x, y, s, rot, sd) {
  sk.at(x, y, s, () => {
    const pages = poly([[-44, -56], [52, -56], [52, 60], [-44, 60]], 4);
    sk.fill(pages, C.white, { dx: 0, dy: 0, wob: 0.4, seed: sd }); sk.ink(pages, { w: 7, seed: sd + 1 });
    const cover = poly([[-56, -62], [40, -62], [40, 54], [-56, 54]], 4);
    sk.fill(cover, "#5E4A3A", { seed: sd + 2, tex: true, dx: 1, dy: 1.4 }); sk.ink(cover, { w: 9, seed: sd + 3 });
    sk.ink(dense([[-36, -62], [-36, 54]]), { w: 5, color: "#3A2E24", seed: sd + 4, wob: 0.3 });
    sk.ink(rrect(-22, -34, 46, 28, 4), { w: 4, color: C.gold, seed: sd + 5, wob: 0.2 });
  }, rot);
}

/* ---------- 달과 우주 비행사 ---------- */

// 달 무대: 위는 검은 하늘(띠), 아래는 밝은 회색 땅
function moonStage(sk, horizon, sd) {
  const sky = [[-12, -12], [972, -12], ...curve([[972, horizon + 10], [720, horizon - 4], [480, horizon + 6], [230, horizon - 6], [-12, horizon + 8]], false, 5)];
  sky.push(sky[0]);
  sk.fill(sky, MOON_SKY, { dx: 0, dy: 0, wob: 0, seed: sd });
  const land = [...curve([[-12, horizon + 8], [230, horizon - 6], [480, horizon + 6], [720, horizon - 4], [972, horizon + 10]], false, 5), [972, 732], [-12, 732]];
  land.push(land[0]);
  sk.fill(land, MOON_LAND, { dx: 0, dy: 0, wob: 0, seed: sd + 1, tex: 0.5, texAng: 0.05 });
}
function crater(sk, x, y, rx, sd) { const c = ell(x, y, rx, rx * 0.3); sk.fill(c, "#BFC4CC", { dx: 0, dy: 0, wob: 0.5, seed: sd }); sk.ink(c, { w: 6, color: "#8A9099", seed: sd + 1, wob: 0.5 }); }
// 달 착륙선(멀리): 금박 싼 아랫단 + 다리 넷 + 흰 위층 선실. (x, y) = 바닥 가운데
function lander(sk, x, y, s, sd) {
  thin(sk, 0.8, () => sk.at(x, y, s, () => {
    for (const sg of [-1, 1]) {
      sk.ink(dense([[sg * 70, -150], [sg * 150, -16]]), { w: 9, color: "#8A8F96", seed: sd + (sg > 0 ? 1 : 0), wob: 0.3 });
      const pad = ell(sg * 150, -10, 28, 9); sk.fill(pad, "#C9CCD2", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 }); sk.ink(pad, { w: 7, seed: sd + 3 });
    }
    const base = poly([[-96, -210], [96, -210], [104, -130], [-104, -130]], 4);
    sk.fill(base, C.gold, { seed: sd + 4, tex: true, texAng: 0.9 }); sk.ink(base, { w: 10, seed: sd + 5 });
    const cab = poly([[-74, -210], [-84, -282], [-36, -326], [46, -326], [84, -276], [74, -210]], 4);
    sk.fill(cab, "#DADDE3", { seed: sd + 6, tex: true, texAng: 0.3 }); sk.ink(cab, { w: 10, seed: sd + 7 });
    for (const sg of [-1, 1]) { const wn = poly([[sg * 8, -298], [sg * 40, -298], [sg * 8, -262]], 3); sk.fill(wn, "#3A4A66", { dx: 0, dy: 0, wob: 0.2, seed: sd + 8 }); sk.ink(wn, { w: 6, seed: sd + 9 }); }
    sk.ink(dense([[46, -326], [70, -370]]), { w: 6, seed: sd + 10, wob: 0.2 });
    sk.ink(ell(76, -378, 18, 9), { w: 6, seed: sd + 11, wob: 0.2 });
  }));
}
// 우주 비행사: 흰 우주복(겉옷) + 등의 생명 유지 장치 + 금빛 가리개를 내린 헬멧 + 회색 장갑과 장화.
// 얼굴은 가리개에 가려 보이지 않는다. 기준점(name)은 헬멧 꼭대기로 다시 잡는다.
const SUIT = { hair: "bald", coat: { color: "#F4F3EE", seam: "#B8B8B2", len: 46 }, handL: "#C9CCD2", handR: "#C9CCD2", seed: 271 };
function astronaut(sk, fx, fy, fs, P, o = {}) {
  const fl = o.mirror ? -1 : 1, sd = o.seed ?? 281;
  sk.at(fx, fy, fs, () => {
    const nx = P.neck[0], ny = P.neck[1];
    const pack = rrect(nx - fl * 78 - 62, ny - 6, 124, 170, 18);
    sk.fill(pack, "#E4E2DA", { seed: sd, dx: 1, dy: 1.4 }); sk.ink(pack, { w: 10, seed: sd + 1 });
    sk.ink(dense([[nx - fl * 78 - 40, ny + 40], [nx - fl * 78 + 40, ny + 40]]), { w: 6, color: "#A9A9A3", seed: sd + 2, wob: 0.3 });
  }, 0, fl);
  drawFigure(sk, fx, fy, fs, P, { ...SUIT, ...o, name: undefined });
  sk.at(fx, fy, fs, () => {
    for (const [f, i] of [[P.ftL, 0], [P.ftR, 1]]) { const b = rrect(f[0] - 30 + 10, f[1] - 30, 60, 34, 12); sk.fill(b, "#D9D9D3", { dx: 0.6, dy: 0.8, seed: sd + 4 + i }); sk.ink(b, { w: 9, seed: sd + 6 + i }); }
    const [hx, hy] = P.head;
    const shell = circ(hx, hy, 124, { over: 0.1, seed: sd + 8 });
    sk.fill(shell, "#F4F3EE", { dx: 1, dy: 1.2, wob: 0.6, seed: sd + 9 }); sk.ink(shell, { w: 12, seed: sd + 10 });
    const vx = hx + 18, visor = curve([[vx - 88, hy - 34], [vx - 50, hy - 78], [vx + 50, hy - 78], [vx + 88, hy - 34], [vx + 80, hy + 44], [vx, hy + 66], [vx - 80, hy + 44]], true, 4);
    sk.fill(visor, "#E8A93A", { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 11, tex: 0.7, texAng: 0.8 }); sk.ink(visor, { w: 10, seed: sd + 12 });
    sk.ink(curve([[vx - 54, hy - 46], [vx - 30, hy - 60], [vx - 6, hy - 62]]), { w: 9, color: "#FFF4D6", seed: sd + 13, wob: 0.2 });
  }, 0, fl);
  if (o.name) sk.mark(o.name, fx + fl * fs * P.head[0], fy + fs * (P.head[1] - 128), R);
}
// 통신 모자(헬멧 속에 쓰는 흰 모자, 양옆에 갈색 귀덮개). 착륙선 안에서 헬멧을 벗은 모습. (hx, hy) = 머리 가운데(그림 좌표), s = 인물 축척
function commCap(sk, hx, hy, s, sd) {
  sk.at(hx, hy, s, () => {
    const dome = [...ell(0, 0, 110, 110, Math.PI + 0.25, Math.PI * 2 - 0.25), ...curve([[100, -40], [50, -56], [0, -60], [-50, -56], [-100, -40]], false, 4)];
    sk.fill(dome, C.white, { dx: 1, dy: 1.4, wob: 0.8, seed: sd }); sk.ink(dome, { w: 11, seed: sd + 1 });
    for (const sg of [-1, 1]) { const ear = rrect(sg * 104 - 22, -34, 44, 64, 16); sk.fill(ear, "#6B4A32", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 2 }); sk.ink(ear, { w: 9, seed: sd + 3 }); }
    sk.ink(curve([[96, 26], [70, 64], [30, 70]]), { w: 6, seed: sd + 4, wob: 0.3 });
  });
}
// 흰 천 자루(돌을 담은 표본 자루). (x, y) = 위 고리
function rockBag(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const bag = curve([[-12, 6], [-44, 40], [-52, 96], [-30, 124], [30, 124], [52, 96], [44, 40], [12, 6]], true, 4);
    sk.fill(bag, "#F2F0E8", { dx: 1, dy: 1.2, wob: 0.6, seed: sd }); sk.ink(bag, { w: 9, seed: sd + 1 });
    sk.ink(curve([[-16, 10], [0, 18], [16, 10]]), { w: 6, seed: sd + 2, wob: 0.3 });
    for (const [bx, by, br, i] of [[-18, 84, 16, 0], [16, 92, 14, 1]]) sk.ink(circ(bx, by, br, { seed: sd + 3 + i, lump: 0.15 }), { w: 4, color: "#B9B3A7", seed: sd + 5 + i, wob: 0.3 });
  });
}

/* ---------- 저울 ---------- */

// 용수철저울: (x, y) = 고리를 거는 점. len = 늘어난 용수철 길이. 아래 갈고리 끝의 y 를 돌려준다
function springScale(sk, x, y, len, sd = 61, s = 1) {
  let hook = 0;
  sk.at(x, y, s, () => {
    sk.ink(circ(0, 12, 10, { seed: sd }), { w: 6, seed: sd + 1, wob: 0.3 });
    const body = rrect(-24, 22, 48, 64, 10);
    sk.fill(body, "#E9A23B", { seed: sd + 2, dx: 0.8, dy: 1 }); sk.ink(body, { w: 8, seed: sd + 3 });
    for (let i = 0; i < 4; i++) sk.ink(dense([[-11, 36 + i * 12], [i % 2 ? 3 : 11, 36 + i * 12]]), { w: 3.5, seed: sd + 4 + i, wob: 0 });
    const y0 = 86, n = Math.max(5, Math.round(len / 18)), pts = [[0, y0]];
    for (let i = 1; i <= n; i++) pts.push([i % 2 ? 16 : -16, y0 + len * (i - 0.5) / n]);
    pts.push([0, y0 + len]);
    sk.ink(dense(pts, 3), { w: 6, color: "#5A5F68", seed: sd + 9, wob: 0.3 });
    sk.ink(curve([[0, y0 + len], [0, y0 + len + 16], [10, y0 + len + 24], [14, y0 + len + 14]]), { w: 6, seed: sd + 10, wob: 0.2 });
  });
  hook = y + (86 + len + 22) * s;
  return hook;
}
// 양팔저울: (x, y) = 받침 바닥 가운데. 두 접시 가운데(바닥 높이) 좌표를 돌려준다
function balance(sk, x, y, s, sd = 81) {
  const pans = [];
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
  });
  for (const sg of [-1, 1]) pans.push([x + sg * 190 * s, y - 214 * s]);
  return pans;
}
// 놋쇠 추(분동). (x, y) = 바닥 가운데
function weight(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const wt = poly([[-18, 0], [-14, -44], [14, -44], [18, 0]], 3);
    sk.fill(wt, "#B8892E", { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(wt, { w: 6, seed: sd + 1, wob: 0.3 });
    sk.ink(circ(0, -54, 8, { seed: sd + 2 }), { w: 5, seed: sd + 3, wob: 0.2 });
  });
}
// 회색 돌(월석). (x, y) = 바닥 가운데
function moonRock(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const r = poly([[-42, 0], [-48, -22], [-34, -40], [-20, -38], [-10, -56], [12, -50], [26, -58], [42, -38], [38, -20], [48, -6], [30, 4]], 4);
    sk.fill(r, "#9DA3AC", { seed: sd, tex: true, texAng: 0.4 }); sk.ink(r, { w: 8, seed: sd + 1 });
    sk.ink(circ(-10, -30, 7, { seed: sd + 2 }), { w: 4, color: "#6E747D", seed: sd + 3, wob: 0.2 });
  });
}

/* ---------- 1. 과수원의 젊은이 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  stoneHouse(sk, 160, 560, 0.62, 41);
  ground(sk, 694, 101);
  tree(sk, 800, 694, 0.98, [[-120, -330], [-20, -430], [92, -360], [150, -280], [26, -300]], 21);
  // 떨어지는 사과(떨어지는 줄 두 개)
  apple(sk, 556, 500, 26, 103);
  sk.ink(dense([[542, 396], [542, 452]]), { w: 5, color: C.gray, seed: 105, wob: 0.3 }); sk.ink(dense([[570, 384], [570, 446]]), { w: 5, color: C.gray, seed: 106, wob: 0.3 });
  // 바위에 걸터앉아 턱을 괴고 생각에 잠긴 뉴턴
  const fx = 372, fy = 694, fs = 0.7;
  rock(sk, fx - 150, fx + 26, fy - fs * 196, fy, 108);
  const sit = pose({ hip: [0, -206], neck: [8, -336], head: [16, -430], tilt: 0.08, elL: [92, -236], haL: [64, -346], elR: [80, -270], haR: [150, -236], knL: [126, -214], ftL: [134, -4], knR: [146, -206], ftR: [168, -2] });
  drawFigure(sk, fx, fy, fs, sit, { ...NEWTON, name: "newton", face: "wide", coat: { ...NEWTON.coat, len: 22 } });
  return sk;
}

/* ---------- 2. 왜 늘 땅 쪽으로 떨어질까 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 700, 121);
  tree(sk, 96, 700, 0.62, [[-80, -330], [70, -380]], 31);
  // 생각 속의 지구: 사과는 옆이나 위가 아니라 지구 중심 쪽으로
  cloud(sk, 688, 360, 470, 480, { seed: 461, tail: [[434, 520, 22, 0], [398, 560, 14, 1]] });
  const ex = 688, ey = 452, er = 104;
  earth(sk, ex, ey, er, { seed: 941 });
  sk.dot(ex, ey, 9, C.ink);
  apple(sk, ex, 268, 24, 123);
  sk.ink(dense([[ex, 300], [ex, ey - 12]]), { w: 6, color: C.red, dash: [12, 10], seed: 124, wob: 0, alpha: 0.7 });
  arrow(sk, [[ex, 296], [ex, 336]], { w: 9, color: C.red, seed: 125, straight: true, head: 22, wob: 0.3 });
  arrow(sk, [[ex - 34, 262], [ex - 112, 250]], { w: 7, color: C.gray, seed: 126, straight: true, head: 17, wob: 0.3 });
  arrow(sk, [[ex + 26, 236], [ex + 70, 182]], { w: 7, color: C.gray, seed: 127, straight: true, head: 17, wob: 0.3 });
  xmark(sk, ex - 136, 248, 0.38, { w: 12, seed: 128 }); xmark(sk, ex + 88, 160, 0.38, { w: 12, seed: 130 });
  // 뉴턴: 주운 사과를 들고 땅을 가리킨다
  const P = pose({ elR: [110, -286], haR: [214, -292], elL: [-56, -250], haL: [-70, -170], tilt: 0.08 });
  const fx = 220, fy = 700, fs = 0.76;
  drawFigure(sk, fx, fy, fs, P, { ...NEWTON, name: "newton", face: "curious", hands: "L" });
  const hx = fx + fs * 214, hy = fy - fs * 292;
  apple(sk, hx + 4, hy - 30, 24, 133);
  handDot(sk, [hx, hy], C.skin, 135, 11);
  return sk;
}

/* ---------- 3. 1687년: 달도 떨어지고 있다 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 704, 141);
  cloud(sk, 650, 360, 560, 540, { seed: 471, tail: [[370, 540, 20, 0], [336, 580, 13, 1]] });
  // 지구와 달: 달을 지구 쪽으로 당기는 힘(빨강)과 달이 옆으로 나아가는 방향(청록), 그래서 둥글게 도는 길
  const ex = 680, ey = 470, er = 92, ro = 250;
  sk.ink(ell(ex, ey, ro, ro, Math.PI * 1.02, Math.PI * 1.98), { w: 6, color: C.gray, dash: [14, 13], seed: 143, wob: 0 });
  earth(sk, ex, ey, er, { seed: 941 });
  const ma = Math.PI * 1.32, mx = ex + ro * Math.cos(ma), my = ey + ro * Math.sin(ma);
  arrow(sk, [[mx + 18, my + 30], [mx + (ex - mx) * 0.42, my + (ey - my) * 0.42]], { w: 9, color: C.red, seed: 145, straight: true, head: 22, wob: 0.3 });
  const tx = -Math.sin(ma), ty = Math.cos(ma);
  arrow(sk, [[mx + tx * 34, my + ty * 34], [mx + tx * 118, my + ty * 118]], { w: 9, color: C.teal, seed: 146, straight: true, head: 22, wob: 0.3 });
  const mn = circ(mx, my, 32, { over: 0.12, seed: 147 });
  sk.fill(mn, "#F7EBB8", { dx: 0.8, dy: 1, wob: 0.5, seed: 148 }); sk.ink(mn, { w: 8, seed: 149 });
  sk.ink(circ(mx - 8, my - 6, 8, { seed: 150 }), { w: 3.5, color: "#C9B77A", seed: 151, wob: 0.2 });
  // 지구 위의 사과도 같은 힘으로 지구 중심 쪽으로
  const aa = Math.PI * 1.72, ax = ex + (er + 26) * Math.cos(aa), ay = ey + (er + 26) * Math.sin(aa);
  apple(sk, ax, ay, 18, 153);
  arrow(sk, [[ax + (ex - ax) * 0.12, ay + (ey - ay) * 0.12 + 14], [ax + (ex - ax) * 0.45, ay + (ey - ay) * 0.45]], { w: 7, color: C.red, seed: 155, straight: true, head: 16, wob: 0.2 });
  // 마흔네 살의 뉴턴: 책을 끼고 달을 가리킨다
  const P = pose({ elR: [96, -340], haR: [160, -410], elL: [-60, -270], haL: [-96, -236], tilt: 0.06 });
  const fx = 200, fy = 704, fs = 0.72;
  drawFigure(sk, fx, fy, fs, P, { ...NEWTON_OLD, name: "newton", face: "smile", hands: "R" });
  bigBook(sk, fx - fs * 96 - 30, fy - fs * 236, 0.9, -0.12, 157);
  handDot(sk, [fx - fs * 96, fy - fs * 236], C.skin, 159, 11);
  return sk;
}

/* ---------- 4. 1969년 달: 가볍게 걷는 우주 비행사 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  moonStage(sk, 300, 161);
  earth(sk, 860, 110, 44, { seed: 943, w: 7 });
  lander(sk, 150, 470, 0.72, 165);
  crater(sk, 380, 650, 70, 167);
  // 발자국
  for (let i = 0; i < 6; i++) { const fx = 300 + i * 52, fy = 560 + (i % 2) * 18; sk.fill(rrect(fx - 14, fy - 7, 28, 14, 6), "#A9AFB8", { dx: 0, dy: 0, wob: 0.3, seed: 171 + i }); }
  // 한 사람은 성큼 걷고, 한 사람은 껑충 뛴다(발이 땅에서 떴다)
  const walk = pose({ elR: [74, -280], haR: [140, -250], elL: [-60, -270], haL: [-110, -230], knL: [-40, -110], ftL: [-96, -14], knR: [56, -116], ftR: [96, -6], tilt: 0.04 });
  astronaut(sk, 500, 700, 0.6, walk, { name: "astro" });
  const hop = pose({ elR: [96, -330], haR: [150, -400], elL: [-80, -300], haL: [-130, -340], knL: [-30, -120], ftL: [-60, -40], knR: [40, -130], ftR: [70, -50], tilt: -0.04 });
  astronaut(sk, 820, 640, 0.56, hop, { name: "astro2", mirror: true, seed: 301 });
  sk.fill(ell(842, 700, 46, 9), "#A9AFB8", { dx: 0, dy: 0, wob: 0.3, seed: 305, alpha: 0.8 });
  for (const [dx, i] of [[-22, 0], [8, 1], [38, 2]]) sk.ink(dense([[842 + dx, 676], [842 + dx, 650]]), { w: 5, color: C.gray, seed: 307 + i, wob: 0.2 });
  return sk;
}

/* ---------- 5. 1972년 달 착륙선 안: 용수철저울에 단 돌 자루 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  // 착륙선 안: 회색 벽과 세모 창(창 너머 검은 하늘과 회색 땅)
  thin(sk, 0.8, () => {
    sk.fill(poly([[-12, -12], [972, -12], [972, 732], [-12, 732]], 4), "#E9EBEF", { dx: 0, dy: 0, wob: 0, seed: 181 });
    for (const x of [470, 640]) sk.ink(dense([[x, 300], [x, 704]]), { w: 6, color: "#C9CCD2", seed: 182 + x, wob: 0.2 });
    const win = poly([[452, 70], [660, 70], [556, 250]], 4);
    sk.fill(win, MOON_SKY, { dx: 0, dy: 0, wob: 0.3, seed: 184 });
    sk.fill(poly([[505, 160], [607, 160], [556, 250]], 3), MOON_LAND, { dx: 0, dy: 0, wob: 0.3, seed: 185 });
    sk.ink(win, { w: 11, seed: 186 });
  });
  ground(sk, 704, 187);
  // 우주 비행사: 헬멧을 벗고 통신 모자를 쓴 채 용수철저울에 돌 자루를 단다
  const P = pose({ elR: [96, -300], haR: [176, -360], elL: [-56, -262], haL: [-36, -214], tilt: 0.04 });
  const fx = 250, fy = 704, fs = 0.66;
  drawFigure(sk, fx, fy, fs, P, { ...SUIT, name: "astro", hands: "L" });
  commCap(sk, fx + fs * P.head[0], fy + fs * P.head[1], fs, 189);
  const hx = fx + fs * 176, hy = fy - fs * 360;
  const hook = springScale(sk, hx, hy - 10, 46, 191);
  handDot(sk, [hx, hy], "#C9CCD2", 193, 11);
  rockBag(sk, hx, hook, 0.9, 195);
  // 생각 구름: 지구에서라면 같은 자루에 용수철이 훨씬 길게 늘어난다
  cloud(sk, 790, 360, 300, 440, { seed: 481, tail: [[620, 420, 16, 0], [588, 446, 10, 1]] });
  earth(sk, 870, 210, 34, { seed: 945, w: 6 });
  const hook2 = springScale(sk, 760, 180, 230, 197, 0.7);
  rockBag(sk, 760, hook2, 0.62, 199);
  return sk;
}

/* ---------- 6. 상상 실험: 양팔저울은 달에서도 수평 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 704, 201);
  desk(sk, 300, 560, 420, { seed: 203, bottom: 704 });
  const pans = balance(sk, 510, 560, 0.62, 205);
  moonRock(sk, pans[0][0], pans[0][1] + 4, 0.8, 207);
  weight(sk, pans[1][0] - 18, pans[1][1] + 4, 0.8, 209); weight(sk, pans[1][0] + 18, pans[1][1] + 4, 0.8, 211);
  // 생각 구름: 같은 저울을 달에 가져가도 수평이다(구름 속은 달의 하늘과 땅)
  cloud(sk, 700, 186, 470, 330, { seed: 491, tail: [[440, 300, 14, 0], [380, 330, 9, 1]] });
  const sky = rrect(510, 60, 380, 110, 18);
  sk.fill(sky, MOON_SKY, { dx: 0, dy: 0, wob: 0.3, seed: 212 });
  sk.fill(rrect(510, 160, 380, 120, 18), MOON_LAND, { dx: 0, dy: 0, wob: 0.3, seed: 213 });
  earth(sk, 840, 100, 24, { seed: 947, w: 5 });
  for (const [x, i] of [[560, 0], [850, 1]]) sk.ink(ell(x, 250, 26, 7), { w: 4, color: "#8A9099", seed: 214 + i, wob: 0.2 });
  const pans2 = balance(sk, 690, 268, 0.42, 217);
  moonRock(sk, pans2[0][0], pans2[0][1] + 3, 0.54, 219);
  weight(sk, pans2[1][0] - 12, pans2[1][1] + 3, 0.54, 221); weight(sk, pans2[1][0] + 12, pans2[1][1] + 3, 0.54, 223);
  check(sk, 800, 210, 0.7);
  const P = pose({ elR: [88, -316], haR: [158, -330], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 150, 704, 0.7, P, { ...TEACHER, name: "teacher" });
  return sk;
}

export const META = {
  title: "사과에서<br><em>달까지</em>",
  lead: "360년쯤 전 영국의 과수원에서 시작해, 사람이 정말 달에 간 날까지 따라가요.",
  narrator: "세상에서 가장 유명한 사과 이야기와 달에 간 우주 비행사 이야기예요. 그 속에서 <b>중력, 무게, 질량</b> 세 낱말을 차례로 만나요.",
  cta: "실험실 열기",
};

const CUTS = [
  {
    fn: p1, when: "1666년 무렵, 영국 울즈소프", stage: "궁금증", title: "과수원의 젊은이",
    caption: "전염병이 돌아 대학이 문을 닫자, 젊은 <b>아이작 뉴턴</b>은 고향 울즈소프에 내려와 지냈어요. 스물세 살이던 1666년 무렵의 어느 날, 생각에 잠겨 앉아 있는데 사과 하나가 툭 떨어졌대요. 사과가 머리에 맞았다는 이야기는 훨씬 뒤에 덧붙은 거예요.",
    bubbles: [{ who: "newton", text: "사과가<br>떨어지네" }],
  },
  {
    fn: p2, when: "1666년 무렵, 영국 울즈소프", stage: "뉴턴의 질문", title: "왜 늘 땅 쪽으로 떨어질까",
    caption: "사과는 왜 옆이나 위로 가지 않고 늘 땅 쪽, 곧 <b>지구의 중심 쪽</b>으로 떨어질까요? 뉴턴은 지구가 사과를 끌어당긴다고 생각했어요. 노년의 뉴턴이 1726년에 친구 스터클리에게 들려준 이야기로 전해져요.",
    term: { name: "중력", def: "지구가 물체를 지구 중심 방향으로 끌어당기는 힘." },
    bubbles: [{ who: "newton", text: "왜 늘<br>땅 쪽으로?" }],
  },
  {
    fn: p3, when: "1687년, 영국", stage: "생각을 넓혀", title: "달도 떨어지고 있다",
    caption: "뉴턴은 사과를 당기는 그 힘이 저 높은 <b>달</b>까지 닿는다고 보았어요. 달도 지구 쪽으로 떨어지고 있지만, 옆으로 워낙 빠르게 움직여서 떨어지는 만큼 비켜 가며 지구 둘레를 돌아요. 뉴턴은 이 생각을 1687년 「프린키피아」라는 책에 담았어요.",
    bubbles: [{ who: "newton", text: "달도<br>떨어지는 중!" }],
  },
  {
    fn: p4, when: "1969년 7월, 달", stage: "달에 간 사람들", title: "달에서는 몸이 가볍다",
    caption: "1969년 7월, 아폴로 11호의 우주 비행사들이 처음으로 달에 내렸어요. 우주복에 생명 유지 장치까지 메면 지구에서는 몹시 무거운 차림인데, 달에서는 가볍게 걷고 껑충 뛰었어요. 달의 중력은 지구의 약 6분의 1밖에 안 되거든요.",
    bubbles: [{ who: "astro", text: "걷기<br>쉬워요!", side: "right" }, { who: "astro2", text: "껑충!" }],
  },
  {
    fn: p5, when: "1972년 4월, 달 착륙선 안", stage: "무게를 재다", title: "용수철저울에 단 돌 자루",
    caption: "아폴로 16호 우주 비행사들은 달에서 모은 돌 자루를 착륙선 안에서 <b>용수철저울</b>에 달았어요. 같은 자루라도 달에서는 용수철이 지구에서의 약 6분의 1만 늘어나요. 이렇게 용수철저울로 재는, 물체에 작용하는 중력의 크기가 <b>무게</b>예요.",
    term: { name: "무게", def: "물체에 작용하는 중력의 크기. 용수철저울로 재고, 단위는 뉴턴의 이름을 딴 N이에요." },
    bubbles: [{ who: "astro", text: "돌 자루를<br>달아 봐요" }],
  },
  {
    fn: p6, stage: "상상 실험", title: "양팔저울이라면?",
    caption: "이번엔 <b>양팔저울</b>을 생각해 봐요. 한쪽에 돌, 다른 쪽에 추를 올려 수평을 맞춘 저울을 그대로 달에 가져가면? 여전히 수평이에요. 돌과 추가 똑같이 약 6분의 1로 가벼워지니까요. 이렇게 어디서 재도 변하지 않는 물체의 고유한 양이 <b>질량</b>이에요.",
    term: { name: "질량", def: "장소가 바뀌어도 변하지 않는 물체의 고유한 양. 양팔저울로 재고 단위는 kg이에요." },
    bubbles: [{ who: "teacher", text: "달에서도<br>수평!" }],
  },
];

export function panels() {
  return CUTS.map(c => ({ sk: c.fn(), bubbles: c.bubbles, when: c.when, whenPos: c.whenPos, stage: c.stage, title: c.title, caption: c.caption, term: c.term }));
}
