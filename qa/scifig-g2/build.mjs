// 중2 과학 개념·정리 그림을 굽는다: figs/<단원>/<키>.mjs 를 헤드리스 크롬에서 그려 public/scifig/g2/<단원>/<키>.webp 로 낸다.
//   node qa/scifig-g2/build.mjs                 모든 그림
//   node qa/scifig-g2/build.mjs g2u4l3f1 g2u2l1f1   고른 그림만
//   --png=<폴더>   같은 그림을 PNG로도 저장(시트·검수용)    --q=0.84   webp 품질    --dpr=3   화소 밀도
//   --table        그리지 않고 그림 표만 다시 쓴다(그림 파일을 지운 뒤)
//   --notable      그림 표를 다시 쓰지 않는다(여럿이 동시에 구울 때. 끝에 한 번 --table)
// 그림 모듈 계약: export const meta = { key, w, h, alt }, export default async function draw(root, kit)
//   root는 w×h CSS px 상자(position: relative). 캔버스와 SVG를 그 안에 쌓는다. kit = { paint, svg, noise, cells }.
// 끝에 src/content/g2/sciFigG2.ts 의 그림 표(// <FIGS> ~ // </FIGS>)를 public 폴더의 실제 파일로 다시 쓴다.
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const OUT = join(REPO, "public", "scifig", "g2");
const TABLE = join(REPO, "src", "content", "g2", "sciFigG2.ts");
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const only = args.filter((a) => !a.startsWith("--"));
const Q = Number(opt.q ?? 0.84);
const DPR = Number(opt.dpr ?? 3);
const PNG = opt.png || "";

const ORIGIN = "http://scifig.test";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json" };

const HOST = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.9/variable/pretendardvariable-dynamic-subset.min.css">
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<style>html,body{margin:0;background:transparent}body{font-family:"Pretendard Variable",Pretendard,sans-serif;letter-spacing:-.012em;-webkit-font-smoothing:antialiased}
#fig{position:relative;overflow:hidden}#fig>canvas{position:absolute;left:0;top:0}</style></head><body><div id="fig"></div>
<script type="module">
import * as paint from "/kit/paint.mjs";
import * as svg from "/kit/svg.mjs";
import * as noise from "/kit/noise.mjs";
import * as cells from "/kit/cells.mjs";
const q = new URLSearchParams(location.search);
try {
  const mod = await import("/figs/" + q.get("fig") + ".mjs");
  const root = document.getElementById("fig");
  root.style.width = mod.meta.w + "px";
  root.style.height = mod.meta.h + "px";
  if (mod.meta.radius !== 0) root.style.borderRadius = (mod.meta.radius ?? 12) + "px";
  await mod.default(root, { paint, svg, noise, cells });
  const text = [...document.querySelectorAll("text, tspan, .t")].map((n) => n.textContent).join("") + "0123456789";
  for (const wgt of [500, 600, 700, 800]) await document.fonts.load(wgt + " 13px 'Pretendard Variable'", text);
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__done = true;
} catch (e) { window.__err = String(e && e.stack || e); }
</script></body></html>`;

function figFiles() {
  const base = join(HERE, "figs");
  const list = [];
  if (!existsSync(base)) return list;
  for (const u of readdirSync(base)) {
    const d = join(base, u);
    if (!statSync(d).isDirectory()) continue;
    for (const f of readdirSync(d)) if (f.endsWith(".mjs") && !f.startsWith("_")) list.push({ u, key: f.replace(/\.mjs$/, "") });
  }
  return list.sort((a, b) => a.key.localeCompare(b.key, "en", { numeric: true }));
}

/** webp 머리에서 가로·세로를 읽는다(VP8, VP8L, VP8X). */
function webpSize(buf) {
  const fourcc = buf.toString("ascii", 12, 16);
  if (fourcc === "VP8X") return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  if (fourcc === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (fourcc === "VP8L") {
    const b = buf.readUInt32LE(21);
    return [1 + (b & 0x3fff), 1 + ((b >> 14) & 0x3fff)];
  }
  return [0, 0];
}

function writeTable() {
  if (!existsSync(TABLE)) return;
  const rows = [];
  if (existsSync(OUT)) {
    for (const u of readdirSync(OUT).sort()) {
      const d = join(OUT, u);
      if (!statSync(d).isDirectory()) continue;
      for (const f of readdirSync(d).sort((a, b) => a.localeCompare(b, "en", { numeric: true }))) {
        if (extname(f) !== ".webp") continue;
        const [w, h] = webpSize(readFileSync(join(d, f)));
        rows.push(`  ${f.replace(/\.webp$/, "")}: ["${u}", ${w}, ${h}],`);
      }
    }
  }
  const src = readFileSync(TABLE, "utf8");
  const next = src.replace(/\/\/ <FIGS>[\s\S]*?\/\/ <\/FIGS>/, `// <FIGS>\n${rows.join("\n")}\n  // </FIGS>`);
  if (next !== src) writeFileSync(TABLE, next);
  console.log(`표: 그림 ${rows.length}장 (${TABLE.replace(REPO, "").slice(1)})`);
}

const figs = "table" in opt ? [] : figFiles().filter((f) => !only.length || only.includes(f.key));
if (!figs.length) {
  console.log("그릴 그림이 없어요", only);
  writeTable();
  process.exit(0);
}
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await browser.newContext({ deviceScaleFactor: DPR, viewport: { width: 900, height: 1400 } });
await ctx.route(ORIGIN + "/**", (route) => {
  const p = decodeURIComponent(new URL(route.request().url()).pathname);
  let f = "";
  if (p === "/host.html") return route.fulfill({ status: 200, contentType: "text/html", body: HOST });
  if (p.startsWith("/kit/") || p.startsWith("/figs/")) f = join(HERE, p.slice(1));
  else if (p.startsWith("/three/")) f = join(REPO, "node_modules", "three", p.slice("/three/".length));
  else if (p.startsWith("/public/")) f = join(REPO, "public", p.slice("/public/".length));
  if (!f || !existsSync(f)) return route.fulfill({ status: 404, body: "" });
  return route.fulfill({ status: 200, contentType: MIME[extname(f)] ?? "application/octet-stream", body: readFileSync(f) });
});
const page = await ctx.newPage();
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("  [page]", m.text()); });
let fails = 0;
for (const { u, key } of figs) {
  const t0 = Date.now();
  await page.goto(`${ORIGIN}/host.html?fig=${u}/${key}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__done || window.__err, null, { timeout: 240000 });
  const err = await page.evaluate(() => window.__err);
  if (err) {
    console.log(`✗ ${key}: ${err}`);
    fails++;
    continue;
  }
  const png = await page.locator("#fig").screenshot({ type: "png", omitBackground: true, scale: "device" });
  const b64 = await page.evaluate(async ({ b64, q }) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0);
    return c.toDataURL("image/webp", q).split(",")[1];
  }, { b64: png.toString("base64"), q: Q });
  const buf = Buffer.from(b64, "base64");
  mkdirSync(join(OUT, u), { recursive: true });
  writeFileSync(join(OUT, u, `${key}.webp`), buf);
  if (PNG) {
    mkdirSync(PNG, { recursive: true });
    writeFileSync(join(PNG, `${key}.png`), png);
  }
  const [w, h] = webpSize(buf);
  console.log(`✓ ${key}  ${w}×${h}  ${(buf.length / 1024).toFixed(0)}KB  ${((Date.now() - t0) / 1000).toFixed(1)}s${buf.length > 230 * 1024 ? "  (용량 큼)" : ""}`);
}
await browser.close();
if (!("notable" in opt)) writeTable();
process.exit(fails ? 1 : 0);
