// PC 크기에서 랩 무대 안 3D(WebGL)의 그리기 부담을 예전 배율(old)과 시험 수정 배율(new)로 견준다(2026-11-15, 분석용).
//  · 프레임마다 rAF 콜백 + gl.finish()까지 걸린 시간(= 그 프레임의 CPU와 GPU 일을 다 끝내는 데 든 시간)과 rAF 간격을 잰다.
//  · gpu: 이 PC의 그래픽 카드(headless 크롬도 실제 GPU를 쓴다). soft: SwiftShader(CPU로 그리는 소프트웨어 GPU, 아주 약한 그래픽의 대용).
//  · 무대를 찍어 전후 견주기 그림도 남긴다.
// 개발 서버 필요: PORT=<포트> node qa/perf-pc-3d.mjs <출력 폴더> <gpu|soft> <설정> <레슨:스텝,...> [모드들: old,new]
//   모드 = 세션 저장소 ss.pr3d 값(src/ui/space3d.ts의 stagePixelRatio): old 예전 배율, new 새 배율(픽셀 상한 80만), full 새 배율(픽셀 상한 없이),
//   숫자 = 그 배율을 상한으로. 2026-11-15 첫 측정의 new는 픽셀 상한을 넣기 전이라 지금의 full과 같다.
//   CPU=4 를 주면 메인 스레드를 4배 느리게(저사양 CPU 흉내, 크롬 개발자 도구의 CPU throttling과 같다).
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const PORT = process.env.PORT || 5731;
const OUT = process.argv[2] || "../output/pc-quality/perf";
const DEV = process.argv[3] || "gpu";
const CFG = process.argv[4] || "fhd100";
// 대상: 레슨:스텝 또는 레슨:스텝@눌러야-할-선택자(가로 화면 3D처럼 단추를 눌러야 열리는 것)
const TARGETS = (process.argv[5] || "u2l2:3").split(",").map((s) => {
  const [ls, click] = s.split("@");
  const [lesson, step] = ls.split(":");
  return { lesson, step: Number(step), click: click || "" };
});
const MODES = (process.argv[6] || "old,new").split(",");
const THROTTLE = Number(process.env.CPU || 1);
const SECS = Number(process.env.SECS || 5);
const BASE = `http://localhost:${PORT}`;
const CONFIGS = {
  fhd100: { w: 1920, h: 940, dsf: 1 },
  fhd125: { w: 1536, h: 730, dsf: 1.25 },
  wuxga150: { w: 1280, h: 665, dsf: 1.5 },
  qhd100: { w: 2560, h: 1300, dsf: 1 },
  qhd150: { w: 1707, h: 825, dsf: 1.5 },
  uhd150: { w: 2560, h: 1300, dsf: 1.5 },
  mac: { w: 1470, h: 830, dsf: 2 },
  phone: { w: 390, h: 844, dsf: 3 },
  ipad: { w: 1180, h: 760, dsf: 2 },
};
const cfg = CONFIGS[CFG];
mkdirSync(`${OUT}/shots`, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: DEV === "soft" ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] : ["--ignore-gpu-blocklist"],
});

function hook(mode) {
  const s = JSON.parse(localStorage.getItem("science-app.v1") || "{}");
  s.reviewMode = true;
  s.onboarded = true;
  s.wideOff = false;
  localStorage.setItem("science-app.v1", JSON.stringify(s));
  try {
    if (mode === "old") sessionStorage.removeItem("ss.pr3d");
    else sessionStorage.setItem("ss.pr3d", mode);
  } catch {
    /* 무시 */
  }
  window.__gls = [];
  const og = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = og.call(this, type, ...rest);
    if (c && /webgl/.test(type) && !window.__gls.includes(c)) window.__gls.push(c);
    return c;
  };
  const raf = window.requestAnimationFrame.bind(window);
  window.__frames = [];
  window.__rec = false;
  window.requestAnimationFrame = (cb) =>
    raf((ts) => {
      const t0 = performance.now();
      cb(ts);
      if (window.__rec) {
        for (const gl of window.__gls) if (gl.canvas.isConnected && !gl.isContextLost()) gl.finish();
        window.__frames.push([ts, performance.now() - t0]);
      }
    });
}

const q = (arr, p) => {
  if (!arr.length) return null;
  const a = [...arr].sort((x, y) => x - y);
  return +a[Math.min(a.length - 1, Math.floor(p * a.length))].toFixed(2);
};

const rows = [];
for (const t of TARGETS) {
  for (const mode of MODES) {
    const ctx = await browser.newContext({ viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: cfg.dsf, isMobile: CFG === "phone", hasTouch: CFG === "phone" });
    await ctx.addInitScript(hook, mode);
    const page = await ctx.newPage();
    if (THROTTLE > 1) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
    }
    await page.goto(`${BASE}/?open=${t.lesson}`, { waitUntil: "networkidle" });
    await page.waitForSelector(".lesson-screen", { timeout: 20000 });
    await page.addStyleTag({ content: ".snack{display:none!important}" });
    for (let i = 1; i < t.step; i++) {
      await page.locator(".xbtn.fwd").click();
      await sleep(300);
    }
    if (t.click) {
      await sleep(800);
      await page.locator(t.click).first().click();
    }
    await sleep(3500);
    await page.evaluate(() => {
      window.__frames.length = 0;
      window.__rec = true;
    });
    await sleep(SECS * 1000);
    const m = await page.evaluate(() => {
      window.__rec = false;
      const f = window.__frames.splice(0);
      const cv = [...document.querySelectorAll(".rot-stage canvas, .lesson-screen canvas")].find((c) => window.__gls.some((g) => g.canvas === c) && c.getBoundingClientRect().width > 10);
      const r = cv?.getBoundingClientRect();
      const gl = cv && window.__gls.find((g) => g.canvas === cv);
      return {
        f,
        dpr: devicePixelRatio,
        lk: getComputedStyle(document.documentElement).getPropertyValue("--lk").trim(),
        wide: document.documentElement.classList.contains("wide"),
        w: cv?.width ?? 0,
        h: cv?.height ?? 0,
        bw: r ? +r.width.toFixed(1) : 0,
        samples: gl ? gl.getParameter(gl.SAMPLES) : null,
        gpu: (() => {
          const g = window.__gls[0];
          const e = g?.getExtension("WEBGL_debug_renderer_info");
          return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : "";
        })(),
      };
    });
    const iv = m.f.slice(1).map((x, i) => x[0] - m.f[i][0]);
    const work = m.f.map((x) => x[1]);
    const row = {
      target: `${t.lesson}:${t.step}`,
      mode,
      dev: DEV,
      cfg: CFG,
      cpu: THROTTLE,
      canvas: `${m.w}×${m.h}`,
      mpx: +((m.w * m.h) / 1e6).toFixed(2),
      ratio: m.bw ? +(m.w / (m.bw * m.dpr)).toFixed(2) : null,
      samples: m.samples,
      fps: +(m.f.length / SECS).toFixed(1),
      workMed: q(work, 0.5),
      workP95: q(work, 0.95),
      ivMed: q(iv, 0.5),
      ivP95: q(iv, 0.95),
      over20: iv.length ? +((100 * iv.filter((x) => x > 20).length) / iv.length).toFixed(1) : null,
      gpu: m.gpu,
      lk: m.lk,
      wide: m.wide,
    };
    rows.push(row);
    console.log(JSON.stringify(row));
    if (DEV === "gpu" && THROTTLE === 1) {
      const loc = page.locator(t.click ? ".rot-stage" : ".lesson-screen .bv-stage").first();
      if (await loc.count()) await loc.screenshot({ path: `${OUT}/shots/${CFG}-${t.lesson}-s${t.step}-${mode}.png` }).catch(() => {});
    }
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${OUT}/perf-${DEV}-${CFG}-${MODES.join("+")}${THROTTLE > 1 ? "-cpu" + THROTTLE : ""}.json`, JSON.stringify(rows, null, 1));
