// u6 v2 이식 생성기(u5 v2판 계승 · 과학 재출제 5호): 스테이징 qa/u6v2-{pilot,rest-a~e}.ts의
// 문항 블록을 슬롯 순으로 재조립해 src/content/exams/u6l1~l5.ts + u6.ts를 재생성하고,
// 신작 헬퍼를 ui/examFigures.ts "u6 v2" 섹션으로 승격한다.
// u5판과의 차이: 신작 헬퍼가 파일럿뿐 아니라 rest-a~e에도 분산 저작돼 있어(확대 데뷔 14종)
// 여섯 파일의 헬퍼 구간을 pilot → a → b → c → d → e 순서로 이어 붙여 승격한다(파일 간 참조는
// 전부 함수 본문 안이라 선언 순서 무관 · import 라인은 구간 밖이라 미포함).
// 재실행 가능(멱등) · 수정은 반드시 스테이징에서 한 뒤 재실행(레슨 파일 직접 수정 금지).
// 섹션 교체는 시작·종료 마커 사이만(종료 마커 소실 시 throw — u1 v2 §13 공유 파일 사고 계보).
// 실행 뒤 반드시 npx tsc --noEmit.
// node qa/build-u6v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/u6v2-pilot.ts", "qa/u6v2-rest-a.ts", "qa/u6v2-rest-b.ts", "qa/u6v2-rest-c.ts", "qa/u6v2-rest-d.ts", "qa/u6v2-rest-e.ts"];

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
    const id = block.match(/id: "(u6e\d{3})"/)?.[1];
    if (id) items.set(id, block);
    i = j + 1;
  }
}
if (items.size !== 160) {
  console.error(`문항 ${items.size} ≠ 160 · 이식 중단`);
  process.exit(1);
}

const LESSONS = [
  ["u6l1", 201, 232, "기체의 압력"],
  ["u6l2", 233, 264, "보일 법칙"],
  ["u6l3", 265, 296, "생활 속 보일"],
  ["u6l4", 297, 328, "샤를 법칙"],
  ["u6l5", 329, 360, "생활 속 샤를"],
];

// ── 2. 신작 헬퍼 승격: 여섯 스테이징의 헬퍼 구간을 examFigures.ts "u6 v2" 섹션으로 ──
const HELPER_SPAN = [
  ["qa/u6v2-pilot.ts", "/* ══════════ 신작 헬퍼(이식 때 examFigures", "export const POOL_U6V2_PILOT"],
  ["qa/u6v2-rest-a.ts", "/* ══════════ 신작 헬퍼(확대 데뷔", "/* ══════════ L1 잔여"],
  ["qa/u6v2-rest-b.ts", "/* ══════════ 신작 헬퍼(확대 데뷔", "/* ══════════ L2 잔여"],
  ["qa/u6v2-rest-c.ts", "/* ══════════ 신작 헬퍼(확대 데뷔", "/* ══════════ L3 잔여"],
  ["qa/u6v2-rest-d.ts", "/* ══════════ 신작 헬퍼(확대 데뷔", "/* ══════════ L4 잔여"],
  ["qa/u6v2-rest-e.ts", "/* ══════════ 신작 헬퍼(확대 데뷔", "/* ══════════ L5 잔여"],
];
const helperParts = [];
for (const [p, startMark, endMark] of HELPER_SPAN) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const hStart = src.indexOf(startMark);
  const hEnd = src.indexOf(endMark);
  if (hStart < 0 || hEnd < 0) throw new Error(`${p} 헬퍼 구간 마커를 찾지 못함`);
  let block = src.slice(hStart, hEnd);
  block = block.replace(/const NS = `xmlns="http:\/\/www\.w3\.org\/2000\/svg"`;\n/, "");
  block = block.replace(/\/\* ══════════ 신작 헬퍼[^\n]*\n/, "");
  helperParts.push(`// ── (${p.replace("qa/u6v2-", "").replace(".ts", "")} 저작분) ──\n${block.trimEnd()}`);
}

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
const MARK = "// ── u6 v2 신작(스테이징 승격 · 재출제 5호) ──";
const MARK_END = "// ── u6 v2 신작 끝 ──";
const promoted = `${MARK}\n// 기체 단원 문법: 입자 운동 = 블러 꼬리(gasTailP 계보 · 화살표 잔상 금지) · 꼬리 세기 2단만 ·\n// 밀폐 비교 문항은 입자 수 동일(주입 슬롯 BALL2만 차등 허용) · 그래프 dots는 점만(가이드 점선\n// 금지) · 상태 표현(부풂·찌그러짐)은 실루엣 한 덩어리(윤곽 밖 덧선 금지 · 함몰 제어점은 안쪽) ·\n// 장면 SVG도 파운드리 재질 문법(3스톱 그라데이션 · 키라이트 · 접촉 그림자 · 최암색 윤곽).\n${helperParts.join("\n\n")}\n${MARK_END}\n`;
if (fig.includes(MARK)) {
  const s = fig.indexOf(MARK);
  const e = fig.indexOf(MARK_END);
  if (e < 0) throw new Error("u6 v2 종료 마커 소실 — 수동 확인 필요(마커~끝 교체 금지)");
  fig = fig.slice(0, s) + promoted + fig.slice(e + MARK_END.length + 1);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: u6 v2 섹션 승격(파일럿 13종 + 확대 데뷔분)");

// ── 3. 레슨 파일 생성 ──
const FROM_EXAM = [
  // 기존 examFigures 재사용
  "svgTable", "dbox", "gasBottleSpongeFig", "gasPistonDuoFig", "gasTvChoicesFig",
  // u6 v2 승격 신작(파일럿)
  "gasBoxesExamFig", "gasShrinkChoicesFig", "gasSyringeExamFig", "snowBootsFig", "deepSeaBoxFig",
  "twoBottlesFig", "gasTvQualFig", "waterBathFig", "stuckBowlsFig", "bottleBalloonFig", "canCoolFig",
  "gasPvGraphV2Fig", "gasTvGraphV2Fig",
  // u6 v2 승격 신작(확대)
  "brickStackFig", "thumbtackFig", "rescueMatFig", "sofaChairFig", "ballPumpFig",
  "gasPvChoicesFig", "gasFlowFig", "gasPistonTrioFig", "balloonPressFig", "airShoeFig", "bottleSqueezeFig",
  "gasVacuumJarFig", "airBedFig", "bubbleRiseFig", "cushionBoxFig", "riseBalloonFig", "vacuumGraphFig",
  "gasHeatChoicesFig", "syringeWarmFig", "gasTvQual2Fig", "coldBalloonFig", "syringeTwoOpsFig", "waterBath2Fig",
  "coinBottleFig", "eggJarFig", "bottleWarmFig", "winterKickFig", "fountainToyFig", "hotairDownFig",
];
const BASE_LOCAL = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_LOCAL = `/** 발주 실사 임베드 · loading=lazy 금지(사고 #14). alt는 관찰 서술만(정답·현상 해석 금지). */
const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/u6/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;

for (const [lid, s, e, title] of LESSONS) {
  const blocks = [];
  for (let n = s; n <= e; n++) {
    const id = `u6e${n}`;
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
  const n = Number(lid.replace("u6l", ""));
  const header = `// 중1 과학 VI. 기체의 성질 · 단원 종합 평가 풀 v2: 레슨 ${n} ${title} (u6e${s}~e${e}, ${e - s + 1}문항)
// ⚠ 이 파일은 qa/build-u6v2-lessons.mjs가 스테이징(qa/u6v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 재출제 5호(2026-08) · 정본 설계표 qa/u6-v2-blueprint.md(실측·회피표·§7 검수 기록).
// 규격: word 0 · num 16(전량 자료 동반 · 곱/자연값 검산 주석) · diff 태그 · 시각 100/160 의존 설계 ·
// 기체 검산 세트(압력 = 면적당 힘 · 기체 압력 = 충돌·모든 방향 · 보일 = 온도 일정+곱 일정 ·
// 샤를 = 압력 일정+일정 비율 증가·절편>0 · 밀폐면 입자 수·크기 불변 · "더 자주"와 "더 빠르게" 구분 ·
// 입자 수가 변하는 상황(주입·진공 포장·흡착·열기구)은 법칙 라벨 금지).
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기 check-exam-u6.mjs가 소스 전체를 스캔한다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (exImports.length) importLines.push(`import { ${exImports.join(", ")} } from "../../ui/examFigures";`);
  const out = `${header}\n${importLines.join("\n")}\n${locals.length ? "\n" + locals.join("\n") + "\n" : ""}
export const POOL_U6L${n}: ExamItem[] = [
${body}
];
`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${e - s + 1}문항 · examFigures ${exImports.length}종${usesXimg ? "+ximg" : ""})`);
}

// ── 4. 조립 파일 갱신 ──
const asm = `// 중1 과학 VI. 기체의 성질 · 단원 종합 평가 문항 풀 v2(160제 = 32×5, 5레슨 · 재출제 5호).
// 문항은 레슨 파일(u6l1~u6l5)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 129 / multi 15 / num 16 / word 0 · diff 64/64/32 · 시각 100(사진 10장 = 재사용 8+신규 2).
// 규격·회피표·검산 기록 정본 = qa/u6-v2-blueprint.md, 이식 = qa/build-u6v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_U6L1 } from "./u6l1";
import { POOL_U6L2 } from "./u6l2";
import { POOL_U6L3 } from "./u6l3";
import { POOL_U6L4 } from "./u6l4";
import { POOL_U6L5 } from "./u6l5";

export const U6_EXAM: ExamDef = {
  id: "u6exam",
  unitId: "u6",
  title: "기체의 성질",
  pick: 20,
  pool: [...POOL_U6L1, ...POOL_U6L2, ...POOL_U6L3, ...POOL_U6L4, ...POOL_U6L5],
};
`;
writeFileSync("src/content/exams/u6.ts", asm);
console.log("u6.ts 조립 갱신 · 이식 완료(160문항)");
