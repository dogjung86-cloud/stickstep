// 중1 과학 Ⅵ 도입(opener) 네 장면의 그림(손그림 코드 그림). intro-u1.mjs와 같은 엔진, 같은 무대(960×544)를 쓴다.
// 그림 속에 글자와 숫자는 넣지 않는다(기호만). 움직일 부분은 <g class>로 묶고 앱의 CSS와 코드가 움직인다.
//   snow (u6l1) 깊게 쌓인 눈밭과 나무 디딤판, 아이 한 명: 운동화로 걸으면 무릎까지 빠지고 설피를 신으면 눈 위에 선다
//   gym  (u6l3) 바닥에 놓인 공기 짐볼과 위에서 누르는 두 손
//   foil (u6l4) 따뜻한 방과 눈 오는 밖, 은박 풍선을 든 아이
//   pong (u6l5) 찌그러진 탁구공과 뜨거운 물이 담긴 그릇
// node qa/sketch/build-intro.mjs u6 이 build(add)를 불러 src/ui/introArt.u6.generated.ts 에 싣는다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, squiggle, sparkle, emark } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, STUDENT } from "../lib/figure.mjs";

const W = 960, H = 544;
const g = (sk, cls, fn) => { sk.raw(`<g class="${cls}">`); fn(); sk.raw("</g>"); };
const rect = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 8);
const flat = { dx: 0, dy: 0, wob: 0.5, tex: false };

/* ══════════ 1. 눈밭과 설피 (u6l1) ══════════
   같은 아이가 같은 몸무게로 두 번 걷는다. 아이는 왼쪽 나무 디딤판(눈에 빠지지 않는 자리)에서 출발하고, 앱이 아이 묶음을 오른쪽으로 옮긴다.
   운동화: 조금(step) 가다가 무릎까지 빠진다(sink 그림으로 바뀌고 뒤에 깊은 발자국이 남는다).
   설피: 멀리(go) 걸어가도 눈 위에 서 있다(up 그림, 뒤에 얕고 넓은 자국). 두 그림의 아이는 같은 x0에 그려 두고 묶음째 옮긴다. */
export const SN = { go: 540, step: 180, sy: 420, x0: 98 };
const SY = SN.sy;
const SNOW = "#F4F9FC";
const WKID = { hair: "knit", capColor: "#F2B632", seed: 31 };
// 설피(비스듬히 내려다본 모습): 나무 테와 그물 끈. (cx, cy) = 가운데
function snowshoe(sk, cx, cy, sd) {
  const rx = 62, ry = 15;
  const rim = ell(cx, cy, rx, ry);
  sk.fill(rim, "#F1E4C8", { ...flat, seed: sd });
  for (let i = -3; i <= 3; i++) { const x = cx + i * 15, h = ry * Math.sqrt(Math.max(0, 1 - ((i * 15) / rx) ** 2)) - 2; sk.ink(dense([[x - 4, cy - h], [x + 4, cy + h]]), { w: 3, color: "#B08A5A", seed: sd + 2 + i, wob: 0.1 }); }
  sk.ink(dense([[cx - rx + 8, cy], [cx + rx - 8, cy]]), { w: 3, color: "#B08A5A", seed: sd + 10, wob: 0.1 });
  sk.ink(rim, { w: 7, color: "#8A5A33", seed: sd + 11, wob: 0.3 });
}
const hole = (sk, x, y, rx, ry, sd) => { const h = ell(x, y, rx, ry); sk.fill(h, "#C3D7E5", { ...flat, wob: 0.2, seed: sd }); sk.ink(h, { w: 5, color: "#6F8FA6", seed: sd + 1, wob: 0.2 }); };

export function snowBase() {
  const sk = new Sk(W, H, { id: "sn" });
  const { x0 } = SN;
  sk.fill(rect(0, 0, W, H), "#E4F1FA", { ...flat, wob: 0, seed: 1 });
  for (const [x, y, i] of [[300, 70, 0], [470, 130, 1], [640, 60, 2], [820, 120, 3], [900, 250, 4], [560, 250, 5]]) {
    for (let k = 0; k < 3; k++) { const a = (k * Math.PI) / 3 + 0.3; sk.ink(dense([[x - 13 * Math.cos(a), y - 13 * Math.sin(a)], [x + 13 * Math.cos(a), y + 13 * Math.sin(a)]], 4), { w: 4, color: "#8FC3E8", wob: 0.1, seed: 5 + i * 3 + k }); }
  }
  // 깊게 쌓인 눈
  sk.fill(rect(0, SY, W, H - SY), SNOW, { ...flat, wob: 0, seed: 21 });
  sk.ink(dense([[0, SY], [W, SY]], 8), { w: 9, wob: 0.9, seed: 22 });
  // 나무 디딤판(출발하는 곳. 눈 위로 조금 솟아 있다)
  const deck = rrect(18, SY - 10, 160, 40, 6);
  sk.fill(deck, C.wood, { dx: 0.6, dy: 0.8, wob: 0.5, seed: 23, tex: true });
  sk.ink(deck, { w: 8, wob: 0.6, seed: 24 });
  // 지나온 자국: 운동화는 깊은 구멍, 설피는 얕고 넓은 자국(앱이 걸은 뒤에 켠다)
  g(sk, "opn-u6-snow-deep", () => hole(sk, x0 + SN.step * 0.55, SY + 9, 30, 10, 31));
  g(sk, "opn-u6-snow-flat", () => {
    for (const [f, i] of [[0.32, 0], [0.55, 1], [0.78, 2]]) sk.ink(ell(x0 + SN.go * f, SY + 10, 50, 8), { w: 5, color: "#B9CFDC", seed: 35 + i, wob: 0.3 });
  });
  g(sk, "opn-u6-snow-kid", () => {
    // 처음: 디딤판 위에 운동화를 신고 서 있다
    g(sk, "opn-u6-snow-idle", () => {
      drawFigure(sk, x0, SY - 10, 0.58, pose({ elR: [56, -264], haR: [84, -216], elL: [-56, -264], haL: [-84, -216] }), { ...WKID });
    });
    // 운동화: 무릎까지 빠졌다(정강이와 운동화는 눈 속이라 점선)
    g(sk, "opn-u6-snow-sink", () => {
      const ks = 0.58, ky = SY + 8;
      hole(sk, x0, ky, 46, 12, 41);
      const deep = ks * 106;
      for (const [dx, sg, i] of [[-22, -1, 0], [22, 1, 1]]) {
        const kn = [x0 + dx * ks, ky + 4], ft = [x0 + dx * ks + sg * 8, ky + deep];
        sk.ink(dense([kn, ft]), { w: 7, color: "#9DB6C8", dash: [10, 9], seed: 43 + i, wob: 0.2 });
        sk.ink(rrect(ft[0] - 12 + sg * 8, ft[1] - 4, 34, 16, 7), { w: 5, color: "#9DB6C8", dash: [9, 8], seed: 45 + i, wob: 0.2 });
      }
      const K = pose({ hip: [0, -110], neck: [12, -238], head: [20, -330], tilt: 0.12,
        elR: [90, -250], haR: [150, -300], elL: [-84, -262], haL: [-128, -330],
        knL: [-22, 0], ftL: [-22, 0], knR: [22, 0], ftR: [22, 0] });
      drawFigure(sk, x0, ky, ks, K, { ...WKID });
      sk.fill([...ell(x0, ky, 43, 10, 0.12, Math.PI - 0.12), [x0 - 42, ky + 2]], SNOW, { ...flat, wob: 0.2, seed: 47 });
      sk.ink(ell(x0, ky, 46, 12, 0.1, Math.PI - 0.1), { w: 5, color: "#6F8FA6", seed: 48, wob: 0.2 });
      emark(sk, x0 + 92, SY - 300, 0.9, { color: C.red, w: 13, seed: 49 });
    });
    // 설피: 눈 위에 서서 걷는다(뒤쪽 발의 설피 → 아이 → 앞쪽 발의 설피)
    g(sk, "opn-u6-snow-up", () => {
      const ts = 0.58, ty = SY - 12;
      const T = pose({ hip: [0, -212], neck: [20, -340], head: [32, -432], tilt: 0.08,
        elR: [70, -270], haR: [104, -222], elL: [-60, -262], haL: [-86, -214],
        knL: [-40, -106], ftL: [-64, 0], knR: [36, -106], ftR: [58, 0] });
      snowshoe(sk, x0 - ts * 64, SY - 4, 51);
      drawFigure(sk, x0, ty, ts, T, { ...WKID });
      snowshoe(sk, x0 + ts * 58, SY - 2, 61);
    });
  });
  return { sk };
}

/* ══════════ 2. 공기 짐볼 (u6l3) ══════════
   바닥에 놓인 큰 짐볼을 위에서 두 손이 누른다. 앱이 공을 바닥 기준으로 세로로 줄이고(옆으로 조금 넓힌다) 손을 그만큼 내린다.
   reach: 공이 처음 높이의 몇 분의 1만큼 눌렸을 때 손이 내려가는 거리의 기준(손바닥 바닥에서 바닥까지의 높이). */
export const GYM = { cx: 480, baseY: 470, r: 150, reach: 296, hit: [290, 30, 380, 450] };

export function gymBase() {
  const sk = new Sk(W, H, { id: "gy" });
  const { cx, baseY, r } = GYM;
  const cy = baseY - r;
  // 바닥과 그림자
  sk.ink(dense([[40, baseY], [920, baseY + 2]], 8), { w: 9, color: C.grayLight, wob: 1.2, seed: 3 });
  sk.fill(ell(cx, baseY, r * 0.78, 13), "#2A3A5E", { ...flat, wob: 0.2, seed: 5, alpha: 0.12 });
  g(sk, "opn-u6-gym-ball", () => {
    const b = circ(cx, cy, r, { over: 0.1, seed: 11 });
    sk.fill(b, "#4C9BE8", { dx: 0.8, dy: 1, wob: 0.6, seed: 12, tex: true });
    // 공기 마개와 이음 줄
    sk.ink(ell(cx, cy, r * 0.42, r, -Math.PI / 2, Math.PI / 2), { w: 5, color: "#2F6FB8", wob: 0.3, seed: 13 });
    const plug = circ(cx + r * 0.62, cy + r * 0.32, 9, { seed: 14 });
    sk.fill(plug, "#E9EEF5", { ...flat, seed: 15 });
    sk.ink(plug, { w: 5, wob: 0.2, seed: 16 });
    sk.ink(b, { w: 9, wob: 0.8, seed: 17 });
    sk.ink(ell(cx - 10, cy - 10, r * 0.74, r * 0.76, Math.PI * 1.12, Math.PI * 1.4), { w: 8, color: "#FFFFFF", wob: 0.4, seed: 18 });
  });
  // 위에서 누르는 두 손(앱이 공의 눌린 만큼 내린다)
  g(sk, "opn-u6-gym-hands", () => {
    for (const [x, i] of [[cx - 50, 0], [cx + 50, 1]]) {
      const top = cy - Math.sqrt(r * r - (x - cx) ** 2);
      sk.ink(dense([[x + (i ? 26 : -26), -40], [x, top - 26]], 5), { w: 13, wob: 0.6, seed: 31 + i });
      const palm = ell(x, top - 13, 32, 14);
      sk.fill(palm, C.skin, { dx: 0.8, dy: 1, wob: 0.6, seed: 33 + i });
      sk.ink(palm, { w: 8, wob: 0.6, seed: 35 + i });
    }
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
    snow: { ...SN, ...add("snowBase", snowBase()) },
    gym: { ...GYM, ...add("gymBase", gymBase()) },
    foil: { ...FO, ...add("foilBase", foilBase()) },
    pong: { ...PG, ...add("pongBase", pongBase()) },
  };
}
