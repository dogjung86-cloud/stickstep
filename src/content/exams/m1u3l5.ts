// 수학 중1 Ⅲ. 좌표평면과 그래프 v2 재출제 문항 풀 · L5 정비례: 2배는 2배를 부른다(책 118~122쪽) 슬롯 90~111(22문항).
// 생성 파일: 수정은 qa/m1u3v2-*.ts(스테이징 정본)에서 한 뒤 node qa/build-m1u3v2-lessons.mjs 재실행.
// 규격 v2(정본 qa/m1u3-v2-blueprint.md · §3-0 우선): mcq 11/multi 2/num 9·word 0 · diff 9/9/4 ·
// 그림 6 · mfmt 미사용(slash 분수·withVars·U+2212) · 무그림은 화이트리스트 사유 태그 · em대시 금지.
import type { ExamItem } from "./types";
import { miniGraphRow } from "../../ui/mathFigures";
import { mExamTableFig } from "../../ui/examFiguresMath";

const withVars = (text: string): string =>
  text.replace(/[xyabk]/g, (variable) => `<i class='mv'>${variable}</i>`);

export const POOL_M1U3L5: ExamItem[] = [
  {
    // [슬롯 90] 검산: y=x/6 = (1/6)x 꼴이라 정비례 ✓. y=4/x 반비례·y=6−x 뺄셈·y=0.5x+1
    //  상수항·xy=10 반비례 변형. 레슨 판별 세트(y=x/8·y=−4x·x+y=5·y=6/x·y=7−3x)와 식 전부 분리.
    //  (초판 오답 y=6/x·xy=6은 s099 오답 y=6/x와 레슨 내 같은 관계식 노출이라 4/x·10으로 교체 · full 게이트 WARN 반영.)
    id: "m1u3e090",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "다음 중 " + withVars("y") + "가 " + withVars("x") + "에 <b>정비례</b>하는 것은?",
    options: [withVars("y=x/6"), withVars("y=4/x"), withVars("y=6−x"), withVars("y=0.5x+1"), withVars("xy=10")],
    answer: 0,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>정비례는 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>(<i class='mv'>a</i>는 0이 아닌 수) 꼴이에요. <i class='mv'>y</i>=<i class='mv'>x</i>/6은 <i class='mv'>x</i>에 1/6을 곱한 것과 같아서 <i class='mv'>a</i>=1/6인 정비례가 맞아요. 나눗셈처럼 보여도 나누는 수가 일정하면 곱하기 꼴로 고칠 수 있죠.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=4/<i class='mv'>x</i>'는 분모에 <i class='mv'>x</i>가 있어 반비례이고, '<i class='mv'>xy</i>=10'도 곱이 일정한 반비례의 다른 표기예요. 분자에 있는 <i class='mv'>x</i>와 분모에 있는 <i class='mv'>x</i>를 구분하는 게 판별의 핵심이에요. '<i class='mv'>y</i>=6−<i class='mv'>x</i>'는 빼는 관계라 <i class='mv'>x</i>가 2배여도 <i class='mv'>y</i>가 2배가 되지 않고, '<i class='mv'>y</i>=0.5<i class='mv'>x</i>+1'은 +1이 붙어 배율 고리가 끊어져요.",
    core: "y=x/6은 (1/6)배, 당당한 정비례예요.",
  },
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
    // [슬롯 95] 검산: ㄱ 참(정의) · ㄴ 참(y/x=a 일정) · ㄷ 거짓(1씩이 아니라 a씩 커짐) ·
    //  ㄹ 거짓(x=0이면 y=0) · ㅁ 거짓(음수 a도 정비례). answer [0,1]. 레슨 진술 verbatim 회피.
    id: "m1u3e095",
    lessonId: "m1u3l5",
    type: "multi",
    prompt: "정비례 관계 " + withVars("y=ax") + "(" + withVars("a") + "는 0이 아닌 수)에 대한 설명으로 옳은 것을 <b>모두</b> 고르세요.",
    options: [
      "x의 값이 2배가 되면 y의 값도 2배가 돼요",
      "y를 x로 나눈 값은 항상 a로 일정해요",
      "x의 값이 1씩 커지면 y의 값도 항상 1씩 커져요",
      "x=0일 때 y의 값은 1이에요",
      "a가 음수이면 정비례 관계가 아니에요",
    ],
    answer: [0, 1],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정비례의 정의가 바로 '<i class='mv'>x</i>가 2배, 3배가 되면 <i class='mv'>y</i>도 같은 배율로 커진다'예요. 그리고 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>의 양변을 <i class='mv'>x</i>로 나누면 <i class='mv'>y</i>/<i class='mv'>x</i>=<i class='mv'>a</i>이므로 나눈 값이 항상 일정한 것도 맞아요. 이 두 가지가 정비례를 판별하는 두 얼굴이죠.<span class='xh'>틀린 설명 격파</span>'<i class='mv'>x</i>가 1씩 커지면 <i class='mv'>y</i>도 1씩'은 <i class='mv'>a</i>=1일 때만 맞는 말이에요. 일반적으로는 <i class='mv'>a</i>씩 커지죠. '<i class='mv'>x</i>=0일 때 <i class='mv'>y</i>=1'은 틀렸어요. 0에 무엇을 곱해도 0이라 정비례 그래프가 항상 원점을 지나는 이유가 여기 있어요. 마지막으로 <i class='mv'>a</i>가 음수여도 '−2배'라는 일정한 배율이 유지되므로 어엿한 정비례예요.",
    core: "정비례의 두 얼굴: 같은 배율, 일정한 y/x.",
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
    // [슬롯 99] 검산: 표 (2,3)(4,6)(6,9) → y/x = 3/2 일정 → y=(3/2)x ✓. 함정 y=x+1은
    //  첫 열 (2,3)만 만족하고 (4,6)에서 4+1=5≠6 탈락(§3-0 · 전 열 정합은 정답뿐).
    id: "m1u3e099",
    lessonId: "m1u3l5",
    type: "mcq",
    prompt: "표는 " + withVars("y") + "가 " + withVars("x") + "에 정비례하는 관계를 나타낸 거예요. " + withVars("x") + "와 " + withVars("y") + " 사이의 관계식은?",
    figure: mExamTableFig(["x", "2", "4", "6"], [["y", "3", "6", "9"]], { aria: "x와 y의 대응 관계를 나타낸 표" }),
    options: [withVars("y=(3/2)x"), withVars("y=(2/3)x"), withVars("y=3x"), withVars("y=x+1"), withVars("y=6/x")],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>정비례라 했으니 <i class='mv'>y</i>=<i class='mv'>a</i><i class='mv'>x</i>로 놓고 표의 한 쌍을 대입해요. <i class='mv'>x</i>=2일 때 <i class='mv'>y</i>=3이므로 3=2<i class='mv'>a</i>, <i class='mv'>a</i>=3/2예요. 관계식은 <b><i class='mv'>y</i>=(3/2)<i class='mv'>x</i></b>이고, 나머지 열로 검산하면 (3/2)×4=6, (3/2)×6=9로 전부 맞아요.<span class='xh'>오답 하나씩 격파</span>'<i class='mv'>y</i>=<i class='mv'>x</i>+1'은 첫 열 (2, 3)만 보면 그럴듯하지만 (4, 6)에서 4+1=5가 되어 어긋나요. 표 문제는 한 열이 아니라 모든 열로 확인해야 해요. '<i class='mv'>y</i>=(2/3)<i class='mv'>x</i>'는 분자·분모를 뒤집은 값이고, '<i class='mv'>y</i>=3<i class='mv'>x</i>'는 첫 열의 <i class='mv'>y</i>값 3을 그대로 배율로 착각한 거예요. '<i class='mv'>y</i>=6/<i class='mv'>x</i>'는 곱이 6·24·54로 제멋대로라 반비례도 아니죠.",
    core: "a는 한 쌍으로 구하고 모든 열로 검산해요.",
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
    // [슬롯 108] 검산: 10분에 500원 → 90분은 10분이 9번 → 500×9=4500원 ✓. 단위 환산
    //  (1시간 30분 = 90분) 함정. 레슨 소재(빙하·환율·축척)와 분리된 주차 요금 신작.
    id: "m1u3e108",
    lessonId: "m1u3l5",
    type: "num",
    prompt: "어느 주차장은 주차 시간 <b>10분마다 500원씩</b> 요금이 일정하게 늘어나요. <b>1시간 30분</b> 동안 주차했을 때 요금은 몇 원인지 구하세요.",
    answer: "4500",
    numKind: "int",
    unitLabel: "원",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>먼저 시간 단위를 통일해요. 1시간 30분은 60+30=90분이에요. 10분마다 500원씩이므로 90분 동안에는 10분짜리 묶음이 90÷10=9번 들어가고, 요금은 500×9=<b>4500</b>원이에요. 주차 시간을 <i class='mv'>x</i>분, 요금을 <i class='mv'>y</i>원이라 하면 <i class='mv'>y</i>=50<i class='mv'>x</i>인 정비례 관계로도 확인할 수 있어요. 50×90=4500으로 같은 답이 나오죠.<span class='xh'>계산 함정 격파</span>1시간 30분을 130분으로 바꾸면 6500원이라는 엉뚱한 답이 나와요. 시간의 단위 환산은 100이 아니라 60이 기준이에요. 또 '10분마다'를 '1분마다'로 잘못 읽으면 요금이 45000원으로 열 배가 되니, 기준 단위가 몇 분인지 문제에서 다시 확인하는 습관을 들여요.",
    core: "단위부터 통일하면 정비례 계산은 곱셈 한 번이에요.",
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
];
