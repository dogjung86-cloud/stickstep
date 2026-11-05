// 직접 그린 만화 컷 렌더. PORT=<포트> node qa/shot-comic-tongs.mjs <출력.png> [쿼리] [배율] [x y w h]
// 전체 샷이면 같은 이름의 .svg·.webp(앱 만화 규격 960px)도 함께 저장한다.
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname } from "node:path";

const [out, query = "", scale = "2.4", x, y, w, h] = process.argv.slice(2);
mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 750 }, deviceScaleFactor: Number(scale) });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await page.goto(`http://localhost:${process.env.PORT || 5199}/qa-comic-tongs.html?${query}`, { waitUntil: "load" });
await page.waitForFunction(() => window.__done === true, null, { timeout: 60000 }).catch(() => errs.push("__done 시간 초과"));
await page.waitForTimeout(500);
const opts = x !== undefined ? { path: out, clip: { x: +x, y: +y, width: +w, height: +h } } : { path: out };
const png = await page.screenshot(opts);
let note = "";
if (x === undefined) {
  const svg = await page.evaluate(() => document.querySelector("#stage svg").outerHTML);
  writeFileSync(out.replace(/\.png$/, ".svg"), svg);
  const b64 = await page.evaluate(async (data) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = data; });
    const cv = document.createElement("canvas");
    cv.width = 960;
    cv.height = 720;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, 960, 720);
    return cv.toDataURL("image/webp", 0.9);
  }, `data:image/png;base64,${png.toString("base64")}`);
  const webp = out.replace(/\.png$/, ".webp");
  writeFileSync(webp, Buffer.from(b64.split(",")[1], "base64"));
  note = `png ${Math.round(statSync(out).size / 1024)}KB · svg ${Math.round(svg.length / 1024)}KB · webp960 ${Math.round(statSync(webp).size / 1024)}KB`;
}
await browser.close();
console.log("saved", out, note, errs.length ? `errors: ${errs.slice(0, 4).join(" | ")}` : "no errors");
