// m1u6 v2 이식 생성기(m2u5·m1u5판 계승): 스테이징 qa/m1u6v2-{pilot,rest-a~f}.ts의 문항 블록을
// 슬롯 순으로 재조립해 src/content/exams/m1u6l1~l6.ts를 재생성한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징 파일에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// node qa/build-m1u6v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = [
  "qa/m1u6v2-pilot.ts",
  "qa/m1u6v2-rest-a.ts",
  "qa/m1u6v2-rest-b.ts",
  "qa/m1u6v2-rest-c.ts",
  "qa/m1u6v2-rest-d.ts",
  "qa/m1u6v2-rest-e.ts",
  "qa/m1u6v2-rest-f.ts",
];
const LESSON = {
  m1u6l1: { start: 1, end: 34, label: "대푯값(평균·중앙값·최빈값)", book: "책 236~239쪽", m: 17, M: 2, n: 15, d: [14, 13, 7], vis: 31 },
  m1u6l2: { start: 35, end: 67, label: "줄기와 잎 그림", book: "책 240~241쪽", m: 16, M: 2, n: 15, d: [13, 13, 7], vis: 31 },
  m1u6l3: { start: 68, end: 101, label: "도수분포표", book: "책 242~244쪽", m: 17, M: 2, n: 15, d: [14, 13, 7], vis: 31 },
  m1u6l4: { start: 102, end: 136, label: "히스토그램과 도수분포다각형", book: "책 245~247쪽", m: 18, M: 2, n: 15, d: [14, 14, 7], vis: 33 },
  m1u6l5: { start: 137, end: 172, label: "상대도수", book: "책 248~250쪽", m: 17, M: 2, n: 17, d: [15, 14, 7], vis: 33 },
  m1u6l6: { start: 173, end: 200, label: "통계적 문제해결", book: "책 254~259쪽", m: 19, M: 2, n: 7, d: [10, 13, 5], vis: 13 },
};
const MATH_FIGS = ["statDataFig", "dotPlotFig", "histoFig"];
const EXAM_FIGS = ["m6DataBoxFig", "mExamStemFig", "mExamTableFig", "mExamRelPolyFig", "mExamTornHistoFig", "mExamAxisPairFig", "mExamFreqPolyFig"];

// ── 스테이징에서 문항 블록 추출(2칸 들여쓰기 "  {" ~ "  }," 원문 그대로) ──
const blocks = [];
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const lines = src.split("\n");
  let cur = null;
  for (const line of lines) {
    if (line === "  {") { cur = [line]; continue; }
    if (cur) {
      cur.push(line);
      if (line === "  },") {
        const text = cur.join("\n");
        const id = text.match(/id: "(m1u6e\d{3})"/)?.[1];
        const lessonId = text.match(/lessonId: "(m1u6l\d)"/)?.[1];
        if (!id || !lessonId) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 200)}`);
        blocks.push({ slot: Number(id.replace("m1u6e", "")), id, lessonId, text });
        cur = null;
      }
    }
  }
}
if (blocks.length !== 200) throw new Error(`블록 ${blocks.length}개 ≠ 200`);
const stagesConst = readFileSync("qa/m1u6v2-rest-f.ts", "utf8").replace(/\r\n/g, "\n").match(/^const STAGES = .*$/m)?.[0];
if (!stagesConst) throw new Error("rest-f의 STAGES 상수를 찾지 못함");

// ── 레슨별 조립·검산·쓰기 ──
let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  const want = L.end - L.start + 1;
  if (arr.length !== want) { console.error(`FAIL ${lid}: ${arr.length}문항 ≠ ${want}`); fails++; continue; }
  for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  const body = arr.map((b) => b.text).join("\n");
  const m = (b) => (re) => re.test(b.text);
  const cnt = { mcq: 0, multi: 0, num: 0 };
  const d = { 1: 0, 2: 0, 3: 0 };
  let vis = 0;
  for (const b of arr) {
    const type = b.text.match(/type: "(\w+)"/)?.[1];
    cnt[type] = (cnt[type] ?? 0) + 1;
    d[b.text.match(/diff: (\d)/)?.[1]]++;
    if (/figure: /.test(b.text)) vis++;
  }
  if (cnt.mcq !== L.m || cnt.multi !== L.M || cnt.num !== L.n) { console.error(`FAIL ${lid}: 유형 ${cnt.mcq}/${cnt.multi}/${cnt.num} ≠ ${L.m}/${L.M}/${L.n}`); fails++; }
  if (d[1] !== L.d[0] || d[2] !== L.d[1] || d[3] !== L.d[2]) { console.error(`FAIL ${lid}: diff ${d[1]}/${d[2]}/${d[3]} ≠ ${L.d.join("/")}`); fails++; }
  if (vis !== L.vis) { console.error(`FAIL ${lid}: 시각자료 ${vis} ≠ ${L.vis}`); fails++; }
  const usedMath = MATH_FIGS.filter((f) => body.includes(`${f}(`));
  const usedExam = EXAM_FIGS.filter((f) => body.includes(`${f}(`));
  const n = lid.replace("m1u6l", "");
  let out = `// 수학 중1 Ⅵ. 통계 v2 재출제 문항 풀 · L${n} ${L.label}(${L.book}) 슬롯 ${L.start}~${L.end}(${want}문항).\n`;
  out += `// 생성 파일: 수정은 qa/m1u6v2-*.ts(스테이징 정본)에서 한 뒤 node qa/build-m1u6v2-lessons.mjs 재실행.\n`;
  out += `// 규격 v2(정본 qa/m1u6-v2-blueprint.md): mcq ${L.m}/multi ${L.M}/num ${L.n}·word 0 · diff ${L.d.join("/")} · 시각자료 ${L.vis} ·\n`;
  out += `// 자료는 문두 나열 금지(자료 상자 렌더) · 도수 합=전체·상대도수 합=1 검산 주석 병기 · em대시 금지.\n`;
  out += `import type { ExamItem } from "./types";\n`;
  if (usedMath.length) out += `import { ${usedMath.join(", ")} } from "../../ui/mathFigures";\n`;
  if (usedExam.length) out += `import { ${usedExam.join(", ")} } from "../../ui/examFiguresMath";\n`;
  if (body.includes("STAGES")) out += `\n${stagesConst}\n`;
  out += `\nexport const POOL_M1U6L${n}: ExamItem[] = [\n${body}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}: ${want}문항 · m${cnt.mcq}/M${cnt.multi}/n${cnt.num} · diff ${d[1]}/${d[2]}/${d[3]} · 시각 ${vis} → src/content/exams/${lid}.ts`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log("이식 완료(200문항). 다음: node qa/check-exam-m1u6.mjs");
