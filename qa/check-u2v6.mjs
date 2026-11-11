// 중1 Ⅱ v6(개념 글을 다시 쓴 판) 단원 검사. 서버 없이 빌드한 번들(dist)을 브라우저의 요청 가로채기로 내준다.
//   390×700에서 열 레슨의 모든 스텝을 검토 모드의 앞으로 가기 화살표로 넘기며
//   · 개념 스텝과 정리 스텝이 뜨는지, 그림이 모두 뜨는지, 페이지 오류가 없는지
//   · 개념 스텝의 길이(스크롤 높이, 글자 수, 용어 카드 수)를 재고 한 장씩 찍는다
//   · 화면 글 전체(정리 카드의 '자세히' 포함)를 모아 언어 검사를 한다
//   · 모은 글을 JSON으로 남긴다(토글을 끈 판이 정본과 같은지 견줄 때 쓴다)
// 실행: npm run build 뒤
//   node qa/check-u2v6.mjs v6   [캡처 폴더]   새 판(?u2v6)
//   node qa/check-u2v6.mjs base [캡처 폴더]   토글을 끈 판
//   node qa/check-u2v6.mjs same a.json b.json 두 번 모은 글이 같은지 견준다(레슨, 스텝, 글자. 섞이는 보기의 차례는 빼고)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const MODE = process.argv[2] ?? "v6";
if (MODE === "same") {
  // 문제의 보기와 랩의 예측 보기는 열 때마다 차례가 섞인다. 그래서 스텝마다 글자를 정렬해 견준다(차례만 다른 것은 같다고 본다).
  const norm = (f) => JSON.stringify(JSON.parse(readFileSync(f, "utf8")).map((d) => ({ ...d, text: [...d.text].sort().join("") })));
  const a = norm(process.argv[3]);
  const b = norm(process.argv[4]);
  console.log(a === b ? "같음: 두 판의 스텝 수와 종류, 제목, 버튼 글, 화면 글이 같다(섞이는 보기의 차례만 빼고)" : "다름: 두 판의 화면 글이 다르다");
  process.exit(a === b ? 0 : 1);
}
const OUT = process.argv[3] ?? `qa/shots/u2v6-${MODE}`;
mkdirSync(OUT, { recursive: true });
const BASE = "http://u2v6.test";
const QUERY = MODE === "v6" ? "?u2v6" : "";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon", ".mp3": "audio/mpeg" };
const A = ".screen.active";

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL " + msg); } };

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/navigator\.vibrate|Failed to load resource/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {}, lastUnits: { "sci:g1": "u2" } }));
});
await page.route(BASE + "/**", (route) => {
  const u = new URL(route.request().url());
  const rel = u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname.slice(1));
  const f = join("dist", rel);
  if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
  return route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
});
const W = (ms) => page.waitForTimeout(ms);

await page.goto(`${BASE}/${QUERY}`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("#sc-splash", { timeout: 15000 });
await W(500);
await page.mouse.click(195, 300);
const browse = page.locator("button", { hasText: "한번 둘러보기" }).first();
await browse.waitFor({ state: "visible", timeout: 10000 });
await browse.click();
await page.waitForSelector("#sc-home", { timeout: 10000 });
await W(700);

async function openNode(i) {
  const nodes = page.locator("#sc-home .gm-node:not(.exam)");
  await nodes.nth(i).waitFor({ state: "visible", timeout: 10000 });
  await nodes.nth(i).scrollIntoViewIfNeeded();
  await nodes.nth(i).click();
  await page.waitForSelector(`${A} .step`, { timeout: 10000 });
  await W(700);
}
async function forward() {
  const can = await page.evaluate(() => {
    const b = document.querySelector(".screen.active .xbtn.fwd");
    if (!b || getComputedStyle(b).visibility !== "visible" || getComputedStyle(b).display === "none") return false;
    b.click();
    return true;
  });
  if (can) await W(520);
  return can;
}
async function brokenImages() {
  for (let i = 0; i < 20; i++) {
    const bad = await page.evaluate(() => [...document.querySelectorAll(".screen.active .step img")].filter((im) => !(im.complete && im.naturalWidth > 0)).map((im) => im.getAttribute("src") || ""));
    if (!bad.length) return [];
    if (i === 19) return bad;
    await W(150);
  }
  return [];
}
/** 지금 스텝의 종류와 글, 길이 */
const read = () =>
  page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    const sc = document.querySelector(".screen.active .scroll");
    const kind = s.classList.contains("opn-step") ? "opener" : s.querySelector(".rc-cards") ? "recap" : s.querySelector(".kicker") && s.querySelector(".h1") && !s.querySelector(".opts") ? "concept" : s.classList.contains("bv-step") ? "lab" : "other";
    // 화면 글: 숨은 글(정리 카드의 '자세히')도 읽도록 textContent로 모은다. 그림 속 글자는 뺀다
    const clone = s.cloneNode(true);
    clone.querySelectorAll("svg, style, script").forEach((e) => e.remove());
    const text = clone.textContent.replace(/\s+/g, " ").trim();
    const cta = document.querySelector(".screen.active .lfooter .btn, .screen.active footer .btn")?.textContent.trim() ?? "";
    // 전과 후 문서에 쓸 글(개념과 정리만): 블록의 차례와 종류를 살려 뽑는다
    const tx = (e) => (e ? e.textContent.replace(/\s+/g, " ").trim() : "");
    let struct = null;
    if (kind === "concept") {
      struct = { title: tx(s.querySelector(".h1")), lead: tx(s.querySelector(".sub")), blocks: [] };
      for (const b of s.querySelectorAll(".c-figure, .term-card, .c-note, .c-list")) {
        if (b.classList.contains("c-figure")) struct.blocks.push(b.querySelector("img") ? `(컷) ${tx(b.querySelector(".c-figure-cap"))}` : `(그림) ${tx(b.querySelector(".c-figure-cap"))}`);
        else if (b.classList.contains("term-card")) struct.blocks.push(`**${tx(b.querySelector(".term-name"))}**: ${tx(b.querySelector(".term-def"))}`);
        else if (b.classList.contains("c-note")) struct.blocks.push(`(메모) ${tx(b)}`);
        else struct.blocks.push(...[...b.querySelectorAll("li")].map((li) => `(목록) ${tx(li)}`));
      }
    } else if (kind === "recap") {
      struct = { title: tx(s.querySelector(".h1")), narrator: tx(s.querySelector(".comic-bubble")), cards: [], note: tx(s.querySelector(".rc-note, .c-callout, .c-note")) };
      for (const c of s.querySelectorAll(".rc-card")) {
        const m = c.querySelector(".rc-more")?.cloneNode(true);
        if (m) {
          m.querySelectorAll(".rm-h").forEach((x) => (x.textContent = ` ▸${x.textContent.trim()}: `));
          m.querySelectorAll(".fun").forEach((x) => (x.textContent = ` ▸${x.textContent.trim()}`));
        }
        struct.cards.push({ name: tx(c.querySelector(".rc-name")), text: tx(c.querySelector(".rc-text")), ex: [...(c.querySelector(".rc-ex")?.children ?? [])].map(tx), more: tx(m).split("▸").map((x) => x.trim()).filter(Boolean) });
      }
    }
    return {
      kind,
      struct,
      title: s.querySelector(".h1, .bv-title, .opn-title")?.textContent.trim() ?? "",
      text,
      cta,
      chars: text.length,
      terms: s.querySelectorAll(".term-card").length,
      notes: s.querySelectorAll(".c-note").length,
      cut: !!s.querySelector(".c-figure img"),
      cards: s.querySelectorAll(".rc-card").length,
      arts: s.querySelectorAll(".rc-card .rc-art").length,
      mores: [...s.querySelectorAll(".rc-more")].map((m) => m.textContent.length),
      heads: [...s.querySelectorAll(".rc-more")].map((m) => m.querySelectorAll(".rm-h").length),
      content: sc.scrollHeight,
      view: sc.clientHeight,
    };
  });

const dump = [];
const metrics = [];
const structs = [];
const WANT_OPENERS = ["u2l2", "u2l3", "u2l4", "u2l5", "u2l6", "u2l8", "u2l9", "u2l10"];
for (let li = 0; li < 10; li++) {
  const id = `u2l${li + 1}`;
  await openNode(li);
  const kinds = [];
  let n = 0, nc = 0;
  for (;;) {
    const r = await read();
    const bad = await brokenImages();
    ok(bad.length === 0, `${id} 스텝 ${n + 1}(${r.kind}): 안 뜬 그림 ${bad.join(", ")}`);
    kinds.push(r.kind);
    dump.push({ id, n, kind: r.kind, title: r.title, cta: r.cta, text: r.text });
    if (r.struct) structs.push({ id, kind: r.kind, cta: r.cta, ...r.struct });
    if (r.kind === "concept") {
      nc++;
      metrics.push({ id, kind: "개념", title: r.title, chars: r.chars, terms: r.terms, notes: r.notes, cut: r.cut, screens: +(r.content / r.view).toFixed(2) });
      if (MODE === "v6") {
        ok(r.terms >= 1 && r.terms <= 3, `${id} 개념 "${r.title}": 용어 카드 ${r.terms}장`);
        ok(r.notes <= 1, `${id} 개념 "${r.title}": 메모 ${r.notes}개`);
      }
      // 긴 화면도 한 장에 담기게 잠깐 창을 늘려 찍는다
      await page.setViewportSize({ width: 390, height: Math.max(700, r.content + 160) });
      await W(250);
      await page.screenshot({ path: join(OUT, `${id}-concept${nc}.png`) });
      await page.setViewportSize({ width: 390, height: 700 });
      await W(150);
    }
    if (r.kind === "recap") {
      metrics.push({ id, kind: "정리", title: r.title, chars: r.chars, cards: r.cards, mores: r.mores.join("/"), screens: +(r.content / r.view).toFixed(2) });
      ok(r.cards >= 2 && r.cards <= 4, `${id} 정리: 카드 ${r.cards}장`);
      ok(r.arts === r.cards, `${id} 정리: 미니 그림 ${r.arts}/${r.cards}`);
      if (MODE === "v6") {
        ok(r.mores.length === r.cards && r.mores.every((m) => m >= 400 && m <= 800), `${id} 정리: '자세히' 길이 ${r.mores.join("/")}`);
        ok(r.heads.every((h) => h >= 2 && h <= 4), `${id} 정리: 소제목 수 ${r.heads.join("/")}`);
      }
      await page.screenshot({ path: join(OUT, `${id}-recap.png`) });
    }
    n++;
    if (!(await forward())) break;
  }
  ok(kinds.includes("concept") && kinds.includes("recap"), `${id}: 개념 또는 정리 스텝이 없다(${kinds.join(",")})`);
  if (MODE === "v6" && WANT_OPENERS.includes(id)) ok(kinds[0] === "opener", `${id}: 첫 스텝이 새 도입이 아니다(${kinds[0]})`);
  if (MODE === "base") ok(!kinds.includes("opener"), `${id}: 토글을 껐는데 새 도입이 보인다`);
  console.log(`  ${id}: ${kinds.join(" → ")}`);
  await page.locator(`${A} .lheader .xbtn[aria-label="닫기"]`).click();
  await page.waitForSelector("#sc-home.active", { timeout: 10000 }).catch(() => {});
  await W(500);
}
ok(errors.length === 0, `페이지 오류: ${errors.slice(0, 3).join(" | ")}`);

// 언어 검사(화면 글 전체). 옛 표기 '미토콘드리아'는 "예전 책에는" 하고 알려 주는 문장 하나만 허용한다.
const RULES = [
  [/[—–]/, "대시"],
  [/[가-힣a-zA-Z0-9] - [가-힣a-zA-Z]/, "삽입구 하이픈"],
  [/교과서/, "교과서"],
  [/분자/, "분자"],
  [/액포|세포질/, "이 책에 없는 구조"],
  [/자연\s?선택|진화/, "자연선택, 진화"],
  [/\p{Extended_Pictographic}/u, "이모지"],
  [/(합니다|입니다|습니다)[.!]/, "해요체가 아님"],
];
let lang = 0;
for (const d of dump) {
  if (MODE === "v6" && d.kind !== "concept" && d.kind !== "recap") continue; // 새로 쓴 글만 엄격히 본다(랩과 문제는 정본 그대로다)
  for (const [re, name] of RULES) {
    const m = d.text.match(re);
    if (m && MODE === "v6") { lang++; console.log(`  LANG ${d.id} ${d.kind} "${d.title}": ${name} … ${d.text.slice(Math.max(0, m.index - 20), m.index + 24)}`); }
  }
  if (MODE === "v6") {
    const mito = d.text.match(/미토콘드리아/g) ?? [];
    if (mito.length > 1 || (mito.length === 1 && !/예전 책에는 '미토콘드리아'/.test(d.text))) { lang++; console.log(`  LANG ${d.id} ${d.kind}: 미토콘드리아 표기`); }
  }
}
if (MODE === "v6") ok(lang === 0, `언어 검사 ${lang}건`);

writeFileSync(join(OUT, "texts.json"), JSON.stringify(dump, null, 1));
writeFileSync(join(OUT, "metrics.json"), JSON.stringify(metrics, null, 1));
writeFileSync(join(OUT, "struct.json"), JSON.stringify(structs, null, 1));
console.log("\n길이(화면 = 스크롤 높이 ÷ 보이는 높이)");
for (const m of metrics) console.log(`  ${m.id} ${m.kind} ${m.kind === "개념" ? `용어 ${m.terms} · 메모 ${m.notes} · ${m.chars}자 · ${m.screens}화면${m.cut ? "" : " · 컷 없음"}` : `카드 ${m.cards} · 자세히 ${m.mores}자 · ${m.screens}화면`}  ${m.title}`);
console.log(`\n[${MODE}] 통과 ${pass} · 실패 ${fail}`);
await browser.close();
process.exit(fail ? 1 : 0);
