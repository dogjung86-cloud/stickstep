// h1u4 발주분 전용 변환 — public/his/cuts/u4l*.png + public/comics/h1u4l{3,4,8}/*.png → webp(원본 삭제).
// 전량 스크립트(process-geo·process-comics)는 동시 세션의 미검수 png까지 삼킬 수 있어 자기 배치
// 스코프로만 변환한다(사회 Ⅵ process-soc6-only 관행). 비율 유지 최대폭 960 · 품질 0.9(ASPECT 표준).
// node qa/process-his4-only.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";

const TARGETS = [
  { dir: "public/his/cuts", match: /^u4l\d+\.png$/ },
  { dir: "public/comics/h1u4l3", match: /\.png$/ },
  { dir: "public/comics/h1u4l4", match: /\.png$/ },
  { dir: "public/comics/h1u4l8", match: /\.png$/ },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
let n = 0;
for (const t of TARGETS) {
  if (!existsSync(t.dir)) continue;
  for (const f of readdirSync(t.dir).filter((f) => t.match.test(f))) {
    const src = join(t.dir, f);
    const b64 = readFileSync(src).toString("base64");
    const out = await page.evaluate(async (dataUrl) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
      const scale = Math.min(1, 960 / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      const ctx = cv.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      return cv.toDataURL("image/webp", 0.9);
    }, `data:image/png;base64,${b64}`);
    const buf = Buffer.from(out.split(",")[1], "base64");
    writeFileSync(src.replace(/\.png$/, ".webp"), buf);
    unlinkSync(src);
    n += 1;
    console.log("PROC", src.replace(/\.png$/, ".webp"), Math.round(buf.length / 1024) + "KB");
  }
}
await browser.close();
console.log(`DONE ${n} files`);
