// [중1 Ⅲ v3] L4 heatRaceLab — 「물 vs 식용유, 온도 센서 가열 레이스」(교과서 탐구 재현).
// 한 통찰: 질량이 같은 두 물질에 같은 양의 열을 주어도 온도가 변하는 정도는 물질마다 다르다.
// 식용유는 빨리 데워지고 빨리 식으며, 물은 천천히 데워지고 천천히 식는다(비열 명명은 concept에서).
// 조작: 버튼 1개(가열 → 불 끄고 식히기). 두 곡선이 점점이 자란다.
// 목표 3: 가열 관찰 → 온도 변화 판정 → 냉각 관찰·열량 판정.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { H3, tempColor, beakerSvg, flameSvg, burnerSvg } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3AskBox, h3Goals, h3Helper, h3Timers } from "./h3Lab";

interface HrlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const T0 = 20;
const N_HEAT = 24;
const N_COOL = 20;
const GX0 = 44, GY0 = 12, GW = 268, GH = 112;
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
      helper.innerHTML =
        "정리! 질량이 같은 물과 식용유에 <b>같은 양의 열</b>을 주어도 <b>식용유의 온도 변화가 훨씬 커요</b>. 온도를 같은 만큼 높이는 데 필요한 열의 양이 물질마다 다르기 때문이죠. 이 성질에 이름을 붙여 볼 차례예요.";
      api.enableCTA(s.cta ?? "이 성질의 이름 알아보기");
    },
  );
  const helper = h3Helper("<b>물 200 g</b>과 <b>식용유 200 g</b>을 똑같은 가열 장치 위에 올리고 온도 센서를 꽂았어요. 아래 버튼으로 <b>가열</b>을 시작하고 두 온도 곡선을 비교해 보세요.");

  const stage = el("div", { class: "hrl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 176" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="170" cy="168" rx="150" ry="6" fill="#2A3A5E" opacity="0.10"/>
    ${beakerSvg(60, 40, 90, 90, H3.water, "hrlw", 0.7)}
    ${beakerSvg(190, 40, 90, 90, H3.oil, "hrlo", 0.7)}
    <path d="M100 18 v50 M100 18 h-14" stroke="${H3.water}" stroke-width="3" stroke-linecap="round"/>
    <path d="M230 18 v50 M230 18 h14" stroke="${H3.oil}" stroke-width="3" stroke-linecap="round"/>
    <rect x="20" y="6" width="62" height="20" rx="8" fill="#FFFFFF" stroke="${H3.water}" stroke-width="2"/>
    <text class="hrl-wread" x="51" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#1C7ED6">20℃</text>
    <rect x="258" y="6" width="62" height="20" rx="8" fill="#FFFFFF" stroke="${H3.oil}" stroke-width="2"/>
    <text class="hrl-oread" x="289" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#B8860B">20℃</text>
    ${flameSvg(105, 150, 0.9, "hrlfw")}${burnerSvg(105, 150, 70)}
    ${flameSvg(235, 150, 0.9, "hrlfo")}${burnerSvg(235, 150, 70)}
    <text x="105" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.sub}">물 200 g</text>
    <text x="235" y="36" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.sub}">식용유 200 g</text>
  </svg>`;
  const graph = el("div", { class: "hrl-graph" });
  graph.innerHTML = `
  <svg viewBox="0 0 340 152" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="${GX0}" y1="${GY0 - 4}" x2="${GX0}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${GX0}" y1="${GY0 + GH}" x2="${GX0 + GW + 6}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[0, 20, 40, 60, 80, 100].map((v) => `<line x1="${GX0 - 4}" y1="${yOf(v)}" x2="${GX0 + GW}" y2="${yOf(v)}" stroke="#E5E8EB" stroke-width="1"/><text x="${GX0 - 8}" y="${yOf(v) + 4}" text-anchor="end" font-size="10" font-weight="700" fill="#8B95A1">${v}</text>`).join("")}
    <text x="12" y="${GY0 + 4}" font-size="10" font-weight="800" fill="${H3.sub}">온도(℃)</text>
    <text x="${GX0 + GW / 2}" y="${GY0 + GH + 22}" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.sub}">시간</text>
    <line class="hrl-offline" x1="${xOf(N_HEAT)}" y1="${GY0}" x2="${xOf(N_HEAT)}" y2="${GY0 + GH}" stroke="#C9D3DE" stroke-width="1.5" stroke-dasharray="4 4" opacity="0"/>
    <text class="hrl-offtxt" x="${xOf(N_HEAT) + 4}" y="${GY0 + 10}" font-size="9.5" font-weight="800" fill="#8B95A1" opacity="0">불 끔</text>
    <polyline class="hrl-wline" points="" stroke="${H3.water}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="hrl-oline" points="" stroke="${H3.oil}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${GX0 + GW - 2}" y="${GY0 + GH - 4}" text-anchor="end" font-size="10" font-weight="800" fill="#1C7ED6">물</text>
    <text x="${GX0 + GW - 2}" y="${GY0 + 12}" text-anchor="end" font-size="10" font-weight="800" fill="#B8860B">식용유</text>
  </svg>`;
  const board = el("div", { class: "ht3-board hrl-board" }, stage, graph);

  const btn = el("button", { class: "ht3-btn hrl-btn", text: "가열 시작", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "ht3-btnrow" }, btn);
  const qBox = h3AskBox("hrl-q");

  const wRead = stage.querySelector(".hrl-wread") as SVGTextElement;
  const oRead = stage.querySelector(".hrl-oread") as SVGTextElement;
  const wLiq = stage.querySelector(".hrlw-liq") as SVGRectElement;
  const oLiq = stage.querySelector(".hrlo-liq") as SVGRectElement;
  const wLine = graph.querySelector(".hrl-wline") as SVGPolylineElement;
  const oLine = graph.querySelector(".hrl-oline") as SVGPolylineElement;
  const offLine = graph.querySelector(".hrl-offline") as SVGLineElement;
  const offTxt = graph.querySelector(".hrl-offtxt") as SVGTextElement;

  const wPts: string[] = [];
  const oPts: string[] = [];
  let idx = 0;
  let phase: "idle" | "heat" | "ask" | "cool" | "done" = "idle";

  function paint(w: number, o: number): void {
    wRead.textContent = `${Math.round(w)}℃`;
    oRead.textContent = `${Math.round(o)}℃`;
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
      helper.innerHTML = `3분이 지났어요. 물은 <b>${Math.round(w)}℃</b>, 식용유는 <b>${Math.round(o)}℃</b>. 같은 불로 같은 시간 데웠는데 차이가 크네요.`;
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
      btn.textContent = "실험 끝";
      haptic(HAPTIC.correct);
      helper.innerHTML = "불을 끄자 <b>식용유가 훨씬 빨리 식었어요</b>. 물은 천천히 데워지고 천천히 식네요. 마지막 질문!";
      tm.later(askHeat, 700);
      return;
    }
    tm.later(tickCool, 170);
  }

  function askJudge(): void {
    b4Ask(
      qBox,
      "같은 양의 열을 받았는데, 같은 시간 동안 <b>온도가 더 많이 오른</b> 것은?",
      [
        { t: "식용유", ok: true },
        { t: "물", ok: false },
        { t: "둘이 똑같이 올랐다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "맞아요! 같은 열을 받아도 <b>식용유의 온도 변화가 물보다 커요</b>. 그럼 식힐 때는 어떨까요? 아래 버튼으로 <b>불을 끄고</b> 지켜보세요."
          : "그래프의 두 선을 다시 보세요. 위로 더 가파르게 오른 쪽은 <b>식용유</b>예요. 같은 열을 받아도 식용유의 온도 변화가 물보다 크답니다. 이제 <b>불을 끄고</b> 식혀 봐요.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
        btn.disabled = false;
        btn.textContent = "불 끄고 식히기";
      },
    );
  }

  function askHeat(): void {
    b4Ask(
      qBox,
      "물과 식용유를 <b>같은 온도만큼</b> 높이려면, 열이 더 많이 필요한 쪽은?",
      [
        { t: "물", ok: true },
        { t: "식용유", ok: false },
        { t: "둘이 똑같다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 물은 온도가 잘 안 변하니, 같은 만큼 올리려면 <b>더 많은 열</b>이 필요해요. 반대로 식용유는 적은 열로도 금방 온도가 오르죠."
          : "거꾸로 생각해 봐요. 식용유는 조금만 데워도 금방 뜨거워졌죠? 그러니 같은 온도만큼 올리려면 온도가 잘 안 변하는 <b>물에 더 많은 열</b>이 필요해요.";
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
      helper.innerHTML = "가열 시작! 두 온도 센서의 숫자와 그래프를 비교해 보세요.";
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

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("가열 시작 버튼을 누르세요", { enabled: false });
  return () => tm.clear();
};
