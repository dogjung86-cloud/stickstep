// 넓은 화면(태블릿 1180×760, PC 1600×900)에서 복습, 도전, 마이 탭과 시험 안내, 시험 문제를 찍는다. 개발 서버 필요: PORT=<포트> [DUMP=1] node qa/shot-wide-tabs.mjs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const OUT = "../output/tablet-landscape/tabs";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tag = "wide";
const b = await chromium.launch({ channel: "chrome", headless: true });
const dump = (sel) =>
  ((sel) => {
    const walk = (n, d, max) =>
      d > max
        ? ""
        : [...n.children]
            .slice(0, 10)
            .map((c) => {
              const r = c.getBoundingClientRect();
              const cls = typeof c.className === "string" && c.className ? "." + c.className.trim().split(/\s+/).join(".") : "";
              return `${"  ".repeat(d)}${c.tagName.toLowerCase()}${c.id ? "#" + c.id : ""}${cls} [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}]\n${walk(c, d + 1, max)}`;
            })
            .join("");
    const root = document.querySelector(sel);
    return root ? `${sel}\n${walk(root, 1, 3)}` : `${sel} 없음`;
  });
for (const [name, vp] of [["tablet", { width: 1180, height: 760 }], ["pc", { width: 1600, height: 900 }]]) {
  if (process.env.DUMP && name === "pc") continue;
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1.5 });
  await ctx.addInitScript(() => {
    const s = JSON.parse(localStorage.getItem("science-app.v1") || "{}");
    s.onboarded = true;
    s.reviewMode = true; // 잠금 화면이 아니라 실제 내용을 본다
    s.premium = true;
    localStorage.setItem("science-app.v1", JSON.stringify(s));
  });
  const p = await ctx.newPage();
  const go = async (hash) => {
    await p.goto(`http://localhost:${process.env.PORT || 5621}/${hash}`, { waitUntil: "networkidle" });
    await p.addStyleTag({ content: ".snack{display:none!important}" });
    await sleep(1300);
  };
  for (const t of ["review", "challenge", "my"]) {
    await go(`#/${t}`);
    await p.screenshot({ path: `${OUT}/${tag}-${name}-${t}.png` });
    if (process.env.DUMP) console.log(await p.evaluate(dump(), ".screen.active"));
  }
  // 시험: 지도 맨 아래 시험 발판 → 시작 → 첫 문제 → (모두 건너뛰고) 결과
  await go("#/home");
  await p.locator(".unit-tab").nth(2).click(); // Ⅲ 열(시험이 있는 단원)
  await sleep(900);
  const exam = p.locator(".gm-node.exam").first();
  await exam.scrollIntoViewIfNeeded();
  await exam.click();
  await sleep(1500);
  await p.addStyleTag({ content: ".snack{display:none!important}" });
  await p.screenshot({ path: `${OUT}/${tag}-${name}-exam-1-intro.png` });
  if (process.env.DUMP) console.log(await p.evaluate(dump(), ".screen.active"));
  const start = p.locator(".screen.active button", { hasText: /시작|응시|풀기/ }).first();
  if (await start.count()) {
    await start.click();
    await sleep(1500);
    await p.screenshot({ path: `${OUT}/${tag}-${name}-exam-2-question.png` });
    if (process.env.DUMP) console.log(await p.evaluate(dump(), ".screen.active"));
  } else console.log("시험 시작 버튼을 못 찾음");
  console.log("done", tag, name);
  await ctx.close();
}
await b.close();
