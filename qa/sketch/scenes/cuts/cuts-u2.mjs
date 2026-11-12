// 중1 과학 Ⅱ단원(생물의 구성과 다양성) 개념 컷 코드 그림. 원본은 public/bio4/cuts/*.webp(정본 unit2v5.ts 의 cut("bio4", …) 열두 곳).
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, drop, squiggle, arrow, hash, sparkle } from "../../lib/sk.mjs";
import { sun, notebook } from "../../lib/props.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT, KID } from "../../lib/figure.mjs";
import { W, H, lerpx, lerp2, heat, jiggle, thin, wavy, ray, steam } from "./common.mjs";

/* ---------- u2l8b: 새끼를 낳을 수 있어도 같은 종이 아닐 수 있다? ---------- */
// 네발짐승(옆모습, 오른쪽을 본다). o: body 색, mane 색, ear 길이, tail 모양. 원점 = 앞발과 뒷발 사이 바닥
function equid(sk, x, y, s, o) {
  const sd = o.seed, col = o.color, dark = mix(col, "#000000", 0.32);
  sk.at(x, y, s, () => {
    // 꼬리
    if (o.tail === "brush") { sk.ink(curve([[-118, -228], [-150, -200], [-156, -150]]), { w: 9, seed: sd, wob: 0.5 }); const tf = curve([[-156, -164], [-140, -120], [-156, -96], [-176, -120], [-170, -156]], true, 3); sk.fill(tf, o.mane, { dx: 0, dy: 0, wob: 0.4, seed: sd + 1 }); sk.ink(tf, { w: 7, seed: sd + 2, wob: 0.4 }); }
    else { const tl = curve([[-112, -236], [-150, -224], [-172, -170], [-170, -110], [-152, -122], [-146, -176], [-120, -208]], true, 3); sk.fill(tl, o.mane, { dx: 0, dy: 0, wob: 0.5, seed: sd + 1, tex: 0.6 }); sk.ink(tl, { w: 8, seed: sd + 2, wob: 0.5 }); }
    // 다리 네 개(뒤쪽 두 개는 조금 어둡게)
    for (const [lx, back, i] of [[-96, true, 0], [64, true, 1], [-76, false, 2], [86, false, 3]]) {
      const leg = poly([[lx - 13, -186], [lx + 13, -186], [lx + 9, -14], [lx - 9, -14]], 4);
      sk.fill(leg, back ? mix(col, "#000000", 0.14) : col, { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 3 + i });
      sk.ink(leg, { w: 8, seed: sd + 7 + i, wob: 0.5 });
      const hoof = rrect(lx - 12, -18, 24, 18, 5);
      sk.fill(hoof, "#3A3A40", { dx: 0, dy: 0, wob: 0.3, seed: sd + 11 + i }); sk.ink(hoof, { w: 7, seed: sd + 15 + i, wob: 0.3 });
    }
    // 몸통
    const body = curve([[-126, -232], [-60, -262], [70, -262], [124, -232], [118, -170], [60, -150], [-70, -150], [-128, -176]], true, 4);
    sk.fill(body, col, { seed: sd + 19, tex: true, texAng: 0.1 });
    sk.ink(body, { w: 10, seed: sd + 20 });
    if (o.belly) sk.fill(curve([[-70, -160], [0, -154], [70, -160], [40, -176], [-40, -176]], true, 3), o.belly, { dx: 0, dy: 0, wob: 0.4, seed: sd + 21 });
    // 목과 머리
    const neck = curve([[84, -246], [118, -320], [150, -362], [186, -346], [150, -280], [128, -210]], true, 4);
    sk.fill(neck, col, { seed: sd + 22, dx: 1, dy: 1.2 }); sk.ink(neck, { w: 10, seed: sd + 23 });
    const ear = o.ear;
    for (const [ex, i] of [[150, 0], [166, 1]]) { const e = curve([[ex - 8, -364], [ex - 4 + i * 6, -364 - ear], [ex + 10, -362]], true, 3); sk.fill(e, i ? col : dark, { dx: 0, dy: 0, wob: 0.3, seed: sd + 24 + i }); sk.ink(e, { w: 7, seed: sd + 26 + i, wob: 0.4 }); }
    const head = curve([[140, -376], [178, -380], [244, -314], [250, -290], [230, -278], [168, -318]], true, 4);
    sk.fill(head, col, { seed: sd + 28, dx: 1, dy: 1.2 }); sk.ink(head, { w: 10, seed: sd + 29 });
    if (o.muzzle) sk.fill(curve([[220, -320], [250, -296], [234, -280], [212, -296]], true, 3), o.muzzle, { dx: 0, dy: 0, wob: 0.3, seed: sd + 30 });
    sk.dot(186, -336, 6.5);
    // 갈기
    if (o.maneLong) { const mn = curve([[128, -362], [100, -320], [80, -262], [98, -258], [118, -306], [150, -350]], true, 3); sk.fill(mn, o.mane, { dx: 0, dy: 0, wob: 0.5, seed: sd + 31, tex: 0.6 }); sk.ink(mn, { w: 7, seed: sd + 32, wob: 0.5 }); }
    else sk.ink(curve([[146, -366], [124, -330], [100, -282], [88, -256]]), { w: 9, color: o.mane, seed: sd + 31, wob: 0.4 });
  });
}
function cutU2l8b() {
  const sk = new Sk(W, H, { id: "e" });
  // 원본 구도: 부모 둘은 양옆 앞쪽, 새끼 노새는 가운데 뒤쪽(위), 학생은 가운데 맨 앞. 땅은 저마다 짧은 선으로
  const patch = (x0, x1, y, sd) => sk.ink(curve([[x0, y + 2], [(x0 + x1) / 2, y - 2], [x1, y + 1]]), { w: 9, seed: sd });
  // 당나귀(왼쪽, 회색, 긴 귀, 끝만 술 달린 꼬리)
  patch(30, 380, 560, 11);
  equid(sk, 180, 560, 0.72, { seed: 21, color: "#A7A3A0", mane: "#4E4A48", ear: 74, tail: "brush", belly: "#E2DED8", muzzle: "#E2DED8" });
  // 말(오른쪽, 크고 갈색, 긴 갈기와 꼬리). 노새 쪽을 보게 뒤집는다
  patch(570, 944, 560, 12);
  sk.at(804, 560, 1, () => equid(sk, 0, 0, 0.84, { seed: 61, color: "#B5713E", mane: "#4A2E1C", ear: 30, maneLong: true }), 0, -1);
  // 노새(가운데 뒤, 둘의 중간: 말 같은 몸과 꼬리 + 당나귀처럼 긴 귀). 새끼라 작다
  patch(404, 584, 322, 13);
  equid(sk, 486, 322, 0.5, { seed: 101, color: "#8F6B52", mane: "#3E2C22", ear: 58, belly: "#D8C6B4", muzzle: "#D8C6B4" });
  // 부모 둘 → 새끼
  arrow(sk, [[336, 430], [404, 404], [456, 352]], { w: 8, color: C.teal, seed: 131, wob: 0.4, head: 22 });
  arrow(sk, [[652, 430], [584, 404], [532, 352]], { w: 8, color: C.teal, seed: 133, wob: 0.4, head: 22 });
  // 학생: 가운데 앞에서 갸웃
  patch(420, 540, 704, 14);
  const P = pose({ elR: [56, -262], haR: [30, -222], elL: [-56, -262], haL: [-30, -222], tilt: 0.14 });
  drawFigure(sk, 480, 704, 0.44, P, { ...STUDENT, name: "student" });
  qmark(sk, 590, 520, 0.5, { color: C.teal, seed: 141, rot: 0.15 });
  return sk;
}

/* ---------- u2l2b: 식물 공장엔 태양 전지판과 담장이 추가! ---------- */
function stoneRow(sk, pts, rows, sd, col) {
  // 앞면 사각형(네 점) 안에 엇갈린 돌 줄
  const [a, b, c, d] = pts; // a 왼위, b 오른위, c 오른아래, d 왼아래
  const joint = mix(col, "#000000", 0.38);
  sk.fill(poly([a, b, c, d], 4), col, { seed: sd, tex: 0.5, dx: 0.8, dy: 1 });
  for (let r = 1; r < rows; r++) { const t = r / rows; sk.ink(dense([lerp2(a, d, t), lerp2(b, c, t)]), { w: 6, color: joint, seed: sd + r, wob: 0.6 }); }
  for (let r = 0; r < rows; r++) {
    const t0 = r / rows, t1 = (r + 1) / rows, n = 3;
    for (let k = 1; k < n + (r % 2); k++) { const u = (k - (r % 2 ? 0.5 : 0)) / n; if (u <= 0.08 || u >= 0.92) continue; sk.ink(dense([lerp2(lerp2(a, b, u), lerp2(d, c, u), t0), lerp2(lerp2(a, b, u), lerp2(d, c, u), t1)]), { w: 6, color: joint, seed: sd + 20 + r * 5 + k, wob: 0.4 }); }
  }
  sk.ink(poly([a, b, c, d], 4), { w: 13, seed: sd + 60 });
}
function panel(sk, cx, cy, w, h, sd, rot = 0) {
  sk.at(cx, cy, 1, () => {
    const p = poly([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], 4);
    sk.fill(p, "#3FAE5A", { seed: sd, tex: 0.8, texAng: 1.2 });
    for (let i = 1; i < 4; i++) sk.ink(dense([[-w / 2 + w * i / 4, -h / 2], [-w / 2 + w * i / 4, h / 2]]), { w: 4, color: "#2A7A3E", seed: sd + i, wob: 0.2 });
    sk.ink(dense([[-w / 2, 0], [w / 2, 0]]), { w: 4, color: "#2A7A3E", seed: sd + 5, wob: 0.2 });
    sk.ink(p, { w: 8, seed: sd + 6 });
  }, rot);
}
function cutU2l2b() {
  const sk = new Sk(W, H, { id: "f" });
  const GY = 676;
  // 육각 성벽(위에서 비스듬히 본 모습): 앞 모서리 두 개가 땅선에 닿는다
  const cx = 540, ty = 326, rx = 270, ry = 92, wallH = 270;
  const hex = (k, dy = 0) => { const out = []; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; out.push([cx + rx * k * Math.cos(a), ty + dy + ry * k * Math.sin(a)]); } return out; };
  const top = hex(1); // 0=오른쪽, 1=오른앞, 2=왼앞, 3=왼쪽, 4=왼뒤, 5=오른뒤
  const dn = p => [p[0], p[1] + wallH];
  // 땅: 사람과 사다리 쪽, 그리고 성벽 앞
  sk.ink(curve([[14, GY + 2], [180, GY - 2], [330, GY + 1]]), { w: 9, seed: 11 });
  sk.ink(curve([[top[2][0] - 30, GY + 3], [cx, GY + 1], [top[1][0] + 30, GY + 3]]), { w: 9, seed: 12 });
  thin(sk, 0.72, () => {
    stoneRow(sk, [top[2], top[1], dn(top[1]), dn(top[2])], 4, 21, "#C7BBA8");
    stoneRow(sk, [top[3], top[2], dn(top[2]), dn(top[3])], 4, 101, "#B3A691");
    stoneRow(sk, [top[1], top[0], dn(top[0]), dn(top[1])], 4, 181, "#B3A691");
    // 윗면: 성벽 두께 띠(돌 색) + 안쪽 마당(세포 안)
    const outer = poly(top, 4), inner = poly(hex(0.8, 4), 4);
    sk.fill(outer, "#D9CFBF", { dx: 0, dy: 0, wob: 0.5, seed: 261 });
    sk.fill(inner, "#DFF0D2", { dx: 0, dy: 0, wob: 0.5, seed: 262 });
    sk.ink(inner, { w: 11, seed: 263 });
    sk.ink(outer, { w: 13, seed: 264 });
  });
  // 마당에 이미 놓인 전지판(엽록체)
  panel(sk, cx + 20, ty - 2, 120, 56, 271, -0.05);
  panel(sk, cx + 130, ty + 20, 104, 50, 281, 0.05);
  // 위의 쌤: 전지판을 하나 더 내려놓는다
  const Pt = pose({ elL: [-70, -300], haL: [-120, -280], elR: [60, -300], haR: [16, -268], tilt: -0.1 });
  drawFigure(sk, 420, ty + 12, 0.42, Pt, { ...TEACHER, name: "teacher", mirror: true, seed: 21 });
  panel(sk, 420 + 0.42 * 112, ty + 12 - 0.42 * 282, 92, 44, 291, -0.25);
  // 사다리(왼쪽 앞면에 기댄다)
  const lx0 = 196, lx1 = 252, topY = 392, lean = 102;
  for (const [x, i] of [[lx0, 0], [lx1, 1]]) sk.ink(dense([[x, GY], [x + lean, topY]]), { w: 10, color: C.woodDark, seed: 301 + i });
  for (let k = 1; k < 8; k++) { const t = k / 8; sk.ink(dense([[lerpx(lx0, lx0 + lean, t), lerpx(GY, topY, t)], [lerpx(lx1, lx1 + lean, t), lerpx(GY, topY, t)]]), { w: 8, color: C.woodDark, seed: 311 + k }); }
  // 아래의 학생: 전지판을 머리 위로 받쳐 올린다(판은 몸 밖에서 원래 굵기로)
  const sx = 100, ss = 0.44;
  panel(sk, sx, GY - ss * 560 - 24, 124, 54, 331, 0.06);
  const Pb = pose({ elL: [-150, -400], haL: [-118, -560], elR: [150, -400], haR: [118, -560], tilt: 0 });
  drawFigure(sk, sx, GY, ss, Pb, { ...STUDENT, name: "student", mirror: true });
  return sk;
}

/* ---------- 장면 키우기 ----------
   그림이 화면 아래쪽에만 몰리면 폰(그림 폭 312px)에서 작아진다. 내용의 (cx, cy)가 (tx, ty)로 가도록 k배 키우고,
   선은 √k배만 굵어지게 보정한다(큰 인물일수록 선이 조금 굵은 만화의 문법). */
function fit(sk, k, [cx, cy], [tx, ty], fn) {
  const lw = sk.lwK; sk.save(); sk.translate(tx - k * cx, ty - k * cy); sk.scale(k); sk.lwK = lw / Math.sqrt(k);
  fn();
  sk.restore(); sk.lwK = lw;
}

/* ---------- 공용 소품(Ⅱ단원) ---------- */
const GRASS = ["#4E9A46", "#6BB55A"];
const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
const tuft = (sk, x, y, sd, n = 4, h = 26) => { for (let i = 0; i < n; i++) { const gx = x + i * 10, lean = ((i * 37 + sd) % 5 - 2) * 4; sk.ink(curve([[gx, y], [gx + lean * 0.5, y - h * 0.6], [gx + lean, y - h - (i % 3) * 6]]), { w: 6, color: GRASS[i % 2], seed: sd + i, wob: 0.4 }); } };
// 세포 벽돌: 둥근 네모 + 핵(벽돌 하나하나가 세포)
function cellBrick(sk, x, y, w, h, sd, col = "#F6BFAE") {
  const b = rrect(x - w / 2, y - h / 2, w, h, Math.min(w, h) * 0.32);
  sk.fill(b, col, { seed: sd, dx: 0.8, dy: 1, wob: 0.6 });
  sk.ink(b, { w: 7, seed: sd + 1, wob: 0.6 });
  sk.dot(x + w * 0.1, y - h * 0.04, Math.min(w, h) * 0.16, "#B0476A");
}
// 작은 동물 그림(카드, 표지판용). 원점 = 가운데, s = 크기
function bird(sk, x, y, s, sd, col = "#7FA7D9") {
  sk.at(x, y, s, () => {
    const b = curve([[-34, 4], [-20, -22], [10, -26], [30, -8], [26, 16], [0, 26], [-26, 20]], true, 3);
    sk.fill(b, col, { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd });
    sk.ink(b, { w: 7, wob: 0.4, seed: sd + 1 });
    const wing = curve([[-16, -2], [4, -10], [14, 6], [-4, 12]], true, 3);
    sk.fill(wing, mix(col, "#000000", 0.2), { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 }); sk.ink(wing, { w: 5, wob: 0.3, seed: sd + 3 });
    const beak = poly([[28, -10], [46, -4], [28, 2]], 2);
    sk.fill(beak, C.orange, { dx: 0, dy: 0, wob: 0.2, seed: sd + 4 }); sk.ink(beak, { w: 5, wob: 0.2, seed: sd + 5 });
    sk.dot(16, -12, 3.6);
    sk.ink(dense([[-4, 26], [-6, 40]]), { w: 5, seed: sd + 6, wob: 0.2 }); sk.ink(dense([[8, 25], [8, 40]]), { w: 5, seed: sd + 7, wob: 0.2 });
  });
}
function fish(sk, x, y, s, sd, col = "#F2A65A") {
  sk.at(x, y, s, () => {
    const b = curve([[-34, 0], [-10, -20], [20, -16], [36, 0], [20, 16], [-10, 20]], true, 3);
    const tail = poly([[-32, 0], [-52, -18], [-48, 0], [-52, 18]], 2);
    sk.fill(tail, mix(col, "#000000", 0.15), { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(tail, { w: 6, wob: 0.3, seed: sd + 1 });
    sk.fill(b, col, { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 2 }); sk.ink(b, { w: 7, wob: 0.4, seed: sd + 3 });
    sk.dot(20, -4, 3.6);
    sk.ink(curve([[-6, -14], [0, 0], [-6, 14]]), { w: 4, seed: sd + 4, wob: 0.2 });
  });
}
function bat(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const w = curve([[-58, -14], [-38, -22], [-14, -8], [0, -14], [14, -8], [38, -22], [58, -14], [46, 0], [34, 10], [24, 2], [12, 14], [0, 8], [-12, 14], [-24, 2], [-34, 10], [-46, 0]], true, 3);
    sk.fill(w, "#5B5470", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd }); sk.ink(w, { w: 6, wob: 0.4, seed: sd + 1 });
    const h = circ(0, -14, 10, { over: 0.1, seed: sd + 2 });
    sk.fill(h, "#5B5470", { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 }); sk.ink(h, { w: 5, wob: 0.3, seed: sd + 4 });
    for (const sg of [-1, 1]) sk.fill(poly([[sg * 4, -22], [sg * 10, -32], [sg * 10, -20]], 2), "#5B5470", { dx: 0, dy: 0, wob: 0.2, seed: sd + 5 });
  });
}
function squirrel(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    // 몸 뒤로 솟아 끝이 말린 큰 꼬리
    const tail = curve([[-6, 22], [-30, 18], [-42, -6], [-40, -34], [-26, -52], [-6, -54], [4, -42], [-10, -36], [-22, -32], [-24, -12], [-14, 6]], true, 3);
    sk.fill(tail, "#C9884A", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd, tex: 0.6, texAng: 1.0 }); sk.ink(tail, { w: 6, wob: 0.4, seed: sd + 1 });
    const body = curve([[-8, 26], [-14, 4], [-2, -14], [14, -16], [22, 2], [18, 26]], true, 3);
    sk.fill(body, "#A86A35", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 2 }); sk.ink(body, { w: 6, wob: 0.4, seed: sd + 3 });
    const head = curve([[8, -14], [10, -32], [24, -38], [36, -28], [34, -14], [20, -8]], true, 3);
    sk.fill(head, "#A86A35", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 4 }); sk.ink(head, { w: 6, wob: 0.4, seed: sd + 5 });
    const ear = poly([[16, -34], [18, -48], [26, -36]], 2);
    sk.fill(ear, "#A86A35", { dx: 0, dy: 0, wob: 0.2, seed: sd + 6 }); sk.ink(ear, { w: 5, wob: 0.2, seed: sd + 7 });
    sk.dot(26, -26, 3.2);
    sk.fill(ell(4, 8, 7, 11), "#E8C9A0", { dx: 0, dy: 0, wob: 0.2, seed: sd + 8 });
    sk.ink(curve([[22, 0], [30, 6], [28, 12]]), { w: 4, seed: sd + 9, wob: 0.2 });
  });
}
function frog(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const b = curve([[-30, 10], [-26, -12], [-10, -20], [10, -20], [26, -12], [30, 10], [10, 18], [-10, 18]], true, 3);
    sk.fill(b, "#6BBF59", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd }); sk.ink(b, { w: 6, wob: 0.4, seed: sd + 1 });
    for (const sg of [-1, 1]) { const e = circ(sg * 12, -20, 8, { over: 0.1, seed: sd + 2 }); sk.fill(e, "#6BBF59", { dx: 0, dy: 0, wob: 0.2, seed: sd + 3 }); sk.ink(e, { w: 5, wob: 0.2, seed: sd + 4 }); sk.dot(sg * 12, -21, 3); }
    sk.ink(curve([[-30, 12], [-40, 20], [-30, 22]]), { w: 5, wob: 0.2, seed: sd + 5 }); sk.ink(curve([[30, 12], [40, 20], [30, 22]]), { w: 5, wob: 0.2, seed: sd + 6 });
  });
}
function rabbit(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    for (const [ex, r] of [[-8, -0.12], [8, 0.12]]) sk.at(ex, -40, 1, () => { const e = curve([[-6, 0], [-7, -26], [0, -36], [7, -26], [6, 0]], true, 3); sk.fill(e, "#F1EEE8", { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(e, { w: 5, wob: 0.3, seed: sd + 1 }); }, r);
    const h = circ(0, -30, 16, { over: 0.1, seed: sd + 2 });
    const b = curve([[-24, 20], [-26, -4], [-12, -16], [12, -16], [26, -4], [24, 20]], true, 3);
    sk.fill(b, "#F1EEE8", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 3 }); sk.ink(b, { w: 6, wob: 0.4, seed: sd + 4 });
    sk.fill(h, "#F1EEE8", { dx: 0, dy: 0, wob: 0.3, seed: sd + 5 }); sk.ink(h, { w: 6, wob: 0.3, seed: sd + 6 });
    sk.dot(-6, -32, 2.8); sk.dot(6, -32, 2.8);
  });
}
// 무당벌레(위에서 본 모습). kind: "many" 점 많은 빨강 | "few" 점 몇 개 | "none" 민무늬 빨강 | "black2" 검정 바탕에 빨간 점 둘
function ladybug(sk, x, y, r, kind, sd, rot = 0) {
  sk.at(x, y, r / 30, () => {
    const red = kind === "black2" ? "#2B2B30" : "#E0503A";
    const h = curve([[-12, -26], [0, -36], [12, -26]], false, 3);
    sk.fill([...h, [12, -24], [-12, -24]], "#2B2B30", { dx: 0, dy: 0, wob: 0.2, seed: sd });
    const body = circ(0, 2, 30, { over: 0.1, seed: sd + 1, sy: 1.05 });
    sk.fill(body, red, { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + 2 });
    sk.ink(dense([[0, -24], [0, 30]]), { w: 3, seed: sd + 3, wob: 0.2 });
    const spots = kind === "many" ? [[-14, -10], [14, -10], [-18, 8], [18, 8], [-10, 20], [10, 20], [-6, -2], [6, -2], [-20, -2], [20, -2]]
      : kind === "few" ? [[-13, -6], [13, -6], [-10, 16], [10, 16]] : kind === "black2" ? [[-14, -10], [14, -10], [-11, 16], [11, 16]] : [];
    for (const [sx, sy] of spots) sk.dot(sx, sy, kind === "black2" ? 6.5 : 5, kind === "black2" ? "#E0503A" : "#2B2B30");
    sk.ink(body, { w: 6, seed: sd + 4, wob: 0.3 });
    sk.ink(curve([[-14, -14], [-8, -20], [0, -22]]), { w: 3, color: C.white, seed: sd + 5, wob: 0.2, alpha: 0.8 });
  }, rot);
}
// 개(옆모습, 오른쪽을 본다). 원점 = 발 사이 바닥
function dog(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    sk.ink(curve([[-64, -66], [-86, -88], [-84, -108]]), { w: 9, seed: sd, wob: 0.4 });
    for (const [lx, i] of [[-48, 0], [40, 1], [-34, 2], [54, 3]]) { const leg = poly([[lx - 9, -56], [lx + 9, -56], [lx + 7, 0], [lx - 7, 0]], 3); sk.fill(leg, i < 2 ? "#C9944F" : "#D9A55E", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 + i }); sk.ink(leg, { w: 6, seed: sd + 5 + i, wob: 0.3 }); }
    const body = curve([[-70, -66], [-40, -84], [40, -84], [72, -66], [66, -44], [-64, -44]], true, 3);
    sk.fill(body, "#D9A55E", { seed: sd + 9, dx: 0.8, dy: 1 }); sk.ink(body, { w: 8, seed: sd + 10 });
    const head = curve([[50, -84], [64, -116], [96, -120], [118, -100], [112, -84], [80, -76]], true, 3);
    sk.fill(head, "#D9A55E", { seed: sd + 11, dx: 0.8, dy: 1 }); sk.ink(head, { w: 8, seed: sd + 12 });
    const ear = curve([[66, -112], [56, -92], [64, -76], [74, -98]], true, 3);
    sk.fill(ear, "#9C6A33", { dx: 0, dy: 0, wob: 0.3, seed: sd + 13 }); sk.ink(ear, { w: 6, seed: sd + 14, wob: 0.3 });
    sk.dot(94, -106, 4.2); sk.dot(117, -98, 4.6);
  });
}

/* ---------- u2l1: 생물은 세포라는 벽돌로 지어진 집 ---------- */
function cutU2l1() {
  const sk = new Sk(W, H, { id: "g" });
  fit(sk, 1.3, [593, 668], [480, 678], () => {
    const GY = 668;
    ground(sk, GY, 11);
    const X = 664, bw = 62, bh = 43;
    const B = [];
    // 다리, 몸통, 팔, 머리(머리 왼쪽 위 한 칸이 비어 있다)
    for (const dx of [-bw / 2 - 2, bw / 2 + 2]) for (let k = 0; k < 3; k++) B.push([X + dx, GY - bh / 2 - k * bh]);
    for (const dx of [-bw, 0, bw]) for (let k = 0; k < 3; k++) B.push([X + dx, GY - bh * 3.5 - k * bh]);
    B.push([X - bw * 2.07, GY - bh * 5.2], [X - bw * 2.96, GY - bh * 4.5], [X + bw * 2.07, GY - bh * 5.2], [X + bw * 2.96, GY - bh * 4.5]);
    const HY = GY - bh * 6.5 - 8;
    B.push([X - bw / 2 - 1, HY], [X + bw / 2 + 1, HY], [X + bw / 2 + 1, HY - bh]);
    B.forEach(([x, y], i) => cellBrick(sk, x, y, bw, bh, 300 + i * 7));
    // 빈자리 표시(점선)
    sk.ink(rrect(X - bw - 1, HY - bh - bh / 2, bw, bh, 12), { w: 4, color: C.gray, dash: [8, 7], seed: 401, wob: 0.3 });
    // 바닥에 쌓인 벽돌 몇 개
    for (const [x, y, i] of [[886, GY - bh / 2, 0], [886 - bw - 2, GY - bh / 2, 1], [886 - bw / 2 - 1, GY - bh * 1.5, 2]]) cellBrick(sk, x, y, bw, bh, 410 + i * 7);
    // 쌤: 벽돌 하나를 들어 머리 빈자리에 끼우려 한다
    const P = pose({ elR: [118, -350], haR: [196, -446], elL: [-50, -260], haL: [-24, -218], tilt: 0.08 });
    const fx = 330, fs = 0.72;
    drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
    const hx = fx + fs * 196, hy = GY - fs * 446;
    cellBrick(sk, hx + 30, hy - 14, bw, bh, 430);
    handDot(sk, [hx, hy], C.skin, 431, 12);
    arrow(sk, [[hx + 70, hy - 54], [X - bw * 1.5, HY - bh - 52], [X - bw * 0.9, HY - bh - 30]], { w: 6, color: C.teal, seed: 433, wob: 0.3, head: 16 });
  });
  return sk;
}

/* ---------- u2l2: 세포는 초소형 공장 ---------- */
function cutU2l2() {
  const sk = new Sk(W, H, { id: "h" });
  const GY = 676;
  ground(sk, GY, 11, 14, 300);
  // 세포 공장: 세포막(두 겹 띠) 안에 통제실(핵)과 발전기(마이토콘드리아)
  const cell = curve([[330, 400], [370, 210], [560, 128], [800, 160], [920, 330], [890, 560], [700, 650], [470, 640], [350, 560]], true, 5);
  sk.fill(cell, "#FFF3E6", { dx: 0, dy: 0, wob: 0.6, seed: 21 });
  thin(sk, 0.8, () => {
    sk.ink(cell, { w: 26, color: "#F4B8A0", seed: 22, wob: 0.5 });
    sk.ink(cell, { w: 11, seed: 23 });
  });
  // 문(세포막의 출입구): 왼쪽 벽에 열린 문
  const door = rrect(316, 440, 52, 96, 10);
  sk.fill(door, "#FFF3E6", { dx: 0, dy: 0, wob: 0.3, seed: 24 });
  sk.ink(dense([[316, 444], [316, 536]]), { w: 9, seed: 25 }); sk.ink(dense([[368, 444], [368, 536]]), { w: 9, seed: 26 });
  const leaf = poly([[368, 446], [404, 430], [404, 552], [368, 536]], 3);
  sk.fill(leaf, "#C99A62", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 27 }); sk.ink(leaf, { w: 8, seed: 28 });
  sk.dot(396, 494, 5);
  arrow(sk, [[292, 412], [392, 412]], { w: 7, color: C.teal, straight: true, seed: 29, head: 16 });
  arrow(sk, [[392, 566], [292, 566]], { w: 7, color: C.gray, straight: true, seed: 30, head: 16 });
  // 통제실(핵): 둥근 방 + 계기판
  const nuc = circ(610, 320, 112, { over: 0.1, seed: 31 });
  sk.fill(nuc, "#E4D3F0", { dx: 0, dy: 0, wob: 0.6, seed: 32 });
  thin(sk, 0.8, () => sk.ink(nuc, { w: 12, seed: 33 }));
  const desk = rrect(536, 330, 150, 52, 8);
  sk.fill(desk, "#8A9099", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 34 }); sk.ink(desk, { w: 7, seed: 35 });
  for (const [x, c] of [[562, C.red], [596, C.yellow], [630, C.green]]) sk.dot(x, 348, 8, c);
  const scr = rrect(560, 252, 104, 62, 8);
  sk.fill(scr, "#9FD8F5", { dx: 0, dy: 0, wob: 0.3, seed: 36 }); sk.ink(scr, { w: 7, seed: 37 });
  sk.ink(curve([[572, 296], [592, 272], [612, 288], [634, 262], [652, 280]]), { w: 5, color: C.navy, seed: 38, wob: 0.2 });
  // 발전기(마이토콘드리아): 캡슐 + 안쪽 주름 + 번개
  sk.at(760, 520, 1, () => {
    const m = rrect(-98, -40, 196, 80, 40);
    sk.fill(m, "#F6C177", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 41 });
    sk.ink(curve([[-74, 10], [-56, -20], [-38, 18], [-20, -20], [-2, 18], [16, -20], [34, 18], [52, -20], [70, 10]]), { w: 6, color: "#B5741F", seed: 42, wob: 0.3 });
    sk.ink(m, { w: 9, seed: 43 });
  }, -0.12);
  const bolt = poly([[778, 400], [748, 448], [770, 448], [752, 486], [800, 432], [776, 432], [796, 400]], 2);
  sk.fill(bolt, C.yellow, { dx: 0, dy: 0, wob: 0.2, seed: 44 }); sk.ink(bolt, { w: 6, seed: 45, wob: 0.2 });
  // 쌤(안내)과 학생: 문 앞에서 안을 가리킨다
  const P = pose({ elR: [84, -300], haR: [136, -326], elL: [-50, -260], haL: [-24, -218], tilt: 0.05 });
  drawFigure(sk, 206, GY, 0.6, P, { ...TEACHER, name: "teacher" });
  const S = pose({ elL: [-50, -262], haL: [-26, -220], elR: [50, -262], haR: [26, -220], tilt: 0.1 });
  drawFigure(sk, 62, GY, 0.5, S, { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- u2l3: 얇게, 물들이고, 비스듬히 ---------- */
function cutU2l3() {
  const sk = new Sk(W, H, { id: "i" });
  fit(sk, 1.28, [620, 676], [480, 680], () => {
    const GY = 676, TOP = 500;
    ground(sk, GY, 11);
    // 탁자
    for (const [x, i] of [[360, 0], [880, 1]]) sk.ink(dense([[x, TOP + 24], [x - 6, GY]]), { w: 12, seed: 21 + i });
    const top = rrect(320, TOP, 600, 26, 10);
    sk.fill(top, C.wood, { seed: 23, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 24 });
    // 받침 유리 + 재료(얇은 막) + 떨어지는 파란 염색약(메틸렌 블루)
    const slide = rrect(450, TOP - 14, 220, 16, 3);
    sk.fill(slide, "#DDEEF7", { dx: 0, dy: 0, wob: 0.3, seed: 25 }); sk.ink(slide, { w: 6, seed: 26 });
    sk.fill(ell(560, TOP - 15, 26, 5), "#F3C9C0", { dx: 0, dy: 0, wob: 0.2, seed: 27 });
    drop(sk, 560, TOP - 66, 1.0, { color: "#7DB3F0", line: "#2F6DB5" });
    // 스포이트(고무 꼭지 + 유리관)
    sk.at(560, TOP - 112, 1, () => {
      const tube = poly([[-8, -70], [8, -70], [4, 0], [-4, 0]], 2);
      sk.fill(tube, "#E3F1FA", { dx: 0, dy: 0, wob: 0.2, seed: 28 }); sk.fill(poly([[-6, -24], [6, -24], [4, 0], [-4, 0]], 2), "#7DB3F0", { dx: 0, dy: 0, wob: 0.2, seed: 29 });
      sk.ink(tube, { w: 6, seed: 30, wob: 0.3 });
      const bulb = curve([[-14, -70], [-18, -100], [0, -118], [18, -100], [14, -70]], true, 3);
      sk.fill(bulb, "#C0392B", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 31 }); sk.ink(bulb, { w: 7, seed: 32, wob: 0.3 });
    });
    // 덮개 유리: 한쪽 끝을 받침 유리에 대고 비스듬히 내려놓는 중(핀셋이 위쪽 끝을 잡는다)
    sk.at(612, TOP - 16, 1, () => { const g = rrect(0, -5, 92, 10, 2); sk.fill(g, "#DDEEF7", { dx: 0, dy: 0, wob: 0.2, seed: 33 }); sk.ink(g, { w: 6, seed: 34, wob: 0.2 }); }, -0.5);
    const gx = 612 + 92 * Math.cos(-0.5), gy = TOP - 16 + 92 * Math.sin(-0.5);
    sk.ink(dense([[gx - 4, gy - 2], [gx + 70, gy - 78]]), { w: 6, color: "#8A9099", seed: 35, wob: 0.2 });
    sk.ink(dense([[gx + 6, gy + 4], [gx + 80, gy - 70]]), { w: 6, color: "#8A9099", seed: 36, wob: 0.2 });
    arrow(sk, ell(612, TOP - 16, 70, 70, -0.9, -0.15), { w: 5, color: C.teal, seed: 39, wob: 0.2, head: 12, straight: true });
    sk.at(860, TOP, 1, () => {
      const bot = curve([[-22, -6], [-24, -60], [-10, -74], [-10, -92], [10, -92], [10, -74], [24, -60], [22, -6]], true, 3);
      sk.fill(bot, "#7DB3F0", { seed: 37, dx: 0.6, dy: 0.8 }); sk.ink(bot, { w: 7, seed: 38 });
      sk.fill(rrect(-12, -104, 24, 14, 4), "#3A3F47", { dx: 0, dy: 0, wob: 0.2, seed: 39 });
    });
    // 쌤: 탁자 옆에서 팔을 뻗어 스포이트를 든다
    const P = pose({ elR: [112, -404], haR: [210, -488], elL: [-50, -260], haL: [-24, -218], tilt: 0.1 });
    const fx = 395, fs = 0.72;
    drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
    handDot(sk, [fx + fs * 210, GY - fs * 488], C.skin, 42, 12);
  });
  return sk;
}

/* ---------- u2l4: 모양이 곧 이력서(세 세포의 면접) ---------- */
function chair(sk, x, y, sd) {
  sk.ink(dense([[x - 50, y], [x - 50, y - 104]]), { w: 9, seed: sd, color: C.woodDark });
  sk.ink(dense([[x + 46, y], [x + 46, y - 104]]), { w: 9, seed: sd + 1, color: C.woodDark });
  const seat = rrect(x - 62, y - 116, 124, 16, 6);
  sk.fill(seat, C.wood, { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 2 }); sk.ink(seat, { w: 8, seed: sd + 3 });
  sk.ink(dense([[x - 56, y - 116], [x - 62, y - 262]]), { w: 9, seed: sd + 4, color: C.woodDark });
  return y - 116;
}
const eyes = (sk, x, y, gap = 14, r = 4.6) => { sk.dot(x - gap / 2, y, r); sk.dot(x + gap / 2, y, r); };
function cutU2l4() {
  const sk = new Sk(W, H, { id: "j" });
  const GY = 668;
  ground(sk, GY, 11);
  const PURPLE = "#C77DBA";
  // 지원자 1: 신경세포(가늘고 길다). 세포체에서 갈래진 가지가 뻗고, 긴 축삭 끝에도 가지가 갈라진다
  const s1 = chair(sk, 128, GY, 21), sy = s1 - 40;
  const branch = (x0, y0, a, l, sd) => {
    const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l;
    sk.ink(curve([[x0, y0], [x0 + Math.cos(a + 0.12) * l * 0.55, y0 + Math.sin(a + 0.12) * l * 0.55], [x1, y1]]), { w: 8, color: PURPLE, seed: sd, wob: 0.3 });
    for (const d of [-0.5, 0.45]) sk.ink(dense([[x1, y1], [x1 + Math.cos(a + d) * l * 0.38, y1 + Math.sin(a + d) * l * 0.38]]), { w: 6, color: PURPLE, seed: sd + 1, wob: 0.2 });
  };
  [[-2.55, 58], [-1.95, 66], [-1.25, 62], [-0.62, 54], [-3.05, 50]].forEach(([a, l], i) => branch(128, sy, a, l, 25 + i * 2));
  const ax = [[146, sy + 10], [196, sy + 34], [222, sy + 90], [250, sy + 132], [294, sy + 148]];
  sk.ink(curve(ax), { w: 10, color: PURPLE, seed: 35, wob: 0.4 });
  for (const [a, i] of [[-0.6, 0], [0, 1], [0.6, 2]]) { const e = [294 + Math.cos(a) * 30, sy + 148 + Math.sin(a) * 30]; sk.ink(dense([[294, sy + 148], e]), { w: 6, color: PURPLE, seed: 36 + i, wob: 0.2 }); sk.dot(e[0], e[1], 5.5, PURPLE); }
  const soma = circ(128, sy, 36, { over: 0.1, seed: 31, lump: 0.08 });
  sk.fill(soma, "#E7B2DE", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 32 }); sk.ink(soma, { w: 8, seed: 33, wob: 0.4 });
  sk.dot(132, sy, 11, "#8E4A86");
  // 지원자 2: 적혈구(작고 둥근, 가운데가 오목한 원반). 오목한 가운데는 그늘 고리로
  const s2 = chair(sk, 352, GY, 41);
  sk.at(352, s2 - 34, 1, () => {
    const d = ell(0, 0, 40, 34);
    sk.fill(d, "#E0503A", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 42 });
    sk.ink(ell(0, 2, 20, 15), { w: 7, color: "#B83A2A", seed: 43, wob: 0.2 });
    sk.fill(ell(0, 3, 16, 11), "#F07D6B", { dx: 0, dy: 0, wob: 0.2, seed: 44 });
    sk.ink(d, { w: 8, seed: 45, wob: 0.4 });
  });
  // 지원자 3: 상피세포(납작하고 편평한 판). 가운데에 납작한 핵
  const s3 = chair(sk, 560, GY, 51);
  sk.at(560, s3 - 20, 1, () => {
    const t = poly([[-72, -8], [-48, -20], [10, -22], [64, -14], [76, 4], [50, 18], [-12, 20], [-66, 12]], 4);
    sk.fill(t, "#F6D37A", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 52 }); sk.ink(t, { w: 8, seed: 53, wob: 0.4 });
    sk.fill(ell(0, 0, 14, 7), "#B5741F", { dx: 0, dy: 0, wob: 0.2, seed: 54 });
  });
  // 면접관(쌤): 책상 뒤에서 서류판을 든다
  const P = pose({ elR: [96, -300], haR: [110, -352], elL: [-64, -282], haL: [-104, -262], tilt: -0.06 });
  const fx = 800, fs = 0.72;
  drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
  const hx = fx + fs * 110, hy = GY - fs * 352;
  const clip = rrect(hx - 6, hy - 92, 72, 96, 6);
  sk.fill(clip, C.white, { dx: 0.6, dy: 0.8, wob: 0.3, seed: 61 }); sk.ink(clip, { w: 7, seed: 62 });
  sk.fill(rrect(hx + 16, hy - 98, 28, 12, 3), "#8A9099", { dx: 0, dy: 0, wob: 0.2, seed: 60 });
  for (let i = 0; i < 3; i++) sk.ink(dense([[hx + 6, hy - 66 + i * 20], [hx + 54, hy - 66 + i * 20]]), { w: 4, color: C.gray, seed: 63 + i, wob: 0.2 });
  handDot(sk, [hx, hy], C.skin, 66, 11);
  const desk = rrect(688, GY - 156, 250, 156, 10);
  thin(sk, 0.78, () => { sk.fill(desk, "#E2C49A", { seed: 68, tex: 0.6, texAng: 0.04 }); sk.ink(desk, { w: 11, seed: 69 }); });
  sk.ink(dense([[688, GY - 120], [938, GY - 120]]), { w: 5, color: C.woodDark, seed: 70, wob: 0.3 });
  return sk;
}

/* ---------- u2l5: 한 칸씩 오르면 세포에서 개체까지 ---------- */
function cutU2l5() {
  const sk = new Sk(W, H, { id: "k" });
  const GY = 676, steps = 5, x0 = 250, sw = 138, sh = 90;
  ground(sk, GY, 11, 14, x0 + 20);
  thin(sk, 0.78, () => {
    for (let i = 0; i < steps; i++) {
      const x = x0 + i * sw, y = GY - (i + 1) * sh;
      const blk = poly([[x, y], [x0 + steps * sw, y], [x0 + steps * sw, y + sh], [x, y + sh]], 4);
      sk.fill(blk, i % 2 ? "#E9DCC6" : "#F1E6D3", { dx: 0, dy: 0, wob: 0.4, seed: 21 + i });
      sk.ink(dense([[x, y + sh], [x, y], [x + sw, y]]), { w: 11, seed: 26 + i });
    }
    sk.ink(dense([[x0 + steps * sw, GY - steps * sh], [x0 + steps * sw, GY]]), { w: 11, seed: 31 });
    sk.ink(dense([[x0, GY], [x0 + steps * sw, GY]]), { w: 11, seed: 32 });
  });
  const at = i => [x0 + i * sw + sw * 0.5, GY - (i + 1) * sh];
  const cellDot = (x, y, r, sd) => { const c = circ(x, y, r, { over: 0.1, seed: sd }); sk.fill(c, "#F6BFAE", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 1 }); sk.ink(c, { w: Math.max(5, r * 0.26), seed: sd + 2 }); sk.dot(x + r * 0.15, y, r * 0.3, "#B0476A"); };
  // 1 세포
  { const [x, y] = at(0); fit(sk, 1.25, [x, y], [x, y], () => cellDot(x, y - 34, 32, 41)); }
  // 2 조직: 모양이 비슷한 세포가 모인 덩어리
  { const [x, y] = at(1); fit(sk, 1.2, [x, y], [x, y], () => [[-38, -22], [0, -22], [38, -22], [-19, -56], [19, -56], [0, -88]].forEach(([dx, dy], i) => cellDot(x + dx, y + dy, 20, 50 + i * 4))); }
  // 3 기관: 위(식도에서 이어지는 주머니)
  // 앞에서 본 위: 식도가 왼쪽 위로 들어오고, 큰 주머니(위 바닥)는 그림 오른쪽 위로 부풀고, 날문은 왼쪽 아래에서 샘창자로 이어진다
  const stomach = (x, y, k, sd) => sk.at(x, y, k, () => {
    sk.ink(curve([[-2, -124], [-4, -104], [-8, -86]]), { w: 12, color: "#E78A96", seed: sd, wob: 0.3 });
    const st = curve([[-8, -86], [14, -100], [38, -92], [50, -66], [46, -30], [26, -4], [-6, 2], [-28, -6], [-40, -14], [-30, -28], [-16, -40], [-12, -62]], true, 3);
    sk.fill(st, "#F49AA4", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 1 }); sk.ink(st, { w: 7, seed: sd + 2 });
    sk.ink(curve([[-38, -12], [-54, -6], [-60, 10]]), { w: 10, color: "#E78A96", seed: sd + 3, wob: 0.3 });
    sk.ink(curve([[24, -70], [30, -44], [10, -20]]), { w: 4, color: "#D96C7B", seed: sd + 4, wob: 0.2 });
  });
  { const [x, y] = at(2); stomach(x + 4, y - 8, 1.1, 61); }
  // 4 기관계: 소화계(식도, 위, 작은창자와 큰창자)
  { const [x, y] = at(3); fit(sk, 1.25, [x, y], [x, y], () => {
    // 기관계(소화계): 식도와 위가 작은창자로 이어지고, 큰창자가 그 둘레를 감싼다
    const LI = [[x - 46, y - 4], [x - 52, y - 70], [x - 26, y - 88], [x + 30, y - 86], [x + 54, y - 66], [x + 50, y - 4]];
    sk.ink(curve(LI), { w: 17, color: "#E9B66B", seed: 76 }); sk.ink(curve(LI), { w: 4, color: "#B5741F", seed: 77, wob: 0.2 });
    const SI = [[x - 18, y - 74], [x - 28, y - 62], [x + 26, y - 62], [x + 28, y - 48], [x - 28, y - 46], [x - 28, y - 32], [x + 28, y - 32], [x + 26, y - 18], [x - 6, y - 14]];
    sk.ink(curve(SI), { w: 9, color: "#F2A6A0", seed: 78 }); sk.ink(curve(SI), { w: 3, color: "#C0566B", seed: 79, wob: 0.2 });
    stomach(x + 4, y - 74, 0.5, 71); }); }
  // 5 개체: 강아지 한 마리
  { const [x, y] = at(4); dog(sk, x - 34, y, 0.8, 80); }
  // 학생: 계단 앞 땅에서 계단 쪽을 보고 첫 칸을 가리킨다(팔은 어깨 높이로 내밀어 모자챙에 가리지 않게)
  const P = pose({ elR: [96, -300], haR: [176, -320], elL: [-50, -262], haL: [-26, -220], tilt: 0.06 });
  drawFigure(sk, 140, GY, 0.62, P, { ...STUDENT, name: "student" });
  return sk;
}

/* ---------- u2l6: 다양성은 눈금 세 개로 잰다 ---------- */
function gauge(sk, x, y, r, level, sd, gy = 668) {
  sk.ink(dense([[x, y + r], [x, gy]]), { w: 10, seed: sd, color: "#8A9099" });
  const face = circ(x, y, r, { over: 0.1, seed: sd + 1 });
  sk.fill(face, C.white, { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 2 });
  const arcs = [["#E0503A", Math.PI * 1.0, Math.PI * 1.33], ["#F2D03B", Math.PI * 1.33, Math.PI * 1.66], ["#3FAE5A", Math.PI * 1.66, Math.PI * 2.0]];
  for (const [c, a0, a1] of arcs) sk.ink(ell(x, y + 8, r * 0.72, r * 0.72, a0, a1), { w: 10, color: c, seed: sd + 3, wob: 0.2, cap: "butt" });
  const a = Math.PI * (1 + level);
  sk.ink(dense([[x, y + 8], [x + Math.cos(a) * r * 0.62, y + 8 + Math.sin(a) * r * 0.62]]), { w: 7, seed: sd + 4, wob: 0.1 });
  sk.dot(x, y + 8, 7);
  sk.ink(face, { w: 9, seed: sd + 5 });
}
function cutU2l6() {
  const sk = new Sk(W, H, { id: "l" });
  fit(sk, 1.15, [486, 668], [480, 676], () => {
    const GY = 668;
    ground(sk, GY, 11);
    tuft(sk, 300, GY, 401); tuft(sk, 900, GY, 411);
    const G = [[420, 404], [612, 404], [804, 404]];
    G.forEach(([x, y], i) => gauge(sk, x, y, 70, 0.8, 21 + i * 10));
    // 눈금마다 무엇을 재는지: 생태계(숲과 물), 생물 종류(새, 물고기, 개구리), 변이(무늬가 다른 무당벌레)
    { const [x, y] = G[0]; const pond = ell(x + 30, y - 112, 52, 16); sk.fill(pond, "#9FD8F5", { dx: 0, dy: 0, wob: 0.3, seed: 51 }); sk.ink(pond, { w: 6, seed: 52 }); sk.ink(dense([[x - 40, y - 108], [x - 40, y - 132]]), { w: 9, color: C.woodDark, seed: 53 }); const tr = curve([[x - 66, y - 130], [x - 84, y - 162], [x - 64, y - 198], [x - 32, y - 192], [x - 20, y - 158], [x - 36, y - 128]], true, 3); sk.fill(tr, C.green, { dx: 0, dy: 0, wob: 0.3, seed: 54 }); sk.ink(tr, { w: 7, seed: 55 }); }
    { const [x, y] = G[1]; bird(sk, x - 54, y - 150, 0.72, 61); fish(sk, x + 8, y - 120, 0.72, 65); frog(sk, x + 62, y - 136, 0.82, 69); }
    { const [x, y] = G[2]; ladybug(sk, x - 50, y - 136, 22, "many", 71); ladybug(sk, x, y - 152, 22, "few", 77, 0); ladybug(sk, x + 50, y - 136, 22, "black2", 83, -0.2); }
    // 검사관(쌤): 서류판을 들고 바늘을 가리킨다
    const P = pose({ elR: [96, -306], haR: [176, -330], elL: [-50, -262], haL: [-26, -220], tilt: 0.06 });
    drawFigure(sk, 170, GY, 0.72, P, { ...TEACHER, name: "teacher" });
  });
  return sk;
}

/* ---------- u2l7: 같은 무당벌레인데 무늬가 다르다(변이) ---------- */
function cutU2l7() {
  const sk = new Sk(W, H, { id: "m" });
  fit(sk, 1.4, [634, 668], [480, 680], () => {
    const GY = 668;
    ground(sk, GY, 11);
    tuft(sk, 60, GY, 401); tuft(sk, 880, GY, 411);
    // 그루터기 위의 큰 잎
    const stump = poly([[600, GY], [620, 520], [860, 520], [880, GY]], 4);
    thin(sk, 0.8, () => { sk.fill(stump, "#B5763E", { seed: 21, tex: true, texAng: 1.5 }); sk.ink(stump, { w: 11, seed: 22 }); });
    sk.fill(ell(740, 520, 120, 20), "#E9C9A0", { dx: 0, dy: 0, wob: 0.3, seed: 23 });
    thin(sk, 0.8, () => sk.ink(ell(740, 520, 120, 20), { w: 9, seed: 24 }));
    const leaf = curve([[530, 430], [610, 352], [740, 330], [870, 356], [944, 430], [870, 492], [740, 506], [610, 492]], true, 4);
    sk.fill(leaf, "#7CC36A", { seed: 25, tex: true, texAng: 0.2 });
    sk.ink(curve([[540, 432], [690, 424], [830, 426], [934, 430]]), { w: 6, color: "#4E9A46", seed: 26, wob: 0.3 });
    thin(sk, 0.85, () => sk.ink(leaf, { w: 11, seed: 27 }));
    // 무늬가 제각각인 무당벌레 넷(같은 종 안의 변이)
    ladybug(sk, 626, 408, 30, "many", 31, -0.2);
    ladybug(sk, 722, 392, 30, "few", 37, 0.1);
    ladybug(sk, 814, 404, 30, "none", 43, 0);
    ladybug(sk, 896, 446, 28, "black2", 49, -0.1);
    // 쌤: 돋보기로 들여다본다
    const P = pose({ elR: [96, -300], haR: [160, -320], elL: [-50, -260], haL: [-24, -218], tilt: 0.12, head: [10, -436] });
    const fx = 390, fs = 0.72;
    drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
    const hand = [fx + fs * 160, GY - fs * 320];
    // 렌즈를 첫 무당벌레 위에 댄다(유리 너머로 무늬가 보인다)
    const cx = 626, cy = 404, r = 56;
    sk.ink(dense([[cx - r * 0.72, cy + r * 0.72], hand]), { w: 16, color: "#8A5A33", seed: 61, wob: 0.5 });
    const lens = circ(cx, cy, r, { over: 0.12, seed: 62 });
    sk.fill(lens, "#EAF6FF", { dx: 0, dy: 0, wob: 0.4, seed: 63, alpha: 0.28 });
    sk.ink(curve([[cx - r * 0.6, cy - r * 0.3], [cx - r * 0.4, cy - r * 0.62], [cx - r * 0.08, cy - r * 0.74]]), { w: 6, color: C.white, seed: 64, wob: 0.2 });
    sk.ink(lens, { w: 13, color: "#B8892E", seed: 65 });
    handDot(sk, hand, C.skin, 66, 13);
  });
  return sk;
}

/* ---------- u2l8: 좋은 기준이 좋은 분류를 만든다 ---------- */
function card(sk, x, y, sd, draw, rot = 0) {
  sk.at(x, y, 1, () => {
    const c = rrect(-46, -58, 92, 116, 10);
    sk.fill(c, C.white, { dx: 0.8, dy: 1, wob: 0.4, seed: sd });
    sk.ink(c, { w: 7, seed: sd + 1, wob: 0.4 });
    draw();
  }, rot);
}
function box(sk, x, y, w, h, sd) {
  const back = poly([[x - w / 2 + 14, y - h], [x + w / 2 - 14, y - h], [x + w / 2 - 14, y - h - 22], [x - w / 2 + 14, y - h - 22]], 3);
  sk.fill(back, "#B5895A", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  const front = poly([[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y], [x - w / 2, y]], 4);
  return { done: () => { sk.fill(front, "#D2A672", { seed: sd + 1, tex: true, texAng: 0.05 }); sk.ink(front, { w: 9, seed: sd + 2 }); sk.ink(dense([[x - w / 2, y - h], [x - w / 2 + 14, y - h - 22], [x + w / 2 - 14, y - h - 22], [x + w / 2, y - h]]), { w: 7, seed: sd + 3 }); } };
}
function cutU2l8() {
  const sk = new Sk(W, H, { id: "n" });
  const GY = 676, TOP = 520;
  ground(sk, GY, 11);
  for (const [x, i] of [[372, 0], [884, 1]]) sk.ink(dense([[x, TOP + 24], [x - 6, GY]]), { w: 12, seed: 21 + i });
  const top = rrect(330, TOP, 600, 26, 10);
  sk.fill(top, C.wood, { seed: 23, tex: true, texAng: 0.02 }); sk.ink(top, { w: 11, seed: 24 });
  // 상자 둘: 한쪽엔 물고기 카드, 한쪽엔 박쥐 카드가 먼저 들어가 있다
  const b1 = box(sk, 520, TOP, 170, 96, 31), b2 = box(sk, 740, TOP, 170, 96, 41);
  card(sk, 520, TOP - 120, 51, () => fish(sk, 0, 0, 0.7, 53), -0.08);
  card(sk, 740, TOP - 120, 55, () => bat(sk, 0, 0, 0.7, 57), 0.08);
  b1.done(); b2.done();
  // 다음 차례를 기다리는 카드(다람쥐)
  card(sk, 878, TOP - 58, 61, () => squirrel(sk, 0, 2, 0.8, 63), 0.12);
  // 쌤: 새 카드를 들고 어느 상자에 넣을지 고민
  const P = pose({ elR: [96, -330], haR: [150, -390], elL: [-50, -262], haL: [-24, -220], tilt: 0.1 });
  const fx = 200, fs = 0.72;
  drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
  const hx = fx + fs * 150, hy = GY - fs * 390;
  card(sk, hx + 34, hy - 50, 71, () => bird(sk, -2, -4, 0.62, 73), 0.12);
  handDot(sk, [hx, hy], C.skin, 75, 12);
  qmark(sk, 360, 190, 0.6, { color: C.teal, seed: 77, rot: 0.1 });
  return sk;
}

/* ---------- u2l9: 생물의 왕국은 다섯 ---------- */
function cutU2l9() {
  const sk = new Sk(W, H, { id: "o" });
  const GY = 668;
  ground(sk, GY, 11);
  const cols = ["#7FB2E5", "#B39DDB", "#C8A27A", "#7CC36A", "#F08C7E"];
  const xs = [306, 448, 590, 732, 874], dw = 124, dh = 430, base = GY - 6;
  xs.forEach((x, i) => {
    const arch = [...dense([[x - dw / 2, base], [x - dw / 2, base - dh + dw / 2]]), ...ell(x, base - dh + dw / 2, dw / 2, dw / 2, Math.PI, Math.PI * 2), ...dense([[x + dw / 2, base - dh + dw / 2], [x + dw / 2, base]])];
    sk.fill(arch, "#F4F1EA", { dx: 0, dy: 0, wob: 0.4, seed: 21 + i });
    thin(sk, 0.8, () => { sk.ink(arch, { w: 22, color: cols[i], seed: 26 + i, wob: 0.3 }); sk.ink(arch, { w: 9, seed: 31 + i, wob: 0.3 }); });
  });
  // 문 앞의 생물: 세균(원핵), 아메바(원생), 버섯(균), 새싹 식물(식물), 토끼(동물)
  { const x = xs[0] - 8, y = base - 70; sk.at(x, y, 1.3, () => { const b = rrect(-30, -12, 60, 24, 12); sk.fill(b, "#8FD18A", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 41 }); sk.ink(b, { w: 7, seed: 42 }); sk.ink(curve([[30, 0], [40, -8], [48, 2], [56, -4]]), { w: 5, seed: 43, wob: 0.2 }); }, -0.2); }
  fit(sk, 1.3, [xs[1], base], [xs[1], base], () => { const x = xs[1], y = base - 64; const am = curve([[x - 40, y + 4], [x - 30, y - 22], [x - 4, y - 18], [x + 10, y - 34], [x + 34, y - 14], [x + 40, y + 12], [x + 8, y + 24], [x - 20, y + 20]], true, 3); sk.fill(am, "#CDB6E8", { dx: 0.6, dy: 0.8, wob: 0.4, seed: 44 }); sk.ink(am, { w: 7, seed: 45, wob: 0.4 }); sk.dot(x + 2, y, 7, "#7A5AA6"); });
  fit(sk, 1.3, [xs[2], base], [xs[2], base], () => { const x = xs[2], y = base; sk.ink(dense([[x, y], [x, y - 52]]), { w: 18, color: "#F4E6CF", seed: 46 }); sk.ink(dense([[x - 9, y], [x - 9, y - 50]]), { w: 6, seed: 47 }); sk.ink(dense([[x + 9, y], [x + 9, y - 50]]), { w: 6, seed: 48 }); const cap = curve([[x - 46, y - 46], [x - 30, y - 86], [x, y - 96], [x + 30, y - 86], [x + 46, y - 46]], false, 3); sk.fill([...cap, cap[0]], "#E0503A", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 49 }); sk.ink([...cap, cap[0]], { w: 7, seed: 50 }); for (const [dx, dy] of [[-18, -70], [8, -80], [24, -60]]) sk.dot(x + dx, y + dy, 6, C.white); });
  fit(sk, 1.3, [xs[3], base], [xs[3], base], () => { const x = xs[3], y = base; sk.ink(curve([[x, y], [x + 2, y - 50], [x - 2, y - 88]]), { w: 8, color: "#4E9A46", seed: 51 }); for (const [sg, i] of [[-1, 0], [1, 1]]) { const lf = curve([[x, y - 64 - i * 18], [x + sg * 30, y - 86 - i * 18], [x + sg * 50, y - 70 - i * 18], [x + sg * 22, y - 58 - i * 18]], true, 3); sk.fill(lf, "#7CC36A", { dx: 0, dy: 0, wob: 0.3, seed: 52 + i }); sk.ink(lf, { w: 6, seed: 54 + i }); } });
  { rabbit(sk, xs[4], base - 32, 1.6, 56); }
  // 문지기(쌤): 왼쪽 앞에서 깃발을 든다
  const P = pose({ elR: [116, -318], haR: [178, -372], elL: [-50, -262], haL: [-26, -220], tilt: -0.04 });
  const fx = 104, fs = 0.7;
  drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
  const hx = fx + fs * 178, hy = GY - fs * 372;
  sk.ink(dense([[hx, hy + 36], [hx, hy - 176]]), { w: 7, color: C.woodDark, seed: 61 });
  const flag = poly([[hx, hy - 176], [hx - 66, hy - 156], [hx, hy - 134]], 3);
  sk.fill(flag, C.teal, { dx: 0, dy: 0, wob: 0.3, seed: 62 }); sk.ink(flag, { w: 6, seed: 63 });
  handDot(sk, [hx, hy], C.skin, 64, 11);
  return sk;
}

/* ---------- u2l5b: 두 계단을 나란히 놓으니 한 칸씩 달랐다(동물의 기관계, 식물의 조직계) ---------- */
// 새 판(v6) u2l5 둘째 개념 스텝. 가운데 쌤 양옆으로 동물 계단(왼쪽으로 오른다)과 식물 계단(오른쪽으로 오른다).
// 동물: 세포, 조직, 기관(위), 기관계(소화계), 개체(강아지). 식물: 세포, 조직, 조직계(줄기 단면), 기관(잎), 개체(나무).
// 서로 다른 칸(동물의 넷째, 식물의 셋째)만 청록 띠로 칠해, 끼어드는 자리(높이)가 다르다는 것이 보이게 한다.
// 그림은 디딤판 가운데보다 낮은 쪽(가운데 쌤 쪽)으로 조금 물려 놓는다(높은 쪽 옆판에 닿지 않게).
function plantCell(sk, x, y, w, h, sd) { // 세포벽이 두꺼운 네모난 식물 세포. (x, y) = 아래 가운데
  const c = rrect(x - w / 2, y - h, w, h, Math.min(w, h) * 0.2);
  sk.fill(c, "#BFE3A6", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd });
  sk.ink(c, { w: 6, color: "#3F7D3A", seed: sd + 1 });
  sk.dot(x + w * 0.14, y - h * 0.52, Math.min(w, h) * 0.17, "#3F7D3A");
}
function cutU2l5b() {
  const sk = new Sk(W, H, { id: "q" });
  const GY = 680, sw = 74, sh = 98, n = 5, LX = 404, RX = 556;
  const ODD = { a: 3, p: 2 };
  ground(sk, GY, 11);
  // 디딤판 i 의 그림 자리: 가운데보다 낮은 쪽으로 off 만큼 물린 점(디딤판 윗면)
  const tread = (side, i, off = 0.1) => { const dir = side === "a" ? -1 : 1, x0 = side === "a" ? LX : RX; return [x0 + dir * (i + 0.5 - off) * sw, GY - (i + 1) * sh]; };
  thin(sk, 0.78, () => {
    for (const side of ["a", "p"]) {
      const dir = side === "a" ? -1 : 1, x0 = side === "a" ? LX : RX, xEnd = x0 + dir * n * sw, s0 = side === "a" ? 21 : 41;
      for (let i = 0; i < n; i++) {
        const xi = x0 + dir * i * sw, y = GY - (i + 1) * sh;
        const blk = poly([[xi, y], [xEnd, y], [xEnd, y + sh], [xi, y + sh]], 4);
        sk.fill(blk, ODD[side] === i ? "#BDEBE1" : i % 2 ? "#E9DCC6" : "#F1E6D3", { dx: 0, dy: 0, wob: 0.4, seed: s0 + i });
      }
      for (let i = 0; i < n; i++) {
        const xi = x0 + dir * i * sw, y = GY - (i + 1) * sh;
        if (ODD[side] === i) sk.ink(dense([[xi + dir * 6, y + 10], [xEnd - dir * 6, y + 10]]), { w: 9, color: C.teal, seed: s0 + 10 + i, wob: 0.2 });
        sk.ink(dense([[xi, y + sh], [xi, y], [xi + dir * sw, y]]), { w: 11, seed: s0 + 5 + i });
      }
      sk.ink(dense([[xEnd, GY - n * sh], [xEnd, GY]]), { w: 11, seed: s0 + 16 });
      sk.ink(dense([[x0, GY], [xEnd, GY]]), { w: 11, seed: s0 + 17 });
    }
  });
  const cellDot = (x, y, r, sd) => { const c = circ(x, y, r, { over: 0.1, seed: sd }); sk.fill(c, "#F6BFAE", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 1 }); sk.ink(c, { w: Math.max(5, r * 0.26), seed: sd + 2 }); sk.dot(x + r * 0.15, y, r * 0.3, "#B0476A"); };
  // 동물 계단
  { const [x, y] = tread("a", 0); cellDot(x, y - 28, 24, 101); }
  { const [x, y] = tread("a", 1); [[-23, -15], [0, -15], [23, -15], [-11.5, -38], [11.5, -38], [0, -61]].forEach(([dx, dy], i) => cellDot(x + dx, y + dy, 12.5, 110 + i * 4)); }
  const stomach = (x, y, k, sd) => sk.at(x, y, k, () => {
    sk.ink(curve([[-2, -124], [-4, -104], [-8, -86]]), { w: 12, color: "#E78A96", seed: sd, wob: 0.3 });
    const st = curve([[-8, -86], [14, -100], [38, -92], [50, -66], [46, -30], [26, -4], [-6, 2], [-28, -6], [-40, -14], [-30, -28], [-16, -40], [-12, -62]], true, 3);
    sk.fill(st, "#F49AA4", { dx: 0.6, dy: 0.8, wob: 0.3, seed: sd + 1 }); sk.ink(st, { w: 7, seed: sd + 2 });
    sk.ink(curve([[-38, -12], [-54, -6], [-60, 10]]), { w: 10, color: "#E78A96", seed: sd + 3, wob: 0.3 });
  });
  { const [x, y] = tread("a", 2, 0.2); stomach(x + 6, y - 12, 0.66, 141); }
  { const [x, y] = tread("a", 3, 0.2); fit(sk, 0.78, [x, y], [x, y - 4], () => {
    const LI = [[x - 46, y - 4], [x - 52, y - 70], [x - 26, y - 88], [x + 30, y - 86], [x + 54, y - 66], [x + 50, y - 4]];
    sk.ink(curve(LI), { w: 17, color: "#E9B66B", seed: 151 }); sk.ink(curve(LI), { w: 4, color: "#B5741F", seed: 152, wob: 0.2 });
    const SI = [[x - 18, y - 74], [x - 28, y - 62], [x + 26, y - 62], [x + 28, y - 48], [x - 28, y - 46], [x - 28, y - 32], [x + 28, y - 32], [x + 26, y - 18], [x - 6, y - 14]];
    sk.ink(curve(SI), { w: 9, color: "#F2A6A0", seed: 153 }); sk.ink(curve(SI), { w: 3, color: "#C0566B", seed: 154, wob: 0.2 });
    stomach(x + 4, y - 74, 0.5, 155); }); }
  { const [x, y] = tread("a", 4, 0.3); dog(sk, x - 4, y, 0.6, 161); }
  // 식물 계단
  { const [x, y] = tread("p", 0); plantCell(sk, x, y - 4, 46, 40, 201); }
  { const [x, y] = tread("p", 1); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) plantCell(sk, x - 23 + c * 23, y - 4 - r * 23, 22, 22, 210 + r * 3 + c); }
  { const [x, y] = tread("p", 2, 0.15); // 조직계: 줄기 한 토막(겉껍질, 관다발 고리, 속)
    const hw = 26, ht = 62;
    const body = poly([[x - hw, y - ht], [x + hw, y - ht], [x + hw, y - 2], [x - hw, y - 2]], 3);
    sk.fill(body, "#9BD07F", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 231 });
    sk.ink(dense([[x - 9, y - ht + 4], [x - 9, y - 4]]), { w: 5, color: "#3F7D3A", seed: 232, wob: 0.2 });
    sk.ink(dense([[x + 9, y - ht + 4], [x + 9, y - 4]]), { w: 5, color: "#3F7D3A", seed: 233, wob: 0.2 });
    sk.ink(body, { w: 6, seed: 234 });
    const top = ell(x, y - ht, hw, 10, 0, Math.PI * 2);
    sk.fill(top, "#D6EFC4", { dx: 0, dy: 0, wob: 0.2, seed: 235 }); sk.ink(top, { w: 5, color: "#3F7D3A", seed: 236 });
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; sk.dot(x + Math.cos(a) * 14, y - ht + Math.sin(a) * 5.2, 2.8, "#2E6B2A"); } }
  { const [x, y] = tread("p", 3, 0.15); // 기관: 잎
    sk.ink(curve([[x - 2, y - 2], [x + 2, y - 18]]), { w: 6, color: "#3F7D3A", seed: 241 });
    const lf = curve([[x + 2, y - 18], [x - 26, y - 40], [x - 22, y - 72], [x + 2, y - 86], [x + 26, y - 70], [x + 28, y - 38]], true, 3);
    sk.fill(lf, "#7CC36A", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 242 }); sk.ink(lf, { w: 6, seed: 243 });
    sk.ink(curve([[x + 2, y - 20], [x + 1, y - 52], [x + 2, y - 82]]), { w: 4, color: "#3F7D3A", seed: 244, wob: 0.2 }); }
  { const [x, y] = tread("p", 4, 0.25); // 개체: 나무 한 그루
    const tr = poly([[x - 8, y], [x + 8, y], [x + 6, y - 56], [x - 6, y - 56]], 3);
    sk.fill(tr, C.woodDark, { dx: 0, dy: 0, wob: 0.3, seed: 251 }); sk.ink(tr, { w: 6, seed: 252 });
    const cn = curve([[x - 36, y - 60], [x - 48, y - 98], [x - 26, y - 134], [x + 8, y - 140], [x + 40, y - 120], [x + 46, y - 80], [x + 20, y - 56]], true, 3);
    sk.fill(cn, "#7CC36A", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 253 }); sk.ink(cn, { w: 7, seed: 254 }); }
  // 쌤: 두 계단 사이 바닥에서 양팔로 청록 칸을 하나씩 가리킨다(왼쪽은 더 높은 칸, 오른쪽은 낮은 칸)
  const P = pose({ elL: [-74, -340], haL: [-142, -410], elR: [74, -326], haR: [146, -348], tilt: 0 });
  drawFigure(sk, (LX + RX) / 2, GY, 0.6, P, { ...TEACHER, name: "teacher" });
  return sk;
}

/* ---------- u2l9b: 햇빛으로 만들고, 분해해서 얻고, 먹어서 얻고(식물계, 균계, 동물계) ---------- */
// 새 판(v6) u2l9 둘째 개념 스텝. 양분을 얻는 길이 셋: 화분의 풀은 햇빛을 받고, 버섯은 썩은 통나무에서, 강아지는 사료를 먹는다.
// 고개를 숙여 그릇의 사료를 먹는 개(dog 의 머리만 목에서 아래로 돌린 모양). 원점 = 발 사이 바닥, 오른쪽을 본다
function dogEating(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    sk.ink(curve([[-64, -66], [-86, -88], [-84, -108]]), { w: 9, seed: sd, wob: 0.4 });
    for (const [lx, i] of [[-48, 0], [40, 1], [-34, 2], [54, 3]]) { const leg = poly([[lx - 9, -56], [lx + 9, -56], [lx + 7, 0], [lx - 7, 0]], 3); sk.fill(leg, i < 2 ? "#C9944F" : "#D9A55E", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 + i }); sk.ink(leg, { w: 6, seed: sd + 5 + i, wob: 0.3 }); }
    const body = curve([[-70, -66], [-40, -84], [40, -84], [72, -66], [66, -44], [-64, -44]], true, 3);
    sk.fill(body, "#D9A55E", { seed: sd + 9, dx: 0.8, dy: 1 }); sk.ink(body, { w: 8, seed: sd + 10 });
    sk.at(60, -74, 1, () => {
      const head = curve([[-10, -10], [4, -42], [36, -46], [58, -26], [52, -10], [20, -2]], true, 3);
      sk.fill(head, "#D9A55E", { seed: sd + 11, dx: 0.8, dy: 1 }); sk.ink(head, { w: 8, seed: sd + 12 });
      const ear = curve([[6, -38], [-4, -18], [4, -2], [14, -24]], true, 3);
      sk.fill(ear, "#9C6A33", { dx: 0, dy: 0, wob: 0.3, seed: sd + 13 }); sk.ink(ear, { w: 6, seed: sd + 14, wob: 0.3 });
      sk.dot(34, -32, 4.2); sk.dot(57, -24, 4.6);
    }, 0.62);
  });
}
function cutU2l9b() {
  const sk = new Sk(W, H, { id: "r" });
  const GY = 668;
  fit(sk, 1.2, [486, GY], [480, 678], () => {
    ground(sk, GY, 11, 70, 900);
    sun(sk, 232, 196, 38, { seed: 301 });
    // 화분의 풀(식물계): 해에서 오는 빛을 잎으로 받는다
    const px = 318;
    thin(sk, 0.85, () => {
      const pot = poly([[px - 46, GY - 84], [px + 46, GY - 84], [px + 35, GY], [px - 35, GY]], 4);
      sk.fill(pot, "#D9774A", { seed: 311, dx: 0.8, dy: 1 }); sk.ink(pot, { w: 10, seed: 312 });
      const rim = rrect(px - 53, GY - 104, 106, 22, 6);
      sk.fill(rim, "#E58B5E", { seed: 313, dx: 0.6, dy: 0.8 }); sk.ink(rim, { w: 10, seed: 314 });
    });
    sk.ink(curve([[px, GY - 104], [px + 4, GY - 176], [px - 2, GY - 244]]), { w: 9, color: "#4E9A46", seed: 315 });
    [[-1, GY - 146, 0], [1, GY - 174, 1], [-1, GY - 206, 2], [1, GY - 232, 3]].forEach(([sg, y, i]) => {
      const lf = curve([[px, y], [px + sg * 32, y - 24], [px + sg * 64, y - 9], [px + sg * 32, y + 8]], true, 3);
      sk.fill(lf, "#7CC36A", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 321 + i }); sk.ink(lf, { w: 6, seed: 325 + i });
    });
    ray(sk, [258, 248], [px - 30, GY - 222], 331);
    ray(sk, [276, 232], [px + 36, GY - 250], 333);
    // 썩은 통나무의 버섯(균계): 죽은 나무를 분해하며 자란다
    const L0 = 428, L1 = 600, LT = GY - 62;
    thin(sk, 0.85, () => {
      const log = rrect(L0, LT, L1 - L0, 62, 27);
      sk.fill(log, "#A9743F", { seed: 341, tex: true, texAng: 0.02 }); sk.ink(log, { w: 10, seed: 342 });
      for (const [x, yy, r, i] of [[496, GY - 26, 12, 0], [556, GY - 42, 8, 1], [578, GY - 18, 6, 2]]) { const b = ell(x, yy, r * 1.6, r, 0, Math.PI * 2); sk.fill(b, "#6E4522", { dx: 0, dy: 0, wob: 0.4, seed: 343 + i }); }
      const end = ell(L0 + 16, GY - 31, 19, 31, 0, Math.PI * 2);
      sk.fill(end, "#E3C08E", { dx: 0, dy: 0, wob: 0.3, seed: 347 }); sk.ink(end, { w: 8, seed: 348 });
      sk.ink(ell(L0 + 16, GY - 31, 9, 16, 0, Math.PI * 2), { w: 4, color: "#9A6A36", seed: 349 });
    });
    for (const [x, h, r, i] of [[470, 30, 27, 0], [520, 46, 31, 1], [570, 27, 22, 2]]) {
      const stem = poly([[x - 7, LT + 4], [x + 7, LT + 4], [x + 6, LT - h], [x - 6, LT - h]], 3);
      sk.fill(stem, "#F4E6CF", { dx: 0, dy: 0, wob: 0.3, seed: 351 + i }); sk.ink(stem, { w: 5, seed: 354 + i });
      const cap = curve([[x - r, LT - h + 2], [x - r * 0.7, LT - h - r * 0.62], [x, LT - h - r * 0.8], [x + r * 0.7, LT - h - r * 0.62], [x + r, LT - h + 2]], false, 3);
      sk.fill([...cap, cap[0]], "#C9955E", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 357 + i }); sk.ink([...cap, cap[0]], { w: 6, seed: 360 + i });
    }
    // 사료를 먹는 강아지(동물계)
    const bx = 812;
    thin(sk, 0.85, () => {
      const bowl = curve([[bx - 40, GY - 30], [bx - 30, GY - 2], [bx + 30, GY - 2], [bx + 40, GY - 30]], false, 3);
      sk.fill([...bowl, bowl[0]], "#5B8FD6", { dx: 0.6, dy: 0.8, wob: 0.3, seed: 371 }); sk.ink([...bowl, bowl[0]], { w: 8, seed: 372 });
    });
    for (const [dx, dy, i] of [[-22, -36, 0], [-8, -39, 1], [6, -37, 2], [20, -35, 3]]) sk.dot(bx + dx, GY + dy, 5.5, "#9C6A33");
    dogEating(sk, 702, GY, 0.66, 381);
    // 쌤: 왼쪽에서 수첩을 들고 셋을 견준다
    const P = pose({ elR: [74, -292], haR: [112, -316], elL: [-50, -262], haL: [-26, -220], tilt: 0.04 });
    const fx = 132, fs = 0.6;
    drawFigure(sk, fx, GY, fs, P, { ...TEACHER, name: "teacher", hands: "L" });
    const hx = fx + fs * 112, hy = GY - fs * 316;
    notebook(sk, hx + 22, hy - 4, 0.62, { seed: 391, check: true, rot: 0.08 });
    handDot(sk, [hx, hy], C.skin, 395, 11);
  });
  return sk;
}

/* ---------- u2l10: 그물코가 많을수록 잘 버틴다 ---------- */
function cutU2l10() {
  const sk = new Sk(W, H, { id: "p" });
  fit(sk, 1.18, [480, 676], [480, 680], () => {
    const GY = 676;
    ground(sk, GY, 11);
    const L = 110, R = 850, TY = 300;
    // 그물: 양쪽 기둥 사이에 처진 그물(위 가장자리 직선, 아래는 처짐)
    const topY = u => TY + 14 * Math.sin(u * Math.PI), botY = u => TY + 120 + 70 * Math.sin(u * Math.PI);
    const P = (u, v) => [lerpx(L, R, u), lerpx(topY(u), botY(u), v)];
    const hole = (u, v) => Math.hypot((u - 0.5) * 2.2, v - 0.55) < 0.26;
    const NU = 16, NV = 5;
    for (let i = 0; i <= NU; i++) { const u = i / NU; const seg = []; for (let k = 0; k <= 20; k++) { const v = k / 20; if (hole(u, v)) { if (seg.length > 1) sk.ink(seg.slice(), { w: 5, color: "#6B5A45", seed: 21 + i, wob: 0.3 }); seg.length = 0; continue; } seg.push(P(u, v)); } if (seg.length > 1) sk.ink(seg, { w: 5, color: "#6B5A45", seed: 21 + i, wob: 0.3 }); }
    for (let j = 0; j <= NV; j++) { const v = j / NV; const seg = []; for (let k = 0; k <= 60; k++) { const u = k / 60; if (hole(u, v)) { if (seg.length > 1) sk.ink(seg.slice(), { w: 5, color: "#6B5A45", seed: 41 + j, wob: 0.3 }); seg.length = 0; continue; } seg.push(P(u, v)); } if (seg.length > 1) sk.ink(seg, { w: 5, color: "#6B5A45", seed: 41 + j, wob: 0.3 }); }
    sk.ink(Array.from({ length: 25 }, (_, k) => P(k / 24, 0)), { w: 8, color: "#6B5A45", seed: 51 });
    // 기둥
    for (const [x, i] of [[L, 0], [R, 1]]) { const p = rrect(x - 14, TY - 40, 28, GY - TY + 40, 6); thin(sk, 0.85, () => { sk.fill(p, C.woodDark, { seed: 52 + i, dx: 0.6, dy: 0.8 }); sk.ink(p, { w: 10, seed: 54 + i }); }); }
    // 그물 위의 생물들
    bird(sk, 200, TY - 22, 0.7, 61); frog(sk, 640, TY - 2, 0.85, 65); rabbit(sk, 760, TY - 4, 0.95, 69);
    // 쌤: 바늘과 청록 실로 구멍을 깁는다
    const hc = P(0.5, 0.55);
    const Pz = pose({ elR: [96, -330], haR: [150, -400], elL: [-76, -282], haL: [-118, -300], tilt: 0.1 });
    const fx = 300, fs = 0.66;
    drawFigure(sk, fx, GY, fs, Pz, { ...TEACHER, name: "teacher", hands: "L" });
    const hx = fx + fs * 150, hy = GY - fs * 400;
    // 구멍 가장자리의 끊긴 실 끝
    for (const [a, i] of [[-2.6, 0], [-1.2, 1], [0.4, 2], [1.7, 3], [2.8, 4]]) { const r0 = 0.26 / 2.2 * (R - L); const ex = hc[0] + Math.cos(a) * r0 * 0.95, ey = hc[1] + Math.sin(a) * r0 * 0.52; sk.ink(curve([[ex, ey], [ex - Math.cos(a) * 14, ey - Math.sin(a) * 8 + 6], [ex - Math.cos(a) * 20, ey - Math.sin(a) * 4 + 14]]), { w: 4, color: "#6B5A45", seed: 80 + i, wob: 0.2 }); }
    // 새 실로 꿰맨 땀 둘(구멍 왼쪽부터 메워 간다)과 바늘까지 이어진 실
    for (const [dy, i] of [[-14, 0], [12, 1]]) sk.ink(dense([[hc[0] - 64, hc[1] + dy], [hc[0] - 20, hc[1] + dy + 4]]), { w: 6, color: C.teal, seed: 86 + i, wob: 0.2 });
    sk.ink(curve([[hc[0] - 20, hc[1] + 16], [hc[0] - 40, hc[1] + 40], [hx + 30, hy + 10], [hx + 6, hy - 4]]), { w: 5, color: C.teal, seed: 71, wob: 0.3 });
    sk.ink(dense([[hx - 18, hy + 16], [hx + 30, hy - 30]]), { w: 6, color: "#8A9099", seed: 72, wob: 0.1 });
    handDot(sk, [hx, hy], C.skin, 73, 12);
  });
  return sk;
}

export function cuts() {
  return [
    { name: "u2l1", theme: "bio4", sk: cutU2l1(), alt: "세포 벽돌을 쌓아 사람 모양을 만드는 스틱맨", cap: "생물은 세포라는 벽돌로 지어진 집이에요" },
    { name: "u2l2", theme: "bio4", sk: cutU2l2(), alt: "세포 공장을 견학하는 스틱맨. 문·통제실·발전기가 세포 속에도", cap: "세포는 초소형 공장이에요. 부품마다 맡은 일이 있죠" },
    { name: "u2l2b", theme: "bio4", sk: cutU2l2b(), alt: "육각형 성벽 안 마당에 태양 전지판을 들이는 스틱맨들", cap: "식물 공장엔 태양 전지판과 담장이 추가!" },
    { name: "u2l3", theme: "bio4", sk: cutU2l3(), alt: "받침 유리에 스포이트로 염색액을 떨어뜨리는 스틱맨", cap: "얇게, 물들이고, 비스듬히. 표본의 3원칙" },
    { name: "u2l4", theme: "bio4", sk: cutU2l4(), alt: "세포 지원자들의 면접을 보는 스틱맨 면접관", cap: "모양이 곧 이력서. 면접관은 한눈에 알아봐요" },
    { name: "u2l5", theme: "bio4", sk: cutU2l5(), alt: "세포 블록으로 계단을 쌓아 올라가는 스틱맨", cap: "한 칸씩 오르면 세포에서 개체까지" },
    { name: "u2l6", theme: "bio4", sk: cutU2l6(), alt: "세 개의 눈금 저울로 자연을 재는 스틱맨 검사관", cap: "다양성은 눈금 세 개로 잰다!" },
    { name: "u2l7", theme: "bio4", sk: cutU2l7(), alt: "무늬가 다른 무당벌레들을 돋보기로 견주는 스틱맨", cap: "같은 무당벌레인데 무늬가 달라요. 그게 변이!" },
    { name: "u2l8", theme: "bio4", sk: cutU2l8(), alt: "생물 카드를 기준에 따라 상자에 나눠 담는 스틱맨", cap: "좋은 기준이 좋은 분류를 만든다" },
    { name: "u2l8b", theme: "bio4", sk: cutU2l8b(), alt: "당나귀와 말과 노새를 견주어 보는 스틱맨", cap: "새끼를 낳을 수 있어도 같은 종이 아닐 수 있다?" },
    { name: "u2l9", theme: "bio4", sk: cutU2l9(), alt: "다섯 개의 문 앞에서 생물들을 안내하는 스틱맨 문지기", cap: "생물의 왕국은 다섯. 문지기의 질문만 기억하면 돼요" },
    { name: "u2l5b", theme: "bio4", orig: null, sk: cutU2l5b(), alt: "가운데 선 스틱맨 쌤 양옆으로 동물의 계단(세포, 조직, 위, 소화계, 강아지)과 식물의 계단(세포, 조직, 줄기 단면, 잎, 나무)이 오르고, 서로 다른 칸(소화계와 줄기 단면)만 청록으로 칠해진 장면", cap: "닮은 두 계단, 다른 칸은 하나씩. 자리도 달라요" },
    { name: "u2l9b", theme: "bio4", orig: null, sk: cutU2l9b(), alt: "햇빛을 받는 화분의 풀, 썩은 통나무에서 자라는 버섯, 사료 그릇 앞의 강아지를 수첩을 든 스틱맨 쌤이 견주어 보는 장면", cap: "햇빛으로 만들고, 썩은 것을 분해하고, 먹이를 먹고" },
    { name: "u2l10", theme: "bio4", sk: cutU2l10(), alt: "구멍 난 그물을 기워 생물들을 지키는 스틱맨", cap: "그물코가 많을수록 잘 버텨요. 다양성이 안전망!" },
  ];
}
