// 중2 과학 g2u4l4 만화 v2(배선 전 미리보기): 서른세 가지 목록에서 118칸 지도까지(주기율표). 8컷.
// 조사와 콘티: qa/sketch/research/g2u4l4.md
//   1 1789년 라부아지에의 목록 → 2 1807년 데이비가 전기로 쪼갠 포타시 → 3 1869년 멘델레예프, 늘어놓으니 되풀이
//   → 4 1871년 비워 둔 자리 → 5 1875년 르코크의 보랏빛 선(갈륨) → 6 1876년 다시 잰 밀도 → 7 1913년 모즐리의 계단
//   → 8 오늘날: 118칸
// 색의 뜻(한 편 내내 같다): 빨강 = 무른 금속 무리(오늘의 1족), 초록 = 염소 무리, 파랑 = 오늘 표의 맨 오른쪽 세로줄.
// 표의 칸에는 글자와 숫자를 넣지 않는다(색 동그라미, 빈 칸, 물음표).
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, xmark, check, sparkle, drop, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../lib/figure.mjs";
import { desk, quill } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

/* ---------- 인물 ---------- */
// 라부아지에: 분 바른 흰 머리(옆 롤) + 검은 웃옷 + 흰 목장식
const LAVOISIER = { hair: "short", hairColor: "#E6E1D8", fringe: 24, coat: { color: "#3A3A44", buttons: C.gold, seam: "#1F1F26" }, bowtie: C.white, seed: 311, mini: true, face: "calm" };
// 데이비: 짙은 곱슬머리 + 남색 높은 깃 웃옷
const DAVY = { hair: "short", hairColor: "#3B2E28", fringe: 24, coat: { color: C.navy, buttons: C.gold, seam: "#1E2B49" }, bowtie: C.white, seed: 321, mini: true, face: "calm" };
// 멘델레예프(35세): 어깨까지 오는 숱 많은 머리 + 턱을 덮는 짙은 수염 + 헐렁한 긴 웃옷
const MENDELEEV = { hair: "curls", hairColor: "#5A4636", beard: "#5A4636", coat: { color: "#6E6258", seam: "#453C35", len: 70 }, seed: 331, mini: true, face: "calm" };
// 르코크 드 부아보드랑: 짧은 짙은 머리 + 콧수염 + 단추 많은 웃옷
const LECOQ = { hair: "short", hairColor: "#3B2E28", fringe: 24, coat: { color: "#4E6152", buttons: C.gold, seam: "#33423A" }, seed: 341, mini: true, face: "calm" };
// 모즐리: 짧게 빗어 넘긴 머리 + 조끼와 넥타이
const MOSELEY = { hair: "short", hairColor: "#7A5A3C", fringe: 24, coat: { color: "#7B818C", seam: "#4E535C", len: 30 }, seed: 351, mini: true, face: "calm" };

// 머리 위에 덧그리기(머리 중심이 원점, 머리 반지름 100)
function onHead(sk, fx, fy, s, P, fn) { sk.at(fx + s * P.head[0], fy + s * P.head[1], s, fn, P.tilt ?? 0); }
function wigRolls(sk, sd) {
  for (const sg of [-1, 1]) for (const [cy, rr, i] of [[-4, 24, 0], [38, 21, 1]]) {
    const c = circ(sg * (96 + i * 2), cy, rr, { over: 0.25, seed: sd + i + (sg > 0 ? 4 : 0), lump: 0.05 });
    sk.fill(c, "#E6E1D8", { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 10 + i }); sk.ink(c, { w: 9, wob: 0.8, seed: sd + 20 + i });
    sk.ink(curve([[sg * (88 + i * 2), cy - 6], [sg * (100 + i * 2), cy - 2], [sg * (96 + i * 2), cy + 9]]), { w: 5, wob: 0.4, seed: sd + 30 + i, color: "#B9B3A7" });
  }
}
function topCurls(sk, col, sd) {
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI + 0.35 + i * (Math.PI - 0.7) / 5, c = circ(100 * Math.cos(a), 100 * Math.sin(a), 24, { over: 0.25, seed: sd + i, lump: 0.05 });
    sk.fill(c, col, { dx: 1, dy: 1.2, wob: 0.8, seed: sd + 10 + i }); sk.ink(c, { w: 9, wob: 0.8, seed: sd + 20 + i });
  }
}
function moustache(sk, col, sd) {
  const m = curve([[0, 36], [-16, 30], [-36, 36], [-48, 50], [-26, 54], [0, 46], [26, 54], [48, 50], [36, 36], [16, 30]], true, 3);
  sk.fill(m, col, { dx: 0, dy: 0, wob: 0.4, seed: sd }); sk.ink(m, { w: 6, wob: 0.4, seed: sd + 1 });
}
const tie = (sk) => () => { const t = poly([[-9, -322], [9, -322], [13, -262], [0, -244], [-13, -262]], 3); sk.fill(t, "#8A3A3A", { dx: 0, dy: 0, wob: 0.3, seed: 361 }); sk.ink(t, { w: 6, wob: 0.4, seed: 362 }); };

/* ---------- 소품 ---------- */
function table(sk, x0, x1, y, sd, bottom = 704) {
  thin(sk, 0.85, () => {
    for (const lx of [x0 + 24, x1 - 24]) sk.ink(dense([[lx, y + 20], [lx, bottom]]), { w: 11, color: "#6B4A32", seed: sd + lx, wob: 0.3 });
    const top = rrect(x0, y, x1 - x0, 24, 8); sk.fill(top, C.wood, { seed: sd, tex: true, texAng: 0.02 }); sk.ink(top, { w: 10, seed: sd + 1 });
  });
}
const lump = (sk, x, y, r, col, sd, o = {}) => { const c = circ(x, y, r, { over: 0.15, seed: sd, lump: o.lump ?? 0.09, sy: o.sy ?? 0.8 }); sk.fill(c, col, { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 }); sk.ink(c, { w: o.w ?? 5, seed: sd + 2, wob: 0.4 }); };
const shine = (sk, x, y, r) => sk.dot(x - r * 0.3, y - r * 0.3, r * 0.22, C.white);
function flame(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const fl = curve([[0, 0], [-14, -22], [0, -60], [14, -22]], true, 3); sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(fl, { w: 5, color: C.red, seed: sd + 1, wob: 0.3 });
    const core = curve([[0, -6], [-6, -18], [0, -34], [6, -18]], true, 3); sk.fill(core, C.yellow, { dx: 0, dy: 0, wob: 0.2, seed: sd + 2 });
  });
}
// 작은 해 기호(빛)
function sunIcon(sk, x, y, r, sd) {
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2; sk.ink(dense([[x + r * 1.5 * Math.cos(a), y + r * 1.5 * Math.sin(a)], [x + r * 2.1 * Math.cos(a), y + r * 2.1 * Math.sin(a)]]), { w: 3.5, color: C.orange, wob: 0.2, seed: sd + i }); }
  const c = circ(x, y, r, { over: 0.1, seed: sd + 9 }); sk.fill(c, C.yellow, { dx: 0, dy: 0, wob: 0.3, seed: sd + 10 }); sk.ink(c, { w: 4, wob: 0.3, seed: sd + 11 });
}
// 두 접시 저울. (x, y) = 받침 바닥 가운데. 돌려주는 값: 두 접시의 가운데
function balance(sk, x, y, s, sd) {
  const k = v => v * s, beamY = y - k(170), arm = k(92), panY = y - k(58);
  thin(sk, 0.9, () => {
    const base = rrect(x - k(54), y - k(16), k(108), k(16), 5); sk.fill(base, "#C9A24A", { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(base, { w: 7, seed: sd + 1 });
    sk.ink(dense([[x, y - k(16)], [x, beamY]]), { w: 9, color: "#B8892E", seed: sd + 2, wob: 0.3 });
    sk.ink(dense([[x - arm, beamY], [x + arm, beamY]]), { w: 8, seed: sd + 3, wob: 0.4 });
    for (const sg of [-1, 1]) {
      const px = x + sg * arm;
      for (const d of [-1, 1]) sk.ink(dense([[px, beamY], [px + d * k(34), panY]]), { w: 3.5, color: "#6B6B70", seed: sd + 5 + sg + d, wob: 0.2 });
      const pan = curve([[px - k(40), panY], [px - k(26), panY + k(16)], [px + k(26), panY + k(16)], [px + k(40), panY]], false, 3);
      sk.fill([...pan, pan[0]], "#E2C36A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 9 + sg }); sk.ink([...pan, pan[0]], { w: 6, seed: sd + 12 + sg, wob: 0.3 });
    }
    sk.dot(x, beamY, k(7), "#B8892E");
  });
  return { L: [x - arm, panY], R: [x + arm, panY] };
}

/* ---------- 1. 1789년: 서른세 가지 목록 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  ground(sk, 704, 11);
  thin(sk, 0.9, () => desk(sk, 50, 524, 620, { seed: 13 }));
  // 펼친 큰 책(독서대에 세워 둠): 왼쪽 면에 물질의 표(글자 없이 그림과 줄)
  thin(sk, 0.85, () => {
    const cover = rrect(186, 152, 440, 372, 14); sk.fill(cover, "#7A5A45", { seed: 15, tex: true }); sk.ink(cover, { w: 10, seed: 16 });
    for (const [x0, i] of [[200, 0], [408, 1]]) {
      const pg = poly([[x0, 168], [x0 + 204, 168], [x0 + 204, 508], [x0, 508]], 4);
      sk.fill(pg, "#FBF6E6", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 17 + i }); sk.ink(pg, { w: 7, seed: 19 + i, wob: 0.5 });
      for (let r = 1; r < 6; r++) sk.ink(dense([[x0 + 10, 168 + r * 56.6], [x0 + 194, 168 + r * 56.6]]), { w: 3, color: C.gray, seed: 21 + r + i * 9, wob: 0.2 });
      sk.ink(dense([[x0 + 62, 176], [x0 + 62, 500]]), { w: 3, color: C.gray, seed: 31 + i, wob: 0.2 });
      for (let r = 0; r < 6; r++) for (let j = 0; j < 2; j++) sk.ink(dense([[x0 + 78, 188 + r * 56.6 + j * 18], [x0 + (j ? 150 : 184), 188 + r * 56.6 + j * 18]]), { w: 4, color: "#8A8F98", seed: 41 + r * 3 + j + i * 20, wob: 0.3 });
    }
    // 왼쪽 면: 빛, 열, 금속 덩이 둘, 흰 흙가루 둘
    sunIcon(sk, 231, 196, 9, 61);
    flame(sk, 231, 272, 0.62, 71);
    lump(sk, 231, 312, 17, "#AEB6C0", 73); lump(sk, 231, 368, 17, "#C9A24A", 77);
    for (const [y, i] of [[436, 0], [492, 1]]) { const m = curve([[207, y], [219, y - 16], [231, y - 24], [243, y - 16], [255, y]], false, 3); sk.fill([...m, m[0]], C.white, { dx: 0, dy: 0, wob: 0.3, seed: 81 + i }); sk.ink([...m, m[0]], { w: 5, seed: 83 + i, wob: 0.3 }); }
    // 오른쪽 면: 금속 덩이가 이어진다
    ["#AEB6C0", "#D98A4A", "#9AA0A8", "#E2C36A", "#B8BEC6", "#8E949C"].forEach((c, r) => lump(sk, 439, 198 + r * 56.6, 16, c, 91 + r * 4));
  });
  // 따로 밀어 둔 단지(포타시)와 물음표
  thin(sk, 0.9, () => {
    const jar = curve([[86, 524], [78, 480], [92, 452], [140, 452], [154, 480], [146, 524]], false, 3);
    sk.fill([...jar, jar[0]], "#C98B6B", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 101 }); sk.ink([...jar, jar[0]], { w: 8, seed: 102 });
    const heap = curve([[94, 454], [104, 436], [118, 428], [132, 438], [140, 454]], false, 3); sk.fill([...heap, heap[0]], C.white, { dx: 0, dy: 0, wob: 0.3, seed: 103 }); sk.ink([...heap, heap[0]], { w: 6, seed: 104, wob: 0.4 });
  });
  qmark(sk, 118, 356, 0.72, { color: C.gray, seed: 105 });
  const P = pose({ elL: [-104, -306], haL: [-186, -338], elR: [52, -262], haR: [40, -214], tilt: -0.05 });
  const fx = 812, fs = 0.68;
  drawFigure(sk, fx, 704, fs, P, { ...LAVOISIER, name: "lavoisier" });
  onHead(sk, fx, 704, fs, P, () => wigRolls(sk, 111));
  return sk;
}

/* ---------- 2. 1807년: 전기로 쪼갠 포타시 ---------- */
// 볼타 통 전지: 긴 나무 통에 구리판(주황)과 아연판(회색)이 번갈아 꽂혀 있다
function trough(sk, x0, x1, yTop, sd) {
  thin(sk, 0.8, () => {
    let i = 0;
    for (let x = x0 + 14; x < x1 - 14; x += 13, i++) { const pl = poly([[x, yTop - 30], [x + 7, yTop - 30], [x + 7, yTop + 8], [x, yTop + 8]], 3); sk.fill(pl, i % 2 ? "#AEB6C0" : "#D98A4A", { dx: 0, dy: 0, wob: 0.2, seed: sd + i }); sk.ink(pl, { w: 3, seed: sd + 50 + i, wob: 0.2 }); }
    const b = poly([[x0, yTop], [x1, yTop], [x1 - 4, yTop + 58], [x0 + 4, yTop + 58]], 4);
    sk.fill(b, "#C49A5E", { seed: sd + 100, tex: true, texAng: 0.03 }); sk.ink(b, { w: 9, seed: sd + 101 });
  });
}
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 704, 121);
  // 벽 선반 위의 통 하나, 탁자 위의 통 하나(이어져 있다)
  thin(sk, 0.85, () => {
    sk.ink(dense([[56, 398], [524, 398]]), { w: 11, color: "#8A5A33", seed: 123, wob: 0.5 });
    for (const bx of [110, 470]) sk.ink(dense([[bx, 402], [bx, 440], [bx + 30, 402]], 4), { w: 6, color: "#8A5A33", seed: 125 + bx, wob: 0.3 });
  });
  trough(sk, 76, 504, 334, 131);
  table(sk, 56, 524, 560, 127);
  trough(sk, 76, 504, 502, 231);
  sk.ink(curve([[80, 340], [44, 380], [40, 470], [80, 508]]), { w: 5, seed: 129, wob: 0.5 });
  // 백금 접시와 포타시, 은빛 알갱이
  table(sk, 574, 730, 556, 133);
  const dish = curve([[592, 536], [606, 556], [698, 556], [712, 536]], false, 3);
  sk.fill([...dish, dish[0]], "#D5DADF", { dx: 0, dy: 0, wob: 0.3, seed: 135 }); sk.ink([...dish, dish[0]], { w: 7, seed: 136 });
  const pot = curve([[612, 538], [620, 508], [650, 498], [684, 510], [692, 538]], false, 3);
  sk.fill([...pot, pot[0]], C.white, { dx: 0, dy: 0, wob: 0.3, seed: 137 }); sk.ink([...pot, pot[0]], { w: 6, seed: 138, wob: 0.5 });
  sk.ink(curve([[500, 338], [560, 330], [636, 400], [648, 498]]), { w: 5, seed: 139, wob: 0.5 });
  sk.ink(curve([[500, 510], [540, 500], [572, 520], [596, 540]]), { w: 5, seed: 140, wob: 0.5 });
  for (const [x, y, r, i] of [[630, 512, 9, 0], [668, 506, 10, 1], [652, 522, 7, 2]]) { lump(sk, x, y, r, "#C9CFD6", 141 + i * 4, { sy: 1, lump: 0.03, w: 4 }); shine(sk, x, y, r); }
  flame(sk, 670, 498, 0.7, 151);
  sparkle(sk, 600, 468, 14, { seed: 153 });
  sparkle(sk, 712, 500, 10, { seed: 155 });
  emark(sk, 668, 396, 0.62, { seed: 157 });
  // 데이비: 두 팔을 넓게 들고 놀란다
  const P = pose({ elL: [-112, -322], haL: [-176, -428], elR: [112, -322], haR: [176, -428] });
  const fx = 818, fs = 0.64;
  drawFigure(sk, fx, 704, fs, P, { ...DAVY, name: "davy", face: "shock" });
  onHead(sk, fx, 704, fs, P, () => topCurls(sk, DAVY.hairColor, 161));
  return sk;
}

/* ---------- 3. 1869년: 늘어놓으니 되풀이돼요 ---------- */
const RED_G = C.red, GRN_G = C.green, GRAY_E = "#C9CDD3";
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 704, 171);
  thin(sk, 0.9, () => desk(sk, 350, 566, 590, { seed: 173 }));
  // 책상 위의 잉크병과 책 더미
  thin(sk, 0.85, () => {
    const ink = rrect(440, 532, 40, 34, 8); sk.fill(ink, "#3A3A44", { dx: 0, dy: 0, wob: 0.3, seed: 175 }); sk.ink(ink, { w: 7, seed: 176 });
    for (const [y, c, i] of [[540, "#7A5A45", 0], [514, C.teal, 1]]) { const b = rrect(760 + i * 10, y, 130 - i * 16, 26, 5); sk.fill(b, c, { dx: 0, dy: 0, wob: 0.3, seed: 177 + i, tex: true }); sk.ink(b, { w: 7, seed: 179 + i }); }
  });
  // 긴 종이 띠: 가벼운 것(작은 동그라미)에서 무거운 것(큰 동그라미)으로
  thin(sk, 0.85, () => { const strip = poly([[394, 296], [940, 288], [942, 400], [396, 408]], 4); sk.fill(strip, C.parchment, { seed: 181, dx: 1, dy: 1.2, wob: 0.5 }); sk.ink(strip, { w: 8, seed: 182, wob: 0.8 }); for (const [lx, i] of [[406, 0], [932, 1]]) sk.ink(dense([[lx, 406 - i * 6], [lx, 566]]), { w: 6, color: "#8A5A33", seed: 183 + i, wob: 0.3 }); });
  const cx = i => 426 + i * 37.6, cy = i => 350 - i * 0.5, cr = i => 9.5 + i * 0.85;
  for (let i = 0; i < 14; i++) {
    const col = i % 7 === 0 ? RED_G : i % 7 === 6 ? GRN_G : GRAY_E;
    const c = circ(cx(i), cy(i), cr(i), { over: 0.15, seed: 185 + i }); sk.fill(c, col, { dx: 0, dy: 0, wob: 0.3, seed: 201 + i }); sk.ink(c, { w: 4.5, seed: 217 + i, wob: 0.3 });
  }
  // 같은 색끼리 잇는 화살표: 빨강은 위로, 초록은 아래로 돈다
  arrow(sk, [[cx(0), 318], [cx(2), 246], [cx(5), 240], [cx(7), 310]], { w: 6, color: RED_G, seed: 233, head: 15, wob: 0.4 });
  arrow(sk, [[cx(6), 384], [cx(8), 452], [cx(11), 458], [cx(13), 392]], { w: 6, color: GRN_G, seed: 237, head: 15, wob: 0.4 });
  arrow(sk, [[424, 446], [580, 444]], { w: 5, color: C.gray, seed: 241, straight: true, head: 13, wob: 0.3 });
  const P = pose({ elR: [92, -288], haR: [150, -300], elL: [-52, -262], haL: [-40, -214], tilt: 0.05 });
  const fx = 190, fs = 0.66;
  drawFigure(sk, fx, 704, fs, P, { ...MENDELEEV, name: "mendeleev", face: "happy", hands: "L" });
  const hx = fx + fs * 150, hy = 704 - fs * 300;
  quill(sk, hx - 12, hy + 32, 0.8, { rot: 0.3, seed: 243 });
  handDot(sk, [hx, hy], C.skin, 245, 10);
  return sk;
}

/* ---------- 4. 1871년: 비워 둔 자리 ---------- */
// 1871년 표: 세로 여덟 무리, 가로 열두 줄. 1 = 원소가 있는 칸, 2 = 물음표로 비워 둔 칸(예언한 세 자리)
const T1871 = [
  "10000000", "11111110", "11111110", "11211111", "11221110", "11111101",
  "11111110", "11110000", "00000000", "00111101", "11111000", "00010100",
];
const COL8 = [RED_G, "#F2B880", "#B9C4D0", "#B9A58A", "#C9B6E0", "#F2DE8A", GRN_G, "#A9B2BC"];
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  ground(sk, 704, 251);
  const x0 = 394, y0 = 144, cw = 48, ch = 39;
  thin(sk, 0.85, () => {
    const sheet = poly([[x0 - 12, y0 - 12], [x0 + 8 * cw + 12, y0 - 12], [x0 + 8 * cw + 12, y0 + 12 * ch + 12], [x0 - 12, y0 + 12 * ch + 12]], 4);
    sk.fill(sheet, "#FBF6E6", { dx: 1, dy: 1.2, wob: 0.5, seed: 253 }); sk.ink(sheet, { w: 8, seed: 254, wob: 0.8 });
    for (const px of [x0 + 60, x0 + 8 * cw - 60]) sk.dot(px, y0 - 12, 6, "#8A5A33");
    for (let c = 1; c < 8; c++) sk.ink(dense([[x0 + c * cw, y0], [x0 + c * cw, y0 + 12 * ch]]), { w: 2.5, color: C.grayLight, seed: 255 + c, wob: 0.2 });
    for (let r = 1; r < 12; r++) sk.ink(dense([[x0, y0 + r * ch], [x0 + 8 * cw, y0 + r * ch]]), { w: 2.5, color: C.grayLight, seed: 265 + r, wob: 0.2 });
  });
  T1871.forEach((row, r) => [...row].forEach((v, c) => {
    const px = x0 + (c + 0.5) * cw, py = y0 + (r + 0.5) * ch;
    if (v === "1") { const d = circ(px, py, 13, { over: 0.1, seed: 281 + r * 8 + c }); sk.fill(d, COL8[c], { dx: 0, dy: 0, wob: 0.3, seed: 381 + r * 8 + c }); sk.ink(d, { w: 4, seed: 481 + r * 8 + c, wob: 0.3 }); }
    if (v === "2") qmark(sk, px, py + 2, 0.3, { color: C.ink, w: 16, seed: 581 + r + c });
  }));
  // 알루미늄 무리 아래의 빈칸: 노란 테 + 미리 적어 둔 것(질량과 밀도) 쪽지
  const hx = x0 + 2 * cw, hy = y0 + 4 * ch;
  sk.ink(poly([[hx, hy], [hx + cw, hy], [hx + cw, hy + ch], [hx, hy + ch]], 4), { w: 6, color: C.yellow, seed: 601, wob: 0.4 });
  thin(sk, 0.85, () => {
    sk.ink(dense([[x0 + 8 * cw + 14, hy + ch / 2], [812, hy + ch / 2]]), { w: 5, color: C.yellow, dash: [6, 6], seed: 603, wob: 0 });
    const note = rrect(812, 232, 134, 150, 12); sk.fill(note, "#FFF6CF", { dx: 0, dy: 0, wob: 0.4, seed: 605 }); sk.ink(note, { w: 6, color: C.yellow, seed: 606, wob: 0.5 });
  });
  balance(sk, 850, 300, 0.26, 611);
  drop(sk, 850, 346, 0.8);
  for (const [y, i] of [[274, 0], [290, 1], [338, 2], [354, 3]]) sk.ink(dense([[884, y], [i % 2 ? 914 : 930, y]]), { w: 4, color: "#8A8F98", seed: 621 + i, wob: 0.3 });
  // 멘델레예프: 표 쪽을 가리킨다(막대는 쓰지 않는다. 표의 동그라미를 가리지 않게)
  const P = pose({ elR: [92, -300], haR: [168, -326], elL: [-52, -262], haL: [-40, -214], tilt: 0.05 });
  const fx = 196, fs = 0.62;
  drawFigure(sk, fx, 704, fs, P, { ...MENDELEEV, name: "mendeleev", face: "determined" });
  return sk;
}

/* ---------- 5. 1875년: 처음 보는 보랏빛 선 ---------- */
// 놋쇠 관(안이 빈 굵은 선)
function brassTube(sk, a, b, w, sd) {
  sk.ink(dense([a, b]), { w: w + 9, seed: sd, wob: 0.3, cap: "butt" });
  sk.ink(dense([a, b]), { w, color: "#D9B45A", seed: sd, wob: 0.3, cap: "butt" });
}
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  ground(sk, 704, 641);
  // 밤 창문(위쪽 구석에만)
  thin(sk, 0.85, () => {
    const win = rrect(744, 16, 190, 130, 10); sk.fill(win, "#2F3F66", { dx: 0, dy: 0, wob: 0.4, seed: 643 }); sk.ink(win, { w: 9, color: "#8A5A33", seed: 644, wob: 0.5 });
    sk.ink(dense([[839, 20], [839, 142]]), { w: 6, color: "#8A5A33", seed: 645, wob: 0.3 }); sk.ink(dense([[748, 81], [930, 81]]), { w: 6, color: "#8A5A33", seed: 646, wob: 0.3 });
  });
  sparkle(sk, 790, 50, 10, { seed: 647, w: 3 }); sparkle(sk, 892, 112, 8, { seed: 649, w: 3 });
  thin(sk, 0.9, () => desk(sk, 330, 566, 610, { seed: 651 }));
  // 광석 더미
  for (const [x, y, r, i] of [[760, 684, 26, 0], [806, 688, 22, 1], [784, 656, 20, 2], [842, 692, 16, 3]]) lump(sk, x, y, r, i % 2 ? "#8E949C" : "#A7ADB5", 653 + i * 4, { w: 6 });
  // 분광기: 둥근 받침 위 덮개 씌운 프리즘, 놋쇠 관 둘
  const px = 628, py = 482;
  thin(sk, 0.85, () => {
    sk.ink(dense([[px, 566], [px, py + 20]]), { w: 26, seed: 671, wob: 0.3, cap: "butt" }); sk.ink(dense([[px, 566], [px, py + 20]]), { w: 16, color: "#B8892E", seed: 671, wob: 0.3, cap: "butt" });
    const foot = curve([[px - 84, 566], [px - 56, 540], [px + 56, 540], [px + 84, 566]], false, 3); sk.fill([...foot, foot[0]], "#C9A24A", { dx: 0, dy: 0, wob: 0.3, seed: 673 }); sk.ink([...foot, foot[0]], { w: 7, seed: 674 });
    brassTube(sk, [px - 24, py - 10], [376, 428], 24, 675);  // 보는 망원경(왼쪽, 눈 쪽)
    brassTube(sk, [376, 428], [346, 425], 16, 677);
    brassTube(sk, [px + 24, py - 14], [826, py - 14], 24, 679);  // 빛을 들이는 관(오른쪽, 불꽃 쪽)
    const plate = ell(px, py + 20, 78, 13); sk.fill(plate, "#C9A24A", { dx: 0, dy: 0, wob: 0.3, seed: 681 }); sk.ink(plate, { w: 7, seed: 682 });
    const cover = rrect(px - 36, py - 46, 72, 64, 10); sk.fill(cover, "#5A5F68", { dx: 0, dy: 0, wob: 0.3, seed: 683 }); sk.ink(cover, { w: 8, seed: 684 });
    // 전기 불꽃: 두 금속 끝 사이
    sk.ink(dense([[906, 566], [906, 420]]), { w: 9, color: "#6B4A32", seed: 685, wob: 0.3 });
    for (const y of [436, 498]) sk.ink(dense([[906, y], [868, y + (y < 467 ? 14 : -14)]]), { w: 6, color: "#5A5F68", seed: 686 + y, wob: 0.2 });
    sk.ink(dense([[868, 450], [876, 460], [862, 468], [870, 484]], 3), { w: 5, color: C.yellow, seed: 689, wob: 0.2 });
  });
  for (const [a, i] of [[-2.6, 0], [-3.4, 1], [2.9, 2]]) sk.ink(dense([[852 + 12 * Math.cos(a), 440 + 12 * Math.sin(a)], [852 + 24 * Math.cos(a), 440 + 24 * Math.sin(a)]]), { w: 4, color: C.orange, seed: 691 + i, wob: 0 });
  // 관 속에 보이는 빛의 띠: 어두운 바탕에 밝은 선 몇 개, 오른쪽 끝에 처음 보는 보라 선
  thin(sk, 0.85, () => {
    for (const [x1, i] of [[486, 0], [856, 1]]) sk.ink(dense([[420, 408], [x1, 292]]), { w: 3.5, color: C.gray, dash: [8, 8], seed: 701 + i, wob: 0 });
    const band = rrect(480, 206, 382, 84, 10); sk.fill(band, "#2E3340", { dx: 0, dy: 0, wob: 0.4, seed: 703 }); sk.ink(band, { w: 8, seed: 704, wob: 0.6 });
    for (const [x, c, w] of [[524, "#E0503A", 6], [652, "#3FAE5A", 4], [710, "#2F8EE0", 6], [728, "#2F8EE0", 4], [746, "#4A6AE0", 4]]) sk.ink(dense([[x, 220], [x, 276]]), { w, color: c, seed: 705 + x, wob: 0 });
    sk.ink(dense([[818, 218], [818, 278]]), { w: 11, color: "#B07CFF", seed: 711, wob: 0 });
  });
  sparkle(sk, 818, 184, 16, { seed: 713, color: "#C9A6FF" });
  // 르코크: 몸을 숙여 관에 눈을 댄다
  const P = pose({ neck: [34, -336], head: [84, -424], tilt: 0.2, elR: [96, -262], haR: [170, -250], elL: [-30, -258], haL: [-44, -190] });
  const fx = 204, fs = 0.66;
  drawFigure(sk, fx, 704, fs, P, { ...LECOQ, name: "lecoq", face: "wide" });
  onHead(sk, fx, 704, fs, P, () => moustache(sk, LECOQ.hairColor, 721));
  return sk;
}

/* ---------- 6. 1876년: 다시 재 보니 ---------- */
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 704, 731);
  thin(sk, 0.9, () => desk(sk, 350, 566, 580, { seed: 733 }));
  // 접시저울: 왼쪽 접시에 은빛 갈륨 덩이, 오른쪽 접시에 분동
  const b = balance(sk, 520, 566, 1, 741);
  lump(sk, b.L[0], b.L[1] - 10, 24, "#D3D9E0", 751, { sy: 0.7 }); shine(sk, b.L[0], b.L[1] - 10, 20);
  for (const [dx, h, i] of [[-14, 26, 0], [12, 18, 1]]) { const wt = rrect(b.R[0] + dx - 9, b.R[1] - h, 18, h, 3); sk.fill(wt, "#C9A24A", { dx: 0, dy: 0, wob: 0.2, seed: 755 + i }); sk.ink(wt, { w: 5, seed: 757 + i, wob: 0.3 }); }
  // 물 담긴 눈금 실린더(눈금선만)
  thin(sk, 0.85, () => {
    const water = poly([[716, 452], [760, 452], [760, 560], [716, 560]], 4); sk.fill(water, "#BFE2F4", { dx: 0, dy: 0, wob: 0.3, seed: 761 });
    sk.ink(dense([[714, 388], [714, 562], [762, 562], [762, 388]], 4), { w: 7, seed: 762, wob: 0.4 });
    sk.ink(dense([[700, 566], [776, 566]]), { w: 9, seed: 763, wob: 0.3 });
    for (let y = 410, i = 0; y < 550; y += 20, i++) sk.ink(dense([[762, y], [762 - (i % 2 ? 12 : 20), y]]), { w: 3, color: "#5A5F68", seed: 765 + i, wob: 0 });
  });
  // 처음 잰 값(가위표)과 다시 잰 값(체크)
  lump(sk, 452, 248, 40, "#B4B8BE", 781, { sy: 0.9, w: 6 }); xmark(sk, 476, 276, 0.55, { seed: 785 });
  lump(sk, 604, 248, 40, "#D3D9E0", 787, { sy: 0.9, w: 6 }); shine(sk, 604, 248, 34); check(sk, 632, 276, 0.7);
  arrow(sk, [[502, 248], [552, 248]], { w: 5, color: C.gray, seed: 791, straight: true, head: 12, wob: 0.2 });
  // 멘델레예프의 글이 실린 학술지(책상에 기대 세운 종이 묶음, 글은 줄로만)
  sk.at(862, 566, 1, () => {
    for (const [d, i] of [[10, 0], [5, 1]]) { const back = poly([[-44 + d, -118 - d], [44 + d, -118 - d], [44 + d, -d], [-44 + d, -d]], 4); sk.fill(back, "#EDE6D2", { dx: 0, dy: 0, wob: 0.3, seed: 792 + i }); sk.ink(back, { w: 5, seed: 796 + i, wob: 0.3 }); }
    const pg = poly([[-44, -118], [44, -118], [44, 0], [-44, 0]], 4); sk.fill(pg, "#FBF6E6", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 793 }); sk.ink(pg, { w: 7, seed: 794 });
    sk.ink(dense([[-28, -98], [28, -98]]), { w: 6, color: "#5A5F68", seed: 795, wob: 0.2 });
    for (let i = 0; i < 5; i++) sk.ink(dense([[-32, -76 + i * 15], [i === 4 ? 6 : 32, -76 + i * 15]]), { w: 3.5, color: "#8A8F98", seed: 798 + i, wob: 0.3 });
  }, 0.07);
  // 르코크: 맞아떨어진 쪽을 가리킨다
  const P = pose({ elR: [96, -330], haR: [168, -404], elL: [-52, -262], haL: [-40, -214], tilt: 0.05 });
  const fx = 200, fs = 0.66;
  drawFigure(sk, fx, 704, fs, P, { ...LECOQ, name: "lecoq", face: "smile" });
  onHead(sk, fx, 704, fs, P, () => moustache(sk, LECOQ.hairColor, 721));
  return sk;
}

/* ---------- 7. 1913년: 한 칸에 한 계단씩 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  ground(sk, 704, 801);
  table(sk, 300, 720, 548, 803);
  // 유리관(X선 관)과 결정
  thin(sk, 0.85, () => {
    for (const x of [372, 560]) sk.ink(dense([[x, 548], [x, 474]]), { w: 9, color: "#6B4A32", seed: 805 + x, wob: 0.3 });
    const tube = rrect(322, 396, 300, 80, 38); sk.fill(tube, "#DCEFF8", { dx: 0, dy: 0, wob: 0.4, seed: 807 }); sk.ink(tube, { w: 8, seed: 808, wob: 0.5 });
    sk.ink(dense([[300, 436], [352, 436]]), { w: 7, color: "#5A5F68", seed: 809, wob: 0.2 });
    const cath = ell(360, 436, 8, 20); sk.fill(cath, "#8E949C", { dx: 0, dy: 0, wob: 0.2, seed: 810 }); sk.ink(cath, { w: 4, seed: 811, wob: 0.2 });
    const tg = poly([[540, 412], [562, 420], [552, 462], [530, 454]], 3); sk.fill(tg, "#D98A4A", { dx: 0, dy: 0, wob: 0.2, seed: 812 }); sk.ink(tg, { w: 5, seed: 813, wob: 0.3 });
    sk.ink(dense([[556, 440], [640, 436]]), { w: 7, color: "#5A5F68", seed: 814, wob: 0.2 });
    sk.ink(dense([[380, 436], [528, 436]]), { w: 3.5, color: C.gray, dash: [6, 8], seed: 815, wob: 0 });
    sk.ink(dense([[680, 548], [680, 470]]), { w: 7, color: "#6B4A32", seed: 816, wob: 0.3 });
    const cr = poly([[680, 404], [704, 438], [680, 472], [656, 438]], 3); sk.fill(cr, "#E6F2F9", { dx: 0, dy: 0, wob: 0.3, seed: 817 }); sk.ink(cr, { w: 6, seed: 818, wob: 0.3 });
  });
  // 관에서 나온 빛줄기가 결정에서 꺾여 사진판으로
  sk.ink(dense([[548, 404], [668, 432]]), { w: 5, color: "#7B6CF0", dash: [10, 8], seed: 821, wob: 0 });
  arrow(sk, [[692, 428], [778, 372]], { w: 5, color: "#7B6CF0", dash: [10, 8], seed: 823, straight: true, head: 13, wob: 0 });
  // 세워 둔 사진판: 줄마다 선이 한 계단씩 고르게 옮겨 간다
  const X0 = 790, Y0 = 150, RH = 70;
  thin(sk, 0.85, () => {
    for (const x of [810, 914]) sk.ink(dense([[x, 590], [x + (x < 860 ? -14 : 14), 704]]), { w: 9, color: "#6B4A32", seed: 825 + x, wob: 0.3 });
    const plate = rrect(X0 - 14, Y0 - 16, 172, RH * 6 + 32, 8); sk.fill(plate, "#E3E8EE", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 827 }); sk.ink(plate, { w: 9, seed: 828, wob: 0.6 });
    for (let r = 1; r < 6; r++) sk.ink(dense([[X0 - 8, Y0 + r * RH], [X0 + 152, Y0 + r * RH]]), { w: 2.5, color: "#B4BCC6", seed: 829 + r, wob: 0.2 });
  });
  const lx = r => X0 + 16 + r * 21;
  for (let r = 0; r < 6; r++) sk.ink(dense([[lx(r), Y0 + r * RH + 10], [lx(r), Y0 + (r + 1) * RH - 10]]), { w: 8, color: "#3A3F4A", seed: 841 + r, wob: 0 });
  const st = []; for (let r = 0; r < 6; r++) { st.push([lx(r) + 16, Y0 + r * RH + 6]); st.push([lx(r) + 16, Y0 + (r + 1) * RH + 6]); }
  arrow(sk, st.slice(0, -1).concat([[lx(5) + 16, Y0 + 6 * RH - 6]]), { w: 4.5, color: C.orange, seed: 851, straight: true, head: 12, wob: 0 });
  // 모즐리: 사진판 쪽을 가리킨다
  const P = pose({ elR: [96, -306], haR: [176, -338], elL: [-52, -262], haL: [-40, -214], tilt: 0.05 });
  const fx = 190, fs = 0.66;
  drawFigure(sk, fx, 704, fs, P, { ...MOSELEY, name: "moseley", face: "smile", under: tie(sk) });
  return sk;
}

/* ---------- 8. 오늘날: 118칸의 원소 지도 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  ground(sk, 704, 861);
  const x0 = 390, y0 = 36, cw = 30, ch = 29, fy0 = y0 + 7 * ch + 12;
  const BLUE_G = C.blue;
  let cells = 0;
  const cell = (c, r, yy, sd) => {
    const p = poly([[x0 + c * cw + 2, yy + r * ch + 2], [x0 + (c + 1) * cw - 2, yy + r * ch + 2], [x0 + (c + 1) * cw - 2, yy + (r + 1) * ch - 2], [x0 + c * cw + 2, yy + (r + 1) * ch - 2]], 5);
    const col = yy !== y0 ? "#F4F1E8" : c === 0 ? (r === 0 ? mix(RED_G, "#ffffff", 0.55) : RED_G) : c === 16 ? GRN_G : c === 17 ? BLUE_G : "#F4F1E8";
    cells++;
    sk.fill(p, col, { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(p, { w: 3, seed: sd + 1, wob: 0.25, color: "#4A4A52" });
  };
  thin(sk, 1, () => {
    const boardP = rrect(x0 - 14, y0 - 14, 18 * cw + 28, 7 * ch + 2 * ch + 12 + 28, 14); sk.fill(boardP, C.white, { dx: 1, dy: 1.2, wob: 0.4, seed: 863 }); sk.ink(boardP, { w: 7, seed: 864, wob: 0.6 });
    for (let r = 0; r < 7; r++) for (let c = 0; c < 18; c++) {
      // 6, 7주기의 셋째 칸은 비운다(그 자리의 원소 열다섯씩이 아래 두 줄로 내려가 있다)
      const on = r === 0 ? (c === 0 || c === 17) : r < 3 ? (c < 2 || c > 11) : r < 5 ? true : c !== 2;
      if (on) cell(c, r, y0, 871 + r * 40 + c * 2);
    }
    for (let r = 0; r < 2; r++) for (let c = 2; c < 17; c++) cell(c, r, fy0, 1201 + r * 40 + c * 2);
    // 비운 두 칸(점선 테)과 아래 두 줄을 잇는 점선
    const gx = x0 + 2 * cw, gy = y0 + 5 * ch;
    sk.ink(poly([[gx + 3, gy + 3], [gx + cw - 3, gy + 3], [gx + cw - 3, gy + 2 * ch - 3], [gx + 3, gy + 2 * ch - 3]], 4), { w: 2.5, color: "#8A8F98", dash: [5, 5], seed: 1291, wob: 0 });
    sk.ink(dense([[gx + cw / 2, gy + 2 * ch - 2], [gx + cw / 2, fy0 + 1]]), { w: 2.5, color: "#8A8F98", dash: [4, 4], seed: 1293, wob: 0 });
  });
  if (cells !== 118) throw new Error("g2u4l4 8컷: 주기율표 칸 수가 118이 아니다: " + cells);
  // 맨 왼쪽 세로줄을 아래로 훑는 화살표
  arrow(sk, [[x0 - 27, y0 + 10], [x0 - 27, y0 + 7 * ch - 6]], { w: 6, color: RED_G, seed: 1301, straight: true, head: 15, wob: 0.3 });
  const tp = pose({ elR: [92, -330], haR: [168, -410], elL: [-52, -262], haL: [-40, -214], tilt: 0.05 });
  drawFigure(sk, 184, 704, 0.64, tp, { ...TEACHER, name: "teacher" });
  const sp = pose({ elL: [-104, -330], haL: [-150, -430], elR: [50, -262], haR: [40, -214], tilt: -0.04 });
  drawFigure(sk, 650, 704, 0.45, sp, { ...STUDENT, name: "student" });
  return sk;
}

export const META = {
  title: "118개의 원소,<br><em>지도가 되기까지</em>",
  lead: "1789년 서른세 가지 목록에서 오늘의 118칸 표까지, 원소를 정리해 온 사람들을 따라가요.",
  narrator: "원소가 하나둘 늘어나자 과학자들은 고민했어요. 이 많은 원소를 어떤 <b>순서</b>로 늘어놓아야 한눈에 보일까요?",
  cta: "읽는 법 배우기",
};

const CUTS = [
  {
    fn: p1, when: "1789년, 파리", stage: "첫 목록", title: "서른세 가지 목록",
    caption: "1789년, 프랑스의 라부아지에는 책에 더 이상 쪼갤 수 없다고 본 물질 <b>33가지</b>를 표로 실었어요. 그 속에는 빛과 열도, 훗날 화합물로 밝혀진 흙가루도 들어 있었어요. 나뭇재에서 얻는 포타시는 화합물이 분명해 보인다며 목록에서 빼 두었어요.",
  },
  {
    fn: p2, when: "1807년, 런던", stage: "쪼개 보니", title: "전기로 쪼갠 포타시",
    caption: "1807년, 영국의 데이비는 금속판 수백 장을 이은 전지로 포타시에 전기를 흘렸어요. 그러자 수은처럼 반짝이는 알갱이가 생기더니 몇몇은 불꽃을 내며 탔어요. 새 원소 <b>칼륨</b>이었어요. 이듬해에는 라부아지에의 목록에 있던 흙가루에서도 칼슘과 마그네슘을 얻어 냈어요.",
  },
  {
    fn: p3, when: "1869년, 상트페테르부르크", stage: "실마리", title: "늘어놓으니 되풀이돼요",
    caption: "새 방법으로 찾은 원소가 늘어 1869년 무렵에는 63가지가 알려져 있었어요. 러시아의 멘델레예프는 원소를 원자의 질량이 가벼운 것부터 늘어놓다가, 닮은 성질이 일정한 간격을 두고 <b>다시 나타나는</b> 것을 알아챘어요. 같은 무렵 독일의 로타어 마이어도 비슷한 되풀이를 찾아냈어요.",
    bubbles: [{ who: "mendeleev", text: "닮은 성질이<br>되풀이돼요!" }],
  },
  {
    fn: p4, when: "1871년, 상트페테르부르크", stage: "빈칸", title: "비워 둔 자리",
    caption: "멘델레예프는 순서에 맞는 원소가 없는 자리를 억지로 채우지 않고 <b>빈칸</b>으로 남겼어요. 1871년에 고쳐 낸 표에서는 닮은 원소가 지금처럼 같은 세로줄에 모였어요. 그림에서 노란 테를 두른 빈칸은 알루미늄과 같은 세로줄이에요. 그는 이 칸에 올 원소의 질량과 밀도까지 미리 적어 두었어요.",
    bubbles: [{ who: "mendeleev", text: "아직 못 찾은<br>원소가 있어요" }],
  },
  {
    fn: p5, when: "1875년 8월, 프랑스 코냐크", stage: "발견", title: "처음 보는 보랏빛 선",
    caption: "1875년 8월 27일 밤, 프랑스의 르코크 드 부아보드랑은 아연 광석에서 뽑은 물질에 전기 불꽃을 튀기고, 그 빛을 분광기로 나누어 살폈어요. 그때 어떤 원소에서도 본 적 없는 <b>보랏빛 선</b>이 나타났어요. 그는 새 원소에 프랑스의 옛 이름 갈리아를 따 <b>갈륨</b>이라는 이름을 붙였어요.",
    bubbles: [{ who: "lecoq", text: "처음 보는<br>보랏빛 선!" }],
  },
  {
    fn: p6, when: "1876년, 프랑스", stage: "적중", title: "다시 재 보니",
    caption: "르코크는 예언을 모른 채 갈륨을 찾았고, 처음 잰 밀도는 4.7 g/cm³로 멘델레예프가 적어 둔 값(약 5.9 g/cm³)과 달랐어요. 멘델레예프가 프랑스 학술지에 글을 실어 다시 재 보기를 권했고, 갈륨을 더 많이 모아 다시 재자 약 <b>5.9 g/cm³</b>가 나왔어요. 그 뒤 1879년과 1886년에 찾은 두 원소도 빈칸에 들어맞자 이 표를 믿는 과학자가 크게 늘었어요.",
    bubbles: [{ who: "lecoq", text: "예언한 값이<br>나왔어요" }],
  },
  {
    fn: p7, when: "1913년, 영국 맨체스터", stage: "새 기준", title: "한 칸에 한 계단씩",
    caption: "1913년, 영국의 모즐리는 원소마다 정해진 <b>번호</b>가 있고, 그 번호를 실험으로 잴 수 있다는 것을 알아냈어요. 유리관 속의 원소를 표의 차례대로 바꿔 가며 그 원소가 내는 눈에 보이지 않는 빛을 사진판에 찍었더니, 선이 한 칸에 한 계단씩 고르게 옮겨 갔거든요. 이 번호가 원자핵 속 양성자의 수, 곧 <b>원자 번호</b>예요. 그 뒤로 원소는 질량이 아니라 원자 번호 순서로 줄을 서요.",
    bubbles: [{ who: "moseley", text: "한 칸에<br>한 계단씩!" }],
  },
  {
    fn: p8, stage: "오늘날", title: "118칸의 원소 지도",
    caption: "오늘날 주기율표에는 <b>118가지</b> 원소가 원자 번호 순서로 놓여 있어요. 마지막 칸들의 이름은 2016년에 정해졌어요. 성질이 닮은 원소가 그림의 색칠한 줄처럼 같은 세로줄에 모여 있어서, 자리만 보고도 성질을 짐작할 수 있어요.",
    term: { name: "주기율표", def: "원소를 원자 번호 순서로 늘어놓아, 성질이 비슷한 원소가 같은 세로줄에 오도록 정리한 표예요." },
    bubbles: [{ who: "teacher", text: "세로줄을<br>눈여겨봐요" }, { who: "student", text: "118칸이나!" }],
  },
];

export function panels() {
  return CUTS.map(c => ({ sk: c.fn(), bubbles: c.bubbles, when: c.when, whenPos: c.whenPos, stage: c.stage, title: c.title, caption: c.caption, term: c.term }));
}
