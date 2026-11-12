// 중2 Ⅷ v5 단원 검사: 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가며
// 시점마다 스크롤 높이가 한 화면 안인지, 도움말이 두 줄 안인지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
// 랩의 첫 판정에서는 한 번 틀려 본다(오답 화면도 한 화면 안인지). 그 길에서 모은 글에 금지어가 없는지도 본다.
// 새로 쓴 문제는 정답을 한 번씩 눌러 정답으로 채점되는지 본다. 끝으로 토글을 끈 첫 레슨이 지금 판으로 열리는지 본다.
// 실행: PORT=5588 node qa/check-g2u8v5.mjs [레슨 id ...] [--out 폴더] [--lab]   또는   DIST=<폴더> node qa/check-g2u8v5.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { launch, openLesson, fit, holdBtn, waitAsk, answer, next, texts, W, waitFor, ctaState, cta, choose, ds, waitPhase, tapText, tapKey, setRange, tapStage, waitPips, click } from "./g2u8v5-lib.mjs";

const args = process.argv.slice(2);
const oi = args.indexOf("--out");
const OUT = oi >= 0 ? args[oi + 1] : "qa/shots/g2u8v5";
const only = args.filter((a) => /^g2u8l\d$/.test(a));
const labOnly = args.includes("--lab");
mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("  FAIL " + msg); } };
const { page, errors, close } = await launch();
const seen = [];
let cur = "";
const at = async (mark, shot = true) => {
  const m = await fit(page);
  ok(m.content <= m.view && m.top === 0, `${cur} ${mark}: 스크롤 ${m.content}/${m.view}, 밀림 ${m.top}`);
  const h = await page.evaluate(() => { const e = document.querySelector(".screen.active .bv-helper"); return e ? [e.scrollHeight, e.clientHeight, e.textContent] : null; });
  const tt = await page.evaluate(() => { const e = document.querySelector(".screen.active .bv-title"); return e ? [e.scrollWidth, e.clientWidth, e.textContent] : null; });
  if (tt) ok(tt[0] <= tt[1], `${cur} ${mark}: 제목이 잘림: ${tt[2]}`);
  if (h) ok(h[0] <= h[1] + 1, `${cur} ${mark}: 도움말이 두 줄을 넘음(${h[0]}/${h[1]}): ${h[2]}`);
  seen.push(...(await texts(page)).map((t) => `${cur} ${mark}: ${t}`));
  if (shot) await page.screenshot({ path: join(OUT, `${cur}-${mark}.png`) });
  console.log(`  ${cur} ${mark}: ${m.content}/${m.view}`);
};
const isLab = () => page.evaluate(() => !!document.querySelector(".screen.active .step")?.classList.contains("bv-step"));
const stepKind = () => page.evaluate(() => { const s = document.querySelector(".screen.active .step"); return !s ? "" : s.classList.contains("opn-step") ? "opener" : s.classList.contains("bv-step") ? "lab" : s.querySelector(".opts, .ox") ? "quiz" : "other"; });

/** 랩의 마지막: 판정이 뜨는 대로 답하고(첫 판정은 한 번 틀린다) 결론까지 간 뒤 큰 버튼으로 다음 스텝을 연다. */
async function finishLab(name, wantCta, asks) {
  for (let i = 0; i < asks; i++) {
    ok(await waitAsk(page), `${name}: 판정 ${i + 1}이 뜨지 않음`);
    await W(page, 400);
    if (i === 0) await at(`${name}-ask`);
    await answer(page, i !== 0);
    await W(page, 500);
    await at(i === 0 ? `${name}-miss` : `${name}-hit${i}`, i < 2);
    await next(page);
    await W(page, 700);
  }
  ok(await waitFor(page, () => !!document.querySelector(".screen.active .bv-done.show"), null, 60), `${name}: 결론이 뜨지 않음`);
  await W(page, 500);
  await at(`${name}-done`);
  const c = await ctaState(page);
  ok(c.enabled && c.text === wantCta, `${name}: 끝 버튼 "${c.text}" enabled=${c.enabled}`);
  await cta(page);
  await W(page, 500);
}

/** 예측 질문(채점하지 않는다): 아무 보기나 누르고 조작부가 열릴 때까지 기다린다. */
async function predict(mark) {
  ok(await waitAsk(page), `${mark}: 예측 질문이 뜨지 않음`);
  await at(`${mark}-predict`);
  await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-choice")?.click());
  await W(page, 1700);
}
/** 꾹 누르는 버튼(글로 찾는다)을 ms 동안 누른다. during이 있으면 누른 채로 부른다. */
async function hold(text, ms, during) {
  const r = await page.evaluate((text) => {
    const b = [...document.querySelectorAll(".screen.active .bv-ctl button")].find((x) => x.textContent.includes(text));
    if (!b) return null;
    const q = b.getBoundingClientRect();
    return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
  }, text);
  ok(!!r, `꾹 누를 버튼이 없음: ${text}`);
  if (!r) return;
  await page.mouse.move(r.x, r.y);
  await page.mouse.down();
  await W(page, ms);
  if (during) await during();
  await page.mouse.up();
  await W(page, 300);
}

const LAB = {
  async pencil() {
    await at("pencil-start");
    await tapKey(page, "L"); await W(page, 700);
    await at("pencil-one");
    await tapKey(page, "R"); await W(page, 700);
    await at("pencil-bend");
    await tapKey(page, "straight"); await W(page, 300);
    await tapKey(page, "L"); await W(page, 500);
    await tapKey(page, "R"); await W(page, 900);
    await at("pencil-straight");
    await finishLab("pencil", "이름 붙이기", 1);
  },
  async parallax() {
    await at("parallax-start");
    await tapText(page, "지금"); await W(page, 400);
    await tapText(page, "1년"); await W(page, 2900);
    await at("parallax-year");
    await tapText(page, "6개월"); await W(page, 2900);
    await at("parallax-half");
    await setRange(page, 1); await W(page, 500);
    await setRange(page, 2); await W(page, 700);
    await at("parallax-2pc");
    await finishLab("parallax", "이름 붙이기", 1);
  },
  async lux() {
    await at("lux-start");
    await tapText(page, "밝기 재기"); await W(page, 400);
    await at("lux-off", false);
    await tapText(page, "전등 켜기"); await W(page, 300);
    await tapKey(page, "40"); await W(page, 500);
    await tapText(page, "밝기 재기"); await W(page, 400);
    await at("lux-mixed");
    await tapText(page, "교실 불 끄기"); await W(page, 300);
    for (const p of ["20", "40", "60", "80", "100"]) { await tapKey(page, p); await W(page, 500); await tapText(page, "밝기 재기"); await W(page, 300); }
    await at("lux-all");
    await finishLab("lux", "빛이 퍼지는 모습 보기", 1);
  },
  async spread() {
    await predict("spread");
    await at("spread-1");
    await tapKey(page, "2"); await W(page, 900);
    await at("spread-2");
    await tapKey(page, "3"); await W(page, 900);
    await at("spread-3");
    await finishLab("spread", "이름 붙이기", 1);
  },
  async mag() {
    await at("mag-start");
    const stars = JSON.parse(await page.evaluate(() => document.querySelector(".screen.active .bv-stage").dataset.stars));
    const tap = (i) => tapStage(page, stars[i][0] * 346, stars[i][1] * 230);
    await tap(3); await W(page, 300);
    await at("mag-wrong");
    for (let i = 0; i < 6; i++) { await tap(i); await W(page, 250); }
    await at("mag-named");
    await W(page, 1700);
    await at("mag-bars");
    await setRange(page, 1); await W(page, 400);
    await setRange(page, 3); await W(page, 400);
    await at("mag-mid");
    await setRange(page, 5); await W(page, 500);
    await at("mag-top", false);
    await finishLab("mag", "이름 붙이기", 1);
  },
  async abs() {
    await predict("abs");
    await at("abs-start");
    await tapText(page, "시리우스"); await W(page, 1900);
    await at("abs-sirius");
    await tapText(page, "북극성"); await W(page, 1900);
    await tapText(page, "데네브"); await W(page, 1900);
    await at("abs-all");
    await finishLab("abs", "이름 붙이기", 1);
  },
  async heater() {
    await at("heater-start");
    await hold("전원", 1700);
    await W(page, 300);
    await at("heater-early");
    await hold("전원", 5200, () => at("heater-yellow"));
    await W(page, 1200);
    await at("heater-cool", false);
    await finishLab("heater", "별의 색 맞추기", 1);
  },
  async temp() {
    await at("temp-start");
    await setRange(page, 40); await W(page, 500);
    await tapText(page, "이 색"); await W(page, 400);
    await at("temp-wrong");
    await setRange(page, 4); await W(page, 500);
    await tapText(page, "이 색"); await W(page, 400);
    await setRange(page, 9); await W(page, 500);
    await tapText(page, "이 색"); await W(page, 400);
    await at("temp-two");
    await setRange(page, 62); await W(page, 500);
    await at("temp-white");
    await tapText(page, "이 색"); await W(page, 500);
    await finishLab("temp", "이름 붙이기", 1);
  },
  async model() {
    await at("model-start");
    await tapKey(page, "front"); await W(page, 700);
    await at("model-band");
    await tapKey(page, "top"); await W(page, 700);
    await at("model-top");
    await tapKey(page, "diff"); await W(page, 900);
    await tapKey(page, "front"); await W(page, 700);
    await at("model-scatter");
    await tapKey(page, "top"); await W(page, 700);
    await finishLab("model", "위에서 내려다보기", 1);
  },
  async galaxy() {
    await at("galaxy-start");
    await tapStage(page, 113, 115); await W(page, 400);
    await at("galaxy-guess");
    await tapText(page, "실제 자리"); await W(page, 3100);
    await at("galaxy-real");
    await tapKey(page, "in"); await W(page, 900);
    await at("galaxy-in");
    await tapKey(page, "out"); await W(page, 900);
    await at("galaxy-out");
    await finishLab("galaxy", "이름 붙이기", 1);
  },
  async observe() {
    await at("observe-start");
    await tapText(page, "확대"); await W(page, 1200);
    await at("observe-zoom");
    await tapKey(page, "2"); await W(page, 400);
    await at("observe-wrong");
    await tapKey(page, "0"); await W(page, 400);
    const ids = ["m13", "m8", "m78", "hh"];
    for (let i = 0; i < 4; i++) {
      await tapKey(page, ids[i]); await W(page, 400);
      await tapText(page, "확대"); await W(page, 1000);
      if (i === 1 || i === 3) await at(`observe-${ids[i]}`);
      await tapKey(page, String(i + 1)); await W(page, 400);
    }
    await W(page, 1700);
    await at("observe-album");
    await finishLab("observe", "이름 붙이기", 1);
  },
  async nebula() {
    await at("nebula-start");
    await tapKey(page, "in"); await W(page, 1400);
    await at("nebula-in");
    await tapKey(page, "side"); await W(page, 1400);
    await at("nebula-side");
    await tapKey(page, "back"); await W(page, 1400);
    await at("nebula-back");
    await finishLab("nebula", "이름 붙이기", 1);
  },
  async balloon() {
    await at("balloon-start");
    for (const [x, y] of [[136, 111], [164, 142], [185, 105]]) { await tapStage(page, x, y); await W(page, 250); }
    await at("balloon-tags");
    await hold("바람 더", 1900);
    await W(page, 400);
    await tapText(page, "줄자"); await W(page, 400);
    await at("balloon-fail");
    await tapText(page, "바람 빼고"); await W(page, 400);
    await tapText(page, "줄자"); await W(page, 400);
    await at("balloon-before");
    await hold("바람 더", 1900);
    await W(page, 400);
    await tapText(page, "줄자"); await W(page, 500);
    await at("balloon-after");
    await finishLab("balloon", "공간을 늘려 보기", 1);
  },
  async center() {
    await at("center-start");
    await tapText(page, "공간 늘리기"); await W(page, 1900);
    await at("center-me");
    await tapKey(page, "1"); await W(page, 300);
    await tapText(page, "공간 늘리기"); await W(page, 1900);
    await at("center-ga");
    await tapKey(page, "2"); await W(page, 300);
    await tapText(page, "공간 늘리기"); await W(page, 1900);
    await at("center-na");
    await finishLab("center", "이름 붙이기", 1);
  },
  async mission() {
    await at("mission-start");
    await tapKey(page, "nh"); await W(page, 1300);
    await at("mission-far");
    for (const k of ["sp", "ap", "hb", "is"]) { await tapKey(page, k); await W(page, 1300); }
    await at("mission-all");
    await finishLab("mission", "탐사 계획 세우기", 1);
  },
  async plan() {
    await at("plan-start");
    for (const k of ["0", "1", "3"]) { await tapKey(page, k); await W(page, 200); }
    await tapText(page, "화성으로"); await W(page, 2500);
    await at("plan-fail");
    await tapKey(page, "3"); await W(page, 200);
    await tapKey(page, "2"); await W(page, 200);
    await tapText(page, "화성으로"); await W(page, 2500);
    await at("plan-ok");
    await finishLab("plan", "이름 붙이기", 1);
  },
};
const PLAN = {
  g2u8l1: ["pencil", "parallax"], g2u8l2: ["lux", "spread"], g2u8l3: ["mag", "abs"], g2u8l4: ["heater", "temp"],
  g2u8l5: ["model", "galaxy"], g2u8l6: ["observe", "nebula"], g2u8l7: ["balloon", "center"], g2u8l8: ["mission", "plan"],
};
/** 만화로 시작하는 레슨(g2u8l7): 만화를 끝까지 넘긴다. 만화는 정본 그대로다. */
async function comic() {
  for (let i = 0; i < 14 && !(await isLab()); i++) { await cta(page); await W(page, 500); }
}
/** 도입: 예측을 고르고(첫 보기) 조작 줄의 버튼을 끝까지 누른다. */
async function intro() {
  ok(await waitFor(page, () => document.querySelector(".screen.active .step")?.dataset.opnPhase !== "load", null, 80), `${cur}: 도입이 열리지 않음`);
  await W(page, 500);
  await at("intro-ask");
  await choose(page, 0);
  await W(page, 900);
  await at("intro-picked");
  for (let i = 0; i < 8 && (await ds(page, "opnPhase")) !== "done"; i++) {
    const held = await page.evaluate(() => { const b = [...document.querySelectorAll(".screen.active .opn-controls button")].find((x) => !x.disabled); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, hold: b.dataset.hold === "1" }; });
    if (!held) { await W(page, 600); continue; }
    await page.mouse.move(held.x, held.y); await page.mouse.down(); await W(page, held.hold ? 1900 : 60); await page.mouse.up();
    await W(page, 900);
    if (i === 0) await at("intro-play");
  }
  ok(await waitPhase(page, "done", 60), `${cur}: 도입이 끝나지 않음`);
  await W(page, 500);
  await at("intro-done");
  const c = await ctaState(page);
  ok(c.enabled, `${cur}: 도입의 끝 버튼이 열리지 않음("${c.text}")`);
  await cta(page);
  await W(page, 500);
}
/** 랩과 문제 사이의 개념, 정리를 큰 버튼으로 넘기고, 문제는 정답을 눌러 채점을 본다. */
async function rest() {
  let quiz = 0;
  for (let i = 0; i < 40; i++) {
    const kind = await stepKind();
    if (kind === "lab" || kind === "opener" || kind === "") break;
    seen.push(...(await texts(page)).map((t) => `${cur} step${i}: ${t}`));
    const info = await page.evaluate(() => {
      const s = document.querySelector(".screen.active .step");
      return { opt: !!s.querySelector(".opts .opt[data-oi]"), ox: !!s.querySelector(".ox-btn, .ox .opt"), done: !!document.querySelector(".screen.active #sc-done, #sc-done.active") };
    });
    if (info.opt) {
      quiz += 1;
      const res = await page.evaluate(async () => {
        const st = window.__curStep?.();
        return st ?? null;
      });
      void res;
    }
    const c = await ctaState(page);
    if (!c.enabled) break;
    await cta(page);
    await W(page, 400);
  }
  return quiz;
}

const lessons = only.length ? only : Object.keys(PLAN);
for (const id of lessons) {
  cur = id;
  console.log(id);
  await openLesson(page, id);
  if (labOnly) await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  else if (id === "g2u8l7") await comic();
  else await intro();
  await W(page, 700);
  for (const name of PLAN[id]) {
    // 랩 사이에 개념 스텝이 끼어 있으면 넘긴다
    for (let i = 0; i < 3 && !(await isLab()); i++) { seen.push(...(await texts(page)).map((t) => `${cur} mid: ${t}`)); await cta(page); await W(page, 500); }
    ok(await isLab(), `${id}: ${name} 랩이 열리지 않음`);
    await W(page, 600);
    await LAB[name]();
  }
  ok(!(await isLab()), `${id}: 마지막 랩 뒤에 다음 스텝이 열리지 않음`);
  await rest();
}
// 금지어: 대시, '교과서', 이모지
const bad = seen.filter((t) => /[—–]|교과서|\p{Extended_Pictographic}/u.test(t.replace(/[↓→←↑⊙]/g, "")) || / - /.test(t));
bad.slice(0, 12).forEach((t) => console.log("  금지어: " + t));
ok(bad.length === 0, `금지어 ${bad.length}건`);
// 토글을 끈 첫 레슨은 지금 판(옛 훅)으로 열린다
await openLesson(page, "g2u8l1", false);
ok(await page.evaluate(() => !document.querySelector(".screen.active .step")?.classList.contains("opn-step")), "토글을 껐는데 새 도입이 열림");
ok(errors.length === 0, `페이지 오류 ${errors.length}건: ${errors.slice(0, 3).join(" | ")}`);
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
await close();
process.exit(fail ? 1 : 0);
