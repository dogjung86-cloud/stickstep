// audit-soc3-geo.mjs — 사회 Ⅲ(유럽) 감사: 좌표 기계 검산(esbuild 실로드).
// Ⅲ 제작 때 확립한 검산 문법 재현 + 이번 감사 확장(라벨 근접·그림 스팟 교차).
//   ① EUROPE 4지역: 도시 in-poly · 앵커 육지(climateAt≠0) · 지역 폴리곤 상호 겹침 0 · 크롭 포함
//   ② L2 hotspot 6스팟 %좌표 ↔ euroTerrainFig 소품(산·강·화산) svg 좌표 재검산
//   ③ 지역명 앵커 라벨 ↔ 도시 라벨 근접(세로 10 svg px 미만이면 경고 — 눈검수 대상)
//   ④ 퀴즈 letters(㉠㉡㉢)의 지리 판정(의도 지역 안인가)
// 실행: node qa/audit-soc3-geo.mjs  (esbuild bundle 후 node로 평가)
import { build } from "esbuild";
import { writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const entry = join(process.cwd(), "qa", ".tmp-audit-entry.mjs");
const outFile = join(process.cwd(), "qa", ".tmp-audit-bundle.mjs");
writeFileSync(
  entry,
  `
import { CONTINENTS, lonToX, latToY, pointInPoly, distToPoly } from "../src/ui/continentMap.ts";
import { climateAt } from "../src/ui/worldMap.generated.ts";
export { CONTINENTS, lonToX, latToY, pointInPoly, distToPoly, climateAt };
`,
);
await build({ entryPoints: [entry], bundle: true, format: "esm", outfile: outFile, logLevel: "silent" });
const M = await import(pathToFileURL(outFile).href);
rmSync(entry, { force: true });
rmSync(outFile, { force: true });

const EU = M.CONTINENTS.europe;
const { lonToX, latToY, pointInPoly, distToPoly, climateAt } = M;
let fails = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) fails += 1;
};

// ── ① 지역 데이터 검산 ──
const crop = EU.crop;
const inCrop = (lon, lat) => {
  const x = lonToX(lon);
  const y = latToY(lat);
  return x >= crop.x && x <= crop.x + crop.w && y >= crop.y && y <= crop.y + crop.h;
};
for (const r of EU.regions) {
  for (const c of r.cities) {
    check(pointInPoly(c.lon, c.lat, r.poly), `[${r.name}] ${c.name} in-poly`);
    check(inCrop(c.lon, c.lat), `[${r.name}] ${c.name} 크롭 안`);
    check(climateAt(c.lon, c.lat) !== 0, `[${r.name}] ${c.name} 육지`);
  }
  check(pointInPoly(r.anchor[0], r.anchor[1], r.poly), `[${r.name}] 앵커 in-poly`);
  check(climateAt(r.anchor[0], r.anchor[1]) !== 0, `[${r.name}] 앵커 육지`);
  check(inCrop(r.anchor[0], r.anchor[1]), `[${r.name}] 앵커 크롭 안`);
}
// 상호 겹침(도시·앵커가 다른 지역 폴리곤에 들어가지 않는가 + 그리드 샘플 겹침)
for (const r of EU.regions)
  for (const o of EU.regions) {
    if (r.id === o.id) continue;
    for (const c of r.cities) check(!pointInPoly(c.lon, c.lat, o.poly), `[겹침] ${c.name}(${r.name})가 ${o.name} 폴리곤 밖`);
  }
{
  let overlapPts = 0;
  for (let lon = -25; lon <= 62; lon += 0.5)
    for (let lat = 34; lat <= 72; lat += 0.5) {
      const hit = EU.regions.filter((r) => pointInPoly(lon, lat, r.poly));
      if (hit.length > 1) overlapPts += 1;
    }
  check(overlapPts === 0, `지역 폴리곤 그리드 겹침 0 (실제 ${overlapPts}점)`);
}

// ── ② L2 hotspot 스팟 % ↔ 지형 그림 소품 좌표 ──
// unit3.ts 스팟(%)과 socFigures3 소품(lon/lat) — 뷰박스 "430 44 244 118".
const VB = { x: 430, y: 44, w: 244, h: 118 };
const pct = (lon, lat) => ({
  x: ((lonToX(lon) - VB.x) / VB.w) * 100,
  y: ((latToY(lat) - VB.y) / VB.h) * 100,
});
const SPOTS = [
  ["스칸디나비아산맥", 43.5, 22, 13, 64.8],
  ["알프스산맥", 40.1, 65.6, 10, 46.3],
  ["유럽 평원", 57.1, 52.2, 25, 52],
  ["라인강", 36.4, 55.9, 6.8, 50.4],
  ["피오르 해안", 35.1, 30.5, 5.6, 61.2],
  ["화산", 7, 22.5, -19, 64.6],
];
for (const [name, px, py, lon, lat] of SPOTS) {
  const p = pct(lon, lat);
  const dx = Math.abs(p.x - px);
  const dy = Math.abs(p.y - py);
  check(dx < 0.6 && dy < 0.6, `[스팟] ${name} %=(${px},${py}) ↔ 소품(${lon},${lat})→(${p.x.toFixed(1)},${p.y.toFixed(1)}) Δ(${dx.toFixed(2)},${dy.toFixed(2)})`);
}

// ── ③ 라벨 근접(svg px) — 지역명 앵커 라벨 vs 전체 도시 라벨 상자 추정 ──
const LS = crop.w / 348;
const nameFs = 14 * LS;
const cityFs = 8.5 * LS;
const boxes = [];
for (const r of EU.regions) {
  const ax = lonToX(r.anchor[0]);
  const ay = latToY(r.anchor[1]) + 4 * LS; // baseline
  const w = r.name.length * nameFs;
  boxes.push({ kind: "name", label: r.name, x1: ax - w / 2, x2: ax + w / 2, y1: ay - nameFs * 0.82, y2: ay + nameFs * 0.2 });
  for (const c of r.cities) {
    const cx = lonToX(c.lon);
    const cy = latToY(c.lat) + (-4.4 + (c.labelDy ?? 0)) * LS;
    const cw = c.name.length * cityFs;
    boxes.push({ kind: "city", label: c.name, x1: cx - cw / 2, x2: cx + cw / 2, y1: cy - cityFs * 0.82, y2: cy + cityFs * 0.2 });
  }
}
for (let i = 0; i < boxes.length; i += 1)
  for (let j = i + 1; j < boxes.length; j += 1) {
    const a = boxes[i];
    const b = boxes[j];
    const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
    const oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
    if (ox > 0 && oy > 0) console.log(`WARN [라벨 겹침 추정] ${a.label}(${a.kind}) ↔ ${b.label}(${b.kind}) 겹침 ${ox.toFixed(1)}×${oy.toFixed(1)}px`);
  }

// ── ④ 퀴즈 letters 지리 판정 ──
const LETTERS = [
  ["L1 ㉠(이베리아=남부)", -4, 39.5, "south"],
  ["L3 ㉠(모스크바 부근=동부)", 38, 56, "east"],
  ["L7 ㉠(스코틀랜드)", -4.2, 56.8, "west"],
  ["L7 ㉡(플랑드르)", 4.5, 51.1, "west"],
  ["L7 ㉢(카탈루냐)", 1.6, 41.8, "south"],
];
for (const [name, lon, lat, rid] of LETTERS) {
  const r = EU.regions.find((k) => k.id === rid);
  const d = distToPoly(lon, lat, r.poly);
  check(d <= 3, `[레터] ${name} → ${r.name} 폴리곤 거리 ${d.toFixed(2)}° (in/스냅권)`);
  check(climateAt(lon, lat) !== 0, `[레터] ${name} 육지`);
}

console.log(fails ? `\nAUDIT GEO: ${fails} FAIL` : "\nAUDIT GEO: ALL PASS");
process.exit(fails ? 1 : 0);
