// elecCoil — 전류가 만드는 자기장 랩(중2 VII L7, 책 264~265쪽).
//   coilFieldLab "코일 자기장 관측소": 옆에서 본 코일(루프 타원 5개)이 전선으로
//   전원 장치(drawBattery)·스위치와 연결된 다크 무대. 전류를 켜면 쌍극자형 폐곡선
//   자기장이 떠오르고(밝기 ∝ 세기), 주변 나침반 6개가 그 지점의 자기장 방향
//   (= N극이 가리키는 방향)으로 스프링 회전한다. 방향을 바꾸면 곡선 화살표·바늘이
//   통째로 반전, 세기를 바꾸면 곡선 밝기·전류 점 속도·바늘의 정렬 속도가 함께 변한다.
//   · 쌍극자 근사: 자기모멘트 m ∥ 코일 축(수평, 부호 pol), B ∝ (3(m·r̂)r̂ − m)/r³ 2D.
//     코일이 옆으로 넓적하므로 x를 KX배 늘인 좌표(anamorphic dipole)에서 계산 —
//     그려 둔 폐곡선(쌍극자 자기력선 정확식 r = L·sin²θ를 같은 비율로 늘인 것)과
//     바늘 방향이 어느 지점에서나 일치한다.
//   · 검산: 축 위(y=0) → B ∝ (3(m·r̂)r̂−m) = +2m — 좌우 나침반 모두 축방향 ✓
//           코일 바로 위/아래(x=0) → m·r̂=0이라 B ∝ −m — 축과 반대 방향 ✓
// 목표: ① 전류 켜서 바늘 정렬 보기 ② 방향 반전 전부 확인 ③ 세기 양끝(30↔100%) 체험.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { TAU, ELEC, drawWire, drawBattery, drawSwitch } from "../../ui/elecKit";
import { capturePointer } from "../../ui/lightKit";
import { contactShadow } from "../../ui/labProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const CVH = 320; // 무대 높이
const CY = 118; // 코일 중심 y
const KX = 1.9; // 가로 늘임 배율(코일이 길쭉한 만큼 자기장도 옆으로 퍼진 근사)
const EARTH = 0.045; // 지구 자기장(북쪽) — 전류가 꺼지면 이것만 남아 바늘이 북을 본다
const TQ = 0.09; // 바늘 복원 토크 계수
const RAIL = 270; // 아래 회로 레일 y

// ── 자기력선 폐곡선(코일 중심 기준 오프셋 좌표, 상하 대칭 2쌍 = 4개) ──
//    쌍극자 자기력선 r(θ) = L·sin²θ 를 x만 KX배 — 화살표 접선도 같은 식의 도함수.
interface FieldLoop {
  pts: { x: number; y: number }[];
  arrows: { x: number; y: number; tx: number; ty: number }[]; // tx,ty = pol=+1일 때 흐름 방향
}
const FIELD_LOOPS: FieldLoop[] = (() => {
  const out: FieldLoop[] = [];
  for (const L of [58, 92]) {
    for (const m of [-1, 1]) {
      // m=-1 위쪽 고리, +1 아래쪽 고리
      const pts: { x: number; y: number }[] = [];
      for (let t = 0.1; t <= Math.PI - 0.1 + 1e-4; t += 0.045) {
        const sn = Math.sin(t);
        pts.push({ x: KX * L * sn * sn * Math.cos(t), y: m * L * sn * sn * sn });
      }
      // 화살표 위치 — 작은 고리는 코일 몸통에 가리지 않게 바깥쪽 θ를 쓴다
      const ts = L < 70 ? [0.98, Math.PI / 2, Math.PI - 0.98] : [0.66, Math.PI / 2, Math.PI - 0.66];
      const arrows = ts.map((t) => {
        const sn = Math.sin(t);
        const cs = Math.cos(t);
        const tx = KX * L * (2 * sn * cs * cs - sn * sn * sn);
        const ty = m * 3 * L * sn * sn * cs;
        const n = Math.hypot(tx, ty) || 1;
        return { x: KX * L * sn * sn * cs, y: m * L * sn * sn * sn, tx: tx / n, ty: ty / n };
      });
      out.push({ pts, arrows });
    }
  }
  return out;
})();

const wrap = (x: number): number => Math.atan2(Math.sin(x), Math.cos(x));

export const coilFieldLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0",
      role: "switch",
      "aria-checked": "false",
      "aria-label": "코일 자기장 관측소. 무대 속 스위치를 탭하거나 엔터 키로 전류를 켜고 꺼요.",
    },
  });
  const statusDot = el("span", { class: "pdot", style: "background:#8CA2C0" });
  const statusTxt = el("span", { text: "전류 꺼짐" });
  const powerTxt = el("span", { text: "" });
  const powerPill = el(
    "div",
    { class: "pill", style: "display:none" },
    el("span", { class: "pdot", style: `background:rgb(${ELEC.amber})` }),
    powerTxt,
  );
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "무대 속 스위치를 톡 눌러도 전류가 켜져요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, statusDot, statusTxt), powerPill),
    toastEl,
    capEl,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "on" } }, el("b", { text: "전류 켜기" }), el("span", { text: "바늘 정렬?" })),
    el("div", { class: "pn-badge", dataset: { g: "flip" } }, el("b", { text: "방향 반전" }), el("span", { text: "전부 반대?" })),
    el("div", { class: "pn-badge", dataset: { g: "power" } }, el("b", { text: "세기 실험" }), el("span", { text: "크게·작게" })),
  );

  const btnPowerLabel = el("span", { text: "전류 켜기" });
  const btnPower = el("button", { class: "swapbtn", attrs: { type: "button", "aria-pressed": "false" } }, btnPowerLabel);
  const btnFlip = el(
    "button",
    { class: "swapbtn", attrs: { type: "button", "aria-pressed": "false" } },
    el("span", { text: "전류 방향 바꾸기" }),
  );
  const btnRow = el("div", { class: "gp-controls" }, btnPower, btnFlip);

  const helper = el("div", {
    class: "helper",
    html: "전류가 꺼져 있으면 나침반 바늘은 모두 <b>북쪽(화면 위)</b>만 봐요. <b>전류 켜기</b>를 누르고 여섯 바늘을 지켜보세요!",
  });

  // ── 상태 ──
  let on = false;
  let pol: 1 | -1 = 1; // 전류 방향 부호(= 자기모멘트 부호)
  let cur = 0.65; // 전류 세기 0.3~1
  let vis = 0; // 자기력선 표시 강도(켜짐/꺼짐 페이드)
  let flow = 0; // 전류 점 흐름 위상
  let settleMs = 0;
  let loMs = 0;
  let hiMs = 0;
  let loToasted = false;
  let hiToasted = false;
  let alignPol: 1 | -1 = 1; // 목표① 달성 당시의 방향(반전 판정 기준)
  let capUsed = false;
  let finished = false;
  let toastTimer = 0;
  const goals = new Set<string>();

  // 나침반 6개 — 코일 축 좌우 2 + 위 2 + 아래 2 (코일 중심 기준 오프셋)
  const compasses = [
    { dx: -96, dy: 0 },
    { dx: 96, dy: 0 },
    { dx: -46, dy: -58 },
    { dx: 46, dy: -58 },
    { dx: -46, dy: 58 },
    { dx: 46, dy: 58 },
  ].map((p) => ({ ...p, a: -Math.PI / 2 + (Math.random() - 0.5) * 0.08, v: 0 }));

  // ── 전류 세기 슬라이더(waveTank px-sl 문법) ──
  const sliders = el("div", { class: "px-sliders show" });
  {
    const fill = el("i", { class: "px-fill", style: "background:linear-gradient(90deg,#6E4A12,#FFC24D)" });
    const knob = el("i", { class: "px-knob" });
    const track = el("div", { class: "px-track" }, fill, knob);
    const val = el("b", { class: "px-val", text: "65%" });
    const row = el(
      "div",
      { class: "px-sl", attrs: { role: "slider", tabindex: "0", "aria-label": "전류 세기" } },
      el("b", { text: "전류 세기" }),
      track,
      val,
    );
    const sync = (): void => {
      const t = (cur - 0.3) / 0.7;
      fill.style.width = `${Math.round(t * 100)}%`;
      knob.style.left = `${Math.round(t * 100)}%`;
      val.textContent = `${Math.round(cur * 100)}%`;
      row.setAttribute("aria-valuenow", val.textContent);
    };
    let drag = false;
    const setFrom = (cxp: number): void => {
      const tr = track.getBoundingClientRect();
      cur = 0.3 + clamp((cxp - tr.left) / tr.width, 0, 1) * 0.7;
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
      if (e.key === "ArrowRight" || e.key === "ArrowUp") cur = clamp(cur + 0.056, 0.3, 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") cur = clamp(cur - 0.056, 0.3, 1);
      else return;
      e.preventDefault();
      sync();
    });
    sliders.appendChild(row);
    sync();
  }

  host.append(goalChips, stage, btnRow, sliders, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

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
    if (id === "on")
      helper.innerHTML =
        "잘 봐요 — <b>코일 축 위</b>의 바늘은 축 방향, <b>코일 위·아래</b> 바늘은 그 <b>반대 방향</b>이죠? 이제 <b>전류 방향 바꾸기</b>!";
    if (id === "flip")
      helper.innerHTML =
        "이번엔 <b>전류 세기</b> 슬라이더를 양끝까지 움직여 보세요 — 셀수록 곡선이 밝아지고 바늘이 빠르고 굳건하게 정렬해요!";
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "전류가 흐르는 코일 주위엔 <b>자기장</b>! 나침반 <b>N극이 가리키는 방향</b>이 그 지점의 자기장 방향 — <b>전류를 뒤집으면 자기장도 뒤집혀요</b>.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function setPower(v: boolean): void {
    if (on === v) return;
    on = v;
    btnPowerLabel.textContent = on ? "전류 끄기" : "전류 켜기";
    btnPower.setAttribute("aria-pressed", String(on));
    canvas.setAttribute("aria-checked", String(on));
    haptic(HAPTIC.select);
    if (!capUsed) {
      capUsed = true;
      capEl.style.transition = "opacity .4s";
      capEl.style.opacity = "0";
    }
    if (on && !goals.has("on"))
      helper.innerHTML =
        "바늘들이 <b>스르르 돌아가</b> 제각각 새 방향에 멈춰요 — 그 방향이 바로 그 지점의 <b>자기장 방향</b>이에요.";
    else if (!on && !finished)
      helper.innerHTML = "전류가 끊기면 자기장도 사라져요 — 바늘은 다시 <b>북쪽</b>으로 슬금슬금 돌아가요.";
  }

  btnPower.addEventListener("click", () => setPower(!on));
  btnFlip.addEventListener("click", () => {
    pol = pol === 1 ? -1 : 1;
    btnFlip.setAttribute("aria-pressed", String(pol === -1));
    haptic(HAPTIC.select);
    toast(on ? "전류 방향 반대로 — 바늘을 보세요!" : "방향을 바꿨어요 — 전류를 켜야 보여요");
  });

  // 무대 속 스위치 탭 → 전원 토글
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const sx = r.width / 2 + 44;
    if (Math.abs(px - sx) < 38 && Math.abs(py - (RAIL - 6)) < 34) setPower(!on);
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setPower(!on);
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("keydown", onKey);

  // ── 자기장(anamorphic 쌍극자 + 지구 자기장) — 나침반 위치의 방향·세기 ──
  function fieldAt(dx: number, dy: number): { bx: number; by: number; mag: number } {
    const qx = dx / KX;
    const qy = dy;
    const r = Math.hypot(qx, qy) || 1;
    const ux = qx / r;
    const uy = qy / r;
    const dot = pol * ux; // m̂·r̂
    const k = Math.pow(50 / r, 3) * (on ? cur : 0);
    const bx = KX * (3 * dot * ux - pol) * k;
    const by = 3 * dot * uy * k - EARTH; // 지구 자기장은 화면 위(북)
    return { bx, by, mag: Math.hypot(bx, by) };
  }

  function fieldArrow(ctx: CanvasRenderingContext2D, x: number, y: number, ux: number, uy: number, alpha: number): void {
    const px = -uy;
    const py = ux;
    ctx.strokeStyle = `rgba(${ELEC.cyan},${alpha})`;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - ux * 7 + px * 4.2, y - uy * 7 + py * 4.2);
    ctx.lineTo(x, y);
    ctx.lineTo(x - ux * 7 - px * 4.2, y - uy * 7 - py * 4.2);
    ctx.stroke();
  }

  function coilLoopPts(ex: number): { x: number; y: number }[] {
    // 권선 방향 주의: 전류는 오른쪽 레일을 타고 올라와 코일 아래-오른쪽으로 들어온다(pol=+1).
    // 점 순서를 위→왼→아래→오른(x에 −sin)으로 두면 루프의 오른쪽 변이 '위로', 왼쪽 변이
    // '아래로' 흘러 — 들어오는 전선(위로)·나가는 전선(아래로)과 흐름이 이어져 보인다.
    // (예전 +sin 순서는 오른쪽 변이 아래로 흘러 진입 전선과 정반대로 보이던 실제 피드백 버그.)
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 26; i++) {
      const t = (i / 26) * TAU;
      pts.push({ x: ex - Math.sin(t) * 9, y: CY - Math.cos(t) * 30 });
    }
    return pts;
  }

  function tri(ctx: CanvasRenderingContext2D, a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): void {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    ctx.fill();
  }

  function drawCompass(ctx: CanvasRenderingContext2D, x: number, y: number, a: number): void {
    const R = 15;
    // 유리 본체(좌상단 키라이트)
    const g = ctx.createRadialGradient(x - R * 0.34, y - R * 0.4, R * 0.2, x, y, R);
    g.addColorStop(0, "#33465F");
    g.addColorStop(0.65, "#1D2C44");
    g.addColorStop(1, "#0F1A2E");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(158,186,222,.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, TAU);
    ctx.stroke();
    // 방위 눈금(위 = 북이 살짝 밝게)
    for (let q = 0; q < 4; q++) {
      const qa = -Math.PI / 2 + (q * Math.PI) / 2;
      ctx.strokeStyle = q === 0 ? "rgba(214,232,255,.85)" : "rgba(158,186,222,.35)";
      ctx.lineWidth = q === 0 ? 2 : 1.2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(qa) * (R - 4.2), y + Math.sin(qa) * (R - 4.2));
      ctx.lineTo(x + Math.cos(qa) * (R - 1.4), y + Math.sin(qa) * (R - 1.4));
      ctx.stroke();
    }
    // 바늘 — N 빨강 / S 흰색, 좌상단 광원 기준 밝은 면·어두운 면 2조각씩
    const L = R * 0.72;
    const wN = 3.4;
    const cs = Math.cos(a);
    const sn = Math.sin(a);
    const px = -sn;
    const py = cs;
    const lit = px * -0.55 + py * -0.83 > 0; // +perp 면이 빛을 받는가
    const tipN = { x: x + cs * L, y: y + sn * L };
    const tipS = { x: x - cs * L, y: y - sn * L };
    const pivotP = { x: x + px * wN, y: y + py * wN };
    const pivotM = { x: x - px * wN, y: y - py * wN };
    ctx.fillStyle = lit ? "#FF8578" : "#C92E24";
    tri(ctx, tipN, pivotP, { x, y });
    ctx.fillStyle = lit ? "#C92E24" : "#FF8578";
    tri(ctx, tipN, pivotM, { x, y });
    ctx.fillStyle = lit ? "#F4F9FF" : "#9FB4CE";
    tri(ctx, tipS, pivotP, { x, y });
    ctx.fillStyle = lit ? "#9FB4CE" : "#F4F9FF";
    tri(ctx, tipS, pivotM, { x, y });
    // 축 핀
    ctx.fillStyle = "#E4EDF8";
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#2A3A55";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, TAU);
    ctx.stroke();
    // 유리 하이라이트
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.beginPath();
    ctx.ellipse(x - R * 0.3, y - R * 0.42, R * 0.44, R * 0.26, -0.6, 0, TAU);
    ctx.fill();
  }

  // ── 프레임 ──
  let statusShown = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    const W = fit.w;
    const cx = W / 2;

    // 표시 강도·전류 점 위상
    vis += ((on ? 1 : 0) - vis) * Math.min(1, 0.1 * dt);
    if (on) flow = (flow + dt * (0.012 + 0.045 * cur)) % 1;

    // 바늘 물리(자기 토크 스프링 + 감쇠 + 미세 흔들림) & 정렬 판정
    let allAligned = true;
    for (const c of compasses) {
      const f = fieldAt(c.dx, c.dy);
      const target = Math.atan2(f.by, f.bx);
      const K = Math.min(0.22, TQ * f.mag); // 세기 ∝ 복원력 — 셀수록 빠르고 굳건하게
      c.v += -K * Math.sin(c.a - target) * dt;
      c.v += (Math.random() - 0.5) * 0.004 * dt;
      c.v *= Math.pow(0.9, dt);
      c.a += c.v * dt;
      if (Math.abs(wrap(c.a - target)) > 0.26 || Math.abs(c.v) > 0.04) allAligned = false;
    }

    // 목표 ①② — 켜진 상태로 여섯 바늘이 자기장 방향에 안착
    if (on && vis > 0.6 && allAligned) settleMs += dt * 16.7;
    else settleMs = 0;
    if (settleMs > 420) {
      if (!goals.has("on")) {
        alignPol = pol;
        collect("on", "정렬 확인!", "여섯 바늘이 자기장 방향으로 정렬!");
      } else if (!goals.has("flip") && pol !== alignPol) {
        collect("flip", "반전 확인!", "자기장이 통째로 반대!");
      }
    }
    // 목표 ③ — 세기 양끝 체험
    if (on && vis > 0.5) {
      if (cur <= 0.34) {
        loMs += dt * 16.7;
        if (!loToasted && loMs > 350) {
          loToasted = true;
          if (!goals.has("power")) toast("약한 전류 — 곡선이 흐려지고 바늘이 굼떠요");
        }
      }
      if (cur >= 0.96) {
        hiMs += dt * 16.7;
        if (!hiToasted && hiMs > 350) {
          hiToasted = true;
          if (!goals.has("power")) toast("강한 전류 — 곡선이 밝고 바늘이 굳건해요");
        }
      }
      if (!goals.has("power") && loMs > 350 && hiMs > 350)
        collect("power", "양끝 체험!", "세기 따라 자기장도 세지고 약해져요!");
    }

    // ── 자기력선(폐곡선 4개 + 축선, 밝기 ∝ 세기) ──
    if (vis > 0.015) {
      const base = vis * (0.12 + 0.34 * cur);
      // 축 방향 직선(축 위 나침반이 읽는 그 방향)
      ctx.strokeStyle = `rgba(${ELEC.cyan},${base * 0.8})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 112, CY);
      ctx.lineTo(cx + 112, CY);
      ctx.stroke();
      for (const ox of [-62, 62]) fieldArrow(ctx, cx + ox, CY, pol, 0, Math.min(0.95, base * 1.6));
      for (const fl of FIELD_LOOPS) {
        // 넓은 글로우 패스 + 코어 패스
        for (const pass of [0, 1]) {
          ctx.strokeStyle = `rgba(${ELEC.cyan},${pass ? base : base * 0.3})`;
          ctx.lineWidth = pass ? 1.7 : 4.5;
          ctx.beginPath();
          fl.pts.forEach((p, i) => (i ? ctx.lineTo(cx + p.x, CY + p.y) : ctx.moveTo(cx + p.x, CY + p.y)));
          ctx.stroke();
        }
        for (const ar of fl.arrows)
          fieldArrow(ctx, cx + ar.x, CY + ar.y, ar.tx * pol, ar.ty * pol, Math.min(0.95, base * 1.6));
      }
    }

    // ── 회로: 접촉 그림자 → 전선 → 전원 장치 → 스위치 ──
    const bx = cx - 40; // 전원 장치 중심
    const swx = cx + 44; // 스위치 중심
    contactShadow(ctx, bx, RAIL + 15, 52, 0.2);
    contactShadow(ctx, swx, RAIL + 13, 34, 0.16);
    const wireL = [
      { x: cx - 26, y: CY + 29 },
      { x: cx - 14, y: CY + 50 },
      { x: cx - 14, y: 240 },
      { x: cx - 86, y: 240 },
      { x: cx - 86, y: RAIL },
      { x: cx - 70, y: RAIL },
    ];
    const wireM = [
      { x: cx - 10, y: RAIL },
      { x: cx + 24, y: RAIL },
    ];
    const wireR = [
      { x: cx + 64, y: RAIL },
      { x: cx + 86, y: RAIL },
      { x: cx + 86, y: 240 },
      { x: cx + 14, y: 240 },
      { x: cx + 14, y: CY + 50 },
      { x: cx + 26, y: CY + 29 },
    ];
    drawWire(ctx, wireL, { on, flow, dir: pol });
    drawWire(ctx, wireM, { on, flow, dir: pol });
    drawWire(ctx, wireR, { on, flow, dir: pol });
    // 전원 장치 — 방향 반전은 장치를 좌우 반전으로(+극이 반대편으로 이동)
    if (pol === -1) {
      ctx.save();
      ctx.translate(bx * 2, 0);
      ctx.scale(-1, 1);
      drawBattery(ctx, bx, RAIL, 64, 26);
      ctx.restore();
    } else {
      drawBattery(ctx, bx, RAIL, 64, 26);
    }
    // 스위치(+ 켜기 전 유도 링)
    if (!on && !goals.has("on")) {
      const pulse = 24 + Math.sin(tMs / 300) * 3;
      ctx.strokeStyle = `rgba(${ELEC.amber},.4)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(swx + 4, RAIL - 8, pulse, 0, TAU);
      ctx.stroke();
    }
    drawSwitch(ctx, swx, RAIL, on, 40);

    // ── 코일(옆모습 — 루프 타원 5개, 전선과 같은 재질 + 전류 점 흐름) ──
    if (vis > 0.02) {
      const gg = ctx.createRadialGradient(cx, CY, 4, cx, CY, 70);
      gg.addColorStop(0, `rgba(${ELEC.amber},${0.15 * cur * vis})`);
      gg.addColorStop(1, "rgba(255,196,90,0)");
      ctx.fillStyle = gg;
      ctx.fillRect(cx - 80, CY - 44, 160, 88);
    }
    for (let i = 0; i < 5; i++) drawWire(ctx, coilLoopPts(cx + (i - 2) * 13), { on, flow, dir: pol, width: 3.4 });

    // ── 나침반 6개 ──
    for (const c of compasses) drawCompass(ctx, cx + c.dx, CY + c.dy, c.a);

    // HUD — 변한 프레임에만 DOM 갱신
    const status = on ? `켜짐 · 세기 ${Math.round(cur * 100)}%` : "꺼짐";
    if (status !== statusShown) {
      statusShown = status;
      statusTxt.textContent = on ? "전류 켜짐" : "전류 꺼짐";
      statusDot.style.background = on ? `rgb(${ELEC.amber})` : "#8CA2C0";
      powerPill.style.display = on ? "" : "none";
      if (on) powerTxt.textContent = `세기 ${Math.round(cur * 100)}%`;
    }
  });

  api.setCTA("전류를 켜고 관찰해 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("keydown", onKey);
  };
};
