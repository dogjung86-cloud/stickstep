// 중1 수학 Ⅵ 통계 — 6레슨 전 스텝 실플레이 E2E. node qa/e2e-math6.mjs (PORT 기본 5173)
// 2026-07-10 재편: L1 대푯값 통합(평균 계산 탭·극단값 드래그·대표 선택 + 타워 카드 탭·선발전),
// L2 줄기와 잎(마라톤 훅 + 농구 득점), L6 통계적 문제해결(보스전 폐기, 자기 내용 드릴만).
// 규칙: 랩 애니 잠금 대비 재시도 루프, 실행 중 src 편집 금지, 드릴 종료 후는 완료 화면 "홈으로" 버튼.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const lessons = {};
  for (let i = 1; i <= 12; i++) lessons[`m1u1l${i}`] = { done: true, acc: 95, bestXp: 120 };
  for (let i = 1; i <= 9; i++) lessons[`m1u2l${i}`] = { done: true, acc: 95, bestXp: 120 };
  for (let i = 1; i <= 9; i++) lessons[`m1u3l${i}`] = { done: true, acc: 95, bestXp: 120 };
  for (let i = 1; i <= 13; i++) lessons[`m1u4l${i}`] = { done: true, acc: 95, bestXp: 120 };
  for (let i = 1; i <= 14; i++) lessons[`m1u5l${i}`] = { done: true, acc: 95, bestXp: 120 };
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 4200, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const h1 = () => page.evaluate(() => document.querySelector(".step .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 34));
const clickCTA = async (timeout = 26000) => {
  await page.waitForFunction(() => { const b = document.querySelector("button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector("button.cta").click());
  await W(560);
};
const clickBtn = async (re, wait = 420) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return true; }
    return false;
  }, re);
  if (!t) throw new Error(`clickBtn 실패: /${re}/ @ ${await h1()}`);
  await W(wait);
};
const waitBtn = async (re, wait = 420, timeout = 22000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 18000 });
  await page.evaluate(() => document.querySelector(".hook-choices.show .hook-choice").click());
  await W(420);
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(240);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
const quiz = async (i) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await page.evaluate((i) => document.querySelectorAll(".opts .opt")[i].click(), i);
  await W(220); await clickCTA(); await sheetContinue();
};
const oxPick = async (v) => {
  await page.waitForSelector(".ox-btn", { timeout: 9000 });
  await page.evaluate((v) => document.querySelector(v ? ".ox-btn.o" : ".ox-btn.x").click(), v);
  await W(220); await clickCTA(); await sheetContinue();
};
const binSortAuto = async (pairs) => {
  await page.waitForSelector(".bin-chip", { timeout: 9000 });
  for (const [chipRe, binRe] of pairs) {
    const ok = await page.evaluate(([cRe, bRe]) => {
      const chip = [...document.querySelectorAll(".bin-tray .bin-chip")].find((c) => new RegExp(cRe).test(c.textContent));
      if (!chip) return `NO_CHIP ${cRe}`;
      chip.click();
      const bin = [...document.querySelectorAll(".bin")].find((b) => new RegExp(bRe).test(b.querySelector(".bin-label")?.textContent ?? ""));
      if (!bin) return `NO_BIN ${bRe}`;
      (bin.querySelector(".bin-head") ?? bin).click();
      return true;
    }, [chipRe, binRe]);
    if (ok !== true) throw new Error(`binSort: ${ok}`);
    await W(200);
  }
  await clickCTA(); await sheetContinue();
};
const orderAuto = async (chipRes) => {
  await page.waitForSelector(".ord-chip", { timeout: 9000 });
  for (const re of chipRes) {
    await page.evaluate((re) => {
      const c = [...document.querySelectorAll(".ord-chip")].find((x) => new RegExp(re).test(x.textContent));
      c?.click();
    }, re);
    await W(240);
  }
  await clickCTA(); await sheetContinue();
};
const npKey = async (label) => {
  await page.evaluate((label) => {
    const k = [...document.querySelectorAll(".mnp-k")].find((x) => x.textContent.trim() === label && !x.disabled);
    if (!k) throw new Error(`no key ${label}`);
    k.click();
  }, label);
  await W(70);
};
const typeAns = async (ans) => {
  const s = String(ans);
  for (const ch of s) {
    if (ch === ".") await npKey("·");
    else await npKey(ch);
  }
};
const drill = async (answers) => {
  await page.waitForSelector(".mdr-q", { timeout: 9000 });
  for (const a of answers) { await typeAns(a); await clickCTA(); await W(1050); }
  await clickCTA();
};
const openLesson = async (labelRe) => {
  await page.waitForSelector(".gm-node", { timeout: 9000 });
  const ok = await page.evaluate((re) => {
    const n = [...document.querySelectorAll(".gm-node")].find((x) => new RegExp(re).test(x.getAttribute("aria-label") ?? ""));
    if (!n) return false;
    n.click();
    return true;
  }, labelRe);
  if (!ok) throw new Error(`레슨 노드 없음: ${labelRe}`);
  await W(900);
};

/* ── SVG viewBox 좌표 → pointer 이벤트 ── */
const svgPt = async (sel, vx, vy, VW, VH, kinds = ["pointerdown", "pointerup"], pid = 21) => {
  await page.evaluate(([sel, vx, vy, VW, VH, kinds, pid]) => {
    const svg = document.querySelector(sel);
    if (!svg) throw new Error(`no svg ${sel}`);
    const r = svg.getBoundingClientRect();
    const cx = r.left + (vx / VW) * r.width;
    const cy = r.top + (vy / VH) * r.height;
    const o = { bubbles: true, pointerId: pid, isPrimary: true, clientX: cx, clientY: cy };
    for (const k of kinds) svg.dispatchEvent(new PointerEvent(k, o));
  }, [sel, vx, vy, VW, VH, kinds, pid]);
};
const svgDrag = async (sel, pts, VW, VH, stepWait = 40) => {
  const [x0, y0] = pts[0];
  await svgPt(sel, x0, y0, VW, VH, ["pointerdown"]);
  for (const [x, y] of pts.slice(1)) {
    await svgPt(sel, x, y, VW, VH, ["pointermove"]);
    await W(stepWait);
  }
  const [xe, ye] = pts[pts.length - 1];
  await svgPt(sel, xe, ye, VW, VH, ["pointerup"]);
  await W(280);
};
/** 하위 요소(행·열·히트 영역)에 직접 pointerdown. */
const tapEl = async (sel, idx = 0, wait = 300) => {
  const ok = await page.evaluate(([sel, idx]) => {
    const t = document.querySelectorAll(sel)[idx];
    if (!t) return false;
    t.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 22, isPrimary: true }));
    return true;
  }, [sel, idx]);
  if (!ok) throw new Error(`tapEl 실패: ${sel}[${idx}] @ ${await h1()}`);
  await W(wait);
};
const chipOn = (id) => page.evaluate((id) => document.querySelector(`[data-g="${id}"]`)?.classList.contains("on") ?? false, id);
const untilChip = async (id, fn, tries = 8, label = "") => {
  for (let t = 0; t < tries; t++) {
    if (await chipOn(id)) return;
    await fn(t);
    await W(650);
  }
  if (!(await chipOn(id))) throw new Error(`untilChip 실패: ${id} ${label} @ ${await h1()}`);
};

const log = (m) => console.log("  ·", m);
console.log("=== 중1 수학 Ⅵ e2e 시작 (6레슨) ===");

await page.waitForSelector(".unit-tab", { timeout: 9000 });
await clickBtn("VI\\. 통계", 700);
const nodeCount = await page.evaluate(() => document.querySelectorAll(".gm-node").length);
log(`홈 지도 노드: ${nodeCount}`);
await shot("math6-home");

/* ================= L1 대푯값: 평균, 중앙값, 최빈값 ================= */
await openLesson("대푯값");
log(`L1: ${await h1()}`);
await waitBtn("마지막 영수증 공개", 2600);
await hookChoice();
await clickCTA();
await clickCTA(); // concept 자료·변량·대푯값
await quiz(0); // 팔굽혀펴기 평균
await clickCTA(); // concept 평균의 배신
// meanPullLab: 평균 계산 → 마지막 점 8→33 드래그 → 대표 선택 "8천 원"
await page.waitForSelector(".mpl-stage svg", { timeout: 9000 });
await waitBtn("평균 계산", 2100);
await untilChip("pull", async () => {
  await svgDrag(".mpl-stage svg", [[92, 132], [160, 132], [230, 132], [297, 132]], 340, 206, 50);
}, 6, "극단값 드래그");
await W(2300);
await waitBtn("^8천 원$", 900);
await clickCTA();
await clickCTA(); // concept 중앙값
await orderAuto(["7분", "9분", "15분", "24분", "41분"]);
await quiz(0); // 게임 시간 중앙값
// modeLab: 카드 12장 → 평균 색깔 계산 → 최빈값 읽기(검정)
await page.waitForSelector(".mmo-cardbtn", { timeout: 9000 });
for (let i = 0; i < 12; i++) await waitBtn("판매 기록", 160);
await W(2400);
await waitBtn("평균 색깔 계산하기", 3400);
await waitBtn("^검정$", 1600);
await clickCTA();
await clickCTA(); // concept 최빈값·대표 선택
await clickCTA(); // recap 4카드
await quiz(0); // dotPlot 대푯값 선택
await quiz(0); // 운동화 치수 최빈값
await binSortAuto([
  ["고르게 나온 수학", "평균"],
  ["억대인 유튜버", "중앙값"],
  ["티셔츠", "최빈값"],
  ["계절", "최빈값"],
  ["초고가", "중앙값"],
  ["통학", "평균"],
]);
await drill([5, 8, 4, 5, 7, 2, 8, 260]);
await clickBtn("홈으로", 900).catch(() => {});
log("L1 완료");

/* ================= L2 줄기와 잎 그림 ================= */
await openLesson("줄기와 잎");
log(`L2: ${await h1()}`);
await waitBtn("나이 앞자리로 묶기", 2600);
await hookChoice();
await clickCTA();
// stemLab(농구 득점): DATA 순서대로 줄기 행 탭 → 정렬 → 줄기 2 → 36점
await page.waitForSelector(".mstm-row", { timeout: 9000 });
for (const si of [2, 0, 3, 1, 4, 2, 3, 1, 2, 3, 2, 1]) {
  await tapEl(`.mstm-row[data-s="${si}"]`, 0, 140);
}
await waitBtn("잎 크기순 정렬", 1300);
await waitBtn("줄기 2", 1900);
await waitBtn("^36점$", 900);
await clickCTA();
await clickCTA(); // concept
await clickCTA(); // recap
await quiz(0);
await oxPick(false);
await drill([47, 2, 0, 4, 15, 12]);
await clickBtn("홈으로", 900).catch(() => {});
log("L2 완료");

/* ================= L3 도수분포표 ================= */
await openLesson("도수분포표");
log(`L3: ${await h1()}`);
await waitBtn("내 체급 찾기", 2600);
await hookChoice();
await clickCTA();
await page.waitForSelector(".mfq-col", { timeout: 9000 });
for (const bi of [1, 2, 0, 2, 3, 1]) {
  await tapEl(`.mfq-col[data-b="${bi}"]`, 0, 160);
}
await W(3400);
await waitBtn("너비 25kg", 600);
await waitBtn("너비 5kg", 600);
await waitBtn("너비 1kg", 1800);
await waitBtn("50~55", 900);
await clickCTA();
await clickCTA(); // concept
await clickCTA(); // recap
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([5, 1, 20, 8, 4, 16]);
await clickBtn("홈으로", 900).catch(() => {});
log("L3 완료");

/* ================= L4 히스토그램 ================= */
await openLesson("히스토그램");
log(`L4: ${await h1()}`);
await waitBtn("프로 모드 켜기", 2600);
await hookChoice();
await clickCTA();
await page.waitForSelector(".mhs-hit", { timeout: 9000 });
for (const bi of [0, 1, 2, 3, 4]) await tapEl(`.mhs-hit[data-b="${bi}"]`, 0, 150);
await W(1700);
for (const bi of [0, 1, 2, 3, 4]) await tapEl(`.mhs-hit[data-b="${bi}"]`, 0, 180);
await W(1000);
await waitBtn("내려 닫는다", 2400);
await waitBtn("^12명$", 900);
await clickCTA();
await clickCTA(); // concept
await clickCTA(); // recap
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([10, 20, 1, 9, 20, 0]);
await clickBtn("홈으로", 900).catch(() => {});
log("L4 완료");

/* ================= L5 상대도수 ================= */
await openLesson("상대도수");
log(`L5: ${await h1()}`);
await waitBtn("비율로 다시 보기", 2600);
await hookChoice();
await clickCTA();
await waitBtn("전체 인원부터", 2100);
await waitBtn("1반", 500);
await waitBtn("2반", 1500);
await waitBtn("세로축을 비율로 바꾸기", 3300);
await waitBtn("^1$", 900);
await clickCTA();
await clickCTA(); // concept
await clickCTA(); // recap
await quiz(0);
await quiz(0);
await oxPick(true);
await drill(["0.25", 15, 30, "0.2", 35, 24]);
await clickBtn("홈으로", 900).catch(() => {});
log("L5 완료");

/* ================= L6 통계적 문제해결: 그래프 탐정 ================= */
await openLesson("문제해결");
log(`L6: ${await h1()}`);
await waitBtn("다른 뉴스 그래프 보기", 2600);
await hookChoice();
await clickCTA();
await clickCTA(); // concept(4단계·눈금 함정)
await clickCTA(); // recap
await orderAuto(["탐구 문제 설정", "자료 수집", "자료 분석", "결과 해석"]);
await oxPick(true);
await quiz(0);
await shot("math6-l6");
await drill([5, 3, 94, 30, 6, 2]);
await clickBtn("홈으로", 900).catch(() => {});
log("L6 완료");

await W(800);
await shot("math6-done");
console.log(`=== Ⅵ e2e 완료 · pageErrors: ${pageErrors} ===`);
await browser.close();
process.exit(pageErrors > 0 ? 1 : 0);
