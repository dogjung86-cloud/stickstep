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
    | "quakealert" // 지진 조기 경보, 정비례 활용
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
    | "thales" // 탈레스 배 거리, 합동의 활용
    // ── Ⅴ 평면도형과 입체도형 (hookMath5.ts) ──
    | "fivestar" // 별을 그리면 오각형이 나타난다, 대각선
    | "aladder" // A자 사다리 벌리기, 삼각형 내각의 합
    | "honeycomb" // 벌집이 육각형인 이유, 내각의 크기
    | "robotvac" // 로봇청소기 한 바퀴, 외각의 합 360°
    | "watermelon" // 수박 웨지 vs 반달, 부채꼴·활꼴
    | "cakecut" // 각도 2배 케이크 조각, 부채꼴의 성질
    | "lanestart" // 400m 트랙 계단식 출발선, 호의 길이
    | "diamond" // 다이아몬드 58면 커팅, 다면체
    | "dicegame" // 게임 주사위가 딱 5종인 이유, 정다면체
    | "pottery" // 도자기 물레, 회전체
    | "drinkcan" // 음료 캔이 죄다 원기둥인 이유, 기둥의 겉넓이·부피
    | "partyhat" // 고깔모자를 펼치면 부채꼴, 뿔의 전개도
    | "balloonup" // 풍선 2배 불면 고무 4배·공기 8배, 구
    | "tombstone" // 아르키메데스의 묘비, 부피 비율 3:2:1
    // ── Ⅵ 통계 (hookMath6.ts) ──
    | "lunchavg" // 먹방 친구와 밥값 평균, 대푯값
    | "penstock" // 문구점 볼펜 색 채우기, 최빈값
    | "marathon" // 마라톤 접수처의 나이 명단, 줄기와 잎
    | "weightclass" // 태권도 체급표, 도수분포표
    | "camerahisto" // 카메라 앱 산 모양 그래프, 히스토그램
    | "likeratio" // 구독자 대비 좋아요, 상대도수
    | "fakegraph" // 눈금 조작 그래프, 통계적 문제해결
    // ── 중2 Ⅰ 유리수의 표현과 식의 계산 (hookM2u1.ts) ──
    | "calculator" // 계산기 1÷3, 화면 끝까지 3만 가득
    | "melody" // 후렴 무한 반복 노래, 마디 하나면 전곡
    | "birthday" // 생일 날짜 분수, 딱 떨어지는 생일
    | "nines" // 1/3=0.333… 양변 ×3, 1=0.999…?!
    | "germs" // 잠든 사이 입속 세균 2배씩
    | "storage" // 폰 저장 공간, 영상 몇 개 더?
    | "solarpanel" // 태양광 패널 넓이, 가로×세로
    | "receipt" // 두 사람 주문 합치기 영수증
    | "kiosk" // 키오스크 화면 두 구역의 넓이
    | "tangram" // 칠교 조각 둘레, 문자로 재기
    // ── 중2 Ⅱ 부등식과 연립방정식 (hookM2u2.ts) ──
    | "eggsize" // 계란 등급표, 특란의 조건은 범위
    | "colder" // 겨울 기온, 3<5인데 −3>−5
    | "rollercoaster" // 놀이기구 키 제한, 몇 cm 더 크면?
    | "groupticket" // 30명 미만인데 단체권이 더 쌀까
    | "fourcut" // 인생네컷, 3컷 x장+4컷 y장=25컷
    | "boats" // 보트 6대에 14명, 조건 두 개
    | "bingsu" // 과일빙수는 팥빙수보다 3000원 비싸다
    | "combo" // 세트 메뉴 두 장, 가격 차의 정체
    | "pheasant" // 손자산경, 머리 35에 다리 94
    // ── 중2 Ⅲ 일차함수 (hookM2u3.ts) ──
    | "vendbox" // 자판기 vs 랜덤박스, 정해지는 대응
    | "bubbletea" // 버블티 토핑, 기본값+개당 500원
    | "twinlift" // 같은 속도 두 엘리베이터, 나란한 그래프
    | "giftcard" // 기프트카드 잔액 0의 날, 축과 만나는 점
    | "slide" // 같은 높이 두 미끄럼틀, (세로)/(가로) 비율
    | "updown" // 두 채널 구독자 그래프, 방향의 정체
    | "bonekey" // 법의학 뼈 한 조각, 관계식의 위력
    | "stalactite" // 종유석의 100년, 일정 변화의 예측
    | "twomask" // 방정식 카드의 뒷면, 같은 직선 두 이름
    | "chase" // 자전거 추격전, 교점 = 따라잡는 순간
    // ── 중2 Ⅳ 삼각형과 사각형의 성질 (hookM2u4.ts) ──
    | "hanger" // 옷걸이 두 어깨, 이등변의 밑각
    | "foldstrip" // 종이 띠 접기, 겹침 삼각형은 늘 이등변
    | "phonestand" // 접이식 폰 거치대, 직각+2정보면 같은 자세
    | "fairspot" // 세 친구 공평 약속 장소, 등거리 지점
    | "cookiecut" // 삼각형 반죽 최대 원 쿠키, 내접원
    | "cardspin" // 트럼프 카드 거꾸로 잡아도 같은 그림, 반 바퀴 대칭
    | "chopstick" // 젓가락 두 쌍 사각형, 대변 길이 조건
    | "bookshelf" // 조립 가구 대각선 검사, 직사각형 판별
    | "pickrect" // "직사각형을 모두 고르시오", 포함 관계
    | "bentfence" // 꺾인 텃밭 경계 펴기, 등적 변형
    // ── 중2 Ⅵ 확률 (hookM2u6.ts) ──
    | "boardgame" // 뱀사다리 탈출 직전, 6만? 짝수만? 경우를 세면 유불리가 보인다
    | "ottnight" // 뭘 볼까, 코미디 5편 또는 액션 3편, 또는이면 더한다
    | "avatar" // 게임 아바타 꾸미기, 모자 3종 × 옷 2종
    | "cointoss" // 순서 정하기 동전, 왜 공평할까
    | "sundaynight" // 일요일 밤, 내일이 토요일일 확률은
    | "gacha" // 뽑기 5성 3%, 그럼 꽝이 나올 확률은
    | "roulette" // 원판의 흩어진 당첨 칸, 이거나 저거나
    | "doublespin" // 두 원판 모두 당첨이어야 상품, 이것도 저것도
    | "umbrella"; // 비 올 확률 60%, 우산 챙길까
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

/* ── Ⅴ 평면도형과 입체도형 ─────────────────────────────── */

/** 대각선 랩, 다각형 꼭짓점을 이어 대각선을 긋고 n-3 규칙(이웃 제외)을 발견한다. */
export const diagLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "diagLab", ...o });

/** 삼각형 각 랩, 세 내각을 찢어 일직선(180°)에 모으고 외각=두 내각의 합을 확인한다. */
export const triSumLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "triSumLab", ...o });

/** 다각형 분할 랩, 한 꼭짓점에서 대각선을 그어 삼각형 (n-2)개로 쪼개 내각의 합을 얻는다. */
export const polySplitLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "polySplitLab", ...o });

/** 외각 걷기 랩, 스틱맨이 다각형 둘레를 돌며 모퉁이 회전량을 누적, 항상 360°를 발견한다. */
export const walkLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "walkLab", ...o });

/** 원의 부품 랩, 원 위 두 점으로 호·현·부채꼴·활꼴을 만들어 본다(반원=둘 다 국면 포함). */
export const circleLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "circleLab", ...o });

/** 부채꼴 랩, ratio: 중심각을 키우며 호·넓이 정비례(현은 아님)를 발견,
 *  calc: 반지름·중심각을 조작해 호의 길이와 넓이를 π 식으로 조립한다. */
export const sectorLab = (o: {
  title: string;
  lead?: string;
  mode: "ratio" | "calc";
  cta?: string;
  curio?: CurioOpt;
}): Step => ({ type: "sectorLab", ...o });

/** 다면체 랩, 입체를 돌려 면·모서리·꼭짓점을 세고 각뿔을 잘라 각뿔대를 만든다. */
export const solidLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "solidLab", ...o });

/** 정다면체 랩(기함), 한 꼭짓점에 정다각형을 모아 접기, 합이 360° 미만일 때만 입체가 됨을 발견. */
export const platonicLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "platonicLab", ...o });

/** 회전체 랩(기함), 평면도형을 드래그로 1회전시켜 입체를 빚고 두 방향 단면을 자른다. */
export const latheLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "latheLab", ...o });

/** 기둥 랩, 전개도를 펼치고 감아 겉넓이(밑넓이 2 + 옆넓이)와 부피를 조립한다. */
export const prismLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "prismLab", ...o });

/** 뿔 랩, 부채꼴을 말아 원뿔을 만들고 모래 3번 붓기로 부피 1/3을 발견한다. */
export const coneLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "coneLab", ...o });

/** 구 랩, 오렌지 껍질로 원 4개를 채우고(겉넓이 4πr²) 물 붓기로 부피 2/3를 확인한다. */
export const sphereLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "sphereLab", ...o });

/* ── Ⅵ 통계 ───────────────────────────────────────────── */

/** 평균 끌림 랩, 수직선 위 변량 점과 평균 마커로 극단값이 평균을 끌고 가는 것을 체험한다(L1 소형 랩). */
export const meanPullLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "meanPullLab", ...o });

/** 최빈값 랩, 색깔 자료를 타워로 쌓아 최빈값을 찾고 상황별 적절한 대푯값을 고른다. */
export const modeLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "modeLab", ...o });

/** 줄기와 잎 랩, 흩어진 2자리 변량을 줄기 선반에 꽂고 정렬해 분포를 발견한다. */
export const stemLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "stemLab", ...o });

/** 도수분포표 랩, 변량을 계급 구간으로 분류(탈리)하고 계급 크기를 바꿔 보며 적절한 구간을 찾는다. */
export const freqLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "freqLab", ...o });

/** 히스토그램 랩, 도수분포표로 막대를 세우고 윗변 중앙점을 이어 도수분포다각형을 만든다(양끝 0 함정). */
export const histoLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "histoLab", ...o });

/** 상대도수 랩, 총합이 다른 두 집단을 도수로 비교했다가 상대도수 토글로 역전을 목격한다. */
export const relFreqLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "relFreqLab", ...o });

/* ── 중2 Ⅰ 유리수의 표현과 식의 계산 ─────────────────────── */

/** 나눗셈 기계, 분수를 소수로 파 내려가며 멈추는 수(유한)와 계속되는 수(무한)를 가른다. */
export const divLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "divLab", ...o });

/** 순환마디 스캐너, 무한소수 띠에서 최단 반복 블록을 고르고 검사해 점 표기로 봉인한다. */
export const cycleLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "cycleLab", ...o });

/** 분모의 비밀 실험, 분모 소인수에 2·5만 있으면 10^n 변신(유한), 3이 끼면 나머지 룰렛(순환). */
export const denomLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "denomLab", ...o });

/** 무한 꼬리 지우개(기함), 10^n배 시프트로 꼬리를 맞추고 빼기로 소멸시켜 순환소수를 분수로 잡는다. */
export const shiftLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "shiftLab", ...o });

/** 지수법칙 1 랩, 거듭제곱 상자 병합(aᵐ×aⁿ)과 상자 복제((aᵐ)ⁿ)로 지수의 덧셈·곱셈을 발견. */
export const powMulLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "powMulLab", ...o });

/** 지수법칙 2 랩, 분자·분모 칩 상쇄로 나눗셈의 세 운명을 가르고 괄호 지수를 전원에 분배한다. */
export const powDivLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "powDivLab", ...o });

/** 단항식 헤쳐 모여 랩, 계수는 계수끼리 문자는 문자끼리 정렬해 곱하고, 역수 뒤집기로 나눈다. */
export const monoLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "monoLab", ...o });

/** 다항식 정리 랩, 이차항 칩까지 동류항 병합(x²·x 함정), 빼기 괄호를 열면 부호가 반전된다. */
export const polyAddLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "polyAddLab", ...o });

/** 전개 랩, 직사각형 넓이를 절단선으로 쪼개 단항식×다항식을 전개하고 각 항 나눗셈으로 되돌린다. */
export const expandLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "expandLab", ...o });

/* ── 중2 Ⅱ 부등식과 연립방정식 ─────────────────────────── */

/** 부등식 참·거짓 판정기, 값 카드를 대입해 해가 '여러 개(범위)'임을 발견한다(eqTruth의 부등식판). */
export const ineqTruthLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "ineqTruthLab", ...o });

/** 수직선 반전 랩(기함), 두 점에 같은 연산을 가하며 음수 곱·나눗셈=원점 반사로 부등호 반전을 목격. */
export const flipLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "flipLab", ...o });

/** 일차부등식 풀이 랩, 이항 드래그와 음수 나눗셈 반전, 해를 수직선 ○●로 새긴다. */
export const ineqSolveLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "ineqSolveLab", ...o });

/** 유리한 선택 랩, 인원 스테퍼로 개인·단체 요금 막대를 비교해 손익 교차점을 찾는다. */
export const vsLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "vsLab", ...o });

/** 미지수 2개 랩, (x, y) 카드 조합을 대입해 일차방정식의 해가 여러 개임을 발견하고 순서쌍으로 적는다. */
export const pairLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "pairLab", ...o });

/** 공통 해 랩(기함), 두 방정식의 해 순서쌍을 격자에 점찍고 겹치는 단 한 점을 찾는다(직선 금지). */
export const crossLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "crossLab", ...o });

/** 대입법 랩, y 슬롯에 식 카드를 통째로 꽂아 미지수가 하나로 줄어드는 것을 본다. */
export const subSlotLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "subSlotLab", ...o });

/** 가감법 랩, 두 식 카드를 나란히 놓고 변끼리 더하거나 빼 한 미지수를 소거한다(×2 확대경 포함). */
export const elimLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "elimLab", ...o });

/* ── 중2 Ⅲ 일차함수 ─────────────────────────────────────── */

/** 대응 기계 검사소, 수 기계 3대를 검사하며 "x 하나에 y 오직 하나"를 발견한다(상수 함정 포함). */
export const funcLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "funcLab", ...o });

/** 평행이동 랩, y=2x 직선을 통째로 끌어 올리고 내리며 "모든 점이 같이 +b"를 발견한다. */
export const shiftGraphLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "shiftGraphLab", ...o });

/** 절편 수집 랩, 직선이 축과 만나는 점을 탭해 절편을 읽고, 절편 두 개로 직선을 고정한다(원점 함정). */
export const interceptLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "interceptLab", ...o });

/** 기울기 랩(기함), 직선 위 두 점의 계단 세모(가로·세로 증가량)로 어디서 재도 같은 비율을 발견한다. */
export const slopeLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "slopeLab", ...o });

/** 직선 가족 랩, a·b 스테퍼로 방향(a부호)·가파름(|a|)·평행(기울기 같음)을 발견한다(일치 함정). */
export const lineFamilyLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "lineFamilyLab", ...o });

/** 직선 복원 랩, 단서(기울기·점·두 점)에 맞춰 a·b를 조종해 일차함수의 식을 복원한다. */
export const lineBuildLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "lineBuildLab", ...o });

/** 해 점등 랩, 일차방정식의 해를 격자에 찍고 수 전체로 확장해 직선을 완성한다(x=m 수직선 포함). */
export const lineRevealLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "lineRevealLab", ...o });

/** 교점 실험 랩, 두 직선을 조종해 한 점(해 1)·평행(해 0)·일치(해 무수)를 전부 만들어 본다. */
export const meetLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "meetLab", ...o });

/* ── 중2 Ⅳ 삼각형과 사각형의 성질 ─────────────────────────── */

/** 이등변 접기 랩(기함), 접어 확인→모양 바꿔 재확인→"전부는 못 접는다" 판정→SAS 증명 조립. */
export const isoFoldLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "isoFoldLab", ...o });

/** 이등변 되는 조건 랩, 두 밑각 다이얼로 삼각형을 만들고 변 길이를 재서 "같은 각→같은 변"을 발견. */
export const isoBuildLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "isoBuildLab", ...o });

/** 직각삼각형 복제 공방, 직각+정보 2개(빗변+예각·빗변+변)로 복제 성공, 함정 조합은 반례로 실패. */
export const rhCongLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "rhCongLab", ...o });

/** 외심 수색 랩(기함), 세 지점 등거리 후보를 찾다 수직이등분선 밴드로 교점을 스냅, 외접원과 위치 3종. */
export const circumLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "circumLab", ...o });

/** 내심 원 키우기 랩, 삼각형 안에서 가장 큰 원을 찾다 각의 이등분선 교점=내심을 발견, 내접원 완성. */
export const inCircleLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "inCircleLab", ...o });

/** 평행사변형 회전 랩(기함), 대각선 교점 중심 반 바퀴 회전으로 포개짐을 보고 성질 3개를 수집. */
export const paraSpinLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "paraSpinLab", ...o });

/** 평행사변형 조건 감별소, 조건 카드로 사각형을 무작위 생성해 5조건은 합격, 함정 조건은 반례. */
export const paraCondLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "paraCondLab", ...o });

/** 대각선 조작대, 두 대각선(길이·수직·이등분)을 세팅하고 네 끝점을 이어 사각형 4종을 만든다. */
export const diagRigLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "diagRigLab", ...o });

/** 사각형 계보 랩, 조건을 하나씩 추가해 사각형→사다리꼴→평행사변형→직사각형/마름모→정사각형 진화. */
export const quadFamilyLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "quadFamilyLab", ...o });

/** 평행선 넓이 랩, 꼭짓점을 평행 레일로 끌어 모양이 변해도 넓이가 그대로임을 보고 꺾인 경계를 편다. */
export const areaSlideLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "areaSlideLab", ...o });

/* ── 중2 Ⅵ 확률 ─────────────────────────────────────────────── */

/** 경우 수집대, 사건 카드의 조건에 맞는 경우를 빠짐없이 겹치지 않게 골라 담는다(누락·중복 함정). */
export const caseLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "caseLab", ...o });

/** 또는 검문소, 두 사건의 경우를 합쳐 세되 "동시에 일어나지 않는지"를 먼저 확인한다(겹침 함정). */
export const orLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "orLab", ...o });

/** 나뭇가지 그림 랩(기함), 선택이 이어질 때 가지가 벌어지는 것을 직접 펼쳐 a×b를 발견한다(재사용 금지 함정). */
export const treeLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "treeLab", ...o });

/** 던지기 실험실(기함), 동전을 여러 번 던져 상대도수가 일정한 값으로 다가가는 것을 관찰하고 경우의 수 비율과 잇는다. */
export const tossLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "tossLab", ...o });

/** 확률 눈금 랩, 주머니 구성을 바꿔 가며 확률이 0~1 눈금 어디에 꽂히는지 본다(0과 1의 정체). */
export const probBarLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "probBarLab", ...o });

/** 나머지 영역 랩, 전체 1에서 사건의 확률을 빼면 일어나지 않을 확률이 남는다("적어도"의 지름길 포함). */
export const notLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "notLab", ...o });

/** 확률 덧셈 랩, 겹치지 않는 두 사건의 칸을 나눠 칠해 확률을 더한다(겹침 없음 확인 게이트). */
export const probAddLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "probAddLab", ...o });

/** 확률 곱셈 랩, 정사각형 넓이 모델을 가로 p·세로 q로 쪼개 동시에 일어날 확률 p×q를 본다. */
export const probMulLab = (o: { title: string; lead?: string; cta?: string; curio?: CurioOpt }): Step =>
  ({ type: "probMulLab", ...o });
