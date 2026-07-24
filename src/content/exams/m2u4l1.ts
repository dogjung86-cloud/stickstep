// 중2 수학 Ⅳ. 삼각형과 사각형의 성질: 단원 종합 평가 풀 v2, 레슨 1 이등변삼각형의 성질 (책 140~144쪽)
// (m2u4e001~e020) · 2026-07 교과서 준거 재출제(정본 설계표 qa/m2u4-v2-blueprint.md, 규격 v2).
// 유형 쿼터: mcq 10 + multi 2 + num 8, diff 8/8/4. word 0(규격 v2 · 교과서 실측: 용어 빈칸형 0).
// 그림 원칙: 수치는 라벨 단위 병기("34°"·"12 cm"·"x°"), 관계 조건은 문두, 각 그림 전부 실각 렌더(각 문항 주석 검산).
// 수치·앵커 배정은 설계표 §2·§8이 정본. 표기: mfmt 미사용(gsym·유니코드 리터럴 ∥ ⊥ ≡ ▱ °), em대시 금지, −는 U+2212.
import type { ExamItem } from "./types";
import { gsym } from "../../ui/geoKit";
import {
  m2ExamIsoFig,
  m2ExamIsoLadderFig,
  m2ExamIsoChainFig,
  m2ExamExtIsoFig,
  m2ExamTriCevFig,
} from "../../ui/examFiguresMath";

export const POOL_M2U4L1: ExamItem[] = [
  {
    // [슬롯 1] 검산: 꼭지각 82° → 밑각 (180−82)÷2=49. 82+49+49=180 ✓. 오답 = 꼭지각 옮김·합에서 멈춤·반 나누기 오적용.
    id: "m2u4e001", lessonId: "m2u4l1", type: "mcq",
    prompt: `그림에서 ${gsym("ABC", "tri")}는 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형이에요. ∠A=82°일 때, ∠<i class='mv'>x</i>의 크기는?`,
    figure: m2ExamIsoFig({ apexDeg: 82, apex: "82°", baseL: "x°" }),
    options: ["49°", "82°", "98°", "41°", "46°"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>이등변삼각형에서 두 밑각의 크기는 같아요.<br>① 두 밑각의 합: 180°−82°=98°<br>② 밑각 하나: 98°÷2=<b>49°</b><span class='xh'>오답 하나씩 격파</span>82°는 꼭지각을 그대로 옮겨 적은 값이에요. 98°는 두 밑각의 합에서 반으로 나누기 전에 멈춘 값이고, 41°는 꼭지각 82°를 반으로 나눈 값이라 밑각을 구하는 과정과 관계가 없어요. 46°를 대입해 보면 82°+46°+46°=174°가 되어 삼각형 세 각의 크기의 합 180°에 못 미치니 답이 될 수 없어요. 검산은 82°+49°+49°=180°로 한 번에 끝나요.",
    core: "밑각 = (180°−꼭지각)÷2!",
  },
  {
    // [슬롯 2] 검산: 밑각 47° → ∠C=47°, 꼭지각=180−94=86. 86+47+47=180 ✓.
    id: "m2u4e002", lessonId: "m2u4l1", type: "num",
    prompt: `그림의 ${gsym("ABC", "tri")}에서 ${gsym("AB", "seg")}=${gsym("AC", "seg")}이고 ∠B=47°예요. 꼭지각 ∠A의 크기는 몇 도인가요? 숫자만 입력하세요.`,
    figure: m2ExamIsoFig({ apexDeg: 86, baseL: "47°", apex: "x°" }),
    answer: "86", numKind: "int", unitLabel: "°", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>이등변삼각형은 두 밑각의 크기가 같아요.<br>① ∠C=∠B=47°<br>② 두 밑각의 합: 47°+47°=94°<br>③ ∠A=180°−94°=<b>86°</b><span class='xh'>계산 실수 격파</span>47을 그대로 쓰면 밑각을 옮겨 적은 것이고, 94에서 멈추면 두 밑각의 합까지만 간 거예요. 180°에서 밑각을 한 번만 빼서 133으로 답하는 실수도 잦아요. 밑각은 언제나 두 개라는 사실을 잊지 않는 게 핵심이에요. 검산은 86°+47°+47°=180°로 내각의 합이 정확히 맞는지 확인하면 끝나요.",
    core: "꼭지각 = 180°−밑각×2!",
  },
  {
    // [슬롯 3] 검산: 틱 = AB=AC → 꼭지각 ∠A, 밑각은 ∠B·∠C(같은 두 변이 만드는 각의 반대편).
    id: "m2u4e003", lessonId: "m2u4l1", type: "mcq",
    prompt: `그림의 ${gsym("ABC", "tri")}는 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형이에요. 밑각을 모두 나타낸 것은?`,
    figure: m2ExamIsoFig({ apexDeg: 66 }),
    options: ["∠B와 ∠C", "∠A와 ∠B", "∠A와 ∠C", "∠A뿐", "∠B뿐"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>이등변삼각형에서 길이가 같은 두 변이 이루는 각이 꼭지각, 밑변의 양 끝 각이 밑각이에요. AB=AC이니 두 변이 만나는 ∠A가 꼭지각이고, 밑변 BC의 양 끝에 있는 <b>∠B와 ∠C</b>가 밑각이에요.<span class='xh'>오답 하나씩 격파</span>∠A를 밑각에 넣은 보기들은 꼭지각과 밑각을 맞바꾼 거예요. 꼭지각이 위에 있고 밑각이 아래에 있다는 위치 감각도 좋지만, 정확한 기준은 위치가 아니라 '같은 두 변 사이의 각이 꼭지각'이라는 정의예요. 그림이 돌아가 있어도 틱 표시가 붙은 두 변부터 찾으면 흔들리지 않아요. 밑각이 하나뿐이라는 보기는 이등변삼각형의 성질(두 밑각이 같다)과도 어긋나요.",
    core: "같은 두 변 사이 = 꼭지각, 밑변 양 끝 = 밑각!",
  },
  {
    // [슬롯 4] 검산: ∠ADB=90°(수선)·∠B=64° → ∠BAD=180−90−64=26 ✓. 실각 B=C=64.
    id: "m2u4e004", lessonId: "m2u4l1", type: "num",
    prompt: `그림의 ${gsym("ABC", "tri")}는 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형이고, 꼭짓점 A에서 밑변 BC에 수선을 내려 만난 점이 D예요. ∠B=64°일 때, ∠BAD의 크기는 몇 도인가요? 숫자만 입력하세요.`,
    figure: m2ExamTriCevFig({ B: 64, C: 64, cev: "perp", tickAB_AC: true, marks: [{ at: "B", label: "64°" }, { at: "BAD", label: "x°" }] }),
    answer: "26", numKind: "int", unitLabel: "°", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>직각삼각형 ABD 하나만 보면 바로 풀려요.<br>① AD⊥BC이니 ∠ADB=90°<br>② △ABD에서 ∠BAD=180°−90°−64°=<b>26°</b><br>이등변삼각형의 수선은 꼭지각을 반으로 나누니, 꼭지각 전체 52°의 절반으로 검산해도 26°가 나와요.<span class='xh'>계산 실수 격파</span>64를 그대로 옮기거나, 꼭지각 전체 52°를 답하고 멈추는 실수가 잦아요. 90°에서 64°를 빼는 계산도 36으로 잘못 마치기 쉬우니 26+64=90인지 되짚어 보세요. 수선, 꼭지각의 이등분선, 밑변의 수직이등분선이 이등변삼각형에서는 전부 같은 선이라는 사실이 이 유형의 밑바탕이에요.",
    core: "이등변의 수선 = 꼭지각 이등분, 90°−밑각!",
  },
  {
    // [슬롯 5] 검산: 외각 128° → 밑각 52° → 꼭지각 180−104=76 ✓. 실각 apex 76.
    id: "m2u4e005", lessonId: "m2u4l1", type: "mcq",
    prompt: `그림에서 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형 ABC의 밑변을 연장했더니 꼭짓점 C 바깥쪽의 각이 128°였어요. 꼭지각 ∠<i class='mv'>x</i>의 크기는?`,
    figure: m2ExamIsoFig({ apexDeg: 76, ext: "128°", apex: "x°" }),
    options: ["76°", "52°", "128°", "104°", "64°"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>바깥쪽 각에서 밑각부터 되찾아요.<br>① ∠ACB=180°−128°=52°<br>② 두 밑각이 같으니 ∠B=52°<br>③ ∠<i class='mv'>x</i>=180°−52°×2=<b>76°</b><span class='xh'>오답 하나씩 격파</span>52°는 밑각에서 멈춘 값이고, 128°는 주어진 바깥쪽 각을 그대로 옮긴 값이에요. 104°는 두 밑각의 합에서 끝난 값이고, 64°는 128°를 반으로 나눈 값인데 반으로 나눌 대상은 바깥쪽 각이 아니에요. 삼각형의 바깥쪽 각은 이웃하지 않은 두 안쪽 각의 합이라는 성질로 검산하면 76°+52°=128°가 딱 맞아요.",
    core: "외각 → 밑각(180°−외각) → 꼭지각 순서로 역산!",
  },
  {
    // [슬롯 6] 검산: SAS의 셋째 조각 = 공통변 AD. "∠B=∠C"는 결론(순환), BD=CD·∠ADB=∠ADC는 합동 뒤 결과.
    // 증명 박스 span 문법(§8-1 확정).
    id: "m2u4e006", lessonId: "m2u4l1", type: "mcq",
    prompt: `다음은 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 ${gsym("ABC", "tri")}에서 두 밑각의 크기가 같음을 증명하는 과정이에요.<br><span style="display:block;margin:8px 0;padding:10px 12px;border:1.5px solid #D5DEF0;border-radius:10px;background:#F8FAFF;line-height:1.75">∠A의 이등분선과 ${gsym("BC", "seg")}의 교점을 D라 하자.<br>${gsym("ABD", "tri")}와 ${gsym("ACD", "tri")}에서<br>${gsym("AB", "seg")}=${gsym("AC", "seg")} (가정),<br>∠BAD=∠CAD (AD는 ∠A의 이등분선),<br>㉠<br>이므로 ${gsym("ABD", "tri")}≡${gsym("ACD", "tri")} (SAS 합동)<br>따라서 ∠B=∠C</span>㉠에 들어갈 알맞은 것은?`,
    options: [
      `${gsym("AD", "seg")}는 공통인 변`,
      "∠B=∠C이므로",
      `${gsym("BD", "seg")}=${gsym("CD", "seg")}이므로`,
      "∠ADB=∠ADC이므로",
      `${gsym("AB", "seg")}=${gsym("BC", "seg")}이므로`,
    ],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>SAS 합동에는 변, 각, 변이 필요해요. 이미 변 하나(AB=AC)와 그 사이 각(∠BAD=∠CAD)이 있으니, 남은 한 변은 두 삼각형이 함께 쓰는 <b>공통인 변 AD</b>예요.<span class='xh'>오답 하나씩 격파</span>'∠B=∠C이므로'는 지금 증명하려는 결론 그 자체라서 근거로 쓰면 순환 논법이 돼요. BD=CD와 ∠ADB=∠ADC는 합동이 끝난 뒤에야 따라 나오는 결과이지, 합동을 만들기 전에 쓸 수 있는 조건이 아니에요. AB=BC는 어디에도 주어진 적 없는 정보예요. 증명에서는 '지금 이 순간 알고 있는 것'만 재료로 쓸 수 있다는 규칙이 전부예요.",
    core: "SAS의 세 번째 조각 = 공통변, 결론을 근거로 쓰면 순환!",
  },
  {
    // [슬롯 7] 검산(신작 LAD ray, th=24): ∠BDC=24°(이등변 BC=BD) → ∠ABD=24+24=48°(외각) →
    // ∠DAB=48°(이등변 DB=DA) → ∠ADE=∠DCA+∠DAC=24+48=72° ✓ 3×24. 그림은 실각 24°로 좌표 계산.
    id: "m2u4e007", lessonId: "m2u4l1", type: "num",
    prompt: `그림에서 ${gsym("CB", "seg")}=${gsym("BD", "seg")}=${gsym("DA", "seg")}이고 ∠C=24°예요. 점 E는 직선 CD 위에 있을 때, ∠ADE의 크기는 몇 도인가요? 숫자만 입력하세요.`,
    figure: m2ExamIsoLadderFig({ mode: "ray", th: 24, marks: [{ at: "C", label: "24°" }, { at: "ADE", label: "x°" }] }),
    answer: "72", numKind: "int", unitLabel: "°", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>같은 길이 표시를 따라 이등변삼각형을 두 번 갈아타요.<br>① BC=BD이니 △CBD에서 ∠BDC=∠C=24°<br>② ∠ABD는 △CBD의 바깥쪽 각이라 24°+24°=48°<br>③ DB=DA이니 △BDA에서 ∠DAB=∠ABD=48°<br>④ ∠ADE는 △ACD의 바깥쪽 각이라 ∠DCA+∠DAC=24°+48°=<b>72°</b><span class='xh'>계산 실수 격파</span>48에서 멈추면 한 단계만 오른 값이고, 24를 그대로 쓰면 출발각을 옮겨 적은 거예요. 바깥쪽 각은 이웃하지 않은 두 안쪽 각의 합이라는 성질을 두 번 연달아 쓰는 것이 열쇠예요. 마지막 검산: ∠ADC=180°−72°=108°이고 △ACD에서 24°+48°+108°=180°가 딱 맞아요.",
    core: "이등변을 갈아탈 때마다 바깥쪽 각이 기준각만큼 커진다!",
  },
  {
    // [슬롯 8] 검산(CHN, th=54): AB=AC → ∠ACB=54° → ∠ACD=126° → CA=CD 이등변에서 ∠ADC=(180−126)÷2=27° ✓.
    id: "m2u4e008", lessonId: "m2u4l1", type: "mcq",
    prompt: `그림에서 ${gsym("AB", "seg")}=${gsym("AC", "seg")}=${gsym("CD", "seg")}이고 ∠B=54°예요. 점 B, C, D는 한 직선 위에 있을 때, ∠ADC의 크기는?`,
    figure: m2ExamIsoChainFig({ th: 54, thLabel: "54°", ask: "x°", askAt: "D" }),
    options: ["27°", "54°", "63°", "126°", "36°"],
    answer: 0, diff: 2,
    explain: "<span class='xh'>정답 풀이</span>이등변삼각형 두 개를 이어서 풀어요.<br>① AB=AC이니 ∠ACB=∠B=54°<br>② ∠ACD는 ∠ACB와 평각을 이루니 180°−54°=126°<br>③ CA=CD이니 △ACD는 이등변, ∠ADC=(180°−126°)÷2=<b>27°</b><span class='xh'>오답 하나씩 격파</span>54°는 주어진 각을 그대로 옮긴 값이고, 126°는 ∠ACD에서 멈춘 값이에요. 63°는 (180°−54°)÷2로 평각 전환 없이 반을 나눈 값이라 순서가 어긋나요. 36°는 어떤 경로로도 나오지 않는 값이에요. 검산하면 △ACD에서 126°+27°+27°=180°가 성립해요.",
    core: "평각으로 꺾은 뒤 남은 이등변에서 반씩 나누기!",
  },
  {
    // [슬롯 9] 검산: AB=11 라벨·틱 → 대응변 AC=11(성질 방향 길이 판독).
    id: "m2u4e009", lessonId: "m2u4l1", type: "num",
    prompt: `그림의 ${gsym("ABC", "tri")}는 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형이에요. ${gsym("AB", "seg")}=11 cm일 때, ${gsym("AC", "seg")}의 길이는 몇 cm인가요? 숫자만 입력하세요.`,
    figure: m2ExamIsoFig({ apexDeg: 58, sideL: "11 cm", sideR: "x cm" }),
    answer: "11", numKind: "int", unitLabel: "cm", diff: 1,
    explain: "<span class='xh'>정답 풀이</span>이등변삼각형은 두 변의 길이가 같은 삼각형이에요. 그림의 틱 표시가 AB와 AC에 하나씩 붙어 있으니 두 변이 같다는 뜻이고, AB=11 cm이면 AC도 <b>11 cm</b>예요.<span class='xh'>계산 실수 격파</span>너무 쉬워 보여도 이 문항의 핵심은 틱 표시 읽기예요. 같은 개수의 틱이 붙은 변끼리 길이가 같다는 약속은 이 단원 내내 쓰이는 그림 언어거든요. 밑변 BC는 틱이 없으니 11 cm라고 말할 근거가 없다는 것까지 구분하면 완벽해요. 정삼각형이 아닌 이상 밑변의 길이는 다른 두 변과 다를 수 있어요.",
    core: "같은 틱 = 같은 길이, 그림 언어부터 읽기!",
  },
  {
    // [슬롯 10] 검산: 틱은 AB=AC → 참 수식은 ∠B=∠C 하나뿐(나머지는 근거 없음).
    id: "m2u4e010", lessonId: "m2u4l1", type: "mcq",
    prompt: `그림의 ${gsym("ABC", "tri")}에서 ${gsym("AB", "seg")}=${gsym("AC", "seg")}일 때, 항상 성립하는 것은?`,
    figure: m2ExamIsoFig({ apexDeg: 70 }),
    options: ["∠B=∠C", `${gsym("AB", "seg")}=${gsym("BC", "seg")}`, "∠A=∠B", "∠A=∠C", `${gsym("BC", "seg")}=${gsym("AC", "seg")}`],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>이등변삼각형의 성질 그 자체예요. 두 변 AB, AC의 길이가 같으면 그 두 변을 마주 보는 두 각, 곧 두 밑각 <b>∠B와 ∠C</b>의 크기가 같아요.<span class='xh'>오답 하나씩 격파</span>AB=BC나 BC=AC는 밑변까지 같다는 뜻이라 정삼각형일 때만 성립해요. ∠A=∠B나 ∠A=∠C는 꼭지각과 밑각이 같다는 뜻인데 이것도 정삼각형에서만 일어나는 특수한 경우예요. '같은 변의 대각끼리 같다'는 대응 관계를 정확히 짚는 연습이 이 단원의 기본기예요. AB의 대각은 ∠C, AC의 대각은 ∠B라서 이 둘이 짝이 되는 거예요.",
    core: "같은 두 변의 대각끼리 같다, 그것이 밑각!",
  },
  {
    // [슬롯 11] 검산: 수선 그림 참 3(이등분·BD=CD·수직), 거짓 2. 그림 = foot+직각 마크만.
    // tickBase는 BD=CD 정답을 그림이 낭독하는 유출이라 제거(codex 검산 반영).
    id: "m2u4e011", lessonId: "m2u4l1", type: "multi",
    prompt: `그림처럼 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형 ABC의 꼭짓점 A에서 밑변 BC에 수선 AD를 내렸어요. 옳은 것을 모두 고르세요.`,
    figure: m2ExamIsoFig({ apexDeg: 64, foot: true }),
    options: [
      "∠BAD=∠CAD",
      `${gsym("BD", "seg")}=${gsym("CD", "seg")}`,
      "AD⊥BC",
      "∠B=∠BAD",
      `${gsym("AB", "seg")}=${gsym("AD", "seg")}`,
    ],
    answer: [0, 1, 2], diff: 2,
    explain: "<span class='xh'>정답 풀이</span>이등변삼각형에서 꼭지각의 이등분선, 밑변의 수직이등분선, 꼭짓점에서 내린 수선은 전부 같은 선이에요. 그래서 수선 AD는 꼭지각을 반으로 나누고(∠BAD=∠CAD), 밑변도 반으로 나누고(BD=CD), 당연히 밑변과 수직(AD⊥BC)이에요.<span class='xh'>오답 하나씩 격파</span>∠B=∠BAD는 밑각과 반쪽 꼭지각이 같다는 뜻인데 그럴 근거가 없어요. 밑각 64°와 반쪽 꼭지각 26°처럼 보통은 달라요. AB=AD도 빗변과 수선의 길이가 같다는 뜻이라 성립하지 않아요. 직각삼각형 ABD에서 AB는 빗변이라 수선 AD보다 항상 길어요.",
    core: "이등변의 수선 = 이등분선 = 수직이등분선, 세 선이 하나!",
  },
  {
    // [슬롯 12] 검산(EXT, th=66·phi=28): ∠ACB=∠B=66°(이등변). ∠ACB는 △ACD의 바깥쪽 각이라
    // ∠CAD+∠ADC=66° → ∠CAD=66−28=38 ✓. 그림은 실각 렌더(labelB·labelD·labelCAD만 인쇄).
    id: "m2u4e012", lessonId: "m2u4l1", type: "num",
    prompt: `그림에서 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형 ABC의 밑변 BC의 연장선 위에 점 D가 있어요. ∠B=66°, ∠ADC=28°일 때, ∠CAD의 크기는 몇 도인가요? 숫자만 입력하세요.`,
    figure: m2ExamExtIsoFig({ th: 66, phi: 28, labelB: "66°", labelD: "28°", labelCAD: "x°" }),
    answer: "38", numKind: "int", unitLabel: "°", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>이등변의 밑각을 찾은 뒤 바깥쪽 각의 성질로 마무리해요.<br>① AB=AC이니 ∠ACB=∠B=66°<br>② ∠ACB는 △ACD에서 꼭짓점 C의 바깥쪽 각이라, 이웃하지 않은 두 각의 합과 같아요: ∠CAD+∠ADC=66°<br>③ ∠CAD=66°−28°=<b>38°</b><span class='xh'>계산 실수 격파</span>66을 그대로 쓰면 밑각을 옮겨 적은 것이고, 28과 66을 더해 94로 답하면 바깥쪽 각의 성질을 거꾸로 쓴 거예요. △ACD의 세 각으로 검산하면 ∠ACD=180°−66°=114°이고 114°+28°+38°=180°가 딱 맞아요.",
    core: "밑각 = 바깥쪽 각 = 나머지 두 각의 합!",
  },
  {
    // [슬롯 13] 검산: ∠BAD=33° → ∠B=90−33=57(직각삼각형 ABD), 이등변이라 ∠C=∠B=57 ✓. 실각 B=C=57.
    id: "m2u4e013", lessonId: "m2u4l1", type: "mcq",
    prompt: `그림의 ${gsym("ABC", "tri")}는 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형이고, A에서 밑변에 내린 수선이 BC와 만나는 점이 D예요. ∠BAD=33°일 때, ∠C의 크기는?`,
    figure: m2ExamTriCevFig({ B: 57, C: 57, cev: "perp", tickAB_AC: true, marks: [{ at: "BAD", label: "33°" }, { at: "C", label: "x°" }] }),
    options: ["57°", "33°", "66°", "47°", "114°"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>반쪽 각에서 밑각으로 거꾸로 가는 역방향 문제예요.<br>① 직각삼각형 ABD에서 ∠B=180°−90°−33°=57°<br>② 이등변삼각형의 두 밑각은 같으니 ∠C=∠B=<b>57°</b><span class='xh'>오답 하나씩 격파</span>33°는 주어진 반쪽 꼭지각을 그대로 옮긴 값이고, 66°는 꼭지각 전체(33°×2)에서 멈춘 값이에요. 47°는 90−33을 잘못 계산한 값이고, 114°는 180−66으로 두 밑각의 합이에요. 어느 각을 묻는지 확인한 뒤, 직각삼각형 하나에서 여각을 구하고 이등변의 밑각 상등으로 건너가는 두 걸음이면 충분해요. 검산: 66°+57°+57°=180° ✓",
    core: "수선의 반쪽 각 → 여각으로 밑각 → 반대쪽 밑각!",
  },
  {
    // [슬롯 14] 검산: 외각 116° → 밑각 64° → 꼭지각 52° → 수선이 이등분해 ∠BAD=26 ✓. 실각 apex 52.
    id: "m2u4e014", lessonId: "m2u4l1", type: "mcq",
    prompt: `그림에서 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형 ABC의 밑변을 연장한 바깥쪽 각이 116°이고, A에서 밑변에 수선 AD를 내렸어요. ∠BAD의 크기는?`,
    figure: m2ExamIsoFig({ apexDeg: 52, ext: "116°", foot: true }),
    options: ["26°", "32°", "64°", "52°", "58°"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>세 단계를 이어 붙이는 심화 유형이에요.<br>① 바깥쪽 각에서 밑각 복원: ∠ACB=180°−116°=64°<br>② 꼭지각: ∠BAC=180°−64°×2=52°<br>③ 수선은 꼭지각을 반으로 나누니 ∠BAD=52°÷2=<b>26°</b><span class='xh'>오답 하나씩 격파</span>64°는 밑각, 52°는 꼭지각에서 멈춘 값이에요. 32°는 64°의 절반으로 반 나누는 대상을 밑각으로 착각한 값이고, 58°는 116°의 절반으로 바깥쪽 각을 나눈 값이에요. 반으로 나눌 수 있는 것은 오직 꼭지각(수선이 이등분하는 각)뿐이라는 것을 붙들면 헷갈리지 않아요. 직각삼각형 ABD로 검산하면 90°+64°+26°=180°가 맞아요.",
    core: "외각 → 밑각 → 꼭지각 → 반, 나눌 것은 꼭지각뿐!",
  },
  {
    // [슬롯 15] 검산(LAD ray 역산, th=28): ∠ADE=3×28=84 ✓. 84 라벨 → 기준각 x=28.
    id: "m2u4e015", lessonId: "m2u4l1", type: "num",
    prompt: `그림에서 ${gsym("CB", "seg")}=${gsym("BD", "seg")}=${gsym("DA", "seg")}이고 점 E는 직선 CD 위에 있어요. ∠ADE=84°일 때, ∠C의 크기는 몇 도인가요? 숫자만 입력하세요.`,
    figure: m2ExamIsoLadderFig({ mode: "ray", th: 28, marks: [{ at: "ADE", label: "84°" }, { at: "C", label: "x°" }] }),
    answer: "28", numKind: "int", unitLabel: "°", diff: 3,
    explain: "<span class='xh'>정답 풀이</span>연쇄의 끝 각이 기준각의 몇 배인지 거꾸로 추적해요.<br>① ∠C=x라 하면, BC=BD이니 ∠BDC=x<br>② ∠ABD는 △CBD의 바깥쪽 각이라 x+x=2x<br>③ DB=DA이니 ∠DAB=2x<br>④ ∠ADE는 △ACD의 바깥쪽 각이라 ∠DCA+∠DAC=x+2x=3x<br>⑤ 3x=84°, x=<b>28°</b><span class='xh'>계산 실수 격파</span>84를 반으로 나눈 42나, 그대로 옮긴 84는 연쇄 구조를 안 세운 값이에요. 같은 길이가 하나 이어질 때마다 바깥쪽 각이 기준각만큼 커져서 마지막 각이 정확히 세 배가 된다는 구조를 잡으면, 어떤 수치가 주어져도 나눗셈 한 번으로 끝나요.",
    core: "이등변 두 번 연쇄 = 끝 각은 기준각의 3배, 역산은 ÷3!",
  },
  {
    // [슬롯 16] 검산: ①밑각 상등 참 ②수직이등분 참 ⑤정의 참 · ③"합 항상 90°" 거짓(직각이등변만) ④거짓.
    id: "m2u4e016", lessonId: "m2u4l1", type: "multi",
    prompt: "이등변삼각형에 대한 설명으로 옳은 것을 모두 고르세요.",
    options: [
      "두 밑각의 크기는 같아요",
      "꼭지각의 이등분선은 밑변을 수직으로 이등분해요",
      "두 밑각의 크기의 합은 언제나 90°예요",
      "꼭지각은 언제나 밑각보다 커요",
      "두 변의 길이가 같은 삼각형을 이등변삼각형이라고 해요",
    ],
    answer: [0, 1, 4], diff: 1,
    explain: "<span class='xh'>정답 풀이</span>이등변삼각형의 정의는 두 변의 길이가 같은 삼각형이고, 대표 성질이 두 밑각의 크기가 같다는 것과 꼭지각의 이등분선이 밑변을 수직이등분한다는 것이에요. 셋 다 이 단원의 뼈대예요.<span class='xh'>오답 하나씩 격파</span>두 밑각의 합이 90°인 것은 꼭지각이 90°인 직각이등변삼각형뿐이에요. 꼭지각이 40°라면 밑각의 합은 140°가 되죠. 꼭지각이 밑각보다 항상 큰 것도 아니에요. 꼭지각 40°, 밑각 70°처럼 밑각이 더 큰 이등변삼각형도 얼마든지 있어요. '언제나'가 붙은 설명은 반례 하나만 찾으면 무너진다는 판별 습관을 들이면 좋아요.",
    core: "정의(두 변 같음)+성질(밑각 같음·수직이등분)이 세 기둥!",
  },
  {
    // [슬롯 17] 검산: 밑각 66° → 꼭지각 180−132=48 ✓. 실각 apex 48.
    id: "m2u4e017", lessonId: "m2u4l1", type: "mcq",
    prompt: `그림의 ${gsym("ABC", "tri")}에서 ${gsym("AB", "seg")}=${gsym("AC", "seg")}이고 ∠C=66°일 때, ∠A의 크기는?`,
    figure: m2ExamIsoFig({ apexDeg: 48, baseR: "66°", apex: "x°" }),
    options: ["48°", "66°", "114°", "33°", "24°"],
    answer: 0, diff: 1,
    explain: "<span class='xh'>정답 풀이</span>두 밑각이 같다는 성질을 쓴 뒤 내각의 합으로 마무리해요.<br>① ∠B=∠C=66°<br>② ∠A=180°−66°×2=<b>48°</b><span class='xh'>오답 하나씩 격파</span>66°는 밑각을 그대로 옮긴 값이고, 114°는 180°에서 66°를 한 번만 뺀 값이에요. 밑각은 두 개니까 두 번 빼야 해요. 33°는 66°의 절반, 24°는 48°의 절반인데 이 문제에는 반으로 나누는 단계가 없어요. 수선이나 이등분선이 등장할 때만 반 나누기가 나온다는 것을 구분해 두면, 계산 단계를 헷갈리지 않아요. 검산: 48°+66°+66°=180° ✓",
    core: "밑각 두 번 빼기, 반 나누기는 이등분선 있을 때만!",
  },
  {
    // [슬롯 18] 검산: 수선 = 수직이등분 → DC=BC÷2=26÷2=13 ✓.
    id: "m2u4e018", lessonId: "m2u4l1", type: "num",
    prompt: `그림처럼 ${gsym("AB", "seg")}=${gsym("AC", "seg")}인 이등변삼각형 ABC의 꼭짓점 A에서 밑변에 수선 AD를 내렸어요. ${gsym("BC", "seg")}=26 cm일 때, ${gsym("DC", "seg")}의 길이는 몇 cm인가요? 숫자만 입력하세요.`,
    figure: m2ExamIsoFig({ apexDeg: 68, foot: true, tickBase: true, base: "26 cm" }),
    answer: "13", numKind: "int", unitLabel: "cm", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>이등변삼각형에서 꼭짓점 A에서 내린 수선은 밑변의 수직이등분선이기도 해요.<br>① AD가 BC를 수직으로 이등분하니 BD=DC<br>② DC=26÷2=<b>13 cm</b><span class='xh'>계산 실수 격파</span>26을 그대로 쓰면 밑변 전체를 옮긴 거예요. 수선이 밑변을 반으로 나눈다는 성질은 이등변삼각형이기 때문에 성립하는 것이지, 아무 삼각형에서나 수선의 발이 중점이 되는 것은 아니라는 점도 함께 기억해 두세요. 부등변삼각형이라면 수선의 발과 중점이 서로 다른 위치에 떨어져요. 그래서 이 성질은 이등변임을 확인한 뒤에만 쓸 수 있어요.",
    core: "이등변의 수선 발 = 밑변의 중점, 절반으로!",
  },
  {
    // [슬롯 19] 검산(LAD tri, b=21): BD=DE=EA=AC 사슬 → ∠C=3b=63 ✓. 63 라벨 → ∠B=21.
    id: "m2u4e019", lessonId: "m2u4l1", type: "mcq",
    prompt: `그림의 ${gsym("ABC", "tri")}에서 점 D는 ${gsym("AB", "seg")} 위에, 점 E는 ${gsym("BC", "seg")} 위에 있고 ${gsym("BD", "seg")}=${gsym("DE", "seg")}=${gsym("EA", "seg")}=${gsym("AC", "seg")}예요. ∠C=63°일 때, ∠B의 크기는?`,
    figure: m2ExamIsoLadderFig({ mode: "tri", th: 21, marks: [{ at: "C", label: "63°" }, { at: "B", label: "x°" }] }),
    options: ["21°", "63°", "42°", "27°", "18°"],
    answer: 0, diff: 3,
    explain: "<span class='xh'>정답 풀이</span>사슬을 따라 바깥쪽 각이 한 계단씩 커져요. ∠B=x라 하면<br>① BD=DE이니 ∠DEB=x, 바깥쪽 각 ∠ADE=2x<br>② DE=EA이니 ∠DAE=∠ADE=2x, 바깥쪽 각 ∠AEC=x+2x=3x<br>③ EA=AC이니 ∠ACE=∠AEC=3x<br>④ 3x=63°, x=<b>21°</b><span class='xh'>오답 하나씩 격파</span>63°는 주어진 각을 옮긴 값이고, 42°는 두 배 자리(2x)에서 멈춘 값이에요. 27°나 18°는 3으로 나눌 것을 다른 수로 나눈 값이에요. 같은 길이 네 개가 이등변삼각형 세 개를 만들고, 이등변을 하나 지날 때마다 바깥쪽 각에 기준각이 한 번씩 쌓인다는 구조가 보이면 답은 63÷3 한 번이에요.",
    core: "사슬 한 칸마다 +x, 끝 각은 3배!",
  },
  {
    // [슬롯 20] 검산: 둔각 이등변 · 꼭지각 96° → 밑각 (180−96)÷2=42 ✓.
    id: "m2u4e020", lessonId: "m2u4l1", type: "num",
    prompt: `그림의 ${gsym("ABC", "tri")}에서 ${gsym("AB", "seg")}=${gsym("AC", "seg")}이고 꼭지각 ∠A=96°예요. ∠B의 크기는 몇 도인가요? 숫자만 입력하세요.`,
    figure: m2ExamIsoFig({ apexDeg: 96, apex: "96°", baseL: "x°" }),
    answer: "42", numKind: "int", unitLabel: "°", diff: 2,
    explain: "<span class='xh'>정답 풀이</span>꼭지각이 둔각이어도 계산 순서는 똑같아요.<br>① 두 밑각의 합: 180°−96°=84°<br>② 밑각 하나: 84°÷2=<b>42°</b><span class='xh'>계산 실수 격파</span>꼭지각이 90°를 넘으면 그림이 납작해져서 낯설게 느껴지지만, 이등변삼각형의 성질은 예각이든 둔각이든 똑같이 성립해요. 꼭지각이 둔각이면 두 밑각은 반드시 예각이 된다는 것도 알아 두면 좋아요. 세 각의 합이 180°로 고정되어 있으니 둔각이 두 개일 수는 없거든요. 검산: 96°+42°+42°=180° ✓. 84에서 멈추거나 48로 잘못 나누지 않게 마지막 나눗셈을 한 번 되짚으세요.",
    core: "둔각 이등변도 같은 공식, 밑각은 반드시 예각!",
  },
];
