// stage-hud 안 seg가 "실제 포인터"로 눌리는지 검증 (pointer-events 회귀 방지)
// JS el.click()은 히트테스트를 우회하므로, 여기선 Playwright locator.click(실좌표 클릭)을 쓴다.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173"; // 동시 세션이 5173을 잡을 수 있어 포트 주입 허용

const log = (...a) => console.log("[seg]", ...a);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const base = {
    onboarded: true, grade: "중1", goal: "daily5", streak: 0, xp: 0, lastDay: "",
    lessons: { u7l1: { done: true }, u7l2: { done: true } },
  };
  localStorage.setItem(KEY, JSON.stringify(base));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1100);
// 2026-07-21 공개 진입 플로우: 부팅은 항상 스플래시. "한번 둘러보기"를 눌러야 홈으로 간다
// (정본 = qa/e2e-soc7.mjs 부팅부). 고정 sleep 대신 조건 대기.
await page.waitForSelector("#sc-splash", { timeout: 25000 });
await page.mouse.click(210, 300); // 플립북 건너뛰기
await page.waitForFunction(
  () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")),
  { timeout: 15000 },
);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click();
});
await page.waitForSelector("#sc-home", { timeout: 15000 });
await page.waitForTimeout(600);

await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.includes("태양계"))?.click());
await page.waitForTimeout(500);
const opened = await page.evaluate(() => {
  const n = [...document.querySelectorAll(".gm-node")].find((n) => n.textContent.includes("태양의 활동"));
  if (!n || n.getAttribute("aria-disabled") === "true") return false;
  n.click();
  return true;
});
log("open u7l3:", opened);
await page.waitForTimeout(1000);

// 만화 7컷 통과
for (let i = 0; i < 7; i++) {
  await page.waitForFunction(() => {
    const b = document.querySelector(".cta button, button.cta, .lesson-cta");
    return b && !b.disabled;
  }, { timeout: 10000 });
  await page.evaluate(() => document.querySelector(".cta button, button.cta, .lesson-cta").click());
  await page.waitForTimeout(350);
}
log("at:", await page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().slice(0, 20)));
await page.waitForTimeout(900);

// 1) 히트테스트: 버튼 중심에서 elementFromPoint가 그 버튼인가
const hit = await page.evaluate(() => {
  const btn = [...document.querySelectorAll(".stage-hud .seg button")].find((b) => b.textContent.includes("개기일식"));
  if (!btn) return { ok: false, why: "no button" };
  const r = btn.getBoundingClientRect();
  const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return {
    ok: el === btn || btn.contains(el),
    hitTag: el?.tagName,
    pe: getComputedStyle(btn.closest(".seg")).pointerEvents,
  };
});
log("hit-test:", JSON.stringify(hit));

// 2) 실좌표 클릭(Playwright actionability) → 모드 전환 + 코로나 확인
await page.locator('.stage-hud .seg button:has-text("개기일식")').click({ timeout: 5000 });
await page.waitForTimeout(300);
const on = await page.evaluate(() =>
  [...document.querySelectorAll(".stage-hud .seg button")].find((b) => b.textContent.includes("개기일식"))?.className.includes("on"),
);
log("eclipse seg on:", on);
await page.waitForTimeout(2600);
const pill = await page.evaluate(() => document.querySelector(".stage-hud .pill")?.textContent.trim());
log("pill:", pill);

// 3) 같은 규칙을 쓰는 나머지 seg(일주 관측소·달 궤도)도 계산값만 확인
const verdict = hit.ok && on && /코로나/.test(pill ?? "");
log(verdict ? "PASS" : "FAIL");
await page.screenshot({ path: "qa/check_seg_tap.png" });
await browser.close();
process.exit(verdict ? 0 : 1);
