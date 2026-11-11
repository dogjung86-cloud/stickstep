// 중1 Ⅶ v5 검사 공용 부품. 서버 없이 돈다: 개발 모드로 만든 번들(dist-dev)을 브라우저의 요청 가로채기로 내준다.
//   번들 만들기: NODE_ENV=development npx vite build --mode development --outDir dist-dev
//   (개발 모드라야 주소의 open=레슨, 판정 보기의 정답 표식, 3D 랩의 검사용 손잡이가 붙는다. 운영 번들에는 없다)
// PORT를 주면 가로채지 않고 그 포트의 개발 서버를 쓴다.
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
export { W, cta, ctaState, tap, waitFor, setRange, askText, waitAsk, pickWrong, tapNext, pickRight, concluded, waitDone, measure, goStep } from "./u2v5-lib.mjs";

export const BUDGET = 554;
export const BASE = process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://u7v5.test";
const DIST = process.env.DIST_DIR || "dist-dev";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".mp3": "audio/mpeg" };

export async function launch({ width = 390, height = 700 } = {}) {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/navigator\.vibrate|WebGL|GPU stall|Failed to load resource/.test(m.text())) errors.push("console: " + m.text());
    if (m.type() === "warning" && /\[v5\]|\[opener\]/.test(m.text())) errors.push("warn: " + m.text());
  });
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
  });
  if (!process.env.PORT) {
    if (!existsSync(join(DIST, "index.html"))) throw new Error(`${DIST}/index.html 이 없다. 먼저 개발 모드 번들을 만든다`);
    await page.route(BASE + "/**", (route) => {
      const u = new URL(route.request().url());
      const rel = u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname.slice(1));
      const f = join(DIST, rel);
      if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
      return route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
    });
  }
  return { browser, page, errors };
}

/** 레슨을 바로 연다(토글을 켠 채, 또는 끈 채). */
export async function openLesson(page, id, { on = true } = {}) {
  await page.goto(`${BASE}/?u7v5${on ? "" : "=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const s = document.querySelector(".screen.active .step");
    return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
  }, null, { timeout: 20000 });
  await page.waitForTimeout(500);
}

export const stepType = (page) => page.evaluate(() => {
  const s = document.querySelector(".screen.active .step");
  if (!s) return "";
  if (s.classList.contains("opn-step")) return "opener";
  if (s.classList.contains("u7x-step")) return "u7lab";
  return s.dataset.stepType || [...s.classList].filter((c) => c !== "step").join(".") || "step";
});
export const ds = (page, key) => page.evaluate((k) => document.querySelector(".screen.active .step")?.dataset[k] ?? null, key);
export const waitDs = async (page, key, val, tries = 100) => {
  for (let i = 0; i < tries; i++) {
    if ((await ds(page, key)) === val) return true;
    await page.waitForTimeout(150);
  }
  return false;
};
/** 3D 랩의 검사용 손잡이를 부른다(개발 모드 번들에만 있다). */
export const dev = (page, name, ...args) => page.evaluate(({ n, a }) => {
  const h = document.querySelector(".screen.active .step")?.__u7;
  if (!h || !h[n]) return false;
  h[n](...a);
  return true;
}, { n: name, a: args });
/** 무대 안의 한 점(346×230 설계 좌표)의 화면 좌표. */
export const stagePt = (page, x, y, sel = ".bv-stage") => page.evaluate(({ x, y, sel }) => {
  const r = document.querySelector(`.screen.active ${sel}`).getBoundingClientRect();
  return { x: r.left + (x / 346) * r.width, y: r.top + (y / 230) * r.height };
}, { x, y, sel });
/** 화면에 보이는 글(스텝 안)을 모은다. */
export const stepText = (page) => page.evaluate(() => (document.querySelector(".screen.active .step")?.innerText ?? "") + "\n" + (document.querySelector(".screen.active .btn.cta")?.innerText ?? "") + "\n" + [...document.querySelectorAll(".rot-overlay")].map((e) => e.innerText).join("\n"));
