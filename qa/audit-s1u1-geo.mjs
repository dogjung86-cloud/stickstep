// s1u1 v1 지도 좌표 기계 검산 — 스테이징의 S1U1_GEO_CHECKS를 climateAt으로 대조(눈대중 0 원칙).
// kind: clim = 기후 코드 일치 · land = 육지(0 아님) · route = 날짜변경선 비횡단(|dlon| <= 180).
// 실행: node qa/audit-s1u1-geo.mjs
import { build } from "esbuild";
import { existsSync } from "node:fs";

async function loadMod(entry) {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  return import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
}

const W = await loadMod("src/ui/worldMap.generated.ts");
const SRC = [
  "qa/s1u1-pilot.ts", "qa/s1u1-rest-a.ts", "qa/s1u1-rest-b.ts", "qa/s1u1-rest-c.ts",
  "qa/s1u1-rest-d.ts", "qa/s1u1-rest-e.ts", "qa/s1u1-rest-f.ts",
].filter((p) => existsSync(p));

let pass = 0;
let fail = 0;
const failMsg = [];
for (const p of SRC) {
  const mod = await loadMod(p);
  const checks = mod.S1U1_GEO_CHECKS ?? [];
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
