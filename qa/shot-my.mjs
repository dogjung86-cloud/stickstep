// 마이 탭 캡처 + 분리 의미론 검증: PORT=<포트> node qa/shot-my.mjs [출력접두]
// 순서: 페이지 → 아바타 시트(캐릭터 고르기) → 프리셋 선택 → 직접 꾸미기(단발) →
//       '내 캐릭터' 선택 표시 확인(캐릭터/직접 꾸미기 완전 분리) → 완료 → 장화 레벨 시트 → 새로고침.
// 프리뷰 하니스 캡처 프리즈(사고 #17)와 무관한 헤드리스 확정 경로(shot-walk.mjs 문법).
// 2026-11 갱신: 공개 진입 플로우(부팅은 항상 스플래시) 우회 + 꾸미기 시트 v2 DOM.
//   시트의 전 범주 실플레이·넘침 검사·구버전 저장값 호환은 qa/e2e-avatar.mjs가 맡는다.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "3000";
const prefix = process.argv[2] || "qa/shots/my";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 820 } });
// 동시 세션 HMR 면역: @vite/client를 스텁으로 대체(웹소켓 제거, updateStyle 유지)
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);

// 조건부 시드: reload 후에도 앱이 저장한 상태(아바타 등)가 살아 있어야 지속성 검증이 된다.
await page.addInitScript((s) => {
  if (!localStorage.getItem("science-app.v1")) localStorage.setItem("science-app.v1", JSON.stringify(s));
}, {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 160, lifeXp: 160, avatarId: null, avatarCustom: null, avatarPreset: null,
  lessons: {}, minigame: {}, exams: {}, wrongNotes: {},
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
// 부팅은 항상 스플래시: 플립북을 건너뛰고 "한번 둘러보기"로 홈에 들어간다(정본 = qa/e2e-soc7.mjs 부팅부).
await page.waitForSelector("#sc-splash", { timeout: 25000 });
await page.mouse.click(195, 300);
await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
await page.waitForSelector("#sc-home", { timeout: 15000 });
await page.waitForTimeout(450);
await page.click('.screen.active .gnav-item:has-text("마이")');
await page.waitForSelector("#sc-my.active .my-prof", { timeout: 8000 });
await page.waitForTimeout(420); // 화면 전환 페이드(.3s)가 끝난 뒤 캡처
await page.screenshot({ path: `${prefix}-1-page.png` });

const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")));
const SHEET = "#sc-my .mysheet.ava.open";

// 아바타 시트: 캐릭터 고르기 탭
await page.click("#sc-my .mypf-edit");
await page.waitForSelector(SHEET, { timeout: 5000 });
await page.waitForTimeout(520);
await page.screenshot({ path: `${prefix}-2-sheet-preset.png` });

// 프리셋(힙스터) 선택 → 즉시 적용, 내가 꾸민 조합(avatarCustom)은 보존
await page.click(`${SHEET} .avp:has-text("힙스터")`);
await page.waitForTimeout(380);
const s1 = await state();
console.log("after preset pick :", "preset =", s1.avatarPreset, "| custom =", JSON.stringify(s1.avatarCustom));
await page.screenshot({ path: `${prefix}-3-preset-picked.png` });

// 직접 꾸미기: 머리 범주에서 '단발' 선택 → 커스텀이 대표(프리셋 해제)
await page.click(`${SHEET} .avm:has-text("직접 꾸미기")`);
await page.click(`${SHEET} .avc-cat:text-is("머리")`);
await page.click(`${SHEET} .avc-opt[aria-label="머리: 단발"]`);
await page.waitForTimeout(380);
const s2 = await state();
console.log("after custom touch:", "preset =", s2.avatarPreset, "| custom.hair =", s2.avatarCustom?.hair);
await page.screenshot({ path: `${prefix}-4-custom.png` });

// 다시 캐릭터 고르기: 선택 표시는 '내 캐릭터' 하나뿐이어야 한다(분리 의미론)
await page.click(`${SHEET} .avm:has-text("캐릭터 고르기")`);
await page.waitForTimeout(260);
const sel = await page.locator(`${SHEET} .avp.sel .avp-name`).allTextContents();
console.log("preset .sel       :", JSON.stringify(sel), "(['내 캐릭터']이어야 함)");
await page.screenshot({ path: `${prefix}-5-preset-mine.png` });

// 완료 → 시트 닫힘 + 프로필 카드에 커스텀 반영
await page.click(`${SHEET} .mysheet-x`);
await page.waitForTimeout(420);
await page.screenshot({ path: `${prefix}-6-page-custom.png` });

// 장화 레벨 시트(단계표 14행)
await page.click('#sc-my .my-row:has-text("스텝 장화 레벨")');
await page.waitForTimeout(520);
const rows = await page.locator("#sc-my .sheet.open .bdex-row").count();
console.log("boot tier rows    :", rows, "(14여야 함)");
await page.screenshot({ path: `${prefix}-7-boots.png` });
await page.click("#sc-my .sheet.open .mysheet-x");
await page.waitForTimeout(320);

// 새로고침 후에도 커스텀 아바타 유지(기기 저장): 주소가 #/my라 딥링크로 마이 탭에 바로 선다
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector("#sc-my.active .my-prof", { timeout: 15000 });
await page.waitForTimeout(420);
const persisted = await page.evaluate(() => ({
  svg: !!document.querySelector("#sc-my .mypf-ava .stick-avatar svg"),
  state: (({ avatarPreset, avatarCustom }) => ({ avatarPreset, hair: avatarCustom?.hair }))(JSON.parse(localStorage.getItem("science-app.v1"))),
}));
console.log("after reload      :", JSON.stringify(persisted));
await page.screenshot({ path: `${prefix}-8-reload.png` });

const good =
  s1.avatarPreset === 3 && s1.avatarCustom === null && s2.avatarPreset === null && s2.avatarCustom?.hair === 8 &&
  sel.join() === "내 캐릭터" && rows === 14 && persisted.svg && persisted.state.avatarPreset === null && persisted.state.hair === 8;
await browser.close();
console.log(good ? "DONE (ALL PASS)" : "DONE (FAILED)");
process.exit(good ? 0 : 1);
