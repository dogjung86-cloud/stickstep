// lightRefract — 빛의 굴절 랩(중2 III L2, 책 100~101쪽).
//   투명 수조: 위는 향 연기를 채운 공기, 아래는 우유 두어 방울 탄 물.
//   레이저 각도를 드래그하면 경계면에서 스넬 법칙(n=1.33)으로 정확히 꺾인다.
//   "직진했다면" 점선 유령 경로가 꺾인 정도를 보여 주고, 일부 반사光도 얇게 표현.
//   탐색(꺾임 발견) → 예측(입사각↑이면 굴절각은?) → 확인 → 수직 입사(직진 발견).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import {
  drawBeam, drawNormal, drawAngleArc, drawProtractor, laserBody, degLabel, capturePointer, TAU, type Pt,
} from "../../ui/lightKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const AMBER = "255,196,90";
const CYAN = "126,214,255";
const D2R = Math.PI / 180;
const N_WATER = 1.33;

export const refractLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "lt-canvas",
    style: "height:340px",
    attrs: { tabindex: "0", role: "slider", "aria-label": "레이저 입사각", "aria-valuemin": "0", "aria-valuemax": "75", "aria-valuenow": "35" },
  });
  const incVal = el("b", { text: "35°", style: "font-variant-numeric:tabular-nums" });
  const refVal = el("b", { text: "26°", style: "font-variant-numeric:tabular-nums" });
  const toast = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#FFC45A" }), el("span", { text: "입사각 " }), incVal),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#7ED6FF" }), el("span", { text: "굴절각 " }), refVal),
    ),
    toast,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "bend" } }, el("b", { text: "꺾임 발견" }), el("span", { text: "경계면에서" })),
    el("div", { class: "pn-badge", dataset: { g: "rule" } }, el("b", { text: "규칙 확인" }), el("span", { text: "예측 후 60°" })),
    el("div", { class: "pn-badge", dataset: { g: "zero" } }, el("b", { text: "수직 입사" }), el("span", { text: "0°로 세우기" })),
  );
  const choices = el("div", { class: "hook-choices" });
  const helper = el("div", {
    class: "helper",
    html: "레이저를 잡고 <b>비스듬히</b> 물속으로 쏘아 보세요. 경계면에서 무슨 일이 일어나나요?",
  });
  host.append(goalChips, stage, choices, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let th1 = 35 * D2R; // 입사각
  let minSeen = th1;
  let maxSeen = th1;
  let phase: "explore" | "predict" | "confirm" | "zero" | "done" = "explore";
  let predictPick = -1;
  let holdMs = 0;
  let zeroHold = 0;
  const goals = new Set<string>();
  const P = { x: 170, y: 170 };
  let toastTimer = 0;

  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1900);
  }

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
  }

  // ---- 조작 ----
  function setFromPointer(e: PointerEvent): void {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const a = Math.atan2(px - P.x, P.y - py);
    th1 = clamp(Math.abs(a), 0, 75 * D2R);
  }
  let dragging = false;
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    capturePointer(canvas, e);
    setFromPointer(e);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (dragging) setFromPointer(e);
  });
  const endDrag = (): void => {
    dragging = false;
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") th1 = clamp(th1 + 2 * D2R, 0, 75 * D2R);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") th1 = clamp(th1 - 2 * D2R, 0, 75 * D2R);
    else return;
    e.preventDefault();
  });

  // ---- 예측 흐름 ----
  function startPredict(): void {
    phase = "predict";
    helper.innerHTML = "빛이 물속으로 들어가며 <b>법선 쪽으로 꺾였어요</b>. 그럼 입사각을 <b>더 크게</b> 하면 굴절각은 어떻게 될까요?";
    const opts = ["굴절각도 함께 커진다", "굴절각은 그대로다", "굴절각은 오히려 작아진다"];
    opts.forEach((label, i) => {
      const b = el("button", { class: "hook-choice", attrs: { "aria-pressed": "false" }, text: label });
      b.addEventListener("click", () => {
        if (choices.classList.contains("locked")) return;
        choices.classList.add("locked");
        predictPick = i;
        haptic(HAPTIC.select);
        choices.querySelectorAll(".hook-choice").forEach((x) => {
          x.classList.add(x === b ? "sel" : "dim");
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
          (x as HTMLButtonElement).disabled = x !== b;
        });
        phase = "confirm";
        helper.innerHTML = "직접 확인! 레이저를 눕혀 입사각을 <b>60° 이상</b>으로 키워 보세요.";
      });
      choices.appendChild(b);
    });
    choices.classList.add("show");
  }

  function confirmDone(): void {
    const good = predictPick === 0;
    api.recordQuiz(good);
    collect("rule", "함께 커져요");
    showToast("입사각 ↑ → 굴절각 ↑");
    helper.innerHTML = good
      ? "예측 적중! 입사각이 커지면 굴절각도 <b>함께 커져요</b>. 단, 굴절각은 <b>언제나 입사각보다 작죠</b>(공기→물). 이제 레이저를 <b>수직(0°)</b>으로 세워 보세요!"
      : "직접 보니 — 입사각이 커지자 굴절각도 <b>함께 커졌어요</b>. 다만 굴절각은 <b>언제나 입사각보다 작아요</b>(공기→물). 이제 레이저를 <b>수직(0°)</b>으로 세워 보세요!";
    phase = "zero";
    window.setTimeout(() => choices.classList.remove("show"), 400);
  }

  function zeroDone(): void {
    phase = "done";
    collect("zero", "직진!");
    haptic(HAPTIC.correct);
    showToast("수직 입사 — 꺾이지 않고 직진!");
    helper.innerHTML =
      "정리! 빛이 <b>비스듬히</b> 물로 들어가면 경계면에서 <b>법선 쪽으로 꺾이고</b>(굴절각 < 입사각), 입사각이 커지면 굴절각도 커져요. <b>수직으로</b> 들어가면 꺾이지 않고 직진 — 이게 빛의 <b>굴절</b>이에요.";
    api.enableCTA(s.cta ?? "개념 정리하기");
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 340);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const ifaceY = H * 0.52;
    P.x = W / 2;
    P.y = ifaceY;
    const R = Math.min(ifaceY - 26, W * 0.42);

    // 공기(위) — 향 연기 입자가 떠다닌다(레이저 경로가 보이는 이유)
    for (let i = 0; i < 12; i++) {
      const sx = ((i * 97 + tMs * 0.008 * (8 + (i % 5))) % (W + 40)) - 20;
      const sy = 18 + ((i * 53) % (ifaceY - 40));
      ctx.fillStyle = `rgba(196,210,232,${0.05 + (i % 3) * 0.015})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + (i % 3), 0, TAU);
      ctx.fill();
    }

    // 물(아래) — 우유 탄 물의 밀키 그라데이션 + 수면 하이라이트
    const wg = ctx.createLinearGradient(0, ifaceY, 0, H);
    wg.addColorStop(0, "rgba(110,168,240,.20)");
    wg.addColorStop(0.55, "rgba(96,150,224,.13)");
    wg.addColorStop(1, "rgba(88,138,212,.09)");
    ctx.fillStyle = wg;
    ctx.fillRect(0, ifaceY, W, H - ifaceY);
    // 수면 잔물결 하이라이트
    ctx.strokeStyle = "rgba(214,234,255,.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, ifaceY);
    ctx.lineTo(W - 14, ifaceY);
    ctx.stroke();
    ctx.strokeStyle = "rgba(160,196,240,.25)";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(14, ifaceY + 3.4);
    ctx.lineTo(W - 14, ifaceY + 3.4);
    ctx.stroke();
    // 라벨
    ctx.font = "800 11.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(174,196,228,.85)";
    ctx.fillText("공기", 18, ifaceY - 12);
    ctx.fillStyle = "rgba(150,196,248,.9)";
    ctx.fillText("물", 18, ifaceY + 22);

    // 각도기(위/아래 반원) + 법선(양쪽)
    drawProtractor(ctx, P.x, P.y, Math.min(R * 0.72, 104), 0, { alpha: 0.8 });
    drawProtractor(ctx, P.x, P.y, Math.min(R * 0.72, 104), Math.PI, { alpha: 0.8 });
    drawNormal(ctx, P.x, P.y, -Math.PI / 2, Math.min(R + 18, ifaceY - 16));
    drawNormal(ctx, P.x, P.y, Math.PI / 2, Math.min(R + 18, H - ifaceY - 16));

    // 스넬 굴절
    const th2 = Math.asin(Math.sin(th1) / N_WATER);
    const lx = P.x - Math.sin(th1) * R;
    const ly = P.y - Math.cos(th1) * R;
    const len2 = Math.min((H - 16 - P.y) / Math.max(0.32, Math.cos(th2)), 240);
    const rfEnd: Pt = { x: P.x + Math.sin(th2) * len2, y: P.y + Math.cos(th2) * len2 };

    // "직진했다면" 유령 경로(점선) — 꺾인 정도가 한눈에
    if (th1 > 6 * D2R) {
      const gLen = Math.min((H - 16 - P.y) / Math.max(0.26, Math.cos(th1)), 230);
      drawBeam(ctx, [{ x: P.x, y: P.y }, { x: P.x + Math.sin(th1) * gLen, y: P.y + Math.cos(th1) * gLen }], {
        rgb: "196,214,240", width: 1.6, alpha: 0.34, dash: [4, 7], glow: false,
      });
    }

    // 일부 반사광(얇게) — 경계면에서는 굴절과 반사가 함께 일어난다
    if (th1 > 4 * D2R) {
      const rl = R * 0.8;
      drawBeam(ctx, [{ x: P.x, y: P.y }, { x: P.x + Math.sin(th1) * rl, y: P.y - Math.cos(th1) * rl }], {
        width: 1.8, alpha: 0.22, glow: false,
      });
    }

    // 본 광선: 입사 → 굴절(한 줄기, 광자 점이 경계를 통과)
    drawBeam(ctx, [{ x: lx, y: ly }, { x: P.x, y: P.y }, rfEnd], {
      flow: (tMs / 850) % 1,
      arrow: true,
      arrowAt: 0.93,
      width: 3,
    });
    laserBody(ctx, lx, ly, Math.atan2(P.y - ly, P.x - lx));

    // 각 호(0°에 가까우면 겹쳐서 지저분 — 숨김)
    if (th1 > 4 * D2R) {
      drawAngleArc(ctx, P.x, P.y, 48, -Math.PI / 2, -Math.PI / 2 - th1, AMBER, degLabel(th1), 70);
      drawAngleArc(ctx, P.x, P.y, 48, Math.PI / 2, Math.PI / 2 - th2, CYAN, degLabel(th2), 70);
    }

    // HUD
    const d1 = Math.round(th1 / D2R);
    const d2 = Math.round(th2 / D2R);
    incVal.textContent = `${d1}°`;
    refVal.textContent = `${d2}°`;
    canvas.setAttribute("aria-valuenow", String(d1));

    // 목표 판정
    minSeen = Math.min(minSeen, th1);
    maxSeen = Math.max(maxSeen, th1);
    if (phase === "explore" && !goals.has("bend") && th1 >= 25 * D2R && maxSeen - minSeen >= 10 * D2R) {
      collect("bend", "법선 쪽으로!");
      window.setTimeout(startPredict, 350); // collect 가드 덕에 한 번만 예약된다
    }
    if (phase === "confirm") {
      if (th1 >= 58 * D2R) {
        holdMs += dt * 16.7;
        if (holdMs >= 340) confirmDone();
      } else holdMs = 0;
    }
    if (phase === "zero") {
      if (th1 <= 2.2 * D2R) {
        zeroHold += dt * 16.7;
        if (zeroHold >= 340) zeroDone();
      } else zeroHold = 0;
    }
  });

  api.setCTA("레이저로 물속을 겨눠 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
  };
};
