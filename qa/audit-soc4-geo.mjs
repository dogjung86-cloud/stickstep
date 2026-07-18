// audit-soc4-geo.mjs — 사회 Ⅳ(아프리카) 좌표 기계 검산(esbuild 실로드, audit-soc3-geo 문법).
//   ① AFRICA 5지역: 도시 in-poly · 앵커 육지(climateAt≠0) · 지역 폴리곤 상호 겹침 0 · 크롭 포함
//   ② L2 hotspot 스팟 %좌표 ↔ afTerrainFig 소품(lon/lat) 재검산 — 콘텐츠 저작 후 활성(SPOTS 채움)
//   ③ 지역명 앵커 라벨 ↔ 도시 라벨 근접(겹침 추정 경고 — 눈검수 대상)
//   ④ 퀴즈 letters(㉠㉡…)의 지리 판정 — 콘텐츠 저작 후 활성(LETTERS 채움)
// 실행: node qa/audit-soc4-geo.mjs
import { build } from "esbuild";
import { writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const entry = join(process.cwd(), "qa", ".tmp-audit4-entry.mjs");
const outFile = join(process.cwd(), "qa", ".tmp-audit4-bundle.mjs");
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

const AF = M.CONTINENTS.africa;
const { lonToX, latToY, pointInPoly, distToPoly, climateAt } = M;
let fails = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) fails += 1;
};

// ── ① 지역 데이터 검산 ──
const crop = AF.crop;
const inCrop = (lon, lat) => {
  const x = lonToX(lon);
  const y = latToY(lat);
  return x >= crop.x && x <= crop.x + crop.w && y >= crop.y && y <= crop.y + crop.h;
};
for (const r of AF.regions) {
  for (const c of r.cities) {
    check(pointInPoly(c.lon, c.lat, r.poly), `[${r.name}] ${c.name} in-poly`);
    check(inCrop(c.lon, c.lat), `[${r.name}] ${c.name} 크롭 안`);
    check(climateAt(c.lon, c.lat) !== 0, `[${r.name}] ${c.name} 육지`);
  }
  check(pointInPoly(r.anchor[0], r.anchor[1], r.poly), `[${r.name}] 앵커 in-poly`);
  check(climateAt(r.anchor[0], r.anchor[1]) !== 0, `[${r.name}] 앵커 육지`);
  check(inCrop(r.anchor[0], r.anchor[1]), `[${r.name}] 앵커 크롭 안`);
  // 폴리곤 전 꼭짓점 크롭 포함
  const out = r.poly.filter(([lo, la]) => !inCrop(lo, la)).length;
  check(out === 0, `[${r.name}] 폴리곤 꼭짓점 크롭 안 (밖 ${out}점)`);
}
// 상호 겹침(도시가 다른 지역 폴리곤 밖 + 그리드 샘플 겹침 0)
for (const r of AF.regions)
  for (const o of AF.regions) {
    if (r.id === o.id) continue;
    for (const c of r.cities) check(!pointInPoly(c.lon, c.lat, o.poly), `[겹침] ${c.name}(${r.name})가 ${o.name} 폴리곤 밖`);
  }
{
  let overlapPts = 0;
  const samples = [];
  for (let lon = -20; lon <= 55; lon += 0.5)
    for (let lat = -36; lat <= 38; lat += 0.5) {
      const hit = AF.regions.filter((r) => pointInPoly(lon, lat, r.poly));
      if (hit.length > 1) {
        overlapPts += 1;
        if (samples.length < 6) samples.push(`(${lon},${lat}:${hit.map((h) => h.id).join("+")})`);
      }
    }
  check(overlapPts === 0, `지역 폴리곤 그리드 겹침 0 (실제 ${overlapPts}점${samples.length ? " " + samples.join(" ") : ""})`);
}
// outsideMsg 분기 스팟 체크(마다가스카르·시나이·유럽) — 다섯 지역 폴리곤 밖이어야 분기가 산다
for (const [name, lon, lat] of [["마다가스카르 중심", 46.8, -19.5], ["시나이 중심", 33.9, 29.5], ["이베리아 남단", -5.5, 37]]) {
  const hit = AF.regions.some((r) => pointInPoly(lon, lat, r.poly));
  check(!hit, `[분기] ${name}(${lon},${lat})은 다섯 지역 밖`);
}

// ── ② L2 hotspot 스팟 % ↔ 지형 그림 소품 좌표 — 콘텐츠 저작 후 채움 ──
// 뷰박스는 socFigures4 mapShell: "444 138 209 216"(CROP.y−6, h+10) 기준으로 검산한다.
const VB = { x: 444, y: 138, w: 209, h: 216 };
const pct = (lon, lat) => ({
  x: ((lonToX(lon) - VB.x) / VB.w) * 100,
  y: ((latToY(lat) - VB.y) / VB.h) * 100,
});
const SPOTS = [
  // [이름, 스팟 x%, 스팟 y%, 소품 lon, 소품 lat] — unit4.ts hotspot과 1:1
  ["아틀라스산맥", 22.1, 8.8, -3.5, 33.5],
  ["사하라 사막", 44.1, 22.3, 13, 23],
  ["나일강", 70.0, 21.0, 32.5, 24],
  ["동아프리카 지구대", 74.9, 47.4, 36.2, 3.5],
  ["콩고 분지", 54.7, 51.9, 21, 0],
  ["킬리만자로산", 76.4, 55.8, 37.35, -3.07],
  ["빅토리아 폭포", 61.2, 74.9, 25.85, -17.92],
];
for (const [name, px, py, lon, lat] of SPOTS) {
  const p = pct(lon, lat);
  const dx = Math.abs(p.x - px);
  const dy = Math.abs(p.y - py);
  check(dx < 0.6 && dy < 0.6, `[스팟] ${name} %=(${px},${py}) ↔ 소품(${lon},${lat})→(${p.x.toFixed(1)},${p.y.toFixed(1)}) Δ(${dx.toFixed(2)},${dy.toFixed(2)})`);
}

// ── ③ 라벨 근접(svg px) — 지역명 앵커 라벨 vs 도시 라벨 상자 추정 ──
const LS = crop.w / 348;
const nameFs = 14 * LS;
const cityFs = 8.5 * LS;
const boxes = [];
for (const r of AF.regions) {
  const ax = lonToX(r.anchor[0]);
  const ay = latToY(r.anchor[1]) + 4 * LS;
  const w = r.name.length * nameFs;
  boxes.push({ kind: "name", label: r.name, x1: ax - w / 2, x2: ax + w / 2, y1: ay - nameFs * 0.82, y2: ay + nameFs * 0.2 });
  for (const c of r.cities) {
    const cx = lonToX(c.lon);
    const cy = latToY(c.lat) + (-4.4 + (c.labelDy ?? 0)) * LS;
    const cw = c.name.length * cityFs;
    boxes.push({ kind: "city", label: c.name, x1: cx - cw / 2, x2: cx + cw / 2, y1: cy - cityFs * 0.82, y2: cy + cityFs * 0.2 });
  }
}
let labelWarns = 0;
for (let i = 0; i < boxes.length; i += 1)
  for (let j = i + 1; j < boxes.length; j += 1) {
    const a = boxes[i];
    const b = boxes[j];
    const ox = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
    const oy = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
    if (ox > 0 && oy > 0) {
      labelWarns += 1;
      console.log(`WARN [라벨 겹침 추정] ${a.label}(${a.kind}) ↔ ${b.label}(${b.kind}) 겹침 ${ox.toFixed(1)}×${oy.toFixed(1)}px`);
    }
  }
if (!labelWarns) console.log("INFO 라벨 겹침 추정 0건");

// ── ④ 퀴즈 letters 지리 판정 — 콘텐츠 저작 후 채움 ──
const LETTERS = [
  // [이름, lon, lat, 의도 지역 id]
  ["L1 ㉠(콩고 분지=중앙)", 22, 0, "central"],
];
for (const [name, lon, lat, rid] of LETTERS) {
  const r = AF.regions.find((k) => k.id === rid);
  const d = distToPoly(lon, lat, r.poly);
  check(d <= 3, `[레터] ${name} → ${r.name} 폴리곤 거리 ${d.toFixed(2)}° (in/스냅권)`);
  check(climateAt(lon, lat) !== 0, `[레터] ${name} 육지`);
}
// L3 ㉠은 지역이 아니라 기후 판정 — 적도 부근(24,3)이 실데이터에서 열대(1)인가
check(climateAt(24, 3) === 1, `[레터] L3 ㉠(24,3) 기후 코드 = 열대(실제 ${climateAt(24, 3)})`);
// L2 훅·recap 서술 검증 — 다르에스살람이 열대(1), 카이로가 건조(2)인가(기후 그래프 페어의 지리 정합)
check(climateAt(39.28, -6.79) === 1, `[정합] 다르에스살람 = 열대(실제 ${climateAt(39.28, -6.79)})`);
check(climateAt(31.24, 30.04) === 2, `[정합] 카이로 = 건조(실제 ${climateAt(31.24, 30.04)})`);

console.log(fails ? `\nAUDIT GEO(Ⅳ): ${fails} FAIL` : "\nAUDIT GEO(Ⅳ): ALL PASS");
process.exit(fails ? 1 : 0);
