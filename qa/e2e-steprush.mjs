// 스텝 러시 M4 E2E — 진입(프리미엄 시딩)→소리 토글→코어 루프(키보드 1+터치 존 15연타)→
// 방향 실수 낙하→신기록 스틱(데일리 첫 도전 2배)→다시 도전→스태미나 소진 낙하→나가기 복귀→
// [M3] 최고기록 60 시딩 재진입→별 계단 해금·피버 자동 질주·"지난 나" 고스트 추월→
// [M4] 최고기록 250 시딩 재진입→방패 픽업·헛디딤 세이브·모래시계 프리즈까지 실플레이.
// PORT=<포트> node qa/e2e-steprush.mjs — dev 서버 필수(data-sr-* 훅이 DEV 전용).
// 프리뷰 하니스는 rAF 프리즈(사고 17)라 게임 검증은 이 스크립트가 확정 경로다.
// 입력은 하이브리드: 실제 히트 존 = 화면 좌/우 절반(버튼은 시각 앵커+키보드 경로) — 존 탭으로 검증.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });
// 동시 세션의 src 편집 → vite HMR 풀 리로드로 e2e가 중도 사망하는 간섭(사고 #12 계보) 차단:
// @vite/client를 스텁으로 대체 — CSS 주입(updateStyle)은 살리고 웹소켓·리로드만 제거한다.
// (abort는 금물 — dev의 CSS import가 이 모듈의 updateStyle에 의존해 앱이 통째로 안 뜬다.)
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

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: true, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lifeXp: 0, lessons: {}, minigame: {}, exams: {}, wrongNotes: {},
};

await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.evaluate((s) => {
  localStorage.setItem("science-app.v1", JSON.stringify(s));
  localStorage.removeItem("srx.daily"); // 데일리 2배를 미소진 상태로(재실행 안전)
  localStorage.setItem("srx.sound", "1"); // 소리 토글 초기 상태 고정
  sessionStorage.setItem("srxSeed", "12345"); // DEV 시드 고정 — 계단 배열 결정성
}, BASE);
await page.reload({ waitUntil: "networkidle" });
await W(1200);

// ── 진입: 도전 탭 → 스텝 러시 카드 ──────────────────────────
await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
await W(500);
ok(await page.$("#sc-challenge"), "도전 탭 진입");
ok(await page.$("#btn-steprush"), "스텝 러시 카드 존재");
await page.evaluate(() => document.getElementById("btn-steprush").click());
await page.waitForSelector("#sc-steprush", { timeout: 4000 });
await W(600); // 동적 import + 루프 시작(setTimeout 0) 여유
const boot = await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  const cv = h.querySelector(".srx-cv");
  return { phase: h.dataset.srPhase, next: h.dataset.srNext, cvW: cv.width, helper: !h.querySelector(".srx-helper").classList.contains("off") };
});
ok(boot.phase === "ready", "초기 phase=ready(루프 가동)", JSON.stringify(boot));
ok(boot.next === "up", "첫 두 계단은 직진 보장(온보딩)", boot.next);
ok(boot.cvW > 100, "캔버스 실크기 반영", String(boot.cvW));
ok(boot.helper, "시작 도움말 표시");
ok(await page.evaluate(() => document.getElementById("sc-steprush").dataset.srStar) === "0", "별 계단 미해금(최고 0)");
ok(await page.evaluate(() => !!document.querySelector("#sc-steprush .srx-helper .daily")), "데일리 2배 안내줄 표시");

// 캔버스가 실제로 그려졌는지(픽셀 검증 — 배경 그라데이션은 순검정이 아니다)
const px = await page.evaluate(() => {
  const cv = document.querySelector("#sc-steprush .srx-cv");
  const d = cv.getContext("2d").getImageData(Math.floor(cv.width / 2), Math.floor(cv.height * 0.6), 1, 1).data;
  return [d[0], d[1], d[2], d[3]];
});
ok(px[3] === 255 && px[0] + px[1] + px[2] > 0, "캔버스 렌더 픽셀", JSON.stringify(px));

// ── 소리 토글(기기 설정 영속) ───────────────────────────────
const snd = await page.evaluate(() => {
  const b = document.querySelector("#sc-steprush .srx-snd");
  const before = b.getAttribute("aria-pressed");
  b.click();
  const mid = [b.getAttribute("aria-pressed"), localStorage.getItem("srx.sound"), b.classList.contains("off")];
  b.click();
  const after = [b.getAttribute("aria-pressed"), localStorage.getItem("srx.sound")];
  return { before, mid, after };
});
ok(snd.before === "true" && snd.mid[0] === "false" && snd.mid[1] === "0" && snd.mid[2] === true, "소리 끄기 토글·영속", JSON.stringify(snd));
ok(snd.after[0] === "true" && snd.after[1] === "1", "소리 다시 켜기", JSON.stringify(snd.after));

// ── 코어 루프: 키보드 활성화 1 + 터치 존 15 = 16계단 ─────────
const run = await page.evaluate(async (n) => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const h = document.getElementById("sc-steprush");
  const r = h.getBoundingClientRect();
  const zone = (k) => h.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    clientX: r.left + r.width * (k === "up" ? 0.75 : 0.25),
    clientY: r.top + r.height * 0.5,
  }));
  // 첫 입력은 버튼 키보드 경로(click detail 0) — a11y 폴백 검증
  h.querySelector(".srx-btn.up").dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
  await sleep(70);
  for (let i = 1; i < n; i++) { zone(h.dataset.srNext); await sleep(60); }
  await sleep(120);
  return {
    score: h.dataset.srScore, phase: h.dataset.srPhase,
    scoreText: h.querySelector(".srx-score b").textContent,
    helperOff: h.querySelector(".srx-helper").classList.contains("off"),
    stam: +h.querySelector(".srx-stam").getAttribute("aria-valuenow"),
  };
}, 16);
ok(run.phase === "run", "run 상태 유지(16연속 등반)", JSON.stringify(run));
ok(run.score === "16" && run.scoreText === "16", "점수 16 일치(키보드 1+존 15)", `${run.score}/${run.scoreText}`);
ok(run.helperOff, "첫 입력 후 도움말 숨김");
ok(run.stam > 0 && run.stam <= 100, "스태미나 게이지 동작", String(run.stam));
await shot("steprush-run"); // 15계단 팻말(번지점프대)이 프레임에 있어야 한다 — 눈검수

// ── 방향 실수 → 낙하 → 게임오버 시트(신기록 +16 스틱) ─────────
await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  const r = h.getBoundingClientRect();
  const wrong = h.dataset.srNext === "up" ? "turn" : "up";
  h.dispatchEvent(new PointerEvent("pointerdown", {
    bubbles: true,
    clientX: r.left + r.width * (wrong === "up" ? 0.75 : 0.25),
    clientY: r.top + r.height * 0.5,
  }));
});
await W(900); // 낙하 연출 560ms + 여유
const over = await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  return {
    phase: h.dataset.srPhase,
    sheetOn: h.querySelector(".srx-over").classList.contains("on"),
    reason: h.querySelector(".srx-ov-reason").textContent,
    num: h.querySelector(".srx-ov-score b").textContent,
    newOn: h.querySelector(".srx-ov-new").classList.contains("on"),
    newText: h.querySelector(".srx-ov-new span").textContent,
    bestPill: h.querySelector(".mg-best").textContent,
  };
});
ok(over.phase === "over" && over.sheetOn, "낙하 → 게임오버 시트", JSON.stringify(over));
ok(over.reason === "발을 헛디뎠어요!", "낙하 사유(방향 실수)", over.reason);
ok(over.num === "16", "결과 점수 16");
ok(over.newOn && over.newText === "신기록! +32 스틱 · 첫 도전 2배", "신기록·데일리 2배 문구", over.newText);
ok(over.bestPill === "최고 16계단", "헤더 최고 기록 갱신", over.bestPill);
const st1 = await store();
ok(st1.minigame?.steprush === 16, "store 최고 기록 저장", JSON.stringify(st1.minigame));
ok(st1.totalXp === 32 && st1.lifeXp === 32, "갱신분 16 × 데일리 2배 = 32 스틱", `${st1.totalXp}/${st1.lifeXp}`);
ok(await page.evaluate(() => localStorage.getItem("srx.daily") !== null), "데일리 소진 기록");
await shot("steprush-over-newbest");

// 게임오버 시트 위 존 탭이 무시되는지(시트 스크림 탭 = 오조작 재시작 방지)
await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  const r = h.getBoundingClientRect();
  h.querySelector(".srx-over").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: r.left + r.width * 0.75, clientY: r.top + r.height * 0.5 }));
});
await W(150);
ok(await page.evaluate(() => document.getElementById("sc-steprush").dataset.srPhase) === "over", "시트 위 탭은 입력 무시");

// ── 다시 도전 → 스태미나 소진 낙하(두 번째 벌 조건) ────────────
await page.click("#sc-steprush .srx-abtn.primary");
await W(300);
const re = await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  return { phase: h.dataset.srPhase, score: h.dataset.srScore, sheetOn: h.querySelector(".srx-over").classList.contains("on") };
});
ok(re.phase === "ready" && re.score === "0" && !re.sheetOn, "다시 도전 리셋", JSON.stringify(re));
await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  const r = h.getBoundingClientRect();
  h.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: r.left + r.width * 0.75, clientY: r.top + r.height * 0.5 }));
});
await W(13500); // p=1 소모율 ~9.1%/s → 약 11.7초에 소진
const tired = await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  return {
    phase: h.dataset.srPhase,
    reason: h.querySelector(".srx-ov-reason").textContent,
    newOn: h.querySelector(".srx-ov-new").classList.contains("on"),
  };
});
ok(tired.phase === "over" && tired.reason === "숨이 다 찼어요!", "스태미나 소진 낙하", JSON.stringify(tired));
ok(!tired.newOn, "기록 미갱신이면 스틱 없음");
const st2 = await store();
ok(st2.minigame?.steprush === 16 && st2.totalXp === 32, "미갱신 시 기록·스틱 불변(1차 판 32 유지)", `${st2.minigame?.steprush}/${st2.totalXp}`);

// ── 나가기 → 도전 탭 복귀 ──────────────────────────────────
await page.evaluate(() => {
  const btns = document.querySelectorAll("#sc-steprush .srx-abtn");
  btns[btns.length - 1].click(); // 그만하기
});
await W(600);
ok(await page.evaluate(() => !!document.querySelector("#sc-challenge") && !document.querySelector("#sc-steprush")), "그만하기 → 도전 탭 복귀·화면 정리");

// ── [M3] 최고기록 60 시딩 → 별 계단 해금·피버·"지난 나" 고스트 ─────
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("science-app.v1"));
  s.minigame = { steprush: 60 };
  localStorage.setItem("science-app.v1", JSON.stringify(s));
});
await page.reload({ waitUntil: "networkidle" });
await W(1200);
await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
await W(400);
await page.evaluate(() => document.getElementById("btn-steprush").click());
await page.waitForSelector("#sc-steprush", { timeout: 4000 });
await W(600);
ok(await page.evaluate(() => document.getElementById("sc-steprush").dataset.srStar) === "1", "최고 60 → 별 계단 해금");

// 등반 루프(Node 측 — 피버 순간 스크린샷 확보): 피버 중엔 입력이 무시되므로 폴링만 한다
let feverSeen = false;
let feverShot = false;
let lastState = null;
for (let guard = 0; guard < 400; guard++) {
  lastState = await page.evaluate(() => {
    const h = document.getElementById("sc-steprush");
    return { score: +h.dataset.srScore, fever: h.dataset.srFever === "1", phase: h.dataset.srPhase, next: h.dataset.srNext, passed: h.dataset.srPassed === "1" };
  });
  if (lastState.phase === "over") break;
  if (lastState.score >= 82 && !lastState.fever) break;
  if (lastState.fever) {
    feverSeen = true;
    if (!feverShot) {
      feverShot = true;
      await shot("steprush-fever");
    }
    await W(90);
    continue;
  }
  await page.evaluate((k) => {
    const h = document.getElementById("sc-steprush");
    const r = h.getBoundingClientRect();
    h.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: r.left + r.width * (k === "up" ? 0.75 : 0.25), clientY: r.top + r.height * 0.5 }));
  }, lastState.next);
  await W(52);
}
ok(lastState.phase === "run" && lastState.score >= 82, "해금 판 82계단 도달", JSON.stringify(lastState));
ok(feverSeen, "별 계단 → 피버 자동 질주 발동");
ok(lastState.passed, "지난 나(60계단) 추월 감지");

// 죽어서 정산 — 데일리는 1차 판에서 이미 소진됐으니 2배 없음
await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  const r = h.getBoundingClientRect();
  const wrong = h.dataset.srNext === "up" ? "turn" : "up";
  h.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: r.left + r.width * (wrong === "up" ? 0.75 : 0.25), clientY: r.top + r.height * 0.5 }));
});
await W(900);
const m3over = await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  return {
    num: +h.querySelector(".srx-ov-score b").textContent,
    newText: h.querySelector(".srx-ov-new span").textContent,
    unlockOn: h.querySelector(".srx-ov-unlock").classList.contains("on"),
  };
});
ok(m3over.num === lastState.score, "정산 점수 일치", JSON.stringify(m3over));
ok(m3over.newText === `신기록! +${lastState.score - 60} 스틱`, "갱신분만 지급(2배 없음 — 데일리 소진됨)", m3over.newText);
ok(!m3over.unlockOn, "해금 배너는 문턱 통과 판에만");
const st3 = await store();
ok(st3.minigame?.steprush === lastState.score && st3.totalXp === 32 + (lastState.score - 60), "store 정합(기록·스틱)", `${st3.minigame?.steprush}/${st3.totalXp}`);
await shot("steprush-m3-over");

// ── [M4] 최고 250 시딩 → 방패·모래시계 픽업/세이브/프리즈 ──────
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem("science-app.v1"));
  s.minigame = { steprush: 250 };
  localStorage.setItem("science-app.v1", JSON.stringify(s));
});
await page.reload({ waitUntil: "networkidle" });
await W(1200);
await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
await W(400);
await page.evaluate(() => document.getElementById("btn-steprush").click());
await page.waitForSelector("#sc-steprush", { timeout: 4000 });
await W(600);

let shieldSeen = false;
let frozenSeen = false;
let savedTried = false;
let m4 = null;
const zonePress = (k) =>
  page.evaluate((kk) => {
    const h = document.getElementById("sc-steprush");
    const r = h.getBoundingClientRect();
    h.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: r.left + r.width * (kk === "up" ? 0.75 : 0.25), clientY: r.top + r.height * 0.5 }));
  }, k);
for (let guard = 0; guard < 500; guard++) {
  m4 = await page.evaluate(() => {
    const h = document.getElementById("sc-steprush");
    return {
      score: +h.dataset.srScore, phase: h.dataset.srPhase, next: h.dataset.srNext,
      fever: h.dataset.srFever === "1", shieldOn: h.dataset.srShieldOn === "1",
      frozen: h.dataset.srFrozen === "1", saved: h.dataset.srSaved === "1",
    };
  });
  if (m4.phase === "over") break;
  shieldSeen ||= m4.shieldOn;
  frozenSeen ||= m4.frozen;
  if (m4.shieldOn && !m4.fever && !savedTried) {
    savedTried = true;
    await zonePress(m4.next === "up" ? "turn" : "up"); // 일부러 헛디딤 → 방패가 막아야 함
    await W(140);
    continue;
  }
  if (m4.score >= 160 && !m4.fever) break;
  if (m4.fever) {
    await W(90);
    continue;
  }
  await zonePress(m4.next);
  await W(52);
}
ok(m4.phase === "run" && m4.score >= 160, "해금 판 160계단 도달(생존)", JSON.stringify(m4));
ok(shieldSeen, "방패 계단 픽업(장착 확인)");
ok(savedTried && m4.saved, "헛디딤을 방패가 흡수(낙하 없음)");
ok(frozenSeen, "모래시계 픽업 → 스태미나 프리즈");
await shot("steprush-items");

// 정산 — 방패가 다시 장착돼 있으면 소진시키고 죽는다(최대 4회 시도)
for (let t = 0; t < 4; t++) {
  const st = await page.evaluate(() => {
    const h = document.getElementById("sc-steprush");
    return { phase: h.dataset.srPhase, next: h.dataset.srNext };
  });
  if (st.phase === "over") break;
  await zonePress(st.next === "up" ? "turn" : "up");
  await W(450);
}
await W(700);
const m4over = await page.evaluate(() => {
  const h = document.getElementById("sc-steprush");
  return {
    phase: h.dataset.srPhase,
    sheetOn: h.querySelector(".srx-over").classList.contains("on"),
    newOn: h.querySelector(".srx-ov-new").classList.contains("on"),
  };
});
ok(m4over.phase === "over" && m4over.sheetOn, "M4 판 정산 시트", JSON.stringify(m4over));
ok(!m4over.newOn, "최고 250 미달이라 스틱 없음");
await page.evaluate(() => {
  const btns = document.querySelectorAll("#sc-steprush .srx-abtn");
  btns[btns.length - 1].click();
});
await W(600);
ok(await page.evaluate(() => !!document.querySelector("#sc-challenge") && !document.querySelector("#sc-steprush")), "M4 종료 → 도전 탭 복귀");

ok(pageErrors === 0, "페이지 에러 0", String(pageErrors));

console.log(`\nRESULT: PASS ${PASS} / FAIL ${FAIL}`);
await browser.close();
process.exit(FAIL ? 1 : 0);
