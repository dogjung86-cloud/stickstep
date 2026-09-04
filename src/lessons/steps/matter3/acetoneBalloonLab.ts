// [중1 Ⅳ v3] L4 acetoneBalloonLab — 「아세톤 풍선 부풀리기」(교과서 해 보기 재현).
// 한 통찰: 액체가 기화하면 입자 사이의 거리가 매우 멀어져 부피가 크게 늘어난다. 입자의 종류·개수는 그대로다.
// 조작: 따뜻한 바람 불기(버튼) → 풍선 관찰 → 부피 판정 → 개수 판정.
// 한 화면 예산: 무대 = 풍선 씌운 플라스크 + 바람 + 입자 창(거리 변화가 통찰). 안내 글자 제거.
// 목표 3: 풍선 관찰 → 부피 판정 → 개수 판정. 입자 창은 액체 무리 → 기체 흩어짐 좌표 보간(자가 예약 setTimeout).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { M3, flaskSvg, particleGrid, seededRandom, stateParticles, type Pt } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3Btn, m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

interface AblStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N_TICK = 20;
const FX = 108, BASE = 166, FH = 84; // 플라스크 바닥 중심·높이
const NECK_TOP = BASE - FH;
const WIN = { x: 200, y: 14, w: 126, h: 150 };

export const acetoneBalloonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as AblStep;
  const tm = m3Timers();
  const rnd = seededRandom(91);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "watch", name: "풍선 관찰", sub: "바람을 불면" },
      { id: "vol", name: "부피 판정", sub: "관찰 뒤" },
      { id: "count", name: "개수 판정", sub: "부피 판정 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 기화하면 <b>입자 사이가 매우 멀어져</b> 부피가 크게 늘어요. 입자의 종류와 개수는 그대로예요.";
      api.enableCTA(s.cta ?? "입자 배열 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper("플라스크에 <b>아세톤</b> 1 mL를 넣고 <b>고무풍선</b>을 씌웠어요. 바닥에 따뜻한 바람을 불어요.");

  const liq = stateParticles("liquid", WIN.x, WIN.y + 8, WIN.w, WIN.h - 8, rnd, 5.5);
  const gas = particleGrid(4, 3, WIN.x + WIN.w / 2, WIN.y + 24 + (WIN.h - 24) / 2, 34).map((p) => ({ x: p.x + (rnd() - 0.5) * 12, y: p.y + (rnd() - 0.5) * 12 }));
  const stage = el("div", { class: "abl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="ablBalloonG" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#FFB3C6"/><stop offset="0.6" stop-color="#F06595"/><stop offset="1" stop-color="#C2255C"/></radialGradient>
    </defs>
    <ellipse cx="${FX}" cy="172" rx="70" ry="5" fill="#2A3A5E" opacity="0.10"/>
    <ellipse class="abl-balloon" cx="${FX}" cy="${NECK_TOP - 14}" rx="12" ry="14" fill="url(#ablBalloonG)" stroke="#A61E4D" stroke-width="1.6"/>
    ${flaskSvg(FX, BASE, FH, "abl", "#D0EBFF", 0.22)}
    <path d="M${FX - 15} ${NECK_TOP + 2} h30" stroke="#C2255C" stroke-width="5" stroke-linecap="round"/>
    <g class="abl-wind">
      ${[128, 138, 148].map((y, i) => `<path d="M14 ${y + i * 2} h22 M42 ${y + i * 2 + 1} h10" stroke="${M3.warm}" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>`).join("")}
    </g>
    <g class="abl-win">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="12" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + 18}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">입자의 눈</text>
      ${liq.map((p, i) => `<circle class="abl-p mt3-p" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5.5" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4"/>`).join("")}
    </g>
  </svg>`;
  const board = el("div", { class: "mt3-board abl-board" }, stage);

  const btn = m3Btn("abl-btn", "따뜻한 바람 불기");
  const slot = m3Slot(tm, "abl-q", btn);

  const balloon = stage.querySelector(".abl-balloon") as SVGEllipseElement;
  const liqPath = stage.querySelector(".abl-liq") as SVGPathElement;
  const pEls = Array.from(stage.querySelectorAll<SVGCircleElement>(".abl-p"));

  type Phase = "idle" | "run" | "askVol" | "askCount" | "done";
  let phase: Phase = "idle";
  let prog = 0;

  function jitter(): void {
    if (!tm.alive()) return;
    pEls.forEach((c, i) => {
      const a: Pt = liq[i], b: Pt = gas[i];
      const amp = 1.5 + 4 * prog;
      c.setAttribute("cx", (a.x + (b.x - a.x) * prog + (rnd() - 0.5) * amp).toFixed(1));
      c.setAttribute("cy", (a.y + (b.y - a.y) * prog + (rnd() - 0.5) * amp).toFixed(1));
    });
    tm.later(jitter, 150);
  }

  function tick(i: number): void {
    const t = i / N_TICK;
    const e = 1 - Math.pow(1 - t, 2);
    prog = e;
    const ry = 14 + 24 * e, rx = 12 + 24 * e;
    balloon.setAttribute("rx", rx.toFixed(1));
    balloon.setAttribute("ry", ry.toFixed(1));
    balloon.setAttribute("cy", (NECK_TOP - ry).toFixed(1));
    liqPath.setAttribute("opacity", (0.6 * (1 - e)).toFixed(2));
    if (i >= N_TICK) {
      phase = "askVol";
      goals.collect("watch", "빵빵!");
      haptic(HAPTIC.correct);
      board.classList.remove("blowing");
      helper.innerHTML = "풍선이 <b>빵빵하게</b> 부풀고 액체 아세톤은 거의 사라졌어요. 입자는 <b>매우 멀리</b> 흩어졌고요.";
      tm.later(askVol, 700);
      return;
    }
    tm.later(() => tick(i + 1), 200);
  }

  function askVol(): void {
    slot.ask(
      "풍선이 <b>부풀어 오른</b> 까닭은?",
      [
        { t: "기화하면서 입자 사이의 거리가 크게 멀어져서", ok: true },
        { t: "따뜻한 바람이 풍선 속으로 들어가서", ok: false },
        { t: "아세톤 입자의 개수가 늘어나서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 바람은 플라스크 바깥에만 닿았어요. <b>기화</b>로 입자 사이가 멀어져 부피가 늘어난 거죠."
          : "풍선이 입구를 막고 있어 바람은 못 들어가요. <b>기화</b>로 입자 사이가 매우 멀어져 부피가 늘어난 거예요.";
        goals.collect("vol", ok ? "정확한 판정!" : "판정 완료");
      },
      { why: "바람은 못 들어가요. <b>기화</b>로 입자 사이가 매우 멀어져 부피가 늘어난 거예요.", onNext: askCount },
    );
  }

  function askCount(): void {
    phase = "askCount";
    slot.ask(
      "기화한 뒤 아세톤 <b>입자의 종류와 개수</b>는?",
      [
        { t: "종류도 개수도 그대로다", ok: true },
        { t: "개수가 훨씬 늘어났다", ok: false },
        { t: "다른 종류의 입자로 바뀌었다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 처음부터 끝까지 <b>12개, 같은 입자</b>였어요. 달라진 건 사이의 거리와 배열뿐이에요."
          : "입자 창을 세어 보세요. 처음에도 나중에도 <b>12개, 같은 입자</b>예요. 달라진 건 거리와 배열뿐이에요.";
        goals.collect("count", ok ? "정확한 판정!" : "판정 완료");
        phase = "done";
      },
      { why: "처음에도 나중에도 <b>12개, 같은 입자</b>예요. 달라진 건 거리와 배열뿐이에요." },
    );
  }

  btn.addEventListener("click", () => {
    if (btn.disabled || phase !== "idle") return;
    haptic(HAPTIC.tap);
    phase = "run";
    btn.disabled = true;
    btn.textContent = "바람을 부는 중…";
    board.classList.add("blowing");
    helper.innerHTML = "플라스크 바닥에 따뜻한 바람을 불고 있어요. 풍선과 입자 창을 보세요.";
    tm.later(() => tick(1), 400);
  });

  host.append(goals.chips, helper, board, slot.el);

  jitter();
  api.setCTA("따뜻한 바람을 불어 보세요", { enabled: false });
  return () => tm.clear();
};
