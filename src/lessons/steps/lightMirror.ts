// lightMirror — 평면거울에서 상이 생기는 원리 랩(중2 III L4, 책 104~105쪽).
//   모눈 무대 + 세로 평면거울. 화살표 물체를 끌면:
//   · 상점 = 거울 대칭점(2M−x)으로 "계산"되고, 물체 끝→거울→눈동자 두 광선의
//     반사점은 상점—눈 직선과 거울의 교점으로 정확히 작도된다(눈대중 좌표 없음).
//   · 반사 광선의 점선 연장선 두 개는 오차 없이 상점 한 점에서 만난다.
//   · 물체~거울 / 거울~상 거리를 모눈 칸 수로 실시간 표기 — 언제나 같다.
//   목표: ① 거리 바꿔 재기 ② 연장선 켜서 상점 발견 ③ 상 크기 재기(실물과 같음).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawBeam, eyeProp, mirrorProp, capturePointer, TAU, type Pt } from "../../ui/lightKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const GOLD = "255,203,112"; // 물체·실광선
const CYAN = "126,214,255"; // 상·연장선
const G = 26; // 모눈 한 칸(px)

export const mirrorImageLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:340px" });
  const dObjVal = el("b", { text: "-", style: "font-variant-numeric:tabular-nums" });
  const dImgVal = el("b", { text: "-", style: "font-variant-numeric:tabular-nums" });
  const toast = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#FFCB70" }), el("span", { text: "물체→거울 " }), dObjVal),
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#7ED6FF" }), el("span", { text: "거울→상 " }), dImgVal),
    ),
    toast,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "dist" } }, el("b", { text: "거리 재기" }), el("span", { text: "끌어서 비교" })),
    el("div", { class: "pn-badge", dataset: { g: "ext" } }, el("b", { text: "연장선" }), el("span", { text: "상의 정체" })),
    el("div", { class: "pn-badge", dataset: { g: "size" } }, el("b", { text: "크기 재기" }), el("span", { text: "상을 탭!" })),
  );
  const extBtn = el(
    "button",
    { class: "swapbtn", attrs: { type: "button", "aria-pressed": "false" } },
    el("span", { text: "반사 광선 연장해 보기" }),
  );
  const helper = el("div", {
    class: "helper",
    html: "화살표 물체를 <b>좌우로 끌어</b> 보세요. 위 두 거리(물체→거울, 거울→상)가 어떻게 변하나요?",
  });
  host.append(goalChips, stage, extBtn, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let H = 340;
  let oxCells = 4; // 물체~거울 거리(칸) — 좌표가 아니라 "거리"를 상태로 가져 리사이즈에 안전
  let showExt = false;
  let dragging = false;
  let measureFx = 0; // 크기 재기 연출(0~1)
  let finished = false;
  const seenDist = new Set<number>();
  const goals = new Set<string>();
  let toastTimer = 0;

  const mirX = (): number => W * 0.58;
  const baseY = (): number => H - 74;
  const ARROW_H = 2 * G; // 물체 높이 = 2칸
  const ox = (): number => mirX() - oxCells * G;
  const eyeP = (): Pt => ({ x: Math.max(30, mirX() - 8.2 * G), y: 66 });

  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2000);
  }

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
        "정리! 평면거울의 상은 <b>실물과 같은 크기</b>로, 거울 뒤 <b>같은 거리</b>에 생겨요. 반사 광선의 연장선이 만나는 점 — 우리 눈이 \"빛이 저기서 왔구나\" 하고 여기는 곳이 바로 <b>상</b>이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 조작 ----
  function pointerCell(e: PointerEvent): { px: number; py: number } {
    const r = canvas.getBoundingClientRect();
    return { px: e.clientX - r.left, py: e.clientY - r.top };
  }
  canvas.addEventListener("pointerdown", (e) => {
    const { px, py } = pointerCell(e);
    const tipY = baseY() - ARROW_H;
    // 물체 근처 → 드래그 시작
    if (Math.abs(px - ox()) < 46 && py > tipY - 30 && py < baseY() + 30) {
      dragging = true;
      capturePointer(canvas, e);
      return;
    }
    // 상(거울 뒤) 탭 → 크기 재기
    const ix = 2 * mirX() - ox();
    if (Math.abs(px - ix) < 42 && py > tipY - 30 && py < baseY() + 30) {
      measureFx = 1;
      haptic(HAPTIC.select);
      if (!goals.has("size")) {
        collect("size", "2칸 = 2칸!");
        helper.innerHTML = "쟀어요 — 물체 <b>2칸</b>, 상도 <b>2칸</b>. 평면거울의 상은 <b>실물과 크기가 같아요</b>. 페넌트 방향은 반대죠(좌우 바뀜)!";
      }
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const { px } = pointerCell(e);
    const maxCells = Math.min(7, (mirX() - 66) / G, (W - 26 - mirX()) / G);
    oxCells = clamp((mirX() - px) / G, 1.2, maxCells);
  });
  const endDrag = (): void => {
    if (!dragging) return;
    dragging = false;
    // 정수 칸 근처(0.15칸)면 살짝 자석 — 숫자가 깔끔해진다
    const near = Math.round(oxCells);
    if (Math.abs(oxCells - near) < 0.15) oxCells = near;
    const rounded = Math.round(oxCells * 10) / 10;
    seenDist.add(rounded);
    if (seenDist.size >= 3 && !goals.has("dist")) {
      collect("dist", "언제나 같음!");
      helper.innerHTML =
        "몇 번을 옮겨도 두 거리는 <b>항상 똑같죠</b>? 이유가 숨어 있어요 — 아래 버튼으로 <b>반사 광선을 연장</b>해 보세요!";
      extBtn.classList.add("pulse");
    }
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  extBtn.addEventListener("click", () => {
    showExt = !showExt;
    extBtn.classList.toggle("done-static", false);
    extBtn.setAttribute("aria-pressed", String(showExt));
    (extBtn.querySelector("span") as HTMLElement).textContent = showExt ? "연장선 끄기" : "반사 광선 연장해 보기";
    extBtn.classList.remove("pulse");
    haptic(HAPTIC.select);
    if (showExt && !goals.has("ext")) {
      collect("ext", "한 점에서 만남!");
      showToast("연장선이 만나는 곳 = 상의 위치");
      helper.innerHTML =
        "점선(연장선) 두 개가 거울 뒤 <b>정확히 한 점</b>에서 만나요. 눈은 반사된 빛을 <b>그 점에서 곧장 온 것</b>으로 여겨서, 거기에 물체가 있는 것처럼 보여요. 이제 거울 속 <b>상을 탭</b>해 크기를 재 봐요!";
    }
  });

  // ---- 그리기 도우미 ----
  function drawArrowObj(
    ctx: CanvasRenderingContext2D,
    x: number,
    by: number,
    flagDir: 1 | -1,
    ghost: boolean,
  ): void {
    const tipY = by - ARROW_H;
    ctx.save();
    if (ghost) ctx.setLineDash([5, 5]);
    const grad = ctx.createLinearGradient(0, tipY, 0, by);
    grad.addColorStop(0, ghost ? "rgba(126,214,255,.9)" : "#FFE2A8");
    grad.addColorStop(1, ghost ? "rgba(126,214,255,.55)" : "#E8A03E");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, by);
    ctx.lineTo(x, tipY + 8);
    ctx.stroke();
    // 화살촉
    ctx.fillStyle = ghost ? "rgba(126,214,255,.8)" : "#FFD98A";
    ctx.beginPath();
    ctx.moveTo(x, tipY - 2);
    ctx.lineTo(x - 8, tipY + 12);
    ctx.lineTo(x + 8, tipY + 12);
    ctx.closePath();
    ctx.fill();
    // 페넌트(좌우 반전이 보이는 장치)
    ctx.fillStyle = ghost ? "rgba(126,214,255,.55)" : "#F27E5C";
    ctx.beginPath();
    ctx.moveTo(x, tipY + 18);
    ctx.lineTo(x + flagDir * 17, tipY + 24);
    ctx.lineTo(x, tipY + 30);
    ctx.closePath();
    ctx.fill();
    // 받침
    ctx.setLineDash([]);
    ctx.strokeStyle = ghost ? "rgba(126,214,255,.5)" : "rgba(255,214,138,.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 9, by);
    ctx.lineTo(x + 9, by);
    ctx.stroke();
    ctx.restore();
  }

  function drawDim(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, label: string, rgb: string): void {
    ctx.save();
    ctx.strokeStyle = `rgba(${rgb},.85)`;
    ctx.fillStyle = `rgba(${rgb},.95)`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    // 양끝 세로 틱 + 화살촉
    for (const [x, dir] of [[x0, 1], [x1, -1]] as [number, number][]) {
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x, y + 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + dir * 8, y - 3.6);
      ctx.lineTo(x + dir * 1.5, y);
      ctx.lineTo(x + dir * 8, y + 3.6);
      ctx.stroke();
    }
    ctx.font = "800 11.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 3.4;
    ctx.strokeStyle = "rgba(7,14,26,.9)";
    ctx.strokeText(label, (x0 + x1) / 2, y - 9);
    ctx.fillText(label, (x0 + x1) / 2, y - 9);
    ctx.restore();
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 340);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const mx = mirX();
    const by = baseY();
    const tipY = by - ARROW_H;
    const OX = ox();
    const IX = 2 * mx - OX; // 상 x — 거울 대칭(정확)
    const E = eyeP();

    // 모눈(거울에 정렬 — 칸 수가 그대로 거리)
    ctx.strokeStyle = "rgba(120,150,196,.14)";
    ctx.lineWidth = 1;
    for (let x = mx; x > 10; x -= G) line(ctx, x, 14, x, H - 30);
    for (let x = mx + G; x < W - 10; x += G) line(ctx, x, 14, x, H - 30);
    for (let y = by; y > 14; y -= G) line(ctx, 12, y, W - 12, y);
    for (let y = by + G; y < H - 30; y += G) line(ctx, 12, y, W - 12, y);

    // 거울 뒤 세계(옅은 틴트 + 라벨)
    ctx.fillStyle = "rgba(90,120,170,.07)";
    ctx.fillRect(mx, 14, W - 12 - mx, H - 44);
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(150,176,210,.6)";
    ctx.fillText("거울 뒤 — 실제 빛은 없어요", W - 18, 30);

    // 거울(세로) — 뒷면 빗금은 오른쪽
    mirrorProp(ctx, mx, 18, mx, H - 32, { back: -1 });

    // 물체·상
    drawArrowObj(ctx, OX, by, 1, false);
    drawArrowObj(ctx, IX, by, -1, true);
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(${GOLD},.95)`;
    ctx.fillText("물체", OX, by + 18);
    ctx.fillStyle = `rgba(${CYAN},.95)`;
    ctx.fillText("상", IX, by + 18);

    // 눈(거울 쪽을 바라봄)
    eyeProp(ctx, E.x, E.y, Math.atan2(by - 40 - E.y, mx - E.x), 13);

    // ---- 광선 작도(정확) ----
    // 눈동자 위/아래 두 점으로 들어가는 두 반사 광선.
    // 반사점 = (상점→눈동자) 직선과 거울의 교점 — 반사 법칙과 완전히 동치.
    const tip: Pt = { x: OX, y: tipY };
    const img: Pt = { x: IX, y: tipY };
    const pupils: Pt[] = [
      { x: E.x + 4, y: E.y - 6 },
      { x: E.x + 4, y: E.y + 7 },
    ];
    const flow = (tMs / 800) % 1;
    pupils.forEach((pe, k) => {
      const t = (mx - img.x) / (pe.x - img.x);
      const P: Pt = { x: mx, y: img.y + (pe.y - img.y) * t };
      // 실광선: 물체 끝 → 거울(P) → 눈
      drawBeam(ctx, [tip, P, pe], { rgb: GOLD, width: 2.4, alpha: 0.9, flow: (flow + k * 0.4) % 1, arrow: true, arrowAt: 0.9 });
      // 연장선: P → 상점(점선, 거울 뒤)
      if (showExt) {
        drawBeam(ctx, [P, img], { rgb: CYAN, width: 1.8, alpha: 0.75, dash: [5, 6], glow: false });
      }
      // 반사점 마커
      ctx.fillStyle = "rgba(226,240,255,.9)";
      ctx.beginPath();
      ctx.arc(P.x, P.y, 2.6, 0, TAU);
      ctx.fill();
    });

    // 상점(연장선 교점) 강조
    if (showExt) {
      const pr = 6 + Math.sin(tMs / 300) * 1.6;
      ctx.strokeStyle = `rgba(${CYAN},.95)`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(img.x, img.y, pr, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = `rgba(${CYAN},.9)`;
      ctx.beginPath();
      ctx.arc(img.x, img.y, 2.2, 0, TAU);
      ctx.fill();
      ctx.font = "800 10.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 3.2;
      ctx.strokeStyle = "rgba(7,14,26,.9)";
      ctx.strokeText("연장선이 만나는 점", img.x, img.y - 14);
      ctx.fillText("연장선이 만나는 점", img.x, img.y - 14);
    }

    // 거리 표기(아래 치수선) — 칸 단위, 소수 1자리
    const cells = Math.round(oxCells * 10) / 10;
    drawDim(ctx, OX, mx, by + 34, `${cells}칸`, GOLD);
    drawDim(ctx, mx, IX, by + 34, `${cells}칸`, CYAN);
    dObjVal.textContent = `${cells}칸`;
    dImgVal.textContent = `${cells}칸`;

    // 크기 재기 연출(세로 치수선)
    if (measureFx > 0) {
      measureFx = Math.max(0, measureFx - dt * 0.006);
      const a = Math.min(1, measureFx * 3);
      ctx.save();
      ctx.globalAlpha = a;
      for (const [x, rgb] of [[OX - 22, GOLD], [IX + 22, CYAN]] as [number, string][]) {
        ctx.strokeStyle = `rgba(${rgb},.9)`;
        ctx.fillStyle = `rgba(${rgb},1)`;
        ctx.lineWidth = 1.6;
        line(ctx, x, tipY, x, by);
        line(ctx, x - 5, tipY, x + 5, tipY);
        line(ctx, x - 5, by, x + 5, by);
        ctx.font = "800 11px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 3.2;
        ctx.strokeStyle = "rgba(7,14,26,.9)";
        ctx.strokeText("2칸", x, (tipY + by) / 2 + 4);
        ctx.fillText("2칸", x, (tipY + by) / 2 + 4);
      }
      ctx.restore();
    }

    // 드래그 힌트(손잡이 링)
    const hint = 1 + Math.sin(tMs / 340) * 0.06;
    ctx.strokeStyle = dragging ? "rgba(255,214,138,.9)" : "rgba(255,214,138,.4)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(OX, (tipY + by) / 2, 24 * hint, 0, TAU);
    ctx.stroke();
  });

  function line(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): void {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  api.setCTA("물체를 끌어 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
  };
};
