// 중2 Ⅱ v5(도입, 랩, 개념, 정리, 문제)의 간소 검사: 390×700에서 레슨마다 처음부터 끝까지 한 길로 가 본다.
//   도입과 랩은 화면이 내놓는 "다음에 누를 곳" 표식(data-g2-hint, 개발 서버 전용)을 따라 실제로 누르고, 꾹 누르고, 막대를 민다.
//   시점마다(처음, 예측, 조작 중, 판정, 오답, 결론) 스크롤 높이가 한 화면(554px) 안인지, 화면이 밀리지 않았는지,
//   누르는 곳이 48px 이상인지, 잘린 글과 작은 글자가 없는지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
//   랩마다 첫 판정에서는 한 번 틀려 본다(틀림 표시, 정답 카드, '다음'). 새로 쓴 문제는 정답을 눌러 정답으로 채점되는지 본다.
//   그 길에서 모은 화면 글에 대시, '교과서', 이모지가 없는지도 본다. 끝으로 토글을 끈 채 첫 레슨이 지금 화면(훅)으로 열리는지 본다.
// 실행: PORT=5582 node qa/check-g2u2v5.mjs [캡처 폴더]            (개발 서버가 떠 있을 때)
//       DIST=<개발 모드 번들 폴더> node qa/check-g2u2v5.mjs       (번들 만드는 법은 qa/u4v5-lib.mjs 머리말)
//       ONLY=g2u2l2 를 붙이면 그 레슨만 돈다.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as L from "./u4v5-lib.mjs";

const OUT = process.argv[2] ?? "qa/shots/g2u2v5";
mkdirSync(OUT, { recursive: true });
const ONLY = process.env.ONLY || "";
const LESSONS = Array.from({ length: 9 }, (_, i) => `g2u2l${i + 1}`);
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL " + msg); } };
const { browser, page, errors } = await L.launch();
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
});
const W = (ms) => L.W(page, ms);
let texts = [];
let quizzes = 0, labs = 0;

async function open(id, v5 = true) {
  await page.goto(`${L.BASE}/?g2u2v5${v5 ? "" : "=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const s = document.querySelector(".screen.active .step");
    return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
  }, null, { timeout: 20000 });
  await W(600);
}
const kindOf = () => page.evaluate(() => {
  const sc = document.querySelector(".screen.active");
  if (!sc || sc.id === "sc-done" || sc.id === "sc-home") return "home";
  const s = sc.querySelector(".step");
  if (!s) return "";
  if (s.classList.contains("opn-step")) return "opener";
  if (s.classList.contains("g2u2x-step")) return "lab";
  if (s.classList.contains("bv-step")) return "oldlab";
  if (s.querySelector(".hook-scene")) return "hook";
  if (s.querySelector(".opts, .ox-grid")) return "quiz";
  return "read";
});
const stepTitle = () => page.evaluate(() => document.querySelector(".screen.active .step")?.innerText.trim().split("\n")[0] ?? "");

async function at(id, mark, shot = true) {
  const m = await L.measure(page);
  ok(m.content <= m.view && m.scrollTop === 0, `${id} ${mark}: 스크롤 ${m.content}/${m.view}, 밀림 ${m.scrollTop}`);
  ok(m.taps.every((t) => t.h >= 43.5), `${id} ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 43.5).map((t) => t.t + ":" + t.h).join(", ")}`);
  ok(m.cut.length === 0, `${id} ${mark}: 잘린 글 ${m.cut.join(" | ")}`);
  ok(m.small.length === 0, `${id} ${mark}: 작은 글자 ${m.small.map((s) => s.t + ":" + s.px).join(", ")}`);
  ok(!m.helperOver, `${id} ${mark}: 도움말이 두 줄을 넘음`);
  texts.push(m.text);
  if (shot) await page.screenshot({ path: join(OUT, `${id}-${mark}.png`) });
  console.log(`  ${id} ${mark}: ${m.content}/${m.view}`);
}

const hintOf = () => page.evaluate(() => {
  const s = document.querySelector(".screen.active .step");
  return { k: s?.dataset.g2Hint ?? "", n: s?.dataset.g2N ?? "" };
});
/** 표식이 가리키는 곳을 실제로 조작한다. 조작 뒤 표식이 바뀔 때까지(또는 잠깐) 기다린다. */
async function act(h) {
  const before = h.n;
  if (h.k.startsWith("hold:")) await L.hold(page, `[data-k="${h.k.slice(5)}"]`, 1200);
  else if (h.k.startsWith("range:")) {
    const [key, v] = h.k.slice(6).split("=");
    await L.setRange(page, `[data-k="${key}"]`, Number(v));
  } else await L.click(page, `[data-k="${h.k}"]`);
  await L.waitFor(page, (b) => (document.querySelector(".screen.active .step")?.dataset.g2N ?? "") !== b, before, 30, 100);
  await W(250);
}
const askState = () => page.evaluate(() => {
  const bs = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].filter((x) => !x.disabled && x.offsetParent !== null);
  if (!bs.length) return "";
  return bs.some((b) => b.dataset.ok === "1") ? "judge" : "predict";
});

async function playOpener(id) {
  await at(id, "intro-ask");
  ok(!!(await L.choose(page, "\u0000")), `${id} 도입: 예측 보기가 없음`);
  await W(700);
  await at(id, "intro-picked");
  let mid = false;
  for (let i = 0; i < 20; i++) {
    const h = await hintOf();
    if (h.k === "cta" && (await L.ctaState(page)).enabled) break;
    if (!h.k || h.k === "predict" || h.k === "cta") { await W(250); continue; }
    await act(h);
    if (!mid) { mid = true; await at(id, "intro-mid"); }
  }
  await W(400);
  await at(id, "intro-done");
  ok((await L.ctaState(page)).enabled, `${id} 도입: 끝 버튼이 열리지 않음`);
  await L.cta(page);
}

async function playLab(id, n) {
  const mark = `lab${n}`;
  await W(400);
  await at(id, `${mark}-start`);
  let firstJudge = true, mid = false;
  for (let i = 0; i < 90; i++) {
    const a = await askState();
    if (a === "judge") {
      if (firstJudge) {
        firstJudge = false;
        await W(350);
        await at(id, `${mark}-ask`);
        const t = await L.pickWrong(page);
        ok(!!t, `${id} ${mark}: 틀린 보기를 찾지 못함`);
        await W(450);
        const v = await L.verdict(page);
        ok(v && v.cls === "miss" && v.word === "오답이에요" && v.ans, `${id} ${mark}: 오답 표시가 다름 ${JSON.stringify(v)}`);
        await at(id, `${mark}-wrong`);
        await W(1200);
        ok((await L.verdict(page))?.cls === "miss", `${id} ${mark}: '다음'을 누르기 전에 넘어감`);
      } else {
        await W(300);
        await L.pickRightOnly(page);
        await W(400);
        const v = await L.verdict(page);
        ok(v && v.cls === "ok" && v.word === "정답이에요", `${id} ${mark}: 정답 표시가 다름 ${JSON.stringify(v)}`);
        await at(id, `${mark}-right`, false);
      }
      await L.tapNext(page);
      await W(500);
      continue;
    }
    if (a === "predict") {
      await W(300);
      await at(id, `${mark}-predict`);
      await page.evaluate(() => [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].find((x) => !x.disabled)?.click());
      await W(1000);
      continue;
    }
    const h = await hintOf();
    if (h.k === "cta" && (await L.ctaState(page)).enabled) break;
    if (!h.k || h.k === "ask" || h.k === "predict" || h.k === "cta") { await W(250); continue; }
    await act(h);
    if (!mid) { mid = true; await at(id, `${mark}-mid`); }
  }
  ok(await L.waitDone(page, 30), `${id} ${mark}: 결론이 뜨지 않음`);
  await W(300);
  await at(id, `${mark}-done`);
  ok((await L.ctaState(page)).enabled, `${id} ${mark}: 끝 버튼이 열리지 않음`);
  labs += 1;
  await L.cta(page);
}

async function answerQuiz() {
  const found = await page.evaluate(() => {
    const strip = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, ""); };
    const s = document.querySelector(".screen.active .step");
    const here = s.innerText.replace(/\s+/g, "");
    const unit = window.__g2u2v5;
    if (!unit) return { err: "단원 표(window.__g2u2v5)가 없음" };
    for (const l of unit.lessons) for (const st of l.steps) {
      if (st.type !== "quiz") continue;
      if (!here.includes(strip(st.prompt).slice(0, 40))) continue;
      const mode = st.mode ?? "mcq";
      if (mode === "ox") s.querySelector(st.answer ? ".ox-btn.o" : ".ox-btn.x")?.click();
      else for (const a of Array.isArray(st.answer) ? st.answer : [st.answer]) s.querySelector(`.opt[data-oi="${a}"]`)?.click();
      return { mode };
    }
    return { err: "단원 표에서 이 문항을 찾지 못함" };
  });
  if (found.err) return found.err;
  await W(250);
  if (!(await L.ctaState(page)).enabled) return "확인하기가 열리지 않음";
  await L.cta(page);
  const okTitle = await L.waitFor(page, () => {
    const t = document.querySelector(".screen.active .sheet-title");
    return !!t && t.offsetParent !== null && t.textContent.trim().length > 0;
  }, null, 40);
  if (!okTitle) return "채점 시트가 뜨지 않음";
  const title = await page.evaluate(() => document.querySelector(".screen.active .sheet-title").textContent.trim());
  await W(300);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .sheet-card .btn")].find((b) => b.offsetParent !== null)?.click());
  await W(500);
  return title === "정답이에요" ? "ok" : `"${title}"로 채점됨`;
}

async function playLesson(id) {
  let n = 0, read = 0;
  for (let guard = 0; guard < 40; guard++) {
    await W(500);
    const k = await kindOf();
    if (!k || k === "home") break;
    if (guard === 0) ok(k === "opener", `${id}: 새 도입으로 시작하지 않음(${k})`);
    if (k === "opener") await playOpener(id);
    else if (k === "lab") await playLab(id, ++n);
    else if (k === "quiz") {
      const title = await stepTitle();
      texts.push(await page.evaluate(() => document.querySelector(".screen.active .step").innerText));
      const r = await answerQuiz();
      ok(r === "ok", `${id} 문제 "${title.slice(0, 24)}": ${r}`);
      quizzes += 1;
    } else if (k === "read") {
      texts.push(await page.evaluate(() => document.querySelector(".screen.active .step").innerText));
      await page.screenshot({ path: join(OUT, `${id}-read${++read}.png`) });
      const c = await L.ctaState(page);
      if (c.enabled) await L.cta(page);
      else {
        // 끌어 놓는 활동(순서, 분류, 짝 잇기)은 검토 모드의 앞으로 가기로 지나간다. 마지막 스텝이면 여기서 끝낸다.
        const before = await stepTitle();
        await L.click(page, ".xbtn.fwd");
        await W(500);
        if ((await stepTitle()) === before) break;
      }
    } else {
      ok(false, `${id}: 옛 스텝이 남아 있음(${k}: ${await stepTitle()})`);
      await L.click(page, ".xbtn.fwd");
    }
  }
  ok(n >= 1, `${id}: 새 랩이 하나도 없음`);
}

for (const id of LESSONS) {
  if (ONLY && ONLY !== id) continue;
  console.log(id);
  texts = [];
  await open(id);
  await playLesson(id);
  const all = texts.join("\n");
  ok(!/[—–]|\s-\s/.test(all), `${id}: 화면 글에 대시가 있음`);
  ok(!/교과서/.test(all), `${id}: 화면 글에 금지 낱말(교과서)이 있음`);
  ok(!/\p{Extended_Pictographic}/u.test(all.replace(/[℃→←↔]/g, "")), `${id}: 화면 글에 이모지가 있음`);
}
const v5Errors = errors.length;
if (!ONLY) {
  await open("g2u2l1", false);
  ok((await kindOf()) === "hook", `토글을 껐는데 정본 훅이 아님(${await kindOf()})`);
}
ok(v5Errors === 0, `페이지 오류 ${v5Errors}건: ${errors.slice(0, 3).join(" / ")}`);
if (errors.length > v5Errors) console.log(`  (참고) 토글을 끈 지금 화면에서 난 오류 ${errors.length - v5Errors}건: ${errors.slice(v5Errors).join(" / ")}`);
await browser.close();
console.log(`랩 ${labs}개, 문제 ${quizzes}개`);
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
