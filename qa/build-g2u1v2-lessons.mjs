// g2u1 v2 이식 생성기(u5 v2판 계승 · 과학 재출제 11호): 스테이징 qa/g2u1v2-{pilot,rest-a~e}.ts의
// 문항 블록을 슬롯 순으로 재조립해 src/content/exams/g2u1l1~l9.ts + g2u1.ts를 재생성하고,
// 신작 헬퍼(SC2·GT·SF·PM·FT·MB + chemBoilCurvesParamFig)를 ui/examFigures.ts "g2u1 v2" 섹션으로 승격한다.
// 재실행 가능(멱등) · 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// 섹션 교체는 시작·종료 마커 사이만(종료 마커 없으면 throw · u1 §13 공유 파일 사고 방지).
// 실행 뒤 반드시 npx tsc --noEmit.
// node qa/build-g2u1v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/g2u1v2-pilot.ts", "qa/g2u1v2-rest-a.ts", "qa/g2u1v2-rest-b.ts", "qa/g2u1v2-rest-c.ts", "qa/g2u1v2-rest-d.ts", "qa/g2u1v2-rest-e.ts"];

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
    const id = block.match(/id: "(g2u1e\d{3})"/)?.[1];
    if (id) items.set(id, block);
    i = j + 1;
  }
}
if (items.size !== 160) {
  console.error(`문항 ${items.size} ≠ 160 · 이식 중단`);
  process.exit(1);
}

const LESSONS = [
  ["g2u1l1", 201, 218, "물질의 특성과 밀도"],
  ["g2u1l2", 219, 236, "뜨고 가라앉기"],
  ["g2u1l3", 237, 254, "고체의 용해도"],
  ["g2u1l4", 255, 271, "기체의 용해도"],
  ["g2u1l5", 272, 289, "녹는점과 끓는점"],
  ["g2u1l6", 290, 307, "순물질과 혼합물"],
  ["g2u1l7", 308, 325, "밀도 차로 분리하기"],
  ["g2u1l8", 326, 342, "재결정"],
  ["g2u1l9", 343, 360, "증류"],
];

// ── 2. 신작 헬퍼 승격: 파일럿 헬퍼 구간을 examFigures.ts "g2u1 v2" 섹션으로(시작·종료 마커 사이만 교체) ──
const pilotSrc = readFileSync("qa/g2u1v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("/* ══════════ 신작 헬퍼");
const hEnd = pilotSrc.indexOf("/* ══════════ 파일럿 40 문항");
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd);
helperBlock = helperBlock.replace(/const NS = `xmlns="http:\/\/www\.w3\.org\/2000\/svg"`;\n/, "");
helperBlock = helperBlock.replace(/\/\* ══════════ 신작 헬퍼[^\n]*\n/, "");

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
const MARK = "// ── g2u1 v2 신작(파일럿 승격 · 재출제 11호) ──";
const MARK_END = "// ── g2u1 v2 신작 끝 ──";
const promoted = `${MARK}\n// 물질의 특성 그림 문법: 기포·결정 등 '결과'는 그리지 않는다(예측 과제 중립) · 라벨은 (가)(나)·㉠㉡ 중립 ·\n// aria는 파라미터 파생 중립 문구(값·정오 낭독 금지) · 값 읽기 문항의 판독점은 반드시 눈금선 위 ·\n// chemBoilCurvesParamFig는 chemFigures.chemBoilCurvesFig(고정 58/82)의 시험용 파라미터판.\n${helperBlock.trimEnd()}\n${MARK_END}\n`;
if (fig.includes(MARK)) {
  const s = fig.indexOf(MARK);
  const e = fig.indexOf(MARK_END);
  if (e < 0) throw new Error("g2u1 v2 종료 마커 소실 — 수동 확인 필요(마커~끝 교체 금지)");
  fig = fig.slice(0, s) + promoted + fig.slice(e + MARK_END.length + 1);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: g2u1 v2 섹션 승격(신작 6종 + chemBoilCurvesParamFig)");

// ── 3. 레슨 파일 생성 ──
const FROM_EXAM = [
  "chemSolCurveExamFig", "chemMassVolExamFig", "chemColumnFig", "chemFunnelABFig",
  "chemDistillApparatusFig", "examCurveFig", "svgTable", "dbox",
  "chemScatterExamFig", "chemGasTubesFig", "chemSepFlowFig", "chemPureMixFig",
  "chemFilterFig", "chemMixBoilFig", "chemBoilCurvesParamFig",
];
const FROM_CHEM = ["solCurves3Fig", "crudeTowerFig", "waterSaltBoilFig"];
const BASE_LOCAL = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_LOCAL = `/** 발주 실사 임베드 · loading=lazy 금지(사고 #14). alt는 관찰 서술만(정답·해석 금지). */
const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/g2u1/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;

for (const [lid, s, e, title] of LESSONS) {
  const blocks = [];
  for (let n = s; n <= e; n++) {
    const id = `g2u1e${n}`;
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
  const chemImports = FROM_CHEM.filter(used);
  const usesXimg = used("ximg");
  // e278류 인라인 import.meta 표현식은 IMG_BASE 상수를 안 쓴다 — 문자열 "IMG_BASE" 실사용만 근거로 삼는다.
  const usesBase = usesXimg || body.includes("IMG_BASE");
  const locals = [];
  if (usesBase) locals.push(BASE_LOCAL);
  if (usesXimg) locals.push(XIMG_LOCAL);
  const n = Number(lid.replace("g2u1l", ""));
  const header = `// 중2 과학 I. 물질의 특성 · 단원 종합 평가 풀 v2: 레슨 ${n} ${title} (g2u1e${s}~e${e}, ${e - s + 1}문항)
// ⚠ 이 파일은 qa/build-g2u1v2-lessons.mjs가 스테이징(qa/g2u1v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 재출제 11호(2026-08) · 정본 설계표 qa/g2u1-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: word 0 · num 20(전량 계산·판독 + 자료 동반) · diff 태그 · 전 시각 = 자료 의존 설계 ·
// 과학 검산 세트(밀도 = 질량÷부피 · 아래층 = 밀도 큼 · 석출 = 녹인 양−냉각 한계 + 물 양 비례 환산 ·
// 기체 용해도 = 低온·高압 · 끓는점은 압력만이 움직임 · 수평 구간 = 물질 고유 온도 · 혼합물 곡선은 오르막 ·
// 분별 깔때기 = 마개 열고 아래층부터 경계 잠금 · 증류 = 낮은 끓는점 먼저 · 증류탑 위 = 낮은 끓는점).
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기 v2가 소스 전체를 스캔한다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (exImports.length) importLines.push(`import { ${exImports.join(", ")} } from "../../ui/examFigures";`);
  if (chemImports.length) importLines.push(`import { ${chemImports.join(", ")} } from "../../ui/chemFigures";`);
  const out = `${header}\n${importLines.join("\n")}\n${locals.length ? "\n" + locals.join("\n") + "\n" : ""}
export const POOL_G2U1L${n}: ExamItem[] = [
${body}
];
`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${e - s + 1}문항 · examFigures ${exImports.length}종${chemImports.length ? " + chemFigures " + chemImports.length + "종" : ""}${usesXimg ? " + ximg" : ""})`);
}

// ── 4. 조립 파일 갱신 ──
const asm = `// 중2 과학 I. 물질의 특성 · 단원 종합 평가 문항 풀 v2(160제 = 18×7 + 17×2, 9레슨 · 재출제 11호).
// 문항은 레슨 파일(g2u1l1~g2u1l9)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 122 / multi 18 / num 20 / word 0 · diff 64/64/32 · 시각 112(사진 10장 전량 재사용).
// 규격·회피표·검산 기록 정본 = qa/g2u1-v2-blueprint.md, 이식 = qa/build-g2u1v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U1L1 } from "./g2u1l1";
import { POOL_G2U1L2 } from "./g2u1l2";
import { POOL_G2U1L3 } from "./g2u1l3";
import { POOL_G2U1L4 } from "./g2u1l4";
import { POOL_G2U1L5 } from "./g2u1l5";
import { POOL_G2U1L6 } from "./g2u1l6";
import { POOL_G2U1L7 } from "./g2u1l7";
import { POOL_G2U1L8 } from "./g2u1l8";
import { POOL_G2U1L9 } from "./g2u1l9";

export const G2U1_EXAM: ExamDef = {
  id: "g2u1exam",
  unitId: "g2u1",
  title: "물질의 특성",
  pick: 20,
  pool: [
    ...POOL_G2U1L1,
    ...POOL_G2U1L2,
    ...POOL_G2U1L3,
    ...POOL_G2U1L4,
    ...POOL_G2U1L5,
    ...POOL_G2U1L6,
    ...POOL_G2U1L7,
    ...POOL_G2U1L8,
    ...POOL_G2U1L9,
  ],
};
`;
writeFileSync("src/content/exams/g2u1.ts", asm);
console.log("g2u1.ts 조립 갱신 · 이식 완료(160문항)");
