// 중1 Ⅱ 전 레슨 스모크 — 10레슨의 모든 스텝을 끝까지 넘기며 렌더·런타임 에러를 확인한다.
// PORT=5211 node qa/smoke-u2.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5211";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 140)));
page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 140)); });

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    onboarded: true, premium: true, reviewMode: true, lessons: {}, totalXp: 0,
  }));
});
await page.goto(`http://localhost:${PORT}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1600);

const rows = [];
for (let i = 1; i <= 10; i++) {
  const id = `u2l${i}`;
  const info = await page.evaluate(async (lid) => {
    const st = await import("/src/core/store.ts");
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const f = findLesson(lid);
    if (!f) return null;
    if (!st.isDone(lid)) st.completeLesson(lid, 1, 0);
    nav.go(createLessonPlayer(f.lesson, { onExit: () => {}, onComplete: () => {} }));
    return { label: f.lesson.label, title: f.lesson.title, steps: f.lesson.steps.length };
  }, id);
  if (!info) { rows.push([id, "NOT FOUND"]); continue; }
  await page.waitForTimeout(420);
  let rendered = 0;
  for (let sIdx = 0; sIdx < info.steps; sIdx++) {
    const ok = await page.evaluate(() => {
      const host = document.querySelector(".screen.active .stepWrap");
      return !!(host && host.children.length);
    });
    if (ok) rendered += 1;
    const moved = await page.evaluate(() => {
      const b = document.querySelector(".screen.active .xbtn.fwd");
      if (!b) return false;
      b.click();
      return true;
    });
    await page.waitForTimeout(230);
    if (!moved) break;
  }
  rows.push([id, info.label, info.title, `${rendered}/${info.steps}`]);
}

// 임베드 이미지 전수 로드 검사
const imgs = await page.evaluate(async () => {
  const mod = await import("/src/content/unit2.ts");
  const json = JSON.stringify(mod.UNIT2);
  const srcs = [...new Set([...json.matchAll(/src=\\?"([^"\\]+\.webp)/g)].map((m) => m[1]))];
  const panels = [...new Set([...json.matchAll(/"img":"([^"]+)"/g)].map((m) => "/" + m[1]))];
  const all = [...srcs, ...panels];
  const res = await Promise.all(all.map((u) => new Promise((r) => {
    const im = new Image(); im.onload = () => r([u, im.naturalWidth]); im.onerror = () => r([u, 0]); im.src = u;
  })));
  return { total: res.length, broken: res.filter(([, w]) => !w).map((b) => b[0]) };
});

console.log("── 레슨 ──");
for (const r of rows) console.log("  " + r.join(" · "));
console.log("이미지:", imgs.total, "장 / 깨진 것:", imgs.broken.length ? imgs.broken.join(", ") : "없음");
console.log("에러:", errs.length ? errs.slice(0, 6).join(" | ") : "0건");
await browser.close();
