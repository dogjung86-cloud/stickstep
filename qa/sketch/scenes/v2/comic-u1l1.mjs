// 중1 과학 u1l1 도입 만화 v2(배선 전 미리보기): 제임스 린드의 괴혈병 실험으로 배우는 탐구 여섯 단계, 8컷.
// 조사와 콘티: qa/sketch/research/v2/u1l1.md. 미리보기: node qa/sketch/mock-comic.mjs v2/comic-u1l1 <출력 PNG> 4
//   1 갑판에 번진 병 → 2 문제 인식 → 3 가설 설정 → 4 탐구 설계(같은 칸, 같은 죽, 다른 처방) → 5 탐구 수행(엿새 만에 빈 과일 바구니)
//   → 6 자료 해석(표) → 7 결론 도출(신 것이라고 다 듣지는 않았다) → 8 그 뒤 이야기(1795년, 갑판의 레몬즙)
// 린드는 1747년의 평상복(검은 삼각모, 흰 가발, 갈색 외투)으로 그린다. 영국 해군의 제복은 1748년에 장교부터 생겼고
// 군의관은 1805년에야 생겼다(지금 만화의 남색 제복은 시대에 맞지 않는다). 선원도 제복이 없어 머릿수건과 털모자로 구분한다.
// 처방 여섯 가지는 컷 2부터 같은 모양과 색으로 되풀이하고, 식사는 모두 같은 회색 죽 그릇으로 그린다. 그림 안에 글자는 없다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, qmark, xmark, sparkle, dizzy, arrow, squiggle } from "../../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, R, SAILOR_A, SAILOR_B, SAILOR_C } from "../../lib/figure.mjs";
import { orange, lemon, cloud, sea, mug, vial, jug, glass, bowl, notebook, quill, sun, paper } from "../../lib/props.mjs";

const W = 960, H = 720;
const SICK = C.skinSick;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; }; // 큰 구조물의 선이 인물보다 굵어지지 않게
// 1747년의 린드: 검은 삼각모 + 흰 가발 + 갈색 평상복(해군 제복이 아직 없던 때)
const LIND = { hair: "tricorn", capColor: "#34343A", coat: { color: "#8B5E3C", buttons: C.gold, seam: "#5E3E26" }, seed: 41, mini: true, face: "calm" };

// 처방 여섯 가지(사과술, 묽은 황산이 든 약, 식초, 바닷물, 오렌지와 레몬, 약 반죽). 원점 = 바닥 가운데
const REMEDY = [
  (sk, x, y, s) => mug(sk, x, y, s),
  (sk, x, y, s) => vial(sk, x, y, s),
  (sk, x, y, s) => jug(sk, x, y, s),
  (sk, x, y, s) => glass(sk, x, y, s),
  (sk, x, y, s) => { orange(sk, x - 24 * s, y - 34 * s, 34 * s, { seed: 901 }); lemon(sk, x + 32 * s, y - 25 * s, 29 * s, { seed: 905, rot: 0.2 }); },
  (sk, x, y, s) => bowl(sk, x, y, s, { spoon: true }),
];
const GRUEL = "#C9C5BC"; // 모두에게 똑같이 준 죽(무채색)

/* ---------- 배경: 갑판(컷 1, 8)과 배 안(컷 2~7) ---------- */

// 군함의 위 갑판: 하늘과 바다, 대포 구멍이 난 뱃전, 나무 바닥, 돛대. sunny 면 맑은 날
//   o.mastX: 돛대 왼쪽 x, o.portX: 대포 구멍 왼쪽 x, o.cannon=false 면 대포를 빼고 구멍만
function deck(sk, o = {}) {
  const sunny = !!o.sunny, mx = o.mastX ?? 880, px = o.portX ?? 70;
  sk.fill(poly([[-10, -10], [970, -10], [970, 330], [-10, 330]], 8), sunny ? "#DDF0FB" : "#E2E7EC", { dx: 0, dy: 0, wob: 0, seed: 3, tex: false });
  if (!sunny) {
    // 흐리고 비가 흩뿌리는 날(린드는 이 무렵 항해의 차고 비 오는 날씨를 적었다). 구름은 때와 곳 상자를 피해 오른쪽에
    for (const [x, y, w, h, i] of [[600, 70, 240, 70, 0], [820, 104, 260, 84, 1], [700, 160, 200, 54, 2]]) {
      const c = curve([[x - w / 2, y + h / 3], [x - w / 2.4, y - h / 4], [x - w / 6, y - h / 2], [x + w / 6, y - h / 2.4], [x + w / 2.3, y - h / 5], [x + w / 2, y + h / 3]], true, 5);
      sk.fill(c, "#C9D0D8", { dx: 0, dy: 0, wob: 1, seed: 4 + i });
    }
    for (let i = 0; i < 14; i++) { const x = 480 + (i * 67) % 470, y = 200 + ((i * 41) % 80); sk.ink(dense([[x, y], [x - 12, y + 30]]), { w: 4, color: "#A9B5C2", seed: 20 + i, wob: 0.2 }); }
  } else {
    thin(sk, 0.55, () => sun(sk, 868, 96, 42, { seed: 701 }));
  }
  thin(sk, 0.75, () => sea(sk, -10, 970, 300, 440, { seed: sunny ? 25 : 27, color: sunny ? C.sea : "#9DBCCF", waves: 3 }));
  thin(sk, 0.72, () => {
    // 뱃전(나무 벽)과 난간
    const wall = poly([[-10, 432], [970, 432], [970, 574], [-10, 574]], 6);
    sk.fill(wall, C.wood, { seed: 31, tex: true, texAng: 0.02 });
    for (const [y, i] of [[478, 0], [526, 1]]) sk.ink(dense([[-10, y], [970, y]]), { w: 6, color: C.woodDark, seed: 32 + i, wob: 0.8 });
    // 대포 구멍: 바깥 바다가 보인다
    const port = rrect(px, 456, 132, 86, 6);
    sk.fill(port, sunny ? "#BFE3F5" : "#AFC6D4", { dx: 0, dy: 0, wob: 0.4, seed: 34 });
    sk.ink(port, { w: 10, seed: 35 });
    sk.ink(wall, { w: 10, seed: 36 });
    const rail = poly([[-10, 418], [970, 418], [970, 440], [-10, 440]], 6);
    sk.fill(rail, C.woodDark, { seed: 37, tex: true, texAng: 0.02 }); sk.ink(rail, { w: 10, seed: 38 });
    // 바닥 널
    const floor = poly([[-10, 574], [970, 574], [970, 730], [-10, 730]], 6);
    sk.fill(floor, "#E8D3A8", { dx: 0, dy: 0, wob: 0.6, seed: 39, tex: true, texAng: 0.02 });
    for (const [y, i] of [[612, 0], [656, 1], [704, 2]]) sk.ink(dense([[-10, y], [970, y]]), { w: 5, color: "#C8A979", seed: 40 + i, wob: 1 });
    sk.ink(dense([[-10, 574], [970, 574]]), { w: 9, seed: 43 });
    if (o.cannon !== false) {
      // 대포: 붉은 받침 위의 쇠 포신이 대포 구멍으로 나간다
      const barrel = poly([[px + 176, 552], [px + 158, 520], [px + 32, 486], [px + 24, 512]], 4);
      sk.fill(barrel, "#4A5059", { seed: 44, tex: true, texAng: 0.3 }); sk.ink(barrel, { w: 10, seed: 45 });
      const car = poly([[px + 94, 552], [px + 222, 552], [px + 230, 606], [px + 86, 606]], 4);
      sk.fill(car, "#B5533C", { seed: 46, tex: true, texAng: 0.02 }); sk.ink(car, { w: 10, seed: 47 });
      for (const [x, i] of [[px + 114, 0], [px + 202, 1]]) { const wh = circ(x, 612, 22, { over: 0.2, seed: 48 + i }); sk.fill(wh, "#8A3E2E", { dx: 0, dy: 0, wob: 0.4, seed: 50 + i }); sk.ink(wh, { w: 9, seed: 52 + i }); }
    }
    // 돛대
    const mast = poly([[mx, -10], [mx + 36, -10], [mx + 40, 578], [mx - 4, 578]], 6);
    sk.fill(mast, C.woodDark, { seed: 54, tex: true, texAng: 1.5 }); sk.ink(mast, { w: 10, seed: 55 });
    for (const [y, i] of [[176, 0], [190, 1]]) sk.ink(dense([[mx - 8, y], [mx + 44, y]]), { w: 7, seed: 56 + i, color: "#5E3E26", wob: 0.3 });
  });
}

// 배 안(선창): 따뜻한 나무 벽 + 휜 늑골 + 위의 들보. 바닥 y = floor
function hold(sk, o = {}) {
  const floor = o.floor ?? 690;
  sk.fill(poly([[-10, -10], [970, -10], [970, 730], [-10, 730]], 8), "#F7EEDD", { dx: 0, dy: 0, wob: 0, seed: 5, tex: false });
  thin(sk, 0.6, () => {
    for (const [x, i] of [[96, 0], [340, 1], [600, 2], [860, 3]]) sk.ink(curve([[x - 34, 150], [x + 8, 420], [x - 6, floor]]), { w: 10, color: "#E2CDA9", seed: 6 + i, wob: 1 });
    if (o.beam !== false) {
      const beam = poly([[-10, 118], [970, 118], [970, 150], [-10, 150]], 6);
      sk.fill(beam, "#C9A774", { seed: 10, tex: true, texAng: 0.02 }); sk.ink(beam, { w: 9, seed: 11 });
    }
    const fl = poly([[-10, floor], [970, floor], [970, 730], [-10, 730]], 6);
    sk.fill(fl, "#E6CFA2", { dx: 0, dy: 0, wob: 0.6, seed: 12, tex: true, texAng: 0.02 });
    sk.ink(dense([[-10, floor], [970, floor]]), { w: 9, seed: 13 });
  });
}

// 들보에 매단 등불. (x, y) = 등 몸통 위쪽
function lantern(sk, x, y, s = 1, sd = 71) {
  sk.glow(x, y + 46 * s, 90 * s, "#FFE7A3", 0.55, 0.15);
  sk.at(x, y, s, () => {
    sk.ink(dense([[0, -40], [0, 0]]), { w: 6, seed: sd, wob: 0.2 });
    const body = poly([[-26, 4], [26, 4], [32, 84], [-32, 84]], 4);
    sk.fill(body, "#FFE9A8", { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 });
    const fl = curve([[0, 28], [9, 50], [0, 64], [-9, 50]], true, 2);
    sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 });
    sk.ink(body, { w: 8, seed: sd + 3 });
    const cap = poly([[-32, 4], [0, -16], [32, 4]], 3);
    sk.fill(cap, "#5B5F66", { dx: 0, dy: 0, wob: 0.4, seed: sd + 4 }); sk.ink(cap, { w: 8, seed: sd + 5 });
    sk.ink(dense([[-36, 88], [36, 88]]), { w: 9, seed: sd + 6 });
  });
}

// 들보에 줄로 매단 환자 침상(코트). (x, y) = 침상 바닥 왼쪽, w = 길이. 머리는 왼쪽(face = -1 이면 오른쪽)
function cot(sk, x, y, w, o = {}) {
  const sd = o.seed ?? 300, h = o.h ?? 40, top = y - h, hs = o.headS ?? 0.27;
  if (o.beamY !== undefined) {
    sk.ink(dense([[x + 8, top + 6], [x + w * 0.34, o.beamY]]), { w: 5, color: "#8A6A44", seed: sd, wob: 0.3 });
    sk.ink(dense([[x + w - 8, top + 6], [x + w * 0.66, o.beamY]]), { w: 5, color: "#8A6A44", seed: sd + 1, wob: 0.3 });
  }
  const left = (o.head ?? -1) < 0;
  const hx = left ? x + 30 : x + w - 30;
  // 머리(베개 위로 보인다), 이불, 침상
  if (o.who) {
    sk.at(hx, top - 10 - (o.up ?? 0), hs, () => drawHead(sk, { ...o.who, skin: o.skin ?? SICK, seed: sd + 3, tex: false, flip: left ? 1 : -1 }), left ? -0.2 : 0.2);
    if (o.name) sk.mark(o.name, hx, top - 10 - (o.up ?? 0) - (R + 14) * hs);
  }
  if (o.blanket !== false) {
    // 이불: 낮고 넓게(머리처럼 둥글게 솟으면 한 침상에 두 사람이 누운 것처럼 보인다)
    const bx0 = left ? x + 44 : x + 6, bx1 = left ? x + w - 6 : x + w - 44;
    const b = curve([[bx0, top + 8], [bx0 + 4, top - 7], [(bx0 + bx1) / 2, top - 11], [bx1 - 4, top - 8], [bx1, top + 8]], false, 3);
    sk.fill([...b, b[0]], o.blanketColor ?? "#C9BC9F", { dx: 0.6, dy: 0.8, wob: 0.6, seed: sd + 4 });
    sk.ink(b, { w: 7, seed: sd + 5, wob: 0.6 });
  }
  const body = rrect(x, top, w, h, 12);
  sk.fill(body, "#EFE4CC", { seed: sd + 6, tex: true, texAng: 0.02, dx: 0.8, dy: 1 });
  sk.ink(body, { w: 7.5, seed: sd + 7, wob: 0.8 });
}

// 작은 사람 표지(표의 칸, 생각 구름). state: "lie" 누운 사람 | "sit" 일어나 앉은 사람 | "up" 두 팔을 든 사람
function marker(sk, x, y, s, state, seed) {
  sk.at(x, y, s, () => {
    const lw = 15, g = "#6F6F73";
    if (state === "up") {
      sk.ink(dense([[0, -150], [0, -64]]), { w: lw, seed, wob: 0.6 });
      sk.ink(dense([[0, -64], [-30, 0]]), { w: lw, seed: seed + 1, wob: 0.6 });
      sk.ink(dense([[0, -64], [30, 0]]), { w: lw, seed: seed + 2, wob: 0.6 });
      sk.ink(curve([[0, -138], [-40, -160], [-62, -212]]), { w: lw, seed: seed + 3, wob: 0.6 });
      sk.ink(curve([[0, -138], [40, -160], [62, -212]]), { w: lw, seed: seed + 4, wob: 0.6 });
      const h = circ(0, -196, 44, { over: 0.2, seed: seed + 5 });
      sk.fill(h, C.skin, { dx: 2, dy: 2, wob: 0.8, seed: seed + 6 }); sk.ink(h, { w: lw, seed: seed + 7, wob: 0.8 });
    } else if (state === "sit") {
      // 깔개 위에 다리를 뻗고 일어나 앉은 사람
      const mat = rrect(-112, -22, 236, 24, 10);
      sk.fill(mat, "#D9CFB4", { dx: 0, dy: 0, wob: 0.6, seed });
      sk.ink(dense([[-30, -22], [70, -22]]), { w: lw, seed: seed + 1, wob: 0.6 });
      sk.ink(dense([[-30, -22], [-36, -112]]), { w: lw, seed: seed + 2, wob: 0.6 });
      sk.ink(curve([[-34, -90], [6, -72], [34, -64]]), { w: lw, seed: seed + 3, wob: 0.6 });
      const h = circ(-40, -150, 42, { over: 0.2, seed: seed + 5 });
      sk.fill(h, mix(SICK, C.skin, 0.5), { dx: 2, dy: 2, wob: 0.8, seed: seed + 6 }); sk.ink(h, { w: lw, seed: seed + 7, wob: 0.8 });
    } else {
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

// 나무통(걸터앉는 자리, 물통). (x, y) = 바닥 가운데
function barrel(sk, x, y, w = 104, h = 118, sd = 26) {
  const b = curve([[x - w / 2, y - h], [x - w / 2 - 12, y - h / 2], [x - w / 2 - 2, y], [x + w / 2 + 2, y], [x + w / 2 + 12, y - h / 2], [x + w / 2, y - h]], false, 4);
  const shape = [...b, b[0]];
  sk.fill(shape, C.wood, { seed: sd, tex: true, texAng: 1.5 });
  sk.ink(curve([[x - w / 2 - 8, y - h * 0.72], [x, y - h * 0.68], [x + w / 2 + 8, y - h * 0.72]]), { w: 5, seed: sd + 1 });
  sk.ink(curve([[x - w / 2 - 8, y - h * 0.28], [x, y - h * 0.22], [x + w / 2 + 8, y - h * 0.28]]), { w: 5, seed: sd + 2 });
  sk.ink(shape, { w: 7, seed: sd + 3 });
}

/* ---------- 1. 갑판에 번진 병 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  deck(sk, { mastX: 752, portX: 20 });
  const FLOOR = 694;
  // 린드(왼쪽): 공책을 든 채 선원들을 살핀다
  const watch = pose({ elR: [58, -272], haR: [96, -252], elL: [-56, -262], haL: [-18, -222], tilt: 0.06 });
  const fx = 292, fs = 0.6;
  drawFigure(sk, fx, FLOOR, fs, watch, { ...LIND, name: "lind", face: "curious", look: 0.6, hands: "L" });
  notebook(sk, fx + fs * 112, FLOOR - fs * 262, 0.62, { rot: 0.14, seed: 31 });
  handDot(sk, [fx + fs * 96, FLOOR - fs * 252], C.skin, 33, 9.5);
  // 통에 걸터앉아 축 늘어진 선원(가운데): 무릎에 힘이 없고 팔에 검붉은 반점
  const BX = 566;
  barrel(sk, BX, FLOOR, 96, 100, 26);
  const slump = pose({ hip: [0, -232], neck: [-22, -352], head: [-62, -432], tilt: -0.42,
    elL: [-52, -298], haL: [-84, -236], elR: [-30, -292], haR: [-62, -228], knL: [-150, -222], ftL: [-162, -4], knR: [-134, -214], ftR: [-140, 0] });
  const ss = 0.58, sx = BX + 10, sy = FLOOR - 100 + 238 * ss;
  drawFigure(sk, sx, sy, ss, slump, { ...SAILOR_B, skin: SICK, handL: SICK, handR: SICK, name: "sailor" });
  for (const [dx, dy] of [[-58, -284], [-66, -268], [-74, -252]]) sk.dot(sx + dx * ss + 6, sy + dy * ss, 5, "#9A3B3B");
  // 갑판에 누운 선원(오른쪽, 머리가 왼쪽): 말아 둔 담요를 베었다
  const pil = curve([[606, 676], [614, 648], [684, 642], [700, 668], [688, 690], [618, 692]], true, 4);
  sk.fill(pil, "#D7CDB6", { dx: 0.8, dy: 1, wob: 0.6, seed: 61 }); sk.ink(pil, { w: 8, seed: 62 });
  sk.at(884, 660, 1, () => {
    const lie = pose({ hip: [-40, -212], neck: [-14, -342], head: [0, -436], tilt: -0.1,
      elL: [-70, -290], haL: [-98, -226], elR: [10, -272], haR: [-22, -232], knL: [-76, -108], ftL: [-96, 0], knR: [-30, -120], ftR: [-92, -30] });
    drawFigure(sk, 0, 0, 0.48, lie, { ...SAILOR_A, skin: SICK, handL: SICK, handR: SICK, seed: 83 });
  }, -Math.PI / 2);
  dizzy(sk, 668, 566, 0.9, { n: 2 });
  return sk;
}

/* ---------- 2. 문제 인식: 무엇이 정말 효과가 있을까? ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  hold(sk);
  lantern(sk, 520, 168, 0.86, 91);
  // 약 선반: 배에 실린 여섯 처방
  thin(sk, 0.75, () => {
    const shelf = rrect(40, 474, 612, 26, 8);
    sk.fill(shelf, C.wood, { seed: 41, tex: true, texAng: 0.02 }); sk.ink(shelf, { w: 10, seed: 42 });
    for (const [x, i] of [[96, 0], [596, 1]]) sk.ink(curve([[x, 500], [x + 4, 548], [x - 30, 548]]), { w: 9, seed: 43 + i });
    // 선반 아래 약상자
    const chest = rrect(120, 560, 420, 130, 10);
    sk.fill(chest, "#B98A55", { seed: 45, tex: true, texAng: 0.02 }); sk.ink(chest, { w: 10, seed: 46 });
    sk.ink(dense([[120, 600], [540, 600]]), { w: 6, color: C.woodDark, seed: 47, wob: 0.6 });
    const lock = rrect(312, 588, 36, 30, 6); sk.fill(lock, C.gold, { dx: 0, dy: 0, wob: 0.3, seed: 48 }); sk.ink(lock, { w: 6, seed: 49 });
  });
  const xs = [90, 186, 284, 380, 488, 596];
  xs.forEach((x, i) => {
    REMEDY[i](sk, x, 474, 0.92);
    qmark(sk, x, 352 - (i % 2) * 16, 0.48, { color: C.gray, w: 13, seed: 51 + i });
  });
  // 린드: 턱에 손을 대고 생각한다
  const think = pose({ elR: [54, -292], haR: [24, -350], elL: [-56, -262], haL: [-18, -222], tilt: -0.06 });
  drawFigure(sk, 806, 690, 0.8, think, { ...LIND, name: "lind", face: "curious", look: -0.7, mirror: true });
  return sk;
}

/* ---------- 3. 가설 설정: 신 것이 답일까? ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  hold(sk, { beam: false });
  // 생각 구름: 신맛 나는 처방 넷 → 털고 일어나는 선원
  cloud(sk, 356, 306, 560, 320, { seed: 471, tail: [[666, 404, 19, 0], [704, 372, 11, 1]] });
  lemon(sk, 142, 300, 40, { seed: 37, rot: -0.2 });
  jug(sk, 228, 344, 0.84, { seed: 561 });
  vial(sk, 304, 344, 0.82, { seed: 541 });
  mug(sk, 384, 344, 0.82, { seed: 521 });
  for (const [x, y, i] of [[174, 236, 0], [282, 244, 1], [418, 248, 2]]) sparkle(sk, x, y, 12, { seed: 43 + i, color: C.lemon });
  arrow(sk, [[446, 314], [506, 314]], { w: 9, color: C.green, straight: true, seed: 63, head: 22 });
  marker(sk, 572, 392, 0.5, "up", 65);
  // 린드: 식초 단지를 가슴께로 들어 들여다본다
  const P = pose({ elR: [70, -262], haR: [96, -294], elL: [-56, -262], haL: [-24, -214], tilt: 0.12 });
  const fx = 800, fy = 690, fs = 0.8;
  drawFigure(sk, fx, fy, fs, P, { ...LIND, name: "lind", face: "curious", look: 0.5, hands: "L" });
  const hx = fx + fs * 96, hy = fy - fs * 294;
  jug(sk, hx + 16, hy + 40, 0.8, { seed: 563 });
  handDot(sk, [hx, hy], C.skin, 69, 12);
  return sk;
}

/* ---------- 4. 탐구 설계: 하나만 다르게, 나머지는 똑같이 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  hold(sk, { beam: false });
  const rows = [{ beam: 138, cot: 252, shelf: 326 }, { beam: 404, cot: 518, shelf: 600 }];
  thin(sk, 0.7, () => rows.forEach((r, j) => {
    const beam = poly([[388, r.beam - 14], [970, r.beam - 14], [970, r.beam + 14], [388, r.beam + 14]], 6);
    sk.fill(beam, "#C9A774", { seed: 10 + j, tex: true, texAng: 0.02 }); sk.ink(beam, { w: 9, seed: 12 + j });
  }));
  const cols = [502, 684, 866];
  for (let i = 0; i < 6; i++) {
    const r = rows[Math.floor(i / 3)], cx = cols[i % 3];
    // 한 쌍: 나란히 매단 침상 둘
    for (const [dx, j] of [[-88, 0], [4, 1]]) cot(sk, cx + dx, r.cot, 84, { beamY: r.beam + 14, who: (i + j) % 2 ? SAILOR_B : SAILOR_A, seed: 300 + i * 20 + j * 9, h: 36, headS: 0.28 });
    // 쌍마다: 모두 같은 죽(회색) + 다른 처방(색)
    thin(sk, 0.8, () => { const sh = rrect(cx - 86, r.shelf, 172, 16, 6); sk.fill(sh, C.woodDark, { seed: 400 + i, tex: true, texAng: 0.02 }); sk.ink(sh, { w: 7, seed: 410 + i }); });
    bowl(sk, cx - 42, r.shelf, 0.54, { food: GRUEL, seed: 120 });
    REMEDY[i](sk, cx + 42, r.shelf, 0.68);
  }
  // 린드: 여섯 쌍을 가리킨다
  const show = pose({ elR: [84, -318], haR: [156, -334], elL: [-54, -262], haL: [-20, -222], tilt: 0.04 });
  drawFigure(sk, 150, 690, 0.64, show, { ...LIND, name: "lind", face: "determined", look: 0.5 });
  return sk;
}

/* ---------- 5. 탐구 수행: 날마다 살피고, 본 대로 적기 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  hold(sk);
  // 흘러간 날: 해 여섯(엿새)
  for (let i = 0; i < 6; i++) sun(sk, 74 + i * 74, 214, 17, { seed: 701 + i * 11 });
  // 오렌지와 레몬을 먹은 쌍의 침상(오른쪽): 한 사람이 일어나 앉아 빈 바구니 쪽으로 손을 뻗는다
  const CX0 = 646, CX1 = 934, CT = 392;
  sk.ink(dense([[CX0 + 10, CT + 4], [CX0 + 80, 150]]), { w: 5, color: "#8A6A44", seed: 81, wob: 0.3 });
  sk.ink(dense([[CX1 - 10, CT + 4], [CX1 - 80, 150]]), { w: 5, color: "#8A6A44", seed: 82, wob: 0.3 });
  const reach = pose({ hip: [0, -212], neck: [-6, -338], head: [-10, -432], tilt: -0.06,
    elL: [-74, -300], haL: [-146, -292], elR: [36, -262], haR: [64, -226], knL: [100, -214], ftL: [200, -214], knR: [100, -208], ftR: [200, -208] });
  const ws = mix(SICK, C.skin, 0.55);
  drawFigure(sk, 712, CT + 12 + 212 * 0.5, 0.5, reach, { ...SAILOR_A, skin: ws, name: "sailor", hands: "L", handL: ws });
  const bl = curve([[740, CT + 6], [752, CT - 26], [820, CT - 36], [900, CT - 28], [922, CT + 6]], false, 3);
  sk.fill([...bl, bl[0]], "#A9C7E8", { dx: 0.6, dy: 0.8, wob: 0.6, seed: 85 }); sk.ink(bl, { w: 8, seed: 86 });
  const cb = rrect(CX0, CT, CX1 - CX0, 62, 16);
  sk.fill(cb, "#EFE4CC", { seed: 83, tex: true, texAng: 0.02, dx: 0.8, dy: 1 }); sk.ink(cb, { w: 9, seed: 84 });
  // 빈 과일 바구니(작은 탁자 위): 껍질만 남았다
  thin(sk, 0.85, () => {
    sk.ink(dense([[488, 486], [480, 690]]), { w: 11, seed: 87 }); sk.ink(dense([[592, 486], [600, 690]]), { w: 11, seed: 88 });
    const tt = rrect(462, 466, 156, 24, 8); sk.fill(tt, C.wood, { seed: 89, tex: true, texAng: 0.02 }); sk.ink(tt, { w: 10, seed: 90 });
  });
  // 바구니 안쪽이 보이게(속이 텅 빈 어두운 타원) + 테두리에 걸린 껍질 한 가닥
  const kx = 540, ky = 466;
  sk.ink(curve([[kx - 62, ky - 44], [kx, ky - 108], [kx + 62, ky - 44]]), { w: 8, seed: 91 });
  const inside = ell(kx, ky - 44, 66, 14);
  sk.fill(inside, "#7A5A33", { dx: 0, dy: 0, wob: 0.4, seed: 99 });
  const basket = curve([[kx - 70, ky - 44], [kx - 52, ky], [kx + 52, ky], [kx + 70, ky - 44], [kx, ky - 30]], true, 3);
  sk.fill(basket, "#D9A866", { seed: 92, tex: true, texAng: 0.02 });
  sk.ink(curve([[kx - 60, ky - 22], [kx, ky - 14], [kx + 60, ky - 22]]), { w: 5, color: C.woodDark, seed: 98, wob: 0.4 });
  sk.ink(curve([[kx - 70, ky - 44], [kx - 52, ky], [kx + 52, ky], [kx + 70, ky - 44]], false, 3), { w: 9, seed: 93 });
  sk.ink(inside, { w: 8, seed: 94 });
  sk.ink(curve([[kx + 38, ky - 50], [kx + 58, ky - 40], [kx + 66, ky - 22], [kx + 58, ky - 8]], false, 2), { w: 8, color: C.orange, seed: 95, wob: 0.3 });
  // 걸상에 앉아 적는 린드(왼쪽): 무릎 위 공책 + 깃펜
  const fs = 0.74, fx = 206, fy = 690;
  const seatY = fy - fs * 206;
  sk.ink(dense([[fx - 46, seatY + 20], [fx - 58, fy]]), { w: 11, seed: 71 });
  sk.ink(dense([[fx + 50, seatY + 20], [fx + 62, fy]]), { w: 11, seed: 72 });
  const seat = rrect(fx - 62, seatY, 124, 24, 10);
  sk.fill(seat, C.wood, { seed: 73, tex: true, texAng: 0.02 }); sk.ink(seat, { w: 10, seed: 74 });
  const sitW = pose({ hip: [0, -212], neck: [10, -338], head: [20, -432], tilt: 0.1,
    elL: [60, -258], haL: [142, -252], elR: [80, -312], haR: [160, -316], knL: [96, -222], ftL: [102, 0], knR: [114, -210], ftR: [132, -2] });
  drawFigure(sk, fx, fy, fs, sitW, { ...LIND, name: "lind", hands: false, look: 0.4, coat: { ...LIND.coat, len: 26 } });
  notebook(sk, fx + fs * 172, fy - fs * 272, 1.06, { rot: -0.16, seed: 75 });
  quill(sk, fx + fs * 160 + 12, fy - fs * 316 + 10, 0.72, { rot: 0.55, seed: 76 });
  handDot(sk, [fx + fs * 142, fy - fs * 252], C.skin, 77, 11);
  handDot(sk, [fx + fs * 160, fy - fs * 316], C.skin, 78, 11);
  return sk;
}

/* ---------- 6. 자료 해석: 나란히 놓으니 보여요 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  const PX = 318, PY = 112, PW = 604, PH = 584;
  thin(sk, 0.7, () => paper(sk, PX, PY, PW, PH));
  const top = PY + 24, rh = (PH - 48) / 6, split = PX + 128, split2 = PX + 420;
  // 오렌지와 레몬 줄 강조(형광펜)
  const hy = top + rh * 4;
  sk.fill(rrect(PX + 14, hy + 6, PW - 28, rh - 12, 16), C.lemon, { seed: 201, dx: 0, dy: 0, alpha: 0.78, tex: true, texAng: 0.02, wob: 3 });
  for (let i = 1; i < 6; i++) sk.ink(dense([[PX + 16, top + rh * i], [PX + PW - 16, top + rh * i]]), { w: 5, seed: 210 + i, color: "#B9A57A", wob: 1.4 });
  for (const [x, i] of [[split, 0], [split2, 1]]) sk.ink(dense([[x, top + 4], [x, top + rh * 6 - 4]]), { w: 5, seed: 217 + i, color: "#B9A57A", wob: 1.4 });
  // 줄마다: 처방 | 두 사람의 2주 뒤 모습 | 나아진 정도
  const state = ["sit", "lie", "lie", "lie", "up", "lie"];
  for (let i = 0; i < 6; i++) {
    const by = top + rh * (i + 1) - 12, st = state[i];
    REMEDY[i](sk, PX + 66, by, 0.6);
    for (const [dx, j] of [[86, 0], [210, 1]]) marker(sk, split + dx, by + (st === "up" ? 4 : -2), st === "up" ? 0.33 : 0.36, st, 230 + i * 20 + j * 10);
    const mx = split2 + 92;
    if (st === "up") {
      arrow(sk, [[mx - 38, by - 6], [mx + 26, by - 58]], { w: 10, color: C.green, straight: true, seed: 261, head: 24 });
      sparkle(sk, mx + 62, by - 58, 14, { seed: 263 });
    } else if (st === "sit") {
      arrow(sk, [[mx - 38, by - 22], [mx + 30, by - 40]], { w: 8, color: "#8FBF6A", straight: true, seed: 265, head: 18 });
    } else {
      sk.ink(dense([[mx - 36, by - 30], [mx + 32, by - 30]]), { w: 9, color: C.gray, seed: 270 + i, wob: 0.8 });
    }
  }
  // 린드: 깃펜으로 오렌지와 레몬 줄을 짚는다
  const P = pose({ elR: [60, -300], haR: [118, -326], elL: [-54, -262], haL: [-20, -222], tilt: 0.04 });
  const fx = 134, fy = 690, fs = 0.66;
  drawFigure(sk, fx, fy, fs, P, { ...LIND, name: "lind", face: "wide", look: 0.6, hands: "L" });
  const hr = [fx + fs * 118, fy - fs * 326];
  sk.ink(dense([[hr[0] - 10, hr[1] + 4], [PX + 20, hy + rh * 0.56]]), { w: 8, seed: 281, wob: 1, color: "#6B4A32" });
  handDot(sk, hr, C.skin, 283, 10.5);
  return sk;
}

/* ---------- 7. 결론 도출: 신 것이라고 다 듣지는 않았어요 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  hold(sk, { beam: false });
  // 왼쪽 아래: 신맛이 나도 듣지 않은 식초와 황산 약
  thin(sk, 0.8, () => { const tb = rrect(52, 560, 300, 24, 8); sk.fill(tb, C.wood, { seed: 31, tex: true, texAng: 0.02 }); sk.ink(tb, { w: 10, seed: 32 }); sk.ink(dense([[86, 584], [80, 690]]), { w: 11, seed: 33 }); sk.ink(dense([[318, 584], [324, 690]]), { w: 11, seed: 34 }); });
  jug(sk, 140, 560, 1.12, { seed: 561 });
  vial(sk, 262, 560, 1.12, { seed: 541 });
  xmark(sk, 140, 436, 0.62, { w: 12, seed: 309 });
  xmark(sk, 262, 436, 0.62, { w: 12, seed: 311 });
  // 린드: 한 손에 오렌지, 한 손에 레몬
  const up = pose({ elL: [-110, -330], haL: [-196, -372], elR: [110, -330], haR: [196, -372], tilt: 0.03 });
  const fx = 640, fy = 690, fs = 0.8;
  drawFigure(sk, fx, fy, fs, up, { ...LIND, name: "lind", face: "happy", hands: false });
  const hl = [fx - fs * 196, fy - fs * 372], hr = [fx + fs * 196, fy - fs * 372];
  orange(sk, hl[0] - 4, hl[1] - 46, 44, { seed: 51 });
  lemon(sk, hr[0] + 8, hr[1] - 42, 40, { seed: 55, rot: -0.2 });
  handDot(sk, hl, C.skin, 301, 13); handDot(sk, hr, C.skin, 303, 13);
  sparkle(sk, hl[0] - 58, hl[1] - 92, 15, { seed: 305 });
  sparkle(sk, hr[0] + 66, hr[1] - 88, 13, { seed: 307 });
  return sk;
}

/* ---------- 8. 그 뒤 이야기: 1795년, 갑판에 오른 레몬즙 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  deck(sk, { sunny: true, mastX: 596, portX: 760, cannon: false });
  const FLOOR = 694;
  // 레몬 상자(왼쪽)
  thin(sk, 0.66, () => {
    for (const [x, y, r, rot, i] of [[86, 586, 30, 0.1, 0], [140, 580, 30, -0.3, 1], [196, 588, 30, 0.25, 2], [112, 552, 30, -0.1, 3], [170, 548, 30, 0.35, 4]]) lemon(sk, x, y, r, { seed: 321 + i * 4, rot });
    const c = poly([[44, 596], [240, 596], [232, FLOOR], [52, FLOOR]], 4);
    sk.fill(c, C.woodLight, { seed: 331, tex: true, texAng: 0.04 }); sk.ink(c, { w: 11, seed: 333 });
    sk.ink(dense([[48, 644], [236, 644]]), { w: 7, color: C.woodDark, seed: 334, wob: 0.6 });
  });
  // 국자를 든 선원(통 뒤에 선다): 몸을 먼저 그리고 통으로 아랫몸을 가린다
  const TX = 452;
  const ladle = pose({ elR: [70, -300], haR: [104, -250], elL: [-56, -262], haL: [-24, -216], tilt: 0.04 });
  drawFigure(sk, TX - 12, FLOOR - 40, 0.56, ladle, { ...SAILOR_C, hands: "L" });
  const lh = [TX - 12 + 0.56 * 104, FLOOR - 40 - 0.56 * 250];
  // 나눠 주는 통: 레몬즙을 탄 물
  thin(sk, 0.66, () => {
    const tub = poly([[TX - 92, 584], [TX + 92, 584], [TX + 80, FLOOR], [TX - 80, FLOOR]], 4);
    sk.fill(tub, C.wood, { seed: 341, tex: true, texAng: 1.5 }); sk.ink(tub, { w: 11, seed: 342 });
    for (const [y, i] of [[612, 0], [664, 1]]) sk.ink(dense([[TX - 90, y], [TX + 88, y]]), { w: 8, color: "#6B7480", seed: 343 + i, wob: 0.4 });
    const top = ell(TX, 584, 92, 18);
    sk.fill(top, "#F3E39A", { dx: 0, dy: 0, wob: 0.4, seed: 345 }); sk.ink(top, { w: 9, seed: 346 });
  });
  sk.ink(dense([[lh[0], lh[1]], [lh[0] + 14, 588]]), { w: 7, seed: 351, wob: 0.3 });
  sk.ink(ell(lh[0] + 16, 590, 16, 8), { w: 6, seed: 353, wob: 0.3 });
  handDot(sk, lh, C.skin, 352, 9);
  const drink = pose({ elR: [58, -300], haR: [26, -362], elL: [-56, -262], haL: [-24, -216], tilt: -0.12 });
  const ax = 690, as = 0.6;
  drawFigure(sk, ax, FLOOR, as, drink, { ...SAILOR_A, name: "drinker", hands: "L", mirror: true });
  const cupA = [ax - as * 26, FLOOR - as * 362];
  const cup = (x, y, sd) => { const c = poly([[x - 16, y - 30], [x + 16, y - 30], [x + 13, y + 4], [x - 13, y + 4]], 3); sk.fill(c, "#B8C1CC", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd }); sk.ink(c, { w: 7, seed: sd + 1 }); };
  cup(cupA[0] - 6, cupA[1] - 8, 355);
  handDot(sk, cupA, C.skin, 357, 10);
  const wait = pose({ elR: [56, -272], haR: [70, -214], elL: [-60, -270], haL: [-86, -226], tilt: 0.02 });
  const bx = 858, bs = 0.56;
  drawFigure(sk, bx, FLOOR, bs, wait, { ...SAILOR_B, hands: "R", mirror: true });
  const cupB = [bx + bs * 86, FLOOR - bs * 226];
  cup(cupB[0], cupB[1] - 6, 359);
  handDot(sk, cupB, C.skin, 361, 9.5);
  return sk;
}

export const META = {
  title: "배 위의 실험으로<br><em>탐구 6단계</em> 배우기",
  lead: "1747년, 영국 군함에서 한 군의관이 선원들을 쓰러뜨린 병을 이길 방법을 찾아 나섰어요. 컷을 한 장씩 넘기며 그 과정을 따라가 봐요.",
  narrator: "저는 <b>스틱맨 쌤</b>이에요! 오늘은 <b>제임스 린드</b>의 괴혈병 실험으로 과학자가 답을 찾아가는 여섯 단계를 보여 줄게요.",
  cta: "6단계 정리하기",
};

// 말풍선(앱이 얹는다). who = 인물에 준 기준점 이름
const BUBBLES = [
  [{ who: "sailor", text: "다리에<br>힘이 없어요" }],
  [{ who: "lind", text: "무엇이 정말<br>효과가 있을까?" }],
  null,
  [{ who: "lind", text: "처방만<br>다르게!" }],
  [{ who: "sailor", text: "과일 더<br>없나요?" }],
  [{ who: "lind", text: "이 줄만<br>확 달라!" }],
  [{ who: "lind", text: "오렌지와 레몬이<br>가장 잘 낫게 해!" }],
  [{ who: "drinker", text: "새콤해!" }],
];

const P = [
  {
    fn: p1, when: "1747년 5월, 영국 군함 솔즈베리호", stage: "궁금증의 시작", title: "갑판에 번진 병",
    caption: "1747년 봄, 영국 군함 솔즈베리호가 바다에 나간 지 두 달쯤 되자 선원들이 하나둘 쓰러졌어요. 잇몸이 상하고, 피부에 검붉은 반점이 생기고, 무릎에 힘이 빠지는 병, <b>괴혈병</b>이었지요. 이 배의 군의관 <b>제임스 린드</b>가 그 모습을 지켜보고 있었어요.",
  },
  {
    fn: p2, when: "1747년 5월, 솔즈베리호", stage: "문제 인식", title: "무엇이 정말 효과가 있을까?",
    caption: "배에는 사과술, 식초, 묽은 황산이 든 약, 바닷물처럼 괴혈병에 좋다는 처방이 여럿 있었어요. 하지만 무엇이 정말 듣는지는 분명하지 않았지요. 린드는 막연한 걱정을 <b>“이 처방들 가운데 무엇이 괴혈병을 낫게 할까?”</b>라는 또렷한 질문으로 바꿨어요.",
    term: { name: "문제 인식", def: "관찰하다 생긴 궁금증을 <b>실험으로 답할 수 있는 또렷한 질문</b>(탐구 문제)으로 만드는 단계." },
  },
  {
    fn: p3, when: "1747년 5월, 솔즈베리호", stage: "가설 설정", title: "신 것이 답일까?",
    caption: "그 무렵 배에서는 식초나 황산 약처럼 <b>신맛 나는 것</b>을 괴혈병 약으로 썼어요. 신 것이 이 병에 듣는다고 여기는 사람이 많았거든요. 린드는 이 생각이 맞는지 실험으로 확인해 보기로 하고 가설을 세웠어요. <b>“신 것을 먹으면 괴혈병이 나을 것이다.”</b>",
    term: { name: "가설", def: "이미 아는 지식과 경험을 바탕으로 세운 <b>잠정적인 답</b>. 실험으로 맞는지 틀리는지 <b>확인할 수 있어야</b> 해요." },
  },
  {
    fn: p4, when: "1747년 5월 20일, 솔즈베리호", stage: "탐구 설계", title: "하나만 다르게, 나머지는 똑같이",
    caption: "린드는 증세가 되도록 비슷한 선원 <b>12명</b>을 골라 2명씩 <b>6쌍</b>으로 나눴어요. 모두 배 앞쪽 아래의 같은 칸에 눕히고 같은 식사를 주었지요. 쌍마다 다르게 한 것은 <b>처방 하나뿐</b>이었어요. 그래야 누가 나았을 때 무엇 덕분인지 알 수 있어요.",
    term: { name: "탐구 설계와 변인 통제", def: "가설을 확인할 실험을 계획하는 단계예요. 알아보려는 조건 하나만 다르게 하고(<b>조작 변인</b>) 나머지는 모두 같게 맞춰요(<b>통제 변인</b>). 이렇게 조건을 조절하는 일을 <b>변인 통제</b>라고 해요." },
  },
  {
    fn: p5, when: "1747년 5월 말, 솔즈베리호", stage: "탐구 수행", title: "날마다 살피고, 본 대로 적기",
    caption: "린드는 날마다 선원들을 살피며 본 것을 <b>있는 그대로</b> 적었어요. 오렌지와 레몬은 엿새 만에 다 떨어져 그 쌍만 처방이 일찍 끝났는데, 린드는 이 사실도 빼지 않고 적었지요. 바라는 결과만 골라 적으면 실험을 믿을 수 없게 돼요.",
    term: { name: "탐구 수행", def: "계획한 대로 조건을 지키며 관찰하고 측정해, 결과를 <b>있는 그대로 기록</b>하는 단계(안전도 챙겨요)." },
  },
  {
    fn: p6, when: "1747년 6월 초, 솔즈베리호", stage: "자료 해석", title: "나란히 놓으니 보여요",
    caption: "2주가 지나자 린드는 여섯 쌍의 결과를 <b>나란히</b> 견주었어요. 오렌지와 레몬을 먹은 두 사람 가운데 한 명은 엿새 만에 다시 일할 수 있게 되었고, 다른 한 명은 다른 환자를 돌볼 만큼 나았어요. 사과술을 마신 쌍은 조금 나아졌고, 나머지 네 쌍은 거의 그대로였지요.",
    term: { name: "자료 해석", def: "관찰하고 측정한 결과를 <b>표나 그래프로 정리</b>해 자료 사이의 관계와 규칙을 찾아내는 단계." },
  },
  {
    fn: p7, when: "1747년 6월, 솔즈베리호", stage: "결론 도출", title: "신 것이라고 다 듣지는 않았어요",
    caption: "식초와 황산 약도 신맛이 났지만 듣지 않았어요. <b>“신 것이면 낫는다”는 가설은 맞지 않았던</b> 거예요. 린드는 자료를 근거로 <b>오렌지와 레몬이 가장 잘 듣는다</b>는 결론을 내렸어요. 이제 남은 물음은 “오렌지와 레몬 속의 무엇이 병을 낫게 할까?”였지요.",
    term: { name: "결론 도출", def: "자료를 근거로 가설이 맞는지 판단해 결론을 내리는 단계. 가설이 맞지 않으면 <b>고쳐서 다시 탐구</b>해요." },
  },
  {
    fn: p8, when: "1795년, 영국 해군의 군함", stage: "그 뒤 이야기", title: "레몬즙이 배에 오르기까지",
    caption: "린드는 1753년 이 실험을 책에 담아 세상에 알렸어요. 그래도 영국 해군이 모든 배에 레몬즙을 나눠 주기로 한 것은 1795년이었어요. 레몬 속에서 괴혈병을 막는 물질이 <b>비타민 C</b>라는 것은 1932년에야 밝혀졌지요.",
  },
];

export function panels() {
  return P.map((p, i) => ({ sk: p.fn(), bubbles: BUBBLES[i], when: p.when, whenPos: p.whenPos, stage: p.stage, title: p.title, caption: p.caption, term: p.term }));
}
