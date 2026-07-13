// 중1 II 생물의 구성과 다양성 - 6레슨 전 스텝 실플레이 E2E.
// 실행: PORT=5173 node qa/e2e-u2.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const ACTIVE = ".screen.active";
const NAV_WAIT = 600;
const FAIL_SHOT = "qa/e2e-u2-fail.png";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 420, height: 900 },
  deviceScaleFactor: 2,
});
const pageErrors = [];
page.on("pageerror", (error) => {
  pageErrors.push(error.message);
  console.log("PAGEERROR:", error.message);
});

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1,
    onboarded: true,
    grade: "g1",
    viewGrade: "g1",
    viewSubject: "sci",
    premium: false,
    reviewMode: false,
    goalMin: 10,
    streak: 0,
    lastStudyDay: null,
    totalXp: 0,
    lessons: {},
    minigame: {},
  }));
});

const W = (ms) => page.waitForTimeout(ms);
const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const rx = (re) => ({ source: re.source, flags: re.flags });

const currentTitle = () => page.evaluate((active) => {
  const root = document.querySelector(active);
  const heading = root?.querySelector(".h1");
  return heading instanceof HTMLElement ? heading.innerText.replace(/\s+/g, " ").trim() : "";
}, ACTIVE);

const assertVisibleImages = async (label) => {
  await W(180);
  const missing = await page.evaluate((active) => {
    const root = document.querySelector(active);
    if (!root) return ["활성 화면 없음"];
    return [...root.querySelectorAll("img")]
      .filter((img) => {
        const style = getComputedStyle(img);
        const rect = img.getBoundingClientRect();
        const visible = style.display !== "none"
          && style.visibility !== "hidden"
          && Number(style.opacity || "1") > 0
          && rect.width > 0
          && rect.height > 0
          && rect.bottom > 0
          && rect.right > 0
          && rect.top < innerHeight
          && rect.left < innerWidth;
        return visible && (!img.complete || img.naturalWidth === 0);
      })
      .map((img) => img.currentSrc || img.getAttribute("src") || img.alt || "알 수 없는 이미지");
  }, ACTIVE);
  if (missing.length) throw new Error(`${label}: 보이지 않는 이미지가 있습니다: ${missing.join(", ")}`);
};

const expectTitle = async (re, timeout = 12000) => {
  await page.waitForFunction(({ active, pattern }) => {
    const heading = document.querySelector(active)?.querySelector(".h1");
    const text = heading instanceof HTMLElement ? heading.innerText.replace(/\s+/g, " ").trim() : "";
    return new RegExp(pattern.source, pattern.flags).test(text);
  }, { active: ACTIVE, pattern: rx(re) }, { timeout });
  const title = await currentTitle();
  if (!re.test(title)) throw new Error(`제목 불일치: /${re.source}/, 현재 "${title}"`);
  await assertVisibleImages(title);
  return title;
};

const ctaDisabled = () => page.evaluate((active) => {
  const button = document.querySelector(active)?.querySelector("button.cta");
  return button instanceof HTMLButtonElement ? button.disabled : null;
}, ACTIVE);

const assertCtaDisabled = async (label) => {
  const disabled = await ctaDisabled();
  if (disabled !== true) throw new Error(`${label}: 시작 CTA가 잠겨 있지 않습니다`);
};

const assertCtaEnabled = async (label) => {
  const disabled = await ctaDisabled();
  if (disabled !== false) throw new Error(`${label}: 완료 후 CTA가 열리지 않았습니다`);
};

const clickCTA = async (timeout = 16000) => {
  await page.waitForFunction((active) => {
    const button = document.querySelector(active)?.querySelector("button.cta");
    return button instanceof HTMLButtonElement && !button.disabled;
  }, ACTIVE, { timeout });
  await page.evaluate((active) => {
    const button = document.querySelector(active)?.querySelector("button.cta");
    if (!(button instanceof HTMLButtonElement)) throw new Error("활성 CTA 없음");
    button.click();
  }, ACTIVE);
  await W(NAV_WAIT);
};

const clickButtonText = async (re, wait = 440) => {
  const clicked = await page.evaluate(({ active, pattern }) => {
    const root = document.querySelector(active);
    const matcher = new RegExp(pattern.source, pattern.flags);
    const button = [...(root?.querySelectorAll("button") ?? [])]
      .find((item) => !item.disabled && item.getClientRects().length > 0 && matcher.test(item.textContent ?? ""));
    if (!button) return null;
    const text = button.textContent?.replace(/\s+/g, " ").trim() ?? "";
    button.click();
    return text;
  }, { active: ACTIVE, pattern: rx(re) });
  if (clicked === null) throw new Error(`버튼을 찾지 못했습니다: /${re.source}/`);
  await W(wait);
  return clicked;
};

const hookChoice = async (re) => {
  await page.waitForSelector(`${ACTIVE} .hook-choices.show .hook-choice`, { timeout: 10000 });
  const clicked = await page.evaluate(({ active, pattern }) => {
    const matcher = new RegExp(pattern.source, pattern.flags);
    const choice = [...document.querySelectorAll(`${active} .hook-choices.show .hook-choice`)]
      .find((item) => matcher.test(item.textContent ?? ""));
    if (!choice) return null;
    const text = choice.textContent?.replace(/\s+/g, " ").trim() ?? "";
    choice.click();
    return text;
  }, { active: ACTIVE, pattern: rx(re) });
  if (clicked === null) throw new Error(`훅 정답을 찾지 못했습니다: /${re.source}/`);
  await W(460);
};

const sheetContinue = async (timeout = 10000) => {
  await page.waitForSelector(`${ACTIVE} .sheet.open`, { timeout });
  await W(220);
  await page.evaluate((active) => {
    const button = document.querySelector(active)?.querySelector(".sheet.open .sheet-card button");
    if (!(button instanceof HTMLButtonElement)) throw new Error("피드백 계속하기 버튼 없음");
    button.click();
  }, ACTIVE);
  await W(NAV_WAIT);
};

const openNextLesson = async (expectedLabel) => {
  await page.waitForSelector("#sc-home.screen.active", { timeout: 12000 });
  const tabClicked = await page.evaluate((active) => {
    const root = document.querySelector(active);
    const tab = [...(root?.querySelectorAll(".unit-tab") ?? [])]
      .find((item) => item.textContent?.includes("생물의 구성과 다양성"));
    if (!tab) return false;
    tab.click();
    return true;
  }, ACTIVE);
  if (!tabClicked) throw new Error("II. 생물의 구성과 다양성 단원 탭을 찾지 못했습니다");
  await W(700);

  await page.waitForSelector(`${ACTIVE} .gm-node.now:not(.game)`, { timeout: 10000 });
  const nodeLabel = await page.evaluate((active) => {
    const node = document.querySelector(active)?.querySelector(".gm-node.now:not(.game)");
    return node?.querySelector(".gm-label")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  }, ACTIVE);
  if (normalize(nodeLabel) !== expectedLabel) {
    throw new Error(`순차 레슨 노드 불일치: 기대 "${expectedLabel}", 실제 "${nodeLabel}"`);
  }
  await page.evaluate((active) => {
    const node = document.querySelector(active)?.querySelector(".gm-node.now:not(.game)");
    if (!(node instanceof HTMLButtonElement)) throw new Error("현재 레슨 노드 없음");
    node.click();
  }, ACTIVE);
  await W(900);
  console.log(`[${expectedLabel}] 시작 -> ${await currentTitle()}`);
};

const finishLesson = async (lessonId) => {
  await page.waitForSelector(`${ACTIVE} .done-title`, { timeout: 14000 });
  await assertVisibleImages(`${lessonId} 완료 화면`);
  const saved = await page.evaluate((id) => {
    const state = JSON.parse(localStorage.getItem("science-app.v1") ?? "{}");
    return state.lessons?.[id]?.done === true;
  }, lessonId);
  if (!saved) throw new Error(`${lessonId}: 완료 상태가 저장되지 않았습니다`);
  if (pageErrors.length) throw new Error(`${lessonId}: pageerror 발생: ${pageErrors.join(" | ")}`);
  await clickButtonText(/^홈으로$/, 900);
  await page.waitForSelector("#sc-home.screen.active", { timeout: 10000 });
  console.log(`  ${lessonId} 완료/홈 복귀 OK`);
};

const runCellZoomHook = async () => {
  await expectTitle(/끝없이 확대/);
  await assertCtaDisabled("세포 확대 훅");
  await clickButtonText(/확대경으로 팔을 들여다보기/, 1700);
  await assertCtaEnabled("세포 확대 훅");
  await clickCTA();
};

const runStainHook = async () => {
  await expectTitle(/왜 안 보일까요/);
  await assertCtaDisabled("염색 훅");
  await clickButtonText(/염색액 한 방울 떨어뜨리기/, 1050);
  await hookChoice(/특정 부분.*물들여/);
  await assertCtaEnabled("염색 훅");
  await clickCTA();
};

const runBodyCountHook = async () => {
  await expectTitle(/세포가 몇 개/);
  await assertCtaDisabled("몸속 세포 수 훅");
  await hookChoice(/수십조/);
  await assertCtaEnabled("몸속 세포 수 훅");
  await clickCTA();
};

const runFingerprintHook = async () => {
  await expectTitle(/지문은 왜 다를까요/);
  await assertCtaDisabled("지문 훅");
  const count = await page.evaluate((active) => document.querySelectorAll(`${active} .fp-card`).length, ACTIVE);
  if (count < 3) throw new Error(`지문 카드가 부족합니다: ${count}`);
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(({ active, index }) => {
      const card = document.querySelectorAll(`${active} .fp-card`)[index];
      if (!card) throw new Error(`지문 카드 ${index} 없음`);
      card.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, { active: ACTIVE, index: i });
    await W(180);
  }
  await hookChoice(/변이/);
  await assertCtaEnabled("지문 훅");
  await clickCTA();
};

const runBatBirdHook = async () => {
  await expectTitle(/박쥐는 새와 가까울까요/);
  await assertCtaDisabled("박쥐 분류 훅");
  await hookChoice(/다람쥐/);
  await assertCtaEnabled("박쥐 분류 훅");
  await clickCTA();
};

const runFoodWebHook = async () => {
  await expectTitle(/한 종류가 사라진다면/);
  await assertCtaDisabled("먹이망 훅");
  await clickButtonText(/메뚜기가 사라진 상황 보기/, 1250);
  await hookChoice(/연결된 여러 개체군/);
  await assertCtaEnabled("먹이망 훅");
  await clickCTA();
};

const hotspotAll = async (titleRe) => {
  const title = await expectTitle(titleRe);
  await assertCtaDisabled(title);
  await page.waitForSelector(`${ACTIVE} .hs-dot`, { timeout: 9000 });
  const count = await page.evaluate((active) => document.querySelectorAll(`${active} .hs-dot`).length, ACTIVE);
  if (!count) throw new Error(`${title}: 핫스폿 없음`);
  for (let i = 0; i < count; i += 1) {
    await page.evaluate(({ active, index }) => {
      const dot = document.querySelectorAll(`${active} .hs-dot`)[index];
      if (!(dot instanceof HTMLButtonElement)) throw new Error(`핫스폿 ${index} 없음`);
      dot.click();
    }, { active: ACTIVE, index: i });
    await W(180);
  }
  const on = await page.evaluate((active) => document.querySelectorAll(`${active} .hs-dot.on`).length, ACTIVE);
  if (on !== count) throw new Error(`${title}: 핫스폿 완료 ${on}/${count}`);
  await assertCtaEnabled(title);
  await clickCTA();
};

const figTabsAll = async (titleRe) => {
  const title = await expectTitle(titleRe);
  await assertCtaDisabled(title);
  await page.waitForSelector(`${ACTIVE} .figtabs`, { timeout: 9000 });
  const count = await page.evaluate((active) => document.querySelectorAll(`${active} .seg button`).length, ACTIVE);
  if (count < 2) throw new Error(`${title}: 비교 탭이 부족합니다`);
  for (let i = 0; i < count; i += 1) {
    await page.evaluate(({ active, index }) => {
      const button = document.querySelectorAll(`${active} .seg button`)[index];
      if (!(button instanceof HTMLButtonElement)) throw new Error(`그림 탭 ${index} 없음`);
      button.click();
    }, { active: ACTIVE, index: i });
    await W(180);
    await assertVisibleImages(`${title} 탭 ${i + 1}`);
  }
  await assertCtaEnabled(title);
  await clickCTA();
};

const recapOpenOne = async (titleRe) => {
  const title = await expectTitle(titleRe);
  const opened = await page.evaluate((active) => {
    const card = document.querySelector(active)?.querySelector(".rc-card.has-more");
    if (!(card instanceof HTMLElement)) return false;
    const toggle = card.querySelector(".rc-toggle");
    if (toggle instanceof HTMLButtonElement) toggle.click();
    else card.click();
    return true;
  }, ACTIVE);
  if (!opened) throw new Error(`${title}: 펼칠 수 있는 정리 카드가 없습니다`);
  await W(300);
  const detailVisible = await page.evaluate((active) => {
    const more = document.querySelector(active)?.querySelector(".rc-card.open .rc-more");
    return more instanceof HTMLElement && getComputedStyle(more).display !== "none" && more.textContent.trim().length > 0;
  }, ACTIVE);
  if (!detailVisible) throw new Error(`${title}: 정리 카드 자세히가 열리지 않았습니다`);
  await assertVisibleImages(`${title} 자세히`);
  await clickCTA();
};

const pairMatchAuto = async (titleRe, pairs) => {
  const title = await expectTitle(titleRe);
  await assertCtaDisabled(title);
  await page.waitForSelector(`${ACTIVE} .pm-chip.pm-a`, { timeout: 9000 });
  for (const [left, right] of pairs) {
    const result = await page.evaluate(({ active, leftText, rightText }) => {
      const norm = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
      const leftChip = [...document.querySelectorAll(`${active} .pm-chip.pm-a`)]
        .find((item) => norm(item.textContent) === leftText);
      const rightChip = [...document.querySelectorAll(`${active} .pm-chip.pm-b`)]
        .find((item) => norm(item.textContent) === rightText);
      if (!leftChip) return `왼쪽 없음: ${leftText}`;
      if (!rightChip) return `오른쪽 없음: ${rightText}`;
      leftChip.click();
      rightChip.click();
      return true;
    }, { active: ACTIVE, leftText: left, rightText: right });
    if (result !== true) throw new Error(`${title}: ${result}`);
    await W(180);
  }
  const matched = await page.evaluate((active) => document.querySelectorAll(`${active} .pm-chip.ok`).length, ACTIVE);
  if (matched !== pairs.length * 2) throw new Error(`${title}: 짝 완료 칩 ${matched}/${pairs.length * 2}`);
  await sheetContinue();
};

const orderAuto = async (titleRe, items) => {
  const title = await expectTitle(titleRe);
  await assertCtaDisabled(title);
  await page.waitForSelector(`${ACTIVE} .ord-pool .ord-chip`, { timeout: 9000 });
  for (const text of items) {
    const found = await page.evaluate(({ active, wanted }) => {
      const norm = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
      const chip = [...document.querySelectorAll(`${active} .ord-pool .ord-chip`)]
        .find((item) => norm(item.textContent) === wanted);
      if (!chip) return false;
      chip.click();
      return true;
    }, { active: ACTIVE, wanted: text });
    if (!found) throw new Error(`${title}: 순서 칩 없음 - ${text}`);
    await W(190);
  }
  await assertCtaEnabled(title);
  await clickCTA();
  await sheetContinue();
};

const binSortAuto = async (titleRe, pairs) => {
  const title = await expectTitle(titleRe);
  await assertCtaDisabled(title);
  await page.waitForSelector(`${ACTIVE} .bin-tray .bin-chip`, { timeout: 9000 });
  for (const [chipText, binText] of pairs) {
    const result = await page.evaluate(({ active, chipWanted, binWanted }) => {
      const norm = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
      const chip = [...document.querySelectorAll(`${active} .bin-tray .bin-chip`)]
        .find((item) => norm(item.textContent) === chipWanted);
      if (!chip) return `카드 없음: ${chipWanted}`;
      const bin = [...document.querySelectorAll(`${active} .bin`)]
        .find((item) => norm(item.querySelector(".bin-label")?.textContent) === binWanted);
      if (!bin) return `분류함 없음: ${binWanted}`;
      chip.click();
      (bin.querySelector(".bin-head") ?? bin).click();
      return true;
    }, { active: ACTIVE, chipWanted: chipText, binWanted: binText });
    if (result !== true) throw new Error(`${title}: ${result}`);
    await W(190);
  }
  await assertCtaEnabled(title);
  await clickCTA();
  await sheetContinue();
};

const answerMcq = async (titleRe, index) => {
  const title = await expectTitle(titleRe);
  await assertCtaDisabled(title);
  await page.waitForSelector(`${ACTIVE} .opts .opt`, { timeout: 9000 });
  await page.evaluate(({ active, answer }) => {
    const option = document.querySelector(`${active} .opts .opt[data-oi="${answer}"]`);
    if (!(option instanceof HTMLButtonElement)) throw new Error(`객관식 보기 ${answer} 없음`);
    option.click();
  }, { active: ACTIVE, answer: index });
  await W(180);
  await clickCTA();
  await sheetContinue();
};

const answerMulti = async (titleRe, indices) => {
  const title = await expectTitle(titleRe);
  await assertCtaDisabled(title);
  await page.waitForSelector(`${ACTIVE} .opts .opt`, { timeout: 9000 });
  for (const index of indices) {
    await page.evaluate(({ active, answer }) => {
      const option = document.querySelector(`${active} .opts .opt[data-oi="${answer}"]`);
      if (!(option instanceof HTMLButtonElement)) throw new Error(`복수 선택 보기 ${answer} 없음`);
      option.click();
    }, { active: ACTIVE, answer: index });
    await W(150);
  }
  await clickCTA();
  await sheetContinue();
};

const answerOx = async (titleRe, value) => {
  const title = await expectTitle(titleRe);
  await assertCtaDisabled(title);
  await page.waitForSelector(`${ACTIVE} .ox-btn`, { timeout: 9000 });
  await page.evaluate(({ active, answer }) => {
    const button = document.querySelector(`${active} .ox-btn.${answer ? "o" : "x"}`);
    if (!(button instanceof HTMLButtonElement)) throw new Error("OX 보기 없음");
    button.click();
  }, { active: ACTIVE, answer: value });
  await W(180);
  await clickCTA();
  await sheetContinue();
};

const focusMicroscopeByPointer = async (fraction, pointerId) => {
  await page.evaluate(({ active, target, id }) => {
    const slider = document.querySelector(active)?.querySelector(".mic-focus");
    const track = slider?.querySelector(".sl-track");
    if (!(slider instanceof HTMLElement) || !(track instanceof HTMLElement)) throw new Error("현미경 초점 슬라이더 없음");
    const rect = track.getBoundingClientRect();
    const init = { bubbles: true, pointerId: id, pointerType: "mouse", isPrimary: true, clientX: rect.left + rect.width * target, clientY: rect.top + rect.height / 2 };
    slider.dispatchEvent(new PointerEvent("pointerdown", { ...init, buttons: 1 }));
    slider.dispatchEvent(new PointerEvent("pointermove", { ...init, buttons: 1 }));
    slider.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0 }));
  }, { active: ACTIVE, target: fraction, id: pointerId });
  await W(260);
};

const focusMicroscopeByKeyboard = async () => {
  const slider = page.locator(`${ACTIVE} .mic-focus`);
  await slider.focus();
  for (let i = 0; i < 8; i += 1) await page.keyboard.press("ArrowRight");
  await W(260);
};

const stressMicroscopeFocus = async () => {
  const result = await page.evaluate(async (active) => {
    const slider = document.querySelector(active)?.querySelector(".mic-focus");
    const track = slider?.querySelector(".sl-track");
    const canvas = document.querySelector(active)?.querySelector(".mic-canvas");
    if (!(slider instanceof HTMLElement) || !(track instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error("현미경 스트레스 테스트 요소 없음");
    }
    const rect = track.getBoundingClientRect();
    const pointerId = 77;
    const eventAt = (type, fraction, buttons) => slider.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      pointerId,
      pointerType: "mouse",
      isPrimary: true,
      buttons,
      clientX: rect.left + rect.width * fraction,
      clientY: rect.top + rect.height / 2,
    }));
    const started = performance.now();
    eventAt("pointerdown", 0.1, 1);
    for (let i = 0; i < 480; i += 1) eventAt("pointermove", (i % 97) / 96, 1);
    eventAt("pointerup", 0.2, 0);
    const dispatchMs = performance.now() - started;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const cssWidth = canvas.getBoundingClientRect().width;
    return { dispatchMs, cssWidth, bitmapWidth: canvas.width, bitmapHeight: canvas.height };
  }, ACTIVE);
  if (result.dispatchMs > 250) throw new Error(`현미경 초점 480회 입력이 너무 느려요: ${result.dispatchMs.toFixed(1)}ms`);
  if (result.bitmapWidth > result.cssWidth * 1.55 + 2 || result.bitmapHeight > 380) {
    throw new Error(`현미경 캔버스 DPR 상한 불일치: ${JSON.stringify(result)}`);
  }
  console.log(`  현미경 초점 스트레스 480회: ${result.dispatchMs.toFixed(1)}ms · ${result.bitmapWidth}×${result.bitmapHeight}px`);
};

const runCompareMicroscope = async () => {
  const title = await expectTitle(/두 세포를 같은 현미경으로 비교/);
  await assertCtaDisabled(title);
  await clickButtonText(/메틸렌 블루 한 방울/, 260);
  await stressMicroscopeFocus();
  await focusMicroscopeByPointer(0.70, 41);
  let goals = await page.evaluate((active) => document.querySelectorAll(`${active} .mic-goal.on`).length, ACTIVE);
  if (goals !== 1) throw new Error(`현미경 저배율 목표 불일치: ${goals}/1`);
  await clickButtonText(/^대물 40배$/, 260);
  await focusMicroscopeByKeyboard();
  const plantUnlocked = await page.evaluate((active) => {
    const buttons = document.querySelectorAll(`${active} .mic-specimens button`);
    return buttons.length === 2 && !(buttons[1]).disabled;
  }, ACTIVE);
  if (!plantUnlocked) throw new Error("입안 상피세포 관찰 뒤 검정말 탭이 열리지 않았습니다");

  await page.evaluate((active) => {
    const plant = document.querySelectorAll(`${active} .mic-specimens button`)[1];
    if (!(plant instanceof HTMLButtonElement) || plant.disabled) throw new Error("검정말 표본 탭 없음");
    plant.click();
  }, ACTIVE);
  await W(260);
  await clickButtonText(/물 한 방울로 표본 준비하기/, 260);
  await focusMicroscopeByPointer(0.70, 42);
  await clickButtonText(/^대물 40배$/, 260);
  await focusMicroscopeByKeyboard();

  goals = await page.evaluate((active) => document.querySelectorAll(`${active} .mic-goal.on`).length, ACTIVE);
  if (goals !== 3) throw new Error(`현미경 비교 목표 불일치: ${goals}/3`);
  const canvas = await page.evaluate((active) => {
    const node = document.querySelector(active)?.querySelector(".mic-canvas");
    if (!(node instanceof HTMLCanvasElement)) return { pixels: 0, green: 0, mag: "" };
    const context = node.getContext("2d");
    if (!context || !node.width || !node.height) return { pixels: 0, green: 0, mag: "" };
    const data = context.getImageData(0, 0, node.width, node.height).data;
    let pixels = 0;
    let green = 0;
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a > 10) pixels += 1;
      if (a > 80 && g > r * 1.08 && g > b * 1.04) green += 1;
    }
    return {
      pixels,
      green,
      mag: document.querySelector(active)?.querySelector(".mic-mag")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    };
  }, ACTIVE);
  if (canvas.pixels < 1000 || canvas.green < 20) throw new Error(`현미경 캔버스 이상: pixels=${canvas.pixels}, green=${canvas.green}`);
  if (!canvas.mag.includes("400")) throw new Error(`현미경 총배율이 400배가 아닙니다: ${canvas.mag}`);
  await assertCtaEnabled(title);
  await clickCTA();
};

const orgLevelsAll = async (titleRe) => {
  const title = await expectTitle(titleRe);
  await assertCtaDisabled(title);
  let moves = 0;
  for (; moves < 12; moves += 1) {
    const hidden = await page.evaluate((active) => {
      const button = document.querySelector(active)?.querySelector(".org-up");
      return !(button instanceof HTMLButtonElement) || button.classList.contains("hidden");
    }, ACTIVE);
    if (hidden) break;
    await page.evaluate((active) => {
      const button = document.querySelector(active)?.querySelector(".org-up");
      if (!(button instanceof HTMLButtonElement)) throw new Error("구성 단계 올리기 버튼 없음");
      button.click();
    }, ACTIVE);
    await W(220);
  }
  if (!moves || moves >= 12) throw new Error(`${title}: 구성 단계 완주 실패 (${moves})`);
  await assertCtaEnabled(title);
  await clickCTA();
};

const runBiodiversityLab = async () => {
  const title = await expectTitle(/학교 생태 지도를 세 렌즈로/);
  await assertCtaDisabled(title);
  const ecoCount = await page.evaluate((active) => document.querySelectorAll(`${active} .bd-eco-btn`).length, ACTIVE);
  if (ecoCount !== 3) throw new Error(`생태계 비교 버튼 수 불일치: ${ecoCount}`);
  for (let i = 0; i < ecoCount; i += 1) {
    await page.evaluate(({ active, index }) => document.querySelectorAll(`${active} .bd-eco-btn`)[index]?.click(), { active: ACTIVE, index: i });
    await W(190);
  }

  const lensCount = await page.evaluate((active) => document.querySelectorAll(`${active} .bd-lens-btn`).length, ACTIVE);
  if (lensCount !== 3) throw new Error(`다양성 렌즈 버튼 수 불일치: ${lensCount}`);
  await page.evaluate((active) => document.querySelectorAll(`${active} .bd-lens-btn`)[1]?.click(), ACTIVE);
  await W(240);
  const specimenCount = await page.evaluate((active) => document.querySelectorAll(`${active} .bd-specimen`).length, ACTIVE);
  if (specimenCount < 4) throw new Error(`생물 종류 표본 수 부족: ${specimenCount}`);
  for (let i = 0; i < 4; i += 1) {
    await page.evaluate(({ active, index }) => document.querySelectorAll(`${active} .bd-specimen`)[index]?.click(), { active: ACTIVE, index: i });
    await W(160);
  }

  await page.evaluate((active) => document.querySelectorAll(`${active} .bd-lens-btn`)[2]?.click(), ACTIVE);
  await W(240);
  for (let i = 0; i < 2; i += 1) {
    await page.evaluate(({ active, index }) => document.querySelectorAll(`${active} .bd-bug`)[index]?.click(), { active: ACTIVE, index: i });
    await W(150);
  }
  await page.evaluate((active) => {
    const button = document.querySelector(active)?.querySelector(".bd-compare-btn");
    if (!(button instanceof HTMLButtonElement) || button.disabled) throw new Error("개체 차이 비교 버튼이 준비되지 않았습니다");
    button.click();
  }, ACTIVE);
  await W(320);
  const goals = await page.evaluate((active) => document.querySelectorAll(`${active} .bd-goal.on`).length, ACTIVE);
  if (goals !== 3) throw new Error(`생물다양성 랩 목표 불일치: ${goals}/3`);
  await assertCtaEnabled(title);
  await clickCTA();
};

const runFinchSim = async () => {
  const title = await expectTitle(/서로 다른 섬에서 어떤 부리가/);
  await assertCtaDisabled(title);

  const initial = await page.evaluate((active) => {
    const root = document.querySelector(active);
    const start = root?.querySelector(".fs-start");
    return {
      birds: root?.querySelectorAll(".fs-bird").length ?? 0,
      rows: root?.querySelectorAll(".fs-flock-row").length ?? 0,
      startLocked: start instanceof HTMLButtonElement && start.disabled,
    };
  }, ACTIVE);
  if (initial.birds !== 12 || initial.rows !== 3 || !initial.startLocked) {
    throw new Error(`핀치 초기 집단 불일치: 새 ${initial.birds}/12, 부리형 ${initial.rows}/3, 시작 잠금 ${initial.startLocked}`);
  }

  await clickButtonText(/씨앗 섬/, 180);
  await clickButtonText(/먹이 경쟁 시작/, 1650);
  const seedResult = await page.evaluate((active) => {
    const root = document.querySelector(active);
    return {
      survives: root?.querySelectorAll(".fs-bird.fs-survives").length ?? 0,
      dimmed: root?.querySelectorAll(".fs-bird.fs-dimmed").length ?? 0,
      seedGoal: root?.querySelector('.fs-goal[data-g="seed"].on') !== null,
    };
  }, ACTIVE);
  if (seedResult.survives !== 4 || seedResult.dimmed !== 8 || !seedResult.seedGoal) {
    throw new Error(`씨앗 섬 결과 불일치: 생존 ${seedResult.survives}/4, 탈락 ${seedResult.dimmed}/8, 목표 ${seedResult.seedGoal}`);
  }

  await clickButtonText(/곤충 섬/, 180);
  await clickButtonText(/먹이 경쟁 시작/, 1550);
  await page.waitForSelector(`${ACTIVE} .sheet.open`, { timeout: 5000 });
  const comparison = await page.evaluate((active) => {
    const root = document.querySelector(active);
    return {
      goals: root?.querySelectorAll(".fs-goal.on").length ?? 0,
      cards: root?.querySelectorAll(".fs-compare-card").length ?? 0,
      sheetOpen: root?.querySelector(".sheet.open") !== null,
    };
  }, ACTIVE);
  if (comparison.goals !== 3 || comparison.cards !== 2 || !comparison.sheetOpen) {
    throw new Error(`핀치 비교 완료 불일치: 목표 ${comparison.goals}/3, 비교 카드 ${comparison.cards}/2, 완료 시트 ${comparison.sheetOpen}`);
  }
  await sheetContinue();
};

const runClassificationConcept = async () => {
  const title = await expectTitle(/관찰하고 비교해서 기준을 세워요/);
  const details = await page.evaluate((active) => {
    const root = document.querySelector(active);
    const image = root?.querySelector('img[src*="bio2/cuts/classify.webp"]');
    return {
      figures: root?.querySelectorAll(".c-figure").length ?? 0,
      imageOk: image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
    };
  }, ACTIVE);
  if (details.figures < 2 || !details.imageOk) throw new Error(`${title}: 분류 개념 그림이 완전하지 않습니다`);
  await clickCTA();
};

const runKingdomTable = async () => {
  const title = await expectTitle(/지구의 생물을 다섯 계로/);
  const rows = await page.evaluate((active) => document.querySelectorAll(`${active} .tbl .trow`).length, ACTIVE);
  if (rows !== 6) throw new Error(`${title}: 5계 표 행 수 불일치 (${rows})`);
  await clickCTA();
};

const runDichotomKey = async () => {
  const title = await expectTitle(/특징 검색표로 5계 분류/);
  await assertCtaDisabled(title);
  const paths = {
    대장균: [false],
    아메바: [true, true],
    송이버섯: [true, false, false, false],
    소나무: [true, false, true],
    붕어: [true, false, false, true],
  };
  const completed = new Set();
  for (let guard = 0; guard < 7; guard += 1) {
    const sheetOpen = await page.evaluate((active) => document.querySelector(`${active} .sheet.open`) !== null, ACTIVE);
    if (sheetOpen) break;
    await page.waitForSelector(`${ACTIVE} .dk-name`, { timeout: 9000 });
    const name = normalize(await page.evaluate((active) => document.querySelector(`${active} .dk-name`)?.textContent, ACTIVE));
    if (!paths[name]) throw new Error(`${title}: 알 수 없는 생물 ${name}`);
    if (completed.has(name)) throw new Error(`${title}: ${name} 분류 뒤 다음 생물로 넘어가지 않았습니다`);
    for (const yes of paths[name]) {
      await page.evaluate(({ active, answer }) => {
        const button = document.querySelector(`${active} .dk-btn.${answer ? "yes" : "no"}`);
        if (!(button instanceof HTMLButtonElement)) throw new Error("검색표 예/아니요 버튼 없음");
        button.click();
      }, { active: ACTIVE, answer: yes });
      await W(150);
    }
    completed.add(name);
    await W(900);
  }
  if (completed.size !== 5) throw new Error(`${title}: 분류 완료 ${completed.size}/5`);
  await sheetContinue();
};

try {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await W(1200);

  // L1 세포의 구조와 기능
  await openNextLesson("세포");
  await runCellZoomHook();
  await hotspotAll(/동물세포의 세 구조/);
  await hotspotAll(/식물세포에는 무엇이 더/);
  await figTabsAll(/세포의 모양은 하는 일/);
  await recapOpenOne(/세포의 구조와 기능.*카드/);
  await pairMatchAuto(/세포 구조와 기능 짝 맞추기/, [
    ["세포막", "물질 출입을 조절해요"],
    ["핵", "생명활동을 조절해요"],
    ["마이토콘드리아", "필요한 에너지를 만들어요"],
    ["세포벽", "형태를 유지하고 보호해요"],
    ["엽록체", "광합성으로 양분을 만들어요"],
  ]);
  await answerMcq(/모양에 알맞은 기능/, 3);
  await answerMulti(/공통으로 있는 구조/, [0, 1, 2]);
  await answerMcq(/식물세포라고 판단/, 3);
  await answerOx(/모두 같은 모양이며 같은 일을/, false);
  await finishLesson("u2l1");

  // L2 현미경으로 세포 관찰
  await openNextLesson("세포 관찰");
  await runStainHook();
  await runCompareMicroscope();
  await recapOpenOne(/세포 관찰.*카드/);
  await orderAuto(/현미경표본 만드는 순서/, [
    "재료를 얇게 얻어 받침유리에 놓기",
    "물이나 알맞은 염색액 한 방울 떨어뜨리기",
    "덮개유리를 비스듬히 세워 천천히 덮기",
    "거름종이로 남은 용액 조심히 없애기",
  ]);
  await answerMulti(/관찰 결과로 옳은 것/, [0, 1, 2]);
  await answerMcq(/총배율/, 2);
  await answerMcq(/오른쪽 시야에 대한 설명/, 2);
  await answerOx(/염색액을 떨어뜨리면 세포 자체가 커지기/, false);
  await finishLesson("u2l2");

  // L3 생물의 구성 단계
  await openNextLesson("구성 단계");
  await runBodyCountHook();
  await orgLevelsAll(/동물의 몸을 작은 단위부터/);
  await orgLevelsAll(/식물의 몸에는 조직계/);
  await recapOpenOne(/생물의 구성 단계.*카드/);
  await orderAuto(/동물의 구성 단계를 작은 것부터/, ["세포", "조직", "기관", "기관계", "개체"]);
  await answerMcq(/심장과 온몸의 혈관/, 3);
  await answerMcq(/조직 다음/, 1);
  await answerMulti(/구성 단계에 대한 설명/, [0, 1, 2]);
  await answerOx(/기관은 모양과 기능이 비슷한 세포만/, false);
  await finishLesson("u2l3");

  // L4 생물다양성과 변이
  await openNextLesson("생물다양성");
  await runFingerprintHook();
  await runBiodiversityLab();
  await runFinchSim();
  await recapOpenOne(/생물다양성과 변이.*카드/);
  await binSortAuto(/어떤 다양성을 말하는 걸까요/, [
    ["한 지역에 숲과 습지, 갯벌이 있음", "생태계의 다양함"],
    ["연못에 붕어·부들·물자라가 함께 삶", "생물 종류의 다양함"],
    ["같은 바지락의 껍데기 무늬가 다름", "같은 종류 안의 변이"],
    ["학교에 화단과 연못, 풀숲이 있음", "생태계의 다양함"],
    ["숲에 소나무·딱따구리·버섯이 삶", "생물 종류의 다양함"],
    ["같은 무궁화의 꽃 색이 조금씩 다름", "같은 종류 안의 변이"],
  ]);
  await answerMulti(/생물다양성에 포함되는 모습/, [0, 1, 2]);
  await answerMcq(/달팽이 사이에 껍데기 색과 무늬 차이/, 1);
  await answerMcq(/두 부리 모양에 대한 설명/, 2);
  await answerOx(/모든 개체가 한 세대 안에 똑같이/, false);
  await finishLesson("u2l4");

  // L5 생물의 분류와 5계
  await openNextLesson("생물의 분류");
  await runBatBirdHook();
  await runClassificationConcept();
  await runKingdomTable();
  await runDichotomKey();
  await binSortAuto(/학교 주변 생물을 5계 서랍/, [
    ["젖산균", "원핵생물계"],
    ["해캄", "원생생물계"],
    ["푸른곰팡이", "균계"],
    ["효모", "균계"],
    ["고사리", "식물계"],
    ["진달래", "식물계"],
    ["꿀벌", "동물계"],
    ["박새", "동물계"],
  ]);
  await recapOpenOne(/생물의 분류.*카드/);
  await orderAuto(/분류 단계를 작은 무리부터/, ["종", "속", "과", "목", "강", "문", "계"]);
  await answerMcq(/말과 당나귀 사이에서 태어난 노새/, 1);
  await answerMulti(/5계의 특징에 대한 설명/, [0, 1, 3, 4]);
  await answerMcq(/분류체계에 대한 설명/, 2);
  await answerOx(/원핵생물계에 속하는 생물도 하나의 세포/, true);
  await finishLesson("u2l5");

  // L6 생물다양성 보전과 실천
  await openNextLesson("다양성 보전");
  await runFoodWebHook();
  await figTabsAll(/생물 종류가 적을 때와 많을 때/);
  await pairMatchAuto(/생물과 우리가 얻는 혜택/, [
    ["벼", "식량"],
    ["푸른곰팡이", "의약품 원료"],
    ["누에고치", "섬유"],
    ["편백나무", "목재"],
    ["고양이의 눈", "빛 반사 장치의 아이디어"],
  ]);
  await binSortAuto(/다양성을 줄일까요, 지킬까요/, [
    ["넓은 숲을 밀어 도로를 건설함", "다양성 위협"],
    ["야생 생물을 지나치게 채집함", "다양성 위협"],
    ["큰입배스 같은 침입 외래 생물이 퍼짐", "다양성 위협"],
    ["오염 물질과 기후 변화가 서식지를 바꿈", "다양성 위협"],
    ["끊어진 서식지를 생태통로로 연결함", "보전 노력"],
    ["국립공원과 보호구역을 지정함", "보전 노력"],
    ["다양한 씨앗을 종자은행에 보관함", "보전 노력"],
    ["안 쓰는 물건을 버리지 않고 나눔함", "보전 노력"],
  ]);
  await recapOpenOne(/생물다양성 보전.*카드/);
  await answerMulti(/생물다양성이 우리에게 주는 혜택/, [0, 1, 2, 3]);
  await answerMcq(/생물다양성을 크게 줄이는 까닭/, 0);
  await answerMulti(/생물다양성을 지키는 행동/, [0, 1, 2, 3]);
  await answerOx(/큰입배스처럼 토종 생물을 위협/, true);
  await finishLesson("u2l6");

  if (pageErrors.length) throw new Error(`pageerror 발생: ${pageErrors.join(" | ")}`);
  console.log("\n중1 II단원 6레슨 전 스텝 실플레이 통과. pageerror=0, 누락 이미지=0");
} catch (error) {
  console.log("\nE2E 실패:", error instanceof Error ? error.stack ?? error.message : error);
  console.log("현재 제목:", await currentTitle().catch(() => "확인 실패"));
  try {
    await page.screenshot({ path: FAIL_SHOT, fullPage: true });
    console.log(`실패 화면 저장: ${FAIL_SHOT}`);
  } catch (shotError) {
    console.log("실패 화면 저장 실패:", shotError instanceof Error ? shotError.message : shotError);
  }
  process.exitCode = 1;
} finally {
  await browser.close();
}
