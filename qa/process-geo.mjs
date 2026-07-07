// 지질 발주 이미지 후처리 — public/geo/{rocks,minerals,evid}의 PNG를 512px WebP로(원본 삭제).
// node qa/process-geo.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";

const DIRS = ["public/geo/rocks", "public/geo/minerals", "public/geo/evid"];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
for (const dir of DIRS) {
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
  for (const f of files) {
    const b64 = readFileSync(`${dir}/${f}`).toString("base64");
    const out = await page.evaluate(async (dataUrl) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
      const S = 512;
      const cv = document.createElement("canvas");
      cv.width = S; cv.height = S;
      const ctx = cv.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, S, S);
      ctx.drawImage(img, 0, 0, S, S);
      return cv.toDataURL("image/webp", 0.9);
    }, `data:image/png;base64,${b64}`);
    const buf = Buffer.from(out.split(",")[1], "base64");
    writeFileSync(`${dir}/${f.replace(/\.png$/, ".webp")}`, buf);
    unlinkSync(`${dir}/${f}`);
    console.log("PROC", `${dir}/${f.replace(/\.png$/, ".webp")}`, Math.round(buf.length / 1024) + "KB");
  }
}
await browser.close();
console.log("DONE");
