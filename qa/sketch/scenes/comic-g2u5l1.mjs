// 중2 과학 g2u5l1 도입 만화(v2, 배선 전): 나무의 몸은 어디서 왔을까(광합성). 8컷.
// 조사와 콘티: qa/sketch/research/g2u5l1.md
//   1 반 헬몬트: 말린 흙과 버드나무 줄기를 달아 심는다 → 2 빗물만 주며 5년(구멍 뚫린 덮개, 세지 않은 낙엽)
//   → 3 나무는 훌쩍 컸는데 흙은 거의 그대로 → 4 1771 프리스틀리: 초가 꺼진 공기에 박하를 넣어 두면 새 초가 탄다
//   → 5 1779 잉엔하우스: 햇빛 속 잎에서만 기포 → 6 1782 세네비에: 이산화 탄소가 녹은 물에서만 기포
//   → 7 1804 소쉬르: 물도 몸이 된다 → 8 오늘날: 광합성
// 색 약속(한 편 내내 같은 뜻): 이산화 탄소 = 회색 점과 회색 화살표, 물 = 파란 물방울과 파란 화살표,
//   산소 = 하늘색 기포, 빛 = 주황 물결 화살표. 양분은 그리지 않는다.
// 과학자들은 '산소', '광합성'이라는 말을 몰랐다. 이름은 마지막 컷에서 쌤이 붙인다.
// 잉엔하우스는 중1 만화 u3l3의 INGEN 설정과 귀 옆 말림(wigRolls)을 그대로 옮겨 왔다.
import { Sk, C, curve, dense, circ, ell, poly, rrect, mix, hash, emark, qmark, xmark, check, squiggle, drop, arrow } from "../lib/sk.mjs";
import { drawFigure, handDot, pose, TEACHER, STUDENT } from "../lib/figure.mjs";
import { sun, kettle, notebook } from "../lib/props.mjs";

const W = 960, H = 720;
const thin = (sk, k, fn) => { const o = sk.lwK; sk.lwK = k; fn(); sk.lwK = o; };
const ground = (sk, y, sd) => sk.ink(curve([[14, y + 3], [300, y - 2], [640, y + 2], [946, y - 2]]), { w: 9, seed: sd });

const LEAF = "#6FBF5A", LEAF_D = "#2F7D46", BARK = "#9A7448", SOIL = "#7A5234", POT = "#C9773F";
const GLASS = "#F6FBFD", WATER = "#CFEAF8", WATER_D = "#5FAEDD", O2 = "#BFE6F7", CO2 = "#7E848C", METAL = "#6E7682";

/* ---------- 인물 ---------- */
// 반 헬몬트: 수염 없는 나이 든 얼굴, 짧은 회색 머리, 짙은 갈색 긴 겉옷과 넓게 접힌 흰 깃(1648년 책 앞장의 판화)
const HELMONT = { hair: "short", hairColor: "#B9B3A7", fringe: 24, coat: { color: "#5E4A3C", seam: "#3A2C22", len: 74 }, collar: "ruff", seed: 611, mini: true, face: "calm" };
// 프리스틀리(1771년 서른여덟): 짧은 회색 가발, 목사의 검은 외투, 흰 목 천
const PRIESTLEY = { hair: "short", hairColor: "#D5D0C6", fringe: 24, coat: { color: "#3C3E46", seam: "#6C707A", buttons: "#8A8E98", len: 44 }, collar: "cravat", seed: 621, mini: true, face: "calm" };
// 잉엔하우스: 중1 u3l3 만화와 같은 설정
const INGEN = { hair: "short", hairColor: "#ECE8E0", fringe: 24, coat: { color: "#3E6B4A", buttons: "#D8C49A", seam: "#28462F", len: 40 }, rolls: true, seed: 511, mini: true, face: "calm" };
// 세네비에(제네바의 목사, 차림은 짐작): 긴 잿빛 보라 옷과 흰 가슴 띠 두 가닥, 짧은 갈회색 머리
const SENEBIER = { hair: "short", hairColor: "#8C8074", fringe: 24, coat: { color: "#5A5470", seam: "#3A3650", len: 78 }, collar: "bands", seed: 631, mini: true, face: "calm" };
// 소쉬르(차림은 짐작): 짧은 갈색 머리, 남색 외투
const SAUSSURE = { hair: "short", hairColor: "#6B4A32", fringe: 24, coat: { color: C.navy, buttons: C.gold, seam: "#1E2B49", len: 44 }, seed: 641, mini: true, face: "calm" };

function wigRolls(sk, x, y, s, p, o = {}) {
  const col = o.wig ?? "#ECE8E0", sd = o.seed ?? 901;
  sk.save(); sk.translate(x, y); sk.scale(s * (o.mirror ? -1 : 1), s); sk.translate(p.head[0], p.head[1]); sk.rotate(p.tilt ?? 0);
  for (const sg of [-1, 1]) for (const [cy, rr, i] of [[-2, 23, 0], [38, 20, 1]]) {
    const c = circ(sg * (98 + i * 2), cy, rr, { over: 0.25, seed: sd + i + (sg > 0 ? 4 : 0), lump: 0.05 });
    sk.fill(c, col, { dx: 1, dy: 1.4, wob: 0.8, seed: sd + 10 + i });
    sk.ink(c, { w: 9, wob: 0.8, seed: sd + 20 + i });
    sk.ink(curve([[sg * (90 + i * 2), cy - 6], [sg * (102 + i * 2), cy - 2], [sg * (98 + i * 2), cy + 9]]), { w: 5, wob: 0.4, seed: sd + 30 + i, color: "#B9B3A7" });
  }
  sk.restore();
}
// 목 아래의 흰 깃(겉옷 위, 팔 뒤). ruff: 넓게 접힌 깃, cravat: 목 천, bands: 목사의 가슴 띠 두 가닥
const collar = (sk, p, kind, sd) => () => {
  const [nx, ny] = p.neck;
  const piece = (pts, i) => { const s = poly(pts, 3); sk.fill(s, C.white, { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + i }); sk.ink(s, { w: 6, wob: 0.5, seed: sd + 4 + i }); };
  if (kind === "ruff") for (const sg of [-1, 1]) piece([[nx, ny + 6], [nx + sg * 58, ny + 20], [nx + sg * 48, ny + 50], [nx, ny + 34]], sg > 0 ? 1 : 0);
  if (kind === "cravat") piece([[nx - 16, ny + 6], [nx + 16, ny + 6], [nx + 12, ny + 50], [nx, ny + 62], [nx - 12, ny + 50]], 0);
  if (kind === "bands") for (const sg of [-1, 1]) piece([[nx + sg * 2, ny + 6], [nx + sg * 19, ny + 6], [nx + sg * 21, ny + 58], [nx + sg * 3, ny + 56]], sg > 0 ? 1 : 0);
};
function person(sk, x, y, s, p, who, extra = {}) {
  const o = { ...who, ...extra };
  if (o.collar) o.under = collar(sk, p, o.collar, o.seed + 300);
  drawFigure(sk, x, y, s, p, o);
  if (o.rolls) wigRolls(sk, x, y, s, p, { mirror: o.mirror, seed: o.seed + 400 });
}

/* ---------- 빛, 기체, 물 ---------- */
const wavy = (a, b, amp = 7, waves = 5) => {
  const n = 64, out = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 0; i <= n; i++) { const u = i / n, o = amp * Math.sin(u * waves * 2 * Math.PI) * Math.min(1, (1 - u) * 5); out.push([a[0] + dx * u + nx * o, a[1] + dy * u + ny * o]); }
  return out;
};
// 빛: 주황 물결 화살표
const ray = (sk, a, b, sd, o = {}) => arrow(sk, wavy(a, b, o.amp ?? 7, o.waves ?? 4), { w: o.w ?? 7, color: C.orange, seed: sd, wob: 0.3, head: o.head ?? 18 });
// 산소: 하늘색 기포
const bubble = (sk, x, y, r, sd) => { const b = circ(x, y, r, { over: 0.1, seed: sd }); sk.fill(b, O2, { dx: 0, dy: 0, wob: 0.2, seed: sd + 1 }); sk.ink(b, { w: Math.max(3, r * 0.42), color: WATER_D, seed: sd + 2, wob: 0.2 }); };
// 잎에서 줄지어 오르는 기포: (x, y0)에서 y1까지
function bubbleTrail(sk, x, y0, y1, sd, gap = 30) {
  let i = 0;
  for (let y = y0; y > y1; y -= gap * (0.8 + 0.4 * hash(sd + i)), i++) bubble(sk, x + (hash(sd + i * 3.7) - 0.5) * 14, y, 5 + 3.5 * hash(sd + i * 1.9), sd + 10 + i * 3);
}
// 이산화 탄소: 회색 점
const co2dots = (sk, list, r = 6.5) => list.forEach(([x, y]) => sk.dot(x, y, r, CO2));
const co2arrow = (sk, pts, sd, o = {}) => arrow(sk, pts, { w: o.w ?? 7, color: CO2, seed: sd, head: o.head ?? 17, wob: 0.3, straight: o.straight });
const waterArrow = (sk, pts, sd, o = {}) => arrow(sk, pts, { w: o.w ?? 7, color: C.blue, seed: sd, head: o.head ?? 17, wob: 0.3, straight: o.straight });

/* ---------- 식물 ---------- */
function leaf(sk, x, y, len, ang, sd, col = LEAF, line = LEAF_D) {
  sk.at(x, y, 1, () => {
    const l = curve([[0, 0], [len * 0.35, -len * 0.25], [len * 0.8, -len * 0.14], [len, 0], [len * 0.8, len * 0.14], [len * 0.35, len * 0.25]], true, 3);
    sk.fill(l, col, { dx: 0, dy: 0, wob: 0.3, seed: sd }); sk.ink(l, { w: Math.max(3, len * 0.1), color: line, seed: sd + 1, wob: 0.3 });
    sk.ink(dense([[len * 0.12, 0], [len * 0.78, 0]]), { w: 2.5, color: line, seed: sd + 2, wob: 0.1 });
  }, ang);
}
// 잎이 마주난 가지. (x, y) = 밑동, h = 키. 잎 가운데 자리들을 돌려준다
function sprig(sk, x, y, h, sd, o = {}) {
  const n = o.pairs ?? 3, lean = o.lean ?? 0, len = o.len ?? h * 0.3, tips = [];
  sk.ink(curve([[x, y], [x + lean * 0.4, y - h * 0.5], [x + lean, y - h]]), { w: o.sw ?? 6, color: LEAF_D, seed: sd, wob: 0.3 });
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 0.4), px = x + lean * t, py = y - h * t, L = len * (1 - 0.18 * i / n);
    for (const sg of [-1, 1]) { leaf(sk, px, py, L, sg > 0 ? -0.45 : Math.PI + 0.45, sd + 10 + i * 6 + sg); tips.push([px + sg * L * 0.55, py - L * 0.36]); }
  }
  leaf(sk, x + lean, y - h + 4, len * 0.62, -Math.PI / 2, sd + 90); tips.push([x + lean, y - h - len * 0.5]);
  return tips;
}
// 버드나무: 줄기 + 늘어진 가지. (x, y) = 밑동. rot 로 눕힌다. u0~u1 = 가지가 퍼지는 쪽(-1 왼쪽 끝, 1 오른쪽 끝)
function willow(sk, x, y, h, o = {}) {
  const sd = o.seed ?? 1, tw = o.tw ?? Math.max(8, h * 0.045), n = o.strands ?? 9, spread = o.spread ?? h * 0.5, droop = o.droop ?? h * 0.62;
  const u0 = o.u0 ?? -1, u1 = o.u1 ?? 1, um = (u0 + u1) / 2;
  sk.at(x, y, 1, () => {
    if (o.roots) for (let i = 0; i < 6; i++) { const a = (i - 2.5) * 0.42; sk.ink(curve([[0, -6], [Math.sin(a) * o.roots * 0.55, o.roots * 0.5], [Math.sin(a) * o.roots * 1.1 + (i % 2 ? 9 : -9), o.roots * (0.8 + 0.25 * hash(sd + i))]]), { w: 6, color: "#8A6A3E", seed: sd + 80 + i, wob: 0.6 }); }
    const blob = curve([[u0 * spread - 18, -h + droop * 0.8], [u0 * spread * 0.98 - 6, -h + droop * 0.1], [u0 * spread * 0.6, -h - h * 0.1], [um * spread * 0.5, -h - h * 0.2], [u1 * spread * 0.6, -h - h * 0.1], [u1 * spread * 0.98 + 6, -h + droop * 0.1], [u1 * spread + 18, -h + droop * 0.8], [um * spread, -h + droop * 0.55]], true, 5);
    sk.fill(o.tiers ? blob.map(([px, py]) => [px * 0.92, py + h * 0.16]) : blob, "#DDF0CF", { dx: 0, dy: 0, wob: 1.2, seed: sd + 60 });
    for (let i = 0; i < n; i++) {
      const u = u0 + (u1 - u0) * (n === 1 ? 0.5 : i / (n - 1)), au = Math.abs(u);
      const sy = o.tiers ? -h * (0.9 - 0.34 * ((i * 5) % n) / n) : -h * 0.9, lift = o.tiers ? (sy + h * 0.9) * 0.8 : 0, sp = o.tiers ? spread * (0.62 + 0.38 * hash(sd + i * 7.1)) : spread;
      const peak = [u * sp * 0.55, -h - (1 - au) * h * 0.13 - h * 0.04 + lift], end = [u * sp + u * 10, -h + lift + droop * (0.62 + 0.38 * hash(sd + i * 3.3)) * (0.45 + 0.55 * au)];
      const p = curve([[0, sy], peak, [u * sp * 0.96, -h + lift + droop * 0.2 * (0.4 + 0.6 * au)], end]);
      sk.ink(p, { w: o.bw ?? 5, color: LEAF_D, seed: sd + i, wob: 0.5 });
      for (let k = Math.floor(p.length * 0.28), j = 0; k < p.length; k += 5, j++) { const q = p[k], sg = j % 2 ? 1 : -1; sk.ink(dense([q, [q[0] + sg * 11, q[1] + 10]]), { w: 5, color: LEAF, seed: sd + 100 + i * 20 + j, wob: 0.2 }); }
    }
    const trunk = poly([[-tw, 0], [-tw * 0.42, -h * 0.92], [tw * 0.42, -h * 0.92], [tw, 0]], 4);
    sk.fill(trunk, BARK, { seed: sd + 70, tex: true, texAng: 1.5 }); sk.ink(trunk, { w: 8, seed: sd + 71 });
  }, o.rot ?? 0);
}
// 처음 심은 가는 버드나무 줄기(잎 몇 장). (x, y) = 쥔 자리, 위로 up, 아래로 down
function cutting(sk, x, y, up, down, sd) {
  const st = curve([[x + 4, y + down], [x - 2, y], [x + 3, y - up * 0.5], [x - 2, y - up]]);
  sk.ink(st, { w: 21, seed: sd, wob: 0.4 }); sk.ink(st, { w: 13, color: BARK, seed: sd, wob: 0.4 });
  for (const [t, sg, i] of [[0.42, 1, 0], [0.56, -1, 1], [0.7, 1, 2], [0.82, -1, 3], [0.93, 1, 4], [1.0, -1, 5]]) leaf(sk, x + (sg > 0 ? 6 : -6), y - up * t, 36, sg > 0 ? -0.7 : Math.PI + 0.7, sd + 5 + i * 4);
}
// 둥근 큰 나무(오늘날의 학교 나무). (x, y) = 밑동
function bigTree(sk, x, y, sd) {
  thin(sk, 0.9, () => {
    for (const [dx, dy, i] of [[-70, 62, 0], [-24, 84, 1], [30, 80, 2], [78, 58, 3]]) sk.ink(curve([[x + dx * 0.2, y - 6], [x + dx * 0.6, y + dy * 0.5], [x + dx, y + dy]]), { w: 7, color: "#8A6A3E", seed: sd + 20 + i, wob: 0.6 });
    const trunk = poly([[x - 34, y], [x - 24, y - 230], [x + 24, y - 230], [x + 36, y]], 4);
    sk.fill(trunk, BARK, { seed: sd, tex: true, texAng: 1.5 }); sk.ink(trunk, { w: 10, seed: sd + 1 });
    const top = curve([[x - 50, y - 210], [x - 170, y - 220], [x - 214, y - 330], [x - 170, y - 440], [x - 60, y - 506], [x + 60, y - 512], [x + 170, y - 450], [x + 216, y - 336], [x + 172, y - 226], [x + 56, y - 208]], true, 5);
    sk.fill(top, "#7DBE6A", { seed: sd + 2, tex: true, texAng: 0.6 }); sk.ink(top, { w: 11, seed: sd + 3 });
    for (const [dx, dy, i] of [[-110, -300, 0], [-30, -400, 1], [70, -330, 2], [120, -420, 3], [-60, -270, 4]]) sk.ink(curve([[x + dx - 22, y + dy + 8], [x + dx, y + dy - 8], [x + dx + 22, y + dy + 8]]), { w: 5, color: LEAF_D, seed: sd + 30 + i, wob: 0.4 });
  });
}

/* ---------- 화분, 저울, 화덕 ---------- */
// 큰 질그릇 화분. (x, y) = 바닥 가운데. o.lid 면 구멍 뚫린 회색 덮개, 아니면 흙이 보인다. 윗면 높이를 돌려준다
function pot(sk, x, y, w, h, sd, o = {}) {
  const ty = y - h - 16;
  thin(sk, 0.85, () => {
    const b = poly([[x - w / 2 + 6, y - h], [x + w / 2 - 6, y - h], [x + w * 0.34, y], [x - w * 0.34, y]], 4);
    sk.fill(b, POT, { seed: sd, tex: true, texAng: 0.05 }); sk.ink(b, { w: 10, seed: sd + 1 });
    const rim = rrect(x - w / 2 - 8, y - h - 20, w + 16, 34, 12);
    sk.fill(rim, mix(POT, "#ffffff", 0.18), { seed: sd + 2, dx: 0.8, dy: 1 }); sk.ink(rim, { w: 9, seed: sd + 3 });
    const top = ell(x, ty, w / 2 + (o.lid ? 12 : 0), o.lid ? 17 : 14);
    sk.fill(top, o.lid ? "#B4BCC6" : SOIL, { dx: 0, dy: 0, wob: 0.4, seed: sd + 4 }); sk.ink(top, { w: o.lid ? 8 : 7, seed: sd + 5, wob: 0.5 });
    if (o.lid) for (let i = 0; i < 13; i++) { const a = i / 13 * Math.PI * 2 + 0.2, rr = i % 2 ? 0.74 : 0.42; sk.dot(x + Math.cos(a) * (w / 2) * rr, ty + Math.sin(a) * 11 * rr, 3.6, "#4A525E"); }
  });
  return ty;
}
// 자루(흙). (x, y) = 바닥 가운데
function sack(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const b = curve([[-42, 0], [-52, -38], [-36, -76], [-15, -88], [-22, -108], [22, -108], [15, -88], [36, -76], [52, -38], [42, 0]], true, 4);
    sk.fill(b, "#DCC59B", { seed: sd, tex: true, texAng: 0.9 }); sk.ink(b, { w: 8, seed: sd + 1 });
    sk.ink(dense([[-17, -88], [17, -88]]), { w: 5.5, color: "#8A5A33", seed: sd + 2, wob: 0.3 });
    const s2 = ell(0, -108, 20, 5); sk.fill(s2, SOIL, { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 });
  });
}
// 추(쇠). (x, y) = 바닥 가운데
function weights(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    for (const [dx, w, h, i] of [[-24, 26, 46, 0], [22, 22, 36, 1]]) {
      const b = poly([[dx - w, 0], [dx - w * 0.72, -h], [dx + w * 0.72, -h], [dx + w, 0]], 3);
      sk.fill(b, "#8A9099", { dx: 0.6, dy: 0.8, wob: 0.4, seed: sd + i }); sk.ink(b, { w: 7, seed: sd + 4 + i });
      sk.ink(ell(dx, -h - 7, 8, 7, Math.PI, Math.PI * 2), { w: 5.5, seed: sd + 8 + i, wob: 0.2 });
    }
  });
}
// 양팔 저울. (x, y) = 받침 가운데. tilt > 0 이면 오른쪽이 내려간다. 두 접시의 윗면 가운데를 돌려준다
function balance(sk, x, y, o = {}) {
  const h = o.h ?? 300, arm = o.arm ?? 70, dropL = o.drop ?? 120, pw = o.pw ?? 40, t = o.tilt ?? 0, sd = o.seed ?? 1, BR = "#C9A24A";
  const py = y - h, L = [x - arm * Math.cos(t), py - arm * Math.sin(t)], Rr = [x + arm * Math.cos(t), py + arm * Math.sin(t)];
  const out = {};
  thin(sk, 0.85, () => {
    const base = rrect(x - 46, y - 16, 92, 16, 6); sk.fill(base, "#8A5A33", { seed: sd, dx: 0.6, dy: 0.8 }); sk.ink(base, { w: 8, seed: sd + 1 });
    sk.ink(dense([[x, y - 16], [x, py - 6]]), { w: 10, color: "#6B4A32", seed: sd + 2, wob: 0.3 });
    for (const [e, k, i] of [[L, "L", 0], [Rr, "R", 1]]) {
      const cy = e[1] + dropL;
      for (const sg of [-1, 1]) sk.ink(dense([e, [e[0] + sg * pw, cy]]), { w: 3.5, color: "#5A5F68", seed: sd + 10 + i * 3 + sg, wob: 0.2 });
      const pan = curve([[e[0] - pw - 4, cy], [e[0] - pw * 0.6, cy + 15], [e[0] + pw * 0.6, cy + 15], [e[0] + pw + 4, cy]], false, 3);
      sk.fill([...pan, pan[0]], BR, { dx: 0, dy: 0, wob: 0.3, seed: sd + 20 + i }); sk.ink([...pan, pan[0]], { w: 6.5, seed: sd + 24 + i });
      out[k] = [e[0], cy];
    }
    sk.ink(dense([L, Rr]), { w: 15, seed: sd + 30, wob: 0.3 }); sk.ink(dense([L, Rr]), { w: 7, color: BR, seed: sd + 30, wob: 0.3 });
    const pv = circ(x, py, 10, { over: 0.1, seed: sd + 31 }); sk.fill(pv, BR, { dx: 0, dy: 0, wob: 0.2, seed: sd + 32 }); sk.ink(pv, { w: 6, seed: sd + 33 });
  });
  return out;
}
// 흙을 말리는 화덕(벽돌 반구, 입구에 불빛). (x, y) = 바닥 가운데
function oven(sk, x, y, w, h, sd) {
  thin(sk, 0.75, () => {
    const b = [...dense([[x - w / 2, y], [x - w / 2, y - h * 0.5]], 6), ...ell(x, y - h * 0.5, w / 2, h * 0.5, Math.PI, Math.PI * 2), ...dense([[x + w / 2, y - h * 0.5], [x + w / 2, y]], 6)];
    b.push(b[0]);
    sk.fill(b, "#E6CDAE", { seed: sd, tex: true, texAng: 0.1 }); sk.ink(b, { w: 10, seed: sd + 1 });
    const mw = w * 0.3, mh = h * 0.42;
    const m = [...dense([[x - mw, y - 26], [x - mw, y - 26 - mh * 0.5]], 6), ...ell(x, y - 26 - mh * 0.5, mw, mh * 0.5, Math.PI, Math.PI * 2), ...dense([[x + mw, y - 26 - mh * 0.5], [x + mw, y - 26]], 6)];
    m.push(m[0]);
    sk.fill(m, "#F6C777", { dx: 0, dy: 0, wob: 0.4, seed: sd + 2 });
    const fl = curve([[x - 8, y - 30], [x - 24, y - 60], [x - 8, y - 96], [x + 8, y - 70], [x + 20, y - 92], [x + 26, y - 56], [x + 14, y - 30]], true, 3);
    sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.4, seed: sd + 3 });
    sk.ink(m, { w: 9, seed: sd + 4 });
    for (const [bx, by, i] of [[-w * 0.36, -h * 0.34, 0], [-w * 0.2, -h * 0.72, 1], [w * 0.1, -h * 0.84, 2], [-w * 0.4, -h * 0.12, 3]]) sk.ink(dense([[x + bx, y + by], [x + bx + 30, y + by]]), { w: 5, color: "#B58E66", seed: sd + 6 + i, wob: 0.3 });
  });
}

/* ---------- 유리병과 물 그릇 ---------- */
// 거꾸로 세운 유리병의 윤곽. (x, yb) = 입구 가운데(아래), w 폭, h 높이
const jarPts = (x, yb, w, h) => { const ry = w * 0.42, yt = yb - h; return [...dense([[x - w / 2, yb], [x - w / 2, yt + ry]], 6), ...ell(x, yt + ry, w / 2, ry, Math.PI, Math.PI * 2), ...dense([[x + w / 2, yt + ry], [x + w / 2, yb]], 6)]; };
// 병 속 채움. o.water: 물을 채운 병, o.gas: 꼭대기에 모인 기체의 두께(없으면 물이 가득). 물 면 높이를 돌려준다
function jarFill(sk, x, yb, w, h, sd, o = {}) {
  const pts = jarPts(x, yb, w, h);
  sk.fill([...pts, pts[0]], o.water && !o.gas ? WATER : GLASS, { dx: 0, dy: 0, wob: 0.3, seed: sd });
  if (o.water && o.gas) {
    const yw = yb - h + w * 0.42 + o.gas;
    sk.fill(poly([[x - w / 2 + 2, yw], [x + w / 2 - 2, yw], [x + w / 2 - 2, yb], [x - w / 2 + 2, yb]], 4), WATER, { dx: 0, dy: 0, wob: 0.2, seed: sd + 1 });
    return yw;
  }
  return yb - h;
}
function jarLine(sk, x, yb, w, h, sd, o = {}) {
  thin(sk, 0.85, () => {
    if (o.yw) sk.ink(dense([[x - w / 2 + 6, o.yw], [x + w / 2 - 6, o.yw]]), { w: 4.5, color: WATER_D, seed: sd + 3, wob: 0.3 });
    sk.ink(curve([[x - w / 2 + 16, yb - h * 0.34], [x - w / 2 + 13, yb - h * 0.56], [x - w / 2 + 20, yb - h * 0.74]]), { w: 5, color: C.white, seed: sd + 2, wob: 0.2 });
    sk.ink(jarPts(x, yb, w, h), { w: 9, seed: sd });
    if (o.knob) { const k = circ(x, yb - h - 12, 14, { over: 0.15, seed: sd + 5 }); sk.fill(k, GLASS, { dx: 0, dy: 0, wob: 0.2, seed: sd + 6 }); sk.ink(k, { w: 7, seed: sd + 7 }); }
  });
}
// 넓은 물 그릇(병의 아랫부분을 덮으며 맨 나중에 그린다). (x, y) = 바닥 가운데
function trough(sk, x, y, w, h, sd, o = {}) {
  thin(sk, 0.85, () => {
    const water = poly([[x - w / 2 + 6, y - h + 14], [x + w / 2 - 6, y - h + 14], [x + w / 2 - 16, y - 5], [x - w / 2 + 16, y - 5]], 4);
    sk.fill(water, o.water ?? "#A9D8F2", { dx: 0, dy: 0, wob: 0.3, seed: sd, alpha: 0.82 });
    sk.ink(dense([[x - w / 2 + 8, y - h + 14], [x + w / 2 - 8, y - h + 14]]), { w: 4.5, color: WATER_D, seed: sd + 1, wob: 0.4 });
    sk.ink(curve([[x - w / 2, y - h], [x - w / 2 + 8, y - 10], [x - w / 2 + 26, y], [x + w / 2 - 26, y], [x + w / 2 - 8, y - 10], [x + w / 2, y - h]], false, 4), { w: 9, seed: sd + 2 });
  });
}
// 철사 끝에 얹어 병 속에 넣은 초. xo = 철사가 병 밖으로 나온 자리, (x, yc) = 초 받침, yu = 철사가 병 입구를 지나는 높이
function wireCandle(sk, xo, x, yu, yc, lit, sd) {
  sk.ink(dense([[xo, yu - 58], [xo, yu], [x, yu], [x, yc]], 6), { w: 5, color: METAL, seed: sd, wob: 0.3 });
  sk.ink(circ(xo, yu - 66, 8, { over: 0.1, seed: sd + 1 }), { w: 4.5, color: METAL, seed: sd + 1, wob: 0.2 });
  sk.ink(dense([[x - 17, yc], [x + 17, yc]]), { w: 7, color: METAL, seed: sd + 2, wob: 0.2 });
  const c = rrect(x - 11, yc - 62, 22, 60, 5); sk.fill(c, "#FBF6E6", { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 }); sk.ink(c, { w: 6, seed: sd + 4 });
  sk.ink(dense([[x, yc - 62], [x, yc - 74]]), { w: 4, seed: sd + 5, wob: 0 });
  if (lit) {
    const fl = curve([[x, yc - 70], [x - 13, yc - 90], [x, yc - 126], [x + 13, yc - 90]], true, 3); sk.fill(fl, C.orange, { dx: 0, dy: 0, wob: 0.3, seed: sd + 6 }); sk.ink(fl, { w: 5, color: C.red, seed: sd + 7, wob: 0.3 });
    sk.fill(curve([[x, yc - 76], [x - 6, yc - 88], [x, yc - 104], [x + 6, yc - 88]], true, 3), C.yellow, { dx: 0, dy: 0, wob: 0.2, seed: sd + 8 });
  } else for (const [dx, i] of [[-5, 0], [7, 1]]) sk.ink(squiggle(x + dx, yc - 80, 62 + i * 14, 7, 2, i * 1.5), { w: 4.5, color: C.gray, wob: 0, seed: sd + 9 + i });
}
function table(sk, x0, x1, y, sd, bottom = 704) {
  thin(sk, 0.85, () => {
    for (const lx of [x0 + 26, x1 - 26]) sk.ink(dense([[lx, y + 20], [lx, bottom]]), { w: 11, color: "#6B4A32", seed: sd + lx, wob: 0.3 });
    const top = rrect(x0, y, x1 - x0, 24, 8); sk.fill(top, C.wood, { seed: sd, tex: true, texAng: 0.02 }); sk.ink(top, { w: 10, seed: sd + 1 });
  });
}

/* ---------- 1. 반 헬몬트: 흙을 먹고 자랄까 ---------- */
function p1() {
  const sk = new Sk(W, H, { id: "a" });
  oven(sk, 912, 704, 210, 330, 11);
  ground(sk, 704, 13);
  // 큰 질그릇 화분과 바싹 말린 흙
  pot(sk, 448, 704, 196, 196, 21);
  // 저울: 흙 자루와 추
  const b = balance(sk, 706, 704, { h: 330, arm: 72, drop: 126, pw: 40, seed: 31 });
  sack(sk, b.L[0], b.L[1] + 4, 0.62, 41);
  weights(sk, b.R[0], b.R[1] + 4, 0.72, 45);
  qmark(sk, 448, 370, 0.8, { color: C.teal, seed: 49 });
  // 반 헬몬트: 가는 버드나무 줄기를 들어 보인다
  const P = pose({ elR: [104, -312], haR: [156, -396], elL: [-50, -262], haL: [-34, -212], tilt: 0.05 });
  const fx = 178, fy = 704, fs = 0.68;
  person(sk, fx, fy, fs, P, HELMONT, { name: "helmont", face: "curious", hands: "L" });
  const hx = fx + fs * 156, hy = fy - fs * 396;
  cutting(sk, hx, hy, 196, 96, 51);
  handDot(sk, [hx, hy], C.skin, 61, 10);
  return sk;
}

/* ---------- 2. 빗물만 주며 5년 ---------- */
// 손잡이 달린 물동이. (x, y) = 손잡이(쥔 자리), 몸통은 오른쪽. 주둥이는 (106, -60)
function pitcher(sk, x, y, s, rot, sd) {
  sk.at(x, y, s, () => {
    sk.ink(curve([[12, -34], [-6, -20], [-6, 14], [12, 28]]), { w: 9, seed: sd });
    const b = curve([[14, -54], [6, -10], [14, 40], [34, 54], [70, 54], [90, 40], [98, -10], [90, -54]], false, 3);
    sk.fill([...b, b[0]], "#B98A5E", { seed: sd + 1, tex: true }); sk.ink([...b, b[0]], { w: 8, seed: sd + 2 });
    const lip = poly([[84, -56], [110, -66], [100, -46]], 3); sk.fill(lip, "#B98A5E", { dx: 0, dy: 0, wob: 0.3, seed: sd + 3 }); sk.ink(lip, { w: 6, seed: sd + 4 });
  }, rot);
}
function p2() {
  const sk = new Sk(W, H, { id: "b" });
  ground(sk, 704, 71);
  // 화분: 구멍 뚫린 덮개 가운데로 줄기만 나온다
  const px = 560, ty = pot(sk, px, 704, 204, 186, 81, { lid: true });
  willow(sk, px, ty + 2, 330, { seed: 91, spread: 176, droop: 230, strands: 13, tw: 13, tiers: true });
  // 네 번의 가을 동안 떨어진 잎: 무게에 넣지 않았다
  const LY = "#E9C24A", LYD = "#A8801E";
  for (const [x, y, a, i] of [[772, 696, 0.2, 0], [806, 690, -0.5, 1], [836, 698, 0.6, 2], [868, 694, -0.2, 3], [790, 676, 0.9, 4], [826, 670, -0.9, 5], [856, 676, 0.3, 6], [812, 656, 0.1, 7], [900, 698, -0.7, 8], [744, 700, -0.3, 9]]) leaf(sk, x, y, 34, a, 101 + i * 4, LY, LYD);
  for (const [x, y, a, i] of [[716, 470, 0.9, 0], [752, 560, 0.4, 1]]) leaf(sk, x, y, 28, a, 151 + i * 4, LY, LYD);
  arrow(sk, ell(840, 560, 44, 44, -1.1, 3.9), { w: 7, color: C.gray, seed: 161, head: 17, wob: 0.3 });
  // 반 헬몬트: 물동이를 기울여 물을 준다
  const P = pose({ elR: [118, -322], haR: [182, -462], elL: [-50, -262], haL: [-34, -212], tilt: 0.05 });
  const fx = 176, fy = 704, fs = 0.68;
  person(sk, fx, fy, fs, P, HELMONT, { name: "helmont", hands: "L" });
  const hx = fx + fs * 182, hy = fy - fs * 462;
  const rot = 0.85, ps = 0.72, sx = hx + ps * (106 * Math.cos(rot) + 60 * Math.sin(rot)), sy = hy + ps * (106 * Math.sin(rot) - 60 * Math.cos(rot));
  const stream = curve([[sx - 4, sy - 2], [sx + 30, sy + 14], [px - 86, ty - 46], [px - 74, ty - 4]]);
  sk.ink(stream, { w: 9, color: WATER_D, seed: 171, wob: 0.4 });
  pitcher(sk, hx, hy, ps, rot, 173);
  handDot(sk, [hx, hy], C.skin, 181, 10);
  for (const [dx, dy, i] of [[-96, -20, 0], [-52, -30, 1]]) sk.ink(dense([[px + dx, ty + dy], [px + dx - 8, ty + dy - 14]]), { w: 4.5, color: WATER_D, seed: 183 + i, wob: 0.2 });
  return sk;
}

/* ---------- 3. 흙은 거의 그대로 ---------- */
// 뿌리째 뽑아 눕힌 큰 버드나무: 왼쪽에 뿌리, 굵은 줄기, 줄기 방향을 따라 오른쪽으로 길게 누운 가지(잔가지는 땅 쪽으로 처진다)
function fallenWillow(sk, sd) {
  const bx = 72, tx = 314, ty = 636;
  for (let i = 0; i < 8; i++) { const a = Math.PI + (i - 3.5) * 0.27; sk.ink(curve([[bx + 8, 640], [bx + 44 * Math.cos(a), 640 + 50 * Math.sin(a)], [bx + 84 * Math.cos(a) + (i % 2 ? 4 : -4), 640 + 96 * Math.sin(a) * 0.9 + (i % 2 ? 8 : -6)]]), { w: 7, color: "#8A6A3E", seed: sd + 80 + i, wob: 0.6 }); }
  const blob = curve([[tx - 30, ty - 30], [tx + 40, ty - 150], [tx + 150, ty - 196], [tx + 250, ty - 150], [tx + 284, ty - 40], [tx + 282, 700], [tx + 120, 702], [tx - 24, 696]], true, 5);
  sk.fill(blob, "#DDF0CF", { dx: 0, dy: 0, wob: 1.2, seed: sd + 60 });
  // 굵은 가지 다섯: 줄기 끝에서 오른쪽으로 부채처럼
  const boughs = [[[tx + 80, ty - 110], [tx + 170, ty - 168]], [[tx + 110, ty - 70], [tx + 236, ty - 116]], [[tx + 130, ty - 22], [tx + 266, ty - 44]], [[tx + 126, ty + 18], [tx + 262, ty + 22]], [[tx + 96, ty + 44], [tx + 210, ty + 56]]];
  boughs.forEach(([m, e], i) => {
    const p = curve([[tx - 10, ty], m, e]);
    sk.ink(p, { w: 15, seed: sd + i, wob: 0.5 }); sk.ink(p, { w: 8, color: BARK, seed: sd + i, wob: 0.5 });
    // 잔가지: 가지에서 땅 쪽으로 처진다
    for (let k = Math.floor(p.length * 0.25), j = 0; k < p.length; k += 6, j++) {
      const q = p[k], len = Math.min(698 - q[1], 46 + 40 * hash(sd + i * 9 + j));
      if (len < 14) continue;
      const tw = curve([q, [q[0] + 8, q[1] + len * 0.5], [q[0] + 4, q[1] + len]]);
      sk.ink(tw, { w: 5, color: LEAF_D, seed: sd + 200 + i * 20 + j, wob: 0.4 });
      for (let t = 3, c = 0; t < tw.length; t += 4, c++) { const r = tw[t], sg = c % 2 ? 1 : -1; sk.ink(dense([r, [r[0] + sg * 11, r[1] + 9]]), { w: 5, color: LEAF, seed: sd + 300 + i * 40 + j * 5 + c, wob: 0.2 }); }
    }
  });
  thin(sk, 0.9, () => {
    const trunk = poly([[bx, 596], [tx, ty - 20], [tx, ty + 20], [bx, 686]], 4);
    sk.fill(trunk, BARK, { seed: sd + 70, tex: true, texAng: 0.05 }); sk.ink(trunk, { w: 10, seed: sd + 71 });
  });
}
function p3() {
  const sk = new Sk(W, H, { id: "c" });
  ground(sk, 704, 201);
  // 뿌리째 뽑아 눕힌 버드나무: 처음의 가는 줄기와 견줄 수 없이 크다
  fallenWillow(sk, 211);
  // 다시 말린 흙: 처음과 같은 추에 거의 수평
  const b = balance(sk, 708, 704, { h: 300, arm: 60, drop: 126, pw: 34, tilt: 0.07, seed: 231 });
  sack(sk, b.L[0], b.L[1] + 4, 0.56, 241);
  weights(sk, b.R[0], b.R[1] + 4, 0.64, 245);
  // 반 헬몬트
  const P = pose({ elL: [-46, -262], haL: [-40, -200], elR: [50, -262], haR: [40, -206], tilt: -0.05 });
  person(sk, 870, 704, 0.66, P, HELMONT, { name: "helmont", face: "wide" });
  return sk;
}

/* ---------- 4. 1771년, 프리스틀리: 꺼진 촛불의 공기 ---------- */
function p4() {
  const sk = new Sk(W, H, { id: "d" });
  ground(sk, 704, 301);
  table(sk, 40, 650, 572, 303);
  const yb = 564, jw = 156, jh = 318;
  // 왼쪽: 식물 없이 둔 공기. 새 초가 꺼진다
  jarFill(sk, 190, yb, jw, jh, 311);
  wireCandle(sk, 296, 190, yb - 6, yb - 110, false, 321);
  jarLine(sk, 190, yb, jw, jh, 313);
  trough(sk, 190, 572, 236, 58, 331);
  xmark(sk, 78, 300, 0.56, { seed: 335 });
  // 오른쪽: 박하 가지를 넣어 둔 공기. 새 초가 탄다
  jarFill(sk, 478, yb, jw, jh, 341);
  sprig(sk, 456, yb - 8, 216, 351, { pairs: 4, len: 38, lean: -4 });
  wireCandle(sk, 584, 524, yb - 6, yb - 110, true, 361);
  jarLine(sk, 478, yb, jw, jh, 343);
  trough(sk, 478, 572, 236, 58, 371);
  check(sk, 362, 302, 0.62);
  // 프리스틀리
  const P = pose({ elL: [-100, -306], haL: [-182, -338], elR: [52, -262], haR: [34, -214], tilt: -0.05 });
  person(sk, 816, 704, 0.68, P, PRIESTLEY, { name: "priestley", face: "happy" });
  return sk;
}

/* ---------- 5. 1779년, 잉엔하우스: 햇빛 속의 기포 ---------- */
// 물을 채워 거꾸로 세운 병과 그 속의 잎. bub: 기포가 오르는가, gas: 꼭대기에 모인 기체 두께
function leafJar(sk, x, ty, sd, o = {}) {
  const jw = o.jw ?? 160, jh = o.jh ?? 330, tw = o.tw ?? 244, yb = ty - 8;
  const yw = jarFill(sk, x, yb, jw, jh, sd, { water: true, gas: o.bub ? (o.gas ?? 34) : 0 });
  if (o.dots) co2dots(sk, o.dots.map(([dx, dy]) => [x + dx, yb + dy]), o.dotR ?? 6);
  const tips = sprig(sk, x + (o.sx ?? 0), yb - 10, jh * 0.6, sd + 10, { pairs: 3, len: jw * 0.34, lean: o.lean ?? 6 });
  if (o.bub) {
    tips.forEach(([bx, by], i) => { if (i % (o.every ?? 1) === 0) bubbleTrail(sk, bx, by - 6, yw + 12, sd + 40 + i * 9, o.gap ?? 34); });
    for (const [dx, i] of [[-jw * 0.26, 0], [0, 1], [jw * 0.24, 2]]) bubble(sk, x + dx, yw + 9, 6.5, sd + 90 + i * 3);
  }
  jarLine(sk, x, yb, jw, jh, sd + 3, { yw: o.bub ? yw : 0 });
  trough(sk, x, ty, tw, 58, sd + 20);
  return { yb, yw, top: yb - jh };
}
function p5() {
  const sk = new Sk(W, H, { id: "e" });
  // 담장과 그 그늘
  const shade = poly([[452, 168], [716, 200], [716, 704], [452, 704]], 6);
  sk.fill(shade, "#E3E6EB", { dx: 0, dy: 0, wob: 0.6, seed: 401 });
  thin(sk, 0.8, () => {
    const wall = poly([[398, 160], [452, 160], [452, 704], [398, 704]], 4);
    sk.fill(wall, "#D9B89A", { seed: 403, tex: true, texAng: 1.5 }); sk.ink(wall, { w: 10, seed: 404 });
    for (let y = 214, i = 0; y < 690; y += 54, i++) { sk.ink(dense([[400, y], [450, y]]), { w: 4.5, color: "#A9805C", seed: 405 + i, wob: 0.3 }); sk.ink(dense([[i % 2 ? 414 : 436, y], [i % 2 ? 414 : 436, y + 54]]), { w: 4.5, color: "#A9805C", seed: 425 + i, wob: 0.3 }); }
  });
  ground(sk, 704, 441);
  sun(sk, 92, 96, 44, { seed: 443 });
  // 햇빛 속의 병: 잎에서 기포가 올라 꼭대기에 모인다
  leafJar(sk, 244, 704, 451, { bub: true });
  ray(sk, [150, 132], [196, 316], 461);
  ray(sk, [168, 106], [284, 318], 463);
  ray(sk, [176, 80], [386, 182], 465);
  // 그늘 속의 병: 같은 잎인데 기포가 없다
  leafJar(sk, 584, 704, 471, { bub: false });
  // 잉엔하우스
  const P = pose({ elL: [-100, -316], haL: [-178, -356], elR: [52, -262], haR: [34, -214], tilt: -0.05 });
  person(sk, 836, 704, 0.66, P, INGEN, { name: "ingen", face: "wide" });
  return sk;
}

/* ---------- 6. 1782년, 세네비에: 물에 녹은 기체 ---------- */
// 이산화 탄소를 녹인 물이 든 병. (x, y) = 바닥 가운데
function gasBottle(sk, x, y, s, sd) {
  sk.at(x, y, s, () => {
    const b = curve([[-40, 0], [-46, -40], [-46, -104], [-30, -132], [-15, -148], [-15, -182], [15, -182], [15, -148], [30, -132], [46, -104], [46, -40], [40, 0]], false, 4);
    sk.fill([...b, b[0]], GLASS, { dx: 0, dy: 0, wob: 0.3, seed: sd });
    sk.fill(poly([[-43, -100], [43, -100], [43, -8], [-43, -8]], 4), WATER, { dx: 0, dy: 0, wob: 0.3, seed: sd + 1 });
    for (const [dx, dy] of [[-22, -80], [10, -66], [26, -38], [-12, -42], [-28, -20], [8, -18], [24, -86]]) sk.dot(dx, dy, 7, CO2);
    sk.ink([...b, b[0]], { w: 8, seed: sd + 2 });
  });
}
function p6() {
  const sk = new Sk(W, H, { id: "f" });
  ground(sk, 704, 501);
  table(sk, 24, 700, 584, 503);
  sun(sk, 86, 92, 42, { seed: 505 });
  // 작은 대조: 끓여서 녹아 있던 기체를 뺀 물. 햇빛을 받아도 기포가 없다
  kettle(sk, 74, 584, 0.5, { seed: 511, lift: 8 });
  for (const [x, i] of [[120, 0], [134, 1]]) sk.ink(squiggle(x, 512, 44, 5, 2, i * 1.5), { w: 4, color: C.gray, wob: 0, seed: 515 + i });
  leafJar(sk, 216, 584, 521, { bub: false, jw: 104, jh: 214, tw: 164 });
  ray(sk, [132, 136], [182, 340], 531, { w: 6, head: 15 });
  // 가운데: 이산화 탄소를 녹인 물. 기포가 많이 오른다
  const J = leafJar(sk, 438, 584, 541, { bub: true, jw: 176, jh: 380, tw: 264, gas: 44, gap: 26, dots: [[-66, -40], [-48, -120], [-70, -196], [60, -60], [70, -150], [52, -216], [-30, -26], [26, -30], [-62, -236], [68, -240]] });
  co2dots(sk, [[332, 566], [544, 566]], 6);
  ray(sk, [152, 108], [342, 300], 551);
  ray(sk, [160, 80], [362, 214], 553);
  for (const [a, b, i] of [[[374, 420], [404, 404], 0], [[502, 404], [474, 380], 1]]) co2arrow(sk, [a, b], 561 + i, { w: 5.5, head: 12, straight: true });
  // 이산화 탄소를 녹인 물병에서 그릇으로
  gasBottle(sk, 652, 584, 0.8, 571);
  co2arrow(sk, [[636, 424], [590, 440], [560, 520]], 581, { w: 7 });
  // 세네비에
  const P = pose({ elL: [-100, -310], haL: [-176, -330], elR: [52, -262], haR: [34, -214], tilt: -0.05 });
  person(sk, 838, 704, 0.66, P, SENEBIER, { name: "senebier", face: "happy" });
  return sk;
}

/* ---------- 7. 1804년, 소쉬르: 물도 몸이 됐어요 ---------- */
function p7() {
  const sk = new Sk(W, H, { id: "g" });
  ground(sk, 704, 601);
  table(sk, 40, 660, 584, 603);
  // 유리 덮개 속의 화분 식물
  const x = 232, yb = 582, jw = 236, jh = 336;
  jarFill(sk, x, yb, jw, jh, 611);
  const ty = pot(sk, x, yb - 4, 104, 74, 621);
  // 흙에서 줄기를 따라 오르는 물(파랑)
  const tips = sprig(sk, x, ty, 176, 631, { pairs: 3, len: 58, sw: 7 });
  for (const [dx, i] of [[-30, 0], [32, 1]]) drop(sk, x + dx, ty - 1, 0.42, { seed: 641 + i, color: "#9FD0F2", w: 6 });
  waterArrow(sk, [[x + 16, ty - 8], [x + 17, ty - 110]], 651, { straight: true, w: 6.5, head: 15 });
  // 덮개 속 공기의 이산화 탄소(회색 점)에서 잎으로
  co2dots(sk, [[x - 84, yb - 252], [x - 62, yb - 286], [x - 92, yb - 300], [x + 74, yb - 268], [x + 88, yb - 232], [x + 58, yb - 300], [x - 96, yb - 196], [x + 96, yb - 180]], 7);
  co2arrow(sk, [[x - 78, yb - 232], [x - 62, yb - 196], [x - 42, yb - 172]], 661, { w: 6.5, head: 15 });
  co2arrow(sk, [[x + 78, yb - 212], [x + 66, yb - 186], [x + 46, yb - 164]], 663, { w: 6.5, head: 15 });
  jarLine(sk, x, yb, jw, jh, 613, { knob: true });
  // 앞뒤로 무게를 다는 저울
  const b = balance(sk, 530, 584, { h: 236, arm: 62, drop: 104, pw: 36, seed: 671 });
  weights(sk, b.R[0], b.R[1] + 4, 0.56, 681);
  sprig(sk, b.L[0] - 4, b.L[1] + 6, 62, 685, { pairs: 2, len: 24, sw: 4, lean: 10 });
  // 소쉬르: 공책에 적는다
  const P = pose({ elL: [-84, -292], haL: [-138, -336], elR: [52, -262], haR: [34, -214], tilt: -0.05 });
  const fx = 822, fy = 704, fs = 0.66;
  person(sk, fx, fy, fs, P, SAUSSURE, { name: "saussure", face: "smile", hands: "R" });
  const hx = fx - fs * 138, hy = fy - fs * 336;
  notebook(sk, hx - 22, hy - 8, 0.86, { seed: 691, rot: -0.12 });
  handDot(sk, [hx, hy + 6], C.skin, 695, 10);
  return sk;
}

/* ---------- 8. 오늘날: 빛으로 짓는 양분 ---------- */
function p8() {
  const sk = new Sk(W, H, { id: "h" });
  const gy = 612;
  // 땅속(밝은 흙)
  const land = [...curve([[-12, gy + 2], [300, gy - 2], [640, gy + 2], [972, gy - 2]], false, 6), [972, 732], [-12, 732]]; land.push(land[0]);
  sk.fill(land, "#F1E3C8", { dx: 0, dy: 0, wob: 0, seed: 701, tex: 0.6, texAng: 0.04 });
  const tx = 668;
  bigTree(sk, tx, gy, 711);
  sk.ink(curve([[14, gy + 3], [300, gy - 2], [tx - 40, gy + 1]]), { w: 9, seed: 703 });
  sk.ink(curve([[tx + 40, gy + 1], [820, gy + 2], [946, gy - 2]]), { w: 9, seed: 704 });
  // 물: 뿌리에서 줄기를 따라 잎으로(파랑)
  for (const [dx, dy, i] of [[-96, 56, 0], [-40, 84, 1], [52, 86, 2], [106, 52, 3]]) drop(sk, tx + dx, gy + dy, 0.62, { seed: 721 + i, color: "#9FD0F2" });
  waterArrow(sk, [[tx, gy + 44], [tx, gy - 244]], 731, { straight: true, w: 8, head: 20 });
  // 빛: 해에서 잎으로(주황 물결)
  sun(sk, 402, 84, 40, { seed: 741 });
  ray(sk, [462, 112], [540, 190], 743);
  ray(sk, [476, 78], [600, 112], 745);
  // 이산화 탄소: 공기에서 잎으로(회색)
  co2dots(sk, [[878, 480], [906, 452], [918, 500], [890, 524], [936, 474], [858, 512]], 7.5);
  co2arrow(sk, [[872, 462], [848, 420], [816, 382]], 751, { w: 8, head: 19 });
  // 산소: 잎에서 공기로(하늘색 기포)
  arrow(sk, [[848, 222], [886, 180], [930, 150]], { w: 8, color: "#6EC5E9", seed: 759, head: 19, wob: 0.3 });
  for (const [x, y, r, i] of [[884, 228, 8, 0], [912, 202, 10, 1], [936, 184, 7, 2], [872, 150, 8, 3], [906, 122, 10, 4]]) bubble(sk, x, y, r, 761 + i * 3);
  // 쌤과 학생
  const tp = pose({ elR: [92, -306], haR: [150, -342], elL: [-50, -260], haL: [-30, -214], tilt: 0.05 });
  drawFigure(sk, 366, gy, 0.6, tp, { ...TEACHER, name: "teacher" });
  const sp = pose({ elL: [-136, -316], haL: [-196, -398], elR: [136, -316], haR: [196, -398], tilt: 0.03 });
  drawFigure(sk, 186, gy, 0.58, sp, { ...STUDENT, name: "student", mirror: true });
  return sk;
}

export const META = {
  title: "나무의 몸은<br><em>어디서</em> 왔을까",
  lead: "버드나무 화분 하나에서 시작해, 과학자 다섯 명이 150년 넘게 이어 간 실험을 따라가요.",
  narrator: "동물은 먹이를 먹고 자라요. 그런데 식물은 아무것도 먹지 않는 것 같은데 어떻게 커질까요? 저울과 유리병으로 <b>나무의 몸이 어디서 왔는지</b> 찾아간 과학자들을 만나 봐요.",
  cta: "개념으로 정리하기",
};

const CUTS = [
  {
    fn: p1, when: "1600년대 전반, 브뤼셀 근처", stage: "궁금증", title: "흙을 먹고 자랄까",
    caption: "1600년대 전반, 브뤼셀 근처에 살던 의사 <b>반 헬몬트</b>는 나무가 흙을 먹고 자라는지 궁금했어요. 그는 화덕에 바싹 말린 흙을 저울에 달아 큰 질그릇 화분에 담았어요. 그리고 가는 버드나무 줄기도 무게를 달아 그 화분에 심었어요.",
  },
  {
    fn: p2, when: "1600년대 전반, 브뤼셀 근처", stage: "실험", title: "빗물만 주며 5년",
    caption: "반 헬몬트는 5년 동안 화분에 빗물이나 증류수만 주었어요. 바람에 날린 먼지가 흙에 섞이지 않도록 <b>구멍을 여럿 뚫은 쇠판</b>으로 화분을 덮었지요. 네 번의 가을 동안 떨어진 잎은 무게에 넣지 않았어요.",
  },
  {
    fn: p3, when: "1600년대 전반, 브뤼셀 근처", stage: "놀라운 결과", title: "흙은 거의 그대로",
    caption: "5년 뒤 버드나무는 처음보다 30배 넘게 무거워졌어요. 늘어난 무게만 70 kg이 넘었지요. 그런데 흙을 다시 말려 저울에 달아 보니 겨우 60 g쯤 줄어 있었어요. 반 헬몬트는 나무의 몸이 흙이 아니라 <b>물</b>에서 생겨났다고 적었어요.",
    bubbles: [{ who: "helmont", text: "물에서<br>생겨났어!" }],
  },
  {
    fn: p4, when: "1771년, 영국 리즈", stage: "새 실마리", title: "꺼진 촛불의 공기",
    caption: "1771년 여름, 영국의 목사 <b>프리스틀리</b>는 초가 타다 꺼진 공기에 박하 가지를 넣어 두었어요. 열흘 뒤 그 공기에 새 초를 넣자 초가 잘 탔어요. 식물을 넣지 않고 둔 공기에서는 새 초가 여전히 꺼졌지요. 자라는 식물이 <b>공기를 바꾼</b> 거예요.",
    bubbles: [{ who: "priestley", text: "다시<br>타네!" }],
  },
  {
    fn: p5, when: "1779년, 런던 근처", whenPos: "tr", stage: "빛의 조건", title: "햇빛 속의 기포",
    caption: "프리스틀리의 실험은 될 때도 있고 안 될 때도 있었어요. 1779년 여름, 의사 <b>잉엔하우스</b>가 그 까닭을 찾았어요. 물속에 넣은 잎을 <b>햇빛</b>에 두면 기포가 올라와 병 꼭대기에 모이고, 담장 그늘에서는 기포가 멎었어요. 기포는 잎과 초록 줄기에서만 나왔고, 오늘날 산소라고 부르는 기체였어요.",
    bubbles: [{ who: "ingen", text: "햇빛에서만<br>나오네!" }],
  },
  {
    fn: p6, when: "1782년, 제네바", whenPos: "tr", stage: "재료 찾기", title: "물에 녹은 기체",
    caption: "1782년, 제네바의 <b>세네비에</b>는 잎을 담그는 물을 바꿔 보았어요. 오늘날 <b>이산화 탄소</b>라고 부르는 기체를 녹인 물에서는 잎이 보통 물보다 기포를 더 많이 냈어요. 끓여서 녹아 있던 기체를 뺀 물에서는 햇빛을 받아도 기포가 나오지 않았지요. 오늘날 보면, 공기 속의 이 기체도 식물의 재료예요.",
    bubbles: [{ who: "senebier", text: "이 기체가<br>있어야 해!" }],
  },
  {
    fn: p7, when: "1804년, 제네바", stage: "마지막 조각", title: "물도 몸이 됐어요",
    caption: "1804년, 제네바의 <b>소쉬르</b>는 유리 덮개 속에서 식물을 기르며 식물과 이산화 탄소의 무게를 실험 전과 후에 쟀어요. 식물의 늘어난 무게는 공기에서 받아들인 것보다 더 컸어요. 모자란 만큼은 뿌리로 빨아올린 <b>물</b>이 식물의 몸이 되어 채운 거예요. 반 헬몬트의 생각은 절반이 맞았어요.",
    bubbles: [{ who: "saussure", text: "물도 몸이<br>됐구나!" }],
  },
  {
    fn: p8, stage: "오늘날", title: "빛으로 짓는 양분",
    caption: "식물은 잎의 초록 부분에서 <b>빛</b>을 받아, 공기 속 <b>이산화 탄소</b>와 뿌리로 빨아올린 <b>물</b>로 양분을 스스로 만들고 <b>산소</b>를 내놓아요. 이 과정을 광합성이라고 해요. 버드나무가 흙을 거의 쓰지 않고도 무거워진 까닭이에요.",
    term: { name: "광합성", def: "식물이 빛에너지를 이용하여 스스로 양분을 만드는 과정이에요." },
    bubbles: [{ who: "student", text: "공기도<br>재료였어!" }],
  },
];

export function panels() {
  return CUTS.map(c => ({ sk: c.fn(), bubbles: c.bubbles, when: c.when, whenPos: c.whenPos, stage: c.stage, title: c.title, caption: c.caption, term: c.term }));
}
