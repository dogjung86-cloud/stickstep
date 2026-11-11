// 중1 Ⅱ 도입의 나머지 다섯 장면(u2l3, u2l5, u2l6, u2l8, u2l10)을 390×700에서 처음부터 끝까지 한 번씩 해 본다.
// 보는 것: 시점마다 스텝이 스크롤 영역(554px) 안인가, 제목이 한 줄인가, 쌤의 말이 두 줄 안쪽인가, 페이지 오류가 없는가,
//          끝의 버튼으로 다음 스텝이 열리는가. 끝 화면을 장면마다 한 장씩 남긴다.
// 실행(dev 서버): PORT=5557 node qa/check-u2intro-rest.mjs [캡처 폴더]
// 실행(서버 없이 빌드한 dist를 그대로 읽는다): DIST=1 node qa/check-u2intro-rest.mjs [캡처 폴더]
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { launch, openSample, choose, stagePt, drag, W, ds, waitPhase, ctaState, cta, BASE } from "./u2intro-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] ?? join(HERE, "shots", "u2intro-rest");
mkdirSync(OUT, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon" };

const fails = [];
const ok = (cond, msg) => { console.log(`${cond ? "  ok " : "FAIL "} ${msg}`); if (!cond) fails.push(msg); };

const fit = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    const step = sc.querySelector(".step");
    const b = step.querySelector(".opn-bubble");
    const t = step.querySelector(".opn-title");
    const lines = (e) => (e ? Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)) : 0);
    const text = [...step.querySelectorAll(".opn-title, .hook-q, .hook-choice, .opn-bubble, .opn-controls, .opn-stage")]
      .filter((e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden")
      .map((e) => (e.textContent || "").replace(/\s+/g, ""))
      .join("");
    return { room: sc.clientHeight, need: sc.scrollHeight, titleLines: lines(t), sayLines: b ? Math.round((b.getBoundingClientRect().height - 16) / 20) : 0, chars: text.length };
  });
async function at(page, id, when) {
  const m = await fit(page);
  ok(m.need <= m.room && m.room <= 554, `${id} ${when}: 높이 ${m.need}/${m.room}px, 제목 ${m.titleLines}줄, 쌤의 말 ${m.sayLines}줄, 보이는 글 ${m.chars}자`);
  ok(m.titleLines === 1, `${id} ${when}: 제목 한 줄`);
  ok(m.sayLines <= 2, `${id} ${when}: 쌤의 말 두 줄 안쪽`);
  if (process.env.MID && when !== "끝") await page.screenshot({ path: join(process.env.MID, `${id}-${when.replace(/\s+/g, "")}.png`) });
}

const PLAYS = {
  async u2l3(page, id) {
    await choose(page, "크게");
    await W(page, 400);
    await at(page, id, "예측 뒤");
    await drag(page, await stagePt(page, 200, 440), await stagePt(page, 560, 440), 14);
  },
  async u2l5(page, id) {
    await choose(page, "세 번");
    await W(page, 400);
    await at(page, id, "예측 뒤");
    for (let i = 0; i < 2; i++) {
      const r = await page.evaluate(() => { const b = document.querySelector(".screen.active .opn-hold").getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
      await page.mouse.move(r.x, r.y);
      await page.mouse.down();
      await W(page, 1150);
      await page.mouse.up();
      await W(page, 500);
      if (i === 0) await at(page, id, "한 번 모은 뒤");
    }
  },
  async u2l6(page, id) {
    await choose(page, "50종");
    await W(page, 400);
    await at(page, id, "예측 뒤");
    for (let i = 0; i < 3; i++) { await page.evaluate((k) => document.querySelector(`.screen.active .opn-dk-hit[data-i="${k}"]`).click(), i); await W(page, 350); }
    await W(page, 2800);
  },
  async u2l8(page) {
    await page.evaluate(() => document.querySelector('.screen.active .opn-sh-hit[data-side="fruit"]').click());
    await W(page, 3000);
  },
  async u2l10(page, id) {
    await choose(page, "사과");
    await W(page, 400);
    await at(page, id, "예측 뒤");
    await page.evaluate(() => document.querySelector(".screen.active .opn-switch").click());
    await W(page, 700);
    await at(page, id, "스위치를 끈 뒤");
    await page.evaluate(() => document.querySelector(".screen.active .opn-switch").click());
  },
};

const { browser, page, errors } = await launch({ query: null });
if (process.env.DIST) {
  const dist = join(HERE, "..", "dist");
  await page.route(`${BASE}/**`, (route) => {
    const u = new URL(route.request().url());
    let f = join(dist, decodeURIComponent(u.pathname));
    if (u.pathname === "/" || !existsSync(f)) f = join(dist, "index.html");
    route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
  });
}
if (!process.env.DIST) {
  // 다른 세션이 파일을 저장해도 페이지가 다시 읽히지 않게 한다(CSS 주입은 살리고 웹소켓만 뺀다)
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
}
for (const id of Object.keys(PLAYS)) {
  console.log(`\n── ${id} ──`);
  await openSample(page, id);
  ok((await ds(page, "opnScene")) !== null, `${id}: 새 도입으로 열렸다(${await ds(page, "opnScene")})`);
  await at(page, id, "처음");
  await PLAYS[id](page, id);
  ok(await waitPhase(page, "done", 80), `${id}: 끝까지 갔다`);
  await W(page, 1400);
  await at(page, id, "끝");
  const c = await ctaState(page);
  ok(c.enabled, `${id}: 아래 버튼이 열렸다(${c.text})`);
  await page.screenshot({ path: join(OUT, `${id}-end.png`) });
  await cta(page);
  await W(page, 600);
  ok(await page.evaluate(() => !document.querySelector(".screen.active .step")?.classList.contains("opn-step")), `${id}: 다음 스텝이 열렸다`);
}
ok(errors.length === 0, `페이지 오류 없음${errors.length ? ": " + errors.join(" | ") : ""}`);
await browser.close();
console.log(fails.length ? `\n실패 ${fails.length}건` : "\n모두 통과");
process.exit(fails.length ? 1 : 0);
