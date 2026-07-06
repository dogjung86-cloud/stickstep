// u5l1 힘의 표현 — 전 스텝 실플레이 E2E (headless Chrome, rAF 살아 있음)
// node qa/e2e-u5l1.mjs  (dev 서버 5173 필요)
import { chromium } from "playwright-core";

const log = (...a) => console.log("[e2e]", ...a);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

// 온보딩 스킵: 완료 상태 시드
await page.addInitScript(() => {
  const KEY = "science-app.v1";
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify({
      onboarded: true, grade: "중1", goal: "daily5", streak: 0, xp: 0,
      lastDay: "", done: {}, quiz: {},
    }));
  }
});
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// 혹시 온보딩이 뜨면 CTA 연타로 통과
for (let i = 0; i < 8; i++) {
  const onHome = await page.evaluate(() => !!document.querySelector(".gm-node"));
  if (onHome) break;
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(
      (x) => x.offsetParent && !x.disabled && /시작|다음|계속|좋아요|이대로/.test(x.textContent),
    );
    b?.click();
    // 선택지가 필요하면 첫 옵션 선택
    const opt = [...document.querySelectorAll("button")].find((x) => x.offsetParent && /중학교 1학년|중1/.test(x.textContent));
    opt?.click();
  });
  await page.waitForTimeout(500);
}

// V 단원 탭 → u5l1
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.includes("힘의 작용"))?.click());
await page.waitForTimeout(400);
await page.evaluate(() => [...document.querySelectorAll(".gm-node")].find((n) => n.textContent.includes("힘의 표현"))?.click());
await page.waitForTimeout(900);
log("lesson title:", await page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().slice(0, 24)));

const cta = () => page.evaluate(() => {
  const b = document.querySelector(".cta button, button.cta, .lesson-cta");
  return b ? { text: b.textContent.trim(), disabled: b.disabled } : null;
});
const clickCTA = async () => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".cta button, button.cta, .lesson-cta");
    return b && !b.disabled;
  }, { timeout: 12000 });
  await page.evaluate(() => document.querySelector(".cta button, button.cta, .lesson-cta").click());
  await page.waitForTimeout(700);
};
const firePtr = (sel, seq) => page.evaluate(([sel, seq]) => {
  const t = document.querySelector(sel);
  const r = t.getBoundingClientRect();
  for (const [type, fx, fy, id] of seq) {
    t.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerId: id, isPrimary: true,
      clientX: r.left + fx, clientY: r.top + fy,
    }));
  }
}, [sel, seq]);

// ── 1) hook: 풍선 드래그 ×2 ──
for (const id of [51, 52]) {
  await firePtr(".hf-balloon-wrap", [
    ["pointerdown", 120, 90, id], ["pointermove", 120, 110, id], ["pointermove", 120, 130, id],
    ["pointermove", 120, 140, id], ["pointerup", 120, 140, id],
  ]);
  await page.waitForTimeout(650);
}
log("hook helper:", await page.evaluate(() => document.querySelector(".helper")?.textContent.slice(0, 30)));
await clickCTA(); // 실험실 열기
log("step2:", await page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().slice(0, 20)));

// ── 2) forceStudio ──
await page.waitForFunction(() => { const c = document.querySelector("canvas"); return c && c.width > 320; }, { timeout: 8000 });
// 공 위치를 모름 → x 스윕으로 그랩 → HUD의 N을 실시간으로 읽으며 목표 힘에서 놓기
const launch = (nMin, nMax, id) => page.evaluate(([nMin, nMax, id]) => {
  const cv = document.querySelector("canvas");
  const r = cv.getBoundingClientRect();
  const by = r.top + 250 * 0.8 - 16;
  const hud = document.querySelector(".stage-hud");
  const readN = () => Number(hud.textContent.match(/(\d+)\s*N/)?.[1] ?? 0);
  const fire = (t, x, y, pid) => cv.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: pid, isPrimary: true, clientX: x, clientY: y }));
  for (const fy of [250 * 0.8 - 16, 250 * 0.8 - 40, 250 * 0.8 - 64, 130, 100]) {
    for (let fx = 24; fx <= r.width - 16; fx += 8) {
      const x = r.left + fx;
      const y = r.top + fy;
      fire("pointerdown", x, y, id);
      fire("pointermove", x + 10, y, id);
      if (readN() > 0) {
        for (let px = x + 10; px <= r.left + r.width + 120; px += 4) {
          fire("pointermove", px, by - 6, id);
          const n = readN();
          if (n >= nMin && n <= nMax) { fire("pointerup", px, by - 6, id); return `grabbed@${fx},${fy} n=${n}`; }
          if (n > nMax) { fire("pointercancel", px, by - 6, id); return `overshoot n=${n}`; }
        }
        fire("pointercancel", x, y, id);
        return "range-end";
      }
      fire("pointerup", x, y, id); // n<2 → 발사 취소
      id += 7;
    }
  }
  return "MISS";
}, [nMin, nMax, id]);
const tryLaunch = async (nMin, nMax, baseId, label) => {
  for (let k = 0; k < 5; k++) {
    const res = await launch(nMin, nMax, baseId + k * 100000);
    log(label + " try" + k + ":", res);
    if (res.startsWith("grabbed")) return true;
    await page.waitForTimeout(1800); // 아직 굴러가는 중이면 기다렸다 재시도
  }
  return false;
};
await tryLaunch(6, 14, 61, "soft"); // 살살 ≤15N
await page.waitForTimeout(4600);
await tryLaunch(26, 46, 62, "hard"); // 세게 ≥25N
await page.waitForTimeout(2000);
log("badges after ball:", await page.evaluate(() => [...document.querySelectorAll(".pn-badge")].map((b) => b.className.includes(" on"))));
// 찰흙 모드
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("찰흙 누르기"))?.click());
await page.waitForTimeout(300);
const clay = await page.evaluate(() => { const c = document.querySelector("canvas"); const r = c.getBoundingClientRect(); return { w: r.width }; });
for (const id of [63, 64, 65]) {
  await firePtr("canvas", [["pointerdown", clay.w * 0.5, 250 * 0.8 - 46, id], ["pointerup", clay.w * 0.5, 250 * 0.8 - 46, id]]);
  await page.waitForTimeout(250);
}
log("badges after clay:", await page.evaluate(() => [...document.querySelectorAll(".pn-badge")].map((b) => b.className.includes(" on"))));
await clickCTA(); // 개념 정리하기
log("step3:", await page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().slice(0, 20)));

// ── 3) recap → 문제 ──
await clickCTA(); // 문제 풀기
log("step4:", await page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().slice(0, 20)));

// ── 4) binSort: 탭 픽(.bin-chip JS click=detail 0) → 통(.bin) 클릭 ──
async function solveBinSort(shapeRe, binShape, binMotion) {
  for (let i = 0; i < 10; i++) {
    const placed = await page.evaluate(([re, bA, bB]) => {
      const chip = document.querySelector(".bin-tray .bin-chip");
      if (!chip) return null;
      const label = chip.textContent.trim();
      chip.click(); // detail 0 → pick
      const bins = [...document.querySelectorAll(".bin")];
      const target = bins.find((b) => b.querySelector(".bin-label").textContent.includes(new RegExp(re).test(label) ? bA : bB));
      target?.click();
      return label.slice(0, 24);
    }, [shapeRe, binShape, binMotion]);
    if (!placed) break;
    await page.waitForTimeout(260);
  }
}
await solveBinSort("찰흙|고무줄|캔", "모양", "운동");
log("binSort state:", await cta());
await clickCTA(); // 확인하기 → 채점
await page.waitForTimeout(700);
await page.evaluate(() => [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => /계속하기|다음/.test(x.textContent))?.click());
await page.waitForTimeout(800);

// ── 5) 퀴즈 3연전 ──
async function solveQuiz(matcher) {
  await page.waitForTimeout(500);
  const picked = await page.evaluate((m) => {
    const btns = [...document.querySelectorAll(".choice, .q-choice, .opt, button")].filter((b) => b.offsetParent && b.closest(".step, .screen"));
    const target = btns.find((b) => new RegExp(m).test(b.textContent));
    if (target) { target.click(); return target.textContent.trim().slice(0, 30); }
    return null;
  }, matcher);
  log("quiz pick:", picked);
  await clickCTA(); // 확인하기 → 채점
  // 시트의 계속하기
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => /계속하기|다음/.test(x.textContent));
    b?.click();
  });
  await page.waitForTimeout(800);
}
await solveQuiz("물질의 종류"); // mcq1 정답 ④
await solveQuiz("작용점, ㉡ 힘의 크기"); // mcq2 정답 ①
// ox: O 버튼
await page.waitForTimeout(400);
await page.evaluate(() => {
  const o = [...document.querySelectorAll("button")].find((b) => b.offsetParent && /^(O|맞아요)$/.test(b.textContent.trim()));
  o?.click();
});
await clickCTA();
await page.waitForTimeout(600);
await page.evaluate(() => [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => /계속하기|다음|완료|끝/.test(x.textContent))?.click());
await page.waitForTimeout(1200);

// ── 6) 완료 화면 → 홈 복귀 확인 ──
const tail = await page.evaluate(() => ({
  screen: document.querySelector(".h1, .done-title, h1")?.textContent?.trim().slice(0, 30),
  hasConfetti: !!document.querySelector(".done, .confetti, canvas.confetti"),
  buttons: [...document.querySelectorAll("button")].filter((b) => b.offsetParent).map((b) => b.textContent.trim().slice(0, 12)).slice(0, 6),
}));
log("after lesson:", JSON.stringify(tail));
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.offsetParent && /홈으로|지도|확인|좋아요/.test(b.textContent))?.click());
await page.waitForTimeout(900);
const home = await page.evaluate(() => ({
  onHome: !!document.querySelector(".gm-node"),
  band: document.querySelector(".unit-band")?.textContent.slice(0, 16),
  doneNode: [...document.querySelectorAll(".gm-node")].find((n) => n.textContent.includes("힘의 표현"))?.className,
}));
log("home:", JSON.stringify(home));
await page.screenshot({ path: "qa/e2e_u5l1_end.png" });
await browser.close();
log("DONE");
