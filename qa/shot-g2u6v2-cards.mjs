// 지정한 슬롯 카드만 골라 한 시트로 묶는다(수정 확인용).
// PORT=6020 node qa/shot-g2u6v2-cards.mjs e239 e313 e315 e338 e340
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const want = process.argv.slice(2);
if (!want.length) { console.error("슬롯을 넘기세요: node qa/shot-g2u6v2-cards.mjs e239 e313"); process.exit(1); }
const PORT = process.env.PORT || "6020";
fs.mkdirSync("qa/shots/g2u6v2", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 760, height: 1400 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.evaluate(() => document.querySelectorAll("details").forEach((d) => { d.open = true; }));
const files = [];
for (const c of await page.$$(".q")) {
  const slot = await c.evaluate((e) => e.querySelector(".q-tag").textContent.match(/슬롯 (\d+)/)[1]);
  if (!want.includes(`e${slot}`)) continue;
  const f = `qa/shots/g2u6v2/e${slot}.png`;
  await c.screenshot({ path: f });
  files.push(f);
}
console.log(`카드 ${files.length}장 캡처`);

const cells = files
  .map((f) => {
    const b64 = fs.readFileSync(f).toString("base64");
    return `<div style="background:#fff;border:1px solid #ccc;border-radius:8px;padding:6px">
      <div style="font:700 12px sans-serif;color:#1B64DA;margin-bottom:4px">${path.basename(f, ".png")}</div>
      <img src="data:image/png;base64,${b64}" style="width:100%;display:block"></div>`;
  })
  .join("");
const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;padding:10px;background:#E8EAEE">
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${cells}</div></body>`;
const file = path.resolve("tmp/g2u6v2-cards.html");
fs.writeFileSync(file, html);
const sheet = await browser.newPage({ viewport: { width: 1320, height: 900 }, deviceScaleFactor: 1.5 });
await sheet.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await sheet.screenshot({ path: "qa/shots/g2u6v2-cards.png", fullPage: true });
console.log("SAVED qa/shots/g2u6v2-cards.png");
await browser.close();
