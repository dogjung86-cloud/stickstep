// 스플래시 플립북: 놀이 컷 열네 장 + "공부하자!" 정착 컷. 표정이 있는 그림이다.
// 주인공은 만화의 쌤과 같은 얼굴(삐친 머리 + 둥근 안경)에 가운만 벗은 모습.
// 머리 크기와 자리를 컷마다 비슷하게 두어, 넘길 때 한 사람이 이것저것 하는 것처럼 보이게 한다.
// 그림 속 글자는 머리띠의 "공부하자!" 하나뿐이다(획으로 긋는다).
import { Sk, C, curve, dense, circ, ell, poly, rrect, squiggle, emark, sparkle, drop, heart, rays } from "../lib/sk.mjs";
import { drawFigure, drawHead, handDot, pose, KID } from "../lib/figure.mjs";
import { bowl, ball, note, clock, openBook, pencil } from "../lib/props.mjs";

const S = 512;
const kid = (face, extra = {}) => ({ ...KID, face, ...extra });

// 먹기: 책상다리로 앉아 라면 후루룩
function eat() {
  const sk = new Sk(S, S, { id: "sa" });
  const fx = 256, fy = 474, fs = 1.1;
  const P = pose({ hip: [0, -36], neck: [0, -164], head: [0, -258], knL: [-100, -36], ftL: [30, -4], knR: [100, -36], ftR: [-30, -4],
    elL: [-74, -112], haL: [-52, -62], elR: [80, -128], haR: [58, -172] });
  drawFigure(sk, fx, fy, fs, P, kid("happy"));
  // 면발과 젓가락
  for (let i = 0; i < 3; i++) sk.ink(curve([[246 + i * 10, 252], [242 + i * 11, 300], [250 + i * 9, 346], [244 + i * 11, 396]]), { w: 6, color: C.lemon, seed: 11 + i, wob: 1.2 });
  sk.ink(dense([[fx + fs * 58 + 4, fy - fs * 172 - 4], [262, 258]]), { w: 6, seed: 15, wob: 0.6 });
  sk.ink(dense([[fx + fs * 58 + 8, fy - fs * 172 + 8], [270, 266]]), { w: 6, seed: 16, wob: 0.6 });
  bowl(sk, 256, 452, 1.3, { color: C.red, food: C.lemon, seed: 17 });
  sk.ink(squiggle(150, 400, 44, 7, 2, 0.4), { w: 6, color: C.gray, wob: 0, seed: 18 });
  sk.ink(squiggle(366, 396, 44, 7, 2, 1.8), { w: 6, color: C.gray, wob: 0, seed: 19 });
  return sk;
}

// 게임: 화면 앞에서 조종기를 쥐고
function game() {
  const sk = new Sk(S, S, { id: "sb" });
  // 화면과 받침
  sk.ink(dense([[124, 322], [124, 356]]), { w: 12, seed: 21 });
  sk.ink(dense([[76, 360], [172, 360]]), { w: 12, seed: 22 });
  const tv = rrect(24, 150, 204, 174, 16);
  sk.fill(tv, "#2B3A67", { seed: 23, tex: true });
  const blk = (x, y, w, h, c, sd) => sk.fill(poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 4), c, { dx: 0, dy: 0, wob: 0.8, seed: sd });
  blk(46, 268, 46, 30, C.teal, 24); blk(104, 244, 40, 54, C.yellow, 25); blk(156, 276, 46, 22, C.red, 26);
  sk.dot(128, 204, 11, C.white);
  sk.ink(curve([[70, 232], [96, 196], [128, 204]]), { w: 5, color: C.white, seed: 27, wob: 0.4, dash: [10, 9] });
  sk.ink(tv, { w: 11, seed: 28 });
  // 주인공
  const fx = 368, fy = 482, fs = 0.8;
  const P = pose({ neck: [-14, -338], head: [-26, -430], tilt: -0.06, elL: [-78, -286], haL: [-128, -278], elR: [-22, -262], haR: [-92, -256],
    knL: [-44, -110], ftL: [-76, 0], knR: [38, -104], ftR: [66, 0] });
  drawFigure(sk, fx, fy, fs, P, { ...kid("happy"), look: -0.8, hands: false });
  const pad = rrect(fx - fs * 150, fy - fs * 292, 78, 42, 16);
  sk.fill(pad, "#5B6475", { seed: 29, dx: 1, dy: 1.2 }); sk.ink(pad, { w: 8, seed: 30, wob: 0.8 });
  sk.dot(fx - fs * 150 + 20, fy - fs * 292 + 21, 5.5, C.white); sk.dot(fx - fs * 150 + 56, fy - fs * 292 + 21, 5.5, C.red);
  handDot(sk, [fx - fs * 128 - 16, fy - fs * 278 + 14], C.skin, 31, 11);
  handDot(sk, [fx - fs * 92 + 14, fy - fs * 256 + 6], C.skin, 33, 11);
  sk.ink(curve([[214, 232], [226, 224], [232, 210]]), { w: 5, color: C.gray, seed: 35, wob: 0.3 });
  sk.ink(curve([[226, 252], [240, 248], [250, 238]]), { w: 5, color: C.gray, seed: 36, wob: 0.3 });
  return sk;
}

// 공놀이: 공을 뻥
function kick() {
  const sk = new Sk(S, S, { id: "sc" });
  const fx = 206, fy = 482, fs = 0.8;
  const P = pose({ neck: [-10, -340], head: [-18, -434], tilt: -0.08, elL: [-84, -304], haL: [-140, -344], elR: [70, -300], haR: [124, -258],
    knL: [-14, -106], ftL: [-26, 0], knR: [72, -186], ftR: [150, -206] });
  drawFigure(sk, fx, fy, fs, P, kid("happy"));
  sk.ink(curve([[344, 292], [376, 252], [394, 208]]), { w: 6, color: C.gray, seed: 41, wob: 0.4, dash: [14, 12] });
  ball(sk, 416, 140, 56, { rot: 0.4, seed: 43 });
  sk.ink(curve([[352, 108], [362, 96], [378, 90]]), { w: 5, color: C.gray, seed: 44, wob: 0.3 });
  sk.ink(curve([[344, 140], [350, 128], [360, 120]]), { w: 5, color: C.gray, seed: 45, wob: 0.3 });
  sk.ink(curve([[130, 492], [206, 496], [282, 492]]), { w: 6, color: C.green, seed: 46, wob: 1 });
  return sk;
}

// 노래: 마이크 잡고 열창
function sing() {
  const sk = new Sk(S, S, { id: "sd" });
  const fx = 262, fy = 486, fs = 0.82;
  const P = pose({ tilt: 0.1, elR: [94, -284], haR: [54, -320], elL: [-98, -338], haL: [-178, -386], knL: [-30, -108], ftL: [-74, 0], knR: [30, -108], ftR: [74, 0] });
  drawFigure(sk, fx, fy, fs, P, { ...kid("sing"), hands: "L" });
  const hx = fx + fs * 54, hy = fy - fs * 320;
  sk.ink(dense([[hx + 6, hy + 10], [hx - 12, hy - 24]]), { w: 11, seed: 51, wob: 0.4 });
  const mic = circ(hx - 18, hy - 36, 17, { over: 0.2, seed: 52 });
  sk.fill(mic, "#8A93A6", { dx: 0.6, dy: 0.8, wob: 0.5, seed: 53 }); sk.ink(mic, { w: 7, seed: 54, wob: 0.5 });
  handDot(sk, [hx, hy], C.skin, 55, 12);
  note(sk, 70, 150, 1.25, { color: C.teal, rot: -0.2, seed: 56 });
  note(sk, 430, 96, 1.45, { color: C.red, rot: 0.15, seed: 60 });
  note(sk, 452, 250, 1.05, { color: C.orange, rot: -0.1, seed: 64 });
  note(sk, 92, 312, 0.95, { color: C.blue, rot: 0.2, seed: 68 });
  return sk;
}

// 낮잠: 베개에 머리를 대고 쿨쿨 (글자 대신 코 방울)
function nap() {
  const sk = new Sk(S, S, { id: "se" });
  const pil = rrect(58, 150, 396, 214, 56);
  sk.fill(pil, "#DCE9F7", { seed: 71, tex: true }); sk.ink(pil, { w: 11, seed: 72 });
  sk.at(250, 250, 1.12, () => drawHead(sk, kid("sleepy", { seed: 21 })), 0.2);
  const top = curve([[-10, 392], [90, 372], [256, 388], [420, 368], [522, 388]], false, 5);
  const bl = [...top, [522, 522], [-10, 522], top[0]];
  sk.fill(bl, C.teal, { seed: 73, tex: true, dx: 0, dy: 0 }); sk.ink(top, { w: 11, seed: 74 });
  handDot(sk, [176, 384], C.skin, 75, 17); handDot(sk, [330, 380], C.skin, 77, 17);
  const bub = circ(352, 296, 24, { over: 0.2, seed: 79 });
  sk.fill(bub, "#DDF1FB", { dx: 0, dy: 0, wob: 0.5, seed: 80, alpha: 0.85 }); sk.ink(bub, { w: 6, color: C.blue, seed: 81, wob: 0.5 });
  sk.ink(curve([[336, 286], [342, 280], [350, 280]]), { w: 4, color: C.white, seed: 82, wob: 0.2 });
  sk.ink(curve([[402, 96], [418, 84], [436, 96], [452, 84]]), { w: 5, color: C.gray, seed: 83, wob: 0.3 });
  sk.ink(curve([[438, 132], [450, 124], [462, 132]]), { w: 5, color: C.gray, seed: 84, wob: 0.3 });
  return sk;
}

// 아차!: 시계를 보고 깜짝
function oops() {
  const sk = new Sk(S, S, { id: "sf" });
  clock(sk, 420, 108, 76, { h: 8, m: 52, seed: 91 });
  const fx = 204, fy = 486, fs = 0.82;
  const P = pose({ tilt: -0.06, elL: [-112, -330], haL: [-96, -404], elR: [112, -330], haR: [96, -404], knL: [-34, -108], ftL: [-58, 0], knR: [34, -108], ftR: [58, 0] });
  drawFigure(sk, fx, fy, fs, P, { ...kid("shock"), look: 0.5 });
  drop(sk, 74, 96, 1.1, { rot: -0.5 });
  drop(sk, 300, 44, 0.85, { rot: 0.4 });
  emark(sk, 336, 268, 1.0, { color: C.red });
  return sk;
}

// 화면 좌표로 잡은 관절을 인물 좌표(발 사이 원점, 배율 s)로 바꾼다. 걸터앉은 자세처럼 화면에서 자리를 잡는 편이 쉬울 때 쓴다.
const local = (ox, oy, s, j) => Object.fromEntries(Object.entries(j).map(([k, v]) => [k, Array.isArray(v) ? [(v[0] - ox) / s, (v[1] - oy) / s] : v]));
const blk = (sk, x, y, w, h, c, sd, o = {}) => { const p = poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 4); sk.fill(p, c, { dx: 0, dy: 0, wob: 0.8, seed: sd, ...o }); return p; };

// 티비: 소파에 걸터앉아 리모컨 꾹
function tv() {
  const sk = new Sk(S, S, { id: "sh" });
  // 옛날 티비
  sk.ink(dense([[122, 198], [86, 138]]), { w: 8, seed: 201 }); sk.ink(dense([[122, 198], [164, 134]]), { w: 8, seed: 202 });
  sk.ink(dense([[62, 344], [52, 384]]), { w: 10, seed: 203 }); sk.ink(dense([[184, 344], [194, 384]]), { w: 10, seed: 204 });
  const body = rrect(26, 196, 196, 152, 20);
  sk.fill(body, "#E9A93C", { seed: 205, tex: true }); sk.ink(body, { w: 11, seed: 206 });
  const scr = rrect(42, 212, 128, 104, 14);
  sk.fill(scr, "#CFEAF7", { seed: 207, dx: 0, dy: 0 });
  blk(sk, 50, 222, 34, 84, C.red, 208); blk(sk, 88, 222, 34, 84, C.yellow, 209); blk(sk, 126, 222, 36, 84, C.teal, 210);
  sk.ink(scr, { w: 9, seed: 211 });
  sk.dot(196, 236, 8); sk.dot(196, 266, 8);
  // 소파
  const back = rrect(262, 236, 236, 150, 34);
  sk.fill(back, "#F08A6C", { seed: 212, tex: true }); sk.ink(back, { w: 11, seed: 213 });
  const seat = rrect(246, 346, 262, 78, 26);
  sk.fill(seat, "#F6A98E", { seed: 214, tex: true }); sk.ink(seat, { w: 11, seed: 215 });
  sk.ink(dense([[276, 424], [272, 452]]), { w: 10, seed: 216 }); sk.ink(dense([[478, 424], [482, 452]]), { w: 10, seed: 217 });
  // 주인공
  const ox = 330, oy = 452, fs = 0.72;
  const P = pose(local(ox, oy, fs, { hip: [392, 352], neck: [398, 262], head: [398, 196], knL: [338, 364], ftL: [324, 452], knR: [356, 372], ftR: [350, 452],
    elL: [352, 304], haL: [300, 292], elR: [442, 312], haR: [462, 346], tilt: -0.05 }));
  drawFigure(sk, ox, oy, fs, P, { ...kid("happy"), look: -0.8, hands: "R" });
  const rm = poly([[270, 280], [304, 286], [300, 302], [266, 296]], 3);
  sk.fill(rm, "#5B6475", { dx: 0, dy: 0, wob: 0.4, seed: 218 }); sk.ink(rm, { w: 7, seed: 219, wob: 0.5 });
  handDot(sk, [302, 294], C.skin, 220, 11);
  sk.ink(curve([[250, 276], [242, 286], [248, 298]]), { w: 5, color: C.gray, seed: 221, wob: 0.3 });
  sk.ink(curve([[236, 268], [224, 286], [234, 306]]), { w: 5, color: C.gray, seed: 222, wob: 0.3 });
  return sk;
}

// 폰: 책상다리로 앉아 낄낄
function phone() {
  const sk = new Sk(S, S, { id: "si" });
  const fx = 256, fy = 474, fs = 1.1;
  const P = pose({ hip: [0, -36], neck: [0, -164], head: [0, -258], knL: [-100, -36], ftL: [30, -4], knR: [100, -36], ftR: [-30, -4],
    elL: [-82, -110], haL: [-30, -96], elR: [82, -110], haR: [30, -96] });
  drawFigure(sk, fx, fy, fs, P, { ...kid("happy"), hands: false });
  const ph = rrect(228, 318, 56, 92, 11);
  sk.fill(ph, "#39424E", { seed: 231, dx: 1, dy: 1.2 });
  sk.fill(rrect(236, 328, 40, 66, 6), "#9FD8F5", { seed: 232, dx: 0, dy: 0, wob: 0.6 });
  sk.ink(ph, { w: 9, seed: 233 });
  handDot(sk, [224, 372], C.skin, 234, 15); handDot(sk, [288, 372], C.skin, 236, 15);
  heart(sk, 92, 170, 1.15, { seed: 238, rot: -0.2 });
  heart(sk, 424, 132, 0.95, { seed: 240, rot: 0.25 });
  heart(sk, 436, 268, 0.7, { seed: 242, color: "#F79AA9" });
  sk.ink(curve([[112, 300], [100, 312], [104, 328]]), { w: 5, color: C.gray, seed: 244, wob: 0.3 });
  sk.ink(curve([[402, 318], [414, 330], [410, 346]]), { w: 5, color: C.gray, seed: 245, wob: 0.3 });
  return sk;
}

// 만화책: 엎드려 발을 까딱이며
function comics() {
  const sk = new Sk(S, S, { id: "sj" });
  // 몸과 다리
  sk.ink(curve([[262, 296], [340, 318], [420, 328]]), { w: 14, seed: 251 });
  sk.ink(curve([[420, 328], [470, 320], [452, 228]]), { w: 13, seed: 252 });
  sk.ink(curve([[420, 328], [486, 336], [494, 246]]), { w: 13, seed: 253 });
  sk.ink(curve([[430, 202], [440, 190], [454, 192]]), { w: 5, color: C.gray, seed: 254, wob: 0.3 });
  sk.ink(curve([[482, 214], [496, 206], [508, 212]]), { w: 5, color: C.gray, seed: 255, wob: 0.3 });
  // 팔: 한 손은 턱을 괴고 한 손은 책장을 넘긴다
  sk.ink(curve([[262, 304], [262, 388], [214, 356]]), { w: 13, seed: 256 });
  sk.ink(curve([[270, 304], [318, 392], [286, 416]]), { w: 13, seed: 257 });
  sk.at(176, 230, 1.02, () => drawHead(sk, kid("happy", { seed: 21 })), -0.08);
  handDot(sk, [212, 352], C.skin, 258, 15);
  // 펼친 만화책(칸마다 색)
  openBook(sk, 176, 470, 1.5, { color: C.red, seed: 259, lines: false });
  blk(sk, 78, 396, 40, 26, C.yellow, 261); blk(sk, 124, 392, 40, 26, C.teal, 262); blk(sk, 78, 428, 86, 22, "#BFE2F4", 263);
  blk(sk, 190, 392, 40, 26, C.orange, 264); blk(sk, 236, 396, 40, 26, "#BFE2F4", 265); blk(sk, 190, 428, 86, 22, C.lemon, 266);
  handDot(sk, [288, 416], C.skin, 267, 15);
  // 쌓아 둔 만화책
  [[C.blue, 0], [C.yellow, 10], [C.teal, -6]].forEach(([c, dx], i) => { const b = rrect(372 + dx, 440 - i * 28, 120, 26, 6); sk.fill(b, c, { seed: 270 + i, tex: true, texAng: 0.02 }); sk.ink(b, { w: 8, seed: 274 + i }); });
  return sk;
}

// 컴퓨터: 책상 앞에 걸터앉아 타닥타닥
function computer() {
  const sk = new Sk(S, S, { id: "sk" });
  // 의자
  sk.ink(dense([[116, 364], [106, 250]]), { w: 11, seed: 281 });
  sk.ink(dense([[112, 364], [214, 364]]), { w: 12, seed: 282 });
  sk.ink(dense([[164, 366], [164, 440]]), { w: 11, seed: 283 });
  sk.ink(dense([[126, 442], [204, 442]]), { w: 11, seed: 284 });
  // 주인공
  const ox = 232, oy = 442, fs = 0.72;
  const P = pose(local(ox, oy, fs, { hip: [170, 352], neck: [186, 262], head: [194, 196], knL: [240, 362], ftL: [246, 442], knR: [228, 368], ftR: [228, 442],
    elL: [240, 306], haL: [284, 310], elR: [232, 312], haR: [306, 312], tilt: 0.05 }));
  drawFigure(sk, ox, oy, fs, P, { ...kid("happy"), look: 0.8 });
  // 책상, 모니터, 자판
  sk.ink(dense([[486, 340], [486, 452]]), { w: 11, seed: 285 });
  const top = rrect(254, 324, 252, 22, 8);
  sk.fill(top, C.woodLight, { seed: 286, tex: true, texAng: 0.02 }); sk.ink(top, { w: 10, seed: 287 });
  sk.ink(dense([[420, 290], [420, 322]]), { w: 11, seed: 288 });
  sk.ink(dense([[392, 322], [448, 322]]), { w: 11, seed: 289 });
  const mon = rrect(342, 176, 156, 116, 12);
  sk.fill(mon, "#2B3A67", { seed: 290, tex: true });
  blk(sk, 358, 194, 54, 36, C.teal, 291); blk(sk, 420, 194, 62, 16, C.yellow, 292); blk(sk, 420, 216, 62, 14, "#BFE2F4", 293); blk(sk, 358, 240, 124, 34, C.red, 294);
  sk.ink(mon, { w: 11, seed: 295 });
  const kb = rrect(262, 306, 92, 18, 6);
  sk.fill(kb, "#C9CED6", { seed: 296, dx: 0.6, dy: 0.8 }); sk.ink(kb, { w: 8, seed: 297 });
  sk.ink(curve([[300, 268], [308, 256], [320, 252]]), { w: 5, color: C.gray, seed: 298, wob: 0.3 });
  sk.ink(curve([[282, 278], [286, 262], [296, 254]]), { w: 5, color: C.gray, seed: 299, wob: 0.3 });
  return sk;
}

// 과자: 봉지를 끌어안고 와작와작
function snack() {
  const sk = new Sk(S, S, { id: "sl" });
  const fx = 252, fy = 486, fs = 0.82;
  const P = pose({ elL: [-86, -262], haL: [-22, -226], elR: [84, -300], haR: [40, -370], knL: [-28, -108], ftL: [-60, 0], knR: [28, -108], ftR: [60, 0], tilt: 0.05 });
  drawFigure(sk, fx, fy, fs, P, {
    ...kid("happy"), hands: false,
    under: () => { // 끌어안은 과자 봉지 (팔보다 뒤)
      const bag = curve([[-92, -330], [-8, -338], [-2, -330], [0, -196], [-8, -188], [-92, -186], [-100, -196], [-102, -322]], true, 4);
      sk.fill(bag, C.red, { seed: 301, tex: true }); sk.ink(bag, { w: 10, seed: 302 });
      sk.ink(dense([[-96, -318], [-84, -326], [-70, -316], [-56, -326], [-42, -316], [-28, -326], [-14, -316], [-4, -324]], 3), { w: 6, seed: 300, wob: 0.3 });
      const band = poly([[-100, -288], [0, -292], [0, -246], [-100, -242]], 4);
      sk.fill(band, C.yellow, { dx: 0, dy: 0, wob: 0.8, seed: 303 }); sk.ink(band, { w: 6, seed: 304, wob: 0.6 });
    },
  });
  const hx = fx + fs * 40, hy = fy - fs * 370;
  const chip = ell(hx - 16, hy - 6, 17, 11);
  sk.fill(chip, C.lemon, { dx: 0, dy: 0, wob: 0.4, seed: 305 }); sk.ink(chip, { w: 6, seed: 306, wob: 0.4 });
  handDot(sk, [hx, hy], C.skin, 307, 12.5);
  handDot(sk, [fx - fs * 22, fy - fs * 226], C.skin, 309, 12.5);
  for (const [x, y, i] of [[330, 196, 0], [346, 222, 1], [318, 232, 2], [352, 176, 3]]) sk.dot(x, y, 4.5 - i * 0.4, "#E0A93A");
  // 바닥의 봉지와 음료
  const b2 = curve([[60, 404], [128, 396], [136, 476], [58, 482]], true, 4);
  sk.fill(b2, C.blue, { seed: 311, tex: true }); sk.ink(b2, { w: 9, seed: 312 });
  sk.fill(ell(96, 440, 20, 16), C.white, { dx: 0, dy: 0, wob: 0.4, seed: 313 });
  const cup = poly([[392, 404], [448, 404], [440, 484], [400, 484]], 4);
  sk.fill(cup, C.teal, { seed: 314, tex: true }); sk.ink(cup, { w: 9, seed: 315 });
  sk.ink(dense([[424, 402], [436, 352], [456, 346]], 3), { w: 7, color: C.red, seed: 316, wob: 0.4 });
  return sk;
}

// 친구: 짝! 손뼉 마주치기
function friends() {
  const sk = new Sk(S, S, { id: "sm" });
  const fs = 0.66, y = 486;
  const A = pose({ elR: [100, -388], haR: [160, -506], elL: [-56, -262], haL: [-22, -222], tilt: -0.04, knL: [-26, -108], ftL: [-56, 0], knR: [26, -108], ftR: [52, 0] });
  const B = pose({ elL: [-100, -388], haL: [-160, -506], elR: [62, -272], haR: [96, -212], tilt: 0.04, knL: [-26, -108], ftL: [-52, 0], knR: [26, -108], ftR: [56, 0] });
  drawFigure(sk, 150, y, fs, A, { ...kid("happy"), look: 0.5 });
  drawFigure(sk, 362, y, fs, B, { hair: "bob", hairColor: "#3F322C", face: "happy", look: -0.5, seed: 51 });
  sparkle(sk, 256, 104, 24, { seed: 321 });
  rays(sk, 256, 150, 40, 62, 5, { a0: -2.7, a1: -0.44, color: C.orange, w: 7 });
  return sk;
}

// 자전거: 씽씽
function bike() {
  const sk = new Sk(S, S, { id: "sn" });
  const wheel = (cx, cy, r, sd) => {
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 6 + 0.2; sk.ink(dense([[cx - r * Math.cos(a), cy - r * Math.sin(a)], [cx + r * Math.cos(a), cy + r * Math.sin(a)]]), { w: 3.5, color: C.gray, seed: sd + i, wob: 0.3 }); }
    sk.ink(circ(cx, cy, r, { over: 0.15, seed: sd + 8 }), { w: 12, seed: sd + 9, color: "#3A3D44" });
    sk.dot(cx, cy, 7, "#3A3D44");
  };
  wheel(140, 404, 76, 331); wheel(388, 404, 76, 345);
  // 뒤쪽 다리(자전거 뒤)
  sk.ink(curve([[214, 286], [236, 356], [226, 400]]), { w: 12, seed: 359 });
  const F = { w: 12, color: C.red, wob: 1 };
  sk.ink(dense([[140, 404], [218, 300]]), { ...F, seed: 360 });
  sk.ink(dense([[140, 404], [252, 404]]), { ...F, seed: 361 });
  sk.ink(dense([[218, 300], [252, 404]]), { ...F, seed: 362 });
  sk.ink(dense([[218, 300], [352, 310]]), { ...F, seed: 363 });
  sk.ink(dense([[252, 404], [352, 310]]), { ...F, seed: 364 });
  sk.ink(dense([[346, 266], [352, 310], [388, 404]], 4), { w: 11, color: "#8A93A6", seed: 365, wob: 0.8 });
  sk.ink(dense([[328, 268], [366, 260]]), { w: 11, color: "#3A3D44", seed: 366, wob: 0.4 });
  const seat = ell(212, 290, 26, 9);
  sk.fill(seat, "#3A3D44", { dx: 0, dy: 0, wob: 0.4, seed: 367 }); sk.ink(seat, { w: 6, seed: 368, color: "#3A3D44", wob: 0.4 });
  sk.ink(dense([[252, 404], [270, 430]]), { w: 9, color: "#3A3D44", seed: 369, wob: 0.3 });
  sk.ink(dense([[258, 432], [284, 428]]), { w: 9, color: "#3A3D44", seed: 370, wob: 0.3 });
  // 주인공
  const ox = 270, oy = 430, fs = 0.7;
  const P = pose(local(ox, oy, fs, { hip: [214, 284], neck: [268, 204], head: [294, 138], knR: [274, 344], ftR: [270, 428], knL: [214, 284], ftL: [214, 284],
    elR: [312, 240], haR: [346, 264], elL: [306, 232], haL: [344, 262], tilt: 0.14 }));
  drawFigure(sk, ox, oy, fs, P, { ...kid("happy"), look: 0.9 });
  for (const [x, y, l, i] of [[20, 236, 70, 0], [8, 286, 90, 1], [28, 336, 60, 2]]) sk.ink(dense([[x, y], [x + l, y]]), { w: 6, color: C.gray, seed: 371 + i, wob: 0.6 });
  return sk;
}

// 강아지: 공 던지고 놀기
function dog() {
  const sk = new Sk(S, S, { id: "so" });
  const TAN = "#E8B978", BR = "#8A5A33";
  // 강아지 (오른쪽을 보고 펄쩍)
  sk.ink(curve([[70, 388], [44, 362], [52, 330]]), { w: 12, seed: 381, color: C.ink });
  sk.ink(dense([[92, 410], [78, 458]]), { w: 12, seed: 382 }); sk.ink(dense([[118, 414], [124, 460]]), { w: 12, seed: 383 });
  sk.ink(dense([[176, 392], [206, 420]]), { w: 12, seed: 384 }); sk.ink(dense([[188, 380], [226, 394]]), { w: 12, seed: 385 });
  const body = curve([[62, 398], [84, 368], [150, 346], [196, 356], [204, 386], [176, 410], [104, 424], [72, 418]], true, 4);
  sk.fill(body, TAN, { seed: 386, tex: true }); sk.ink(body, { w: 11, seed: 387 });
  const head = circ(214, 312, 44, { over: 0.2, seed: 388 });
  sk.fill(head, TAN, { seed: 389 }); sk.ink(head, { w: 11, seed: 390 });
  const snout = ell(250, 326, 24, 17);
  sk.fill(snout, "#F6DDB8", { dx: 0, dy: 0, wob: 0.5, seed: 391 }); sk.ink(snout, { w: 8, seed: 392, wob: 0.5 });
  sk.dot(268, 318, 7); sk.dot(226, 304, 6);
  const ear = curve([[182, 284], [206, 276], [204, 314], [184, 336], [170, 312]], true, 3);
  sk.fill(ear, BR, { dx: 0.6, dy: 0.8, wob: 0.5, seed: 393 }); sk.ink(ear, { w: 8, seed: 394, wob: 0.5 });
  const tongue = curve([[244, 340], [258, 340], [256, 358], [246, 360]], true, 3);
  sk.fill(tongue, "#F0627A", { dx: 0, dy: 0, wob: 0.3, seed: 395 }); sk.ink(tongue, { w: 5, seed: 396, wob: 0.3 });
  // 주인공: 공을 던진다
  const fx = 376, fy = 486, fs = 0.74;
  const P = pose({ elL: [-96, -340], haL: [-168, -410], elR: [64, -270], haR: [104, -214], tilt: -0.06, knL: [-28, -108], ftL: [-58, 0], knR: [28, -108], ftR: [56, 0] });
  drawFigure(sk, fx, fy, fs, P, { ...kid("happy"), look: -0.7 });
  const bl = circ(176, 150, 26, { over: 0.2, seed: 397 });
  sk.fill(bl, C.lemon, { dx: 1, dy: 1.2, wob: 0.5, seed: 398 }); sk.ink(bl, { w: 8, seed: 399, wob: 0.5 });
  sk.ink(curve([[160, 136], [176, 148], [194, 142]]), { w: 4, color: C.white, seed: 400, wob: 0.3 });
  sk.ink(curve([[236, 176], [212, 160], [200, 158]]), { w: 6, color: C.gray, seed: 401, wob: 0.4, dash: [12, 10] });
  heart(sk, 96, 250, 0.9, { seed: 402, rot: -0.2 });
  heart(sk, 250, 396, 0.6, { seed: 404, rot: 0.2, color: "#F79AA9" });
  return sk;
}

// 정착 컷: 머리띠 질끈, 책상 앞 상체
export function study() {
  const sk = new Sk(S, S, { id: "sg" });
  const fs = 1.28, hx = 256, hy = 206, fy = hy + 436 * fs;
  const P = pose({ elL: [-88, -292], haL: [-112, -360], elR: [88, -292], haR: [112, -360] });
  drawFigure(sk, hx, fy, fs, P, { ...kid("determined"), band: true, hands: false });
  handDot(sk, [hx - fs * 112, fy - fs * 360], C.skin, 101, 24);
  handDot(sk, [hx + fs * 112, fy - fs * 360], C.skin, 103, 24);
  // 불끈 쥔 주먹 옆 힘 표시
  sk.ink(curve([[70, 300], [58, 316], [60, 336]]), { w: 6, color: C.red, seed: 105, wob: 0.3 });
  sk.ink(curve([[442, 300], [454, 316], [452, 336]]), { w: 6, color: C.red, seed: 106, wob: 0.3 });
  // 책상
  const desk = poly([[-10, 416], [522, 416], [522, 522], [-10, 522]], 5);
  sk.fill(desk, C.woodLight, { seed: 107, tex: true, texAng: 0.02, dx: 0, dy: 0 });
  sk.ink(dense([[-10, 416], [522, 416]], 5), { w: 11, seed: 108 });
  openBook(sk, 244, 500, 1.3, { color: C.teal, seed: 109 });
  pencil(sk, 432, 470, 1, { rot: -0.5, seed: 113 });
  return sk;
}

// 넘기는 순서: 현행 플립북과 같은 흐름(먹고, 보고, 놀다가 … 아차! → 공부하자!)
export function frames() {
  return [
    { name: "eat", sk: eat() }, { name: "tv", sk: tv() }, { name: "phone", sk: phone() }, { name: "game", sk: game() },
    { name: "comics", sk: comics() }, { name: "computer", sk: computer() }, { name: "nap", sk: nap() }, { name: "snack", sk: snack() },
    { name: "friends", sk: friends() }, { name: "sing", sk: sing() }, { name: "kick", sk: kick() }, { name: "bike", sk: bike() },
    { name: "dog", sk: dog() }, { name: "oops", sk: oops() },
    { name: "study", sk: study() },
  ];
}
