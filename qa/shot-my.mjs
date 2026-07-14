// 마이 탭 리디자인 캡처 + 분리 의미론 검증 — PORT=<포트> node qa/shot-my.mjs [출력접두]
// 순서: 페이지 → 아바타 시트(캐릭터 고르기) → 프리셋 선택 → 직접 꾸미기(단발) →
//       프리셋 해제 확인(캐릭터/직접 꾸미기 완전 분리) → 완료 → 장화 레벨 시트.
// 프리뷰 하니스 캡처 프리즈(사고 #17)와 무관한 헤드리스 확정 경로(shot-walk.mjs 문법).
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "3000";
const prefix = process.argv[2] || "qa/shots/my";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 820 } });

// 조건부 시드 — reload 후에도 앱이 저장한 상태(아바타 등)가 살아 있어야 지속성 검증이 된다.
await page.addInitScript((s) => {
  if (!localStorage.getItem("science-app.v1")) localStorage.setItem("science-app.v1", JSON.stringify(s));
}, {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: false, reviewMode: false, goalMin: 10, streak: 0, lastStudyDay: null,
  totalXp: 160, lifeXp: 160, avatarId: null, avatarCustom: null, avatarPreset: null,
  lessons: {}, minigame: {}, exams: {}, wrongNotes: {},
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForSelector(".screen.active .gnav-item", { timeout: 12000 });
await page.click('.screen.active .gnav-item:has-text("마이")');
await page.waitForSelector("#sc-my.active .my-prof", { timeout: 8000 });
await page.waitForTimeout(420); // 화면 전환 페이드(.3s)가 끝난 뒤 캡처
await page.screenshot({ path: `${prefix}-1-page.png` });

// 아바타 시트 — 캐릭터 고르기 탭
await page.click("#sc-my .mypf-edit");
await page.waitForTimeout(480);
await page.screenshot({ path: `${prefix}-2-sheet-preset.png` });

// 프리셋(힙스터) 선택 → 즉시 적용, 내가 꾸민 조합(avatarCustom)은 보존
await page.click('#sc-my .sheet.open .avp:has-text("힙스터")');
await page.waitForTimeout(220);
const s1 = await page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")));
console.log("after preset pick :", "preset =", s1.avatarPreset, "| custom =", JSON.stringify(s1.avatarCustom));
await page.screenshot({ path: `${prefix}-3-preset-picked.png` });

// 직접 꾸미기 — 머리 카테고리에서 새 파츠 '단발' 선택 → 커스텀이 대표(프리셋 해제)
await page.click('#sc-my .sheet.open .avm:has-text("직접 꾸미기")');
await page.click('#sc-my .sheet.open .avc-cat:has-text("머리")');
await page.click('#sc-my .sheet.open .avc-opt[aria-label="머리: 단발"]');
await page.waitForTimeout(220);
const s2 = await page.evaluate(() => JSON.parse(localStorage.getItem("science-app.v1")));
console.log("after custom touch:", "preset =", s2.avatarPreset, "| custom =", JSON.stringify(s2.avatarCustom));
await page.screenshot({ path: `${prefix}-4-custom.png` });

// 다시 캐릭터 고르기 — 아무 프리셋도 선택 상태가 아니어야 한다(분리 의미론)
await page.click('#sc-my .sheet.open .avm:has-text("캐릭터 고르기")');
await page.waitForTimeout(200);
const selCount = await page.locator("#sc-my .sheet.open .avp.sel").count();
console.log("preset .sel count :", selCount, "(0이어야 함)");
await page.screenshot({ path: `${prefix}-5-preset-deselected.png` });

// 완료 → 시트 닫힘 + 프로필 카드에 커스텀 반영
await page.click("#sc-my .sheet.open .mysheet-done");
await page.waitForTimeout(380);
await page.screenshot({ path: `${prefix}-6-page-custom.png` });

// 장화 레벨 시트(단계표 14행)
await page.click('#sc-my .my-row:has-text("스텝 장화 레벨")');
await page.waitForTimeout(480);
const rows = await page.locator("#sc-my .sheet.open .bdex-row").count();
console.log("boot tier rows    :", rows, "(14여야 함)");
await page.screenshot({ path: `${prefix}-7-boots.png` });
await page.click("#sc-my .sheet.open .mysheet-x");
await page.waitForTimeout(300);

// 새로고침 후에도 커스텀 아바타 유지(기기 저장) — 프로필 카드가 파츠 SVG를 그린다
await page.reload({ waitUntil: "networkidle" });
await page.click('.screen.active .gnav-item:has-text("마이")');
await page.waitForSelector("#sc-my.active .my-prof", { timeout: 8000 });
await page.waitForTimeout(420);
const persisted = await page.evaluate(() => ({
  svg: !!document.querySelector("#sc-my .mypf-ava .stick-avatar svg"),
  state: (({ avatarPreset, avatarCustom }) => ({ avatarPreset, avatarCustom }))(JSON.parse(localStorage.getItem("science-app.v1"))),
}));
console.log("after reload      :", JSON.stringify(persisted));
await page.screenshot({ path: `${prefix}-8-reload.png` });

await browser.close();
console.log("DONE");
