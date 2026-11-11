// 중1 Ⅲ v5의 개념, 정리, 문제 검사와 글 뽑기.
//   1 레슨마다 스텝을 차례로 넘기며 문제(quiz)를 정답으로 풀어 "정답이에요"로 채점되는지 본다(개발 서버의 data-oi).
//   2 새 개념 스텝과 정리가 열리는지, 페이지 오류가 없는지 본다.
//   3 새로 쓴 문제의 글이 단원 종합 평가의 시험 풀(content/exams/u3*.ts)과 16자 넘게 겹치는지 본다.
//   4 글을 뽑는다: 정답 없는 문제지, 정답표, 개념과 정리 글의 전과 후.
// 실행(dev 서버): PORT=5573 node qa/check-u3v5-quiz.mjs [글을 둘 폴더]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5573";
const BASE = `http://localhost:${PORT}`;
const OUT = process.argv[2] ?? "qa/shots/u3v5-text";
mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("  FAIL " + m); } };
const W = (ms) => page.waitForTimeout(ms);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "warning" && /\[v5\]/.test(m.text())) errors.push("warn: " + m.text()); });
await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
});
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

// ── 내용 읽기(화면이 아니라 내용 모듈에서) ──
await page.goto(`${BASE}/?u3v5`, { waitUntil: "domcontentloaded" });
await W(1500);
const data = await page.evaluate(async () => {
  const strip = (s) => ({ ...s, figure: s.figure ? "(그림)" : undefined, blocks: s.blocks, cards: s.cards?.map((c) => ({ name: c.name, text: c.text, examples: c.examples, more: c.more })) });
  const v5 = (await import("/src/content/unit3v5.ts")).UNIT3_V5;
  const base = (await import("/src/content/unit3.ts")).UNIT3;
  const exams = [];
  for (const f of ["u3l1", "u3l2", "u3l3", "u3l4", "u3l5"]) {
    const m = await import(`/src/content/exams/${f}.ts`);
    exams.push(JSON.stringify(Object.values(m)));
  }
  const pack = (u) => u.lessons.map((l) => ({ id: l.id, title: l.title, steps: l.steps.map(strip) }));
  return { v5: pack(v5), base: pack(base), exams: exams.join("\n") };
});
const plain = (s) => String(s ?? "").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

// ── 1, 2 실플레이 ──
for (const L of data.v5) {
  console.log(L.id);
  await page.goto(`${BASE}/?u3v5&open=${L.id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!document.querySelector(".screen.active .step"), null, { timeout: 20000 });
  await W(900);
  for (let i = 0; i < L.steps.length; i++) {
    const s = L.steps[i];
    await page.evaluate(() => document.querySelectorAll(".snack, .toast").forEach((e) => e.remove()));
    if (s.type === "quiz") {
      const shown = await page.evaluate(() => document.querySelector(".screen.active .step")?.textContent ?? "");
      ok(shown.replace(/\s+/g, "").includes(plain(s.prompt).replace(/\s+/g, "").slice(0, 12)), `${L.id} ${i}: 문제가 화면에 없음(${plain(s.prompt).slice(0, 20)})`);
      if (s.mode === "ox") await page.evaluate((a) => document.querySelector(`.screen.active .ox-btn.${a ? "o" : "x"}`)?.click(), s.answer);
      else for (const a of [].concat(s.answer)) await page.evaluate((x) => document.querySelector(`.screen.active .opts .opt[data-oi="${x}"]`)?.click(), a);
      await W(250);
      await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
      await W(1100);
      const t = await page.evaluate(() => document.querySelector(".screen.active .sheet-title")?.textContent ?? "");
      ok(t === "정답이에요", `${L.id} ${i}: 정답을 눌렀는데 "${t}" (${plain(s.prompt).slice(0, 24)})`);
      await page.evaluate(() => [...document.querySelectorAll(".screen.active .sheet button, .screen.active .sheet .btn")].pop()?.click());
      await W(700);
    } else {
      if (s.type === "concept") ok(await page.evaluate(() => document.querySelectorAll(".screen.active .step .term, .screen.active .step [class*=term]").length > 0), `${L.id} ${i}: 개념 스텝에 용어 카드가 없음`);
      if (s.type === "recap") ok(await page.evaluate(() => document.querySelectorAll(".screen.active .step [class*=rc-]").length > 0), `${L.id} ${i}: 정리 스텝이 그려지지 않음`);
      if (i < L.steps.length - 1) {
        await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
        await W(650);
      }
    }
  }
}

// ── 3 시험 풀과의 겹침(새로 쓴 문제만) ──
const baseTexts = new Set(data.base.flatMap((l) => l.steps.filter((s) => s.type === "quiz").map((s) => s.prompt)));
const fresh = data.v5.flatMap((l) => l.steps.filter((s) => s.type === "quiz" && !baseTexts.has(s.prompt)).map((s) => ({ id: l.id, s })));
const examPlain = plain(data.exams).replace(/\s+/g, "");
for (const { id, s } of fresh) {
  for (const t of [s.prompt, ...(s.options ?? [])]) {
    const p = plain(t).replace(/\s+/g, "");
    let hit = "";
    for (let i = 0; i + 16 <= p.length && !hit; i++) if (examPlain.includes(p.slice(i, i + 16))) hit = p.slice(i, i + 16);
    ok(!hit, `${id}: 시험 풀과 겹치는 글 "${hit}"`);
  }
}
console.log(`새로 쓴 문제 ${fresh.length}개`);

// ── 4 글 뽑기 ──
const letters = "①②③④⑤";
let blind = "# 중1 Ⅲ 열 v5 문제지(정답 없음)\n\n보기의 차례는 저작 차례다(화면에서는 섞인다). 그림 문항은 그림 없이 글만 있다.\n";
let key = "# 정답표\n";
for (const L of data.v5) {
  blind += `\n## ${L.id} ${L.title}\n`;
  let n = 0;
  for (const s of L.steps) {
    if (s.type === "quiz") {
      n++;
      const isNew = !baseTexts.has(s.prompt);
      blind += `\n${L.id}-${n}. ${isNew ? "[새 문항] " : ""}${s.figure ? "[그림 문항] " : ""}(${s.mode === "ox" ? "맞으면 O, 틀리면 X" : s.mode === "multi" ? "모두 고르기" : "하나 고르기"}) ${plain(s.prompt)}\n`;
      (s.options ?? []).forEach((o, i) => (blind += `   ${letters[i]} ${plain(o)}\n`));
      key += `${L.id}-${n}: ${s.mode === "ox" ? (s.answer ? "O" : "X") : [].concat(s.answer).map((a) => letters[a]).join(", ")}${isNew ? " (새 문항)" : ""}\n`;
    }
  }
}
writeFileSync(join(OUT, "quiz-blind.md"), blind);
writeFileSync(join(OUT, "quiz-key.md"), key);

const cardText = (c) => `- **${c.name}**: ${plain(c.text)}${c.examples ? ` (예: ${c.examples.join(", ")})` : ""}`;
let ba = "# 중1 Ⅲ 열: 개념 글의 전과 후\n\n전: 지금 운영 판(`unit3.ts`). 개념 스텝이 없고 설명은 정리 카드에만 있다.\n후: v5(`unit3v5.ts`, `?u3v5`). 랩 뒤에 용어 카드(개념 스텝)를 새로 넣고 정리 카드의 핵심 문장과 쌤의 말을 새 랩에 맞춰 고쳤다.\n정리 카드의 '자세히'(펼치는 글)는 정본을 이어 쓰고 옛 랩을 가리키던 문장만 바꿨다(바꾼 문장은 레슨마다 적었다).\n";
for (let i = 0; i < data.v5.length; i++) {
  const L = data.v5[i], B = data.base[i];
  const rb = B.steps.find((s) => s.type === "recap"), ra = L.steps.find((s) => s.type === "recap"), c = L.steps.find((s) => s.type === "concept");
  ba += `\n## ${L.id} ${L.title}\n\n### 전: 정리 카드\n\n쌤의 말: ${plain(rb.narrator)}\n\n${rb.cards.map(cardText).join("\n")}\n`;
  ba += `\n### 후: 개념 스텝(새로 넣음) 「${plain(c.title)}」\n\n${plain(c.lead)}\n\n${c.blocks.map((b) => (b.k === "term" ? `- **${b.name}**: ${plain(b.def)}` : `- 메모: ${plain(b.html)}`)).join("\n")}\n`;
  ba += `\n### 후: 정리 카드\n\n쌤의 말: ${plain(ra.narrator)}\n\n${ra.cards.map(cardText).join("\n")}\n`;
  const changed = ra.cards.map((cd, k) => (cd.more !== rb.cards[k].more ? cd.name : null)).filter(Boolean);
  ba += `\n'자세히'에서 문장을 바꾼 카드: ${changed.length ? changed.join(", ") : "없음"}\n`;
}
writeFileSync(join(OUT, "concept-before-after.md"), ba);

ok(errors.length === 0, `페이지 오류와 경고: ${errors.slice(0, 5).join(" | ")}`);
console.log(`\n통과 ${pass} · 실패 ${fail}`);
await browser.close();
process.exit(fail ? 1 : 0);
