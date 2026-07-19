// 사회 Ⅵ(오세아니아와 극지방) 8레슨 실플레이 E2E — e2e-soc5 문법 복제 + Ⅵ 신규 랩 2종.
// DEV 서버 필요(data-oi 사용). PORT=<포트> node qa/e2e-soc6.mjs
// 홈 6번째 탭 전환 검증 · regionPlaceLab(오세아니아 5지역 — 세로 인라인·대양 판정 순서:
// 타 지역 바다 = 코미디 먼저·빈 바다 = seaMsg·동남아 outsideMsg·**날짜변경선 건너 언랩 좌표 배치**) ·
// seasonLab(가로 드래그 공전 — 12월·6월 체류 + 판정 오답 교정) · shipRaceLab(경주 → 북동 도착 →
// 판정) · hotspot 7스팟/figTabs/pairMatch/binSort/recap more/컷·실사 로드/전 퀴즈.
// 부분 실행: ONLY=s1u6l1,s1u6l3 PORT=... node qa/e2e-soc6.mjs (홈 검증은 항상 수행)
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

// ── 홈 지도 검증(캐러셀 — Ⅵ = 6번째 탭 전환 후 카운트) ──
{
  const home = await page.evaluate(() => ({
    bands: document.querySelectorAll(".unit-band").length,
  }));
  check(home.bands === 6, `홈 밴드 6개 (실제 ${home.bands})`);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[5].click());
  await W(800);
  const u6map = await page.evaluate(() => ({
    nodes: document.querySelectorAll(".gm-node").length,
    world: !!document.querySelector(".gm-terrain.world"),
    coming: !!document.querySelector(".coming-card"),
  }));
  check(u6map.nodes === 8, `Ⅵ단원 레슨 노드 8개 (실제 ${u6map.nodes})`);
  check(u6map.world, "Ⅵ단원 world 테마 지형 적용");
  check(!u6map.coming, "comingSoon 카드가 사라짐(실제 단원 교체)");
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
// martorigin·ploggingrun은 프레임 x좌표 분기 탭(진열대 3칸·쓰레기 3개) — 상대 x로 클릭.
const tapFrameAt = async (fracX, wait = 480) => {
  await page.evaluate((fx) => {
    const fig = document.querySelector(".screen.active .hs6-frame");
    const r = fig.getBoundingClientRect();
    fig.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: r.left + r.width * fx, clientY: r.top + r.height * 0.6 }));
  }, fracX);
  await W(wait);
};
const hookStep = async (scene) => {
  const tapBtn = async (times = 1, wait = 560) => {
    for (let i = 0; i < times; i += 1) {
      await page.evaluate(() => document.querySelector(".screen.active .hs6-btn").click());
      await W(wait);
    }
  };
  if (scene === "newyearfirst") await tapBtn(1, 700);
  else if (scene === "ulurumystery") await tapBtn(2, 560);
  else if (scene === "santasurf") await tapBtn(1, 640);
  else if (scene === "martorigin") {
    await tapFrameAt(0.18);
    await tapFrameAt(0.5);
    await tapFrameAt(0.85);
  } else if (scene === "trashisland") await tapBtn(1, 640);
  else if (scene === "ploggingrun") {
    await tapFrameAt(0.24);
    await tapFrameAt(0.54);
    await tapFrameAt(0.82);
  } else if (scene === "stationwhy") await tapBtn(1, 640);
  else if (scene === "arcticflags") await tapBtn(1, 700);
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
    const im = document.querySelector('.screen.active .hs-photo img, .screen.active img[src*="soc/oceania/"]');
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
    const im = document.querySelector('.screen.active .figtabs img[src*="soc/oceania/"]');
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

// ── 사회 Ⅵ 전용 랩 ───────────────────────────────────────────
// 기함(재사용 5차 검증): 오세아니아 5지역 — 세로 인라인 + 대양 판정 순서 + 날짜변경선 언랩 좌표.
const OC_CROP = { x: 805, y: 200, w: 229, h: 184 };
const regionPlace = async () => {
  await page.waitForSelector(`${active} .rpl-svg`, { timeout: 9000 });
  const chipLabel = await page.evaluate(() => document.querySelector('.screen.active .pn-badge[data-g="all"] b')?.textContent ?? "");
  check(chipLabel === "다섯 지역", `목표 칩 라벨 동적("${chipLabel}")`);
  const noSwap = await page.evaluate(() => !document.querySelector(".screen.active .swapbtn"));
  check(noSwap, "오세아니아 = 세로 인라인 모드(가로 진입 버튼 없음)");
  const dateline = await page.evaluate(() => (document.querySelector(".screen.active .rpl-svg")?.innerHTML ?? "").includes("날짜 변경선"));
  check(dateline, "지도에 날짜 변경선 표기");
  // 특징 안경(목표 ②) — 힌트 아이콘 5개
  await page.evaluate(() => document.querySelector(".screen.active .rpl-lens").click());
  await W(400);
  const lensOn = await page.evaluate(() => ({
    on: document.querySelector(".screen.active .rpl-lens").classList.contains("on"),
    hints: [...document.querySelectorAll(".screen.active .rpl-hint")].filter((h) => h.getAttribute("opacity") === "1").length,
  }));
  check(lensOn.on && lensOn.hints === 5, `특징 안경 켜짐 + 힌트 아이콘 5개 (실제 ${lensOn.hints})`);
  // 드래그 배치 — svg rect 기반 화면 좌표(언랩 경도 그대로 → x>1000도 같은 식)
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
    }, { id: regionId, LON: lon, LAT: lat, crop: OC_CROP });
    await W(360);
  };
  const toastText = () => page.evaluate(() => document.querySelector(".screen.active .rpl-toast")?.textContent ?? "");
  // 대양 판정 순서: 폴리네시아 이름표를 미크로네시아 한가운데 "바다"에 → 풍덩이 아니라 코미디
  await place("polynesia", 153, 6);
  const wrongToast = await toastText();
  check(wrongToast.includes("미크로네시아"), `타 지역 바다 = 오답 코미디 먼저 (${wrongToast.slice(0, 20)}…)`);
  // 지역 밖 빈 바다(산호해 북쪽) → 전용 seaMsg 풍덩
  await place("polynesia", 168, -7);
  const seaToast = await toastText();
  check(seaToast.includes("태평양"), `빈 바다 = 전용 seaMsg (${seaToast.slice(0, 16)}…)`);
  // 지역 밖 육지: 보르네오 → 동남아시아 outsideMsg(Ⅱ 회수)
  await place("australia", 114, 0.5);
  const outToast = await toastText();
  check(outToast.includes("동남아시아"), `outsideMsg 동남아 분기 (${outToast.slice(0, 16)}…)`);
  // 정답 5연속 — 폴리네시아는 날짜변경선 건너 언랩 좌표(lon 186 = 서경 174)
  await place("australia", 134, -25);
  await place("newzealand", 171, -43);
  await place("melanesia", 145, -6);
  await place("micronesia", 153, 6);
  await place("polynesia", 186, -12);
  const marks = await page.evaluate(() => document.querySelectorAll(".screen.active .rpl-mark").length);
  check(marks === 5, `지역 라벨 도장 5개 (실제 ${marks})`);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `regionPlaceLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// seasonLab: 가로 드래그 공전 — 12월 체류 → 6월 체류 → 판정 2지선다(오답 교정 포함)
const season = async () => {
  await page.waitForSelector(`${active} .spring-canvas`, { timeout: 9000 });
  await W(600);
  const dragTo = async (frac) => {
    // frac: 캔버스 폭 대비 이동량(음수 = 왼쪽). 위상 = 시작 + (dx / (w·0.55))·π
    await page.evaluate((f) => {
      const canvas = document.querySelector(".screen.active .spring-canvas");
      const r = canvas.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.55;
      const pe = (type, x) => canvas.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 9, clientX: x, clientY: cy, isPrimary: true }));
      pe("pointerdown", cx);
      const steps = 6;
      for (let i = 1; i <= steps; i += 1) pe("pointermove", cx + r.width * f * (i / steps));
      pe("pointerup", cx + r.width * f);
    }, frac);
  };
  // 12월로(위상 0) — 왼쪽으로 크게(클램프) → 체류 판정(400ms)
  await dragTo(-0.8);
  await W(1200);
  const decChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="dec"].on'));
  check(decChip, "seasonLab 12월 관찰 목표(남반구 여름)");
  // 6월로(위상 π) — 오른쪽으로 크게
  await dragTo(1.6);
  await W(1400);
  const junChip = await page.evaluate(() => !!document.querySelector('.screen.active .pn-badge[data-g="jun"].on'));
  check(junChip, "seasonLab 6월 관찰 목표(반전)");
  await page.waitForSelector(`${active} .msn-quiz.show`, { timeout: 9000 });
  // 오답(태양과 가까워져서) 먼저 → 교정 문구(1월 근일점) → 정답
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-opt")[1]?.click());
  await W(350);
  const wrongQ = await page.evaluate(() => document.querySelector(".screen.active .msn-q")?.textContent ?? "");
  check(wrongQ.includes("1월"), `seasonLab 오답 교정 문구 (${wrongQ.slice(0, 16)}…)`);
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-opt")[0]?.click());
  await W(400);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `seasonLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// shipRaceLab: 출발 → 북동 항로 도착(9s) → 남방 도착(12s) → 판정(오답 교정 포함)
const shipRace = async () => {
  await page.waitForSelector(`${active} .shr-go`, { timeout: 9000 });
  const facts = await page.evaluate(() => document.querySelectorAll(".screen.active .shr-fact").length);
  check(facts === 2, `항로 팩트 카드 2장 (실제 ${facts})`);
  await page.evaluate(() => document.querySelector(".screen.active .shr-go").click());
  await W(9600);
  const neState = await page.evaluate(() => ({
    chip: !!document.querySelector('.screen.active .pn-badge[data-g="ne"].on'),
    win: !!document.querySelector(".screen.active .shr-fact.ne.win"),
  }));
  check(neState.chip && neState.win, "shipRace 북동 항로 먼저 도착(칩+승리 배지)");
  await page.waitForSelector(`${active} .msn-quiz.show`, { timeout: 9000 });
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-opt")[1]?.click());
  await W(350);
  const wrongQ = await page.evaluate(() => document.querySelector(".screen.active .msn-q")?.textContent ?? "");
  check(wrongQ.includes("속력") || wrongQ.includes("거리"), `shipRace 오답 교정 문구 (${wrongQ.slice(0, 14)}…)`);
  await page.evaluate(() => document.querySelectorAll(".screen.active .msn-opt")[0]?.click());
  await W(400);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `shipRace 목표 3/3 (실제 ${chips})`);
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
    else if (step.type === "seasonLab") await season();
    else if (step.type === "shipRaceLab") await shipRace();
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
  for (const id of ["s1u6l1", "s1u6l2", "s1u6l3", "s1u6l4", "s1u6l5", "s1u6l6", "s1u6l7", "s1u6l8"]) {
    if (!ONLY || ONLY.includes(id)) await runLesson(id);
  }
  check(pageErrors === 0, `페이지 오류 0건 (실제 ${pageErrors})`);
} catch (e) {
  console.log("E2E ABORT:", e.message);
  fails += 1;
}

console.log(`\n===== 사회 Ⅵ e2e: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
await browser.close();
process.exit(fails ? 1 : 0);
