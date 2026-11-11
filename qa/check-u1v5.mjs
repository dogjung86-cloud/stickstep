// 중1 Ⅰ v5(랩 재제작) 단원 검사: 390×700에서 세 레슨(u1l2, u1l4, u1l5)의 도입과 랩을 처음부터 끝까지 한 길로 가 본다.
// 랩마다 판정에서 한 번 틀려 보고, 시점마다(처음, 조작 중, 판정, 오답, 결론) 한 화면(554px) 안인지, 글이 잘리지 않는지,
// 누르는 곳이 48px 이상인지, 무대 글자가 12px 이상인지, 끝 버튼으로 다음 스텝이 열리는지, 페이지 오류가 없는지 본다.
// 그 길에서 모은 화면 글에 대시, '교과서', 이모지, '분자'가 없는지도 본다. 끝에 토글을 끈 채 u1l2가 정본으로 열리는지 본다.
//
// 실행(dev 서버):  PORT=5571 node qa/check-u1v5.mjs [캡처 폴더]
// 실행(서버 없이): DIST=tmp/dist-dev BASE=http://u1v5.test node qa/check-u1v5.mjs [캡처 폴더]
//   서버 없는 방식은 개발 모드로 빌드한 번들을 요청 가로채기로 내준다(바로 열기 ?open= 과 정답 표식은 개발 모드에만 있다):
//   NODE_ENV=development npx vite build --mode development --outDir tmp/dist-dev
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";
import { W, cta, ctaState, tap, waitFor, ds, waitDs, waitAsk, pickWrong, pickRight, tapNext, wrongCard, concluded, waitDone, measure } from "./u2v5-lib.mjs";
import { measure as measureOpener, choose, stagePt, waitPhase } from "./u2intro-lib.mjs";

const PORT = process.env.PORT || "5571";
const DIST = process.env.DIST || "";
const BASE = process.env.BASE || `http://localhost:${PORT}`;
const OUT = process.argv[2] ?? "qa/shots/u1v5";
mkdirSync(OUT, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".mp3": "audio/mpeg" };

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + msg);
  }
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error" && !/navigator\.vibrate/.test(m.text())) errors.push("console: " + m.text());
});
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
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
  // 다른 세션이 파일을 저장해도 화면이 다시 읽히지 않게 HMR만 끈다(CSS 주입은 살린다)
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

const texts = new Set();
const collect = async () => {
  const t = await page.evaluate(() => {
    const out = [];
    const root = document.querySelector(".screen.active");
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const p = n.parentElement;
      if (!p || !p.getClientRects().length) continue;
      const s = n.textContent.trim();
      if (s) out.push(s);
    }
    return out;
  });
  t.forEach((s) => texts.add(s));
};
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const stepKind = () =>
  page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    if (!s) return "";
    if (s.classList.contains("opn-step")) return "opener";
    if (s.classList.contains("bv-step")) return "lab:" + (s.querySelector(".bv-stage")?.className.match(/u1[a-z]-stage/)?.[0] ?? "?");
    return "other:" + (s.className || "");
  });

/** 랩의 한 시점을 잰다. */
async function atLab(id, mark, { capture = true } = {}) {
  const m = await measure(page);
  ok(m.total <= m.usable, `${id} ${mark}: 한 화면을 넘음 ${m.total}/${m.usable}`);
  ok(!m.helperOver, `${id} ${mark}: 도움말이 두 줄을 넘음 "${m.helperText}"`);
  ok(!m.slotOver, `${id} ${mark}: 조작 칸이 넘침`);
  ok(m.cut.length === 0, `${id} ${mark}: 잘린 글 ${m.cut.join(" | ")}`);
  ok(m.taps.every((t) => t.h >= 48), `${id} ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 48).map((t) => t.t + " " + t.h).join(", ")}`);
  ok(m.minFont >= 11.9, `${id} ${mark}: 무대 글자 ${m.minFont}px "${m.minFontText}"`);
  ok(m.frameScroll === 0, `${id} ${mark}: 화면이 밀림 ${m.frameScroll}`);
  await collect();
  if (capture) await shot(`${id}-${mark}`);
  console.log(`  ${id} ${mark}: ${m.total}/${m.usable}, 무대 글자 ${m.minFont}px`);
  return m;
}

/** 판정: 한 번 틀리고(오답 화면을 재고) '다음' → 결론까지. */
async function judgeWrong(id) {
  ok(await waitAsk(page), `${id}: 판정 질문이 뜨지 않음`);
  await W(page, 350);
  await atLab(id, "ask");
  const picked = await pickWrong(page);
  ok(!!picked, `${id}: 틀린 보기를 찾지 못함(개발 모드 번들이 아닌가)`);
  await W(page, 500);
  const c = await wrongCard(page);
  ok(c.has && c.adjacent && c.othersGone && c.word === "오답이에요" && c.rowHue === "red" && c.answerShown && c.why.length > 0 && c.nextH >= 48, `${id}: 오답 화면 ${JSON.stringify(c)}`);
  await atLab(id, "wrong");
  await W(page, 1600);
  ok((await concluded(page)) === "", `${id}: '다음'을 누르기 전에 넘어감`);
  await tapNext(page);
  ok(await waitDone(page), `${id}: 결론이 뜨지 않음`);
  await W(page, 450);
  await atLab(id, "done");
}

async function leave(id, wantCta, wantNext) {
  const c = await ctaState(page);
  ok(c.enabled && c.text === wantCta, `${id}: 끝 버튼 "${c.text}" enabled=${c.enabled}`);
  await cta(page);
  await W(page, 400);
  const k = await stepKind();
  ok(wantNext(k), `${id}: 다음 스텝이 열리지 않음(${k})`);
}

// ── 도입(장면은 바탕 그대로. check-u1intro와 같은 길) ──
async function atOpener(id, mark) {
  const m = await measureOpener(page);
  ok(m.content <= m.view && m.scrollTop === 0, `${id} 도입 ${mark}: 스크롤 ${m.content}/${m.view}`);
  ok(m.clipped.length === 0, `${id} 도입 ${mark}: 잘린 글 ${m.clipped.join(" | ")}`);
  await collect();
}
const clickSel = (sel) => page.evaluate((s) => document.querySelector(".screen.active " + s)?.click(), sel);
const OPENERS = {
  u1l2: async () => {
    await choose(page, "검은");
    await W(page, 500);
    const p = await stagePt(page, 150, 126);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await W(page, 3300);
    await page.mouse.up();
  },
  u1l4: async () => {
    await choose(page, "열 번");
    await W(page, 500);
    for (const n of [1, 2, 3]) {
      await clickSel(`.opn-u1-btn[data-n="${n}"]`);
      await W(page, 1900);
    }
  },
  u1l5: async () => {
    await choose(page, "내려가요");
    await W(page, 500);
    await clickSel(".opn-u1-btn.up");
    await W(page, 700);
    await clickSel(".opn-u1-btn.up");
    await W(page, 900);
    await clickSel(".opn-u1-btn.down");
  },
};
async function playOpener(id, wantCta) {
  ok((await stepKind()) === "opener", `${id}: 새 도입으로 열리지 않음(${await stepKind()})`);
  await atOpener(id, "ask");
  await OPENERS[id]();
  ok(await waitPhase(page, "done", 80), `${id}: 도입이 끝나지 않음`);
  await W(page, 1400);
  await atOpener(id, "done");
  await shot(`${id}-opener-done`);
  await leave(`${id} 도입`, wantCta, (k) => k.startsWith("lab:"));
}

// ── 랩 넷 ──
async function playFair(id) {
  await atLab(id, "start");
  // 어긋난 채로 한 번 돌려 본다(실패가 보이는가)
  await tap(page, ".u1f-run");
  ok(await waitDs(page, "u1Phase", "result"), `${id}: 첫 실험이 끝나지 않음`);
  ok((await ds(page, "u1Fair")) === "0", `${id}: 어긋난 실험이 공정하다고 나옴`);
  await W(page, 300);
  await atLab(id, "unfair");
  // 색깔을 같게 한 실험도 한 번(색깔이 같으면 알 수 없다)
  await tap(page, '.u1x-cond[data-k="color"]');
  await tap(page, '.u1x-cond[data-k="water"]');
  await tap(page, '.u1x-cond[data-k="place"]');
  await tap(page, ".u1f-run");
  ok(await waitDs(page, "u1Phase", "result"), `${id}: 둘째 실험이 끝나지 않음`);
  await W(page, 300);
  await atLab(id, "samecolor", { capture: false });
  // 공정하게: 색깔만 다르게
  await tap(page, '.u1x-cond[data-k="color"]');
  await W(page, 200);
  await atLab(id, "set", { capture: false });
  await tap(page, ".u1f-run");
  ok(await waitDs(page, "u1Fair", "1"), `${id}: 공정한 실험이 인정되지 않음`);
  await W(page, 300);
  await atLab(id, "fair");
  await judgeWrong(id);
}

const graphPoint = (temp) =>
  page.evaluate((t) => {
    const svg = document.querySelector(".screen.active .u1g-stage svg");
    const m = svg.getScreenCTM();
    const p = new DOMPoint(190, 186 - (t - 20) * 8.2).matrixTransform(m);
    return { x: p.x, y: p.y };
  }, temp);
async function plot(temp, from) {
  const a = await graphPoint(from);
  const b = await graphPoint(temp);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 6; i++) {
    await page.mouse.move(a.x, a.y + ((b.y - a.y) * i) / 6);
    await W(page, 20);
  }
  if (from !== temp) await shot("u1l2-graph-drag");
  await page.mouse.up();
}
async function playGraph(id) {
  await atLab(id, "start");
  for (let i = 0; i < 6; i++) {
    const want = Number(await ds(page, "u1Target"));
    if (i === 0) {
      // 처음에는 일부러 어긋나게 놓아 본다
      await plot(want - 5, 34);
      await W(page, 250);
      ok((await ds(page, "u1Next")) === "0", `${id}: 어긋난 점이 찍힘`);
      await atLab(id, "miss");
      await W(page, 1000);
    }
    await plot(want, want + 3);
    ok(await waitDs(page, "u1Next", String(i + 1), 20), `${id}: ${i + 1}번째 점이 찍히지 않음(${want})`);
    if (i === 2) await atLab(id, "mid");
  }
  await judgeWrong(id);
}

async function playTech(id) {
  await atLab(id, "start");
  for (const k of ["ar", "iot", "ai", "bio"]) {
    await tap(page, `.u1t-card[data-k="${k}"]`);
    await W(page, 200);
    if (k === "iot") await atLab(id, "iot-off");
    else await atLab(id, `${k}-off`, { capture: false });
    await tap(page, ".u1t-on");
    await W(page, 300);
    await atLab(id, `${k}-on`);
  }
  await judgeWrong(id);
}

async function playClean(id) {
  await atLab(id, "start");
  await tap(page, '.u1c-card[data-k="car"]');
  await W(page, 800);
  ok((await ds(page, "u1Total")) === "85", `${id}: 전기 자동차만 바꿨을 때 배출량 ${await ds(page, "u1Total")}`);
  await atLab(id, "car-first");
  await tap(page, '.u1c-card[data-k="plant"]');
  await W(page, 800);
  await atLab(id, "plant", { capture: false });
  await tap(page, '.u1c-card[data-k="fac"]');
  await W(page, 900);
  await atLab(id, "all");
  await judgeWrong(id);
}

/** 개념 스텝: 용어 카드가 떴는지 보고 화면 글을 모은 뒤 끝 버튼으로 넘어간다. */
async function concept(id, term, wantCta, wantNext) {
  const has = await page.evaluate((t) => {
    const s = document.querySelector(".screen.active .step");
    return !!s && s.textContent.includes("과학 용어 정복하기") && s.textContent.includes(t);
  }, term);
  ok(has, `${id}: 개념 스텝(${term})이 열리지 않음`);
  await collect();
  await shot(`${id}-concept-${term.replace(/\s+/g, "")}`);
  await leave(`${id} 개념(${term})`, wantCta, wantNext);
}
/** 정리 스텝의 첫 화면을 찍고 글을 모은다. */
async function recapShot(id) {
  await W(page, 500);
  await collect();
  await shot(`${id}-recap`);
}

const open = async (id, on = true) => {
  await page.goto(`${BASE}/?u1v5${on ? "" : "=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const s = document.querySelector(".screen.active .step");
    return !!s && (!s.classList.contains("opn-step") || (s.dataset.opnPhase && s.dataset.opnPhase !== "load"));
  }, null, { timeout: 20000 });
  await W(page, 600);
};


// ── 새로 쓴 문제: 정답을 한 번씩 눌러 정답으로 채점되는지만 본다(개발 모드의 data-oi) ──
// key는 문두의 한 토막, ans는 저작 인덱스(복수 선택은 배열), OX는 "o" 또는 "x". 분류, 순서, 짝 잇기는 건너간다.
const QUIZ = {
  u1l1: [
    { key: "실험을 하기 전에 세운", ans: 0 },
    { key: "다르게’ 준 조건", ans: 2 },
    { key: "규칙을 찾은", ans: 3 },
    { key: "식초는 듣지 않았어요", ans: 0 },
  ],
  u1l2: [
    { key: "같게 맞춰야 할 조건", ans: [0, 1, 2] },
    { key: "컵의 재질", ans: 0 },
    { key: "두 컵 (가)와 (나)", ans: 0, figure: true },
  ],
  u1l3: [
    { key: "㉠에 들어갈 기기", ans: 1 },
    { key: "감염된 뒤에", ans: "x" },
  ],
  u1l4: [
    { key: "쓸수록 말을 더 잘", ans: 0 },
    { key: "새로운 문제", ans: [0, 1] },
  ],
  u1l5: [
    { key: "생각보다 적게 줄었어요", ans: 0 },
    { key: "늦추는 데 쓰이는", ans: [0, 1, 2] },
    { key: "업사이클링(새활용)", ans: 0 },
  ],
};
const onQuiz = (key) =>
  page.evaluate((k) => {
    const s = document.querySelector(".screen.active .step");
    return !!s && s.textContent.includes(k) && !!s.querySelector(".opts .opt, .ox-btn");
  }, key);
async function playQuizzes(id) {
  for (const [qi, q] of QUIZ[id].entries()) {
    let found = await onQuiz(q.key);
    for (let i = 0; i < 8 && !found; i++) {
      await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
      await W(page, 520);
      found = await onQuiz(q.key);
    }
    ok(found, `${id} 문제 ${qi + 1}: 찾지 못함("${q.key}")`);
    if (!found) continue;
    await page.evaluate(() => document.querySelectorAll(".snack, .toast").forEach((e) => e.remove()));
    await collect();
    if (q.figure) {
      const figOk = await page.evaluate(() => {
        const f = document.querySelector(".screen.active .q-figure");
        return !!f && !!f.querySelector("svg") && f.getBoundingClientRect().height > 60;
      });
      ok(figOk, `${id} 문제 ${qi + 1}: 그림이 뜨지 않음`);
    }
    await shot(`${id}-q${qi + 1}`);
    if (q.ans === "o" || q.ans === "x") await tap(page, `.ox-btn.${q.ans}`);
    else for (const i of [].concat(q.ans)) {
      await tap(page, `.opts .opt[data-oi="${i}"]`);
      await W(page, 140);
    }
    await W(page, 250);
    await cta(page);
    await W(page, 300);
    const good = await page.evaluate(() => [...document.querySelectorAll(".sheet")].some((s) => s.className.includes("open") && s.className.includes("good")));
    ok(good, `${id} 문제 ${qi + 1}: 정답 시트가 아님("${q.key}")`);
    await collect();
    await page.evaluate(() => {
      const s = [...document.querySelectorAll(".sheet")].find((x) => x.className.includes("open"));
      [...(s?.querySelectorAll("button") ?? [])].pop()?.click();
    });
    await W(page, 560);
  }
}

console.log("u1l1");
await open("u1l1");
await playQuizzes("u1l1");
console.log("u1l3");
await open("u1l3");
await playQuizzes("u1l3");

console.log("u1l2");
await open("u1l2");
await playOpener("u1l2", "공정하게 다시 실험하기");
await playFair("u1l2-fair");
await leave("u1l2-fair", "용어로 정리하기", (k) => k.startsWith("other"));
await concept("u1l2", "변인 통제", "결과를 그래프로", (k) => k === "lab:u1g-stage");
await playGraph("u1l2-graph");
await leave("u1l2-graph", "용어로 정리하기", (k) => k.startsWith("other"));
await concept("u1l2", "자료 해석", "정리하기", (k) => k.startsWith("other"));
await recapShot("u1l2");
await playQuizzes("u1l2");

console.log("u1l4");
await open("u1l4");
await playOpener("u1l4", "기술 켜 보기");
await playTech("u1l4-tech");
await leave("u1l4-tech", "용어로 정리하기", (k) => k.startsWith("other"));
await concept("u1l4", "인공지능", "나머지 두 기술", (k) => k.startsWith("other"));
await concept("u1l4", "사물 인터넷", "정리하기", (k) => k.startsWith("other"));
await recapShot("u1l4");
await playQuizzes("u1l4");

console.log("u1l5");
await open("u1l5");
await playOpener("u1l5", "온실 기체 줄여 보기");
await playClean("u1l5-clean");
await leave("u1l5-clean", "용어로 정리하기", (k) => k.startsWith("other"));
await concept("u1l5", "지구 온난화", "실천 분류하기", (k) => k.startsWith("other"));
await playQuizzes("u1l5");
await collect();

// 글 검사
const all = [...texts];
const bad = all.filter((t) => /[—–]|\s-\s|교과서|분자|\p{Extended_Pictographic}/u.test(t));
ok(bad.length === 0, `금지 글자: ${bad.join(" | ")}`);
console.log(`  모은 글 ${all.length}토막`);

// 토글을 끄면 정본 그대로(첫 스텝이 옛 훅, 둘째 스텝이 분류)
console.log("토글 끔");
await open("u1l2", false);
const off = await page.evaluate(() => {
  const s = document.querySelector(".screen.active .step");
  return { opener: s.classList.contains("opn-step"), hook: !!s.querySelector(".hook-scene") };
});
ok(!off.opener && off.hook, `토글을 껐는데 정본 훅이 아님 ${JSON.stringify(off)}`);
await shot("off-u1l2");

ok(errors.length === 0, `페이지 오류 ${errors.length}건: ${errors.slice(0, 3).join(" / ")}`);
await browser.close();
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
