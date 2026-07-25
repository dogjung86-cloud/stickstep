// u2l1 특정 컷의 말풍선 후보 좌표를 실제 DOM에 꽂아 보고 '덮은 잉크'를 재는 시험대.
// 폭에 따라 줄바꿈이 달라지므로 VW(폰 폭)를 바꿔 가며 돌린다(360이 최악 조건).
// 사용: PORT=<포트> VW=360 CUT=6 node qa/bubble-try-u2l1.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5211";
const VW = Number(process.env.VW || 390);
const CUT = Number(process.env.CUT || 6);
const CAND = JSON.parse(
  process.env.CAND ||
    '[{"x":64,"y":48},{"x":64,"y":52},{"x":68,"y":52},{"x":72,"y":54},{"x":76,"y":56},{"x":50,"y":36}]',
);
const TEXTS = JSON.parse(process.env.TEXTS || '["다 같은 칸이네요"]');

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: VW, height: 844 } });
await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: false, goalMin: 10, streak: 1, lastStudyDay: null, totalXp: 0, lessons: {}, minigame: {} }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  nav.go(createLessonPlayer(findLesson("u2l1").lesson, { onExit: () => {}, onComplete: () => {} }));
});
await page.waitForSelector(".screen.active .comic-art", { timeout: 12000 });
for (let i = 0; i < CUT; i += 1) {
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await page.waitForTimeout(360);
}

const rows = await page.evaluate(
  async ({ CAND, TEXTS }) => {
    const art = document.querySelector(".screen.active .comic-art");
    const img = art.querySelector(".comic-img");
    const b = art.querySelector(".cut-bubble");
    const S = 400;
    const c = document.createElement("canvas");
    c.width = S;
    c.height = S;
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, S, S);
    const sc = Math.max(S / img.naturalWidth, S / img.naturalHeight);
    g.drawImage(img, (S - img.naturalWidth * sc) / 2, (S - img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc);
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
      return tot ? (ink / tot) * 100 : 0;
    };
    const ab = art.getBoundingClientRect();
    const out = [];
    for (const t of TEXTS)
      for (const cd of CAND) {
        b.innerHTML = t;
        b.style.left = `${cd.x}%`;
        b.style.top = `${cd.y}%`;
        b.classList.toggle("flip", !!cd.flip);
        const r = b.getBoundingClientRect();
        const box = {
          x0: ((r.left - ab.left) / ab.width) * 100,
          x1: ((r.right - ab.left) / ab.width) * 100,
          y0: ((r.top - ab.top) / ab.height) * 100,
          y1: ((r.bottom - ab.top) / ab.height) * 100,
        };
        out.push({
          t,
          x: cd.x,
          y: cd.y,
          flip: !!cd.flip,
          w: +(box.x1 - box.x0).toFixed(1),
          h: +(box.y1 - box.y0).toFixed(1),
          box: Object.fromEntries(Object.entries(box).map(([k, v]) => [k, +v.toFixed(1)])),
          ink: +inkIn(box.x0 - 1, box.y0 - 2, box.x1 + 1, box.y1 + 2).toFixed(2),
        });
      }
    return out;
  },
  { CAND, TEXTS },
);
console.log(`cut ${CUT} @ ${VW}px`);
for (const r of rows)
  console.log(`  x=${r.x} y=${r.y}${r.flip ? " flip" : ""} "${r.t}" → ${r.w}x${r.h}% ${JSON.stringify(r.box)} 잉크 ${r.ink}%`);
await browser.close();
