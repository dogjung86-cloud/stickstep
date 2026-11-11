// 중1 과학 Ⅵ단원(기체의 성질) 개념 컷 코드 그림.
// 목록은 Ⅵ단원 v5 세션이 새 개념 스텝을 쓰며 낸 것(D:\Brilliant Science\output\g1-v5\u6\concept-cuts.md): u6l1 ~ u6l4.
// u6l5 는 새로 정의할 용어가 없어 개념 스텝이 없다.
// 겨울 장면의 학생은 노란 털모자(노란 모자 학생의 겨울옷). 움직임 표시는 청록, 열은 주황 물결 화살표(Ⅲ단원 문법).
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, emark, qmark, drop, squiggle, arrow, hash, sparkle } from "../../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../../lib/figure.mjs";
import { ball, cloud } from "../../lib/props.mjs";
import { W, H, lerpx, lerp2, thin, ray } from "./common.mjs";

const WKID = { hair: "knit", capColor: "#F2B632", seed: 31 };
const ground = (sk, y, sd, x0 = 14, x1 = 946) => sk.ink(curve([[x0, y + 2], [lerpx(x0, x1, 0.35), y - 2], [lerpx(x0, x1, 0.7), y + 1], [x1, y - 1]]), { w: 9, seed: sd });
function snowflake(sk, x, y, r, sd) { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.3; sk.ink(dense([[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]]), { w: 4, color: "#8FC3E8", seed: sd + i, wob: 0.1 }); } }
// 화면 좌표로 잡은 관절을 인물 좌표(발 사이 원점, 배율 s)로 바꾼다
const local = (ox, oy, s, j) => Object.fromEntries(Object.entries(j).map(([k, v]) => [k, Array.isArray(v) ? [(v[0] - ox) / s, (v[1] - oy) / s] : v]));

/* ---------- u6l1: 운동화는 푹, 눈신발은 사뿐 ---------- */
// 눈신발(비스듬히 내려다본 모습): 나무 테 + 그물 끈. (cx, cy) = 가운데
function snowshoe(sk, cx, cy, sd) {
  const rx = 72, ry = 18;
  const rim = ell(cx, cy, rx, ry);
  sk.fill(rim, "#F1E4C8", { dx: 0, dy: 0, wob: 0.3, seed: sd });
  for (let i = -3; i <= 3; i++) { const x = cx + i * 18, h = ry * Math.sqrt(Math.max(0, 1 - ((i * 18) / rx) ** 2)) - 2; sk.ink(dense([[x - 5, cy - h], [x + 5, cy + h]]), { w: 3, color: "#B08A5A", seed: sd + 2 + i, wob: 0.1 }); }
  sk.ink(dense([[cx - rx + 8, cy], [cx + rx - 8, cy]]), { w: 3, color: "#B08A5A", seed: sd + 10, wob: 0.1 });
  sk.ink(rim, { w: 8, color: "#8A5A33", seed: sd + 11, wob: 0.3 });
}
function cutU6l1() {
  const sk = new Sk(W, H, { id: "a" });
  const SY = 596, SNOW = "#F2F7FB";
  const surf = x => SY + 6 * Math.sin(x / 90) + 3 * Math.sin(x / 31);
  [[90, 110], [230, 60], [400, 130], [600, 64], [780, 120], [900, 60], [60, 300], [880, 300], [420, 300]].forEach(([x, y], i) => snowflake(sk, x, y, 12, 20 + i * 3));
  // 눈
  const top = []; for (let x = 14; x <= 946; x += 6) top.push([x, surf(x)]);
  sk.fill([...top, [946, 712], [14, 712], top[0]], SNOW, { dx: 0, dy: 0, wob: 0, seed: 51 });
  // 지나온 발자국: 아이 뒤는 깊은 구멍, 쌤 뒤는 얕고 넓은 자국
  const hole = (x, y, rx, ry, sd) => { const h = ell(x, y, rx, ry); sk.fill(h, "#C3D7E5", { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(h, { w: 5, color: "#6F8FA6", seed: sd + 1, wob: 0.2 }); };
  hole(86, surf(86) + 20, 18, 7, 55); hole(160, surf(160) + 24, 18, 7, 57);
  for (const [x, i] of [[850, 0], [930, 1]]) sk.ink(ell(x, surf(x) + 26, 50, 9), { w: 5, color: "#B9CFDC", seed: 59 + i, wob: 0.3 });
  sk.ink(top, { w: 9, seed: 61 });
  // 아이: 운동화 발이 눈에 푹 빠져 무릎까지 잠겼다(정강이는 구멍 속). 쌤 쪽으로 손을 뻗는다
  const kx = 290, ks = 0.8, ky = surf(kx) + 8;
  hole(kx, ky, 50, 13, 63);
  // 눈 속에 묻힌 정강이와 운동화(숨은 선은 점선)
  const deep = ks * 106;
  for (const [dx, sg, i] of [[-22, -1, 0], [22, 1, 1]]) {
    const kn = [kx + dx * ks, ky + 4], ft = [kx + dx * ks + sg * 8, ky + deep];
    sk.ink(dense([kn, ft]), { w: 8, color: "#9DB6C8", dash: [10, 9], seed: 81 + i, wob: 0.2 });
    sk.ink(rrect(ft[0] - 14 + sg * 10, ft[1] - 4, 40, 18, 8), { w: 6, color: "#9DB6C8", dash: [9, 8], seed: 83 + i, wob: 0.2 });
  }
  const K = pose({ hip: [0, -110], neck: [12, -238], head: [20, -330], tilt: 0.14,
    elR: [104, -236], haR: [196, -290], elL: [-84, -264], haL: [-128, -350],
    knL: [-22, 0], ftL: [-22, 0], knR: [22, 0], ftR: [22, 0] });
  drawFigure(sk, kx, ky, ks, K, { ...WKID, name: "student" });
  // 구멍 앞쪽 눈 턱이 다리 끝을 가린다
  sk.fill([...ell(kx, ky, 47, 11, 0.12, Math.PI - 0.12), [kx - 46, ky + 2]], SNOW, { dx: 0, dy: 0, wob: 0.2, seed: 65 });
  sk.ink(ell(kx, ky, 50, 13, 0.1, Math.PI - 0.1), { w: 5, color: "#6F8FA6", seed: 66, wob: 0.2 });
  for (const [x, i] of [[kx - 62, 0], [kx + 62, 1]]) sk.ink(curve([[x - 16, surf(x) + 1], [x, surf(x) - 10], [x + 16, surf(x) + 1]]), { w: 6, seed: 67 + i, wob: 0.2 });
  // 쌤: 눈신발을 신고 눈 위에 서서 손을 내민다(왼쪽을 본다). 뒤쪽 발의 눈신발 → 쌤 → 앞쪽 발의 눈신발
  const tx = 676, ts = 0.8, tfy = surf(tx) - 10;
  const T = pose({ hip: [0, -212], neck: [22, -340], head: [36, -432], tilt: 0.1,
    elR: [112, -322], haR: [200, -326], elL: [-52, -262], haL: [-30, -216],
    knL: [-44, -106], ftL: [-74, 0], knR: [40, -106], ftR: [66, 0] });
  snowshoe(sk, tx + ts * 74, surf(tx + ts * 74) - 2, 41);
  drawFigure(sk, tx, tfy, ts, T, { ...TEACHER, name: "teacher", mirror: true });
  snowshoe(sk, tx - ts * 66, surf(tx - ts * 66) + 2, 71);
  drop(sk, kx - 50, ky - 372, 0.95, { rot: -0.3 });
  return sk;
}

/* ---------- u6l2: 시소, 한쪽이 내려가면 다른 쪽이 올라간다 ---------- */
function cutU6l2() {
  const sk = new Sk(W, H, { id: "b" });
  const GY = 672, PV = [480, 552], th = 0.27, HL = 330, T = 24;
  const u = [Math.cos(th), -Math.sin(th)], n = [Math.sin(th), Math.cos(th)]; // 판 방향(오른쪽 위), 판 아래쪽
  const at = (d, off = 0) => [PV[0] + u[0] * d + n[0] * off, PV[1] + u[1] * d + n[1] * off];
  ground(sk, GY, 11);
  // 받침
  thin(sk, 0.78, () => {
    const base = poly([[PV[0] - 70, GY], [PV[0] + 70, GY], [PV[0], PV[1] + 8]], 4);
    sk.fill(base, "#3F7CC0", { seed: 21, tex: 0.7, dx: 0.6, dy: 0.8 }); sk.ink(base, { w: 12, seed: 22 });
    // 판
    const plank = poly([at(-HL), at(HL), at(HL, T), at(-HL, T)], 4);
    sk.fill(plank, "#E9A93C", { seed: 23, tex: true, texAng: -th });
    sk.ink(plank, { w: 12, seed: 24 });
    const pin = circ(PV[0], PV[1] + 12, 10, { over: 0.1, seed: 25 }); sk.fill(pin, "#8A9099", { dx: 0, dy: 0, wob: 0.2, seed: 26 }); sk.ink(pin, { w: 7, seed: 27 });
  });
  // 쌤: 낮아진 왼쪽 끝에 앉아 발을 땅에 댄다(오른쪽을 본다)
  const ts = 0.72, seatT = at(-250), hipT = [seatT[0], seatT[1] - 12];
  const PT = pose(local(hipT[0], GY, ts, { hip: hipT, neck: [hipT[0] + 6, hipT[1] - 94], head: [hipT[0] + 12, hipT[1] - 162],
    knL: [hipT[0] + 62, hipT[1] - 8], ftL: [hipT[0] + 70, GY], knR: [hipT[0] + 68, hipT[1] - 14], ftR: [hipT[0] + 86, GY],
    elL: [hipT[0] + 28, hipT[1] - 48], haL: [hipT[0] + 58, hipT[1] - 22], elR: [hipT[0] + 34, hipT[1] - 44], haR: [hipT[0] + 66, hipT[1] - 18], tilt: 0.04 }));
  drawFigure(sk, hipT[0], GY, ts, PT, { ...TEACHER, name: "teacher", coat: { ...TEACHER.coat, len: 18 } });
  // 아이: 올라간 오른쪽 끝에서 다리를 늘어뜨리고, 한 손은 번쩍(왼쪽을 본다)
  const ks = 0.72, seatK = at(250), hipK = [seatK[0], seatK[1] - 12], gK = at(300);
  const PK = pose(local(hipK[0], GY, ks, { hip: hipK, neck: [hipK[0] - 6, hipK[1] - 94], head: [hipK[0] - 12, hipK[1] - 162],
    knL: [hipK[0] - 54, hipK[1] + 2], ftL: [hipK[0] - 60, hipK[1] + 78], knR: [hipK[0] - 48, hipK[1] - 4], ftR: [hipK[0] - 46, hipK[1] + 72],
    elL: [hipK[0] + 34, hipK[1] - 50], haL: [gK[0], gK[1] - 6], elR: [hipK[0] + 92, hipK[1] - 128], haR: [hipK[0] + 128, hipK[1] - 208], tilt: -0.06 }));
  drawFigure(sk, hipK[0], GY, ks, PK, { ...STUDENT, name: "student", mirror: false, flip: -1 });
  // 내려간 만큼 올라간다(같은 길이의 청록 화살표)
  arrow(sk, [[118, PV[1] - 36], [118, PV[1] + 50]], { w: 9, color: C.teal, straight: true, seed: 41, head: 24, wob: 0.2 });
  arrow(sk, [[858, PV[1] + 4], [858, PV[1] - 82]], { w: 9, color: C.teal, straight: true, seed: 42, head: 24, wob: 0.2 });
  return sk;
}

/* ---------- u6l3: 산꼭대기에서 빵빵해진 과자 봉지 ---------- */
function chipBag(sk, cx, cy, s, sd, rot = 0) {
  sk.at(cx, cy, s, () => {
    const zig = (y, x0, x1, n, up) => { const out = []; for (let i = 0; i <= n; i++) out.push([lerpx(x0, x1, i / n), y + (i % 2 ? (up ? -7 : 7) : 0)]); return out; };
    // 빵빵하게 부푼 몸통(옆이 바깥으로 불룩)
    const body = [...zig(-62, -50, 50, 10, true), ...curve([[50, -62], [66, -20], [68, 20], [50, 62]], false, 3).slice(1),
      ...zig(62, 50, -50, 10, false).slice(1), ...curve([[-50, 62], [-68, 20], [-66, -20], [-50, -62]], false, 3).slice(1)];
    sk.fill(body, "#F5B841", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd, tex: 0.7 });
    sk.fill(rrect(-58, -46, 116, 12, 4), "#E0503A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
    sk.fill(rrect(-58, 34, 116, 12, 4), "#E0503A", { dx: 0, dy: 0, wob: 0.3, seed: sd + 2 });
    const em = circ(0, -2, 22, { over: 0.1, seed: sd + 3 });
    sk.fill(em, C.white, { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 }); sk.ink(em, { w: 5, color: "#E0503A", seed: sd + 5, wob: 0.2 });
    sparkle(sk, 0, -2, 14, { color: "#F58A2E", seed: sd + 6, w: 3 });
    sk.ink(curve([[-40, -30], [-50, 0], [-42, 24]]), { w: 6, color: "#FFF1AE", seed: sd + 7, wob: 0.3 });
    sk.ink(body, { w: 8, seed: sd + 8, wob: 0.4 });
  }, rot);
}
function backpack(sk, x, y, sd) {
  // 뚜껑을 젖혀 연 배낭. (x, y) = 바닥 가운데
  const b = rrect(x - 44, y - 96, 88, 96, 22);
  sk.fill(b, "#3F7CC0", { seed: sd, tex: 0.7, dx: 0.6, dy: 0.8 });
  const pk = rrect(x - 30, y - 50, 60, 36, 10);
  sk.fill(pk, "#5B97D6", { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 }); sk.ink(pk, { w: 6, seed: sd + 2, wob: 0.3 });
  sk.ink(b, { w: 9, seed: sd + 3 });
  const opening = ell(x, y - 94, 40, 10);
  sk.fill(opening, "#2C5A8C", { dx: 0, dy: 0, wob: 0.2, seed: sd + 4 }); sk.ink(opening, { w: 6, seed: sd + 5, wob: 0.2 });
  const flap = curve([[x - 38, y - 98], [x - 58, y - 120], [x - 84, y - 112], [x - 70, y - 92]], true, 3);
  sk.fill(flap, "#2F6DB5", { dx: 0, dy: 0, wob: 0.3, seed: sd + 6 }); sk.ink(flap, { w: 7, seed: sd + 7, wob: 0.3 });
}
function house(sk, x, y, w, roof, sd) {
  const h = w * 0.7;
  const b = poly([[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]], 2);
  sk.fill(b, "#FBF3E2", { dx: 0, dy: 0, wob: 0.2, seed: sd }); sk.ink(b, { w: 4, seed: sd + 1, wob: 0.2 });
  const r = poly([[x - w / 2 - 5, y - h], [x, y - h - w * 0.5], [x + w / 2 + 5, y - h]], 2);
  sk.fill(r, roof, { dx: 0, dy: 0, wob: 0.2, seed: sd + 2 }); sk.ink(r, { w: 4, seed: sd + 3, wob: 0.2 });
  sk.fill(rrect(x - w * 0.12, y - h * 0.5, w * 0.24, h * 0.5, 2), "#8A5A33", { dx: 0, dy: 0, wob: 0.1, seed: sd + 4 });
}
function cutU6l3() {
  const sk = new Sk(W, H, { id: "c" });
  // 먼 산줄기
  thin(sk, 0.7, () => {
    const far = curve([[14, 470], [90, 400], [170, 440], [260, 370], [360, 430], [440, 400], [540, 450], [640, 404], [740, 440], [840, 396], [946, 430]], false, 4);
    sk.fill([...far, [946, 712], [14, 712], far[0]], "#EEF1F4", { dx: 0, dy: 0, wob: 0.3, seed: 11 });
    sk.ink(far, { w: 8, color: "#B9C2CC", seed: 12 });
  });
  // 골짜기의 작은 마을
  sk.fill(poly([[14, 650], [330, 650], [330, 712], [14, 712]], 3), "#DDEBD3", { dx: 0, dy: 0, wob: 0.3, seed: 15 });
  thin(sk, 0.7, () => sk.ink(curve([[14, 652], [160, 648], [330, 654]]), { w: 7, seed: 16, color: "#7E9A70" }));
  [[60, 650, 30, "#E0503A"], [104, 650, 26, "#3F7CC0"], [150, 652, 32, "#F58A2E"], [204, 650, 26, "#E0503A"], [250, 652, 30, "#3FAE5A"]].forEach(([x, y, w, c], i) => house(sk, x, y, w, c, 21 + i * 7));
  for (const [x, i] of [[30, 0], [180, 1], [290, 2]]) { const t = circ(x, 632, 12, { over: 0.1, seed: 61 + i }); sk.fill(t, "#6BB55A", { dx: 0, dy: 0, wob: 0.2, seed: 64 + i }); sk.ink(t, { w: 4, seed: 67 + i, wob: 0.2 }); }
  // 마을 위로 지나는 구름(꼭대기보다 낮다)
  cloud(sk, 230, 560, 170, 56, { seed: 71, w: 6 });
  cloud(sk, 420, 610, 120, 42, { seed: 75, w: 6 });
  // 큰 산: 꼭대기는 오른쪽
  const PT = 516;
  thin(sk, 0.8, () => {
    const m = curve([[300, 712], [380, 650], [470, 590], [548, PT + 6], [580, PT], [800, PT - 2], [830, PT + 8], [900, 600], [946, 630]], false, 4);
    sk.fill([...m, [946, 712], [300, 712], m[0]], "#D9D2C4", { seed: 81, tex: true, texAng: 0.3 });
    sk.ink(m, { w: 11, seed: 82 });
    for (const [a, b, i] of [[[540, 600], [610, 622]], [[700, 572], [780, 556]], [[620, 670], [720, 660]]].map((p, i) => [...p, i])) sk.ink(curve([a, lerp2(a, b, 0.5).map((v, k) => v + (k ? -6 : 0)), b]), { w: 5, color: "#A79E8C", seed: 83 + i, wob: 0.3 });
  });
  // 배낭과 학생
  backpack(sk, 590, PT, 91);
  const fx = 690, s = 0.72;
  const P = pose({ elR: [104, -380], haR: [150, -470], elL: [-96, -312], haL: [-160, -350], tilt: -0.1,
    knL: [-30, -106], ftL: [-52, 0], knR: [26, -106], ftR: [48, 0] });
  drawFigure(sk, fx, PT, s, P, { ...STUDENT, name: "student" });
  const hand = [fx + s * 150, PT - s * 470];
  chipBag(sk, hand[0] + 34, hand[1] - 58, 0.95, 101, 0.12);
  handDot(sk, hand, C.skin, 111, 12);
  // 부풀어 오른 봉지 둘레의 작은 선과 놀람
  for (const [a, i] of [[-2.6, 0], [-1.6, 1], [-0.6, 2], [0.2, 3]]) { const c = [hand[0] + 34, hand[1] - 58]; sk.ink(dense([[c[0] + Math.cos(a) * 92, c[1] + Math.sin(a) * 84], [c[0] + Math.cos(a) * 118, c[1] + Math.sin(a) * 108]]), { w: 6, color: C.gray, seed: 121 + i, wob: 0.2 }); }
  emark(sk, 548, 162, 0.85, { color: C.red, rot: -0.15 });
  return sk;
}

/* ---------- u6l4: 겨울 운동장의 찌그러진 공, 난로 옆에서 다시 탱탱 ---------- */
function dentedBall(sk, x, y, r, sd, bg) {
  // 바람이 빠진 듯 쭈글한 축구공: 아래로 조금 퍼지고, 위가 얕게 꺼졌다(깊게 파면 하트나 깨문 공으로 읽힌다)
  const cy = y + r * 0.06, kx = 1.08, ky = 0.9;
  sk.save(); sk.translate(x, cy); sk.scale(kx, ky); ball(sk, 0, 0, r, { seed: sd }); sk.restore();
  const P = (a, k) => [x + kx * r * k * Math.cos(a), cy + ky * r * k * Math.sin(a)];
  const a0 = -2.6, a1 = -0.55, am = (a0 + a1) / 2, d = a1 - a0;
  const inner = curve([P(a0, 1), P(a0 + 0.25 * d, 0.88), P(am, 0.76), P(a1 - 0.25 * d, 0.88), P(a1, 1)], false, 3);
  const outer = []; for (let i = 0; i <= 24; i++) outer.push(P(a1 + (a0 - a1) * i / 24, 1.22));
  sk.fill([...outer, ...inner], bg, { dx: 0, dy: 0, wob: 0, seed: sd + 20 });
  sk.ink(inner, { w: 9, seed: sd + 21, wob: 0.4 });
  // 꺼진 자리 둘레와 옆구리의 주름
  for (const [t, i] of [[0.3, 0], [0.55, 1], [0.78, 2]]) { const a = a0 + t * d; sk.ink(curve([P(a, 0.74), P(a + 0.06, 0.6), P(a - 0.02, 0.48)]), { w: 4.5, color: C.gray, seed: sd + 22 + i, wob: 0.2 }); }
  sk.ink(curve([P(2.5, 0.92), P(2.65, 0.78), P(2.85, 0.84)]), { w: 4.5, color: C.gray, seed: sd + 26, wob: 0.2 });
  sk.ink(curve([P(0.65, 0.92), P(0.5, 0.78), P(0.3, 0.84)]), { w: 4.5, color: C.gray, seed: sd + 27, wob: 0.2 });
}
function heater(sk, x, y, sd) {
  // 둥근 석유난로. (x, y) = 바닥 가운데
  sk.glow(x, y - 120, 128, "#FFB46B", 0.45, 0.1);
  for (const [dx, i] of [[-40, 0], [40, 1]]) sk.ink(dense([[x + dx, y - 20], [x + dx * 1.2, y]]), { w: 9, seed: sd + i });
  const body = rrect(x - 58, y - 214, 116, 196, 26);
  sk.fill(body, "#C9D1D9", { seed: sd + 2, tex: 0.7, dx: 0.6, dy: 0.8 });
  const win = rrect(x - 40, y - 168, 80, 96, 16);
  sk.fill(win, "#F58A2E", { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 });
  sk.fill(rrect(x - 26, y - 150, 52, 60, 12), C.lemon, { dx: 0, dy: 0, wob: 0.3, seed: sd + 4 });
  for (let i = 0; i < 3; i++) sk.ink(dense([[x - 40, y - 146 + i * 24], [x + 40, y - 146 + i * 24]]), { w: 4, color: "#B5541F", seed: sd + 5 + i, wob: 0.1 });
  sk.ink(win, { w: 7, seed: sd + 8 });
  sk.ink(body, { w: 10, seed: sd + 9 });
  const lid = ell(x, y - 214, 62, 14);
  sk.fill(lid, "#8A9099", { dx: 0, dy: 0, wob: 0.3, seed: sd + 10 }); sk.ink(lid, { w: 8, seed: sd + 11 });
}
function cutU6l4() {
  const sk = new Sk(W, H, { id: "d" });
  const P0 = [16, 472], P1 = [488, 944], PT = 16, PB = 704, GY = 640;
  [[P0, "#EAF3FB"], [P1, "#FFF1E3"]].forEach(([[a, b], c], i) => { const r = rrect(a, PT, b - a, PB - PT, 22); sk.fill(r, c, { dx: 0, dy: 0, wob: 0.3, seed: 11 + i }); thin(sk, 0.6, () => sk.ink(r, { w: 9, seed: 13 + i, color: "#C9CED6" })); });
  // 왼쪽: 겨울 운동장(눈송이, 축구 골대)
  [[70, 90], [190, 60], [330, 110], [420, 70], [260, 190], [400, 300]].forEach(([x, y], i) => snowflake(sk, x, y, 11, 21 + i * 3));
  thin(sk, 0.62, () => {
    const gx0 = 324, gx1 = 452, gt = 430;
    for (let k = 1; k < 5; k++) sk.ink(dense([[lerpx(gx0, gx1, k / 5), gt], [lerpx(gx0, gx1, k / 5), GY]]), { w: 4, color: "#C3CBD3", seed: 31 + k, wob: 0.2 });
    for (let k = 1; k < 5; k++) sk.ink(dense([[gx0, lerpx(gt, GY, k / 5)], [gx1, lerpx(gt, GY, k / 5)]]), { w: 4, color: "#C3CBD3", seed: 36 + k, wob: 0.2 });
    sk.ink(dense([[gx0, GY], [gx0, gt], [gx1, gt], [gx1, GY]]), { w: 12, seed: 41, color: "#8A9099" });
  });
  ground(sk, GY, 43, 36, 452);
  const ks = 0.62, kx = 146;
  // 두 손으로 공을 아래에서 받쳐 든다(눌린 자리가 위에서 잘 보이고, 공이 얼굴을 가리지 않게 허리 높이에서)
  const K = pose({ elR: [104, -250], haR: [190, -226], elL: [88, -240], haL: [150, -214], tilt: 0.16 });
  drawFigure(sk, kx, GY, ks, K, { ...WKID, name: "student", hands: false });
  const br = 56, bc = [kx + ks * 170, GY - ks * 226 - br + 6];
  dentedBall(sk, bc[0], bc[1], br, 51, "#EAF3FB");
  handDot(sk, [kx + ks * 190, GY - ks * 226], C.skin, 61, 11); handDot(sk, [kx + ks * 150, GY - ks * 214], C.skin, 62, 11);
  // 추워서 덜덜(몸 옆 떨림 선)과 입김
  for (const [dx, i] of [[-62, 0], [-78, 1]]) sk.ink(curve([[kx + dx, GY - 210], [kx + dx - 6, GY - 196], [kx + dx + 2, GY - 182], [kx + dx - 6, GY - 168]]), { w: 5, color: "#8FC3E8", seed: 63 + i, wob: 0.1 });
  qmark(sk, kx - 70, 300, 0.55, { color: C.teal, seed: 65, rot: -0.12 });
  // 가운데: 다음 장면으로
  arrow(sk, [[446, 196], [514, 196]], { w: 9, color: C.teal, straight: true, seed: 71, head: 22, wob: 0.2 });
  // 오른쪽: 난로 옆
  ground(sk, GY, 73, 508, 924);
  thin(sk, 0.8, () => heater(sk, 870, GY, 81));
  const ts = 0.62, tx = 556;
  const T = pose({ elR: [104, -250], haR: [190, -226], elL: [88, -240], haL: [150, -214], tilt: 0.06 });
  drawFigure(sk, tx, GY, ts, T, { ...TEACHER, name: "teacher", hands: false });
  const tb = [tx + ts * 170, GY - ts * 226 - 52 + 6];
  ball(sk, tb[0], tb[1], 52, { seed: 91 });
  handDot(sk, [tx + ts * 190, GY - ts * 226], C.skin, 93, 11); handDot(sk, [tx + ts * 150, GY - ts * 214], C.skin, 94, 11);
  // 난로의 열(주황 물결 화살표)이 공으로
  for (const [dy, i] of [[-38, 0], [0, 1], [38, 2]]) ray(sk, [806, tb[1] + dy], [tb[0] + 64, tb[1] + dy * 0.5], 95 + i, { amp: 5, waves: 3, w: 6 });
  // 탱탱해진 공 둘레의 반짝
  sparkle(sk, tb[0] + 6, tb[1] - 84, 14, { seed: 99 });
  sparkle(sk, tb[0] + 58, tb[1] - 62, 10, { seed: 101 });
  return sk;
}

export function cuts() {
  return [
    { name: "u6l1", theme: "gas6", orig: null, sk: cutU6l1(), alt: "눈밭에서 운동화를 신은 아이는 무릎까지 빠져 있고, 넓적한 눈신발을 신은 쌤은 눈 위에 서서 손을 내미는 장면", cap: "같은 눈인데 누구는 푹, 누구는 사뿐. 닿는 넓이가 달라서예요" },
    { name: "u6l2", theme: "gas6", orig: null, sk: cutU6l2(), alt: "시소의 한쪽에 앉은 쌤이 내려가자 반대쪽의 아이가 그만큼 올라가는 장면", cap: "한쪽이 내려가면 다른 쪽은 올라가요" },
    { name: "u6l3", theme: "gas6", orig: null, sk: cutU6l3(), alt: "산꼭대기에서 배낭을 연 아이가 빵빵해진 과자 봉지를 꺼내 들고 놀라는 장면, 산 아래에 작은 마을", cap: "산꼭대기에서 과자 봉지가 빵빵해졌어요" },
    { name: "u6l4", theme: "gas6", orig: null, sk: cutU6l4(), alt: "겨울 운동장에서 찌그러진 축구공을 든 아이와, 난로 옆에서 다시 탱탱해진 공을 든 쌤", cap: "찬 바깥에선 쭈글, 따뜻한 난로 옆에선 탱탱" },
  ];
}
