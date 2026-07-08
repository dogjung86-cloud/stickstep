// balloonUniverse — 풍선 우주(중2 VIII L7, 책 302쪽 탐구 '풍선 우주 모형'의 조작판).
//   · "바람 넣기"를 꾹 누르면 풍선이 부풀고, 표면의 은하 딱지 사이 간격이 전부 함께 늘어난다
//   · 은하 딱지를 탭하면 그 은하의 시점 — 다른 은하들이 전부 자기에게서 멀어지는 화살표.
//     어느 은하를 골라도 똑같다 = 팽창하는 우주에는 특별한 중심이 없다!
//   · 화살표 길이 = 그 은하까지 표면 거리가 늘어난 양(비례) — 멀수록 빨리 멀어진다(허블 법칙)
// 목표: ① 우주 부풀리기(1.5배) ② 시점 바꿔 보기(은하 2곳) ③ 멀수록 빨리(시점 켠 채 부풀리기).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { capturePointer } from "../../ui/lightKit";
import { curioCard } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: { q: string; a: string };
}

const CVH = 356;
const R0 = 74; // 시작 반지름
const R_MAX = 148;
// 은하 딱지 — 풍선 표면 각도(고정) — 팽창해도 각도는 그대로, 거리만 늘어난다
const GAL_TH = [-2.35, -1.55, -0.7, 0.25, 1.05, 2.05];
const GAL_HUE = ["#9CA8FF", "#FFD98A", "#8AE0C8", "#F2A0C8", "#9CD2FF", "#FFB56A"];

export const balloonUniverse: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge star", dataset: { g: "grow" } }, el("b", { text: "우주 부풀리기" }), el("span", { text: "꾹 눌러 1.5배" })),
    el("div", { class: "pn-badge star", dataset: { g: "view" } }, el("b", { text: "시점 바꾸기" }), el("span", { text: "은하 딱지 탭" })),
    el("div", { class: "pn-badge star", dataset: { g: "law" } }, el("b", { text: "멀수록 빨리" }), el("span", { text: "시점 켜고 불기" })),
  );

  const canvas = el("canvas", { class: "mstage-cvblock", style: `height:${CVH}px` });
  const statusPill = el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#9CA8FF" }), el("span", { text: "은하 딱지를 탭해 보세요" }));
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "펌프를 꾹 — 풍선 표면의 은하들을 관찰!" });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, statusPill), toastEl, capEl);

  const pumpBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "바람 넣기 (꾹)" }));
  const resetBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "바람 빼기" }));
  const btnRow = el("div", { class: "gp-controls" }, pumpBtn, resetBtn);

  const helper = el("div", {
    class: "helper",
    html: "풍선 표면 = 우주, 딱지 = 은하. 풍선이 부풀면 <b>모든 딱지 사이가 한꺼번에</b> 멀어져요 — 은하가 움직이는 게 아니라 <b>공간 자체가 늘어나는</b> 거예요.",
  });
  host.append(goalChips, stage, btnRow, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let R = R0;
  let pumping = false;
  let picked = -1; // 시점 은하
  const viewSet = new Set<number>();
  let lawBaseR = 0; // 시점 켠 시점의 반지름(법칙 판정용)
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;

  const cx = (): number => W / 2;
  const cyv = (): number => CVH / 2 + 8;
  const galPos = (i: number, rr = R): { x: number; y: number } => ({
    x: cx() + Math.cos(GAL_TH[i]) * rr,
    y: cyv() + Math.sin(GAL_TH[i]) * rr * 0.92, // 살짝 납작(풍선 원근)
  });

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2000);
  }

  function collect(id: "grow" | "view" | "law", subText: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 우주가 팽창하면 <b>모든 은하가 서로에게서</b> 멀어져요 — 어느 은하에서 봐도 똑같으니 <b>특별한 중심은 없어요</b>. 그리고 <b>멀리 있는 은하일수록 더 빨리</b> 멀어졌죠(같은 시간에 더 많이 늘어나니까).";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  // ---- 입력 ----
  const pumpDown = (e: PointerEvent): void => {
    pumping = true;
    capturePointer(pumpBtn, e);
    pumpBtn.classList.remove("pulse");
    haptic(HAPTIC.tap);
  };
  const pumpUp = (): void => {
    pumping = false;
  };
  pumpBtn.addEventListener("pointerdown", pumpDown);
  pumpBtn.addEventListener("pointerup", pumpUp);
  pumpBtn.addEventListener("pointercancel", pumpUp);
  pumpBtn.addEventListener("pointerleave", pumpUp);
  const onReset = (): void => {
    R = R0;
    lawBaseR = picked >= 0 ? R0 : lawBaseR;
    haptic(HAPTIC.tap);
  };
  resetBtn.addEventListener("click", onReset);

  const onTap = (e: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    for (let i = 0; i < GAL_TH.length; i++) {
      const p = galPos(i);
      if (Math.hypot(px - p.x, py - p.y) < 26) {
        picked = i;
        lawBaseR = R;
        viewSet.add(i);
        haptic(HAPTIC.tap);
        (statusPill.lastElementChild as HTMLElement).textContent = "이 은하에서 보면 — 모두 나에게서 멀어져요!";
        if (viewSet.size >= 2) collect("view", "어디서 봐도 같아!", "시점을 바꿔도 똑같이 멀어져요 — 중심이 없어요!");
        return;
      }
    }
  };
  canvas.addEventListener("pointerdown", onTap);

  // ---- 은하 딱지 그리기(작은 나선) ----
  function drawGalaxy(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isPicked: boolean, tMs: number): void {
    ctx.save();
    ctx.translate(x, y);
    if (isPicked) {
      const pul = 16 + Math.sin(tMs / 320) * 2;
      ctx.strokeStyle = "rgba(255,236,170,.9)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, pul, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.rotate(tMs / 4200);
    // 나선 두 팔
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    for (const ph of [0, Math.PI]) {
      ctx.beginPath();
      for (let t = 0; t <= 1.9; t += 0.16) {
        const rr = 2.2 + t * 4.6;
        const a = ph + t * 2.4;
        const gx = Math.cos(a) * rr;
        const gy = Math.sin(a) * rr * 0.78;
        if (t === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.stroke();
    }
    ctx.fillStyle = "#FFF4DC";
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;

    // 부풀기
    if (pumping) {
      R = clamp(R + dt * 0.62, R0, R_MAX);
      if (R >= R0 * 1.5) collect("grow", "모두 멀어졌어요!", "풍선이 커지자 모든 딱지 사이가 멀어졌어요!");
      if (picked >= 0 && R >= lawBaseR * 1.3 && lawBaseR > 0) {
        collect("law", "긴 화살표 = 먼 은하!", "먼 은하일수록 화살표가 길어요 — 더 빨리 멀어진다!");
      }
    }

    const bx = cx();
    const by = cyv();

    // 배경 잔별
    for (let i = 0; i < 24; i++) {
      const sx = (i * 887) % W;
      const sy = (i * 541) % (CVH - 30);
      ctx.fillStyle = `rgba(214,226,246,${0.2 + 0.18 * Math.sin(tMs / 900 + i)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // 풍선(유리질 구) — 파운드리 문법: 3스톱 면 + 키라이트 + 최암색 윤곽
    const wob = pumping ? Math.sin(tMs / 90) * 1.2 : 0;
    const RR = R + wob;
    const body = ctx.createRadialGradient(bx - RR * 0.34, by - RR * 0.42, RR * 0.12, bx, by, RR * 1.04);
    body.addColorStop(0, "rgba(120,144,232,.34)");
    body.addColorStop(0.6, "rgba(66,84,168,.22)");
    body.addColorStop(1, "rgba(34,44,96,.30)");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(bx, by, RR, RR * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(140,158,255,.55)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // 키라이트
    ctx.fillStyle = "rgba(236,244,255,.28)";
    ctx.beginPath();
    ctx.ellipse(bx - RR * 0.38, by - RR * 0.46, RR * 0.2, RR * 0.11, -0.6, 0, Math.PI * 2);
    ctx.fill();
    // 꼭지
    ctx.fillStyle = "rgba(140,158,255,.7)";
    ctx.beginPath();
    ctx.moveTo(bx - 7, by + RR * 0.92);
    ctx.lineTo(bx + 7, by + RR * 0.92);
    ctx.lineTo(bx, by + RR * 0.92 + 12);
    ctx.closePath();
    ctx.fill();

    // 시점 화살표 — 선택 은하 → 다른 은하(표면 호 방향), 길이 ∝ 표면 거리(허블 법칙)
    if (picked >= 0) {
      const p0 = galPos(picked);
      for (let i = 0; i < GAL_TH.length; i++) {
        if (i === picked) continue;
        const p1 = galPos(i);
        let dth = GAL_TH[i] - GAL_TH[picked];
        while (dth > Math.PI) dth -= Math.PI * 2;
        while (dth < -Math.PI) dth += Math.PI * 2;
        const surf = Math.abs(dth) * R; // 표면 거리
        const dirX = p1.x - p0.x;
        const dirY = p1.y - p0.y;
        const dl = Math.hypot(dirX, dirY) || 1;
        const ux = dirX / dl;
        const uy = dirY / dl;
        const ax0 = p1.x + ux * 14;
        const ay0 = p1.y + uy * 14;
        const len = 8 + surf * 0.16;
        const ax1 = ax0 + ux * len;
        const ay1 = ay0 + uy * len;
        ctx.strokeStyle = "rgba(255,214,120,.85)";
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ax0, ay0);
        ctx.lineTo(ax1, ay1);
        ctx.stroke();
        // 화살촉
        const ang = Math.atan2(ay1 - ay0, ax1 - ax0);
        ctx.fillStyle = "rgba(255,214,120,.9)";
        ctx.beginPath();
        ctx.moveTo(ax1 + Math.cos(ang) * 7, ay1 + Math.sin(ang) * 7);
        ctx.lineTo(ax1 + Math.cos(ang + 2.5) * 6, ay1 + Math.sin(ang + 2.5) * 6);
        ctx.lineTo(ax1 + Math.cos(ang - 2.5) * 6, ay1 + Math.sin(ang - 2.5) * 6);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 은하 딱지
    for (let i = 0; i < GAL_TH.length; i++) {
      const p = galPos(i);
      drawGalaxy(ctx, p.x, p.y, GAL_HUE[i], i === picked, tMs);
    }

    // 반지름 게이지(우하단)
    ctx.font = "600 10.5px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(196,212,232,.6)";
    ctx.fillText(`우주 크기 ×${(R / R0).toFixed(2)}`, W - 14, CVH - 12);
  });

  const onResize = (): void => {
    fitCanvas(canvas, CVH);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("부풀리고 · 시점 바꾸고 · 법칙 찾기", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    pumpBtn.removeEventListener("pointerdown", pumpDown);
    pumpBtn.removeEventListener("pointerup", pumpUp);
    pumpBtn.removeEventListener("pointercancel", pumpUp);
    pumpBtn.removeEventListener("pointerleave", pumpUp);
    resetBtn.removeEventListener("click", onReset);
    canvas.removeEventListener("pointerdown", onTap);
  };
};
