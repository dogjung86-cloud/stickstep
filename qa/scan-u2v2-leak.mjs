// u2 v2 교차 유출 후보 기계 스캔 — 한 문항의 정답 문구가 다른 문항의 "노출면"에 어절 단위로
// 그대로 인쇄됐는지 훑는다. 기계는 후보만 뽑고 **판정은 사람이** 한다(번역 단계가 있으면 수용).
// 노출면 = 문두 · 보기 · bogi · 그림 안 텍스트 · aria/alt (해설·core는 리뷰 전용이라 제외).
// node qa/scan-u2v2-leak.mjs [--n=4]
import { build } from "esbuild";
import { existsSync } from "node:fs";

const N = Number((process.argv.find((a) => a.startsWith("--n=")) ?? "--n=4").slice(4));
const SRC = [
  ["qa/u2v2-pilot.ts", "POOL_U2V2_PILOT"],
  ["qa/u2v2-rest-a.ts", "POOL_U2V2_REST_A"],
  ["qa/u2v2-rest-b.ts", "POOL_U2V2_REST_B"],
  ["qa/u2v2-rest-c.ts", "POOL_U2V2_REST_C"],
  ["qa/u2v2-rest-d.ts", "POOL_U2V2_REST_D"],
  ["qa/u2v2-rest-e.ts", "POOL_U2V2_REST_E"],
  ["qa/u2v2-rest-f.ts", "POOL_U2V2_REST_F"],
].filter(([p]) => existsSync(p));

const pool = [];
for (const [p, name] of SRC) {
  const r = await build({ entryPoints: [p], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  pool.push(...mod[name]);
}
console.log(`문항 ${pool.length} · ${N}어절 겹침 스캔`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const surface = (it) => {
  const f = String(it.figure ?? "");
  const figTxt = f.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  const figAria = [...f.matchAll(/(?:aria-label|alt)="([^"]*)"/g)].map((m) => m[1]).join(" ");
  return [plain(it.prompt), (it.options ?? []).map(plain).join(" | "), (it.bogi ?? []).map(plain).join(" | "), figTxt, figAria].join(" | ");
};
const GNL = ["ㄱ", "ㄴ", "ㄷ"];
const answerTexts = (it) => {
  if (it.type === "multi") return it.answer.map((i) => plain(it.options[i]));
  if (it.bogi) {
    // 합답형: 정답 조합에 든 ㄱㄴㄷ 문장이 곧 "참으로 선언된" 문구다
    const picked = plain(it.options[it.answer]);
    return it.bogi.filter((_, i) => picked.includes(GNL[i])).map(plain);
  }
  return [plain(it.options[it.answer])];
};
const grams = (s) => {
  const w = s.split(" ").filter(Boolean);
  const out = new Set();
  for (let i = 0; i + N <= w.length; i++) out.add(w.slice(i, i + N).join(" "));
  return out;
};

let n = 0;
for (const a of pool) {
  const ans = answerTexts(a).filter((t) => t.split(" ").length >= N);
  for (const b of pool) {
    if (a.id === b.id) continue;
    const surf = surface(b);
    for (const t of ans) {
      const hit = [...grams(t)].filter((g) => surf.includes(g));
      if (hit.length) { n += 1; console.log(`[${a.id} 정답] ↔ [${b.id} 노출면]  겹침: ${hit.slice(0, 2).join(" / ")}`); }
    }
  }
}
console.log(n ? `\n후보 ${n}건 · 수동 판정 필요` : `\n${N}어절 이상 겹침 후보 0건`);
