// SVG 파일 한 장을 PNG로 찍는다(눈검수용).  node qa/labstyle/shot-svg.mjs <in.svg> <out.png> [폭=1038] [높이=690]
import { readFileSync } from "node:fs";
import { shotHtml, close } from "../sketch/lib/shot.mjs";
const [inp, out, w = "1038", h = "690"] = process.argv.slice(2);
const svg = readFileSync(inp, "utf8");
await shotHtml(`<!doctype html><meta charset="utf-8"><style>body{margin:0}svg{display:block;width:${w}px;height:${h}px}</style>${svg}`, out, Number(w), Number(h), 1);
await close();
