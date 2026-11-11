// 도입 샘플 그림의 겹을 한 장으로 찍어 눈으로 확인한다(앱 없이 그림만).
// 실행: node qa/sketch/preview-intro.mjs [longcell|baskets|factory|all] [배율]
import { shotHtml, close } from "./lib/shot.mjs";
import * as S from "./scenes/intro-u2.mjs";

const which = process.argv[2] ?? "all", scale = Number(process.argv[3] ?? 2);
const W = 346, H = Math.round((346 * S.STAGE_H) / S.STAGE_W);
const page = (title, inner, h = H) => `<div class="c"><div class="t">${title}</div><div class="f" style="height:${h}px">${inner}</div></div>`;
const full = (svg) => `<div class="l">${svg}</div>`;
const cells = [];

if (which === "longcell" || which === "all") {
  const kid = S.longcellKid().sk.svg({ inline: true });
  const world = S.longcellWorld().sk.svg({ inline: true });
  const k = W / S.STAGE_W, L = S.LC;
  const band = (pos) =>
    `<div style="position:absolute;left:${L.bandX * k}px;top:${L.bandY * k}px;width:${L.bandW * k}px;height:${L.bandH * k}px;overflow:hidden">` +
    `<div style="position:absolute;left:0;top:0;width:${L.worldW * k}px;height:${L.bandH * k}px;transform:translateX(${-pos * k}px)">${world}</div>` +
    `<div style="position:absolute;right:0;top:0;bottom:0;width:${L.veil * k}px;background:linear-gradient(90deg,rgba(255,255,255,0),#fff 55%)"></div></div>`;
  for (const [pos, t] of [[0, "처음"], [26 * 30, "30 cm"], [26 * 100, "끝"]]) cells.push(page(`longcell ${t}`, full(kid) + band(pos)));
}
if ((which === "baskets" || which === "all") && S.basketsBase) {
  const base = S.basketsBase().sk.svg({ inline: true });
  cells.push(page("baskets", full(base)));
}
if ((which === "factory" || which === "all") && S.factoryBase) {
  const base = S.factoryBase().sk.svg({ inline: true });
  cells.push(page("factory", full(base)));
}

const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#E9ECEF;font:13px/1.2 "Malgun Gothic",sans-serif;color:#333}
  .g{display:grid;grid-template-columns:repeat(3,${W}px);gap:14px;padding:14px}
  .t{height:22px}
  .f{position:relative;width:${W}px;background:#fff;border-radius:14px;overflow:hidden;outline:1px solid #ccd}
  .l{position:absolute;inset:0}
  .l svg{width:100%;height:100%;display:block}
  .f svg{display:block;width:100%;height:100%}
</style><div class="g">${cells.join("")}</div>`;
const rows = Math.ceil(cells.length / 3);
await shotHtml(html, "qa/shots/intro-art.png", 3 * W + 4 * 14, rows * (H + 22 + 14) + 14, scale);
await close();
console.log("saved qa/shots/intro-art.png");
