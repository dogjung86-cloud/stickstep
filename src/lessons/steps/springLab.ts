// springLab — 탄성력 랩(V 단원 L4). 진짜 코일 용수철을 직접 잡아 늘인다.
//   · 늘어난 길이에 비례하는 탄성력(훅 법칙) — 게이지·그래프가 실시간 반응 (기준: 4cm=1.5N, 8cm=3.0N, 12cm=4.5N)
//   · 손을 놓으면 감쇠 진동하며 원래 길이로 — "되돌아가려는 힘"이 몸으로 보인다
//   · 당기는 힘(파랑)과 탄성력(빨강)이 반대 방향 화살표로 동시에 표시된다 (그림 V-7)
// 목표: 4·8·12cm 지점 기록 3개 + 놓아서 진동 관찰 1회.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { contactShadow } from "../../ui/labProps";
import { drawSpring, drawForceArrow, drawGround } from "../../ui/forceProps";
import type { StepRenderer } from "../types";

interface SpringLabStep {
  title: string;
  lead?: string;
  cta?: string;
}

const N_PER_CM = 0.375; // 4cm → 1.5N (교과서 그림 V-9 실측 비율)
const MAX_CM = 14;
const SNAPS = [4, 8, 12];

export const springLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SpringLabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대 + 그래프 ----
  const canvas = el("canvas", {
    class: "mstage-cvblock spring-canvas",
    style: "height:216px",
    attrs: {
      tabindex: "0",
      role: "slider",
      "aria-label": "용수철 늘이기. 좌우 화살표 키로도 조절해요.",
      "aria-valuemin": "0",
      "aria-valuemax": String(MAX_CM),
      "aria-valuenow": "0",
    },
  });
  const forceVal = el("span", { text: "0.0" });
  const stretchPill = el("span", { text: "늘어난 길이 0.0 cm" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#F25757" }), stretchPill),
      el("div", { class: "tempread" }, forceVal, el("small", { text: " N" })),
    ),
  );
  const graph = el("canvas", { class: "mstage-cvblock", style: "height:158px" });
  const graphWrap = el("div", { class: "stage hc-graph" }, graph);

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    ...SNAPS.map((cm) =>
      el("div", { class: "pn-badge force", dataset: { snap: String(cm) } }, el("b", { text: `${cm} cm` }), el("span", { text: `${(cm * N_PER_CM).toFixed(1)} N?` })),
    ),
    el("div", { class: "pn-badge force", dataset: { snap: "release" } }, el("b", { text: "놓아 보기" }), el("span", { text: "진동 관찰" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "용수철 끝 고리를 잡고 <b>오른쪽으로 천천히</b> 당겨 보세요. 힘 게이지와 그래프가 함께 움직여요.",
  });
  host.append(goalChips, stage, graphWrap, helper);

  // ---- 상태 ----
  let w = 340;
  let h = 216;
  let stretchCm = 0; // 현재 늘어난 길이(cm, 압축은 음수)
  let vel = 0; // 진동 속도(cm/frame)
  let dragging = false;
  let releasedAt = -1; // 놓은 시각(진동 관찰 판정)
  let oscCount = 0; // 놓은 뒤 0점 통과 횟수
  const snapped = new Set<number>();
  let releaseSeen = false;
  let finished = false;
  const samples: { cm: number; n: number }[] = []; // 스냅샷 점

  const cmPx = (): number => Math.min(15, (w * 0.42) / MAX_CM);
  const anchorX = (): number => w * 0.09;
  const naturalLen = (): number => w * 0.34;
  const axisY = (): number => h * 0.44;
  const handleX = (): number => anchorX() + naturalLen() + stretchCm * cmPx();

  function forceN(): number {
    return Math.max(0, stretchCm) * N_PER_CM;
  }

  // ---- 입력 ----
  function grabbable(px: number, py: number): boolean {
    return Math.hypot(px - handleX(), py - axisY()) < 40;
  }
  function setFromPointer(px: number): void {
    stretchCm = clamp((px - anchorX() - naturalLen()) / cmPx(), -2.5, MAX_CM);
    vel = 0;
    onStretchChanged();
  }
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (!grabbable(px, py)) return;
    dragging = true;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
    setFromPointer(px);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    setFromPointer(e.clientX - r.left);
  };
  const release = (): void => {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("dragging");
    if (stretchCm > 1.2) {
      releasedAt = performance.now();
      oscCount = 0;
      haptic(HAPTIC.select);
    }
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") stretchCm = clamp(stretchCm + 1, 0, MAX_CM);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") stretchCm = clamp(stretchCm - 1, 0, MAX_CM);
    else if (e.key === "Enter") {
      // 접근성 폴백: 현재 지점 기록 + 놓기
      releasedAt = performance.now();
      oscCount = 0;
    } else return;
    e.preventDefault();
    vel = 0;
    onStretchChanged();
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("keydown", onKey);

  // ---- 목표 판정 ----
  function onStretchChanged(): void {
    canvas.setAttribute("aria-valuenow", stretchCm.toFixed(1));
    for (const cm of SNAPS) {
      if (!snapped.has(cm) && Math.abs(stretchCm - cm) < 0.35) {
        snapped.add(cm);
        samples.push({ cm, n: cm * N_PER_CM });
        const chip = goalChips.querySelector(`[data-snap="${cm}"]`) as HTMLElement;
        chip.classList.add("on");
        chip.querySelector("span")!.textContent = `${(cm * N_PER_CM).toFixed(1)} N!`;
        haptic(HAPTIC.ctaUnlock);
        if (snapped.size === SNAPS.length && !releaseSeen) {
          helper.innerHTML =
            "세 점이 <b>한 직선 위</b>에! 늘어난 길이가 2배, 3배가 되니 탄성력도 정확히 2배, 3배예요. 이제 <b>손을 놓아</b> 보세요 — 용수철이 어떻게 돌아가는지!";
        }
      }
    }
    checkDone();
  }

  function checkDone(): void {
    if (finished || !releaseSeen || snapped.size < SNAPS.length) return;
    finished = true;
    helper.innerHTML =
      "다 모았어요! 변형이 클수록 탄성력이 <b>비례해서</b> 커지고, 손을 놓으면 <b>원래 모양으로 되돌아가려는 방향</b>으로 힘이 작용했어요 — 이게 탄성력이에요.";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "개념 정리하기");
  }

  // ---- 그래프 ----
  function drawGraph(): void {
    const { ctx, w: gw, h: gh } = fitCanvas(graph, 158);
    const padL = 44;
    const padR = 14;
    const padT = 14;
    const padB = 30;
    const plotW = gw - padL - padR;
    const plotH = gh - padT - padB;
    const xOf = (cm: number): number => padL + (cm / MAX_CM) * plotW;
    const yOf = (n: number): number => padT + (1 - n / 5.5) * plotH;

    ctx.strokeStyle = "rgba(148,176,214,.4)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(padL, padT - 3);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
    ctx.fillStyle = "#8CA2C0";
    ctx.font = "600 10.5px Pretendard, sans-serif";
    ctx.textAlign = "right";
    for (const n of [1.5, 3.0, 4.5]) {
      ctx.fillText(n.toFixed(1), padL - 6, yOf(n) + 3.5);
      ctx.strokeStyle = "rgba(148,176,214,.16)";
      ctx.beginPath();
      ctx.moveTo(padL, yOf(n));
      ctx.lineTo(padL + plotW, yOf(n));
      ctx.stroke();
    }
    ctx.textAlign = "center";
    for (const cm of [0, 4, 8, 12]) ctx.fillText(String(cm), xOf(cm), gh - 10);
    ctx.textAlign = "left";
    ctx.fillText("탄성력(N)", padL - 34, padT - 1);
    ctx.fillText("늘어난 길이(cm)", xOf(12) + 18, gh - 10);

    // 기록된 점들을 잇는 비례 직선
    if (samples.length >= 2) {
      ctx.strokeStyle = "rgba(240,164,34,.85)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(xOf(0), yOf(0));
      ctx.lineTo(xOf(MAX_CM), yOf(MAX_CM * N_PER_CM));
      ctx.stroke();
    }
    // 스냅샷 점
    for (const p of samples) {
      ctx.fillStyle = "#FFC24D";
      ctx.beginPath();
      ctx.arc(xOf(p.cm), yOf(p.n), 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.6)";
      ctx.beginPath();
      ctx.arc(xOf(p.cm) - 1.2, yOf(p.n) - 1.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // 현재 점(발광)
    const cm = Math.max(0, stretchCm);
    const px = xOf(cm);
    const py = yOf(forceN());
    const glow = ctx.createRadialGradient(px, py, 0, px, py, 13);
    glow.addColorStop(0, "rgba(242,87,87,.55)");
    glow.addColorStop(1, "rgba(242,87,87,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#F25757";
    ctx.beginPath();
    ctx.arc(px, py, 4.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- 프레임 ----
  let shownForce = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 216);
    const ctx = fit.ctx;
    w = fit.w;
    h = fit.h;
    const ax = anchorX();
    const ay = axisY();
    const hx = handleX();

    // 놓은 뒤: 감쇠 진동 물리
    if (!dragging && Math.abs(stretchCm) > 0.02) {
      const k = 0.045; // 강성
      const c = 0.06; // 감쇠
      vel += (-k * stretchCm - c * vel) * dt;
      const prev = stretchCm;
      stretchCm += vel * dt;
      if (releasedAt > 0 && prev * stretchCm < 0) {
        oscCount++;
        if (!releaseSeen && oscCount >= 2) {
          releaseSeen = true;
          const chip = goalChips.querySelector('[data-snap="release"]') as HTMLElement;
          chip.classList.add("on");
          chip.querySelector("span")!.textContent = "출렁출렁!";
          haptic(HAPTIC.ctaUnlock);
          if (snapped.size < SNAPS.length) {
            helper.innerHTML = "용수철이 <b>스스로 원래 길이로</b> 돌아가며 출렁였죠? 이제 <b>4·8·12cm</b> 눈금에 맞춰 기록을 모아 보세요.";
          }
          checkDone();
        }
      }
      if (Math.abs(stretchCm) < 0.05 && Math.abs(vel) < 0.02) {
        stretchCm = 0;
        vel = 0;
      }
      canvas.setAttribute("aria-valuenow", Math.max(0, stretchCm).toFixed(1));
    }

    // ---- 무대 그리기 ----
    drawGround(ctx, w, ay + 58, h);
    // 벽 마운트(왼쪽)
    const wallG = ctx.createLinearGradient(ax - 26, 0, ax - 6, 0);
    wallG.addColorStop(0, "rgba(150,172,204,.16)");
    wallG.addColorStop(1, "rgba(150,172,204,.38)");
    ctx.fillStyle = wallG;
    ctx.fillRect(ax - 26, ay - 52, 20, 104);
    ctx.strokeStyle = "rgba(216,232,252,.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(ax - 26, ay - 52, 20, 104);
    for (const by of [ay - 38, ay, ay + 38]) {
      ctx.fillStyle = "rgba(226,238,252,.75)";
      ctx.beginPath();
      ctx.arc(ax - 16, by, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 자(눈금) — 자연 길이 끝(0cm)부터
    const zeroX = ax + naturalLen();
    const rulerY = ay + 44;
    ctx.strokeStyle = "rgba(148,176,214,.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(zeroX - 6, rulerY);
    ctx.lineTo(zeroX + MAX_CM * cmPx() + 8, rulerY);
    ctx.stroke();
    ctx.font = "600 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    for (let cm = 0; cm <= MAX_CM; cm++) {
      const tx = zeroX + cm * cmPx();
      const major = cm % 4 === 0;
      ctx.strokeStyle = major ? "rgba(216,232,252,.75)" : "rgba(148,176,214,.4)";
      ctx.lineWidth = major ? 1.8 : 1;
      ctx.beginPath();
      ctx.moveTo(tx, rulerY);
      ctx.lineTo(tx, rulerY - (major ? 9 : 5));
      ctx.stroke();
      if (major) {
        ctx.fillStyle = snapped.has(cm) ? "#FFC24D" : "#8CA2C0";
        ctx.fillText(cm === 0 ? "0" : `${cm}cm`, tx, rulerY + 14);
      }
    }

    // 용수철(코일 수 10 — 늘어나면 간격이 벌어진다)
    drawSpring(ctx, ax - 6, ay, hx, ay, { coils: 10, radius: 12 });

    // 손잡이 고리
    contactShadow(ctx, hx, ay + 56, 34, 0.2);
    const grabbing = dragging;
    ctx.strokeStyle = grabbing ? "#FFC24D" : "rgba(226,238,252,.9)";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.arc(hx + 10, ay, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = grabbing ? "rgba(255,194,77,.25)" : "rgba(226,238,252,.12)";
    ctx.fill();
    if (!grabbing && !finished) {
      // 잡기 유도 링(맥동)
      const pulse = 15 + Math.sin(tMs / 300) * 3;
      ctx.strokeStyle = "rgba(255,194,77,.35)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(hx + 10, ay, pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 힘 화살표 — 당기는 힘(파랑, 드래그 중) vs 탄성력(빨강, 반대)
    const f = forceN();
    if (stretchCm > 0.3) {
      const arrowLen = f * 26;
      drawForceArrow(ctx, hx + 22, ay - 26, -arrowLen, 0, { color: "#F25757", width: 4.4, label: dragging ? undefined : "탄성력" });
      if (dragging) {
        drawForceArrow(ctx, hx + 22, ay + 26, arrowLen, 0, { color: "#4EA3F5", width: 4.4 });
        ctx.font = "700 11px Pretendard, sans-serif";
        ctx.fillStyle = "#9CC8F5";
        ctx.textAlign = "left";
        ctx.fillText("당기는 힘", Math.min(hx + 30 + arrowLen, w - 62), ay + 44);
        ctx.fillStyle = "#F5A0A0";
        ctx.fillText("탄성력", Math.max(8, hx + 22 - arrowLen - 44), ay - 22);
      }
    }

    // HUD 갱신
    const fTxt = f.toFixed(1);
    if (fTxt !== shownForce) {
      shownForce = fTxt;
      forceVal.textContent = fTxt;
      stretchPill.textContent = `늘어난 길이 ${Math.max(0, stretchCm).toFixed(1)} cm`;
    }

    drawGraph();
  });

  const onResize = (): void => {
    fitCanvas(canvas, 216);
    fitCanvas(graph, 158);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("기록 3개 + 진동 관찰을 완료하세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", release);
    canvas.removeEventListener("pointercancel", release);
    canvas.removeEventListener("keydown", onKey);
  };
};
