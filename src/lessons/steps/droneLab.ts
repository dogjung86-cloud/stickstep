// droneLab, 그래프 탐정: 드론 비행(교과서 113쪽 함께 탐구 수치 그대로).
// 그래프 위를 문지르면(스크럽) 시간이 흐르고, 위 장면의 드론이 그 높이로 나는 연동 장치.
//   비행 기록: (0,0)→(4,3) 상승, (4,10) 3m 유지, (10,14) 3→11m 상승, (14,20) 11→0m 하강
//   미션 ① 가장 높이 난 순간 찾기(t=14) ② 높이가 변하지 않는 구간에 머물기 ③ 착륙 순간(t=20)
// 판정은 드롭(pointerup) 시점의 t로. setPointerCapture는 try/catch(사고 7). rAF 금지.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface DroneStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 비행 기록(교과서 수치). */
const hOf = (t: number): number => (t <= 4 ? 0.75 * t : t <= 10 ? 3 : t <= 14 ? 3 + 2 * (t - 10) : 11 - (11 / 6) * (t - 14));

/* 기하: 위 장면(0..88) + 아래 그래프(104..252), viewBox 360×260 */
const DX = 64; // 드론 x
const S_GND = 80; // 장면 지면
const S_TOP = 12; // h=12m 위치
const GX0 = 46;
const GX1 = 338;
const GY0 = 246;
const GY1 = 108;
const T_MAX = 20;
const H_MAX = 12;
const gx = (t: number): number => GX0 + (t / T_MAX) * (GX1 - GX0);
const gy = (h: number): number => GY0 - (h / H_MAX) * (GY0 - GY1);
const sy = (h: number): number => S_GND - (h / H_MAX) * (S_GND - S_TOP);

export const droneLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DroneStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "peak", label: "최고 높이", sub: "가장 높은 순간" },
    { id: "flat", label: "수평 구간", sub: "변화 없는 때" },
    { id: "land", label: "착륙 순간", sub: "높이 0으로" },
  ]);

  const board = mboard(460);
  const svgWrap = el("div", { class: "dr-stage" });

  // 그래프 눈금(2초·2m 간격)
  let grid = "";
  for (let t = 2; t <= T_MAX; t += 2) {
    grid += `<line x1="${gx(t)}" y1="${GY0}" x2="${gx(t)}" y2="${GY1}" stroke="#E2E9F2" stroke-width="1"/>`;
    grid += `<text x="${gx(t)}" y="${GY0 + 14}" text-anchor="middle" font-size="9" font-weight="700" fill="#8093A8">${t}</text>`;
  }
  for (let h = 2; h <= H_MAX; h += 2) {
    grid += `<line x1="${GX0}" y1="${gy(h)}" x2="${GX1}" y2="${gy(h)}" stroke="#E2E9F2" stroke-width="1"/>`;
    grid += `<text x="${GX0 - 5}" y="${gy(h) + 3}" text-anchor="end" font-size="9" font-weight="700" fill="#8093A8">${h}</text>`;
  }
  // 비행 곡선(구간 색 = 상승 시안 / 수평 앰버 / 상승 시안 / 하강 로즈)
  const segs = [
    { d: `M${gx(0)} ${gy(0)} L${gx(4)} ${gy(3)}`, c: "#0DA5C6" },
    { d: `M${gx(4)} ${gy(3)} L${gx(10)} ${gy(3)}`, c: "#F08C2E" },
    { d: `M${gx(10)} ${gy(3)} L${gx(14)} ${gy(11)}`, c: "#0DA5C6" },
    { d: `M${gx(14)} ${gy(11)} L${gx(20)} ${gy(0)}`, c: "#E8608A" },
  ];
  const segSvg = segs.map((sg) => `<path d="${sg.d}" stroke="${sg.c}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`).join("");

  svgWrap.innerHTML =
    `<svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    // ── 장면(하늘 + 지면 + 드론) ──
    `<rect x="14" y="4" width="332" height="84" rx="12" fill="url(#dr-sky)"/>` +
    `<line x1="20" y1="${S_GND}" x2="340" y2="${S_GND}" stroke="#7AA05E" stroke-width="3" stroke-linecap="round"/>` +
    `<ellipse cx="290" cy="20" rx="16" ry="6" fill="#FFFFFF" opacity=".7"/><ellipse cx="312" cy="26" rx="12" ry="5" fill="#FFFFFF" opacity=".55"/>` +
    `<line x1="30" y1="${sy(3)}" x2="340" y2="${sy(3)}" stroke="#F08C2E" stroke-width="1" stroke-dasharray="3 5" opacity=".55"/>` +
    `<text x="336" y="${sy(3) - 3}" text-anchor="end" font-size="8.5" font-weight="800" fill="#C87F3A">3 m</text>` +
    `<line x1="30" y1="${sy(11)}" x2="340" y2="${sy(11)}" stroke="#E8608A" stroke-width="1" stroke-dasharray="3 5" opacity=".5"/>` +
    `<text x="336" y="${sy(11) - 3}" text-anchor="end" font-size="8.5" font-weight="800" fill="#C74A72">11 m</text>` +
    `<g class="dr-bird" style="transition: transform .12s ease-out">` +
    `<rect x="${DX - 14}" y="-7" width="28" height="12" rx="6" fill="url(#dr-bd)" stroke="#243040" stroke-width="1.4"/>` +
    `<circle cx="${DX}" cy="0" r="3.2" fill="#7FE0EE" stroke="#0A7E8C" stroke-width="1"/>` +
    `<line x1="${DX - 14}" y1="-7" x2="${DX - 22}" y2="-13" stroke="#243040" stroke-width="2"/>` +
    `<line x1="${DX + 14}" y1="-7" x2="${DX + 22}" y2="-13" stroke="#243040" stroke-width="2"/>` +
    `<line class="dr-rt" x1="${DX - 30}" y1="-14" x2="${DX - 14}" y2="-14" stroke="#39424E" stroke-width="2.6" stroke-linecap="round"/>` +
    `<line class="dr-rt" x1="${DX + 14}" y1="-14" x2="${DX + 30}" y2="-14" stroke="#39424E" stroke-width="2.6" stroke-linecap="round"/>` +
    `</g>` +
    // ── 그래프 ──
    grid +
    `<path d="M${GX0} ${GY0} H${GX1 + 8} M${GX0} ${GY0} V${GY1 - 8}" stroke="#64748B" stroke-width="1.8" stroke-linecap="round"/>` +
    `<path d="M${GX1 + 8} ${GY0} l-7 -4 v8 z" fill="#64748B"/><path d="M${GX0} ${GY1 - 8} l-4 7 h8 z" fill="#64748B"/>` +
    `<text x="${GX1}" y="${GY0 - 6}" text-anchor="end" font-size="10" font-weight="800" fill="#64748B">시간(초)</text>` +
    `<text x="${GX0 + 6}" y="${GY1 - 12}" font-size="10" font-weight="800" fill="#64748B">높이(m)</text>` +
    segSvg +
    `<line class="dr-guide" x1="${gx(0)}" y1="${GY0}" x2="${gx(0)}" y2="${GY1}" stroke="#0DA5C6" stroke-width="1.4" stroke-dasharray="4 4" opacity=".8"/>` +
    `<circle class="dr-dot" cx="${gx(0)}" cy="${gy(0)}" r="6.5" fill="#FFFFFF" stroke="#0DA5C6" stroke-width="3"/>` +
    `<defs>` +
    `<linearGradient id="dr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE4FA"/><stop offset="1" stop-color="#E8F5FE"/></linearGradient>` +
    `<linearGradient id="dr-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F7FC"/><stop offset="1" stop-color="#C2D2E0"/></linearGradient>` +
    `</defs>` +
    `</svg>`;

  const readout = el("div", { class: "dr-read", html: "" });
  const mission = el("div", { class: "mql-mission", html: "그래프 위를 좌우로 문질러 <b>시간을 되감고 빨리감아</b> 보세요." });
  board.append(svgWrap, readout, mission);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "위 장면의 드론이 그래프를 따라 진짜로 날아요. 세 미션의 순간을 찾아 <b>손을 떼면</b> 판정돼요!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const bird = svg.querySelector(".dr-bird") as SVGGElement;
  const guide = svg.querySelector(".dr-guide") as SVGLineElement;
  const dot = svg.querySelector(".dr-dot") as SVGCircleElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let t = 0;
  let finished = false;

  function paint(): void {
    const h = hOf(t);
    const x = gx(t);
    guide.setAttribute("x1", String(x));
    guide.setAttribute("x2", String(x));
    dot.setAttribute("cx", String(x));
    dot.setAttribute("cy", String(gy(h)));
    // 하강 구간은 살짝 앞으로 기운다
    const tilt = t > 14 ? 9 : t > 10 ? -7 : t > 4 ? 0 : -5;
    bird.style.transform = `translate(0, ${sy(h)}px) rotate(${tilt}deg)`;
    readout.innerHTML = `<b>${t % 1 === 0 ? t : t.toFixed(1)}초</b> · 높이 <b>${h % 1 === 0 ? h : h.toFixed(1)} m</b>`;
  }

  function judge(): void {
    if (finished) return;
    if (Math.abs(t - 14) <= 0.3 && chips.on("peak", "14초, 11 m!")) {
      haptic(HAPTIC.correct);
      toast("14초, 11 m가 최고점이에요!");
      helper.innerHTML = "그래프의 <b>꼭대기</b>가 곧 가장 높은 순간! 이번엔 높이가 <b>변하지 않는 구간</b>에 손을 놓아 보세요.";
    } else if (t >= 4.3 && t <= 9.7 && chips.on("flat", "4~10초!")) {
      haptic(HAPTIC.correct);
      toast("4초부터 10초까지, 6초 동안 3 m 그대로!");
      helper.innerHTML = "<b>수평 구간 = 변화 없음</b>이에요. 드론은 3 m에서 6초 동안 맴돌았죠. 이제 <b>착륙 순간</b>(높이 0)으로 가 보세요.";
    } else if (t >= 19.6 && hOf(t) < 0.8 && chips.on("land", "20초, 0 m!")) {
      haptic(HAPTIC.done);
      toast("20초, 무사 착륙!");
    }
    if (chips.count() === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "탐정 완료! 이 비행은 네 문장이었어요. <b>① 4초 동안 3 m까지 상승 ② 6초 동안 3 m 유지 ③ 14초까지 11 m로 상승 ④ 6초 동안 하강, 착륙.</b> 그래프 한 장이 이야기 전체를 담아요.";
      later(() => {
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "다음");
      }, 600);
    }
  }

  function moveTo(clientX: number): void {
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * 360;
    const raw = ((sx - GX0) / (GX1 - GX0)) * T_MAX;
    t = Math.max(0, Math.min(T_MAX, Math.round(raw * 2) / 2)); // 0.5초 스냅
    paint();
  }

  let scrubbing = false;
  svg.addEventListener("pointerdown", (e) => {
    scrubbing = true;
    try {
      svg.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 안전(사고 7) */
    }
    moveTo(e.clientX);
  });
  svg.addEventListener("pointermove", (e) => {
    if (scrubbing) moveTo(e.clientX);
  });
  const drop = (): void => {
    if (!scrubbing) return;
    scrubbing = false;
    judge();
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paint();
  api.setCTA("세 순간을 모두 찾으면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
