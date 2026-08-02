// g2u5 v2 시험 사진 눈검수 시트 — public/exam/g2u5(신규 발주) + public/plant(재사용)을 한 장에 모은다.
// 발주 조건 판정(설계표 §6-2의 "채점 기준이 되는 조건")은 이 시트를 눈으로 보고 한다.
// node qa/shot-g2u5-photos.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const DIRS = [["public/exam/g2u5", "exam/g2u5"], ["public/plant/figs", "plant/figs"], ["public/plant/labs", "plant/labs"]];
let cells = "";
for (const [dir, tag] of DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith(".webp"))) {
    const b64 = fs.readFileSync(path.join(dir, f)).toString("base64");
    cells += `<div style="border:1px solid #ccc;border-radius:8px;padding:6px;background:#fff">
      <div style="font:700 12px sans-serif;margin-bottom:4px">${tag}/${f}</div>
      <img src="data:image/webp;base64,${b64}" style="width:100%;display:block;border-radius:6px"></div>`;
  }
}
fs.mkdirSync("qa/shots", { recursive: true });
fs.mkdirSync("tmp/g2u5photo", { recursive: true });
const file = path.resolve("tmp/g2u5photo/page.html");
fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><body style="margin:0;padding:10px;background:#eee">
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${cells}</div></body>`);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1240, height: 800 }, deviceScaleFactor: 1.6 });
await page.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/shots/g2u5-photos.png", fullPage: true });
await browser.close();
console.log("SAVED qa/shots/g2u5-photos.png");
