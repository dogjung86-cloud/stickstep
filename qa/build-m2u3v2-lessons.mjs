// m2u3 v2 스테이징(qa/m2u3v2-*.ts) → src/content/exams/m2u3l1~l10.ts 생성기(m2u5판 계승).
// 문항 블록을 텍스트 그대로 이식(코드 변형 없음), 레슨별 분류·슬롯 순 정렬·필요 헬퍼만 import.
// 재실행 가능(감사 수정 반영 후 다시 돌리면 됨). node qa/build-m2u3v2-lessons.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";

const STAGING = [
  "qa/m2u3v2-pilot.ts",
  "qa/m2u3v2-rest-a.ts",
  "qa/m2u3v2-rest-b.ts",
  "qa/m2u3v2-rest-c.ts",
  "qa/m2u3v2-rest-d.ts",
  "qa/m2u3v2-rest-e.ts",
];
// import 소스별 헬퍼(사용된 것만 이식) — lineFig만 mathFigures2, 나머지는 examFiguresMath.
const FIG2_HELPERS = ["lineFig"];
const EXAM_HELPERS = ["m2ExamArrowMapFig", "m2ExamLineChoicesFig", "m2ExamSegPlaneFig", "m2ExamSignLineFig", "mExamTableFig"];
const LESSON_TITLES = {
  1: "함수: 하나에 하나씩 (책 96~100쪽)",
  2: "일차함수: y=ax+b (책 101쪽)",
  3: "평행이동: 나란히 옮기기 (책 102~104쪽)",
  4: "절편: 축과 만나는 곳 (책 105~107쪽)",
  5: "기울기: 기울어진 정도의 수 (책 108~110쪽)",
  6: "그래프의 성질: 방향과 평행 (책 111~113쪽)",
  7: "일차함수의 식 구하기 (책 114~115쪽)",
  8: "일차함수의 활용 (책 116~121쪽)",
  9: "일차함수와 일차방정식 (책 122~127쪽)",
  10: "그래프와 연립방정식 (책 128~133쪽)",
};
const FIG_TARGET = { 1: 7, 2: 3, 3: 8, 4: 9, 5: 9, 6: 11, 7: 7, 8: 8, 9: 8, 10: 11 };

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
  const parts = body.split(/\n  \},\n/).map((s) => s.trim()).filter((s) => s.startsWith("{") || s.startsWith("/*") || s.startsWith("//") || s.includes("id:"));
  for (let p of parts) {
    const idx = p.indexOf("{");
    if (idx < 0) continue;
    p = p.slice(idx);
    if (!p.endsWith("},")) p += "\n  },";
    if (!p.endsWith(",")) p += ",";
    const id = p.match(/id: "(m2u3e\d{3})"/)?.[1];
    const lesson = p.match(/lessonId: "m2u3l(\d+)"/)?.[1];
    if (!id || !lesson) throw new Error(`${f}: id/lessonId 파싱 실패: ${p.slice(0, 80)}`);
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
  const figCount = group.filter((i) => i.text.includes("figure:")).length;
  if (figCount !== FIG_TARGET[L]) throw new Error(`l${L}: 그림 ${figCount} ≠ 설계 ${FIG_TARGET[L]}`);
  const first = group[0].id.replace("m2u3e", "");
  const last = group[group.length - 1].id.replace("m2u3e", "");
  const usedFig2 = FIG2_HELPERS.filter((h) => group.some((i) => i.text.includes(h + "(")));
  const usedExam = EXAM_HELPERS.filter((h) => group.some((i) => i.text.includes(h + "(")));
  const needMfmt = group.some((i) => i.text.includes("mfmt("));
  const header = `// 중2 수학 Ⅲ. 일차함수: 단원 종합 평가 풀 v2, 레슨 ${L} ${LESSON_TITLES[L]}
// (m2u3e${first}~e${last}) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u3-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 10 + multi 2 = 12 · num 8, diff 8/8/4. word 0(규격 v2). 그림 ${FIG_TARGET[L]}문항(설계표 정본).
// 그림 원칙: lineFig 재사용 1순위(tri 금지·판독값 전부 눈금 라벨 위·폭>12 격자는 min 홀짝 정렬),
// "식→값" 계산 문항은 무그림(그래프가 정답을 눈금에 인쇄하는 역유출 차단). 수치·소재 배정은 설계표 §2·§2-1이 정본.
// 표기: mfmt 사용 단원(분수 기울기는 mcq 보기), em대시 금지, −는 U+2212(num answer만 ASCII).
import type { ExamItem } from "./types";
${needMfmt ? `import { mfmt } from "../../ui/mathKit";\n` : ""}${usedFig2.length ? `import { ${usedFig2.join(", ")} } from "../../ui/mathFigures2";\n` : ""}${usedExam.length ? `import {\n${usedExam.map((h) => `  ${h},`).join("\n")}\n} from "../../ui/examFiguresMath";\n` : ""}
export const POOL_M2U3L${L}: ExamItem[] = [
${group.map((i) => "  " + i.text).join("\n")}
];
`;
  const out = `src/content/exams/m2u3l${L}.ts`;
  if (dry) console.log(`[dry] ${out}: ${group.length}문항, 그림 ${figCount}, 헬퍼 fig2 ${usedFig2.length}/exam ${usedExam.length}${needMfmt ? " + mfmt" : ""}`);
  else {
    writeFileSync(out, header);
    console.log(`${out}: ${group.length}문항 저장(그림 ${figCount}, exam 헬퍼 ${usedExam.length}종${needMfmt ? " + mfmt" : ""})`);
  }
}
console.log(dry ? "\n드라이런 완료(파일 미저장)" : "\n이식 완료 — 다음: node qa/check-exam-m2u3.mjs → tsc/build → e2e");
