// 순환 여행 랩(g2u6RideLab)의 성능과 정리 검사(개발 서버). 결과는 콘솔과 <출력 폴더>/perf.json.
//   ① 폰 크기(390×700, 배율 2)에서 CPU를 RATE배 느리게 한 채(저사양 안드로이드 흉내) 여행의 세 구간에서 초당 장수와 느린 장의 시간
//   ② 캔버스가 실제로 그리는 픽셀 크기(폰, PC 1280×800, PC 1920×1080)
//   ③ 무대를 화면 밖으로 밀면 그리기가 멈추는가(window.__rideFrames, 개발 서버에서만 센다)
//   ④ 랩을 열고 떠나기를 열 번 해도 WebGL 컨텍스트가 쌓이지 않는가(콘솔 경고, 남은 캔버스)
// 실행: PORT=5721 node qa/ride-perf.mjs <출력 폴더> [RATE=6]
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PORT = process.env.PORT || "5721";
const BASE = `http://localhost:${PORT}`;
const OUT = process.argv[2] || "qa/shots/ride-perf";
const RATE = Number(process.env.RATE || 6);
mkdirSync(OUT, { recursive: true });
const HMR = `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const res = { rate: RATE };

async function openRide(ctxOpts) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const logs = [];
  page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
  });
  await page.route("**/@vite/client", (r) => r.fulfill({ contentType: "application/javascript", body: HMR }));
  await page.goto(`${BASE}/?open=g2u6l3`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!document.querySelector(".screen.active .step"), null, { timeout: 20000 });
  await page.waitForTimeout(800);
  for (let i = 0; i < 12; i++) {
    if (await page.evaluate(() => !!document.querySelector(".screen.active .step.g2u6x-ride-step"))) break;
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await page.waitForTimeout(600);
  }
  await page.waitForFunction(() => document.querySelector(".screen.active .step.g2u6x-ride-step")?.dataset.g6Ready === "1", null, { timeout: 20000 });
  return { ctx, page, logs };
}
const canvasSize = (page) =>
  page.evaluate(() => {
    const c = document.querySelector(".screen.active .g2u6x-rd-canvas");
    const s = document.querySelector(".screen.active .bv-stage.g2u6x-ride");
    const r = s.getBoundingClientRect();
    return { px: [c.width, c.height], css: [s.clientWidth, s.clientHeight], screen: [Math.round(r.width), Math.round(r.height)], mpx: Math.round((c.width * c.height) / 1e4) / 100 };
  });
/** 지금부터 ms 동안 rAF 간격을 잰다 */
const sample = (page, ms) =>
  page.evaluate(
    (ms) =>
      new Promise((done) => {
        const gaps = [];
        let last = performance.now();
        const f0 = window.__rideFrames ?? 0;
        const t0 = last;
        const tick = (t) => {
          gaps.push(t - last);
          last = t;
          if (t - t0 < ms) requestAnimationFrame(tick);
          else {
            gaps.sort((a, b) => a - b);
            const drawn = (window.__rideFrames ?? 0) - f0;
            done({ raf: Math.round((gaps.length / ms) * 1000), drawnPerSec: Math.round((drawn / ms) * 1000), p50: Math.round(gaps[Math.floor(gaps.length * 0.5)]), p95: Math.round(gaps[Math.floor(gaps.length * 0.95)]) });
          }
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );
const pick = (page, k) =>
  page.waitForFunction((k) => { const b = document.querySelector(`.screen.active .g2u6x-rd-pick[data-k="${k}"]`); return b && !b.disabled; }, k, { timeout: 30000 }).then(() =>
    page.evaluate((k) => document.querySelector(`.screen.active .g2u6x-rd-pick[data-k="${k}"]`).click(), k),
  );

// ① 폰 + CPU 느리게
{
  const { ctx, page } = await openRide({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  res.phoneCanvas = await canvasSize(page);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: RATE });
  res.idle = await sample(page, 1500); // 단추를 기다리는 동안
  await pick(page, "pump");
  await page.waitForTimeout(900);
  res.travel = await sample(page, 2200); // 대동맥을 따라 내려감(카메라가 따라감)
  await pick(page, "cap").catch(() => {});
  await page.waitForTimeout(300);
  res.exchange = await sample(page, 2500); // 조직세포 곁의 교환
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  // ③ 화면 밖으로 밀면 멈추는가
  await page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    const pad = document.createElement("div");
    pad.id = "perf-pad";
    pad.style.height = "1600px";
    document.querySelector(".screen.active .step").appendChild(pad);
    sc.scrollTop = sc.scrollHeight;
  });
  await page.waitForTimeout(500);
  const f1 = await page.evaluate(() => window.__rideFrames ?? 0);
  await page.waitForTimeout(1500);
  const f2 = await page.evaluate(() => window.__rideFrames ?? 0);
  res.offscreenFrames = f2 - f1;
  await page.evaluate(() => {
    document.getElementById("perf-pad")?.remove();
    document.querySelector(".screen.active .scroll").scrollTop = 0;
  });
  await page.waitForTimeout(700);
  const f3 = await page.evaluate(() => window.__rideFrames ?? 0);
  await page.waitForTimeout(800);
  res.backOnscreenFrames = (await page.evaluate(() => window.__rideFrames ?? 0)) - f3;
  await page.screenshot({ path: join(OUT, "phone-throttled.png") });
  await ctx.close();
}
// ② PC 크기의 캔버스
for (const [name, vp] of [["pc1280", { width: 1280, height: 800 }], ["pc1920", { width: 1920, height: 1080 }]]) {
  const { ctx, page } = await openRide({ viewport: vp, deviceScaleFactor: 1 });
  res[name] = await canvasSize(page);
  res[name].zoom = await page.evaluate(() => getComputedStyle(document.querySelector(".screen.active .step.g2u6x-ride-step")).getPropertyValue("--rdk"));
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  await ctx.close();
}
{
  const { ctx, page } = await openRide({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  res.pc1920x2 = await canvasSize(page);
  await ctx.close();
}
// ④ 열고 떠나기 열 번
{
  const { ctx, page, logs } = await openRide({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.back, .screen.active .lheader .xbtn:not(.fwd)")?.click());
    await page.waitForTimeout(500);
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await page.waitForFunction(() => document.querySelector(".screen.active .step.g2u6x-ride-step")?.dataset.g6Ready === "1", null, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
  const f1 = await page.evaluate(() => window.__rideFrames ?? 0);
  res.reopen = {
    canvases: await page.evaluate(() => document.querySelectorAll(".g2u6x-rd-canvas").length),
    webglWarn: logs.filter((l) => /WebGL|context/i.test(l)).slice(0, 5),
    errors: logs.filter((l) => /^(error|pageerror)/.test(l) && !/vibrate|favicon|404/.test(l)).slice(0, 5),
  };
  // 레슨을 닫으면 그리기가 멈추는가
  await page.evaluate(() => document.querySelector(".screen.active .lheader .xbtn.close, .screen.active .xbtn.x, .screen.active [aria-label='닫기']")?.click());
  await page.waitForTimeout(900);
  const f2 = await page.evaluate(() => window.__rideFrames ?? 0);
  await page.waitForTimeout(1200);
  res.afterCloseFrames = (await page.evaluate(() => window.__rideFrames ?? 0)) - f2;
  res.closedTo = await page.evaluate(() => document.querySelector(".screen.active")?.id ?? "");
  void f1;
  await ctx.close();
}
writeFileSync(join(OUT, "perf.json"), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
await browser.close();
