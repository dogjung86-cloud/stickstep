// 스틱맨 장면 모음 샷: public/qa-stickscenes.html을 쿼리로 찍는다(전후 비교·일괄 교체 눈검수).
// PORT=<포트> node qa/shot-stickscenes.mjs "<쿼리>" <출력.png> [폭] [대기ms] [배율]
import { chromium } from "playwright-core";
import { mkdirSync, statSync } from "node:fs";
import { dirname } from "node:path";

const [query, out, width, wait, scale] = process.argv.slice(2);
mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: Number(width || 1200), height: 900 }, deviceScaleFactor: Number(scale || 1.5) });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
await page.goto(`http://localhost:${process.env.PORT || 5199}/qa-stickscenes.html?${query}`, { waitUntil: "load" });
await page.waitForFunction(() => window.__qa !== undefined, null, { timeout: 60000 });
await page.waitForTimeout(Number(wait || 1500));
const info = await page.evaluate(() => window.__qa);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("saved", out, JSON.stringify(info), `${Math.round(statSync(out).size / 1024)}KB`, errs.length ? `errors: ${errs.slice(0, 3).join(" | ")}` : "no errors");
