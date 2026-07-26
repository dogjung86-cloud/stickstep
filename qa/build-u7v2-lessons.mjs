// u7 v2 이식 생성기(g2u7 v2판 계승 · 과학 3호): 스테이징 qa/u7v2-{pilot,rest-a~e}.ts의 문항 블록을
// 슬롯 순으로 재조립해 src/content/exams/u7l1~l6.ts + u7.ts를 재생성하고, 신작 헬퍼 12종+dbox를
// ui/examFigures.ts 말미 "u7 v2" 섹션으로 승격한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// 함수 본문 교체가 없는 순수 승격형 · 헬퍼 구간 추출은 인덱스 기반(g2u7 ⑥ 정규식 사고 재발 방지).
// node qa/build-u7v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/u7v2-pilot.ts", "qa/u7v2-rest-a.ts", "qa/u7v2-rest-b.ts", "qa/u7v2-rest-c.ts", "qa/u7v2-rest-d.ts", "qa/u7v2-rest-e.ts"];
const LESSON = {
  u7l1: { start: 201, end: 227, label: "태양계 구성 천체" },
  u7l2: { start: 228, end: 253, label: "행성 분류" },
  u7l3: { start: 254, end: 280, label: "태양의 활동" },
  u7l4: { start: 281, end: 307, label: "지구의 자전과 공전" },
  u7l5: { start: 308, end: 333, label: "달의 위상 변화" },
  u7l6: { start: 334, end: 360, label: "일식과 월식" },
};
// examFigures에서 import하게 될 헬퍼(신작 승격 12종 + dbox + 기존 u7·공용)
const EXAM_HELPERS = [
  "planetOrderFig",
  "moonPhase8Fig",
  "eclipseShadowFig",
  "starSpinFig",
  "svgTable",
  "sunspotCycleFig",
  "sunLabelFig",
  "skyTrailFig",
  "starSpinChoiceFig",
  "zodiacExamFig",
  "earthDayNightFig",
  "moonPosFig",
  "eclipseAlignFig",
  "eclipseProgressFig",
  "planetFlowFig",
  "phaseCardsFig",
  "westSkyFig",
  "dbox",
];
const SPACE_HELPERS = ["uranusTiltFig", "planetGroupsFig", "fivePhasesFig", "eclipseModelFig", "lunarPathFig"];

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
        const id = text.match(/id: "(u7e\d{3})"/)?.[1];
        const lessonId = text.match(/lessonId: "(u7l\d)"/)?.[1];
        if (!id || !lessonId) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("u7e", "")), id, lessonId, text });
        cur = null;
      }
    }
  }
}
if (blocks.length !== 160) throw new Error(`블록 ${blocks.length}개 ≠ 160`);

// ── 2. 신작 헬퍼 승격: 파일럿 헬퍼 구간(마커~부록 직전)을 examFigures.ts "u7 v2" 섹션으로 ──
const pilotSrc = readFileSync("qa/u7v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("/* ══════════ 신작 헬퍼(이식 때 examFigures");
const hEnd = pilotSrc.indexOf("/** 파일럿 부록");
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd);
helperBlock = helperBlock.replace(/const NS = `xmlns="http:\/\/www\.w3\.org\/2000\/svg"`;\n/, "");
helperBlock = helperBlock.replace(/\/\* ══════════ 신작 헬퍼[^\n]*\n/, "");
// dbox(파일럿 상단 정의 · 자료 상자)도 함께 승격 — 파일럿 소스에서 추출
const dboxM = pilotSrc.match(/\/\*\* 조건 자료 상자[\s\S]*?\n(export const dbox =[\s\S]*?`;\n)/);
if (!dboxM) throw new Error("dbox 정의를 찾지 못함");
const dboxBlock = `/** 조건 자료 상자(u7 v2 · 미래엔 2 계보 — 텍스트 조건 (가)(나)(다)). 시각자료로 집계한다. */\n${dboxM[1]}`;
// sunLabelFig가 참조하는 IMG_BASE를 섹션 로컬 상수로 주입
const IMGB = `const U7_IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";\n`;
helperBlock = helperBlock.replace(/\bIMG_BASE\b/g, "U7_IMG_BASE");

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
const MARK = "// ── u7 v2 신작(파일럿 승격 · 재출제 3호) ──";
const promoted = `${MARK}\n// 다크 우주 문법(u7 섹션 계승): 밝은 반구 = 태양 쪽 · 회전 반시계 · figureDark: true.\n${IMGB}${dboxBlock}\n${helperBlock.trimEnd()}\n`;
if (fig.includes(MARK)) {
  fig = fig.replace(new RegExp(MARK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*$"), promoted);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: u7 v2 섹션 승격(신작 12종 + dbox)");

// ── 3. 레슨 파일 생성 ──
const BASE_SNIPPET = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_SNIPPET = `const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/u7/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const PIMG_SNIPPET = `const pimg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}photos/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const PPAIR_SNIPPET = `const ppair = (a: string, altA: string, b: string, altB: string): string =>
  \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="\${IMG_BASE}photos/\${a}" alt="\${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="\${IMG_BASE}photos/\${b}" alt="\${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>\`;`;

let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const want = L.end - L.start + 1;
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  if (arr.length !== want) { console.error(`FAIL ${lid}: ${arr.length}문항 ≠ ${want}`); fails++; continue; }
  for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  const body = arr.map((b) => b.text).join("\n");
  const usedExam = EXAM_HELPERS.filter((h) => body.includes(h + "("));
  const usedSpace = SPACE_HELPERS.filter((h) => body.includes(h + "("));
  const usesXimg = body.includes("ximg(");
  const usesPimg = body.includes("pimg(");
  const usesPpair = body.includes("ppair(");
  const n = Number(lid.replace("u7l", ""));
  const header = `// 중1 과학 VII. 태양계 · 단원 종합 평가 풀 v2: 레슨 ${n} ${L.label} (u7e${L.start}~e${L.end}, ${want}문항)
// ⚠ 이 파일은 qa/build-u7v2-lessons.mjs가 스테이징(qa/u7v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 재출제 3호(2026-07) · 정본 설계표 qa/u7-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: word 0 · v1 산술 num 소거(흑점 그래프 판독 num 2만) · diff 태그 · 그림은 자료 의존 설계 ·
// 천체 검산(밝은 반구 = 태양 쪽 · 반시계 · 일식은 태양 오른쪽부터 · 월식은 달 왼쪽부터).
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기 v2가 소스 전체를 스캔하므로 여기 나열하지 않는다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (usedExam.length) importLines.push(`import { ${usedExam.join(", ")} } from "../../ui/examFigures";`);
  if (usedSpace.length) importLines.push(`import { ${usedSpace.join(", ")} } from "../../ui/spaceFigures";`);
  const local = [`const L = "${lid}";`];
  if (usesXimg || usesPimg || usesPpair) local.push(BASE_SNIPPET);
  if (usesXimg) local.push(XIMG_SNIPPET);
  if (usesPimg || usesPpair) local.push(PIMG_SNIPPET);
  if (usesPpair) local.push(PPAIR_SNIPPET);
  const bodyL = body.replaceAll(`lessonId: "${lid}"`, "lessonId: L");
  const out = `${header}\n${importLines.join("\n")}\n\n${local.join("\n")}\n\nexport const POOL_U7L${n}: ExamItem[] = [\n${bodyL}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${arr.length}문항 · examFigures ${usedExam.length}종 · spaceFigures ${usedSpace.length}종${usesXimg ? "+ximg" : ""}${usesPimg ? "+pimg" : ""}${usesPpair ? "+ppair" : ""})`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }

// ── 4. 조립 파일 갱신 ──
const asm = `// 중1 과학 VII. 태양계 · 단원 종합 평가 문항 풀 v2(160제 = 27×4+26×2, 6레슨 · 재출제 3호).
// 문항은 레슨 파일(u7l1~u7l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 140 / multi 18 / num 2 / word 0 · diff 64/64/32 · 시각 106(사진 재사용+신규 NASA 9).
// 규격·회피표·검산 기록 정본 = qa/u7-v2-blueprint.md, 이식 = qa/build-u7v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_U7L1 } from "./u7l1";
import { POOL_U7L2 } from "./u7l2";
import { POOL_U7L3 } from "./u7l3";
import { POOL_U7L4 } from "./u7l4";
import { POOL_U7L5 } from "./u7l5";
import { POOL_U7L6 } from "./u7l6";

export const U7_EXAM: ExamDef = {
  id: "u7exam",
  unitId: "u7",
  title: "태양계",
  pick: 20,
  pool: [...POOL_U7L1, ...POOL_U7L2, ...POOL_U7L3, ...POOL_U7L4, ...POOL_U7L5, ...POOL_U7L6],
};
`;
writeFileSync("src/content/exams/u7.ts", asm);
console.log("u7.ts 조립 갱신 · 이식 완료(160문항)");
