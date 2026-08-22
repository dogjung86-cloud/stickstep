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

/** 무중복 순환 추출(2026-08-22 — 레슨 균형판) — 재응시마다 새로운 시험지를 주되, 소단원 균형은
 *  drawExamItems와 같은 쿼터 문법(레슨당 floor(pick/n) + 잔여 1개씩 랜덤 서로 다른 레슨)을 모든
 *  응시에서 그대로 지킨다. 방법 = 각 레슨 쿼터를 **그 레슨에서 아직 안 나온 문항(unseen)부터**
 *  채운다 → 같은 문항은 그 레슨 은행을 다 돌 때까지 다시 나오지 않는다(레슨 32문항·쿼터 4 = 8응시).
 *  (초판의 전역 필터·전역 리셋은 은행 마지막 응시가 "남은 문항 전부"라 레슨 풀이 비균등한 시험에서
 *  파트가 통째로 비는 편중이 생겨 폐기 — u3 실측 8/6/4/2/0.)
 *  레슨 은행이 바닥나면 그 레슨만 이력을 리셋하되, **직전 완주 시험지(seen 꼬리 pick개)는 어느
 *  경로로도 제외**해 연속 응시 무중복을 절대 조건으로 유지한다(리셋 직전 시험지의 그 레슨 문항은
 *  다음 한 바퀴를 쉬어 간다 — 의도). 리셋 채움은 옛 기출 **셔플**(오래된 순 고정은 두 바퀴째가
 *  첫 바퀴의 재방송이 된다). seen에는 풀 개편(v2 재출제)으로 사라진 id가 남을 수 있어 먼저 걸러낸다.
 *  반환 seen = 리셋 정리 + 이번 출제분까지 반영된 새 목록 — 호출자(exam.ts)가 **제출 완료
 *  시점에만** 저장한다(중도 이탈한 시험지는 은행을 소진하지 않는다). */
export function drawFreshExamItems(def: ExamDef, seen: readonly string[]): { items: ExamItem[]; seen: string[] } {
  const byId = new Map(def.pool.map((it) => [it.id, it]));
  const eff = seen.filter((id) => byId.has(id));
  const tail = new Set(eff.slice(-def.pick)); // 직전 완주 시험지
  const seenSet = new Set(eff);

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
  const spareFresh: ExamItem[] = []; // 쿼터 밖 잔여 — 레슨 풀이 쿼터보다 작은 합성 풀 방어(실풀 미도달)
  const spareOld: ExamItem[] = [];
  const reset = new Set<string>();
  for (const lid of lessonIds) {
    const g = byLesson.get(lid)!;
    const want = per + (extraPicks.has(lid) ? 1 : 0);
    const unseen = shuffle(g.filter((it) => !seenSet.has(it.id)));
    const old = shuffle(g.filter((it) => seenSet.has(it.id) && !tail.has(it.id)));
    const last = g.filter((it) => tail.has(it.id)); // 최후 수단 — 레슨 은행 ≥ 2×쿼터인 실풀에선 도달 불가
    if (unseen.length < want) reset.add(lid); // 이 레슨 은행 한 바퀴 완료
    chosen.push(...[...unseen, ...old, ...last].slice(0, want));
    spareFresh.push(...unseen.slice(want));
    spareOld.push(...old.slice(Math.max(0, want - unseen.length)));
  }
  shuffle(spareFresh);
  shuffle(spareOld);
  while (chosen.length < def.pick && spareFresh.length) chosen.push(spareFresh.pop()!);
  while (chosen.length < def.pick && spareOld.length) chosen.push(spareOld.pop()!);

  const order = new Map(lessonIds.map((l, i) => [l, i]));
  // sort는 안정 정렬 — 시험지는 진도 순, 같은 레슨 안은 랜덤(drawExamItems와 동일)
  chosen.sort((a, b) => order.get(a.lessonId)! - order.get(b.lessonId)!);
  const items = chosen.slice(0, def.pick);

  const drawn = new Set(items.map((it) => it.id));
  // 리셋된 레슨은 옛 이력을 걷어낸다 — 직전 시험지(tail)만 예외로 남긴다(연속 무중복의 근거)
  const kept = eff.filter((id) => !drawn.has(id) && (!reset.has(byId.get(id)!.lessonId) || tail.has(id)));
  return { items, seen: [...kept, ...items.map((it) => it.id)] };
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
