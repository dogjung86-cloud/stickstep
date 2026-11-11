// 중1 과학 Ⅱ단원(생물의 구성과 다양성) 개념 컷 코드 그림. 원본은 public/bio4/cuts/*.webp(정본 unit2v5.ts 의 cut("bio4", …) 열두 곳).
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, drop, squiggle, arrow, hash } from "../../lib/sk.mjs";
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

export function cuts() {
  return [
    { name: "u2l2b", theme: "bio4", sk: cutU2l2b(), alt: "육각형 성벽 안 마당에 태양 전지판을 들이는 스틱맨들", cap: "식물 공장엔 태양 전지판과 담장이 추가!" },
    { name: "u2l8b", theme: "bio4", sk: cutU2l8b(), alt: "당나귀와 말과 노새를 견주어 보는 스틱맨", cap: "새끼를 낳을 수 있어도 같은 종이 아닐 수 있다?" },
  ];
}
