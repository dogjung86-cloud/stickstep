// [중1 Ⅲ v3] L3 acPlaceLab — 「냉난방기 설치 랩, 대류의 방향」(교과서 해 보기: 냉난방기는 어디에 설치할까).
// 한 통찰: 대류는 물질을 구성하는 입자들이 직접 이동하며 열을 나르는 방식. 뜨거워진 공기는 위로,
// 차가워진 공기는 아래로 움직여 방 전체를 순환한다(난방기는 아래, 냉방기는 위).
// 조작: 설치 위치 버튼 2개(예측이 곧 조작). 공기 입자는 SMIL animateMotion(rAF 없음)으로 순환한다.
// 목표 3: 난방기 순환 → 냉방기 순환 → 대류 원리 판정.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { H3 } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3AskBox, h3Goals, h3Helper, h3Timers } from "./h3Lab";

interface AplStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Phase = "heater" | "ac" | "done";
type Slot = "top" | "bottom";

/** 방 안 순환 경로 — 난방기(바닥·왼쪽)에서 위로 → 천장 따라 오른쪽 → 아래 → 바닥 따라 왼쪽. */
const LOOP_UP = "M62 150 C60 110 64 70 96 44 C150 26 250 26 292 52 C304 90 300 130 268 150 C210 176 120 176 62 150 Z";
/** 냉방기(천장·왼쪽)에서 아래로 → 바닥 따라 오른쪽 → 위 → 천장 따라 왼쪽. */
const LOOP_DOWN = "M62 50 C60 90 64 130 96 156 C150 174 250 174 292 148 C304 110 300 70 268 50 C210 24 120 24 62 50 Z";

function device(kind: "heater" | "ac", slot: Slot): string {
  const y = slot === "top" ? 24 : 142;
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
  const warm = Array.from({ length: 6 }, (_, i) => `<circle cx="${110 + i * 34}" cy="44" r="6" fill="${H3.hot}" stroke="#FFFFFF" stroke-width="1.4"><animate attributeName="cy" values="44;38;46;44" dur="${1.4 + i * 0.1}s" repeatCount="indefinite"/></circle>`).join("");
  const cold = Array.from({ length: 6 }, (_, i) => `<circle cx="${110 + i * 34}" cy="156" r="6" fill="${H3.cold}" stroke="#FFFFFF" stroke-width="1.4"><animate attributeName="cy" values="156;159;153;156" dur="${1.8 + i * 0.1}s" repeatCount="indefinite"/></circle>`).join("");
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
      helper.innerHTML =
        "정리! <b>대류</b>는 물질을 구성하는 <b>입자들이 직접 이동</b>하면서 열을 전달하는 방식이에요(액체·기체). 뜨거워진 공기는 위로, 차가워진 공기는 아래로 움직여 방 전체가 골고루 따뜻하거나 시원해지죠. 그래서 <b>난방기는 아래, 냉방기는 위</b>랍니다.";
      api.enableCTA(s.cta ?? "열의 이동 정리하기");
    },
  );
  const helper = h3Helper("새로 이사한 방이에요. <b>난방기</b>를 천장과 바닥 중 <b>어디에 설치</b>해야 방 전체가 골고루 따뜻해질까요? 예측해서 버튼을 누르면 공기 입자의 움직임이 보여요.");

  const stage = el("div", { class: "apl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="16" width="300" height="168" rx="10" fill="#F8F9FA" stroke="#8B95A1" stroke-width="3"/>
    <rect x="20" y="16" width="300" height="8" rx="3" fill="#C9D3DE"/>
    <rect x="20" y="176" width="300" height="8" rx="3" fill="#C9D3DE"/>
    <rect x="236" y="48" width="56" height="44" rx="6" fill="#DCEBFA" stroke="#9DB2C4" stroke-width="2"/>
    <line x1="264" y1="48" x2="264" y2="92" stroke="#9DB2C4" stroke-width="2"/>
    <g class="apl-person">
      <circle cx="184" cy="120" r="9" fill="#FFFFFF" stroke="${H3.ink}" stroke-width="2.4"/>
      <path d="M184 129 v24 M184 136 l-10 8 M184 136 l10 8 M184 153 l-7 20 M184 153 l7 20" stroke="${H3.ink}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    </g>
    <g class="apl-slot apl-slot-top"><rect x="36" y="24" width="52" height="34" rx="6" fill="none" stroke="#9DB2C4" stroke-width="2" stroke-dasharray="5 4"/><text x="62" y="46" text-anchor="middle" font-size="10" font-weight="800" fill="#8B95A1">천장</text></g>
    <g class="apl-slot apl-slot-bottom"><rect x="36" y="142" width="52" height="34" rx="6" fill="none" stroke="#9DB2C4" stroke-width="2" stroke-dasharray="5 4"/><text x="62" y="164" text-anchor="middle" font-size="10" font-weight="800" fill="#8B95A1">바닥</text></g>
    <g class="apl-devlayer"></g>
    <g class="apl-air"></g>
    <text class="apl-note" x="170" y="12" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.sub}"></text>
  </svg>`;
  const board = el("div", { class: "ht3-board apl-board" }, stage);

  const bTop = el("button", { class: "ht3-seg apl-choice", text: "천장에 설치", attrs: { type: "button" } }) as HTMLButtonElement;
  const bBottom = el("button", { class: "ht3-seg apl-choice", text: "바닥에 설치", attrs: { type: "button" } }) as HTMLButtonElement;
  const segRow = el("div", { class: "ht3-segrow apl-segrow" }, bTop, bBottom);
  const qBox = h3AskBox("apl-q");

  const devLayer = stage.querySelector(".apl-devlayer") as SVGGElement;
  const air = stage.querySelector(".apl-air") as SVGGElement;
  const note = stage.querySelector(".apl-note") as SVGTextElement;
  const slots = stage.querySelector(".apl-slot-top") as SVGGElement;
  const slotsB = stage.querySelector(".apl-slot-bottom") as SVGGElement;

  let phase: Phase = "heater";
  let busy = false;

  function setButtons(on: boolean): void {
    bTop.disabled = !on;
    bBottom.disabled = !on;
  }

  function place(slot: Slot): void {
    if (busy || phase === "done") return;
    busy = true;
    haptic(HAPTIC.tap);
    setButtons(false);
    const kind = phase;
    devLayer.innerHTML = device(kind, slot);
    slots.style.opacity = slot === "top" ? "0" : "1";
    slotsB.style.opacity = slot === "bottom" ? "0" : "1";
    const correct = (kind === "heater" && slot === "bottom") || (kind === "ac" && slot === "top");
    if (correct) {
      air.innerHTML = loopParticles(kind === "heater" ? LOOP_UP : LOOP_DOWN, kind === "heater");
      note.textContent = kind === "heater" ? "따뜻해진 공기가 위로 올라가며 방 전체를 돌아요" : "차가워진 공기가 아래로 내려가며 방 전체를 돌아요";
      board.classList.remove("stuck");
      board.classList.add("flowing");
      haptic(HAPTIC.correct);
      if (kind === "heater") {
        helper.innerHTML = "정답! 바닥의 난방기에 데워진 공기 입자는 <b>가벼워져 위로</b> 올라가고, 천장의 차가운 공기는 <b>아래로</b> 내려와요. 입자들이 <b>직접 움직이며</b> 열을 나르니 방 전체가 골고루 따뜻해지죠. 이번엔 <b>냉방기</b>! 어디에 설치할까요?";
        goals.collect("heater", "바닥이 정답!");
        tm.later(() => {
          phase = "ac";
          devLayer.innerHTML = "";
          air.innerHTML = "";
          slots.style.opacity = "1";
          slotsB.style.opacity = "1";
          board.classList.remove("flowing");
          note.textContent = "";
          busy = false;
          setButtons(true);
        }, 3200);
      } else {
        helper.innerHTML = "정답! 천장의 냉방기에서 차가워진 공기 입자는 <b>무거워져 아래로</b> 내려가고, 바닥의 따뜻한 공기는 <b>위로</b> 올라와요. 이번에도 입자들이 직접 움직이며 방을 한 바퀴 돌죠. 그럼 이 방식의 정체는?";
        goals.collect("ac", "천장이 정답!");
        tm.later(() => {
          phase = "done";
          busy = false;
          askWhy();
        }, 2600);
      }
    } else {
      air.innerHTML = stuckParticles();
      note.textContent = kind === "heater" ? "따뜻한 공기가 천장에만 머물러요, 발은 시려요" : "차가운 공기가 바닥에만 깔려요, 머리는 더워요";
      board.classList.remove("flowing");
      board.classList.add("stuck");
      haptic(HAPTIC.wrong);
      helper.innerHTML = kind === "heater"
        ? "음, 천장의 난방기가 데운 공기는 가벼워서 <b>위에 그대로 머물러요</b>. 아래층의 찬 공기는 내려올 곳이 없어 발이 시리죠. 다시 골라 볼까요?"
        : "음, 바닥의 냉방기가 식힌 공기는 무거워서 <b>바닥에 그대로 깔려요</b>. 위층의 더운 공기는 내려오지 않아 머리는 여전히 덥죠. 다시 골라 볼까요?";
      tm.later(() => {
        busy = false;
        setButtons(true);
      }, 2200);
    }
  }

  function askWhy(): void {
    b4Ask(
      qBox,
      "두 실험에서 열을 방 전체로 나른 것은 무엇이었나요?",
      [
        { t: "뜨거워지거나 차가워진 공기 입자가 직접 이동했다", ok: true },
        { t: "공기 입자는 제자리에서 흔들림만 옆으로 전달했다", ok: false },
        { t: "공기와 관계없이 열이 물질을 통하지 않고 직접 갔다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 입자가 <b>직접 이동</b>하며 열을 나르는 방식이 <b>대류</b>예요. 막대의 전도(입자는 제자리)와 다른 점이 바로 이거죠. 액체와 기체에서 일어나요."
          : "공기 입자들이 방 안을 한 바퀴 <b>직접 돌았죠</b>. 이렇게 입자가 이동하며 열을 나르는 방식이 <b>대류</b>예요. 제자리 흔들림 전달은 전도, 물질 없이 직접 가는 건 복사랍니다.";
        goals.collect("why", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  bTop.addEventListener("click", () => place("top"));
  bBottom.addEventListener("click", () => place("bottom"));

  host.append(goals.chips, helper, board, segRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("난방기 위치를 골라 보세요", { enabled: false });
  return () => tm.clear();
};
