// chemTable — periodicLab(중2 IV L4). 원자 번호 1~20 미니 주기율표 탐험(DOM).
//   칸을 탭하면 정보 카드(이름·기호·원자 번호=양성자수·족·주기·상온 상태).
//   미션: ① 원자 번호 9번 찾기 ② 1족 삼형제(Li·Na·K) ③ 18족 삼형제(He·Ne·Ar).
//   미션을 마치면 같은 세로줄(족)이 물들며 "같은 족 = 비슷한 성질"이 보인다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface ElemInfo {
  z: number;
  sym: string;
  name: string;
  group: number;
  period: number;
  state: "고체" | "액체" | "기체";
  note?: string;
}
const E: ElemInfo[] = [
  { z: 1, sym: "H", name: "수소", group: 1, period: 1, state: "기체", note: "1족 자리에 있지만 리튬·나트륨 같은 금속과는 성질이 달라요" },
  { z: 2, sym: "He", name: "헬륨", group: 18, period: 1, state: "기체", note: "풍선 기체 — 다른 물질과 거의 반응하지 않아요" },
  { z: 3, sym: "Li", name: "리튬", group: 1, period: 2, state: "고체", note: "물과 활발히 반응해 기체를 내요" },
  { z: 4, sym: "Be", name: "베릴륨", group: 2, period: 2, state: "고체" },
  { z: 5, sym: "B", name: "붕소", group: 13, period: 2, state: "고체" },
  { z: 6, sym: "C", name: "탄소", group: 14, period: 2, state: "고체", note: "연필심(흑연)·다이아몬드의 주인공" },
  { z: 7, sym: "N", name: "질소", group: 15, period: 2, state: "기체", note: "공기의 약 78%" },
  { z: 8, sym: "O", name: "산소", group: 16, period: 2, state: "기체", note: "우리가 숨 쉬는 데 꼭 필요한" },
  { z: 9, sym: "F", name: "플루오린", group: 17, period: 2, state: "기체", note: "치약 속 불소의 정체" },
  { z: 10, sym: "Ne", name: "네온", group: 18, period: 2, state: "기체", note: "네온사인의 붉은 빛" },
  { z: 11, sym: "Na", name: "나트륨", group: 1, period: 3, state: "고체", note: "물과 격렬히 반응! 소금의 성분이기도" },
  { z: 12, sym: "Mg", name: "마그네슘", group: 2, period: 3, state: "고체" },
  { z: 13, sym: "Al", name: "알루미늄", group: 13, period: 3, state: "고체", note: "캔·포일의 재료" },
  { z: 14, sym: "Si", name: "규소", group: 14, period: 3, state: "고체", note: "반도체의 주인공" },
  { z: 15, sym: "P", name: "인", group: 15, period: 3, state: "고체" },
  { z: 16, sym: "S", name: "황", group: 16, period: 3, state: "고체", note: "온천 냄새의 범인" },
  { z: 17, sym: "Cl", name: "염소", group: 17, period: 3, state: "기체", note: "수돗물 소독에 쓰여요" },
  { z: 18, sym: "Ar", name: "아르곤", group: 18, period: 3, state: "기체", note: "전구 속을 채우는 조용한 기체" },
  { z: 19, sym: "K", name: "칼륨", group: 1, period: 4, state: "고체", note: "물에 넣으면 불꽃까지! 1족 맏형" },
  { z: 20, sym: "Ca", name: "칼슘", group: 2, period: 4, state: "고체", note: "뼈와 조개껍데기의 성분" },
];
// 8열 축약 배치(1·2족 | 13~18족) — 중2 눈높이의 미니 주기율표
const COL_OF: Record<number, number> = { 1: 0, 2: 1, 13: 2, 14: 3, 15: 4, 16: 5, 17: 6, 18: 7 };

export const periodicLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "find9" } }, el("b", { text: "9번 원소" }), el("span", { text: "번호로 찾기" })),
    el("div", { class: "pn-badge", dataset: { g: "g1" } }, el("b", { text: "1족 삼형제" }), el("span", { text: "Li·Na·K" })),
    el("div", { class: "pn-badge", dataset: { g: "g18" } }, el("b", { text: "18족 삼형제" }), el("span", { text: "He·Ne·Ar" })),
  );
  const grid = el("div", { class: "pt-grid" });
  const info = el("div", { class: "pt-info", html: "칸을 눌러 원소를 살펴보세요. 첫 미션 — <b>원자 번호 9번</b>은 누구일까요?" });
  const helper = el("div", {
    class: "helper",
    html: "가로줄이 <b>주기</b>, 세로줄이 <b>족</b>이에요. 원소들은 <b>원자 번호(=양성자수)</b> 순서로 줄을 서 있어요.",
  });
  host.append(goalChips, grid, info, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const cellOf: Record<number, HTMLButtonElement> = {};
  const found1 = new Set<number>();
  const found18 = new Set<number>();
  const goals = new Set<string>();
  let finished = false;

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (id === "find9")
      helper.innerHTML = "다음 미션 — 물과 활발히 반응하는 <b>1족 삼형제</b>(리튬·나트륨·칼륨)를 모두 눌러요. 어디 있을까요? 힌트: <b>같은 세로줄</b>!";
    if (id === "g1") {
      E.filter((x) => x.group === 1 && x.z !== 1).forEach((x) => cellOf[x.z].classList.add("g1"));
      helper.innerHTML = "1족 세로줄이 물들었어요 — 셋 다 <b>물과 활발히 반응</b>하는 닮은꼴! 마지막: 반응을 싫어하는 <b>18족 삼형제</b>(헬륨·네온·아르곤).";
    }
    if (id === "g18") {
      E.filter((x) => x.group === 18).forEach((x) => cellOf[x.z].classList.add("g18"));
    }
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 주기율표는 원소를 <b>원자 번호(양성자수) 순</b>으로 배열한 표 — 세로줄(<b>족</b>)이 같으면 성질이 비슷해요. 1족은 물과 활발히, 18족은 조용히. 위치만 봐도 성질이 <b>예측</b>되죠!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // 그리드 구성(4주기 × 8열, 빈칸 유지)
  for (let period = 1; period <= 4; period++) {
    for (let col = 0; col < 8; col++) {
      const elem = E.find((x) => x.period === period && COL_OF[x.group] === col);
      if (!elem) {
        grid.appendChild(el("div", { class: "pt-cell blank" }));
        continue;
      }
      const cell = el(
        "button",
        { class: "pt-cell", attrs: { type: "button", "aria-label": `${elem.name}, 원자 번호 ${elem.z}` } },
        el("small", { text: String(elem.z) }),
        el("b", { text: elem.sym }),
      );
      cell.addEventListener("click", () => {
        haptic(HAPTIC.select);
        grid.querySelectorAll(".pt-cell").forEach((c) => c.classList.remove("sel"));
        cell.classList.add("sel");
        info.innerHTML =
          `<b>${elem.name} (${elem.sym})</b> — 원자 번호 <b>${elem.z}</b> = 양성자 ${elem.z}개 · ${elem.group}족 ${elem.period}주기 · 상온에서 ${elem.state}` +
          (elem.note ? `<br>${elem.note}` : "");
        if (elem.z === 9) collect("find9", "플루오린 F!");
        if (elem.group === 1 && elem.z !== 1) {
          found1.add(elem.z);
          if (found1.size === 3) collect("g1", "물과 활발!");
        }
        if (elem.group === 18) {
          found18.add(elem.z);
          if (found18.size === 3) collect("g18", "조용한 기체!");
        }
      });
      cellOf[elem.z] = cell;
      grid.appendChild(cell);
    }
  }

  api.setCTA("주기율표를 탐험해요", { enabled: false });
};
