// 중1 수학 Ⅳ. 기본 도형: 단원 종합 평가 풀, 레슨 2 직선·반직선·선분 (m1u4e016~m1u4e030).
// 유형 9(mcq+multi)/5(num)/1(word), diff 7/5/3(개보수 재캘리브레이션). 교과서의 문장·수치·도형 배치는 복제하지 않았다.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import { mExamPointsLineFig } from "../../ui/examFiguresMath";

const L = "m1u4l2";

export const POOL_M1U4L2: ExamItem[] = [
  {
    id: "m1u4e016",
    lessonId: L,
    type: "mcq",
    prompt: "손전등을 점 P에 놓고 점 Q를 향하게 했더니 빛이 Q를 지나 한쪽으로 계속 나아갔어요. 이 빛의 경로를 나타내는 기호는?",
    options: [
      gsym("PQ", "line") + " (직선 PQ)",
      gsym("PQ", "ray") + " (반직선 PQ)",
      gsym("PQ", "seg") + " (선분 PQ)",
      gsym("QP", "ray") + " (반직선 QP)",
      gsym("QP", "seg") + " (선분 QP)",
    ],
    answer: 1,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>빛은 P에서 시작해 Q를 지나 한쪽으로 계속 나아가므로 " +
      gsym("PQ", "ray") +
      "예요. 반직선의 이름은 시작점을 먼저 쓰고, 방향을 알려 주는 점을 뒤에 써요.<span class='xh'>오답 하나씩 격파</span>" +
      gsym("PQ", "line") +
      "은 P의 뒤쪽까지 양방향으로 뻗으므로 시작점이 없어요. " +
      gsym("PQ", "seg") +
      "와 " +
      gsym("QP", "seg") +
      "는 P와 Q 사이에서 끝나는 같은 선분이라 Q 너머로 가지 않아요. " +
      gsym("QP", "ray") +
      "는 Q에서 시작해 P 쪽으로 나아가므로 시작점과 방향이 모두 달라요. 반직선은 화살표 모양만 보지 말고 앞 글자가 시작점인지 확인해야 해요.",
    core: "반직선 PQ는 P에서 시작해 Q의 방향으로 뻗는다.",
  },
  {
    id: "m1u4e017",
    lessonId: L,
    type: "mcq",
    prompt: "그림과 같이 서로 다른 네 점 A, C, E, G가 한 직선 위에 있어요. 다음 중 " + gsym("CG", "line") + "와 같은 도형은?",
    figure: mExamPointsLineFig({ pts: ["A", "C", "E", "G"] }),
    options: [
      gsym("GC", "ray") + " (반직선 GC)",
      gsym("CE", "seg") + " (선분 CE)",
      gsym("CG", "seg") + " (선분 CG)",
      gsym("EA", "line") + " (직선 EA)",
      gsym("GE", "ray") + " (반직선 GE)",
    ],
    answer: 3,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>A, C, E, G가 모두 같은 직선 위에 있으므로 그중 서로 다른 두 점으로 이름 붙인 직선은 모두 같은 직선이에요. 따라서 " +
      gsym("EA", "line") +
      "가 " +
      gsym("CG", "line") +
      "와 같아요.<span class='xh'>오답 하나씩 격파</span>" +
      gsym("GC", "ray") +
      "와 " +
      gsym("GE", "ray") +
      "는 각각 시작점과 한쪽 방향이 정해진 반직선이라 양쪽으로 뻗는 직선과 달라요. " +
      gsym("CE", "seg") +
      "와 " +
      gsym("CG", "seg") +
      "는 양 끝점 사이만 포함하는 선분이에요. 같은 점들을 지나더라도 어디까지 뻗는지 다르면 같은 도형이 아니에요. 기호 위의 표시는 도형의 범위를 알려 줘요. 이름보다 도형의 종류를 먼저 확인해요.",
    core: "한 직선 위의 서로 다른 두 점은 같은 직선에 여러 이름을 붙일 수 있다.",
  },
  {
    id: "m1u4e018",
    lessonId: L,
    type: "mcq",
    prompt: "그림과 같이 울타리의 네 표지 H, J, K, L이 한 직선 위에 있어요. 다음 중 " + gsym("JK", "ray") + "와 같은 도형은?",
    figure: mExamPointsLineFig({ pts: ["H", "J", "K", "L"] }),
    options: [
      gsym("KJ", "ray") + " (반직선 KJ)",
      gsym("JH", "ray") + " (반직선 JH)",
      gsym("JK", "seg") + " (선분 JK)",
      gsym("JK", "line") + " (직선 JK)",
      gsym("JL", "ray") + " (반직선 JL)",
    ],
    answer: 4,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>" +
      gsym("JK", "ray") +
      "는 J에서 시작해 K를 지나 L 쪽으로 뻗어요. " +
      gsym("JL", "ray") +
      "도 시작점이 J이고 같은 쪽으로 뻗으므로 두 반직선은 같아요.<span class='xh'>오답 하나씩 격파</span>" +
      gsym("KJ", "ray") +
      "는 시작점이 K라서 J와 K 사이 일부가 겹쳐도 같은 도형이 아니에요. " +
      gsym("JH", "ray") +
      "는 시작점은 같지만 H 쪽으로 뻗어 방향이 반대예요. " +
      gsym("JK", "seg") +
      "는 J와 K 사이에서 끝나고, " +
      gsym("JK", "line") +
      "은 양쪽으로 계속 뻗어요. 반직선이 같으려면 시작점과 방향이 모두 같아야 해요. 한 조건이라도 달라지면 일부가 겹쳐도 다른 반직선이에요.",
    core: "같은 반직선은 시작점과 뻗는 방향이 모두 같다.",
  },
  {
    id: "m1u4e019",
    lessonId: L,
    type: "multi",
    prompt: "직선, 반직선, 선분에 대한 설명으로 옳은 것은? <b>정답을 모두 고르세요.</b>",
    options: [
      gsym("MN", "line") + "과 " + gsym("NM", "line") + "은 같은 직선이다",
      gsym("PQ", "ray") + "와 " + gsym("QP", "ray") + "은 언제나 같은 반직선이다",
      gsym("HK", "seg") + "와 " + gsym("KH", "seg") + "은 같은 선분이다",
      "선분은 한 시작점에서 한쪽으로 한없이 뻗는다",
      "두 점 사이의 거리는 두 점을 이은 선분의 길이이다",
    ],
    answer: [0, 2, 4],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>직선은 양쪽으로 뻗으므로 두 점의 이름을 거꾸로 써도 같아요. 선분도 두 끝점 사이만 나타내므로 " +
      gsym("HK", "seg") +
      "와 " +
      gsym("KH", "seg") +
      "이 같아요. 두 점 사이의 거리는 두 점을 곧게 이은 선분의 길이예요.<span class='xh'>오답 하나씩 격파</span>" +
      gsym("PQ", "ray") +
      "는 P에서, " +
      gsym("QP", "ray") +
      "는 Q에서 시작하므로 일반적으로 달라요. 일부가 겹친다는 사실만으로 같은 반직선이 되지는 않아요. 또 한 시작점에서 한쪽으로 한없이 뻗는 도형은 선분이 아니라 반직선이에요. 선분에는 양 끝점이 있어 길이를 정할 수 있다는 차이를 기억해요.",
    core: "직선과 선분은 글자 순서를 바꾸어도 같지만 반직선은 다르다.",
  },
  {
    id: "m1u4e020",
    lessonId: L,
    type: "mcq",
    prompt: "철길의 두 역 A, C를 곧게 이은 " + gsym("AC", "seg") + "의 길이는 7 km이고, 굽은 연결 도로의 길이는 12 km예요. 두 점 A, C 사이의 거리는?",
    options: ["12 km", "19 km", "7 km", "5 km", "정할 수 없다"],
    answer: 2,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>두 점 사이의 거리는 여러 이동 경로 중 임의의 길이가 아니라, 두 점을 곧게 이은 선분의 길이로 정해요. 따라서 " +
      gsym("AC", "seg") +
      "의 길이인 <b>7 km</b>가 답이에요.<span class='xh'>오답 하나씩 격파</span>'12 km'는 실제로 돌아가는 연결 도로의 길이일 뿐 두 점 사이의 거리 정의와 달라요. '19 km'는 서로 다른 두 경로를 더한 값이라 출발점과 끝점 사이의 곧은 길이가 아니고요. '5 km'는 12와 7의 차를 계산했지만 그런 계산을 요구하지 않았어요. '정할 수 없다'도 선분 AC의 길이가 이미 주어졌으므로 틀려요. 거리라는 말이 나오면 곧은 선분의 길이를 먼저 찾아요.",
    core: "두 점 사이의 거리는 두 점을 이은 선분의 길이다.",
  },
  {
    id: "m1u4e021",
    lessonId: L,
    type: "mcq",
    prompt: "점 C가 길이 12 cm인 " + gsym("AE", "seg") + "의 중점일 때, " + gsym("AC", "seg") + "의 길이는?",
    options: ["12 cm", "6 cm", "24 cm", "4 cm", "8 cm"],
    answer: 1,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>C가 " +
      gsym("AE", "seg") +
      "의 중점이므로 " +
      gsym("AC", "seg") +
      "와 " +
      gsym("CE", "seg") +
      "의 길이가 같아요. 두 선분이 합쳐 12 cm이므로 각각 12÷2 = <b>6 cm</b>예요.<span class='xh'>오답 하나씩 격파</span>'12 cm'는 전체 AE를 절반 AC로 그대로 옮긴 값이에요. '24 cm'는 전체를 다시 두 배 하여 중점 관계를 거꾸로 적용했고, '4 cm'는 세 부분으로 나눈 값이라 중점의 뜻과 달라요. '8 cm'도 나머지 CE가 4 cm가 되어 두 길이가 같지 않아요. 중점은 선분 위의 가운데 점이므로 먼저 같은 두 부분을 만들고 전체를 2로 나누면 돼요.",
    core: "중점은 선분을 길이가 같은 두 부분으로 나눈다.",
  },
  {
    id: "m1u4e022",
    lessonId: L,
    type: "mcq",
    prompt: "점 J가 " + gsym("HL", "seg") + "의 중점이라는 사실만으로 반드시 알 수 있는 것은?",
    options: [
      gsym("HJ", "ray") + "와 " + gsym("JL", "ray") + "이 같은 반직선이다",
      "H와 L이 같은 점이다",
      gsym("HL", "line") + "의 길이를 정할 수 있다",
      "J는 H 또는 L과 겹친다",
      gsym("HJ", "seg") + "과 " + gsym("JL", "seg") + "의 길이가 같다",
    ],
    answer: 4,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>J가 " +
      gsym("HL", "seg") +
      "의 중점이라는 말에는 J가 선분 HL 위에 있고, " +
      gsym("HJ", "seg") +
      "와 " +
      gsym("JL", "seg") +
      "의 길이가 같다는 뜻이 들어 있어요.<span class='xh'>오답 하나씩 격파</span>" +
      gsym("HJ", "ray") +
      "와 " +
      gsym("JL", "ray") +
      "은 시작점부터 다르므로 같은 반직선이 아니에요. H와 L은 선분의 서로 다른 두 끝점이고, J도 그 사이의 점이라 어느 끝점과도 겹치지 않아요. 직선은 양쪽으로 한없이 뻗는 도형이므로 길이를 정하지 않아요. 중점 조건이 알려 주는 것은 전체의 실제 수치가 아니라 두 부분의 길이가 서로 같다는 관계예요.",
    core: "중점 J이면 HJ와 JL의 길이가 같다.",
  },
  {
    id: "m1u4e023",
    lessonId: L,
    type: "mcq",
    prompt: "그림과 같이 세 점 H, J, K가 한 직선 위에 있고, " + gsym("HJ", "seg") + "=4 cm, " + gsym("JK", "seg") + "=6 cm예요. 옳은 것은?",
    figure: mExamPointsLineFig({ pts: ["H", "J", "K"], segs: [{ from: 0, to: 1, label: "4 cm" }, { from: 1, to: 2, label: "6 cm" }] }),
    options: [
      gsym("HK", "seg") + "=10 cm",
      gsym("HK", "seg") + "=2 cm",
      gsym("HJ", "seg") + "=10 cm",
      gsym("JK", "seg") + "=4 cm",
      gsym("HK", "line") + "=10 cm",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>J가 H와 K 사이에 있으므로 " +
      gsym("HK", "seg") +
      "는 " +
      gsym("HJ", "seg") +
      "와 " +
      gsym("JK", "seg") +
      "를 이어 붙인 선분이에요. 따라서 HK=4+6 = <b>10 cm</b>예요.<span class='xh'>오답 하나씩 격파</span>'HK=2 cm'는 6−4를 계산한 값이라 두 이웃한 구간을 합쳐야 하는 점의 순서를 놓쳤어요. 'HJ=10 cm'는 전체 길이를 한 부분에 잘못 붙였고, 'JK=4 cm'는 서로 다른 두 주어진 길이를 같다고 바꾸었어요. " +
      gsym("HK", "line") +
      "에 10 cm라고 한 설명도 틀려요. 직선은 양쪽으로 한없이 뻗어 전체 길이를 정할 수 없고, 길이 10 cm는 양 끝이 있는 선분 HK에 붙여야 해요.",
    core: "사이에 있는 점을 기준으로 이웃한 선분의 길이를 더한다.",
  },
  {
    id: "m1u4e024",
    lessonId: L,
    type: "mcq",
    prompt: "서로 다른 여섯 점 A, C, E, G, J, L이 한 직선 위에 있어요. 이 점 가운데 두 점을 끝점으로 하는 서로 다른 선분의 개수는?",
    options: ["6개", "12개", "30개", "15개", "36개"],
    answer: 3,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>선분 하나는 서로 다른 두 끝점을 고르면 정해져요. A와 이을 수 있는 선분은 5개, 이미 센 A를 빼고 C에서 새로 세면 4개, 이어서 3개, 2개, 1개예요. 따라서 5+4+3+2+1 = <b>15개</b>예요.<span class='xh'>오답 하나씩 격파</span>'6개'는 점의 개수만 적은 값이고, '12개'는 각 점에서 양쪽 방향만 막연히 두 번 센 값이에요. '30개'는 시작점과 끝점의 순서를 구별해 6×5로 센 값인데, 선분 AC와 선분 CA는 같은 선분이라 두 번 세면 안 돼요. '36개'는 같은 점을 두 번 고르는 경우까지 넣은 값이에요. 중복을 피하려면 앞 점마다 아직 짝짓지 않은 뒤쪽 점만 세어요.",
    core: "여섯 점에서 두 끝점을 고르는 선분은 5+4+3+2+1 = 15개다.",
  },
  {
    id: "m1u4e025",
    lessonId: L,
    type: "num",
    prompt: "한 직선 위에 M, P, N이 이 순서로 있고 " + gsym("MN", "seg") + "=18 m, " + gsym("MP", "seg") + "=7 m입니다. 두 점 P, N 사이의 거리를 구하세요. 정답은 숫자만 입력하세요.",
    answer: "11",
    numKind: "int",
    unitLabel: "m",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>M, P, N이 이 순서이므로 전체 선분 MN은 MP와 PN으로 나뉘어요. 따라서 PN=MN−MP=18−7=<b>11 m</b>이고, 두 점 P, N 사이의 거리는 선분 PN의 길이인 11 m예요.<span class='xh'>헷갈림 격파</span>18을 그대로 쓰면 M과 N 사이의 거리를 답한 것이고, 7은 M과 P 사이의 거리예요. 18+7은 부분을 전체에 다시 더한 값이라 점의 순서와 맞지 않아요. 직선 전체에는 길이를 붙일 수 없지만 두 끝점이 정해진 선분의 길이는 정할 수 있어요. 먼저 어느 선분이 전체인지 확인하고 사이점 P가 나눈 한 부분을 빼세요.",
    core: "사이점 P가 나눈 전체 선분에서 MP를 빼 PN의 길이를 구한다.",
  },
  {
    id: "m1u4e026",
    lessonId: L,
    type: "num",
    prompt: "한 직선 위에 서로 다른 다섯 점 A, B, C, D, E가 이 순서로 있습니다. 이 점 중 하나를 시작점으로 하고 다른 점을 지나는 서로 다른 반직선은 모두 몇 개인가요? 정답은 숫자만 입력하세요.",
    answer: "8",
    numKind: "int",
    unitLabel: "개",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>끝점 A에서 시작하는 반직선은 오른쪽 방향 1개, 끝점 E에서는 왼쪽 방향 1개예요. 안쪽 점 B, C, D에서는 왼쪽과 오른쪽으로 각각 1개씩이므로 2개씩 생겨요. 따라서 1+2+2+2+1=<b>8개</b>예요.<span class='xh'>헷갈림 격파</span>지나는 점을 바꿀 때마다 새 반직선으로 세면 안 돼요. 예를 들어 반직선 BA와 BC는 방향이 다르지만, 반직선 BC와 BD는 시작점과 방향이 같아 같은 반직선이에요. 직선이나 선분의 개수를 세는 문제로 바꾸지도 말고, 시작점과 뻗는 방향 두 가지를 함께 비교하세요.",
    core: "다섯 공선점에서 시작점과 방향이 다른 반직선은 모두 8개다.",
  },
  {
    id: "m1u4e027",
    lessonId: L,
    type: "num",
    prompt: "점 C는 " + gsym("AE", "seg") + "의 중점입니다. " + gsym("AC", "seg") + "=7 cm일 때, " + gsym("CE", "seg") + "의 길이를 구하세요. 정답은 숫자만 입력하세요.",
    answer: "7",
    numKind: "int",
    unitLabel: "cm",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>C가 " +
      gsym("AE", "seg") +
      "의 중점이므로 C는 A와 E 사이에 있고, 두 부분의 길이는 AC=CE예요. AC가 7 cm이므로 같은 길이인 CE도 <b>7 cm</b>예요. 입력칸에는 숫자 7만 적어요.<span class='xh'>헷갈림 격파</span>14라고 답하면 전체 AE의 길이를 구한 것이고, 문제는 한쪽 부분 CE를 물었어요. 3.5는 주어진 한쪽 길이 7을 다시 반으로 나눈 값이라 중점 조건을 한 번 더 적용한 오류예요. 중점은 전체를 반으로 나눈다는 뜻이면서, 동시에 양쪽 두 선분의 길이가 같다는 뜻이에요. 이미 한쪽 길이가 주어졌다면 계산보다 먼저 반대쪽에 같은 값을 옮기면 돼요.",
    core: "중점 C이면 AC=CE이므로 CE=7 cm이다.",
  },
  {
    id: "m1u4e028",
    lessonId: L,
    type: "num",
    prompt: "그림과 같이 한 직선 위에 A, C, E, G가 있습니다. C는 " + gsym("AE", "seg") + "의 중점이고, E는 " + gsym("CG", "seg") + "의 중점입니다. " + gsym("AG", "seg") + "=21 cm일 때, " + gsym("AE", "seg") + "의 길이를 구하세요. 정답은 숫자만 입력하세요.",
    figure: mExamPointsLineFig({ pts: ["A", "C", "E", "G"], segs: [{ from: 0, to: 3, label: "21 cm" }] }),
    answer: "14",
    numKind: "int",
    unitLabel: "cm",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>C가 " +
      gsym("AE", "seg") +
      "의 중점이므로 AC=CE이고, E가 " +
      gsym("CG", "seg") +
      "의 중점이므로 CE=EG예요. 따라서 AC, CE, EG는 모두 같은 길이예요. AG=21 cm를 세 부분으로 나누면 한 부분은 7 cm이고, AE는 AC+CE이므로 7+7 = <b>14 cm</b>예요.<span class='xh'>헷갈림 격파</span>7은 같은 세 부분 중 하나의 길이에서 멈춘 값이에요. 10.5는 C가 AG 전체의 중점이라고 잘못 본 값이고, 21은 전체 AG를 그대로 쓴 값이에요. 중점이 어느 선분의 중점인지 각각 확인한 뒤 같은 길이 관계를 이어야 해요.",
    core: "겹친 중점 관계로 AC=CE=EG를 만든 뒤 AE를 구한다.",
  },
  {
    id: "m1u4e029",
    lessonId: L,
    type: "num",
    prompt: "그림과 같이 점 M은 " + gsym("AG", "seg") + "의 중점이고, 점 N은 " + gsym("MG", "seg") + "의 중점입니다. " + gsym("NG", "seg") + "=9 cm일 때, " + gsym("AM", "seg") + "의 길이를 구하세요. 정답은 숫자만 입력하세요.",
    figure: mExamPointsLineFig({ pts: ["A", "M", "N", "G"], segs: [{ from: 2, to: 3, label: "9 cm" }] }),
    answer: "18",
    numKind: "int",
    unitLabel: "cm",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>N이 " +
      gsym("MG", "seg") +
      "의 중점이므로 MN=NG=9 cm이고, MG=9+9 = 18 cm예요. 다시 M이 " +
      gsym("AG", "seg") +
      "의 중점이므로 AM=MG예요. 따라서 " +
      gsym("AM", "seg") +
      "의 길이는 <b>18 cm</b>예요.<span class='xh'>헷갈림 격파</span>9는 안쪽 선분 MG의 절반인 NG에서 멈춘 값이에요. 36은 AG 전체의 길이로, 문제에서 요구한 AM보다 두 배 커요. 중점이 두 번 나오지만 같은 선분을 연속으로 반씩 나누는 상황만은 아니에요. 먼저 N이 나누는 MG를 복원한 뒤, M이 나누는 AG의 두 부분 AM과 MG가 같다는 관계를 사용해야 해요. 작은 선분에서 바깥쪽으로 차례로 올라가요.",
    core: "NG로 MG를 복원하고, AG의 중점 관계 AM=MG를 쓴다.",
  },
  {
    id: "m1u4e030",
    lessonId: L,
    type: "word",
    prompt: "선분을 길이가 같은 두 선분으로 나누는 점을 무엇이라고 하나요? 알맞은 말을 고르세요.",
    answer: "중점",
    bank: ["중점", "교점", "수선의 발", "꼭짓점", "시작점", "교선", "직선", "평면"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>한 선분 위에서 양 끝점까지의 거리가 같아지도록 선분을 두 부분으로 나누는 점을 <b>중점</b>이라고 해요. 점 M이 선분 AB의 중점이면 M은 AB 위에 있고 AM=MB예요.<span class='xh'>오답 하나씩 격파</span>'교점'은 두 선이 만나는 점이고, '수선의 발'은 한 점에서 직선에 내린 수선과 그 직선이 만나는 점이에요. '꼭짓점'은 변이나 모서리가 만나는 점, '시작점'은 반직선이 출발하는 점이에요. '교선'은 두 면이 만나 생기는 선이라 점이 아니고, '직선'과 '평면'도 점의 이름이 아니에요. 중점은 반드시 어느 선분의 중점인지와 양쪽 길이가 같은지를 함께 확인해요.",
    core: "선분을 길이가 같은 두 부분으로 나누는 점은 중점이다.",
  },
];
