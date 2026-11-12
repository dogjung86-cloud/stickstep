// 중2 Ⅳ v5의 간소 검사: 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가 본다.
//   시점마다(처음, 조작 중, 실패, 판정, 오답, 결론) 스크롤 높이가 한 화면(554px) 안인지, 화면이 밀리지 않았는지,
//   누르는 곳이 48px 이상인지, 잘린 글과 작은 글자가 없는지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
//   랩의 첫 판정에서는 한 번 틀려 본다(틀림 표시, 정답 카드, '다음'). 실험 랩에서는 실패하는 길도 한 번 간다.
//   새로 쓴 선택형 문제는 정답을 눌러 정답으로 채점되는지 본다. 그 길에서 모은 화면 글에 대시, '교과서', 이모지가 없는지도 본다.
//   끝으로 토글을 끈 채 첫 레슨이 지금 화면(훅)으로 열리는지 본다.
// 실행: PORT=5584 node qa/check-g2u4v5.mjs [캡처 폴더]     ONLY=g2u4l2 를 붙이면 그 레슨만 돈다.
//       DIST=<개발 모드 번들 폴더> node qa/check-g2u4v5.mjs  (번들 만드는 법은 qa/u4v5-lib.mjs 머리말. 이때 문제 채점 검사는 건너뛴다)
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as L from "./u4v5-lib.mjs";

const OUT = process.argv[2] ?? "qa/shots/g2u4v5";
mkdirSync(OUT, { recursive: true });
const ONLY = process.env.ONLY || "";
const LESSONS = ["g2u4l1", "g2u4l2", "g2u4l3", "g2u4l4", "g2u4l5", "g2u4l6"].filter((x) => !ONLY || x === ONLY);
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL " + msg); } };
const { browser, page, errors } = await L.launch();
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
});
const W = (ms) => L.W(page, ms);
const texts = [];
let quizzes = 0;
let shots = 0;

async function open(id, v5 = true) {
  await page.goto(`${L.BASE}/?g2u4v5${v5 ? "" : "=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const s = document.querySelector(".screen.active .step");
    return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
  }, null, { timeout: 20000 });
  await W(600);
}
const kind = () =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active");
    if (!sc || sc.id === "sc-done" || sc.id === "sc-home") return "home";
    const s = sc.querySelector(".step");
    if (!s) return "";
    if (s.classList.contains("opn-step")) return "opener:" + (s.dataset.opnScene ?? "");
    if (s.classList.contains("g2u4x-step")) return "lab:" + (s.querySelector(".bv-stage")?.className.match(/g2u4x-(?!stage)[a-z0-9]+/)?.[0].slice(6) ?? "");
    if (s.querySelector(".hook-scene")) return "hook";
    if (s.querySelector(".comic-art, .comic-narrator")) return "comic";
    if (s.querySelector(".opts, .ox-grid")) return "quiz";
    return "read";
  });

async function at(id, mark, shot = true) {
  const m = await L.measure(page);
  ok(m.content <= m.view && m.scrollTop === 0, `${id} ${mark}: 스크롤 ${m.content}/${m.view}, 밀림 ${m.scrollTop}`);
  ok(m.taps.every((t) => t.h >= 47.5), `${id} ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 47.5).map((t) => t.t + ":" + t.h).join(", ")}`);
  ok(m.cut.length === 0, `${id} ${mark}: 잘린 글 ${m.cut.join(" | ")}`);
  ok(m.small.length === 0, `${id} ${mark}: 작은 글자 ${m.small.map((s) => s.t + ":" + s.px).join(", ")}`);
  ok(!m.helperOver, `${id} ${mark}: 도움말이 두 줄을 넘음`);
  texts.push(m.text);
  if (shot) {
    shots += 1;
    await page.screenshot({ path: join(OUT, `${id}-${String(shots).padStart(3, "0")}-${mark}.png`) });
  }
  console.log(`  ${id} ${mark}: ${m.content}/${m.view}`);
}
async function wrongOnce(id, mark) {
  ok(await L.waitAsk(page), `${id} ${mark}: 판정이 뜨지 않음`);
  await W(350);
  await at(id, mark + "-ask");
  const t = await L.pickWrong(page);
  ok(!!t, `${id} ${mark}: 틀린 보기를 찾지 못함`);
  await W(450);
  const v = await L.verdict(page);
  ok(v && v.cls === "miss" && v.word === "오답이에요" && v.ans && v.next, `${id} ${mark}: 오답 표시가 다름 ${JSON.stringify(v)}`);
  await at(id, mark + "-wrong");
  await W(1200);
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
async function predict(id, mark, word) {
  ok(await L.waitAsk(page), `${id} ${mark}: 예측이 뜨지 않음`);
  await W(300);
  await at(id, mark + "-predict");
  await L.pickText(page, word);
}
const tap = async (sel, wait = 250) => {
  const r = await L.click(page, sel);
  await W(wait);
  return r;
};
const must = async (id, sel, wait = 250) => ok(await tap(sel, wait), `${id}: 누를 수 없음 ${sel}`);
async function done(id, mark) {
  ok(await L.waitDone(page, 150), `${id} ${mark}: 결론이 뜨지 않음`);
  await W(400);
  await at(id, mark + "-done");
  const c = await L.ctaState(page);
  ok(c.enabled, `${id} ${mark}: 끝 버튼이 열리지 않음(${c.text})`);
}

// ── 도입 ──
async function runOpener(id, scene) {
  await at(id, "intro-ask");
  await L.choose(page, "");
  await W(700);
  await at(id, "intro-picked");
  if (scene === "g2u4-peek") {
    await L.hold(page, ".opn-g2u4-btn", 3100);
  } else {
    for (let i = 0; i < 4; i++) {
      await tap(".opn-g2u4-btn", 500);
      if (i === 0) await at(id, "intro-play", false);
    }
  }
  ok(await L.waitPhase(page, "done", 60), `${id}: 도입이 끝나지 않음`);
  await W(500);
  await at(id, "intro-done");
  ok((await L.ctaState(page)).enabled, `${id}: 도입의 끝 버튼이 열리지 않음`);
}

// ── 랩 ──
async function inspect(id, mark) {
  const keys = await page.evaluate(() => [...document.querySelectorAll(".screen.active .g2u4x-chipbtn")].map((b) => ({ k: b.dataset.k, bin: b.dataset.bin })));
  let first = true;
  for (const it of keys) {
    await must(id, `.g2u4x-chipbtn[data-k="${it.k}"]`);
    if (first) {
      await at(id, mark + "-look");
      const wrong = await page.evaluate((bin) => [...document.querySelectorAll(".screen.active .g2u4x-bin")].find((b) => b.dataset.bin !== bin)?.dataset.bin, it.bin);
      await tap(`.g2u4x-bin[data-bin="${wrong}"]`, 400);
      ok((await L.ds(page, "g4Miss")) === "1", `${id} ${mark}: 잘못 갈라도 알려 주지 않음`);
      await at(id, mark + "-miss");
      first = false;
    }
    await must(id, `.g2u4x-bin[data-bin="${it.bin}"]`, 350);
  }
  await wrongOnce(id, mark);
  await done(id, mark);
}
const LABS = {
  async water(id) {
    await at(id, "water-start");
    await must(id, ".g2u4x-w-bat", 500);
    ok((await L.ds(page, "g4Water")) === "weak", `${id} water: 황산 나트륨 없이 넣었을 때 실패가 보이지 않음`);
    await at(id, "water-fail");
    await must(id, ".g2u4x-w-bat");
    await must(id, ".g2u4x-w-salt");
    await must(id, ".g2u4x-w-bat", 900);
    ok((await L.ds(page, "g4Water")) === "run", `${id} water: 기포가 나오지 않음`);
    await at(id, "water-run");
    await wrongOnce(id, "water");
    await done(id, "water");
  },
  sort: (id) => inspect(id, "sort"),
  can: (id) => inspect(id, "can"),
  async symbol(id) {
    await at(id, "symbol-start");
    const L0 = '.g2u4x-sy-l[data-i="0"]';
    await must(id, L0);
    await must(id, ".g2u4x-sy-fix", 1900);
    await must(id, L0);
    await must(id, ".g2u4x-sy-fix", 500);
    ok((await L.ds(page, "g4Clash")) === "C", `${id} symbol: 겹친 기호를 알려 주지 않음`);
    await at(id, "symbol-clash");
    await must(id, '.g2u4x-sy-l[data-i="2"]');
    await must(id, ".g2u4x-sy-fix", 1900);
    await must(id, L0);
    await must(id, '.g2u4x-sy-l[data-i="1"]');
    await at(id, "symbol-ca", false);
    await must(id, ".g2u4x-sy-fix", 1900);
    await wrongOnce(id, "symbol");
    await done(id, "symbol");
  },
  async card(id) {
    await at(id, "card-start");
    const want = ["Na", "Fe", "Cu", "Ag", "Au"];
    await tap('.g2u4x-cd-card[data-sym="K"]', 700);
    await at(id, "card-miss");
    await W(900);
    for (let i = 0; i < want.length; i++) {
      for (let t = 0; t < 30 && Number(await L.ds(page, "g4At")) === i; t++) await tap(`.g2u4x-cd-card[data-sym="${want[i]}"]`, 300);
      ok(Number(await L.ds(page, "g4At")) === i + 1, `${id} card: ${want[i]} 카드로 말이 가지 않음`);
    }
    await done(id, "card");
  },
  async formula(id) {
    await at(id, "formula-start");
    const k = (s) => must(id, `.g2u4x-fm-chip[data-k="${s}"]`, 150);
    await k("C");
    await k("O");
    await must(id, ".g2u4x-fm-fix", 500);
    ok((await L.ds(page, "g4Miss")) === "1", `${id} formula: 틀린 식을 알려 주지 않음`);
    await at(id, "formula-miss");
    await k("O");
    await must(id, ".g2u4x-fm-fix", 2300);
    await k("C");
    for (let i = 0; i < 4; i++) await k("H");
    await at(id, "formula-ch4", false);
    await must(id, ".g2u4x-fm-fix", 2300);
    for (let i = 0; i < 3; i++) await k("O");
    await must(id, ".g2u4x-fm-fix", 2300);
    await wrongOnce(id, "formula");
    await done(id, "formula");
  },
  async neutral(id) {
    await at(id, "neutral-start");
    await must(id, ".g2u4x-open", 400);
    await must(id, '.g2u4x-st-b[data-k="e+"]');
    await must(id, ".g2u4x-fix", 400);
    ok((await L.ds(page, "g4Miss")) === "1", `${id} neutral: 전하가 남은 채 완성됨`);
    await at(id, "neutral-miss");
    await must(id, '.g2u4x-st-b[data-k="e+"]');
    await must(id, ".g2u4x-fix", 2100);
    for (let i = 0; i < 3; i++) await must(id, '.g2u4x-st-b[data-k="e+"]', 150);
    await at(id, "neutral-li", false);
    await must(id, ".g2u4x-fix", 2100);
    await wrongOnce(id, "neutral");
    await done(id, "neutral");
  },
  async kind(id) {
    await at(id, "kind-start");
    for (const k of ["n", "e", "p"]) {
      await must(id, `.g2u4x-try[data-k="${k}"]`, 800);
      if (k === "p") await at(id, "kind-try");
      await W(1900);
    }
    await wrongOnce(id, "kind");
    await W(300);
    for (let i = 0; i < 5; i++) await must(id, '.g2u4x-st-b[data-k="p+"]', 120);
    await must(id, ".g2u4x-fix", 400);
    ok((await L.ds(page, "g4Miss")) === "1", `${id} kind: 전자 수가 안 맞는데 완성됨`);
    await at(id, "kind-miss");
    for (let i = 0; i < 5; i++) await must(id, '.g2u4x-st-b[data-k="e+"]', 120);
    await must(id, ".g2u4x-fix", 900);
    for (let i = 0; i < 2; i++) {
      await must(id, '.g2u4x-st-b[data-k="p+"]', 120);
      await must(id, '.g2u4x-st-b[data-k="e+"]', 120);
    }
    await must(id, ".g2u4x-fix", 400);
    await done(id, "kind");
  },
  async table(id) {
    await at(id, "table-start");
    await must(id, '.g2u4x-tb-card[data-k="Ar"]');
    await must(id, '.g2u4x-tb-cell.blank[data-no="9"]', 400);
    ok((await L.ds(page, "g4Miss")) === "1", `${id} table: 잘못 놓아도 알려 주지 않음`);
    await at(id, "table-miss");
    await must(id, '.g2u4x-tb-cell.blank[data-no="18"]', 400);
    await must(id, '.g2u4x-tb-card[data-k="F"]');
    await must(id, '.g2u4x-tb-cell.blank[data-no="9"]', 400);
    await must(id, '.g2u4x-tb-card[data-k="Na"]');
    await must(id, '.g2u4x-tb-cell.blank[data-no="11"]', 400);
    await wrongOnce(id, "table");
    await done(id, "table");
  },
  async alkali(id) {
    await at(id, "alkali-start");
    for (const k of ["mg", "li", "na", "k"]) {
      await must(id, `.g2u4x-chipbtn[data-k="${k}"]`, 900);
      if (k === "mg" || k === "k") await at(id, "alkali-" + k);
      await W(2000);
    }
    await wrongOnce(id, "alkali");
    await rightOnce(id, "alkali2");
    await done(id, "alkali");
  },
  async noble(id) {
    await at(id, "noble-start");
    await must(id, '.g2u4x-chipbtn[data-k="h"]');
    await must(id, '.g2u4x-nb-tool[data-k="flame"]', 500);
    await at(id, "noble-h");
    for (const k of ["he", "ne", "ar"]) {
      await must(id, `.g2u4x-chipbtn[data-k="${k}"]`);
      await must(id, '.g2u4x-nb-tool[data-k="state"]');
      await must(id, '.g2u4x-nb-tool[data-k="flame"]', 350);
    }
    await at(id, "noble-full", false);
    await wrongOnce(id, "noble");
    await done(id, "noble");
  },
  async mol(id) {
    await at(id, "mol-start");
    await must(id, ".g2u4x-mol-add", 400);
    await must(id, ".g2u4x-mol-add", 400);
    await at(id, "mol-co2", false);
    await wrongOnce(id, "mol");
    await W(300);
    await at(id, "mol-water");
    await must(id, ".g2u4x-mol-cut", 600);
    await at(id, "mol-split", false);
    await rightOnce(id, "mol2");
    await done(id, "mol");
  },
  async ion(id) {
    await at(id, "ion-start");
    await must(id, ".g2u4x-ion-give", 1100);
    await wrongOnce(id, "ion");
    await W(600);
    await at(id, "ion-named");
    await W(3000);
    await must(id, ".g2u4x-ion-give", 1200);
    await must(id, ".g2u4x-ion-give", 1200);
    await rightOnce(id, "ion2");
    await done(id, "ion");
  },
  async move(id) {
    await at(id, "move-start");
    await must(id, ".g2u4x-mv-drop", 500);
    ok((await L.ds(page, "g4Fail")) === "dry", `${id} move: 마른 거름종이의 실패가 보이지 않음`);
    await at(id, "move-dry");
    await must(id, ".g2u4x-mv-redo");
    await must(id, ".g2u4x-mv-wet");
    await must(id, ".g2u4x-mv-drop", 1900);
    ok((await L.ds(page, "g4Fail")) === "off", `${id} move: 전원이 꺼진 실패가 보이지 않음`);
    await at(id, "move-off");
    await must(id, ".g2u4x-mv-on", 700);
    await predict(id, "move", "(−)극");
    await W(4600);
    await at(id, "move-moved", false);
    await wrongOnce(id, "move");
    await done(id, "move");
  },
  async pole(id) {
    await at(id, "pole-start");
    await must(id, ".g2u4x-mv-drop", 400);
    await predict(id, "pole", "(+)극");
    await W(4400);
    await wrongOnce(id, "pole");
    await must(id, ".g2u4x-mv-eye", 3600);
    await at(id, "pole-ions", false);
    await rightOnce(id, "pole2");
    await must(id, ".g2u4x-mv-flip", 1500);
    await at(id, "pole-flip", false);
    await done(id, "pole");
  },
};

// ── 문제 ──
async function answer() {
  const r = await page.evaluate(async () => {
    const strip = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, ""); };
    const s = document.querySelector(".screen.active .step");
    const here = s.innerText.replace(/\s+/g, "");
    let unit;
    try { unit = (await import("/src/content/g2/unit4.ts")).G2_UNIT4; } catch { return { skip: true }; }
    for (const l of unit.lessons) for (const st of l.steps) {
      if (st.type !== "quiz" || !here.includes(strip(st.prompt).slice(0, 30))) continue;
      const mode = st.mode ?? "mcq";
      if (mode === "ox") s.querySelector(st.answer ? ".ox-btn.o" : ".ox-btn.x")?.click();
      else for (const a of Array.isArray(st.answer) ? st.answer : [st.answer]) s.querySelector(`.opt[data-oi="${a}"]`)?.click();
      return {};
    }
    return { err: "단원 표에서 이 문항을 찾지 못함" };
  });
  if (r.skip) return "skip";
  if (r.err) return r.err;
  await W(250);
  if (!(await L.ctaState(page)).enabled) return "확인하기가 열리지 않음";
  await L.cta(page);
  const shown = await L.waitFor(page, () => {
    const t = document.querySelector(".screen.active .sheet-title");
    return !!t && t.offsetParent !== null && t.textContent.trim().length > 0;
  }, null, 40);
  if (!shown) return "채점 시트가 뜨지 않음";
  const title = await page.evaluate(() => document.querySelector(".screen.active .sheet-title").textContent.trim());
  texts.push(await page.evaluate(() => document.querySelector(".screen.active .sheet-card")?.innerText ?? ""));
  await W(300);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .sheet-card .btn")].find((b) => b.offsetParent !== null)?.click());
  await W(500);
  return title === "정답이에요" ? "ok" : `"${title}"로 채점됨`;
}
const forward = async () => {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await W(600);
};
const stepText = () => page.evaluate(() => (document.querySelector(".screen.active .step")?.innerText ?? "") + " " + (document.querySelector(".screen.active .btn.cta")?.textContent ?? ""));

for (const id of LESSONS) {
  console.log(`\n■ ${id}`);
  await open(id);
  const seen = [];
  for (let guard = 0; guard < 60; guard++) {
    const k = await kind();
    if (k === "home" || k === "") break;
    seen.push(k);
    if (k.startsWith("opener:")) {
      await runOpener(id, k.slice(7));
      await L.cta(page);
    } else if (k.startsWith("lab:")) {
      const fn = LABS[k.slice(4)];
      ok(!!fn, `${id}: 모르는 랩 ${k}`);
      if (fn) await fn(id);
      const before = await stepText();
      await L.cta(page);
      ok((await stepText()) !== before, `${id} ${k}: 끝 버튼을 눌러도 다음 스텝이 열리지 않음`);
    } else if (k === "quiz") {
      const r = await answer();
      if (r === "skip") await forward();
      else {
        quizzes += 1;
        ok(r === "ok", `${id} 문제: ${r} (${(await stepText()).slice(0, 30)})`);
      }
    } else if (k === "comic") {
      await forward();
    } else {
      // 개념, 정리, 분류, 순서, 짝 잇기: 글만 모으고 넘어간다
      texts.push(await stepText());
      const isLast = await page.evaluate(() => getComputedStyle(document.querySelector(".screen.active .xbtn.fwd")).visibility === "hidden");
      if (isLast) break;
      await forward();
    }
  }
  console.log("  스텝: " + seen.join(" → "));
}

// 화면 글 규칙
const all = texts.join("\n");
ok(!/[—–]/.test(all), "화면 글에 대시가 있음: " + (all.match(/.{0,12}[—–].{0,12}/)?.[0] ?? ""));
ok(!/교과서/.test(all), "화면 글에 '교과서'가 있음");
ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(all), "화면 글에 이모지가 있음: " + (all.match(/.{0,8}[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}].{0,8}/u)?.[0] ?? ""));
ok(!/ - /.test(all), "화면 글에 삽입구용 하이픈이 있음: " + (all.match(/.{0,12} - .{0,12}/)?.[0] ?? ""));

// 토글을 끈 화면
if (!ONLY || ONLY === "off") {
  await open("g2u4l1", false);
  const k = await kind();
  ok(k === "hook", `토글을 끈 첫 레슨이 지금 화면(훅)으로 열리지 않음: ${k}`);
  await page.screenshot({ path: join(OUT, "off-g2u4l1.png") });
}
ok(errors.length === 0, "페이지 오류: " + errors.slice(0, 5).join(" | "));
console.log(`\n문제 ${quizzes}개 채점 확인. 통과 ${pass}, 실패 ${fail}`);
await browser.close();
process.exit(fail ? 1 : 0);
