// u6 v2 갤러리 특정 카드 캡처(사후 검수 대조용) — node qa/shot-u6v2-cards.mjs <out-dir> [카드번호들]
// 카드 번호 = 갤러리 인쇄 번호(001~160) = 슬롯 − 200.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const outDir = process.argv[2] || "qa/shots/u6v2-cards";
const cards = process.argv.slice(3).map(Number);
if (!cards.length) {
  console.error("카드 번호를 하나 이상 넘기세요");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
const b = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const p = await b.newPage({ viewport: { width: 560, height: 1200 }, deviceScaleFactor: 2 });
await p.goto("file:///" + resolve("tmp/u6v2-full/index.html").replace(/\\/g, "/"));
await p.waitForTimeout(600);
// 1칼럼로 강제(카드 잘림 방지)
await p.addStyleTag({ content: ".cols{column-count:1!important}" });
for (const n of cards) {
  const el = p.locator(`article.q:nth-of-type(${n})`).first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(120);
  await el.screenshot({ path: `${outDir}/card-${String(n).padStart(3, "0")}.png` });
  console.log(`card ${n} → ${outDir}/card-${String(n).padStart(3, "0")}.png`);
}
await b.close();
