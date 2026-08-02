// u2 v2 갤러리 카드 전수 캡처(눈검수용) · file:// 모드라 dev 서버 불요.
// node qa/render-u2v2-full.mjs 로 tmp/u2v2-full/index.html 을 먼저 만든 뒤 실행한다.
// node qa/shot-u2v2-pilot.mjs            → qa/shots/u2v2/ 에 카드별 png
// node qa/shot-u2v2-pilot.mjs --grid     → 카드 6장씩 묶은 시트(빠른 훑기용)
import { chromium } from "playwright-core";
import { mkdirSync, existsSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const GRID = process.argv.includes("--grid");
const OUT = "qa/shots/u2v2";
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const url = pathToFileURL(path.resolve("tmp/u2v2-full/index.html")).href;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 760, height: 1100 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });
// 한 칼럼으로 펴고 해설을 모두 열어 둔다(검수는 정답·해설까지 함께 본다).
await page.addStyleTag({ content: ".cols{column-count:1 !important}.sheet{max-width:720px}" });
await page.evaluate(() => document.querySelectorAll("details").forEach((d) => d.setAttribute("open", "")));
await page.waitForTimeout(400);

const ids = await page.evaluate(() => [...document.querySelectorAll(".q")].map((q) => q.dataset.id));
console.log(`카드 ${ids.length}장`);

if (GRID) {
  let n = 0;
  for (let i = 0; i < ids.length; i += 6) {
    const group = ids.slice(i, i + 6);
    await page.evaluate((g) => {
      document.querySelectorAll(".q").forEach((q) => { q.style.display = g.includes(q.dataset.id) ? "" : "none"; });
    }, group);
    await page.waitForTimeout(120);
    n += 1;
    await page.screenshot({ path: `${OUT}/sheet-${String(n).padStart(2, "0")}.png`, fullPage: true });
  }
  console.log(`시트 ${n}장 → ${OUT}/`);
} else {
  for (const id of ids) {
    const el = page.locator(`.q[data-id="${id}"]`);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(60);
    await el.screenshot({ path: `${OUT}/${id}.png` });
  }
  console.log(`카드 ${ids.length}장 → ${OUT}/`);
}
await browser.close();
