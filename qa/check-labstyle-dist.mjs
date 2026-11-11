// 랩의 다른 느낌 샘플: 빌드한 번들 검사(개발 서버에서는 보이지 않는 것을 본다).
//   ① 아무 표식 없이 열면 세 랩 모두 정본이고, 세션에 아무것도 남지 않는다
//   ② 주소 ?u2style 로 열면 세 랩이 샘플로 뜬다(스티커 그림이 뜨고, 손그림 조각이 들어 있고, 입체 모형이 준비된다)
//   ③ ?u2style=0 으로 다시 열면 꺼진다
//   ④ 빌드에는 견주어 보는 화면(qa-labstyle.html)과 그 화면이 쓰는 문(__u2styleOpen)이 없다
//   npm run build 뒤 미리보기(u2-labstyle-dist-4567)를 띄우고:  PPORT=4567 node qa/check-labstyle-dist.mjs
// 레슨은 실제 화면을 눌러 연다(스플래시 → 둘러보기 → 지도 → 레슨 → 검토 모드의 앞으로 가기).
import { chromium } from "playwright-core";

const BASE = (process.env.BASE || `http://localhost:${process.env.PPORT || "4567"}`).replace(/\/$/, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });
let PASS = 0;
let FAIL = 0;
const ok = (cond, label) => {
  if (cond) PASS++;
  else FAIL++;
  console.log(cond ? "  ✓" : "  ✗", label);
};
const A = ".screen.active";
const W = (page, ms) => page.waitForTimeout(ms);
/** 샘플 셋: 지도에서의 레슨 차례(0부터), 스텝 차례, 켜졌을 때의 클래스, 정본의 무대 클래스 */
const SAMPLES = [
  { name: "종이 콜라주", li: 7, si: 1, cls: "ls-collage", base: "knl-stage" },
  { name: "손그림 공책", li: 6, si: 2, cls: "ls-sketch", base: "bki-stage" },
  { name: "입체 모형", li: 1, si: 2, cls: "ls-model", base: "cwk-stage" },
];

async function newContext() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
      lastUnits: { "sci:g1": "u2" },
    }));
  });
  return { ctx, page, errors };
}
async function boot(page, query = "") {
  await page.goto(`${BASE}/${query}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#sc-splash", { timeout: 15000 });
  await W(page, 500);
  await page.mouse.click(195, 300);
  const browse = page.locator("button", { hasText: "한번 둘러보기" }).first();
  await browse.waitFor({ state: "visible", timeout: 10000 });
  await browse.click();
  await page.waitForSelector("#sc-home", { timeout: 10000 });
  await W(page, 700);
}
async function openLab(page, li, si) {
  const nodes = page.locator("#sc-home .gm-node:not(.exam)");
  await nodes.nth(li).waitFor({ state: "visible", timeout: 10000 });
  await nodes.nth(li).scrollIntoViewIfNeeded();
  await nodes.nth(li).click();
  await page.waitForSelector(`${A} .step`, { timeout: 10000 });
  await W(page, 700);
  for (let i = 0; i < si; i++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await W(page, 520);
  }
  await W(page, 600);
  return page.evaluate(() => {
    const st = document.querySelector(".screen.active .step.bv-step");
    return { step: st?.className ?? "", stage: st?.querySelector(".bv-stage")?.className ?? "" };
  });
}
async function leave(page) {
  // 닫기(X) → 나가기 확인이 뜨면 누른다 → 지도
  await page.evaluate(() => {
    const xs = document.querySelectorAll(".screen.active .lheader .xbtn");
    xs[xs.length - 1]?.click();
  });
  await W(page, 500);
  const quit = page.locator("button", { hasText: /나가기|그만/ }).first();
  if (await quit.isVisible().catch(() => false)) await quit.click();
  await page.waitForSelector("#sc-home", { timeout: 10000 });
  await W(page, 700);
}

console.log("══ ① 표식 없이 ══");
{
  const { ctx, page, errors } = await newContext();
  await boot(page);
  for (const s of SAMPLES) {
    const info = await openLab(page, s.li, s.si);
    ok(!/\bls-/.test(info.step) && info.stage.includes(s.base), `${s.name}의 랩: 정본(${info.stage})`);
    await leave(page);
  }
  ok((await page.evaluate(() => sessionStorage.getItem("ss.u2style"))) === null, "세션에 표식이 남지 않는다");
  ok((await page.evaluate(() => typeof window.__u2styleOpen)) === "undefined", "빌드에는 견주어 보는 화면용 문이 없다");
  const res = await page.request.get(`${BASE}/qa-labstyle.html`);
  ok(res.status() === 404 || !(await res.text()).includes("랩의 다른 느낌 샘플"), "빌드에는 견주어 보는 화면이 없다");
  ok(errors.length === 0, `페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await ctx.close();
}

console.log("\n══ ② 주소 ?u2style ══");
{
  const { ctx, page, errors } = await newContext();
  await boot(page, "?u2style");
  for (const s of SAMPLES) {
    const info = await openLab(page, s.li, s.si);
    ok(info.step.includes(s.cls), `${s.name}: 샘플이 뜬다(${info.stage})`);
    if (s.cls === "ls-collage") {
      const imgs = await page.evaluate(() => [...document.querySelectorAll(".screen.active .lsc-pic")].map((i) => i.complete && i.naturalWidth > 0));
      ok(imgs.length === 3 && imgs.every(Boolean), `스티커 그림 셋이 뜬다(${imgs.join(",")})`);
    }
    if (s.cls === "ls-sketch") {
      const n = await page.evaluate(() => document.querySelectorAll(".screen.active .lsh-slot use").length);
      ok(n === 18, `손그림 새 열여덟 마리(${n})`);
    }
    if (s.cls === "ls-model") {
      let ready = false;
      for (let i = 0; i < 60 && !ready; i++) {
        ready = await page.evaluate(() => document.querySelector(".screen.active .step.bv-step")?.dataset.lsmReady === "1");
        if (!ready) await W(page, 150);
      }
      ok(ready, "입체 모형이 준비된다(three 조각을 따로 내려받는다)");
    }
    await leave(page);
  }
  ok((await page.evaluate(() => sessionStorage.getItem("ss.u2style"))) === "1", "켠 것이 세션에 남는다");
  ok(errors.length === 0, `페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  // ③ 끄기: 같은 탭에서 ?u2style=0
  await boot(page, "?u2style=0");
  const info = await openLab(page, SAMPLES[0].li, SAMPLES[0].si);
  ok(!/\bls-/.test(info.step), "?u2style=0 으로 열면 꺼진다");
  ok((await page.evaluate(() => sessionStorage.getItem("ss.u2style"))) === null, "세션의 표식도 지워진다");
  await ctx.close();
}

await browser.close();
console.log(`\n번들 검사: PASS ${PASS} · FAIL ${FAIL}`);
process.exit(FAIL ? 1 : 0);
