// lightBench — 심화 실험실 · 거울·렌즈 광학 벤치(중2 III L5, 책 106~111쪽). 가로 모드(rotateStage).
//   일반 랩(opticView)이 "겉모습 관찰"을 맡고, 이 벤치는 심화 — 빛의 경로(상 작도)를 보여 준다.
//   볼록거울·오목거울·볼록렌즈·오목렌즈 4모드. 물체(촛불)를 광축 위에서 끌면
//   거울·렌즈 공식으로 상의 위치·크기·방향을 정확히 계산해 실시간 렌더링한다.
//   "빛의 경로" 토글: 나란한 광선·중심(꼭짓점) 광선 두 갈래 — 이상광학에서 물체 끝에서 나온
//   모든 광선은 상점을 지나므로(실상) / 상점에서 나온 것처럼 보이므로(허상, 점선 연장)
//   반사·굴절 후 경로를 상점 통과 직선으로 작도한다(= 작도법과 동치, 오차 없음).
//   미션: 각 장치에서 가까이/멀리 모두 관찰(오목거울·볼록렌즈는 뒤집힘의 순간 발견).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawBeam, capturePointer, TAU, type Pt } from "../../ui/lightKit";
import type { RotateStage } from "../../ui/rotateStage";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
}

type Mode = "cvMirror" | "ccMirror" | "cvLens" | "ccLens";
const MODES: Mode[] = ["cvMirror", "ccMirror", "cvLens", "ccLens"];
const MODE_NAME: Record<Mode, string> = {
  cvMirror: "볼록 거울",
  ccMirror: "오목 거울",
  cvLens: "볼록 렌즈",
  ccLens: "오목 렌즈",
};
const GOLD = "255,203,112";
const CYAN = "126,214,255";

// 초점 거리(px) — 화면 폭에 맞춰 스케일(작은 폰에서도 상이 화면 안에 들어오게).
// UI에는 '초점' 용어를 쓰지 않는다(이 책은 상의 겉모습만 다룬다).
const focalOf = (w: number): number => clamp(w * 0.17, 96, 132);
const isMirrorMode = (m: Mode): boolean => m === "cvMirror" || m === "ccMirror";
const deviceX = (m: Mode, w: number): number => (isMirrorMode(m) ? w * 0.62 : w * 0.5);

export const mirrorLens: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    ...MODES.map((m) =>
      el("div", { class: "pn-badge", dataset: { g: m } }, el("b", { text: MODE_NAME[m] }), el("span", { text: "가까이·멀리" })),
    ),
  );
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: enterArtSvg() }),
    el("div", {
      class: "sp3-enter-txt",
      html: "<b>심화 실험실</b> — 촛불을 광축 위에서 끌면 <b>빛의 경로(작도)</b>와 상이 실시간으로 변해요.<br>화면이 자동으로 <b>가로</b>로 돌아가요.",
    }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 크게 열기" }));
  const helper = el("div", {
    class: "helper",
    html: "네 가지 거울·렌즈에 같은 물체를 비추면 상이 어떻게 다를까요? 각 장치에서 <b>가까이·멀리</b> 모두 관찰해 봐요.",
  });
  host.append(goalChips, helper, preview, enterBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  // ---- 상태 ----
  let mode: Mode = "cvMirror";
  let u = 230; // 물체~장치 거리(px)
  let showRays = true;
  const seen: Record<Mode, { near: boolean; far: boolean }> = {
    cvMirror: { near: false, far: false },
    ccMirror: { near: false, far: false },
    cvLens: { near: false, far: false },
    ccLens: { near: false, far: false },
  };
  const doneModes = new Set<Mode>();
  let finished = false;
  let rot: RotateStage | null = null;
  let loop: Loop | null = null;
  let disposed = false;
  let toastTimer = 0;
  let missionEls: Record<Mode, HTMLElement> | null = null;
  let statusPill: HTMLElement | null = null;
  let toastEl: HTMLElement | null = null;

  const HO = 62; // 물체 높이(px)

  function showToast(msg: string, ms = 2400): void {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl?.classList.remove("show"), ms);
  }

  function modeDone(m: Mode): void {
    if (doneModes.has(m)) return;
    doneModes.add(m);
    haptic(HAPTIC.ctaUnlock);
    const chip = goalChips.querySelector(`[data-g="${m}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = "관찰 완료!";
    missionEls?.[m].classList.add("on");
    const MSG: Record<Mode, string> = {
      cvMirror: "볼록 거울 — <b>언제나 작고 바로 선 상</b>. 대신 넓게 보여요(도로 반사경!)",
      ccMirror: "오목 거울 — 가까이선 <b>크고 바로</b>, 멀어지면 <b>거꾸로</b> 뒤집혀요!",
      cvLens: "볼록 렌즈 — 가까이선 <b>크고 바로</b>(돋보기!), 멀어지면 <b>거꾸로</b>!",
      ccLens: "오목 렌즈 — <b>언제나 작고 바로 선 상</b>이에요.",
    };
    showToast(MSG[m], 3000);
    if (doneModes.size === MODES.length && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! <b>볼록 거울·오목 렌즈</b>는 언제나 작고 바로 선 상, <b>오목 거울·볼록 렌즈</b>는 가까우면 크고 바로 — 멀어지면 <b>거꾸로</b> 뒤집혀요. 상의 변신은 전부 거리가 결정해요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      window.setTimeout(() => showToast("네 장치 모두 관찰 완료! 세로로 돌아가 계속해요", 3600), 3200);
    }
  }

  function setMode(m: Mode): void {
    if (mode === m) return;
    mode = m;
    u = 230;
    haptic(HAPTIC.select);
    updateSeg();
    const GUIDE: Record<Mode, string> = {
      cvMirror: "볼록 거울이에요. 촛불을 <b>가까이, 또 멀리</b> 끌어 보세요.",
      ccMirror: "오목 거울! 멀리서 시작 — 천천히 <b>가까이</b> 끌며 상을 지켜보세요. 어느 순간…?",
      cvLens: "볼록 렌즈예요. <b>가까이, 또 멀리</b> — 뒤집히는 순간을 찾아보세요.",
      ccLens: "오목 렌즈예요. 거리를 바꿔도 상이 어떤지 확인!",
    };
    showToast(GUIDE[m], 2600);
  }

  let segBtns: HTMLButtonElement[] = [];
  function updateSeg(): void {
    segBtns.forEach((b, i) => {
      b.classList.toggle("on", MODES[i] === mode);
      b.setAttribute("aria-pressed", String(MODES[i] === mode));
    });
  }

  // ---- 광학 계산 — 얇은 거울/렌즈 공식(실좌표) ----
  // 1/v + 1/u = 1/f (실물 쪽 양수 규약). v>0 = 실상(거울: 앞 / 렌즈: 반대쪽), v<0 = 허상.
  // 반환: xi(상 x), m(배율, 음수=거꾸로), virtual(허상 여부), 존재 여부
  function solve(w: number): { xi: number; m: number; virtual: boolean; ok: boolean; dx: number } {
    const dx = deviceX(mode, w);
    const f0 = focalOf(w);
    const f = mode === "ccMirror" || mode === "cvLens" ? f0 : -f0;
    const denom = 1 / f - 1 / u;
    if (Math.abs(denom) < 1e-6) return { xi: 0, m: 0, virtual: false, ok: false, dx };
    const v = 1 / denom;
    const m = -v / u;
    const xi = isMirrorMode(mode) ? dx - v : dx + v;
    return { xi, m, virtual: v < 0, ok: true, dx };
  }

  // ---- 가로 스테이지 ----
  async function enter(): Promise<void> {
    if (rot || disposed) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({ title: "심화 · 상 작도 벤치 — 촛불을 끌어 보세요", onLeave: () => leave() });

    const canvas = el("canvas", { class: "sp3-canvas" });
    statusPill = el("div", { class: "pill sp3-pill" }, el("span", { class: "pdot", style: "background:#E86FCE" }), el("span", { text: "" }));
    const seg = el("div", { class: "seg stage-seg lb-seg" });
    segBtns = MODES.map((m) => {
      const b = el("button", { text: MODE_NAME[m], attrs: { type: "button", "aria-pressed": String(m === mode) } });
      if (m === mode) b.classList.add("on");
      b.addEventListener("click", () => setMode(m));
      seg.appendChild(b);
      return b;
    });
    const rayBtn = el(
      "button",
      { class: "sp3-tiltbtn on", attrs: { type: "button", "aria-pressed": "true" } },
      el("span", { text: "빛의 경로 보기" }),
    );
    rayBtn.addEventListener("click", () => {
      showRays = !showRays;
      rayBtn.classList.toggle("on", showRays);
      rayBtn.setAttribute("aria-pressed", String(showRays));
      haptic(HAPTIC.select);
    });
    const missions = el("div", { class: "sp3-missions lb" });
    missionEls = {} as Record<Mode, HTMLElement>;
    MODES.forEach((m) => {
      const sp = el("span", { text: MODE_NAME[m] });
      if (doneModes.has(m)) sp.classList.add("on");
      missionEls![m] = sp;
      missions.appendChild(sp);
    });
    toastEl = el("div", { class: "sp3-toast" });
    rot.stage.append(canvas, statusPill, seg, rayBtn, missions, toastEl);
    updateSeg();
    showToast("촛불을 <b>좌우로 끌어</b> 보세요 — 빛의 경로가 함께 움직여요!", 2800);

    // 포인터(회전 리매핑)
    let dragging = false;
    canvas.addEventListener("pointerdown", (e) => {
      if (!rot) return;
      const p = rot.mapPoint(e);
      const { w, h } = rot.size();
      const oxNow = deviceX(mode, w) - u;
      if (Math.abs(p.x - oxNow) < 70 && Math.abs(p.y - h * 0.56) < 150) {
        dragging = true;
        capturePointer(canvas, e);
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging || !rot) return;
      const p = rot.mapPoint(e);
      const { w } = rot.size();
      const dx = deviceX(mode, w);
      u = clamp(dx - p.x, 46, Math.min(dx - 40, 430));
    });
    const endDrag = (): void => {
      dragging = false;
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    // ---- 프레임 ----
    const ctx = canvas.getContext("2d")!;
    loop = createLoop((_dt, tMs) => {
      if (!rot) return;
      const { w, h } = rot.size();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawScene(ctx, w, h, tMs);
    });
    loop.start();
  }

  function leave(): void {
    loop?.stop();
    loop = null;
    rot?.dispose();
    rot = null;
    missionEls = null;
    statusPill = null;
    toastEl = null;
    enterBtn.classList.remove("pulse");
    (enterBtn.querySelector("span") as HTMLElement).textContent = finished ? "벤치 다시 열기" : "가로 화면으로 이어서 열기";
  }

  enterBtn.addEventListener("click", () => void enter());

  // ---- 장면 ----
  function drawScene(ctx: CanvasRenderingContext2D, w: number, h: number, tMs: number): void {
    const Y0 = h * 0.56;
    const sol = solve(w);
    const dx = sol.dx;
    const ox = dx - u;
    const A = Math.min(120, h * 0.32); // 장치 반높이

    // 광축
    ctx.strokeStyle = "rgba(150,176,210,.3)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([7, 8]);
    ctx.beginPath();
    ctx.moveTo(14, Y0);
    ctx.lineTo(w - 14, Y0);
    ctx.stroke();
    ctx.setLineDash([]);

    // 바닥 눈금(거리감)
    ctx.strokeStyle = "rgba(120,150,196,.16)";
    ctx.lineWidth = 1;
    for (let x = dx; x > 20; x -= 50) tick(ctx, x, h - 26);
    for (let x = dx + 50; x < w - 20; x += 50) tick(ctx, x, h - 26);

    // 장치
    const isMirror = mode === "cvMirror" || mode === "ccMirror";
    if (isMirror) drawMirrorDevice(ctx, dx, Y0, A, mode === "cvMirror");
    else drawLensDevice(ctx, dx, Y0, A, mode === "cvLens");

    // 상 계산 + 표기
    const nearInf = !sol.ok || Math.abs(sol.m) > 8;
    let statusTxt: string;
    if (nearInf) {
      statusTxt = "상이 아주 멀리 사라지는 순간!";
    } else {
      const upright = sol.m > 0;
      const mag = Math.abs(sol.m);
      const sizeTxt = mag > 1.04 ? "커요" : mag < 0.96 ? "작아요" : "실물 크기";
      const whereTxt = isMirror ? (sol.virtual ? "거울 뒤" : "거울 앞") : sol.virtual ? "물체 쪽" : "렌즈 뒤";
      statusTxt = `${upright ? "바로 선" : "거꾸로 선"} 상 · ${sizeTxt} (${Math.round(mag * 100)}%) · ${whereTxt}`;
    }
    if (statusPill) (statusPill.querySelectorAll("span")[1] as HTMLElement).textContent = statusTxt;

    // 광선(물체 끝 → 장치 → 상점 통과/발산 — 이상광학 작도)
    const tip: Pt = { x: ox, y: Y0 - HO };
    if (showRays && sol.ok && !nearInf) {
      const imgTip: Pt = { x: sol.xi, y: Y0 - sol.m * HO };
      const hits: Pt[] = [
        { x: dx, y: tip.y }, // 나란한 광선이 장치에 닿는 점
        { x: dx, y: Y0 }, // 중심(꼭짓점) 광선
      ];
      const flow = (tMs / 800) % 1;
      hits.forEach((P, k) => {
        const rgb = k === 0 ? GOLD : CYAN;
        // 입사
        drawBeam(ctx, [tip, P], { rgb, width: 2.2, alpha: 0.85, flow: (flow + k * 0.35) % 1 });
        // 진행 방향: 실상 → 상점을 향해, 허상 → 상점 반대쪽으로 발산
        let dirX = imgTip.x - P.x;
        let dirY = imgTip.y - P.y;
        const n = Math.hypot(dirX, dirY) || 1;
        dirX /= n;
        dirY /= n;
        if (sol.virtual) {
          dirX = -dirX;
          dirY = -dirY;
        }
        // 거울인데 오른쪽으로 가려 하면(또는 렌즈인데 왼쪽) 방향 오류 방지 — 물리상 실상 방향은 공식이 보장
        const L = w;
        const end: Pt = { x: P.x + dirX * L, y: P.y + dirY * L };
        drawBeam(ctx, [P, end], { rgb, width: 2.2, alpha: 0.85, flow: (flow + k * 0.35 + 0.5) % 1, arrow: true, arrowAt: 0.22 });
        // 허상 점선 연장
        if (sol.virtual) {
          drawBeam(ctx, [P, imgTip], { rgb: CYAN, width: 1.6, alpha: 0.6, dash: [5, 6], glow: false });
        }
      });
    }

    // 물체(촛불)
    drawCandle(ctx, ox, Y0, HO, 1, false, tMs);
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(${GOLD},.9)`;
    ctx.fillText("물체", ox, Y0 + 20);

    // 상(정확한 위치·배율·방향)
    if (sol.ok && !nearInf) {
      const mag = clamp(Math.abs(sol.m), 0.12, 4.4);
      const hImg = (sol.m > 0 ? 1 : -1) * mag * HO;
      if (sol.xi > -60 && sol.xi < w + 60) {
        drawCandle(ctx, sol.xi, Y0, hImg, mag, true, tMs);
        ctx.fillStyle = `rgba(${CYAN},.9)`;
        ctx.fillText("상", sol.xi, sol.m > 0 ? Y0 + 20 : Y0 - 8 - 0);
      }
    } else {
      // 초점 근처 — 상이 무한히 멀어지는 연출
      ctx.font = "800 12px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(226,238,255,.75)";
      ctx.fillText("상이 아주 멀리…!", dx + (isMirror ? -130 : 130), Y0 - A - 12);
    }

    // 드래그 손잡이 힌트
    const pr = 1 + Math.sin(tMs / 340) * 0.06;
    ctx.strokeStyle = "rgba(255,214,138,.45)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(ox, Y0 - HO / 2, 30 * pr, 0, TAU);
    ctx.stroke();

    // 미션 판정 — 가까이(u < 초점 안쪽)와 멀리 모두 관찰
    const st = seen[mode];
    if (u <= 80) st.near = true;
    if (u >= 205) st.far = true;
    if (st.near && st.far) modeDone(mode);
  }

  function tick(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 4);
    ctx.stroke();
  }

  // 물체 = 촛불(상에서는 배율대로 커지고, m<0이면 불꽃이 아래로 — 뒤집힘이 즉시 읽힌다)
  function drawCandle(
    ctx: CanvasRenderingContext2D,
    x: number,
    baseY: number,
    hSigned: number,
    mag: number,
    isImage: boolean,
    tMs: number,
  ): void {
    const dir = hSigned > 0 ? 1 : -1;
    const h = Math.abs(hSigned);
    const bodyH = h * 0.68;
    const w = clamp(8 * (isImage ? mag : 1), 3.5, 20); // 몸통 반폭
    const top = baseY - dir * bodyH;
    ctx.save();
    // 몸통(왁스)
    const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
    if (isImage) {
      g.addColorStop(0, "rgba(140,214,255,.55)");
      g.addColorStop(0.45, "rgba(126,198,246,.72)");
      g.addColorStop(1, "rgba(74,134,190,.6)");
    } else {
      g.addColorStop(0, "#FFF2D2");
      g.addColorStop(0.45, "#F0D6A0");
      g.addColorStop(1, "#C9A05E");
    }
    ctx.fillStyle = g;
    if (isImage) ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.roundRect(x - w, Math.min(baseY, top), w * 2, bodyH, Math.min(6, w * 0.5));
    ctx.fill();
    ctx.strokeStyle = isImage ? "rgba(126,214,255,.85)" : "#8A6A34";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(x - w, Math.min(baseY, top), w * 2, bodyH, Math.min(6, w * 0.5));
    ctx.stroke();
    ctx.setLineDash([]);
    // 왁스 하이라이트
    ctx.strokeStyle = isImage ? "rgba(226,244,255,.5)" : "rgba(255,250,235,.8)";
    ctx.lineWidth = Math.max(1.4, w * 0.28);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.55, baseY - dir * bodyH * 0.16);
    ctx.lineTo(x - w * 0.55, top + dir * bodyH * 0.16);
    ctx.stroke();
    // 심지
    ctx.strokeStyle = isImage ? "rgba(180,220,250,.9)" : "#4A3A24";
    ctx.lineWidth = Math.max(1.3, w * 0.16);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top - dir * h * 0.07);
    ctx.stroke();
    // 불꽃(플리커) — 눈물방울, dir로 뒤집힘 표현
    const flameH = h - bodyH - h * 0.07;
    const fx = x + (isImage ? 0 : Math.sin(tMs / 130) * w * 0.14);
    const fBase = top - dir * h * 0.07;
    const fTip = baseY - dir * h * (1 + Math.sin(tMs / 90) * 0.02);
    const fw = Math.max(3.4, w * 0.75);
    const glow = ctx.createRadialGradient(fx, (fBase + fTip) / 2, 1, fx, (fBase + fTip) / 2, Math.abs(flameH) * 1.6 + 6);
    if (isImage) {
      glow.addColorStop(0, "rgba(160,224,255,.5)");
      glow.addColorStop(1, "rgba(160,224,255,0)");
    } else {
      glow.addColorStop(0, "rgba(255,201,110,.55)");
      glow.addColorStop(1, "rgba(255,201,110,0)");
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, (fBase + fTip) / 2, Math.abs(flameH) * 1.6 + 6, 0, TAU);
    ctx.fill();
    ctx.restore();
    const fg = ctx.createLinearGradient(0, Math.min(fBase, fTip), 0, Math.max(fBase, fTip));
    if (isImage) {
      fg.addColorStop(0, "rgba(214,240,255,.95)");
      fg.addColorStop(1, "rgba(126,214,255,.85)");
    } else {
      fg.addColorStop(dir > 0 ? 1 : 0, "#FFF4C0");
      fg.addColorStop(dir > 0 ? 0 : 1, "#FFAE4E");
    }
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(fx, fTip);
    ctx.quadraticCurveTo(fx + fw, fBase - dir * Math.abs(flameH) * 0.42, fx, fBase);
    ctx.quadraticCurveTo(fx - fw, fBase - dir * Math.abs(flameH) * 0.42, fx, fTip);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawMirrorDevice(ctx: CanvasRenderingContext2D, dx: number, Y0: number, A: number, convex: boolean): void {
    // 거울 곡면 — 볼록: 물체 쪽으로 불룩 / 오목: 물체 쪽으로 오목
    const sag = convex ? -26 : 26;
    ctx.save();
    ctx.lineCap = "round";
    // 뒷면(도금)
    ctx.strokeStyle = "rgba(64,84,116,.9)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(dx + 4, Y0 - A);
    ctx.quadraticCurveTo(dx + 4 + sag, Y0, dx + 4, Y0 + A);
    ctx.stroke();
    // 유리 앞면
    const g = ctx.createLinearGradient(0, Y0 - A, 0, Y0 + A);
    g.addColorStop(0, "rgba(212,232,255,.95)");
    g.addColorStop(0.5, "rgba(158,194,238,.85)");
    g.addColorStop(1, "rgba(206,228,254,.95)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(dx, Y0 - A);
    ctx.quadraticCurveTo(dx + sag, Y0, dx, Y0 + A);
    ctx.stroke();
    // 스펙큘러
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(dx + sag * 0.32, Y0 - A * 0.5);
    ctx.quadraticCurveTo(dx + sag * 0.5, Y0 - A * 0.25, dx + sag * 0.42, Y0 - A * 0.05);
    ctx.stroke();
    // 뒷면 빗금
    ctx.strokeStyle = "rgba(148,170,204,.5)";
    ctx.lineWidth = 1.4;
    for (let i = 1; i < 10; i++) {
      const t = i / 10;
      const yy = Y0 - A + 2 * A * t;
      const xx = dx + sag * 4 * t * (1 - t) + 5;
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx + 9, yy - 7);
      ctx.stroke();
    }
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(196,214,240,.85)";
    ctx.fillText(convex ? "볼록 거울" : "오목 거울", dx + 6, Y0 + A + 20);
    ctx.restore();
  }

  function drawLensDevice(ctx: CanvasRenderingContext2D, dx: number, Y0: number, A: number, convex: boolean): void {
    ctx.save();
    const g = ctx.createLinearGradient(dx - 20, Y0 - A, dx + 20, Y0 + A);
    g.addColorStop(0, "rgba(214,236,255,.5)");
    g.addColorStop(0.5, "rgba(150,196,240,.28)");
    g.addColorStop(1, "rgba(190,222,252,.42)");
    ctx.fillStyle = g;
    ctx.beginPath();
    if (convex) {
      ctx.moveTo(dx, Y0 - A);
      ctx.quadraticCurveTo(dx + 30, Y0, dx, Y0 + A);
      ctx.quadraticCurveTo(dx - 30, Y0, dx, Y0 - A);
    } else {
      const wTop = 17;
      ctx.moveTo(dx - wTop, Y0 - A);
      ctx.lineTo(dx + wTop, Y0 - A);
      ctx.quadraticCurveTo(dx + 3, Y0, dx + wTop, Y0 + A);
      ctx.lineTo(dx - wTop, Y0 + A);
      ctx.quadraticCurveTo(dx - 3, Y0, dx - wTop, Y0 - A);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(190,216,248,.85)";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // 스펙큘러 스트릭
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(dx - (convex ? 7 : 11), Y0 - A * 0.62);
    ctx.quadraticCurveTo(dx - (convex ? 12 : 5), Y0 - A * 0.2, dx - (convex ? 7 : 11), Y0 + A * 0.1);
    ctx.stroke();
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(196,214,240,.85)";
    ctx.fillText(convex ? "볼록 렌즈" : "오목 렌즈", dx, Y0 + A + 20);
    ctx.restore();
  }

  api.setCTA("가로 화면에서 관찰해요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    rot?.dispose();
    window.clearTimeout(toastTimer);
  };
};

// 세로 진입 카드 미니 아트 — 촛불 + 작도 스케치
function enterArtSvg(): string {
  return `<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect width="360" height="120" fill="#0B1524"/>
    <line x1="16" y1="66" x2="344" y2="66" stroke="#3A4D6E" stroke-width="1.6" stroke-dasharray="6 7"/>
    <path d="M210 22q26 44 0 88" stroke="#9EC2EE" stroke-width="4" stroke-linecap="round"/>
    <path d="M214 22q26 44 0 88" stroke="#40546E" stroke-width="6" stroke-linecap="round" opacity=".5"/>
    <rect x="90" y="38" width="12" height="28" rx="4" fill="#F0D6A0" stroke="#8A6A34" stroke-width="1.4"/>
    <path d="M96 36v-4" stroke="#4A3A24" stroke-width="1.6"/>
    <path d="M96 20q5 6 0 12q-5-6 0-12z" fill="#FFC36E"/>
    <circle cx="96" cy="26" r="9" fill="rgba(255,195,110,.25)"/>
    <path d="M96 30L210 30" stroke="rgba(255,203,112,.8)" stroke-width="2"/>
    <path d="M96 30L210 66" stroke="rgba(126,214,255,.8)" stroke-width="2"/>
    <path d="M210 30L306 88M210 66L306 88" stroke="rgba(126,214,255,.5)" stroke-width="1.8"/>
    <rect x="300" y="70" width="9" height="20" rx="3" fill="rgba(126,198,246,.6)" stroke="rgba(126,214,255,.8)" stroke-width="1.2" stroke-dasharray="4 4"/>
    <path d="M304.5 96q4-5 0-9q-4 4 0 9z" fill="rgba(160,224,255,.85)"/>
    <text x="20" y="26" font-family="Pretendard, sans-serif" font-size="12" font-weight="800" fill="#C2D2EE">심화 · 상 작도 벤치</text>
  </svg>`;
}
