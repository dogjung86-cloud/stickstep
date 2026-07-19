// timelineKit — 역사 트랙 연표 문법 1호의 데이터 모듈(continentMap의 ContinentDef 계보).
// 연표 눈금 범위·과제(세기 탭·연도 카드 배치)가 전부 데이터 — Ⅱ~Ⅶ 단원은 TIMELINES에
// def 하나를 추가하고 timelineLab({ defId })로 부르면 그대로 재사용된다.
// 좌표 규약: 연도는 부호 있는 정수(기원전 = 음수), 0년은 존재하지 않는다(기원전 1년 다음이 기원후 1년).

export type TimelineTask =
  | { kind: "century"; century: number } // 이 세기 칸을 탭하라(양수 = 기원후, 음수 = 기원전)
  | { kind: "place"; year: number; label: string }; // 이 연도 카드를 알맞은 세기 칸에 놓아라

export interface TimelineDef {
  id: string;
  startCentury: number; // 왼쪽 끝 세기(예: -3 = 기원전 3세기)
  endCentury: number; // 오른쪽 끝 세기(예: 5 = 5세기) — 0은 건너뛴다
  tasks: TimelineTask[];
}

/** 연도 → 세기. 391 → 4, -108 → -2(기원전 2세기). */
export const centuryOf = (year: number): number =>
  year > 0 ? Math.ceil(year / 100) : -Math.ceil(-year / 100);

/** 세기 → [시작 연도, 끝 연도](부호 있는 연도). 4 → [301, 400], -2 → [-200, -101](기원전은 역방향). */
export const centuryRange = (c: number): [number, number] =>
  c > 0 ? [(c - 1) * 100 + 1, c * 100] : [c * 100, (c + 1) * 100 - 1];

/** 연도 표기. -108 → "기원전 108년", 391 → "391년". */
export const fmtYear = (year: number): string => (year < 0 ? `기원전 ${-year}년` : `${year}년`);

/** 세기 표기. -2 → "기원전 2세기", 4 → "4세기". */
export const fmtCentury = (c: number): string => (c < 0 ? `기원전 ${-c}세기` : `${c}세기`);

/** 세기 구간 표기. -2 → "기원전 200~101년", 4 → "301~400년". */
export function fmtRange(c: number): string {
  const [a, b] = centuryRange(c);
  return c < 0 ? `기원전 ${-a}~${-b}년` : `${a}~${b}년`;
}

/** def의 세기 칸 목록(0 제외, 왼쪽→오른쪽). */
export function centuriesOf(def: TimelineDef): number[] {
  const out: number[] = [];
  for (let c = def.startCentury; c <= def.endCentury; c += 1) if (c !== 0) out.push(c);
  return out;
}

/** 연표 왼쪽 끝(축 원점) 연도. 기원전 c세기의 왼쪽 끝 = c*100(-3 → -300)이지만,
 *  기원후 c세기의 왼쪽 끝은 (c-1)*100(5세기 → 400)이다 — 양수 시작 def(h1u3 전부 기원후)의
 *  사건 도장·눈금이 한 칸 밀리는 것을 막는 보정(음수 시작 h1u1·h1u2는 기존 값 그대로 = 무회귀). */
export const axisMinYear = (def: TimelineDef): number =>
  def.startCentury < 0 ? def.startCentury * 100 : (def.startCentury - 1) * 100;

/** 연도 → 연표 가로 위치 %(0~100). 축은 연도 값의 선형 매핑(세기 폭 = 균일). */
export function posOf(def: TimelineDef, year: number): number {
  const min = axisMinYear(def);
  const span = centuriesOf(def).length * 100;
  return ((year - min) / span) * 100;
}

// ── 단원별 연표 정의 ─────────────────────────────────────────
// h1u1: 세기 읽기(3세기) → 거꾸로 세기(기원전 2세기) → 사건 배치(영락 1년=391 · 고조선 멸망 BC 108).
// 배치 순서는 기원후(쉬움) 먼저, 기원전(역방향 재적용) 나중 — 함정을 두 번 밟게 하는 설계.
export const TIMELINES: Record<string, TimelineDef> = {
  h1u1: {
    id: "h1u1",
    startCentury: -3,
    endCentury: 5,
    tasks: [
      { kind: "century", century: 3 },
      { kind: "century", century: -2 },
      { kind: "place", year: 391, label: "광개토 대왕 즉위 · 영락 1년" },
      { kind: "place", year: -108, label: "고조선 멸망" },
    ],
  },
  // h1u2: 고대 제국 구간(확정 연도가 있는 사건만) — 문명 발생(기원전 3500~2500, 천 년 스케일)은
  // 세기 균일 칸 문법에 맞지 않아 hisFigures.millenniumFig(500년 칸 정적 띠)가 담당한다(게이트 ① 결정).
  // 검산: BC221=기원전 3세기(-300~-201) · BC27=기원전 1세기(-100~-1) · 313=4세기(301~400).
  h1u2: {
    id: "h1u2",
    startCentury: -4,
    endCentury: 4,
    tasks: [
      { kind: "century", century: 2 },
      { kind: "century", century: -4 },
      { kind: "place", year: -221, label: "진, 중국 통일" },
      { kind: "place", year: -27, label: "로마, 제정 시작" },
      { kind: "place", year: 313, label: "크리스트교 공인" },
    ],
  },
  // h1u3: 세계 종교의 시대 — 확정 연도가 전부 기원후라 역방향 과제 없음(게이트 ① 결정 —
  // 목표 칩은 자동으로 "세기 읽기·사건 배치" 2종이 된다. 기원전을 억지로 끼워 넣지 않는다).
  // 검산: 476=5세기(401~500) · 622=7세기(601~700) · 1077=11세기(1001~1100). 축 왼쪽 끝 = 400년(axisMinYear).
  h1u3: {
    id: "h1u3",
    startCentury: 5,
    endCentury: 11,
    tasks: [
      { kind: "century", century: 6 },
      { kind: "century", century: 10 },
      { kind: "place", year: 476, label: "서로마 제국 멸망" },
      { kind: "place", year: 622, label: "헤지라" },
      { kind: "place", year: 1077, label: "카노사의 굴욕" },
    ],
  },
};
