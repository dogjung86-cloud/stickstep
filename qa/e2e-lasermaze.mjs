// 레이저 미로 v2(블록 배치) E2E — 진입(프리미엄 시딩)→부트→소리 토글→
// 생성기 소크(1~120판: 정답 배치 전 보석 점등·흩은 상태 미완성·폴백 0·커브 데뷔·결정성)→
// 1판 탭-탭 이동 클리어(+3 스틱·자동 다음 판)→실드래그 문법(집기→끌기→놓기)→2·3판 클리어→
// 스테퍼 재플레이(보상 없음)→합성판(7판 pair) 이동·리셋(예산 유지)→
// 이동 예산 소진 3회 = 판 실패 시트(게임 오버)→다시 도전(예산·기회 충전)→
// 하양판(12판 white) 실플레이→나가기 복귀→무료 계정 페이월 게이트까지.
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

async function openChallenge() {
  if (await page.$("#sc-splash")) {
    await page.waitForSelector("#sc-splash .splash-foot.done", { timeout: 12000 });
    await page.getByRole("button", { name: "한번 둘러보기", exact: true }).click();
    await page.waitForSelector(".screen.active .gnav-item", { timeout: 5000 });
  }
  await page.locator('.screen.active .gnav-item:has-text("도전")').click();
}

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: true, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 100, lifeXp: 100, lessons: {}, minigame: {}, exams: {}, wrongNotes: {}, // 입장 20스텝 감당분(2026-07-20 입장료)
};

async function seedAndEnter(minigame) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => {
    localStorage.setItem("science-app.v1", JSON.stringify(s));
    localStorage.setItem("lzm.sound", "1");
  }, { ...BASE, minigame });
  await page.reload({ waitUntil: "networkidle" });
  await W(1100);
  await openChallenge();
  await W(400);
  await page.evaluate(() => document.getElementById("btn-lasermaze").click());
  await page.waitForSelector("#sc-lasermaze", { timeout: 4000 });
  await W(650);
}

/** 현재 판을 탭-탭(선택→목적지)으로 푼다 — 틀린 조각을 하나씩 제 정답 칸으로.
 *  흩기가 정답 칸을 비워 두므로 목적지는 언제나 자유 칸이다. */
async function solveCurrent() {
  for (let i = 0; i < 44; i++) {
    const done = await page.evaluate(() => {
      const dev = window.__lzmDev;
      if (dev.won()) return true;
      const w = dev.pieces().find((p) => p.wrong);
      if (!w) return true;
      const cv = document.querySelector("#sc-lasermaze .lzm-cv");
      const tap = (pt) => {
        cv.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 7, clientX: pt.x, clientY: pt.y, bubbles: true, isPrimary: true, pointerType: "touch" }));
        cv.dispatchEvent(new PointerEvent("pointerup", { pointerId: 7, clientX: pt.x, clientY: pt.y, bubbles: true, isPrimary: true, pointerType: "touch" }));
      };
      tap(dev.cellPos(w.x, w.y)); // 선택(이미 선택돼 있었다면 해제 — 다음 루프가 수습)
      tap(dev.cellPos(w.sx, w.sy)); // 목적지
      return false;
    });
    if (done) break;
    await W(70);
  }
  await W(200);
}

/** 여분 블록(정답 = 시작 칸)을 빈 칸과 왕복시켜 이동 예산만 태운다 — 본 조각은 흩은 채로
 *  두므로 판이 우연히 풀릴 일이 없다(그래도 won 가드를 둔다). */
async function burnBudget() {
  await page.evaluate(() => {
    const dev = window.__lzmDev;
    const cv = document.querySelector("#sc-lasermaze .lzm-cv");
    const tap = (pt) => {
      cv.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 11, clientX: pt.x, clientY: pt.y, bubbles: true, isPrimary: true, pointerType: "touch" }));
      cv.dispatchEvent(new PointerEvent("pointerup", { pointerId: 11, clientX: pt.x, clientY: pt.y, bubbles: true, isPrimary: true, pointerType: "touch" }));
    };
    const di = dev.pieces().findIndex((p) => !p.wrong);
    if (di < 0) return;
    const home = { x: dev.pieces()[di].x, y: dev.pieces()[di].y };
    const grid = dev.grid();
    let spot = null;
    for (let x = 0; x < grid && !spot; x++) for (let y = 0; y < grid && !spot; y++) if (dev.free(x, y)) spot = { x, y };
    if (!spot) return;
    for (let k = 0; k < 40; k++) {
      if (dev.won() || dev.moves() >= dev.cap()) break;
      const p = dev.pieces()[di];
      const dest = p.x === home.x && p.y === home.y ? spot : home;
      tap(dev.cellPos(p.x, p.y));
      tap(dev.cellPos(dest.x, dest.y));
    }
  });
  await W(150);
}

// ── 진입: 도전 탭 → 카드 → 게임 ────────────────────────────
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.evaluate((s) => {
  localStorage.setItem("science-app.v1", JSON.stringify(s));
  localStorage.setItem("lzm.sound", "1");
}, BASE);
await page.reload({ waitUntil: "networkidle" });
await W(1100);
await openChallenge();
await W(400);
ok(await page.$("#sc-challenge"), "도전 탭 진입");
ok(await page.$("#btn-lasermaze"), "레이저 미로 카드 존재");
ok(await page.evaluate(() => !document.querySelector("#btn-lasermaze .prep-pill.gold")), "프리미엄 이용자 — 카드 구매 배지 숨김");
ok(await page.evaluate(() => document.querySelector("#btn-lasermaze").textContent.includes("블록을 옮겨")), "카드 설명 = 블록 배치 문법");
await page.evaluate(() => document.getElementById("btn-lasermaze").click());
await page.waitForSelector("#sc-lasermaze", { timeout: 4000 });
await W(650);
ok((await attr("lzmStage")) === "1", "1판에서 시작", await attr("lzmStage"));
ok((await attr("lzmPhase")) === "idle", "초기 phase=idle");
ok((await attr("lzmGems")) === "0/1", "1판 보석 0/1", await attr("lzmGems"));
ok((await attr("lzmKind")) === "mono", "1판은 단색판");
ok((await attr("lzmTries")) === "3/3", "1판 기회 3개", await attr("lzmTries"));
ok((await attr("lzmCap")) === "8" && (await attr("lzmLeft")) === "8", "이동 예산 = 필요 이동×2+3(튜토리얼 하한 8)", `${await attr("lzmCap")}/${await attr("lzmLeft")}`);
const hud0 = await page.evaluate(() => ({
  moves: document.querySelector("#sc-lasermaze .lzm-moves").textContent,
  pips: document.querySelectorAll("#sc-lasermaze .lzm-lives i").length,
  gone: document.querySelectorAll("#sc-lasermaze .lzm-lives i.gone").length,
}));
ok(hud0.moves === "이동 8번 남음" && hud0.pips === 3 && hud0.gone === 0, "HUD — 남은 이동·기회 핍", JSON.stringify(hud0));
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
  const sum = { pair: 0, white: 0, glassStages: 0, rockStages: 0, maxMovable: 0 };
  for (let s = 1; s <= 120; s++) {
    const r = window.__lzmDev.inspect(s);
    if (!r.solutionWins) bad.push(`${s}:solution-fail`);
    if (r.scrambledWon) bad.push(`${s}:already-won`);
    if (r.fallback) bad.push(`${s}:fallback`);
    if (r.movable < 1) bad.push(`${s}:no-movable`);
    if (r.movable > 10) bad.push(`${s}:movable=${r.movable}`);
    if (![5, 6, 7].includes(r.grid)) bad.push(`${s}:grid=${r.grid}`);
    if (r.gems < 1 || r.emitters < 1) bad.push(`${s}:empty`);
    if (r.kind === "pair") sum.pair++;
    if (r.kind === "white") sum.white++;
    if (r.glass > 0) sum.glassStages++;
    if (r.rocks > 0) sum.rockStages++;
    sum.maxMovable = Math.max(sum.maxMovable, r.movable);
  }
  return { bad, sum };
});
ok(soak.bad.length === 0, "소크 1~120판: 정답 배치 전부 점등·흩은 상태 미완성·폴백 0", soak.bad.slice(0, 8).join(" "));
ok(soak.sum.pair >= 40, "합성판 비중(한 판 걸러)", JSON.stringify(soak.sum));
ok(soak.sum.white >= 10, "하양(삼원색) 판 존재", String(soak.sum.white));
ok(soak.sum.glassStages >= 35, "유리 블록 판 비중(모노 5판+·두 갈래 14판+)", String(soak.sum.glassStages));
ok(soak.sum.rockStages >= 60, "바위 판 비중(6판+)", String(soak.sum.rockStages));
const det = await page.evaluate(() => {
  const a = JSON.stringify(window.__lzmDev.inspect(23));
  const b = JSON.stringify(window.__lzmDev.inspect(23));
  const s1 = window.__lzmDev.inspect(1);
  const s4 = window.__lzmDev.inspect(4);
  const s5 = window.__lzmDev.inspect(5);
  const s7 = window.__lzmDev.inspect(7);
  const s10 = window.__lzmDev.inspect(10);
  const s12 = window.__lzmDev.inspect(12);
  return { det: a === b, s1, s4, s5, s7, s10, s12 };
});
ok(det.det, "결정성 — 같은 판은 언제나 같은 그림");
ok(det.s1.kind === "mono" && det.s1.movable === 1 && det.s1.gems === 1 && det.s1.glass === 0, "1판 = 상자 1개 단색판", JSON.stringify(det.s1));
ok(det.s4.decoys >= 1, "4판 여분 블록 데뷔", JSON.stringify(det.s4));
ok(det.s5.glass >= 1, "5판 유리 블록 데뷔", JSON.stringify(det.s5));
ok(det.s7.kind === "pair" && det.s7.emitters === 2 && det.s7.gems === 1, "7판 2색 합성 데뷔", JSON.stringify(det.s7));
ok(det.s10.kind === "twoMono" && det.s10.emitters === 2 && det.s10.gems === 2, "10판 두 갈래 데뷔", JSON.stringify(det.s10));
ok(det.s12.kind === "white" && det.s12.emitters === 3, "12판 삼원색 하양 데뷔", JSON.stringify(det.s12));

// ── 1판: 탭-탭 이동 클리어 → +3 스틱 → 자동 다음 판 ────────
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "1판 클리어 판정");
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-banner").classList.contains("on")), "완성 배너 표시");
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-ban-sub").textContent.includes("+3 스텝")), "첫 클리어 보상 문구");
await shot("lasermaze-clear1");
await W(1700);
ok((await attr("lzmStage")) === "2", "자동으로 2판 진입", await attr("lzmStage"));
let st = await store();
ok(st.minigame.lasermaze === 1 && st.totalXp === 83, "저장: 최고 1판·+3 스텝(입장 20 차감분 반영)", JSON.stringify([st.minigame, st.totalXp]));
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .mg-best").textContent.includes("최고 1판")), "최고 기록 필 갱신");

// ── 2판: 실드래그 문법(집기→끌기→놓기) 검증 후 클리어 ──────
const dragRes = await page.evaluate(() => {
  const dev = window.__lzmDev;
  const w = dev.pieces().map((p, i) => ({ ...p, i })).find((p) => p.wrong);
  if (!w) return { ok: false, why: "no-wrong" };
  const cv = document.querySelector("#sc-lasermaze .lzm-cv");
  const a = dev.cellPos(w.x, w.y);
  const b = dev.cellPos(w.sx, w.sy);
  const ev = (type, x, y) => cv.dispatchEvent(new PointerEvent(type, { pointerId: 9, clientX: x, clientY: y, bubbles: true, isPrimary: true, pointerType: "touch" }));
  ev("pointerdown", a.x, a.y);
  for (let k = 1; k <= 4; k++) ev("pointermove", a.x + ((b.x - a.x) * k) / 4, a.y + ((b.y - a.y) * k) / 4);
  ev("pointerup", b.x, b.y);
  const p2 = dev.pieces()[w.i];
  return { ok: !p2.wrong, moves: dev.moves() };
});
ok(dragRes.ok && dragRes.moves === 1, "실드래그 이동(집기→끌기→놓기)", JSON.stringify(dragRes));
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "2판 클리어");
await W(1700);
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "3판 클리어");
await W(1700);
ok((await attr("lzmStage")) === "4", "4판 진입");
st = await store();
ok(st.minigame.lasermaze === 3 && st.totalXp === 89, "저장: 최고 3판·스텝 9 누적", JSON.stringify([st.minigame, st.totalXp]));

// ── 스테퍼: 이전 판 재플레이는 보상 없음 ────────────────────
await page.evaluate(() => document.querySelectorAll("#sc-lasermaze .lzm-nav")[0].click());
await W(150);
ok((await attr("lzmStage")) === "3", "이전 판(3판) 재진입");
await solveCurrent();
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-ban-sub").textContent.includes("이미 깬")), "재플레이 배너 — 보상 없음 문구");
await W(1700);
st = await store();
ok(st.minigame.lasermaze === 3 && st.totalXp === 89, "재플레이는 스텝·기록 불변", JSON.stringify([st.minigame, st.totalXp]));

// ── 합성판(7판): 이동 집계·리셋·클리어 ─────────────────────
await seedAndEnter({ lasermaze: 6 });
ok((await attr("lzmStage")) === "7" && (await attr("lzmKind")) === "pair", "7판(2색 합성) 진입", await attr("lzmKind"));
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-helper span").textContent.includes("모이면")), "가산혼합 코치 문구");
await shot("lasermaze-pair");
// 리셋 검증 — 틀린 조각 하나를 (정답 아닌) 빈 칸으로 옮겼다가 리셋으로 처음 배치 복원
const wrong0 = await page.evaluate(() => window.__lzmDev.pieces().filter((p) => p.wrong).length);
const movedRes = await page.evaluate(() => {
  const dev = window.__lzmDev;
  const ps = dev.pieces();
  const w = ps.find((p) => p.wrong);
  if (!w) return null;
  const sols = new Set(ps.map((p) => `${p.sx},${p.sy}`));
  const grid = dev.grid();
  let dest = null;
  for (let x = 0; x < grid && !dest; x++)
    for (let y = 0; y < grid && !dest; y++) if (dev.free(x, y) && !sols.has(`${x},${y}`)) dest = { x, y };
  if (!dest) return null;
  const cv = document.querySelector("#sc-lasermaze .lzm-cv");
  const tap = (pt) => {
    cv.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 8, clientX: pt.x, clientY: pt.y, bubbles: true, isPrimary: true, pointerType: "touch" }));
    cv.dispatchEvent(new PointerEvent("pointerup", { pointerId: 8, clientX: pt.x, clientY: pt.y, bubbles: true, isPrimary: true, pointerType: "touch" }));
  };
  tap(dev.cellPos(w.x, w.y));
  tap(dev.cellPos(dest.x, dest.y));
  return { moves: dev.moves(), won: dev.won() };
});
ok(movedRes && movedRes.moves === 1 && !movedRes.won, "이동 집계(미완성 유지)", JSON.stringify(movedRes));
await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-abtn").click());
await W(120);
const afterReset = await page.evaluate(() => ({ wrong: window.__lzmDev.pieces().filter((p) => p.wrong).length, moves: window.__lzmDev.moves() }));
// 예산까지 되돌리면 리셋 연타로 게임 오버를 무한 회피할 수 있다 → 배치만 복원, 이동은 그대로
ok(afterReset.moves === 1 && afterReset.wrong === wrong0, "처음 배치로 리셋(이동 예산은 유지)", JSON.stringify([afterReset, wrong0]));
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-toast").textContent.includes("이동 횟수는 그대로")), "리셋 토스트 — 예산 유지 고지");
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "합성판 클리어(두 빛이 한 보석에)");

// ── 이동 예산 소진 3회 = 판 실패 시트(게임 오버) → 다시 도전 ──
await seedAndEnter({ lasermaze: 3 });
ok((await attr("lzmStage")) === "4", "4판 진입(여분 블록 있는 판)", await attr("lzmStage"));
const cap4 = Number(await attr("lzmCap"));
ok(cap4 >= 8, "이동 예산 노출", String(cap4));
await burnBudget();
ok((await attr("lzmPhase")) === "fail" && (await attr("lzmTries")) === "2/3", "예산 소진 = 시도 실패(기회 1 소모)", `${await attr("lzmPhase")} ${await attr("lzmTries")}`);
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-toast").textContent.includes("이동을 다 썼어요")), "예산 소진 토스트");
await W(1100);
ok((await attr("lzmPhase")) === "idle" && (await attr("lzmLeft")) === String(cap4), "새 시도 — 처음 배치 + 예산 재충전", `${await attr("lzmPhase")} ${await attr("lzmLeft")}`);
await burnBudget();
await W(1100);
ok((await attr("lzmTries")) === "1/3", "두 번째 실패 — 기회 1 남음", await attr("lzmTries"));
ok(await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-lives").classList.contains("last")), "마지막 기회 핍 강조");
await burnBudget();
await W(1100);
ok((await attr("lzmPhase")) === "over", "기회 소진 → phase=over", await attr("lzmPhase"));
const over = await page.evaluate(() => {
  const o = document.querySelector("#sc-lasermaze .lzm-over");
  return {
    on: o.classList.contains("on"),
    reason: o.querySelector(".lzm-ov-reason").textContent,
    big: o.querySelector(".lzm-ov-score b").textContent,
    best: o.querySelector(".lzm-ov-best").textContent,
    tip: o.querySelector(".lzm-ov-tip").textContent,
    btns: Array.from(o.querySelectorAll(".lzm-obtn")).map((b) => b.textContent),
  };
});
ok(over.on && over.reason.includes("기회를 다 썼어요"), "판 실패 시트 노출", over.reason);
ok(over.big === "4" && over.best.includes("최고 기록 3판"), "시트 = 이번 판 4 · 최고 기록 3판", JSON.stringify([over.big, over.best]));
ok(over.tip.length > 10 && over.btns.join("|") === "다시 도전|그만하기", "시트 코치 팁·버튼 2개", JSON.stringify([over.tip, over.btns]));
await shot("lasermaze-over");
const stOver = await store();
ok(stOver.minigame.lasermaze === 3, "게임 오버는 기록을 깎지 않는다", JSON.stringify(stOver.minigame));
await page.evaluate(() => document.querySelector("#sc-lasermaze .lzm-obtn.primary").click());
await W(220);
ok(
  (await attr("lzmPhase")) === "idle" && (await attr("lzmTries")) === "3/3" && (await attr("lzmLeft")) === String(cap4),
  "다시 도전 — 기회·예산 충전",
  `${await attr("lzmPhase")} ${await attr("lzmTries")} ${await attr("lzmLeft")}`,
);
await solveCurrent();
ok((await attr("lzmPhase")) === "clear", "다시 도전 후 4판 클리어");
await W(1700);

// ── 하양판(12판) 실플레이 ──────────────────────────────────
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
await openChallenge();
await W(400);
await page.evaluate(() => document.getElementById("btn-lasermaze").click());
await W(700);
ok(await page.evaluate(() => document.querySelector(".pw-title")?.textContent.includes("프리미엄")), "무료 계정 — 페이월 게이트");

ok(pageErrors === 0, "페이지 에러 0", String(pageErrors));
console.log(`\n결과: ${PASS} 통과 / ${FAIL} 실패`);
await browser.close();
process.exit(FAIL ? 1 : 0);
