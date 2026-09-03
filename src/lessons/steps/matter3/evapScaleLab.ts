// [중1 Ⅳ v3] L1 evapScaleLab — 「저울 위 손 소독제」(교과서 해 보기 재현).
// 한 통찰: 액체 표면의 입자가 스스로 운동하다 기체가 되어 공기 중으로 흩어진다(증발). 그래서 질량이 줄어든다.
// 조작: 버튼 1개 — 소독제 바르기 → 시간 흐르기(질량 감소·입자 창에서 표면 입자가 날아감) → 판정.
// 한 화면 예산: 무대 = 저울 + 입자 창(표면 입자가 날아가는 것이 통찰이라 입자 창 유지), 글자는 저울 표시창뿐.
// 목표 3: 바르기 → 질량 변화 → 판정(b4Ask). rAF·캔버스 없음(자가 예약 setTimeout).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { M3, scaleSvg, seededRandom, particleGrid } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3Btn, m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

interface EslStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N_TICK = 20;
const M0 = 0.5; // 바른 직후 질량(g)
const M1 = 0.31; // 관찰 끝 질량(g)
const WIN = { x: 200, y: 14, w: 126, h: 150 }; // 입자 창

export const evapScaleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as EslStep;
  const tm = m3Timers();
  const rnd = seededRandom(53);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "apply", name: "바르기", sub: "거름종이에" },
      { id: "watch", name: "질량 변화", sub: "시간이 흐르면" },
      { id: "judge", name: "판정", sub: "관찰 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 액체 <b>표면의 입자</b>가 기체로 변해 흩어지는 현상이 <b>증발</b>이에요.";
      api.enableCTA(s.cta ?? "증발 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper("저울 위 거름종이에 <b>손 소독제</b>를 얇게 바를 거예요. 영점은 0.00 g.");

  // 입자 창: 아래 액체층 입자 10개(5×2)와 공기층 점선
  const liqPts = particleGrid(5, 2, WIN.x + WIN.w / 2, WIN.y + WIN.h - 26, 18);
  const flyers = [1, 3, 6, 8, 4, 0]; // 날아갈 입자 순서(표면 줄 먼저)
  const stage = el("div", { class: "esl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="eslGelG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7F5FF"/><stop offset="1" stop-color="#8FD3F4"/></linearGradient>
    </defs>
    <ellipse cx="96" cy="170" rx="80" ry="6" fill="#2A3A5E" opacity="0.10"/>
    ${scaleSvg(30, 118, 132, "esl", "0.00 g")}
    <ellipse cx="96" cy="118" rx="46" ry="8" fill="#F4F8FC" stroke="#9DB2C4" stroke-width="2.4"/>
    <ellipse cx="96" cy="116" rx="38" ry="6" fill="#FFFFFF" stroke="#C9D3DE" stroke-width="1.4"/>
    <ellipse class="esl-gel" cx="96" cy="115" rx="30" ry="4" fill="url(#eslGelG)" opacity="0"/>
    <g class="esl-win" opacity="0" style="transition: opacity 0.5s ease">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="12" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + 18}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">입자의 눈</text>
      <line x1="${WIN.x + 8}" y1="${WIN.y + WIN.h - 50}" x2="${WIN.x + WIN.w - 8}" y2="${WIN.y + WIN.h - 50}" stroke="#B8B0F0" stroke-width="1.4" stroke-dasharray="3 3"/>
      ${liqPts.map((p, i) => `<circle class="esl-p esl-fly" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5.5" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4" opacity="0"/>`).join("")}
    </g>
  </svg>`;
  const board = el("div", { class: "mt3-board esl-board" }, stage);

  const btn = m3Btn("esl-btn", "손 소독제 바르기");
  const slot = m3Slot(tm, "esl-q", btn);

  const read = stage.querySelector(".esl-read") as SVGTextElement;
  const gel = stage.querySelector(".esl-gel") as SVGEllipseElement;
  const pEls = Array.from(stage.querySelectorAll<SVGCircleElement>(".esl-p"));

  type Phase = "idle" | "applied" | "watch" | "watched";
  let phase: Phase = "idle";
  const flown = new Set<number>();

  function jitter(): void {
    if (!tm.alive()) return;
    pEls.forEach((c, i) => {
      if (flown.has(i) || phase === "idle") return;
      const b = liqPts[i];
      c.setAttribute("cx", (b.x + (rnd() - 0.5) * 3).toFixed(1));
      c.setAttribute("cy", (b.y + (rnd() - 0.5) * 3).toFixed(1));
    });
    tm.later(jitter, 160);
  }

  function watchTick(i: number): void {
    const t = i / N_TICK;
    const m = M0 + (M1 - M0) * t;
    read.textContent = `${m.toFixed(2)} g`;
    gel.setAttribute("ry", (4 - 2.2 * t).toFixed(2));
    gel.setAttribute("rx", (30 - 6 * t).toFixed(1));
    // 3틱마다 표면 입자 하나가 위로 날아간다
    if (i % 3 === 1 && flown.size < flyers.length) {
      const k = flyers[flown.size];
      flown.add(k);
      const c = pEls[k];
      c.setAttribute("cy", (WIN.y + 34 + rnd() * 24).toFixed(1));
      c.setAttribute("cx", (liqPts[k].x + (rnd() - 0.5) * 44).toFixed(1));
      tm.later(() => c.setAttribute("opacity", "0.25"), 250);
    }
    if (i >= N_TICK) {
      phase = "watched";
      goals.collect("watch", "0.50 → 0.31 g");
      haptic(HAPTIC.correct);
      helper.innerHTML = `<b>${M0.toFixed(2)} g에서 ${M1.toFixed(2)} g</b>으로 줄었어요. 표면의 입자가 하나둘 날아갔죠.`;
      tm.later(askWhy, 600);
      return;
    }
    tm.later(() => watchTick(i + 1), 180);
  }

  function askWhy(): void {
    slot.ask(
      "손 소독제의 <b>질량이 줄어든</b> 까닭은?",
      [
        { t: "표면의 입자가 기체가 되어 흩어져서", ok: true },
        { t: "거름종이 속으로 스며들어서", ok: false },
        { t: "저울이 조금씩 눌려서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! <b>표면의 입자</b>가 기체가 되어 공기 속으로 흩어졌어요. 저울 밖으로 나간 거죠."
          : "스며들었다면 여전히 저울 위라 질량은 그대로예요. <b>표면의 입자</b>가 기체가 되어 흩어진 거예요.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    haptic(HAPTIC.tap);
    if (phase === "idle") {
      phase = "applied";
      gel.setAttribute("opacity", "0.95");
      read.textContent = `${M0.toFixed(2)} g`;
      pEls.forEach((c) => c.setAttribute("opacity", "1"));
      (stage.querySelector(".esl-win") as SVGGElement).setAttribute("opacity", "1");
      goals.collect("apply", `${M0.toFixed(2)} g`);
      btn.textContent = "시간 흐르기";
      helper.innerHTML = `저울이 <b>${M0.toFixed(2)} g</b>을 가리켜요. 오른쪽은 소독제 표면을 입자의 눈으로 본 모습이에요.`;
    } else if (phase === "applied") {
      phase = "watch";
      btn.disabled = true;
      btn.textContent = "시간이 흐르는 중…";
      helper.innerHTML = "저울 숫자와 입자 창을 함께 지켜보세요.";
      tm.later(() => watchTick(1), 300);
    }
  });

  host.append(goals.chips, helper, board, slot.el);

  jitter();
  api.setCTA("손 소독제를 발라 실험을 시작하세요", { enabled: false });
  return () => tm.clear();
};
