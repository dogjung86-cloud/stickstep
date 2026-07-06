// IV 단원 훅 장면 아트 스크린샷 — node qa/shot-u4art.mjs [출력경로]
// dev 서버(5173)가 떠 있어야 한다. 로컬 크롬(channel:'chrome')을 헤드리스로 띄운다.
import { chromium } from "playwright-core";

const out = process.argv[2] ?? "qa/u4art.png";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1240, height: 1500 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:5173/qa-u4art.html", { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__ready === true);
await page.waitForTimeout(5200); // 랩 자동 진행(잉크 확산·풍선 팽창·가열 곡선)이 자리 잡을 때까지
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log("SAVED", out);
