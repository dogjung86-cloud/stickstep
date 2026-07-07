// soundLab — 소리의 특성 랩(중2 III L8, 책 122~127쪽).
//   Web Audio 신시사이저: 진폭(세기)·진동수(높낮이) 슬라이더 + 파형(음색) 전환.
//   오실로스코프 캔버스가 지금 나는 소리의 파형을 그대로 그린다(고정 10ms 창 —
//   진동수를 올리면 골·마루가 촘촘해지는 게 눈에 보인다).
//   소리는 사용자 제스처("소리 켜기")로 시작(모바일 오토플레이 정책), 게인은 안전 캡.
//   소리를 못 켜는 기기에서도 시각화·목표는 그대로 동작한다.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { capturePointer } from "../../ui/lightKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Wave = "sine" | "triangle" | "sawtooth";
const WAVE_NAME: Record<Wave, string> = { sine: "소리굽쇠", triangle: "리코더풍", sawtooth: "바이올린풍" };
const WINDOW_MS = 10; // 오실로스코프 시간 창

export const soundLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "lt-canvas", style: "height:250px" });
  const hzVal = el("b", { text: "440 Hz", style: "font-variant-numeric:tabular-nums" });
  const ampVal = el("b", { text: "60%", style: "font-variant-numeric:tabular-nums" });
  const waveBtns: Record<Wave, HTMLButtonElement> = {} as Record<Wave, HTMLButtonElement>;
  const seg = el("div", { class: "seg stage-seg", style: "margin-top:0" });
  (Object.keys(WAVE_NAME) as Wave[]).forEach((wv) => {
    const b = el("button", { text: WAVE_NAME[wv], attrs: { type: "button", "aria-pressed": String(wv === "sine") } });
    if (wv === "sine") b.classList.add("on");
    b.addEventListener("click", () => setWave(wv));
    waveBtns[wv] = b;
    seg.appendChild(b);
  });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#B49CFF" }), hzVal, el("span", { text: " · " }), ampVal),
      seg,
    ),
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "on" } }, el("b", { text: "소리 켜기" }), el("span", { text: "떨림 시작" })),
    el("div", { class: "pn-badge", dataset: { g: "amp" } }, el("b", { text: "세기" }), el("span", { text: "크게·작게" })),
    el("div", { class: "pn-badge", dataset: { g: "freq" } }, el("b", { text: "높낮이" }), el("span", { text: "높게·낮게" })),
    el("div", { class: "pn-badge", dataset: { g: "tone" } }, el("b", { text: "음색" }), el("span", { text: "악기 바꾸기" })),
  );

  const soundBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: "소리 켜기" }));

  // 슬라이더 2개(px-sl 문법)
  const sliders = el("div", { class: "px-sliders show" });
  let amp = 0.6; // 0.05~1
  let freq = 440; // Hz
  const mkSlider = (
    name: string,
    grad: string,
    get: () => number,
    set: (t: number) => void,
    fmt: () => string,
  ): (() => void) => {
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
      if (e.key === "ArrowRight" || e.key === "ArrowUp") set(clamp(get() + 0.07, 0, 1));
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") set(clamp(get() - 0.07, 0, 1));
      else return;
      e.preventDefault();
      sync();
    });
    sliders.appendChild(row);
    sync();
    return sync;
  };
  mkSlider(
    "세기",
    "linear-gradient(90deg,#1D4E64,#37B6D8)",
    () => (amp - 0.05) / 0.95,
    (t) => {
      amp = 0.05 + t * 0.95;
      if (amp > 0.85) ampHi = true;
      if (amp < 0.18) ampLo = true;
      if (ampHi && ampLo) collect("amp", "진폭이 세기!");
      pushAudio();
    },
    () => `${Math.round(amp * 100)}%`,
  );
  mkSlider(
    "높낮이",
    "linear-gradient(90deg,#3A2A6E,#8A6BFF)",
    () => Math.log(freq / 150) / Math.log(6),
    (t) => {
      freq = Math.round(150 * Math.pow(6, t));
      if (freq > 700) freqHi = true;
      if (freq < 220) freqLo = true;
      if (freqHi && freqLo) collect("freq", "진동수가 높낮이!");
      pushAudio();
    },
    () => `${freq} Hz`,
  );

  const helper = el("div", {
    class: "helper",
    html: "먼저 <b>소리 켜기</b>! 그다음 슬라이더를 움직이면 <b>귀로 들리는 것</b>과 <b>화면의 파형</b>이 동시에 변해요.",
  });
  host.append(goalChips, stage, soundBtn, sliders, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let wave: Wave = "sine";
  let soundOn = false;
  let audioFail = false;
  let ampHi = false;
  let ampLo = false;
  let freqHi = false;
  let freqLo = false;
  const wavesTried = new Set<Wave>(["sine"]);
  const goals = new Set<string>();
  let finished = false;

  // ---- Web Audio ----
  let actx: AudioContext | null = null;
  let osc: OscillatorNode | null = null;
  let gain: GainNode | null = null;

  function pushAudio(): void {
    if (!actx || !osc || !gain) return;
    const t = actx.currentTime;
    osc.frequency.setTargetAtTime(freq, t, 0.02);
    gain.gain.setTargetAtTime(soundOn ? amp * 0.2 : 0, t, 0.03);
  }

  function setWave(wv: Wave): void {
    wave = wv;
    (Object.keys(waveBtns) as Wave[]).forEach((k) => {
      waveBtns[k].classList.toggle("on", k === wv);
      waveBtns[k].setAttribute("aria-pressed", String(k === wv));
    });
    if (osc) osc.type = wv;
    haptic(HAPTIC.select);
    wavesTried.add(wv);
    if (wavesTried.size === 3) collect("tone", "파형이 음색!");
    helper.innerHTML =
      wv === "sine"
        ? "매끈한 <b>사인 파형</b> — 소리굽쇠처럼 순수한 소리예요."
        : wv === "triangle"
          ? "각진 <b>삼각 파형</b> — 같은 높이·세기여도 소리의 <b>느낌</b>이 다르죠? 이게 음색이에요."
          : "톱니 파형 — 현악기처럼 <b>쏘는 느낌</b>! 진폭·진동수가 같아도 <b>파형이 다르면 다른 소리</b>예요.";
  }

  soundBtn.addEventListener("click", () => {
    if (!soundOn) {
      if (!actx && !audioFail) {
        try {
          const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          actx = new AC();
          osc = actx.createOscillator();
          gain = actx.createGain();
          gain.gain.value = 0;
          osc.type = wave;
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(actx.destination);
          osc.start();
        } catch {
          audioFail = true;
          actx = null;
        }
      }
      void actx?.resume();
      soundOn = true;
      (soundBtn.querySelector("span") as HTMLElement).textContent = audioFail ? "무음 모드(기기 미지원)" : "소리 끄기";
      soundBtn.classList.remove("pulse");
      soundBtn.setAttribute("aria-pressed", "true");
      collect("on", audioFail ? "무음 모드로!" : "떨림 시작!");
      if (!goals.has("amp"))
        helper.innerHTML = audioFail
          ? "이 기기에선 소리를 켤 수 없지만 <b>파형으로</b> 전부 볼 수 있어요. <b>세기</b> 슬라이더를 크게·작게 움직여 보세요!"
          : "들리나요? 이제 <b>세기</b> 슬라이더를 끝까지 크게, 또 아주 작게 — 파형의 <b>키(진폭)</b>를 지켜보세요!";
    } else {
      soundOn = false;
      (soundBtn.querySelector("span") as HTMLElement).textContent = "소리 켜기";
      soundBtn.setAttribute("aria-pressed", "false");
    }
    pushAudio();
    haptic(HAPTIC.select);
  });

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (id === "amp" && !goals.has("freq"))
      helper.innerHTML = "확인! 큰 소리 = <b>큰 진폭</b>. 이제 <b>높낮이</b> 슬라이더를 높게·낮게 움직여 보세요 — 파형이 <b>촘촘해지는지</b>!";
    if (id === "freq" && !goals.has("tone"))
      helper.innerHTML = "확인! 높은 소리 = <b>큰 진동수</b>(촘촘한 파형). 마지막 — 위의 <b>악기(파형)</b>를 바꿔 보세요!";
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리 — <b>소리의 3요소</b>! 세기는 <b>진폭</b>, 높낮이는 <b>진동수</b>, 음색은 <b>파형</b>이 정해요. 같은 '라' 음이라도 악기마다 다르게 들리는 이유, 이제 파형으로 설명할 수 있죠?";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 파형 함수(시각화용 합성) ----
  function waveFn(p: number): number {
    const ph = p % 1;
    if (wave === "sine") return Math.sin(ph * Math.PI * 2);
    if (wave === "triangle") return 4 * Math.abs(ph - 0.5) - 1;
    return 2 * ph - 1; // sawtooth
  }

  // ---- 오실로스코프 ----
  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, 250);
    const ctx = fit.ctx;
    const W = fit.w;
    const H = fit.h;
    const midY = H / 2 + 14;
    const A = amp * (H * 0.3);

    // 그리드
    ctx.strokeStyle = "rgba(120,150,196,.12)";
    ctx.lineWidth = 1;
    for (let x = 20; x < W - 10; x += 34) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, H - 16);
      ctx.stroke();
    }
    for (let y = midY - 68; y <= midY + 68; y += 34) {
      ctx.beginPath();
      ctx.moveTo(14, y);
      ctx.lineTo(W - 10, y);
      ctx.stroke();
    }
    // 시간 축(중심선)
    ctx.strokeStyle = "rgba(196,214,240,.3)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(14, midY);
    ctx.lineTo(W - 10, midY);
    ctx.stroke();
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(150,176,210,.6)";
    ctx.fillText(`가로 한 화면 = ${WINDOW_MS}ms`, W - 14, 34);

    // 파형(발광 3층)
    const cycles = (freq * WINDOW_MS) / 1000;
    const scroll = (tMs / 1000) * freq * 0.25; // 살아 있는 흐름
    const path = (): void => {
      ctx.beginPath();
      for (let x = 14; x <= W - 10; x += 2) {
        const p = ((x - 14) / (W - 24)) * cycles + scroll;
        const y = midY - waveFn(p) * A * (soundOn ? 1 : 0.55);
        if (x === 14) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(150,120,255,.14)";
    ctx.lineWidth = 9;
    path();
    ctx.strokeStyle = "rgba(170,140,255,.3)";
    ctx.lineWidth = 4;
    path();
    ctx.restore();
    ctx.strokeStyle = soundOn ? "#CBB8FF" : "rgba(203,184,255,.6)";
    ctx.lineWidth = 2.2;
    path();

    // 스피커 콘(왼쪽 아래 미니) — 진폭 따라 떨림
    const sx = 34;
    const sy = H - 34;
    const throb = soundOn ? Math.sin(tMs / 1000 * freq * 0.4) * amp * 3 : 0;
    ctx.fillStyle = "#2E3C54";
    ctx.beginPath();
    ctx.roundRect(sx - 18, sy - 15, 14, 30, 3);
    ctx.fill();
    const cg = ctx.createRadialGradient(sx + throb - 2, sy - 3, 2, sx + throb, sy, 15);
    cg.addColorStop(0, "#AFC2DC");
    cg.addColorStop(1, "#5A6E8C");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(sx - 5, sy - 15);
    ctx.lineTo(sx + 9 + throb, sy - 9);
    ctx.lineTo(sx + 9 + throb, sy + 9);
    ctx.lineTo(sx - 5, sy + 15);
    ctx.closePath();
    ctx.fill();
    if (soundOn && !audioFail) {
      ctx.strokeStyle = "rgba(180,156,255,.6)";
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 2; i++) {
        const rr = 14 + i * 8 + ((tMs / 60) % 8);
        ctx.beginPath();
        ctx.arc(sx + 10, sy, rr, -0.8, 0.8);
        ctx.stroke();
      }
    }

    // HUD
    hzVal.textContent = `${freq} Hz`;
    ampVal.textContent = `세기 ${Math.round(amp * 100)}%`;
  });

  api.setCTA("소리를 만들어 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    try {
      osc?.stop();
    } catch {
      /* 이미 정지 */
    }
    osc?.disconnect();
    gain?.disconnect();
    void actx?.close();
  };
};
