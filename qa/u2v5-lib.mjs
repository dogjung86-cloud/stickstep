// 중1 Ⅱ v5 검증 공용 부품: 부팅, 레슨 열기, 측정, 랩 다섯 판의 조작.
// 한 화면 검사(check-u2v5-fit), 실플레이(e2e-u2v5), 눈검수 캡처(shot-u2v5)가 같은 조작을 쓴다.
// 레슨은 CURRICULUM에서 꺼내 연다(ss.u2v5 토글 배선이 실제로 먹는지까지 함께 본다).
import { chromium } from "playwright-core";

export const PORT = process.env.PORT || "5547";
export const BUDGET = 554; // 390×700 화면의 스크롤 영역 높이

export async function launch({ width = 390, height = 700, v5 = true } = {}) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript((on) => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
    if (on) sessionStorage.setItem("ss.u2v5", "1");
  }, v5);
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
export const pickRight = (page) => pickBy(page, "1");
export const pickWrong = (page) => pickBy(page, "0");
export const pickText = (page, text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].filter((x) => !x.disabled && x.offsetParent !== null).find((x) => x.textContent.includes(t));
    if (!b) return false;
    b.click();
    return true;
  }, text);
/** 오답 카드의 모습: 누른 보기 바로 아래에 정답 카드가 붙었는가, 다른 보기는 접혔는가, '다음'이 있는가. */
export const wrongCard = (page) =>
  page.evaluate(() => {
    const q = document.querySelector(".screen.active .bv-q.show");
    const miss = q?.querySelector(".bv-choice.miss");
    const card = q?.querySelector(".bv-ans");
    const next = card?.querySelector(".bv-next");
    const others = [...(q?.querySelectorAll(".bv-choice") ?? [])].filter((b) => b !== miss);
    const r = next?.getBoundingClientRect();
    return {
      has: !!miss && !!card,
      adjacent: !!miss && miss.nextElementSibling === card,
      othersGone: others.every((b) => b.offsetParent === null),
      answer: card?.querySelector(".bv-ans-t")?.textContent?.trim() ?? "",
      why: card?.querySelector(".bv-why")?.textContent?.trim() ?? "",
      nextH: r ? Math.round(r.height) : 0,
    };
  });
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
    const cut = [...wrap.querySelectorAll(".bv-choice, .bv-ans-t, .bv-card b, .bv-card i, .bv-title, .bv-btn")]
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

/** 판정 한 번: 맞히거나 틀린다. 틀리면 on("wrong") 뒤 '다음'을 누른다. */
async function answer(page, wrong, on, label) {
  await on(label);
  if (wrong) {
    await pickWrong(page);
    await W(page, 550);
    await on(`${label}-wrong`);
    await tap(page, ".bv-next");
  } else {
    await pickRight(page);
  }
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
  await on("ask2");
  await pickRight(page);
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
  await on("ask");
  if (wrong) {
    await pickWrong(page);
    await W(page, 600);
    await on("ask-wrong");
    await tap(page, ".bv-next");
  } else {
    await pickRight(page);
    await W(page, 700);
    await on("ask-right");
  }
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
  await on("ask2");
  await pickRight(page);
  await waitDone(page);
  await W(page, 350);
  await on("done");
}

/** 랩 다섯 판(레슨 번호, 스텝 번호, 이름, 조작). */
export const LABS = [
  { key: "l1-magnify", li: 0, si: 1, name: "u2l1 크게 보면 무엇이 보일까?", play: (p, o) => playMagnify(p, o) },
  { key: "l2-animal", li: 1, si: 2, name: "u2l2 세포의 구조, 멈추면 어떻게 될까?", play: (p, o) => playCellWork(p, "animal", o) },
  { key: "l2-plant", li: 1, si: 4, name: "u2l2 식물세포의 두 구조, 멈추면?", play: (p, o) => playCellWork(p, "plant", o) },
  { key: "l3-slide", li: 2, si: 1, name: "u2l3 입안 세포 표본, 어떻게 만들까?", play: (p, o) => playSlide(p, { fast: true, order: true, ...o }) },
  { key: "l3-scope", li: 2, si: 2, name: "u2l3 두 세포는 무엇이 다를까?", play: (p, o) => playScope(p, { miss: true, ...o }) },
];
