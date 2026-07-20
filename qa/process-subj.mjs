// 과목 허브 카드 스틱맨 발주 이미지 후처리 — public/brand/subj 하위 PNG를 512 정사각 WebP로(원본 삭제).
// process-avatars.mjs와 같은 방식(playwright 캔버스) — 공용 스크립트를 건드리지 않는 전용본.
// node qa/process-subj.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";

const DIR = "public/brand/subj";
if (!existsSync(DIR)) {
  console.error("public/brand/subj 없음 — 먼저 bash qa/order-subj.sh");
  process.exit(1);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

for (const f of readdirSync(DIR).filter((f) => f.endsWith(".png"))) {
  const b64 = readFileSync(`${DIR}/${f}`).toString("base64");
  const out = await page.evaluate(async ({ dataUrl }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 512;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 512, 512);
    ctx.drawImage(img, 0, 0, 512, 512);
    return cv.toDataURL("image/webp", 0.9);
  }, { dataUrl: `data:image/png;base64,${b64}` });
  const buf = Buffer.from(out.split(",")[1], "base64");
  writeFileSync(`${DIR}/${f.replace(/\.png$/, ".webp")}`, buf);
  unlinkSync(`${DIR}/${f}`);
  console.log("PROC", `${DIR}/${f.replace(/\.png$/, ".webp")}`, Math.round(buf.length / 1024) + "KB");
}
await browser.close();
console.log("DONE");
