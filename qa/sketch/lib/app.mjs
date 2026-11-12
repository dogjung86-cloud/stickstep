// 코드 그림 검사용 앱 열기: 개발 서버(PORT) 또는 서버 없이 개발 모드 번들(DIST)을 브라우저에 직접 물린다.
//   개발 모드 번들 만들기(레슨 바로 열기 ?open= 이 살아 있다):
//     NODE_ENV=development npx vite build --mode development --outDir <폴더> --emptyOutDir
//   DIST=<폴더> node qa/sketch/check-comics.mjs   또는   PORT=5173 node qa/sketch/check-comics.mjs
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

export const DIST = process.env.DIST || "";
export const BASE = DIST ? "http://sketch.test" : `http://localhost:${process.env.PORT || 5173}`;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".mp3": "audio/mpeg" };

export const launch = () => chromium.launch({ channel: "chrome", headless: true });

/** 폰 크기 탭 하나. 검토 모드(모든 레슨 자유 이동, 잠금 없음)와 프리미엄을 미리 심는다. */
export async function phone(browser, { width = 390, height = 700 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
  });
  if (DIST) {
    await ctx.route(BASE + "/**", (route) => {
      const u = new URL(route.request().url());
      const rel = u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname.slice(1));
      const f = join(DIST, rel);
      if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
      return route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
    });
  } else {
    // 개발 서버: 다른 세션이 파일을 저장해도 페이지가 다시 읽히지 않게 HMR만 끈다(CSS 주입 updateStyle 은 살린다)
    await ctx.route("**/@vite/client", (r) =>
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
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/navigator\.vibrate|favicon|net::ERR|status of 404/.test(m.text())) errors.push("console: " + m.text()); });
  page.on("response", (r) => { if (r.status() === 404 && !/favicon/.test(r.url())) errors.push("404: " + r.url()); });
  return { ctx, page, errors };
}

/** 레슨을 바로 연다(개발 모드 전용 ?open=). query 에 "g1v5" 를 주면 새 판(v5, Ⅱ는 v6)을 켠다. */
export async function openLesson(page, id, query = "") {
  await page.goto(`${BASE}/?${query ? query + "&" : ""}open=${id}`, { waitUntil: "load" });
  await page.waitForSelector(".screen.active .step", { timeout: 20000 });
  await page.waitForTimeout(500);
}

export const wait = (page, ms) => page.waitForTimeout(ms);
