// [중1 Ⅲ v3] L5 bimetalLab — 「테이프에서 바이메탈까지」(교과서 해 보기 + 바이메탈 활용).
// 한 통찰: 같은 열을 받아도 물질마다 열팽창 정도가 다르다. 두 물질을 붙이면 덜 늘어나는 쪽으로 휘고,
// 이 성질로 온도 조절 장치(바이메탈)를 만든다.
// 조작: 예측(슬롯의 b4Ask) → 가열 버튼(테이프) → 회로로 넘어가기 버튼 → 온도 올리기·식히기 버튼(바이메탈 회로).
// 한 화면 예산: 무대 340×180, 회로 장면의 상태 글자·전지/전구/접점 라벨 제거(금속 두 줄 라벨만), 판정은 버튼 자리에 교체.
// 목표 3: 테이프 실험 → 바이메탈 회로 → 휘는 방향 판정.
// 사용자 피드백(2026-09-03) 반영: 테이프 결과 설명을 읽을 시간을 주려고 자동 전환 대신 버튼으로 넘어가고,
// 바이메탈은 통째로 기울지 않고 곡선으로 휜다(경로 d를 자가 예약 setTimeout으로 보간).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { H3, flameSvg, burnerSvg } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3Btn, h3Goals, h3Helper, h3Slot, h3Timers } from "./h3Lab";

interface BmlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

function tapeScene(): string {
  return `<svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="60" y1="14" x2="280" y2="14" stroke="#8B95A1" stroke-width="2.6"/>
    <rect x="52" y="6" width="8" height="16" fill="#4E5968"/><rect x="280" y="6" width="8" height="16" fill="#4E5968"/>
    <g class="bml-tape-straight">
      <rect x="160" y="14" width="10" height="100" fill="${H3.alu}" stroke="#8B95A1" stroke-width="1.6"/>
      <rect x="170" y="14" width="10" height="100" fill="${H3.paper}" stroke="#C9B37A" stroke-width="1.6"/>
    </g>
    <g class="bml-tape-bent">
      <path d="M165 14 c2 36 6 62 30 94" stroke="${H3.alu}" stroke-width="10" fill="none"/>
      <path d="M175 14 c2 34 4 58 26 88" stroke="${H3.paper}" stroke-width="10" fill="none"/>
      <path d="M180 14 c2 34 4 58 26 88" stroke="#C9B37A" stroke-width="1.2" fill="none"/>
    </g>
    <text x="150" y="40" text-anchor="end" font-size="10.5" font-weight="800" fill="${H3.sub}">알루미늄박</text>
    <text x="190" y="40" text-anchor="start" font-size="10.5" font-weight="800" fill="${H3.sub}">종이</text>
    ${flameSvg(170, 156, 0.9, "bml")}${burnerSvg(170, 156, 70)}
  </svg>`;
}

// 바이메탈 띠의 고정 끝·길이(회로 장면 좌표)
const STRIP_X0 = 46;
const STRIP_LEN = 150;
const STRIP_Y = 62; // 중심선
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
  return `<svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M40 56 v112 h260 v-94" stroke="#4E5968" stroke-width="3.5" fill="none"/>
    <rect x="150" y="158" width="40" height="18" rx="4" fill="#FFFFFF" stroke="#4E5968" stroke-width="2.6"/>
    <path d="M160 154 v26 M172 148 v38" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    <g class="bml-lamp">
      <circle class="bml-bulb" cx="300" cy="52" r="18" fill="#FFF3BF" stroke="#8B95A1" stroke-width="2.6"/>
      <path d="M292 50 l8 8 8 -8" stroke="#8B95A1" stroke-width="2" fill="none"/>
      <g class="bml-glow" stroke="${H3.warm}" stroke-width="2.6" stroke-linecap="round"><path d="M300 22 v-8 M320 32 l6 -6 M280 32 l-6 -6"/></g>
    </g>
    <rect x="34" y="44" width="12" height="36" rx="2" fill="#4E5968"/>
    <path class="bml-strip-top" d="${stripPath(0, -HALF)}" stroke="#F5B301" stroke-width="9" fill="none"/>
    <path class="bml-strip-bot" d="${stripPath(0, HALF)}" stroke="#8B95A1" stroke-width="9" fill="none"/>
    <path d="M196 34 v18 M196 34 h104" stroke="#4E5968" stroke-width="3.5" fill="none"/>
    <circle cx="196" cy="52" r="4" fill="#4E5968"/>
    <text x="96" y="40" text-anchor="middle" font-size="10.5" font-weight="800" fill="#B8860B">열팽창 정도가 큰 금속(위)</text>
    <text x="90" y="98" text-anchor="middle" font-size="10.5" font-weight="800" fill="#5C6B7A">열팽창 정도가 작은 금속(아래)</text>
    ${flameSvg(110, 138, 0.8, "bmlc")}${burnerSvg(110, 138, 64)}
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
      helper.innerHTML = "정리! 물질마다 <b>열팽창 정도가 달라요</b>. 바이메탈은 <b>열팽창 정도가 작은 금속 쪽으로</b> 휘어 회로를 끊어요.";
      api.enableCTA(s.cta ?? "열팽창 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = h3Helper("종이를 붙인 <b>알루미늄 테이프</b>를 가열할 거예요. 열을 받으면 어느 쪽으로 휠지 먼저 예측해요.");

  const stage = el("div", { class: "bml-stage", html: tapeScene() });
  const board = el("div", { class: "ht3-board bml-board" }, stage);
  const btn = h3Btn("bml-btn", "가열하기");
  btn.disabled = true;
  const slot = h3Slot(tm, "bml-q", btn);

  let phase: "predict" | "tape" | "tapeDone" | "circuit" | "done" = "predict";
  let hot = false;
  let heatedOnce = false;
  let bend = 0; // 현재 휨 정도 0~1

  // 1) 예측(채점 없음) → 가열 버튼 개방
  tm.later(() => {
    slot.ask(
      "가열하면 알루미늄 테이프는 <b>어느 쪽으로 휠까요?</b>",
      [
        { t: "종이 쪽으로 (알루미늄박이 더 늘어나서)", ok: true },
        { t: "알루미늄박 쪽으로 (종이가 더 늘어나서)", ok: false },
        { t: "휘지 않고 그대로 아래로 늘어난다", ok: false },
      ],
      (ok) => {
        helper.innerHTML = ok
          ? "그렇게 예측했군요. 정말 그런지 <b>가열해서</b> 확인해 봐요."
          : "예측은 채점하지 않아요. 정말 어느 쪽으로 휘는지 <b>가열해서</b> 확인해 봐요.";
        phase = "tape";
        btn.disabled = false;
      },
      { predict: true, onNext: () => slot.showBtn() },
    );
  }, 400);

  function heatTape(): void {
    haptic(HAPTIC.tap);
    board.classList.add("heating", "bent");
    helper.innerHTML = "<b>종이 쪽으로</b> 휘었어요! <b>알루미늄의 열팽창 정도가 종이보다 커서</b> 바깥쪽이 된 거예요.";
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
    helper.innerHTML = "이 성질을 이용한 <b>바이메탈</b>이에요. 지금은 접점에 닿아 전구가 켜져 있죠. <b>온도를 올려</b> 보세요.";
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
    if (hot) {
      heatedOnce = true;
      helper.innerHTML = "온도가 오르자 <b>아래로 휘면서 접점에서 떨어졌고</b>, 회로가 끊겨 전구가 꺼졌어요. 이번엔 <b>식혀</b> 보세요.";
      tweenBend(1, () => {
        btn.textContent = "식히기";
        btn.disabled = false;
      });
    } else {
      helper.innerHTML = "식히자 곧게 펴져 접점에 닿아 전구가 켜졌어요. 온도에 따라 <b>스스로 회로를 껐다 켜는</b> 장치예요.";
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
    slot.ask(
      "온도가 높아질 때, 바이메탈은 <b>어느 금속 쪽으로</b> 휘었나요?",
      [
        { t: "열팽창 정도가 작은 금속 쪽으로", ok: true },
        { t: "열팽창 정도가 큰 금속 쪽으로", ok: false },
        { t: "휘지 않고 양쪽이 똑같이 늘어난다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 많이 늘어난 금속이 <b>바깥쪽</b>이 되니 <b>열팽창 정도가 작은 금속 쪽으로</b> 휘어요."
          : "테이프를 떠올려요. 더 늘어난 알루미늄박이 <b>바깥쪽</b>이 됐죠. <b>열팽창 정도가 작은 금속 쪽으로</b> 휘어요.";
        goals.collect("dir", ok ? "정확한 판정!" : "판정 완료");
      },
      { why: "더 늘어난 금속이 <b>바깥쪽</b>이 되니 열팽창 정도가 <b>작은 금속 쪽</b>으로 휘어요." },
    );
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    if (phase === "tape") heatTape();
    else if (phase === "tapeDone") toCircuit();
    else if (phase === "circuit") toggleHeat();
  });

  host.append(goals.chips, helper, board, slot.el);

  api.setCTA("먼저 예측한 뒤 가열해 보세요", { enabled: false });
  return () => tm.clear();
};
