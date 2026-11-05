// 잉크 스틱맨 리그 눈검수 샷: public/qa-stickart.html 전체를 2배율로 찍는다.
// PORT=<포트> node qa/shot-stickart.mjs [출력 경로]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5199";
const OUT = process.argv[2] || "qa/shots/stickart.png";
mkdirSync("qa/shots", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1320, height: 900 }, deviceScaleFactor: 2 });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await page.goto(`http://localhost:${PORT}/qa-stickart.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.screenshot({ path: OUT, fullPage: true });
await browser.close();
console.log("saved", OUT, errs.length ? `errors: ${errs.join(" | ")}` : "no errors");
