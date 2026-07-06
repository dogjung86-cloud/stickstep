// VII 태양계 — 6레슨 전 스텝 실플레이 E2E (headless Chrome, WebGL/rAF 살아 있음)
// node qa/e2e-u7.mjs  (dev 서버 5173 필요)
import { chromium } from "playwright-core";

const log = (...a) => console.log("[e2e]", ...a);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

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
await page.waitForTimeout(1100);

const cta = () => page.evaluate(() => {
  const b = document.querySelector(".cta button, button.cta, .lesson-cta");
  return b ? { text: b.textContent.trim(), disabled: b.disabled } : null;
});
const clickCTA = async (timeout = 14000) => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".cta button, button.cta, .lesson-cta");
    return b && !b.disabled;
  }, { timeout });
  await page.evaluate(() => document.querySelector(".cta button, button.cta, .lesson-cta").click());
  await page.waitForTimeout(650);
};
const clickBtn = (re) => page.evaluate((re) => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
    .find((x) => new RegExp(re).test(x.textContent));
  if (b) { b.click(); return b.textContent.trim().slice(0, 24); }
  return null;
}, re);
const h1 = () => page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 26));
const helperTxt = () => page.evaluate(() => document.querySelector(".helper")?.textContent.slice(0, 46));
const badges = () => page.evaluate(() => [...document.querySelectorAll(".pn-badge")].map((b) => b.className.includes(" on")));
const firePtr = (sel, seq) => page.evaluate(([sel, seq]) => {
  const t = document.querySelector(sel);
  if (!t) return "NO_TARGET";
  const r = t.getBoundingClientRect();
  for (const [type, fx, fy, id] of seq) {
    t.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerId: id, isPrimary: true,
      clientX: r.left + fx, clientY: r.top + fy,
    }));
  }
  return "ok";
}, [sel, seq]);
const pickChoice = (re) => page.evaluate((re) => {
  const b = [...document.querySelectorAll(".hook-choice")].find((x) => x.offsetParent && new RegExp(re).test(x.textContent));
  b?.click();
  return b?.textContent.trim().slice(0, 20) ?? null;
}, re);
async function solveQuiz(matcher, label) {
  await page.waitForTimeout(450);
  const picked = await page.evaluate((m) => {
    const btns = [...document.querySelectorAll("button")].filter((b) => b.offsetParent);
    const t = btns.find((b) => new RegExp(m).test(b.textContent));
    if (t) { t.click(); return t.textContent.trim().slice(0, 34); }
    return null;
  }, matcher);
  log(`quiz(${label}) pick:`, picked);
  await clickCTA();
  await page.waitForTimeout(500);
  await clickBtn("계속하기|다음");
  await page.waitForTimeout(750);
}
async function solveMulti(matchers, label) {
  await page.waitForTimeout(450);
  for (const m of matchers) {
    await page.evaluate((m) => {
      const t = [...document.querySelectorAll("button")].filter((b) => b.offsetParent).find((b) => new RegExp(m).test(b.textContent));
      t?.click();
    }, m);
    await page.waitForTimeout(160);
  }
  log(`multi(${label}) picked ${matchers.length}`);
  await clickCTA();
  await page.waitForTimeout(500);
  await clickBtn("계속하기|다음");
  await page.waitForTimeout(750);
}
async function solveBinSort(rules) {
  // rules: [ [regex, binLabel], ... ] 순서대로 검사
  for (let i = 0; i < 14; i++) {
    const placed = await page.evaluate((rules) => {
      const chip = document.querySelector(".bin-tray .bin-chip");
      if (!chip) return null;
      const label = chip.textContent.trim();
      chip.click();
      const bins = [...document.querySelectorAll(".bin")];
      let binName = rules.find(([re]) => new RegExp(re).test(label))?.[1];
      const target = bins.find((b) => b.querySelector(".bin-label").textContent.includes(binName ?? "___"));
      target?.click();
      return `${label.slice(0, 14)}→${binName}`;
    }, rules);
    if (!placed) break;
    await page.waitForTimeout(240);
  }
  await clickCTA();
  await page.waitForTimeout(600);
  await clickBtn("계속하기|다음");
  await page.waitForTimeout(750);
}
const openLesson = async (nodeText) => {
  await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.includes("태양계"))?.click());
  await page.waitForTimeout(500);
  const ok = await page.evaluate((t) => {
    const n = [...document.querySelectorAll(".gm-node")].find((n) => n.textContent.includes(t));
    if (!n || n.getAttribute("aria-disabled") === "true") return false;
    n.click();
    return true;
  }, nodeText);
  await page.waitForTimeout(1000);
  return ok;
};
const finishLesson = async () => {
  await page.waitForTimeout(900);
  await clickBtn("홈으로|지도로|확인|좋아요");
  await page.waitForTimeout(900);
};

// ════════ L1 태양계 식구들 ════════
log("=== u7l1 ===", await openLesson("태양계 식구들"));
log("l1 step1:", await h1());
// hook: 밝은 점 탭
await page.evaluate(() => document.querySelector(".hk-space-hit")?.click());
await page.waitForTimeout(1800);
log("l1 hook:", await helperTxt());
await clickCTA(); // 태양계로 출발
log("l1 step2:", await h1());
// solarTour: 가로 진입
log("l1 enter click:", await clickBtn("가로 화면으로"));
await page.waitForFunction(() => !!document.querySelector(".rot-overlay.in .sp3-canvas"), { timeout: 12000 });
await page.waitForTimeout(1600); // three 씬 준비
const tourInfo = await page.evaluate(() => ({
  overlay: !!document.querySelector(".rot-overlay.in"),
  canvas: !!document.querySelector(".sp3-canvas"),
  pill: document.querySelector(".sp3-pill")?.textContent.trim(),
}));
log("l1 tour open:", JSON.stringify(tourInfo));
await page.screenshot({ path: "qa/e2e_u7_tour0.png" });
// 탭 스윕: 화면 중앙 가로선(=스테이지 x축은 clientY 방향) 위 여러 점을 탭 → 카드가 뜨면 이름 읽고 닫기
const visited = new Set();
async function tapSweepOnce() {
  const vw = 420, vh = 900;
  for (let fy = 0.06; fy <= 0.96; fy += 0.05) {
    // 스테이지-로컬 x = clientY, 스테이지-로컬 y = (오른쪽-왼쪽) → 세로선 3열(중앙·±30px)
    for (const cx of [vw / 2, vw / 2 - 34, vw / 2 + 34]) {
      const cy = vh * fy;
      await page.evaluate(([cx, cy]) => {
        const c = document.querySelector(".sp3-canvas");
        const mk = (t) => new PointerEvent(t, { bubbles: true, pointerId: 900 + Math.round(cy + cx), isPrimary: true, clientX: cx, clientY: cy });
        c.dispatchEvent(mk("pointerdown"));
        c.dispatchEvent(mk("pointerup"));
      }, [cx, cy]);
      await page.waitForTimeout(140);
      const card = await page.evaluate(() => {
        const c = document.querySelector(".sp3-card.show b");
        return c ? c.textContent.trim() : null;
      });
      if (card) {
        visited.add(card);
        await page.evaluate(() => document.querySelector(".sp3-cardclose")?.click());
        await page.waitForTimeout(420);
      }
    }
  }
}
async function swipeTour(dy) {
  // 스테이지 x 방향 팬 = clientY 드래그
  await page.evaluate((dy) => {
    const c = document.querySelector(".sp3-canvas");
    const x = 210;
    let y = dy > 0 ? 200 : 760;
    const id = 77;
    const mk = (t, yy) => new PointerEvent(t, { bubbles: true, pointerId: id, isPrimary: true, clientX: x, clientY: yy });
    c.dispatchEvent(mk("pointerdown", y));
    const steps = 12;
    for (let i = 1; i <= steps; i++) c.dispatchEvent(mk("pointermove", y + (dy / steps) * i));
    c.dispatchEvent(mk("pointerup", y + dy));
  }, dy);
  await page.waitForTimeout(700);
}
for (let round = 0; round < 12 && (await badges()).filter(Boolean).length < 3; round++) {
  await tapSweepOnce();
  log(`l1 tour round${round}: visited=[${[...visited].join(",")}] badges=`, await badges());
  if ((await badges()).filter(Boolean).length >= 3) break;
  // 전진하다가(감소 방향) 5라운드 이후엔 뒤로 되돌아오며 혜성 구간을 훑는다
  await swipeTour(round < 5 ? -520 : 520);
}
await page.screenshot({ path: "qa/e2e_u7_tour1.png" });
log("l1 tour visited:", [...visited].join(","), "badges:", await badges());
// 나가기
await page.evaluate(() => document.querySelector(".rot-exit")?.click());
await page.waitForTimeout(700);
await clickCTA(); // 개념 정리하기
log("l1 step3(recap):", await h1());
await clickCTA(); // 문제 풀기
await solveQuiz("태양 쪽으로 꼬리", "l1q1 혜성");
// ox: 위성 → X
await page.waitForTimeout(400);
await clickBtn("^X$|아니에요");
await clickCTA();
await page.waitForTimeout(500);
await clickBtn("계속하기|다음");
await page.waitForTimeout(700);
await solveBinSort([["태양", "스스로"], ["달", "행성 주위"], ["화성|혜성|소행성|왜소", "태양 주위"]]);
await solveQuiz("천왕성", "l1q4");
await finishLesson();
log("l1 done, home:", await page.evaluate(() => !!document.querySelector(".gm-node")));

// ════════ L2 행성 분류 ════════
log("=== u7l2 ===", await openLesson("행성 분류"));
// hook: 예측 → 11개 애니메이션
await page.waitForTimeout(600);
await pickChoice("11");
await page.waitForTimeout(2800);
log("l2 hook:", await helperTxt());
await clickCTA(); // 두 무리로 나누기 → table
log("l2 step2(table):", await h1());
await clickCTA(); // 그래프로 확인 → mcq
await solveQuiz("수성·금성·지구·화성이다", "l2 그래프");
await solveBinSort([["수성|금성|지구|화성", "지구형"], ["목성|토성|천왕성|해왕성", "목성형"]]);
await clickCTA(); // recap → 문제
await solveQuiz("고리 — 지구형: 없다", "l2q1");
await solveQuiz("\\(다\\) → \\(나\\) → \\(가\\)", "l2q2 거리순");
await page.waitForTimeout(400);
await clickBtn("^O$|맞아요");
await clickCTA();
await page.waitForTimeout(500);
await clickBtn("계속하기|다음");
await finishLesson();

// ════════ L3 태양의 활동 ════════
log("=== u7l3 ===", await openLesson("태양의 활동"));
// comic 7컷: CTA 연타
for (let i = 0; i < 7; i++) {
  await clickCTA();
  await page.waitForTimeout(350);
}
log("l3 after comic:", await h1());
// sunLab: ① 흑점 탭(첫 스팟 좌표 계산과 동일: a=.4,d=.35 → cx+cos*d*R, 150 근처)
await page.waitForTimeout(900);
const sun = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const r = c.getBoundingClientRect();
  return { w: r.width };
});
const R = Math.min(sun.w * 0.34, 112);
const spotX = sun.w / 2 + Math.cos(0.4) * 0.35 * R;
const spotY = 150 + Math.sin(0.4) * 0.35 * R * 0.92;
await firePtr("canvas", [["pointerdown", spotX, spotY, 21], ["pointerup", spotX, spotY, 21]]);
await page.waitForTimeout(500);
log("l3 spot badge:", await badges());
// ② 개기일식 모드 + 대기
await clickBtn("개기일식");
await page.waitForTimeout(2400);
log("l3 corona badge:", await badges());
// ③ 슬라이더 최대(활발)
await firePtr(".sl-track", [["pointerdown", 10, 8, 31], ["pointermove", 400, 8, 31], ["pointerup", 400, 8, 31]]);
await page.waitForTimeout(1100);
log("l3 badges:", await badges());
await page.screenshot({ path: "qa/e2e_u7_sunlab.png" });
await clickCTA(); // 구조 라벨 → hotspot
log("l3 hotspot:", await h1());
await page.evaluate(() => document.querySelectorAll(".hs-dot").forEach((d) => d.click()));
await page.waitForTimeout(500);
await clickCTA(); // 다 배웠어요 → recap
await clickCTA(); // 문제
await solveQuiz("^ㄴ, ㄷ$", "l3q1 흑점");
await solveQuiz("홍염은 발생하지 않는다", "l3q2");
await solveMulti(["오로라", "무선 통신", "대규모 정전"], "l3q3");
await solveQuiz("흑점 수가 \\(가\\)보다 많았기", "l3q4");
await page.waitForTimeout(400);
await clickBtn("^O$|맞아요");
await clickCTA();
await page.waitForTimeout(500);
await clickBtn("계속하기|다음");
await finishLesson();

// ════════ L4 돌고 도는 하늘 ════════
log("=== u7l4 ===", await openLesson("돌고 도는 하늘"));
// hook: 낮/저녁 토글 → 예측
await page.waitForTimeout(500);
await clickBtn("낮 12시");
await page.waitForTimeout(400);
await clickBtn("저녁");
await page.waitForTimeout(600);
await pickChoice("지구가 스스로");
await page.waitForTimeout(400);
await clickCTA(); // 별 관측소
log("l4 skyDaily:", await h1());
// 동(기본) 1.7s → 남 → 서 관찰
await page.waitForTimeout(1800);
await clickBtn("^남$");
await page.waitForTimeout(1800);
await clickBtn("^서$");
await page.waitForTimeout(1800);
// 북: 북극성 탭
await clickBtn("^북$");
await page.waitForTimeout(600);
const sky = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const r = c.getBoundingClientRect();
  return { w: r.width };
});
await firePtr("canvas", [["pointerdown", sky.w * 0.5, 0.4 * 300, 41]]);
await page.waitForTimeout(600);
log("l4 pole:", await badges());
// 회전 방향: 반시계
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".hook-choice")].find((x) => /반대/.test(x.textContent));
  b?.click();
});
await page.waitForTimeout(600);
log("l4 sky badges:", await badges());
await page.screenshot({ path: "qa/e2e_u7_sky.png" });
await clickCTA(); // 다음 → mcq 남쪽
await solveQuiz("남쪽 하늘", "l4 south");
// zodiacRing: 지구 드래그
log("l4 zodiac:", await h1());
await page.waitForTimeout(800);
const zg = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const r = c.getBoundingClientRect();
  const W = r.width;
  return { W, cx: W / 2, cy: 172, orbitR: Math.min(W, 340) * 0.21 };
});
const dragArc = (deg) => page.evaluate(([cx, cy, R, deg]) => {
  // 드래그는 각도 '델타'로 적용된다 — 0도에서 시작해 deg만큼 원호를 따라 이동
  const c = document.querySelector("canvas");
  const r = c.getBoundingClientRect();
  const mk = (t, a, id) => c.dispatchEvent(new PointerEvent(t, {
    bubbles: true, pointerId: id, isPrimary: true,
    clientX: r.left + cx + Math.cos(a) * R, clientY: r.top + cy + Math.sin(a) * R,
  }));
  const target = (deg * Math.PI) / 180;
  const id = 61 + Math.round(Math.abs(deg));
  mk("pointerdown", 0, id);
  const steps = Math.max(8, Math.round(Math.abs(deg) / 6));
  for (let i = 1; i <= steps; i++) mk("pointermove", (target * i) / steps, id);
  mk("pointerup", target, id);
}, [zg.cx, zg.cy, zg.orbitR, deg]);
const readMonth = () => page.evaluate(() => {
  const t = document.querySelector(".stage-hud .pill")?.textContent ?? "";
  const m = t.match(/(\d+)월/);
  return m ? Number(m[1]) - 1 : null;
});
// 3D 원근에선 화면 원호 ↔ 궤도 각의 이득·부호가 화면 위치마다 달라진다.
// 한 번 밀어 부호를 측정한 뒤, 작은 스텝 피드백으로 수렴시킨다.
let zSign = 0;
async function gotoMonth(target, label) {
  if (!zSign) {
    const before = await readMonth();
    await dragArc(35);
    await page.waitForTimeout(300);
    const after = await readMonth();
    let d = after - before;
    if (d > 6) d -= 12;
    if (d < -6) d += 12;
    zSign = d < 0 ? -1 : 1;
    log(`l4 zodiac drag sign: ${zSign} (${before + 1}→${after + 1}월)`);
  }
  for (let k = 0; k < 36; k++) {
    const cur = await readMonth();
    if (cur === target) {
      await page.waitForTimeout(950); // 홀드 판정
      log(`l4 zodiac ${label}: ${target + 1}월 도착`, await badges());
      return;
    }
    let diff = target - cur;
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;
    const step = Math.max(14, Math.min(Math.abs(diff) * 26, 80));
    await dragArc(zSign * Math.sign(diff) * step);
    await page.waitForTimeout(240);
  }
  log(`l4 zodiac ${label}: 실패(월=${await readMonth()})`);
}
await dragArc(120); // look 목표(누적 회전)
await page.waitForTimeout(400);
log("l4 zodiac pill:", await page.evaluate(() => document.querySelector(".stage-hud .pill")?.textContent));
await gotoMonth(3, "fish(4월)");
await gotoMonth(6, "archer(7월)");
log("l4 zodiac badges2:", await badges());
await page.screenshot({ path: "qa/e2e_u7_zodiac.png" });
await clickCTA(); // 개념 정리하기
await clickCTA(); // 문제
await solveQuiz("북극성을 중심으로", "l4q1");
await page.waitForTimeout(400);
await clickBtn("^X$|아니에요");
await clickCTA();
await page.waitForTimeout(500);
await clickBtn("계속하기|다음");
await page.waitForTimeout(700);
await solveQuiz("염소자리 — \\(나\\) 게자리", "l4q3 12궁");
await solveMulti(["연주 운동", "계절에 따라"], "l4q4");
await finishLesson();

// ════════ L5 달의 위상 ════════
log("=== u7l5 ===", await openLesson("달의 위상"));
await page.waitForTimeout(600);
await clickBtn("오늘 밤 사진");
await page.waitForTimeout(1400);
await pickChoice("태양 빛을 받아");
await page.waitForTimeout(400);
await clickCTA(); // 3D 달 궤도 열기
log("l5 moon3d:", await h1());
await page.waitForTimeout(2600); // three 로드
const moonInfo = await page.evaluate(() => ({
  pill: document.querySelector(".stage-hud .pill")?.textContent.trim(),
  fallback: !!document.querySelector(".sp3-fallback"),
}));
log("l5 3d state:", JSON.stringify(moonInfo));
// 궤도 위 4방향을 홀드: 오른쪽(삭)→위(상현)→왼쪽(망)→아래(하현)
const mc = await page.evaluate(() => {
  const c = document.querySelector("canvas.mstage-cvblock");
  const r = c.getBoundingClientRect();
  return { w: r.width, h: 350 };
});
async function holdMoon(fx, fy, id) {
  await firePtr("canvas.mstage-cvblock", [["pointerdown", fx, fy, id]]);
  await page.waitForTimeout(700);
  await firePtr("canvas.mstage-cvblock", [["pointerup", fx, fy, id]]);
  await page.waitForTimeout(350);
}
await holdMoon(mc.w * 0.86, mc.h * 0.52, 71); // 삭(오른쪽)
log("l5 after right:", await page.evaluate(() => document.querySelector(".stage-hud .pill")?.textContent.trim()), await badges());
await holdMoon(mc.w * 0.5, mc.h * 0.16, 72); // 상현(위)
await holdMoon(mc.w * 0.13, mc.h * 0.52, 73); // 망(왼쪽)
await holdMoon(mc.w * 0.5, mc.h * 0.9, 74); // 하현(아래)
log("l5 badges:", await badges());
await page.screenshot({ path: "qa/e2e_u7_moon.png" });
// 지구에서 보기 전환도 한번
await clickBtn("지구에서");
await page.waitForTimeout(700);
await page.screenshot({ path: "qa/e2e_u7_moon_earthview.png" });
await clickCTA(); // 개념 정리
await clickCTA(); // 문제
await solveQuiz("^③$", "l5q1 상현");
await solveQuiz("오른쪽이 밝은 반달", "l5q2 (라)");
await page.waitForTimeout(400);
await clickBtn("^O$|맞아요");
await clickCTA();
await page.waitForTimeout(500);
await clickBtn("계속하기|다음");
await page.waitForTimeout(700);
await solveQuiz("지구가 태양과 달 사이", "l5q4 추석");
await solveBinSort([["삭", "같은 방향"], ["망", "반대 방향"], ["상현|하현", "직각"]]);
await finishLesson();

// ════════ L6 일식과 월식 ════════
log("=== u7l6 ===", await openLesson("일식과 월식"));
await page.waitForTimeout(600);
await clickBtn("태양 관측 안경 쓰기");
await page.waitForTimeout(1500);
await pickChoice("달이 태양 앞");
await page.waitForTimeout(400);
await clickCTA(); // 3D 정렬 실험실
log("l6 eclipse:", await h1());
log("l6 enter click:", await clickBtn("가로 화면으로"));
await page.waitForFunction(() => !!document.querySelector(".rot-overlay.in .sp3-canvas"), { timeout: 12000 });
await page.waitForTimeout(1600);
log("l6 overlay:", await page.evaluate(() => ({
  overlay: !!document.querySelector(".rot-overlay.in"),
  pill: document.querySelector(".sp3-pill")?.textContent.trim(),
})));
// 정렬 스캔: 스테이지 격자 점을 탭하며 pill/배지 반응 확인
async function scanAlign(targetBadgeIdx, label) {
  const vw = 420, vh = 900;
  for (let gy = 0.12; gy <= 0.97; gy += 0.045) {
    for (let gx of [0.58, 0.5, 0.66, 0.42, 0.74]) {
      await page.evaluate(([cx, cy]) => {
        const c = document.querySelector(".sp3-canvas");
        const id = 500 + Math.round(cx + cy);
        const mk = (t) => new PointerEvent(t, { bubbles: true, pointerId: id, isPrimary: true, clientX: cx, clientY: cy });
        c.dispatchEvent(mk("pointerdown"));
      }, [vw * gx, vh * gy]);
      await page.waitForTimeout(430);
      await page.evaluate(() => {
        const c = document.querySelector(".sp3-canvas");
        c.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1, isPrimary: true }));
      });
      const b = await badges();
      if (b[targetBadgeIdx]) { log(`l6 ${label} aligned @ (${gx.toFixed(2)},${gy.toFixed(2)})`); return true; }
    }
  }
  return false;
}
const solarOK = await scanAlign(0, "solar");
log("l6 after solar:", await badges());
await page.screenshot({ path: "qa/e2e_u7_eclipse_solar.png" });
if (solarOK) {
  await page.waitForTimeout(400);
  const g = await clickBtn("지상에서 보기");
  log("l6 groundbtn:", g);
  await page.waitForTimeout(1600);
  log("l6 ground badge:", await badges());
  await page.screenshot({ path: "qa/e2e_u7_eclipse_ground.png" });
  await clickBtn("우주로 돌아가기");
  await page.waitForTimeout(800);
}
const lunarOK = await scanAlign(2, "lunar");
log("l6 badges:", await badges(), "lunarOK:", lunarOK);
await page.screenshot({ path: "qa/e2e_u7_eclipse_lunar.png" });
await page.evaluate(() => document.querySelector(".rot-exit")?.click());
await page.waitForTimeout(700);
await clickCTA(); // 개념 정리
await clickCTA(); // 문제
await solveQuiz("^ㄱ, ㄴ$", "l6q1 모형");
await page.waitForTimeout(400);
await clickBtn("^X$|아니에요");
await clickCTA();
await page.waitForTimeout(500);
await clickBtn("계속하기|다음");
await page.waitForTimeout(700);
await solveQuiz("개기월식 — \\(나\\) 부분월식", "l6q3");
await solveQuiz("굴절된 빛", "l6q4");
await solveQuiz("밤인 지역 어디서나", "l6q5");
await finishLesson();

const homeEnd = await page.evaluate(() => ({
  nodes: [...document.querySelectorAll(".gm-node")].map((n) => `${n.textContent.trim().slice(0, 10)}:${/done/.test(n.className) ? "done" : /now/.test(n.className) ? "now" : "?"}`),
}));
log("u7 final:", JSON.stringify(homeEnd));
await page.screenshot({ path: "qa/e2e_u7_home_end.png" });
await browser.close();
log("DONE");
