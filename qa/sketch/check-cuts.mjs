// 중1 과학 개념 스텝의 스틱맨 컷(코드 그림, scenes/cuts)을 앱에서 확인한다.
//   레슨을 바로 열고(?open=, 개발 모드 전용) 검토 모드의 앞으로 가기(›)로 모든 스텝을 걸어 본다.
//   개념 스텝("과학 용어 정복하기")마다: 첫 블록이 그림인가 · 코드 그림(sketch/cuts/)인가 · 실제로 떴는가 · 캡션이 있는가 · 화면 글 규칙
//   새 판 토글(?g1v5, Ⅱ단원은 v6)을 켠 채 Ⅰ~Ⅶ 전 레슨을 보고, 끈 채 지금 운영 화면인 Ⅱ단원(정본)을 한 번 더 본다.
// 실행: DIST=<개발 모드 번들> node qa/sketch/check-cuts.mjs [저장 폴더] [단원…]   (번들 만드는 법은 lib/app.mjs 머리말)
//   저장 폴더를 주면 개념 스텝 머리(제목부터 그림 캡션까지)를 폰 화면으로 남기고, 단원별 모아 보기 시트(cuts-<단원>.png)를 만든다.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { launch, phone, openLesson, wait } from "./lib/app.mjs";
import { textRules } from "./lib/bubble.mjs";

const [OUT, ...ONLY] = process.argv.slice(2);
if (OUT) mkdirSync(OUT, { recursive: true });
const LESSONS = { u1: 5, u2: 10, u3: 5, u4: 6, u5: 7, u6: 5, u7: 6 };
const units = Object.keys(LESSONS).filter((u) => !ONLY.length || ONLY.includes(u));
const RUNS = [
  { name: "새 판", query: "g1v5", units },
  { name: "정본", query: "g1v5=0", units: units.filter((u) => u === "u2") },
];

const browser = await launch();
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL", msg); } };
const seen = []; // { run, lesson, title, src, cap }

const { ctx, page, errors } = await phone(browser, { width: 390, height: 844 });
for (const run of RUNS) {
  for (const u of run.units) {
    for (let l = 1; l <= LESSONS[u]; l++) {
      const id = `${u}l${l}`;
      await openLesson(page, id, run.query);
      for (let step = 0; step < 60; step++) {
        await wait(page, 260);
        const info = await page.evaluate(() => {
          const s = document.querySelector(".screen.active .step");
          const k = s?.querySelector(":scope > .kicker")?.textContent?.trim() ?? "";
          // 개념 스텝: 머리표가 "과학 용어 정복하기"·"핵심 정리"이거나, 용어 카드가 스텝 바로 아래에 있다
          if (!s || !(/용어 정복|핵심 정리/.test(k) || s.querySelector(":scope > .term-card"))) return null;
          const first = [...s.children].find((e) => !e.matches(".kicker, .h1, .sub"));
          const img = first?.matches(".c-figure") ? first.querySelector("img") : null;
          return {
            title: s.querySelector(":scope > .h1")?.textContent ?? "",
            first: first?.className ?? "(없음)",
            src: img?.getAttribute("src") ?? "",
            complete: !!img?.complete,
            nw: img?.naturalWidth ?? 0,
            cap: first?.querySelector(".c-figure-cap")?.textContent ?? "",
            html: s.innerHTML,
          };
        });
        if (info) {
          if (info.src && !info.complete) {
            await page.waitForFunction(() => document.querySelector(".screen.active .step .c-figure img")?.complete, null, { timeout: 10000 }).catch(() => {});
            info.nw = await page.evaluate(() => document.querySelector(".screen.active .step .c-figure img")?.naturalWidth ?? 0);
          }
          const where = `${run.name} ${id} "${info.title}"`;
          ok(/c-figure/.test(info.first), `${where}: 첫 블록이 그림이 아니다 (${info.first})`);
          if (/c-figure/.test(info.first)) {
            ok(/sketch\/cuts\//.test(info.src), `${where}: 코드 그림이 아니다 (${info.src})`);
            ok(info.nw > 0, `${where}: 그림이 뜨지 않음 (${info.src})`);
            ok(info.cap.trim().length > 0, `${where}: 캡션이 없다`);
          }
          for (const m of textRules(info.html)) ok(false, `${where}: ${m}`);
          seen.push({ run: run.name, lesson: id, title: info.title, src: info.src, cap: info.cap });
          if (OUT && run.name === "새 판") {
            await page.evaluate(() => { const sc = document.querySelector(".screen.active .scroll"); if (sc) sc.scrollTop = 0; document.getAnimations().forEach((a) => a.cancel()); });
            await wait(page, 120);
            const clip = await page.evaluate(() => {
              const s = document.querySelector(".screen.active .step");
              const fig = s.querySelector(".c-figure") ?? s.querySelector(":scope > .h1");
              const a = s.getBoundingClientRect(), b = fig.getBoundingClientRect();
              return { x: 0, y: Math.max(0, a.top - 8), width: innerWidth, height: Math.min(innerHeight, b.bottom + 10) - Math.max(0, a.top - 8) };
            });
            const name = `${id}-${seen.filter((x) => x.lesson === id && x.run === "새 판").length}`;
            await page.screenshot({ path: join(OUT, `${name}.png`), clip });
          }
        }
        const moved = await page.evaluate(() => {
          const b = document.querySelector(".screen.active .xbtn.fwd");
          if (!b || getComputedStyle(b).visibility === "hidden" || b.style.display === "none") return false;
          b.click();
          return true;
        });
        if (!moved) break;
      }
    }
  }
}
ok(errors.length === 0, `페이지 오류 ${errors.length}건 ${errors.slice(0, 3).join(" | ")}`);
await ctx.close();

// 모아 보기: 레슨마다 개념 스텝 수와 컷
const byRun = (r) => seen.filter((x) => x.run === r);
console.log(`\n새 판 개념 스텝 ${byRun("새 판").length}개, 코드 그림 컷 ${byRun("새 판").filter((x) => /sketch\/cuts\//.test(x.src)).length}장 | 정본 Ⅱ단원 개념 스텝 ${byRun("정본").length}개`);
for (const x of seen) console.log(`  ${x.run} ${x.lesson} ${x.title.replace(/\s+/g, " ")} → ${x.src ? x.src.replace(/^.*sketch\/cuts\//, "") : "(컷 없음)"}`);

if (OUT) {
  // 단원별 시트: 저장한 폰 화면을 한 장에 모은다
  for (const u of units) {
    const shots = byRun("새 판").map((x, i, all) => ({ ...x, n: all.slice(0, i + 1).filter((y) => y.lesson === x.lesson).length })).filter((x) => x.lesson.startsWith(u + "l"));
    if (!shots.length) continue;
    const cells = shots.map((x) => `<figure><img src="data:image/png;base64,${readFileSync(join(OUT, `${x.lesson}-${x.n}.png`)).toString("base64")}"><figcaption>${x.lesson}${x.n > 1 ? ` (${x.n})` : ""}</figcaption></figure>`).join("");
    const cols = Math.min(4, shots.length);
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#E9ECEF;font:600 15px/1.4 sans-serif}.g{display:grid;grid-template-columns:repeat(${cols},390px);gap:18px;padding:18px;align-items:start}figure{margin:0;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.08)}figure img{display:block;width:390px}figcaption{padding:8px 14px;color:#4E5968}</style><div class="g">${cells}</div>`;
    const sheet = await browser.newPage({ viewport: { width: cols * 408 + 18, height: 900 }, deviceScaleFactor: 1 });
    await sheet.setContent(html, { waitUntil: "load" });
    await sheet.screenshot({ path: join(OUT, `cuts-${u}.png`), fullPage: true });
    await sheet.close();
  }
  writeFileSync(join(OUT, "cuts.json"), JSON.stringify(seen, null, 2));
}
await browser.close();
console.log(`${pass}/${pass + fail} ${fail ? "FAIL" : "ALL PASS"}`);
process.exit(fail ? 1 : 0);
