// 중2 V 식물과 에너지 6레슨 전용 실플레이 E2E.
// DEV 서버가 필요하다(data-oi 사용). PORT=5173 node qa/e2e-g2u5.mjs
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const PORT = process.env.PORT || "5173";
const CAPTURE = process.env.CAPTURE === "1";
const CAPTURE_LESSON = Math.min(6, Math.max(1, Number(process.env.CAPTURE_LESSON || 1)));
const SHOT_DIR = "tmp/g2u5-qa";
if (CAPTURE) await mkdir(SHOT_DIR, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (error) => {
  pageErrors += 1;
  console.log("PAGEERROR:", error.message);
});

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1,
    onboarded: true,
    grade: "g2",
    viewGrade: "g2",
    viewSubject: "sci",
    premium: true,
    reviewMode: true,
    goalMin: 10,
    streak: 2,
    lastStudyDay: null,
    totalXp: 1200,
    lessons: {},
    minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const W = (ms) => page.waitForTimeout(ms);
const active = ".screen.active";
const capture = async (name) => {
  if (CAPTURE) await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: false });
};
const heading = () => page.evaluate(() =>
  document.querySelector(".screen.active .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 48),
);

const openLesson = async (id) => {
  const count = await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(lessonId);
    if (!found) throw new Error(`레슨을 찾지 못했어요: ${lessonId}`);
    const lesson = found.lesson;
    window.__g2u5E2E = { steps: lesson.steps, done: null };
    nav.go(createLessonPlayer(lesson, {
      onExit: () => {},
      onComplete: (result) => { window.__g2u5E2E.done = result; },
    }));
    return lesson.steps.length;
  }, id);
  await W(780);
  console.log(`[${id}] ${await heading()} (${count} steps)`);
  return count;
};

const stepData = (index) => page.evaluate((i) => {
  const step = window.__g2u5E2E?.steps?.[i];
  if (!step) throw new Error(`스텝 ${i} 데이터를 찾지 못했어요`);
  return {
    type: step.type,
    mode: step.mode,
    answer: step.answer,
    items: step.items,
    panelCount: step.panels?.length ?? 0,
    bins: step.bins,
    spots: step.spots,
    hotspotMode: step.mode,
  };
}, index);

const clickCTA = async (timeout = 18000) => {
  await page.waitForFunction(() => {
    const button = document.querySelector(".screen.active button.cta");
    return button && !button.disabled;
  }, undefined, { timeout });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(520);
};

const clickBtn = async (pattern, wait = 420, timeout = 12000) => {
  await page.waitForFunction((source) => [...document.querySelectorAll(".screen.active button")]
    .some((button) => button.offsetParent && !button.disabled && new RegExp(source).test(button.textContent ?? "")), pattern, { timeout });
  const clicked = await page.evaluate((source) => {
    const button = [...document.querySelectorAll(".screen.active button")]
      .find((candidate) => candidate.offsetParent && !candidate.disabled && new RegExp(source).test(candidate.textContent ?? ""));
    button?.click();
    return button?.textContent?.trim() ?? null;
  }, pattern);
  if (!clicked) throw new Error(`버튼을 찾지 못했어요: /${pattern}/`);
  await W(wait);
  const lessonActive = await page.evaluate(() => document.querySelector(".lesson-screen.screen.active") !== null);
  if (!lessonActive) throw new Error(`버튼 /${pattern}/ 조작 뒤 레슨 화면이 닫혔어요`);
};

const hook = async () => {
  await page.waitForSelector(`${active} .plant-action`, { timeout: 10000 });
  await capture("hook");
  await page.evaluate(() => document.querySelector(".screen.active .plant-action").click());
  await page.waitForSelector(`${active} .hook-choices.show .hook-choice`, { timeout: 12000 });
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
  await W(360);
  await clickCTA();
};

const sheetContinue = async (timeout = 10000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(180);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(520);
};

const checkTransportToggle = async (prefix) => {
  const transportToggle = page.locator(`${active} .plant-transport-toggle`);
  if (!await transportToggle.count()) return;
  await transportToggle.scrollIntoViewIfNeeded();
  await page.locator(`${active} label[for="g2u5-transport-food"]`).click();
  await W(360);
  const foodVisible = await page.locator(`${active} .pt-scene-food`).evaluate((node) => {
    const image = node.querySelector("img");
    return getComputedStyle(node).display !== "none" && image?.complete && image.naturalWidth > 0;
  });
  if (!foodVisible) throw new Error("양분의 이동 토글 장면이 표시되지 않아요");
  await capture(`${prefix}-transport-food`);
  await page.locator(`${active} label[for="g2u5-transport-water"]`).click();
  await W(360);
  const waterVisible = await page.locator(`${active} .pt-scene-water`).evaluate((node) => {
    const image = node.querySelector("img");
    return getComputedStyle(node).display !== "none" && image?.complete && image.naturalWidth > 0;
  });
  if (!waterVisible) throw new Error("물의 이동 토글 장면이 표시되지 않아요");
  await capture(`${prefix}-transport-water`);
};

const quiz = async (step) => {
  await checkTransportToggle("question");
  if (CAPTURE && !quiz.figureCaptured && await page.locator(`${active} .q-figure`).count()) {
    await capture("figure-question");
    quiz.figureCaptured = true;
  }
  if (step.mode === "ox") {
    await page.waitForSelector(`${active} .ox-btn`, { timeout: 9000 });
    await page.evaluate((answer) => {
      document.querySelector(answer ? ".screen.active .ox-btn.o" : ".screen.active .ox-btn.x").click();
    }, step.answer);
  } else {
    const answers = Array.isArray(step.answer) ? step.answer : [step.answer];
    await page.waitForSelector(`${active} .opts .opt[data-oi]`, { timeout: 9000 });
    for (const answer of answers) {
      await page.evaluate((oi) => document.querySelector(`.screen.active .opts .opt[data-oi="${oi}"]`).click(), answer);
      await W(120);
    }
  }
  await clickCTA();
  await sheetContinue();
};

const order = async (step) => {
  await page.waitForSelector(`${active} .ord-chip`, { timeout: 9000 });
  for (const item of step.items) {
    const ok = await page.evaluate((html) => {
      const temp = document.createElement("span");
      temp.innerHTML = html;
      const wanted = (temp.textContent ?? "").replace(/\s+/g, " ").trim();
      const chip = [...document.querySelectorAll(".screen.active .ord-pool .ord-chip")]
        .find((candidate) => (candidate.textContent ?? "").replace(/\s+/g, " ").trim() === wanted);
      chip?.click();
      return Boolean(chip);
    }, item);
    if (!ok) throw new Error(`순서 칩을 찾지 못했어요: ${item}`);
    await W(160);
  }
  await clickCTA();
  await sheetContinue();
};

const binSort = async (step) => {
  await page.waitForSelector(`${active} .bin-tray .bin-chip`, { timeout: 9000 });
  for (const item of step.items) {
    const ok = await page.evaluate((binId) => {
      const chip = document.querySelector(".screen.active .bin-tray .bin-chip");
      const bin = document.querySelector(`.screen.active .bin[data-bin="${binId}"]`);
      if (!chip || !bin) return false;
      chip.click();
      (bin.querySelector(".bin-head") ?? bin).click();
      return true;
    }, item.bin);
    if (!ok) throw new Error(`분류 통을 찾지 못했어요: ${item.bin}`);
    await W(160);
  }
  await clickCTA();
  await sheetContinue();
};

const hotspot = async (step) => {
  await page.waitForSelector(`${active} .hs-dot`, { timeout: 9000 });
  for (let i = 0; i < step.spots.length; i += 1) {
    await page.evaluate((index) => document.querySelectorAll(".screen.active .hs-dot")[index].click(), i);
    await W(260);
  }
  if (step.hotspotMode === "find") await sheetContinue();
  else await clickCTA();
};

const figTabs = async () => {
  await page.waitForSelector(`${active} .figtabs`, { timeout: 9000 });
  const count = await page.evaluate(() => document.querySelectorAll(".screen.active .seg button").length);
  for (let i = 0; i < count; i += 1) {
    await page.evaluate((index) => document.querySelectorAll(".screen.active .seg button")[index].click(), i);
    await W(280);
  }
  await clickCTA();
};

const leafFactory = async () => {
  // 랩이 "밸브 3개(물관·기공 CO₂·빛) + 반응로 + 저장" 구조로 개편된 뒤의 조작(2026-07-26 갱신).
  //  products  = 셋 다 열고 반응 진행률 0.62까지
  //  lightOnly = products 달성 뒤 물관·기공을 닫고 빛만 남긴 채 420ms 유지
  //  storage   = "포도당을 녹말로 저장" 뒤 저장 진행률 1까지
  const setValve = async (name, open) => {
    await page.evaluate(({ name, open }) => {
      const button = [...document.querySelectorAll(".screen.active button")]
        .find((candidate) => candidate.textContent.trim().startsWith(name));
      if (!button) throw new Error(`${name} 밸브 버튼을 찾지 못했어요`);
      const closed = /닫힘/.test(button.textContent ?? "");
      if (open === closed) button.click();
    }, { name, open });
    await W(300);
  };
  await setValve("물관", true);
  await setValve("기공", true);
  await setValve("빛", true);
  await W(1500);
  await capture("lab-products");
  await setValve("물관", false);
  await setValve("기공", false);
  await W(1300);
  await clickBtn("포도당을 녹말로 저장", 1500);
  await capture("lab-goals-complete");
  const lit = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.plant.on").length);
  if (lit < 3) throw new Error(`leafFactoryLab: 목표 3개 중 ${lit}개만 켜졌어요`);
  await clickCTA();
};

const photoEvidence = async () => {
  // 랩 개편 후 조작(2026-07-26 갱신): ①빛 슬라이더 약→강 ②잎 가리개 드래그 뒤 검출(암처리 ON)
  // ③암처리를 끄고 다시 검출해 "생략하면 비교가 흐려짐"까지 확인해야 목표 3개가 채워진다.
  const slide = async (fraction) => {
    await page.evaluate((value) => {
      const slider = document.querySelector(".screen.active .plant-evidence-slider");
      const track = slider?.querySelector(".sl-track");
      if (!(track instanceof HTMLElement)) throw new Error("센서 슬라이더를 찾지 못했어요");
      const rect = track.getBoundingClientRect();
      const clientX = rect.left + rect.width * value;
      const init = { bubbles: true, pointerId: 51, isPrimary: true, clientX, clientY: rect.top + rect.height / 2 };
      slider.dispatchEvent(new PointerEvent("pointerdown", { ...init, buttons: 1 }));
      slider.dispatchEvent(new PointerEvent("pointermove", { ...init, buttons: 1 }));
      slider.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0 }));
    }, fraction);
    await W(320);
  };
  await slide(0.08);
  await slide(0.55);
  await slide(0.96);
  await W(700);
  // 잎 가리개: 캔버스 좌표(cx, cy=316)에서 오른쪽으로 끌어 일부만 가린다.
  await page.evaluate(() => {
    const cv = document.querySelector(".screen.active .plant-canvas");
    if (!cv) throw new Error("잎 캔버스를 찾지 못했어요");
    cv.scrollIntoView({ block: "center" });
    const r = cv.getBoundingClientRect();
    const p = (dx) => ({ x: r.left + r.width * 0.5 + dx, y: r.top + 316 });
    const ev = (type, pt, buttons) => cv.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 12, isPrimary: true, pointerType: "touch",
      clientX: pt.x, clientY: pt.y, buttons,
    }));
    ev("pointerdown", p(0), 1);
    ev("pointermove", p(28), 1);
    ev("pointermove", p(58), 1);
    ev("pointerup", p(58), 0);
  });
  await W(500);
  await clickBtn("아이오딘 검출|탈색·헹굼", 1400);
  await capture("evidence-iodine-result");
  await clickBtn("사전 암처리", 700);
  await clickBtn("아이오딘 검출|탈색·헹굼", 1400);
  const lit = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.plant.on").length);
  if (lit < 3) throw new Error(`photoEvidenceLab: 목표 3개 중 ${lit}개만 켜졌어요`);
  await clickCTA();
};

const photoFactor = async () => {
  const slide = async (fraction) => {
    await page.evaluate((value) => {
      const slider = document.querySelector(".screen.active .plant-factor-slider");
      const track = slider?.querySelector(".sl-track");
      if (!(slider instanceof HTMLElement) || !(track instanceof HTMLElement)) throw new Error("환경요인 슬라이더 없음");
      const rect = track.getBoundingClientRect();
      const clientX = rect.left + rect.width * value;
      const init = { bubbles: true, pointerId: 41, isPrimary: true, clientX, clientY: rect.top + rect.height / 2 };
      slider.dispatchEvent(new PointerEvent("pointerdown", { ...init, buttons: 1 }));
      slider.dispatchEvent(new PointerEvent("pointermove", { ...init, buttons: 1 }));
      slider.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0 }));
    }, fraction);
    await W(220);
  };
  await slide(0.1);
  await slide(0.96);
  await clickBtn("이산화 탄소 농도", 140);
  await slide(0.1);
  await slide(0.96);
  await clickBtn("^온도$", 140);
  await slide(0.5);
  await slide(0.9);
  await W(600);
  await page.locator(`${active} .plant-factor-slider`).scrollIntoViewIfNeeded();
  await capture("factor-slider-complete");
  await clickCTA();
};

const plantRespire = async () => {
  // 목표 3개(에너지 꺼내기·쓰기·밤에도 호흡) — 재료 투입만으로는 CTA가 안 열린다(2026-07-26 수정).
  await clickBtn("포도당 넣기", 220);
  await clickBtn("산소 넣기", 220);
  await clickBtn("호흡 시작", 1800);
  for (let i = 0; i < 10; i++) {
    const lit = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.plant.on").length);
    if (lit >= 3) break;
    const hit = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".screen.active button")]
        .filter((x) => x.offsetParent && !x.disabled)
        .find((x) => /어린싹 키우기|물질 운반하기|꽃·열매 만들기|빛 끄기|호흡 시작/.test(x.textContent ?? ""));
      if (!b) return null;
      b.click();
      return b.textContent.trim();
    });
    if (!hit) break;
    await W(900);
  }
  await clickCTA();
};

const dayNight = async () => {
  // 세 번째 목표 "순이동 0"은 |광합성량−호흡량|<0.045를 320ms 유지해야 잡힌다 →
  // 캔버스의 키보드 슬라이더(ArrowUp=0.025)를 한 칸씩 올리며 머문다(2026-07-26 추가).
  await clickBtn("강한 낮 보기", 320);
  await capture("day-night-day");
  await clickBtn("빛 없는 밤 보기", 460);
  await capture("day-night-night");
  await page.evaluate(() => document.querySelector(".screen.active .plant-canvas")?.focus());
  await page.keyboard.press("Home");
  await W(320);
  for (let i = 0; i < 42; i++) {
    const lit = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.plant.on").length);
    if (lit >= 3) break;
    await page.keyboard.press("ArrowUp");
    await W(380);
  }
  await clickCTA();
};

const sugarJourney = async () => {
  // 버튼 문구가 개편됐다(2026-07-26 갱신): 밤 전환 → 세 목적지 배송 버튼이 열린다.
  await clickBtn("밤으로", 1200);
  for (const pattern of ["어린잎·꽃으로", "열매·씨로", "뿌리로"]) {
    await clickBtn(pattern, 900);
  }
  for (let i = 0; i < 6; i++) {
    const lit = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.plant.on").length);
    if (lit >= 3) break;
    const hit = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".screen.active button")]
        .filter((x) => x.offsetParent && !x.disabled)
        .find((x) => /어린잎·꽃으로|열매·씨로|뿌리로|밤으로|낮으로/.test(x.textContent ?? ""));
      if (!b) return null;
      b.click();
      return b.textContent.trim();
    });
    if (!hit) break;
    await W(900);
  }
  await capture("journey-complete");
  const lit = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.plant.on").length);
  if (lit < 3) throw new Error(`sugarJourneyLab: 목표 3개 중 ${lit}개만 켜졌어요`);
  await clickCTA();
};

const conceptStep = async () => {
  const dayNightToggle = page.locator(`${active} .plant-day-night-toggle`);
  if (await dayNightToggle.count()) {
    await dayNightToggle.scrollIntoViewIfNeeded();
    await page.locator(`${active} label[for="g2u5-night-scene"]`).click();
    await W(360);
    const nightVisible = await page.locator(`${active} .dn-scene-night`).evaluate((node) => {
      const image = node.querySelector("img");
      return getComputedStyle(node).display !== "none" && image?.complete && image.naturalWidth > 0;
    });
    if (!nightVisible) throw new Error("밤 토글 장면이 표시되지 않아요");
    await capture("concept-night-toggle");
    await page.locator(`${active} label[for="g2u5-day-scene"]`).click();
    await W(360);
    const dayVisible = await page.locator(`${active} .dn-scene-day`).evaluate((node) => {
      const image = node.querySelector("img");
      return getComputedStyle(node).display !== "none" && image?.complete && image.naturalWidth > 0;
    });
    if (!dayVisible) throw new Error("낮 토글 장면이 표시되지 않아요");
    await capture("concept-day-toggle");
  }
  await checkTransportToggle("concept");
  await clickCTA();
};

const playStep = async (step, index) => {
  console.log(`  ${String(index + 1).padStart(2, "0")} ${step.type}: ${await heading()}`);
  if (step.type === "hook") return hook();
  if (step.type === "leafFactoryLab") return leafFactory();
  if (step.type === "photoEvidenceLab") return photoEvidence();
  if (step.type === "photoFactorLab") return photoFactor();
  if (step.type === "plantRespireLab") return plantRespire();
  if (step.type === "dayNightLab") return dayNight();
  if (step.type === "sugarJourneyLab") return sugarJourney();
  if (step.type === "quiz") return quiz(step);
  if (step.type === "order") return order(step);
  if (step.type === "binSort") return binSort(step);
  if (step.type === "hotspot") return hotspot(step);
  if (step.type === "figTabs") return figTabs();
  if (step.type === "recap" && CAPTURE) {
    await page.waitForSelector(`${active} .rc-toggle`, { timeout: 9000 });
    await page.evaluate(() => document.querySelector(".screen.active .rc-toggle").click());
    await W(320);
    await capture("recap-more-open");
    return clickCTA();
  }
  if (step.type === "comic") {
    // 컷 수만큼 CTA를 눌러 넘긴다(마지막 컷에서 다음 스텝으로).
    for (let i = 0; i < step.panelCount; i++) await clickCTA();
    return;
  }
  if (step.type === "concept") return conceptStep();
  if (["recap", "table"].includes(step.type)) return clickCTA();
  throw new Error(`E2E 조작이 정의되지 않은 스텝이에요: ${step.type}`);
};

try {
  const lessonStart = CAPTURE ? CAPTURE_LESSON : 1;
  const lessonLimit = CAPTURE ? CAPTURE_LESSON : 6;
  for (let lessonNo = lessonStart; lessonNo <= lessonLimit; lessonNo += 1) {
    const id = `g2u5l${lessonNo}`;
    const count = await openLesson(id);
    for (let index = 0; index < count; index += 1) {
      await playStep(await stepData(index), index);
    }
    await page.waitForFunction(() => window.__g2u5E2E?.done !== null, undefined, { timeout: 15000 });
    const result = await page.evaluate(() => window.__g2u5E2E.done);
    console.log(`  완료: 정확도 ${result.acc}% · ${result.correct}/${result.total}`);
  }

  if (pageErrors > 0) throw new Error(`페이지 오류 ${pageErrors}건`);
  console.log(CAPTURE ? "중2 V 식물과 에너지 캡처 주행 PASS" : "중2 V 식물과 에너지 6레슨 E2E PASS");
} catch (error) {
  console.log("E2E FAIL:", error.message);
  console.log("현재 제목:", await heading());
  await page.screenshot({ path: "qa/e2e-g2u5-fail.png", fullPage: true });
  process.exitCode = 1;
} finally {
  await browser.close();
}
