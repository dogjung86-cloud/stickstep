// 중1 과학 u2l1 도입 만화(v2, 배선 전): 코르크 속 작은 방의 발견. 8컷.
// 조사와 콘티는 qa/sketch/research/u2l1.md (출처: 「마이크로그라피아」 관찰 18 원문, 버치 「왕립학회사」 1권의 1663년 회의록).
//   1 왕립학회의 숙제(1663년 4월, 8일에 보인 이끼 그림) → 2 코르크는 왜 가볍고 탱탱할까 → 3 면도칼처럼 간 칼, 검은 받침, 모은 불빛
//   → 4 벌집 같은 빈 칸과 얇은 벽 → 5 책 「마이크로그라피아」(1665)와 '셀'이라는 말의 뜻 → 6 책에 실린 칸 수 셈
//   → 7 레이우엔훅의 호수 물(1674) → 8 오늘날, 사람의 몸도 세포로
// 그림 속에는 글자와 숫자를 넣지 않는다. 때와 곳은 when 으로 앱이 상자를 얹는다(왼쪽 위 약 400×100은 비워 둔다).
// 코르크 칸은 벽을 나눠 쓰는 불규칙한 그물로 그린다(훅의 그림과 확대 랩이 그렇다. 떨어진 상자로 그리면 '얇은 벽'이 안 읽힌다).
// 수도원 방 이야기는 근거가 없어 훅이 방을 떠올리는 그림(생각 구름)은 쓰지 않는다. 5컷의 방 그림은 '말의 뜻' 카드다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, lerp, mix, hash, emark, qmark, sparkle, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, HOOKE, LEEUWENHOEK, STUDENT } from "../lib/figure.mjs";
import { microscope } from "../lib/props.mjs";

const W = 960, H = 720;
const CORK = "#D9A866", CORK_DARK = "#A9773F", PAPER = "#FBF6E6", INK = "#3A3A40";

/* ---------- 인물 ---------- */
// 왕립학회 회원(이름 없는 인물이라 얼굴을 비운다): 가발과 짙은 외투
const MEMBER_A = { hair: "curls", hairColor: "#D8D2C6", coat: { color: "#4A5568", buttons: C.gold, seam: "#2D3748" }, seed: 601 };
const MEMBER_B = { hair: "curls", hairColor: "#7A5A3C", coat: { color: "#6B4F6E", buttons: C.gold, seam: "#45324A" }, seed: 611 };

/* ---------- 세포 그림 ---------- */
// 벽을 나눠 쓰는 불규칙한 칸의 그물(코르크). 육각 타일의 꼭짓점을 살짝 흔들어, 이웃 칸이 같은 벽을 쓴다.
//   inside(x, y): 이 점이 그릴 자리 안인가. b: 타일을 깔 범위 { x0, y0, x1, y1 }, a: 칸 하나의 반지름
function cellNet(sk, inside, b, a, o = {}) {
  const sd = o.seed ?? 1, jit = (o.jit ?? 0.2) * a, dx = Math.sqrt(3) * a, dy = 1.5 * a;
  const V = new Map(), E = new Set();
  const vert = (x, y) => {
    const k = Math.round(x * 4) + "," + Math.round(y * 4);
    if (!V.has(k)) V.set(k, [x + (hash(sd + x * 0.37 + y * 1.13) - 0.5) * 2 * jit, y + (hash(sd * 1.7 + x * 1.91 + y * 0.29) - 0.5) * 2 * jit]);
    return k;
  };
  const rows = Math.ceil((b.y1 - b.y0) / dy) + 1, cols = Math.ceil((b.x1 - b.x0) / dx) + 1;
  for (let r = -1; r <= rows; r++) for (let c = -1; c <= cols; c++) {
    const cx = b.x0 + c * dx + (r % 2 ? dx / 2 : 0), cy = b.y0 + r * dy;
    const ks = [0, 1, 2, 3, 4, 5].map(k => { const th = Math.PI / 180 * (60 * k - 30); return vert(cx + a * Math.cos(th), cy + a * Math.sin(th)); });
    ks.forEach((p, k) => { const q = ks[(k + 1) % 6]; E.add(p < q ? p + "|" + q : q + "|" + p); });
  }
  let i = 0;
  for (const e of E) {
    const [p, q] = e.split("|").map(k => V.get(k));
    if (!inside(p[0], p[1]) || !inside(q[0], q[1])) continue;
    sk.ink(dense([p, q], 3), { w: o.w ?? 6, color: o.wall ?? CORK_DARK, wob: 0.5, seed: sd + (i++ % 89) });
  }
}
// 렌즈 속 코르크: 둥근 창 안에 벽을 나눠 쓰는 빈 칸
function corkView(sk, cx, cy, r, o = {}) {
  const sd = o.seed ?? 901;
  const ring = circ(cx, cy, r, { over: 0.12, seed: sd });
  sk.fill(ring, "#FBF3E2", { dx: 0, dy: 0, wob: 0.6, seed: sd + 1 });
  cellNet(sk, (x, y) => Math.hypot(x - cx, y - cy) < r - 14, { x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r }, o.a ?? 30, { seed: sd + 2, w: o.w ?? 6 });
  sk.ink(ring, { w: 14, seed: sd + 3, color: "#B8892E" });
}
// 사람(동물)의 세포: 둥글고 고르지 않은 세포에 핵이 하나씩(벽돌처럼 줄 맞춰 쌓지 않는다. 그건 식물세포의 표지다)
function bodyCellsView(sk, cx, cy, r, o = {}) {
  const sd = o.seed ?? 951, s = o.s ?? 46;
  const ring = circ(cx, cy, r, { over: 0.12, seed: sd });
  sk.fill(ring, "#FFF4F6", { dx: 0, dy: 0, wob: 0.6, seed: sd + 1 });
  let n = 0;
  for (let row = -6; row <= 6; row++) for (let col = -6; col <= 6; col++) {
    const x = cx + col * s * 1.04 + (row % 2 ? s * 0.52 : 0) + (hash(sd + n * 3.1) - 0.5) * s * 0.3;
    const y = cy + row * s * 0.92 + (hash(sd + n * 7.7) - 0.5) * s * 0.3;
    n++;
    const rc = s * (0.4 + 0.1 * hash(sd + n * 5.3));
    if (Math.hypot(x - cx, y - cy) > r - rc - 12) continue;
    const c = curve([0, 1, 2, 3, 4, 5, 6].map(k => { const a = k / 7 * Math.PI * 2, rr = rc * (0.86 + 0.24 * hash(sd + n * 11 + k)); return [x + rr * Math.cos(a), y + rr * 0.86 * Math.sin(a)]; }), true, 3);
    sk.fill(c, "#F9D3DA", { dx: 0, dy: 0, wob: 0.5, seed: sd + 20 + n }); sk.ink(c, { w: 5, color: "#D9788A", wob: 0.5, seed: sd + 40 + n });
    sk.dot(x + rc * 0.1, y, rc * 0.24, "#B24C63");
  }
  sk.ink(ring, { w: 11, seed: sd + 2 });
}

/* ---------- 소품 ---------- */
// 탁자(옆모습): 상판 + 다리 둘. (x, y) = 상판 왼쪽 위
function table(sk, x, y, w, sd, bottom = 706) {
  sk.ink(dense([[x + 40, y + 24], [x + 32, bottom]]), { w: 12, seed: sd }); sk.ink(dense([[x + w - 40, y + 24], [x + w - 32, bottom]]), { w: 12, seed: sd + 1 });
  const top = rrect(x, y, w, 28, 10);
  sk.fill(top, C.wood, { seed: sd + 2, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: sd + 3 });
}
// 기름 등잔: 받침 + 작은 불꽃. 원점 = 바닥 가운데. 불꽃 중심을 돌려준다
function lamp(sk, x, y, s = 1, sd = 21) {
  sk.at(x, y, s, () => {
    const base = curve([[-34, 0], [-40, -26], [-16, -44], [16, -44], [40, -26], [34, 0]], false, 3);
    sk.fill([...base, base[0]], "#B9772F", { seed: sd, tex: true }); sk.ink([...base, base[0]], { w: 9, seed: sd + 1 });
    sk.ink(dense([[0, -44], [0, -58]]), { w: 7, seed: sd + 2 });
    const fl = curve([[0, -112], [16, -84], [10, -62], [0, -56], [-10, -62], [-16, -84]], true, 3);
    sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.5, seed: sd + 3 }); sk.ink(fl, { w: 6, color: C.red, seed: sd + 4, wob: 0.5 });
    sk.fill(curve([[0, -92], [7, -78], [0, -66], [-7, -78]], true, 2), C.lemon, { dx: 0, dy: 0, wob: 0.3, seed: sd + 5 });
  });
  return [x, y - 84 * s];
}
// 소금물을 채운 유리공(받침 위). 원점 = 받침 바닥 가운데. 공의 중심을 돌려준다
function globe(sk, x, y, r, sd = 31) {
  sk.ink(dense([[x, y], [x, y - 40]]), { w: 9, seed: sd });
  sk.ink(dense([[x - 28, y], [x + 28, y]]), { w: 10, seed: sd + 1 });
  const g = circ(x, y - 40 - r, r, { over: 0.15, seed: sd + 2 });
  sk.fill(g, "#D4EEF9", { dx: 0, dy: 0, wob: 0.5, seed: sd + 3, alpha: 0.92 });
  sk.ink(curve([[x - r * 0.5, y - 40 - r * 1.3], [x - r * 0.72, y - 40 - r], [x - r * 0.5, y - 40 - r * 0.66]]), { w: 5, color: C.white, seed: sd + 4, wob: 0.3 });
  sk.ink(g, { w: 9, seed: sd + 5 });
  return [x, y - 40 - r];
}
// 볼록한 유리(옆에서 본 렌즈)를 단 작은 받침. 원점 = 받침 바닥. 렌즈 중심을 돌려준다
function lensStand(sk, x, y, h, sd = 41) {
  sk.ink(dense([[x, y], [x, y - h + 26]]), { w: 8, seed: sd });
  sk.ink(dense([[x - 24, y], [x + 24, y]]), { w: 9, seed: sd + 1 });
  const L = curve([[x, y - h - 30], [x + 13, y - h], [x, y - h + 30], [x - 13, y - h]], true, 3);
  sk.fill(L, "#D4EEF9", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 }); sk.ink(L, { w: 7, seed: sd + 3, wob: 0.3 });
  return [x, y - h];
}
// 코르크 덩이(옆에서 본 원기둥 마개). 원점 = 바닥 가운데
function corkPlug(sk, x, y, w, h, sd = 51) {
  const body = [...ell(x, y - h, w / 2, w * 0.16, Math.PI, Math.PI * 2), ...ell(x, y, w / 2, w * 0.16, 0, Math.PI)];
  body.push(body[0]);
  sk.fill(body, CORK, { seed: sd, tex: true, texAng: 1.5 }); sk.ink(body, { w: 9, seed: sd + 1 });
  const top = ell(x, y - h, w / 2, w * 0.16);
  sk.fill(top, mix(CORK, "#ffffff", 0.25), { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 }); sk.ink(top, { w: 8, seed: sd + 3 });
  for (let i = 0; i < 7; i++) sk.dot(x - w * 0.3 + (i * 37 % 60) / 60 * w * 0.6, y - h * 0.2 - (i * 53 % 70) / 70 * h * 0.6, 3.2, CORK_DARK);
}
// 유리병 + 코르크 마개. 원점 = 바닥 가운데
function bottle(sk, x, y, s = 1, sd = 61) {
  sk.at(x, y, s, () => {
    const b = curve([[-44, 0], [-50, -40], [-50, -110], [-34, -140], [-16, -158], [-16, -190], [16, -190], [16, -158], [34, -140], [50, -110], [50, -40], [44, 0]], false, 4);
    sk.fill([...b, b[0]], "#BFE3C8", { seed: sd, dx: 1, dy: 1.2, alpha: 0.9 });
    sk.ink(curve([[-32, -100], [-36, -60], [-32, -26]]), { w: 6, color: C.white, seed: sd + 1, wob: 0.3 });
    sk.ink([...b, b[0]], { w: 9, seed: sd + 2 });
    const plug = rrect(-19, -226, 38, 42, 7);
    sk.fill(plug, CORK, { seed: sd + 3, tex: true }); sk.ink(plug, { w: 8, seed: sd + 4 });
  });
}
// 물그릇에 뜬 코르크. 원점 = 그릇 바닥 가운데
function floatBowl(sk, bx, by, sd = 71) {
  const bowl = curve([[bx - 118, by - 76], [bx - 100, by - 20], [bx - 58, by], [bx + 58, by], [bx + 100, by - 20], [bx + 118, by - 76]], false, 4);
  sk.fill([...bowl, bowl[0]], C.white, { seed: sd, dx: 1, dy: 1.2 });
  const water = [...ell(bx, by - 70, 110, 13, Math.PI, Math.PI * 2), ...curve([[bx + 110, by - 70], [bx + 92, by - 24], [bx + 54, by - 6], [bx - 54, by - 6], [bx - 92, by - 24], [bx - 110, by - 70]], false, 4)];
  sk.fill(water, C.sea, { seed: sd + 1, dx: 0, dy: 0, wob: 0.6, tex: 0.8 });
  sk.ink([...bowl, bowl[0]], { w: 10, seed: sd + 2 });
  const cork = rrect(bx - 30, by - 102, 60, 40, 10);
  sk.fill(cork, CORK, { seed: sd + 3, tex: true }); sk.ink(cork, { w: 8, seed: sd + 4 });
  sk.ink(curve([[bx - 88, by - 66], [bx - 70, by - 72], [bx - 52, by - 66]]), { w: 5, color: C.white, seed: sd + 5, wob: 0.3 });
  sk.ink(curve([[bx + 48, by - 66], [bx + 68, by - 72], [bx + 88, by - 66]]), { w: 5, color: C.white, seed: sd + 6, wob: 0.3 });
}
// 벌집 조각(육각 칸). (cx, cy) = 가운데
function honeycomb(sk, cx, cy, r, sd = 81) {
  const hex = (x, y, a) => poly([0, 1, 2, 3, 4, 5].map(i => [x + a * Math.cos(Math.PI / 3 * i + Math.PI / 6), y + a * Math.sin(Math.PI / 3 * i + Math.PI / 6)]), 3);
  const a = r / 2.1, dx = a * Math.sqrt(3), dy = a * 1.5;
  const cells = [[0, 0], [dx, 0], [-dx, 0], [dx / 2, -dy], [-dx / 2, -dy], [dx / 2, dy], [-dx / 2, dy]];
  cells.forEach(([x, y], i) => { const h = hex(cx + x, cy + y, a * 0.96); sk.fill(h, i % 3 === 0 ? "#F6C453" : "#F2B33D", { dx: 0, dy: 0, wob: 0.4, seed: sd + i }); });
  cells.forEach(([x, y], i) => sk.ink(hex(cx + x, cy + y, a * 0.96), { w: 6, color: "#B07A1E", seed: sd + 10 + i, wob: 0.4 }));
}
// 펼친 책. (cx, y) = 등(가운데 아래). 왼쪽 쪽에 코르크 칸 그림, 오른쪽 쪽에 벼룩 그림
function openBook(sk, cx, y, s = 1, sd = 91) {
  sk.at(cx, y, s, () => {
    for (const sg of [-1, 1]) {
      const pg = curve([[0, 0], [sg * 70, -8], [sg * 140, 0], [sg * 142, -176], [sg * 70, -188], [0, -180]], true, 4);
      sk.fill(pg, PAPER, { seed: sd + (sg > 0 ? 1 : 0), dx: 1, dy: 1.2 }); sk.ink(pg, { w: 8, seed: sd + 2 + (sg > 0 ? 1 : 0) });
    }
    sk.ink(dense([[0, -180], [0, 0]]), { w: 6, seed: sd + 4, color: "#8A7A60" });
    // 왼쪽 쪽: 코르크의 작은 칸(벽을 나눠 쓰는 그물)
    cellNet(sk, (x, y) => x > -128 && x < -16 && y > -164 && y < -18, { x0: -134, y0: -170, x1: -10, y1: -12 }, 14, { seed: sd + 5, w: 4 });
    // 오른쪽 쪽: 벼룩
    const body = curve([[34, -92], [50, -122], [92, -128], [116, -108], [116, -80], [90, -62], [50, -64]], true, 3);
    sk.fill(body, "#8A8A90", { dx: 0, dy: 0, wob: 0.5, seed: sd + 20 }); sk.ink(body, { w: 5, color: INK, seed: sd + 21, wob: 0.5 });
    sk.ink(circ(30, -98, 11, { over: 0.2, seed: sd + 22 }), { w: 5, color: INK, seed: sd + 23 });
    for (const [x0, i] of [[56, 0], [78, 1], [100, 2]]) sk.ink(dense([[x0, -66], [x0 - 10, -44], [x0 + (i === 2 ? 22 : 4), -30]], 3), { w: 4, color: INK, seed: sd + 24 + i, wob: 0.3 });
  });
}
// 이끼를 크게 그린 종이(1663년 4월 8일 모임에서 훅이 보인 관찰 그림). (x, y) = 종이 왼쪽 위, w×h
function mossSheet(sk, x, y, w, h, sd = 111) {
  const paper = poly([[x, y + 6], [x + w, y], [x + w + 6, y + h], [x + 6, y + h + 6]], 5);
  sk.fill(paper, PAPER, { seed: sd, dx: 1.5, dy: 2 }); sk.ink(paper, { w: 9, seed: sd + 1 });
  const G = "#4E9A46", GD = "#2F6B33", base = y + h - 16;
  // 포자 주머니를 단 가는 줄기 둘(이끼의 열매처럼 보이는 부분)
  for (const [bx, tx, ty, i] of [[x + w * 0.36, x + w * 0.28, y + 40, 0], [x + w * 0.62, x + w * 0.74, y + 30, 1]]) {
    sk.ink(curve([[bx, base - 50], [lerp(bx, tx, 0.5) + 6, lerp(base - 50, ty, 0.5)], [tx, ty + 16]]), { w: 4, color: "#8A5A33", seed: sd + 2 + i, wob: 0.3 });
    const cap = ell(tx, ty, 9, 15);
    sk.fill(cap, "#B5814C", { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 + i }); sk.ink(cap, { w: 4.5, seed: sd + 6 + i, wob: 0.3 });
  }
  // 잎이 촘촘한 줄기 셋
  for (const [sx, lean, hgt, i] of [[x + w * 0.24, -6, 64, 0], [x + w * 0.5, 4, 78, 1], [x + w * 0.76, 8, 58, 2]]) {
    sk.ink(dense([[sx, base], [sx + lean, base - hgt]]), { w: 5, color: GD, seed: sd + 10 + i, wob: 0.3 });
    for (let j = 0; j < 5; j++) {
      const ly = base - 10 - j * (hgt - 10) / 5, lx = sx + lean * (j / 5);
      for (const sg of [-1, 1]) { const lf = ell(lx + sg * 10, ly - 4, 10, 4.5); sk.fill(lf, G, { dx: 0, dy: 0, wob: 0.2, seed: sd + 20 + i * 10 + j }); sk.ink(lf, { w: 3, color: GD, seed: sd + 50 + i * 10 + j, wob: 0.2 }); }
    }
  }
  sk.ink(curve([[x + 16, base + 2], [x + w * 0.5, base - 4], [x + w - 12, base + 2]]), { w: 5, color: "#8A6A3E", seed: sd + 90, wob: 0.4 });
}
// 방 한 칸의 단면(뒷벽, 양옆 벽, 바닥이 보이는 작은 방). (x, y) = 왼쪽 위, w×h
function roomSection(sk, x, y, w, h, sd = 131) {
  const ix0 = x + w * 0.22, ix1 = x + w * 0.78, iy0 = y + h * 0.2, iy1 = y + h * 0.7;
  const back = poly([[ix0, iy0], [ix1, iy0], [ix1, iy1], [ix0, iy1]], 4);
  const left = poly([[x, y], [ix0, iy0], [ix0, iy1], [x, y + h]], 4);
  const right = poly([[x + w, y], [ix1, iy0], [ix1, iy1], [x + w, y + h]], 4);
  const floor = poly([[x, y + h], [ix0, iy1], [ix1, iy1], [x + w, y + h]], 4);
  sk.fill(back, "#F1EADB", { seed: sd, dx: 0.6, dy: 0.8 });
  sk.fill(left, "#E2D6C0", { seed: sd + 1, dx: 0.6, dy: 0.8 }); sk.fill(right, "#E2D6C0", { seed: sd + 2, dx: 0.6, dy: 0.8 });
  sk.fill(floor, "#C9A27A", { seed: sd + 3, tex: true, texAng: 0.05 });
  for (const [p, i] of [[back, 0], [left, 1], [right, 2], [floor, 3]]) sk.ink(p, { w: 6, seed: sd + 4 + i, wob: 0.5 });
  const win = rrect(lerp(ix0, ix1, 0.32), lerp(iy0, iy1, 0.2), (ix1 - ix0) * 0.36, (iy1 - iy0) * 0.36, 4);
  sk.fill(win, "#BFE2F4", { dx: 0, dy: 0, wob: 0.3, seed: sd + 8 }); sk.ink(win, { w: 4.5, seed: sd + 9, wob: 0.3 });
}
// '셀'이라는 말의 뜻 카드: 코르크의 칸 하나 = 작은 방 하나. (x, y) = 왼쪽 위
function meaningCard(sk, x, y, w, h, sd = 141) {
  const card = rrect(x, y, w, h, 22);
  sk.fill(card, "#FFFDF6", { seed: sd, dx: 1, dy: 1.4 }); sk.ink(card, { w: 8, seed: sd + 1, color: "#B8892E" });
  // 왼쪽: 벽을 나눠 쓰는 코르크 칸 몇 개, 가운데 칸만 연하게 칠한다
  const cx = x + w * 0.25, cy = y + h * 0.52, a = h * 0.14;
  const hex = (px, py) => poly([0, 1, 2, 3, 4, 5].map(k => { const th = Math.PI / 180 * (60 * k - 30); return [px + a * Math.cos(th), py + a * Math.sin(th)]; }), 3);
  const mid = hex(cx, cy);
  sk.fill(mid, "#F6E7C8", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 });
  for (const [dx, dy, i] of [[0, 0, 0], [Math.sqrt(3) * a, 0, 1], [-Math.sqrt(3) * a, 0, 2], [Math.sqrt(3) * a / 2, -1.5 * a, 3], [-Math.sqrt(3) * a / 2, 1.5 * a, 4]]) {
    const hx = hex(cx + dx, cy + dy);
    if (i === 0) sk.ink(hx, { w: 6, color: CORK_DARK, seed: sd + 3, wob: 0.4 });
    else sk.ink(hx, { w: 4, color: mix(CORK_DARK, "#ffffff", 0.45), seed: sd + 3 + i, wob: 0.4 });
  }
  // 가운데: 같다는 기호
  for (const dy of [-9, 9]) sk.ink(dense([[x + w * 0.46, y + h * 0.52 + dy], [x + w * 0.56, y + h * 0.52 + dy]]), { w: 8, color: C.gray, seed: sd + 10 + dy, wob: 0.2 });
  // 오른쪽: 작은 방의 단면
  roomSection(sk, x + w * 0.62, y + h * 0.22, w * 0.32, h * 0.6, sd + 20);
}

/* ---------- 1. 1663년 4월, 런던: 왕립학회의 숙제 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  // 탁자 뒤에 선 회원 둘(앞사람은 손을 들어 다음 관찰을 청한다). 훅과 같은 크기로 그린다(작게 그리면 아이처럼 보인다)
  const fold = pose({ elL: [-30, -262], haL: [8, -270], elR: [36, -262], haR: [-4, -282], tilt: 0.07 });
  drawFigure(sk, 842, 692, 0.74, fold, { ...MEMBER_B, hands: false });
  const pt = pose({ elL: [-110, -352], haL: [-180, -446], elR: [44, -262], haR: [40, -226], tilt: -0.06 });
  drawFigure(sk, 680, 692, 0.74, pt, { ...MEMBER_A, name: "memberA", hands: "L" });
  table(sk, 520, 530, 430, 11);
  // 탁자 위의 지난 관찰 그림들
  for (let i = 0; i < 3; i++) { const sh = poly([[700 + i * 8, 518 - i * 7], [802 + i * 6, 516 - i * 8], [804 + i * 6, 530 - i * 6], [698 + i * 8, 532 - i * 5]], 3); sk.fill(sh, i === 1 ? "#EDE8DC" : PAPER, { dx: 0, dy: 0, wob: 0.4, seed: 21 + i }); sk.ink(sh, { w: 6, seed: 24 + i, wob: 0.4 }); }
  // 훅: 현미경으로 본 이끼를 크게 그린 종이를 들어 보인다
  const show = pose({ elR: [74, -316], haR: [112, -392], elL: [-56, -262], haL: [-22, -222], tilt: 0.05 });
  const fx = 196, fy = 704, fs = 0.78;
  drawFigure(sk, fx, fy, fs, show, { ...HOOKE, name: "hooke", face: "smile", hands: "L" });
  mossSheet(sk, 262, 230, 176, 196, 31);
  handDot(sk, [fx + fs * 112, fy - fs * 392], C.skin, 41, 12);
  return sk;
}

/* ---------- 2. 궁금증: 코르크는 왜 가볍고 탱탱할까 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  table(sk, 470, 548, 450, 51);
  floatBowl(sk, 610, 548, 61);
  bottle(sk, 826, 548, 0.92, 71);
  // 훅: 코르크를 두 손으로 꾹 누른다(양옆에서 안쪽으로 미는 화살표)
  const P = pose({ elR: [96, -262], haR: [118, -318], elL: [-10, -258], haL: [38, -318], tilt: 0.1 });
  const fx = 200, fy = 704, fs = 0.8;
  drawFigure(sk, fx, fy, fs, P, { ...HOOKE, name: "hooke", face: "curious", hands: false });
  const cx = fx + fs * 78, cy = fy - fs * 318;
  const c2 = rrect(cx - 18, cy - 24, 36, 48, 9);
  sk.fill(c2, CORK, { seed: 81, tex: true }); sk.ink(c2, { w: 8, seed: 82 });
  handDot(sk, [fx + fs * 38, cy], C.skin, 83, 12);
  handDot(sk, [fx + fs * 118, cy], C.skin, 84, 12);
  arrow(sk, [[cx - 104, cy - 2], [cx - 60, cy - 2]], { w: 6, color: C.teal, seed: 85, straight: true, head: 14 });
  arrow(sk, [[cx + 104, cy - 2], [cx + 60, cy - 2]], { w: 6, color: C.teal, seed: 86, straight: true, head: 14 });
  qmark(sk, 470, 300, 0.7, { color: C.teal, seed: 87 });
  return sk;
}

/* ---------- 3. 관찰 준비: 면도칼처럼 간 칼, 검은 받침, 모은 불빛 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  table(sk, 240, 548, 690, 91);
  // 오른쪽: 등잔 → 소금물 유리공 → 볼록한 유리 → 현미경 받침의 검은 판
  const [lx, ly] = lamp(sk, 880, 548, 0.9, 92);
  const [gx, gy] = globe(sk, 784, 548, 40, 93);
  const [ex, ey] = lensStand(sk, 700, 548, 104, 94);
  microscope(sk, 560, 548, 1.0, { seed: 95, sample: false });
  const plate = rrect(500, 498, 92, 14, 5);
  sk.fill(plate, "#2E2E33", { seed: 96, dx: 0.6, dy: 0.8 }); sk.ink(plate, { w: 6, seed: 97 });
  const slice = ell(546, 495, 22, 5);
  sk.fill(slice, "#F6E7C8", { dx: 0, dy: 0, wob: 0.3, seed: 98 }); sk.ink(slice, { w: 4, color: CORK_DARK, seed: 99, wob: 0.3 });
  for (const [dy, i] of [[-14, 0], [0, 1], [14, 2]]) {
    sk.ink(dense([[lx - 18, ly + dy * 0.4], [gx + 40, gy + dy]]), { w: 5, color: C.yellow, seed: 100 + i, wob: 0.3 });
    sk.ink(dense([[gx - 40, gy + dy], [ex + 10, ey + dy * 0.8]]), { w: 5, color: C.yellow, seed: 103 + i, wob: 0.3 });
    sk.ink(dense([[ex - 10, ey + dy * 0.8], [552, 490]]), { w: 5, color: C.yellow, seed: 106 + i, wob: 0.3 });
  }
  sparkle(sk, 548, 474, 10, { seed: 109, color: C.lemon, w: 4 });
  // 왼쪽: 코르크 덩이 윗면을 칼로 얇게 저민다(칼날이 지나간 자리에서 얇은 조각이 말려 올라온다)
  const block = rrect(330, 500, 96, 48, 10);
  sk.fill(block, CORK, { seed: 110, tex: true }); sk.ink(block, { w: 8, seed: 111 });
  const cutP = pose({ neck: [14, -338], head: [34, -428], tilt: 0.18, elR: [86, -284], haR: [146, -272], elL: [-48, -260], haL: [-58, -188] });
  const fx = 132, fy = 704, fs = 0.74;
  drawFigure(sk, fx, fy, fs, cutP, { ...HOOKE, name: "hooke", face: "determined", hands: "L" });
  const hx = fx + fs * 146, hy = fy - fs * 272;
  // 칼: 갈색 손잡이 + 덩이 윗면을 따라 미는 칼날
  const handle = poly([[hx - 14, hy - 8], [hx + 34, hy - 12], [hx + 36, hy + 4], [hx - 12, hy + 8]], 3);
  sk.fill(handle, "#8A5A33", { dx: 0, dy: 0, wob: 0.3, seed: 112 }); sk.ink(handle, { w: 6, seed: 113, wob: 0.3 });
  const blade = poly([[hx + 34, hy - 10], [hx + 128, hy - 6], [hx + 136, hy + 2], [hx + 36, hy + 4]], 3);
  sk.fill(blade, "#C9CED6", { dx: 0, dy: 0, wob: 0.3, seed: 114 }); sk.ink(blade, { w: 5, seed: 115, wob: 0.3 });
  sk.ink(dense([[hx + 50, hy - 4], [hx + 120, hy - 2]]), { w: 3, color: C.white, seed: 116, wob: 0.2 });
  // 칼날 끝에서 말려 올라오는 얇은 조각
  const tx = hx + 134, ty = hy - 6;
  const peel = [...curve([[tx - 6, ty + 4], [tx + 8, ty - 14], [tx + 26, ty - 22], [tx + 36, ty - 14]], false, 3), ...curve([[tx + 36, ty - 14], [tx + 24, ty - 12], [tx + 10, ty - 4], [tx + 2, ty + 6]], false, 3)];
  sk.fill(peel, "#F6E7C8", { dx: 0, dy: 0, wob: 0.2, seed: 117 }); sk.ink(peel, { w: 4, color: CORK_DARK, seed: 118, wob: 0.2 });
  handDot(sk, [hx, hy], C.skin, 119, 11);
  return sk;
}

/* ---------- 4. 발견: 벌집 같은 빈 칸과 얇은 벽 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  corkView(sk, 318, 424, 240, { seed: 901, a: 30, w: 6 });
  // 훅: 한 손에 벌집 조각을 들어 견주고, 한 손은 머리 바깥으로 번쩍
  const P = pose({ elL: [-96, -312], haL: [-190, -338], elR: [138, -330], haR: [206, -430], tilt: -0.04 });
  const fx = 800, fy = 704, fs = 0.8;
  drawFigure(sk, fx, fy, fs, P, { ...HOOKE, name: "hooke", face: "happy", hands: "R" });
  const hx = fx - fs * 190, hy = fy - fs * 338;
  honeycomb(sk, hx - 6, hy - 62, 54, 121);
  handDot(sk, [hx, hy], C.skin, 131, 12);
  emark(sk, 936, 236, 0.8, { color: C.red, rot: 0.14 });
  return sk;
}

/* ---------- 5. 1665년: 책 「마이크로그라피아」와 '셀' ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  // '셀'이라는 말의 뜻 카드(훅의 생각이 아니라 말풀이다): 코르크의 칸 하나 = 작은 방 하나
  meaningCard(sk, 560, 300, 360, 200, 142);
  // 훅: 책을 펴서 옆으로 들어 보인다
  const P = pose({ elR: [92, -300], haR: [204, -318], elL: [-56, -262], haL: [-22, -222], tilt: 0.04 });
  const fx = 224, fy = 704, fs = 0.8;
  drawFigure(sk, fx, fy, fs, P, { ...HOOKE, name: "hooke", face: "smile", hands: "L" });
  const bx = fx + fs * 204 + 34, by = fy - fs * 318 + 18;
  openBook(sk, bx, by, 0.74, 151);
  handDot(sk, [fx + fs * 204, fy - fs * 318], C.skin, 152, 12);
  return sk;
}

/* ---------- 6. 셈해 보기: 1인치에 1000칸 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  // 코르크 마개와, 윗면의 아주 짧은 한 토막(점 하나 크기)을 크게 늘여 본 칸의 줄.
  // 축척: 마개 지름 약 24 mm, 훅의 셈으로 1 mm에 약 43칸. 띠의 24칸은 0.6 mm쯤이라 마개 지름의 40분의 1, 점 하나다.
  corkPlug(sk, 236, 660, 180, 250, 171);
  const sy = 236, x0 = 84, x1 = 600, n = 24, cw = (x1 - x0) / n, top = sy - 30, bot = sy + 30;
  const strip = rrect(x0 - 20, sy - 44, x1 - x0 + 40, 88, 18);
  sk.fill(strip, "#FBF3E2", { dx: 0, dy: 0, wob: 0.5, seed: 172 });
  // 벽을 나눠 쓰는 한 줄의 칸: 위아래 벽은 길게 이어지고, 칸 사이 벽은 하나씩. 양 끝은 흐려져 줄이 더 이어짐을 보인다
  const fade = i => (i < 3 ? (3 - i) / 3.6 : i > n - 3 ? (i - n + 3) / 3.6 : 0);
  for (let i = 0; i < n; i++) {
    const col = mix(CORK_DARK, "#FBF3E2", fade(i));
    const xa = x0 + i * cw, xb = xa + cw, j = (hash(173 + i) - 0.5) * cw * 0.3;
    sk.ink(dense([[xa, top + (hash(180 + i) - 0.5) * 6], [xb, top + (hash(181 + i) - 0.5) * 6]]), { w: 5, color: col, seed: 190 + i, wob: 0.3 });
    sk.ink(dense([[xa, bot + (hash(182 + i) - 0.5) * 6], [xb, bot + (hash(183 + i) - 0.5) * 6]]), { w: 5, color: col, seed: 220 + i, wob: 0.3 });
    if (i > 0) sk.ink(dense([[xa + j, top], [xa - j, bot]]), { w: 5, color: col, seed: 250 + i, wob: 0.3 });
  }
  sk.ink(strip, { w: 10, color: "#B8892E", seed: 200 });
  // 마개 윗면 가운데의 아주 작은 빨간 점에서 칸의 줄로 이어지는 점선
  const ax = 236, ty = 660 - 250;
  sk.dot(ax, ty, 6, C.red);
  sk.ink(dense([[ax - 4, ty - 6], [x0 - 18, sy + 44]]), { w: 5, color: C.gray, dash: [12, 10], seed: 203, wob: 0.3 });
  sk.ink(dense([[ax + 4, ty - 6], [x1 + 18, sy + 44]]), { w: 5, color: C.gray, dash: [12, 10], seed: 204, wob: 0.3 });
  // 훅: 놀라서 두 손을 머리 바깥으로 넓게 든다
  const P = pose({ elL: [-134, -330], haL: [-206, -432], elR: [134, -330], haR: [206, -432], tilt: 0.04 });
  drawFigure(sk, 764, 704, 0.74, P, { ...HOOKE, name: "hooke", face: "shock" });
  return sk;
}

/* ---------- 7. 1674년, 델프트: 호수 물 속의 작은 생물 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  const cx = 670, cy = 382, r = 250;
  const ring = circ(cx, cy, r, { over: 0.12, seed: 211 });
  sk.fill(ring, "#EAF6FC", { dx: 0, dy: 0, wob: 0.6, seed: 212 });
  // 몸이 세포 하나인 작은 생물들: 섬모를 단 타원, 꼬리 달린 초록 몸
  const ciliate = (x, y, rot, col, sd) => sk.at(x, y, 1, () => {
    const b = ell(0, 0, 42, 24);
    sk.fill(b, col, { dx: 0, dy: 0, wob: 0.6, seed: sd, tex: 0.7 }); sk.ink(b, { w: 6, color: "#2F7D46", seed: sd + 1, wob: 0.6 });
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; sk.ink(dense([[46 * Math.cos(a), 28 * Math.sin(a)], [58 * Math.cos(a), 36 * Math.sin(a)]]), { w: 3.5, color: "#2F7D46", seed: sd + 2 + i, wob: 0.2 }); }
    sk.dot(10, -2, 6, "#2F7D46");
  }, rot);
  const flagellate = (x, y, rot, sd) => sk.at(x, y, 1, () => {
    const b = curve([[-30, 0], [-10, -16], [26, -12], [34, 0], [26, 12], [-10, 16]], true, 3);
    sk.fill(b, "#7CC86F", { dx: 0, dy: 0, wob: 0.5, seed: sd }); sk.ink(b, { w: 6, color: "#2F7D46", seed: sd + 1, wob: 0.5 });
    sk.ink(curve([[34, 0], [52, -10], [66, 6], [82, -6]]), { w: 4, color: "#2F7D46", seed: sd + 2, wob: 0.3 });
    sk.dot(18, -2, 4.5, C.red);
  }, rot);
  ciliate(590, 268, -0.3, "#9BD67A", 221); ciliate(780, 330, 0.5, "#B7E08A", 241);
  flagellate(612, 470, 0.2, 261); flagellate(770, 500, -0.5, 271);
  // 초록 실 같은 조류(속에 나선 띠)
  const fil = curve([[490, 362], [560, 372], [640, 366], [702, 378]]);
  sk.ink(fil, { w: 30, color: "#2F7D46", seed: 281, wob: 0.4 }); sk.ink(fil, { w: 20, color: "#A8DB8F", seed: 281, wob: 0.4 });
  const zig = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14, x = lerp(496, 696, t), y = lerp(363, 377, t) + Math.sin(t * 10) * 2 + (i % 2 ? 6 : -6); zig.push([x, y]); }
  sk.ink(zig, { w: 4, color: "#2F7D46", seed: 282, wob: 0.2 });
  for (const [x, y, rot, i] of [[656, 236, 0.6, 0], [800, 432, -0.4, 1], [540, 520, 0.2, 2]]) sk.ink(curve([[x, y], [x + 14 * Math.cos(rot), y + 14 * Math.sin(rot) - 10], [x + 26 * Math.cos(rot), y + 26 * Math.sin(rot)]]), { w: 4, color: C.gray, seed: 290 + i, wob: 0.2 });
  sk.ink(ring, { w: 13, seed: 293, color: "#B8892E" });
  // 레이우엔훅: 손바닥만 한 금속판 현미경을 한쪽 눈 바로 앞에 대고, 판 너머의 시료 바늘을 들여다본다
  const P = pose({ elR: [92, -318], haR: [40, -372], elL: [-56, -262], haL: [-22, -222], tilt: 0.06 });
  const fx = 196, fy = 704, fs = 0.76;
  drawFigure(sk, fx, fy, fs, P, { ...LEEUWENHOEK, name: "leeu", face: "wide", hands: "L" });
  const ex = fx + fs * 30, ey = fy - fs * 424; // 오른쪽 눈 자리
  const plate = rrect(ex - 17, ey - 30, 34, 58, 7);
  sk.fill(plate, "#D2A84A", { seed: 294, tex: true }); sk.ink(plate, { w: 6, seed: 295 });
  sk.dot(ex, ey - 6, 5, "#DDF1FB");
  // 판 앞쪽의 시료 바늘(끝에 물방울)
  sk.ink(dense([[ex + 17, ey + 14], [ex + 40, ey + 8], [ex + 40, ey - 8]]), { w: 4, color: "#8A8A90", seed: 298, wob: 0.2 });
  sk.dot(ex + 40, ey - 12, 4.5, "#8CC8EC");
  handDot(sk, [fx + fs * 40, fy - fs * 372], C.skin, 296, 12);
  sk.ink(dense([[ex + 52, ey - 14], [cx - r + 24, cy - 70]]), { w: 5, color: C.gray, dash: [12, 10], seed: 297, wob: 0.4 });
  // 호수에서 떠 온 물 한 병
  const jar = curve([[316, 704], [306, 640], [318, 600], [318, 584], [362, 584], [362, 600], [374, 640], [364, 704]], true, 4);
  sk.fill(jar, "#CFEBD0", { seed: 298, dx: 0.8, dy: 1, alpha: 0.95 }); sk.ink(jar, { w: 8, seed: 299 });
  sk.ink(curve([[316, 640], [340, 634], [366, 640]]), { w: 5, color: "#5FAE6B", seed: 300, wob: 0.3 });
  return sk;
}

/* ---------- 8. 오늘날: 사람의 몸도 세포로 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  bodyCellsView(sk, 684, 300, 226, { seed: 911, s: 50 });
  // 학생: 손바닥을 들여다본다
  const P = pose({ elR: [66, -300], haR: [112, -356], elL: [-56, -262], haL: [-22, -222], tilt: 0.1 });
  const fx = 200, fy = 704, fs = 0.8;
  drawFigure(sk, fx, fy, fs, P, { ...STUDENT, name: "student", hands: "L" });
  const hx = fx + fs * 112, hy = fy - fs * 356;
  handDot(sk, [hx, hy], C.skin, 311, 20);
  sk.ink(dense([[hx + 22, hy - 12], [476, 212]]), { w: 5, color: C.gray, dash: [12, 10], seed: 312, wob: 0.4 });
  sk.ink(dense([[hx + 22, hy + 12], [500, 420]]), { w: 5, color: C.gray, dash: [12, 10], seed: 313, wob: 0.4 });
  // 양파 반쪽과 나뭇잎(식물), 고양이 머리(동물)
  const on = curve([[430, 668], [404, 640], [410, 600], [446, 574], [470, 552], [494, 574], [530, 600], [536, 640], [510, 668]], false, 4);
  sk.fill([...on, on[0]], "#F1E3F0", { seed: 314 }); sk.ink([...on, on[0]], { w: 9, seed: 315 });
  for (const k of [0.36, 0.68]) sk.ink(curve([[470 - 62 * k, 664], [470 - 56 * k, 620], [470, 568 + 40 * (1 - k)], [470 + 56 * k, 620], [470 + 62 * k, 664]]), { w: 5, color: "#B58DB0", seed: 316 + k * 10, wob: 0.4 });
  const leaf = curve([[606, 660], [636, 604], [706, 584], [736, 610], [712, 664], [652, 682]], true, 4);
  sk.fill(leaf, C.green, { seed: 320, tex: true }); sk.ink(leaf, { w: 9, seed: 321 });
  sk.ink(curve([[618, 662], [672, 630], [726, 606]]), { w: 5, color: "#2F7D46", seed: 322, wob: 0.4 });
  // 고양이 얼굴(동물의 대표, 얼굴 없이 귀와 수염만)
  const cat = curve([[790, 680], [782, 626], [800, 588], [812, 556], [830, 580], [858, 576], [876, 552], [890, 584], [904, 626], [896, 680]], true, 4);
  sk.fill(cat, "#F2B263", { seed: 323, tex: true }); sk.ink(cat, { w: 9, seed: 324 });
  for (const [y, i] of [[640, 0], [652, 1]]) { sk.ink(dense([[790, y], [758, y - 4 + i * 8]]), { w: 4, seed: 325 + i, wob: 0.2 }); sk.ink(dense([[896, y], [928, y - 4 + i * 8]]), { w: 4, seed: 327 + i, wob: 0.2 }); }
  return sk;
}

export const META = {
  title: "코르크 속<br><em>작은 방</em>의 발견",
  lead: "가벼운 코르크 한 조각에서 세포를 부르는 이름, 셀(cell)이 태어났어요.",
  narrator: "1660년대 영국 런던, 현미경이 아직 신기한 도구였던 때로 가 볼까요? 한 과학자가 코르크를 얇게 저며 들여다본 일이 <b>생물학에서 가장 유명한 이름</b>으로 이어져요.",
  cta: "직접 크게 보러 가기",
};

const TEXT = [
  {
    when: "1663년 4월, 영국 런던", stage: "숙제", title: "모임마다 하나씩",
    caption: "1663년 4월, 영국 런던의 과학 모임 <b>왕립학회</b>가 <b>로버트 훅</b>에게 숙제를 냈어요. 모임 때마다 현미경 관찰을 하나 이상 가져오라는 숙제였지요. 훅은 이 모임에서 실험을 맡은 사람이었거든요.",
    bubbles: [{ who: "memberA", text: "다음 모임에도<br>보여 주게!" }],
  },
  {
    when: "1663년, 영국 런던", whenPos: "tr", stage: "궁금증", title: "코르크는 왜 가벼울까",
    caption: "훅이 고른 것 가운데 하나는 코르크참나무의 껍질인 <b>코르크</b>였어요. 아주 가벼워 물에 둥둥 뜨고, 꾹 누르면 들어갔다가 다시 펴지지요. 훅은 그 까닭이 코르크 속의 생김새에 있을 거라고 생각했어요.",
    bubbles: [{ who: "hooke", text: "눌러도<br>다시 펴지네?" }],
  },
  {
    when: "1663년, 영국 런던", whenPos: "tr", stage: "관찰 준비", title: "면도칼처럼 날카롭게",
    caption: "훅은 면도칼처럼 날카롭게 간 칼로 코르크를 <b>아주 얇게</b> 저몄어요. 하얀 조각이 잘 보이도록 검은 받침에 올리고, 볼록한 유리로 빛을 모아 비췄지요. 밤에는 소금물을 채운 유리공으로 등잔 불빛을 모으는 장치를 썼어요.",
    bubbles: [{ who: "hooke", text: "종잇장보다<br>얇게!" }],
  },
  {
    when: "1663년, 영국 런던", stage: "발견", title: "벌집 같은 작은 칸들",
    caption: "렌즈 너머로 <b>작은 칸</b>이 벌집처럼 빼곡했어요. 칸 속은 텅 비고 <b>얇은 벽</b>만 있었지요. 코르크가 가벼운 것은 칸마다 공기가 들어 있어서였어요. 훅은 이런 칸을 본 사람은 아마 자기가 처음일 거라고 적었어요.",
    bubbles: [{ who: "hooke", text: "벌집하고<br>닮았네!" }],
  },
  {
    when: "1665년, 영국 런던", stage: "이름 짓기", title: "작은 방, 셀(cell)",
    caption: "1665년, 훅은 그동안의 관찰 그림을 모아 책 「마이크로그라피아」를 펴냈어요. 책에서 코르크의 칸을 <b>셀(cell)</b>이라고 불렀는데, '작은 방'을 뜻하는 말이에요. 우리말로는 <b>세포</b>라고 해요.",
    term: { name: "세포(cell)", def: "'작은 방'이라는 뜻의 말에서 온 이름이에요. 생물을 이루는 기본 단위예요." },
  },
  {
    when: "1665년, 영국 런던", stage: "셈해 보기", title: "칸은 몇 개일까",
    caption: "이 책에는 훅이 코르크의 칸을 세어 본 결과도 실렸어요. 1인치(약 2.5 cm) 길이에 칸이 1000개 넘게 늘어서니, 가로, 세로, 높이가 1인치인 코르크라면 칸이 12억 개가 넘는다는 셈이었지요. 칸 하나가 맨눈으로는 안 보일 만큼 작은 거예요.",
    bubbles: [{ who: "hooke", text: "믿기지<br>않는 수!" }],
  },
  {
    when: "1674년, 네덜란드 델프트", stage: "살아 있는 세포", title: "물방울 속의 작은 생물",
    caption: "1674년, 네덜란드 델프트의 <b>레이우엔훅</b>은 손수 만든 작은 현미경으로 호수에서 떠 온 물을 들여다봤어요. 그 속에서 작은 생물들이 헤엄치고 있었지요. 몸 전체가 세포 하나뿐인 생물도 많았어요. 훅이 본 빈 칸과 달리 이 세포들은 <b>살아서 움직였어요</b>.",
    bubbles: [{ who: "leeu", text: "움직인다!" }],
  },
  {
    when: "오늘날", stage: "오늘", title: "사람의 몸도 세포로",
    caption: "오늘날 우리는 식물도 동물도 모두 세포로 이루어져 있다는 것을 알아요. 1839년 무렵 과학자들이 밝혀낸 사실이지요. 사람의 몸도 마찬가지예요. 어른 한 사람의 몸에는 세포가 <b>약 37조 개</b>나 있어요.",
    bubbles: [{ who: "student", text: "내 몸도<br>칸칸이?", dy: 6 }],
  },
];

export function panels() {
  return [p1, p2, p3, p4, p5, p6, p7, p8].map((fn, i) => ({ sk: fn(), ...TEXT[i] }));
}
