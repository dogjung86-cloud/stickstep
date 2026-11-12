// 한 단원을 node에서 읽어 옮기기 전 스냅샷(qa/v5canon/before/<id>.json)과 견준다.
// 쓰기: node qa/v5canon/check-unit.mjs u3        (중1: src/content/unit3.ts 의 UNIT3,  중2: src/content/g2/unit3.ts 의 G2_UNIT3)
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const id = process.argv[2];
const g2 = id.startsWith("g2");
const n = id.replace(/^g2/, "").replace("u", "");
const file = g2 ? `src/content/g2/unit${n}.ts` : `src/content/unit${n}.ts`;
const name = g2 ? `G2_UNIT${n}` : `UNIT${n}`;
const mem = new Map();
const store = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), clear: () => mem.clear(), key: () => null, length: 0 };
globalThis.sessionStorage = store;
globalThis.localStorage = { ...store };
globalThis.location = { search: "", hash: "", href: "http://x/", pathname: "/", origin: "http://x" };
globalThis.window = globalThis;
globalThis.document = { documentElement: { style: {}, classList: { add() {}, remove() {}, toggle() {} } }, addEventListener() {}, createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), body: { appendChild() {}, classList: { add() {}, remove() {} } }, querySelector: () => null };
try { Object.defineProperty(globalThis, "navigator", { value: { userAgent: "node", language: "ko" }, configurable: true }); } catch {}
const entry = path.resolve(`qa/v5canon/.entry-${id}.ts`);
fs.writeFileSync(entry, `import { ${name} } from "../../${file.replace(/\.ts$/, "")}";\n(globalThis as any).__U = ${name};\n`);
const tmp = path.resolve(`qa/v5canon/.bundle-${id}.mjs`);
await build({ entryPoints: [entry], bundle: true, format: "esm", platform: "node", outfile: tmp, logLevel: "error",
  define: { "import.meta.env.DEV": "false", "import.meta.env.PROD": "true", "import.meta.env": "{}" },
  loader: { ".css": "empty", ".svg": "text", ".png": "file", ".webp": "file" }, external: ["three", "matter-js"] });
await import(pathToFileURL(tmp).href + "?t=" + Date.now());
fs.rmSync(entry); fs.rmSync(tmp);
// curriculum.ts가 불러올 때 하는 것과 같게, 번호가 없는 선택형 문제에 번호(n, of)를 매긴다
for (const les of globalThis.__U.lessons) {
  const qs = les.steps.filter((st) => st.type === "quiz");
  qs.forEach((st, i) => { if (st.n == null) st.n = i + 1; if (st.of == null) st.of = qs.length; });
}
const now = JSON.parse(JSON.stringify(globalThis.__U));
const want = JSON.parse(fs.readFileSync(`qa/v5canon/before/${id}.json`, "utf8"));
const diffs = [];
const walk = (a, b, p) => {
  if (diffs.length > 12) return;
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) walk(a[k], b[k], `${p}.${k}`);
  } else diffs.push(`${p}\n   지금: ${JSON.stringify(a)?.slice(0, 160)}\n   목표: ${JSON.stringify(b)?.slice(0, 160)}`);
};
walk(now, want, id);
// 키 차례까지 같은지도 본다
const exact = JSON.stringify(now) === JSON.stringify(want);
if (!diffs.length && exact) console.log(`SAME ${id}: 옮기기 전과 글자 하나까지 같다 (레슨 ${now.lessons.length}, 스텝 ${now.lessons.reduce((s, l) => s + l.steps.length, 0)})`);
else if (!diffs.length) console.log(`SAME-CONTENT ${id}: 내용은 같고 객체 안 키의 차례만 다르다(괜찮다)`);
else { console.log(`DIFF ${id}:\n` + diffs.join("\n")); process.exit(1); }
