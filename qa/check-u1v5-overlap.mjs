// 중1 Ⅰ v5의 새 글(문제와 랩)과 단원 종합 평가 문제 은행(src/content/exams/u1*.ts)의 겹침 검사.
// 태그와 공백을 뺀 글에서 16자 창을 밀어 가며, 같은 16자가 시험 풀의 소스에 있으면 잡는다. 서버 없이 소스 글자만 본다.
// 정본에서 그대로 물려 쓴 문항(unit1.ts에도 같은 글이 있는 것)은 대상이 아니다(이미 운영 중인 글이다).
//   node qa/check-u1v5-overlap.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const N = 16;
const strip = (h) => h.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, "");
const strings = (file) => {
  const src = fs.readFileSync(path.join(ROOT, file), "utf8").replace(/^\s*\/\/.*$/gm, "");
  return [...src.matchAll(/"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map((m) => m[1] ?? m[2]).filter((t) => /[가-힣]/.test(t));
};
const examDir = path.join(ROOT, "src/content/exams");
const pool = fs
  .readdirSync(examDir)
  .filter((f) => /^u1(l\d+)?\.ts$/.test(f))
  .map((f) => strip(strings(path.join("src/content/exams", f)).join("\n")))
  .join("\n");
const base = strip(strings("src/content/unit1.ts").join("\n"));
const mine = ["src/content/unit1v5.ts", "src/content/unit1v5text.ts", ...fs.readdirSync(path.join(ROOT, "src/lessons/steps/u1v5")).map((f) => `src/lessons/steps/u1v5/${f}`)].flatMap((f) => strings(f).map((t) => ({ f, t: strip(t) })));

let hits = 0;
for (const { f, t } of mine) {
  if (t.length < N || base.includes(t)) continue;
  for (let i = 0; i + N <= t.length; i++) {
    const w = t.slice(i, i + N);
    if (pool.includes(w)) {
      hits++;
      console.log(`겹침 ${path.basename(f)}: "${w}" ← ${t.slice(0, 40)}`);
      break;
    }
  }
}
console.log(`${hits ? "FAIL" : "PASS"} 새 글 ${mine.length}토막, 시험 풀 ${pool.length}자, 겹침 ${hits}`);
process.exit(hits ? 1 : 0);
