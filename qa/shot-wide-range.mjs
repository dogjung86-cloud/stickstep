// 넓은 화면(태블릿 가로)에서 미는 막대(range)를 실제 마우스 끌기로 움직여 찍는다. "0"은 스위치를 끈 폰 모양. PORT=5621 node qa/shot-wide-range.mjs [출력 폴더]
// Ⅲ단원 온도 막대 랩(u3l1)과 열량계 랩(u3l2). 끌기 전후의 막대 값도 적는다(확대된 화면에서 끌기가 먹는지 확인).
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || 5621;
const OUT = process.argv[2] || "../output/tablet-landscape/range";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: "chrome", headless: true });

async function open(land, lesson) {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((off) => {
    const s = JSON.parse(localStorage.getItem("science-app.v1") || "{}");
    s.reviewMode = true;
    s.onboarded = true;
    s.wideOff = off;
    localStorage.setItem("science-app.v1", JSON.stringify(s));
  }, land === "0");
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/?open=${lesson}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".lesson-screen");
  for (let i = 0; i < 30 && !(await page.locator(".step.bv-step").count()); i++) {
    await page.locator(".xbtn.fwd").click();
    await sleep(350);
  }
  await sleep(900);
  return { ctx, page };
}
const val = (page) => page.locator(".bv-range-in").first().evaluate((n) => `${n.value} (${n.min}~${n.max})`);
/** 막대의 지금 엄지 자리에서 잡아 to(0~1) 자리까지 끈다. hold면 떼지 않는다. */
async function drag(page, to, hold = false) {
  const inp = page.locator(".bv-range-in").first();
  const r = await inp.boundingBox();
  const cur = await inp.evaluate((n) => (Number(n.value) - Number(n.min)) / (Number(n.max) - Number(n.min)));
  const pad = 18 * (r.height / 48); // 엄지 반지름(확대 배율만큼 커진다)
  const x = (f) => r.x + pad + (r.width - pad * 2) * f;
  const y = r.y + r.height / 2;
  await page.mouse.move(x(cur), y);
  await page.mouse.down();
  for (let i = 1; i <= 16; i++) {
    await page.mouse.move(x(cur + ((to - cur) * i) / 16), y);
    await sleep(40);
  }
  if (!hold) await page.mouse.up();
}

for (const land of ["0", "c"]) {
  const tag = land === "0" ? "phone" : "wide";
  // ① 온도 막대 랩
  {
    const { ctx, page } = await open(land, "u3l1");
    const v0 = await val(page);
    await page.screenshot({ path: `${OUT}/${tag}-temp-1-start.png` });
    await drag(page, 0.8, true);
    await sleep(400);
    await page.screenshot({ path: `${OUT}/${tag}-temp-2-dragging.png` });
    await page.mouse.up();
    await drag(page, 0.15);
    await sleep(600);
    const v1 = await val(page);
    await page.screenshot({ path: `${OUT}/${tag}-temp-3-low.png` });
    console.log(tag, "u3l1 막대", v0, "→", v1, "| 도움말:", (await page.locator(".bv-helper").innerText()).replace(/\s+/g, " ").slice(0, 60));
    await ctx.close();
  }
  // ② 열량계 랩: 컵 온도를 끌어 맞춘 뒤 측정
  {
    const { ctx, page } = await open(land, "u3l2");
    const v0 = await val(page);
    await drag(page, 0.35);
    await sleep(400);
    const v1 = await val(page);
    await page.screenshot({ path: `${OUT}/${tag}-contact-1-set.png` });
    for (const name of ["컵 넣기", "뚜껑 닫기", "측정 시작"]) {
      const b = page.locator(".bv-slot button", { hasText: name }).first();
      if (await b.count()) {
        await b.click().catch(() => {});
        await sleep(900);
      }
    }
    await sleep(2500);
    await page.screenshot({ path: `${OUT}/${tag}-contact-2-measure.png` });
    console.log(tag, "u3l2 막대", v0, "→", v1);
    await ctx.close();
  }
}
await browser.close();
