// 중1 Ⅳ v5(랩과 도입) 검사 공용 부품: 서버 없이 번들을 내주기, 레슨 열기, 재기, 조작.
// 미리보기 서버 자리가 없을 때를 위해 번들을 브라우저의 요청 가로채기로 직접 내준다(서버를 띄우지 않는다).
//   개발 모드 번들(레슨 바로 열기 ?open= 과 정답 표식 data-ok 가 살아 있다)을 임시 폴더에 만든다:
//     NODE_ENV=development npx vite build --mode development --outDir <폴더> --emptyOutDir
//   그 폴더를 DIST 로 넘긴다:  DIST=<폴더> node qa/check-u4v5.mjs
//   개발 서버가 떠 있으면:      PORT=5574 node qa/check-u4v5.mjs
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

export const DIST = process.env.DIST || "";
export const BASE = DIST ? "http://u4v5.test" : `http://localhost:${process.env.PORT || "5574"}`;
export const BUDGET = 554;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".mp3": "audio/mpeg" };

export async function launch({ width = 390, height = 700 } = {}) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/navigator\.vibrate|favicon|net::ERR/.test(m.text())) errors.push("console: " + m.text()); });
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
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
    // 개발 서버: 다른 세션이 파일을 저장해도 페이지가 다시 읽히지 않게 HMR만 끈다(CSS 주입은 살린다)
    await page.route("**/@vite/client", (r) =>
      r.fulfill({
        contentType: "application/javascript",
        body: `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};`,
      }),
    );
  }
  return { browser, page, errors };
}

export const W = (page, ms) => page.waitForTimeout(ms);

/** 레슨을 바로 연다. v5=false면 토글을 끈 채(지금 운영 화면) 연다. */
export async function openLesson(page, id, v5 = true) {
  await page.goto(`${BASE}/?u4v5${v5 ? "" : "=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const s = document.querySelector(".screen.active .step");
    return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
  }, null, { timeout: 20000 });
  await W(page, 600);
}

export const stepKind = (page) =>
  page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    if (!s) return "";
    if (s.classList.contains("opn-step")) return "opener:" + (s.dataset.opnScene ?? "");
    if (s.classList.contains("u4x-step")) return "u4lab:" + (s.querySelector(".bv-stage")?.className.match(/u4x-(?!stage)[a-z]+/)?.[0] ?? "");
    if (s.classList.contains("bv-step")) return "bvlab";
    if (s.querySelector(".hook-scene")) return "hook";
    if (s.querySelector(".comic-art, .comic-narrator")) return "comic";
    return "other";
  });

export const ds = (page, key) => page.evaluate((k) => document.querySelector(".screen.active .step")?.dataset[k] ?? null, key);
export const waitFor = async (page, fn, arg, tries = 100, gap = 100) => {
  for (let i = 0; i < tries; i++) {
    if (await page.evaluate(fn, arg)) return true;
    await page.waitForTimeout(gap);
  }
  return false;
};
export const ctaState = (page) =>
  page.evaluate(() => {
    const b = document.querySelector(".screen.active .btn.cta");
    return { text: b?.textContent?.trim() ?? "", enabled: !!b && !b.disabled };
  });
export const cta = async (page) => {
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
  await W(page, 650);
};
export const click = (page, sel) =>
  page.evaluate((s) => {
    const e = document.querySelector(".screen.active " + s);
    if (!e || e.disabled) return false;
    e.click();
    return true;
  }, sel);
export const visible = (page, sel) =>
  page.evaluate((s) => {
    const e = document.querySelector(".screen.active " + s);
    return !!e && e.offsetParent !== null && !e.disabled && !e.hidden;
  }, sel);
export const waitVisible = (page, sel, tries = 100) => waitFor(page, (s) => {
  const e = document.querySelector(".screen.active " + s);
  return !!e && e.offsetParent !== null && !e.disabled && !e.hidden;
}, sel, tries);

/** 요소를 ms 동안 꾹 누른다(가운데를 누른다). */
export async function hold(page, sel, ms) {
  const box = await page.evaluate((s) => {
    const e = document.querySelector(".screen.active " + s);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, sel);
  if (!box) return false;
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await W(page, ms);
  await page.mouse.up();
  return true;
}

/** 막대의 값을 바꾼다(input 사건을 낸다). */
export const setRange = (page, sel, v) =>
  page.evaluate(({ s, v }) => {
    const e = document.querySelector(".screen.active " + s);
    if (!e || e.disabled) return false;
    e.value = String(v);
    e.dispatchEvent(new Event("input", { bubbles: true }));
    e.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }, { s: sel, v });
/** 막대를 from에서 to까지 여러 걸음으로 민다. */
export async function sweep(page, sel, from, to, steps = 10, gap = 60) {
  for (let i = 1; i <= steps; i++) {
    await setRange(page, sel, Math.round(from + ((to - from) * i) / steps));
    await W(page, gap);
  }
}

// ── 도입 ──
export const waitPhase = (page, v, tries = 100) => waitFor(page, (x) => document.querySelector(".screen.active .step")?.dataset.opnPhase === x, v, tries);
export const choose = (page, word) =>
  page.evaluate((p) => {
    const bs = [...document.querySelectorAll(".screen.active .hook-choice")].filter((b) => !b.disabled && b.offsetParent !== null);
    const b = bs.find((x) => x.textContent.includes(p)) ?? bs[0];
    if (!b) return null;
    b.click();
    return b.textContent.trim();
  }, word);

// ── 랩의 판정 ──
const pickFn = ({ word, ok }) => {
  const bs = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].filter((x) => !x.disabled && x.offsetParent !== null);
  const b = word != null ? bs.find((x) => x.textContent.includes(word)) : bs.find((x) => x.dataset.ok === ok);
  if (!b) return "";
  const t = b.textContent.trim();
  b.click();
  return t;
};
export const waitAsk = (page, tries = 120) => waitFor(page, () => [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].some((x) => !x.disabled && x.offsetParent !== null), null, tries);
export const askText = (page) => page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-qt")?.textContent.trim() ?? "");
/** 예측 보기(정오가 없다): 글에 word가 든 보기를 누른다. */
export const pickText = (page, word) => page.evaluate(pickFn, { word });
const pickBy = (page, okVal) => page.evaluate(pickFn, { ok: okVal });
export const pickWrong = (page) => pickBy(page, "0");
export const pickRightOnly = (page) => pickBy(page, "1");
export const tapNext = async (page) => {
  await waitFor(page, () => {
    const b = document.querySelector(".screen.active .bv-q.show .bv-next");
    return !!b && !b.disabled && b.offsetParent !== null;
  });
  return click(page, ".bv-q.show .bv-next");
};
export const verdict = (page) =>
  page.evaluate(() => {
    const q = document.querySelector(".screen.active .bv-q.show");
    if (!q) return null;
    const b = q.querySelector(".bv-choice.ok, .bv-choice.miss");
    return { cls: b?.classList.contains("ok") ? "ok" : b ? "miss" : "", word: q.querySelector(".bv-vd")?.textContent ?? "", ans: q.querySelector(".bv-ans-t")?.textContent ?? "", why: q.querySelector(".bv-why")?.textContent ?? "", next: !!q.querySelector(".bv-next") };
  });
export const waitDone = (page, tries = 120) => waitFor(page, () => !!document.querySelector(".screen.active .bv-done.show"), null, tries);

// ── 재기 ──
export const measure = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    const step = document.querySelector(".screen.active .step");
    const vis = (e) => e.offsetParent !== null && getComputedStyle(e).visibility !== "hidden";
    const taps = [...step.querySelectorAll("button, input[type=range]")].filter((e) => vis(e) && !e.disabled && !e.hidden).map((e) => ({ h: Math.round(e.getBoundingClientRect().height), t: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 14) }));
    const cut = [...step.querySelectorAll(".bv-choice-t, .bv-ans-t, .bv-card b, .bv-card i, .bv-title, .bv-btn, .opn-title")].filter(vis).filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent.trim());
    const helper = step.querySelector(".bv-helper");
    const small = [...step.querySelectorAll(".bv-stage text, .bv-stage div, .bv-stage span")].filter((e) => e.children.length === 0 && e.textContent.trim() && (e instanceof SVGElement || vis(e))).map((e) => {
      const r = e.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(e).fontSize);
      const k = e instanceof SVGElement ? (e.ownerSVGElement.getBoundingClientRect().width / e.ownerSVGElement.viewBox.baseVal.width) : 1;
      return { t: e.textContent.trim().slice(0, 10), px: Math.round(fs * k * 10) / 10, on: r.width > 0 };
    }).filter((x) => x.on && x.px < 11.9);
    return {
      content: sc.scrollHeight, view: sc.clientHeight, scrollTop: Math.round(sc.scrollTop),
      taps, cut, small,
      helperOver: helper ? helper.scrollHeight > helper.clientHeight + 1 : false,
      text: step.innerText + " " + (document.querySelector(".screen.active .btn.cta")?.textContent ?? ""),
    };
  });
