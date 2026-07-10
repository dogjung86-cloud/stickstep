// phaseNames — 상태 변화 이름 수집 랩(IV 단원 L3).
// 온도를 오가며 상태 변화를 일으킬 때마다 그 이름(융해·응고·기화·액화) 배지를 수집한다.
// 네 개를 모두 모으면 완료 — "이름은 방향"이라는 감각을 손으로 익힌다.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { createMatterStage } from "../../ui/matterStage";
import { colFor } from "../../renderers/palette";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface PhaseNamesStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const T_MIN = -20;
const T_MAX = 120;

const BADGES = [
  { id: "fusion", name: "융해", dir: "고체 → 액체" },
  { id: "solidify", name: "응고", dir: "액체 → 고체" },
  { id: "vaporize", name: "기화", dir: "액체 → 기체" },
  { id: "liquefy", name: "액화", dir: "기체 → 액체" },
] as const;
type BadgeId = (typeof BADGES)[number]["id"];

export const phaseNames: StepRenderer = (host, step, api) => {
  const s = step as unknown as PhaseNamesStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 수집 배지 ----
  const badgeEls = new Map<BadgeId, HTMLElement>();
  const badges = el("div", { class: "pn-badges" });
  BADGES.forEach((b) => {
    const chip = el(
      "div",
      { class: "pn-badge", attrs: { "aria-label": `${b.name} — ${b.dir}` } },
      el("b", { text: b.name }),
      el("span", { text: b.dir }),
    );
    badges.appendChild(chip);
    badgeEls.set(b.id, chip);
  });

  // ---- 무대 ----
  const stage = createMatterStage({
    height: "min(270px,33dvh)",
    sim: { count: 48, r: 6.5, temp: 25 },
  });
  const phaseDot = el("span", { class: "pdot" });
  const phaseName = el("span", { text: "액체" });
  const tempNum = el("span", { text: "25" });
  stage.hud.append(
    el("div", { class: "pill" }, phaseDot, phaseName),
    el("div", { class: "tempread" }, tempNum, el("small", { text: "°C" })),
  );

  // ---- 슬라이더 ----
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const track = el(
    "div",
    { class: "sl-track" },
    el("div", { class: "sl-tick", style: "left:14.3%" }, el("span", { text: "0°" })),
    el("div", { class: "sl-tick", style: "left:85.7%" }, el("span", { text: "100°" })),
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
        "aria-valuenow": "25",
        "aria-valuetext": "25도",
      },
    },
    track,
  );
  const helper = el("div", {
    class: "helper",
    html: "지금은 25℃ 물이에요. 먼저 온도를 <b>0℃ 아래로</b> 내려 보세요 — 액체가 고체로 변하는 순간, 첫 이름을 얻어요!",
  });
  host.append(badges, helper, stage.el, slider); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let T = 25;
  const got = new Set<BadgeId>();
  let finished = false;

  const NAMES = { sol: "고체", liq: "액체", gas: "기체" } as const;
  const phaseOf = (t: number): keyof typeof NAMES => (t < 0.5 ? "sol" : t < 100 ? "liq" : "gas");

  const NEXT_HINT: Record<number, string> = {
    1: "하나 모았어요! 이제 온도를 <b>올려서</b> 반대 방향 이름도 모아 봐요.",
    2: "둘! 이번엔 <b>100℃ 너머</b>로 — 액체가 기체가 되는 순간이에요.",
    3: "셋! 마지막 하나 — 다시 <b>100℃ 아래로</b> 내려 보세요.",
  };

  function collect(id: BadgeId, msg: string): void {
    if (got.has(id)) {
      stage.toast(msg);
      haptic(HAPTIC.cross);
      return;
    }
    got.add(id);
    const chip = badgeEls.get(id)!;
    chip.classList.add("on");
    stage.toast(msg);
    haptic(HAPTIC.ctaUnlock);
    if (got.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "네 이름 수집 완료! <b>가열 방향</b>(융해·기화)과 <b>냉각 방향</b>(응고·액화)이 서로 짝이에요. 그런데 고체가 <b>액체를 건너뛰고</b> 바로 기체가 될 수도 있을까요? 다음 실험에서!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음 실험 — 승화");
    } else if (!finished) {
      helper.innerHTML = NEXT_HINT[got.size] ?? "";
    }
  }

  function refresh(prev: number | null): void {
    stage.setTemp(T);
    tempNum.textContent = String(Math.round(T));
    const ph = phaseOf(T);
    phaseName.textContent = NAMES[ph];
    phaseDot.style.background = colFor(T, 66, 1);
    phaseDot.style.boxShadow = `0 0 8px ${colFor(T, 60, 0.8)}`;
    (thumb.firstChild as HTMLElement).style.background = colFor(T, 54, 1);
    slider.setAttribute("aria-valuenow", String(Math.round(T)));
    slider.setAttribute("aria-valuetext", `${Math.round(T)}도 — ${NAMES[ph]}`);
    if (prev == null) return;
    if (prev >= 0 && T < 0) collect("solidify", "응고 — 액체가 고체로");
    if (prev < 0 && T >= 0) collect("fusion", "융해 — 고체가 액체로");
    if (prev < 100 && T >= 100) collect("vaporize", "기화 — 액체가 기체로");
    if (prev >= 100 && T < 100) collect("liquefy", "액화 — 기체가 액체로");
  }

  // ---- 입력 ----
  function setFromClientX(cx: number): void {
    const rect = track.getBoundingClientRect();
    const x = clamp((cx - rect.left) / rect.width, 0, 1);
    const prev = T;
    T = T_MIN + x * (T_MAX - T_MIN);
    thumb.style.left = `${x * 100}%`;
    refresh(prev);
  }
  thumb.style.left = `${((25 - T_MIN) / (T_MAX - T_MIN)) * 100}%`;
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
    const prev = T;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") T = clamp(T + 4, T_MIN, T_MAX);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") T = clamp(T - 4, T_MIN, T_MAX);
    else return;
    e.preventDefault();
    thumb.style.left = `${((T - T_MIN) / (T_MAX - T_MIN)) * 100}%`;
    refresh(prev);
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

  api.setCTA("이름 4개를 모두 모아 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
    stage.dispose();
  };
};
