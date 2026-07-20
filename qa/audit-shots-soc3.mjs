// audit-shots-soc3.mjs — 사회 Ⅲ(유럽) 전면 감사용 전 스텝 스크린샷.
// e2e-soc3의 스텝 핸들러 문법을 계승하되, 각 상태에서 샷을 남긴다("처음 보는 눈" 시각 감사).
//   · 훅 7장면: 각 상태 전환마다 + 선택지 노출 샷
//   · concept: 상단/하단 스크롤 2샷(그림·용어 전부)
//   · 기함: 진입 카드·안경·오답 토스트·완료 / westWindLab: ON·OFF·판정
//   · hotspot: 각 스팟 카드 열림 / figTabs: 전 탭 / recap: 카드별 more 펼침 / 퀴즈: 그림 문제 전부
// PORT=<포트> node qa/audit-shots-soc3.mjs → qa/shots/audit3/*.png
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const OUT = "qa/shots/audit3";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => {
  pageErrors += 1;
  console.log("PAGEERROR:", e.message);
});
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}",
  }),
);
await page.addInitScript(() => {
  localStorage.setItem(
    "science-app.v1",
    JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "soc",
      premium: true, reviewMode: false, goalMin: 10, streak: 1, lastStudyDay: null,
      totalXp: 0, lessons: {}, minigame: {},
    }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const W = (ms) => page.waitForTimeout(ms);
const active = ".screen.active";
let shotN = 0;
const SHOT = async (name) => {
  shotN += 1;
  await page.screenshot({ path: `${OUT}/${String(shotN).padStart(3, "0")}-${name}.png` });
};
// 스텝 화면의 스크롤 컨테이너를 아래로 내려 하단부 샷
const scrollBottomShot = async (name) => {
  const scrolled = await page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    if (!sc || sc.scrollHeight <= sc.clientHeight + 30) return false;
    sc.scrollTop = sc.scrollHeight;
    return true;
  });
  if (scrolled) {
    await W(420);
    await SHOT(name);
  }
};
const scrollMidShots = async (name) => {
  const parts = await page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    if (!sc) return 0;
    return Math.min(3, Math.max(1, Math.ceil(sc.scrollHeight / sc.clientHeight)));
  });
  for (let i = 1; i < parts; i += 1) {
    await page.evaluate((k) => {
      const sc = document.querySelector(".screen.active .scroll");
      if (sc) sc.scrollTop = Math.round((sc.scrollHeight - sc.clientHeight) * k);
    }, i / (parts - 1 || 1));
    await W(380);
    await SHOT(`${name}-s${i}`);
  }
};

const clickCTA = async (timeout = 20000) => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".screen.active button.cta");
    return b && !b.disabled;
  }, undefined, { timeout });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(500);
};
const sheetContinue = async (timeout = 10000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(220);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(480);
};

const openLesson = async (id) => {
  const count = await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(lessonId);
    window.__socE2E = { steps: found.lesson.steps, done: null };
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: (r) => (window.__socE2E.done = r) }));
    return found.lesson.steps.length;
  }, id);
  await W(800);
  console.log(`=== [${id}] ${count} steps ===`);
  return count;
};
const stepData = (i) =>
  page.evaluate((idx) => {
    const st = window.__socE2E?.steps?.[idx];
    return st ? { type: st.type, mode: st.mode, answer: st.answer, items: st.items, spots: st.spots, tabs: st.tabs, pairs: st.pairs, scene: st.scene, figure: !!st.figure } : null;
  }, i);

// ── 훅: 상태별 샷 ──
const hookStep = async (L, scene) => {
  await SHOT(`${L}-hook-${scene}-0`);
  const tapSel = { dawnsoccer: ".hs3-dawn", cityfeed: ".hs3-feed", fourshirts: ".hs3-shirts" }[scene] ?? ".hs3-flipbtn";
  const times = { dawnsoccer: 2, peakhike: 2, frozenriver: 2, cityfeed: 2, skislope: 2, trainborder: 2, fourshirts: 3 }[scene];
  for (let i = 1; i <= times; i += 1) {
    await page.evaluate((s) => document.querySelector(`.screen.active ${s}`).click(), tapSel);
    // trainborder v2는 실주행 1.6s 동안 버튼이 잠긴다 — 도착 후 상태를 찍고 다음 탭
    await W(scene === "trainborder" ? 2100 : 560);
    await SHOT(`${L}-hook-${scene}-${i}`);
  }
  await page.waitForSelector(`${active} .hook-choices.show .hook-choice`, { timeout: 12000 });
  await W(250);
  await SHOT(`${L}-hook-${scene}-choices`);
  // 오답을 골라(정답 키워드 회피) 오개념 교정 문구 + reveal 상태를 샷으로 남긴다
  const GOOD_KEY = {
    dawnsoccer: "서쪽으로", peakhike: "기온이 낮고", frozenriver: "실어 오기", cityfeed: "역사와 기능",
    skislope: "난방열", trainborder: "약속했기", fourshirts: "연합해",
  }[scene];
  await page.evaluate((key) => {
    const chs = [...document.querySelectorAll(".screen.active .hook-choices.show .hook-choice")];
    const wrong = chs.find((c) => !c.textContent.includes(key));
    (wrong ?? chs[0]).click();
  }, GOOD_KEY);
  await W(600);
  await SHOT(`${L}-hook-${scene}-answer`);
  await clickCTA();
};

const quiz = async (L, i, step) => {
  await W(300);
  await SHOT(`${L}-q${i}${step.figure ? "-fig" : ""}`);
  if (step.figure) await scrollBottomShot(`${L}-q${i}-fig-bottom`);
  if (step.mode === "ox") {
    await page.waitForSelector(`${active} .ox-btn`, { timeout: 9000 });
    await page.evaluate((ans) => document.querySelector(ans ? ".screen.active .ox-btn.o" : ".screen.active .ox-btn.x").click(), step.answer);
  } else {
    const answers = Array.isArray(step.answer) ? step.answer : [step.answer];
    await page.waitForSelector(`${active} .opts .opt[data-oi]`, { timeout: 9000 });
    for (const a of answers) {
      await page.evaluate((oi) => document.querySelector(`.screen.active .opts .opt[data-oi="${oi}"]`).click(), a);
      await W(130);
    }
  }
  await clickCTA();
  await sheetContinue();
};

const conceptStep = async (L, i) => {
  await W(350);
  await SHOT(`${L}-concept${i}-top`);
  await scrollMidShots(`${L}-concept${i}`);
  await clickCTA();
};

const recapStep = async (L) => {
  await page.waitForSelector(`${active} .rc-card`, { timeout: 9000 });
  await SHOT(`${L}-recap-closed`);
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .rc-card").length);
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((idx) => {
      const cards = document.querySelectorAll(".screen.active .rc-card");
      cards[idx].click();
      cards[idx].scrollIntoView({ block: "start" });
    }, i);
    await W(450);
    await SHOT(`${L}-recap-card${i + 1}`);
    // 카드 more가 길면 하단도
    await page.evaluate((idx) => {
      const card = document.querySelectorAll(".screen.active .rc-card")[idx];
      card.scrollIntoView({ block: "end" });
    }, i);
    await W(300);
    await SHOT(`${L}-recap-card${i + 1}b`);
  }
  await clickCTA();
};

const binSortStep = async (L, step) => {
  await page.waitForSelector(`${active} .bin-tray .bin-chip`, { timeout: 9000 });
  await SHOT(`${L}-binsort-0`);
  for (const item of step.items) {
    await page.evaluate((binId) => {
      const chip = document.querySelector(".screen.active .bin-tray .bin-chip");
      const bin = document.querySelector(`.screen.active .bin[data-bin="${binId}"]`);
      chip.click();
      (bin.querySelector(".bin-head") ?? bin).click();
    }, item.bin);
    await W(170);
  }
  await SHOT(`${L}-binsort-done`);
  await clickCTA();
  await sheetContinue();
};

const hotspotStep = async (L, step) => {
  await page.waitForSelector(`${active} .hs-dot`, { timeout: 9000 });
  await SHOT(`${L}-hotspot-0`);
  for (let i = 0; i < step.spots.length; i += 1) {
    await page.evaluate((idx) => document.querySelectorAll(".screen.active .hs-dot")[idx].click(), i);
    await W(420);
    await SHOT(`${L}-hotspot-spot${i + 1}`);
  }
  await clickCTA();
};

const figTabsStep = async (L, step) => {
  await page.waitForSelector(`${active} .figtabs`, { timeout: 9000 });
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .seg button").length);
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((idx) => document.querySelectorAll(".screen.active .seg button")[idx].click(), i);
    await W(450);
    await SHOT(`${L}-figtabs-tab${i + 1}`);
  }
  void step;
  await clickCTA();
};

const pairMatchStep = async (L, step) => {
  await page.waitForSelector(`${active} .pm-chip`, { timeout: 9000 });
  await SHOT(`${L}-pair-0`);
  for (const p of step.pairs) {
    await page.evaluate(({ a, b }) => {
      const strip = (h) => {
        const t = document.createElement("span");
        t.innerHTML = h;
        return (t.textContent ?? "").replace(/\s+/g, " ").trim();
      };
      const chipA = [...document.querySelectorAll(".screen.active .pm-chip.pm-a")].find((c) => strip(c.innerHTML) === strip(a) && !c.disabled);
      const chipB = [...document.querySelectorAll(".screen.active .pm-chip.pm-b")].find((c) => strip(c.innerHTML) === strip(b) && !c.disabled);
      chipA.click();
      chipB.click();
    }, p);
    await W(320);
  }
  await SHOT(`${L}-pair-done`);
  await sheetContinue();
};

// ── 기함(가로) — 안경·오답 토스트·바다 풍덩·완료 샷 ──
const EU_CROP = { x: 430, y: 50, w: 244, h: 108 };
const regionPlace = async (L) => {
  await page.waitForSelector(`${active} .swapbtn`, { timeout: 9000 });
  await SHOT(`${L}-rpl-enter`);
  await page.evaluate(() => document.querySelector(".screen.active .swapbtn").click());
  await page.waitForSelector(".rot-overlay .rpl-stage-wide", { timeout: 9000 });
  await W(750);
  await SHOT(`${L}-rpl-stage`);
  await page.evaluate(() => document.querySelector(".rot-overlay .rpl-lens").click());
  await W(450);
  await SHOT(`${L}-rpl-lens`);
  const place = async (regionId, lon, lat) => {
    await page.evaluate(({ id, LON, LAT, crop }) => {
      const stage = document.querySelector(".rot-overlay .rpl-stage-wide");
      const ov = document.querySelector(".rot-overlay").getBoundingClientRect();
      const mapBox = document.querySelector(".rot-overlay .rpl-map");
      const native2 = document.querySelector(".rot-inner").classList.contains("native");
      const L2 = parseFloat(mapBox.style.left);
      const T = parseFloat(mapBox.style.top);
      const MW = parseFloat(mapBox.style.width);
      const MH = parseFloat(mapBox.style.height);
      const sx = ((LON + 180) / 360) * 1000;
      const sy = ((90 - LAT) / 180) * 500;
      const lx = L2 + ((sx - crop.x) / crop.w) * MW;
      const ly = T + ((sy - crop.y) / crop.h) * MH;
      const p = native2 ? { x: ov.left + lx, y: ov.top + ly } : { x: ov.right - ly, y: ov.top + lx };
      const tok = document.querySelector(`.rot-overlay .rpl-token[data-r="${id}"]`);
      const tr = tok.getBoundingClientRect();
      const pe = (type, x, y, target) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: x, clientY: y, isPrimary: true }));
      pe("pointerdown", tr.left + tr.width / 2, tr.top + tr.height / 2, tok);
      pe("pointermove", p.x, p.y, stage);
      pe("pointerup", p.x, p.y, stage);
    }, { id: regionId, LON: lon, LAT: lat, crop: EU_CROP });
    await W(340);
  };
  await place("west", 38, 56); // 오답 코미디
  await SHOT(`${L}-rpl-wrong`);
  await place("north", -20, 50); // 바다 풍덩
  await SHOT(`${L}-rpl-sea`);
  await place("west", 2, 47);
  await place("north", 15, 63);
  await place("south", -4, 40);
  await place("east", 31, 52);
  await W(3400); // 토스트 소거 대기
  await SHOT(`${L}-rpl-complete`);
  await page.evaluate(() => document.querySelector(".rot-exit").click());
  await W(650);
  await SHOT(`${L}-rpl-after`);
  await clickCTA();
};

const westWind = async (L) => {
  await page.waitForSelector(`${active} .spring-canvas`, { timeout: 9000 });
  await W(3100);
  await SHOT(`${L}-westwind-on`);
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".screen.active .seg button")];
    btns.find((b) => b.textContent.includes("없다면"))?.click();
  });
  await W(2500);
  await SHOT(`${L}-westwind-off`);
  await page.waitForSelector(`${active} .msn-quiz.show`, { timeout: 9000 });
  await page.evaluate(() => {
    document.querySelector(".screen.active .msn-quiz").scrollIntoView({ block: "center" });
  });
  await W(300);
  await SHOT(`${L}-westwind-quiz`);
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-opt")[1]?.click());
  await W(400);
  await SHOT(`${L}-westwind-wrongfb`);
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-opt")[0]?.click());
  await W(450);
  await clickCTA();
};

const runLesson = async (id) => {
  const count = await openLesson(id);
  for (let i = 0; i < count; i += 1) {
    const step = await stepData(i);
    console.log(`  step ${i + 1}/${count}: ${step.type}${step.mode ? `(${step.mode})` : ""}`);
    if (step.type === "hook") await hookStep(id, step.scene);
    else if (step.type === "regionPlaceLab") await regionPlace(id);
    else if (step.type === "westWindLab") await westWind(id);
    else if (step.type === "concept") await conceptStep(id, i);
    else if (step.type === "recap") await recapStep(id);
    else if (step.type === "quiz") await quiz(id, i, step);
    else if (step.type === "binSort") await binSortStep(id, step);
    else if (step.type === "hotspot") await hotspotStep(id, step);
    else if (step.type === "figTabs") await figTabsStep(id, step);
    else if (step.type === "pairMatch") await pairMatchStep(id, step);
    await W(200);
  }
  await W(650);
  await SHOT(`${id}-complete`);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll(".screen.active button")].find((b) => /홈으로|계속/.test(b.textContent ?? ""));
    btn?.click();
  });
  await W(900);
};

const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
try {
  for (const id of ["s1u3l1", "s1u3l2", "s1u3l3", "s1u3l4", "s1u3l5", "s1u3l6", "s1u3l7"]) {
    if (!ONLY || ONLY.includes(id)) await runLesson(id);
  }
} catch (e) {
  console.log("SHOTS ABORT:", e.message, e.stack?.split("\n")[1] ?? "");
}
console.log(`SHOTS DONE (${shotN} shots, pageErrors=${pageErrors}) → ${OUT}/`);
await browser.close();
