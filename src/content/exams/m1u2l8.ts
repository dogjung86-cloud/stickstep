// 중1 수학 II 문자와 식, 레슨 8 이항과 일차방정식 풀이 단원 종합 평가 풀(23문항).
// 교과서에서는 풀이 순서와 함정 구조만 참고하고 수치·문구·소재 결합은 새로 설계했다.
// 유형 14(mcq+multi)/9(num)/0(word), diff 1/2/3 = 9/7/7 (2026-07 개보수: 두 방정식 같은 해·
// 소수/분수 혼합·분수 방정식·해의 조건 매개변수 신작 + 저울 그림, diff는 내용 기준 재캘리브레이션).
// 2026-07-25 소수리: word 3문항(e175·e176·e177)을 num·mcq·num으로 전환(양변 이항 풀이·일차방정식 판별·
// 분수 방정식), e164의 풀이 4줄 목록을 과정 상자 그림으로 전환(보기·정답 불변), diff 슬롯 유지.
import type { ExamItem } from "./types";
import { mfmt } from "../../ui/mathKit";
import { mExamBalanceFig, mExamEqStepsFig } from "../../ui/examFiguresMath";

const L = "m1u2l8";

export const POOL_M1U2L8: ExamItem[] = [
  {
    id: "m1u2e155",
    lessonId: L,
    type: "mcq",
    prompt: "그림의 양팔저울이 나타내는 등식 3<i class='mv'>x</i>+8=29에서 상수항 8을 바르게 이항한 식은?",
    figure: mExamBalanceFig({ leftBoxes: 3, rightBoxes: 0, leftWeight: "8", rightWeight: "29", boxLabel: "x" }),
    options: ["3<i class='mv'>x</i>=29+8", "3<i class='mv'>x</i>+8−8=29", "3<i class='mv'>x</i>=29−8", "<i class='mv'>x</i>=29−8", "3<i class='mv'>x</i>−8=29"],
    answer: 2,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>좌변의 +8을 우변으로 이항하면 부호가 −8로 바뀌어요. 따라서 <b>3<i class='mv'>x</i>=29−8</b>이고, 정리하면 3<i class='mv'>x</i>=21이에요.<span class='xh'>오답 하나씩 격파</span>29+8은 이항하면서 부호를 바꾸지 않은 오류예요. 3<i class='mv'>x</i>+8−8=29는 왼쪽만 조작해 등식의 성질을 완전하게 적지 않았고요. <i class='mv'>x</i>=29−8은 계수 3까지 근거 없이 없앴어요. 3<i class='mv'>x</i>−8=29는 8을 다른 변으로 옮기지 않고 같은 변에서 부호만 바꾼 식이에요. 건넌 항만 부호가 바뀐다는 점을 확인하고 3×7+8=29로 검산해요.",
    core: "+8을 우변으로 이항하면 −8이 되어 3x=29−8!",
  },
  {
    id: "m1u2e156",
    lessonId: L,
    type: "mcq",
    prompt: "방정식 7<i class='mv'>x</i>=2<i class='mv'>x</i>+25에서 <i class='mv'>x</i>항을 왼쪽에 모아 정리한 식은?",
    options: ["9<i class='mv'>x</i>=25", "5<i class='mv'>x</i>=−25", "2<i class='mv'>x</i>−7<i class='mv'>x</i>=25", "7<i class='mv'>x</i>−2=25", "5<i class='mv'>x</i>=25"],
    answer: 4,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>우변의 +2<i class='mv'>x</i>를 좌변으로 이항하면 −2<i class='mv'>x</i>가 돼요. 7<i class='mv'>x</i>−2<i class='mv'>x</i>=25를 정리하면 <b>5<i class='mv'>x</i>=25</b>예요.<span class='xh'>오답 하나씩 격파</span>9<i class='mv'>x</i>=25는 +2<i class='mv'>x</i>의 부호를 그대로 둔 채 합친 결과예요. 5<i class='mv'>x</i>=−25는 이동하지 않은 상수 25의 부호까지 바꿨어요. 2<i class='mv'>x</i>−7<i class='mv'>x</i>=25는 <i class='mv'>x</i>항을 왼쪽으로 모은 방향과 순서를 뒤집어 −5<i class='mv'>x</i>=25가 되고요. 7<i class='mv'>x</i>−2=25는 2<i class='mv'>x</i>에서 문자를 잃어버렸어요. 항은 부호만 바뀔 뿐 문자와 계수는 함께 이동해요. 이어서 5로 나누면 해는 5예요.",
    core: "+2x를 좌변으로 이항하면 7x−2x=25!",
  },
  {
    id: "m1u2e157",
    lessonId: L,
    type: "mcq",
    prompt: "일차방정식 4<i class='mv'>x</i>−9=19의 해는?",
    options: ["4", "7", "−7", "10", "28"],
    answer: 1,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>−9를 우변으로 이항하면 4<i class='mv'>x</i>=19+9=28이에요. 양변을 4로 나누면 <b><i class='mv'>x</i>=7</b>이에요. 검산하면 4×7−9=19예요.<span class='xh'>오답 하나씩 격파</span>4는 계수를 해로 착각한 값이에요. −7은 19+9의 부호를 잘못 처리했거나 마지막 나눗셈에서 부호를 붙인 값이고요. 10은 19−9를 계산한 뒤 4로 나누지 않은 오류에서 나올 수 있어요. 28은 이항 뒤 얻은 4<i class='mv'>x</i>의 값이지 <i class='mv'>x</i> 자체가 아니에요. 이항으로 <i class='mv'>x</i>항과 상수항을 나눈 뒤 마지막에 계수로 나누는 단계를 빠뜨리지 않아요.",
    core: "4x=28까지 정리한 뒤 4로 나누면 x=7!",
  },
  {
    id: "m1u2e158",
    lessonId: L,
    type: "mcq",
    prompt: "일차방정식 6<i class='mv'>x</i>+5=−7의 해는?",
    options: ["2", "−12", "−1", "−2", "12"],
    answer: 3,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>+5를 우변으로 이항하면 6<i class='mv'>x</i>=−7−5=−12예요. 양변을 6으로 나누면 <b><i class='mv'>x</i>=−2</b>예요. 원식에 넣으면 −12+5=−7이 돼요.<span class='xh'>오답 하나씩 격파</span>2는 −12÷6의 음수 부호를 빠뜨린 값이에요. −12는 6<i class='mv'>x</i>의 값에서 멈춰 계수로 나누지 않았고요. −1은 상수항 5 대신 계수 6을 우변 −7에 더해 −7+6으로 계산한 값이에요. 12는 음수 두 개를 임의로 양수로 바꾼 값이에요. 음수 상수가 있는 식에서는 이항 뒤 계산과 마지막 나눗셈의 부호를 각각 따로 확인해요.",
    core: "6x=−12이므로 x=−2, 원식 대입으로 검산해요!",
  },
  {
    id: "m1u2e159",
    lessonId: L,
    type: "mcq",
    prompt: "방정식 " + mfmt("2x+7=x+9") + "의 해가 <i class='mv'>x</i>에 대한 방정식 <i class='mv'>a</i><i class='mv'>x</i>−3=<i class='mv'>x</i>+7의 해와 같을 때, 수 <i class='mv'>a</i>의 값은?",
    options: ["6", "5", "3", "−6", "9"],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>두 단계로 풀어요.<br>① " + mfmt("2x+7=x+9") + "를 풀면 <i class='mv'>x</i>=2<br>② 이 해를 둘째 방정식에 대입해 2<i class='mv'>a</i>−3=2+7=9, 2<i class='mv'>a</i>=12이므로 <b><i class='mv'>a</i>=6</b><br>검산: 6×2−3=9이고 2+7=9로 양변이 같아요.<span class='xh'>오답 하나씩 격파</span>'5'는 대입할 때 우변의 <i class='mv'>x</i>를 빠뜨려 2<i class='mv'>a</i>−3=7로 계산한 값이에요. '3'은 −3을 이항하며 부호를 바꾸지 않아 2<i class='mv'>a</i>=9−3으로 만든 값이고, '9'는 우변 값에서 멈춘 중간값이에요. '−6'은 마지막 나눗셈의 부호를 잘못 붙였어요. '해가 같다'는 조건은 첫 방정식의 해를 구해 둘째 식의 <i class='mv'>x</i> 자리에 넣으라는 신호예요.",
    core: "해 x=2를 먼저 구해 둘째 식에 대입, a=6!",
  },
  {
    id: "m1u2e160",
    lessonId: L,
    type: "mcq",
    prompt: "일차방정식 −3(<i class='mv'>x</i>+4)=2<i class='mv'>x</i>−7의 해는?",
    options: ["−5", "5", "1", "−7", "−1"],
    answer: 4,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>괄호를 풀면 −3<i class='mv'>x</i>−12=2<i class='mv'>x</i>−7이에요. <i class='mv'>x</i>항을 왼쪽, 상수를 오른쪽으로 모으면 −5<i class='mv'>x</i>=5이고, 양변을 −5로 나누어 <b><i class='mv'>x</i>=−1</b>이에요.<span class='xh'>오답 하나씩 격파</span>−5는 이항 뒤 계수만 보고 답한 값이에요. 5는 마지막에 음수로 나누는 부호를 놓쳤고요. 1도 −5로 나눈 결과의 부호를 잃은 값이에요. −7은 우변 상수를 그대로 답했고, 괄호 전개에서 −3×4를 +12로 계산하면 다른 값이 나와요. 음수를 분배할 때 문자항과 상수항 모두의 부호를 확인한 뒤 원식에 대입해 검산해요.",
    core: "−3x−12=2x−7을 정리하면 −5x=5, x=−1!",
  },
  {
    id: "m1u2e161",
    lessonId: L,
    type: "mcq",
    prompt: "소수와 분수가 섞인 방정식 0.3(<i class='mv'>x</i>+2)=" + mfmt("{x-1/5}") + "의 해는?",
    options: ["8", "−8", "−7", "4", "−2"],
    answer: 1,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>소수 0.3과 분모 5를 한 번에 없애도록 양변에 10을 곱해요.<br>① 왼쪽: 3(<i class='mv'>x</i>+2)=3<i class='mv'>x</i>+6<br>② 오른쪽: 10÷5=2배라서 2(<i class='mv'>x</i>−1)=2<i class='mv'>x</i>−2<br>③ 3<i class='mv'>x</i>+6=2<i class='mv'>x</i>−2에서 <b><i class='mv'>x</i>=−8</b><br>검산: 0.3×(−6)=−1.8, (−9)÷5=−1.8로 같아요.<span class='xh'>오답 하나씩 격파</span>'8'을 넣으면 왼쪽 3, 오른쪽 1.4로 다르고, '−7'은 왼쪽 −1.5, 오른쪽 −1.6으로 미세하게 어긋나요(오른쪽에 2를 분배하지 않으면 이 값이 나와요). '4'와 '−2'도 대입하면 양변이 달라요. 10을 곱하면 분수 쪽은 10÷5=2가 분자 전체에 곱해진다는 점, 그리고 괄호 분배를 잊지 않는 게 핵심이에요.",
    core: "×10이면 분수 쪽은 2(x−1), 해는 −8!",
  },
  {
    id: "m1u2e162",
    lessonId: L,
    type: "multi",
    prompt: "<i class='mv'>x</i>=3을 해로 갖는 방정식을 <b>모두 고르세요.</b>",
    options: ["2<i class='mv'>x</i>+5=11", "4(<i class='mv'>x</i>−1)=8", "0.5<i class='mv'>x</i>+1=2.5", "<i class='mv'>x</i>÷3+4=6", "7−2<i class='mv'>x</i>=0"],
    answer: [0, 1, 2],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>=3을 각각 대입하면 2×3+5=11, 4(3−1)=8, 0.5×3+1=2.5가 되어 양변이 같아요. 따라서 세 방정식은 모두 3을 해로 가져요.<span class='xh'>오답 하나씩 격파</span><i class='mv'>x</i>÷3+4=6에 3을 넣으면 왼쪽은 1+4=5라서 오른쪽 6과 달라요. 7−2<i class='mv'>x</i>=0에 넣으면 왼쪽은 1, 오른쪽은 0이에요. 식의 모양만 보고 해를 판단하지 말고 주어진 수를 원래 방정식의 모든 <i class='mv'>x</i> 자리에 넣어야 해요. 대입 뒤 좌변과 우변을 따로 계산해 같은 경우만 고르면 부호와 괄호 실수도 함께 잡을 수 있어요.",
    core: "주어진 해를 원식에 대입해 좌변과 우변을 비교해요!",
  },
  {
    id: "m1u2e163",
    lessonId: L,
    type: "mcq",
    prompt: "분모가 있는 방정식 <i class='mv'>x</i>÷3−2=(<i class='mv'>x</i>+6)÷6의 해는?",
    options: ["6", "12", "−18", "18", "24"],
    answer: 3,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>분모 3과 6의 최소공배수 6을 양변의 모든 항에 곱하면 2<i class='mv'>x</i>−12=<i class='mv'>x</i>+6이에요. 이항하면 <i class='mv'>x</i>=18이에요.<span class='xh'>오답 하나씩 격파</span>6은 곱해야 할 최소공배수를 해로 착각한 값이에요. 12는 −2에만 6을 곱한 중간 상수이고요. −18은 상수항을 이항할 때 부호를 잘못 바꾼 값이에요. 24는 오른쪽 괄호의 +6을 분모와 약분한 것처럼 잘못 처리했을 수 있어요. 6을 곱할 때 왼쪽의 <i class='mv'>x</i>÷3과 −2, 오른쪽 전체에 빠짐없이 분배한 뒤 원식에 18을 넣어 양변이 4로 같은지 검산해요.",
    core: "양변에 6을 곱해 2x−12=x+6, 해는 18!",
  },
  // [e164] 2026-07-25 소수리 그림 부착(내용 유지) · 문두의 <br> 4줄 나열을 mExamEqStepsFig 과정 상자로
  // 전환(그림의 첫째~넷째 줄 = 보기 라벨), 보기·정답(둘째 줄)·해설 불변 · 검산: 첫째 줄 전개 6x−3=4x+9
  // 정확, 둘째 줄 −3 이항이 9−3으로 부호 미반전(최초 오류) ✓ 바른 풀이는 9+3 → 2x=12 → x=6이고
  // 6x−3=4x+9에 x=6 대입 시 33=33 ✓ · 정오 판정을 그림이 색·표시로 강조하지 않음.
  {
    id: "m1u2e164",
    lessonId: L,
    type: "mcq",
    prompt: "다음은 방정식 3(2<i class='mv'>x</i>−1)=4<i class='mv'>x</i>+9를 푸는 과정을 차례로 나타낸 것이에요. 처음으로 잘못된 줄은?",
    figure: mExamEqStepsFig({ eqs: ["6x−3=4x+9", "6x−4x=9−3", "2x=6", "x=3"], notes: [] }),
    options: ["첫째 줄", "둘째 줄", "셋째 줄", "넷째 줄", "잘못된 줄이 없다"],
    answer: 1,
    shuffle: false,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>첫째 줄의 분배는 맞아요. 둘째 줄에서 좌변의 −3을 우변으로 이항하면 +3이 되어야 하므로 6<i class='mv'>x</i>−4<i class='mv'>x</i>=9+3이 맞아요. 따라서 <b>둘째 줄</b>이 처음 틀렸어요.<span class='xh'>오답 하나씩 격파</span>첫째 줄은 3×2<i class='mv'>x</i>=6<i class='mv'>x</i>, 3×(−1)=−3으로 정확해요. 셋째·넷째 줄은 이미 잘못된 둘째 줄을 계산한 결과라 숫자 계산만 보면 이어지지만, 최초 오류는 아니에요. '잘못된 줄이 없다'고 하면 이항 때 부호 반전을 놓친 거예요. 풀이 오류는 각 줄이 바로 윗줄에서 올바르게 나왔는지 순서대로 확인해야 원인을 정확히 찾을 수 있어요.",
    core: "−3을 이항하면 +3, 첫 오류는 둘째 줄!",
  },
  {
    id: "m1u2e165",
    lessonId: L,
    type: "multi",
    prompt: "소수나 분모가 있는 방정식의 양변에 수를 곱해 바르게 고친 것을 <b>모두 고르세요.</b>",
    options: ["0.06<i class='mv'>x</i>−0.3=0.9에 100을 곱하면 6<i class='mv'>x</i>−30=90", "(<i class='mv'>x</i>−2)÷4=(<i class='mv'>x</i>+1)÷6에 12를 곱하면 3(<i class='mv'>x</i>−2)=2(<i class='mv'>x</i>+1)", "0.5<i class='mv'>x</i>+2=4에 10을 곱하면 5<i class='mv'>x</i>+2=40", "<i class='mv'>x</i>÷8+1÷4=3에 8을 곱하면 <i class='mv'>x</i>+2=24", "(2<i class='mv'>x</i>+1)÷3=5에 3을 곱하면 2<i class='mv'>x</i>+1=5"],
    answer: [0, 1, 3],
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>100을 모든 항에 곱하면 6<i class='mv'>x</i>−30=90이에요. 분모 4와 6의 최소공배수 12를 곱한 식, 분모 8과 4의 최소공배수 8을 곱한 식도 정확해요.<span class='xh'>오답 하나씩 격파</span>0.5<i class='mv'>x</i>+2=4에 10을 곱하면 상수 2도 20이 되어 5<i class='mv'>x</i>+20=40이어야 해요. (2<i class='mv'>x</i>+1)÷3=5에 3을 곱하면 오른쪽도 15가 되어야 하고요. 소수점이나 분모를 없애는 수를 정한 뒤 양변의 모든 항에 빠짐없이 곱했는지 항마다 표시하면 일부 항만 곱하는 실수를 막을 수 있어요.",
    core: "정수화할 수는 양변의 모든 항에 빠짐없이 곱해요!",
  },
  {
    id: "m1u2e166",
    lessonId: L,
    type: "mcq",
    prompt: "<i class='mv'>x</i>에 대한 방정식 2(<i class='mv'>x</i>+<i class='mv'>k</i>)=18의 해가 <i class='mv'>x</i>=4일 때, <i class='mv'>k</i>의 값은?",
    options: ["−5", "1", "5", "7", "13"],
    answer: 2,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>해 <i class='mv'>x</i>=4를 대입하면 2(4+<i class='mv'>k</i>)=18이에요. 양변을 2로 나누어 4+<i class='mv'>k</i>=9, 따라서 <b><i class='mv'>k</i>=5</b>예요.<span class='xh'>오답 하나씩 격파</span>−5는 4를 이항하면서 9−4의 부호를 반대로 붙인 값이에요. 1은 4와 5의 차만 본 값이고, 7은 18에서 4를 뺀 뒤 2로 나누어 괄호 전체의 구조를 무시한 값이에요. 13은 9에 4를 더해 이항 부호를 바꾸지 않았고요. 주어진 해는 먼저 문자 자리에 넣고, 괄호 바깥의 2를 양변에서 처리해야 해요. 검산하면 2(4+5)=18로 원래 방정식이 참이에요.",
    core: "x=4를 대입해 2(4+k)=18, 따라서 k=5!",
  },
  {
    id: "m1u2e167",
    lessonId: L,
    type: "multi",
    prompt: "방정식 5−2(<i class='mv'>x</i>−3)=3<i class='mv'>x</i>+1의 풀이에 대한 설명으로 옳은 것을 <b>모두 고르세요.</b>",
    options: ["괄호를 풀면 11−2<i class='mv'>x</i>=3<i class='mv'>x</i>+1이다", "이항하면 −2<i class='mv'>x</i>−3<i class='mv'>x</i>=1+11이다", "정리하면 −5<i class='mv'>x</i>=−10이다", "해는 <i class='mv'>x</i>=−2이다", "<i class='mv'>x</i>=2를 원식에 넣으면 양변이 모두 7이다"],
    answer: [0, 2, 4],
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>−2(<i class='mv'>x</i>−3)=−2<i class='mv'>x</i>+6이므로 왼쪽은 11−2<i class='mv'>x</i>예요. 이항하면 −2<i class='mv'>x</i>−3<i class='mv'>x</i>=1−11, 곧 −5<i class='mv'>x</i>=−10이라 <i class='mv'>x</i>=2예요. 대입하면 양변이 7이에요.<span class='xh'>오답 하나씩 격파</span>상수 11을 우변으로 이항하면 −11이므로 1+11이 아니에요. 해 −2는 마지막에 같은 부호의 나눗셈 결과를 음수로 잘못 판단한 값이에요. 보기의 중간식은 바로 앞 단계에서 나왔는지 순서대로 살펴요. 음수 분배, 상수항 이항, 음수끼리 나누기의 세 부호를 각각 따로 확인하고 마지막에 원식 검산으로 마무리해요.",
    core: "전개 후 −5x=−10, 해 2를 대입하면 양변이 7!",
  },
  {
    id: "m1u2e168",
    lessonId: L,
    type: "num",
    prompt: "일차방정식 3(<i class='mv'>x</i>−2)=2<i class='mv'>x</i>+9를 풀어 <i class='mv'>x</i>의 값을 구하세요.",
    answer: "15",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>괄호를 풀면 3<i class='mv'>x</i>−6=2<i class='mv'>x</i>+9예요. <i class='mv'>x</i>항은 왼쪽, 상수항은 오른쪽으로 모으면 3<i class='mv'>x</i>−2<i class='mv'>x</i>=9+6이므로 <b><i class='mv'>x</i>=15</b>예요.<span class='xh'>오답 경로 격파</span>3은 괄호 밖 계수를 해로 고른 값이고, 6은 전개 뒤 상수의 크기만 답했어요. 9는 우변 상수에서 멈춘 값이에요. 1은 3<i class='mv'>x</i>−2<i class='mv'>x</i>의 계수만 답했고, −15는 이항 뒤 얻은 양수 15에 잘못 음수 부호를 붙인 값이에요. 15를 원식에 넣으면 왼쪽 3×13=39, 오른쪽 30+9=39로 같아요. 전개부터 다시 따라가면 이항 부호도 확인돼요.",
    core: "전개해 3x−6=2x+9, 이항하면 x=15!",
  },
  {
    id: "m1u2e169",
    lessonId: L,
    type: "num",
    prompt: "일차방정식 9−3<i class='mv'>x</i>=30을 풀어 <i class='mv'>x</i>의 값을 구하세요.",
    answer: "-7",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>상수 9를 우변으로 이항하면 −3<i class='mv'>x</i>=30−9=21이에요. 양변을 −3으로 나누면 <b><i class='mv'>x</i>=−7</b>이에요.<br>검산: 9−3×(−7)=9+21=30이에요.<span class='xh'>오답 경로 격파</span>7은 21÷(−3)의 음수 부호를 놓친 값이에요. −13은 30+9를 −3으로 나누는 등 이항 부호를 바꾼 결과일 수 있고요. 21은 −3<i class='mv'>x</i>의 값에서 멈춘 중간값이에요. −3이나 9는 식의 계수와 상수항일 뿐 해가 아니에요. 음수 계수로 나누기 전 결과의 부호까지 써 두면 실수를 줄일 수 있어요.",
    core: "−3x=21이므로 x=−7, 대입하면 30!",
  },
  {
    id: "m1u2e170",
    lessonId: L,
    type: "num",
    prompt: "일차방정식 4(<i class='mv'>x</i>+3)=44를 풀어 <i class='mv'>x</i>의 값을 구하세요.",
    answer: "8",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>양변을 먼저 4로 나누면 <i class='mv'>x</i>+3=11이에요. 3을 우변으로 이항하면 <b><i class='mv'>x</i>=8</b>이에요. 괄호를 먼저 풀어 4<i class='mv'>x</i>+12=44로 계산해도 같은 답이 나와요.<span class='xh'>오답 경로 격파</span>11은 양변을 4로 나눈 뒤 +3을 처리하지 않은 중간값이에요. 14는 11에 3을 더해 이항 부호를 바꾸지 않은 값이고요. 10은 <i class='mv'>x</i>+3=11에서 3 대신 1만 빼어 계산한 값이에요. 32는 44−12까지만 계산한 4<i class='mv'>x</i>의 값이에요. 중간식 <i class='mv'>x</i>+3=11도 확인하고, 원식에 8을 넣으면 4×11=44예요.",
    core: "양변을 4로 나누어 x+3=11, 따라서 x=8!",
  },
  {
    id: "m1u2e171",
    lessonId: L,
    type: "num",
    prompt: "분수 계수 방정식 " + mfmt("{x/3}") + "−" + mfmt("{1/2}") + "=" + mfmt("{x/6}") + "+1을 풀어 <i class='mv'>x</i>의 값을 구하세요.",
    answer: "9",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>분모 3, 2, 6의 최소공배수 6을 모든 항에 곱해요.<br>① 6×" + mfmt("{x/3}") + "=2<i class='mv'>x</i>, 6×" + mfmt("{1/2}") + "=3, 6×" + mfmt("{x/6}") + "=<i class='mv'>x</i>, 6×1=6<br>② 2<i class='mv'>x</i>−3=<i class='mv'>x</i>+6<br>③ 이항하면 <b><i class='mv'>x</i>=9</b><br>검산: 9÷3−0.5=2.5이고 9÷6+1=2.5로 같아요.<span class='xh'>오답 경로 격파</span>3은 우변의 1에 6을 곱하지 않아 2<i class='mv'>x</i>−3=<i class='mv'>x</i>+1로 만든 값이에요. −9는 상수항을 이항하며 부호를 반대로 붙였고, 6은 곱한 최소공배수를 답으로 옮긴 값이에요. 18은 6 대신 12를 곱하고 일부 항을 빠뜨린 계산에서 나와요. 최소공배수는 분수든 정수든 '모든' 항에 곱해요.",
    core: "×6으로 2x−3=x+6, 해는 9!",
  },
  {
    id: "m1u2e172",
    lessonId: L,
    type: "num",
    prompt: "분모가 있는 방정식 (<i class='mv'>x</i>+5)÷3=9를 풀어 <i class='mv'>x</i>의 값을 구하세요.",
    answer: "22",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>양변에 3을 곱하면 <i class='mv'>x</i>+5=27이에요. +5를 우변으로 이항하면 <b><i class='mv'>x</i>=22</b>예요.<br>검산: (22+5)÷3=27÷3=9예요.<span class='xh'>오답 경로 격파</span>27은 양변에 3을 곱한 뒤 +5를 처리하지 않은 중간값이에요. 32는 27에 5를 더해 이항 부호를 바꾸지 않은 값이고요. 12는 9에 3을 더해 나눗셈의 반대 연산을 곱셈이 아닌 덧셈으로 본 오류예요. 4는 9에 3을 더한 뒤 다시 3으로 나누어 (9+3)÷3으로 계산한 값이에요. 괄호 전체가 3으로 나뉜 구조를 먼저 없애요.",
    core: "양변에 3을 곱해 x+5=27, 따라서 x=22!",
  },
  {
    id: "m1u2e173",
    lessonId: L,
    type: "num",
    prompt: "방정식 2(<i class='mv'>x</i>−4)+5=3<i class='mv'>x</i>−9를 풀어 <i class='mv'>x</i>의 값을 구하세요.",
    answer: "6",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>괄호를 풀고 동류항을 정리하면 2<i class='mv'>x</i>−8+5=3<i class='mv'>x</i>−9, 곧 2<i class='mv'>x</i>−3=3<i class='mv'>x</i>−9예요. 이항하면 −<i class='mv'>x</i>=−6이므로 <b><i class='mv'>x</i>=6</b>이에요.<span class='xh'>오답 경로 격파</span>−6은 −<i class='mv'>x</i>=−6에서 양쪽 음수를 함께 없애지 않은 값이에요. 3은 −8+5=−3에서 음수 부호를 빠뜨린 값이고요. 1은 3<i class='mv'>x</i>−2<i class='mv'>x</i>의 계수만 본 값이에요. 14는 상수항 −8을 빠뜨리고 5−(−9)만 계산한 값이에요. 전개할 때 2를 두 항에 모두 곱해야 해요. 답 6을 검산하면 왼쪽 2×2+5=9, 오른쪽 18−9=9예요.",
    core: "전개해 2x−3=3x−9, 이항하면 x=6!",
  },
  {
    id: "m1u2e174",
    lessonId: L,
    type: "num",
    prompt: "<i class='mv'>x</i>에 대한 방정식 " + mfmt("2x+a=6x+14") + "의 해가 <b>음의 정수</b>가 되도록 하는 자연수 <i class='mv'>a</i>를 모두 더한 값을 구하세요.",
    answer: "18",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>문자 <i class='mv'>a</i>를 수처럼 두고 <i class='mv'>x</i>를 정리해요.<br>① <i class='mv'>a</i>−14=4<i class='mv'>x</i>, 곧 <i class='mv'>x</i>=(<i class='mv'>a</i>−14)÷4<br>② <i class='mv'>x</i>가 정수이려면 <i class='mv'>a</i>−14가 4의 배수, 음수이려면 <i class='mv'>a</i><14<br>③ 조건에 맞는 자연수는 <i class='mv'>a</i>=2, 6, 10(<i class='mv'>x</i>=−3, −2, −1)이라 합은 <b>18</b><span class='xh'>오답 경로 격파</span>3은 <i class='mv'>a</i>의 개수를 답한 값이고, 10은 가장 큰 <i class='mv'>a</i> 하나만 답한 값이에요. 32는 <i class='mv'>a</i>=14까지 넣은 값인데, 그때 해는 0이라 음의 정수가 아니에요. 후보 <i class='mv'>a</i>를 하나씩 원식에 되돌려 해가 정말 음의 정수인지 확인하는 습관이 안전해요.",
    core: "x=(a−14)/4가 음의 정수, a=2+6+10=18!",
  },
  // [e175] 2026-07-25 소수리 word→num · 검산: 9x−5x=16+4 → 4x=20 → x=5, 되넣기 9×5−4=41=5×5+16 ✓ ·
  // 앵커: 9x−4·5x+16 unit2.ts 부재 · 쌍둥이: e156(양변 x 이항 정리 mcq, 7x=2x+25)와 과제 상이(끝까지 풀이),
  // l8 잔존 num 정답(15·−7·8·9·22·6·18)과 5 비중복 · mcq 쪽은 e156(5x=25 인쇄)·e166(k=5)이 최종해 5와
  // 공존하나 서로 다른 방정식이라 답 전이 없음(검산 에이전트 대조 · 풀 기존 관행 e117·e128 공존과 동급).
  {
    id: "m1u2e175",
    lessonId: L,
    type: "num",
    prompt: "일차방정식 9<i class='mv'>x</i>−4=5<i class='mv'>x</i>+16을 풀어 <i class='mv'>x</i>의 값을 구하세요.",
    answer: "5",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span><i class='mv'>x</i>항은 좌변으로, 상수항은 우변으로 이항해요.<br>① 9<i class='mv'>x</i>−5<i class='mv'>x</i>=16+4<br>② 4<i class='mv'>x</i>=20<br>③ <i class='mv'>x</i>=<b>5</b><br>검산: 9×5−4=41이고 5×5+16=41로 양변이 같아요.<span class='xh'>오답 경로 격파</span>3은 상수항 −4를 이항하며 부호를 바꾸지 않아 16−4=12를 4로 나눈 값이에요. 20은 4<i class='mv'>x</i>의 값에서 멈춰 계수로 나누지 않은 중간값이고, −5는 마지막 나눗셈에 근거 없는 음수 부호를 붙인 값이에요. 1.4는 5<i class='mv'>x</i>를 이항하지 않고 9<i class='mv'>x</i>만 정리하는 등 항을 섞은 결과일 수 있어요. 이항한 항만 부호가 바뀌고, 남은 항은 그대로라는 규칙을 줄마다 확인해요.",
    core: "이항해 4x=20, 양변을 4로 나누면 x=5!",
  },
  // [e176] 2026-07-25 소수리 word→mcq · 검산: ① x²+2x=x²−6은 양변 x²이 지워져 2x=−6(x=−3) 일차방정식 ✓
  // ② 3x+1 등호 없음 ③ 2x+5>9 부등식 ④ 4(x+1)=4x+4 항등식 ⑤ x²−3x=1은 정리해도 x²항 잔존 → 정답 유일 ✓ ·
  // x² 소거 함정은 풀 내 최초 유형(e115 방정식 고르기와 판별 축 상이) · 저작 인덱스 0(l8 위치 [2,3,2,2,2]).
  {
    id: "m1u2e176",
    lessonId: L,
    type: "mcq",
    prompt: "다음 중 <i class='mv'>x</i>에 대한 <b>일차방정식</b>은?",
    options: [mfmt("x^2+2x=x^2-6"), mfmt("3x+1"), mfmt("2x+5>9"), mfmt("4(x+1)=4x+4"), mfmt("x^2-3x=1")],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>" + mfmt("x^2+2x=x^2-6") + "은 양변에 같은 " + mfmt("x^2") + "항이 있어 정리하면 2<i class='mv'>x</i>=−6이 돼요. 미지수의 가장 높은 차수가 1인 방정식이므로 <b>일차방정식</b>이에요.<span class='xh'>오답 하나씩 격파</span>" + mfmt("3x+1") + "은 등호가 없어 방정식 자체가 아니에요. " + mfmt("2x+5>9") + "는 부등호로 크기를 비교한 부등식이고요. " + mfmt("4(x+1)=4x+4") + "는 좌변을 전개하면 우변과 완전히 같아 모든 값에서 참인 항등식이라 특정한 해를 구하는 방정식이 아니에요. " + mfmt("x^2-3x=1") + "은 정리해도 " + mfmt("x^2") + "항이 사라지지 않아 차수가 1이 아니죠. 겉모양에 " + mfmt("x^2") + "이 보여도 정리한 뒤의 최고 차수로 판별해야 해요.",
    core: "x²이 지워져 2x=−6이 되면 일차방정식!",
  },
  // [e177] 2026-07-25 소수리 word→num · 검산: 양변에 15를 곱해 5(x+2)=3(3x−2) → 5x+10=9x−6 → 16=4x
  // → x=4, 되넣기 (4+2)÷3=2, (3×4−2)÷5=10÷5=2 ✓ · 분모 3·5는 e163(3·6)·e165 보기(4·6)·e171(3·2·6)과
  // 비중복 · (3x−2)는 unit2.ts 항 정의 예시(3x−2의 항)와 조합 상이(방정식 세팅 아님) 확인 ·
  // 구 word의 최소공배수 지식은 해설이 계승.
  {
    id: "m1u2e177",
    lessonId: L,
    type: "num",
    prompt: "일차방정식 (<i class='mv'>x</i>+2)÷3=(3<i class='mv'>x</i>−2)÷5를 풀어 <i class='mv'>x</i>의 값을 구하세요.",
    answer: "4",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>분모 3과 5의 최소공배수 15를 양변에 곱해 분모를 한 번에 없애요.<br>① 15÷3=5, 15÷5=3배씩 곱해 5(<i class='mv'>x</i>+2)=3(3<i class='mv'>x</i>−2)<br>② 전개: 5<i class='mv'>x</i>+10=9<i class='mv'>x</i>−6<br>③ 이항: 16=4<i class='mv'>x</i>이므로 <i class='mv'>x</i>=<b>4</b><br>검산: (4+2)÷3=2, (12−2)÷5=2로 같아요.<span class='xh'>오답 경로 격파</span>15는 양변에 곱한 최소공배수를 답으로 옮긴 값이고, 2는 검산에서 나온 양변의 값이에요. −4는 16과 4<i class='mv'>x</i>를 이항하며 부호를 잘못 붙인 결과이고, 8은 10+6=16을 2<i class='mv'>x</i>로 나누는 등 <i class='mv'>x</i>항 정리를 놓친 값이에요. 곱한 수는 괄호 전체에 분배해야 하고, 마지막에는 원래 분수 식에 되넣어 확인해요.",
    core: "×15로 분모를 없애 5(x+2)=3(3x−2), 해는 4!",
  },
];
