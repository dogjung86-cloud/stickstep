// 역사① Ⅳ(h1u4) 10레슨 실플레이 E2E — e2e-his3 문법 계승 + Ⅳ 신규 검증.
// DEV 서버 필요(data-oi 사용). PORT=<포트> node qa/e2e-his4.mjs  ·  ONLY=h1u4l9 부분 실행 지원.
// 검증: 홈 Ⅳ 지도(밴드 7·Ⅳ 탭 노드 10·프리미엄 7) · 훅 9장면 실조작 · comic 3편 말풍선 렌더 ·
// hotspot 2종(청명상하도 실사 무대 — 사진 카드 없음 / 신항로 지도 — 실사 카드 5) ·
// timelineLab h1u4(전부 기원후 — 축 왼쪽 끝 900·칩 2종) 실조작 · 세기 드릴 넘패드 ·
// 유물 실사 로드(naturalWidth>0) · recap more · 전 퀴즈.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const ONLY = (process.env.ONLY || "").split(",").filter(Boolean);
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
      viewSubject: "his",
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

// ── 홈 지도 — Ⅳ 실물 전환(밴드 7 · Ⅳ 탭 선택 시 노드 10 · 프리미엄 7) ──
if (!ONLY.length) {
  const bands = await page.evaluate(() => document.querySelectorAll(".unit-band").length);
  check(bands === 7, `홈 밴드 7개 — Ⅰ~Ⅳ 실물 + soon Ⅴ~Ⅶ (실제 ${bands})`);
  await page.evaluate(() => document.querySelectorAll(".unit-tab")[3]?.click());
  await W(900);
  const home = await page.evaluate(async () => {
    const { findLesson } = await import("/src/content/curriculum.ts");
    const ids = Array.from({ length: 7 }, (_, i) => `h1u4l${i + 4}`);
    const premData = ids.filter((id) => findLesson(id)?.lesson.premium).length;
    return {
      nodes: document.querySelectorAll(".gm-node").length,
      premData,
      his: !!document.querySelector(".gm-terrain.his"),
      soon: !!document.querySelector(".coming-card"),
    };
  });
  check(home.nodes === 10, `Ⅳ단원 레슨 노드 10개 (실제 ${home.nodes})`);
  check(home.premData === 7, `프리미엄 레슨 7개(L4~L10) 데이터 확인 (실제 ${home.premData})`);
  check(home.his, "Ⅳ his 테마 지형 적용");
  check(!home.soon, "Ⅳ가 준비 중 카드가 아니라 실물 지도");
}

// ── 레슨 열기(플레이어 직진입 — his3 문법) ───────────────────
const openLesson = async (id) => {
  const count = await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(lessonId);
    if (!found) throw new Error(`레슨 없음: ${lessonId}`);
    window.__hisE2E = { steps: found.lesson.steps, done: null };
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: (r) => (window.__hisE2E.done = r) }));
    return found.lesson.steps.length;
  }, id);
  await W(760);
  console.log(`\n=== [${id}] ${await heading()} (${count} steps) ===`);
  return count;
};

const stepData = (i) =>
  page.evaluate((idx) => {
    const st = window.__hisE2E?.steps?.[idx];
    return st
      ? { type: st.type, mode: st.mode, answer: st.answer, items: st.items, bins: st.bins, scene: st.scene, panels: st.panels?.map((p) => ({ bubbles: p.bubbles?.length ?? 0 })), defId: st.defId, spots: st.spots?.length, spotPhotos: Array.isArray(st.spots) ? st.spots.filter((s) => s.photo).length : 0, figure: typeof st.figure === "string" && st.figure.includes("photos/his") }
      : null;
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

// ── 훅 9장면(조작 → 예측 → CTA) — Ⅳ는 전부 SVG g 대상이라 MouseEvent 디스패치 ──
const hookStep = async (scene) => {
  const tapSvg = async (sel) =>
    page.evaluate((s) => document.querySelector(`.screen.active ${s}`).dispatchEvent(new MouseEvent("click", { bubbles: true })), sel);
  const SEL = {
    penmotto: ".hh4-mt-frame",
    banknote: ".hh4-bn-wallet",
    gercamp: ".hh4-gr-tent",
    chilikimchi: ".hh4-km-bowl",
    shogungame: ".hh4-sg-tv",
    tajphoto: ".hh4-tj-photo",
    coffeesign: ".hh4-cf-sign",
    frychoco: ".hh4-fr-tray",
    assembly: ".hh4-as-tv",
  };
  if (!SEL[scene]) throw new Error(`훅 셀렉터 없음: ${scene}`);
  await tapSvg(SEL[scene]);
  await page.waitForSelector(`${active} .hook-choices.show .hook-choice`, { timeout: 12000 });
  const q = await page.evaluate(() => !!document.querySelector(".screen.active .hook-q"));
  check(q, `[${scene}] 예측 질문이 선택지 위에 표시`);
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices.show .hook-choice").click());
  await W(400);
  await clickCTA();
};

// ── comic — 컷 로드 + 말풍선 하이브리드 렌더 검증 ────────────
// 말풍선은 이미지 % 좌표에 얹는 하이브리드라 폴백 렌더(발주 전)에서는 의도적으로 걷힌다(comic.ts) —
// 실이미지가 로드된 컷에서만 개수를 대조하고, 전 컷 폴백이면 발주 후 잔여 검증으로 남긴다.
const comicStep = async (step, lessonId) => {
  await page.waitForSelector(`${active} .comic-panel .comic-art`, { timeout: 9000 });
  let bubbleOk = true;
  let imgOk = true;
  let bubblesSeen = 0;
  let loadedPanels = 0;
  for (let p = 0; p < step.panels.length; p += 1) {
    await page.waitForFunction(
      (want) => document.querySelector(".screen.active .comic-count")?.textContent?.trim().startsWith(`${want} /`),
      p + 1,
      { timeout: 9000 },
    );
    await W(260);
    const st = await page.evaluate(() => {
      const img = document.querySelector(".screen.active .comic-art img.comic-img");
      const fb = !!document.querySelector(".screen.active .comic-art.is-fallback");
      return { loaded: !!img && img.complete && img.naturalWidth > 0, fallback: fb, bubbles: document.querySelectorAll(".screen.active .comic-art .cut-bubble").length };
    });
    if (!st.loaded && !st.fallback) imgOk = false;
    if (st.loaded) {
      loadedPanels += 1;
      if (st.bubbles !== step.panels[p].bubbles) bubbleOk = false;
      bubblesSeen += st.bubbles;
    }
    await clickCTA(); // 다음 컷 / 마지막 컷은 다음 스텝
  }
  check(imgOk, `[${lessonId}] 만화 컷 ${step.panels.length}장 로드(또는 폴백) 정상`);
  if (loadedPanels > 0) check(bubbleOk && bubblesSeen > 0, `[${lessonId}] 말풍선 하이브리드 렌더(총 ${bubblesSeen}개, 컷별 개수 일치)`);
  else console.log(`SKIP [${lessonId}] 말풍선 검증 — 전 컷 폴백(발주 후 잔여 검증)`);
};

// ── 퀴즈·능동형 ──────────────────────────────────────────────
const quiz = async (step, lessonId) => {
  if (step.figure) {
    await W(260);
    const fig = await page.evaluate(() => {
      const ims = [...document.querySelectorAll('.screen.active .q-figure img[src*="photos/his"], .screen.active img[src*="photos/his"]')];
      return { n: ims.length, ok: ims.every((im) => im.complete && im.naturalWidth > 0) };
    });
    if (fig.n) check(fig.ok, `[${lessonId}] 퀴즈 그림 실사 로드(${fig.n}장)`);
  }
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

const recapStep = async (lessonId) => {
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
  check(info.count >= 3 && info.arts === info.count, `[${lessonId}] recap 카드 ${info.count}장 전부 미니아트`);
  check(moreShown, `[${lessonId}] recap '자세히' 펼침(rm-h 심화)`);
  await clickCTA();
};

// concept — 유물 실사 figure가 있으면 로드 검증 후 CTA
const conceptStep = async (lessonId) => {
  await W(300);
  const photos = await page.evaluate(() => {
    const ims = [...document.querySelectorAll('.screen.active img[src*="photos/his"]')];
    return { n: ims.length, ok: ims.every((im) => im.complete && im.naturalWidth > 0) };
  });
  if (photos.n) check(photos.ok, `[${lessonId}] 유물 실사 ${photos.n}장 로드(naturalWidth>0)`);
  await clickCTA();
};

// ── hotspot — 전 스팟 탭. Ⅳ는 2종: 실사 무대(청명상하도 — 사진 카드 없음)와 지도+실사 카드(신항로) ──
const hotspotStep = async (step, lessonId) => {
  await page.waitForSelector(`${active} .hs-dot`, { timeout: 9000 });
  const stage = await page.evaluate(() => {
    const im = document.querySelector('.screen.active .hs-art img[src*="photos/his"]');
    return im ? im.complete && im.naturalWidth > 0 : null;
  });
  if (stage !== null) check(stage, `[${lessonId}] hotspot 실사 무대 로드(청명상하도)`);
  const n = step.spots ?? 0;
  let photoOk = false;
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((idx) => {
      const dots = document.querySelectorAll(".screen.active .hs-dot");
      dots[idx]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, i);
    await W(700);
    const ph = await page.evaluate(() => {
      const im = document.querySelector(".screen.active .hs-photo.show img");
      return !!im && im.complete && im.naturalWidth > 0;
    });
    if (ph) photoOk = true;
  }
  if (step.spotPhotos > 0) check(photoOk, `[${lessonId}] hotspot 실사 카드 로드(${n}스팟 중 사진 ${step.spotPhotos})`);
  await clickCTA();
};

// ── timelineLab 실조작 — 오답 교정 → 세기 2 + 사건 배치 3(전부 기원후·칩 2종·축 900) ──
const timelineStep = async (step) => {
  await page.waitForSelector(`${active} .htl-cell`, { timeout: 9000 });
  const info = await page.evaluate(async (defId) => {
    const { TIMELINES, centuriesOf, centuryOf } = await import("/src/ui/timelineKit.ts");
    const d = TIMELINES[defId];
    return {
      targets: d.tasks.map((t) => (t.kind === "century" ? t.century : centuryOf(t.year))),
      cells: centuriesOf(d),
      chips: (d.tasks.some((t) => t.kind === "century" && t.century > 0) ? 1 : 0) + (d.tasks.some((t) => t.kind === "century" && t.century < 0) ? 1 : 0) + (d.tasks.some((t) => t.kind === "place") ? 1 : 0),
    };
  }, step.defId);
  const axis = await page.evaluate(() => ({
    bc: !!document.querySelector(".screen.active .htl-eras .bc"),
    origin: !!document.querySelector(".screen.active .htl-origin"),
    firstTick: document.querySelector(".screen.active .htl-tick.first")?.textContent ?? "",
  }));
  check(!axis.bc && !axis.origin, "전부 기원후 연표 — 기원전 띠·원년 마커 생략(Ⅳ)");
  check(axis.firstTick === "900", `축 왼쪽 끝 눈금 900 (실제 ${axis.firstTick})`);
  // 일부러 오답 칸 먼저 — 교정 helper가 뜨고 목표는 안 켜져야 한다
  const wrongCell = info.cells.find((c) => c !== info.targets[0]);
  await page.evaluate((c) => document.querySelector(`.screen.active .htl-cell[data-c="${c}"]`).click(), wrongCell);
  await W(450);
  const afterWrong = await page.evaluate(() => ({
    on: document.querySelectorAll(".screen.active .pn-badge.his.on").length,
    helper: document.querySelector(".screen.active .helper")?.textContent ?? "",
  }));
  check(afterWrong.on === 0 && /세기/.test(afterWrong.helper), "연표 오답 탭 → 교정 안내 + 목표 유지");
  for (const c of info.targets) {
    await page.evaluate((cc) => document.querySelector(`.screen.active .htl-cell[data-c="${cc}"]`).click(), c);
    await W(1150); // 성공 연출 + 다음 임무 카드
  }
  const done = await page.evaluate(() => ({
    on: document.querySelectorAll(".screen.active .pn-badge.his.on").length,
    events: document.querySelectorAll(".screen.active .htl-event").length,
    solved: document.querySelectorAll(".screen.active .htl-cell.solved").length,
  }));
  check(done.on === info.chips, `연표 목표 칩 ${info.chips}개 점등 — 기원전 없음이라 2종 (실제 ${done.on})`);
  check(done.events === 3, `사건 도장 3개 배치 — 몽골 통일·콜럼버스·에도 막부 (실제 ${done.events})`);
  check(done.solved >= 5, `세기 칸 해금 ${done.solved}개(이름 공개)`);
  await clickCTA();
};

// ── 세기 드릴(mathDrill) — 넘패드 실입력 ────────────────────
const npKey = async (label) => {
  await page.evaluate((l) => {
    const k = [...document.querySelectorAll(".screen.active .mnp-k")].find((x) => x.textContent.trim() === l && !x.disabled);
    if (!k) throw new Error(`no key ${l}`);
    k.click();
  }, label);
  await W(70);
};
const drillStep = async (step) => {
  await page.waitForSelector(`${active} .mdr-q`, { timeout: 9000 });
  for (const it of step.items) {
    for (const ch of String(it.a)) await npKey(ch);
    await clickCTA(); // 확인하기
    await W(1050); // 정답 플래시 + 자동 진행
  }
  const summary = await page.evaluate(() => document.querySelector(".screen.active .mdr-summary")?.textContent ?? "");
  check(/첫 시도에 해결/.test(summary), `세기 드릴 완주(${step.items.length}문 전답) 요약 표시`);
  await clickCTA();
};

// ── 레슨 주행 ────────────────────────────────────────────────
const LESSONS = ["h1u4l1", "h1u4l2", "h1u4l3", "h1u4l4", "h1u4l5", "h1u4l6", "h1u4l7", "h1u4l8", "h1u4l9", "h1u4l10"];
for (const id of LESSONS) {
  if (ONLY.length && !ONLY.includes(id)) continue;
  const n = await openLesson(id);
  for (let i = 0; i < n; i += 1) {
    const st = await stepData(i);
    if (!st) break;
    if (st.type === "hook") await hookStep(st.scene);
    else if (st.type === "comic") await comicStep(st, id);
    else if (st.type === "concept") await conceptStep(id);
    else if (st.type === "binSort") await binSortStep(st);
    else if (st.type === "order") await orderStep(st);
    else if (st.type === "recap") await recapStep(id);
    else if (st.type === "hotspot") await hotspotStep(st, id);
    else if (st.type === "timelineLab") await timelineStep(st);
    else if (st.type === "mathDrill") await drillStep(st);
    else if (st.type === "quiz") await quiz(st, id);
    else await clickCTA();
  }
  const done = await page.evaluate(() => window.__hisE2E?.done);
  check(!!done, `[${id}] 완주(onComplete 수신 — acc ${done ? Math.round(done.acc) : "?"}%)`);
}

check(pageErrors === 0, `콘솔 pageerror 0건 (실제 ${pageErrors})`);
console.log(`\n${fails === 0 ? "ALL PASS" : "FAILS: " + fails} (${checks} checks)`);
await browser.close();
process.exit(fails === 0 ? 0 : 1);
