// 수학 저작 DSL, 수학 스텝 팩토리. 과학 dsl.ts와 분리해 병합 충돌을 없앤다.
// 수식 표기는 ui/mathKit의 mfmt 마이크로 마크업: "{a/b}" 분수 · "^n" 지수 ·
// "(+3)"/"(-5)" 부호 수(부호만 색) · × ÷ | | 는 문자 그대로.
import type { Step } from "../../lessons/types";
import type { CurioOpt } from "../dsl";

/** 스틱맨 미리보기 퍼즐(수학판 훅), hookAsk 규칙(choices[0]=정답, good≠bad)은 장면 렌더러가 지킨다. */
export const mathHook = (o: {
  title: string;
  lead?: string;
  narrator: string;
  done?: string;
  scene:
    | "cicada" // L1 매미 13·17년 주기
    | "paperfold" // L2 종이 접기 두께
    | "lockcode" // L3 소수 자물쇠(암호)
    | "tilefloor" // L4 정사각 타일 깔기
    | "buslight" // L5 두 버스 동시 출발
    | "freezer" // L6 냉동고 영하 온도
    | "gpsdist" // L7 거리만 알 때 방향은?
    | "golfscore" // L8 골프 스코어 −의 세계
    | "daytemp" // L9 일교차 3−(−7)
    | "rewind" // L10 거꾸로 재생×뒤로 걷기
    | "mentalmath" // L11 암산왕 98×5
    | "snsdebate" // L12 6÷2(1+2) 논쟁
    // ── Ⅱ 문자와 식 (hookMath2.ts) ──
    | "vending" // 페트병 회수기, 문자의 필요
    | "chatslang" // 채팅 줄임말, 기호 생략
    | "furniture" // 키에 맞는 가구 높이, 대입
    | "macaron" // 마카롱 상자 무게, 항·상수항
    | "basket" // 사과·바나나 장바구니, 동류항
    | "catfood" // 얼룩진 영수증, 등식·방정식
    | "justice" // 정의의 여신 저울, 등식의 성질
    | "leap" // 항의 점프(부호 반전), 이항
    | "horse" // 구일집 추격전, 방정식 활용
    // ── Ⅲ 좌표평면과 그래프 (hookMath3.ts) ──
    | "cinema" // 불 꺼진 영화관, 좌석 순서쌍
    | "sos" // 바다 조난 신호, 위도·경도 부호(사분면)
    | "views" // 조회수 같은 두 영상, 그래프 모양
    | "wheel" // 대관람차, 주기 그래프
    | "thunder" // 번개와 천둥 5초, 정비례
    | "download" // 다운로드 남은 시간, 직선의 예측력
    | "pizza" // 피자 나눠 먹기, 반비례
    | "seesaw" // 시소의 비밀, 곱 일정
    | "quakealert" // 지진 조기 경보, 보스전
    // ── Ⅳ 기본 도형 (hookMath4.ts) ──
    | "sparkler" // 불꽃막대 잔상, 점이 움직이면 선
    | "laserline" // 하늘로 쏜 레이저, 반직선
    | "clockhands" // 6시 정각 두 바늘 일직선, 평각
    | "scissors" // 가위 양날, 맞꼭지각
    | "longjump" // 멀리뛰기 기록 재기, 수선과 거리
    | "railroad" // 기차 레일, 평행
    | "overpass" // 고가도로, 꼬인 위치
    | "subwayexit" // 사거리 지하철 출구, 동위각·엇각
    | "blinds" // 블라인드 햇빛 줄무늬, 평행선의 성질
    | "curtain" // 끈으로 길이 복사, 작도
    | "straws" // 빨대 삼각형 도전, 삼각형 부등식
    | "bakery" // 붕어빵 틀, 합동
    | "thales"; // 탈레스 배 거리, 보스전
  choices?: string[];
  cta?: string;
}): Step => ({ type: "mathHook", ...o });

/** 드릴 문항, q는 mfmt 마크업, 답은 kind별(int: 정수, frac: "n/d" 기약, dec: 소수). */
export interface DrillItem {
  q: string;
  a: number | string;
  kind?: "int" | "frac" | "dec";
  /** 오답 시 한 줄 교정(mfmt 허용), 오개념을 짚는다. */
  why?: string;
  /** 오답 시 수직선 미니 재생(정수 덧셈·뺄셈 전용): from에서 move만큼 점프. */
  strip?: { from: number; move: number };
}

/** 스피드 퀴즈(넘패드 연속 풀이 피날레). recordQuiz는 "첫 시도 정답률 ≥ passRatio" 1회. */
export const mathDrill = (o: {
  title: string;
  lead?: string;
  items: DrillItem[];
  passRatio?: number; // 기본 0.7
  cta?: string;
}): Step => ({ type: "mathDrill", ...o });

/** 에라토스테네스의 체, 1~max 격자에서 배수를 쓸어 소수만 남긴다. */
export const sieveLab = (o: { title: string; lead?: string; max?: number; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "sieveLab", ...o });

/** 거듭제곱 칩 쌓기, 같은 수 칩을 겹쳐 2×2×2 → 2^3. */
export const powBuild = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "powBuild", ...o });

/** 소인수분해 인수 트리, 합성수를 탭해 가르고, 어떤 길이든 결과가 같음을 본다. */
export const factorTree = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "factorTree", ...o });

/** 소인수 벤 다이어그램, gcd: 공통 소인수를 교집합으로, lcm: 울타리 전체 곱,
 *  coprime: 서로소 판별소(겹침을 찾거나 "서로소!" 선언, 8·9 → 9·25 → 14·21 함정). */
export const vennFactor = (o: {
  title: string;
  lead?: string;
  mode: "gcd" | "lcm" | "coprime";
  cta?: string;
  curio?: CurioOpt;
}): Step => ({ type: "vennFactor", ...o });

/** 수직선, place: 수 카드를 자리에 놓기, abs: 원점 거리 재기·절댓값 쌍 찾기. */
export const numline = (o: {
  title: string;
  lead?: string;
  mode: "place" | "abs";
  cta?: string;
  curio?: CurioOpt;
}): Step => ({ type: "numline", ...o });

/** 수직선 산책, 도착점을 먼저 예측(탭)하고 스틱맨이 걸어가 확인하는 덧셈 랩. */
export const numWalk = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "numWalk", ...o });

/** 셈돌 랩, add: (+)(−) 칩 상쇄로 덧셈, sub: 0쌍을 투입해 없는 칩을 빼는 뺄셈. */
export const counterLab = (o: {
  title: string;
  lead?: string;
  mode: "add" | "sub";
  cta?: string;
  curio?: CurioOpt;
}): Step => ({ type: "counterLab", ...o });

/** 곱 패턴 랩, 곱하는 수를 1씩 줄이며 패턴으로 (−)×(−)=+를 스스로 발견. */
export const patternLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "patternLab", ...o });

/** 분배법칙 넓이 랩, 직사각형을 쪼개도 넓이 합이 같음 → 98×5 암산 지름길. */
export const areaSplit = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "areaSplit", ...o });

/* ── Ⅱ 문자와 식 ─────────────────────────────────────────── */

/** 패턴→식 랩, 정삼각형 막대 패턴에서 2a+1을 발견(문자의 필요). */
export const patternRule = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "patternRule", ...o });

/** 대입 머신, x 값을 바꿔 넣으며 식의 값 계산(음수 대입 괄호·(-x)² 함정). */
export const substLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "substLab", ...o });

/** 식의 해부, 5x+8의 항·계수·상수항·차수를 탭으로 태깅. */
export const exprAnatomy = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "exprAnatomy", ...o });

/** 동류항 칩 합치기, 문자·차수가 같은 항만 합쳐진다. */
export const likeTerms = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "likeTerms", ...o });

/** 등식 참·거짓 테이블, 대입으로 해를 찾아 방정식의 뜻 발견. */
export const eqTruth = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "eqTruth", ...o });

/** 양팔저울 랩(기함), 등식의 성질 4가지를 저울 조작으로 발견, x 상자 무게 알아내기. */
export const balanceLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "balanceLab", ...o });

/** 이항 랩, 항을 등호 너머로 드래그하면 부호가 뒤집힌다(방정식 풀이). */
export const solveLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "solveLab", ...o });

/* ── Ⅲ 좌표평면과 그래프 ─────────────────────────────────────── */

/** 좌표 명중, 순서쌍 카드를 보고 좌표평면에 점을 찍고((2,4)≠(4,2) 함정), 점의 좌표를 읽는다. */
export const coordLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "coordLab", ...o });

/** 사분면 탐사, 점 하나를 자유 드래그하며 부호 패널·구역 발견(축 위=어느 사분면도 아님 포함). */
export const quadLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "quadLab", ...o });

/** 물병 그래프, 모양이 다른 물병 3종에 물을 부으며 높이-시간 그래프를 실시간으로 발견(예측 먼저). */
export const bottleLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "bottleLab", ...o });

/** 그래프 탐정, 드론 비행 그래프를 시간 스크러버로 오가며 구간(증가·수평·감소)을 해석한다. */
export const droneLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "droneLab", ...o });

/** 2배 링크 검사기, 달걀 단백질 표에서 x 2배→y 2배를 발견하고 반례(저금통)를 판별한다(정비례). */
export const linkLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "linkLab", ...o });

/** 직선 제조기, y=2x 점 찍기→간격 반으로→수 전체=원점 직선, a 슬라이더로 기울기·사분면 탐험. */
export const lineLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "lineLab", ...o });

/** 나눠 갖기, 60초 영상을 사진 x장으로 등분하며 xy=60(곱 일정)을 발견하고 반례를 판별한다(반비례). */
export const shareLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "shareLab", ...o });

/** 곡선 정원, 넓이 고정 직사각형의 꼭짓점을 드래그해 자취로 반비례 곡선을 그린다(축 근접 발견). */
export const curveLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "curveLab", ...o });

/* ── Ⅳ 기본 도형 ─────────────────────────────────────── */

/** 점→선→면 생성 랩, 점을 찍고·끌어 선을 만들고·쓸어 면을 만든다(교점·교선 국면 포함). */
export const traceLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "traceLab", ...o });

/** 직선·반직선·선분 3형제 랩, 두 점으로 셋을 만들고 AB³≠BA³(방향)을 발견한다. */
export const rayLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "rayLab", ...o });

/** 각 만들기 랩, 반직선을 돌려 예각→직각→둔각→평각을 만들고 각의 크기=회전량을 몸으로 안다. */
export const angleLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "angleLab", ...o });

/** 맞꼭지각 랩, 두 직선을 회전시키며 마주 보는 각이 항상 같음을 발견한다(평각 180° 유도). */
export const vertAngleLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "vertAngleLab", ...o });

/** 수직·최단거리 랩, 점에서 직선까지 여러 선분을 긋고 수선이 가장 짧음을 발견한다. */
export const perpLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "perpLab", ...o });

/** 평면 두 직선 위치 관계 랩, 직선을 돌리며 한 점/평행/일치를 판정(줌아웃으로 먼 교점 발견). */
export const lineRelLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "lineRelLab", ...o });

/** 공간 위치 관계 랩(기함), CSS 3D 직육면체를 돌리며 모서리를 만남/평행/꼬인 위치로 분류. */
export const boxRelLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "boxRelLab", ...o });

/** 동위각·엇각 찾기 랩, 8개의 각 무대에서 같은 위치·엇갈린 위치의 짝을 탭으로 찾는다. */
export const anglePairLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "anglePairLab", ...o });

/** 평행선 성질 랩(기함), 직선을 기울이며 동위각·엇각을 실시간 비교, 평행일 때만 같음을 발견. */
export const parallelLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "parallelLab", ...o });

/** 작도 스테퍼 랩, 눈금 없는 자와 컴퍼스로 길이 같은 선분·크기 같은 각을 순서대로 옮긴다. */
export const compassLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "compassLab", ...o });

/** 삼각형 조건 랩, 세 변으로 원호 교차를 시험(부등식)하고 결정조건 3가지를 확인한다. */
export const triBuildLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "triBuildLab", ...o });

/** 합동 판별 랩, 주어진 3요소 조합이 SSS·SAS·ASA인지 가려 두 삼각형의 합동을 판정한다. */
export const congLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "congLab", ...o });
