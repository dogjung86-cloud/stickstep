// 중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리: 단원 종합 평가 풀, 레슨 9 삼각형의 무게중심: 균형의 한 점 (m2u5e146~e163) · 책 208~210쪽
// 유형 쿼터: mcq 8 + multi 2 = 10 · num 6 · word 2, diff 7/7/4.
// 함정 계보(교과서 대조): 2:1 방향 혼동(꼭짓점 쪽이 2), 6등분 넓이(△GBC=⅓), 무게중심↔외심 성질 혼동.
// 수치 앵커 회피: 레슨 AD 18·AG8·GD5·중선 24·GD7·넓이 36·42·BC16·30 회피(브리프 준수).
// num 정답 등록부(중복 없음): 9·24·16·18·13·22.
// word 정답: 무게중심(e162)·중선(e163).
// 표기: em대시 금지, 뺄셈·차는 −(U+2212), 기하 기호는 gsym·유니코드 리터럴(mfmt 미사용).
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import { m2ExamCentroidFig } from "../../ui/examFiguresMath";
const L = "m2u5l9";

export const POOL_M2U5L9: ExamItem[] = [
  {
    id: "m2u5e146", lessonId: L, type: "mcq",
    prompt: `그림에서 점 G는 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("AD", "seg")}는 중선이에요. ${gsym("AD", "seg")}=21 cm일 때, ${gsym("AG", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({ B: 56, C: 50, medians: ["AD"], showG: true, gName: "G", segLabels: [{ on: "AD", label: "21 cm" }] }),
    options: ["14 cm", "7 cm", "10.5 cm", "42 cm", "21 cm"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>무게중심은 중선을 꼭짓점 쪽에서 2:1로 나눠요.<br>① AG:GD=2:1이라 AG는 중선 전체의 ⅔예요<br>② AG=⅔×AD=⅔×21<br>③ AG=<b>14 cm</b><span class='xh'>오답 하나씩 격파</span>7 cm는 중선의 ⅓인 GD의 길이라 무게중심에서 대변 쪽 조각이에요. 10.5 cm는 21의 절반이라 2:1이 아니라 1:1로 나눈 값이고요. 42 cm는 21을 2배 한 값, 21 cm는 중선 전체를 그대로 옮긴 값이에요. 꼭짓점 쪽이 2, 대변 쪽이 1이라 AG는 전체의 ⅔인 14 cm가 맞아요.",
    core: "무게중심은 중선을 2:1, AG=⅔중선!",
  },
  {
    id: "m2u5e147", lessonId: L, type: "mcq",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("ABC", "tri")}의 넓이가 48 cm²일 때, ${gsym("GBC", "tri")}의 넓이는?`,
    figure: m2ExamCentroidFig({ B: 54, C: 52, medians: ["AD", "BE", "CF"], showG: true, gName: "G", shade: ["GBD", "GDC"] }),
    options: ["8 cm²", "16 cm²", "24 cm²", "12 cm²", "6 cm²"],
    answer: 1, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>세 중선은 삼각형을 넓이가 같은 6조각으로 나눠요.<br>① 무게중심에서 그은 세 중선이 △ABC를 6등분해요<br>② △GBC는 그중 2조각이라 전체의 ⅓이에요<br>③ △GBC=⅓×48=<b>16 cm²</b><span class='xh'>오답 하나씩 격파</span>8 cm²는 6조각 중 한 조각의 넓이라 △GBC의 절반만 본 값이에요. 24 cm²는 전체의 절반이라 세 조각을 센 셈이고요. 12 cm²는 ¼, 6 cm²는 1/8로 나눈 값이라 6등분과 맞지 않아요. △GBC는 6조각 중 2조각이니 전체의 ⅓인 16 cm²가 정확해요.",
    core: "세 중선은 6등분, △GBC는 전체의 ⅓!",
  },
  {
    id: "m2u5e148", lessonId: L, type: "mcq",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심이고, G를 지나 ${gsym("BC", "seg")}에 평행한 직선이 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}와 만나는 점을 각각 E, F라고 해요. 이때 ${gsym("EF", "seg")}와 ${gsym("BC", "seg")}의 관계로 옳은 것은?`,
    figure: m2ExamCentroidFig({ B: 58, C: 46, medians: ["AD"], showG: true, gName: "G", ef: true, efNames: ["E", "F"] }),
    options: [
      "EF는 BC의 ½이에요",
      "EF는 BC와 길이가 같아요",
      "EF는 BC의 ⅔예요",
      "EF는 BC의 ⅓이에요",
      "EF는 BC의 ¾이에요",
    ],
    answer: 2, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>무게중심은 중선을 꼭짓점 쪽에서 2:1로 나누니, A에서 G까지가 중선의 ⅔예요.<br>① G를 지나 BC에 평행한 직선은 A에서 ⅔ 되는 높이에 있어요<br>② 닮음에서 EF:BC=AG:AD=2:3이에요<br>③ 따라서 EF는 BC의 <b>⅔</b>예요<span class='xh'>오답 하나씩 격파</span>½은 E, F가 두 변의 중점일 때, 곧 중점을 이은 선분의 경우라 무게중심을 지나는 이 직선과는 위치가 달라요. BC와 같다는 설명은 두 선이 겹칠 때뿐이고요. ⅓이나 ¾은 A에서의 높이 비를 잘못 잡은 값이에요. 무게중심은 A에서 ⅔ 지점이라 EF도 BC의 ⅔예요.",
    core: "무게중심 지나는 평행선 EF는 BC의 ⅔!",
  },
  {
    id: "m2u5e149", lessonId: L, type: "mcq",
    prompt: `점 G는 ${gsym("ABC", "tri")}의 무게중심이고, 점 G'은 ${gsym("GBC", "tri")}의 무게중심이에요. 중선 ${gsym("AD", "seg")}=45 cm일 때, ${gsym("GG'", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({ B: 52, C: 50, medians: ["AD"], showG: true, gName: "G", g2: true, g2Name: "G'", segLabels: [{ on: "AD", label: "45 cm" }] }),
    options: ["15 cm", "5 cm", "30 cm", "10 cm", "20 cm"],
    answer: 3, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>무게중심의 성질을 두 번 적용해요.<br>① AD=45이고 GD=⅓×45=15 cm예요<br>② G'은 △GBC의 무게중심이라 중선 GD를 2:1로 나눠요<br>③ GG'=⅔×GD=⅔×15=<b>10 cm</b><span class='xh'>오답 하나씩 격파</span>15 cm는 GD까지만 구하고 멈춘 값이에요. 5 cm는 GD의 ⅓이라 G'에서 D까지인 나머지 조각이고요. 30 cm는 큰 삼각형의 AG(⅔×45)를 잘못 가져온 값, 20 cm는 근거 없는 값이에요. △GBC에서 G'이 GD를 2:1로 나누니 GG'은 GD의 ⅔인 10 cm가 맞아요.",
    core: "GD의 ⅔가 GG', 15의 ⅔는 10!",
  },
  {
    id: "m2u5e150", lessonId: L, type: "mcq",
    prompt: `∠A=90°인 직각삼각형 ABC에서 점 G는 무게중심이고 ${gsym("AD", "seg")}는 빗변 ${gsym("BC", "seg")}에 그은 중선이에요. ${gsym("GD", "seg")}=5 cm일 때, 빗변 ${gsym("BC", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({ B: 45, C: 45, medians: ["AD"], showG: true, gName: "G", rightAt: "A", segLabels: [{ on: "GD", label: "5 cm" }] }),
    options: ["10 cm", "15 cm", "5 cm", "20 cm", "30 cm"],
    answer: 4, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>직각삼각형에서 빗변에 그은 중선은 빗변의 절반이에요.<br>① GD=5이고 무게중심이 중선을 2:1로 나눠 GD는 ⅓이라 AD=3×5=15 cm예요<br>② 빗변에 그은 중선 AD는 빗변 BC의 절반이라 BC=2×AD<br>③ BC=2×15=<b>30 cm</b><span class='xh'>오답 하나씩 격파</span>5 cm는 GD 그대로, 15 cm는 중선 AD까지만 구한 값이에요. 10 cm는 GD를 곧바로 2배 해 중선 단계를 건너뛴 값이고요. 20 cm는 근거가 없어요. GD의 3배가 중선 AD(15), 그 중선의 2배가 빗변 BC라서 30 cm가 정확해요.",
    core: "빗변 중선은 빗변의 절반, GD의 6배!",
  },
  {
    id: "m2u5e151", lessonId: L, type: "mcq",
    prompt: `삼각형에서 무게중심에 대한 다음 설명 중 옳은 것은?`,
    options: [
      "무게중심은 세 중선이 만나는 점이에요",
      "무게중심은 세 변의 수직이등분선이 만나는 점이에요",
      "무게중심은 세 각의 이등분선이 만나는 점이에요",
      "무게중심은 세 꼭짓점에서 같은 거리에 있어요",
      "무게중심은 세 변에서 같은 거리에 있어요",
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>삼각형의 세 중선은 반드시 한 점에서 만나고, 그 점이 무게중심이에요.<br>① 중선은 꼭짓점과 대변의 중점을 이은 선분이에요<br>② 세 중선이 모두 지나는 한 점이 무게중심이에요<br>③ 이 점은 중선을 2:1로 나눠요<span class='xh'>오답 하나씩 격파</span>세 변의 수직이등분선이 만나는 점은 외심이고, 세 각의 이등분선이 만나는 점은 내심이라 무게중심과 다른 점이에요. 세 꼭짓점에서 같은 거리에 있는 점은 외심, 세 변에서 같은 거리에 있는 점은 내심의 성질이고요. 무게중심은 오직 세 중선이 만나는 점으로 정의돼요.",
    core: "무게중심 = 세 중선이 만나는 점!",
  },
  {
    id: "m2u5e152", lessonId: L, type: "mcq",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("AD", "seg")}는 중선이에요. ${gsym("GD", "seg")}=8 cm일 때, ${gsym("AG", "seg")}의 길이는?`,
    options: ["4 cm", "16 cm", "8 cm", "24 cm", "12 cm"],
    answer: 1, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>무게중심은 중선을 꼭짓점 쪽에서 2:1로 나눠요.<br>① 꼭짓점 쪽 AG가 2, 대변 쪽 GD가 1이에요<br>② AG:GD=2:1이라 AG=2×GD<br>③ AG=2×8=<b>16 cm</b><span class='xh'>오답 하나씩 격파</span>4 cm는 AG를 GD의 절반으로 본 값인데, 더 긴 쪽은 꼭짓점 쪽 AG예요. 8 cm는 GD를 그대로 옮긴 값이고요. 24 cm는 중선 전체 AD의 길이(3×8)라 AG가 아니에요. 12 cm는 근거 없는 값이고요. 대변 쪽 GD가 1, 꼭짓점 쪽 AG가 2라서 AG는 GD의 2배인 16 cm예요.",
    core: "꼭짓점 쪽이 2! AG=2×GD=16!",
  },
  {
    id: "m2u5e153", lessonId: L, type: "mcq",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("BE", "seg")}는 꼭짓점 B에서 그은 중선이에요(E는 ${gsym("CA", "seg")}의 중점). ${gsym("BE", "seg")}=27 cm일 때, ${gsym("BG", "seg")}의 길이는?`,
    figure: m2ExamCentroidFig({ B: 50, C: 58, medians: ["BE"], showG: true, gName: "G", ticks: ["CE"], segLabels: [{ on: "BE", label: "27 cm" }] }),
    options: ["9 cm", "13.5 cm", "18 cm", "54 cm", "27 cm"],
    answer: 2, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>중선이 AD가 아니어도 무게중심은 어느 중선이든 2:1로 나눠요.<br>① BE도 중선이라 BG:GE=2:1이에요<br>② BG는 중선 BE의 ⅔예요<br>③ BG=⅔×27=<b>18 cm</b><span class='xh'>오답 하나씩 격파</span>9 cm는 중선의 ⅓인 GE라 무게중심에서 대변 쪽 조각이에요. 13.5 cm는 27의 절반이라 2:1이 아니라 1:1로 나눈 값이고요. 54 cm는 27을 2배 한 값, 27 cm는 중선 전체를 그대로 옮긴 값이에요. 어느 중선이든 꼭짓점 쪽이 ⅔라 BG는 18 cm예요.",
    core: "어느 중선이든 2:1, BG=⅔BE!",
  },
  {
    id: "m2u5e154", lessonId: L, type: "multi",
    prompt: `삼각형의 무게중심 G에 대한 다음 설명 중 옳은 것을 모두 고르세요.`,
    options: [
      "세 중선은 반드시 한 점 G에서 만나요",
      "무게중심은 각 중선을 꼭짓점 쪽에서 2:1로 나눠요",
      "세 중선이 나눈 6개의 작은 삼각형은 넓이가 모두 같아요",
      "무게중심은 세 꼭짓점에서 같은 거리에 있어요",
      "무게중심은 삼각형의 세 변에 모두 닿는 원의 중심이에요",
    ],
    answer: [0, 1, 2], diff: 3,
    explain: "<span class='xh'>정답 풀이</span>무게중심의 세 가지 핵심 성질을 확인해요.<br>① 삼각형의 세 중선은 항상 한 점에서 만나고 그 점이 무게중심이에요<br>② 무게중심은 각 중선을 꼭짓점 쪽에서 2:1로 나눠요<br>③ 세 중선이 만든 6개의 작은 삼각형은 넓이가 서로 같아요<span class='xh'>오답 하나씩 격파</span>세 꼭짓점에서 같은 거리에 있는 점은 외심이지 무게중심이 아니에요. 세 변에 모두 닿는 원의 중심은 내심이고요. 이 둘은 무게중심과 위치가 다른 점이에요. 한 점에서 만남, 2:1로 나눔, 6조각 넓이가 같음 세 가지가 무게중심의 성질이에요.",
    core: "한 점·2:1·6등분 넓이가 무게중심 성질!",
  },
  {
    id: "m2u5e155", lessonId: L, type: "multi",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심일 때, 넓이에 대한 다음 설명 중 옳은 것을 모두 고르세요.`,
    options: [
      "△GBC, △GCA, △GAB의 넓이는 서로 같아요",
      "△GBC의 넓이는 △ABC의 ⅓이에요",
      "중선 AD가 나눈 △ABD와 △ACD의 넓이는 같아요",
      "△GBC의 넓이는 △ABC의 절반이에요",
      "△GBD와 △GDC의 넓이는 서로 달라요",
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>무게중심과 중선이 만드는 넓이 관계를 살펴요.<br>① 무게중심에서 각 변으로 이룬 △GBC, △GCA, △GAB는 넓이가 모두 같아요(각각 전체의 ⅓)<br>② 그래서 △GBC는 △ABC의 ⅓이에요<br>③ 중선 AD는 밑변 BC를 이등분하므로 △ABD와 △ACD의 넓이도 같아요<span class='xh'>오답 하나씩 격파</span>△GBC가 전체의 절반이라는 설명은 틀려요. ⅓씩 세 조각으로 나뉘니 절반이 아니에요. △GBD와 △GDC가 서로 다르다는 설명도 틀렸어요. D가 BC의 중점이라 두 삼각형은 밑변과 높이가 같아 넓이가 같아요. 세 조각이 같음, △GBC가 ⅓, 중선이 넓이를 이등분함이 옳은 관계예요.",
    core: "무게중심은 삼각형을 넓이 같은 셋으로!",
  },
  {
    id: "m2u5e156", lessonId: L, type: "num",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("AD", "seg")}는 중선이에요. ${gsym("AD", "seg")}=27 cm일 때, ${gsym("GD", "seg")}의 길이는 몇 cm인지 구하세요.`,
    answer: "9", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>무게중심은 중선을 2:1로 나누니 대변 쪽 GD는 중선의 ⅓이에요.<br>① AG:GD=2:1이라 GD=⅓×AD<br>② GD=⅓×27<br>③ GD=<b>9 cm</b><span class='xh'>계산 실수 격파</span>18 cm는 꼭짓점 쪽 AG(⅔×27)라 GD가 아니에요. 27 cm를 그대로 두거나 절반인 13.5 cm로 적으면 2:1로 나눈다는 점을 놓친 거예요. 27을 2배 한 54 cm도 방향이 반대예요. 대변 쪽은 ⅓이라 GD=27÷3=9 cm가 정확하고, AG=18과 더해 27이 되는지 되짚으면 검산도 끝나요.",
    core: "대변 쪽 GD는 중선의 ⅓, 27÷3=9!",
  },
  {
    id: "m2u5e157", lessonId: L, type: "num",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("ABC", "tri")}의 넓이가 72 cm²예요. ${gsym("GAB", "tri")}의 넓이는 몇 cm²인지 구하세요.`,
    answer: "24", numKind: "int", unitLabel: "cm²", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>무게중심에서 각 변으로 이룬 세 삼각형은 넓이가 모두 같아요.<br>① △GAB는 △ABC의 ⅓이에요<br>② △GAB=⅓×72<br>③ △GAB=<b>24 cm²</b><span class='xh'>계산 실수 격파</span>36 cm²는 절반이라 세 조각이 아니라 두 조각으로 나눈 값이에요. 12 cm²는 6조각 중 한 조각(1/6)이라 △GAB의 절반만 본 값이고요. 72 cm²를 그대로 두면 나누는 과정을 빠뜨린 거예요. 무게중심은 삼각형을 넓이가 같은 세 조각으로 나누니 △GAB=72÷3=24 cm²예요.",
    core: "무게중심의 세 삼각형은 각각 ⅓, 72÷3=24!",
  },
  {
    id: "m2u5e158", lessonId: L, type: "num",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심이고, 세 중선이 ${gsym("ABC", "tri")}를 6개의 작은 삼각형으로 나눠요. ${gsym("ABC", "tri")}의 넓이가 96 cm²일 때, 작은 삼각형 한 개의 넓이는 몇 cm²인지 구하세요.`,
    answer: "16", numKind: "int", unitLabel: "cm²", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>세 중선은 삼각형을 넓이가 같은 6조각으로 나눠요.<br>① 작은 삼각형 한 개는 전체의 1/6이에요<br>② 한 조각=96÷6<br>③ 한 조각=<b>16 cm²</b><span class='xh'>계산 실수 격파</span>32 cm²는 96을 3으로 나눈 값이라 한 조각이 아니라 두 조각(△GBC 같은)의 넓이예요. 48 cm²는 절반이라 세 조각을 센 값이고요. 24 cm²는 4로 나눈 값이라 6등분과 맞지 않아요. 세 중선이 만든 조각은 6개라 96÷6=16 cm²가 정확하고, 16×6=96으로 되짚으면 검산도 한 번에 끝나요.",
    core: "세 중선은 넓이 같은 6조각, 96÷6=16!",
  },
  {
    id: "m2u5e159", lessonId: L, type: "num",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심이고, G를 지나 ${gsym("BC", "seg")}에 평행한 직선이 ${gsym("AB", "seg")}, ${gsym("AC", "seg")}와 만나는 점을 각각 E, F라고 해요. ${gsym("BC", "seg")}=27 cm일 때, ${gsym("EF", "seg")}의 길이는 몇 cm인지 구하세요.`,
    answer: "18", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>무게중심은 A에서 중선의 ⅔ 되는 지점이라, G를 지나는 평행선도 A에서 ⅔ 높이에 있어요.<br>① 닮음에서 EF:BC=2:3이에요<br>② EF=⅔×BC=⅔×27<br>③ EF=<b>18 cm</b><span class='xh'>계산 실수 격파</span>13.5 cm는 27의 절반이라 E, F를 중점으로 본 값인데, 무게중심을 지나는 직선은 더 아래인 A에서 ⅔ 지점에 있어요. 9 cm는 27의 ⅓이라 비를 거꾸로 잡은 값이고요. 27 cm를 그대로 두면 줄어드는 것을 놓친 거예요. 무게중심을 지나는 평행선은 BC의 ⅔라 18 cm가 정확해요.",
    core: "무게중심 지나는 평행선 EF=⅔BC, 18!",
  },
  {
    id: "m2u5e160", lessonId: L, type: "num",
    prompt: `점 D가 ${gsym("ABC", "tri")}에서 변 ${gsym("BC", "seg")}의 중점이고 ${gsym("AD", "seg")}는 중선이에요. ${gsym("BC", "seg")}=26 cm일 때, ${gsym("BD", "seg")}의 길이는 몇 cm인지 구하세요.`,
    answer: "13", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중선의 발 D는 대변 BC의 중점이에요.<br>① D가 BC의 중점이라 BD=½×BC<br>② BD=½×26<br>③ BD=<b>13 cm</b><span class='xh'>계산 실수 격파</span>26 cm를 그대로 두면 중점이 반으로 나눈다는 점을 놓친 거예요. 26을 2배 한 52 cm는 방향이 반대이고, 26을 3으로 나눈 값은 무게중심의 2:1과 헷갈린 경우예요. 중점은 BC를 반으로 나누니 BD=26÷2=13 cm가 정확하고, BD와 DC를 더해 26이 되는지 되짚으면 검산도 끝나요. 2:1로 나뉘는 건 중선 위의 무게중심이지 밑변이 아니라는 점을 구분하세요.",
    core: "중선의 발은 대변의 중점, 26÷2=13!",
  },
  {
    id: "m2u5e161", lessonId: L, type: "num",
    prompt: `점 G가 ${gsym("ABC", "tri")}의 무게중심이고 ${gsym("AD", "seg")}는 중선이에요. 꼭짓점 쪽 ${gsym("AG", "seg")}와 대변 쪽 ${gsym("GD", "seg")}의 길이의 차가 11 cm일 때, ${gsym("AG", "seg")}의 길이는 몇 cm인지 구하세요.`,
    answer: "22", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>무게중심은 중선을 2:1로 나누니 AG와 GD의 관계로 식을 세워요.<br>① AG:GD=2:1이라 GD를 <i class='mv'>k</i>라 하면 AG=2<i class='mv'>k</i>예요<br>② 차가 11이라 2<i class='mv'>k</i>−<i class='mv'>k</i>=11, 즉 GD=<i class='mv'>k</i>=11 cm예요<br>③ AG=2<i class='mv'>k</i>=2×11=<b>22 cm</b><span class='xh'>계산 실수 격파</span>11 cm는 차 그 자체이자 GD의 길이라 AG가 아니에요. 5.5 cm는 11을 절반으로 나눈 값이고, 33 cm는 중선 전체 AD(3<i class='mv'>k</i>)를 구한 값이에요. 차 11이 곧 GD와 같아지므로 AG는 그 2배인 22 cm가 정확해요.",
    core: "차가 곧 GD, AG는 그 2배인 22!",
  },
  {
    id: "m2u5e162", lessonId: L, type: "word",
    prompt: "두께가 고른 삼각형 모양의 판을 단 한 점으로 받쳐 수평으로 균형을 잡을 수 있는 점을 삼각형의 ___이라고 해요.",
    answer: "무게중심",
    bank: ["무게중심", "외심", "내심", "중점", "꼭짓점", "원점", "수선의 발", "대칭점"],
    diff: 1,
    explain: "<span class='xh'>정답 풀이</span>삼각형 판의 무게가 어느 쪽으로도 쏠리지 않는 균형점이 <b>무게중심</b>이에요. 수학에서는 세 중선이 만나는 점으로 찾을 수 있고, 이 점은 각 중선을 꼭짓점 쪽에서 2:1로 나눠요.<span class='xh'>낱말 하나씩 격파</span>외심은 세 꼭짓점에서 같은 거리에 있는 점, 내심은 세 변에서 같은 거리에 있는 점이라 균형점과는 위치가 달라요. 중점은 선분 하나를 반으로 나누는 점이고, 꼭짓점은 변이 만나는 모서리라 판을 받치는 자리가 아니에요. 원점은 수직선에서 기준이 되는 0의 자리, 수선의 발과 대칭점도 균형과는 관계없는 말이에요. 판이 수평을 이루는 그 점의 이름은 무게중심이에요.",
    core: "삼각형 판의 균형점이 무게중심!",
  },
  {
    id: "m2u5e163", lessonId: L, type: "word",
    prompt: "삼각형의 한 꼭짓점과 그 대변의 중점을 이은 선분을 ___이라고 해요.",
    answer: "중선",
    bank: ["중선", "수선", "수직이등분선", "높이", "대각선", "엇각", "반지름", "현"],
    diff: 1,
    explain: "<span class='xh'>정답 풀이</span>삼각형의 한 꼭짓점과 마주 보는 변의 중점을 이은 선분이 <b>중선</b>이에요. 삼각형에는 중선을 세 개 그을 수 있고, 세 중선은 무게중심에서 만나요.<span class='xh'>낱말 하나씩 격파</span>수선은 한 점에서 직선에 수직으로 내린 선분, 높이는 밑변에서 마주 보는 꼭짓점까지의 수직 거리라 중점을 지난다는 보장이 없어요. 수직이등분선은 변의 중점을 지나지만 그 변에 수직인 선이라 꼭짓점을 지나지 않아요. 대각선은 다각형의 꼭짓점을 잇는 선분, 엇각은 각의 한 종류, 반지름과 현은 원에서 쓰는 말이라 모두 달라요. 꼭짓점과 대변의 중점을 잇는 선분은 중선이에요.",
    core: "꼭짓점과 대변의 중점을 이으면 중선!",
  },
];
