// 사회 Ⅳ(아프리카) 8레슨 실플레이 E2E — e2e-soc3 문법 복제 + Ⅳ 신규 랩(rainBeltLab)·훅 8장면.
// DEV 서버 필요(data-oi 사용). PORT=<포트> node qa/e2e-soc4.mjs
// 홈 탭 전환 검증 · regionPlaceLab(아프리카 5지역 — **세로 인라인 모드**: 오답 코미디·바다·
// 마다가스카르 outsideMsg·특징 안경) · rainBeltLab(관찰·계절 실험·판정 오답 교정) ·
// hotspot 7스팟/figTabs/pairMatch/binSort/recap more/컷·실사 로드/전 퀴즈.
// 부분 실행: ONLY=s1u4l1,s1u4l3 PORT=... node qa/e2e-soc4.mjs (홈 검증은 항상 수행)
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

// ── 홈 지도 검증(캐러셀 — 선택 단원의 지도만 렌더 → Ⅳ 탭 전환 후 카운트) ──
{
  const home = await page.evaluate(() => ({
    bands: document.querySelectorAll(".unit-band").length,
  }));
  check(home.bands === 6, `홈 밴드 6개 (실제 ${home.bands})`);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[3].click());
  await W(800);
  const u4map = await page.evaluate(() => ({
    nodes: document.querySelectorAll(".gm-node").length,
    world: !!document.querySelector(".gm-terrain.world"),
    coming: !!document.querySelector(".coming-card"),
  }));
  check(u4map.nodes === 8, `Ⅳ단원 레슨 노드 8개 (실제 ${u4map.nodes})`);
  check(u4map.world, "Ⅳ단원 world 테마 지형 적용");
  check(!u4map.coming, "comingSoon 카드가 사라짐(실제 단원 교체)");
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
  const tapFig = async (sel, times = 1, wait = 480) => {
    for (let i = 0; i < times; i += 1) {
      await page.evaluate((s) => document.querySelector(`.screen.active ${s}`).click(), sel);
      await W(wait);
    }
  };
  if (scene === "mappuzzle") await tapFig(".hs4-puzzle", 2, 520);
  else if (scene === "satnile") await tapFig(".hs4-flipbtn", 2, 520);
  else if (scene === "herdmove") await tapFig(".hs4-flipbtn", 1, 600);
  else if (scene === "shadelane") await tapFig(".hs4-flipbtn", 1, 600);
  else if (scene === "movienight") await tapFig(".hs4-ott", 2, 480);
  else if (scene === "classphoto") await tapFig(".hs4-class", 2, 480);
  else if (scene === "flagstars") await tapFig(".hs4-flipbtn", 1, 600);
  else if (scene === "greenline") await tapFig(".hs4-flipbtn", 1, 600);
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

const hotspotStep = async (step) => {
  await page.waitForSelector(`${active} .hs-dot`, { timeout: 9000 });
  for (let i = 0; i < step.spots.length; i += 1) {
    await page.evaluate((idx) => document.querySelectorAll(".screen.active .hs-dot")[idx].click(), i);
    await W(300);
  }
  const photo = await page.evaluate(() => {
    const im = document.querySelector('.screen.active .hs-photo img, .screen.active img[src*="soc/africa/"]');
    return im ? { loaded: im.complete && im.naturalWidth > 0, src: im.getAttribute("src") } : null;
  });
  if (photo) check(photo.loaded, `hotspot 실사 로드 (${photo.src?.split("/").pop()})`);
  await clickCTA();
};

const figTabsStep = async () => {
  await page.waitForSelector(`${active} .figtabs`, { timeout: 9000 });
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .seg button").length);
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((idx) => document.querySelectorAll(".screen.active .seg button")[idx].click(), i);
    await W(320);
  }
  const img = await page.evaluate(() => {
    const im = document.querySelector('.screen.active .figtabs img[src*="soc/africa/"]');
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

// ── 사회 Ⅳ 전용 랩 ───────────────────────────────────────────
// 기함(재사용 2차 검증): 아프리카 5지역 배치 — **세로 인라인 모드**(1.01:1 크롭은 세로가 더 크다).
// 드래그 문법: pointerdown(토큰) → pointermove/up(문서 — window 리스너가 받는다). 좌표는
// svg rect 기반 실좌표(스냅·판정은 클라이언트 좌표 → svg 좌표 역산이 랩 내부 공식과 동일).
const AF_CROP = { x: 444, y: 144, w: 209, h: 206 };
const regionPlace = async () => {
  await page.waitForSelector(`${active} .rpl-svg`, { timeout: 9000 });
  const chipLabel = await page.evaluate(() => document.querySelector('.screen.active .pn-badge[data-g="all"] b')?.textContent ?? "");
  check(chipLabel === "다섯 지역", `목표 칩 라벨 동적("${chipLabel}")`);
  const noSwap = await page.evaluate(() => !document.querySelector(".screen.active .swapbtn"));
  check(noSwap, "아프리카 = 세로 인라인 모드(가로 진입 버튼 없음)");
  // 특징 안경(목표 ②) — 힌트 아이콘 5개
  await page.evaluate(() => document.querySelector(".screen.active .rpl-lens").click());
  await W(400);
  const lensOn = await page.evaluate(() => ({
    on: document.querySelector(".screen.active .rpl-lens").classList.contains("on"),
    hints: [...document.querySelectorAll(".screen.active .rpl-hint")].filter((h) => h.getAttribute("opacity") === "1").length,
  }));
  check(lensOn.on && lensOn.hints === 5, `특징 안경 켜짐 + 힌트 아이콘 5개 (실제 ${lensOn.hints})`);
  // 드래그 배치 — svg rect 기반 화면 좌표
  const place = async (regionId, lon, lat) => {
    await page.evaluate(({ id, LON, LAT, crop }) => {
      const svg = document.querySelector(".screen.active .rpl-svg");
      const r = svg.getBoundingClientRect();
      const sx = ((LON + 180) / 360) * 1000;
      const sy = ((90 - LAT) / 180) * 500;
      const x = r.left + ((sx - crop.x) / crop.w) * r.width;
      const y = r.top + ((sy - crop.y) / crop.h) * r.height;
      const tok = document.querySelector(`.screen.active .rpl-token[data-r="${id}"]`);
      const tr = tok.getBoundingClientRect();
      const pe = (type, cx, cy, target) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: cx, clientY: cy, isPrimary: true }));
      pe("pointerdown", tr.left + tr.width / 2, tr.top + tr.height / 2, tok);
      pe("pointermove", x, y, document.body);
      pe("pointerup", x, y, document.body);
    }, { id: regionId, LON: lon, LAT: lat, crop: AF_CROP });
    await W(360);
  };
  const toastText = () => page.evaluate(() => document.querySelector(".screen.active .rpl-toast")?.textContent ?? "");
  // 오답 코미디: 북부 이름표를 남부(보츠와나 부근)에
  await place("north", 23, -22);
  const wrongToast = await toastText();
  check(wrongToast.includes("남부 아프리카"), `오답 코미디 토스트 (${wrongToast.slice(0, 20)}…)`);
  // 바다 풍덩: 서부 이름표를 대서양(기니만 앞바다)에
  await place("west", -15, 3);
  const seaToast = await toastText();
  check(seaToast.includes("풍덩") || seaToast.includes("바다"), `바다 풍덩 토스트 (${seaToast.slice(0, 14)}…)`);
  // 지역 밖 육지: 동부 이름표를 마다가스카르에 → outsideMsg 분기
  await place("east", 46.8, -19.5);
  const outToast = await toastText();
  check(outToast.includes("마다가스카르"), `outsideMsg 마다가스카르 분기 (${outToast.slice(0, 16)}…)`);
  // 정답 5연속(사하라·말리·콩고 분지·에티오피아·보츠와나)
  await place("north", 10, 24);
  await place("west", -2, 13);
  await place("central", 21, 1);
  await place("east", 38, 6);
  await place("south", 23, -22);
  const marks = await page.evaluate(() => document.querySelectorAll(".screen.active .rpl-mark").length);
  check(marks === 5, `지역 라벨 도장 5개 (실제 ${marks})`);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `regionPlaceLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// rainBeltLab: 비 띠 관찰(2.6s) → 7월 실험(2.2s) → 판정 2지선다(오답 교정 포함)
const rainBelt = async () => {
  await page.waitForSelector(`${active} .spring-canvas`, { timeout: 9000 });
  await W(3100); // 1월 비 띠 관찰
  const beltChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="belt"].on'));
  check(beltChip, "rainBeltLab 비 띠 관찰 목표");
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll(".screen.active .seg button")];
    btns.find((b) => b.textContent.includes("7월"))?.click();
  });
  await W(2600); // 7월 이동 관찰
  await page.waitForSelector(`${active} .msn-quiz.show`, { timeout: 9000 });
  // 오답(나무 오개념) 먼저 → 교정 문구 → 정답
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-opt")[1]?.click());
  await W(350);
  const wrongQ = await page.evaluate(() => document.querySelector(".screen.active .msn-q")?.textContent ?? "");
  check(wrongQ.includes("나무 때문이 아니에요"), `rainBeltLab 오답 교정 문구 (${wrongQ.slice(0, 14)}…)`);
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-opt")[0]?.click());
  await W(400);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `rainBeltLab 목표 3/3 (실제 ${chips})`);
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
    else if (step.type === "rainBeltLab") await rainBelt();
    else if (step.type === "concept") await conceptStep();
    else if (step.type === "recap") await recapStep();
    else if (step.type === "quiz") await quiz(step);
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

const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
try {
  for (const id of ["s1u4l1", "s1u4l2", "s1u4l3", "s1u4l4", "s1u4l5", "s1u4l6", "s1u4l7", "s1u4l8"]) {
    if (!ONLY || ONLY.includes(id)) await runLesson(id);
  }
  check(pageErrors === 0, `페이지 오류 0건 (실제 ${pageErrors})`);
} catch (e) {
  console.log("E2E ABORT:", e.message);
  fails += 1;
}

console.log(`\n===== 사회 Ⅳ e2e: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
await browser.close();
process.exit(fails ? 1 : 0);
