// 중2 Ⅰ v5 단원 검사(390×700). 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가고, 랩의 첫 판정에서 한 번 틀려 본다.
//   시점마다 스크롤 높이가 554 이하인지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
//   그 길에서 모은 화면 글에 대시, '교과서', 이모지가 없는지 본다. 새로 쓴 문제는 정답을 눌러 정답으로 채점되는지 본다.
//   마지막에 토글을 끈 채 첫 레슨이 옛 화면(hook)으로 열리는지 본다.
// 랩은 개발 모드에서 스텝 요소에 남기는 data-todo(다음에 누를 곳)를 따라간다(steps/g2u1v5/g2u1Kit.ts).
// 실행: PORT=5581 node qa/check-g2u1v5.mjs [레슨 id ...]      화면 그림: SHOTS=<폴더> 를 주면 시점마다 저장한다.
//       서버 없이: NODE_ENV=development npx vite build --mode development --outDir <폴더> --emptyOutDir 뒤 DIST=<폴더> node qa/check-g2u1v5.mjs
import { chromium } from "playwright-core";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";

const DIST = process.env.DIST || "";
const BASE = DIST ? "http://g2u1v5.test" : `http://localhost:${process.env.PORT || "5581"}`;
const SHOTS = process.env.SHOTS || "";
const BUDGET = 554;
const ALL = ["g2u1l1", "g2u1l2", "g2u1l3", "g2u1l4", "g2u1l5", "g2u1l6", "g2u1l7", "g2u1l8", "g2u1l9"];
const lessons = process.argv.slice(2).filter((a) => /^g2u1l\d$/.test(a));
const LIST = lessons.length ? lessons : ALL;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".mp3": "audio/mpeg" };
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/navigator\.vibrate|favicon|net::ERR|status of 404/.test(m.text())) errors.push("console: " + m.text()); if (m.type() === "warning" && m.text().includes("[v5]")) errors.push("warn: " + m.text()); });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
});
if (DIST) {
  await page.route(BASE + "/**", (route) => {
    const u = new URL(route.request().url());
    const rel = u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname.slice(1));
    const f = join(DIST, rel);
    if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
  });
} else {
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

const W = (ms) => page.waitForTimeout(ms);
const fails = [];
let checks = 0;
const ok = (cond, msg) => { checks += 1; if (!cond) { fails.push(msg); console.log("  실패: " + msg); } };
let texts = "";
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: join(SHOTS, name + ".png") }); };

const ds = (key) => page.evaluate((k) => document.querySelector(".screen.active .step")?.dataset[k] ?? null, key);
const waitFor = async (fn, arg, tries = 100, gap = 100) => { for (let i = 0; i < tries; i++) { if (await page.evaluate(fn, arg)) return true; await W(gap); } return false; };
const ctaState = () => page.evaluate(() => { const b = document.querySelector(".screen.active .btn.cta"); return { text: b?.textContent?.trim() ?? "", enabled: !!b && !b.disabled }; });
const cta = async () => { await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click()); await W(650); };
const vis = (sel) => page.evaluate((s) => { const e = [...document.querySelectorAll(".screen.active " + s)].find((x) => x.offsetParent !== null && !x.disabled && !x.hidden); return !!e; }, sel);
const click = (sel) => page.evaluate((s) => { const e = [...document.querySelectorAll(".screen.active " + s)].find((x) => x.offsetParent !== null && !x.disabled && !x.hidden); if (!e) return false; e.click(); return true; }, sel);
const center = (sel) => page.evaluate((s) => { const e = [...document.querySelectorAll(".screen.active " + s)].find((x) => x.offsetParent !== null && !x.disabled); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);

async function measure(where) {
  const m = await page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    const step = document.querySelector(".screen.active .step");
    const seen = (e) => e.offsetParent !== null && getComputedStyle(e).visibility !== "hidden";
    const taps = [...step.querySelectorAll("button, input[type=range]")].filter((e) => seen(e) && !e.disabled && !e.hidden && !e.classList.contains("opn-g2u1-hit")).map((e) => ({ h: Math.round(e.getBoundingClientRect().height), t: (e.textContent || "").trim().slice(0, 14) })).filter((x) => x.h < 47.5);
    const cut = [...step.querySelectorAll(".bv-choice-t, .bv-ans-t, .bv-card b, .bv-card i, .bv-title, .bv-btn, .opn-title, .g2u1x-seg-b")].filter(seen).filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent.trim());
    const helper = step.querySelector(".bv-helper");
    const small = [...step.querySelectorAll(".bv-stage text, .bv-stage div")].filter((e) => e.children.length === 0 && e.textContent.trim()).map((e) => {
      const r = e.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(e).fontSize);
      const k = e instanceof SVGElement ? e.ownerSVGElement.getBoundingClientRect().width / e.ownerSVGElement.viewBox.baseVal.width : 1;
      return { t: e.textContent.trim().slice(0, 10), px: Math.round(fs * k * 10) / 10, on: r.width > 0 && getComputedStyle(e).opacity !== "0" };
    }).filter((x) => x.on && x.px < 11.9);
    const curio = step.querySelector(".curio");
    return { content: sc.scrollHeight - (curio ? Math.ceil(curio.getBoundingClientRect().height) + 12 : 0), taps, cut, small, helperOver: helper ? helper.scrollHeight > helper.clientHeight + 1 : false, text: step.innerText + " " + (document.querySelector(".screen.active .btn.cta")?.textContent ?? "") };
  });
  texts += "\n" + m.text;
  ok(m.content <= BUDGET, `${where}: 높이 ${m.content} > ${BUDGET}`);
  ok(m.taps.length === 0, `${where}: 낮은 버튼 ${JSON.stringify(m.taps)}`);
  ok(m.cut.length === 0, `${where}: 잘린 글 ${JSON.stringify(m.cut)}`);
  ok(m.small.length === 0, `${where}: 작은 글자 ${JSON.stringify(m.small)}`);
  ok(!m.helperOver, `${where}: 도움말이 두 줄을 넘음`);
  return m;
}

async function hold(sel, maxMs, until) {
  const p = await center(sel);
  if (!p) return false;
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    await W(120);
    if (await until()) break;
  }
  await page.mouse.up();
  return true;
}

async function runOpener(id) {
  const scene = await ds("opnScene");
  ok(await waitFor(() => document.querySelector(".screen.active .step")?.dataset.opnPhase === "ask"), `${id} 도입(${scene}): 예측이 뜨지 않음`);
  await W(300);
  await measure(`${id} 도입 예측`);
  await shot(`${id}-0-ask`);
  await click(".hook-choice");
  ok(await waitFor(() => document.querySelector(".screen.active .step")?.dataset.opnPhase === "play"), `${id} 도입: 조작이 열리지 않음`);
  await W(300);
  await measure(`${id} 도입 조작`);
  for (let i = 0; i < 40; i++) {
    if ((await ds("opnPhase")) === "done") break;
    if (await vis(".opn-g2u1-hit")) { await click(".opn-g2u1-hit"); await W(500); continue; }
    const t = await page.evaluate(() => { const b = document.querySelector(".screen.active .opn-g2u1-btn"); return b && !b.disabled ? b.textContent : ""; });
    if (t.startsWith("꾹")) await hold(".opn-g2u1-btn", 6000, async () => (await ds("opnP")) === "1.00");
    else if (t) { await click(".opn-g2u1-btn"); await W(350); }
    else await W(300);
  }
  ok((await ds("opnPhase")) === "done", `${id} 도입(${scene}): 끝나지 않음`);
  await W(500);
  await measure(`${id} 도입 끝`);
  await shot(`${id}-1-done`);
  const c = await ctaState();
  ok(c.enabled, `${id} 도입: 끝 버튼이 열리지 않음`);
  await cta();
}

let labNo = 0;
async function runLab(id) {
  labNo += 1;
  const tag = `${id} 랩${labNo}`;
  const name = await page.evaluate(() => document.querySelector(".screen.active .bv-title")?.textContent ?? "");
  await W(300);
  await measure(`${tag} 처음`);
  await shot(`${id}-L${labNo}-0-first`);
  let wrong = false;
  let acts = 0;
  let midShot = false;
  for (let i = 0; i < 500; i++) {
    if (await vis(".bv-done.show")) break;
    if (await vis(".bv-q.show .bv-next")) { await click(".bv-q.show .bv-next"); await W(500); continue; }
    if (await vis(".bv-q.show .bv-choice[data-ok='1']")) {
      await measure(`${tag} 판정`);
      if (!wrong) {
        wrong = true;
        await shot(`${id}-L${labNo}-2-judge`);
        await click(".bv-q.show .bv-choice[data-ok='0']");
        await W(450);
        const v = await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-vd")?.textContent ?? "");
        ok(v === "오답이에요", `${tag}: 오답 표시가 없음(${v})`);
        ok(await vis(".bv-q.show .bv-ans.no"), `${tag}: 오답 뒤 정답 카드가 없음`);
        await measure(`${tag} 오답`);
        await shot(`${id}-L${labNo}-3-wrong`);
      } else {
        await click(".bv-q.show .bv-choice[data-ok='1']");
        await W(450);
        await measure(`${tag} 정답`);
      }
      continue;
    }
    if (await vis(".bv-q.show .bv-choice")) { await click(".bv-q.show .bv-choice"); await W(900); continue; } // 예측
    const todo = await ds("todo");
    if (!todo) { await W(150); continue; }
    const kind = await page.evaluate((s) => { const e = [...document.querySelectorAll(".screen.active " + s)].find((x) => x.offsetParent !== null && !x.disabled); return !e ? "" : e.matches("input[type=range]") ? "range" : e.classList.contains("g2u1x-hold") ? "hold" : "tap"; }, todo);
    if (!kind) { await W(150); continue; }
    acts += 1;
    if (kind === "range") {
      const v = Number(await ds("todoVal"));
      await page.evaluate(({ s, v }) => { const e = document.querySelector(".screen.active " + s); e.value = String(v); e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); }, { s: todo, v });
    } else if (kind === "hold") await hold(todo, 7000, async () => (await ds("todo")) !== todo);
    else await click(todo);
    await W(260);
    if (acts % 3 === 0) await measure(`${tag} 조작 ${acts}`);
    if (!midShot && acts === 5) { midShot = true; await shot(`${id}-L${labNo}-1-mid`); }
  }
  ok(await vis(".bv-done.show"), `${tag}(${name}): 결론까지 가지 못함 (todo=${await ds("todo")})`);
  ok(wrong, `${tag}(${name}): 판정이 한 번도 없었음`);
  await W(300);
  await measure(`${tag} 결론`);
  await shot(`${id}-L${labNo}-4-done`);
  const c = await ctaState();
  ok(c.enabled, `${tag}: 끝 버튼이 열리지 않음`);
  await cta();
}

async function answerQuiz(id) {
  const found = await page.evaluate(() => {
    const strip = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, ""); };
    const s = document.querySelector(".screen.active .step");
    const here = s.innerText.replace(/\s+/g, "");
    const unit = window.__g2u1v5;
    if (!unit) return { err: "단원 표(window.__g2u1v5)가 없음" };
    for (const l of unit.lessons) for (const st of l.steps) {
      if (st.type !== "quiz") continue;
      if (!here.includes(strip(st.prompt).slice(0, 40))) continue;
      const mode = st.mode ?? "mcq";
      if (mode === "ox") s.querySelector(st.answer ? ".ox-btn.o" : ".ox-btn.x")?.click();
      else for (const a of Array.isArray(st.answer) ? st.answer : [st.answer]) s.querySelector(`.opt[data-oi="${a}"]`)?.click();
      return { mode, q: strip(st.prompt).slice(0, 24) };
    }
    return { err: "단원 표에서 이 문항을 찾지 못함" };
  });
  if (found.err) return ok(false, `${id} 문제: ${found.err}`);
  await W(250);
  if (!(await ctaState()).enabled) return ok(false, `${id} 문제(${found.q}): 확인하기가 열리지 않음`);
  await cta();
  const shown = await waitFor(() => { const t = document.querySelector(".screen.active .sheet-title"); return !!t && t.offsetParent !== null && t.textContent.trim().length > 0; }, null, 40);
  if (!shown) return ok(false, `${id} 문제(${found.q}): 채점 시트가 뜨지 않음`);
  const title = await page.evaluate(() => document.querySelector(".screen.active .sheet-title").textContent.trim());
  texts += "\n" + (await page.evaluate(() => document.querySelector(".screen.active .sheet-card")?.innerText ?? ""));
  ok(title === "정답이에요", `${id} 문제(${found.q}): "${title}"로 채점됨`);
  await W(300);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .sheet-card .btn")].find((b) => b.offsetParent !== null)?.click());
  await W(500);
}

async function open(id, v5 = true) {
  await page.goto(`${BASE}/?g2u1v5${v5 ? "" : "=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await waitFor(() => { const s = document.querySelector(".screen.active .step"); return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load")); }, null, 200);
  await W(600);
}

for (const id of LIST) {
  console.log(`\n== ${id} ==`);
  labNo = 0;
  let quizzes = 0;
  const kinds = [];
  await open(id);
  for (let n = 0; n < 40; n++) {
    const k = await page.evaluate(() => {
      const sc = document.querySelector(".screen.active");
      if (!sc || sc.id === "sc-done" || sc.id === "sc-home") return "home";
      const s = sc.querySelector(".step");
      if (!s) return "";
      if (s.classList.contains("opn-step")) return "opener";
      if (s.classList.contains("g2u1x-step")) return "lab";
      if (s.querySelector(".opts, .ox-grid")) return "quiz";
      if (s.querySelector(".hook-scene")) return "hook";
      return "read";
    });
    if (k === "home" || !k) break;
    kinds.push(k);
    if (k === "opener") await runOpener(id);
    else if (k === "lab") await runLab(id);
    else if (k === "quiz") { quizzes += 1; await answerQuiz(id); }
    else {
      const t = await page.evaluate(() => document.querySelector(".screen.active .step")?.innerText ?? "");
      texts += "\n" + t;
      // 개념과 정리의 '자세히' 글도 모은다
      texts += "\n" + (await page.evaluate(() => [...document.querySelectorAll(".screen.active .step [class*='more']")].map((e) => e.textContent).join("\n")));
      if (n === kinds.length - 1 && SHOTS && /과학 용어 정복하기/.test(t)) await shot(`${id}-W${n}`);
      if ((await ctaState()).enabled) await cta();
      else if (!(await click(".xbtn.fwd"))) { ok(false, `${id}: ${n}번째 스텝(${t.slice(0, 20)})에서 나아가지 못함`); break; }
      else await W(500);
    }
  }
  console.log(`  스텝: ${kinds.join(" ")}  (문제 ${quizzes})`);
  ok(kinds[0] === "opener", `${id}: 첫 스텝이 새 도입이 아님(${kinds[0]})`);
  ok(kinds.includes("lab"), `${id}: 새 랩이 없음`);
  ok(!kinds.includes("hook"), `${id}: 옛 훅이 남음`);
}

// 글 규칙
const bad = [];
if (/[—–]/.test(texts)) bad.push("대시: " + (texts.match(/.{0,14}[—–].{0,14}/) ?? [""])[0]);
if (/ - /.test(texts)) bad.push("삽입구 하이픈: " + (texts.match(/.{0,14} - .{0,14}/) ?? [""])[0]);
if (/교과서/.test(texts)) bad.push("'교과서'");
if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(texts)) bad.push("이모지나 기호: " + (texts.match(/.{0,10}[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}].{0,10}/u) ?? [""])[0]);
ok(bad.length === 0, "글 규칙: " + bad.join(" / "));

// 토글을 끈 화면
if (!lessons.length) {
  await open("g2u1l1", false);
  const off = await page.evaluate(() => { const s = document.querySelector(".screen.active .step"); return { hook: !!s?.querySelector(".hook-scene"), opn: !!s?.classList.contains("opn-step") }; });
  ok(off.hook && !off.opn, `토글을 끈 화면: 첫 스텝이 옛 훅이 아님(${JSON.stringify(off)})`);
}
ok(errors.length === 0, "페이지 오류: " + errors.slice(0, 5).join(" | "));
console.log(`\n검사 ${checks}건, 실패 ${fails.length}건`);
await browser.close();
process.exit(fails.length ? 1 : 0);
