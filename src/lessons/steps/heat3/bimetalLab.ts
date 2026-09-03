// [중1 Ⅲ v3] L5 bimetalLab — 「알루미늄 테이프에서 바이메탈까지」(교과서 해 보기 + 바이메탈 활용).
// 한 통찰: 같은 열을 받아도 물질마다 열팽창 정도가 다르다. 두 물질을 붙이면 덜 늘어나는 쪽으로 휘고,
// 이 성질로 온도 조절 장치(바이메탈)를 만든다.
// 조작: 예측(b4Ask) → 가열 버튼(테이프) → 회로로 넘어가기 버튼 → 온도 올리기·식히기 버튼(바이메탈 회로).
// 목표 3: 테이프 실험 → 바이메탈 회로 → 휘는 방향 판정.
// 사용자 피드백(2026-09-03) 반영: 테이프 결과 설명을 읽을 시간을 주려고 자동 전환 대신 버튼으로 넘어가고,
// 바이메탈은 통째로 기울지 않고 곡선으로 휜다(경로 d를 자가 예약 setTimeout으로 보간).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { H3, flameSvg, burnerSvg } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3AskBox, h3Goals, h3Helper, h3Timers } from "./h3Lab";

interface BmlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

function tapeScene(): string {
  return `<svg viewBox="0 0 340 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="60" y1="18" x2="280" y2="18" stroke="#8B95A1" stroke-width="2.6"/>
    <rect x="52" y="10" width="8" height="16" fill="#4E5968"/><rect x="280" y="10" width="8" height="16" fill="#4E5968"/>
    <g class="bml-tape-straight">
      <rect x="160" y="18" width="10" height="120" fill="${H3.alu}" stroke="#8B95A1" stroke-width="1.6"/>
      <rect x="170" y="18" width="10" height="120" fill="${H3.paper}" stroke="#C9B37A" stroke-width="1.6"/>
    </g>
    <g class="bml-tape-bent">
      <path d="M165 18 c2 42 6 74 34 112" stroke="${H3.alu}" stroke-width="10" fill="none"/>
      <path d="M175 18 c2 40 4 70 30 106" stroke="${H3.paper}" stroke-width="10" fill="none"/>
      <path d="M180 18 c2 40 4 70 30 106" stroke="#C9B37A" stroke-width="1.2" fill="none"/>
    </g>
    <text x="150" y="44" text-anchor="end" font-size="10.5" font-weight="800" fill="${H3.sub}">알루미늄박</text>
    <text x="190" y="44" text-anchor="start" font-size="10.5" font-weight="800" fill="${H3.sub}">종이</text>
    ${flameSvg(170, 188, 1, "bml")}${burnerSvg(170, 188, 70)}
  </svg>`;
}

// 바이메탈 띠의 고정 끝·길이(회로 장면 좌표)
const STRIP_X0 = 46;
const STRIP_LEN = 150;
const STRIP_Y = 69; // 중심선
const HALF = 4.5; // 금속 한 층의 절반 두께

/** 휨 정도 k(0~1)에 따른 두 금속 경로 — 고정 끝은 그대로, 자유 끝이 아래로 처지는 완만한 곡선. */
function stripPath(k: number, offset: number): string {
  const x0 = STRIP_X0, x1 = STRIP_X0 + STRIP_LEN;
  const y0 = STRIP_Y + offset;
  const cx = x0 + STRIP_LEN * 0.55, cy = y0 + 6 * k;
  const ex = x1 - 3 * k, ey = y0 + 40 * k;
  return `M${x0} ${y0} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

function circuitScene(): string {
  return `<svg viewBox="0 0 340 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M40 60 v110 h260 v-92" stroke="#4E5968" stroke-width="3.5" fill="none"/>
    <rect x="150" y="160" width="40" height="20" rx="4" fill="#FFFFFF" stroke="#4E5968" stroke-width="2.6"/>
    <path d="M160 156 v28 M172 150 v40" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    <text x="170" y="200" text-anchor="middle" font-size="10" font-weight="800" fill="${H3.sub}">전지</text>
    <g class="bml-lamp">
      <circle class="bml-bulb" cx="300" cy="58" r="20" fill="#FFF3BF" stroke="#8B95A1" stroke-width="2.6"/>
      <path d="M292 56 l8 8 8 -8" stroke="#8B95A1" stroke-width="2" fill="none"/>
      <g class="bml-glow" stroke="${H3.warm}" stroke-width="2.6" stroke-linecap="round"><path d="M300 26 v-8 M322 36 l6 -6 M278 36 l-6 -6"/></g>
      <text x="300" y="98" text-anchor="middle" font-size="10" font-weight="800" fill="${H3.sub}">전구</text>
    </g>
    <rect x="34" y="52" width="12" height="36" rx="2" fill="#4E5968"/>
    <path class="bml-strip-top" d="${stripPath(0, -HALF)}" stroke="#F5B301" stroke-width="9" fill="none"/>
    <path class="bml-strip-bot" d="${stripPath(0, HALF)}" stroke="#8B95A1" stroke-width="9" fill="none"/>
    <path d="M196 40 v20 M196 40 h104" stroke="#4E5968" stroke-width="3.5" fill="none"/>
    <circle cx="196" cy="60" r="4" fill="#4E5968"/>
    <text x="96" y="48" text-anchor="middle" font-size="10" font-weight="800" fill="#B8860B">열팽창 정도가 큰 금속(위)</text>
    <text x="90" y="106" text-anchor="middle" font-size="10" font-weight="800" fill="#5C6B7A">열팽창 정도가 작은 금속(아래)</text>
    <text x="214" y="30" text-anchor="start" font-size="9.5" font-weight="800" fill="${H3.sub}">접점</text>
    ${flameSvg(110, 150, 0.9, "bmlc")}${burnerSvg(110, 150, 70)}
    <text class="bml-state" x="232" y="142" text-anchor="middle" font-size="10.5" font-weight="800" fill="${H3.ink}">온도 낮음: 접점에 닿아 전구가 켜져요</text>
  </svg>`;
}

export const bimetalLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BmlStep;
  const tm = h3Timers();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = h3Goals(
    [
      { id: "tape", name: "테이프 실험", sub: "예측하고 가열" },
      { id: "circuit", name: "바이메탈 회로", sub: "온도 올리기" },
      { id: "dir", name: "휘는 방향", sub: "회로 실험 뒤" },
    ],
    () => {
      helper.innerHTML =
        "정리! 같은 열을 받아도 <b>물질마다 열팽창 정도가 달라요</b>. 열팽창 정도가 다른 두 금속을 붙인 <b>바이메탈</b>은 온도가 높아지면 <b>열팽창 정도가 작은 금속 쪽으로 휘어</b> 회로를 끊어요. 전기다리미·토스터·전기밥솥의 온도 조절 장치가 바로 이거예요.";
      api.enableCTA(s.cta ?? "열팽창 정리하기");
    },
  );
  const helper = h3Helper("종이를 붙인 <b>알루미늄 테이프</b>를 철사에 매달고 가열해 볼 거예요. 알루미늄박과 종이 중 열을 받으면 <b>더 많이 늘어나는 쪽</b>은 어디일까요? 먼저 예측해 보세요.");

  const stage = el("div", { class: "bml-stage", html: tapeScene() });
  const board = el("div", { class: "ht3-board bml-board" }, stage);
  const btn = el("button", { class: "ht3-btn bml-btn", text: "가열하기", attrs: { type: "button" } }) as HTMLButtonElement;
  btn.disabled = true;
  const btnRow = el("div", { class: "ht3-btnrow" }, btn);
  const qBox = h3AskBox("bml-q");

  let phase: "predict" | "tape" | "tapeDone" | "circuit" | "done" = "predict";
  let hot = false;
  let heatedOnce = false;
  let bend = 0; // 현재 휨 정도 0~1

  // 1) 예측(채점 없음) → 가열 버튼 개방
  tm.later(() => {
    b4Ask(
      qBox,
      "가열하면 알루미늄 테이프는 <b>어느 쪽으로 휠까요?</b>",
      [
        { t: "종이 쪽으로 (알루미늄박이 더 많이 늘어나서)", ok: true },
        { t: "알루미늄박 쪽으로 (종이가 더 많이 늘어나서)", ok: false },
        { t: "휘지 않고 그대로 아래로 늘어난다", ok: false },
      ],
      (ok) => {
        helper.innerHTML = ok
          ? "그렇게 예측했군요. 정말 그런지 <b>가열해서</b> 확인해 봐요."
          : "예측은 채점하지 않아요. 정말 어느 쪽으로 휘는지 <b>가열해서</b> 확인해 봐요.";
        phase = "tape";
        btn.disabled = false;
      },
    );
  }, 400);

  function heatTape(): void {
    haptic(HAPTIC.tap);
    board.classList.add("heating", "bent");
    helper.innerHTML = "가열하자 테이프가 <b>종이 쪽으로</b> 휘었어요! 종이도 알루미늄박도 늘어나지만, <b>알루미늄의 열팽창 정도가 종이보다 커서</b> 바깥쪽이 된 거예요. 물질마다 열팽창 정도가 다르다는 증거죠. 다 읽었으면 아래 버튼으로 다음 실험으로 넘어가요.";
    goals.collect("tape", "종이 쪽으로!");
    phase = "tapeDone";
    btn.textContent = "바이메탈 회로로 넘어가기";
  }

  function toCircuit(): void {
    haptic(HAPTIC.tap);
    phase = "circuit";
    board.classList.remove("heating", "bent");
    stage.innerHTML = circuitScene();
    btn.textContent = "온도 올리기";
    helper.innerHTML = "이 성질을 이용한 장치가 <b>바이메탈</b>이에요. 열팽창 정도가 다른 두 금속을 붙여 회로에 넣었어요. 지금은 접점에 닿아 전구가 켜져 있죠. <b>온도를 올려</b> 보세요.";
  }

  // 휨 보간 — 곡선 경로 d를 18틱으로 보간(자가 예약 setTimeout, rAF 없음).
  function tweenBend(to: number, done?: () => void): void {
    const from = bend;
    const steps = 18;
    let n = 0;
    const top = stage.querySelector(".bml-strip-top") as SVGPathElement | null;
    const bot = stage.querySelector(".bml-strip-bot") as SVGPathElement | null;
    const step = (): void => {
      n += 1;
      const t = n / steps;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      bend = from + (to - from) * e;
      top?.setAttribute("d", stripPath(bend, -HALF));
      bot?.setAttribute("d", stripPath(bend, HALF));
      if (n < steps) tm.later(step, 40);
      else done?.();
    };
    step();
  }

  function toggleHeat(): void {
    haptic(HAPTIC.tap);
    hot = !hot;
    btn.disabled = true;
    board.classList.toggle("hot", hot);
    const state = stage.querySelector(".bml-state") as SVGTextElement | null;
    if (hot) {
      heatedOnce = true;
      if (state) state.textContent = "온도 높음: 휘어져 접점에서 떨어져요";
      helper.innerHTML = "온도가 오르자 바이메탈이 <b>아래로 휘면서 접점에서 떨어졌고</b>, 회로가 끊겨 전구가 꺼졌어요. 이번엔 <b>식혀</b> 보세요.";
      tweenBend(1, () => {
        btn.textContent = "식히기";
        btn.disabled = false;
      });
    } else {
      if (state) state.textContent = "온도 낮음: 접점에 닿아 전구가 켜져요";
      helper.innerHTML = "식히자 다시 곧게 펴지며 접점에 닿아 전구가 켜졌어요. 온도에 따라 <b>스스로 회로를 껐다 켜는</b> 장치, 그래서 온도 조절에 쓰인답니다.";
      tweenBend(0, () => {
        btn.textContent = "온도 올리기";
        if (heatedOnce && !goals.has("circuit")) {
          goals.collect("circuit", "껐다 켰다!");
          tm.later(askDir, 900);
        } else {
          btn.disabled = false;
        }
      });
    }
  }

  function askDir(): void {
    phase = "done";
    b4Ask(
      qBox,
      "온도가 높아질 때, 바이메탈은 <b>어느 금속 쪽으로</b> 휘었나요?",
      [
        { t: "열팽창 정도가 작은 금속 쪽으로", ok: true },
        { t: "열팽창 정도가 큰 금속 쪽으로", ok: false },
        { t: "휘지 않고 양쪽이 똑같이 늘어난다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 많이 늘어난 금속이 <b>바깥쪽</b>이 되니, 덜 늘어난 <b>열팽창 정도가 작은 금속 쪽으로</b> 휘어요. 테이프가 종이 쪽으로 휜 것과 같은 원리죠."
          : "테이프를 떠올려요. 더 많이 늘어난 알루미늄박이 <b>바깥쪽</b>이 되면서 종이 쪽으로 휘었죠. 바이메탈도 덜 늘어난 <b>열팽창 정도가 작은 금속 쪽으로</b> 휜답니다.";
        goals.collect("dir", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    if (phase === "tape") heatTape();
    else if (phase === "tapeDone") toCircuit();
    else if (phase === "circuit") toggleHeat();
  });

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("먼저 예측한 뒤 가열해 보세요", { enabled: false });
  return () => tm.clear();
};
