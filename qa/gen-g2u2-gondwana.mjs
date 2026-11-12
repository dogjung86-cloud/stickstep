// 8레슨 빙하의 흔적 랩이 쓰는 실제 대륙 윤곽을 뽑는다(1회 실행, 산출물 커밋).
//   입력: src/ui/worldMap.generated.ts 의 WORLD_LAND_PATH(Natural Earth 110m 육지, 퍼블릭 도메인. 정거 원통 좌표)
//   출력: src/lessons/steps/g2u2v5/gondwanaData.ts(대륙마다 경도와 위도의 윤곽, 남극에 붙이는 회전)
// 대륙을 떼어 내는 법: 이어진 땅(아프리카와 유라시아, 남북 아메리카)은 영역 안에 든 해안선 구간만 잘라 곧은 선으로 닫는다.
// 회전(곤드와나 맞춤, 남극 고정): Lawver & Scotese(1987)의 맞춤 극을 썼다. 눈으로 맞물림을 확인했다(qa/shots 의 그림).
//   실행: node qa/gen-g2u2-gondwana.mjs [미리보기 png]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(ROOT, "src/ui/worldMap.generated.ts"), "utf8");
const d = src.match(/WORLD_LAND_PATH =\s*"([^"]+)"/)[1];
const rings = d.split("Z").map((r) => r.replace(/^M/, "").split("L").map((p) => p.trim().split(" ").map(Number)).filter((p) => p.length === 2 && !Number.isNaN(p[0])).map(([x, y]) => [(x / 1000) * 360 - 180, 90 - (y / 500) * 180])).filter((r) => r.length > 3);

const inPoly = (lon, lat, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const ringWith = (lon, lat) => rings.filter((r) => inPoly(lon, lat, r)).sort((a, b) => b.length - a.length)[0];
/** 고리에서 영역 안에 든 가장 긴 이어진 구간. */
function cut(ring, inside) {
  const n = ring.length;
  const flags = ring.map(([lon, lat]) => inside(lon, lat));
  let best = [], start = flags.findIndex((f) => !f);
  if (start < 0) return ring;
  let cur = [];
  for (let k = 1; k <= n; k++) {
    const i = (start + k) % n;
    if (flags[i]) cur.push(ring[i]);
    else { if (cur.length > best.length) best = cur; cur = []; }
  }
  if (cur.length > best.length) best = cur;
  return best;
}
/** 더글러스 포이커 간추리기(도 단위). */
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let idx = -1, max = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    const dist = Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
    if (dist > max) { max = dist; idx = i; }
  }
  if (max <= tol) return [a, b];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}

const afroEurasia = ringWith(20, 0), americas = ringWith(-60, -10);
const africaBox = [[-20, 38], [11, 38.5], [32.4, 31.6], [34.2, 28], [43.4, 12.3], [52, 12.3], [52, -36], [-20, -36]];
const outlines = {
  sa: cut(americas, (lon, lat) => lat < 13 && lon > -82.5 && !(lon < -77.3 && lat > 7.1)),
  af: cut(afroEurasia, (lon, lat) => inPoly(lon, lat, africaBox)),
  in: cut(afroEurasia, (lon, lat) => lon > 67.5 && lon < 91.5 && lat < 24.5 && lat > 5),
  au: ringWith(134, -25),
  an: rings.filter((r) => r.every(([, lat]) => lat < -59) && r.length > 30).sort((a, b) => b.length - a.length)[0].filter(([, lat]) => lat > -89.5),
};
const TOL = { sa: 0.7, af: 0.7, in: 0.5, au: 0.6, an: 0.9 };
for (const k of Object.keys(outlines)) outlines[k] = simplify(outlines[k], TOL[k]).map(([lon, lat]) => [Math.round(lon * 10) / 10, Math.round(lat * 10) / 10]);

// ── 회전: 사원수 ──
const rad = Math.PI / 180;
const qOf = (lat, lon, ang) => { const a = (ang * rad) / 2, s = Math.sin(a); return [Math.cos(a), Math.cos(lat * rad) * Math.cos(lon * rad) * s, Math.cos(lat * rad) * Math.sin(lon * rad) * s, Math.sin(lat * rad) * s]; };
const qMul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
const qInv = (q) => [q[0], -q[1], -q[2], -q[3]];
const poleOf = (q) => { if (q[0] < 0) q = q.map((v) => -v); const ang = 2 * Math.acos(Math.min(1, q[0])) / rad, s = Math.hypot(q[1], q[2], q[3]) || 1; return [Math.round((Math.asin(q[3] / s) / rad) * 100) / 100, Math.round((Math.atan2(q[2], q[1]) / rad) * 100) / 100, Math.round(ang * 100) / 100]; };
// 맞춤 극(위도, 경도, 각). 움직이는 판을 고정된 판에 붙인다.
const SAM_AFR = qOf(45.5, -32.2, 58.2);
const ANT_AFR = qOf(-7.78, -31.42, 58.0);
const IND_ANT = qOf(-4.44, 16.74, -92.77);
const AUS_ANT = qOf(-2.0, 38.9, -31.5);
const AFR_ANT = qInv(ANT_AFR);
const ROT = { an: [0, 0, 0], af: poleOf(AFR_ANT), sa: poleOf(qMul(AFR_ANT, SAM_AFR)), in: poleOf(IND_ANT), au: poleOf(AUS_ANT) };

// 빙하의 흔적(지금 좌표의 가운데 경도, 위도, 반지름 도). 석탄기와 페름기의 빙하 퇴적층이 알려진 곳을 간추렸다.
const ICE = { sa: [-54, -27, 10], af: [24, -26, 11], in: [80, 20, 7], au: [134, -31, 9], an: [70, -80, 16] };
const NAME = { sa: "남아메리카", af: "아프리카", in: "인도", au: "오스트레일리아", an: "남극" };
const COLOR = { sa: "#86C06C", af: "#D9B45F", in: "#E8915A", au: "#C49AE8", an: "#BFD7EA" };

const out = `// 자동 생성물: node qa/gen-g2u2-gondwana.mjs 가 만든다. 손으로 고치지 않는다.
// 8레슨 빙하의 흔적 랩의 실제 대륙 윤곽(Natural Earth 110m 육지에서 떼어 냄)과, 대륙을 남극에 붙이는 회전(극의 위도와 경도, 각).
export interface GondwanaLand {
  k: string;
  name: string;
  color: string;
  /** 윤곽: [경도, 위도][] */
  outline: [number, number][];
  /** 남극을 고정했을 때 이 대륙을 옛 자리로 옮기는 회전: [극의 위도, 극의 경도, 각(도)] */
  rot: [number, number, number];
  /** 빙하의 흔적: [가운데 경도, 가운데 위도, 반지름(도)] */
  ice: [number, number, number];
}
export const GONDWANA: GondwanaLand[] = ${JSON.stringify(Object.keys(outlines).map((k) => ({ k, name: NAME[k], color: COLOR[k], outline: outlines[k], rot: ROT[k], ice: ICE[k] })))};
`;
writeFileSync(join(ROOT, "src/lessons/steps/g2u2v5/gondwanaData.ts"), out);
console.log(Object.entries(outlines).map(([k, v]) => `${k} ${v.length}점`).join(" | "), "|", JSON.stringify(ROT));
