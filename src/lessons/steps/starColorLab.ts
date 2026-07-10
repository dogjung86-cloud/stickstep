// starColorLab — 별빛 온도계(중2 VIII L4, 책 288~289쪽).
// 표면 온도 슬라이더(3,000~30,000 K 로그 스케일)를 밀면 별의 색이 흑체 복사 근사색으로
// 연속 변화(적 → 주황 → 황 → 황백 → 백 → 청백 → 청, 교과서 7단). 온도 구간에 들어가면
// 그 색의 실제 별 이름표가 붙는다(베텔게우스·태양·시리우스·리겔 …). "빨강 = 뜨겁다" 오개념을 뒤집는 랩.
// 목표: ① 붉은 별(≤3,900 K) ② 태양급 노란 별(5,200~6,000 K) ③ 청백 별(≥10,000 K).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { capturePointer } from "../../ui/lightKit";
import { curioCard } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: { q: string; a: string };
}

const CVH = 320;
const K_MIN = 3000;
const K_MAX = 30000;

// 켈빈 → RGB (Tanner Helland 흑체 근사 — 과학적 색 그 자체가 콘텐츠)
function kelvinRGB(k: number): [number, number, number] {
  const t = k / 100;
  let r: number;
  let g: number;
  let b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  }
  if (t >= 66) b = 255;
  else if (t <= 19) b = 0;
  else b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [Math.round(clamp(r, 0, 255)), Math.round(clamp(g, 0, 255)), Math.round(clamp(b, 0, 255))];
}

// 색 구간 — 교과서 그림 VIII-7의 7단(온도 오름차순). 최고온 단은 청백이 아니라 '청색'.
// 청색(O형) 경계는 약 30,000 K — 슬라이더 최대치가 딱 30,000 K라, 끝까지 밀면 도달하도록
// 29,000 K부터 청색으로 표기한다(태양 5,800 K·리겔 12,000 K 등 나머지 경계는 관례값).
const BANDS: { upTo: number; name: string; stars: string }[] = [
  { upTo: 3900, name: "적색", stars: "베텔게우스 · 안타레스" },
  { upTo: 5200, name: "주황색", stars: "알데바란 · 아크투루스" },
  { upTo: 6000, name: "황색", stars: "태양 · 카펠라" },
  { upTo: 7500, name: "황백색", stars: "프로키온 · 북극성" },
  { upTo: 10000, name: "백색", stars: "시리우스 · 베가" },
  { upTo: 29000, name: "청백색", stars: "리겔 · 스피카" },
  { upTo: 99000, name: "청색", stars: "나오스 · 민타카" },
];
const bandOf = (k: number): (typeof BANDS)[number] => BANDS.find((b) => k <= b.upTo)!;

export const starColorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge star", dataset: { g: "red" } }, el("b", { text: "붉은 별" }), el("span", { text: "3,900 K 아래로" })),
    el("div", { class: "pn-badge star", dataset: { g: "sun" } }, el("b", { text: "태양 만들기" }), el("span", { text: "약 5,800 K" })),
    el("div", { class: "pn-badge star", dataset: { g: "blue" } }, el("b", { text: "청백 별" }), el("span", { text: "10,000 K 위로" })),
  );

  const canvas = el("canvas", { class: "mstage-cvblock", style: `height:${CVH}px` });
  const tempPill = el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#FFB25C" }), el("span", { text: "" }));
  const starPill = el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#9CA8FF" }), el("span", { text: "" }));
  const toastEl = el("div", { class: "toast" });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, tempPill, starPill), toastEl);

  // 온도 슬라이더(로그 스케일)
  let v01 = 0.28; // 시작 ≈ 5,750 K(태양 근처는 아님 — 0.28 → 3000·10^0.28 ≈ 5,720 흠 태양이랑 겹침) → 0.5로 시작
  v01 = 0.5; // ≈ 9,500 K 백색에서 시작 — 양쪽으로 탐험 유도
  const kelvin = (): number => Math.round(K_MIN * Math.pow(10, v01 * Math.log10(K_MAX / K_MIN)));
  const fill = el("i", { class: "px-fill", style: "background:linear-gradient(90deg,#E8542F,#F5C04D,#FFF4E0,#BFD8FF,#7FB2FF)" });
  const knob = el("i", { class: "px-knob" });
  const track = el("div", { class: "px-track" }, fill, knob);
  const val = el("b", { class: "px-val", text: "" });
  const sliderRow = el(
    "div",
    { class: "px-sl", attrs: { role: "slider", tabindex: "0", "aria-label": "별의 표면 온도" } },
    el("b", { text: "온도" }),
    track,
    val,
  );
  const sliders = el("div", { class: "px-sliders show" }, sliderRow);

  const helper = el("div", {
    class: "helper",
    html: "대장간의 쇠는 달굴수록 <b>빨강 → 노랑 → 흰색</b>으로 변해요. 별도 똑같아요 — 색이 곧 <b>표면 온도의 온도계</b>! 온도를 밀며 확인해 보세요.",
  });
  host.append(goalChips, helper, stage, sliders); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let holdMs = 0;
  let lastZone = "";

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

  function collect(id: "red" | "sun" | "blue", subText: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! <b>파란 별이 가장 뜨겁고, 붉은 별이 가장 차가워요</b> — 불꽃 이미지와 반대죠? 참고로 '차가운' 붉은 별도 표면이 <b>약 3,000 ℃</b>나 돼요. 색 순서: 적 → 주황 → 황 → 황백 → 백 → 청백 → 청(온도 오름차순).";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  // ---- 슬라이더 ----
  const syncSlider = (): void => {
    fill.style.width = `${Math.round(v01 * 100)}%`;
    knob.style.left = `${Math.round(v01 * 100)}%`;
    val.textContent = `${kelvin().toLocaleString()} K`;
  };
  let drag = false;
  const setFrom = (cx: number): void => {
    const tr = track.getBoundingClientRect();
    v01 = clamp((cx - tr.left) / tr.width, 0, 1);
    syncSlider();
  };
  const onDown = (e: PointerEvent): void => {
    drag = true;
    capturePointer(sliderRow, e);
    setFrom(e.clientX);
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (drag) setFrom(e.clientX);
  };
  const onUp = (): void => {
    drag = false;
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowRight") v01 = clamp(v01 + 0.05, 0, 1);
    else if (e.key === "ArrowLeft") v01 = clamp(v01 - 0.05, 0, 1);
    else return;
    e.preventDefault();
    syncSlider();
  };
  sliderRow.addEventListener("pointerdown", onDown);
  sliderRow.addEventListener("pointermove", onMove);
  sliderRow.addEventListener("pointerup", onUp);
  sliderRow.addEventListener("pointercancel", onUp);
  sliderRow.addEventListener("keydown", onKey);
  syncSlider();

  // ---- 프레임 ----
  let shownPill = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    const W = fit.w;
    const cx = W / 2;
    const cy = CVH / 2 - 10;
    const K = kelvin();
    const [r, g, b] = kelvinRGB(K);

    // 배경 잔별
    for (let i = 0; i < 26; i++) {
      const bx = ((i * 977) % W) + Math.sin(tMs / 1400 + i) * 1.5;
      const by = (i * 613) % (CVH - 40);
      ctx.fillStyle = `rgba(214,226,246,${0.24 + 0.2 * Math.sin(tMs / 800 + i * 2)})`;
      ctx.beginPath();
      ctx.arc(bx, by, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // 별 — 코어 + 대기 글로우 + 십자 스파이크(전부 흑체색)
    const R = 56;
    const pulse = 1 + Math.sin(tMs / 520) * 0.012;
    const glow = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 2.6);
    glow.addColorStop(0, `rgba(${r},${g},${b},.55)`);
    glow.addColorStop(0.55, `rgba(${r},${g},${b},.16)`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 2.6, 0, Math.PI * 2);
    ctx.fill();
    const core = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.25, R * 0.1, cx, cy, R * pulse);
    core.addColorStop(0, "rgba(255,255,255,.96)");
    core.addColorStop(0.45, `rgb(${Math.min(255, r + 30)},${Math.min(255, g + 30)},${Math.min(255, b + 30)})`);
    core.addColorStop(1, `rgb(${Math.round(r * 0.82)},${Math.round(g * 0.82)},${Math.round(b * 0.82)})`);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(cx, cy, R * pulse, 0, Math.PI * 2);
    ctx.fill();
    // 스파이크
    ctx.strokeStyle = `rgba(${r},${g},${b},.5)`;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (const a of [0, Math.PI / 2]) {
      const len = R * 2.1 * pulse;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(a) * len, cy - Math.sin(a) * len);
      ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      ctx.stroke();
    }

    // 하단 색 온도계 바(스펙트럼 + 현재 마커)
    const bx0 = 26;
    const bx1 = W - 26;
    const by = CVH - 34;
    const grad = ctx.createLinearGradient(bx0, 0, bx1, 0);
    const stops = 24;
    for (let i = 0; i <= stops; i++) {
      const kk = K_MIN * Math.pow(10, (i / stops) * Math.log10(K_MAX / K_MIN));
      const [rr, gg, bb] = kelvinRGB(kk);
      grad.addColorStop(i / stops, `rgb(${rr},${gg},${bb})`);
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(bx0, by - 7, bx1 - bx0, 14, 7);
    ctx.fill();
    ctx.strokeStyle = "rgba(226,238,255,.35)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // 마커
    const mx = bx0 + v01 * (bx1 - bx0);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(mx, by - 13);
    ctx.lineTo(mx - 5, by - 21);
    ctx.lineTo(mx + 5, by - 21);
    ctx.closePath();
    ctx.fill();
    ctx.font = "600 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,170,140,.85)";
    ctx.fillText("차갑다(3천 K)", bx0, by + 20);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(150,196,255,.9)";
    ctx.fillText("뜨겁다(3만 K)", bx1, by + 20);

    // HUD
    const band = bandOf(K);
    const pillTxt = `${K.toLocaleString()} K — ${band.name}`;
    if (pillTxt !== shownPill) {
      shownPill = pillTxt;
      (tempPill.lastElementChild as HTMLElement).textContent = pillTxt;
      (tempPill.querySelector(".pdot") as HTMLElement).style.background = `rgb(${r},${g},${b})`;
      (starPill.lastElementChild as HTMLElement).textContent = band.stars;
    }

    // 목표 판정 — 구간에 400ms 머무르면 인정
    const zone = K <= 3900 ? "red" : K >= 5200 && K <= 6000 ? "sun" : K >= 10000 ? "blue" : "";
    if (zone && zone === lastZone) {
      holdMs += dt * 16.7;
      if (holdMs > 400) {
        if (zone === "red") collect("red", "베텔게우스급!", "붉은 별 — 가장 '차가운' 별이에요 (그래도 3,000 ℃!)");
        if (zone === "sun") collect("sun", "태양과 같아요!", "약 5,800 K 황색 — 우리 태양의 색!");
        if (zone === "blue") collect("blue", "리겔급!", "청백 별! 끝까지 밀면 청색 — 빨강보다 파랑이 뜨거워요");
      }
    } else holdMs = 0;
    lastZone = zone;
  });

  const onResize = (): void => {
    fitCanvas(canvas, CVH);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("세 별을 모두 만들어 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    sliderRow.removeEventListener("pointerdown", onDown);
    sliderRow.removeEventListener("pointermove", onMove);
    sliderRow.removeEventListener("pointerup", onUp);
    sliderRow.removeEventListener("pointercancel", onUp);
    sliderRow.removeEventListener("keydown", onKey);
  };
};
