// 막대 인물: 큰 둥근 머리 + 짧은 몸통 + 가는 팔다리. 영상 샘플(src/figure.js)과 같은 비례다.
// 만화에서 쌤, 학생, 이름 없는 인물은 얼굴을 비우고(face 없음) 머리 모양, 모자, 안경, 옷으로 구분한다.
// 이름 있는 실존 인물(린드, 훅, 다윈 등)만 작은 얼굴(mini: 점 눈 + 짧은 입)을 켠다.
// 스플래시, 원형 아바타, 로그인 그림에서는 같은 인물에 face 를 켠다.
// 좌표는 발 사이가 원점, 위쪽이 음수. 자세는 관절 좌표 묶음이다.
import { C, curve, dense, circ, ell, poly, rrect, lerp, lerp2, TAU, mix } from "./sk.mjs";

export const R = 100; // 머리 반지름. 키는 약 536 (머리가 키의 37%)
const PI = Math.PI;
const LW = 13; // 머리 반지름 100일 때의 선 굵기

export function pose(over = {}) {
  return {
    hip: [0, -212], neck: [0, -342], head: [0, -436],
    elL: [-38, -258], haL: [-56, -184], elR: [38, -258], haR: [56, -184],
    knL: [-24, -106], ftL: [-50, 0], knR: [24, -106], ftR: [50, 0],
    tilt: 0, ...over,
  };
}
export function mixPose(a, b, k) {
  const o = {};
  for (const key in a) {
    const va = a[key], vb = b[key] ?? va;
    o[key] = Array.isArray(va) ? lerp2(va, vb, k) : lerp(va, vb, k);
  }
  return o;
}

export function handDot(sk, p, color, seed, r = 15) {
  sk.fill(circ(p[0], p[1], r - 1, { over: 0, seed }), color, { dx: 0.8, dy: 1, wob: 0.8, seed });
  sk.ink(circ(p[0], p[1], r, { seed: seed + 1, lump: 0.04 }), { w: Math.min(12, Math.max(6, r * 0.44)), wob: 0.6, seed });
}

const arcPts = (r, a0, a1) => {
  const n = Math.ceil(Math.abs(a1 - a0) * r / 5), out = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([r * Math.cos(a), r * Math.sin(a)]); }
  return out;
};
function capShape(sk, outer, inner, color, seed, lw = 11, soft = false, tex = true) {
  const pts = [...outer, ...(soft ? curve(inner, false, 4) : dense(inner, 4)), outer[0]];
  sk.fill(pts, color, { dx: 1.5, dy: 2, wob: 1.4, seed, tex });
  sk.ink(pts, { w: lw, wob: 1.3, seed: seed + 1 });
}

/* ---------- 작은 얼굴 (만화 속 실존 인물) ----------
   점 눈 두 개 + 짧은 입 하나. 표정은 입과 짧은 눈썹으로만 바꾼다. 볼 터치는 없다.
   kind: calm | smile | happy | wide | shock | curious | determined
   수염이 있으면 입은 수염에 가려 그리지 않는다. */
function drawMiniFace(sk, o, seed, look, g) {
  const kind = o.face;
  const ey = o.glasses ? g.ey : 12;
  const xl = (o.glasses ? -g.lx : -28) + look, xr = (o.glasses ? g.lx : 28) + look;
  const mx = (xl + xr) / 2, my = ey + 40;
  const lo = { w: 6, wob: 0.3 };
  const S = n => seed + 400 + n;
  const by = o.glasses ? -17 : 0; // 안경을 쓰면 눈썹을 안경테 위로 올린다
  const eyes = (dx = 0, dy = 0, big = 0) => { sk.dot(xl + dx, ey + dy, 5.2 + big * 0.35); sk.dot(xr + dx, ey + dy, 5.2 + big * 0.35); };
  const mouth = pts => { if (!o.beard) sk.ink(curve(pts, false, 2), { ...lo, seed: S(6) }); };
  const oMouth = (rx, ry) => { if (!o.beard) sk.ink(ell(mx, my + 4, rx, ry), { ...lo, w: 5, seed: S(8) }); };
  if (kind === "smile") { eyes(); mouth([[mx - 15, my - 2], [mx, my + 8], [mx + 15, my - 2]]); }
  else if (kind === "happy") { eyes(); mouth([[mx - 21, my - 5], [mx - 10, my + 8], [mx, my + 11], [mx + 10, my + 8], [mx + 21, my - 5]]); }
  else if (kind === "wide" || kind === "shock") { eyes(0, -2, kind === "shock" ? 4 : 3); oMouth(kind === "shock" ? 8 : 6, kind === "shock" ? 10 : 7.5); }
  else if (kind === "curious") {
    eyes(4, -2);
    sk.ink(dense([[xr - 7, ey - 24 + by], [xr + 13, ey - 29 + by]], 2), { ...lo, w: 5, seed: S(9) });
    mouth([[mx - 9, my + 5], [mx + 2, my + 3], [mx + 12, my - 2]]);
  }
  else if (kind === "determined") {
    eyes(0, 2);
    sk.ink(dense([[xl - 12, ey - 23 + by], [xl + 9, ey - 16 + by]], 2), { ...lo, w: 5.5, seed: S(10) });
    sk.ink(dense([[xr + 12, ey - 23 + by], [xr - 9, ey - 16 + by]], 2), { ...lo, w: 5.5, seed: S(11) });
    mouth([[mx - 12, my + 3], [mx, my + 5], [mx + 12, my + 2]]);
  }
  else { eyes(); mouth([[mx - 10, my], [mx, my + 4], [mx + 10, my]]); } // calm
}

/* ---------- 안경만 쓴 얼굴 (스플래시, 로그인 그림) ----------
   눈동자와 눈썹 없이 안경알이 눈 노릇을 한다. 볼 터치와 입 하나만 그린다. 안경 쓴 인물에만 쓴다(bare: true).
   o.mouth 가 있으면 face 대신 그 입 모양을 쓴다: flat | happy | sing | shock | wide | grin | 그 밖은 작은 웃음 */
function drawBareFace(sk, o, seed, look, g) {
  const kind = o.mouth ?? o.face;
  const mx = look, my = g.ey + 44;
  const lo = { w: 7, wob: 0.4 };
  if (o.blush !== false) for (const [bx, i] of [[-g.lx - 30 + look, 0], [g.lx + 30 + look, 1]]) sk.fill(ell(bx, g.ey + 34, 15, 10), "#F5A9A0", { dx: 0, dy: 0, wob: 0.5, seed: seed + 120 + i, alpha: 0.6 });
  const arc = (w, d) => sk.ink(curve([[mx - w, my - 1], [mx, my + d], [mx + w, my - 1]], false, 2), { ...lo, seed: seed + 103 });
  const hole = (rx, ry) => { const m = ell(mx, my + 6, rx, ry); sk.fill(m, "#7A2E2E", { dx: 0, dy: 0, wob: 0.3, seed: seed + 96 }); sk.ink(m, { ...lo, w: 6, seed: seed + 97 }); };
  if (kind === "flat") sk.ink(dense([[mx - 11, my + 2], [mx + 11, my + 2]], 2), { ...lo, seed: seed + 103 });
  else if (kind === "happy") arc(20, 12);
  else if (kind === "sing") hole(13, 16);
  else if (kind === "shock" || kind === "wide") hole(10, 13);
  else if (kind === "grin") arc(19, 11);
  else arc(16, 9);
}

/* ---------- 얼굴 (표정이 필요한 그림에서만) ----------
   kind: smile | happy | wide | curious | determined | sleepy | sing | shock
   ex: 두 눈의 x 자리, ey: 눈 높이 */
function drawFace(sk, kind, seed, ex, ey, o = {}) {
  const lo = { w: 7, wob: 0.4 };
  const eye = (x, y, r = 7.5) => sk.dot(x, y, r);
  const [xl, xr] = ex;
  const mx = (xl + xr) / 2;
  if (o.blush !== false) {
    for (const [bx, i] of [[xl - 30, 0], [xr + 30, 1]]) sk.fill(ell(bx, ey + 34, 15, 10), "#F5A9A0", { dx: 0, dy: 0, wob: 0.5, seed: seed + 120 + i, alpha: 0.6 });
  }
  if (kind === "smile") {
    eye(xl, ey); eye(xr, ey);
    sk.ink(curve([[mx - 19, ey + 42], [mx, ey + 54], [mx + 19, ey + 42]]), { ...lo, seed: seed + 91 });
  } else if (kind === "happy") {
    for (const [x, i] of [[xl, 0], [xr, 1]]) sk.ink(curve([[x - 13, ey + 5], [x, ey - 8], [x + 13, ey + 5]]), { ...lo, seed: seed + 89 + i });
    const m = curve([[mx - 22, ey + 38], [mx, ey + 42], [mx + 22, ey + 38], [mx + 14, ey + 56], [mx, ey + 62], [mx - 14, ey + 56]], true, 3);
    sk.fill(m, "#7A2E2E", { dx: 0, dy: 0, wob: 0.4, seed: seed + 92 });
    sk.ink(m, { ...lo, w: 6, seed: seed + 93 });
  } else if (kind === "wide" || kind === "shock") {
    const big = kind === "shock";
    eye(xl, ey, big ? 9 : 8.5); eye(xr, ey, big ? 9 : 8.5);
    for (const [x, i] of [[xl, 0], [xr, 1]]) sk.ink(curve([[x - 15, ey - 40], [x, ey - 47], [x + 15, ey - 40]]), { ...lo, w: 6, seed: seed + 94 + i });
    const m = ell(mx, ey + 50, big ? 13 : 10, big ? 17 : 13);
    sk.fill(m, "#7A2E2E", { dx: 0, dy: 0, wob: 0.4, seed: seed + 96 });
    sk.ink(m, { ...lo, w: 6, seed: seed + 97 });
  } else if (kind === "curious") {
    eye(xl + 4, ey - 3); eye(xr + 4, ey - 3);
    sk.ink(curve([[xr - 15, ey - 44], [xr + 2, ey - 52], [xr + 17, ey - 44]]), { ...lo, w: 6, seed: seed + 98 });
    sk.ink(dense([[xl - 15, ey - 36], [xl + 14, ey - 36]]), { ...lo, w: 6, seed: seed + 99 });
    sk.ink(curve([[mx - 13, ey + 50], [mx + 2, ey + 47], [mx + 15, ey + 40]]), { ...lo, seed: seed + 100 });
  } else if (kind === "determined") {
    eye(xl, ey + 2); eye(xr, ey + 2);
    sk.ink(dense([[xl - 20, ey - 44], [xl + 16, ey - 33]]), { ...lo, w: 7.5, seed: seed + 101 });
    sk.ink(dense([[xr + 20, ey - 44], [xr - 16, ey - 33]]), { ...lo, w: 7.5, seed: seed + 102 });
    sk.ink(curve([[mx - 17, ey + 44], [mx, ey + 53], [mx + 17, ey + 43]]), { ...lo, seed: seed + 103 });
  } else if (kind === "sleepy") {
    for (const [x, i] of [[xl, 0], [xr, 1]]) sk.ink(curve([[x - 13, ey - 2], [x, ey + 8], [x + 13, ey - 2]]), { ...lo, seed: seed + 104 + i });
    sk.ink(ell(mx + 2, ey + 48, 7, 8), { ...lo, w: 6, seed: seed + 106 });
  } else if (kind === "sing") {
    for (const [x, i] of [[xl, 0], [xr, 1]]) sk.ink(curve([[x - 13, ey + 5], [x, ey - 8], [x + 13, ey + 5]]), { ...lo, seed: seed + 107 + i });
    const m = ell(mx, ey + 50, 15, 19);
    sk.fill(m, "#7A2E2E", { dx: 0, dy: 0, wob: 0.4, seed: seed + 109 });
    sk.ink(m, { ...lo, w: 6, seed: seed + 110 });
  }
}

/// "공부하자!" 손글씨 (획을 마커 선으로 긋는다. 글꼴 파일이 필요 없다)
// 글자마다 제 자리와 기울기를 받아 머리띠의 굽은 띠를 따라 앉는다.
//   o.s: 글자 크기(글자 높이의 절반), o.y(x): 그 x 자리의 글줄 높이, o.rot(x): 그 자리의 기울기
export function studyLetters(sk, o = {}) {
  const s = o.s ?? 13, w = o.w ?? 0.34, col = o.color ?? C.ink;
  const yAt = o.y ?? (() => 0), rotAt = o.rot ?? (() => 0);
  const L = (pts, sd, cv) => sk.ink(cv ? curve(pts, false, 0.08) : dense(pts, 0.08), { w, color: col, wob: 0.03, seed: 300 + sd, freq: 1 });
  const O = (cx, cy, rx, ry, sd) => sk.ink(ell(cx, cy, rx, ry, -1.2, TAU - 1.0), { w, color: col, wob: 0.02, seed: 320 + sd, freq: 1 });
  // 글자 하나는 제 가운데가 원점이다
  const GLYPH = [
    [-4.05, () => { // 공
      L([[-0.6, -0.95], [0.55, -0.95], [0.45, -0.28]], 1);
      L([[-0.02, -0.3], [-0.02, 0.08]], 2);
      L([[-0.75, 0.1], [0.75, 0.1]], 3);
      O(0, 0.66, 0.5, 0.36, 1);
    }],
    [-2.08, () => { // 부
      L([[-0.5, -1.0], [-0.5, -0.2], [0.5, -0.2], [0.5, -1.0]], 4);
      L([[-0.5, -0.62], [0.5, -0.62]], 5);
      L([[-0.78, 0.2], [0.78, 0.2]], 6);
      L([[0, 0.2], [0, 1.0]], 7);
    }],
    [0.08, () => { // 하
      L([[-0.67, -0.98], [-0.25, -0.98]], 8);
      L([[-0.99, -0.6], [0.08, -0.6]], 9);
      O(-0.47, 0.2, 0.44, 0.48, 2);
      L([[0.53, -1.05], [0.53, 1.0]], 10);
      L([[0.53, -0.1], [0.98, -0.1]], 11);
    }],
    [2.36, () => { // 자
      L([[-0.98, -0.75], [0.07, -0.75]], 12);
      L([[-0.43, -0.72], [-0.58, 0.1], [-1.03, 0.75]], 13, true);
      L([[-0.46, -0.2], [-0.2, 0.35], [0.14, 0.72]], 14, true);
      L([[0.57, -1.05], [0.57, 1.0]], 15);
      L([[0.57, -0.1], [1.02, -0.1]], 16);
    }],
    [3.98, () => { // !
      L([[0.06, -1.05], [-0.04, 0.35]], 17);
      sk.dot(-0.06, 0.88, w * 0.72, col);
    }],
  ];
  for (const [gx, draw] of GLYPH) { const x = gx * s; sk.at(x, yAt(x), s, draw, rotAt(x)); }
}

/* ---------- 머리 (원점 = 머리 중심) ----------
   o.hair: sprout | short | cap | bob | bald | tricorn | kerchief | knit
   o.glasses: 둥근 안경, o.face: 표정, o.band: "공부하자!" 머리띠, o.look: 고개 방향(-1..1)
   o.flip = -1 이면 좌우 반전 */
export function drawHead(sk, o = {}) {
  const seed = o.seed ?? 11, style = o.hair ?? "sprout";
  const hairCol = o.hairColor ?? C.hair, capCol = o.capColor ?? C.yellow;
  const look = (o.look ?? 0) * 16;
  const tex = o.tex !== false;
  sk.save();
  sk.scale(o.flip ?? 1, 1);

  // 머리 뒤에 놓이는 것
  if (style === "bob") {
    const tail = curve([[78, -58], [128, -74], [150, -28], [138, 36], [112, 58], [104, 6], [86, -22]], true, 4);
    sk.fill(tail, hairCol, { dx: 1.5, dy: 2, wob: 1.3, seed: seed + 60, tex });
    sk.ink(tail, { w: 11, wob: 1.2, seed: seed + 61 });
  }

  if (style === "curls") {
    // 어깨까지 내려오는 곱슬 긴 머리(17세기 가발 느낌): 머리 뒤에 큰 덩어리
    const mass = curve([[0, -124], [64, -114], [116, -68], [138, 0], [142, 72], [124, 126], [88, 146], [54, 128], [62, 86], [0, 96], [-62, 86], [-54, 128], [-88, 146], [-124, 126], [-142, 72], [-138, 0], [-116, -68], [-64, -114]], true, 4);
    sk.fill(mass, hairCol, { dx: 1.5, dy: 2, wob: 1.6, seed: seed + 180, tex });
    sk.ink(mass, { w: 11, wob: 1.6, seed: seed + 181 });
    for (const sg of [-1, 1]) for (const [cy, i] of [[20, 0], [62, 1], [104, 2]]) sk.ink(curve([[sg * 104, cy - 14], [sg * 122, cy], [sg * 106, cy + 14]]), { w: 5, wob: 0.4, seed: seed + 182 + i, color: mix(hairCol, "#000000", 0.3) });
  }
  sk.fill(circ(0, 0, R - 3, { over: 0, seed: seed + 5 }), o.skin ?? C.skin, { dx: 2.2, dy: 2.6, wob: 1.8, seed: seed + 6 });
  sk.ink(circ(0, 0, R, { seed: seed + 5 }), { w: LW, wob: 1.3, seed: seed + 7 });

  // 머리카락
  if (style === "sprout" || style === "short") {
    const up = o.fringe ?? (o.glasses || o.band ? 24 : 0); // 안경이나 머리띠가 있으면 앞머리를 올린다
    const outer = arcPts(R + 8, PI - 0.12 - (up ? 0.16 : 0), TAU + 0.16 + (up ? 0.12 : 0));
    const e = outer[outer.length - 1], s0 = outer[0];
    // 안경이나 머리띠가 있으면 한쪽으로 넘긴 둥근 앞머리, 없으면 영상 샘플의 삐죽한 앞머리
    const z = up
      ? [[86, -40], [58, -70], [30, -60], [22, -44], [-6, -72], [-48, -72], [-84, -44]]
      : [[90, -6], [74, -46], [42, -12], [38, -12], [8, -56], [-36, -8], [-40, -8], [-80, -52], [-95, -4]];
    if (!up) { z[0] = [e[0] - 8, e[1] + 4]; z[z.length - 1] = [s0[0] + 8, s0[1] + 4]; }
    capShape(sk, outer, [e, ...z], hairCol, seed + 20, 11, true, tex);
  } else if (style === "cap") {
    const side = [[-104, -14], [-108, 22], [-92, 6], [-86, 30], [-70, -4], [-66, -30], [-104, -14]];
    sk.fill(dense(side, 4), hairCol, { dx: 1, dy: 1.5, wob: 0.9, seed: seed + 22 });
    sk.ink(dense(side, 4), { w: 9, wob: 0.9, seed: seed + 23 });
  } else if (style === "bob") {
    const outer = arcPts(R + 11, PI - 0.9, TAU + 0.9);
    const e = outer[outer.length - 1];
    capShape(sk, outer, [e, [78, 44], [74, -26], [46, -6], [14, -42], [-22, -12], [-56, -40], [-76, -22], [-80, 44], [-e[0], e[1]]], hairCol, seed + 20, 11, false, tex);
  } else if (style === "curls") {
    const outer = arcPts(R + 8, PI + 0.02, TAU - 0.02);
    const e = outer[outer.length - 1];
    capShape(sk, outer, [e, [74, -50], [40, -38], [4, -54], [-34, -38], [-74, -50]], hairCol, seed + 184, 11, true, tex);
  } else if (style === "tophat" || style === "gat") {
    // 모자 아래로 보이는 옆머리
    for (const sg of [-1, 1]) {
      const side = [[-104, -14], [-108, 22], [-92, 6], [-86, 30], [-70, -4], [-66, -30], [-104, -14]].map(([x, y]) => [sg * x, y]);
      sk.fill(dense(side, 4), hairCol, { dx: 1, dy: 1.5, wob: 0.9, seed: seed + 186 });
      sk.ink(dense(side, 4), { w: 9, wob: 0.9, seed: seed + 187 });
    }
  } else if (style === "tricorn") {
    // 귀 옆 가발 롤
    for (const sg of [-1, 1]) {
      for (const [cy, rr, i] of [[-4, 24, 0], [38, 21, 1]]) {
        const c = circ(sg * (96 + i * 2), cy, rr, { over: 0.25, seed: seed + 65 + i + (sg > 0 ? 4 : 0), lump: 0.05 });
        sk.fill(c, o.wigColor ?? C.wig, { dx: 1, dy: 1.4, wob: 0.8, seed: seed + 66 + i });
        sk.ink(c, { w: 9, wob: 0.8, seed: seed + 67 + i });
        sk.ink(curve([[sg * (88 + i * 2), cy - 6], [sg * (100 + i * 2), cy - 2], [sg * (96 + i * 2), cy + 9]]), { w: 5, wob: 0.4, seed: seed + 68 + i, color: "#B9B3A7" });
      }
    }
  }

  // 안경과 얼굴
  const ey = 8 + (o.lookY ?? 0), lx = 36, lr = 30; // lookY: 안경을 위아래로 조금 옮긴다(안경 올리기)
  if (o.glasses) {
    for (const [sg, i] of [[-1, 0], [1, 1]]) {
      sk.fill(circ(sg * lx + look, ey, lr - 2, { over: 0, seed: seed + 130 + i }), C.white, { dx: 0, dy: 0, wob: 0.6, seed: seed + 131 + i, alpha: 0.92 });
    }
  }
  if (o.face && o.bare) drawBareFace(sk, o, seed, look, { ey, lx });
  else if (o.face && o.mini) drawMiniFace(sk, o, seed, look, { ey, lx });
  else if (o.face) drawFace(sk, o.face, seed, o.glasses ? [-lx + look, lx + look] : [-30 + look, 30 + look], o.glasses ? ey : 10, { blush: o.blush });
  if (o.glasses) {
    for (const [sg, i] of [[-1, 0], [1, 1]]) sk.ink(circ(sg * lx + look, ey, lr, { seed: seed + 132 + i, lump: 0.03 }), { w: 8, wob: 0.7, seed: seed + 133 + i });
    sk.ink(curve([[-lx + lr + look - 1, ey - 5], [look, ey - 11], [lx - lr + look + 1, ey - 5]]), { w: 7, wob: 0.3, seed: seed + 135 });
    sk.ink(dense([[-lx - lr + look, ey - 3], [-R + 4, ey - 10]]), { w: 7, wob: 0.4, seed: seed + 136 });
    sk.ink(dense([[lx + lr + look, ey - 3], [R - 4, ey - 10]]), { w: 7, wob: 0.4, seed: seed + 137 });
  }

  if (style === "sprout") {
    const sw = o.sprout ?? 0;
    sk.ink(curve([[2, -R - 4], [-8 + sw * 0.4, -R - 30], [8 + sw, -R - 50], [28 + sw * 1.4, -R - 40]]), { w: 11, wob: 0.7, seed: seed + 30 });
    sk.ink(curve([[4, -R - 4], [16 + sw * 0.5, -R - 24], [36 + sw, -R - 22]]), { w: 9, wob: 0.5, seed: seed + 31 });
  }

  if (o.band) {
    // 머리띠: 이마를 두르는 흰 띠 + 오른쪽 매듭과 날리는 끈 + 손글씨
    const top = curve([[-108, -40], [-56, -66], [0, -74], [56, -66], [108, -40]], false, 4);
    const bot = curve([[110, 2], [56, -22], [0, -30], [-56, -22], [-110, 2]], false, 4);
    const t1 = curve([[100, -30], [136, -62], [170, -66], [158, -40], [128, -22]], true, 4);
    const t2 = curve([[104, -16], [146, -14], [176, 10], [150, 14], [122, 0]], true, 4);
    for (const [t, i] of [[t1, 0], [t2, 1]]) { sk.fill(t, C.white, { dx: 1, dy: 1.2, wob: 0.8, seed: seed + 140 + i }); sk.ink(t, { w: 9, wob: 0.8, seed: seed + 142 + i }); }
    const strip = [...top, ...bot, top[0]];
    sk.fill(strip, C.white, { dx: 1, dy: 1.4, wob: 0.8, seed: seed + 144 });
    sk.ink(strip, { w: 10, wob: 0.9, seed: seed + 145 });
    const kn = circ(108, -20, 15, { over: 0.2, seed: seed + 146, lump: 0.05 });
    sk.fill(kn, C.white, { dx: 0.6, dy: 0.8, wob: 0.5, seed: seed + 147 }); sk.ink(kn, { w: 8, wob: 0.6, seed: seed + 148 });
    // 글씨는 띠의 가운데 줄(가운데가 높고 양 끝이 내려가는 곡선)을 따라 앉힌다
    if (o.band !== "plain") studyLetters(sk, { s: 12.6, w: 0.36, color: o.bandInk ?? C.ink, y: x => -52 + 0.00255 * x * x, rot: x => Math.atan(0.0051 * x) });
  }

  if (style === "cap") {
    const lift = o.capLift ?? 0;
    sk.save();
    sk.translate(lift * 0.25, -lift); sk.rotate(lift * 0.004);
    const brim = curve([[58, -24], [124, -40], [182, -22], [176, -4], [116, -2], [62, -10]], true, 4);
    sk.fill(brim, o.brimColor ?? "#F2A81D", { dx: 1.5, dy: 2, wob: 1.1, seed: seed + 40 });
    sk.ink(brim, { w: 10, wob: 1.1, seed: seed + 41 });
    const dome = arcPts(R + 9, PI + 0.12, TAU - 0.12);
    const e = dome[dome.length - 1];
    capShape(sk, dome, [e, [50, -24], [0, -30], [-50, -24]], capCol, seed + 42, 11, false, tex);
    sk.ink(curve([[0, -R - 8], [-4, -70], [-2, -30]]), { w: 5, wob: 0.5, seed: seed + 44, color: mix(capCol, "#000000", 0.22) });
    const b = circ(0, -R - 10, 12, { seed: seed + 45 });
    sk.fill(b, capCol, { dx: 0, dy: 0, wob: 0.5 }); sk.ink(b, { w: 6, wob: 0.5, seed: seed + 46 });
    sk.restore();
  }
  if (style === "kerchief") {
    // 머릿수건: 이마까지 덮는 천 + 옆 매듭
    const col = o.capColor ?? C.red;
    const k1 = curve([[96, -34], [132, -48], [150, -22], [128, -10], [104, -16]], true, 4);
    const k2 = curve([[100, -22], [136, 0], [140, 30], [116, 22], [98, -4]], true, 4);
    for (const [t, i] of [[k1, 0], [k2, 1]]) { sk.fill(t, col, { dx: 1, dy: 1.2, wob: 0.8, seed: seed + 150 + i }); sk.ink(t, { w: 9, wob: 0.8, seed: seed + 152 + i }); }
    const dome = arcPts(R + 8, PI + 0.2, TAU - 0.2);
    const e = dome[dome.length - 1];
    capShape(sk, dome, [e, [54, -38], [0, -46], [-54, -38]], col, seed + 154, 11, true, tex);
  }
  if (style === "knit") {
    // 털모자: 둥근 덮개 + 접은 단
    const col = o.capColor ?? "#3F7CC0";
    const dome = arcPts(R + 10, PI + 0.34, TAU - 0.34);
    const e = dome[dome.length - 1];
    capShape(sk, dome, [e, [0, -58]], col, seed + 160, 11, true, tex);
    const band = [...curve([[-112, -30], [-58, -62], [0, -70], [58, -62], [112, -30]], false, 4), ...curve([[108, -6], [56, -30], [0, -38], [-56, -30], [-108, -6]], false, 4)];
    band.push(band[0]);
    sk.fill(band, mix(col, "#ffffff", 0.45), { dx: 1, dy: 1.4, wob: 0.8, seed: seed + 162 });
    sk.ink(band, { w: 10, wob: 0.9, seed: seed + 163 });
  }
  if (o.beard) {
    // 턱수염: 머리 아래쪽을 덮는 복슬복슬한 덩어리(얼굴 없는 인물의 나이를 알려 준다)
    const b = curve([[-98, 6], [-66, 26], [-30, 40], [0, 34], [30, 40], [66, 26], [98, 6], [110, 62], [92, 124], [48, 168], [0, 182], [-48, 168], [-92, 124], [-110, 62]], true, 4);
    sk.fill(b, o.beard, { dx: 1.5, dy: 2, wob: 1.6, seed: seed + 230 });
    sk.ink(b, { w: 10, wob: 1.6, seed: seed + 231 });
    for (const [bx, by, i] of [[-48, 84, 0], [0, 100, 1], [48, 84, 2], [-22, 138, 3], [24, 138, 4]]) sk.ink(curve([[bx - 14, by - 8], [bx, by + 6], [bx + 14, by - 8]]), { w: 5, wob: 0.4, seed: seed + 232 + i, color: mix(o.beard, "#000000", 0.22) });
  }
  if (o.hat === "brim") {
    // 챙 넓은 모자(머리 모양 위에 겹쳐 쓴다): 낮고 둥근 통 + 넓은 챙
    const col = o.hatColor ?? "#6B4A32";
    const crown = curve([[-70, -84], [-62, -150], [0, -168], [62, -150], [70, -84]], false, 4);
    sk.fill([...crown, crown[0]], col, { dx: 1.5, dy: 2, wob: 1, seed: seed + 220, tex });
    sk.ink([...crown, crown[0]], { w: 10, wob: 1, seed: seed + 221 });
    const brim = curve([[-160, -76], [-90, -98], [0, -102], [90, -98], [160, -76], [90, -68], [0, -64], [-90, -68]], true, 4);
    sk.fill(brim, col, { dx: 1, dy: 1.4, wob: 0.8, seed: seed + 222 });
    sk.ink(brim, { w: 10, wob: 1, seed: seed + 223 });
  }
  if (o.hat === "bokdu") {
    // 고려 관리의 관모(복두): 앞은 낮고 뒤가 솟은 두 단의 검은 모자 + 옆으로 뻗은 두 날개
    const col = o.hatColor ?? "#2E2E33";
    for (const sg of [-1, 1]) { const wing = curve([[sg * 86, -104], [sg * 150, -116], [sg * 184, -108], [sg * 150, -94], [sg * 90, -90]], true, 3); sk.fill(wing, col, { dx: 0.8, dy: 1, wob: 0.6, seed: seed + 240 }); sk.ink(wing, { w: 8, wob: 0.7, seed: seed + 241 + (sg > 0 ? 1 : 0) }); }
    const back = curve([[-70, -92], [-64, -166], [0, -184], [64, -166], [70, -92]], false, 4);
    sk.fill([...back, back[0]], col, { dx: 1.5, dy: 2, wob: 1, seed: seed + 243, tex }); sk.ink([...back, back[0]], { w: 10, wob: 1, seed: seed + 244 });
    const front = curve([[-98, -58], [-88, -116], [0, -134], [88, -116], [98, -58], [50, -72], [0, -76], [-50, -72]], true, 4);
    sk.fill(front, col, { dx: 1.5, dy: 2, wob: 1, seed: seed + 245, tex }); sk.ink(front, { w: 10, wob: 1, seed: seed + 246 });
  }
  if (style === "tophat") {
    // 실크해트: 높은 통 + 납작한 챙 + 띠
    const col = o.capColor ?? "#2E2E33";
    const crown = poly([[-68, -80], [-62, -206], [62, -206], [68, -80]], 4);
    sk.fill(crown, col, { dx: 1.5, dy: 2, wob: 1.1, seed: seed + 190, tex });
    sk.ink(crown, { w: 11, wob: 1.1, seed: seed + 191 });
    sk.ink(dense([[-66, -112], [66, -112]]), { w: 9, wob: 0.6, seed: seed + 192, color: o.bandColor ?? C.red });
    const brim = rrect(-116, -94, 232, 24, 12);
    sk.fill(brim, col, { dx: 1, dy: 1.4, wob: 0.8, seed: seed + 193 });
    sk.ink(brim, { w: 11, wob: 1, seed: seed + 194 });
  }
  if (style === "gat") {
    // 갓: 넓고 납작한 양태 + 둥근 통(대우), 턱 끈
    const col = o.capColor ?? "#2E2E33";
    const top = poly([[-52, -92], [-46, -168], [46, -168], [52, -92]], 4);
    sk.fill(top, col, { dx: 1.5, dy: 2, wob: 1, seed: seed + 196, tex });
    sk.ink(top, { w: 10, wob: 1, seed: seed + 197 });
    const brim = curve([[-168, -78], [-90, -96], [0, -100], [90, -96], [168, -78], [90, -70], [0, -66], [-90, -70]], true, 4);
    sk.fill(brim, col, { dx: 1, dy: 1.4, wob: 0.8, seed: seed + 198, alpha: 0.92 });
    sk.ink(brim, { w: 10, wob: 1, seed: seed + 199 });
    sk.ink(curve([[-84, -66], [-70, 40], [0, 112]]), { w: 5, wob: 0.6, seed: seed + 200, color: "#3A3A40" });
    sk.ink(curve([[84, -66], [70, 40], [0, 112]]), { w: 5, wob: 0.6, seed: seed + 201, color: "#3A3A40" });
  }
  if (style === "tricorn") {
    // 삼각모: 가운데가 솟고 양 끝이 뾰족한 남색 모자 + 금색 테
    const col = o.capColor ?? C.navy;
    const hat = [
      ...curve([[-152, -58], [-104, -98], [-54, -130], [0, -142], [54, -130], [104, -98], [152, -58]], false, 4),
      ...curve([[152, -58], [98, -50], [50, -46], [0, -34], [-50, -46], [-98, -50], [-152, -58]], false, 4),
    ];
    sk.fill(hat, col, { dx: 1.5, dy: 2, wob: 1.2, seed: seed + 170, tex });
    sk.ink(curve([[-118, -66], [-58, -60], [0, -50], [58, -60], [118, -66]]), { w: 6, wob: 0.6, seed: seed + 171, color: C.gold });
    sk.ink(hat, { w: 11, wob: 1.2, seed: seed + 172 });
    const ck = circ(48, -92, 11, { seed: seed + 173 });
    sk.fill(ck, C.gold, { dx: 0, dy: 0, wob: 0.4 }); sk.ink(ck, { w: 5, wob: 0.4, seed: seed + 174 });
  }
  sk.restore();
}

// 머리 중심에서 머리 꼭대기(모자, 삐친 머리 포함)까지의 거리. 말풍선 꼬리가 닿을 자리다.
export function headTop(o = {}) {
  const st = o.hair ?? "sprout";
  if (o.hat === "brim") return 172;
  if (o.hat === "bokdu") return 188;
  return st === "tricorn" ? 146 : st === "tophat" ? 212 : st === "gat" ? 174 : st === "curls" ? R + 28 : st === "sprout" ? R + 54 : st === "cap" ? R + 24 : st === "bald" ? R + 6 : R + 14;
}

// 몸통 축 기준의 겉옷(가운, 제복). 어깨 점을 돌려준다.
function coatPts(p) {
  const ax = p.hip[0] - p.neck[0], ay = p.hip[1] - p.neck[1];
  const L = Math.hypot(ax, ay), tx = ax / L, ty = ay / L, nx = ty, ny = -tx;
  const P = (u, v) => [p.neck[0] + tx * u + nx * v, p.neck[1] + ty * u + ny * v];
  return { P, L };
}
function drawCoat(sk, p, o, seed) {
  const { P, L } = coatPts(p);
  const col = o.color ?? C.white;
  const hem = L + (o.len ?? 58);
  const body = [P(-2, -20), P(8, -42), P(40, -50), P(hem, -62), P(hem + 4, 0), P(hem, 62), P(40, 50), P(8, 42), P(-2, 20), P(20, 0)];
  const shape = poly(body, 4);
  sk.fill(shape, col, { dx: 1.5, dy: 2, wob: 1.2, seed: seed + 200, tex: col !== C.white });
  sk.ink(shape, { w: 10, wob: 1.1, seed: seed + 201 });
  // 여밈선과 깃
  sk.ink(dense([P(22, 0), P(hem + 2, 0)]), { w: 7, wob: 0.8, seed: seed + 202, color: o.seam ?? C.ink });
  if (o.buttons) for (let i = 0; i < 3; i++) sk.dot(...P(52 + i * 42, 13), 5.5, o.buttons);
  if (o.pocket) {
    const pk = poly([P(L + 6, 24), P(L + 6, 48), P(L + 34, 49), P(L + 34, 25)], 3);
    sk.ink(pk, { w: 6, wob: 0.6, seed: seed + 204 });
    sk.ink(dense([P(L - 4, 34), P(L + 6, 34)]), { w: 6, wob: 0.3, seed: seed + 205, color: o.pocket });
  }
  return { shL: P(18, -40), shR: P(18, 40) };
}

/* ---------- 온몸 ----------
   o.coat: { color, buttons, pocket } 겉옷, o.hands=false 면 손을 그리지 않는다
   o.handL / o.handR: 손 색, o.name: 기준점 이름(머리 중심과 반지름을 기록) */
export function drawFigure(sk, x, y, s, p, o = {}) {
  const seed = o.seed ?? 11, lw = o.lw ?? LW;
  sk.save();
  sk.translate(x, y); sk.scale(s * (o.mirror ? -1 : 1), s);
  let sh = [p.neck[0], p.neck[1] + 10], shL = sh, shR = sh;
  sk.ink(curve([p.hip, p.knL, p.ftL]), { w: lw, seed, wob: 1.6 });
  sk.ink(curve([p.hip, p.knR, p.ftR]), { w: lw, seed: seed + 1, wob: 1.6 });
  sk.ink(curve([p.neck, lerp2(p.neck, p.hip, 0.5), p.hip]), { w: lw + 1, seed: seed + 2, wob: 1.6 });
  if (o.coat) ({ shL, shR } = drawCoat(sk, p, o.coat, seed));
  if (o.bowtie) {
    const [nx, ny] = [p.neck[0], p.neck[1] + 16];
    for (const sg of [-1, 1]) { const t = poly([[nx, ny], [nx + sg * 26, ny - 14], [nx + sg * 26, ny + 14]], 3); sk.fill(t, o.bowtie, { dx: 0, dy: 0, wob: 0.4, seed: seed + 210 }); sk.ink(t, { w: 6, wob: 0.4, seed: seed + 211 }); }
  }
  if (o.under) o.under(); // 팔보다 뒤, 몸보다 앞에 놓일 소품
  sk.ink(curve([shL, p.elL, p.haL]), { w: lw, seed: seed + 3, wob: 1.6 });
  sk.ink(curve([shR, p.elR, p.haR]), { w: lw, seed: seed + 4, wob: 1.6 });
  sk.save();
  sk.translate(p.head[0], p.head[1]); sk.rotate(p.tilt ?? 0);
  drawHead(sk, o);
  if (o.name) sk.mark(o.name, 0, -headTop(o), R);
  sk.restore();
  if (o.hands !== false) {
    if (o.hands !== "R") handDot(sk, p.haL, o.handL ?? o.skin ?? C.skin, seed + 70);
    if (o.hands !== "L") handDot(sk, p.haR, o.handR ?? o.skin ?? C.skin, seed + 72);
  }
  sk.restore();
}

/* ---------- 인물 설정 (만화와 표정 있는 그림이 같이 쓴다) ---------- */

// 스틱맨 쌤: 삐친 머리 + 둥근 안경 + 흰 가운. 만화에서는 face 없이, 아바타에서는 face 를 켠다.
export const TEACHER = { hair: "sprout", glasses: true, coat: { color: C.white, pocket: C.teal }, seed: 21 };
// 스플래시와 로그인 그림의 주인공: 같은 얼굴에 가운만 벗은 모습
export const KID = { hair: "sprout", glasses: true, seed: 21 };
// 제임스 린드: 남색 삼각모 + 흰 가발 + 남색 제복
export const LIND = { hair: "tricorn", coat: { color: C.navy, buttons: C.gold, seam: "#1E2B49" }, seed: 41, mini: true, face: "calm" };
// 선원: 머릿수건이나 털모자
export const SAILOR_A = { hair: "kerchief", capColor: C.red, seed: 61 };
export const SAILOR_B = { hair: "knit", capColor: "#3F7CC0", seed: 71 };
export const SAILOR_C = { hair: "short", hairColor: "#C58B3A", seed: 81 };
// 만화의 학생: 영상 샘플의 노란 모자 아이
export const STUDENT = { hair: "cap", seed: 31 };
// 로버트 훅: 어깨까지 내려오는 곱슬 긴 머리 + 갈색 외투
export const HOOKE = { hair: "curls", hairColor: "#6B4A32", coat: { color: "#7A5A45", buttons: C.gold, seam: "#4E382B" }, seed: 101, mini: true, face: "calm" };
// 증기 시대 기술자: 실크해트 + 짙은 조끼
export const ENGINEER = { hair: "tophat", hairColor: "#5B463A", coat: { color: "#4A5568", buttons: C.gold, seam: "#2D3748", len: 34 }, seed: 111 };
// 플레밍: 짧은 회색 머리 + 흰 가운 + 나비넥타이
export const FLEMING = { hair: "short", hairColor: "#9A9A9A", coat: { color: C.white }, bowtie: C.red, seed: 121, mini: true, face: "calm" };
// 레이우엔훅: 챙 넓은 모자 + 긴 머리 + 풀빛 조끼
export const LEEUWENHOEK = { hair: "curls", hairColor: "#8A6A4A", hat: "brim", hatColor: "#4E3B2E", coat: { color: "#5E7B5A", buttons: C.gold, seam: "#3E5540", len: 34 }, seed: 131, mini: true, face: "calm" };
// 젊은 다윈: 짧은 갈색 머리 + 푸른 외투. 나이 든 다윈: 민머리 + 흰 턱수염 + 짙은 외투
export const DARWIN = { hair: "short", hairColor: "#8A5A33", coat: { color: "#3E5C76", buttons: C.gold, seam: "#2A3F52" }, seed: 141, mini: true, face: "calm" };
export const DARWIN_OLD = { hair: "bald", beard: "#F4F1EA", coat: { color: "#4A4A52", buttons: C.gold, seam: "#2E2E33" }, seed: 141, mini: true, face: "calm" };
// 로슨(섬의 관리): 실크해트 + 붉은 제복. 굴드(새 전문가): 안경 + 나비넥타이
export const LAWSON = { hair: "tophat", hairColor: "#5B463A", bandColor: C.gold, coat: { color: "#B5483B", buttons: C.gold, seam: "#7E2E25" }, seed: 151, mini: true, face: "calm" };
export const GOULD = { hair: "short", hairColor: "#3F3A36", glasses: true, coat: { color: "#3E5A47", seam: "#2A3F31" }, bowtie: C.orange, seed: 161, mini: true, face: "calm" };
// 그랜트 부부: 챙 넓은 햇볕 모자
export const GRANT_A = { hair: "short", hairColor: "#9A9A9A", fringe: 24, hat: "brim", hatColor: "#E9D9B0", seed: 171, mini: true, face: "calm" };
export const GRANT_B = { hair: "bob", hairColor: "#B9B3A7", hat: "brim", hatColor: "#E9D9B0", seed: 181, mini: true, face: "calm" };
// 고려의 천문 관리: 관모(복두) + 붉은 관복
export const OFFICIAL = { hair: "bald", hat: "bokdu", coat: { color: "#B0504A", seam: "#7A2F2B", len: 74 }, seed: 251 };
