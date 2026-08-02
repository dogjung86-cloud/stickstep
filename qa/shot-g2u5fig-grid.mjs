// 발주 도해 베이스 위에 10% 격자와 눈금을 얹어 캡처한다 — 오버레이(기호·화살표) 좌표를 눈대중하지
// 않고 원본 픽셀 비율로 실측하기 위한 도구(u7 v2 "사진 위 콜아웃 좌표는 어림 금지" 관행).
// node qa/shot-g2u5fig-grid.mjs [파일명...]
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const DIR = "public/exam/g2u5fig";
const files = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(DIR).filter((f) => f.endsWith(".webp"));
fs.mkdirSync("qa/shots", { recursive: true });
fs.mkdirSync("tmp/g2u5fig", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const f of files) {
  const b64 = fs.readFileSync(path.join(DIR, f)).toString("base64");
  let lines = "";
  for (let i = 1; i < 10; i++) {
    lines += `<div style="position:absolute;left:${i * 10}%;top:0;bottom:0;width:1px;background:rgba(220,0,0,.55)"></div>
      <div style="position:absolute;top:${i * 10}%;left:0;right:0;height:1px;background:rgba(0,80,220,.55)"></div>
      <div style="position:absolute;left:${i * 10}%;top:2px;font:700 13px sans-serif;color:#c00;transform:translateX(2px)">${i * 10}</div>
      <div style="position:absolute;top:${i * 10}%;left:2px;font:700 13px sans-serif;color:#04c;transform:translateY(-2px)">${i * 10}</div>`;
  }
  const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fff">
    <div style="position:relative;width:900px">
      <img src="data:image/webp;base64,${b64}" style="width:100%;display:block">${lines}
    </div></body>`;
  const p = path.resolve(`tmp/g2u5fig/${f}.html`);
  fs.writeFileSync(p, html);
  const page = await browser.newPage({ viewport: { width: 920, height: 900 }, deviceScaleFactor: 1.6 });
  await page.goto(`file:///${p.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `qa/shots/g2u5fig-${f.replace(".webp", "")}-grid.png`, fullPage: true });
  await page.close();
  console.log(`SAVED qa/shots/g2u5fig-${f.replace(".webp", "")}-grid.png`);
}
await browser.close();
