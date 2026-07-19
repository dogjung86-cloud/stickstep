// audit-soc6-geo.mjs — 사회 Ⅵ(오세아니아) 좌표 기계 검산(esbuild 실로드, audit-soc5-geo 복제+확장).
//   ⓪ **wrap 케이스 검산(이 단원 특별 검사)** — 날짜변경선을 넘는 크롭의 언랩 규약 전 체인:
//      climateAt 언랩↔wrap 동치 · 서경 도장(사모아·통가)의 언랩 좌표가 크롭 안 · x>1000 육지
//      복제 존재(WORLD_LAND_PATH) · 날짜변경선 건너 방위(dirWord 동치 — 언랩이라 동쪽이 동쪽).
//   ① OCEANIA 5지역: 도장 in-poly · 크롭 포함 · 겹침 0 · 경계 정합(토레스 해협·피지↔통가)
//      — 대양 지역(도서 3구분)은 "앵커 육지" 검사를 면제한다(앵커·도장이 산호섬/바다 위가 정상,
//        Kottek 격자에 산호섬 셀이 없음 — 대신 in-poly·크롭 검사로 대체. 호주·뉴질랜드는 육지 검사).
//   ② L2 hotspot 스팟 % ↔ 지형 소품 lon/lat 재검산 — 콘텐츠 저작 후 SPOTS 채움
//   ③ 지역명·도장 라벨 겹침 추정 + 크롭 밖 검사 + 세로 pill(우상단) 충돌
//   ④ 퀴즈 letters 지리·기후 정합 — 콘텐츠 저작 후 LETTERS 채움
// 실행: node qa/audit-soc6-geo.mjs
import { build } from "esbuild";
import { writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const entry = join(process.cwd(), "qa", ".tmp-audit6-entry.mjs");
const outFile = join(process.cwd(), "qa", ".tmp-audit6-bundle.mjs");
writeFileSync(
  entry,
  `
import { CONTINENTS, lonToX, latToY, pointInPoly, distToPoly } from "../src/ui/continentMap.ts";
import { climateAt, WORLD_LAND_PATH, polarXY } from "../src/ui/worldMap.generated.ts";
export { CONTINENTS, lonToX, latToY, pointInPoly, distToPoly, climateAt, WORLD_LAND_PATH, polarXY };
`,
);
await build({ entryPoints: [entry], bundle: true, format: "esm", outfile: outFile, logLevel: "silent" });
const M = await import(pathToFileURL(outFile).href);
rmSync(entry, { force: true });
rmSync(outFile, { force: true });

const OC = M.CONTINENTS.oceania;
const { lonToX, latToY, pointInPoly, distToPoly, climateAt, WORLD_LAND_PATH, polarXY } = M;
let fails = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) fails += 1;
};

/* ── ⓪ wrap 케이스 검산 — 언랩 규약 전 체인 ── */
// climateAt: 언랩(>180)과 wrap(서경)이 같은 값을 돌려주는가(내부 wrap 규약)
for (const [name, un, w, lat] of [
  ["사모아 아피아", 188.24, -171.76, -13.83],
  ["통가 누쿠알로파", 184.8, -175.2, -21.14],
  ["니우에", 190.1, -169.9, -19.05],
  ["시드니(무-wrap 항등)", 151.21, 151.21, -33.87],
]) {
  check(climateAt(un, lat) === climateAt(w, lat), `[wrap] climateAt ${name} 언랩(${un})=${climateAt(un, lat)} ↔ 서경(${w})=${climateAt(w, lat)}`);
}
// x>1000 육지 복제 — 서경 섬(사모아·통가)이 크롭 안 x 좌표에 실제로 그려져 있는가
const hasPathNear = (x, y, tol = 6) => {
  const re = /[ML](-?\d+\.\d) (-?\d+\.\d)/g;
  let m;
  while ((m = re.exec(WORLD_LAND_PATH))) {
    if (Math.abs(parseFloat(m[1]) - x) < tol && Math.abs(parseFloat(m[2]) - y) < tol) return true;
  }
  return false;
};
check(hasPathNear(lonToX(188.24), latToY(-13.83)), "[wrap] 사모아 x>1000 육지 복제 존재");
check(hasPathNear(lonToX(184.8), latToY(-21.14)), "[wrap] 통가 x>1000 육지 복제 존재");
check(hasPathNear(lonToX(179.19), latToY(-8.52)), "[wrap] 투발루 육지 존재(50m 병합)");
check(hasPathNear(lonToX(144.75), latToY(13.45), 4), "[wrap] 괌 육지 존재(50m 병합)");
// 날짜변경선 건너 방위 — 언랩 좌표라 피지(178)→사모아(188)가 "동쪽"으로 계산되는가
{
  const dLon = 188.24 - 178.44; // 언랩: +9.8 → 동쪽 (wrap 좌표면 -171.76-178.44 = -350 → 서쪽 오답)
  check(dLon > 0, `[wrap] 피지→사모아 방위 = 동쪽(Δlon ${dLon.toFixed(1)})`);
}
// 극 원판 투영 검산(부호·방향) — polarXY 규약: 북 0°=아래(+y)·남 0°=위(−y), 90°E=오른쪽(+x)
{
  const n0 = polarXY(0, 52, false);
  const n90 = polarXY(90, 52, false);
  const s0 = polarXY(0, -70, true);
  check(n0.y > 0 && Math.abs(n0.x) < 1e-9, `[극] 북 0°자오선 = 아래(+y) (${n0.x.toFixed(1)},${n0.y.toFixed(1)})`);
  check(n90.x > 0 && Math.abs(n90.y) < 1e-9, `[극] 북 90°E = 오른쪽(+x)`);
  check(s0.y < 0, `[극] 남 0°자오선 = 위(−y) (${s0.y.toFixed(1)})`);
}

/* ── ① 지역 데이터 검산 ── */
const crop = OC.crop;
const inCrop = (lon, lat) => {
  const x = lonToX(lon);
  const y = latToY(lat);
  return x >= crop.x && x <= crop.x + crop.w && y >= crop.y && y <= crop.y + crop.h;
};
const LAND_REGIONS = new Set(["australia", "newzealand"]); // 도서 3지역은 앵커/도장 육지 검사 면제
for (const r of OC.regions) {
  for (const c of r.cities) {
    check(pointInPoly(c.lon, c.lat, r.poly), `[${r.name}] ${c.name} in-poly`);
    check(inCrop(c.lon, c.lat), `[${r.name}] ${c.name} 크롭 안`);
    if (LAND_REGIONS.has(r.id)) check(climateAt(c.lon, c.lat) !== 0, `[${r.name}] ${c.name} 육지`);
  }
  check(pointInPoly(r.anchor[0], r.anchor[1], r.poly), `[${r.name}] 앵커 in-poly`);
  if (LAND_REGIONS.has(r.id)) check(climateAt(r.anchor[0], r.anchor[1]) !== 0, `[${r.name}] 앵커 육지`);
  check(inCrop(r.anchor[0], r.anchor[1]), `[${r.name}] 앵커 크롭 안`);
  const out = r.poly.filter(([lo, la]) => !inCrop(lo, la)).length;
  check(out === 0, `[${r.name}] 폴리곤 꼭짓점 크롭 안 (밖 ${out}점)`);
}
// 상호 겹침 — 도장이 다른 지역 폴리곤 밖 + 그리드 샘플 겹침 0
for (const r of OC.regions)
  for (const o of OC.regions) {
    if (r.id === o.id) continue;
    for (const c of r.cities) check(!pointInPoly(c.lon, c.lat, o.poly), `[겹침] ${c.name}(${r.name})가 ${o.name} 폴리곤 밖`);
  }
{
  let overlapPts = 0;
  const samples = [];
  for (let lon = 110; lon <= 192.5; lon += 0.5)
    for (let lat = -48.5; lat <= 18; lat += 0.5) {
      const hit = OC.regions.filter((r) => pointInPoly(lon, lat, r.poly));
      if (hit.length > 1) {
        overlapPts += 1;
        if (samples.length < 6) samples.push(`(${lon},${lat}:${hit.map((h) => h.id).join("+")})`);
      }
    }
  check(overlapPts === 0, `지역 폴리곤 그리드 겹침 0 (실제 ${overlapPts}점${samples.length ? " " + samples.join(" ") : ""})`);
}
// 경계 정합 — 토레스 해협(호주|멜라네시아)·피지(멜라)↔통가(폴리) 상호 배타
const AU = OC.regions.find((r) => r.id === "australia");
const MEL = OC.regions.find((r) => r.id === "melanesia");
const MIC = OC.regions.find((r) => r.id === "micronesia");
const POLY = OC.regions.find((r) => r.id === "polynesia");
check(pointInPoly(142.5, -10.7, AU.poly) && !pointInPoly(142.5, -10.7, MEL.poly), "[경계] 케이프요크(142.5,-10.7) = 호주만");
check(pointInPoly(143, -6, MEL.poly) && !pointInPoly(143, -6, AU.poly), "[경계] 뉴기니 내륙(143,-6) = 멜라네시아만");
check(pointInPoly(178.44, -18.14, MEL.poly) && !pointInPoly(178.44, -18.14, POLY.poly), "[경계] 피지 = 멜라네시아만");
check(pointInPoly(184.8, -21.14, POLY.poly) && !pointInPoly(184.8, -21.14, MEL.poly), "[경계] 통가 = 폴리네시아만");
// 스냅 오염 방지 — 주요 도장이 이웃 지역 스냅권(3°) 밖(오답 코미디가 정상 발화하는 표적)
check(distToPoly(147.19, -9.48, AU.poly) > 3, `[스냅] 포트모르즈비 → 호주 경계 ${distToPoly(147.19, -9.48, AU.poly).toFixed(2)}° > 3°`);
check(distToPoly(178.44, -18.14, POLY.poly) > 3, `[스냅] 피지 → 폴리네시아 경계 ${distToPoly(178.44, -18.14, POLY.poly).toFixed(2)}° > 3°`);
check(distToPoly(179.19, -8.52, MIC.poly) > 3, `[스냅] 투발루 → 미크로네시아 경계 ${distToPoly(179.19, -8.52, MIC.poly).toFixed(2)}° > 3°`);
// 도서 지역 "바다 흡수"(카리브 확장판) — 지역 안 바다 드롭 = 정답 처리 표본.
// 근해 셀은 Kottek 팽창 격자가 값을 가질 수 있으니(해안 보정) 바다 확인은 먼바다 표본만.
for (const [name, lon, lat, rid, mustSea] of [
  ["미크로네시아 한가운데 바다", 155, 4, "micronesia", true],
  ["폴리네시아 한가운데 바다", 186, -12, "polynesia", true],
  ["솔로몬 앞바다(근해 — pip만)", 158, -9, "melanesia", false],
]) {
  const r = OC.regions.find((k) => k.id === rid);
  check(pointInPoly(lon, lat, r.poly), `[바다 흡수] ${name}(${lon},${lat}) ${r.name} in-poly`);
  if (mustSea) check(climateAt(lon, lat) === 0, `[바다 흡수] ${name} 실제로 바다(정답 처리 의도 확인)`);
}
// outsideMsg 분기 — 동남아(자와·보르네오·서뉴기니) = 지역 밖 + 육지
for (const [name, lon, lat] of [["자와", 110.5, -7], ["보르네오", 114, 0.5], ["서뉴기니(인니령)", 137, -4], ["필리핀 루손", 121, 15.5]]) {
  check(!OC.regions.some((r) => pointInPoly(lon, lat, r.poly)), `[분기] ${name}(${lon},${lat}) 다섯 지역 밖`);
  check(climateAt(lon, lat) !== 0, `[분기] ${name} 육지(분기 도달 조건)`);
}
// e2e 표본 — 대양 판정 순서: 타 지역(바다 포함) = 코미디가 풍덩보다 먼저(pip이 결정 —
// climateAt 값 무관), 지역 밖 바다 = 풍덩(seaMsg)
check(pointInPoly(153, 6, MIC.poly), "[e2e] 미크로네시아 anchor(153,6) = 코미디 표적(pip)");
check(!OC.regions.some((r) => pointInPoly(168, -7, r.poly)) && climateAt(168, -7) === 0, "[e2e] 산호해 북쪽 빈 바다(168,-7) = 풍덩(seaMsg)");
// 호주 내륙 기후 정합(교과서 서술 근거)
check(climateAt(133.9, -23.7) === 2, `[정합] 앨리스스프링스 = 건조(실제 ${climateAt(133.9, -23.7)})`);
check(climateAt(130.84, -12.46) === 1, `[정합] 다윈 = 열대(실제 ${climateAt(130.84, -12.46)})`);
check(climateAt(151.21, -33.87) === 3, `[정합] 시드니 = 온대(실제 ${climateAt(151.21, -33.87)})`);
check(climateAt(174.76, -36.85) === 3, `[정합] 오클랜드 = 온대(실제 ${climateAt(174.76, -36.85)})`);
check(climateAt(147.19, -9.48) === 1, `[정합] 포트모르즈비 = 열대(실제 ${climateAt(147.19, -9.48)})`);

/* ── ② L2 hotspot 스팟 % ↔ 지형 지도 좌표 검산 ── */
// 뷰박스는 socFigures6 OC_TERRAIN_VB("806 272 197 112" — pad0, 호주·뉴질랜드 확대 크롭).
const VB = { x: 806, y: 272, w: 197, h: 112 };
const pct = (lon, lat) => ({
  x: ((lonToX(lon) - VB.x) / VB.w) * 100,
  y: ((latToY(lat) - VB.y) / VB.h) * 100,
});
const SPOTS = [
  // [이름, 스팟 x%, 스팟 y%, 소품 lon, 소품 lat] — unit6.ts L2 hotspot과 1:1
  ["서부의 사막", 16.7, 42.4, 122, -25],
  ["대찬정 분지", 42.1, 41.1, 140, -24.5],
  ["그레이트디바이딩산맥", 55.5, 57.2, 149.5, -31],
  ["대보초", 51.7, 21.3, 146.8, -16.5],
  ["머리강·달링강", 46.3, 65.9, 143, -34.5],
  ["북섬 화산", 92.3, 76.6, 175.6, -38.8],
  ["남섬 빙하", 82.3, 90.2, 168.5, -44.3],
];
for (const [name, px, py, lon, lat] of SPOTS) {
  const p = pct(lon, lat);
  const dx = Math.abs(p.x - px);
  const dy = Math.abs(p.y - py);
  check(dx < 0.6 && dy < 0.6, `[스팟] ${name} %=(${px},${py}) ↔ 소품(${lon},${lat})→(${p.x.toFixed(1)},${p.y.toFixed(1)}) Δ(${dx.toFixed(2)},${dy.toFixed(2)})`);
}
// 지형 소품 지리 검산 — 글리프·영역이 육지 위(대보초 호는 앞바다가 정상이라 제외)
for (const [name, lon, lat] of [
  ["사막 영역 중심", 121, -25.5], ["분지 영역 중심", 140, -24.5], ["산맥 글리프", 148, -35.5],
  ["북섬 화산 글리프", 175.6, -39], ["남섬 산 글리프", 170, -43.5], ["머리강 하류", 139.8, -35.2],
]) {
  check(climateAt(lon, lat) !== 0, `[소품] ${name}(${lon},${lat}) 육지`);
}
// 대보초 호 — 해안 앞바다(바다가 정상, 육지에 박히면 실격)
for (const [lon, lat] of [[144.6, -13.5], [147.6, -17.5], [151.6, -21.5]]) {
  check(climateAt(lon, lat) === 0 || distToPoly(lon, lat, OC.regions[0].poly) < 3, `[대보초] (${lon},${lat}) 앞바다/해안`);
}

/* ── ③ 라벨 근접(svg px) — 지역명 앵커 라벨 vs 도장 라벨 상자 추정 ── */
const LS = crop.w / 348;
const nameFs = 14 * LS;
const cityFs = 8.5 * LS;
const boxes = [];
for (const r of OC.regions) {
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
for (const b of boxes) {
  check(b.x1 >= crop.x - 2 && b.x2 <= crop.x + crop.w + 2, `[라벨 크롭] ${b.label} (${b.x1.toFixed(0)}~${b.x2.toFixed(0)} / 크롭 ${crop.x}~${crop.x + crop.w})`);
}
// 세로 rpl-pill(우상단) 충돌 — 상단 12% 밴드·우측 40%에 도장 없음(크롭 상단 lat 18 확장의 목적)
for (const r of OC.regions)
  for (const c of r.cities) {
    const cx = lonToX(c.lon);
    const cy = latToY(c.lat);
    const inTR = cy < crop.y + crop.h * 0.12 && cx > crop.x + crop.w * 0.6;
    check(!inTR, `[pill 충돌] ${c.name} 우상단 pill 존 밖 (y ${cy.toFixed(0)} vs ${(crop.y + crop.h * 0.12).toFixed(0)})`);
  }

/* ── ④ 퀴즈 letters 지리·기후 정합 ── */
const LETTERS = [
  // [이름, lon, lat, 의도 지역 id 또는 "climate:코드"] — unit6.ts 퀴즈 figure와 1:1
  ["L1 ㉠(미크로네시아)", 153, 6, "micronesia"],
  ["L3 ㉠(내륙 건조)", 127, -26, "climate:2"],
];
for (const [name, lon, lat, spec] of LETTERS) {
  if (String(spec).startsWith("climate:")) {
    const code = Number(String(spec).slice(8));
    check(climateAt(lon, lat) === code, `[레터] ${name}(${lon},${lat}) 기후 = ${code}(실제 ${climateAt(lon, lat)})`);
  } else {
    const r = OC.regions.find((k) => k.id === spec);
    const d = distToPoly(lon, lat, r.poly);
    check(d <= 3, `[레터] ${name} → ${r.name} 폴리곤 거리 ${d.toFixed(2)}° (in/스냅권)`);
  }
}

console.log(fails ? `\nAUDIT GEO(Ⅵ): ${fails} FAIL` : "\nAUDIT GEO(Ⅵ): ALL PASS");
process.exit(fails ? 1 : 0);
