// 중1 Ⅲ v5(랩과 도입) 단원 검사: 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가 본다.
//   · 시점마다(처음, 조작 중, 판정, 오답, 결론) 스크롤 높이가 한 화면(554px) 안인지
//   · 랩의 첫 판정에서 한 번 틀려 보고 오답 카드가 뜨는지, '다음'을 눌러야 넘어가는지
//   · 끝 버튼으로 다음 스텝이 열리는지, 페이지 오류가 없는지
//   · 그 길에서 모은 화면 글에 대시, '교과서', 이모지, '분자'가 없는지
// 실행(dev 서버): PORT=5573 node qa/check-u3v5.mjs [캡처 폴더] [레슨 id ...]
// 캡처는 눈검수용 시트(qa/sheet-u3v5.py)가 쓴다.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { measure as measureLab, setRange, waitAsk, pickWrong, pickRight, tapNext, wrongCard, waitDone, waitFor, ctaState, cta, tap, W } from "./u2v5-lib.mjs";
import { measure as measureOpn, choose, stagePt, waitPhase } from "./u2intro-lib.mjs";

const PORT = process.env.PORT || "5573";
const BASE = `http://localhost:${PORT}`;
const args = process.argv.slice(2);
const OUT = args[0] && !/^u3l\d$/.test(args[0]) ? args[0] : "qa/shots/u3v5";
const ONLY = args.filter((a) => /^u3l\d$/.test(a));
mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL " + msg); } };
const texts = new Set();

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/navigator\.vibrate/.test(m.text())) errors.push("console: " + m.text()); if (m.type() === "warning" && /\[v5\]|\[opener\]/.test(m.text())) errors.push("warn: " + m.text()); });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
});
// 다른 세션이 파일을 저장해도 페이지가 다시 읽히지 않게 HMR만 끈다(CSS 주입은 살린다)
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

const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const grab = async () => {
  const t = await page.evaluate(() => [...document.querySelectorAll(".screen.active .step *")].filter((e) => e.children.length === 0 && e.offsetParent !== null).map((e) => e.textContent.trim()).filter(Boolean));
  t.forEach((x) => texts.add(x));
  const c = await ctaState(page);
  texts.add(c.text);
};
const stepKind = () => page.evaluate(() => {
  const s = document.querySelector(".screen.active .step");
  if (!s) return "";
  return s.classList.contains("opn-step") ? "opener" : s.classList.contains("u3x-step") ? "u3lab:" + (s.querySelector(".bv-title")?.textContent ?? "") : "other";
});
const phase = () => page.evaluate(() => document.querySelector(".screen.active .step")?.dataset.u3Phase ?? "");
const waitU3 = (v, tries = 100) => waitFor(page, (x) => document.querySelector(".screen.active .step")?.dataset.u3Phase === x, v, tries, 100);
const dsU3 = (k) => page.evaluate((key) => document.querySelector(".screen.active .step")?.dataset[key] ?? "", k);

// ── 한 화면 재기 ─────────────────────────────────────────────────
async function atOpn(id, mark, snap = false) {
  const m = await measureOpn(page);
  ok(m.content <= m.view && m.scrollTop === 0, `${id} 도입 ${mark}: 스크롤 ${m.content}/${m.view}`);
  ok(m.titleLines === 1, `${id} 도입 ${mark}: 제목 ${m.titleLines}줄`);
  ok(m.clipped.length === 0, `${id} 도입 ${mark}: 잘린 글 ${m.clipped.join(" | ")}`);
  ok((m.bubbleLines ?? 0) <= 3, `${id} 도입 ${mark}: 말 ${m.bubbleLines}줄`);
  await grab();
  if (snap) await shot(`${id}-0-${mark}`);
  console.log(`  ${id} 도입 ${mark}: ${m.content}/${m.view}, 말 ${m.bubbleLines}줄, ${m.chars}자`);
  ok(m.chars <= 200, `${id} 도입 ${mark}: 글 ${m.chars}자`);
}
async function atLab(id, n, mark, snap = false) {
  const m = await measureLab(page);
  // 결론 뒤에 붙는 궁금증 카드는 한 화면 밖이어도 된다(랩이 끝난 뒤에 읽는 글이다)
  ok(m.total <= m.usable || (mark === "done" && m.curio), `${id} 랩${n} ${mark}: 높이 ${m.total}/${m.usable}`);
  ok(!m.helperOver, `${id} 랩${n} ${mark}: 도움말 넘침 "${m.helperText}"`);
  ok(!m.slotOver, `${id} 랩${n} ${mark}: 조작 칸 넘침`);
  ok(m.cut.length === 0, `${id} 랩${n} ${mark}: 잘린 글 ${m.cut.join(" | ")}`);
  ok(m.taps.every((t) => t.h >= 44), `${id} 랩${n} ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 44).map((t) => t.t + t.h).join(",")}`);
  await grab();
  if (snap) await shot(`${id}-${n}-${mark}`);
  console.log(`  ${id} 랩${n} ${mark}: ${m.total}/${m.usable}`);
}

/** 도입: 예측을 고르고 play()로 조작한 뒤 끝 버튼을 누른다. */
async function opener(id, pick, play) {
  ok((await stepKind()) === "opener", `${id}: 새 도입으로 열리지 않음(${await stepKind()})`);
  await waitPhase(page, "ask");
  await W(page, 400);
  await atOpn(id, "ask", true);
  await choose(page, pick);
  await waitPhase(page, "play");
  await W(page, 500);
  await atOpn(id, "picked");
  await play();
  ok(await waitPhase(page, "done", 80), `${id}: 도입이 끝나지 않음`);
  await W(page, 1300);
  await atOpn(id, "done", true);
  const c = await ctaState(page);
  ok(c.enabled, `${id}: 도입 끝 버튼이 잠겨 있음("${c.text}")`);
  await cta(page);
  await W(page, 500);
}
const holdAt = async (x, y, ms) => {
  const p = await stagePt(page, x, y);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await W(page, ms);
  await page.mouse.up();
};
/** 꾹 누르는 버튼을 cond()가 참이 될 때까지 누른다. */
async function holdBtn(sel, cond, max = 12000) {
  const box = await page.locator(`.screen.active ${sel}`).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const t0 = Date.now();
  while (Date.now() - t0 < max && !(await cond())) await W(page, 80);
  await page.mouse.up();
}
/** 랩의 마지막: 판정에서 한 번 틀리고(wrong) 결론까지. */
async function judge(id, n, wrong) {
  ok(await waitAsk(page), `${id} 랩${n}: 판정이 뜨지 않음`);
  await W(page, 350);
  await atLab(id, n, "ask", true);
  if (wrong) {
    await pickWrong(page);
    await W(page, 600);
    const w = await wrongCard(page);
    ok(w.has && w.adjacent && w.othersGone && w.word === "오답이에요" && w.rowHue === "red" && w.answerShown && w.nextH >= 44, `${id} 랩${n}: 오답 카드 ${JSON.stringify(w)}`);
    await atLab(id, n, "wrong", true);
    await W(page, 1500);
    ok(!(await page.evaluate(() => !!document.querySelector(".screen.active .bv-done.show"))), `${id} 랩${n}: '다음'을 누르기 전에 넘어감`);
    await tapNext(page);
  } else await pickRight(page);
}
async function conclude(id, n) {
  ok(await waitDone(page), `${id} 랩${n}: 결론이 뜨지 않음`);
  await W(page, 500);
  await atLab(id, n, "done", true);
  const c = await ctaState(page);
  ok(c.enabled, `${id} 랩${n}: 끝 버튼이 잠겨 있음("${c.text}")`);
  await cta(page);
  await W(page, 500);
}
const tapText = (text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll(".screen.active .bv-ctl button")].find((x) => x.offsetParent !== null && !x.disabled && x.textContent.trim() === t);
    if (!b) return false;
    b.click();
    return true;
  }, text);
const isLab = async (id, n, title) => ok((await stepKind()) === "u3lab:" + title, `${id} 랩${n}: 다음 스텝이 "${title}"가 아님(${await stepKind()})`);

// ── 레슨마다의 길 ────────────────────────────────────────────────
const LESSONS = {
  u3l1: async (id) => {
    await opener(id, "왼쪽", async () => {
      const a = await stagePt(page, 660, 380);
      await page.mouse.click(a.x, a.y);
      await W(page, 700);
      await atOpn(id, "mid", true);
      const b = await stagePt(page, 300, 380);
      await page.mouse.click(b.x, b.y);
    });
    await isLab(id, 1, "온도가 오르면 입자는 어떻게 될까?");
    await W(page, 600);
    await atLab(id, 1, "mount", true);
    await setRange(page, ".u3x-range", 95, false);
    await W(page, 900);
    await atLab(id, 1, "hot", true);
    await setRange(page, ".u3x-range", 5);
    ok(await waitU3("match"), `${id}: 맞추기 국면으로 넘어가지 않음`);
    await W(page, 900);
    await atLab(id, 1, "match", true);
    await setRange(page, ".u3x-range", 35);
    await tap(page, ".bv-ctl .bv-btn");
    await W(page, 700);
    await atLab(id, 1, "miss", true);
    ok((await phase()) === "match", `${id}: 틀린 온도인데 넘어감`);
    await setRange(page, ".u3x-range", 72);
    await W(page, 1200);
    await tap(page, ".bv-ctl .bv-btn");
    await W(page, 800);
    await atLab(id, 1, "solved", true);
    await judge(id, 1, true);
    await conclude(id, 1);
  },
  u3l2: async (id) => {
    await opener(id, "달걀만", async () => {
      await holdAt(330, 300, 900); // 중간에 손을 뗀다
      await W(page, 400);
      await atOpn(id, "mid", true);
      await holdAt(330, 300, 2600);
    });
    await isLab(id, 1, "뜨거운 물과 찬물이 닿으면?");
    await W(page, 600);
    await atLab(id, 1, "mount", true);
    const settledIs = (v) => waitFor(page, (x) => document.querySelector(".screen.active .step")?.dataset.u3Settled === x, v, 100, 100);
    // 뚜껑을 닫지 않고 측정한다(실패하는 길)
    await tapText("컵 넣기");
    await W(page, 700);
    await atLab(id, 1, "in", true);
    await tapText("측정 시작");
    await W(page, 1500);
    ok(await settledIs("leak"), `${id}: 뚜껑 없는 실험이 실패로 끝나지 않음(${await dsU3("u3Settled")})`);
    await W(page, 300);
    await atLab(id, 1, "leak", true);
    await tapText("컵 꺼내기");
    await W(page, 500);
    // 찬 컵
    await tapText("컵 넣기");
    await W(page, 500);
    await tapText("뚜껑 닫기");
    await tapText("측정 시작");
    await W(page, 1500);
    await atLab(id, 1, "run", true);
    ok(await settledIs("1"), `${id}: 찬 컵 실험이 끝나지 않음`);
    await W(page, 300);
    await atLab(id, 1, "cold", true);
    await tapText("컵 꺼내기"); // 꺼내면 예측이 뜬다
    await W(page, 700);
    await atLab(id, 1, "predict", true);
    await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-choice")?.click());
    await W(page, 1500);
    await atLab(id, 1, "ready");
    await tapText("컵 넣기");
    await W(page, 500);
    await tapText("뚜껑 닫기");
    await tapText("측정 시작");
    await W(page, 1200);
    await atLab(id, 1, "run2", true);
    ok(await settledIs("1"), `${id}: 뜨거운 컵 실험이 끝나지 않음`);
    await W(page, 300);
    await atLab(id, 1, "hot", true);
    await judge(id, 1, true);
    await conclude(id, 1);
  },
  u3l3: async (id) => {
    // 만화는 그대로다. 검토 모드의 앞으로 가기로 첫 랩까지 건너간다
    ok(await page.evaluate(() => !!document.querySelector(".screen.active .step .comic-art, .screen.active .step [class*=comic]")), `${id}: 첫 스텝이 만화가 아님`);
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await W(page, 900);
    // 1 전도
    await isLab(id, 1, "어느 막대가 열을 빨리 전할까?");
    await atLab(id, 1, "predict", true);
    await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-choice")?.click());
    await W(page, 1500);
    await atLab(id, 1, "mount", true);
    for (const k of ["cu", "fe", "glass"]) {
      await tap(page, `.bv-card[data-k=${k}]`);
      await W(page, 300);
      if (k === "cu") {
        const box = await page.locator(".screen.active .u3x-hold").boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await W(page, 1000);
        await atLab(id, 1, "heating", true);
        await page.mouse.up();
        await W(page, 300);
      }
      await holdBtn(".u3x-hold", async () => (await dsU3("u3Rod")) === `${k}:done`);
      ok((await dsU3("u3Rod")) === `${k}:done`, `${id}: ${k} 막대가 끝나지 않음`);
      await W(page, 300);
      await atLab(id, 1, `rod-${k}`, k !== "fe");
    }
    await judge(id, 1, true);
    await conclude(id, 1);
    // 2 대류
    await isLab(id, 2, "아래만 데워도 왜 다 따뜻해질까?");
    await atLab(id, 2, "mount", true);
    const sceneIs = (v) => waitFor(page, (x) => document.querySelector(".screen.active .step")?.dataset.u3Scene === x, v, 130, 100);
    await tapText("불 켜기");
    await W(page, 2200);
    await atLab(id, 2, "pot-run", true);
    ok(await sceneIs("pot:ok"), `${id}: 냄비가 끝나지 않음(${await dsU3("u3Scene")})`);
    await atLab(id, 2, "pot-ok");
    await tapText("다음 실험으로");
    await W(page, 500);
    await atLab(id, 2, "heater", true);
    await tapText("위쪽에 달기");
    ok(await sceneIs("heater:fail"), `${id}: 난방기 위쪽이 실패로 끝나지 않음(${await dsU3("u3Scene")})`);
    await W(page, 300);
    await atLab(id, 2, "heater-fail", true);
    await tapText("아래쪽에 달기");
    ok(await sceneIs("heater:ok"), `${id}: 난방기 아래쪽이 끝나지 않음(${await dsU3("u3Scene")})`);
    await W(page, 300);
    await atLab(id, 2, "heater-ok", true);
    await tapText("다음 실험으로");
    await W(page, 500);
    await tapText("위쪽에 달기");
    ok(await sceneIs("cooler:ok"), `${id}: 냉방기 위쪽이 끝나지 않음(${await dsU3("u3Scene")})`);
    await W(page, 300);
    await atLab(id, 2, "cooler-ok", true);
    await judge(id, 2, true);
    await conclude(id, 2);
    // 3 복사
    await isLab(id, 3, "난로 곁에 서면 왜 따뜻할까?");
    await atLab(id, 3, "mount", true);
    await setRange(page, ".u3x-range", 5);
    await W(page, 500);
    await atLab(id, 3, "near", true);
    ok(Number(await dsU3("u3Warm")) >= 4, `${id}: 가까이 갔는데 받는 열이 작음`);
    await tapText("가림판 세우기");
    await W(page, 500);
    await atLab(id, 3, "shield", true);
    ok(Number(await dsU3("u3Warm")) === 0, `${id}: 가림판을 세웠는데 열을 받음`);
    await tapText("다음 실험: 유리 상자");
    await W(page, 600);
    await atLab(id, 3, "predict", true);
    await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-choice")?.click());
    await W(page, 1500);
    await atLab(id, 3, "box", true);
    await holdBtn(".u3x-hold", async () => (await dsU3("u3Air")) === "0.00");
    await W(page, 400);
    await atLab(id, 3, "empty", true);
    await judge(id, 3, true);
    await conclude(id, 3);
  },
  u3l4: async (id) => {
    await opener(id, "바닷물", async () => {
      await holdAt(150, 118, 900);
      await W(page, 400);
      await atOpn(id, "mid", true);
      await holdAt(150, 118, 2500);
    });
    await isLab(id, 1, "같은 불에 어느 쪽이 빨리 뜨거워질까?");
    await atLab(id, 1, "predict", true);
    await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-choice")?.click());
    await W(page, 1500);
    await atLab(id, 1, "mount", true);
    // 식용유를 절반만 담는다(공정하지 않은 실험)
    await tapText("식용유 100 g");
    await W(page, 300);
    await holdBtn(".u3x-hold", async () => (await dsU3("u3Oil")) === "0", 8000);
    ok((await dsU3("u3Oil")) === "0", `${id}: 공정하지 않은 실험이 되돌려지지 않음`);
    await atLab(id, 1, "unfair", true);
    await tapText("식용유 200 g");
    await W(page, 300);
    const box = await page.locator(".screen.active .u3x-hold").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await W(page, 1300);
    await atLab(id, 1, "heating", true);
    await page.mouse.up();
    await W(page, 300);
    await holdBtn(".u3x-hold", async () => (await phase()) === "water");
    ok((await phase()) === "water", `${id}: 식용유가 60℃에 닿지 않음`);
    await W(page, 1200);
    await atLab(id, 1, "oil", true);
    await holdBtn(".u3x-hold", async () => (await phase()) === "ask");
    await W(page, 500);
    await atLab(id, 1, "water", true);
    await judge(id, 1, true);
    await conclude(id, 1);
  },
  u3l5: async (id) => {
    await opener(id, "팽팽", async () => {
      await page.evaluate(() => [...document.querySelectorAll(".screen.active .opn-u3-btn")].find((b) => b.textContent.includes("여름"))?.click());
      await W(page, 1500);
      await atOpn(id, "mid", true);
      await page.evaluate(() => [...document.querySelectorAll(".screen.active .opn-u3-btn")].find((b) => b.textContent.includes("겨울"))?.click());
    });
    // 1 철로 놓기
    await isLab(id, 1, "한여름의 철로에는 무슨 일이 생길까?");
    await atLab(id, 1, "mount", true);
    await tapText("틈 없이 붙여 놓기");
    await W(page, 300);
    await setRange(page, ".u3x-range", 60, false);
    await W(page, 900);
    await atLab(id, 1, "buckled", true);
    ok((await dsU3("u3Rail")) === "tight:buckled", `${id}: 틈 없는 철로가 휘지 않음(${await dsU3("u3Rail")})`);
    await setRange(page, ".u3x-range", -10);
    await W(page, 700);
    await atLab(id, 1, "relay");
    await tapText("틈을 두고 놓기");
    await W(page, 300);
    await setRange(page, ".u3x-range", 60);
    await W(page, 900);
    await atLab(id, 1, "gap-summer", true);
    await judge(id, 1, true);
    await conclude(id, 1);
    // 2 두 띠
    await isLab(id, 2, "붙인 두 띠는 어느 쪽으로 휠까?");
    await atLab(id, 2, "predict", true);
    await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-choice")?.click());
    await W(page, 1500);
    await atLab(id, 2, "mount", true);
    const reached = async () => (await dsU3("u3Reached")) === "1";
    await holdBtn(".u3x-hold", reached);
    ok(await reached(), `${id}: 띠가 끝까지 휘지 않음`);
    await atLab(id, 2, "al-top", true);
    await tapText("띠 뒤집기 (종이를 위로)");
    await W(page, 500);
    await holdBtn(".u3x-hold", reached);
    await atLab(id, 2, "paper-top", true);
    await tapText("다리미 속 장치 보기");
    await W(page, 500);
    await atLab(id, 2, "iron", true);
    await tapText("전원 켜기");
    ok(await waitFor(page, () => document.querySelector(".screen.active .step")?.dataset.u3Cuts === "1", null, 80, 100), `${id}: 바이메탈이 전기를 끊지 않음`);
    await W(page, 300);
    await atLab(id, 2, "cut", true);
    await judge(id, 2, true);
    await conclude(id, 2);
  },
};

for (const [id, play] of Object.entries(LESSONS)) {
  if (ONLY.length && !ONLY.includes(id)) continue;
  console.log(id);
  await page.goto(`${BASE}/?u3v5&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const s = document.querySelector(".screen.active .step");
    return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
  }, null, { timeout: 20000 });
  await W(page, 500);
  try {
    await play(id);
    ok((await stepKind()) === "other", `${id}: 랩 뒤에 다음 스텝이 열리지 않음(${await stepKind()})`);
  } catch (e) {
    fail++;
    console.log(`  FAIL ${id}: ${e.message}`);
    await shot(`${id}-error`);
  }
}

// 토글을 끈 채: 단원의 첫 레슨이 지금 판(옛 훅)으로 열리는가
if (!ONLY.length) {
  await page.goto(`${BASE}/?u3v5=0&open=u3l1`, { waitUntil: "domcontentloaded" });
  await W(page, 1800);
  const k = await page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    return { opener: !!s?.classList.contains("opn-step"), hook: !!s?.querySelector(".hook-scene"), title: s?.querySelector(".h1")?.textContent ?? "" };
  });
  ok(!k.opener && k.hook, `토글 끔: 첫 레슨이 지금 판으로 열리지 않음 ${JSON.stringify(k)}`);
  await shot("off-u3l1");
}

// 화면 글 검사
const all = [...texts].join("\n");
const bad = [];
if (/[—–]/.test(all) || /[가-힣a-zA-Z0-9] - [가-힣a-zA-Z0-9]/.test(all)) bad.push("대시");
if (/교과서/.test(all)) bad.push("교과서");
if (/분자/.test(all)) bad.push("분자");
if (/\p{Extended_Pictographic}/u.test(all.replace(/[℃]/g, ""))) bad.push("이모지");
ok(bad.length === 0, `화면 글: ${bad.join(", ")}`);
ok(errors.length === 0, `페이지 오류: ${errors.slice(0, 5).join(" | ")}`);
console.log(`\n통과 ${pass} · 실패 ${fail} · 글 ${texts.size}토막`);
await browser.close();
process.exit(fail ? 1 : 0);
