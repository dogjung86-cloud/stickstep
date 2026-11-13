// 넓은 화면 단원 지도의 동작 확인: 단원 바꾸기, 지도만 스크롤, 걷기 연출, 이어서 하기. PORT=5621 node qa/check-wide-home.mjs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const OUT = "../output/tablet-landscape/final/shell";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await b.newContext({ viewport: { width: 1180, height: 760 }, deviceScaleFactor: 1.5 });
await ctx.addInitScript(() => {
  const s = JSON.parse(localStorage.getItem("science-app.v1") || "{}");
  s.onboarded = true;
  s.reviewMode = true;
  localStorage.setItem("science-app.v1", JSON.stringify(s));
});
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
await p.goto(`http://localhost:${process.env.PORT || 5621}/#/home`, { waitUntil: "networkidle" });
await p.addStyleTag({ content: ".snack{display:none!important}" });
await sleep(1200);
const info = () =>
  p.evaluate(() => {
    const m = document.querySelector("#sc-home .map-swap");
    const sc = document.querySelector("#sc-home .scroll");
    return {
      단원카드: document.querySelector(".ucard.on .ub-title")?.textContent,
      첫레슨: document.querySelector(".gm-node .gm-label")?.textContent,
      노드수: document.querySelectorAll(".gm-node").length,
      지도스크롤: Math.round(m.scrollTop),
      지도넘침: m.scrollHeight - m.clientHeight,
      바깥스크롤: Math.round(sc.scrollTop),
      이어서: document.querySelector(".home-rail .hr-card:last-child .hr-v")?.textContent,
    };
  });
console.log("처음", JSON.stringify(await info()));
await p.locator(".unit-tab").nth(2).click();
await sleep(1200);
console.log("Ⅲ단원 누름", JSON.stringify(await info()));
await p.screenshot({ path: `${OUT}/check-home-1-unit3.png` });
// 지도 안에서만 스크롤
await p.locator("#sc-home .map-swap").hover();
await p.mouse.wheel(0, 500);
await sleep(600);
console.log("지도 위에서 휠", JSON.stringify(await info()));
// 걷기 연출(레슨 u3l3을 방금 끝내고 돌아온 것처럼)
await p.evaluate(() => window.__walkHome("u3l3"));
await sleep(900);
await p.addStyleTag({ content: ".snack{display:none!important}" });
await p.screenshot({ path: `${OUT}/check-home-2-walking.png` });
await sleep(2600);
console.log("걷기 뒤", JSON.stringify(await info()));
await p.screenshot({ path: `${OUT}/check-home-3-walked.png` });
// 이어서 하기 → 레슨이 열리는지
await p.locator(".home-rail .hr-btn").last().click();
await sleep(1500);
console.log("이어서 하기 뒤 화면:", await p.evaluate(() => document.querySelector(".screen.active")?.className));
console.log("페이지 오류:", errors.length ? errors : "없음");
await b.close();
