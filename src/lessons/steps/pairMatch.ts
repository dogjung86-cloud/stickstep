// pairMatch — 짝 맞추기 연습(중2 IV L2: 원소 기호 ↔ 이름). 범용 스텝.
//   왼쪽 열에서 칩 하나를 고르고 오른쪽 열에서 짝을 탭한다. 맞으면 둘 다 잠기고(초록),
//   틀리면 흔들리며 다시. 전부 맞추면 시트 피드백 + CTA — 채점은 무오답 1회 완주 기준.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface Pair {
  a: string; // 왼쪽(예: 원소 기호 — HTML 허용)
  b: string; // 오른쪽(예: 이름)
}
interface PairMatchStep {
  title: string;
  lead?: string;
  aLabel?: string;
  bLabel?: string;
  pairs: Pair[];
  cta?: string;
  explainGood?: string;
  explainBad?: string;
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pairMatch: StepRenderer = (host, step, api) => {
  const s = step as unknown as PairMatchStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const board = el("div", { class: "pm-board" });
  const colA = el("div", { class: "pm-col" });
  const colB = el("div", { class: "pm-col" });
  if (s.aLabel || s.bLabel) {
    board.appendChild(el("div", { class: "pm-head", text: s.aLabel ?? "" }));
    board.appendChild(el("div", { class: "pm-head", text: s.bLabel ?? "" }));
  }
  board.append(colA, colB);
  const readout = el("div", { class: "helper", html: "왼쪽에서 하나를 고르고, 오른쪽에서 <b>짝</b>을 찾아 탭해요!" });
  host.append(board, readout);

  let selA = -1;
  let selChip: HTMLButtonElement | null = null;
  let matched = 0;
  let wrongAny = false;
  let done = false;

  const aChips: HTMLButtonElement[] = [];
  const order = shuffled(s.pairs.map((_, i) => i));
  order.forEach((i) => {
    const chip = el("button", { class: "pm-chip pm-a", html: s.pairs[i].a, attrs: { type: "button" } });
    chip.addEventListener("click", () => {
      if (done || chip.classList.contains("ok")) return;
      haptic(HAPTIC.select);
      aChips.forEach((c) => c.classList.remove("sel"));
      chip.classList.add("sel");
      selA = i;
      selChip = chip;
    });
    aChips.push(chip);
    colA.appendChild(chip);
  });
  shuffled(s.pairs.map((_, i) => i)).forEach((i) => {
    const chip = el("button", { class: "pm-chip pm-b", html: s.pairs[i].b, attrs: { type: "button" } });
    chip.addEventListener("click", () => {
      if (done || chip.classList.contains("ok")) return;
      if (selA < 0) {
        readout.innerHTML = "먼저 <b>왼쪽</b>에서 하나를 골라요!";
        return;
      }
      if (i === selA) {
        chip.classList.add("ok");
        selChip?.classList.remove("sel");
        selChip?.classList.add("ok");
        selA = -1;
        selChip = null;
        matched++;
        haptic(HAPTIC.correct);
        readout.innerHTML = `<b>${matched}</b> / ${s.pairs.length} 짝 완성!`;
        if (matched === s.pairs.length) {
          done = true;
          api.recordQuiz(!wrongAny);
          window.setTimeout(() => {
            api.openSheet({
              good: !wrongAny,
              title: wrongAny ? "다 맞췄어요 — 몇 번 헷갈렸죠?" : "완벽한 짝 맞추기!",
              html: (wrongAny ? s.explainBad : s.explainGood) ?? "",
              onContinue: api.next,
            });
          }, 420);
        }
      } else {
        wrongAny = true;
        chip.classList.add("miss");
        haptic(HAPTIC.wrong);
        window.setTimeout(() => chip.classList.remove("miss"), 420);
      }
    });
    colB.appendChild(chip);
  });

  api.setCTA("짝을 모두 찾아요", { enabled: false });
};
