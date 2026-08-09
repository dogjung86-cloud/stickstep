// [중1 Ⅱ v3] L5 lifeStackLab — 「생명의 계단 쌓기」.
// 한 통찰: 생물의 몸은 세포→조직→(조직계/기관계)→기관→개체로 유기적으로 구성된다 —
// 동물 코스(근육세포→근육조직→심장→순환계→사람)와 식물 코스(잎살세포→울타리조직→
// 기본조직계→잎→나무)를 직접 쌓아 보면 "식물엔 조직계, 동물엔 기관계"가 몸으로 남는다.
// 이미지는 구작 검증 자산(public/bio2/levels — 10종) 재사용. 단계명은 배치 순간 공개(조작 뒤 명명).
// 채점: 마지막 차이 질문(첫 시도)만 recordQuiz.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import type { StepRenderer } from "../../types";

interface LskStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

interface Rung {
  img: string;
  name: string;
  rank: string;
}
const COURSES: Record<"animal" | "plant", { label: string; rungs: Rung[] }> = {
  animal: {
    label: "동물 코스",
    rungs: [
      { img: "muscle-cell.webp", name: "근육세포", rank: "세포" },
      { img: "muscle-tissue.webp", name: "근육조직", rank: "조직" },
      { img: "heart.webp", name: "심장", rank: "기관" },
      { img: "circulatory.webp", name: "순환계", rank: "기관계" },
      { img: "human.webp", name: "사람", rank: "개체" },
    ],
  },
  plant: {
    label: "식물 코스",
    rungs: [
      { img: "leaf-cell.webp", name: "잎살세포", rank: "세포" },
      { img: "palisade.webp", name: "울타리조직", rank: "조직" },
      { img: "tissue-system.webp", name: "기본조직계", rank: "조직계" },
      { img: "leaf.webp", name: "잎", rank: "기관" },
      { img: "tree.webp", name: "나무", rank: "개체" },
    ],
  },
};

export const lifeStackLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LskStep;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge b4", dataset: { g: "animal" } }, el("b", { text: "동물 코스" }), el("span", { text: "5칸" })),
    el("div", { class: "pn-badge b4", dataset: { g: "plant" } }, el("b", { text: "식물 코스" }), el("span", { text: "5칸" })),
    el("div", { class: "pn-badge b4", dataset: { g: "diff" } }, el("b", { text: "차이 발견" }), el("span", { text: "질문 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "<b>동물 코스</b>부터! 아래 카드에서 <b>가장 작은 단위</b>를 골라 첫 칸에 놓고, 점점 큰 단계로 쌓아 올려요.",
  });

  const board = el("div", { class: "b4-board lsk-board" });
  const slotRow = el("div", { class: "lsk-slots" });
  const trayRow = el("div", { class: "lsk-tray" });
  board.append(slotRow, trayRow);

  const askBox = el("div", { class: "hook-choices lsk-ask" });
  askBox.style.display = "none";

  host.append(goalChips, helper, board, askBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "두 계단 완성! 공통 뼈대는 <b>세포 → 조직 → 기관 → 개체</b> — 거기에 식물은 <b>조직계</b>(조직과 기관 사이), 동물은 <b>기관계</b>(기관과 개체 사이)가 한 칸씩 끼어들어요.";
      api.enableCTA(s.cta ?? "용어로 정리하기");
    }
  }

  let course: "animal" | "plant" = "animal";
  let idx = 0;

  function buildCourse(): void {
    const { rungs } = COURSES[course];
    idx = 0;
    slotRow.innerHTML = "";
    trayRow.innerHTML = "";
    rungs.forEach((r, i) => {
      const slot = el(
        "div",
        { class: "lsk-slot", dataset: { i: String(i) } },
        el("span", { class: "lsk-slot-img" }),
        el("span", { class: "lsk-rank", text: "?" }),
      );
      slotRow.appendChild(slot);
      if (i < rungs.length - 1) slotRow.appendChild(el("span", { class: "lsk-arrow", text: "→" }));
      void r;
    });
    const order = rungs.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.forEach((ri) => {
      const r = rungs[ri];
      const card = el(
        "button",
        { class: "lsk-card", attrs: { type: "button" }, dataset: { i: String(ri) } },
        el("img", { attrs: { src: `${BASE}bio2/levels/${r.img}`, alt: r.name, draggable: "false" } }),
        el("b", { text: r.name }),
      ) as HTMLButtonElement;
      card.addEventListener("click", () => pick(ri, card));
      trayRow.appendChild(card);
    });
  }

  function pick(ri: number, card: HTMLButtonElement): void {
    if (finished) return;
    const { rungs } = COURSES[course];
    if (ri === idx) {
      haptic(HAPTIC.select);
      const r = rungs[ri];
      const slot = slotRow.querySelector(`.lsk-slot[data-i="${ri}"]`) as HTMLElement;
      (slot.querySelector(".lsk-slot-img") as HTMLElement).innerHTML =
        `<img src="${BASE}bio2/levels/${r.img}" alt="${r.name}" draggable="false"/>`;
      const rank = slot.querySelector(".lsk-rank") as HTMLElement;
      rank.textContent = r.rank;
      slot.classList.add("filled");
      if (r.rank === "조직계" || r.rank === "기관계") slot.classList.add("special");
      card.remove();
      idx += 1;
      if (idx < rungs.length) {
        helper.innerHTML = `<b>${r.name}</b>은(는) <b>${r.rank}</b> 단계! 다음으로 큰 단계는 뭘까요?`;
      } else if (course === "animal") {
        collect("animal", "완성!");
        helper.innerHTML = "동물 계단 완성 — <b>세포→조직→기관→기관계→개체</b>! 이번엔 <b>식물 코스</b>예요. 같은 순서일까요?";
        later(() => {
          course = "plant";
          buildCourse();
        }, 1700);
      } else {
        collect("plant", "완성!");
        helper.innerHTML = "식물 계단도 완성! 그런데… 두 계단이 <b>완전히 같지는 않았죠</b>?";
        later(showDiff, 900);
      }
    } else {
      haptic(HAPTIC.wrong);
      card.classList.add("nope");
      board.classList.add("shake");
      const want = rungs[idx];
      helper.innerHTML =
        idx === 0
          ? "첫 칸은 <b>가장 작은 단위</b>부터 — 무엇으로 시작해야 할까요?"
          : `지금 칸은 <b>${want.rank}</b> 차례예요 — 방금 놓은 것<b>들이 모여</b> 만들어지는 걸 골라 봐요.`;
      later(() => {
        card.classList.remove("nope");
        board.classList.remove("shake");
      }, 650);
    }
  }

  let diffShown = false;
  function showDiff(): void {
    if (diffShown) return;
    diffShown = true;
    b4Ask(
      askBox,
      "동물 계단에는 <b>없고</b>, 식물 계단에만 있던 단계는 무엇이었나요?",
      [
        { t: "조직계 — 조직과 기관 사이에 있었다", ok: true },
        { t: "기관계 — 기관과 개체 사이에 있었다", ok: false },
        { t: "세포 — 맨 첫 칸에 있었다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! <b>조직계는 식물</b>(조직과 기관 사이), <b>기관계는 동물</b>(기관과 개체 사이) — 자리까지 기억했네요."
          : "계단을 다시 떠올려요 — 기관계와 세포는 <b>동물 계단에도</b> 있었죠. 식물에만 있던 건 <b>조직계</b>(조직과 기관 사이)예요.";
        collect("diff", "조직계!");
      },
    );
  }

  buildCourse();
  api.setCTA("두 코스를 모두 쌓아요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
