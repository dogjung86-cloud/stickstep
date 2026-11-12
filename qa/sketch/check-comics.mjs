// 코드 그림 만화(scenes/comic-*.mjs)를 앱에서 끝까지 넘겨 보며 기계로 확인한다. 폰 두 크기.
//   컷 수가 장면 파일과 같은가 · 그림이 실제로 떴는가(naturalWidth > 0) · 말풍선이 컷 밖으로 나가거나 서로 겹치지 않는가
//   · 때와 곳 상자가 장면 파일대로 떴는가, 컷 안에 있고 말풍선과 겹치지 않는가 · 단계 배지에 숫자(연도)가 없는가
//   · 화면 글 규칙(대시, '교과서', '너의', '이해에') · 마지막 컷 버튼이 장면 파일의 cta 인가 · 페이지 오류가 없는가
// 실행: DIST=<개발 모드 번들 폴더> node qa/sketch/check-comics.mjs [저장 폴더 또는 -] [레슨…]   (만드는 법은 lib/app.mjs 머리말)
//       PORT=5173 node qa/sketch/check-comics.mjs …   (개발 서버. 도는 동안 src 를 고치지 않는다)
//   V5=1 이면 새 판 토글(?g1v5)을 켠 채 본다(만화는 같아야 한다). 저장 폴더를 주면 컷마다 폰 화면(SHOT, 기본 360x780)을 남긴다.
import { mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { launch, phone, openLesson, wait } from "./lib/app.mjs";
import { textRules } from "./lib/bubble.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARGS = process.argv.slice(2);
const OUT = ARGS[0] && ARGS[0] !== "-" ? ARGS[0] : ""; // 저장하지 않고 레슨만 고르려면 첫 인자에 - 를 준다
const ONLY = ARGS.slice(1);
if (OUT) mkdirSync(OUT, { recursive: true });
const QUERY = process.env.V5 ? "g1v5" : "";
const VIEWS = [{ name: "360x780", width: 360, height: 780 }, { name: "375x812", width: 375, height: 812 }, { name: "390x700", width: 390, height: 700 }];
const SHOT = process.env.SHOT || "360x780"; // 저장 폴더에 남길 폭

// 기대값은 장면 파일에서 읽는다(컷 수, 때와 곳, 마지막 버튼)
const COMICS = [];
for (const f of readdirSync(join(HERE, "scenes")).filter((n) => /^comic-.+\.mjs$/.test(n)).sort()) {
  const id = f.replace(/^comic-|\.mjs$/g, "");
  if (ONLY.length && !ONLY.includes(id)) continue;
  const mod = await import(pathToFileURL(join(HERE, "scenes", f)).href);
  COMICS.push({ id, meta: mod.META ?? {}, panels: mod.panels().map((p) => ({ when: p.when ?? "", whenPos: p.whenPos ?? "tl" })) });
}

const browser = await launch();
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL", msg); } };

for (const vp of VIEWS) {
  const { ctx, page, errors } = await phone(browser, vp);
  for (const c of COMICS) {
    const tag = `${vp.name} ${c.id}`;
    await openLesson(page, c.id, QUERY);
    // 만화가 첫 스텝이 아닌 레슨(도입 뒤에 만화가 오는 중2 g2u3l6 등)은 앞으로 가기로 만화까지 넘긴다
    for (let k = 0; k < 3 && !(await page.$(".screen.active .comic-dots")); k++) { await page.click(".screen.active .xbtn.fwd").catch(() => {}); await wait(page, 500); }
    await page.waitForSelector(".screen.active .comic-dots", { timeout: 15000 }).catch(() => {});
    const n = await page.evaluate(() => document.querySelectorAll(".screen.active .comic-dots i").length);
    ok(n === c.panels.length, `${tag}: 컷 수 ${n} (장면 파일 ${c.panels.length})`);
    const head = await page.evaluate(() => [...document.querySelectorAll(".screen.active .step > .h1, .screen.active .step > .sub, .screen.active .comic-bubble")].map((e) => e.innerHTML).join("\n"));
    for (const m of textRules(head)) ok(false, `${tag} 머리말: ${m}`);
    for (let i = 0; i < n; i++) {
      const where = `${tag} 컷 ${i + 1}`;
      await page.waitForFunction(() => { const im = document.querySelector(".screen.active .comic-img"); return im && im.complete; }, null, { timeout: 15000 }).catch(() => {});
      await wait(page, 250);
      const r = await page.evaluate(() => {
        const box = (e, a) => { const q = e.getBoundingClientRect(); return { l: q.left - a.left, r: a.right - q.right, top: q.top - a.top, bot: a.bottom - q.bottom, x0: q.left, x1: q.right, y0: q.top, y1: q.bottom }; };
        const scr = document.querySelector(".screen.active");
        const im = scr.querySelector(".comic-img"), art = scr.querySelector(".comic-art");
        const a = art.getBoundingClientRect();
        const w = art.querySelector(".comic-when");
        return {
          src: im?.getAttribute("src") ?? "", nw: im?.naturalWidth ?? 0,
          bs: [...art.querySelectorAll(".cut-bubble")].map((b) => ({ t: b.textContent, ...box(b, a) })),
          when: w ? { t: w.textContent, tr: w.classList.contains("tr"), ...box(w, a) } : null,
          stage: scr.querySelector(".comic-badge")?.textContent ?? "",
          text: [".comic-badge", ".comic-title", ".comic-caption", ".term-card"].map((s) => scr.querySelector(".comic-panel " + s)?.innerHTML ?? "").join("\n"),
          cta: scr.querySelector(".btn.cta")?.textContent?.trim() ?? "",
        };
      });
      const want = c.panels[i] ?? { when: "", whenPos: "tl" };
      ok(r.nw > 0 && /sketch\/comics\//.test(r.src), `${where}: 그림이 뜨지 않음 (${r.src})`);
      const hits = (A, B) => !(A.x1 <= B.x0 + 1 || B.x1 <= A.x0 + 1 || A.y1 <= B.y0 + 1 || B.y1 <= A.y0 + 1);
      for (const b of r.bs) ok(b.l >= -1 && b.r >= -1 && b.top >= -1 && b.bot >= -1, `${where}: 말풍선 "${b.t}" 이 컷 밖으로 (왼 ${b.l.toFixed(0)} 오른 ${b.r.toFixed(0)} 위 ${b.top.toFixed(0)})`);
      for (let p = 0; p < r.bs.length; p++) for (let q = p + 1; q < r.bs.length; q++) ok(!hits(r.bs[p], r.bs[q]), `${where}: 말풍선 "${r.bs[p].t}" 과 "${r.bs[q].t}" 이 겹침`);
      if (want.when) {
        ok(r.when && r.when.t === want.when && r.when.tr === (want.whenPos === "tr"), `${where}: 때와 곳 상자가 "${want.when}"(${want.whenPos}) 가 아님 (${JSON.stringify(r.when && { t: r.when.t, tr: r.when.tr })})`);
        if (r.when) {
          ok(r.when.l >= 0 && r.when.r >= 0 && r.when.top >= 0, `${where}: 때와 곳 상자가 컷 밖으로 (왼 ${r.when.l.toFixed(0)} 오른 ${r.when.r.toFixed(0)})`);
          for (const b of r.bs) ok(!hits(r.when, b), `${where}: 때와 곳 상자가 말풍선 "${b.t}" 과 겹침`);
        }
      } else ok(!r.when, `${where}: 장면 파일에 없는 때와 곳 상자가 떴다 (${r.when?.t})`);
      ok(!/\d/.test(r.stage), `${where}: 단계 배지 "${r.stage}" 에 숫자가 있다`);
      for (const m of textRules(r.text)) ok(false, `${where}: ${m}`);
      if (i === n - 1 && c.meta.cta) ok(r.cta === c.meta.cta, `${where}: 마지막 버튼 "${r.cta}" (장면 파일 "${c.meta.cta}")`);
      if (OUT && vp.name === SHOT) {
        await page.evaluate(() => { const el = document.querySelector(".screen.active .comic-dots"); let sc = el?.parentElement; while (sc && !/auto|scroll/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement; if (el && sc) sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 10; });
        await wait(page, 150);
        await page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()));
        await page.screenshot({ path: join(OUT, `${c.id}-cut${i + 1}.png`) });
      }
      if (i < n - 1) {
        await page.evaluate(() => document.querySelector(".screen.active .btn.cta")?.click());
        await wait(page, 420);
      }
    }
  }
  ok(errors.length === 0, `${vp.name}: 페이지 오류 ${errors.length}건 ${errors.slice(0, 3).join(" | ")}`);
  await ctx.close();
}
await browser.close();
console.log(`${pass}/${pass + fail} ${fail ? "FAIL" : "ALL PASS"}`);
process.exit(fail ? 1 : 0);
