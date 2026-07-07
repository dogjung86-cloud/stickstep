// binSort — 칩을 통(bin)에 분류. 변인 통제(2통)·생물 분류·열의 이동(3통) 공용.
// 기본 조작은 드래그 앤 드롭(칩을 끌어 통 위에 놓기). 접근성을 위해
// 탭 조작(칩 탭 → 통 탭)도 그대로 지원한다. 담긴 칩은 다시 끌거나 탭해 옮길 수 있다.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface BinDef { id: string; label: string; color?: string; hint?: string; }
interface ItemDef { label: string; bin: string; svg?: string; }
interface BinSortStep {
  title: string;
  lead?: string;
  instruction?: string;
  bins: BinDef[];
  items: ItemDef[];
  explainGood?: string;
  explainBad?: string;
}

const DRAG_THRESHOLD = 7; // px — 이보다 덜 움직이면 탭으로 취급

export const binSort: StepRenderer = (host, step, api) => {
  const s = step as unknown as BinSortStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const place: (string | null)[] = s.items.map(() => null); // item -> bin id
  let picked: number | null = null;
  let locked = false;

  const hintEl = el("div", { class: "bin-hint", text: s.instruction ?? "칩을 끌어 알맞은 통에 놓아요. (탭해서 옮겨도 돼요)" });
  const tray = el("div", { class: "bin-tray" });
  const binsBox = el("div", { class: "bins" });
  host.append(hintEl, tray, binsBox);

  // ---- 드래그 상태 ----
  let drag: {
    i: number;
    pointerId: number;
    chip: HTMLElement;
    clone: HTMLElement | null;
    frameRect: DOMRect | null;
    startX: number;
    startY: number;
    moved: boolean;
  } | null = null;
  let wasFull = false; // CTA pop은 '방금 다 채운' 전이 순간에만

  function cancelDrag(): void {
    if (!drag) return;
    drag.clone?.remove();
    drag.chip.classList.remove("ghost");
    drag = null;
    clearHover();
  }

  function binUnder(e: PointerEvent): HTMLElement | null {
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    return hit ? (hit.closest(".bin") as HTMLElement | null) : null;
  }
  function trayUnder(e: PointerEvent): boolean {
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    return !!hit && !!hit.closest(".bin-tray");
  }

  function clearHover(): void {
    binsBox.querySelectorAll(".bin").forEach((b) => b.classList.remove("hover"));
  }

  function onChipMove(e: PointerEvent): void {
    if (!drag || locked || e.pointerId !== drag.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      drag.moved = true;
      const r = drag.chip.getBoundingClientRect();
      const clone = drag.chip.cloneNode(true) as HTMLElement;
      clone.className = "bin-chip drag-clone";
      clone.style.width = `${r.width}px`;
      // 폰 프레임 안에 붙여야 프레임 밖으로 칩이 새어 나가지 않는다
      const frame = document.getElementById("frame");
      (frame ?? document.body).appendChild(clone);
      drag.frameRect = frame ? frame.getBoundingClientRect() : null;
      drag.clone = clone;
      drag.chip.classList.add("ghost");
      haptic(HAPTIC.select);
    }
    if (drag.moved && drag.clone) {
      const ox = drag.frameRect?.left ?? 0;
      const oy = drag.frameRect?.top ?? 0;
      drag.clone.style.transform = `translate(${e.clientX - ox}px, ${e.clientY - oy}px) translate(-50%, -70%) scale(1.06) rotate(1.5deg)`;
      const over = binUnder(e);
      binsBox.querySelectorAll(".bin").forEach((b) => b.classList.toggle("hover", b === over));
    }
  }

  function onChipUp(e: PointerEvent): void {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const d = drag;
    drag = null;
    d.clone?.remove();
    d.chip.classList.remove("ghost");
    clearHover();
    if (locked) return;
    if (d.moved) {
      const over = binUnder(e);
      if (over && over.dataset.bin) {
        place[d.i] = over.dataset.bin;
        picked = null;
        haptic(HAPTIC.select);
      } else if (place[d.i] !== null && trayUnder(e)) {
        place[d.i] = null; // 트레이로 되돌려 회수
        haptic(HAPTIC.tap);
      }
      refresh();
    } else {
      pick(d.i); // 거의 안 움직였으면 탭으로 취급
    }
  }

  function chip(i: number): HTMLElement {
    const it = s.items[i];
    const c = el("button", {
      class: `bin-chip ${picked === i ? "picked" : ""}`,
      attrs: { "aria-pressed": picked === i ? "true" : "false" },
    });
    if (it.svg) c.appendChild(el("span", { class: "bin-chip-ic", html: it.svg }));
    c.appendChild(el("span", { html: it.label }));
    if (!locked) {
      c.addEventListener("pointerdown", (e) => {
        if (drag) return; // 멀티터치: 두 번째 손가락은 무시
        try {
          c.setPointerCapture(e.pointerId);
        } catch {
          /* 합성 이벤트 등 캡처 불가 환경 — 캡처 없이도 드래그는 동작 */
        }
        drag = { i, pointerId: e.pointerId, chip: c, clone: null, frameRect: null, startX: e.clientX, startY: e.clientY, moved: false };
      });
      c.addEventListener("pointermove", onChipMove);
      c.addEventListener("pointerup", onChipUp);
      c.addEventListener("pointercancel", onChipUp);
      // 키보드(Enter/Space)는 pointer 이벤트 없이 click(detail 0)만 합성한다
      c.addEventListener("click", (e) => {
        if (e.detail === 0) pick(i);
      });
    }
    return c;
  }

  function refresh(): void {
    clear(tray);
    s.items.forEach((_, i) => {
      if (place[i] === null) tray.appendChild(chip(i));
    });
    if (!tray.children.length) tray.appendChild(el("div", { class: "bin-tray-empty", text: "모두 분류했어요" }));

    clear(binsBox);
    for (const bin of s.bins) {
      const drop = el("div", { class: "bin-drop" });
      s.items.forEach((_, i) => {
        if (place[i] === bin.id) {
          const c = chip(i);
          if (locked) c.classList.add(place[i] === s.items[i].bin ? "ok" : "no");
          drop.appendChild(c);
        }
      });
      const card = el(
        "div",
        {
          class: "bin",
          style: bin.color ? `--bin:${bin.color}` : "",
          dataset: { bin: bin.id },
          attrs: { tabindex: "0", role: "button", "aria-label": `통에 담기: ${bin.label}` },
        },
        el(
          "div",
          { class: "bin-head" },
          el("span", { class: "bin-dot" }),
          el("span", { class: "bin-label", html: bin.label }),
          bin.hint ? el("span", { class: "bin-sub", text: bin.hint }) : el("span", {}),
        ),
        drop,
      );
      if (!locked) {
        card.addEventListener("click", (e) => {
          if ((e.target as HTMLElement).closest(".bin-chip")) return; // 칩 회수 클릭은 통 담기로 처리하지 않음
          dropInto(bin.id);
        });
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            dropInto(bin.id);
          }
        });
      }
      binsBox.appendChild(card);
    }

    const full = place.every((v) => v !== null);
    api.setCTA("확인하기", { enabled: full && !locked, onClick: confirm, pop: full && !wasFull });
    wasFull = full;
  }

  function pick(i: number): void {
    if (locked) return;
    if (place[i] !== null) {
      place[i] = null; // 회수
      picked = null;
    } else {
      picked = picked === i ? null : i;
    }
    haptic(HAPTIC.tap);
    refresh();
  }

  function dropInto(binId: string): void {
    if (locked || picked === null) return;
    place[picked] = binId;
    picked = null;
    haptic(HAPTIC.select);
    refresh();
  }

  function confirm(): void {
    if (locked) return;
    cancelDrag(); // 진행 중이던 드래그 강제 종료(클론 잔존 방지)
    locked = true;
    picked = null;
    const good = s.items.every((it, i) => place[i] === it.bin);
    refresh();
    api.setCTA("확인하기", { enabled: false });
    api.recordQuiz(good);
    window.setTimeout(() => {
      api.openSheet({
        good,
        title: good ? "분류 성공!" : "분류를 다시 볼까요",
        html: (good ? s.explainGood : s.explainBad) ?? "",
        onContinue: api.next,
      });
    }, 420);
  }

  refresh();

  return () => cancelDrag();
};
