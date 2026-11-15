// 앱에 실린 중1 도해를 폰(390×700)과 넓은 화면(1180×760)에서 열어 본다(가벼운 검사 하나).
//   개발 모드 번들(레슨 바로 열기 ?open= 이 살아 있다):
//     NODE_ENV=development npx vite build --mode development --outDir <폴더> --emptyOutDir
//   DIST=<폴더> node qa/scifig-g1/check-app.mjs [캡처 폴더] [키...]      (또는 PORT=<개발 서버 포트>)
// 보는 것: 그림이 실린 스텝까지 걸어가 그림이 뜨는가(naturalWidth > 0), 페이지 오류, 그림 높이가 스크롤 영역을 넘는가.
// 정리 카드의 그림은 카드를 펼쳐서 본다. 캡처: <폴더>/<키>-phone.png, <키>-wide.png
import { chromium } from "playwright-core";
import { build } from "esbuild";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";

const DIST = process.env.DIST || "";
const BASE = DIST ? "http://scifig.test" : `http://localhost:${process.env.PORT || 5173}`;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png",
  ".jpg": "image/jpeg", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".mp3": "audio/mpeg" };

const argv = process.argv.slice(2);
const out = argv[0] && !/^u\d+l\d+f\d+$/.test(argv[0]) ? argv[0] : "";
const only = new Set(argv.slice(out ? 1 : 0));
if (out) mkdirSync(out, { recursive: true });

// ── 대상: 단원 글을 묶어 읽고 scifig 그림이 든 스텝을 찾는다 ──
const targets = [];
for (let n = 1; n <= 7; n++) {
  const r = await build({ entryPoints: [`src/content/unit${n}.ts`], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent",
    loader: { ".css": "empty" }, define: { "import.meta.env": JSON.stringify({ BASE_URL: "/", DEV: false }) } });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  for (const L of mod[`UNIT${n}`].lessons) {
    L.steps.forEach((s, i) => {
      const scan = (html, where) => {
        for (const m of String(html ?? "").matchAll(/scifig\/g1\/u\d+\/(u\d+l\d+f\d+)\.webp/g)) targets.push({ key: m[1], lesson: L.id, step: i, type: s.type, where });
      };
      if (s.type === "concept") (s.blocks ?? []).forEach((b) => b.k === "figure" && scan(b.svg, "concept"));
      if (s.type === "recap") s.cards.forEach((c, j) => scan(c.more, j));
    });
  }
}
const list = targets.filter((t) => !only.size || only.has(t.key));
console.log(`그림 ${list.length}장: ${list.map((t) => t.key).join(" ")}`);

// ── 브라우저 ──
const browser = await chromium.launch({ channel: "chrome", headless: true });
async function open(width, height, mobile) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  await ctx.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
  });
  if (DIST) {
    await ctx.route(BASE + "/**", (route) => {
      const u = new URL(route.request().url());
      const rel = u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname.slice(1));
      const f = join(DIST, rel);
      if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
      return route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
    });
  }
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/navigator\.vibrate|favicon|net::ERR|status of 404/.test(m.text())) errors.push("console: " + m.text()); });
  page.on("response", (r) => { if (r.status() === 404 && !/favicon/.test(r.url())) errors.push("404: " + r.url()); });
  return { ctx, page, errors };
}

let checks = 0, fails = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.error("FAIL", msg); } };

for (const sz of [{ name: "phone", w: 390, h: 700, mobile: true }, { name: "wide", w: 1180, h: 760, mobile: false }]) {
  const { ctx, page, errors } = await open(sz.w, sz.h, sz.mobile);
  for (const t of list) {
    errors.length = 0;
    await page.goto(`${BASE}/?open=${t.lesson}`, { waitUntil: "load" });
    await page.waitForSelector(".screen.active .step", { timeout: 20000 });
    for (let i = 0; i < t.step; i++) {
      await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
      await page.waitForTimeout(140);
    }
    await page.waitForTimeout(400);
    const sel = `.screen.active .step img[src*="${t.key}.webp"]`;
    const found = await page.$(sel);
    ok(!!found, `${t.key} ${sz.name}: ${t.lesson} 스텝 ${t.step}에서 그림을 못 찾음`);
    if (!found) continue;
    if (t.type === "recap") {
      await page.evaluate((s) => { const card = document.querySelector(s)?.closest(".rc-card"); if (card && !card.classList.contains("open")) card.click(); }, sel);
      await page.waitForTimeout(450);
    }
    await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "center" }), sel);
    await page.waitForFunction((s) => { const im = document.querySelector(s); return im && im.complete; }, sel, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(250);
    const m = await page.evaluate((s) => {
      const im = document.querySelector(s);
      const sc = im.closest(".scroll");
      const r = im.getBoundingClientRect(), sr = sc ? sc.getBoundingClientRect() : { height: innerHeight };
      return { nw: im.naturalWidth, w: r.width, h: r.height, scrollH: sr.height, lazy: im.getAttribute("loading") };
    }, sel);
    ok(m.nw > 0, `${t.key} ${sz.name}: 그림이 뜨지 않음(naturalWidth 0)`);
    ok(m.lazy !== "lazy", `${t.key} ${sz.name}: loading="lazy"`);
    ok(m.h <= m.scrollH, `${t.key} ${sz.name}: 그림 높이 ${m.h.toFixed(0)}px 가 스크롤 영역 ${m.scrollH.toFixed(0)}px 보다 큼`);
    ok(!errors.length, `${t.key} ${sz.name}: 페이지 오류 ${errors.join(" | ")}`);
    console.log(`${t.key} ${sz.name}: ${t.lesson}[${t.step}] ${t.type} 표시 ${m.w.toFixed(0)}x${m.h.toFixed(0)} (원본 ${m.nw}px)`);
    if (out) await page.screenshot({ path: join(out, `${t.key}-${sz.name}.png`) });
  }
  await ctx.close();
}
await browser.close();
console.log(`검사 ${checks}, 실패 ${fails}`);
if (fails) process.exit(1);
