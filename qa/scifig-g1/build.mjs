// 중1 과학 도해(개념, 정리 카드의 자세히)를 굽는다.
//   node qa/scifig-g1/build.mjs              모든 그림
//   node qa/scifig-g1/build.mjs u3l4f1 ...   고른 그림만
//   옵션: --png-only (public 에 쓰지 않고 검수용 PNG만), --keep (중간 PNG를 지우지 않음)
//
// 그림 하나 = figs/<키>.mjs 하나. 모듈은 meta 와 draw(root, kit)를 내보낸다(브라우저에서 돈다).
// 이 스크립트가 헤드리스 크롬에 가짜 주소(http://fig.local)로 저장소 파일을 물려 그림을 그리게 하고,
// 그림 칸(#fig)을 meta.scale 배로 찍어 PNG를 만든 뒤 Pillow로 webp를 만든다.
//   결과: public/scifig/g1/<단원>/<키>.webp , 검수용 원본 PNG: ../output/sci-figures/g1/png/<키>.png
// 라벨은 그림과 함께 래스터로 굽는다(<img>로 싣는 SVG는 웹 글꼴을 못 써 기기 글꼴로 바뀌기 때문).
import { chromium } from "playwright-core";
import { readFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT_PUBLIC = join(ROOT, "public/scifig/g1");
const OUT_PNG = process.env.SCIFIG_PNG || resolve(ROOT, "../output/sci-figures/g1/png");
const BASE = "http://fig.local";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".woff2": "font/woff2" };
// 브라우저가 읽어도 되는 곳(그 밖은 막는다)
const ALLOW = ["qa/scifig-g1/", "node_modules/three/", "public/photos/", "public/textures/"];

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
let keys = args.filter((a) => !a.startsWith("--"));
const figDir = join(HERE, "figs");
const all = readdirSync(figDir).filter((f) => /^u\d+l\d+f\d+\.mjs$/.test(f)).map((f) => f.replace(/\.mjs$/, "")).sort();
if (!keys.length) keys = all;

function page(key, meta) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.9/variable/pretendardvariable-dynamic-subset.min.css">
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<style>
  html,body{margin:0;background:${meta.bg ?? "#fff"}}
  #fig{position:relative;width:${meta.w}px;height:${meta.h}px;overflow:hidden;background:${meta.bg ?? "#fff"};
    font-family:"Pretendard Variable",Pretendard,"Noto Sans KR","Malgun Gothic",sans-serif;letter-spacing:-.012em}
  #fig > * {position:absolute;left:0;top:0}
</style></head><body><div id="fig"></div>
<script type="module">
  import * as F from "/qa/scifig-g1/figs/${key}.mjs";
  import * as kit from "/qa/scifig-g1/lib/kit.js";
  try {
    await Promise.all([document.fonts.load('700 14px "Pretendard Variable"', "가"), document.fonts.load('500 14px "Pretendard Variable"', "가")]);
    window.__font = document.fonts.check('700 14px "Pretendard Variable"', "가");
    await F.draw(document.getElementById("fig"), kit);
    window.__done = "ok";
  } catch (e) { window.__done = "err: " + (e && e.stack || e); }
</script></body></html>`;
}

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--enable-unsafe-swiftshader", "--log-level=3"] });
mkdirSync(OUT_PNG, { recursive: true });
let fails = 0;
for (const key of keys) {
  if (!all.includes(key)) { console.error(`없는 그림: ${key}`); fails++; continue; }
  const mod = await import(pathToFileURL(join(figDir, key + ".mjs")).href + `?t=${Date.now()}`);
  const meta = mod.meta;
  const scale = meta.scale ?? 3;
  const ctx = await browser.newContext({ viewport: { width: meta.w, height: meta.h }, deviceScaleFactor: scale });
  await ctx.route(BASE + "/**", (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === "/render.html") return route.fulfill({ status: 200, contentType: "text/html", body: page(key, meta) });
    const rel = decodeURIComponent(u.pathname.slice(1));
    if (!ALLOW.some((p) => rel.startsWith(p))) return route.fulfill({ status: 403, body: "" });
    const f = join(ROOT, rel);
    if (!existsSync(f) || !statSync(f).isFile()) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
  });
  const pg = await ctx.newPage();
  const logs = [];
  pg.on("console", (m) => { if (m.type() === "error" || m.type() === "warning" || /^(proj|placed)/.test(m.text())) logs.push(`${m.type()}: ${m.text()}`); });
  pg.on("pageerror", (e) => logs.push("pageerror: " + e.message));
  await pg.goto(`${BASE}/render.html`, { waitUntil: "load" });
  await pg.waitForFunction(() => window.__done, null, { timeout: 120000 });
  const done = await pg.evaluate(() => window.__done);
  const font = await pg.evaluate(() => window.__font);
  if (done !== "ok") { console.error(`${key}: 실패\n${done}\n${logs.join("\n")}`); fails++; await ctx.close(); continue; }
  if (!font) console.warn(`${key}: Pretendard 를 못 읽어 대체 글꼴로 구웠다(네트워크 확인)`);
  for (const l of logs) console.warn(`${key}: ${l}`);
  const png = join(OUT_PNG, `${key}.png`);
  await pg.locator("#fig").screenshot({ path: png });
  await ctx.close();
  if (!flags.has("--png-only")) {
    const unitDir = join(OUT_PUBLIC, key.replace(/l\d+f\d+$/, ""));
    mkdirSync(unitDir, { recursive: true });
    const webp = join(unitDir, `${key}.webp`);
    const q = String(meta.quality ?? 86);
    execFileSync("python", [join(HERE, "tools/to-webp.py"), png, webp, q, String(meta.outW ?? 0)], { stdio: "inherit" });
    const kb = (statSync(webp).size / 1024).toFixed(0);
    console.log(`${key}: ${meta.w}x${meta.h} x${scale} -> ${webp.replace(ROOT + "\\", "").replace(ROOT + "/", "")} ${kb}KB`);
    if (statSync(webp).size > 230 * 1024) console.warn(`${key}: ${kb}KB, 목표(200KB 안팎)보다 크다`);
  } else console.log(`${key}: PNG ${png}`);
}
await browser.close();
if (fails) { console.error(`실패 ${fails}건`); process.exit(1); }
