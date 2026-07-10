// HTML → PDF 렌더 (한국어 시스템 폰트). node qa/render-pricing-pdf.mjs (app 루트에서)
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";

const HTML = "C:\\Users\\kjh\\AppData\\Local\\Temp\\claude\\D--Brilliant-Science\\cc16ee6a-1756-4e20-936f-461d69640d78\\scratchpad\\pricing_report.html";
const OUT = "D:\\Brilliant Science\\스틱스텝_가격전략_시장조사_2026-07.pdf";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
await page.goto(pathToFileURL(HTML).href, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({ path: OUT, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log("SAVED " + OUT);
