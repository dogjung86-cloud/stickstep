// order — 항목을 올바른 순서로 배열. 탐구 과정 순서 맞추기 등에 사용.
// 탭으로 슬롯을 채우고, 채운 칩을 다시 탭하면 회수한다.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface OrderStep {
  title: string;
  lead?: string;
  items: string[]; // 정답 순서
  explainGood?: string;
  explainBad?: string;
}

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // 우연히 정답과 같으면 한 칸 회전
  if (a.every((v, i) => v === i)) a.push(a.shift()!);
  return a;
}

export const order: StepRenderer = (host, step, api) => {
  const s = step as unknown as OrderStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const n = s.items.length;
  const placed: (number | null)[] = Array(n).fill(null); // 슬롯별 origIndex
  const poolOrder = shuffled(n); // 풀 표시 순서: 섞되 고정(회수한 칩이 제자리로 돌아가 안정적)
  const inPool = new Set(poolOrder);
  let locked = false;

  const slotsBox = el("div", { class: "ord-slots" });
  const poolBox = el("div", { class: "ord-pool" });
  host.append(slotsBox, poolBox);

  function nextEmpty(): number {
    return placed.findIndex((v) => v === null);
  }

  function refresh(): void {
    clear(slotsBox);
    placed.forEach((orig, i) => {
      const slot = el("div", { class: `ord-slot ${orig === null ? "empty" : "filled"}` }, el("span", { class: "ord-num", text: String(i + 1) }));
      if (orig !== null) {
        slot.appendChild(el("span", { class: "ord-txt", html: s.items[orig] }));
        if (!locked) slot.addEventListener("click", () => {
          placed[i] = null;
          inPool.add(orig);
          haptic(HAPTIC.tap);
          refresh();
        });
      }
      slotsBox.appendChild(slot);
    });

    clear(poolBox);
    poolOrder.filter((orig) => inPool.has(orig)).forEach((orig) => {
      const chip = el("button", { class: "ord-chip", html: s.items[orig] });
      chip.addEventListener("click", () => {
        if (locked) return;
        const slot = nextEmpty();
        if (slot < 0) return;
        placed[slot] = orig;
        inPool.delete(orig);
        haptic(HAPTIC.select);
        refresh();
      });
      poolBox.appendChild(chip);
    });

    const full = placed.every((v) => v !== null);
    api.setCTA("확인하기", { enabled: full && !locked, onClick: confirm, pop: full });
  }

  function confirm(): void {
    if (locked) return;
    locked = true;
    const good = placed.every((v, i) => v === i);
    Array.from(slotsBox.children).forEach((slotEl, i) => {
      slotEl.classList.add(placed[i] === i ? "ok" : "no");
    });
    api.setCTA("확인하기", { enabled: false });
    api.recordQuiz(good);
    window.setTimeout(() => {
      api.openSheet({
        good,
        title: good ? "순서가 맞아요" : "순서를 다시 볼까요",
        html: (good ? s.explainGood : s.explainBad) ?? "",
        onContinue: api.next,
      });
    }, 420);
  }

  refresh();
};
