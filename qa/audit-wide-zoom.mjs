// 넓은 화면(PC 1280×800)에서 과학 열다섯 단원의 랩과 도입을 차례로 열어 두 가지를 모은다(2026-11-15).
//  ① 확대된(CSS zoom) 무대 안의 요소에 getBoundingClientRect를 부르는 코드 위치. 넓은 화면은 무대를 zoom으로 키우는데,
//     Chrome의 BCR은 커진 크기(화면 px)를 돌려준다. 그 값을 무대 안의 길이(캔버스, 시뮬레이션 크기, 글자 자리)로 쓰면
//     그림만 배율만큼 작아지고 자리가 어긋난다(사용자 적발: Ⅳ 입자 모형 랩에서 입자가 아래 칩 밑으로 내려감).
//     누르기 없이 걷기만 하므로 여기 잡히는 것은 그리기 쪽 호출이다(누른 자리 계산은 따로 본다).
//  ② 무대만 폰 모양(스위치 끔)과 넓은 화면으로 같은 때에 찍은 그림(나란히 견주기용).
// 개발 서버 필요: PORT=<포트> node qa/audit-wide-zoom.mjs [출력 폴더] [단원 id들, 쉼표] [동시 작업 수]
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const PORT = process.env.PORT || 5681;
const OUT = process.argv[2] || "../output/wide-zoom-audit";
const ONLY = (process.argv[3] || "").split(",").filter(Boolean);
const WORKERS = Number(process.argv[4] || 4);
const BASE = `http://localhost:${PORT}`;
mkdirSync(`${OUT}/phone`, { recursive: true });
mkdirSync(`${OUT}/wide`, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: "chrome", headless: true });

// 단원과 레슨, 스텝 종류 목록(개발 서버의 모듈에서 읽는다)
const lessons = await (async () => {
  const p = await browser.newPage();
  await p.goto(BASE, { waitUntil: "domcontentloaded" });
  const list = await p.evaluate(async () => {
    const c = await import("/src/content/curriculum.ts");
    const out = [];
    for (const g of ["g1", "g2"]) for (const u of c.CURRICULA[g]) for (const l of u.lessons) out.push({ unit: u.id, id: l.id, types: (l.steps || []).map((s) => s.type) });
    return out;
  });
  await p.close();
  return list.filter((l) => !ONLY.length || ONLY.includes(l.unit));
})();

function hook(off) {
  const s = JSON.parse(localStorage.getItem("science-app.v1") || "{}");
  s.reviewMode = true;
  s.onboarded = true;
  s.wideOff = off;
  localStorage.setItem("science-app.v1", JSON.stringify(s));
  const orig = Element.prototype.getBoundingClientRect;
  window.__bcr = [];
  Element.prototype.getBoundingClientRect = function () {
    const r = orig.call(this);
    try {
      const z = this.currentCSSZoom;
      if (typeof z === "number" && Math.abs(z - 1) > 0.02) {
        const st = (new Error().stack || "")
          .split("\n")
          .slice(2, 6)
          .map((x) => x.trim().replace(/\?[tv]=[\w.]+/g, "").replace(/https?:\/\/localhost:\d+\//g, "").replace(/^at /, ""))
          .join(" < ");
        const tag = `${this.tagName.toLowerCase()}${this.classList.length ? "." + [...this.classList].slice(0, 2).join(".") : ""}`;
        window.__bcr.push(`${tag} | z=${z.toFixed(2)} | ${st}`);
      }
    } catch {
      /* 무시 */
    }
    return r;
  };
}

async function openPage(lesson, mode) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(hook, mode === "phone");
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${lesson.id} ${mode}: ${String(e).slice(0, 200)}`));
  await page.goto(`${BASE}/?open=${lesson.id}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".lesson-screen", { timeout: 20000 });
  await page.addStyleTag({ content: ".snack{display:none!important}" });
  return { ctx, page };
}

const kind = () => {
  const s = document.querySelector(".lesson-screen .step");
  if (!s) return "none";
  if (s.classList.contains("bv-step")) return "lab";
  if (s.querySelector(":scope > .opn-stage")) return "opener";
  return "other";
};

const errors = [];
const results = [];
async function runLesson(lesson) {
  const a = await openPage(lesson, "wide");
  const b = await openPage(lesson, "phone");
  const wideOn = await a.page.evaluate(() => document.documentElement.classList.contains("wide"));
  for (let i = 0; i < lesson.types.length; i++) {
    const [ka, kb] = await Promise.all([a.page.evaluate(kind), b.page.evaluate(kind)]);
    if (ka === "lab" || ka === "opener") {
      await sleep(1700);
      const sel = ka === "lab" ? ".lesson-screen .bv-stage" : ".lesson-screen .opn-stage";
      const name = `${lesson.id}-s${String(i + 1).padStart(2, "0")}`;
      const shoot = async (pg, dir) => {
        const loc = pg.locator(sel).first();
        if (await loc.count()) await loc.screenshot({ path: `${OUT}/${dir}/${name}.png` }).catch(() => {});
      };
      await Promise.all([shoot(a.page, "wide"), shoot(b.page, "phone")]);
      const bcr = await a.page.evaluate(() => window.__bcr.splice(0));
      const zoom = await a.page.evaluate((s) => document.querySelector(s)?.currentCSSZoom ?? null, sel);
      results.push({ lesson: lesson.id, unit: lesson.unit, step: i + 1, type: lesson.types[i], kind: ka, phoneKind: kb, name, wideOn, zoom, bcr });
    }
    if (i === lesson.types.length - 1) break;
    await a.page.evaluate(() => (window.__bcr.length = 0)); // 다음 스텝이 처음 그려질 때의 측정부터 모은다
    const next = async (pg) => {
      const f = pg.locator(".xbtn.fwd");
      if (await f.isVisible().catch(() => false)) await f.click().catch(() => {});
    };
    await Promise.all([next(a.page), next(b.page)]);
    await sleep(380);
  }
  await a.ctx.close();
  await b.ctx.close();
  console.log("done", lesson.id);
}

const queue = [...lessons];
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    while (queue.length) {
      const l = queue.shift();
      try {
        await runLesson(l);
      } catch (e) {
        errors.push(`${l.id}: ${String(e).slice(0, 300)}`);
      }
    }
  }),
);
await browser.close();

// 호출 위치별로 묶는다
const sites = new Map();
for (const r of results)
  for (const b of new Set(r.bcr)) {
    const k = b.split(" | ").slice(2).join(" | ");
    const e = sites.get(k) || { site: k, el: new Set(), steps: [] };
    e.el.add(b.split(" | ")[0]);
    e.steps.push(`${r.name}(${r.type})`);
    sites.set(k, e);
  }
const summary = [...sites.values()].map((e) => ({ site: e.site, el: [...e.el], n: e.steps.length, steps: e.steps }));
summary.sort((x, y) => y.n - x.n);
writeFileSync(`${OUT}/results.json`, JSON.stringify({ results, summary, errors }, null, 1));
console.log(`\n스텝 ${results.length}개, 호출 위치 ${summary.length}곳, 오류 ${errors.length}건`);
for (const s of summary) console.log(`${String(s.n).padStart(3)}  ${s.site}\n      요소: ${s.el.join(", ")}\n      스텝: ${s.steps.slice(0, 6).join(" ")}${s.steps.length > 6 ? " …" : ""}`);
for (const e of errors) console.log("오류", e);
