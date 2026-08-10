// colorClueLab "안 넘어감" 재현 스크립트 — 사람형 시퀀스 5종을 돌려 멈춤 지점을 찾는다.
//   PORT=5437 node qa/repro-clu.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5437";
const browser = await chromium.launch({ channel: "chrome", headless: true });

const SEQS = [
  { name: "A: 아이오딘 바로(정석)", steps: [["btn", 0, 1700]] },
  { name: "B: 수단III 먼저 → 아이오딘", steps: [["btn", 3, 1200], ["btn", 0, 1700]] },
  { name: "C: 베네딕트 먼저 → 아이오딘", steps: [["btn", 1, 1200], ["btn", 0, 1700]] },
  { name: "D: 아이오딘 빠른 연타 3번", steps: [["btn", 0, 120], ["btn", 0, 120], ["btn", 0, 1900]] },
  { name: "E: 애니 중 다른 시약 끼어들기", steps: [["btn", 0, 300], ["btn", 2, 300], ["btn", 3, 1900]] },
];

for (const seq of SEQS) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
      premium: false, reviewMode: false, goalMin: 10, streak: 1, totalXp: 0, lessons: {}, minigame: {},
    }));
    sessionStorage.setItem("ss.g2u6v3", "1");
  });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1100);
  await page.evaluate(async () => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { G2_UNIT6_V3 } = await import("/src/content/g2/unit6v3.ts");
    nav.go(createLessonPlayer(G2_UNIT6_V3.lessons[0], { onExit: () => {}, onComplete: () => {} }));
  });
  await page.waitForTimeout(700);
  // 훅 통과
  await page.evaluate(() => document.querySelector(".screen.active .hb3-bs")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await page.waitForTimeout(1900);
  await page.evaluate(() => {
    [...document.querySelectorAll(".screen.active .hook-choice")].find((b) => b.textContent.includes("물 — 몸의"))?.click();
  });
  await page.waitForTimeout(500);
  const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await page.waitForTimeout(500); };
  await cta(); // → concept①
  await cta(); // → binSort
  // binSort 완료
  for (let i = 0; i < 12; i++) {
    const t = await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.textContent?.trim() ?? null);
    if (!t) break;
    const bi = ["탄수화물", "단백질", "지방"].some((k) => t.includes(k)) ? 0 : 1;
    await page.evaluate(() => document.querySelector(".screen.active .bin-tray .bin-chip")?.click());
    await page.waitForTimeout(110);
    await page.evaluate((b) => document.querySelectorAll(".screen.active .bin")[b]?.click(), bi);
    await page.waitForTimeout(120);
  }
  await cta();
  await page.waitForTimeout(250);
  await page.evaluate(() => { const sh = [...document.querySelectorAll(".sheet")].find((s) => s.className.includes("open")); [...(sh?.querySelectorAll("button") ?? [])].pop()?.click(); });
  await page.waitForTimeout(500);
  await cta(); // → concept② → 랩? (concept② 하나 더)
  // 현재 스텝이 랩인지 확인, 아니면 한 번 더 CTA
  const isLab = await page.evaluate(() => !!document.querySelector(".screen.active .clu-board"));
  if (!isLab) await cta();
  const ok = await page.evaluate(() => !!document.querySelector(".screen.active .clu-board"));
  console.log(`\n=== ${seq.name} === (랩 도달: ${ok})`);
  // 시퀀스 실행
  for (const [, idx, wait] of seq.steps) {
    await page.evaluate((i) => document.querySelectorAll(".screen.active .clu-btn")[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true })), idx);
    await page.waitForTimeout(wait);
  }
  // 상태 덤프
  const dump = await page.evaluate(() => ({
    helper: document.querySelector(".screen.active .helper")?.textContent?.slice(0, 60),
    qVisible: (() => { const q = document.querySelector(".screen.active .clu-q"); return q ? getComputedStyle(q).display !== "none" && q.children.length > 0 : false; })(),
    qText: document.querySelector(".screen.active .clu-q .hook-q")?.textContent?.slice(0, 40) ?? null,
    choices: [...document.querySelectorAll(".screen.active .clu-q .hook-choice")].map((b) => b.textContent.slice(0, 16)),
    goalsOn: document.querySelectorAll(".screen.active .pn-badge.on").length,
  }));
  console.log(JSON.stringify(dump, null, 1));
  // 질문이 떴다면 정답을 골라 다음 시료로 넘어가는지도 확인
  if (dump.qVisible) {
    await page.evaluate(() => {
      [...document.querySelectorAll(".screen.active .clu-q .hook-choice")].filter((b) => !b.disabled).find((b) => b.textContent.includes("녹말이 많은") || b.textContent.includes("단백질") || b.textContent.includes("뜨거운"))?.click();
    });
    await page.waitForTimeout(2200);
    const after = await page.evaluate(() => ({
      pill: document.querySelector(".screen.active .clu-pill")?.textContent,
      helper: document.querySelector(".screen.active .helper")?.textContent?.slice(0, 50),
      goalsOn: document.querySelectorAll(".screen.active .pn-badge.on").length,
    }));
    console.log("답변 후:", JSON.stringify(after));
  }
  console.log("pageErrors:", errs.length ? errs : 0);
  await page.close();
}
await browser.close();
