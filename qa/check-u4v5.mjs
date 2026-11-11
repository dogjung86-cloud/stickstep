// 중1 Ⅳ v5(랩과 도입)의 간소 검사: 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가 본다.
//   시점마다(처음, 조작 중, 판정, 오답, 결론) 스크롤 높이가 한 화면(554px) 안인지, 화면이 밀리지 않았는지,
//   누르는 곳이 48px 이상인지, 잘린 글과 작은 글자가 없는지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
//   랩의 첫 판정에서는 한 번 틀려 본다(틀림 표시, 정답 카드, '다음'). 그 길에서 모은 화면 글에 대시, '교과서', 이모지, '분자'가 없는지도 본다.
//   끝으로 토글을 끈 채 첫 레슨이 지금 화면(훅)으로 열리는지 본다.
// 실행: DIST=<개발 모드 번들 폴더> node qa/check-u4v5.mjs [캡처 폴더]   (번들 만드는 법은 qa/u4v5-lib.mjs 머리말)
//       PORT=5574 node qa/check-u4v5.mjs                                  (개발 서버가 떠 있을 때)
//       ONLY=u4l2 를 붙이면 그 레슨만 돈다.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as L from "./u4v5-lib.mjs";

const OUT = process.argv[2] ?? "qa/shots/u4v5";
mkdirSync(OUT, { recursive: true });
const ONLY = process.env.ONLY || "";
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL " + msg); } };
const { browser, page, errors } = await L.launch();
const W = (ms) => L.W(page, ms);
let texts = [];

async function at(id, mark, shot = true) {
  const m = await L.measure(page);
  ok(m.content <= m.view && m.scrollTop === 0, `${id} ${mark}: 스크롤 ${m.content}/${m.view}, 밀림 ${m.scrollTop}`);
  ok(m.taps.every((t) => t.h >= 47.5), `${id} ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 47.5).map((t) => t.t + ":" + t.h).join(", ")}`);
  ok(m.cut.length === 0, `${id} ${mark}: 잘린 글 ${m.cut.join(" | ")}`);
  ok(m.small.length === 0, `${id} ${mark}: 작은 글자 ${m.small.map((s) => s.t + ":" + s.px).join(", ")}`);
  ok(!m.helperOver, `${id} ${mark}: 도움말이 두 줄을 넘음`);
  texts.push(m.text);
  if (shot) await page.screenshot({ path: join(OUT, `${id}-${mark}.png`) });
  console.log(`  ${id} ${mark}: ${m.content}/${m.view}`);
}

/** 판정에서 한 번 틀려 보고(틀림 표시와 정답 카드를 확인) '다음'으로 넘어간다. */
async function wrongOnce(id, mark) {
  ok(await L.waitAsk(page), `${id} ${mark}: 판정이 뜨지 않음`);
  await W(350);
  await at(id, mark + "-ask");
  const t = await L.pickWrong(page);
  ok(!!t, `${id} ${mark}: 틀린 보기를 찾지 못함(정답 표식이 없는 번들인가)`);
  await W(450);
  const v = await L.verdict(page);
  ok(v && v.cls === "miss" && v.word === "오답이에요" && v.ans && v.next, `${id} ${mark}: 오답 표시가 다름 ${JSON.stringify(v)}`);
  await at(id, mark + "-wrong");
  await W(1300);
  ok((await L.verdict(page))?.cls === "miss", `${id} ${mark}: '다음'을 누르기 전에 넘어감`);
  await L.tapNext(page);
  await W(500);
}
async function rightOnce(id, mark) {
  ok(await L.waitAsk(page), `${id} ${mark}: 판정이 뜨지 않음`);
  await W(300);
  await L.pickRightOnly(page);
  await W(400);
  const v = await L.verdict(page);
  ok(v && v.cls === "ok" && v.word === "정답이에요" && v.next, `${id} ${mark}: 정답 표시가 다름 ${JSON.stringify(v)}`);
  await at(id, mark + "-right", false);
  await L.tapNext(page);
  await W(500);
}
async function endLab(id, mark, wantCta) {
  ok(await L.waitDone(page), `${id} ${mark}: 결론이 뜨지 않음`);
  await W(500);
  await at(id, mark + "-done");
  const c = await L.ctaState(page);
  ok(c.enabled && (!wantCta || c.text === wantCta), `${id} ${mark}: 끝 버튼 "${c.text}" enabled=${c.enabled}`);
  const before = await L.stepKind(page);
  await L.cta(page);
  await W(500);
  const after = await L.stepKind(page);
  ok(after !== before && after !== "", `${id} ${mark}: 다음 스텝이 열리지 않음(${before} → ${after})`);
}
async function endOpener(id, wantCta) {
  ok(await L.waitPhase(page, "done"), `${id} 도입: 끝에 닿지 못함(${await L.ds(page, "opnPhase")})`);
  await W(1300);
  await at(id, "intro-done");
  const c = await L.ctaState(page);
  ok(c.enabled && c.text === wantCta, `${id} 도입: 끝 버튼 "${c.text}" enabled=${c.enabled}`);
  await L.cta(page);
  await W(500);
  ok((await L.stepKind(page)).startsWith("u4lab"), `${id} 도입: 다음이 새 랩이 아님(${await L.stepKind(page)})`);
}
async function predict(id, mark, word) {
  ok(await L.waitAsk(page), `${id} ${mark}: 예측이 뜨지 않음`);
  await W(300);
  await at(id, mark + "-start");
  ok(!!(await L.pickText(page, word)), `${id} ${mark}: 예측 보기 "${word}"가 없음`);
  await W(900);
}

const PLAYS = {
  u4l1: async (id) => {
    ok((await L.stepKind(page)) === "opener:u4-lid", `${id}: 새 도입이 아님(${await L.stepKind(page)})`);
    await at(id, "intro-ask");
    await L.choose(page, "동시에");
    await W(500);
    await at(id, "intro-picked");
    await L.hold(page, ".opn-u4-btn", 1500);
    await W(200);
    await at(id, "intro-mid");
    await L.hold(page, ".opn-u4-btn", 2000);
    await endOpener(id, "실험실 열기");
    // 확산 랩
    await predict(id, "ink", "바닥에만");
    await L.click(page, ".u4x-ink-add");
    ok(await L.waitVisible(page, ".u4x-ink-ta"), `${id} ink: 시간 막대가 뜨지 않음`);
    await L.sweep(page, ".u4x-ink-ta", 0, 55, 6);
    await at(id, "ink-mid");
    await L.setRange(page, ".u4x-ink-ta", 20); // 되돌려 본다(되돌아가지 않아야 한다)
    ok(Number(await L.ds(page, "u4Ink")) >= 0.5, `${id} ink: 시간 막대가 되돌아감`);
    await L.sweep(page, ".u4x-ink-ta", 55, 100, 5);
    ok(await L.waitVisible(page, ".u4x-ink-next"), `${id} ink: 다음 실험 버튼이 뜨지 않음`);
    await at(id, "ink-a-end");
    await L.click(page, ".u4x-ink-next");
    await W(300);
    await L.click(page, ".u4x-ink-vinbtn");
    ok(await L.waitVisible(page, ".u4x-ink-tb"), `${id} ink: 두 번째 시간 막대가 뜨지 않음`);
    await L.sweep(page, ".u4x-ink-tb", 0, 50, 5);
    await at(id, "ink-dish-mid");
    await L.sweep(page, ".u4x-ink-tb", 50, 100, 5);
    await wrongOnce(id, "ink");
    await endLab(id, "ink", "다음 실험, 증발");
    // 증발 랩
    await predict(id, "evap", "그대로");
    await L.click(page, '.u4x-evap-card[data-k="lump"]');
    await W(300);
    await at(id, "evap-ready");
    await L.hold(page, ".u4x-hold", 1500);
    await at(id, "evap-mid");
    await L.hold(page, ".u4x-hold", 2200);
    ok(await L.waitVisible(page, '.u4x-evap-card[data-k="spread"]'), `${id} evap: 두 번째 고르기가 뜨지 않음`);
    await at(id, "evap-second");
    await L.click(page, '.u4x-evap-card[data-k="spread"]');
    await W(300);
    await L.hold(page, ".u4x-hold", 3600);
    await wrongOnce(id, "evap");
    await endLab(id, "evap", "개념 정리하기");
  },
};

for (const [id, play] of Object.entries(PLAYS)) {
  if (ONLY && ONLY !== id) continue;
  console.log(id);
  texts = [];
  await L.openLesson(page, id);
  await play(id);
  const all = texts.join("\n");
  ok(!/[—–]|\s-\s/.test(all), `${id}: 화면 글에 대시가 있음`);
  ok(!/교과서|분자/.test(all), `${id}: 화면 글에 금지 낱말(교과서, 분자)이 있음`);
  ok(!/\p{Extended_Pictographic}/u.test(all.replace(/[℃→←↔]/g, "")), `${id}: 화면 글에 이모지가 있음`);
}
if (!ONLY) {
  // 토글을 끄면 지금 운영 화면(정본 훅)이어야 한다
  await L.openLesson(page, "u4l1", false);
  ok((await L.stepKind(page)) === "hook", `토글을 껐는데 정본 훅이 아님(${await L.stepKind(page)})`);
}
ok(errors.length === 0, `페이지 오류 ${errors.length}건: ${errors.slice(0, 3).join(" / ")}`);
await browser.close();
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
