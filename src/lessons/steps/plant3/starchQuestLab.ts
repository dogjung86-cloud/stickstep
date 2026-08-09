// [중2 Ⅴ v3] L2 starchQuestLab — 「녹말 수사대」(교과서 탐구 2).
// 한 통찰: 빛을 받은 잎에만 녹말이 생긴다(아이오딘-아이오딘화 칼륨 → 청람색).
// 절차가 곧 과학 가드: 암처리 먼저(원래 있던 녹말 소모) → 에탄올 물중탕 탈색(엽록소 빼기 —
// 색 변화를 잘 보이게) → 아이오딘 검출. 아이오딘은 포도당이 아니라 "녹말" 확인이다.
// 조작: 절차 버튼 3개 + 판정 2회(이유·예측). rAF·캔버스 없음(장면 전환은 CSS 상태 클래스).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import type { StepRenderer } from "../../types";

interface StqStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 무대 — 세 장면을 한 SVG에 겹치고 data-sc로 전환한다. (가) 햇빛 잎 · (나) 어둠상자 잎. */
function stageScene(): string {
  return `<svg viewBox="0 0 340 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="stqLeafG" cx="0.4" cy="0.32" r="1">
        <stop offset="0" stop-color="#A9E8B8"/><stop offset="0.6" stop-color="#69C77E"/><stop offset="1" stop-color="#40A85C"/>
      </radialGradient>
      <linearGradient id="stqWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#D2ECF8"/><stop offset="1" stop-color="#A8D4EE"/>
      </linearGradient>
    </defs>
    <!-- 장면 0: 창가의 두 모종 -->
    <g class="stq-sc stq-sc0">
      <circle cx="292" cy="34" r="16" fill="#FFC940"/>
      <path d="M292 12 v6 M292 50 v6 M270 34 h6 M308 34 h6 M276 18 l4 4 M304 46 l4 4 M308 18 l-4 4 M280 46 l-4 4" stroke="#FFC940" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="14" y="168" width="312" height="12" rx="5" fill="#D9B678" stroke="#A9854A" stroke-width="2.4"/>
      <g>
        <path d="M92 128 C82 108 88 88 106 78 C114 92 112 112 104 126" fill="url(#stqLeafG)" stroke="#2E7D46" stroke-width="2.4"/>
        <path d="M120 126 C124 104 138 92 154 92 C154 108 144 122 130 130" fill="url(#stqLeafG)" stroke="#2E7D46" stroke-width="2.4"/>
        <path d="M108 132 l0 -18" stroke="#2E7D46" stroke-width="3" stroke-linecap="round"/>
        <path d="M84 132 h56 l-7 36 h-42 Z" fill="#C9885A" stroke="#8A5A30" stroke-width="2.6"/>
        <text x="112" y="156" text-anchor="middle" font-size="14" font-weight="800" fill="#FFF3DE">(가)</text>
      </g>
      <g>
        <path d="M212 128 C202 108 208 88 226 78 C234 92 232 112 224 126" fill="url(#stqLeafG)" stroke="#2E7D46" stroke-width="2.4"/>
        <path d="M240 126 C244 104 258 92 274 92 C274 108 264 122 250 130" fill="url(#stqLeafG)" stroke="#2E7D46" stroke-width="2.4"/>
        <path d="M228 132 l0 -18" stroke="#2E7D46" stroke-width="3" stroke-linecap="round"/>
        <path d="M204 132 h56 l-7 36 h-42 Z" fill="#C9885A" stroke="#8A5A30" stroke-width="2.6"/>
        <text x="232" y="156" text-anchor="middle" font-size="14" font-weight="800" fill="#FFF3DE">(나)</text>
      </g>
      <g class="stq-box">
        <path d="M190 64 h84 v70 h-84 Z" fill="#4E5968" stroke="#333D4B" stroke-width="3"/>
        <path d="M190 64 l10 -12 h84 l-10 12 Z" fill="#5C6B7A" stroke="#333D4B" stroke-width="2.4"/>
        <path d="M198 84 h68 M198 102 h68" stroke="#3C4654" stroke-width="2" opacity="0.7"/>
      </g>
    </g>
    <!-- 장면 1: 에탄올 물중탕 탈색 -->
    <g class="stq-sc stq-sc1">
      <ellipse cx="170" cy="196" rx="120" ry="8" fill="#2A3A5E" opacity="0.10"/>
      <path d="M92 78 h156 v96 a12 12 0 0 1 -12 12 h-132 a12 12 0 0 1 -12 -12 Z" fill="url(#stqWater)" stroke="#7FA8C4" stroke-width="3"/>
      <path d="M84 78 h172" stroke="#7FA8C4" stroke-width="3.4" stroke-linecap="round"/>
      <path class="stq-steam" d="M120 62 q6 -10 0 -18 M170 58 q6 -10 0 -18 M222 62 q6 -10 0 -18" stroke="#B9C2CC" stroke-width="3" stroke-linecap="round" fill="none"/>
      <g>
        <rect x="124" y="44" width="30" height="118" rx="13" fill="#F2FBF6" stroke="#8FB8A8" stroke-width="2.8"/>
        <rect class="stq-ethanolA" x="128" y="92" width="22" height="64" rx="9" fill="#EDF7EF"/>
        <path class="stq-leafA" d="M132 118 q7 -12 14 0 q-7 12 -14 0 Z" fill="#2F9E44" stroke="#1E5A2A" stroke-width="2"/>
        <text x="139" y="36" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
      </g>
      <g>
        <rect x="186" y="44" width="30" height="118" rx="13" fill="#F2FBF6" stroke="#8FB8A8" stroke-width="2.8"/>
        <rect class="stq-ethanolB" x="190" y="92" width="22" height="64" rx="9" fill="#EDF7EF"/>
        <path class="stq-leafB" d="M194 118 q7 -12 14 0 q-7 12 -14 0 Z" fill="#2F9E44" stroke="#1E5A2A" stroke-width="2"/>
        <text x="201" y="36" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
      </g>
      <path d="M100 96 C110 86 124 82 136 82" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" opacity="0.6"/>
    </g>
    <!-- 장면 2: 아이오딘 검출 -->
    <g class="stq-sc stq-sc2">
      <ellipse cx="170" cy="196" rx="130" ry="8" fill="#2A3A5E" opacity="0.10"/>
      <g>
        <circle cx="104" cy="118" r="52" fill="#FDFCF4" stroke="#C9CDD2" stroke-width="3"/>
        <circle cx="104" cy="118" r="44" fill="none" stroke="#E3E6EA" stroke-width="2"/>
        <path d="M84 118 q20 -30 40 0 q-20 30 -40 0 Z" fill="#EDE9D2" stroke="#B8B294" stroke-width="2.2"/>
        <g class="stq-stain">
          <ellipse cx="104" cy="116" rx="15" ry="10" fill="#364FC7" opacity="0.92"/>
          <ellipse cx="114" cy="122" rx="6" ry="4" fill="#3B5BDB" opacity="0.8"/>
        </g>
        <text x="104" y="188" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가) 햇빛을 받은 잎</text>
      </g>
      <g>
        <circle cx="236" cy="118" r="52" fill="#FDFCF4" stroke="#C9CDD2" stroke-width="3"/>
        <circle cx="236" cy="118" r="44" fill="none" stroke="#E3E6EA" stroke-width="2"/>
        <path d="M216 118 q20 -30 40 0 q-20 30 -40 0 Z" fill="#EDE9D2" stroke="#B8B294" stroke-width="2.2"/>
        <g class="stq-tint">
          <ellipse cx="236" cy="116" rx="14" ry="9" fill="#C9A227" opacity="0.35"/>
        </g>
        <text x="236" y="188" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나) 어둠상자 잎</text>
      </g>
      <g class="stq-dropper">
        <rect x="162" y="14" width="16" height="34" rx="7" fill="#F8F0EA" stroke="#C77B4A" stroke-width="2.6"/>
        <path d="M167 48 h6 l-3 12 Z" fill="#E8590C"/>
        <circle class="stq-droplet" cx="170" cy="68" r="4" fill="#E8590C"/>
      </g>
    </g>
  </svg>`;
}

export const starchQuestLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as StqStep;
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
    el("div", { class: "pn-badge p3", dataset: { g: "dark" } }, el("b", { text: "암처리" }), el("span", { text: "하루 동안" })),
    el("div", { class: "pn-badge p3", dataset: { g: "bleach" } }, el("b", { text: "탈색" }), el("span", { text: "물중탕으로" })),
    el("div", { class: "pn-badge p3", dataset: { g: "detect" } }, el("b", { text: "녹말 검출" }), el("span", { text: "예측하고 확인" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "훅에서 얻은 <b>녹말 탐지기(아이오딘)</b>를 잎에 써 볼 차례예요. 상추 모종 두 개를 준비했어요 — 아래 <b>절차 버튼</b>을 순서대로 눌러 실험을 진행하세요.",
  });

  const board = el("div", { class: "p3-board stq-board", html: stageScene() });
  board.dataset.sc = "0";

  const tools = el("div", { class: "stq-tools" });
  const toolDefs = [
    { id: "dark", b: "어둠상자 씌우기", sub: "(나)만 · 하루" },
    { id: "bleach", b: "에탄올 물중탕", sub: "잎 탈색하기" },
    { id: "detect", b: "아이오딘 검사", sub: "색 변화 관찰" },
  ];
  const toolBtns = toolDefs.map((d, i) => {
    const b = el(
      "button",
      { class: "stq-tool", attrs: { type: "button" } },
      el("b", { text: d.b }),
      el("span", { text: d.sub }),
    ) as HTMLButtonElement;
    b.disabled = i !== 0;
    tools.appendChild(b);
    return b;
  });

  const qBox = el("div", { class: "hook-choices stq-q" });
  qBox.style.display = "none";

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
        "수사 종결! <b>빛을 받은 (가) 잎에만 녹말</b>이 생겼어요 — 광합성의 증거 2호예요. 아이오딘이 확인한 건 포도당이 아니라, 포도당이 바뀌어 저장된 <b>녹말</b>이라는 것도 꼭 기억해요.";
      api.enableCTA(s.cta ?? "증거 정리하기");
    }
  }

  // ── 절차 1: 암처리 ──
  toolBtns[0].addEventListener("click", () => {
    haptic(HAPTIC.tap);
    toolBtns[0].disabled = true;
    toolBtns[0].classList.add("done");
    board.classList.add("boxed");
    helper.innerHTML = "(나) 모종에만 어둠상자를 씌우고, 햇빛 좋은 곳에서 <b>하루</b>를 보냈어요. 그런데 — 왜 바로 검사하지 않고 하루나 기다렸을까요?";
    later(() => {
      b4Ask(
        qBox,
        "어둠상자를 씌우고 <b>하루를 기다린</b> 까닭은 뭘까요?",
        [
          { t: "(나) 잎에 원래 있던 녹말을 다 쓰게 하려고", ok: true },
          { t: "잎을 더 크게 자라게 하려고", ok: false },
          { t: "어둠 속에서 녹말이 더 잘 만들어져서", ok: false },
        ],
        (ok) => {
          helper.innerHTML = ok
            ? "정확해요! 잎에는 어제 만든 녹말이 남아 있을 수 있어요. 어둠 속에서 하루를 보내면 (나) 잎은 남은 녹말을 다 써 버려서, <b>'새로 만든 녹말'만 비교</b>할 수 있는 깨끗한 조건이 되죠."
            : "어둠 속에서는 녹말을 만들지 못해요 — 오히려 그 반대예요. 하루를 기다리면 (나) 잎에 <b>원래 있던 녹말이 다 소모</b>돼서, 새로 만든 녹말만 깨끗하게 비교할 수 있게 된답니다.";
          collect("dark", "묵은 녹말 비우기!");
          toolBtns[1].disabled = false;
        },
      );
    }, 800);
  });

  // ── 절차 2: 에탄올 물중탕 탈색 ──
  toolBtns[1].addEventListener("click", () => {
    haptic(HAPTIC.tap);
    toolBtns[1].disabled = true;
    toolBtns[1].classList.add("done");
    board.dataset.sc = "1";
    helper.innerHTML = "두 모종에서 잎을 하나씩 따서 에탄올 시험관에 넣고, <b>뜨거운 물(80~100 ℃)</b>에 담가 데워요. 에탄올은 불로 직접 가열하면 위험하거든요.";
    later(() => {
      board.classList.add("bathed");
      helper.innerHTML =
        "잎이 하얗게 변했어요! 뜨거운 에탄올이 잎 속 <b>엽록소를 녹여 빼낸</b> 거예요. 초록색을 빼 두면 아이오딘의 <b>색 변화가 또렷하게 보이거든요</b>.";
      later(() => {
        collect("bleach", "엽록소 빼내기!");
        toolBtns[2].disabled = false;
      }, 1100);
    }, 1000);
  });

  // ── 절차 3: 아이오딘 검출(예측 → 확인) ──
  toolBtns[2].addEventListener("click", () => {
    haptic(HAPTIC.tap);
    toolBtns[2].disabled = true;
    board.dataset.sc = "2";
    helper.innerHTML = "탈색한 두 잎을 증류수로 헹궈 페트리 접시에 놓았어요. 이제 <b>아이오딘-아이오딘화 칼륨 용액</b>을 떨어뜨리면 — 어느 잎이 청람색으로 변할까요?";
    later(() => {
      b4Ask(
        qBox,
        "아이오딘 용액을 떨어뜨리면, 청람색으로 변하는 잎은?",
        [
          { t: "(가) 햇빛을 받은 잎만", ok: true },
          { t: "(나) 어둠상자 잎만", ok: false },
          { t: "두 잎 모두", ok: false },
        ],
        (ok) => {
          api.recordQuiz(ok);
          toolBtns[2].classList.add("done");
          later(() => {
            board.classList.add("dropped");
            helper.innerHTML = ok
              ? "예측 적중! <b>(가) 잎만 청람색</b> — 빛을 받은 잎에서만 광합성이 일어나 <b>녹말</b>이 생긴 거예요. (나) 잎은 빛이 없어 녹말을 만들지 못했죠."
              : "결과를 봐요 — <b>(가) 잎만 청람색</b>이에요! 빛을 받은 잎에서만 광합성이 일어나 <b>녹말</b>이 생겼고, 어둠상자 속 (나) 잎은 만들지 못했답니다.";
            later(() => collect("detect", "(가)만 청람색!"), 900);
          }, 600);
        },
      );
    }, 900);
  });

  host.append(goalChips, helper, board, tools, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("절차 버튼을 순서대로 눌러 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
