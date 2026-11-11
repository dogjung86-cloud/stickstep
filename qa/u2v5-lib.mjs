// 중1 Ⅱ v5 검증 공용 부품: 부팅, 레슨 열기, 측정, 랩 열세 판의 조작.
// 한 화면 검사(check-u2v5-fit), 실플레이(e2e-u2v5), 눈검수 캡처(shot-u2v5)가 같은 조작을 쓴다.
// 레슨은 CURRICULUM에서 꺼내 연다(v5가 정본으로 실려 있는지까지 함께 본다. 2026-11-11에 병행 토글을 없앴다).
import { chromium } from "playwright-core";

export const PORT = process.env.PORT || "5547";
export const BUDGET = 554; // 390×700 화면의 스크롤 영역 높이

export async function launch({ width = 390, height = 700 } = {}) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
  });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  return { browser, page, errors };
}

/** 레슨 열기(li: 0부터). 스텝 타입 목록을 돌려준다. */
export const openLesson = (page, li) =>
  page.evaluate(async (i) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const c = await import("/src/content/curriculum.ts");
    const u = c.CURRICULUM.find((x) => x.id === "u2");
    nav.reset(createLessonPlayer(u.lessons[i], { onExit: () => {}, onComplete: () => {} }));
    await new Promise((r) => setTimeout(r, 600));
    return { id: u.lessons[i].id, types: u.lessons[i].steps.map((s) => s.type) };
  }, li);

/** 검토 모드의 앞으로 가기로 si번 스텝까지 건너간다(랩만 따로 볼 때). */
export async function goStep(page, si) {
  for (let i = 0; i < si; i++) {
    await page.waitForTimeout(430);
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  }
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelectorAll(".snack, .toast").forEach((e) => e.remove()));
}

export const W = (page, ms) => page.waitForTimeout(ms);
export const cta = async (page) => {
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
  await page.waitForTimeout(520);
};
export const ctaState = (page) =>
  page.evaluate(() => {
    const b = document.querySelector(".screen.active .btn.cta");
    return { text: b?.textContent?.trim() ?? "", enabled: !!b && !b.disabled };
  });
export const tap = (page, sel) =>
  page.evaluate((s) => {
    const e = document.querySelector(`.screen.active ${s}`);
    if (!e) return false;
    e.click();
    return true;
  }, sel);
export const waitFor = async (page, fn, arg, tries = 80, gap = 150) => {
  for (let i = 0; i < tries; i++) {
    if (await page.evaluate(fn, arg)) return true;
    await page.waitForTimeout(gap);
  }
  return false;
};
/** 랩 스텝의 data-* 값. */
export const ds = (page, key) => page.evaluate((k) => document.querySelector(".screen.active .step.bv-step")?.dataset[k] ?? null, key);
export const waitDs = (page, key, val, tries = 80) =>
  waitFor(page, ({ k, v }) => document.querySelector(".screen.active .step.bv-step")?.dataset[k] === v, { k: key, v: val }, tries);
export const setRange = (page, sel, v, change = true) =>
  page.evaluate(({ s, v, change }) => {
    const e = document.querySelector(`.screen.active ${s}`);
    if (!e) return false;
    e.value = String(v);
    e.dispatchEvent(new Event("input", { bubbles: true }));
    if (change) e.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }, { s: sel, v, change });

// ── 랩 판정 상자 ────────────────────────────────────────────────────
export const askText = (page) => page.evaluate(() => {
  const q = document.querySelector(".screen.active .bv-q.show .bv-qt");
  return q && q.offsetParent !== null ? q.textContent.trim() : "";
});
/** 판정 질문이 뜰 때까지(prev와 다른 질문이 뜰 때까지) 기다린다. */
export const waitAsk = (page, prev = "") =>
  waitFor(page, (p) => {
    const q = document.querySelector(".screen.active .bv-q.show .bv-qt");
    const live = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].some((b) => !b.disabled);
    return !!q && q.offsetParent !== null && live && q.textContent.trim() !== p;
  }, prev);
const pickBy = (page, okVal) =>
  page.evaluate((v) => {
    const b = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].filter((x) => !x.disabled && x.offsetParent !== null).find((x) => x.dataset.ok === v);
    if (!b) return "";
    const t = b.textContent.trim();
    b.click();
    return t;
  }, okVal);
export const pickWrong = (page) => pickBy(page, "0");
/** 판정 카드의 '다음'이 뜰 때까지 기다렸다가 누른다. */
export const tapNext = async (page) => {
  await waitFor(page, () => {
    const b = document.querySelector(".screen.active .bv-q.show .bv-next");
    return !!b && !b.disabled && b.offsetParent !== null;
  });
  return tap(page, ".bv-q.show .bv-next");
};
/** 맞는 보기를 누르고 '다음'까지 누른다(맞혀도 '다음'을 눌러야 넘어간다). 고른 글을 돌려준다. */
export const pickRight = async (page) => {
  const t = await pickBy(page, "1");
  await W(page, 350);
  await tapNext(page);
  return t;
};
export const pickText = (page, text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].filter((x) => !x.disabled && x.offsetParent !== null).find((x) => x.textContent.includes(t));
    if (!b) return false;
    b.click();
    return true;
  }, text);
/** 답한 뒤의 모습(kind: "miss" 오답, "ok" 정답): 누른 보기에 결과가 새겨졌는가, 바로 아래에 카드가 붙었는가,
 *  다른 보기는 접혔는가, '다음'이 있는가. 색은 화면에 그려진 값으로 읽는다(빨강인지 초록인지). */
const verdictCard = (page, kind) =>
  page.evaluate((k) => {
    const q = document.querySelector(".screen.active .bv-q.show");
    const mine = q?.querySelector(`.bv-choice.${k}`);
    const card = q?.querySelector(".bv-ans");
    const next = card?.querySelector(".bv-next");
    const others = [...(q?.querySelectorAll(".bv-choice") ?? [])].filter((b) => b !== mine);
    const r = next?.getBoundingClientRect();
    const rgb = (e, prop) => (e ? getComputedStyle(e)[prop].match(/\d+/g).slice(0, 3).map(Number) : [0, 0, 0]);
    const hue = ([r0, g0, b0]) => (r0 > g0 + 60 && r0 > b0 + 60 ? "red" : g0 > r0 + 40 && g0 > b0 + 20 ? "green" : "other");
    const ic = mine?.querySelector(".bv-vd-ic");
    return {
      has: !!mine && !!card,
      adjacent: !!mine && mine.nextElementSibling === card,
      othersGone: others.every((b) => b.offsetParent === null),
      word: mine?.querySelector(".bv-vd")?.textContent?.trim() ?? "",
      mine: mine?.querySelector(".bv-choice-t")?.textContent?.trim() ?? "",
      icon: !!ic?.querySelector("svg") && ic.getBoundingClientRect().width >= 20,
      rowHue: hue(rgb(mine, "borderTopColor")),
      iconHue: hue(rgb(ic, "backgroundColor")),
      cardHue: hue(rgb(card, "backgroundColor")),
      answerShown: !!card?.querySelector(".bv-ans-t"),
      answer: card?.querySelector(".bv-ans-t")?.textContent?.trim() ?? "",
      why: card?.querySelector(".bv-why")?.textContent?.trim() ?? "",
      nextH: r ? Math.round(r.height) : 0,
    };
  }, kind);
export const wrongCard = (page) => verdictCard(page, "miss");
export const rightCard = (page) => verdictCard(page, "ok");
export const concluded = (page) => page.evaluate(() => {
  const d = document.querySelector(".screen.active .bv-done.show");
  return d && d.offsetParent !== null ? d.textContent.trim() : "";
});
export const waitDone = (page) => waitFor(page, () => !!document.querySelector(".screen.active .bv-done.show"));

// ── 측정 ────────────────────────────────────────────────────────────
/** 지금 화면의 치수와 규칙 위반 후보를 잰다. */
export const measure = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    const wrap = document.querySelector(".screen.active .stepWrap");
    const top0 = sc.getBoundingClientRect().top;
    const box = (sel) => {
      const e = wrap.querySelector(sel);
      if (!e) return null;
      const b = e.getBoundingClientRect();
      return { top: Math.round(b.top - top0 + sc.scrollTop), h: Math.round(b.height), w: Math.round(b.width) };
    };
    const vis = (e) => {
      if (e.offsetParent === null && !(e instanceof SVGElement)) return false;
      const cs = getComputedStyle(e);
      if (cs.visibility === "hidden" || cs.display === "none") return false;
      for (let p = e; p && p !== wrap; p = p.parentElement) if (Number(getComputedStyle(p).opacity) < 0.05) return false;
      return true;
    };
    const helper = wrap.querySelector(".bv-helper");
    const slot = wrap.querySelector(".bv-slot");
    const stage = wrap.querySelector(".bv-stage");
    // 누르는 곳: 조작 칸 안의 살아 있는 버튼과 막대
    const taps = [...wrap.querySelectorAll(".bv-slot button, .bv-slot input[type=range]")]
      .filter((e) => vis(e) && !e.disabled && !e.hidden)
      .map((e) => {
        const r = e.getBoundingClientRect();
        return { h: Math.round(r.height), w: Math.round(r.width), t: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 16) };
      });
    // 잘린 글자(한 줄 말줄임)
    const cut = [...wrap.querySelectorAll(".bv-choice-t, .bv-ans-t, .bv-card b, .bv-card i, .bv-title, .bv-btn")]
      .filter(vis)
      .filter((e) => e.scrollWidth > e.clientWidth + 1)
      .map((e) => e.textContent.trim());
    // 무대 안 글자 크기(화면에 보이는 실제 px)
    let minFont = 99;
    let minFontText = "";
    if (stage) {
      [...stage.querySelectorAll("*")].forEach((e) => {
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own || !vis(e)) return;
        const fs = parseFloat(getComputedStyle(e).fontSize);
        let k = 1;
        if (e instanceof SVGElement) {
          const svg = e.ownerSVGElement;
          const vb = svg?.viewBox?.baseVal;
          if (svg && vb && vb.width) k = svg.getBoundingClientRect().width / vb.width;
        } else {
          const r = e.getBoundingClientRect();
          if (e.offsetWidth) k = r.width / e.offsetWidth;
        }
        const px = fs * k;
        if (px < minFont) {
          minFont = px;
          minFontText = e.textContent.trim().slice(0, 14);
        }
      });
    }
    return {
      usable: sc.clientHeight,
      total: wrap.scrollHeight,
      stage: box(".bv-stage"),
      slot: box(".bv-slot"),
      helperOver: helper ? helper.scrollHeight > helper.clientHeight + 1 : false,
      helperText: helper?.textContent?.trim() ?? "",
      slotOver: slot ? slot.scrollHeight > slot.clientHeight + 1 : false,
      taps,
      cut,
      minFont: Math.round(minFont * 10) / 10,
      minFontText,
      frameScroll: document.querySelector("#frame")?.scrollTop ?? 0,
      curio: !!wrap.querySelector(".curio"),
    };
  });

// ── 랩 조작 ─────────────────────────────────────────────────────────
// on(label)은 그 시점에 부르는 콜백(측정, 캡처, 검사). wrong이면 채점 판정을 일부러 틀린다.
const noop = async () => {};

/** 판정 한 번: 맞히거나 틀린다. 어느 쪽이든 결과가 뜬 화면에서 on("...-wrong" 또는 "...-right")을 부른 뒤 '다음'을 누른다. */
async function answer(page, wrong, on, label) {
  await on(label);
  await pickBy(page, wrong ? "0" : "1");
  await W(page, 550);
  await on(`${label}-${wrong ? "wrong" : "right"}`);
  await tapNext(page);
}

/** u2l1 확대 랩. */
export async function playMagnify(page, { wrong = false, on = noop } = {}) {
  await on("mount");
  await setRange(page, ".mgf-range", 1000);
  await W(page, 350);
  await on("onion-max");
  await tap(page, '.bv-card[data-k="cork"]');
  await W(page, 300);
  await setRange(page, ".mgf-range", 1000);
  await W(page, 350);
  await on("cork-max");
  await tap(page, '.bv-card[data-k="salt"]');
  await waitAsk(page);
  await W(page, 300);
  await on("predict");
  await pickText(page, "칸이 보이지 않을");
  await waitFor(page, () => !document.querySelector(".screen.active .bv-q.show"));
  await W(page, 200);
  await setRange(page, ".mgf-range", 1000);
  await W(page, 300);
  await on("salt-max");
  await waitAsk(page);
  await W(page, 350);
  await answer(page, wrong, on, "ask");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** u2l2 세포 구조 랩(mode: animal | plant). */
export async function playCellWork(page, mode, { wrong = false, on = noop } = {}) {
  const keys = mode === "plant" ? ["chl", "wall"] : ["mem", "nuc", "mito"];
  await on("mount");
  for (const k of keys) {
    await tap(page, `.bv-card[data-k="${k}"]`);
    await W(page, k === "mem" || k === "chl" ? 1700 : 900);
    await on(`off-${k}`);
  }
  await waitFor(page, () => {
    const b = document.querySelector(".screen.active .cwk-diag");
    return !!b && !b.hidden;
  });
  await W(page, 200);
  await on("tried");
  await tap(page, ".cwk-diag");
  await waitAsk(page);
  await W(page, 500);
  const q1 = await askText(page);
  await answer(page, wrong, on, "ask");
  await waitAsk(page, q1);
  await W(page, 500);
  await answer(page, false, on, "ask2");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** u2l3 표본 만들기 랩. order이면 차례를 일부러 틀려 보고, fast이면 덮개 유리를 한 번 빨리 덮는다. */
export async function playSlide(page, { wrong = false, fast = false, order = false, on = noop } = {}) {
  const idle = () => waitDs(page, "sbdBusy", "0");
  const stage = (n) => waitDs(page, "sbdStage", String(n));
  await on("mount");
  if (order) {
    await tap(page, '.bv-card[data-k="cover"]');
    await W(page, 900);
    await on("early-cover");
    await idle();
    await tap(page, '.bv-card[data-k="stain"]');
    await W(page, 1700);
    await on("early-stain");
    await idle();
    await tap(page, '.bv-card[data-k="paper"]');
    await W(page, 300);
    await on("early-paper");
  }
  await tap(page, '.bv-card[data-k="swab"]');
  await W(page, 800);
  await on("swab");
  await stage(1);
  await idle();
  if (order) {
    await tap(page, '.bv-card[data-k="cover"]');
    await W(page, 900);
    await on("nostain-cover");
    await idle();
  }
  await tap(page, '.bv-card[data-k="stain"]');
  await W(page, 1500);
  await on("staining");
  await stage(2);
  await idle();
  await on("stained");
  await tap(page, '.bv-card[data-k="cover"]');
  await W(page, 400);
  await on("cover");
  if (fast) {
    await setRange(page, ".sbd-range", 100, false);
    await W(page, 500);
    await on("bubble");
    await tap(page, ".sbd-retry");
    await W(page, 350);
  }
  // 천천히: 뒤쪽 60%를 0.7초 넘게 걸려 내린다
  for (const v of [12, 25, 38, 50, 62, 74, 86, 100]) {
    await setRange(page, ".sbd-range", v, false);
    await W(page, 230);
    if (v === 50) await on("lowering");
  }
  await W(page, 300);
  await on("covered");
  await stage(3);
  await idle();
  await W(page, 200);
  await on("tools");
  await tap(page, '.bv-card[data-k="paper"]');
  await W(page, 1150);
  await on("paper");
  await stage(4);
  await W(page, 300);
  await on("complete");
  await waitAsk(page);
  await W(page, 350);
  await answer(page, wrong, on, "ask");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** 지금 표본에서 시야 가운데에 가까운 핵을 누른다(랩이 data-scp-nuc로 자리를 알려 준다). */
export const tapNucleus = (page) =>
  page.evaluate(() => {
    const host = document.querySelector(".screen.active .step.bv-step");
    const v = host?.dataset.scpNuc;
    if (!host || !v) return false;
    const [x, y] = v.split(",").map(Number);
    const fd = host.querySelector(".scp-field");
    const r = fd.getBoundingClientRect();
    fd.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: r.left + (r.width * x) / 100, clientY: r.top + (r.height * y) / 100 }));
    return true;
  });
export const tapField = (page, x, y) =>
  page.evaluate(({ x, y }) => {
    const fd = document.querySelector(".screen.active .scp-field");
    const r = fd.getBoundingClientRect();
    fd.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: r.left + (r.width * x) / 100, clientY: r.top + (r.height * y) / 100 }));
  }, { x, y });

/** u2l3 현미경 비교 랩. miss이면 빗나간 조작(흐린 채 손 떼기, 엉뚱한 곳 누르기, 틀린 버튼)도 해 본다. */
export async function playScope(page, { wrong = false, miss = false, on = noop } = {}) {
  await on("mount");
  if (miss) {
    await setRange(page, ".scp-range", 30);
    await W(page, 350);
    await on("blurry");
  }
  await setRange(page, ".scp-range", 64);
  await waitDs(page, "scpPhase", "hunt");
  await W(page, 400);
  await on("hunt");
  if (miss) {
    await tapField(page, 58, 60);
    await W(page, 300);
    await on("miss");
    await tap(page, ".scp-no");
    await W(page, 300);
    await on("no-wrong");
  }
  await tapNucleus(page);
  await W(page, 550);
  await on("cheek-found");
  await tap(page, '.bv-card[data-k="water"]');
  await W(page, 600);
  await on("water");
  if (miss) {
    await tapField(page, 50, 44);
    await W(page, 300);
    await on("water-miss");
  }
  await tap(page, ".scp-no");
  await W(page, 550);
  await on("water-solved");
  await tap(page, '.bv-card[data-k="stain"]');
  await W(page, 900);
  await on("staining");
  await waitDs(page, "scpWait", "0");
  await W(page, 300);
  await on("stained");
  await tapNucleus(page);
  await W(page, 550);
  await on("solved");
  await tap(page, ".scp-cmp");
  await waitAsk(page);
  await W(page, 450);
  const q1 = await askText(page);
  await answer(page, wrong, on, "ask");
  await waitAsk(page, q1);
  await W(page, 450);
  await answer(page, false, on, "ask2");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

const btnShown = (page, sel) =>
  waitFor(page, (q) => {
    const b = document.querySelector(`.screen.active ${q}`);
    return !!b && !b.hidden && b.offsetParent !== null;
  }, sel);
const askGone = (page) => waitFor(page, () => !document.querySelector(".screen.active .bv-q.show"));

/** u2l4 세포 모양 랩. miss이면 일마다 알맞지 않은 세포부터 맡겨 본다. */
export async function playCellFit(page, { wrong = false, miss = false, on = noop } = {}) {
  const JOBS = [["nerve", ["rbc", "epi"]], ["rbc", ["nerve", "epi"]], ["epi", ["rbc", "nerve"]]];
  await on("mount");
  for (let j = 0; j < 3; j++) {
    const [right, others] = JOBS[j];
    await waitDs(page, "cftJob", String(j));
    if (miss) {
      for (const c of others) {
        await tap(page, `.bv-card[data-k="${c}"]`);
        await waitDs(page, "cftBusy", "0");
        await W(page, 300);
        await on(`job${j + 1}-${c}-fail`);
      }
    }
    await tap(page, `.bv-card[data-k="${right}"]`);
    await W(page, 700);
    await on(`job${j + 1}-run`);
    await waitDs(page, "cftSolved", "1");
    await W(page, 300);
    await on(`job${j + 1}-ok`);
    await tap(page, ".cft-next");
    await W(page, 450);
  }
  await waitAsk(page);
  await W(page, 400);
  await answer(page, wrong, on, "ask");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** u2l5 구성 단계 랩: 두 계단을 끝까지 쌓고 견준다. */
export async function playLevelBuild(page, { wrong = false, on = noop } = {}) {
  await on("mount");
  for (const route of ["animal", "plant"]) {
    if (route === "plant") {
      await tap(page, '.bv-card[data-k="plant"]');
      await waitDs(page, "blvRoute", "plant");
      await W(page, 350);
      await on("plant-0");
    }
    for (const v of [100, 200, 300, 400]) {
      await setRange(page, ".blv-range", v - 45, false);
      await W(page, 160);
      if (v === 200 || v === 400) await on(`${route}-moving-${v / 100}`);
      await setRange(page, ".blv-range", v, true);
      await waitDs(page, "blvLevel", String(v / 100));
      await W(page, 280);
      await on(`${route}-${v / 100}`);
    }
  }
  await btnShown(page, ".blv-cmp");
  await W(page, 250);
  await on("both");
  await tap(page, ".blv-cmp");
  await waitAsk(page);
  await W(page, 450);
  const q1 = await askText(page);
  await answer(page, wrong, on, "ask");
  await waitAsk(page, q1);
  await W(page, 450);
  await answer(page, false, on, "ask2");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** u2l6 생물다양성 랩. miss이면 습지를 되돌렸다가 다시 바꿔 본다. */
export async function playEcoMap(page, { wrong = false, miss = false, on = noop } = {}) {
  await on("mount");
  await tap(page, '.bv-card[data-k="wet"]');
  await waitAsk(page);
  await W(page, 300);
  await on("predict");
  await pickText(page, miss ? "그대로다" : "늘어난다");
  await askGone(page);
  await waitDs(page, "empEnv", "2");
  await W(page, 700);
  await on("wet-on");
  if (miss) {
    await tap(page, '.bv-card[data-k="wet"]');
    await waitDs(page, "empEnv", "1");
    await W(page, 600);
    await on("wet-off");
    await tap(page, '.bv-card[data-k="wet"]');
    await waitDs(page, "empEnv", "2");
    await W(page, 500);
  }
  await tap(page, '.bv-card[data-k="flat"]');
  await waitDs(page, "empEnv", "3");
  await W(page, 700);
  await on("flat-on");
  await tap(page, '.bv-card[data-k="bug"]');
  await waitDs(page, "empBug", "1");
  await W(page, 500);
  await on("bug-open");
  await tap(page, '.bv-card[data-k="bug"]');
  await waitDs(page, "empBug", "0");
  await W(page, 400);
  await btnShown(page, ".emp-check");
  await W(page, 250);
  await on("tried");
  await tap(page, ".emp-check");
  await waitAsk(page);
  await W(page, 400);
  await answer(page, wrong, on, "ask");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** u2l7 두 섬의 새 랩. miss이면 시간을 한 번 되돌려 본다. */
export async function playBeakIsles(page, { wrong = false, miss = false, on = noop } = {}) {
  await waitAsk(page);
  await W(page, 250);
  await on("mount");
  await pickText(page, miss ? "긴 부리" : "두꺼운 부리");
  await waitDs(page, "bkiPhase", "time");
  await W(page, 300);
  await on("time");
  for (const v of [1, 2]) {
    await setRange(page, ".bki-range", v, false);
    await W(page, 950);
    await on(`step${v}`);
  }
  if (miss) {
    await setRange(page, ".bki-range", 0, false);
    await W(page, 500);
    await on("back");
  }
  await setRange(page, ".bki-range", 3, false);
  await W(page, 950);
  await on("step3");
  await waitAsk(page);
  await W(page, 400);
  const q1 = await askText(page);
  await answer(page, wrong, on, "ask");
  await waitAsk(page, q1);
  await W(page, 450);
  await answer(page, false, on, "ask2");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** u2l8 가까운 사이 찾기 랩. */
export async function playKin(page, { wrong = false, miss = false, on = noop } = {}) {
  await waitAsk(page);
  await W(page, 250);
  await on("mount");
  await pickText(page, miss ? "갈매기" : "다람쥐");
  await waitDs(page, "knlPhase", "look");
  await W(page, 300);
  await on("look");
  for (const k of ["wing", "skin", "birth", "milk"]) {
    await tap(page, `.bv-card[data-k="${k}"]`);
    await waitFor(page, (key) => (document.querySelector(".screen.active .step.bv-step")?.dataset.knlDone ?? "").split(",").includes(key), k);
    await W(page, 500);
    await on(`look-${k}`);
  }
  await waitAsk(page);
  await W(page, 400);
  await answer(page, wrong, on, "ask");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** u2l8 무리 넓히기 랩. miss이면 한 번 좁혔다가 다시 넓힌다. */
export async function playRankWiden(page, { wrong = false, miss = false, on = noop } = {}) {
  await waitAsk(page);
  await W(page, 250);
  await on("mount");
  await pickText(page, miss ? "갈매기" : "다람쥐");
  await waitDs(page, "rkwPhase", "widen");
  await W(page, 300);
  await on("widen");
  for (const v of [1, 2, 3, 4, 5]) {
    await setRange(page, ".rkw-range", v, false);
    await W(page, 600);
    await on(`rank${v}`);
  }
  if (miss) {
    await setRange(page, ".rkw-range", 2, false);
    await W(page, 500);
    await on("narrow");
  }
  await setRange(page, ".rkw-range", 6, false);
  await W(page, 700);
  await on("rank6");
  await waitAsk(page);
  await W(page, 400);
  await answer(page, wrong, on, "ask");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** u2l9 검색표 랩. miss이면 대장균과 버섯에서 한 번씩 틀린 길을 고른다. */
export async function playKingdomPath(page, { wrong = false, miss = false, on = noop } = {}) {
  const idle = async () => {
    await W(page, 120);
    await waitDs(page, "kplBusy", "0");
    await W(page, 220);
  };
  // 생물마다 답할 차례: [물음, 답(예 = true)]. 둘째 물음은 랩이 대신 답한다.
  const PLAN = [[[1, false]], [[1, true]], [[1, true], [3, true]], [[1, true], [3, false], [4, true]], [[1, true], [3, false], [4, false]]];
  await idle();
  await on("mount");
  for (let i = 0; i < PLAN.length; i++) {
    for (const [g, yes] of PLAN[i]) {
      await waitDs(page, "kplGate", String(g));
      await idle();
      if (miss && ((i === 0 && g === 1) || (i === 4 && g === 3))) {
        await tap(page, yes ? ".kpl-no" : ".kpl-yes");
        await W(page, 400);
        await on(`org${i + 1}-gate${g}-miss`);
      }
      if (g > 1) await on(`org${i + 1}-gate${g}`);
      await tap(page, yes ? ".kpl-yes" : ".kpl-no");
      await W(page, 300);
      if (g === 1 && i === 1) {
        await waitDs(page, "kplGate", "2");
        await W(page, 700);
        await on("org2-gate2-auto");
      }
    }
    await waitDs(page, "kplLanded", String(i + 1));
    await W(page, 300);
    await on(`org${i + 1}-landed`);
    await tap(page, ".kpl-next");
    await W(page, 300);
  }
  await waitAsk(page);
  await W(page, 400);
  await answer(page, wrong, on, "ask");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** u2l10 먹이 관계 랩. miss이면 개구리를 되돌려 놓아 본다. */
export async function playFoodWeb(page, { wrong = false, miss = false, on = noop } = {}) {
  await on("mount");
  await tap(page, '.bv-card[data-k="frog"]');
  await waitAsk(page);
  await W(page, 300);
  await on("predict");
  await pickText(page, miss ? "(나) 생태계" : "(가) 생태계");
  await askGone(page);
  await waitDs(page, "fwbOff", "frog");
  await W(page, 1500);
  await on("frog-off");
  if (miss) {
    await tap(page, '.bv-card[data-k="frog"]');
    await waitDs(page, "fwbOff", "");
    await W(page, 500);
    await on("frog-back");
  }
  await tap(page, '.bv-card[data-k="hopper"]');
  await waitDs(page, "fwbOff", "hopper");
  await W(page, 2000);
  await on("hopper-off");
  await tap(page, '.bv-card[data-k="rice"]');
  await waitDs(page, "fwbOff", "rice");
  await W(page, 2300);
  await on("rice-off");
  await btnShown(page, ".fwb-cmp");
  await W(page, 250);
  await on("tried");
  await tap(page, ".fwb-cmp");
  await waitAsk(page);
  await W(page, 400);
  await answer(page, wrong, on, "ask");
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** 랩 열세 판(레슨 번호, 스텝 번호, 이름, 조작). */
export const LABS = [
  { key: "l1-magnify", li: 0, si: 1, name: "u2l1 크게 보면 무엇이 보일까?", play: (p, o) => playMagnify(p, o) },
  { key: "l2-animal", li: 1, si: 2, name: "u2l2 세포의 구조, 멈추면 어떻게 될까?", play: (p, o) => playCellWork(p, "animal", o) },
  { key: "l2-plant", li: 1, si: 4, name: "u2l2 식물세포의 두 구조, 멈추면?", play: (p, o) => playCellWork(p, "plant", o) },
  { key: "l3-slide", li: 2, si: 1, name: "u2l3 입안 세포 표본, 어떻게 만들까?", play: (p, o) => playSlide(p, { fast: true, order: true, ...o }) },
  { key: "l3-scope", li: 2, si: 2, name: "u2l3 두 세포는 무엇이 다를까?", play: (p, o) => playScope(p, { miss: true, ...o }) },
  { key: "l4-fit", li: 3, si: 1, name: "u2l4 세포마다 왜 모양이 다를까?", play: (p, o) => playCellFit(p, { miss: true, ...o }) },
  { key: "l5-level", li: 4, si: 1, name: "u2l5 세포가 모이면 무엇이 될까?", play: (p, o) => playLevelBuild(p, o) },
  { key: "l6-eco", li: 5, si: 1, name: "u2l6 생물이 다양한지 무엇으로 알까?", play: (p, o) => playEcoMap(p, { miss: true, ...o }) },
  { key: "l7-beak", li: 6, si: 2, name: "u2l7 두 섬의 새는 어떻게 달라질까?", play: (p, o) => playBeakIsles(p, { miss: true, ...o }) },
  { key: "l8-kin", li: 7, si: 1, name: "u2l8 박쥐는 누구와 더 가까울까?", play: (p, o) => playKin(p, { miss: true, ...o }) },
  { key: "l8-rank", li: 7, si: 4, name: "u2l8 무리를 넓히면 누구를 만날까?", play: (p, o) => playRankWiden(p, { miss: true, ...o }) },
  { key: "l9-path", li: 8, si: 1, name: "u2l9 이 생물은 어느 계일까?", play: (p, o) => playKingdomPath(p, { miss: true, ...o }) },
  { key: "l10-web", li: 9, si: 1, name: "u2l10 생물 하나를 빼면 어떻게 될까?", play: (p, o) => playFoodWeb(p, { miss: true, ...o }) },
];
