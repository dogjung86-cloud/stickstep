// [중1 Ⅳ v3] L1 evapScaleLab — 「저울 위에서 줄어드는 손 소독제」(교과서 해 보기 재현).
// 한 통찰: 액체 표면의 입자가 스스로 운동하다 기체가 되어 공기 중으로 날아간다(증발). 그래서 질량이 줄어든다.
// 조작: 버튼 1개 — 손 소독제 바르기 → 시간 흐르기(질량 감소·입자 창에서 표면 입자가 날아감) → 판정.
// 목표 3: 바르기 → 질량 감소 관찰 → 판정(b4Ask). rAF·캔버스 없음(자가 예약 setTimeout).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { M3, scaleSvg, seededRandom, particleGrid } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3AskBox, m3Goals, m3Helper, m3Reveal, m3Timers } from "./m3Lab";

interface EslStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N_TICK = 20;
const M0 = 0.5; // 바른 직후 질량(g)
const M1 = 0.31; // 관찰 끝 질량(g)
const WIN = { x: 212, y: 40, w: 112, h: 118 }; // 입자 창

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
      helper.innerHTML =
        "정리! 손 소독제의 질량이 줄어든 건 <b>표면의 입자가 기체가 되어 공기 속으로 흩어졌기</b> 때문이에요. 입자가 스스로 운동하여 <b>액체 표면에서 기체로 변하는</b> 현상이 <b>증발</b>이에요. 젖은 우산이 마르는 것, 염전에서 소금을 얻는 것도 같은 현상이죠.";
      api.enableCTA(s.cta ?? "증발 정리하기");
    },
  );
  const helper = m3Helper("전자저울 위에 거름종이를 올려 둔 페트리 접시를 놓고 <b>영점을 맞췄어요</b>(표시 0.00 g). 아래 버튼으로 거름종이에 <b>손 소독제</b>를 얇게 펴 바르세요.");

  // 입자 창: 아래 액체층 입자 10개(3×3+1)와 공기층 희미한 점
  const liqPts = particleGrid(5, 2, WIN.x + WIN.w / 2, WIN.y + WIN.h - 24, 17);
  const flyers = [1, 3, 6, 8, 4, 0]; // 날아갈 입자 순서(표면 줄 먼저)
  const stage = el("div", { class: "esl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="eslGelG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7F5FF"/><stop offset="1" stop-color="#8FD3F4"/></linearGradient>
    </defs>
    <ellipse cx="100" cy="188" rx="86" ry="6" fill="#2A3A5E" opacity="0.10"/>
    ${scaleSvg(34, 128, 132, "esl", "0.00 g")}
    <ellipse cx="100" cy="128" rx="46" ry="8" fill="#F4F8FC" stroke="#9DB2C4" stroke-width="2.4"/>
    <ellipse cx="100" cy="126" rx="38" ry="6" fill="#FFFFFF" stroke="#C9D3DE" stroke-width="1.4"/>
    <ellipse class="esl-gel" cx="100" cy="125" rx="30" ry="4" fill="url(#eslGelG)" opacity="0"/>
    <g class="esl-bottle">
      <rect x="20" y="58" width="26" height="54" rx="6" fill="#E9FBF4" stroke="#12B886" stroke-width="2"/>
      <rect x="27" y="44" width="12" height="16" rx="3" fill="#12B886"/>
      <path d="M33 44 v-8 l8 -4" stroke="#12B886" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <text x="33" y="90" text-anchor="middle" font-size="12" font-weight="800" fill="#0A8F4E">소독제</text>
    </g>
    <text x="120" y="52" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">거름종이 위 손 소독제</text>
    <g class="esl-win">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="10" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>
      <line x1="${WIN.x + 6}" y1="${WIN.y + WIN.h - 42}" x2="${WIN.x + WIN.w - 6}" y2="${WIN.y + WIN.h - 42}" stroke="#B8B0F0" stroke-width="1.4" stroke-dasharray="3 3"/>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">입자의 눈</text>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + WIN.h - 48}" text-anchor="middle" font-size="12" font-weight="700" fill="#8B95A1">공기</text>
      ${liqPts.map((p, i) => `<circle class="esl-p esl-fly" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4" opacity="0"/>`).join("")}
    </g>
  </svg>`;
  const board = el("div", { class: "mt3-board esl-board" }, stage);

  const btn = el("button", { class: "mt3-btn esl-btn", text: "손 소독제 바르기", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "mt3-btnrow" }, btn);
  const qBox = m3AskBox("esl-q mt3-q");

  const read = stage.querySelector(".esl-read") as SVGTextElement;
  const gel = stage.querySelector(".esl-gel") as SVGEllipseElement;
  const pEls = Array.from(stage.querySelectorAll<SVGCircleElement>(".esl-p"));

  type Phase = "idle" | "applied" | "watch" | "watched" | "done";
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
      c.setAttribute("cy", (WIN.y + 28 + rnd() * 20).toFixed(1));
      c.setAttribute("cx", (liqPts[k].x + (rnd() - 0.5) * 40).toFixed(1));
      tm.later(() => c.setAttribute("opacity", "0.25"), 250);
    }
    if (i >= N_TICK) {
      phase = "watched";
      goals.collect("watch", "0.50 → 0.31 g");
      haptic(HAPTIC.correct);
      btn.textContent = "관찰 끝";
      helper.innerHTML = `질량이 <b>${M0.toFixed(2)} g에서 ${M1.toFixed(2)} g</b>으로 줄었어요. 아무도 건드리지 않았는데 소독제가 줄어든 거죠. 입자 창을 보면 <b>표면의 입자</b>들이 하나둘 위로 날아갔고요. 질량이 줄어든 까닭은 무엇일까요?`;
      tm.later(askWhy, 600);
      return;
    }
    tm.later(() => watchTick(i + 1), 180);
  }

  function askWhy(): void {
    b4Ask(
      qBox,
      "손 소독제의 <b>질량이 줄어든</b> 까닭은 무엇일까요?",
      [
        { t: "표면의 입자가 스스로 움직여 기체가 되어 공기 속으로 흩어져서", ok: true },
        { t: "소독제가 거름종이 속으로 스며들어 사라져서", ok: false },
        { t: "저울이 시간이 지나며 조금씩 눌려서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 액체 <b>표면의 입자</b>가 스스로 운동하다가 <b>기체가 되어 공기 중으로</b> 날아갔어요. 저울 밖으로 나갔으니 질량이 줄어든 거죠."
          : "거름종이에 스며들었다면 여전히 저울 위에 있으니 질량은 그대로였을 거예요. 저울이 눌린 것도 아니에요. 액체 <b>표면의 입자가 기체가 되어 공기 속으로 흩어졌기</b> 때문에 질량이 줄었답니다.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
      },
    );
    m3Reveal(tm, qBox);
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    haptic(HAPTIC.tap);
    if (phase === "idle") {
      phase = "applied";
      board.classList.add("applied");
      gel.setAttribute("opacity", "0.95");
      read.textContent = `${M0.toFixed(2)} g`;
      pEls.forEach((c) => c.setAttribute("opacity", "1"));
      goals.collect("apply", `${M0.toFixed(2)} g`);
      btn.textContent = "시간 흐르기";
      helper.innerHTML = `얇게 펴 발랐더니 저울이 <b>${M0.toFixed(2)} g</b>을 가리켜요. 오른쪽 입자 창은 소독제 표면을 입자의 눈으로 본 모습이에요. 이제 <b>시간을 흘려</b> 보세요.`;
    } else if (phase === "applied") {
      phase = "watch";
      btn.disabled = true;
      btn.textContent = "시간이 흐르는 중…";
      helper.innerHTML = "저울의 숫자와 입자 창을 함께 지켜보세요.";
      tm.later(() => watchTick(1), 300);
    }
  });

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  jitter();
  api.setCTA("손 소독제를 발라 실험을 시작하세요", { enabled: false });
  return () => tm.clear();
};
