// 사회 Ⅶ(인간과 사회생활) 7레슨 실플레이 E2E — e2e-soc6 골격에서 지도류 제거, 일반사회 랩 3종 신설.
// DEV 서버 필요(data-oi 사용). PORT=<포트> node qa/e2e-soc7.mjs
// 홈 7번째 탭 전환 검증 · judgeLab(카드 즉시 판정 — **오답 판정 → 교정 helper 경로 포함** ·
// 함정 카드 칩 · 한 줄 정리 msn) · dilemmaLab(두 갈래 모두 걷기 → 되감기 → 명명 오답 교정 → 정답 →
// 용어 카드) · lifePathLab(탭-탭 배치 — 오배치 코미디 · 매체 띠 반전 · 재사회화 msn) ·
// comic 말풍선 렌더 검증(e2e-his 문법 이식 — 컷별 bubbles 개수 대조) · recap more · 컷 로드 · 전 퀴즈.
// 부분 실행: ONLY=s1u7l1,s1u7l5 PORT=... node qa/e2e-soc7.mjs (홈 검증은 항상 수행)
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => {
  pageErrors += 1;
  console.log("PAGEERROR:", e.message);
});
// 동시 세션 HMR 면역 — @vite/client를 스텁으로 대체(웹소켓 제거, updateStyle 유지)
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
      version: 1,
      onboarded: true,
      grade: "g1",
      viewGrade: "g1",
      viewSubject: "soc",
      premium: true,
      reviewMode: false,
      goalMin: 10,
      streak: 1,
      lastStudyDay: null,
      totalXp: 0,
      lessons: {},
      minigame: {},
    }),
  );
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);

const W = (ms) => page.waitForTimeout(ms);
const active = ".screen.active";
let checks = 0;
let fails = 0;
const check = (ok, msg) => {
  checks += 1;
  console.log(`${ok ? "PASS" : "FAIL"} [${checks}] ${msg}`);
  if (!ok) fails += 1;
};
const heading = () =>
  page.evaluate(() => document.querySelector(".screen.active .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 44));

// ── 홈 지도 검증(캐러셀 — Ⅶ = 7번째 탭 전환 후 카운트) ──
{
  const home = await page.evaluate(() => ({ bands: document.querySelectorAll(".unit-band").length }));
  check(home.bands === 7, `홈 밴드 7개 (실제 ${home.bands})`);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[6].click());
  await W(800);
  const u7map = await page.evaluate(() => ({
    nodes: document.querySelectorAll(".gm-node").length,
    world: !!document.querySelector(".gm-terrain.world"),
    coming: !!document.querySelector(".coming-card"),
  }));
  check(u7map.nodes === 7, `Ⅶ단원 레슨 노드 7개 (실제 ${u7map.nodes})`);
  check(u7map.world, "Ⅶ단원 world 테마 지형 적용");
  check(!u7map.coming, "comingSoon 카드 없음(신규 append 단원)");
}

const openLesson = async (id) => {
  const count = await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(lessonId);
    if (!found) throw new Error(`레슨 없음: ${lessonId}`);
    window.__socE2E = { steps: found.lesson.steps, done: null };
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: (r) => (window.__socE2E.done = r) }));
    return found.lesson.steps.length;
  }, id);
  await W(760);
  console.log(`\n=== [${id}] ${await heading()} (${count} steps) ===`);
  return count;
};

const stepData = (i) =>
  page.evaluate((idx) => {
    const st = window.__socE2E?.steps?.[idx];
    return st
      ? { type: st.type, mode: st.mode, answer: st.answer, items: st.items, bins: st.bins, tabs: st.tabs, scene: st.scene, judge: st.judge, dilemma: st.dilemma, panels: st.panels?.map((p) => ({ bubbles: p.bubbles?.length ?? 0 })) }
      : null;
  }, i);

const clickCTA = async (timeout = 24000) => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".screen.active button.cta");
    return b && !b.disabled;
  }, undefined, { timeout });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(520);
};

const sheetContinue = async (timeout = 10000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(200);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(520);
};

// ── 훅(장면별 미세 상호작용 → 예측 → CTA) ────────────────────
const hookStep = async (scene) => {
  const tapBtn = async (times = 1, wait = 620) => {
    for (let i = 0; i < times; i += 1) {
      await page.evaluate(() => document.querySelector(".screen.active .hs7-btn").click());
      await W(wait);
    }
  };
  if (scene === "nametags") await tapBtn(3, 620);
  else await tapBtn(1, scene === "vinestangle" ? 1400 : 700);
  await page.waitForSelector(`${active} .hook-choices.show .hook-choice`, { timeout: 12000 });
  const q = await page.evaluate(() => !!document.querySelector(".screen.active .hook-q"));
  check(q, `[${scene}] 예측 질문이 선택지 위에 표시`);
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
  await W(400);
  await clickCTA();
};

// ── 퀴즈·능동형 스텝 ─────────────────────────────────────────
const quiz = async (step) => {
  if (step.mode === "ox") {
    await page.waitForSelector(`${active} .ox-btn`, { timeout: 9000 });
    await page.evaluate((ans) => document.querySelector(ans ? ".screen.active .ox-btn.o" : ".screen.active .ox-btn.x").click(), step.answer);
  } else {
    const answers = Array.isArray(step.answer) ? step.answer : [step.answer];
    await page.waitForSelector(`${active} .opts .opt[data-oi]`, { timeout: 9000 });
    for (const a of answers) {
      await page.evaluate((oi) => document.querySelector(`.screen.active .opts .opt[data-oi="${oi}"]`).click(), a);
      await W(120);
    }
  }
  await clickCTA();
  await sheetContinue();
};

const binSortStep = async (step) => {
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
    if (!ok) throw new Error(`분류 통 없음: ${item.bin}`);
    await W(160);
  }
  await clickCTA();
  await sheetContinue();
};

const orderStep = async (step) => {
  await page.waitForSelector(`${active} .ord-chip`, { timeout: 9000 });
  for (const text of step.items) {
    const ok = await page.evaluate((t) => {
      const strip = (h) => {
        const el = document.createElement("span");
        el.innerHTML = h;
        return (el.textContent ?? "").replace(/\s+/g, " ").trim();
      };
      const chip = [...document.querySelectorAll(".screen.active .ord-chip")].find((c) => strip(c.innerHTML) === strip(t));
      if (!chip) return false;
      chip.click();
      return true;
    }, text);
    if (!ok) throw new Error(`order 칩 없음: ${text.slice(0, 12)}`);
    await W(180);
  }
  await clickCTA();
  await sheetContinue();
};

const recapStep = async () => {
  await page.waitForSelector(`${active} .rc-card`, { timeout: 9000 });
  const info = await page.evaluate(() => {
    const cards = [...document.querySelectorAll(".screen.active .rc-card")];
    cards[0]?.click();
    return { count: cards.length, arts: cards.filter((c) => c.querySelector("svg")).length };
  });
  await W(360);
  const moreShown = await page.evaluate(() => {
    const card = document.querySelector(".screen.active .rc-card.open");
    const more = card?.querySelector(".rc-more");
    return !!more && more.textContent.length > 100;
  });
  check(info.count >= 3 && info.arts === info.count, `recap 카드 ${info.count}장 전부 미니아트`);
  check(moreShown, "recap '자세히' 펼침(rm-h 심화)");
  await clickCTA();
};

const conceptStep = async () => {
  await page.waitForSelector(`${active} .concept, ${active} .blocks, ${active} .term`, { timeout: 9000 }).catch(() => {});
  const cutInfo = await page.evaluate(() => {
    const img = document.querySelector('.screen.active img[src*="soc/cuts/"]');
    if (!img) return null;
    return { loaded: img.complete && img.naturalWidth > 0, src: img.getAttribute("src") };
  });
  if (cutInfo) check(cutInfo.loaded, `개념 컷 로드 (${cutInfo.src?.split("/").pop()})`);
  await clickCTA();
};

// ── comic — 말풍선 하이브리드 렌더 검증(e2e-his 문법 이식) ──
const comicStep = async (step) => {
  await page.waitForSelector(`${active} .comic-panel`, { timeout: 9000 });
  for (let i = 0; i < step.panels.length; i += 1) {
    await W(420);
    const info = await page.evaluate(() => {
      const img = document.querySelector(".screen.active .comic-img");
      return {
        loaded: !!img && img.complete && img.naturalWidth > 0,
        bubbles: document.querySelectorAll(".screen.active .comic-art .cut-bubble").length,
      };
    });
    check(info.loaded, `comic 컷 ${i + 1} 로드`);
    check(info.bubbles === step.panels[i].bubbles, `comic 컷 ${i + 1} 말풍선 ${step.panels[i].bubbles}개 (실제 ${info.bubbles})`);
    await clickCTA();
  }
};

// ── 사회 Ⅶ 신설 랩 3종 ───────────────────────────────────────
// judgeLab: 첫 카드는 일부러 오답 → 교정 helper 확인 → 정답 진행, 전 카드 후 한 줄 정리(오답→정답)
const judgeStep = async (judgeId) => {
  await page.waitForSelector(`${active} .jdg-card.in`, { timeout: 9000 });
  const def = await page.evaluate(async (id) => {
    const { JUDGES } = await import("/src/ui/judgeKit.ts");
    const d = JUDGES[id];
    return { cases: d.cases.map((c) => ({ answer: c.answer, trap: !!c.trap })), concepts: d.concepts.map((c) => c.id) };
  }, judgeId);
  // 오답 경로: 첫 카드에서 정답이 아닌 선반을 탭 → helper 교정 문구 갱신 확인
  const wrongShelf = def.concepts.find((c) => c !== def.cases[0].answer);
  const before = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  await page.evaluate((c) => document.querySelector(`.screen.active .jdg-shelf[data-c="${c}"]`).click(), wrongShelf);
  await W(420);
  const after = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(after !== before && after.length > 20, `judgeLab(${judgeId}) 오답 판정 → 교정 helper (${after.slice(0, 14)}…)`);
  // 정답 진행(전 카드)
  for (const c of def.cases) {
    await page.evaluate((cid) => document.querySelector(`.screen.active .jdg-shelf[data-c="${cid}"]`).click(), c.answer);
    await W(560);
  }
  const trapChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="trap"].on'));
  check(trapChip, `judgeLab(${judgeId}) 함정 카드 칩 점등`);
  await page.waitForSelector(`${active} .msn-quiz.show`, { timeout: 9000 });
  // 한 줄 정리: 오답 먼저 → wrong 교정 → 정답
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-quiz .msn-opt")[1]?.click());
  await W(350);
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-quiz .msn-opt")[0]?.click());
  await W(500);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `judgeLab(${judgeId}) 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// dilemmaLab: 갈래 A → 결과(gain·loss) → 되감기 → 갈래 B → 명명 오답 → 교정 → 정답 → 용어 카드
const dilemmaStep = async () => {
  await page.waitForSelector(`${active} .dlm-choice`, { timeout: 9000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .dlm-choice")[0].click());
  await W(800);
  const cols = await page.evaluate(() => ({
    gain: document.querySelectorAll(".screen.active .dlm-col.gain .dlm-item").length,
    loss: document.querySelectorAll(".screen.active .dlm-col.loss .dlm-item").length,
  }));
  check(cols.gain >= 1 && cols.loss >= 1, `dilemma 갈래 A 결과 — 얻은 것 ${cols.gain}·잃은 것 ${cols.loss}(정답 없는 선택)`);
  await page.waitForSelector(`${active} .dlm-rewind:not(.hide)`, { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".screen.active .dlm-rewind").click());
  await W(500);
  await page.evaluate(() => document.querySelectorAll(".screen.active .dlm-choice")[1].click());
  await W(800);
  await page.waitForSelector(`${active} .msn-quiz.show`, { timeout: 12000 });
  // 명명: 오답 → 교정 문구 → 정답 → 용어 카드
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-quiz .msn-opt")[1]?.click());
  await W(350);
  const wrongText = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(wrongText.includes("역할") || wrongText.length > 20, `dilemma 명명 오답 교정 (${wrongText.slice(0, 14)}…)`);
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-quiz .msn-opt")[0]?.click());
  await W(600);
  const term = await page.evaluate(() => document.querySelector(".screen.active .dlm-term.show b")?.textContent ?? "");
  check(term === "역할 갈등", `dilemma 용어 카드 "${term}"`);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `dilemma 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// lifePathLab: 오배치 코미디 → 정배치 4 → 매체 카드 정거장(코미디) → 띠(정답) → 재사회화 msn
const lifePathStep = async () => {
  await page.waitForSelector(`${active} .lfp-card`, { timeout: 9000 });
  const tapCard = (a) => page.evaluate((id) => document.querySelector(`.screen.active .lfp-card[data-a="${id}"]`)?.click(), a);
  const tapSlot = (s) => page.evaluate((id) => document.querySelector(`.screen.active [data-slot="${id}"]`)?.click(), s);
  // 오배치: 직장 카드 → 아기 정거장 = 코미디 교정
  await tapCard("work");
  await W(200);
  await tapSlot("baby");
  await W(400);
  const comedy = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(comedy.includes("출근") || comedy.includes("시기"), `lifePath 오배치 코미디 (${comedy.slice(0, 16)}…)`);
  // 정배치 4
  for (const [a, s] of [["family", "baby"], ["peer", "child"], ["school", "teen"], ["work", "adult"]]) {
    await tapCard(a);
    await W(180);
    await tapSlot(s);
    await W(360);
  }
  const placeChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="place"].on'));
  check(placeChip, "lifePath 네 정거장 배치 칩");
  // 매체: 정거장에 먼저(반전 힌트) → 띠에 정답
  await tapCard("media");
  await W(180);
  await tapSlot("teen");
  await W(400);
  const hint = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(hint.includes("띠") || hint.includes("전체"), `lifePath 매체 반전 힌트 (${hint.slice(0, 14)}…)`);
  await tapCard("media");
  await W(180);
  await tapSlot("media");
  await W(500);
  const bandOn = await page.evaluate(() => !!document.querySelector(".screen.active .lfp-band.on"));
  check(bandOn, "lifePath 매체 띠 점등(평생 반전)");
  await page.waitForSelector(`${active} .msn-quiz.show`, { timeout: 12000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-quiz .msn-opt")[0]?.click());
  await W(500);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `lifePath 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// ── 레슨 러너 ────────────────────────────────────────────────
const runLesson = async (id) => {
  const count = await openLesson(id);
  for (let i = 0; i < count; i += 1) {
    const step = await stepData(i);
    if (!step) throw new Error(`${id} 스텝 ${i} 데이터 없음`);
    console.log(`  step ${i + 1}/${count}: ${step.type}${step.mode ? `(${step.mode})` : ""}`);
    if (step.type === "hook") await hookStep(step.scene);
    else if (step.type === "judgeLab") await judgeStep(step.judge);
    else if (step.type === "dilemmaLab") await dilemmaStep();
    else if (step.type === "lifePathLab") await lifePathStep();
    else if (step.type === "comic") await comicStep(step);
    else if (step.type === "concept") await conceptStep();
    else if (step.type === "recap") await recapStep();
    else if (step.type === "quiz") await quiz(step);
    else if (step.type === "binSort") await binSortStep(step);
    else if (step.type === "order") await orderStep(step);
    else throw new Error(`알 수 없는 스텝: ${step.type}`);
    await W(200);
  }
  const done = await page.evaluate(() => window.__socE2E?.done);
  check(!!done, `${id} 완주(onComplete 수신 acc=${done ? Math.round(done.acc ?? 0) : "?"}%)`);
  await W(700);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll(".screen.active button")].find((b) => /홈으로|계속/.test(b.textContent ?? ""));
    btn?.click();
  });
  await W(900);
};

const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
try {
  for (const id of ["s1u7l1", "s1u7l2", "s1u7l3", "s1u7l4", "s1u7l5", "s1u7l6", "s1u7l7"]) {
    if (!ONLY || ONLY.includes(id)) await runLesson(id);
  }
  check(pageErrors === 0, `페이지 오류 0건 (실제 ${pageErrors})`);
} catch (e) {
  console.log("E2E ABORT:", e.message);
  fails += 1;
}

console.log(`\n===== 사회 Ⅶ e2e: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
await browser.close();
process.exit(fails ? 1 : 0);
