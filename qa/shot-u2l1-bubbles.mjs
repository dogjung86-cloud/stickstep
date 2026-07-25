// u2l1 도입 만화 말풍선 눈검수 — 7컷을 한 컷씩 넘기며 컷 프레임만 크롭 캡처하고,
// 말풍선이 덮고 있는 그림의 잉크 비율(=뭔가를 가리는 정도)을 함께 재서 표로 뽑는다.
// 사용: PORT=<포트> node qa/shot-u2l1-bubbles.mjs → qa/shots/u2l1-bb-<n>.png
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5211";
const VW = Number(process.env.VW || 390); // 폰 폭(말풍선 줄바꿈은 폭에 따라 달라진다 — 360도 확인할 것)
mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: VW, height: 844 }, deviceScaleFactor: 2 });
await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: false, goalMin: 10, streak: 1, lastStudyDay: null, totalXp: 0, lessons: {}, minigame: {} }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const W = (ms) => page.waitForTimeout(ms);

await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("u2l1").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForSelector(".screen.active .comic-art", { timeout: 12000 });
await W(500);

const clickCTA = async () => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".screen.active button.cta");
    return b && !b.disabled;
  }, undefined, { timeout: 20000 });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(460);
};

/** 말풍선 아래에 깔린 그림의 잉크 비율 — 컷 프레임(cover 크롭) 그대로 캔버스에 다시 그려 센다. */
const measure = () =>
  page.evaluate(() => {
    const art = document.querySelector(".screen.active .comic-art");
    const img = art.querySelector(".comic-img");
    const ab = art.getBoundingClientRect();
    const S = 400;
    const c = document.createElement("canvas");
    c.width = S;
    c.height = S;
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, S, S);
    const scale = Math.max(S / img.naturalWidth, S / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
    const d = g.getImageData(0, 0, S, S).data;
    const inkIn = (x0p, y0p, x1p, y1p) => {
      const x0 = Math.max(0, Math.round((x0p / 100) * S));
      const x1 = Math.min(S, Math.round((x1p / 100) * S));
      const y0 = Math.max(0, Math.round((y0p / 100) * S));
      const y1 = Math.min(S, Math.round((y1p / 100) * S));
      let ink = 0;
      let tot = 0;
      for (let y = y0; y < y1; y += 1)
        for (let x = x0; x < x1; x += 1) {
          const i = (y * S + x) * 4;
          if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] < 232) ink += 1;
          tot += 1;
        }
      return tot ? ink / tot : 0;
    };
    return [...art.querySelectorAll(".cut-bubble")].map((b) => {
      const r = b.getBoundingClientRect();
      const box = {
        x0: ((r.left - ab.left) / ab.width) * 100,
        x1: ((r.right - ab.left) / ab.width) * 100,
        y0: ((r.top - ab.top) / ab.height) * 100,
        y1: ((r.bottom - ab.top) / ab.height) * 100,
      };
      return {
        text: b.textContent,
        left: +b.style.left.replace("%", ""),
        top: +b.style.top.replace("%", ""),
        flip: b.classList.contains("flip"),
        w: +(box.x1 - box.x0).toFixed(1),
        h: +(box.y1 - box.y0).toFixed(1),
        box: { x0: +box.x0.toFixed(1), x1: +box.x1.toFixed(1), y0: +box.y0.toFixed(1), y1: +box.y1.toFixed(1) },
        // 꼬리(6.5px)까지 포함해 살짝 넓힌 영역의 잉크 비율
        ink: +(inkIn(box.x0 - 1, box.y0 - 2, box.x1 + 1, box.y1 + 2) * 100).toFixed(1),
      };
    });
  });

for (let n = 0; n < 7; n += 1) {
  if (n > 0) await clickCTA();
  await page.evaluate(() => document.querySelector(".screen.active .comic-art")?.scrollIntoView({ block: "center" }));
  await W(260);
  const el = await page.$(".screen.active .comic-art");
  await el.screenshot({ path: `qa/shots/u2l1-bb-${n}.png` });
  const bb = await measure();
  for (const b of bb)
    console.log(
      `cut ${n}  x=${b.left} y=${b.top} flip=${b.flip}  크기 ${b.w}x${b.h}%  덮은 영역 ${JSON.stringify(b.box)}  잉크 ${b.ink}%  "${b.text}"`,
    );
  if (!bb.length) console.log(`cut ${n}  (말풍선 없음)`);
}
console.log("DONE 7 panels → qa/shots/u2l1-bb-*.png");
await browser.close();
