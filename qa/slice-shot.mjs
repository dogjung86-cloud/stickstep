// 긴 스크린샷을 세로 N조각으로 잘라 저장(눈검수 확대용). node qa/slice-shot.mjs <png> <조각수>
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const [src, nStr] = process.argv.slice(2);
const n = Number(nStr || 6);
const b64 = readFileSync(src).toString("base64");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const parts = await page.evaluate(async ({ dataUrl, n }) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
  const sliceH = Math.ceil(img.naturalHeight / n);
  const out = [];
  for (let i = 0; i < n; i++) {
    const h = Math.min(sliceH, img.naturalHeight - i * sliceH);
    const cv = document.createElement("canvas");
    cv.width = img.naturalWidth; cv.height = h;
    cv.getContext("2d").drawImage(img, 0, i * sliceH, img.naturalWidth, h, 0, 0, img.naturalWidth, h);
    out.push(cv.toDataURL("image/png"));
  }
  return out;
}, { dataUrl: `data:image/png;base64,${b64}`, n });
parts.forEach((p, i) => {
  const f = src.replace(/\.png$/, `-part${i + 1}.png`);
  writeFileSync(f, Buffer.from(p.split(",")[1], "base64"));
  console.log("SAVED", f);
});
await browser.close();
