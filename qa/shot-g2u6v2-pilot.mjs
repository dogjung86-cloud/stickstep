// g2u6 v2 파일럿 검수 캡처 — 갤러리(포트 6020)의 문항 카드를 하나씩 찍고 격자 시트로 묶는다.
// 사전에 `node qa/render-g2u6v2-full.mjs` + 갤러리 서버(6020)가 떠 있어야 한다.
// PORT=6020 node qa/shot-g2u6v2-pilot.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const PORT = process.env.PORT || "6020";
fs.mkdirSync("qa/shots/g2u6v2", { recursive: true });
fs.mkdirSync("tmp", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 760, height: 1400 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.evaluate(() => document.querySelectorAll("details").forEach((d) => { d.open = true; }));
const cards = await page.$$(".q");
console.log(`카드 ${cards.length}장`);
const names = [];
for (const c of cards) {
  const slot = await c.evaluate((e) => e.querySelector(".q-tag").textContent.match(/슬롯 (\d+)/)[1]);
  const f = `e${slot}.png`;
  await c.screenshot({ path: `qa/shots/g2u6v2/${f}` });
  names.push(f);
}
names.sort();

const sheet = await browser.newPage({ viewport: { width: 1320, height: 900 }, deviceScaleFactor: 1.5 });
const CH = 6;
for (let k = 0; k < names.length; k += CH) {
  const chunk = names.slice(k, k + CH);
  const cells = chunk
    .map((f) => {
      const b64 = fs.readFileSync(`qa/shots/g2u6v2/${f}`).toString("base64");
      return `<div style="background:#fff;border:1px solid #ccc;border-radius:8px;padding:6px">
        <div style="font:700 12px sans-serif;color:#1B64DA;margin-bottom:4px">${f.replace(".png", "")}</div>
        <img src="data:image/png;base64,${b64}" style="width:100%;display:block"></div>`;
    })
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;padding:10px;background:#E8EAEE">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${cells}</div></body>`;
  const file = path.resolve("tmp/g2u6v2-sheet.html");
  fs.writeFileSync(file, html);
  await sheet.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  const out = `qa/shots/g2u6v2-sheet-${k / CH + 1}.png`;
  await sheet.screenshot({ path: out, fullPage: true });
  console.log(`SAVED ${out} (${chunk.length}장)`);
}
await browser.close();
