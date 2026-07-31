// u1 v2 이식 생성기(u7 v2판 계승 · 과학 12호 · 첫 신규 출제): 스테이징 qa/u1v2-{pilot,rest-a~e}.ts의
// 문항 블록을 슬롯 순으로 재조립해 src/content/exams/u1l1~l5.ts + u1.ts를 생성하고, 신작 헬퍼 9종을
// ui/examFigures.ts 말미 "u1 v2" 섹션으로 승격한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// 파일럿만 있으면 부분 이식(레슨당 8문항) · 전 파일이 있으면 160 전수 검사.
// node qa/build-u1v2-lessons.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/u1v2-pilot.ts", "qa/u1v2-rest-a.ts", "qa/u1v2-rest-b.ts", "qa/u1v2-rest-c.ts", "qa/u1v2-rest-d.ts", "qa/u1v2-rest-e.ts"].filter((p) => existsSync(p));
const FULL = SRC.length === 6;
const LESSON = {
  u1l1: { start: 201, end: 232, label: "과학적 탐구 방법" },
  u1l2: { start: 233, end: 264, label: "직접 탐구하기" },
  u1l3: { start: 265, end: 296, label: "과학과 인류 문명" },
  u1l4: { start: 297, end: 328, label: "첨단 과학기술" },
  u1l5: { start: 329, end: 360, label: "지속가능한 삶" },
};
// examFigures에서 import하게 될 헬퍼(신작 승격 9종 + 공용 재사용 2종)
const EXAM_HELPERS = [
  "svgTable",
  "dbox",
  "inquiryFlowFig",
  "planTableFig",
  "variableTableFig",
  "resultLineFig",
  "resultBarFig",
  "setupPairFig",
  "chainFig",
  "timelineFig",
  "debateFig",
];

// ── 1. 스테이징에서 문항 블록 + 최상위 로컬 상수 추출 ──
// 로컬 const(SIX·SEED_GRAPH 등 공유 자료셋)는 쓰는 레슨 파일에 함께 심는다(m1u3 v2 이식 관행).
const LOCAL_SKIP = new Set(["IMG_BASE", "ximg", "L1", "L2", "L3", "L4", "L5"]);
const locals = [];
const blocks = [];
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const head = src.slice(0, src.indexOf("export const POOL_"));
  for (const m of head.matchAll(/^const (\w+)\s*=\s*([\s\S]*?);\n/gm)) {
    if (LOCAL_SKIP.has(m[1])) continue;
    locals.push({ name: m[1], text: `const ${m[1]} = ${m[2]};` });
  }
  let cur = null;
  for (const line of src.split("\n")) {
    if (line === "  {") { cur = [line]; continue; }
    if (cur) {
      cur.push(line);
      if (line === "  },") {
        const text = cur.join("\n");
        const id = text.match(/id: "(u1e\d{3})"/)?.[1];
        const lref = text.match(/lessonId: (L\d)/)?.[1];
        if (!id || !lref) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("u1e", "")), id, lessonId: `u1l${lref.slice(1)}`, text });
        cur = null;
      }
    }
  }
}
if (FULL && blocks.length !== 160) throw new Error(`블록 ${blocks.length}개 ≠ 160`);
console.log(`스테이징 ${SRC.length}개 · 문항 ${blocks.length}개${FULL ? "" : " (부분 이식)"}`);

// ── 2. 신작 헬퍼 승격: 파일럿 헬퍼 구간(NS 선언 ~ 레슨 상수 직전)을 examFigures "u1 v2" 섹션으로 ──
// 구간 추출은 인덱스 기반(정규식 게으른 확장이 파일을 삼킨 g2u7 ⑥ 사고 재발 방지).
const pilotSrc = readFileSync("qa/u1v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("/** 한글 줄바꿈");
const hEnd = pilotSrc.indexOf(`const L1 = "u1l1";`);
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd).trimEnd();
// 스테이징 로컬 이름을 섹션 전용으로(공용 파일 전역 충돌 방지)
helperBlock = helperBlock.replace(/\bwrapKo\b/g, "u1WrapKo");

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
// ⚠ 섹션 교체는 반드시 시작·종료 마커 "사이"만 — "마커 이후 전부"로 지우면 그 뒤에 다른 세션이
// append한 섹션을 통째로 삼킨다(2026-08-01 실사고: u3 v2 헬퍼 11종 소실 · 스테이징에서 복원).
const MARK = "// ── u1 v2 신작(파일럿 승격 · 신규 출제 12호) ──";
const ENDMARK = "// ── u1 v2 섹션 끝 ──";
const promoted = `${MARK}\n// 탐구 과정·계획표·결과 그래프·문명 사슬·연표·주장 말풍선. 전부 파라미터형 · aria 중립.\n${helperBlock}\n${ENDMARK}\n`;
const si = fig.indexOf(MARK);
if (si >= 0) {
  const ei = fig.indexOf(ENDMARK, si);
  if (ei < 0) throw new Error(`${FIG}: 시작 마커는 있는데 종료 마커가 없다 — 수동 확인 필요(다른 섹션 삼킴 위험)`);
  fig = fig.slice(0, si) + promoted + fig.slice(ei + ENDMARK.length + 1);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: u1 v2 섹션 승격(신작 9종 · 마커 구간 교체)");

// ── 3. 레슨 파일 생성 ──
const BASE_SNIPPET = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_SNIPPET = `const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/u1/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;

let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const want = L.end - L.start + 1;
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  if (FULL) {
    if (arr.length !== want) { console.error(`FAIL ${lid}: ${arr.length}문항 ≠ ${want}`); fails++; continue; }
    for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  } else if (!arr.length) { console.error(`FAIL ${lid}: 문항 0`); fails++; continue; }
  const body = arr.map((b) => b.text).join("\n");
  const usedExam = EXAM_HELPERS.filter((h) => body.includes(h + "("));
  const usesXimg = body.includes("ximg(");
  const n = Number(lid.replace("u1l", ""));
  const header = `// 중1 과학 I. 과학과 인류의 지속가능한 삶 · 단원 종합 평가 풀 v2: 레슨 ${n} ${L.label} (u1e${L.start}~e${L.end}${FULL ? "" : " 중 " + arr.length + "문항"})
// ⚠ 이 파일은 qa/build-u1v2-lessons.mjs가 스테이징(qa/u1v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 신규 출제(2026-07) · 정본 설계표 qa/u1-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: num 0 · word 0(실측 계산 0/22 · 개수 세기 0/22) · diff 태그 · 그림은 자료 의존 설계.
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (usedExam.length) importLines.push(`import { ${usedExam.join(", ")} } from "../../ui/examFigures";`);
  const local = [`const L = "${lid}";`];
  if (usesXimg) local.push(BASE_SNIPPET, XIMG_SNIPPET);
  for (const c of locals) {
    if (new RegExp(`\\b${c.name}\\b`).test(body)) local.push(c.text);
  }
  const bodyL = body.replaceAll(`lessonId: L${n}`, "lessonId: L");
  const out = `${header}\n${importLines.join("\n")}\n\n${local.join("\n")}\n\nexport const POOL_U1L${n}: ExamItem[] = [\n${bodyL}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${arr.length}문항 · examFigures ${usedExam.length}종${usesXimg ? " +ximg" : ""})`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }

// ── 4. 조립 파일 ──
const asm = `// 중1 과학 I. 과학과 인류의 지속가능한 삶 · 단원 종합 평가 문항 풀 v2(160제 = 32×5, 5레슨 · 신규 출제).
// 문항은 레슨 파일(u1l1~u1l5)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 135 / multi 25 / num 0 / word 0 · diff 64/64/32 · 시각 112(자료 상자·표·그래프·실사 15장).
// 규격·회피표·검산 기록 정본 = qa/u1-v2-blueprint.md, 이식 = qa/build-u1v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_U1L1 } from "./u1l1";
import { POOL_U1L2 } from "./u1l2";
import { POOL_U1L3 } from "./u1l3";
import { POOL_U1L4 } from "./u1l4";
import { POOL_U1L5 } from "./u1l5";

export const U1_EXAM: ExamDef = {
  id: "u1exam",
  unitId: "u1",
  title: "과학과 인류의 지속가능한 삶",
  pick: 20,
  pool: [...POOL_U1L1, ...POOL_U1L2, ...POOL_U1L3, ...POOL_U1L4, ...POOL_U1L5],
};
`;
writeFileSync("src/content/exams/u1.ts", asm);
console.log(`u1.ts 조립 ${FULL ? "완료(160문항)" : "생성(부분 " + blocks.length + "문항)"}`);
