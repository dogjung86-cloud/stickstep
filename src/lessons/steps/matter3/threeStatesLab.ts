// [중1 Ⅳ v3] L2 threeStatesLab — 「세 가지 상태 관찰소」(메타볼 무대 재사용 — 단원의 정체성).
// 한 통찰: 고체·액체·기체는 입자의 배열(거리·규칙성)과 운동의 자유로움이 달라서 모양·부피가 다르게 행동한다.
// 조작: 상태 세그 3개(고체·액체·기체 = 온도 -20·40·130℃로 시뮬 구동) + 그릇 세그 2개(좁은 컵 ↔ 넓은 통).
//       '입자의 눈' 토글은 무대(matterStage)가 제공. 목표 판정은 애니메이션이 아니라 상태값(상태 3종 방문·그릇 전환)으로
//       해서 QA 프리즈 환경에서도 완주된다. 렌더 루프(rAF)는 이 스텝이 소유하고 cleanup에서 stage.dispose().
// 한 화면 예산: 무대 172px, 세그 라벨 줄 제거(버튼 이름이 곧 설명), 판정은 세그 두 줄 자리에 교체.
// 목표 3: 세 상태 관찰 → 그릇 바꾸기 → 판정(b4Ask).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { createLoop } from "../../../core/anim";
import { curioCard, type Curio } from "../../../ui/curio";
import { createMatterStage, type MatterStage } from "../../../ui/matterStage";
import type { SimBounds } from "../../../engine/matterSim";
import type { StepRenderer } from "../../types";
import { m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

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

const cupWalls = (w: number, h: number): SimBounds => ({ x0: w * 0.33, y0: h * 0.1, x1: w * 0.67, y1: h * 0.8 });
const boxWalls = (w: number, h: number): SimBounds => ({ x0: w * 0.08, y0: h * 0.36, x1: w * 0.92, y1: h * 0.8 });

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
      helper.innerHTML = "정리! 고체는 제자리, 액체는 가까이 붙은 채 자유롭게, 기체는 멀리 떨어져 사방으로 움직여요.";
      api.enableCTA(s.cta ?? "세 상태 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper("좁은 컵에 <b>얼음(고체)</b>이 있어요. 아래 버튼으로 <b>액체</b>와 <b>기체</b>로 바꿔 보세요.");

  let vessel: Vessel = "cup";
  let state: StateKey = "solid";
  const visited = new Set<StateKey>(["solid"]);

  const stage: MatterStage = createMatterStage({
    height: "172px",
    sim: { temp: STATE_T.solid, count: 44, r: 6.5, cols: 8, walls: cupWalls },
    cap: "입자 44개",
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

  const bSolid = el("button", { class: "mt3-seg m3s-state on", text: "고체", attrs: { type: "button", "data-state": "solid" } }) as HTMLButtonElement;
  const bLiquid = el("button", { class: "mt3-seg m3s-state", text: "액체", attrs: { type: "button", "data-state": "liquid" } }) as HTMLButtonElement;
  const bGas = el("button", { class: "mt3-seg m3s-state", text: "기체", attrs: { type: "button", "data-state": "gas" } }) as HTMLButtonElement;
  const stateRow = el("div", { class: "mt3-segrow three" }, bSolid, bLiquid, bGas);
  const bCup = el("button", { class: "mt3-seg m3s-vessel on", text: "좁은 컵", attrs: { type: "button", "data-vessel": "cup" } }) as HTMLButtonElement;
  const bBox = el("button", { class: "mt3-seg m3s-vessel", text: "넓은 통", attrs: { type: "button", "data-vessel": "box" } }) as HTMLButtonElement;
  const vesselRow = el("div", { class: "mt3-segrow" }, bCup, bBox);
  const rows = el("div", { class: "m3s-rows" }, stateRow, vesselRow);
  const slot = m3Slot(tm, "m3s-q", rows);

  const STATE_LINE: Record<StateKey, string> = {
    solid: "<b>고체</b>: 입자가 규칙적으로 빽빽하게 모여 <b>제자리에서만</b> 흔들려요.",
    liquid: "<b>액체</b>: 입자가 서로 가까이 있지만 자리를 바꾸며 <b>비교적 자유롭게</b> 움직여요.",
    gas: "<b>기체</b>: 입자 사이가 <b>매우 멀고</b> 사방으로 자유롭게 날아다녀요.",
  };
  const VESSEL_LINE: Record<StateKey, string> = {
    solid: "넓은 통에서도 고체는 <b>모양 그대로</b>예요. 입자들이 제자리를 지키니까요.",
    liquid: "액체는 바닥에 넓게 퍼졌지만 <b>부피는 그대로</b>예요. 모양만 그릇을 따라갔죠.",
    gas: "기체는 <b>통 전체</b>로 퍼져요. 부피도 그릇을 따라 커졌죠.",
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
    helper.innerHTML = STATE_LINE[k];
    if (visited.size === 3 && !goals.has("states")) {
      goals.collect("states", "셋 다 관찰!");
      tm.later(() => { if (vessel !== "box") helper.innerHTML = "셋 다 봤어요! 이번엔 그릇을 <b>넓은 통</b>으로 바꿔 보세요."; }, 900);
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
      helper.innerHTML = VESSEL_LINE[state];
      if (goals.has("states") && !goals.has("vessel")) {
        goals.collect("vessel", "넓은 통!");
        tm.later(askJudge, 1500);
      }
    } else {
      helper.innerHTML = STATE_LINE[state];
    }
  }
  bSolid.addEventListener("click", () => pickState("solid", bSolid));
  bLiquid.addEventListener("click", () => pickState("liquid", bLiquid));
  bGas.addEventListener("click", () => pickState("gas", bGas));
  bCup.addEventListener("click", () => pickVessel("cup", bCup));
  bBox.addEventListener("click", () => pickVessel("box", bBox));

  // 그릇을 먼저 바꾼 상태에서 세 상태를 채우면 판정 개방(순서 무관).
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
    slot.ask(
      "액체는 <b>모양은 변해도 부피는 일정</b>했어요. 왜 그럴까요?",
      [
        { t: "자유롭게 움직이지만 서로 가까이 붙어 있어서", ok: true },
        { t: "사방으로 날아다니며 그릇을 채워서", ok: false },
        { t: "입자가 그릇 모양대로 늘어나서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 액체 입자는 자리를 바꾸며 움직이지만 <b>서로 가까이 붙어</b> 있어 부피는 그대로예요."
          : "사방으로 날아다니는 건 <b>기체</b>예요. 액체 입자는 <b>서로 가까이 붙어</b> 있어 부피가 그대로랍니다.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
      },
      { why: "사방으로 날아다니는 건 <b>기체</b>예요. 액체 입자는 <b>서로 가까이 붙어</b> 있어요." },
    );
  }

  host.append(goals.chips, helper, stageWrap, slot.el);

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
