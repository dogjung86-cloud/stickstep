// 중1 과학 u1l1 도입 만화: 제임스 린드의 괴혈병 실험 (탐구 6단계), 7컷.
// 인물은 얼굴 없이 그린다. 쌤 = 안경 + 흰 가운, 린드 = 삼각모 + 남색 제복, 선원 = 머릿수건과 털모자.
// 색은 이야기의 열쇠(귤과 레몬, 여섯 가지 처방)와 배, 바다에 준다.
// 그림 안에 글자는 없다. 말풍선은 앱이 얹고, 자리는 여기서 기록한 머리 기준점으로 계산한다.
import { Sk, C, curve, dense, circ, poly, rrect, mix, qmark, check, rays, sparkle, drop, dizzy, arrow } from "../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, TEACHER, LIND, SAILOR_A, SAILOR_B } from "../lib/figure.mjs";
import { orange, lemon, citrusHalf, cloud, board, sea, mug, vial, jug, glass, bowl, bedSide, blanket, notebook, quill, sun, moon, paper, crate } from "../lib/props.mjs";

const W = 960, H = 720;
const SICK = C.skinSick;
const CHALK = "#F3F0E6";

// 처방 여섯 가지(사과술, 묽은 산, 식초, 바닷물, 귤과 레몬, 약 반죽). 원점 = 바닥 가운데
const REMEDY = [
  (sk, x, y, s) => mug(sk, x, y, s),
  (sk, x, y, s) => vial(sk, x, y, s),
  (sk, x, y, s) => jug(sk, x, y, s),
  (sk, x, y, s) => glass(sk, x, y, s),
  (sk, x, y, s) => { orange(sk, x - 26 * s, y - 36 * s, 36 * s, { seed: 901 }); lemon(sk, x + 34 * s, y - 26 * s, 30 * s, { seed: 905, rot: 0.2 }); },
  (sk, x, y, s) => bowl(sk, x, y, s, { spoon: true }),
];

/* ---------- 0. 인트로: 스틱맨 쌤 등장 ---------- */
function p0() {
  const sk = new Sk(W, H, { id: "a" });
  board(sk, 438, 78, 462, 340, { legs: 236 });
  // 칠판 낙서: 배 → 물음표 → 귤 (오늘 이야기의 예고)
  sk.ink(curve([[486, 286], [500, 318], [540, 328], [590, 322], [606, 288]]), { w: 8, color: CHALK, seed: 3, wob: 1 });
  sk.ink(dense([[484, 286], [608, 286]]), { w: 8, color: CHALK, seed: 4, wob: 1 });
  sk.ink(dense([[546, 284], [546, 176]]), { w: 8, color: CHALK, seed: 5, wob: 1 });
  sk.ink(curve([[552, 182], [598, 214], [554, 258]]), { w: 8, color: CHALK, seed: 6, wob: 1 });
  sk.ink(curve([[474, 346], [496, 338], [518, 346], [540, 338], [562, 346], [584, 338], [606, 346]]), { w: 6, color: "#BFE2F4", seed: 7, wob: 0.6 });
  qmark(sk, 678, 262, 1.25, { color: C.lemon, w: 12 });
  orange(sk, 800, 268, 52, { seed: 31 });
  sparkle(sk, 868, 356, 16, { seed: 33 });
  // 쌤: 왼손 흔들고 오른손은 지시봉
  const P = pose({ elL: [-96, -338], haL: [-150, -424], elR: [62, -290], haR: [118, -316], tilt: -0.04 });
  const fx = 230, fy = 664, fs = 0.8;
  drawFigure(sk, fx, fy, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
  const hr = [fx + fs * 118, fy - fs * 316];
  sk.ink(dense([[hr[0] - 12, hr[1] + 6], [468, 318]]), { w: 9, seed: 9, wob: 1 });
  handDot(sk, hr, C.skin, 93, 12.5);
  // 손 흔드는 선
  sk.ink(curve([[66, 300], [52, 318], [56, 340]]), { w: 6, seed: 11, wob: 0.4, color: C.gray });
  sk.ink(curve([[146, 278], [160, 294], [160, 314]]), { w: 6, seed: 12, wob: 0.4, color: C.gray });
  return sk;
}

/* ---------- 1. 문제 인식: 왜 선원들이 쓰러질까? ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "b" });
  const DECK = 452;
  // 돛과 돛대 (뒤)
  const sail = curve([[262, 112], [427, 104], [592, 112], [580, 236], [586, 356], [427, 370], [266, 356], [276, 236]], true, 5);
  sk.fill(sail, C.sail, { seed: 13, tex: true, texAng: 1.3 });
  sk.ink(sail, { w: 10, seed: 14 });
  sk.ink(dense([[240, 108], [614, 108]]), { w: 13, seed: 15, color: C.ink });
  const mast = poly([[414, 46], [440, 46], [442, DECK], [412, DECK]], 5);
  sk.fill(mast, C.woodDark, { seed: 16, tex: true, texAng: 1.5 });
  sk.ink(mast, { w: 10, seed: 17 });
  const flag = poly([[440, 44], [516, 60], [440, 80]], 4);
  sk.fill(flag, C.red, { seed: 18 }); sk.ink(flag, { w: 8, seed: 19, wob: 1 });
  // 선체
  const hull = [...dense([[24, DECK], [936, DECK]], 5), ...curve([[936, DECK], [916, 536], [846, 618], [480, 632], [112, 618], [50, 548], [24, DECK]], false, 5)];
  sk.fill(hull, C.wood, { seed: 20, tex: true, texAng: 0.03 });
  sk.ink(curve([[42, 506], [480, 516], [922, 504]]), { w: 7, seed: 21, color: C.woodDark });
  sk.ink(curve([[70, 562], [480, 576], [892, 560]]), { w: 7, seed: 22, color: C.woodDark });
  sk.ink(hull, { w: 12, seed: 23 });
  sea(sk, -10, 970, 606, 730, { seed: 25 });

  // 갑판에 쓰러져 누운 선원 (왼쪽, 머리가 왼쪽)
  sk.at(318, DECK - 52, 1, () => {
    const lie = pose({ hip: [-40, -212], neck: [-14, -342], head: [0, -436], tilt: -0.1,
      elL: [-70, -290], haL: [-98, -226], elR: [10, -272], haR: [-22, -232], knL: [-76, -108], ftL: [-96, 0], knR: [-30, -120], ftR: [-92, -30] });
    drawFigure(sk, 0, 0, 0.52, lie, { ...SAILOR_A, skin: SICK, handL: SICK, handR: SICK, seed: 83 });
  }, -Math.PI / 2);
  dizzy(sk, 84, 318, 1, { n: 2 });

  // 통에 걸터앉아 축 늘어진 선원 (오른쪽)
  const BX = 822;
  const barrel = curve([[BX - 52, DECK - 118], [BX - 64, DECK - 60], [BX - 54, DECK], [BX + 54, DECK], [BX + 64, DECK - 60], [BX + 52, DECK - 118]], false, 4);
  const bshape = [...barrel, barrel[0]];
  sk.fill(bshape, C.wood, { seed: 26, tex: true, texAng: 1.5 });
  sk.ink(curve([[BX - 60, DECK - 84], [BX, DECK - 78], [BX + 60, DECK - 84]]), { w: 7, seed: 27, color: C.ink });
  sk.ink(curve([[BX - 60, DECK - 32], [BX, DECK - 26], [BX + 60, DECK - 32]]), { w: 7, seed: 28, color: C.ink });
  sk.ink(bshape, { w: 10, seed: 29 });
  const slump = pose({ hip: [0, -232], neck: [-22, -352], head: [-62, -432], tilt: -0.42,
    elL: [-52, -298], haL: [-84, -236], elR: [-30, -292], haR: [-62, -228], knL: [-84, -238], ftL: [-92, -6], knR: [-66, -228], ftR: [-62, 0] });
  drawFigure(sk, BX - 34, DECK, 0.52, slump, { ...SAILOR_B, skin: SICK, handL: SICK, handR: SICK });
  drop(sk, 826, 168, 0.95, { rot: 0.25 });

  // 린드: 턱에 손, 머리 위 물음표
  const think = pose({ elR: [54, -292], haR: [24, -350], elL: [-56, -262], haL: [-18, -222], tilt: 0.06 });
  drawFigure(sk, 548, DECK, 0.6, think, { ...LIND, name: "lind" });
  qmark(sk, 676, 112, 1.05, { color: C.teal });
  return sk;
}

/* ---------- 2. 가설 설정: 혹시 신 과일이? ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "c" });
  cloud(sk, 672, 236, 470, 336, { seed: 471, tail: [[412, 300, 19, 0], [372, 338, 11, 1]] });
  orange(sk, 584, 226, 76, { seed: 33 });
  lemon(sk, 764, 196, 62, { seed: 37 });
  citrusHalf(sk, 722, 316, 50, { seed: 41, color: C.lemon });
  sparkle(sk, 664, 118, 20, { seed: 43 });
  sparkle(sk, 836, 290, 15, { seed: 45 });
  // 린드: 번뜩 떠올라 한 손을 든다
  const aha = pose({ elL: [-98, -354], haL: [-150, -450], elR: [56, -264], haR: [20, -222], tilt: 0.07 });
  drawFigure(sk, 216, 680, 0.88, aha, { ...LIND, name: "lind" });
  rays(sk, 216 - 0.88 * 150, 680 - 0.88 * 450, 34, 62, 5, { a0: -3.6, a1: -0.9, color: C.gold, w: 7 });
  return sk;
}

/* ---------- 3. 탐구 설계: 딱 하나만 다르게, 공정하게 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "d" });
  const BL = "#E6E1D5";
  const station = (cx, by, i) => {
    const pil = rrect(cx - 96, by - 164, 192, 56, 20);
    sk.fill(pil, C.white, { seed: 50 + i, dx: 1, dy: 1.2 }); sk.ink(pil, { w: 8, seed: 60 + i, wob: 1.2 });
    for (const [sg, j] of [[-1, 0], [1, 1]]) {
      const who = (i + j) % 2 ? SAILOR_B : SAILOR_A;
      sk.at(cx + sg * 46, by - 178, 0.36, () => drawHead(sk, { ...who, skin: SICK, seed: 100 + i * 7 + j * 3, tex: false }));
    }
    const b = rrect(cx - 100, by - 128, 200, 128, 18);
    sk.fill(b, BL, { seed: 70 + i, tex: true }); sk.ink(b, { w: 9, seed: 80 + i, wob: 1.4 });
    sk.ink(curve([[cx - 96, by - 98], [cx, by - 104], [cx + 96, by - 98]]), { w: 6, seed: 90 + i, color: mix(BL, "#000000", 0.2), wob: 0.8 });
    REMEDY[i](sk, cx, by - 14, 0.84);
  };
  const cols = [410, 624, 838], rows = [330, 672];
  for (let i = 0; i < 6; i++) station(cols[i % 3], rows[Math.floor(i / 3)], i);
  // 린드: 여섯 쌍을 가리킨다
  const show = pose({ elR: [84, -318], haR: [156, -334], elL: [-54, -262], haL: [-20, -222], tilt: 0.04 });
  drawFigure(sk, 142, 676, 0.66, show, { ...LIND, name: "lind" });
  return sk;
}

/* ---------- 4. 탐구 수행: 매일 관찰하고 정직하게 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "e" });
  // 날이 지나간다: 해와 달이 번갈아
  const xs = [118, 244, 370, 496, 622, 748];
  xs.forEach((x, i) => (i % 2 ? moon(sk, x, 92, 31, { seed: 721 + i * 3 }) : sun(sk, x, 92, 27, { seed: 701 + i * 11 })));
  for (let i = 0; i < 3; i++) sk.dot(832 + i * 30, 96, 6, C.gray);

  // 침대와 누운 선원
  const BX = 446, BY = 668, BW = 474, BH = 150, TOP = BY - BH;
  bedSide(sk, BX, BY, BW, { h: BH });
  sk.at(BX + BW - 74, TOP - 64, 0.62, () => drawHead(sk, { ...SAILOR_A, skin: SICK, seed: 63, flip: -1 }), 0.16);
  blanket(sk, BX, BY, BW, { h: BH });
  // 이불 위 그릇: 날마다 먹는 귤
  bowl(sk, BX + 150, TOP - 58, 0.7, { food: C.orange, seed: 65 });

  // 걸상에 앉아 적는 린드
  const fs = 0.76, fx = 206, fy = BY;
  const seatY = fy - fs * 206;
  sk.ink(dense([[fx - 46, seatY + 20], [fx - 58, BY]]), { w: 11, seed: 71 });
  sk.ink(dense([[fx + 50, seatY + 20], [fx + 62, BY]]), { w: 11, seed: 72 });
  const seat = rrect(fx - 62, seatY, 124, 24, 10);
  sk.fill(seat, C.wood, { seed: 73, tex: true, texAng: 0.02 }); sk.ink(seat, { w: 10, seed: 74 });
  const sitW = pose({ hip: [0, -212], neck: [10, -338], head: [20, -432], tilt: 0.1,
    elL: [60, -258], haL: [142, -252], elR: [80, -312], haR: [160, -316], knL: [96, -222], ftL: [102, 0], knR: [114, -210], ftR: [132, -2] });
  drawFigure(sk, fx, fy, fs, sitW, { ...LIND, name: "lind", hands: false, coat: { ...LIND.coat, len: 26 } });
  notebook(sk, fx + fs * 172, fy - fs * 272, 1.1, { rot: -0.16, check: true, seed: 75 });
  quill(sk, fx + fs * 160 + 12, fy - fs * 316 + 10, 0.72, { rot: 0.55, seed: 76 });
  handDot(sk, [fx + fs * 142, fy - fs * 252], C.skin, 77, 11);
  handDot(sk, [fx + fs * 160, fy - fs * 316], C.skin, 78, 11);
  return sk;
}

/* ---------- 5. 자료 해석: 표로 정리해 규칙 찾기 ---------- */
function mini(sk, x, y, s, ok, seed) {
  // 작은 사람 그림. ok 면 두 팔을 든 건강한 모습, 아니면 자리에 누운 모습
  sk.at(x, y, s, () => {
    const lw = 15;
    if (ok) {
      sk.ink(dense([[0, -150], [0, -64]]), { w: lw, seed, wob: 0.6 });
      sk.ink(dense([[0, -64], [-30, 0]]), { w: lw, seed: seed + 1, wob: 0.6 });
      sk.ink(dense([[0, -64], [30, 0]]), { w: lw, seed: seed + 2, wob: 0.6 });
      sk.ink(curve([[0, -138], [-40, -160], [-62, -212]]), { w: lw, seed: seed + 3, wob: 0.6 });
      sk.ink(curve([[0, -138], [40, -160], [62, -212]]), { w: lw, seed: seed + 4, wob: 0.6 });
      const h = circ(0, -196, 44, { over: 0.2, seed: seed + 5 });
      sk.fill(h, C.skin, { dx: 2, dy: 2, wob: 0.8, seed: seed + 6 }); sk.ink(h, { w: lw, seed: seed + 7, wob: 0.8 });
    } else {
      const g = "#6F6F73";
      // 자리(요)
      const mat = rrect(-112, -22, 236, 24, 10);
      sk.fill(mat, "#D9CFB4", { dx: 0, dy: 0, wob: 0.6, seed });
      // 몸, 세운 무릎, 늘어진 팔
      sk.ink(dense([[-26, -52], [44, -48]]), { w: lw, seed: seed + 1, wob: 0.6, color: g });
      sk.ink(dense([[44, -48], [78, -86], [108, -34]], 3), { w: lw, seed: seed + 2, wob: 0.6, color: g });
      sk.ink(dense([[-8, -50], [14, -30]]), { w: lw, seed: seed + 3, wob: 0.4, color: g });
      const h = circ(-66, -62, 42, { over: 0.2, seed: seed + 5 });
      sk.fill(h, SICK, { dx: 2, dy: 2, wob: 0.8, seed: seed + 6 }); sk.ink(h, { w: lw, seed: seed + 7, wob: 0.8, color: g });
    }
  });
}
function p5() {
  const sk = new Sk(W, H, { id: "f" });
  const PX = 318, PY = 44, PW = 600, PH = 632;
  paper(sk, PX, PY, PW, PH);
  const top = PY + 30, rh = (PH - 60) / 6, split = PX + 132;
  // 귤 줄 강조(형광펜)
  const hy = top + rh * 4;
  sk.fill(rrect(PX + 14, hy + 6, PW - 28, rh - 12, 16), C.lemon, { seed: 201, dx: 0, dy: 0, alpha: 0.78, tex: true, texAng: 0.02, wob: 3 });
  for (let i = 1; i < 6; i++) sk.ink(dense([[PX + 16, top + rh * i], [PX + PW - 16, top + rh * i]]), { w: 5, seed: 210 + i, color: "#B9A57A", wob: 1.4 });
  sk.ink(dense([[split, top + 4], [split, top + rh * 6 - 4]]), { w: 5, seed: 217, color: "#B9A57A", wob: 1.4 });
  for (let i = 0; i < 6; i++) {
    const by = top + rh * (i + 1) - 12, ok = i === 4;
    REMEDY[i](sk, PX + 70, by, 0.66);
    mini(sk, split + 96, by + (ok ? 2 : -2), ok ? 0.3 : 0.4, ok, 230 + i * 20);
    mini(sk, split + 222, by + (ok ? 2 : -2), ok ? 0.3 : 0.4, ok, 240 + i * 20);
    if (ok) {
      arrow(sk, [[split + 318, by - 8], [split + 372, by - 58]], { w: 10, color: C.green, straight: true, seed: 261, head: 24 });
      sparkle(sk, split + 414, by - 60, 15, { seed: 263 });
    } else {
      sk.ink(dense([[split + 322, by - 30], [split + 386, by - 30]]), { w: 9, color: C.gray, seed: 270 + i, wob: 0.8 });
    }
  }
  // 린드: 지시봉으로 귤 줄을 짚는다
  const P = pose({ elR: [60, -300], haR: [118, -326], elL: [-54, -262], haL: [-20, -222], tilt: 0.04 });
  const fx = 134, fy = 676, fs = 0.66;
  drawFigure(sk, fx, fy, fs, P, { ...LIND, name: "lind", hands: "L" });
  const hr = [fx + fs * 118, fy - fs * 326];
  sk.ink(dense([[hr[0] - 10, hr[1] + 4], [PX + 22, hy + rh * 0.56]]), { w: 9, seed: 281, wob: 1 });
  handDot(sk, hr, C.skin, 283, 10.5);
  return sk;
}

/* ---------- 6. 결론 도출: 가설이 맞았어요 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "g" });
  crate(sk, 520, 684, 0.8, { seed: 761 });
  check(sk, 560, 226, 2.4, { w: 9 });
  // 린드: 귤을 번쩍 든다
  const up = pose({ elR: [118, -378], haR: [198, -492], elL: [-58, -264], haL: [-22, -222], tilt: -0.05 });
  const fx = 214, fy = 680, fs = 0.84;
  drawFigure(sk, fx, fy, fs, up, { ...LIND, name: "lind", hands: "L" });
  const hr = [fx + fs * 198, fy - fs * 492];
  orange(sk, hr[0] + 14, hr[1] - 44, 48, { seed: 51 });
  handDot(sk, hr, C.skin, 301, 13);
  rays(sk, hr[0] + 14, hr[1] - 44, 68, 96, 6, { a0: -3.3, a1: -0.2, color: C.gold, w: 8 });
  // 다 나은 선원: 두 팔 번쩍, 폴짝
  const joy = pose({ elL: [-108, -364], haL: [-164, -462], elR: [108, -364], haR: [164, -462], knL: [-30, -112], ftL: [-70, -10], knR: [30, -112], ftR: [70, -10], tilt: 0.06 });
  drawFigure(sk, 776, 660, 0.7, joy, { ...SAILOR_A, name: "sailor" });
  sk.ink(curve([[708, 690], [724, 698], [744, 696]]), { w: 6, seed: 311, color: C.gray, wob: 0.4 });
  sk.ink(curve([[808, 696], [828, 698], [844, 690]]), { w: 6, seed: 312, color: C.gray, wob: 0.4 });
  sparkle(sk, 636, 388, 16, { seed: 313 });
  sparkle(sk, 914, 420, 13, { seed: 315 });
  return sk;
}

// 컷별 말풍선(앱이 얹는다). who = 기준점 이름. 지금 u1l1 본문에는 말풍선이 없어서,
// 머리 기준점으로 자리를 계산하는 방식을 보이려고 두 컷에만 넣었다.
const BUBBLES = [null, null, null, [{ who: "lind", text: "처방 하나만<br>다르게!" }], null, null, [{ who: "sailor", text: "다시 힘이 나요!" }]];

export const W_PANEL = W, H_PANEL = H;
export function panels() {
  return [p0, p1, p2, p3, p4, p5, p6].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
