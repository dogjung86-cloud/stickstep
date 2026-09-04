// [중1 Ⅳ v3] L4 oliveFreezeLab — 「올리브유 얼리기」(교과서 탐구 재현: 저울과 색 테이프).
// 한 통찰: 액체가 응고하면 입자 사이가 가까워지고 규칙적으로 배열되어 부피는 줄지만, 입자의 종류와 개수가 그대로라 질량은 변하지 않는다.
// 조작: 얼리기(버튼) → 저울에 다시 올리기(버튼) → 질량 판정 → 부피 판정.
// 한 화면 예산: 무대 = 저울 위 병 + 입자 창(배열 변화가 통찰). 얼음 비커·안내 글자 제거(냉각은 성에·색으로).
// 목표 3: 얼리기 → 질량 판정 → 부피 판정. 입자 창은 액체 배치 → 규칙 격자로 좌표를 보간(자가 예약 setTimeout).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { M3, scaleSvg, seededRandom, stateParticles, type Pt } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3Btn, m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

interface OflStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const MASS = "12.60 g";
const WIN = { x: 200, y: 14, w: 126, h: 150 };
const N_TICK = 14;

export const oliveFreezeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as OflStep;
  const tm = m3Timers();
  const rnd = seededRandom(77);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "freeze", name: "얼리기", sub: "얼음+소금에" },
      { id: "mass", name: "질량 판정", sub: "다시 재기" },
      { id: "vol", name: "부피 판정", sub: "질량 판정 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 응고하면 <b>질량은 그대로</b>(입자 개수 그대로), <b>부피는 줄어요</b>(입자 사이가 가까워져요).";
      api.enableCTA(s.cta ?? "기화 실험으로");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper("<b>올리브유</b> 병의 액면에 빨간 테이프를 붙이고 질량을 쟀어요. <b>" + MASS + "</b>. 이제 얼려 볼게요.");

  const liq = stateParticles("liquid", WIN.x, WIN.y + 8, WIN.w, WIN.h - 8, rnd, 5.5);
  const sol = stateParticles("solid", WIN.x, WIN.y + 8, WIN.w, WIN.h - 8, rnd, 5.5);
  const stage = el("div", { class: "ofl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="96" cy="170" rx="74" ry="6" fill="#2A3A5E" opacity="0.10"/>
    ${scaleSvg(36, 118, 120, "ofl", MASS)}
    <g class="ofl-jar">
      <rect class="ofl-oil" x="74" y="56" width="44" height="60" rx="5" fill="${M3.oil}" opacity="0.85"/>
      <rect x="72" y="50" width="48" height="70" rx="6" fill="none" stroke="${M3.glass}" stroke-width="2.6"/>
      <rect x="76" y="40" width="40" height="12" rx="3" fill="#8B95A1" stroke="#5C6B7A" stroke-width="1.4"/>
      <path d="M80 60 v52" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
      <rect class="ofl-tape1" x="68" y="54" width="56" height="4" rx="1.5" fill="#F03E3E"/>
      <rect class="ofl-tape2" x="68" y="60" width="56" height="4" rx="1.5" fill="#3B5BDB"/>
      <g class="ofl-frost">${[[74, 74], [118, 92], [78, 104], [116, 66]].map(([x, y]) => `<path d="M${x - 4} ${y} h8 M${x} ${y - 4} v8" stroke="#74B9F0" stroke-width="1.4" stroke-linecap="round"/>`).join("")}</g>
    </g>
    <g class="ofl-win">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="12" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + 18}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">입자의 눈</text>
      ${liq.map((p, i) => `<circle class="ofl-p mt3-p" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5.5" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4"/>`).join("")}
    </g>
  </svg>`;
  const board = el("div", { class: "mt3-board ofl-board" }, stage);

  const btn = m3Btn("ofl-btn", "얼음과 소금에 넣어 얼리기");
  const slot = m3Slot(tm, "ofl-q", btn);

  const oil = stage.querySelector(".ofl-oil") as SVGRectElement;
  const read = stage.querySelector(".ofl-read") as SVGTextElement;
  const pEls = Array.from(stage.querySelectorAll<SVGCircleElement>(".ofl-p"));

  type Phase = "idle" | "freezing" | "frozen" | "back" | "askMass" | "askVol" | "done";
  let phase: Phase = "idle";
  let frozen = false;

  function jitter(): void {
    if (!tm.alive()) return;
    if (phase === "idle") {
      pEls.forEach((c, i) => {
        c.setAttribute("cx", (liq[i].x + (rnd() - 0.5) * 3).toFixed(1));
        c.setAttribute("cy", (liq[i].y + (rnd() - 0.5) * 3).toFixed(1));
      });
    } else if (frozen) {
      pEls.forEach((c, i) => {
        c.setAttribute("cx", (sol[i].x + (rnd() - 0.5) * 1.2).toFixed(1));
        c.setAttribute("cy", (sol[i].y + (rnd() - 0.5) * 1.2).toFixed(1));
      });
    }
    tm.later(jitter, 170);
  }

  function freezeTick(i: number): void {
    const t = i / N_TICK;
    oil.setAttribute("y", (56 + 6 * t).toFixed(1));
    oil.setAttribute("height", (60 - 6 * t).toFixed(1));
    if (i === Math.floor(N_TICK / 2)) oil.setAttribute("fill", M3.oilFrozen);
    pEls.forEach((c, k) => {
      const a: Pt = liq[k], b: Pt = sol[k];
      c.setAttribute("cx", (a.x + (b.x - a.x) * t).toFixed(1));
      c.setAttribute("cy", (a.y + (b.y - a.y) * t).toFixed(1));
    });
    if (i >= N_TICK) {
      frozen = true;
      phase = "frozen";
      board.classList.add("frozen", "tape2");
      goals.collect("freeze", "굳었어요!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "하얗게 <b>굳었어요</b>. 액면이 내려가 <b>파란 테이프</b>를 새로 붙였죠. 입자는 규칙적으로 모였고요.";
      btn.textContent = "물기 닦고 저울에 다시 올리기";
      btn.disabled = false;
      return;
    }
    tm.later(() => freezeTick(i + 1), 220);
  }

  function askMass(): void {
    phase = "askMass";
    slot.ask(
      "얼리기 전 <b>" + MASS + "</b>이던 질량은 얼린 뒤 어떻게 됐을까요?",
      [
        { t: "그대로 " + MASS, ok: true },
        { t: "굳어서 더 무거워졌다", ok: false },
        { t: "부피가 줄어 더 가벼워졌다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        read.textContent = MASS;
        helper.innerHTML = ok
          ? "정확해요! 저울도 <b>" + MASS + "</b> 그대로예요. 입자의 종류도 개수도 그대로니까요. 그럼 부피는 왜 줄었을까요?"
          : "저울을 보세요. <b>" + MASS + "</b> 그대로예요. 입자의 종류도 개수도 그대로니까요. 그럼 부피는 왜 줄었을까요?";
        goals.collect("mass", ok ? "정확한 판정!" : "판정 완료");
      },
      { why: "저울은 <b>" + MASS + "</b> 그대로예요. 입자의 종류도 개수도 그대로니까요.", onNext: askVol },
    );
  }

  function askVol(): void {
    phase = "askVol";
    slot.ask(
      "응고할 때 <b>부피가 줄어든</b> 까닭은?",
      [
        { t: "입자 사이가 가까워지고 규칙적으로 배열되어서", ok: true },
        { t: "입자의 개수가 줄어서", ok: false },
        { t: "입자 하나하나가 작아져서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 개수는 12개 그대로인데 <b>사이가 가까워지고 규칙적</b>으로 모여 부피가 줄었어요."
          : "입자 창의 개수는 12개 그대로고 크기도 같아요. <b>사이가 가까워지고 규칙적</b>으로 모여 부피가 줄었어요.";
        goals.collect("vol", ok ? "정확한 판정!" : "판정 완료");
        phase = "done";
      },
      { why: "입자 개수는 그대로예요. <b>사이가 가까워지고 규칙적</b>으로 모여 부피가 줄었어요." },
    );
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    haptic(HAPTIC.tap);
    if (phase === "idle") {
      phase = "freezing";
      btn.disabled = true;
      btn.textContent = "얼리는 중…";
      read.textContent = "-- g";
      helper.innerHTML = "얼음과 소금 속에 병을 푹 넣었어요. 액면과 입자 창을 지켜보세요.";
      tm.later(() => freezeTick(1), 600);
    } else if (phase === "frozen") {
      phase = "back";
      btn.disabled = true;
      btn.textContent = "다시 재는 중…";
      helper.innerHTML = "저울 위로 돌아왔어요. 표시창을 보기 전에 먼저 판정해 보세요.";
      tm.later(askMass, 900);
    }
  });

  host.append(goals.chips, helper, board, slot.el);

  jitter();
  api.setCTA("올리브유를 얼려 보세요", { enabled: false });
  return () => tm.clear();
};
