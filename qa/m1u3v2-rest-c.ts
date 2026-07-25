// m1u3 v2 확대 저작 C: L5 정비례(18) + L6 정비례 그래프(17) = 35문항.
// 정본 = qa/m1u3-v2-blueprint.md §3(§3-0 우선). 파일럿 슬롯(90·95·99·108·113·116·119·130·131)은 제외.
// 표기: v1 관행(mfmt 미사용·slash 분수·withVars·U+2212), em대시 금지(주석 포함 · 로).
// L6 부품 직선 a 풀(§3-0): 112(4/5)·115(−8)·117(3/5)·124(4·−6)·125(7/2)·128(−5)·132(5/2)
// · 무그림 문두·답 관계식(5x·3x·9x·(3/4)x·(1/4)x·a=−4·a=−2)과 전부 상이 검산 완료.
// 각 문항 주석 = [슬롯 n] 검산 노트.
import type { ExamItem } from "../src/content/exams/types";
import { mExamRelChoicesFig, mExamRelationPlaneFig, mExamTableFig } from "../src/ui/examFiguresMath";
import { miniGraphRow } from "../src/ui/mathFigures";

const minus = (value: number | string): string => String(value).replace("-", "−");
const coordPair = (x: number, y: number): string => `(${minus(x)}, ${minus(y)})`;
const withVars = (text: string): string =>
  text.replace(/[xyabk]/g, (variable) => `<i class='mv'>${variable}</i>`);

export const POOL_M1U3V2_REST_C: ExamItem[] = [
  /* ════════ L5 정비례: 2배는 2배를 부른다 ════════ */
  {
    // [슬롯 91] 검산: y=ax에 (3, 12) 대입 → 12=3a → a=4 ✓ (레슨 (2,10)→5·(−3,12)→−4와
    //  수치 분리).
    id: "m1u3e091",
    lessonId: "m1u3l5",
    type: "num",
    prompt: withVars("y") + "가 " + withVars("x") + "에 정비례하고 " + withVars("x=3") + "일 때 " + withVars("y=12") + "예요. " + withVars("y=ax") + "라 할 때 " + withVars("a") + "의 값을 구하세요.",
    answer: "4",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 관계는 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i> 꼴이고, 모르는 것은 <i class='mv'>a</i> 하나뿐이에요. 주어진 순서쌍 <i class='mv'>x</i>=3, <i class='mv'>y</i>=12를 대입하면 12=3<i class='mv'>a</i>이므로 <i class='mv'>a</i>=<b>4</b>예요. 관계식은 <i class='mv'>y</i>=4<i class='mv'>x</i>가 되고, <i class='mv'>x</i>=3을 다시 넣으면 12가 나와 조건과 맞아요.<span class='xh'>계산 함정 격파</span><i class='mv'>a</i>를 <i class='mv'>x</i>÷<i class='mv'>y</i>=3÷12로 거꾸로 나누면 1/4이라는 역수 오답이 나와요. 정비례의 <i class='mv'>a</i>는 <i class='mv'>y</i>를 <i class='mv'>x</i>로 나눈 값이에요. 또 12−3=9나 12+3=15처럼 덧뺄셈으로 접근하면 배율이라는 정비례의 본질에서 벗어나죠. '한 쌍 대입, 나누기 한 번'이 이 유형의 전부랍니다.",
    core: "a는 y÷x, 순서쌍 하나면 충분해요.",
  },
  {
    // [슬롯 92] 검산: 연필 한 자루 무게가 일정하면 y=(한 자루 무게)x 꼴 = 정비례 ✓.
    //  오답 = 남은 쪽수(뺄셈)·나이와 키(식 없음)·거스름돈(뺄셈)·나이 합(식 없음).
    id: "m1u3e092",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>정비례하는</b> 상황은?",
    options: [
      "무게가 모두 같은 연필 x자루의 전체 무게 y g",
      "200쪽짜리 책에서 읽은 쪽수 x와 남은 쪽수 y",
      "나이가 x살인 학생의 키 y cm",
      "5000원을 내고 x원짜리 물건을 산 뒤 받은 거스름돈 y원",
      "한 반 학생 x명의 나이를 모두 더한 값 y살",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>연필 한 자루의 무게가 일정하면 전체 무게는 (한 자루 무게)×(자루 수)라서 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i> 꼴이에요. 자루 수가 2배면 전체 무게도 정확히 2배가 되니 당당한 정비례죠.<span class='xh'>오답 하나씩 격파</span>남은 쪽수는 <i class='mv'>y</i>=200−<i class='mv'>x</i>, 거스름돈은 <i class='mv'>y</i>=5000−<i class='mv'>x</i>라 둘 다 빼는 관계예요. <i class='mv'>x</i>가 2배여도 <i class='mv'>y</i>는 2배가 되지 않죠. 나이와 키는 사람마다 제각각이라 식 자체가 없고, 학생들의 나이 합도 저마다 나이가 달라 명수에 정비례하지 않아요. 상황 판별의 기준은 '단위당 양이 고정되어 있는가'예요. 한 개당, 한 명당, 한 자루당이 일정해야 곱하기 관계가 성립한답니다.",
    core: "단위당 양이 고정될 때만 곱하기 관계예요.",
  },
  {
    // [슬롯 93] 검산: 표는 y=5x(5·10·㉠·20) → x=3일 때 ㉠=15 ✓ (y/x = 5 일정 확인:
    //  5/1=10/2=20/4=5).
    id: "m1u3e093",
    lessonId: "m1u3l5",
    type: "num",
    prompt: "표는 " + withVars("y") + "가 " + withVars("x") + "에 정비례하는 관계를 나타낸 거예요. ㉠에 알맞은 수를 구하세요.",
    figure: mExamTableFig(["x", "1", "2", "3", "4"], [["y", "5", "10", "㉠", "20"]], { aria: "x와 y의 대응 관계를 나타낸 표" }),
    answer: "15",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례라 했으니 <i class='mv'>y</i>÷<i class='mv'>x</i>가 일정해요. 채워진 열에서 5÷1=5, 10÷2=5, 20÷4=5이므로 관계식은 <i class='mv'>y</i>=5<i class='mv'>x</i>예요. ㉠은 <i class='mv'>x</i>=3일 때의 값이니 5×3=<b>15</b>죠. <i class='mv'>x</i>가 1씩 커질 때 <i class='mv'>y</i>가 5씩 커지는 규칙으로 봐도 10 다음이 15로 맞아요.<span class='xh'>계산 함정 격파</span>이웃 값 10과 20의 평균이라며 바로 15를 쓰는 것은 이번엔 우연히 맞지만, 정비례가 아닌 표에서는 통하지 않는 위험한 방법이에요. 반드시 <i class='mv'>y</i>÷<i class='mv'>x</i>가 일정한지부터 확인하고 배율을 확정해요. 또 10+3이나 20−3처럼 ㉠ 자리의 <i class='mv'>x</i>값 3을 엉뚱하게 더하고 빼는 실수도 있으니, '배율 × <i class='mv'>x</i>'라는 구조를 지켜요.",
    core: "표에서 y÷x부터, 배율을 찾으면 빈칸은 곱셈!",
  },
  {
    // [슬롯 94] 검산: x=−2일 때 y=10 → a=10÷(−2)=−5 → x=3일 때 y=−5×3=−15 ✓ 2단.
    id: "m1u3e094",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: withVars("y") + "가 " + withVars("x") + "에 정비례하고 " + withVars("x=−2") + "일 때 " + withVars("y=10") + "이에요. " + withVars("x=3") + "일 때 " + withVars("y") + "의 값은?",
    options: ["−15", "15", "−6", "6", "−5"],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 배율을 확정해요. <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에 <i class='mv'>x</i>=−2, <i class='mv'>y</i>=10을 대입하면 10=−2<i class='mv'>a</i>이므로 <i class='mv'>a</i>=−5예요. 관계식 <i class='mv'>y</i>=−5<i class='mv'>x</i>에 <i class='mv'>x</i>=3을 넣으면 <i class='mv'>y</i>=<b>−15</b>죠.<span class='xh'>오답 하나씩 격파</span>'15'는 <i class='mv'>a</i>를 양수 5로 잘못 확정한 답이에요. 10을 −2로 나누면 음수라는 부호 처리가 첫 관문이죠. '−5'는 <i class='mv'>a</i>를 구하고 멈춘 중간값이고, '−6'과 '6'은 배율 대신 두 수의 차나 합을 이리저리 조합한 값이에요. 정비례 2단 문제는 언제나 같은 두 걸음이에요. 순서쌍 하나로 <i class='mv'>a</i>를 확정하고, 새 <i class='mv'>x</i>를 대입한다. 걸음마다 부호를 확인하면 함정이 없어요.",
    core: "a 확정 → 대입, 두 걸음마다 부호 검사!",
  },
  {
    // [슬롯 96] 검산: 정오각형 둘레 y=5x → x=7이면 35 cm ✓ (레슨 정육각형 y=6x 회피).
    id: "m1u3e096",
    lessonId: "m1u3l5",
    type: "num",
    prompt: "한 변의 길이가 " + withVars("x") + " cm인 <b>정오각형</b>의 둘레를 " + withVars("y") + " cm라 할 때, " + withVars("x=7") + "이면 둘레는 몇 cm인지 구하세요.",
    answer: "35",
    numKind: "int",
    unitLabel: "cm",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정오각형은 길이가 같은 변이 5개라서 둘레는 <i class='mv'>y</i>=5<i class='mv'>x</i>인 정비례 관계예요. <i class='mv'>x</i>=7을 대입하면 <i class='mv'>y</i>=5×7=<b>35</b> cm죠. 한 변이 2배가 되면 둘레도 정확히 2배가 되는, 도형이 만들어 주는 자연스러운 정비례예요.<span class='xh'>계산 함정 격파</span>변의 개수를 헷갈려 4×7=28(정사각형)이나 6×7=42(정육각형)로 계산하면 도형 이름을 놓친 거예요. '정오각형'의 오(五)가 변의 개수 5를 알려 주죠. 또 둘레와 넓이를 혼동해 7×7을 계산하는 실수도 있는데, 둘레는 변 길이의 합이라 곱하는 수가 변의 개수예요. 관계식 <i class='mv'>y</i>=5<i class='mv'>x</i>를 먼저 세워 놓고 대입하는 습관이 이런 혼동을 막아 줘요.",
    core: "정오각형 둘레는 y=5x, 변 개수가 배율이에요.",
  },
  {
    // [슬롯 97] 검산: "남은 우유"만 뺄셈 관계(y=1000−x)라 정비례 아님 = 정답 ✓.
    //  나머지 4개는 전부 단위당 고정 곱 구조.
    id: "m1u3e097",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>정비례하지 않는</b> 것은?",
    options: [
      "1000 mL 우유에서 마신 양 x mL와 남은 양 y mL",
      "한 개 800원인 빵 x개의 가격 y원",
      "1분에 60 m씩 걸을 때 x분 동안 걸은 거리 y m",
      "한 봉지에 12개씩 든 사탕 x봉지의 사탕 수 y개",
      "두께가 일정한 책 x권을 쌓은 높이 y cm",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>남은 우유의 양은 <i class='mv'>y</i>=1000−<i class='mv'>x</i>인 빼기 관계예요. 마신 양이 2배가 되어도 남은 양이 2배가 되기는커녕 오히려 줄어드니 정비례가 아니죠. 나머지 넷은 전부 정비례라서 <b>이것이 정답</b>이에요.<span class='xh'>오답 하나씩 격파</span>빵 가격은 <i class='mv'>y</i>=800<i class='mv'>x</i>, 걸은 거리는 <i class='mv'>y</i>=60<i class='mv'>x</i>, 사탕 수는 <i class='mv'>y</i>=12<i class='mv'>x</i>, 쌓은 높이는 (한 권 두께)×<i class='mv'>x</i>로 모두 '한 단위당 양이 고정된 곱' 구조예요. 부정형 문제는 '아닌 것'을 찾는다는 방향을 놓치는 것이 가장 큰 함정이에요. 보기마다 식을 세워 y=ax 꼴인지 도장을 찍고, 도장이 안 찍히는 하나를 고르는 순서로 풀면 흔들리지 않아요.",
    core: "전체에서 빼 나가는 관계는 정비례가 아니에요.",
  },
  {
    // [슬롯 98] 검산: x=4일 때 y=−24 → a=−6 → x=−1일 때 y=−6×(−1)=6 ✓.
    id: "m1u3e098",
    lessonId: "m1u3l5",
    type: "num",
    prompt: withVars("y") + "가 " + withVars("x") + "에 정비례하고 " + withVars("x=4") + "일 때 " + withVars("y=−24") + "예요. " + withVars("x=−1") + "일 때 " + withVars("y") + "의 값을 구하세요.",
    answer: "6",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>순서쌍 (4, −24)로 배율을 확정하면 <i class='mv'>a</i>=−24÷4=−6이에요. 관계식은 <i class='mv'>y</i>=−6<i class='mv'>x</i>이고, <i class='mv'>x</i>=−1을 대입하면 <i class='mv'>y</i>=−6×(−1)=<b>6</b>이에요. 음수에 음수를 곱해 양수가 되는 마지막 곱셈까지가 한 세트죠.<span class='xh'>계산 함정 격파</span>부호 실수가 두 번 기다려요. 먼저 −24÷4에서 음의 부호를 잃으면 <i class='mv'>a</i>=6이 되어 최종 답이 −6으로 뒤집혀요. 다음으로 −6×(−1)을 −6으로 쓰면 음수 곱셈 규칙을 놓친 거예요. '음수 나누기 양수는 음수, 음수 곱하기 음수는 양수'를 단계마다 소리 내어 확인해요. 검산은 구한 관계식에 처음 순서쌍을 다시 넣어 (4, −24)가 재현되는지 보면 끝이에요.",
    core: "부호는 두 번 검사, 음수 곱 음수는 양수!",
  },
  {
    // [슬롯 100] 검산: x=2일 때 y=−6 → a=−3. x=6일 때 b=−3×6=−18. a+b=−3+(−18)=−21 ✓.
    id: "m1u3e100",
    lessonId: "m1u3l5",
    type: "num",
    prompt:
      "정비례 관계 " + withVars("y=ax") + "에서 " + withVars("x=2") + "일 때 " + withVars("y=−6") + "이고, " + withVars("x=6") + "일 때 " + withVars("y=b") + "예요. " + withVars("a+b") + "의 값을 구하세요.",
    answer: "-21",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 <i class='mv'>a</i>부터 확정해요. (2, −6)을 대입하면 −6=2<i class='mv'>a</i>에서 <i class='mv'>a</i>=−3이에요. 관계식 <i class='mv'>y</i>=−3<i class='mv'>x</i>에 <i class='mv'>x</i>=6을 넣으면 <i class='mv'>b</i>=−18이죠. 따라서 <i class='mv'>a</i>+<i class='mv'>b</i>=−3+(−18)=<b>−21</b>이에요.<span class='xh'>계산 함정 격파</span>음수 두 개의 합을 −3+(−18)=−15나 15로 쓰는 덧셈 실수가 마지막 관문이에요. 같은 부호의 합은 절댓값을 더하고 부호를 그대로 두죠. 또 <i class='mv'>b</i>를 구할 때 <i class='mv'>x</i>가 2에서 6으로 3배가 되었으니 <i class='mv'>y</i>도 3배라는 성질(−6×3=−18)을 쓰면 계산이 더 빨라요. 묶음 문제는 부품(<i class='mv'>a</i>, <i class='mv'>b</i>)을 각각 적어 두고 마지막에 조합해야 뒤섞이지 않아요.",
    core: "부품을 하나씩 확정하고 마지막에 묶어요.",
  },
  {
    // [슬롯 101] 검산: (가) 곱 12 일정(반비례) · (나) y/x=3 일정(정비례 ✓) · (다) 차 2
    //  일정(y=x+2). 라벨 보기 고정 · 정답 (나) 두 번째(① 금지 ✓).
    id: "m1u3e101",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "세 표 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>정비례하는</b> 것은?",
    figure:
      mExamTableFig(["x", "1", "2", "6"], [["y", "12", "6", "2"]], { title: "(가)", aria: "표 (가)의 x와 y의 대응" }) +
      mExamTableFig(["x", "1", "2", "6"], [["y", "3", "6", "18"]], { title: "(나)", aria: "표 (나)의 x와 y의 대응" }) +
      mExamTableFig(["x", "1", "2", "6"], [["y", "3", "4", "8"]], { title: "(다)", aria: "표 (다)의 x와 y의 대응" }),
    options: ["(가)", "(나)", "(다)", "(가)와 (나)", "없다"],
    answer: 1,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 판별은 <i class='mv'>y</i>÷<i class='mv'>x</i>가 일정한지 보는 나눗셈 검사예요. 표 (나)는 3÷1=6÷2=18÷6=3으로 나눈 값이 전부 3이라 <i class='mv'>y</i>=3<i class='mv'>x</i>인 정비례예요. 답은 <b>(나)</b>죠.<span class='xh'>오답 하나씩 격파</span>표 (가)는 1×12=2×6=6×2=12로 곱이 일정한 반비례라서, 나눗셈 검사 대신 곱셈 검사에 통과하는 표예요. 표 (다)는 <i class='mv'>x</i>가 1 커질 때 <i class='mv'>y</i>도 1씩 커지는 더하기 관계(<i class='mv'>y</i>=<i class='mv'>x</i>+2)라 나눈 값이 3, 2, 4/3로 제각각이죠. '함께 커진다'는 인상만으로 (다)를 고르면 안 돼요. 표 문제는 반드시 세 열 모두에 검사를 돌려, 통과한 표 하나만 남기는 소거법이 정석이에요.",
    core: "나눗셈 검사 전 열 통과, 그게 정비례 표예요.",
  },
  {
    // [슬롯 102] 검산: 1 m에 25 g 고정 → y=25x. 무게 200 g이면 200=25x → x=8 m ✓ 역산.
    id: "m1u3e102",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "1 m의 무게가 <b>25 g</b>으로 일정한 색 테이프가 있어요. 이 테이프 " + withVars("x") + " m의 무게를 " + withVars("y") + " g이라 할 때, 무게가 <b>200 g</b>인 테이프의 길이는?",
    options: ["8 m", "5 m", "10 m", "4 m", "25 m"],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>1 m마다 25 g씩이므로 관계식은 <i class='mv'>y</i>=25<i class='mv'>x</i>예요. 이번에는 <i class='mv'>y</i>=200이 주어지고 <i class='mv'>x</i>를 묻는 역방향이죠. 200=25<i class='mv'>x</i>에서 <i class='mv'>x</i>=200÷25=<b>8</b> m예요. 검산으로 8 m×25 g=200 g이 딱 맞아요.<span class='xh'>오답 하나씩 격파</span>'5 m'는 200÷40처럼 나누는 수를 잘못 잡은 값이고, '10 m'는 어림으로 250 g쯤을 떠올린 답이에요. '4 m'는 200÷50, '25 m'는 배율 25를 그대로 답한 거죠. 역방향 문제의 요령은 방향이 바뀌어도 관계식은 그대로라는 거예요. 식을 세워 두고 아는 값을 넣을 자리만 바꾸면, 곱하기가 나누기로 자연스럽게 뒤집혀요.",
    core: "역방향도 같은 식, 넣는 자리만 바뀌어요.",
  },
  {
    // [슬롯 103] 검산: 1초에 6 m → y=6x → 8초에 48 m ✓ (레슨 340 m·1360 회피).
    id: "m1u3e103",
    lessonId: "m1u3l5",
    type: "num",
    prompt: "1초에 <b>6 m</b>를 일정하게 달리는 자전거가 있어요. <b>8초</b> 동안 달린 거리는 몇 m인지 구하세요.",
    answer: "48",
    numKind: "int",
    unitLabel: "m",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>1초마다 6 m씩 일정하게 달리므로 달린 거리는 시간에 정비례해요. <i class='mv'>x</i>초 동안 달린 거리를 <i class='mv'>y</i> m라 하면 <i class='mv'>y</i>=6<i class='mv'>x</i>이고, <i class='mv'>x</i>=8을 대입하면 <i class='mv'>y</i>=6×8=<b>48</b> m예요.<span class='xh'>계산 함정 격파</span>6+8=14처럼 더해 버리면 '매초 반복해서 쌓인다'는 구조를 놓친 거예요. 1초에 6 m가 8번 쌓이니 곱셈이죠. 또 이 문제는 8초 동안 '달린 거리'를 묻지, 어느 지점까지 남은 거리를 묻지 않아요. 문제가 요구하는 양이 누적량인지 남은 양인지 구분하는 것도 활용 문제의 기본기예요. 단위가 m라는 것까지 확인하고 답을 써요.",
    core: "매초 같은 거리는 곱셈으로 쌓여요.",
  },
  {
    // [슬롯 104] 검산: ㄱ y=x/4 = (1/4)x 정비례 ✓ · ㄴ y=9x 정비례 ✓ · ㄷ y=1/x 반비례 ·
    //  ㄹ y=x+3 덧셈 · ㅁ xy=5 반비례 변형. answer [0, 1].
    id: "m1u3e104",
    lessonId: "m1u3l5",
    type: "multi",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>정비례하는</b> 것을 모두 고르세요.",
    options: [withVars("y=x/4"), withVars("y=9x"), withVars("y=1/x"), withVars("y=x+3"), withVars("xy=5")],
    answer: [0, 1],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>판별 기준은 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i> 꼴인지예요. <i class='mv'>y</i>=<i class='mv'>x</i>/4는 <i class='mv'>x</i>에 1/4을 곱한 것과 같아 <i class='mv'>a</i>=1/4인 정비례이고, <i class='mv'>y</i>=9<i class='mv'>x</i>는 그 자체로 정비례 꼴이에요. 이 둘이 정답이죠.<span class='xh'>틀린 것 격파</span><i class='mv'>y</i>=1/<i class='mv'>x</i>는 <i class='mv'>x</i>가 분모에 있어 반비례이고, <i class='mv'>xy</i>=5도 곱이 일정한 반비례의 다른 표기예요. <i class='mv'>y</i>=<i class='mv'>x</i>+3은 3을 더하는 관계라 <i class='mv'>x</i>가 2배일 때 <i class='mv'>y</i>가 2배가 되지 않죠. 나눗셈 기호가 보이면 무조건 반비례라고 단정하지 말고, <i class='mv'>x</i>가 분자에 있는지 분모에 있는지를 확인하는 것이 이 판별의 핵심이에요.",
    core: "x가 분자면 정비례, 분모면 반비례예요.",
  },
  {
    // [슬롯 105] 검산: "x가 3배면 y도 3배" = 정비례의 성질 → y=2x만 해당 ✓.
    //  y=x+3·y=3−x(덧뺄셈)·y=3/x·xy=3(반비례)은 배율 고리가 없음.
    id: "m1u3e105",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: withVars("x") + "의 값이 <b>3배</b>가 될 때 " + withVars("y") + "의 값도 <b>3배</b>가 되는 것은?",
    options: [withVars("y=2x"), withVars("y=x−3"), withVars("y=3−x"), withVars("y=3/x"), withVars("xy=3")],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>'<i class='mv'>x</i>가 몇 배가 되면 <i class='mv'>y</i>도 같은 배가 된다'는 것은 정비례의 성질 그 자체예요. 보기 중 정비례 꼴은 <i class='mv'>y</i>=2<i class='mv'>x</i>뿐이죠. 실제로 <i class='mv'>x</i>=1일 때 2, <i class='mv'>x</i>=3일 때 6으로 <i class='mv'>x</i>가 3배 되니 <i class='mv'>y</i>도 정확히 3배가 돼요.<span class='xh'>오답 하나씩 격파</span><i class='mv'>y</i>=<i class='mv'>x</i>−3은 <i class='mv'>x</i>가 4에서 12로 3배 될 때 <i class='mv'>y</i>는 1에서 9로 9배가 되어 버려요. 빼기가 배율 고리를 끊죠. <i class='mv'>y</i>=3−<i class='mv'>x</i>는 아예 줄어들고, <i class='mv'>y</i>=3/<i class='mv'>x</i>와 <i class='mv'>xy</i>=3은 반비례라 <i class='mv'>x</i>가 3배면 <i class='mv'>y</i>는 1/3배가 돼요. 성질을 물으면 실제 수를 하나 넣어 배율을 확인하는 것이 가장 빠른 검산이에요.",
    core: "같은 배율로 커지는 건 y=ax뿐이에요.",
  },
  {
    // [슬롯 106] 검산: 표는 y=−2x(−2·−4·8?·−8) · ㉠은 y=8일 때의 x → 8=−2x → x=−4 ✓
    //  (역방향 빈칸 · x행에 ㉠).
    id: "m1u3e106",
    lessonId: "m1u3l5",
    type: "num",
    prompt: "표는 정비례 관계 " + withVars("y=−2x") + "의 대응을 나타낸 거예요. ㉠에 알맞은 수를 구하세요.",
    figure: mExamTableFig(["x", "1", "2", "㉠", "4"], [["y", "−2", "−4", "8", "−8"]], { aria: "x와 y의 대응 관계를 나타낸 표" }),
    answer: "-4",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>이번 빈칸은 <i class='mv'>y</i>가 아니라 <i class='mv'>x</i>쪽에 있어요. ㉠ 열의 <i class='mv'>y</i>값이 8이므로 <i class='mv'>y</i>=−2<i class='mv'>x</i>에 8을 넣으면 8=−2<i class='mv'>x</i>, 즉 <i class='mv'>x</i>=8÷(−2)=<b>−4</b>예요. 검산으로 −2×(−4)=8이 표의 값과 맞아요.<span class='xh'>계산 함정 격파</span>x행이 1, 2, 다음이니까 3이라고 쓰면 규칙을 확인하지 않은 답이에요. 이 표의 ㉠ 열은 <i class='mv'>y</i>=8인 특별한 열이라 이웃 나열과 달라요. 또 8÷(−2)를 4로 계산하면 부호를 잃죠. 양수 <i class='mv'>y</i>가 나오려면 음수 배율에 음수 <i class='mv'>x</i>가 필요하다는 부호 감각으로도 −4를 확인할 수 있어요. 빈칸이 어느 행에 있는지 먼저 보는 것이 표 문제의 출발점이에요.",
    core: "빈칸이 x행이면 식을 거꾸로 풀어요.",
  },
  {
    // [슬롯 107] 검산: y=7x에 x=2 → 14 ✓ 기초 대입.
    id: "m1u3e107",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=7x") + "에서 " + withVars("x=2") + "일 때 " + withVars("y") + "의 값은?",
    options: ["14", "9", "7", "5", "27"],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>관계식이 이미 주어져 있으니 대입만 하면 돼요. <i class='mv'>y</i>=7<i class='mv'>x</i>에 <i class='mv'>x</i>=2를 넣으면 <i class='mv'>y</i>=7×2=<b>14</b>예요. <i class='mv'>x</i>가 1일 때 7이고, <i class='mv'>x</i>가 2배가 되면 <i class='mv'>y</i>도 2배가 된다는 정비례 성질로 봐도 7의 2배인 14죠.<span class='xh'>오답 하나씩 격파</span>'9'는 7+2로 곱셈 자리를 덧셈으로 계산한 답이고, '5'는 7−2를 계산한 거예요. 식의 7<i class='mv'>x</i>는 7과 <i class='mv'>x</i>를 곱하라는 뜻이라는 표기 약속을 잊으면 이런 실수가 나와요. '7'은 대입 전의 배율을 그대로 답한 것이고, '27'은 곱할 두 수 2와 7을 계산 없이 그대로 이어 붙인 오독이에요. 간단한 대입일수록 연산 기호를 눈으로 확인하고 계산해요.",
    core: "7x는 7 곱하기 x, 대입은 곱셈이에요.",
  },
  {
    // [슬롯 109] 검산: (가) y/x = −2/1 = −4/2 = −12/6 = −2 일정(정비례 a=−2 ✓) ·
    //  (나) 곱 1×24=2×12=6×4=24 일정(반비례). 조합 보기 관례순 고정 · 정답 두 번째(① 금지 ✓).
    id: "m1u3e109",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "두 표 (가), (나) 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>정비례</b>하는 것과 그때의 " + withVars("a") + "(" + withVars("y=ax") + ")를 짝지은 것은?",
    figure:
      mExamTableFig(["x", "1", "2", "6"], [["y", "−2", "−4", "−12"]], { title: "(가)", aria: "표 (가)의 x와 y의 대응" }) +
      mExamTableFig(["x", "1", "2", "6"], [["y", "24", "12", "4"]], { title: "(나)", aria: "표 (나)의 x와 y의 대응" }),
    options: ["(가), a=2", "(가), a=−2", "(나), a=24", "(나), a=−2", "(가), a=−12"],
    answer: 1,
    shuffle: false,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>표 (가)에 나눗셈 검사를 하면 −2÷1=−4÷2=−12÷6=−2로 나눈 값이 일정해요. 정비례이고 배율은 <i class='mv'>a</i>=<b>−2</b>죠. 표 (나)는 1×24=2×12=6×4=24로 곱이 일정한 반비례라서 정비례 후보에서 탈락해요. 답은 <b>(가), <i class='mv'>a</i>=−2</b>예요.<span class='xh'>오답 하나씩 격파</span>'(가), <i class='mv'>a</i>=2'는 나눈 값의 음의 부호를 잃은 답이에요. <i class='mv'>y</i>가 전부 음수이니 배율도 음수여야죠. '(나), <i class='mv'>a</i>=24'는 반비례의 일정한 곱을 정비례의 <i class='mv'>a</i>로 착각한 조합이고, '(가), <i class='mv'>a</i>=−12'는 마지막 열의 <i class='mv'>y</i>값을 배율로 잘못 읽은 거예요. 표가 두 개면 각각 어느 검사(나눗셈·곱셈)에 통과하는지 표시부터 하고 조합을 골라요.",
    core: "나눗셈 검사 통과 표에서 그 몫이 a예요.",
  },
  {
    // [슬롯 110] 검산: y=−9x에 x=−2 → (−9)×(−2)=18 ✓ (초판 y=−6x는 s098의 은닉 관계식
    //  a=−6과 동일해 s098 1단계를 노출 · 검산 V1 적발로 교체 · L5 값표 110=18 갱신).
    id: "m1u3e110",
    lessonId: "m1u3l5",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=−9x") + "에서 " + withVars("x=−2") + "일 때 " + withVars("y") + "의 값을 구하세요.",
    answer: "18",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>y</i>=−9<i class='mv'>x</i>에 <i class='mv'>x</i>=−2를 대입하면 <i class='mv'>y</i>=(−9)×(−2)예요. 음수와 음수의 곱은 양수이므로 <i class='mv'>y</i>=<b>18</b>이죠. 배율이 음수인 정비례에서는 <i class='mv'>x</i>가 음수일 때 <i class='mv'>y</i>가 양수가 되는, 부호가 서로 반대인 관계가 만들어져요.<span class='xh'>계산 함정 격파</span>가장 흔한 실수는 (−9)×(−2)를 −18로 쓰는 부호 오류예요. 곱셈에서 음수가 짝수 개면 결과는 양수라는 규칙을 확인해요. 또 −9−2=−11처럼 곱셈을 뺄셈으로 바꿔 버리는 실수도 있죠. 식의 −9<i class='mv'>x</i>는 '−9 곱하기 <i class='mv'>x</i>'라는 뜻이에요. 음수 대입은 괄호를 쳐서 (−9)×(−2)로 적고 계산하는 습관이 실수를 확 줄여 줘요.",
    core: "음수 대입은 괄호부터, 음수 곱 음수는 양수!",
  },
  {
    // [슬롯 111] 검산: 정비례 그래프 = 원점을 지나는 직선 → up 카드 ✓. 곡선·수평·원점
    //  이탈은 탈락. 정답 ② (① 금지 ✓). 좌표평면판 개형(RC)은 L6 몫 · 여기는 모양 감각.
    id: "m1u3e111",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: withVars("y") + "가 " + withVars("x") + "에 정비례할 때(" + withVars("x") + "&gt;0, " + withVars("a") + "&gt;0), 그래프의 <b>모양</b>으로 알맞은 것은?",
    figure: miniGraphRow(["curvefast", "up", "upflat"]),
    options: ["(가)", "(나)", "(다)"],
    answer: 1,
    shuffle: false,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 관계는 <i class='mv'>x</i>가 커지는 만큼 <i class='mv'>y</i>가 일정한 배율로 커져요. 그래서 그래프는 원점에서 출발해 곧게 뻗는 직선이 되고, 그 모양이 <b>(나)</b>예요. 늘어나는 빠르기가 한결같으니 휘어질 이유가 없죠.<span class='xh'>오답 하나씩 격파</span>'(가)'는 갈수록 가팔라지는 곡선이라 배율이 점점 커지는 상황이에요. 정비례는 배율이 고정이라 곡선이 될 수 없어요. '(다)'는 오르다가 수평이 되는 모양인데, 수평 구간에서는 <i class='mv'>x</i>가 커져도 <i class='mv'>y</i>가 안 변하니 '2배면 2배'라는 정비례의 약속이 깨져요. 식과 모양을 잇는 감각, 즉 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>는 곧은 직선이라는 연결을 이 문제로 굳혀 두세요.",
    core: "일정한 배율은 곧은 직선을 만들어요.",
  },

  /* ════════ L6 정비례 그래프: 원점을 지나는 직선 ════════ */
  {
    // [슬롯 112] 검산: 그림 직선 a=4/5 > 0 → 오른쪽 위 방향 · 제1·3사분면 통과 ✓.
    //  조합 문장 보기(방향+사분면) 셔플 기본.
    id: "m1u3e112",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그림과 같은 정비례 관계의 그래프에 대한 설명으로 <b>옳은</b> 것은?",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 4 / 5, color: "#364FC7" }],
    }),
    options: [
      "오른쪽 위로 향하고 제1사분면과 제3사분면을 지나요",
      "오른쪽 아래로 향하고 제2사분면과 제4사분면을 지나요",
      "오른쪽 위로 향하고 제2사분면과 제4사분면을 지나요",
      "오른쪽 아래로 향하고 제1사분면과 제3사분면을 지나요",
      "원점을 지나지 않아요",
    ],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그림의 직선은 왼쪽 아래에서 오른쪽 위로 올라가요. <i class='mv'>x</i>가 커질 때 <i class='mv'>y</i>도 커지는 방향이고, 원점을 지나면서 오른쪽 위(제1사분면)와 왼쪽 아래(제3사분면)를 통과하죠. 그래서 첫 번째 설명이 옳아요.<span class='xh'>오답 하나씩 격파</span>'오른쪽 아래로 향한다'는 배율 <i class='mv'>a</i>가 음수일 때의 모습이라 그림과 반대예요. '오른쪽 위로 향하며 제2·4사분면을 지난다'는 조합은 아예 성립할 수 없어요. 원점을 지나는 직선이 오른쪽 위로 향하면 반드시 1·3사분면 짝이고, 오른쪽 아래로 향하면 2·4사분면 짝이거든요. 방향과 사분면은 세트로 묶여 다닌다는 것, 그리고 정비례 그래프는 언제나 원점을 지난다는 것을 함께 기억해요.",
    core: "방향과 사분면 짝은 세트, a>0은 1·3사분면!",
  },
  {
    // [슬롯 114] 검산: y=−7x 대입 판별 · (2, −14): −7×2=−14 ✓ 정답. (−2, −14)는 14 ·
    //  (14, −2)는 −98 · (2, 14)는 부호 반대 · (−1, −7)은 7 · 전부 불일치 ✓ (통과점 (1, −7)은
    //  보기에 넣지 않음 · 복수 정답 방지). §3-0: 초판 y=5x → 7x(s132 충돌 회피)가 s113 정답
    //  a=7과 2차 충돌(검산 V2 적발) → 3차 교체 y=−7x(L6 내 ±7 노출은 이 문항의 −7뿐).
    id: "m1u3e114",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=−7x") + "의 그래프 <b>위에 있는</b> 점은?",
    options: [coordPair(2, -14), coordPair(-2, -14), coordPair(14, -2), coordPair(2, 14), coordPair(-1, -7)],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그래프 위의 점인지 확인하는 방법은 좌표를 식에 대입하는 거예요. (2, −14)를 넣으면 <i class='mv'>y</i>=−7×2=−14로 <i class='mv'>y</i>좌표와 정확히 일치하니 <b>(2, −14)</b>가 그래프 위의 점이에요.<span class='xh'>오답 하나씩 격파</span>(−2, −14)는 −7×(−2)=14라 y좌표의 부호가 어긋나고, (2, 14)도 같은 부호 함정의 반대쪽이에요. 배율이 음수면 <i class='mv'>x</i>와 <i class='mv'>y</i>의 부호가 반드시 반대라는 성질로 걸러낼 수 있죠. (14, −2)는 두 좌표를 거꾸로 짝지은 순서 함정으로 −7×14=−98이라 탈락해요. (−1, −7)은 −7×(−1)=7이라 y좌표가 반대예요. 다섯 좌표를 전부 대입 검사하는 것이 정석이고, 곱해서 <i class='mv'>y</i>가 나오는지 한 줄씩 확인하면 실수가 없어요.",
    core: "a가 음수면 두 좌표의 부호는 반드시 반대예요.",
  },
  {
    // [슬롯 115] 검산: 그림 직선은 y=−8x(부품 §3-0) · (1, k)를 지나므로 k=−8×1=−8 ✓.
    //  |a|=8이라 y축에 바짝 선 직선 · min −9·max 9·labelEvery 1로 (1, −8) 라벨 눈금 위.
    id: "m1u3e115",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계의 그래프가 그림과 같아요. 이 그래프가 점 " + withVars("(1, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -9,
      max: 9,
      size: 330,
      labelEvery: 1,
      lines: [{ a: -8, color: "#364FC7" }],
    }),
    answer: "-8",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>가로 1칸 자리에서 직선이 지나는 높이를 격자에서 읽으면 −8이에요. 즉 그래프가 (1, −8)을 지나므로 <i class='mv'>k</i>=<b>−8</b>이에요. <i class='mv'>x</i>=1일 때의 <i class='mv'>y</i>값은 정비례 관계식의 배율 그 자체라서, 이 직선이 <i class='mv'>y</i>=−8<i class='mv'>x</i>의 그래프라는 것도 함께 읽을 수 있죠.<span class='xh'>판독 함정 격파</span>직선이 y축에 바짝 붙어 가파르니 이웃 세로줄과 헷갈리기 쉬워요. 반드시 가로 1칸 지점에서 세로로 짚어 내려가며 격자 눈금을 세요. 부호를 놓치고 8이라 답하면 오른쪽 위로 향하는 정반대 직선이 되니, 직선의 방향(오른쪽 아래)과 답의 부호(음수)가 맞는지 마지막에 대조해요.",
    core: "x=1에서의 높이가 곧 배율이자 k예요.",
  },
  {
    // [슬롯 117] 검산: 격자점 (5, 3) 판독 → a=3/5 ✓ (§3-0에서 (4, 3)·3/4가 121 문두와
    //  충돌해 재설계). slash 보기 · 5/3은 역수·−3/5는 부호·3은 y좌표·15는 곱 함정.
    id: "m1u3e117",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=ax") + "의 그래프가 그림과 같이 점 P를 지날 때, " + withVars("a") + "의 값은?",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 3 / 5, color: "#364FC7" }],
      points: [{ label: "P", x: 5, y: 3, color: "#364FC7", labelDx: 13, labelDy: -6 }],
    }),
    options: ["3/5", "5/3", "−3/5", "3", "15"],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표를 격자에서 읽으면 (5, 3)이에요. <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에 대입하면 3=5<i class='mv'>a</i>이므로 <i class='mv'>a</i>=<b>3/5</b>예요. 배율이 1보다 작은 분수라서 직선이 완만하게 눕는 모양인 것도 그림과 맞아떨어지죠.<span class='xh'>오답 하나씩 격파</span>'5/3'은 <i class='mv'>x</i>÷<i class='mv'>y</i>로 거꾸로 나눈 역수 함정이에요. <i class='mv'>a</i>는 언제나 <i class='mv'>y</i>÷<i class='mv'>x</i>, 즉 세로를 가로로 나눈 값이에요. '−3/5'는 오른쪽 위로 향하는 그림과 부호가 어긋나고, '3'은 P의 y좌표를, '15'는 두 좌표의 곱을 답한 거예요. 곱은 반비례의 <i class='mv'>a</i>를 구할 때의 방법이니 두 관계식의 공식을 섞지 않도록 조심해요.",
    core: "a는 세로÷가로, 분수여도 당당한 배율이에요.",
  },
  {
    // [슬롯 118] 검산: (2, −8) 대입 → a=−4 → y=−4x에 x=−3 → k=(−4)×(−3)=12 ✓ 2단.
    id: "m1u3e118",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=ax") + "의 그래프가 두 점 " + withVars("(2, −8)") + ", " + withVars("(−3, k)") + "를 지나요. " + withVars("k") + "의 값을 구하세요.",
    answer: "12",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 좌표가 완전한 점 (2, −8)로 배율을 확정해요. −8=2<i class='mv'>a</i>에서 <i class='mv'>a</i>=−4이므로 그래프의 식은 <i class='mv'>y</i>=−4<i class='mv'>x</i>예요. 이제 <i class='mv'>x</i>=−3을 대입하면 <i class='mv'>k</i>=(−4)×(−3)=<b>12</b>죠.<span class='xh'>계산 함정 격파</span>부호 처리가 두 번 이어져요. −8÷2에서 음의 부호를 잃으면 <i class='mv'>a</i>=4가 되어 <i class='mv'>k</i>=−12로 뒤집히고, (−4)×(−3)을 −12로 쓰면 음수 곱셈 규칙을 놓친 거예요. 같은 그래프 위의 두 점은 반드시 같은 식을 만족한다는 것이 이 유형의 뼈대예요. 완전한 점으로 식을 만들고, 미지수가 있는 점을 대입하는 순서만 지키면 어떤 두 점 문제도 같은 길로 풀려요.",
    core: "완전한 점으로 식부터, 미지수 점은 그다음!",
  },
  {
    // [슬롯 120] 검산: (−1, 2)로 a=−2 확정 → (3, b)에서 b=−2×3=−6 ✓ (천재06 a+b 묶음
    //  계보의 부품형 · 수치 신작).
    id: "m1u3e120",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=ax") + "의 그래프가 두 점 " + withVars("(−1, 2)") + ", " + withVars("(3, b)") + "를 지나요. " + withVars("b") + "의 값을 구하세요.",
    answer: "-6",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>좌표가 완전한 점 (−1, 2)를 대입하면 2=−<i class='mv'>a</i>이므로 <i class='mv'>a</i>=−2예요. 그래프의 식은 <i class='mv'>y</i>=−2<i class='mv'>x</i>이고, <i class='mv'>x</i>=3을 넣으면 <i class='mv'>b</i>=−2×3=<b>−6</b>이에요. 두 점 (−1, 2)와 (3, −6)이 같은 직선 위에서 원점을 사이에 두고 반대쪽에 있는 그림을 떠올리면 부호가 자연스럽죠.<span class='xh'>계산 함정 격파</span>2=−<i class='mv'>a</i>에서 <i class='mv'>a</i>=2로 쓰면 음수 계수 확정에서 미끄러져요. <i class='mv'>x</i>가 −1일 때 <i class='mv'>y</i>가 양수 2라는 것은 배율이 음수라는 신호예요. 부호가 반대인 두 좌표를 보면 <i class='mv'>a</i>&lt;0을 예상하고 계산을 시작하는 감각을 길러 두면, 마지막 답 <i class='mv'>b</i>의 부호도 검산할 수 있어요.",
    core: "좌표 부호가 반대면 배율은 음수라는 신호예요.",
  },
  {
    // [슬롯 121] 검산: y=(3/4)x에서 x=3이면 y=9/4(≠4) → "(3, 4)를 지난다"가 거짓 = 정답 ✓.
    //  (4, 3)은 (3/4)×4=3으로 참. 대입 검증 함정(미래엔05ㄷ 계보).
    id: "m1u3e121",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=(3/4)x") + "의 그래프에 대한 설명으로 <b>옳지 않은</b> 것은?",
    options: [
      "점 (3, 4)를 지나요",
      "원점을 지나는 직선이에요",
      "오른쪽 위로 향해요",
      "점 (4, 3)을 지나요",
      "x의 값이 커지면 y의 값도 커져요",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>수상한 좌표는 대입으로 검산해요. <i class='mv'>x</i>=3을 넣으면 <i class='mv'>y</i>=(3/4)×3=9/4이지 4가 아니에요. 그러니 '(3, 4)를 지난다'가 <b>옳지 않은</b> 설명이에요. 반대로 <i class='mv'>x</i>=4를 넣으면 <i class='mv'>y</i>=3이라 (4, 3)은 정확히 그래프 위의 점이죠.<span class='xh'>오답 하나씩 격파</span>나머지는 전부 참이에요. 정비례 그래프는 언제나 원점을 지나는 직선이고, 배율 3/4이 양수라 오른쪽 위로 향하며 <i class='mv'>x</i>가 커질 때 <i class='mv'>y</i>도 커져요. 이 문제의 함정은 (3, 4)와 (4, 3)이 나란히 등장한다는 거예요. 분수 배율 <i class='mv'>a</i>=3/4은 '가로 4칸에 세로 3칸'이라는 뜻이라, 지나는 격자점은 (4, 3)이에요. 분자와 분모가 어느 축의 몫인지 뒤집지 않도록 대입 검산을 습관화해요.",
    core: "수상한 점은 대입 검산, (4, 3)만 진짜예요.",
  },
  {
    // [슬롯 122] 검산: 조건 = 원점 통과 + 오른쪽 위 → ② 우상향 원점 직선 ✓. ① 곡선 ·
    //  ③ 우하향 · ④ 원점 이탈 우상향 · ⑤ 2·4사분면 곡선. 정답 ② (① 금지 ✓).
    id: "m1u3e122",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그래프가 <b>원점을 지나는 직선</b>이면서 <b>오른쪽 위로 향하는</b> 것은?",
    figure: mExamRelChoicesFig([
      { inv: 1 },
      { line: { a: 0.85 } },
      { line: { a: -0.85 } },
      { line: { a: 0.85, bPx: 16 } },
      { inv: -1 },
    ]),
    options: ["①", "②", "③", "④", "⑤"],
    answer: 1,
    shuffle: false,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 그래프의 두 가지 신분증을 확인해요. 원점을 지나는가, 그리고 어느 방향인가. '②'는 원점을 지나는 곧은 직선이면서 오른쪽 위로 올라가므로 두 조건을 모두 만족해요. <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에서 <i class='mv'>a</i>&gt;0인 그래프의 표준 모습이죠.<span class='xh'>오답 하나씩 격파</span>'①'과 '⑤'는 한 쌍의 매끄러운 곡선이라 반비례 그래프예요. 방향 이전에 직선이 아니라는 점에서 탈락이죠. '③'은 직선이고 원점도 지나지만 오른쪽 아래로 향해 방향 조건에 걸려요. '④'는 오른쪽 위로 가긴 해도 원점을 비껴가서 정비례 그래프가 아니에요. 직선인가, 원점을 지나는가, 방향이 맞는가의 세 관문을 차례로 통과시키면 카드 문제는 기계적으로 풀려요.",
    core: "직선·원점·방향, 세 관문을 차례로 통과!",
  },
  {
    // [슬롯 123] 검산: y=(1/4)x에 x=8 → k=2 ✓ 분수 계수 대입.
    id: "m1u3e123",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=(1/4)x") + "의 그래프가 점 " + withVars("(8, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    answer: "2",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그래프가 (8, <i class='mv'>k</i>)를 지난다는 것은 <i class='mv'>x</i>=8일 때의 <i class='mv'>y</i>값이 <i class='mv'>k</i>라는 뜻이에요. 대입하면 <i class='mv'>k</i>=(1/4)×8=8÷4=<b>2</b>예요. 배율이 1/4이라는 것은 <i class='mv'>y</i>가 <i class='mv'>x</i>의 4분의 1이라는 뜻이니, 8의 4분의 1인 2가 바로 나오죠.<span class='xh'>계산 함정 격파</span>분수 배율에서 4를 곱해 32라고 답하면 1/4배와 4배를 뒤집은 거예요. (1/4)<i class='mv'>x</i>는 <i class='mv'>x</i>를 4로 나눈다는 뜻이에요. 또 8−4=4나 8+4=12처럼 연산을 바꿔 버리는 실수도 있어요. 분수 계수가 나오면 '분모로 나누고 분자를 곱한다'로 번역해 계산하면 헷갈릴 일이 없어요.",
    core: "(1/4)x는 x를 4로 나누라는 뜻이에요.",
  },
  {
    // [슬롯 124] 검산: ㉠은 (1, 4) 격자 통과 → a=4 · ㉡은 (1, −6) 통과 → a=−6 ✓
    //  (§3-0 재설계 부품 4·−6). ㉠㉡ 정의는 문두가 담당(가파른 직선의 lines label은
    //  x=max−0.4 고정 위치라 뷰박스 밖 클리핑 · 눈검수 반영, 그림 라벨 제거).
    //  ㉠㉡ 조합 보기 관례순 고정 · 정답 두 번째(① 금지 ✓).
    id: "m1u3e124",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt:
      "그림의 두 직선은 각각 정비례 관계 그래프예요. <b>오른쪽 위로 향하는</b> 직선을 ㉠, <b>오른쪽 아래로 향하는</b> 직선을 ㉡이라 할 때, ㉠과 ㉡의 " + withVars("a") + "(" + withVars("y=ax") + ") 값을 차례로 짝지은 것은?",
    figure: mExamRelationPlaneFig({
      min: -9,
      max: 9,
      size: 330,
      labelEvery: 1,
      lines: [
        { a: 4, color: "#364FC7" },
        { a: -6, color: "#E8547E" },
      ],
    }),
    options: ["㉠ −6, ㉡ 4", "㉠ 4, ㉡ −6", "㉠ 4, ㉡ 6", "㉠ 1/4, ㉡ −1/6", "㉠ −4, ㉡ 6"],
    answer: 1,
    shuffle: false,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>각 직선이 지나는 격자점을 하나씩 찾아요. ㉠은 오른쪽 위로 향하며 (1, 4)를 지나므로 <i class='mv'>a</i>=4이고, ㉡은 오른쪽 아래로 향하며 (1, −6)을 지나므로 <i class='mv'>a</i>=−6이에요. 짝은 <b>㉠ 4, ㉡ −6</b>이죠. 방향이 위면 양수, 아래면 음수라는 부호 확인이 첫 번째 검산이에요.<span class='xh'>오답 하나씩 격파</span>'㉠ −6, ㉡ 4'는 두 직선의 값을 서로 바꾼 짝이고, '㉠ 4, ㉡ 6'은 ㉡의 방향(아래)을 보고도 부호를 놓친 답이에요. '㉠ 1/4, ㉡ −1/6'은 격자점을 (4, 1)·(−6, 1)로 거꾸로 읽어 역수가 된 경우죠. '㉠ −4, ㉡ 6'은 두 부호를 모두 뒤집은 답이에요. 직선이 두 개일 때는 하나씩 이름표를 붙여 가며 각각 판독하고, 마지막에 방향과 부호를 대조해요.",
    core: "직선마다 격자점 하나, 방향으로 부호 검산!",
  },
  {
    // [슬롯 125] 검산: P(2, 7) 판독 → x가 2배(2→4)면 y도 2배(7→14) → y=14 ✓
    //  (§3-0 재설계 · 배율 성질 경로 · 부품 a=7/2).
    id: "m1u3e125",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계의 그래프가 그림과 같이 점 P를 지나요. " + withVars("x=4") + "일 때 " + withVars("y") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -8,
      max: 8,
      size: 330,
      labelEvery: 1,
      lines: [{ a: 3.5, color: "#364FC7" }],
      points: [{ label: "P", x: 2, y: 7, color: "#364FC7", labelDx: 14, labelDy: -4 }],
    }),
    answer: "14",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표를 격자에서 읽으면 (2, 7)이에요. 정비례에서는 <i class='mv'>x</i>가 2배가 되면 <i class='mv'>y</i>도 2배가 되죠. <i class='mv'>x</i>가 2에서 4로 2배가 되었으니 <i class='mv'>y</i>는 7의 2배인 <b>14</b>예요. 관계식으로 풀어도 <i class='mv'>a</i>=7/2이고 (7/2)×4=14로 같은 답이에요.<span class='xh'>계산 함정 격파</span>'<i class='mv'>x</i>가 2 커졌으니 <i class='mv'>y</i>도 2 커진다'로 읽으면 9라는 오답이 나와요. 정비례는 덧셈이 아니라 배율의 관계라는 것이 핵심이에요. 또 배율을 <i class='mv'>a</i>=2/7로 뒤집어 계산하는 실수도 있는데, 이 경로로는 답이 분수가 되어 버리니 신호로 삼아요. 분수 배율이 부담스러우면 이 문제처럼 '몇 배가 되었나'의 성질 경로가 훨씬 빠르고 안전해요.",
    core: "x가 2배면 y도 2배, 배율 경로가 지름길!",
  },
  {
    // [슬롯 126] 검산: a<0의 성질 = 오른쪽 아래 + 제2·4사분면 ✓ (문장 조합 보기).
    id: "m1u3e126",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "정비례 관계 " + withVars("y=ax") + "에서 " + withVars("a") + "&lt;0일 때, 그래프에 대한 설명으로 <b>옳은</b> 것은?",
    options: [
      "오른쪽 아래로 향하고 제2사분면과 제4사분면을 지나요",
      "오른쪽 위로 향하고 제1사분면과 제3사분면을 지나요",
      "오른쪽 아래로 향하고 제1사분면과 제3사분면을 지나요",
      "x의 값이 커지면 y의 값도 커져요",
      "원점을 지나지 않아요",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>a</i>가 음수이면 <i class='mv'>x</i>와 <i class='mv'>y</i>의 부호가 항상 반대예요. 그래서 그래프는 오른쪽으로 갈수록 내려가고, 부호가 반대인 구역인 제2사분면(−, +)과 제4사분면(+, −)을 지나요. 첫 번째 설명이 정확해요.<span class='xh'>오답 하나씩 격파</span>'오른쪽 위 + 1·3사분면'은 <i class='mv'>a</i>&gt;0일 때의 이야기예요. '오른쪽 아래 + 1·3사분면'은 있을 수 없는 조합이고요. 방향이 아래면 사분면 짝은 자동으로 2·4예요. '<i class='mv'>x</i>가 커지면 <i class='mv'>y</i>도 커진다'는 <i class='mv'>a</i>&gt;0의 성질이라 반대이고, '원점을 지나지 않는다'는 정비례 그래프의 신분증을 부정하는 설명이에요. <i class='mv'>a</i>의 부호 하나가 방향·사분면·증감을 한꺼번에 정한다는 것을 세트로 기억해요.",
    core: "a<0이면 내리막, 2·4사분면 세트예요.",
  },
  {
    // [슬롯 127] 검산: ㄱ 참(원점 통과) · ㄴ 참(a>0 우상향) · ㄹ 참(x=1일 때 y=a) ·
    //  ㄷ 거짓(a<0은 2·4사분면) · ㅁ 거짓(직선). answer [0, 1, 3].
    id: "m1u3e127",
    lessonId: "m1u3l6",
    type: "multi",
    prompt: "정비례 관계 " + withVars("y=ax") + "(" + withVars("a") + "는 0이 아닌 수)의 그래프에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "원점을 지나요",
      "a>0이면 오른쪽 위로 향해요",
      "a<0이면 제1사분면과 제3사분면을 지나요",
      "x=1일 때 y의 값은 a예요",
      "그래프는 매끄러운 곡선이에요",
    ],
    answer: [0, 1, 3],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 그래프는 <i class='mv'>x</i>=0일 때 <i class='mv'>y</i>=0이라 반드시 원점을 지나고, <i class='mv'>a</i>&gt;0이면 오른쪽 위로 향해요. 또 <i class='mv'>x</i>=1을 대입하면 <i class='mv'>y</i>=<i class='mv'>a</i>×1=<i class='mv'>a</i>이니 그래프는 언제나 점 (1, <i class='mv'>a</i>)를 지나요. 격자에서 가로 1칸 자리의 높이만 읽으면 <i class='mv'>a</i>가 바로 나오는, 그래프에서 배율을 읽는 지름길 성질이죠.<span class='xh'>틀린 설명 격파</span><i class='mv'>a</i>&lt;0일 때 지나는 구역은 제2사분면과 제4사분면이에요. 1·3사분면은 <i class='mv'>a</i>&gt;0의 몫이니 부호와 구역의 짝을 바꾼 함정이죠. 그리고 정비례 그래프는 언제나 곧은 직선이에요. 매끄러운 곡선은 반비례 그래프의 모습이라, 두 그래프의 정체성을 맞바꾼 설명이에요. 판별 문제에서는 부호와 구역의 짝, 직선과 곡선의 짝을 바꿔치기하는 보기가 단골이라는 것을 기억해요.",
    core: "원점 통과 직선, (1, a)가 열쇠 점이에요.",
  },
  {
    // [슬롯 128] 검산: 그림 직선 y=−5x(부품) · (−1, k)에서 k=(−5)×(−1)=5 ✓ 그림 (−1, 5)
    //  격자 판독 (§3-0에서 값 10→5 재배정).
    id: "m1u3e128",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계의 그래프가 그림과 같아요. 이 그래프가 점 " + withVars("(−1, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: -5, color: "#364FC7" }],
    }),
    answer: "5",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>가로 −1칸 자리에서 직선이 지나는 높이를 격자에서 읽으면 5예요. 즉 그래프가 (−1, 5)를 지나므로 <i class='mv'>k</i>=<b>5</b>예요. 이 직선은 (1, −5)도 지나니 <i class='mv'>y</i>=−5<i class='mv'>x</i>의 그래프이고, <i class='mv'>x</i>=−1을 대입하면 (−5)×(−1)=5로 계산과 판독이 일치해요.<span class='xh'>판독 함정 격파</span>오른쪽 아래로 향하는 직선이니 <i class='mv'>y</i>값도 음수일 거라고 지레짐작해 −5라 답하면, <i class='mv'>x</i>가 음수인 왼쪽에서는 직선이 x축 위쪽에 있다는 것을 놓친 거예요. 내리막 직선도 왼쪽 절반에서는 양수 <i class='mv'>y</i>를 가져요. 부호는 직선의 방향이 아니라 묻는 지점의 실제 위치에서 읽어야 한다는 것이 이 문제의 교훈이에요.",
    core: "내리막 직선도 왼쪽에서는 y가 양수예요.",
  },
  {
    // [슬롯 129] 검산: 원점을 지나는 것은 y=3x뿐 ✓ (y=3x+1은 (0, 1) · y=3/x·xy=3은 반비례
    //  원점 비통과 · y=4−x는 (0, 4)).
    id: "m1u3e129",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그래프가 <b>원점을 지나는</b> 것은?",
    options: [withVars("y=3x"), withVars("y=3x+1"), withVars("y=3/x"), withVars("y=4−x"), withVars("xy=3")],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>원점 (0, 0)을 지나는지 확인하려면 <i class='mv'>x</i>=0을 넣어 <i class='mv'>y</i>=0이 되는지 보면 돼요. <i class='mv'>y</i>=3<i class='mv'>x</i>는 3×0=0이라 통과예요. 0에 무엇을 곱해도 0이라는 성질이 정비례 그래프가 항상 원점을 지나는 이유죠.<span class='xh'>오답 하나씩 격파</span><i class='mv'>y</i>=3<i class='mv'>x</i>+1은 <i class='mv'>x</i>=0일 때 <i class='mv'>y</i>=1이라 원점을 살짝 비껴가요. +1 하나가 그래프 전체를 들어 올린 셈이에요. <i class='mv'>y</i>=4−<i class='mv'>x</i>도 (0, 4)를 지나 탈락이죠. <i class='mv'>y</i>=3/<i class='mv'>x</i>와 <i class='mv'>xy</i>=3은 반비례라 <i class='mv'>x</i>=0 자체가 금지 구역이고, 곡선이 축에 한없이 가까워질 뿐 원점 근처에도 못 가요. '0 대입 검사'는 원점 통과를 판별하는 만능 열쇠랍니다.",
    core: "x=0에 y=0이 나와야 원점 통과예요.",
  },
  {
    // [슬롯 132] 검산: 격자점 (2, 5) 판독 → a=5/2 → 식 y=(5/2)x ✓ slash 보기.
    //  (2/5)x는 역수 · 5x는 y좌표 오독 · 2x+1은 원점 이탈 · 10/x는 곱 함정.
    id: "m1u3e132",
    lessonId: "m1u3l6",
    type: "mcq",
    prompt: "그림과 같이 점 P를 지나는 정비례 관계 그래프의 <b>관계식</b>은?",
    figure: mExamRelationPlaneFig({
      min: -6,
      max: 6,
      labelEvery: 1,
      lines: [{ a: 2.5, color: "#364FC7" }],
      points: [{ label: "P", x: 2, y: 5, color: "#364FC7", labelDx: 13, labelDy: -6 }],
    }),
    options: [withVars("y=(5/2)x"), withVars("y=(2/5)x"), withVars("y=5x"), withVars("y=2x+1"), withVars("y=10/x")],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>점 P의 좌표는 (2, 5)예요. 정비례 관계식 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에 대입하면 5=2<i class='mv'>a</i>에서 <i class='mv'>a</i>=5/2이고, 관계식은 <b><i class='mv'>y</i>=(5/2)<i class='mv'>x</i></b>예요. 검산으로 <i class='mv'>x</i>=2를 넣으면 (5/2)×2=5로 P를 정확히 지나죠.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=(2/5)<i class='mv'>x</i>'는 가로와 세로를 거꾸로 나눈 역수 함정이에요. '<i class='mv'>y</i>=5<i class='mv'>x</i>'는 P의 y좌표 5를 그대로 배율로 쓴 것인데, 그 직선은 (2, 10)을 지나 버려요. '<i class='mv'>y</i>=2<i class='mv'>x</i>+1'은 (2, 5)를 지나긴 하지만 원점을 지나지 않아 정비례 관계식이 아니고, '<i class='mv'>y</i>=10/<i class='mv'>x</i>'는 곱 10이 일정한 반비례 곡선이에요. 점 하나를 지나는 식은 많아도 '원점을 지나는 정비례'라는 조건이 답을 하나로 좁혀 줘요.",
    core: "정비례 조건이 (2, 5)를 지나는 식을 하나로!",
  },
  {
    // [슬롯 133] 검산: y=9x에 x=2 → k=18 ✓ 기초 대입.
    id: "m1u3e133",
    lessonId: "m1u3l6",
    type: "num",
    prompt: "정비례 관계 " + withVars("y=9x") + "의 그래프가 점 " + withVars("(2, k)") + "를 지날 때, " + withVars("k") + "의 값을 구하세요.",
    answer: "18",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>그래프가 (2, <i class='mv'>k</i>)를 지난다는 것은 <i class='mv'>x</i>=2일 때의 <i class='mv'>y</i>값이 <i class='mv'>k</i>라는 뜻이에요. <i class='mv'>y</i>=9<i class='mv'>x</i>에 대입하면 <i class='mv'>k</i>=9×2=<b>18</b>이에요. 그래프 위의 점과 식의 대입은 같은 말이라는 것, 이것이 그래프 단원의 가장 기본 문법이에요.<span class='xh'>계산 함정 격파</span>9+2=11로 더하거나 9−2=7로 빼는 연산 착오가 가장 흔해요. 9<i class='mv'>x</i>는 9와 <i class='mv'>x</i>의 곱이라는 표기 약속을 확인해요. 또 (2, <i class='mv'>k</i>)에서 2가 <i class='mv'>y</i>좌표라고 착각해 2=9<i class='mv'>k</i>를 풀면 분수가 나오는데, 순서쌍의 앞자리는 언제나 <i class='mv'>x</i>예요. 이상한 분수가 나오면 자리를 바꿔 읽었는지 의심하는 것도 좋은 습관이에요.",
    core: "지나는 점 = 대입, k는 9×2로 끝나요.",
  },
];
