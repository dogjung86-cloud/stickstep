// 중1 과학 u7l3 만화 v2: 900년 전 그림 속 태양의 점(광구, 흑점, 쌀알 무늬, 11년 주기, 플레어, 태양풍, 우주 날씨). 8컷.
// 조사와 콘티: qa/sketch/research/u7l3.md
//   1 1128년 영국 우스터, 수도사 존의 연대기에 남은 흑점 그림 → 2 흰 판에 비춘 해: 광구와 흑점 → 3 쌀알 무늬와 대류(된장국)
//   → 4 1843년 슈바베: 늘었다 줄었다(11년) → 5 1859년 캐링턴: 하얀 섬광(플레어) → 6 이튿날: 오로라와 전신기 불꽃(태양풍)
//   → 7 2024년 5월 강원 화천의 붉은 오로라 → 8 오늘날 우주 날씨 예보(통신, 인공위성, 정전)
// 2026-11-23 저작권 손질: 옛 1컷(1151년 고려의 흑점 기록)을 1128년 우스터의 흑점 그림으로 바꿨다.
// 그림 속에 글자와 숫자는 넣지 않는다. 해를 맨눈으로 똑바로 보는 사람은 그리지 않는다(1컷의 수도사는 책에 그림을 그린다).
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, hash, emark, xmark, check, sparkle, drop, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, R } from "../lib/figure.mjs";
import { earth, satellite, openBook } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
const SUN = "#FFC93C", SUN_LANE = "#D9822B", RED = "#F0603A", NIGHT = "#1B2138";
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

// 독일의 약사 슈바베(1843년 쉰네 살): 희끗한 짧은 머리 + 짙은 초록 외투
const SCHWABE = { hair: "short", hairColor: "#B9B3A7", fringe: 24, coat: { color: "#4A5D4F", buttons: C.gold, seam: "#2F3D33" }, seed: 331, mini: true, face: "calm" };
// 리처드 캐링턴(1859년 서른세 살): 짧은 짙은 머리 + 짙은 프록코트 + 검은 매듭 넥타이. 생김새를 적은 기록이 없어 수염은 그리지 않는다
const CARRINGTON = { hair: "short", hairColor: "#4A3A30", fringe: 24, coat: { color: "#3A3F4A", seam: "#24272E", buttons: "#7A7F88" }, bowtie: "#24272E", seed: 311, mini: true, face: "calm" };
// 전신국 직원(이름 없음), 화천의 사진가 둘(이름 없음)
const OPERATOR = { hair: "short", hairColor: "#6B4A32", fringe: 24, coat: { color: "#8A6A4A", seam: "#5E4632", len: 30 }, seed: 341 };
const PHOTO_A = { hair: "knit", capColor: "#3F7CC0", coat: { color: "#5A6B7D", seam: "#3E4A57", len: 44 }, seed: 351 };
const PHOTO_B = { hair: "short", hairColor: "#3F3A36", coat: { color: "#B5483B", seam: "#7E2E25", len: 44 }, seed: 361 };

/* ---------- 해와 그 무늬 ---------- */

// 흑점: 가운데(진한 곳)와 둘레(조금 연한 곳)
function spot(sk, x, y, r, sd) {
  const pen = circ(x, y, r, { over: 0.15, seed: sd, lump: 0.14 });
  sk.fill(pen, "#9A5A2A", { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 });
  sk.fill(circ(x + r * 0.05, y - r * 0.04, r * 0.56, { over: 0.15, seed: sd + 2, lump: 0.14 }), "#2E211C", { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 });
}
// 해 원반(광구). spots: [[dx, dy, k]] 반지름에 대한 비율, rays: 둘레 빛살 수
function sunDisc(sk, cx, cy, r, o = {}) {
  const sd = o.seed ?? 401;
  if (o.rays) for (let i = 0; i < o.rays; i++) { const a = i * Math.PI * 2 / o.rays + 0.2, r0 = r * 1.22, r1 = r * 1.5; sk.ink(dense([[cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)], [cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)]]), { w: Math.max(5, r * 0.11), color: C.orange, wob: 0.4, seed: sd + 60 + i }); }
  const g = circ(cx, cy, r, { over: 0.1, seed: sd });
  sk.fill(g, o.color ?? SUN, { dx: 1, dy: 1.2, wob: 0.8, seed: sd + 1, tex: o.tex ?? true, texAng: 0.5 });
  (o.spots ?? []).forEach(([dx, dy, k], i) => spot(sk, cx + dx * r, cy + dy * r, k * r, sd + 10 + i * 4));
  sk.ink(g, { w: o.w ?? Math.max(7, Math.min(11, r * 0.06)), seed: sd + 2 });
}
// 쌀알 무늬: 어두운 바탕(식어서 가라앉는 길) 위에 밝은 알갱이(뜨거워 올라오는 칸)를 촘촘히. 원 안에만 그린다
function granules(sk, cx, cy, r, gap, sd, col = SUN, lane = SUN_LANE, light = "#FFE08A") {
  sk.fill(circ(cx, cy, r, { over: 0.1, seed: sd }), lane, { dx: 0, dy: 0, wob: 0.5, seed: sd + 1 });
  let n = 0;
  for (let row = -12; row <= 12; row++) for (let col2 = -12; col2 <= 12; col2++) {
    const x = cx + col2 * gap + (row % 2 ? gap / 2 : 0) + (hash(sd + n * 3.7) - 0.5) * gap * 0.1;
    const y = cy + row * gap * 0.87 + (hash(sd + n * 5.1) - 0.5) * gap * 0.1;
    n++;
    if (Math.hypot(x - cx, y - cy) > r - gap * 0.55) continue;
    const pts = [];
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6 + (hash(sd + n * 7 + k) - 0.5) * 0.3, rr = gap * (0.44 + 0.06 * hash(sd + n * 11 + k)); pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); }
    sk.fill(curve(pts, true, 3), n % 4 ? col : light, { dx: 0, dy: 0, wob: 0.4, seed: sd + 100 + n });
  }
}
// 하얀 섬광(플레어): 흰 별 모양 + 주황 테
function flash(sk, x, y, r, sd) {
  const st = [];
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + 0.2, rr = k % 2 ? r * 0.42 : r; st.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); }
  sk.fill(poly(st, 3), C.white, { dx: 0, dy: 0, wob: 0.3, seed: sd });
  sk.ink(poly(st, 3), { w: Math.max(4, r * 0.2), color: C.orange, seed: sd + 1, wob: 0.3 });
}
// 해에서 흘러나오는 입자의 흐름: 점을 줄지어 찍고 끝에 화살촉
function stream(sk, a, b, sd, n = 7) {
  for (let i = 0; i < n; i++) { const u = i / n; sk.dot(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 5.5 - u * 1.5, C.orange); }
  arrow(sk, [[a[0] + (b[0] - a[0]) * 0.86, a[1] + (b[1] - a[1]) * 0.86], b], { w: 6, color: C.orange, seed: sd, straight: true, head: 16, wob: 0.2 });
}
// 흐린 안개(가로 물결 줄)
const haze = (sk, x0, x1, ys, sd) => ys.forEach((y, i) => sk.ink(curve([[x0 + i * 14, y], [(x0 + x1) / 2 - 60, y - 8], [(x0 + x1) / 2 + 60, y + 6], [x1 - i * 18, y - 2]]), { w: 16, color: "#ECE6DA", seed: sd + i, wob: 0.8, alpha: 0.92 }));
// 밤하늘의 별: 밝은 네 갈래 빛(외곽선도 밝은 색)
function star(sk, x, y, r, sd) {
  const pts = [];
  for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * 0.32 : r; pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); }
  sk.fill(poly(pts, 3), "#FFF3C4", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  sk.ink(poly(pts, 3), { w: 2.5, color: "#FFE7A0", wob: 0.3, seed: sd + 1 });
}
// 오로라 커튼: 아래 테두리를 따라 위로 뻗는 빛 줄기. 넓고 옅은 줄 위에 가늘고 조금 진한 줄을 겹쳐 부드럽게
function aurora(sk, pts, len, cols, sd, alpha = 0.85) {
  pts.forEach(([x, y], i) => {
    const l = len * (0.6 + 0.6 * hash(sd + i * 3.3)), col = cols[i % cols.length], sw = 10 * Math.sin(i * 1.7);
    const c = curve([[x, y], [x + sw, y - l * 0.5], [x - sw * 0.6, y - l]]);
    sk.ink(c, { w: 34, color: col, seed: sd + i, wob: 0.8, alpha: alpha * 0.22 });
    sk.ink(c, { w: 9, color: col, seed: sd + 60 + i, wob: 0.8, alpha: alpha * 0.55 });
  });
}

/* ---------- 소품 ---------- */

// 망원경: (x0, y0) = 접안부(아래), (x1, y1) = 대물부(위). 세 다리 받침
function telescope(sk, x0, y0, x1, y1, tw, foot, sd) {
  const ang = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(ang) * tw / 2, ny = Math.cos(ang) * tw / 2;
  const mx = x0 + (x1 - x0) * 0.42, my = y0 + (y1 - y0) * 0.42;
  thin(sk, 0.9, () => {
    for (const [fx, i] of [[mx - 70, 0], [mx + 6, 1], [mx + 80, 2]]) sk.ink(dense([[mx, my + 10], [fx, foot]]), { w: 9, seed: sd + i, wob: 0.4 });
    const tube = poly([[x0 + nx, y0 + ny], [x1 + nx * 1.15, y1 + ny * 1.15], [x1 - nx * 1.15, y1 - ny * 1.15], [x0 - nx, y0 - ny]], 4);
    sk.fill(tube, "#C9A24A", { seed: sd + 4, tex: true, texAng: ang }); sk.ink(tube, { w: 10, seed: sd + 5 });
  });
}
// 해를 비추는 흰 판: 네 꼭짓점. 판 위의 해 그림은 따로 그린다
function board(sk, pts, sd, col = "#FFF7DE") {
  thin(sk, 0.9, () => { sk.fill(poly(pts, 4), col, { dx: 1, dy: 1.2, wob: 0.5, seed: sd }); sk.ink(poly(pts, 4), { w: 10, seed: sd + 1 }); });
}
// 뚝배기의 된장국: 국물 위에 구름 같은 대류 무늬. (x, y) = 국물 면 가운데
function soupBowl(sk, x, y, rx, sd) {
  thin(sk, 0.9, () => {
    const body = [...curve([[x - rx - 12, y], [x - rx + 6, y + 70], [x - rx * 0.6, y + 120], [x + rx * 0.6, y + 120], [x + rx - 6, y + 70], [x + rx + 12, y]], false, 4)];
    sk.fill([...body, body[0]], "#6B4A32", { seed: sd, tex: true, texAng: 0.05 }); sk.ink([...body, body[0]], { w: 10, seed: sd + 1 });
    const surf = ell(x, y, rx + 6, rx * 0.26);
    // 국물 면: 쌀알 무늬와 같은 칸(밝은 칸은 올라오는 국물, 어두운 틈은 가라앉는 국물)을 비스듬히 본 모습
    sk.save(); sk.translate(x, y); sk.scale(1, 0.26);
    granules(sk, 0, 0, rx + 4, 40, sd + 50, "#E2B36A", "#8A5226", "#EFC985");
    sk.restore();
    sk.ink(surf, { w: 9, seed: sd + 3 });
    for (const sg of [-1, 1]) sk.ink(dense([[x + sg * (rx + 10), y + 30], [x + sg * (rx + 34), y + 30]]), { w: 12, seed: sd + 4 + sg, wob: 0.4 });
  });
  // 김
  for (const [dx, i] of [[-50, 0], [10, 1], [62, 2]]) sk.ink(curve([[x + dx, y - 30], [x + dx - 10, y - 60], [x + dx + 8, y - 92], [x + dx - 4, y - 124]]), { w: 6, color: C.gray, seed: sd + 40 + i, wob: 0.4, alpha: 0.8 });
}
// 약병이 놓인 선반(약국)
function shelf(sk, x, y, w, sd) {
  thin(sk, 0.85, () => {
    for (const [dy, i] of [[0, 0], [130, 1]]) {
      const b = rrect(x, y + dy, w, 16, 4); sk.fill(b, C.wood, { seed: sd + i, tex: true, texAng: 0.02 }); sk.ink(b, { w: 9, seed: sd + 2 + i });
      for (let k = 0; k < 4; k++) {
        const jx = x + 30 + k * (w - 60) / 3, jh = 60 + (k % 2) * 16;
        const jar = rrect(jx - 20, y + dy - jh, 40, jh, 10);
        sk.fill(jar, ["#9FC7D9", "#E9C38A", "#B9D6A5", "#D9A9A0"][(k + i) % 4], { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 10 + k + i * 4 });
        sk.ink(jar, { w: 8, seed: sd + 20 + k + i * 4 });
        const lid = rrect(jx - 14, y + dy - jh - 12, 28, 12, 4); sk.fill(lid, "#8A6A4A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 30 + k }); sk.ink(lid, { w: 6, seed: sd + 40 + k });
      }
    }
  });
}
// 공책 더미. (x, y) = 바닥 가운데
function bookStack(sk, x, y, n, sd) {
  for (let i = 0; i < n; i++) {
    const yy = y - i * 22, off = (hash(sd + i) - 0.5) * 16;
    const b = rrect(x - 64 + off, yy - 22, 128, 22, 5);
    sk.fill(b, ["#6E8FA8", "#B5814C", "#5E7B5A", "#B0504A", "#8A6BAA"][i % 5], { dx: 0, dy: 0, wob: 0.4, seed: sd + i });
    sk.ink(b, { w: 7, seed: sd + 20 + i, wob: 0.4 });
  }
}
// 전신기: 받침 위의 누름쇠(키). (x, y) = 받침 바닥 가운데
function telegraphKey(sk, x, y, sd) {
  const base = rrect(x - 70, y - 22, 140, 22, 6); sk.fill(base, "#8A5A33", { seed: sd, tex: true, texAng: 0.02 }); sk.ink(base, { w: 8, seed: sd + 1 });
  sk.ink(dense([[x - 50, y - 34], [x + 50, y - 46]]), { w: 9, color: "#B8892E", seed: sd + 2, wob: 0.2 });
  sk.ink(dense([[x - 30, y - 22], [x - 30, y - 36]]), { w: 8, seed: sd + 3, wob: 0.2 });
  const knob = circ(x + 54, y - 50, 11, { over: 0.2, seed: sd + 4 }); sk.fill(knob, C.ink, { dx: 0, dy: 0, wob: 0.3 }); sk.ink(knob, { w: 5, seed: sd + 5 });
}
// 불꽃(지그재그 번개 모양)
function zap(sk, x, y, s, sd, rot = 0) {
  sk.at(x, y, s, () => {
    const b = poly([[0, -40], [-16, -2], [-2, -2], [-14, 38], [18, -12], [4, -12], [14, -40]], 3);
    sk.fill(b, C.yellow, { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(b, { w: 6, seed: sd + 1, wob: 0.3 });
  }, rot);
}
// 삼각대에 올린 사진기. (x, y) = 다리 바닥 가운데, 렌즈는 왼쪽 위를 본다
function camera(sk, x, y, sd) {
  thin(sk, 0.9, () => {
    for (const [fx, i] of [[x - 50, 0], [x, 1], [x + 50, 2]]) sk.ink(dense([[x, y - 150], [fx, y]]), { w: 8, seed: sd + i, wob: 0.3 });
  });
  sk.at(x, y - 172, 1, () => {
    const body = rrect(-38, -26, 76, 52, 10); sk.fill(body, "#39424E", { seed: sd + 4, dx: 0.6, dy: 0.8 }); sk.ink(body, { w: 8, seed: sd + 5 });
    const lens = rrect(-70, -18, 36, 36, 8); sk.fill(lens, "#5A5F68", { dx: 0, dy: 0, wob: 0.3, seed: sd + 6 }); sk.ink(lens, { w: 7, seed: sd + 7 });
  }, 0.5);
}
// 송전탑. (x, y) = 바닥 가운데, s = 크기
function pylon(sk, x, y, s, sd) {
  thin(sk, 0.8, () => sk.at(x, y, s, () => {
    sk.ink(dense([[-50, 0], [-12, -230]]), { w: 9, color: "#5A5F68", seed: sd, wob: 0.3 }); sk.ink(dense([[50, 0], [12, -230]]), { w: 9, color: "#5A5F68", seed: sd + 1, wob: 0.3 });
    for (const [y0, y1, i] of [[0, -80, 0], [-80, -160, 1]]) { const k0 = 50 - (-y0) * 38 / 230, k1 = 50 - (-y1) * 38 / 230; sk.ink(dense([[-k0, y0], [k1, y1]]), { w: 6, color: "#5A5F68", seed: sd + 2 + i, wob: 0.2 }); sk.ink(dense([[k0, y0], [-k1, y1]]), { w: 6, color: "#5A5F68", seed: sd + 4 + i, wob: 0.2 }); }
    for (const [yy, ww, i] of [[-170, 74, 0], [-214, 56, 1]]) sk.ink(dense([[-ww, yy], [ww, yy]]), { w: 8, color: "#5A5F68", seed: sd + 6 + i, wob: 0.2 });
  }));
}
// 안테나(전파): 세로 막대 + 물결 두 겹. (x, y) = 바닥
function antenna(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    sk.ink(dense([[0, 0], [0, -110]]), { w: 8, seed: sd, wob: 0.3 }); sk.ink(dense([[-26, 0], [0, -64], [26, 0]], 3), { w: 7, seed: sd + 1, wob: 0.3 });
    for (const rr of [22, 40]) sk.ink(ell(0, -110, rr, rr, -2.5, -0.64), { w: 6, color: C.blue, seed: sd + 2 + rr, wob: 0.2 });
  });
}

/* ---------- 1. 1128년 우스터: 해 안에 검은 점이 둘 ---------- */
// 수도사 존(이름 있는 인물이라 작은 얼굴): 정수리를 깎은 머리 + 검은 수도복
const MONK = { hair: "bald", coat: { color: "#2E2A30", seam: "#151317", len: 182 }, seed: 221, mini: true, face: "wide" };
// 정수리를 둥글게 깎은 머리(머리 둘레의 띠만 남는다). 머리 중심과 축척, 기울기에 맞춰 덧그린다
function tonsure(sk, x, y, s, p, sd = 231) {
  sk.save(); sk.translate(x + s * p.head[0], y + s * p.head[1]); sk.scale(s, s); sk.rotate(p.tilt ?? 0);
  const band = curve([[-104, 16], [-102, -26], [-82, -56], [-42, -68], [0, -70], [42, -68], [82, -56], [102, -26], [104, 16]]);
  sk.ink(band, { w: 30, color: "#6B4A32", seed: sd, wob: 0.6 });
  sk.ink(curve([[-82, -40], [-40, -52], [0, -54], [40, -52], [82, -40]]), { w: 5, color: "#4A3226", seed: sd + 1, wob: 0.4 });
  sk.restore();
}
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  // 돌벽과 바닥
  sk.fill(poly([[-10, -10], [970, -10], [970, 730], [-10, 730]], 8), "#EEE6D6", { dx: 0, dy: 0, wob: 0, seed: 3, tex: false });
  for (const [y, x0, x1, i] of [[150, 40, 260, 0], [250, 120, 420, 1], [560, 30, 180, 2], [190, 330, 520, 3]]) sk.ink(dense([[x0, y], [x1, y]]), { w: 4, color: "#D8CDBA", seed: 5 + i, wob: 0.6 });
  sk.fill(poly([[-10, 690], [970, 690], [970, 730], [-10, 730]], 4), "#D6C8AC", { dx: 0, dy: 0, wob: 0.5, seed: 9, tex: true, texAng: 0.02 });
  sk.ink(dense([[-10, 690], [970, 690]]), { w: 9, seed: 10 });
  // 둥근 아치 창: 낮게 걸려 붉게 흐려진 겨울 해, 그 안의 검은 점 둘(위는 크고 아래는 작다)
  const L = 600, Rx = 890, top = 250, bot = 456, cx = (L + Rx) / 2, rr = (Rx - L) / 2;
  const shape = [...curve([[L, bot], [L, top]], false, 4), ...ell(cx, top, rr, rr, Math.PI, 2 * Math.PI), ...curve([[Rx, top], [Rx, bot]], false, 4)];
  shape.push(shape[0]);
  sk.fill(shape, "#E8EEF2", { dx: 0, dy: 0, wob: 0.4, seed: 11, tex: false });
  const hill = [...curve([[L + 6, 420], [690, 404], [780, 416], [Rx - 6, 400]], false, 4), [Rx - 6, bot - 4], [L + 6, bot - 4]];
  hill.push(hill[0]);
  sk.fill(hill, "#C9D6C0", { dx: 0, dy: 0, wob: 0.3, seed: 12 });
  sunDisc(sk, 745, 318, 84, { color: RED, seed: 401, spots: [[-0.04, -0.34, 0.21], [0.05, 0.36, 0.14]] });
  haze(sk, 612, 878, [252, 388], 13);
  thin(sk, 0.8, () => {
    sk.ink(shape, { w: 14, color: "#8F8474", seed: 15 });
    const sill = rrect(L - 26, bot - 4, Rx - L + 52, 24, 6); sk.fill(sill, "#CFC4B0", { seed: 16, tex: true, texAng: 0.02 }); sk.ink(sill, { w: 9, seed: 17 });
  });
  // 비스듬한 글 쓰는 책상과 펼친 연대기: 오른쪽 쪽에 해와 두 점을 그려 넣었다
  thin(sk, 0.85, () => {
    sk.ink(dense([[444, 520], [444, 690]]), { w: 14, color: "#6B4A32", seed: 21, wob: 0.3 });
    sk.ink(dense([[380, 690], [508, 690]]), { w: 12, color: "#6B4A32", seed: 22, wob: 0.3 });
    const desk = poly([[330, 528], [560, 476], [566, 500], [336, 552]], 3);
    sk.fill(desk, "#9C6B3E", { seed: 23, tex: true, texAng: -0.22 }); sk.ink(desk, { w: 10, seed: 24 });
  });
  openBook(sk, 448, 512, 0.88, { color: "#7A3E2E", seed: 25, rot: -0.22, lines: false });
  sk.at(448, 512, 0.88, () => {
    const d = circ(42, -40, 18, { over: 0.1, seed: 27 });
    sk.ink(d, { w: 4, color: "#4A3226", seed: 28, wob: 0.2 });
    sk.dot(38, -47, 4.5, "#2E211C"); sk.dot(45, -31, 3, "#2E211C");
    for (let i = 0; i < 3; i++) sk.ink(curve([[-66, -50 + i * 10], [-40, -54 + i * 10], [-14, -50 + i * 10]]), { w: 3, color: C.gray, seed: 29 + i, wob: 0.2 });
  }, -0.22);
  // 수도사 존: 깃펜을 책에 대고 창밖의 해를 본다
  const P = pose({ elR: [124, -280], haR: [224, -326], elL: [-50, -262], haL: [-24, -212], tilt: 0.04 });
  const fx = 254, fy = 690, fs = 0.74;
  drawFigure(sk, fx, fy, fs, P, { ...MONK, name: "john", look: 0.7 });
  tonsure(sk, fx, fy, fs, P);
  const qh = [fx + fs * 224, fy - fs * 326];
  sk.ink(curve([[qh[0] + 8, qh[1] + 10], [qh[0] - 14, qh[1] - 34], [qh[0] - 34, qh[1] - 64]]), { w: 7, color: "#F4F1EA", seed: 41, wob: 0.3 });
  sk.ink(curve([[qh[0] + 8, qh[1] + 10], [qh[0] - 14, qh[1] - 34], [qh[0] - 34, qh[1] - 64]]), { w: 2.5, color: "#8A8F98", seed: 42, wob: 0.2 });
  handDot(sk, qh, C.skin, 43, 11);
  return sk;
}

/* ---------- 2. 흰 판에 비춘 해: 광구와 흑점 ---------- */
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 704, 61);
  sunDisc(sk, 880, 100, 40, { seed: 421, rays: 10, tex: false, w: 7 });
  telescope(sk, 560, 470, 800, 230, 38, 704, 63);
  sk.ink(dense([[812, 214], [852, 128]]), { w: 5, color: C.yellow, dash: [8, 8], seed: 69, wob: 0 });
  // 접안부 뒤에 세운 흰 판
  sk.ink(dense([[556, 474], [508, 470]]), { w: 6, color: "#5A5F68", seed: 70, wob: 0.3 });
  board(sk, [[262, 316], [508, 300], [520, 590], [274, 604]], 71);
  const cx = 391, cy = 452, r = 104;
  sunDisc(sk, cx, cy, r, { seed: 441, color: "#FFE48A", w: 6, tex: false, spots: [[-0.3, -0.2, 0.17], [0.34, 0.26, 0.08], [0.42, 0.12, 0.05], [-0.04, 0.5, 0.06]] });
  earth(sk, cx - 0.3 * r + 34, cy - 0.2 * r - 4, 12, { seed: 941, w: 4 });
  const P = pose({ elR: [88, -316], haR: [158, -330], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 130, 704, 0.66, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 3. 광구를 크게: 쌀알 무늬와 대류 ---------- */
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 704, 71);
  const cx = 330, cy = 390, r = 190;
  // 작은 해와 그 한 조각을 크게 본다는 확대 선
  sunDisc(sk, 110, 110, 64, { seed: 421, tex: false, w: 7, spots: [[0.3, 0.2, 0.14]] });
  sk.ink(poly([[118, 72], [150, 72], [150, 104], [118, 104]], 3), { w: 5, color: C.ink, seed: 168, wob: 0.2 });
  for (const [a, b, i] of [[[150, 72], [cx + r * 0.71, cy - r * 0.71]], [[118, 104], [cx - r * 0.71, cy + r * 0.71]]].map((v, i) => [...v, i])) sk.ink(dense([a, b]), { w: 4, color: C.gray, dash: [10, 9], seed: 166 + i, wob: 0 });
  granules(sk, cx, cy, r, 52, 501);
  // 알갱이 하나를 크게: 가운데로 올라오고(빨강) 가장자리로 내려간다(파랑)
  const g = []; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; g.push([cx + 62 * Math.cos(a), cy + 62 * Math.sin(a)]); }
  sk.fill(curve(g, true, 3), "#FFE08A", { dx: 0, dy: 0, wob: 0.4, seed: 169 }); sk.ink(curve(g, true, 3), { w: 6, color: "#B5651D", seed: 170, wob: 0.4 });
  arrow(sk, [[cx, cy + 30], [cx, cy - 34]], { w: 8, color: C.red, seed: 171, straight: true, head: 18, wob: 0.2 });
  for (const sg of [-1, 1]) arrow(sk, [[cx + sg * 72, cy - 34], [cx + sg * 72, cy + 30]], { w: 7, color: C.blue, seed: 172 + sg, straight: true, head: 16, wob: 0.2 });
  sk.ink(circ(cx, cy, r, { over: 0.1, seed: 73 }), { w: 13, color: "#B8892E", seed: 175 });
  sk.ink(dense([[cx - r * 0.72, cy + r * 0.72], [cx - r * 0.72 - 60, cy + r * 0.72 + 66]]), { w: 16, color: "#8A5A33", seed: 176, wob: 0.5 });
  // 뚝배기의 된장국에도 같은 대류 무늬
  soupBowl(sk, 700, 560, 110, 181);
  const P = pose({ elL: [-86, -300], haL: [-150, -318], elR: [50, -260], haR: [24, -218], tilt: -0.05 });
  drawFigure(sk, 856, 704, 0.62, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- 4. 1843년 슈바베: 늘었다 줄었다 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  ground(sk, 704, 81);
  shelf(sk, 40, 330, 250, 83);
  // 벽에 붙인 기록 종이: 흑점 수의 오르내림(눈금과 숫자 없이)
  const px0 = 470, px1 = 930, py0 = 120, py1 = 400;
  board(sk, [[px0, py0], [px1, py0 + 6], [px1 - 6, py1], [px0 + 4, py1 - 4]], 85, "#FBF6E6");
  const wave = []; for (let i = 0; i <= 40; i++) { const u = i / 40; wave.push([px0 + 30 + u * (px1 - px0 - 60), 300 - 90 * Math.sin(u * Math.PI * 3.4 - 1.2)]); }
  sk.ink(curve(wave, false, 4), { w: 8, color: C.teal, seed: 87, wob: 0.4 });
  // 봉우리(흑점 많음)와 골짜기(흑점 적음)의 작은 해
  const peakU = [(1.2 + Math.PI / 2) / (Math.PI * 3.4), (1.2 + Math.PI * 2.5) / (Math.PI * 3.4)];
  const lowU = [(1.2 + Math.PI * 1.5) / (Math.PI * 3.4)];
  for (const [u, i] of peakU.map((u, i) => [u, i])) sunDisc(sk, px0 + 30 + u * (px1 - px0 - 60), 168, 34, { seed: 471 + i * 20, w: 6, tex: false, spots: [[-0.4, -0.2, 0.18], [0.3, 0.3, 0.16], [0.36, -0.3, 0.14], [-0.1, 0.42, 0.13], [0, -0.02, 0.12]] });
  for (const [u, i] of lowU.map((u, i) => [u, i])) sunDisc(sk, px0 + 30 + u * (px1 - px0 - 60), 360, 30, { seed: 531 + i * 20, w: 6, tex: false, spots: [[0.2, -0.1, 0.16]] });
  // 열일곱 해 동안 쌓인 관측 공책
  bookStack(sk, 820, 704, 9, 91);
  // 슈바베: 기록 종이를 가리킨다
  const P = pose({ elR: [96, -340], haR: [168, -398], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 380, 704, 0.66, P, { ...SCHWABE, name: "schwabe", face: "smile" });
  return sk;
}

/* ---------- 5. 1859년 9월 1일 캐링턴: 하얀 섬광 ---------- */
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  ground(sk, 704, 91);
  // 관측실 창 너머의 해(빛은 망원경으로만 들어간다)
  thin(sk, 0.85, () => { const win = rrect(690, 40, 240, 230, 12); sk.fill(win, "#CFE6F5", { dx: 0, dy: 0, wob: 0.4, seed: 94 }); sk.ink(win, { w: 10, seed: 95 }); sk.ink(dense([[810, 40], [810, 270]]), { w: 8, seed: 96, wob: 0.3 }); });
  sunDisc(sk, 872, 112, 36, { seed: 451, w: 6, tex: false });
  telescope(sk, 730, 490, 862, 286, 36, 704, 97);
  sk.ink(dense([[868, 268], [872, 152]]), { w: 5, color: C.yellow, dash: [8, 8], seed: 102, wob: 0 });
  // 흰 판에 비춘 해: 큰 흑점 무리 옆에서 하얀 빛 두 점이 터졌다
  sk.ink(dense([[726, 494], [404, 462]]), { w: 6, color: "#5A5F68", seed: 104, wob: 0.3 });
  board(sk, [[120, 300], [400, 284], [410, 600], [130, 616]], 105);
  const bx = 265, by = 450, br = 118;
  sunDisc(sk, bx, by, br, { seed: 461, color: "#FFE48A", w: 6, tex: false, spots: [[0.06, -0.3, 0.13], [0.3, -0.36, 0.09], [-0.12, -0.42, 0.07], [0.24, -0.16, 0.06], [-0.42, 0.34, 0.06]] });
  for (const [dx, dy, rr, i] of [[0.12, 0.06, 30, 0], [0.5, -0.12, 25, 1]]) { sk.glow(bx + dx * br, by + dy * br, rr * 1.9, "#FFFFFF", 0.95, 0.3); flash(sk, bx + dx * br, by + dy * br, rr, 107 + i * 2); }
  // 캐링턴: 판 쪽으로 돌아서서 놀란다
  const P = pose({ elL: [-90, -320], haL: [-160, -350], elR: [56, -262], haR: [40, -210], tilt: -0.06 });
  drawFigure(sk, 488, 704, 0.62, P, { ...CARRINGTON, name: "carrington", face: "shock" });
  return sk;
}

/* ---------- 6. 이튿날: 오로라와 전신기의 불꽃 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 704, 111);
  // 창 너머 밤하늘의 오로라(어두운 면은 창 안, 그림 위쪽에만)
  const wx0 = 520, wx1 = 930, wy0 = 40, wy1 = 330;
  sk.fill(rrect(wx0, wy0, wx1 - wx0, wy1 - wy0, 12), NIGHT, { dx: 0, dy: 0, wob: 0.3, seed: 113 });
  const base = []; for (let i = 0; i < 16; i++) base.push([wx0 + 30 + i * 24, 250 + 18 * Math.sin(i * 0.7)]);
  aurora(sk, base, 150, ["#E0503A", "#F07A5A", "#4ED28A", "#7BE0A8"], 115, 0.8);
  for (const [x, y, rr, i] of [[560, 80, 7, 0], [700, 64, 8, 1], [890, 90, 7, 2], [620, 140, 6, 3]]) star(sk, x, y, rr, 130 + i);
  thin(sk, 0.85, () => { sk.ink(rrect(wx0, wy0, wx1 - wx0, wy1 - wy0, 12), { w: 10, seed: 134 }); sk.ink(dense([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]]), { w: 8, seed: 135, wob: 0.3 }); });
  // 전신 책상: 누름쇠에서 불꽃이 튀고, 벽을 타고 나가는 전선
  thin(sk, 0.85, () => {
    sk.ink(dense([[150, 540], [150, 704]]), { w: 11, color: "#6B4A32", seed: 137, wob: 0.3 }); sk.ink(dense([[470, 540], [470, 704]]), { w: 11, color: "#6B4A32", seed: 138, wob: 0.3 });
    const top = rrect(120, 516, 380, 26, 8); sk.fill(top, C.wood, { seed: 139, tex: true, texAng: 0.02 }); sk.ink(top, { w: 10, seed: 140 });
  });
  sk.ink(curve([[318, 500], [250, 470], [150, 440], [70, 380], [56, 300]]), { w: 6, color: C.ink, seed: 141, wob: 0.3 });
  const ins = rrect(44, 280, 26, 22, 6); sk.fill(ins, "#FBF6E6", { dx: 0, dy: 0, wob: 0.3, seed: 142 }); sk.ink(ins, { w: 5, seed: 142 });
  telegraphKey(sk, 370, 516, 143);
  zap(sk, 446, 444, 0.9, 147, 0.3); zap(sk, 338, 430, 0.7, 149, -0.4);
  // 종이 띠에 붙은 작은 불
  const tape = poly([[200, 516], [290, 512], [292, 500], [202, 504]], 3); sk.fill(tape, "#FBF6E6", { dx: 0, dy: 0, wob: 0.3, seed: 151 }); sk.ink(tape, { w: 5, seed: 152 });
  const fl = curve([[236, 500], [228, 474], [242, 448], [252, 474], [262, 462], [258, 500]], true, 3); sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: 153 }); sk.ink(fl, { w: 5, color: C.red, seed: 154, wob: 0.3 });
  // 전신국 직원: 깜짝 놀라 두 손을 든다
  const P = pose({ elL: [-96, -350], haL: [-150, -430], elR: [96, -350], haR: [150, -430], tilt: -0.06 });
  drawFigure(sk, 640, 704, 0.6, P, { ...OPERATOR, name: "operator" });
  drop(sk, 730, 360, 0.9);
  return sk;
}

/* ---------- 7. 2024년 5월 강원 화천: 붉은 오로라 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  // 밤하늘(위쪽 띠)과 북쪽 산 위의 희미한 붉은빛(오로라). 사람의 몸은 아래의 밝은 들판에 둔다
  const sky = [[-12, -12], [972, -12], [972, 330], [-12, 330]];
  sk.fill(poly(sky, 4), NIGHT, { dx: 0, dy: 0, wob: 0, seed: 201 });
  for (const [x, y, rr] of [[140, 250, 170], [380, 230, 200], [640, 240, 190], [870, 250, 170]]) sk.glow(x, y, rr, "#E0503A", 0.42, 0.15);
  const rays = []; for (let i = 0; i < 18; i++) rays.push([90 + i * 46, 290 + 8 * Math.sin(i * 0.9)]);
  aurora(sk, rays, 170, ["#E0503A", "#C0392B", "#E26A6A"], 203, 0.5);
  for (const [x, y, rr, i] of [[470, 50, 8, 0], [620, 100, 7, 1], [880, 60, 8, 2], [760, 26, 6, 3], [520, 140, 6, 4]]) star(sk, x, y, rr, 230 + i);
  const hill = [...curve([[-12, 330], [140, 282], [300, 318], [470, 276], [640, 312], [820, 284], [972, 310]], false, 5), [972, 372], [-12, 372]];
  hill.push(hill[0]);
  sk.fill(hill, "#3E4E5E", { dx: 0, dy: 0, wob: 0, seed: 240 });
  const field = [[-12, 368], [972, 368], [972, 732], [-12, 732]];
  sk.fill(poly(field, 4), "#E7EEF2", { dx: 0, dy: 0, wob: 0, seed: 241 });
  sk.ink(curve([[-12, 370], [300, 364], [640, 372], [972, 366]]), { w: 9, seed: 242 });
  ground(sk, 704, 243);
  // 사진가 둘: 삼각대의 사진기와 하늘을 가리키는 사람
  camera(sk, 560, 704, 251);
  const PA = pose({ elR: [70, -300], haR: [120, -340], elL: [-50, -260], haL: [-24, -218] });
  drawFigure(sk, 680, 704, 0.6, PA, { ...PHOTO_A, name: "photoA" });
  const PB = pose({ elL: [-100, -340], haL: [-160, -420], elR: [50, -260], haR: [24, -218], tilt: -0.08 });
  drawFigure(sk, 330, 704, 0.6, PB, { ...PHOTO_B, name: "photoB" });
  return sk;
}

/* ---------- 8. 오늘날: 우주 날씨 예보 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  ground(sk, 704, 301);
  // 커다란 예보 화면: 해에서 지구로 부는 바람
  const sx0 = 300, sx1 = 940, sy0 = 60, sy1 = 420;
  thin(sk, 0.85, () => { const scr = rrect(sx0, sy0, sx1 - sx0, sy1 - sy0, 18); sk.fill(scr, "#22304A", { dx: 0, dy: 0, wob: 0.3, seed: 303 }); sk.ink(scr, { w: 12, seed: 304 }); sk.ink(dense([[620, sy1], [620, sy1 + 40]]), { w: 12, seed: 305 }); sk.ink(dense([[560, sy1 + 40], [680, sy1 + 40]]), { w: 12, seed: 306 }); });
  sunDisc(sk, 410, 240, 78, { seed: 471, rays: 12, spots: [[-0.3, -0.2, 0.14], [0.2, 0.3, 0.12], [0.34, -0.3, 0.1], [-0.1, 0.44, 0.09]] });
  stream(sk, [512, 200], [700, 230], 311, 8); stream(sk, [512, 262], [700, 282], 312, 8); stream(sk, [506, 320], [692, 330], 313, 8);
  const ex = 800, ey = 270, er = 70;
  aurora(sk, [[ex - 40, ey - er + 10], [ex - 16, ey - er + 2], [ex + 10, ey - er + 2], [ex + 34, ey - er + 10]], 46, ["#4ED28A", "#7BE0A8"], 315, 0.9);
  earth(sk, ex, ey, er, { seed: 941, w: 8 });
  satellite(sk, 860, 140, 0.42, { seed: 961 });
  zap(sk, 800, 120, 0.6, 321, 0.2);
  // 화면 아래: 끊길 수 있는 것들
  antenna(sk, 340, 704, 1, 331); xmark(sk, 390, 540, 0.34, { w: 13, seed: 333 });
  pylon(sk, 800, 704, 0.9, 335); xmark(sk, 860, 470, 0.34, { w: 13, seed: 337 });
  // 꺼진 전구(정전)
  const lx = 600, ly = 640;
  const bulb = circ(lx, ly - 22, 26, { over: 0.15, seed: 343 });
  sk.fill(bulb, "#C9CCD2", { dx: 0, dy: 0, wob: 0.4, seed: 344 }); sk.ink(bulb, { w: 7, seed: 345 });
  const sock = rrect(lx - 13, ly + 2, 26, 22, 5); sk.fill(sock, "#55595F", { dx: 0, dy: 0, wob: 0.3, seed: 346 }); sk.ink(sock, { w: 6, seed: 347 });
  sk.ink(dense([[lx, ly + 24], [lx, 704]]), { w: 6, seed: 348, wob: 0.3 });
  const P = pose({ elR: [88, -316], haR: [158, -350], elL: [-50, -260], haL: [-24, -218], tilt: 0.06 });
  drawFigure(sk, 150, 704, 0.66, P, { ...TEACHER, name: "teacher" });
  return sk;
}

export const META = {
  title: "900년 전 그림 속<br><em>태양의 점</em>",
  lead: "900년쯤 전 영국의 한 수도사가 남긴 흑점 그림에서 오늘날의 우주 날씨 예보까지 따라가 봐요.",
  narrator: "1128년 겨울, 영국의 한 수도사는 해 안에 나타난 <b>검은 점</b> 두 개를 연대기에 그려 남겼어요. 그 점은 지구에까지 큰 영향을 주는 <b>태양 활동</b>의 신호였답니다.",
  cta: "태양 살펴보기",
};

const CUTS = [
  {
    fn: p1, when: "1128년 12월, 영국 우스터", stage: "옛 기록", title: "해 안에 검은 점이 둘",
    caption: "영국 우스터의 수도사 <b>존</b>은 1128년 12월 8일의 일을 연대기에 적었어요. “아침부터 저녁까지 해 안에 <b>검은 공</b> 같은 것이 두 개 보였다. 위의 것은 크고 아래 것은 작았다.” 그리고 그 모습을 그림으로도 남겼지요. 지금까지 알려진 가장 오래된 흑점 그림이에요.",
    bubbles: [{ who: "john", text: "해 안에 검은<br>점이 둘!" }],
  },
  {
    fn: p2, stage: "점의 정체", title: "흰 판에 비추어 보면",
    caption: "태양을 맨눈이나 망원경으로 직접 보면 위험하기 때문에 망원경을 지난 햇빛을 <b>흰 판</b>에 비추어 관찰해요. 이때 보이는 태양의 둥근 표면이 <b>광구</b>이고, 그 위의 어두운 점이 <b>흑점</b>이에요. 흑점은 주위보다 온도가 낮아 어둡게 보일 뿐 실제로는 수천 도로 무척 뜨거워요.",
    term: { name: "흑점", def: "광구에서 주위보다 온도가 낮아 어둡게 보이는 무늬로, 지구보다 큰 것도 있어요." },
    bubbles: [{ who: "teacher", text: "지구보다<br>커요!" }],
  },
  {
    fn: p3, stage: "광구 확대", title: "끓어오르는 쌀알 무늬",
    caption: "광구를 크게 확대하면 쌀알을 촘촘히 뿌려 놓은 듯한 <b>쌀알 무늬</b>가 보여요. 광구 아래에서 뜨거운 물질이 위로 올라오고 식은 물질이 아래로 내려가는 <b>대류</b> 때문에 생기는 무늬이지요. 마치 냄비 속 된장국이 보글보글 끓어오르는 모습과 비슷해요.",
    term: { name: "쌀알 무늬", def: "광구 아래의 대류로 생기는 쌀알 모양의 무늬예요." },
    bubbles: [{ who: "teacher", text: "된장국에도<br>있어요!" }],
  },
  {
    fn: p4, when: "1843년, 독일 데사우", stage: "세고 또 세고", title: "늘었다 줄었다 하는 흑점",
    caption: "독일의 <b>슈바베</b>는 17년 동안 맑은 날마다 태양을 관측하며 흑점의 개수를 꼼꼼히 기록했어요. 그 결과 흑점 수가 일정한 주기로 많아졌다 적어지기를 되풀이한다는 사실을 밝혀냈지요. 오늘날에는 이 주기가 <b>약 11년</b>이라는 것이 알려져 있어요.",
    bubbles: [{ who: "schwabe", text: "늘었다가<br>줄었다가!" }],
  },
  {
    fn: p5, when: "1859년 9월 1일, 영국 레드힐", stage: "태양의 폭발", title: "흑점 옆의 하얀 섬광",
    caption: "영국의 <b>캐링턴</b>은 흰 판에 비춘 해에서 흑점을 그리고 있었어요. 그때 커다란 흑점 무리 옆에서 눈부시게 하얀 빛 두 점이 터졌다가 5분 만에 사라졌어요. 사람이 처음으로 똑똑히 기록한 <b>플레어</b>예요.",
    term: { name: "플레어", def: "흑점 부근에서 일어나는 강한 폭발로, 많은 물질과 에너지가 쏟아져 나와요." },
    bubbles: [{ who: "carrington", text: "누가 좀<br>와 봐요!" }],
  },
  {
    fn: p6, when: "1859년 9월 2일 새벽, 미국", stage: "지구까지", title: "다음 날 밤하늘과 전신기",
    caption: "캐링턴이 섬광을 본 지 하루도 안 되어, 해에서 쏟아진 전기를 띤 입자의 흐름인 <b>태양풍</b>이 거세게 지구에 닿았어요. 쿠바와 하와이처럼 따뜻한 곳의 하늘에도 <b>오로라</b>가 번졌고, 전보를 보내는 전신기에서 불꽃이 튀어 통신이 끊긴 곳이 많았어요.",
    term: { name: "태양풍", def: "태양에서 우주로 나오는 전기를 띤 입자의 흐름으로, 태양이 활발할수록 강해져요." },
    bubbles: [{ who: "operator", text: "앗,<br>불꽃이!" }],
  },
  {
    fn: p7, when: "2024년 5월, 강원 화천", stage: "우리 하늘", title: "우리나라에서 찍힌 오로라",
    caption: "흑점이 많던 2024년 5월, 아주 거센 태양풍이 지구에 닿았어요. 5월 12일 새벽 강원도 화천에서 <b>붉은 오로라</b>가 사진에 찍혔어요. 맨눈으로는 희미했지만 오래 찍은 사진에는 또렷했지요.",
    bubbles: [{ who: "photoB", text: "붉은빛이<br>보여요!" }],
  },
  {
    fn: p8, stage: "오늘날", title: "우주 날씨 예보",
    caption: "태양 활동이 활발해져 태양풍이 거세지면 지구에서 무선 통신이 끊기거나 <b>인공위성</b> 고장, 대규모 <b>정전</b>이 일어나기도 해요. 실제로 1989년 캐나다에서는 큰 정전으로 600만 명이 불편을 겪었지요. 그래서 오늘날에는 날마다 태양을 관측하며 <b>우주 날씨</b>를 예보하고 있답니다.",
    bubbles: [{ who: "teacher", text: "우주 날씨<br>예보예요" }],
  },
];

export function panels() {
  return CUTS.map(c => ({ sk: c.fn(), bubbles: c.bubbles, when: c.when, whenPos: c.whenPos, stage: c.stage, title: c.title, caption: c.caption, term: c.term }));
}
