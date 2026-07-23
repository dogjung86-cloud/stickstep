// m1u4 v2 스테이징(qa/m1u4v2-*.ts) → src/content/exams/m1u4l1~l13.ts 생성기(m2u5판 계승).
// 문항 블록을 텍스트 그대로 이식(코드 변형 없음), 레슨별 분류·슬롯 순 정렬·필요 헬퍼만 import.
// 재실행 가능(감사 수정 반영 후 다시 돌리면 됨). node qa/build-m1u4v2-lessons.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";

const STAGING = [
  "qa/m1u4v2-pilot.ts",
  "qa/m1u4v2-rest-a.ts",
  "qa/m1u4v2-rest-b.ts",
  "qa/m1u4v2-rest-c.ts",
  "qa/m1u4v2-rest-d.ts",
  "qa/m1u4v2-rest-e.ts",
];
const HELPERS = [
  "mExamSolidFig", "mExamPointsLineFig", "m4AngleExamFig", "mExamAngleFanFig", "mExamXAnglesFig",
  "m4PerpDistanceFig", "m4ConstructionBisectorFig", "m4TransversalExamFig", "m4BoxRelationsFig",
  "mExamCutBoxFig", "mExamCubeNetFig", "mExamZigzagFig", "mExamFoldFig", "mExamCopyAngleFig",
  "mExamCopyLenFig", "mExamTriSidesFig", "m4TriangleConditionFig", "m4CongruenceExamFig",
  "m4SurveyFig", "mExamTwinEquiFig", "mExamStarCrossFig", "mExamQuadSidesFig", "mExamSquareOverlapFig",
];
const LESSON_TITLES = {
  1: "점, 선, 면 (책 144~145쪽)",
  2: "직선, 반직선, 선분 (책 145~147쪽)",
  3: "각 (책 148~149쪽)",
  4: "맞꼭지각 (책 149~150쪽)",
  5: "수직 (책 151쪽)",
  6: "위치 관계 1: 평면 (책 152~153쪽)",
  7: "위치 관계 2: 공간과 꼬인 위치 (책 154~156쪽)",
  8: "동위각과 엇각 (책 157쪽)",
  9: "평행선의 성질 (책 158~160쪽)",
  10: "작도 (책 166~168쪽)",
  11: "삼각형: 세 변과 결정조건 (책 169~172쪽)",
  12: "합동 (책 173~175쪽)",
  13: "합동의 활용 (책 178~183쪽)",
};
// [mcq, multi, num, diff 문자열] — blueprint §0(diff는 현행 diffQuota 계승)
const SPEC = {
  1: [7, 2, 6, "6/7/2"], 2: [7, 2, 6, "7/5/3"], 3: [6, 2, 7, "6/7/2"], 4: [7, 2, 6, "6/6/3"],
  5: [7, 2, 6, "6/6/3"], 6: [7, 2, 6, "6/6/3"], 7: [7, 2, 6, "6/5/4"], 8: [7, 2, 6, "6/6/3"],
  9: [7, 2, 7, "6/6/4"], 10: [10, 2, 4, "6/7/3"], 11: [8, 2, 6, "6/6/4"], 12: [8, 2, 6, "7/6/3"],
  13: [8, 2, 6, "6/7/3"],
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
    const id = p.match(/id: "(m1u4e\d{3})"/)?.[1];
    const lesson = p.match(/lessonId: "m1u4l(\d+)"/)?.[1];
    if (!id || !lesson) throw new Error(`${f}: id/lessonId 파싱 실패 — ${p.slice(0, 80)}`);
    items.push({ id, lesson: Number(lesson), text: p });
  }
}
if (items.length !== 200) throw new Error(`추출 ${items.length}문항 ≠ 200`);
const seen = new Set(items.map((i) => i.id));
if (seen.size !== 200) throw new Error("id 중복");
items.sort((a, b) => a.id.localeCompare(b.id));

const dry = process.argv.includes("--dry");
for (let L = 1; L <= 13; L += 1) {
  const group = items.filter((i) => i.lesson === L);
  const expect = L >= 9 ? 16 : 15;
  if (group.length !== expect) throw new Error(`l${L}: ${group.length}문항 ≠ ${expect}`);
  const first = group[0].id.replace("m1u4e", "");
  const last = group[group.length - 1].id.replace("m1u4e", "");
  const used = HELPERS.filter((h) => group.some((i) => i.text.includes(h + "(")));
  const needGsym = group.some((i) => i.text.includes("gsym("));
  const [m, M, n, diff] = SPEC[L];
  const header = `// 중1 수학 Ⅳ. 기본 도형: 단원 종합 평가 풀 v2, 레슨 ${L} ${LESSON_TITLES[L]}
// (m1u4e${first}~e${last}) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m1u4-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq ${m} + multi ${M} + num ${n}, diff ${diff}. word 0(규격 v2 · 교과서 실측: 용어 빈칸형 0).
// 그림 원칙: 수치는 라벨 단위 병기("35°"·"12 cm"·"x°"), 관계 조건은 문두, 각 그림 전부 실각 렌더(각 문항 주석 검산).
// 수치·앵커 배정은 설계표 §2가 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴 ∥ ⊥ ≡ °), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
${needGsym ? `import { gsym } from "../../ui/geoKit";\n` : ""}${used.length ? `import {\n${used.map((h) => `  ${h},`).join("\n")}\n} from "../../ui/examFiguresMath";\n` : ""}
export const POOL_M1U4L${L}: ExamItem[] = [
${group.map((i) => "  " + i.text).join("\n")}
];
`;
  const out = `src/content/exams/m1u4l${L}.ts`;
  if (dry) console.log(`[dry] ${out}: ${group.length}문항, 헬퍼 ${used.length}종${needGsym ? " + gsym" : ""}`);
  else {
    writeFileSync(out, header);
    console.log(`${out}: ${group.length}문항 저장(헬퍼 ${used.length}종${needGsym ? " + gsym" : ""})`);
  }
}
console.log(dry ? "\n드라이런 완료(파일 미저장)" : "\n이식 완료 — 다음: node qa/check-exam-m1u4.mjs → tsc/build → e2e");
