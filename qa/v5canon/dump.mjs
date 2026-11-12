// 과학 커리큘럼(중1, 중2)을 node에서 읽어 단원별 JSON으로 떨군다. 쓰기: node qa/v5canon/dump.mjs <출력 폴더> [주소 꼬리표]
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const outDir = process.argv[2];
const search = process.argv[3] ?? "";
const mem = new Map();
const store = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear(), key: () => null, length: 0 };
globalThis.sessionStorage = store;
globalThis.localStorage = { ...store };
globalThis.location = { search, hash: "", href: "http://x/" + search, pathname: "/", origin: "http://x" };
globalThis.window = globalThis;
globalThis.document = { documentElement: { style: {}, classList: { add() {}, remove() {}, toggle() {} } }, addEventListener() {}, createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), body: { appendChild() {}, classList: { add() {}, remove() {} } }, querySelector: () => null };
try { Object.defineProperty(globalThis, "navigator", { value: { userAgent: "node", language: "ko" }, configurable: true }); } catch {}
const tmp = path.resolve("qa/v5canon/.bundle.mjs");
await build({ entryPoints: ["qa/v5canon/entry.ts"], bundle: true, format: "esm", platform: "node", outfile: tmp, logLevel: "error",
  define: { "import.meta.env.DEV": "false", "import.meta.env.PROD": "true", "import.meta.env": "{}" },
  loader: { ".css": "empty", ".svg": "text", ".png": "file", ".webp": "file" }, external: ["three", "matter-js"] });
await import(pathToFileURL(tmp).href + "?t=" + Date.now());
fs.mkdirSync(outDir, { recursive: true });
for (const [id, u] of Object.entries(globalThis.__OUT)) fs.writeFileSync(path.join(outDir, id + ".json"), JSON.stringify(u, null, 1));
console.log("units:", Object.keys(globalThis.__OUT).join(" "), "functions:", globalThis.__FN);
