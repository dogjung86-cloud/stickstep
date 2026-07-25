// 세포 3종 그림 교체 — 구작 발주본 exam/u2/cell-roles-triptych.webp(1200×600, 3연폭)을
// 세 장으로 잘라 public/bio3/figs/cell-{nerve,rbc,epithelial}.webp로 저장한다.
// 사유(실사용 피드백 2026-07-26): 현미경 사진풍 발주본은 카드 크기로 줄이면 형태가 안 읽힌다.
// 이 도해본은 축삭·오목 원반·빈틈없는 배열이 작게 봐도 구분돼 학습 목적에 맞다.
// node qa/crop-celltypes.mjs
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "public/exam/u2/cell-roles-triptych.webp";
// [x0, x1] 잘라낼 가로 구간(원본 1200 기준). 세로는 각 패널의 피사체 범위로 함께 자른다.
const PANELS = [
  { name: "cell-nerve", x0: 10, x1: 415, y0: 30, y1: 570 },
  { name: "cell-rbc", x0: 428, x1: 755, y0: 95, y1: 495 },
  { name: "cell-epithelial", x0: 745, x1: 1195, y0: 115, y1: 505 },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const b64 = readFileSync(SRC).toString("base64");

for (const p of PANELS) {
  const out = await page.evaluate(async ({ dataUrl, panel }) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const w = panel.x1 - panel.x0;
    const h = panel.y1 - panel.y0;
    // 정사각 캔버스에 여백을 남겨 담는다 — 3장이 같은 비율이어야 카드가 가지런하다.
    const side = Math.max(w, h);
    const cv = document.createElement("canvas");
    cv.width = side; cv.height = side;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#FBF6EC"; // 원본 배경색과 맞춰 이어 붙은 티가 안 나게
    ctx.fillRect(0, 0, side, side);
    ctx.drawImage(img, panel.x0, panel.y0, w, h, (side - w) / 2, (side - h) / 2, w, h);
    return cv.toDataURL("image/webp", 0.92);
  }, { dataUrl: `data:image/webp;base64,${b64}`, panel: p });
  const buf = Buffer.from(out.split(",")[1], "base64");
  writeFileSync(`public/bio3/figs/${p.name}.webp`, buf);
  console.log("CROP", p.name, Math.round(buf.length / 1024) + "KB");
}
await browser.close();
console.log("DONE");
