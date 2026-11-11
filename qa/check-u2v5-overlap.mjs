// 중1 Ⅱ v5 새 문제와 단원 종합 평가 문제 은행(u2, 160제)의 겹침 검사.
// 태그와 공백을 뺀 글에서 16자 창을 밀어 가며, 같은 16자가 시험 문항(문두, 보기, 해설, 핵심)에 있으면 잡는다.
// 대상: 새로 쓴 문제 스텝(quiz, binSort, order, pairMatch)의 문두, 보기, 해설 + 랩 열세 판의 판정 질문과 보기, 안내 글.
// v3에서 그대로 물려 쓴 스텝은 대상이 아니다(이미 운영 중인 글이고, 시험 풀을 만들 때 대조를 거쳤다).
//   PORT=5547 node qa/check-u2v5-overlap.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "./u2v5-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const N = 16;

// 랩 소스의 한글 문자열(따옴표 한 쌍 안)
const labTexts = [];
for (const f of fs.readdirSync(path.join(ROOT, "src/lessons/steps/bio6")).filter((x) => x.endsWith(".ts"))) {
  const src = fs.readFileSync(path.join(ROOT, "src/lessons/steps/bio6", f), "utf8").replace(/^\s*\/\/.*$/gm, "");
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) if (/[가-힣]/.test(m[1])) labTexts.push({ where: f, t: m[1] });
}

const { browser, page } = await launch();
const r = await page.evaluate(async ({ N, labTexts }) => {
  const strip = (h) => String(h ?? "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, "");
  const c = await import("/src/content/curriculum.ts");
  const ex = await import("/src/content/exams/index.ts");
  const v3 = await import("/src/content/unit2v3.ts");
  const u = c.CURRICULUM.find((x) => x.id === "u2");
  const exam = ex.examForUnit("u2");
  const pool = [];
  exam.pool.forEach((it) => [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), it.explain, it.core].forEach((t) => pool.push({ id: it.id, t: strip(t) })));
  // v3 스텝인지는 글자로 견준다(객체가 같은지로 보면 안 된다: dev 서버가 고친 파일에 시각 꼬리표를 붙여 다른 사본을 줄 수 있다).
  const j = (x) => JSON.stringify(x, (k, v) => (k === "n" || k === "of" ? undefined : v));
  const v3steps = new Set(v3.UNIT2_V3.lessons.flatMap((l) => l.steps.map(j)));
  const mine = [];
  let quizSteps = 0;
  u.lessons.forEach((l) =>
    l.steps.forEach((s, si) => {
      if (v3steps.has(j(s)) || !["quiz", "binSort", "order", "pairMatch"].includes(s.type)) return;
      quizSteps++;
      const add = (k, t) => t && mine.push({ where: `${l.id} 스텝 ${si + 1}(${s.type}) ${k}`, t: strip(t) });
      add("문두", s.prompt);
      add("제목", s.title);
      add("안내", s.lead);
      (s.options ?? []).forEach((o, i) => add(`보기 ${i + 1}`, o));
      (s.items ?? []).forEach((o, i) => add(`항목 ${i + 1}`, typeof o === "string" ? o : o.label));
      (s.pairs ?? []).forEach((o, i) => add(`짝 ${i + 1}`, `${o.a} ${o.b}`));
      add("정답 해설", s.explainGood);
      add("오답 해설", s.explainBad);
    }),
  );
  labTexts.forEach((x) => mine.push({ where: `랩 ${x.where}`, t: strip(x.t) }));
  const hits = [];
  for (const q of mine) {
    for (let i = 0; i + N <= q.t.length; i++) {
      const w = q.t.slice(i, i + N);
      const p = pool.find((x) => x.t.includes(w));
      if (p) {
        hits.push(`${q.where} / 시험 ${p.id}: "${w}"`);
        break;
      }
    }
  }
  return { pool: exam.pool.length, poolTexts: pool.length, quizSteps, mine: mine.length, long: mine.filter((q) => q.t.length >= N).length, hits };
}, { N, labTexts });
await browser.close();

console.log(`겹침 검사(${N}자 창): 시험 문항 ${r.pool}개(글 ${r.poolTexts}조각)와 새 문제 스텝 ${r.quizSteps}개와 랩 글, 모두 ${r.mine}조각(${N}자 이상 ${r.long}조각) · 겹침 ${r.hits.length}건`);
r.hits.forEach((h) => console.log(" -", h));
process.exit(r.hits.length ? 1 : 0);
