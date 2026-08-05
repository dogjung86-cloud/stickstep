// v3 컴포지터 촬영 — 다크 무대 + 폰 목업 + 앱 특성 헤드라인, 영상은 playbackRate 배속 재생
// node compose.mjs           (전 비트)  /  BEAT=heat,end node compose.mjs
// 산출: cap2/<beat>/f*.jpg + times.json
import { createRequire } from "module";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// app/package.json의 playwright-core를 재사용(marketing/video → app 두 단계 위)
const requireApp = createRequire(path.join(__dirname, "..", "..", "package.json"));
const { chromium } = requireApp("playwright-core");

const ONLY = (process.env.BEAT || "").split(",").filter(Boolean);
const CAP2 = path.join(__dirname, "cap2");
fs.mkdirSync(CAP2, { recursive: true });
const PORT = 8799;

// 정적 서버(Range 지원 — <video> 재생용)
const MIME = { ".html": "text/html; charset=utf-8", ".mp4": "video/mp4", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
const APP_PUBLIC = path.join(__dirname, "..", "..", "public"); // 엔드카드 브랜드 이미지 소스
const srv = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  // /__app/* → app/public/* (dev 서버 포트에 의존하지 않게 여기서 직접 서빙)
  const p = url.pathname.startsWith("/__app/")
    ? path.join(APP_PUBLIC, decodeURIComponent(url.pathname.slice("/__app/".length)))
    : path.join(__dirname, decodeURIComponent(url.pathname));
  if (!fs.existsSync(p) || !fs.statSync(p).isFile()) { res.writeHead(404); res.end(); return; }
  const size = fs.statSync(p).size;
  const type = MIME[path.extname(p)] || "application/octet-stream";
  const range = req.headers.range;
  if (range) {
    const m = /bytes=(\d+)-(\d*)/.exec(range);
    const a = Number(m[1]), b = m[2] ? Number(m[2]) : size - 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${a}-${b}/${size}`, "Accept-Ranges": "bytes",
      "Content-Length": b - a + 1, "Content-Type": type, "Cache-Control": "no-store",
    });
    fs.createReadStream(p, { start: a, end: b }).pipe(res);
  } else {
    res.writeHead(200, { "Content-Length": size, "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-store" });
    fs.createReadStream(p).pipe(res);
  }
});
await new Promise((ok) => srv.listen(PORT, "127.0.0.1", ok));

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 405, height: 720 }, deviceScaleFactor: 8 / 3 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

let cdp = null, dir = null, n = 0, times = [], on = false;
cdp = await page.context().newCDPSession(page);
cdp.on("Page.screencastFrame", async (ev) => {
  if (on) {
    n += 1;
    times.push(ev.metadata.timestamp);
    fs.writeFileSync(path.join(dir, `f${String(n).padStart(5, "0")}.jpg`), Buffer.from(ev.data, "base64"));
  }
  try { await cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }); } catch {}
});
const rec = {
  start: async (name) => {
    dir = path.join(CAP2, name);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    n = 0; times = []; on = true;
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  },
  stop: async () => {
    on = false;
    try { await cdp.send("Page.stopScreencast"); } catch {}
    fs.writeFileSync(path.join(dir, "times.json"), JSON.stringify(times));
    console.log(`  ${path.basename(dir)}: ${n} frames, ${(times[times.length - 1] - times[0]).toFixed(2)}s`);
  },
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 비트 정의 — [키, 소스 mp4, 배속, 칩, 헤드라인, 강조어, 서브, 글로우, 옵션?]
// 옵션: { preRoll, src2/rate2(한 카드 두 랩 연속 재생 — 컴포지터 v2), hs(헤드 px — 한 줄 카피 축소) }
// 헤드라인은 기본 2줄("|" 강제 줄갈이) — laser·notebook만 의도적 한 줄(2026-08-05 사용자 확정 카피).
const BEATS = [
  ["enter", "b0b-enter", 1.3, "중1·중2 과학 · 수학", "한 스텝 한 스텝|소단원들을 정복하고,", "정복", "레슨부터 단원 종합 평가까지, 한 지도에서", "rgba(255,138,92,.16)"],
  ["heat", "b1-heat", 1.8, "중1 과학 · 열", "과학을 손끝으로|직접 만져 봐요", "손끝", "슬라이더를 밀면 입자 운동이 보여요", "rgba(255,138,92,.15)"],
  // lab2 = 구 matter+boyle 카드 통합(2026-08-05 사용자 지시 — 보일 카피 삭제, 랩 영상은 흡수·각각 배속 업)
  ["lab2", "b2-matter", 2.4, "중1 과학 · 물질의 상태 변화 · 기체", "교과서 속 그림을|눈앞에서 생생하게!", "생생하게", "얼음 녹이기부터 압력 그래프까지 직접 조작해요", "rgba(124,107,255,.17)", { src2: "b3-boyle", rate2: 2.4 }],
  // moon 배속 1.75→1.3: 원속을 5.9s로 잘라(무대 밀림 차단, rebuild-beats 주석) 카드 길이를 유지
  ["moon", "b4-moon", 1.3, "중1 과학 · 3D 우주 랩", "그림으로 외우던 걸|3D로 돌려 보고", "3D", "달을 끌면 위상이 변하는 이유가 보여요", "rgba(74,84,225,.2)"],
  ["laser", "b5-laser", 1.85, "중2 과학 · 빛과 파동", "법칙은 외우지 않고 발견해요!", "발견", "레이저를 돌리면 반사 법칙이 손에 잡혀요", "rgba(46,204,134,.15)", { hs: 24 }],
  // color(빛의 삼원색)·comic(과학사 만화) 비트는 v7에서 제거(2026-08-05) — 복원은 git 8960e20 참조
  ["quiz", "b8-quiz", 1.6, "확실한 피드백", "왜 맞았는지까지 짚어 줘요", "왜", "오답엔 오개념을 바로잡는 해설까지", "rgba(4,180,95,.15)"],
  ["exam", "bE-exam", 1.55, "단원 종합 평가", "배운 단원은|종합 평가로 마무리하고", "종합 평가", "실전처럼 풀고, 약한 소단원까지 진단해요", "rgba(110,168,255,.16)"],
  ["notebook", "bN-note", 1.5, "오답노트", "틀린 문제는 오답노트에서 다시 봐요!", "오답노트", "다시 풀어 맞히면 해결 완료", "rgba(255,183,77,.15)", { hs: 19 }],
];

const runOn = (k) => !ONLY.length || ONLY.includes(k);

for (const [key, src, rate, chip, head, acc, sub, glow, opts = {}] of BEATS) {
  if (!runOn(key)) continue;
  const q = new URLSearchParams({ v: `/beats-raw/${src}.mp4`, chip, head, acc, sub, glow });
  if (opts.src2) { q.set("v2", `/beats-raw/${opts.src2}.mp4`); q.set("rate2", String(opts.rate2 ?? 1.8)); }
  if (opts.hs) q.set("hs", String(opts.hs));
  await page.goto(`http://127.0.0.1:${PORT}/compositor.html?${q}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__ready === true, { timeout: 20000 });
  // 등장 연출은 녹화 밖에서 끝낸다 — 슬라이드 인 시점에 카드가 이미 완성돼 있어야 쇼츠 스와이프처럼 읽힌다
  await page.evaluate(() => window.__reveal());
  await sleep(1450);
  await rec.start(`c-${key}`);
  await sleep(opts.preRoll ?? 200);
  await page.evaluate((r) => window.__go(r), rate);
  await page.waitForFunction(() => window.__ended === true, { timeout: 60000 });
  await sleep(1000);
  await rec.stop();
}

// 다크 엔드카드 — 플립북 프리로드 후 게이트 발사
if (runOn("end")) {
  await page.goto(`http://127.0.0.1:${PORT}/endcard2.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__ready === true, { timeout: 20000 });
  await rec.start("c-end");
  await sleep(150);
  await page.evaluate(() => window.__start());
  await sleep(5400);
  await rec.stop();
}

await browser.close();
srv.close();
console.log("COMPOSE DONE");
