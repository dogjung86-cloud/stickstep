import { CURRICULUM, CURRICULUM_G2 } from "../../src/content/curriculum";
const out: Record<string, unknown> = {};
let fn = 0;
const walk = (v: unknown, path: string): unknown => {
  if (typeof v === "function") { fn++; console.error("FUNCTION at", path); return "[fn]"; }
  if (Array.isArray(v)) return v.map((x, i) => walk(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v as object).map(([k, x]) => [k, walk(x, `${path}.${k}`)]));
  return v;
};
for (const u of [...CURRICULUM, ...CURRICULUM_G2] as { id: string }[]) out[u.id] = walk(u, u.id);
(globalThis as any).__OUT = out;
(globalThis as any).__FN = fn;
