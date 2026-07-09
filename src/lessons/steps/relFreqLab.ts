// relFreqLab, 상대도수 역전 랩(Ⅵ 통계 — 교과서 248~250쪽 상대도수와 그 그래프).
// 국면 3개: 1 총원이 다른 두 반(1반 25명·2반 10명)의 "독서 4시간 이상" 도수 비교 → 1반 승?
//   총원 공개 → 공정성 의심 → 2 상대도수 계산 조립(5/25=0.2 vs 4/10=0.4) + 그래프 토글 → 역전! →
//   3 상대도수의 합 미션(항상 1).
// 연출은 CSS transition + setTimeout 체인(막대 높이 전환은 CSS transition). rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, mfmt } from "../../ui/mathKit";
import { GEO } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface RelStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 220;
/* 일주일 독서 시간 분포(계급 4개: 0~2, 2~4, 4~6, 6~8시간) */
const C1 = [10, 8, 5, 2]; // 1반(25명)
const C2 = [2, 3, 4, 1]; // 2반(10명)
const T1 = 25;
const T2 = 10;
const AX_Y = 176;
const GROUP_X = (bi: number): number => 56 + bi * 72;

export const relFreqLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RelStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "unfair", label: "불공정 탐지", sub: "총원이 달라" },
    { id: "flip", label: "비율 역전", sub: "0.2 vs 0.4" },
    { id: "sum", label: "합은 언제나", sub: "= 1" },
  ]);

  const board = mboard(620);
  const stage = el("div", { class: "mrf-stage" });
  const legend =
    `<g><rect x="230" y="10" width="12" height="12" rx="3" fill="#4759CE"/><text x="247" y="20" font-size="10" font-weight="800" fill="#2A3040">1반</text>` +
    `<rect x="278" y="10" width="12" height="12" rx="3" fill="#2F9E44"/><text x="295" y="20" font-size="10" font-weight="800" fill="#2A3040">2반</text></g>`;
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<line x1="26" y1="${AX_Y}" x2="${W - 14}" y2="${AX_Y}" stroke="${GEO.ink}" stroke-width="2"/>` +
    ["0~2", "2~4", "4~6", "6~8"].map((t, i) => `<text x="${GROUP_X(i) + 22}" y="${AX_Y + 16}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${GEO.soft}">${t}시간</text>`).join("") +
    legend +
    `<text class="mrf-mode" x="26" y="20" font-size="10.5" font-weight="900" fill="#2839A0">세로축: 도수(명)</text>` +
    `<g class="mrf-bars"></g><g class="mrf-mark"></g>` +
    `</svg>`;
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const eqs = el("div", { class: "mq6-eqs" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, eqs, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "1반과 2반의 독서 대결! <b>4시간 이상 6시간 미만</b> 구간을 두고 두 반이 다투고 있어요.",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gBars = svg.querySelector(".mrf-bars") as SVGGElement;
  const gMark = svg.querySelector(".mrf-mark") as SVGGElement;
  const modeLabel = svg.querySelector(".mrf-mode") as SVGTextElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let finished = false;
  let relMode = false;

  /** 막대 렌더 — 도수 모드: 1명=13px, 비율 모드: 0.1=32px. CSS transition으로 높이 전환. */
  function drawBars(): void {
    let out = "";
    // 세로 눈금 + 막대 위 값 라벨 — 축 숫자가 없으면 몇 명인지 읽을 수 없다(실사용 피드백).
    const ticks: [number, string][] = relMode
      ? [[32, "0.1"], [64, "0.2"], [96, "0.3"], [128, "0.4"]]
      : [[65, "5"], [130, "10"]];
    for (const [h, lb] of ticks) {
      out +=
        `<line x1="26" y1="${AX_Y - h}" x2="${W - 14}" y2="${AX_Y - h}" stroke="#EDF0F6" stroke-width="1.1"/>` +
        `<text x="22" y="${AX_Y - h + 3.5}" text-anchor="end" font-size="8.5" font-weight="700" fill="#8B95A6">${lb}</text>`;
    }
    for (let bi = 0; bi < 4; bi++) {
      const x = GROUP_X(bi);
      const h1 = relMode ? (C1[bi] / T1) * 320 : C1[bi] * 13;
      const h2 = relMode ? (C2[bi] / T2) * 320 : C2[bi] * 13;
      const l1 = relMode ? String(C1[bi] / T1) : String(C1[bi]);
      const l2 = relMode ? String(C2[bi] / T2) : String(C2[bi]);
      out +=
        `<rect class="b1" x="${x}" y="${AX_Y - h1}" width="20" height="${h1}" fill="#4759CE" opacity=".9" style="transition: all .7s var(--ease-out, ease-out)"/>` +
        `<rect class="b2" x="${x + 24}" y="${AX_Y - h2}" width="20" height="${h2}" fill="#2F9E44" opacity=".9" style="transition: all .7s var(--ease-out, ease-out)"/>` +
        `<text x="${x + 10}" y="${AX_Y - h1 - 4}" text-anchor="middle" font-size="7.5" font-weight="800" fill="#2839A0">${l1}</text>` +
        `<text x="${x + 34}" y="${AX_Y - h2 - 4}" text-anchor="middle" font-size="7.5" font-weight="800" fill="#1F7A33">${l2}</text>`;
    }
    gBars.innerHTML = out;
    modeLabel.textContent = relMode ? "세로축: 전체에서 차지하는 비율" : "세로축: 도수(명)";
  }

  function markTarget(): void {
    const x = GROUP_X(2);
    gMark.innerHTML = `<rect x="${x - 6}" y="26" width="56" height="${AX_Y - 26}" rx="8" fill="#F2B430" opacity=".14"/><text x="${x + 22}" y="40" text-anchor="middle" font-size="9.5" font-weight="900" fill="#B98A00">주목!</text>`;
  }

  /* ── 국면 1: 불공정 탐지 ── */
  function startPhase1(): void {
    inst.innerHTML = `4~6시간 구간: 1반 <b>5명</b> vs 2반 <b>4명</b>. 독서왕 반은 1반일까요?`;
    const row = el("div", { class: "mq6-choices" });
    [
      ["잠깐, 두 반의 전체 인원부터 확인해야죠", true],
      ["5명 > 4명이니 1반의 승리예요", false],
    ].forEach(([label, good]) => {
      const b = el("button", { class: "mq6-choice wide", text: label as string, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (good) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          eqs.appendChild(
            el("div", { class: "mq6-eq mq6-pop", html: `전체: 1반 <b>25명</b>, 2반 <b>10명</b>. 출발선이 다른 비교였어요!` }),
          );
          chips.on("unfair", "25 vs 10");
          later(startPhase2, 1700);
        } else {
          haptic(HAPTIC.cross);
          toast("숫자만 보면 함정! 1반은 원래 사람이 훨씬 많다면요?");
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
  }

  /* ── 국면 2: 상대도수 계산 + 토글 역전 ── */
  function startPhase2(): void {
    if (finished) return;
    clear(eqs);
    inst.innerHTML = `공정한 비교 = <b>전체에서 차지하는 비율</b>. 4~6시간 구간을 비율로 바꿔 봐요`;
    helper.innerHTML = "각 반의 도수를 그 반의 전체 인원으로 나눠요. 이 비율이 상대도수!";
    const row = el("div", { class: "mq6-choices" });
    const done = new Set<string>();
    [
      { k: "a", label: "1반: 5 ÷ 25", val: "0.2" },
      { k: "b", label: "2반: 4 ÷ 10", val: "0.4" },
    ].forEach(({ k, label, val }) => {
      const b = el("button", { class: "mq6-choice", text: label, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished || done.has(k)) return;
        done.add(k);
        haptic(HAPTIC.correct);
        b.classList.add("ok");
        b.textContent = `${label} = ${val}`;
        b.disabled = true;
        if (done.size >= 2) {
          eqs.appendChild(
            el("div", { class: "mq6-eq mq6-pop", html: `1반 <b>0.2</b> vs 2반 <b>0.4</b>... 어라, 뒤집혔는데요?` }),
          );
          later(showToggle, 1100);
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
  }

  function showToggle(): void {
    inst.innerHTML = `그래프의 세로축을 <b>각 반의 비율(도수÷전체 인원)</b>로 바꿔 두 반을 다시 비교해요`;
    const btn = el("button", { class: "mq6-btn mq6-pulse", text: "세로축을 비율로 바꾸기", attrs: { type: "button" } }) as HTMLButtonElement;
    clear(ctl);
    ctl.appendChild(btn);
    btn.addEventListener("click", () => {
      btn.disabled = true;
      haptic(HAPTIC.done);
      relMode = true;
      drawBars();
      later(() => {
        toast("4~6시간 구간, 초록(2반)이 역전!");
        eqs.appendChild(
          el("div", {
            class: "mq6-concl mq6-pop",
            html: `개수(도수)로는 1반, <b>비율로는 2반의 승</b>! 이 비율, (도수)÷(전체)에는 이름이 있어요: <b>상대도수</b>`,
          }),
        );
        chips.on("flip", "역전!");
        later(startPhase3, 1900);
      }, 800);
    });
  }

  /* ── 국면 3: 합 = 1 ── */
  function startPhase3(): void {
    if (finished) return;
    clear(eqs);
    clear(ctl);
    inst.innerHTML = `마지막 퀴즈: 한 반의 <b>상대도수를 전부 더하면</b>? 2반으로 검산해 봐요: 0.2 + 0.3 + 0.4 + 0.1 = ?`;
    helper.innerHTML = "분모가 무엇인지 떠올리면 답이 보여요!";
    const row = el("div", { class: "mq6-choices" });
    ["1", "0.5", "반마다 달라요"].forEach((label, i) => {
      const b = el("button", { class: "mq6-choice", text: label, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (i === 0) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html: `${mfmt("{2/10}")}+${mfmt("{3/10}")}+${mfmt("{4/10}")}+${mfmt("{1/10}")} = <b>1</b>. 전체 중의 전체니까, 어느 자료든 <b>항상 1</b>!`,
            }),
          );
          chips.on("sum", "항상 1");
          later(finish, 1600);
        } else {
          haptic(HAPTIC.cross);
          toast(i === 1 ? "0.2+0.3+0.4+0.1을 직접 더해 봐요!" : "분모가 전체이니 다 더하면 전체÷전체!");
        }
      });
      row.appendChild(b);
    });
    ctl.appendChild(row);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "상대도수 = 도수 ÷ 전체. <b>출발선이 다른 비교</b>를 공정하게 만드는 통계의 저울이에요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  drawBars();
  markTarget();
  startPhase1();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
