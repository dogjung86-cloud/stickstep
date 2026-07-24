// m1u5 v2 스테이징(qa/m1u5v2-*.ts) → src/content/exams/m1u5l1~l14.ts 생성기(m2u5판 계승).
// 문항 블록을 텍스트 그대로 이식(코드 변형 없음), 레슨별 분류·슬롯 순 정렬·필요 헬퍼만 import.
// 재실행 가능(검산 수정 반영 후 다시 돌리면 됨). node qa/build-m1u5v2-lessons.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";

const STAGING = [
  "qa/m1u5v2-pilot.ts",
  "qa/m1u5v2-rest-a.ts",
  "qa/m1u5v2-rest-b.ts",
  "qa/m1u5v2-rest-c.ts",
  "qa/m1u5v2-rest-d.ts",
  "qa/m1u5v2-rest-e.ts",
];
const HELPERS = [
  "m5TriAngleFig", "m5PolyAngleFig", "m5CirclePartsFig", "m5CircleRatioFig", "m5SectorXFig",
  "m5RotateFig", "m5RotateChoicesFig", "m5SolidDimFig", "m5LensFig", "mExamSolidFig",
  "m5StarFig", "m5TubeFig", "m5NetConeFig", "m5FrustumFig", "m5CompositeFig", "m5TriPrismDimFig",
  "m5TriChainFig", "m5RollFig", "m5NetPrismFig", "m5PlatonicNetFig", "m5PyramidDimFig",
  "m5WaterFig", "m5ShellFig", "m5PolyJoinFig", "m5CircleParallelFig", "mExamCubeNetFig",
];
const LESSON_TITLES = {
  1: "다각형: 대각선의 규칙 (책 188쪽)",
  2: "삼각형: 각의 두 법칙 (책 189쪽)",
  3: "내각의 합 (책 190~191쪽)",
  4: "외각의 합 (책 192~193쪽)",
  5: "원과 부채꼴: 원의 부품 (책 194~195쪽)",
  6: "부채꼴의 성질 (책 196~197쪽)",
  7: "호와 넓이: π의 등장 (책 198~199쪽)",
  8: "다면체 (책 206~207쪽)",
  9: "정다면체 (책 208~209쪽)",
  10: "회전체 (책 210~213쪽)",
  11: "기둥의 겉넓이와 부피 (책 214~217쪽)",
  12: "뿔의 겉넓이와 부피 (책 218~221쪽)",
  13: "구의 겉넓이와 부피 (책 222~224쪽)",
  14: "아르키메데스: 3:2:1 (책 228~230쪽)",
};
const COUNTS = [14, 14, 14, 14, 14, 14, 15, 14, 14, 14, 15, 15, 15, 14];
const QUOTAS = ["m6/M2/n6", "m5/M2/n7", "m6/M2/n6", "m6/M2/n6", "m8/M2/n4", "m7/M2/n5", "m6/M2/n7",
  "m6/M2/n6", "m7/M2/n5", "m8/M2/n4", "m6/M2/n7", "m6/M2/n7", "m6/M2/n7", "m6/M2/n6"];
const DIFFS = ["6/5/3", "5/6/3", "6/5/3", "5/6/3", "6/6/2", "5/6/3", "6/6/3", "6/5/3", "5/6/3", "6/6/2",
  "6/6/3", "6/6/3", "6/6/3", "6/5/3"];

// 스테이징에서 문항 블록(텍스트) 추출
const items = [];
for (const f of STAGING) {
  const src = readFileSync(f, "utf8").replace(/\r\n/g, "\n");
  // 주석 속 "= [" 오탐 방지: 배열 선언부 시그니처로만 시작점을 잡는다(m2u5 파일럿 헤더 실사고 계승).
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
    const id = p.match(/id: "(m1u5e\d{3})"/)?.[1];
    const lesson = p.match(/lessonId: "m1u5l(\d+)"/)?.[1];
    if (!id || !lesson) throw new Error(`${f}: id/lessonId 파싱 실패 - ${p.slice(0, 80)}`);
    items.push({ id, lesson: Number(lesson), text: p });
  }
}
if (items.length !== 200) throw new Error(`추출 ${items.length}문항 ≠ 200`);
const seen = new Set(items.map((i) => i.id));
if (seen.size !== 200) throw new Error("id 중복");
items.sort((a, b) => a.id.localeCompare(b.id));

const dry = process.argv.includes("--dry");
for (let L = 1; L <= 14; L += 1) {
  const group = items.filter((i) => i.lesson === L);
  const expect = COUNTS[L - 1];
  if (group.length !== expect) throw new Error(`l${L}: ${group.length}문항 ≠ ${expect}`);
  const first = group[0].id.replace("m1u5e", "");
  const last = group[group.length - 1].id.replace("m1u5e", "");
  const used = HELPERS.filter((h) => group.some((i) => i.text.includes(h + "(")));
  const header = `// 수학 중1 Ⅴ. 평면도형과 입체도형: 단원 종합 평가 풀 v2, 레슨 ${L} ${LESSON_TITLES[L]}
// (m1u5e${first}~e${last}) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m1u5-v2-blueprint.md, 규격 v2).
// 유형 쿼터: ${QUOTAS[L - 1]}, diff ${DIFFS[L - 1]}. word 0(규격 v2 · 교과서 실측 "구하시오" 지배 계승).
// 그림 원칙: 각은 라벨 수치 그대로 실각 렌더, 수치는 라벨 단위 병기("6 cm"·"x°"), 관계 조건은 문두.
// π 답은 "aπ ...일 때 a의 값" 부품 문항(num 답에 π 금지). 표기: mfmt 미사용, em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
${used.length ? `import {\n${used.map((h) => `  ${h},`).join("\n")}\n} from "../../ui/examFiguresMath";\n` : ""}
export const POOL_M1U5L${L}: ExamItem[] = [
${group.map((i) => "  " + i.text).join("\n")}
];
`;
  const out = `src/content/exams/m1u5l${L}.ts`;
  if (dry) console.log(`[dry] ${out}: ${group.length}문항, 헬퍼 ${used.length}종`);
  else {
    writeFileSync(out, header);
    console.log(`${out}: ${group.length}문항 저장(헬퍼 ${used.length}종)`);
  }
}
console.log(dry ? "\n드라이런 완료(파일 미저장)" : "\n이식 완료 - 다음: node qa/check-exam-m1u5.mjs → tsc/build → e2e");
