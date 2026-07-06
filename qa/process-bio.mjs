// 생물 아이콘 후처리 — 256px 리사이즈 + 흰 배경 제거(투명) + WebP. node qa/process-bio.mjs
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";

const dir = "public/bio";
const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
for (const f of files) {
  const b64 = readFileSync(`${dir}/${f}`).toString("base64");
  const out = await page.evaluate(async (dataUrl) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const S = 256;
    const cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    // 흰 배경 유지(투명 처리하면 밝은 깃털·뺨에 구멍이 남). CSS에서 라운드 배경으로 녹인다.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, S, S);
    ctx.drawImage(img, 0, 0, S, S);
    return cv.toDataURL("image/webp", 0.92);
  }, `data:image/png;base64,${b64}`);
  const outName = f.replace(/\.png$/, ".webp");
  writeFileSync(`${dir}/${outName}`, Buffer.from(out.split(",")[1], "base64"));
  unlinkSync(`${dir}/${f}`);
  console.log("PROC", outName, Buffer.from(out.split(",")[1], "base64").length + "B");
}
await browser.close();
console.log("DONE");
