// Ⅶ단원 도입 그림만 한 장으로 찍어 본다(움직이는 묶음이 모두 켜진 채다). 실행: node qa/sketch/preview-intro-u7.mjs [출력 png]
import { shotHtml, close } from "./lib/shot.mjs";
import * as U from "./scenes/intro-u7.mjs";
const W = 440, H = Math.round((W * 544) / 960);
const cells = [["brightdot", U.brightdotBase()], ["jupiterrow", U.jupiterrowBase()], ["shadowturn", U.shadowturnBase()], ["moonweek", U.moonweekBase()], ["bittensun", U.bittensunBase()]].map(([t, r]) => `<div><div class="t">${t}</div><div class="f">${r.sk.svg({ inline: true })}</div></div>`);
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#E9ECEF;font:13px sans-serif}.g{display:grid;grid-template-columns:repeat(3,${W}px);gap:14px;padding:14px}.t{height:22px}.f{width:${W}px;height:${H}px;background:#fff;border-radius:14px;overflow:hidden}.f svg{display:block;width:100%;height:100%}</style><div class="g">${cells.join("")}</div>`;
const out = process.argv[2] ?? "qa/shots/intro-u7-art.png";
await shotHtml(html, out, 3 * W + 4 * 14, 2 * (H + 22) + 42, 2);
await close();
console.log("saved", out);
