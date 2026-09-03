// [중1 Ⅲ v3] L4 heatRaceLab — 「물 vs 식용유 가열 레이스」(교과서 탐구 재현).
// 한 통찰: 질량이 같은 두 물질에 같은 양의 열을 주어도 온도가 변하는 정도는 물질마다 다르다.
// 식용유는 빨리 데워지고 빨리 식으며, 물은 천천히 데워지고 천천히 식는다(비열 명명은 concept에서).
// 조작: 버튼 1개(가열 → 불 끄고 식히기). 두 곡선이 점점이 자란다.
// 한 화면 예산(2026-09-03): 비커 장면 + 그래프 세로 쌓기를 버리고 그래프 한 장 안에 작은 비커 2개(온도 표시 겸용,
// 곡선이 지나지 않는 좌상단 빈 자리). 판정은 버튼 자리에 교체.
// 목표 3: 가열 관찰 → 온도 변화 판정 → 냉각 관찰·열량 판정.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { H3, tempColor, beakerSvg, flameSvg } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3Btn, h3Goals, h3Helper, h3Slot, h3Timers } from "./h3Lab";

interface HrlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const T0 = 20;
const N_HEAT = 24;
const N_COOL = 20;
const GX0 = 42, GY0 = 16, GW = 284, GH = 132;
const yOf = (T: number): number => GY0 + GH - (T / 100) * GH;
const xOf = (i: number): number => GX0 + 6 + (i / (N_HEAT + N_COOL)) * (GW - 12);

export const heatRaceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as HrlStep;
  const tm = h3Timers();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = h3Goals(
    [
      { id: "heat", name: "가열 관찰", sub: "같은 불로" },
      { id: "judge", name: "온도 변화", sub: "3분 뒤 판정" },
      { id: "cool", name: "냉각 관찰", sub: "불을 끈 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 같은 열을 주어도 <b>식용유의 온도 변화가 훨씬 커요</b>. 물질마다 다른 이 성질에 이름을 붙일 차례예요.";
      api.enableCTA(s.cta ?? "이 성질의 이름 알아보기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = h3Helper("<b>물 200 g</b>과 <b>식용유 200 g</b>을 같은 가열 장치에 올렸어요. 가열하며 두 온도 곡선을 비교해요.");

  const graph = el("div", { class: "hrl-graph" });
  graph.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="${GX0}" y1="${GY0 - 4}" x2="${GX0}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${GX0}" y1="${GY0 + GH}" x2="${GX0 + GW + 6}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[0, 20, 40, 60, 80, 100].map((v) => `<line x1="${GX0 - 4}" y1="${yOf(v)}" x2="${GX0 + GW}" y2="${yOf(v)}" stroke="#EEF0F3" stroke-width="1"/><text x="${GX0 - 7}" y="${yOf(v) + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#8B95A1">${v}</text>`).join("")}
    <text x="4" y="14" font-size="11" font-weight="800" fill="${H3.sub}">℃</text>
    <text x="${GX0 + GW / 2}" y="${GY0 + GH + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="${H3.sub}">시간</text>
    <line class="hrl-offline" x1="${xOf(N_HEAT)}" y1="${GY0}" x2="${xOf(N_HEAT)}" y2="${GY0 + GH}" stroke="#C9D3DE" stroke-width="1.5" stroke-dasharray="4 4" opacity="0"/>
    <text class="hrl-offtxt" x="${xOf(N_HEAT) + 4}" y="${GY0 + 10}" font-size="10" font-weight="800" fill="#8B95A1" opacity="0">불 끔</text>
    <polyline class="hrl-wline" points="" stroke="${H3.water}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="hrl-oline" points="" stroke="${H3.oil}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="hrl-inset">
      <text class="hrl-wread" x="67" y="28" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1C7ED6">물 20℃</text>
      <text class="hrl-oread" x="115" y="28" text-anchor="middle" font-size="10.5" font-weight="800" fill="#B8860B">식용유 20℃</text>
      ${beakerSvg(52, 34, 30, 36, H3.water, "hrlw", 0.7)}
      ${beakerSvg(100, 34, 30, 36, H3.oil, "hrlo", 0.7)}
      ${flameSvg(67, 84, 0.4, "hrlfw")}
      ${flameSvg(115, 84, 0.4, "hrlfo")}
    </g>
    <text x="${GX0 + GW - 2}" y="${yOf(36) + 14}" text-anchor="end" font-size="10.5" font-weight="800" fill="#1C7ED6">물</text>
    <text x="${GX0 + GW - 2}" y="${yOf(45) - 6}" text-anchor="end" font-size="10.5" font-weight="800" fill="#B8860B">식용유</text>
  </svg>`;
  const board = el("div", { class: "ht3-board hrl-board" }, graph);

  const btn = h3Btn("hrl-btn", "가열 시작");
  const slot = h3Slot(tm, "hrl-q", btn);

  const wRead = graph.querySelector(".hrl-wread") as SVGTextElement;
  const oRead = graph.querySelector(".hrl-oread") as SVGTextElement;
  const wLiq = graph.querySelector(".hrlw-liq") as SVGRectElement;
  const oLiq = graph.querySelector(".hrlo-liq") as SVGRectElement;
  const wLine = graph.querySelector(".hrl-wline") as SVGPolylineElement;
  const oLine = graph.querySelector(".hrl-oline") as SVGPolylineElement;
  const offLine = graph.querySelector(".hrl-offline") as SVGLineElement;
  const offTxt = graph.querySelector(".hrl-offtxt") as SVGTextElement;

  const wPts: string[] = [];
  const oPts: string[] = [];
  let idx = 0;
  let phase: "idle" | "heat" | "ask" | "cool" | "done" = "idle";

  function paint(w: number, o: number): void {
    wRead.textContent = `물 ${Math.round(w)}℃`;
    oRead.textContent = `식용유 ${Math.round(o)}℃`;
    wLiq.setAttribute("fill", tempColor(0.2 + 0.6 * (w / 100)));
    oLiq.setAttribute("fill", tempColor(0.3 + 0.6 * (o / 100)));
    wPts.push(`${xOf(idx).toFixed(1)},${yOf(w).toFixed(1)}`);
    oPts.push(`${xOf(idx).toFixed(1)},${yOf(o).toFixed(1)}`);
    wLine.setAttribute("points", wPts.join(" "));
    oLine.setAttribute("points", oPts.join(" "));
  }

  let sub = 0;
  let wEnd = T0, oEnd = T0;
  function tickHeat(): void {
    if (phase !== "heat") return;
    const w = T0 + sub * 1.0;
    const o = T0 + sub * 2.0;
    paint(w, o);
    idx += 1;
    sub += 1;
    if (sub > N_HEAT) {
      wEnd = w;
      oEnd = o;
      phase = "ask";
      goals.collect("heat", "3분 관찰!");
      haptic(HAPTIC.correct);
      helper.innerHTML = `3분 뒤. 물은 <b>${Math.round(w)}℃</b>, 식용유는 <b>${Math.round(o)}℃</b>. 같은 불로 같은 시간인데 차이가 크네요.`;
      tm.later(askJudge, 700);
      return;
    }
    tm.later(tickHeat, 160);
  }
  function tickCool(): void {
    if (phase !== "cool") return;
    const k = 1 - Math.exp(-sub / 7);
    const w = wEnd - (wEnd - T0) * 0.32 * k;
    const o = oEnd - (oEnd - T0) * 0.62 * k;
    paint(w, o);
    idx += 1;
    sub += 1;
    if (sub > N_COOL) {
      phase = "done";
      haptic(HAPTIC.correct);
      helper.innerHTML = "불을 끄자 <b>식용유가 훨씬 빨리 식었어요</b>. 물은 천천히 데워지고 천천히 식네요.";
      tm.later(askHeat, 700);
      return;
    }
    tm.later(tickCool, 170);
  }

  function askJudge(): void {
    slot.ask(
      "같은 열을 받았는데, <b>온도가 더 많이 오른</b> 것은?",
      [
        { t: "식용유", ok: true },
        { t: "물", ok: false },
        { t: "둘이 똑같이 올랐다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "맞아요! 같은 열을 받아도 <b>식용유의 온도 변화가</b> 물보다 커요. 식힐 때는? <b>불을 끄고</b> 보세요."
          : "더 가파르게 오른 쪽은 <b>식용유</b>예요. 같은 열을 받아도 온도 변화가 물보다 크죠. 이제 <b>불을 끄고</b> 식혀요.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
        btn.disabled = false;
        btn.textContent = "불 끄고 식히기";
        slot.showBtn();
      },
    );
  }

  function askHeat(): void {
    slot.ask(
      "물과 식용유를 <b>같은 온도만큼</b> 높이려면, 열이 더 많이 필요한 쪽은?",
      [
        { t: "물", ok: true },
        { t: "식용유", ok: false },
        { t: "둘이 똑같다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 물은 온도가 잘 안 변하니 같은 만큼 올리려면 <b>더 많은 열</b>이 필요해요."
          : "식용유는 조금만 데워도 금방 뜨거워졌죠? 온도가 잘 안 변하는 <b>물에 더 많은 열</b>이 필요해요.";
        goals.collect("cool", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (phase === "idle") {
      phase = "heat";
      sub = 0;
      haptic(HAPTIC.tap);
      board.classList.add("heating");
      btn.disabled = true;
      btn.textContent = "가열 중…";
      helper.innerHTML = "가열 시작! 두 온도와 그래프를 비교해 보세요.";
      paint(T0, T0);
      idx += 1;
      sub = 1;
      tm.later(tickHeat, 300);
    } else if (phase === "ask" && goals.has("judge")) {
      phase = "cool";
      sub = 1;
      haptic(HAPTIC.tap);
      board.classList.remove("heating");
      offLine.setAttribute("opacity", "1");
      offTxt.setAttribute("opacity", "1");
      btn.disabled = true;
      btn.textContent = "식히는 중…";
      helper.innerHTML = "불을 껐어요. 어느 쪽이 더 빨리 식을까요?";
      tm.later(tickCool, 300);
    }
  });

  host.append(goals.chips, helper, board, slot.el);

  api.setCTA("가열 시작 버튼을 누르세요", { enabled: false });
  return () => tm.clear();
};
