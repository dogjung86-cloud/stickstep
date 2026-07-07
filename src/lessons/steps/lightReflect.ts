// lightReflect — 빛의 반사 랩 2종(중2 III L1, 책 98~99쪽).
//   reflectLab: 슬릿 레이저를 직접 돌리며 입사각·반사각을 실시간 비교.
//     탐색(각도 이리저리) → 예측(60°로 키우면?) → 확인 → 과녁 조준 응용.
//   diffuseLab: 매끈한 거울 vs 울퉁불퉁한 표면에 평행광 5줄기.
//     난반사는 빛이 사방으로 흩어지지만, 반사점 하나를 돋보기로 확대하면
//     "그 지점의 법선" 기준 입사각 = 반사각 — 빛줄기 하나하나는 법칙을 지킨다.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import {
  drawBeam, drawNormal, drawAngleArc, drawProtractor, drawArrowHead,
  laserBody, mirrorProp, degLabel, capturePointer, BEAM_WHITE, TAU, type Pt,
} from "../../ui/lightKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const AMBER = "255,196,90"; // 입사각
const CYAN = "126,214,255"; // 반사각
const D2R = Math.PI / 180;

// ══════════════════════════════════════════════════════════
// reflectLab — 반사 법칙
// ══════════════════════════════════════════════════════════
export const reflectLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "lt-canvas",
    style: "height:330px",
    attrs: { tabindex: "0", role: "slider", "aria-label": "레이저 입사각", "aria-valuemin": "8", "aria-valuemax": "78", "aria-valuenow": "30" },
  });
  const incVal = el("b", { text: "30°", style: "font-variant-numeric:tabular-nums" });
  const refVal = el("b", { text: "30°", style: "font-variant-numeric:tabular-nums" });
  const toast = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#FFC45A" }), el("span", { text: "입사각 " }), incVal),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#7ED6FF" }), el("span", { text: "반사각 " }), refVal),
    ),
    toast,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "explore" } }, el("b", { text: "돌려 보기" }), el("span", { text: "각도 이리저리" })),
    el("div", { class: "pn-badge", dataset: { g: "law" } }, el("b", { text: "법칙 확인" }), el("span", { text: "예측 후 60°" })),
    el("div", { class: "pn-badge", dataset: { g: "aim" } }, el("b", { text: "과녁 명중" }), el("span", { text: "반사광 조준" })),
  );
  const choices = el("div", { class: "hook-choices" });
  const helper = el("div", {
    class: "helper",
    html: "레이저를 <b>잡고 이리저리 돌려</b> 보세요. 위 두 각도가 어떻게 변하는지 지켜봐요!",
  });
  host.append(goalChips, stage, choices, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let theta = 30 * D2R; // 입사각(법선 기준)
  let minSeen = theta;
  let maxSeen = theta;
  let phase: "explore" | "predict" | "confirm" | "aim" | "done" = "explore";
  let predictPick = -1;
  let holdMs = 0;
  let aimHold = 0;
  let hitFx = 0;
  const AIM_DEG = 34;
  const P = { x: 170, y: 260 }; // 입사점(프레임마다 갱신)
  const goals = new Set<string>();
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
    const a = Math.atan2(px - P.x, P.y - py); // 법선(위) 기준 각. 좌우 어느 쪽을 잡아도 대칭 조작
    theta = clamp(Math.abs(a), 8 * D2R, 78 * D2R);
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
    if (e.key === "ArrowRight" || e.key === "ArrowUp") theta = clamp(theta + 2 * D2R, 8 * D2R, 78 * D2R);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") theta = clamp(theta - 2 * D2R, 8 * D2R, 78 * D2R);
    else return;
    e.preventDefault();
  });

  // ---- 예측 → 확인 → 조준 흐름 ----
  function startPredict(): void {
    phase = "predict";
    helper.innerHTML = "질문! 지금처럼 반사각은 늘 입사각을 따라왔죠. 입사각을 <b>60°</b>로 키우면 반사각은 어떻게 될까요?";
    const opts = ["반사각은 지금 그대로 멈춘다", "반사각도 똑같이 60°가 된다", "반사각은 두 배인 120°가 된다"];
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
        helper.innerHTML = "직접 확인해요! 레이저를 돌려 입사각을 <b>60°</b>에 정확히 맞춰 보세요.";
      });
      choices.appendChild(b);
    });
    choices.classList.add("show");
  }

  function confirmDone(): void {
    const good = predictPick === 1;
    api.recordQuiz(good);
    collect("law", "입사각 = 반사각");
    showToast("반사각도 정확히 60°!");
    helper.innerHTML = good
      ? "예측 적중! 입사각을 키우면 반사각도 <b>똑같이</b> 커져요. 이제 마지막 미션 — 레이저를 조준해 <b>반사광으로 과녁</b>을 맞혀 봐요!"
      : "직접 보니 어때요? 반사각은 멈추지도, 두 배가 되지도 않고 <b>입사각과 똑같이 60°</b>가 됐어요. 이제 마지막 미션 — <b>반사광으로 과녁</b>을 맞혀 봐요!";
    phase = "aim";
    window.setTimeout(() => choices.classList.remove("show"), 400);
  }

  function aimDone(): void {
    phase = "done";
    hitFx = 1;
    collect("aim", "명중!");
    haptic(HAPTIC.correct);
    showToast("명중! 반사 법칙 마스터");
    helper.innerHTML =
      "정리! 빛이 반사할 때 <b>입사각과 반사각의 크기는 항상 같아요</b>. 입사각이 커지면 반사각도 함께 커지죠 — 이것이 <b>빛의 반사 법칙</b>이에요.";
    api.enableCTA(s.cta ?? "다음 실험으로");
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 330);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const mirY = H - 64;
    P.x = W / 2;
    P.y = mirY;
    const R = Math.min(H - 128, W * 0.44);

    // 은은한 무대 바닥광
    const bg = ctx.createRadialGradient(P.x, P.y, 0, P.x, P.y, R * 1.5);
    bg.addColorStop(0, "rgba(88,240,150,.05)");
    bg.addColorStop(1, "rgba(88,240,150,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 각도기 + 거울 + 법선
    drawProtractor(ctx, P.x, P.y, Math.min(R * 0.8, 120), 0);
    mirrorProp(ctx, 24, mirY, W - 24, mirY);
    const normLen = Math.min(R + 30, P.y - 14);
    drawNormal(ctx, P.x, P.y, -Math.PI / 2, normLen);
    // 법선 라벨 — 각도의 기준선임을 화면에서 바로 익히게 표기
    ctx.font = "700 11px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(174,196,228,.9)";
    ctx.fillText("법선", P.x + 8, P.y - normLen + 12);
    ctx.font = "600 9.5px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(174,196,228,.6)";
    ctx.fillText("거울 면에 수직", P.x + 8, P.y - normLen + 25);

    // 광선(입사→반사 한 줄기로 — 광자 점이 반사점을 통과해 흐른다)
    const lx = P.x - Math.sin(theta) * R;
    const ly = P.y - Math.cos(theta) * R;
    const outLen = R * 1.55;
    const out: Pt = { x: P.x + Math.sin(theta) * outLen, y: P.y - Math.cos(theta) * outLen };
    drawBeam(ctx, [{ x: lx, y: ly }, { x: P.x, y: P.y }, out], {
      flow: (tMs / 850) % 1,
      arrow: true,
      arrowAt: 0.93,
      width: 3,
    });
    laserBody(ctx, lx, ly, Math.atan2(P.y - ly, P.x - lx));

    // 각 호 + 라벨
    drawAngleArc(ctx, P.x, P.y, 52, -Math.PI / 2, -Math.PI / 2 - theta, AMBER, degLabel(theta), 76);
    drawAngleArc(ctx, P.x, P.y, 52, -Math.PI / 2, -Math.PI / 2 + theta, CYAN, degLabel(theta), 76);

    // 과녁(조준 단계)
    if (phase === "aim" || phase === "done") {
      const ta = AIM_DEG * D2R;
      const tx = P.x + Math.sin(ta) * R * 1.06;
      const ty = P.y - Math.cos(ta) * R * 1.06;
      const near = Math.abs(theta - ta) <= 2.2 * D2R;
      const pulse = 1 + Math.sin(tMs / 260) * 0.05;
      ctx.save();
      if (phase === "done" && hitFx > 0) {
        // 명중 버스트
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < 8; i++) {
          const ba = (i / 8) * TAU;
          const br = (1 - hitFx) * 40 + 14;
          ctx.strokeStyle = `rgba(255,214,120,${hitFx * 0.8})`;
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(tx + Math.cos(ba) * br, ty + Math.sin(ba) * br);
          ctx.lineTo(tx + Math.cos(ba) * (br + 9), ty + Math.sin(ba) * (br + 9));
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
        hitFx = Math.max(0, hitFx - dt * 0.022);
      }
      const rings: [number, string][] = [
        [15 * pulse, near ? "rgba(255,235,170,.95)" : "rgba(226,238,255,.55)"],
        [9.5 * pulse, near ? "rgba(255,160,120,.95)" : "rgba(180,200,230,.5)"],
        [4 * pulse, near ? "#FFE9A8" : "rgba(226,238,255,.75)"],
      ];
      for (const [rr, col] of rings) {
        ctx.strokeStyle = col;
        ctx.lineWidth = rr < 5 ? 4 : 2.4;
        ctx.beginPath();
        ctx.arc(tx, ty, rr, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    // HUD·접근성 갱신
    const deg = Math.round(theta / D2R);
    incVal.textContent = `${deg}°`;
    refVal.textContent = `${deg}°`;
    canvas.setAttribute("aria-valuenow", String(deg));

    // 목표 판정
    minSeen = Math.min(minSeen, theta);
    maxSeen = Math.max(maxSeen, theta);
    if (phase === "explore" && !goals.has("explore") && maxSeen - minSeen >= 26 * D2R) {
      collect("explore", "언제나 똑같죠?");
      window.setTimeout(startPredict, 350); // collect 가드 덕에 한 번만 예약된다
    }
    if (phase === "confirm") {
      if (Math.abs(theta - 60 * D2R) <= 1.5 * D2R) {
        holdMs += dt * 16.7;
        if (holdMs >= 340) confirmDone();
      } else holdMs = 0;
    }
    if (phase === "aim") {
      if (Math.abs(theta - AIM_DEG * D2R) <= 2.2 * D2R) {
        aimHold += dt * 16.7;
        if (aimHold >= 320) aimDone();
      } else aimHold = 0;
    }
  });

  api.setCTA("레이저를 돌려 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
  };
};

// ══════════════════════════════════════════════════════════
// diffuseLab — 정반사·난반사
// ══════════════════════════════════════════════════════════
const TILTS = [-16, 12, -7, 19, -13]; // 울퉁불퉁 표면의 국소 기울기(°) — 고정 배열(재현 가능)
const HIT_FR = [0.15, 0.32, 0.5, 0.68, 0.85];

export const diffuseLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:310px" });
  const smoothBtn = el("button", { class: "on", text: "매끈한 거울", attrs: { type: "button", "aria-pressed": "true" } });
  const roughBtn = el("button", { text: "울퉁불퉁한 표면", attrs: { type: "button", "aria-pressed": "false" } });
  const seg = el("div", { class: "seg stage-seg", style: "margin-top:0" }, smoothBtn, roughBtn);
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, seg));

  const goalChips = el(
    "div",
    { class: "pn-badges duo" },
    el("div", { class: "pn-badge", dataset: { g: "both" } }, el("b", { text: "두 표면 비교" }), el("span", { text: "매끈 vs 울퉁" })),
    el("div", { class: "pn-badge", dataset: { g: "zoom" } }, el("b", { text: "돋보기 검증" }), el("span", { text: "반사점 2곳" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "매끈한 거울에 나란한 빛 다섯 줄기가 들어와요. 반사된 빛도 <b>나란</b>하죠? 이제 표면을 <b>울퉁불퉁</b>으로 바꿔 보세요.",
  });
  host.append(goalChips, stage, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let mode: "smooth" | "rough" = "smooth";
  const seen = new Set<string>(["smooth"]);
  const inspected = new Set<number>();
  let selected = -1;
  let finished = false;
  const goals = new Set<string>();
  const inDir = { x: Math.SQRT1_2, y: Math.SQRT1_2 }; // 좌상단 → 우하단 45°

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 2 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 매끈한 면의 <b>정반사</b>는 빛을 나란히 보내 <b>모습이 비치고</b>, 거친 면의 <b>난반사</b>는 사방으로 흩어 <b>어느 방향에서나 물체가 보여요</b>. 그리고 흩어져도 — 빛줄기 하나하나는 <b>반사 법칙</b>을 지키죠!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function setMode(m: "smooth" | "rough"): void {
    if (mode === m) return;
    mode = m;
    selected = -1;
    seen.add(m);
    smoothBtn.classList.toggle("on", m === "smooth");
    roughBtn.classList.toggle("on", m === "rough");
    smoothBtn.setAttribute("aria-pressed", String(m === "smooth"));
    roughBtn.setAttribute("aria-pressed", String(m === "rough"));
    haptic(HAPTIC.select);
    helper.innerHTML =
      m === "rough"
        ? "빛이 <b>사방으로 흩어져요</b>(난반사) — 표면이 종이처럼 울퉁불퉁하거든요. 반짝이는 <b>반사점을 눌러</b> 돋보기로 확대해 보세요!"
        : "다시 매끈한 거울(정반사) — 나란히 들어온 빛이 <b>나란히</b> 나가요. 그래서 얼굴이 <b>또렷하게 비치죠</b>.";
    if (seen.size === 2) collect("both", "확인 완료!");
  }
  smoothBtn.addEventListener("click", () => setMode("smooth"));
  roughBtn.addEventListener("click", () => setMode("rough"));

  // 표면 기하 — 프레임마다 W 기준으로 계산
  let W = 340;
  let H = 310;
  const surfY = (): number => H - 82;
  const hitX = (i: number): number => 26 + (W - 52) * HIT_FR[i];

  function localNormal(i: number): { x: number; y: number } {
    const t = (mode === "rough" ? TILTS[i] : 0) * D2R;
    return { x: Math.sin(t), y: -Math.cos(t) };
  }
  function reflectDir(i: number): { x: number; y: number } {
    const n = localNormal(i);
    const d = inDir;
    const k = 2 * (d.x * n.x + d.y * n.y);
    return { x: d.x - k * n.x, y: d.y - k * n.y };
  }
  function localAngle(i: number): number {
    const n = localNormal(i);
    return Math.acos(clamp(-(inDir.x * n.x + inDir.y * n.y), -1, 1));
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (mode !== "rough") return;
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    let best = -1;
    let bd = 34;
    for (let i = 0; i < HIT_FR.length; i++) {
      const d = Math.hypot(px - hitX(i), py - surfY());
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    if (best < 0) return;
    selected = best;
    inspected.add(best);
    haptic(HAPTIC.select);
    const deg = Math.round(localAngle(best) / D2R);
    helper.innerHTML = `확대! 이 지점의 <b>비스듬한 법선</b> 기준으로 재면 — 입사각 <b>${deg}°</b> = 반사각 <b>${deg}°</b>. 울퉁불퉁해서 방향이 제각각일 뿐, <b>빛줄기 하나하나는 반사 법칙을 지켜요</b>.`;
    if (inspected.size >= 2) collect("zoom", "법칙 그대로!");
  });

  // ---- 프레임 ----
  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, 310);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const ys = surfY();
    const flow = (tMs / 900) % 1;

    // 표면
    if (mode === "smooth") {
      mirrorProp(ctx, 24, ys, W - 24, ys);
    } else {
      // 울퉁불퉁 표면 — 국소 기울기가 보이는 패싯 밴드
      ctx.save();
      const pts: Pt[] = [{ x: 24, y: ys + 5 }];
      for (let i = 0; i < HIT_FR.length; i++) {
        const t = TILTS[i] * D2R;
        const hx = hitX(i);
        const dx = Math.cos(t) * 13;
        const dy = Math.sin(t) * 13;
        // 패싯 사이 연결 봉우리
        if (i > 0) pts.push({ x: (hitX(i - 1) + hx) / 2, y: ys - (i % 2 ? 7 : 4) });
        pts.push({ x: hx - dx, y: ys - dy });
        pts.push({ x: hx + dx, y: ys + dy });
      }
      pts.push({ x: W - 24, y: ys + 4 });
      const fillG = ctx.createLinearGradient(0, ys - 10, 0, ys + 46);
      fillG.addColorStop(0, "#5E6E86");
      fillG.addColorStop(0.4, "#43506A");
      fillG.addColorStop(1, "#2A3550");
      ctx.fillStyle = fillG;
      ctx.beginPath();
      ctx.moveTo(24, ys + 42);
      ctx.lineTo(pts[0].x, pts[0].y);
      for (const p of pts) ctx.lineTo(p.x, p.y);
      ctx.lineTo(W - 24, ys + 42);
      ctx.closePath();
      ctx.fill();
      // 윗면 키라이트 + 최암 외곽
      ctx.strokeStyle = "rgba(196,214,240,.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (const p of pts) ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(16,24,40,.8)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(24, ys + 42);
      ctx.lineTo(W - 24, ys + 42);
      ctx.stroke();
      // 잔 알갱이
      ctx.fillStyle = "rgba(210,226,248,.14)";
      for (let i = 0; i < 14; i++) {
        const gx = 34 + ((i * 73) % (W - 68));
        const gy = ys + 10 + ((i * 29) % 26);
        ctx.beginPath();
        ctx.arc(gx, gy, 1.3, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    // 광선 5줄기
    for (let i = 0; i < HIT_FR.length; i++) {
      const hx = hitX(i);
      const hy = ys;
      // 입사(위쪽 화면 밖에서 45°로)
      let sLen = (hy - 12) / inDir.y;
      sLen = Math.min(sLen, (hx - 12) / inDir.x);
      const sx = hx - inDir.x * sLen;
      const sy = hy - inDir.y * sLen;
      const rd = reflectDir(i);
      const rLen = 200;
      drawBeam(
        ctx,
        [{ x: sx, y: sy }, { x: hx, y: hy }, { x: hx + rd.x * rLen, y: hy + rd.y * rLen }],
        { rgb: BEAM_WHITE, width: 2.3, alpha: 0.8, flow: (flow + i * 0.2) % 1 },
      );
    }

    // 반사점 탭 타깃(울퉁 모드)
    if (mode === "rough") {
      for (let i = 0; i < HIT_FR.length; i++) {
        const hx = hitX(i);
        const on = inspected.has(i);
        const pr = 11 + Math.sin(tMs / 300 + i * 1.4) * 1.8;
        ctx.strokeStyle = on ? "rgba(126,214,255,.9)" : "rgba(255,214,120,.65)";
        ctx.lineWidth = on ? 2.4 : 1.8;
        ctx.beginPath();
        ctx.arc(hx, ys, on ? 11 : pr, 0, TAU);
        ctx.stroke();
        if (on) {
          // 검사 완료 체크(작은 패스)
          ctx.strokeStyle = "rgba(126,214,255,.95)";
          ctx.lineWidth = 2.2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(hx - 4.5, ys + 24);
          ctx.lineTo(hx - 1, ys + 27.5);
          ctx.lineTo(hx + 5, ys + 20.5);
          ctx.stroke();
        }
      }
    }

    // 돋보기(선택된 반사점 확대)
    if (mode === "rough" && selected >= 0) {
      const i = selected;
      const hx = hitX(i);
      const cx = W - 96;
      const cy = 92;
      const r = 62;
      // 연결선
      ctx.strokeStyle = "rgba(214,228,248,.4)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(hx, ys - 8);
      ctx.lineTo(cx - r * 0.5, cy + r * 0.7);
      ctx.stroke();
      ctx.setLineDash([]);
      // 렌즈 판
      const lensBg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
      lensBg.addColorStop(0, "#17253E");
      lensBg.addColorStop(1, "#0A1322");
      ctx.fillStyle = lensBg;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.clip();
      // 확대된 패싯 + 그 아래 재질
      const t = TILTS[i] * D2R;
      const tx = Math.cos(t);
      const ty = Math.sin(t);
      ctx.fillStyle = "rgba(67,80,106,.85)";
      ctx.beginPath();
      ctx.moveTo(cx - tx * r * 1.2, cy - ty * r * 1.2);
      ctx.lineTo(cx + tx * r * 1.2, cy + ty * r * 1.2);
      ctx.lineTo(cx + tx * r * 1.2, cy + r * 1.4);
      ctx.lineTo(cx - tx * r * 1.2, cy + r * 1.4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(196,214,240,.7)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx - tx * r, cy - ty * r);
      ctx.lineTo(cx + tx * r, cy + ty * r);
      ctx.stroke();
      // 국소 법선(점선)
      const n = localNormal(i);
      drawNormal(ctx, cx, cy, Math.atan2(n.y, n.x), r - 12, { alpha: 0.7 });
      // 입사·반사 미니 빔
      const rd = reflectDir(i);
      drawBeam(ctx, [{ x: cx - inDir.x * (r - 8), y: cy - inDir.y * (r - 8) }, { x: cx, y: cy }], {
        rgb: BEAM_WHITE, width: 2.6, alpha: 0.95, glow: false,
      });
      drawArrowHead(ctx, cx - inDir.x * 14, cy - inDir.y * 14, Math.atan2(inDir.y, inDir.x), 7, `rgba(${BEAM_WHITE},.95)`);
      drawBeam(ctx, [{ x: cx, y: cy }, { x: cx + rd.x * (r - 8), y: cy + rd.y * (r - 8) }], {
        rgb: BEAM_WHITE, width: 2.6, alpha: 0.95, glow: false, arrow: true,
      });
      // 각 호 두 개 — 같은 숫자
      const nA = Math.atan2(n.y, n.x);
      const aS = Math.atan2(-inDir.y, -inDir.x);
      const aR = Math.atan2(rd.y, rd.x);
      const lbl = degLabel(localAngle(i));
      drawAngleArc(ctx, cx, cy, 24, nA, aS, AMBER, lbl, 38);
      drawAngleArc(ctx, cx, cy, 24, nA, aR, CYAN, lbl, 38);
      ctx.restore();
      // 렌즈 테 + 하이라이트
      ctx.strokeStyle = "rgba(190,214,246,.75)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 4, -2.4, -1.5);
      ctx.stroke();
      // 라벨
      ctx.font = "800 10.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(174,196,228,.9)";
      ctx.fillText("반사점 확대", cx, cy + r + 14);
    }

    // 모드 라벨
    ctx.font = "800 11.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(174,196,228,.85)";
    ctx.fillText(mode === "smooth" ? "정반사 — 나란히 들어와 나란히 나감" : "난반사 — 사방으로 흩어짐", 18, H - 18);
  });

  api.setCTA("두 표면을 비교해 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
