// audit-soc5-geo.mjs — 사회 Ⅴ(아메리카) 좌표 기계 검산(esbuild 실로드, audit-soc4-geo 문법).
//   ① AMERICA 3지역: 도시 in-poly · 앵커 육지(climateAt≠0) · 지역 폴리곤 상호 겹침 0 · 크롭 포함
//      + 지협 스냅 검산(중앙아메리카 지협 폭 < 손가락 — 연안 3° 스냅이 흡수하는지)
//      + outsideMsg 분기 스팟(그린란드·하와이) + 카리브 제도 흡수(자메이카·푸에르토리코·트리니다드)
//   ② L2 hotspot 스팟 %좌표 ↔ amTerrainFig 소품(lon/lat) 재검산 — 콘텐츠 저작 후 활성(SPOTS 채움)
//   ③ 지역명 앵커 라벨 ↔ 도시 라벨 근접(겹침 추정 경고 — 눈검수 대상)
//   ④ 퀴즈 letters(㉠㉡…)의 지리 판정 — 콘텐츠 저작 후 활성(LETTERS 채움)
// 실행: node qa/audit-soc5-geo.mjs
import { build } from "esbuild";
import { writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const entry = join(process.cwd(), "qa", ".tmp-audit5-entry.mjs");
const outFile = join(process.cwd(), "qa", ".tmp-audit5-bundle.mjs");
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

const AM = M.CONTINENTS.america;
const { lonToX, latToY, pointInPoly, distToPoly, climateAt } = M;
let fails = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) fails += 1;
};

// ── ① 지역 데이터 검산 ──
const crop = AM.crop;
const inCrop = (lon, lat) => {
  const x = lonToX(lon);
  const y = latToY(lat);
  return x >= crop.x && x <= crop.x + crop.w && y >= crop.y && y <= crop.y + crop.h;
};
for (const r of AM.regions) {
  for (const c of r.cities) {
    check(pointInPoly(c.lon, c.lat, r.poly), `[${r.name}] ${c.name} in-poly`);
    check(inCrop(c.lon, c.lat), `[${r.name}] ${c.name} 크롭 안`);
    check(climateAt(c.lon, c.lat) !== 0, `[${r.name}] ${c.name} 육지`);
  }
  check(pointInPoly(r.anchor[0], r.anchor[1], r.poly), `[${r.name}] 앵커 in-poly`);
  check(climateAt(r.anchor[0], r.anchor[1]) !== 0, `[${r.name}] 앵커 육지`);
  check(inCrop(r.anchor[0], r.anchor[1]), `[${r.name}] 앵커 크롭 안`);
  const out = r.poly.filter(([lo, la]) => !inCrop(lo, la)).length;
  check(out === 0, `[${r.name}] 폴리곤 꼭짓점 크롭 안 (밖 ${out}점)`);
}
// 상호 겹침(도시가 다른 지역 폴리곤 밖 + 그리드 샘플 겹침 0)
for (const r of AM.regions)
  for (const o of AM.regions) {
    if (r.id === o.id) continue;
    for (const c of r.cities) check(!pointInPoly(c.lon, c.lat, o.poly), `[겹침] ${c.name}(${r.name})가 ${o.name} 폴리곤 밖`);
  }
{
  let overlapPts = 0;
  const samples = [];
  for (let lon = -170; lon <= -29; lon += 0.5)
    for (let lat = -57; lat <= 73; lat += 0.5) {
      const hit = AM.regions.filter((r) => pointInPoly(lon, lat, r.poly));
      if (hit.length > 1) {
        overlapPts += 1;
        if (samples.length < 6) samples.push(`(${lon},${lat}:${hit.map((h) => h.id).join("+")})`);
      }
    }
  check(overlapPts === 0, `지역 폴리곤 그리드 겹침 0 (실제 ${overlapPts}점${samples.length ? " " + samples.join(" ") : ""})`);
}
// outsideMsg 분기 스팟 — 세 지역 폴리곤 밖 + 육지(분기 문구가 사는 조건)
for (const [name, lon, lat] of [["그린란드 남부", -45, 62], ["그린란드 중부", -42, 68], ["하와이 빅아일랜드", -155.5, 19.6]]) {
  const hit = AM.regions.some((r) => pointInPoly(lon, lat, r.poly));
  check(!hit, `[분기] ${name}(${lon},${lat})은 세 지역 밖`);
  check(climateAt(lon, lat) !== 0, `[분기] ${name} 육지(분기 도달 조건)`);
}
// 카리브 제도 흡수 — 섬 사이 바다를 중앙아메리카 폴리곤이 덮는다(동남아 선례)
const central = AM.regions.find((r) => r.id === "central");
for (const [name, lon, lat] of [
  ["자메이카(킹스턴)", -76.8, 18.0], ["쿠바(아바나)", -82.38, 23.13], ["푸에르토리코", -66.5, 18.2],
  ["트리니다드", -61.3, 10.6], ["바하마(나소)", -77.35, 25.06], ["카리브해 한가운데", -75, 15],
]) {
  check(pointInPoly(lon, lat, central.poly), `[카리브 흡수] ${name} 중앙아메리카 폴리곤 안`);
}
// 지협 스냅 검산 — 지협 연안 앞바다에서 경계 3° 이내(스냅권)인가 + 지협 본토 in-poly
for (const [name, lon, lat] of [["과테말라 내륙", -90.5, 15.2], ["니카라과", -85.5, 12.8], ["파나마 지협 중앙", -80, 8.8]]) {
  check(pointInPoly(lon, lat, central.poly), `[지협] ${name} in-poly`);
}
for (const [name, lon, lat] of [["지협 태평양 앞바다", -86.5, 10.2], ["지협 카리브 앞바다(스냅 불필요 — 폴리곤 내)", -82.5, 10.5]]) {
  const d = distToPoly(lon, lat, central.poly);
  check(d <= 3, `[지협 스냅] ${name}(${lon},${lat}) 경계 거리 ${d.toFixed(2)}° ≤ 3°`);
}
// 경계 정합 — 리오그란데강(앵글로|중앙)·파나마 지협(중앙|남미) 양쪽 표본이 제 지역에
const anglo = AM.regions.find((r) => r.id === "anglo");
const south = AM.regions.find((r) => r.id === "south");
check(pointInPoly(-99.5, 27.6, anglo.poly) && !pointInPoly(-99.5, 27.6, central.poly), "[경계] 리오그란데 북쪽(-99.5,27.6) = 앵글로만");
check(pointInPoly(-100.2, 25.2, central.poly) && !pointInPoly(-100.2, 25.2, anglo.poly), "[경계] 리오그란데 남쪽(-100.2,25.2) = 중앙만");
check(pointInPoly(-79.8, 9.1, central.poly) && !pointInPoly(-79.8, 9.1, south.poly), "[경계] 파나마 지협(-79.8,9.1) = 중앙만");
check(pointInPoly(-76.5, 7.5, south.poly) && !pointInPoly(-76.5, 7.5, central.poly), "[경계] 지협 남쪽 콜롬비아(-76.5,7.5) = 남미만");
// 알래스카 포함 — 앵글로 폴리곤이 알래스카를 덮는가(미국 땅)
check(pointInPoly(-150, 64, anglo.poly), "[앵글로] 알래스카 내륙(-150,64) in-poly");
// e2e 표본 — 오답 코미디·바다 풍덩 지점이 의도대로 판정되는가
check(!AM.regions.some((r) => pointInPoly(-40, 30, r.poly)) && climateAt(-40, 30) === 0, "[e2e] 대서양(-40,30) = 바다 풍덩");
check(pointInPoly(-56, -11, south.poly), "[e2e] 남미 내륙(-56,-11) = 오답 코미디 표적(south)");

// ── ② L2 hotspot 스팟 % ↔ 지형 그림 소품 좌표 — 콘텐츠 저작 후 채움 ──
// 뷰박스는 socFigures5 mapShell: "28 41 392 371"(CROP.y−6, h+10) 기준으로 검산한다.
const VB = { x: 28, y: 41, w: 392, h: 371 };
const pct = (lon, lat) => ({
  x: ((lonToX(lon) - VB.x) / VB.w) * 100,
  y: ((latToY(lat) - VB.y) / VB.h) * 100,
});
const SPOTS = [
  // [이름, 스팟 x%, 스팟 y%, 소품 lon, 소품 lat] — unit5.ts hotspot과 1:1
  ["로키산맥", 40.3, 22.6, -113, 45],
  ["그레이트플레인스", 49.6, 25.6, -100, 41],
  ["미시시피강", 56.6, 29.4, -90, 36],
  ["애팔래치아산맥", 64.4, 27.9, -79, 38],
  ["안데스산맥", 70.1, 71.3, -71, -20],
  ["아마존강", 77.9, 58.6, -60, -3],
  ["브라질고원", 88.5, 67.6, -45, -15],
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
for (const r of AM.regions) {
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
// 도시 라벨 크롭 안 — 긴 라벨(리우데자네이루·부에노스아이레스)이 오른쪽 가장자리를 넘지 않는가
for (const b of boxes) {
  if (b.kind !== "city") continue;
  check(b.x1 >= crop.x - 2 && b.x2 <= crop.x + crop.w + 2, `[라벨 크롭] ${b.label} (${b.x1.toFixed(0)}~${b.x2.toFixed(0)} / 크롭 ${crop.x}~${crop.x + crop.w})`);
}
// 세로 rpl-pill(우상단) 충돌 — 크롭 우상단 사분면(상단 12%·우측 40%)에 도시 도장이 없는가
for (const r of AM.regions)
  for (const c of r.cities) {
    const cx = lonToX(c.lon);
    const cy = latToY(c.lat);
    const inTR = cy < crop.y + crop.h * 0.12 && cx > crop.x + crop.w * 0.6;
    check(!inTR, `[pill 충돌] ${c.name} 우상단 여백(그린란드 부근) 밖`);
  }

// ── ④ 퀴즈 letters 지리 판정 — 콘텐츠 저작 후 채움 ──
const LETTERS = [
  // [이름, lon, lat, 의도 지역 id]
  ["L1 ㉠(멕시코=중앙아메리카)", -102, 24, "central"],
];
for (const [name, lon, lat, rid] of LETTERS) {
  const r = AM.regions.find((k) => k.id === rid);
  const d = distToPoly(lon, lat, r.poly);
  check(d <= 3, `[레터] ${name} → ${r.name} 폴리곤 거리 ${d.toFixed(2)}° (in/스냅권)`);
  check(climateAt(lon, lat) !== 0, `[레터] ${name} 육지`);
}
// 기후 데이터 정합 — L3 서술의 근거 도시들이 실데이터에서 의도한 기후인가
// 코드: 1 열대 · 2 건조 · 3 온대 · 4 냉대 · 5 한대 · 6 고산
check(climateAt(-78.51, -0.22) === 6, `[정합] 키토 = 고산(실제 ${climateAt(-78.51, -0.22)})`);
check(climateAt(-73.25, -3.75) === 1, `[정합] 이키토스 = 열대(실제 ${climateAt(-73.25, -3.75)})`);
check(climateAt(-156.79, 71.29) === 5, `[정합] 배로(유트키아비크) = 한대(실제 ${climateAt(-156.79, 71.29)})`);
check(climateAt(-60, -3) === 1, `[정합] 아마존 유역 = 열대(실제 ${climateAt(-60, -3)})`);
check(climateAt(-110, 40) === 2, `[정합] 북미 내륙(그레이트베이슨) = 건조(실제 ${climateAt(-110, 40)})`);
check(climateAt(-84, 33) === 3, `[정합] 미국 남동부 = 온대(실제 ${climateAt(-84, 33)})`);
check(climateAt(-105, 55) === 4, `[정합] 캐나다 내륙 = 냉대(실제 ${climateAt(-105, 55)})`);
check(climateAt(-70, -23) === 2, `[정합] 아타카마 연안 = 건조(실제 ${climateAt(-70, -23)})`);
// L3 기후 지도 퀴즈 레터 — ㉠(-110,58) 캐나다 내륙이 실데이터에서 냉대(4)인가
check(climateAt(-110, 58) === 4, `[레터] L3 ㉠(-110,58) 기후 코드 = 냉대(실제 ${climateAt(-110, 58)})`);
// L2 지형 소품 육지 검산 — 산맥 글리프·강 시작점이 바다에 찍히지 않았는가(표본)
for (const [name, lon, lat] of [["로키 글리프", -113, 45], ["안데스 글리프", -71, -14], ["아마존강 시작", -76.5, -4.6], ["미시시피 시작", -94.2, 46.5]]) {
  check(climateAt(lon, lat) !== 0, `[소품] ${name}(${lon},${lat}) 육지`);
}

console.log(fails ? `\nAUDIT GEO(Ⅴ): ${fails} FAIL` : "\nAUDIT GEO(Ⅴ): ALL PASS");
process.exit(fails ? 1 : 0);
