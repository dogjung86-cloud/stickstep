// 중1 수학 II 문자와 식, 레슨 5 동류항과 일차식의 계산 단원 종합 평가 풀(22문항).
// 교과서에서는 출제 구조와 함정만 참고하고 수치·문구·소재 결합은 새로 설계했다.
// 유형 13(mcq+multi)/7(num)/2(word), diff 1/2/3 = 8/8/6 (2026-07 개보수:
// 분수꼴 덧셈·중괄호 전개 2종·빈칸 식·분수 계수 2종 신작, diff는 내용 기준 재캘리브레이션).
import type { ExamItem } from "./types";
import { mfmt } from "../../ui/mathKit";

const L = "m1u2l5";

export const POOL_M1U2L5: ExamItem[] = [
  {
    id: "m1u2e089",
    lessonId: L,
    type: "mcq",
    prompt: "다음 중 서로 동류항인 두 항을 바르게 짝 지은 것은?",
    options: ["5<i class='mv'>a</i>²과 5<i class='mv'>a</i>", "−7<i class='mv'>a</i>와 −7<i class='mv'>b</i>", "−7<i class='mv'>a</i>와 3<i class='mv'>a</i>", "3<i class='mv'>a</i>와 3", "5<i class='mv'>a</i>²과 2<i class='mv'>a</i>³"],
    answer: 2,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>−7<i class='mv'>a</i>와 3<i class='mv'>a</i>는 문자가 모두 <i class='mv'>a</i>이고 차수도 1로 같으므로 <b>동류항</b>이에요. 계수는 달라도 괜찮아요.<span class='xh'>오답 하나씩 격파</span>'5<i class='mv'>a</i>²과 5<i class='mv'>a</i>'는 문자는 같지만 차수가 2와 1로 달라요. '−7<i class='mv'>a</i>와 −7<i class='mv'>b</i>'는 계수만 같고 문자가 다르고요. '3<i class='mv'>a</i>와 3'은 문자항과 상수항이라 같은 무리가 아니에요. '5<i class='mv'>a</i>²과 2<i class='mv'>a</i>³'도 차수가 달라 합칠 수 없어요. 동류항은 계수의 모양이 아니라 문자와 차수를 모두 비교해 판별해요. 상수항은 문자 없이 수만 있는 항끼리 비교해요.",
    core: "문자와 차수가 같은 −7a와 3a가 동류항!",
  },
  {
    id: "m1u2e090",
    lessonId: L,
    type: "mcq",
    prompt: "식 8<i class='mv'>x</i>−3<i class='mv'>x</i>+5를 간단히 한 것은?",
    options: ["11<i class='mv'>x</i>+5", "5<i class='mv'>x</i>²+5", "5<i class='mv'>x</i>", "10<i class='mv'>x</i>", "5<i class='mv'>x</i>+5"],
    answer: 4,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>8<i class='mv'>x</i>와 −3<i class='mv'>x</i>는 동류항이므로 계수만 계산해 (8−3)<i class='mv'>x</i>=5<i class='mv'>x</i>가 돼요. 상수항 5는 합칠 짝이 없으므로 그대로 두어 <b>5<i class='mv'>x</i>+5</b>예요.<span class='xh'>오답 하나씩 격파</span>'11<i class='mv'>x</i>+5'는 뺄셈을 덧셈으로 바꿨어요. '5<i class='mv'>x</i>²+5'는 항을 더하고 빼면서 차수를 올린 오류예요. '5<i class='mv'>x</i>'는 상수항 5를 빠뜨렸고, '10<i class='mv'>x</i>'는 문자항 5<i class='mv'>x</i>와 상수 5를 억지로 합쳤어요. 동류항을 계산해도 문자는 그대로 남고, 다른 종류의 항은 나란히 적어 두어야 해요. 정리 뒤에는 수를 넣어 원래 식과 값도 비교해요.",
    core: "8x−3x=5x, 상수 5는 남겨 5x+5!",
  },
  {
    id: "m1u2e091",
    lessonId: L,
    type: "mcq",
    prompt: "식 −(4<i class='mv'>m</i>−9)의 괄호를 바르게 푼 것은?",
    options: ["4<i class='mv'>m</i>−9", "−4<i class='mv'>m</i>+9", "−4<i class='mv'>m</i>−9", "4<i class='mv'>m</i>+9", "−3<i class='mv'>m</i>"],
    answer: 1,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>괄호 앞의 −는 −1을 곱한다는 뜻이에요. −1을 4<i class='mv'>m</i>과 −9에 각각 곱하면 −4<i class='mv'>m</i>과 +9가 되므로 <b>−4<i class='mv'>m</i>+9</b>예요.<span class='xh'>오답 하나씩 격파</span>'4<i class='mv'>m</i>−9'는 괄호 앞 음수를 아예 무시했어요. '−4<i class='mv'>m</i>−9'는 첫 항의 부호만 바꾸고 상수항은 그대로 두었고요. '4<i class='mv'>m</i>+9'는 두 항 모두 절댓값만 남겼어요. '−3<i class='mv'>m</i>'은 서로 동류항이 아닌 4<i class='mv'>m</i>과 9를 합친 결과예요. 괄호 앞 음수는 안의 모든 항에 적용되어 각 항의 부호가 모두 반대로 바뀌어요. 부호표를 먼저 적으면 빠뜨릴 항이 없어요.",
    core: "괄호 앞 −는 모든 항의 부호를 바꾸어 −4m+9!",
  },
  {
    id: "m1u2e092",
    lessonId: L,
    type: "mcq",
    prompt: "식 3(2<i class='mv'>p</i>−5)를 바르게 계산한 것은?",
    options: ["6<i class='mv'>p</i>−5", "5<i class='mv'>p</i>−15", "6<i class='mv'>p</i>+15", "6<i class='mv'>p</i>−15", "6<i class='mv'>p</i>−2"],
    answer: 3,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>괄호 앞의 3을 괄호 안 두 항에 각각 곱해요. 3×2<i class='mv'>p</i>=6<i class='mv'>p</i>, 3×(−5)=−15이므로 결과는 <b>6<i class='mv'>p</i>−15</b>예요.<span class='xh'>오답 하나씩 격파</span>'6<i class='mv'>p</i>−5'는 3을 첫 항에만 곱했어요. '5<i class='mv'>p</i>−15'는 계수 3과 2를 곱하지 않고 더했고, '6<i class='mv'>p</i>+15'는 음수와 양수의 곱을 양수로 잘못 처리했어요. '6<i class='mv'>p</i>−2'는 상수끼리 5−3을 계산한 것처럼 분배법칙을 바꿨어요. 괄호를 풀 때는 괄호 안 모든 항이 바깥 수와 한 번씩 곱해지는지 확인해요. 전개한 뒤 다시 묶어 원래 식도 확인할 수 있어요.",
    core: "3을 두 항에 각각 곱해 6p−15!",
  },
  {
    id: "m1u2e093",
    lessonId: L,
    type: "mcq",
    prompt: mfmt("{x-3/4}") + "+" + mfmt("{3x-1/2}") + "를 계산하면?",
    options: [mfmt("{7x-5/4}"), mfmt("{2x-2/3}"), mfmt("{4x-4/4}"), mfmt("{7x-1/4}"), mfmt("{7x-5/8}")],
    answer: 0,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>분모 4와 2의 최소공배수 4로 통분해요.<br>① " + mfmt("{3x-1/2}") + "=" + mfmt("{6x-2/4}") + "<br>② 분자끼리 더하면 (<i class='mv'>x</i>−3)+(6<i class='mv'>x</i>−2)=7<i class='mv'>x</i>−5<br>③ 결과는 <b>" + mfmt("{7x-5/4}") + "</b><span class='xh'>오답 하나씩 격파</span><i class='mv'>x</i>=5를 넣으면 원식은 0.5+7=7.5예요. '" + mfmt("{2x-2/3}") + "'는 통분 없이 분자끼리·분모끼리 더한 값이라 2.7쯤이 되고, '" + mfmt("{4x-4/4}") + "'는 둘째 분자에 2를 곱하지 않아 4가 돼요. '" + mfmt("{7x-1/4}") + "'는 −1×2를 +2처럼 다뤄 8.5, '" + mfmt("{7x-5/8}") + "'는 분모까지 곱해 3.75가 되죠. 분수꼴 일차식도 통분이 먼저예요.",
    core: "분모 통분 후 분자끼리 더해 (7x−5)/4!",
  },
  {
    id: "m1u2e094",
    lessonId: L,
    type: "multi",
    prompt: "동류항과 식의 정리에 대한 설명으로 옳은 것을 <b>모두 고르세요.</b>",
    options: [
      "4<i class='mv'>x</i>와 −9<i class='mv'>x</i>는 동류항이다",
      "3<i class='mv'>a</i>와 3<i class='mv'>a</i>²은 계수가 같으므로 동류항이다",
      "두 상수항 −6과 13은 동류항이다",
      "5<i class='mv'>m</i>+2는 7<i class='mv'>m</i>으로 합칠 수 있다",
      "7<i class='mv'>b</i>−10<i class='mv'>b</i>를 계산해도 문자 <i class='mv'>b</i>는 남는다",
    ],
    answer: [0, 2, 4],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>4<i class='mv'>x</i>와 −9<i class='mv'>x</i>는 문자와 차수가 같고, 수만 있는 −6과 13도 같은 상수항 무리예요. 7<i class='mv'>b</i>−10<i class='mv'>b</i>=(7−10)<i class='mv'>b</i>=−3<i class='mv'>b</i>이므로 문자도 남아요. 따라서 첫째, 셋째, 다섯째가 맞아요.<span class='xh'>오답 하나씩 격파</span>둘째의 3<i class='mv'>a</i>와 3<i class='mv'>a</i>²은 계수는 같지만 차수가 달라 동류항이 아니에요. 넷째의 5<i class='mv'>m</i>은 문자항이고 2는 상수항이라 더 이상 합칠 수 없어요. 동류항 판별에서는 계수보다 문자와 차수를 먼저 보고, 계산할 때는 공통 문자를 보존한 채 계수만 더하거나 빼요.",
    core: "문자와 차수가 같은 항, 상수항끼리만 한 무리!",
  },
  {
    id: "m1u2e095",
    lessonId: L,
    type: "mcq",
    prompt: "식 (5<i class='mv'>a</i>+8)−(2<i class='mv'>a</i>−7)을 간단히 한 것은?",
    options: ["7<i class='mv'>a</i>+1", "3<i class='mv'>a</i>+1", "7<i class='mv'>a</i>+15", "3<i class='mv'>a</i>−15", "3<i class='mv'>a</i>+15"],
    answer: 4,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>둘째 괄호 앞의 빼기는 괄호 안 모든 항의 부호를 바꿔요. 5<i class='mv'>a</i>+8−2<i class='mv'>a</i>+7이 되고, 문자항과 상수항을 각각 계산하면 <b>3<i class='mv'>a</i>+15</b>예요.<span class='xh'>오답 하나씩 격파</span>'7<i class='mv'>a</i>+1'은 둘째 괄호를 통째로 더한 결과예요. '3<i class='mv'>a</i>+1'은 2<i class='mv'>a</i>의 부호만 바꾸고 −7은 그대로 두었고요. '7<i class='mv'>a</i>+15'는 문자항을 5+2로 계산했어요. '3<i class='mv'>a</i>−15'는 상수항의 부호를 모두 반대로 보았어요. 괄호 앞 빼기에서는 먼저 모든 부호를 바꾼 뒤 동류항을 모아야 해요. 괄호를 푼 줄을 따로 쓰면 확인하기 쉬워요.",
    core: "둘째 괄호 부호를 모두 바꿔 3a+15!",
  },
  {
    id: "m1u2e096",
    lessonId: L,
    type: "mcq",
    prompt: "5<i class='mv'>a</i>−2−{3<i class='mv'>a</i>−(4−<i class='mv'>a</i>)}를 간단히 한 것은?",
    options: ["3<i class='mv'>a</i>+2", "<i class='mv'>a</i>+2", "<i class='mv'>a</i>−6", "3<i class='mv'>a</i>−6", "−<i class='mv'>a</i>+2"],
    answer: 1,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>가장 안쪽 괄호부터 차례로 풀어요.<br>① 3<i class='mv'>a</i>−(4−<i class='mv'>a</i>)=3<i class='mv'>a</i>−4+<i class='mv'>a</i>=4<i class='mv'>a</i>−4<br>② 5<i class='mv'>a</i>−2−(4<i class='mv'>a</i>−4)=5<i class='mv'>a</i>−2−4<i class='mv'>a</i>+4<br>③ 정리하면 <b><i class='mv'>a</i>+2</b><span class='xh'>오답 하나씩 격파</span><i class='mv'>a</i>=3을 넣으면 원식은 13−8=5이고 <i class='mv'>a</i>+2도 5예요. '3<i class='mv'>a</i>+2'는 안쪽 괄호의 −<i class='mv'>a</i>를 반전하지 않은 값(11), '<i class='mv'>a</i>−6'은 중괄호 앞 −를 상수에 적용하지 않은 값(−3), '3<i class='mv'>a</i>−6'은 두 실수를 겹친 값(3), '−<i class='mv'>a</i>+2'는 문자항 부호가 뒤집힌 값(−1)이라 전부 5와 달라요. 괄호는 안에서 밖으로, 부호는 단계마다 확인해요.",
    core: "안쪽 괄호부터 두 번 풀면 a+2!",
  },
  {
    id: "m1u2e097",
    lessonId: L,
    type: "mcq",
    prompt: "식 (9<i class='mv'>x</i>+4)−(2<i class='mv'>x</i>−5)를 계산하는 과정에서 둘째 괄호를 풀 때 주의해야 해요. 바른 결과는?",
    options: ["11<i class='mv'>x</i>−1", "7<i class='mv'>x</i>−1", "7<i class='mv'>x</i>+9", "11<i class='mv'>x</i>+9", "7<i class='mv'>x</i>−9"],
    answer: 2,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>둘째 괄호 앞의 −를 분배하면 −2<i class='mv'>x</i>+5가 돼요. 따라서 9<i class='mv'>x</i>+4−2<i class='mv'>x</i>+5=7<i class='mv'>x</i>+9이므로 정답은 <b>7<i class='mv'>x</i>+9</b>예요.<span class='xh'>오답 하나씩 격파</span>'11<i class='mv'>x</i>−1'은 둘째 식 전체를 더한 결과이고, '7<i class='mv'>x</i>−1'은 −2<i class='mv'>x</i>의 부호만 바꾸고 −5는 그대로 둔 대표 오류예요. '11<i class='mv'>x</i>+9'는 문자항도 덧셈으로 처리했고, '7<i class='mv'>x</i>−9'는 두 상수항을 모두 음수로 보았어요. 괄호 앞 음수는 안의 모든 항과 곱해지므로 −5가 +5로 바뀌는 점이 핵심이에요. 괄호를 푼 직후 부호 두 개를 모두 점검해요.",
    core: "−(2x−5)=−2x+5이므로 결과는 7x+9!",
  },
  {
    id: "m1u2e098",
    lessonId: L,
    type: "multi",
    prompt: "다음 일차식을 간단히 한 결과가 바른 것을 <b>모두 고르세요.</b>",
    options: [
      "6<i class='mv'>a</i>−11<i class='mv'>a</i>=5<i class='mv'>a</i>",
      "2(4<i class='mv'>b</i>+3)=8<i class='mv'>b</i>+6",
      "−(3<i class='mv'>m</i>+8)=−3<i class='mv'>m</i>+8",
      "(7<i class='mv'>p</i>−5)+(−4<i class='mv'>p</i>+2)=3<i class='mv'>p</i>−3",
      "9<i class='mv'>x</i>+4=13<i class='mv'>x</i>",
    ],
    answer: [1, 3],
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>2를 두 항에 각각 곱하면 8<i class='mv'>b</i>+6이므로 둘째가 맞아요. 또 7<i class='mv'>p</i>−4<i class='mv'>p</i>=3<i class='mv'>p</i>, −5+2=−3이므로 넷째도 맞아요.<span class='xh'>오답 하나씩 격파</span>첫째는 (6−11)<i class='mv'>a</i>=−5<i class='mv'>a</i>라서 부호가 틀렸어요. 셋째에서 괄호 앞 음수는 두 항의 부호를 모두 바꾸므로 −3<i class='mv'>m</i>−8이 되어야 해요. 다섯째의 9<i class='mv'>x</i>와 4는 동류항이 아니므로 13<i class='mv'>x</i>로 합칠 수 없어요. 분배법칙과 부호를 먼저 처리한 뒤 문자와 차수가 같은 항만 모아야 해요. 정리한 보기의 문자항과 상수항도 대조해요.",
    core: "분배와 동류항 정리를 모두 지킨 둘째와 넷째!",
  },
  {
    id: "m1u2e099",
    lessonId: L,
    type: "mcq",
    prompt: "3(2<i class='mv'>x</i>−1)에 어떤 식을 더했더니 <i class='mv'>x</i>+7이 되었어요. 더한 식은?",
    options: ["−5<i class='mv'>x</i>+10", "5<i class='mv'>x</i>−10", "−5<i class='mv'>x</i>+4", "−5<i class='mv'>x</i>+8", "−5<i class='mv'>x</i>−10"],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>3(2<i class='mv'>x</i>−1)=6<i class='mv'>x</i>−3이에요. 더한 식은 결과에서 처음 식을 빼면 나와요.<br>① (<i class='mv'>x</i>+7)−(6<i class='mv'>x</i>−3)<br>② <i class='mv'>x</i>+7−6<i class='mv'>x</i>+3=<b>−5<i class='mv'>x</i>+10</b><br>검산: 6<i class='mv'>x</i>−3+(−5<i class='mv'>x</i>+10)=<i class='mv'>x</i>+7이에요.<span class='xh'>오답 하나씩 격파</span>'5<i class='mv'>x</i>−10'은 처음 식에서 결과를 뺀 반대 방향이에요. '−5<i class='mv'>x</i>+4'는 −3을 빼며 부호를 바꾸지 않은 값이고, '−5<i class='mv'>x</i>+8'은 분배에서 3×(−1)을 −1로 계산한 값이에요. '−5<i class='mv'>x</i>−10'은 상수항 부호가 뒤집혔어요. 빈칸 식은 '결과−나머지'로 구하고 반드시 되더해 검산해요.",
    core: "더한 식은 결과−처음, 검산은 되더하기!",
  },
  {
    id: "m1u2e100",
    lessonId: L,
    type: "mcq",
    prompt: "어떤 식에서 2<i class='mv'>x</i>−3을 빼야 할 것을 잘못하여 더했더니 11<i class='mv'>x</i>+5가 되었어요. 바르게 계산한 결과는?",
    options: ["13<i class='mv'>x</i>+2", "9<i class='mv'>x</i>+8", "7<i class='mv'>x</i>−1", "7<i class='mv'>x</i>+11", "9<i class='mv'>x</i>+2"],
    answer: 3,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>잘못한 결과에는 2<i class='mv'>x</i>−3이 한 번 더해져 있어요. 이를 되돌려 한 번 빼고, 원래 해야 할 뺄셈까지 한 번 더 하므로 잘못한 결과에서 이 식을 두 번 빼요. 11<i class='mv'>x</i>+5−2(2<i class='mv'>x</i>−3)=11<i class='mv'>x</i>+5−4<i class='mv'>x</i>+6=<b>7<i class='mv'>x</i>+11</b>이에요.<span class='xh'>오답 하나씩 격파</span>'13<i class='mv'>x</i>+2'는 잘못한 덧셈을 한 번 더 했고, '9<i class='mv'>x</i>+8'은 더한 것을 한 번만 되돌렸어요. '7<i class='mv'>x</i>−1'은 −3의 부호를 바꾸지 않았고, '9<i class='mv'>x</i>+2'는 식을 한 번만 빼며 상수 부호도 틀렸어요. 새 결과에 두 식을 대조해 계산 방향도 확인해요.",
    core: "잘못 더한 식을 두 번 빼서 7x+11!",
  },
  {
    id: "m1u2e101",
    lessonId: L,
    type: "multi",
    prompt: "일차식의 덧셈과 뺄셈에 대한 설명으로 옳은 것을 <b>모두 고르세요.</b>",
    options: [
      "동류항을 더하거나 빼도 문자의 차수는 그대로이다",
      "괄호 앞이 음수이면 괄호 안 첫 항의 부호만 바꾼다",
      "문자항과 상수항은 계수의 합을 이용해 하나로 합친다",
      "일차식을 뺄 때는 빼는 식의 각 항의 부호를 바꾸어 더할 수 있다",
      "계수의 계산 결과가 1이면 문자도 함께 생략한다",
    ],
    answer: [0, 3],
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>동류항은 공통 문자를 그대로 두고 계수만 계산하므로 차수가 변하지 않아요. 또 어떤 식을 빼는 것은 그 식의 각 항에 −1을 곱해 더하는 것과 같으므로 첫째와 넷째가 맞아요.<span class='xh'>오답 하나씩 격파</span>둘째는 괄호 안 모든 항의 부호를 바꾸어야 하므로 틀렸어요. 셋째의 문자항과 상수항은 동류항이 아니어서 하나로 합칠 수 없어요. 다섯째에서 계수가 1이면 숫자 1만 생략할 뿐 문자는 남겨야 해요. 예를 들어 4<i class='mv'>x</i>−3<i class='mv'>x</i>=<i class='mv'>x</i>이지 1이 아니에요. 부호 변화와 문자 보존을 함께 확인해요.",
    core: "동류항의 차수는 유지되고 뺄셈은 부호를 바꾸어 더한다!",
  },
  {
    id: "m1u2e102",
    lessonId: L,
    type: "num",
    prompt: "식 12<i class='mv'>x</i>−5<i class='mv'>x</i>를 간단히 했을 때 <i class='mv'>x</i>의 계수를 구하세요.",
    answer: "7",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>12<i class='mv'>x</i>와 −5<i class='mv'>x</i>는 문자와 차수가 같은 동류항이에요. 공통 문자 <i class='mv'>x</i>는 그대로 두고 계수만 계산하면 (12−5)<i class='mv'>x</i>=7<i class='mv'>x</i>예요. 따라서 <i class='mv'>x</i>의 계수는 <b>7</b>이에요.<span class='xh'>오답 경로 격파</span>17은 빼기를 더하기로 바꾼 값이고, −7은 절댓값이 더 큰 12의 양수 부호를 놓친 값이에요. 60은 계수를 서로 곱했고, 7<i class='mv'>x</i>²처럼 차수를 2로 올리면 덧셈을 곱셈처럼 처리한 셈이에요. 질문은 정리한 식 자체가 아니라 계수를 묻고 있으므로 답에는 문자 없이 7만 써요. 식과 계수를 구별해 답의 형태도 확인해요.",
    core: "12x−5x=7x이므로 계수는 7!",
  },
  {
    id: "m1u2e103",
    lessonId: L,
    type: "num",
    prompt: mfmt("{2/3}") + "(6<i class='mv'>x</i>−9)+" + mfmt("{1/2}") + "(4<i class='mv'>x</i>+10)을 간단히 했을 때 <i class='mv'>x</i>의 계수를 구하세요.",
    answer: "6",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>분수 계수도 괄호 안 두 항에 각각 분배해요.<br>① " + mfmt("{2/3}") + "×6<i class='mv'>x</i>=4<i class='mv'>x</i>, " + mfmt("{2/3}") + "×(−9)=−6<br>② " + mfmt("{1/2}") + "×4<i class='mv'>x</i>=2<i class='mv'>x</i>, " + mfmt("{1/2}") + "×10=5<br>③ 4<i class='mv'>x</i>+2<i class='mv'>x</i>=6<i class='mv'>x</i>이므로 계수는 <b>6</b><span class='xh'>오답 경로 격파</span>10은 분수를 곱하지 않고 6<i class='mv'>x</i>+4<i class='mv'>x</i>로 계산한 값이에요. 4는 첫 묶음의 계수에서 멈춘 값이고, 2는 둘째 묶음만 본 값이에요. −1은 상수항 −6+5를 답한 경우죠. 분수 곱은 '분모로 나누고 분자를 곱하기'로 처리하면 6÷3×2=4처럼 정수 계산이 돼요. 계수만 물어도 식 전체를 정리한 뒤 문자 앞의 수를 읽어요.",
    core: "분수도 분배! 4x+2x=6x라서 계수 6!",
  },
  {
    id: "m1u2e104",
    lessonId: L,
    type: "num",
    prompt: "식 (6<i class='mv'>b</i>−9)+(−8<i class='mv'>b</i>+4)를 간단히 했을 때 <i class='mv'>b</i>의 계수를 구하세요.",
    answer: "-2",
    numKind: "int",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>덧셈이므로 괄호를 풀어 6<i class='mv'>b</i>−9−8<i class='mv'>b</i>+4로 써요. 문자항의 계수는 6−8=−2이고 상수항은 −9+4=−5이므로 식은 −2<i class='mv'>b</i>−5예요. 따라서 <i class='mv'>b</i>의 계수는 <b>−2</b>예요.<span class='xh'>오답 경로 격파</span>14는 −8의 부호를 잃고 계수를 더한 값이고, 2는 6−8의 음수 부호를 놓쳤어요. −5는 상수항을 답한 값이며, −7은 문자항과 상수항을 섞어 계산한 결과일 수 있어요. 계수를 묻는 문제에서는 식 전체를 정리한 뒤 문자 앞의 수만 골라요. 계수가 음수이면 부호까지 답에 포함해야 해요.",
    core: "6−8=−2이므로 b의 계수는 −2!",
  },
  {
    id: "m1u2e105",
    lessonId: L,
    type: "num",
    prompt: "7<i class='mv'>x</i>−{2<i class='mv'>x</i>−(<i class='mv'>x</i>−5)}를 간단히 했을 때 상수항을 구하세요.",
    answer: "-5",
    numKind: "int",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>안쪽 괄호부터 풀어요.<br>① 2<i class='mv'>x</i>−(<i class='mv'>x</i>−5)=2<i class='mv'>x</i>−<i class='mv'>x</i>+5=<i class='mv'>x</i>+5<br>② 7<i class='mv'>x</i>−(<i class='mv'>x</i>+5)=7<i class='mv'>x</i>−<i class='mv'>x</i>−5=6<i class='mv'>x</i>−5<br>③ 상수항은 <b>−5</b><span class='xh'>오답 경로 격파</span>5는 마지막 중괄호를 풀며 +5의 부호를 바꾸지 않은 값이에요. −10은 −5가 두 번 빠진다고 본 값이고, 6은 상수항이 아니라 <i class='mv'>x</i>의 계수예요. 상수항을 5나 10으로 두고 <i class='mv'>x</i>=1을 대입해 보면 원식의 값과 어긋나요. 실제로 <i class='mv'>x</i>=1에서 원식은 7−{2−(−4)}=7−6=1이고, 6×1−5=1로 정확히 일치해요. 괄호가 겹치면 반드시 안에서 밖 순서로, 한 겹씩 부호를 처리해요.",
    core: "x+5를 빼면 6x−5, 상수항 −5!",
  },
  {
    id: "m1u2e106",
    lessonId: L,
    type: "num",
    prompt: "식 5(2<i class='mv'>x</i>−3)−(4<i class='mv'>x</i>+8)을 <i class='mv'>a</i><i class='mv'>x</i>+<i class='mv'>b</i>로 정리했어요. <i class='mv'>a</i>−<i class='mv'>b</i>의 값을 구하세요.",
    answer: "29",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>5를 분배하면 10<i class='mv'>x</i>−15이고, 둘째 괄호를 빼면 −4<i class='mv'>x</i>−8이에요. 따라서 10<i class='mv'>x</i>−15−4<i class='mv'>x</i>−8=6<i class='mv'>x</i>−23이므로 <i class='mv'>a</i>=6, <i class='mv'>b</i>=−23이에요. <i class='mv'>a</i>−<i class='mv'>b</i>=6−(−23)=<b>29</b>예요.<span class='xh'>오답 경로 격파</span>−17은 6+(−23)을 계산한 값이고, 17은 −23의 부호를 무시한 차예요. −29는 빼는 순서를 뒤집었고, 23은 계수 <i class='mv'>a</i>를 반영하지 않았어요. <i class='mv'>b</i> 자체가 음수이므로 마지막 뺄셈에서는 괄호를 써야 해요. 계수와 상수항을 표시한 뒤 요구한 연산을 적용해요.",
    core: "6x−23에서 a−b=6−(−23)=29!",
  },
  {
    id: "m1u2e107",
    lessonId: L,
    type: "num",
    prompt: mfmt("{3/4}") + "(8<i class='mv'>m</i>−4)+" + mfmt("{1/2}") + "<i class='mv'>m</i>을 간단히 했을 때 <i class='mv'>m</i>의 계수를 <b>소수로</b> 구하세요.",
    answer: "6.5",
    numKind: "dec",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>" + mfmt("{3/4}") + "를 괄호의 두 항에 분배해요.<br>① " + mfmt("{3/4}") + "×8<i class='mv'>m</i>=6<i class='mv'>m</i>, " + mfmt("{3/4}") + "×(−4)=−3<br>② 6<i class='mv'>m</i>+" + mfmt("{1/2}") + "<i class='mv'>m</i>=6.5<i class='mv'>m</i><br>③ 계수는 <b>6.5</b><span class='xh'>오답 경로 격파</span>6은 뒤의 " + mfmt("{1/2}") + "<i class='mv'>m</i>을 빠뜨린 값이에요. 7은 " + mfmt("{1/2}") + "을 1로 올림해 더한 값이고, 8.5는 " + mfmt("{3/4}") + "×8을 8로 둔 채 " + mfmt("{1/2}") + "만 더한 값이에요. −3은 계수가 아니라 상수항이죠. 분수 " + mfmt("{1/2}") + "은 소수 0.5와 같으므로 6+0.5=6.5로 읽으면 넘패드 입력도 정확해요. 동류항의 계수는 분수·소수가 섞여 있어도 같은 문자끼리만 더해요.",
    core: "6m+0.5m=6.5m, 계수는 6.5!",
  },
  {
    id: "m1u2e108",
    lessonId: L,
    type: "num",
    prompt: "식 (7<i class='mv'>r</i>−2)−2(3<i class='mv'>r</i>+5)를 <i class='mv'>a</i><i class='mv'>r</i>+<i class='mv'>b</i>로 정리했어요. <i class='mv'>a</i>+<i class='mv'>b</i>의 값을 구하세요.",
    answer: "-11",
    numKind: "int",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>2(3<i class='mv'>r</i>+5)=6<i class='mv'>r</i>+10이고 이 식 전체를 빼므로 7<i class='mv'>r</i>−2−6<i class='mv'>r</i>−10=<i class='mv'>r</i>−12예요. 따라서 <i class='mv'>a</i>=1, <i class='mv'>b</i>=−12이고 <i class='mv'>a</i>+<i class='mv'>b</i>=1+(−12)=<b>−11</b>이에요.<span class='xh'>오답 경로 격파</span>−13은 <i class='mv'>r</i>의 계수 1을 −1로 보았고, 11은 합의 음수 부호를 놓쳤어요. −12는 상수항만 답한 값이고, 13은 절댓값끼리 더한 결과예요. 계수 1은 식에서 생략되어 보여도 <i class='mv'>a</i>의 값으로는 반드시 포함해야 해요. 마지막에는 <i class='mv'>a</i>와 <i class='mv'>b</i>를 따로 적고 두 값을 더하는 순서까지 다시 확인해요.",
    core: "r−12에서 계수 1을 살려 a+b=−11!",
  },
  {
    id: "m1u2e109",
    lessonId: L,
    type: "word",
    prompt: "문자와 차수가 각각 같은 항을 무엇이라고 하나요?",
    answer: "동류항",
    bank: ["동류항", "상수항", "계수", "차수", "일차식", "항등식", "방정식", "식의 값"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>문자와 차수가 각각 같은 항을 <b>동류항</b>이라고 해요. 예를 들어 4<i class='mv'>x</i>와 −9<i class='mv'>x</i>는 계수는 다르지만 문자와 차수가 같아서 동류항이고, 상수항끼리도 모두 동류항이에요.<span class='xh'>오답 칩 격파</span>'상수항'은 문자가 없이 수만으로 된 항이고, '계수'는 문자에 곱해진 수예요. '차수'는 문자가 곱해진 횟수이며, '일차식'은 차수가 1인 다항식이에요. '항등식'은 모든 문자 값에서 참인 등식, '방정식'은 특정한 값에서 참인 등식이에요. '식의 값'은 문자에 수를 대입해 계산한 결과예요. 합칠 수 있는 같은 무리의 이름은 동류항이에요.",
    core: "문자와 차수가 같은 항의 이름은 동류항!",
  },
  {
    id: "m1u2e110",
    lessonId: L,
    type: "word",
    prompt: "괄호 앞의 수를 괄호 안의 각 항에 모두 곱하여 괄호를 푸는 데 사용하는 계산 법칙은 무엇인가요?",
    answer: "분배법칙",
    bank: ["분배법칙", "교환법칙", "결합법칙", "등식의 성질", "이항", "대입", "통분", "약분", "소인수분해"],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>괄호 앞의 수를 괄호 안 각 항에 모두 곱하는 계산 법칙은 <b>분배법칙</b>이에요. 예를 들어 −2(<i class='mv'>x</i>+3)=−2<i class='mv'>x</i>−6처럼 두 항 모두 바깥 수와 곱해져요.<span class='xh'>오답 칩 격파</span>'교환법칙'은 더하거나 곱하는 순서를 바꾸는 법칙이고, '결합법칙'은 계산할 묶음을 바꾸는 법칙이에요. '등식의 성질'과 '이항'은 등호가 있는 식을 다룰 때 쓰고, '대입'은 문자를 수로 바꾸는 과정이에요. '통분'과 '약분'은 분수 계산, '소인수분해'는 자연수를 소수의 곱으로 나타내는 방법이에요. 괄호 안 모든 항에 곱을 나누어 적용하는 것은 분배법칙이에요.",
    core: "괄호 안 각 항에 곱을 나누어 적용하는 분배법칙!",
  },
];
