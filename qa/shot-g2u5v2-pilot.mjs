// g2u5 v2 갤러리 카드 전수 캡처(문항 맥락 포함 · g2u2 v2 관행: 그림 단독 렌더보다 검수력 우위).
// 해설까지 펼친 상태로 카드를 하나씩 찍고, 12장씩 묶은 대조 시트도 만든다.
// PORT=6019 node qa/shot-g2u5v2-pilot.mjs   (갤러리 서버가 떠 있어야 한다)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "6019";
const OUT = "qa/shots/g2u5v2";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 560, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
// 2단 컬럼을 1단으로 풀어 카드 경계를 또렷하게 하고, 해설을 전부 펼친다.
await page.evaluate(() => {
  document.querySelector(".cols").style.columnCount = "1";
  document.querySelectorAll("details").forEach((d) => { d.open = true; });
});
await page.waitForTimeout(400);

const cards = await page.$$("article.q");
console.log(`카드 ${cards.length}장`);
const files = [];
for (let i = 0; i < cards.length; i++) {
  const slot = await cards[i].evaluate((el) => (el.querySelector(".q-tag")?.textContent ?? "").match(/슬롯 (\d+)/)?.[1] ?? "000");
  const f = `${OUT}/g2u5e${slot}.png`;
  await cards[i].screenshot({ path: f });
  files.push(f);
}
console.log(`SAVED ${files.length}장 → ${OUT}/`);

// 대조 시트(12장씩) — 한눈에 훑기용
const CH = 12;
for (let p = 0; p * CH < files.length; p++) {
  const cells = files.slice(p * CH, (p + 1) * CH)
    .map((f) => `<div style="border:1px solid #ccc;border-radius:8px;background:#fff;overflow:hidden">
      <img src="data:image/png;base64,${fs.readFileSync(f).toString("base64")}" style="width:100%;display:block"></div>`)
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;padding:10px;background:#e9ecef">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;align-items:start">${cells}</div></body>`;
  const hp = `tmp/g2u5v2-full/sheet-${p + 1}.html`;
  fs.writeFileSync(hp, html);
  const sp = await browser.newPage({ viewport: { width: 1560, height: 900 }, deviceScaleFactor: 1.4 });
  await sp.goto(`http://localhost:${PORT}/sheet-${p + 1}.html`, { waitUntil: "networkidle" });
  await sp.screenshot({ path: `qa/shots/g2u5v2-sheet-${p + 1}.png`, fullPage: true });
  await sp.close();
  console.log(`SAVED qa/shots/g2u5v2-sheet-${p + 1}.png`);
}
await browser.close();
