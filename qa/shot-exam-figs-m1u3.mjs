// m1u3 시험 그림 눈검수용 스크린샷. 9개 풀 파일에서 figure 문항을 자동 수집한다.
// PORT=<포트> node qa/shot-exam-figs-m1u3.mjs (dev 서버 필수)
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const PORT = process.env.PORT || "5203";
const OUT = path.resolve(process.env.SHOT_DIR || "../m1u3-temp/shots");
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 3000 }, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });

const result = await page.evaluate(async () => {
  const mods = await Promise.all(
    ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9"].map((suffix) =>
      import(`/src/content/exams/m1u3${suffix}.ts`),
    ),
  );
  const pools = mods.flatMap((module) => Object.values(module).find(Array.isArray) ?? []);
  const figures = pools.filter((item) => item.figure);
  const boxes = figures.map(
    (item) => `<section class="box"><div class="meta">${item.id} · ${item.type} · diff${item.diff ?? "?"}</div><div class="fig">${item.figure}</div></section>`,
  );
  document.head.innerHTML += `<style>
    *{box-sizing:border-box} body{margin:0;padding:10px;background:#F2F4F6;font-family:Arial,sans-serif}
    .box{margin:0 0 12px;padding:10px;border-radius:12px;background:#fff;border:1px solid #d9dee8;break-inside:avoid}
    .meta{font:800 12px/1.3 Arial;color:#334155;margin-bottom:6px}.fig{max-width:380px;margin:auto}.fig svg{display:block;width:100%;height:auto}
  </style>`;
  document.body.innerHTML = boxes.join("");
  return {
    count: figures.length,
    ids: figures.map((item) => item.id),
    missingSvg: figures.filter((item) => !item.figure.includes("<svg")).map((item) => item.id),
    leakingAria: figures
      .filter((item) => /aria-label="[^"]*(?:제[1-4]사분면|정답|옳|틀|\([−-]?\d+\s*,\s*[−-]?\d+\))[^"]*"/.test(item.figure))
      .map((item) => item.id),
  };
});
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "exam-m1u3-figs.png"), fullPage: true });
const total = await page.evaluate(() => document.body.scrollHeight);
const slices = 5;
const sliceHeight = Math.ceil(total / slices);
await page.setViewportSize({ width: 420, height: Math.min(sliceHeight, 6000) });
for (let index = 0; index < slices; index++) {
  await page.evaluate((y) => window.scrollTo(0, y), index * sliceHeight);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, `exam-m1u3-figs-${index + 1}.png`) });
}
console.log(JSON.stringify({ output: OUT, ...result }, null, 2));
await browser.close();
if (result.missingSvg.length || result.leakingAria.length) process.exitCode = 1;
