// 장면 묶음을 격자 한 장으로 찍어 눈으로 확인한다.
// 실행: node qa/sketch/preview.mjs comic|splash|avatars|all [열 수] [배율]
import { sheet, close } from "./lib/shot.mjs";

const which = process.argv[2] ?? "comic";
const cols = Number(process.argv[3] ?? 3), scale = Number(process.argv[4] ?? 1);

if (which === "comic" || which === "all") {
  const { panels } = await import("./scenes/comic-u1l1.mjs");
  const items = panels().map((p, i) => ({ svg: p.sk.svg(), label: `컷 ${i}` }));
  await sheet(items, "qa/shots/sketch-comic.png", { cols, cw: 480, ch: 360, scale, label: true });
  console.log("comic", items.map(i => (i.svg.length / 1024).toFixed(1) + "KB").join(" "));
}
if (which === "splash" || which === "all") {
  const { frames } = await import("./scenes/splash.mjs");
  const items = frames().map(f => ({ svg: f.sk.svg(), label: f.name }));
  await sheet(items, "qa/shots/sketch-splash.png", { cols: 4, cw: 380, ch: 380, scale, label: true });
  console.log("splash", items.map(i => (i.svg.length / 1024).toFixed(1) + "KB").join(" "));
}
if (which === "avatars" || which === "all") {
  const { avatars, reading } = await import("./scenes/avatars.mjs");
  const items = [...avatars().map(f => ({ svg: f.sk.svg(), label: f.name })), { svg: reading().svg(), label: "reading" }];
  await sheet(items, "qa/shots/sketch-avatars.png", { cols: 6, cw: 300, ch: 300, scale, label: true });
  console.log("avatars", items.map(i => (i.svg.length / 1024).toFixed(1) + "KB").join(" "));
}
await close();
