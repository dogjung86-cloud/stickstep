// diverBubble — 생활 속 보일 법칙 랩(VI 단원 L3). 교과서 197·204~205쪽(+마무리 11) 소재.
//   · 바닷속 모드: 잠수부가 내뿜은 공기 방울을 띄우면 수면으로 오르며 커진다
//     (물의 압력이 줄어 → 방울 속 기체 부피↑ — 단원 도입 질문의 답)
//   · 감압 용기 모드: 펌프로 용기 속 공기를 빼면(입자 감소 = 압력↓) 마시멜로가 부풀어 오른다
// 목표: ① 방울 띄워 수면 도달(커짐 확인) ② 한 번 더(비교) ③ 마시멜로 부풀리기.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { GasBox } from "../../ui/gasKit";
import { glassStrokeStyle, contactShadow, softGlow } from "../../ui/labProps";
import { drawStickman } from "../../ui/stick";
import type { StepRenderer } from "../types";

interface DiverStep {
  title: string;
  lead?: string;
  cta?: string;
}

interface Bubble {
  x: number;
  y: number;
  r0: number;
  wob: number;
}

export const diverBubble: StepRenderer = (host, step, api) => {
  const s = step as unknown as DiverStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:300px" });
  const pill = el("span", { text: "바닷속 30 m" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#5AA2F8" }), pill)),
  );

  const seaBtn = el("button", { class: "seg-btn on", attrs: { type: "button", "aria-pressed": "true" }, text: "바닷속 방울" });
  const jarBtn = el("button", { class: "seg-btn", attrs: { type: "button", "aria-pressed": "false" }, text: "감압 용기" });
  const seg = el("div", { class: "seg" }, seaBtn, jarBtn);
  const actBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "방울 내보내기" }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "rise" } }, el("b", { text: "방울 띄우기" }), el("span", { text: "올라가면?" })),
    el("div", { class: "pn-badge", dataset: { g: "twice" } }, el("b", { text: "한 번 더" }), el("span", { text: "확실히!" })),
    el("div", { class: "pn-badge", dataset: { g: "mallow" } }, el("b", { text: "마시멜로" }), el("span", { text: "감압 용기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "잠수부가 숨을 내쉬려 해요. 버튼을 눌러 <b>공기 방울</b>을 내보내고, 올라가면서 <b>크기</b>를 지켜보세요.",
  });
  host.append(goalChips, helper, stage, seg, actBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  // ---- 상태 ----
  let W = 340;
  let H = 300;
  let mode: "sea" | "jar" = "sea";
  const bubbles: Bubble[] = [];
  let risen = 0;
  const goals = new Set<string>();
  let finished = false;
  // 감압 용기
  const jarGas = new GasBox(1.0);
  let jarAir = 22; // 입자 수(공기량)
  let mallow = 0; // 부풂 0..1
  let pumping = false;

  const surfaceY = (): number => 46;
  const seaBottom = (): number => H - 34;
  // 깊이(m): 캔버스 y → 0(수면)~30(바닥)
  const depthOf = (y: number): number => ((y - surfaceY()) / (seaBottom() - surfaceY())) * 30;
  // 압력(기압): 수면 1, 10m마다 +1 (정성 표기용)
  const presOf = (y: number): number => 1 + depthOf(y) / 10;

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
        "둘 다 같은 원리 — <b>둘러싼 압력이 작아지면 속 기체의 부피가 커져요</b>(보일 법칙). 방울은 올라갈수록 물의 압력이 줄어 커졌고, 마시멜로는 용기의 공기를 빼자 부풀었죠.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function setMode(m: "sea" | "jar"): void {
    if (mode === m) return;
    mode = m;
    seaBtn.classList.toggle("on", m === "sea");
    jarBtn.classList.toggle("on", m === "jar");
    seaBtn.setAttribute("aria-pressed", String(m === "sea"));
    jarBtn.setAttribute("aria-pressed", String(m === "jar"));
    actBtn.querySelector("span")!.textContent = m === "sea" ? "방울 내보내기" : "꾹 눌러 공기 빼기";
    helper.innerHTML =
      m === "sea"
        ? "버튼을 눌러 <b>공기 방울</b>을 내보내고, 올라가면서 크기를 지켜보세요."
        : "이번엔 밀폐 용기 속 <b>마시멜로</b>! 버튼을 <b>꾹 눌러</b> 공기를 빼 보세요.";
    haptic(HAPTIC.tap);
  }
  seaBtn.addEventListener("click", () => setMode("sea"));
  jarBtn.addEventListener("click", () => setMode("jar"));

  actBtn.addEventListener("click", () => {
    if (mode !== "sea") return;
    actBtn.classList.remove("pulse");
    bubbles.push({ x: W * 0.36 + (Math.random() - 0.5) * 14, y: seaBottom() - 44, r0: 7, wob: Math.random() * 6 });
    haptic(HAPTIC.select);
  });
  actBtn.addEventListener("pointerdown", () => {
    if (mode === "jar") {
      pumping = true;
      haptic(HAPTIC.tap);
    }
  });
  const stopPump = (): void => {
    pumping = false;
  };
  actBtn.addEventListener("pointerup", stopPump);
  actBtn.addEventListener("pointercancel", stopPump);

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 300);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;

    if (mode === "sea") drawSea(ctx, dt, tMs);
    else drawJar(ctx, dt, tMs);
  });

  function drawSea(ctx: CanvasRenderingContext2D, dt: number, tMs: number): void {
    const sy = surfaceY();
    const sb = seaBottom();
    // 물(위 밝음 → 아래 짙음)
    const seaG = ctx.createLinearGradient(0, sy, 0, sb);
    seaG.addColorStop(0, "rgba(86,160,235,.34)");
    seaG.addColorStop(1, "rgba(18,42,86,.5)");
    ctx.fillStyle = seaG;
    ctx.fillRect(8, sy, W - 16, sb - sy);
    // 수면
    ctx.strokeStyle = "rgba(226,244,255,.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 10; px <= W - 10; px += 7) {
      const yy = sy + Math.sin(px / 24 + tMs / 300) * 2.4;
      px === 10 ? ctx.moveTo(px, yy) : ctx.lineTo(px, yy);
    }
    ctx.stroke();
    // 깊이 눈금(0/10/20/30m) + 압력 표기
    ctx.font = "600 9.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    for (const d of [0, 10, 20, 30]) {
      const yy = sy + (d / 30) * (sb - sy);
      ctx.strokeStyle = "rgba(160,190,230,.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W - 74, yy);
      ctx.lineTo(W - 12, yy);
      ctx.stroke();
      ctx.fillStyle = "rgba(196,214,236,.7)";
      ctx.fillText(`${d}m · ${1 + d / 10}기압`, W - 72, yy - 4);
    }
    // 바닥 모래
    ctx.fillStyle = "rgba(214,190,140,.28)";
    ctx.beginPath();
    ctx.roundRect(8, sb, W - 16, H - sb - 8, 8);
    ctx.fill();
    // 잠수부(스틱맨 + 산소통)
    const dx = W * 0.3;
    const dy = sb + 2;
    contactShadow(ctx, dx, dy + 4, 34, 0.3);
    ctx.fillStyle = "#5D7CA6";
    ctx.beginPath();
    ctx.roundRect(dx - 20, dy - 58, 10, 30, 5);
    ctx.fill();
    drawStickman(ctx, dx, dy, 62, { lean: 0.05, armF: -0.4, armB: 0.9, legF: 0.2, legB: -0.2 }, { color: "rgba(232,240,250,.95)" });
    // 마스크 기포 느낌
    softGlow(ctx, dx + 10, dy - 52, 10, "180,220,255", 0.15);

    // 방울 물리 + 그리기
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const bb = bubbles[i];
      bb.y -= (0.55 + (1 - depthOf(bb.y) / 30) * 0.5) * dt;
      bb.x += Math.sin(tMs / 260 + bb.wob) * 0.25 * dt;
      const pres = presOf(bb.y);
      const r = bb.r0 * Math.cbrt(4 / pres); // 30m(4기압) 기준 → 수면에서 부피 4배
      // 방울(유리 하이라이트)
      const bg = ctx.createRadialGradient(bb.x - r * 0.3, bb.y - r * 0.35, r * 0.2, bb.x, bb.y, r);
      bg.addColorStop(0, "rgba(255,255,255,.5)");
      bg.addColorStop(0.6, "rgba(190,225,255,.18)");
      bg.addColorStop(1, "rgba(160,205,250,.34)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(bb.x, bb.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(220,240,255,.55)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // 수면 도달 → 팡
      if (bb.y - r < sy + 3) {
        bubbles.splice(i, 1);
        risen++;
        haptic(HAPTIC.select);
        if (risen === 1) {
          collect("rise", "4배로 커짐!");
          helper.innerHTML = "수면에서는 <b>4배</b>나 커졌어요(30 m 4기압 → 수면 1기압). <b>한 번 더</b> 띄워 볼까요?";
        }
        if (risen >= 2) collect("twice", "확인 완료!");
      }
    }
    pill.textContent = bubbles.length ? `방울 깊이 ${Math.max(0, depthOf(bubbles[0].y)).toFixed(0)} m · ${presOf(bubbles[0].y).toFixed(1)}기압` : "바닷속 0~30 m";
  }

  function drawJar(ctx: CanvasRenderingContext2D, dt: number, tMs: number): void {
    const jx = W / 2;
    const jw = Math.min(W * 0.5, 200);
    const jTop = 62;
    const jBot = H - 42;
    // 공기 빼기/차오르기
    if (pumping) jarAir = clamp(jarAir - 0.14 * dt, 4, 22);
    else jarAir = clamp(jarAir + 0.06 * dt, 4, 22);
    mallow += ((1 - (jarAir - 4) / 18) - mallow) * Math.min(1, 0.08 * dt);
    if (mallow > 0.82) {
      collect("mallow", "부풀었다!");
      if (!goals.has("rise")) helper.innerHTML = "마시멜로 <b>속 기포</b>가 커진 거예요! 이제 <b>바닷속 방울</b>도 확인해 봐요.";
    }

    contactShadow(ctx, jx, jBot + 10, jw * 0.55, 0.26);
    // 용기 속 공기 입자
    const b = { x0: jx - jw / 2 + 6, y0: jTop + 8, x1: jx + jw / 2 - 6, y1: jBot - 6 };
    jarGas.setCount(Math.round(jarAir), b);
    jarGas.step(dt, b, 1);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, 10);
    ctx.clip();
    jarGas.draw(ctx, 205, 1);
    ctx.restore();
    // 마시멜로 3개(부풂)
    const mr = 17 + mallow * 13;
    for (const [mx, my] of [[jx - 36, jBot - 24], [jx + 30, jBot - 22], [jx - 2, jBot - 50]] as [number, number][]) {
      const mg = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.35, mr * 0.2, mx, my, mr);
      mg.addColorStop(0, "#FFF6F2");
      mg.addColorStop(0.7, "#FBDCE2");
      mg.addColorStop(1, "#EAB8C4");
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.ellipse(mx, my, mr, mr * 0.82, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(146,84,102,.5)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
    // 유리 용기
    ctx.strokeStyle = glassStrokeStyle(ctx, jTop, jBot);
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.roundRect(jx - jw / 2, jTop, jw, jBot - jTop, 12);
    ctx.stroke();
    // 뚜껑 + 펌프 손잡이(펌핑 시 왕복)
    ctx.fillStyle = "#5D7CA6";
    ctx.beginPath();
    ctx.roundRect(jx - jw / 2 - 4, jTop - 12, jw + 8, 14, 6);
    ctx.fill();
    const ph = pumping ? Math.sin(tMs / 90) * 8 : 0;
    ctx.fillStyle = "#7FA6D2";
    ctx.beginPath();
    ctx.roundRect(jx - 7, jTop - 44 + ph, 14, 34, 5);
    ctx.fill();
    ctx.fillStyle = "#9FC0E8";
    ctx.beginPath();
    ctx.roundRect(jx - 22, jTop - 52 + ph, 44, 10, 5);
    ctx.fill();
    // 빠져나가는 공기 스트릭
    if (pumping) {
      ctx.strokeStyle = "rgba(190,220,255,.5)";
      ctx.lineWidth = 1.6;
      for (const off of [-6, 4]) {
        ctx.beginPath();
        ctx.moveTo(jx + off, jTop - 46 + ph);
        ctx.lineTo(jx + off * 2.4, jTop - 66 + ph);
        ctx.stroke();
      }
    }
    pill.textContent = `용기 속 공기 ${Math.round(((jarAir - 4) / 18) * 100)}%`;
  }

  api.setCTA("방울 2번 · 마시멜로까지!", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
