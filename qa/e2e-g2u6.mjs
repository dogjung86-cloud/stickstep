// 중2 VI 동물과 에너지 6레슨 전용 실플레이 E2E.
// DEV 서버가 필요하다(data-oi 사용). PORT=3000 node qa/e2e-g2u6.mjs
// 캔버스 랩(순환·소화 여정·콩팥단위·통합)은 논리좌표(BASE_W=360)를 화면좌표로 바꿔
// canvas에 PointerEvent를 직접 dispatch한다(safePointerCapture가 합성 포인터를 흘려도 리스너는 canvas에 있음).
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const PORT = process.env.PORT || "3000";
const CAPTURE = process.env.CAPTURE === "1";
const SHOT_DIR = "tmp/g2u6-qa";
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
    window.__g2u6E2E = { steps: lesson.steps, done: null };
    nav.go(createLessonPlayer(lesson, {
      onExit: () => {},
      onComplete: (result) => { window.__g2u6E2E.done = result; },
    }));
    return lesson.steps.length;
  }, id);
  await W(780);
  console.log(`[${id}] ${await heading()} (${count} steps)`);
  return count;
};

const stepData = (index) => page.evaluate((i) => {
  const step = window.__g2u6E2E?.steps?.[i];
  if (!step) throw new Error(`스텝 ${i} 데이터를 찾지 못했어요`);
  return { type: step.type, mode: step.mode, answer: step.answer, items: step.items, spots: step.spots };
}, index);

const clickCTA = async (timeout = 18000) => {
  await page.waitForFunction(() => {
    const button = document.querySelector(".screen.active button.cta");
    return button && !button.disabled;
  }, undefined, { timeout });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(520);
};

const sheetContinue = async (timeout = 10000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(180);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(520);
};

// ── 캔버스 랩 조작 공용 ────────────────────────────────────
// 논리좌표(360 기준) 경로를 canvas 화면좌표로 바꿔 down→move…→up을 직접 dispatch.
const canvasDrag = async (pts, id = 7) => {
  await page.evaluate(({ pts, id }) => {
    const cv = document.querySelector(".screen.active .body-lab-canvas");
    if (!cv) throw new Error("캔버스를 찾지 못했어요");
    cv.scrollIntoView({ block: "center" });
    const r = cv.getBoundingClientRect();
    const sc = r.width / 360;
    const P = ([lx, ly]) => ({ x: r.left + lx * sc, y: r.top + ly * sc });
    const ev = (type, p, buttons) => cv.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: id, isPrimary: true, pointerType: "touch",
      clientX: p.x, clientY: p.y, buttons,
    }));
    ev("pointerdown", P(pts[0]), 1);
    for (let i = 1; i < pts.length; i++) ev("pointermove", P(pts[i]), 1);
    ev("pointerup", P(pts[pts.length - 1]), 0);
  }, { pts, id });
  await W(180);
};
const canvasTap = async (lx, ly, id = 7) => {
  await page.evaluate(({ lx, ly, id }) => {
    const cv = document.querySelector(".screen.active .body-lab-canvas");
    if (!cv) throw new Error("캔버스를 찾지 못했어요");
    cv.scrollIntoView({ block: "center" });
    const r = cv.getBoundingClientRect();
    const sc = r.width / 360;
    const p = { x: r.left + lx * sc, y: r.top + ly * sc };
    for (const type of ["pointerdown", "pointerup"]) {
      cv.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, pointerId: id, isPrimary: true, pointerType: "touch",
        clientX: p.x, clientY: p.y, buttons: type === "pointerdown" ? 1 : 0,
      }));
    }
  }, { lx, ly, id });
  await W(180);
};
const goalCount = () => page.evaluate(() =>
  document.querySelectorAll(".screen.active .pn-badge.body.on").length,
);
const expectGoals = async (n, label) => {
  const got = await goalCount();
  if (got < n) throw new Error(`${label}: 목표 ${n}개 중 ${got}개만 켜졌어요`);
};

// nutrientTestLab — 병 4개를 각 시험관으로 끌고, 베네딕트는 가열 버튼.
const TUBE_X = [64, 148, 232, 316];
const BOTTLE_HOME = [[52, 250], [136, 250], [220, 250], [304, 250]];
const nutrientTest = async () => {
  await page.waitForSelector(`${active} .body-lab-canvas`, { timeout: 9000 });
  for (let i = 0; i < 4; i++) await canvasDrag([BOTTLE_HOME[i], [TUBE_X[i], 92]]);
  await page.evaluate(() => document.querySelector(".screen.active .ntl-heat-btn")?.click());
  await W(240);
  await expectGoals(3, "nutrientTestLab");
  await capture("l1-lab");
  await clickCTA();
};

// digestJourneyLab — 영양소 토큰을 소화관 DUCT 경로 끝(작은창자)까지.
const DUCT = [[52, 74], [96, 74], [140, 88], [180, 118], [206, 150], [230, 178], [268, 190], [308, 188]];
const digestJourney = async () => {
  await page.waitForSelector(`${active} .body-lab-canvas`, { timeout: 9000 });
  const starts = { starch: [52, 54], protein: [52, 74], fat: [52, 94] };
  for (const key of ["starch", "protein", "fat"]) {
    await canvasDrag([starts[key], ...DUCT.slice(1)]);
  }
  await expectGoals(3, "digestJourneyLab");
  await capture("l2-lab");
  await clickCTA();
};

// circulationLab — 심장 탭 → 허파순환 경로 → 온몸순환 경로.
// 좌표는 랩 재배치(CVH 300→340, 심장 165→199) 반영(2026-07-20 codex 개편).
const LUNG_PATH = [[163, 224], [120, 184], [110, 130], [150, 104], [180, 96], [210, 104], [250, 130], [240, 184], [197, 184]];
const BODY_PATH = [[197, 224], [250, 234], [300, 244], [316, 272], [300, 296], [240, 302], [170, 284], [163, 239]];
const circulation = async () => {
  await page.waitForSelector(`${active} .body-lab-canvas`, { timeout: 9000 });
  await canvasTap(180, 199);
  await canvasDrag(LUNG_PATH);
  await canvasDrag(BODY_PATH);
  await expectGoals(3, "circulationLab");
  await capture("l3-lab");
  await clickCTA();
};

// breathModelLab — 버튼 3개(고무막 아래/위/대응).
const breathModel = async () => {
  await page.waitForSelector(`${active} .bml-controls button`, { timeout: 9000 });
  for (const action of ["down", "up", "match"]) {
    await page.evaluate((a) => document.querySelector(`.screen.active .bml-controls button[data-action="${a}"]`).click(), action);
    await W(240);
  }
  await expectGoals(3, "breathModelLab");
  await capture("l4-lab");
  await clickCTA();
};

// nephronLab — 여과(작은 물질을 보먼주머니) → 재흡수(포도당·물을 모세혈관) → 분비(노폐물을 세뇨관).
// 좌표는 랩 재배치(FILTER_ZONE 신설·세뇨관 아래·모세혈관 위) 반영(2026-07-20 codex 개편).
const nephron = async () => {
  await page.waitForSelector(`${active} .body-lab-canvas`, { timeout: 9000 });
  const FILTER = [88, 203];  // 보먼주머니 입구 존
  const CAPIL = [233, 142];  // 모세혈관 레인
  const TUBULE = [214, 204]; // 세뇨관 레인
  // 여과: 혈액 존 glucose[44,70]·water[98,70]·urea[150,70]를 보먼주머니로(→세뇨관 슬롯 0·1·2 정착)
  for (const home of [[44, 70], [98, 70], [150, 70]]) await canvasDrag([home, FILTER]);
  await expectGoals(1, "nephronLab 여과");
  // 재흡수: 세뇨관 슬롯의 glucose(slot0=[162,204])·water(slot1=[214,204])를 모세혈관으로
  for (const slot of [[162, 204], [214, 204]]) await canvasDrag([slot, CAPIL]);
  await expectGoals(2, "nephronLab 재흡수");
  // 분비: 모세혈관의 노폐물[300,142]을 세뇨관으로
  await canvasDrag([[300, 142], TUBULE]);
  await expectGoals(3, "nephronLab 분비");
  await capture("l5-lab");
  await clickCTA();
};

// bodyIntegrateLab — 토큰을 순환계(hub) 경유로 목적지까지 2단계 드래그.
// 좌표는 랩 재배치(SYS 박스 좌표계·기관계 위아래 재배열) 반영(2026-07-20 codex 개편).
// start=토큰 초기 위치(기관계 center+stationOffset), hub=hub 드롭 후 정착 위치, dest=목적지 SYS center.
const HUB_C = [180, 182];
const bodyIntegrate = async () => {
  await page.waitForSelector(`${active} .body-lab-canvas`, { timeout: 9000 });
  const plan = [
    { start: [60, 230],  hub: [136, 234], dest: [180, 316] }, // 영양소: 소화계→순환계→조직세포
    { start: [180, 108], hub: [224, 234], dest: [180, 316] }, // 산소: 호흡계→순환계→조직세포
    { start: [110, 316], hub: [136, 130], dest: [180, 58] },  // 이산화 탄소: 조직세포→순환계→호흡계
    { start: [250, 316], hub: [224, 130], dest: [300, 182] }, // 요소: 조직세포→순환계→배설계
  ];
  for (const m of plan) {
    await canvasDrag([m.start, HUB_C]);
    await canvasDrag([m.hub, m.dest]);
  }
  await expectGoals(3, "bodyIntegrateLab");
  await capture("l6-lab");
  await clickCTA();
};

// ── 훅·범용 스텝 ──────────────────────────────────────────
const hook = async () => {
  await page.waitForSelector(`${active} .body-action`, { timeout: 10000 });
  await capture("hook");
  await page.evaluate(() => document.querySelector(".screen.active .body-action").click());
  await page.waitForSelector(`${active} .hook-choices.show .hook-choice`, { timeout: 12000 });
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
  await W(360);
  await clickCTA();
};

const quiz = async (step) => {
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

const recapStep = async () => {
  if (CAPTURE) {
    await page.waitForSelector(`${active} .rc-toggle`, { timeout: 9000 });
    await page.evaluate(() => document.querySelector(".screen.active .rc-toggle").click());
    await W(320);
    await capture("recap-more-open");
  }
  await clickCTA();
};

const playStep = async (step, index) => {
  console.log(`  ${String(index + 1).padStart(2, "0")} ${step.type}: ${await heading()}`);
  switch (step.type) {
    case "hook": return hook();
    case "nutrientTestLab": return nutrientTest();
    case "digestJourneyLab": return digestJourney();
    case "circulationLab": return circulation();
    case "breathModelLab": return breathModel();
    case "nephronLab": return nephron();
    case "bodyIntegrateLab": return bodyIntegrate();
    case "quiz": return quiz(step);
    case "order": return order(step);
    case "binSort": return binSort(step);
    case "recap": return recapStep();
    case "concept": return clickCTA();
    default: throw new Error(`E2E 조작이 정의되지 않은 스텝이에요: ${step.type}`);
  }
};

try {
  for (let lessonNo = 1; lessonNo <= 6; lessonNo += 1) {
    const id = `g2u6l${lessonNo}`;
    const count = await openLesson(id);
    for (let index = 0; index < count; index += 1) {
      await playStep(await stepData(index), index);
    }
    await page.waitForFunction(() => window.__g2u6E2E?.done !== null, undefined, { timeout: 15000 });
    const result = await page.evaluate(() => window.__g2u6E2E.done);
    console.log(`  완료: 정확도 ${result.acc}% · ${result.correct}/${result.total}`);
  }
  if (pageErrors > 0) throw new Error(`페이지 오류 ${pageErrors}건`);
  console.log("중2 VI 동물과 에너지 6레슨 E2E PASS");
} catch (error) {
  console.log("E2E FAIL:", error.message);
  console.log("현재 제목:", await heading());
  await page.screenshot({ path: "qa/e2e-g2u6-fail.png", fullPage: true });
  process.exitCode = 1;
} finally {
  await browser.close();
}
