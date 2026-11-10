// 중1 Ⅱ v5 "실사용 경로" 검사: 스플래시 → 둘러보기 → 지도 → 레슨 노드까지 실제 클릭으로 들어가고,
// 랩의 막대와 카드도 실제 마우스 입력(누르고, 끌고, 떼기)으로 조작한다. e2e-u2v5가 합성 이벤트로 보지 못하는 것을 본다.
//   ① 토글 없음 = 정본 v3(u2l1 만화 뒤 랩이 배율 버튼) ② 주소 ?u2v5 = 새 판(확대 막대)
//   ③ u2l1 확대 랩을 마우스 끌기로 끝까지 ④ u2l3 표본 만들기(덮개 유리 막대를 천천히 끌기)와 관찰 랩(초점 막대, 핵 누르기)을 끝까지
//   PORT=5547 node qa/check-u2v5-real.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5547";
const browser = await chromium.launch({ channel: "chrome", headless: true });
let PASS = 0;
let FAIL = 0;
let pageErrors = 0;
const ok = (cond, label) => {
  if (cond) PASS++;
  else FAIL++;
  console.log(cond ? "  ✓" : "  ✗", label);
};
const A = ".screen.active";

async function newPage() {
  const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => {
    pageErrors++;
    console.log("  PAGEERROR:", e.message);
  });
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
      lastUnits: { "sci:g1": "u2" },
    }));
  });
  return page;
}
const W = (page, ms) => page.waitForTimeout(ms);

async function boot(page, query = "") {
  await page.goto(`http://localhost:${PORT}/${query}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#sc-splash", { timeout: 8000 });
  await W(page, 500);
  await page.mouse.click(195, 300);
  const browse = page.locator("button", { hasText: "한번 둘러보기" }).first();
  await browse.waitFor({ state: "visible", timeout: 8000 });
  await browse.click();
  await page.waitForSelector("#sc-home", { timeout: 8000 });
  await W(page, 700);
}
async function openNode(page, i) {
  const nodes = page.locator("#sc-home .gm-node:not(.exam)");
  await nodes.nth(i).waitFor({ state: "visible", timeout: 8000 });
  await nodes.nth(i).scrollIntoViewIfNeeded();
  await nodes.nth(i).click();
  await W(page, 900);
}
const cta = async (page, n = 1) => {
  for (let k = 0; k < n; k++) {
    await page.locator(`${A} .btn.cta`).click();
    await W(page, 450);
  }
};
/** 막대의 손잡이를 실제 마우스로 끌어 값 v(0~1 비율)까지 옮긴다. ms 동안 걸려 움직인다. */
async function dragRange(page, sel, to, ms = 500) {
  const el = page.locator(`${A} ${sel}`);
  const b = await el.boundingBox();
  const v = await el.evaluate((e) => (Number(e.value) - Number(e.min)) / (Number(e.max) - Number(e.min)));
  const T = 18; // 손잡이 반지름
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
const choice = (page, ok1) => page.locator(`${A} .bv-q.show .bv-choice[data-ok="${ok1 ? 1 : 0}"]`).first();
const waitAsk = (page) => page.locator(`${A} .bv-q.show .bv-choice`).first().waitFor({ state: "visible", timeout: 9000 });
const ds = (page, k) => page.evaluate((key) => document.querySelector(".screen.active .step.bv-step")?.dataset[key] ?? null, k);
const waitDs = async (page, k, v) => {
  for (let i = 0; i < 80; i++) {
    if ((await ds(page, k)) === v) return true;
    await W(page, 150);
  }
  return false;
};
const done = (page) => page.locator(`${A} .bv-done.show`).waitFor({ state: "visible", timeout: 9000 }).then(() => true, () => false);
const ctaOpen = (page) => page.evaluate(() => { const b = document.querySelector(".screen.active .btn.cta"); return !!b && !b.disabled; });

// ① 토글 없음 → 정본 v3
console.log(`[PORT ${PORT}] 토글 없음 = 정본 v3`);
{
  const page = await newPage();
  await boot(page);
  await openNode(page, 0);
  await cta(page, 7);
  const r = await page.evaluate(() => ({ v3: !!document.querySelector(".screen.active .zrl-mag"), v5: !!document.querySelector(".screen.active .bv-step") }));
  ok(r.v3 && !r.v5, "u2l1 만화 뒤에 v3 랩(배율 버튼)이 열린다");
  await page.close();
}

// ② ③ 주소 ?u2v5 → 새 판, u2l1 확대 랩을 실제 입력으로
console.log("주소 ?u2v5 = 새 판 · u2l1 확대 랩");
{
  const page = await newPage();
  await boot(page, "?u2v5");
  ok((await page.evaluate(() => sessionStorage.getItem("ss.u2v5"))) === "1", "주소 ?u2v5가 세션 표식을 켠다");
  await openNode(page, 0);
  await cta(page, 7);
  ok(await page.locator(`${A} .bv-step .mgf-range`).isVisible(), "u2l1 만화 뒤에 새 랩(확대 막대)이 열린다");
  await dragRange(page, ".mgf-range", 1, 600);
  ok((await page.locator(`${A} .mgf-mag b`).textContent()) === "×400", "양파: 막대를 끝까지 끌면 ×400");
  ok(await page.locator(`${A} .bv-card[data-k="onion"].done`).isVisible(), "양파 카드에 체크");
  await page.locator(`${A} .bv-card[data-k="cork"]`).click();
  await W(page, 250);
  await dragRange(page, ".mgf-range", 1, 500);
  await page.locator(`${A} .bv-card[data-k="salt"]`).click();
  await waitAsk(page);
  ok((await page.locator(`${A} .bv-qt`).textContent()).includes("소금"), "소금을 고르면 예측 질문이 먼저 뜬다");
  await page.locator(`${A} .bv-q.show .bv-choice`, { hasText: "칸이 보이지 않을" }).click();
  await page.locator(`${A} .mgf-range`).waitFor({ state: "visible", timeout: 6000 });
  await W(page, 300);
  await dragRange(page, ".mgf-range", 1, 500);
  await W(page, 1100);
  await waitAsk(page);
  await choice(page, true).click();
  ok(await done(page), "판정을 맞히면 결론이 뜬다");
  await W(page, 300);
  ok(await ctaOpen(page), "u2l1 랩 완료, 아래 버튼이 열린다");
  const m = await page.evaluate(() => { const sc = document.querySelector(".screen.active .scroll"); return { top: sc.scrollTop, frame: document.querySelector("#frame")?.scrollTop ?? 0 }; });
  ok(m.top === 0 && m.frame === 0, "조작하는 동안 화면이 밀리지 않았다");
  await page.close();
}

// ④ u2l3: 표본 만들기와 관찰을 실제 입력으로
console.log("u2l3 표본 만들기 · 관찰 랩");
{
  const page = await newPage();
  await boot(page, "?u2v5");
  await openNode(page, 2);
  await page.locator(`${A} .hb4-wl`).click();
  await page.locator(`${A} .hook-choice`, { hasText: "현미경" }).first().click();
  await W(page, 600);
  await cta(page);
  ok(await page.locator(`${A} .bv-step .sbd-svg`).isVisible(), "훅 뒤에 표본 만들기 랩이 열린다");
  await page.locator(`${A} .bv-card[data-k="swab"]`).click();
  ok((await waitDs(page, "sbdStage", "1")) && (await waitDs(page, "sbdBusy", "0")), "면봉: 세포를 묻힌다");
  await page.locator(`${A} .bv-card[data-k="stain"]`).click();
  ok((await waitDs(page, "sbdStage", "2")) && (await waitDs(page, "sbdBusy", "0")), "메틸렌 블루: 1분 뒤 물든다");
  await page.locator(`${A} .bv-card[data-k="cover"]`).click();
  await page.locator(`${A} .sbd-range`).waitFor({ state: "visible", timeout: 5000 });
  await dragRange(page, ".sbd-range", 1, 120);
  ok((await ds(page, "sbdBubble")) === "1" && (await page.locator(`${A} .sbd-retry`).isVisible()), "덮개 유리를 휙 끌면 공기 방울이 갇힌다");
  await page.locator(`${A} .sbd-retry`).click();
  await W(page, 300);
  await dragRange(page, ".sbd-range", 1, 1600);
  ok((await ds(page, "sbdBubble")) === "0" && (await waitDs(page, "sbdStage", "3")), "천천히 끌면 통과한다");
  await waitDs(page, "sbdBusy", "0");
  await page.locator(`${A} .bv-card[data-k="paper"]`).click();
  ok(await waitDs(page, "sbdStage", "4"), "거름종이: 표본 완성");
  await waitAsk(page);
  await choice(page, true).click();
  ok(await done(page), "표본 만들기 결론");
  await W(page, 300);
  await cta(page);
  ok(await page.locator(`${A} .bv-step .scp-range`).isVisible(), "이어서 관찰 랩이 열린다");
  await dragRange(page, ".scp-range", 0.64, 500);
  ok(await waitDs(page, "scpPhase", "hunt"), "초점 막대를 끌어 또렷한 곳에서 떼면 다음으로");
  const tapNuc = async () => {
    const v = (await ds(page, "scpNuc")).split(",").map(Number);
    const b = await page.locator(`${A} .scp-field`).boundingBox();
    await page.mouse.click(b.x + (b.width * v[0]) / 100, b.y + (b.height * v[1]) / 100);
    await W(page, 450);
  };
  await tapNuc();
  ok((await ds(page, "scpSolved")) === "cheek", "입안 세포: 핵을 실제로 눌러 찾는다");
  await page.locator(`${A} .bv-card[data-k="water"]`).click();
  await W(page, 500);
  await page.locator(`${A} .scp-no`).click();
  await W(page, 400);
  await page.locator(`${A} .bv-card[data-k="stain"]`).click();
  await waitDs(page, "scpWait", "1");
  await waitDs(page, "scpWait", "0");
  await W(page, 300);
  await tapNuc();
  ok((await ds(page, "scpSolved")) === "cheek,water,stain", "세 표본을 모두 관찰");
  await page.locator(`${A} .scp-cmp`).click();
  await waitAsk(page);
  const q1 = await page.locator(`${A} .bv-qt`).textContent();
  await choice(page, true).click();
  await page.waitForFunction((q) => { const e = document.querySelector(".screen.active .bv-q.show .bv-qt"); return !!e && e.textContent !== q; }, q1, { timeout: 8000 });
  await W(page, 400);
  await choice(page, true).click();
  ok(await done(page), "관찰 랩 결론");
  await W(page, 300);
  ok(await ctaOpen(page), "u2l3 랩 둘 완료, 아래 버튼이 열린다");
  await page.close();
}

ok(pageErrors === 0, `페이지 오류 ${pageErrors}건`);
console.log(`\n실경로 검사: PASS ${PASS} · FAIL ${FAIL}`);
await browser.close();
process.exit(FAIL ? 1 : 0);
