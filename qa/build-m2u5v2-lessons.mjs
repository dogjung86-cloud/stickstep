// m2u5 v2 스테이징(qa/m2u5v2-*.ts) → src/content/exams/m2u5l1~l11.ts 생성기.
// 문항 블록을 텍스트 그대로 이식(코드 변형 없음), 레슨별 분류·슬롯 순 정렬·필요 헬퍼만 import.
// 재실행 가능(감사 수정 반영 후 다시 돌리면 됨). node qa/build-m2u5v2-lessons.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";

const STAGING = [
  "qa/m2u5v2-pilot.ts",
  "qa/m2u5v2-rest-a.ts",
  "qa/m2u5v2-rest-b.ts",
  "qa/m2u5v2-rest-c.ts",
  "qa/m2u5v2-rest-d.ts",
  "qa/m2u5v2-rest-e.ts",
];
const HELPERS = [
  "m2ExamSimQuadPairFig", "m2ExamTriPairFig", "m2ExamTriSplitFig", "m2ExamXCrossFig", "m2ExamRightAltFig",
  "m2ExamParaLinesFig", "m2ExamTrapCutFig", "m2ExamMidsegFig", "m2ExamMidQuadFig", "m2ExamCentroidFig",
  "m2ExamPythaSquaresFig", "m2ExamRightTriFig", "m2ExamGridRightFig", "m2ExamConeCutFig", "m2ExamSolidPairFig",
  "m2ExamFrameFig", "m2ExamSectorPairFig", "m2ExamBoxFig",
];
const LESSON_TITLES = {
  1: "도형의 닮음: 크기만 다른 쌍둥이 (책 190~193쪽)",
  2: "여러 가지 닮은 도형: 평면과 입체 (책 193~196쪽)",
  3: "넓이의 비와 부피의 비 (책 197~198쪽)",
  4: "삼각형의 닮음 조건: SSS·SAS·AA (책 199~201쪽)",
  5: "닮은 삼각형 찾기: 겹친 삼각형 (책 202~203쪽)",
  6: "삼각형과 평행선: 나란히 같은 비 (책 204~205쪽)",
  7: "삼각형의 중점연결정리 (책 206쪽)",
  8: "평행선 사이의 선분의 길이의 비 (책 207쪽)",
  9: "삼각형의 무게중심 (책 208~210쪽)",
  10: "피타고라스 정리 (책 216~220쪽)",
  11: "직각삼각형이 되는 조건 (책 221쪽)",
};
const QUOTA = { default: "mcq 9 + multi 2 = 11 · num 7", big: "mcq 10 + multi 2 = 12 · num 7" };
const DIFFS = { 1: "7/8/3", 2: "7/7/4", 3: "7/7/4", 4: "8/8/3", 5: "7/7/4", 6: "7/7/4", 7: "7/7/4", 8: "7/7/4", 9: "7/7/4", 10: "8/8/3", 11: "8/7/3" };

// 스테이징에서 문항 블록(텍스트) 추출
const items = [];
for (const f of STAGING) {
  const src = readFileSync(f, "utf8").replace(/\r\n/g, "\n");
  // 주석 속 "= [" 오탐 방지: 배열 선언부 시그니처로만 시작점을 잡는다(파일럿 헤더 실사고).
  const marker = ": ExamItem[] = [";
  const start = src.indexOf(marker);
  const end = src.lastIndexOf("];");
  if (start < 0 || end < 0) throw new Error(`${f}: 배열 경계를 못 찾음`);
  const body = src.slice(start + marker.length, end);
  // 항목 경계: 최상위 "  {" ~ "  },"  (본문 문자열에는 이 정확한 들여쓰기 조합이 없음)
  const parts = body.split(/\n  \},\n/).map((s) => s.trim()).filter((s) => s.startsWith("{") || s.startsWith("// ─") || s.includes("id:"));
  for (let p of parts) {
    // 구분 주석(── L2 … ─ 등)이 블록 앞에 붙어 있으면 제거
    const idx = p.indexOf("{");
    if (idx < 0) continue;
    p = p.slice(idx);
    if (!p.endsWith("},")) p += "\n  },";
    if (!p.endsWith(",")) p += ",";
    const id = p.match(/id: "(m2u5e\d{3})"/)?.[1];
    const lesson = p.match(/lessonId: "m2u5l(\d+)"/)?.[1];
    if (!id || !lesson) throw new Error(`${f}: id/lessonId 파싱 실패 — ${p.slice(0, 80)}`);
    items.push({ id, lesson: Number(lesson), text: p });
  }
}
if (items.length !== 200) throw new Error(`추출 ${items.length}문항 ≠ 200`);
const seen = new Set(items.map((i) => i.id));
if (seen.size !== 200) throw new Error("id 중복");
items.sort((a, b) => a.id.localeCompare(b.id));

const dry = process.argv.includes("--dry");
for (let L = 1; L <= 11; L += 1) {
  const group = items.filter((i) => i.lesson === L);
  const expect = L === 4 || L === 10 ? 19 : 18;
  if (group.length !== expect) throw new Error(`l${L}: ${group.length}문항 ≠ ${expect}`);
  const first = group[0].id.replace("m2u5e", "");
  const last = group[group.length - 1].id.replace("m2u5e", "");
  const used = HELPERS.filter((h) => group.some((i) => i.text.includes(h + "(")));
  const needGsym = group.some((i) => i.text.includes("gsym("));
  const header = `// 중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리: 단원 종합 평가 풀 v2, 레슨 ${L} ${LESSON_TITLES[L]}
// (m2u5e${first}~e${last}) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u5-v2-blueprint.md, 규격 v2).
// 유형 쿼터: ${L === 4 || L === 10 ? QUOTA.big : QUOTA.default}, diff ${DIFFS[L]}. word 0(규격 v2, 교과서 실측 계승).
// 그림 원칙: 수치는 라벨 단위 병기("12 cm"·"x cm"), 관계 조건은 문두, 실각·실비 검산 완료(각 문항 주석).
// 트리플·앵커 배정은 설계표 §2·§2-1이 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
${needGsym ? `import { gsym } from "../../ui/geoKit";\n` : ""}${used.length ? `import {\n${used.map((h) => `  ${h},`).join("\n")}\n} from "../../ui/examFiguresMath";\n` : ""}
export const POOL_M2U5L${L}: ExamItem[] = [
${group.map((i) => "  " + i.text).join("\n")}
];
`;
  const out = `src/content/exams/m2u5l${L}.ts`;
  if (dry) console.log(`[dry] ${out}: ${group.length}문항, 헬퍼 ${used.length}종${needGsym ? " + gsym" : ""}`);
  else {
    writeFileSync(out, header);
    console.log(`${out}: ${group.length}문항 저장(헬퍼 ${used.length}종${needGsym ? " + gsym" : ""})`);
  }
}
console.log(dry ? "\n드라이런 완료(파일 미저장)" : "\n이식 완료 — 다음: node qa/check-exam-m2u5.mjs → tsc/build → e2e");
