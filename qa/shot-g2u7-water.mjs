// 중2 Ⅶ 레슨 3 물길 랩(g2u7WaterLab)의 가로 화면을 찍는다: 폰(세로로 든 폰에서 90도 돌린 무대, 바로 세워 저장)과 PC(1920×1080).
// 시점: 세로 랩 → 가로 화면을 연 직후 → 빈 곳을 누른 직후 → 짝 둘을 찾은 뒤.
// 시점 4: 남은 짝을 모두 찾고 "세게"를 누른 뒤(위 물길이 높아져 이름표가 상태 줄에 가장 가까운 때).
// 실행: PORT=<dev 포트> node qa/shot-g2u7-water.mjs <출력 폴더> [접두] [--views phone,pc,phone360,phoneSE]   (접두 기본 "shot", 예: before, after)
// 세운 그림은 파이썬 PIL로 돌린다(없으면 돌리지 않은 원본만 남는다).
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const PORT = process.env.PORT || "5781";
const BASE = `http://localhost:${PORT}`;
const argv = process.argv.slice(2);
const vi = argv.indexOf("--views");
const pick = vi >= 0 ? argv[vi + 1].split(",") : ["phone", "pc"];
const pos = argv.filter((a, i) => !a.startsWith("--") && (vi < 0 || i !== vi + 1));
const OUT = pos[0] || "qa/shots/g2u7-water";
const TAG = pos[1] || "shot";
mkdirSync(OUT, { recursive: true });

const SEED = () => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
};

const VIEWS = [
  { name: "phone", viewport: { width: 390, height: 700 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  { name: "pc", viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  { name: "phone360", viewport: { width: 360, height: 780 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  { name: "phoneSE", viewport: { width: 375, height: 553 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, // 아이폰 SE 사파리(주소 막대와 아래 막대가 높이를 먹은 때)
].filter((v) => pick.includes(v.name));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
for (const v of VIEWS) {
  const ctx = await browser.newContext({ viewport: v.viewport, deviceScaleFactor: v.deviceScaleFactor, isMobile: v.isMobile, hasTouch: v.hasTouch });
  await ctx.addInitScript(SEED);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${v.name}: ${e.message}`));
  await page.goto(`${BASE}/?open=g2u7l3`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!document.querySelector(".screen.active .step"), null, { timeout: 20000 });
  await page.waitForTimeout(900);
  // 검토 모드의 앞으로 가기로 물길 랩까지
  for (let i = 0; i < 6; i++) {
    const has = await page.evaluate(() => [...document.querySelectorAll(".screen.active .bv-ctl button")].some((b) => b.textContent.includes("가로 화면")));
    if (has) break;
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, `${TAG}-${v.name}-0-portrait.png`) });
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .bv-ctl button")].find((b) => b.textContent.includes("가로 화면"))?.click());
  await page.waitForTimeout(1600);

  /** 무대 좌표(가로 기준)를 화면 좌표로 바꿔 실제 마우스(또는 손가락)로 누른다. */
  const tap = async (x, y) => {
    const p = await page.evaluate(({ x, y }) => {
      const r = document.querySelector(".rot-stage").getBoundingClientRect();
      const native = document.querySelector(".rot-inner").classList.contains("native");
      return native ? { x: r.left + x, y: r.top + y } : { x: r.right - y, y: r.top + x };
    }, { x, y });
    if (v.hasTouch) await page.touchscreen.tap(p.x, p.y);
    else {
      await page.mouse.move(p.x, p.y);
      await page.mouse.down();
      await page.waitForTimeout(40);
      await page.mouse.up();
    }
  };
  const shots = [];
  const shot = async (label) => {
    const file = join(OUT, `${TAG}-${v.name}-${label}.png`);
    await page.screenshot({ path: file });
    shots.push(file);
  };
  await shot("1-open");
  // 빈 곳(가운데 금 근처 위쪽, 어느 자리에도 들지 않는 곳)
  const size = await page.evaluate(() => { const c = document.querySelector(".g2u7x-wcv"); return { w: c.clientWidth, h: c.clientHeight }; });
  const hits = await page.evaluate(() => document.querySelector(".g2u7x-wcv").__hits?.() ?? {});
  const free = (() => {
    const inAny = (x, y) => Object.values(hits).some((rs) => rs.some(([rx, ry, rw, rh]) => x >= rx - 14 && x <= rx + rw + 14 && y >= ry - 14 && y <= ry + rh + 14));
    for (let y = size.h * 0.3; y < size.h * 0.75; y += 8)
      for (let x = size.w * 0.06; x < size.w * 0.94; x += 8) if (!inAny(x, y) && Math.abs(x - size.w / 2) > 30) return { x, y };
    return { x: size.w * 0.5 - 40, y: size.h * 0.4 };
  })();
  await tap(free.x, free.y);
  await page.waitForTimeout(350);
  await shot("2-miss");
  // 짝 둘(펌프는 왼쪽 그림에서, 수도꼭지는 오른쪽 그림의 스위치로)
  for (const [k, side] of [["pump", 0], ["tap", 1]]) {
    const r = hits[k]?.[side];
    if (r) await tap(r[0] + r[2] / 2, r[1] + r[3] / 2);
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(500);
  await shot("3-two");
  // 남은 짝(높이 차는 오른쪽 전압, 흐름은 오른쪽 전류, 물레방아는 왼쪽)을 찾고 세게
  for (const [k, side] of [["gap", 1], ["flow", 1], ["wheel", 0]]) {
    const now = await page.evaluate(() => document.querySelector(".g2u7x-wcv").__hits?.() ?? {});
    const r = now[k]?.[side];
    if (r) await tap(r[0] + r[2] / 2, r[1] + r[3] / 2);
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => document.querySelector('.g2u7x-wbar [data-k="2"]')?.click());
  await page.waitForTimeout(900);
  await shot("4-all");
  // 폰은 무대가 90도 돌아 있으니 바로 세운 그림도 남긴다(시계 반대로 90도)
  if (v.name.startsWith("phone")) {
    for (const f of shots) {
      try {
        execFileSync("python", ["-c", "import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]); im.rotate(90, expand=True).save(sys.argv[1].replace('.png','-up.png'))", f]);
      } catch (e) {
        console.log("  돌리기 실패(PIL 없음?): " + f);
      }
    }
  }
  const say = await page.evaluate(() => document.querySelector(".g2u7x-wsay")?.textContent ?? "");
  console.log(`${v.name}: 무대 ${size.w}×${size.h}, 빈 곳 (${Math.round(free.x)}, ${Math.round(free.y)}), 상태 줄 "${say}"`);
  await ctx.close();
}
await browser.close();
if (errors.length) console.log("페이지 오류: " + errors.join(" | "));
console.log(`저장: ${OUT}`);
