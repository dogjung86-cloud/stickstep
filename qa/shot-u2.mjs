// 중1 II 생물의 구성과 다양성 전 레슨 증거 샷.
// PORT=5173 node qa/shot-u2.mjs <outPrefix>
// KINGDOM_ONLY=1 PORT=5173 node qa/shot-u2.mjs qa/u2-kingdom-final

import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const BASE = `http://127.0.0.1:${PORT}/`;
const FINCH_ONLY = process.env.FINCH_ONLY === "1";
const KINGDOM_ONLY = !FINCH_ONLY && process.env.KINGDOM_ONLY === "1";
const HOOKS_ONLY = !FINCH_ONLY && !KINGDOM_ONLY && process.env.HOOKS_ONLY === "1";
const OUT = process.argv[2] ?? (FINCH_ONLY ? "qa/u2-finch-final" : KINGDOM_ONLY ? "qa/u2-kingdom-final" : "qa/u2");
const STEP_WAIT = 460;
const VIEW_WIDTH = FINCH_ONLY ? 390 : Number(process.env.VIEW_WIDTH || "390");
const VIEW_HEIGHT = FINCH_ONLY ? 844 : Number(process.env.VIEW_HEIGHT || "844");

mkdirSync(dirname(OUT), { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: VIEW_WIDTH, height: VIEW_HEIGHT },
  deviceScaleFactor: 2,
});
const pageErrors = [];
let shotCount = 0;
page.on("pageerror", (error) => pageErrors.push(error));

await page.addInitScript(() => {
  const lessons = {};
  ["u2l1", "u2l2", "u2l3", "u2l4", "u2l5", "u2l6"].forEach((id) => {
    lessons[id] = { done: true, acc: 95, bestXp: 80 };
  });
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1,
    onboarded: true,
    grade: "g1",
    viewGrade: "g1",
    viewSubject: "sci",
    premium: false,
    reviewMode: false,
    goalMin: 10,
    streak: 2,
    lastStudyDay: "2026-07-10",
    totalXp: 640,
    lessons,
    minigame: {},
  }));
});

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

const active = (selector) => page.locator(`.screen.active ${selector}`);

async function assertNoPageErrors(context) {
  if (pageErrors.length === 0) return;
  throw new Error(`${context}: pageerror\n${pageErrors.map((error) => error.stack || error.message).join("\n---\n")}`);
}

async function visibleBrokenImages() {
  return page.evaluate(() => {
    const root = document.querySelector(".screen.active");
    if (!root) return [{ src: "<active screen missing>", complete: false, naturalWidth: 0 }];
    return [...root.querySelectorAll("img")]
      .filter((image) => {
        const style = getComputedStyle(image);
        return image.getClientRects().length > 0 && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0;
      })
      .filter((image) => !image.complete || image.naturalWidth <= 0)
      .map((image) => ({ src: image.currentSrc || image.src, complete: image.complete, naturalWidth: image.naturalWidth }));
  });
}

async function assertVisibleImages(context) {
  const deadline = Date.now() + 5000;
  let broken = await visibleBrokenImages();
  while (broken.length > 0 && Date.now() < deadline) {
    await page.waitForTimeout(100);
    broken = await visibleBrokenImages();
  }
  invariant(broken.length === 0, `${context}: visible image failed to load: ${JSON.stringify(broken)}`);
}

async function kingdomVisualReport() {
  return page.evaluate(() => {
    const root = document.querySelector(".screen.active");
    if (!root) return { images: 0, svgs: 0, invalidImages: ["<active screen missing>"], invalidSvgs: [] };
    const scopes = [...root.querySelectorAll(".dk5-board-shell, .dk5-stage:not([hidden]), .dk5-final:not([hidden])")];
    const images = [...new Set(scopes.flatMap((scope) => [...scope.querySelectorAll("img")]))]
      .filter((image) => !image.closest("[hidden]"));
    const svgs = [...new Set(scopes.flatMap((scope) => [...scope.querySelectorAll("svg")]))]
      .filter((svg) => !svg.closest("[hidden]"));
    return {
      images: images.length,
      svgs: svgs.length,
      invalidImages: images
        .filter((image) => !image.complete || image.naturalWidth <= 0 || image.classList.contains("bio-ico-broken"))
        .map((image) => image.currentSrc || image.src || "<missing src>"),
      invalidSvgs: svgs
        .filter((svg) => {
          const rect = svg.getBoundingClientRect();
          return rect.width <= 0 || rect.height <= 0 || svg.childElementCount === 0;
        })
        .map((svg) => svg.getAttribute("aria-label") || svg.getAttribute("viewBox") || "<inline svg>"),
    };
  });
}

async function assertKingdomVisuals(context) {
  const deadline = Date.now() + 5000;
  let report = await kingdomVisualReport();
  while (report.invalidImages.length > 0 && Date.now() < deadline) {
    await page.waitForTimeout(100);
    report = await kingdomVisualReport();
  }
  invariant(report.images + report.svgs > 0, `${context}: no organism SVG or image was rendered`);
  invariant(report.invalidImages.length === 0, `${context}: organism image failed to load: ${JSON.stringify(report)}`);
  invariant(report.invalidSvgs.length === 0, `${context}: organism SVG has no visible layout: ${JSON.stringify(report)}`);
}

async function assertNoHorizontalOverflow(context) {
  const overflow = await page.evaluate(() => {
    const root = document.querySelector(".screen.active");
    const scroller = root?.querySelector(".scroll");
    const nodes = [document.documentElement, document.body, root, scroller].filter(Boolean);
    return nodes
      .map((node) => ({
        name: node === document.documentElement ? "html" : node === document.body ? "body" : node === root ? "active screen" : "lesson scroll",
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
      }))
      .filter((entry) => entry.scrollWidth > entry.clientWidth + 1);
  });
  invariant(overflow.length === 0, `${context}: horizontal overflow ${JSON.stringify(overflow)}`);
}

async function scrollActive(selector) {
  const target = active(selector).first();
  invariant(await target.count() > 0, `Cannot scroll to missing active selector: ${selector}`);
  await target.scrollIntoViewIfNeeded();
  // Playwright can programmatically scroll the page even though the app itself
  // only scrolls the lesson pane. Reset that outer scroll so fixed chrome and
  // the closed feedback sheet are captured in their real positions.
  if (KINGDOM_ONLY) {
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.querySelector("#frame")?.scrollTo(0, 0);
      document.querySelector(".screen.active")?.scrollTo(0, 0);
    });
  }
  await page.waitForTimeout(120);
}

async function shot(name, focusSelector) {
  if (focusSelector) await scrollActive(focusSelector);
  await assertVisibleImages(name);
  await assertNoPageErrors(name);
  await page.screenshot({
    path: `${OUT}-${name}.png`,
    animations: KINGDOM_ONLY ? "allow" : "disabled",
  });
  shotCount += 1;
  console.log("SAVED", name);
}

async function clickActiveButton(text) {
  const button = active("button:visible").filter({ hasText: text }).first();
  invariant(await button.count() > 0, `Active button not found: ${text}`);
  invariant(await button.isEnabled(), `Active button is disabled: ${text}`);
  await button.scrollIntoViewIfNeeded();
  await button.click();
}

async function clickHookChoice() {
  const choice = active(".hook-choice:visible:not([disabled])").first();
  invariant(await choice.count() > 0, "Visible hook prediction choice not found");
  await choice.scrollIntoViewIfNeeded();
  await choice.click();
  await page.waitForTimeout(STEP_WAIT);
}

async function openLesson(id) {
  await page.evaluate(async (lessonId) => {
    const store = await import("/src/core/store.ts");
    if (!store.isDone(lessonId)) store.completeLesson(lessonId, 95, 0);
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(lessonId);
    if (!found) throw new Error(`Lesson not found: ${lessonId}`);
    nav.go(createLessonPlayer(found.lesson, {
      onExit: () => nav.back(),
      onComplete: () => nav.back(),
    }));
  }, id);
  await page.waitForTimeout(700);
  invariant(await active(".xbtn.fwd").count() > 0, `${id}: completed/free-nav forward button missing`);
}

async function openUnit2Lesson(id) {
  await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { UNIT2 } = await import("/src/content/unit2.ts");
    const lesson = UNIT2.lessons.find((item) => item.id === lessonId);
    if (!lesson) throw new Error(`Unit II lesson not found: ${lessonId}`);
    nav.go(createLessonPlayer(lesson, {
      onExit: () => nav.back(),
      onComplete: () => nav.back(),
    }));
  }, id);
  await page.waitForTimeout(700);
  invariant(await active(".xbtn.fwd").count() > 0, `${id}: completed/free-nav forward button missing`);
}

async function closeLesson() {
  const close = active(".xbtn[aria-label='닫기']:visible").first();
  invariant(await close.count() > 0, "Active lesson close button missing");
  await close.click();
  await page.waitForTimeout(600);
}

async function forward() {
  const button = active(".xbtn.fwd:visible").first();
  invariant(await button.count() > 0, "Active free-nav forward button missing");
  await button.click();
  await page.waitForTimeout(STEP_WAIT);
}

async function gotoTitle(pattern, maxSteps = 24) {
  const seen = [];
  for (let i = 0; i <= maxSteps; i += 1) {
    const title = (await active(".h1").first().innerText())?.replace(/\s+/g, " ").trim() || "";
    seen.push(title || "<no title>");
    if (pattern.test(title)) return title;
    if (i < maxSteps) {
      const next = active(".xbtn.fwd:visible").first();
      invariant(await next.count() > 0, `Cannot reach ${pattern}; stopped at ${title || "<no title>"}. Seen: ${seen.join(" -> ")}`);
      await forward();
    }
  }
  throw new Error(`Step title not found: ${pattern}`);
}

async function gotoSelector(selector, maxSteps = 24) {
  for (let i = 0; i <= maxSteps; i += 1) {
    const locator = active(selector).first();
    if (await locator.count() > 0 && await locator.isVisible()) return;
    if (i < maxSteps) await forward();
  }
  throw new Error(`Active step selector not found: ${selector}`);
}

async function interactHook(lessonId) {
  if (lessonId === "u2l1") {
    await clickActiveButton(/확대경으로 팔/);
    await page.waitForTimeout(1600);
  } else if (lessonId === "u2l2") {
    await clickActiveButton(/염색액 한 방울/);
    await page.waitForTimeout(1050);
    await clickHookChoice();
  } else if (lessonId === "u2l3") {
    await clickHookChoice();
  } else if (lessonId === "u2l4") {
    const cards = active(".fp-card");
    invariant(await cards.count() >= 3, "L4 fingerprint cards missing");
    for (let i = 0; i < 3; i += 1) {
      await cards.nth(i).click();
      await page.waitForTimeout(140);
    }
    await clickHookChoice();
  } else if (lessonId === "u2l5") {
    await clickHookChoice();
  } else if (lessonId === "u2l6") {
    await clickActiveButton(/메뚜기가 사라진 상황/);
    await page.waitForTimeout(1250);
    await clickHookChoice();
  } else {
    throw new Error(`No hook interaction configured for ${lessonId}`);
  }
}

async function completeFigTabs() {
  const buttons = active(".seg button");
  invariant(await buttons.count() >= 2, "Figure tabs missing");
  for (let i = 0; i < await buttons.count(); i += 1) {
    await buttons.nth(i).click();
    await page.waitForTimeout(140);
  }
}

async function completeOrgLevels() {
  for (let i = 0; i < 6; i += 1) {
    const up = active(".org-up:not(.hidden):visible").first();
    if (await up.count() === 0) break;
    await up.click();
    await page.waitForTimeout(160);
  }
  invariant(await active(".org-rnode.done").count() >= 4, "Organization level ladder did not reach the individual");
}

async function setMicroscopeFocus(percent) {
  const slider = active(".mic-focus").first();
  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  invariant(box && box.width > 0, "Microscope focus slider has no layout box");
  await page.mouse.click(box.x + box.width * (percent / 100), box.y + box.height * 0.45);
  await page.waitForTimeout(120);
}

async function completeCompareMicroscope() {
  // 입안 상피세포: 염색 → 대물 4배에서 초점 → 대물 40배에서 재초점.
  await clickActiveButton(/메틸렌 블루 한 방울/);
  await setMicroscopeFocus(70);
  await clickActiveButton(/대물 40배/);
  await setMicroscopeFocus(70);

  // 검정말 잎세포: 물 표본 준비 → 저배율 → 고배율 재초점.
  await clickActiveButton(/검정말 잎세포/);
  await clickActiveButton(/물 한 방울로 표본 준비/);
  await setMicroscopeFocus(70);
  await clickActiveButton(/대물 40배/);
  await setMicroscopeFocus(70);

  invariant(await active(".mic-goal.on").count() === 3, "Compare microscope did not complete all three goals");
}

async function completeBiodiversityLab() {
  const ecoButtons = active(".bd-eco-btn");
  invariant(await ecoButtons.count() === 3, "Biodiversity ecosystem controls missing");
  for (let i = 0; i < 3; i += 1) {
    await ecoButtons.nth(i).click();
    await page.waitForTimeout(120);
  }

  await active(".bd-lens-btn").nth(1).click();
  const specimens = active(".bd-specimen");
  invariant(await specimens.count() >= 4, "Biodiversity species markers missing");
  for (let i = 0; i < 4; i += 1) {
    await specimens.nth(i).click();
    await page.waitForTimeout(100);
  }

  await active(".bd-lens-btn").nth(2).click();
  const bugs = active(".bd-bug");
  invariant(await bugs.count() >= 2, "Biodiversity variation specimens missing");
  await bugs.nth(0).click();
  await bugs.nth(1).click();
  await active(".bd-compare-btn").click();
  await page.waitForTimeout(180);

  invariant(await active(".bd-goal.on").count() === 3, "Biodiversity lab did not complete all three lenses");
  invariant(await active(".bd-compare-btn.bd-complete").count() === 1, "Biodiversity variation comparison did not finish");
}

async function completeFinchSim() {
  await gotoTitle(/서로 다른 섬에서 어떤 부리가 남을까요/);
  invariant(await active(".fs-bird").count() === 12, "Finch simulation initial flock must contain 12 birds");
  invariant(await active(".fs-flock-row").count() === 3, "Finch simulation must contain three beak rows");
  invariant(await active(".fs-start").isDisabled(), "Finch simulation start button must be locked before choosing an island");

  await clickActiveButton(/씨앗 섬/);
  await clickActiveButton(/먹이 경쟁 시작/);
  await page.waitForTimeout(1650);
  invariant(await active(".fs-bird.fs-survives").count() === 4, "Seed island must leave four birds as survivors");
  invariant(await active(".fs-bird.fs-dimmed").count() === 8, "Seed island must dim eight birds");
  invariant(await active('.fs-goal[data-g="seed"].on').count() === 1, "Seed-island goal did not complete");
  await shot("l4-finch-result", ".fs-stage");

  await clickActiveButton(/곤충 섬/);
  await clickActiveButton(/먹이 경쟁 시작/);
  await active(".sheet.open").waitFor({ state: "visible", timeout: 5000 });
  invariant(await active(".fs-goal.on").count() === 3, "Finch comparison did not complete all three goals");
  invariant(await active(".fs-compare-card").count() === 2, "Finch comparison must show two environment cards");

  const continueButton = active(".sheet.open .sheet-card button").first();
  invariant(await continueButton.count() === 1, "Finch completion sheet continue button missing");
  await continueButton.click();
  await page.waitForTimeout(STEP_WAIT);
}

async function captureFinchOnly() {
  await openUnit2Lesson("u2l4");
  await gotoTitle(/서로 다른 섬에서 어떤 부리가 남을까요/);

  const initial = await page.evaluate(() => {
    const root = document.querySelector(".screen.active");
    const stage = root?.querySelector(".fs-stage");
    const rows = [...(root?.querySelectorAll(".fs-flock-row") ?? [])];
    const start = root?.querySelector(".fs-start");
    const cta = root?.querySelector(".cta");
    return {
      environment: stage instanceof HTMLElement ? stage.dataset.environment : "",
      phase: stage instanceof HTMLElement ? stage.dataset.phase : "",
      birds: root?.querySelectorAll(".fs-bird").length ?? 0,
      rows: rows.length,
      rowSizes: rows.map((row) => row.querySelectorAll(".fs-bird").length),
      environmentButtons: root?.querySelectorAll(".fs-env-btn").length ?? 0,
      selectedEnvironments: root?.querySelectorAll('.fs-env-btn[aria-pressed="true"]').length ?? 0,
      startLocked: start instanceof HTMLButtonElement && start.disabled,
      ctaLocked: cta instanceof HTMLButtonElement && cta.disabled,
    };
  });
  invariant(initial.environment === "overview" && initial.phase === "ready", `Finch initial stage state mismatch: ${JSON.stringify(initial)}`);
  invariant(initial.birds === 12 && initial.rows === 3 && initial.rowSizes.every((size) => size === 4), `Finch initial flock mismatch: ${JSON.stringify(initial)}`);
  invariant(initial.environmentButtons === 2 && initial.selectedEnvironments === 0, `Finch initial environment controls mismatch: ${JSON.stringify(initial)}`);
  invariant(initial.startLocked && initial.ctaLocked, `Finch initial controls must be locked: ${JSON.stringify(initial)}`);
  await assertNoHorizontalOverflow("finch initial");
  await shot("initial", ".fs-stage");

  await clickActiveButton(/씨앗 섬/);
  await clickActiveButton(/먹이 경쟁 시작/);
  await active('.fs-stage[data-environment="seed"][data-phase="resolved"]').waitFor({ state: "visible", timeout: 3000 });
  await active('.fs-goal[data-g="seed"].on').waitFor({ state: "visible", timeout: 3000 });
  const seed = await page.evaluate(() => {
    const root = document.querySelector(".screen.active");
    const evidence = root?.querySelector(".fs-seed-evidence");
    const visible = evidence instanceof SVGElement && Number(getComputedStyle(evidence).opacity) > 0;
    return {
      survives: root?.querySelectorAll('.fs-bird.fs-survives[data-beak="thick"]').length ?? 0,
      allSurvivors: root?.querySelectorAll(".fs-bird.fs-survives").length ?? 0,
      failures: root?.querySelectorAll(".fs-bird.fs-fails").length ?? 0,
      evidenceVisible: visible,
      crackVisible: root?.querySelector(".fs-seed-crack") instanceof SVGElement
        && Number(getComputedStyle(root.querySelector(".fs-seed-crack")).opacity) > 0,
      evidenceText: evidence?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      seedGoal: root?.querySelector('.fs-goal[data-g="seed"].on') !== null,
      comparisonHidden: root?.querySelector(".fs-comparison")?.hasAttribute("hidden") ?? false,
    };
  });
  invariant(seed.survives === 4 && seed.allSurvivors === 4 && seed.failures === 8, `Seed result population mismatch: ${JSON.stringify(seed)}`);
  invariant(seed.seedGoal && seed.evidenceVisible && seed.crackVisible && seed.evidenceText.includes("껍질이 갈라짐"), `Seed cracking evidence missing: ${JSON.stringify(seed)}`);
  invariant(seed.comparisonHidden, "Seed result must remain visible before the comparison view");
  await assertNoHorizontalOverflow("finch seed resolved");
  await shot("seed", ".fs-stage");

  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll(".screen.active .fs-env-btn")]
      .find((item) => item.textContent?.includes("곤충 섬"));
    return button instanceof HTMLButtonElement && !button.disabled;
  }, null, { timeout: 3000 });
  await clickActiveButton(/곤충 섬/);
  await clickActiveButton(/먹이 경쟁 시작/);
  await active('.fs-stage[data-environment="insect"][data-phase="resolved"]').waitFor({ state: "visible", timeout: 3000 });
  const insect = await page.evaluate(() => {
    const root = document.querySelector(".screen.active");
    const stage = root?.querySelector(".fs-stage");
    const evidence = root?.querySelector(".fs-insect-evidence");
    return {
      phase: stage instanceof HTMLElement ? stage.dataset.phase : "",
      survives: root?.querySelectorAll('.fs-bird.fs-survives[data-beak="thin"]').length ?? 0,
      allSurvivors: root?.querySelectorAll(".fs-bird.fs-survives").length ?? 0,
      failures: root?.querySelectorAll(".fs-bird.fs-fails").length ?? 0,
      evidenceVisible: evidence instanceof SVGElement && Number(getComputedStyle(evidence).opacity) > 0,
      probeBeak: root?.querySelector(".fs-probe-beak") instanceof SVGElement,
      evidenceText: evidence?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      comparisonHidden: root?.querySelector(".fs-comparison")?.hasAttribute("hidden") ?? false,
      compared: stage?.classList.contains("fs-compared") ?? false,
    };
  });
  invariant(insect.phase === "resolved" && insect.survives === 4 && insect.allSurvivors === 4 && insect.failures === 8, `Insect result population mismatch: ${JSON.stringify(insect)}`);
  invariant(insect.evidenceVisible && insect.probeBeak && insect.evidenceText.includes("곤충을 꺼냄"), `Insect extraction evidence missing: ${JSON.stringify(insect)}`);
  invariant(insect.comparisonHidden && !insect.compared, "Insect evidence was hidden by the completed comparison view");
  await assertNoHorizontalOverflow("finch insect resolved");
  await shot("insect", ".fs-stage");
}

const KINGDOM_CASES = [
  { name: "대장균", kingdom: "원핵생물계", answers: [false, false] },
  { name: "아메바", kingdom: "원생생물계", answers: [true, true] },
  { name: "송이버섯", kingdom: "균계", answers: [false, true] },
  { name: "소나무", kingdom: "식물계", answers: [true, true] },
  { name: "붕어", kingdom: "동물계", answers: [false, true] },
];

async function classifyKingdomOrganism(testCase, nextName, alreadyStarted = false) {
  const name = (await active(".dk5-hero-name").innerText()).trim();
  invariant(name === testCase.name, `Expected ${testCase.name}, found ${name}`);
  invariant(await active(".dk5-fact").count() >= 2, `${testCase.name}: observation facts missing`);
  await assertKingdomVisuals(`${testCase.name} observation`);

  if (!alreadyStarted) {
    const start = active(".dk5-start:visible").first();
    invariant(await start.count() === 1 && await start.isEnabled(), `${testCase.name}: classification start button unavailable`);
    await start.click();
  }

  for (let index = 0; index < testCase.answers.length; index += 1) {
    const answer = testCase.answers[index];
    const expectedStep = `${index + 1} / ${testCase.answers.length}`;
    await page.waitForFunction((step) => {
      const root = document.querySelector(".screen.active");
      const panel = root?.querySelector(".dk5-question-panel");
      const label = root?.querySelector(".dk5-question-step");
      return panel instanceof HTMLElement && !panel.hidden && label?.textContent?.includes(step);
    }, expectedStep, { timeout: 5000 });

    const button = active(`.dk5-answer-btn[data-answer="${answer}"]:visible`).first();
    invariant(await button.count() === 1 && await button.isEnabled(), `${testCase.name}: answer ${expectedStep} unavailable`);
    await button.click();

    if (index < testCase.answers.length - 1) {
      const nextStep = `${index + 2} / ${testCase.answers.length}`;
      await page.waitForFunction((step) => {
        const root = document.querySelector(".screen.active");
        const label = root?.querySelector(".dk5-question-step");
        const enabled = root?.querySelector(".dk5-answer-btn:not([disabled])");
        return label?.textContent?.includes(step) && enabled instanceof HTMLButtonElement;
      }, nextStep, { timeout: 5000 });
    }
  }

  if (testCase === KINGDOM_CASES[0]) {
    const flight = page.locator("body > .dk5-flight").first();
    await flight.waitFor({ state: "visible", timeout: 4000 });
    const transitionMs = await flight.evaluate((node) => Number.parseFloat(node.style.transitionDuration));
    invariant(transitionMs >= 80, `Kingdom organism flight transition missing: ${transitionMs}`);
  }

  const placed = active(`.dk5-slot[data-kingdom="${testCase.kingdom}"] .dk5-mini-token[aria-label="${testCase.name}"]`).first();
  await placed.waitFor({ state: "visible", timeout: 9000 });
  if (nextName) {
    await page.waitForFunction((expected) => {
      const root = document.querySelector(".screen.active");
      const nameEl = root?.querySelector(".dk5-hero-name");
      const startButton = root?.querySelector(".dk5-start");
      return nameEl?.textContent?.trim() === expected
        && startButton instanceof HTMLButtonElement
        && !startButton.hidden;
    }, nextName, { timeout: 7000 });
  }
}

async function classifyFirstOrganism() {
  await classifyKingdomOrganism(KINGDOM_CASES[0], KINGDOM_CASES[1].name);
}

async function captureKingdomOnly() {
  await openUnit2Lesson("u2l5");
  await gotoTitle(/대표 생물을 만나며 5계를 완성해요/);

  const initial = await page.evaluate(() => {
    const root = document.querySelector(".screen.active");
    const slots = [...(root?.querySelectorAll(".dk5-slot") ?? [])];
    const questionPanel = root?.querySelector(".dk5-question-panel");
    const final = root?.querySelector(".dk5-final");
    return {
      organism: root?.querySelector(".dk5-hero-name")?.textContent?.trim() ?? "",
      facts: root?.querySelectorAll(".dk5-fact").length ?? 0,
      slots: slots.length,
      filledSlots: slots.filter((slot) => slot.classList.contains("is-filled")).length,
      tokens: root?.querySelectorAll(".dk5-mini-token").length ?? 0,
      slotCounts: slots.map((slot) => slot.querySelector(".dk5-slot-count")?.textContent?.trim()),
      questionHidden: questionPanel instanceof HTMLElement && questionPanel.hidden,
      startVisible: root?.querySelector(".dk5-start") instanceof HTMLButtonElement
        && !root.querySelector(".dk5-start").hidden,
      finalHidden: final instanceof HTMLElement && final.hidden,
      sheetOpen: root?.querySelector(".sheet")?.classList.contains("open") ?? false,
    };
  });
  invariant(initial.organism === "대장균" && initial.facts >= 2, `Kingdom initial observation mismatch: ${JSON.stringify(initial)}`);
  invariant(initial.slots === 5 && initial.filledSlots === 0 && initial.tokens === 0, `Kingdom initial board mismatch: ${JSON.stringify(initial)}`);
  invariant(initial.slotCounts.every((count) => count === "0"), `Kingdom initial slot counts mismatch: ${JSON.stringify(initial)}`);
  invariant(initial.questionHidden && initial.startVisible && initial.finalHidden && !initial.sheetOpen, `Kingdom initial controls mismatch: ${JSON.stringify(initial)}`);
  await assertKingdomVisuals("kingdom initial observation");
  await assertNoHorizontalOverflow("kingdom initial observation");
  await shot("initial-observation");

  await active(".dk5-start:visible").click();
  await active(".dk5-question-panel:not([hidden])").waitFor({ state: "visible", timeout: 5000 });
  await page.waitForTimeout(520);
  invariant(await active(".dk5-answer-btn:visible").count() === 2, "Kingdom O/X controls missing");
  await assertNoHorizontalOverflow("kingdom O/X check");
  await shot("ox-check");

  await active('.dk5-answer-btn[data-answer="true"]:visible').click();
  await active(".dk5-feedback.bad").waitFor({ state: "visible", timeout: 3000 });
  invariant(await active(".dk5-fact.is-correction").count() === 1, "Kingdom wrong answer did not point back to its evidence");
  await active('.dk5-answer-btn[data-answer="false"]:not([disabled])').waitFor({ state: "visible", timeout: 3000 });

  await classifyKingdomOrganism(KINGDOM_CASES[0], KINGDOM_CASES[1].name, true);
  await classifyKingdomOrganism(KINGDOM_CASES[1], KINGDOM_CASES[2].name);
  const partial = await page.evaluate(() => {
    const root = document.querySelector(".screen.active");
    const slots = [...(root?.querySelectorAll(".dk5-slot") ?? [])];
    return {
      organism: root?.querySelector(".dk5-hero-name")?.textContent?.trim() ?? "",
      filledSlots: slots.filter((slot) => slot.classList.contains("is-filled")).length,
      tokens: root?.querySelectorAll(".dk5-mini-token").length ?? 0,
      counts: Object.fromEntries(slots.map((slot) => [slot.getAttribute("data-kingdom"), slot.querySelector(".dk5-slot-count")?.textContent?.trim()])),
      finalHidden: root?.querySelector(".dk5-final") instanceof HTMLElement
        && root.querySelector(".dk5-final").hidden,
      sheetOpen: root?.querySelector(".sheet")?.classList.contains("open") ?? false,
      sheetTransform: root?.querySelector(".sheet") instanceof HTMLElement
        ? getComputedStyle(root.querySelector(".sheet")).transform
        : "missing",
      sheetTop: root?.querySelector(".sheet") instanceof HTMLElement
        ? Math.round(root.querySelector(".sheet").getBoundingClientRect().top)
        : -1,
    };
  });
  invariant(partial.organism === "송이버섯" && partial.filledSlots === 2 && partial.tokens === 2, `Kingdom partial board mismatch: ${JSON.stringify(partial)}`);
  invariant(partial.counts.원핵생물계 === "1" && partial.counts.원생생물계 === "1" && partial.finalHidden && !partial.sheetOpen && partial.sheetTransform !== "none" && partial.sheetTop >= VIEW_HEIGHT, `Kingdom partial destinations mismatch: ${JSON.stringify(partial)}`);
  await assertKingdomVisuals("kingdom partial board");
  await assertNoHorizontalOverflow("kingdom partial board");
  await shot("partial-board");

  for (let index = 2; index < KINGDOM_CASES.length; index += 1) {
    await classifyKingdomOrganism(KINGDOM_CASES[index], KINGDOM_CASES[index + 1]?.name);
  }
  await active(".dk5-final:not([hidden])").waitFor({ state: "visible", timeout: 5000 });
  const finalState = await page.evaluate(() => {
    const root = document.querySelector(".screen.active");
    const slots = [...(root?.querySelectorAll(".dk5-slot") ?? [])];
    const final = root?.querySelector(".dk5-final");
    const stage = root?.querySelector(".dk5-stage");
    const cta = root?.querySelector(".cta");
    return {
      boardComplete: root?.querySelector(".dk5-board-shell")?.classList.contains("is-complete") ?? false,
      slots: slots.length,
      filledSlots: slots.filter((slot) => slot.classList.contains("is-filled")).length,
      tokens: root?.querySelectorAll(".dk5-mini-token").length ?? 0,
      slotCounts: slots.map((slot) => slot.querySelector(".dk5-slot-count")?.textContent?.trim()),
      finalVisible: final instanceof HTMLElement && !final.hidden,
      stageHidden: stage instanceof HTMLElement && stage.hidden,
      rows: final?.querySelectorAll(".dk5-table-body .dk5-table-row").length ?? 0,
      representatives: final?.querySelectorAll(".dk5-representative").length ?? 0,
      ctaEnabled: cta instanceof HTMLButtonElement && !cta.disabled,
      sheetOpen: root?.querySelector(".sheet")?.classList.contains("open") ?? false,
    };
  });
  invariant(finalState.boardComplete && finalState.slots === 5 && finalState.filledSlots === 5 && finalState.tokens === 5, `Kingdom completed slots mismatch: ${JSON.stringify(finalState)}`);
  invariant(finalState.slotCounts.every((count) => count === "1"), `Kingdom completed slot counts mismatch: ${JSON.stringify(finalState)}`);
  invariant(finalState.finalVisible && finalState.stageHidden && finalState.rows === 5 && finalState.representatives === 5, `Kingdom final comparison mismatch: ${JSON.stringify(finalState)}`);
  invariant(finalState.ctaEnabled && !finalState.sheetOpen, `Kingdom final comparison controls mismatch: ${JSON.stringify(finalState)}`);
  await assertKingdomVisuals("kingdom final comparison");
  await assertNoHorizontalOverflow("kingdom final comparison");
  await shot("final-table");
}

async function openRecapAndShot(tag) {
  await gotoSelector(".rc-cards");
  const toggle = active(".rc-toggle:visible").first();
  invariant(await toggle.count() > 0, `${tag}: recap detail toggle missing`);
  await toggle.click();
  await page.waitForTimeout(180);
  invariant(await active(".rc-card.open .rc-more").count() === 1, `${tag}: recap detail did not open`);
  await shot(`${tag}-recap-detail`, ".rc-card.open .rc-more");
}

async function captureFigureQuestion(tag) {
  await gotoSelector(".q-figure");
  const artCount = await active(".q-figure img, .q-figure svg").count();
  invariant(artCount > 0, `${tag}: figure question contains no image or SVG`);
  await shot(`${tag}-figure-question`, ".q-figure");
}

const lessons = [
  {
    id: "u2l1",
    tag: "l1",
    labTitle: /세포의 모양은/,
    runLab: completeFigTabs,
    labFocus: ".figtabs",
  },
  {
    id: "u2l2",
    tag: "l2",
    labTitle: /두 세포를 같은 현미경으로/,
    runLab: completeCompareMicroscope,
    labFocus: ".mic-stage",
  },
  {
    id: "u2l3",
    tag: "l3",
    labTitle: /동물의 몸을 작은 단위부터/,
    runLab: completeOrgLevels,
    labFocus: ".org-wrap",
  },
  {
    id: "u2l4",
    tag: "l4",
    labTitle: /학교 생태 지도를 세 렌즈로/,
    runLab: completeBiodiversityLab,
    labFocus: ".bd-stage",
    afterLab: completeFinchSim,
  },
  {
    id: "u2l5",
    tag: "l5",
    labTitle: /대표 생물을 만나며 5계를 완성해요/,
    runLab: classifyFirstOrganism,
    labFocus: ".dk5-stage",
  },
  {
    id: "u2l6",
    tag: "l6",
    labTitle: /생물 종류가 적을 때와 많을 때를 비교해요/,
    runLab: completeFigTabs,
    labFocus: ".figtabs",
  },
];

try {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3400);

  if (FINCH_ONLY) {
    await captureFinchOnly();
  } else if (KINGDOM_ONLY) {
    await captureKingdomOnly();
  } else {
    const unit2Tab = active(".unit-tab:visible").filter({ hasText: /^II\./ }).first();
    invariant(await unit2Tab.count() > 0, "Unit II tab missing from grade 1 home");
    await unit2Tab.click();
    await page.waitForTimeout(700);
    invariant(await active(".gm-node").count() >= 6, "Unit II map does not show six lesson nodes");
    if (!HOOKS_ONLY) await shot("map-u2", ".gamemap");

    for (const lesson of lessons) {
      await openLesson(lesson.id);
      await interactHook(lesson.id);
      await shot(`${lesson.tag}-hook`, ".hook-scene");
      if (HOOKS_ONLY) {
        await closeLesson();
        continue;
      }

      await gotoTitle(lesson.labTitle);
      await lesson.runLab();
      await shot(`${lesson.tag}-lab`, lesson.labFocus);
      if (lesson.afterLab) await lesson.afterLab();

      await openRecapAndShot(lesson.tag);
      await captureFigureQuestion(lesson.tag);
      await closeLesson();
    }
  }

  await assertNoPageErrors("final");
  const mode = FINCH_ONLY ? " [finch only]" : KINGDOM_ONLY ? " [kingdom only]" : HOOKS_ONLY ? " [hooks only]" : "";
  console.log(`DONE ${shotCount} screenshots (${BASE})${mode}`);
} finally {
  await browser.close();
}
