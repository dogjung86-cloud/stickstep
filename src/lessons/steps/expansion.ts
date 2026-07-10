// expansion — 열팽창 랩(L5).
// 1부: 금속 막대(입자 사슬)를 온도 슬라이더로 가열/냉각 — 입자 "크기"는 그대로인데
//      "사이 거리"가 멀어져 막대가 길어지는 것을 눈금과 함께 관찰(과장 모형임을 명시).
// 2부: 바이메탈 — 열팽창이 큰 금속(알루미늄)과 작은 금속(철)을 붙여 가열하면
//      어느 쪽으로 휠지 "예측"하고 확인한다(열팽창이 작은 금속 쪽으로 휜다).

import { el, clamp, clear } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { tempColor, drawFlame, drawGlowParticle } from "../../ui/thermo";
import { contactShadow, softGlow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface ExpansionStep {
  title: string;
  lead?: string;
  cta?: string;
}

const T_MIN = 20;
const T_MAX = 200;
const N = 12; // 막대 입자 수
const MAX_GROW = 0.30; // 최대 가열 시 시각적 길이 증가(과장)

export const expansion: StepRenderer = (host, step, api) => {
  const s = step as unknown as ExpansionStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대 ----
  const canvas = el("canvas", { class: "cd-canvas", style: "height:230px" });
  const tempVal = el("span", { class: "hp-temp", text: `${T_MIN}℃` });
  const tempDot = el("span", { class: "pdot" });
  const lenVal = el("span", { class: "hp-temp", text: "+0%" });
  const lenPill = el("div", { class: "pill" }, el("span", { text: "길이 변화 " }), lenVal);
  const hud = el(
    "div",
    { class: "stage-hud" },
    el("div", { class: "pill" }, tempDot, el("span", { text: "막대 온도 " }), tempVal),
    lenPill,
  );
  const cap = el("div", { class: "stage-cap", text: "길이 변화는 실제보다 과장한 모형이에요" });
  const stage = el("div", { class: "stage cd-stage" }, canvas, hud, cap);

  // ---- 온도 슬라이더(1부) ----
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const track = el("div", { class: "sl-track temp" }, el("div", { class: "sl-fill" }), thumb);
  const slider = el(
    "div",
    {
      class: "slider hp-slider",
      attrs: {
        role: "slider", tabindex: "0", "aria-label": "막대 온도",
        "aria-valuemin": String(T_MIN), "aria-valuemax": String(T_MAX), "aria-valuenow": String(T_MIN),
      },
    },
    track,
    el("div", { class: "hp-slider-caps" }, el("span", { text: "냉각" }), el("span", { text: "가열" })),
  );

  const controls = el("div", { class: "cd-controls" });
  const helper = el("div", {
    class: "helper",
    html: "슬라이더로 금속 막대를 <b>가열</b>해 보세요. 입자와 막대 끝의 <b>눈금</b>을 함께 지켜보는 게 포인트!",
  });
  host.append(helper, stage, slider, controls); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  // ---- 상태 ----
  type Phase = "rod" | "pick" | "bend" | "done";
  let phase: Phase = "rod";
  let T = T_MIN; // 목표 온도
  let Td = T_MIN; // 표시 온도(관성)
  let sawHot = false;
  let sawCold = false;
  let rodDone = false;
  let picked = -1;
  let bend = 0; // 바이메탈 굽힘(0..1)
  const phases = Array.from({ length: N }, () => Math.random() * Math.PI * 2);

  const heat01 = (): number => clamp((Td - T_MIN) / (T_MAX - T_MIN), 0, 1);

  // ---- 슬라이더 ----
  function setSliderUI(): void {
    const f = ((T - T_MIN) / (T_MAX - T_MIN)) * 100;
    thumb.style.left = `${f}%`;
    (thumb.firstChild as HTMLElement).style.background = tempColor((T - T_MIN) / (T_MAX - T_MIN));
    slider.setAttribute("aria-valuenow", String(Math.round(T)));
  }
  function setTempFromClientX(cx: number): void {
    const rect = track.getBoundingClientRect();
    T = clamp(T_MIN + ((cx - rect.left) / rect.width) * (T_MAX - T_MIN), T_MIN, T_MAX);
    setSliderUI();
  }
  let dragging = false;
  slider.addEventListener("pointerdown", (e) => {
    dragging = true;
    slider.classList.add("drag");
    slider.setPointerCapture(e.pointerId);
    setTempFromClientX(e.clientX);
  });
  slider.addEventListener("pointermove", (e) => {
    if (dragging) setTempFromClientX(e.clientX);
  });
  const endDrag = (): void => {
    dragging = false;
    slider.classList.remove("drag");
  };
  slider.addEventListener("pointerup", endDrag);
  slider.addEventListener("pointercancel", endDrag);
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") T = clamp(T + 10, T_MIN, T_MAX);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") T = clamp(T - 10, T_MIN, T_MAX);
    else return;
    e.preventDefault();
    setSliderUI();
  });

  // ---- 단계 전환 ----
  function rodGoalCheck(): void {
    if (rodDone || phase !== "rod") return;
    // Td는 T에 점근 수렴하므로 HUD 반올림 기준(169.5/45.5)으로 판정한다
    if (!sawHot && Td >= 169.5) {
      sawHot = true;
      haptic(HAPTIC.ctaUnlock);
      helper.innerHTML =
        "막대가 <b>길어졌어요!</b> 입자 하나하나의 <b>크기는 그대로</b>인데, 운동이 활발해지며 <b>사이 거리</b>가 멀어진 거예요. 이제 다시 <b>냉각</b>해 보세요.";
    }
    if (sawHot && !sawCold && Td <= 45.5) {
      sawCold = true;
      rodDone = true;
      helper.innerHTML =
        "식히니 원래 길이로 <b>수축</b>했죠. 그런데 팽창하는 <b>정도</b>는 물질마다 달라요 — 그걸 이용한 발명품이 있어요!";
      const nextBtn = el("button", { class: "swapbtn", html: "<span>다음 실험 — 바이메탈</span>" });
      nextBtn.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        toPick();
      });
      controls.appendChild(nextBtn);
      window.setTimeout(() => nextBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    }
  }

  function toPick(): void {
    phase = "pick";
    slider.style.display = "none";
    cap.textContent = "위: 알루미늄(열팽창 큼) · 아래: 철(열팽창 작음)";
    lenPill.style.display = "none";
    clear(controls);
    helper.innerHTML =
      "<b>알루미늄(위)</b>과 <b>철(아래)</b>을 딱 붙인 띠가 <b>바이메탈</b>이에요. 알루미늄이 철보다 열팽창이 커요. 가열하면 띠는 어느 쪽으로 휠까요?";
    const row = el("div", { class: "cd-pick" });
    ["위로 휜다", "아래로 휜다"].forEach((label, i) => {
      const b = el(
        "button",
        { class: "cd-pick-btn" },
        el("span", { class: "cd-pick-name", text: label }),
        el("span", { class: "cd-pick-note", text: i === 0 ? "알루미늄 쪽" : "철 쪽" }),
      );
      b.addEventListener("click", () => {
        if (phase !== "pick") return;
        haptic(HAPTIC.select);
        picked = i;
        row.querySelectorAll(".cd-pick-btn").forEach((x, k) => x.classList.toggle("sel", k === i));
        window.setTimeout(() => {
          phase = "bend";
          helper.innerHTML = "가열 중… 두 금속이 <b>서로 다른 만큼</b> 늘어나면 무슨 일이 생길까요?";
        }, 350);
      });
      row.appendChild(b);
    });
    controls.appendChild(row);
    window.setTimeout(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function bendVerdict(): void {
    phase = "done";
    const good = picked === 1;
    api.recordQuiz(good);
    window.setTimeout(() => {
      api.openSheet({
        good,
        title: good ? "예측 성공! 철 쪽으로 휘었어요" : "철 쪽(아래)으로 휘어요",
        html:
          "가열하면 <b>알루미늄이 더 많이 늘어나</b> 바깥쪽이 되고, 덜 늘어난 <b>철 쪽(열팽창이 작은 금속 쪽)으로</b> 휘어요. " +
          "이 성질로 온도가 오르면 회로를 <b>스스로 끊는</b> 온도 조절 장치를 만들죠 — 전기다리미·전기밥솥·화재경보기 속에 바이메탈이 들어 있어요.",
      });
      helper.innerHTML = "바이메탈은 <b>열팽창이 작은 금속 쪽</b>으로 휘어요. 전기다리미의 과열 방지 스위치가 바로 이 원리!";
      api.enableCTA(s.cta ?? "개념 정리하기");
    }, 500);
  }

  // ---- 그리기 ----
  function drawRod(ctx: CanvasRenderingContext2D, w: number, h: number, tMs: number): void {
    const t = heat01();
    const cy = h * 0.42;
    const r = 7;
    const s0 = (w * 0.55) / (N - 1);
    const sp = s0 * (1 + MAX_GROW * t);
    const x0 = w * 0.14;
    const len0 = s0 * (N - 1);
    const len = sp * (N - 1);

    // 고정단 벽 — 금속 스탠드(세로 그라데이션 + 모서리 하이라이트) + 접촉 그림자
    contactShadow(ctx, x0 - 14, cy + 32, 20, 0.2);
    const wall = ctx.createLinearGradient(0, cy - 30, 0, cy + 30);
    wall.addColorStop(0, "rgba(236,246,255,.26)");
    wall.addColorStop(0.5, "rgba(168,194,228,.12)");
    wall.addColorStop(1, "rgba(108,134,172,.16)");
    ctx.fillStyle = wall;
    ctx.fillRect(x0 - 18, cy - 30, 8, 60);
    ctx.strokeStyle = "rgba(255,255,255,.26)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x0 - 16.8, cy - 28);
    ctx.lineTo(x0 - 16.8, cy + 28);
    ctx.stroke();
    // 막대 몸통(입자 뒤 은은한 금속 판 — 길이를 따라 함께 늘어난다)
    const bx0 = x0 - 12;
    const bw = len + 24;
    const by0 = cy - 15;
    const rodBody = ctx.createLinearGradient(0, by0, 0, by0 + 30);
    rodBody.addColorStop(0, "rgba(226,240,255,.12)");
    rodBody.addColorStop(0.55, "rgba(150,176,214,.05)");
    rodBody.addColorStop(1, "rgba(92,116,155,.09)");
    ctx.fillStyle = rodBody;
    ctx.beginPath();
    ctx.roundRect(bx0, by0, bw, 30, 15);
    ctx.fill();
    // 자유단(단면)은 살짝 어둡게
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(bx0, by0, bw, 30, 15);
    ctx.clip();
    const rodCap = ctx.createLinearGradient(bx0 + bw - 18, 0, bx0 + bw, 0);
    rodCap.addColorStop(0, "rgba(7,15,30,0)");
    rodCap.addColorStop(1, "rgba(7,15,30,.24)");
    ctx.fillStyle = rodCap;
    ctx.fillRect(bx0 + bw - 18, by0, 18, 30);
    ctx.restore();
    // 윗면 하이라이트 선
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(bx0 + 12, by0 + 2.2);
    ctx.lineTo(bx0 + bw - 12, by0 + 2.2);
    ctx.stroke();
    // 결합선
    ctx.strokeStyle = "rgba(140,170,215,.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, cy);
    ctx.lineTo(x0 + len, cy);
    ctx.stroke();
    // 입자(크기 고정 — 간격만 변함)
    for (let i = 0; i < N; i++) {
      const amp = 0.5 + t * 3.4;
      const ox = Math.sin(tMs * (0.011 + t * 0.01) + phases[i]) * amp;
      const oy = Math.cos(tMs * (0.0095 + t * 0.009) + phases[i] * 1.3) * amp;
      drawGlowParticle(ctx, x0 + i * sp + ox, cy + oy, r, 0.08 + t * 0.85, t > 0.1 ? 2 : 1);
    }
    // 눈금자 + 처음 길이 표식 + 현재 끝 마커 (자 몸통은 은은한 띠만 — 과한 장식 금지)
    const ry = cy + 46;
    ctx.fillStyle = "rgba(196,220,250,.06)";
    ctx.beginPath();
    ctx.roundRect(x0 - 6, ry - 12, len0 * (1 + MAX_GROW) + 26, 16, 4);
    ctx.fill();
    ctx.strokeStyle = "rgba(220,236,255,.48)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0, ry);
    ctx.lineTo(x0 + len0 * (1 + MAX_GROW) + 14, ry);
    ctx.stroke();
    for (let m = 0; m <= 10; m++) {
      const mx = x0 + (len0 * (1 + MAX_GROW) * m) / 10;
      ctx.beginPath();
      ctx.moveTo(mx, ry);
      ctx.lineTo(mx, ry - (m % 5 === 0 ? 9 : 5));
      ctx.stroke();
    }
    // 처음 길이(기준선)
    ctx.strokeStyle = "rgba(220,236,255,.55)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(x0 + len0, ry + 4);
    ctx.lineTo(x0 + len0, cy - 26);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(220,236,255,.62)";
    ctx.font = "600 10.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("처음 길이", x0 + len0, ry + 18);
    // 현재 끝 마커
    ctx.fillStyle = tempColor(t);
    ctx.beginPath();
    ctx.moveTo(x0 + len, ry - 14);
    ctx.lineTo(x0 + len - 6, ry - 24);
    ctx.lineTo(x0 + len + 6, ry - 24);
    ctx.closePath();
    ctx.fill();

    if (t > 0.12) {
      const fs = 24 * clamp(t * 1.6, 0.4, 1);
      softGlow(ctx, x0 + len * 0.5, h - 8 - fs * 0.5, fs * 2.2, "255,150,60", 0.08 + 0.16 * t);
      drawFlame(ctx, x0 + len * 0.5, h - 8, fs, tMs);
    }
  }

  function drawBimetal(ctx: CanvasRenderingContext2D, w: number, h: number, tMs: number, dt: number): void {
    const dtSec = (dt * 16.7) / 1000;
    if (phase === "bend" && bend < 1) {
      bend = clamp(bend + dtSec * 0.55, 0, 1);
      if (bend >= 1) bendVerdict();
    }
    const L = w * 0.6;
    const x0 = w * 0.2;
    const y0 = h * 0.38;
    const thick = 9;
    const theta = 0.06 + bend * 0.9; // 굽힘 각(아래로)
    const R = L / theta;
    const cxC = x0;
    const cyC = y0 + R;
    const pt = (tt: number, radius: number): [number, number] => {
      const a = theta * tt;
      return [cxC + radius * Math.sin(a), cyC - radius * Math.cos(a)];
    };
    const strip = (radius: number, width: number, color: string): void => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const [px, py] = pt(i / 24, radius);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    // 고정단 — 금속 스탠드(세로 그라데이션 + 모서리 하이라이트) + 접촉 그림자
    contactShadow(ctx, x0 - 15, y0 + 29, 22, 0.2);
    const wall = ctx.createLinearGradient(0, y0 - 26, 0, y0 + 26);
    wall.addColorStop(0, "rgba(236,246,255,.26)");
    wall.addColorStop(0.5, "rgba(168,194,228,.12)");
    wall.addColorStop(1, "rgba(108,134,172,.16)");
    ctx.fillStyle = wall;
    ctx.fillRect(x0 - 20, y0 - 26, 10, 52);
    ctx.strokeStyle = "rgba(255,255,255,.26)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x0 - 18.6, y0 - 24);
    ctx.lineTo(x0 - 18.6, y0 + 24);
    ctx.stroke();
    // 위: 알루미늄(바깥·더 길어짐), 아래: 철 — 띠 축에 수직인 3톤(바깥 밝음) 금속 재질
    const RA = R + thick / 2 + 0.5;
    const RI = R - thick / 2 - 0.5;
    strip(RA, thick, "#93ABCE");
    strip(RA + thick * 0.16, thick * 0.6, "#B7CDEC");
    strip(RA + thick * 0.33, thick * 0.2, "rgba(240,248,255,.8)");
    strip(RI, thick, "#4C5769");
    strip(RI + thick * 0.16, thick * 0.6, "#606D80");
    strip(RI + thick * 0.33, thick * 0.2, "rgba(174,190,212,.4)");
    // 두 금속의 접합선 + 자유단 끝(단면)은 살짝 어둡게
    strip(R, 1.2, "rgba(8,16,30,.5)");
    const endShade = (radius: number): void => {
      const [ax, ay] = pt(0.96, radius);
      const [bx, by] = pt(1, radius);
      ctx.strokeStyle = "rgba(8,16,30,.22)";
      ctx.lineWidth = thick;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    };
    endShade(RA);
    endShade(RI);
    // 라벨(굽어 내려오는 띠와 겹치지 않게 고정단 쪽에)
    ctx.fillStyle = "rgba(220,236,255,.8)";
    ctx.font = "600 11.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("알루미늄 — 열팽창 큼", x0 + 6, y0 - 26);
    ctx.fillText("철 — 열팽창 작음", x0 - 14, y0 + 52);
    // 불(주변 소프트 글로우)
    if (phase === "bend" || phase === "done") {
      softGlow(ctx, x0 + L * 0.45, h - 21, 44, "255,150,60", 0.2);
      drawFlame(ctx, x0 + L * 0.45, h - 8, 26, tMs);
      // 끝점 이동 화살(아래로)
      if (bend > 0.25) {
        const [ex, ey] = pt(1, R);
        ctx.strokeStyle = "rgba(255,159,67,.85)";
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ex + 12, ey - 16);
        ctx.lineTo(ex + 12, ey + 6);
        ctx.moveTo(ex + 7, ey);
        ctx.lineTo(ex + 12, ey + 7);
        ctx.lineTo(ex + 17, ey);
        ctx.stroke();
      }
    }
  }

  // ---- 루프 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 230);
    if (phase === "rod") {
      Td += (T - Td) * Math.min(1, 0.06 * dt);
      const t = heat01();
      tempVal.textContent = `${Math.round(Td)}℃`;
      tempDot.style.background = tempColor(t);
      lenVal.textContent = `+${Math.round(MAX_GROW * t * 100)}%`;
      rodGoalCheck();
      drawRod(ctx, w, h, tMs);
    } else {
      tempVal.textContent = phase === "pick" ? "가열 전" : "가열 중";
      tempDot.style.background = tempColor(phase === "pick" ? 0.05 : 0.8);
      drawBimetal(ctx, w, h, tMs, dt);
    }
  });

  api.setCTA("막대를 가열해 관찰하세요", { enabled: false });
  const rafId = requestAnimationFrame(() => {
    setSliderUI();
    loop.start();
  });

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
