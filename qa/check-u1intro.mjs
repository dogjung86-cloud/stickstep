// 중1 Ⅰ 도입 세 장면의 간소 검사: 390×700에서 장면마다 처음부터 끝까지 한 번 해 보며
// 시점마다 스크롤 높이가 한 화면(554px) 안인지, 페이지 오류가 없는지 보고, 끝 화면을 한 장씩 찍는다.
// 실행(dev 서버):      PORT=5559 node qa/check-u1intro.mjs [캡처 폴더]
// 실행(서버 없이 dist): DIST=1 BASE=http://u1intro.test node qa/check-u1intro.mjs [캡처 폴더]
//   DIST=1이면 npm run build로 만든 dist/를 브라우저의 요청 가로채기로 직접 내준다(서버를 띄우지 않는다).
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { launch, openSample, measure, choose, stagePt, waitPhase, ctaState, cta, stepType, ds, W, BASE } from "./u2intro-lib.mjs";

const OUT = process.argv[2] ?? "qa/shots/u1intro";
mkdirSync(OUT, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".mp3": "audio/mpeg" };

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL " + msg); } };

const { browser, page, errors } = await launch({ query: null });
if (process.env.DIST) {
  await page.route(BASE + "/**", (route) => {
    const u = new URL(route.request().url());
    const rel = u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname.slice(1));
    const f = join("dist", rel);
    if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
  });
} else {
  // dev 서버: 다른 세션이 파일을 저장해도 페이지가 다시 읽히지 않게 HMR만 끈다(CSS 주입은 살린다. e2e-steprush와 같은 스텁)
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

let chars = new Set();
const at = async (id, mark) => {
  const m = await measure(page);
  ok(m.content <= m.view && m.scrollTop === 0, `${id} ${mark}: 스크롤 ${m.content}/${m.view}, 밀림 ${m.scrollTop}`);
  ok(m.titleLines === 1, `${id} ${mark}: 제목 ${m.titleLines}줄`);
  ok(m.clipped.length === 0, `${id} ${mark}: 잘린 글 ${m.clipped.join(" | ")}`);
  ok(m.taps.every((t) => t.h >= 44), `${id} ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 44).map((t) => t.t + t.h).join(",")}`);
  const txt = await page.evaluate(() => [...document.querySelectorAll(".screen.active .step .opn-title, .screen.active .step .hook-q, .screen.active .step .hook-choice, .screen.active .step .opn-bubble, .screen.active .step .opn-u1-btn")].filter((e) => e.offsetParent).map((e) => e.textContent.trim()));
  txt.forEach((t) => chars.add(t));
  console.log(`  ${id} ${mark}: ${m.stepH}px (스크롤 ${m.content}/${m.view}), 말 ${m.bubbleLines}줄`);
  return m;
};
const click = (sel) => page.evaluate((s) => document.querySelector(".screen.active " + s)?.click(), sel);

async function finish(id, wantCta) {
  ok(await waitPhase(page, "done", 60), `${id}: 끝에 닿지 못함(phase ${await ds(page, "opnPhase")})`);
  await W(page, 1400);
  await at(id, "done");
  const c = await ctaState(page);
  ok(c.enabled && c.text === wantCta, `${id}: 버튼 "${c.text}" enabled=${c.enabled}`);
  await page.screenshot({ path: join(OUT, `${id}-done.png`) });
  await cta(page);
  const t = await stepType(page);
  ok(t !== "opener" && t !== "", `${id}: 다음 스텝이 열리지 않음(${t})`);
}

const SCENES = {
  u1l2: async (id) => {
    await at(id, "ask");
    await choose(page, "검은");
    await W(page, 500);
    await at(id, "picked");
    const p = await stagePt(page, 150, 126);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await W(page, 900);
    await page.mouse.up(); // 중간에 손을 뗀다
    await W(page, 300);
    await at(id, "mid");
    await page.screenshot({ path: join(OUT, `${id}-mid.png`) });
    await page.mouse.down();
    await W(page, 2200);
    await page.mouse.up();
    await finish(id, "탐구 설계 시작");
  },
  u1l4: async (id) => {
    await at(id, "ask");
    await choose(page, "열 번");
    await W(page, 500);
    await at(id, "picked");
    await click('.opn-u1-btn[data-n="1"]');
    await W(page, 1500);
    await at(id, "mid");
    await page.screenshot({ path: join(OUT, `${id}-mid.png`) });
    await click('.opn-u1-btn[data-n="2"]');
    await W(page, 2000);
    await click('.opn-u1-btn[data-n="3"]');
    await finish(id, "기술 카드 열기");
  },
  u1l5: async (id) => {
    await at(id, "ask");
    await choose(page, "내려가요");
    await W(page, 500);
    await at(id, "picked");
    await click(".opn-u1-btn.up");
    await W(page, 700);
    await click(".opn-u1-btn.up");
    await W(page, 900);
    await at(id, "mid");
    await page.screenshot({ path: join(OUT, `${id}-mid.png`) });
    await click(".opn-u1-btn.down");
    await finish(id, "실천 분류하기");
  },
};

for (const [id, play] of Object.entries(SCENES)) {
  console.log(id);
  chars = new Set();
  await openSample(page, id);
  ok((await stepType(page)) === "opener", `${id}: 새 도입으로 열리지 않음`);
  await play(id);
  const n = [...chars].join("").replace(/\s+/g, "").length;
  console.log(`  ${id}: 이 길에서 뜬 글 ${n}자(공용 안내 글 포함)`);
  // 토글을 끄면 정본 훅 그대로
  await openSample(page, id, { now: true });
  ok((await stepType(page)) === "hook", `${id}: now로 열었는데 정본 훅이 아님(${await stepType(page)})`);
}
ok(errors.length === 0, `페이지 오류 ${errors.length}건: ${errors.slice(0, 3).join(" / ")}`);
await browser.close();
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
