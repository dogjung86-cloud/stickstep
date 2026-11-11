// 중1 과학 대표 랩 "직접 조작한 뒤" 캡처(390×700, 2배 선명도). 분석 문서(output/lab-redesign)용.
// 조작 좌표는 브라우저 창에서 손으로 해 본 것을 그대로 옮겼다(스크롤은 끝까지 내린 상태 기준).
//   PORT=5547 OUT="D:/Brilliant Science/output/lab-redesign/caps" node qa/shot-g1-lab-play.mjs
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const PORT = process.env.PORT || "5547";
const OUT = process.env.OUT || "qa/shots/g1-play";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("  PAGEERROR:", e.message));
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
const W = (ms) => page.waitForTimeout(ms);
const open = async (uid, li, si) => {
  await page.evaluate(async ({ uid, li }) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const c = await import("/src/content/curriculum.ts");
    const u = c.CURRICULUM.find((x) => x.id === uid);
    nav.reset(createLessonPlayer(u.lessons[li], { onExit: () => {}, onComplete: () => {} }));
  }, { uid, li });
  await W(800);
  for (let i = 0; i < si; i++) { await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click()); await W(460); }
  await W(1300);
  // 검토 모드 안내 스낵은 캡처를 가리므로 지운다
  await page.evaluate(() => document.querySelectorAll(".snack, .toast").forEach((e) => e.remove()));
};
const bottom = async () => { await page.evaluate(() => { const sc = document.querySelector(".screen.active .scroll"); sc.scrollTo(0, sc.scrollHeight); }); await W(250); };
const shot = async (name) => { await page.screenshot({ path: path.join(OUT, `${name}.png`) }); console.log("shot", name); };
const drag = async (x0, y0, x1, y1, steps = 14) => {
  await page.mouse.move(x0, y0); await page.mouse.down();
  for (let i = 1; i <= steps; i++) { await page.mouse.move(x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps); await W(24); }
  await page.mouse.up();
};
const clickText = async (sel, text) => page.evaluate(({ sel, text }) => {
  const b = [...document.querySelectorAll(`.screen.active ${sel}`)].filter((x) => x.offsetParent !== null).find((x) => x.textContent.includes(text));
  if (b) { b.click(); return true; } return false;
}, { sel, text });

// 1) u3l2 열평형: 버튼이 첫 화면 밖 + 결론 문장은 위쪽 도움말에
await open("u3", 1, 1); await shot("u3l2-heatContact-1-mount");
await bottom(); await clickText("button", "칸막이 제거"); await W(3200); await shot("u3l2-heatContact-2-run");
await W(7000); await shot("u3l2-heatContact-3-done");
await page.evaluate(() => document.querySelector(".screen.active .scroll").scrollTo(0, 0)); await W(250); await shot("u3l2-heatContact-4-done-top");

// 2) u4l2 물질의 상태: 슬라이더 하나, 무대 바로 아래
await open("u4", 1, 1);
await drag(28, 579, 200, 579); await W(1500); await shot("u4l2-matterTemp-1-liquid");
await drag(200, 579, 372, 579); await W(2500); await shot("u4l2-matterTemp-2-gas");

// 3) u5l6 부력: 실험 장치를 손으로 끈다
await open("u5", 5, 1); await bottom();
await drag(195, 430, 195, 372); await W(900); await shot("u5l6-buoyancy-1-half");
await drag(195, 382, 195, 292); await W(900); await shot("u5l6-buoyancy-2-done");

// 4) u6l2 보일: 피스톤 끌기
await open("u6", 1, 1); await bottom(); await shot("u6l2-boyle-0-mount-bottom");
await drag(32, 313, 150, 313); await W(900); await shot("u6l2-boyle-1-push");

// 5) u7l5 달의 위상: 달을 끌면 인셋이 바뀐다
await open("u7", 4, 1); await W(1500); await bottom();
await drag(58, 395, 150, 300); await W(1200); await shot("u7l5-moon-1-quarter");

// 6) u2l1 양파 줌: 배율 버튼이 첫 화면 밖, 오답 해설은 위쪽 도움말에
await open("u2", 0, 1); await shot("u2l1-zoom-1-mount");
await bottom();
for (const t of ["×10", "×40"]) { await clickText("button", t); await W(1800); }
await shot("u2l1-zoom-2-x40");
await clickText("button", "×400"); await W(2600); await shot("u2l1-zoom-3-ask");
await clickText(".hook-choice", "쌀알"); await W(1200); await shot("u2l1-zoom-4-wrong");

// 7) u2l3 표본 만들기: 도구를 정해진 순서로 누르기 + 덮개 유리는 고르기 문제
await open("u2", 2, 1); await bottom(); await shot("u2l3-slide-1-mount-bottom");
await clickText("button", "면봉"); await W(2400); await clickText("button", "메틸렌"); await W(3600); await shot("u2l3-slide-2-stain");
await clickText("button", "덮개 유리"); await W(1600); await shot("u2l3-slide-3-ask");
await clickText(".hook-choice", "한 번에"); await W(900); await shot("u2l3-slide-4-wrong");

await browser.close();
console.log("DONE");
