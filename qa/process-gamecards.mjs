// 도전 탭 게임 카드 키 비주얼 후처리 — public/game/cards 하위 PNG를 720×480(3:2) WebP로(원본 삭제).
// process-subj.mjs와 같은 방식(playwright 캔버스) — 다크 카드라 여백 채움색도 무대 톤 #0B1524.
// node qa/process-gamecards.mjs  (app 루트에서)
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";

const DIR = "public/game/cards";
if (!existsSync(DIR)) {
  console.error("public/game/cards 없음 — 먼저 bash qa/order-gamecards.sh");
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
    cv.width = 720; cv.height = 480;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#0B1524";
    ctx.fillRect(0, 0, 720, 480);
    // cover 크롭 — 발주 원본이 3:2(1536×1024)면 무크롭, 다른 비율이 와도 중앙을 지킨다
    const s = Math.max(720 / img.width, 480 / img.height);
    const w = img.width * s;
    const h = img.height * s;
    ctx.drawImage(img, (720 - w) / 2, (480 - h) / 2, w, h);
    return cv.toDataURL("image/webp", 0.86);
  }, { dataUrl: `data:image/png;base64,${b64}` });
  const buf = Buffer.from(out.split(",")[1], "base64");
  writeFileSync(`${DIR}/${f.replace(/\.png$/, ".webp")}`, buf);
  unlinkSync(`${DIR}/${f}`);
  console.log("PROC", `${DIR}/${f.replace(/\.png$/, ".webp")}`, Math.round(buf.length / 1024) + "KB");
}
await browser.close();
console.log("DONE");
