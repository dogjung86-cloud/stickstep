// 코스모 머지 E2E — 진입(프리미엄 시딩)→스프라이트 도감 샷→소리 토글→실입력 드롭·첫 합체→
// 근접 합체(간격 2px 스윕)+연쇄 콤보 dataset→소환 훅 고티어 합체(화성)→목성×2=태양 탄생(은하 별
// 적립)→태양×2=초신성(보드 소거+먼지 비)→정적 핀 게임오버(라인 유예)→신기록 스틱(데일리 2배)→
// 다시 도전 리셋→나가기 복귀.
// PORT=<포트> node qa/e2e-cosmo.mjs — dev 서버 필수(data-cx-*·__cmx 훅이 DEV 전용).
// 프리뷰 하니스는 rAF 프리즈(사고 17)라 게임 검증은 이 스크립트가 확정 경로다.
// 물리 결과(정확 점수)는 소환 순서로 결정하되, 낙하 중 우연 합체가 낄 수 있는 구간은 부등식 판정.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });
// 동시 세션 HMR 리로드 면역 — @vite/client 스텁(updateStyle만 살리고 웹소켓 제거, 스텝 러시 문법)
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
const D = () => page.evaluate(() => ({ ...document.getElementById("sc-cosmo").dataset }));
const spawn = (t, x, y, still) =>
  page.evaluate(([tt, xx, yy, ss]) => document.getElementById("sc-cosmo").__cmx.spawn(tt, xx, yy, ss), [t, x, y, still ?? false]);

const BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: true, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 0, lifeXp: 0, lessons: {}, minigame: {}, exams: {}, wrongNotes: {},
};
// 시딩은 addInitScript(페이지 스크립트보다 먼저 — goto 후 evaluate+reload는 부팅 저장과 경합, 함정 ④)
await page.addInitScript((s) => {
  localStorage.setItem("science-app.v1", JSON.stringify(s));
  localStorage.removeItem("cmx.daily");
  localStorage.setItem("cmx.sound", "1");
  localStorage.setItem("cmx.galaxy", "0");
  sessionStorage.setItem("cmxSeed", "12345");
}, BASE);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await W(1000);

// ── 진입: 도전 탭 → 코스모 머지 카드 ──────────────────────────
await page.evaluate(() => document.querySelectorAll(".screen.active nav button")[2].click());
await W(500);
ok(await page.$("#sc-challenge"), "도전 탭 진입");
ok(await page.$("#btn-cosmo"), "코스모 머지 카드 존재");
await page.evaluate(() => document.getElementById("btn-cosmo").click());
await page.waitForSelector("#sc-cosmo", { timeout: 6000 }); // matter-js 청크 동적 로드 여유
await W(700);
const boot = await page.evaluate(() => {
  const h = document.getElementById("sc-cosmo");
  const cv = h.querySelector(".cmx-cv");
  return {
    phase: h.dataset.cxPhase,
    bodies: h.dataset.cxBodies,
    held: h.dataset.cxHeld,
    next: h.dataset.cxNext,
    cvW: cv.width,
    helper: !h.querySelector(".cmx-helper").classList.contains("off"),
    daily: !!h.querySelector(".cmx-helper .daily"),
    chain: h.querySelectorAll(".cmx-chain .cmx-ci").length,
    chainOn: h.querySelectorAll(".cmx-chain .cmx-ci.on").length,
    galaxyPill: h.querySelector(".cmx-galaxy span").textContent,
  };
});
ok(boot.phase === "ready", "초기 phase=ready(루프 가동)", JSON.stringify(boot));
ok(boot.bodies === "0" && boot.cvW > 100, "빈 보드·캔버스 실크기", `${boot.bodies}/${boot.cvW}`);
ok(boot.held === "0" && boot.next === "0", "첫 두 드롭은 우주먼지 보장(온보딩)", `${boot.held}/${boot.next}`);
ok(boot.helper && boot.daily, "도움말+데일리 2배 안내 표시");
ok(boot.chain === 11 && boot.chainOn === 5, "체인 스트립 11칸·드롭 5티어 점등", `${boot.chain}/${boot.chainOn}`);
ok(boot.galaxyPill === "0", "은하 별 0(첫 플레이)");
const desc = await page.evaluate(() => {
  const d = document.querySelector("#sc-cosmo .cmx-desc");
  return { show: d.classList.contains("show"), txt: d.textContent };
});
ok(desc.show && desc.txt === "모든 천체의 시작이에요", "든 천체 개념 한 줄(상단 표시)", JSON.stringify(desc));
// 체인 아이콘 탭 → 이름·설명 토스트(7번째 = 금성)
await page.evaluate(() => document.querySelectorAll("#sc-cosmo .cmx-chain .cmx-ci")[6].click());
await W(150);
const chainToast = await page.evaluate(() => document.querySelector("#sc-cosmo .cmx-toast").textContent);
ok(chainToast.startsWith("금성"), "체인 아이콘 탭 → 이름·설명 토스트", chainToast);

// 오디오 에셋 서빙 확인(BGM·샘플 — 재생은 헤드리스에서 무음이므로 존재만 검증)
const audioOk = await page.evaluate(async () => {
  const files = ["bgm-nebula.mp3", "sfx-sun.mp3", "sfx-nova.mp3", "sfx-over.mp3"];
  const rs = await Promise.all(files.map((f) => fetch(`game/cosmo/${f}`).then((r) => r.ok).catch(() => false)));
  return rs.every(Boolean);
});
ok(audioOk, "오디오 에셋 서빙(BGM·효과음 mp3)");

// 캔버스 렌더 픽셀(심우주 배경은 순검정이 아니다)
const px = await page.evaluate(() => {
  const cv = document.querySelector("#sc-cosmo .cmx-cv");
  const d = cv.getContext("2d").getImageData(Math.floor(cv.width / 2), Math.floor(cv.height * 0.5), 1, 1).data;
  return [d[0], d[1], d[2], d[3]];
});
ok(px[3] === 255 && px[0] + px[1] + px[2] > 0, "캔버스 렌더 픽셀", JSON.stringify(px));

// ── 스프라이트 도감(눈검수 샷) ─────────────────────────────────
await page.evaluate(() => document.getElementById("sc-cosmo").__cmx.gallery(true));
await W(450);
await shot("cosmo-gallery");
await page.evaluate(() => document.getElementById("sc-cosmo").__cmx.gallery(false));
await W(150);
ok(true, "도감 샷 저장(cosmo-gallery.png — 천체 11종 눈검수)");

// ── 소리 토글(기기 설정 영속) ───────────────────────────────
const snd = await page.evaluate(() => {
  const b = document.querySelector("#sc-cosmo .cmx-snd");
  const before = b.getAttribute("aria-pressed");
  b.click();
  const mid = [b.getAttribute("aria-pressed"), localStorage.getItem("cmx.sound"), b.classList.contains("off")];
  b.click();
  const after = [b.getAttribute("aria-pressed"), localStorage.getItem("cmx.sound")];
  return { before, mid, after };
});
ok(snd.before === "true" && snd.mid[0] === "false" && snd.mid[1] === "0" && snd.mid[2] === true, "소리 끄기 토글·영속", JSON.stringify(snd));
ok(snd.after[0] === "true" && snd.after[1] === "1", "소리 다시 켜기");

// ── 실입력: 같은 x에 우주먼지 2개 드롭 → 첫 합체(소행성) ────────
const tap = (f) =>
  page.evaluate((ff) => {
    const st = document.querySelector("#sc-cosmo .cmx-stage");
    const r = st.getBoundingClientRect();
    const x = r.left + r.width * ff;
    const y = r.top + r.height * 0.5;
    st.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: x, clientY: y, pointerType: "touch" }));
    st.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: x, clientY: y, pointerType: "touch" }));
  }, f);
await tap(0.32);
await W(250);
const d1 = await D();
ok(d1.cxPhase === "run" && d1.cxBodies === "1", "드롭 1 → run·바디 1", JSON.stringify({ p: d1.cxPhase, b: d1.cxBodies }));
ok(await page.evaluate(() => document.querySelector("#sc-cosmo .cmx-helper").classList.contains("off")), "첫 입력 후 도움말 숨김");
await W(600);
await tap(0.32);
let merged = null;
for (let g = 0; g < 40; g++) {
  merged = await D();
  if (merged.cxScore === "1") break;
  await W(100);
}
ok(merged.cxScore === "1" && merged.cxBodies === "1", "먼지+먼지=소행성(점수 1·바디 1)", JSON.stringify({ s: merged.cxScore, b: merged.cxBodies }));
ok(merged.cxMaxTier === "1", "최고 티어 = 소행성");
ok(await page.evaluate(() => document.querySelectorAll("#sc-cosmo .cmx-chain .cmx-ci.on").length) >= 5, "체인 점등 유지");

// ── 근접 합체(붙어 보이면 합침) + 연쇄 콤보 ────────────────────
await spawn(0, 100, 505);
await spawn(0, 120, 505); // 표면 간격 2px — 충돌 이벤트 없이 근접 스윕이 합친다
let prox = null;
for (let g = 0; g < 30; g++) {
  prox = await D();
  if (Number(prox.cxScore) >= 2) break;
  await W(100);
}
ok(Number(prox.cxScore) >= 2, "근접 합체(간격 2px, 스윕 경로)", prox.cxScore);
// 태어난 소행성이 기존 소행성 옆에서 곧장 연쇄 합체 → 콤보 창(1.6s) 감지
let comboSeen = null;
for (let g = 0; g < 30; g++) {
  comboSeen = await D();
  if (Number(comboSeen.cxCombo) >= 2) break;
  await W(90);
}
ok(Number(comboSeen.cxCombo) >= 2, "연쇄 콤보 감지(1.6s 창)", comboSeen.cxCombo);
await shot("cosmo-combo");

// ── 소환 훅: 수성×2 → 화성(토스트·점수 15) ─────────────────────
await spawn(4, 100, 380);
await W(500);
await spawn(4, 100, 250);
let m2 = null;
for (let g = 0; g < 40; g++) {
  m2 = await D();
  if (Number(m2.cxScore) >= 16) break;
  await W(100);
}
ok(Number(m2.cxScore) >= 16, "수성+수성=화성(+15)", m2.cxScore);
ok(m2.cxMaxTier === "5", "최고 티어 = 화성", m2.cxMaxTier);
const toast1 = await page.evaluate(() => document.querySelector("#sc-cosmo .cmx-toast").textContent);
ok(toast1.includes("화성"), "화성 탄생 토스트(과학 사실 한 줄)", toast1);
await shot("cosmo-play");

// ── 목성×2 = 태양 탄생(은하 적립) ──────────────────────────────
await spawn(9, 100, 430);
await W(700);
await spawn(9, 100, 240);
let sun = null;
for (let g = 0; g < 60; g++) {
  sun = await D();
  if (sun.cxSun === "1") break;
  await W(90);
}
ok(sun.cxSun === "1", "목성+목성=태양 탄생", JSON.stringify({ sun: sun.cxSun, s: sun.cxScore }));
ok(sun.cxMaxTier === "10", "최고 티어 = 태양");
await shot("cosmo-sun");
ok(await page.evaluate(() => localStorage.getItem("cmx.galaxy")) === "1", "은하에 별 1 적립(기기 누적)");
ok(await page.evaluate(() => document.querySelector("#sc-cosmo .cmx-galaxy span").textContent) === "1", "은하 필 갱신");

// ── 태양×2 = 초신성(보드 소거 + 먼지 비) ───────────────────────
await spawn(9, 262, 430);
await W(700);
await spawn(9, 262, 240);
let nova = null;
for (let g = 0; g < 80; g++) {
  nova = await D();
  if (nova.cxNova === "1") break;
  await W(70);
}
ok(nova.cxNova === "1", "태양+태양=초신성 폭발", JSON.stringify({ nova: nova?.cxNova }));
await shot("cosmo-nova");
ok(await page.evaluate(() => localStorage.getItem("cmx.galaxy")) === "2", "은하 별 2(두 번째 태양 적립)");
let rain = null;
for (let g = 0; g < 40; g++) {
  rain = await D();
  if (Number(rain.cxBodies) >= 4) break;
  await W(100);
}
ok(Number(rain.cxBodies) >= 4, "초신성 뒤 우주먼지 비(별의 잔해)", rain.cxBodies);
const afterNova = Number(rain.cxScore);
ok(afterNova >= 192, "점수 누적(1+15+55+55+66 이상)", String(afterNova));

// ── 게임오버: 라인 판정(유예 0.95s + 지속 1.15s) 검증 ──────────
// 실플레이 채우기는 초신성이 보드를 계속 구조해 비결정적(공 타워는 굴러 무너짐 — 3회 실사고).
// DEV 정적 핀(spawn still)으로 지구를 라인 위(top=87<96)에 고정해 판정 로직을 결정적으로 검증한다.
await spawn(9, 90, 430); // 바닥 소품(오버 샷 구색)
await W(400);
await spawn(8, 270, 430);
await W(400);
await spawn(7, 180, 140, true); // 지구 핀 — 라인 위 고정
let over = null;
for (let g = 0; g < 60; g++) {
  over = await D();
  if (over.cxPhase === "over") break;
  await W(120);
}
ok(over.cxPhase === "over", "라인 초과 지속 → 게임오버", JSON.stringify({ p: over?.cxPhase, d: over?.cxDanger }));
ok(Number(over.cxDanger) >= 0.99, "위험도 게이지 만충", over.cxDanger);
await W(700); // 시트 연출 대기
const finalScore = Number(over.cxScore);
const sticks = Math.max(1, Math.round(finalScore / 10)) * 2; // 첫 기록 갱신 + 데일리 2배
const sheet = await page.evaluate(() => {
  const h = document.getElementById("sc-cosmo");
  return {
    on: h.querySelector(".cmx-over").classList.contains("on"),
    reason: h.querySelector(".cmx-ov-reason").textContent,
    num: h.querySelector(".cmx-ov-score b").textContent,
    max: h.querySelector(".cmx-ov-max").textContent,
    newOn: h.querySelector(".cmx-ov-new").classList.contains("on"),
    newText: h.querySelector(".cmx-ov-new span").textContent,
    bestPill: h.querySelector(".mg-best").textContent,
  };
});
ok(sheet.on && sheet.reason === "우주가 가득 찼어요!", "게임오버 시트·사유", JSON.stringify(sheet.reason));
ok(sheet.num === String(finalScore), "결과 점수 일치", `${sheet.num}/${finalScore}`);
ok(sheet.max.includes("태양"), "이번 판 최고 천체 = 태양", sheet.max);
ok(sheet.newOn && sheet.newText === `신기록! +${sticks} 스틱 · 첫 도전 2배`, "신기록·데일리 2배 스틱", `${sheet.newText} (기대 +${sticks})`);
ok(sheet.bestPill === `최고 ${finalScore}점`, "헤더 최고 기록 갱신", sheet.bestPill);
const st1 = await store();
ok(st1.minigame?.cosmo === finalScore, "store 최고 기록 저장", JSON.stringify(st1.minigame));
ok(st1.totalXp === sticks && st1.lifeXp === sticks, "스틱 지급(갱신분/10 × 데일리 2배)", `${st1.totalXp}/${sticks}`);
ok(await page.evaluate(() => localStorage.getItem("cmx.daily") !== null), "데일리 소진 기록");
await shot("cosmo-over");

// 시트 위 탭 무시(스크림 오조작 방지)
await page.evaluate(() => {
  const h = document.getElementById("sc-cosmo");
  const r = h.getBoundingClientRect();
  h.querySelector(".cmx-over").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: r.left + r.width * 0.5, clientY: r.top + r.height * 0.5 }));
  h.querySelector(".cmx-over").dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: r.left + r.width * 0.5, clientY: r.top + r.height * 0.5 }));
});
await W(200);
ok((await D()).cxPhase === "over", "시트 위 탭은 입력 무시");

// ── 다시 도전 → 리셋 → 미갱신 판은 스틱 없음 ───────────────────
await page.evaluate(() => document.querySelector("#sc-cosmo .cmx-abtn.primary").click());
await W(400);
const re = await D();
ok(re.cxPhase === "ready" && re.cxScore === "0" && re.cxBodies === "0", "다시 도전 리셋", JSON.stringify({ p: re.cxPhase, s: re.cxScore }));
ok(await page.evaluate(() => document.querySelectorAll("#sc-cosmo .cmx-chain .cmx-ci.on").length) === 5, "체인 스트립 리셋(드롭 5티어만)");
ok(await page.evaluate(() => document.querySelector("#sc-cosmo .cmx-galaxy span").textContent) === "2", "은하 별은 판 리셋과 무관(누적 2)");
await spawn(1, 200, 420); // 소행성 하나만 두고 종료 → 기록 미갱신 경로
await W(300);
await page.evaluate(() => document.querySelector("#sc-cosmo .xbtn").click()); // 헤더 나가기
await W(600);
ok(await page.evaluate(() => !!document.querySelector("#sc-challenge") && !document.querySelector("#sc-cosmo")), "나가기 → 도전 탭 복귀·화면 정리");
const st2 = await store();
ok(st2.minigame?.cosmo === finalScore && st2.totalXp === sticks, "미갱신 이탈 시 기록·스틱 불변", `${st2.minigame?.cosmo}/${st2.totalXp}`);

ok(pageErrors === 0, "페이지 에러 0", String(pageErrors));

console.log(`\nRESULT: PASS ${PASS} / FAIL ${FAIL}`);
await browser.close();
process.exit(FAIL ? 1 : 0);
