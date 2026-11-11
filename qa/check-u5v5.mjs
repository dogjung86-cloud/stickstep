// 중1 Ⅴ v5 단원 검사: 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가며
// 시점마다 스크롤 높이가 한 화면 안인지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
// 랩의 판정에서는 한 번 틀려 본다(오답 화면도 한 화면 안인지). 그 길에서 모은 글에 금지어가 없는지도 본다.
// 실행: PORT=5575 node qa/check-u5v5.mjs [레슨 id ...] [--out 폴더]   (개발 서버 필요)
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { launch, openLesson, fwd, fit, stageAt, drag, holdBtn, click, waitAsk, answer, next, texts, W, waitFor, ctaState, cta, stepType, choose, ds, waitPhase } from "./u5v5-lib.mjs";

const args = process.argv.slice(2);
const oi = args.indexOf("--out");
const OUT = oi >= 0 ? args[oi + 1] : "qa/shots/u5v5";
const only = args.filter((a) => /^u5l\d$/.test(a));
const skipIntro = args.includes("--lab");
mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("  FAIL " + msg); } };
const { browser, page, errors } = await launch();
const seen = [];
let cur = "";
const at = async (mark, shot = true) => {
  const m = await fit(page);
  // 결론 뒤에 붙는 궁금증 카드(펼쳐 읽는 덤)는 한 화면 예산 밖이다
  m.content -= await page.evaluate(() => { const c = document.querySelector(".screen.active .step > .curio, .screen.active .step > [class*='curio']"); if (!c) return 0; const cs = getComputedStyle(c); return c.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); });
  ok(m.content <= m.view && m.top === 0, `${cur} ${mark}: 스크롤 ${m.content}/${m.view}, 밀림 ${m.top}`);
  seen.push(...(await texts(page)).map((t) => `${cur} ${mark}: ${t}`));
  if (shot) await page.screenshot({ path: join(OUT, `${cur}-${mark}.png`) });
  console.log(`  ${cur} ${mark}: ${m.content}/${m.view}`);
};
const pips = () => page.evaluate(() => document.querySelectorAll(".screen.active .bv-pips i.on").length);
const waitPips = (n, tries = 100) => waitFor(page, (n) => document.querySelectorAll(".screen.active .bv-pips i.on").length >= n, n, tries);

/** 랩의 마지막: 판정에서 한 번 틀리고(wrong) 결론까지 간 뒤 큰 버튼으로 다음 스텝을 연다. */
async function judge(wrong, wantCta = "개념 정리하기") {
  ok(await waitAsk(page), `${cur}: 판정이 뜨지 않음`);
  await W(page, 400);
  await at("ask");
  await answer(page, !wrong);
  await W(page, 500);
  await at(wrong ? "miss" : "hit");
  await next(page);
  await W(page, 700);
}
async function endLab(wantCta = "개념 정리하기") {
  ok(await waitFor(page, () => !!document.querySelector(".screen.active .bv-done.show"), null, 60), `${cur}: 결론이 뜨지 않음`);
  await W(page, 500);
  await at("done");
  const c = await ctaState(page);
  ok(c.enabled && c.text === wantCta, `${cur}: 끝 버튼 "${c.text}" enabled=${c.enabled}`);
  await cta(page);
  ok(!(await page.evaluate(() => document.querySelector(".screen.active .step")?.classList.contains("bv-step"))), `${cur}: 다음 스텝이 열리지 않음`);
}

const LABS = {
  u5l1: async () => {
    await at("start");
    const ball = async (dx) => {
      const a = await stageAt(page, dx > 0 ? 70 : 0, 173);
      const from = dx > 0 ? a : { x: a.x + a.w - 70, y: a.y };
      await drag(page, from, { x: from.x + dx, y: from.y });
    };
    await ball(30);
    ok(await waitPips(1), "u5l1: 살살 밀기");
    await ball(110);
    await W(page, 300);
    await at("mid");
    ok(await waitPips(2), "u5l1: 세게 밀기");
    await ball(-80);
    ok(await waitPips(3), "u5l1: 반대쪽");
    const c = await stageAt(page, 0.5, 120);
    await drag(page, c, { x: c.x, y: c.y + 50 });
    await W(page, 400);
    await at("clay");
    await judge(true);
    await endLab();
  },
};
LABS.u5l2 = async () => {
  await at("start");
  await click(page, '.u5x-tug-b[data-k="L+"]');
  await click(page, '.u5x-tug-b[data-k="R+"]');
  await click(page, '.u5x-tug-b[data-k="R+"]');
  await W(page, 600);
  await at("mid");
  ok(await waitPips(1), "u5l2: 오른쪽 승리");
  await W(page, 300);
  await click(page, '.u5x-tug-b[data-k="L+"]');
  await W(page, 800);
  await at("bal");
  ok(await waitPips(2), "u5l2: 평형");
  await judge(true);
  await W(page, 800);
  await at("confirm");
  await endLab();
};
LABS.u5l3 = async () => {
  await at("predict");
  await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-choice")?.click());
  await W(page, 1500);
  await at("start");
  for (const [fx, fy, n] of [[0.5, 0.15, 1], [0.85, 0.55, 2], [0.5, 0.93, 3]]) {
    const p = await stageAt(page, fx, fy);
    await page.mouse.click(p.x, p.y);
    if (n === 2) { await W(page, 500); await at("fall"); }
    ok(await waitPips(n), "u5l3: 사과 " + n);
  }
  await W(page, 2600);
  await at("scale");
  await click(page, '.bv-card[data-k="moon"]');
  await W(page, 1200);
  await at("moon");
  await judge(true);
  await endLab();
};
LABS.u5l4 = async () => {
  await at("start");
  const a = await stageAt(page, 28 + 74 + 12, 104);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (const [cm, n] of [[4, 1], [8, 2], [12, 3]]) {
    for (let i = 0; i < 8; i++) { await page.mouse.move(a.x + (cm - 4 + (i + 1) / 2) * 13, a.y); await W(page, 20); }
    ok(await waitPips(n), "u5l4: " + cm + " cm");
    if (n === 2) await at("mid");
  }
  await page.mouse.up();
  await W(page, 400);
  await at("line");
  await judge(true);
  await endLab();
};
LABS.u5l5 = async () => {
  await at("start");
  await holdBtn(page, ".u5x-push", 250);
  await W(page, 300);
  await at("short");
  await holdBtn(page, ".u5x-push", 900);
  ok(await waitPips(1), "u5l5: 얼음판");
  await W(page, 1700);
  await click(page, '.bv-card[data-k="wood"]');
  await holdBtn(page, ".u5x-push", 1500);
  ok(await waitPips(2), "u5l5: 나무 바닥");
  await W(page, 1700);
  await click(page, '.bv-card[data-k="sand"]');
  await page.mouse.down();
  await W(page, 1000);
  await at("push");
  await W(page, 1200);
  await page.mouse.up();
  ok(await waitPips(3), "u5l5: 모래밭");
  await W(page, 1700);
  await click(page, '.u5x-seg[data-k="2"]');
  await holdBtn(page, ".u5x-push", 3600);
  await W(page, 300);
  await at("two");
  ok(await waitPips(4), "u5l5: 상자 2개");
  await judge(true);
  await endLab();
};
LABS.u5l6 = async () => {
  await at("start");
  ok(await waitPips(1), "u5l6: 잠기기 전");
  const a = await stageAt(page, 0.56, 82);
  const to = async (y, n) => {
    for (let i = 0; i < 10; i++) { await page.mouse.move(a.x, a.y + ((y - 104) * (i + 1)) / 10); await W(page, 16); }
    ok(await waitPips(n), "u5l6: 기록 " + n);
  };
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await to(148, 2);
  await at("half");
  await to(180, 3);
  await page.mouse.up();
  await W(page, 1400);
  await at("predict");
  await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-choice")?.click());
  await W(page, 1500);
  const b = await stageAt(page, 0.56, 158);
  await page.mouse.move(b.x, b.y);
  await page.mouse.down();
  for (let i = 0; i < 10; i++) { await page.mouse.move(b.x, b.y + 3 * (i + 1)); await W(page, 16); }
  ok(await waitPips(4), "u5l6: 더 깊이");
  await page.mouse.up();
  await at("deep");
  await judge(true);
  await endLab();
};
LABS.u5l7 = async () => {
  await W(page, 600);
  await at("start");
  await holdBtn(page, '.u5x-wind[data-k="back"]', 1300);
  ok(await waitPips(1), "u5l7: 뒤에서");
  await W(page, 1800);
  await holdBtn(page, '.u5x-wind[data-k="front"]', 1500);
  ok(await waitPips(2), "u5l7: 앞에서");
  await W(page, 1800);
  const r = await page.evaluate(() => { const q = document.querySelector('.screen.active .u5x-wind[data-k="side"]').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
  await page.mouse.move(r.x, r.y);
  await page.mouse.down();
  await W(page, 900);
  await at("side");
  await W(page, 500);
  await page.mouse.up();
  ok(await waitPips(3), "u5l7: 옆에서");
  await judge(true);
  await endLab();
};
const INTROS = {};

const ids = only.length ? only : ["u5l1", "u5l2", "u5l3", "u5l4", "u5l5", "u5l6", "u5l7"];
for (const id of ids) {
  console.log(id);
  cur = id;
  await openLesson(page, id);
  if (INTROS[id] && !skipIntro) {
    ok((await stepType(page)) === "opener", `${id}: 새 도입으로 열리지 않음`);
    cur = id + "i";
    await INTROS[id]();
    cur = id;
  } else await fwd(page);
  if (LABS[id]) {
    ok(await page.evaluate(() => !!document.querySelector(".screen.active .step.u5x-step")), `${id}: 새 랩으로 열리지 않음`);
    await LABS[id]();
  }
}
// 토글을 끄면 첫 레슨이 지금과 같이 열린다
if (!only.length) {
  await openLesson(page, "u5l1", false);
  ok((await stepType(page)) === "hook", "토글을 껐는데 정본 훅이 아님");
  await fwd(page);
  ok(await page.evaluate(() => !document.querySelector(".screen.active .step.u5x-step") && !!document.querySelector(".screen.active .step canvas")), "토글을 껐는데 정본 랩이 아님");
}
// 금지어: 대시, '교과서', '분자', 이모지
const bad = seen.filter((t) => /[—–]|교과서|분자|\p{Extended_Pictographic}/u.test(t.replace(/^[^:]+: /, "")));
ok(bad.length === 0, `금지어 ${bad.length}건: ${bad.slice(0, 5).join(" / ")}`);
ok(errors.length === 0, `페이지 오류 ${errors.length}건: ${errors.slice(0, 3).join(" / ")}`);
await browser.close();
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);

