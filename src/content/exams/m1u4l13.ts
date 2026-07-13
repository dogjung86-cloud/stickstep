// 중1 수학 Ⅳ. 기본 도형: 단원 종합 평가 풀, 레슨 13 합동의 활용(m1u4e185~m1u4e200).
// 유형 9(mcq+multi)/5(num)/2(word), diff 6/7/3. offset·cross·reflect 측량 구조를 서로 다르게 설계했다.
// 교과서의 문장·수치·도형 배치는 복제하지 않았고, 모든 위치 관계는 지문에서 완전히 명시했다.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import { m4SurveyFig } from "../../ui/examFiguresMath";

const L = "m1u4l13";

export const POOL_M1U4L13: ExamItem[] = [
  {
    id: "m1u4e185",
    lessonId: L,
    type: "mcq",
    prompt:
      "무대 위쪽의 손이 닿지 않는 받침과 바닥의 받침으로 만든 " +
      gsym("ABC", "tri") +
      "와 " +
      gsym("DEF", "tri") +
      "가 합동이고, " +
      gsym("ABC", "tri") +
      "≡" +
      gsym("DEF", "tri") +
      "예요. " +
      gsym("ABC", "angle") +
      "=36°일 때 " +
      gsym("DEF", "angle") +
      "의 크기는?",
    options: ["54°", "36°", "68°", "72°", "알 수 없다"],
    answer: 1,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>합동 기호의 순서에서 A와 D, B와 E, C와 F가 각각 대응해요. 따라서 " +
      gsym("ABC", "angle") +
      "와 " +
      gsym("DEF", "angle") +
      "는 대응각이고, 합동인 두 삼각형의 대응각은 크기가 같으므로 답은 <b>36°</b>예요.<span class='xh'>오답 하나씩 격파</span>54°와 68°는 다른 문항에서 나올 수 있는 각을 근거 없이 가져온 값이에요. 72°는 36을 두 배 한 값이지만 합동에서는 대응각을 두 배 하지 않아요. '알 수 없다'도 틀려요. 합동이라는 조건과 꼭짓점의 대응 순서가 모두 주어졌으므로 직접 재기 어려운 위쪽 각도 바닥의 대응각으로 정확히 알 수 있어요.",
    core: "합동 기호의 순서로 대응각을 찾으면 그 크기는 같다.",
  },
  {
    id: "m1u4e186",
    lessonId: L,
    type: "mcq",
    prompt:
      "연못 밖의 두 점 P, Q에서 연못 안 표지 X를 보았어요. 안전한 쪽에 점 Y를 잡아 " +
      gsym("XPQ", "angle") +
      "=" +
      gsym("YPQ", "angle") +
      ", " +
      gsym("XQP", "angle") +
      "=" +
      gsym("YQP", "angle") +
      "가 되게 했어요. " +
      gsym("XPQ", "tri") +
      "와 " +
      gsym("YPQ", "tri") +
      "가 합동인 조건은?",
    figure: m4SurveyFig({ mode: "reflect", labels: ["P", "Q", "X", "Y"] }),
    options: ["SSS 합동", "두 각만 같으므로 합동", "SAS 합동", "ASA 합동", "AAA 합동"],
    answer: 3,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>두 삼각형은 " +
      gsym("PQ", "seg") +
      "를 함께 쓰므로 한 변이 같고, 그 변의 양 끝에 있는 P와 Q의 각도 각각 같아요. 한 변과 그 양 끝 각이 각각 같으므로 <b>ASA 합동</b>이에요.<span class='xh'>오답 하나씩 격파</span>SSS는 세 변의 같음이 필요하지만 여기서는 한 변만 확인했어요. '두 각만 같으므로 합동'과 AAA는 크기가 같은 삼각형을 하나로 정할 수 없으므로 합동의 근거가 아니에요. SAS는 두 변과 그 끼인각이 필요한데, 두 번째 변의 같음은 주어지지 않았어요. 공통변은 숨어 있는 조건이므로 각 두 쌍과 함께 세어야 해요.",
    core: "공통변과 그 양 끝 각 두 쌍이 같으면 ASA 합동이다.",
  },
  {
    id: "m1u4e187",
    lessonId: L,
    type: "multi",
    prompt: "합동을 이용해 직접 잴 수 없는 거리를 구할 때 옳은 설명을 <b>모두</b> 고르세요.",
    options: [
      "두 삼각형이 함께 쓰는 공통변은 같은 변 한 쌍으로 사용할 수 있다",
      "그림에서 모양이 비슷해 보이면 별도 조건 없이 합동이다",
      "두 직선이 만나 생긴 맞꼭지각은 같은 각 한 쌍으로 사용할 수 있다",
      "넓이가 같은 두 삼각형은 언제나 합동이다",
      "합동이 확인되면 땅에서 잰 대응변의 길이로 접근하기 어려운 변의 길이를 알 수 있다",
    ],
    answer: [0, 2, 4],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>공통변은 두 삼각형이 실제로 함께 쓰는 같은 선분이고, 맞꼭지각은 성질에 따라 크기가 같아요. 이런 조건으로 합동을 확인하면 대응변의 길이가 같으므로 안전한 곳의 대응변을 재어 접근하기 어려운 거리를 알 수 있어요.<span class='xh'>오답 하나씩 격파</span>모양이 비슷해 보인다는 것은 눈으로 받은 인상일 뿐 SSS, SAS, ASA 가운데 어느 조건도 보장하지 않아요. 넓이가 같아도 길쭉한 삼각형과 넓게 벌어진 삼각형처럼 모양이 서로 다를 수 있으므로 합동이라고 할 수 없어요. 측량에서는 보이는 모습보다 실제로 같은 변과 각의 근거를 먼저 확인해야 해요.",
    core: "공통변·맞꼭지각으로 합동을 확인하고 대응변을 잰다.",
  },
  {
    id: "m1u4e188",
    lessonId: L,
    type: "num",
    prompt:
      "운동장 출입 제한 구간을 포함한 " +
      gsym("KLM", "tri") +
      "과 안전한 통로에 만든 " +
      gsym("RST", "tri") +
      "에 대하여 " +
      gsym("KLM", "tri") +
      "≡" +
      gsym("RST", "tri") +
      "예요. " +
      "점 U가 " + gsym("RT", "seg") + " 위에 있고 RU=7 m, UT=11 m일 때, 대응변인 " +
      gsym("KM", "seg") +
      "의 길이를 구하세요.",
    answer: "18",
    numKind: "int",
    unitLabel: "m",
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>U가 선분 RT 위에 있으므로 RT=RU+UT=7+11=18 m예요. 합동 기호의 순서를 읽으면 K와 R, L과 S, M과 T가 각각 대응해요. 그러므로 " +
      gsym("KM", "seg") +
      "의 대응변은 " +
      gsym("RT", "seg") +
      "예요. 합동인 두 삼각형의 대응변은 길이가 같으므로 KM=RT=<b>18 m</b>예요.<span class='xh'>이런 실수를 조심해요</span>11−7은 U가 선분 밖에 있을 때의 차처럼 처리한 값이에요. 먼저 U가 RT 위의 사이점이므로 두 부분을 더해야 해요. 또 문자들이 가까이 놓였다는 이유로 KM에 RS를 대응시키면 안 돼요. 합동 기호에서 첫째와 셋째 꼭짓점의 짝을 모두 확인한 뒤 계산한 전체 길이를 대응변에 옮기세요.",
    core: "RT의 두 부분을 더해 18을 구하고 합동의 대응변 KM에 옮긴다.",
  },
  {
    id: "m1u4e189",
    lessonId: L,
    type: "num",
    prompt:
      "두 직선 " +
      gsym("AD", "line") +
      "와 " +
      gsym("BC", "line") +
      "가 점 O에서 만나요. " +
      gsym("OA", "seg") +
      "=" +
      gsym("OC", "seg") +
      ", " +
      gsym("OB", "seg") +
      "=" +
      gsym("OD", "seg") +
      "이고 " +
      gsym("AOB", "angle") +
      "와 " +
      gsym("COD", "angle") +
      "는 맞꼭지각이에요. 땅에서 잰 " +
      gsym("CD", "seg") +
      "의 길이가 24 m일 때, 접근하기 어려운 " +
      gsym("AB", "seg") +
      "의 길이를 구하세요.",
    figure: m4SurveyFig({ mode: "cross", labels: ["A", "B", "O", "C", "D"] }),
    answer: "24",
    numKind: "int",
    unitLabel: "m",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>" +
      gsym("OA", "seg") +
      "=" +
      gsym("OC", "seg") +
      ", " +
      gsym("OB", "seg") +
      "=" +
      gsym("OD", "seg") +
      "이고 그 사이의 " +
      gsym("AOB", "angle") +
      "와 " +
      gsym("COD", "angle") +
      "는 맞꼭지각이므로 크기가 같아요. 따라서 " +
      gsym("AOB", "tri") +
      "와 " +
      gsym("COD", "tri") +
      "는 SAS 합동이에요. 대응은 A와 C, B와 D이므로 " +
      gsym("AB", "seg") +
      "=" +
      gsym("CD", "seg") +
      "=<b>24 m</b>예요.<span class='xh'>이런 실수를 조심해요</span>OA와 OC를 더해 48을 만드는 문제가 아니에요. 그 두 선분은 합동을 밝히는 조건이고, 실제로 옮겨 읽을 거리는 대응변 AB와 CD예요. 맞꼭지각도 두 변 사이의 끼인각인지 확인해야 SAS를 바르게 적용할 수 있어요. 조건과 결론을 나누어 읽어요.",
    core: "두 변과 맞꼭지각으로 SAS 합동을 보인 뒤 대응변을 잰다.",
  },
  {
    id: "m1u4e190",
    lessonId: L,
    type: "mcq",
    prompt:
      "접근할 수 없는 구간을 포함한 " +
      gsym("APB", "tri") +
      "와 통로에 만든 " +
      gsym("CQD", "tri") +
      "에 대하여 " +
      gsym("APB", "tri") +
      "≡" +
      gsym("CQD", "tri") +
      "예요. 직접 잴 수 없는 " +
      gsym("AB", "seg") +
      "의 길이를 알려면 어느 선분을 재어야 할까요?",
    options: [gsym("CQ", "seg"), gsym("QD", "seg"), gsym("AP", "seg"), gsym("PB", "seg"), gsym("CD", "seg")],
    answer: 4,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>합동 기호의 순서에서 A와 C, P와 Q, B와 D가 대응해요. 따라서 A와 B를 이은 " +
      gsym("AB", "seg") +
      "에 대응하는 선분은 C와 D를 이은 " +
      gsym("CD", "seg") +
      "예요. 합동인 두 삼각형의 대응변은 같으므로 CD를 재면 돼요.<span class='xh'>오답 하나씩 격파</span>" +
      gsym("CQ", "seg") +
      "는 AP, " +
      gsym("QD", "seg") +
      "는 PB에 대응해요. " +
      gsym("AP", "seg") +
      "와 " +
      gsym("PB", "seg") +
      "는 첫 번째 삼각형의 변이므로 접근하기 어려운 구간을 대신 재려는 목적에 맞지 않아요. 대응 순서를 거꾸로 읽지 말고 양 끝점의 짝을 각각 확인해야 해요. 두 글자를 모두 짝지어 보세요.",
    core: "A와 C, B와 D가 각각 대응하므로 AB의 대응변은 CD이다.",
  },
  {
    id: "m1u4e191",
    lessonId: L,
    type: "num",
    prompt:
      "건물 뒤쪽의 접근 불가 지지선을 포함한 " +
      gsym("KLM", "tri") +
      "과 앞마당의 " +
      gsym("RST", "tri") +
      "가 SSS 합동이고, K와 R, L과 S, M과 T가 각각 대응해요. 점 U가 " + gsym("ST", "seg") + "의 중점이고 SU=13.5 m일 때 " +
      gsym("LM", "seg") +
      "의 길이를 구하세요.",
    answer: "27",
    numKind: "int",
    unitLabel: "m",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>U가 선분 ST의 중점이므로 SU=UT이고 ST=2×SU=2×13.5=<b>27 m</b>예요. L과 S, M과 T가 각각 대응하므로 " +
      gsym("LM", "seg") +
      "의 대응변은 " +
      gsym("ST", "seg") +
      "예요. SSS 합동이 확인되었으므로 LM=ST=27 m예요.<span class='xh'>이런 실수를 조심해요</span>13.5를 그대로 적으면 선분 ST의 절반에서 멈춘 것이고, 13.5÷2는 중점 조건을 반대로 적용한 값이에요. U가 중점이므로 같은 두 부분을 더해야 해요. 또한 LM을 RT와 짝짓지 않도록 L과 M의 대응점 S와 T를 각각 확인하세요. 중점으로 안전한 쪽의 전체 변을 먼저 구한 뒤 합동의 대응변 성질을 적용해요.",
    core: "중점으로 ST=27을 구하고 SSS 합동의 대응변 LM에 옮긴다.",
  },
  {
    id: "m1u4e192",
    lessonId: L,
    type: "word",
    prompt:
      "빈칸에 알맞은 말을 고르세요.<br><br>합동 기호로 두 삼각형을 나타낼 때에는 서로 짝이 되는 꼭짓점끼리 같은 자리에 오도록 글자의 ( )를 맞춰 써야 해요.",
    answer: "순서",
    bank: ["순서", "색", "크기", "굵기", "간격", "높이", "넓이", "방향"],
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>합동 기호에서는 서로 대응하는 꼭짓점을 같은 위치에 적도록 글자의 <b>순서</b>를 맞춰야 해요. 이 순서를 읽으면 대응변과 대응각을 정확히 찾을 수 있어요.<span class='xh'>오답 하나씩 격파</span>색, 굵기, 간격은 그림을 보기 쉽게 하는 표현일 뿐 대응 관계를 정하지 않아요. 삼각형을 크게 그렸는지, 어느 방향으로 돌렸는지도 합동 기호의 짝을 바꾸지 않아요. 높이와 넓이는 도형의 수치이고 글자를 배열하는 규칙이 아니에요. 첫째 꼭짓점끼리, 둘째 꼭짓점끼리, 셋째 꼭짓점끼리 차례로 짝지어 두 끝점의 대응을 확인하세요.",
    core: "합동 기호는 대응하는 꼭짓점의 순서를 맞춰 쓴다.",
  },
  {
    id: "m1u4e193",
    lessonId: L,
    type: "mcq",
    prompt:
      "조명이 닿지 않는 무대 위 " +
      gsym("TUV", "tri") +
      "와 바닥에 만든 " +
      gsym("RSP", "tri") +
      "에 대하여 " +
      gsym("TUV", "tri") +
      "≡" +
      gsym("RSP", "tri") +
      "예요. 무대 삼각형에서 " + gsym("UTV", "angle") + "=48°, " + gsym("TVU", "angle") + "=78°일 때 " +
      gsym("TUV", "angle") +
      "의 크기는?",
    options: ["27°", "36°", "54°", "68°", "108°"],
    answer: 2,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>삼각형 TUV의 세 각의 합은 180°이므로 ∠TUV=180−48−78=<b>54°</b>예요. 합동식에서 U와 S가 대응하므로 바닥의 대응각 ∠RSP도 같은 54°가 돼요.<span class='xh'>오답 하나씩 격파</span>48°와 78° 중 하나를 그대로 고르면 묻지 않은 꼭짓점의 각을 답한 것이에요. 두 각을 더한 126°는 세 번째 각이 아니라 이미 알려진 두 각의 합이고, 180에서 한 각만 빼면 다른 알려진 각을 놓쳐요. 먼저 한 삼각형 안에서 남은 각을 구한 뒤 합동의 대응 순서로 값이 옮겨지는지 확인하세요.",
    core: "삼각형의 두 각으로 세 번째 각 54를 구하고 대응각에도 적용한다.",
  },
  {
    id: "m1u4e194",
    lessonId: L,
    type: "num",
    prompt:
      "산책로 밖의 " + gsym("KLM", "tri") + "과 안전 구역의 " + gsym("RST", "tri") + "가 SSS 합동이고 K와 R, L과 S, M과 T가 각각 대응해요. 안전 구역의 삼각형 RST의 둘레가 74 m이고 RS=19 m, RT=23 m일 때 접근하기 어려운 " + gsym("LM", "seg") + "의 길이를 구하세요.",
    answer: "32",
    numKind: "int",
    unitLabel: "m",
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>안전 구역의 삼각형에서 ST=74−19−23=<b>32 m</b>예요. L과 S, M과 T가 각각 대응하므로 접근하기 어려운 LM은 안전 구역의 ST와 대응하고, SSS 합동의 대응변 길이는 같아 LM=32 m예요.<span class='xh'>이런 실수를 조심해요</span>19+23=42는 이미 아는 두 변의 합이고, 74−42를 해야 남은 변이 나와요. 안전 구역에서 구한 ST를 그대로 답하려면 먼저 LM과 ST가 대응한다는 근거를 확인해야 해요. 합동이라고 해서 둘레를 둘로 나누거나 세 변이 모두 같다고 볼 수도 없어요. 계산과 대응을 차례로 적용하세요.",
    core: "안전 구역에서 ST=32를 구하고 SSS 합동의 대응변 LM에 옮긴다.",
  },
  {
    id: "m1u4e195",
    lessonId: L,
    type: "multi",
    prompt:
      "점 X와 Y가 직선 PQ의 서로 반대쪽에 있어요. " +
      gsym("XPQ", "angle") +
      "=" +
      gsym("YPQ", "angle") +
      "이고 두 삼각형은 " +
      gsym("PQ", "seg") +
      "를 공통변으로 써요. " +
      gsym("XPQ", "tri") +
      "와 " +
      gsym("YPQ", "tri") +
      "의 합동을 확정할 수 있는 추가 정보를 <b>모두</b> 고르세요.",
    options: [
      gsym("XQP", "angle") + "=" + gsym("YQP", "angle"),
      gsym("PX", "seg") + "=" + gsym("PY", "seg"),
      gsym("QX", "seg") + "=" + gsym("QY", "seg"),
      "두 삼각형의 넓이의 합이 80 cm²이다",
      "두 삼각형이 서로 반대쪽에 비슷한 모양으로 놓여 있다",
    ],
    answer: [0, 1],
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>첫째 정보를 더하면 공통변 PQ와 그 양 끝 각 두 쌍이 같아 ASA 합동이에요. 둘째 정보를 더하면 PX=PY, 공통변 PQ, 그리고 그 사이의 P에서의 각이 같아 SAS 합동이에요. 둘 다 충분한 추가 정보죠.<span class='xh'>오답 하나씩 격파</span>QX=QY를 더하면 두 변과 그 사이가 아닌 P에서의 각이 주어진 꼴이라 SSS, SAS, ASA 어느 조건도 완성되지 않아요. 두 넓이의 합만 알면 각 삼각형의 넓이가 서로 같은지는 알 수 없으므로 합동을 보장하지 못해요. 반대쪽에 비슷하게 놓여 보인다는 말도 실제 길이나 각의 같음을 보장하지 않아요. 새 정보가 기존 조건과 합쳐져 합동 조건 하나를 완성하는지 자리까지 확인해야 해요.",
    core: "기존 공통변·P각에 Q각을 더하면 ASA, PX=PY를 더하면 SAS이다.",
  },
  {
    id: "m1u4e196",
    lessonId: L,
    type: "word",
    prompt:
      "빈칸에 알맞은 말을 고르세요.<br><br>직접 재기 어려운 거리나 각을 여러 조건과 도구를 이용해 알아내는 활동을 ( )이라고 해요.",
    answer: "측량",
    bank: ["측량", "작도", "합동", "평행", "수직", "꼬인 위치", "교선", "수직이등분"],
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>직접 다가가기 어렵거나 바로 재기 힘든 거리와 각을 알맞은 조건과 도구를 이용해 알아내는 활동을 <b>측량</b>이라고 해요. 이 단원에서는 합동인 삼각형의 대응변이 같다는 성질을 측량에 이용해요.<span class='xh'>오답 하나씩 격파</span>'작도'는 눈금 없는 자와 컴퍼스로 조건에 맞는 도형을 그리는 활동이고, '합동'은 두 도형의 관계예요. 평행과 수직은 직선의 위치 관계, 꼬인 위치는 공간의 두 직선 관계예요. 교선은 두 면이 만나 생기는 선이고 수직이등분은 선분을 수직으로 같은 두 부분으로 나누는 성질이라 거리 알아내기 활동의 이름이 아니에요.",
    core: "직접 재기 어려운 거리나 각을 조건과 도구로 알아내는 활동은 측량이다.",
  },
  {
    id: "m1u4e197",
    lessonId: L,
    type: "mcq",
    prompt:
      "다리 아래의 " +
      gsym("ABC", "tri") +
      "와 점검 통로의 " +
      gsym("DEF", "tri") +
      "에서 " +
      gsym("AB", "seg") +
      "=" +
      gsym("DE", "seg") +
      ", " +
      gsym("BC", "seg") +
      "=" +
      gsym("EF", "seg") +
      ", " +
      gsym("CA", "seg") +
      "=" +
      gsym("FD", "seg") +
      "가 확인되었어요. " +
      gsym("ABC", "angle") +
      "=68°일 때 " +
      gsym("DEF", "angle") +
      "의 크기를 알 수 있는 근거로 가장 알맞은 것은?",
    options: [
      "세 변이 각각 같아 SSS 합동이고, 두 각은 대응각이므로 크기가 같다",
      "두 각이 그림에서 비슷해 보여서 크기가 같다",
      "세 변의 길이를 모두 더하면 각의 크기가 나온다",
      "넓이를 재면 대응각의 크기가 항상 정해진다",
      "세 각만 같다는 AAA 합동을 적용한다",
    ],
    answer: 0,
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>AB=DE, BC=EF, CA=FD이므로 세 변이 각각 같아 두 삼각형은 <b>SSS 합동</b>이에요. 대응은 A와 D, B와 E, C와 F이므로 " +
      gsym("ABC", "angle") +
      "와 " +
      gsym("DEF", "angle") +
      "는 대응각이고 둘 다 68°예요.<span class='xh'>오답 하나씩 격파</span>그림이 비슷해 보인다는 인상은 합동의 근거가 아니에요. 변의 길이를 더한 값으로 각의 크기를 구할 수도 없어요. 넓이가 같다는 정보만으로 대응각이 정해지지 않으며, 이 문제에는 넓이도 주어지지 않았어요. AAA는 합동 조건이 아니므로 사용할 수 없어요. 먼저 SSS로 합동을 확정한 뒤 대응각의 성질을 적용해야 해요.",
    core: "세 변으로 SSS 합동을 보이면 대응각 ABC와 DEF는 같다.",
  },
  {
    id: "m1u4e198",
    lessonId: L,
    type: "num",
    prompt:
      "접근할 수 없는 표지 X와 관측점 A, B로 만든 " +
      gsym("XAB", "tri") +
      "의 기준변 " +
      gsym("AB", "seg") +
      "를 다른 빈터의 " +
      gsym("CD", "seg") +
      "와 같게 만들고, 양 끝 각도 각각 같게 옮겨 " +
      gsym("XAB", "tri") +
      "≡" +
      gsym("YCD", "tri") +
      "가 되게 했어요. 빈터에서 CY=45 m로 재었을 때 AX의 길이를 구하세요.",
    figure: m4SurveyFig({ mode: "offset", labels: ["X", "A", "B", "Y", "C", "D"] }),
    answer: "45",
    numKind: "int",
    unitLabel: "m",
    diff: 2,
    explain:
      "<span class='xh'>정답 풀이</span>AB=CD이고 두 기준변의 양 끝 각을 각각 같게 옮겼으므로 두 삼각형은 ASA 합동이에요. 합동식의 순서에서 X와 Y, A와 C, B와 D가 대응하므로 " +
      gsym("AX", "seg") +
      "와 " +
      gsym("CY", "seg") +
      "가 대응변이에요. 따라서 AX=CY=<b>45 m</b>예요.<span class='xh'>이런 실수를 조심해요</span>AB와 CD는 합동을 만드는 기준변이지 구하려는 거리가 아니에요. 또 X와 Y만 대응한다고 보고 AX를 DY와 짝지으면 끝점 A의 대응점 C를 놓친 것이에요. 두 끝점의 대응을 모두 확인한 뒤 빈터에서 잰 길이를 그대로 옮겨야 해요.",
    core: "분리된 기준변과 양 끝 각으로 ASA 합동을 만들면 AX=CY이다.",
  },
  {
    id: "m1u4e199",
    lessonId: L,
    type: "mcq",
    prompt:
      "강 건너의 " + gsym("ABC", "tri") + "와 안전한 땅의 " + gsym("DEF", "tri") + "에서 " + gsym("AB", "seg") + "=" + gsym("DE", "seg") + ", " + gsym("BAC", "angle") + "=" + gsym("EDF", "angle") + "인 것만 확인했어요. " + gsym("BC", "seg") + "=" + gsym("EF", "seg") + "라고 결론 내릴 수 있을까요?",
    options: [
      "변 한 쌍만으로 SSS 합동이므로 결론 낼 수 있다",
      "각 한 쌍만으로 ASA 합동이므로 결론 낼 수 있다",
      "두 조건의 수가 같으므로 언제나 합동이라 결론 낼 수 있다",
      "합동 조건이 아직 완성되지 않았으므로 결론 낼 수 없다",
      "그림에서 두 선분이 비슷하게 보이면 결론 낼 수 있다",
    ],
    answer: 3,
    diff: 3,
    explain:
      "<span class='xh'>정답 풀이</span>현재 확인한 것은 변 AB=DE 한 쌍과 그 끝의 각 ∠A=∠D 한 쌍뿐이에요. SSS, SAS, ASA 가운데 어느 조건도 완성되지 않았으므로 두 삼각형의 합동과 BC=EF를 결론 낼 수 없어요.<span class='xh'>오답 하나씩 격파</span>변 한 쌍으로는 SSS가 되지 않고, 각 한 쌍으로는 ASA가 되지 않아요. 조건이 각각 하나씩 있다는 이유로 필요한 세 요소가 채워지는 것도 아니에요. 그림에서 선분이 비슷해 보이는 것은 정확한 길이 조건이 아니므로 측량의 근거로 쓸 수 없어요. 다른 한 변과 끼인각 또는 한 변의 양 끝각처럼 합동 조건을 완성할 정보가 더 필요해요.",
    core: "변 한 쌍과 각 한 쌍만으로는 합동과 다른 변의 같음을 확정할 수 없다.",
  },
  {
    id: "m1u4e200",
    lessonId: L,
    type: "mcq",
    prompt: "합동을 이용한 거리 재기에서 안전한 땅 위의 한 선분을 재어 접근하기 어려운 거리로 사용할 수 있는 까닭은?",
    options: [
      "합동인 두 삼각형은 모든 변의 길이를 더한 값만 같다",
      "안전한 곳에서 잰 선분은 어느 선분과도 길이가 같다",
      "그림에 같은 색으로 그린 선분은 조건 없이 길이가 같다",
      "합동인 두 삼각형의 대응각은 언제나 길이가 같다",
      "합동인 두 삼각형의 대응변은 길이가 같다",
    ],
    answer: 4,
    diff: 1,
    explain:
      "<span class='xh'>정답 풀이</span>합동인 두 삼각형은 완전히 포개지므로 서로 짝이 되는 <b>대응변의 길이가 같아요</b>. 그래서 접근하기 어려운 선분의 정확한 대응변을 안전한 땅에 만들고 그 길이를 재면, 원래 거리도 같은 값으로 알 수 있어요.<span class='xh'>오답 하나씩 격파</span>변의 길이를 모두 더한 값이 같다는 사실만으로 어느 한 변의 길이를 옮길 수 있는 것은 아니에요. 안전한 곳에 있다는 이유만으로 아무 선분이나 같아지지도 않아요. 같은 색은 그림을 구별하는 표시일 뿐 길이 조건이 아니에요. 대응각은 크기가 같은 것이지 '길이'가 같은 대상이 아니에요. 반드시 합동과 정확한 대응 관계를 함께 확인해야 해요.",
    core: "합동인 두 삼각형의 대응변은 길이가 같아 측량에 쓸 수 있다.",
  },
];
