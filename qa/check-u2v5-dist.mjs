// 중1 Ⅱ v5 "운영 번들" 검사: 개발 서버에서는 보이지 않는 것을 빌드한 번들에서 확인한다.
//   ① 토글 없음 = 정본 v3 그대로(만화 뒤 v3 랩, 세션 표식 없음)
//   ② 주소 ?u2v5 = 새 판. 같은 탭은 새로 고쳐도 새 판이 남는다
//   ③ 운영 화면에는 정답 표식이 없다(판정 보기의 data-ok, 문제 보기의 data-oi는 개발 서버 전용)
//   ④ 새 판 열 레슨의 모든 스텝이 오류 없이 열리고, 랩 열세 판이 서고, 그림이 뜬다
//   npm run build 뒤 vite preview를 띄우고:  PPORT=4547 node qa/check-u2v5-dist.mjs
//   배포된 주소를 보려면:  BASE=https://<주소> node qa/check-u2v5-dist.mjs  (읽기만 한다. 검사용 브라우저의 저장소만 쓴다)
import { chromium } from "playwright-core";

const BASE = (process.env.BASE || `http://localhost:${process.env.PPORT || "4547"}`).replace(/\/$/, "");
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
/** 레슨마다 서야 하는 새 랩의 수(u2l1부터). 모두 열세 판. */
const LABS = [1, 2, 2, 1, 1, 1, 1, 2, 1, 1];

async function newContext() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && m.text().includes("[u2v5]")) errors.push(`console: ${m.text().slice(0, 160)}`);
  });
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
      lastUnits: { "sci:g1": "u2" },
    }));
  });
  return { ctx, page, errors };
}
async function enter(page) {
  await page.waitForSelector("#sc-splash", { timeout: 15000 });
  await W(page, 500);
  await page.mouse.click(195, 300);
  const browse = page.locator("button", { hasText: "한번 둘러보기" }).first();
  await browse.waitFor({ state: "visible", timeout: 10000 });
  await browse.click();
  await page.waitForSelector("#sc-home", { timeout: 10000 });
  await W(page, 700);
}
async function boot(page, query = "") {
  await page.goto(`${BASE}/${query}`, { waitUntil: "domcontentloaded" });
  await enter(page);
}
async function openNode(page, i) {
  const nodes = page.locator("#sc-home .gm-node:not(.exam)");
  await nodes.nth(i).waitFor({ state: "visible", timeout: 10000 });
  await nodes.nth(i).scrollIntoViewIfNeeded();
  await nodes.nth(i).click();
  await page.waitForSelector(`${A} .step`, { timeout: 10000 });
  await W(page, 700);
}
/** 앞으로 가기 화살표(검토 모드의 자유 이동)로 다음 스텝에 간다. 마지막 스텝이면 false. */
async function forward(page) {
  const can = await page.evaluate(() => {
    const b = document.querySelector(".screen.active .xbtn.fwd");
    if (!b || getComputedStyle(b).visibility !== "visible" || getComputedStyle(b).display === "none") return false;
    b.click();
    return true;
  });
  if (can) await W(page, 520);
  return can;
}
const flags = (page) =>
  page.evaluate(() => ({
    v3lab: !!document.querySelector(".screen.active .zrl-mag"),
    v5lab: !!document.querySelector(".screen.active .step.bv-step"),
    session: sessionStorage.getItem("ss.u2v5"),
  }));
/** 지금 스텝의 그림이 모두 떴는가(3초까지 기다린다). 안 뜬 그림의 주소를 돌려준다. */
async function brokenImages(page) {
  for (let i = 0; i < 20; i++) {
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll(".screen.active .step img")].filter((im) => !(im.complete && im.naturalWidth > 0)).map((im) => im.getAttribute("src") || ""),
    );
    if (!bad.length) return [];
    if (i === 19) return bad;
    await W(page, 150);
  }
  return [];
}
/** 막대의 손잡이를 실제 마우스로 끌어 to(0~1)까지 옮긴다. */
async function dragRange(page, sel, to, ms = 500) {
  const el = page.locator(`${A} ${sel}`);
  const b = await el.boundingBox();
  const v = await el.evaluate((e) => (Number(e.value) - Number(e.min)) / (Number(e.max) - Number(e.min)));
  const T = 18;
  const x0 = b.x + T + (b.width - 2 * T) * v;
  const x1 = b.x + T + (b.width - 2 * T) * to;
  const y = b.y + b.height / 2;
  await page.mouse.move(x0, y);
  await page.mouse.down();
  const steps = Math.max(6, Math.round(ms / 40));
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x0 + ((x1 - x0) * i) / steps, y);
    await W(page, ms / steps);
  }
  await page.mouse.up();
  await W(page, 250);
}

console.log(`[${BASE}] 운영 번들 검사`);

// ① 토글 없음 = 정본 v3
console.log("① 토글 없음 = 정본 v3");
{
  const { ctx, page, errors } = await newContext();
  await boot(page);
  await openNode(page, 0);
  await forward(page);
  const f = await flags(page);
  ok(f.v3lab && !f.v5lab, "u2l1 만화 다음 스텝이 v3 랩이다(새 랩이 아니다)");
  ok(f.session === null, "세션 표식이 없다");
  ok(errors.length === 0, `오류 없음${errors.length ? ": " + errors[0] : ""}`);
  await ctx.close();
}

// ② ③ 주소 ?u2v5 = 새 판
console.log("② ③ 주소 ?u2v5 = 새 판, 정답 표식 없음");
{
  const { ctx, page, errors } = await newContext();
  await boot(page, "?u2v5");
  ok((await flags(page)).session === "1", "주소 ?u2v5가 세션 표식을 켠다");
  await openNode(page, 0);
  await forward(page);
  ok(await page.locator(`${A} .bv-step .mgf-range`).isVisible(), "u2l1 만화 다음 스텝이 새 랩(확대 막대)이다");
  await dragRange(page, ".mgf-range", 1, 600);
  ok((await page.locator(`${A} .mgf-mag b`).textContent()) === "×400", "막대를 실제로 끌면 ×400까지 간다");
  await page.locator(`${A} .bv-card[data-k="cork"]`).click();
  await W(page, 250);
  await dragRange(page, ".mgf-range", 1, 500);
  await page.locator(`${A} .bv-card[data-k="salt"]`).click();
  await page.locator(`${A} .bv-q.show .bv-choice`).first().waitFor({ state: "visible", timeout: 9000 });
  const marks = await page.evaluate(() => ({
    choices: document.querySelectorAll(".screen.active .bv-q.show .bv-choice").length,
    ok: document.querySelectorAll(".screen.active .bv-choice[data-ok]").length,
    nuc: document.querySelectorAll(".screen.active [data-scp-nuc]").length,
  }));
  ok(marks.choices >= 2 && marks.ok === 0, `판정 보기 ${marks.choices}개에 정답 표식(data-ok)이 없다`);
  // 문제 스텝까지 가서 보기의 저작 차례 표식도 본다
  let oi = -1;
  for (let k = 0; k < 12; k++) {
    if (!(await forward(page))) break;
    const n = await page.evaluate(() => {
      const opts = document.querySelectorAll(".screen.active .opts .opt");
      return opts.length ? document.querySelectorAll(".screen.active .opts .opt[data-oi]").length : -1;
    });
    if (n >= 0) {
      oi = n;
      break;
    }
  }
  ok(oi === 0, "문제 보기에 저작 차례 표식(data-oi)이 없다");
  // 같은 탭을 새로 고쳐도 새 판이 남는다(주소에 #/home이 붙어 있으면 스플래시 없이 지도로 바로 간다)
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#sc-home, #sc-splash", { timeout: 15000 });
  if (await page.locator("#sc-splash").isVisible()) await enter(page);
  else await W(page, 900);
  await openNode(page, 0);
  await forward(page);
  const f = await flags(page);
  ok(f.session === "1" && f.v5lab, "새로 고친 뒤에도 같은 탭은 새 판이다");
  ok(errors.length === 0, `오류 없음${errors.length ? ": " + errors[0] : ""}`);
  await ctx.close();
}

// ④ 새 판 열 레슨의 모든 스텝
console.log("④ 새 판 열 레슨의 모든 스텝");
{
  const { ctx, page, errors } = await newContext();
  await boot(page, "?u2v5");
  let totalSteps = 0;
  let totalLabs = 0;
  for (let li = 0; li < 10; li++) {
    await openNode(page, li);
    let steps = 0;
    let labs = 0;
    const bad = [];
    for (;;) {
      steps++;
      if ((await flags(page)).v5lab) labs++;
      bad.push(...(await brokenImages(page)));
      if (!(await forward(page))) break;
    }
    totalSteps += steps;
    totalLabs += labs;
    ok(labs === LABS[li] && bad.length === 0, `u2l${li + 1}: 스텝 ${steps}개, 새 랩 ${labs}판, 안 뜬 그림 ${bad.length}개${bad.length ? " (" + bad.slice(0, 2).join(", ") + ")" : ""}`);
    // 지도로 돌아간다(머리말의 닫기)
    await page.locator(`${A} .lheader .xbtn[aria-label="닫기"]`).click();
    await page.waitForSelector("#sc-home.active", { timeout: 10000 }).catch(() => {});
    await W(page, 500);
  }
  ok(totalLabs === 13, `새 랩은 모두 ${totalLabs}판(기대 13)`);
  console.log(`  스텝 합계 ${totalSteps}개`);
  ok(errors.length === 0, `오류 없음${errors.length ? ": " + errors.slice(0, 2).join(" / ") : ""}`);
  await ctx.close();
}

await browser.close();
console.log(`운영 번들 검사: PASS ${PASS} · FAIL ${FAIL}`);
process.exit(FAIL ? 1 : 0);
