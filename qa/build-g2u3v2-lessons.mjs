// g2u3 v2 이식 생성기(u4 v2판 계승 · 과학 6호): 스테이징 qa/g2u3v2-{pilot,rest-a~e}.ts의 문항
// 블록을 슬롯 순으로 재조립해 src/content/exams/g2u3l1~l8.ts + g2u3.ts를 재생성하고, 파일럿
// 헬퍼 일체(신작 10종 + 개조판 4종 + 소품 ar/marc/badge)를 ui/examFigures.ts 말미 "g2u3 v2"
// 섹션으로 승격한다. 재실행 가능(멱등). 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시
// 돌린다(레슨 파일 직접 수정 금지). 헬퍼 구간 추출은 인덱스 기반 · examFigures 마커 교체는
// 비탐욕(자기 섹션 마커부터 다음 "\n// ── " 섹션 마커 직전까지만 — u4 §7 관행).
// examFigures.ts는 타 세션 M 상태일 수 있다 — 커밋은 합성 스테이징(메모리 관행).
// node qa/build-g2u3v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = [
  "qa/g2u3v2-pilot.ts",
  "qa/g2u3v2-rest-a.ts",
  "qa/g2u3v2-rest-b.ts",
  "qa/g2u3v2-rest-c.ts",
  "qa/g2u3v2-rest-d.ts",
  "qa/g2u3v2-rest-e.ts",
];
const LESSON = {
  g2u3l1: { start: 201, end: 218, label: "빛의 반사" },
  g2u3l2: { start: 219, end: 237, label: "빛의 굴절" },
  g2u3l3: { start: 238, end: 254, label: "물체를 보는 과정" },
  g2u3l4: { start: 255, end: 272, label: "평면거울의 상" },
  g2u3l5: { start: 273, end: 295, label: "거울과 렌즈" },
  g2u3l6: { start: 296, end: 318, label: "빛의 합성" },
  g2u3l7: { start: 319, end: 339, label: "파동의 발생과 전달" },
  g2u3l8: { start: 340, end: 360, label: "소리의 특성" },
};
// 문항 본문에서 호출되면 examFigures import에 올릴 헬퍼(승격분 + v1 파라미터형 재사용).
const EXAM_HELPERS = [
  "xLAE",
  "xLSR",
  "xLRP",
  "xLSEE",
  "xLMRfull",
  "xLMR",
  "xLMG",
  "xLXS",
  "xLOB",
  "xLVN",
  "xLSW",
  "xLFC",
  "xLCU",
  "xLWG",
  "xLW4",
  "lightProtractorFig",
  "lightPixelExamFig",
  "lightBalloonFig",
  "lightPipesFig",
  "lightAngleExamFig",
  "lightRefractUpFig",
  "lightSeePathFig",
  "lightMirrorGridFig",
  "lightWaveGraphFig",
  "lightWave4Fig",
];
// lightFigures(레슨 헬퍼 시험 데뷔)에서 import할 헬퍼.
const LIGHT_HELPERS = ["twoMirrorsFig", "twoLensFig"];

// ── 1. 스테이징에서 문항 블록 추출("  {" ~ "  },") ──
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
        const id = text.match(/id: "(g2u3e\d{3})"/)?.[1];
        const lessonId = text.match(/lessonId: "(g2u3l\d)"/)?.[1];
        if (!id || !lessonId) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("g2u3e", "")), id, lessonId, text });
        cur = null;
      }
    }
  }
}
if (blocks.length !== 160) throw new Error(`블록 ${blocks.length}개 ≠ 160`);

// ── 2. 헬퍼 승격: 파일럿 소품 마커 ~ PILOT_PREVIEW 직전을 examFigures.ts "g2u3 v2" 섹션으로 ──
const pilotSrc = readFileSync("qa/g2u3v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("/* ══════════ 공용 소품(이식 때 examFigures");
const hEnd = pilotSrc.indexOf("export const PILOT_PREVIEW");
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd);
helperBlock = helperBlock.replace(/const NS = `xmlns="http:\/\/www\.w3\.org\/2000\/svg"`;\n/, "");
helperBlock = helperBlock.replace(/\/\* ══════════ 공용 소품[^\n]*\n/, "");

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
const MARK = "// ── g2u3 v2 신작(파일럿 승격 · 재출제 6호) ──";
const promoted = `${MARK}\n// 거울 단면 marc() 몸통 문법이 정본(설계표 §8-2): 반사면 호 + 평평한 등 + 회색 채움 + 등 빗금.\n// LRP 경로 후보는 공간 정렬 고정(§8-1) · LWG/LW4는 v1 개조판(v1 함수와 공존 · 시험 전용).\n${helperBlock.trimEnd()}\n`;
const mIdx = fig.indexOf(MARK);
if (mIdx >= 0) {
  const nextIdx = fig.indexOf("\n// ── ", mIdx + MARK.length);
  const tail = nextIdx >= 0 ? fig.slice(nextIdx + 1) : "";
  fig = fig.slice(0, mIdx) + promoted + tail;
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: g2u3 v2 섹션 승격(신작 헬퍼 일체)");

// ── 3. 레슨 파일 생성 ──
const BASE_SNIPPET = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_SNIPPET = `const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/g2u3/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const XPAIR_SNIPPET = `const xpair = (a: string, altA: string, b: string, altB: string): string =>
  \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="\${IMG_BASE}exam/g2u3/\${a}" alt="\${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="\${IMG_BASE}exam/g2u3/\${b}" alt="\${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>\`;`;

let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const want = L.end - L.start + 1;
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  if (arr.length !== want) { console.error(`FAIL ${lid}: ${arr.length}문항 ≠ ${want}`); fails++; continue; }
  for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  const body = arr.map((b) => b.text).join("\n");
  const usedExam = EXAM_HELPERS.filter((h) => body.includes(h + "("));
  const usedLight = LIGHT_HELPERS.filter((h) => body.includes(h + "("));
  const usesXimg = body.includes("ximg(");
  const usesXpair = body.includes("xpair(");
  const n = Number(lid.replace("g2u3l", ""));
  const header = `// 중2 과학 III. 빛과 파동 · 단원 종합 평가 풀 v2: 레슨 ${n} ${L.label} (g2u3e${L.start}~e${L.end}, ${want}문항)
// ⚠ 이 파일은 qa/build-g2u3v2-lessons.mjs가 스테이징(qa/g2u3v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 재출제 6호(2026-08) · 정본 설계표 qa/g2u3-v2-blueprint.md(실측·회피표·§8 조정·검산 기록).
// 규격: word 0 · 계산 0(num 12 전량 그림 판독 동반) · diff 태그 · 광학 기하 전부 계산(반사=미러링 ·
// 굴절=스넬 1.33 · 상=대칭점) · 뒤집힘은 "모인 빛이 교차" · 프리즘은 "여러 색 빛으로 갈라짐" 서술.
// 언어 가드 금지어 목록은 설계표 §1이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (usedExam.length) importLines.push(`import { ${usedExam.join(", ")} } from "../../ui/examFigures";`);
  if (usedLight.length) importLines.push(`import { ${usedLight.join(", ")} } from "../../ui/lightFigures";`);
  const local = [`const L = "${lid}";`];
  if (usesXimg || usesXpair) local.push(BASE_SNIPPET);
  if (usesXimg) local.push(XIMG_SNIPPET);
  if (usesXpair) local.push(XPAIR_SNIPPET);
  const bodyL = body.replaceAll(`lessonId: "${lid}"`, "lessonId: L");
  const out = `${header}\n${importLines.join("\n")}\n\n${local.join("\n")}\n\nexport const POOL_G2U3L${n}: ExamItem[] = [\n${bodyL}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${arr.length}문항 · examFigures ${usedExam.length}종${usedLight.length ? " + lightFigures " + usedLight.length : ""}${usesXimg ? " + ximg" : ""}${usesXpair ? " + xpair" : ""})`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }

// ── 4. 조립 파일 갱신 ──
const asm = `// 중2 과학 III. 빛과 파동 · 단원 종합 평가 문항 풀 v2(160제 = 18+19+17+18+23+23+21+21, 8레슨 · 재출제 6호).
// 문항은 레슨 파일(g2u3l1~g2u3l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 132(bogi 25) / multi 16 / num 12 / word 0 · diff 64/64/32 · 시각 76(사진 11장 재사용).
// 규격·회피표·검산 기록 정본 = qa/g2u3-v2-blueprint.md, 이식 = qa/build-g2u3v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U3L1 } from "./g2u3l1";
import { POOL_G2U3L2 } from "./g2u3l2";
import { POOL_G2U3L3 } from "./g2u3l3";
import { POOL_G2U3L4 } from "./g2u3l4";
import { POOL_G2U3L5 } from "./g2u3l5";
import { POOL_G2U3L6 } from "./g2u3l6";
import { POOL_G2U3L7 } from "./g2u3l7";
import { POOL_G2U3L8 } from "./g2u3l8";

export const G2U3_EXAM: ExamDef = {
  id: "g2u3exam",
  unitId: "g2u3",
  title: "빛과 파동",
  pick: 20,
  pool: [
    ...POOL_G2U3L1,
    ...POOL_G2U3L2,
    ...POOL_G2U3L3,
    ...POOL_G2U3L4,
    ...POOL_G2U3L5,
    ...POOL_G2U3L6,
    ...POOL_G2U3L7,
    ...POOL_G2U3L8,
  ],
};
`;
writeFileSync("src/content/exams/g2u3.ts", asm);
console.log("g2u3.ts 조립 갱신 · 이식 완료(160문항)");
