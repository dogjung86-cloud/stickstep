// 소품: 굵은 검은 외곽선 + 마커로 칠한 단색. 이야기에서 중요한 것에만 색을 준다.
// 모든 소품은 (sk, x, y, s, 옵션) 꼴이고 원점은 소품마다 주석에 적었다.
import { C, curve, dense, circ, ell, poly, rrect, squiggle, lerp, TAU, mix, hash } from "./sk.mjs";

const PI = Math.PI;

/* ---------- 과일 ---------- */

// 귤(오렌지). 원점 = 가운데
export function orange(sk, x, y, r, o = {}) {
  const sd = o.seed ?? 401, col = o.color ?? C.orange;
  sk.at(x, y, r / 40, () => {
    const c = circ(0, 0, 40, { over: 0.2, seed: sd, lump: 0.03 });
    sk.fill(c, col, { dx: 1.5, dy: 1.8, wob: 1, seed: sd + 1, tex: 0.8 });
    sk.ink(curve([[-22, -16], [-12, -27], [2, -31]]), { w: 5, color: mix(col, "#ffffff", 0.55), wob: 0.3, seed: sd + 2 });
    sk.ink(c, { w: 9, wob: 0.8, seed: sd + 3 });
    if (o.leaf !== false) {
      const leaf = curve([[2, -40], [14, -58], [36, -56], [24, -42]], true, 3);
      sk.fill(leaf, C.green, { dx: 0.8, dy: 1, wob: 0.5, seed: sd + 4 });
      sk.ink(leaf, { w: 7, wob: 0.5, seed: sd + 5 });
      sk.ink(dense([[0, -36], [-2, -46]]), { w: 7, wob: 0.2, seed: sd + 6 });
    }
  });
}
// 레몬. 원점 = 가운데
export function lemon(sk, x, y, r, o = {}) {
  const sd = o.seed ?? 421;
  sk.at(x, y, r / 40, () => {
    const c = curve([[-50, 2], [-38, -20], [-8, -32], [26, -26], [44, -8], [54, -2], [44, 10], [22, 28], [-10, 32], [-38, 20]], true, 3);
    sk.fill(c, C.lemon, { dx: 1.5, dy: 1.8, wob: 1, seed: sd + 1, tex: 0.8 });
    sk.ink(curve([[-26, -12], [-10, -21], [8, -22]]), { w: 5, color: "#FFF1AE", wob: 0.3, seed: sd + 2 });
    sk.ink(c, { w: 9, wob: 0.8, seed: sd + 3 });
  }, o.rot ?? -0.3);
}
// 자른 단면. 원점 = 가운데
export function citrusHalf(sk, x, y, r, o = {}) {
  const sd = o.seed ?? 441, col = o.color ?? C.orange;
  sk.at(x, y, r / 40, () => {
    const c = circ(0, 0, 40, { over: 0.2, seed: sd, lump: 0.03 });
    sk.fill(c, mix(col, "#ffffff", 0.55), { dx: 1, dy: 1.2, wob: 0.8, seed: sd + 1 });
    sk.ink(circ(0, 0, 30, { over: 0.1, seed: sd + 2 }), { w: 4.5, color: col, wob: 0.5, seed: sd + 3 });
    for (let i = 0; i < 6; i++) { const a = i * PI / 3 + 0.3; sk.ink(dense([[5 * Math.cos(a), 5 * Math.sin(a)], [29 * Math.cos(a), 29 * Math.sin(a)]]), { w: 4.5, color: col, wob: 0.3, seed: sd + 4 + i }); }
    sk.ink(c, { w: 9, wob: 0.8, seed: sd + 11, color: o.line ?? C.ink });
  });
}

/* ---------- 생각 구름, 칠판 ---------- */

// 생각 구름. 원점 = 가운데, 꼬리 방울은 tail 쪽으로
export function cloud(sk, x, y, w, h, o = {}) {
  const sd = o.seed ?? 461;
  const n = 11, pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU - PI / 2;
    const bump = 1 + 0.06 * (hash(sd + i * 3.1) - 0.5);
    pts.push([x + (w / 2) * bump * Math.cos(a), y + (h / 2) * bump * Math.sin(a)]);
  }
  // 봉긋한 가장자리: 점 사이를 바깥으로 부푼 호로 잇는다
  const edge = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = mx - x, dy = my - y, L = Math.hypot(dx, dy) || 1;
    const k = 0.2 * Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c = [mx + dx / L * k * 1.7, my + dy / L * k * 1.7];
    for (let t = 0; t < 1; t += 0.125) edge.push([(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]]);
  }
  edge.push(edge[0]);
  const d = dense(edge, 4);
  sk.fill(d, o.color ?? C.white, { dx: 0, dy: 0, wob: 0.8, seed: sd + 1 });
  sk.ink(d, { w: o.w ?? 9, wob: 1, seed: sd + 2 });
  for (const [bx, by, br, i] of (o.tail ?? [])) {
    const b = circ(bx, by, br, { over: 0.2, seed: sd + 5 + i, lump: 0.05 });
    sk.fill(b, C.white, { dx: 0, dy: 0, wob: 0.5, seed: sd + 6 + i });
    sk.ink(b, { w: (o.w ?? 9) * 0.85, wob: 0.6, seed: sd + 7 + i });
  }
}

// 칠판. (x, y) = 왼쪽 위, 다리는 legs 길이만큼
export function board(sk, x, y, w, h, o = {}) {
  const sd = o.seed ?? 481;
  if (o.legs) {
    sk.ink(dense([[x + w * 0.2, y + h - 4], [x + w * 0.13, y + h + o.legs]]), { w: 11, seed: sd + 8, color: C.ink });
    sk.ink(dense([[x + w * 0.8, y + h - 4], [x + w * 0.87, y + h + o.legs]]), { w: 11, seed: sd + 9, color: C.ink });
  }
  const outer = rrect(x, y, w, h, 14), inner = rrect(x + 18, y + 18, w - 36, h - 36, 6);
  sk.fill(outer, C.wood, { seed: sd, tex: true, texAng: 0.05 });
  sk.fill(inner, o.color ?? C.board, { seed: sd + 1, tex: true, dx: 1, dy: 1.2 });
  sk.ink(inner, { w: 7, wob: 1.2, seed: sd + 2 });
  sk.ink(outer, { w: 11, wob: 1.6, seed: sd + 3 });
  // 분필 받침
  const tray = rrect(x + w * 0.32, y + h - 6, w * 0.36, 16, 5);
  sk.fill(tray, C.woodDark, { seed: sd + 4, dx: 1, dy: 1 });
  sk.ink(tray, { w: 8, wob: 0.8, seed: sd + 5 });
  sk.ink(dense([[x + w * 0.4, y + h - 10], [x + w * 0.47, y + h - 10]]), { w: 9, color: C.white, wob: 0.3, seed: sd + 6 });
  sk.ink(dense([[x + w * 0.52, y + h - 10], [x + w * 0.57, y + h - 10]]), { w: 9, color: C.lemon, wob: 0.3, seed: sd + 7 });
}

/* ---------- 배 ---------- */

// 물결. y = 물 높이. 화면 아래 끝까지 채운다
export function sea(sk, x0, x1, y, bottom, o = {}) {
  const sd = o.seed ?? 501;
  const top = [];
  for (let x = x0; x <= x1; x += 6) top.push([x, y + 7 * Math.sin(x / 34 + sd) + 3 * Math.sin(x / 13)]);
  sk.fill([...top, [x1, bottom], [x0, bottom], top[0]], o.color ?? C.sea, { dx: 0, dy: 0, wob: 0, seed: sd, tex: true, texAng: 0.02 });
  sk.ink(top, { w: 9, wob: 0.8, seed: sd + 1, color: o.line ?? C.ink });
  for (let i = 0; i < (o.waves ?? 5); i++) {
    const wx = lerp(x0 + 60, x1 - 120, hash(sd + i * 7.3)), wy = lerp(y + 34, bottom - 22, hash(sd + i * 3.9));
    sk.ink(curve([[wx, wy], [wx + 22, wy - 9], [wx + 44, wy], [wx + 66, wy - 9], [wx + 88, wy]]), { w: 6, color: C.white, wob: 0.4, seed: sd + 10 + i, alpha: 0.9 });
  }
}

/* ---------- 그릇과 병 (처방 여섯 가지) ---------- */

// 사과술 잔: 나무 잔 + 호박색 술. 원점 = 바닥 가운데
export function mug(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 521;
  sk.at(x, y, s, () => {
    const h = curve([[30, -62], [56, -64], [60, -34], [32, -22]], false, 3);
    sk.ink(h, { w: 9, wob: 0.6, seed: sd });
    const b = poly([[-32, -84], [32, -84], [28, 0], [-28, 0]], 4);
    sk.fill(b, C.wood, { seed: sd + 1, tex: true, dx: 1, dy: 1.2 });
    sk.ink(b, { w: 9, wob: 0.9, seed: sd + 2 });
    const top = ell(0, -84, 32, 9);
    sk.fill(top, "#E9A93C", { dx: 0, dy: 0, wob: 0.4, seed: sd + 3 });
    sk.ink(top, { w: 8, wob: 0.5, seed: sd + 4 });
    sk.ink(dense([[-30, -44], [29, -44]]), { w: 5, wob: 0.5, seed: sd + 5, color: C.woodDark });
  });
}
// 약병: 어두운 유리병 + 코르크. 원점 = 바닥 가운데
export function vial(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 541;
  sk.at(x, y, s, () => {
    const cork = poly([[-10, -96], [10, -96], [9, -78], [-9, -78]], 3);
    sk.fill(cork, C.wood, { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd });
    sk.ink(cork, { w: 7, wob: 0.5, seed: sd + 1 });
    const b = curve([[-12, -78], [-12, -62], [-28, -48], [-28, -6], [-20, 0], [20, 0], [28, -6], [28, -48], [12, -62], [12, -78]], true, 3);
    sk.fill(b, o.color ?? "#6B5AA6", { seed: sd + 2, tex: true, dx: 1, dy: 1.2 });
    sk.ink(dense([[-17, -42], [-17, -14]]), { w: 5, color: "#B7ABDD", wob: 0.3, seed: sd + 3 });
    sk.ink(b, { w: 9, wob: 0.8, seed: sd + 4 });
  });
}
// 식초 단지: 손잡이 달린 옹기. 원점 = 바닥 가운데
export function jug(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 561;
  sk.at(x, y, s, () => {
    sk.ink(curve([[22, -74], [50, -70], [48, -40], [30, -34]]), { w: 9, wob: 0.6, seed: sd });
    const b = curve([[-14, -92], [-12, -76], [-32, -52], [-32, -14], [-22, 0], [22, 0], [32, -14], [32, -52], [12, -76], [14, -92]], true, 3);
    sk.fill(b, o.color ?? "#E7DCC6", { seed: sd + 1, tex: true, dx: 1, dy: 1.2 });
    sk.ink(curve([[-30, -40], [0, -34], [30, -40]]), { w: 6, color: "#B7A27E", wob: 0.4, seed: sd + 2 });
    sk.ink(b, { w: 9, wob: 0.8, seed: sd + 3 });
  });
}
// 물잔: 유리잔 + 파란 물(바닷물). 원점 = 바닥 가운데
export function glass(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 581;
  sk.at(x, y, s, () => {
    const water = poly([[-26, -54], [26, -54], [22, -4], [-22, -4]], 3);
    sk.fill(water, o.color ?? C.sea, { dx: 0, dy: 0, wob: 0.5, seed: sd, tex: 0.8 });
    sk.ink(curve([[-26, -54], [-13, -60], [0, -54], [13, -48], [26, -54]]), { w: 5, color: C.seaDeep, wob: 0.3, seed: sd + 1 });
    sk.ink(dense([[-31, -86], [-24, 0], [24, 0], [31, -86]], 4), { w: 9, wob: 0.8, seed: sd + 2 });
  });
}
// 약 그릇: 사발 + 갈색 반죽 + 숟가락. 원점 = 바닥 가운데
export function bowl(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 601;
  sk.at(x, y, s, () => {
    if (o.food !== false) {
      const f = curve([[-36, -44], [-22, -62], [0, -68], [20, -60], [36, -44]], false, 3);
      sk.fill([...f, f[0]], o.food ?? "#9A6B43", { dx: 0, dy: 0, wob: 0.6, seed: sd, tex: 0.8 });
      sk.ink(f, { w: 8, wob: 0.7, seed: sd + 1 });
    }
    if (o.spoon) sk.ink(dense([[14, -52], [44, -92]]), { w: 8, wob: 0.5, seed: sd + 2 });
    const b = curve([[-46, -44], [-40, -14], [-20, 0], [20, 0], [40, -14], [46, -44]], false, 3);
    sk.fill([...b, b[0]], o.color ?? C.white, { dx: 0.8, dy: 1, wob: 0.6, seed: sd + 3 });
    sk.ink([...b, b[0]], { w: 9, wob: 0.8, seed: sd + 4 });
  });
}

/* ---------- 침대, 공책, 해와 달 ---------- */

// 옆에서 본 침대. (x, y) = 왼쪽 다리 바닥, w = 길이. 머리는 오른쪽
export function bedSide(sk, x, y, w, o = {}) {
  const sd = o.seed ?? 621, top = y - (o.h ?? 96);
  // 다리와 틀
  sk.ink(dense([[x, y], [x, top - 60]]), { w: 12, seed: sd });
  sk.ink(dense([[x + w, y], [x + w, top - 96]]), { w: 12, seed: sd + 1 });
  const frame = poly([[x, top], [x + w, top], [x + w, top + 30], [x, top + 30]], 4);
  sk.fill(frame, C.wood, { seed: sd + 2, tex: true, texAng: 0.03 });
  sk.ink(frame, { w: 10, wob: 1.2, seed: sd + 3 });
  // 베개
  const pil = rrect(x + w - 128, top - 44, 112, 44, 18);
  sk.fill(pil, C.white, { seed: sd + 4, dx: 1, dy: 1.2 });
  sk.ink(pil, { w: 9, wob: 1, seed: sd + 5 });
}
// 이불 (침대 위, 누운 사람을 덮는다). 머리 쪽이 오른쪽
export function blanket(sk, x, y, w, o = {}) {
  const sd = o.seed ?? 641, top = y - (o.h ?? 96);
  const b = curve([[x + 6, top + 2], [x + 10, top - 34], [x + w * 0.3, top - 62], [x + w * 0.58, top - 66], [x + w - 150, top - 44], [x + w - 138, top + 2]], false, 4);
  const shape = [...b, b[0]];
  sk.fill(shape, o.color ?? "#A9C7E8", { seed: sd, tex: true });
  sk.ink(shape, { w: 10, wob: 1.2, seed: sd + 1 });
  sk.ink(curve([[x + w - 196, top - 50], [x + w - 186, top - 26], [x + w - 190, top - 2]]), { w: 6, wob: 0.6, seed: sd + 2, color: mix(o.color ?? "#A9C7E8", "#000000", 0.25) });
}
// 공책(기록지). 원점 = 가운데
export function notebook(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 661;
  sk.at(x, y, s, () => {
    const p = poly([[-34, -44], [34, -44], [34, 44], [-34, 44]], 4);
    sk.fill(p, o.color ?? C.parchment, { seed: sd, dx: 1, dy: 1.2 });
    sk.ink(p, { w: 9, wob: 0.9, seed: sd + 1 });
    for (let i = 0; i < 4; i++) sk.ink(dense([[-20, -24 + i * 16], [i === 3 ? 4 : 20, -24 + i * 16]]), { w: 5, color: C.gray, wob: 0.4, seed: sd + 2 + i });
    if (o.check) sk.ink(curve([[2, 22], [10, 32], [26, 10]]), { w: 7, color: C.green, wob: 0.3, seed: sd + 8 });
  }, o.rot ?? 0);
}
// 깃펜. (x, y) = 펜촉, 위로 뻗는다
export function quill(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 681;
  sk.at(x, y, s, () => {
    const f = curve([[4, -30], [24, -62], [26, -104], [12, -128], [-4, -96], [-6, -56]], true, 3);
    sk.fill(f, C.white, { dx: 0.8, dy: 1, wob: 0.6, seed: sd });
    sk.ink(f, { w: 7, wob: 0.6, seed: sd + 1 });
    sk.ink(dense([[0, 0], [12, -110]]), { w: 6, wob: 0.4, seed: sd + 2 });
  }, o.rot ?? 0.5);
}
export function sun(sk, x, y, r, o = {}) {
  const sd = o.seed ?? 701;
  for (let i = 0; i < 8; i++) { const a = i * PI / 4 + 0.2; sk.ink(dense([[x + r * 1.45 * Math.cos(a), y + r * 1.45 * Math.sin(a)], [x + r * 1.95 * Math.cos(a), y + r * 1.95 * Math.sin(a)]]), { w: r * 0.26, color: C.orange, wob: 0.4, seed: sd + i }); }
  const c = circ(x, y, r, { over: 0.2, seed: sd + 9 });
  sk.fill(c, C.yellow, { dx: 1, dy: 1.2, wob: 0.6, seed: sd + 10 });
  sk.ink(c, { w: r * 0.3, wob: 0.6, seed: sd + 11 });
}
export function moon(sk, x, y, r, o = {}) {
  const sd = o.seed ?? 721;
  // 두 원의 교점에서 만나는 초승달 (바깥 원 + 오른쪽으로 0.52r 옮긴 안쪽 원)
  const outer = ell(x, y, r, r, 0.881, TAU - 0.881), inner = ell(x + r * 0.52, y, r * 0.78, r * 0.78, TAU - 1.4208, 1.4208);
  const m = [...outer, ...inner, outer[0]];
  sk.fill(m, "#C9D4EE", { dx: 1, dy: 1.2, wob: 0.5, seed: sd });
  sk.ink(m, { w: r * 0.3, wob: 0.5, seed: sd + 1 });
}

/* ---------- 표, 상자 ---------- */

// 종이(양피지). (x, y) = 왼쪽 위
export function paper(sk, x, y, w, h, o = {}) {
  const sd = o.seed ?? 741;
  const p = rrect(x, y, w, h, 26);
  sk.fill(p, o.color ?? C.parchment, { seed: sd, tex: true, texAng: -0.2 });
  sk.ink(p, { w: 10, wob: 2.4, seed: sd + 1 });
}
// 귤 상자. 원점 = 바닥 가운데
export function crate(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 761;
  sk.at(x, y, s, () => {
    // 상자 위로 쌓인 과일
    orange(sk, -58, -112, 34, { seed: sd + 20, leaf: false });
    lemon(sk, 6, -116, 30, { seed: sd + 24, rot: 0.15 });
    orange(sk, 62, -110, 34, { seed: sd + 28 });
    orange(sk, -24, -146, 34, { seed: sd + 32 });
    lemon(sk, 36, -150, 30, { seed: sd + 36, rot: -0.4 });
    const b = poly([[-112, -100], [112, -100], [104, 0], [-104, 0]], 4);
    sk.fill(b, C.wood, { seed: sd, tex: true, texAng: 0.04 });
    sk.ink(b, { w: 10, wob: 1.2, seed: sd + 1 });
    sk.ink(dense([[-109, -66], [109, -66]]), { w: 7, wob: 0.8, seed: sd + 2, color: C.woodDark });
    sk.ink(dense([[-106, -33], [106, -33]]), { w: 7, wob: 0.8, seed: sd + 3, color: C.woodDark });
  });
}

/* ---------- 놀이 소품 (스플래시) ---------- */

// 축구공. 원점 = 가운데
export function ball(sk, x, y, r, o = {}) {
  const sd = o.seed ?? 781;
  sk.at(x, y, r / 40, () => {
    const c = circ(0, 0, 40, { over: 0.2, seed: sd });
    sk.fill(c, C.white, { dx: 1, dy: 1.2, wob: 0.6, seed: sd + 1 });
    const pent = (cx, cy, rr, rot) => { const p = []; for (let i = 0; i < 5; i++) { const a = rot + i * TAU / 5; p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } return poly(p, 3); };
    sk.fill(pent(0, 0, 13, -PI / 2), C.ink, { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 });
    for (let i = 0; i < 5; i++) {
      const a = -PI / 2 + i * TAU / 5;
      sk.ink(dense([[13 * Math.cos(a), 13 * Math.sin(a)], [27 * Math.cos(a), 27 * Math.sin(a)]]), { w: 5, wob: 0.2, seed: sd + 3 + i });
      // 가장자리의 검은 조각(공 테두리 안쪽에 머문다)
      const q = (ang, rr) => [rr * Math.cos(ang), rr * Math.sin(ang)];
      sk.fill(poly([q(a - 0.3, 38), q(a - 0.17, 27), q(a + 0.17, 27), q(a + 0.3, 38)], 3), C.ink, { dx: 0, dy: 0, wob: 0.2, seed: sd + 9 + i });
    }
    sk.ink(c, { w: 9, wob: 0.8, seed: sd + 15 });
  }, o.rot ?? 0);
}
// 음표. 원점 = 머리 가운데
export function note(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 801, col = o.color ?? C.teal;
  sk.at(x, y, s, () => {
    const h = ell(0, 0, 13, 10);
    sk.fill(h, col, { dx: 0, dy: 0, wob: 0.3, seed: sd });
    sk.ink(h, { w: 6, color: col, wob: 0.3, seed: sd + 1 });
    sk.ink(dense([[12, -2], [12, -52]]), { w: 7, color: col, wob: 0.3, seed: sd + 2 });
    sk.ink(curve([[12, -52], [26, -46], [32, -30]]), { w: 7, color: col, wob: 0.3, seed: sd + 3 });
  }, o.rot ?? 0);
}
// 벽시계. 원점 = 가운데. h, m = 시와 분
export function clock(sk, x, y, r, o = {}) {
  const sd = o.seed ?? 821;
  sk.at(x, y, r / 60, () => {
    const c = circ(0, 0, 60, { over: 0.15, seed: sd });
    sk.fill(c, C.white, { dx: 1, dy: 1.2, wob: 0.6, seed: sd + 1 });
    sk.ink(c, { w: 12, color: o.rim ?? C.red, wob: 0.8, seed: sd + 2 });
    sk.ink(circ(0, 0, 66, { over: 0.15, seed: sd + 3 }), { w: 6, wob: 0.8, seed: sd + 4 });
    for (let i = 0; i < 12; i++) { const a = i * PI / 6; const r0 = i % 3 ? 46 : 42; sk.ink(dense([[r0 * Math.cos(a), r0 * Math.sin(a)], [50 * Math.cos(a), 50 * Math.sin(a)]]), { w: i % 3 ? 4 : 6, wob: 0, seed: sd + 5 + i }); }
    const ha = ((o.h ?? 8) % 12 + (o.m ?? 55) / 60) * PI / 6 - PI / 2, ma = (o.m ?? 55) * PI / 30 - PI / 2;
    sk.ink(dense([[0, 0], [26 * Math.cos(ha), 26 * Math.sin(ha)]]), { w: 8, wob: 0.2, seed: sd + 20 });
    sk.ink(dense([[0, 0], [40 * Math.cos(ma), 40 * Math.sin(ma)]]), { w: 6, wob: 0.2, seed: sd + 21 });
    sk.dot(0, 0, 5);
  });
}
// 펼친 책. 원점 = 책등 아래. w = 한쪽 날개 폭
export function openBook(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 841, col = o.color ?? C.teal;
  sk.at(x, y, s, () => {
    const cover = poly([[-84, -8], [0, 6], [84, -8], [84, -62], [0, -48], [-84, -62]], 4);
    sk.fill(cover, col, { seed: sd, tex: true, dx: 1, dy: 1.4 });
    sk.ink(cover, { w: 9, wob: 0.9, seed: sd + 1 });
    for (const sg of [-1, 1]) {
      const pg = [...curve([[0, -52], [sg * 26, -66], [sg * 54, -68], [sg * 78, -64]], false, 3), [sg * 78, -14], ...curve([[sg * 78, -14], [sg * 54, -18], [sg * 26, -16], [0, -2]], false, 3)];
      pg.push(pg[0]);
      sk.fill(pg, C.white, { dx: 0.6, dy: 0.8, wob: 0.5, seed: sd + 2 });
      sk.ink(pg, { w: 8, wob: 0.7, seed: sd + 3 + (sg > 0 ? 1 : 0) });
      if (o.lines !== false) for (let i = 0; i < 3; i++) sk.ink(curve([[sg * 14, -44 + i * 11], [sg * 40, -52 + i * 11], [sg * 66, -51 + i * 11]]), { w: 3.5, color: C.gray, wob: 0.2, seed: sd + 6 + i });
    }
  }, o.rot ?? 0);
}
// 연필. (x, y) = 가운데
export function pencil(sk, x, y, s, o = {}) {
  const sd = o.seed ?? 861;
  sk.at(x, y, s, () => {
    const b = poly([[-46, -8], [30, -8], [30, 8], [-46, 8]], 3);
    sk.fill(b, C.yellow, { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd, tex: 0.7, texAng: 0 });
    sk.ink(b, { w: 7, wob: 0.5, seed: sd + 1 });
    const tip = poly([[30, -8], [52, 0], [30, 8]], 3);
    sk.fill(tip, C.woodLight, { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 });
    sk.ink(tip, { w: 7, wob: 0.4, seed: sd + 3 });
    sk.dot(49, 0, 3.4);
    const er = poly([[-58, -8], [-46, -8], [-46, 8], [-58, 8]], 3);
    sk.fill(er, "#F29A9A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 });
    sk.ink(er, { w: 7, wob: 0.4, seed: sd + 5 });
  }, o.rot ?? 0);
}
