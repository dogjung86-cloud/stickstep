// m1u4 v2 확대 저작 E · L12 합동(13) + L13 합동의 활용(14) = 27문항.
// 정본 설계표 qa/m1u4-v2-blueprint.md §3의 비파일럿 슬롯. 관행은 rest-a 헤더와 동일.
// 설계 조정: [슬롯 200] §3의 "∠PBD+∠PDB(=60)"은 기하 검산과 어긋남 · ∠BPD는 ㉮(=60)의 맞꼭지각이라
//  두 각의 합은 180−60=120. 답 120으로 정정(196의 ∠BFD=120과 값이 겹치나 서로 다른 그림·유형(num↔mcq)이라 수용).
// [슬롯 190·193] 측량 num 수치는 §4 "저작 시 유일" 슬롯 · 34 m·57 m로 확정(L13 앵커 52·68·7 회피).
import type { ExamItem } from "../src/content/exams/types";
import { gsym } from "../src/ui/geoKit";
import {
  m4CongruenceExamFig,
  m4TriangleConditionFig,
  m4SurveyFig,
  mExamTwinEquiFig,
  mExamSquareOverlapFig,
} from "../src/ui/examFiguresMath";

export const POOL_M1U4V2_REST_E: ExamItem[] = [
  // ─ L12 합동 ─
  {
    // [슬롯 170] 검산: ≡ 순서 대응 A↔D·B↔E → DE=AB=11(그림 라벨 판독).
    id: "m1u4e170", lessonId: "m1u4l12", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}일 때, <i class='mv'>x</i>의 값을 구하세요.`,
    figure: m4CongruenceExamFig({
      left: ["A", "B", "C"], right: ["D", "E", "F"],
      sides: { left: ["11 cm", undefined, undefined], right: ["x cm", undefined, undefined] },
    }),
    answer: "11", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>합동 기호 ≡에 적힌 꼭짓점 순서가 대응표예요.<br>① △ABC≡△DEF에서 첫째끼리 A↔D, 둘째끼리 B↔E, 셋째끼리 C↔F<br>② 변 AB의 대응변은 DE<br>③ 대응변의 길이는 같으므로 x=AB=<b>11</b> ✓<span class='xh'>계산 실수 격파</span>대응을 그림의 위치 느낌으로 정하면 안 돼요. 오른쪽 삼각형이 뒤집혀 그려져 있어도 기준은 언제나 ≡ 기호의 글자 순서예요. DE를 BC나 CA와 짝지으면 엉뚱한 변의 길이를 옮기게 되죠. 요령은 두 삼각형 이름 아래에 A-D, B-E, C-F를 세로로 적어 대응표부터 만드는 거예요. 그다음 변 이름을 표에서 글자 단위로 번역(AB→DE)하면 실수가 원천 차단돼요. 대응각도 같은 표로 읽어요(∠A=∠D). 표 만들기 10초가 합동 단원 전체의 안전벨트랍니다.",
    core: "≡ 순서가 대응표! 위치 말고 글자로 짝짓기!",
  },
  {
    // [슬롯 171] 검산: 대응각 ∠A↔∠D · ∠A=74°(그림 라벨) → ∠D=74°.
    id: "m1u4e171", lessonId: "m1u4l12", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}이고 ∠A=74°일 때, ∠D의 크기는?`,
    figure: m4CongruenceExamFig({ left: ["A", "B", "C"], right: ["D", "E", "F"], apex: { left: "74°" } }),
    options: ["74°", "106°", "37°", "148°", "53°"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>합동인 두 삼각형에서 대응각의 크기는 서로 같아요.<br>① ≡ 순서에서 A↔D이므로 ∠A과 ∠D는 대응각<br>② ∠D=∠A=<b>74°</b> ✓<span class='xh'>오답 하나씩 격파</span>106°는 180−74로 보각을 구한 값인데, 대응각은 보각 관계가 아니라 복사 관계예요. 37°와 148°는 절반과 두 배로, 합동에서 각이 늘거나 줄어들 이유가 없죠. 53°는 근거 없는 값이고요. 합동은 모양과 크기가 완전히 같아 포개어지는 관계라, 대응하는 것끼리는 변이든 각이든 값이 그대로 옮겨져요. 계산할 것이 없다는 것 자체가 이 문제의 핵심 개념이에요. 다만 '어느 각과 어느 각이 대응인가'만은 반드시 ≡ 기호의 순서로 확인하세요. 위치나 느낌으로 짝을 지으면 다음 단계의 역산 문제부터 무너지기 시작해요.",
    core: "합동은 복사! 대응각은 계산 없이 그대로!",
  },
  {
    // [슬롯 172] 검산: ∠C=180−(52+71)=57(세 각 합), ∠F는 ∠C의 대응각 → 57.
    id: "m1u4e172", lessonId: "m1u4l12", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}이고 ∠A=52°, ∠B=71°일 때, ∠F의 크기는 몇 도인지 구하세요.`,
    figure: m4CongruenceExamFig({ left: ["A", "B", "C"], right: ["D", "E", "F"], apex: { left: "52°" } }),
    answer: "57", numKind: "int", unitLabel: "°", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>대응 찾기와 세 각의 합, 두 도구를 이어 써요.<br>① ≡ 순서에서 C↔F이므로 ∠F=∠C<br>② 삼각형 세 각의 크기의 합은 180°: ∠C=180°−52°−71°<br>③ ∠F=∠C=<b>57</b> ✓<span class='xh'>계산 실수 격파</span>∠F를 ∠A나 ∠B와 짝지어 52°나 71°를 답하면 대응표를 안 만든 거예요. F는 셋째 글자라 짝도 셋째 글자 C죠. 또 180−52−71 계산에서 123−71을 하다 받아내림 실수로 51이나 59가 나오기 쉬워요. 52+71=123을 먼저 만들고 180−123=57로 한 번에 빼면 안전해요. 검산: 세 각 52, 71, 57의 합이 정확히 180이 되는지 더해 보세요. 주어진 각이 왼쪽 삼각형에 있고 묻는 각이 오른쪽에 있어도, 대응만 정확하면 한쪽에서 구한 값을 그대로 건너보낼 수 있다는 것이 합동의 힘이에요.",
    core: "셋째는 셋째끼리! 모자란 각은 세 각의 합으로!",
  },
  {
    // [슬롯 173] 검산: 오른쪽 라벨 [E, F, D] · 마크 대응은 위↔위·왼변↔대응변 구조라 A↔E, B↔F, C↔D
    //  → 바른 표기는 △ABC≡△EFD.
    id: "m1u4e173", lessonId: "m1u4l12", type: "mcq",
    prompt: "그림과 같이 표시한 두 삼각형이 서로 합동일 때, 기호 ≡를 사용하여 바르게 나타낸 것은?",
    figure: m4CongruenceExamFig({ left: ["A", "B", "C"], right: ["E", "F", "D"] }),
    options: [
      `${gsym("ABC", "tri")}≡${gsym("EFD", "tri")}`,
      `${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}`,
      `${gsym("ABC", "tri")}≡${gsym("FDE", "tri")}`,
      `${gsym("ABC", "tri")}≡${gsym("EDF", "tri")}`,
      `${gsym("ABC", "tri")}≡${gsym("FED", "tri")}`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>≡ 표기는 대응하는 꼭짓점끼리 같은 자리에 서야 해요.<br>① 그림의 표시를 읽으면 같은 개수의 빗금 변끼리, 색칠된 각끼리 대응: A↔E, B↔F, C↔D<br>② A, B, C 순서로 썼으니 상대도 대응 순서대로 E, F, D<br>③ 따라서 <b>△ABC≡△EFD</b> ✓<span class='xh'>오답 하나씩 격파</span>△DEF라고 쓰면 알파벳이 예뻐 보이지만 A↔D, B↔E 대응이라는 거짓 정보를 담게 돼요. 표기는 미관이 아니라 대응 선언이거든요. 나머지 순서들도 최소 한 자리가 어긋나 있어요. 오른쪽 삼각형의 꼭짓점 이름이 뒤섞여 붙어 있을 때가 이 유형의 진짜 시험대인데, 요령은 그림의 마크(빗금 수, 각 표시)를 기준으로 짝을 먼저 확정하고 그 짝 순서로 받아 적는 거예요. 이름의 알파벳 순서는 아무 근거가 아니라는 것, 꼭 기억하세요.",
    core: "표기는 대응 선언! 알파벳순의 유혹을 끊어라!",
  },
  {
    // [슬롯 176] 무그림 ④(성질 진술 · 조건 상자 계열). 넓이·각·둘레 같음 ✓ / 역방향 두 문장 ✗.
    id: "m1u4e176", lessonId: "m1u4l12", type: "multi",
    prompt: "합동인 도형에 대한 설명으로 옳은 것을 모두 고르세요.",
    options: [
      "합동인 두 도형의 넓이는 서로 같아요",
      "합동인 두 삼각형의 대응각의 크기는 서로 같아요",
      "합동인 두 도형의 둘레의 길이는 서로 같아요",
      "넓이가 같은 두 삼각형은 항상 합동이에요",
      "둘레의 길이가 같은 두 삼각형은 항상 합동이에요",
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>합동이면 완전히 포개어지니 따라오는 것들이 있어요.<br>① 포개어지는 두 도형의 넓이는 당연히 같아요 ✓<br>② 대응각의 크기도 같아요 ✓<br>③ 둘레도 대응변 길이의 합이라 같아요 ✓<span class='xh'>오답 하나씩 격파</span>거꾸로 가는 두 문장이 함정이에요. 넓이가 같다고 합동일까요? 밑변 6에 높이 4인 삼각형과 밑변 8에 높이 3인 삼각형은 넓이가 12로 같지만 모양이 전혀 달라요. 둘레도 마찬가지로, 변의 조합이 다른 두 삼각형이 같은 둘레를 가질 수 있죠. '합동이면 넓이가 같다'는 참이지만 '넓이가 같으면 합동이다'는 거짓. 명제의 방향을 뒤집으면 참이 유지된다는 보장이 없다는 것이 이 문제의 진짜 주제예요. '항상'이 붙은 역방향 문장을 만나면 반례 하나를 만들어 보는 습관, 판별 문제의 최강 무기랍니다.",
    core: "합동→넓이·둘레 같음은 참, 뒤집으면 거짓!",
  },
  {
    // [슬롯 177] 검산: ∠F=180−(39+98)=43(오른쪽 세 각 합), ∠C는 ∠F의 대응각 → 43. 역방향 2단.
    id: "m1u4e177", lessonId: "m1u4l12", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}이고 ∠D=39°, ∠E=98°일 때, ∠C의 크기는 몇 도인지 구하세요.`,
    figure: m4CongruenceExamFig({ left: ["A", "B", "C"], right: ["D", "E", "F"], apex: { right: "39°" } }),
    answer: "43", numKind: "int", unitLabel: "°", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>이번엔 오른쪽 삼각형의 정보로 왼쪽 각을 구하는 역방향이에요.<br>① ≡ 순서에서 C↔F이므로 ∠C=∠F<br>② △DEF에서 세 각의 합: ∠F=180°−39°−98°=43°<br>③ ∠C=<b>43</b> ✓<span class='xh'>계산 실수 격파</span>∠C를 ∠D나 ∠E와 짝지어 39°나 98°를 옮기면 대응표 없이 푼 거예요. C는 셋째 글자, 짝은 F. 39+98=137을 만들고 180−137=43으로 한 번에 빼면 계산도 안전해요. 이 문제의 포인트는 정보가 어느 쪽 삼각형에 몰려 있든 상관없다는 거예요. 세 각의 합 180°는 양쪽 모두에서 성립하니, 정보가 많은 쪽에서 완성하고 대응으로 건너보내면 되죠. 검산: △DEF의 세 각 39, 98, 43의 합 180 ✓. 대응 한 걸음과 세 각의 합 한 걸음, 이 2단 콤보가 합동 역산 문제의 표준 리듬이에요.",
    core: "정보 많은 쪽에서 완성 → 대응으로 건너보내기!",
  },
  {
    // [슬롯 178] 검산: AB=DE·AC=DF 두 변 확보 · 합동이 되려면 끼인각 ∠A=∠D 필요(SAS).
    //  검산 C 반영: 구 문두(AB·BC)는 그림 틱(AB·AC)과 모순 · 그림 재사용 문항은 문두를 그림에 정렬,
    //  그림은 ss 모드(각 쐐기 = 정답 단서 제거).
    id: "m1u4e178", lessonId: "m1u4l12", type: "mcq",
    prompt: `그림과 같이 삼각형 ABC에서 두 변 AB, AC의 길이가 주어졌어요. 삼각형 DEF가 ${gsym("AB", "seg")}=${gsym("DE", "seg")}, ${gsym("AC", "seg")}=${gsym("DF", "seg")}를 만족할 때, ${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}가 되기 위해 더 필요한 조건은?`,
    figure: m4TriangleConditionFig({ a: "A", b: "B", c: "C", mode: "ss" }),
    options: [
      "∠A=∠D",
      "∠B=∠E",
      "∠C=∠F",
      `${gsym("AB", "seg")}=${gsym("DF", "seg")}`,
      "∠B=∠D",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 쌍의 대응변이 같을 때 합동을 완성하는 열쇠는 끼인각이에요.<br>① AB와 AC의 공통 끝점은 A, DE와 DF의 공통 끝점은 D<br>② 그 사이에 낀 각 <b>∠A=∠D</b>가 같으면 SAS 합동 ✓<span class='xh'>오답 하나씩 격파</span>∠B=∠E나 ∠C=∠F는 두 변 사이에 끼이지 않은 각이라, 조건을 만족하면서도 모양이 다른 두 삼각형이 생길 수 있어 합동을 보장하지 못해요. AB=DF는 대응이 어긋난 짝(AB의 짝은 DE)이라 새 정보가 되기는커녕 대응 관계를 흐트러뜨리는 함정이죠. ∠B=∠D도 대응이 뒤틀린 각 쌍이고요. 합동 조건 문제는 '무엇이 더 있으면 되나'를 묻는 척하지만, 사실은 끼인각을 정확히 짚는지를 묻는 문제예요. 두 변의 공통 끝점 찾기, 이 한 동작이 정답을 결정해요.",
    core: "두 변의 공통 끝점 = 끼인각! ∠A와 ∠D가 짝!",
  },
  {
    // [슬롯 179] 검산: 마크 대응 정방향 A↔D·B↔E·C↔F → △ABC≡△DEF. ≡ 표기 기초.
    id: "m1u4e179", lessonId: "m1u4l12", type: "mcq",
    prompt: "그림과 같이 표시한 두 삼각형이 서로 합동일 때, 기호 ≡를 사용하여 바르게 나타낸 것은?",
    figure: m4CongruenceExamFig({ left: ["A", "B", "C"], right: ["D", "E", "F"] }),
    options: [
      `${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}`,
      `${gsym("ABC", "tri")}≡${gsym("EFD", "tri")}`,
      `${gsym("ABC", "tri")}≡${gsym("FDE", "tri")}`,
      `${gsym("ABC", "tri")}≡${gsym("DFE", "tri")}`,
      `${gsym("BCA", "tri")}≡${gsym("DEF", "tri")}`,
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>그림의 표시로 대응부터 확정해요.<br>① 색칠된 각끼리: ∠A↔∠D<br>② 빗금 한 줄 변끼리 AB↔DE, 두 줄 변끼리 AC↔DF<br>③ 대응 순서대로 받아 적으면 <b>△ABC≡△DEF</b> ✓<span class='xh'>오답 하나씩 격파</span>△ABC≡△DFE는 둘째, 셋째 자리가 바뀌어 B↔F, C↔E라는 거짓 대응을 선언해요. △BCA≡△DEF는 왼쪽 이름을 돌려 쓴 것인데, 그러면 B↔D가 되어 그림의 표시와 어긋나죠. 시작 꼭짓점을 바꿔 쓰려면 양쪽을 함께 돌려야(△BCA≡△EFD) 같은 대응이 유지돼요. 나머지도 자리가 어긋난 순서들이고요. ≡ 표기 문제의 채점 기준은 단 하나, 같은 자리의 글자끼리 정말 대응하는가예요. 쓰기 전에 마크 기준 대응표를 만들고, 쓴 뒤에 자리별로 검산하는 두 번의 확인이 만점 습관이에요.",
    core: "쓰기 전 대응표, 쓴 뒤 자리 검산!",
  },
  {
    // [슬롯 180] 무그림 ④(조건 상자 역산 · 천04-08 원형이 무그림). 검산: 넓이 같음(합동) →
    //  ½·DE·DF=27, DF=6 → DE=9.
    id: "m1u4e180", lessonId: "m1u4l12", type: "num",
    prompt: `${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}인 두 삼각형이 다음 조건을 만족할 때, ${gsym("DE", "seg")}의 길이는 몇 cm인지 구하세요.<br>· ∠D=90°<br>· ${gsym("DF", "seg")}=6 cm<br>· ${gsym("ABC", "tri")}의 넓이는 27 cm²`,
    answer: "9", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>조건 세 개를 사슬로 이어요.<br>① 합동인 두 삼각형의 넓이는 같으므로 △DEF의 넓이도 27 cm²<br>② ∠D=90°이므로 △DEF는 DE와 DF를 밑변과 높이로 쓰는 직각삼각형<br>③ (1/2)×DE×6=27, 3×DE=27<br>④ DE=<b>9</b> ✓<span class='xh'>계산 실수 격파</span>DE×6=27로 세워 4.5가 나왔다면 삼각형 넓이의 절반 계수를 빠뜨린 거예요. 답이 소수로 나오면 식부터 의심하세요. 또 넓이 27이 △ABC의 것이라 △DEF와 무관해 보인다며 막히는 경우가 있는데, 그 다리를 놓아 주는 것이 바로 '합동이면 넓이가 같다'는 성질이에요. 조건 상자 문제는 각 조건이 어떤 성질을 발동시키는지(합동→넓이 전달, 직각→밑변과 높이 확정) 하나씩 번역하는 것이 풀이의 전부랍니다. 검산: (1/2)×9×6=27 ✓",
    core: "조건마다 성질 번역! 합동이 넓이를 건네준다!",
  },
  {
    // [슬롯 181] 검산: SSA(두 변+끼이지 않은 각)만 합동 미보장 · 나머지는 SSS·ASA·SAS·ASA.
    id: "m1u4e181", lessonId: "m1u4l12", type: "mcq",
    prompt: `그림과 같은 두 삼각형 ABC, DEF에 대하여 다음 조건 중 ${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}임이 반드시 성립한다고 할 수 <u>없는</u> 것은?`,
    figure: m4CongruenceExamFig({ left: ["A", "B", "C"], right: ["D", "E", "F"], plain: true }),
    options: [
      `${gsym("AB", "seg")}=${gsym("DE", "seg")}, ${gsym("BC", "seg")}=${gsym("EF", "seg")}, ∠C=∠F`,
      `${gsym("AB", "seg")}=${gsym("DE", "seg")}, ${gsym("BC", "seg")}=${gsym("EF", "seg")}, ${gsym("CA", "seg")}=${gsym("FD", "seg")}`,
      `${gsym("AB", "seg")}=${gsym("DE", "seg")}, ∠A=∠D, ∠B=∠E`,
      `${gsym("AB", "seg")}=${gsym("DE", "seg")}, ${gsym("BC", "seg")}=${gsym("EF", "seg")}, ∠B=∠E`,
      `${gsym("BC", "seg")}=${gsym("EF", "seg")}, ∠B=∠E, ∠C=∠F`,
    ],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>첫 번째 조건에서 ∠C는 두 변 AB, BC 사이에 낀 각이 아니에요(끼인각은 ∠B). 두 변과 끼이지 않은 각이 같아도, 조건에 맞는 삼각형이 두 가지로 생길 수 있어 합동이 <b>보장되지 않아요</b> ✓ 한 변이 컴퍼스처럼 흔들리며 두 자리에 닿는 장면을 상상해 보세요.<span class='xh'>오답 하나씩 격파</span>나머지는 전부 합동을 보장해요. 세 변이 각각 같으면 SSS, 한 변과 그 양 끝 각이 같으면 ASA(둘째, 다섯째), 두 변과 그 끼인각이 같으면 SAS(넷째)죠. 판정 절차는 기계적으로: 재료를 세고(변 몇, 각 몇), 각이 있다면 그 각이 두 변 '사이'에 끼었는지 또는 변의 '양 끝'에 붙었는지 자리를 확인해요. 자리가 맞으면 합동, 각이 옆으로 비켜나 있으면 보장 없음. 값의 개수가 아니라 자리가 합동을 결정한다는 것이 이 단원 최후의 교훈이에요.",
    core: "세 개라도 자리가 틀리면 무효! 낀 각인지 확인!",
  },
  {
    // [슬롯 182] 검산: AB=7·BC=16 라벨 · 대응변 DE=7 ✓·EF=16 ✓·∠A=∠D ✓ / DF는 미지 ✗·EF=7 ✗.
    id: "m1u4e182", lessonId: "m1u4l12", type: "multi",
    prompt: `그림에서 ${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}일 때, 옳은 것을 모두 고르세요.`,
    figure: m4CongruenceExamFig({
      left: ["A", "B", "C"], right: ["D", "E", "F"],
      sides: { left: ["7 cm", undefined, "16 cm"] },
    }),
    options: [
      `${gsym("DE", "seg")}=7 cm`,
      `${gsym("EF", "seg")}=16 cm`,
      "∠A=∠D",
      `${gsym("DF", "seg")}=16 cm`,
      `${gsym("EF", "seg")}=7 cm`,
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>대응표(A-D, B-E, C-F)로 그림의 정보를 번역해요.<br>① AB=7 cm의 대응변은 DE → DE=7 cm ✓<br>② BC=16 cm의 대응변은 EF → EF=16 cm ✓<br>③ 첫 글자끼리인 ∠A와 ∠D는 대응각이라 크기가 같아요 ✓<span class='xh'>오답 하나씩 격파</span>DF=16 cm는 대응을 잘못 읽은 값이에요. DF의 짝은 CA인데, CA의 길이는 그림 어디에도 없으니 16이라 말할 근거가 없죠. 주어진 값과 알 수 없는 값을 구분하는 것도 판별의 일부예요. EF=7 cm는 EF를 AB와 짝지은 것으로, 둘째·셋째 글자 짝(B-E, C-F)을 무시한 결과고요. 합동 판별 문제의 모든 함정은 결국 '짝 바꿔치기' 하나로 만들어져요. 보기를 읽기 전에 대응표를 먼저 적어 두면, 어떤 바꿔치기가 나와도 표와 대조하는 순간 걸러진답니다.",
    core: "판별 전에 대응표! 없는 값은 없다고 판정!",
  },
  {
    // [슬롯 183] 무그림 ⑤(세기 · 그리면 세여진다). 검산: 대각선 교점 O · △ABO≡△BCO≡△CDO≡△DAO
    //  (반씩 같고 90°, SAS) → △ABO와 합동인 것은 자신 제외 3개.
    id: "m1u4e183", lessonId: "m1u4l12", type: "mcq",
    prompt: "정사각형 ABCD의 두 대각선의 교점을 O라 할 때, 두 대각선으로 나뉜 네 삼각형 중 삼각형 ABO와 합동인 삼각형의 개수는?",
    options: ["3개", "4개", "2개", "1개", "없다"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>정사각형의 대각선 성질을 재료로 합동을 판정해요.<br>① 정사각형의 두 대각선은 길이가 같고, 서로를 절반으로 나누며, 수직으로 만나요<br>② 그래서 OA=OB=OC=OD이고 교점의 네 각은 모두 90°<br>③ 네 삼각형 ABO, BCO, CDO, DAO는 두 변과 끼인각이 각각 같아 모두 합동(SAS)<br>④ △ABO와 합동인 것은 자신을 뺀 <b>3개</b> ✓<span class='xh'>오답 하나씩 격파</span>4개로 답했다면 △ABO 자신까지 센 거예요. 합동은 서로 다른 두 도형을 짝짓는 관계라 자기 자신은 세지 않아요. 2개 이하로 답했다면 마주 보는 삼각형만 합동이라 생각한 것인데, 대각선 반쪽 길이가 전부 같으니 이웃한 삼각형끼리도 똑같은 SAS 재료를 가져요. 그림 없이도 성질(대각선의 길이·이등분·수직)만으로 합동이 논증되는 것이 이 문제의 묘미예요. 도형의 성질이 곧 합동 조건의 재료 창고라는 감각을 챙겨 가세요.",
    core: "대각선 성질 3종이 SAS 재료! 자신은 빼고 3개!",
  },
  {
    // [슬롯 184] 검산: CA=12 라벨 · 대응변 FD=x → 12(≡ 순서 C↔F·A↔D).
    id: "m1u4e184", lessonId: "m1u4l12", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}≡${gsym("DEF", "tri")}일 때, <i class='mv'>x</i>의 값을 구하세요.`,
    figure: m4CongruenceExamFig({
      left: ["A", "B", "C"],
      right: ["D", "E", "F"],
      sides: { left: [undefined, "12 cm", undefined], right: [undefined, "x cm", undefined] },
    }),
    answer: "12", numKind: "int", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>이번 대응변은 셋째 짝이에요.<br>① 그림의 12 cm는 변 AC의 길이<br>② ≡ 순서에서 A↔D, C↔F이므로 AC의 대응변은 DF<br>③ x=AC=<b>12</b> ✓<span class='xh'>계산 실수 격파</span>같은 유형을 두 번 만났다고 눈으로만 풀면, 이번엔 라벨이 다른 변에 붙어 있다는 것을 놓치기 쉬워요. 어느 변에 값이 적혀 있는지(AC), 그 변의 두 글자가 상대 삼각형의 어느 글자로 번역되는지(A→D, C→F)를 매번 새로 확인하는 것이 정확한 절차예요. 두 글자를 각각 번역하는 습관은 변 이름이 CA처럼 뒤집혀 나와도 흔들리지 않게 해 줘요. CA의 대응변은 FD이고, FD와 DF는 같은 선분이니까요. 검산: 대응변끼리 같은 위치에 같은 값 12가 놓였는지 그림에서 마지막으로 확인!",
    core: "글자 단위 번역: A→D·C→F, 그래서 AC→DF!",
  },

  // ─ L13 합동의 활용 ─
  {
    // [슬롯 186] 검산: OA=OC·OB=OD·맞꼭지각 → △AOB≡△COD(SAS) → AB=CD=46(그림 라벨 판독).
    id: "m1u4e186", lessonId: "m1u4l13", type: "num",
    prompt: `강 건너 두 지점 A, B 사이의 거리를 직접 재기 어려워, 그림과 같이 점 O를 잡고 ${gsym("OA", "seg")}=${gsym("OC", "seg")}, ${gsym("OB", "seg")}=${gsym("OD", "seg")}가 되도록 점 C, D를 정했어요. ${gsym("CD", "seg")}=46 m일 때, 두 지점 A, B 사이의 거리는 몇 m인지 구하세요.`,
    figure: m4SurveyFig({ mode: "cross", labels: ["A", "B", "O", "C", "D"], lens: { cd: "46 m" } }),
    answer: "46", numKind: "int", unitLabel: "m", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>합동이 잴 수 없는 거리를 잴 수 있는 거리로 바꿔 줘요.<br>① △AOB와 △COD에서 OA=OC, OB=OD(같게 잡은 길이)<br>② ∠AOB=∠COD(맞꼭지각)<br>③ SAS 합동이므로 대응변 AB=CD<br>④ AB=<b>46</b> m ✓<span class='xh'>계산 실수 격파</span>92 m처럼 두 배를 하거나 23 m처럼 절반을 냈다면 합동의 뜻을 비율 관계로 오해한 거예요. 합동은 완전히 똑같은 복사라 대응변의 길이가 그대로 옮겨져요. 이 측량법의 설계도를 읽어 보세요. 잴 수 없는 AB를 품은 삼각형과 완전히 같은 삼각형을, 잴 수 있는 땅 위에 복제해 놓은 거예요. O를 중심으로 같은 거리를 잡는 순간 맞꼭지각은 공짜로 따라오고, SAS가 완성되죠. 고대 수학자들이 실제로 쓰던 지혜가 이 한 장의 그림에 들어 있답니다.",
    core: "합동 복제 측량! 잰 CD가 곧 못 재는 AB!",
  },
  {
    // [슬롯 187] 검산: 정삼각형 안 BD=CE · △ABD≡△BCE(SAS: AB=BC·BD=CE·∠ABD=∠BCE=60°).
    id: "m1u4e187", lessonId: "m1u4l13", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}는 정삼각형이고 ${gsym("BD", "seg")}=${gsym("CE", "seg")}예요. ${gsym("ABD", "tri")}와 합동인 삼각형은?`,
    figure: mExamTwinEquiFig("in"),
    options: [
      `${gsym("BCE", "tri")}`,
      `${gsym("CBE", "tri")}`,
      `${gsym("BEC", "tri")}`,
      `${gsym("CEB", "tri")}`,
      `${gsym("EBC", "tri")}`,
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>대응까지 맞는 이름을 골라야 해요.<br>① △ABD와 △BCE에서 AB=BC(정삼각형의 변), BD=CE(주어진 조건), ∠ABD=∠BCE=60°(정삼각형의 각)<br>② 두 변과 끼인각이 각각 같아 SAS 합동<br>③ 대응 순서 A↔B, B↔C, D↔E를 지킨 표기는 <b>△BCE</b> ✓<span class='xh'>오답 하나씩 격파</span>나머지 보기들은 같은 세 점 B, C, E를 쓰지만 순서가 달라요. 예를 들어 △CBE라고 쓰면 A↔C, B↔B라는 대응 선언이 되는데, 그러면 AB의 짝이 CB가 되어 조건의 틱 표시(BD와 CE)와 어긋나죠. 합동 표기에서 점의 집합이 같아도 순서가 다르면 다른 답이라는 것, 이 단원 채점의 확고한 기준이에요. 첫 변 AB의 짝이 BC, 둘째 변 BD의 짝이 CE라는 조건의 짝 그대로 글자를 배열하면 순서는 저절로 정해져요.",
    core: "같은 세 점이라도 순서가 다르면 다른 표기!",
  },
  {
    // [슬롯 189] 검산: B·C·D 일직선 · △ACD≡△BCE(SAS: AC=BC·CD=CE·∠ACD=∠BCE=120°).
    id: "m1u4e189", lessonId: "m1u4l13", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}와 ${gsym("ECD", "tri")}는 정삼각형이고 세 점 B, C, D는 한 직선 위에 있어요. ${gsym("ACD", "tri")}≡${gsym("BCE", "tri")}임을 설명할 때 이용되는 합동 조건은?`,
    figure: mExamTwinEquiFig("twin"),
    options: [
      "SAS 합동",
      "ASA 합동",
      "SSS 합동",
      "세 각의 크기가 각각 같다",
      "두 삼각형의 넓이가 서로 같다",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 삼각형이 가진 재료를 모아요.<br>① AC=BC(정삼각형 ABC의 변)<br>② CD=CE(정삼각형 ECD의 변)<br>③ ∠ACD=∠BCE: 두 각 모두 60°짜리 정삼각형 각의 이웃이라 180°−60°=120°로 같아요(B, C, D가 일직선이라 평각 이용)<br>④ 두 변과 그 끼인각이 각각 같으니 <b>SAS 합동</b> ✓<span class='xh'>오답 하나씩 격파</span>ASA를 고르려면 한 변의 양 끝 각 정보가 필요한데 여기서 확보되는 각은 120° 한 쌍뿐이에요. SSS는 세 번째 변 AD=BE가 필요하지만 그것은 합동의 결론이지 출발 재료가 아니죠. 결론을 조건으로 쓰면 순환 논리가 돼요. 세 각이 같다거나 넓이가 같다는 것은 애초에 합동 조건이 아니고요. 잇댄 정삼각형 문제의 심장은 '평각−60°=120°'로 끼인각을 만들어 내는 한 수라는 것, 꼭 챙겨 두세요.",
    core: "잇댄 정삼각형 = 변·변은 공짜, 끼인각은 평각−60!",
  },
  {
    // [슬롯 190] 검산: ∠XPQ=∠YPQ·PQ 공통·∠XQP=∠YQP → △XPQ≡△YPQ(ASA) → PX=PY=34.
    id: "m1u4e190", lessonId: "m1u4l13", type: "num",
    prompt: `강 건너 지점 X까지의 거리를 직접 잴 수 없어, 그림과 같이 ${gsym("XPQ", "angle")}=${gsym("YPQ", "angle")}, ${gsym("XQP", "angle")}=${gsym("YQP", "angle")}가 되도록 땅 위의 점 Y를 정했어요. ${gsym("PY", "seg")}=34 m일 때, ${gsym("PX", "seg")}의 길이는 몇 m인지 구하세요.`,
    figure: m4SurveyFig({ mode: "reflect", labels: ["P", "Q", "X", "Y"] }),
    answer: "34", numKind: "int", unitLabel: "m", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>이번 측량의 무기는 ASA예요.<br>① △XPQ와 △YPQ에서 ∠XPQ=∠YPQ(같게 잡은 각)<br>② PQ는 공통인 변<br>③ ∠XQP=∠YQP(같게 잡은 각)<br>④ 한 변과 그 양 끝 각이 각각 같아 ASA 합동이고, 대응변 PX=PY=<b>34</b> m ✓<span class='xh'>계산 실수 격파</span>이 구도의 열쇠는 두 삼각형이 공유하는 변 PQ를 '공통 조건'으로 세는 거예요. 같은 변이니 당연히 길이가 같고, 그것이 ASA의 S를 채워 주죠. 공통변은 문제에 안 쓰여 있어도 그림에서 스스로 찾아야 하는 숨은 조건이라 놓치기 쉬워요. 앞의 X자 측량(SAS)과 비교해 보세요. 길이를 같게 잡으면 SAS, 각을 같게 잡으면 ASA. 무엇을 복제하느냐에 따라 쓰는 합동 조건이 달라질 뿐, '잴 수 있는 쪽에 쌍둥이 삼각형 만들기'라는 전략은 똑같답니다.",
    core: "공통변은 숨은 조건! 각을 복제하면 ASA 측량!",
  },
  {
    // [슬롯 191] 검산: X자 구도의 근거 세트 = 잡은 길이 2쌍 + 맞꼭지각(결론 AB=CD·대응각은 재료 아님).
    id: "m1u4e191", lessonId: "m1u4l13", type: "mcq",
    prompt: `그림과 같이 점 O를 잡아 ${gsym("OA", "seg")}=${gsym("OC", "seg")}, ${gsym("OB", "seg")}=${gsym("OD", "seg")}가 되도록 하여 ${gsym("AOB", "tri")}≡${gsym("COD", "tri")}임을 설명하려고 해요. 이때 이용되는 조건을 바르게 모은 것은?`,
    figure: m4SurveyFig({ mode: "cross", labels: ["A", "B", "O", "C", "D"] }),
    options: [
      `${gsym("OA", "seg")}=${gsym("OC", "seg")}, ${gsym("OB", "seg")}=${gsym("OD", "seg")}, ${gsym("AOB", "angle")}=${gsym("COD", "angle")}`,
      `${gsym("OA", "seg")}=${gsym("OC", "seg")}, ${gsym("OB", "seg")}=${gsym("OD", "seg")}, ${gsym("OAB", "angle")}=${gsym("OCD", "angle")}`,
      `${gsym("OA", "seg")}=${gsym("OC", "seg")}, ${gsym("AB", "seg")}=${gsym("CD", "seg")}, ${gsym("AOB", "angle")}=${gsym("COD", "angle")}`,
      `${gsym("OA", "seg")}=${gsym("OD", "seg")}, ${gsym("OB", "seg")}=${gsym("OC", "seg")}, ${gsym("AOB", "angle")}=${gsym("COD", "angle")}`,
      `${gsym("AB", "seg")}=${gsym("CD", "seg")}, ${gsym("OAB", "angle")}=${gsym("OCD", "angle")}, ${gsym("OBA", "angle")}=${gsym("ODC", "angle")}`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>출발 재료만 모아야 해요.<br>① OA=OC, OB=OD: 측량하며 직접 같게 잡은 두 쌍의 변<br>② ∠AOB=∠COD: 두 직선이 O에서 만나 생기는 맞꼭지각이라 공짜로 같은 각<br>③ 이 셋이 SAS를 이루는 정확한 재료 세트예요 ✓<span class='xh'>오답 하나씩 격파</span>∠OAB=∠OCD가 들어간 세트는 합동이 성립한 '뒤에야' 알게 되는 대응각을 재료로 쓴 거예요. AB=CD가 들어간 세트도 마찬가지로 결론을 조건 자리에 넣은 순환 논리죠. 애초에 AB는 잴 수 없어서 이 측량을 하는 것이니까요. OA=OD처럼 대응을 엇갈리게 짝지은 세트는 그림의 틱 표시와 어긋나고요. 논증 문제는 '지금 알고 있는 것'과 '알고 싶은 것'을 칸을 나눠 적는 습관이 생명이에요. 결론이 조건 칸에 스며드는 순간 논증은 무너져요.",
    core: "재료와 결론을 분리! 맞꼭지각만이 공짜 재료!",
  },
  {
    // [슬롯 192] 검산: △ACD≡△BCE ✓·AD=BE(대응변) ✓·CD=CE(정삼각형 ECD) ✓ / AD=CD ✗·△ACD≡△ECB ✗(대응 뒤틀림).
    id: "m1u4e192", lessonId: "m1u4l13", type: "multi",
    prompt: `그림에서 ${gsym("ABC", "tri")}와 ${gsym("ECD", "tri")}는 정삼각형이고 세 점 B, C, D는 한 직선 위에 있어요. 옳은 것을 모두 고르세요.`,
    figure: mExamTwinEquiFig("twin"),
    options: [
      `${gsym("ACD", "tri")}≡${gsym("BCE", "tri")}`,
      `${gsym("AD", "seg")}=${gsym("BE", "seg")}`,
      `${gsym("CD", "seg")}=${gsym("CE", "seg")}`,
      `${gsym("AD", "seg")}=${gsym("CD", "seg")}`,
      `${gsym("ACD", "tri")}≡${gsym("ECB", "tri")}`,
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>합동 논증과 그 열매를 확인해요.<br>① AC=BC, CD=CE, ∠ACD=∠BCE=120°로 SAS 합동: △ACD≡△BCE ✓<br>② 그 대응변이라 AD=BE ✓<br>③ CD=CE는 정삼각형 ECD의 두 변이니 애초에 참 ✓<span class='xh'>오답 하나씩 격파</span>AD=CD는 큰 삼각형의 빗변과 작은 정삼각형의 변을 같다고 한 것이라 근거가 없어요. 그림에서도 AD가 눈에 띄게 길죠. △ACD≡△ECB는 대응 순서가 뒤틀린 표기예요. A↔E, C↔C, D↔B라는 선언이 되는데 AC=EC일 이유가 없으니 거짓이에요. 표기 순서가 곧 주장 내용이라는 것을 판별에서도 똑같이 적용해야 해요. 참인 진술을 고르는 문제는 '조건에서 바로 나오는 것', '합동에서 따라 나오는 것', '아무 근거 없는 것'의 세 층으로 보기를 분류하면 한결 선명해져요.",
    core: "보기 3층 분류: 조건 직행·합동의 열매·근거 없음!",
  },
  {
    // [슬롯 193] 검산: AB=CD·∠XAB=∠YCD·∠XBA=∠YDC → △XAB≡△YCD(ASA) → XA=YC=57.
    id: "m1u4e193", lessonId: "m1u4l13", type: "num",
    prompt: `연못 건너편 지점 X까지의 거리 ${gsym("XA", "seg")}를 직접 잴 수 없어, 그림과 같이 ${gsym("AB", "seg")}=${gsym("CD", "seg")}, ${gsym("XAB", "angle")}=${gsym("YCD", "angle")}, ${gsym("XBA", "angle")}=${gsym("YDC", "angle")}가 되도록 삼각형 CDY를 그렸어요. ${gsym("YC", "seg")}=57 m일 때, ${gsym("XA", "seg")}의 길이는 몇 m인지 구하세요.`,
    figure: m4SurveyFig({ mode: "offset", labels: ["X", "A", "B", "Y", "C", "D"] }),
    answer: "57", numKind: "int", unitLabel: "m", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>떨어진 곳에 쌍둥이 삼각형을 지어 놓고 재는 방법이에요.<br>① AB=CD(같게 잡은 변)<br>② ∠XAB=∠YCD, ∠XBA=∠YDC(같게 잡은 두 각, 곧 변 AB와 CD의 양 끝 각)<br>③ 한 변과 그 양 끝 각이 각각 같아 ASA 합동: △XAB≡△YCD<br>④ 대응변 XA=YC=<b>57</b> m ✓<span class='xh'>계산 실수 격파</span>대응을 잘못 읽어 XB의 값을 묻는다고 착각하지 않도록, 대응표(X↔Y, A↔C, B↔D)를 먼저 적으세요. XA의 짝은 YC라는 것이 글자 번역으로 확정돼요. 이 방법이 강한 이유는 밑변과 두 각만 복제하면 삼각형 전체가 통째로 복제된다는 ASA의 확정력 덕분이에요. 결정조건이 '삼각형을 하나로 정하는 조건'이었다는 것을 기억하면, 측량은 그 조건을 현실에서 실행하는 일이라는 큰 그림이 보여요. 같은 원리가 X자, 대칭, 우회 구도로 옷만 갈아입는 거죠.",
    core: "밑변+양 끝 각 복제 = 삼각형 통째 복제(ASA)!",
  },
  {
    // [슬롯 194] 검산: 겹친 부분 = 정사각형의 ¼ · 12²÷4=36. 회전각과 무관(195의 근거와 세트).
    id: "m1u4e194", lessonId: "m1u4l13", type: "mcq",
    prompt: "그림과 같이 한 변의 길이가 12 cm인 정사각형 ABCD의 두 대각선의 교점 O에 합동인 정사각형의 한 꼭짓점을 맞추어 놓았어요. 두 정사각형이 겹쳐진 부분의 넓이는?",
    figure: mExamSquareOverlapFig({ side: "12 cm" }),
    options: ["36 cm²", "72 cm²", "48 cm²", "24 cm²", "18 cm²"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>겹친 사각형을 직접 계산하는 대신 합동 조각으로 바꿔치기해요.<br>① O에서 나온 회전 정사각형의 두 변이 정사각형 ABCD를 두 조각으로 잘라요<br>② 잘려 나간 삼각형 조각과 새로 들어온 삼각형 조각은 합동이라, 겹친 부분의 넓이는 대각선으로 나눈 4등분 조각 하나와 언제나 같아요<br>③ 정사각형의 넓이는 12×12=144 cm²<br>④ 겹친 부분=144÷4=<b>36 cm²</b> ✓<span class='xh'>오답 하나씩 격파</span>72는 절반, 48은 3분의 1로 나눈 값인데 기준이 없어요. 핵심은 O가 두 대각선의 교점(한가운데)이라는 것. 겹친 부분이 비스듬한 사각형이라 계산이 막힐 것 같지만, 튀어나온 조각과 들어간 조각이 서로 합동이라 상쇄되며 정확히 4분의 1이 유지돼요. 복잡한 도형을 '넓이가 같은 쉬운 도형'으로 바꾸는 등적 변형의 첫 경험이랍니다.",
    core: "겹침 = 항상 ¼! 나간 조각과 들어온 조각이 합동!",
  },
  {
    // [슬롯 195] 검산: 회전해도 불변인 근거 = 잘려 나가는 조각과 새로 들어오는 조각의 합동(상쇄).
    id: "m1u4e195", lessonId: "m1u4l13", type: "mcq",
    prompt: "그림과 같이 정사각형 ABCD의 두 대각선의 교점 O에 합동인 정사각형의 한 꼭짓점을 맞추어 놓았어요. 이 정사각형을 O를 중심으로 조금 돌려도 겹쳐진 부분의 넓이는 변하지 않아요. 그 까닭으로 가장 알맞은 것은?",
    figure: mExamSquareOverlapFig({ rot: 33 }),
    options: [
      "줄어드는 조각과 새로 늘어나는 조각의 합동",
      "겹쳐진 부분의 모양 불변",
      "겹쳐진 부분의 둘레 불변",
      "두 정사각형의 둘레의 합 불변",
      "겹쳐진 부분이 항상 삼각형",
    ],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>돌리는 순간 무슨 일이 일어나는지 조각으로 쪼개 봐요.<br>① 회전하면 한쪽에서는 삼각형 조각이 겹침에서 빠져나가고, 반대쪽에서는 새 삼각형 조각이 들어와요<br>② 두 조각은 O를 낀 변과 각이 각각 같아 합동(ASA)<br>③ 나간 만큼 정확히 들어오니 넓이는 그대로 ✓<span class='xh'>오답 하나씩 격파</span>겹쳐진 부분의 '모양'은 회전에 따라 계속 변해요. 정사각형이 되기도, 연 모양 사각형이 되기도 하죠. 모양이 변하는데도 넓이만 변하지 않는 것이 이 문제의 신기한 지점이에요. 둘레 역시 모양을 따라 변하니 불변의 근거가 못 되고, 두 정사각형의 둘레 합은 겹침과 무관한 값이에요. 겹친 부분이 항상 삼각형이라는 것은 그림부터 사각형이라 거짓이고요. '변하는 것(모양, 둘레)'과 '변하지 않는 것(넓이)'을 가르고, 불변의 이유를 합동 상쇄에서 찾는 것. 도형 논증의 눈이 한 단계 자라는 문제예요.",
    core: "나감과 들어옴이 합동 상쇄! 모양은 변해도 넓이는 불변!",
  },
  {
    // [슬롯 196] 검산: △ACD≡△BCE → ∠ADC=∠BEC. △BFD에서 ∠FBD+∠FDB=∠EBC+∠BEC=180−120=60
    //  → ∠BFD=180−60=120.
    id: "m1u4e196", lessonId: "m1u4l13", type: "num",
    prompt: `그림에서 ${gsym("ABC", "tri")}와 ${gsym("ECD", "tri")}는 정삼각형이고 세 점 B, C, D는 한 직선 위에 있어요. ${gsym("AD", "seg")}와 ${gsym("BE", "seg")}의 교점을 F라 할 때, ${gsym("BFD", "angle")}의 크기는 몇 도인지 구하세요.`,
    figure: mExamTwinEquiFig("twin"),
    answer: "120", numKind: "int", unitLabel: "°", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>합동으로 각을 옮겨 담는 정공 루트예요.<br>① △ACD≡△BCE(SAS)이므로 ∠ADC=∠BEC<br>② △BFD의 두 밑각을 살펴요. ∠FDB는 ∠ADC와 같은 각(F가 AD 위, B·C·D 일직선), ∠FBD는 ∠EBC와 같은 각<br>③ ∠FBD+∠FDB=∠EBC+∠BEC이고, △BCE에서 ∠BCE=120°이므로 두 각의 합은 180°−120°=60°<br>④ ∠BFD=180°−60°=<b>120°</b> ✓<span class='xh'>계산 실수 격파</span>60°에서 멈추면 두 밑각의 합을 답한 거예요. 문제는 꼭짓점 F의 각을 물었으니 삼각형 세 각의 합에서 한 번 더 빼야 해요. 이 문제의 설계는 재기 어려운 각(∠BFD)을 합동으로 잴 수 있는 각들의 합으로 번역하는 것. ∠ADC를 ∠BEC로 바꿔치기하는 순간 흩어진 두 각이 한 삼각형(△BCE) 안으로 모이며 120°라는 확정값이 나와요. 각 옮겨 담기의 종합 완성판이에요.",
    core: "합동으로 바꿔치기 → 한 삼각형에 모아 180에서 빼기!",
  },
  {
    // [슬롯 197] 검산: △AOB≡△COD에서 AB의 대응변 = CD(A↔C·B↔D).
    id: "m1u4e197", lessonId: "m1u4l13", type: "mcq",
    prompt: `그림에서 ${gsym("OA", "seg")}=${gsym("OC", "seg")}, ${gsym("OB", "seg")}=${gsym("OD", "seg")}이고 ${gsym("AOB", "tri")}≡${gsym("COD", "tri")}일 때, ${gsym("AB", "seg")}의 대응변은?`,
    figure: m4SurveyFig({ mode: "cross", labels: ["A", "B", "O", "C", "D"] }),
    options: [
      `${gsym("CD", "seg")}`,
      `${gsym("OC", "seg")}`,
      `${gsym("OD", "seg")}`,
      `${gsym("AC", "seg")}`,
      `${gsym("BD", "seg")}`,
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>≡ 순서를 대응표로 번역해요.<br>① △AOB≡△COD에서 A↔C, O↔O, B↔D<br>② AB의 두 글자를 각각 번역하면 A→C, B→D<br>③ 따라서 AB의 대응변은 <b>CD</b> ✓<span class='xh'>오답 하나씩 격파</span>OC와 OD는 이미 조건에서 같다고 잡아 놓은 변들이지 AB의 짝이 아니에요. AB에는 O가 들어 있지 않으니 O가 들어간 변과 짝이 될 수 없다는 것이 글자 번역의 힘이죠. AC와 BD는 두 삼각형을 가로질러 잇는 선분이라 어느 한 삼각형의 변조차 아니에요. 대응변을 물으면 반드시 두 삼각형 각각의 변 중에서 골라야 해요. X자 측량 그림에서 AB와 CD가 서로 짝이 되는 이 관계가, 잴 수 없는 강 건너 거리를 땅 위의 거리로 바꿔 주는 논리의 다리랍니다.",
    core: "글자 번역 A→C·B→D! O 없는 변끼리가 짝!",
  },
  {
    // [슬롯 198] 검산: OA=OC·OB=OD·맞꼭지각 → 합동 ✓·AB=CD ✓·∠OAB=∠OCD(대응각) ✓ /
    //  OA=OB ✗(무관)·AB=OC ✗.
    id: "m1u4e198", lessonId: "m1u4l13", type: "multi",
    prompt: `그림에서 ${gsym("OA", "seg")}=${gsym("OC", "seg")}, ${gsym("OB", "seg")}=${gsym("OD", "seg")}일 때, 옳은 것을 모두 고르세요.`,
    figure: m4SurveyFig({ mode: "cross", labels: ["A", "B", "O", "C", "D"] }),
    options: [
      `${gsym("AOB", "tri")}≡${gsym("COD", "tri")}`,
      `${gsym("AB", "seg")}=${gsym("CD", "seg")}`,
      `${gsym("OAB", "angle")}=${gsym("OCD", "angle")}`,
      `${gsym("OA", "seg")}=${gsym("OB", "seg")}`,
      `${gsym("AB", "seg")}=${gsym("OC", "seg")}`,
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>조건에서 합동을 세우고 열매를 수확해요.<br>① OA=OC, OB=OD에 맞꼭지각 ∠AOB=∠COD를 더하면 SAS로 △AOB≡△COD ✓<br>② 합동의 대응변이라 AB=CD ✓<br>③ 대응각이라 ∠OAB=∠OCD ✓<span class='xh'>오답 하나씩 격파</span>OA=OB는 같은 삼각형 안의 두 변을 같다고 한 것인데, 조건은 두 삼각형 사이의 짝(OA와 OC)을 같게 잡았을 뿐이라 근거가 없어요. 그림의 틱 표시도 한 줄짜리와 두 줄짜리로 서로 다르죠. AB=OC는 대응하지 않는 변끼리의 비교라 역시 무근거고요. 판별의 순서는 언제나 같아요. 먼저 조건과 공짜 조건(맞꼭지각)으로 합동을 확정하고, 그다음 대응하는 것끼리만 같다고 표시하기. 대응하지 않는 쌍은 그럴듯해 보여도 전부 오답이에요.",
    core: "합동 확정 → 대응끼리만 수확! 비대응은 전부 함정!",
  },
  {
    // [슬롯 199] 검산: AB=28 m 라벨 · 대응변 CD=28(186의 역방향 판독).
    id: "m1u4e199", lessonId: "m1u4l13", type: "num",
    prompt: `그림과 같이 점 O를 잡고 ${gsym("OA", "seg")}=${gsym("OC", "seg")}, ${gsym("OB", "seg")}=${gsym("OD", "seg")}가 되도록 점 C, D를 정했어요. 강 건너 두 지점 사이의 거리 ${gsym("AB", "seg")}=28 m일 때, ${gsym("CD", "seg")}의 길이는 몇 m인지 구하세요.`,
    figure: m4SurveyFig({ mode: "cross", labels: ["A", "B", "O", "C", "D"], lens: { ab: "28 m" } }),
    answer: "28", numKind: "int", unitLabel: "m", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>X자 측량 구도를 반대 방향으로 읽는 판독 문제예요.<br>① OA=OC, OB=OD(잡은 길이)에 맞꼭지각을 더해 △AOB≡△COD(SAS)<br>② 대응변이므로 CD=AB<br>③ CD=<b>28</b> m ✓<span class='xh'>계산 실수 격파</span>합동을 세우기도 전에 값부터 옮기지 않았는지 돌아보세요. 답은 같아도, 근거 없는 직감과 합동 논증은 전혀 다른 실력이에요. 시험 서술형이라면 SAS의 세 재료(변, 변, 맞꼭지각)를 쓰는 것까지가 답안이죠. 또 56이나 14처럼 두 배, 절반을 답했다면 합동이 복사 관계라는 것을 놓친 거예요. 이 문제처럼 잰 값이 AB 쪽에 주어질 수도, CD 쪽에 주어질 수도 있으니 어느 쪽이 주어졌든 '대응변끼리 같다'는 한 문장으로 오가는 유연함을 길러 두세요.",
    core: "어느 쪽이 주어져도 대응변은 그대로 복사!",
  },
  {
    // [슬롯 200] 검산: ∠BPD는 ㉮(∠APE=60)의 맞꼭지각 = 60 → △PBD에서 ∠PBD+∠PDB=180−60=120.
    //  §3의 "=60"은 오기 · 120으로 정정(196과 값이 같으나 그림·유형이 달라 수용).
    //  검산 C 반영: "㉮=60°" 공개는 같은 레슨 188의 num 정답 인쇄(교차 유출) · 유도형으로 재작성.
    id: "m1u4e200", lessonId: "m1u4l13", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}는 정삼각형이고 ${gsym("BD", "seg")}=${gsym("CE", "seg")}, 점 P는 ${gsym("AD", "seg")}와 ${gsym("BE", "seg")}의 교점이에요. ${gsym("PBD", "angle")}+${gsym("PDB", "angle")}의 크기는?`,
    figure: mExamTwinEquiFig("in"),
    options: ["120°", "60°", "90°", "150°", "30°"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>숨은 합동에서 출발해 삼각형 하나로 모아요.<br>① △ABD≡△BCE(SAS: AB=BC, BD=CE, 60°)이므로 ∠ADB=∠BEC<br>② △PBD의 두 각을 바꿔치기: ∠PDB=∠ADB=∠BEC, ∠PBD=∠EBC<br>③ ∠PBD+∠PDB=∠EBC+∠BEC이고, △BCE에서 세 각의 합은 180°, ∠BCE=60°이므로 두 각의 합은 180°−60°=<b>120°</b> ✓<span class='xh'>오답 하나씩 격파</span>60°는 ∠BCE나 교점의 위쪽 각(㉮ 자리)에서 멈춘 값이에요. 문제는 아래 삼각형의 두 밑각의 합까지 가야 하죠. 90°나 150°는 직각, 평각과 섞은 값이고, 30°는 60의 절반으로 근거가 없어요. 설계의 핵심은 P 곁에서 직접 잴 수 없는 두 각을 합동으로 △BCE 안에 옮겨 담는 거예요. 각 하나하나는 못 구해도 '합'은 구해지는 상황, 묶음 계산 발상이 도전 문제의 마지막 열쇠랍니다.",
    core: "합동으로 두 각을 한 삼각형에 담아 180에서 빼기!",
  },
];
