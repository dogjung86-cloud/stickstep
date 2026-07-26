// eclipse3d 터치 입력 문법 프로브 — 상대 드래그·탭 글라이드·안내 토스트(6검증).
// PORT=<포트> node qa/probe-eclipse-touch.mjs  (e2e-u7은 합성 이벤트라 터치 문법을 못 보므로 이 프로브가 담당)
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5247";
const log = (...a) => console.log("[probe]", ...a);
let fails = 0;
const assert = (ok, label) => {
  log(ok ? "PASS" : "FAIL", label);
  if (!ok) fails++;
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
// 동시 세션 src 편집의 HMR 풀 리로드 간섭 차단 — e2e-steprush.mjs의 @vite/client 스텁과 동일
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

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: false, reviewMode: true, goalMin: 10, streak: 0, lastStudyDay: null,
    totalXp: 0, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1100);
await page.mouse.click(210, 300); // 플립북 스킵
await page.waitForTimeout(500);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기"))?.click();
});
await page.waitForTimeout(1100);

// L6 진입(검토 모드라 잠금 없음)
await page.evaluate(() => [...document.querySelectorAll(".unit-tab")].find((b) => b.textContent.includes("태양계"))?.click());
await page.waitForTimeout(600);
await page.evaluate(() => {
  const n = [...document.querySelectorAll(".gm-node")].find((n) => n.textContent.includes("일식과 월식"));
  n?.click();
});
await page.waitForTimeout(1000);
// 훅 통과
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
    .find((x) => /태양 관측 안경 쓰기/.test(x.textContent));
  b?.click();
});
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".hook-choice")].find((x) => x.offsetParent && /달이 태양 앞/.test(x.textContent));
  b?.click();
});
await page.waitForTimeout(500);
const clickCTA = async () => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".cta button, button.cta, .lesson-cta");
    return b && !b.disabled;
  }, { timeout: 14000 });
  await page.evaluate(() => document.querySelector(".cta button, button.cta, .lesson-cta").click());
  await page.waitForTimeout(650);
};
await clickCTA(); // 3D 정렬 실험실
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
    .find((x) => /가로 화면으로/.test(x.textContent));
  b?.click();
});
await page.waitForFunction(() => !!document.querySelector(".rot-overlay.in .sp3-canvas"), { timeout: 12000 });
await page.waitForTimeout(1600);

const badges = () => page.evaluate(() => [...document.querySelectorAll(".pn-badge")].map((b) => b.className.includes(" on")));
const toast = () => page.evaluate(() => {
  const t = document.querySelector(".sp3-toast");
  return { show: !!t?.classList.contains("show"), text: t?.textContent ?? "" };
});
const pill = () => page.evaluate(() => document.querySelectorAll(".sp3-pill span")[1]?.textContent ?? "");

// 터치 이벤트 디스패치(포트레이트 클라이언트 좌표 — rotateStage.mapPoint가 회전 처리)
const touch = (type, x, y, id = 77) => page.evaluate(([type, x, y, id]) => {
  const c = document.querySelector(".sp3-canvas");
  c.dispatchEvent(new PointerEvent(type, {
    bubbles: true, pointerId: id, isPrimary: true, pointerType: "touch", clientX: x, clientY: y,
  }));
}, [type, x, y, id]);

const VW = 420, VH = 900;

// ── ① 첫 터치 = 안내 토스트, 그리고 탭 글라이드로 일식(삭 자리) 만들기 ──
// (0.5, 0.12): z≈0 축 위 태양 쪽 — e2e 스캔에서 삭 정렬이 잡힌 지점과 동일
await touch("pointerdown", VW * 0.5, VH * 0.12);
await page.waitForTimeout(120);
const t1 = await toast();
assert(t1.show && t1.text.includes("빈 우주"), `첫 터치 안내 토스트: "${t1.text.slice(0, 30)}…"`);
await touch("pointerup", VW * 0.5, VH * 0.12);
const pillMid = await pill();
await page.waitForTimeout(1400); // 글라이드(~460ms) + 정렬 유지 320ms
const b1 = await badges();
assert(b1[0] === true, `탭 글라이드 → 일식 수집 (탭 직후 pill="${pillMid}")`);

// ── ② 상대 드래그 검증: 망 자리를 짚고 14px만 움직여도 달이 그리로 점프하지 않는다 ──
// 절대 매핑이었다면 이 홀드 동안 월식이 수집됐을 것.
await touch("pointerdown", VW * 0.5, VH * 0.88, 78);
await page.waitForTimeout(80);
await touch("pointermove", VW * 0.5 + 7, VH * 0.88 + 8, 78); // 슬롭(9px) 초과 → moved
await page.waitForTimeout(700); // 정렬 판정(320ms)보다 길게 홀드
const b2 = await badges();
assert(b2[2] === false, "터치 홀드 중 달이 손끝 각도로 점프하지 않음(월식 미수집 = 상대 조종)");
await touch("pointerup", VW * 0.5 + 7, VH * 0.88 + 8, 78); // moved=true → 글라이드 없음
await page.waitForTimeout(600);
const b2b = await badges();
assert(b2b[2] === false, "이동 후 릴리스는 글라이드를 만들지 않음");

// ── ③ 진짜 탭(무이동)으로 월식 만들기 ──
await touch("pointerdown", VW * 0.5, VH * 0.88, 79);
await page.waitForTimeout(60);
await touch("pointerup", VW * 0.5, VH * 0.88, 79);
await page.waitForTimeout(1600); // 반 바퀴 글라이드 + 320ms
const b3 = await badges();
assert(b3[2] === true, "탭 글라이드 → 월식(붉은 달) 수집");

// ── ④ 상대 드래그로 실제 이동: 빈 곳을 끌면 달이 각도 변화만큼 따라온다 ──
// 망(0°) 수집 직후 상태에서 궤도 바깥 빈 곳을 잡고 길게 끈다 → 달이 망을 떠나 pill이 바뀐다
const pillBefore = await pill();
let py = VH * 0.86;
await touch("pointerdown", VW * 0.62, py, 80);
for (let i = 0; i < 14; i++) {
  py -= VH * 0.05;
  await touch("pointermove", VW * 0.62, Math.max(py, VH * 0.1), 80);
  await page.waitForTimeout(40);
}
await page.waitForTimeout(300);
const pillDrag = await pill();
await touch("pointerup", VW * 0.62, Math.max(py, VH * 0.1), 80);
assert(
  pillDrag !== pillBefore && !pillDrag.includes("월식"),
  `상대 드래그로 달 이동 확인 (전="${pillBefore}" → 후="${pillDrag}")`,
);

// ── ⑤ 재정렬 필 문구: 이미 수집한 목표라도 완전 정렬이면 "일식"으로 갱신 ──
// (수집 순간에만 필을 쓰던 시절의 스테일 "부분일식" 버그 회귀 가드 — 2026-07-26 사용자 리포트)
await touch("pointerdown", VW * 0.5, VH * 0.12, 81);
await page.waitForTimeout(60);
await touch("pointerup", VW * 0.5, VH * 0.12, 81);
await page.waitForTimeout(1500);
const pillRe = await pill();
assert(/^일식 — /.test(pillRe), `재정렬 시 필이 현재 상태를 말함 (pill="${pillRe}")`);

// ── ⑥ 상태 토스트 상주: 달이 정렬 자리에 머무는 동안 설명이 계속 떠 있는다 ──
// (구식 시간제 토스트라면 2.2초 뒤 사라졌을 시간까지 기다렸다가 확인 — 2026-07-26 사용자 요청)
await page.waitForTimeout(2600);
const t6 = await toast();
assert(t6.show && t6.text.includes("일식"), `정렬 유지 중 설명 토스트 상주 (text="${t6.text.slice(0, 22)}…")`);

// ── ⑦ 자리를 벗어나면 토스트가 내려간다 ──
await touch("pointerdown", VW * 0.35, VH * 0.5, 82);
await page.waitForTimeout(60);
await touch("pointerup", VW * 0.35, VH * 0.5, 82); // 중간 궤도로 탭 글라이드
await page.waitForTimeout(1300);
const t7 = await toast();
assert(!t7.show, "정렬을 벗어나면 설명 토스트가 내려감");

await page.screenshot({ path: "qa/probe-eclipse-touch.png" });
await browser.close();
log(fails === 0 ? "ALL PASS" : `${fails} FAIL`);
process.exit(fails === 0 ? 0 : 1);
