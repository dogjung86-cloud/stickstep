// hotairRide — 생활 속 샤를 법칙 랩(VI 단원 L5). 교과서 그림 VI-8(열기구)의 조작판.
//   · 버너를 꾹 누르면 풍선 속 기체 온도↑ → 부피가 늘어 풍선이 부풀고, 가벼워져 떠오른다
//   · 손을 떼면 식으며 부피가 줄어 서서히 내려온다 — 목표 고도에 맞춰 조종!
// 목표: ① 이륙 ② 목표 고도 띠(55~85 m)에서 2초 버티기 ③ 부드럽게 착륙.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawFlame } from "../../ui/thermo";
import { contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface HotairStep {
  title: string;
  lead?: string;
  cta?: string;
}

export const hotairRide: StepRenderer = (host, step, api) => {
  const s = step as unknown as HotairStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:320px" });
  const altPill = el("span", { text: "고도 0 m" });
  const tempRead = el("span", { text: "20" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#FF9F43" }), altPill),
      el("div", { class: "tempread" }, tempRead, el("small", { text: " ℃" })),
    ),
  );
  const burnBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "꾹 눌러 버너 가열" }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "lift" } }, el("b", { text: "이륙!" }), el("span", { text: "가열하면?" })),
    el("div", { class: "pn-badge", dataset: { g: "band" } }, el("b", { text: "목표 고도" }), el("span", { text: "55~85 m" })),
    el("div", { class: "pn-badge", dataset: { g: "land" } }, el("b", { text: "착륙" }), el("span", { text: "식히면?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "버너 버튼을 <b>꾹 누르면</b> 풍선 속 기체가 데워져요. 풍선이 어떻게 변하는지 보면서 <b>이륙</b>시켜 보세요!",
  });
  host.append(goalChips, helper, stage, burnBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  // ---- 상태 ----
  let W = 340;
  let H = 320;
  let heating = false;
  let temp = 20; // 풍선 속 기체 온도(℃)
  let alt = 0; // 고도(m) 0..100
  let vy = 0;
  let bandMs = 0;
  let flew = false;
  const goals = new Set<string>();
  let finished = false;

  burnBtn.addEventListener("pointerdown", () => {
    heating = true;
    burnBtn.classList.remove("pulse");
    haptic(HAPTIC.tap);
  });
  const stopHeat = (): void => {
    heating = false;
  };
  burnBtn.addEventListener("pointerup", stopHeat);
  burnBtn.addEventListener("pointercancel", stopHeat);

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "완벽한 비행! 가열하면 풍선 속 기체의 <b>온도가 올라 부피가 늘고</b>(샤를 법칙), 기체 일부가 밖으로 밀려나 <b>가벼워져 떠올라요</b>. 식히면 반대 — 그래서 버너 하나로 조종한 거예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 320);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;

    // 온도·부피·부력
    temp = clamp(temp + (heating ? 0.6 : -0.4) * dt, 20, 100);
    const vol01 = (temp - 20) / 80; // 부피 비율 0..1
    const lift = (temp - 52) * 0.0016; // 52℃ 이상부터 뜨는 힘
    vy = clamp(vy + lift * dt - vy * 0.12 * dt, -0.34, 0.3);
    alt = clamp(alt + vy * dt, 0, 100);
    if (alt <= 0 && vy < 0) vy = 0;
    if (alt >= 100 && vy > 0) vy = 0;

    // 목표 판정
    if (alt > 6) {
      flew = true;
      collect("lift", "떠올랐다!");
      if (!goals.has("band")) helper.innerHTML = "좋아요! 이제 <b>55~85 m 목표 띠</b> 안에서 버텨 보세요 — 가열과 식힘을 번갈아!";
    }
    bandMs = alt >= 55 && alt <= 85 ? bandMs + dt * 16.7 : 0;
    if (bandMs > 2000) {
      collect("band", "2초 유지!");
      if (!goals.has("land")) helper.innerHTML = "이제 버너에서 손을 떼고 <b>천천히 식혀서</b> 착륙해 보세요.";
    }
    if (goals.has("band") && flew && alt <= 2 && Math.abs(vy) < 0.32) collect("land", "사뿐하게!");

    // ---- 그리기 ----
    // 하늘(고도에 따라 색 변화) + 구름 패럴랙스
    const skyG = ctx.createLinearGradient(0, 0, 0, H);
    const deep = alt / 100;
    skyG.addColorStop(0, `rgba(${44 - deep * 16},${86 - deep * 26},${150 - deep * 30},.55)`);
    skyG.addColorStop(1, "rgba(20,36,64,.15)");
    ctx.fillStyle = skyG;
    ctx.fillRect(6, 6, W - 12, H - 12);
    for (let i = 0; i < 4; i++) {
      // 패럴랙스: 열기구가 오르면 구름은 상대적으로 아래로 흐른다
      const cy = ((i * 97 + alt * 2.2) % (H + 60)) - 30;
      const cx = 40 + ((i * 131) % (W - 80));
      ctx.fillStyle = "rgba(226,240,255,.16)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 34, 11, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 22, cy + 4, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 고도 눈금 + 목표 띠
    const yOfAlt = (a: number): number => H - 52 - (a / 100) * (H - 130);
    ctx.fillStyle = "rgba(255,214,138,.12)";
    ctx.fillRect(10, yOfAlt(85), W - 20, yOfAlt(55) - yOfAlt(85));
    ctx.strokeStyle = "rgba(255,214,138,.4)";
    ctx.setLineDash([5, 6]);
    ctx.lineWidth = 1.2;
    for (const a of [55, 85]) {
      ctx.beginPath();
      ctx.moveTo(10, yOfAlt(a));
      ctx.lineTo(W - 10, yOfAlt(a));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.font = "600 10px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,224,168,.8)";
    ctx.fillText("목표 55~85 m", W - 16, yOfAlt(85) - 5);
    // 지면
    ctx.fillStyle = "rgba(96,150,110,.4)";
    ctx.beginPath();
    ctx.roundRect(6, H - 40, W - 12, 34, 8);
    ctx.fill();

    // 열기구(고도 → y, 부피 → 크기)
    const bx = W / 2;
    const by = yOfAlt(alt);
    const rEnv = 34 + vol01 * 22; // 풍선 반지름
    if (alt < 4) contactShadow(ctx, bx, H - 38, 40 + vol01 * 10, 0.3 - alt * 0.05);
    // 봉투(envelope) — 근-동조 3스톱 + 세로 고어 라인
    const eg = ctx.createRadialGradient(bx - rEnv * 0.35, by - rEnv * 1.25, rEnv * 0.3, bx, by - rEnv, rEnv * 1.15);
    eg.addColorStop(0, "#FFC873");
    eg.addColorStop(0.55, "#F2833C");
    eg.addColorStop(1, "#B84A26");
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.ellipse(bx, by - rEnv, rEnv, rEnv * 1.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(94,32,16,.55)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // 고어(세로 줄)
    ctx.strokeStyle = "rgba(255,236,204,.4)";
    ctx.lineWidth = 1.2;
    for (const k of [-0.55, 0, 0.55]) {
      ctx.beginPath();
      ctx.ellipse(bx, by - rEnv, rEnv * Math.abs(k) + rEnv * 0.24, rEnv * 1.12, 0, -Math.PI / 2 - 0.9, -Math.PI / 2 + 0.9);
      ctx.stroke();
    }
    // 스커트(아래 좁아지는 부분) + 로프
    ctx.strokeStyle = "rgba(150,178,210,.7)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bx - rEnv * 0.5, by - rEnv * 0.14);
    ctx.lineTo(bx - 10, by + 18);
    ctx.moveTo(bx + rEnv * 0.5, by - rEnv * 0.14);
    ctx.lineTo(bx + 10, by + 18);
    ctx.stroke();
    // 버너 불꽃(가열 중)
    if (heating) drawFlame(ctx, bx, by + 14, 20 + vol01 * 6, tMs);
    // 바구니
    const bg = ctx.createLinearGradient(0, by + 18, 0, by + 36);
    bg.addColorStop(0, "#C89A5A");
    bg.addColorStop(1, "#8A5F30");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(bx - 13, by + 18, 26, 18, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(74,48,18,.6)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 속 기체 온도 게이지(봉투 안 세로 바)
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bx, by - rEnv * 0.4);
    ctx.lineTo(bx, by - rEnv * 1.5);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,120,60,.85)";
    ctx.beginPath();
    ctx.moveTo(bx, by - rEnv * 0.4);
    ctx.lineTo(bx, by - rEnv * 0.4 - (rEnv * 1.1 * (temp - 20)) / 80);
    ctx.stroke();

    altPill.textContent = `고도 ${alt.toFixed(0)} m`;
    tempRead.textContent = String(Math.round(temp));
  });

  api.setCTA("이륙 → 목표 고도 → 착륙!", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
