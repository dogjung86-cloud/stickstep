// coneLab, 뿔의 겉넓이·부피 랩(Ⅴ 입체도형 — 교과서 218~221쪽).
// 국면 3개: 1 원뿔 펼치기(스와이프 → 옆면이 부채꼴임을 발견, 반지름=모선·호=밑면 둘레) →
//   2 겉넓이 조립(r=3, 모선 5: 옆넓이 πrl 판정 → 겉넓이 완성) →
//   3 부피 모래 실험(예측 먼저: 몇 번 부으면 원기둥이 가득? → 3번 → 1/3 발견).
// rAF 금지: 펼침 보간은 pointermove, 붓기 연출은 CSS transition + setTimeout 체인.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, arcPath, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ConeStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 250;

export const coneLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ConeStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "unroll", label: "고깔 펼치기", sub: "옆면의 정체" },
    { id: "surf", label: "겉넓이 조립", sub: "πr²+πrl" },
    { id: "third", label: "모래 실험", sub: "몇 번?" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "mcn-stage" });
  stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none"><g class="mcn-scene"></g></svg>`;
  const panel = el("div", { class: "mcn-panel" });
  const inst = el("div", { class: "mcn-inst" });
  const eqs = el("div", { class: "mcn-eqs" });
  const ctl = el("div", { class: "mcn-ctl" });
  panel.append(inst, eqs, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "생일 고깔을 펼치면 무슨 모양일까요? 직접 펼쳐서 옆면의 정체를 확인해요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const scene = stage.querySelector(".mcn-scene") as SVGGElement;
  const svg = stage.querySelector("svg") as SVGSVGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: 1 | 2 | 3 = 1;
  let t = 0;
  let finished = false;
  let lock = false;
  let dragging = false;
  let lastX = 0;

  const SL = 108; // 모선(픽셀)
  const BR = 52; // 밑면 반지름(픽셀)
  const SPAN = 360 * (BR / SL); // 펼친 부채꼴 중심각(호 = 밑면 둘레)

  /** 펼침 t: 0=접힌 고깔(삼각 실루엣+타원), 1=부채꼴(중심각 SPAN). */
  function render(): void {
    const cx = W / 2;
    if (t < 0.02) {
      const cy = 36;
      scene.innerHTML =
        `<path d="M${cx} ${cy} L${cx - BR} ${cy + 150} A${BR} 16 0 0 0 ${cx + BR} ${cy + 150} Z" fill="#2F9E44" fill-opacity=".16" stroke="${GEO.ink}" stroke-width="2.4" stroke-linejoin="round"/>` +
        `<ellipse cx="${cx}" cy="${cy + 150}" rx="${BR}" ry="16" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2.2"/>` +
        `<text x="${cx}" y="${cy + 196}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GEO.soft}">원뿔(고깔)</text>`;
      return;
    }
    // 부채꼴로 펼침: 꼭짓점 고정, 중심각 0→SPAN 보간
    const span = SPAN * t;
    const cy = 60;
    const a0 = -90 - span / 2;
    const a1 = -90 + span / 2;
    const p0 = polar(cx, cy, SL, a0);
    const p1 = polar(cx, cy, SL, a1);
    scene.innerHTML =
      `<path d="M${cx} ${cy} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${SL} ${SL} 0 ${span > 180 ? 1 : 0} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z" fill="#2F9E44" fill-opacity=".16" stroke="${GEO.ink}" stroke-width="2.4" stroke-linejoin="round"/>` +
      (t > 0.9
        ? `<text x="${cx}" y="${cy - 12}" text-anchor="middle" font-size="12" font-weight="900" fill="#E8547E">부채꼴!</text>` +
          `<text x="${cx + 40}" y="${cy + 48}" font-size="10.5" font-weight="800" fill="${GEO.soft}" transform="rotate(62 ${cx + 40} ${cy + 48})">반지름 = 모선</text>` +
          `<text x="${cx}" y="${cy + SL + 22}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0DA5C6">호 = 밑면 원의 둘레</text>` +
          `<path d="${arcPath(cx, cy, SL + 6, a0, a1)}" stroke="#0DA5C6" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
        : "");
  }

  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    lock = false;
    inst.innerHTML = `밑면 반지름 <b>3cm</b>, 모선 <b>5cm</b>인 원뿔의 <b>옆넓이</b>는? 공식은 방금 펼친 부채꼴 그대로, <b>πrl</b>!`;
    helper.innerHTML = "π×(밑면 반지름)×(모선)에 숫자를 넣어 보세요. 틀려도 왜 아닌지 알려 줄게요!";
    const row = el("div", { class: "mcn-choices" });
    [
      ["15π cm²", true],
      ["9π cm²", false],
      ["25π cm²", false],
    ].forEach(([label, good]) => {
      const b = el("button", { class: "mcn-choice", text: label as string, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished || phase !== 2) return;
        if (good) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          eqs.innerHTML = "";
          eqs.appendChild(el("div", { class: "mcn-eq pop", html: `옆넓이 = π × 3 × 5 = <b>15π</b> cm²` }));
          later(() => {
            eqs.appendChild(
              el("div", { class: "mcn-concl pop", html: `겉넓이 = 밑넓이 + 옆넓이 = 9π + 15π = <b>24π cm²</b>` }),
            );
            chips.on("surf", "24π");
            haptic(HAPTIC.correct);
            later(startPhase3, 1700);
          }, 1300);
        } else {
          haptic(HAPTIC.cross);
          toast(label === "9π cm²" ? "9π는 밑면의 넓이! 옆면은 πrl이에요." : "25π는 π×l², 부채꼴 전체 원의 넓이예요. πrl로!");
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ── 국면 3: 모래 실험 ── */
  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    clear(eqs);
    clear(ctl);
    inst.innerHTML = `밑면도 높이도 <b>똑같은</b> 원뿔 그릇과 원기둥 그릇! 원뿔로 모래를 <b>몇 번</b> 부으면 가득 찰까요?`;
    helper.innerHTML = "찍기 금지, 예측 먼저! 그다음 직접 부어서 확인해요.";
    const cx1 = 96;
    const cx2 = 236;
    const baseY = 196;
    const CH = 120;
    const CR = 44;
    scene.innerHTML =
      // 원뿔 그릇(왼쪽)
      `<path d="M${cx1 - CR} ${baseY - CH} L${cx1} ${baseY} L${cx1 + CR} ${baseY - CH}" stroke="${GEO.ink}" stroke-width="2.4" fill="none"/>` +
      `<ellipse cx="${cx1}" cy="${baseY - CH}" rx="${CR}" ry="12" fill="none" stroke="${GEO.ink}" stroke-width="2.2"/>` +
      `<path class="mcn-sand" d="M${cx1 - CR} ${baseY - CH} L${cx1} ${baseY} L${cx1 + CR} ${baseY - CH} A${CR} 12 0 0 0 ${cx1 - CR} ${baseY - CH} Z" fill="#F2B430" fill-opacity=".55"/>` +
      `<text x="${cx1}" y="${baseY + 22}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GEO.soft}">원뿔 그릇</text>` +
      // 원기둥 그릇(오른쪽) + 채움 게이지
      `<path d="M${cx2 - CR} ${baseY - CH} V${baseY} A${CR} 12 0 0 0 ${cx2 + CR} ${baseY} V${baseY - CH}" stroke="${GEO.ink}" stroke-width="2.4" fill="none"/>` +
      `<ellipse cx="${cx2}" cy="${baseY - CH}" rx="${CR}" ry="12" fill="none" stroke="${GEO.ink}" stroke-width="2.2" stroke-dasharray="5 5"/>` +
      `<g class="mcn-fill"></g>` +
      `<text x="${cx2}" y="${baseY + 22}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GEO.soft}">원기둥 그릇</text>` +
      `<text class="mcn-cnt" x="${cx2}" y="${baseY - CH - 22}" text-anchor="middle" font-size="13" font-weight="900" fill="#1E7A31"></text>`;
    const row = el("div", { class: "mcn-choices" });
    [2, 3, 4].forEach((v) => {
      const b = el("button", { class: "mcn-choice", text: `${v}번`, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished || lock) return;
        lock = true;
        row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
        b.classList.add(v === 3 ? "ok" : "no");
        runPour(v === 3, b);
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정

    function runPour(predictedRight: boolean, chosen: HTMLButtonElement): void {
      const gFill = scene.querySelector(".mcn-fill") as SVGGElement;
      const cnt = scene.querySelector(".mcn-cnt") as SVGTextElement;
      let pours = 0;
      const pourOnce = (): void => {
        pours += 1;
        const hFrac = pours / 3;
        const yTop = baseY - CH * hFrac;
        gFill.innerHTML =
          `<path d="M${cx2 - CR} ${yTop.toFixed(1)} V${baseY} A${CR} 12 0 0 0 ${cx2 + CR} ${baseY} V${yTop.toFixed(1)} A${CR} 12 0 0 0 ${cx2 - CR} ${yTop.toFixed(1)} Z" fill="#F2B430" fill-opacity=".55"/>` +
          `<ellipse cx="${cx2}" cy="${yTop.toFixed(1)}" rx="${CR}" ry="12" fill="#FFD98A" fill-opacity=".8" stroke="#C9861E" stroke-width="1.4"/>`;
        cnt.textContent = `${pours}번째... ${pours === 3 ? "가득!" : ""}`;
        haptic(HAPTIC.tap);
        if (pours < 3) later(pourOnce, 950);
        else {
          haptic(HAPTIC.done);
          later(() => {
            toast(predictedRight ? "예측 명중! 정확히 3번" : "정답은 3번! 뿔은 기둥의 1/3");
            if (!predictedRight) chosen.classList.remove("no");
            eqs.appendChild(
              el("div", {
                class: "mcn-concl pop",
                html: `뿔의 부피 = 기둥의 <b>1/3</b> = 1/3 × 밑넓이 × 높이`,
              }),
            );
            chips.on("third", "3번=1/3");
            later(finish, 1400);
          }, 500);
        }
      };
      inst.innerHTML = "모래를 부어 봐요...";
      later(pourOnce, 400);
    }
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "옆면은 <b>부채꼴(πrl)</b>, 부피는 기둥의 <b>1/3</b>. 뿔의 두 비밀을 모두 손에 넣었어요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* 펼치기 스와이프 */
  svg.addEventListener("pointerdown", (e) => {
    if (lock || finished || phase !== 1) return;
    dragging = true;
    lastX = e.clientX;
    capturePointer(svg, e.pointerId);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging || phase !== 1) return;
    t = Math.min(1, Math.max(0, t + Math.abs(e.clientX - lastX) / 420));
    lastX = e.clientX;
    render();
    if (t >= 1) {
      dragging = false;
      lock = true;
      haptic(HAPTIC.correct);
      chips.on("unroll", "부채꼴!");
      toast("고깔의 정체는 부채꼴! 반지름은 모선과 같아요");
      later(startPhase2, 1600);
    }
  });
  svg.addEventListener("pointerup", () => (dragging = false));
  svg.addEventListener("pointercancel", () => (dragging = false));

  inst.innerHTML = "무대를 <b>좌우로 문질러</b> 고깔을 펼쳐 보세요";
  render();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
