// m1u4 v2 저작 전 샘플 갤러리 렌더 — node qa/render-m1u4v2-sample.mjs → tmp/m1u4v2-sample/index.html
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";

const result = await build({
  entryPoints: ["qa/m1u4v2-sample.ts"],
  bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent",
});
const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const cards = mod.SAMPLES.map(
  (s, i) => `<div class="card"><div class="head"><b>${String(i + 1).padStart(2, "0")}</b> ${s.t}</div><div class="fig">${s.svg}</div><div class="note">${s.note}</div></div>`,
).join("");
const html = `<!doctype html><meta charset="utf-8"><title>m1u4 v2 헬퍼 샘플</title>
<style>
body{font-family:Pretendard,system-ui,sans-serif;background:#F1F5F9;margin:0;padding:20px}
h1{font-size:18px;margin:0 0 14px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.card{background:#fff;border-radius:12px;padding:12px;box-shadow:0 1px 4px rgba(15,23,42,.08)}
.head{font-size:12.5px;margin-bottom:6px;color:#0F172A}
.fig svg{width:100%;height:auto;display:block;background:#FCFDFF;border:1px solid #E2E8F0;border-radius:8px}
.note{font-size:11.5px;color:#64748B;margin-top:6px}
</style>
<h1>m1u4 v2 — 저작 전 헬퍼 샘플 ${mod.SAMPLES.length}종 (파일럿 사용 전 구성)</h1>
<div class="grid">${cards}</div>`;
mkdirSync("tmp/m1u4v2-sample", { recursive: true });
writeFileSync("tmp/m1u4v2-sample/index.html", html);
console.log(`샘플 ${mod.SAMPLES.length}종 → tmp/m1u4v2-sample/index.html`);
