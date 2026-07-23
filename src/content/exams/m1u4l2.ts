// 중1 수학 Ⅳ. 기본 도형: 단원 종합 평가 풀 v2, 레슨 2 직선, 반직선, 선분 (책 145~147쪽)
// (m1u4e016~e030) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m1u4-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 7 + multi 2 + num 6, diff 7/5/3. word 0(규격 v2 · 교과서 실측: 용어 빈칸형 0).
// 그림 원칙: 수치는 라벨 단위 병기("35°"·"12 cm"·"x°"), 관계 조건은 문두, 각 그림 전부 실각 렌더(각 문항 주석 검산).
// 수치·앵커 배정은 설계표 §2가 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴 ∥ ⊥ ≡ °), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import {
  mExamPointsLineFig,
} from "../../ui/examFiguresMath";

export const POOL_M1U4L2: ExamItem[] = [
  {
    // [슬롯 16] 검산: 네 점 A,B,C,D 순서. 반직선 AB와 AC는 시작점 A·방향(오른쪽)이 같아 같은 반직선.
    //  나머지: 시작점 다름(②)·구간 다름(③)·방향 반대(④)·종류 다름(⑤) · 전부 다르다. 정답 유일 확인.
    id: "m1u4e016", lessonId: "m1u4l2", type: "mcq",
    prompt: "그림과 같이 한 직선 위에 네 점 A, B, C, D가 있어요. 다음 중 서로 같은 것끼리 짝 지은 것은?",
    figure: mExamPointsLineFig({ pts: ["A", "B", "C", "D"] }),
    options: [
      `${gsym("AB", "ray")}와 ${gsym("AC", "ray")}`,
      `${gsym("BA", "ray")}와 ${gsym("AB", "ray")}`,
      `${gsym("AC", "seg")}과 ${gsym("BD", "seg")}`,
      `${gsym("CB", "ray")}와 ${gsym("CD", "ray")}`,
      `${gsym("AB", "line")}와 ${gsym("AB", "ray")}`,
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>반직선이 같으려면 시작점과 뻗는 방향이 모두 같아야 해요. 반직선 AB는 A에서 출발해 B 쪽(오른쪽)으로, 반직선 AC도 A에서 출발해 C 쪽(오른쪽)으로 뻗으니 <b>완전히 같은 반직선</b>이에요 ✓<span class='xh'>오답 하나씩 격파</span>반직선 BA와 AB는 시작점부터 다르고 방향도 반대라 다른 도형이에요. 선분 AC와 BD는 양 끝점이 달라 서로 다른 구간이죠. 반직선 CB와 CD는 시작점은 C로 같지만 CB는 왼쪽, CD는 오른쪽으로 뻗어 방향이 반대예요. 직선 AB와 반직선 AB는 아예 종류가 달라요. 직선은 양쪽으로 끝없이, 반직선은 한쪽으로만 뻗으니까요.",
    core: "반직선은 시작점과 방향이 둘 다 같아야 같다!",
  },
  {
    // [슬롯 17] 검산: 반직선 CB = 시작점 C, B 방향(왼쪽) = 반직선 CA와 같다(A·B 모두 C의 왼쪽).
    id: "m1u4e017", lessonId: "m1u4l2", type: "mcq",
    prompt: `그림과 같이 한 직선 위에 세 점 A, B, C가 있어요. ${gsym("CB", "ray")}와 같은 것은?`,
    figure: mExamPointsLineFig({ pts: ["A", "B", "C"] }),
    options: [
      `${gsym("CA", "ray")}`,
      `${gsym("BA", "ray")}`,
      `${gsym("BC", "ray")}`,
      `${gsym("CB", "seg")}`,
      `${gsym("CB", "line")}`,
    ],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>반직선은 '시작점'과 '뻗는 방향' 두 가지로 정해져요.<br>① 반직선 CB는 C에서 출발해 B 쪽(왼쪽)으로 끝없이 뻗어요<br>② 반직선 CA도 C에서 출발해 A 쪽(왼쪽)으로 뻗죠<br>③ B와 A는 모두 C의 왼쪽에 있으니 두 반직선은 <b>완전히 같은 도형</b>이에요 ✓<span class='xh'>오답 하나씩 격파</span>반직선 BA는 시작점이 B라서 출발부터 달라요. 반직선 BC는 B에서 C 쪽(오른쪽)으로 뻗어 방향이 정반대고요. 선분 CB는 C와 B 사이의 끊긴 구간, 직선 CB는 양쪽으로 무한히 뻗는 선이라 종류 자체가 달라요. 이름에 쓰인 두 점이 같아도 기호가 다르면 다른 도형이라는 것, 그리고 반직선끼리는 시작점과 방향이 모두 같아야 같은 도형이라는 것이 이 단원의 첫 관문이에요.",
    core: "반직선의 정체 = 시작점 + 방향, 이름은 달라도 OK!",
  },
  {
    // [슬롯 18] 검산: M이 AB 중점, AB=22 → MB=22÷2=11. 그림 전체 띠 22 cm + 문두 이중 제시.
    id: "m1u4e018", lessonId: "m1u4l2", type: "num",
    prompt: `그림에서 점 M은 ${gsym("AB", "seg")}의 중점이에요. ${gsym("AB", "seg")}=22 cm일 때, ${gsym("MB", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: mExamPointsLineFig({ pts: ["A", "M", "B"], segs: [{ from: 0, to: 2, label: "22 cm" }] }),
    answer: "11", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점은 선분을 길이가 같은 두 부분으로 나누는 점이에요.<br>① M이 AB의 중점이므로 AM=MB<br>② AB=AM+MB=2MB<br>③ 2MB=22, MB=<b>11</b> ✓<span class='xh'>계산 실수 격파</span>MB를 22 cm 그대로 쓰면 전체와 부분을 혼동한 거예요. 그림에서 22 cm는 A부터 B까지 전체 길이를 나타내는 띠라는 것을 먼저 확인하세요. 또 AM=MB라는 조건을 식으로 옮길 때 AB=2AM처럼 2배 관계로 적어 두면 나눗셈 한 번으로 깔끔하게 끝나요. 검산: AM=11, MB=11이면 합이 22가 되어 전체 길이와 딱 맞아요.",
    core: "중점은 절반! AB=2AM=2MB로 식을 세운다!",
  },
  {
    // [슬롯 19] 검산: 세 점의 두 점 표기 반직선 = AB(=AC)·BA·BC·CA(=CB) → 서로 다른 것 4개.
    id: "m1u4e019", lessonId: "m1u4l2", type: "mcq",
    prompt: "그림과 같이 한 직선 위에 세 점 A, B, C가 있어요. 이 중 두 점을 사용하여 나타낼 수 있는 서로 다른 반직선의 개수는?",
    figure: mExamPointsLineFig({ pts: ["A", "B", "C"] }),
    options: ["4개", "6개", "3개", "2개", "5개"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>기호로 전부 나열한 뒤 같은 것을 묶어요.<br>① 만들 수 있는 표기: AB, AC, BA, BC, CA, CB의 6가지<br>② 반직선 AB와 AC는 A에서 오른쪽으로 뻗는 같은 반직선<br>③ 반직선 CA와 CB도 C에서 왼쪽으로 뻗는 같은 반직선<br>④ 서로 다른 것은 AB, BA, BC, CA의 <b>4개</b> ✓<span class='xh'>오답 하나씩 격파</span>6개는 표기의 수를 그대로 답한 것으로, 같은 반직선이 두 이름을 가질 수 있다는 점을 놓친 거예요. 가운데 점 B에서는 왼쪽(BA)과 오른쪽(BC)으로 서로 다른 두 반직선이 나오지만, 양 끝 점에서는 안쪽 방향 하나씩만 나와요. 3개는 점의 개수만큼만 센 값, 2개는 방향이 두 가지라는 데서 멈춘 값이죠. 시작점마다 몇 방향이 가능한지 따지는 것이 정확한 세기 절차예요.",
    core: "나열 후 병합! 끝점은 1방향, 가운데 점은 2방향!",
  },
  {
    // [슬롯 20] 검산: AC=23, BC=11 → AB=23−11=12, M 중점 → MB=6, MC=MB+BC=6+11=17.
    id: "m1u4e020", lessonId: "m1u4l2", type: "num",
    prompt: `그림에서 점 M은 ${gsym("AB", "seg")}의 중점이에요. ${gsym("AC", "seg")}=23 cm, ${gsym("BC", "seg")}=11 cm일 때, ${gsym("MC", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: mExamPointsLineFig({
      pts: ["A", "M", "B", "C"],
      pos: [0, 0.26, 0.52, 1],
      segs: [
        { from: 0, to: 3, label: "23 cm" },
        { from: 2, to: 3, label: "11 cm" },
      ],
    }),
    answer: "17", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>구하려는 MC를 아는 길이들로 쪼개는 것이 열쇠예요.<br>① AB=AC−BC=23−11=12<br>② M은 AB의 중점이므로 MB=12÷2=6<br>③ MC=MB+BC=6+11=<b>17</b> ✓<span class='xh'>계산 실수 격파</span>M을 AC 전체의 중점으로 착각해 23÷2를 하면 소수가 나와 막혀 버려요. M은 어디까지나 AB의 중점이라는 조건을 문제에서 다시 확인하세요. 또 MC를 AC−AM=23−6=17로 구해도 같은 답이 나와요. 두 가지 경로로 답이 일치하면 계산이 맞다는 확실한 검산이 되죠. 선분 여러 개가 겹친 문제는 전체에서 부분을 빼 필요한 조각부터 만드는 순서가 정석이에요.",
    core: "겹친 선분은 전체−부분으로 조각부터 확보!",
  },
  {
    // [슬롯 21] 검산: 한 직선 위 세 점 · 직선 1(전부 같은 직선)·반직선 4(슬롯 19)·선분 3(AB·BC·AC).
    id: "m1u4e021", lessonId: "m1u4l2", type: "mcq",
    prompt: "그림과 같이 한 직선 위에 세 점 A, B, C가 있어요. 이 중 두 점을 사용하여 만들 수 있는 서로 다른 직선, 반직선, 선분의 개수를 차례대로 짝 지은 것은?",
    figure: mExamPointsLineFig({ pts: ["A", "B", "C"] }),
    options: [
      "직선 1개, 반직선 4개, 선분 3개",
      "직선 3개, 반직선 4개, 선분 3개",
      "직선 1개, 반직선 6개, 선분 3개",
      "직선 1개, 반직선 4개, 선분 6개",
      "직선 3개, 반직선 6개, 선분 6개",
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>세 종류를 각각 세요.<br>① 직선: 세 점이 이미 한 직선 위에 있으니 어떤 두 점을 골라도 같은 직선 → 1개<br>② 반직선: AB(=AC), BA, BC, CA(=CB) → 4개<br>③ 선분: AB, BC, AC는 양 끝점이 달라 모두 다른 구간 → 3개 ✓<span class='xh'>오답 하나씩 격파</span>직선 3개는 점이 일렬이라는 그림의 조건을 놓친 값이에요. 점이 삼각형처럼 흩어져 있을 때만 직선이 3개가 되죠. 반직선 6개는 같은 반직선의 두 이름(AB와 AC)을 따로 센 것이고, 선분 6개는 선분 AB와 BA를 다른 것으로 센 거예요. 선분과 직선은 방향이 없어 이름 순서를 바꿔도 그대로라는 점, 반직선만 시작점·방향으로 구분된다는 점이 세 도형 세기의 핵심 차이랍니다.",
    core: "일렬 세 점: 직선 1·반직선 4·선분 3!",
  },
  {
    // [슬롯 22] 검산: AB=24 → MB=12, N은 MB 중점 → NB=6. 그림 전체 24 cm + 문두 이중 제시.
    id: "m1u4e022", lessonId: "m1u4l2", type: "num",
    prompt: `그림에서 점 M은 ${gsym("AB", "seg")}의 중점이고, 점 N은 ${gsym("MB", "seg")}의 중점이에요. ${gsym("AB", "seg")}=24 cm일 때, ${gsym("NB", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: mExamPointsLineFig({ pts: ["A", "M", "N", "B"], pos: [0, 0.5, 0.75, 1], segs: [{ from: 0, to: 3, label: "24 cm" }] }),
    answer: "6", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점이 두 번 나오면 절반을 두 번 하면 돼요.<br>① M이 AB의 중점: MB=24÷2=12<br>② N이 MB의 중점: NB=12÷2=6<br>③ NB=<b>6</b> ✓<span class='xh'>계산 실수 격파</span>12로 답했다면 절반을 한 번만 한 거예요. N이 어느 선분의 중점인지 문제를 다시 읽으세요. N은 전체 AB가 아니라 반쪽 MB의 중점이에요. 또 NB=AB÷4라는 지름길도 눈에 담아 두세요. 절반의 절반은 4분의 1이니 24÷4=6으로 한 번에 갈 수 있죠. 검산: AM=12, MN=6, NB=6을 모두 더하면 24로 전체와 딱 맞아요. 중점이 여러 번 등장하는 문제는 그림에 길이를 하나씩 적어 가며 누적 확인하는 것이 가장 확실한 방어예요.",
    core: "중점 두 번 = ÷2 두 번 = ÷4 한 번!",
  },
  {
    // [슬롯 23] 무그림 ①(일반 진술 판별) · 문장 mcq 4슬롯 중 1번째(23·70·116·144 한정).
    id: "m1u4e023", lessonId: "m1u4l2", type: "mcq",
    prompt: "직선, 반직선, 선분에 대한 설명으로 옳지 <u>않은</u> 것은?",
    options: [
      "반직선은 시작점에서 한쪽으로만 끝없이 뻗어요",
      "서로 다른 두 점을 지나는 직선은 오직 하나예요",
      "선분 AB와 선분 BA는 같은 도형이에요",
      "반직선 AB와 반직선 BA는 같은 도형이에요",
      "직선은 양쪽으로 끝없이 뻗은 곧은 선이에요",
    ],
    answer: 3, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>반직선 AB는 A에서 출발해 B 쪽으로 뻗고, 반직선 BA는 B에서 출발해 A 쪽으로 뻗어요. 시작점도 방향도 정반대인 <b>서로 다른 도형</b>이니 '같다'는 설명이 옳지 않아요 ✓ 두 반직선이 겹치는 부분은 선분 AB뿐이라는 것도 그림을 그려 보면 바로 보여요.<span class='xh'>오답 하나씩 격파</span>나머지는 모두 참이에요. 반직선은 한쪽으로만 무한히 뻗는 도형이고, 두 점을 지나는 직선이 하나뿐이라는 것은 직선의 가장 기본 성질이죠. 선분은 양 끝점 사이의 구간이라 방향이 없으니 AB로 부르든 BA로 부르든 같은 도형이에요. 직선의 정의도 그대로고요. 이름 순서에 민감한 것은 셋 중 반직선뿐이라는 사실, 기호 문제의 단골 함정이니 확실히 새겨 두세요.",
    core: "이름 순서에 민감한 건 반직선뿐!",
  },
  {
    // [슬롯 24] 검산: AB=48 → AM=MB=24, AM=4MN → MN=6, N은 MB 위 → AN=AM+MN=24+6=30.
    id: "m1u4e024", lessonId: "m1u4l2", type: "num",
    prompt: `그림에서 점 M은 ${gsym("AB", "seg")}의 중점이고, 점 N은 ${gsym("MB", "seg")} 위의 점이에요. ${gsym("AM", "seg")}=4${gsym("MN", "seg")}이고 ${gsym("AB", "seg")}=48 cm일 때, ${gsym("AN", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: mExamPointsLineFig({ pts: ["A", "M", "N", "B"], pos: [0, 0.5, 0.625, 1], segs: [{ from: 0, to: 3, label: "48 cm" }] }),
    answer: "30", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>조건을 하나씩 길이로 바꿔요.<br>① M이 AB의 중점: AM=48÷2=24<br>② AM=4MN이므로 MN=24÷4=6<br>③ N은 M보다 B 쪽에 있으니 AN=AM+MN=24+6=<b>30</b> ✓<span class='xh'>계산 실수 격파</span>AN=AM−MN=18로 계산했다면 N의 위치를 그림에서 놓친 거예요. N은 MB 위, 즉 M의 오른쪽에 있으니 AM에 MN을 더해야 해요. 또 AM=4MN을 거꾸로 읽어 MN=4AM=96처럼 만들면 전체 48을 넘겨 버리니 바로 이상하다는 걸 눈치챌 수 있어요. 구한 값이 전체 길이보다 커지지 않는지 확인하는 습관이 이런 실수를 걸러 줘요. 검산: AN=30, NB=48−30=18, MN=6이 모두 자연스럽게 맞아요.",
    core: "몇 배 조건은 짧은 쪽부터, 위치는 그림에서 확인!",
  },
  {
    // [슬롯 25] 검산: M은 AB 중점·N은 MB 중점 · AB=2AM ✓·MN=NB ✓·AB=4NB ✓ / AM=MN ✗(AM=2MN)·AN=NB ✗(3배).
    id: "m1u4e025", lessonId: "m1u4l2", type: "multi",
    prompt: `그림에서 점 M은 ${gsym("AB", "seg")}의 중점이고, 점 N은 ${gsym("MB", "seg")}의 중점이에요. 옳은 것을 모두 고르세요.`,
    figure: mExamPointsLineFig({ pts: ["A", "M", "N", "B"], pos: [0, 0.5, 0.75, 1] }),
    options: [
      `${gsym("AB", "seg")}=2${gsym("AM", "seg")}`,
      `${gsym("MN", "seg")}=${gsym("NB", "seg")}`,
      `${gsym("AB", "seg")}=4${gsym("NB", "seg")}`,
      `${gsym("AM", "seg")}=${gsym("MN", "seg")}`,
      `${gsym("AN", "seg")}=${gsym("NB", "seg")}`,
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>NB를 1이라 두고 전부 환산하면 판정이 쉬워요. NB=1이면 MN=1, MB=2, AM=2, AB=4가 돼요.<br>① AB=4, AM=2이므로 AB=2AM ✓<br>② MN=NB=1 ✓<br>③ AB=4, NB=1이므로 AB=4NB ✓<span class='xh'>오답 하나씩 격파</span>AM=MN은 2와 1을 같다고 한 것이라 거짓이에요. M이 전체의 중점, N이 반쪽의 중점이라 AM은 MN의 2배죠. AN=NB도 AN=AM+MN=3과 NB=1을 비교하면 3배 차이라 거짓이고요. 이렇게 가장 짧은 조각을 1로 놓고 모든 선분을 숫자로 바꾸는 방법은 어떤 진술이 와도 즉시 판정할 수 있는 만능 도구예요. 문자만 보며 눈으로 비교하다 틀리는 실수를 원천 차단해 줘요.",
    core: "가장 짧은 조각을 1로! 전부 숫자로 바꿔 판정!",
  },
  {
    // [슬롯 26] 검산: M=AB 중점·N=BC 중점 → MN=MB+BN=½AB+½BC=½AC=26÷2=13. 미05-05 계보.
    id: "m1u4e026", lessonId: "m1u4l2", type: "mcq",
    prompt: `그림에서 점 M은 ${gsym("AB", "seg")}의 중점이고, 점 N은 ${gsym("BC", "seg")}의 중점이에요. ${gsym("AC", "seg")}=26 cm일 때, ${gsym("MN", "seg")}의 길이는?`,
    figure: mExamPointsLineFig({ pts: ["A", "M", "B", "N", "C"], segs: [{ from: 0, to: 4, label: "26 cm" }] }),
    options: ["13 cm", "26 cm", "12 cm", "14 cm", "24 cm"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>AB와 BC의 길이를 각각 몰라도 풀리는 것이 이 문제의 매력이에요.<br>① MN=MB+BN<br>② MB=AB의 절반, BN=BC의 절반<br>③ MN=(AB+BC)÷2=AC÷2=26÷2=<b>13 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>26 cm는 전체를 그대로 옮긴 값이에요. M과 N은 각 조각의 가운데라 그 사이 거리는 전체의 절반으로 줄어들죠. 12나 14를 골랐다면 AB, BC를 특정 값으로 멋대로 정해 계산했을 가능성이 커요. 점 B가 어디에 있든, 두 조각의 절반끼리 더하면 언제나 전체의 절반이 된다는 것이 핵심 구조예요. B를 왼쪽이나 오른쪽으로 움직여 봐도 MN이 13에서 변하지 않는 장면을 상상해 보세요. '몰라도 되는 값'을 알아보는 눈이 이 문제가 기르는 진짜 실력이에요.",
    core: "절반+절반 = 전체의 절반! AB·BC는 몰라도 된다!",
  },
  {
    // [슬롯 27] 검산: 3AB=2BC·AM=14 → AB=2AM=28, BC=3AB÷2=42, BN=21 → MN=MB+BN=14+21=35. 미05-05 심화.
    id: "m1u4e027", lessonId: "m1u4l2", type: "num",
    prompt: `그림에서 점 M은 ${gsym("AB", "seg")}의 중점이고, 점 N은 ${gsym("BC", "seg")}의 중점이에요. 3${gsym("AB", "seg")}=2${gsym("BC", "seg")}이고 ${gsym("AM", "seg")}=14 cm일 때, ${gsym("MN", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: mExamPointsLineFig({ pts: ["A", "M", "B", "N", "C"], pos: [0, 0.2, 0.4, 0.7, 1], segs: [{ from: 0, to: 1, label: "14 cm" }] }),
    answer: "35", numKind: "int", unitLabel: "cm", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>조건을 사슬처럼 이어요.<br>① M이 AB의 중점이고 AM=14이므로 AB=28<br>② 3AB=2BC에서 3×28=84=2BC이므로 BC=42<br>③ N이 BC의 중점이므로 BN=21<br>④ MN=MB+BN=14+21=<b>35</b> ✓<span class='xh'>계산 실수 격파</span>3AB=2BC를 거꾸로 읽어 BC를 더 짧게(BC=84÷3 꼴로) 만들면 안 돼요. 계수가 큰 쪽이 오히려 짧은 선분이에요. 3×AB와 2×BC가 같아지려면 AB가 BC보다 짧아야 하니까요. 헷갈리면 AB=2, BC=3인 미니 예로 비율부터 확인하세요. 검산: AC=28+42=70이고 MN은 AC의 절반인 35와 일치해요. 앞 문제에서 발견한 'MN은 항상 AC의 절반' 구조가 비 조건이 붙은 심화판에서도 그대로 작동하는 거죠.",
    core: "3AB=2BC는 AB가 짧다! 사슬 계산 후 절반 검산!",
  },
  {
    // [슬롯 28] 검산: AB=32 → AM=MB=16, MN:NB=3:1 → MN=12·NB=4, AN=16+12=28.
    id: "m1u4e028", lessonId: "m1u4l2", type: "mcq",
    prompt: `그림에서 점 M은 ${gsym("AB", "seg")}의 중점이고, 점 N은 ${gsym("MB", "seg")} 위의 점이에요. ${gsym("MN", "seg")}:${gsym("NB", "seg")}=3:1이고 ${gsym("AB", "seg")}=32 cm일 때, ${gsym("AN", "seg")}의 길이는?`,
    figure: mExamPointsLineFig({ pts: ["A", "M", "N", "B"], pos: [0, 0.5, 0.875, 1], segs: [{ from: 0, to: 3, label: "32 cm" }] }),
    options: ["28 cm", "24 cm", "20 cm", "30 cm", "16 cm"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>중점 조건과 비 조건을 차례로 써요.<br>① M이 AB의 중점: AM=MB=32÷2=16<br>② MB를 3:1로 나누면 MN=16×(3/4)=12, NB=4<br>③ AN=AM+MN=16+12=<b>28 cm</b> ✓<span class='xh'>오답 하나씩 격파</span>24 cm는 MN을 MB의 절반(8)으로 잘못 잡거나 3:1을 2:2처럼 다룬 값이에요. 비 3:1은 전체를 3+1=4칸으로 나눠 3칸과 1칸을 가진다는 뜻이라, 한 칸이 16÷4=4가 되는 것부터 계산해야 해요. 20 cm는 AN을 AM+NB처럼 엉뚱한 조각의 합으로 세운 값이고, 16 cm는 AM에서 멈춘 값, 30 cm는 NB=2로 어림한 값이에요. 비 조건이 나오면 '전체 몇 칸, 한 칸 얼마'를 먼저 적는 습관이 모든 실수를 막아 줘요. 검산: AM 16+MN 12+NB 4=32 ✓",
    core: "비는 칸부터! 전체 4칸, 한 칸 4로 확정!",
  },
  {
    // [슬롯 29] 검산: 직선·선분은 방향 없음(AB=BA ✓), 반직선은 시작점·방향으로 구분(✗), 종류 다르면 ✗.
    id: "m1u4e029", lessonId: "m1u4l2", type: "multi",
    prompt: "그림과 같이 한 직선 위에 두 점 A, B가 있어요. 옳은 것을 모두 고르세요.",
    figure: mExamPointsLineFig({ pts: ["A", "B"] }),
    options: [
      `${gsym("AB", "line")}=${gsym("BA", "line")}`,
      `${gsym("AB", "seg")}=${gsym("BA", "seg")}`,
      `${gsym("AB", "ray")}=${gsym("BA", "ray")}`,
      `${gsym("AB", "ray")}=${gsym("AB", "line")}`,
      `${gsym("AB", "seg")}=${gsym("AB", "line")}`,
    ],
    answer: [0, 1], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>기호의 뜻을 하나씩 대조해요.<br>① 직선 AB와 직선 BA: 직선은 방향이 없으니 두 점의 순서를 바꿔도 같은 직선 ✓<br>② 선분 AB와 선분 BA: 선분도 A와 B 사이의 같은 구간 ✓<span class='xh'>오답 하나씩 격파</span>반직선 AB와 반직선 BA는 시작점이 A와 B로 다르고 뻗는 방향도 반대라 서로 다른 도형이에요. 셋 중 유일하게 이름 순서가 의미를 갖는 것이 반직선이죠. 반직선 AB와 직선 AB는 한쪽으로만 뻗는 도형과 양쪽으로 뻗는 도형이라 같을 수 없고, 선분 AB와 직선 AB도 유한한 구간과 무한한 선이라 다른 도형이에요. 기호 위의 표시(양쪽 화살표·한쪽 화살표·민짜 선)가 도형의 종류를 말해 준다는 것을 기억하면 어떤 짝이 나와도 흔들리지 않아요.",
    core: "순서 바꿔도 같은 건 직선·선분, 반직선만 예외!",
  },
  {
    // [슬롯 30] 검산: AB=14, M 중점 → AM=7. 기초 판독.
    id: "m1u4e030", lessonId: "m1u4l2", type: "num",
    prompt: `그림에서 점 M은 ${gsym("AB", "seg")}의 중점이에요. ${gsym("AB", "seg")}=14 cm일 때, ${gsym("AM", "seg")}의 길이는 몇 cm인지 구하세요.`,
    figure: mExamPointsLineFig({ pts: ["A", "M", "B"], segs: [{ from: 0, to: 2, label: "14 cm" }] }),
    answer: "7", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>중점은 선분을 똑같은 두 도막으로 나누는 점이에요.<br>① M이 AB의 중점이므로 AM=MB<br>② AM=14÷2=<b>7</b> ✓<span class='xh'>계산 실수 격파</span>14를 그대로 답하면 전체와 부분을 혼동한 거예요. 그림의 14 cm 띠가 A부터 B까지 전체를 가리킨다는 것부터 확인하세요. 또 AM과 MB 중 무엇을 묻는지도 살펴야 해요. 이 문제는 둘 다 7이라 결과가 같지만, 중점이 아닌 점이 나오는 다음 단계 문제부터는 어느 쪽 도막인지가 답을 가르거든요. 중점 문제의 기본기는 'AB=2AM=2MB'라는 2배 관계식을 자동으로 떠올리는 것이에요. 이 식 하나면 전체에서 부분으로, 부분에서 전체로 어느 방향이든 오갈 수 있어요. 검산: 7+7=14 ✓",
    core: "중점은 절반! AB=2AM 관계식이 기본기!",
  },
];
