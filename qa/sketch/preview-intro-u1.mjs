// Ⅰ단원 도입 그림만 한 장으로 찍어 본다. 실행: node qa/sketch/preview-intro-u1.mjs [출력 png]
import { shotHtml, close } from "./lib/shot.mjs";
import * as U from "./scenes/intro-u1.mjs";
const W = 346, H = Math.round((346 * 544) / 960);
const cells = [["suncups", U.suncupsBase()], ["speaker", U.speakerBase()], ["blanket", U.blanketBase()]].map(([t, r]) => `<div><div class="t">${t}</div><div class="f">${r.sk.svg({ inline: true })}</div></div>`);
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#E9ECEF;font:13px sans-serif}.g{display:grid;grid-template-columns:repeat(3,${W}px);gap:14px;padding:14px}.t{height:22px}.f{width:${W}px;height:${H}px;background:#fff;border-radius:14px;overflow:hidden}.f svg{display:block;width:100%;height:100%}</style><div class="g">${cells.join("")}</div>`;
const out = process.argv[2] ?? "qa/shots/intro-u1-art.png";
await shotHtml(html, out, 3 * W + 4 * 14, H + 22 + 28, 3);
await close();
console.log("saved", out);
