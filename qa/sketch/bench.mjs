// 방식 비교 측정: 정적 SVG(<img>) / 실행 중 SVG 생성 / 코드로 뽑은 래스터(webp)
// 실행: PORT=5537 node qa/sketch/bench.mjs   (dev 서버 필요. 폰을 흉내 내려고 CPU를 4배 느리게 건다)
import { chromium } from "playwright-core";
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PORT = process.env.PORT || "5537";
const kb = n => (n / 1024).toFixed(1);
const dirSize = (d, re) => readdirSync(d).filter(f => re.test(f)).reduce((s, f) => s + statSync(join(d, f)).size, 0);
const comp = (d, re) => {
  let raw = 0, gz = 0, br = 0;
  for (const f of readdirSync(d).filter(f => re.test(f))) { const b = readFileSync(join(d, f)); raw += b.length; gz += gzipSync(b, { level: 9 }).length; br += brotliCompressSync(b).length; }
  return { raw, gz, br };
};
const out = {};

// 1) 전송 크기
const P = join(ROOT, "public");
out.size = {
  comicOld: dirSize(join(P, "comics", "u1l1"), /\.webp$/),
  comicNew: comp(join(P, "sketch", "comics", "u1l1"), /\.svg$/),
  splashOld: dirSize(join(P, "brand", "loading"), /\.webp$/) + statSync(join(P, "brand", "study.webp")).size,
  splashNew: comp(join(P, "sketch", "splash"), /\.svg$/),
  avatarOld: dirSize(join(P, "comics", "avatar"), /\.png$/),
  accountOld: statSync(join(P, "brand", "loading", "8.webp")).size,
  accountNew: comp(join(P, "sketch"), /^account\.svg$/),
};
// 원형 스틱맨 표(번들에 실리는 양)
const gen = await build({ entryPoints: [join(ROOT, "src", "ui", "sketchArt.generated.ts")], bundle: true, minify: true, format: "esm", write: false });
const genJs = gen.outputFiles[0].contents;
out.size.generatedTable = { raw: genJs.length, gz: gzipSync(genJs, { level: 9 }).length };
// 실행 중 생성 방식이라면 번들에 실어야 할 코드(엔진 + 인물 + 소품 + 만화 한 편)
const rt = await build({ entryPoints: [join(ROOT, "qa", "sketch", "scenes", "comic-u1l1.mjs")], bundle: true, minify: true, format: "esm", write: false });
const rtJs = rt.outputFiles[0].contents;
out.size.runtimeComic = { raw: rtJs.length, gz: gzipSync(rtJs, { level: 9 }).length };
const eng = await build({ stdin: { contents: `export * from "./lib/sk.mjs"; export * from "./lib/figure.mjs"; export * from "./lib/props.mjs";`, resolveDir: join(ROOT, "qa", "sketch") }, bundle: true, minify: true, format: "esm", write: false });
out.size.runtimeEngine = { raw: eng.outputFiles[0].contents.length, gz: gzipSync(eng.outputFiles[0].contents, { level: 9 }).length };

// 2) 코드로 뽑은 래스터라면: 만화 7컷을 PNG로 찍어 webp(q90)로
const browser = await chromium.launch({ channel: "chrome", headless: true });
const TMP = join(ROOT, "qa", "shots", "sketch-raster"); mkdirSync(TMP, { recursive: true });
for (const [label, scale] of [["webp960", 1], ["webp1920", 2]]) {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const ctx = await browser.newContext({ viewport: { width: 960, height: 720 }, deviceScaleFactor: scale });
    const pg = await ctx.newPage();
    await pg.setContent(`<body style="margin:0;background:#fff">${readFileSync(join(P, "sketch", "comics", "u1l1", `${i}.svg`), "utf8")}</body>`);
    const png = join(TMP, `${i}-${scale}.png`), webp = join(TMP, `${i}-${scale}.webp`);
    await pg.screenshot({ path: png });
    await ctx.close();
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", png, "-c:v", "libwebp", "-quality", "90", webp]);
    total += statSync(webp).size;
  }
  out.size[label] = total;
}

// 3) 그리는 시간 (CPU 4배 감속)
const ctx = await browser.newContext({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 3 });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
// 캔버스 방식 비교용: 영상 샘플 엔진(캔버스 2D)을 읽기 전용으로 빌려 와 한 장면을 그려 본다
const VIDEO = join(ROOT, "..", "video", "u3_ep01_sketch_sample");
await page.route("**/__video/**", async (route) => {
  const rel = decodeURIComponent(new URL(route.request().url()).pathname.replace("/__video/", ""));
  try { await route.fulfill({ body: readFileSync(join(VIDEO, rel)), contentType: rel.endsWith(".json") ? "application/json" : "text/javascript" }); }
  catch { await route.fulfill({ status: 404, body: "" }); }
});
await page.goto(`http://localhost:${PORT}/qa-sketch.html`, { waitUntil: "networkidle" });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
out.time = await page.evaluate(async () => {
  const med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const raf2 = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const host = document.createElement("div"); host.style.cssText = "width:350px"; document.body.prepend(host);
  // 정적 파일: 새 <img> 를 붙이고 디코드가 끝날 때까지
  async function decode(urls) {
    const t = [];
    for (const u of urls) {
      const im = new Image(); im.style.width = "350px"; im.src = u + "?b=" + Math.random();
      const t0 = performance.now(); host.appendChild(im); await im.decode(); await raf2(); t.push(performance.now() - t0); im.remove();
    }
    return t;
  }
  const idx = [0, 1, 2, 3, 4, 5, 6];
  const svgT = await decode(idx.map(i => `./sketch/comics/u1l1/${i}.svg`));
  const webpT = await decode(idx.map(i => `./comics/u1l1/${i}.webp`));
  const flipSvg = await decode(["eat", "game", "kick", "sing", "nap", "oops", "study"].map(n => `./sketch/splash/${n}.svg`));
  const flipWebp = await decode([0, 1, 2, 3, 4, 5, 6].map(n => `./brand/loading/${n}.webp`));
  // 실행 중 생성: 장면 코드를 돌려 SVG 문자열을 만들고 DOM 에 넣어 그릴 때까지
  const m = await import("/qa/sketch/scenes/comic-u1l1.mjs");
  const genT = [], insT = [];
  for (let r = 0; r < 5; r++) {
    const t0 = performance.now(); const ps = m.panels(); const svgs = ps.map(p => p.sk.svg({ inline: true })); const t1 = performance.now();
    genT.push((t1 - t0) / 7);
    const t2 = performance.now(); host.innerHTML = svgs[3]; host.firstChild.style.width = "350px"; await raf2(); insT.push(performance.now() - t2); host.innerHTML = "";
  }
  // 캔버스 2D(영상 엔진): 인물과 컵 두 개가 나오는 장면 한 장을 1080×1920 캔버스에 그린다
  let canvasT = null;
  try {
    const v = await import("/__video/src/scenes.js");
    v.setTiming(await (await fetch("/__video/timing.json")).json());
    const cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1920;
    const cx = cv.getContext("2d"); const ts = [];
    for (let r = 0; r < 5; r++) { const t0 = performance.now(); v.drawFrame(cx, 15.6); cx.getImageData(0, 0, 1, 1); ts.push(performance.now() - t0); }
    canvasT = { med: med(ts), max: Math.max(...ts) };
  } catch (e) { canvasT = { error: String(e) }; }
  return {
    canvasDraw: canvasT,
    staticSvgDecode: { med: med(svgT), max: Math.max(...svgT) }, webpDecode: { med: med(webpT), max: Math.max(...webpT) },
    splashSvgDecode: { med: med(flipSvg), max: Math.max(...flipSvg) }, splashWebpDecode: { med: med(flipWebp), max: Math.max(...flipWebp) },
    runtimeGeneratePerPanel: { med: med(genT), max: Math.max(...genT) }, runtimeInsertPaint: { med: med(insT), max: Math.max(...insT) },
  };
});
await browser.close();

writeFileSync(join(ROOT, "qa", "shots", "sketch-bench.json"), JSON.stringify(out, null, 2));
const s = out.size, t = out.time;
console.log(`[크기 KB]
 만화 7컷      현행 webp ${kb(s.comicOld)} | 정적 SVG 원본 ${kb(s.comicNew.raw)} · gzip ${kb(s.comicNew.gz)} · brotli ${kb(s.comicNew.br)} | 코드 래스터 webp 960 ${kb(s.webp960)} · 1920 ${kb(s.webp1920)}
 스플래시      현행 15장 ${kb(s.splashOld)} | 정적 SVG 7장 원본 ${kb(s.splashNew.raw)} · gzip ${kb(s.splashNew.gz)} · brotli ${kb(s.splashNew.br)}
 계정 화면     현행 ${kb(s.accountOld)} | SVG 원본 ${kb(s.accountNew.raw)} · gzip ${kb(s.accountNew.gz)}
 원형 스틱맨   현행 png 5장 ${kb(s.avatarOld)} | 번들에 실린 표 ${kb(s.generatedTable.raw)} · gzip ${kb(s.generatedTable.gz)}
 실행 중 생성이라면 번들에 실을 코드: 엔진과 인물, 소품 ${kb(s.runtimeEngine.raw)} · gzip ${kb(s.runtimeEngine.gz)} | 만화 한 편까지 ${kb(s.runtimeComic.raw)} · gzip ${kb(s.runtimeComic.gz)}
[시간 ms, CPU 4배 감속, 화소 3배]
 만화 컷 한 장  정적 SVG 디코드 ${t.staticSvgDecode.med.toFixed(1)} (최대 ${t.staticSvgDecode.max.toFixed(1)}) | 현행 webp ${t.webpDecode.med.toFixed(1)} (최대 ${t.webpDecode.max.toFixed(1)})
 스플래시 컷    정적 SVG 디코드 ${t.splashSvgDecode.med.toFixed(1)} (최대 ${t.splashSvgDecode.max.toFixed(1)}) | 현행 webp ${t.splashWebpDecode.med.toFixed(1)} (최대 ${t.splashWebpDecode.max.toFixed(1)})
 캔버스(영상 엔진) 한 장면 그리기 ${t.canvasDraw.med ? t.canvasDraw.med.toFixed(1) + " (최대 " + t.canvasDraw.max.toFixed(1) + ")" : "측정 실패 " + t.canvasDraw.error}
 실행 중 생성   장면 코드 실행 ${t.runtimeGeneratePerPanel.med.toFixed(1)} (최대 ${t.runtimeGeneratePerPanel.max.toFixed(1)}) + DOM 삽입과 그리기 ${t.runtimeInsertPaint.med.toFixed(1)} (최대 ${t.runtimeInsertPaint.max.toFixed(1)})`);
