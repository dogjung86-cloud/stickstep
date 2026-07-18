// 역사 유물 실사 후처리 — public/photos/his/*.jpg|png → 최대 1200px webp(원본 삭제).
// process-star.mjs 문법(Chrome 캔버스 변환 — 비율 유지, 확대 금지).
// node qa/process-his.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";

const DIR = "public/photos/his";
const MAX = 1200;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

for (const f of readdirSync(DIR).filter((f) => /\.(jpg|png)$/.test(f))) {
  const b64 = readFileSync(`${DIR}/${f}`).toString("base64");
  const mime = f.endsWith(".png") ? "image/png" : "image/jpeg";
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
    // 유물 사진은 흰 카드 위에 뜬다 — png 투명 배경은 흰색으로 깔아 검정 뭉개짐을 막는다
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return { data: cv.toDataURL("image/webp", 0.86), w, h };
  }, { dataUrl: `data:${mime};base64,${b64}`, max: MAX });
  const buf = Buffer.from(out.data.split(",")[1], "base64");
  writeFileSync(`${DIR}/${f.replace(/\.(jpg|png)$/, ".webp")}`, buf);
  unlinkSync(`${DIR}/${f}`);
  console.log("PROC", f.replace(/\.(jpg|png)$/, ".webp"), `${out.w}x${out.h}`, Math.round(buf.length / 1024) + "KB");
}
await browser.close();
console.log("DONE");
