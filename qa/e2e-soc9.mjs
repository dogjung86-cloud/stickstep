// 사회 Ⅸ(민주주의와 시민) 7레슨 실플레이 E2E — e2e-soc8 골격 + Ⅸ 신설 기함 2종 + dilemma 2호.
// DEV 서버 필요(data-oi 사용). PORT=<포트> node qa/e2e-soc9.mjs
// 홈 9번째 탭 전환(vote 테마) · judgeLab 2종(ispolitics·demoway — 오답 교정 경로 포함) ·
// dilemmaLab(speedvote — 두 갈래·되감기·명명 교정·용어 카드 "다수결의 원칙") ·
// suffrageLab(시대 슬라이더 6 정거장·1918 첫 투표 칩·판정) · principleLab(4국면 릴레이 —
// 주권 옮기기/두 갈래 자치/최고 규칙/일 나누기 3연타·피날레 신전 판정) ·
// comic 말풍선 개수 대조 · recap more · 개념 컷 로드 · 전 퀴즈.
// 부분 실행: ONLY=s1u9l1,s1u9l5 PORT=... node qa/e2e-soc9.mjs (홈 검증은 항상 수행)
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

// ── 홈 지도 검증(캐러셀 — Ⅸ = 9번째 탭 전환 후 카운트) ──
{
  const home = await page.evaluate(() => ({ bands: document.querySelectorAll(".unit-band").length }));
  const socUnits = await page.evaluate(async () => (await import("/src/content/soc/curriculum.ts")).SOC_G1.length);
  check(home.bands === socUnits, `홈 밴드 = 사회 커리큘럼 단원 수(${socUnits}) (실제 ${home.bands})`);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[8].click());
  await W(800);
  const u9map = await page.evaluate(async () => {
    const { findUnit } = await import("/src/content/curriculum.ts");
    return {
      nodes: document.querySelectorAll(".gm-node").length,
      vote: !!document.querySelector(".gm-terrain.vote"),
      // 시드가 premium:true라 크라운은 안 뜬다(잠금 표시) — 프리미엄 구성은 데이터로 검증
      prem: findUnit("s1u9").lessons.filter((l) => l.premium).length,
      coming: !!document.querySelector(".coming-card"),
      decos: document.querySelectorAll(".gm-deco").length,
    };
  });
  check(u9map.nodes === 7, `Ⅸ단원 레슨 노드 7개 (실제 ${u9map.nodes})`);
  check(u9map.vote, "Ⅸ단원 vote 테마 지형 적용(단원별 색 분리)");
  check(u9map.prem === 4, `프리미엄 레슨 4개(무료 3) (실제 ${u9map.prem})`);
  check(!u9map.coming, "comingSoon 카드 없음(신규 append 단원)");
  check(u9map.decos >= 5, `단원 데코 렌더 ≥5 (실제 ${u9map.decos})`);
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
      ? { type: st.type, mode: st.mode, answer: st.answer, items: st.items, bins: st.bins, pairs: st.pairs, scene: st.scene, judge: st.judge, dilemma: st.dilemma, panels: st.panels?.map((p) => ({ bubbles: p.bubbles?.length ?? 0 })) }
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

// ── 훅(장면 조작 → 예측 → CTA) — 미완료 대상 재시도 루프(진행 버튼 반복 탭) ──
const hookStep = async (scene) => {
  for (let i = 0; i < 8; i += 1) {
    const done = await page.evaluate(() => !!document.querySelector(".screen.active .hook-choices.show .hook-choice"));
    if (done) break;
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll(".screen.active .hs9-btn, .screen.active .hs8-btn")].filter((b) => !b.disabled);
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

// ── 퀴즈·능동형 스텝(e2e-soc8 문법 그대로) ─────────────────────
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

const pairMatchStep = async (step) => {
  await page.waitForSelector(`${active} .pm-chip`, { timeout: 9000 });
  for (const p of step.pairs) {
    const ok = await page.evaluate(({ a, b }) => {
      const strip = (h) => {
        const t = document.createElement("span");
        t.innerHTML = h;
        return (t.textContent ?? "").replace(/\s+/g, " ").trim();
      };
      const ac = [...document.querySelectorAll(".screen.active .pm-chip.pm-a")].find((c) => strip(c.innerHTML) === strip(a));
      const bc = [...document.querySelectorAll(".screen.active .pm-chip.pm-b")].find((c) => strip(c.innerHTML) === strip(b));
      if (!ac || !bc) return false;
      ac.click();
      bc.click();
      return true;
    }, p);
    if (!ok) throw new Error(`pairMatch 칩 없음: ${p.a}`);
    await W(220);
  }
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

// ── comic — 말풍선 하이브리드 렌더 검증 ──
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

// ── judgeLab(공통 — 오답 교정 경로 포함, e2e-soc7 문법) ──
const judgeStep = async (judgeId) => {
  await page.waitForSelector(`${active} .jdg-card.in`, { timeout: 9000 });
  const def = await page.evaluate(async (id) => {
    const { JUDGES } = await import("/src/ui/judgeKit.ts");
    const d = JUDGES[id];
    return { cases: d.cases.map((c) => ({ answer: c.answer, trap: !!c.trap })), concepts: d.concepts.map((c) => c.id) };
  }, judgeId);
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

// ── dilemmaLab(speedvote — e2e-soc7 문법, 용어 카드 "다수결의 원칙") ──
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
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-quiz .msn-opt")[1]?.click());
  await W(350);
  const wrongText = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(wrongText.length > 20, `dilemma 명명 오답 교정 (${wrongText.slice(0, 14)}…)`);
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-quiz .msn-opt")[0]?.click());
  await W(600);
  const term = await page.evaluate(() => document.querySelector(".screen.active .dlm-term.show b")?.textContent ?? "");
  check(term === "다수결의 원칙", `dilemma 용어 카드 "${term}"`);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `dilemma 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// ── Ⅸ 신설 기함 2종 ─────────────────────────────────────────
// suffrageLab: 시대 슬라이더 6 정거장 완주(1918 첫 투표 칩 포함) → msn 판정(오답 경로 포함)
const suffrageStep = async () => {
  await page.waitForSelector(`${active} .sfr-range`, { timeout: 9000 });
  for (let v = 1; v <= 5; v += 1) {
    await page.evaluate((val) => {
      const r = document.querySelector(".screen.active .sfr-range");
      r.value = String(val);
      r.dispatchEvent(new Event("input", { bubbles: true }));
    }, v);
    await W(420);
    if (v === 4) {
      const firstChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="first"].on'));
      check(firstChip, "suffrageLab 1918 '첫 투표' 칩 점등");
      const half = await page.evaluate(() => document.body.innerHTML.includes("30세 이상만"));
      check(half, "suffrageLab 1918 여성 부분 점등 배지(30세 이상만)");
    }
  }
  const walkChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="walk"].on'));
  check(walkChip, "suffrageLab 시대 완주 칩 점등(6/6)");
  await page.waitForSelector(`${active} .sfr-quiz.show`, { timeout: 9000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .sfr-quiz .msn-opt")[1]?.click());
  await W(350);
  const wrongText = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(wrongText.length > 20, `suffrageLab 판정 오답 교정 (${wrongText.slice(0, 14)}…)`);
  await page.evaluate(() => document.querySelectorAll(".screen.active .sfr-quiz .msn-opt")[0]?.click());
  await W(500);
  const boyeo = await page.evaluate(() => (document.querySelector(".screen.active .helper")?.textContent ?? "").includes("보통 선거"));
  check(boyeo, "suffrageLab 정답 → '보통 선거' 명명");
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `suffrageLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// principleLab: 4국면 릴레이(주권 1탭 → 자치 2버튼 → 규칙 1탭 → 분립 3탭) + 국면 msn + 피날레
const principleStep = async () => {
  await page.waitForSelector(`${active} .ppl-scene`, { timeout: 9000 });
  const msn = async (wrongFirst = false) => {
    await page.waitForSelector(`${active} .ppl-quiz.show`, { timeout: 9000 });
    if (wrongFirst) {
      await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-quiz .msn-opt")[1]?.click());
      await W(350);
      const t = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
      check(t.length > 20, `principleLab 판정 오답 교정 (${t.slice(0, 14)}…)`);
    }
    await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-quiz .msn-opt")[0]?.click());
    await W(1800);
  };
  const acts = () => page.evaluate(() => [...document.querySelectorAll(".screen.active .ppl-act")].filter((b) => !b.disabled && !b.classList.contains("done")).length);
  const act = (i = 0) => page.evaluate((idx) => [...document.querySelectorAll(".screen.active .ppl-act")].filter((b) => !b.disabled && !b.classList.contains("done"))[idx]?.click(), i);
  // ① 국민 주권(주권 옮기기) — 오답 경로 포함
  await act();
  await W(1000);
  await msn(true);
  // ② 국민 자치(두 갈래 모두 체험)
  check((await acts()) === 2, "principleLab 자치 국면 — 두 갈래 버튼 2개");
  await act(0);
  await W(700);
  await act(0); // 남은 활성 버튼(두 번째 방법)
  await W(1100);
  const twoway = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="twoway"].on'));
  check(twoway, "principleLab '두 갈래 자치' 칩 점등");
  await msn();
  // ③ 입헌주의(최고 규칙 세우기)
  await act();
  await W(1000);
  await msn();
  // ④ 권력 분립(일 나누기 3연타)
  for (let i = 0; i < 3; i += 1) {
    await act();
    await W(420);
  }
  await W(700);
  await msn();
  // 피날레 — 신전 + 최종 판정
  const badges = await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-prop").length);
  check(badges === 4, `principleLab 원리 배지 4개 적재 (실제 ${badges})`);
  await page.waitForSelector(`${active} .ppl-quiz.show`, { timeout: 9000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .ppl-quiz .msn-opt")[0]?.click());
  await W(600);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `principleLab 목표 3/3 (실제 ${chips})`);
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
    else if (step.type === "pairMatch") await pairMatchStep(step);
    else if (step.type === "judgeLab") await judgeStep(step.judge);
    else if (step.type === "dilemmaLab") await dilemmaStep();
    else if (step.type === "suffrageLab") await suffrageStep();
    else if (step.type === "principleLab") await principleStep();
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
  for (const id of ["s1u9l1", "s1u9l2", "s1u9l3", "s1u9l4", "s1u9l5", "s1u9l6", "s1u9l7"]) {
    if (!ONLY || ONLY.includes(id)) await runLesson(id);
  }
  check(pageErrors === 0, `페이지 오류 0건 (실제 ${pageErrors})`);
} catch (e) {
  console.log("E2E ABORT:", e.message);
  fails += 1;
}

console.log(`\n===== 사회 Ⅸ e2e: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
await browser.close();
process.exit(fails ? 1 : 0);
