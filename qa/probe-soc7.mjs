// probe-soc7.mjs — lifePathLab(사회 Ⅶ L2) 실입력 프로브. e2e의 합성 dispatchEvent는
// 히트테스트·오버레이 가림을 우회하므로, 실기기 "안 먹혀요"류를 막기 위해 page.mouse로
// **실드래그**(가족 카드 → 아기 정거장)와 **실탭-탭**(학교 카드 → 청소년), 매체 띠 실드래그를
// 검증한다(probe-rpl 문법). judgeLab·dilemmaLab은 버튼 탭이 유일 경로라 e2e로 충분(프로브 제외 근거).
// freeNav 시딩은 localStorage lessons에 done 직접(eval completeLesson은 HMR 뒤 모듈 갈라짐 — 금지).
// PORT=<포트> node qa/probe-soc7.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5217";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

let checks = 0;
let fails = 0;
const check = (ok, msg) => {
  checks += 1;
  console.log(`${ok ? "PASS" : "FAIL"} [${checks}] ${msg}`);
  if (!ok) fails += 1;
};

await page.addInitScript(() =>
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({
      onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc", premium: true, goalMin: 10,
      lessons: { s1u7l2: { done: true, acc: 1, bestXp: 0 } },
    }),
  ),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("s1u7l2").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForTimeout(1100);
// 훅 → concept → 랩(3번째 스텝)까지 앞으로(freeNav 화살표)
for (let i = 0; i < 2; i += 1) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  await page.waitForTimeout(700);
}
await page.waitForSelector(".screen.active .lfp-card", { timeout: 9000 });
await page.evaluate(() => document.querySelector(".screen.active .lfp-stage")?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(500);

const rectOf = (sel) =>
  page.evaluate((s) => {
    const el2 = document.querySelector(s);
    if (!el2) return null;
    const r = el2.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, sel);

const dragTo = async (fromSel, toSel) => {
  const a = await rectOf(fromSel);
  const b = await rectOf(toSel);
  if (!a || !b) return false;
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  const steps = 14;
  for (let i = 1; i <= steps; i += 1) {
    await page.mouse.move(a.x + ((b.x - a.x) * i) / steps, a.y + ((b.y - a.y) * i) / steps);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(450);
  return true;
};

// ① 실드래그: 가족 카드 → 아기 정거장
await dragTo('.screen.active .lfp-card[data-a="family"]', '.screen.active .lfp-slot[data-slot="baby"]');
let st = await page.evaluate(() => ({
  babyOn: !!document.querySelector('.screen.active .lfp-slot[data-slot="baby"].on'),
  familyGone: !!document.querySelector('.screen.active .lfp-card[data-a="family"].gone'),
}));
check(st.babyOn && st.familyGone, "실드래그: 가족 → 아기 정거장 배치");

// ② 실드래그 오배치: 직장 카드 → 어린이 정거장(스냅백 + 코미디, 배치 안 됨)
await dragTo('.screen.active .lfp-card[data-a="work"]', '.screen.active .lfp-slot[data-slot="child"]');
st = await page.evaluate(() => ({
  childOn: !!document.querySelector('.screen.active .lfp-slot[data-slot="child"].on'),
  workGone: !!document.querySelector('.screen.active .lfp-card[data-a="work"].gone'),
  helper: document.querySelector(".screen.active .helper")?.textContent ?? "",
}));
check(!st.childOn && !st.workGone && st.helper.length > 10, `실드래그 오배치 = 원복+교정 (${st.helper.slice(0, 14)}…)`);

// ③ 실탭-탭: 학교 카드 탭 → 청소년 정거장 탭
await page.evaluate(() => document.querySelector('.screen.active .lfp-card[data-a="school"]')?.scrollIntoView({ block: "center" }));
let p = await rectOf('.screen.active .lfp-card[data-a="school"]');
await page.mouse.click(p.x, p.y);
await page.waitForTimeout(300);
p = await rectOf('.screen.active .lfp-slot[data-slot="teen"]');
await page.mouse.click(p.x, p.y);
await page.waitForTimeout(450);
st = await page.evaluate(() => ({ teenOn: !!document.querySelector('.screen.active .lfp-slot[data-slot="teen"].on') }));
check(st.teenOn, "실탭-탭: 학교 → 청소년 정거장 배치");

// ④ 나머지 정배치(또래·직장) + 매체 띠 실드래그 → 재사회화까지 완주
await dragTo('.screen.active .lfp-card[data-a="peer"]', '.screen.active .lfp-slot[data-slot="child"]');
await dragTo('.screen.active .lfp-card[data-a="work"]', '.screen.active .lfp-slot[data-slot="adult"]');
await dragTo('.screen.active .lfp-card[data-a="media"]', '.screen.active .lfp-band');
st = await page.evaluate(() => ({
  bandOn: !!document.querySelector(".screen.active .lfp-band.on"),
  placeChip: !!document.querySelector('.screen.active .pn-badge[data-g="place"].on'),
  mediaChip: !!document.querySelector('.screen.active .pn-badge[data-g="media"].on'),
}));
check(st.bandOn && st.placeChip && st.mediaChip, "실드래그: 매체 → 평생 띠 + 칩 2종 점등");

await page.waitForSelector(".screen.active .msn-quiz.show", { timeout: 12000 });
await page.evaluate(() => document.querySelector(".screen.active .msn-quiz")?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(300);
p = await rectOf(".screen.active .msn-quiz .msn-opt");
await page.mouse.click(p.x, p.y);
await page.waitForTimeout(2000); // finale helper + enableCTA는 정답 후 1.5s 지연 발동
st = await page.evaluate(() => ({
  chips: document.querySelectorAll(".screen.active .pn-badge.on").length,
  cta: !document.querySelector(".screen.active button.cta")?.disabled,
}));
check(st.chips === 3 && st.cta, `재사회화 실탭 → 목표 3/3 + CTA 개방 (칩 ${st.chips})`);

console.log(`\n===== probe-soc7: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
await browser.close();
process.exit(fails ? 1 : 0);
