// chemTable — periodicLab(중2 IV L4) v3: 가로 모드 인터랙티브 주기율표 (1~118번 전체).
//   교과서 그림 IV-6 구조 그대로: 18열 × 7주기, 란타넘족(57~71)·악티늄족(89~103)은 병합 칸,
//   칸마다 원자 번호·원소 기호·한글 이름. 원소 탭 → 하단 정보 바에 간단한 특징.
//   · 칠하기 토글(순환): 기본 → 상온 상태(고체 파랑/액체 초록/기체 살구 — 104번~는 추정) → 금속·비금속
//   · 미션 ① 1족 삼형제(Li·Na·K) ② 18족 삼형제(He·Ne·Ar) ③ 2주기 원자 번호 순 완주
//   rotateStage는 DOM을 그대로 회전하므로 캔버스 리매핑 없이 버튼 이벤트가 정상 동작한다.
//   "주기율표 읽는 법"(원자 번호/기호/이름)은 랩 앞 concept 스텝(atomFigures.cellAnatomyFig)이 담당.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { RotateStage } from "../../ui/rotateStage";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Kind = "metal" | "nonmetal" | "semi";
type St = "고체" | "액체" | "기체";
interface ElemInfo {
  z: number;
  sym: string;
  name: string;
  group: number;
  period: number;
  state: St;
  kind: Kind;
  /** 104번~ 인공 원소 — 상온 상태는 추정값(교과서 각주) */
  est?: boolean;
  note?: string;
}

// [z, sym, name, group, period, state, kind, note?]
type Row = [number, string, string, number, number, St, Kind, string?];
const ROWS: Row[] = [
  [1, "H", "수소", 1, 1, "기체", "nonmetal", "우주에서 가장 많은 원소. 1족 자리지만 금속인 다른 1족과 성질이 다른 예외예요"],
  [2, "He", "헬륨", 18, 1, "기체", "nonmetal", "풍선을 띄우는 기체 — 다른 물질과 거의 반응하지 않아요"],
  [3, "Li", "리튬", 1, 2, "고체", "metal", "물과 활발히 반응하는 무른 금속. 스마트폰 배터리의 주인공!"],
  [4, "Be", "베릴륨", 2, 2, "고체", "metal", "가볍고 단단해 우주 망원경 거울에 쓰여요"],
  [5, "B", "붕소", 13, 2, "고체", "semi", "내열 유리를 단단하게 만들어 줘요"],
  [6, "C", "탄소", 14, 2, "고체", "nonmetal", "연필심(흑연)도 다이아몬드도 전부 탄소! 생명체의 뼈대 원소"],
  [7, "N", "질소", 15, 2, "기체", "nonmetal", "공기의 약 78%. 과자 봉지를 빵빵하게 채우는 기체"],
  [8, "O", "산소", 16, 2, "기체", "nonmetal", "숨 쉴 때 꼭 필요한 기체. 지각에서 가장 많은 원소이기도 해요"],
  [9, "F", "플루오린", 17, 2, "기체", "nonmetal", "치약 속 '불소'의 정체 — 반응성이 아주 큰 기체"],
  [10, "Ne", "네온", 18, 2, "기체", "nonmetal", "네온사인의 주황빛. 거의 반응하지 않는 조용한 기체"],
  [11, "Na", "나트륨", 1, 3, "고체", "metal", "물과 격렬히 반응! 염소와 만나면 소금(NaCl)이 돼요"],
  [12, "Mg", "마그네슘", 2, 3, "고체", "metal", "불꽃놀이의 눈부신 흰 빛. 엽록소의 중심 원소"],
  [13, "Al", "알루미늄", 13, 3, "고체", "metal", "캔·포일·창틀의 재료. 가볍고 녹슬지 않아요"],
  [14, "Si", "규소", 14, 3, "고체", "semi", "반도체의 주인공. 모래와 유리의 주성분이에요"],
  [15, "P", "인", 15, 3, "고체", "nonmetal", "성냥 머리에 들어 있어요. 뼈와 DNA에도!"],
  [16, "S", "황", 16, 3, "고체", "nonmetal", "온천 냄새의 범인. 노란 결정으로 나는 원소"],
  [17, "Cl", "염소", 17, 3, "기체", "nonmetal", "수돗물과 수영장 소독에 쓰여요. 나트륨과 만나면 소금!"],
  [18, "Ar", "아르곤", 18, 3, "기체", "nonmetal", "전구 속을 채우는 기체 — 필라멘트가 타지 않게 지켜 줘요"],
  [19, "K", "칼륨", 1, 4, "고체", "metal", "물에 넣으면 보라 불꽃까지! 바나나에 많은 원소"],
  [20, "Ca", "칼슘", 2, 4, "고체", "metal", "뼈·치아·조개껍데기의 성분"],
  [21, "Sc", "스칸듐", 3, 4, "고체", "metal", "가볍고 튼튼해 자전거 프레임에 쓰이기도 해요"],
  [22, "Ti", "타이타늄", 4, 4, "고체", "metal", "가볍고 강하고 녹슬지 않아 인공 관절·안경테에 쓰여요"],
  [23, "V", "바나듐", 5, 4, "고체", "metal", "강철에 조금만 섞어도 훨씬 단단해져요"],
  [24, "Cr", "크로뮴", 6, 4, "고체", "metal", "반짝이는 도금의 주인공. 스테인리스강의 비밀"],
  [25, "Mn", "망가니즈", 7, 4, "고체", "metal", "건전지와 강철에 들어가는 금속"],
  [26, "Fe", "철", 8, 4, "고체", "metal", "인류가 가장 많이 쓰는 금속. 혈액 속 헤모글로빈에도!"],
  [27, "Co", "코발트", 9, 4, "고체", "metal", "파란 유리·도자기 물감의 원료. 배터리에도 쓰여요"],
  [28, "Ni", "니켈", 10, 4, "고체", "metal", "동전과 스테인리스에 들어가는 은백색 금속"],
  [29, "Cu", "구리", 11, 4, "고체", "metal", "전선의 주인공 — 전기가 아주 잘 통해요. 10원 동전에도!"],
  [30, "Zn", "아연", 12, 4, "고체", "metal", "철을 녹슬지 않게 감싸 주는 금속(함석). 건전지에도!"],
  [31, "Ga", "갈륨", 13, 4, "고체", "metal", "손바닥 위에서 녹는 금속(녹는점 약 30℃) — 멘델레예프가 예언했던 그 원소!"],
  [32, "Ge", "저마늄", 14, 4, "고체", "semi", "규소와 함께 반도체에 쓰여요 — 이것도 예언됐던 원소!"],
  [33, "As", "비소", 15, 4, "고체", "semi", "옛날 이야기 속 독약으로 유명하지만 반도체에도 쓰여요"],
  [34, "Se", "셀레늄", 16, 4, "고체", "nonmetal", "복사기와 태양 전지에 쓰이는 원소"],
  [35, "Br", "브로민", 17, 4, "액체", "nonmetal", "상온에서 액체인 단 두 원소 중 하나! 붉은 갈색 액체예요"],
  [36, "Kr", "크립톤", 18, 4, "기체", "nonmetal", "공기 중에 아주 조금 있는 조용한 기체"],
  [37, "Rb", "루비듐", 1, 5, "고체", "metal", "1족답게 물과 폭발적으로 반응해요. 원자시계에 쓰여요"],
  [38, "Sr", "스트론튬", 2, 5, "고체", "metal", "불꽃놀이의 빨간 빛"],
  [39, "Y", "이트륨", 3, 5, "고체", "metal", "LED와 레이저에 쓰이는 금속"],
  [40, "Zr", "지르코늄", 4, 5, "고체", "metal", "가짜 다이아몬드(큐빅)와 원자로에 쓰여요"],
  [41, "Nb", "나이오븀", 5, 5, "고체", "metal", "초전도 자석의 재료"],
  [42, "Mo", "몰리브데넘", 6, 5, "고체", "metal", "아주 높은 온도를 견디는 금속"],
  [43, "Tc", "테크네튬", 7, 5, "고체", "metal", "자연에 거의 없어 인공적으로 처음 만든 원소"],
  [44, "Ru", "루테늄", 8, 5, "고체", "metal", "하드디스크와 전자 부품에 쓰여요"],
  [45, "Rh", "로듐", 9, 5, "고체", "metal", "금보다 비싼 금속 — 자동차 매연 정화 장치에!"],
  [46, "Pd", "팔라듐", 10, 5, "고체", "metal", "매연 정화 장치와 치과 재료에 쓰여요"],
  [47, "Ag", "은", 11, 5, "고체", "metal", "모든 금속 중 전기가 가장 잘 통해요. 수저와 장신구로!"],
  [48, "Cd", "카드뮴", 12, 5, "고체", "metal", "충전지에 쓰였지만 독성이 있어 점점 퇴출 중"],
  [49, "In", "인듐", 13, 5, "고체", "metal", "터치스크린의 투명 전극에 꼭 필요한 금속"],
  [50, "Sn", "주석", 14, 5, "고체", "metal", "청동(구리+주석)과 통조림 깡통 도금의 주인공"],
  [51, "Sb", "안티모니", 15, 5, "고체", "semi", "고대부터 화장품·합금에 쓰인 원소"],
  [52, "Te", "텔루륨", 16, 5, "고체", "semi", "DVD와 태양 전지에 쓰이는 희귀 원소"],
  [53, "I", "아이오딘", 17, 5, "고체", "nonmetal", "상처 소독약(빨간약)의 주인공. 미역·다시마에 많아요"],
  [54, "Xe", "제논", 18, 5, "기체", "nonmetal", "자동차 헤드라이트의 눈부신 흰 빛"],
  [55, "Cs", "세슘", 1, 6, "고체", "metal", "1초의 기준! 세슘 원자시계가 세계 시간을 정해요"],
  [56, "Ba", "바륨", 2, 6, "고체", "metal", "위 엑스레이 검사 때 마시는 조영제의 성분"],
  [72, "Hf", "하프늄", 4, 6, "고체", "metal", "원자로 제어봉에 쓰이는 금속"],
  [73, "Ta", "탄탈럼", 5, 6, "고체", "metal", "스마트폰 부품(축전기)에 꼭 들어가는 금속"],
  [74, "W", "텅스텐", 6, 6, "고체", "metal", "모든 금속 중 녹는점 최고(3400℃)! 전구 필라멘트의 주인공"],
  [75, "Re", "레늄", 7, 6, "고체", "metal", "제트 엔진 부품에 쓰이는 초내열 금속"],
  [76, "Os", "오스뮴", 8, 6, "고체", "metal", "밀도가 가장 큰 원소 — 같은 부피면 물의 22배 무게!"],
  [77, "Ir", "이리듐", 9, 6, "고체", "metal", "공룡 멸종 증거! 운석에 많아 지층 속 이리듐 층이 단서가 됐어요"],
  [78, "Pt", "백금", 10, 6, "고체", "metal", "귀금속이자 최고의 촉매 — 매연 정화 장치의 핵심"],
  [79, "Au", "금", 11, 6, "고체", "metal", "녹슬지 않고 얇게 펴지는 노란 금속. 라틴어 이름 aurum에서 Au"],
  [80, "Hg", "수은", 12, 6, "액체", "metal", "상온에서 액체인 유일한 금속! 옛날 체온계 속 은빛 액체"],
  [81, "Tl", "탈륨", 13, 6, "고체", "metal", "독성이 강해 취급 주의! 특수 유리에 쓰여요"],
  [82, "Pb", "납", 14, 6, "고체", "metal", "무겁고 무른 금속. 자동차 배터리에 쓰여요"],
  [83, "Bi", "비스무트", 15, 6, "고체", "metal", "무지갯빛 계단 모양 결정으로 유명한 금속"],
  [84, "Po", "폴로늄", 16, 6, "고체", "metal", "퀴리 부부가 발견 — 조국 폴란드의 이름을 붙였어요"],
  [85, "At", "아스타틴", 17, 6, "고체", "semi", "지구 전체에 몇 g뿐인 가장 희귀한 자연 원소"],
  [86, "Rn", "라돈", 18, 6, "기체", "nonmetal", "땅에서 나오는 방사성 기체 — 환기가 중요한 이유!"],
  [87, "Fr", "프랑슘", 1, 7, "고체", "metal", "가장 불안정한 자연 원소 — 발견자 조국 프랑스의 이름"],
  [88, "Ra", "라듐", 2, 7, "고체", "metal", "퀴리 부부가 발견한 방사성 원소. '방사능'이란 말이 여기서!"],
  [104, "Rf", "러더포듐", 4, 7, "고체", "metal"],
  [105, "Db", "더브늄", 5, 7, "고체", "metal"],
  [106, "Sg", "시보귬", 6, 7, "고체", "metal"],
  [107, "Bh", "보륨", 7, 7, "고체", "metal"],
  [108, "Hs", "하슘", 8, 7, "고체", "metal"],
  [109, "Mt", "마이트너륨", 9, 7, "고체", "metal", "여성 과학자 리제 마이트너의 이름을 딴 원소"],
  [110, "Ds", "다름슈타튬", 10, 7, "고체", "metal"],
  [111, "Rg", "뢴트게늄", 11, 7, "고체", "metal", "엑스선을 발견한 뢴트겐의 이름을 딴 원소"],
  [112, "Cn", "코페르니슘", 12, 7, "고체", "metal", "지동설의 코페르니쿠스를 기린 이름"],
  [113, "Nh", "니호늄", 13, 7, "고체", "metal", "아시아 최초로 일본이 만든 원소(니혼 = 일본)"],
  [114, "Fl", "플레로븀", 14, 7, "고체", "metal"],
  [115, "Mc", "모스코븀", 15, 7, "고체", "metal"],
  [116, "Lv", "리버모륨", 16, 7, "고체", "metal"],
  [117, "Ts", "테네신", 17, 7, "고체", "semi"],
  [118, "Og", "오가네손", 18, 7, "기체", "nonmetal", "주기율표의 막내(118번). 살아 있는 과학자 오가네시안의 이름!"],
];
const E: ElemInfo[] = ROWS.map(([z, sym, name, group, period, state, kind, note]) => ({
  z, sym, name, group, period, state, kind, note, est: z >= 104,
}));
// 병합 칸(교과서 IV-6 방식): 란타넘족·악티늄족은 3족 자리 한 칸
const MERGED = [
  {
    key: "lan", label: "57~71", name: "란타넘족", period: 6,
    info: "<b>란타넘족(57~71번)</b> — 15개 원소가 이 한 칸에 들어가요. 스마트폰·전기차 모터에 꼭 필요한 <b>희토류</b> 원소가 많아요.",
  },
  {
    key: "act", label: "89~103", name: "악티늄족", period: 7,
    info: "<b>악티늄족(89~103번)</b> — 15개 원소가 이 한 칸에 들어가요. 원자력 발전에 쓰이는 <b>우라늄(92번)</b>이 여기 속해요.",
  },
];
const KIND_NAME: Record<Kind, string> = { metal: "금속", nonmetal: "비금속", semi: "준금속" };
const P2_ORDER = [3, 4, 5, 6, 7, 8, 9, 10];
type Paint = "none" | "state" | "kind";
const PAINT_LABEL: Record<Paint, string> = { none: "칠하기: 끄기", state: "칠하기: 상온 상태", kind: "칠하기: 금속·비금속" };

export const periodicLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "g1" } }, el("b", { text: "1족 삼형제" }), el("span", { text: "Li·Na·K 모으기" })),
    el("div", { class: "pn-badge", dataset: { g: "g18" } }, el("b", { text: "18족 삼형제" }), el("span", { text: "He·Ne·Ar" })),
    el("div", { class: "pn-badge", dataset: { g: "p2" } }, el("b", { text: "2주기 완주" }), el("span", { text: "번호 순서대로" })),
  );
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: previewSvg() }),
    el("div", {
      class: "sp3-enter-txt",
      html: "1번 수소부터 <b>118번 오가네손까지</b> — 칸을 눌러 성질을 탐험하고, 같은 족의 <b>닮은꼴</b>을 확인해요.<br>화면이 자동으로 <b>가로</b>로 돌아가요.",
    }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 크게 열기" }));
  const helper = el("div", {
    class: "helper",
    html: "세로줄이 <b>족</b>(1~18), 가로줄이 <b>주기</b>(1~7) — 원소들은 <b>원자 번호(=양성자수)</b> 순서로 줄을 서 있어요.",
  });
  host.append(goalChips, helper, preview, enterBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  const goals = new Set<string>();
  const found1 = new Set<number>();
  const found18 = new Set<number>();
  let p2i = 0;
  let finished = false;
  let rot: RotateStage | null = null;
  let disposed = false;
  let paint: Paint = "none";
  const cellOf: Record<number, HTMLButtonElement> = {};
  let infoBar: HTMLElement | null = null;
  let missionEls: Record<string, HTMLElement> | null = null;
  let gridEl: HTMLElement | null = null;

  function collect(id: "g1" | "g18" | "p2", subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    missionEls?.[id]?.classList.add("on");
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 주기율표는 원소를 <b>원자 번호(양성자수) 순</b>으로 배열한 표 — 가로줄이 <b>주기</b>, 세로줄이 <b>족</b>이고, <b>같은 족은 성질이 비슷</b>해요. 위치만 봐도 성질이 예측되죠!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function setInfo(html: string): void {
    if (infoBar) infoBar.innerHTML = html;
  }

  function onTap(elem: ElemInfo): void {
    haptic(HAPTIC.select);
    gridEl?.querySelectorAll(".ptx-cell").forEach((c) => c.classList.remove("sel"));
    cellOf[elem.z].classList.add("sel");
    const fallback = elem.est
      ? "실험실에서 인공적으로 만든 원소예요 — 상온 상태는 추정값이랍니다."
      : `${elem.group}족 ${elem.period}주기의 ${KIND_NAME[elem.kind]} 원소예요.`;
    setInfo(
      `<b>${elem.name} (${elem.sym})</b> · 원자 번호 <b>${elem.z}</b> = 양성자 ${elem.z}개 · <b>${elem.group}족 ${elem.period}주기</b> · 상온 ${elem.state}${elem.est ? "(추정)" : ""} · ${KIND_NAME[elem.kind]}<br><span class="ptx-note">${elem.note ?? fallback}</span>`,
    );
    // 미션 판정
    if (elem.group === 1 && elem.z !== 1 && elem.period <= 4) {
      found1.add(elem.z);
      cellOf[elem.z].classList.add("mark1");
      if (found1.size === 3 && !goals.has("g1")) {
        E.filter((x) => x.group === 1 && x.z !== 1).forEach((x) => cellOf[x.z].classList.add("g1"));
        setInfo(
          `<b>1족 삼형제 완성!</b> 리튬·나트륨·칼륨은 같은 <b>세로줄(1족)</b> — 셋 다 <b>무른 금속</b>이고 <b>물과 활발히 반응</b>해요. 아래 루비듐·세슘은 더 격렬하죠. 같은 족 = 닮은 성질!`,
        );
        collect("g1", "물과 활발!");
      }
    }
    if (elem.group === 18 && elem.period <= 3) {
      found18.add(elem.z);
      cellOf[elem.z].classList.add("mark18");
      if (found18.size === 3 && !goals.has("g18")) {
        E.filter((x) => x.group === 18).forEach((x) => cellOf[x.z].classList.add("g18"));
        setInfo(
          `<b>18족 삼형제 완성!</b> 헬륨·네온·아르곤은 다른 물질과 <b>거의 반응하지 않는</b> 조용한 기체들 — 풍선(He)·네온사인(Ne)·전구(Ar)에 안심하고 쓰죠.`,
        );
        collect("g18", "조용한 기체!");
      }
    }
    if (!goals.has("p2") && elem.z === P2_ORDER[p2i]) {
      cellOf[elem.z].classList.add("p2on");
      p2i++;
      if (p2i >= P2_ORDER.length) {
        setInfo(`<b>2주기 완주!</b> 리튬부터 네온까지 — 가로줄 하나(<b>주기</b>)를 원자 번호 순서로 걸었어요. 번호가 곧 줄 서는 순서!`);
        collect("p2", "Li→Ne 완주!");
      } else if (p2i >= 2 && missionEls?.p2) {
        missionEls.p2.textContent = `2주기 ${p2i}/8`;
      }
    }
  }

  // ---- 가로 스테이지 ----
  async function enter(): Promise<void> {
    if (rot || disposed) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({ title: "주기율표 탐험 — 칸을 눌러 보세요", onLeave: () => leave() });

    const wrap = el("div", { class: "ptx-wrap" });
    const grid = el("div", { class: "ptx-grid" });
    gridEl = grid;
    // 열 머리(족 번호)
    grid.appendChild(el("span", { class: "ptx-corner" }));
    for (let g = 1; g <= 18; g++) grid.appendChild(el("span", { class: "ptx-gh", text: String(g) }));
    for (let period = 1; period <= 7; period++) {
      grid.appendChild(el("span", { class: "ptx-ph", text: String(period) }));
      for (let g = 1; g <= 18; g++) {
        const merged = MERGED.find((m) => m.period === period && g === 3);
        if (merged) {
          const cell = el(
            "button",
            { class: "ptx-cell merged", attrs: { type: "button", "aria-label": merged.name } },
            el("small", { text: merged.label }),
            el("i", { text: merged.name }),
          );
          cell.addEventListener("click", () => {
            haptic(HAPTIC.select);
            grid.querySelectorAll(".ptx-cell").forEach((c) => c.classList.remove("sel"));
            cell.classList.add("sel");
            setInfo(merged.info);
          });
          grid.appendChild(cell);
          continue;
        }
        const elem = E.find((x) => x.period === period && x.group === g);
        if (!elem) {
          grid.appendChild(el("span", { class: "ptx-cell blank" }));
          continue;
        }
        const cell = el(
          "button",
          {
            class: `ptx-cell k-${elem.kind} st-${elem.state === "고체" ? "sol" : elem.state === "액체" ? "liq" : "gas"}`,
            attrs: { type: "button", "aria-label": `${elem.name}, 원자 번호 ${elem.z}, ${elem.group}족 ${elem.period}주기` },
          },
          el("small", { text: String(elem.z) }),
          el("b", { text: elem.sym }),
          el("i", { text: elem.name }),
        );
        cell.addEventListener("click", () => onTap(elem));
        cellOf[elem.z] = cell;
        grid.appendChild(cell);
      }
    }
    infoBar = el("div", { class: "ptx-info", html: "칸을 눌러 원소를 살펴보세요 — 먼저 <b>1족 세로줄</b>의 리튬·나트륨·칼륨부터!" });

    const paintBtn = el("button", { class: "sp3-tiltbtn", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: PAINT_LABEL.none }));
    paintBtn.addEventListener("click", () => {
      paint = paint === "none" ? "state" : paint === "state" ? "kind" : "none";
      (paintBtn.querySelector("span") as HTMLElement).textContent = PAINT_LABEL[paint];
      paintBtn.classList.toggle("on", paint !== "none");
      paintBtn.setAttribute("aria-pressed", String(paint !== "none"));
      grid.classList.toggle("paint-state", paint === "state");
      grid.classList.toggle("paint-kind", paint === "kind");
      haptic(HAPTIC.select);
      if (paint === "state")
        setInfo(
          "상온 상태 칠하기 — <b>고체는 파랑, 액체는 초록, 기체는 살구색</b>. 액체는 단 둘(브로민·수은)! 104번~는 추정값이에요.",
        );
      if (paint === "kind")
        setInfo("금속·비금속 칠하기 — <b>왼쪽·아래는 금속</b>(파랑), <b>오른쪽 위는 비금속</b>(주황), 경계엔 <b>준금속</b>(보라). 위치가 곧 성질!");
    });

    const missions = el("div", { class: "sp3-missions lb" });
    missionEls = {};
    ([
      ["g1", "1족 삼형제"],
      ["g18", "18족 삼형제"],
      ["p2", "2주기 완주"],
    ] as [string, string][]).forEach(([id, name]) => {
      const sp = el("span", { text: name });
      if (goals.has(id)) sp.classList.add("on");
      missionEls![id] = sp;
      missions.appendChild(sp);
    });

    wrap.append(grid, infoBar);
    rot.stage.append(wrap, paintBtn, missions);
  }

  function leave(): void {
    rot?.dispose();
    rot = null;
    infoBar = null;
    missionEls = null;
    gridEl = null;
    enterBtn.classList.remove("pulse");
    (enterBtn.querySelector("span") as HTMLElement).textContent = finished ? "주기율표 다시 열기" : "가로 화면으로 이어서 열기";
  }

  enterBtn.addEventListener("click", () => void enter());

  api.setCTA("가로 화면에서 탐험해요", { enabled: false });
  return () => {
    disposed = true;
    rot?.dispose();
  };
};

// 세로 진입 카드 미니 아트 — 주기율표 실루엣(7주기 풀 실루엣)
function previewSvg(): string {
  const cells: string[] = [];
  const cw = 16.5;
  const cell = (c: number, r: number, fill: string): string =>
    `<rect x="${21 + c * cw}" y="${8 + r * 13.4}" width="${cw - 2.5}" height="10.9" rx="2.5" fill="${fill}"/>`;
  const occupied = (g: number, p: number): boolean => {
    if (p === 1) return g === 1 || g === 18;
    if (p === 2 || p === 3) return g <= 2 || g >= 13;
    return true;
  };
  for (let p = 1; p <= 7; p++)
    for (let g = 1; g <= 18; g++)
      if (occupied(g, p)) cells.push(cell(g - 1, p - 1, g === 1 ? "#F0B46A" : p >= 6 && g === 3 ? "#22304A" : "#3A4D6E"));
  return `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect width="360" height="120" fill="#0B1524"/>
    ${cells.join("")}
    <text x="21" y="112" font-family="Pretendard, sans-serif" font-size="11.5" font-weight="800" fill="#C2D2EE">1~118번 원소의 지도</text>
    <text x="340" y="112" text-anchor="end" font-family="Pretendard, sans-serif" font-size="10.5" font-weight="700" fill="#8CA2C0">세로줄 = 닮은꼴</text>
  </svg>`;
}
