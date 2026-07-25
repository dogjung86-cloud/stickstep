// 중2 Ⅴ 식물과 에너지(v2) 7레슨 전용 실플레이 E2E.
// DEV 서버가 필요하다(data-oi 사용). PORT=5199 node qa/e2e-g2u5v2.mjs
// 캔버스 랩은 논리좌표(360폭)를 rect.width/360으로 변환해 canvas에 PointerEvent를 직접 dispatch한다.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors += 1; console.log("PAGEERROR:", e.message); });

// 동시 세션 HMR 리로드 면역(사고 #12) — @vite/client를 스텁으로 채운다.
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    status: 200, contentType: "application/javascript",
    // updateStyle은 반드시 살려 둔다 — no-op으로 두면 dev CSS가 통째로 안 붙는다(실사고).
    body: `const sheets=new Map();
export function createHotContext(){return {on(){},send(){},accept(){},dispose(){},prune(){},invalidate(){},decline(){}}}
export function updateStyle(id,content){let el=sheets.get(id);if(!el){el=document.createElement("style");el.setAttribute("data-vite-dev-id",id);document.head.appendChild(el);sheets.set(id,el);}el.textContent=content;}
export function removeStyle(id){const el=sheets.get(id);if(el)el.remove();sheets.delete(id);}
export const injectQuery=(u)=>u;
export default {};
`,
  }));

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 2, lastStudyDay: null,
    totalXp: 1200, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const W = (ms) => page.waitForTimeout(ms);
const active = ".screen.active";
const heading = () => page.evaluate(() => document.querySelector(".screen.active .h1")?.textContent?.trim() ?? "");

const openLesson = async (id) => {
  const count = await page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(lessonId);
    if (!found) throw new Error(`레슨을 찾지 못했어요: ${lessonId}`);
    window.__g2u5E2E = { steps: found.lesson.steps, done: null };
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: (r) => { window.__g2u5E2E.done = r; } }));
    return found.lesson.steps.length;
  }, id);
  await W(700);
  console.log(`\n[${id}] ${await heading()} (${count} steps)`);
  return count;
};

const stepData = (i) => page.evaluate((idx) => {
  const st = window.__g2u5E2E?.steps?.[idx];
  if (!st) throw new Error(`스텝 ${idx} 없음`);
  return { type: st.type, mode: st.mode, answer: st.answer, items: st.items, panels: st.panels?.length ?? 0 };
}, i);

const clickCTA = async (timeout = 20000) => {
  await page.waitForFunction(() => {
    const b = document.querySelector(".screen.active button.cta");
    return b && !b.disabled;
  }, undefined, { timeout });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(460);
};
const sheetContinue = async (timeout = 10000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(150);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(460);
};

// ── 캔버스 입력(논리 360 기준) ──────────────────────────────
const canvasDrag = async (pts, id = 7) => {
  await page.evaluate(({ pts, id }) => {
    const cv = document.querySelector(".screen.active .pgx-canvas");
    if (!cv) throw new Error("캔버스를 찾지 못했어요");
    cv.scrollIntoView({ block: "center" });
    const r = cv.getBoundingClientRect();
    const sc = r.width / 360;
    const P = ([lx, ly]) => ({ x: r.left + lx * sc, y: r.top + ly * sc });
    const ev = (type, p, buttons) => cv.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: id, isPrimary: true, pointerType: "touch",
      clientX: p.x, clientY: p.y, buttons,
    }));
    ev("pointerdown", P(pts[0]), 1);
    for (let i = 1; i < pts.length; i++) ev("pointermove", P(pts[i]), 1);
    ev("pointerup", P(pts[pts.length - 1]), 0);
  }, { pts, id });
  await W(160);
};
const canvasTap = async (lx, ly, id = 7) => {
  await page.evaluate(({ lx, ly, id }) => {
    const cv = document.querySelector(".screen.active .pgx-canvas");
    if (!cv) throw new Error("캔버스를 찾지 못했어요");
    cv.scrollIntoView({ block: "center" });
    const r = cv.getBoundingClientRect();
    const sc = r.width / 360;
    const p = { x: r.left + lx * sc, y: r.top + ly * sc };
    const ev = (type, buttons) => cv.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: id, isPrimary: true, pointerType: "touch",
      clientX: p.x, clientY: p.y, buttons,
    }));
    ev("pointerdown", 1);
    ev("pointerup", 0);
  }, { lx, ly, id });
  await W(150);
};
const act = async (name) => {
  const sel = `${active} [data-act="${name}"]`;
  await page.waitForSelector(sel, { timeout: 8000 });
  await page.evaluate((s) => document.querySelector(s).click(), sel);
  await W(320);
};
// 구판 이식 랩(photoFactorLab·plantRespireLab·dayNightLab)은 data-act가 없어 버튼 텍스트로 집는다.
const clickBtn = async (pattern, wait = 420, timeout = 12000) => {
  await page.waitForFunction((src) => [...document.querySelectorAll(".screen.active button")]
    .some((b) => b.offsetParent && !b.disabled && new RegExp(src).test(b.textContent ?? "")), pattern, { timeout });
  const hit = await page.evaluate((src) => {
    const b = [...document.querySelectorAll(".screen.active button")]
      .find((c) => c.offsetParent && !c.disabled && new RegExp(src).test(c.textContent ?? ""));
    b?.click();
    return b?.textContent?.trim() ?? null;
  }, pattern);
  if (!hit) throw new Error(`버튼을 찾지 못했어요: /${pattern}/`);
  await W(wait);
};
const goals = () => page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.plant.on").length);
const expectGoals = async (n, label) => {
  const got = await goals();
  if (got < n) throw new Error(`${label}: 목표 ${n}개 중 ${got}개만 켜졌어요`);
  console.log(`     · ${label} 목표 ${got}/${n}`);
};

// ── 랩 드라이버 ─────────────────────────────────────────────
const XYLEM = [[110, 320], [110, 288], [108, 256], [106, 224], [104, 194], [112, 170], [140, 143], [170, 120]];

const drive = {
  async leafZoomLab() {
    await act("zoomin"); await act("zoomin");
    await canvasTap(180, 160);
    await act("light");
    await expectGoals(3, "leafZoomLab");
  },
  async leafFactoryLab() {
    // 목표 3개의 실제 조건(plantFactoryLab 상태기계):
    //  products  = 물관·기공·빛 셋 다 열고 반응 진행률 0.62까지
    //  lightOnly = products 달성 뒤 물관·기공을 닫고 빛만 남긴 채 420ms 유지
    //  storage   = "포도당을 녹말로 저장" 누른 뒤 저장 진행률 1까지
    const setValve = async (name, open) => {
      await page.evaluate(({ name, open }) => {
        const b = [...document.querySelectorAll(".screen.active button")]
          .find((x) => x.textContent.trim().startsWith(name));
        if (!b) throw new Error(`${name} 밸브 버튼을 찾지 못했어요`);
        const closed = /닫힘/.test(b.textContent ?? "");
        if (open === closed) b.click(); // 닫힌 걸 열거나, 열린 걸 닫을 때만 누른다
      }, { name, open });
      await W(300);
    };
    await setValve("물관", true);
    await setValve("기공", true);
    await setValve("빛", true);
    await W(1500);
    await setValve("물관", false);
    await setValve("기공", false);
    await W(1300);
    await clickBtn("포도당을 녹말로 저장", 1500);
    await expectGoals(3, "leafFactoryLab");
  },
  async gasSensorLab() {
    await act("light");
    await act("fast");
    await W(900);
    await canvasTap(289, 239);
    await expectGoals(3, "gasSensorLab");
  },
  async iodineTestLab() {
    await canvasDrag([[180, 56], [220, 110], [260, 150], [272, 166]]);
    await W(1500);
    await canvasTap(88, 134);
    await canvasTap(272, 134);
    await W(1000);
    await canvasDrag([[48, 172], [110, 186], [160, 194], [180, 196]]);
    await W(1700);
    await canvasDrag([[312, 172], [250, 186], [200, 194], [180, 196]]);
    await W(2500);
    await act("rinse");
    await W(1500);
    await canvasDrag([[180, 120], [150, 190], [110, 240], [100, 264]]);
    await W(1200);
    await canvasDrag([[180, 120], [210, 190], [250, 240], [260, 264]]);
    await W(1400);
    await expectGoals(3, "iodineTestLab");
  },
  async photoDesignLab() {
    const chip = async (card, id) => {
      const sel = `${active} .pgx-chip[data-card="${card}"][data-chip="${id}"]`;
      await page.waitForSelector(sel, { timeout: 6000 });
      await page.evaluate((s) => document.querySelector(s).click(), sel);
      await W(140);
    };
    await chip("vary", "dist");
    for (const id of ["size", "jar", "water", "temp", "time"]) await chip("same", id);
    await chip("meas", "o2");
    await act("run");
    await W(900);
    await expectGoals(3, "photoDesignLab");
  },
  async photoFactorLab() {
    const slide = async (fraction) => {
      await page.evaluate((value) => {
        const slider = document.querySelector(".screen.active .plant-factor-slider");
        const track = slider?.querySelector(".sl-track");
        if (!(slider instanceof HTMLElement) || !(track instanceof HTMLElement)) throw new Error("환경요인 슬라이더 없음");
        const rect = track.getBoundingClientRect();
        const clientX = rect.left + rect.width * value;
        const init = { bubbles: true, pointerId: 41, isPrimary: true, clientX, clientY: rect.top + rect.height / 2 };
        slider.dispatchEvent(new PointerEvent("pointerdown", { ...init, buttons: 1 }));
        slider.dispatchEvent(new PointerEvent("pointermove", { ...init, buttons: 1 }));
        slider.dispatchEvent(new PointerEvent("pointerup", { ...init, buttons: 0 }));
      }, fraction);
      await W(220);
    };
    await slide(0.1); await slide(0.96);
    await clickBtn("이산화 탄소 농도", 140);
    await slide(0.1); await slide(0.96);
    await clickBtn("^온도$", 140);
    await slide(0.5); await slide(0.9);
    await W(600);
  },
  async plantRespireLab() {
    // 목표 3개 = ①에너지 꺼내기(재료+호흡 시작) ②꺼낸 에너지 쓰기 ③밤에도 호흡.
    // 구 e2e는 ①만 몰고 끝나 CTA가 안 열렸다(2026-07-26 확인) — 남은 목표는 버튼 훑기로 채운다.
    await clickBtn("포도당 넣기", 220);
    await clickBtn("산소 넣기", 220);
    await clickBtn("호흡 시작", 1800);
    for (let i = 0; i < 10 && (await goals()) < 3; i++) {
      const hit = await page.evaluate(() => {
        const b = [...document.querySelectorAll(".screen.active button")]
          .filter((x) => x.offsetParent && !x.disabled)
          .find((x) => /어린싹 키우기|물질 운반하기|꽃·열매 만들기|빛 끄기|호흡 시작|포도당 넣기|산소 넣기/.test(x.textContent ?? ""));
        if (!b) return null;
        b.click();
        return b.textContent.trim();
      });
      if (!hit) break;
      await W(900);
    }
    await expectGoals(3, "plantRespireLab");
  },
  async dayNightLab() {
    // 목표 3개 = 강한 낮 · 한밤 · 순이동 0.
    // 순이동 0은 |광합성량 − 호흡량| < 0.045를 320ms 유지해야 잡히므로, 포인터 훑기 대신
    // 캔버스의 키보드 슬라이더(role=slider, ArrowUp/Down = 0.025)를 한 칸씩 올리며 머문다.
    await clickBtn("강한 낮 보기", 340);
    await clickBtn("빛 없는 밤 보기", 440);
    await page.evaluate(() => document.querySelector(".screen.active .plant-canvas")?.focus());
    await page.keyboard.press("Home");
    await W(320);
    for (let i = 0; i < 42 && (await goals()) < 3; i++) {
      await page.keyboard.press("ArrowUp");
      await W(380);
    }
    await expectGoals(3, "dayNightLab");
  },
  async sugarFlowLab() {
    await act("starch");
    await W(800);
    await act("night");
    await W(500);
    await act("sugar");
    await W(900);
    const FLOWER = [[180, 120], [180, 104], [180, 86], [180, 70]];
    const FRUIT = [[180, 120], [186, 146], [208, 164], [234, 180], [254, 190], [268, 196]];
    const ROOT = [[180, 120], [186, 146], [186, 200], [186, 254], [183, 292], [180, 310]];
    await canvasDrag([[96, 99], [140, 110], ...FLOWER]);
    await canvasDrag([[120, 103], [150, 112], ...FRUIT]);
    await canvasDrag([[144, 107], [162, 114], ...ROOT]);
    await expectGoals(3, "sugarFlowLab");
  },
};

// ── 공통 스텝 드라이버 ──────────────────────────────────────
const playHook = async () => {
  // v2 훅은 .pgx-action, 구판 이식 훅(hookPlant)은 .plant-action — 둘 다 .swapbtn을 단다.
  await page.waitForSelector(`${active} .swapbtn`, { timeout: 8000 });
  await page.evaluate(() => document.querySelector(".screen.active .swapbtn").click());
  await W(1800);
  await page.waitForSelector(`${active} .hook-choices .hook-choice`, { timeout: 8000 });
  await page.evaluate(() => document.querySelector(".screen.active .hook-choices .hook-choice").click());
  await W(700);
  await capture("hook");
  await clickCTA();
};
const playComic = async (panels) => {
  for (let i = 0; i < panels; i++) await clickCTA();
};
const playQuiz = async (st) => {
  if (st.mode === "ox") {
    await page.evaluate((a) => document.querySelector(`.screen.active .ox-btn.${a ? "o" : "x"}`).click(), st.answer);
  } else if (st.mode === "multi") {
    for (const i of st.answer) {
      await page.evaluate((idx) => document.querySelector(`.screen.active .opts .opt[data-oi="${idx}"]`).click(), i);
      await W(130);
    }
  } else {
    await page.evaluate((idx) => document.querySelector(`.screen.active .opts .opt[data-oi="${idx}"]`).click(), st.answer);
  }
  await W(220);
  await clickCTA();
  await sheetContinue();
};
const playOrder = async (items) => {
  for (const label of items) {
    await page.evaluate((t) => {
      const chip = [...document.querySelectorAll(".screen.active .ord-pool .ord-chip")]
        .find((c) => c.textContent.replace(/\s+/g, " ").includes(t.replace(/\s+/g, " ").slice(0, 12)));
      if (!chip) throw new Error(`순서 칩을 찾지 못했어요: ${t}`);
      chip.click();
    }, label);
    await W(150);
  }
  await W(200);
  await clickCTA();
  await sheetContinue();
};
// binSort 칩에는 정답 통이 실려 있지 않다 — 스텝 데이터의 items(label→bin)로 짝을 찾는다.
const playBinSort = async (items) => {
  for (let i = 0; i < items.length; i++) {
    await page.evaluate((pairs) => {
      const chip = document.querySelector(".screen.active .bin-tray .bin-chip");
      if (!chip) return;
      const text = chip.textContent.replace(/\s+/g, " ").trim();
      // 정확 일치 우선 — "땅콩"이 "콩"에 걸려 엉뚱한 통으로 가던 실사고 방지.
      const hit = pairs.find((p) => text === p.label) ?? pairs.find((p) => text.includes(p.label));
      if (!hit) throw new Error(`칩의 정답 통을 찾지 못했어요: ${text}`);
      chip.click();
      const bin = document.querySelector(`.screen.active .bin[data-bin="${hit.bin}"]`);
      if (!bin) throw new Error(`통을 찾지 못했어요: ${hit.bin}`);
      bin.click();
    }, items);
    await W(200);
  }
  await W(250);
  await clickCTA();
  await sheetContinue();
};

// CAPTURE=1이면 랩·훅·정리 화면을 qa/shots/에 남긴다(시각 감사용).
const CAPTURE = process.env.CAPTURE === "1";
let shotLesson = "";
const capture = async (name) => {
  if (!CAPTURE) return;
  await page.screenshot({ path: `qa/shots/g2u5v2-${shotLesson}-${name}.png`, fullPage: true });
};

const playStep = async (st, i) => {
  console.log(`  ${String(i + 1).padStart(2, "0")} ${st.type}: ${await heading()}`);
  if (drive[st.type]) { await drive[st.type](); await capture(st.type); return clickCTA(); }
  if (st.type === "hook") { await playHook(); return; }
  if (st.type === "recap") { await capture("recap"); return clickCTA(); }
  switch (st.type) {
    case "hook": return playHook();
    case "comic": return playComic(st.panels);
    case "quiz": return playQuiz(st);
    case "order": return playOrder(st.items);
    case "binSort": return playBinSort(st.items);
    case "concept": case "recap": return clickCTA();
    default: throw new Error(`E2E 조작이 정의되지 않은 스텝이에요: ${st.type}`);
  }
};

try {
  for (let n = 1; n <= 8; n++) {
    const id = `g2u5l${n}`;
    shotLesson = `l${n}`;
    const count = await openLesson(id);
    for (let i = 0; i < count; i++) await playStep(await stepData(i), i);
    await page.waitForFunction(() => window.__g2u5E2E?.done !== null, undefined, { timeout: 15000 });
    const r = await page.evaluate(() => window.__g2u5E2E.done);
    console.log(`  완료: 정확도 ${r.acc}% · ${r.correct}/${r.total}`);
  }
  if (pageErrors > 0) throw new Error(`페이지 오류 ${pageErrors}건`);
  console.log("\n중2 Ⅴ 식물과 에너지(v2) 8레슨 E2E PASS");
} catch (error) {
  console.log("E2E FAIL:", error.message);
  console.log("현재 제목:", await heading());
  await page.screenshot({ path: "qa/e2e-g2u5v2-fail.png", fullPage: true });
  process.exitCode = 1;
} finally {
  await browser.close();
}
