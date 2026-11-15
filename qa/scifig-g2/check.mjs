// 앱 검사: 그림이 실린 스텝을 폰(390×700)과 넓은 화면(1180×760)에서 열어 그림이 뜨는지, 페이지 오류, 그림이 한 화면을 넘는지 본다.
//   PORT=5761 node qa/scifig-g2/check.mjs [저장 폴더] [키 …]
//   DIST=<개발 모드 번들 폴더> node qa/scifig-g2/check.mjs [저장 폴더]   (서버 없이, qa/sketch/lib/app.mjs 방식)
// 그림 자리는 내용 파일을 묶어 읽어 찾는다(개념 스텝의 그림 블록, 정리 카드의 자세히). 넓은 화면은 store.wideOff 없이 자동 전환된다.
import { build } from "esbuild";
import { pathToFileURL, fileURLToPath } from "node:url";
import { writeFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { launch, phone, openLesson, BASE } from "../sketch/lib/app.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const args = process.argv.slice(2);
const SAVE = args[0] && !/^g2u\d/.test(args[0]) ? args[0] : "";
const only = args.filter((a) => /^g2u\d/.test(a));

// ── 그림 자리 찾기 ──
const spots = [];
for (let u = 1; u <= 8; u++) {
  const out = await build({
    entryPoints: [join(REPO, `src/content/g2/unit${u}.ts`)], bundle: true, format: "esm", write: false, platform: "neutral",
    define: { "import.meta.env": JSON.stringify({ BASE_URL: "/", DEV: false }) }, logLevel: "silent", loader: { ".css": "empty" },
  });
  const f = join(mkdtempSync(join(tmpdir(), "scifigchk-")), "b.mjs");
  writeFileSync(f, out.outputFiles[0].text);
  const mod = await import(pathToFileURL(f).href);
  const unit = Object.values(mod).find((v) => v && v.lessons);
  for (const L of unit.lessons) {
    L.steps.forEach((s, i) => {
      const keysIn = (html) => [...String(html).matchAll(/scifig\/g2\/u\d\/(g2u\d+l\d+f\d+)\.webp/g)].map((m) => m[1]);
      if (s.type === "concept") {
        const keys = (s.blocks || []).flatMap((b) => (b.k === "figure" ? keysIn(b.svg) : []));
        if (keys.length) spots.push({ lesson: L.id, step: i, kind: "concept", keys });
      } else if (s.type === "recap") {
        s.cards.forEach((c, ci) => {
          const keys = keysIn(c.more || "");
          if (keys.length) spots.push({ lesson: L.id, step: i, kind: "recap", card: ci, keys });
        });
      }
    });
  }
}
const todo = spots.filter((s) => !only.length || s.keys.some((k) => only.includes(k)));
console.log(`그림 자리 ${todo.length}곳 (그림 ${todo.reduce((n, s) => n + s.keys.length, 0)}장)`);
if (SAVE) mkdirSync(SAVE, { recursive: true });

let fails = 0;
const say = (ok, msg) => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
};

const browser = await launch();
for (const size of [{ width: 390, height: 700, tag: "phone" }, { width: 1180, height: 760, tag: "wide" }]) {
  const P = await phone(browser, size); // 1180×760은 가로라 넓은 화면으로 자동 전환된다(core/wide.ts의 미디어 조건)
  for (const s of todo) {
    const name = `${s.lesson} 스텝${s.step}${s.kind === "recap" ? ` 카드${s.card}` : ""} [${s.keys.join(",")}] ${size.tag}`;
    try {
      await openLesson(P.page, s.lesson);
      for (let k = 0; k < s.step; k++) {
        await P.page.click(".screen.active .xbtn.fwd");
        await P.page.waitForTimeout(160);
      }
      await P.page.waitForTimeout(400);
      if (s.kind === "recap") {
        const card = P.page.locator(".screen.active .rc-card").nth(s.card);
        await card.click();
        await P.page.waitForTimeout(450);
      }
      for (const key of s.keys) {
        const img = P.page.locator(`.screen.active img[src*="${key}.webp"]`).first();
        await img.scrollIntoViewIfNeeded();
        await P.page.waitForFunction((k) => {
          const im = document.querySelector(`.screen.active img[src*="${k}.webp"]`);
          return im && im.complete;
        }, key, { timeout: 8000 }).catch(() => {});
        const info = await img.evaluate((im) => {
          const box = (im.closest(".c-figure") || im.parentElement).getBoundingClientRect();
          const sc = im.closest(".scroll") || document.scrollingElement;
          return { nw: im.naturalWidth, h: Math.round(box.height), w: Math.round(box.width), view: sc ? sc.clientHeight : innerHeight, ih: Math.round(im.getBoundingClientRect().height) };
        });
        say(info.nw > 0, `${name} ${key} 뜸 (natural ${info.nw}, 표시 ${info.w}×${info.ih})`);
        say(info.h <= info.view, `${name} ${key} 한 화면 안 (그림 칸 ${info.h} ≤ 보이는 높이 ${info.view})`);
        if (SAVE) {
          // 검토 모드 안내 스낵이 다음 버튼을 덮지 않게 숨기고 찍는다
          await P.page.addStyleTag({ content: ".snack{display:none!important}" });
          await img.evaluate((im) => im.scrollIntoView({ block: "center" }));
          await P.page.waitForTimeout(250);
          await P.page.screenshot({ path: join(SAVE, `${size.tag}-${key}.png`) });
        }
      }
    } catch (e) {
      say(false, `${name}: ${String(e.message || e).split("\n")[0]}`);
    }
  }
  say(P.errors.length === 0, `${size.tag} 페이지 오류 ${P.errors.length}건${P.errors.length ? ": " + P.errors.slice(0, 3).join(" | ") : ""}`);
  await P.ctx.close();
}
await browser.close();
console.log(fails ? `실패 ${fails}건` : "모두 통과");
process.exit(fails ? 1 : 0);
