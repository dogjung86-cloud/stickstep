// shareLab, 나눠 갖기 검사기(반비례 도입 발견 랩, 자체 제작 소재: 120초 브이로그).
//   ① 사진 장수 x를 스테퍼로 바꾸며 타임라인이 x등분되는 것을 보고 표를 채운다(y=120/x)
//   ② 채워질 때마다 곱 x×y가 항상 120임을 확인(곱 일정 발견)
//   ③ 가짜 판별: 남은 스티커 표(y=12−x, 줄어들긴 함)가 반비례인지 곱 검사로 판별
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA. rAF 금지(CSS+setTimeout).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ShareStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const STICKER_Y = [11, 10, 9, 8, 7, 6]; // y=12−x

export const shareLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ShareStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "fill", label: "표 채우기", sub: "장수 0/6" },
    { id: "prod", label: "곱의 비밀", sub: "x×y는?" },
    { id: "fake", label: "가짜 판별", sub: "잠김" },
  ]);

  const board = mboard(430);
  const scene = el("div", { class: "sh-scene" });
  const stepper = el("div", { class: "lk-actions" });
  const tableWrap = el("div", { class: "lk-table sh-table" });
  const actions = el("div", { class: "lk-actions" });
  board.append(scene, stepper, tableWrap, actions);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "여행 사진으로 <b>딱 120초</b>짜리 브이로그를 만들어요. 사진이 x장이면 한 장의 재생 시간은 몇 초일까요? 장수를 바꿔 봐요!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let x = 1;
  const seen = new Set<number>();
  let fakeMode = false;

  /* ── 타임라인: 120초 바가 x등분 ── */
  function drawScene(): void {
    const W = 320;
    const X0 = 20;
    const cellW = W / x;
    let cells = "";
    for (let i = 0; i < x; i++) {
      const cx = X0 + i * cellW;
      cells +=
        `<g>` +
        `<rect x="${cx + 1.5}" y="26" width="${cellW - 3}" height="34" rx="6" fill="url(#sh-ph)" stroke="#3E7EA8" stroke-width="1.2"/>` +
        (cellW > 30
          ? `<circle cx="${cx + cellW * 0.28}" cy="38" r="3.4" fill="#FFE9A0" stroke="#C79400" stroke-width=".8"/>` +
            `<path d="M${cx + 5} ${52} l${cellW * 0.3} -${9} l${cellW * 0.2} ${5} l${cellW * 0.22} -${8} l${cellW * 0.22} ${12}" stroke="#2E6E52" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
          : "") +
        (cellW > 46 ? `<text x="${cx + cellW / 2}" y="74" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0A5E8C">${120 / x}초</text>` : "") +
        `</g>`;
    }
    if (x >= 5) cells += `<text x="${X0 + W / 2}" y="74" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0A5E8C">한 장에 ${120 / x}초</text>`;
    scene.innerHTML =
      `<svg viewBox="0 0 360 80" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<path d="M${X0} 14 h${W} M${X0} 10 v8 M${X0 + W} 10 v8" stroke="#8CA0B3" stroke-width="1.6"/>` +
      `<rect x="${X0 + W / 2 - 32}" y="4" width="64" height="18" rx="9" fill="#FFFFFF" stroke="#D5DDE6" stroke-width="1"/>` +
      `<text x="${X0 + W / 2}" y="17" text-anchor="middle" font-size="11" font-weight="900" fill="#475569">총 120초</text>` +
      cells +
      `<defs><linearGradient id="sh-ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8ECFA"/><stop offset="1" stop-color="#A8CEE8"/></linearGradient></defs>` +
      `</svg>`;
  }

  function drawTable(xs: number[], ys: (number | null)[], head: [string, string]): void {
    tableWrap.innerHTML = "";
    const grid = el("div", { class: "lk-grid" });
    grid.appendChild(el("span", { class: "lk-h", html: head[0] }));
    xs.forEach((v, i) => grid.appendChild(el("span", { class: "lk-c lk-x", text: String(v), dataset: { col: String(i) } })));
    grid.appendChild(el("span", { class: "lk-h", html: head[1] }));
    ys.forEach((v, i) =>
      grid.appendChild(el("span", { class: `lk-c lk-y${v == null ? " empty" : ""}`, text: v == null ? "" : String(v), dataset: { col: String(i) } })),
    );
    // 곱 행
    grid.appendChild(el("span", { class: "lk-h", html: "x×y" }));
    ys.forEach((v, i) =>
      grid.appendChild(
        el("span", {
          class: `lk-c sh-prod${v == null ? " empty" : ""}`,
          text: v == null ? "" : String(xs[i] * v),
          dataset: { col: String(i) },
        }),
      ),
    );
    tableWrap.appendChild(grid);
  }

  function updateCell(): void {
    const col = x - 1;
    const y = 120 / x;
    const yCell = tableWrap.querySelector(`.lk-y[data-col="${col}"]`) as HTMLElement;
    const pCell = tableWrap.querySelector(`.sh-prod[data-col="${col}"]`) as HTMLElement;
    if (yCell.classList.contains("empty")) {
      yCell.textContent = String(y);
      yCell.classList.remove("empty");
      yCell.classList.add("pop");
      pCell.textContent = String(x * y);
      pCell.classList.remove("empty");
      pCell.classList.add("pop");
    }
    if (!seen.has(x)) {
      seen.add(x);
      const chip = chips.el.querySelector(`[data-g="fill"] span`) as HTMLElement;
      chip.textContent = `장수 ${seen.size}/6`;
      if (seen.size === 6) {
        chips.on("fill", "완성!");
        later(() => {
          chips.on("prod", "언제나 120!");
          tableWrap.querySelectorAll(".sh-prod").forEach((c) => c.classList.add("glow"));
          haptic(HAPTIC.correct);
          toast("x가 2배·3배가 되면 y는 반·삼분의 일, 곱은 언제나 120!");
          helper.innerHTML = "발견! 장수가 늘면 시간은 줄지만 <b>곱 x×y는 언제나 120</b>이에요. 그럼 '줄어들기만 하면' 다 이런 관계일까요?";
          later(phaseFake, 2100);
        }, 900);
      }
    }
  }

  /* ── 1국면: 스테퍼 탐험 ── */
  function drawStepper(): void {
    clear(stepper);
    const minus = el("button", { class: "ct-btn", attrs: { type: "button", "aria-label": "사진 줄이기" } }, el("span", { text: "−" })) as HTMLButtonElement;
    const read = el("span", { class: "ln-aread", html: `사진 <b>${x}</b>장` });
    const plus = el("button", { class: "ct-btn", attrs: { type: "button", "aria-label": "사진 늘리기" } }, el("span", { text: "+" })) as HTMLButtonElement;
    const stepX = (d: number): void => {
      if (fakeMode) return;
      const nx = Math.max(1, Math.min(6, x + d));
      if (nx === x) return;
      x = nx;
      haptic(HAPTIC.tap);
      read.innerHTML = `사진 <b>${x}</b>장`;
      drawScene();
      updateCell();
    };
    minus.addEventListener("click", () => stepX(-1));
    plus.addEventListener("click", () => stepX(1));
    stepper.append(minus, read, plus);
  }

  /* ── 2국면: 가짜 판별(남은 스티커) ── */
  function phaseFake(): void {
    fakeMode = true;
    const chip = chips.el.querySelector(`[data-g="fake"] span`) as HTMLElement;
    chip.textContent = "도전!";
    scene.innerHTML = `<div class="lk-swap">새 도전! <b>스티커 12장</b> 중에서 x장을 쓰고 남은 스티커가 y장이에요.</div>`;
    clear(stepper);
    drawTable([1, 2, 3, 4, 5, 6], STICKER_Y, ["x(장)", "y(장)"]);
    // 곱 행은 검사 버튼으로 채운다
    tableWrap.querySelectorAll(".sh-prod").forEach((c) => {
      c.textContent = "";
      c.classList.add("empty");
    });
    helper.innerHTML = "y가 줄어들긴 해요. 이것도 <b>반비례</b>일까요? 곱을 검사하고 판정해 보세요!";
    clear(actions);
    const test = el("button", { class: "ct-btn", attrs: { type: "button" } }, el("span", { text: "곱 검사" })) as HTMLButtonElement;
    let tested = false;
    test.addEventListener("click", () => {
      if (test.disabled) return;
      test.disabled = true;
      tested = true;
      haptic(HAPTIC.select);
      [1, 2, 3, 4, 5, 6].forEach((xv, i) =>
        later(() => {
          const c = tableWrap.querySelector(`.sh-prod[data-col="${i}"]`) as HTMLElement;
          c.textContent = String(xv * STICKER_Y[i]);
          c.classList.remove("empty");
          c.classList.add("pop", "bad");
          if (i === 5) {
            haptic(HAPTIC.cross);
            toast("11, 20, 27, 32, 35, 36… 곱이 제멋대로예요!");
          }
        }, 240 * i),
      );
    });
    const yes = el("button", { class: "ct-btn", attrs: { type: "button" } }, el("span", { text: "반비례다" })) as HTMLButtonElement;
    const no = el("button", { class: "ct-btn", attrs: { type: "button" } }, el("span", { text: "반비례가 아니다" })) as HTMLButtonElement;
    yes.addEventListener("click", () => {
      haptic(HAPTIC.cross);
      yes.classList.add("no");
      toast(tested ? "곱이 들쭉날쭉했잖아요, 반비례는 곱이 일정해야 해요!" : "먼저 곱 검사부터 해 보세요!");
      later(() => yes.classList.remove("no"), 600);
    });
    no.addEventListener("click", () => {
      if (!tested) {
        toast("감이 좋아요! 그래도 곱 검사로 확인 사살부터!");
        return;
      }
      haptic(HAPTIC.done);
      chips.on("fake", "간파!");
      helper.innerHTML =
        "정확해요! 줄어든다고 다 반비례가 아니에요. <b>x가 2배면 y가 반, 그래서 곱 x×y가 일정</b>해야 진짜 반비례랍니다.";
      clear(actions);
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    });
    actions.append(test, yes, no);
  }

  drawScene();
  drawTable([1, 2, 3, 4, 5, 6], Array.from({ length: 6 }, () => null), ["x(장)", "y(초)"]);
  drawStepper();
  updateCell(); // x=1은 시작부터 관찰된 상태
  api.setCTA("검사를 모두 마치면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
