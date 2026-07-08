// 별과 우주 실사 후처리 — public/photos/star/*.jpg → 최대 1400px webp(원본 jpg 삭제).
// NASA/ESO 원본은 수십 MB라 웹 크기로 줄인다(비율 유지, 확대 금지).
// node qa/process-star.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";

const DIR = "public/photos/star";
const MAX = 1400;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

for (const f of readdirSync(DIR).filter((f) => f.endsWith(".jpg"))) {
  const b64 = readFileSync(`${DIR}/${f}`).toString("base64");
  const out = await page.evaluate(async ({ dataUrl, max }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    return { data: cv.toDataURL("image/webp", 0.86), w, h };
  }, { dataUrl: `data:image/jpeg;base64,${b64}`, max: MAX });
  const buf = Buffer.from(out.data.split(",")[1], "base64");
  writeFileSync(`${DIR}/${f.replace(/\.jpg$/, ".webp")}`, buf);
  unlinkSync(`${DIR}/${f}`);
  console.log("PROC", f.replace(/\.jpg$/, ".webp"), `${out.w}x${out.h}`, Math.round(buf.length / 1024) + "KB");
}
await browser.close();
console.log("DONE");
