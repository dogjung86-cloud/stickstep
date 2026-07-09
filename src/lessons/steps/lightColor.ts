// lightColor — 빛의 합성 랩 3종(중2 III L6, 책 112~115쪽).
//   objectColorLab: 조명 색(백·빨·초·파)을 바꾸면 물체의 보이는 색이 실시간으로 변한다.
//     물체의 색 = 물체가 "반사하는 빛"의 색 — 초록 조명 아래 빨간 장미는 검게 보인다.
//   colorMixLab: 빨강·초록·파랑 스포트라이트 3개를 직접 끌어 스크린 위에서 겹친다.
//     캔버스 additive 합성("lighter")이라 겹친 부분은 진짜 빛의 덧셈 색(노랑·자홍·청록·흰색).
//   pixelLab: 화면 그림 위에 돋보기를 끌면 화소(R·G·B 줄무늬)가 확대되어 어떤 빛이
//     켜졌는지 보인다. 마지막엔 화소 슬라이더로 직접 색(주황)을 합성해 본다.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { TAU, capturePointer } from "../../ui/lightKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// ══════════════════════════════════════════════════════════
// objectColorLab — 물체의 색
// ══════════════════════════════════════════════════════════
type LightKey = "white" | "red" | "green" | "blue";
const LIGHT_RGB: Record<LightKey, [number, number, number]> = {
  white: [1, 1, 1],
  red: [1, 0.06, 0.06],
  green: [0.06, 1, 0.1],
  blue: [0.1, 0.12, 1],
};
const LIGHT_NAME: Record<LightKey, string> = { white: "백색광", red: "빨간 조명", green: "초록 조명", blue: "파란 조명" };

export const objectColorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:300px" });
  const segBtns: Record<LightKey, HTMLButtonElement> = {} as Record<LightKey, HTMLButtonElement>;
  const seg = el("div", { class: "seg stage-seg", style: "margin-top:0" });
  (Object.keys(LIGHT_NAME) as LightKey[]).forEach((k) => {
    const b = el("button", { text: LIGHT_NAME[k].replace(" 조명", ""), attrs: { type: "button", "aria-pressed": String(k === "white") } });
    if (k === "white") b.classList.add("on");
    b.addEventListener("click", () => pickLight(k));
    segBtns[k] = b;
    seg.appendChild(b);
  });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, seg));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "red" } }, el("b", { text: "빨간 조명" }), el("span", { text: "잎은 무슨 색?" })),
    el("div", { class: "pn-badge", dataset: { g: "green" } }, el("b", { text: "초록 조명" }), el("span", { text: "꽃은 무슨 색?" })),
    el("div", { class: "pn-badge", dataset: { g: "blue" } }, el("b", { text: "파란 조명" }), el("span", { text: "장미 전체는?" })),
  );
  const choices = el("div", { class: "hook-choices" });
  const helper = el("div", {
    class: "helper",
    html: "백색광 아래 <b>빨간 장미와 초록 잎</b>, 그리고 흰 공·검은 공이 있어요. 먼저 질문 하나!",
  });
  host.append(goalChips, stage, choices, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let light: LightKey = "white";
  let predicted = false;
  let predictPick = -1;
  let confirmedRed = false;
  const goals = new Set<string>();
  let finished = false;

  // 물체의 반사 성분(그 색의 빛만 반사한다)
  const REFL = {
    petal: [1, 0, 0] as [number, number, number],
    leaf: [0, 1, 0] as [number, number, number],
    whiteBall: [1, 1, 1] as [number, number, number],
    blackBall: [0, 0, 0] as [number, number, number],
  };

  function seenColor(refl: [number, number, number]): string {
    const L = LIGHT_RGB[light];
    const r = Math.round(255 * refl[0] * L[0]);
    const g = Math.round(255 * refl[1] * L[1]);
    const b = Math.round(255 * refl[2] * L[2]);
    // 아무 빛도 반사하지 못하면 검은색 — 무대에서 형체만 보이게 아주 어둡게
    if (r + g + b < 26) return "#10161F";
    return `rgb(${r},${g},${b})`;
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
        "정리! 물체의 색은 <b>물체가 반사하는 빛의 색</b>이에요. 빨간 장미는 <b>빨간 빛만 반사</b>하니까, 초록 조명 아래에선 반사할 빛이 없어 <b>검게</b> 보여요. 흰 물체는 <b>모든 빛</b>을, 검은 물체는 <b>아무 빛도</b> 반사하지 않죠.";
      api.enableCTA(s.cta ?? "다음 실험으로");
    }
  }

  function startPredict(): void {
    // 질문은 선택지 위(.hook-q)에 — helper는 선택지 아래라 질문이 안 보인다(실사용 피드백 2026-07-10).
    choices.appendChild(
      el("div", { class: "hook-q", html: "질문! <b>빨간 조명</b>만 있는 방에서 <b>초록 잎</b>은 무슨 색으로 보일까요?" }),
    );
    const opts = ["잎도 원래대로 초록색", "잎은 더 밝은 빨간색", "잎은 거의 검은색"];
    opts.forEach((label, i) => {
      const b = el("button", { class: "hook-choice", attrs: { "aria-pressed": "false" }, text: label });
      b.addEventListener("click", () => {
        if (choices.classList.contains("locked")) return;
        choices.classList.add("locked");
        predicted = true;
        predictPick = i;
        haptic(HAPTIC.select);
        choices.querySelectorAll(".hook-choice").forEach((x) => {
          x.classList.add(x === b ? "sel" : "dim");
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
          (x as HTMLButtonElement).disabled = x !== b;
        });
        helper.innerHTML = "직접 확인! 위에서 <b>빨강</b> 조명을 켜 보세요.";
      });
      choices.appendChild(b);
    });
    helper.innerHTML = "정답을 몰라도 괜찮아요. 직감으로 하나를 골라 보세요!";
    choices.classList.add("show");
  }

  function pickLight(k: LightKey): void {
    if (light === k) return;
    if (!predicted && k !== "white") {
      helper.innerHTML = "먼저 위 질문에서 <b>예상을 골라</b> 주세요!";
      haptic(HAPTIC.wrong);
      return;
    }
    light = k;
    (Object.keys(segBtns) as LightKey[]).forEach((kk) => {
      segBtns[kk].classList.toggle("on", kk === k);
      segBtns[kk].setAttribute("aria-pressed", String(kk === k));
    });
    haptic(HAPTIC.select);
    if (k === "red") {
      if (!confirmedRed) {
        confirmedRed = true;
        api.recordQuiz(predictPick === 2);
        window.setTimeout(() => choices.classList.remove("show"), 350);
        helper.innerHTML =
          predictPick === 2
            ? "예측 적중! 초록 잎은 <b>초록 빛만 반사</b>할 수 있는데, 빨간 조명엔 초록 빛이 없어서 <b>검게</b> 보여요. 꽃은 여전히 빨갛죠. 이제 <b>초록</b> 조명도 켜 봐요!"
            : "확인했죠? 초록 잎은 <b>초록 빛만 반사</b>할 수 있어요. 빨간 조명엔 초록 빛이 없으니 반사할 게 없어 <b>검게</b> 보여요. 이제 <b>초록</b> 조명도 켜 봐요!";
      }
      collect("red", "잎이 검정!");
    } else if (k === "green") {
      if (goals.has("red")) {
        helper.innerHTML = "이번엔 반대! <b>빨간 꽃잎이 검게</b>, 초록 잎만 초록으로 보여요. 마지막으로 <b>파랑</b> 조명!";
        collect("green", "꽃이 검정!");
      }
    } else if (k === "blue") {
      if (goals.has("green")) {
        helper.innerHTML = "파란 조명 아래선 장미 전체가 <b>검게</b> — 빨강도 초록도 파란 빛을 반사하지 못하거든요. 흰 공만 <b>파랗게</b> 빛나요!";
        collect("blue", "흰 공만 파랑!");
      }
    } else {
      helper.innerHTML = "백색광 — 모든 색의 빛이 들어 있어 물체가 <b>제 색</b>으로 보여요.";
    }
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, 300);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const L = LIGHT_RGB[light];

    // 천장 스포트라이트(현재 조명 색)
    const lr = Math.round(232 * L[0] + 16);
    const lg = Math.round(232 * L[1] + 16);
    const lb = Math.round(232 * L[2] + 16);
    const cone = ctx.createRadialGradient(W / 2, 6, 8, W / 2, H * 0.7, W * 0.72);
    cone.addColorStop(0, `rgba(${lr},${lg},${lb},.30)`);
    cone.addColorStop(0.55, `rgba(${lr},${lg},${lb},.10)`);
    cone.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cone;
    ctx.fillRect(0, 0, W, H);
    // 조명 기구
    ctx.fillStyle = "#2E3C54";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 26, 8, 52, 12, 6);
    ctx.fill();
    ctx.fillStyle = `rgba(${lr},${lg},${lb},.95)`;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 18, 17, 36, 5, 2.5);
    ctx.fill();

    // 선반
    const shelfY = H - 64;
    ctx.fillStyle = "#22304A";
    ctx.beginPath();
    ctx.roundRect(20, shelfY, W - 40, 10, 5);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.1)";
    ctx.fillRect(24, shelfY + 1.5, W - 48, 2.2);

    // ---- 물체들 ----
    const cxRose = W * 0.3;
    // 장미: 줄기+잎(leaf), 꽃(petal)
    ctx.strokeStyle = seenColor([0.05, 0.55, 0.08]);
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cxRose, shelfY - 2);
    ctx.quadraticCurveTo(cxRose - 5, shelfY - 42, cxRose, shelfY - 78);
    ctx.stroke();
    // 잎 두 장
    const leafC = seenColor(REFL.leaf);
    for (const [ldx, ly, rot] of [[-16, -36, -0.7], [15, -52, 0.6]] as [number, number, number][]) {
      ctx.save();
      ctx.translate(cxRose + ldx, shelfY + ly);
      ctx.rotate(rot);
      ctx.fillStyle = leafC;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 7.5, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.16)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-11, 0);
      ctx.lineTo(11, 0);
      ctx.stroke();
      ctx.restore();
    }
    // 꽃(겹꽃잎)
    const petalC = seenColor(REFL.petal);
    const fy = shelfY - 92;
    ctx.fillStyle = petalC;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + tMs * 0.0001;
      ctx.beginPath();
      ctx.ellipse(cxRose + Math.cos(a) * 10, fy + Math.sin(a) * 10, 11, 8, a, 0, TAU);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cxRose, fy, 9.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.beginPath();
    ctx.ellipse(cxRose - 5, fy - 6, 5, 3.4, -0.5, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(10,16,26,.55)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cxRose, fy, 20, 0, TAU);
    ctx.stroke();

    // 흰 공 / 검은 공
    for (const [bx, refl, name] of [
      [W * 0.62, REFL.whiteBall, "흰 공"],
      [W * 0.84, REFL.blackBall, "검은 공"],
    ] as [number, [number, number, number], string][]) {
      const c = seenColor(refl);
      const by = shelfY - 20;
      // 접촉 그림자
      ctx.fillStyle = "rgba(3,9,20,.5)";
      ctx.beginPath();
      ctx.ellipse(bx, shelfY + 2, 20, 4.5, 0, 0, TAU);
      ctx.fill();
      const g = ctx.createRadialGradient(bx - 7, by - 8, 2, bx, by, 21);
      g.addColorStop(0, c);
      g.addColorStop(1, shade(c, 0.55));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, 19, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(226,238,255,.25)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(bx, by, 19, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.4)";
      ctx.beginPath();
      ctx.ellipse(bx - 6, by - 8, 4.5, 3, -0.5, 0, TAU);
      ctx.fill();
      ctx.font = "700 10.5px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(174,196,228,.8)";
      ctx.fillText(name, bx, shelfY + 24);
    }
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(174,196,228,.8)";
    ctx.fillText("빨간 장미 + 초록 잎", cxRose, shelfY + 24);
  });

  startPredict();
  api.setCTA("조명을 바꿔 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};

function shade(color: string, k: number): string {
  if (color.startsWith("#")) return color;
  const m = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return color;
  return `rgb(${Math.round(Number(m[1]) * k)},${Math.round(Number(m[2]) * k)},${Math.round(Number(m[3]) * k)})`;
}

// ══════════════════════════════════════════════════════════
// colorMixLab — 빛의 삼원색 스포트라이트
// ══════════════════════════════════════════════════════════
export const colorMixLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:330px" });
  const toast = el("div", { class: "toast" });
  const stage = el("div", { class: "stage" }, canvas, toast);

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "yellow" } }, el("b", { text: "노랑" }), el("span", { text: "빨강+초록" })),
    el("div", { class: "pn-badge", dataset: { g: "magenta" } }, el("b", { text: "자홍" }), el("span", { text: "빨강+파랑" })),
    el("div", { class: "pn-badge", dataset: { g: "cyan" } }, el("b", { text: "청록" }), el("span", { text: "초록+파랑" })),
    el("div", { class: "pn-badge", dataset: { g: "white" } }, el("b", { text: "흰색" }), el("span", { text: "세 빛 모두" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "무대 스크린에 <b>빨강·초록·파랑</b> 조명 세 개가 켜져 있어요. 조명을 <b>끌어서 겹쳐</b> 보세요 — 겹친 곳의 색은 진짜 빛의 덧셈이에요!",
  });
  host.append(goalChips, stage, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let H = 330;
  const R = 74; // 스포트 반지름
  const lights = [
    { key: "R", rgb: "255,36,28", fx: 0.3, fy: 0.34, x: 0, y: 0 },
    { key: "G", rgb: "36,255,60", fx: 0.7, fy: 0.34, x: 0, y: 0 },
    { key: "B", rgb: "40,80,255", fx: 0.5, fy: 0.72, x: 0, y: 0 },
  ];
  let placed = false;
  let dragIdx = -1;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;

  function showToast(msg: string): void {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function collect(id: string, name: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = "만들었어요!";
    haptic(HAPTIC.ctaUnlock);
    showToast(name);
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 빛은 섞을수록 <b>밝아져요</b>. 빨강+초록=<b>노랑</b>, 빨강+파랑=<b>자홍</b>, 초록+파랑=<b>청록</b>, 셋 다 겹치면 <b>백색광</b> — 이 세 가지가 <b>빛의 삼원색</b>이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음 실험으로");
    }
  }

  // ---- 조작 ----
  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    let best = 70;
    dragIdx = -1;
    lights.forEach((l, i) => {
      const d = Math.hypot(px - l.x, py - l.y);
      if (d < best) {
        best = d;
        dragIdx = i;
      }
    });
    if (dragIdx >= 0) {
      capturePointer(canvas, e);
      haptic(HAPTIC.tap);
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (dragIdx < 0) return;
    const r = canvas.getBoundingClientRect();
    const l = lights[dragIdx];
    l.x = clamp(e.clientX - r.left, 30, W - 30);
    l.y = clamp(e.clientY - r.top, 46, H - 40);
    l.fx = l.x / W;
    l.fy = l.y / H;
  });
  const endDrag = (): void => {
    dragIdx = -1;
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  // ---- 프레임 ----
  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, 330);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    if (!placed) {
      placed = true;
      lights.forEach((l) => {
        l.x = l.fx * W;
        l.y = l.fy * H;
      });
    }

    // 스크린 프레임
    ctx.strokeStyle = "rgba(120,146,190,.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(10, 26, W - 20, H - 60, 14);
    ctx.stroke();
    ctx.font = "800 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(150,176,210,.6)";
    ctx.fillText("스크린", 20, 20);

    // 스포트라이트 — additive 합성(진짜 빛의 덧셈)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(12, 28, W - 24, H - 64, 12);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    for (const l of lights) {
      const g = ctx.createRadialGradient(l.x, l.y, R * 0.1, l.x, l.y, R);
      g.addColorStop(0, `rgba(${l.rgb},.96)`);
      g.addColorStop(0.72, `rgba(${l.rgb},.9)`);
      g.addColorStop(1, `rgba(${l.rgb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(l.x, l.y, R, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // 겹침 판정 + 라벨
    const [rr, gg, bb] = lights;
    const dRG = Math.hypot(rr.x - gg.x, rr.y - gg.y);
    const dRB = Math.hypot(rr.x - bb.x, rr.y - bb.y);
    const dGB = Math.hypot(gg.x - bb.x, gg.y - bb.y);
    const th = R * 0.92;
    const allTh = R * 0.8;
    const allIn = dRG < allTh && dRB < allTh && dGB < allTh;
    const label = (x: number, y: number, txt: string): void => {
      ctx.font = "800 12px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 3.4;
      ctx.strokeStyle = "rgba(7,14,26,.85)";
      ctx.strokeText(txt, x, y);
      ctx.fillStyle = "#fff";
      ctx.fillText(txt, x, y);
    };
    if (allIn) {
      label((rr.x + gg.x + bb.x) / 3, (rr.y + gg.y + bb.y) / 3, "흰색!");
      collect("white", "세 빛이 모두 겹치면 — 백색광!");
    } else {
      if (dRG < th) {
        label((rr.x + gg.x) / 2, (rr.y + gg.y) / 2, "노랑");
        collect("yellow", "빨강 + 초록 = 노랑!");
      }
      if (dRB < th) {
        label((rr.x + bb.x) / 2, (rr.y + bb.y) / 2, "자홍");
        collect("magenta", "빨강 + 파랑 = 자홍!");
      }
      if (dGB < th) {
        label((gg.x + bb.x) / 2, (gg.y + bb.y) / 2, "청록");
        collect("cyan", "초록 + 파랑 = 청록!");
      }
    }

    // 손잡이(조명 헤드)
    lights.forEach((l, i) => {
      const pr = 1 + (dragIdx === i ? 0.12 : Math.sin(tMs / 380 + i * 2) * 0.05);
      ctx.strokeStyle = "rgba(226,238,255,.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 13 * pr, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = `rgba(${l.rgb},.95)`;
      ctx.beginPath();
      ctx.arc(l.x, l.y, 6.5, 0, TAU);
      ctx.fill();
      ctx.font = "800 10px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(226,238,255,.9)";
      ctx.fillText(l.key === "R" ? "빨강" : l.key === "G" ? "초록" : "파랑", l.x, l.y - 19 * pr);
    });
  });

  api.setCTA("조명을 겹쳐 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
  };
};

// ══════════════════════════════════════════════════════════
// pixelLab — 영상 장치의 화소 + 화소 조종
// ══════════════════════════════════════════════════════════
type PxColor = { name: string; on: [boolean, boolean, boolean]; css: string };
const PX_COLORS: Record<string, PxColor> = {
  yellow: { name: "노랑", on: [true, true, false], css: "#FFDF3C" },
  magenta: { name: "자홍", on: [true, false, true], css: "#F048D8" },
  cyan: { name: "청록", on: [false, true, true], css: "#2AD8E6" },
  white: { name: "흰색", on: [true, true, true], css: "#F4F8FF" },
  off: { name: "꺼짐", on: [false, false, false], css: "#0A1220" },
};

export const pixelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:320px" });
  const stage = el("div", { class: "stage" }, canvas);

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "yellow" } }, el("b", { text: "노랑 화소" }), el("span", { text: "물고기" })),
    el("div", { class: "pn-badge", dataset: { g: "magenta" } }, el("b", { text: "자홍 화소" }), el("span", { text: "산호" })),
    el("div", { class: "pn-badge", dataset: { g: "white" } }, el("b", { text: "흰색 화소" }), el("span", { text: "공기 방울" })),
    el("div", { class: "pn-badge", dataset: { g: "orange" } }, el("b", { text: "주황 만들기" }), el("span", { text: "슬라이더로" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "영상 속 <b>노란 물고기</b> — 화면엔 노란 빛이 없어요! <b>돋보기를 끌어서</b> 노란 부분을 확대해 보세요.",
  });

  // 화소 조종 슬라이더(3곳 검사 후 등장)
  const sliders = el("div", { class: "px-sliders" });
  const patch = el("div", { class: "px-patch" });
  const goalTxt = el("div", { class: "px-goal-txt", html: "미션: 슬라이더로 <b>주황</b>을 만들어 보세요. 힌트 — 빨강 가득, 초록 절반!" });
  const goalCard = el("div", { class: "px-goal", style: "display:none" }, patch, goalTxt);
  host.append(goalChips, stage, sliders, goalCard, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const chan = [255, 255, 255]; // R,G,B 0~255
  const CH_META = [
    { name: "빨강", grad: "linear-gradient(90deg,#5A1210,#FF3A30)" },
    { name: "초록", grad: "linear-gradient(90deg,#0E3A16,#2ADB4E)" },
    { name: "파랑", grad: "linear-gradient(90deg,#101A4A,#3A6CFF)" },
  ];
  const slRefs: { fill: HTMLElement; knob: HTMLElement; val: HTMLElement }[] = [];
  CH_META.forEach((meta, i) => {
    const fill = el("i", { class: "px-fill", style: `background:${meta.grad}` });
    const knob = el("i", { class: "px-knob" });
    const track = el("div", { class: "px-track" }, fill, knob);
    const val = el("b", { class: "px-val", text: "100%" });
    const row = el(
      "div",
      { class: "px-sl", attrs: { role: "slider", tabindex: "0", "aria-label": `${meta.name} 빛 밝기`, "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "100" } },
      el("b", { text: meta.name }),
      track,
      val,
    );
    let drag = false;
    const setFrom = (cx: number): void => {
      const tr = track.getBoundingClientRect();
      chan[i] = Math.round(clamp(((cx - tr.left) / tr.width) * 255, 0, 255));
      syncSliders();
    };
    row.addEventListener("pointerdown", (e) => {
      drag = true;
      capturePointer(row, e);
      setFrom(e.clientX);
    });
    row.addEventListener("pointermove", (e) => {
      if (drag) setFrom(e.clientX);
    });
    row.addEventListener("pointerup", () => (drag = false));
    row.addEventListener("pointercancel", () => (drag = false));
    row.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") chan[i] = clamp(chan[i] + 12, 0, 255);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") chan[i] = clamp(chan[i] - 12, 0, 255);
      else return;
      e.preventDefault();
      syncSliders();
    });
    sliders.appendChild(row);
    slRefs.push({ fill, knob, val });
  });

  function syncSliders(): void {
    slRefs.forEach((r, i) => {
      const pct = Math.round((chan[i] / 255) * 100);
      r.fill.style.width = `${pct}%`;
      r.knob.style.left = `${pct}%`;
      r.val.textContent = `${pct}%`;
      (r.val.parentElement as HTMLElement).setAttribute("aria-valuenow", String(pct));
    });
    patch.style.background = `rgb(${chan[0]},${chan[1]},${chan[2]})`;
    // 주황 판정 — 빨강 강함, 초록 중간, 파랑 약함
    const [r, g, b] = chan;
    if (r > 215 && g > 90 && g < 175 && b < 60) {
      if (!goals.has("orange")) {
        collect("orange", "합성 마스터!");
        goalTxt.innerHTML = "완성! <b>빨강 가득 + 초록 절반 + 파랑 꺼짐 = 주황</b>. 영상 장치는 화소 세 개의 <b>밝기만 조절</b>해 세상의 모든 색을 만들어요.";
        haptic(HAPTIC.correct);
      }
    }
  }

  // ---- 장면 모델(분석적 — 픽셀 읽기 없음) ----
  let W = 340;
  let H = 320;
  const scrRect = (): { x: number; y: number; w: number; h: number } => ({ x: 14, y: 14, w: W - 28, h: H - 96 });
  function sceneKeyAt(x: number, y: number): keyof typeof PX_COLORS {
    const r = scrRect();
    const nx = (x - r.x) / r.w;
    const ny = (y - r.y) / r.h;
    if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return "off";
    // 물고기(노랑): 몸통 타원 + 꼬리
    const fx = 0.42;
    const fy = 0.44;
    if (((nx - fx) / 0.17) ** 2 + ((ny - fy) / 0.13) ** 2 < 1) return "yellow";
    if (nx > fx + 0.14 && nx < fx + 0.25 && Math.abs(ny - fy) < (nx - fx - 0.12) * 1.1) return "yellow";
    // 공기 방울(흰색)
    for (const [bx, by, br] of [[0.68, 0.2, 0.045], [0.76, 0.3, 0.03], [0.62, 0.12, 0.026]] as [number, number, number][]) {
      if (((nx - bx) / br) ** 2 + ((ny - by) / (br * 1.4)) ** 2 < 1) return "white";
    }
    // 산호(자홍) — 아래쪽 뭉게 블롭
    if (ny > 0.66 && nx < 0.34) {
      const k = Math.sin(nx * 26) * 0.05;
      if (ny > 0.72 + k) return "magenta";
    }
    // 물(청록)
    return "cyan";
  }

  // ---- 돋보기 ----
  const loupe = { x: 0, y: 0, r: 56, placed: false };
  let dragging = false;
  const goals = new Set<string>();
  let finished = false;
  const probed = new Set<string>();

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 화면의 모든 색은 <b>빨강·초록·파랑 화소</b>의 밝기 조합이에요. 노랑 = 빨강+초록 켜짐, 자홍 = 빨강+파랑, 흰색 = 셋 다 — 멀리서 보면 눈이 <b>합성된 색</b>으로 느끼죠.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    loupe.x = e.clientX - r.left;
    loupe.y = e.clientY - r.top;
    loupe.placed = true;
    dragging = true;
    capturePointer(canvas, e);
    haptic(HAPTIC.tap);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    loupe.x = e.clientX - r.left;
    loupe.y = e.clientY - r.top;
  });
  canvas.addEventListener("pointerup", () => (dragging = false));
  canvas.addEventListener("pointercancel", () => (dragging = false));

  function probe(key: string): void {
    if (probed.has(key)) return;
    if (key === "yellow" || key === "magenta" || key === "white") {
      probed.add(key);
      const c = PX_COLORS[key];
      const onTxt = ["빨강", "초록", "파랑"].filter((_, i) => c.on[i]).join(" + ");
      helper.innerHTML = `<b>${c.name}</b>의 정체 — 켜진 화소는 <b>${onTxt}</b>! ${key === "white" ? "세 화소가 모두 켜지면 흰색이에요." : `${c.name} 빛을 내는 화소는 없어요 — 눈이 합성한 색이죠.`}`;
      collect(key, "정체 확인!");
      if (probed.size === 3 && !goals.has("orange")) {
        window.setTimeout(() => {
          sliders.classList.add("show");
          goalCard.style.display = "flex";
          helper.innerHTML = "이제 직접! 아래 <b>화소 슬라이더</b>로 세 빛의 밝기를 조절해 <b>주황</b>을 만들어 보세요.";
          syncSliders();
        }, 900);
      }
    }
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, 320);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const r = scrRect();
    if (!loupe.placed) {
      loupe.x = r.x + r.w * 0.42;
      loupe.y = r.y + r.h * 0.44;
    }

    // ---- 화면(장면) — 장면 모델을 그대로 그린다 ----
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 12);
    ctx.clip();
    // 물(청록)
    ctx.fillStyle = PX_COLORS.cyan.css;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    // 산호(자홍)
    ctx.fillStyle = PX_COLORS.magenta.css;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h * 0.78);
    for (let nx = 0; nx <= 0.34; nx += 0.02) {
      ctx.lineTo(r.x + nx * r.w, r.y + (0.72 + Math.sin(nx * 26) * 0.05) * r.h);
    }
    ctx.lineTo(r.x + 0.34 * r.w, r.y + r.h);
    ctx.lineTo(r.x, r.y + r.h);
    ctx.closePath();
    ctx.fill();
    // 물고기(노랑)
    const fx = r.x + 0.42 * r.w;
    const fy = r.y + 0.44 * r.h;
    ctx.fillStyle = PX_COLORS.yellow.css;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 0.17 * r.w, 0.13 * r.h, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(fx + 0.14 * r.w, fy);
    ctx.lineTo(fx + 0.25 * r.w, fy - 0.12 * r.h);
    ctx.lineTo(fx + 0.25 * r.w, fy + 0.12 * r.h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1A2430";
    ctx.beginPath();
    ctx.arc(fx - 0.09 * r.w, fy - 0.02 * r.h, 3.4, 0, TAU);
    ctx.fill();
    // 공기 방울(흰색)
    ctx.fillStyle = PX_COLORS.white.css;
    for (const [bx, by, br] of [[0.68, 0.2, 0.045], [0.76, 0.3, 0.03], [0.62, 0.12, 0.026]] as [number, number, number][]) {
      ctx.beginPath();
      ctx.ellipse(r.x + bx * r.w, r.y + by * r.h, br * r.w, br * 1.4 * r.h, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    // 화면 베젤
    ctx.strokeStyle = "rgba(120,146,190,.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 12);
    ctx.stroke();

    // ---- 돋보기 — 화소 확대 ----
    const key = sceneKeyAt(loupe.x, loupe.y);
    const c = PX_COLORS[key];
    probe(key);
    const lx = loupe.x;
    const ly = loupe.y;
    const lr = loupe.r;
    // 렌즈 원판
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, TAU);
    ctx.clip();
    ctx.fillStyle = "#05080F";
    ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
    // 서브픽셀 스트라이프(3열 × 3행 화소)
    const cellW = (lr * 2) / 3.2;
    const cellH = (lr * 2) / 3.2;
    for (let cy = -2; cy <= 1; cy++) {
      for (let cxi = -2; cxi <= 1; cxi++) {
        const ox = lx + cxi * cellW + cellW * 0.1 + ((cy % 2) * cellW) / 2;
        const oy = ly + cy * cellH + cellH * 0.12;
        const subW = cellW * 0.24;
        const cols = ["255,42,32", "40,224,64", "56,96,255"];
        for (let k = 0; k < 3; k++) {
          const on = c.on[k];
          ctx.fillStyle = on ? `rgba(${cols[k]},.95)` : `rgba(${cols[k]},.12)`;
          ctx.beginPath();
          ctx.roundRect(ox + k * (subW + cellW * 0.06), oy, subW, cellH * 0.76, 3);
          ctx.fill();
          if (on) {
            ctx.globalCompositeOperation = "lighter";
            const g = ctx.createRadialGradient(
              ox + k * (subW + cellW * 0.06) + subW / 2, oy + cellH * 0.38, 1,
              ox + k * (subW + cellW * 0.06) + subW / 2, oy + cellH * 0.38, subW * 1.4,
            );
            g.addColorStop(0, `rgba(${cols[k]},.5)`);
            g.addColorStop(1, `rgba(${cols[k]},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(ox - 8 + k * (subW + cellW * 0.06), oy - 8, subW + 16, cellH + 16);
            ctx.globalCompositeOperation = "source-over";
          }
        }
      }
    }
    ctx.restore();
    // 렌즈 테 + 자루
    ctx.strokeStyle = "rgba(226,238,255,.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "rgba(120,146,190,.5)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(lx, ly, lr + 4, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#5A6C86";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    const ha = 2.4; // 자루 각도
    ctx.beginPath();
    ctx.moveTo(lx + Math.cos(ha) * (lr + 4), ly + Math.sin(ha) * (lr + 4));
    ctx.lineTo(lx + Math.cos(ha) * (lr + 26), ly + Math.sin(ha) * (lr + 26));
    ctx.stroke();

    // ---- 하단 채널 리드아웃 ----
    const ry = H - 66;
    ctx.font = "800 11.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(174,196,228,.9)";
    ctx.fillText(`지금 보는 곳: ${c.name}`, 16, ry + 4);
    const names = ["빨강", "초록", "파랑"];
    const cols = ["255,64,52", "48,224,84", "72,110,255"];
    for (let k = 0; k < 3; k++) {
      const bx = 16 + k * 92;
      const on = c.on[k];
      ctx.fillStyle = on ? `rgba(${cols[k]},.95)` : "rgba(120,140,170,.2)";
      ctx.beginPath();
      ctx.roundRect(bx, ry + 12, 20, 20, 5);
      ctx.fill();
      if (on) {
        ctx.strokeStyle = "rgba(255,255,255,.7)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(bx, ry + 12, 20, 20, 5);
        ctx.stroke();
      }
      ctx.fillStyle = on ? "#EAF1FA" : "rgba(140,160,190,.6)";
      ctx.font = "700 11px Pretendard, sans-serif";
      ctx.fillText(`${names[k]} ${on ? "켜짐" : "꺼짐"}`, bx + 26, ry + 27);
    }
    void tMs;
  });

  api.setCTA("돋보기로 확대해 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
