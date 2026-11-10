// 스플래시 플립북: 놀이 컷 여섯 장 + "공부하자!" 정착 컷. 표정이 있는 그림이다.
// 주인공은 만화의 쌤과 같은 얼굴(삐친 머리 + 둥근 안경)에 가운만 벗은 모습.
// 머리 크기와 자리를 컷마다 비슷하게 두어, 넘길 때 한 사람이 이것저것 하는 것처럼 보이게 한다.
// 그림 속 글자는 머리띠의 "공부하자!" 하나뿐이다(획으로 긋는다).
import { Sk, C, curve, dense, circ, ell, poly, rrect, squiggle, emark, sparkle, drop } from "../lib/sk.mjs";
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

export function frames() {
  return [
    { name: "eat", sk: eat() }, { name: "game", sk: game() }, { name: "kick", sk: kick() },
    { name: "sing", sk: sing() }, { name: "nap", sk: nap() }, { name: "oops", sk: oops() },
    { name: "study", sk: study() },
  ];
}
