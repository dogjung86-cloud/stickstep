// 중2 Ⅶ v5 단원 검사: 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가며
// 시점마다 스크롤 높이가 한 화면 안인지, 도움말이 두 줄 안인지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
// 랩의 첫 판정에서는 한 번 틀려 본다(오답 화면도 한 화면 안인지). 그 길에서 모은 글에 금지어가 없는지도 본다.
// 새로 쓴 문제는 정답을 한 번씩 눌러 정답으로 채점되는지 본다. 끝으로 토글을 끈 첫 레슨이 지금 판으로 열리는지 본다.
// 실행: PORT=5587 node qa/check-g2u7v5.mjs [레슨 id ...] [--out 폴더] [--lab]   또는   DIST=<폴더> node qa/check-g2u7v5.mjs
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { launch, openLesson, fit, holdBtn, waitAsk, answer, next, texts, W, waitFor, ctaState, cta, choose, ds, waitPhase, tapText, tapKey, setRange, tapStage, tapRot, waitPips, click } from "./g2u7v5-lib.mjs";

const args = process.argv.slice(2);
const oi = args.indexOf("--out");
const OUT = oi >= 0 ? args[oi + 1] : "qa/shots/g2u7v5";
const only = args.filter((a) => /^g2u7l\d$/.test(a));
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

const LAB = {
  async straw() {
    await at("straw-start");
    await tapKey(page, "fur"); await W(page, 1700);
    await at("straw-fail");
    await tapKey(page, "back"); await W(page, 1200);
    await tapKey(page, "rub"); await W(page, 1900);
    await tapKey(page, "fur"); await W(page, 1700);
    await at("straw-pull");
    await tapKey(page, "back"); await W(page, 1200);
    await tapKey(page, "blue"); await W(page, 1700);
    await at("straw-push");
    await tapKey(page, "back"); await W(page, 1300);
    await finishLab("straw", "빨대 속 들여다보기", 1);
  },
  async rub() {
    await at("rub-start");
    await tapText(page, "떼어 놓고"); await W(page, 400);
    await at("rub-fail", false);
    await tapText(page, "원자핵"); await W(page, 500);
    await at("rub-nucleus");
    for (let i = 0; i < 3; i++) { await tapText(page, "문지르기"); await W(page, 1400); }
    await at("rub-moved");
    await tapText(page, "떼어 놓고"); await W(page, 600);
    await at("rub-apart");
    await finishLab("rub", "이름 붙이기", 2);
  },
  async can() {
    await at("can-start");
    await setRange(page, 85); await W(page, 900);
    await at("can-plain");
    await tapKey(page, "neg"); await W(page, 300);
    await setRange(page, 100); await W(page, 1200);
    await at("can-touch");
    await W(page, 2400);
    await setRange(page, 85); await W(page, 1500);
    await at("can-near");
    await tapKey(page, "R"); await W(page, 300);
    await setRange(page, 85); await W(page, 1200);
    await at("can-other");
    await finishLab("can", "이름 붙이기", 2);
  },
  async wire() {
    await at("wire-start");
    await tapText(page, "전지 돌려"); await W(page, 500);
    await at("wire-fail", false);
    await tapText(page, "스위치 닫기"); await W(page, 1200);
    await at("wire-closed");
    await tapText(page, "전지 돌려"); await W(page, 1200);
    await at("wire-flip");
    await finishLab("wire", "물길과 견주기", 2);
  },
  async water() {
    await at("water-start");
    await tapText(page, "가로 화면"); await W(page, 1200);
    const hits = await page.evaluate(() => document.querySelector(".g2u7x-wcv").__hits());
    for (const k of Object.keys(hits)) {
      const [x, y, w, h] = hits[k][0];
      await tapRot(page, x + w / 2, y + h / 2 + (k === "gap" ? 10 : 0));
      await W(page, 250);
    }
    await page.evaluate(() => document.querySelector('.g2u7x-wbar [data-k="2"]').click()); await W(page, 700);
    await page.screenshot({ path: join(OUT, `${cur}-water-rot.png`) });
    seen.push(...(await page.evaluate(() => [...document.querySelectorAll(".rot-stage *")].map((e) => (e.children.length ? "" : e.textContent.trim())).filter(Boolean))).map((t) => `${cur} water-rot: ${t}`));
    await page.evaluate(() => document.querySelector(".g2u7x-wtap").click()); await W(page, 600);
    const done = await page.evaluate(() => document.querySelector(".g2u7x-wsay").dataset.done);
    ok(done === "1", `water: 가로 화면의 할 일이 끝나지 않음(${await page.evaluate(() => document.querySelector(".g2u7x-wsay").textContent)})`);
    await page.evaluate(() => document.querySelector(".rot-exit").click()); await W(page, 900);
    await finishLab("water", "이름 붙이기", 2);
  },
  async ohm() {
    await at("ohm-start");
    for (const v of [1, 2]) { await setRange(page, v); await W(page, 200); await tapText(page, "그래프에 찍기"); await W(page, 300); }
    await tapKey(page, "short"); await W(page, 400);
    await at("ohm-guard");
    await setRange(page, 4); await tapText(page, "그래프에 찍기"); await W(page, 500);
    await at("ohm-line");
    await setRange(page, 0); await W(page, 200);
    await tapKey(page, "short"); await W(page, 300);
    for (const v of [1, 2, 3]) { await setRange(page, v); await W(page, 200); await tapText(page, "그래프에 찍기"); await W(page, 300); }
    await at("ohm-both");
    await finishLab("ohm", "그래프에서 식 찾기", 2);
  },
  async formula() {
    await at("formula-start");
    const pt = (wire, i) => [46 + ((i * 1.5) / 6) * 150, 190 - ((i * 1.5) / (wire === "long" ? 30 : 15) * 1000 / 400) * 140];
    await tapStage(page, ...pt("long", 2)); await W(page, 300);
    await at("formula-one");
    await tapStage(page, ...pt("long", 4));
    await tapStage(page, ...pt("short", 1));
    await tapStage(page, ...pt("short", 3)); await W(page, 300);
    await at("formula-ratio");
    await tapText(page, "저항을 바꿔"); await W(page, 400);
    await at("formula-r");
    for (const r of [30, 15, 60]) { await tapKey(page, String(r)); await W(page, 400); }
    await at("formula-curve");
    await finishLab("formula", "이름 붙이기", 1);
  },
  async bulb() {
    await at("bulb-start");
    await tapKey(page, "series"); await W(page, 600);
    await at("bulb-series");
    await tapStage(page, 118, 70); await W(page, 700);
    await at("bulb-series-out");
    await tapKey(page, "parallel"); await W(page, 600);
    await tapStage(page, 173, 126); await W(page, 700);
    await at("bulb-parallel-out");
    await finishLab("bulb", "직렬의 전류부터 재기", 2);
  },
  async scur() {
    ok(await waitAsk(page), "scur: 예측 질문이 뜨지 않음");
    await W(page, 300);
    await at("scur-predict");
    await answer(page, false); await W(page, 1600);
    await at("scur-start");
    await tapStage(page, 302, 132); await W(page, 900);
    await at("scur-counting");
    await W(page, 1700);
    await tapStage(page, 173, 74); await W(page, 2600);
    await tapStage(page, 44, 132); await W(page, 2600);
    await at("scur-same");
    await tapText(page, "왼쪽 전구를"); await W(page, 700);
    await at("scur-swapped");
    for (const [x, y] of [[302, 132], [173, 74], [44, 132]]) { await tapStage(page, x, y); await W(page, 2600); }
    await at("scur-slow");
    await finishLab("scur", "직렬의 전압 재기", 2);
  },
  async svolt() {
    await at("svolt-start");
    await tapKey(page, "20"); await W(page, 300);
    await at("svolt-guard", false);
    await tapStage(page, 232, 104); await W(page, 300);
    await at("svolt-one");
    await tapStage(page, 114, 104); await W(page, 400);
    await at("svolt-half");
    await tapKey(page, "20");
    ok(await waitAsk(page), "svolt: 예측 질문이 뜨지 않음");
    await W(page, 300);
    await at("svolt-predict");
    await answer(page, true); await W(page, 1600);
    await tapStage(page, 232, 104); await tapStage(page, 114, 104); await W(page, 400);
    await at("svolt-20");
    await tapKey(page, "50"); await W(page, 300);
    await tapStage(page, 232, 104); await tapStage(page, 114, 104); await W(page, 400);
    await at("svolt-50");
    await finishLab("svolt", "병렬로 넘어가기", 2);
  },
  async pvolt() {
    await at("pvolt-start");
    await tapStage(page, 173, 60); await W(page, 200); // 칠하기 전에는 전압계가 닿지 않는다
    await tapText(page, "(+)극"); await W(page, 1700);
    await at("pvolt-hi");
    await tapText(page, "(−)극"); await W(page, 1700);
    await at("pvolt-both");
    ok(await waitAsk(page), "pvolt: 예측 질문이 뜨지 않음");
    await W(page, 300);
    await at("pvolt-predict");
    await answer(page, false); await W(page, 1600);
    await tapStage(page, 173, 60); await W(page, 300);
    await at("pvolt-one");
    await tapStage(page, 173, 130); await W(page, 400);
    await at("pvolt-par");
    await tapText(page, "직렬로"); await W(page, 600);
    await at("pvolt-ser-start");
    await tapStage(page, 232, 96); await tapStage(page, 114, 96); await W(page, 400);
    await at("pvolt-ser");
    await finishLab("pvolt", "갈림길의 전류 재기", 2);
  },
  async pcur() {
    await at("pcur-start");
    await tapStage(page, 302, 162); await W(page, 300);
    await at("pcur-one");
    for (const [x, y] of [[238, 66], [238, 126], [44, 162]]) { await tapStage(page, x, y); await W(page, 250); }
    await at("pcur-15");
    await tapKey(page, "30");
    ok(await waitAsk(page), "pcur: 예측 질문이 뜨지 않음");
    await W(page, 300);
    await at("pcur-predict");
    await answer(page, true); await W(page, 1600);
    for (const [x, y] of [[302, 162], [238, 66], [238, 126]]) { await tapStage(page, x, y); await W(page, 250); }
    await at("pcur-30");
    await tapKey(page, "10"); await W(page, 300);
    for (const [x, y] of [[302, 162], [238, 66], [238, 126]]) { await tapStage(page, x, y); await W(page, 250); }
    await at("pcur-10");
    await finishLab("pcur", "이름 붙이기", 2);
  },
  async power() {
    await at("power-start");
    for (const k of ["phone", "led", "fan"]) { await tapKey(page, k); await W(page, 1500); }
    await at("power-three");
    for (const k of ["tv", "wash", "iron"]) { await tapKey(page, k); await W(page, 1500); }
    await at("power-six");
    await tapKey(page, "10"); await tapKey(page, "fan"); await W(page, 1500);
    await at("power-ten");
    await finishLab("power", "이름 붙이기", 2);
  },
  async eff() {
    await at("eff-start");
    await setRange(page, 10); await tapText(page, "기록하기"); await W(page, 300);
    await at("eff-short");
    await setRange(page, 40); await tapText(page, "기록하기"); await W(page, 300);
    await at("eff-inc");
    await tapKey(page, "flu"); await setRange(page, 10); await tapText(page, "기록하기"); await W(page, 300);
    await tapKey(page, "led"); await setRange(page, 5); await W(page, 200);
    await at("eff-led");
    await tapText(page, "기록하기"); await W(page, 300);
    await finishLab("eff", "이름 붙이기", 1);
  },
  async coil() {
    await at("coil-start");
    await tapText(page, "스위치 닫기"); await W(page, 400);
    await at("coil-nocompass", false);
    await tapStage(page, 76, 112); await tapStage(page, 270, 112); await tapStage(page, 173, 50); await tapStage(page, 173, 172); await W(page, 900);
    await at("coil-on");
    await tapText(page, "전류 방향");
    ok(await waitAsk(page), "coil: 예측 질문이 뜨지 않음");
    await W(page, 300);
    await at("coil-predict");
    await answer(page, true); await W(page, 2200);
    await at("coil-flip");
    await tapKey(page, "strong"); await W(page, 900);
    await at("coil-strong");
    await tapText(page, "막대자석"); await W(page, 700);
    await at("coil-magnet");
    await tapText(page, "코일로"); await W(page, 700);
    await at("coil-ns");
    await finishLab("coil", "쉽게 기억하는 법", 3);
  },
  async grip() {
    await at("grip-start");
    await finishLab("grip", "정리하기", 3);
  },
  async swing() {
    await W(page, 1500);
    await at("swing-start");
    await holdBtn(page, ".bv-ctl .g2u7x-hold", 100); // 손을 대면 바로 반응하는지
    await page.mouse.move(195, 560); await page.mouse.down(); await W(page, 900);
    await at("swing-out");
    await page.mouse.up(); await W(page, 300);
    await tapText(page, "전류 방향");
    ok(await waitAsk(page), "swing: 전류 예측 질문이 뜨지 않음");
    await W(page, 300);
    await at("swing-predict");
    await answer(page, true); await W(page, 1700);
    await holdBtn(page, ".bv-ctl .g2u7x-hold", 900); await W(page, 300);
    await tapText(page, "자석의 극");
    ok(await waitAsk(page), "swing: 자석 예측 질문이 뜨지 않음");
    await W(page, 300);
    await answer(page, false); await W(page, 1700);
    const b = await page.evaluate(() => { const r = document.querySelector(".screen.active .bv-ctl .g2u7x-hold").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.move(b.x, b.y); await page.mouse.down(); await W(page, 900);
    await at("swing-both");
    await page.mouse.up(); await W(page, 300);
    await tapKey(page, "strong"); await holdBtn(page, ".bv-ctl .g2u7x-hold", 900); await W(page, 300);
    await finishLab("swing", "전동기 속 코일 보기", 1);
  },
  async motor() {
    await at("motor-start");
    await tapText(page, "전류 흐르게"); await W(page, 1200);
    await at("motor-left");
    ok(await waitAsk(page), "motor: 예측 질문이 뜨지 않음");
    await W(page, 300);
    await at("motor-predict");
    await answer(page, true); await W(page, 1700);
    await at("motor-both");
    await tapText(page, "코일 놓기"); await W(page, 900);
    await at("motor-on");
    await tapText(page, "전류 방향"); await W(page, 700);
    await tapText(page, "자석의 극"); await W(page, 900);
    await at("motor-flip");
    await finishLab("motor", "이름 붙이기", 1);
  },
  async palm() {
    await at("palm-start");
    await finishLab("palm", "정리하기", 3);
  },
};
const PLAN = {
  g2u7l1: ["straw", "rub"], g2u7l2: ["can"], g2u7l3: ["wire", "water"], g2u7l4: ["ohm", "formula"],
  g2u7l5: ["bulb", "scur", "svolt", "pvolt", "pcur"], g2u7l6: ["power", "eff"], g2u7l7: ["coil", "grip"], g2u7l8: ["swing", "motor", "palm"],
};
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
ok(errors.length === 0, `페이지 오류 ${errors.length}건: ${errors.slice(0, 3).join(" | ")}`);
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
await close();
process.exit(fail ? 1 : 0);
