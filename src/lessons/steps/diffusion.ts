// diffusion — 잉크 확산 랩(IV 단원 L1). 교과서 탐구(116~117쪽) 그대로:
// 물이 담긴 비커 바닥에 잉크를 넣고 "젓지 않아도" 퍼지는지 관찰한다.
// 예측(채점) → 잉크 넣기 → 스스로 퍼져 나가는 입자 관찰 → 확인. 대단원 12번 문항과 직결.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { contactShadow, glassVessel, liquidFill } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface DiffusionStep {
  title: string;
  lead?: string;
  cta?: string;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  seed: number;
}

const INK_N = 26;
const WATER_N = 34;
const TAU = Math.PI * 2;

export const diffusion: StepRenderer = (host, step, api) => {
  const s = step as unknown as DiffusionStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대 ----
  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:250px" });
  const toastEl = el("div", { class: "toast" });
  const hudPill = el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#5AA2F8" }), el("span", { text: "물 + 잉크" }));
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, hudPill), toastEl, el("div", { class: "stage-cap", text: "젓지 않은 물이에요 — 손대지 않고 지켜봐요" }));

  // ---- 예측 → 실행 컨트롤 ----
  const choices = el("div", { class: "hook-choices show" });
  // 질문은 선택지 위(.hook-q)에 — helper는 선택지 아래라 질문이 안 보인다(실사용 피드백 2026-07-10).
  choices.appendChild(
    el("div", { class: "hook-q", html: "넣기 전에 먼저 예측! 바닥에 넣은 잉크를 <b>젓지 않고</b> 가만히 두면 어떻게 될까요?" }),
  );
  const dropBtn = el(
    "button",
    { class: "swapbtn", attrs: { type: "button", disabled: "true" } },
    el("span", { text: "잉크 한 방울 넣기" }),
  );
  const helper = el("div", {
    class: "helper",
    html: "정답을 몰라도 괜찮아요. 직감으로 하나를 골라 보세요, 예측은 실험으로 확인해요!",
  });
  host.append(stage, choices, dropBtn, helper);

  const OPTS = ["잉크가 바닥에 그대로 가라앉아 있는다", "잉크가 물 전체로 천천히 퍼진다", "잉크가 물 위쪽으로만 떠오른다"];
  const ANSWER = 1;

  let phase: "predict" | "run" | "done" = "predict";
  let picked = -1;

  OPTS.forEach((label, i) => {
    const b = el("button", { class: "hook-choice", attrs: { "aria-pressed": "false" }, text: label });
    b.addEventListener("click", () => {
      if (phase !== "predict") return;
      picked = i;
      phase = "run";
      haptic(HAPTIC.select);
      api.recordQuiz(i === ANSWER);
      choices.querySelectorAll(".hook-choice").forEach((x, k) => {
        x.classList.add(k === i ? "sel" : "dim");
        x.setAttribute("aria-pressed", String(k === i));
        (x as HTMLButtonElement).disabled = k !== i;
      });
      (dropBtn as HTMLButtonElement).disabled = false;
      dropBtn.classList.add("pulse");
      helper.innerHTML = "예측 완료! 이제 스포이트로 비커 <b>바닥에</b> 잉크를 넣어 보세요.";
    });
    choices.appendChild(b);
  });

  // ---- 입자 ----
  let box = { x: 24, y: 18, w: 280, h: 210 };
  const water: P[] = [];
  const ink: P[] = [];
  let inkDropped = false;
  let spreadDone = false;
  let doneAt = 0;

  function seedWater(): void {
    water.length = 0;
    for (let i = 0; i < WATER_N; i++) {
      water.push({
        x: box.x + Math.random() * box.w,
        y: box.y + Math.random() * box.h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        seed: 0.75 + Math.random() * 0.5,
      });
    }
  }
  function dropInk(): void {
    ink.length = 0;
    const cx = box.x + box.w / 2;
    const by = box.y + box.h - 8;
    for (let i = 0; i < INK_N; i++) {
      ink.push({
        x: cx + (Math.random() - 0.5) * 34,
        y: by - Math.random() * 14,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.2,
        seed: 0.7 + Math.random() * 0.6,
      });
    }
  }

  dropBtn.addEventListener("click", () => {
    if (inkDropped || phase !== "run") return;
    inkDropped = true;
    (dropBtn as HTMLButtonElement).disabled = true;
    dropBtn.classList.remove("pulse");
    dropInk();
    haptic(HAPTIC.select);
    toastEl.textContent = "잉크 투하 — 이제 기다리기만!";
    toastEl.classList.add("show");
    window.setTimeout(() => toastEl.classList.remove("show"), 1700);
    helper.innerHTML = "아무도 젓지 않았어요. 잉크 입자가 <b>스스로</b> 움직이는 걸 지켜보세요.";
  });

  /** 잉크가 충분히 퍼졌는지 — 4×3 격자 커버리지로 판단 */
  function coverage(): number {
    const cols = 4;
    const rows = 3;
    const hit = new Set<number>();
    for (const p of ink) {
      const cx = clamp(Math.floor(((p.x - box.x) / box.w) * cols), 0, cols - 1);
      const cy = clamp(Math.floor(((p.y - box.y) / box.h) * rows), 0, rows - 1);
      hit.add(cy * cols + cx);
    }
    return hit.size / (cols * rows);
  }

  function stepParticles(ps: P[], dt: number, speed: number): void {
    for (const p of ps) {
      p.vx += (Math.random() - 0.5) * 0.2 * dt;
      p.vy += (Math.random() - 0.5) * 0.2 * dt;
      const target = speed * p.seed;
      const v = Math.hypot(p.vx, p.vy) || 1e-4;
      const k = 1 + (target / v - 1) * Math.min(1, 0.1 * dt);
      p.vx *= k;
      p.vy *= k;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < box.x) { p.x = box.x; p.vx = Math.abs(p.vx); }
      if (p.x > box.x + box.w) { p.x = box.x + box.w; p.vx = -Math.abs(p.vx); }
      if (p.y < box.y) { p.y = box.y; p.vy = Math.abs(p.vy); }
      if (p.y > box.y + box.h) { p.y = box.y + box.h; p.vy = -Math.abs(p.vy); }
    }
  }

  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 250);
    box = { x: 26, y: 16, w: w - 52, h: h - 34 };

    // 비커(유리) + 물 — 접촉 그림자로 무대에 앉힌다
    contactShadow(ctx, box.x + box.w / 2, box.y + box.h + 12, box.w * 0.6);
    glassVessel(ctx, { x0: box.x - 6, y0: box.y - 4, x1: box.x + box.w + 6, y1: box.y + box.h + 6 });
    liquidFill(ctx, box.x - 3, box.y + 6, box.x + box.w + 3, box.y + box.h + 3, "92,152,235", 0.13);

    stepParticles(water, dt, 0.55);
    if (inkDropped) stepParticles(ink, dt, 0.62);

    // 물 입자(흐릿) — 잉크가 퍼질 "빈자리"가 아니라 물도 입자임을 암시
    for (const p of water) {
      ctx.fillStyle = "rgba(190,214,244,.28)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.6, 0, TAU);
      ctx.fill();
    }
    // 잉크 입자(선명)
    for (const p of ink) {
      const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 12);
      grad.addColorStop(0, "rgba(90,162,248,.65)");
      grad.addColorStop(1, "rgba(90,162,248,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#5AA2F8";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.beginPath();
      ctx.arc(p.x - 1.6, p.y - 1.8, 1.8, 0, TAU);
      ctx.fill();
    }

    if (inkDropped && !spreadDone && coverage() >= 0.8) {
      spreadDone = true;
      doneAt = tMs;
      haptic(HAPTIC.ctaUnlock);
      const good = picked === ANSWER;
      helper.innerHTML = good
        ? "예측 적중! 젓지 않아도 잉크가 물 전체로 퍼졌어요. 입자가 <b>스스로 끊임없이 운동</b>하기 때문이에요. 이런 현상이 <b>확산</b>이에요."
        : "예측과 달리, 젓지 않아도 잉크가 물 전체로 퍼졌죠? 입자가 <b>스스로 끊임없이 운동</b>하기 때문이에요. 이런 현상이 <b>확산</b>이에요.";
      api.enableCTA(s.cta ?? "계속하기");
    }
    // 완료 후에도 입자는 계속 움직인다(멈추지 않음이 포인트)
    void doneAt;
  });

  const onResize = (): void => {
    fitCanvas(canvas, 250);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    const { w, h } = fitCanvas(canvas, 250);
    box = { x: 26, y: 16, w: w - 52, h: h - 34 };
    seedWater();
    loop.start();
  });

  api.setCTA("먼저 예측을 골라 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
