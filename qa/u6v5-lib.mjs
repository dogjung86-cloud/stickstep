// 중1 Ⅵ v5 검사 공용 부품: 서버 없이 빌드한 번들을 요청 가로채기로 내주고, 레슨을 바로 열어 조작한다.
//   개발용 번들(정답 표식과 바로 열기가 살아 있다): bash qa/build-u6v5-dev.sh  →  .u6v5-dev/
//   dev 서버가 있으면: PORT=5576 node qa/check-u6v5.mjs
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

export const DIST = process.env.PORT ? null : process.env.DISTDIR || ".u6v5-dev";
export const BASE = process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://u6v5.test";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".mp3": "audio/mpeg" };
const HMR_STUB = `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};`;

export async function launch({ width = 390, height = 700 } = {}) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/navigator\.vibrate|Failed to load resource/.test(m.text())) errors.push("console: " + m.text());
  });
  await page.addInitScript(() => {
    localStorage.setItem(
      "science-app.v1",
      JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }),
    );
  });
  if (DIST) {
    await page.route(BASE + "/**", (route) => {
      const u = new URL(route.request().url());
      const rel = u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname.slice(1));
      const f = join(DIST, rel);
      if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
      return route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
    });
  } else {
    await page.route("**/@vite/client", (r) => r.fulfill({ contentType: "application/javascript", body: HMR_STUB }));
  }
  return { browser, page, errors };
}

export const W = (page, ms) => page.waitForTimeout(ms);

/** 레슨을 바로 연다. on=false면 토글을 끈 정본으로 연다. */
export async function open(page, id, { on = true } = {}) {
  await page.goto(`${BASE}/?u6v5${on ? "" : "=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => {
      const s = document.querySelector(".screen.active .step");
      return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
    },
    null,
    { timeout: 20000 },
  );
  await W(page, 500);
}

export const stepKind = (page) =>
  page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    if (!s) return "";
    if (s.classList.contains("opn-step")) return "opener";
    if (s.classList.contains("u6x-step")) return "lab";
    return s.className.replace(/\s*step\s*/, " ").trim() || "step";
  });
export const ds = (page, key) => page.evaluate((k) => document.querySelector(".screen.active .step")?.dataset[k] ?? null, key);
export const waitFor = async (page, fn, arg, tries = 100, gap = 100) => {
  for (let i = 0; i < tries; i++) {
    if (await page.evaluate(fn, arg)) return true;
    await page.waitForTimeout(gap);
  }
  return false;
};
export const waitDs = (page, key, val, tries = 100) => waitFor(page, ([k, v]) => document.querySelector(".screen.active .step")?.dataset[k] === v, [key, val], tries);
export const ctaState = (page) =>
  page.evaluate(() => {
    const b = document.querySelector(".screen.active .btn.cta");
    return { text: b?.textContent?.trim() ?? "", enabled: !!b && !b.disabled };
  });
export const cta = async (page) => {
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
  await W(page, 700);
};
export const click = (page, sel) =>
  page.evaluate((s) => {
    const e = document.querySelector(".screen.active " + s);
    if (e && !e.disabled) {
      e.click();
      return true;
    }
    return false;
  }, sel);
export const choose = (page, text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll(".screen.active .hook-choice")].find((x) => x.textContent.includes(t));
    b?.click();
    return !!b;
  }, text);
export const setRange = (page, v) =>
  page.evaluate((val) => {
    const i = document.querySelector(".screen.active .bv-slot input[type=range]");
    if (!i) return false;
    i.value = String(val);
    i.dispatchEvent(new Event("input", { bubbles: true }));
    i.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }, v);
export const waitAsk = (page, prev = "") =>
  waitFor(
    page,
    (p) => {
      const q = document.querySelector(".screen.active .bv-q.show .bv-qt");
      return !!q && q.textContent.trim() !== p && !document.querySelector(".screen.active .bv-q.show .bv-choice.ok, .screen.active .bv-q.show .bv-choice.miss, .screen.active .bv-q.show .bv-choice.sel");
    },
    prev,
    150,
  );
export const askText = (page) => page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-qt")?.textContent.trim() ?? "");
/** 판정 보기 누르기: right=true면 정답, false면 오답(개발용 번들의 data-ok). 예측 질문은 아무 보기나 누른다. */
export const pick = (page, right) =>
  page.evaluate((r) => {
    const b = document.querySelector(`.screen.active .bv-q.show .bv-choice[data-ok="${r ? 1 : 0}"]`) ?? document.querySelector(".screen.active .bv-q.show .bv-choice");
    b?.click();
    return !!b;
  }, right);
export const tapNext = async (page) => {
  await page.evaluate(() => document.querySelector(".screen.active .bv-next")?.click());
  await W(page, 400);
};
/** 무대 안의 비율 좌표(0~1)를 화면 좌표로 */
export const stagePt = (page, fx, fy) =>
  page.evaluate(
    ([x, y]) => {
      const r = (document.querySelector(".screen.active .bv-stage") ?? document.querySelector(".screen.active .opn-stage")).getBoundingClientRect();
      return { x: r.left + r.width * x, y: r.top + r.height * y };
    },
    [fx, fy],
  );
/** 요소를 꾹 누른다(ms 동안). */
export async function hold(page, sel, ms) {
  const p = await page.evaluate((s) => {
    const r = document.querySelector(".screen.active " + s).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, sel);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await W(page, ms);
  await page.mouse.up();
}

/** 지금 화면의 치수와 글. */
export const measure = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    const wrap = document.querySelector(".screen.active .stepWrap");
    const vis = (e) => e.offsetParent !== null && getComputedStyle(e).visibility !== "hidden";
    const taps = [...wrap.querySelectorAll("button, input[type=range]")]
      .filter((e) => vis(e) && !e.disabled)
      .map((e) => ({ h: Math.round(e.getBoundingClientRect().height), t: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 14) }));
    const cut = [...wrap.querySelectorAll(".bv-choice-t, .bv-ans-t, .bv-title, .bv-btn, .u6x-note, .u6x-chip")]
      .filter(vis)
      .filter((e) => e.scrollWidth > e.clientWidth + 1)
      .map((e) => e.textContent.trim());
    const helper = wrap.querySelector(".bv-helper");
    const slot = wrap.querySelector(".bv-slot");
    const title = wrap.querySelector(".opn-title");
    const bubble = wrap.querySelector(".opn-bubble");
    const text = [...wrap.querySelectorAll(".bv-title, .bv-helper, .bv-qt, .bv-choice, .bv-ans, .bv-done, .bv-btn, .u6x-note, .bv-range-cap, .bv-ticks, .u6x-chip, .opn-title, .hook-q, .hook-choice, .opn-bubble, .opn-controls button")]
      .filter(vis)
      .map((e) => e.textContent.trim())
      .filter(Boolean);
    return {
      view: sc.clientHeight,
      content: sc.scrollHeight,
      scrollTop: sc.scrollTop,
      helperOver: helper ? helper.scrollHeight > helper.clientHeight + 1 : false,
      slotOver: slot ? slot.scrollHeight > slot.clientHeight + 1 : false,
      titleLines: title ? Math.round(title.getBoundingClientRect().height / 30) : 1,
      bubbleLines: bubble && bubble.textContent.trim() ? Math.round((bubble.getBoundingClientRect().height - 18) / 20) : 0,
      taps,
      cut,
      text,
    };
  });
