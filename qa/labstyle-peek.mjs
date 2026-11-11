// 랩의 다른 느낌 샘플 개발용 엿보기(qa/u2v5-peek.mjs의 사본에 토글만 더했다).
// 한 스텝을 폰 크기(390×700)로 열어 조작 스크립트를 돌린 뒤 캡처한다. STYLE=0이면 지금 랩, 기본은 샘플(STYLE=1).
//   PORT=5567 node qa/labstyle-peek.mjs <레슨 번호 0~> <스텝 번호 0~> <출력.png> [조작 스크립트 파일(.js)]
// 조작 스크립트는 페이지 안에서 async 함수 몸통으로 실행된다. 쓸 수 있는 것:
//   W(ms) 기다리기 · $(sel) .screen.active 안에서 찾기 · tap(sel 또는 요소) 클릭 · slide(sel, 값) range 값 넣기(input+change)
//   pick(글자) 판정 보기 고르기 · shot(이름) 중간 캡처 요청(노드 쪽에서 찍는다)
// 측정값(스텝 높이, 스크롤 영역, 무대 시작 높이)을 함께 출력한다.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const PORT = process.env.PORT || "5567";
const STYLE = process.env.STYLE ?? "1";
const [li, si, out, scriptFile] = process.argv.slice(2);
const W_ = Number(process.env.VW || 390);
const H_ = Number(process.env.VH || 700);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: W_, height: H_ }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 200)); });
await page.addInitScript((v) => { window.__u2style = v; }, STYLE);
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
await page.evaluate(async ({ li, si }) => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const c = await import("/src/content/curriculum.ts");
  const u = c.CURRICULUM.find((x) => x.id === "u2");
  nav.reset(createLessonPlayer(u.lessons[li], { onExit: () => {}, onComplete: () => {} }));
  for (let i = 0; i < si; i++) { await new Promise((r) => setTimeout(r, 430)); document.querySelector(".screen.active .xbtn.fwd")?.click(); }
  await new Promise((r) => setTimeout(r, 900));
  document.querySelectorAll(".snack, .toast").forEach((e) => e.remove());
}, { li: Number(li), si: Number(si) });

const measure = () => page.evaluate(() => {
  const sc = document.querySelector(".screen.active .scroll");
  const wrap = document.querySelector(".screen.active .stepWrap");
  const top0 = sc.getBoundingClientRect().top;
  const r = (sel) => { const e = wrap.querySelector(sel); if (!e || e.offsetParent === null) return null; const b = e.getBoundingClientRect(); return `${Math.round(b.top - top0 + sc.scrollTop)}+${Math.round(b.height)}`; };
  const helper = wrap.querySelector(".bv-helper");
  return { usable: sc.clientHeight, total: wrap.scrollHeight, stage: r(".bv-stage"), slot: r(".bv-slot"), helperOverflow: helper ? helper.scrollHeight > helper.clientHeight + 1 : null, frameScroll: document.querySelector("#frame")?.scrollTop ?? 0 };
});

let n = 0;
await page.exposeFunction("__shot", async (name) => {
  const p = out.replace(/\.png$/, `-${name || ++n}.png`);
  await page.screenshot({ path: p });
  console.log("shot", path.basename(p), JSON.stringify(await measure()));
});
if (scriptFile) {
  const body = fs.readFileSync(scriptFile, "utf8");
  await page.evaluate(async (body) => {
    const W = (ms) => new Promise((r) => setTimeout(r, ms));
    const A = ".screen.active";
    const $ = (sel) => document.querySelector(`${A} ${sel}`);
    const tap = (x) => { const e = typeof x === "string" ? $(x) : x; if (!e) throw new Error("tap: 없음 " + x); e.click(); };
    const slide = (sel, v) => { const e = $(sel); if (!e) throw new Error("slide: 없음 " + sel); e.value = String(v); e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); };
    const pick = (text) => { const b = [...document.querySelectorAll(`${A} .bv-choice`)].filter((x) => !x.disabled && x.offsetParent !== null).find((x) => x.textContent.includes(text)); if (!b) throw new Error("pick: 없음 " + text); b.click(); };
    const shot = (name) => window.__shot(name);
    const fn = new Function("W", "$", "tap", "slide", "pick", "shot", `return (async () => { ${body} })();`);
    await fn(W, $, tap, slide, pick, shot);
  }, body);
}
await page.screenshot({ path: out });
console.log("final", path.basename(out), JSON.stringify(await measure()));
await browser.close();
