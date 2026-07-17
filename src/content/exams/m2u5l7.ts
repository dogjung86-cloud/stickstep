// 중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리: 단원 종합 평가 풀, 레슨 7 삼각형의 중점연결정리: 절반의 지름길 (m2u5e110~e127) · 책 206쪽
// 유형 쿼터: mcq 9 + multi 2 = 11 · num 5 · word 2, diff 7/7/4.
// 함정 계보(교과서 대조): 절반 방향 혼동(2배↔절반), 중점 사각형=평행사변형(대각선 근거), 사다리꼴 중간 평균.
// 수치 앵커 회피: 레슨 7/14·16·12→28·18→9·11→22·10·14→24·30→15·380→190·65°·58° 회피(브리프 준수).
// num 정답 등록부(중복 없음): 17·38·30·26·34.
// word 정답: 중점(e126)·중점연결정리(e127) · '평행사변형'은 e120 문두·정답 보기와 명제 중복이라 교체.
// 표기: em대시 금지, 뺄셈·차는 −(U+2212), 기하 기호는 gsym·유니코드 리터럴(mfmt 미사용).
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import { m2ExamMidsegFig, m2ExamMidQuadFig, m2ExamTrapCutFig } from "../../ui/examFiguresMath";
const L = "m2u5l7";

export const POOL_M2U5L7: ExamItem[] = [
  {
    id: "m2u5e110", lessonId: L, type: "mcq",
    prompt: `그림에서 점 M, N은 각각 ${gsym("ABC", "tri")}의 두 변 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ${gsym("BC", "seg")}=26 cm일 때, ${gsym("MN", "seg")}의 길이는?`,
    figure: m2ExamMidsegFig({ B: 58, C: 50, mode: "MN", labels: { BC: "26 cm", MN: "x cm" } }),
    options: ["13 cm", "52 cm", "26 cm", "6.5 cm", "39 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>삼각형의 두 변의 중점을 이은 선분은 나머지 한 변과 평행하고, 그 길이는 절반이에요.<br>① 점 M, N은 각각 AB, AC의 중점이에요<br>② 그러면 MN은 BC의 절반이 돼요<br>③ MN=½×26=<b>13 cm</b><span class='xh'>오답 하나씩 격파</span>52 cm는 26을 오히려 2배 한 값인데, 중점끼리 이은 선분은 밑변보다 길어질 수 없어요. 26 cm는 BC를 그대로 옮겨 적어 절반으로 줄이는 과정을 빠뜨린 값이에요. 6.5 cm는 26을 4로 나눠 절반을 두 번 적용한 값이고, 39 cm는 26의 1.5배라 어느 쪽도 절반 관계가 아니에요. 중점끼리 이으면 항상 밑변의 절반이 된다는 점을 기억하세요.",
    core: "두 중점 이으면 밑변의 절반!",
  },
  {
    id: "m2u5e111", lessonId: L, type: "mcq",
    prompt: `점 M, N이 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이고 ${gsym("MN", "seg")}=16 cm예요. 이때 ${gsym("BC", "seg")}의 길이는?`,
    options: ["16 cm", "32 cm", "8 cm", "48 cm", "64 cm"],
    answer: 1, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점을 이은 선분 MN은 BC의 절반이니, 거꾸로 BC는 MN의 2배예요.<br>① MN은 두 중점을 이은 선분이에요<br>② MN=½BC이므로 BC=2×MN<br>③ BC=2×16=<b>32 cm</b><span class='xh'>오답 하나씩 격파</span>16 cm는 MN을 그대로 옮겨 BC와 MN을 같다고 본 값이에요. 8 cm는 오히려 16을 절반으로 줄인 값인데, BC는 MN보다 길어야 하니 방향이 반대예요. 48 cm는 16의 3배, 64 cm는 16의 4배라 2배 관계를 넘어선 값이고요. 절반의 반대는 2배라는 관계만 정확히 세우면 돼요.",
    core: "절반의 반대는 2배, MN×2=BC!",
  },
  {
    id: "m2u5e112", lessonId: L, type: "mcq",
    prompt: `점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ∠B=47°일 때, ∠AMN의 크기는?`,
    figure: m2ExamMidsegFig({ B: 47, C: 61, mode: "MN", marks: [{ at: "B", label: "47°" }, { at: "AMN", label: "x°" }] }),
    options: ["94°", "43°", "47°", "133°", "23.5°"],
    answer: 2, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>MN이 BC와 평행하므로 ∠AMN과 ∠B는 서로 동위각이에요.<br>① 점 M, N이 중점이라 MN∥BC예요<br>② 평행선에서 동위각의 크기는 서로 같아요<br>③ ∠AMN=∠B=<b>47°</b><span class='xh'>오답 하나씩 격파</span>94°는 47°를 2배 한 값인데 동위각은 크기가 그대로 같아요. 43°는 90°에서 47°를 뺀 여각이라 직각과 헷갈린 값이고, 133°는 180°에서 47°를 뺀 값인데 ∠AMN과 ∠B는 더해서 180°가 되는 관계가 아니라 크기가 같은 관계예요. 23.5°는 47°의 절반이고요. MN∥BC에서 같은 위치에 놓인 각은 크기가 같다는 점이 핵심이에요.",
    core: "MN∥BC, 동위각으로 크기가 같아요!",
  },
  {
    id: "m2u5e113", lessonId: L, type: "mcq",
    prompt: `그림의 사각형 ABCD에서 네 변 ${gsym("AB", "seg")}, ${gsym("BC", "seg")}, ${gsym("CD", "seg")}, ${gsym("DA", "seg")}의 중점을 각각 P, Q, R, S라고 해요. 사각형 PQRS가 평행사변형인 까닭으로 옳은 것은?`,
    figure: m2ExamMidQuadFig({ preset: 0, diag: "AC" }),
    options: [
      "네 변의 길이가 모두 같기 때문이에요",
      "두 대각선이 서로를 수직이등분하기 때문이에요",
      "네 각이 모두 직각이기 때문이에요",
      "PQ와 SR가 모두 대각선 AC의 절반이면서 평행하기 때문이에요",
      "이웃한 PQ와 QR의 길이가 같기 때문이에요",
    ],
    answer: 3, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>대각선 AC를 그으면 까닭이 보여요.<br>① △ABC에서 P, Q는 중점이라 PQ∥AC, PQ=½AC예요<br>② △ACD에서 S, R도 중점이라 SR∥AC, SR=½AC예요<br>③ 따라서 PQ와 SR는 평행하고 길이도 같아 PQRS는 평행사변형이에요<span class='xh'>오답 하나씩 격파</span>네 변의 길이가 모두 같다는 설명은 마름모의 조건이라 일반 사각형에서는 보장되지 않아요. 두 대각선이 서로를 수직이등분한다는 것도 마름모 성질이고요. 네 각이 모두 직각이라는 건 직사각형 이야기라 항상 참은 아니에요. 이웃한 PQ와 QR가 같다는 것도 평행사변형의 근거가 못 돼요. 한 쌍의 대변이 평행하고 길이가 같으면 평행사변형이에요.",
    core: "대각선으로 두 변이 평행·같음을 보인다!",
  },
  {
    id: "m2u5e114", lessonId: L, type: "mcq",
    prompt: `사각형 ABCD의 네 변의 중점을 이어 사각형 PQRS를 만들었어요. 두 대각선이 ${gsym("AC", "seg")}=18 cm, ${gsym("BD", "seg")}=16 cm일 때, 사각형 PQRS의 둘레는?`,
    figure: m2ExamMidQuadFig({ preset: 1, diag: "both", labels: { AC: "18 cm", BD: "16 cm" } }),
    options: ["17 cm", "68 cm", "18 cm", "16 cm", "34 cm"],
    answer: 4, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>중점 사각형의 각 변은 대각선의 절반이에요.<br>① PQ=SR=½AC=9 cm, QR=SP=½BD=8 cm예요<br>② 둘레=9+8+9+8이라 AC+BD와 같아요<br>③ 둘레=18+16=<b>34 cm</b><span class='xh'>오답 하나씩 격파</span>17 cm는 18과 16의 합을 절반만 한 값이라 네 변을 다 더하지 않은 거예요. 68 cm는 34를 다시 2배 한 값이고요. 18 cm는 대각선 AC 하나만, 16 cm는 BD 하나만 본 값이라 둘 다 나머지 절반을 빠뜨렸어요. 중점 사각형의 둘레는 두 대각선의 길이를 더한 것과 같다는 결론을 기억하세요.",
    core: "중점 사각형 둘레 = 두 대각선의 합!",
  },
  {
    id: "m2u5e115", lessonId: L, type: "mcq",
    prompt: `그림에서 점 M, N, D는 각각 ${gsym("ABC", "tri")}의 세 변의 중점이에요. ${gsym("ABC", "tri")}의 둘레가 44 cm일 때, 세 중점을 이어 만든 ${gsym("MND", "tri")}의 둘레는?`,
    figure: m2ExamMidsegFig({ B: 56, C: 54, mode: "three" }),
    options: ["22 cm", "88 cm", "44 cm", "11 cm", "14.7 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>세 변의 중점을 이으면 안쪽에 작은 삼각형이 생겨요.<br>① 각 중점을 이은 변은 마주 보는 변의 절반이에요<br>② 세 변이 모두 절반이면 둘레도 절반이에요<br>③ △MND의 둘레=½×44=<b>22 cm</b><span class='xh'>오답 하나씩 격파</span>88 cm는 44를 2배 한 값이라 안쪽 삼각형이 오히려 커진 셈이니 맞지 않아요. 44 cm는 원래 삼각형의 둘레를 그대로 옮긴 값이고요. 11 cm는 44를 4로 나눠 절반을 두 번 적용한 값, 14.7 cm는 44를 3으로 나눈 값이라 셋 다 절반 관계가 아니에요. 세 변이 각각 절반이면 둘레도 정확히 절반이 된다는 점을 기억하세요.",
    core: "세 중점 삼각형의 둘레는 원래의 절반!",
  },
  {
    id: "m2u5e116", lessonId: L, type: "mcq",
    prompt: `사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("BC", "seg")}이고, 점 E, F는 각각 두 변 ${gsym("AB", "seg")}, ${gsym("DC", "seg")}의 중점이에요. ${gsym("AD", "seg")}=36 cm, ${gsym("BC", "seg")}=52 cm일 때, ${gsym("EF", "seg")}의 길이는?`,
    figure: m2ExamTrapCutFig({ top: 36, bot: 52, t: 0.5, labels: { AD: "36 cm", BC: "52 cm", EF: "x cm" }, midTicks: true }),
    options: ["16 cm", "44 cm", "88 cm", "22 cm", "36 cm"],
    answer: 1, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>사다리꼴에서 두 변의 중점을 이은 선분은 평행한 두 변의 길이의 평균이에요.<br>① EF는 AD와 BC의 중점을 이은 선분이에요<br>② EF=(AD+BC)÷2예요<br>③ EF=(36+52)÷2=<b>44 cm</b><span class='xh'>오답 하나씩 격파</span>16 cm는 52에서 36을 뺀 두 변의 차라 평균과는 다른 값이에요. 88 cm는 36과 52를 더하기만 하고 절반으로 나누지 않은 값이고요. 22 cm는 합을 4로 나눠 절반을 한 번 더 적용한 값, 36 cm는 위 변 AD를 그대로 옮긴 값이에요. 가운데 선분은 두 평행한 변을 더해 2로 나눈 평균이라는 점이 핵심이에요.",
    core: "사다리꼴 중간 선분 = 두 변의 평균!",
  },
  {
    id: "m2u5e117", lessonId: L, type: "mcq",
    prompt: `${gsym("ABC", "tri")}에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. 다시 ${gsym("AMN", "tri")}에서 점 P, Q는 각각 ${gsym("AM", "seg")}, ${gsym("AN", "seg")}의 중점이고요. ${gsym("BC", "seg")}=40 cm일 때, ${gsym("PQ", "seg")}의 길이는?`,
    options: ["20 cm", "5 cm", "10 cm", "40 cm", "80 cm"],
    answer: 2, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>중점을 이을 때마다 길이가 절반씩 줄어요.<br>① M, N은 AB, AC의 중점이라 MN=½×40=20 cm예요<br>② P, Q는 AM, AN의 중점이라 PQ=½×MN이에요<br>③ PQ=½×20=<b>10 cm</b><span class='xh'>오답 하나씩 격파</span>20 cm는 첫 단계 MN까지만 구하고 멈춘 값이에요. 5 cm는 절반을 세 번 적용해 한 단계 더 나아간 값이고요. 40 cm는 BC를 그대로 옮긴 값, 80 cm는 오히려 2배 한 값이라 방향이 반대예요. 중점 잇기를 두 번 했으니 절반을 두 번, 곧 4분의 1이 되어 10 cm가 맞아요.",
    core: "중점 잇기 두 번이면 4분의 1!",
  },
  {
    id: "m2u5e118", lessonId: L, type: "mcq",
    prompt: `강 건너 두 지점 B, C 사이의 거리를 직접 잴 수 없어요. 한 지점 A를 정하고 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점 M, N을 잡아 ${gsym("MN", "seg")}=130 m로 쟀어요. 두 지점 B, C 사이의 거리는?`,
    options: ["130 m", "65 m", "390 m", "260 m", "520 m"],
    answer: 3, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>직접 잴 수 없는 거리를 중점연결정리로 구하는 상황이에요.<br>① M, N이 AB, AC의 중점이라 MN=½BC예요<br>② 거꾸로 BC=2×MN이에요<br>③ BC=2×130=<b>260 m</b><span class='xh'>오답 하나씩 격파</span>130 m는 재어 둔 MN을 그대로 답한 값이라 두 배로 늘리는 과정을 빠뜨렸어요. 65 m는 오히려 절반으로 줄인 값인데 BC는 MN보다 길어야 하니 방향이 반대예요. 390 m는 3배, 520 m는 4배라 2배 관계를 벗어난 값이고요. 잴 수 있는 MN을 2배 하면 건널 수 없는 BC를 알 수 있다는 게 이 정리의 쓸모예요.",
    core: "잰 MN의 2배가 못 재는 BC!",
  },
  {
    id: "m2u5e119", lessonId: L, type: "multi",
    prompt: `점 M, N이 각각 ${gsym("ABC", "tri")}의 두 변 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점일 때, 다음 중 옳은 것을 모두 고르세요.`,
    options: [
      "MN과 BC는 서로 평행해요",
      "MN의 길이는 BC의 절반이에요",
      "△AMN과 △ABC는 닮음이고 닮음비는 1:2예요",
      "△AMN의 넓이는 △ABC의 넓이의 절반이에요",
      "MN의 길이는 BC의 2배예요",
    ],
    answer: [0, 1, 2], diff: 3,
    explain: "<span class='xh'>정답 풀이</span>중점연결정리의 성질을 하나씩 확인해요.<br>① 두 변의 중점을 이으면 MN∥BC예요<br>② 길이는 MN=½BC예요<br>③ ∠AMN=∠B, ∠ANM=∠C라 △AMN∽△ABC이고 대응변의 비가 1:2라 닮음비는 1:2예요<span class='xh'>오답 하나씩 격파</span>넓이가 절반이라는 설명은 틀려요. 닮음비가 1:2이면 넓이의 비는 그 제곱인 1:4라, △AMN의 넓이는 △ABC의 4분의 1이에요. MN이 BC의 2배라는 설명도 방향이 반대라 틀렸어요. MN은 절반이라 BC보다 짧아야 해요. 평행, 절반, 닮음비 1:2 세 가지가 이 정리의 핵심 성질이에요.",
    core: "닮음비 1:2면 넓이비는 1:4!",
  },
  {
    id: "m2u5e120", lessonId: L, type: "multi",
    prompt: `사각형 ABCD의 네 변의 중점을 차례로 이어 사각형 PQRS를 만들었어요. 다음 중 옳은 것을 모두 고르세요.`,
    options: [
      "PQRS는 항상 평행사변형이에요",
      "PQ와 RS의 길이는 서로 같아요",
      "PQRS의 둘레는 두 대각선의 길이의 합과 같아요",
      "PQRS는 항상 마름모예요",
      "PQRS의 넓이는 사각형 ABCD의 넓이와 같아요",
    ],
    answer: [0, 1, 2], diff: 3,
    explain: "<span class='xh'>정답 풀이</span>어떤 사각형이든 네 변의 중점을 이으면 성질이 정해져요.<br>① 마주 보는 두 변이 각각 대각선의 절반이라 PQRS는 항상 평행사변형이에요<br>② PQ와 RS는 둘 다 대각선 AC의 절반이라 길이가 같아요<br>③ 네 변의 합이 ½AC+½BD+½AC+½BD라 둘레는 두 대각선의 합과 같아요<span class='xh'>오답 하나씩 격파</span>항상 마름모라는 설명은 틀려요. 네 변이 모두 같아지려면 두 대각선의 길이가 같아야 하는데 일반 사각형에서는 그렇지 않아요. 넓이가 원래 사각형과 같다는 설명도 틀렸어요. 중점 사각형의 넓이는 원래 사각형의 절반이에요. 평행사변형이 된다는 것과 둘레가 대각선의 합이라는 점이 늘 성립하는 성질이에요.",
    core: "네 변 중점 사각형은 언제나 평행사변형!",
  },
  {
    id: "m2u5e121", lessonId: L, type: "num",
    prompt: `점 M, N이 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이고 ${gsym("BC", "seg")}=34 cm예요. ${gsym("MN", "seg")}의 길이는 몇 cm인지 구하세요.`,
    answer: "17", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>두 변의 중점을 이은 선분은 밑변의 절반이에요.<br>① MN=½BC예요<br>② MN=½×34<br>③ MN=<b>17 cm</b><span class='xh'>계산 실수 격파</span>34를 절반으로 나눌 때 2로 나눠야 하는데 그대로 두면 34 cm가 나와요. 반대로 2를 곱해 68 cm로 답하면 절반과 2배를 혼동한 거예요. 34를 4로 나눠 8.5 cm로 적는 것도 절반을 두 번 적용한 실수예요. 중점끼리 이으면 밑변의 절반이니 34÷2=17 cm가 정확하고, 17×2=34로 되짚으면 검산도 끝나요.",
    core: "MN은 밑변 BC의 절반, 34÷2=17!",
  },
  {
    id: "m2u5e122", lessonId: L, type: "num",
    prompt: `점 M, N이 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이고 ${gsym("MN", "seg")}=19 cm예요. ${gsym("BC", "seg")}의 길이는 몇 cm인지 구하세요.`,
    answer: "38", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>MN은 BC의 절반이니 BC는 MN의 2배예요.<br>① MN=½BC에서 BC=2×MN<br>② BC=2×19<br>③ BC=<b>38 cm</b><span class='xh'>계산 실수 격파</span>19를 그대로 두어 19 cm로 답하면 MN과 BC를 같다고 본 실수예요. 19를 절반으로 나눠 9.5 cm로 적으면 곱셈과 나눗셈을 뒤바꾼 거예요. 19에 3을 곱해 57 cm로 적는 것도 관계를 잘못 세운 경우예요. MN의 2배가 BC이므로 19×2=38 cm가 정확하고, 38의 절반이 19인지 되짚으면 검산까지 끝나요.",
    core: "BC는 MN의 2배, 19×2=38!",
  },
  {
    id: "m2u5e123", lessonId: L, type: "num",
    prompt: `사각형 ABCD의 네 변의 중점을 이어 만든 사각형 PQRS의 둘레는 몇 cm인지 구하세요. 두 대각선의 길이는 ${gsym("AC", "seg")}=13 cm, ${gsym("BD", "seg")}=17 cm예요.`,
    answer: "30", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>중점 사각형의 둘레는 두 대각선의 길이를 더한 것과 같아요.<br>① 네 변은 각각 대각선의 절반이라 둘레=½AC+½BD+½AC+½BD예요<br>② 정리하면 둘레=AC+BD예요<br>③ 둘레=13+17=<b>30 cm</b><span class='xh'>계산 실수 격파</span>13과 17을 더한 뒤 다시 절반으로 나눠 15 cm로 적으면 이미 절반을 반영한 공식을 한 번 더 나눈 실수예요. 13 cm나 17 cm처럼 한 대각선만 쓰면 나머지 절반 두 변을 빠뜨린 거예요. 각 변이 대각선의 절반이고 그런 변이 둘씩 있어 결국 두 대각선의 합인 30 cm가 되고, 네 변 6.5+8.5+6.5+8.5를 직접 더해도 30으로 같아요.",
    core: "중점 사각형 둘레 = AC+BD = 30!",
  },
  {
    id: "m2u5e124", lessonId: L, type: "num",
    prompt: `삼각형의 세 변의 중점을 이어 만든 삼각형의 둘레는 몇 cm인지 구하세요. 원래 삼각형의 둘레는 52 cm예요.`,
    answer: "26", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>세 중점을 이은 삼각형의 각 변은 마주 보는 변의 절반이에요.<br>① 세 변이 모두 절반이면 둘레도 절반이에요<br>② 안쪽 삼각형의 둘레=½×52<br>③ 둘레=<b>26 cm</b><span class='xh'>계산 실수 격파</span>52를 그대로 두어 52 cm로 답하면 절반으로 줄이는 과정을 빠뜨린 거예요. 52를 4로 나눠 13 cm로 적으면 절반을 두 번 적용한 실수이고, 2배를 해 104 cm로 답하면 방향을 반대로 잡은 거예요. 세 변이 각각 절반이라 둘레도 절반인 26 cm가 정확하고, 26×2=52로 되짚으면 검산까지 한 번에 끝나요.",
    core: "세 중점 삼각형 둘레는 절반, 52÷2=26!",
  },
  {
    id: "m2u5e125", lessonId: L, type: "num",
    prompt: `사다리꼴 ABCD에서 ${gsym("AD", "seg")}∥${gsym("BC", "seg")}이고 점 E, F는 각각 두 변 ${gsym("AB", "seg")}, ${gsym("DC", "seg")}의 중점이에요. ${gsym("AD", "seg")}=28 cm, ${gsym("BC", "seg")}=40 cm일 때, ${gsym("EF", "seg")}의 길이는 몇 cm인지 구하세요.`,
    answer: "34", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>사다리꼴에서 두 변의 중점을 이은 선분은 평행한 두 변의 평균이에요.<br>① EF=(AD+BC)÷2예요<br>② EF=(28+40)÷2<br>③ EF=<b>34 cm</b><span class='xh'>계산 실수 격파</span>28과 40을 더한 68을 그대로 두면 절반으로 나누는 과정을 빠뜨린 거예요. 40에서 28을 뺀 12로 답하면 두 변의 차를 구한 실수이고요. 합 68을 4로 나눠 17로 적으면 절반을 한 번 더 적용한 경우예요. 두 평행한 변을 더해 2로 나눈 (28+40)÷2=34 cm가 정확해요.",
    core: "사다리꼴 중간 선분은 두 변의 평균, 34!",
  },
  {
    id: "m2u5e126", lessonId: L, type: "word",
    prompt: "선분 위에 있으면서 그 선분을 길이가 같은 두 부분으로 나누는 점을 그 선분의 ___이라고 해요.",
    answer: "중점",
    bank: ["중점", "무게중심", "꼭짓점", "교점", "수선의 발", "원점", "중심", "끝점"],
    diff: 1,
    explain: "<span class='xh'>정답 풀이</span>선분을 똑같은 길이의 두 도막으로 나누는 한가운데 점이 <b>중점</b>이에요. 이 단원에서 두 중점을 이은 선분이 밑변의 절반이 되는 성질을 배웠죠.<span class='xh'>낱말 하나씩 격파</span>무게중심은 삼각형의 세 중선이 만나는 점이라 선분 하나를 나누는 점이 아니에요. 꼭짓점은 변과 변이 만나는 모서리 점이고, 교점은 두 선이 서로 만나 생기는 점이라 길이를 반으로 나눈다는 뜻이 없어요. 수선의 발은 수직으로 내린 선이 닿는 점, 원점은 수직선에서 기준이 되는 0의 자리, 중심은 원의 한가운데 점이라 모두 달라요. 끝점은 선분의 양 끝이라 가운데가 아니에요. 선분을 이등분하는 점의 이름은 중점 하나뿐이에요.",
    core: "선분을 이등분하는 한가운데 점이 중점!",
  },
  {
    id: "m2u5e127", lessonId: L, type: "word",
    prompt: "삼각형의 두 변의 중점을 이은 선분은 나머지 한 변과 평행하고 길이가 그 절반이에요. 이 정리를 삼각형의 ___라고 해요.",
    answer: "중점연결정리",
    bank: ["중점연결정리", "수직이등분선", "외심", "내심", "대각선", "둘레", "높이", "합동"],
    diff: 1,
    explain: "<span class='xh'>정답 풀이</span>두 변의 중점을 이으면 평행과 절반이 한꺼번에 따라 나오는 이 성질의 이름이 <b>중점연결정리</b>예요. 중점을 연결해서 얻는 정리라는 뜻 그대로죠.<span class='xh'>낱말 하나씩 격파</span>수직이등분선은 선분을 수직으로 반 나누는 직선이라 정리의 이름이 아니에요. 외심과 내심은 삼각형 안팎의 특별한 점을 부르는 말이고, 대각선은 다각형에서 꼭짓점을 잇는 선분이에요. 둘레와 높이는 도형의 길이를 재는 말이라 성질의 이름이 될 수 없어요. 합동은 두 도형이 완전히 포개지는 관계를 뜻해 이 정리와는 달라요. 중점을 이어 평행·절반을 얻는 정리는 중점연결정리예요.",
    core: "중점을 이으면 평행하고 절반, 그 이름이 중점연결정리!",
  },
];
