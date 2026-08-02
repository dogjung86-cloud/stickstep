// 발주 도해의 특정 영역을 확대하고 2% 격자를 얹어 캡처한다 — 가지 분기점처럼 좁은 지점의
// 좌표를 실측하기 위한 도구(10% 격자로는 못 읽는 자리용).
// node qa/shot-g2u5fig-zoom.mjs <파일명> <x0> <y0> <x1> <y1>   (좌표는 % · 예: plant-vessels.webp 44 34 74 52)
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const [file, x0, y0, x1, y1] = process.argv.slice(2);
const X0 = Number(x0), Y0 = Number(y0), X1 = Number(x1), Y1 = Number(y1);
const b64 = fs.readFileSync(path.join("public/exam/g2u5fig", file)).toString("base64");
const BOXW = 1000;
const scale = 100 / (X1 - X0);           // 잘라 낼 영역이 BOXW를 채우도록
const imgW = BOXW * scale;

let lines = "";
for (let v = Math.ceil(X0 / 2) * 2; v <= X1; v += 2) {
  const left = ((v - X0) / (X1 - X0)) * 100;
  lines += `<div style="position:absolute;left:${left}%;top:0;bottom:0;width:1px;background:rgba(220,0,0,.6)"></div>
    <div style="position:absolute;left:${left}%;top:2px;font:700 12px sans-serif;color:#c00;transform:translateX(2px)">${v}</div>`;
}
for (let h = Math.ceil(Y0 / 2) * 2; h <= Y1; h += 2) {
  const top = ((h - Y0) / (Y1 - Y0)) * 100;
  lines += `<div style="position:absolute;top:${top}%;left:0;right:0;height:1px;background:rgba(0,80,220,.6)"></div>
    <div style="position:absolute;top:${top}%;left:2px;font:700 12px sans-serif;color:#04c;transform:translateY(-2px)">${h}</div>`;
}
const boxH = BOXW * ((Y1 - Y0) / (X1 - X0)) * (4 / 3);   // 3:4 원본 기준 세로 보정
const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fff">
  <div style="position:relative;width:${BOXW}px;height:${Math.round(boxH)}px;overflow:hidden">
    <img src="data:image/webp;base64,${b64}" style="position:absolute;width:${imgW}px;left:${-X0 * imgW / 100}px;top:${-Y0 * (imgW * 4 / 3) / 100}px">
    ${lines}
  </div></body>`;
fs.mkdirSync("tmp/g2u5fig", { recursive: true });
const p = path.resolve("tmp/g2u5fig/zoom.html");
fs.writeFileSync(p, html);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1020, height: Math.round(boxH) + 20 }, deviceScaleFactor: 1.5 });
await page.goto(`file:///${p.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await page.screenshot({ path: "qa/shots/g2u5fig-zoom.png", fullPage: true });
await browser.close();
console.log(`SAVED qa/shots/g2u5fig-zoom.png (${file} · x ${X0}~${X1}% · y ${Y0}~${Y1}%)`);
