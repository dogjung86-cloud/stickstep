// waveTank — 파동의 발생과 전달 랩(중2 III L7, 책 120~121쪽).
//   물결 수조 단면. 왼쪽 진동 막대를 "직접 위아래로 드래그"하면 그 움직임이
//   이력 버퍼를 타고 오른쪽으로 전파된다(진짜 파동 — 임의 입력도 그대로 퍼짐).
//   탁구공은 파동이 지나가도 제자리에서 위아래로만 진동(가로 이동 0 — HUD로 증명).
//   자동 진동 모드: 진폭·진동수 슬라이더 → 마루·골·파장·진폭 이름표, 주기 readout.
//   목표: ① 손으로 물결 만들기 ② 탁구공 제자리 확인 ③ 이름표 켜기 ④ 진동수 실험.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { TAU, capturePointer } from "../../ui/lightKit";
import { curioCard, type Curio } from "../../ui/curio";
import { labExplain } from "../../ui/labExplain";
import { waveExplainFig } from "../../ui/lightFigures";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const RATE = 90; // 이력 샘플/초
const SPEED0 = 150; // 파동 전파 속도 기본값(px/s) — 슬라이더로 60~260 조절

export const waveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:320px" });
  const moveVal = el("b", { text: "0", style: "font-variant-numeric:tabular-nums" });
  const freqPill = el("div", { class: "pill", style: "display:none" }, el("span", { class: "pdot", style: "background:#B49CFF" }), el("span", { text: "" }));
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#7ED6FF" }), el("span", { text: "탁구공 가로 이동 " }), moveVal, el("span", { text: " px" })),
      freqPill,
    ),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "make" } }, el("b", { text: "물결 만들기" }), el("span", { text: "막대 드래그" })),
    el("div", { class: "pn-badge", dataset: { g: "ball" } }, el("b", { text: "탁구공" }), el("span", { text: "따라갈까?" })),
    el("div", { class: "pn-badge", dataset: { g: "label" } }, el("b", { text: "이름표" }), el("span", { text: "마루·골·파장" })),
    el("div", { class: "pn-badge", dataset: { g: "freq" } }, el("b", { text: "진동수" }), el("span", { text: "바꿔 보기" })),
  );

  const autoBtn = el("button", { class: "swapbtn", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: "자동 진동 켜기" }));
  const labelBtn = el("button", { class: "swapbtn", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: "마루·골·파장·진폭 이름표 보기" }));
  const btnRow = el("div", { class: "gp-controls" }, autoBtn, labelBtn);

  // 자동 모드 슬라이더(진폭·진동수) + 항상 보이는 전파 속도 슬라이더 — px-sl 문법 재사용
  const sliders = el("div", { class: "px-sliders" });
  const speedSliders = el("div", { class: "px-sliders show" });
  let amp = 15; // px
  let freq = 1.0; // Hz
  let speed = SPEED0; // px/s
  let speedHinted = false;
  const mkSlider = (
    box: HTMLElement,
    name: string,
    grad: string,
    get: () => number,
    set: (t: number) => void,
    fmt: () => string,
  ): void => {
    const fill = el("i", { class: "px-fill", style: `background:${grad}` });
    const knob = el("i", { class: "px-knob" });
    const track = el("div", { class: "px-track" }, fill, knob);
    const val = el("b", { class: "px-val", text: fmt() });
    const row = el(
      "div",
      { class: "px-sl", attrs: { role: "slider", tabindex: "0", "aria-label": name } },
      el("b", { text: name }),
      track,
      val,
    );
    const sync = (): void => {
      const t = get();
      fill.style.width = `${Math.round(t * 100)}%`;
      knob.style.left = `${Math.round(t * 100)}%`;
      val.textContent = fmt();
      row.setAttribute("aria-valuenow", val.textContent);
    };
    let drag = false;
    const setFrom = (cx: number): void => {
      const tr = track.getBoundingClientRect();
      set(clamp((cx - tr.left) / tr.width, 0, 1));
      sync();
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
      if (e.key === "ArrowRight" || e.key === "ArrowUp") set(clamp(get() + 0.08, 0, 1));
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") set(clamp(get() - 0.08, 0, 1));
      else return;
      e.preventDefault();
      sync();
    });
    box.appendChild(row);
    sync();
  };
  mkSlider(
    sliders,
    "진폭",
    "linear-gradient(90deg,#1D4E64,#37B6D8)",
    () => (amp - 6) / 20,
    (t) => (amp = 6 + t * 20),
    () => `${Math.round(amp)}px`,
  );
  mkSlider(
    sliders,
    "진동수",
    "linear-gradient(90deg,#3A2A6E,#8A6BFF)",
    () => (freq - 0.6) / 1.2,
    (t) => {
      freq = 0.6 + t * 1.2;
      usedFreqs.add(Math.round(freq * 5) / 5);
      if (auto && usedFreqs.size >= 3) collect("freq", "파장이 변해요!");
    },
    () => `${freq.toFixed(1)}Hz`,
  );
  mkSlider(
    speedSliders,
    "전파 속도",
    "linear-gradient(90deg,#1E5A48,#0B9E96)",
    () => (speed - 60) / 200,
    (t) => {
      speed = 60 + t * 200;
      if (!speedHinted && showLabels && Math.abs(speed - SPEED0) > 40) {
        speedHinted = true;
        helper.innerHTML =
          "속도를 바꾸면 <b>마루 사이 간격(파장)</b>도 변해요 — 같은 빠르기로 흔들어도 파동이 빨리 도망가면 간격이 넓어지죠!";
      }
    },
    () => `${(speed / SPEED0).toFixed(1)}배`,
  );

  const helper = el("div", {
    class: "helper",
    html: "왼쪽 <b>진동 막대 손잡이를 잡고 위아래로</b> 흔들어 보세요 — 여러분의 손짓이 그대로 물결이 되어 퍼져 나가요!",
  });
  host.append(goalChips, helper, stage, btnRow, sliders, speedSliders); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  // 실험은 빠르게 지나가니 — 정지 그림으로 4요소를 붙잡아 두는 설명 카드
  host.appendChild(
    labExplain({
      kicker: "천천히 보는 파동 지도",
      tone: "#8A6BFF",
      lead: "움직이는 물결에서 놓쳤다면 여기서 확인 — <b>파동의 네 요소</b>예요.",
      fig: waveExplainFig(),
      rows: [
        { dot: "#E8961E", name: "마루", desc: "파동에서 <b>가장 높은 곳</b>이에요." },
        { dot: "#3A6CD8", name: "골", desc: "파동에서 <b>가장 낮은 곳</b>이에요." },
        { dot: "#7C5CD6", name: "파장", desc: "<b>마루에서 이웃한 마루까지</b>의 거리예요. 골에서 이웃한 골까지 재도 같아요." },
        { dot: "#0B9E96", name: "진폭", desc: "<b>진동 중심에서 마루(골)까지</b>의 거리예요. 마루~골 거리는 진폭의 <b>2배</b>인 것에 주의!" },
      ],
    }),
  );
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let H = 320;
  const Y0 = (): number => H * 0.46;
  const padX = (): number => 46;
  const duckX = (): number => W * 0.64;
  const buf = new Float32Array(RATE * 6); // 6초 이력(최저 속도에서도 화면 폭을 덮는다)
  let head = 0;
  let simMs = 0;
  let manual = 0; // 손 드래그 변위(px, 아래+)
  let manualHold = false;
  let auto = false;
  let energy = 0;
  let duckMoved = 0;
  const trail: number[] = [];
  const usedFreqs = new Set<number>();
  const goals = new Set<string>();
  let showLabels = false;
  let finished = false;

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (id === "make")
      helper.innerHTML = "물결이 퍼져 나가죠? 이제 <b>탁구공</b>을 지켜보세요 — 물결을 따라 오른쪽으로 밀려갈까요?";
    if (id === "ball")
      helper.innerHTML =
        "탁구공은 <b>제자리에서 위아래로 진동만</b> 해요(가로 이동 0!). 물(매질)은 이동하지 않고 <b>진동만 전달</b>하죠. 이제 <b>자동 진동</b>을 켜고 이름표도 봐요!";
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 한곳의 진동이 퍼져 나가는 것이 <b>파동</b>, 파동을 전달하는 물질이 <b>매질</b> — 매질은 제자리에서 진동할 뿐이에요. 가장 높은 곳 <b>마루</b>, 낮은 곳 <b>골</b>, 마루~이웃 마루 <b>파장</b>, 중심~마루 <b>진폭</b>!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  autoBtn.addEventListener("click", () => {
    auto = !auto;
    autoBtn.classList.toggle("done-static", false);
    (autoBtn.querySelector("span") as HTMLElement).textContent = auto ? "자동 진동 끄기" : "자동 진동 켜기";
    autoBtn.setAttribute("aria-pressed", String(auto));
    sliders.classList.toggle("show", auto);
    freqPill.style.display = auto ? "" : "none";
    haptic(HAPTIC.select);
    if (auto) usedFreqs.add(Math.round(freq * 5) / 5);
  });
  labelBtn.addEventListener("click", () => {
    showLabels = !showLabels;
    (labelBtn.querySelector("span") as HTMLElement).textContent = showLabels ? "이름표 끄기" : "마루·골·파장·진폭 이름표 보기";
    labelBtn.setAttribute("aria-pressed", String(showLabels));
    haptic(HAPTIC.select);
    if (showLabels) collect("label", "네 가지 요소!");
  });

  // ---- 막대 드래그 ----
  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    if (px < padX() + 52) {
      manualHold = true;
      capturePointer(canvas, e);
      const py = e.clientY - r.top;
      manual = clamp(py - Y0(), -34, 34);
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!manualHold) return;
    const r = canvas.getBoundingClientRect();
    manual = clamp(e.clientY - r.top - Y0(), -34, 34);
  });
  const endDrag = (): void => {
    manualHold = false;
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  // 이력 조회 — x 지점의 표면 변위(전파 속도 슬라이더 반영)
  function dispAt(x: number): number {
    const delay = Math.max(0, (x - padX()) / speed); // 초
    const idx = Math.round(delay * RATE);
    if (idx >= buf.length - 1) return 0;
    const v = buf[(head - 1 - idx + buf.length * 4) % buf.length];
    return v * Math.exp(-(x - padX()) / 1400); // 미세 감쇠
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 320);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const y0 = Y0();
    const xp = padX();
    const xd = duckX();

    // 소스 진행(고정 샘플레이트로 이력 기록)
    const stepMs = 1000 / RATE;
    simMs += dt * 16.7;
    while (simMs >= stepMs) {
      simMs -= stepMs;
      let src = 0;
      if (manualHold) src = manual;
      else if (auto) src = Math.sin((tMs / 1000) * TAU * freq) * amp;
      else {
        manual *= 0.86; // 놓으면 스르륵 복원
        src = manual;
      }
      buf[head % buf.length] = src;
      head++;
      energy += Math.abs(src) * 0.01;
    }

    // ---- 물 ----
    // 표면 경로
    const surf: number[] = [];
    for (let x = xp; x <= W - 12; x += 3) surf.push(dispAt(x));
    const yAt = (x: number): number => y0 + (surf[Math.round((x - xp) / 3)] ?? 0);

    const wg = ctx.createLinearGradient(0, y0 - 30, 0, H);
    wg.addColorStop(0, "rgba(86,158,238,.34)");
    wg.addColorStop(0.5, "rgba(64,120,204,.2)");
    wg.addColorStop(1, "rgba(44,86,160,.12)");
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.moveTo(xp, yAt(xp));
    for (let x = xp + 3; x <= W - 12; x += 3) ctx.lineTo(x, yAt(x));
    ctx.lineTo(W - 12, H - 14);
    ctx.lineTo(xp - 26, H - 14);
    ctx.closePath();
    ctx.fill();
    // 수면 발광선
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(150,214,255,.25)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(xp, yAt(xp));
    for (let x = xp + 3; x <= W - 12; x += 3) ctx.lineTo(x, yAt(x));
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = "rgba(214,238,255,.9)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(xp, yAt(xp));
    for (let x = xp + 3; x <= W - 12; x += 3) ctx.lineTo(x, yAt(x));
    ctx.stroke();

    // 수조 벽
    ctx.strokeStyle = "rgba(160,190,230,.5)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xp - 26, y0 - 64);
    ctx.lineTo(xp - 26, H - 14);
    ctx.lineTo(W - 12, H - 14);
    ctx.lineTo(W - 12, y0 - 64);
    ctx.stroke();

    // 진동 중심(기준선)
    ctx.strokeStyle = "rgba(196,214,240,.28)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(xp, y0);
    ctx.lineTo(W - 14, y0);
    ctx.stroke();
    ctx.setLineDash([]);

    // ---- 진동 막대(손잡이) ----
    const rodY = y0 + (manualHold ? manual : auto ? Math.sin((tMs / 1000) * TAU * freq) * amp : manual);
    const rodG = ctx.createLinearGradient(xp - 16, 0, xp + 8, 0);
    rodG.addColorStop(0, "#8FA4C2");
    rodG.addColorStop(0.5, "#5C7295");
    rodG.addColorStop(1, "#3A4A66");
    ctx.fillStyle = rodG;
    ctx.beginPath();
    ctx.roundRect(xp - 13, rodY - 7, 42, 12, 6);
    ctx.fill();
    ctx.strokeStyle = "#1D2A40";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(xp - 13, rodY - 7, 42, 12, 6);
    ctx.stroke();
    // 지지대 + 손잡이 노브
    ctx.strokeStyle = "rgba(160,190,230,.45)";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(xp, rodY - 7);
    ctx.lineTo(xp, y0 - 78);
    ctx.stroke();
    const knobPulse = manualHold ? 1.1 : 1 + Math.sin(tMs / 320) * 0.06;
    const kg = ctx.createRadialGradient(xp - 3, y0 - 86, 2, xp, y0 - 82, 13 * knobPulse);
    kg.addColorStop(0, "#FFE2A8");
    kg.addColorStop(1, "#E8961E");
    ctx.fillStyle = kg;
    ctx.beginPath();
    ctx.arc(xp, y0 - 82, 12 * knobPulse, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#8A5F1E";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(xp, y0 - 82, 12 * knobPulse, 0, TAU);
    ctx.stroke();
    // 위아래 힌트 화살표
    if (!goals.has("make")) {
      ctx.fillStyle = "rgba(255,214,138,.8)";
      const bob = Math.sin(tMs / 300) * 4;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(xp + 26, y0 - 82 + dir * (18 + bob));
        ctx.lineTo(xp + 21, y0 - 82 + dir * (10 + bob));
        ctx.lineTo(xp + 31, y0 - 82 + dir * (10 + bob));
        ctx.closePath();
        ctx.fill();
      }
    }

    // ---- 탁구공(매질 위 관찰자) ----
    const dy = dispAt(xd);
    const duckY = y0 + dy - 8;
    trail.push(duckY);
    if (trail.length > 64) trail.shift();
    // 제자리 세로 가이드
    ctx.strokeStyle = "rgba(126,214,255,.3)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(xd, y0 - 58);
    ctx.lineTo(xd, y0 + 46);
    ctx.stroke();
    ctx.setLineDash([]);
    // 잔상(전부 같은 x — 가로 이동 없음의 증거)
    trail.forEach((ty, i) => {
      const a = (i / trail.length) * 0.3;
      ctx.fillStyle = `rgba(126,214,255,${a})`;
      ctx.beginPath();
      ctx.arc(xd, ty, 2.2, 0, TAU);
      ctx.fill();
    });
    // 공
    const bg = ctx.createRadialGradient(xd - 3.4, duckY - 3.6, 1.5, xd, duckY, 10.5);
    bg.addColorStop(0, "#FFFFFF");
    bg.addColorStop(0.6, "#E8EFF8");
    bg.addColorStop(1, "#AFC2D8");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(xd, duckY, 10, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#5A6E8C";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(xd, duckY, 10, 0, TAU);
    ctx.stroke();
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(174,196,228,.85)";
    ctx.fillText("탁구공", xd, y0 + 60);

    if (Math.abs(dy) > 7) duckMoved += dt;
    if (duckMoved > 40 && goals.has("make")) collect("ball", "제자리 진동!");

    // ---- 이름표(마루·골·파장·진폭) ----
    if (showLabels) {
      // 마루(전역 최소 disp)·골(전역 최대) + 이웃 마루 파장
      let minV = 3;
      let minX = -1;
      let maxV = -3;
      let maxX = -1;
      const crests: number[] = [];
      for (let i = 2; i < surf.length - 2; i++) {
        const x = xp + i * 3;
        const v = surf[i];
        if (v < minV) {
          minV = v;
          minX = x;
        }
        if (v > maxV) {
          maxV = v;
          maxX = x;
        }
        if (v < -4 && v <= surf[i - 2] && v <= surf[i + 2]) {
          if (!crests.length || x - crests[crests.length - 1] > 30) crests.push(x);
        }
      }
      const tag = (x: number, y: number, txt: string, rgb: string): void => {
        ctx.font = "800 11px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 3.2;
        ctx.strokeStyle = "rgba(7,14,26,.9)";
        ctx.strokeText(txt, x, y);
        ctx.fillStyle = `rgba(${rgb},1)`;
        ctx.fillText(txt, x, y);
      };
      if (minX > 0) {
        ctx.fillStyle = "rgba(255,214,120,.95)";
        ctx.beginPath();
        ctx.arc(minX, y0 + minV, 3, 0, TAU);
        ctx.fill();
        tag(minX, y0 + minV - 12, "마루", "255,214,120");
        // 진폭 괄호(중심선→마루)
        ctx.strokeStyle = "rgba(126,214,255,.85)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(minX + 14, y0);
        ctx.lineTo(minX + 14, y0 + minV);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(minX + 10, y0);
        ctx.lineTo(minX + 18, y0);
        ctx.moveTo(minX + 10, y0 + minV);
        ctx.lineTo(minX + 18, y0 + minV);
        ctx.stroke();
        tag(minX + 34, y0 + minV / 2 + 4, "진폭", "126,214,255");
      }
      if (maxX > 0) {
        ctx.fillStyle = "rgba(150,196,255,.95)";
        ctx.beginPath();
        ctx.arc(maxX, y0 + maxV, 3, 0, TAU);
        ctx.fill();
        tag(maxX, y0 + maxV + 20, "골", "150,196,255");
      }
      if (crests.length >= 2) {
        const [c1, c2] = [crests[0], crests[1]];
        const yb = y0 - 44;
        ctx.strokeStyle = "rgba(226,196,255,.85)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(c1, yb);
        ctx.lineTo(c2, yb);
        ctx.moveTo(c1, yb - 5);
        ctx.lineTo(c1, yb + 5);
        ctx.moveTo(c2, yb - 5);
        ctx.lineTo(c2, yb + 5);
        ctx.stroke();
        ctx.setLineDash([2, 4]);
        ctx.strokeStyle = "rgba(226,196,255,.4)";
        ctx.beginPath();
        ctx.moveTo(c1, yb);
        ctx.lineTo(c1, yAt(c1));
        ctx.moveTo(c2, yb);
        ctx.lineTo(c2, yAt(c2));
        ctx.stroke();
        ctx.setLineDash([]);
        tag((c1 + c2) / 2, yb - 9, "파장", "226,196,255");
      }
    }

    // HUD
    moveVal.textContent = "0";
    if (auto) (freqPill.querySelectorAll("span")[1] as HTMLElement).textContent = `진동수 ${freq.toFixed(1)}Hz · 주기 ${(1 / freq).toFixed(1)}s`;
    if (energy > 26 && !goals.has("make")) collect("make", "퍼져 나가요!");
  });

  api.setCTA("막대를 흔들어 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
