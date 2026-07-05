// qa/assets.json → src/ui/art.generated.ts 재생성기.
// 사용: node qa/gen-art.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";

const { assetsBySet } = JSON.parse(readFileSync("qa/assets.json", "utf8"));
const bio = {}, cells = {}, decor = {};
const put = (o, arr) => (arr || []).forEach((a) => (o[a.key] = a.svg));
put(cells, assetsBySet.cells);
put(bio, assetsBySet.microbes);
put(bio, assetsBySet.plants);
put(bio, assetsBySet.animalsA);
put(bio, assetsBySet.animalsB);
put(decor, assetsBySet.mapdecor);

let out = "// AUTO-GENERATED from qa/assets.json (premium-redesign-foundry). Do not hand-edit.\n// 재생성: node qa/gen-art.mjs\n\n";
out += `export const ART_BIO: Record<string, string> = ${JSON.stringify(bio)};\n`;
out += `export const ART_DECOR: Record<string, string> = ${JSON.stringify(decor)};\n`;
out += `export const ART_CELLS: Record<string, string> = ${JSON.stringify(cells)};\n`;
writeFileSync("src/ui/art.generated.ts", out);
console.log("wrote src/ui/art.generated.ts", statSync("src/ui/art.generated.ts").size, "bytes");
