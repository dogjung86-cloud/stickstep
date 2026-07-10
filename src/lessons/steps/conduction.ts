// conduction — 전도 랩(L3).
// 1부: 고체 막대(입자 격자)의 왼쪽 끝을 가열하면 진동이 이웃 입자에 차례로 전달되는
//      릴레이를 관찰한다(입자는 제자리 — 흔들림만 이동).
// 2부: 구리·철·유리 3막대 레이스 — 어느 막대가 가장 빨리 끝까지 뜨거워질지 "예측"하고
//      실행해 확인한다(예측이 채점됨).

import { el, clamp, clear } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawFlame, drawGlowParticle } from "../../ui/thermo";
import { contactShadow, softGlow } from "../../ui/labProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ConductionStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const COLS = 16;
const RACERS = [
  { key: "구리", rate: 0.34, note: "금속" },
  { key: "철", rate: 0.13, note: "금속" },
  { key: "유리", rate: 0.02, note: "비금속" },
];

export const conduction: StepRenderer = (host, step, api) => {
  const s = step as unknown as ConductionStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "cd-canvas", style: "height:240px" });
  const modePill = el("div", { class: "pill" }, el("span", { class: "pdot" }), el("span", { class: "cd-mode", text: "고체 막대의 입자" }));
  const hud = el("div", { class: "stage-hud" }, modePill, el("div", {}));
  const stage = el("div", { class: "stage cd-stage" }, canvas, hud);
  const controls = el("div", { class: "cd-controls" });
  const helper = el("div", {
    class: "helper",
    html: "고체 막대 속 입자들은 <b>제자리에서</b> 가볍게 떨고 있어요. 왼쪽 끝을 가열하면 무슨 일이 생길까요?",
  });
  host.append(helper, stage, controls); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  type Mode = "relay" | "pick" | "race" | "done";
  let mode: Mode = "relay";
  let heating = false;
  let relayDone = false;
  const T: number[] = new Array(COLS).fill(0); // 컬럼별 열(0..1)
  const phases: number[] = Array.from({ length: COLS * 2 }, () => Math.random() * Math.PI * 2);
  let picked = -1;
  const fronts = [0, 0, 0];
  let raceOver = false;
  let raceExtra = 0;

  // ---- 1부 컨트롤 ----
  const heatBtn = el("button", { class: "swapbtn", html: "<span>왼쪽 끝 가열하기</span>" });
  heatBtn.addEventListener("click", () => {
    if (heating) return;
    heating = true;
    haptic(HAPTIC.select);
    heatBtn.disabled = true;
    heatBtn.innerHTML = "<span>가열 중…</span>";
    helper.innerHTML =
      "가열된 끝의 입자가 <b>활발하게 흔들리기 시작</b>했어요. 그 흔들림이 <b>이웃 입자에게 차례로</b> 번져 가는 걸 보세요.";
  });
  controls.appendChild(heatBtn);

  function toPick(): void {
    mode = "pick";
    (modePill.querySelector(".cd-mode") as HTMLElement).textContent = "전도 레이스 — 예측하기";
    clear(controls);
    const row = el("div", { class: "cd-pick" });
    RACERS.forEach((r, i) => {
      const b = el(
        "button",
        { class: "cd-pick-btn" },
        el("span", { class: "cd-pick-name", text: r.key }),
        el("span", { class: "cd-pick-note", text: r.note }),
      );
      b.addEventListener("click", () => {
        if (mode !== "pick") return;
        haptic(HAPTIC.select);
        picked = i;
        row.querySelectorAll(".cd-pick-btn").forEach((x, k) => x.classList.toggle("sel", k === i));
        startRace();
      });
      row.appendChild(b);
    });
    controls.appendChild(row);
    window.setTimeout(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    helper.innerHTML =
      "이번엔 <b>구리·철·유리</b> 세 막대의 왼쪽 끝을 <b>동시에</b> 가열할 거예요. 어느 막대의 끝이 <b>가장 빨리</b> 뜨거워질까요? 하나를 골라 보세요.";
  }

  function startRace(): void {
    window.setTimeout(() => {
      mode = "race";
      (modePill.querySelector(".cd-mode") as HTMLElement).textContent = "전도 레이스 — 관찰";
      helper.innerHTML = "세 막대를 동시에 가열하고 있어요. 열이 번져 가는 <b>속도 차이</b>를 보세요.";
    }, 350);
  }

  function finishRace(): void {
    raceOver = true;
    mode = "done";
    const good = picked === 0;
    api.recordQuiz(good);
    const reason =
      "열이 전도되는 정도는 <b>물질의 종류에 따라 달라요</b>. 열은 유리보다 <b>금속</b>에서 잘 이동하고, 같은 금속이라도 <b>구리가 철보다</b> 빨라요. 그래서 프라이팬 바닥은 금속으로, 손잡이는 열이 잘 전도되지 않는 플라스틱이나 나무로 만들죠.";
    window.setTimeout(() => {
      api.openSheet({
        good,
        title: good ? "예측 성공! 구리가 1등" : `1등은 구리였어요`,
        html: good
          ? `정확해요. <b>구리 → 철 → 유리</b> 순서로 열이 빨리 전도됐어요. ${reason}`
          : `${picked === 2 ? "유리는 열이 거의 전도되지 않아 꼴찌였어요." : "철도 금속이라 빠르지만, 구리가 더 빨랐어요."} 결과는 <b>구리 → 철 → 유리</b> 순. ${reason}`,
      });
      helper.innerHTML =
        "결과: <b>구리 → 철 → 유리</b>. 열은 금속에서 잘 전도되고, 금속의 종류에 따라서도 정도가 달라요.";
      api.enableCTA(s.cta ?? "개념 정리하기");
    }, 500);
  }

  // ---- 그리기 ----
  function drawRelay(ctx: CanvasRenderingContext2D, w: number, h: number, tMs: number, dt: number): void {
    const dtSec = (dt * 16.7) / 1000;
    if (heating) {
      T[0] = clamp(T[0] + 1.6 * dtSec, 0, 1);
      T[1] = clamp(T[1] + 0.5 * dtSec, 0, 1);
    }
    // 이웃으로 번지는 열(확산) — 오른쪽 끝까지 약 6초
    const k = Math.min(0.5, 30 * dtSec);
    const prev = T.slice();
    for (let i = 0; i < COLS; i++) {
      const left = prev[Math.max(0, i - 1)];
      const right = prev[Math.min(COLS - 1, i + 1)];
      T[i] += ((left + right) / 2 - T[i]) * k;
    }

    const x0 = 34;
    const x1 = w - 34;
    const sx = (x1 - x0) / (COLS - 1);
    const cy = h * 0.46;
    const sy = 22;

    // 막대 몸통(입자 뒤 금속 판) — 세로 그라데이션 + 끝단 셰이딩 + 접촉 그림자
    const rx0 = x0 - 16;
    const ry0 = cy - sy - 15;
    const rw = x1 - x0 + 32;
    const rh = sy * 2 + 30;
    contactShadow(ctx, (x0 + x1) / 2, ry0 + rh + 16, (x1 - x0) * 0.5, 0.22);
    const rodBody = ctx.createLinearGradient(0, ry0, 0, ry0 + rh);
    rodBody.addColorStop(0, "rgba(226,240,255,.13)");
    rodBody.addColorStop(0.55, "rgba(150,176,214,.055)");
    rodBody.addColorStop(1, "rgba(92,116,155,.10)");
    ctx.fillStyle = rodBody;
    ctx.beginPath();
    ctx.roundRect(rx0, ry0, rw, rh, 14);
    ctx.fill();
    // 양 끝단(단면)은 살짝 어둡게
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(rx0, ry0, rw, rh, 14);
    ctx.clip();
    const capL = ctx.createLinearGradient(rx0, 0, rx0 + 22, 0);
    capL.addColorStop(0, "rgba(7,15,30,.26)");
    capL.addColorStop(1, "rgba(7,15,30,0)");
    ctx.fillStyle = capL;
    ctx.fillRect(rx0, ry0, 22, rh);
    const capR = ctx.createLinearGradient(rx0 + rw - 22, 0, rx0 + rw, 0);
    capR.addColorStop(0, "rgba(7,15,30,0)");
    capR.addColorStop(1, "rgba(7,15,30,.26)");
    ctx.fillStyle = capR;
    ctx.fillRect(rx0 + rw - 22, ry0, 22, rh);
    ctx.restore();
    // 윤곽(위 밝은 그라데이션) + 윗면 하이라이트 선
    const rodEdge = ctx.createLinearGradient(0, ry0, 0, ry0 + rh);
    rodEdge.addColorStop(0, "rgba(226,240,255,.28)");
    rodEdge.addColorStop(1, "rgba(130,158,198,.10)");
    ctx.strokeStyle = rodEdge;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(rx0, ry0, rw, rh, 14);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rx0 + 13, ry0 + 2.2);
    ctx.lineTo(rx0 + rw - 13, ry0 + 2.2);
    ctx.stroke();

    // 결합선(격자) — 입자가 "제자리"임을 보여주는 뼈대
    ctx.strokeStyle = "rgba(140,170,215,.16)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < COLS - 1; i++) {
      for (let r = 0; r < 2; r++) {
        const y = cy + (r === 0 ? -sy / 2 : sy / 2);
        ctx.beginPath();
        ctx.moveTo(x0 + i * sx, y);
        ctx.lineTo(x0 + (i + 1) * sx, y);
        ctx.stroke();
      }
    }

    // 입자(진폭·색 = 그 컬럼의 열)
    for (let i = 0; i < COLS; i++) {
      const heat = T[i];
      const amp = 0.7 + heat * 4.6;
      const freq = 0.012 + heat * 0.012;
      for (let r = 0; r < 2; r++) {
        const idx = i * 2 + r;
        const ox = Math.sin(tMs * freq + phases[idx]) * amp;
        const oy = Math.cos(tMs * (freq * 0.92) + phases[idx] * 1.3) * amp;
        const y = cy + (r === 0 ? -sy / 2 : sy / 2);
        drawGlowParticle(ctx, x0 + i * sx + ox, y + oy, 6.4, 0.05 + heat * 0.92, heat > 0.12 ? 2.1 : 1);
      }
    }

    if (heating) {
      softGlow(ctx, x0, h - 35, 52, "255,150,60", 0.2);
      drawFlame(ctx, x0, h - 18, 34, tMs);
    }
    ctx.fillStyle = "rgba(220,236,255,.62)";
    ctx.font = "600 11.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(heating ? "가열" : "가열 전", x0 - 14, h - 8);
    ctx.textAlign = "right";
    ctx.fillText("손잡이 끝", x1 + 14, cy - sy - 24);

    if (!relayDone && T[COLS - 1] > 0.4) {
      relayDone = true;
      haptic(HAPTIC.ctaUnlock);
      helper.innerHTML =
        "반대쪽 끝까지 뜨거워졌어요! 입자는 <b>제자리에서 흔들리기만</b> 하는데, 그 <b>운동이 릴레이처럼</b> 전달돼 열이 이동했죠. 이것이 <b>전도</b>예요.";
      clear(controls);
      const nextBtn = el("button", { class: "swapbtn", html: "<span>다음 실험 — 어떤 막대가 빠를까?</span>" });
      nextBtn.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        toPick();
      });
      controls.appendChild(nextBtn);
      window.setTimeout(() => nextBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }
  }

  function drawRace(ctx: CanvasRenderingContext2D, w: number, h: number, tMs: number, dt: number): void {
    const dtSec = (dt * 16.7) / 1000;
    const x0 = 74;
    const x1 = w - 26;
    const laneW = x1 - x0;

    if (mode === "race" && !raceOver) {
      for (let i = 0; i < 3; i++) fronts[i] = clamp(fronts[i] + RACERS[i].rate * dtSec, 0, 1);
      if (fronts[0] >= 1) {
        raceExtra += dtSec;
        if (raceExtra > 1.15) finishRace();
      }
    }

    for (let i = 0; i < 3; i++) {
      const cy = 56 + i * ((h - 74) / 2); // HUD 필 아래에서 시작해 세 레인 배치
      const f = fronts[i];
      // 레인 라벨
      ctx.fillStyle = picked === i ? "rgba(226,240,255,.95)" : "rgba(175,195,227,.85)";
      ctx.font = `${picked === i ? 800 : 600} 13px Pretendard, sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(RACERS[i].key, 26, cy + 4);
      // 막대 바탕(차가움) — 막대 축 수직 그라데이션 금속(위 밝음)
      const cold = ctx.createLinearGradient(0, cy - 8, 0, cy + 8);
      cold.addColorStop(0, "#334770");
      cold.addColorStop(0.5, "#22335C");
      cold.addColorStop(1, "#192646");
      ctx.fillStyle = cold;
      ctx.beginPath();
      ctx.roundRect(x0, cy - 8, laneW, 16, 8);
      ctx.fill();
      // 열 프런트
      const fw = laneW * f;
      if (f > 0.015) {
        const grd = ctx.createLinearGradient(x0, 0, x0 + fw, 0);
        grd.addColorStop(0, "#FFE9A8");
        grd.addColorStop(0.55, "#FF9F43");
        grd.addColorStop(1, "#F0442E");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.roundRect(x0, cy - 8, fw, 16, 8);
        ctx.fill();
      }
      // 금속 셰이딩(원기둥 느낌) — 프런트 색 위에도 같은 결로 얹는다
      const sheen = ctx.createLinearGradient(0, cy - 8, 0, cy + 8);
      sheen.addColorStop(0, "rgba(255,255,255,.18)");
      sheen.addColorStop(0.38, "rgba(255,255,255,.04)");
      sheen.addColorStop(1, "rgba(6,14,28,.22)");
      ctx.fillStyle = sheen;
      ctx.beginPath();
      ctx.roundRect(x0, cy - 8, laneW, 16, 8);
      ctx.fill();
      // 먼 끝단(단면)은 살짝 어둡게
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x0, cy - 8, laneW, 16, 8);
      ctx.clip();
      const laneCap = ctx.createLinearGradient(x1 - 16, 0, x1, 0);
      laneCap.addColorStop(0, "rgba(6,14,28,0)");
      laneCap.addColorStop(1, "rgba(6,14,28,.30)");
      ctx.fillStyle = laneCap;
      ctx.fillRect(x1 - 16, cy - 8, 16, 16);
      ctx.restore();
      // 프런트 글로우
      if (f > 0.015) {
        const gx = x0 + fw;
        const glow = ctx.createRadialGradient(gx, cy, 1, gx, cy, 18);
        glow.addColorStop(0, "rgba(255,159,67,.55)");
        glow.addColorStop(1, "rgba(255,159,67,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(gx, cy, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      // 윤곽(위 밝은 그라데이션) + 윗면 하이라이트 선
      const laneEdge = ctx.createLinearGradient(0, cy - 8, 0, cy + 8);
      laneEdge.addColorStop(0, "rgba(226,240,255,.30)");
      laneEdge.addColorStop(1, "rgba(120,148,190,.12)");
      ctx.strokeStyle = laneEdge;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(x0, cy - 8, laneW, 16, 8);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.24)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x0 + 7, cy - 5.6);
      ctx.lineTo(x1 - 7, cy - 5.6);
      ctx.stroke();
      // 레인마다 왼쪽 끝을 동시에 가열
      if (mode === "race" || mode === "done") {
        softGlow(ctx, x0 + 8, cy + 18, 30, "255,150,60", 0.18);
        drawFlame(ctx, x0 + 8, cy + 27, 17, tMs + i * 300);
      }
      // 완주 체크
      if (f >= 1) {
        ctx.fillStyle = "#04B45F";
        ctx.beginPath();
        ctx.arc(x1 + 0, cy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1 - 3.6, cy);
        ctx.lineTo(x1 - 1, cy + 3);
        ctx.lineTo(x1 + 4, cy - 3);
        ctx.stroke();
      }
    }
  }

  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 240);
    if (mode === "relay") drawRelay(ctx, w, h, tMs, dt);
    else drawRace(ctx, w, h, tMs, dt);
  });

  api.setCTA("막대를 가열해 전도를 관찰하세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
