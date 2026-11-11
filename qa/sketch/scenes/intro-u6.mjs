// 중1 과학 Ⅵ 도입(opener) 네 장면의 그림(손그림 코드 그림). intro-u1.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   bear (u6l1) 얇은 얼음판 위의 북극곰: 네 발로 선 모습과 엎드린 모습, 발밑의 금
//   wrap (u6l3) 뽁뽁이의 공기 방울 하나(크게)와 누르는 손가락
//   foil (u6l4) 따뜻한 방과 눈 오는 밖, 은박 풍선을 든 아이
//   pong (u6l5) 찌그러진 탁구공과 뜨거운 물이 담긴 그릇
// node qa/sketch/build-intro.mjs u6 이 build(add)를 불러 src/ui/introArt.u6.generated.ts 에 싣는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, squiggle, sparkle, emark } from "../lib/sk.mjs";
import { drawFigure, pose, STUDENT } from "../lib/figure.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const rect = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 8);
const flat = { dx: 0, dy: 0, wob: 0.5, tex: false };

/* ══════════ 1. 얼음판 위의 북극곰 (u6l1) ══════════
   곰은 왼쪽에서 출발한다. 앱이 곰 묶음을 오른쪽으로 옮긴다(GO). 선 곰이 한 걸음 내디딘 자리에 금이 간다. */
export const BR = { go: 380, step: 110, iceY: 396 };
const ICE = BR.iceY;

function bearHead(sk, x, y, sd) {
  for (const dx of [-30, 26]) {
    const ear = circ(x + dx, y - 44, 17, { over: 0.1, seed: sd + dx });
    sk.fill(ear, "#FFFFFF", { ...flat, seed: sd + 1 }); sk.ink(ear, { w: 7, wob: 0.5, seed: sd + 2 });
  }
  const head = circ(x, y, 54, { over: 0.1, seed: sd + 3 });
  sk.fill(head, "#FFFFFF", { ...flat, seed: sd + 4 }); sk.ink(head, { w: 9, wob: 0.7, seed: sd + 5 });
  const snout = ell(x + 34, y + 14, 30, 22);
  sk.fill(snout, "#F3F6F8", { ...flat, seed: sd + 6 }); sk.ink(snout, { w: 7, wob: 0.5, seed: sd + 7 });
  sk.fill(circ(x + 56, y + 6, 9, { seed: sd + 8 }), C.ink, { ...flat, seed: sd + 9 });
  sk.fill(circ(x + 6, y - 10, 6, { seed: sd + 10 }), C.ink, { ...flat, seed: sd + 11 });
}
function leg(sk, pts, sd) {
  const p = poly(pts, 4);
  sk.fill(p, "#FFFFFF", { ...flat, seed: sd }); sk.ink(p, { w: 8, wob: 0.6, seed: sd + 1 });
}
function bearStand(sk, cx) {
  for (const [x, i] of [[cx - 108, 0], [cx - 62, 1], [cx + 56, 2], [cx + 102, 3]]) leg(sk, [[x - 19, ICE - 120], [x + 19, ICE - 120], [x + 17, ICE - 2], [x - 17, ICE - 2]], 110 + i * 3);
  const body = ell(cx, ICE - 158, 150, 70);
  sk.fill(body, "#FFFFFF", { ...flat, seed: 131 }); sk.ink(body, { w: 9, wob: 0.9, seed: 132 });
  bearHead(sk, cx + 168, ICE - 196, 140);
}
function bearFlat(sk, cx) {
  leg(sk, [[cx + 110, ICE - 34], [cx + 236, ICE - 30], [cx + 240, ICE - 3], [cx + 110, ICE - 3]], 160);
  leg(sk, [[cx - 236, ICE - 30], [cx - 110, ICE - 34], [cx - 110, ICE - 3], [cx - 240, ICE - 3]], 164);
  const body = ell(cx, ICE - 56, 168, 56);
  sk.fill(body, "#FFFFFF", { ...flat, seed: 171 }); sk.ink(body, { w: 9, wob: 0.9, seed: 172 });
  bearHead(sk, cx + 176, ICE - 104, 180);
}

export function bearBase() {
  const sk = new Sk(W, H, { id: "br" });
  sk.fill(rect(0, 0, W, H), "#E4F1FA", { ...flat, wob: 0, seed: 1 });
  // 바다와 얇은 얼음판
  sk.fill(rect(0, ICE + 20, W, H - ICE - 20), C.sea, { ...flat, wob: 0, seed: 2 });
  for (const [x, y, i] of [[90, 470, 0], [420, 500, 1], [760, 466, 2]]) sk.ink(curve([[x, y], [x + 24, y - 7], [x + 48, y], [x + 72, y - 7], [x + 96, y]]), { w: 5, color: "#FFFFFF", wob: 0.3, seed: 5 + i });
  const ice = poly([[24, ICE], [936, ICE], [926, ICE + 34], [34, ICE + 34]], 8);
  sk.fill(ice, "#FBFEFF", { ...flat, seed: 11 });
  sk.ink(ice, { w: 8, wob: 0.9, seed: 12 });
  // 금(선 곰이 한 걸음 내디딘 자리의 발밑)
  g(sk, "opn-u6-ice-crack", () => {
    const cx = 250 + BR.step;
    for (const [x, i] of [[cx - 85, 0], [cx + 79, 1]]) {
      sk.ink(dense([[x - 34, ICE + 3], [x - 12, ICE + 14], [x - 20, ICE + 24], [x, ICE + 33]], 3), { w: 6, wob: 0.3, seed: 21 + i });
      sk.ink(dense([[x + 30, ICE + 3], [x + 14, ICE + 12], [x + 24, ICE + 22], [x + 10, ICE + 33]], 3), { w: 6, wob: 0.3, seed: 25 + i });
      sk.ink(dense([[x - 2, ICE + 2], [x + 4, ICE + 16]], 3), { w: 5, wob: 0.3, seed: 29 + i });
    }
    emark(sk, cx + 268, ICE - 282, 1, { color: C.red, w: 15, seed: 33 });
  });
  g(sk, "opn-u6-ice-bear", () => {
    g(sk, "opn-u6-ice-stand", () => bearStand(sk, 250));
    g(sk, "opn-u6-ice-flat", () => bearFlat(sk, 250));
  });
  return { sk };
}

/* ══════════ 2. 뽁뽁이의 공기 방울 (u6l3) ══════════
   가운데의 큰 방울 하나를 손가락이 누른다. 앱이 방울을 세로로 줄이고 손가락을 그만큼 내린다. */
export const WR = { cx: 480, baseY: 446, ry: 176, hit: [250, 40, 460, 420] };

export function wrapBase() {
  const sk = new Sk(W, H, { id: "wr" });
  const { cx, baseY, ry } = WR;
  const dome = (x, rx, r2, sd, cls) => {
    const d = [...ell(x, baseY, rx, r2, Math.PI, Math.PI * 2), ...dense([[x + rx, baseY], [x - rx, baseY]], 6)];
    const draw = () => {
      sk.fill(d, "#DDF0FA", { ...flat, seed: sd });
      sk.ink(d, { w: 9, wob: 0.8, seed: sd + 1 });
      sk.ink(ell(x - rx * 0.1, baseY - r2 * 0.1, rx * 0.72, r2 * 0.74, Math.PI * 1.12, Math.PI * 1.4), { w: 7, color: "#FFFFFF", wob: 0.4, seed: sd + 2 });
    };
    if (cls) g(sk, cls, draw); else draw();
  };
  // 바닥의 비닐 한 장과 양옆의 작은 방울
  const sheet = poly([[40, baseY], [920, baseY], [920, baseY + 22], [40, baseY + 22]], 8);
  sk.fill(sheet, "#C9E4F2", { ...flat, seed: 3 });
  sk.ink(sheet, { w: 8, wob: 0.8, seed: 4 });
  dome(140, 74, 62, 11);
  dome(820, 74, 62, 15);
  dome(cx, 196, ry, 21, "opn-u6-wrap-cap");
  // 손가락(위에서 내려온다)
  g(sk, "opn-u6-wrap-finger", () => {
    const f = rrect(cx - 40, -70, 80, baseY - ry + 60, 40);
    sk.fill(f, C.skin, { ...flat, seed: 31 });
    sk.ink(f, { w: 9, wob: 0.7, seed: 32 });
    sk.ink(ell(cx, baseY - ry - 34, 24, 20, Math.PI, Math.PI * 2), { w: 6, color: "#D9A98C", wob: 0.3, seed: 33 });
  });
  return { sk };
}

/* ══════════ 3. 은박 풍선과 겨울 (u6l4) ══════════
   왼쪽은 따뜻한 방, 오른쪽은 눈 오는 밖. 앱이 아이 묶음을 오른쪽으로 옮기고 풍선을 쭈그러든 그림으로 바꾼다. */
export const FO = { go: 400, doorX: 500 };

function heartPts(cx, cy, s) {
  const p = [];
  for (let i = 0; i <= 60; i++) {
    const t = (i / 60) * Math.PI * 2;
    p.push([cx + s * 16 * Math.sin(t) ** 3, cy - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
  }
  return p;
}

export function foilBase() {
  const sk = new Sk(W, H, { id: "fo" });
  const dx = FO.doorX;
  sk.fill(rect(0, 0, dx, H), "#FFF0DA", { ...flat, wob: 0, seed: 1 });
  sk.fill(rect(dx, 0, W - dx, H), "#DDEBF7", { ...flat, wob: 0, seed: 2 });
  // 방: 난로와 올라오는 열
  const stove = rrect(44, 372, 104, 130, 16);
  sk.fill(stove, "#D9735A", { ...flat, seed: 5 }); sk.ink(stove, { w: 8, wob: 0.7, seed: 6 });
  for (const [x, i] of [[66, 0], [96, 1], [126, 2]]) sk.ink(squiggle(x, 300, 56, 7, 2), { w: 7, color: C.orange, wob: 0.3, seed: 8 + i });
  // 밖: 쌓인 눈과 눈송이
  const snow = [...curve([[dx, 500], [640, 484], [800, 498], [960, 480]], false, 6), ...dense([[960, 480], [960, 544], [dx, 544]], 8)];
  sk.fill(snow, "#FFFFFF", { ...flat, seed: 11 });
  sk.ink(curve([[dx, 500], [640, 484], [800, 498], [960, 480]], false, 6), { w: 7, color: "#9DB7D0", wob: 0.8, seed: 12 });
  g(sk, "opn-u6-foil-snow", () => {
    for (const [x, y, i] of [[580, 70, 0], [720, 130, 1], [860, 60, 2], [930, 210, 3], [600, 250, 4], [800, 290, 5]]) {
      for (let k = 0; k < 3; k++) {
        const a = (k * Math.PI) / 3;
        sk.ink(dense([[x - 15 * Math.cos(a), y - 15 * Math.sin(a)], [x + 15 * Math.cos(a), y + 15 * Math.sin(a)]], 4), { w: 5, color: "#7FA6CC", wob: 0.2, seed: 20 + i * 3 + k });
      }
    }
  });
  // 바닥과 문틀
  sk.ink(dense([[0, 504], [dx, 504]], 8), { w: 8, color: C.woodDark, wob: 1, seed: 41 });
  sk.ink(dense([[dx, 12], [dx, 506]], 8), { w: 16, color: C.wood, wob: 0.8, seed: 42 });
  sk.ink(dense([[dx - 4, 14], [958, 14]], 8), { w: 16, color: C.wood, wob: 0.8, seed: 43 });
  // 아이와 풍선
  g(sk, "opn-u6-foil-kid", () => {
    drawFigure(sk, 250, 502, 0.56, pose({ elR: [74, -300], haR: [128, -352], elL: [-40, -262], haL: [-54, -190] }), { ...STUDENT });
    const hx = 250 + 0.56 * 128, hy = 502 - 0.56 * 352;
    const bx = hx + 44, by = 110;
    sk.ink(curve([[hx, hy], [hx + 16, hy - 60], [bx, by + 82]]), { w: 5, color: C.gray, wob: 0.6, seed: 51 });
    g(sk, "opn-u6-foil-full", () => {
      const h = heartPts(bx, by, 5.4);
      sk.fill(h, "#F4A9BC", { dx: 0.8, dy: 1, wob: 0.6, seed: 61, tex: true });
      sk.ink(h, { w: 9, wob: 0.8, seed: 62, closed: true });
      sk.ink(curve([[bx - 56, by - 44], [bx - 62, by - 16], [bx - 44, by + 8]]), { w: 8, color: "#FFFFFF", wob: 0.4, seed: 63 });
    });
    g(sk, "opn-u6-foil-limp", () => {
      const h = heartPts(bx, by + 20, 4.2);
      sk.fill(h, "#E79BAE", { dx: 0.8, dy: 1, wob: 3.4, seed: 71, tex: true });
      sk.ink(h, { w: 9, wob: 3.6, seed: 72, closed: true, freq: 1 / 22 });
      for (const [a, b, i] of [[[-40, -6], [-14, 14], 0], [[10, -22], [30, 6], 1], [[-18, 30], [8, 46], 2], [[34, 22], [50, 40], 3]]) sk.ink(dense([[bx + a[0], by + 20 + a[1]], [bx + b[0], by + 20 + b[1]]], 4), { w: 5, color: "#B5687C", wob: 0.8, seed: 75 + i });
    });
  });
  return { sk };
}

/* ══════════ 4. 찌그러진 탁구공 (u6l5) ══════════
   공은 그릇 위에 떠 있다. 앱이 공 묶음을 아래로 내려 물에 담그고, 다 데워지면 찌그러진 그림을 동그란 그림으로 바꾼다. */
export const PG = { dip: 172, hit: [250, 30, 460, 440], ball: [480, 150, 78] };

export function pongBase() {
  const sk = new Sk(W, H, { id: "pg" });
  const [bx, by, r] = PG.ball;
  const top = 316, cx = 480, rx = 250;
  sk.ink(dense([[60, 500], [900, 502]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: 3 });
  const bowl = [...dense([[cx - rx, top], [cx + rx, top]], 8), ...curve([[cx + rx, top], [cx + rx - 46, top + 130], [cx + 110, top + 182], [cx - 110, top + 182], [cx - rx + 46, top + 130], [cx - rx, top]], false, 6)];
  // 그릇 뒤쪽 테두리와 김
  sk.fill(ell(cx, top, rx, 26), "#BFE3F5", { ...flat, seed: 5 });
  sk.ink(ell(cx, top, rx, 26, Math.PI, Math.PI * 2), { w: 8, wob: 0.6, seed: 6 });
  g(sk, "opn-u6-pong-steam", () => {
    for (const [x, i] of [[cx - 190, 0], [cx + 190, 1], [cx - 110, 2], [cx + 120, 3]]) sk.ink(squiggle(x, top - 94 - (i % 2) * 26, 70, 9, 2), { w: 7, color: "#B9C4CF", wob: 0.3, seed: 11 + i });
  });
  // 공(동그란 그림과 찌그러진 그림)
  g(sk, "opn-u6-pong-ball", () => {
    g(sk, "opn-u6-pong-round", () => {
      const c = circ(bx, by, r, { over: 0.1, seed: 21 });
      sk.fill(c, "#FFB347", { dx: 0.8, dy: 1, wob: 0.6, seed: 22, tex: true });
      sk.ink(c, { w: 9, wob: 0.8, seed: 23 });
      sk.ink(ell(bx - 8, by - 8, 52, 52, Math.PI * 1.1, Math.PI * 1.42), { w: 8, color: "#FFFFFF", wob: 0.4, seed: 24 });
    });
    g(sk, "opn-u6-pong-dent", () => {
      const a0 = -1.05, a1 = 0.45; // 오른쪽 위가 움푹 들어갔다
      const P = (a, d = r) => [bx + d * Math.cos(a), by + d * Math.sin(a)];
      const out = ell(bx, by, r, r, a1, a0 + Math.PI * 2);
      const rim = curve([P(a0), P(-0.7, r * 0.9), P(-0.3, r * 0.84), P(0.1, r * 0.9), P(a1)], false, 4);
      const shape = [...out, ...rim];
      sk.fill(shape, "#FFB347", { dx: 0.8, dy: 1, wob: 0.6, seed: 31, tex: true });
      // 움푹한 자리: 어두운 면과 접힌 금
      const pit = [...rim, ...curve([P(a1), P(0.08, r * 0.62), P(-0.3, r * 0.46), P(-0.7, r * 0.62), P(a0)], false, 4)];
      sk.fill(pit, "#C97A1F", { ...flat, seed: 35 });
      sk.ink(curve([P(a1), P(0.08, r * 0.62), P(-0.3, r * 0.46), P(-0.7, r * 0.62), P(a0)], false, 4), { w: 6, wob: 0.5, seed: 36 });
      sk.ink(shape, { w: 9, wob: 0.8, seed: 32, closed: true });
      sk.ink(curve([P(-0.3, r * 0.46), P(-0.5, r * 0.26), P(-0.9, r * 0.14)]), { w: 5, color: "#C9741A", wob: 0.5, seed: 33 });
      sk.ink(ell(bx - 8, by - 8, 52, 52, Math.PI * 1.1, Math.PI * 1.42), { w: 8, color: "#FFFFFF", wob: 0.4, seed: 34 });
    });
  });
  // 그릇 앞쪽: 물이 공을 덮는다
  sk.fill(bowl, "#9AD3EE", { ...flat, seed: 41, alpha: 0.72 });
  sk.ink(bowl, { w: 9, wob: 0.9, seed: 42 });
  sk.ink(ell(cx, top, rx, 26, 0, Math.PI), { w: 7, color: "#6FB5D9", wob: 0.5, seed: 43 });
  // 펴지는 순간의 반짝임
  g(sk, "opn-u6-pong-pop", () => {
    sparkle(sk, bx + 150, by + PG.dip - 120, 34, { color: C.orange, seed: 51 });
    sparkle(sk, bx - 150, by + PG.dip - 90, 26, { color: C.yellow, seed: 55 });
    sparkle(sk, bx + 110, by + PG.dip - 190, 22, { color: C.yellow, seed: 59 });
  });
  return { sk };
}

/** build-intro.mjs가 부른다: 그림을 싣고 장면별 좌표를 돌려준다. */
export function build(add) {
  return {
    ice: { ...BR, ...add("bearBase", bearBase()) },
    wrap: { ...WR, ...add("wrapBase", wrapBase()) },
    foil: { ...FO, ...add("foilBase", foilBase()) },
    pong: { ...PG, ...add("pongBase", pongBase()) },
  };
}
