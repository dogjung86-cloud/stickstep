// 사회 Ⅰ(세계화 시대, 지리의 힘) 6레슨 실플레이 E2E.
// DEV 서버 필요(data-oi 사용). PORT=<포트> node qa/e2e-soc1.mjs
// 훅 6장면 실조작 · latSunLab 원호 드래그 · worldPlaceLab 가로 배치(스냅 포함) ·
// connectLab 세 시대 전송 · tableLinkLab 접시 탭 · hotspot/figTabs/pairMatch/binSort/order/퀴즈 전 스텝.
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

// ── 홈 지도 검증 ─────────────────────────────────────────────
{
  const home = await page.evaluate(() => ({
    bands: document.querySelectorAll(".unit-band").length,
    worldBand: !!document.querySelector(".unit-band.world"),
    terrain: !!document.querySelector(".gm-terrain.world"),
    nodes: document.querySelectorAll(".gm-node").length,
  }));
  check(home.bands === 7, `홈 밴드 7개 (실제 ${home.bands})`);
  check(home.worldBand && home.terrain, "world 테마(밴드+지형) 적용");
  check(home.nodes === 6, `레슨 노드 6개 (실제 ${home.nodes})`);
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
  const tapFig = async (sel, times = 1) => {
    for (let i = 0; i < times; i += 1) {
      await page.evaluate((s) => document.querySelector(`.screen.active ${s}`).click(), sel);
      await W(420);
    }
  };
  if (scene === "threecities") await tapFig(".hs1-cities", 2);
  else if (scene === "stilthouse") await tapFig(".hs1-stilt");
  else if (scene === "skyroute") {
    for (let i = 0; i < 3; i += 1) {
      await page.evaluate((idx) => document.querySelectorAll(".screen.active .hs1-routebtn")[idx].click(), i);
      await W(380);
    }
  } else if (scene === "avocado") await tapFig(".hs1-avoc");
  else if (scene === "maasai") await tapFig(".hs1-maasai");
  else if (scene === "ilovenyc") await tapFig(".hs1-nyc");
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
  // .seg는 .figtabs 카드의 형제(figTabs.ts가 host.append(seg, card))
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .seg button").length);
  for (let i = 0; i < n; i += 1) {
    await page.evaluate((idx) => document.querySelectorAll(".screen.active .seg button")[idx].click(), i);
    await W(320);
  }
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
  // pairMatch는 CTA 없이 완주 시트(onContinue = api.next)로 진행한다
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

// ── 사회 전용 랩 ─────────────────────────────────────────────
const latSun = async () => {
  await page.waitForSelector(`${active} .spring-canvas`, { timeout: 9000 });
  const drag = async (fromDeg, toDeg) => {
    await page.evaluate(({ a, b }) => {
      const cv = document.querySelector(".screen.active .spring-canvas");
      const r = cv.getBoundingClientRect();
      const pt = (deg) => ({
        x: r.left + 24 + 195 * Math.cos((deg * Math.PI) / 180),
        y: r.top + 280 - 195 * Math.sin((deg * Math.PI) / 180),
      });
      const pe = (type, p) => cv.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 5, clientX: p.x, clientY: p.y, isPrimary: true, buttons: 1 }));
      pe("pointerdown", pt(a));
      pe("pointermove", pt(b));
    }, { a: fromDeg, b: toDeg });
    await W(650); // 대역 400ms 머무름 + 여유
    await page.evaluate(() => {
      const cv = document.querySelector(".screen.active .spring-canvas");
      cv.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 5, isPrimary: true }));
    });
    await W(220);
  };
  await drag(22, 5); // 적도
  await drag(5, 45); // 중위도
  await drag(45, 80); // 극지방
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `latSunLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

const worldPlace = async () => {
  await page.evaluate(() => document.querySelector(".screen.active .swapbtn").click());
  await page.waitForSelector(".rot-overlay .wpl-stage", { timeout : 9000 });
  await W(700);
  const native = await page.evaluate(() => document.querySelector(".rot-inner").classList.contains("native"));
  check(!native, "worldPlaceLab 세로 기기 = 회전 모드");
  const climOk = await page.evaluate(() => {
    const img = document.querySelector(".wpl-clim");
    return new Promise((res) => {
      const probe = new Image();
      probe.onload = () => res(true);
      probe.onerror = () => res(false);
      probe.src = img?.getAttribute("href") || "";
    });
  });
  check(climOk, "기후 오버레이(climate.webp) 로드");
  await page.evaluate(() => document.querySelector(".wpl-lens").click());
  await W(400);
  const lensOn = await page.evaluate(() => ({
    op: document.querySelector(".wpl-clim").getAttribute("opacity"),
    legend: document.querySelector(".wpl-legend").classList.contains("show"),
  }));
  check(lensOn.op === "0.9" && lensOn.legend, "기후 안경 켜짐 + 범례 표시");

  const place = async (tokenId, lon, lat) => {
    await page.evaluate(({ id, LON, LAT }) => {
      const stage = document.querySelector(".wpl-stage");
      const ov = document.querySelector(".rot-overlay").getBoundingClientRect();
      const mapBox = document.querySelector(".wpl-map");
      const native2 = document.querySelector(".rot-inner").classList.contains("native");
      const L = parseFloat(mapBox.style.left);
      const T = parseFloat(mapBox.style.top);
      const MW = parseFloat(mapBox.style.width);
      const MH = parseFloat(mapBox.style.height);
      const sx = ((LON + 180) / 360) * 1000;
      const sy = ((90 - LAT) / 180) * 500;
      const lx = L + (sx / 1000) * MW;
      const ly = T + ((sy - 14) / 400) * MH;
      // rotateStage.mapPoint의 역변환: native면 그대로, 세로 회전이면 clientX=right-y, clientY=top+x
      const p = native2 ? { x: ov.left + lx, y: ov.top + ly } : { x: ov.right - ly, y: ov.top + lx };
      const tok = document.querySelector(`.wpl-token[data-t="${id}"]`);
      const tr = tok.getBoundingClientRect();
      const pe = (type, x, y, target) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 7, clientX: x, clientY: y, isPrimary: true }));
      pe("pointerdown", tr.left + tr.width / 2, tr.top + tr.height / 2, tok);
      pe("pointermove", p.x, p.y, stage);
      pe("pointerup", p.x, p.y, stage);
    }, { id: tokenId, LON: lon, LAT: lat });
    await W(340);
  };
  // 오답 코미디 확인(순록→사하라)
  await place("reindeer", 10, 23);
  const wrongToast = await page.evaluate(() => document.querySelector(".wpl-toast")?.textContent ?? "");
  check(wrongToast.includes("이끼"), `오답 코미디 토스트 (${wrongToast.slice(0, 18)}…)`);
  // 정답 4연속(순록은 스냅 검증 — 냉대 한복판 71°에서 툰드라로 끌려간다)
  await place("reindeer", 100, 71);
  await place("oasis", 10, 23);
  await place("olive", 12.5, 42);
  await place("stilt", -62, -3);
  const marks = await page.evaluate(() => document.querySelectorAll(".wpl-mark").length);
  check(marks === 4, `정착 마커 4개 (실제 ${marks}) — 스냅 판정 포함`);
  await page.evaluate(() => document.querySelector(".rot-exit").click());
  await W(600);
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `worldPlaceLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

const connect = async () => {
  await page.waitForSelector(`${active} .cnl-era`, { timeout: 9000 });
  const send = async (eraIdx, waitMs) => {
    await page.evaluate((i) => document.querySelectorAll(".screen.active .cnl-era")[i].click(), eraIdx);
    await W(350);
    await page.evaluate(() => document.querySelector(".screen.active .cnl-send").click());
    await W(waitMs);
    await page.waitForFunction(() => !document.querySelector(".screen.active .cnl-send")?.disabled, undefined, { timeout: 9000 });
  };
  await send(0, 3300); // 돛단배 2.8s
  await send(1, 1700); // 전신 1.2s
  await send(2, 900); // 스마트폰 0.25s
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `connectLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

const tableLink = async () => {
  await page.waitForSelector(`${active} [class*="tll-"]`, { timeout: 9000 });
  const plateSel = await page.evaluate(() => {
    const cands = [".tll-plate", ".tll-dish", "[class*='tll'][role='button']"];
    for (const s of cands) if (document.querySelectorAll(`.screen.active ${s}`).length >= 3) return s;
    return null;
  });
  if (!plateSel) throw new Error("tableLinkLab 접시 요소를 찾지 못함");
  for (let i = 0; i < 3; i += 1) {
    // SVG <g>에는 HTMLElement.click()이 없다 — MouseEvent 디스패치로 위임 리스너를 태운다
    await page.evaluate(({ s, idx }) => {
      const g = document.querySelectorAll(`.screen.active ${s}`)[idx];
      g.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, { s: plateSel, idx: i });
    await W(1250);
  }
  const chips = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.on").length);
  check(chips === 3, `tableLinkLab 목표 3/3 (실제 ${chips})`);
  await clickCTA();
};

// ── concept — 스틱맨 컷 로드 검증(lazy 금지 규칙) 포함 ───────
let cutChecked = 0;
const conceptStep = async () => {
  await page.waitForSelector(`${active} .concept, ${active} .blocks, ${active} .term`, { timeout: 9000 }).catch(() => {});
  const cutInfo = await page.evaluate(() => {
    const img = document.querySelector('.screen.active img[src*="soc/cuts/"]');
    if (!img) return null;
    return { loaded: img.complete && img.naturalWidth > 0, src: img.getAttribute("src") };
  });
  if (cutInfo) {
    cutChecked += 1;
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
    else if (step.type === "latSunLab") await latSun();
    else if (step.type === "worldPlaceLab") await worldPlace();
    else if (step.type === "connectLab") await connect();
    else if (step.type === "tableLinkLab") await tableLink();
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
  // 완료 화면 → 홈 복귀
  const done = await page.evaluate(() => window.__socE2E?.done);
  check(!!done, `${id} 완주(onComplete 수신 acc=${done ? Math.round(done.acc ?? 0) : "?"}%)`);
  await W(700);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll(".screen.active button")].find((b) => /홈으로|계속/.test(b.textContent ?? ""));
    btn?.click();
  });
  await W(900);
};

try {
  await runLesson("s1u1l1");
  await runLesson("s1u1l2");
  await runLesson("s1u1l3");
  await runLesson("s1u1l4");
  await runLesson("s1u1l5");
  await runLesson("s1u1l6");
  check(pageErrors === 0, `페이지 오류 0건 (실제 ${pageErrors})`);
} catch (e) {
  console.log("E2E ABORT:", e.message);
  fails += 1;
}

console.log(`\n===== 사회 Ⅰ e2e: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
await browser.close();
process.exit(fails ? 1 : 0);
