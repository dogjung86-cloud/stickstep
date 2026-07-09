// specificHeat — 비열 랩(L4).
// 질량이 같은 물과 식용유를 같은 가열 장치로 "동시에" 가열하는 교과서 탐구(96~97쪽) 재현.
// 1) 예측 — 어느 쪽이 먼저 60℃에 닿을까?  2) 가열 레이스 — 실시간 그래프에서 식용유가
// 두 배쯤 가파르게 오른다(비열비 약 0.47).  3) 불 끄고 식히기 — 빨리 데워진 쪽이
// 빨리 식는 것까지 확인해 "비열이 작다 = 온도가 잘 변한다"를 양방향으로 각인한다.

import { el, clamp, clear } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { tempColor, drawFlame } from "../../ui/thermo";
import { contactShadow, glassVessel, liquidFill, softGlow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface SpecificHeatStep {
  title: string;
  lead?: string;
  cta?: string;
}

const T0 = 20; // 시작·실온(℃)
const GOAL = 60; // 레이스 목표(℃)
const C_OIL = 0.47; // 물 대비 식용유의 상대 비열
const HEAT_W = 4.6; // 물의 상승률(℃/분)
const SIM_MIN_PER_SEC = 1.7;
const X_MAX = 10;
const T01 = (v: number): number => clamp((v - 10) / 85, 0, 1);

export const specificHeat: StepRenderer = (host, step, api) => {
  const s = step as unknown as SpecificHeatStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대 ----
  const canvas = el("canvas", { class: "hc-canvas", style: "height:210px" });
  const wDot = el("span", { class: "pdot" });
  const oDot = el("span", { class: "pdot" });
  const wVal = el("span", { class: "hp-temp", text: `${T0}℃` });
  const oVal = el("span", { class: "hp-temp", text: `${T0}℃` });
  const hud = el(
    "div",
    { class: "stage-hud" },
    el("div", { class: "pill" }, wDot, el("span", { text: "물 " }), wVal),
    el("div", { class: "pill" }, oDot, el("span", { text: "식용유 " }), oVal),
  );
  const stage = el("div", { class: "stage hc-stage" }, canvas, hud);

  // ---- 그래프 ----
  const gCanvas = el("canvas", { class: "hc-gcanvas", style: "height:190px" });
  const legend = el(
    "div",
    { class: "hc-legend" },
    el("span", { class: "hc-leg cold", text: "물" }),
    el("span", { class: "hc-leg oil", text: "식용유" }),
    el("span", { class: "hc-leg note", text: "빠른 재생" }),
  );
  const graph = el("div", { class: "hc-graph" }, legend, gCanvas);

  const controls = el("div", { class: "cd-controls" });
  const helper = el("div", {
    class: "helper",
    html: "두 비커에 <b>질량이 같은</b> 물과 식용유를 담고, <b>같은 세기의 불</b>로 동시에 데울 거예요. 어느 쪽이 먼저 60℃에 닿을까요?",
  });
  host.append(stage, graph, controls, helper);

  // ---- 상태 ----
  type Phase = "pick" | "heat" | "verdict" | "cool" | "done";
  let phase: Phase = "pick";
  let Tw = T0;
  let To = T0;
  let simMin = 0;
  let lastSample = 0;
  let crossed = false;
  let picked = -1;
  const dataW: [number, number][] = [[0, T0]];
  const dataO: [number, number][] = [[0, T0]];

  // ---- 컨트롤 ----
  function showPick(): void {
    clear(controls);
    const row = el("div", { class: "cd-pick" });
    const OPTS = [
      { name: "물", note: "이 담긴 비커" },
      { name: "식용유", note: "가 담긴 비커" },
      { name: "동시에", note: "닿는다" },
    ];
    OPTS.forEach((o, i) => {
      const b = el(
        "button",
        { class: "cd-pick-btn" },
        el("span", { class: "cd-pick-name", text: o.name }),
        el("span", { class: "cd-pick-note", text: o.note }),
      );
      b.addEventListener("click", () => {
        if (phase !== "pick") return;
        haptic(HAPTIC.select);
        picked = i;
        row.querySelectorAll(".cd-pick-btn").forEach((x, k) => x.classList.toggle("sel", k === i));
        window.setTimeout(() => {
          phase = "heat";
          helper.innerHTML = "가열 시작! 두 불꽃의 세기는 <b>완전히 같아요</b>. 그래프의 두 곡선을 비교해 보세요.";
        }, 350);
      });
      row.appendChild(b);
    });
    controls.appendChild(row);
  }

  function showCoolBtn(): void {
    clear(controls);
    const b = el("button", { class: "swapbtn", html: "<span>불 끄고 식히기</span>" });
    b.addEventListener("click", () => {
      if (phase !== "verdict") return;
      haptic(HAPTIC.select);
      phase = "cool";
      crossed = false;
      helper.innerHTML = "불을 껐어요. 이번엔 <b>어느 쪽이 먼저 식는지</b> 보세요.";
      b.disabled = true;
      b.innerHTML = "<span>식는 중…</span>";
    });
    controls.appendChild(b);
  }

  function showResetBtn(): void {
    clear(controls);
    const b = el("button", { class: "swapbtn", html: "<span>다시 실험하기</span>" });
    b.addEventListener("click", () => {
      if (phase === "verdict" || phase === "cool") return; // 판정·냉각 중 리셋 금지
      haptic(HAPTIC.tap);
      Tw = T0;
      To = T0;
      simMin = 0;
      lastSample = 0;
      crossed = false;
      dataW.length = 0;
      dataO.length = 0;
      dataW.push([0, T0]);
      dataO.push([0, T0]);
      phase = "heat"; // 예측은 한 번만 — 재실험은 바로 가열
      helper.innerHTML = "다시 가열! 이번엔 그래프의 <b>기울기 차이</b>에 집중해 보세요.";
    });
    controls.appendChild(b);
  }

  function verdict(): void {
    phase = "verdict";
    const good = picked === 1;
    api.recordQuiz(good);
    window.setTimeout(() => {
      if (phase !== "verdict") return; // 그 사이 리셋됐다면 낡은 판정 무시
      api.openSheet({
        good,
        title: good ? "예측 성공! 식용유가 먼저" : "먼저 닿은 건 식용유예요",
        html:
          (good ? "정확해요. " : picked === 0 ? "물은 오히려 가장 느긋했어요. " : "동시에 오르지 않았죠. ") +
          "같은 양의 열을 받아도 <b>식용유는 온도가 잘 변하고, 물은 잘 변하지 않아요</b>. 이렇게 물질마다 온도 변화에 필요한 열량이 다른데, 그 고유값이 바로 <b>비열</b>이에요. 물은 비열이 아주 큰 물질이라 천천히 데워져요.",
      });
      helper.innerHTML = "식용유 승! 그런데 빨리 데워지는 물질은 <b>식을 때도 빠를까요?</b> 불을 꺼서 확인해 봐요.";
      showCoolBtn();
    }, 450);
  }

  // ---- 물리 ----
  function stepSim(dt: number): void {
    const dtSec = (dt * 16.7) / 1000;
    if (phase !== "heat" && phase !== "cool" && phase !== "done") return;
    const dMin = dtSec * SIM_MIN_PER_SEC;
    if (simMin >= X_MAX) return;
    simMin = Math.min(X_MAX, simMin + dMin);

    if (phase === "heat") {
      Tw += HEAT_W * dMin;
      To += (HEAT_W / C_OIL) * dMin;
      if (To >= GOAL) {
        To = GOAL;
        verdict();
      }
    } else {
      // 뉴턴 냉각 — 같은 비커·같은 온도차라면 잃는 열은 비슷해도,
      // 비열이 작은 식용유가 온도는 훨씬 빨리 떨어진다
      const k = 0.16; // 분당 냉각 계수(물 기준)
      Tw -= (k * (Tw - T0)) * dMin;
      To -= ((k / C_OIL) * (To - T0)) * dMin;
      if (!crossed && To < Tw - 1) {
        crossed = true;
        haptic(HAPTIC.ctaUnlock);
        helper.innerHTML =
          "곡선이 <b>교차</b>했어요! 먼저 뜨거워졌던 식용유가 <b>먼저 식어서</b> 물보다 차가워졌어요. <b>비열이 작다 = 빨리 데워지고 빨리 식는다</b>, 확인 완료!";
      }
      if (crossed && (To - T0 < 6 || simMin >= X_MAX - 0.1)) {
        if (phase !== "done") {
          phase = "done";
          api.enableCTA(s.cta ?? "개념 정리하기");
          showResetBtn();
        }
      }
    }

    if (simMin - lastSample > 0.1) {
      lastSample = simMin;
      dataW.push([simMin, Tw]);
      dataO.push([simMin, To]);
    }
  }

  // ---- 무대 그리기 ----
  function drawStage(tMs: number): void {
    const { ctx, w, h } = fitCanvas(canvas, 210);
    // 판정 시트를 읽는 동안에도 불은 켜져 있다 — "불 끄고 식히기"를 눌러야 꺼진다
    const heating = phase === "heat" || phase === "verdict";
    const beaker = (cx: number, T: number, label: string, rgb: string): void => {
      const bw = w * 0.3;
      const bh = h * 0.5;
      const x = cx - bw / 2;
      const y = h * 0.18;
      // 접촉 그림자(버너 자리에 세트를 앉힘) + 유리 비커(그라데이션 벽 + 스펙큘러 + 림 틱)
      contactShadow(ctx, cx, y + bh + 24, bw * 0.62);
      glassVessel(ctx, { x0: x, y0: y, x1: x + bw, y1: y + bh });
      // 액체 — 위가 밝은 세로 그라데이션 + 수면 하이라이트(비커 안쪽으로 클립)
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 4, y + bh * 0.28 - 2, bw - 8, bh * 0.72 - 2, [0, 0, 10, 10]);
      ctx.clip();
      liquidFill(ctx, x + 4, y + bh * 0.28, x + bw - 4, y + bh - 4, rgb, 0.36);
      ctx.restore();
      // 온도 무드(뜨거울수록 붉게)
      ctx.fillStyle = tempColor(T01(T), 0.16 * T01(T) + 0.02);
      ctx.beginPath();
      ctx.roundRect(x + 4, y + bh * 0.28, bw - 8, bh * 0.72 - 4, [0, 0, 10, 10]);
      ctx.fill();
      // 뜨거우면 김
      if (T > 45) {
        const a = clamp((T - 45) / 40, 0, 0.8);
        ctx.strokeStyle = `rgba(220,232,250,${(a * 0.7).toFixed(3)})`;
        ctx.lineWidth = 2.4;
        for (let i = -1; i <= 1; i++) {
          const sx = cx + i * bw * 0.22 + Math.sin(tMs / 300 + i * 2) * 3;
          ctx.beginPath();
          ctx.moveTo(sx, y + bh * 0.24);
          ctx.quadraticCurveTo(sx - 4, y + bh * 0.1, sx + 2, y - 4);
          ctx.stroke();
        }
      }
      // 라벨
      ctx.fillStyle = "rgba(210,224,245,.75)";
      ctx.font = "600 12px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, cx, y + bh + 34);
      // 불꽃(가열 중일 때만, 두 불꽃 크기 동일) — 주변에 softGlow로 은은한 열기
      if (heating) {
        softGlow(ctx, cx, y + bh + 10, 40, "255,150,64", 0.16);
        drawFlame(ctx, cx, y + bh + 20, 22, tMs);
      }
    };
    // 질량 라벨은 교과서 탐구 수치와 다르게(같은 질량이라는 조건만 유지)
    beaker(w * 0.3, Tw, "물 150 g", "96,150,230");
    beaker(w * 0.7, To, "식용유 150 g", "240,190,80");
  }

  // ---- 그래프 ----
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

    // 레이스 목표선(가열 단계)
    if (phase === "pick" || phase === "heat") {
      ctx.strokeStyle = "rgba(255,107,74,.55)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(L, gy(GOAL));
      ctx.lineTo(w - R, gy(GOAL));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#E8542F";
      ctx.textAlign = "left";
      ctx.font = "700 10.5px Pretendard, sans-serif";
      ctx.fillText("목표 60℃", L + 6, gy(GOAL) - 6);
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
    drawSeries(dataW, "#3182F6");
    drawSeries(dataO, "#F5A623");
  }

  // ---- 루프 ----
  const loop: Loop = createLoop((dt, tMs) => {
    stepSim(dt);
    wVal.textContent = `${Math.round(Tw)}℃`;
    oVal.textContent = `${Math.round(To)}℃`;
    wDot.style.background = tempColor(T01(Tw));
    oDot.style.background = tempColor(T01(To));
    drawStage(tMs);
    drawGraph();
  });

  showPick();
  api.setCTA("예측하고 가열해 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
