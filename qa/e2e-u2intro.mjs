// 중1 Ⅱ 도입 샘플 실플레이 검사.
// PORT=5557 node qa/e2e-u2intro.mjs
//   A. 토글이 꺼져 있으면 지금과 같다: CURRICULUM의 Ⅱ단원이 UNIT2_V5 그 객체이고, 세션에 아무것도 남지 않는다.
//   B. 토글을 켜면 세 레슨의 첫 스텝만 바뀐다: 나머지 스텝과 다른 레슨은 정본과 같은 객체다. 끄는 주소로 되돌아간다.
//   C. 세 샘플을 여러 길로 끝까지: 조작 방식(끌기, 누르기, 방향 키), 예측 보기, 차례를 바꿔 가며.
//      끝나면 아래 버튼이 정본과 같은 글로 열리고, 누르면 정본의 다음 스텝(랩 또는 개념)이 열린다. 되돌아오면 처음부터 다시 선다.
//   D. 실사용 경로: 스플래시 → 지도 → 레슨 노드를 실제 클릭으로 들어가 실제 마우스 입력으로 조작한다.
//   E. 화면에 뜬 글의 언어 검사(대시, 이모지, 금지어, 해요체).
import { chromium } from "playwright-core";
import * as L from "./u2intro-lib.mjs";

let PASS = 0;
let FAIL = 0;
const fails = [];
const ok = (cond, label) => {
  if (cond) PASS++;
  else {
    FAIL++;
    fails.push(label);
  }
  console.log(cond ? "  ✓" : "  ✗", label);
};
// 개발 서버는 고친 파일의 주소에 시각 꼬리표를 붙인다. 검사 도구가 꼬리표 없는 주소로 들여오면 앱이 쓰는 것과 다른 사본이 온다
// (게다가 앱의 사본은 문제 번호 같은 값이 실행 중에 덧붙어 내용도 달라진다). 앱이 실제로 받은 주소를 찾아 그 주소로 들여온다.
const APP_IMPORT = `(frag) => import(performance.getEntriesByType("resource").map((e) => e.name).find((n) => n.includes(frag)) ?? frag)`;
const seen = new Map(); // 화면에 뜬 글 → 어디서
const grab = async (page, where) => {
  const texts = await page.evaluate(() => {
    const step = document.querySelector(".screen.active .step");
    const out = [];
    for (const sel of [".opn-title", ".opn-bubble", ".hook-q", ".hook-choice", ".opn-tag", ".opn-cap", ".opn-fc-card", ".opn-lc-read", ".opn-lc-pin"]) {
      for (const e of step.querySelectorAll(sel)) if (e.getClientRects().length) out.push([sel, (e.innerText || e.textContent || "").trim()]);
    }
    const b = document.querySelector(".screen.active .btn.cta");
    if (b) out.push(["cta", b.textContent.trim()]);
    return out;
  });
  for (const [sel, t] of texts) if (t && !seen.has(`${sel}|${t}`)) seen.set(`${sel}|${t}`, where);
};

// ── A. 꺼져 있을 때 ────────────────────────────────────────────────
console.log("A. 토글이 꺼져 있으면 지금과 같다");
{
  const { browser, page, errors } = await L.launch({ query: "" });
  const off = await page.evaluate(async (src) => {
    const imp = eval(src);
    const c = await imp("/src/content/curriculum.ts");
    const v5 = await imp("/src/content/unit2v5.ts");
    const i = await imp("/src/content/unit2intro.ts");
    const u = c.CURRICULUM.find((x) => x.id === "u2");
    const probe = { lessons: v5.UNIT2_V5.lessons };
    return {
      same: u === v5.UNIT2_V5,
      passthru: i.withU2IntroSamples(probe) === probe,
      on: i.U2_INTRO_ON, open: i.U2_INTRO_OPEN, ss: sessionStorage.getItem("ss.u2intro"), first: u.lessons.map((l) => l.steps[0].type).join(","),
    };
  }, APP_IMPORT);
  ok(off.same, "아무 표식 없이 열면 CURRICULUM의 Ⅱ단원이 UNIT2_V5 그 객체다(글자 하나까지 같다)");
  ok(off.passthru, "꺼져 있으면 배선 함수가 받은 단원 객체를 그대로 돌려준다");
  ok(off.on === false && off.open === null && off.ss === null, "토글 꺼짐, 세션에 남는 것 없음");
  ok(off.first === "comic,hook,hook,hook,hook,hook,comic,hook,hook,hook", `열 레슨의 첫 스텝이 지금과 같다(${off.first})`);
  await L.openSample(page, "u2l4", { now: true });
  ok((await L.stepType(page)) === "hook", "?u2intro=now:u2l4 는 지금 판의 도입(hook)을 연다");
  ok((await page.evaluate(() => sessionStorage.getItem("ss.u2intro"))) === null, "지금 판으로 열기는 세션에 토글을 남기지 않는다");
  ok(errors.length === 0, `페이지 오류 없음 ${JSON.stringify(errors)}`);
  await browser.close();
}

// ── B. 켰을 때 ─────────────────────────────────────────────────────
console.log("B. 토글을 켜면 세 레슨의 첫 스텝만 바뀐다");
{
  const { browser, page, errors } = await L.launch({ query: "?u2intro" });
  const on = await page.evaluate(async (src) => {
    const imp = eval(src);
    const c = await imp("/src/content/curriculum.ts");
    const v5 = await imp("/src/content/unit2v5.ts");
    const u = c.CURRICULUM.find((x) => x.id === "u2");
    const base = v5.UNIT2_V5;
    const changed = [];
    let restSame = true;
    let metaSame = true;
    for (const k of Object.keys(base)) if (k !== "lessons" && u[k] !== base[k]) metaSame = false;
    u.lessons.forEach((l, n) => {
      const b = base.lessons[n];
      if (l === b) return;
      changed.push(`${l.id}:${l.steps[0].type}`);
      if (l.steps.length !== b.steps.length) restSame = false;
      for (let s = 1; s < b.steps.length; s++) if (l.steps[s] !== b.steps[s]) restSame = false;
      for (const k of Object.keys(b)) if (k !== "steps" && l[k] !== b[k]) restSame = false;
    });
    const cta = {};
    for (const id of ["u2l2", "u2l4", "u2l9"]) {
      const l = u.lessons.find((x) => x.id === id), b = base.lessons.find((x) => x.id === id);
      cta[id] = l.steps[0].cta === b.steps[0].cta;
    }
    return { changed: changed.join(","), restSame, metaSame, ss: sessionStorage.getItem("ss.u2intro"), cta, ctaL2: u.lessons.find((x) => x.id === "u2l2").steps[0].cta };
  }, APP_IMPORT);
  ok(on.changed === "u2l2:opener,u2l4:opener,u2l9:opener", `바뀐 레슨은 셋뿐(${on.changed})`);
  ok(on.restSame && on.metaSame, "바뀐 레슨의 나머지 스텝과 머리 정보, 단원의 머리 정보는 정본과 같은 객체");
  ok(on.cta.u2l4 && on.cta.u2l9 && on.ctaL2 === "세포 속 구조 알아보기", `샘플 도입 끝의 버튼 글: u2l4와 u2l9는 정본과 같고 u2l2는 '부품'을 '구조'로 맞췄다("${on.ctaL2}")`);
  ok(on.ss === "1", "세션에 토글이 남는다");
  await page.goto(`${L.BASE}/`, { waitUntil: "domcontentloaded" });
  await L.W(page, 900);
  ok(await page.evaluate(async (src) => (await eval(src)("/src/content/unit2intro.ts")).U2_INTRO_ON, APP_IMPORT), "같은 탭에서 표식 없이 다시 열어도 켜져 있다");
  await page.goto(`${L.BASE}/?u2intro=0`, { waitUntil: "domcontentloaded" });
  await L.W(page, 900);
  const back = await page.evaluate(async (src) => {
    const imp = eval(src);
    const c = await imp("/src/content/curriculum.ts");
    const v5 = await imp("/src/content/unit2v5.ts");
    return { same: c.CURRICULUM.find((x) => x.id === "u2") === v5.UNIT2_V5, ss: sessionStorage.getItem("ss.u2intro") };
  }, APP_IMPORT);
  ok(back.same && back.ss === null, "?u2intro=0 으로 끄면 정본 그대로 돌아오고 세션 표식이 지워진다");
  ok(errors.length === 0, `페이지 오류 없음 ${JSON.stringify(errors)}`);
  await browser.close();
}

// ── C. 세 샘플을 여러 길로 ─────────────────────────────────────────
console.log("C. 세 샘플을 끝까지");
{
  const { browser, page, errors } = await L.launch({ query: null });
  const after = async (S, tag) => {
    const st = await L.ctaState(page);
    ok(st.enabled && st.text === S.cta, `${tag} 끝나면 아래 버튼 열림("${st.text}")`);
    await grab(page, tag);
    await L.cta(page);
    const nxt = await page.evaluate(() => {
      const s = document.querySelector(".screen.active .step");
      return { opener: s.classList.contains("opn-step"), lab: s.classList.contains("bv-step"), title: (s.querySelector(".bv-title, .h1")?.textContent ?? "").trim() };
    });
    return nxt;
  };

  // u2l4 유난히 긴 세포
  const S4 = L.SAMPLES.find((s) => s.id === "u2l4");
  for (const [pick, how, cm] of [["손가락", "drag", "7"], ["한 뼘", "key", "20"], ["다리", "tap", "100"]]) {
    await L.openSample(page, "u2l4");
    const tag = `u2l4 ${how} "${pick}"`;
    ok((await L.ctaState(page)).enabled === false, `${tag} 처음에는 아래 버튼이 잠겨 있다`);
    const marks = [];
    await L.playLongCell(page, { pick, how, on: async (m) => { marks.push(m); await grab(page, `${tag} ${m}`); } });
    ok((await L.ds(page, "opnPred")) === cm, `${tag} 고른 예측이 기록됨(${cm} cm)`);
    ok((await L.ds(page, "opnCm")) === "100", `${tag} 100 cm까지 따라감`);
    const said = await page.evaluate(() => document.querySelector(".screen.active .opn-bubble").textContent);
    ok(pick === "다리" ? said.includes("예측대로") : pick === "손가락" ? said.includes("열네 배") : said.includes("다섯 배"), `${tag} 맺는 말이 내 예측과 견준다`);
    ok(said.includes("무슨 일을 맡았을까요"), `${tag} 맺는 말이 아래 버튼(일 맡기기)으로 이어진다`);
    const nxt = await after(S4, tag);
    ok(nxt.lab && nxt.title === "세포마다 왜 모양이 다를까?", `${tag} 다음 스텝은 정본의 랩("${nxt.title}")`);
  }
  // 예측 전에는 밀리지 않는다
  await L.openSample(page, "u2l4");
  {
    const a = await L.stagePt(page, 860, 440), b = await L.stagePt(page, 400, 440);
    await L.drag(page, a, b, 6);
    ok((await L.ds(page, "opnCm")) === "0" && (await L.ds(page, "opnPhase")) === "ask", "u2l4 예측하기 전에는 밀어도 움직이지 않는다");
  }
  // 랩에서 되돌아오면 도입이 처음부터 다시 선다
  await L.playLongCell(page, { pick: "한 뼘", how: "key" });
  await L.cta(page);
  await page.evaluate(() => document.querySelector(".screen.active [aria-label='이전 단계']")?.click());
  await L.waitPhase(page, "ask");
  const again = await page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    return { opener: s.classList.contains("opn-step"), phase: s.dataset.opnPhase, cm: s.dataset.opnCm, choices: s.querySelectorAll(".hook-choice:not(:disabled)").length };
  });
  ok(again.opener && again.phase === "ask" && again.cm === "0" && again.choices === 3, `u2l4 랩에서 되돌아오면 도입이 처음 화면으로 선다(${JSON.stringify(again)})`);

  // u2l9 두 바구니
  const S9 = L.SAMPLES.find((s) => s.id === "u2l9");
  for (const [first, how, againSame] of [["plant", "drag", false], ["animal", "tap", true], ["animal", "drag", false]]) {
    await L.openSample(page, "u2l9");
    const tag = `u2l9 ${how} ${first} 먼저`;
    ok((await L.ctaState(page)).enabled === false, `${tag} 처음에는 아래 버튼이 잠겨 있다`);
    await L.playBaskets(page, { first, how, again: againSame, on: async (m) => grab(page, `${tag} ${m}`) });
    const tried = await L.ds(page, "opnTried");
    ok(tried === (first === "plant" ? "plant,animal" : "animal,plant"), `${tag} 두 바구니에 모두 넣어 봄(${tried})`);
    const marks = await page.evaluate(() => {
      const st = document.querySelector(".screen.active .opn-stage");
      const caps = [...st.querySelectorAll(".opn-bk-no")].filter((e) => Number(getComputedStyle(e).opacity) > 0.9).map((e) => e.textContent.trim());
      return { both: st.classList.contains("both"), caps: caps.join("|"), choices: document.querySelectorAll(".screen.active .hook-choice").length };
    });
    ok(marks.both && marks.caps === "광합성을 못 해요|스스로 움직이지 못해요", `${tag} 두 바구니 위에 돌려보낸 까닭이 남음(${marks.caps})`);
    ok(marks.choices === 0, `${tag} 보기 예측 없이 끝난다(놓는 일이 예측이다)`);
    const nxt = await after(S9, tag);
    ok(nxt.lab && nxt.title === "이 생물은 어느 계일까?", `${tag} 다음 스텝은 정본의 랩("${nxt.title}")`);
  }
  // 가운데에 놓으면 제자리로
  await L.openSample(page, "u2l9");
  {
    const a = await L.stagePt(page, 480, 700), b = await L.stagePt(page, 500, 300);
    await L.drag(page, a, b, 6);
    await L.W(page, 500);
    ok((await L.ds(page, "opnTried")) === "", "u2l9 두 바구니 사이에 놓으면 아무 일도 없이 제자리로 돌아온다");
    const c2 = await L.stagePt(page, 236, 700);
    await L.drag(page, a, c2, 6);
    await L.W(page, 500);
    ok((await L.ds(page, "opnTried")) === "", "u2l9 바구니 높이까지 올리지 않고 놓으면 제자리로 돌아온다");
  }

  // u2l2 빵 공장
  const S2 = L.SAMPLES.find((s) => s.id === "u2l2");
  for (const [how, order, swap, pick, verdict] of [["card", ["door", "ctrl", "gen"], false, "통제실", "예측대로"], ["stage", ["gen", "door", "ctrl"], true, "발전기", "기계가 멎었죠"], ["card", ["ctrl", "gen", "door"], true, "출입문", "반죽이 떨어졌죠"]]) {
    await L.openSample(page, "u2l2");
    const tag = `u2l2 ${how} ${order.join(">")}${swap ? " 바로 바꿔 멈추기" : ""} "${pick}"`;
    ok((await L.ctaState(page)).enabled === false, `${tag} 처음에는 아래 버튼이 잠겨 있다`);
    const pre = await page.evaluate(() => {
      document.querySelector(".screen.active .opn-fc-hit[data-key=gen]")?.click();
      const s = document.querySelector(".screen.active .step");
      return { off: s.dataset.opnOff, cards: [...s.querySelectorAll(".opn-fc-card")].filter((e) => e.getClientRects().length).length };
    });
    ok(pre.off === "" && pre.cards === 0, `${tag} 예측하기 전에는 시설이 멈추지 않고 카드도 없다`);
    const offs = [];
    await L.playFactory(page, {
      how, order, swap, pick,
      on: async (m) => {
        await grab(page, `${tag} ${m}`);
        if (m.startsWith("off-")) {
          const st = await page.evaluate(() => {
            const s = document.querySelector(".screen.active .opn-stage");
            return ["door", "ctrl", "gen"].filter((k) => s.classList.contains(`off-${k}`)).join(",");
          });
          offs.push(st);
        }
      },
    });
    ok(offs.join("|") === order.join("|"), `${tag} 한 번에 하나만 멈춘다(${offs.join("|")})`);
    ok((await L.ds(page, "opnTried")) === "door,ctrl,gen" && (await L.ds(page, "opnOff")) === "", `${tag} 셋을 다 멈춰 보고 다시 살림`);
    const said = await page.evaluate(() => document.querySelector(".screen.active .opn-bubble").textContent);
    ok(said.includes(verdict) && said.includes("세포"), `${tag} 맺는 말이 내 예측과 견주고 세포로 넘긴다`);
    const nxt = await after(S2, tag);
    ok(!nxt.opener && !nxt.lab && nxt.title.includes("세포 속 3종 세트"), `${tag} 다음 스텝은 정본의 개념("${nxt.title}")`);
  }
  // 조작 도중에 다른 레슨으로 떠나도 예약된 일이 남지 않는다
  await L.openSample(page, "u2l2");
  await L.choose(page, 0);
  await L.W(page, 300);
  await page.evaluate(() => document.querySelector(".screen.active .opn-fc-card[data-key=door]")?.click());
  await L.openSample(page, "u2l9");
  await page.evaluate(() => document.querySelector(".screen.active .opn-bk-hit[data-side=plant]")?.click());
  await L.W(page, 200);
  await L.openSample(page, "u2l4");
  await L.W(page, 1800);
  ok(errors.length === 0, `C 구역 페이지 오류 없음 ${JSON.stringify(errors)}`);
  await browser.close();
}

// ── D. 실사용 경로 ─────────────────────────────────────────────────
console.log("D. 스플래시부터 실제 클릭과 마우스 끌기로");
{
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
      lastUnits: { "sci:g1": "u2" },
    }));
  });
  const A = ".screen.active";
  const boot = async () => {
    await page.goto(`${L.BASE}/?u2intro`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#sc-splash", { timeout: 8000 });
    await L.W(page, 500);
    await page.mouse.click(195, 300);
    const browse = page.locator("button", { hasText: "한번 둘러보기" }).first();
    await browse.waitFor({ state: "visible", timeout: 8000 });
    await browse.click();
    await page.waitForSelector("#sc-home", { timeout: 8000 });
    await L.W(page, 700);
  };
  const openNode = async (i) => {
    const nodes = page.locator("#sc-home .gm-node:not(.exam)");
    await nodes.nth(i).waitFor({ state: "visible", timeout: 8000 });
    await nodes.nth(i).scrollIntoViewIfNeeded();
    await nodes.nth(i).click();
    await L.W(page, 1200);
  };
  const clearSnack = () => page.evaluate(() => document.querySelectorAll(".snack, .toast").forEach((e) => e.remove()));

  // u2l2: 지도에서 들어가 카드를 실제로 누른다
  await boot();
  await openNode(1);
  ok(await page.evaluate(() => document.querySelector(".screen.active .step")?.dataset.opnScene === "factory"), "지도에서 2번 레슨을 열면 샘플 도입(빵 공장)이 선다");
  await L.waitPhase(page, "ask");
  await clearSnack();
  await page.locator(`${A} .hook-choice`).first().click();
  await L.waitPhase(page, "play");
  await L.W(page, 400);
  for (const key of ["door", "ctrl", "gen"]) {
    await page.locator(`${A} .opn-fc-card[data-key=${key}]`).click();
    await L.W(page, 900);
    await page.locator(`${A} .opn-fc-card[data-key=${key}]`).click();
    await L.W(page, 400);
  }
  await L.waitPhase(page, "done");
  await L.W(page, 500);
  await page.locator(`${A} .btn.cta`).click();
  await L.W(page, 700);
  ok(await page.evaluate(() => !document.querySelector(".screen.active .step").classList.contains("opn-step")), "u2l2 실제 클릭으로 끝까지, 아래 버튼으로 다음 스텝");

  // u2l4: 예측 보기를 실제로 누르고 마우스로 민다
  await boot();
  await openNode(3);
  ok(await page.evaluate(() => document.querySelector(".screen.active .step")?.dataset.opnScene === "longcell"), "지도에서 4번 레슨을 열면 샘플 도입(유난히 긴 세포)이 선다");
  await L.waitPhase(page, "ask");
  await clearSnack();
  await page.locator(`${A} .hook-choice`).nth(1).click();
  await L.waitPhase(page, "pull");
  let guard = 0;
  while ((await L.ds(page, "opnPhase")) === "pull" && guard++ < 40) {
    const a = await L.stagePt(page, 860, 440), b = await L.stagePt(page, 380, 440);
    await L.drag(page, a, b, 10);
    await L.W(page, 250);
  }
  ok((await L.ds(page, "opnPhase")) === "done" && (await L.ds(page, "opnCm")) === "100", `u2l4 마우스 끌기 ${guard}번으로 발끝까지`);
  ok(guard >= 3, `u2l4 한 번에 끝나지 않는다(끌기 ${guard}번: 길이를 손으로 겪는다)`);
  await page.locator(`${A} .btn.cta`).click();
  await L.W(page, 700);
  ok(await page.evaluate(() => document.querySelector(".screen.active .step").classList.contains("bv-step")), "u2l4 아래 버튼으로 랩이 열린다");

  // u2l9: 버섯을 마우스로 끌어다 놓는다
  await boot();
  await openNode(8);
  ok(await page.evaluate(() => document.querySelector(".screen.active .step")?.dataset.opnScene === "baskets"), "지도에서 9번 레슨을 열면 샘플 도입(두 바구니)이 선다");
  await L.waitPhase(page, "play");
  await clearSnack();
  for (const x of [236, 724]) {
    const box = await page.locator(`${A} .opn-bk-mush`).boundingBox();
    const to = await L.stagePt(page, x, 270);
    await L.drag(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, to, 10);
    await L.waitFor(page, () => !document.querySelector(".screen.active .opn-stage").classList.contains("busy"), null, 60, 50);
    await L.W(page, 300);
  }
  await L.waitPhase(page, "done");
  ok((await L.ds(page, "opnTried")) === "plant,animal", "u2l9 버섯을 실제로 끌어다 두 바구니에 넣어 봄");
  await L.W(page, 400);
  await page.locator(`${A} .btn.cta`).click();
  await L.W(page, 700);
  ok(await page.evaluate(() => document.querySelector(".screen.active .step").classList.contains("bv-step")), "u2l9 아래 버튼으로 랩이 열린다");

  // 샘플이 아닌 레슨은 그대로
  await boot();
  await openNode(2);
  ok((await L.stepType(page)) === "hook", "샘플이 아닌 3번 레슨은 지금 도입(hook) 그대로");
  ok(errors.length === 0, `D 구역 페이지 오류 없음 ${JSON.stringify(errors)}`);
  await browser.close();
}

// ── E. 화면 글 ─────────────────────────────────────────────────────
console.log(`E. 화면에 뜬 글 ${seen.size}개의 언어 검사`);
{
  const RULES = [
    ["대시", /[—–]|(?<=[가-힣.!?)])\s-\s(?=[가-힣(])/],
    ["이모지", /\p{Extended_Pictographic}/u],
    ["'교과서'", /교과서/],
    ["'분자'", /분자/],
    ["'미토콘드리아' 표기", /미토콘드리아/],
    ["금지 개념", /자연선택|진화/],
    ["이 책에 없는 구조 이름", /세포질|액포|리보솜|소포체|골지|리소좀|염색체|소기관|축삭|가지돌기|뉴런|척수/],
    ["'스틱맨'", /스틱맨/],
    ["제작자만 아는 말", /훅|랩|토글|스텝|무대|샘플/],
  ];
  const bad = [];
  for (const [key, where] of seen) {
    const [sel, t] = [key.slice(0, key.indexOf("|")), key.slice(key.indexOf("|") + 1)];
    for (const [name, re] of RULES) if (re.test(t)) bad.push(`${name}: "${t}" (${where})`);
    // 쌤의 말과 질문은 해요체(문장 끝이 '다.'로 끝나면 안 된다)
    if (sel === ".opn-bubble" || sel === ".hook-q") {
      for (const sent of t.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean)) if (/[가-힣]다$/.test(sent)) bad.push(`해요체 아님: "${sent}" (${where})`);
    }
  }
  ok(bad.length === 0, `화면 글 위반 없음 ${bad.length ? "\n      " + bad.join("\n      ") : ""}`);
  ok(seen.size >= 40, `검사한 글 ${seen.size}개(40개 이상)`);
}

console.log(`\n실플레이 검사: ${PASS}/${PASS + FAIL} 통과`);
if (FAIL) {
  console.log(fails.join("\n"));
  process.exit(1);
}
