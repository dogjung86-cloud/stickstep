// 넓은 화면(태블릿 가로 1180×760)에서 랩이 아닌 스텝(도입, 만화, 개념, 정리, 문제)을 찍는다. 개발 서버 필요: PORT=<포트> node qa/shot-wide-steps.mjs
// 둘째 값 "0"은 마이 탭 스위치를 끈 상태(폰 모양)로 같은 장면을 찍어 견준다.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const OUT = "../output/tablet-landscape/steps";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: "chrome", headless: true });
const kind = () => {
  const s = document.querySelector(".step");
  const has = (q) => !!s.querySelector(`:scope > ${q}`);
  if (s.classList.contains("bv-step")) return "lab";
  if (has(".opn-stage")) return "opener";
  if (has(".comic-panel")) return "comic";
  if (has(".opts")) return has(".q-figure") ? "quizfig" : "quiz";
  if (has(".rc-cards")) return "recap";
  if (has(".c-figure")) return "concept";
  return "other";
};
for (const [lesson, land] of [["u3l1", "c"], ["u3l3", "c"], ["u3l1", "0"], ["u3l3", "0"]]) {
  const ctx = await b.newContext({ viewport: { width: 1180, height: 760 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((off) => {
    const s = JSON.parse(localStorage.getItem("science-app.v1") || "{}");
    s.reviewMode = true;
    s.onboarded = true;
    s.wideOff = off;
    localStorage.setItem("science-app.v1", JSON.stringify(s));
  }, land === "0");
  const p = await ctx.newPage();
  await p.goto(`http://localhost:${process.env.PORT || 5621}/?open=${lesson}`, { waitUntil: "networkidle" });
  await p.waitForSelector(".lesson-screen");
  await p.addStyleTag({ content: ".snack{display:none!important}" });
  const tag = land === "0" ? "phone" : "c";
  const done = new Set();
  for (let i = 0; i < 40; i++) {
    await sleep(900);
    const t = await p.evaluate(kind);
    if (t !== "lab" && !done.has(t)) {
      done.add(t);
      await p.screenshot({ path: `${OUT}/${tag}-${lesson}-${t}.png` });
      const over = await p.evaluate(() => {
        const s = document.querySelector(".scroll");
        return s.scrollHeight - s.clientHeight;
      });
      console.log("shot", tag, lesson, t, "넘침:", over);
      if (t === "comic") {
        await p.locator(".footer .cta").click();
        await sleep(900);
        await p.screenshot({ path: `${OUT}/${tag}-${lesson}-comic2.png` });
      }
      if (t === "quiz" || t === "quizfig") {
        await p.locator('.opts .opt[data-oi="1"]').click();
        await sleep(300);
        await p.locator(".footer .cta").click();
        await sleep(1100);
        await p.screenshot({ path: `${OUT}/${tag}-${lesson}-${t}-sheet.png` });
      }
    }
    const f = p.locator(".xbtn.fwd");
    if (!(await f.isVisible())) break;
    await f.click();
  }
  await ctx.close();
}
await b.close();
