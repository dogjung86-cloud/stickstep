// u5 v2 이식 생성기(u3 v2판 계승 · 과학 재출제 7호): 스테이징 qa/u5v2-{pilot,rest-a~e}.ts의
// 문항 블록을 슬롯 순으로 재조립해 src/content/exams/u5l1~l7.ts + u5.ts를 재생성하고,
// 신작 헬퍼(AR·FB·GD·SH·BS·FR·TJ + twoBoxesFig)를 ui/examFigures.ts "u5 v2" 섹션으로 승격한다.
// 재실행 가능(멱등) · 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// 섹션 교체는 시작 마커 ~ 파일 끝이 아니라 "이 스크립트가 심은 마커 구간"만(u1 v2 §13 공유 파일
// 사고 방지 — u5는 현재 examFigures 말미 배치라 마커~끝 교체가 안전하지만, 종료 마커를 함께 심어
// 뒤에 다른 세션 섹션이 붙어도 삼키지 않게 한다). 실행 뒤 반드시 npx tsc --noEmit.
// node qa/build-u5v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/u5v2-pilot.ts", "qa/u5v2-rest-a.ts", "qa/u5v2-rest-b.ts", "qa/u5v2-rest-c.ts", "qa/u5v2-rest-d.ts", "qa/u5v2-rest-e.ts"];

// ── 1. 스테이징에서 문항 블록 수집(최상위 "  {" ~ 짝 맞는 "  }") ──
const items = new Map();
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const arrStart = src.indexOf("ExamItem[] = [");
  const body = src.slice(src.indexOf("[", arrStart) + 1, src.lastIndexOf("];"));
  let i = 0;
  while (i < body.length) {
    const start = body.indexOf("\n  {", i);
    if (start === -1) break;
    let depth = 0;
    let j = start + 1;
    let inStr = null;
    let prev = "";
    for (; j < body.length; j++) {
      const ch = body[j];
      if (inStr) {
        if (ch === inStr && prev !== "\\") inStr = null;
      } else if (ch === '"' || ch === "'" || ch === "`") inStr = ch;
      else if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
      prev = ch;
    }
    const block = body.slice(start + 1, j + 1);
    const id = block.match(/id: "(u5e\d{3})"/)?.[1];
    if (id) items.set(id, block);
    i = j + 1;
  }
}
if (items.size !== 160) {
  console.error(`문항 ${items.size} ≠ 160 · 이식 중단`);
  process.exit(1);
}

const LESSONS = [
  ["u5l1", 201, 220, "힘의 표현"],
  ["u5l2", 221, 242, "힘의 평형"],
  ["u5l3", 243, 265, "중력"],
  ["u5l4", 266, 288, "탄성력"],
  ["u5l5", 289, 312, "마찰력"],
  ["u5l6", 313, 336, "부력"],
  ["u5l7", 337, 360, "힘과 운동"],
];

// ── 2. 신작 헬퍼 승격: 파일럿 헬퍼 구간을 examFigures.ts "u5 v2" 섹션으로(시작·종료 마커 사이만 교체) ──
const pilotSrc = readFileSync("qa/u5v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("/* ══════════ 신작 헬퍼(이식 때 examFigures");
const hEnd = pilotSrc.indexOf("/* ══════════ 파일럿 40문항");
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd);
helperBlock = helperBlock.replace(/const NS = `xmlns="http:\/\/www\.w3\.org\/2000\/svg"`;\n/, "");
helperBlock = helperBlock.replace(/\/\* ══════════ 신작 헬퍼[^\n]*\n/, "");

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
const MARK = "// ── u5 v2 신작(파일럿 승격 · 재출제 7호) ──";
const MARK_END = "// ── u5 v2 신작 끝 ──";
const promoted = `${MARK}\n// 힘 단원 문법: 화살표 길이 = 값 비례(코드 보장) · 방향이 정답인 문항은 후보 화살표 ㉮~ 제시형만 ·\n// 운동 방향은 속이 빈 초록(힘과 구분) · 저울류 표시창은 빈 패널(값은 콜아웃) · quiet 옵션은\n// 조건 값이 곧 정답인 평형 문항 전용(aria 값 낭독 생략 · 값은 문두가 제공).\n${helperBlock.trimEnd()}\n${MARK_END}\n`;
if (fig.includes(MARK)) {
  const s = fig.indexOf(MARK);
  const e = fig.indexOf(MARK_END);
  if (e < 0) throw new Error("u5 v2 종료 마커 소실 — 수동 확인 필요(마커~끝 교체 금지)");
  fig = fig.slice(0, s) + promoted + fig.slice(e + MARK_END.length + 1);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: u5 v2 섹션 승격(신작 7종 + twoBoxesFig)");

// ── 3. 레슨 파일 생성 ──
const FROM_EXAM = [
  "forcePairFig", "pushStillFig", "springExamGraph", "svgTable", "dbox", "floatBallFig", "motionFlowFig",
  "arrowAnatFig", "forceSceneFig", "gravityDirsFig", "springHangFig", "buoyScaleFig", "frictionRigFig",
  "trajStroboFig", "twoBoxesFig",
];
const BASE_LOCAL = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_LOCAL = `/** 발주 실사 임베드 · loading=lazy 금지(사고 #14). alt는 관찰 서술만(정답·해석 금지). */
const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/u5/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;

for (const [lid, s, e, title] of LESSONS) {
  const blocks = [];
  for (let n = s; n <= e; n++) {
    const id = `u5e${n}`;
    const b = items.get(id);
    if (!b) {
      console.error(`누락: ${id}`);
      process.exit(1);
    }
    blocks.push("  " + b);
  }
  const body = blocks.join(",\n") + ",";
  const used = (sym) => new RegExp(`\\b${sym}\\(`).test(body);
  const exImports = FROM_EXAM.filter(used);
  const usesXimg = used("ximg");
  const locals = [];
  if (usesXimg) {
    locals.push(BASE_LOCAL);
    locals.push(XIMG_LOCAL);
  }
  const n = Number(lid.replace("u5l", ""));
  const header = `// 중1 과학 V. 힘의 작용 · 단원 종합 평가 풀 v2: 레슨 ${n} ${title} (u5e${s}~e${e}, ${e - s + 1}문항)
// ⚠ 이 파일은 qa/build-u5v2-lessons.mjs가 스테이징(qa/u5v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 재출제 7호(2026-08) · 정본 설계표 qa/u5-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: word 0 · num 24(전량 자료 동반) · diff 태그 · 그림은 자료 의존 설계 · 힘 검산 세트
// (같은 방향 합·반대 방향 차 · 평형 = 한 물체+크기 같음+방향 반대 · 정지/일정한 속력 = 알짜힘 0 ·
// 무게 = 질량×9.8 단서 제시 · 달 1/6 · 용수철 비례 · 부력 = 공기 중 − 물속 · 마찰력 = 운동 반대).
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기 v2가 소스 전체를 스캔한다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (exImports.length) importLines.push(`import { ${exImports.join(", ")} } from "../../ui/examFigures";`);
  const out = `${header}\n${importLines.join("\n")}\n${locals.length ? "\n" + locals.join("\n") + "\n" : ""}
export const POOL_U5L${n}: ExamItem[] = [
${body}
];
`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${e - s + 1}문항 · examFigures ${exImports.length}종${usesXimg ? "+ximg" : ""})`);
}

// ── 4. 조립 파일 갱신 ──
const asm = `// 중1 과학 V. 힘의 작용 · 단원 종합 평가 문항 풀 v2(160제 = 20+22+23+23+24+24+24, 7레슨 · 재출제 7호).
// 문항은 레슨 파일(u5l1~u5l7)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 122 / multi 14 / num 24 / word 0 · diff 64/64/32 · 시각 106(발주 실사 12장 포함).
// 규격·회피표·검산 기록 정본 = qa/u5-v2-blueprint.md, 이식 = qa/build-u5v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_U5L1 } from "./u5l1";
import { POOL_U5L2 } from "./u5l2";
import { POOL_U5L3 } from "./u5l3";
import { POOL_U5L4 } from "./u5l4";
import { POOL_U5L5 } from "./u5l5";
import { POOL_U5L6 } from "./u5l6";
import { POOL_U5L7 } from "./u5l7";

export const U5_EXAM: ExamDef = {
  id: "u5exam",
  unitId: "u5",
  title: "힘의 작용",
  pick: 20,
  pool: [...POOL_U5L1, ...POOL_U5L2, ...POOL_U5L3, ...POOL_U5L4, ...POOL_U5L5, ...POOL_U5L6, ...POOL_U5L7],
};
`;
writeFileSync("src/content/exams/u5.ts", asm);
console.log("u5.ts 조립 갱신 · 이식 완료(160문항)");
