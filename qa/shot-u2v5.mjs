// 중1 Ⅱ v5 눈검수·판정 자료용 캡처(390×700, 2배 선명도).
//   v5: 랩 열세 판의 주요 시점 + 문제 화면(각 문제의 첫 화면)
//   v3: 같은 레슨의 랩 첫 화면(토글을 끈 같은 서버)
//   v4: 같은 레슨의 랩 첫 화면(v4 워크트리 서버, PORT4. 없으면 건너뛴다)
//   PORT=5547 PORT4=5503 node qa/shot-u2v5.mjs <출력 폴더>
//   LESSONS=4-10 을 붙이면 그 레슨만 찍는다(1부터 센다).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { LABS, launch, openLesson, goStep, W } from "./u2v5-lib.mjs";

const OUT = process.argv[2];
if (!OUT) throw new Error("출력 폴더를 적어 주세요");
const PORT4 = process.env.PORT4 || "";
const [L0, L1] = (process.env.LESSONS || "1-10").split("-").map(Number);
const LIS = Array.from({ length: 10 }, (_, i) => i).filter((i) => i + 1 >= L0 && i + 1 <= (L1 || L0));
for (const d of ["v5", "v3", "v4"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });
const clean = (page) => page.evaluate(() => document.querySelectorAll(".snack, .toast").forEach((e) => e.remove()));

// ── v5: 랩 ──
{
  const { browser, page } = await launch();
  for (const lab of LABS.filter((l) => LIS.includes(l.li))) {
    await openLesson(page, lab.li);
    await goStep(page, lab.si);
    const on = async (label) => {
      await clean(page);
      await page.screenshot({ path: path.join(OUT, "v5", `${lab.key}-${label}.png`) });
    };
    await lab.play(page, { wrong: true, on });
    console.log("v5", lab.key);
  }
  // ── v5: 문제 화면 ──
  for (const li of LIS) {
    const meta = await openLesson(page, li);
    for (let si = 0; si < meta.types.length; si++) {
      if (si > 0) {
        await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
        await W(page, 520);
      }
      if (!["quiz", "binSort", "order", "pairMatch"].includes(meta.types[si])) continue;
      await W(page, 500);
      await clean(page);
      await page.screenshot({ path: path.join(OUT, "v5", `quiz-${meta.id}-s${String(si + 1).padStart(2, "0")}-${meta.types[si]}.png`) });
    }
    console.log("v5 문제", meta.id);
  }
  await browser.close();
}

/** 다른 판(v3, v4)의 랩 첫 화면. */
async function mounts(tag, port, flagKey, modPath, exportName) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.addInitScript((k) => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
    if (k) sessionStorage.setItem(k, "1");
  }, flagKey);
  await page.goto(`http://localhost:${port}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  for (const li of LIS) {
    const meta = await page.evaluate(async ({ li, modPath, exportName }) => {
      const { nav } = await import("/src/core/router.ts");
      const { createLessonPlayer } = await import("/src/lessons/player.ts");
      const m = await import(modPath);
      const l = m[exportName].lessons[li];
      nav.reset(createLessonPlayer(l, { onExit: () => {}, onComplete: () => {} }));
      await new Promise((r) => setTimeout(r, 600));
      return { id: l.id, types: l.steps.map((s) => s.type) };
    }, { li, modPath, exportName });
    for (let si = 0; si < meta.types.length; si++) {
      if (si > 0) {
        await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
        await page.waitForTimeout(520);
      }
      // 랩과, 랩 구실을 하는 활동(v3의 그림 속 부위 누르기)
      if (!meta.types[si].endsWith("Lab") && meta.types[si] !== "hotspot") continue;
      await page.waitForTimeout(1400);
      await clean(page);
      const m = await page.evaluate(() => {
        const sc = document.querySelector(".screen.active .scroll");
        const wrap = document.querySelector(".screen.active .stepWrap");
        return { usable: sc.clientHeight, total: wrap.scrollHeight };
      });
      await page.screenshot({ path: path.join(OUT, tag, `${meta.id}-s${String(si + 1).padStart(2, "0")}-${meta.types[si]}-top.png`) });
      // 첫 화면에 다 안 들어오면 끝까지 내린 화면도 남긴다
      if (m.total > m.usable + 2) {
        await page.evaluate(() => { const sc = document.querySelector(".screen.active .scroll"); sc.scrollTop = sc.scrollHeight; });
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(OUT, tag, `${meta.id}-s${String(si + 1).padStart(2, "0")}-${meta.types[si]}-bottom.png`) });
        await page.evaluate(() => { document.querySelector(".screen.active .scroll").scrollTop = 0; });
      }
      console.log(tag, meta.id, si + 1, meta.types[si], `${m.total}/${m.usable}`);
    }
  }
  await browser.close();
}

await mounts("v3", process.env.PORT || "5547", "", "/src/content/unit2v3.ts", "UNIT2_V3");
if (PORT4) {
  try {
    await mounts("v4", PORT4, "ss.u2v4", "/src/content/unit2v4.ts", "UNIT2_V4");
  } catch (e) {
    console.log("v4 캡처를 건너뜀:", e.message);
  }
}
console.log("캡처 끝:", OUT);
