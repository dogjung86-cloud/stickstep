// 중1 과학 u1l1 도입 만화: 제임스 린드의 괴혈병 실험으로 배우는 탐구 6단계, 8컷.
// 편성 근거와 사실 확인은 qa/sketch/research/u1l1.md.
//   1 배 안에 번진 병 → 2 문제 인식 → 3 가설 설정 → 4 탐구 설계 → 5 탐구 수행 → 6 자료 해석
//   → 7 결론 도출(신 것이라고 다 듣진 않았다: 가설 수정) → 8 그 뒤 이야기
// 인물은 얼굴 없이 그린다. 린드 = 삼각모 + 흰 가발 + 남색 제복, 선원 = 머릿수건과 털모자.
// 색은 여섯 가지 처방(컷 2부터 끝까지 같은 모양과 색으로 되풀이), 배와 바다에 준다. 그림 안에 글자는 없다.
import { Sk, C, curve, dense, circ, poly, rrect, mix, qmark, check, xmark, rays, sparkle, dizzy, arrow } from "../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, R, LIND, SAILOR_A, SAILOR_B } from "../lib/figure.mjs";
import { orange, lemon, cloud, sea, mug, vial, jug, glass, bowl, bedSide, blanket, notebook, quill, sun, moon, paper, openBook } from "../lib/props.mjs";

const W = 960, H = 720;
const SICK = C.skinSick;

// 처방 여섯 가지(사과술, 묽은 산이 든 약, 식초, 바닷물, 오렌지와 레몬, 약 반죽). 원점 = 바닥 가운데
const REMEDY = [
  (sk, x, y, s) => mug(sk, x, y, s),
  (sk, x, y, s) => vial(sk, x, y, s),
  (sk, x, y, s) => jug(sk, x, y, s),
  (sk, x, y, s) => glass(sk, x, y, s),
  (sk, x, y, s) => { orange(sk, x - 26 * s, y - 36 * s, 36 * s, { seed: 901 }); lemon(sk, x + 34 * s, y - 26 * s, 30 * s, { seed: 905, rot: 0.2 }); },
  (sk, x, y, s) => bowl(sk, x, y, s, { spoon: true }),
];

// 옆에서 본 군함(돛, 돛대, 선체, 바다). 960×720 좌표로 그리고, 작게 쓸 때는 sk.at 으로 줄인다.
function ship(sk, o = {}) {
  const DECK = 452;
  const sail = curve([[262, 112], [427, 104], [592, 112], [580, 236], [586, 356], [427, 370], [266, 356], [276, 236]], true, 5);
  sk.fill(sail, C.sail, { seed: 13, tex: true, texAng: 1.3 });
  sk.ink(sail, { w: 10, seed: 14 });
  sk.ink(dense([[240, 108], [614, 108]]), { w: 13, seed: 15 });
  const mast = poly([[414, 46], [440, 46], [442, DECK], [412, DECK]], 5);
  sk.fill(mast, C.woodDark, { seed: 16, tex: true, texAng: 1.5 });
  sk.ink(mast, { w: 10, seed: 17 });
  const flag = poly([[440, 44], [516, 60], [440, 80]], 4);
  sk.fill(flag, C.red, { seed: 18 }); sk.ink(flag, { w: 8, seed: 19, wob: 1 });
  if (o.onDeck) o.onDeck(DECK);
  const hull = [...dense([[24, DECK], [936, DECK]], 5), ...curve([[936, DECK], [916, 536], [846, 618], [480, 632], [112, 618], [50, 548], [24, DECK]], false, 5)];
  sk.fill(hull, C.wood, { seed: 20, tex: true, texAng: 0.03 });
  sk.ink(curve([[42, 506], [480, 516], [922, 504]]), { w: 7, seed: 21, color: C.woodDark });
  sk.ink(curve([[70, 562], [480, 576], [892, 560]]), { w: 7, seed: 22, color: C.woodDark });
  sk.ink(hull, { w: 12, seed: 23 });
  sea(sk, -10, 970, 606, 730, { seed: 25 });
  return DECK;
}

/* ---------- 1. 1747년, 바다 위: 배 안에 번진 병 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  const DECK = ship(sk);
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
  sk.ink(curve([[BX - 60, DECK - 84], [BX, DECK - 78], [BX + 60, DECK - 84]]), { w: 7, seed: 27 });
  sk.ink(curve([[BX - 60, DECK - 32], [BX, DECK - 26], [BX + 60, DECK - 32]]), { w: 7, seed: 28 });
  sk.ink(bshape, { w: 10, seed: 29 });
  const slump = pose({ hip: [0, -232], neck: [-22, -352], head: [-62, -432], tilt: -0.42,
    elL: [-52, -298], haL: [-84, -236], elR: [-30, -292], haR: [-62, -228], knL: [-84, -238], ftL: [-92, -6], knR: [-66, -228], ftR: [-62, 0] });
  drawFigure(sk, BX - 34, DECK, 0.52, slump, { ...SAILOR_B, skin: SICK, handL: SICK, handR: SICK, name: "sailor" });
  // 린드: 공책을 들고 지켜본다
  const watch = pose({ elR: [58, -272], haR: [96, -252], elL: [-56, -262], haL: [-18, -222], tilt: 0.05 });
  const fx = 548, fs = 0.6;
  drawFigure(sk, fx, DECK, fs, watch, { ...LIND, name: "lind", hands: "L" });
  notebook(sk, fx + fs * 112, DECK - fs * 262, 0.62, { rot: 0.14, seed: 31 });
  handDot(sk, [fx + fs * 96, DECK - fs * 252], C.skin, 33, 9.5);
  return sk;
}

/* ---------- 2. 문제 인식: 무엇이 이 병을 낫게 할까? ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  // 탁자와 그 위의 여섯 처방
  const TY = 486;
  sk.ink(dense([[352, TY + 20], [340, 664]]), { w: 12, seed: 41 });
  sk.ink(dense([[896, TY + 20], [908, 664]]), { w: 12, seed: 42 });
  const top = rrect(310, TY, 628, 30, 10);
  sk.fill(top, C.wood, { seed: 43, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 44 });
  const xs = [372, 470, 566, 662, 770, 880];
  xs.forEach((x, i) => {
    REMEDY[i](sk, x, TY - 2, 0.98);
    qmark(sk, x, 300 - (i % 2) * 14, 0.5, { color: C.gray, w: 13, seed: 51 + i });
  });
  // 린드: 턱에 손
  const think = pose({ elR: [54, -292], haR: [24, -350], elL: [-56, -262], haL: [-18, -222], tilt: 0.06 });
  drawFigure(sk, 166, 664, 0.8, think, { ...LIND, name: "lind", face: "curious" });
  return sk;
}

/* ---------- 3. 가설 설정: 신 것이 답일지도? ---------- */
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
      const mat = rrect(-112, -22, 236, 24, 10);
      sk.fill(mat, "#D9CFB4", { dx: 0, dy: 0, wob: 0.6, seed });
      sk.ink(dense([[-26, -52], [44, -48]]), { w: lw, seed: seed + 1, wob: 0.6, color: g });
      sk.ink(dense([[44, -48], [78, -86], [108, -34]], 3), { w: lw, seed: seed + 2, wob: 0.6, color: g });
      sk.ink(dense([[-8, -50], [14, -30]]), { w: lw, seed: seed + 3, wob: 0.4, color: g });
      const h = circ(-66, -62, 42, { over: 0.2, seed: seed + 5 });
      sk.fill(h, SICK, { dx: 2, dy: 2, wob: 0.8, seed: seed + 6 }); sk.ink(h, { w: lw, seed: seed + 7, wob: 0.8, color: g });
    }
  });
}
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  cloud(sk, 664, 250, 500, 392, { seed: 471, tail: [[396, 318, 19, 0], [356, 356, 11, 1]] });
  // 구름 속: 신 것들 → 누운 사람이 일어난다
  lemon(sk, 548, 176, 56, { seed: 37 });
  jug(sk, 668, 232, 1.0, { seed: 561 });
  mug(sk, 786, 226, 0.98, { seed: 521 });
  sparkle(sk, 618, 108, 16, { seed: 43 });
  mini(sk, 566, 378, 0.44, false, 61);
  arrow(sk, [[650, 348], [716, 348]], { w: 9, color: C.green, straight: true, seed: 63, head: 22 });
  mini(sk, 780, 392, 0.38, true, 65);
  // 린드: 옛 항해 기록을 펼쳐 들고, 한 손을 번쩍
  const aha = pose({ elL: [-98, -354], haL: [-150, -450], elR: [60, -272], haR: [104, -246], tilt: 0.07 });
  const fx = 210, fy = 684, fs = 0.86;
  drawFigure(sk, fx, fy, fs, aha, { ...LIND, name: "lind", face: "wide", hands: "L" });
  openBook(sk, fx + fs * 122, fy - fs * 214, 0.62, { color: "#8A5A33", seed: 67, rot: 0.1 });
  handDot(sk, [fx + fs * 104, fy - fs * 246], C.skin, 69, 12);
  rays(sk, fx - fs * 150, fy - fs * 450, 34, 62, 5, { a0: -3.6, a1: -0.9, color: C.gold, w: 7 });
  return sk;
}

/* ---------- 4. 탐구 설계: 하나만 다르게, 나머지는 똑같이 ---------- */
function p4() {
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
    // 모두 똑같은 죽 그릇(무채색) + 쌍마다 다른 처방(색)
    bowl(sk, cx - 50, by - 14, 0.5, { food: "#C9C5BC", seed: 120 });
    REMEDY[i](sk, cx + 42, by - 12, 0.76);
  };
  const cols = [410, 624, 838], rows = [330, 672];
  for (let i = 0; i < 6; i++) station(cols[i % 3], rows[Math.floor(i / 3)], i);
  // 린드: 여섯 쌍을 가리킨다
  const show = pose({ elR: [84, -318], haR: [156, -334], elL: [-54, -262], haL: [-20, -222], tilt: 0.04 });
  drawFigure(sk, 142, 676, 0.66, show, { ...LIND, name: "lind", face: "smile" });
  return sk;
}

/* ---------- 5. 탐구 수행: 날마다 살피고, 본 대로 적기 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  // 날이 지나간다: 해와 달이 번갈아
  const xs = [118, 244, 370, 496, 622, 748];
  xs.forEach((x, i) => (i % 2 ? moon(sk, x, 92, 31, { seed: 721 + i * 3 }) : sun(sk, x, 92, 27, { seed: 701 + i * 11 })));
  for (let i = 0; i < 3; i++) sk.dot(832 + i * 30, 96, 6, C.gray);

  // 침대와 누운 선원
  const BX = 446, BY = 668, BW = 474, BH = 150, TOP = BY - BH;
  bedSide(sk, BX, BY, BW, { h: BH });
  const hx = BX + BW - 74, hy = TOP - 64, hs = 0.62;
  sk.at(hx, hy, hs, () => drawHead(sk, { ...SAILOR_A, skin: SICK, seed: 63, flip: -1 }), 0.16);
  sk.mark("sailor", hx, hy - (R + 14) * hs);
  blanket(sk, BX, BY, BW, { h: BH });
  // 이불 위의 과일 바구니: 엿새 만에 텅 비었다
  const kx = BX + 150, ky = TOP - 60;
  sk.ink(curve([[kx - 50, ky - 34], [kx, ky - 88], [kx + 50, ky - 34]]), { w: 8, seed: 64 });
  const basket = curve([[kx - 62, ky - 36], [kx - 46, ky], [kx + 46, ky], [kx + 62, ky - 36]], false, 3);
  sk.fill([...basket, basket[0]], "#D9A866", { seed: 65, tex: true, texAng: 0.02 });
  sk.ink([...basket, basket[0]], { w: 9, seed: 66 });
  sk.ink(curve([[kx - 54, ky - 20], [kx, ky - 14], [kx + 54, ky - 20]]), { w: 5, color: C.woodDark, seed: 67, wob: 0.4 });
  for (const [dx, i] of [[-24, 0], [22, 1]]) sk.ink(circ(kx + dx, ky - 52, 17, { over: 0, seed: 68 + i }), { w: 5, color: C.gray, dash: [8, 8], wob: 0.3, seed: 70 + i });

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
  notebook(sk, fx + fs * 172, fy - fs * 272, 1.1, { rot: -0.16, seed: 75 });
  quill(sk, fx + fs * 160 + 12, fy - fs * 316 + 10, 0.72, { rot: 0.55, seed: 76 });
  handDot(sk, [fx + fs * 142, fy - fs * 252], C.skin, 77, 11);
  handDot(sk, [fx + fs * 160, fy - fs * 316], C.skin, 78, 11);
  return sk;
}

/* ---------- 6. 자료 해석: 나란히 놓으니 보여요 ---------- */
function p6() {
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
      // 가장 빠르고 뚜렷하게 회복
      arrow(sk, [[split + 318, by - 8], [split + 372, by - 58]], { w: 10, color: C.green, straight: true, seed: 261, head: 24 });
      sparkle(sk, split + 414, by - 60, 15, { seed: 263 });
    } else if (i === 0) {
      // 사과술 쌍은 조금 나아졌다(완만한 오름)
      arrow(sk, [[split + 320, by - 22], [split + 386, by - 38]], { w: 8, color: "#8FBF6A", straight: true, seed: 265, head: 18 });
    } else {
      sk.ink(dense([[split + 322, by - 30], [split + 386, by - 30]]), { w: 9, color: C.gray, seed: 270 + i, wob: 0.8 });
    }
  }
  // 린드: 지시봉으로 귤 줄을 짚는다
  const P = pose({ elR: [60, -300], haR: [118, -326], elL: [-54, -262], haL: [-20, -222], tilt: 0.04 });
  const fx = 134, fy = 676, fs = 0.66;
  drawFigure(sk, fx, fy, fs, P, { ...LIND, name: "lind", face: "smile", hands: "L" });
  const hr = [fx + fs * 118, fy - fs * 326];
  sk.ink(dense([[hr[0] - 10, hr[1] + 4], [PX + 22, hy + rh * 0.56]]), { w: 9, seed: 281, wob: 1 });
  handDot(sk, hr, C.skin, 283, 10.5);
  return sk;
}

/* ---------- 7. 결론 도출: 신 것이라고 다 듣진 않았어요 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  // 린드: 한 손에 오렌지, 한 손에 레몬
  const up = pose({ elL: [-110, -330], haL: [-196, -372], elR: [110, -330], haR: [196, -372], tilt: 0.03 });
  const fx = 300, fy = 684, fs = 0.82;
  drawFigure(sk, fx, fy, fs, up, { ...LIND, name: "lind", face: "happy", hands: false });
  const hl = [fx - fs * 196, fy - fs * 372], hr = [fx + fs * 196, fy - fs * 372];
  orange(sk, hl[0] - 4, hl[1] - 48, 46, { seed: 51 });
  lemon(sk, hr[0] + 8, hr[1] - 44, 42, { seed: 55, rot: -0.2 });
  handDot(sk, hl, C.skin, 301, 13); handDot(sk, hr, C.skin, 303, 13);
  sparkle(sk, hl[0] - 62, hl[1] - 96, 15, { seed: 305 });
  sparkle(sk, hr[0] + 70, hr[1] - 92, 13, { seed: 307 });
  // 식초 단지: 신맛이 나지만 듣지 않았다
  const k = sk.lwK; sk.lwK = 0.62; // 크게 키운 소품은 선이 두꺼워지지 않게
  jug(sk, 752, 684, 2.1, { seed: 561 });
  sk.lwK = k;
  xmark(sk, 752, 420, 1.2, { w: 12, seed: 309 });
  return sk;
}

/* ---------- 8. 그 뒤 이야기: 결론은 다음 탐구의 출발점 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  const FY = 652, FS = 0.72;
  // ① 책으로 펴내다
  const hold = pose({ elL: [-56, -272], haL: [-34, -236], elR: [56, -272], haR: [34, -236] });
  drawFigure(sk, 132, FY, FS, hold, { ...LIND, name: "lind", face: "smile", hands: false });
  const bk = rrect(84, 420, 96, 124, 8);
  sk.fill(bk, "#9A4A3A", { seed: 311, tex: true }); sk.ink(bk, { w: 10, seed: 312 });
  sk.ink(dense([[100, 444], [164, 444]]), { w: 5, color: C.gold, seed: 313, wob: 0.4 });
  sk.ink(dense([[100, 520], [164, 520]]), { w: 5, color: C.gold, seed: 314, wob: 0.4 });
  handDot(sk, [86, 484], C.skin, 315, 11); handDot(sk, [178, 484], C.skin, 317, 11);
  arrow(sk, [[250, 440], [292, 440]], { w: 10, color: C.gray, straight: true, seed: 319, head: 22 });
  // ② 배마다 레몬즙을 싣다
  sk.at(304, 262, 0.37, () => ship(sk, {
    onDeck: DECK => {
      for (const [x, i] of [[640, 0], [790, 1]]) {
        lemon(sk, x - 24, DECK - 112, 30, { seed: 321 + i * 4, rot: 0.1 }); lemon(sk, x + 22, DECK - 116, 30, { seed: 323 + i * 4, rot: -0.3 });
        const c = poly([[x - 62, DECK - 96], [x + 62, DECK - 96], [x + 56, DECK], [x - 56, DECK]], 4);
        sk.fill(c, C.woodLight, { seed: 331 + i, tex: true, texAng: 0.04 }); sk.ink(c, { w: 12, seed: 333 + i });
      }
    },
  }));
  arrow(sk, [[668, 440], [706, 440]], { w: 10, color: C.gray, straight: true, seed: 335, head: 22 });
  // ③ 훗날의 과학자: 레몬 속 알갱이를 들여다본다
  sk.ink(dense([[742, 586], [742, FY]]), { w: 11, seed: 337 });
  const tb = rrect(708, 566, 68, 20, 8);
  sk.fill(tb, C.wood, { seed: 338, tex: true, texAng: 0.02 }); sk.ink(tb, { w: 9, seed: 339 });
  lemon(sk, 742, 546, 26, { seed: 351, rot: 0.1 });
  const look = pose({ elR: [-66, -272], haR: [-104, -214], elL: [56, -258], haL: [64, -188], tilt: -0.12 });
  drawFigure(sk, 846, FY, FS, look, { hair: "bob", hairColor: "#3F322C", glasses: true, coat: { color: C.white }, seed: 91, hands: "L" });
  const hx = 846 - FS * 104, hy = FY - FS * 214;
  const mx = hx - 26, my = hy - 2;
  sk.ink(dense([[mx + 18, my + 2], [hx - 2, hy]]), { w: 9, seed: 341 });
  const lens = circ(mx, my, 27, { over: 0.2, seed: 343 });
  sk.fill(lens, "#DDF1FB", { dx: 0, dy: 0, wob: 0.4, seed: 344, alpha: 0.85 }); sk.ink(lens, { w: 8, seed: 345 });
  handDot(sk, [hx, hy], C.skin, 347, 11);
  sparkle(sk, mx, my - 2, 13, { seed: 349, color: C.lemon, w: 4 });
  return sk;
}

// 컷별 말풍선(앱이 얹는다). who = 인물에 준 기준점 이름. 자리는 build.mjs 가 머리 좌표에서 계산한다.
const BUBBLES = [
  [{ who: "sailor", text: "다리에 힘이<br>없어요", dx: -8 }],
  [{ who: "lind", text: "무엇이 진짜<br>들을까?" }],
  null,
  [{ who: "lind", text: "다른 건<br>처방뿐!" }],
  [{ who: "sailor", text: "과일이 다<br>떨어졌어요" }],
  [{ who: "lind", text: "이 줄만<br>확 달라!" }],
  [{ who: "lind", text: "신맛 때문은<br>아니었어!" }],
  null,
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7, p8].map((fn, i) => { const sk = fn(); return { sk, bubbles: BUBBLES[i] }; });
}
