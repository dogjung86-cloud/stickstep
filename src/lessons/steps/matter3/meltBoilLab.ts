// [중1 Ⅳ v3] L5 meltBoilLab — 「얼음을 끝까지 가열하면」(교과서 탐구: 얼음이 녹고 물이 끓을 때의 온도 측정).
// 한 통찰: 상태가 변하는 동안(녹는 동안·끓는 동안)은 흡수한 열에너지가 모두 상태 변화에 쓰여 온도가 일정하게 유지된다.
// 조작: 가열 시작(버튼) → 곡선이 자라며 두 번의 '온도 일정 구간' → 온도 판정 → 열에너지 판정.
// 한 화면 예산(2026-09-03): 메타볼 무대 + 그래프 세로 쌓기(1.5화면)를 버리고 그래프 한 장 안에 작은 입자 창을 넣었다
// (입자 창은 곡선이 지나지 않는 좌상단 빈 자리 — 얼음→물→수증기 배열 보간). 메타볼은 L2 세 상태 관찰소가 맡는다.
// 목표 판정은 틱 스케줄(상태값)로 — 렌더 루프 없이 자가 예약 setTimeout만 쓴다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { M3, particleGrid, seededRandom, stateParticles, type Pt } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3Btn, m3Deg, m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

interface MblStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N = 60; // 틱 수(= 그래프 가로축 '시간')
const TICK_MS = 190;
const GX0 = 42, GY0 = 16, GW = 284, GH = 132;
const T_MIN = -20, T_MAX = 120;
const yOf = (T: number): number => GY0 + GH - ((T - T_MIN) / (T_MAX - T_MIN)) * GH;
const xOf = (i: number): number => GX0 + 6 + (i / N) * (GW - 12);
const WIN = { x: 54, y: 22, w: 96, h: 54 }; // 입자 창(곡선이 지나지 않는 좌상단)

/** 표시 온도 — 융해 0℃·기화 100℃ 구간이 평평하다. */
function tDisp(i: number): number {
  if (i <= 8) return -10 + (10 * i) / 8;
  if (i <= 22) return 0;
  if (i <= 44) return (100 * (i - 22)) / 22;
  return 100;
}
const stateName = (k: number): string => (k <= 8 ? "얼음" : k <= 22 ? "녹는 중" : k <= 44 ? "물" : k <= 58 ? "끓는 중" : "수증기");

export const meltBoilLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as MblStep;
  const tm = m3Timers();
  const rnd = seededRandom(19);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "melt", name: "녹는 구간", sub: "0℃에서" },
      { id: "boil", name: "끓는 구간", sub: "100℃에서" },
      { id: "judge", name: "판정", sub: "가열이 끝난 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 녹는 동안과 끓는 동안 온도는 <b>일정</b>해요. 흡수한 열에너지가 <b>상태 변화에 모두</b> 쓰이니까요.";
      api.enableCTA(s.cta ?? "흡수하는 상태 변화 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper("비커의 <b>얼음</b>은 지금 −10℃. 가열하면서 온도 곡선이 어떤 모양으로 자라는지 보세요.");

  const solP = stateParticles("solid", WIN.x, WIN.y, WIN.w, WIN.h, rnd, 3.8);
  const liqP = stateParticles("liquid", WIN.x, WIN.y, WIN.w, WIN.h, rnd, 3.8);
  const gasP = particleGrid(6, 2, WIN.x + WIN.w / 2, WIN.y + WIN.h / 2, 15).map((p) => ({ x: p.x + (rnd() - 0.5) * 5, y: p.y + (rnd() - 0.5) * 8 }));

  const graph = el("div", { class: "mbl-graph" });
  graph.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="${GX0}" y1="${GY0 - 4}" x2="${GX0}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${GX0}" y1="${GY0 + GH}" x2="${GX0 + GW + 6}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[0, 40, 80, 100].map((v) => `<line x1="${GX0 - 4}" y1="${yOf(v)}" x2="${GX0 + GW}" y2="${yOf(v)}" stroke="${v === 0 || v === 100 ? "#D9D2FF" : "#EEF0F3"}" stroke-width="${v === 0 || v === 100 ? 1.4 : 1}"/><text x="${GX0 - 7}" y="${yOf(v) + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#8B95A1">${v}</text>`).join("")}
    <text x="4" y="14" font-size="11" font-weight="800" fill="${M3.sub}">℃</text>
    <text x="${GX0 + GW / 2}" y="${GY0 + GH + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">가열 시간</text>
    <polyline class="mbl-line" points="" stroke="${M3.matter}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="mbl-win">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="8" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="1.6"/>
      ${solP.map((p, i) => `<circle class="mbl-p mt3-p" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.8" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.1"/>`).join("")}
      <text class="mbl-read" x="${WIN.x + WIN.w / 2}" y="${WIN.y + WIN.h + 14}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${M3.matterDeep}">−10℃ · 얼음</text>
    </g>
    <g class="mbl-zone mt3-zone mbl-zone-melt" opacity="0"><rect x="${xOf(9)}" y="${yOf(0) - 24}" width="86" height="20" rx="10" fill="#F0ECFF" stroke="${M3.matter}" stroke-width="1.6"/><text x="${xOf(9) + 43}" y="${yOf(0) - 10}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${M3.matterDeep}">얼음이 녹는 중</text></g>
    <g class="mbl-zone mt3-zone mbl-zone-boil" opacity="0"><rect x="${xOf(30)}" y="${yOf(100) + 6}" width="84" height="20" rx="10" fill="#F0ECFF" stroke="${M3.matter}" stroke-width="1.6"/><text x="${xOf(30) + 42}" y="${yOf(100) + 20}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${M3.matterDeep}">물이 끓는 중</text></g>
  </svg>`;
  const board = el("div", { class: "mt3-board mbl-board" }, graph);

  const btn = m3Btn("mbl-btn", "가열 시작");
  const slot = m3Slot(tm, "mbl-q", btn);

  const line = graph.querySelector(".mbl-line") as SVGPolylineElement;
  const zoneMelt = graph.querySelector(".mbl-zone-melt") as SVGGElement;
  const zoneBoil = graph.querySelector(".mbl-zone-boil") as SVGGElement;
  const read = graph.querySelector(".mbl-read") as SVGTextElement;
  const pEls = Array.from(graph.querySelectorAll<SVGCircleElement>(".mbl-p"));
  const pts: string[] = [];
  let i = 0;

  /** 입자 창 배치 — 얼음(격자) → 녹는 중 보간 → 물 → 끓는 중 보간 → 수증기. */
  function layout(k: number): { a: Pt[]; b: Pt[]; t: number; amp: number } {
    if (k <= 8) return { a: solP, b: solP, t: 0, amp: 0.8 };
    if (k <= 22) return { a: solP, b: liqP, t: (k - 8) / 14, amp: 1.4 };
    if (k <= 44) return { a: liqP, b: liqP, t: 0, amp: 2 };
    if (k <= 58) return { a: liqP, b: gasP, t: (k - 44) / 14, amp: 3 };
    return { a: gasP, b: gasP, t: 0, amp: 4 };
  }
  function jitter(): void {
    if (!tm.alive()) return;
    const L = layout(i);
    pEls.forEach((c, k) => {
      const a = L.a[k], b = L.b[k];
      c.setAttribute("cx", (a.x + (b.x - a.x) * L.t + (rnd() - 0.5) * L.amp).toFixed(1));
      c.setAttribute("cy", (a.y + (b.y - a.y) * L.t + (rnd() - 0.5) * L.amp).toFixed(1));
    });
    tm.later(jitter, 160);
  }

  function tick(): void {
    const T = tDisp(i);
    read.textContent = `${m3Deg(T)} · ${stateName(i)}`;
    pts.push(`${xOf(i).toFixed(1)},${yOf(T).toFixed(1)}`);
    line.setAttribute("points", pts.join(" "));
    if (i === 12) zoneMelt.setAttribute("opacity", "1");
    if (i === 22) {
      goals.collect("melt", "0℃로 일정!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "녹는 동안 곡선이 <b>0℃에서 평평</b>했어요. 다 녹자 다시 올라요. 이번엔 끓을 때를 보세요.";
    }
    if (i === 48) zoneBoil.setAttribute("opacity", "1");
    if (i === 58) {
      goals.collect("boil", "100℃로 일정!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "끓는 동안에도 <b>100℃에서 평평</b>해요. 계속 가열해도 온도가 더 오르지 않죠.";
    }
    i += 1;
    if (i > N) {
      helper.innerHTML = "가열 끝. <b>평평한 구간이 두 번</b> 나왔어요. 녹을 때 0℃, 끓을 때 100℃.";
      tm.later(askTemp, 700);
      return;
    }
    tm.later(tick, TICK_MS);
  }

  function askTemp(): void {
    slot.ask(
      "얼음이 <b>녹는 동안</b>과 물이 <b>끓는 동안</b>, 온도는?",
      [
        { t: "일정하게 유지되었다", ok: true },
        { t: "계속 천천히 올랐다", ok: false },
        { t: "잠깐 내려갔다가 올랐다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 상태가 변하는 동안 온도는 <b>일정</b>해요. 그런데 열은 계속 줬죠. 그 열은 어디로 갔을까요?"
          : "평평한 두 구간을 보세요. 온도는 <b>일정</b>했어요. 그런데 열은 계속 줬죠. 그 열은 어디로 갔을까요?";
        tm.later(askEnergy, 1400);
      },
    );
  }

  function askEnergy(): void {
    slot.ask(
      "온도가 일정한 동안 <b>흡수한 열에너지</b>는 어디에 쓰였을까요?",
      [
        { t: "입자 배열을 바꾸는 상태 변화에 모두 쓰였다", ok: true },
        { t: "가열 장치로 다시 되돌아갔다", ok: false },
        { t: "쓰이지 않고 사라졌다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 열에너지가 <b>상태 변화에 모두</b> 쓰여서 온도를 올릴 몫이 남지 않았어요."
          : "되돌아가지도 사라지지도 않았어요. <b>상태 변화에 모두</b> 쓰여서 온도를 올릴 몫이 없었던 거예요.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (i > 0 || btn.disabled) return;
    haptic(HAPTIC.tap);
    btn.disabled = true;
    btn.textContent = "가열 중…";
    helper.innerHTML = "가열 시작! 온도 표시와 곡선, 입자 창을 함께 보세요.";
    tm.later(tick, 300);
  });

  host.append(goals.chips, helper, board, slot.el);

  jitter();
  api.setCTA("가열 시작 버튼을 누르세요", { enabled: false });
  return () => tm.clear();
};
