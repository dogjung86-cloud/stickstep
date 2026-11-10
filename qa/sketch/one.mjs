// 한 장만 크게 찍는다: node qa/sketch/one.mjs comic 1 [배율]
import { shotHtml, close } from "./lib/shot.mjs";
const [which, idx, sc] = [process.argv[2], Number(process.argv[3] ?? 0), Number(process.argv[4] ?? 1)];
let sk;
if (which === "comic") sk = (await import("./scenes/comic-u1l1.mjs")).panels()[idx].sk;
else if (/^(u|g2u)\d/.test(which)) sk = (await import(`./scenes/comic-${which}.mjs`)).panels()[idx].sk;
else if (which === "subjects") sk = (await import("./scenes/subjects.mjs")).subjects()[idx].sk;
else if (which === "splash") sk = (await import("./scenes/splash.mjs")).frames()[idx].sk;
else sk = (await import("./scenes/avatars.mjs")).avatars()[idx].sk;
await shotHtml(`<!doctype html><body style="margin:0;background:#fff">${sk.svg()}</body>`, `qa/shots/sketch-one.png`, sk.w, sk.h, sc);
await close();
