// g2u6 v2 이식 생성기(u1 v2판 계승 · 과학 15호 · 신규 출제): 스테이징 qa/g2u6v2-{pilot,rest-a~f}.ts의
// 문항 블록을 슬롯 순으로 재조립해 src/content/exams/g2u6l1~l6.ts + g2u6.ts를 생성하고,
// 신작 헬퍼를 ui/examFigures.ts "g2u6 v2" 섹션으로 승격한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// node qa/build-g2u6v2-lessons.mjs   → 실행 직후 npx tsc --noEmit 의무.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const SRC = [
  "qa/g2u6v2-pilot.ts",
  "qa/g2u6v2-rest-a.ts",
  "qa/g2u6v2-rest-b.ts",
  "qa/g2u6v2-rest-c.ts",
  "qa/g2u6v2-rest-d.ts",
  "qa/g2u6v2-rest-e.ts",
  "qa/g2u6v2-rest-f.ts",
].filter((p) => existsSync(p));
const FULL = SRC.length === 7;

const LESSON = {
  g2u6l1: { start: 201, end: 226, label: "영양소" },
  g2u6l2: { start: 227, end: 253, label: "소화와 소화효소" },
  g2u6l3: { start: 254, end: 280, label: "순환계" },
  g2u6l4: { start: 281, end: 307, label: "호흡계와 호흡운동" },
  g2u6l5: { start: 308, end: 333, label: "배설계" },
  g2u6l6: { start: 334, end: 360, label: "세포호흡과 기관계의 통합" },
};

// 문항이 직접 부르는 헬퍼(examFigures에서 import). svgTable은 표 래퍼 안에서만 쓰여 목록에 없다.
const EXAM_HELPERS = [
  "dbox",
  "rasterFig",
  "rasterPair",
  "rasterArrows",
  "bodyTestTubesFig",
  "nutrientChartFig",
  "foodTableFig",
  "enzymeGridFig",
  "digestFlowFig",
  "circulationPathFig",
  "breathModelFig",
  "alveoliQuizFig",
  "gasTableFig",
  "urineTableFig",
  "checkupFig",
  "cellRespQuizFig",
  "systemsQuizFig",
  "activityTableFig",
  "dataTableFig",
  "factCardsFig",
  "transferFig",
];

// ── 1. 스테이징에서 문항 블록 추출 ──
const blocks = [];
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  let cur = null;
  for (const line of src.split("\n")) {
    if (line === "  {") { cur = [line]; continue; }
    if (cur) {
      cur.push(line);
      if (line === "  },") {
        const text = cur.join("\n");
        const id = text.match(/id: "(g2u6e\d{3})"/)?.[1];
        const lref = text.match(/lessonId: (L\d)/)?.[1];
        if (!id || !lref) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("g2u6e", "")), id, lessonId: `g2u6l${lref.slice(1)}`, text });
        cur = null;
      }
    }
  }
}
if (FULL && blocks.length !== 160) throw new Error(`블록 ${blocks.length}개 ≠ 160`);
console.log(`스테이징 ${SRC.length}개 · 문항 ${blocks.length}개${FULL ? "" : " (부분 이식)"}`);

// ── 2. 신작 헬퍼 승격 ──
// 구간 추출은 인덱스 기반(정규식 게으른 확장이 파일을 삼킨 g2u7 실사고 재발 방지).
const pilotSrc = readFileSync("qa/g2u6v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("/** 한글 줄바꿈");
const hEnd = pilotSrc.indexOf(`const L1 = "g2u6l1";`);
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd).trimEnd();
// 스테이징 로컬 이름을 섹션 전용으로(공용 파일 전역 충돌 방지 · u1 v2의 u1WrapKo 관행 확장)
helperBlock = helperBlock
  .replace(/\bwrapKo\b/g, "g2u6WrapKo")
  .replace(/\bjosa\b/g, "g2u6Josa")
  .replace(/\bmark\b/g, "g2u6Mark")
  .replace(/const T = \(/g, "const g2u6T = (")
  .replace(/\bT\(/g, "g2u6T(")
  .replace(/\btableAria\b/g, "g2u6TableAria")
  .replace(/\bTINT\b/g, "G2U6_TINT")
  .replace(/\bPin\b/g, "G2u6Pin")
  .replace(/\bIMG_BASE\b/g, "G2U6_IMG_BASE")
  // 문항 섹션 구분선이 헬퍼 구간 끝에 딸려 오면 잘라 낸다.
  .replace(/\n\/\/ ═+ 문항 ═+\s*$/, "");
// 갤러리에서는 상대 경로("")였던 자산 기준을 앱의 BASE_URL로 바꾼다.
const IMG_DECL = `const G2U6_IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
// 섹션 교체는 반드시 시작·종료 마커 "사이"만 — "마커 이후 전부"로 지우면 그 뒤에 다른 세션이
// append한 섹션을 통째로 삼킨다(2026-08-01 u1 v2 실사고).
const MARK = "// -- g2u6 v2 신작(파일럿 승격 · 신규 출제 15호) --";
const ENDMARK = "// -- g2u6 v2 섹션 끝 --";
const promoted = `${MARK}\n// 검출 시험관·영양소 도표·소화 격자·흐름도·순환 경로·호흡 모형·허파꽈리·기관계 도해 +\n// 발주 라스터 하이브리드 3종(기호 배지·2패널·방향 화살표) + 표/카드/이동 도해 범용 3종.\n// 전부 파라미터형 · aria는 파라미터에서 파생한다.\n${IMG_DECL}\n${helperBlock}\n${ENDMARK}\n`;
const si = fig.indexOf(MARK);
if (si >= 0) {
  const ei = fig.indexOf(ENDMARK, si);
  if (ei < 0) throw new Error(`${FIG}: 시작 마커는 있는데 종료 마커가 없다 — 수동 확인 필요(다른 섹션 삼킴 위험)`);
  fig = fig.slice(0, si) + promoted + fig.slice(ei + ENDMARK.length + 1);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: g2u6 v2 섹션 승격(마커 구간 교체)");

// ── 3. 레슨 파일 생성 ──
let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const want = L.end - L.start + 1;
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  if (FULL) {
    if (arr.length !== want) { console.error(`FAIL ${lid}: ${arr.length}문항 ≠ ${want}`); fails++; continue; }
    for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  } else if (!arr.length) { console.error(`FAIL ${lid}: 문항 0`); fails++; continue; }
  const body = arr.map((b) => b.text).join("\n");
  const used = EXAM_HELPERS.filter((h) => new RegExp(`\\b${h}\\(`).test(body));
  const n = Number(lid.replace("g2u6l", ""));
  const header = `// 중2 과학 VI. 동물과 에너지 · 단원 종합 평가 풀 v2: 레슨 ${n} ${L.label} (g2u6e${L.start}~e${L.end}${FULL ? "" : " 중 " + arr.length + "문항"})
// ⚠ 이 파일은 qa/build-g2u6v2-lessons.mjs가 스테이징(qa/g2u6v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 신규 출제(2026-08) · 정본 설계표 qa/g2u6-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: num 0 · word 0(실측 계산 0/40 · 개수 세기 0/40 · 그래프 0/40) · diff 태그 · 기호 판독 본진.
// 언어 가드 금지어 목록은 설계표 §1-2가 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (used.length) importLines.push(`import { ${used.join(", ")} } from "../../ui/examFigures";`);
  const bodyL = body.replaceAll(`lessonId: L${n}`, "lessonId: L");
  const out = `${header}\n${importLines.join("\n")}\n\nconst L = "${lid}";\n\nexport const POOL_G2U6L${n}: ExamItem[] = [\n${bodyL}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${arr.length}문항 · examFigures ${used.length}종)`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }

// ── 4. 조립 파일 ──
const asm = `// 중2 과학 VI. 동물과 에너지 · 단원 종합 평가 문항 풀 v2(160제 = 27×4 + 26×2, 6레슨 · 신규 출제).
// 문항은 레슨 파일(g2u6l1~g2u6l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 144(합답형 bogi 28) / multi 16 / num 0 / word 0 · diff 64/64/32 · 시각 116(72.5%).
// 규격·회피표·검산 기록 정본 = qa/g2u6-v2-blueprint.md, 이식 = qa/build-g2u6v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U6L1 } from "./g2u6l1";
import { POOL_G2U6L2 } from "./g2u6l2";
import { POOL_G2U6L3 } from "./g2u6l3";
import { POOL_G2U6L4 } from "./g2u6l4";
import { POOL_G2U6L5 } from "./g2u6l5";
import { POOL_G2U6L6 } from "./g2u6l6";

export const G2U6_EXAM: ExamDef = {
  id: "g2u6exam",
  unitId: "g2u6",
  title: "동물과 에너지",
  pick: 20,
  pool: [...POOL_G2U6L1, ...POOL_G2U6L2, ...POOL_G2U6L3, ...POOL_G2U6L4, ...POOL_G2U6L5, ...POOL_G2U6L6],
};
`;
writeFileSync("src/content/exams/g2u6.ts", asm);
console.log(`g2u6.ts 조립 ${FULL ? "완료(160문항)" : "생성(부분 " + blocks.length + "문항)"}`);
