// 레이저 미로 E2E — 진입(프리미엄 시딩)→부트→소리 토글→
// 생성기 소크(1~120판: 정답 상태 전 보석 점등·섞은 상태 미완성·폴백 0·커브 데뷔·결정성)→
// 1판 실회전 클리어(+3 스틱·자동 다음 판)→리셋→2·3판 클리어→스테퍼 재플레이(보상 없음)→
// 합성판(7판 pair)·하양판(12판 white) 실플레이→나가기 복귀→무료 계정 페이월 게이트까지.
// PORT=<포트> node qa/e2e-lasermaze.mjs — dev 서버 필수(data-lzm-*·__lzmDev 훅이 DEV 전용).
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });
// 동시 세션 편집 → vite HMR 풀 리로드 간섭 차단(@vite/client 스텁 — CSS 주입만 유지)
await page.route("**/@vite/client", (r) =>
  r.fulfill({
    contentType: "application/javascript",
    body: `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};`,
  }),
);

let PASS = 0, FAIL = 0;
const ok = (cond, name, extra = "") => {
  if (cond) { PASS++; console.log("  ok  ", name); }
  else { FAIL++; console.log("  FAIL", name, extra); }
};
const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const store = () => page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")));
const attr = (name) => page.evaluate((n) => document.getElementById("sc-lasermaze")?.dataset[n], name);

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: true, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lifeXp: 0, lessons: {}, minigame: {}, exams: {}, wrongNotes: {},
};

async function seedAndEnter(minigame) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => {
    localStorage.setItem("science-app.v1", JSON.stringify(s));
    localStorage.setItem("lzm.sound", "1");
  }, { ...BASE, minigame });
  await page.reload({ waitUntil: "networkidle" });
  await W(1100);
  await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
  await W(400);
  await page.evaluate(() => document.getElementById("btn-lasermaze").click());
  await page.waitForSelector("#sc-lasermaze", { timeout: 4000 });
  await W(650);
}

/** 현재 판을 정답 각도로 회전해 푼다 — 틀린 거울을 하나씩 탭. */
async function solveCurrent() {
  for (let i = 0; i < 16; i++) {
    const done = await page.evaluate(() => {
      const dev = window.__lzmDev;
      if (dev.won()) return true;
      const w = dev.wrongCells();
      if (!w.length) return true;
      const p = dev.pos(w[0].x, w[0].y);
      const cv = document.querySelector("#sc-lasermaze .lzm-cv");
      cv.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 5, clientX: p.x, clientY: p.y, bubbles: true, isPrimary: true, pointerType: "touch" }));
      return false;
    });
    if (done) break;
    await W(55);
  }
  await W(180);
}

// ── 진입: 도전 탭 → 카드 → 게임 ────────────────────────────
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.evaluate((s) => {
  localStorage.setItem("science-app.v1", JSON.stringify(s));
  localStorage.setItem("lzm.sound", "1");
}, BASE);
await page.reload({ waitUntil: "networkidle" });
await W(1100);
await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
await W(400);
ok(await page.$("#sc-challenge"), "도전 탭 진입");
ok(await page.$("#btn-lasermaze"), "레이저 미로 카드 존재");
ok(await page.evaluate(() => document.querySelector("#btn-lasermaze .prep-pill.gold")?.textContent.includes("프리미엄")), "카드에 프리미엄 크라운");
await page.evaluate(() => document.getElementById("btn-lasermaze").click());
await page.waitForSelector("#sc-lasermaze", { timeout: 4000 });
await W(650);
ok((await attr("lzmStage")) === "1", "1판에서 시작", await attr("lzmStage"));
ok((await attr("lzmPhase")) === "idle", "초기 phase=idle");
ok((await attr("lzmGems")) === "0/1", "1판 보석 0/1", await attr("lzmGems"));
ok((await attr("lzmKind")) === "mono", "1판은 단색판");
const px0 = await page.evaluate(() => {
  const cv = document.querySelector("#sc-lasermaze .lzm-cv");
  const d = cv.getContext("2d").getImageData(Math.floor(cv.width / 2), Math.floor(cv.height / 2), 1, 1).data;
  return [d[0], d[1], d[2], d[3]];
});
ok(px0[3] === 255 && px0[0] + px0[1] + px0[2] > 0, "캔버스 렌더 픽셀", JSON.stringify(px0));
await shot("lasermaze-boot");

// ── 소리 토글 ───────────────────────────────────────────────
const snd = await page.evaluate(() => {
  const b = document.querySelector("#sc-lasermaze .lzm-snd");
  b.click();
  const mid = [b.getAttribute("aria-pressed"), localStorage.getItem("lzm.sound")];
  b.click();
  return { mid, after: [b.getAttribute("aria-pressed"), localStorage.getItem("lzm.sound")] };
});
ok(snd.mid[0] === "false" && snd.mid[1] === "0" && snd.after[0] === "true" && snd.after[1] === "1", "소리 토글·영속", JSON.stringify(snd));

// ── 생성기 소크: 1~120판 — "풀 수 없는 판 0%"의 기계 증명 ──
const soak = await page.evaluate(() => {
  const bad = [];
  const sum = { pair: 0, white: 0, split: 0, maxMirror: 0 };
  for (let s = 1; s <= 120; s++) {
    const r = window.__lzmDev.inspect(s);
    if (!r.solutionWins) bad.push(`${s}:solution-fail`);
    if (r.scrambledWon) bad.push(`${s}:already-won`);
    if (r.fallback) bad.push(`${s}:fallback`);
    if (r.rotatable < 1) bad.push(`${s}:no-rotatable`);
    if (![5, 6, 7].includes(r.grid)) bad.push(`${s}:grid=${r.grid}`);
    if (r.targets < 1 || r.emitters < 1) bad.push(`${s}:empty`);
    if (r.mirrors > 12) bad.push(`${s}:mirrors=${r.mirrors}`);
    if (r.kind === "pair") sum.pair++;
    if (r.kind === "white") sum.white++;
    if (r.splitters > 0) sum.split++;
    sum.maxMirror = Math.max(sum.maxMirror, r.mirrors);
  }
  return { bad, sum };
});
ok(soak.bad.length === 0, "소크 1~120판: 정답 상태 전부 점등·섞은 상태 미완성·폴백 0", soak.bad.slice(0, 8).join(" "));
ok(soak.sum.pair >= 40, "합성판 비중(한 판 걸러)", JSON.stringify(soak.sum));
ok(soak.sum.white >= 10, "하양(삼원색) 판 존재", String(soak.sum.white));
ok(soak.sum.split >= 30, "반거울 판 비중(모노+두 갈래 14판+)", String(soak.sum.split));
const det = await page.evaluate(() => {
  const a = JSON.stringify(window.__lzmDev.inspect(23));
  const b = JSON.stringify(window.__lzmDev.inspect(23));
  const s1 = window.__lzmDev.inspect(1);
  const s5 = window.__lzmDev.inspect(5);
  const s7 = window.__lzmDev.inspect(7);
  const s12 = window.__lzmDev.inspect(12);
  return { det: a === b, s1, s5, s7, s12 };
});
ok(det.det, "결정성 — 같은 판은 언제나 같은 그림");
ok(det.s1.kind === "mono" && det.s1.splitters === 0 && det.s1.targets === 1 && det.s1.mirrors <= 2, "1판 = 단순 단색판", JSON.stringify(det.s1));
ok(det.s5.splitters >= 1, "5판 반거울 데뷔");
ok(det.s7.kind === "pair" && det.s7.emitters === 2 && det.s7.targets === 1, "7판 2색 합성 데뷔", JSON.stringify(det.s7));
ok(det.s12.kind === "white" && det.s12.emitters === 3, "12판 삼원색 하양 데뷔", JSON.stringify(det.s12));

// ── 1판: 실회전 클리어 → +3 스틱 → 자동 다음 판 ────────────
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "1판 클리어 판정");
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-banner").classList.contains("on")), "완성 배너 표시");
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-ban-sub").textContent.includes("+3 스틱")), "첫 클리어 보상 문구");
await shot("lasermaze-clear1");
await W(1700);
ok((await attr("lzmStage")) === "2", "자동으로 2판 진입", await attr("lzmStage"));
let st = await store();
ok(st.minigame.lasermaze === 1 && st.totalXp === 3, "저장: 최고 1판·+3 스틱", JSON.stringify([st.minigame, st.totalXp]));
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .mg-best").textContent.includes("최고 1판")), "최고 기록 필 갱신");

// ── 2·3판 클리어 → 4판 ─────────────────────────────────────
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "2판 클리어");
await W(1700);
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "3판 클리어");
await W(1700);
ok((await attr("lzmStage")) === "4", "4판 진입");
st = await store();
ok(st.minigame.lasermaze === 3 && st.totalXp === 9, "저장: 최고 3판·스틱 9", JSON.stringify([st.minigame, st.totalXp]));

// ── 스테퍼: 이전 판 재플레이는 보상 없음 ────────────────────
await page.evaluate(() => document.querySelectorAll("#sc-lasermaze .lzm-nav")[0].click());
await W(150);
ok((await attr("lzmStage")) === "3", "이전 판(3판) 재진입");
await solveCurrent();
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-ban-sub").textContent.includes("이미 깬")), "재플레이 배너 — 보상 없음 문구");
await W(1700);
st = await store();
ok(st.minigame.lasermaze === 3 && st.totalXp === 9, "재플레이는 스틱·기록 불변", JSON.stringify([st.minigame, st.totalXp]));

// ── 합성판(7판)·하양판(12판) 실플레이 ──────────────────────
await seedAndEnter({ lasermaze: 6 });
ok((await attr("lzmStage")) === "7" && (await attr("lzmKind")) === "pair", "7판(2색 합성) 진입", await attr("lzmKind"));
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-helper span").textContent.includes("모이면")), "가산혼합 코치 문구");
await shot("lasermaze-pair");
// 리셋 검증 — 정답 각도인 거울을 하나 틀어(절대 풀리지 않는 조작) 리셋으로 복원되는지
const wrong0 = await page.evaluate(() => window.__lzmDev.wrongCells().length);
const safe = await page.evaluate(() => window.__lzmDev.rot().find((r) => !r.wrong) ?? null);
ok(!!safe, "정답 각도 거울 존재(리셋 테스트 전제)");
await page.evaluate((s) => {
  const p = window.__lzmDev.pos(s.x, s.y);
  document.querySelector("#sc-lasermaze .lzm-cv").dispatchEvent(new PointerEvent("pointerdown", { pointerId: 6, clientX: p.x, clientY: p.y, bubbles: true, isPrimary: true }));
}, safe);
await W(100);
ok((await attr("lzmTaps")) === "1" && !(await page.evaluate(() => window.__lzmDev.won())), "회전 탭 집계(미완성 유지)");
await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-abtn").click());
await W(120);
const wrongAfter = await page.evaluate(() => window.__lzmDev.wrongCells().length);
ok((await attr("lzmTaps")) === "0" && wrongAfter === wrong0, "처음 배치로 리셋", `${wrongAfter}/${wrong0}`);
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "합성판 클리어(두 빛이 한 보석에)");
await seedAndEnter({ lasermaze: 11 });
ok((await attr("lzmStage")) === "12" && (await attr("lzmKind")) === "white", "12판(삼원색 하양) 진입");
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-helper span").textContent.includes("삼원색")), "삼원색 코치 문구");
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "하양판 클리어(세 빛 합류)");
await shot("lasermaze-white");

// ── 나가기 → 도전 탭 복귀 ───────────────────────────────────
await W(1700);
await page.evaluate(() => document.querySelector("#sc-lasermaze .xbtn").click());
await W(500);
ok(await page.$("#sc-challenge"), "나가기 — 도전 탭 복귀");

// ── 무료 계정 페이월 게이트 ─────────────────────────────────
await page.evaluate((s) => localStorage.setItem("science-app.v1", JSON.stringify({ ...s, premium: false })), BASE);
await page.reload({ waitUntil: "networkidle" });
await W(1000);
await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
await W(400);
await page.evaluate(() => document.getElementById("btn-lasermaze").click());
await W(700);
ok(await page.evaluate(() => document.querySelector(".pw-title")?.textContent.includes("프리미엄")), "무료 계정 — 페이월 게이트");

ok(pageErrors === 0, "페이지 에러 0", String(pageErrors));
console.log(`\n결과: ${PASS} 통과 / ${FAIL} 실패`);
await browser.close();
process.exit(FAIL ? 1 : 0);
