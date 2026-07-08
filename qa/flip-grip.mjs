// grip.webp 좌우 반전(왼손처럼 읽힘 → 거울상 = 오른손). node qa/flip-grip.mjs
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "public/elec/figs/grip.webp";
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
