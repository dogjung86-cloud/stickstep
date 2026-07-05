// QA 갤러리 생성기 — 생성된 SVG 에셋 JSON을 받아 라이트/다크 카드 위에
// 아이콘 크기 + 큰 크기로 나란히 보여주는 정적 HTML을 만든다. (스크린샷 검수용)
// 사용: node qa/render.mjs qa/assets.json qa/gallery.html
import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath = "qa/assets.json", outPath = "qa/gallery.html"] = process.argv;
const data = JSON.parse(readFileSync(inPath, "utf8"));

// data 형태: { assetsBySet: { setKey: [{key,svg}] } }  또는  { flat: [{key,svg}] }
const groups = [];
if (data.assetsBySet) {
  for (const [set, assets] of Object.entries(data.assetsBySet)) groups.push([set, assets || []]);
} else if (data.flat) {
  groups.push(["assets", data.flat]);
}

const bigKeys = new Set(["animalCell", "plantCell"]);

function card(a) {
  const big = bigKeys.has(a.key);
  const sizes = big
    ? `<div class="cell">${a.svg}</div>`
    : `<div class="row"><span class="ic">${a.svg}</span><span class="ic lg">${a.svg}</span></div>`;
  return `<figure class="fig ${big ? "wide" : ""}">
    <div class="light">${sizes}</div>
    <div class="dark">${big ? `<div class="cell">${a.svg}</div>` : `<div class="row"><span class="ic">${a.svg}</span><span class="ic lg">${a.svg}</span></div>`}</div>
    <figcaption>${a.key}</figcaption>
  </figure>`;
}

const body = groups
  .map(
    ([set, assets]) =>
      `<section><h2>${set} · ${assets.length}</h2><div class="grid">${assets.map(card).join("")}</div></section>`,
  )
  .join("");

const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{margin:0;box-sizing:border-box}
  body{font-family:-apple-system,'Malgun Gothic',system-ui,sans-serif;background:#EEF1F5;color:#191F28;padding:20px}
  h2{font-size:15px;margin:22px 0 10px;color:#4E5968;font-weight:800}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
  .fig{background:#fff;border:1px solid #E7EAEE;border-radius:14px;overflow:hidden}
  .fig.wide{grid-column:span 2}
  .light,.dark{padding:14px;display:flex;justify-content:center;align-items:center;min-height:96px}
  .dark{background:radial-gradient(130% 100% at 50% -10%,#15263F,#0B1524 62%)}
  .row{display:flex;align-items:center;gap:16px}
  .ic{width:34px;height:34px;display:inline-flex} .ic.lg{width:76px;height:76px}
  .ic svg{width:100%;height:100%} .cell{width:100%} .cell svg{width:100%;height:auto}
  figcaption{padding:8px 10px;font-size:12px;font-weight:700;color:#4E5968;border-top:1px solid #F2F4F7;text-align:center}
</style></head><body>${body}</body></html>`;

writeFileSync(outPath, html);
console.log("wrote", outPath, "groups:", groups.length);
