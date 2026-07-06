// sublimation — 드라이아이스 승화 랩(IV 단원 L3). 교과서 해보기(126쪽) 그대로:
// 유리컵 속 드라이아이스 위에 비누막을 만들면, 고체가 "녹은 흔적 없이" 곧장 기체가 되며
// 비누막이 부풀어 오른다. 고체 → 기체 = 승화. 대단원 13번 문항과 직결.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";

interface SublimationStep {
  title: string;
  lead?: string;
  cta?: string;
}

interface GasP {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const TAU = Math.PI * 2;
const ICE = "196,229,255"; // 드라이아이스(찬 흰파랑)
const GAS = "182,206,238"; // 이산화 탄소 기체(옅음)

export const sublimation: StepRenderer = (host, step, api) => {
  const s = step as unknown as SublimationStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:260px" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:rgb(${ICE})` }), el("span", { text: "드라이아이스 -78℃" })),
    ),
    toastEl,
    el("div", { class: "stage-cap", text: "고체 이산화 탄소예요 — 컵 바닥을 잘 보세요" }),
  );

  const filmBtn = el(
    "button",
    { class: "swapbtn pulse", attrs: { type: "button" } },
    el("span", { text: "컵 입구에 비누막 만들기" }),
  );
  const helper = el("div", {
    class: "helper",
    html: "비눗물 적신 끈으로 컵 입구를 스치면 <b>비누막</b>이 생겨요. 막을 만들고 무슨 일이 생기는지 보세요.",
  });
  host.append(stage, filmBtn, helper);

  // ---- 상태 ----
  // 드라이아이스 격자(줄어드는 고체) — 각 입자는 자리 고정, 승화 시 제거
  let block: { x: number; y: number }[] = [];
  const gas: GasP[] = [];
  let filmOn = false;
  let bulge = 0; // 비누막 부풀기 0~1
  let escapeClock = 0;
  let noticedNoMelt = false;
  let finished = false;

  function seedBlock(cx: number, bottomY: number): void {
    block = [];
    const cols = 7;
    const rows = 3;
    const sp = 15;
    for (let r = 0; r < rows; r++) {
      const n = cols - (r === rows - 1 ? 2 : 0);
      for (let c = 0; c < n; c++) {
        block.push({ x: cx + (c - (n - 1) / 2) * sp + (r % 2 ? 4 : 0), y: bottomY - 10 - r * 13 });
      }
    }
  }

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  filmBtn.addEventListener("click", () => {
    if (filmOn) return;
    filmOn = true;
    filmBtn.classList.remove("pulse");
    (filmBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    toast("비누막 완성 — 이제 지켜봐요");
    helper.innerHTML = "이제 기다려요. 드라이아이스가 <b>줄어드는데</b>, 물웅덩이는 <b>안 생겨요</b>. 어디로 가는 걸까요?";
  });

  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 260);
    const cupW = Math.min(w * 0.44, 180);
    const cupL = (w - cupW) / 2;
    const cupR = cupL + cupW;
    const rimY = 64;
    const botY = h - 26;
    const cx = w / 2;
    if (block.length === 0 && !finished) seedBlock(cx, botY);

    // ---- 승화: 표면(위층·가장자리) 입자가 기체로 ----
    if (filmOn && !finished) {
      escapeClock += dt;
      if (escapeClock > 26 && block.length > 6) {
        escapeClock = 0;
        // 가장 위 입자 하나 제거 → 기체로
        let top = 0;
        for (let i = 1; i < block.length; i++) if (block[i].y < block[top].y) top = i;
        const p = block.splice(top, 1)[0];
        gas.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 1.2, vy: -0.8 - Math.random() * 0.8 });
        bulge = Math.min(1, bulge + 0.09);
        if (!noticedNoMelt && bulge > 0.3) {
          noticedNoMelt = true;
          toast("녹은 물이 없어요 — 곧장 기체로!");
          haptic(HAPTIC.cross);
        }
      }
    }

    // ---- 기체 운동(컵 안 + 부푼 막 아래) ----
    const filmH = 26 + bulge * 66; // 막 돔 높이
    for (const g of gas) {
      g.vx += (Math.random() - 0.5) * 0.18 * dt;
      g.vy += (Math.random() - 0.5) * 0.18 * dt - 0.004 * dt;
      const v = Math.hypot(g.vx, g.vy) || 1e-4;
      const k = 1 + (1.15 / v - 1) * Math.min(1, 0.1 * dt);
      g.vx *= k;
      g.vy *= k;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      if (g.x < cupL + 8) { g.x = cupL + 8; g.vx = Math.abs(g.vx); }
      if (g.x > cupR - 8) { g.x = cupR - 8; g.vx = -Math.abs(g.vx); }
      if (g.y > botY - 6) { g.y = botY - 6; g.vy = -Math.abs(g.vy); }
      // 막(돔) 반사 — 근사: 막이 있으면 rimY - 돔 높이, 없으면 위로 탈출
      const ceil = filmOn ? rimY - filmH * domeAt((g.x - cupL) / cupW) : -20;
      if (filmOn && g.y < ceil + 8) {
        g.y = ceil + 8;
        g.vy = Math.abs(g.vy) * 0.9;
      }
    }
    // 막 없을 때 위로 나간 입자 제거
    for (let i = gas.length - 1; i >= 0; i--) if (gas[i].y < -16) gas.splice(i, 1);

    // ---- 그리기 ----
    // 컵
    ctx.strokeStyle = "rgba(148,176,214,.55)";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cupL, rimY);
    ctx.lineTo(cupL, botY);
    ctx.lineTo(cupR, botY);
    ctx.lineTo(cupR, rimY);
    ctx.stroke();

    // 드라이아이스 블록(반짝이는 얼음빛 입자들 — 규칙 배열 유지)
    for (const p of block) {
      const shim = 0.75 + Math.sin(tMs / 300 + p.x) * 0.12;
      ctx.fillStyle = `rgba(${ICE},${shim})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y + Math.sin(tMs / 90 + p.x * 3) * 0.7, 6.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.beginPath();
      ctx.arc(p.x - 2, p.y - 2, 1.8, 0, TAU);
      ctx.fill();
    }
    // 냉기(블록 주변 옅은 김)
    ctx.fillStyle = "rgba(196,229,255,.06)";
    ctx.beginPath();
    ctx.ellipse(cx, botY - 22, cupW * 0.4, 26, 0, 0, TAU);
    ctx.fill();

    // 기체 입자
    for (const g of gas) {
      ctx.fillStyle = `rgba(${GAS},.85)`;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 4, 0, TAU);
      ctx.fill();
    }

    // 비누막(무지개빛 돔)
    if (filmOn) {
      const wob = Math.sin(tMs / 240) * 2.4;
      ctx.beginPath();
      ctx.moveTo(cupL - 2, rimY);
      ctx.bezierCurveTo(
        cupL + cupW * 0.18, rimY - filmH - wob,
        cupR - cupW * 0.18, rimY - filmH + wob,
        cupR + 2, rimY,
      );
      const grad = ctx.createLinearGradient(cupL, rimY - filmH, cupR, rimY);
      grad.addColorStop(0, "rgba(255,170,220,.5)");
      grad.addColorStop(0.5, "rgba(170,220,255,.55)");
      grad.addColorStop(1, "rgba(190,255,220,.5)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "rgba(190,215,255,.05)";
      ctx.fill();
    }

    // ---- 완료 판정 ----
    if (!finished && bulge >= 1) {
      finished = true;
      haptic(HAPTIC.ctaUnlock);
      toast("비누막이 빵빵하게 부풀었어요!");
      helper.innerHTML =
        "드라이아이스(고체)가 <b>액체를 거치지 않고 곧장 기체</b>가 되며 부피가 크게 늘어 막을 밀어 올렸어요. 이 상태 변화가 <b>승화</b>예요. 반대로 기체가 곧장 고체가 되는 것(나뭇잎의 서리)도 <b>승화</b>라고 불러요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  });

  /** 돔 곡선 근사(0~1 → 0~1): 가장자리 0, 중앙 1 */
  function domeAt(t: number): number {
    const x = Math.max(0, Math.min(1, t));
    return Math.sin(x * Math.PI);
  }

  const onResize = (): void => {
    fitCanvas(canvas, 260);
    block = [];
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    fitCanvas(canvas, 260);
    loop.start();
  });

  api.setCTA("비누막을 만들어 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
