// heatContact — 열평형 랩(L2).
// 한 수조에 뜨거운 물(80℃)과 찬물(20℃)이 "단열 칸막이"로 나뉘어 있다.
// 칸막이를 위로 뽑아 제거하면 빠른(뜨거운) 입자와 느린(차가운) 입자가 만나
// 충돌할 때마다 열이 고온 → 저온으로 옮겨 가고, 두 그룹의 평균 온도가
// 실시간 그래프에서 한 점(열평형)으로 수렴한다. 입자 하나하나가 온도를 갖는
// 운동론 모형이라, 빨간 입자가 느려지고 파란 입자가 빨라지는 것이 그대로 보인다.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { tempColor, drawGlowParticle } from "../../ui/thermo";
import type { StepRenderer } from "../types";

interface HeatContactStep {
  title: string;
  lead?: string;
  hot?: number; // 기본 80
  cold?: number; // 기본 20
  cta?: string;
}

interface MixP {
  x: number; // 0..1 정규화 좌표
  y: number;
  vx: number; // 정규화/프레임
  vy: number;
  T: number; // ℃ — 입자 개별 온도
  hot: boolean; // 처음에 뜨거운 쪽이었나(그래프 그룹)
  seed: number;
}

const N_SIDE = 16;
const T01 = (v: number): number => clamp((v - 10) / 85, 0, 1);
const SIM_MIN_PER_SEC = 1.35; // 실제 1초 = 그래프 1.35분(빠른 재생)
const X_MAX = 8; // 그래프 가로축(분)
const WALL_N = 0.018; // 칸막이 반두께(정규화)

export const heatContact: StepRenderer = (host, step, api) => {
  const s = step as unknown as HeatContactStep;
  const HOT0 = s.hot ?? 80;
  const COLD0 = s.cold ?? 20;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대 ----
  const canvas = el("canvas", { class: "hc-canvas", style: "height:230px" });
  const hotDot = el("span", { class: "pdot" });
  const coldDot = el("span", { class: "pdot" });
  const hotVal = el("span", { class: "hp-temp", text: `${HOT0}℃` });
  const coldVal = el("span", { class: "hp-temp", text: `${COLD0}℃` });
  const hotName = el("span", { text: "뜨거운 물 " });
  const coldName = el("span", { text: "찬물 " });
  const hud = el(
    "div",
    { class: "stage-hud" },
    el("div", { class: "pill" }, hotDot, hotName, hotVal),
    el("div", { class: "pill" }, coldDot, coldName, coldVal),
  );
  const eqBadge = el("div", { class: "hc-eq", html: "열평형" });
  const stage = el("div", { class: "stage hc-stage" }, canvas, hud, eqBadge);

  // ---- 그래프 ----
  const gCanvas = el("canvas", { class: "hc-gcanvas", style: "height:190px" });
  const legend = el(
    "div",
    { class: "hc-legend" },
    el("span", { class: "hc-leg hot", text: "처음 뜨거웠던 물" }),
    el("span", { class: "hc-leg cold", text: "처음 차가웠던 물" }),
    el("span", { class: "hc-leg note", text: "빠른 재생" }),
  );
  const graph = el("div", { class: "hc-graph" }, legend, gCanvas);

  const runBtn = el("button", { class: "swapbtn", html: "<span>칸막이 제거하기</span>" });
  const helper = el("div", {
    class: "helper",
    html: "가운데 <b>단열 칸막이</b>가 뜨거운 물과 찬물을 나누고 있어요. 칸막이를 제거하면 어떻게 될까요?",
  });
  host.append(stage, graph, runBtn, helper);

  // ---- 상태 ----
  type Phase = "sealed" | "lift" | "mix" | "eq";
  let phase: Phase = "sealed";
  let liftT = 0; // 칸막이 제거 애니메이션 0..1
  let arrowLife = 0; // 제거 직후 열 흐름 화살표 잔광(초)
  let simMin = 0;
  let eqMin = 0;
  let avgH = HOT0;
  let avgC = COLD0;
  let firstDone = false;
  const ps: MixP[] = [];
  const dataH: [number, number][] = [];
  const dataC: [number, number][] = [];
  let lastSample = 0;

  function seed(): void {
    ps.length = 0;
    const mk = (hot: boolean): void => {
      for (let i = 0; i < N_SIDE; i++) {
        ps.push({
          x: hot ? 0.06 + Math.random() * (0.5 - WALL_N - 0.1) : 0.5 + WALL_N + 0.04 + Math.random() * (0.4 - WALL_N),
          y: 0.1 + Math.random() * 0.8,
          vx: (Math.random() - 0.5) * 0.004,
          vy: (Math.random() - 0.5) * 0.004,
          T: hot ? HOT0 : COLD0,
          hot,
          seed: 0.75 + Math.random() * 0.5,
        });
      }
    };
    mk(true);
    mk(false);
  }

  function reset(): void {
    phase = "sealed";
    liftT = 0;
    arrowLife = 0;
    simMin = 0;
    eqMin = 0;
    lastSample = 0;
    avgH = HOT0;
    avgC = COLD0;
    dataH.length = 0;
    dataC.length = 0;
    dataH.push([0, HOT0]);
    dataC.push([0, COLD0]);
    seed();
    eqBadge.classList.remove("show");
    hotName.textContent = "뜨거운 물 ";
    coldName.textContent = "찬물 ";
    runBtn.disabled = false;
    runBtn.innerHTML = "<span>칸막이 제거하기</span>";
    helper.innerHTML =
      "가운데 <b>단열 칸막이</b>가 뜨거운 물과 찬물을 나누고 있어요. 칸막이를 제거하면 어떻게 될까요?";
  }

  runBtn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    if (phase === "sealed") {
      phase = "lift";
      arrowLife = 2.2;
      runBtn.disabled = true;
      runBtn.innerHTML = "<span>열이 이동하는 중…</span>";
      hotName.textContent = "뜨거웠던 물 ";
      coldName.textContent = "차가웠던 물 ";
      helper.innerHTML =
        "칸막이가 사라졌어요! <b>빠르게 움직이던 입자</b>와 <b>느리게 움직이던 입자</b>가 부딪히면서, 열이 <b>뜨거운 물 → 찬물</b>(고온 → 저온)로 옮겨 가요. 그래프를 보세요.";
    } else if (phase === "eq") {
      reset();
    }
  });

  function finishEq(): void {
    eqMin = simMin;
    phase = "eq";
    // 배지가 뜨는 순간 HUD 두 값이 같은 값을 보이도록 평균 쪽으로 강하게 스냅
    const mean = (avgH + avgC) / 2;
    for (const p of ps) p.T = mean + (p.T - mean) * 0.15;
    avgH = mean;
    avgC = mean;
    eqBadge.classList.add("show");
    haptic(HAPTIC.correct);
    runBtn.disabled = false;
    runBtn.innerHTML = "<span>다시 실험하기</span>";
    const eqT = Math.round(mean);
    helper.innerHTML =
      `물 전체의 온도가 <b>약 ${eqT}℃로 고르게 같아졌어요</b> — 이 상태가 <b>열평형</b>이에요. ` +
      "달걀과 찬물처럼 <b>섞이지 않는 두 물체도</b>, 맞닿아 있기만 하면 경계에서 입자들이 부딪히며 똑같이 열이 이동해요.";
    if (!firstDone) {
      firstDone = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 물리 ----
  function stepSim(dt: number): void {
    const dtSec = (dt * 16.7) / 1000;
    if (phase === "lift") {
      liftT = clamp(liftT + dtSec / 0.55, 0, 1);
      if (liftT >= 1) phase = "mix";
    }
    if (arrowLife > 0) arrowLife -= dtSec;

    const sealedWall = phase === "sealed" || (phase === "lift" && liftT < 0.65);
    const steer = 0.0011 * dt;
    for (const p of ps) {
      p.vx += (Math.random() - 0.5) * steer;
      p.vy += (Math.random() - 0.5) * steer;
      const sp = (0.0013 + Math.pow(T01(p.T), 1.15) * 0.0062) * p.seed;
      const v = Math.hypot(p.vx, p.vy) || 1e-6;
      const k = 1 + (sp / v - 1) * Math.min(1, 0.12 * dt);
      p.vx *= k;
      p.vy *= k;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // 수조 벽
      if (p.x < 0.035) { p.x = 0.035; p.vx = Math.abs(p.vx); }
      if (p.x > 0.965) { p.x = 0.965; p.vx = -Math.abs(p.vx); }
      if (p.y < 0.08) { p.y = 0.08; p.vy = Math.abs(p.vy); }
      if (p.y > 0.92) { p.y = 0.92; p.vy = -Math.abs(p.vy); }
      // 칸막이(있는 동안)
      if (sealedWall) {
        if (p.hot && p.x > 0.5 - WALL_N) { p.x = 0.5 - WALL_N; p.vx = -Math.abs(p.vx); }
        if (!p.hot && p.x < 0.5 + WALL_N) { p.x = 0.5 + WALL_N; p.vx = Math.abs(p.vx); }
      }
    }

    // 충돌 열 교환 — 가까운 입자끼리 온도가 섞인다(고온 → 저온)
    if (!sealedWall) {
      const R2 = 0.08 * 0.08;
      const kx = Math.min(0.12, 4.5 * dtSec);
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i];
          const b = ps[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          if (dx * dx + dy * dy < R2) {
            const dT = (b.T - a.T) * kx * 0.5;
            a.T += dT;
            b.T -= dT;
          }
        }
      }
      // 물 자체의 전도(약한 전체 결합) — 늦어지면 세게 당겨 부드럽게 수렴시킨다
      const mean = (avgH + avgC) / 2;
      const couple = (phase === "eq" ? 1.5 : simMin > 6 ? 3.0 : 0.06) * dtSec;
      for (const p of ps) p.T += (mean - p.T) * couple;
    }

    // 그룹 평균 + 그래프 진행
    let sh = 0;
    let sc = 0;
    for (const p of ps) {
      if (p.hot) sh += p.T;
      else sc += p.T;
    }
    avgH = sh / N_SIDE;
    avgC = sc / N_SIDE;

    if (phase === "mix" || phase === "eq") {
      simMin = Math.min(X_MAX, simMin + dtSec * SIM_MIN_PER_SEC);
      if (simMin - lastSample > 0.08 && simMin < X_MAX) {
        lastSample = simMin;
        dataH.push([simMin, avgH]);
        dataC.push([simMin, avgC]);
      }
      if (phase === "mix" && simMin > 0.5 && Math.abs(avgH - avgC) < 3) finishEq();
    }
  }

  // ---- 무대 그리기 ----
  function drawStage(tMs: number): void {
    const { ctx, w, h } = fitCanvas(canvas, 230);
    const bx = 14;
    const bw = w - 28;
    const by = 26;
    const bh = h - 42;
    const X = (nx: number): number => bx + nx * bw;
    const Y = (ny: number): number => by + ny * bh;

    // 수조
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 16);
    ctx.stroke();

    // 칸막이가 있는 동안 좌우 수온 무드
    if (phase === "sealed") {
      ctx.fillStyle = tempColor(T01(avgH), 0.08);
      ctx.fillRect(bx, by, bw / 2 - 4, bh);
      ctx.fillStyle = tempColor(T01(avgC), 0.08);
      ctx.fillRect(bx + bw / 2 + 4, by, bw / 2 - 4, bh);
    }

    // 입자
    for (const p of ps) drawGlowParticle(ctx, X(p.x), Y(p.y), 5.6, T01(p.T), 2);

    // 칸막이(단열판) — 위로 스르륵 뽑힌다
    if (liftT < 1) {
      const rise = (bh + 46) * (1 - Math.pow(1 - liftT, 2)) * (liftT > 0 ? 1 : 0);
      const px = X(0.5) - 5;
      const top = by - 6 - rise;
      const grd = ctx.createLinearGradient(px, 0, px + 10, 0);
      grd.addColorStop(0, "rgba(200,214,235,.55)");
      grd.addColorStop(0.5, "rgba(255,255,255,.9)");
      grd.addColorStop(1, "rgba(180,196,220,.55)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.roundRect(px, top, 10, bh + 12, 5);
      ctx.fill();
      // 손잡이
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.beginPath();
      ctx.roundRect(px - 5, top - 8, 20, 8, 4);
      ctx.fill();
      if (phase === "sealed") {
        ctx.fillStyle = "rgba(210,224,245,.65)";
        ctx.font = "600 11px Pretendard, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("단열 칸막이", X(0.5) + 16, by - 9);
      }
    }

    // 제거 직후 열 흐름 잔광 화살표(고온 → 저온)
    if (arrowLife > 0 && phase !== "sealed") {
      const a0 = clamp(arrowLife / 2.2, 0, 1) * 0.9;
      const flow = (tMs / 300) % 1;
      for (let row = 0; row < 3; row++) {
        const y = Y(0.28 + row * 0.22);
        for (let k = 0; k < 3; k++) {
          const f = (flow + k / 3) % 1;
          const x = X(0.5) - 30 + f * 60;
          const a = a0 * Math.sin(f * Math.PI);
          ctx.strokeStyle = `rgba(255,159,67,${a.toFixed(3)})`;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x - 5, y - 6);
          ctx.lineTo(x + 3, y);
          ctx.lineTo(x - 5, y + 6);
          ctx.stroke();
        }
      }
    }
  }

  // ---- 그래프 그리기 ----
  function drawGraph(): void {
    const { ctx, w, h } = fitCanvas(gCanvas, 190);
    const L = 40;
    const R = 12;
    const T = 14;
    const B = 30;
    const pw = w - L - R;
    const ph = h - T - B;
    const gx = (min: number): number => L + (min / X_MAX) * pw;
    const gy = (temp: number): number => T + (1 - (temp - 10) / 80) * ph; // 10~90℃

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#EDF0F4";
    ctx.lineWidth = 1;
    ctx.font = "500 10px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "#8B95A1";
    for (const tv of [20, 40, 60, 80]) {
      ctx.beginPath();
      ctx.moveTo(L, gy(tv));
      ctx.lineTo(w - R, gy(tv));
      ctx.stroke();
      ctx.fillText(String(tv), L - 6, gy(tv) + 3.5);
    }
    ctx.textAlign = "center";
    for (let m = 0; m <= X_MAX; m += 2) {
      ctx.beginPath();
      ctx.moveTo(gx(m), T);
      ctx.lineTo(gx(m), T + ph);
      ctx.stroke();
      ctx.fillText(String(m), gx(m), h - B + 14);
    }
    ctx.strokeStyle = "#C4CAD2";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(L, T);
    ctx.lineTo(L, T + ph);
    ctx.lineTo(w - R, T + ph);
    ctx.stroke();
    ctx.fillStyle = "#6B7684";
    ctx.textAlign = "left";
    ctx.fillText("온도(℃)", L + 4, T - 2);
    ctx.textAlign = "right";
    ctx.fillText("시간(분)", w - R, h - 4);

    if (phase === "eq") {
      const eqT = (avgH + avgC) / 2;
      ctx.strokeStyle = "rgba(4,180,95,.8)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(gx(eqMin), gy(eqT));
      ctx.lineTo(w - R, gy(eqT));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#04B45F";
      ctx.textAlign = "left";
      ctx.font = "700 11px Pretendard, sans-serif";
      ctx.fillText(`열평형 ${Math.round(eqT)}℃`, gx(Math.min(eqMin + 0.2, X_MAX - 2)), gy(eqT) - 7);
    }

    const drawSeries = (data: [number, number][], color: string): void => {
      if (data.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      data.forEach(([m, tv], i) => {
        if (i === 0) ctx.moveTo(gx(m), gy(tv));
        else ctx.lineTo(gx(m), gy(tv));
      });
      ctx.stroke();
      const [lm, lt] = data[data.length - 1];
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(gx(lm), gy(lt), 3.4, 0, Math.PI * 2);
      ctx.fill();
    };
    drawSeries(dataH, "#FF6B4A");
    drawSeries(dataC, "#3182F6");
  }

  // ---- 메인 루프 ----
  const loop: Loop = createLoop((dt, tMs) => {
    stepSim(dt);
    hotVal.textContent = `${Math.round(avgH)}℃`;
    coldVal.textContent = `${Math.round(avgC)}℃`;
    hotDot.style.background = tempColor(T01(avgH));
    coldDot.style.background = tempColor(T01(avgC));
    drawStage(tMs);
    drawGraph();
  });

  api.setCTA("칸막이를 제거해 관찰하세요", { enabled: false });
  const rafId = requestAnimationFrame(() => {
    reset();
    loop.start();
  });

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
