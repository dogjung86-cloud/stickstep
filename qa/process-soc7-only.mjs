// 사회 Ⅶ 발주분 전용 webp 변환 — process-geo.mjs의 스코프판(soc/cuts u7l*.png + comics/s1u7l4만).
// 전량 변환(process-geo)은 동시 세션의 미검수 png까지 삭제·변환해 개입하게 되므로,
// 동시 작업 중에는 자기 배치 파일만 집어 변환한다(병렬 세션 충돌 0 원칙 — soc6 관행).
// node qa/process-soc7-only.mjs
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";
import { chromium } from "playwright-core";

const JOBS = [
  { dir: "public/soc/cuts", match: (f) => /^u7l\d+\.png$/.test(f) },
  { dir: "public/comics/s1u7l4", match: (f) => f.endsWith(".png") },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();

async function convert(dir, f) {
  const b64 = readFileSync(`${dir}/${f}`).toString("base64");
  const out = await page.evaluate(async ({ dataUrl }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const maxW = 960;
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return { data: cv.toDataURL("image/webp", 0.9), w, h };
  }, { dataUrl: `data:image/png;base64,${b64}` });
  const webp = Buffer.from(out.data.split(",")[1], "base64");
  writeFileSync(`${dir}/${f.replace(/\.png$/, ".webp")}`, webp);
  unlinkSync(`${dir}/${f}`);
  console.log(`OK ${dir}/${f} → webp ${out.w}x${out.h} ${Math.round(webp.length / 1024)}KB`);
}

for (const { dir, match } of JOBS) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter(match)) await convert(dir, f);
}
await browser.close();
console.log("DONE");
