// 중1 Ⅱ 도입 샘플 검증 공용 부품: 열기, 재기, 세 장면의 조작.
// 한 화면 검사(check-u2intro-fit), 실플레이(e2e-u2intro), 캡처(shot-u2intro)가 같은 조작을 쓴다.
import { chromium } from "playwright-core";

export const PORT = process.env.PORT || "5557";
export const BASE = process.env.BASE || `http://localhost:${PORT}`;
export const SAMPLES = [
  { id: "u2l2", scene: "factory", cta: "세포 속 구조 알아보기", next: "concept" },
  { id: "u2l4", scene: "longcell", cta: "세포에게 일 맡기기", next: "cellFitLab" },
  { id: "u2l9", scene: "baskets", cta: "검색표에 생물 보내기", next: "kingdomPathLab" },
];

export async function launch({ width = 390, height = 700, query = "" } = {}) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // 진동 호출을 막았다는 크롬의 안내(사용자 손길 전의 햅틱)는 오류가 아니다
  page.on("console", (m) => { if (m.type() === "error" && !/navigator\.vibrate/.test(m.text())) errors.push("console: " + m.text()); });
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
  });
  if (query !== null) {
    await page.goto(`${BASE}/${query}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1300);
  }
  return { browser, page, errors };
}

/** 샘플 도입으로 레슨을 바로 연다(?u2intro=<레슨>). now=true면 지금 판(토글 꺼짐)으로 연다. */
export async function openSample(page, id, { now = false } = {}) {
  await page.goto(`${BASE}/?u2intro=${now ? "now:" : ""}${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const s = document.querySelector(".screen.active .step");
    return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
  }, null, { timeout: 15000 });
  await page.waitForTimeout(500);
}

export const W = (page, ms) => page.waitForTimeout(ms);
export const ds = (page, key) => page.evaluate((k) => document.querySelector(".screen.active .step")?.dataset[k] ?? null, key);
export const waitFor = async (page, fn, arg, tries = 80, gap = 100) => {
  for (let i = 0; i < tries; i++) {
    if (await page.evaluate(fn, arg)) return true;
    await page.waitForTimeout(gap);
  }
  return false;
};
export const waitPhase = (page, v, tries = 80) => waitFor(page, (x) => document.querySelector(".screen.active .step")?.dataset.opnPhase === x, v, tries);
export const ctaState = (page) =>
  page.evaluate(() => {
    const b = document.querySelector(".screen.active .btn.cta");
    return { text: b?.textContent?.trim() ?? "", enabled: !!b && !b.disabled };
  });
export const cta = async (page) => {
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
  await page.waitForTimeout(600);
};
export const stepType = (page) =>
  page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    if (!s) return "";
    if (s.classList.contains("opn-step")) return "opener";
    if (s.classList.contains("bv-step")) return "lab";
    return s.querySelector(".comic-narrator") && s.querySelector(".hook-scene") ? "hook" : "other";
  });

/** 예측 보기 가운데 하나를 누른다. pick: 글에 들어 있는 낱말, 또는 차례(0부터). */
export const choose = (page, pick) =>
  page.evaluate((p) => {
    const bs = [...document.querySelectorAll(".screen.active .hook-choice")].filter((b) => !b.disabled && b.offsetParent !== null);
    const b = typeof p === "number" ? bs[p] : bs.find((x) => x.textContent.includes(p));
    if (!b) return null;
    b.click();
    return b.textContent.trim();
  }, pick);

/** 무대 위의 한 점(무대 좌표, 폭 960)을 화면 좌표로. 세로로 긴 무대도 가로 배율 하나로 셈한다. */
export const stagePt = (page, x, y) =>
  page.evaluate(({ x, y }) => {
    const r = document.querySelector(".screen.active .opn-stage").getBoundingClientRect();
    return { x: r.left + (x / 960) * r.width, y: r.top + (y / 960) * r.width };
  }, { x, y });

/** 마우스로 끌기(실제 포인터 이벤트). */
export async function drag(page, from, to, steps = 8) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
}

// ── 재기 ────────────────────────────────────────────────────────────
export const measure = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    const step = document.querySelector(".screen.active .step");
    const top0 = sc.getBoundingClientRect().top;
    const vis = (e) => {
      if (!e.getClientRects().length) return false;
      const cs = getComputedStyle(e);
      if (cs.visibility === "hidden" || cs.display === "none") return false;
      for (let p = e; p && p !== step.parentElement; p = p.parentElement) if (Number(getComputedStyle(p).opacity) < 0.05) return false;
      return true;
    };
    const box = (sel) => {
      const e = step.querySelector(sel);
      if (!e || !vis(e)) return null;
      const b = e.getBoundingClientRect();
      return { top: Math.round(b.top - top0 + sc.scrollTop), bottom: Math.round(b.bottom - top0 + sc.scrollTop), h: Math.round(b.height), w: Math.round(b.width) };
    };
    // 누르는 곳(살아 있는 버튼)
    const taps = [...step.querySelectorAll("button")]
      .filter((e) => vis(e) && !e.disabled)
      .map((e) => {
        const r = e.getBoundingClientRect();
        return { h: Math.round(r.height), w: Math.round(r.width), t: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 18) };
      });
    // 보이는 글자의 크기(무대 안의 HTML 글자와 SVG 글자)
    const fonts = [];
    const stage = step.querySelector(".opn-stage, .hook-scene");
    if (stage) {
      const walk = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const t = n.textContent.trim();
        const p = n.parentElement;
        if (!t || !p || !vis(p)) continue;
        let fs = parseFloat(getComputedStyle(p).fontSize);
        const svg = p.closest("svg");
        if (svg && p instanceof SVGElement) {
          // 글자 크기는 SVG 사용자 단위이므로 화면 배율을 곱한다
          const attr = parseFloat(p.getAttribute("font-size") || p.closest("[font-size]")?.getAttribute("font-size") || "0") || fs;
          const m = p.getScreenCTM();
          fs = attr * (m ? Math.hypot(m.a, m.b) : 1);
        }
        fonts.push({ px: Math.round(fs * 10) / 10, t: t.slice(0, 14) });
      }
    }
    // 잘리거나 넘친 글(한 줄 말줄임, 상자 밖으로 넘침)
    const clipped = [...step.querySelectorAll(".opn-title, .hook-choice, .hook-q, .opn-bubble, .opn-stage *")]
      .filter((e) => vis(e) && e.children.length === 0 && (e.textContent || "").trim() && !(e instanceof SVGElement))
      .filter((e) => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)
      .map((e) => (e.textContent || "").trim().slice(0, 20));
    // 무대 안에서 무대 밖으로 나간 글자
    const out = [];
    if (stage) {
      const sr = stage.getBoundingClientRect();
      for (const e of stage.querySelectorAll(".opn-tag, .opn-lc-read, .opn-lc-read *, .opn-cap, .opn-chip")) {
        if (!vis(e)) continue;
        const r = e.getBoundingClientRect();
        if (r.left < sr.left - 0.5 || r.right > sr.right + 0.5 || r.top < sr.top - 0.5 || r.bottom > sr.bottom + 0.5) out.push((e.textContent || "").trim().slice(0, 16));
      }
    }
    const text = (step.innerText || "").replace(/\s+/g, "");
    return {
      view: sc.clientHeight,
      content: sc.scrollHeight,
      stepH: Math.round(step.getBoundingClientRect().height),
      scrollTop: Math.round(sc.scrollTop),
      frameScroll: document.querySelector("#frame")?.scrollTop ?? 0,
      chars: text.length,
      title: box(".opn-title, .h1"),
      stage: box(".opn-stage, .hook-scene > :first-child"),
      choices: box(".hook-choices"),
      bubble: box(".opn-bubble, .helper"),
      titleLines: (() => {
        const e = step.querySelector(".opn-title");
        return e ? Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)) : null;
      })(),
      bubbleLines: (() => {
        const e = step.querySelector(".opn-bubble");
        return e && vis(e) && e.textContent.trim() ? Math.round((e.getBoundingClientRect().height - 18) / parseFloat(getComputedStyle(e).lineHeight)) : null;
      })(),
      taps,
      fonts,
      clipped,
      out,
    };
  });

// ── 장면별 조작 ─────────────────────────────────────────────────────
// on(mark)는 시점마다 불린다: "mount"(처음), "ask"(예측이 뜬 때), "picked"(답한 뒤), "mid"(조작 중), "done"(끝)
const noop = async () => {};

/** u2l4 유난히 긴 세포. pick: 예측 보기의 낱말. how: "drag"(실제 끌기) | "key"(방향 키) | "tap"(누르기) */
export async function playLongCell(page, { pick = "한 뼘", how = "drag", on = noop } = {}) {
  await waitPhase(page, "ask");
  await W(page, 300);
  await on("mount");
  await on("ask");
  await choose(page, pick);
  await waitPhase(page, "pull");
  await W(page, 350);
  await on("picked");
  let guard = 0;
  let mid = false;
  while ((await ds(page, "opnPhase")) === "pull" && guard++ < 60) {
    if (how === "drag") {
      const a = await stagePt(page, 860, 440), b = await stagePt(page, 400, 440);
      await drag(page, a, b, 6);
      await W(page, 120);
    } else if (how === "key") {
      await page.focus(".screen.active .opn-stage");
      await page.keyboard.press("ArrowRight");
      await W(page, 190);
    } else {
      const a = await stagePt(page, 700, 300);
      await page.mouse.click(a.x, a.y);
      await W(page, 200);
    }
    if (!mid && Number(await ds(page, "opnCm")) >= 40) {
      mid = true;
      await W(page, 500);
      await on("mid");
    }
  }
  await waitPhase(page, "done");
  await W(page, 700);
  await on("done");
}

/** u2l9 두 바구니. first: 먼저 넣을 쪽. how: "drag"(실제 끌기) | "tap"(바구니 누르기). again: 같은 바구니에 한 번 더 넣어 본다 */
export async function playBaskets(page, { first = "plant", how = "drag", again = false, on = noop } = {}) {
  await waitPhase(page, "play");
  await W(page, 300);
  await on("mount");
  const X = { plant: 236, animal: 724 };
  const put = async (side) => {
    if (how === "drag") {
      const a = await stagePt(page, 480, 700), b = await stagePt(page, X[side], 270);
      await drag(page, a, b, 8);
    } else {
      await page.evaluate((s) => document.querySelector(`.screen.active .opn-bk-hit[data-side=${s}]`)?.click(), side);
    }
    await waitFor(page, () => !document.querySelector(".screen.active .opn-stage").classList.contains("busy"), null, 60, 50);
    await W(page, 250);
  };
  const other = first === "plant" ? "animal" : "plant";
  await put(first);
  await on("mid");
  if (again) await put(first);
  await put(other);
  await waitPhase(page, "done");
  await W(page, 800);
  await on("done");
}

/** u2l2 빵 공장. pick: 예측 보기의 낱말. order: 멈추는 차례. how: "card"(아래 카드) | "stage"(그림 속 시설). swap: 되살리지 않고 바로 다른 시설을 멈춘다 */
export async function playFactory(page, { pick = "통제실", order = ["door", "ctrl", "gen"], how = "card", swap = false, on = noop } = {}) {
  await waitPhase(page, "ask");
  await W(page, 300);
  await on("mount");
  await on("ask");
  await choose(page, pick);
  await waitPhase(page, "play");
  await W(page, 400);
  await on("picked");
  const press = (key) =>
    page.evaluate(({ key, how }) => document.querySelector(`.screen.active ${how === "card" ? ".opn-fc-card" : ".opn-fc-hit"}[data-key=${key}]`)?.click(), { key, how });
  for (let i = 0; i < order.length; i++) {
    await press(order[i]);
    await W(page, 2700);
    await on(`off-${order[i]}`);
    if (i === 0) await on("mid");
    if (!(swap && i < order.length - 1)) {
      await press(order[i]);
      await W(page, 500);
    }
  }
  await waitPhase(page, "done");
  await W(page, 800);
  await on("done");
}
