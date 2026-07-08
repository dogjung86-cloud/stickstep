// 이미지 좌우 반전(거울상 = 손 좌↔우). node qa/flip-img.mjs <경로.webp>
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const SRC = process.argv[2];
if (!SRC) { console.error("usage: node qa/flip-img.mjs <path>"); process.exit(1); }
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const b64 = readFileSync(SRC).toString("base64");
const out = await page.evaluate(async (dataUrl) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
  const cv = document.createElement("canvas");
  cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const ctx = cv.getContext("2d");
  ctx.translate(cv.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);
  return cv.toDataURL("image/webp", 0.9);
}, `data:image/webp;base64,${b64}`);
writeFileSync(SRC, Buffer.from(out.split(",")[1], "base64"));
await browser.close();
console.log("FLIPPED", SRC);
