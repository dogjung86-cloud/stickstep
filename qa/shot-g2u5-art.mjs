// 중2 Ⅴ 식물과 에너지 랩 열두 판의 무대를 시점마다 찍는다(2026-11-15, 그림 다시 그리기의 고치기 전후 견주기용).
// 폰(390×700, 배율 2)과 PC(1920×940 창, 배율 1, 넓은 화면)에서 같은 조작 순서로 간다. 시점마다 화면 전체와 무대만 따로 저장한다.
// 실행: PORT=<개발 서버 포트> node qa/shot-g2u5-art.mjs <출력 폴더> [phone|pc] [랩 이름들(쉼표), 예: scope,route]
//   세션 저장소 표식을 더하려면 SS='{"ss.x":"1"}'
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const PORT = process.env.PORT || "5771";
const BASE = `http://localhost:${PORT}`;
const OUT = process.argv[2] || "qa/shots/g2u5-art";
const MODE = process.argv[3] || "phone";
const ONLY = (process.argv[4] || "").split(",").filter(Boolean);
const SS = JSON.parse(process.env.SS || "{}");
mkdirSync(OUT, { recursive: true });

const VIEW = MODE === "pc" ? { width: 1920, height: 940, deviceScaleFactor: 1, isMobile: false, hasTouch: false } : { width: 390, height: 700, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: VIEW.width, height: VIEW.height }, deviceScaleFactor: VIEW.deviceScaleFactor, isMobile: VIEW.isMobile, hasTouch: VIEW.hasTouch });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error" && !/navigator\.vibrate|favicon|net::ERR|status of 404/.test(m.text())) errors.push("console: " + m.text());
});
await page.addInitScript((ss) => {
  localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {} }));
  for (const [k, v] of Object.entries(ss)) sessionStorage.setItem(k, v);
}, SS);
// 다른 세션이 파일을 저장해도 페이지가 다시 읽히지 않게 HMR만 끈다(CSS 주입은 살린다)
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

const W = (ms) => page.waitForTimeout(ms);
const kind = () =>
  page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    if (!s) return "";
    if (s.classList.contains("g2u5x-step")) return "lab:" + (s.querySelector(".bv-stage")?.className.match(/g2u5x-(?!stage)[a-z0-9]+/)?.[0].slice(6) ?? "");
    return "other";
  });
const tap = async (sel, wait = 250) => {
  const ok = await page.evaluate((s) => {
    const e = document.querySelector(".screen.active " + s);
    if (!e || e.disabled) return false;
    e.click();
    return true;
  }, sel);
  if (!ok) console.log(`  (누를 수 없음 ${sel})`);
  await W(wait);
};
const K = (k) => `.g2u5x-chipbtn[data-k="${k}"]`;
const S = (k) => `.g2u5x-st-b[data-k="${k}"]`;

async function reach(lesson, lab) {
  await page.goto(`${BASE}/?open=${lesson}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!document.querySelector(".screen.active .step"), null, { timeout: 20000 });
  await W(700);
  for (let i = 0; i < 30; i++) {
    if ((await kind()) === "lab:" + lab) return true;
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await W(450);
  }
  return false;
}
let n = 0;
async function shot(lab, mark) {
  n += 1;
  const base = join(OUT, `${lab}-${String(n).padStart(2, "0")}-${mark}`);
  await page.screenshot({ path: base + ".png" });
  const st = await page.$(".screen.active .bv-stage");
  if (st) await st.screenshot({ path: base + "-stage.png" });
}

const LABS = {
  scope: ["g2u5l1", async (s) => {
    await s("start");
    await tap(K("elodea"), 700);
    await s("elodea");
    await tap(K("lettuce"), 700);
    await s("lettuce");
    await tap(K("onion"), 700);
    await s("onion");
  }],
  supply: ["g2u5l1", async (s) => {
    await s("start");
    await tap(K("light"));
    await tap(K("water"), 500);
    await s("lack");
    await tap(K("co2"), 1900);
    await s("run");
    await tap(K("water"), 500);
    await s("cut");
  }],
  sensor: ["g2u5l2", async (s) => {
    await s("start");
    await tap(K("plant"));
    await tap(K("lid"));
    await tap(K("light"), 400);
    await s("ready");
    await tap(".g2u5x-run", 1200);
    await s("measuring");
    await W(2300);
    await tap(K("light"));
    await tap(".g2u5x-run", 3400);
    await s("both");
  }],
  starch: ["g2u5l2", async (s) => {
    await s("prep");
    await tap(K("box"), 600);
    await s("box");
    await tap(".g2u5x-day", 600);
    await s("bench");
    await tap(K("fire"), 500);
    await s("fire");
    await W(1500);
    await tap(K("bath"), 500);
    await s("pale");
    await tap(K("rinse"));
    await tap(K("drop"), 700);
    await s("blue");
  }],
  design: ["g2u5l3", async (s) => {
    await s("start");
    await tap(".g2u5x-run", 1300);
    await tap(S("temp+"));
    await tap(S("lamp+"));
    await tap(".g2u5x-run", 1300);
    await s("odd");
    await tap(S("temp-"));
    await tap(".g2u5x-run", 1300);
    await tap(S("lamp+"));
    await tap(".g2u5x-run", 1300);
    await tap(S("lamp+"));
    await tap(".g2u5x-run", 1500);
    await s("four");
  }],
  farm: ["g2u5l3", async (s) => {
    await s("start");
    for (let i = 0; i < 5; i++) await tap(S("c+"), 150);
    await W(300);
    await s("flat");
    await tap(S("c-"), 150);
    await tap(".g2u5x-pick", 500);
    await s("temp");
    for (let i = 0; i < 6; i++) await tap(S("t+"), 200);
    await W(300);
    await s("hot");
    await W(1800);
    for (let i = 0; i < 3; i++) await tap(S("t-"), 200);
    await W(300);
    await s("best");
  }],
  dark: ["g2u5l4", async (s) => {
    await s("start");
    await tap(".g2u5x-run", 1200);
    await s("measuring");
    await W(2300);
    await tap(K("root"), 400);
    await s("root");
    await tap(".g2u5x-run", 3400);
    await tap(K("none"));
    await tap(".g2u5x-run", 3400);
    await s("three");
  }],
  sprout: ["g2u5l4", async (s) => {
    await s("start");
    await tap(K("light"), 1700);
    await s("lit");
    await tap(K("o2"), 3000);
    await s("grow");
    await tap(K("light"), 1500);
    for (let i = 0; i < 120; i++) {
      if ((await page.evaluate(() => document.querySelector(".screen.active .step")?.dataset.g5Grow)) === "100") break;
      await W(100);
    }
    await W(400);
    await s("full");
  }],
  light: ["g2u5l5", async (s) => {
    await s("start");
    for (let i = 0; i < 3; i++) await tap(S("lv+"), 200);
    await W(300);
    await s("strong");
    for (let i = 0; i < 2; i++) await tap(S("lv-"), 200);
    await W(300);
    await s("weak");
  }],
  cycle: ["g2u5l5", async (s) => {
    await s("start");
    for (const k of ["빛에너지", "포도당", "산소"]) await tap(K(k), 300);
    await s("half");
    for (const k of ["이산화 탄소", "물", "에너지"]) await tap(K(k), 300);
    await W(400);
    await s("full");
  }],
  route: ["g2u5l6", async (s) => {
    await s("start");
    await tap(K("starch"));
    await tap(K("phloem"));
    await tap(".g2u5x-send", 500);
    await s("starch");
    await W(1600);
    await tap(K("sugar"));
    await tap(K("xylem"));
    await tap(".g2u5x-send", 500);
    await s("xylem");
    await W(1600);
    await tap(K("phloem"));
    await tap(".g2u5x-send", 600);
    await s("open");
    await tap(K("shoot"), 600);
    await s("moving");
    await W(1000);
    for (const k of ["flower", "root"]) await tap(K(k), 1600);
    await s("all");
  }],
  store: ["g2u5l6", async (s) => {
    await s("start");
    await tap(K("sweet"), 500);
    await tap(K("grape"), 500);
    await s("two");
    for (const k of ["potato", "bean", "sesame"]) await tap(K(k), 500);
    await s("five");
  }],
};

for (const [lab, [lesson, run]] of Object.entries(LABS)) {
  if (ONLY.length && !ONLY.includes(lab)) continue;
  n = 0;
  const ok = await reach(lesson, lab);
  console.log(`${lab}: ${ok ? "열림" : "찾지 못함"}`);
  if (!ok) continue;
  await run((mark) => shot(lab, mark));
}
console.log(errors.length ? "페이지 오류: " + errors.slice(0, 6).join(" | ") : "페이지 오류 없음");
await browser.close();
