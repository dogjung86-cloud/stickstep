// 네온 한붓그리기 E2E — 진입(프리미엄 시딩)→부트→소리 토글→
// 생성기 소크(1~140판: 해결 가능·홀짝 규칙·품질 게이트·결정성·폴백 0)→
// 1판 실그리기 클리어(+3 스틱·자동 다음 판)→2판 이어 그리기(떼고 재개·오시작 토스트)→
// 3판 되돌리기 버튼→4판 홀수판: 오시작 막다른 길 2회→홀수점 힌트→정해 클리어→
// 스테퍼 재플레이(보상 없음)→나가기 복귀→무료 계정 페이월 게이트까지.
// PORT=<포트> node qa/e2e-onestroke.mjs — dev 서버 필수(data-ost-*·__ostDev 훅이 DEV 전용).
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });
// 동시 세션 편집 → vite HMR 풀 리로드 간섭(사고 #12 계보) 차단: @vite/client 스텁(CSS 주입만 유지)
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
const attr = (name) => page.evaluate((n) => document.getElementById("sc-onestroke")?.dataset[n], name);

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: true, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 100, lifeXp: 100, lessons: {}, minigame: {}, exams: {}, wrongNotes: {}, // 입장 20스텝 감당분(2026-07-20 입장료)
};

await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.evaluate((s) => {
  localStorage.setItem("science-app.v1", JSON.stringify(s));
  localStorage.setItem("ost.sound", "1");
}, BASE);
await page.reload({ waitUntil: "networkidle" });
await W(1200);

// ── 진입: 도전 탭 → 카드 ───────────────────────────────────
await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
await W(500);
ok(await page.$("#sc-challenge"), "도전 탭 진입");
ok(await page.$("#btn-onestroke"), "네온 한붓그리기 카드 존재");
ok(await page.evaluate(() => document.querySelector("#btn-onestroke .prep-pill.gold")?.textContent.includes("프리미엄")), "카드에 프리미엄 크라운");
await page.evaluate(() => document.getElementById("btn-onestroke").click());
await page.waitForSelector("#sc-onestroke", { timeout: 4000 });
await W(600); // 동적 import + 루프 시작(setTimeout 0) 여유

ok((await attr("ostStage")) === "1", "1판에서 시작", await attr("ostStage"));
ok((await attr("ostPhase")) === "idle", "초기 phase=idle");
ok((await attr("ostEdges")) === "0/3", "1판 = 삼각형(선 3)", await attr("ostEdges"));
ok((await attr("ostOdd")) === "0", "1판은 짝수판(아무 데서나 시작)");
const px0 = await page.evaluate(() => {
  const cv = document.querySelector("#sc-onestroke .ost-cv");
  const d = cv.getContext("2d").getImageData(Math.floor(cv.width / 2), Math.floor(cv.height / 2), 1, 1).data;
  return [d[0], d[1], d[2], d[3]];
});
ok(px0[3] === 255 && px0[0] + px0[1] + px0[2] > 0, "캔버스 렌더 픽셀", JSON.stringify(px0));
await shot("onestroke-boot");

// ── 소리 토글(기기 설정 영속) ───────────────────────────────
const snd = await page.evaluate(() => {
  const b = document.querySelector("#sc-onestroke .ost-snd");
  b.click();
  const mid = [b.getAttribute("aria-pressed"), localStorage.getItem("ost.sound")];
  b.click();
  return { mid, after: [b.getAttribute("aria-pressed"), localStorage.getItem("ost.sound")] };
});
ok(snd.mid[0] === "false" && snd.mid[1] === "0" && snd.after[0] === "true" && snd.after[1] === "1", "소리 토글·영속", JSON.stringify(snd));

// ── 생성기 소크: 1~140판 전수 — "불가능 퍼즐 0%"의 기계 증명 ──
const soak = await page.evaluate(() => {
  const bad = [];
  let prevOdd = null;
  const summary = { odd0: 0, odd2: 0, maxE: 0 };
  for (let s = 1; s <= 140; s++) {
    const r = window.__ostDev.inspect(s);
    if (!r.solvable) bad.push(`${s}:unsolvable`);
    if (r.fallback) bad.push(`${s}:fallback`);
    if (r.odd !== 0 && r.odd !== 2) bad.push(`${s}:odd=${r.odd}`);
    if (r.dup) bad.push(`${s}:dup-edge`);
    if (r.e > 21) bad.push(`${s}:edges=${r.e}`);
    if (r.maxDeg > 6) bad.push(`${s}:deg=${r.maxDeg}`);
    if (r.minClear < 84) bad.push(`${s}:clear=${Math.round(r.minClear)}`);
    if (r.minLen < 88) bad.push(`${s}:len=${Math.round(r.minLen)}`);
    if (r.cross > 11) bad.push(`${s}:cross=${r.cross}`);
    if (r.cross > 0 && r.minAngle < 18) bad.push(`${s}:angle=${Math.round(r.minAngle)}`);
    summary[r.odd === 0 ? "odd0" : "odd2"]++;
    summary.maxE = Math.max(summary.maxE, r.e);
    prevOdd = r.odd;
  }
  return { bad, summary };
});
ok(soak.bad.length === 0, "소크 1~140판: 전부 풀 수 있음·품질 게이트 통과", soak.bad.slice(0, 8).join(" "));
ok(soak.summary.odd2 > soak.summary.odd0, "홀수판이 다수(시작점 찾기가 주 난이도)", JSON.stringify(soak.summary));
ok(soak.summary.maxE >= 19 && soak.summary.maxE <= 21, "후반 간선 캡(20±1) 도달", String(soak.summary.maxE));
const detCheck = await page.evaluate(() => {
  const a = JSON.stringify(window.__ostDev.inspect(25));
  const b = JSON.stringify(window.__ostDev.inspect(25));
  const hand = [1, 2, 3, 4, 5, 6].map((s) => window.__ostDev.inspect(s).e);
  const s4 = window.__ostDev.inspect(4);
  return { det: a === b, hand, s4odd: s4.odd };
});
ok(detCheck.det, "결정성 — 같은 판은 언제나 같은 그림");
ok(JSON.stringify(detCheck.hand) === JSON.stringify([3, 5, 6, 6, 8, 10]), "수제 1~6판 간선 커브(3·5·6·6·8·10)", JSON.stringify(detCheck.hand));
ok(detCheck.s4odd === 2, "4판(집)에서 홀수점 첫 등장");

// ── 실그리기 헬퍼: 솔버 경로를 포인터로 따라 긋는다 ─────────
async function tracePath(indices, { lift = false } = {}) {
  await page.evaluate(async (idx) => {
    const dev = window.__ostDev;
    const cv = document.querySelector("#sc-onestroke .ost-cv");
    const fire = (type, x, y) =>
      cv.dispatchEvent(new PointerEvent(type, { pointerId: 7, clientX: x, clientY: y, bubbles: true, isPrimary: true, pointerType: "touch" }));
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const p0 = dev.pos(idx[0]);
    fire("pointerdown", p0.x, p0.y);
    await sleep(30);
    for (let i = 1; i < idx.length; i++) {
      const a = dev.pos(idx[i - 1]);
      const b = dev.pos(idx[i]);
      for (let k = 1; k <= 4; k++) fire("pointermove", a.x + ((b.x - a.x) * k) / 4, a.y + ((b.y - a.y) * k) / 4);
      await sleep(24);
    }
    const pe = dev.pos(idx[idx.length - 1]);
    fire("pointerup", pe.x, pe.y);
  }, indices);
  if (!lift) await W(120);
}
const solvedPath = () => page.evaluate(() => window.__ostDev.path());

// ── 1판: 실그리기 클리어 → +3 스틱 → 자동 다음 판 ──────────
await tracePath(await solvedPath());
ok((await attr("ostPhase")) === "clear", "1판 클리어 판정");
ok(await page.evaluate(() => document.querySelector("#sc-onestroke .ost-banner").classList.contains("on")), "완성 배너 표시");
ok(await page.evaluate(() => document.querySelector("#sc-onestroke .ost-ban-sub").textContent.includes("+3 스텝")), "첫 클리어 보상 문구");
await shot("onestroke-clear1");
await W(1700); // 자동 다음 판
ok((await attr("ostStage")) === "2", "자동으로 2판 진입", await attr("ostStage"));
let st = await store();
ok(st.minigame.onestroke === 1 && st.totalXp === 83, "저장: 최고 1판·+3 스텝(입장 20 차감분 반영)", JSON.stringify([st.minigame, st.totalXp]));
ok(await page.evaluate(() => document.querySelector("#sc-onestroke .mg-best").textContent.includes("최고 1판")), "최고 기록 필 갱신");

// ── 2판(별): 떼고 이어 그리기 + 오시작 토스트 ────────────────
const path2 = await solvedPath();
await tracePath(path2.slice(0, 3), { lift: true }); // 2간선만 긋고 손 뗌
await W(150);
ok((await attr("ostEdges")) === "2/5" && (await attr("ostPhase")) === "idle", "손 떼도 진행 유지(2/5)", await attr("ostEdges"));
await page.evaluate(() => {
  const dev = window.__ostDev;
  const cv = document.querySelector("#sc-onestroke .ost-cv");
  const p = dev.pos(dev.path()[0]); // 끝점이 아닌 시작점을 다시 잡는 오시작
  cv.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 8, clientX: p.x, clientY: p.y, bubbles: true, isPrimary: true }));
  cv.dispatchEvent(new PointerEvent("pointerup", { pointerId: 8, clientX: p.x, clientY: p.y, bubbles: true, isPrimary: true }));
});
await W(120);
ok(await page.evaluate(() => document.querySelector("#sc-onestroke .ost-toast").classList.contains("on")), "오시작 안내 토스트");
ok((await attr("ostEdges")) === "2/5", "오시작은 진행 불변");
await tracePath(path2.slice(2)); // 끝점부터 재개(첫 이동이 3번째 정점으로 이어진다)
ok((await attr("ostPhase")) === "clear", "이어 그려 2판 클리어");
await W(1700);
ok((await attr("ostStage")) === "3", "3판 진입");

// ── 3판(나비): 되돌리기 버튼 ────────────────────────────────
const path3 = await solvedPath();
await tracePath(path3.slice(0, 2), { lift: true });
await W(150);
ok((await attr("ostEdges")) === "1/6", "3판 한 선 긋기", await attr("ostEdges"));
await page.evaluate(() => document.querySelectorAll("#sc-onestroke .ost-abtn")[0].click());
await W(80);
ok((await attr("ostEdges")) === "0/6", "되돌리기 버튼 — 마지막 선 취소");
await tracePath(path3);
ok((await attr("ostPhase")) === "clear", "3판 클리어");
await W(1700);
ok((await attr("ostStage")) === "4" && (await attr("ostOdd")) === "2", "4판(집·홀수판) 진입");

// ── 4판(집): 오시작 → 막다른 길 2회 → 홀수점 힌트 → 정해 ────
// 집 도형(A0 B1 C2 D3 지붕E4): E는 짝수점 — E→C→B→A→D→E는 CD 한 선을 남기고 반드시 막힌다.
const dead = [4, 2, 1, 0, 3, 4];
await tracePath(dead);
ok((await attr("ostPhase")) === "stuck", "오시작 막다른 길 판정");
ok((await attr("ostFails")) === "1", "실패 1 누적");
await W(1100); // 자동 리셋
ok((await attr("ostEdges")) === "0/6" && (await attr("ostPhase")) === "idle", "막힘 후 자동 리셋");
ok((await attr("ostHint")) === "0", "실패 1회로는 힌트 없음(발견 우선)");
await tracePath(dead);
ok((await attr("ostPhase")) === "stuck" && (await attr("ostFails")) === "2", "실패 2 누적");
await W(1100);
ok((await attr("ostHint")) === "1", "실패 2회 — 홀수점 힌트 점등");
ok(await page.evaluate(() => document.querySelector("#sc-onestroke .ost-helper span").textContent.includes("홀수")), "힌트 코치 문구(홀수점 규칙)");
await shot("onestroke-hint");
await tracePath(await solvedPath()); // 솔버 정해 = 홀수점 시작
ok((await attr("ostPhase")) === "clear", "홀수점 시작으로 4판 클리어");
await W(1700);
ok((await attr("ostStage")) === "5", "5판 진입");
st = await store();
ok(st.minigame.onestroke === 4 && st.totalXp === 92, "저장: 최고 4판·스텝 12(3×4) 누적", JSON.stringify([st.minigame, st.totalXp]));

// ── 스테퍼: 이전 판 재플레이는 보상 없음 ────────────────────
await page.evaluate(() => document.querySelectorAll("#sc-onestroke .ost-nav")[0].click());
await W(120);
ok((await attr("ostStage")) === "4", "이전 판(4판) 재진입");
await tracePath(await solvedPath());
ok(await page.evaluate(() => document.querySelector("#sc-onestroke .ost-ban-sub").textContent.includes("이미 깬")), "재플레이 배너 — 보상 없음 문구");
await W(1700);
st = await store();
ok(st.minigame.onestroke === 4 && st.totalXp === 92, "재플레이는 스텝·기록 불변", JSON.stringify([st.minigame, st.totalXp]));
ok((await attr("ostStage")) === "5", "재플레이 후 다시 5판");

// ── 나가기 → 도전 탭 복귀 ───────────────────────────────────
await page.evaluate(() => document.querySelector("#sc-onestroke .xbtn").click());
await W(500);
ok(await page.$("#sc-challenge"), "나가기 — 도전 탭 복귀");

// ── 무료 계정 페이월 게이트 ─────────────────────────────────
await page.evaluate((s) => localStorage.setItem("science-app.v1", JSON.stringify({ ...s, premium: false })), BASE);
await page.reload({ waitUntil: "networkidle" });
await W(1000);
await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
await W(400);
await page.evaluate(() => document.getElementById("btn-onestroke").click());
await W(700);
ok(await page.evaluate(() => document.querySelector(".pw-title")?.textContent.includes("프리미엄")), "무료 계정 — 페이월 게이트");
await shot("onestroke-paywall");

ok(pageErrors === 0, "페이지 에러 0", String(pageErrors));
console.log(`\n결과: ${PASS} 통과 / ${FAIL} 실패`);
await browser.close();
process.exit(FAIL ? 1 : 0);
