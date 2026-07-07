// 로딩 플립북 v2 + 증류탑 일러스트 후처리 — 512px 리사이즈 + WebP 변환(원본 png 삭제).
// node qa/process-loading2.mjs  (app 루트에서, dev 의존성 playwright-core 사용)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";

const TARGETS = [
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => ({ png: `public/brand/loading/${i}.png`, webp: `public/brand/loading/${i}.webp` })),
  { png: "public/brand/study.png", webp: "public/brand/study.webp" },
  ...["lpg", "gasoline", "kerosene", "diesel", "heavy", "asphalt"].map((k) => ({
    png: `public/chem/tower/${k}.png`,
    webp: `public/chem/tower/${k}.webp`,
  })),
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
for (const t of TARGETS) {
  if (!existsSync(t.png)) {
    console.log("SKIP(없음)", t.png);
    continue;
  }
  const b64 = readFileSync(t.png).toString("base64");
  const out = await page.evaluate(async (dataUrl) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const S = 512;
    const cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#fff"; // 흰 배경 유지(스틱맨·일러스트 모두 흰 바탕 기준)
    ctx.fillRect(0, 0, S, S);
    ctx.drawImage(img, 0, 0, S, S);
    return cv.toDataURL("image/webp", 0.9);
  }, `data:image/png;base64,${b64}`);
  const buf = Buffer.from(out.split(",")[1], "base64");
  writeFileSync(t.webp, buf);
  unlinkSync(t.png);
  console.log("PROC", t.webp, Math.round(buf.length / 1024) + "KB");
}
await browser.close();
console.log("DONE");
