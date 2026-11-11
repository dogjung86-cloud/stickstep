// Ⅳ단원 도입 그림 넷을 한 장으로 찍는다(눈검수용). 실행: node qa/shot-u4v5-intro.mjs [출력 png]
import { sheet, close } from "./sketch/lib/shot.mjs";
import * as U4 from "./sketch/scenes/intro-u4.mjs";
const out = process.argv[2] ?? "qa/shots/u4v5-intro.png";
const items = [["lid", U4.lidBase()], ["spill", U4.spillBase()], ["wrap", U4.wrapBase()], ["ramen", U4.ramenBase()]].map(([label, r]) => ({ label, svg: r.sk.svg({ inline: true }).replace("<svg ", '<svg width="480" height="272" ') }));
await sheet(items, out, { cols: 2, cw: 480, ch: 272, label: true });
await close();
console.log(out);
