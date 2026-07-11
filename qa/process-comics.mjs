// 만화 컷 후처리 — public/comics 하위 레슨 폴더의 PNG를 WebP로(원본 삭제).
//   비율 유지 최대폭 960, 품질 0.9 (process-geo.mjs ASPECT 표준과 동일).
//   avatar/는 제외(스플래시 폴백이 .png 경로를 참조 + 총 128KB라 이득 없음).
//   발주 원본(컷당 0.8~3MB)이 webp 미변환으로 98MB까지 커진 것을 정리한 2026-07 작업 —
//   새 만화 발주 후에도 이 스크립트를 돌리고, 콘텐츠 img 경로는 .webp로 저작한다.
// node qa/process-comics.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "public/comics";
const SKIP = new Set(["avatar"]);

const dirs = readdirSync(ROOT).filter((d) => !SKIP.has(d) && statSync(join(ROOT, d)).isDirectory());
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

let inTotal = 0, outTotal = 0, n = 0;
for (const d of dirs) {
  const dir = join(ROOT, d);
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".png"))) {
    const src = join(dir, f);
    const b64 = readFileSync(src).toString("base64");
    const out = await page.evaluate(async ({ dataUrl }) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
      const scale = Math.min(1, 960 / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      const ctx = cv.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      return cv.toDataURL("image/webp", 0.9);
    }, { dataUrl: `data:image/png;base64,${b64}` });
    const buf = Buffer.from(out.split(",")[1], "base64");
    if (buf.length < 1024) throw new Error(`변환 결과가 비정상적으로 작음: ${src}`);
    const dst = src.replace(/\.png$/, ".webp");
    inTotal += statSync(src).size; outTotal += buf.length; n += 1;
    writeFileSync(dst, buf);
    unlinkSync(src);
    console.log("PROC", dst, Math.round(buf.length / 1024) + "KB");
  }
}
await browser.close();
console.log(`DONE ${n}컷: ${(inTotal / 1048576).toFixed(1)}MB → ${(outTotal / 1048576).toFixed(1)}MB`);
