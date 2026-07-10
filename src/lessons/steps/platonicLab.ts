// platonicLab, 정다면체 조립소(Ⅴ 입체도형 기함 — 교과서 208~209쪽 정다면체가 5종뿐인 이유).
// 한 꼭짓점에 정k각형 n개를 부채처럼 모으고 "접기"를 시도한다:
//   내각 합 < 360° → 접혀서 입체(해당 정다면체 3D 등장 + 도감 등록),
//   = 360° → 평평해서 실패(흔들 연출), > 360° → 겹쳐서 실패(빨강 깜빡), n<3 → 납작 실패.
// 도감 5칸(정사면체·정팔면체·정이십면체·정육면체·정십이면체)을 다 채우고
// 실패도 2회 체험하면 완료 — "왜 다섯뿐인가"를 손으로 증명하는 랩.
// 3D는 solidKit(드래그 회전, rAF 금지), 모션은 CSS transition + setTimeout 체인.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { capturePointer } from "../../ui/geoKit";
import { PLATONIC, solidSvg, type Solid } from "../../ui/solidKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface PlatStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 236;
const PX = 170; // 모으는 꼭짓점
const PY = 128;
const SIDE = 56; // 부채 도형 한 변

/* 정k각형 내각 */
const inner = (k: number): number => (180 * (k - 2)) / k;

/* (성공 조합) → 정다면체 */
const RESULT: Record<string, { key: keyof typeof PLATONIC; name: string; scale: number }> = {
  "3-3": { key: "tetra", name: "정사면체", scale: 46 },
  "3-4": { key: "octa", name: "정팔면체", scale: 56 },
  "3-5": { key: "icosa", name: "정이십면체", scale: 38 },
  "4-3": { key: "cube", name: "정육면체", scale: 38 },
  "5-3": { key: "dodeca", name: "정십이면체", scale: 26 },
};
const GALLERY_ORDER = ["3-3", "3-4", "3-5", "4-3", "5-3"];

/** 꼭짓점 P에서 시작각 aDeg로 출발하는 정k각형 경로(터틀). */
function polyAt(px: number, py: number, aDeg: number, s: number, k: number): string {
  const ext = 360 / k;
  let x = px;
  let y = py;
  let h = aDeg;
  let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
  for (let i = 0; i < k - 1; i++) {
    x += s * Math.cos((h * Math.PI) / 180);
    y -= s * Math.sin((h * Math.PI) / 180);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    h += ext;
  }
  return d + " Z";
}

export const platonicLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PlatStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "tri", label: "세모 삼형제", sub: "0/3" },
    { id: "sq", label: "네모·오각", sub: "0/2" },
    { id: "fail", label: "실패의 이유", sub: "360° 이상" },
  ]);

  const board = mboard(640);
  const stage = el("div", { class: "mpt-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="mpt-fan"></g><g class="mpt-solid"></g>` +
    `<text class="mpt-sum" x="${PX}" y="26" text-anchor="middle" font-size="13.5" font-weight="900" fill="#1E7A31"></text>` +
    `</svg>`;
  const gallery = el("div", { class: "mpt-gallery" });
  GALLERY_ORDER.forEach((key) => {
    gallery.appendChild(
      el("div", { class: "mpt-slot", dataset: { key } }, el("i", { html: "?" }), el("span", { text: RESULT[key].name })),
    );
  });
  const panel = el("div", { class: "mpt-panel" });
  const inst = el("div", { class: "mpt-inst", html: "한 꼭짓점에 <b>정삼각형 3개</b>를 모아 봤어요. 접힐까요?" });
  const ctl = el("div", { class: "mpt-ctl" });
  panel.append(inst, ctl);
  board.append(stage, gallery, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "입체가 되려면 꼭짓점이 <b>접혀야</b> 해요. 몇 개를 모아야 접히고, 몇 개면 실패할까요? 도감 5칸을 모두 채워요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gFan = svg.querySelector(".mpt-fan") as SVGGElement;
  const gSolid = svg.querySelector(".mpt-solid") as SVGGElement;
  const sumText = svg.querySelector(".mpt-sum") as SVGTextElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let k = 3; // 도형(정k각형)
  let n = 3; // 개수
  let lock = false;
  let finished = false;
  const built = new Set<string>();
  const triDone = new Set<number>();
  const sqDone = new Set<number>();
  let failSeen = 0;
  let ry = -0.55;
  let rx = -0.35;
  let curSolid: Solid | null = null;
  let curScale = 40;
  let dragging = false;
  let px0 = 0;
  let py0 = 0;

  const FILLS = ["#F08C00", "#0DA5C6", "#E8547E", "#2F9E44", "#7C5CE8", "#C2255C"];

  function drawFan(): void {
    gSolid.innerHTML = "";
    curSolid = null;
    const a = inner(k);
    let fan = "";
    for (let i = 0; i < n; i++) {
      fan += `<path class="mpt-pc" d="${polyAt(PX, PY, i * a, SIDE, k)}" fill="${FILLS[i % FILLS.length]}" fill-opacity=".3" stroke="${FILLS[i % FILLS.length]}" stroke-width="2" stroke-linejoin="round" style="transform-origin:${PX}px ${PY}px"/>`;
    }
    fan += `<circle cx="${PX}" cy="${PY}" r="4" fill="#334155"/>`;
    gFan.innerHTML = fan;
    const total = Math.round(a * n);
    sumText.textContent = `${Math.round(a)}° × ${n} = ${total}°`;
    sumText.setAttribute("fill", total < 360 ? "#1E7A31" : "#C2255C");
  }

  function drawSolid(): void {
    if (!curSolid) return;
    gSolid.innerHTML = solidSvg(curSolid, ry, rx, {
      cx: PX,
      cy: PY,
      scale: curScale,
      faceFill: "#2F9E44",
      faceOpacity: 0.09,
    });
  }

  function updateChips(): void {
    chips.el.querySelector(`[data-g="tri"] span`)!.textContent = `${triDone.size}/3`;
    chips.el.querySelector(`[data-g="sq"] span`)!.textContent = `${sqDone.size}/2`;
    if (triDone.size >= 3) chips.on("tri", "3·4·5!");
    if (sqDone.size >= 2) chips.on("sq", "3개씩!");
    if (failSeen >= 2) chips.on("fail", "겹치거나 평평");
    if (built.size >= 5 && failSeen >= 2) later(finish, 900);
  }

  function tryFold(): void {
    if (lock || finished) return;
    const a = inner(k);
    const total = Math.round(a * n);
    const key = `${k}-${n}`;
    lock = true;
    if (n < 3) {
      haptic(HAPTIC.cross);
      toast("면 2개는 접으면 납작하게 붙어요. 입체가 되려면 3개부터!");
      failSeen += 1;
      updateChips();
      lock = false;
      return;
    }
    if (total > 360) {
      haptic(HAPTIC.cross);
      const pcs = gFan.querySelectorAll(".mpt-pc");
      const last = pcs[pcs.length - 1] as SVGPathElement;
      last.style.transition = "fill-opacity .18s";
      let blink = 0;
      const flick = (): void => {
        last.style.fillOpacity = blink % 2 === 0 ? "0.75" : "0.3";
        last.setAttribute("stroke", blink % 2 === 0 ? "#F04452" : FILLS[(n - 1) % FILLS.length]);
        blink += 1;
        if (blink < 5) later(flick, 190);
      };
      flick();
      toast(`${Math.round(a)}°×${n}=${total}°, 360°를 넘어 서로 겹쳐요!`);
      inst.innerHTML = `한 꼭짓점 둘레는 <b>360°</b>가 한계, 넘치면 겹쳐서 접을 수 없어요`;
      failSeen += 1;
      updateChips();
      later(() => (lock = false), 1100);
      return;
    }
    if (total === 360) {
      haptic(HAPTIC.cross);
      (gFan as unknown as SVGGElement).style.transition = "transform .3s";
      gFan.style.transformOrigin = `${PX}px ${PY}px`;
      gFan.style.transform = "rotate(3deg)";
      later(() => (gFan.style.transform = "rotate(-3deg)"), 300);
      later(() => (gFan.style.transform = ""), 600);
      toast(`딱 360°, 바닥에 쫙 펴진 평면! 접을 틈이 없어요.`);
      inst.innerHTML = `합이 정확히 <b>360°</b>면 타일처럼 평평, 입체가 못 돼요`;
      failSeen += 1;
      updateChips();
      later(() => (lock = false), 1100);
      return;
    }
    // 성공: 오므라드는 연출 → 3D 등장
    const res = RESULT[key];
    if (!res) {
      lock = false;
      return;
    }
    haptic(HAPTIC.correct);
    gFan.querySelectorAll(".mpt-pc").forEach((p, i) => {
      const e = p as SVGPathElement;
      e.style.transition = "transform .7s cubic-bezier(.34,1.2,.5,1), opacity .7s";
      later(() => {
        e.style.transform = `rotate(${(i - (n - 1) / 2) * -6}deg) scale(.62)`;
        e.style.opacity = "0";
      }, 60);
    });
    later(() => {
      gFan.innerHTML = "";
      curSolid = PLATONIC[res.key];
      curScale = res.scale;
      ry = -0.55;
      rx = -0.35;
      drawSolid();
      toast(`접혔다! ${res.name} 완성`);
      inst.innerHTML = `<b>${res.name}</b> 완성! 드래그로 돌려 보고, 다음 조합에 도전해요`;
      if (!built.has(key)) {
        built.add(key);
        if (k === 3) triDone.add(n);
        else sqDone.add(k);
        const slot = gallery.querySelector(`[data-key="${key}"]`) as HTMLElement;
        slot.classList.add("on");
        (slot.querySelector("i") as HTMLElement).innerHTML =
          `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">` +
          solidSvg(PLATONIC[res.key], -0.55, -0.35, { cx: 32, cy: 32, scale: res.scale * 0.5, width: 1.8 }) +
          `</svg>`;
        haptic(HAPTIC.done);
      }
      updateChips();
      lock = false;
    }, 850);
  }

  /* ── 컨트롤: 도형 세그 + 개수 스테퍼 + 접기 ── */
  const seg = el("div", { class: "mpt-seg" });
  const KS = [
    { k: 3, name: "정삼각형" },
    { k: 4, name: "정사각형" },
    { k: 5, name: "정오각형" },
    { k: 6, name: "정육각형" },
  ];
  KS.forEach(({ k: kk, name }) => {
    const b = el("button", { class: `mpt-segbtn${kk === 3 ? " on" : ""}`, text: name, attrs: { type: "button" } }) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (lock || finished) return;
      haptic(HAPTIC.tap);
      k = kk;
      n = 3;
      nRead.textContent = `${n}개`;
      seg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      inst.innerHTML = `<b>${name}</b>(한 각 ${Math.round(inner(kk))}°)을 모아 봐요. 몇 개면 접힐까요?`;
      drawFan();
    });
    seg.appendChild(b);
  });
  const stepper = el("div", { class: "mpt-stepper" });
  const minus = el("button", { class: "mpt-step", text: "−", attrs: { type: "button" } }) as HTMLButtonElement;
  const plus = el("button", { class: "mpt-step", text: "+", attrs: { type: "button" } }) as HTMLButtonElement;
  const nRead = el("span", { class: "mpt-nread", text: "3개" });
  const foldBtn = el("button", { class: "mpt-fold pulse", text: "접기!", attrs: { type: "button" } }) as HTMLButtonElement;
  stepper.append(minus, nRead, plus, foldBtn);
  minus.addEventListener("click", () => {
    if (lock || finished || n <= 2) return;
    n -= 1;
    nRead.textContent = `${n}개`;
    haptic(HAPTIC.tap);
    drawFan();
  });
  plus.addEventListener("click", () => {
    if (lock || finished || n >= 6) return;
    n += 1;
    nRead.textContent = `${n}개`;
    haptic(HAPTIC.tap);
    drawFan();
  });
  foldBtn.addEventListener("click", tryFold);
  ctl.append(seg, stepper);

  /* 3D 드래그 회전 */
  svg.addEventListener("pointerdown", (e) => {
    if (!curSolid) return;
    dragging = true;
    px0 = e.clientX;
    py0 = e.clientY;
    capturePointer(svg, e.pointerId);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging || !curSolid) return;
    ry += (e.clientX - px0) * 0.011;
    rx -= (e.clientY - py0) * 0.011;
    rx = Math.max(-1.3, Math.min(1.3, rx));
    px0 = e.clientX;
    py0 = e.clientY;
    drawSolid();
  });
  svg.addEventListener("pointerup", () => (dragging = false));
  svg.addEventListener("pointercancel", () => (dragging = false));

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "접히려면 <b>합이 360° 미만</b>, 그 조합은 딱 다섯 가지. 그래서 정다면체는 우주에 5종뿐이에요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  drawFan();
  api.setCTA("도감 5칸 + 실패 2회를 채우면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
