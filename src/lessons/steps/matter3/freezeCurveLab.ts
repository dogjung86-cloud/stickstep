// [중1 Ⅳ v3] L6 freezeCurveLab — 「물이 얼 때의 온도」(교과서 해 보기: 물이 얼 때의 온도 측정).
// 한 통찰: 물이 어는 동안(응고) 온도는 일정하게 유지된다. 물이 얼음으로 변하는 동안 열에너지를 방출하기 때문이다.
// 조작: 냉각 시작(버튼) → 곡선이 자라며 '온도 일정 구간' → 온도 판정 → 열에너지 판정.
// 한 화면 예산(2026-09-03): 시험관·비커 장면을 버리고 그래프 한 장 + 작은 입자 창(물 → 얼음 배열 보간, 우상단 빈 자리).
// 목표 3: 냉각 관찰 → 구간 판정 → 열에너지 판정. rAF·캔버스 없음.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { M3, seededRandom, stateParticles, type Pt } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3Btn, m3Deg, m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

interface FrzStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N = 40;
const TICK_MS = 200;
const GX0 = 42, GY0 = 16, GW = 284, GH = 132;
const T_MIN = -15, T_MAX = 25;
const yOf = (T: number): number => GY0 + GH - ((T - T_MIN) / (T_MAX - T_MIN)) * GH;
const xOf = (i: number): number => GX0 + 6 + (i / N) * (GW - 12);
const tOf = (i: number): number => (i <= 12 ? 20 - (20 * i) / 12 : i <= 28 ? 0 : -(8 * (i - 28)) / 12);
const WIN = { x: 200, y: 22, w: 120, h: 54 }; // 입자 창(곡선이 지나지 않는 우상단)
const stateName = (k: number): string => (k <= 12 ? "물" : k <= 28 ? "어는 중" : "얼음");

export const freezeCurveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FrzStep;
  const tm = m3Timers();
  const rnd = seededRandom(23);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "watch", name: "냉각 관찰", sub: "센서 연결" },
      { id: "temp", name: "구간 판정", sub: "곡선 완성 뒤" },
      { id: "energy", name: "열에너지", sub: "구간 판정 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 어는 동안 온도는 <b>일정</b>해요. 물이 얼음으로 변하며 열에너지를 <b>방출</b>하기 때문이에요.";
      api.enableCTA(s.cta ?? "이용 실험으로");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper("얼음과 소금 속 시험관의 <b>물</b>은 지금 20℃. 온도 센서를 연결하고 곡선을 지켜보세요.");

  const liqP = stateParticles("liquid", WIN.x, WIN.y, WIN.w, WIN.h, rnd, 3.8);
  const solP = stateParticles("solid", WIN.x, WIN.y, WIN.w, WIN.h, rnd, 3.8);

  const graph = el("div", { class: "frz-graph" });
  graph.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="${GX0}" y1="${GY0 - 4}" x2="${GX0}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${GX0}" y1="${GY0 + GH}" x2="${GX0 + GW + 6}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[-10, 0, 10, 20].map((v) => `<line x1="${GX0 - 4}" y1="${yOf(v)}" x2="${GX0 + GW}" y2="${yOf(v)}" stroke="${v === 0 ? "#D9D2FF" : "#EEF0F3"}" stroke-width="${v === 0 ? 1.4 : 1}"/><text x="${GX0 - 7}" y="${yOf(v) + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#8B95A1">${v < 0 ? "−" + Math.abs(v) : v}</text>`).join("")}
    <text x="4" y="14" font-size="11" font-weight="800" fill="${M3.sub}">℃</text>
    <text x="${GX0 + GW / 2}" y="${GY0 + GH + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">냉각 시간</text>
    <polyline class="frz-line" points="" stroke="${M3.cold}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="frz-win">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="8" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="1.6"/>
      ${liqP.map((p, i) => `<circle class="frz-p mt3-p" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.8" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.1"/>`).join("")}
      <text class="frz-read" x="${WIN.x + WIN.w / 2}" y="${WIN.y + WIN.h + 14}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${M3.cold}">20℃ · 물</text>
    </g>
    <g class="frz-zone mt3-zone" opacity="0"><rect x="${xOf(13)}" y="${yOf(0) - 26}" width="86" height="20" rx="10" fill="#EEF4FF" stroke="${M3.cold}" stroke-width="1.6"/><text x="${xOf(13) + 43}" y="${yOf(0) - 12}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${M3.cold}">물이 어는 중</text></g>
  </svg>`;
  const board = el("div", { class: "mt3-board frz-board" }, graph);

  const btn = m3Btn("frz-btn", "센서 연결하고 냉각 시작");
  const slot = m3Slot(tm, "frz-q", btn);

  const read = graph.querySelector(".frz-read") as SVGTextElement;
  const pEls = Array.from(graph.querySelectorAll<SVGCircleElement>(".frz-p"));
  const line = graph.querySelector(".frz-line") as SVGPolylineElement;
  const zone = graph.querySelector(".frz-zone") as SVGGElement;
  const pts: string[] = [];
  let i = 0;
  let prog = 0; // 응고 진행(0~1)

  function jitter(): void {
    if (!tm.alive()) return;
    const amp = 2.4 - 1.8 * prog;
    pEls.forEach((c, k) => {
      const a: Pt = liqP[k], b: Pt = solP[k];
      c.setAttribute("cx", (a.x + (b.x - a.x) * prog + (rnd() - 0.5) * amp).toFixed(1));
      c.setAttribute("cy", (a.y + (b.y - a.y) * prog + (rnd() - 0.5) * amp).toFixed(1));
    });
    tm.later(jitter, 170);
  }

  function tick(): void {
    const T = tOf(i);
    read.textContent = `${m3Deg(T)} · ${stateName(i)}`;
    pts.push(`${xOf(i).toFixed(1)},${yOf(T).toFixed(1)}`);
    line.setAttribute("points", pts.join(" "));
    if (i > 12 && i <= 28) {
      prog = (i - 12) / 16;
      if (i === 14) zone.setAttribute("opacity", "1");
    }
    if (i === 28) helper.innerHTML = "어는 동안 곡선이 <b>0℃에서 평평</b>했어요. 다 얼자 다시 내려가기 시작하네요.";
    i += 1;
    if (i > N) {
      goals.collect("watch", "0℃로 일정!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "냉각 끝. 내려가다가 <b>어는 동안은 0℃로 일정</b>, 다 얼고 나서 다시 내려갔어요.";
      tm.later(askTemp, 700);
      return;
    }
    tm.later(tick, TICK_MS);
  }

  function askTemp(): void {
    slot.ask(
      "물이 <b>어는 동안</b> 온도는?",
      [
        { t: "일정하게 유지되었다", ok: true },
        { t: "계속 천천히 내려갔다", ok: false },
        { t: "잠깐 올랐다가 내려갔다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 어는 동안은 <b>일정</b>했어요. 이 동안 열에너지는 어떻게 되고 있었을까요?"
          : "평평한 구간을 보세요. 어는 동안 온도는 <b>일정</b>했어요. 이 동안 열에너지는 어떻게 되고 있었을까요?";
        goals.collect("temp", ok ? "정확한 판정!" : "판정 완료");
        tm.later(askEnergy, 1400);
      },
    );
  }

  function askEnergy(): void {
    slot.ask(
      "어는 동안 온도가 일정했던 까닭은?",
      [
        { t: "얼음으로 변하는 동안 열에너지를 방출하기 때문", ok: true },
        { t: "얼음으로 변하는 동안 열에너지를 흡수하기 때문", ok: false },
        { t: "얼음과 소금이 열에너지를 주지 않기 때문", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 어는 동안 내보낸(<b>방출</b>한) 열에너지가 상태 변화 몫이라 온도가 그대로였어요."
          : "냉각 중이니 흡수가 아니라 <b>방출</b>이에요. 내보낸 열에너지가 상태 변화 몫이라 온도가 그대로였죠.";
        goals.collect("energy", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (i > 0 || btn.disabled) return;
    haptic(HAPTIC.tap);
    btn.disabled = true;
    btn.textContent = "냉각 중…";
    helper.innerHTML = "센서 연결! 온도 표시와 곡선, 입자 창을 함께 보세요.";
    tm.later(tick, 300);
  });

  host.append(goals.chips, helper, board, slot.el);

  jitter();
  api.setCTA("센서를 연결해서 냉각을 시작하세요", { enabled: false });
  return () => tm.clear();
};
