// 부모용 소개 페이지 미디어 생산 — ① 마케팅 GIF 5종 → 애니 webp ② 홈 걷기 연출 녹화 → 애니 webp
// ③ 단원 종합 평가(문항·결과 진단) 실플레이 캡처 ④ 오답노트(실제 u3 문항 스냅샷 시드) 캡처.
// PORT=<dev포트> node qa/make-about-media.mjs → public/about/*.webp
// answerCurrent/playExam은 qa/e2e-exam-u3.mjs 정본을 이식(dev 전용 data-ans 사용).
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = process.env.PORT || "5173";
const GIF_DIR = "D:/Brilliant Science/output/marketing-video";
fs.mkdirSync("public/about", { recursive: true });
fs.mkdirSync("qa/shots", { recursive: true });

// ── ① GIF → 애니메이션 webp(480w·12fps) ──
const GIFS = [
  ["gif-heat-particles.gif", "lab-heat.webp"],
  ["gif-boyle-syringe.gif", "lab-boyle.webp"],
  ["gif-color-mix.gif", "lab-color.webp"],
  ["gif-moon-phase.gif", "lab-moon.webp"],
  ["gif-laser-reflect.gif", "lab-laser.webp"],
];
for (const [src, out] of GIFS) {
  execFileSync("ffmpeg", ["-y", "-i", path.join(GIF_DIR, src), "-vf", "fps=12,scale=480:-2:flags=lanczos", "-c:v", "libwebp", "-q:v", "60", "-compression_level", "6", "-loop", "0", "-an", `public/about/${out}`], { stdio: "pipe" });
  console.log(`gif→webp ${out} (${Math.round(fs.statSync(`public/about/${out}`).size / 1024)}KB)`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const STUB = "export const createHotContext=()=>({accept(){},dispose(){},prune(){},on(){},send(){}});export function updateStyle(id,css){let s=document.querySelector(`style[data-vite-dev-id=\"${id}\"]`);if(!s){s=document.createElement('style');s.setAttribute('data-vite-dev-id',id);document.head.appendChild(s)}s.textContent=css}export function removeStyle(){}export function injectQuery(u){return u}";

const SEED_BASE = {
  version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
  premium: false, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null,
  totalXp: 340, lifeXp: 340, minigame: {}, lastUnits: { "sci:g1": "u3" }, recentUnitId: "u3",
};
const done = { done: true, acc: 1, xp: 120 };

async function boot(page) {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.waitForSelector("#sc-splash", { timeout: 25000 });
  await page.mouse.click(210, 300);
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click());
  await page.waitForSelector("#sc-home", { timeout: 15000 });
  await page.waitForTimeout(900);
}

async function prep(page, seed) {
  await page.route("**/@vite/client", (route) => route.fulfill({ contentType: "application/javascript", body: STUB }));
  await page.addInitScript((s) => localStorage.setItem("science-app.v1", JSON.stringify(s)), seed);
}

// ── ② 홈 걷기 연출 녹화(__walkHome DEV 훅) → 지도 영역 크롭 애니 webp ──
{
  const vidDir = "qa/tmp-walkvid";
  fs.rmSync(vidDir, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, recordVideo: { dir: vidDir, size: { width: 420, height: 900 } } });
  const page = await ctx.newPage();
  await prep(page, { ...SEED_BASE, lessons: { u3l1: done, u3l2: done } });
  await boot(page);
  await page.evaluate(() => window.__walkHome("u3l2"));
  await page.waitForTimeout(5200);
  await ctx.close(); // close가 비디오를 저장한다
  const vid = fs.readdirSync(vidDir).find((f) => f.endsWith(".webm"));
  if (vid) {
    // 녹화는 페이지 로드 시점부터라 앞부분은 스플래시·부팅이다 — 걷기(__walkHome 이후)는 영상
    // 꼬리에 있으니 전체 길이를 재서 끝에서 4.3초를 자른다(앞에서 자르면 사업자 정보가 섞이는 실사고).
    const dur = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path.join(vidDir, vid)]).toString());
    const ss = Math.max(0, dur - 4.3).toFixed(2);
    execFileSync("ffmpeg", ["-y", "-ss", ss, "-t", "4.1", "-i", path.join(vidDir, vid), "-vf", "crop=420:448:0:380,fps=12", "-c:v", "libwebp", "-q:v", "62", "-compression_level", "6", "-loop", "0", "-an", "public/about/walkmap.webp"], { stdio: "pipe" });
    console.log(`walkmap.webp (${Math.round(fs.statSync("public/about/walkmap.webp").size / 1024)}KB, 원본 ${dur.toFixed(1)}s의 꼬리)`);
  } else console.log("걷기 비디오 미생성 — 건너뜀(블록2는 정적 map.webp 폴백)");
}

// ── ③ 단원 종합 평가 — 문항(그림 문항 사냥) + 20문항 실플레이 → 결과 진단 ──
async function answerCurrent(page, correct) {
  return page.evaluate(async (correct) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const a = document.querySelector(".screen.active");
    const q = a.querySelector(".ex-q");
    if (!q) return { err: "no-q" };
    const type = q.dataset.type;
    const ans = JSON.parse(q.dataset.ans);
    if (type === "mcq") {
      const opts = [...a.querySelectorAll(".opts .opt")];
      (correct ? opts.find((o) => +o.dataset.oi === ans) : opts.find((o) => +o.dataset.oi !== ans)).click();
    } else if (type === "multi") {
      const opts = [...a.querySelectorAll(".opts .opt")];
      if (correct) for (const oi of ans) { opts.find((o) => +o.dataset.oi === oi).click(); await sleep(45); }
      else { const w = opts.map((o) => +o.dataset.oi).find((x) => !ans.includes(x)); opts.find((o) => +o.dataset.oi === w).click(); }
    } else if (type === "num") {
      const val = correct ? String(ans) : "999";
      for (const ch of val) { [...a.querySelectorAll(".mnp-k")].find((k) => k.textContent.trim() === ch)?.click(); await sleep(35); }
    } else {
      const chips = [...a.querySelectorAll(".ex-chip")];
      (correct ? chips.find((c) => c.dataset.w === String(ans)) : chips.find((c) => c.dataset.w !== String(ans))).click();
    }
    return { type };
  }, correct);
}
{
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  await prep(page, { ...SEED_BASE, lessons: { u3l1: done, u3l2: done } });
  await boot(page);
  await page.evaluate(() => document.querySelector(".screen.active .gm-node.exam").click());
  await page.waitForSelector(".screen.active .ex-title", { timeout: 8000 });
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
  await page.waitForTimeout(700);

  let figShot = false;
  for (let i = 0; i < 20; i++) {
    await page.waitForSelector(".screen.active .ex-q", { timeout: 8000 });
    if (!figShot) {
      const hasFig = await page.evaluate(() => !!document.querySelector(".screen.active .ex-q svg, .screen.active .ex-q img"));
      if (hasFig || i === 0) {
        await page.waitForTimeout(500);
        await page.screenshot({ path: "qa/shots/about-exam.png" });
        if (hasFig) figShot = true; // 그림 문항을 만나면 그걸로 확정(1번은 임시)
      }
    }
    const r = await answerCurrent(page, i < 15);
    if (r.err) throw new Error(`${r.err} at q${i + 1}`);
    await page.waitForTimeout(160);
    await page.evaluate(() => document.querySelector(".screen.active .btn.cta").click());
    await page.waitForTimeout(340);
  }
  await page.waitForSelector(".screen.active .ex-score-hero", { timeout: 10000 });
  await page.waitForTimeout(1100);
  await page.screenshot({ path: "qa/shots/about-examresult.png" });
  await page.evaluate(() => document.querySelector(".screen.active .ex-diag-row")?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: "qa/shots/about-examdiag.png" });
  await page.close();
  console.log("exam 3샷 완료");
}

// ── ④ 오답노트 — 실제 u3 문항 스냅샷 시드(복습 탭 → 오답노트) ──
{
  const note = (key, lessonId, q, opts, answer, explain, overcome = false) => ({
    key, kind: "lesson", srcId: lessonId, lessonId, type: "mcq", q, opts, answer: [answer],
    explain, hasFigure: false, wrongCount: 1, overcome, ts: Date.now() - 3600e3,
  });
  const seed = {
    ...SEED_BASE, premium: true, lessons: { u3l1: done, u3l2: done },
    wrongNotes: {
      "l:u3l1:a1": note("l:u3l1:a1", "u3l1", "온도가 나타내는 것으로 가장 옳은 것은?",
        ["물체의 크기가 변하는 정도", "물체를 구성하는 입자의 개수", "물체를 구성하는 입자 운동의 활발한 정도", "물체가 빛을 내보내는 정도", "물체를 구성하는 입자 하나의 무게"], 2,
        "온도의 정체는 입자 운동의 활발한 정도예요. 같은 양의 물이라도 입자가 활발히 움직이면 뜨겁고, 둔하게 움직이면 차갑죠."),
      "l:u3l2:a2": note("l:u3l2:a2", "u3l2", "온도계로 물의 온도를 잴 때, 온도계 눈금이 멈출 때까지 기다렸다가 읽는 까닭은?",
        ["온도계와 물이 열평형이 될 때까지 기다리는 것이다", "물의 입자가 모두 멈출 때까지 기다리는 것이다", "온도계 속 액체가 증발할 시간을 주는 것이다", "물의 온도를 더 높이기 위한 것이다", "온도계 유리를 데우지 않기 위한 것이다"], 0,
        "온도계는 열평형을 이용하는 도구예요. 물과 온도계 사이에 열이 이동하다가 온도가 같아지면(열평형) 눈금이 멈추고, 그 값이 물의 온도가 돼요."),
      "l:u3l1:a3": note("l:u3l1:a3", "u3l1", "실온에 두었던 음료수를 냉장고에 넣어 두면, 음료수를 구성하는 입자의 운동은 어떻게 될까요?",
        ["점점 활발해진다", "점점 둔해진다", "아무 변화가 없다", "활발해졌다가 다시 둔해진다", "입자가 완전히 멈춘다"], 1,
        "온도가 낮아지면 입자 운동은 둔해져요. 주의! 입자가 완전히 멈추는 건 아니에요 — 차가운 물속 입자도 느리게나마 계속 움직이고 있어요.", true),
    },
  };
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  await prep(page, seed);
  await boot(page);
  await page.evaluate(() => {
    [...document.querySelectorAll(".gnav-item")].find((b) => b.querySelector(".gnav-tx")?.textContent === "복습")?.click();
  });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((b) => b.textContent.includes("오답노트"))?.click();
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: "qa/shots/about-notebook.png" });
  await page.close();
  console.log("notebook 샷 완료");
}

// ── 정적 PNG → webp(640w) — process-geo.mjs 캔버스 문법 ──
const conv = await browser.newPage();
for (const name of ["about-exam", "about-examresult", "about-examdiag", "about-notebook"]) {
  const p = `qa/shots/${name}.png`;
  if (!fs.existsSync(p)) continue;
  const b64 = fs.readFileSync(p).toString("base64");
  const out = await conv.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = `data:image/png;base64,${b64}`; });
    const w = 640, h = Math.round((img.height / img.width) * w);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/webp", 0.86).split(",")[1];
  }, b64);
  const file = `public/about/${name.replace("about-", "")}.webp`;
  fs.writeFileSync(file, Buffer.from(out, "base64"));
  console.log(`saved ${file} (${Math.round(fs.statSync(file).size / 1024)}KB)`);
}
await browser.close();
console.log("done");
