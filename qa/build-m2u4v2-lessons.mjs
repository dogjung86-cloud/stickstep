// m2u4 v2 스테이징(qa/m2u4v2-*.ts) → src/content/exams/m2u4l1~l10.ts 생성기(m1u4판 계승).
// 문항 블록을 텍스트 그대로 이식(코드 변형 없음), 레슨별 분류·슬롯 순 정렬·필요 헬퍼만 import.
// 재실행 가능(감사 수정 반영 후 다시 돌리면 됨). node qa/build-m2u4v2-lessons.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";

const STAGING = [
  "qa/m2u4v2-pilot.ts",
  "qa/m2u4v2-rest-a.ts",
  "qa/m2u4v2-rest-b.ts",
  "qa/m2u4v2-rest-c.ts",
  "qa/m2u4v2-rest-d.ts",
  "qa/m2u4v2-rest-e.ts",
];
const HELPERS = [
  "m2ExamIsoFig", "m2ExamIsoLadderFig", "m2ExamIsoChainFig", "m2ExamExtIsoFig", "m2ExamRhPairsFig",
  "m2ExamTriCevFig", "m2ExamCenterFig", "m2ExamCircumRightFig", "mExamFoldFig", "m2ExamFoldCornerFig",
  "m2ExamMidPerpFig", "m2ExamRightPerpFig", "m2ExamIsoOIFig", "m2ExamParaFig", "m2ExamParaBisectFig",
  "m2ExamQuadDiagFig", "m2ExamFamilyFig", "m2ExamQuadRowFig", "m2ExamEquiTriFig", "m2ExamEqAreaFig",
];
const LESSON_TITLES = {
  1: "이등변삼각형의 성질 (책 140~144쪽)",
  2: "이등변삼각형이 되는 조건 (책 145~146쪽)",
  3: "직각삼각형의 합동 조건 (책 147~149쪽)",
  4: "삼각형의 외심 (책 150~153쪽)",
  5: "삼각형의 내심 (책 154~161쪽)",
  6: "평행사변형의 성질 (책 162~166쪽)",
  7: "평행사변형이 되는 조건 (책 167~171쪽)",
  8: "직사각형·마름모·정사각형 (책 172~175쪽)",
  9: "여러 가지 사각형의 관계 (책 176~178쪽)",
  10: "평행선과 넓이 (책 179~187쪽)",
};
// [mcq, multi, num] — blueprint §0(L7·L9만 9/3/8), diff는 전 레슨 8/8/4.
const SPEC = {
  1: [10, 2, 8], 2: [10, 2, 8], 3: [10, 2, 8], 4: [10, 2, 8], 5: [10, 2, 8],
  6: [10, 2, 8], 7: [9, 3, 8], 8: [10, 2, 8], 9: [9, 3, 8], 10: [10, 2, 8],
};

// 스테이징에서 문항 블록(텍스트) 추출
const items = [];
for (const f of STAGING) {
  const src = readFileSync(f, "utf8").replace(/\r\n/g, "\n");
  // 주석 속 "= [" 오탐 방지: 배열 선언부 시그니처로만 시작점을 잡는다(m2u5 실사고 계승).
  const marker = ": ExamItem[] = [";
  const start = src.indexOf(marker);
  const end = src.lastIndexOf("];");
  if (start < 0 || end < 0) throw new Error(`${f}: 배열 경계를 못 찾음`);
  const body = src.slice(start + marker.length, end);
  const parts = body.split(/\n  \},\n/).map((s) => s.trim()).filter((s) => s.startsWith("{") || s.startsWith("// ─") || s.includes("id:"));
  for (let p of parts) {
    const idx = p.indexOf("{");
    if (idx < 0) continue;
    p = p.slice(idx);
    if (!p.endsWith("},")) p += "\n  },";
    if (!p.endsWith(",")) p += ",";
    const id = p.match(/id: "(m2u4e\d{3})"/)?.[1];
    const lesson = p.match(/lessonId: "m2u4l(\d+)"/)?.[1];
    if (!id || !lesson) throw new Error(`${f}: id/lessonId 파싱 실패 — ${p.slice(0, 80)}`);
    items.push({ id, lesson: Number(lesson), text: p });
  }
}
if (items.length !== 200) throw new Error(`추출 ${items.length}문항 ≠ 200`);
const seen = new Set(items.map((i) => i.id));
if (seen.size !== 200) throw new Error("id 중복");
items.sort((a, b) => a.id.localeCompare(b.id));

const dry = process.argv.includes("--dry");
for (let L = 1; L <= 10; L += 1) {
  const group = items.filter((i) => i.lesson === L);
  if (group.length !== 20) throw new Error(`l${L}: ${group.length}문항 ≠ 20`);
  const first = group[0].id.replace("m2u4e", "");
  const last = group[group.length - 1].id.replace("m2u4e", "");
  const used = HELPERS.filter((h) => group.some((i) => i.text.includes(h + "(")));
  const needGsym = group.some((i) => i.text.includes("gsym("));
  const [m, M, n] = SPEC[L];
  const header = `// 중2 수학 Ⅳ. 삼각형과 사각형의 성질: 단원 종합 평가 풀 v2, 레슨 ${L} ${LESSON_TITLES[L]}
// (m2u4e${first}~e${last}) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u4-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq ${m} + multi ${M} + num ${n}, diff 8/8/4. word 0(규격 v2 · 교과서 실측: 용어 빈칸형 0).
// 그림 원칙: 수치는 라벨 단위 병기("34°"·"12 cm"·"x°"), 관계 조건은 문두, 각 그림 전부 실각 렌더(각 문항 주석 검산).
// 수치·앵커 배정은 설계표 §2·§8이 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴 ∥ ⊥ ≡ ▱ °), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
${needGsym ? `import { gsym } from "../../ui/geoKit";\n` : ""}${used.length ? `import {\n${used.map((h) => `  ${h},`).join("\n")}\n} from "../../ui/examFiguresMath";\n` : ""}
export const POOL_M2U4L${L}: ExamItem[] = [
${group.map((i) => "  " + i.text).join("\n")}
];
`;
  const out = `src/content/exams/m2u4l${L}.ts`;
  if (dry) console.log(`[dry] ${out}: ${group.length}문항, 헬퍼 ${used.length}종${needGsym ? " + gsym" : ""}`);
  else {
    writeFileSync(out, header);
    console.log(`${out}: ${group.length}문항 저장(헬퍼 ${used.length}종${needGsym ? " + gsym" : ""})`);
  }
}
console.log(dry ? "\n드라이런 완료(파일 미저장)" : "\n이식 완료 — 다음: node qa/check-exam-m2u4.mjs → tsc/build → e2e");
