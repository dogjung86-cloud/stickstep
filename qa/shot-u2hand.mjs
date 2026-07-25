// cellScaleLab(중1 Ⅱ L1)의 1배 손 층 눈검수 — 캔버스를 toDataURL로 직접 뽑는다.
// PORT=<포트> node qa/shot-u2hand.mjs → qa/shots/u2hand-*.png
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const PORT = process.env.PORT || "5173";
mkdirSync("qa/shots", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 3 });
await page.addInitScript(() => {
  localStorage.setItem("bs.state", JSON.stringify({ onboarded: true, premium: true, reviewMode: true, lessons: {}, totalXp: 0 }));
});
await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

await page.evaluate(async () => {
  const st = await import("/src/core/store.ts");           // 완료 표시가 있어야 자유 모드(앞으로 가기)가 열린다
  if (!st.isDone("u2l1")) st.completeLesson("u2l1", 1, 0);
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("u2l1").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForTimeout(700);

// 랩이 나올 때까지 앞으로
for (let i = 0; i < 14; i++) {
  if (await page.evaluate(() => !!document.querySelector(".screen.active .zcl-canvas"))) break;
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await page.waitForTimeout(420);
}
const found = await page.evaluate(() => !!document.querySelector(".screen.active .zcl-canvas"));
console.log("LAB", found);
if (!found) { await browser.close(); process.exit(1); }

const grab = () => page.evaluate(() => document.querySelector(".screen.active .zcl-canvas")?.toDataURL("image/png"));
const save = (name, url) => {
  if (!url) { console.log("MISS", name); return; }
  writeFileSync(`qa/shots/u2hand-${name}.png`, Buffer.from(url.split(",")[1], "base64"));
  console.log("SHOT", name);
};

// 슬라이더를 트랙 비율로 밀어 배율을 세운다(uD 관성이 잦아들 때까지 기다린 뒤 캡처).
const setU = async (frac) => {
  await page.evaluate((f) => {
    const tr = document.querySelector(".screen.active .zcl-track");
    const r = tr.getBoundingClientRect();
    const x = r.left + r.width * f, y = r.top + r.height / 2;
    const sl = document.querySelector(".screen.active .zcl-slider");
    for (const t of ["pointerdown", "pointermove", "pointerup"])
      sl.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 1, clientX: x, clientY: y, isPrimary: true }));
  }, frac);
  await page.waitForTimeout(1700);
};

await page.waitForTimeout(1200);
save("1x", await grab());
for (const f of [0.08, 0.18, 0.3]) {
  await setU(f);
  save(`u${String(f).replace("0.", "")}`, await grab());
}

await browser.close();
console.log("DONE");
