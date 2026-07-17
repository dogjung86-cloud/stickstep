// 중1 수학 III. 좌표평면과 그래프: 단원 종합 평가 풀, 레슨 5 정비례(m1u3e090~m1u3e111). 2026-07 개보수: 백 원 단위·잉크·보관함·냉각 장치 소재 교체.
// 13(mcq+multi)/7(num)/2(word), diff 9/9/4. 그림은 관계표 4개만 사용해 L6의 그래프 판별 범위와 겹치지 않는다.
import type { ExamItem } from "./types";
import { mExamTableFig } from "../../ui/examFiguresMath";

const L = "m1u3l5";
const shown = (value: number | string): string => String(value).replace("-", "−");

interface RelationTableSpec {
  title: string;
  xs: Array<number | string>;
  ys: Array<number | string>;
}

const relationTable = (spec: RelationTableSpec): string =>
  mExamTableFig(
    ["변수", ...spec.xs.map((_, index) => `값 ${index + 1}`)],
    [
      ["x", ...spec.xs.map(shown)],
      ["y", ...spec.ys.map(shown)],
    ],
    { title: spec.title, colw: [20, ...spec.xs.map(() => 80 / spec.xs.length)] },
  );

const TABLE_091: RelationTableSpec = { title: "두 변수 x, y의 관계", xs: [0, 2, 5, 7], ys: [0, 8, 20, 28] };
const TABLE_096 = {
  title: "세 관계의 값 비교",
  xs: [1, 2, 4],
  rows: [
    ["관계 A", "5", "10", "20"],
    ["관계 B", "6", "11", "21"],
    ["관계 C", "−2", "−4", "−8"],
  ],
};
const TABLE_103: RelationTableSpec = { title: "y가 x에 정비례하는 관계", xs: [-4, -2, 0, 3], ys: [20, 10, 0, "A"] };
const TABLE_109: RelationTableSpec = { title: "y가 x에 정비례하는 관계", xs: [-4, "p", 0, 2.5], ys: [16, 6, 0, "q"] };

const FIG_096 = mExamTableFig(["관계", "x=1", "x=2", "x=4"], TABLE_096.rows, {
  title: TABLE_096.title,
  colw: [28, 24, 24, 24],
});

export const POOL_M1U3L5: ExamItem[] = [
  {
    id: "m1u3e090",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>y</i>=3<i class='mv'>x</i>에서 <i class='mv'>x</i>가 2에서 7로 변할 때 <i class='mv'>y</i>는 얼마만큼 증가하나요?",
    options: ["15", "9", "5", "21", "12"],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>=2일 때 <i class='mv'>y</i>=3×2=6이고, <i class='mv'>x</i>=7일 때 <i class='mv'>y</i>=3×7=21이에요. 따라서 증가한 양은 21−6=<b>15</b>예요. 또는 <i class='mv'>x</i>가 7−2=5만큼 늘었고 한 단위마다 <i class='mv'>y</i>가 3씩 늘므로 3×5=15로 구할 수도 있어요.<span class='xh'>오답 하나씩 격파</span>'9'는 두 <i class='mv'>x</i>값을 더한 수, '5'는 <i class='mv'>x</i>의 증가량만 답한 값이에요. '21'은 마지막 <i class='mv'>y</i>값이고, '12'는 3×(7−3)처럼 시작값 2를 잘못 사용한 결과예요. 마지막 값과 증가량을 구분하고 두 풀이가 같은 15인지 확인해요.",
    core: "두 y값의 차 또는 비례상수×x의 증가량으로 증가한 양을 구해요.",
  },
  {
    id: "m1u3e091",
    lessonId: L,
    type: "mcq",
    prompt: "표에 나타난 <i class='mv'>x</i>, <i class='mv'>y</i>의 관계식은?",
    figure: relationTable(TABLE_091),
    options: ["y=2x", "y=4x", "y=x+4", "y=8x", "y=4x+2"].map((s) => s.replace(/([xy])/g, "<i class='mv'>$1</i>")),
    answer: 1,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>0이 아닌 각 열에서 <i class='mv'>y</i>÷<i class='mv'>x</i>를 계산해요. 8÷2=4, 20÷5=4, 28÷7=4로 모두 같으므로 비례상수는 4예요. 따라서 관계식은 <b><i class='mv'>y</i>=4<i class='mv'>x</i></b>이고, <i class='mv'>x</i>=0일 때 <i class='mv'>y</i>=0인 열도 이 식과 맞아요.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=2<i class='mv'>x</i>'와 '<i class='mv'>y</i>=8<i class='mv'>x</i>'은 한 열만 대입해도 표의 값과 달라요. '<i class='mv'>y</i>=<i class='mv'>x</i>+4'는 2를 넣으면 6이라 8이 되지 않고, '<i class='mv'>y</i>=4<i class='mv'>x</i>+2'는 0을 넣을 때 2가 되어 표의 원점 값과 어긋나요. 여러 열의 몫과 0일 때 값을 함께 확인해요.",
    core: "표에서는 y÷x가 일정한지 확인해 비례상수를 찾아요.",
  },
  {
    id: "m1u3e092",
    lessonId: L,
    type: "num",
    prompt: "리본 1 m의 가격이 <b>480원</b>으로 일정해요. 리본 <b>7 m</b>의 가격을 구하세요.",
    answer: "3360",
    numKind: "int",
    unitLabel: "원",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>리본의 길이를 <i class='mv'>x</i> m, 가격을 <i class='mv'>y</i>원이라고 하면 1 m마다 480원씩 늘어나므로 <i class='mv'>y</i>=480<i class='mv'>x</i>예요. <i class='mv'>x</i>=7을 넣으면 <i class='mv'>y</i>=480×7=<b>3360원</b>이에요.<span class='xh'>계산 함정 격파</span>480+7=487처럼 더하면 1 m의 가격에 길이를 섞은 셈이라 뜻이 없어요. 480×6=2880은 한 묶음을 빠뜨린 값이고, 3660은 480×7의 자리 올림을 잘못 처리한 값이에요. 검산하면 7 m는 1 m의 7배이므로 가격 3360원도 480원의 정확히 7배예요. 길이가 0이면 가격도 0원이 되는 설정이라 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i> 꼴의 정비례가 자연스러워요.",
    core: "일정한 단위당 가격×길이로 정비례하는 전체 가격을 구해요.",
  },
  {
    id: "m1u3e093",
    lessonId: L,
    type: "word",
    prompt: "<i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에서 일정한 수 <i class='mv'>a</i>를 무엇이라고 하나요?",
    answer: "비례상수",
    bank: ["비례상수", "정비례", "반비례", "관계식", "순서쌍", "좌표", "원점", "변수", "눈금"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에서 <i class='mv'>x</i>에 곱해지는 일정한 수 <i class='mv'>a</i>를 <b>비례상수</b>라고 해요. <i class='mv'>x</i>가 0이 아닐 때 <i class='mv'>a</i>=<i class='mv'>y</i>÷<i class='mv'>x</i>이므로, 표의 여러 값에서 이 몫이 같으면 같은 비례상수를 가진 정비례 관계예요.<span class='xh'>용어 함정 격파</span>'정비례'는 두 변수의 관계 전체를 부르는 말이고, '관계식'은 그 관계를 식으로 나타낸 것이어서 <i class='mv'>a</i> 하나의 이름이 아니에요. '변수'는 값이 바뀌는 <i class='mv'>x</i>, <i class='mv'>y</i>를 가리켜요. '반비례'는 곱이 일정한 다른 관계이고, '원점·좌표·순서쌍·눈금'은 좌표평면에서 쓰는 말이라 이 자리에 알맞지 않아요.",
    core: "y=ax에서 일정한 수 a는 비례상수예요.",
  },
  {
    id: "m1u3e094",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례하고 <i class='mv'>x</i>=0일 때, 반드시 알 수 있는 것은?",
    options: ["y=1이다", "y=a이다", "y=−1이다", "y=0이다", "y의 값을 알 수 없다"].map((s) => s.replace(/^y/, "<i class='mv'>y</i>").replace(/=a/, "=<i class='mv'>a</i>")),
    answer: 3,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례하면 어떤 일정한 수 <i class='mv'>a</i>에 대하여 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>로 나타낼 수 있어요. 여기에 <i class='mv'>x</i>=0을 넣으면 <i class='mv'>y</i>=<i class='mv'>a</i>×0=<b>0</b>이에요. <i class='mv'>a</i>가 양수든 음수든 이 결론은 바뀌지 않아요.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=1'과 '<i class='mv'>y</i>=−1'은 근거 없이 정한 값이에요. '<i class='mv'>y</i>=<i class='mv'>a</i>'는 <i class='mv'>x</i>=1일 때의 결과를 0일 때와 혼동한 것이고요. '<i class='mv'>y</i>의 값을 알 수 없다'도 식의 꼴을 놓친 판단이에요. 비례상수를 몰라도 0에 어떤 수를 곱하면 0이라는 사실만으로 정확히 결정할 수 있어요.",
    core: "정비례식 y=ax에서 x=0이면 항상 y=0이에요.",
  },
  {
    id: "m1u3e095",
    lessonId: L,
    type: "num",
    prompt: "<i class='mv'>y</i>=−6<i class='mv'>x</i>에서 <i class='mv'>x</i>가 −1에서 4로 변할 때, <i class='mv'>y</i>가 <b>감소한 양</b>을 구하세요.",
    answer: "30",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>=−1일 때 <i class='mv'>y</i>=−6×(−1)=6이고, <i class='mv'>x</i>=4일 때 <i class='mv'>y</i>=−6×4=−24예요. 6에서 −24로 변했으므로 감소한 양은 6−(−24)=<b>30</b>이에요. <span class='xh'>부호 함정 격파</span>−30은 변화량을 나중값−처음값으로 계산한 결과지만, 문제는 부호가 있는 변화량이 아니라 '감소한 양'을 물었으므로 양수 30을 써요. 24는 마지막 값의 크기만 본 것이고, 5는 <i class='mv'>x</i>의 증가량이에요. 음수인 비례상수에서는 <i class='mv'>x</i>가 커질수록 <i class='mv'>y</i>가 작아질 수 있으므로 두 끝값을 모두 계산해 비교해요.",
    core: "y는 6에서 −24로 변하므로 감소한 양은 30이에요.",
  },
  {
    id: "m1u3e096",
    lessonId: L,
    type: "multi",
    prompt: "표에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    figure: FIG_096,
    options: [
      "관계 A에서 y는 x에 정비례한다",
      "관계 C에서 y는 x에 정비례한다",
      "관계 B의 비례상수는 5이다",
      "관계 B에서는 y÷x가 일정하지 않다",
      "관계 C에서 x가 2배가 되면 y는 절반이 된다",
    ].map((s) => s.replace(/([xy])/g, "<i class='mv'>$1</i>")),
    answer: [0, 1, 3],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>관계 A는 5÷1=10÷2=20÷4=5이므로 <i class='mv'>y</i>=5<i class='mv'>x</i>예요. 관계 C도 −2÷1=−4÷2=−8÷4=−2로 일정하여 <i class='mv'>y</i>=−2<i class='mv'>x</i>예요. 따라서 A와 C는 모두 정비례해요. 관계 B는 6÷1=6, 11÷2=5.5, 21÷4=5.25로 몫이 달라서 정비례하지 않아요.<span class='xh'>함정 격파</span>관계 B에서 첫 차이만 보고 비례상수를 5라고 정하면 안 돼요. 실제로는 <i class='mv'>y</i>=5<i class='mv'>x</i>+1인 값들이라 0이 아닌 덧셈이 붙어 있어요. 관계 C에서 <i class='mv'>x</i>가 2배가 되면 <i class='mv'>y</i>도 −2에서 −4처럼 같은 2배가 되며 절반이 되지 않아요. 음수라는 이유만으로 정비례를 제외하지 마세요.",
    core: "각 관계에서 y÷x가 일정한지 따로 검사해요.",
  },
  {
    id: "m1u3e097",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>y</i>=5<i class='mv'>x</i>+2가 <i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례하는 관계가 아닌 까닭으로 가장 알맞은 것은?",
    options: [
      "x가 커질 때 y도 커지기 때문에",
      "x=0일 때 y=0이 아니기 때문에",
      "x와 y가 모두 변하기 때문에",
      "5가 양수이기 때문에",
      "x에 5를 곱하기 때문에",
    ].map((s) => s.replace(/([xy])/g, "<i class='mv'>$1</i>")),
    answer: 1,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례 관계는 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i> 꼴이어야 해요. 그런데 <i class='mv'>y</i>=5<i class='mv'>x</i>+2에서는 <i class='mv'>x</i>=0을 넣어도 <i class='mv'>y</i>=2가 되어 0이 아니에요. 또 <i class='mv'>x</i>=1, 2일 때 <i class='mv'>y</i>÷<i class='mv'>x</i>는 각각 7, 6으로 일정하지 않으므로 정비례가 아니에요.<span class='xh'>오답 하나씩 격파</span>'둘 다 커진다'는 단순한 증가만 말할 뿐 같은 배수를 보장하지 않아요. '<i class='mv'>x</i>와 <i class='mv'>y</i>가 모두 변한다'는 많은 관계에 공통인 성질이라 판별 근거가 아니고요. 비례상수 5가 양수인 것과 <i class='mv'>x</i>에 5를 곱하는 부분은 오히려 <i class='mv'>y</i>=5<i class='mv'>x</i>만 있었다면 정비례가 될 이유예요. 문제를 만드는 것은 끝의 +2예요.",
    core: "0이 아닌 덧셈이 붙으면 y=ax 꼴이 아니에요.",
  },
  {
    id: "m1u3e098",
    lessonId: L,
    type: "num",
    prompt: "<i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례하고 <i class='mv'>x</i>=−5일 때 <i class='mv'>y</i>=30이에요. 비례상수 <i class='mv'>a</i>를 구하세요.",
    answer: "-6",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정비례식 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에 주어진 한 쌍을 넣어요. 30=<i class='mv'>a</i>×(−5)이므로 <i class='mv'>a</i>=30÷(−5)=<b>−6</b>이에요. 관계식은 <i class='mv'>y</i>=−6<i class='mv'>x</i>가 돼요.<span class='xh'>부호 함정 격파</span>30÷5=6만 계산해 양수로 쓰면 <i class='mv'>x</i>가 음수인데 <i class='mv'>y</i>가 양수라는 조건을 만족시키지 못해요. 검산하면 −6×(−5)=30으로 음수끼리의 곱이 양수가 되어 정확해요. 비례상수는 주어진 <i class='mv'>y</i>를 <i class='mv'>x</i>로 나눈 값이므로 순서를 뒤집어 −5÷30을 하지 않도록 주의해요. 한 쌍만 있어도 정비례라는 조건이 있으면 <i class='mv'>a</i>를 결정할 수 있어요.",
    core: "a=y÷x이며 음수 나눗셈의 부호를 확인해요.",
  },
  {
    id: "m1u3e099",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례해요. <i class='mv'>x</i>=3일 때 <i class='mv'>y</i>=18이라면, <i class='mv'>x</i>=12일 때 <i class='mv'>y</i>는?",
    options: ["72", "54", "27", "6", "216"],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>가 3에서 12로 <b>4배</b>가 되었어요. 정비례에서는 <i class='mv'>y</i>도 같은 4배가 되므로 18×4=<b>72</b>예요. 식으로 확인하면 비례상수는 18÷3=6, 관계식은 <i class='mv'>y</i>=6<i class='mv'>x</i>이고 6×12=72로 같아요.<span class='xh'>오답 하나씩 격파</span>'54'는 <i class='mv'>x</i>의 증가량 9를 <i class='mv'>y</i>에 곱하는 등 배수를 잘못 잡은 값이에요. '27'은 두 값의 증가량이 같다고 보고 18+9를 한 결과이고, '6'은 비례상수에서 멈춘 값이에요. '216'은 18×12로 계산해 처음의 <i class='mv'>x</i>=3을 무시했어요. 배수로 풀든 식으로 풀든 처음 주어진 한 쌍을 함께 사용해야 해요.",
    core: "x가 4배이면 정비례하는 y도 4배예요.",
  },
  {
    id: "m1u3e100",
    lessonId: L,
    type: "num",
    prompt: "같은 공책 8권을 쌓았더니 높이가 3.2 cm였어요. 같은 공책 <b>35권</b>을 쌓을 때의 높이를 구하세요.",
    answer: "14",
    numKind: "int",
    unitLabel: "cm",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>공책 수를 <i class='mv'>x</i>권, 쌓은 높이를 <i class='mv'>y</i> cm라고 해요. 8권의 높이가 3.2 cm이므로 한 권의 두께는 3.2÷8=0.4 cm예요. 따라서 <i class='mv'>y</i>=0.4<i class='mv'>x</i>이고, 35권을 쌓으면 0.4×35=<b>14</b> cm예요.<span class='xh'>계산 함정 격파</span>3.2×35를 바로 하면 8권 묶음의 높이를 한 권의 두께로 착각하게 돼요. 반대로 35÷8만 하고 끝내면 몇 묶음인지에 가까운 값일 뿐 높이가 아니에요. 먼저 한 권의 두께를 구하고 전체 권수를 곱해야 해요. 검산하면 35권은 8권의 4.375배이고, 3.2×4.375=14라서 배수 관계도 정확히 맞아요.",
    core: "묶음 자료는 먼저 한 단위당 양을 구한 뒤 전체에 곱해요.",
  },
  {
    id: "m1u3e101",
    lessonId: L,
    type: "word",
    prompt: "<i class='mv'>x</i>가 2배, 3배가 될 때 <i class='mv'>y</i>도 각각 2배, 3배가 되는 관계를 무엇이라고 하나요?",
    answer: "정비례",
    bank: ["정비례", "반비례", "비례상수", "좌표", "사분면", "관계식", "변수", "순서쌍", "원점"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>가 몇 배가 될 때 <i class='mv'>y</i>도 같은 몇 배가 되는 관계를 <b>정비례</b>라고 해요. 식으로는 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>로 나타내며, <i class='mv'>x</i>가 0이 아닐 때 <i class='mv'>y</i>÷<i class='mv'>x</i>=<i class='mv'>a</i>가 일정해요.<span class='xh'>용어 함정 격파</span>'반비례'는 <i class='mv'>x</i>가 2배일 때 <i class='mv'>y</i>가 절반처럼 반대 배수로 변하는 관계예요. '비례상수'는 관계의 이름이 아니라 식에서 일정하게 곱해지는 수 <i class='mv'>a</i>를 말하고, '관계식'은 두 변수 사이를 식으로 적은 표현 전체예요. '좌표·사분면·순서쌍·원점'은 점의 위치를 다루는 말이고, '변수'는 값이 변하는 문자이므로 질문의 관계 이름이 아니에요.",
    core: "같은 배수로 함께 변하는 관계의 이름은 정비례예요.",
  },
  {
    id: "m1u3e102",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>y</i>=−4<i class='mv'>x</i>에 대한 설명으로 옳은 것은?",
    options: [
      "x=2일 때 y=8이다",
      "x가 3배가 되면 y는 절반이 된다",
      "비례상수는 −4이다",
      "x=0일 때 y=−4이다",
      "y÷x는 항상 4이다",
    ].map((s) => s.replace(/([xy])/g, "<i class='mv'>$1</i>")),
    answer: 2,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>y</i>=−4<i class='mv'>x</i>는 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>에서 <i class='mv'>a</i>=<b>−4</b>인 정비례식이에요. <i class='mv'>x</i>가 0이 아닐 때 <i class='mv'>y</i>÷<i class='mv'>x</i>는 언제나 −4이고, <i class='mv'>x</i>=0이면 <i class='mv'>y</i>=0이에요.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>x</i>=2일 때 <i class='mv'>y</i>=8'은 음수 부호를 빠뜨렸어요. 실제 값은 −8이에요. '<i class='mv'>x</i>가 3배면 <i class='mv'>y</i>는 절반'은 정비례의 같은 배수 변화를 반대 관계와 혼동한 말이에요. '<i class='mv'>x</i>=0일 때 <i class='mv'>y</i>=−4'는 비례상수와 함숫값을 섞었고, 몫이 4라는 설명도 음수 부호를 놓쳤어요. 음수인 비례상수도 정비례를 이룰 수 있어요.",
    core: "y=−4x의 비례상수는 −4이며 y÷x도 −4예요.",
  },
  {
    id: "m1u3e103",
    lessonId: L,
    type: "mcq",
    prompt: "표에서 <i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례할 때, 빈칸 A에 알맞은 수는?",
    figure: relationTable(TABLE_103),
    options: ["15", "−10", "−15", "5", "−5"],
    answer: 2,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>완성된 열 하나로 비례상수를 구해요. <i class='mv'>x</i>=−4, <i class='mv'>y</i>=20이므로 <i class='mv'>a</i>=20÷(−4)=−5예요. 따라서 <i class='mv'>y</i>=−5<i class='mv'>x</i>이고, <i class='mv'>x</i>=3일 때 A=−5×3=<b>−15</b>예요. 다른 열 −2와 10도 10÷(−2)=−5라서 확인돼요.<span class='xh'>오답 하나씩 격파</span>'15'는 비례상수의 음수 부호를 빠뜨린 값이에요. '−10'은 앞 열의 <i class='mv'>y</i>=10을 부호만 바꿔 옮겼고, '5'와 '−5'는 비례상수의 크기에서 계산을 멈춘 값이에요. 빈칸에는 비례상수가 아니라 <i class='mv'>x</i>=3에 대응하는 <i class='mv'>y</i>가 들어가야 해요. 0에 대응하는 값이 0인 것도 완성한 식과 맞아요.",
    core: "한 열에서 a를 구한 뒤 빈칸의 x를 곱해요.",
  },
  {
    id: "m1u3e104",
    lessonId: L,
    type: "num",
    prompt: "<i class='mv'>y</i>=4.5<i class='mv'>x</i>에서 <i class='mv'>y</i>=31.5일 때 <i class='mv'>x</i>의 값을 구하세요.",
    answer: "7",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>주어진 <i class='mv'>y</i>=31.5를 식에 넣으면 31.5=4.5<i class='mv'>x</i>예요. 양변을 4.5로 나누어 <i class='mv'>x</i>=31.5÷4.5=<b>7</b>을 얻어요. 검산하면 4.5×7=31.5로 처음 조건과 정확히 같아요.<span class='xh'>계산 함정 격파</span>31.5−4.5=27처럼 빼면 <i class='mv'>x</i>에 4.5가 곱해졌다는 식의 구조를 무시한 것이에요. 31.5÷45=0.7은 나누는 수의 소수점만 옮긴 결과라 값이 10배 작아졌고요. 소수 나눗셈이 어렵다면 31.5와 4.5를 각각 10배 하여 315÷45로 바꾸면 7을 쉽게 확인할 수 있어요. <i class='mv'>x</i>를 묻는 역산에서는 <i class='mv'>y</i>를 비례상수로 나눠요.",
    core: "x를 구할 때는 y를 비례상수로 나누고 대입해 검산해요.",
  },
  {
    id: "m1u3e105",
    lessonId: L,
    type: "multi",
    prompt: "다음 중 <i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례하는 식을 <b>모두</b> 고르세요.",
    options: [
      "y=0.5x",
      "y=6−x",
      "y=−2.5x",
      "y=7x+1",
      "y=x÷8",
    ].map((s) => s.replace(/([xy])/g, "<i class='mv'>$1</i>")),
    answer: [0, 2, 4],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정비례식은 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i> 꼴이에요. <i class='mv'>y</i>=0.5<i class='mv'>x</i>는 <i class='mv'>a</i>=0.5, <i class='mv'>y</i>=−2.5<i class='mv'>x</i>는 <i class='mv'>a</i>=−2.5예요. <i class='mv'>y</i>=<i class='mv'>x</i>÷8도 <i class='mv'>y</i>=0.125<i class='mv'>x</i>로 고쳐 쓸 수 있으므로 정비례해요. 세 식 모두 <i class='mv'>x</i>=0을 넣으면 <i class='mv'>y</i>=0이 돼요.<span class='xh'>함정 격파</span><i class='mv'>y</i>=6−<i class='mv'>x</i>는 <i class='mv'>x</i>=0일 때 <i class='mv'>y</i>=6이라 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i> 꼴이 아니에요. <i class='mv'>y</i>=7<i class='mv'>x</i>+1도 끝의 +1 때문에 <i class='mv'>y</i>÷<i class='mv'>x</i>가 일정하지 않아요. 소수나 음수, 나눗셈 표기에 겁먹지 말고 <i class='mv'>x</i>에 일정한 수 하나만 곱한 꼴인지 확인해요. 고른 뒤에는 0을 대입해 한 번 더 검산해요.",
    core: "소수·음수도 가능하며 y=ax 꼴이면 정비례예요.",
  },
  {
    id: "m1u3e106",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례하고 <i class='mv'>x</i>=−2일 때 <i class='mv'>y</i>=9예요. 옳은 것을 <b>보기</b>에서 모두 고른 것은?",
    bogi: [
      "비례상수는 −4.5이다.",
      "<i class='mv'>x</i>=4일 때 <i class='mv'>y</i>=−18이다.",
      "<i class='mv'>x</i>가 −2에서 −6으로 3배가 되면 <i class='mv'>y</i>도 9에서 27로 3배가 된다.",
    ],
    options: ["ㄱ", "ㄴ", "ㄷ", "ㄱ, ㄴ, ㄷ", "ㄱ, ㄷ"],
    answer: 3,
    shuffle: false,
    diff: 3,
    explain:
      "<span class='xh'>보기 하나씩 판정</span>ㄱ: 9=<i class='mv'>a</i>×(−2)이므로 <i class='mv'>a</i>=9÷(−2)=−4.5로 옳아요. ㄴ: 관계식 <i class='mv'>y</i>=−4.5<i class='mv'>x</i>에 <i class='mv'>x</i>=4를 넣으면 <i class='mv'>y</i>=−18이므로 옳아요. ㄷ: −6은 −2의 3배이고 정비례에서는 대응하는 값도 같은 3배이므로 9×3=27이 되어 옳아요. 따라서 세 문장이 모두 맞아요.<span class='xh'>오답 격파</span>음수에서 '3배'를 절댓값만 키우는 말로 오해해 부호를 바꾸면 안 돼요. (−2)×3=−6이므로 이 변화도 정확한 3배예요. 또 비례상수를 4.5로 양수 처리하면 <i class='mv'>x</i>=−2에서 <i class='mv'>y</i>가 −9가 되어 주어진 9와 어긋나요. 각 문장을 같은 관계식으로 차례로 검산하면 합답형도 흔들리지 않아요.",
    core: "한 쌍으로 식을 세우고 모든 보기를 같은 식으로 검산해요.",
  },
  {
    id: "m1u3e107",
    lessonId: L,
    type: "num",
    prompt: "<i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례하고 <i class='mv'>x</i>=6.4일 때 <i class='mv'>y</i>=−8이에요. <i class='mv'>x</i>=−3.2일 때 <i class='mv'>y</i>의 값을 구하세요.",
    answer: "4",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 비례상수는 <i class='mv'>a</i>=−8÷6.4=−1.25예요. 따라서 관계식은 <i class='mv'>y</i>=−1.25<i class='mv'>x</i>이고, <i class='mv'>x</i>=−3.2를 넣으면 <i class='mv'>y</i>=(−1.25)×(−3.2)=<b>4</b>예요. 배수로 보면 −3.2는 6.4의 −0.5배이므로 대응하는 값도 −8의 −0.5배인 4가 돼요.<span class='xh'>계산 함정 격파</span>−4는 음수끼리 곱한 부호를 놓친 값이고, −1.25는 중간에 구한 비례상수만 답한 값이에요. 2는 절댓값을 반으로만 줄이고 부호 변화를 반영하지 않았어요. 원래 점과 새 점에서 <i class='mv'>y</i>÷<i class='mv'>x</i>가 모두 −1.25인지 검산해요.",
    core: "비례상수 −1.25를 구한 뒤 x=−3.2를 대입하면 y=4예요.",
  },
  {
    id: "m1u3e108",
    lessonId: L,
    type: "mcq",
    prompt: "다음 상황 중 두 양이 정비례한다고 볼 수 있는 것은?",
    options: [
      "기본요금이 2000원이고 1 km마다 300원씩 더해지는 택시의 이동 거리와 요금",
      "하루에 읽은 쪽수와 책에 남은 쪽수",
      "정해진 씨앗을 여러 명이 똑같이 나눌 때 사람 수와 한 명이 받는 씨앗 수",
      "용량이 서로 다른 파일의 개수와 전체 내려받기 용량",
      "한 봉지에 씨앗이 6개씩 들어 있을 때 봉지 수와 전체 씨앗 수",
    ],
    answer: 4,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>씨앗 한 봉지에 언제나 6개가 들어 있으므로 봉지 수를 <i class='mv'>x</i>, 전체 씨앗 수를 <i class='mv'>y</i>라 하면 <i class='mv'>y</i>=6<i class='mv'>x</i>예요. 봉지 수가 2배, 3배가 되면 전체 씨앗 수도 같은 배수가 되고, 봉지가 0이면 씨앗도 0이므로 정비례해요.<span class='xh'>오답 하나씩 격파</span>기본요금이 있는 택시 요금은 <i class='mv'>y</i>=300<i class='mv'>x</i>+2000처럼 덧셈이 붙어 0 km에서도 2000원이에요. 읽은 쪽수와 남은 쪽수는 합이 일정한 관계이고, 정해진 씨앗을 나누면 사람 수가 늘수록 한 명의 몫은 줄어요. 파일마다 용량이 다르면 파일 한 개당 양이 일정하지 않아 개수만으로 전체 용량을 정할 수 없어요. 상황에서는 '한 단위마다 같은 양'인지부터 확인해요.",
    core: "한 단위당 양이 일정하고 처음 값이 0이면 정비례 상황이에요.",
  },
  {
    id: "m1u3e109",
    lessonId: L,
    type: "mcq",
    prompt: "표에서 <i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례할 때, <i class='mv'>p</i>+<i class='mv'>q</i>의 값은?",
    figure: relationTable(TABLE_109),
    options: ["8.5", "−8.5", "11.5", "−10", "−11.5"],
    answer: 4,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>첫 열에서 비례상수는 16÷(−4)=−4이므로 관계식은 <i class='mv'>y</i>=−4<i class='mv'>x</i>예요. <i class='mv'>y</i>=6인 열에서는 6=−4<i class='mv'>p</i>이므로 <i class='mv'>p</i>=−1.5예요. <i class='mv'>x</i>=2.5인 열에서는 <i class='mv'>q</i>=−4×2.5=−10이에요. 따라서 <i class='mv'>p</i>+<i class='mv'>q</i>=−1.5+(−10)=<b>−11.5</b>예요.<span class='xh'>오답 하나씩 격파</span>'11.5'는 두 음수의 합에서 부호를 버린 값이고, '−10'은 <i class='mv'>q</i>만 구하고 멈춘 값이에요. '8.5'와 '−8.5'는 −1.5와 −10을 더할 때 크기를 빼거나 부호를 잘못 정한 결과예요. 각 빈칸을 구한 뒤 원래 식에 대입하고 마지막 합까지 계산해야 해요.",
    core: "표 한 열로 식을 정한 뒤 두 빈칸을 각각 역산해 더해요.",
  },
  {
    id: "m1u3e110",
    lessonId: L,
    type: "num",
    prompt: "냉동실에 물병을 넣어 둔 시간과 물의 온도 변화량이 정비례해요. 4분 뒤 변화량이 −10℃일 때, <b>9분 뒤 변화량</b>을 구하세요.",
    answer: "-22.5",
    numKind: "dec",
    unitLabel: "℃",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>시간을 <i class='mv'>x</i>분, 온도 변화량을 <i class='mv'>y</i>℃라 하면 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>예요. 4분에 −10℃이므로 <i class='mv'>a</i>=−10÷4=−2.5예요. 따라서 9분 뒤에는 <i class='mv'>y</i>=−2.5×9=<b>−22.5</b>℃예요.<span class='xh'>계산 함정 격파</span>−12.5는 −10에 시간 차 5를 그대로 더하거나 뺀 값이라 분당 변화량을 반영하지 못해요. 22.5처럼 양수로 쓰면 온도가 내려간다는 변화량의 부호를 놓친 것이고요. 9÷4배의 시간에 변화량도 같은 배수가 되는지 검산하면 −10×2.25=−22.5로 일치해요. 답에는 온도 자체가 아니라 처음과 비교한 변화량을 써야 하며, 입력 칸에는 -22.5로 적어요.",
    core: "한 시점의 변화량으로 분당 값을 구해 다른 시점에 적용해요.",
  },
  {
    id: "m1u3e111",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>x</i>가 1, 2, 3일 때 <i class='mv'>y</i>가 각각 4, 7, 10이에요. <i class='mv'>y</i>가 <i class='mv'>x</i>에 정비례하는지에 대한 판단으로 옳은 것은?",
    options: [
      "정비례한다. y가 매번 3씩 커지기 때문이다",
      "정비례한다. x와 y가 모두 커지기 때문이다",
      "정비례하지 않는다. y÷x가 일정하지 않기 때문이다",
      "정비례하지 않는다. y가 x보다 항상 크기 때문이다",
      "정비례한다. 세 순서쌍이 모두 양수이기 때문이다",
    ].map((s) => s.replace(/([xy])/g, "<i class='mv'>$1</i>")),
    answer: 2,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>각 순서쌍에서 <i class='mv'>y</i>÷<i class='mv'>x</i>를 계산하면 4÷1=4, 7÷2=3.5, 10÷3으로 서로 같지 않아요. 따라서 <i class='mv'>y</i>는 <i class='mv'>x</i>에 정비례하지 않아요. 실제 관계는 <i class='mv'>x</i>가 1 늘 때 <i class='mv'>y</i>가 3 늘지만, 같은 배수로 변하는 관계는 아니에요.<span class='xh'>오답 하나씩 격파</span>'매번 3씩 커진다'와 '둘 다 커진다'는 증가만 확인한 판단이라 정비례의 배수 조건을 보장하지 못해요. '<i class='mv'>y</i>가 <i class='mv'>x</i>보다 크다'는 정비례 여부와 관계없는 비교이고, 두 수가 모두 양수라는 사실도 판별 기준이 아니에요. 세 값은 <i class='mv'>y</i>=3<i class='mv'>x</i>+1에 맞아 0이 아닌 덧셈이 숨어 있음을 확인할 수 있어요.",
    core: "같은 증가량이 아니라 y÷x의 일정함으로 정비례를 판별해요.",
  },
];
