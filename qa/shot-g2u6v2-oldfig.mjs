// 라스터로 교체하기 전에 쓰던 손코딩 SVG 그림을 다시 그려 본다(비교·복원 판단용).
// node qa/shot-g2u6v2-oldfig.mjs
import { build } from "esbuild";
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const r = await build({ entryPoints: ["qa/g2u6v2-pilot.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const F = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);

// e239가 라스터로 바뀌기 직전에 쓰던 호출 그대로(검산 A-2-1 반영본).
const svg = F.salivaSetupFig({
  tubes: [
    { label: "A", add: ["녹말 용액", "증류수"], result: "navy" },
    { label: "B", add: ["녹말 용액", "침 희석액"], result: "none" },
  ],
  hideResult: 0,
  temp: "두 관을 35 ℃ 물에 10분 담근 뒤 녹말이 남았는지 확인하는 용액을 넣음",
});

fs.mkdirSync("qa/shots", { recursive: true });
fs.mkdirSync("tmp", { recursive: true });
const file = path.resolve("tmp/old-e239.html");
fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><body style="margin:0;padding:16px;background:#fff"><div style="width:344px">${svg}</div></body>`);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 400, height: 400 }, deviceScaleFactor: 3 });
await page.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
await page.locator("svg").screenshot({ path: "qa/shots/g2u6v2-old-e239.png" });
console.log("SAVED qa/shots/g2u6v2-old-e239.png");
await browser.close();
