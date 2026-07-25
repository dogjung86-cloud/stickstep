// 문제·개념 그림 전수 눈검수 갤러리 — 앱 스타일시트가 살아 있는 페이지에 그림만 갈아 끼워 캡처한다.
// PORT=5199 node qa/shot-g2u5v2-figs.mjs
import { chromium } from "playwright-core";
const PORT = process.env.PORT || "5199";
const GROUPS = [
  ["leafCellFig", "photoSummaryFig", "sensorGraphFig"],
  ["iodineResultFig", "distanceBarFig", "factorGraphFig"],
  ["dayNightFig", "photoRespCycleFig"],
  ["sugarRouteFig", "storageFormFig"],
];
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 760, height: 1200 }, deviceScaleFactor: 2 });
await p.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await p.waitForTimeout(600);
for (let g = 0; g < GROUPS.length; g++) {
  await p.evaluate(async (names) => {
    const m = await import("/src/ui/plantFigures2.ts");
    document.body.innerHTML = `<div style="position:fixed;inset:0;z-index:99999;overflow:auto;padding:16px;background:#F4F6F9;display:grid;gap:16px;justify-items:center">` +
      names.map((n) => `<div style="background:#fff;border-radius:16px;padding:12px;width:700px;max-width:100%">
        <div style="font:800 14px Pretendard;color:#495057;margin:2px 0 10px">${n}</div>${m[n]()}</div>`).join("") +
      `</div>`;
  }, GROUPS[g]);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `qa/shots/g2u5v2-figs-${g + 1}.png`, fullPage: true });
}
console.log("FIG GALLERY DONE");
await b.close();
