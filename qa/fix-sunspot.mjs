// sunspot_hinode.jpg 후처리: CCD 세로 이음선 제거 + 타임스탬프 크롭 + 웜톤 컬러라이즈.
// node qa/fix-sunspot.mjs
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const src = "public/photos/sunspot_hinode.jpg";
const b64 = readFileSync(src).toString("base64");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const out = await page.evaluate(async (dataUrl) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
  const W = img.naturalWidth;            // 1024
  const cropH = Math.round(img.naturalHeight * 0.94); // 하단 타임스탬프 잘라내기
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = cropH;
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0);
  // 세로 이음선(중앙 ~x=W/2) — 좌우 이웃 열을 늘려 덮는다
  const seam = Math.round(W / 2) - 3;
  const band = 8;
  ctx.drawImage(cv, seam - 12, 0, 10, cropH, seam - 2, 0, band / 2 + 2, cropH);
  ctx.drawImage(cv, seam + band + 2, 0, 10, cropH, seam + band / 2 - 2, 0, band / 2 + 4, cropH);
  // 웜톤 컬러라이즈(회백 → 광구색)
  ctx.globalCompositeOperation = "color";
  ctx.fillStyle = "#F5A028";
  ctx.fillRect(0, 0, W, cropH);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "#FFD9A0";
  ctx.fillRect(0, 0, W, cropH);
  ctx.globalCompositeOperation = "source-over";
  return cv.toDataURL("image/jpeg", 0.88);
}, `data:image/jpeg;base64,${b64}`);
writeFileSync(src, Buffer.from(out.split(",")[1], "base64"));
await browser.close();
console.log("OK", src);
