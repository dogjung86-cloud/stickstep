// PC(넓은 화면)에서 과학 열다섯 단원의 스텝을 차례로 열어 '그리는 픽셀 ÷ 화면에 보이는 장치 픽셀'을 잰다(2026-11-15).
//  · 캔버스(2D, WebGL): canvas.width ÷ (화면에 보이는 폭 × devicePixelRatio). 화면에 보이는 폭은 getBoundingClientRect
//    (Chrome에서 CSS zoom을 친 크기)로 잰다. 1이면 모니터 픽셀 하나에 그린 픽셀 하나, 0.5면 그린 픽셀 하나를 두 배로 늘려 보여 흐리다.
//  · 그림(img, SVG image, CSS 배경 그림): 원래 픽셀 ÷ 보이는 장치 픽셀(object-fit, preserveAspectRatio, background-size를 친다).
//    SVG 파일과 data:image/svg는 벡터라 재지 않는다.
//  · 캔버스는 getContext를 처음 부른 코드 위치(파일:줄)를 함께 남긴다(어느 코드가 그 캔버스를 그리는지).
// 개발 서버 필요: PORT=<포트> node qa/audit-pc-quality.mjs [출력 폴더] [설정들(쉼표)] [단원 id들(쉼표)] [동시 작업 수]
//   설정 이름: fhd100 fhd125 wuxga150 qhd100 qhd125 qhd150 uhd150 mac (아래 CONFIGS)
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const PORT = process.env.PORT || 5731;
const OUT = process.argv[2] || "../output/pc-quality/audit";
const PICK = (process.argv[3] || "fhd100").split(",").filter(Boolean);
const ONLY = (process.argv[4] || "").split(",").filter(Boolean);
const WORKERS = Number(process.argv[5] || 4);
const SHOTS = process.env.SHOTS !== "0"; // 흐린 것이 있는 스텝은 무대를 찍는다
const BASE = `http://localhost:${PORT}`;

// 모니터 크기와 Windows 배율에서 브라우저 창(최대화, 작업 표시줄과 크롬 머리 줄을 뺀 안쪽)의 CSS 크기
const CONFIGS = {
  fhd100: { w: 1920, h: 940, dsf: 1, label: "1920×1080 모니터, 배율 100%" },
  fhd125: { w: 1536, h: 730, dsf: 1.25, label: "1920×1080 모니터, 배율 125%" },
  wuxga150: { w: 1280, h: 665, dsf: 1.5, label: "1920×1200 노트북, 배율 150%" },
  qhd100: { w: 2560, h: 1300, dsf: 1, label: "2560×1440 모니터, 배율 100%" },
  qhd125: { w: 2048, h: 1017, dsf: 1.25, label: "2560×1440 모니터, 배율 125%" },
  qhd150: { w: 1707, h: 825, dsf: 1.5, label: "2560×1440 모니터, 배율 150%" },
  uhd150: { w: 2560, h: 1300, dsf: 1.5, label: "3840×2160 모니터, 배율 150%" },
  mac: { w: 1470, h: 830, dsf: 2, label: "맥북 에어(레티나, 배율 2)" },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

const lessons = await (async () => {
  const p = await browser.newPage();
  await p.goto(BASE, { waitUntil: "domcontentloaded" });
  const list = await p.evaluate(async () => {
    const c = await import("/src/content/curriculum.ts");
    const out = [];
    for (const g of ["g1", "g2"])
      for (const u of c.CURRICULA[g])
        for (const l of u.lessons) out.push({ grade: g, unit: u.id, unitTitle: u.title, id: l.id, title: l.title, types: (l.steps || []).map((s) => s.type) });
    return out;
  });
  await p.close();
  return list.filter((l) => !ONLY.length || ONLY.includes(l.unit));
})();

function hook() {
  const s = JSON.parse(localStorage.getItem("science-app.v1") || "{}");
  s.reviewMode = true;
  s.onboarded = true;
  s.wideOff = false;
  localStorage.setItem("science-app.v1", JSON.stringify(s));
  const clean = (x) =>
    x
      .trim()
      .replace(/^at /, "")
      .replace(/\?[tv]=[\w.]+/g, "")
      .replace(/https?:\/\/localhost:\d+\//g, "")
      .replace(/^.*\((.*)\)$/, "$1");
  const og = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = og.call(this, type, ...rest);
    if (c && !this.__ctxType) {
      this.__ctxType = type;
      this.__src = (new Error().stack || "")
        .split("\n")
        .slice(2, 14)
        .map(clean)
        .filter((x) => x && !/node_modules|\/@vite|chunk-|three\.module|\.vite\/deps/.test(x))
        .slice(0, 3)
        .join(" < ");
    }
    return c;
  };
}

// 스텝 하나를 잰다(페이지 안에서 돈다)
async function measureStep() {
  const dpr = window.devicePixelRatio || 1;
  const root = document.querySelector(".lesson-screen");
  const out = { dpr, lk: getComputedStyle(document.documentElement).getPropertyValue("--lk").trim(), wide: document.documentElement.classList.contains("wide"), canvases: [], imgs: [] };
  if (!root) return out;
  const vis = (r) => r.width > 3 && r.height > 3 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  const hidden = (n) => {
    for (let e = n; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.05) return true;
    }
    return false;
  };
  const where = (n) => {
    if (n.closest(".bv-stage")) return "lab-stage";
    if (n.closest(".opn-stage")) return "opener";
    if (n.closest(".comic-art, .comic-panel")) return "comic";
    if (n.closest(".c-figure")) return "concept";
    if (n.closest(".q-figure")) return "quiz-fig";
    if (n.closest(".bv-slot")) return "lab-slot";
    return "other";
  };
  for (const cv of root.querySelectorAll("canvas")) {
    const r = cv.getBoundingClientRect();
    if (!vis(r) || hidden(cv)) continue;
    out.canvases.push({
      cls: String(cv.className || ""),
      ctx: cv.__ctxType || "none",
      src: cv.__src || "",
      w: cv.width,
      h: cv.height,
      cw: cv.clientWidth,
      ch: cv.clientHeight,
      bw: +r.width.toFixed(1),
      bh: +r.height.toFixed(1),
      z: +(cv.currentCSSZoom || 1).toFixed(3),
      rx: +(cv.width / (r.width * dpr)).toFixed(3),
      ry: +(cv.height / (r.height * dpr)).toFixed(3),
      where: where(cv),
    });
  }
  // 그림: 원래 크기를 알아야 한다(캐시)
  window.__nat = window.__nat || new Map();
  const nat = async (url) => {
    if (window.__nat.has(url)) return window.__nat.get(url);
    const p = new Promise((res) => {
      const im = new Image();
      im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight });
      im.onerror = () => res(null);
      im.src = url;
    });
    window.__nat.set(url, p);
    return p;
  };
  const isVec = (u) => /^data:image\/svg|\.svg(\?|#|$)/i.test(u);
  const push = (o) => out.imgs.push(o);
  for (const im of root.querySelectorAll("img")) {
    const r = im.getBoundingClientRect();
    if (!vis(r) || hidden(im)) continue;
    const u = im.currentSrc || im.src;
    if (!u || isVec(u) || !im.naturalWidth) continue;
    const fit = getComputedStyle(im).objectFit;
    let sx = r.width / im.naturalWidth;
    let sy = r.height / im.naturalHeight;
    if (fit === "contain" || fit === "scale-down") sx = sy = Math.min(sx, sy) * (fit === "scale-down" ? Math.min(1, 1 / Math.min(sx, sy)) : 1);
    else if (fit === "cover") sx = sy = Math.max(sx, sy);
    push({ kind: "img", src: u.replace(location.origin, ""), nw: im.naturalWidth, nh: im.naturalHeight, bw: +r.width.toFixed(1), bh: +r.height.toFixed(1), r: +Math.min(1 / (sx * dpr), 1 / (sy * dpr)).toFixed(3), where: where(im), cls: String(im.className || "") });
  }
  for (const im of root.querySelectorAll("image")) {
    const r = im.getBoundingClientRect();
    if (!vis(r) || hidden(im)) continue;
    const href = im.getAttribute("href") || im.getAttributeNS("http://www.w3.org/1999/xlink", "href") || "";
    if (!href || isVec(href)) continue;
    const url = new URL(href, location.href).href;
    const n = await nat(url);
    if (!n || !n.w) continue;
    const par = im.getAttribute("preserveAspectRatio") || "";
    let sx = r.width / n.w;
    let sy = r.height / n.h;
    if (!/none/.test(par)) sx = sy = /slice/.test(par) ? Math.max(sx, sy) : Math.min(sx, sy);
    push({ kind: "svg-image", src: url.replace(location.origin, ""), nw: n.w, nh: n.h, bw: +r.width.toFixed(1), bh: +r.height.toFixed(1), r: +Math.min(1 / (sx * dpr), 1 / (sy * dpr)).toFixed(3), where: where(im), cls: String(im.getAttribute("class") || "") });
  }
  for (const e of root.querySelectorAll("*")) {
    const cs = getComputedStyle(e);
    const bg = cs.backgroundImage;
    if (!bg || bg === "none" || !bg.includes("url(")) continue;
    const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
    if (!m || isVec(m[1])) continue;
    const r = e.getBoundingClientRect();
    if (!vis(r) || hidden(e)) continue;
    const n = await nat(new URL(m[1], location.href).href);
    if (!n || !n.w) continue;
    const z = e.offsetWidth > 0 ? r.width / e.offsetWidth : 1;
    const size = cs.backgroundSize.split(",")[0].trim();
    let sx;
    let sy;
    if (size === "cover" || size === "contain") {
      const a = r.width / n.w;
      const b = r.height / n.h;
      sx = sy = size === "cover" ? Math.max(a, b) : Math.min(a, b);
    } else {
      const [ws, hs = "auto"] = size.split(/\s+/);
      const len = (v, box, natv) => (v.endsWith("%") ? (parseFloat(v) / 100) * box : v.endsWith("px") ? parseFloat(v) * z : null);
      const W = len(ws, r.width, n.w);
      const H = len(hs, r.height, n.h);
      if (W != null && H != null) [sx, sy] = [W / n.w, H / n.h];
      else if (W != null) sx = sy = W / n.w;
      else if (H != null) sx = sy = H / n.h;
      else sx = sy = z; // auto: 원래 크기 그대로(확대만 친다)
    }
    push({ kind: "css-bg", src: m[1].replace(location.origin, ""), nw: n.w, nh: n.h, bw: +r.width.toFixed(1), bh: +r.height.toFixed(1), r: +Math.min(1 / (sx * dpr), 1 / (sy * dpr)).toFixed(3), where: where(e), cls: String(e.className || "").slice(0, 60), size });
  }
  return out;
}

const kindOf = () => {
  const s = document.querySelector(".lesson-screen .step");
  if (!s) return { kind: "none" };
  const t = (sel) => s.querySelector(sel)?.textContent?.trim().replace(/\s+/g, " ").slice(0, 60) || "";
  if (s.classList.contains("bv-step")) return { kind: "lab", title: t(".bv-head .bv-title, .bv-head h2, .bv-head") };
  if (s.querySelector(":scope > .opn-stage")) return { kind: "opener", title: t("h2, .opn-title, .title") };
  if (s.querySelector(":scope > .comic-panel")) return { kind: "comic", title: t("h2, .title") };
  if (s.querySelector(":scope > .c-figure")) return { kind: "concept", title: t("h2, .title") };
  if (s.querySelector(":scope > .opts")) return { kind: s.querySelector(":scope > .q-figure") ? "quiz-fig" : "quiz", title: t("h2, .q-text, .title") };
  return { kind: "other", title: t("h2, .title") };
};

const errors = [];
const results = [];

async function runLesson(cfgName, lesson) {
  const cfg = CONFIGS[cfgName];
  const ctx = await browser.newContext({ viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: cfg.dsf });
  await ctx.addInitScript(hook);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${cfgName} ${lesson.id}: ${String(e).slice(0, 200)}`));
  await page.goto(`${BASE}/?open=${lesson.id}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".lesson-screen", { timeout: 20000 });
  await page.addStyleTag({ content: ".snack{display:none!important}" });
  for (let i = 0; i < lesson.types.length; i++) {
    const k = await page.evaluate(kindOf);
    // 그림이 다 오고 3D가 첫 장면을 그릴 때까지
    const has3d = await page.evaluate(() => !!document.querySelector(".lesson-screen canvas.sp3-canvas, .lesson-screen canvas.cwm-canvas, .lesson-screen canvas.u7x-cv, .lesson-screen canvas.g2u7x-cv3d"));
    await sleep(k.kind === "lab" || k.kind === "opener" ? (has3d ? 2600 : 1500) : 500);
    await page
      .waitForFunction(() => [...document.querySelectorAll(".lesson-screen img")].every((im) => im.complete), null, { timeout: 4000 })
      .catch(() => {});
    const m = await page.evaluate(measureStep);
    const name = `${lesson.id}-s${String(i + 1).padStart(2, "0")}`;
    const worst = Math.min(1, ...m.canvases.map((c) => Math.min(c.rx, c.ry)), ...m.imgs.map((x) => x.r));
    let shot = null;
    if (SHOTS && worst < 0.9) {
      const sel = k.kind === "lab" ? ".lesson-screen .bv-stage" : ".lesson-screen .step";
      const loc = page.locator(sel).first();
      shot = `${cfgName}/${name}.png`;
      if (await loc.count()) await loc.screenshot({ path: `${OUT}/${shot}` }).catch(() => (shot = null));
    }
    results.push({ cfg: cfgName, grade: lesson.grade, unit: lesson.unit, unitTitle: lesson.unitTitle, lesson: lesson.id, lessonTitle: lesson.title, step: i + 1, type: lesson.types[i], ...k, name, worst: +worst.toFixed(3), shot, ...m });
    if (i === lesson.types.length - 1) break;
    const f = page.locator(".xbtn.fwd");
    if (await f.isVisible().catch(() => false)) await f.click().catch(() => {});
    await sleep(350);
  }
  await ctx.close();
  console.log("done", cfgName, lesson.id);
}

for (const cfgName of PICK) {
  if (!CONFIGS[cfgName]) {
    console.log("모르는 설정", cfgName);
    continue;
  }
  mkdirSync(`${OUT}/${cfgName}`, { recursive: true });
  const queue = lessons.map((l) => l);
  await Promise.all(
    Array.from({ length: WORKERS }, async () => {
      while (queue.length) {
        const l = queue.shift();
        try {
          await runLesson(cfgName, l);
        } catch (e) {
          errors.push(`${cfgName} ${l.id}: ${String(e).slice(0, 300)}`);
        }
      }
    }),
  );
}
await browser.close();
writeFileSync(`${OUT}/results-${PICK.join("+")}${ONLY.length ? "-" + ONLY.join("+") : ""}.json`, JSON.stringify({ configs: CONFIGS, results, errors }, null, 1));

// 요약: 캔버스는 그리는 코드 위치별로, 그림은 파일별로 가장 낮은 값
const by = new Map();
for (const r of results) {
  for (const c of r.canvases) {
    const key = `canvas | ${c.ctx} | ${c.src.split(" < ").slice(0, 2).join(" < ")}`;
    const e = by.get(key) || { key, min: 9, steps: new Set(), where: new Set() };
    e.min = Math.min(e.min, c.rx, c.ry);
    e.steps.add(`${r.cfg}:${r.name}`);
    e.where.add(c.where);
    by.set(key, e);
  }
  for (const x of r.imgs) {
    if (x.r >= 0.95) continue;
    const key = `${x.kind} | ${x.src}`;
    const e = by.get(key) || { key, min: 9, steps: new Set(), where: new Set() };
    e.min = Math.min(e.min, x.r);
    e.steps.add(`${r.cfg}:${r.name}`);
    e.where.add(x.where);
    by.set(key, e);
  }
}
const rows = [...by.values()].sort((a, b) => a.min - b.min);
console.log(`\n스텝 ${results.length}개, 항목 ${rows.length}개, 오류 ${errors.length}건`);
for (const e of rows) console.log(`${e.min.toFixed(2)}  ${e.key}  [${[...e.where].join(",")}]  ${[...e.steps].slice(0, 5).join(" ")}${e.steps.size > 5 ? ` …(${e.steps.size})` : ""}`);
for (const e of errors) console.log("오류", e);
