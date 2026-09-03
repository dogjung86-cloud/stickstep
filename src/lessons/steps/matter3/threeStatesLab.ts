// [중1 Ⅳ v3] L2 threeStatesLab — 「세 가지 상태 관찰소」(메타볼 무대 재사용 — 단원의 정체성).
// 한 통찰: 고체·액체·기체는 입자의 배열(거리·규칙성)과 운동의 자유로움이 달라서 모양·부피가 다르게 행동한다.
// 조작: 상태 세그 3개(고체·액체·기체 = 온도 -20·40·130℃로 시뮬 구동) + 그릇 세그 2개(좁은 컵 ↔ 넓은 통).
//       '입자의 눈' 토글은 무대(matterStage)가 제공. 목표 판정은 애니메이션이 아니라 상태값(상태 3종 방문·그릇 전환)으로
//       해서 QA 프리즈 환경에서도 완주된다. 렌더 루프(rAF)는 이 스텝이 소유하고 cleanup에서 stage.dispose().
// 목표 3: 세 상태 관찰 → 그릇 바꾸기 → 판정(b4Ask).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { createLoop } from "../../../core/anim";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { createMatterStage, type MatterStage } from "../../../ui/matterStage";
import type { SimBounds } from "../../../engine/matterSim";
import type { StepRenderer } from "../../types";
import { m3AskBox, m3Goals, m3Helper, m3Reveal, m3Timers } from "./m3Lab";

interface TsStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type StateKey = "solid" | "liquid" | "gas";
type Vessel = "cup" | "box";
const STATE_T: Record<StateKey, number> = { solid: -20, liquid: 40, gas: 130 };
const STATE_NAME: Record<StateKey, string> = { solid: "고체", liquid: "액체", gas: "기체" };

const cupWalls = (w: number, h: number): SimBounds => ({ x0: w * 0.33, y0: h * 0.09, x1: w * 0.67, y1: h * 0.78 });
const boxWalls = (w: number, h: number): SimBounds => ({ x0: w * 0.08, y0: h * 0.34, x1: w * 0.92, y1: h * 0.78 });

export const threeStatesLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TsStep;
  const tm = m3Timers();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "states", name: "세 상태", sub: "고체·액체·기체" },
      { id: "vessel", name: "그릇 바꾸기", sub: "넓은 통으로" },
      { id: "judge", name: "판정", sub: "둘 다 한 뒤" },
    ],
    () => {
      helper.innerHTML =
        "정리! <b>고체</b>는 입자 사이가 매우 가깝고 규칙적으로 배열되어 제자리에서만 운동해요(모양·부피 일정). <b>액체</b>는 고체보다 멀고 불규칙하며 비교적 자유롭게 운동해요(모양은 그릇 따라, 부피 일정). <b>기체</b>는 매우 멀고 매우 불규칙하며 더욱 자유롭게 운동해서 그릇 전체로 퍼져요(모양·부피 모두 변함).";
      api.enableCTA(s.cta ?? "세 상태 정리하기");
    },
  );
  const helper = m3Helper("좁은 <b>컵</b>에 얼음(고체)이 담겨 있어요. 무대 오른쪽 아래 <b>입자의 눈</b> 버튼으로 입자 배열을 들여다보고, 아래에서 <b>액체</b>와 <b>기체</b>로도 바꿔 보세요.");

  let vessel: Vessel = "cup";
  let state: StateKey = "solid";
  const visited = new Set<StateKey>(["solid"]);

  const stage: MatterStage = createMatterStage({
    height: "236px",
    sim: { temp: STATE_T.solid, count: 44, r: 6.5, cols: 8, walls: cupWalls },
    cap: "입자 44개 · 온도만 바꿔요",
    overlay: (ctx, w, h) => {
      const b = vessel === "cup" ? cupWalls(w, h) : boxWalls(w, h);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      const g = ctx.createLinearGradient(b.x0, 0, b.x1, 0);
      g.addColorStop(0, "rgba(214, 228, 255, 0.9)");
      g.addColorStop(0.5, "rgba(160, 190, 235, 0.55)");
      g.addColorStop(1, "rgba(120, 150, 200, 0.85)");
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(b.x0 - 4, b.y0 - 6);
      ctx.lineTo(b.x0 - 4, b.y1 + 4);
      ctx.lineTo(b.x1 + 4, b.y1 + 4);
      ctx.lineTo(b.x1 + 4, b.y0 - 6);
      ctx.stroke();
      // 뚜껑(점선) — 기체가 새지 않는 닫힌 그릇임을 보여 준다
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "rgba(200, 214, 240, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x0 - 4, b.y0 - 6);
      ctx.lineTo(b.x1 + 4, b.y0 - 6);
      ctx.stroke();
      ctx.setLineDash([]);
      // 유리 하이라이트
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(b.x0 + 8, b.y0 + 16);
      ctx.lineTo(b.x0 + 8, b.y1 - 16);
      ctx.stroke();
      ctx.restore();
    },
    onViewChange: (v) => {
      if (v === "particle") {
        haptic(HAPTIC.select);
        stage.toast("입자의 눈: 배열과 움직임을 보세요");
      }
    },
  });
  const pill = el("div", { class: "mt3-pill", html: "<b>고체</b> · 좁은 컵" });
  stage.hud.appendChild(pill);
  const stageWrap = el("div", { class: "m3s-stage" }, stage.el);

  const segLabel1 = el("div", { class: "mt3-seglabel", text: "상태 고르기" });
  const bSolid = el("button", { class: "mt3-seg m3s-state on", text: "고체", attrs: { type: "button", "data-state": "solid" } }) as HTMLButtonElement;
  const bLiquid = el("button", { class: "mt3-seg m3s-state", text: "액체", attrs: { type: "button", "data-state": "liquid" } }) as HTMLButtonElement;
  const bGas = el("button", { class: "mt3-seg m3s-state", text: "기체", attrs: { type: "button", "data-state": "gas" } }) as HTMLButtonElement;
  const stateRow = el("div", { class: "mt3-segrow three" }, bSolid, bLiquid, bGas);
  const segLabel2 = el("div", { class: "mt3-seglabel", text: "그릇 바꾸기" });
  const bCup = el("button", { class: "mt3-seg m3s-vessel on", text: "좁은 컵", attrs: { type: "button", "data-vessel": "cup" } }) as HTMLButtonElement;
  const bBox = el("button", { class: "mt3-seg m3s-vessel", text: "넓은 통", attrs: { type: "button", "data-vessel": "box" } }) as HTMLButtonElement;
  const vesselRow = el("div", { class: "mt3-segrow" }, bCup, bBox);
  const qBox = m3AskBox("m3s-q mt3-q");

  const STATE_LINE: Record<StateKey, string> = {
    solid: "<b>고체</b>: 입자 사이의 거리가 매우 가깝고 <b>규칙적으로</b> 배열되어 <b>제자리에서만</b> 흔들려요. 그래서 모양도 부피도 일정하죠.",
    liquid: "<b>액체</b>: 입자 사이가 고체보다 멀고 <b>불규칙</b>하며 <b>비교적 자유롭게</b> 움직여요. 흐를 수 있고 그릇 모양을 따라가지만, 서로 가까이 붙어 있어 부피는 일정해요.",
    gas: "<b>기체</b>: 입자 사이가 <b>매우 멀고</b> 매우 불규칙하며 <b>더욱 자유롭게</b> 사방으로 날아다녀요. 그래서 그릇 전체로 퍼져 모양도 부피도 그릇을 따라가요.",
  };
  const VESSEL_LINE: Record<StateKey, string> = {
    solid: "넓은 통으로 옮겨도 고체는 <b>모양 그대로</b>예요. 입자들이 제자리를 지키니까요.",
    liquid: "넓은 통에서 액체는 <b>바닥에 넓게 퍼졌지만</b> 입자 개수는 그대로라 부피는 같아요. 모양만 그릇을 따라갔죠.",
    gas: "넓은 통에서도 기체는 <b>통 전체</b>로 퍼져요. 그릇이 커지면 기체가 차지하는 부피도 함께 커지죠.",
  };

  function syncPill(): void {
    pill.innerHTML = `<b>${STATE_NAME[state]}</b> · ${vessel === "cup" ? "좁은 컵" : "넓은 통"}`;
  }
  function pickState(k: StateKey, btn: HTMLButtonElement): void {
    if (k === state) return;
    haptic(HAPTIC.tap);
    state = k;
    visited.add(k);
    stage.setTemp(STATE_T[k]);
    [bSolid, bLiquid, bGas].forEach((b) => b.classList.toggle("on", b === btn));
    syncPill();
    helper.innerHTML = STATE_LINE[k] + (visited.size < 3 ? " 다른 상태도 눌러 보세요." : "");
    if (visited.size === 3 && !goals.has("states")) {
      goals.collect("states", "셋 다 관찰!");
      tm.later(() => {
        helper.innerHTML += " 이번엔 <b>그릇을 넓은 통으로</b> 바꿔 보세요. 상태마다 어떻게 담기는지 비교해요.";
      }, 900);
    }
  }
  function pickVessel(v: Vessel, btn: HTMLButtonElement): void {
    if (v === vessel) return;
    haptic(HAPTIC.tap);
    vessel = v;
    stage.sim.setWalls(v === "cup" ? cupWalls : boxWalls);
    [bCup, bBox].forEach((b) => b.classList.toggle("on", b === btn));
    syncPill();
    if (v === "box") {
      helper.innerHTML = VESSEL_LINE[state] + " 다른 상태로도 바꿔 보고 비교하세요.";
      if (goals.has("states") && !goals.has("vessel")) {
        goals.collect("vessel", "넓은 통!");
        tm.later(askJudge, 1500);
      } else if (!goals.has("states")) {
        helper.innerHTML += " 세 상태를 다 보고 나면 판정 질문이 나와요.";
      }
    } else {
      helper.innerHTML = "다시 좁은 컵이에요. " + STATE_LINE[state];
    }
  }
  bSolid.addEventListener("click", () => pickState("solid", bSolid));
  bLiquid.addEventListener("click", () => pickState("liquid", bLiquid));
  bGas.addEventListener("click", () => pickState("gas", bGas));
  bCup.addEventListener("click", () => pickVessel("cup", bCup));
  bBox.addEventListener("click", () => pickVessel("box", bBox));

  // 세 상태를 본 뒤 그릇을 바꾸지 않고 있으면 안내만(자동 진행 없음). 그릇을 이미 바꾼 상태에서 세 상태를 채우면 판정 개방.
  const origCollect = goals.collect;
  goals.collect = (id, sub) => {
    origCollect(id, sub);
    if (id === "states" && vessel === "box" && !goals.has("vessel")) {
      origCollect("vessel", "넓은 통!");
      tm.later(askJudge, 1500);
    }
  };

  function askJudge(): void {
    if (goals.has("judge")) return;
    b4Ask(
      qBox,
      "액체는 담는 그릇에 따라 <b>모양은 달라지지만 부피는 일정</b>했어요. 입자로 보면 왜 그럴까요?",
      [
        { t: "입자가 비교적 자유롭게 움직이지만 서로 가까이 붙어 있어서", ok: true },
        { t: "입자가 사방으로 자유롭게 날아다니며 그릇 전체를 채워서", ok: false },
        { t: "입자가 그릇 모양대로 늘어나거나 줄어들어서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 액체의 입자는 자리를 바꾸며 <b>비교적 자유롭게</b> 움직이니 모양이 그릇을 따라가지만, 서로 <b>가까이 붙어</b> 있으니 부피는 그대로예요. 사방으로 날아다니는 건 기체의 이야기죠."
          : "사방으로 자유롭게 날아다니는 건 <b>기체</b>의 입자예요. 입자 자체가 늘어나지도 않고요. 액체의 입자는 자리를 바꾸며 비교적 자유롭게 움직이되 <b>서로 가까이 붙어</b> 있어서, 모양은 변해도 부피는 일정하답니다.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
      },
    );
    m3Reveal(tm, qBox);
  }

  host.append(goals.chips, helper, stageWrap, segLabel1, stateRow, segLabel2, vesselRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // 렌더 루프는 스텝이 소유 — mount 뒤 setTimeout(0)으로 시작(즉시 start는 nav 순서상 즉사, CLAUDE.md 미니게임 함정 ①).
  const loop = createLoop((dt, t) => stage.tick(dt, t));
  let ro: ResizeObserver | null = null;
  tm.later(() => {
    stage.resize();
    loop.start();
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => stage.resize());
      ro.observe(stage.el);
    }
  }, 0);
  api.setCTA("세 상태를 보고 그릇을 바꿔 보세요", { enabled: false });
  return () => {
    tm.clear();
    loop.stop();
    ro?.disconnect();
    stage.dispose();
  };
};
