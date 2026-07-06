// 애니메이션 GIF 첫 프레임 → JPEG. node gif-frame.mjs <in.gif> <out.jpg> [scale]
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const [inPath, outPath, scaleArg] = process.argv.slice(2);
const scale = Number(scaleArg ?? "1");
const b64 = readFileSync(inPath).toString("base64");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const dataUrl = `data:image/gif;base64,${b64}`;
const out = await page.evaluate(async ({ dataUrl, scale }) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
  const cv = document.createElement("canvas");
  cv.width = Math.round(img.naturalWidth * scale);
  cv.height = Math.round(img.naturalHeight * scale);
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0, cv.width, cv.height);
  return cv.toDataURL("image/jpeg", 0.9);
}, { dataUrl, scale });
writeFileSync(outPath, Buffer.from(out.split(",")[1], "base64"));
await browser.close();
console.log("SAVED", outPath);
