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
const only = args.filter((a) => /^u5ld$/.test(a));
const skipIntro = args.includes("--lab");
mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("  FAIL " + msg); } };
const { browser, page, errors } = await launch();
const seen = [];
let cur = "";
const at = async (mark, shot = true) => {
  const m = await fit(page);
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

