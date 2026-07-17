// 단원 종합 평가 — 문항 데이터 계약.
// 레슨 퀴즈(quiz 스텝)와 달리 시험 문항은 별도 풀에 산다: 응시마다 레슨 균형 랜덤 출제,
// 시험 중에는 해설이 보이지 않고 제출 후 오답 리뷰에서만 explain·core가 쓰인다.

export type ExamItemType = "mcq" | "multi" | "num" | "word";

export interface ExamItem {
  /** 풀 안에서 유일한 id("u3e01"…) — 감사·리뷰 추적용. */
  id: string;
  /** 진단·"이 레슨 복습하기" 바로가기의 근거. */
  lessonId: string;
  type: ExamItemType;
  /** HTML 허용. 수치 단답은 단위를 문두에 명시한다. */
  prompt: string;
  /** ㄱㄴㄷ 보기 상자(합답형) — 라벨(ㄱ.ㄴ.ㄷ.)은 렌더러가 붙인다. */
  bogi?: string[];
  /** SVG 문자열(heatFigures·examFigures). 리뷰에서도 다시 보여준다. */
  figure?: string;
  figureDark?: boolean;
  /** mcq·multi 보기. */
  options?: string[];
  /** mcq: 저작 인덱스 · multi: 인덱스 배열 · num: 정규화 문자열("20"|"2.5") · word: 정답 칩 문자열. */
  answer: number | number[] | string;
  /** false = 표시 순서 고정(ㄱㄴㄷ 조합·(가)(나) 라벨형 보기 — 퀴즈 셔플 규칙과 동일). */
  shuffle?: boolean;
  /** num 전용 — 넘패드 종류(기본 int). frac은 m2u6 확률부터(값 동치 채점 — 3/6도 정답,
   *  answer 저장은 기약 "a/b" ASCII + 문두 "기약분수로" 명시가 저작 표준). */
  numKind?: "int" | "dec" | "frac";
  /** num 전용 — 입력 칸 옆 단위 라벨(℃·kcal·분·배…). 문두 명시와 병행. */
  unitLabel?: string;
  /** word 전용 — 워드뱅크 칩(정답 포함 8~10개). */
  bank?: string[];
  /** 난이도 태그(수학 m1u6부터 도입, 선택) — 1 기초 · 2 표준 · 3 심화. 분포 목표 40/40/20%.
   *  추출 로직은 이 값을 쓰지 않는다(레슨 균형 관행 유지) — 취약 드릴 난이도 활용은 후속 작업. */
  diff?: 1 | 2 | 3;
  /** 해설(제출 후 리뷰 전용): 단계별 풀이 + 오답 선지 하나씩 격파. 250~450자 해요체.
   *  보기 "위치"(N번째) 지칭 금지 — 표시 순서가 셔플되므로 보기 내용을 인용해 지칭한다. */
  explain: string;
  /** 핵심 개념 한 줄 요약 — 리뷰 카드 하단, 레슨 바로가기 옆. */
  core: string;
}

export interface ExamDef {
  /** store 기록 키("u3exam"). */
  id: string;
  unitId: string;
  title: string;
  /** 응시당 출제 수(20). */
  pick: number;
  pool: ExamItem[];
}

/** 응시 1회분 추출 — 레슨 균형(풀 등장 순서 = 교과 진도 순서) 랜덤.
 *  레슨당 floor(pick/레슨수)개 + 잔여분은 랜덤하게 고른 서로 다른 레슨에 1개씩(파트 편중 방지 —
 *  잔여를 전역 셔플로 채우면 7레슨 시험에서 한 파트가 5문항, 다른 파트가 2문항이 되는 사고가 난다).
 *  일부 레슨 풀이 모자라도 남은 문항에서 보충해 항상 pick개를 맞춘다.
 *  시험지 순서는 진도 순(같은 레슨 안에서는 랜덤). */
export function drawExamItems(def: ExamDef): ExamItem[] {
  const byLesson = new Map<string, ExamItem[]>();
  for (const it of def.pool) {
    const g = byLesson.get(it.lessonId);
    if (g) g.push(it);
    else byLesson.set(it.lessonId, [it]);
  }
  const lessonIds = [...byLesson.keys()];
  const per = Math.floor(def.pick / Math.max(1, lessonIds.length));
  const extra = def.pick - per * lessonIds.length;
  const extraPicks = new Set(shuffle([...lessonIds]).slice(0, extra));
  const chosen: ExamItem[] = [];
  const leftovers: ExamItem[] = [];
  for (const lid of lessonIds) {
    const g = shuffle([...byLesson.get(lid)!]);
    const want = per + (extraPicks.has(lid) ? 1 : 0);
    chosen.push(...g.slice(0, want));
    leftovers.push(...g.slice(want));
  }
  shuffle(leftovers);
  while (chosen.length < def.pick && leftovers.length) chosen.push(leftovers.pop()!);
  const order = new Map(lessonIds.map((l, i) => [l, i]));
  // sort는 안정 정렬이라 같은 레슨 안의 랜덤 순서는 유지된다
  chosen.sort((a, b) => order.get(a.lessonId)! - order.get(b.lessonId)!);
  return chosen.slice(0, def.pick);
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
