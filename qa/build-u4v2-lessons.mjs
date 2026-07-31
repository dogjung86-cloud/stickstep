// u4 v2 이식 생성기(u7 v2판 계승 · 과학 9호): 스테이징 qa/u4v2-{pilot,rest-a~f}.ts의 문항 블록을
// 슬롯 순으로 재조립해 src/content/exams/u4l1~l6.ts + u4.ts를 재생성하고, 신작 헬퍼 일체를
// ui/examFigures.ts 말미 "u4 v2" 섹션으로 승격한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// 헬퍼 구간 추출은 인덱스 기반(g2u7 ⑥ 정규식 사고 재발 방지) · examFigures 마커 교체는
// **비탐욕**(자기 섹션 마커부터 다음 "// ── " 섹션 마커 직전까지만 — u7 빌드의 `MARK[\s\S]*$`가
// 뒤에 붙는 타 세션 섹션을 삼킬 수 있는 구조를 보정 · 설계표 §7).
// node qa/build-u4v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/u4v2-pilot.ts", "qa/u4v2-rest-a.ts", "qa/u4v2-rest-b.ts", "qa/u4v2-rest-c.ts", "qa/u4v2-rest-d.ts", "qa/u4v2-rest-e.ts", "qa/u4v2-rest-f.ts"];
const LESSON = {
  u4l1: { start: 201, end: 227, label: "입자의 운동" },
  u4l2: { start: 228, end: 254, label: "물질의 상태" },
  u4l3: { start: 255, end: 280, label: "상태 변화의 이름" },
  u4l4: { start: 281, end: 307, label: "상태 변화와 입자 배열" },
  u4l5: { start: 308, end: 334, label: "열에너지를 흡수하는 상태 변화" },
  u4l6: { start: 335, end: 360, label: "열에너지를 방출하는 상태 변화" },
};
// examFigures에서 import하게 될 헬퍼(신작 승격 + 기존 u4·공용 재사용).
const EXAM_HELPERS = [
  "svgTable",
  "stateFlowFig",
  "waterFreezeFig",
  "evapScaleFig",
  "dbox",
  "particleChangeFig",
  "stateTrioParamFig",
  "stateSingleFig",
  "meltMixFig",
  "iceLatticeFig",
  "evapBoilFig",
  "qualCurveFig",
  "phaseTriModelFig",
  "diffuseSeqFig",
  "openScaleFig",
  "syringeFig",
  "sealedPairFig",
  "dryiceBeakerFig",
  "flowQuizFig",
  "gasWeighFig",
  "volumeJumpFig",
  "ladleFig",
  "laundryTrioFig",
  "waterThreeFig",
  "pourFig",
  "iceCupFig",
  "winterSceneFig",
];

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
        const id = text.match(/id: "(u4e\d{3})"/)?.[1];
        const lessonId = text.match(/lessonId: "(u4l\d)"/)?.[1];
        if (!id || !lessonId) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("u4e", "")), id, lessonId, text });
        cur = null;
      }
    }
  }
}
if (blocks.length !== 160) throw new Error(`블록 ${blocks.length}개 ≠ 160`);

// ── 2. 신작 헬퍼 승격: 파일럿 헬퍼 구간(마커 ~ POOL 선언 직전)을 examFigures.ts "u4 v2" 섹션으로 ──
const pilotSrc = readFileSync("qa/u4v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("/* ══════════ 신작 헬퍼(이식 때 examFigures");
const hEnd = pilotSrc.indexOf("export const POOL_U4V2_PILOT");
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd);
helperBlock = helperBlock.replace(/const NS = `xmlns="http:\/\/www\.w3\.org\/2000\/svg"`;\n/, "");
helperBlock = helperBlock.replace(/\/\* ══════════ 신작 헬퍼[^\n]*\n/, "");
helperBlock = helperBlock.replace(/\/\* ── 이하 파일럿 문항 미사용[^\n]*\n/, "");

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
const MARK = "// ── u4 v2 신작(파일럿 승격 · 재출제 9호) ──";
const promoted = `${MARK}\n// 입자 운동 표현 3종이 정본(설계표 §8-2): 기체 = 블러 꼬리 · 고체 = 바깥 괄호 호 · 액체 = 2겹 괄호+회전.\n${helperBlock.trimEnd()}\n`;
const mIdx = fig.indexOf(MARK);
if (mIdx >= 0) {
  // 비탐욕 교체: 자기 마커부터 "다음 섹션 마커(\n// ── )" 직전까지만 바꾼다(뒤 섹션 보존).
  const nextIdx = fig.indexOf("\n// ── ", mIdx + MARK.length);
  const tail = nextIdx >= 0 ? fig.slice(nextIdx + 1) : "";
  fig = fig.slice(0, mIdx) + promoted + tail;
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: u4 v2 섹션 승격(신작 헬퍼 일체)");

// ── 3. 레슨 파일 생성 ──
const BASE_SNIPPET = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_SNIPPET = `const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/u4/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;

let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const want = L.end - L.start + 1;
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  if (arr.length !== want) { console.error(`FAIL ${lid}: ${arr.length}문항 ≠ ${want}`); fails++; continue; }
  for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  const body = arr.map((b) => b.text).join("\n");
  const usedExam = EXAM_HELPERS.filter((h) => body.includes(h + "("));
  const usesXimg = body.includes("ximg(");
  const n = Number(lid.replace("u4l", ""));
  const header = `// 중1 과학 IV. 물질의 상태 변화 · 단원 종합 평가 풀 v2: 레슨 ${n} ${L.label} (u4e${L.start}~e${L.end}, ${want}문항)
// ⚠ 이 파일은 qa/build-u4v2-lessons.mjs가 스테이징(qa/u4v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 재출제 9호(2026-07~08) · 정본 설계표 qa/u4-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: word 0 · num 0(실측 계산 0 · 구 "문두 수치 = 정답" 전량 소거) · diff 태그 · 그림은 자료 의존
// 설계 · 입자 검산(변화 전후 개수 12 = 12 · 진동 호는 덩어리 바깥쪽만 · 하얀 김 = 물방울).
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기 v2가 소스 전체를 스캔하므로 여기 나열하지 않는다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (usedExam.length) importLines.push(`import { ${usedExam.join(", ")} } from "../../ui/examFigures";`);
  const local = [`const L = "${lid}";`];
  if (usesXimg) local.push(BASE_SNIPPET, XIMG_SNIPPET);
  const bodyL = body.replaceAll(`lessonId: "${lid}"`, "lessonId: L");
  const out = `${header}\n${importLines.join("\n")}\n\n${local.join("\n")}\n\nexport const POOL_U4L${n}: ExamItem[] = [\n${bodyL}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${arr.length}문항 · examFigures ${usedExam.length}종${usesXimg ? " + ximg" : ""})`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }

// ── 4. 조립 파일 갱신 ──
const asm = `// 중1 과학 IV. 물질의 상태 변화 · 단원 종합 평가 문항 풀 v2(160제 = 27×4+26×2, 6레슨 · 재출제 9호).
// 문항은 레슨 파일(u4l1~u4l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 142 / multi 18 / num 0 / word 0 · diff 64/64/32 · 시각 92(사진 8장 전량 재사용).
// 규격·회피표·검산 기록 정본 = qa/u4-v2-blueprint.md, 이식 = qa/build-u4v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_U4L1 } from "./u4l1";
import { POOL_U4L2 } from "./u4l2";
import { POOL_U4L3 } from "./u4l3";
import { POOL_U4L4 } from "./u4l4";
import { POOL_U4L5 } from "./u4l5";
import { POOL_U4L6 } from "./u4l6";

export const U4_EXAM: ExamDef = {
  id: "u4exam",
  unitId: "u4",
  title: "물질의 상태 변화",
  pick: 20,
  pool: [...POOL_U4L1, ...POOL_U4L2, ...POOL_U4L3, ...POOL_U4L4, ...POOL_U4L5, ...POOL_U4L6],
};
`;
writeFileSync("src/content/exams/u4.ts", asm);
console.log("u4.ts 조립 갱신 · 이식 완료(160문항)");
