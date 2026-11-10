// 아바타 꾸미기(v2) 실플레이 검증 + 캡처: PORT=<포트> node qa/e2e-avatar.mjs [출력 폴더]
// 폰 두 크기(390×700 · 375×812)에서 시트의 두 탭과 모든 범주를 직접 눌러 보고, 잘림·넘침·스크롤 막힘·
// 저장 의미론(캐릭터 고르기 ⇄ 직접 꾸미기 분리)·되돌리기·구버전 저장값 호환을 기계로 확인한다.
// 부팅부는 qa/e2e-soc7.mjs 하드닝판(스플래시 조건 대기 + @vite/client 스텁)을 그대로 따른다.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "5527";
const OUT = process.argv[2] || "qa/shots/avatar";
mkdirSync(OUT, { recursive: true });

const KEY = "science-app.v1";
const SEED = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: false, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null,
  totalXp: 160, lifeXp: 420, avatarId: null, avatarCustom: null, avatarPreset: null,
  lessons: {}, minigame: {}, exams: {}, wrongNotes: {},
};
const VITE_STUB =
  "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}";

let pass = 0;
let fail = 0;
function ok(cond, label, extra = "") {
  if (cond) pass += 1;
  else fail += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  (" + extra + ")" : ""}`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });

// 폰 크기는 손가락 기기로 흉내 낸다(hasTouch·isMobile): 범주 칩·색 줄이 한 줄 가로 스크롤인 실제 폰 배치를 보려면
// 필요하다. 마우스 기기로 열면 CSS가 그 줄들을 줄바꿈으로 편다(PC용 분기).
async function boot(w, h, seed, mouse = false) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: !mouse, isMobile: !mouse });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => {
    fail += 1;
    console.log("FAIL  PAGEERROR:", e.message);
  });
  await page.route("**/@vite/client", (r) => r.fulfill({ contentType: "application/javascript", body: VITE_STUB }));
  // 조건부 시드: reload 뒤에도 앱이 저장한 아바타가 살아 있어야 지속성 검증이 된다.
  await page.addInitScript(
    ({ key, s }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(s));
    },
    { key: KEY, s: seed },
  );
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await toMy(page, w);
  return { ctx, page };
}

async function toMy(page, w) {
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(w / 2, 300); // 플립북 건너뛰기
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await page.waitForTimeout(450);
  await page.click('.screen.active .gnav-item:has-text("마이")');
  await page.waitForSelector("#sc-my.active .my-prof", { timeout: 8000 });
  await page.waitForTimeout(450);
}

const state = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
const SHEET = "#sc-my .mysheet.ava.open";

/** 시트 안 넘침·잘림 검사: 가로 넘침 0, 시트가 화면 안, 격자 마지막 칸까지 스크롤로 닿는다. */
async function layout(page, label) {
  const r = await page.evaluate((sel) => {
    const sheet = document.querySelector(sel);
    const card = sheet.querySelector(".mysheet-card").getBoundingClientRect();
    const frame = document.querySelector("#frame").getBoundingClientRect();
    const pane = [...sheet.querySelectorAll(".avp-pane, .avc-scroll")].find((e) => e.offsetParent !== null);
    const tiles = [...pane.querySelectorAll(".avp, .avc-opt")];
    const pr = pane.getBoundingClientRect();
    // 가로 넘침: 칸이 패널 밖으로 나가면 안 된다
    const hOver = tiles.filter((t) => {
      const b = t.getBoundingClientRect();
      return b.left < pr.left - 0.5 || b.right > pr.right + 0.5;
    }).length;
    // 이름 잘림(말줄임) 검사
    const clipped = [...pane.querySelectorAll(".avc-name, .avp-name")].filter((n) => n.scrollWidth > n.clientWidth + 0.5).map((n) => n.textContent);
    pane.scrollTop = pane.scrollHeight;
    const last = tiles[tiles.length - 1].getBoundingClientRect();
    const reach = last.bottom <= pane.getBoundingClientRect().bottom + 0.5;
    const firstVisibleRows = Math.round(pr.height);
    pane.scrollTop = 0;
    return {
      inFrame: card.top >= frame.top - 0.5 && card.bottom <= frame.bottom + 0.5 && card.left >= frame.left - 0.5 && card.right <= frame.right + 0.5,
      docOver: document.documentElement.scrollWidth - window.innerWidth,
      hOver,
      clipped,
      reach,
      tiles: tiles.length,
      paneH: firstVisibleRows,
      tileH: Math.round(tiles[0].getBoundingClientRect().height),
    };
  }, SHEET);
  ok(r.inFrame && r.docOver <= 0 && r.hOver === 0, `${label} 넘침·잘림 없음`, `칸 ${r.tiles}개 · 패널 ${r.paneH}px · 칸 높이 ${r.tileH}px`);
  ok(r.clipped.length === 0, `${label} 이름 말줄임 없음`, r.clipped.join(", "));
  ok(r.reach, `${label} 마지막 칸까지 스크롤로 닿음`);
  return r;
}

for (const [w, h] of [[390, 700], [375, 812]]) {
  const tag = `${w}x${h}`;
  console.log(`\n== ${tag} ==`);
  const { ctx, page } = await boot(w, h, SEED);
  await page.screenshot({ path: `${OUT}/${tag}-1-my.png` });
  ok(await page.evaluate(() => matchMedia("(pointer: coarse)").matches), "손가락 기기로 흉내 냄(pointer: coarse)");

  // ── 시트 열기: 처음 상태는 '기본'에 불이 켜진다 ──
  await page.click("#sc-my .mypf-edit");
  await page.waitForSelector(SHEET, { timeout: 5000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${tag}-2-preset.png` });
  ok((await page.locator(`${SHEET} .avp.sel .avp-name`).textContent()) === "기본", "처음 상태 = '기본' 선택 표시");
  const nPreset = await page.locator(`${SHEET} .avp`).count();
  await layout(page, "캐릭터 고르기");

  // ── 프리셋 고르기: 대표만 바뀌고 내가 꾸민 조합은 건드리지 않는다 ──
  await page.click(`${SHEET} .avp:has-text("과학자")`);
  await page.waitForTimeout(380);
  let s = await state(page);
  ok(s.avatarPreset === 6 && s.avatarCustom === null, "프리셋 선택 → avatarPreset만 기록", `preset=${s.avatarPreset} custom=${JSON.stringify(s.avatarCustom)}`);
  await page.screenshot({ path: `${OUT}/${tag}-3-preset-picked.png` });

  // ── 직접 꾸미기: 구경만 해서는 대표가 안 바뀐다 ──
  await page.click(`${SHEET} .avm:has-text("직접 꾸미기")`);
  await page.waitForTimeout(250);
  s = await state(page);
  ok(s.avatarPreset === 6, "직접 꾸미기 탭을 열기만 해서는 대표 불변");
  ok((await page.locator(`${SHEET} .avs-tag`).textContent()).includes("고르면"), "미리보기 아래 안내 문구 노출");

  const cats = await page.locator(`${SHEET} .avc-cat`).allTextContents();
  let n = 4;
  for (const c of cats) {
    await page.click(`${SHEET} .avc-cat:text-is("${c}")`);
    await page.waitForTimeout(380);
    await page.screenshot({ path: `${OUT}/${tag}-${n}-custom-${c.replace(/[·\s]/g, "")}.png` });
    await layout(page, `범주 ${c}`);
    n += 1;
  }
  s = await state(page);
  ok(s.avatarPreset === 6 && s.avatarCustom === null, "범주만 넘겨 봐서는 저장값 불변");

  // ── 파츠·색을 누르면 내 캐릭터이 대표(프리셋 해제) ──
  const pick = async (cat, label) => {
    await page.click(`${SHEET} .avc-cat:text-is("${cat}")`);
    await page.click(`${SHEET} .avc-opt[aria-label="${label}"]`);
    await page.waitForTimeout(120);
  };
  const color = async (cat, label) => {
    await page.click(`${SHEET} .avc-cat:text-is("${cat}")`);
    await page.click(`${SHEET} .avc-sw[aria-label="${label}"]`);
    await page.waitForTimeout(120);
  };
  await pick("머리", "머리: 단발");
  s = await state(page);
  ok(s.avatarPreset === null && s.avatarCustom?.hair === 8, "파츠 선택 → 내 캐릭터이 대표(프리셋 해제)", JSON.stringify(s.avatarCustom));
  await color("머리", "머리색: 분홍");
  await color("얼굴형", "피부색: 복숭아");
  await pick("안경", "안경: 둥근 안경");
  await pick("모자·장식", "모자·장식: 비니");
  await color("모자·장식", "모자 색: 노랑");
  await pick("옷", "옷: 후드티");
  await color("옷", "옷 색: 보라");
  await pick("소품", "소품: 플라스크");
  await pick("볼", "볼: 볼터치");
  await pick("배경", "배경: 레몬");
  await page.waitForTimeout(300);
  s = await state(page);
  const want = { hair: 8, hairColor: 5, skin: 1, glasses: 1, acc: 1, accColor: 2, top: 2, topColor: 8, prop: 2, cheek: 1, bg: 2 };
  ok(Object.entries(want).every(([k, v]) => s.avatarCustom?.[k] === v), "열 번 고른 값이 전부 저장됨", JSON.stringify(s.avatarCustom));
  await page.screenshot({ path: `${OUT}/${tag}-${n}-custom-picked.png` });
  n += 1;
  const mine = JSON.stringify(s.avatarCustom);

  // ── 랜덤 → 되돌리기: 공들인 조합이 돌아온다 ──
  await page.click(`${SHEET} .avs-act[aria-label="랜덤으로 꾸미기"]`);
  await page.waitForTimeout(380);
  s = await state(page);
  ok(JSON.stringify(s.avatarCustom) !== mine, "랜덤 → 조합이 바뀜");
  await page.screenshot({ path: `${OUT}/${tag}-${n}-random.png` });
  n += 1;
  await page.click(`${SHEET} .avs-act[aria-label="방금 바꾼 것 되돌리기"]`);
  await page.waitForTimeout(380);
  s = await state(page);
  ok(JSON.stringify(s.avatarCustom) === mine, "되돌리기 → 랜덤 전 조합 복원");

  // ── 캐릭터 고르기로 돌아가면 '내 캐릭터' 칸이 생기고 그것이 선택돼 있다 ──
  await page.click(`${SHEET} .avm:has-text("캐릭터 고르기")`);
  await page.waitForTimeout(250);
  ok((await page.locator(`${SHEET} .avp`).count()) === nPreset + 1, "'내 캐릭터' 칸 추가");
  ok((await page.locator(`${SHEET} .avp.sel .avp-name`).allTextContents()).join() === "내 캐릭터", "대표 = 내 캐릭터 선택 표시");
  await page.click(`${SHEET} .avp:has-text("게이머")`);
  await page.waitForTimeout(300);
  s = await state(page);
  ok(s.avatarPreset === 4 && JSON.stringify(s.avatarCustom) === mine, "다른 캐릭터를 골라도 내 조합은 보존");
  await page.click(`${SHEET} .avp:has-text("내 캐릭터")`);
  await page.waitForTimeout(300);
  s = await state(page);
  ok(s.avatarPreset === null && JSON.stringify(s.avatarCustom) === mine, "'내 캐릭터' 칸 → 손대지 않고 내 조합으로 복귀");
  await page.screenshot({ path: `${OUT}/${tag}-${n}-preset-mine.png` });
  n += 1;

  // ── 완료 → 카드 반영 + 탭바 아이콘(로그인 상태 재현: fillMyIcon과 같은 조립) ──
  await page.click(`${SHEET} .mysheet-x`);
  await page.waitForTimeout(450);
  ok((await page.locator("#sc-my .mysheet.open").count()) === 0, "완료 → 시트 닫힘");
  await page.evaluate(async (k) => {
    const m = await import("/src/ui/avatar.ts");
    const st = JSON.parse(localStorage.getItem(k));
    const a = m.profileAvatar(st.avatarId, st.avatarCustom, st.avatarPreset, "head");
    a.classList.add("gnav-ava");
    document.querySelector("#sc-my .gnav-ic.my").replaceChildren(a);
  }, KEY);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/${tag}-${n}-my-custom.png` });
  n += 1;
  await page.screenshot({ path: `${OUT}/${tag}-${n}-gnav.png`, clip: await page.locator("#sc-my .gnav").boundingBox() });
  n += 1;

  // ── 아바타를 눌러도 시트가 열린다 + 시작 탭은 저장 상태를 따른다(내 조합이 대표 → 직접 꾸미기) ──
  await page.click("#sc-my .mypf-ava");
  await page.waitForSelector(SHEET, { timeout: 5000 });
  await page.waitForTimeout(500);
  ok((await page.locator(`${SHEET} .avm.on`).textContent()) === "직접 꾸미기", "내 조합이 대표면 직접 꾸미기 탭에서 열림");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  ok((await page.locator("#sc-my .mysheet.open").count()) === 0, "Esc → 시트 닫힘");

  // ── 새로고침 뒤에도 유지(기기 저장): 주소가 #/my라 딥링크 부팅으로 스플래시 없이 마이 탭에 바로 선다 ──
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#sc-my.active .my-prof", { timeout: 15000 });
  await page.waitForTimeout(450);
  s = await state(page);
  ok(JSON.stringify(s.avatarCustom) === mine && s.avatarPreset === null, "새로고침 뒤 조합 유지");
  ok((await page.locator("#sc-my .mypf-ava .stick-avatar svg").count()) === 1, "프로필 카드가 벡터 아바타를 그림");
  await ctx.close();
}

// ── 낮은 창(390×480): 시트가 화면을 넘지 않고, 닫힌 시트가 비쳐 보이지 않는다 ──
{
  console.log("\n== 390x480 (낮은 창) ==");
  const { ctx, page } = await boot(390, 480, SEED);
  await page.click("#sc-my .mypf-edit");
  await page.waitForSelector(SHEET, { timeout: 5000 });
  await page.waitForTimeout(600);
  await layout(page, "낮은 창 캐릭터 고르기");
  const vis = await page.evaluate(() =>
    [...document.querySelectorAll("#sc-my .mysheet")].map((e) => ({ label: e.getAttribute("aria-label"), open: e.classList.contains("open"), vis: getComputedStyle(e).visibility })),
  );
  ok(vis.every((v) => v.open === (v.vis === "visible")), "열린 시트만 보임(닫힌 시트는 visibility: hidden)", JSON.stringify(vis));
  await page.screenshot({ path: `${OUT}/390x480-low.png` });
  await ctx.close();
}

// ── 작은 폰(320×568): 열 수가 줄어도 넘치지 않는다 ──
{
  console.log("\n== 320x568 (작은 폰) ==");
  const { ctx, page } = await boot(320, 568, SEED);
  await page.click("#sc-my .mypf-edit");
  await page.waitForSelector(SHEET, { timeout: 5000 });
  await page.waitForTimeout(600);
  await layout(page, "작은 폰 캐릭터 고르기");
  await page.click(`${SHEET} .avm:has-text("직접 꾸미기")`);
  for (const c of ["머리", "눈", "옷", "배경"]) {
    await page.click(`${SHEET} .avc-cat:text-is("${c}")`);
    await page.waitForTimeout(300);
    await layout(page, `작은 폰 범주 ${c}`);
  }
  const stage = await page.evaluate((sel) => {
    const st = document.querySelector(`${sel} .avs-stage`).getBoundingClientRect();
    return [...document.querySelectorAll(`${sel} .avs-act, ${sel} .avs-preview`)].every((e) => {
      const b = e.getBoundingClientRect();
      return b.left >= st.left - 0.5 && b.right <= st.right + 0.5;
    });
  }, SHEET);
  ok(stage, "작은 폰: 무대(되돌리기·미리보기·랜덤)가 한 줄에 들어감");
  await page.screenshot({ path: `${OUT}/320x568-custom.png` });
  await ctx.close();
}

// ── 고른 것이 목록 뒤쪽이면 그 범주를 열 때 보이는 자리로 당긴다 ──
{
  console.log("\n== 고른 항목 보이기 ==");
  const far = { face: 0, hair: 16, eyes: 13, mouth: 0, glasses: 0, acc: 13, skin: 10, hairColor: 9, cheek: 0, top: 9, topColor: 11, accColor: 9, prop: 0, bg: 12 };
  const { ctx, page } = await boot(390, 700, { ...SEED, avatarCustom: far });
  await page.click("#sc-my .mypf-edit");
  await page.waitForSelector(SHEET, { timeout: 5000 });
  await page.waitForTimeout(600);
  const seen = (sel, box) =>
    page.evaluate(
      ({ sel, box }) => {
        const e = document.querySelector(sel);
        const b = document.querySelector(box).getBoundingClientRect();
        if (!e) return false;
        const r = e.getBoundingClientRect();
        return r.top >= b.top - 1 && r.bottom <= b.bottom + 1 && r.left >= b.left - 1 && r.right <= b.right + 1;
      },
      { sel, box },
    );
  ok(await seen(`${SHEET} .avc-sw.sel`, `${SHEET} .avc-colors-row`), "얼굴형: 고른 피부색(맨 끝)이 보임");
  for (const c of ["머리", "눈", "모자·장식", "옷", "배경"]) {
    await page.click(`${SHEET} .avc-cat:text-is("${c}")`);
    await page.waitForTimeout(350);
    ok(await seen(`${SHEET} .avc-opt.sel`, `${SHEET} .avc-scroll`), `${c}: 고른 파츠(맨 끝)가 보임`);
    if (c !== "눈" && c !== "배경") ok(await seen(`${SHEET} .avc-sw.sel`, `${SHEET} .avc-colors-row`), `${c}: 고른 색(맨 끝)이 보임`);
  }
  // 캐릭터 목록 맨 아래 것을 골라도 목록이 맨 위로 튀지 않는다
  await page.click(`${SHEET} .avm:has-text("캐릭터 고르기")`);
  await page.waitForTimeout(250);
  await page.evaluate((s) => {
    const p = document.querySelector(`${s} .avp-pane`);
    p.scrollTop = p.scrollHeight;
  }, SHEET);
  const top0 = await page.evaluate((s) => document.querySelector(`${s} .avp-pane`).scrollTop, SHEET);
  await page.click(`${SHEET} .avp:has-text("야옹이")`);
  await page.waitForTimeout(250);
  const top1 = await page.evaluate((s) => document.querySelector(`${s} .avp-pane`).scrollTop, SHEET);
  ok(top0 > 0 && Math.abs(top1 - top0) < 2, "맨 아래 캐릭터를 골라도 목록 스크롤 자리 유지", `${top0} → ${top1}`);
  await page.click(`${SHEET} .avm:has-text("직접 꾸미기")`);
  await page.waitForTimeout(250);

  // 색을 누른 뒤에도 굴려 둔 자리가 유지된다(다시 그리며 맨 앞으로 튀지 않음)
  await page.click(`${SHEET} .avc-cat:text-is("옷")`);
  await page.waitForTimeout(300);
  const before = await page.evaluate((s) => document.querySelector(`${s} .avc-colors-row`).scrollLeft, SHEET);
  await page.click(`${SHEET} .avc-sw[aria-label="옷 색: 회색"]`);
  await page.waitForTimeout(200);
  const after = await page.evaluate((s) => document.querySelector(`${s} .avc-colors-row`).scrollLeft, SHEET);
  ok(before > 0 && Math.abs(after - before) < 2, "색을 눌러도 색 줄 스크롤 자리 유지", `${before} → ${after}`);
  await ctx.close();
}

// ── 마우스 기기(PC 브라우저의 폰 프레임): 칩·색 줄이 줄바꿈으로 펴져 굴리지 않아도 전부 보인다 ──
{
  console.log("\n== 마우스 기기 390x780 ==");
  const { ctx, page } = await boot(390, 780, SEED, true);
  await page.click("#sc-my .mypf-edit");
  await page.waitForSelector(SHEET, { timeout: 5000 });
  await page.waitForTimeout(500);
  await page.click(`${SHEET} .avm:has-text("직접 꾸미기")`);
  await page.click(`${SHEET} .avc-cat:text-is("옷")`);
  await page.waitForTimeout(350);
  const r = await page.evaluate((sel) => {
    const sheet = document.querySelector(sel);
    const inside = (row, items) => {
      const b = row.getBoundingClientRect();
      return items.every((e) => { const q = e.getBoundingClientRect(); return q.left >= b.left - 0.5 && q.right <= b.right + 0.5; });
    };
    return {
      fine: matchMedia("(hover: hover) and (pointer: fine)").matches,
      cats: inside(sheet.querySelector(".avc-cats"), [...sheet.querySelectorAll(".avc-cat")]),
      sws: inside(sheet.querySelector(".avc-colors-row"), [...sheet.querySelectorAll(".avc-sw")]),
    };
  }, SHEET);
  ok(r.fine && r.cats && r.sws, "마우스 기기: 범주 칩·색 견본이 전부 화면 안(줄바꿈)", JSON.stringify(r));
  await layout(page, "마우스 기기 범주 옷");
  await page.screenshot({ path: `${OUT}/mouse-390x780-custom.png` });
  await ctx.close();
}

// ── 움직임: 미리보기만 살아 있고(숨쉬기·깜빡임), 움직임 줄이기에서는 멈춘다 ──
{
  console.log("\n== 움직임 ==");
  const count = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].reduce((n, e) => n + e.getAnimations().length, 0), sel);
  const { ctx, page } = await boot(390, 700, SEED);
  ok((await count(page, "#sc-my .avs-preview .sa-bob, #sc-my .avs-preview .sa-eyes")) === 0, "시트가 닫혀 있으면 미리보기 애니메이션 없음");
  await page.click("#sc-my .mypf-edit");
  await page.waitForSelector(SHEET, { timeout: 5000 });
  await page.waitForTimeout(600);
  ok((await count(page, `${SHEET} .avs-preview .sa-bob, ${SHEET} .avs-preview .sa-eyes`)) >= 3, "시트가 열리면 숨쉬기·깜빡임이 돈다");
  ok((await count(page, "#sc-my .mypf-ava .sa-bob, #sc-my .mypf-ava .sa-eyes")) === 0, "프로필 카드 아바타는 정지 그림");
  await page.click(`${SHEET} .avp:has-text("방글")`);
  ok(await page.evaluate((s) => document.querySelector(`${s} .avs-preview`).getAnimations().some((a) => a.animationName === "avsPop"), SHEET), "고르면 미리보기가 튕긴다");
  await ctx.close();

  const rctx = await browser.newContext({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const rpage = await rctx.newPage();
  await rpage.route("**/@vite/client", (r) => r.fulfill({ contentType: "application/javascript", body: VITE_STUB }));
  await rpage.addInitScript(({ key, s }) => localStorage.setItem(key, JSON.stringify(s)), { key: KEY, s: SEED });
  await rpage.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await toMy(rpage, 390);
  await rpage.click("#sc-my .mypf-edit");
  await rpage.waitForSelector(SHEET, { timeout: 5000 });
  await rpage.waitForTimeout(500);
  await rpage.click(`${SHEET} .avp:has-text("방글")`);
  ok((await count(rpage, `${SHEET} .avs-preview, ${SHEET} .avs-preview .sa-bob, ${SHEET} .avs-preview .sa-eyes`)) === 0, "움직임 줄이기: 튕김·숨쉬기·깜빡임 모두 멈춤");
  ok(await rpage.evaluate((s) => getComputedStyle(document.querySelector(s)).opacity === "1", SHEET), "움직임 줄이기: 시트는 페이드로 열림");
  await rctx.close();
}

// ── 구버전 저장값 호환 ──
{
  console.log("\n== 구버전 저장값 호환 ==");
  const cases = [
    { name: "v1 커스텀 6슬롯(단발·둥근 안경)", seed: { avatarCustom: { face: 1, hair: 8, eyes: 2, mouth: 3, glasses: 1, acc: 0 }, avatarPreset: null, avatarId: null }, expect: "custom" },
    { name: "v1 커스텀 + 모자(헤드폰)", seed: { avatarCustom: { face: 3, hair: 4, eyes: 5, mouth: 5, glasses: 4, acc: 3 }, avatarPreset: null, avatarId: null }, expect: "custom" },
    { name: "v1 프리셋 5(캡틴) + 남아 있는 커스텀", seed: { avatarCustom: { face: 0, hair: 2, eyes: 1, mouth: 1, glasses: 0, acc: 0 }, avatarPreset: 5, avatarId: null }, expect: "preset" },
    { name: "래스터 avatarId 7(단발 소녀)만", seed: { avatarCustom: null, avatarPreset: null, avatarId: 7 }, expect: "raster" },
    { name: "손상: 범위 밖 인덱스 + 문자열", seed: { avatarCustom: { face: 99, hair: -3, eyes: "2", mouth: null, glasses: 1.7, acc: 1e9 }, avatarPreset: 999, avatarId: null }, expect: "custom" },
    { name: "아무것도 없음(게스트)", seed: { avatarCustom: null, avatarPreset: null, avatarId: null }, expect: "guest" },
  ];
  for (const c of cases) {
    const { ctx, page } = await boot(390, 700, { ...SEED, ...c.seed });
    const r = await page.evaluate(async (seed) => {
      const m = await import("/src/ui/stickParts.ts");
      const fr = document.querySelector("#sc-my .mypf-ava .stick-avatar");
      // 같은 그림인지 비교: DOM을 거친 직렬화끼리 견주고, 합성마다 달라지는 id 접미는 지운다.
      const norm = (html) => html.replace(/id="\w+"|url\(["']?#\w+["']?\)/g, "");
      const dom = (cfg) => {
        const t = document.createElement("span");
        t.innerHTML = m.stickAvatarSvg(cfg);
        return norm(t.innerHTML);
      };
      const shown = norm(fr.innerHTML);
      return {
        svg: !!fr.querySelector("svg"),
        img: !!fr.querySelector("img"),
        imgOk: fr.querySelector("img") ? fr.querySelector("img").naturalWidth > 0 : null,
        norm: seed.avatarCustom ? m.normStick(seed.avatarCustom) : null,
        same: seed.avatarCustom ? shown === dom(seed.avatarCustom) : null,
        guest: shown === dom(m.DEFAULT_STICK),
        preset: seed.avatarPreset != null && m.STICK_PRESETS[seed.avatarPreset] ? shown === dom(m.STICK_PRESETS[seed.avatarPreset].cfg) : null,
      };
    }, c.seed);
    if (c.expect === "custom") {
      const legacy = ["face", "hair", "eyes", "mouth", "glasses", "acc"];
      const fresh = ["skin", "hairColor", "cheek", "top", "topColor", "accColor", "prop", "bg"];
      ok(r.svg && r.same, `${c.name}: 저장된 조합 그대로 렌더`);
      ok(fresh.every((k) => r.norm[k] === 0), `${c.name}: 새 슬롯은 0(예전 모습)으로 채움`, JSON.stringify(r.norm));
      ok(legacy.every((k) => Number.isInteger(r.norm[k]) && r.norm[k] >= 0), `${c.name}: 옛 슬롯 인덱스가 유효 범위`);
    } else if (c.expect === "preset") ok(r.svg && r.preset, `${c.name}: 프리셋이 대표로 렌더`);
    else if (c.expect === "raster") ok(r.img && r.imgOk, `${c.name}: 래스터 아바타 유지`);
    else ok(r.svg && r.guest, `${c.name}: 게스트 스틱(기본)으로 렌더`);
    // 시트를 열어도 깨지지 않는다
    await page.click("#sc-my .mypf-edit");
    await page.waitForSelector(SHEET, { timeout: 5000 });
    await page.waitForTimeout(400);
    ok((await page.locator(`${SHEET} .avs-preview .stick-avatar > *`).count()) === 1, `${c.name}: 시트 미리보기 정상`);
    await ctx.close();
  }

  // v1 조합의 옛 6슬롯 의미 보존: 이름으로 대조(인덱스가 밀렸으면 여기서 잡힌다)
  const { ctx, page } = await boot(390, 700, SEED);
  const names = await page.evaluate(async () => {
    const m = await import("/src/ui/stickParts.ts");
    const by = Object.fromEntries(m.STICK_SLOTS.map((s) => [s.key, s.parts.map((p) => p.name)]));
    return { by, presets: m.STICK_PRESETS.map((p) => p.name), p0: JSON.stringify(m.STICK_PRESETS[0].cfg) === JSON.stringify(m.DEFAULT_STICK) };
  });
  const V1 = {
    face: ["동글", "갸름", "각진", "통통"],
    hair: ["민머리", "새싹", "바가지", "까치머리", "곱슬", "양갈래", "포니테일", "긴 생머리", "단발"],
    eyes: ["점눈", "웃음눈", "또랑눈", "반짝눈", "졸린눈", "윙크"],
    mouth: ["미소", "활짝", "오", "새침", "씨익", "메롱"],
    glasses: ["없음", "둥근 안경", "사각 안경", "뿔테 안경", "선글라스"],
    acc: ["없음", "비니", "야구모자", "헤드폰"],
  };
  for (const [k, list] of Object.entries(V1)) ok(list.every((nm, i) => names.by[k][i] === nm), `v1 ${k} 인덱스 의미 보존`, names.by[k].slice(0, list.length).join("·"));
  ok(["기본", "방글", "모범생", "힙스터", "게이머", "캡틴"].every((nm, i) => names.presets[i] === nm), "v1 프리셋 인덱스 의미 보존");
  ok(names.p0, "프리셋 0 '기본' = DEFAULT_STICK(처음 모습)");
  await ctx.close();
}

await browser.close();
console.log(`\n${fail === 0 ? "ALL PASS" : "FAILED"}  ${pass}/${pass + fail}`);
process.exit(fail === 0 ? 0 : 1);
