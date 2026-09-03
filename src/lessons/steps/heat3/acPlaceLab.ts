// [중1 Ⅲ v3] L3 acPlaceLab — 「냉난방기 설치하기」(교과서 해 보기: 냉난방기는 어디에 설치할까).
// 한 통찰: 대류는 물질을 구성하는 입자들이 직접 이동하며 열을 나르는 방식. 뜨거워진 공기는 위로,
// 차가워진 공기는 아래로 움직여 방 전체를 순환한다(난방기는 아래, 냉방기는 위).
// 조작: 설치 위치 버튼 2개(예측이 곧 조작, 슬롯 안). 공기 입자는 SMIL animateMotion(rAF 없음)으로 순환한다.
// 한 화면 예산: 무대 340×180(방·사람·설치 자리·공기 입자만 — 창문·안내 글자 제거), 판정은 버튼 자리에 교체.
// 목표 3: 난방기 순환 → 냉방기 순환 → 대류 원리 판정.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { H3 } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3Goals, h3Helper, h3Slot, h3Timers } from "./h3Lab";

interface AplStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Phase = "heater" | "ac" | "done";
type Slot = "top" | "bottom";

/** 방 안 순환 경로 — 난방기(바닥·왼쪽)에서 위로 → 천장 따라 오른쪽 → 아래 → 바닥 따라 왼쪽. */
const LOOP_UP = "M62 138 C60 100 64 62 96 40 C150 24 250 24 292 46 C304 82 300 120 268 138 C210 162 120 162 62 138 Z";
/** 냉방기(천장·왼쪽)에서 아래로 → 바닥 따라 오른쪽 → 위 → 천장 따라 왼쪽. */
const LOOP_DOWN = "M62 46 C60 82 64 118 96 142 C150 158 250 158 292 136 C304 100 300 64 268 46 C210 22 120 22 62 46 Z";
const SLOT_Y: Record<Slot, number> = { top: 18, bottom: 128 };

function device(kind: "heater" | "ac", slot: Slot): string {
  const y = SLOT_Y[slot];
  if (kind === "heater") {
    return `<g class="apl-dev">
      <rect x="36" y="${y}" width="52" height="34" rx="6" fill="#4E5968"/>
      <rect x="42" y="${y + 6}" width="40" height="22" rx="4" fill="${H3.hot}"/>
      <path d="M50 ${y + 10} v14 M62 ${y + 8} v18 M74 ${y + 10} v14" stroke="#FFE066" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>
    </g>`;
  }
  return `<g class="apl-dev">
    <rect x="36" y="${y}" width="52" height="34" rx="6" fill="#E9EDF2" stroke="#8B95A1" stroke-width="2"/>
    <path d="M42 ${y + 10} h40 M42 ${y + 17} h40 M42 ${y + 24} h40" stroke="#8B95A1" stroke-width="2" stroke-linecap="round"/>
    <circle cx="80" cy="${y + 6}" r="2.5" fill="${H3.cold}"/>
  </g>`;
}

/** 순환 입자 8개 — path를 따라 돌며 색이 뜨거움→차가움→뜨거움으로 바뀐다. */
function loopParticles(path: string, warmFirst: boolean): string {
  const a = warmFirst ? H3.hot : H3.cold;
  const b = warmFirst ? H3.cold : H3.hot;
  return Array.from({ length: 8 }, (_, i) => {
    const begin = -(i * 0.7).toFixed(2);
    return `<circle r="6" fill="${a}" stroke="#FFFFFF" stroke-width="1.4">
      <animateMotion dur="5.6s" repeatCount="indefinite" begin="${begin}s" path="${path}"/>
      <animate attributeName="fill" values="${a};${a};${b};${b};${a}" keyTimes="0;0.25;0.5;0.8;1" dur="5.6s" repeatCount="indefinite" begin="${begin}s"/>
    </circle>`;
  }).join("");
}

/** 순환 실패 — 뜨거운 공기는 위층에, 차가운 공기는 아래층에 갇혀 제자리 흔들림만. */
function stuckParticles(): string {
  const warm = Array.from({ length: 6 }, (_, i) => `<circle cx="${110 + i * 34}" cy="40" r="6" fill="${H3.hot}" stroke="#FFFFFF" stroke-width="1.4"><animate attributeName="cy" values="40;34;42;40" dur="${1.4 + i * 0.1}s" repeatCount="indefinite"/></circle>`).join("");
  const cold = Array.from({ length: 6 }, (_, i) => `<circle cx="${110 + i * 34}" cy="142" r="6" fill="${H3.cold}" stroke="#FFFFFF" stroke-width="1.4"><animate attributeName="cy" values="142;145;139;142" dur="${1.8 + i * 0.1}s" repeatCount="indefinite"/></circle>`).join("");
  return warm + cold;
}

export const acPlaceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as AplStep;
  const tm = h3Timers();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = h3Goals(
    [
      { id: "heater", name: "난방기", sub: "어디에 설치?" },
      { id: "ac", name: "냉방기", sub: "난방기 다음" },
      { id: "why", name: "대류 원리", sub: "둘 다 맞춘 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! <b>대류</b>는 입자가 <b>직접 움직여</b> 열을 실어 나르는 방식이에요. 난방기는 아래, 냉방기는 위.";
      api.enableCTA(s.cta ?? "열의 이동 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = h3Helper("<b>난방기</b>를 천장과 바닥 중 어디에 달아야 방 전체가 골고루 따뜻할까요? 골라 보세요.");

  const stage = el("div", { class: "apl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="300" height="160" rx="10" fill="#F8F9FA" stroke="#8B95A1" stroke-width="3"/>
    <rect x="20" y="10" width="300" height="8" rx="3" fill="#C9D3DE"/>
    <rect x="20" y="162" width="300" height="8" rx="3" fill="#C9D3DE"/>
    <g class="apl-person">
      <circle cx="190" cy="104" r="9" fill="#FFFFFF" stroke="${H3.ink}" stroke-width="2.4"/>
      <path d="M190 113 v22 M190 120 l-10 8 M190 120 l10 8 M190 135 l-7 20 M190 135 l7 20" stroke="${H3.ink}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    </g>
    <g class="apl-slot apl-slot-top"><rect x="36" y="${SLOT_Y.top}" width="52" height="34" rx="6" fill="none" stroke="#9DB2C4" stroke-width="2" stroke-dasharray="5 4"/><text x="62" y="${SLOT_Y.top + 22}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8B95A1">천장</text></g>
    <g class="apl-slot apl-slot-bottom"><rect x="36" y="${SLOT_Y.bottom}" width="52" height="34" rx="6" fill="none" stroke="#9DB2C4" stroke-width="2" stroke-dasharray="5 4"/><text x="62" y="${SLOT_Y.bottom + 22}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8B95A1">바닥</text></g>
    <g class="apl-devlayer"></g>
    <g class="apl-air"></g>
  </svg>`;
  const board = el("div", { class: "ht3-board apl-board" }, stage);

  const bTop = el("button", { class: "ht3-seg apl-choice", text: "천장에 설치", attrs: { type: "button" } }) as HTMLButtonElement;
  const bBottom = el("button", { class: "ht3-seg apl-choice", text: "바닥에 설치", attrs: { type: "button" } }) as HTMLButtonElement;
  const segRow = el("div", { class: "ht3-segrow apl-segrow" }, bTop, bBottom);
  const slot = h3Slot(tm, "apl-q", segRow);

  const devLayer = stage.querySelector(".apl-devlayer") as SVGGElement;
  const air = stage.querySelector(".apl-air") as SVGGElement;
  const slots = stage.querySelector(".apl-slot-top") as SVGGElement;
  const slotsB = stage.querySelector(".apl-slot-bottom") as SVGGElement;

  let phase: Phase = "heater";
  let busy = false;

  function setButtons(on: boolean): void {
    bTop.disabled = !on;
    bBottom.disabled = !on;
  }

  function place(where: Slot): void {
    if (busy || phase === "done") return;
    busy = true;
    haptic(HAPTIC.tap);
    setButtons(false);
    const kind = phase;
    devLayer.innerHTML = device(kind, where);
    slots.style.opacity = where === "top" ? "0" : "1";
    slotsB.style.opacity = where === "bottom" ? "0" : "1";
    const correct = (kind === "heater" && where === "bottom") || (kind === "ac" && where === "top");
    if (correct) {
      air.innerHTML = loopParticles(kind === "heater" ? LOOP_UP : LOOP_DOWN, kind === "heater");
      board.classList.remove("stuck");
      board.classList.add("flowing");
      haptic(HAPTIC.correct);
      if (kind === "heater") {
        helper.innerHTML = "정답! 데워진 공기는 <b>가벼워져 위로</b>, 찬 공기는 <b>아래로</b> 돌아요. 이번엔 <b>냉방기</b>는 어디에?";
        goals.collect("heater", "바닥이 정답!");
        tm.later(() => {
          phase = "ac";
          devLayer.innerHTML = "";
          air.innerHTML = "";
          slots.style.opacity = "1";
          slotsB.style.opacity = "1";
          board.classList.remove("flowing");
          busy = false;
          setButtons(true);
        }, 3200);
      } else {
        helper.innerHTML = "정답! 차가워진 공기는 <b>무거워져 아래로</b>, 따뜻한 공기는 <b>위로</b> 돌아요. 이 방식의 정체는?";
        goals.collect("ac", "천장이 정답!");
        tm.later(() => {
          phase = "done";
          busy = false;
          askWhy();
        }, 2600);
      }
    } else {
      air.innerHTML = stuckParticles();
      board.classList.remove("flowing");
      board.classList.add("stuck");
      haptic(HAPTIC.wrong);
      helper.innerHTML = kind === "heater"
        ? "음, 천장에서 데운 공기는 <b>위에 그대로 머물러요</b>. 발은 시리죠. 다시 골라 볼까요?"
        : "음, 바닥에서 식힌 공기는 <b>바닥에 그대로 깔려요</b>. 머리는 덥죠. 다시 골라 볼까요?";
      tm.later(() => {
        busy = false;
        setButtons(true);
      }, 2200);
    }
  }

  function askWhy(): void {
    slot.ask(
      "두 실험에서 열을 방 전체로 나른 것은?",
      [
        { t: "뜨거워지거나 차가워진 공기 입자가 직접 이동했다", ok: true },
        { t: "공기 입자는 제자리에서 흔들림만 전달했다", ok: false },
        { t: "공기와 관계없이 열이 직접 갔다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 입자가 <b>직접 움직여</b> 열을 실어 나르는 것이 <b>대류</b>예요. 액체와 기체에서 일어나요."
          : "공기 입자들이 방 안을 <b>직접 돌았죠</b>. 입자가 움직여 열을 실어 나른 거예요. 이게 <b>대류</b>예요.";
        goals.collect("why", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  bTop.addEventListener("click", () => place("top"));
  bBottom.addEventListener("click", () => place("bottom"));

  host.append(goals.chips, helper, board, slot.el);

  api.setCTA("난방기 위치를 골라 보세요", { enabled: false });
  return () => tm.clear();
};
