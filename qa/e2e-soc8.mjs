// 사회 Ⅷ(다양한 문화의 이해) 7레슨 실플레이 E2E — e2e-soc7 골격 + Ⅷ 신설 랩 3종.
// DEV 서버 필요(data-oi 사용). PORT=<포트> node qa/e2e-soc8.mjs
// 홈 8번째 탭 전환(fest 테마) · judgeLab 2종(오답 교정 경로 포함) · kimchiLab(국면 5 릴레이 —
// 맛보기/3연타/층 쌓기/시간 슬라이더/연쇄 점등) · factLab(도구 4 자유 순서 + 오답 교정 + 도장) ·
// feastLab(손님 3 상차림 + 곤란 교정 + 모두의 한 상) · pairMatch · figTabs(실사 로드) ·
// comic 말풍선 개수 대조 · recap more · 개념 컷 로드 · 전 퀴즈.
// 부분 실행: ONLY=s1u8l1,s1u8l5 PORT=... node qa/e2e-soc8.mjs (홈 검증은 항상 수행)
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

// ── 홈 지도 검증(캐러셀 — Ⅷ = 8번째 탭 전환 후 카운트) ──
{
  const home = await page.evaluate(() => ({ bands: document.querySelectorAll(".unit-band").length }));
  check(home.bands === 8, `홈 밴드 8개 (실제 ${home.bands})`);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[7].click());
  await W(800);
  const u8map = await page.evaluate(async () => {
    const { findUnit } = await import("/src/content/curriculum.ts");
    return {
      nodes: document.querySelectorAll(".gm-node").length,
      fest: !!document.querySelector(".gm-terrain.fest"),
      // 시드가 premium:true라 크라운은 안 뜬다(잠금 표시) — 프리미엄 구성은 데이터로 검증
      prem: findUnit("s1u8").lessons.filter((l) => l.premium).length,
      coming: !!document.querySelector(".coming-card"),
      decos: document.querySelectorAll(".gm-deco").length,
    };
  });
  check(u8map.nodes === 7, `Ⅷ단원 레슨 노드 7개 (실제 ${u8map.nodes})`);
  check(u8map.fest, "Ⅷ단원 fest 테마 지형 적용(단원별 색 분리)");
  check(u8map.prem === 4, `프리미엄 레슨 4개(무료 3) (실제 ${u8map.prem})`);
  check(!u8map.coming, "comingSoon 카드 없음(신규 append 단원)");
  check(u8map.decos >= 5, `단원 데코 렌더 ≥5 (실제 ${u8map.decos})`);
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
      ? { type: st.type, mode: st.mode, answer: st.answer, items: st.items, bins: st.bins, pairs: st.pairs, tabs: st.tabs, scene: st.scene, judge: st.judge, panels: st.panels?.map((p) => ({ bubbles: p.bubbles?.length ?? 0 })) }
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
      await page.evaluate(() => document.querySelector(".screen.active .hs8-btn").click());
      await W(wait);
    }
  };
  if (scene === "wordhunt") await tapBtn(3, 520);
  else if (scene === "mycomment") await tapBtn(1, 3300); // 조회·댓글 캐스케이드 대기
  else await tapBtn(1, 900);
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

const figTabsStep = async () => {
  await page.waitForSelector(`${active} .figtabs`, { timeout: 9000 });
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .seg button").length);
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((idx) => document.querySelectorAll(".screen.active .seg button")[idx].click(), i);
    await W(320);
  }
  const img = await page.evaluate(() => {
    const im = document.querySelector('.screen.active .figtabs img[src*="soc/culture/"]');
    return im ? { loaded: im.complete && im.naturalWidth > 0, src: im.getAttribute("src") } : null;
  });
  if (img) check(img.loaded, `figTabs 실사 로드 (${img.src?.split("/").pop()})`);
  await clickCTA();
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
  const photo = await page.evaluate(() => {
    const img = document.querySelector('.screen.active img[src*="soc/culture/"]');
    if (!img) return null;
    return { loaded: img.complete && img.naturalWidth > 0 };
  });
  if (photo) check(photo.loaded, "concept 실사(새해 음식) 로드");
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

// ── Ⅷ 신설 랩 3종 ───────────────────────────────────────────
// kimchiLab: 국면 5 릴레이 — 첫 국면은 오답 경로 포함(msn 교정), 시간 슬라이더·연쇄 점등 검증
const kimchiStep = async () => {
  await page.waitForSelector(`${active} .kcl-scene`, { timeout: 9000 });
  const msn = async (wrongFirst = false) => {
    await page.waitForSelector(`${active} .kcl-quiz.show`, { timeout: 9000 });
    if (wrongFirst) {
      await page.evaluate(() => document.querySelectorAll(".screen.active .kcl-quiz .msn-opt")[1]?.click());
      await W(350);
      const t = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
      check(t.length > 20, `kimchiLab 판정 오답 교정 (${t.slice(0, 14)}…)`);
    }
    await page.evaluate(() => document.querySelectorAll(".screen.active .kcl-quiz .msn-opt")[0]?.click());
    await W(1700);
  };
  const act = () => page.evaluate(() => document.querySelector(".screen.active .kcl-act")?.click());
  // ① 공유성(맛보기) — 오답 경로 포함
  await act();
  await W(900);
  await msn(true);
  // ② 학습성(3연타)
  for (let i = 0; i < 3; i += 1) {
    await act();
    await W(320);
  }
  await W(600);
  await msn();
  // ③ 축적성(3연타)
  for (let i = 0; i < 3; i += 1) {
    await act();
    await W(320);
  }
  await W(800);
  await msn();
  // ④ 변동성(시간 슬라이더 — 하양 발견 → 오늘 복귀)
  await page.waitForSelector(`${active} .kcl-range`, { timeout: 9000 });
  await page.evaluate(() => {
    const r = document.querySelector(".screen.active .kcl-range");
    r.value = "0";
    r.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await W(400);
  const timeChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="time"].on'));
  check(timeChip, "kimchiLab 시간 여행 칩(하양 김치 발견)");
  await page.evaluate(() => {
    const r = document.querySelector(".screen.active .kcl-range");
    r.value = "100";
    r.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await W(700);
  await msn();
  // ⑤ 전체성(연쇄 점등)
  await act();
  await W(750 * 3 + 1100);
  const webChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="web"].on'));
  check(webChip, "kimchiLab 연결망 칩(연쇄 점등)");
  await msn();
  const props = await page.evaluate(() => [...document.querySelectorAll(".screen.active .kcl-prop")].map((x) => x.textContent));
  check(props.join("·") === "공유성·학습성·축적성·변동성·전체성", `kimchiLab 속성 배지 5종 (${props.join("·")})`);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `kimchiLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// factLab: 첫 도구는 오답 경로 포함, 4도구 → 최종 판정(오답 교정 → 정답) → 도장 + 명명 칩
const factStep = async () => {
  await page.waitForSelector(`${active} .fcl-post`, { timeout: 9000 });
  const pickMsn = async (idx) => {
    await page.waitForSelector(`${active} .fcl-quiz.show`, { timeout: 9000 });
    await page.evaluate((i) => document.querySelectorAll(".screen.active .fcl-quiz .msn-opt")[i]?.click(), idx);
    await W(idx === 0 ? 1600 : 400);
  };
  // 출처 — 하이라이트 확인 + 오답 경로
  await page.evaluate(() => document.querySelector('.screen.active .fcl-tool[data-t="source"]').click());
  await W(350);
  const hl = await page.evaluate(() => !!document.querySelector(".screen.active .fcl-part.fcl-hl"));
  check(hl, "factLab 도구 탭 → 게시물 하이라이트");
  await pickMsn(1);
  const wrongT = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(wrongT.length > 20, `factLab 판정 오답 교정 (${wrongT.slice(0, 14)}…)`);
  await pickMsn(0);
  for (const t of ["ground", "bias", "intent"]) {
    await page.evaluate((id) => document.querySelector(`.screen.active .fcl-tool[data-t="${id}"]`).click(), t);
    await W(350);
    await pickMsn(0);
  }
  await W(700);
  // 최종 판정: 오답(공유) → 교정 → 정답 → 도장
  await pickMsn(1);
  await pickMsn(0);
  await W(1800);
  const stamp = await page.evaluate(() => !!document.querySelector(".screen.active .fcl-stamp.on"));
  check(stamp, "factLab '가짜 정보' 도장");
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `factLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// feastLab: 곤란 음식 교정 → 손님 3 상차림 → 모두의 한 상(곤란 교정 포함) → 최종 msn
const feastStep = async () => {
  await page.waitForSelector(`${active} .fsl-food`, { timeout: 9000 });
  const tap = (f) => page.evaluate((id) => document.querySelector(`.screen.active .fsl-food[data-f="${id}"]`).click(), f);
  // 아민: 곤란(수육) 교정 확인
  await tap("suyuk");
  await W(400);
  const wrong = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(wrong.includes("돼지고기") && wrong.includes("않"), `feastLab 곤란 음식 교정 (${wrong.slice(0, 16)}…)`);
  for (const f of ["bulgogi", "bibim", "dubu", "eggroll"]) {
    await tap(f);
    await W(260);
  }
  await W(900);
  for (const f of ["suyuk", "bibim", "dubu", "eggroll"]) {
    await tap(f);
    await W(260);
  }
  await W(1000);
  for (const f of ["bibim", "dubu", "eggroll"]) {
    await tap(f);
    await W(260);
  }
  await W(1200);
  const served = await page.evaluate(() => document.querySelectorAll(".screen.active .fsl-guest.done").length);
  check(served === 3, `feastLab 세 손님 상차림 완료 (실제 ${served})`);
  // 모두의 한 상: 곤란(불고기) → 교정 → 공통 3
  await tap("bulgogi");
  await W(400);
  const cw = await page.evaluate(() => document.querySelector(".screen.active .helper")?.textContent ?? "");
  check(cw.includes("먹지 않아요"), `feastLab 공통 국면 교정 (${cw.slice(0, 16)}…)`);
  for (const f of ["bibim", "dubu", "eggroll"]) {
    await tap(f);
    await W(260);
  }
  await W(1400);
  await page.waitForSelector(`${active} .fsl-quiz.show`, { timeout: 9000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .fsl-quiz .msn-opt")[0]?.click());
  await W(600);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `feastLab 목표 3/3 (실제 ${chips})`);
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
    else if (step.type === "kimchiLab") await kimchiStep();
    else if (step.type === "factLab") await factStep();
    else if (step.type === "feastLab") await feastStep();
    else if (step.type === "comic") await comicStep(step);
    else if (step.type === "concept") await conceptStep();
    else if (step.type === "recap") await recapStep();
    else if (step.type === "quiz") await quiz(step);
    else if (step.type === "binSort") await binSortStep(step);
    else if (step.type === "order") await orderStep(step);
    else if (step.type === "pairMatch") await pairMatchStep(step);
    else if (step.type === "figTabs") await figTabsStep();
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
  for (const id of ["s1u8l1", "s1u8l2", "s1u8l3", "s1u8l4", "s1u8l5", "s1u8l6", "s1u8l7"]) {
    if (!ONLY || ONLY.includes(id)) await runLesson(id);
  }
  check(pageErrors === 0, `페이지 오류 0건 (실제 ${pageErrors})`);
} catch (e) {
  console.log("E2E ABORT:", e.message);
  fails += 1;
}

console.log(`\n===== 사회 Ⅷ e2e: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
await browser.close();
process.exit(fails ? 1 : 0);
