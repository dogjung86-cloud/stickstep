// gasPressure — 기체의 압력 랩(VI 단원 L1). 교과서 198~199쪽의 조작판.
//   · 타이어(공기방) 단면 속 자유 입자 — 벽에 충돌할 때마다 플래시 = 기체의 압력의 정체
//   · 펌프로 공기(입자)를 넣고 빼면 충돌이 잦아지고 뜸해진다 → 압력 게이지가 오르내림
//   · 4면 히트 카운터 — 입자가 "모든 방향"으로 충돌함을 확인
// 목표: ① 공기 넣어 압력 높이기 ② 공기 빼서 낮추기 ③ 네 벽 모두 충돌 확인.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { GasBox } from "../../ui/gasKit";
import { glassStrokeStyle, contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface GasPressureStep {
  title: string;
  lead?: string;
  cta?: string;
}

const N_START = 12;
const N_MIN = 6;
const N_MAX = 30;

export const gasPressure: StepRenderer = (host, step, api) => {
  const s = step as unknown as GasPressureStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:280px" });
  const gaugeFill = el("i", {});
  const gaugeVal = el("b", { text: "0%" });
  const gauge = el(
    "div",
    { class: "cv-gauge rd-gauge" },
    el("span", { text: "압력" }),
    el("div", { class: "cv-gauge-track" }, gaugeFill),
    gaugeVal,
  );
  const countPill = el("span", { text: `입자 ${N_START}개` });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#5AA2F8" }), countPill), gauge),
  );

  const pumpBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "펌프 — 공기 넣기" }));
  const ventBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "공기 빼기" }));
  const btnRow = el("div", { class: "gp-controls" }, pumpBtn, ventBtn);

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "up" } }, el("b", { text: "빵빵하게" }), el("span", { text: "공기 넣기" })),
    el("div", { class: "pn-badge", dataset: { g: "down" } }, el("b", { text: "다시 빼기" }), el("span", { text: "압력은?" })),
    el("div", { class: "pn-badge", dataset: { g: "all" } }, el("b", { text: "모든 방향" }), el("span", { text: "네 벽 다?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "타이어 단면이에요. 속 입자들이 <b>벽에 부딪히는 순간</b>을 잘 보세요 — 그리고 <b>펌프</b>를 눌러 보세요!",
  });
  host.append(goalChips, stage, btnRow, helper);

  // ---- 상태 ----
  let W = 340;
  let H = 280;
  let count = N_START;
  const gas = new GasBox(1.15);
  const goals = new Set<string>();
  let finished = false;
  let pumps = 0;

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
        "정리! 기체 입자는 <b>모든 방향으로 끊임없이 운동</b>하며 벽에 충돌해요. 이 충돌이 벽을 미는 힘 — 그게 <b>기체의 압력</b>이에요. 입자가 많을수록 충돌이 잦아 압력이 커지죠(바람 넣은 타이어!).";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  pumpBtn.addEventListener("click", () => {
    count = clamp(count + 4, N_MIN, N_MAX);
    pumps++;
    haptic(HAPTIC.select);
    pumpBtn.classList.remove("pulse");
    if (pumps >= 3 && count >= 24) collect("up", "충돌 ↑ 압력 ↑");
    if (!goals.has("up")) helper.innerHTML = "입자가 늘어나니 <b>충돌 플래시</b>가 잦아지죠? 더 넣어 봐요!";
  });
  ventBtn.addEventListener("click", () => {
    count = clamp(count - 4, N_MIN, N_MAX);
    haptic(HAPTIC.select);
    if (goals.has("up") && count <= 12) collect("down", "충돌 ↓ 압력 ↓");
  });

  // ---- 프레임 ----
  let smooth = 0;
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 280);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const pad = 44;
    const b = { x0: pad, y0: 58, x1: W - pad, y1: H - 40 };

    gas.setCount(count, b);
    gas.step(dt, b, 1);

    // 4면 충돌 확인 목표
    if (gas.hits.L > 8 && gas.hits.R > 8 && gas.hits.T > 8 && gas.hits.B > 8) collect("all", "위·아래·양옆!");

    // ---- 그리기 ----
    contactShadow(ctx, W / 2, b.y1 + 18, (b.x1 - b.x0) * 0.5, 0.24);
    // 챔버(타이어 고무 벽 — 두툼한 라운드 사각)
    const wallG = ctx.createLinearGradient(0, b.y0 - 14, 0, b.y1 + 14);
    wallG.addColorStop(0, "#3A4A62");
    wallG.addColorStop(0.5, "#2A3850");
    wallG.addColorStop(1, "#1E2A40");
    ctx.strokeStyle = wallG;
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.roundRect(b.x0 - 7, b.y0 - 7, b.x1 - b.x0 + 14, b.y1 - b.y0 + 14, 26);
    ctx.stroke();
    // 벽 안쪽 하이라이트
    ctx.strokeStyle = "rgba(160,190,230,.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(b.x0 - 1, b.y0 - 1, b.x1 - b.x0 + 2, b.y1 - b.y0 + 2, 20);
    ctx.stroke();
    // 밸브(펌프 주둥이)
    ctx.fillStyle = "#5D7CA6";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 9, b.y0 - 24, 18, 16, 4);
    ctx.fill();
    ctx.strokeStyle = glassStrokeStyle(ctx, b.y0 - 24, b.y0 - 8);
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 입자
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(b.x0 - 2, b.y0 - 2, b.x1 - b.x0 + 4, b.y1 - b.y0 + 4, 20);
    ctx.clip();
    gas.draw(ctx, 205, 1);
    ctx.restore();

    // 4면 히트 카운터(작은 도트 + 숫자)
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    const sides: ["L" | "R" | "T" | "B", number, number][] = [
      ["T", W / 2 + 70, b.y0 + 20],
      ["B", W / 2, b.y1 + 24],
      ["L", b.x0 - 24, (b.y0 + b.y1) / 2],
      ["R", b.x1 + 24, (b.y0 + b.y1) / 2],
    ];
    for (const [side, x, y] of sides) {
      const n = gas.hits[side];
      const on = n > 8;
      ctx.fillStyle = on ? "rgba(255,214,138,.95)" : "rgba(148,168,196,.5)";
      ctx.fillText(`${side === "T" ? "위" : side === "B" ? "아래" : side === "L" ? "왼쪽" : "오른쪽"} ${Math.min(n, 99)}`, x, y);
    }

    // 게이지(최근 1초 충돌률)
    const rate = clamp(gas.hitRate() / 11, 0, 1); // 실측: 28입자 ≈ 85%
    smooth += (rate - smooth) * Math.min(1, 0.1 * dt);
    const pct = Math.round(smooth * 100);
    gaugeFill.style.width = `${pct}%`;
    gaugeFill.style.background = pct > 62 ? "#FF9F43" : "#5AA2F8";
    gaugeVal.textContent = `${pct}%`;
    countPill.textContent = `입자 ${count}개`;
    countPill.dataset.hits = `${gas.hits.L}/${gas.hits.R}/${gas.hits.T}/${gas.hits.B}`;
    void tMs;
  });

  api.setCTA("펌프·빼기·네 벽 확인!", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
