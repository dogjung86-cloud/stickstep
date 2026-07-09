// linkLab, 2배 링크 검사기(정비례 도입 발견 랩, 자체 제작 소재: 귤 비타민 C).
//   ① 귤을 한 개씩 추가하며 표를 채운다(x 1..6, y=30x)
//   ② 링크 검사: ×2(1→2열)·×3(2→6열) 화살을 쏘아 "x가 2배면 y도 2배"를 눈으로 확인
//   ③ 가짜 판별: 저금통 표(y=500x+1000, 늘어나긴 함)가 정비례인지 같은 검사로 판별
// 채점 아님(발견 랩), 전 목표 달성 시 recordQuiz(true)+enableCTA. rAF 금지(CSS+setTimeout).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LinkStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const TANG_Y = [30, 60, 90, 120, 150, 180]; // 귤 x개의 비타민 C(mg), y=30x
const BANK_Y = [1500, 2000, 2500, 3000, 3500, 4000];

export const linkLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LinkStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "fill", label: "표 채우기", sub: "귤 0/6" },
    { id: "link", label: "링크 검사", sub: "×2 그리고 ×3" },
    { id: "fake", label: "가짜 판별", sub: "잠김" },
  ]);

  const board = mboard(430);
  const scene = el("div", { class: "lk-scene" });
  const tableWrap = el("div", { class: "lk-table" });
  const actions = el("div", { class: "lk-actions" });
  board.append(scene, tableWrap, actions);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "귤 한 개엔 비타민 C가 약 <b>30 mg</b> 들어 있어요. 귤을 하나씩 추가하며 표를 채워 봐요!",
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

  let eggs = 0; // 추가한 귤 수
  let linksDone = 0;
  let busy = false;

  /* ── 장면: 귤 바구니 + 비타민 C 게이지 ── */
  function drawScene(): void {
    const fruitSvg = (i: number): string =>
      `<g class="lk-egg" style="opacity:${i < eggs ? 1 : 0.18}; transition: opacity .3s ease">
        <circle cx="${26 + i * 34}" cy="32" r="14" fill="url(#lk-tg)" stroke="#C46A1B" stroke-width="1.4"/>
        <ellipse cx="${21 + i * 34}" cy="26" rx="4.5" ry="5.5" fill="#fff" opacity=".4"/>
        <path d="M${26 + i * 34} 19 q5 -6 10 -4 q-4 6 -10 4" fill="#3E9B4F" stroke="#2E7A3C" stroke-width="1"/>
      </g>`;
    const gaugeW = Math.round((eggs / 6) * 150);
    scene.innerHTML =
      `<svg viewBox="0 0 360 62" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<ellipse cx="112" cy="54" rx="104" ry="4" fill="#2A3A5E" opacity=".08"/>` +
      Array.from({ length: 6 }, (_, i) => fruitSvg(i)).join("") +
      `<rect x="228" y="18" width="118" height="24" rx="12" fill="#F4F7FA" stroke="#D5DDE6" stroke-width="1.2"/>` +
      `<rect x="230" y="20" width="${Math.max(0, Math.round((gaugeW / 150) * 114))}" height="20" rx="10" fill="url(#lk-pr)" style="transition: width .4s var(--ease-out)"/>` +
      `<text x="287" y="34" text-anchor="middle" font-size="11.5" font-weight="900" fill="${eggs >= 3 ? "#FFFFFF" : "#5E4E2A"}">비타민 C ${eggs * 30} mg</text>` +
      `<defs><radialGradient id="lk-tg" cx=".38" cy=".3" r="1"><stop offset="0" stop-color="#FFC873"/><stop offset="1" stop-color="#F29B38"/></radialGradient>` +
      `<linearGradient id="lk-pr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFC46E"/><stop offset="1" stop-color="#F2A030"/></linearGradient></defs>` +
      `</svg>`;
  }

  /* ── 표: 2행 × 6열 (+ 머리) ── */
  function drawTable(xs: number[], ys: (number | null)[], head: [string, string]): void {
    tableWrap.innerHTML = "";
    const grid = el("div", { class: "lk-grid" });
    grid.appendChild(el("span", { class: "lk-h", html: head[0] }));
    xs.forEach((x, i) => grid.appendChild(el("span", { class: "lk-c lk-x", text: String(x), dataset: { col: String(i) } })));
    grid.appendChild(el("span", { class: "lk-h", html: head[1] }));
    ys.forEach((y, i) =>
      grid.appendChild(
        el("span", { class: `lk-c lk-y${y == null ? " empty" : ""}`, text: y == null ? "" : String(y), dataset: { col: String(i) } }),
      ),
    );
    tableWrap.appendChild(grid);
    // 링크 화살표 오버레이(SVG, 열 위·아래에 호를 그린다)
    tableWrap.appendChild(el("div", { class: "lk-arcs", html: "" }));
  }

  /** 열 i→j 링크 호 2개(x 위, y 아래) + 배율 라벨. */
  function drawArc(i: number, j: number, mul: string, good: boolean): void {
    const grid = tableWrap.querySelector(".lk-grid") as HTMLElement;
    const arcs = tableWrap.querySelector(".lk-arcs") as HTMLElement;
    const xi = grid.querySelector(`.lk-x[data-col="${i}"]`) as HTMLElement;
    const xj = grid.querySelector(`.lk-x[data-col="${j}"]`) as HTMLElement;
    const yi = grid.querySelector(`.lk-y[data-col="${i}"]`) as HTMLElement;
    const yj = grid.querySelector(`.lk-y[data-col="${j}"]`) as HTMLElement;
    const gr = tableWrap.getBoundingClientRect();
    const c = (r: DOMRect): number => r.left + r.width / 2 - gr.left;
    const top = xi.getBoundingClientRect().top - gr.top;
    const bot = yi.getBoundingClientRect().bottom - gr.top;
    const x1 = c(xi.getBoundingClientRect());
    const x2 = c(xj.getBoundingClientRect());
    const y1 = c(yi.getBoundingClientRect());
    const y2 = c(yj.getBoundingClientRect());
    const col = good ? "#0CA678" : "#E8434F";
    const svg = el("div", {
      class: "lk-arc",
      html:
        `<svg style="position:absolute; inset:0; overflow:visible" xmlns="http://www.w3.org/2000/svg" fill="none">` +
        `<path d="M${x1} ${top - 2} Q${(x1 + x2) / 2} ${top - 26} ${x2} ${top - 2}" stroke="${col}" stroke-width="2.2" marker-end="url(#lkm-${good ? "g" : "b"}-${i}-${j})"/>` +
        `<text x="${(x1 + x2) / 2}" y="${top - 30}" text-anchor="middle" font-size="12" font-weight="900" fill="${col}">${mul}</text>` +
        `<path d="M${y1} ${bot + 2} Q${(y1 + y2) / 2} ${bot + 26} ${y2} ${bot + 2}" stroke="${col}" stroke-width="2.2" marker-end="url(#lkm2-${good ? "g" : "b"}-${i}-${j})"/>` +
        `<text class="lk-ymul" x="${(y1 + y2) / 2}" y="${bot + 40}" text-anchor="middle" font-size="12" font-weight="900" fill="${col}" opacity="0" style="transition: opacity .4s ease .5s">?</text>` +
        `<defs>` +
        `<marker id="lkm-${good ? "g" : "b"}-${i}-${j}" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7z" fill="${col}"/></marker>` +
        `<marker id="lkm2-${good ? "g" : "b"}-${i}-${j}" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7z" fill="${col}"/></marker>` +
        `</defs>` +
        `</svg>`,
    });
    arcs.appendChild(svg);
    return;
  }

  /* ── 1국면: 귤 추가 ── */
  function phaseFill(): void {
    drawScene();
    drawTable([1, 2, 3, 4, 5, 6], Array.from({ length: 6 }, () => null), ["x(개)", "y(mg)"]);
    clear(actions);
    const btn = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "귤 추가" })) as HTMLButtonElement;
    btn.addEventListener("click", () => {
      if (busy || eggs >= 6) return;
      busy = true;
      eggs += 1;
      haptic(HAPTIC.select);
      drawScene();
      const cell = tableWrap.querySelector(`.lk-y[data-col="${eggs - 1}"]`) as HTMLElement;
      cell.textContent = String(TANG_Y[eggs - 1]);
      cell.classList.remove("empty");
      cell.classList.add("pop");
      const chip = chips.el.querySelector(`[data-g="fill"] span`) as HTMLElement;
      chip.textContent = `귤 ${eggs}/6`;
      later(() => {
        busy = false;
        if (eggs === 6) {
          chips.on("fill", "완성!");
          toast("표 완성! 이제 링크를 검사해 봐요");
          phaseLink();
        }
      }, 260);
    });
    actions.appendChild(btn);
  }

  /* ── 2국면: ×2·×3 링크 검사 ── */
  function phaseLink(): void {
    clear(actions);
    helper.innerHTML = "x가 <b>2배</b>가 될 때(1개 → 2개) y는 어떻게 될까요? 링크를 쏘아 확인해 보세요!";
    const mk = (label: string, i: number, j: number, mul: string): HTMLButtonElement => {
      const b = el("button", { class: "ct-btn", attrs: { type: "button" } }, el("span", { text: label })) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (b.disabled) return;
        b.disabled = true;
        haptic(HAPTIC.select);
        drawArc(i, j, mul, true);
        const yi = TANG_Y[i];
        const yj = TANG_Y[j];
        later(() => {
          const t = tableWrap.querySelectorAll(".lk-ymul");
          const last = t[t.length - 1] as SVGTextElement;
          last.textContent = `×${yj / yi}`;
          last.style.opacity = "1";
          haptic(HAPTIC.correct);
          toast(`x ${mul} 이면 y도 ×${yj / yi}!`);
          linksDone += 1;
          if (linksDone === 2) {
            chips.on("link", "×2 ×3 확인!");
            helper.innerHTML = "x가 2배·3배가 되면 y도 <b>정확히 2배·3배</b>! 이런 관계가 진짜인지, 가짜가 섞여도 알아볼 수 있을까요?";
            later(phaseFake, 1600);
          }
        }, 650);
      });
      return b;
    };
    actions.append(mk("×2 링크 (1개→2개)", 0, 1, "×2"), mk("×3 링크 (2개→6개)", 1, 5, "×3"));
  }

  /* ── 3국면: 가짜 판별(저금통) ── */
  function phaseFake(): void {
    const chip = chips.el.querySelector(`[data-g="fake"] span`) as HTMLElement;
    chip.textContent = "도전!";
    scene.innerHTML =
      `<div class="lk-swap">새 도전! <b>저금통</b>: 처음 1000원이 들어 있고, 매주 500원씩 저금해요. y가 늘어나긴 하는데, 이것도 <b>정비례</b>일까요? 링크로 검사하고 판정!</div>`;
    drawTable([1, 2, 3, 4, 5, 6], BANK_Y, ["x(주)", "y(원)"]);
    clear(actions);
    helper.innerHTML = "×2 링크를 걸어 보면 진실이 드러나요. 틀려도 왜 아닌지 알려 줄게요!";
    const test = el("button", { class: "ct-btn", attrs: { type: "button" } }, el("span", { text: "×2 링크 (1주→2주)" })) as HTMLButtonElement;
    let tested = false;
    test.addEventListener("click", () => {
      if (test.disabled) return;
      test.disabled = true;
      tested = true;
      haptic(HAPTIC.select);
      drawArc(0, 1, "×2", false);
      later(() => {
        const t = tableWrap.querySelectorAll(".lk-ymul");
        const last = t[t.length - 1] as SVGTextElement;
        last.textContent = "×1.33…";
        last.style.opacity = "1";
        haptic(HAPTIC.cross);
        toast("x는 2배인데 y는 1500 → 2000, 2배가 아니에요!");
      }, 650);
    });
    const yes = el("button", { class: "ct-btn", attrs: { type: "button" } }, el("span", { text: "정비례다" })) as HTMLButtonElement;
    const no = el("button", { class: "ct-btn", attrs: { type: "button" } }, el("span", { text: "정비례가 아니다" })) as HTMLButtonElement;
    yes.addEventListener("click", () => {
      haptic(HAPTIC.cross);
      yes.classList.add("no");
      toast(tested ? "링크가 이미 알려줬어요, x 2배에 y는 2배가 아니었죠!" : "먼저 ×2 링크로 검사해 보세요!");
      later(() => yes.classList.remove("no"), 600);
    });
    no.addEventListener("click", () => {
      if (!tested) {
        toast("감이 좋아요! 그래도 ×2 링크로 확인 사살부터!");
        return;
      }
      haptic(HAPTIC.done);
      chips.on("fake", "간파!");
      helper.innerHTML =
        "정확해요! 처음 1000원이 <b>끼어 있어서</b> 배율이 어긋나요. 늘어난다고 다 정비례가 아니라, <b>x가 2배면 y도 꼭 2배</b>여야 정비례랍니다.";
      clear(actions);
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    });
    actions.append(test, yes, no);
  }

  phaseFill();
  api.setCTA("검사를 모두 마치면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
