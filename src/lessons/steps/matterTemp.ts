// matterTemp — 온도-상태 랩(IV 단원 L2). 프로토타입 labTemp의 계승 + 메타볼 무대.
// 슬라이더로 -20~120℃를 오가며: 메타볼(물질 뷰)로는 얼음 덩어리→물방울→수증기 안개,
// "입자의 눈"으로는 입자 배열의 변화가 보인다. 끓이기 + 다시 얼리기(왕복)면 목표 달성.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { createMatterStage } from "../../ui/matterStage";
import { colFor } from "../../renderers/palette";
import type { StepRenderer } from "../types";

interface MatterTempStep {
  title: string;
  lead?: string;
  goalBoil?: number; // 기본 104
  goalFreeze?: number; // 기본 -10
  cta?: string;
}

const T_MIN = -20;
const T_MAX = 120;

export const matterTemp: StepRenderer = (host, step, api) => {
  const s = step as unknown as MatterTempStep;
  const goalBoil = s.goalBoil ?? 104;
  const goalFreeze = s.goalFreeze ?? -10;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대 ----
  const stage = createMatterStage({
    height: "min(300px,36dvh)",
    sim: { count: 48, r: 6.5, temp: T_MIN },
    cap: "지금 -20℃의 물 입자를 보고 있어요",
  });
  const phaseDot = el("span", { class: "pdot" });
  const phaseName = el("span", { text: "고체" });
  const tempNum = el("span", { text: "-20" });
  stage.hud.append(
    el("div", { class: "pill" }, phaseDot, phaseName),
    el("div", { class: "tempread" }, tempNum, el("small", { text: "°C" })),
  );
  const goalChips = el(
    "div",
    { class: "hp-goals" },
    el("span", { class: "hp-goal matter", dataset: { goal: "boil" }, text: "끓이기" }),
    el("span", { class: "hp-goal matter", dataset: { goal: "freeze" }, text: "다시 얼리기" }),
  );
  stage.el.appendChild(goalChips);

  // ---- 온도 슬라이더 (녹는점·끓는점 눈금) ----
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const track = el(
    "div",
    { class: "sl-track" },
    el("div", { class: "sl-tick", style: "left:14.3%" }, el("span", { text: "0° 녹기 시작" })),
    el("div", { class: "sl-tick", style: "left:85.7%" }, el("span", { text: "100° 끓기 시작" })),
    thumb,
  );
  const slider = el(
    "div",
    {
      class: "slider",
      attrs: {
        role: "slider",
        tabindex: "0",
        "aria-label": "물의 온도",
        "aria-valuemin": String(T_MIN),
        "aria-valuemax": String(T_MAX),
        "aria-valuenow": String(T_MIN),
        "aria-valuetext": `${T_MIN}도`,
      },
    },
    track,
  );
  const helper = el("div", {
    class: "helper",
    html: "슬라이더를 밀어 온도를 <b>끝까지 올려</b> 보세요. 지금은 입자들이 규칙적으로 붙은 채 <b>제자리에서 떨고만</b> 있어요.",
  });
  host.append(stage.el, slider, helper);

  // ---- 상태 ----
  let T = T_MIN;
  let doneBoil = false;
  let doneFreeze = false;
  let finished = false;
  let toggleHinted = false;

  const phaseOf = (t: number): "sol" | "liq" | "gas" => (t < 0.5 ? "sol" : t < 100 ? "liq" : "gas");
  const NAMES = { sol: "고체", liq: "액체", gas: "기체" } as const;
  const HELPERS = {
    sol: "입자들이 규칙적으로 붙은 채, <b>제자리에서 떨고만</b> 있어요. 그래서 모양이 변하지 않죠.",
    liq: "입자들이 여전히 붙어 있지만, <b>서로 미끄러지며 자리를 바꿔요</b>. 그래서 흐를 수 있어요.",
    gas: "입자들이 완전히 흩어졌어요. <b>빈 공간 전체를 채우며</b> 사방으로 날아다녀요.",
  } as const;

  function refresh(prev: number | null): void {
    stage.setTemp(T);
    tempNum.textContent = String(Math.round(T));
    const ph = phaseOf(T);
    phaseName.textContent = NAMES[ph];
    phaseDot.style.background = colFor(T, 66, 1);
    phaseDot.style.boxShadow = `0 0 8px ${colFor(T, 60, 0.8)}`;
    (thumb.firstChild as HTMLElement).style.background = colFor(T, 54, 1);
    // 끓이기 목표 전까지는 상태 해설, 그 뒤엔 "다시 얼리기" 미션 안내를 유지
    if (!finished && !doneBoil) helper.innerHTML = HELPERS[ph];
    slider.setAttribute("aria-valuenow", String(Math.round(T)));
    slider.setAttribute("aria-valuetext", `${Math.round(T)}도 — ${NAMES[ph]}`);
    if (prev != null) {
      if (prev < 0 && T >= 0) {
        stage.toast("0℃ — 얼음이 녹기 시작해요");
        haptic(HAPTIC.cross);
      }
      if (prev >= 0 && T < 0) {
        stage.toast("0℃ — 물이 다시 얼기 시작해요");
        haptic(HAPTIC.cross);
      }
      if (prev < 100 && T >= 100) {
        stage.toast("100℃ — 물이 끓어 수증기로!");
        haptic(HAPTIC.cross);
      }
      if (prev >= 100 && T < 100) {
        stage.toast("100℃ — 수증기가 다시 물방울로!");
        haptic(HAPTIC.cross);
      }
    }
    checkGoals();
  }

  function checkGoals(): void {
    if (finished) return;
    if (!doneBoil && T >= goalBoil) {
      doneBoil = true;
      haptic(HAPTIC.ctaUnlock);
      (goalChips.querySelector('[data-goal="boil"]') as HTMLElement).classList.add("on");
      helper.innerHTML =
        "펄펄 끓어요! 입자들이 무대를 가득 채웠죠. 이번엔 반대로, 온도를 <b>-10℃ 아래로</b> 내려 다시 얼려 보세요.";
    }
    if (!doneFreeze && doneBoil && T <= goalFreeze) {
      doneFreeze = true;
      (goalChips.querySelector('[data-goal="freeze"]') as HTMLElement).classList.add("on");
    }
    if (doneBoil && doneFreeze) {
      finished = true;
      helper.innerHTML =
        "왕복 완료! 온도에 따라 <b>같은 물 입자</b>가 얼음도, 물도, 수증기도 됐어요. 입자가 바뀐 게 아니라 <b>움직임과 배열</b>이 바뀐 거예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "계속하기");
    }
  }

  // ---- 슬라이더 입력 ----
  function setFromClientX(cx: number): void {
    const rect = track.getBoundingClientRect();
    const x = clamp((cx - rect.left) / rect.width, 0, 1);
    const prev = T;
    T = T_MIN + x * (T_MAX - T_MIN);
    thumb.style.left = `${x * 100}%`;
    refresh(prev);
  }
  thumb.style.left = "0%";
  let dragging = false;
  slider.addEventListener("pointerdown", (e) => {
    dragging = true;
    slider.classList.add("drag");
    slider.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
    haptic(6);
  });
  slider.addEventListener("pointermove", (e) => {
    if (dragging) setFromClientX(e.clientX);
  });
  const endDrag = (): void => {
    dragging = false;
    slider.classList.remove("drag");
  };
  slider.addEventListener("pointerup", endDrag);
  slider.addEventListener("pointercancel", endDrag);
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") T = clamp(T + 4, T_MIN, T_MAX);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") T = clamp(T - 4, T_MIN, T_MAX);
    else return;
    e.preventDefault();
    const prev = T;
    thumb.style.left = `${((T - T_MIN) / (T_MAX - T_MIN)) * 100}%`;
    refresh(prev);
  });

  // 뷰 토글을 처음 쓰면 한 번 칭찬(목표와 무관, 발견 보상)
  const stageWithHint = stage;
  stage.el.querySelector(".mstage-toggle")?.addEventListener("click", () => {
    if (toggleHinted) return;
    toggleHinted = true;
    stageWithHint.toast(stage.view() === "particle" ? "입자의 눈 — 입자 배열이 보여요" : "물질 뷰로 돌아왔어요");
  });

  // ---- 루프 ----
  const loop: Loop = createLoop((dt, tMs) => stage.tick(dt, tMs));
  const onResize = (): void => stage.resize();
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    stage.resize();
    stage.sim.buildLattice(true);
    refresh(null);
    loop.start();
  });

  api.setCTA("온도를 바꿔 상태를 관찰하세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
    stage.dispose();
  };
};
