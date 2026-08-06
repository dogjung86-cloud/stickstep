// s1u2 v1 지도 좌표 기계 검산 — 스테이징의 S1U2_GEO_CHECKS를 실데이터로 대조(눈대중 0 원칙).
// kind: clim = 기후 코드 일치 · land = 육지(0 아님 · 카스피해는 2로 나오니 사용 주의 §8-0)
//       region = continentMap ASIA 지역 폴리곤 소속 일치(expectRegion)
//       crop = 아시아 크롭(lon 24.8~150.1 · lat -12.2~56.2) 포함 · route = |dlon| <= 180.
// 실행: node qa/audit-s1u2-geo.mjs
import { build } from "esbuild";
import { existsSync } from "node:fs";

async function loadMod(entry) {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  return import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
}

const W = await loadMod("src/ui/worldMap.generated.ts");
const C = await loadMod("src/ui/continentMap.ts");
const ASIA = C.CONTINENTS.asia;
const CROP = ASIA.crop;
const lonMin = (CROP.x / 1000) * 360 - 180;
const lonMax = ((CROP.x + CROP.w) / 1000) * 360 - 180;
const latMax = 90 - (CROP.y / 500) * 180;
const latMin = 90 - ((CROP.y + CROP.h) / 500) * 180;

const SRC = [
  "qa/s1u2-pilot.ts", "qa/s1u2-rest-a.ts", "qa/s1u2-rest-b.ts", "qa/s1u2-rest-c.ts",
  "qa/s1u2-rest-d.ts", "qa/s1u2-rest-e.ts", "qa/s1u2-rest-f.ts", "qa/s1u2-rest-g.ts",
  "qa/s1u2-rest-h.ts",
].filter((p) => existsSync(p));

let pass = 0;
let fail = 0;
const failMsg = [];
for (const p of SRC) {
  const mod = await loadMod(p);
  const checks = mod.S1U2_GEO_CHECKS ?? [];
  for (const c of checks) {
    if (c.kind === "clim") {
      c.pts.forEach(([lon, lat], i) => {
        const got = W.climateAt(lon, lat);
        const want = c.expect?.[i];
        if (got === want) pass++;
        else {
          fail++;
          failMsg.push(`${c.id} clim (${lon},${lat}) got ${got}(${W.CLIMATE_LABEL[got] ?? "바다"}) want ${want}`);
        }
      });
    } else if (c.kind === "land") {
      c.pts.forEach(([lon, lat]) => {
        const got = W.climateAt(lon, lat);
        if (got !== 0) pass++;
        else {
          fail++;
          failMsg.push(`${c.id} land (${lon},${lat}) = 바다/자료 없음`);
        }
      });
    } else if (c.kind === "region") {
      c.pts.forEach(([lon, lat], i) => {
        const want = c.expectRegion?.[i];
        const hits = ASIA.regions.filter((r) => C.pointInPoly(lon, lat, r.poly)).map((r) => r.id);
        if (hits.length === 1 && hits[0] === want) pass++;
        else {
          fail++;
          failMsg.push(`${c.id} region (${lon},${lat}) got [${hits.join(",")}] want ${want}`);
        }
      });
    } else if (c.kind === "crop") {
      c.pts.forEach(([lon, lat]) => {
        if (lon >= lonMin + 1 && lon <= lonMax - 1 && lat >= latMin + 1 && lat <= latMax - 1) pass++;
        else {
          fail++;
          failMsg.push(`${c.id} crop 밖/가장자리 (${lon},${lat}) — lon ${lonMin.toFixed(1)}~${lonMax.toFixed(1)} lat ${latMin.toFixed(1)}~${latMax.toFixed(1)}`);
        }
      });
    } else if (c.kind === "route") {
      const [[lon1], [lon2]] = c.pts;
      if (Math.abs(lon1 - lon2) <= 180) pass++;
      else {
        fail++;
        failMsg.push(`${c.id} route |dlon| = ${Math.abs(lon1 - lon2)} > 180 (날짜변경선 횡단 금지)`);
      }
    }
  }
  console.log(`${p}: 검산 항목 ${checks.length}`);
}
console.log(`\nGEO 검산: PASS ${pass} · FAIL ${fail}`);
if (fail) {
  failMsg.forEach((m) => console.log("  FAIL " + m));
  process.exit(1);
}
