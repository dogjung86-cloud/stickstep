// 사회 Ⅱ(아시아) 8레슨 실플레이 E2E — e2e-soc1 문법 복제 + Ⅱ 신규 랩 3종.
// DEV 서버 필요(data-oi 사용). PORT=<포트> node qa/e2e-soc2.mjs
// 훅 8장면 실조작 · regionPlaceLab 배치(오답 코미디+특징 안경 포함) · monsoonLab 계절 토글 ·
// pyramidLab 존 판독 · hotspot/figTabs/pairMatch/binSort/order/recap more/컷 로드/전 퀴즈.
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

// ── 홈 지도 검증(캐러셀 — 선택 단원의 지도만 렌더) ────────────
{
  const home = await page.evaluate(() => ({
    bands: document.querySelectorAll(".unit-band").length,
    nodes: document.querySelectorAll(".gm-node").length,
  }));
  check(home.bands === 7, `홈 밴드 7개 (실제 ${home.bands})`);
  // Ⅱ 탭으로 전환 → 8레슨 노드 + world 테마 지형
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[1].click());
  await W(800);
  const u2map = await page.evaluate(() => ({
    nodes: document.querySelectorAll(".gm-node").length,
    world: !!document.querySelector(".gm-terrain.world"),
  }));
  check(u2map.nodes === 8, `Ⅱ단원 레슨 노드 8개 (실제 ${u2map.nodes})`);
  check(u2map.world, "Ⅱ단원 world 테마 지형 적용");
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
    return st ? { type: st.type, mode: st.mode, answer: st.answer, items: st.items, bins: st.bins, spots: st.spots, tabs: st.tabs, pairs: st.pairs, scene: st.scene } : null;
  }, i);

const clickCTA = async (timeout = 20000) => {
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
  const tapFig = async (sel, times = 1, wait = 420) => {
    for (let i = 0; i < times; i += 1) {
      await page.evaluate((s) => document.querySelector(`.screen.active ${s}`).click(), sel);
      await W(wait);
    }
  };
  if (scene === "asiangames") await tapFig(".hs2-games", 4);
  else if (scene === "monsoonrain") await tapFig(".hs2-flipbtn", 2, 520);
  else if (scene === "templetrip") await tapFig(".hs2-trip", 2);
  else if (scene === "halalmark") await tapFig(".hs2-flipbtn", 1, 520);
  else if (scene === "trainride") await tapFig(".hs2-train", 1, 700);
  else if (scene === "emptyclass") await tapFig(".hs2-flipbtn", 1, 520);
  else if (scene === "madein") {
    for (let i = 0; i < 3; i += 1) {
      await page.evaluate((idx) => {
        const g = document.querySelectorAll(".screen.active .hs2-shirt")[idx];
        g.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }, i);
      await W(420);
    }
  } else if (scene === "fanchant") await tapFig(".hs2-flipbtn", 1, 700);
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

const orderStep = async (step) => {
  await page.waitForSelector(`${active} .ord-chip`, { timeout: 9000 });
  for (const item of step.items) {
    const ok = await page.evaluate((html) => {
      const t = document.createElement("span");
      t.innerHTML = html;
      const wanted = (t.textContent ?? "").replace(/\s+/g, " ").trim();
      const chip = [...document.querySelectorAll(".screen.active .ord-pool .ord-chip")]
        .find((c) => (c.textContent ?? "").replace(/\s+/g, " ").trim() === wanted);
      chip?.click();
      return !!chip;
    }, item);
    if (!ok) throw new Error(`순서 칩 없음: ${item}`);
    await W(160);
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

const hotspotStep = async (step) => {
  await page.waitForSelector(`${active} .hs-dot`, { timeout: 9000 });
  for (let i = 0; i < step.spots.length; i += 1) {
    await page.evaluate((idx) => document.querySelectorAll(".screen.active .hs-dot")[idx].click(), i);
    await W(300);
  }
  await clickCTA();
};

const figTabsStep = async () => {
  await page.waitForSelector(`${active} .figtabs`, { timeout: 9000 });
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .seg button").length);
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((idx) => document.querySelectorAll(".screen.active .seg button")[idx].click(), i);
    await W(320);
  }
  // 발주 실사 figTabs(L3)면 이미지 로드도 검증
  const img = await page.evaluate(() => {
    const im = document.querySelector('.screen.active .figtabs img[src*="soc/asia/"]');
    return im ? { loaded: im.complete && im.naturalWidth > 0, src: im.getAttribute("src") } : null;
  });
  if (img) check(img.loaded, `figTabs 실사 로드 (${img.src?.split("/").pop()})`);
  await clickCTA();
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
      const chipA = [...document.querySelectorAll(".screen.active .pm-chip.pm-a")]
        .find((c) => strip(c.innerHTML) === strip(a) && !c.disabled);
      const chipB = [...document.querySelectorAll(".screen.active .pm-chip.pm-b")]
        .find((c) => strip(c.innerHTML) === strip(b) && !c.disabled);
      if (!chipA || !chipB) return false;
      chipA.click();
      chipB.click();
      return true;
    }, p);
    if (!ok) throw new Error(`짝 칩 없음: ${p.a}`);
    await W(300);
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

// ── 사회 Ⅱ 전용 랩 ───────────────────────────────────────────
// 기함: 다섯 지역 배치 — **가로 모드(rotateStage)**. 진입 버튼 → 회전 무대 드래그(mapPoint 역변환 —
// e2e-soc3와 같은 문법, 아시아 크롭).
const AS_CROP = { x: 569, y: 94, w: 348, h: 190 };
const regionPlace = async () => {
  await page.waitForSelector(`${active} .swapbtn`, { timeout: 9000 });
  const chipLabel = await page.evaluate(() => document.querySelector('.screen.active .pn-badge[data-g="all"] b')?.textContent ?? "");
  check(chipLabel === "다섯 지역", `목표 칩 라벨 동적("${chipLabel}")`);
  await page.evaluate(() => document.querySelector(".screen.active .swapbtn").click());
  await page.waitForSelector(".rot-overlay .rpl-stage-wide", { timeout: 9000 });
  await W(700);
  // 특징 안경(목표 ②)
  await page.evaluate(() => document.querySelector(".rot-overlay .rpl-lens").click());
  await W(400);
  const lensOn = await page.evaluate(() => ({
    on: document.querySelector(".rot-overlay .rpl-lens").classList.contains("on"),
    hints: [...document.querySelectorAll(".rot-overlay .rpl-hint")].filter((h) => h.getAttribute("opacity") === "1").length,
  }));
  check(lensOn.on && lensOn.hints === 5, `특징 안경 켜짐 + 힌트 아이콘 5개 (실제 ${lensOn.hints})`);
  const place = async (regionId, lon, lat) => {
    await page.evaluate(({ id, LON, LAT, crop }) => {
      const stage = document.querySelector(".rot-overlay .rpl-stage-wide");
      const ov = document.querySelector(".rot-overlay").getBoundingClientRect();
      const mapBox = document.querySelector(".rot-overlay .rpl-map");
      const native2 = document.querySelector(".rot-inner").classList.contains("native");
      const L = parseFloat(mapBox.style.left);
      const T = parseFloat(mapBox.style.top);
      const MW = parseFloat(mapBox.style.width);
      const MH = parseFloat(mapBox.style.height);
      const sx = ((LON + 180) / 360) * 1000;
      const sy = ((90 - LAT) / 180) * 500;
      const lx = L + ((sx - crop.x) / crop.w) * MW;
      const ly = T + ((sy - crop.y) / crop.h) * MH;
      const p = native2 ? { x: ov.left + lx, y: ov.top + ly } : { x: ov.right - ly, y: ov.top + lx };
      const tok = document.querySelector(`.rot-overlay .rpl-token[data-r="${id}"]`);
      const tr = tok.getBoundingClientRect();
      const pe = (type, x, y, target) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: x, clientY: y, isPrimary: true }));
      pe("pointerdown", tr.left + tr.width / 2, tr.top + tr.height / 2, tok);
      pe("pointermove", p.x, p.y, stage);
      pe("pointerup", p.x, p.y, stage);
    }, { id: regionId, LON: lon, LAT: lat, crop: AS_CROP });
    await W(360);
  };
  const toastText = () => page.evaluate(() => document.querySelector(".rot-overlay .wpl-toast")?.textContent ?? "");
  // 오답 코미디: 동아시아 이름표를 아라비아반도(서남아시아)에
  await place("east", 45, 25);
  const wrongToast = await toastText();
  check(wrongToast.includes("서남아시아"), `오답 코미디 토스트 (${wrongToast.slice(0, 20)}…)`);
  // 바다 풍덩: 남부 아시아 이름표를 인도양 한복판에
  await place("south", 85, -5);
  const seaToast = await toastText();
  check(seaToast.includes("풍덩") || seaToast.includes("바다"), `바다 풍덩 토스트 (${seaToast.slice(0, 14)}…)`);
  // 정답 5연속(경계 스냅 확인 겸 — 동아시아는 몽골 남부, 서남은 사우디 내륙)
  await place("east", 107, 36);
  await place("southeast", 102, 15);
  await place("south", 78, 22);
  await place("southwest", 45, 24);
  await place("central", 67, 45);
  const marks = await page.evaluate(() => document.querySelectorAll(".rot-overlay .rpl-mark").length);
  check(marks === 5, `지역 라벨 도장 5개 (실제 ${marks})`);
  const chips = await page.evaluate(() => document.querySelectorAll(".pn-badge.on").length);
  check(chips === 3, `regionPlaceLab 목표 3/3 (실제 ${chips})`);
  await page.evaluate(() => document.querySelector(".rot-exit").click());
  await W(600);
  await clickCTA();
};

const monsoon = async () => {
  await page.waitForSelector(`${active} .spring-canvas`, { timeout: 9000 });
  // 여름 관찰(기본 상태 2.4s) → 겨울 전환 관찰 → 판정
  await W(2900);
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".screen.active .seg button")];
    btns.find((b) => b.textContent.includes("겨울"))?.click();
  });
  await W(2900);
  await page.waitForSelector(`${active} .msn-quiz.show`, { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".screen.active .msn-opt").click());
  await W(400);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `monsoonLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

const pyramid = async () => {
  await page.waitForSelector(`${active} .pyr-zone`, { timeout: 9000 });
  const read = async (countryLabel, zone) => {
    await page.evaluate((lb) => {
      const b = [...document.querySelectorAll(".screen.active .seg button")].find((x) => x.textContent.includes(lb));
      b?.click();
    }, countryLabel);
    await W(520);
    await page.evaluate((z) => {
      const el2 = document.querySelector(`.screen.active .pyr-zone[data-z="${z}"]`);
      el2?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, zone);
    await W(420);
  };
  // 오답 경로 확인(파키스탄에서 노년층 탭 → 교정 문구)
  await page.evaluate(() => {
    document.querySelector('.screen.active .pyr-zone[data-z="old"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await W(300);
  const wrongQ = await page.evaluate(() => document.querySelector(".screen.active .pyr-q")?.textContent ?? "");
  check(wrongQ.includes("피라미드") || wrongQ.includes("좁"), `피라미드 오답 교정 문구 (${wrongQ.slice(0, 16)}…)`);
  await read("파키스탄", "young");
  await read("일본", "old");
  await read("카타르", "male");
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `pyramidLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// ── concept — 스틱맨 컷 로드 검증(lazy 금지 규칙) 포함 ───────
const conceptStep = async () => {
  await page.waitForSelector(`${active} .concept, ${active} .blocks, ${active} .term`, { timeout: 9000 }).catch(() => {});
  const cutInfo = await page.evaluate(() => {
    const img = document.querySelector('.screen.active img[src*="soc/cuts/"]');
    if (!img) return null;
    return { loaded: img.complete && img.naturalWidth > 0, src: img.getAttribute("src") };
  });
  if (cutInfo) {
    check(cutInfo.loaded, `개념 컷 로드 (${cutInfo.src?.split("/").pop()})`);
  }
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
    else if (step.type === "regionPlaceLab") await regionPlace();
    else if (step.type === "monsoonLab") await monsoon();
    else if (step.type === "pyramidLab") await pyramid();
    else if (step.type === "concept") await conceptStep();
    else if (step.type === "recap") await recapStep();
    else if (step.type === "quiz") await quiz(step);
    else if (step.type === "order") await orderStep(step);
    else if (step.type === "binSort") await binSortStep(step);
    else if (step.type === "hotspot") await hotspotStep(step);
    else if (step.type === "figTabs") await figTabsStep();
    else if (step.type === "pairMatch") await pairMatchStep(step);
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

// 부분 실행: ONLY=s1u2l1,s1u2l2 PORT=... node qa/e2e-soc2.mjs (홈 검증은 항상 수행)
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
try {
  for (const id of ["s1u2l1", "s1u2l2", "s1u2l3", "s1u2l4", "s1u2l5", "s1u2l6", "s1u2l7", "s1u2l8"]) {
    if (!ONLY || ONLY.includes(id)) await runLesson(id);
  }
  check(pageErrors === 0, `페이지 오류 0건 (실제 ${pageErrors})`);
} catch (e) {
  console.log("E2E ABORT:", e.message);
  fails += 1;
}

console.log(`\n===== 사회 Ⅱ e2e: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
await browser.close();
process.exit(fails ? 1 : 0);
