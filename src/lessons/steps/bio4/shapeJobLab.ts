// [중1 Ⅱ v3] L4 shapeJobLab — 「몸속 채용 공고」.
// 한 통찰: 세포의 모양은 하는 일에 꼭 맞게 다르다(신경=길게·적혈구=오목 원반·상피=납작 타일).
// 조작: 몸속 임무 3곳에 알맞은 세포를 골라 배치 — 정답이면 무대에서 그 모양이 일하는 연출.
// 채점: 세 임무 모두 첫 시도에 맞히면 recordQuiz(true)(스텝당 1회 집계 규약).
// rAF·캔버스 없음 — SVG + CSS 전환.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { cellTypeArt } from "../../../ui/bio4Figures";
import type { StepRenderer } from "../../types";

interface SjbStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type CellKind = "nerve" | "rbc" | "epi";

/** 임무 무대 3종 — .go 클래스가 붙으면 정답 연출이 재생된다. */
const STAGES: Record<string, string> = {
  signal: `
  <svg viewBox="0 0 320 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="160" cy="178" rx="120" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <circle cx="92" cy="38" r="17" fill="none" stroke="#333D4B" stroke-width="3.4"/>
    <path d="M92 55 v52 M92 74 l-26 18 M92 74 l26 18 M92 107 l-22 52 M92 107 l22 52"
      stroke="#333D4B" stroke-width="3.4" stroke-linecap="round" fill="none"/>
    <path d="M118 30 l-9 15 h7 l-7 14 l15 -18 h-7 l7 -11 Z" fill="#FFD43B" stroke="#E8A80C" stroke-width="1.8" stroke-linejoin="round"/>
    <path class="sjb-route" d="M96 52 C150 70 180 100 196 124 C208 142 216 152 228 158"
      stroke="#C9CDD2" stroke-width="3" stroke-dasharray="7 7" fill="none"/>
    <path class="sjb-wire" d="M96 52 C150 70 180 100 196 124 C208 142 216 152 228 158"
      stroke="#7048E8" stroke-width="5" stroke-linecap="round" fill="none" pathLength="100"/>
    <circle class="sjb-pulse" r="6" fill="#FFD43B" opacity="0">
      <animateMotion dur="1.1s" repeatCount="2" path="M96 52 C150 70 180 100 196 124 C208 142 216 152 228 158"/>
    </circle>
    <path d="M228 158 l22 6 M228 158 l18 14" stroke="#7048E8" stroke-width="4" stroke-linecap="round" class="sjb-wire-end"/>
    <text x="256" y="52" font-size="12.5" font-weight="800" fill="#6B7684">머리에서</text>
    <text x="256" y="68" font-size="12.5" font-weight="800" fill="#6B7684">발끝까지!</text>
  </svg>`,
  oxygen: `
  <svg viewBox="0 0 320 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="sjbVessel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFE3E3"/><stop offset="1" stop-color="#FFC9C9"/>
      </linearGradient>
    </defs>
    <path d="M12 58 C80 52 120 66 160 84 C200 102 250 106 308 100 L308 148 C250 154 200 150 160 132 C120 114 80 128 12 134 Z"
      fill="url(#sjbVessel)" stroke="#E03131" stroke-width="3.4"/>
    <path d="M26 70 C70 66 104 74 132 86" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
    <g class="sjb-o2" opacity="0.85">
      <circle cx="236" cy="118" r="5" fill="#74C0FC"/><circle cx="258" cy="128" r="4.4" fill="#74C0FC"/>
      <circle cx="280" cy="118" r="4.8" fill="#74C0FC"/>
    </g>
    <g class="sjb-rbcs">
      <g class="sjb-rbc r1"><ellipse rx="15" ry="11.5" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4"/><ellipse rx="7" ry="4.6" fill="#F03E3E" opacity="0.45"/></g>
      <g class="sjb-rbc r2"><ellipse rx="13" ry="10" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4"/><ellipse rx="6" ry="4" fill="#F03E3E" opacity="0.45"/></g>
      <g class="sjb-rbc r3"><ellipse rx="14" ry="10.6" fill="#FFA8A8" stroke="#E03131" stroke-width="2.4"/><ellipse rx="6.6" ry="4.2" fill="#F03E3E" opacity="0.45"/></g>
    </g>
    <text x="18" y="34" font-size="12.5" font-weight="800" fill="#6B7684">좁아지는 혈관 속을 지나</text>
    <text x="18" y="50" font-size="12.5" font-weight="800" fill="#6B7684">산소를 배달하라!</text>
  </svg>`,
  shield: `
  <svg viewBox="0 0 320 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="sjbFlesh" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFC9D8"/><stop offset="1" stop-color="#FFA8C0"/>
      </linearGradient>
    </defs>
    <rect x="24" y="96" width="272" height="66" rx="10" fill="url(#sjbFlesh)" stroke="#E64980" stroke-width="3"/>
    <path d="M40 112 C90 106 150 106 200 110" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" opacity="0.5"/>
    <path d="M64 40 l7 16 M84 34 l0 18 M104 40 l-7 16" stroke="#FAB005" stroke-width="3.6" stroke-linecap="round" class="sjb-danger"/>
    <text x="126" y="46" font-size="12.5" font-weight="800" fill="#6B7684">맨살이 위험해!</text>
    <text x="126" y="62" font-size="12.5" font-weight="800" fill="#6B7684">표면을 빈틈없이 덮어라</text>
    <g class="sjb-tiles">
      <path class="sjb-tile t1" d="M24 96 L92 90 L100 108 L32 114 Z" fill="#A5D8FF" stroke="#1971C2" stroke-width="2.6" stroke-linejoin="round"/>
      <path class="sjb-tile t2" d="M92 90 L162 86 L170 104 L100 108 Z" fill="#D0EBFF" stroke="#1971C2" stroke-width="2.6" stroke-linejoin="round"/>
      <path class="sjb-tile t3" d="M162 86 L230 88 L236 106 L170 104 Z" fill="#A5D8FF" stroke="#1971C2" stroke-width="2.6" stroke-linejoin="round"/>
      <path class="sjb-tile t4" d="M230 88 L296 94 L300 112 L236 106 Z" fill="#D0EBFF" stroke="#1971C2" stroke-width="2.6" stroke-linejoin="round"/>
    </g>
  </svg>`,
};

interface Mission {
  id: string;
  ans: CellKind;
  chip: string;
  q: string;
  good: string;
  bad: Record<CellKind, string>;
}

const MISSIONS: Mission[] = [
  {
    id: "signal",
    ans: "nerve",
    chip: "신호 배달",
    q: "임무 ①, 머리부터 발끝까지, <b>신호를 번개처럼 전달</b>할 세포를 뽑아 주세요!",
    good: "채용! <b>전선처럼 가늘고 긴 몸</b>이 먼 곳까지 한 번에 이어져요. 신호가 슝 달려가죠. 이게 <b>신경세포</b>예요.",
    bad: {
      nerve: "",
      rbc: "둥근 원반을 줄줄이 이어 릴레이하면 너무 느려요. <b>한 몸으로 길게 이어지는</b> 세포가 제격이죠. 다시 골라 봐요!",
      epi: "납작한 타일은 덮는 데는 최고지만 멀리 뻗지 못해요. <b>가늘고 길게 뻗는</b> 세포를 찾아봐요!",
    },
  },
  {
    id: "oxygen",
    ans: "rbc",
    chip: "산소 배달",
    q: "임무 ②, <b>좁아지는 혈관</b>을 통과해 온몸에 <b>산소를 배달</b>할 세포는?",
    good: "채용! <b>가운데가 오목한 작고 둥근 원반</b>이라 좁은 틈도 부드럽게 통과하고, 표면이 넓어 산소를 듬뿍 실어요. <b>적혈구</b>죠.",
    bad: {
      nerve: "길쭉한 몸은 좁은 혈관 모퉁이에 걸려요. <b>작고 둥근</b> 배달원이 필요해요. 다시!",
      rbc: "",
      epi: "타일은 바닥에 붙어 있는 게 일이에요. 혈관 속을 <b>굴러다닐 수 있는</b> 세포를 골라 봐요!",
    },
  },
  {
    id: "shield",
    ans: "epi",
    chip: "표면 방어",
    q: "임무 ③, 몸 표면을 <b>빈틈없이 덮어 보호</b>할 세포를 뽑아 주세요!",
    good: "채용! <b>납작하고 편평한 모양</b>이라 타일처럼 빈틈없이 깔려요. 피부와 기관 표면을 덮는 <b>상피세포</b>예요.",
    bad: {
      nerve: "가는 선으로는 표면에 구멍이 숭숭, <b>넓적하게 깔리는</b> 세포가 필요해요!",
      rbc: "둥근 원반 사이엔 틈이 생겨요. <b>납작하게 포개지는</b> 세포를 찾아봐요!",
      epi: "",
    },
  },
];

const CELL_NAME: Record<CellKind, string> = { nerve: "신경세포", rbc: "적혈구", epi: "상피세포" };

export const shapeJobLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SjbStep;
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
    ...MISSIONS.map((m) =>
      el("div", { class: "pn-badge b4", dataset: { g: m.id } }, el("b", { text: m.chip }), el("span", { text: "대기 중" })),
    ),
  );
  const helper = el("div", { class: "helper", html: MISSIONS[0].q });

  const stage = el("div", { class: "b4-board sjb-stage" });
  stage.innerHTML = STAGES[MISSIONS[0].id];

  const cardRow = el("div", { class: "sjb-cards" });
  (Object.keys(CELL_NAME) as CellKind[]).forEach((k) => {
    const b = el(
      "button",
      { class: "sjb-card", attrs: { type: "button" }, dataset: { k } },
      el("span", { class: "sjb-card-art", html: cellTypeArt(k) }),
      el("b", { text: CELL_NAME[k] }),
    ) as HTMLButtonElement;
    b.addEventListener("click", () => pick(k, b));
    cardRow.appendChild(b);
  });

  host.append(goalChips, helper, stage, cardRow);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let mi = 0;
  let busy = false;
  let firstTryAll = true;
  let finished = false;

  function pick(k: CellKind, card: HTMLButtonElement): void {
    if (busy || finished) return;
    const m = MISSIONS[mi];
    if (k === m.ans) {
      busy = true;
      haptic(HAPTIC.correct);
      card.classList.add("used");
      card.disabled = true;
      stage.classList.add("go");
      helper.innerHTML = m.good;
      const chip = goalChips.querySelector(`[data-g="${m.id}"]`) as HTMLElement;
      chip.classList.add("on");
      chip.querySelector("span")!.textContent = `${CELL_NAME[m.ans]}!`;
      later(() => {
        mi += 1;
        busy = false;
        if (mi >= MISSIONS.length) {
          finished = true;
          api.recordQuiz(firstTryAll);
          helper.innerHTML =
            "채용 완료! 셋 다 <b>모양이 곧 이력서</b>였어요. 가늘고 길면 전달, 오목한 원반이면 운반, 납작하면 보호. <b>모양이 하는 일을 말해 준다</b>, 이게 오늘의 발견!";
          api.enableCTA(s.cta ?? "정리하기");
        } else {
          stage.classList.remove("go");
          stage.innerHTML = STAGES[MISSIONS[mi].id];
          helper.innerHTML = MISSIONS[mi].q;
        }
      }, 2100);
    } else {
      firstTryAll = false;
      haptic(HAPTIC.wrong);
      stage.classList.add("shake");
      card.classList.add("nope");
      helper.innerHTML = m.bad[k];
      later(() => {
        stage.classList.remove("shake");
        card.classList.remove("nope");
      }, 700);
    }
  }

  api.setCTA("세 임무에 알맞은 세포를!", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
