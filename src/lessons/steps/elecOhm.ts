// elecOhm — 전류·전압·저항 관계 랩(중2 VII, 책 250~253쪽 탐구).
//   ohmLab: 두 가지 실험 모드(세그 전환).
//   [전압 바꾸기] 전원 장치(다이얼)로 전압 0~6V(0.5V 스냅)를 걸고 전류계(mA)를 읽어
//   "이 지점 기록"으로 V-I 그래프에 점을 찍는다.
//   · 한 니크롬선에서 서로 다른 전압 4점 → 원점을 지나는 직선(전류 ∝ 전압)
//   · 긴 니크롬선 R=20Ω vs 짧은 니크롬선 R=10Ω — 같은 전압에서 전류 2배(저항 절반)
//   · 같은 선에서 V와 2V 두 점(예: 2V·4V) 기록 → 비례 확인 자동 달성
//   [저항 바꾸기] 전압을 3V에 고정하고 니크롬선 길이 1·2·3배(10·20·30Ω)를 갈아 끼워
//   I-R 그래프에 3점 → 반비례 곡선(I = 3000/R)이 자라난다. (사용자 피드백: 비례 그래프만으론
//   '저항에 반비례'가 체험되지 않는다 → 반비례가 유도되는 상호작용을 추가.)
//   회로 표현은 elecKit이 단일 진실 공급원 — drawWire(전류 점 흐름·속도 ∝ 전류)·
//   drawBattery·ELEC 색만 쓴다. 니크롬선은 지그재그 코일 + 전류에 비례한 주황 발열 글로우.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { capturePointer } from "../../ui/lightKit";
import { curioCard, type Curio } from "../../ui/curio";
import { drawWire, drawBattery, ELEC, TAU } from "../../ui/elecKit";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type WireKind = "long" | "short";
type ExpMode = "volt" | "res";

const CVH = 342; // 캔버스 전체 높이 — 상단 회로 ~110px + 하단 그래프 ~210px
const V_MAX = 6; // 전압 축 0~6V(눈금 1V)
const I_MAX = 600; // 전류 축 0~600mA(눈금 100)
const R_OHM: Record<WireKind, number> = { long: 20, short: 10 }; // 긴 20Ω · 짧은 10Ω
const COLOR: Record<WireKind, string> = { long: ELEC.amber, short: ELEC.cyan }; // 긴=앰버, 짧은=시안
const WIRES: WireKind[] = ["long", "short"];
const WIRE_NAME: Record<WireKind, string> = { long: "긴 니크롬선", short: "짧은 니크롬선" };
// 저항 바꾸기 모드 — 전압 3V 고정, 니크롬선 길이 1·2·3배(저항은 길이에 비례)
const RES_V = 3;
const LEN_R = [10, 20, 30]; // Ω
const R_MAX = 35; // I-R 그래프 x축(Ω)
const RES_COLOR = "168,148,255"; // 반비례 곡선 — 바이올렛(직선 두 색과 구분)

// ---- 회로 기하(상단 영역, y 16~104) ----
const Y_TOP = 24; // 위쪽 전선
const Y_BOT = 104; // 아래쪽 전선
const PX = 48; // 전원 장치 중심 x
const CX = 148; // 니크롬선(코일) 중심 x
const BL = 104; // 전압계 분기 왼쪽 x
const BR = 192; // 전압계 분기 오른쪽 x
const VMY = 66; // 전압계 중심 y
const DIVIDER_Y = 122; // 회로/그래프 경계선
// ---- 그래프 기하(하단 영역) ----
const GY0 = 150; // 플롯 위
const GY1 = 304; // 플롯 아래(x축)
const GX0 = 56; // y축

export const ohmLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 목표 칩 ----
  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "lineL" } }, el("b", { text: "긴 니크롬선" }), el("span", { text: "0/4점" })),
    el("div", { class: "pn-badge", dataset: { g: "lineS" } }, el("b", { text: "짧은 니크롬선" }), el("span", { text: "0/4점" })),
    el("div", { class: "pn-badge", dataset: { g: "prop" } }, el("b", { text: "비례 확인" }), el("span", { text: "예: 2V·4V" })),
    el("div", { class: "pn-badge", dataset: { g: "inverse" } }, el("b", { text: "반비례 확인" }), el("span", { text: "저항 바꾸기" })),
  );

  // ---- 무대(회로 + 그래프 캔버스) ----
  const canvas = el("canvas", { style: `height:${CVH}px` });
  const pdotEl = el("span", { class: "pdot", style: `background:rgb(${ELEC.amber})` });
  const voltSpan = el("span", { text: "전압 0.0 V" });
  const ampRead = el("span", { text: "0" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, pdotEl, voltSpan),
      el("div", { class: "tempread" }, ampRead, el("small", { text: " mA" })),
    ),
    toastEl,
  );

  // ---- 컨트롤: 실험 모드 세그 → (전압 모드: 니크롬선 세그 + 전압 슬라이더 / 저항 모드: 길이 세그) + 기록 버튼 ----
  const modeVolt = el("button", { class: "on", text: "① 전압 바꾸기", attrs: { type: "button", "aria-pressed": "true" } });
  const modeRes = el("button", { text: "② 저항 바꾸기", attrs: { type: "button", "aria-pressed": "false" } });
  const modeSeg = el("div", { class: "seg", style: "margin-top:14px", attrs: { "aria-label": "실험 고르기" } }, modeVolt, modeRes);

  const btnL = el("button", { class: "on", text: WIRE_NAME.long, attrs: { type: "button", "aria-pressed": "true" } });
  const btnS = el("button", { text: WIRE_NAME.short, attrs: { type: "button", "aria-pressed": "false" } });
  const seg = el("div", { class: "seg", style: "margin-top:10px", attrs: { "aria-label": "니크롬선 고르기" } }, btnL, btnS);

  const lenBtns: HTMLButtonElement[] = [];
  const lenSeg = el("div", { class: "seg", style: "margin-top:10px;display:none", attrs: { "aria-label": "니크롬선 길이 고르기" } });
  ["길이 1배·10Ω", "길이 2배·20Ω", "길이 3배·30Ω"].forEach((t, i) => {
    const b = el("button", { text: t, attrs: { type: "button", "aria-pressed": String(i === 0) } });
    if (i === 0) b.classList.add("on");
    b.addEventListener("click", () => setLen(i));
    lenBtns.push(b);
    lenSeg.appendChild(b);
  });

  const sliders = el("div", { class: "px-sliders show" });
  const recordBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "이 지점 기록" }));
  const helper = el("div", {
    class: "helper",
    html: "전압을 바꿔 가며 <b>이 지점 기록</b>을 눌러 (전압, 전류) 점을 모아요 — 한 니크롬선에서 <b>서로 다른 전압 4점</b>이면 규칙이 보여요!",
  });

  host.append(goalChips, helper, stage, modeSeg, seg, lenSeg, sliders, recordBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let expMode: ExpMode = "volt";
  let wire: WireKind = "long";
  let lenIdx = 0; // 저항 모드의 길이 선택(0..2 → 10·20·30Ω)
  let V = 0; // 전압(0.5V 스냅, 전압 모드)
  let dispI = 0; // 바늘·발열용 관성 전류(mA)
  let dispV = 0; // 다이얼·전압계 관성 전압(V)
  let flow = 0; // 전류 점 흐름 위상
  const recs: Record<WireKind, Set<number>> = { long: new Set(), short: new Set() }; // key = V*2(정수)
  const recsR = new Set<number>(); // 저항 모드 기록(key = R)
  const lineProg: Record<WireKind, number> = { long: 0, short: 0 }; // 직선 그려지는 진행도
  let curveProg = 0; // 반비례 곡선 진행도
  const pops: { v: number; i: number; rgb: string; t0: number; res?: boolean }[] = []; // 기록 스탬프 링(v = x축 값)
  const goals = new Set<string>();
  let totalRecs = 0;
  let finished = false;
  let toastTimer = 0;
  let shownHud = "";

  const iOf = (v: number, w: WireKind): number => (v / R_OHM[w]) * 1000; // mA
  const gidOf = (w: WireKind): string => (w === "long" ? "lineL" : "lineS");
  const effV = (): number => (expMode === "volt" ? V : RES_V); // 저항 모드는 3V 고정
  const effR = (): number => (expMode === "volt" ? R_OHM[wire] : LEN_R[lenIdx]);

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

  function collect(id: string, subText: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "전압이 커질수록 전류도 커졌죠?(<b>비례</b>) 저항이 커질수록 전류는 줄었죠?(<b>반비례</b>) 네, 맞아요 — 이 둘을 한 줄로 합친 게 <b>I = V/R</b>, 옴의 법칙이에요! 다음 개념에서 차근차근 정리해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 세그: 실험 모드 ----
  function setMode(m: ExpMode): void {
    if (expMode === m) return;
    expMode = m;
    modeVolt.classList.toggle("on", m === "volt");
    modeRes.classList.toggle("on", m === "res");
    modeVolt.setAttribute("aria-pressed", String(m === "volt"));
    modeRes.setAttribute("aria-pressed", String(m === "res"));
    seg.style.display = m === "volt" ? "" : "none";
    sliders.style.display = m === "volt" ? "" : "none";
    lenSeg.style.display = m === "res" ? "" : "none";
    pdotEl.style.background = m === "res" ? `rgb(${RES_COLOR})` : `rgb(${COLOR[wire]})`;
    haptic(HAPTIC.select);
    if (finished) return;
    helper.innerHTML =
      m === "res"
        ? "이번엔 <b>전압을 3V에 고정</b>하고 <b>저항(니크롬선 길이)</b>을 바꿔요. 길이 1배·2배·3배 — <b>세 점을 모두 기록</b>하면 곡선이 나타나요!"
        : "전압을 바꿔 가며 점을 기록해 <b>직선 두 개</b>(긴·짧은)와 <b>2배 쌍</b>을 모아요.";
  }
  modeVolt.addEventListener("click", () => setMode("volt"));
  modeRes.addEventListener("click", () => setMode("res"));

  // ---- 세그: 니크롬선 교체(전압 모드) ----
  function setWire(w: WireKind): void {
    if (wire === w) return;
    wire = w;
    btnL.classList.toggle("on", w === "long");
    btnS.classList.toggle("on", w === "short");
    btnL.setAttribute("aria-pressed", String(w === "long"));
    btnS.setAttribute("aria-pressed", String(w === "short"));
    pdotEl.style.background = `rgb(${COLOR[w]})`;
    haptic(HAPTIC.select);
  }
  btnL.addEventListener("click", () => setWire("long"));
  btnS.addEventListener("click", () => setWire("short"));

  // ---- 세그: 길이 교체(저항 모드) ----
  function setLen(i: number): void {
    if (lenIdx === i) return;
    lenIdx = i;
    lenBtns.forEach((b, k) => {
      b.classList.toggle("on", k === i);
      b.setAttribute("aria-pressed", String(k === i));
    });
    haptic(HAPTIC.select);
    if (!finished && !goals.has("inverse"))
      helper.innerHTML = `길이 ${i + 1}배 = 저항 ${LEN_R[i]}Ω — 전류계를 읽고 <b>이 지점 기록</b>!`;
  }

  // ---- 전압 슬라이더(px-sl 문법, 0.5V 스냅) ----
  {
    const fill = el("i", { class: "px-fill", style: "background:linear-gradient(90deg,#6B4A16,#FFC45A)" });
    const knob = el("i", { class: "px-knob" });
    const track = el("div", { class: "px-track" }, fill, knob);
    const val = el("b", { class: "px-val", text: "0.0V" });
    const row = el(
      "div",
      { class: "px-sl", attrs: { role: "slider", tabindex: "0", "aria-label": "전압" } },
      el("b", { text: "전압" }),
      track,
      val,
    );
    const sync = (): void => {
      const t = V / V_MAX;
      fill.style.width = `${Math.round(t * 100)}%`;
      knob.style.left = `${Math.round(t * 100)}%`;
      val.textContent = `${V.toFixed(1)}V`;
      row.setAttribute("aria-valuenow", val.textContent);
    };
    const setT = (t: number): void => {
      V = Math.round(clamp(t, 0, 1) * 12) / 2; // 0.5V 스냅
      sync();
    };
    let drag = false;
    const setFrom = (cx: number): void => {
      const tr = track.getBoundingClientRect();
      setT((cx - tr.left) / tr.width);
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
      if (e.key === "ArrowRight" || e.key === "ArrowUp") setT(V / V_MAX + 1 / 12);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") setT(V / V_MAX - 1 / 12);
      else return;
      e.preventDefault();
    });
    sliders.appendChild(row);
    sync();
  }

  // ---- 기록 버튼: 현재 지점을 그래프에 스탬프(모드별 축) ----
  recordBtn.addEventListener("click", () => {
    if (expMode === "res") {
      const R = LEN_R[lenIdx];
      if (recsR.has(R)) {
        toast("이미 기록한 길이예요 — 다른 길이로 바꿔 봐요");
        haptic(HAPTIC.tap);
        return;
      }
      recsR.add(R);
      recordBtn.classList.remove("pulse");
      pops.push({ v: R, i: (RES_V / R) * 1000, rgb: RES_COLOR, t0: performance.now(), res: true });
      haptic(HAPTIC.tap);
      if (!goals.has("inverse")) {
        const span = goalChips.querySelector('[data-g="inverse"] span') as HTMLElement;
        span.textContent = `${Math.min(recsR.size, 3)}/3점`;
      }
      if (recsR.size === 1 && !finished) helper.innerHTML = "첫 점! 위 세그에서 <b>다른 길이</b>로 바꿔 두 점 더 기록해요.";
      else if (recsR.size === 2 && !finished && !goals.has("inverse")) helper.innerHTML = "좋아요 — <b>남은 길이</b>도 기록하면 곡선이 완성돼요!";
      if (recsR.size >= 3 && !goals.has("inverse")) {
        collect("inverse", "곡선 완성!", "저항 2배 → 전류 절반, 반비례!");
        if (!finished)
          helper.innerHTML =
            "보이죠? 저항이 2배·3배가 되니 전류는 <b>1/2·1/3</b>(300→150→100mA)로 줄었어요 — 이런 관계가 <b>반비례</b>! 그래프도 직선이 아니라 <b>곡선</b>으로 휘어요.";
      }
      return;
    }
    const key = Math.round(V * 2);
    const set = recs[wire];
    if (set.has(key)) {
      toast("이미 기록한 지점이에요 — 전압을 바꿔 봐요");
      haptic(HAPTIC.tap);
      return;
    }
    set.add(key);
    totalRecs++;
    recordBtn.classList.remove("pulse");
    pops.push({ v: V, i: iOf(V, wire), rgb: COLOR[wire], t0: performance.now() });
    haptic(HAPTIC.tap);
    const gid = gidOf(wire);
    if (!goals.has(gid)) {
      const span = goalChips.querySelector(`[data-g="${gid}"] span`) as HTMLElement;
      span.textContent = `${Math.min(set.size, 4)}/4점`;
    }
    if (totalRecs === 1 && !finished)
      helper.innerHTML = "첫 점! 전압을 바꿔 다른 지점도 기록해요. <b>2V와 4V</b>처럼 딱 2배인 쌍도 찍어 보세요.";
    // 비례 목표 — 같은 선에서 V와 2V가 함께 기록되면 자동
    if (!goals.has("prop")) {
      let hit = false;
      for (const k of set) if (k > 0 && set.has(k * 2)) hit = true;
      if (hit) {
        collect("prop", "2배 → 2배!", "전압 2배 → 전류 2배!");
        if (!finished)
          helper.innerHTML =
            "전압이 커질수록 전류가 커졌죠? 네, 맞아요 — 전압이 딱 <b>2배</b>가 되니 전류도 딱 <b>2배</b>! 이런 관계가 <b>비례</b>이고, 그래프에선 <b>원점을 지나는 직선</b>으로 나타나요." +
            (goals.has("lineL") && goals.has("lineS") ? " 이제 위 세그에서 <b>② 저항 바꾸기</b>!" : "");
      }
    }
    // 직선 목표 — 서로 다른 전압 4점
    if (set.size >= 4 && !goals.has(gid)) {
      const second = goals.has("lineL") || goals.has("lineS");
      collect(gid, "직선 완성!", second ? "두 직선 완성 — 기울기 비교!" : "직선이에요 — 전압에 비례!");
      if (!finished)
        helper.innerHTML = second
          ? "두 직선 비교 — <b>같은 전압에서 짧은 선의 전류가 2배</b>! 길이가 절반이라 전류를 방해하는 정도, <b>저항이 절반</b>이기 때문이에요." +
            (goals.has("prop") ? " 이제 위 세그에서 <b>② 저항 바꾸기</b>로 반비례를 눈으로 확인해요!" : " 같은 선에 <b>2배 쌍(예: 2V·4V)</b>도 찍어 보세요!")
          : "점 네 개가 <b>원점을 지나는 직선</b> 위에! 전류는 전압에 <b>비례</b>해요. 이제 <b>다른 니크롬선</b>으로 바꿔 직선을 하나 더 완성해요.";
    }
  });

  // ---- 그리기 헬퍼 ----
  const mixc = (a: [number, number, number], b: [number, number, number], t: number): string =>
    `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;

  /** 아날로그 계기(전류계·전압계) — 바늘 각도 ∝ frac. */
  function meter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    frac: number,
    unit: string,
    tag: string,
    tagPos: "left" | "below",
  ): void {
    ctx.save();
    ctx.fillStyle = "#1D2A44";
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = ELEC.wireDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, TAU);
    ctx.stroke();
    const fg = ctx.createRadialGradient(x - r * 0.34, y - r * 0.38, r * 0.2, x, y, r);
    fg.addColorStop(0, "#F4F8FE");
    fg.addColorStop(0.7, "#DCE7F5");
    fg.addColorStop(1, "#B9C9E0");
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    // 눈금(호 -145°~-35°)
    ctx.strokeStyle = "#4E5F7E";
    ctx.lineWidth = 1.1;
    for (let i = 0; i <= 6; i++) {
      const a = ((-145 + (i * 110) / 6) * Math.PI) / 180;
      const r1 = r * (i % 3 === 0 ? 0.6 : 0.7);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.lineTo(x + Math.cos(a) * r * 0.84, y + Math.sin(a) * r * 0.84);
      ctx.stroke();
    }
    // 바늘
    const na = ((-145 + clamp(frac, 0, 1.03) * 110) * Math.PI) / 180;
    ctx.strokeStyle = "#E8574A";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(na) * r * 0.16, y - Math.sin(na) * r * 0.16);
    ctx.lineTo(x + Math.cos(na) * r * 0.8, y + Math.sin(na) * r * 0.8);
    ctx.stroke();
    ctx.fillStyle = "#33415E";
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, TAU);
    ctx.fill();
    // 단위 글자
    ctx.font = `800 ${Math.max(8, Math.round(r * 0.44))}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#3C4C6C";
    ctx.fillText(unit, x, y + r * 0.52);
    // 이름 태그
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(174,196,228,.9)";
    if (tagPos === "below") ctx.fillText(tag, x, y + r + 12);
    else {
      ctx.textAlign = "right";
      ctx.fillText(tag, x - r - 8, y);
    }
    ctx.restore();
  }

  /** 전원 장치 — 패널 + drawBattery + 전압 다이얼(각도 ∝ 전압). */
  function powerBox(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const bx = PX - 31;
    const by = 36;
    const bw = 62;
    const bh = 58;
    const g = ctx.createLinearGradient(0, by, 0, by + bh);
    g.addColorStop(0, "#33456A");
    g.addColorStop(1, "#1C2A46");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 9);
    ctx.fill();
    ctx.strokeStyle = "rgba(160,190,230,.42)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 9);
    ctx.stroke();
    ctx.font = "700 8.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(190,208,236,.85)";
    ctx.fillText("전원 장치", PX, by + 11);
    drawBattery(ctx, PX, by + 23, 38, 14);
    // 다이얼(전압 ∝ 회전각)
    const dy = by + 45;
    const dr = 8.5;
    const dg = ctx.createRadialGradient(PX - 3, dy - 3, 1.5, PX, dy, dr);
    dg.addColorStop(0, "#D8E4F4");
    dg.addColorStop(1, "#7E92B4");
    ctx.fillStyle = dg;
    ctx.beginPath();
    ctx.arc(PX, dy, dr, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#25324A";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(PX, dy, dr, 0, TAU);
    ctx.stroke();
    const da = ((135 + (clamp(dispV / V_MAX, 0, 1)) * 270) * Math.PI) / 180;
    ctx.strokeStyle = "#FFD98C";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(PX + Math.cos(da) * 2, dy + Math.sin(da) * 2);
    ctx.lineTo(PX + Math.cos(da) * (dr - 1.5), dy + Math.sin(da) * (dr - 1.5));
    ctx.stroke();
    // 단자
    ctx.fillStyle = ELEC.wire;
    for (const ty of [by, by + bh]) {
      ctx.beginPath();
      ctx.arc(PX, ty, 3, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;

    const R = effR();
    const target = (effV() / R) * 1000;
    dispI += (target - dispI) * Math.min(1, 0.16 * dt);
    dispV += (effV() - dispV) * Math.min(1, 0.2 * dt);
    flow = (flow + ((dt * 16.7) / 1000) * (dispI / I_MAX) * 4.2) % 1; // 점 흐름 속도 ∝ 전류
    for (const w of WIRES) if (goals.has(gidOf(w))) lineProg[w] = Math.min(1, lineProg[w] + dt * 0.035);
    if (goals.has("inverse")) curveProg = Math.min(1, curveProg + dt * 0.03);

    const ax = W - 52; // 전류계 중심 x
    const ay = 58;
    const coilHalf = R === 10 ? 26 : R === 20 ? 50 : 74; // 저항(길이)에 비례해 코일도 길게
    const teeth = R / 2;
    const cx0 = CX - coilHalf;
    const cx1 = CX + coilHalf;
    const on = dispI > 2;

    // ---- 회로/그래프 경계 ----
    ctx.strokeStyle = "rgba(148,168,196,.13)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, DIVIDER_Y);
    ctx.lineTo(W - 14, DIVIDER_Y);
    ctx.stroke();

    // ---- 니크롬선 발열 글로우(전류 클수록 주황) ----
    const heat = clamp(dispI / I_MAX, 0, 1);
    if (heat > 0.02) {
      const gl = ctx.createRadialGradient(CX, Y_TOP, 4, CX, Y_TOP, 30 + 44 * heat);
      gl.addColorStop(0, `rgba(255,132,44,${0.32 * heat})`);
      gl.addColorStop(1, "rgba(255,132,44,0)");
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(CX, Y_TOP, 30 + 44 * heat, 0, TAU);
      ctx.fill();
    }

    // ---- 전선(전류 점 흐름 — 전원 → 니크롬선 → 전류계 → 전원) ----
    drawWire(ctx, [{ x: PX, y: 36 }, { x: PX, y: Y_TOP }, { x: cx0, y: Y_TOP }], { on, flow, width: 3.5 });
    drawWire(ctx, [{ x: cx1, y: Y_TOP }, { x: ax, y: Y_TOP }, { x: ax, y: 34 }], { on, flow, width: 3.5 });
    drawWire(ctx, [{ x: ax, y: 82 }, { x: ax, y: Y_BOT }, { x: PX, y: Y_BOT }, { x: PX, y: 94 }], { on, flow, width: 3.5 });
    // 전압계 분기(니크롬선 양단에 나란히 — 이상 전압계라 전류 점 없음)
    drawWire(ctx, [{ x: BL, y: Y_TOP }, { x: BL, y: VMY }, { x: CX - 15, y: VMY }], { width: 2 });
    drawWire(ctx, [{ x: BR, y: Y_TOP }, { x: BR, y: VMY }, { x: CX + 15, y: VMY }], { width: 2 });
    ctx.fillStyle = ELEC.wire;
    for (const nx of [BL, BR]) {
      ctx.beginPath();
      ctx.arc(nx, Y_TOP, 2.6, 0, TAU);
      ctx.fill();
    }

    // ---- 니크롬선(지그재그 코일 — 발열 색·글로우) ----
    ctx.save();
    if (heat > 0.02) {
      ctx.shadowColor = "rgba(255,140,60,.85)";
      ctx.shadowBlur = 12 * heat;
    }
    ctx.strokeStyle = mixc([143, 164, 194], [255, 152, 74], heat);
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx0, Y_TOP);
    const tw = (cx1 - cx0) / teeth;
    for (let i = 1; i < teeth; i++) ctx.lineTo(cx0 + tw * i, Y_TOP + (i % 2 ? -8 : 8));
    ctx.lineTo(cx1, Y_TOP);
    ctx.stroke();
    ctx.restore();
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(174,196,228,.85)";
    ctx.fillText(expMode === "res" ? `니크롬선 (길이 ${lenIdx + 1}배)` : WIRE_NAME[wire], CX, 45);

    // ---- 계기·전원 장치 ----
    meter(ctx, CX, VMY, 15, dispV / V_MAX, "V", "전압계", "below");
    meter(ctx, ax, ay, 21, dispI / I_MAX, "mA", "전류계", "left");
    powerBox(ctx);

    // ---- 그래프(모드별 축: 전압 모드 V-I / 저항 모드 R-I) ----
    const GX1 = W - 22;
    const xOf = (v: number): number => GX0 + (v / V_MAX) * (GX1 - GX0); // 전압 축
    const xR = (r: number): number => GX0 + (r / R_MAX) * (GX1 - GX0); // 저항 축
    const yOf = (i: number): number => GY1 - (i / I_MAX) * (GY1 - GY0);
    // 그리드
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(148,168,196,.12)";
    if (expMode === "volt") {
      for (let v = 1; v <= V_MAX; v++) {
        ctx.beginPath();
        ctx.moveTo(xOf(v), GY0);
        ctx.lineTo(xOf(v), GY1);
        ctx.stroke();
      }
    } else {
      for (let r = 5; r <= R_MAX; r += 5) {
        ctx.beginPath();
        ctx.moveTo(xR(r), GY0);
        ctx.lineTo(xR(r), GY1);
        ctx.stroke();
      }
    }
    for (let i = 100; i <= I_MAX; i += 100) {
      ctx.beginPath();
      ctx.moveTo(GX0, yOf(i));
      ctx.lineTo(GX1, yOf(i));
      ctx.stroke();
    }
    // 축
    ctx.strokeStyle = "rgba(148,168,196,.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(GX0, GY0 - 6);
    ctx.lineTo(GX0, GY1);
    ctx.lineTo(GX1, GY1);
    ctx.stroke();
    // 눈금 숫자·축 라벨
    ctx.font = "600 10px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(196,212,232,.75)";
    ctx.textAlign = "center";
    if (expMode === "volt") for (let v = 0; v <= V_MAX; v++) ctx.fillText(String(v), xOf(v), GY1 + 15);
    else for (let r = 0; r <= 30; r += 10) ctx.fillText(String(r), xR(r), GY1 + 15);
    ctx.textAlign = "right";
    for (let i = 100; i <= I_MAX; i += 100) ctx.fillText(String(i), GX0 - 7, yOf(i) + 3.5);
    ctx.textAlign = "left";
    ctx.fillText("전류(mA)", 16, GY0 - 12);
    ctx.textAlign = "center";
    ctx.fillText(expMode === "volt" ? "전압(V)" : "저항(Ω)", (GX0 + GX1) / 2, GY1 + 32);
    // 범례(좌상단 — 그래프가 비껴가는 구석)
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.textAlign = "left";
    if (expMode === "volt") {
      let lx = GX0 + 10;
      for (const w of WIRES) {
        ctx.fillStyle = `rgba(${COLOR[w]},.95)`;
        ctx.beginPath();
        ctx.arc(lx, GY0 + 11, 3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(196,212,232,.8)";
        const nm = w === "long" ? "긴 선" : "짧은 선";
        ctx.fillText(nm, lx + 7, GY0 + 14.5);
        lx += 7 + ctx.measureText(nm).width + 14;
      }
    } else {
      // 반비례 모드 배지 — 통제 변인(전압 고정)을 계속 상기
      ctx.fillStyle = `rgba(${RES_COLOR},.95)`;
      ctx.beginPath();
      ctx.arc(GX1 - 96, GY0 + 11, 3, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(196,212,232,.85)";
      ctx.fillText("전압 3V 고정", GX1 - 88, GY0 + 14.5);
    }
    if (expMode === "volt") {
      // 완성된 직선(원점 통과 — 자라나는 애니메이션)
      for (const w of WIRES) {
        const p = lineProg[w];
        if (p <= 0) continue;
        const vEnd = V_MAX * p;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(${COLOR[w]},.2)`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(xOf(0), yOf(0));
        ctx.lineTo(xOf(vEnd), yOf(iOf(vEnd, w)));
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = `rgba(${COLOR[w]},.9)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xOf(0), yOf(0));
        ctx.lineTo(xOf(vEnd), yOf(iOf(vEnd, w)));
        ctx.stroke();
      }
      // 기록한 점(긴=앰버, 짧은=시안)
      for (const w of WIRES) {
        ctx.save();
        ctx.fillStyle = `rgba(${COLOR[w]},.95)`;
        ctx.shadowColor = `rgba(${COLOR[w]},.7)`;
        ctx.shadowBlur = 6;
        for (const k of recs[w]) {
          const v = k / 2;
          ctx.beginPath();
          ctx.arc(xOf(v), yOf(iOf(v, w)), 3.2, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
    } else {
      // 반비례 곡선 I = 3000/R (3점 완성 후 자라난다 — R=5에서 600mA로 시작)
      if (curveProg > 0) {
        const rEnd = 5 + (R_MAX - 1 - 5) * curveProg;
        for (const pass of [0, 1]) {
          ctx.save();
          if (!pass) ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = `rgba(${RES_COLOR},${pass ? 0.9 : 0.2})`;
          ctx.lineWidth = pass ? 2 : 6;
          ctx.beginPath();
          for (let r = 5; r <= rEnd; r += 0.4) {
            const px = xR(r);
            const py = yOf((RES_V / r) * 1000);
            if (r === 5) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
      // 기록한 점(바이올렛)
      ctx.save();
      ctx.fillStyle = `rgba(${RES_COLOR},.95)`;
      ctx.shadowColor = `rgba(${RES_COLOR},.7)`;
      ctx.shadowBlur = 6;
      for (const r of recsR) {
        ctx.beginPath();
        ctx.arc(xR(r), yOf((RES_V / r) * 1000), 3.4, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    // 현재 지점 미리보기(십자 가이드 + 맥동 링 — 기록 버튼이 찍을 자리)
    const prevColor = expMode === "volt" ? COLOR[wire] : RES_COLOR;
    const lpx = expMode === "volt" ? xOf(V) : xR(R);
    const lpy = yOf(target);
    ctx.strokeStyle = `rgba(${prevColor},.3)`;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(lpx, GY1);
    ctx.lineTo(lpx, lpy);
    ctx.moveTo(GX0, lpy);
    ctx.lineTo(lpx, lpy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(${prevColor},.16)`;
    ctx.beginPath();
    ctx.arc(lpx, lpy, 8.5 + Math.sin(tMs / 260) * 1.6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(${prevColor},.95)`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(lpx, lpy, 4.6, 0, TAU);
    ctx.stroke();
    // 기록 스탬프 팝(퍼지는 링 — 자기 모드의 축에서만)
    const now = performance.now();
    for (let i = pops.length - 1; i >= 0; i--) {
      const t = (now - pops[i].t0) / 450;
      if (t >= 1) {
        pops.splice(i, 1);
        continue;
      }
      if (!!pops[i].res !== (expMode === "res")) continue;
      ctx.strokeStyle = `rgba(${pops[i].rgb},${(1 - t) * 0.85})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc((pops[i].res ? xR : xOf)(pops[i].v), yOf(pops[i].i), 4 + t * 12, 0, TAU);
      ctx.stroke();
    }

    // ---- HUD ----
    const hud = `${expMode}|${V.toFixed(1)}|${R}|${Math.round(dispI)}`;
    if (hud !== shownHud) {
      shownHud = hud;
      voltSpan.textContent = expMode === "volt" ? `전압 ${V.toFixed(1)} V` : `3.0 V 고정 · ${R}Ω`;
      ampRead.textContent = String(Math.round(dispI));
    }
  });

  api.setCTA("직선 둘 + 2배 쌍 + 반비례 곡선!", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.clearTimeout(toastTimer);
  };
};
