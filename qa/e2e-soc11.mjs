// 사회 Ⅺ(일상생활과 법) 7레슨 실플레이 E2E — e2e-soc10 골격 + Ⅺ 신설 기함 2종.
// DEV 서버 필요(data-oi 사용). PORT=<포트> node qa/e2e-soc11.mjs
// 홈 11번째 탭 전환(law 테마) · judgeLab 2종(lawmoral·lawzone — 2개념 선반·오답 교정 경로) ·
// trialLab(민사·형사 두 트랙 릴레이 — 소장 접수·변론 2연타·판결·수사 2연타·기소·공판 2연타 +
// 판정 3곳·배지 6개) · fairTrialLab(4제도 반사실 릴레이 — 바람막이·커튼 2연타·소문 기각+증거
// 채택·계단 2연타 + 판정 3곳·배지 4개) · comic 말풍선 개수 대조(원경·은유 컷은 0개가 정상) ·
// recap more · 개념 컷 로드 · 전 퀴즈.
// 부분 실행: ONLY=s1u11l1,s1u11l5 PORT=... node qa/e2e-soc11.mjs (홈 검증은 항상 수행)
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
// 부팅은 항상 스플래시 — 탭으로 플립북 스킵 후 "한번 둘러보기"(조건 대기, e2e-soc7 정본).
await page.waitForSelector("#sc-splash", { timeout: 25000 });
await page.mouse.click(210, 300);
await page.waitForFunction(
  () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")),
  { timeout: 15000 },
);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click();
});
await page.waitForSelector("#sc-home", { timeout: 15000 });
await page.waitForTimeout(600);

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

// ── 홈 지도 검증(캐러셀 — Ⅺ = 11번째 탭 전환 후 카운트) ──
{
  const home = await page.evaluate(() => ({ bands: document.querySelectorAll(".unit-band").length }));
  const socUnits = await page.evaluate(async () => (await import("/src/content/soc/curriculum.ts")).SOC_G1.length);
  check(home.bands === socUnits, `홈 밴드 = 사회 커리큘럼 단원 수(${socUnits}) (실제 ${home.bands})`);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[10].click());
  await W(800);
  const u11map = await page.evaluate(async () => {
    const { findUnit } = await import("/src/content/curriculum.ts");
    return {
      nodes: document.querySelectorAll(".gm-node").length,
      law: !!document.querySelector(".gm-terrain.law"),
      // 시드가 premium:true라 크라운은 안 뜬다(잠금 표시) — 프리미엄 구성은 데이터로 검증
      prem: findUnit("s1u11").lessons.filter((l) => l.premium).length,
      coming: !!document.querySelector(".coming-card"),
      decos: document.querySelectorAll(".gm-deco").length,
    };
  });
  check(u11map.nodes === 7, `Ⅺ단원 레슨 노드 7개 (실제 ${u11map.nodes})`);
  check(u11map.law, "Ⅺ단원 law 테마 지형 적용(단원별 색 분리)");
  check(u11map.prem === 4, `프리미엄 레슨 4개(무료 3) (실제 ${u11map.prem})`);
  check(!u11map.coming, "comingSoon 카드 없음(신규 append 단원)");
  check(u11map.decos >= 5, `단원 데코 렌더 ≥5 (실제 ${u11map.decos})`);
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
      ? { type: st.type, mode: st.mode, answer: st.answer, items: st.items, bins: st.bins, scene: st.scene, judge: st.judge, panels: st.panels?.map((p) => ({ bubbles: p.bubbles?.length ?? 0 })) }
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

// ── 훅(장면 조작 → 예측 → CTA) — 미완료 대상 재시도 루프 ──
// oddtrial(L6)은 버튼이 아니라 그림 속 세 지점 탭(data-spot)이라 분기.
const hookStep = async (scene) => {
  for (let i = 0; i < 10; i += 1) {
    const done = await page.evaluate(() => !!document.querySelector(".screen.active .hook-choices.show .hook-choice"));
    if (done) break;
    await page.evaluate(() => {
      const spot = [...document.querySelectorAll(".screen.active [data-spot]")].find((g) => !g.dataset.hit);
      if (spot) {
        spot.dataset.hit = "1";
        spot.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return;
      }
      const btns = [...document.querySelectorAll(".screen.active .hs8-btn")].filter((b) => !b.disabled);
      btns[0]?.click();
    });
    await W(820);
  }
  await page.waitForSelector(`${active} .hook-choices.show .hook-choice`, { timeout: 12000 });
  const q = await page.evaluate(() => !!document.querySelector(".screen.active .hook-q"));
  check(q, `[${scene}] 예측 질문이 선택지 위에 표시`);
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
  await W(400);
  await clickCTA();
};

// ── 퀴즈·능동형 스텝(e2e-soc10 문법 그대로) ─────────────────────
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

// ── comic — 말풍선 하이브리드 렌더 검증(원경·은유 컷은 0개가 정상) ──
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

// ── judgeLab(공통 — Ⅺ은 2개념 선반, 오답 교정 경로 포함) ──
const judgeStep = async (judgeId) => {
  await page.waitForSelector(`${active} .jdg-card.in`, { timeout: 9000 });
  const def = await page.evaluate(async (id) => {
    const { JUDGES } = await import("/src/ui/judgeKit.ts");
    const d = JUDGES[id];
    return { cases: d.cases.map((c) => ({ answer: c.answer, trap: !!c.trap })), concepts: d.concepts.map((c) => c.id) };
  }, judgeId);
  const shelves = await page.evaluate(() => document.querySelectorAll(".screen.active .jdg-shelf").length);
  check(shelves === def.concepts.length, `judgeLab(${judgeId}) 선반 ${def.concepts.length}개(2개념) (실제 ${shelves})`);
  const wrongShelf = def.concepts.find((c) => c !== def.cases[0].answer);
  const before = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  await page.evaluate((c) => document.querySelector(`.screen.active .jdg-shelf[data-c="${c}"]`).click(), wrongShelf);
  await W(420);
  const after = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(after !== before && after.length > 20, `judgeLab(${judgeId}) 오답 판정 → 교정 helper (${after.slice(0, 14)}…)`);
  for (const c of def.cases) {
    await page.evaluate((cid) => document.querySelector(`.screen.active .jdg-shelf[data-c="${cid}"]`).click(), c.answer);
    await W(560);
  }
  const trapChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="trap"].on'));
  check(trapChip, `judgeLab(${judgeId}) 함정 카드 칩 점등`);
  await page.waitForSelector(`${active} .msn-quiz.show`, { timeout: 9000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-quiz .msn-opt")[1]?.click());
  await W(350);
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-quiz .msn-opt")[0]?.click());
  await W(500);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `judgeLab(${judgeId}) 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// ── Ⅺ 신설 기함 2종 ─────────────────────────────────────────
// 공용: 활성 릴레이 버튼 탭 + msn 판정(ppl-quiz) — e2e-soc10 문법 그대로
const actBtnTap = (label) =>
  page.evaluate((frag) => {
    const b = [...document.querySelectorAll(".screen.active .ppl-act")].filter((x) => !x.disabled && !x.classList.contains("done")).find((x) => x.textContent.includes(frag));
    if (!b) return false;
    b.click();
    return true;
  }, label);
const pplMsn = async (wrongFirst = false) => {
  await page.waitForSelector(`${active} .ppl-quiz.show`, { timeout: 9000 });
  if (wrongFirst) {
    await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-quiz .msn-opt")[1]?.click());
    await W(350);
    const t = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
    check(t.length > 20, `기함 판정 오답 교정 (${t.slice(0, 14)}…)`);
  }
  await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-quiz .msn-opt")[0]?.click());
  await W(1900);
};

// trialLab: 소장 접수+판정(오답 경로) → 변론 2연타 → 판결+판정 → 수사 2연타 → 기소+판정 → 공판 2연타
const trialStep = async () => {
  await page.waitForSelector(`${active} .ppl-scene`, { timeout: 9000 });
  if (!(await actBtnTap("소장 접수하기"))) throw new Error("소장 버튼 없음");
  await W(900);
  await pplMsn(true); // 원고 명명(오답 경로 포함)
  for (let i = 0; i < 2; i += 1) {
    check(await actBtnTap("변론 듣기"), `trialLab 변론 ${i + 1}/2`);
    await W(500);
  }
  await W(1500);
  if (!(await actBtnTap("판결 선고하기"))) throw new Error("판결 버튼 없음");
  await W(1000);
  await pplMsn(); // 민사 판사의 일
  for (let i = 0; i < 2; i += 1) {
    check(await actBtnTap("수사 진행하기"), `trialLab 수사 ${i + 1}/2`);
    await W(500);
  }
  await W(1400);
  if (!(await actBtnTap("기소하기"))) throw new Error("기소 버튼 없음");
  await W(900);
  await pplMsn(); // 기소 = 검사
  for (let i = 0; i < 2; i += 1) {
    check(await actBtnTap("재판 진행하기"), `trialLab 공판 ${i + 1}/2`);
    await W(500);
  }
  await W(1700);
  const badges = await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-prop").length);
  check(badges === 6, `trialLab 국면 배지 6개 적재 (실제 ${badges})`);
  const strip = await page.evaluate(() => (document.querySelector(".screen.active .ppl-scene")?.textContent ?? "").includes("두 무대 완주"));
  check(strip, "trialLab 피날레 — 두 무대 비교 띠");
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `trialLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// fairTrialLab: 바람막이+판정(오답 경로) → 커튼 2연타 → 소문 기각+증거 채택+판정 → 계단 2연타+판정
const fairTrialStep = async () => {
  await page.waitForSelector(`${active} .ppl-scene`, { timeout: 9000 });
  if (!(await actBtnTap("바람막이 세우기"))) throw new Error("바람막이 버튼 없음");
  await W(1000);
  await pplMsn(true); // 헌법과 법률·양심(오답 경로 포함)
  for (let i = 0; i < 2; i += 1) {
    check(await actBtnTap("커튼 걷기"), `fairTrialLab 커튼 ${i + 1}/2`);
    await W(500);
  }
  await W(1700);
  if (!(await actBtnTap("소문 카드 기각하기"))) throw new Error("소문 기각 버튼 없음");
  await W(500);
  if (!(await actBtnTap("증거 카드 채택하기"))) throw new Error("증거 채택 버튼 없음");
  await W(1000);
  await pplMsn(); // 적법 수집 증거
  for (let i = 0; i < 2; i += 1) {
    check(await actBtnTap("다시 재판 청구하기"), `fairTrialLab 계단 ${i + 1}/2`);
    await W(600);
  }
  await W(1100);
  await pplMsn(); // 항소 명명
  const badges = await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-prop").length);
  check(badges === 4, `fairTrialLab 장치 배지 4개 적재 (실제 ${badges})`);
  const temple = await page.evaluate(() => (document.querySelector(".screen.active .ppl-scene")?.innerHTML ?? "").includes("사법권 독립"));
  check(temple, "fairTrialLab 피날레 — 4기둥 저울 신전");
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `fairTrialLab 목표 3/3 (실제 ${chips})`);
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
    else if (step.type === "concept") await conceptStep();
    else if (step.type === "recap") await recapStep();
    else if (step.type === "comic") await comicStep(step);
    else if (step.type === "quiz") await quiz(step);
    else if (step.type === "binSort") await binSortStep(step);
    else if (step.type === "order") await orderStep(step);
    else if (step.type === "judgeLab") await judgeStep(step.judge);
    else if (step.type === "trialLab") await trialStep();
    else if (step.type === "fairTrialLab") await fairTrialStep();
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
  for (const id of ["s1u11l1", "s1u11l2", "s1u11l3", "s1u11l4", "s1u11l5", "s1u11l6", "s1u11l7"]) {
    if (!ONLY || ONLY.includes(id)) await runLesson(id);
  }
  check(pageErrors === 0, `페이지 오류 0건 (실제 ${pageErrors})`);
} catch (e) {
  console.log("E2E ABORT:", e.message);
  fails += 1;
}

console.log(`\n===== 사회 Ⅺ e2e: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
await browser.close();
process.exit(fails ? 1 : 0);
