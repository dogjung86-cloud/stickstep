// 넓은 화면(태블릿 1180×760, PC 1600×900)에서 시작 화면(놀이 컷 도중, 정착 뒤)과 단원 지도를 찍는다. 개발 서버 필요: PORT=<포트> node qa/shot-wide-shell.mjs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const OUT = "../output/tablet-landscape/shell";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: "chrome", headless: true });
for (const [name, vp] of [["tablet", { width: 1180, height: 760 }], ["pc", { width: 1600, height: 900 }]]) {
  for (const wide of ["land"]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1.5 });
    await ctx.addInitScript((w) => {
      const s = JSON.parse(localStorage.getItem("science-app.v1") || "{}");
      s.onboarded = true;
      localStorage.setItem("science-app.v1", JSON.stringify(s));
    }, wide);
    const p = await ctx.newPage();
    await p.goto(`http://localhost:${process.env.PORT || 5621}/`, { waitUntil: "networkidle" });
    await p.waitForSelector("#sc-splash");
    if (wide === "land") {
      await sleep(650);
      await p.screenshot({ path: `${OUT}/${name}-new-0-play.png` }); // 놀이 컷이 넘어가는 중
    }
    await p.mouse.click(vp.width / 2, vp.height / 2); // 플립북 건너뛰기
    const btn = p.locator(".splash-foot button").first();
    await btn.waitFor({ state: "visible", timeout: 15000 });
    await sleep(1500);
    const tag = `${name}-${wide === "land" ? "new" : wide ? "wide" : "phone"}`;
    await p.screenshot({ path: `${OUT}/${tag}-1-splash.png` });
    await btn.click();
    await p.waitForSelector("#sc-home");
    await sleep(1800);
    await p.screenshot({ path: `${OUT}/${tag}-2-home.png` });
    console.log("shot", tag, "html.dt:", await p.evaluate(() => document.documentElement.classList.contains("dt")));
    await ctx.close();
  }
}
await b.close();
