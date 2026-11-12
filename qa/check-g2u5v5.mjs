// 중2 Ⅴ v5의 간소 검사: 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가 본다.
//   시점마다(처음, 조작 중, 실패, 판정, 오답, 결론) 스크롤 높이가 한 화면(554px) 안인지, 화면이 밀리지 않았는지,
//   누르는 곳이 48px 이상인지, 잘린 글과 작은 글자가 없는지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
//   랩의 첫 판정에서는 한 번 틀려 본다(틀림 표시, 정답 카드, '다음'). 실험 랩에서는 실패하는 길도 한 번 간다.
//   새로 쓴 선택형 문제는 정답을 눌러 정답으로 채점되는지 본다. 그 길에서 모은 화면 글에 대시, '교과서', 이모지가 없는지도 본다.
//   끝으로 토글을 끈 채 첫 레슨이 지금 화면(훅)으로 열리는지 본다.
// 실행: PORT=5585 node qa/check-g2u5v5.mjs [캡처 폴더]     ONLY=g2u5l2 를 붙이면 그 레슨만 돈다.
//       DIST=<개발 모드 번들 폴더> node qa/check-g2u5v5.mjs  (번들 만드는 법은 qa/u4v5-lib.mjs 머리말. 이때 문제 채점 검사는 건너뛴다)
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as L from "./u4v5-lib.mjs";

const OUT = process.argv[2] ?? "qa/shots/g2u5v5";
mkdirSync(OUT, { recursive: true });
const ONLY = process.env.ONLY || "";
const LESSONS = ["g2u5l1", "g2u5l2", "g2u5l3", "g2u5l4", "g2u5l5", "g2u5l6"].filter((x) => !ONLY || x === ONLY);
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
  await page.goto(`${L.BASE}/?g2u5v5${v5 ? "" : "=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
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
    if (s.classList.contains("g2u5x-step")) return "lab:" + (s.querySelector(".bv-stage")?.className.match(/g2u5x-(?!stage)[a-z0-9]+/)?.[0].slice(6) ?? "");
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
async function runOpener(id) {
  await at(id, "intro-ask");
  await L.choose(page, "");
  await W(700);
  await at(id, "intro-picked");
  for (let i = 0; i < 10; i++) {
    if ((await L.ds(page, "opnPhase")) === "done") break;
    const hit = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".screen.active .opn-g2u5-btn")].find((x) => !x.disabled);
      b?.click();
      return !!b;
    });
    await W(hit ? 900 : 500);
    if (i === 0) await at(id, "intro-play", false);
  }
  ok(await L.waitPhase(page, "done", 60), `${id}: 도입이 끝나지 않음`);
  await W(500);
  await at(id, "intro-done");
  ok((await L.ctaState(page)).enabled, `${id}: 도입의 끝 버튼이 열리지 않음`);
}

// ── 랩 ──
const K = (k) => `.g2u5x-chipbtn[data-k="${k}"]`;
const dsIs = async (id, key, want, msg) => ok((await L.ds(page, key)) === want, `${id}: ${msg} (${key}=${await L.ds(page, key)})`);
const LABS = {
  async scope(id) {
    await at(id, "scope-start");
    await must(id, K("elodea"), 600);
    await at(id, "scope-elodea");
    await must(id, K("onion"), 600);
    await at(id, "scope-onion", false);
    await must(id, K("lettuce"), 600);
    await must(id, ".g2u5x-go");
    await wrongOnce(id, "scope");
    await done(id, "scope");
  },
  async supply(id) {
    await at(id, "supply-start");
    await must(id, K("light"));
    await must(id, K("water"));
    await dsIs(id, "g5Run", "0", "둘만 주었는데 만들어짐");
    await at(id, "supply-lack");
    await must(id, K("co2"), 1900);
    await dsIs(id, "g5Run", "1", "셋을 다 주어도 만들어지지 않음");
    await at(id, "supply-run");
    await must(id, K("water"), 400);
    await dsIs(id, "g5Run", "0", "물을 끊어도 멈추지 않음");
    await at(id, "supply-cut");
    await must(id, K("water"), 400);
    await must(id, ".g2u5x-go");
    await wrongOnce(id, "supply");
    await done(id, "supply");
  },
  async sensor(id) {
    await at(id, "sensor-start");
    await must(id, ".g2u5x-run", 3400);
    await dsIs(id, "g5Last", "empty", "모종 없이 잰 결과가 보이지 않음");
    await at(id, "sensor-empty");
    await must(id, K("plant"));
    await must(id, ".g2u5x-run", 3400);
    await dsIs(id, "g5Last", "open", "뚜껑을 연 채 잰 실패가 보이지 않음");
    await at(id, "sensor-open");
    await must(id, K("lid"));
    await must(id, ".g2u5x-run", 3400);
    await dsIs(id, "g5Kept", "d", "전등을 끈 측정이 남지 않음");
    await at(id, "sensor-dark");
    await must(id, K("light"));
    await must(id, ".g2u5x-run", 3400);
    await dsIs(id, "g5Kept", "bd", "전등을 켠 측정이 남지 않음");
    await at(id, "sensor-both");
    await must(id, ".g2u5x-go");
    await wrongOnce(id, "sensor");
    await done(id, "sensor");
  },
  async starch(id) {
    await at(id, "starch-start");
    await must(id, ".g2u5x-day", 500);
    await at(id, "starch-bench");
    await must(id, K("drop"), 600);
    await dsIs(id, "g5Fail", "green", "탈색하지 않은 실패가 보이지 않음");
    await at(id, "starch-green");
    await W(2300);
    await must(id, K("fire"), 500);
    await at(id, "starch-fire");
    await W(1500);
    await must(id, K("bath"), 400);
    await at(id, "starch-pale", false);
    await must(id, K("rinse"));
    await must(id, K("drop"), 600);
    await dsIs(id, "g5Fail", "nobox", "어둠상자 없는 실패가 보이지 않음");
    await at(id, "starch-nobox");
    await W(2700);
    await dsIs(id, "g5Stage", "prep", "처음으로 돌아가지 않음");
    await must(id, K("box"));
    await at(id, "starch-box", false);
    await must(id, ".g2u5x-day", 500);
    await must(id, K("bath"), 400);
    await must(id, K("rinse"));
    await must(id, K("drop"), 600);
    await at(id, "starch-blue");
    await wrongOnce(id, "starch");
    await done(id, "starch");
  },
  async design(id) {
    const S = (k) => `.g2u5x-st-b[data-k="${k}"]`;
    await at(id, "design-start");
    await must(id, ".g2u5x-run", 1300);
    await must(id, S("temp+"));
    await must(id, S("lamp+"));
    await must(id, ".g2u5x-run", 1300);
    await dsIs(id, "g5Off", "1", "온도를 함께 바꾼 실패가 표시되지 않음");
    await at(id, "design-odd");
    await must(id, S("temp-"));
    await must(id, ".g2u5x-run", 1300);
    await must(id, S("lamp+"));
    await must(id, ".g2u5x-run", 1300);
    await at(id, "design-three", false);
    await must(id, S("lamp+"));
    await must(id, ".g2u5x-run", 1300);
    await dsIs(id, "g5Valid", "4", "네 측정이 모이지 않음");
    await at(id, "design-four");
    await wrongOnce(id, "design");
    await done(id, "design");
  },
  async farm(id) {
    const S = (k) => `.g2u5x-st-b[data-k="${k}"]`;
    await at(id, "farm-start");
    for (let i = 0; i < 5; i++) await must(id, S("c+"), 150);
    await at(id, "farm-flat");
    for (let i = 0; i < 3; i++) await must(id, S("c-"), 150);
    await must(id, ".g2u5x-pick", 400);
    await dsIs(id, "g5Farm", "co2", "낮은 농도로 정해도 넘어감");
    await at(id, "farm-low");
    await W(1600);
    await must(id, S("c+"), 150);
    await must(id, ".g2u5x-pick", 400);
    await dsIs(id, "g5Farm", "temp", "온도 단계로 넘어가지 않음");
    await at(id, "farm-temp");
    for (let i = 0; i < 6; i++) await must(id, S("t+"), 200);
    await at(id, "farm-hot");
    await W(1800);
    await must(id, ".g2u5x-pick", 400);
    await dsIs(id, "g5Farm", "temp", "높은 온도로 정해도 넘어감");
    await W(1800);
    for (let i = 0; i < 3; i++) await must(id, S("t-"), 200);
    await at(id, "farm-best", false);
    await must(id, ".g2u5x-pick", 400);
    await wrongOnce(id, "farm");
    await done(id, "farm");
  },
  async dark(id) {
    await at(id, "dark-start");
    await must(id, ".g2u5x-run", 3400);
    await dsIs(id, "g5Last", "leaf", "잎을 넣은 측정이 남지 않음");
    await at(id, "dark-leaf");
    await must(id, K("none"));
    await must(id, ".g2u5x-run", 3400);
    await at(id, "dark-none");
    await must(id, K("root"));
    await at(id, "dark-root-in", false);
    await must(id, ".g2u5x-run", 3400);
    await dsIs(id, "g5Kept", "3", "세 측정이 모이지 않음");
    await at(id, "dark-three");
    await must(id, ".g2u5x-go");
    await wrongOnce(id, "dark");
    await done(id, "dark");
  },
  async sprout(id) {
    await at(id, "sprout-start");
    await must(id, K("light"), 1700);
    await dsIs(id, "g5Grow", "0", "산소 없이 빛만으로 자람");
    await at(id, "sprout-lit");
    await must(id, K("o2"), 3000);
    await at(id, "sprout-grow");
    await must(id, K("light"), 1500);
    ok(await L.waitFor(page, () => document.querySelector(".screen.active .step")?.dataset.g5Grow === "100", null, 120), `${id} sprout: 싹이 끝까지 자라지 않음`);
    await W(400);
    await at(id, "sprout-full");
    await must(id, ".g2u5x-go");
    await wrongOnce(id, "sprout");
    await done(id, "sprout");
  },
  async light(id) {
    const S = (k) => `.g2u5x-st-b[data-k="${k}"]`;
    await at(id, "light-start");
    await must(id, ".g2u5x-check", 500);
    await dsIs(id, "g5M", "0", "빛이 없는데 첫 과제가 통과됨");
    await at(id, "light-miss");
    await W(1600);
    await must(id, S("lv+"));
    await must(id, S("lv+"));
    await must(id, ".g2u5x-check", 500);
    await dsIs(id, "g5M", "1", "첫 과제가 통과되지 않음");
    await at(id, "light-o2");
    await W(1600);
    await must(id, S("lv-"));
    await must(id, S("lv-"));
    await must(id, ".g2u5x-check", 500);
    await dsIs(id, "g5M", "2", "둘째 과제가 통과되지 않음");
    await at(id, "light-night");
    await W(1600);
    await must(id, S("lv+"));
    await at(id, "light-weak", false);
    await must(id, ".g2u5x-check", 500);
    await wrongOnce(id, "light");
    await done(id, "light");
  },
  async cycle(id) {
    await at(id, "cycle-start");
    await must(id, K("물"), 500);
    await dsIs(id, "g5Miss", "1", "틀린 붙임딱지를 알려 주지 않음");
    await at(id, "cycle-miss");
    for (const k of ["빛에너지", "포도당", "산소"]) await must(id, K(k), 300);
    await at(id, "cycle-half");
    for (const k of ["이산화 탄소", "물", "에너지"]) await must(id, K(k), 300);
    await dsIs(id, "g5At", "4", "빈칸이 다 채워지지 않음");
    await at(id, "cycle-full");
    await wrongOnce(id, "cycle");
    await done(id, "cycle");
  },
  async route(id) {
    await at(id, "route-start");
    await must(id, K("starch"));
    await must(id, K("phloem"));
    await must(id, ".g2u5x-send", 500);
    await dsIs(id, "g5Fail", "starch", "녹말 그대로 보낸 실패가 보이지 않음");
    await at(id, "route-starch");
    await W(1600);
    await must(id, K("sugar"));
    await must(id, K("xylem"));
    await must(id, ".g2u5x-send", 500);
    await dsIs(id, "g5Fail", "xylem", "물관으로 보낸 실패가 보이지 않음");
    await at(id, "route-xylem");
    await W(1600);
    await must(id, K("phloem"));
    await must(id, ".g2u5x-send", 500);
    await dsIs(id, "g5Open", "1", "설탕과 체관으로도 길이 열리지 않음");
    await at(id, "route-open");
    for (const k of ["shoot", "flower", "root"]) await must(id, K(k), 1500);
    await dsIs(id, "g5Got", "3", "세 곳에 다 닿지 않음");
    await at(id, "route-all");
    await must(id, ".g2u5x-go");
    await wrongOnce(id, "route");
    await done(id, "route");
  },
  async store(id) {
    await at(id, "store-start");
    await must(id, K("sweet"), 400);
    await must(id, K("grape"), 400);
    await at(id, "store-two");
    for (const k of ["potato", "bean", "sesame"]) await must(id, K(k), 400);
    await dsIs(id, "g5Done", "5", "다섯 작물을 다 검사하지 못함");
    await at(id, "store-five");
    await must(id, ".g2u5x-go");
    await wrongOnce(id, "store");
    await done(id, "store");
  },
};


// ── 문제 ──
async function answer() {
  const r = await page.evaluate(async () => {
    const strip = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, ""); };
    const s = document.querySelector(".screen.active .step");
    const here = s.innerText.replace(/\s+/g, "");
    let unit;
    try { unit = (await import("/src/content/g2/unit5v5.ts")).G2_UNIT5_V5; } catch { return { skip: true }; }
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
  await open("g2u5l2", false);
  const k = await kind();
  ok(k === "hook", `토글을 끈 첫 레슨이 지금 화면(훅)으로 열리지 않음: ${k}`);
  await page.screenshot({ path: join(OUT, "off-g2u5l2.png") });
}
ok(errors.length === 0, "페이지 오류: " + errors.slice(0, 5).join(" | "));
console.log(`\n문제 ${quizzes}개 채점 확인. 통과 ${pass}, 실패 ${fail}`);
await browser.close();
process.exit(fail ? 1 : 0);
