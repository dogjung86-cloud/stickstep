// [중1 Ⅲ v3] L3 rodRaceLab — 「막대 세 개의 경주」(교과서 탐구: 물체에서 열의 전도 비교, 열화상 카메라).
// 한 통찰: 전도는 입자 운동이 이웃 입자에 차례로 전달되는 것이고, 전도되는 정도는 물질마다 다르다
// (금속 > 유리, 금속끼리도 구리 > 철).
// 조작: 버튼 1개(가열 시작). 열화상 화면에서 세 막대의 붉은 앞머리가 다른 속도로 전진한다.
// 한 화면 예산: 무대 340×180(막대 3·이름·불꽃·시계만 — 카메라 라벨·색 범례 제거, helper가 말한다).
// 목표 3: 가열 관찰 → 가장 빠른 막대 판정 → 전도 원리 판정.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { flameSvg } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3Btn, h3Goals, h3Helper, h3Slot, h3Timers } from "./h3Lab";

interface RrlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const RODS: { id: string; name: string; speed: number }[] = [
  { id: "cu", name: "구리", speed: 1 },
  { id: "fe", name: "철", speed: 0.5 },
  { id: "gl", name: "유리", speed: 0.1 },
];
const N = 24;
const ROD_X = 72;
const ROD_W = 232;

export const rodRaceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RrlStep;
  const tm = h3Timers();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = h3Goals(
    [
      { id: "watch", name: "가열 관찰", sub: "버튼을 눌러" },
      { id: "fast", name: "빠른 막대", sub: "경주가 끝난 뒤" },
      { id: "why", name: "전도 원리", sub: "막대 판정 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! <b>전도</b>는 입자 운동이 이웃 입자에 <b>차례로</b> 전달되는 방식이고, 정도는 물질마다 달라요.";
      api.enableCTA(s.cta ?? "다른 이동 방식 알아보기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = h3Helper("<b>구리·철·유리</b> 막대의 한쪽 끝을 같은 불로 가열해요. 열화상 화면에서 뜨거운 곳은 빨갛게 보여요.");

  const stage = el("div", { class: "rrl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="0" y="0" width="340" height="180" fill="#101A33"/>
    <defs>
      <linearGradient id="rrlHot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#F03E3E"/><stop offset="0.6" stop-color="#FF922B"/><stop offset="1" stop-color="#FFE066"/>
      </linearGradient>
    </defs>
    <text class="rrl-clock" x="326" y="22" text-anchor="end" font-size="11" font-weight="800" fill="#DCE8F5">0초</text>
    ${flameSvg(48, 166, 0.9, "rrl")}
    <rect x="36" y="166" width="24" height="7" rx="3" fill="#4E5968"/>
    ${RODS.map((r, i) => {
      const y = 30 + i * 46;
      return `<rect x="${ROD_X}" y="${y}" width="${ROD_W}" height="18" rx="6" fill="#3B5BDB"/>
        <rect class="rrl-front" data-id="${r.id}" x="${ROD_X}" y="${y}" width="2" height="18" rx="6" fill="url(#rrlHot)"/>
        <text x="${ROD_X + ROD_W}" y="${y + 32}" text-anchor="end" font-size="11" font-weight="800" fill="#DCE8F5">${r.name}</text>`;
    }).join("")}
  </svg>`;
  const board = el("div", { class: "ht3-board ht3-dark rrl-board" }, stage);

  const btn = h3Btn("rrl-btn", "가열 시작");
  const slot = h3Slot(tm, "rrl-q", btn);

  const fronts = new Map<string, SVGRectElement>();
  stage.querySelectorAll<SVGRectElement>(".rrl-front").forEach((r) => fronts.set(r.dataset.id ?? "", r));
  const clock = stage.querySelector(".rrl-clock") as SVGTextElement;

  let i = 0;
  function tick(): void {
    i += 1;
    const p = i / N;
    for (const r of RODS) {
      const w = Math.min(ROD_W, 2 + ROD_W * Math.min(1, p * r.speed * 1.06));
      fronts.get(r.id)?.setAttribute("width", w.toFixed(1));
    }
    clock.textContent = `${Math.round(i * 5)}초`;
    if (i >= N) {
      goals.collect("watch", "경주 끝!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "2분 뒤. 구리는 끝까지 빨갛고, 철은 절반쯤, 유리는 불 옆만 겨우 뜨거워졌네요.";
      tm.later(askFast, 700);
      return;
    }
    tm.later(tick, 150);
  }

  function askFast(): void {
    slot.ask(
      "열이 <b>가장 빨리</b> 전달된 막대는?",
      [
        { t: "구리 막대", ok: true },
        { t: "철 막대", ok: false },
        { t: "유리 막대", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "맞아요! 유리보다 <b>금속</b>에서, 금속 중에도 <b>구리</b>가 철보다 빨라요. 막대 속에선 무슨 일이?"
          : "붉은 앞머리가 가장 멀리 간 <b>구리</b>예요. 유리보다 금속이, 금속 중에도 구리가 빨라요. 막대 속에선 무슨 일이?";
        goals.collect("fast", ok ? "정확한 판정!" : "판정 완료");
        tm.later(askWhy, 1300);
      },
    );
  }

  function askWhy(): void {
    slot.ask(
      "열이 막대를 따라 이동할 때, 막대 속 <b>입자</b>는?",
      [
        { t: "제자리에서 흔들리며 이웃에 차례로 전달한다", ok: true },
        { t: "막대를 따라 반대쪽 끝으로 이동한다", ok: false },
        { t: "입자와 관계없이 열이 직접 간다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 활발해진 입자가 <b>옆 입자를 덩달아</b> 흔들고, 그 옆으로 또 전달돼요. 이게 <b>전도</b>예요."
          : "고체 입자는 자리를 옮기지 못해요. <b>옆 입자를 덩달아</b> 흔들어 차례로 전달할 뿐이죠. 이게 <b>전도</b>예요.";
        goals.collect("why", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (i > 0) return;
    haptic(HAPTIC.tap);
    btn.disabled = true;
    btn.textContent = "가열 중…";
    board.classList.add("heating");
    helper.innerHTML = "가열 시작! 세 막대의 <b>붉은 앞머리</b>가 얼마나 빨리 나가는지 비교해요.";
    tm.later(tick, 350);
  });

  host.append(goals.chips, helper, board, slot.el);

  api.setCTA("가열 시작 버튼을 누르세요", { enabled: false });
  return () => tm.clear();
};
