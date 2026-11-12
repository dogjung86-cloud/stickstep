// 중2 과학 g2u6l3 만화 v2(배선 전 미리보기): 피는 돈다, 하비의 셈과 팔 묶기. 8컷.
// 조사와 콘티: qa/sketch/research/g2u6l3.md
//   1 옛 생각(간에서 만들어져 몸 끝에서 사라진다) → 2 파도바의 스승 파브리키우스와 정맥 판막 그림 → 3 하비의 셈(반 시간, 몸 전체의 피)
//   → 4 팔을 세게 묶기(동맥이 막힘) → 5 조금 풀기(정맥만 막힘) → 6 정맥 판막 손가락 실험 → 7 결론(순환) → 8 1661년 말피기(모세혈관)
// 8컷의 확대 그림은 허파의 혈관이라 빨강과 파랑을 쓰지 않는다(허파로 들어가는 관에는 산소가 적은 피가 흐른다). 한 가지 중립색 + 화살표.
// 색의 뜻: 심장에서 나가는 길(동맥)은 빨강, 심장으로 돌아오는 길(정맥)은 파랑. 옛 생각의 화살표는 갈색(빨강과 파랑을 쓰지 않는다).
// 팔 그림은 모두 손이 왼쪽, 심장이 오른쪽(작은 하트 기호)이다. 유혈, 해부, 심장 판막은 그리지 않는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, xmark, check, sparkle, arrow, heart } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT, R } from "../lib/figure.mjs";
import { board, microscope } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
const RED = C.red, BLUE = C.blue, OLD = "#B5651D", SKIN = "#F8DCC6", GLASS = "#F6FBFD";
const BLACK = "#33333A", SEAM = "#6F6F7A", NEUT = "#8E4A40";

/* ---------- 인물 ---------- */
// 하비(1628년에 50세): 짧은 검은 머리, 콧수염과 짧은 뾰족 턱수염, 검은 웃옷에 흰 깃. 키가 작아 축척을 조금 낮춘다.
const HARVEY = { hair: "short", hairColor: "#2B2B2E", fringe: 24, coat: { color: BLACK, seam: SEAM, buttons: C.gold }, seed: 311, mini: true, face: "calm", collar: true, stache: "#2B2B2E", goatee: "#2B2B2E" };
// 파도바 시절의 하비(22세 무렵): 뒤 컷의 하비와 같은 검은 웃옷과 흰 깃, 수염만 없다
const HARVEY_YOUNG = { hair: "short", hairColor: "#2B2B2E", fringe: 24, coat: { color: BLACK, seam: SEAM, buttons: C.gold }, seed: 311, mini: true, face: "calm", collar: true };
// 파브리키우스: 그 시대 노학자의 차림(흰 수염, 둥근 검은 모자, 긴 검은 가운). 초상의 특징을 지어내지 않는다.
const FABRICIUS = { hair: "bald", beard: "#F4F1EA", coat: { color: BLACK, seam: SEAM, len: 112 }, seed: 331, mini: true, face: "calm", cap: BLACK };
// 말피기(1661년에 33세): 어깨까지 오는 검은 머리, 콧수염, 검은 옷에 흰 깃
const MALPIGHI = { hair: "curls", hairColor: "#2B2B2E", coat: { color: BLACK, seam: SEAM }, seed: 351, mini: true, face: "calm", collar: true, stache: "#2B2B2E" };

// 인물 + 덧그림(깃, 콧수염, 턱수염, 둥근 모자). 덧그림은 머리의 기울기를 따라간다.
function person(sk, x, y, s, P, cfg, o = {}) {
  const c = { ...cfg, ...o }, sd = c.seed ?? 11;
  drawFigure(sk, x, y, s, P, c);
  sk.save(); sk.translate(x, y); sk.scale(s);
  if (c.collar) {
    const [nx, ny] = P.neck;
    const col = poly([[nx - 30, ny + 6], [nx + 30, ny + 6], [nx + 52, ny + 30], [nx + 8, ny + 24], [nx, ny + 38], [nx - 8, ny + 24], [nx - 52, ny + 30]], 3);
    sk.fill(col, C.white, { dx: 0, dy: 0, wob: 0.4, seed: sd + 500 }); sk.ink(col, { w: 7, wob: 0.5, seed: sd + 501 });
  }
  sk.translate(P.head[0], P.head[1]); sk.rotate(P.tilt ?? 0);
  if (c.cap) {
    const dome = ell(0, 0, R + 9, R + 9, Math.PI + 0.22, Math.PI * 2 - 0.22);
    const e = dome[dome.length - 1];
    const cap = [...dome, ...curve([e, [52, -56], [0, -64], [-52, -56], dome[0]], false, 4)];
    sk.fill(cap, c.cap, { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 510 }); sk.ink(cap, { w: 10, wob: 0.9, seed: sd + 511 });
  }
  if (c.stache) {
    const m = curve([[-32, 46], [-15, 39], [0, 45], [15, 39], [32, 46], [36, 58], [17, 67], [0, 60], [-17, 67], [-36, 58]], true, 3);
    sk.fill(m, c.stache, { dx: 0, dy: 0, wob: 0.4, seed: sd + 520 }); sk.ink(m, { w: 5, wob: 0.4, seed: sd + 521 });
  }
  if (c.goatee) {
    const g = curve([[-24, 76], [0, 72], [24, 76], [18, 106], [0, 132], [-18, 106]], true, 3);
    sk.fill(g, c.goatee, { dx: 0, dy: 0, wob: 0.4, seed: sd + 530 }); sk.ink(g, { w: 6, wob: 0.5, seed: sd + 531 });
  }
  sk.restore();
}

/* ---------- 소품 ---------- */
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });
function table(sk, x0, x1, y, sd, bottom = 704) {
  thin(sk, 0.85, () => {
    for (const lx of [x0 + 24, x1 - 24]) sk.ink(dense([[lx, y + 20], [lx, bottom]]), { w: 11, color: "#6B4A32", seed: sd + lx, wob: 0.3 });
    const top = rrect(x0, y, x1 - x0, 24, 8); sk.fill(top, C.wood, { seed: sd, tex: true, texAng: 0.02 }); sk.ink(top, { w: 10, seed: sd + 1 });
  });
}
// 사람 모양 기호(얼굴도 옷도 없는 윤곽). (x, y) = 발 사이, h = 키
function bodyIcon(sk, x, y, h, o = {}) {
  const sd = o.seed ?? 601, col = o.fill ?? "#F3F1EC", line = o.line ?? "#7B7F87";
  const U = ([u, v]) => [x + u * h, y + v * h];
  const body = poly([[-0.05, -0.75], [-0.2, -0.73], [-0.37, -0.44], [-0.29, -0.4], [-0.15, -0.6], [-0.13, -0.4], [-0.2, 0], [-0.06, 0], [0, -0.32], [0.06, 0], [0.2, 0], [0.13, -0.4], [0.15, -0.6], [0.29, -0.4], [0.37, -0.44], [0.2, -0.73], [0.05, -0.75]].map(U), 4);
  const head = circ(x, y - 0.87 * h, 0.115 * h, { over: 0.1, seed: sd });
  thin(sk, 1, () => {
    sk.fill(body, col, { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 }); sk.fill(head, col, { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 });
    sk.ink(body, { w: o.w ?? 6, color: line, seed: sd + 3, wob: 0.6 }); sk.ink(head, { w: o.w ?? 6, color: line, seed: sd + 4, wob: 0.5 });
  });
}
// 유리 그릇에 담긴 피(빨강): 옆에서 본 모습. level = 액면 높이(y)
function jar(sk, x0, x1, y0, y1, level, sd, k = 0.9) {
  const r = Math.min(14, (x1 - x0) / 4);
  thin(sk, k, () => {
    sk.fill(poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], 4), GLASS, { dx: 0, dy: 0, wob: 0.3, seed: sd });
    sk.fill(poly([[x0 + 5, level], [x1 - 5, level], [x1 - 5, y1 - 4], [x0 + 5, y1 - 4]], 4), RED, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
    sk.ink(dense([[x0, y0], [x0, y1 - r], [x0 + r, y1], [x1 - r, y1], [x1, y1 - r], [x1, y0]], 4), { w: Math.max(5, Math.min(9, (x1 - x0) / 9)), seed: sd + 2, wob: 0.5 });
  });
}
// 팔(도해): 손이 왼쪽, 어깨 쪽이 오른쪽. x0 = 손끝, xw = 손목, xe = 팔꿈치, x1 = 오른쪽 끝, tw/te/tu = 손목, 팔꿈치, 위팔의 반 두께
function armShape(sk, o) {
  const { x0, xw, xe, x1, yc, tw, te, tu } = o, sd = o.sd ?? 701, hand = o.hand ?? SKIN, skin = o.skin ?? SKIN;
  const hl = xw - x0; // 손 길이
  const pts = curve([
    [x1, yc - tu], [(x1 + xe) / 2, yc - tu - 2], [xe, yc - te], [(xe + xw) / 2, yc - (te + tw) / 2 - 3], [xw, yc - tw],
    [xw - hl * 0.18, yc - tw - 6], [xw - hl * 0.34, yc - tw - 26], [xw - hl * 0.62, yc - tw - 22], [xw - hl * 0.56, yc - tw - 2],
    [x0 + hl * 0.2, yc - tw * 0.8], [x0, yc], [x0 + hl * 0.2, yc + tw * 0.86], [xw, yc + tw],
    [(xe + xw) / 2, yc + (te + tw) / 2 + 5], [xe, yc + te + 4], [(x1 + xe) / 2, yc + tu + 2], [x1, yc + tu],
  ], false, 4);
  const shape = [...pts, pts[0]];
  thin(sk, o.k ?? 0.85, () => {
    sk.fill(shape, skin, { dx: 0, dy: 0, wob: 0.6, seed: sd });
    if (hand !== skin) {
      const hp = curve([[xw + 6, yc - tw + 2], [xw - hl * 0.18, yc - tw - 4], [xw - hl * 0.34, yc - tw - 22], [xw - hl * 0.6, yc - tw - 19], [xw - hl * 0.54, yc - tw], [x0 + hl * 0.2, yc - tw * 0.74], [x0 + 5, yc], [x0 + hl * 0.2, yc + tw * 0.8], [xw + 6, yc + tw - 2]], true, 4);
      sk.fill(hp, hand, { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 });
    }
    sk.ink(shape, { w: o.w ?? 9, seed: sd + 2, wob: 0.8 });
    for (const dy of [-0.3, 0.26]) sk.ink(dense([[x0 + hl * 0.08, yc + dy * tw], [x0 + hl * 0.4, yc + dy * tw * 1.1]]), { w: (o.w ?? 9) * 0.55, seed: sd + 3 + dy, wob: 0.3 });
  });
}
// 팔을 묶은 끈: 팔을 한 바퀴 감은 띠 + 위쪽 매듭. tight 면 굵고 진하게, 팔이 살짝 조인다
function tie(sk, x, yc, half, tight, sd) {
  const w = tight ? 30 : 13, col = tight ? "#6A3F2A" : "#B98A5E";
  thin(sk, 0.85, () => {
    const band = dense([[x, yc - half - (tight ? -2 : 4)], [x - 3, yc], [x, yc + half + (tight ? -2 : 6)]], 4);
    sk.ink(band, { w: w + 8, seed: sd, wob: 0.4, cap: "butt" });
    sk.ink(band, { w, color: col, seed: sd, wob: 0.4, cap: "butt" });
    const ky = yc - half - (tight ? 6 : 10);
    for (const [dx, dy, i] of [[-30, -34, 0], [34, -28, 1]]) sk.ink(curve([[x, ky], [x + dx * 0.5, ky - 8], [x + dx, ky + dy]]), { w: tight ? 9 : 7, color: col, seed: sd + 3 + i, wob: 0.5 });
    const kn = circ(x, ky, tight ? 13 : 10, { over: 0.2, seed: sd + 6 }); sk.fill(kn, col, { dx: 0, dy: 0, wob: 0.4, seed: sd + 7 }); sk.ink(kn, { w: 6, seed: sd + 8, wob: 0.5 });
    if (tight) for (const sg of [-1, 1]) for (const yy of [yc - half + 10, yc + half - 8]) sk.ink(dense([[x + sg * 24, yy], [x + sg * 38, yy + (yy < yc ? -7 : 7)]]), { w: 4.5, seed: sd + 10 + sg + yy, wob: 0.2 });
  });
}
// 걷어 올린 소매(오른쪽 화면 밖으로 이어진다)
function sleeve(sk, x, yc, half, sd) {
  thin(sk, 0.85, () => {
    const s = poly([[x, yc - half - 16], [1010, yc - half - 22], [1010, yc + half + 22], [x, yc + half + 16]], 4);
    sk.fill(s, "#EDE6D6", { dx: 0, dy: 0, wob: 0.5, seed: sd }); sk.ink(s, { w: 9, seed: sd + 1 });
    const cuff = rrect(x - 16, yc - half - 20, 34, half * 2 + 40, 12);
    sk.fill(cuff, "#F8F3E8", { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 }); sk.ink(cuff, { w: 8, seed: sd + 3 });
  });
}
// 정맥(파랑): 굵은 선 + 마디(판막 자리)
function vein(sk, pts, w, knots, sd, color = BLUE) {
  sk.ink(curve(pts), { w, color, seed: sd, wob: 0.5 });
  knots.forEach(([kx, ky], i) => { const c = circ(kx, ky, w * 0.92, { over: 0, seed: sd + 3 + i, lump: 0.05 }); sk.fill(c, color, { dx: 0, dy: 0, wob: 0.3, seed: sd + 9 + i }); });
}
// 받침 방석
function cushion(sk, x0, x1, y, sd) {
  thin(sk, 0.85, () => { const c = rrect(x0, y - 26, x1 - x0, 28, 13); sk.fill(c, "#B9C9DE", { dx: 0, dy: 0, wob: 0.5, seed: sd, tex: 0.8, texAng: 0.05 }); sk.ink(c, { w: 8, seed: sd + 1 }); });
}

/* ---------- 1. 옛 생각: 피는 만들어져 사라진다? ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  ground(sk, 704, 11);
  thin(sk, 0.85, () => board(sk, 326, 110, 276, 438, { color: "#FBF6E6", legs: 150, seed: 13 }));
  // 그림판: 사람 윤곽, 배 속의 간(갈색), 간에서 팔다리 끝으로 퍼지다 점으로 흩어져 사라지는 화살표
  const bx = 464, by = 512, bh = 312;
  bodyIcon(sk, bx, by, bh, { seed: 21, fill: "#FFFDF6", w: 6 });
  const liver = curve([[bx - 46, by - 0.49 * bh], [bx - 22, by - 0.535 * bh], [bx + 22, by - 0.52 * bh], [bx + 40, by - 0.485 * bh], [bx + 14, by - 0.455 * bh], [bx - 30, by - 0.445 * bh]], true, 3);
  sk.fill(liver, "#9C5A3C", { dx: 0, dy: 0, wob: 0.4, seed: 23 }); sk.ink(liver, { w: 5, seed: 24, wob: 0.4 });
  const U = (u, v) => [bx + u * bh, by + v * bh];
  const routes = [
    [[U(-0.07, -0.53), U(-0.15, -0.66), U(-0.2, -0.66), U(-0.27, -0.54)], [U(-0.295, -0.495), U(-0.315, -0.46), U(-0.33, -0.435)]],
    [[U(0.09, -0.53), U(0.15, -0.66), U(0.2, -0.66), U(0.27, -0.54)], [U(0.295, -0.495), U(0.315, -0.46), U(0.33, -0.435)]],
    [[U(-0.04, -0.43), U(-0.09, -0.3), U(-0.11, -0.18)], [U(-0.12, -0.12), U(-0.125, -0.075), U(-0.13, -0.035)]],
    [[U(0.04, -0.43), U(0.09, -0.3), U(0.11, -0.18)], [U(0.12, -0.12), U(0.125, -0.075), U(0.13, -0.035)]],
  ];
  routes.forEach(([path, dots], i) => {
    arrow(sk, path, { w: 6.5, color: OLD, seed: 31 + i * 5, head: 15, wob: 0.3 });
    dots.forEach(([dx, dy], j) => sk.dot(dx, dy, 6.5 - j * 1.6, mix(OLD, "#FBF6E6", 0.3 + j * 0.25)));
  });
  // 학생(왼쪽), 쌤(오른쪽, 그림판을 가리킨다)
  const sp = pose({ elL: [-52, -262], haL: [-40, -214], elR: [60, -300], haR: [96, -356], tilt: -0.08 });
  drawFigure(sk, 184, 704, 0.62, sp, { ...STUDENT, name: "student", mirror: true });
  const tp = pose({ elL: [-96, -318], haL: [-176, -352], elR: [52, -262], haR: [40, -214], tilt: -0.05 });
  drawFigure(sk, 724, 704, 0.68, tp, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 2. 파도바의 스승: 정맥 속 작은 문 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 704, 51);
  table(sk, 300, 760, 520, 53);
  // 나무판에 핀으로 꽂아 세운 낱장 그림(스승이 그린 그림): 끈으로 묶은 팔, 파란 정맥을 따라 마디. 글은 없다
  const bx0 = 316, bx1 = 744, by0 = 196, by1 = 520;
  thin(sk, 0.85, () => {
    const back = poly([[bx0 - 14, by0 - 12], [bx1 + 14, by0 - 12], [bx1 + 14, by1], [bx0 - 14, by1]], 4);
    sk.fill(back, C.wood, { seed: 55, tex: true, texAng: 0.04 }); sk.ink(back, { w: 10, seed: 56 });
    const sheet = [...curve([[bx0 + 8, by0 + 14], [(bx0 + bx1) / 2, by0 + 8], [bx1 - 8, by0 + 16]], false, 4), ...curve([[bx1 - 8, by0 + 16], [bx1 - 4, 360], [bx1 - 10, by1 - 44], [bx1 - 44, by1 - 20]], false, 4), ...curve([[bx1 - 44, by1 - 20], [(bx0 + bx1) / 2, by1 - 26], [bx0 + 10, by1 - 20]], false, 4)];
    sheet.push(sheet[0]);
    sk.fill(sheet, C.parchment, { dx: 0, dy: 0, wob: 0.5, seed: 57 }); sk.ink(sheet, { w: 8, seed: 58, wob: 0.7 });
    const fold = poly([[bx1 - 10, by1 - 44], [bx1 - 44, by1 - 20], [bx1 - 40, by1 - 50]], 3); sk.fill(fold, "#E2D2A8", { dx: 0, dy: 0, wob: 0.3, seed: 59 }); sk.ink(fold, { w: 6, seed: 60, wob: 0.4 });
    for (const px of [bx0 + 34, bx1 - 34]) { const pin = circ(px, by0 + 34, 8, { over: 0.1, seed: 61 + px }); sk.fill(pin, "#B0504A", { dx: 0, dy: 0, wob: 0.2, seed: 62 }); sk.ink(pin, { w: 4.5, seed: 63 + px, wob: 0.3 }); }
  });
  const yc = 350;
  armShape(sk, { x0: 338, xw: 404, xe: 566, x1: 716, yc, tw: 19, te: 31, tu: 35, sd: 71, w: 7, k: 0.8, skin: "#F3E3C4" });
  sk.ink(dense([[716, yc - 37], [716, yc + 37]]), { w: 6, seed: 73, wob: 0.3 });
  thin(sk, 0.8, () => { const b = dense([[640, yc - 37], [638, yc], [640, yc + 39]], 4); sk.ink(b, { w: 14, seed: 75, wob: 0.3, cap: "butt" }); sk.ink(b, { w: 8, color: "#B98A5E", seed: 75, wob: 0.3, cap: "butt" }); });
  vein(sk, [[392, yc + 2], [450, yc - 8], [520, yc - 4], [580, yc - 12], [630, yc - 8]], 9, [[450, yc - 8], [520, yc - 4], [580, yc - 12]], 77);
  sk.ink(circ(520, yc - 4, 30, { over: 0.25, seed: 81 }), { w: 6, color: C.gold, seed: 82, wob: 0.6 });
  // 파브리키우스(왼쪽): 자기가 그린 그림을 가리킨다. 젊은 하비(오른쪽): 들여다보며 궁금해한다
  const fp = pose({ elR: [92, -306], haR: [164, -338], elL: [-52, -262], haL: [-40, -214], tilt: 0.05 });
  person(sk, 156, 704, 0.66, fp, FABRICIUS, { name: "fabricius" });
  const hp = pose({ elL: [-70, -290], haL: [-100, -352], elR: [52, -262], haR: [40, -214], tilt: -0.1 });
  person(sk, 858, 704, 0.6, hp, HARVEY_YOUNG, { name: "harvey", face: "curious", mirror: true });
  qmark(sk, 884, 300, 0.62, { color: C.gray, seed: 85 });
  return sk;
}

/* ---------- 3. 셈: 반 시간이면 온몸의 피보다 많아 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 704, 91);
  // 윗줄: 심장이 한 번 뛸 때 나가는 피(작은 잔 하나) → 뛸 때마다 한 잔씩(잔이 줄지어 늘어남) → 큰 통
  heart(sk, 452, 232, 1.25, { color: RED, seed: 93 });
  arrow(sk, [[492, 232], [530, 232]], { w: 6, color: RED, seed: 95, straight: true, head: 13, wob: 0.2 });
  jar(sk, 548, 584, 206, 256, 228, 97);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) jar(sk, 622 + i * 34 + r * 12, 646 + i * 34 + r * 12, 170 + r * 52, 204 + r * 52, 184 + r * 52, 101 + r * 10 + i, 0.75);
  for (const [dx, i] of [[0, 0], [16, 1], [32, 2]]) sk.dot(808 + dx, 216, 4.5 - i * 0.6, mix(RED, "#ffffff", i * 0.2));
  arrow(sk, [[862, 214], [890, 250], [884, 318]], { w: 8, color: RED, seed: 121, head: 19, wob: 0.3 });
  // 아랫줄: 사람 한 명의 몸에 든 피 전체(작은 그릇)와 반 시간 동안 심장이 내보낸 피(큰 통)
  bodyIcon(sk, 508, 704, 262, { seed: 123, fill: "#F9D5CB" });
  for (const dy of [0, 16]) sk.ink(dense([[610, 652 + dy], [640, 652 + dy]]), { w: 7, color: "#7B7F87", seed: 125 + dy, wob: 0.2 });
  jar(sk, 664, 742, 616, 702, 640, 127);
  jar(sk, 778, 934, 344, 702, 384, 131, 1);
  const P = pose({ elR: [96, -318], haR: [176, -352], elL: [-52, -262], haL: [-40, -214], tilt: 0.06 });
  person(sk, 168, 704, 0.62, P, HARVEY, { name: "harvey", face: "wide" });
  return sk;
}

/* ---------- 4, 5. 팔 묶기 ---------- */
const ARM = { x0: 396, xw: 512, xe: 676, x1: 1010, yc: 432, tw: 40, te: 60, tu: 70 }, XT = 738;
function armScene(sk, tight, sd) {
  ground(sk, 704, sd);
  table(sk, 540, 1010, 524, sd + 2);
  cushion(sk, 590, 750, 524, sd + 4);
  const { yc } = ARM;
  armShape(sk, { ...ARM, sd: sd + 6, hand: tight ? SKIN : "#F3A99B", skin: SKIN });
  if (tight) {
    // 세게: 깊은 동맥까지 막힌다. 피(빨강)는 끈 앞에서 멈추고 끈 위쪽이 불룩, 끈 아래로는 들어가지 못한다(옅은 점선)
    sk.ink(dense([[XT - 30, yc + 14], [ARM.xw + 6, yc + 8]]), { w: 7, color: mix(RED, SKIN, 0.6), dash: [12, 13], seed: sd + 8, wob: 0.2 });
    const bump = ell(XT + 66, yc - ARM.tu + 8, 46, 24, Math.PI, Math.PI * 2);
    thin(sk, 0.85, () => { sk.fill([...bump, bump[0]], SKIN, { dx: 0, dy: 0, wob: 0.3, seed: sd + 9 }); sk.ink(bump, { w: 9, seed: sd + 11, wob: 0.5 }); });
    arrow(sk, [[960, yc + 10], [XT + 36, yc + 10]], { w: 15, color: RED, seed: sd + 10, straight: true, head: 26, wob: 0.3 });
    for (const [r, i] of [[24, 0], [40, 1]]) sk.ink(ell(XT + 66, yc - 96, r, r, -2.25, -0.9), { w: 6, color: RED, seed: sd + 12 + i, wob: 0.2 });
  } else {
    // 느슨히: 깊은 동맥(빨강 실선, 겉의 정맥보다 가늘게)은 끈 밑을 지나 손까지 간다. 겉의 정맥(파랑)은 손에서 돌아오다 끈에 막혀 불룩하다
    arrow(sk, [[940, yc + 30], [700, yc + 30], [ARM.xw + 2, yc + 18]], { w: 10, color: RED, seed: sd + 8, head: 20, wob: 0.3 });
    sk.ink(dense([[XT + 22, yc - 24], [880, yc - 26]]), { w: 6, color: mix(BLUE, SKIN, 0.55), seed: sd + 14, wob: 0.3 });
    vein(sk, [[ARM.xw - 8, yc - 8], [566, yc - 22], [626, yc - 14], [686, yc - 30], [XT - 22, yc - 24]], 19, [[566, yc - 22], [626, yc - 14], [686, yc - 30]], sd + 16);
    arrow(sk, [[556, yc - 96], [XT - 50, yc - 112]], { w: 9, color: BLUE, seed: sd + 30, straight: true, head: 20, wob: 0.3 });
  }
  sleeve(sk, 872, yc, ARM.tu, sd + 34);
  tie(sk, XT, yc, ARM.tu - 2, tight, sd + 40);
  heart(sk, 910, 250, 1.0, { color: RED, seed: sd + 60 });
}
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  armScene(sk, true, 201);
  // 하비: 손목을 짚어 보려 한다(맥이 뛰지 않는다)
  const P = pose({ elR: [104, -372], haR: [178, -452], elL: [-52, -262], haL: [-40, -214], tilt: 0.08 });
  person(sk, 240, 704, 0.62, P, HARVEY, { name: "harvey", face: "curious" });
  qmark(sk, 506, 326, 0.62, { color: C.gray, seed: 281 });
  return sk;
}
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  armScene(sk, false, 301);
  // 하비: 불룩해진 정맥을 가리킨다
  const P = pose({ elR: [104, -384], haR: [176, -470], elL: [-52, -262], haL: [-40, -214], tilt: 0.08 });
  person(sk, 240, 704, 0.62, P, HARVEY, { name: "harvey", face: "wide" });
  emark(sk, 470, 300, 0.62, { seed: 381 });
  return sk;
}

/* ---------- 6. 손가락 실험: 거꾸로는 못 가요 ---------- */
// 하비의 손(검은 소매 + 흰 소맷동): 아래에서 올라와 집게손가락 끝으로 누른다. (x, tipY) = 손가락 끝
function pressHand(sk, x, tipY, sd) {
  thin(sk, 0.9, () => {
    const sl = poly([[x - 76, 740], [x - 66, 664], [x + 66, 664], [x + 76, 740]], 4);
    sk.fill(sl, BLACK, { dx: 0, dy: 0, wob: 0.4, seed: sd }); sk.ink(sl, { w: 9, seed: sd + 1 });
    const cuff = rrect(x - 72, 644, 144, 30, 10); sk.fill(cuff, C.white, { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 }); sk.ink(cuff, { w: 8, seed: sd + 3 });
    const fg = rrect(x - 25, tipY, 50, 590 - tipY, 24); sk.fill(fg, SKIN, { dx: 0, dy: 0, wob: 0.4, seed: sd + 4 }); sk.ink(fg, { w: 9, seed: sd + 5 });
    sk.ink(curve([[x - 13, tipY + 26], [x, tipY + 32], [x + 13, tipY + 26]]), { w: 4.5, color: "#C9987E", seed: sd + 6, wob: 0.2 });
    const palm = curve([[x - 58, 650], [x - 64, 590], [x - 44, 548], [x + 4, 536], [x + 50, 552], [x + 62, 600], [x + 56, 650]], false, 4);
    sk.fill([...palm, palm[0]], SKIN, { dx: 0, dy: 0, wob: 0.4, seed: sd + 7 }); sk.ink(palm, { w: 9, seed: sd + 8 });
    for (const [kx, i] of [[26, 0], [46, 1]]) sk.ink(curve([[x + kx - 10, 566 + i * 10], [x + kx, 556 + i * 10], [x + kx + 8, 568 + i * 12]]), { w: 5, seed: sd + 9 + i, wob: 0.3 });
  });
}
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  // 가까이 본 팔뚝(왼쪽 끝에 손목과 손, 심장은 오른쪽)
  armShape(sk, { x0: 14, xw: 164, xe: 640, x1: 1020, yc: 356, tw: 70, te: 112, tu: 132, sd: 401, k: 0.9, w: 9 });
  const vy = x => 352 - (x - 480) * 0.02;
  const XF = 372, XV = 606;
  // 정맥: 누른 손가락의 손 쪽은 피가 차서 불룩, 손가락과 마디(판막) 사이는 비어 옅고 납작, 마디의 심장 쪽은 다시 차 있다
  sk.ink(dense([[150, vy(150) + 4], [XF - 4, vy(XF)]]), { w: 28, color: BLUE, seed: 405, wob: 0.5 });
  sk.ink(dense([[XF + 20, vy(XF)], [XV - 26, vy(XV)]]), { w: 16, color: "#D5E6F6", seed: 407, wob: 0.4 });
  for (const dy of [-10, 10]) sk.ink(dense([[XF + 30, vy(XF) + dy], [XV - 26, vy(XV) + dy]]), { w: 3.5, color: mix(BLUE, "#ffffff", 0.35), dash: [10, 9], seed: 409 + dy, wob: 0.2 });
  sk.ink(dense([[XV, vy(XV)], [990, vy(990)]]), { w: 28, color: BLUE, seed: 411, wob: 0.5 });
  const kn = circ(XV + 6, vy(XV), 27, { over: 0, seed: 413, lump: 0.04 }); sk.fill(kn, BLUE, { dx: 0, dy: 0, wob: 0.3, seed: 414 });
  // 판막: 심장 쪽으로만 열리는 두 장의 문(닫힌 모습)
  for (const sg of [-1, 1]) sk.ink(curve([[XV - 16, vy(XV) + sg * 21], [XV - 2, vy(XV) + sg * 13], [XV + 12, vy(XV)]]), { w: 5, color: C.white, seed: 415 + sg, wob: 0.2 });
  // 심장 쪽으로는 간다(파랑 + 체크), 손 쪽으로는 못 간다(회색 + 가위표)
  arrow(sk, [[640, 286], [846, 280]], { w: 10, color: BLUE, seed: 421, straight: true, head: 22, wob: 0.3 });
  check(sk, 900, 280, 0.7, { seed: 423 });
  arrow(sk, [[764, 414], [640, 418]], { w: 9, color: C.gray, seed: 425, straight: true, head: 20, wob: 0.3 });
  xmark(sk, 598, 420, 0.5, { seed: 427, w: 14 });
  heart(sk, 900, 150, 1.15, { color: RED, seed: 429 });
  pressHand(sk, XF, vy(XF) - 14, 441);
  pressHand(sk, 806, vy(806) - 14, 461);
  return sk;
}

/* ---------- 7. 결론: 같은 피가 돌고 돈다 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  ground(sk, 704, 501);
  // 큰 고리: 심장(위)에서 빨강으로 나가 온몸(아래의 사람 기호)을 지나 파랑으로 돌아온다
  const cx = 668, cy = 400, r = 196;
  arrow(sk, ell(cx, cy, r, r, -Math.PI / 2 + 0.5, Math.PI / 2 - 0.36), { w: 15, color: RED, seed: 503, straight: true, head: 30, wob: 0.6 });
  arrow(sk, ell(cx, cy, r, r, Math.PI / 2 + 0.36, Math.PI * 1.5 - 0.5), { w: 15, color: BLUE, seed: 507, straight: true, head: 30, wob: 0.6 });
  heart(sk, cx, cy - r + 2, 2.6, { color: RED, seed: 511, w: 4 });
  bodyIcon(sk, cx, cy + r + 76, 150, { seed: 513, fill: "#FBEFE6" });
  sparkle(sk, 880, 170, 24, { seed: 515 }); sparkle(sk, 452, 196, 17, { seed: 517 }); sparkle(sk, 902, 610, 15, { seed: 519 });
  // 하비: 얇은 책을 들고 있다
  const P = pose({ elR: [92, -272], haR: [172, -292], elL: [-52, -262], haL: [-40, -214], tilt: 0.05 });
  const fx = 190, fs = 0.62, hx = fx + fs * 172, hy = 704 - fs * 292;
  person(sk, fx, 704, fs, P, HARVEY, { name: "harvey", face: "happy", hands: "L" });
  sk.at(hx + 10, hy - 26, 1, () => {
    const bk = rrect(-36, -52, 72, 104, 7); sk.fill(bk, "#8A5A33", { seed: 521, tex: true, texAng: 1.3 }); sk.ink(bk, { w: 8, seed: 522 });
    sk.ink(dense([[-24, -52], [-24, 52]]), { w: 4, color: "#5E3B20", seed: 523, wob: 0.2 });
    const lb = rrect(-10, -30, 34, 22, 4); sk.fill(lb, C.parchment, { dx: 0, dy: 0, wob: 0.3, seed: 524 }); sk.ink(lb, { w: 4, seed: 525, wob: 0.3 });
  }, 0.1);
  handDot(sk, [hx, hy], C.skin, 527, 9.5);
  return sk;
}

/* ---------- 8. 1661년: 현미경이 찾은 가는 길 ---------- */
function frogDish(sk, x, y, sd) {
  thin(sk, 0.85, () => {
    const d = rrect(x - 60, y - 10, 120, 10, 3); sk.fill(d, "#D8ECF6", { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(d, { w: 5.5, seed: sd + 1, wob: 0.4 });
    const G = "#5FAE5A";
    for (const sg of [-1, 1]) sk.ink(curve([[x + sg * 14, y - 22], [x + sg * 40, y - 30], [x + sg * 30, y - 16], [x + sg * 46, y - 15]]), { w: 8, color: G, seed: sd + 3 + sg, wob: 0.3 });
    const b = ell(x, y - 30, 30, 17); sk.fill(b, G, { dx: 0, dy: 0, wob: 0.4, seed: sd + 5 }); sk.ink(b, { w: 5, seed: sd + 6, wob: 0.4 });
    for (const sg of [-1, 1]) { const e = circ(x + sg * 13 - 6, y - 47, 7.5, { over: 0.1, seed: sd + 7 + sg }); sk.fill(e, G, { dx: 0, dy: 0, wob: 0.2, seed: sd + 9 }); sk.ink(e, { w: 4.5, seed: sd + 10 + sg, wob: 0.3 }); sk.dot(x + sg * 13 - 6, y - 48, 2.6); }
  });
}
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  ground(sk, 704, 601);
  table(sk, 330, 690, 590, 603);
  // 확대해 본 모습(개구리 허파): 굵은 관 둘을 잇는 아주 가는 관의 그물. 한 가지 색, 방향은 화살표로만
  const cx = 730, cy = 292, r = 186;
  sk.ink(dense([[432, 548], [cx - r * 0.94, cy + r * 0.36]]), { w: 4, color: C.gray, dash: [9, 9], seed: 605, wob: 0 });
  sk.ink(dense([[404, 540], [cx - r * 0.6, cy - r * 0.8]]), { w: 4, color: C.gray, dash: [9, 9], seed: 606, wob: 0 });
  const ring = circ(cx, cy, r, { over: 0.1, seed: 607 });
  sk.fill(ring, "#FFF5EA", { dx: 0, dy: 0, wob: 0.6, seed: 608 });
  const A = [cx - 62, cy - 26], B = [cx + 62, cy + 26];
  sk.ink(curve([[cx - 150, cy - 96], [cx - 104, cy - 58], A]), { w: 30, color: NEUT, seed: 611, wob: 0.5 });
  sk.ink(curve([B, [cx + 104, cy + 58], [cx + 150, cy + 96]]), { w: 30, color: NEUT, seed: 613, wob: 0.5 });
  // 그물: 여러 갈래의 가는 길. 굵은 관 둘과 같은 색(색으로 피의 종류를 가르지 않는다)
  const lanes = [[-78, -40], [-46, -22], [-18, -8], [14, 10], [44, 26], [78, 44]];
  lanes.forEach(([n, bend], i) => {
    const nx = 0.39, ny = -0.92; // 길의 수직 방향
    const m0 = [cx - 22 + nx * n * 0.9, cy - 9 + ny * n * 0.9 + bend * 0.1], m1 = [cx + 22 + nx * n * 0.9, cy + 9 + ny * n * 0.9 - bend * 0.1];
    sk.ink(curve([A, m0, m1, B]), { w: 5, color: NEUT, seed: 621 + i, wob: 0.5 });
  });
  // 흐르는 방향은 화살표로만: 굵은 관 → 그물 → 굵은 관
  arrow(sk, [[cx - 156, cy - 30], [cx - 108, cy + 10]], { w: 6.5, color: "#5A5F68", seed: 651, straight: true, head: 15, wob: 0.2 });
  arrow(sk, [[cx - 20, cy + 78], [cx + 30, cy + 98]], { w: 6.5, color: "#5A5F68", seed: 652, straight: true, head: 15, wob: 0.2 });
  arrow(sk, [[cx + 108, cy - 10], [cx + 156, cy + 30]], { w: 6.5, color: "#5A5F68", seed: 653, straight: true, head: 15, wob: 0.2 });
  thin(sk, 0.9, () => sk.ink(ring, { w: 10, seed: 609, wob: 0.8 }));
  emark(sk, 524, 150, 0.72, { seed: 655 });
  // 말피기: 현미경을 들여다본다
  const P = pose({ neck: [14, -340], head: [50, -428], elR: [84, -252], haR: [122, -190], elL: [-52, -262], haL: [-40, -214], tilt: 0.3 });
  person(sk, 262, 704, 0.64, P, MALPIGHI, { name: "malpighi", face: "curious" });
  microscope(sk, 430, 590, 0.82, { seed: 661, sample: false });
  frogDish(sk, 548, 590, 671);
  return sk;
}
function lerpP(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }

export const META = {
  title: "피는 돈다,<br><em>하비의 셈과 팔 묶기</em>",
  lead: "1628년, 셈과 실험으로 1,400년 넘게 이어진 생각을 뒤집은 의사 하비를 따라가요.",
  narrator: "심장은 왜 한순간도 쉬지 않고 뛸까요? 옛날 사람들은 피가 몸속에서 <b>새로 만들어져 쓰여 없어진다</b>고 믿었어요. 영국의 의사 <b>윌리엄 하비</b>는 그 생각을 셈과 실험으로 시험했어요.",
  cta: "심장 열어 보기",
};

const CUTS = [
  {
    fn: p1, stage: "옛 생각", title: "피는 만들어져 사라진다?",
    caption: "1,400년 넘게 유럽의 의사들은 로마 시대 의사 갈레노스의 생각을 따랐어요. 피는 음식으로 <b>간</b>에서 만들어지고, 온몸으로 퍼져 몸 끝에서 쓰여 없어진다는 거예요. 그래서 피는 쉬지 않고 새로 만들어져야 했지요.",
    bubbles: [{ who: "student", text: "피가<br>사라져요?" }, { who: "teacher", text: "그렇게<br>믿었대요" }],
  },
  {
    fn: p2, when: "1600년 무렵, 이탈리아 파도바", stage: "스승의 발견", title: "정맥 속 작은 문",
    caption: "영국 청년 하비는 1600년 무렵 이탈리아 파도바 대학에서 파브리키우스 교수에게 배웠어요. 스승은 정맥을 따라 마디처럼 놓인 작은 <b>판막</b>을 1574년에 처음 보았고, 강의에서 학생들에게 보여 주었어요. 1603년에는 그림을 곁들여 책으로도 펴냈지요. 다만 스승은 판막이 피를 천천히 흘려 고루 나누는 장치라고 생각했어요.",
  },
  {
    fn: p3, when: "1620년대, 영국 런던", stage: "셈", title: "반 시간이면 온몸의 피보다 많아",
    caption: "런던의 의사가 된 하비는 심장이 한 번 뛸 때 내보내는 피를 일부러 아주 적게 잡아 셈을 했어요. 반 시간이면 심장은 1,000번 넘게 뛰고, 그 피를 다 더하면 <b>몸 전체에 든 피보다 많아요</b>. 간이 그만큼을 쉬지 않고 새로 만들 수는 없지요.",
    bubbles: [{ who: "harvey", text: "온몸의 피보다<br>많아요!" }],
  },
  {
    fn: p4, when: "1620년대, 영국 런던", stage: "실험", title: "세게 묶었더니",
    caption: "하비는 피를 뽑을 때처럼 팔꿈치 위를 끈으로 묶어 보았어요. 아주 세게 묶으면 손목에서 맥이 뛰지 않고, 끈 위쪽만 불룩해져 뛰었어요. 깊은 곳의 혈관인 <b>동맥</b>이 막혀, 심장에서 온 피가 손으로 들어가지 못한 거예요.",
  },
  {
    fn: p5, when: "1620년대, 영국 런던", stage: "실험", title: "조금 풀었더니",
    caption: "끈을 조금 풀자 손이 붉어지고, 끈 아래 팔뚝의 겉 혈관인 <b>정맥</b>이 불룩해졌어요. 피는 깊은 동맥을 지나 손까지 들어갔지만, 정맥으로 돌아 나오다 끈에 막힌 거예요. 동맥은 피가 심장에서 나가는 길, 정맥은 심장으로 돌아오는 길이었어요.",
  },
  {
    fn: p6, when: "1620년대, 영국 런던", stage: "증거", title: "거꾸로는 못 가요",
    caption: "하비는 불룩한 정맥을 한 손가락으로 누르고, 다른 손가락으로 피를 훑어 보았어요. 심장 쪽으로는 피가 밀려가 그 사이가 비었어요. 하지만 손 쪽으로 되밀면 마디에 있는 <b>판막</b>에 막혀 넘어가지 않았어요. 정맥 속 피는 심장 쪽으로만 흘러요.",
  },
  {
    fn: p7, when: "1628년, 영국 런던", stage: "결론", title: "같은 피가 돌고 돈다",
    caption: "1628년, 런던의 하비는 셈과 실험을 모아 책을 썼어요. 책은 독일 프랑크푸르트에서 찍혀 나왔어요. 심장은 펌프처럼 피를 밀어내고, 같은 피가 온몸을 돌아 다시 심장으로 와요. 이것이 혈액의 <b>순환</b>이고, 심장이 쉬지 않고 뛰는 까닭이에요.",
    bubbles: [{ who: "harvey", text: "피는 원을 그리며<br>돌아요" }],
  },
  {
    fn: p8, when: "1661년, 이탈리아 볼로냐", stage: "마지막 빈칸", title: "현미경이 찾은 가는 길",
    caption: "하비는 동맥과 정맥이 어떻게 이어지는지는 끝내 보지 못하고 1657년에 세상을 떠났어요. 1661년, 이탈리아 볼로냐의 말피기가 현미경으로 개구리 허파를 들여다보다 굵은 혈관에서 온 피가 아주 가는 혈관의 그물을 지나 다른 굵은 혈관으로 가는 것을 보았어요. 동맥과 정맥을 잇는 이 가는 길이 오늘날 <b>모세혈관</b>이에요.",
    term: { name: "순환계", def: "심장, 혈관, 혈액으로 이루어져 몸속에서 물질을 운반하는 기관계예요." },
  },
];

export function panels() {
  return CUTS.map(c => ({ sk: c.fn(), bubbles: c.bubbles, when: c.when, whenPos: c.whenPos, stage: c.stage, title: c.title, caption: c.caption, term: c.term }));
}
