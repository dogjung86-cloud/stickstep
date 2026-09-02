// [중1 Ⅲ v3] L3 rodRaceLab — 「열화상 카메라, 막대 세 개의 경주」(교과서 탐구: 물체에서 열의 전도 비교).
// 한 통찰: 전도는 입자 운동이 이웃 입자에 차례로 전달되는 것이고, 전도되는 정도는 물질마다 다르다
// (금속 > 유리, 금속끼리도 구리 > 철).
// 조작: 버튼 1개(가열 시작). 열화상 화면에서 세 막대의 붉은 앞머리가 다른 속도로 전진한다.
// 목표 3: 가열 관찰 → 가장 빠른 막대 판정 → 전도 원리 판정.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { flameSvg } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3AskBox, h3Goals, h3Helper, h3Timers } from "./h3Lab";

interface RrlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const RODS: { id: string; name: string; speed: number }[] = [
  { id: "cu", name: "구리 막대", speed: 1 },
  { id: "fe", name: "철 막대", speed: 0.5 },
  { id: "gl", name: "유리 막대", speed: 0.1 },
];
const N = 24;
const ROD_X = 70;
const ROD_W = 236;

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
      helper.innerHTML =
        "정리! <b>전도</b>는 입자 운동이 <b>이웃한 입자에 차례로</b> 전달되어 열이 이동하는 방식이에요(입자는 제자리). 열이 전도되는 정도는 <b>물질마다 달라서</b> 유리·나무보다 <b>금속</b>에서 잘 이동하고, 같은 금속이라도 구리가 철보다 빨라요.";
      api.enableCTA(s.cta ?? "다른 이동 방식 알아보기");
    },
  );
  const helper = h3Helper("<b>구리·철·유리 막대</b>의 한쪽 끝을 같은 불로 가열하면서 <b>열화상 카메라</b>로 찍어요. 화면에서 뜨거운 곳은 빨갛게, 차가운 곳은 파랗게 보여요. 어느 막대가 가장 빨리 뜨거워질까요?");

  const stage = el("div", { class: "rrl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 184" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="0" y="0" width="340" height="184" rx="16" fill="#101A33"/>
    <defs>
      <linearGradient id="rrlHot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#F03E3E"/><stop offset="0.6" stop-color="#FF922B"/><stop offset="1" stop-color="#FFE066"/>
      </linearGradient>
    </defs>
    <rect x="12" y="12" width="70" height="18" rx="6" fill="#1E2A4A"/>
    <text x="47" y="25" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8FA3C8">열화상 카메라</text>
    <text class="rrl-clock" x="326" y="25" text-anchor="end" font-size="11" font-weight="800" fill="#DCE8F5">0초</text>
    ${flameSvg(44, 154, 1.1, "rrl")}
    <rect x="30" y="154" width="28" height="8" rx="3" fill="#4E5968"/>
    ${RODS.map((r, i) => {
      const y = 44 + i * 40;
      return `<rect x="${ROD_X}" y="${y}" width="${ROD_W}" height="20" rx="6" fill="#3B5BDB"/>
        <rect class="rrl-front" data-id="${r.id}" x="${ROD_X}" y="${y}" width="2" height="20" rx="6" fill="url(#rrlHot)"/>
        <text x="${ROD_X + ROD_W}" y="${y + 33}" text-anchor="end" font-size="11" font-weight="800" fill="#DCE8F5">${r.name}</text>`;
    }).join("")}
    <rect x="12" y="160" width="104" height="14" rx="4" fill="url(#rrlHot)"/>
    <text x="64" y="171" text-anchor="middle" font-size="9" font-weight="800" fill="#101A33">뜨거움 ← → 덜 뜨거움</text>
  </svg>`;
  const board = el("div", { class: "ht3-board ht3-dark rrl-board" }, stage);

  const btn = el("button", { class: "ht3-btn rrl-btn", text: "가열 시작", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "ht3-btnrow" }, btn);
  const qBox = h3AskBox("rrl-q");

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
      btn.textContent = "경주 끝";
      haptic(HAPTIC.correct);
      helper.innerHTML = "2분이 지났어요. 구리는 끝까지 빨갛고, 철은 절반쯤, 유리는 불 옆만 겨우 뜨거워졌네요.";
      tm.later(askFast, 700);
      return;
    }
    tm.later(tick, 150);
  }

  function askFast(): void {
    b4Ask(
      qBox,
      "열이 <b>가장 빨리</b> 전달된 막대는 무엇인가요?",
      [
        { t: "구리 막대", ok: true },
        { t: "철 막대", ok: false },
        { t: "유리 막대", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "맞아요! 열은 유리보다 <b>금속</b>에서 잘 이동하고, 같은 금속이라도 <b>구리가 철보다</b> 빨라요. 그런데 막대 속에서는 대체 무슨 일이 일어나는 걸까요?"
          : "붉은 앞머리가 가장 멀리 간 막대를 보세요. <b>구리 막대</b>예요. 열은 유리보다 금속에서 잘 이동하고, 같은 금속이라도 구리가 철보다 빨라요. 그런데 막대 속에서는 무슨 일이 일어나는 걸까요?";
        goals.collect("fast", ok ? "정확한 판정!" : "판정 완료");
        tm.later(askWhy, 1300);
      },
    );
  }

  function askWhy(): void {
    b4Ask(
      qBox,
      "가열한 끝에서 반대쪽 끝까지 열이 이동할 때, 막대 속 <b>입자</b>는 어떻게 움직일까요?",
      [
        { t: "제자리에서 흔들리며 이웃 입자에 운동을 차례로 전달한다", ok: true },
        { t: "입자가 막대를 따라 반대쪽 끝으로 이동한다", ok: false },
        { t: "입자와 관계없이 열이 물질을 통하지 않고 직접 간다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 가열한 곳의 입자가 활발해지면 <b>옆 입자도 덩달아 활발</b>해지고, 그 옆으로 또 전달되죠. 입자는 제자리에서 흔들릴 뿐이에요. 이 방식이 <b>전도</b>랍니다."
          : "고체 막대의 입자는 자리를 옮기지 못해요. 가열한 곳의 입자가 활발해지면 <b>옆 입자도 덩달아 활발</b>해지고, 그 옆으로 차례로 전달되죠. 물질을 통하지 않는 방식은 따로 있어요(뒤에서!).";
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
    helper.innerHTML = "가열 시작! 세 막대의 <b>붉은 앞머리</b>가 얼마나 빨리 앞으로 나가는지 비교해 보세요.";
    tm.later(tick, 350);
  });

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("가열 시작 버튼을 누르세요", { enabled: false });
  return () => tm.clear();
};
