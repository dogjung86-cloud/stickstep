// 중2 Ⅲ v5 검사 공용 부품: 열기, 스텝 넘기기, 재기, 미는 막대와 버튼 조작, 판정 누르기, 문제 정답 누르기.
// 개발 서버(PORT, 기본 5583) 또는 서버 없이 개발 모드 번들(DIST=<폴더>)로 돈다.
//   NODE_ENV=development npx vite build --mode development --outDir <폴더> --emptyOutDir  뒤  DIST=<폴더> node qa/check-g2u3v5.mjs
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

export const PORT = process.env.PORT || "5583";
export let BASE = `http://localhost:${PORT}`;
const MIME = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".json": "application/json", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".ico": "image/x-icon" };

let server = null;
async function serveDist(dir) {
  server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = join(dir, path === "/" ? "index.html" : path);
    try {
      const buf = await readFile(file);
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
      res.end(buf);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, r));
  BASE = `http://localhost:${server.address().port}`;
}

export async function launch({ width = 390, height = 700 } = {}) {
  if (process.env.DIST && !server) await serveDist(process.env.DIST);
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/navigator\.vibrate|Failed to load resource/.test(m.text())) errors.push("console: " + m.text()); });
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
  });
  // 다른 세션이 파일을 저장해도 페이지가 다시 읽히지 않게 HMR만 끈다(CSS 주입은 살린다)
  if (!process.env.DIST)
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
  return { browser, page, errors };
}
export async function shutdown(browser) {
  await browser.close();
  server?.close();
}

export const W = (page, ms) => page.waitForTimeout(ms);
export const waitFor = async (page, fn, arg, tries = 80, gap = 100) => {
  for (let i = 0; i < tries; i++) {
    if (await page.evaluate(fn, arg)) return true;
    await page.waitForTimeout(gap);
  }
  return false;
};

/** 레슨을 바로 연다. on=false면 토글을 끈 채(지금 운영 판). */
export async function openLesson(page, id, on = true) {
  await page.goto(`${BASE}/?${on ? "g2u3v5" : "g2u3v5=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const s = document.querySelector(".screen.active .step");
    return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
  }, null, { timeout: 25000 });
  await page.waitForTimeout(700);
}

/** 검토 모드의 앞으로 가기 화살표로 다음 스텝으로. */
export async function fwd(page) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await page.waitForTimeout(650);
}
export const ctaState = (page) =>
  page.evaluate(() => {
    const b = document.querySelector(".screen.active .btn.cta");
    return { text: b?.textContent?.trim() ?? "", enabled: !!b && !b.disabled };
  });
export const cta = async (page) => {
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
  await page.waitForTimeout(650);
};
export const ds = (page, key) => page.evaluate((k) => document.querySelector(".screen.active .step")?.dataset[k] ?? null, key);
export const waitDs = (page, key, val, tries = 100) => waitFor(page, ({ k, v }) => document.querySelector(".screen.active .step")?.dataset[k] === v, { k: key, v: val }, tries);

/** 스크롤 영역의 내용 높이와 보이는 높이. */
export const fit = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    const step = document.querySelector(".screen.active .step");
    const vis = (e) => e.offsetParent !== null && getComputedStyle(e).visibility !== "hidden";
    const cut = [...step.querySelectorAll(".bv-choice-t, .bv-ans-t, .bv-title, .bv-btn, .opn-title, .g2u3x-seg b, .g2u3x-seg i, .g2u3x-log-n, .g2u3x-log-v")].filter(vis).filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent.trim());
    const helper = step.querySelector(".bv-helper");
    const taps = [...step.querySelectorAll("button")].filter((e) => vis(e) && !e.disabled && !e.hidden).map((e) => ({ h: Math.round(e.getBoundingClientRect().height), t: (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 14) })).filter((x) => x.h < 44);
    return { content: sc.scrollHeight, view: sc.clientHeight, cut, taps, helperOver: helper ? helper.scrollHeight > helper.clientHeight + 1 : false };
  });

/** 화면에 보이는 글(금지어 검사용). */
export const texts = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active");
    const step = sc.querySelector(".step");
    return (step?.innerText ?? "") + " " + (sc.querySelector(".btn.cta")?.textContent ?? "");
  });

/** 미는 막대(n번째)를 값 v로. input과 change를 함께 보낸다. */
export const setRange = (page, v, n = 0) =>
  page.evaluate(({ v, n }) => {
    const ins = [...document.querySelectorAll(".screen.active .step input[type=range]")].filter((e) => e.offsetParent !== null);
    const r = ins[n];
    if (!r) return false;
    r.value = String(v);
    r.dispatchEvent(new Event("input", { bubbles: true }));
    r.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }, { v, n });
/** data-k 로 버튼을 누른다. */
export const tapK = async (page, k, wait = 250) => {
  const ok = await page.evaluate((k) => {
    const b = [...document.querySelectorAll(`.screen.active .step [data-k="${k}"]`)].find((e) => e.offsetParent !== null);
    if (!b || b.disabled) return false;
    b.click();
    return true;
  }, k);
  await page.waitForTimeout(wait);
  return ok;
};
/** 버튼을 꾹 누른다(실제 포인터). sel은 스텝 안의 선택자. */
export async function hold(page, sel, ms) {
  const r = await page.evaluate((s) => {
    const b = document.querySelector(".screen.active .step " + s);
    if (!b) return null;
    const q = b.getBoundingClientRect();
    return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
  }, sel);
  if (!r) throw new Error("누를 곳 없음: " + sel);
  await page.mouse.move(r.x, r.y);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
  await page.waitForTimeout(200);
}

// ── 도입 ──
export const waitPhase = (page, v, tries = 100) => waitDs(page, "opnPhase", v, tries);
/** 예측 보기 가운데 n번째(보이는 차례)를 누른다. */
export const choose = (page, n = 0) =>
  page.evaluate((n) => {
    const bs = [...document.querySelectorAll(".screen.active .hook-choice")].filter((b) => !b.disabled && b.offsetParent !== null);
    const b = bs[n] ?? bs[0];
    if (!b) return null;
    b.click();
    return b.textContent.trim();
  }, n);

// ── 랩의 판정 ──
export const waitAsk = (page, tries = 150) => waitFor(page, () => [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].some((x) => !x.disabled && x.offsetParent !== null), null, tries);
export const answer = (page, ok) =>
  page.evaluate((ok) => {
    const bs = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].filter((b) => !b.disabled && b.offsetParent !== null);
    const b = bs.find((x) => x.dataset.ok === (ok ? "1" : "0")) ?? bs[0];
    b?.click();
    return b?.textContent ?? null;
  }, ok);
export const verdict = (page) =>
  page.evaluate(() => {
    const q = document.querySelector(".screen.active .bv-q.show");
    const b = q?.querySelector(".bv-choice.ok, .bv-choice.miss");
    return { cls: b?.classList.contains("ok") ? "ok" : b ? "miss" : "", word: q?.querySelector(".bv-vd")?.textContent ?? "", ans: q?.querySelector(".bv-ans-t")?.textContent ?? "" };
  });
export const tapNext = async (page) => {
  await waitFor(page, () => {
    const b = document.querySelector(".screen.active .bv-q.show .bv-next");
    return !!b && !b.disabled && b.offsetParent !== null;
  });
  await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-next")?.click());
  await page.waitForTimeout(400);
};
export const waitDone = (page, tries = 150) => waitFor(page, () => !!document.querySelector(".screen.active .bv-done.show"), null, tries);

// ── 스텝 읽기와 문제 ──
export const readStep = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active");
    if (!sc || sc.id === "sc-done" || sc.id === "sc-home") return { kind: "home", lab: "" };
    const s = sc.querySelector(".step");
    if (!s) return { kind: "", lab: "" };
    const kind = s.classList.contains("opn-step") ? "opener" : s.classList.contains("bv-step") ? "lab" : s.querySelector(".opts, .ox-grid") ? "quiz" : "read";
    return { kind, lab: s.dataset.lxLab ?? "", scene: s.dataset.opnScene ?? "", title: s.innerText.trim().split("\n")[0] };
  });
/** 문제의 정답을 누르고 채점 결과를 돌려준다("ok" 또는 까닭). 정답은 개발 모드에서 내놓는 단원 표(window.__g2u3v5)에서 문두로 찾는다. */
export async function answerQuiz(page) {
  const found = await page.evaluate(() => {
    const strip = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, ""); };
    const s = document.querySelector(".screen.active .step");
    const here = s.innerText.replace(/\s+/g, "");
    const unit = window.__g2u3v5;
    if (!unit) return { err: "단원 표(window.__g2u3v5)가 없음" };
    for (const l of unit.lessons) for (const st of l.steps) {
      if (st.type !== "quiz") continue;
      if (!here.includes(strip(st.prompt).slice(0, 40))) continue;
      const mode = st.mode ?? "mcq";
      if (mode === "ox") s.querySelector(st.answer ? ".ox-btn.o" : ".ox-btn.x")?.click();
      else for (const a of Array.isArray(st.answer) ? st.answer : [st.answer]) s.querySelector(`.opt[data-oi="${a}"]`)?.click();
      return { mode };
    }
    return { err: "단원 표에서 이 문항을 찾지 못함" };
  });
  if (found.err) return found.err;
  await page.waitForTimeout(250);
  const c = await ctaState(page);
  if (!c.enabled) return "확인하기가 열리지 않음";
  await cta(page);
  const okTitle = await waitFor(page, () => {
    const t = document.querySelector(".screen.active .sheet-title");
    return !!t && t.offsetParent !== null && t.textContent.trim().length > 0;
  }, null, 40);
  if (!okTitle) return "채점 시트가 뜨지 않음";
  const title = await page.evaluate(() => document.querySelector(".screen.active .sheet-title").textContent.trim());
  await page.waitForTimeout(300);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .sheet-card .btn")].find((b) => b.offsetParent !== null)?.click());
  await page.waitForTimeout(550);
  return title === "정답이에요" ? "ok" : `"${title}"로 채점됨`;
}
