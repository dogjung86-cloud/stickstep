// 브랜드 PNG 웹용 축소 — node qa/resize-brand.mjs
// 로딩 프레임·공부 포즈 → 512px, 아이콘 → 512px(파비콘 겸용). 원본 덮어쓰기.
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const TARGETS = [
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => ({ p: `public/brand/loading/${i}.png`, size: 512 })),
  { p: "public/brand/study.png", size: 512 },
  { p: "public/brand/icon.png", size: 512 },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
for (const t of TARGETS) {
  const b64 = readFileSync(t.p).toString("base64");
  const out = await page.evaluate(async ({ dataUrl, size }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const cv = document.createElement("canvas");
    cv.width = size; cv.height = size;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, size, size);
    return cv.toDataURL("image/png");
  }, { dataUrl: `data:image/png;base64,${b64}`, size: t.size });
  writeFileSync(t.p, Buffer.from(out.split(",")[1], "base64"));
  console.log("RESIZED", t.p);
}
await browser.close();
console.log("DONE");
