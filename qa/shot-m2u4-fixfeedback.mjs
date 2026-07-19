// 중2 수학 Ⅳ 실사용 피드백 10건(2026-07-19) 수정 눈검수 샷.
// PORT=<포트> node qa/shot-m2u4-fixfeedback.mjs  (dev 서버 필수)
// ① 그림 갤러리: foldIsoFig·rhaRhsFig(RHAS 배지)·quadTreeFig 2종(겹침 해소)·
//    mExamFoldFig 2종(각 호 정박)·m2ExamFamilyFig 2종(폰트 확대)
// ② 훅: foldstrip 두 각도(접기 기하 재작도)·phonestand(0°→64° 펴짐)·fairspot(텍스트 확대)
// ③ 랩: isoFold(포개짐 라벨·증명 걸음 버튼 3개)·rhCong(라벨 확대)·
//    inCircle(이등분선 라벨)·areaSlide(주석 라벨·경계 펴기 국면)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5199";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const done = { done: true, acc: 100, bestXp: 10 };
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 0,
    lessons: {
      m2u1l1: done, m2u1l2: done, m2u1l3: done, m2u1l4: done, m2u1l5: done,
      m2u1l6: done, m2u1l7: done, m2u1l8: done, m2u1l9: done, m2u1l10: done,
      m2u2l1: done, m2u2l2: done, m2u2l3: done, m2u2l4: done, m2u2l5: done,
      m2u2l6: done, m2u2l7: done, m2u2l8: done, m2u2l9: done,
      m2u3l1: done, m2u3l2: done, m2u3l3: done, m2u3l4: done, m2u3l5: done,
      m2u3l6: done, m2u3l7: done, m2u3l8: done, m2u3l9: done, m2u3l10: done,
    },
    minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });

/* ── ① 그림 갤러리 ── */
await page.setViewportSize({ width: 420, height: 1330 });
await page.evaluate(async () => {
  const m = await import("/src/ui/mathFigures2.ts");
  const x = await import("/src/ui/examFiguresMath.ts");
  const cell = (t, svg) =>
    `<div style="margin:8px;padding:8px;border:1px solid #d5dde8;border-radius:10px;background:#fff">
      <div style="font:700 12px sans-serif;color:#456;margin-bottom:4px">${t}</div>${svg}</div>`;
  document.body.innerHTML =
    `<div style="background:#F2F4F6">` +
    cell("① foldIsoFig(L2 문제2) — 접기 기하 재작도", m.foldIsoFig()) +
    cell("② rhaRhsFig(L3 concept) — R·H·A·S 배지", m.rhaRhsFig()) +
    cell("③ quadTreeFig — 라벨 겹침 해소·폰트 확대", m.quadTreeFig(false)) +
    cell("④ quadTreeFig blank(L9 문제3)", m.quadTreeFig(true)) +
    cell("⑤ mExamFoldFig fold49(시험 e024) — 각 호 정박", x.mExamFoldFig({ fold: 49, given: "49°", x: "x°" })) +
    cell("⑥ mExamFoldFig fold73(m1u4 e131)", x.mExamFoldFig({ fold: 73, given: "x", x: "34°" })) +
    cell("⑦ m2ExamFamilyFig 기본 — 폰트 12", x.m2ExamFamilyFig({})) +
    cell("⑧ m2ExamFamilyFig diag+가림", x.m2ExamFamilyFig({ variant: "diag", hide: ["p2r"], hideNode: ["rhom"] })) +
    `</div>`;
});
await W(400);
const total = await page.evaluate(() => document.body.scrollHeight);
const slices = Math.ceil(total / 1330);
for (let i = 0; i < slices; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * 1330);
  await W(150);
  await shot(`fix-m2u4-figs-${i + 1}`);
}
console.log(`그림 갤러리 ${slices}장 저장`);

/* ── 레슨 마운트 헬퍼(스택 오염 방지로 매번 reload) ── */
const openLesson = async (id) => {
  await page.reload({ waitUntil: "networkidle" });
  await W(1100);
  await page.evaluate(async (id) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(id).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(800);
};
const clickBtn = async (re, wait = 500) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".screen.active button")]
      .filter((x) => x.offsetParent && !x.disabled)
      .find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return true; }
    return false;
  }, re);
  if (!t) throw new Error(`clickBtn 실패: /${re}/`);
  await W(wait);
};
const waitBtn = async (re, wait = 500, timeout = 20000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll(".screen.active button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const clickCTA = async (timeout = 26000) => {
  await page.waitForFunction(() => { const b = document.querySelector(".screen.active button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(600);
};
const hookChoiceFirst = async () => {
  await page.waitForSelector(".screen.active .hook-choices .hook-choice", { timeout: 20000 });
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices .hook-choice").click());
  await W(500);
};
const mq6 = async (re, wait = 2100) => {
  await page.waitForSelector(".screen.active .mq6-choice", { timeout: 16000 });
  await page.evaluate((re) => {
    const list = [...document.querySelectorAll(".screen.active .mq6-choice")].filter((b) => b.offsetParent && !b.disabled);
    (list.find((b) => new RegExp(re).test(b.textContent)) ?? list[0])?.click();
  }, re);
  await W(wait);
};
const labDrag = async (pts, wait = 700) => {
  await page.evaluate(async (pts) => {
    const svg = document.querySelector(".screen.active .mcl-plane svg");
    if (!svg) return;
    const vb = svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    const cx = (x) => r.left + ((x - vb.x) / vb.width) * r.width;
    const cy = (y) => r.top + ((y - vb.y) / vb.height) * r.height;
    const fire = (t, x, y) =>
      svg.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 44, isPrimary: true, clientX: cx(x), clientY: cy(y) }));
    fire("pointerdown", pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      for (let k = 1; k <= 5; k++) {
        fire("pointermove", x0 + ((x1 - x0) * k) / 5, y0 + ((y1 - y0) * k) / 5);
        await new Promise((res) => setTimeout(res, 26));
      }
    }
    fire("pointerup", pts[pts.length - 1][0], pts[pts.length - 1][1]);
  }, pts);
  await W(wait);
};

await page.setViewportSize({ width: 420, height: 900 });

/* ── ② 훅: foldstrip(L2) ── */
await openLesson("m2u4l2");
await waitBtn("비스듬히 접기", 1000);
await shot("fix-m2u4-hook-foldstrip-a");
await clickBtn("다른 각도로 접기", 1600);
await shot("fix-m2u4-hook-foldstrip-b");
console.log("foldstrip 샷 2장");

/* ── ② 훅: phonestand(L3) → 이어서 ③ rhCongLab 초기 라벨 ── */
await openLesson("m2u4l3");
await page.waitForSelector(".screen.active .swapbtn", { timeout: 12000 });
await shot("fix-m2u4-hook-stand-before");
await clickBtn("둘 다 펴기", 1700);
await shot("fix-m2u4-hook-stand-after");
await hookChoiceFirst();
await clickCTA();
await page.waitForSelector(".screen.active .rhc-order", { timeout: 12000 });
await W(700);
await shot("fix-m2u4-lab-rhcong");
console.log("phonestand·rhCong 샷 3장");

/* ── ② 훅: fairspot(L4) ── */
await openLesson("m2u4l4");
await waitBtn("가운데쯤 핀 꽂기", 2000);
await shot("fix-m2u4-hook-fairspot");
console.log("fairspot 샷 1장");

/* ── ③ isoFoldLab(L1): 접힘 상태 + 증명 걸음 버튼 3개 ── */
await openLesson("m2u4l1");
await waitBtn("옷 걸어 보기", 2400);
await hookChoiceFirst();
await clickCTA();
await page.waitForSelector(".ifl-counter", { timeout: 12000 });
await waitBtn("반으로 접기", 1600);
await shot("fix-m2u4-lab-isofold-folded");
await waitBtn("펼치기", 1000);
for (let i = 0; i < 2; i++) {
  await waitBtn("다른 모양으로", 700);
  await waitBtn("반으로 접기", 1600);
  await waitBtn("펼치기", 1000);
}
await mq6("아무리 접어도", 2900);
await waitBtn("가르는 선 긋기", 1500);
for (const re of ["AB = AC", "BAD", "AD는 공통"]) {
  await page.waitForSelector(".screen.active .mq6-choice", { timeout: 12000 });
  await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".screen.active .mq6-choice")].find((x) => x.offsetParent && !x.disabled && new RegExp(re).test(x.textContent));
    b?.click();
  }, re);
  await W(420);
}
await W(500);
await shot("fix-m2u4-lab-isofold-stampbtn");
await waitBtn("합동 도장 찍기", 1400);
await shot("fix-m2u4-lab-isofold-stamp");
await waitBtn("확인하기", 1900);
await shot("fix-m2u4-lab-isofold-conclusion");
await waitBtn("모양 바꿔서 시험하기", 900);
await shot("fix-m2u4-lab-isofold-morphmid"); // 보간 중간 모양(배지 걷힘 + 삼각형 변신 중) 증거
await W(3400);
await shot("fix-m2u4-lab-isofold-finale");
await page.waitForFunction(() => { const b = document.querySelector(".screen.active button.cta"); return b && !b.disabled; }, { timeout: 8000 });
console.log("isoFold 샷 6장 + CTA 개방 확인");

/* ── ③ inCircleLab(L5): 이등분선 라벨 ── */
await openLesson("m2u4l5");
await waitBtn("구석에 찍어 보기", 900);
await waitBtn("가운데쯤 찍어 보기", 1700);
await hookChoiceFirst();
await clickCTA();
await page.waitForSelector(".screen.active .icl-read", { timeout: 12000 });
await labDrag([[110, 210], [135, 192], [155, 175], [162, 166]], 900);
await waitBtn("각 B의 이등분선", 1000);
await shot("fix-m2u4-lab-incircle-b");
await waitBtn("각 C의 이등분선", 1600);
await shot("fix-m2u4-lab-incircle-snap");
console.log("inCircle 샷 2장");

/* ── ③ areaSlideLab(L10): 라벨 + 경계 펴기 국면 ── */
await openLesson("m2u4l10");
for (let i = 0; i < 7; i++) {
  if (await page.$(".screen.active .hook-choices .hook-choice")) break;
  const t = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".screen.active .swapbtn")].find((x) => x.offsetParent && !x.disabled);
    if (b) { b.click(); return true; }
    return false;
  });
  await W(t ? 2600 : 900);
}
await hookChoiceFirst();
await clickCTA();
await page.waitForSelector(".screen.active .asl-read", { timeout: 12000 });
await W(500);
await shot("fix-m2u4-lab-areaslide-1");
await labDrag([[160, 100], [60, 100], [300, 100]], 900);
await mq6("밑변은 그대로고", 3200);
await W(900);
await waitBtn("대각선 AC 긋기", 1200);
await shot("fix-m2u4-lab-areaslide-2");
console.log("areaSlide 샷 2장");

await browser.close();
console.log("DONE — qa/shots/fix-m2u4-*.png");
