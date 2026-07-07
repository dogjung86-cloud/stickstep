// 지질 발주 이미지 후처리 — public/geo 하위 PNG를 WebP로(원본 삭제).
//   rocks/minerals/evid → 512 정사각. drift/figs → 비율 유지(최대폭 960).
// node qa/process-geo.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";

const SQUARE_DIRS = ["public/geo/rocks", "public/geo/minerals", "public/geo/evid"];
const ASPECT_DIRS = ["public/geo/drift", "public/geo/figs", "public/recap"];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

async function convert(dir, f, aspect) {
  const b64 = readFileSync(`${dir}/${f}`).toString("base64");
  const out = await page.evaluate(async ({ dataUrl, keepAspect }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    let w = 512, h = 512;
    if (keepAspect) {
      const scale = Math.min(1, 960 / img.naturalWidth);
      w = Math.round(img.naturalWidth * scale);
      h = Math.round(img.naturalHeight * scale);
    }
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return cv.toDataURL("image/webp", 0.88);
  }, { dataUrl: `data:image/png;base64,${b64}`, keepAspect: aspect });
  const buf = Buffer.from(out.split(",")[1], "base64");
  writeFileSync(`${dir}/${f.replace(/\.png$/, ".webp")}`, buf);
  unlinkSync(`${dir}/${f}`);
  console.log("PROC", `${dir}/${f.replace(/\.png$/, ".webp")}`, Math.round(buf.length / 1024) + "KB");
}

for (const dir of SQUARE_DIRS) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".png"))) await convert(dir, f, false);
}
for (const dir of ASPECT_DIRS) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".png"))) await convert(dir, f, true);
}
await browser.close();
console.log("DONE");
