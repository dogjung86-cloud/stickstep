// 중1 과학 Ⅵ단원(기체의 성질) 개념 컷 코드 그림.
// 목록은 Ⅵ단원 v5 세션이 새 개념 스텝을 쓰며 낸 것(D:\Brilliant Science\output\g1-v5\u6\concept-cuts.md): u6l1 ~ u6l4.
// u6l5 는 새로 정의할 용어가 없어 개념 스텝이 없다.
// 움직임 표시는 청록, 열은 주황 물결 화살표(Ⅲ단원 문법).
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, drop, squiggle, arrow, hash, sparkle } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { cloud, orange, sun } from "../../lib/props.mjs";
import { W, H, lerpx, lerp2, thin, ray, wavy } from "./common.mjs";

const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
// 화면 좌표로 잡은 관절을 인물 좌표(발 사이 원점, 배율 s)로 바꾼다
const local = (ox, oy, s, j) => Object.fromEntries(Object.entries(j).map(([k, v]) => [k, Array.isArray(v) ? [(v[0] - ox) / s, (v[1] - oy) / s] : v]));

/* ---------- u6l1: 같은 무게의 장바구니, 가는 끈과 넓은 끈 ---------- */
// 도입(u6-snow)이 눈밭의 운동화와 설피를 쓰므로 개념 컷은 다른 생활 장면으로 잡았다(같은 소재를 다시 쓰지 않는다).
// 두 아이가 똑같이 무거운 장바구니(대파와 오렌지)를 한쪽 어깨에 멨다. 왼쪽은 가는 끈이 어깨를 파고들고(빨간 느낌표, 땀), 오른쪽은 넓은 끈이 편하다(반짝임).
function groceryBag(sk, bx, by, sd) {
  // (bx, by) = 가방 윗변 가운데. 대파와 오렌지가 위로 삐져나온다
  sk.ink(dense([[bx - 30, by + 4], [bx - 64, by - 96]]), { w: 14, color: C.green, seed: sd, wob: 0.3 });
  sk.ink(dense([[bx - 30, by + 4], [bx - 44, by - 36]]), { w: 14, color: "#F3F1E6", seed: sd + 1, wob: 0.2 });
  orange(sk, bx + 24, by - 14, 24, { seed: sd + 2, leaf: false });
  const b = rrect(bx - 66, by - 6, 132, 116, 16);
  sk.fill(b, "#E6D3AE", { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd + 3, tex: 0.7 });
  sk.ink(b, { w: 9, seed: sd + 4, wob: 0.5 });
  sk.ink(dense([[bx - 50, by + 22], [bx + 50, by + 22]]), { w: 5, color: "#C2A878", seed: sd + 5, wob: 0.3 });
}
function cutU6l1() {
  const sk = new Sk(W, H, { id: "a" });
  const GY = 680, s = 0.86;
  ground(sk, GY, 11);
  // 두 아이: 끈을 멘 쪽 손으로 끈을 잡았다. 왼쪽 아이는 무게에 눌려 끈 쪽으로 기울었다
  const kids = [
    { x: 250, o: { ...STUDENT, name: "a" }, tilt: 0.12, thin: true, sd: 200 },
    { x: 650, o: { hair: "bob", hairColor: "#8A5A33", seed: 151, name: "b" }, tilt: 0, thin: false, sd: 300 },
  ];
  for (const k of kids) {
    const P = pose({ tilt: k.tilt, head: [k.thin ? 12 : 0, -436], elR: [52, -236], haR: [86, -282], elL: [-40, -258], haL: [-58, -186] });
    const L = (p) => [k.x + s * p[0], GY + s * p[1]]; // 인물 좌표 → 그림 좌표
    const nk = L([4, -338]); // 끈이 어깨를 지나는 자리
    const bag = L([178, -206]); // 가방 윗변 가운데
    groceryBag(sk, bag[0], bag[1], k.sd);
    if (k.thin) {
      // 가는 끈 두 가닥이 어깨 한 점에 모인다
      for (const [dx, i] of [[-46, 0], [46, 1]]) sk.ink(dense([nk, [bag[0] + dx, bag[1] - 2]]), { w: 5, color: "#6B4A32", seed: k.sd + 11 + i, wob: 0.2 });
    } else {
      // 넓은 끈이 어깨를 넓게 덮는다
      const band = [[nk[0] - 24, nk[1] - 4], [nk[0] + 24, nk[1] - 8], [bag[0] + 56, bag[1] - 2], [bag[0] - 56, bag[1] - 2]];
      sk.fill(poly(band, 4), "#F2B632", { dx: 0, dy: 0, wob: 0.3, seed: k.sd + 11 });
      sk.ink(poly(band, 4), { w: 6, seed: k.sd + 12, wob: 0.3 });
    }
    drawFigure(sk, k.x, GY, s, P, k.o);
    if (k.thin) {
      // 어깨에 파고든 자리: 빨간 눌림 표시, 머리 옆의 느낌표와 땀
      for (const [dx, i] of [[-18, 0], [18, 1]]) sk.ink(curve([[nk[0] + dx, nk[1] - 14], [nk[0] + dx * 0.55, nk[1] - 2], [nk[0] + dx, nk[1] + 10]]), { w: 5, color: C.red, seed: k.sd + 13 + i, wob: 0.2 });
      const ex = L([170, -560]);
      emark(sk, ex[0], ex[1], 0.8, { color: C.red, w: 13, seed: k.sd + 15 });
      const dp = L([-128, -520]);
      drop(sk, dp[0], dp[1], 0.95, { rot: -0.3 });
    } else {
      const sp = L([150, -520]);
      sparkle(sk, sp[0], sp[1], 24, { seed: k.sd + 13 });
    }
  }
  return sk;
}

/* ---------- u6l2: 피자 한 판을 둘이 나누면 반쪽, 넷이 나누면 4분의 1쪽(반비례) ---------- */
// 시소(한쪽이 내려간 만큼 다른 쪽이 올라감)는 합이 일정한 관계라 반비례가 아니다(감사 2026-11-15). 곱이 일정한 장면으로 바꿨다:
// 나누는 사람이 2명에서 4명(2배)이 되면 한 사람의 조각은 반쪽에서 4분의 1쪽(2분의 1)이 된다. 사람 수 × 조각 = 피자 한 판.
// 위에는 같은 크기의 피자 한 판이 2조각, 4조각으로 나뉜 모습(위에서 본 모습), 아래에는 같은 크기의 접시에 받은 조각을 든 사람들.
const KID_A = { hair: "bob", hairColor: "#8A5A33", seed: 141 };
const KID_B = { hair: "short", hairColor: "#3F3A36", seed: 151 };
// 위에서 본 피자 조각(가운데 cx, cy, 반지름 r, a0~a1 부채꼴). 크러스트, 치즈, 페퍼로니, 허브
function pizzaPiece(sk, cx, cy, r, a0, a1, sd, o = {}) {
  const sy = o.sy ?? 1; // 1이면 위에서 본 모습, 1보다 작으면 비스듬히 본 모습
  const P = (a, k) => [cx + r * k * Math.cos(a), cy + r * k * Math.sin(a) * sy];
  const n = Math.max(6, Math.ceil(((a1 - a0) * r) / 10));
  const rim = [];
  for (let i = 0; i <= n; i++) rim.push(P(a0 + ((a1 - a0) * i) / n, 1));
  const shape = [[cx, cy], ...rim, [cx, cy]];
  sk.fill(shape, "#E7A957", { dx: 0, dy: 0, wob: 0.3, seed: sd, tex: 0.7 });
  const inner = [];
  for (let i = 0; i <= n; i++) inner.push(P(a0 + ((a1 - a0) * i) / n, 0.84));
  sk.fill([[cx, cy], ...inner, [cx, cy]], "#FBCB4C", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1, tex: 0.6 });
  // 페퍼로니와 허브: 조각 안의 고정된 자리
  const tops = o.tops ?? [];
  for (const [t, k, i] of tops.map((v, j) => [...v, j])) {
    const a = a0 + (a1 - a0) * t;
    const [x, y] = P(a, k);
    const pr = r * 0.13;
    const pe = ell(x, y, pr, pr * sy);
    sk.fill(pe, "#D9533B", { dx: 0, dy: 0, wob: 0.2, seed: sd + 5 + i });
    sk.ink(pe, { w: 3.5, color: "#A33A26", seed: sd + 20 + i, wob: 0.2 });
  }
  for (const [t, k, i] of (o.herbs ?? []).map((v, j) => [...v, j])) {
    const a = a0 + (a1 - a0) * t;
    const [x, y] = P(a, k);
    sk.ink(dense([[x - 5, y], [x + 5, y - 2 * sy]]), { w: 5, color: "#4F9A47", seed: sd + 40 + i, wob: 0.2 });
  }
  sk.ink(shape, { w: o.w ?? 7, seed: sd + 60, wob: 0.4 });
}
// 위에서 본 피자 한 판을 n조각으로 나눠 조금씩 벌려 놓는다(나무 판 위)
function wholePizza(sk, cx, cy, r, n, sd) {
  const board = circ(cx, cy, r + 22, { over: 0.1, seed: sd });
  sk.fill(board, "#C99A62", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 1, tex: 0.8 });
  sk.ink(board, { w: 8, seed: sd + 2, wob: 0.3 });
  const gap = 9;
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const a1 = a0 + (2 * Math.PI) / n;
    const am = (a0 + a1) / 2;
    const tops = n === 2 ? [[0.2, 0.55], [0.5, 0.35], [0.8, 0.6], [0.45, 0.72]] : [[0.3, 0.55], [0.7, 0.6]];
    const herbs = n === 2 ? [[0.32, 0.3], [0.65, 0.5], [0.15, 0.78]] : [[0.5, 0.35], [0.2, 0.78]];
    pizzaPiece(sk, cx + gap * Math.cos(am), cy + gap * Math.sin(am), r, a0, a1, sd + 10 + i * 70, { tops, herbs, w: 7 });
  }
}
// 받은 조각을 두 손으로 앞에 들어 보이는 사람. 조각은 위에서 본 모습 그대로(반지름이 같아 반쪽과 4분의 1쪽의 크기를 바로 비교한다)
const PR = 56;
function holder(sk, x, gy, s, who, kind, sd) {
  const cy = kind === "half" ? gy - 72 : gy - 66; // 반쪽: 곧은 변의 가운데, 4분의 1쪽: 뾰족한 끝
  const hands = kind === "half" ? [[x - PR + 4, cy - 4], [x + PR - 4, cy - 4]] : [[x - PR * 0.68, cy - PR * 0.62], [x + PR * 0.68, cy - PR * 0.62]];
  const L = (p) => [(p[0] - x) / s, (p[1] - gy) / s];
  const P = pose({ elL: [-86, -232], haL: L(hands[0]), elR: [86, -232], haR: L(hands[1]), tilt: 0 });
  drawFigure(sk, x, gy, s, P, { ...who, hands: false });
  const tops = kind === "half" ? [[0.2, 0.55], [0.5, 0.35], [0.8, 0.6], [0.45, 0.72]] : [[0.3, 0.55], [0.7, 0.6]];
  const herbs = kind === "half" ? [[0.32, 0.3], [0.65, 0.5], [0.15, 0.78]] : [[0.5, 0.35], [0.2, 0.78]];
  if (kind === "half") pizzaPiece(sk, x, cy, PR, Math.PI, 2 * Math.PI, sd, { tops, herbs, w: 6 });
  else pizzaPiece(sk, x, cy, PR, (-3 * Math.PI) / 4, -Math.PI / 4, sd, { tops, herbs, w: 6 });
  for (const [i, h] of hands.entries()) handDot(sk, h, C.skin, sd + 90 + i * 2, 11);
}
function cutU6l2() {
  const sk = new Sk(W, H, { id: "b" });
  const P0 = [16, 472], P1 = [488, 944], PT = 16, PB = 704, GY = 684;
  [P0, P1].forEach(([a, b], i) => {
    const r = rrect(a, PT, b - a, PB - PT, 22);
    sk.fill(r, "#FFF6E9", { dx: 0, dy: 0, wob: 0.3, seed: 11 + i });
    thin(sk, 0.6, () => sk.ink(r, { w: 9, seed: 13 + i, color: "#E3D6C2" }));
  });
  // 위: 같은 크기의 피자 한 판(왼쪽 2조각, 오른쪽 4조각)
  thin(sk, 0.85, () => {
    wholePizza(sk, 244, 196, 100, 2, 21);
    wholePizza(sk, 716, 196, 100, 4, 221);
  });
  // 가운데: 나누는 사람이 늘어나는 쪽으로
  arrow(sk, [[446, 196], [514, 196]], { w: 9, color: C.teal, straight: true, seed: 71, head: 22, wob: 0.2 });
  // 아래: 왼쪽은 둘이 반쪽씩, 오른쪽은 넷이 4분의 1쪽씩
  ground(sk, GY, 43, 36, 452);
  ground(sk, GY, 73, 508, 924);
  const s = 0.48;
  holder(sk, 150, GY, s, { ...TEACHER, name: "teacher" }, "half", 301);
  holder(sk, 338, GY, s, { ...STUDENT, name: "student" }, "half", 341);
  holder(sk, 550, GY, s, { ...TEACHER }, "quarter", 381);
  holder(sk, 660, GY, s, { ...STUDENT }, "quarter", 421);
  holder(sk, 770, GY, s, KID_A, "quarter", 461);
  holder(sk, 880, GY, s, KID_B, "quarter", 501);
  return sk;
}

/* ---------- u6l3: 산꼭대기에서 빵빵해진 과자 봉지 ---------- */
function chipBag(sk, cx, cy, s, sd, rot = 0) {
  sk.at(cx, cy, s, () => {
    const zig = (y, x0, x1, n, up) => { const out = []; for (let i = 0; i <= n; i++) out.push([lerpx(x0, x1, i / n), y + (i % 2 ? (up ? -7 : 7) : 0)]); return out; };
    // 빵빵하게 부푼 몸통(옆이 바깥으로 불룩)
    const body = [...zig(-62, -50, 50, 10, true), ...curve([[50, -62], [66, -20], [68, 20], [50, 62]], false, 3).slice(1),
      ...zig(62, 50, -50, 10, false).slice(1), ...curve([[-50, 62], [-68, 20], [-66, -20], [-50, -62]], false, 3).slice(1)];
    sk.fill(body, "#F5B841", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd, tex: 0.7 });
    sk.fill(rrect(-58, -46, 116, 12, 4), "#E0503A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
    sk.fill(rrect(-58, 34, 116, 12, 4), "#E0503A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 });
    const em = circ(0, -2, 22, { over: 0.1, seed: sd + 3 });
    sk.fill(em, C.white, { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 }); sk.ink(em, { w: 5, color: "#E0503A", seed: sd + 5, wob: 0.2 });
    sparkle(sk, 0, -2, 14, { color: "#F58A2E", seed: sd + 6, w: 3 });
    sk.ink(curve([[-40, -30], [-50, 0], [-42, 24]]), { w: 6, color: "#FFF1AE", seed: sd + 7, wob: 0.3 });
    sk.ink(body, { w: 8, seed: sd + 8, wob: 0.4 });
  }, rot);
}
function backpack(sk, x, y, sd) {
  // 뚜껑을 젖혀 연 배낭. (x, y) = 바닥 가운데
  const b = rrect(x - 44, y - 96, 88, 96, 22);
  sk.fill(b, "#3F7CC0", { seed: sd, tex: 0.7, dx: 0.6, dy: 0.8 });
  const pk = rrect(x - 30, y - 50, 60, 36, 10);
  sk.fill(pk, "#5B97D6", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 }); sk.ink(pk, { w: 6, seed: sd + 2, wob: 0.3 });
  sk.ink(b, { w: 9, seed: sd + 3 });
  const opening = ell(x, y - 94, 40, 10);
  sk.fill(opening, "#2C5A8C", { dx: 0, dy: 0, wob: 0.2, seed: sd + 4 }); sk.ink(opening, { w: 6, seed: sd + 5, wob: 0.2 });
  const flap = curve([[x - 38, y - 98], [x - 58, y - 120], [x - 84, y - 112], [x - 70, y - 92]], true, 3);
  sk.fill(flap, "#2F6DB5", { dx: 0, dy: 0, wob: 0.3, seed: sd + 6 }); sk.ink(flap, { w: 7, seed: sd + 7, wob: 0.3 });
}
function house(sk, x, y, w, roof, sd) {
  const h = w * 0.7;
  const b = poly([[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], 2);
  sk.fill(b, "#FBF3E2", { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(b, { w: 4, seed: sd + 1, wob: 0.2 });
  const r = poly([[x - w / 2 - 5, y - h], [x, y - h - w * 0.5], [x + w / 2 + 5, y - h]], 2);
  sk.fill(r, roof, { dx: 0, dy: 0, wob: 0.2, seed: sd + 2 }); sk.ink(r, { w: 4, seed: sd + 3, wob: 0.2 });
  sk.fill(rrect(x - w * 0.12, y - h * 0.5, w * 0.24, h * 0.5, 2), "#8A5A33", { dx: 0, dy: 0, wob: 0.1, seed: sd + 4 });
}
function cutU6l3() {
  const sk = new Sk(W, H, { id: "c" });
  // 먼 산줄기
  thin(sk, 0.7, () => {
    const far = curve([[14, 470], [90, 400], [170, 440], [260, 370], [360, 430], [440, 400], [540, 450], [640, 404], [740, 440], [840, 396], [946, 430]], false, 4);
    sk.fill([...far, [946, 712], [14, 712], far[0]], "#EEF1F4", { dx: 0, dy: 0, wob: 0.3, seed: 11 });
    sk.ink(far, { w: 8, color: "#B9C2CC", seed: 12 });
  });
  // 골짜기의 작은 마을
  sk.fill(poly([[14, 650], [330, 650], [330, 712], [14, 712]], 3), "#DDEBD3", { dx: 0, dy: 0, wob: 0.3, seed: 15 });
  thin(sk, 0.7, () => sk.ink(curve([[14, 652], [160, 648], [330, 654]]), { w: 7, seed: 16, color: "#7E9A70" }));
  [[60, 650, 30, "#E0503A"], [104, 650, 26, "#3F7CC0"], [150, 652, 32, "#F58A2E"], [204, 650, 26, "#E0503A"], [250, 652, 30, "#3FAE5A"]].forEach(([x, y, w, c], i) => house(sk, x, y, w, c, 21 + i * 7));
  for (const [x, i] of [[30, 0], [180, 1], [290, 2]]) { const t = circ(x, 632, 12, { over: 0.1, seed: 61 + i }); sk.fill(t, "#6BB55A", { dx: 0, dy: 0, wob: 0.2, seed: 64 + i }); sk.ink(t, { w: 4, seed: 67 + i, wob: 0.2 }); }
  // 마을 위로 지나는 구름(꼭대기보다 낮다)
  cloud(sk, 230, 560, 170, 56, { seed: 71, w: 6 });
  cloud(sk, 420, 610, 120, 42, { seed: 75, w: 6 });
  // 큰 산: 꼭대기는 오른쪽
  const PT = 516;
  thin(sk, 0.8, () => {
    const m = curve([[300, 712], [380, 650], [470, 590], [548, PT + 6], [580, PT], [800, PT - 2], [830, PT + 8], [900, 600], [946, 630]], false, 4);
    sk.fill([...m, [946, 712], [300, 712], m[0]], "#D9D2C4", { seed: 81, tex: true, texAng: 0.3 });
    sk.ink(m, { w: 11, seed: 82 });
    for (const [a, b, i] of [[[540, 600], [610, 622]], [[700, 572], [780, 556]], [[620, 670], [720, 660]]].map((p, i) => [...p, i])) sk.ink(curve([a, lerp2(a, b, 0.5).map((v, k) => v + (k ? -6 : 0)), b]), { w: 5, color: "#A79E8C", seed: 83 + i, wob: 0.3 });
  });
  // 배낭과 학생
  backpack(sk, 590, PT, 91);
  const fx = 690, s = 0.72;
  const P = pose({ elR: [104, -380], haR: [150, -470], elL: [-96, -312], haL: [-160, -350], tilt: -0.1,
    knL: [-30, -106], ftL: [-52, 0], knR: [26, -106], ftR: [48, 0] });
  drawFigure(sk, fx, PT, s, P, { ...STUDENT, name: "student" });
  const hand = [fx + s * 150, PT - s * 470];
  chipBag(sk, hand[0] + 34, hand[1] - 58, 0.95, 101, 0.12);
  handDot(sk, hand, C.skin, 111, 12);
  // 부풀어 오른 봉지 둘레의 작은 선과 놀람
  for (const [a, i] of [[-2.6, 0], [-1.6, 1], [-0.6, 2], [0.2, 3]]) { const c = [hand[0] + 34, hand[1] - 58]; sk.ink(dense([[c[0] + Math.cos(a) * 92, c[1] + Math.sin(a) * 84], [c[0] + Math.cos(a) * 118, c[1] + Math.sin(a) * 108]]), { w: 6, color: C.gray, seed: 121 + i, wob: 0.2 }); }
  emark(sk, 548, 162, 0.85, { color: C.red, rot: -0.15 });
  return sk;
}

/* ---------- u6l4: 냉장고에 넣어 둔 빈 페트병은 쭈글, 따뜻한 방에 두면 다시 빵빵 ---------- */
// 뚜껑을 꼭 닫은 빈 페트병. (x, y) = 바닥 가운데, h = 높이. dent: 0 = 매끈, 1 = 옆구리가 쭈글(차가워져 속 공기의 부피가 줄었다)
function petBottle(sk, x, y, h, sd, dent = 0) {
  const hw = h * 0.21, nk = h * 0.075, yS = -h * 0.6, yN = -h * 0.82, yC = -h * 0.875;
  // 옆선의 반폭: 몸통은 곧고, 어깨는 둥글게 좁아져 목이 된다(y는 바닥에서 위로 음수)
  const half = yy => yy > yS ? hw : yy > yN ? nk + (hw - nk) * Math.cos((yy - yS) / (yN - yS) * Math.PI / 2) : nk;
  // 찌그러진 자리: [가운데 높이, 위아래 폭, 깊이] (깊으면 병이 아니라 모래시계로 읽혀 얕게 둔다)
  const DL = [[-h * 0.42, h * 0.2, hw * 0.4], [-h * 0.69, h * 0.05, hw * 0.15]], DR = [[-h * 0.27, h * 0.17, hw * 0.34]];
  const dip = (D, yy) => dent * D.reduce((s, [c, sp, dp]) => { const t = 1 - Math.abs(yy - c) / sp; return s + (t > 0 ? dp * t ** 1.2 * (1 + 0.22 * Math.sin((yy - c) * 0.8)) : 0); }, 0);
  const sideL = yy => [x - half(yy) + dip(DL, yy), y + yy], sideR = yy => [x + half(yy) - dip(DR, yy), y + yy];
  const ys = []; for (let yy = -6; yy > yC; yy -= 3) ys.push(yy); ys.push(yC);
  const outline = [[x - hw + 7, y], ...ys.map(sideL), ...ys.slice().reverse().map(sideR), [x + hw - 7, y]];
  sk.fill(outline, "#E4F2FA", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  // 띠 상표(글자 없이 두 빛깔)
  const band = []; for (let yy = -h * 0.17; yy >= -h * 0.38; yy -= 3) band.push(sideL(yy));
  for (let yy = -h * 0.38; yy <= -h * 0.17; yy += 3) band.push(sideR(yy));
  sk.fill(band, "#8ED3AE", { dx: 0, dy: 0, wob: 0.2, seed: sd + 1 });
  const mid = []; for (let yy = -h * 0.255; yy >= -h * 0.295; yy -= 2) mid.push(sideL(yy)); for (let yy = -h * 0.295; yy <= -h * 0.255; yy += 2) mid.push(sideR(yy));
  sk.fill(mid, "#FFFFFF", { dx: 0, dy: 0, wob: 0.1, seed: sd + 2, alpha: 0.85 });
  // 반짝이는 옆 줄(빛을 받은 플라스틱)
  sk.ink(ys.filter(yy => yy < -h * 0.42 && yy > -h * 0.58).map(yy => { const p = sideL(yy); return [p[0] + 9, p[1]]; }), { w: 5, color: "#FFFFFF", seed: sd + 3, wob: 0.2, alpha: 0.9 });
  sk.ink(outline, { w: 7, seed: sd + 4, wob: 0.35, closed: true });
  sk.ink(dense([[x - nk, y + yN + 3], [x + nk, y + yN + 3]]), { w: 5, seed: sd + 5, wob: 0.2 });
  // 뚜껑(꼭 닫혀 있다)
  const cap = rrect(x - nk - 4, y + yC - h * 0.12, 2 * nk + 8, h * 0.125, 4);
  sk.fill(cap, "#3F7CC0", { dx: 0, dy: 0, wob: 0.2, seed: sd + 6 }); sk.ink(cap, { w: 6, seed: sd + 7, wob: 0.2 });
  for (const [k, i] of [[-0.45, 0], [0, 1], [0.45, 2]]) sk.ink(dense([[x + k * nk, y + yC - h * 0.1], [x + k * nk, y + yC - h * 0.025]]), { w: 3, color: "#2A5A8C", seed: sd + 8 + i, wob: 0.1 });
  if (!dent) return;
  // 꺼진 자리의 주름(옆선에서 안쪽으로 짧은 잔물결. 한 점으로 모이면 안쪽을 가리키는 화살촉으로 읽힌다)
  for (const [D, sg, side] of [[DL[0], 1, sideL], [DR[0], -1, sideR]]) {
    const [c, sp] = D;
    for (const [k, len, i] of [[-0.5, 0.62, 0], [0, 0.9, 1], [0.5, 0.62, 2]]) {
      const b = side(c + k * sp), L = hw * len;
      sk.ink(dense([[b[0] + sg * 4, b[1]], [b[0] + sg * L * 0.35, b[1] - 3], [b[0] + sg * L * 0.7, b[1] + 2.5], [b[0] + sg * L, b[1] - 1]], 2), { w: 3.5, color: "#7D8B99", seed: sd + 12 + i * 2 + (sg > 0 ? 0 : 1), wob: 0.15 });
    }
  }
}
// 문을 연 냉장고(왼쪽에 경첩, 문이 왼쪽으로 열렸다). (x0, y0) = 몸통 왼쪽 아래, w·h = 몸통 크기
function fridge(sk, x0, y0, w, h, sd) {
  const top = y0 - h, fz = top + h * 0.3; // 위 칸(냉동실) 아래 선
  const body = rrect(x0, top, w, h - 8, 16);
  sk.fill(body, "#F3F6F9", { seed: sd, tex: 0.5, dx: 0.6, dy: 0.8 });
  // 냉장실 안(찬 푸른빛, 선반 둘, 반찬 그릇)
  const inside = rrect(x0 + 12, fz + 10, w - 24, y0 - 26 - fz - 10, 8);
  sk.fill(inside, "#D3EBFA", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
  sk.glow(x0 + w / 2, fz + 40, w * 0.55, "#FFFFFF", 0.7, 0.2);
  const sh = [fz + (y0 - fz) * 0.36, fz + (y0 - fz) * 0.66];
  for (const [yy, i] of sh.map((v, i) => [v, i])) sk.ink(dense([[x0 + 14, yy], [x0 + w - 14, yy]]), { w: 5, color: "#8FB3CC", seed: sd + 2 + i, wob: 0.1 });
  const jar = rrect(x0 + 28, sh[0] - 40, 30, 40, 6);
  sk.fill(jar, "#F6C77E", { dx: 0, dy: 0, wob: 0.2, seed: sd + 4 }); sk.ink(jar, { w: 5, seed: sd + 5, wob: 0.2 });
  sk.fill(rrect(x0 + 26, sh[0] - 48, 34, 10, 3), "#D2553F", { dx: 0, dy: 0, wob: 0.2, seed: sd + 6 });
  const bw = [x0 + w * 0.52, sh[1]];
  const dish = [...ell(bw[0], bw[1] - 16, 34, 16, 0, Math.PI)];
  sk.fill(dish, "#FFFFFF", { dx: 0, dy: 0, wob: 0.2, seed: sd + 7 }); sk.ink([...dish, dish[0]], { w: 5, seed: sd + 8, wob: 0.2 });
  sk.ink(dense([[bw[0] - 34, bw[1] - 16], [bw[0] + 34, bw[1] - 16]]), { w: 5, seed: sd + 9, wob: 0.2 });
  const drawer = rrect(x0 + 20, sh[1] + 16, w - 40, y0 - 40 - sh[1] - 16, 6);
  sk.fill(drawer, "#BFE0F3", { dx: 0, dy: 0, wob: 0.2, seed: sd + 10 }); sk.ink(drawer, { w: 5, seed: sd + 11, wob: 0.2 });
  sk.ink(inside, { w: 6, seed: sd + 12, wob: 0.2 });
  sk.ink(body, { w: 10, seed: sd + 13 });
  sk.ink(dense([[x0, fz], [x0 + w, fz]]), { w: 8, seed: sd + 14 });
  sk.fill(rrect(x0 + w - 22, fz - 52, 9, 36, 4), "#AEB7C1", { dx: 0, dy: 0, wob: 0.2, seed: sd + 15 });
  for (const [fx, i] of [[x0 + 16, 0], [x0 + w - 16, 1]]) sk.ink(dense([[fx, y0 - 8], [fx, y0]]), { w: 9, seed: sd + 16 + i });
  // 열린 문(비스듬히 보여 좁다) 안쪽의 문 선반 둘
  const door = poly([[x0, fz + 4], [x0 - 34, fz + 22], [x0 - 34, y0 - 30], [x0, y0 - 12]], 3);
  sk.fill(door, "#E6ECF2", { dx: 0, dy: 0, wob: 0.3, seed: sd + 18 });
  for (const [k, i] of [[0.35, 0], [0.68, 1]]) sk.ink(dense([[x0 - 30, lerpx(fz + 22, y0 - 30, k) + 4], [x0 - 4, lerpx(fz + 4, y0 - 12, k)]]), { w: 5, color: "#9AA8B6", seed: sd + 19 + i, wob: 0.1 });
  sk.ink(door, { w: 8, seed: sd + 21 });
}
function cutU6l4() {
  const sk = new Sk(W, H, { id: "d" });
  const P0 = [16, 472], P1 = [488, 944], PT = 16, PB = 704, GY = 640;
  [[P0, "#EAF3FB"], [P1, "#FFF1E3"]].forEach(([[a, b], c], i) => { const r = rrect(a, PT, b - a, PB - PT, 22); sk.fill(r, c, { dx: 0, dy: 0, wob: 0.3, seed: 11 + i }); thin(sk, 0.6, () => sk.ink(r, { w: 9, seed: 13 + i, color: "#C9CED6" })); });
  const BH = 140; // 페트병 높이
  // 왼쪽: 냉장고에서 막 꺼낸 페트병이 쭈글쭈글
  ground(sk, GY, 43, 36, 452);
  thin(sk, 0.72, () => fridge(sk, 70, GY, 140, 396, 31));
  // 냉장고에서 흘러나오는 찬 기운
  for (const [yy, i] of [[420, 0], [476, 1], [532, 2]]) sk.ink(wavy([204, yy], [236, yy - 6], 4, 2), { w: 5, color: "#8FC3E8", seed: 41 + i, wob: 0.1 });
  // 두 손으로 병을 받쳐 든다. 병 꼭대기가 모자 챙에 닿지 않게 골반 높이에서 든다
  const HOLD = { elR: [110, -220], haR: [206, -166], elL: [92, -212], haL: [166, -158] };
  const ks = 0.62, kx = 392;
  // 냉장고 쪽(왼쪽)을 보게 오른쪽을 보던 자세를 좌우로 뒤집었다
  drawFigure(sk, kx, GY, ks, pose({ ...HOLD, tilt: 0.16 }), { ...STUDENT, name: "student", hands: false, mirror: true });
  const kb = [kx - ks * 186, GY - ks * 162];
  petBottle(sk, kb[0], kb[1], BH, 51, 1);
  handDot(sk, [kx - ks * 206, GY - ks * 166], C.skin, 61, 11); handDot(sk, [kx - ks * 166, GY - ks * 158], C.skin, 62, 11);
  qmark(sk, kx + 52, 290, 0.55, { color: C.teal, seed: 65, rot: 0.12 });
  // 가운데: 다음 장면으로
  arrow(sk, [[446, 196], [514, 196]], { w: 9, color: C.teal, straight: true, seed: 71, head: 22, wob: 0.2 });
  // 오른쪽: 햇볕이 드는 따뜻한 방
  ground(sk, GY, 73, 508, 924);
  thin(sk, 0.7, () => {
    const win = rrect(764, 92, 160, 204, 10);
    sk.fill(win, "#CFE8F7", { dx: 0, dy: 0, wob: 0.3, seed: 81 });
    sun(sk, 844, 168, 26, { seed: 83 });
    sk.ink(win, { w: 12, seed: 85, color: "#FFFFFF" });
    sk.ink(win, { w: 7, seed: 86 });
    sk.ink(dense([[844, 96], [844, 292]]), { w: 6, seed: 87 }); sk.ink(dense([[768, 210], [920, 210]]), { w: 6, seed: 88 });
    sk.ink(dense([[750, 300], [936, 300]]), { w: 9, seed: 89 });
  });
  // 창으로 드는 햇볕(옅은 빛줄기, 사람과 병 뒤에 깐다)
  sk.fill([[772, 300], [916, 300], [748, 566], [668, 528]], "#FFE3A0", { dx: 0, dy: 0, wob: 0.3, seed: 90, alpha: 0.42 });
  const ts = 0.62, tx = 556;
  drawFigure(sk, tx, GY, ts, pose({ ...HOLD, tilt: 0.06 }), { ...TEACHER, name: "teacher", hands: false });
  const tb = [tx + ts * 186, GY - ts * 162];
  petBottle(sk, tb[0], tb[1], BH, 91, 0);
  handDot(sk, [tx + ts * 206, GY - ts * 166], C.skin, 93, 11); handDot(sk, [tx + ts * 166, GY - ts * 158], C.skin, 94, 11);
  // 방의 열(주황 물결 화살표)이 병으로
  const bx = tb[0] + BH * 0.21 + 12;
  for (const [a, yy, i] of [[[786, 330], 428, 0], [[808, 366], 468, 1], [[830, 402], 508, 2]]) ray(sk, a, [bx, yy], 95 + i, { amp: 5, waves: 3, w: 6 });
  // 다시 빵빵해진 병 둘레의 반짝
  sparkle(sk, tb[0] + 34, tb[1] - BH - 34, 12, { seed: 99 });
  sparkle(sk, tb[0] - 26, tb[1] - BH - 46, 8, { seed: 101 });
  return sk;
}

export function cuts() {
  return [
    { name: "u6l1", theme: "gas6", orig: null, sk: cutU6l1(), alt: "똑같이 무거운 장바구니를 한 아이는 가는 끈으로, 다른 아이는 넓은 끈으로 어깨에 멘 장면. 가는 끈을 멘 아이의 어깨 위에 빨간 느낌표", cap: "가방 무게는 같은데 가는 끈이 어깨를 더 아프게 해요. 닿는 넓이가 좁아서예요" },
    { name: "u6l2", theme: "gas6", orig: null, sk: cutU6l2(), alt: "같은 크기의 피자 한 판을 왼쪽에서는 쌤과 아이 둘이 반쪽씩, 오른쪽에서는 넷이 4분의 1쪽씩 나눠 든 장면", cap: "피자 한 판을 둘이 나누면 반쪽, 넷이 나누면 4분의 1쪽이에요" },
    { name: "u6l3", theme: "gas6", orig: null, sk: cutU6l3(), alt: "산꼭대기에서 배낭을 연 아이가 빵빵해진 과자 봉지를 꺼내 들고 놀라는 장면, 산 아래에 작은 마을", cap: "산꼭대기에서 과자 봉지가 빵빵해졌어요" },
    { name: "u6l4", theme: "gas6", orig: null, sk: cutU6l4(), alt: "냉장고에서 꺼낸, 뚜껑을 닫은 빈 페트병이 쭈글쭈글해 아이가 갸웃하고, 햇볕이 드는 따뜻한 방에서는 쌤이 다시 빵빵해진 페트병을 든 장면", cap: "차가운 냉장고 속에선 쭈글, 따뜻한 방에선 다시 빵빵" },
  ];
}
