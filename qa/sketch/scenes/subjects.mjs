// 과목 카드 그림 4종: 스틱맨 쌤 상반신 + 그 과목의 소품(플라스크, 삼각자, 지구본, 두루마리).
// 카드의 64px 둥근 칸에 들어가므로 작은 그림용 설정(떨림 줄이고 선 굵게)으로 뽑는다. 글자는 넣지 않는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, sparkle } from "../lib/sk.mjs";
import { drawHead, handDot, TEACHER } from "../lib/figure.mjs";

const SMALL = { wobK: 0.45, lwK: 1.06, tex: false, tol: 0.2 };

function base(id, face, look = 0) {
  const sk = new Sk(240, 240, { id, ...SMALL });
  const sh = curve([[-40, 270], [-24, 236], [18, 220], [62, 214], [92, 222], [122, 214], [166, 220], [208, 236], [224, 270]], false, 4);
  sk.fill([...sh, sh[0]], C.white, { dx: 0, dy: 0, wob: 0.6, seed: 201 });
  sk.ink(sh, { w: 11, seed: 202, wob: 1 });
  sk.at(92, 124, 0.8, () => drawHead(sk, { ...TEACHER, face, look }), -0.04);
  return sk;
}

function sci() {
  const sk = base("ja", "happy", 0.3);
  // 삼각 플라스크: 청록 용액과 방울
  const body = curve([[178, 118], [178, 152], [144, 214], [152, 228], [226, 228], [234, 214], [200, 152], [200, 118]], false, 3);
  const liquid = poly([[160, 186], [218, 186], [234, 214], [226, 228], [152, 228], [144, 214]], 3);
  sk.fill([...body, body[0]], C.white, { dx: 0, dy: 0, wob: 0.4, seed: 211 });
  sk.fill(liquid, C.teal, { dx: 0, dy: 0, wob: 0.6, seed: 212 });
  sk.ink(body, { w: 10, seed: 213 });
  sk.ink(dense([[170, 116], [208, 116]]), { w: 10, seed: 214 });
  for (const [x, y, r, i] of [[190, 96, 8, 0], [206, 76, 6, 1], [184, 62, 5, 2]]) { const b = circ(x, y, r, { over: 0.2, seed: 215 + i }); sk.fill(b, "#BFEDE6", { dx: 0, dy: 0, wob: 0.2 }); sk.ink(b, { w: 5, color: C.teal, seed: 218 + i, wob: 0.3 }); }
  handDot(sk, [160, 206], C.skin, 221, 15);
  return sk;
}

function math() {
  const sk = base("jb", "curious", 0.3);
  // 노란 삼각자
  const tri = poly([[150, 226], [232, 226], [232, 104]], 4);
  sk.fill(tri, C.yellow, { dx: 0, dy: 0, wob: 0.6, seed: 231 });
  const hole = poly([[186, 208], [216, 208], [216, 164]], 3);
  sk.fill(hole, "#FFF6D6", { dx: 0, dy: 0, wob: 0.4, seed: 232 });
  sk.ink(hole, { w: 6, seed: 233, wob: 0.5 });
  sk.ink(tri, { w: 10, seed: 234 });
  for (let i = 0; i < 4; i++) sk.ink(dense([[162 + i * 16, 226], [162 + i * 16, 214]]), { w: 5, seed: 235 + i, wob: 0.2 });
  handDot(sk, [160, 204], C.skin, 241, 15);
  return sk;
}

function soc() {
  const sk = base("jc", "smile", 0.3);
  // 지구본
  sk.ink(curve([[146, 156], [150, 216], [196, 232]]), { w: 9, seed: 251 });
  sk.ink(dense([[172, 236], [226, 236]]), { w: 10, seed: 252 });
  const g = circ(192, 158, 46, { over: 0.2, seed: 253 });
  sk.fill(g, "#7CC4F0", { dx: 0, dy: 0, wob: 0.5, seed: 254 });
  const l1 = curve([[168, 132], [188, 122], [204, 134], [198, 152], [180, 160], [166, 150]], true, 3);
  const l2 = curve([[202, 168], [222, 166], [226, 182], [210, 194], [198, 184]], true, 3);
  sk.fill(l1, C.green, { dx: 0, dy: 0, wob: 0.4, seed: 255 }); sk.fill(l2, C.green, { dx: 0, dy: 0, wob: 0.4, seed: 256 });
  sk.ink(g, { w: 10, seed: 257 });
  handDot(sk, [150, 212], C.skin, 261, 15);
  return sk;
}

function his() {
  const sk = base("jd", "curious", 0.3);
  // 두루마리
  const paper = poly([[150, 122], [226, 122], [226, 212], [150, 212]], 4);
  sk.fill(paper, C.parchment, { dx: 0, dy: 0, wob: 0.6, seed: 271 });
  sk.ink(paper, { w: 9, seed: 272 });
  for (let i = 0; i < 3; i++) sk.ink(dense([[164, 146 + i * 18], [i === 2 ? 196 : 212, 146 + i * 18]]), { w: 5, color: "#B49A6A", seed: 273 + i, wob: 0.4 });
  for (const [y, i] of [[116, 0], [218, 1]]) { const r = rrect(140, y - 10, 96, 20, 10); sk.fill(r, "#E6D3A3", { dx: 0, dy: 0, wob: 0.4, seed: 277 + i }); sk.ink(r, { w: 9, seed: 279 + i }); }
  handDot(sk, [152, 200], C.skin, 281, 15);
  sparkle(sk, 216, 84, 11, { seed: 283, w: 5 });
  return sk;
}

export function subjects() {
  return [{ name: "sci", sk: sci() }, { name: "math", sk: math() }, { name: "soc", sk: soc() }, { name: "his", sk: his() }];
}
