// 중2 Ⅰ 도입 그림 아홉 장을 한 장으로 찍는다(앱 없이 그림만): node qa/sketch/preview-intro-g2u1.mjs [출력 png]
import * as U from "./scenes/intro-g2u1.mjs";
import { sheet, close } from "./lib/shot.mjs";
const items = [];
U.build((name, r) => { items.push({ svg: r.sk.svg({ inline: true }), label: name }); return {}; });
await sheet(items, process.argv[2] ?? "qa/shots/intro-g2u1.png", { cols: 3, cw: 480, ch: 272, label: true });
await close();
