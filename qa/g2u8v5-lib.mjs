// 중2 Ⅷ v5 검사 공용 부품: 열기(학년 중2), 조작 칸의 버튼과 막대, 가로 화면의 자리 누르기.
// 나머지(재기, 판정 누르기, 글 모으기)는 중1 Ⅴ v5의 부품(qa/u5v5-lib.mjs)을 그대로 쓴다.
// 개발 서버: PORT=5588   서버 없이: DIST=<개발 모드 번들 폴더>(qa/u4v5-lib.mjs 머리말의 방법)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { launch as baseLaunch, W, waitFor } from "./u5v5-lib.mjs";
export { fwd, fit, stageAt, drag, holdBtn, click, waitAsk, answer, next, texts, W, waitFor, ctaState, cta, choose, ds, waitPhase } from "./u5v5-lib.mjs";

let BASE = `http://localhost:${process.env.PORT || "5588"}`;
let server = null;
const MIME = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".jpg": "image/jpeg" };

export async function launch() {
  if (process.env.DIST) {
    const root = process.env.DIST;
    server = createServer(async (req, res) => {
      const path = decodeURIComponent(req.url.split("?")[0]);
      try {
        const body = await readFile(join(root, path === "/" ? "index.html" : path));
        res.writeHead(200, { "content-type": MIME[extname(path)] ?? (path === "/" ? "text/html" : "application/octet-stream") });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end();
      }
    });
    await new Promise((r) => server.listen(0, r));
    BASE = `http://localhost:${server.address().port}`;
  }
  const { browser, page, errors } = await baseLaunch();
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
  });
  const close = async () => {
    await browser.close();
    server?.close();
  };
  return { browser, page, errors, close };
}

/** 레슨을 바로 연다. on=false면 토글을 끈 채(지금 운영 판). */
export async function openLesson(page, id, on = true) {
  await page.goto(`${BASE}/?${on ? "g2u8v5" : "g2u8v5=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!document.querySelector(".screen.active .step"), null, { timeout: 20000 });
  await page.waitForTimeout(900);
}

/** 조작 칸에서 글이 들어 있는 버튼을 누른다. */
export const tapText = (page, text, scope = ".bv-ctl") =>
  page.evaluate(({ text, scope }) => {
    const b = [...document.querySelectorAll(`.screen.active ${scope} button`)].find((x) => x.textContent.includes(text) && !x.disabled);
    b?.click();
    return !!b;
  }, { text, scope });

/** 고르기 버튼(data-k)이나 카드(data-k)를 누른다. */
export const tapKey = (page, k, scope = ".bv-ctl") =>
  page.evaluate(({ k, scope }) => {
    const b = document.querySelector(`.screen.active ${scope} [data-k="${k}"]`);
    if (!b || b.disabled) return false;
    b.click();
    return true;
  }, { k, scope });

/** 미는 막대의 값을 바꾼다(input 사건을 낸다). */
export const setRange = (page, v) =>
  page.evaluate((v) => {
    const i = document.querySelector(".screen.active .bv-ctl input[type=range]");
    if (!i || i.disabled) return false;
    i.value = String(v);
    i.dispatchEvent(new Event("input", { bubbles: true }));
    i.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }, v);

/** 무대(346×230 설계 판)의 한 점을 실제 포인터로 누른다. */
export async function tapStage(page, x, y) {
  const p = await page.evaluate(({ x, y }) => {
    const r = document.querySelector(".screen.active .bv-stage").getBoundingClientRect();
    return { x: r.left + (x * r.width) / 346, y: r.top + (y * r.width) / 346 };
  }, { x, y });
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.waitForTimeout(40);
  await page.mouse.up();
  await page.waitForTimeout(120);
}

/** 가로 화면(90도 돌린 무대)의 한 점(가로 기준 좌표)을 누른다. 가로 기준 x는 화면의 아래쪽, y는 화면의 왼쪽이다. */
export async function tapRot(page, x, y) {
  const p = await page.evaluate(({ x, y }) => {
    const r = document.querySelector(".rot-stage").getBoundingClientRect();
    const native = document.querySelector(".rot-inner").classList.contains("native");
    return native ? { x: r.left + x, y: r.top + y } : { x: r.right - y, y: r.top + x };
  }, { x, y });
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.waitForTimeout(40);
  await page.mouse.up();
  await page.waitForTimeout(150);
}

export const pips = (page) => page.evaluate(() => document.querySelectorAll(".screen.active .bv-pips i.on").length);
export const waitPips = (page, n, tries = 100) => waitFor(page, (n) => document.querySelectorAll(".screen.active .bv-pips i.on").length >= n, n, tries);
export const helper = (page) => page.evaluate(() => document.querySelector(".screen.active .bv-helper")?.textContent ?? "");
export { W as wait };
