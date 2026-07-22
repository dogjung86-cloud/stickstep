// 중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리: 단원 종합 평가 풀 v2, 레슨 7 삼각형의 중점연결정리 (책 206쪽)
// (m2u5e110~e127) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u5-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 9 + multi 2 = 11 · num 7, diff 7/7/4. word 0(규격 v2, 교과서 실측 계승).
// 그림 원칙: 수치는 라벨 단위 병기("12 cm"·"x cm"), 관계 조건은 문두, 실각·실비 검산 완료(각 문항 주석).
// 트리플·앵커 배정은 설계표 §2·§2-1이 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import {
  m2ExamMidsegFig,
  m2ExamMidQuadFig,
} from "../../ui/examFiguresMath";

export const POOL_M2U5L7: ExamItem[] = [
  {
    // [슬롯 110] 검산: M, N이 중점이면 MN=½BC=46/2=23.
    id: "m2u5e110", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ${gsym("BC", "seg")}=46 cm일 때, ${gsym("MN", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamMidsegFig({
      B: 62, C: 48, ticks: true, paraMarks: true,
      labels: { BC: "46 cm", MN: "x cm" },
    }),
    answer: "23", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>삼각형의 두 변의 중점을 이은 선분은 나머지 변과 평행하고, 길이는 그 절반이에요(중점연결정리).<br>① M, N이 중점이라는 표시(같은 눈금)를 확인<br>② MN=½×BC=½×46=<b>23</b> ✓<span class='xh'>계산 실수 격파</span>92라고 답했다면 절반이 아니라 2배를 한 거예요. 중점을 이은 선분 MN은 밑변 BC보다 짧은 쪽이에요. 그림에서도 MN이 BC보다 위에 있는 짧은 선분이니, 계산 결과가 그림의 크기 감각과 맞는지 확인하면 방향 실수를 바로 잡을 수 있어요. 이 정리는 △AMN∽△ABC(닮음비 1:2, SAS)에서 나온 것이라, 닮음비 1:2만 기억해도 절반이 바로 보여요.",
    core: "중점끼리 이으면 평행+절반, 닮음비 1:2!",
  },
  {
    // [슬롯 111] 검산: BC=2×MN=2×16=32.
    id: "m2u5e111", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ${gsym("MN", "seg")}=16 cm일 때, ${gsym("BC", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamMidsegFig({
      B: 61, C: 49, ticks: true, paraMarks: true,
      labels: { MN: "16 cm", BC: "x cm" },
    }),
    answer: "32", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점연결정리를 거꾸로 써요.<br>① MN=½BC<br>② 16=½x이므로 x=16×2=<b>32</b> ✓<span class='xh'>계산 실수 격파</span>16÷2=8로 답했다면 방향이 뒤집힌 거예요. MN이 절반 쪽이니 BC는 그 2배죠. 그림에서 BC가 아래쪽의 긴 밑변이라는 위치 감각으로도 확인할 수 있어요. 이 정리는 △AMN∽△ABC(닮음비 1:2)의 특별한 경우라서, '절반'과 '2배' 중 어느 쪽을 쓸지는 구하는 변이 작은 삼각형 쪽인지 큰 삼각형 쪽인지로 판단하면 돼요. 검산: 16:32=1:2!",
    core: "역산은 ×2, MN이 절반이고 BC가 원본!",
  },
  {
    // [슬롯 112] 검산: MN∥BC → 동위각 ∠AMN=∠B=64°.
    id: "m2u5e112", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이고 ∠B=64°예요. ∠AMN의 크기는?`,
    figure: m2ExamMidsegFig({
      B: 64, C: 44, ticks: true, paraMarks: true,
    }),
    options: ["64°", "32°", "116°", "58°", "126°"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점연결정리의 '평행' 쪽을 쓰는 문제예요.<br>① M, N이 중점이므로 MN∥BC<br>② 평행선에서 동위각은 같으므로 ∠AMN=∠B=<b>64°</b> ✓<span class='xh'>오답 하나씩 격파</span>32°는 길이의 절반 규칙을 각에까지 적용한 값이에요. 절반이 되는 것은 길이(MN=½BC)뿐이고, 각은 평행 덕분에 그대로 복사돼요. 116°는 보각(180−64), 58°와 126°는 어림이죠. 중점연결정리가 주는 두 가지 결론(평행, 절반) 중 문제가 어느 쪽을 쓰는지 구분하는 연습이에요. 각을 물으면 평행, 길이를 물으면 절반이에요.",
    core: "각은 평행으로 복사, 절반은 길이 전용!",
  },
  {
    // [슬롯 113] 검산: 세 변 9·15·20(둘레 44) → 중점삼각형 각 변은 절반, 둘레 22.
    //  실각: 변 AB=9(대각 C)·AC=15(대각 B)·BC=20(대각 A) → A≈110°, B≈45°, C≈25°.
    id: "m2u5e113", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N, D는 ${gsym("ABC", "tri")} 세 변의 중점이에요. ${gsym("MND", "tri")}의 둘레는?`,
    figure: m2ExamMidsegFig({
      B: 45, C: 25, mode: "three", ticks: true,
      labels: { AB: "9 cm", AC: "15 cm", BC: "20 cm" },
    }),
    options: ["22 cm", "44 cm", "11 cm", "33 cm", "88 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>세 중점을 이으면 중점연결정리가 세 번 적용돼요.<br>① 각 변이 마주 보는 변의 절반: 9÷2, 15÷2, 20÷2<br>② 중점삼각형의 둘레=(9+15+20)÷2=44÷2=<b>22 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>44 cm는 원래 삼각형의 둘레를 그대로 답한 값이에요. 11 cm는 절반을 두 번 해 ¼로 줄인 값인데, 절반이 되는 것은 한 번뿐이죠. 33 cm는 둘레의 ¾, 88 cm는 반대로 2배를 한 값이에요. 변마다 따로 4.5, 7.5, 10을 구해 더해도 되지만, 세 변이 전부 절반이 되니 둘레도 통째로 절반이라는 사실을 쓰면 한 번의 나눗셈으로 끝나요.",
    core: "중점삼각형의 둘레 = 원래 둘레의 절반!",
  },
  {
    // [슬롯 114] 검산: M 중점+MN∥BC → N도 중점(정리의 역) → AN=½AC=9.
    id: "m2u5e114", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림의 ${gsym("ABC", "tri")}에서 점 M은 ${gsym("AB", "seg")}의 중점이고 ${gsym("MN", "seg")}∥${gsym("BC", "seg")}예요. ${gsym("AC", "seg")}=18 cm일 때, ${gsym("AN", "seg")}의 길이는?`,
    figure: m2ExamMidsegFig({
      B: 62, C: 47, ticks: true, paraMarks: true,
      labels: { AC: "18 cm" },
    }),
    options: ["9 cm", "18 cm", "6 cm", "12 cm", "4.5 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>중점 하나와 평행만으로 나머지 중점이 공짜로 나와요.<br>① M이 중점이고 MN∥BC이면, 평행선이 두 변을 같은 비(1:1)로 자르므로 N도 AC의 중점<br>② AN=½AC=½×18=<b>9 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>6 cm는 1:2로 잘린다고 착각한 값이에요. M이 중점이라는 것이 비를 1:1로 고정해 줘요. 4.5 cm는 ¼로 두 번 줄인 값, 12 cm는 ⅔ 어림이죠. 이 성질은 중점연결정리의 역방향(중점+평행→중점)으로, 정리를 앞뒤로 자유롭게 쓸 수 있는지 확인하는 단골 각도예요. 평행선의 비 성질(앞 레슨)과 중점이 만나는 다리이기도 하죠.",
    core: "중점+평행이면 반대편도 중점(정리의 역)!",
  },
  {
    // [슬롯 115] 검산: 바리뇽, PQ=½AC=44/2=22.
    id: "m2u5e115", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이에요. 대각선 ${gsym("AC", "seg")}=44 cm일 때, ${gsym("PQ", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamMidQuadFig({
      preset: 0, diag: "AC", ticks: true, shade: true,
      labels: { AC: "44 cm", PQ: "x cm" },
    }),
    answer: "22", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>사각형에 대각선 AC를 그으면 두 삼각형으로 나뉘어요.<br>① △ABC에서 P, Q는 두 변의 중점이므로 중점연결정리에 따라 PQ∥AC, PQ=½AC<br>② x=44÷2=<b>22</b> ✓<span class='xh'>이렇게 확인해요</span>사각형 문제처럼 보여도 대각선 하나를 그으면 삼각형의 중점연결정리 문제가 돼요. 반대쪽 △ACD에서도 SR=½AC=22가 되니 PQ=SR이고, 같은 방법으로 대각선 BD를 그으면 QR=PS=½BD예요. 두 쌍의 대변이 각각 같아지니 네 중점을 이은 사각형 PQRS는 언제나 평행사변형이 되죠. 44×2=88로 답했다면 절반과 2배의 방향이 뒤집힌 것이니 그림의 크기 감각으로 확인하세요.",
    core: "네 변의 중점 사각형은 대각선의 절반 변, 항상 평행사변형!",
  },
  {
    // [슬롯 116] 검산: PQ=SR=½AC=11, QR=PS=½BD=8 → 둘레 2(11+8)=38.
    id: "m2u5e116", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이에요. ${gsym("AC", "seg")}=22 cm, ${gsym("BD", "seg")}=16 cm일 때, 사각형 PQRS의 둘레는 몇 cm인지 구하세요.`,
    figure: m2ExamMidQuadFig({
      preset: 1, diag: "both", ticks: true, shade: true,
      labels: { AC: "22 cm", BD: "16 cm" },
    }),
    answer: "38", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 대각선이 각각 두 쌍의 변을 책임져요.<br>① PQ=SR=½AC=11<br>② QR=PS=½BD=8<br>③ 둘레=2×(11+8)=<b>38</b> ✓<br>정리하면 중점 사각형의 둘레는 두 대각선 길이의 합과 같아요.<span class='xh'>계산 실수 격파</span>(22+16)÷2=19로 답하면 절반을 한 번 더 나눈 거예요. 네 변이 각각 대각선의 절반이니 둘레(네 변의 합)는 절반×4, 즉 대각선 합(38) 그대로가 되죠. PQ가 어느 대각선의 절반인지 헷갈리면 △ABC 안에서 중점연결정리를 다시 그려 보세요. P, Q가 AB, BC의 중점이니 PQ는 AC와 짝이에요. 검산: 2×(11+8)=38=22+16!",
    core: "중점 사각형의 둘레 = 두 대각선의 합!",
  },
  {
    // [슬롯 117] 검산: BC=24 → MN=12 → PQ(△AMN의 중점연결)=6.
    id: "m2u5e117", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N은 ${gsym("ABC", "tri")}의 두 변 AB, AC의 중점이에요. 다시 ${gsym("AMN", "tri")}에서 두 변 AM, AN의 중점을 P, Q라 할 때, ${gsym("BC", "seg")}=24 cm이면 ${gsym("PQ", "seg")}의 길이는?`,
    figure: m2ExamMidsegFig({
      B: 60, C: 48, ticks: true, paraMarks: true,
      labels: { BC: "24 cm" },
    }),
    options: ["6 cm", "12 cm", "3 cm", "8 cm", "18 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>같은 정리를 두 번 겹쳐 써요.<br>① △ABC에서: MN=½BC=12<br>② △AMN에서: PQ=½MN=6<br>③ PQ=<b>6 cm</b> ✓<br>결국 PQ=¼BC, 절반의 절반이에요.<span class='xh'>오답 하나씩 격파</span>12 cm는 한 번만 적용하고 멈춘 값(MN)이에요. 문제는 두 번째 삼각형 안의 PQ까지 내려가라고 했죠. 3 cm는 ⅛로 세 번 줄인 값, 8 cm는 ⅓ 어림이에요. 정리를 반복 적용하면 ½, ¼, ⅛로 계속 줄어드는 구조가 보이는데, 이런 '접기 반복' 감각은 종이접기나 프랙털 무늬에서도 그대로 만나요.",
    core: "정리 반복 적용: 절반의 절반은 ¼!",
  },
  {
    // [슬롯 118] 바리뇽 진술 multi. 검산: 평행사변형 항상·PQ=½AC·AC=BD면 마름모 참.
    id: "m2u5e118", lessonId: "m2u5l7", type: "multi",
    prompt: "그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이에요. 옳은 것을 모두 고르세요.",
    figure: m2ExamMidQuadFig({
      preset: 2, diag: "both", ticks: true, shade: true,
    }),
    options: [
      "사각형 PQRS는 항상 평행사변형이다",
      `${gsym("PQ", "seg")}=½${gsym("AC", "seg")}이다`,
      `${gsym("AC", "seg")}=${gsym("BD", "seg")}이면 사각형 PQRS는 마름모가 된다`,
      `${gsym("PQ", "seg")}=½${gsym("BD", "seg")}이다`,
      "사각형 PQRS의 넓이는 사각형 ABCD의 넓이와 같다",
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>대각선 AC를 그으면 △ABC와 △ACD에서 중점연결정리가 두 번 적용돼요.<br>① PQ∥AC∥SR, PQ=SR=½AC → 한 쌍의 대변이 평행하고 같으니 <b>항상 평행사변형</b> ✓<br>② PQ=½AC ✓<br>③ AC=BD이면 PQ=QR이 되어 네 변이 모두 같아지니 마름모 ✓<span class='xh'>오답 하나씩 격파</span>PQ의 짝은 AC예요. P, Q가 AB, BC의 중점이라 △ABC 안에서 AC와 평행·절반 관계가 생기죠. BD의 절반이 되는 것은 QR과 PS예요. 넓이는 원래 사각형의 절반이 되는 것으로 알려져 있으니 같다는 진술은 틀려요. 아무리 찌그러진 사각형이라도 중점만 이으면 반듯한 평행사변형이 나온다는 것, 이 단원에서 가장 마법 같은 결론이에요.",
    core: "찌그러져도 중점을 이으면 평행사변형, 짝은 같은 삼각형 안에서!",
  },
  {
    // [슬롯 119] 검산: 세 변 12·17·21 둘레 50 → 중점삼각형 둘레 25. 실각 (12,21,17): A≈91°·B≈54°·C≈35°.
    id: "m2u5e119", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 M, N, D는 ${gsym("ABC", "tri")} 세 변의 중점이에요. ${gsym("MND", "tri")}의 둘레는 몇 cm인지 구하세요.`,
    figure: m2ExamMidsegFig({
      B: 54, C: 35, mode: "three", ticks: true,
      labels: { AB: "12 cm", AC: "17 cm", BC: "21 cm" },
    }),
    answer: "25", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>세 중점을 이으면 각 변이 마주 보는 변의 절반이 돼요.<br>① 원래 둘레: 12+17+21=50<br>② 중점삼각형의 둘레는 그 절반: 50÷2=<b>25</b> ✓<span class='xh'>계산 실수 격파</span>변마다 6, 8.5, 10.5를 구해 더해도 25가 나오지만, 소수 계산이 끼어들어 실수 여지가 커져요. 세 변이 전부 절반이 되니 둘레도 통째로 절반이라는 성질을 쓰면 나눗셈 한 번으로 끝나죠. 12+17+21을 12+17=29, 29+21=50으로 차분히 더하는 것만 조심하면 돼요. 각 변의 절반이 어느 변과 짝인지(MN↔BC처럼 마주 보는 변) 헷갈려도 둘레 계산에는 영향이 없다는 것도 이 접근의 장점이에요.",
    core: "셋 다 절반이면 둘레도 절반, 통째로 나눠라!",
  },
  {
    // [슬롯 120] 검산: ∠C=180−70−62=48, MN∥BC 동위각 → ∠ANM=∠C=48°.
    id: "m2u5e120", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이고 ∠A=70°, ∠B=62°예요. ∠ANM의 크기는?`,
    figure: m2ExamMidsegFig({
      B: 62, C: 48, ticks: true, paraMarks: true,
    }),
    options: ["48°", "62°", "70°", "55°", "42°"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>두 단계로 풀어요.<br>① 삼각형 내각의 합: ∠C=180°−70°−62°=48°<br>② MN∥BC이므로 동위각 ∠ANM=∠C=<b>48°</b> ✓<span class='xh'>오답 하나씩 격파</span>62°는 ∠B를 그대로 옮긴 값인데, ∠ANM의 동위각 짝은 같은 쪽인 ∠C예요(∠AMN의 짝이 ∠B죠). N이 AC 위의 점이니 C 쪽 각과 짝이라고 위치로 기억하면 좋아요. 70°는 ∠A를 옮긴 값, 55°와 42°는 어림이에요. 내각의 합으로 빠진 각을 채우고, 평행으로 복사하는 두 동작을 이어 붙이는 전형적인 2단 문제예요.",
    core: "빠진 각은 내각 합으로, 복사는 같은 쪽 동위각으로!",
  },
  {
    // [슬롯 121] 검산: MN=½×28=14.
    id: "m2u5e121", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ${gsym("BC", "seg")}=28 cm일 때, ${gsym("MN", "seg")}의 길이는?`,
    figure: m2ExamMidsegFig({
      B: 63, C: 46, ticks: true, paraMarks: true,
      labels: { BC: "28 cm" },
    }),
    options: ["14 cm", "56 cm", "28 cm", "7 cm", "21 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점연결정리 그대로예요.<br>① M, N이 중점(그림의 같은 눈금 표시)<br>② MN=½BC=½×28=<b>14 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>56 cm는 2배를 한 값인데, MN은 위쪽의 짧은 선분이니 원본보다 길어질 수 없어요. 7 cm는 ¼로 두 번 나눈 값, 21 cm는 ¾ 어림이에요. 근거가 궁금하면 △AMN과 △ABC를 보세요. AM:AB=AN:AC=1:2에 ∠A가 공통이니 SAS 닮음이고, 닮음비 1:2에서 절반이 나와요. 정리는 닮음의 특별한 경우라는 연결을 기억하면 공식이 아니라 이해로 남아요.",
    core: "중점연결 = 닮음비 1:2의 특별한 경우!",
  },
  {
    // [슬롯 122] 검산: 중점삼각형 둘레 27 → 원 둘레 54.
    id: "m2u5e122", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 M, N, D는 ${gsym("ABC", "tri")} 세 변의 중점이에요. ${gsym("MND", "tri")}의 둘레가 27 cm일 때, ${gsym("ABC", "tri")}의 둘레는?`,
    figure: m2ExamMidsegFig({
      B: 57, C: 49, mode: "three", ticks: true,
    }),
    options: ["54 cm", "13.5 cm", "27 cm", "81 cm", "40.5 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>절반 관계를 거꾸로 타고 올라가요.<br>① 중점삼각형의 둘레=원래 둘레의 ½<br>② 27=½x이므로 x=<b>54 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>13.5 cm는 절반을 한 번 더 나눈 값이에요. 역산 문제인데 정방향 공식을 또 적용한 거죠. 81 cm는 3배, 40.5 cm는 1.5배로 어림한 값이에요. 어느 쪽이 절반이고 어느 쪽이 원본인지는 그림에서 바로 보여요. 가운데 작은 삼각형이 절반 쪽이니 바깥 큰 삼각형은 2배죠. 역산 유형은 '주어진 것이 절반 쪽인가 원본 쪽인가'를 한 줄 적고 시작하면 방향 실수가 사라져요.",
    core: "역산 첫 줄: 주어진 값이 절반 쪽인지 원본 쪽인지!",
  },
  {
    // [슬롯 123] 검산: 둘레 46 = AC+BD → BD=46−26=20.
    id: "m2u5e123", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이에요. 사각형 PQRS의 둘레가 46 cm이고 ${gsym("AC", "seg")}=26 cm일 때, ${gsym("BD", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: m2ExamMidQuadFig({
      preset: 0, diag: "both", ticks: true,
      labels: { AC: "26 cm" },
    }),
    answer: "20", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>중점 사각형의 둘레가 두 대각선의 합과 같다는 성질을 거꾸로 써요.<br>① 둘레=AC+BD<br>② 46=26+BD<br>③ BD=<b>20</b> ✓<span class='xh'>계산 실수 격파</span>46−26을 계산한 뒤 다시 2로 나누거나 2를 곱하고 싶어지는 유혹을 참으세요. 둘레 속에 이미 '절반×4'가 들어 있어서, 둘레와 대각선 합은 1:1로 맞아떨어져요(PQ=SR=½AC로 AC 몫이 26, QR=PS=½BD로 BD 몫이 20). 성질을 유도 과정째 기억하면 역산에서 계수를 붙일지 말지 흔들리지 않아요. 검산: ½×26×2+½×20×2=26+20=46!",
    core: "둘레=대각선 합, 역산은 뺄셈 한 번!",
  },
  {
    // [슬롯 124] 검산: 두 번 접기, 중점삼각형의 중점삼각형 둘레 = 원 둘레의 ¼: 60→15.
    id: "m2u5e124", lessonId: "m2u5l7", type: "mcq",
    prompt: `${gsym("ABC", "tri")}의 세 변의 중점을 이어 ${gsym("MND", "tri")}를 만들고, 다시 ${gsym("MND", "tri")} 세 변의 중점을 이어 새 삼각형을 만들었어요. ${gsym("ABC", "tri")}의 둘레가 60 cm일 때, 새 삼각형의 둘레는?`,
    figure: m2ExamMidsegFig({
      B: 59, C: 47, mode: "three", ticks: true,
    }),
    options: ["15 cm", "30 cm", "20 cm", "7.5 cm", "12 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>절반이 두 번 겹쳐요.<br>① 첫 중점삼각형의 둘레: 60×½=30<br>② 두 번째 중점삼각형의 둘레: 30×½=<b>15 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>30 cm는 한 번에서 멈춘 값이고, 7.5 cm는 세 번 접은 값이에요. 몇 번 접었는지 세는 것이 전부죠. 20 cm는 ⅓로 오해한 값인데, 중점은 언제나 ½이지 ⅓이 아니에요. 이렇게 같은 규칙을 반복하면 60→30→15→7.5로 절반씩 줄어드는 수열이 나와요. 반복 축소의 감각은 프랙털 도형(시에르핀스키 삼각형)이 만들어지는 원리 그 자체랍니다.",
    core: "반복 접기는 ½을 거듭제곱처럼, 횟수만 세라!",
  },
  {
    // [슬롯 125] MS 진술 multi. 검산: MN∥BC·MN=15·닮음 참, ⅓ 거짓, AM=AN 일반 거짓.
    id: "m2u5e125", lessonId: "m2u5l7", type: "multi",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이고 ${gsym("BC", "seg")}=30 cm예요. 옳은 것을 모두 고르세요.`,
    figure: m2ExamMidsegFig({
      B: 62, C: 46, ticks: true, paraMarks: true,
      labels: { BC: "30 cm" },
    }),
    options: [
      `${gsym("MN", "seg")}∥${gsym("BC", "seg")}`,
      `${gsym("MN", "seg")}=15 cm`,
      `${gsym("AMN", "tri")}∽${gsym("ABC", "tri")}`,
      `${gsym("MN", "seg")}은 ${gsym("BC", "seg")}의 ⅓이다`,
      `${gsym("AM", "seg")}=${gsym("AN", "seg")}이다`,
    ],
    answer: [0, 1, 2], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점연결정리의 두 결론과 그 뿌리를 한 번에 확인해요.<br>① MN∥BC ✓<br>② MN=½×30=15 cm ✓<br>③ 뿌리인 닮음: AM:AB=AN:AC=1:2, ∠A 공통으로 SAS 닮음 ✓<span class='xh'>오답 하나씩 격파</span>⅓은 무게중심 단원에서 만날 비율이고 중점연결은 언제나 ½이에요. AM=AN은 AB=AC인 이등변삼각형일 때만 우연히 성립하는 것으로, 중점이라는 조건은 각 변 '안에서' 절반이라는 뜻이지 두 변끼리 같다는 뜻이 아니에요. 조건이 말하는 범위를 넘겨짚지 않는 것도 판별의 기술이에요.",
    core: "중점연결은 ½·평행·닮음 세트, ⅓은 남의 단원!",
  },
  {
    // [슬롯 126] 검산: BC=2×13=26.
    id: "m2u5e126", lessonId: "m2u5l7", type: "num",
    prompt: `그림에서 점 M, N은 각각 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}의 중점이에요. ${gsym("MN", "seg")}=13 cm일 때, ${gsym("BC", "seg")}의 길이 <i class='mv'>x</i>는 몇 cm인지 구하세요.`,
    figure: m2ExamMidsegFig({
      B: 58, C: 50, ticks: true, paraMarks: true,
      labels: { MN: "13 cm", BC: "x cm" },
    }),
    answer: "26", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>절반 관계를 거꾸로 써요.<br>① MN=½BC<br>② 13=½x, x=13×2=<b>26</b> ✓<span class='xh'>계산 실수 격파</span>13÷2=6.5로 가면 방향이 뒤집힌 거예요. 답이 소수로 나오는 순간 방향을 의심해 보는 것도 좋은 습관이에요(이 단원의 답은 대부분 자연수로 설계되니까요). MN은 위쪽 작은 삼각형의 변이고 BC는 바닥의 원본이니, 원본을 구할 때는 2배가 자연스럽죠. 검산: 13:26=1:2로 중점연결정리의 비와 정확히 맞고, MN이 짧고 BC가 긴 그림의 위치 감각과도 일치해요!",
    core: "원본 복원은 ×2, 소수가 나오면 방향 의심!",
  },
  {
    // [슬롯 127] 검산: AC=2×PQ=18, BD=2×QR=14 → AC+BD=32.
    id: "m2u5e127", lessonId: "m2u5l7", type: "mcq",
    prompt: `그림에서 점 P, Q, R, S는 사각형 ABCD 네 변의 중점이고 ${gsym("PQ", "seg")}=9 cm, ${gsym("QR", "seg")}=7 cm예요. ${gsym("AC", "seg")}+${gsym("BD", "seg")}의 값은?`,
    figure: m2ExamMidQuadFig({
      preset: 1, diag: "both", ticks: true,
      labels: { PQ: "9 cm", QR: "7 cm" },
    }),
    options: ["32 cm", "16 cm", "23 cm", "18 cm", "28 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>변에서 대각선으로 거꾸로 올라가요.<br>① PQ=½AC이므로 AC=2×9=18<br>② QR=½BD이므로 BD=2×7=14<br>③ AC+BD=18+14=<b>32 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>16 cm는 9+7로, 변의 합에서 멈춘 값이에요. 대각선은 각 변의 2배이니 합도 2배가 되죠. 23 cm나 18 cm는 한쪽만 2배 한 값, 28 cm는 14×2로 헷갈린 값이에요. PQ의 짝이 AC(P, Q가 있는 쪽 삼각형의 밑변)이고 QR의 짝이 BD라는 대응만 정확하면, 나머지는 2배 두 번과 덧셈뿐이에요. 검산: 중점 사각형 둘레 2×(9+7)=32=AC+BD로 앞 문제의 성질과도 맞아떨어져요!",
    core: "변→대각선은 ×2, 짝은 같은 삼각형 안에서!",
  },
];
