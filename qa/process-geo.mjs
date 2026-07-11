// 지질 발주 이미지 후처리 — public/geo 하위 PNG를 WebP로(원본 삭제).
//   rocks/minerals/evid → 512 정사각. drift/figs → 비율 유지(최대폭 960).
// node qa/process-geo.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";

const SQUARE_DIRS = ["public/geo/rocks", "public/geo/minerals", "public/geo/evid", "public/light/quiz", "public/atom/hook", "public/elec/hook", "public/exam/u4", "public/exam/u5", "public/exam/u6", "public/exam/u7", "public/exam/g2u1", "public/exam/g2u2"];
const ASPECT_DIRS = ["public/geo/drift", "public/geo/figs", "public/recap", "public/bio2/cells", "public/bio2/quiz", "public/atom/quiz", "public/elec/figs", "public/elec/cuts", "public/bio2/cuts", "public/chem/cuts", "public/geo/cuts", "public/atom/cuts", "public/star/cuts", "public/math/cuts", "public/math2/cuts"];
// 투명 배경(누끼) 보존 — 흰 배경을 깔지 않고 알파를 그대로 webp로. 구성단계 개체 아트 등.
const TRANSPARENT_DIRS = ["public/bio2/levels"];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

async function convert(dir, f, aspect, transparent) {
  const b64 = readFileSync(`${dir}/${f}`).toString("base64");
  const out = await page.evaluate(async ({ dataUrl, keepAspect, keepAlpha }) => {
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
    if (!keepAlpha) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(img, 0, 0, w, h);
    return cv.toDataURL("image/webp", 0.9);
  }, { dataUrl: `data:image/png;base64,${b64}`, keepAspect: aspect, keepAlpha: transparent });
  const buf = Buffer.from(out.split(",")[1], "base64");
  writeFileSync(`${dir}/${f.replace(/\.png$/, ".webp")}`, buf);
  unlinkSync(`${dir}/${f}`);
  console.log("PROC", `${dir}/${f.replace(/\.png$/, ".webp")}`, Math.round(buf.length / 1024) + "KB");
}

for (const dir of SQUARE_DIRS) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".png"))) await convert(dir, f, false, false);
}
for (const dir of ASPECT_DIRS) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".png"))) await convert(dir, f, true, false);
}
for (const dir of TRANSPARENT_DIRS) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".png"))) await convert(dir, f, true, true);
}
await browser.close();
console.log("DONE");
