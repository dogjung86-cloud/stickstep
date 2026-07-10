// 앱 아이콘/파비콘 재생성: public/brand/study.webp("공부하자!" 머리띠 스틱맨)의 라인아트를
// 흰색으로 반전·두께 보정해 브랜드 블루 라운드 사각(512)에 합성 → public/brand/icon.png 덮어쓰기.
// 실행: node qa/make-icon.mjs  (dev 서버 불필요, 시스템 Chrome 필요)
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(REPO, "public/brand/study.webp");
const OUT = path.join(REPO, "public/brand/icon.png");

const srcDataUrl = "data:image/webp;base64," + fs.readFileSync(SRC).toString("base64");

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
await page.goto("about:blank");

const dataUrl = await page.evaluate(async (srcDataUrl) => {
  const img = new Image();
  img.src = srcDataUrl;
  await img.decode();

  // 1) 크롭(머리+주먹+매듭 — 책상 모서리 선(원본 y≈390~)은 제외) → 흰 라인 추출
  const crop = { x: 22, y: 12, w: 474, h: 360 };
  const line = document.createElement("canvas");
  line.width = crop.w;
  line.height = crop.h;
  const lc = line.getContext("2d", { willReadFrequently: true });
  lc.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
  const d = lc.getImageData(0, 0, crop.w, crop.h);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const lum = (p[i] + p[i + 1] + p[i + 2]) / 3;
    let a = (1 - lum / 255) * 1.45;
    a = a < 0.07 ? 0 : Math.min(1, a);
    p[i] = p[i + 1] = p[i + 2] = 255;
    p[i + 3] = Math.round(a * 255);
  }
  lc.putImageData(d, 0, 0);

  // 2) 선 두께 보정(8방향 오프셋 겹치기 = 간이 팽창 — 파비콘 크기 가독성)
  const fat = document.createElement("canvas");
  fat.width = crop.w;
  fat.height = crop.h;
  const fc = fat.getContext("2d");
  const offs = [[0, 0], [2.0, 0], [-2.0, 0], [0, 2.0], [0, -2.0], [1.4, 1.4], [-1.4, 1.4], [1.4, -1.4], [-1.4, -1.4]];
  for (const [ox, oy] of offs) fc.drawImage(line, ox, oy);

  // 3) 합성: 브랜드 블루 라운드 사각 그라데이션 + 좌상단 키라이트 + 아트(폭 91%)
  const S = 512;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const c = cv.getContext("2d");
  c.beginPath();
  c.roundRect(0, 0, S, S, 116);
  const g = c.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, "#54A0F7");
  g.addColorStop(0.52, "#3182F6");
  g.addColorStop(1, "#2068DF");
  c.fillStyle = g;
  c.fill();
  const hl = c.createRadialGradient(S * 0.24, S * 0.16, 10, S * 0.24, S * 0.16, S * 0.9);
  hl.addColorStop(0, "rgba(255,255,255,.14)");
  hl.addColorStop(0.5, "rgba(255,255,255,.03)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  c.save();
  c.clip();
  c.fillStyle = hl;
  c.fillRect(0, 0, S, S);
  const aw = 466;
  const ah = aw * (crop.h / crop.w);
  c.drawImage(fat, (S - aw) / 2, (S - ah) / 2 - 4, aw, ah);
  c.restore();
  return cv.toDataURL("image/png");
}, srcDataUrl);

fs.writeFileSync(OUT, Buffer.from(dataUrl.split(",")[1], "base64"));
console.log("saved:", OUT);
await browser.close();
