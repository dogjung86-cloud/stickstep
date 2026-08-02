// g2u5 v2 이식 생성기(u1 v2판 계승 · 과학 14호 · 신규 출제): 스테이징 qa/g2u5v2-{pilot,rest-a~f}.ts의
// 문항 블록을 슬롯 순으로 재조립해 src/content/exams/g2u5l1~l6.ts + g2u5.ts를 생성하고,
// 신작 헬퍼 9종을 ui/examFigures.ts 말미 "g2u5 v2" 섹션으로 승격한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// 파일럿만 있으면 부분 이식 · 전 파일이 있으면 160 전수 검사.
// ⚠ 실행 직후 반드시 tsc(공유 파일 사고 방지 · u1 v2 §13).
// node qa/build-g2u5v2-lessons.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const SRC = [
  "qa/g2u5v2-pilot.ts", "qa/g2u5v2-rest-a.ts", "qa/g2u5v2-rest-b.ts", "qa/g2u5v2-rest-c.ts",
  "qa/g2u5v2-rest-d.ts", "qa/g2u5v2-rest-e.ts", "qa/g2u5v2-rest-f.ts",
].filter((p) => existsSync(p));
const FULL = SRC.length === 7;
const LESSON = {
  g2u5l1: { start: 201, end: 227, label: "잎 속 양분 공장" },
  g2u5l2: { start: 228, end: 254, label: "광합성의 증거 찾기" },
  g2u5l3: { start: 255, end: 281, label: "광합성을 바꾸는 세 조건" },
  g2u5l4: { start: 282, end: 307, label: "식물도 숨을 쉬어요" },
  g2u5l5: { start: 308, end: 334, label: "광합성과 호흡의 맞물림" },
  g2u5l6: { start: 335, end: 360, label: "잎에서 열매까지, 양분의 여행" },
};
// examFigures에서 import하게 될 헬퍼(신작 승격 9종 + 공용 재사용 4종).
// ⚠ variableTableFig·inquiryFlowFig는 examFigures의 "u1 v2" 섹션에 산다. u1 세션이 그 섹션을
//   재생성해도 내용은 같지만, 시그니처가 바뀌면 g2u5도 함께 깨진다(공유 의존 기록).
const EXAM_HELPERS = [
  "svgTable", "dbox", "variableTableFig", "inquiryFlowFig",
  "psExchangeFig", "leafPartsFig", "starchLeafFig", "gasSensorFig", "sealedPlantFig",
  "factorGraphFig", "dayNightGasFig", "rateBarsFig", "transportRouteFig",
];

// ── 1. 스테이징에서 문항 블록 + 최상위 로컬 상수 추출 ──
// 로컬 const(공유 자료셋)는 쓰는 레슨 파일에 함께 심는다(m1u3 v2 이식 관행).
const LOCAL_SKIP = new Set(["IMG_BASE", "ximg", "pimg", "NS", "L1", "L2", "L3", "L4", "L5", "L6"]);
const locals = [];
const blocks = [];
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const head = src.slice(0, src.indexOf("export const POOL_"));
  const declStart = head.indexOf(`const L1 = "g2u5l1";`);
  const declZone = declStart >= 0 ? head.slice(declStart) : "";
  for (const m of declZone.matchAll(/^const (\w+)\s*=\s*([\s\S]*?);\n/gm)) {
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
        const id = text.match(/id: "(g2u5e\d{3})"/)?.[1];
        const lref = text.match(/lessonId: (L\d)/)?.[1];
        if (!id || !lref) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("g2u5e", "")), id, lessonId: `g2u5l${lref.slice(1)}`, text });
        cur = null;
      }
    }
  }
}
if (FULL && blocks.length !== 160) throw new Error(`블록 ${blocks.length}개 != 160`);
console.log(`스테이징 ${SRC.length}개 · 문항 ${blocks.length}개${FULL ? "" : " (부분 이식)"}`);

// ── 2. 신작 헬퍼 승격: 파일럿의 헬퍼 구간을 examFigures "g2u5 v2" 섹션으로 ──
// 구간 추출은 인덱스 기반(정규식 게으른 확장이 파일을 삼킨 g2u7 실사고 재발 방지).
// 시작은 NS 선언 다음(examFigures에 이미 NS가 있으므로 중복 선언 금지), 끝은 레슨 상수 직전.
const pilotSrc = readFileSync("qa/g2u5v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const H_START = "// ── g2u5 v2 공용 팔레트";
const hStart = pilotSrc.indexOf(H_START);
const hEnd = pilotSrc.indexOf(`const L1 = "g2u5l1";`);
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
const helperBlock = pilotSrc.slice(hStart, hEnd).trimEnd();

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
// ⚠ 섹션 교체는 반드시 시작·종료 마커 "사이"만. "마커 이후 전부"로 지우면 그 뒤에 다른 세션이
// append한 섹션을 통째로 삼킨다(u1 v2 §13 실사고: u3·u4 헬퍼 33종 소실).
// ⚠ 마커 문자열에는 em대시를 쓰지 않는다(일괄 치환이 마커까지 바꾼 g2u4 v2 실사고).
const MARK = "/* ============== g2u5 v2 신작(파일럿 승격 · 신규 출제 14호) ============== */";
const ENDMARK = "/* ============== g2u5 v2 end ============== */";
const promoted = `${MARK}
// 물질 출입 도해·잎 단면·아이오딘 잎·기체 센서 곡선·밀폐 용기 패널·요인 곡선·낮밤 출입·
// 광합성량 호흡량 막대·물관 체관 경로. 전부 파라미터형 · aria는 파라미터에서 파생.
// 수정은 qa/g2u5v2-pilot.ts에서 한 뒤 qa/build-g2u5v2-lessons.mjs를 다시 돌린다.
${helperBlock}
${ENDMARK}
`;
const si = fig.indexOf(MARK);
if (si >= 0) {
  const ei = fig.indexOf(ENDMARK, si);
  if (ei < 0) throw new Error(`${FIG}: 시작 마커는 있는데 종료 마커가 없다 · 수동 확인 필요(다른 섹션 삼킴 위험)`);
  fig = fig.slice(0, si) + promoted + fig.slice(ei + ENDMARK.length + 1);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: g2u5 v2 섹션 승격(신작 9종 · 마커 구간 교체)");

// ── 3. 레슨 파일 생성 ──
const BASE_SNIPPET = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_SNIPPET = `const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/g2u5/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const PIMG_SNIPPET = `const pimg = (path: string, alt: string): string =>
  \`<img src="\${IMG_BASE}plant/\${path}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;

let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const want = L.end - L.start + 1;
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  if (FULL) {
    if (arr.length !== want) { console.error(`FAIL ${lid}: ${arr.length}문항 != ${want}`); fails++; continue; }
    for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  } else if (!arr.length) { console.error(`FAIL ${lid}: 문항 0`); fails++; continue; }
  const body = arr.map((b) => b.text).join("\n");
  const usedExam = EXAM_HELPERS.filter((h) => body.includes(h + "("));
  const usesXimg = body.includes("ximg(");
  const usesPimg = body.includes("pimg(");
  const n = Number(lid.replace("g2u5l", ""));
  const header = `// 중2 과학 V. 식물과 에너지 · 단원 종합 평가 풀 v2: 레슨 ${n} ${L.label} (g2u5e${L.start}~e${L.end}${FULL ? "" : " 중 " + arr.length + "문항"})
// 이 파일은 qa/build-g2u5v2-lessons.mjs가 스테이징(qa/g2u5v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 신규 출제(2026-08) · 정본 설계표 qa/g2u5-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: num 0 · word 0(3사 실측 계산 0/38 · 개수 세기 0/38) · diff 태그 · 그림은 자료 의존 설계.
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (usedExam.length) importLines.push(`import { ${usedExam.join(", ")} } from "../../ui/examFigures";`);
  const local = [`const L = "${lid}";`];
  if (usesXimg || usesPimg) local.push(BASE_SNIPPET);
  if (usesXimg) local.push(XIMG_SNIPPET);
  if (usesPimg) local.push(PIMG_SNIPPET);
  for (const c of locals) {
    if (new RegExp(`\\b${c.name}\\b`).test(body)) local.push(c.text);
  }
  const bodyL = body.replaceAll(`lessonId: L${n}`, "lessonId: L");
  const out = `${header}\n${importLines.join("\n")}\n\n${local.join("\n")}\n\nexport const POOL_G2U5L${n}: ExamItem[] = [\n${bodyL}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${arr.length}문항 · examFigures ${usedExam.length}종${usesXimg ? " +ximg" : ""}${usesPimg ? " +pimg" : ""})`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }

// ── 4. 조립 파일 ──
const asm = `// 중2 과학 V. 식물과 에너지 · 단원 종합 평가 문항 풀 v2(160제 = 27x4 + 26x2, 6레슨 · 신규 출제).
// 문항은 레슨 파일(g2u5l1~g2u5l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 144 / multi 16 / num 0 / word 0 · diff 64/64/32 · 시각 112(도해·표·자료 상자·사진 18문항).
// 규격·회피표·검산 기록 정본 = qa/g2u5-v2-blueprint.md, 이식 = qa/build-g2u5v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U5L1 } from "./g2u5l1";
import { POOL_G2U5L2 } from "./g2u5l2";
import { POOL_G2U5L3 } from "./g2u5l3";
import { POOL_G2U5L4 } from "./g2u5l4";
import { POOL_G2U5L5 } from "./g2u5l5";
import { POOL_G2U5L6 } from "./g2u5l6";

export const G2U5_EXAM: ExamDef = {
  id: "g2u5exam",
  unitId: "g2u5",
  title: "식물과 에너지",
  pick: 20,
  pool: [...POOL_G2U5L1, ...POOL_G2U5L2, ...POOL_G2U5L3, ...POOL_G2U5L4, ...POOL_G2U5L5, ...POOL_G2U5L6],
};
`;
writeFileSync("src/content/exams/g2u5.ts", asm);
console.log(`g2u5.ts 조립 ${FULL ? "완료(160문항)" : "생성(부분 " + blocks.length + "문항)"}`);
