// sectorLab, 부채꼴 랩 2모드(Ⅴ 평면도형).
// ratio(교과서 196~197쪽 부채꼴의 성질): 중심각을 드래그해 2배·3배 미션 → 호·넓이 정비례 발견 →
//   함정 국면 "현도 3배?"(예/아니오) → 30° 현 3개 체인 vs 90° 현 직선 비교로 "현은 정비례 아님".
// calc(교과서 198~199쪽 호의 길이와 넓이): 반지름 스테퍼 + 15° 스냅 다이얼 → 호·넓이가 π 식으로
//   실시간 조립(l=2πr×x/360, S=πr²×x/360) → 목표 만들기 미션 2개(답 조합 여러 개 허용) → S=½rl 보너스.
// 판정은 드롭(pointerup)·버튼에서. 모션은 CSS transition + setTimeout 체인. rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, mfmt, gcd } from "../../ui/mathKit";
import { GEO, polar, angleOf, normDeg, arcPath, dot, ptLabel, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SectorStep {
  title: string;
  lead?: string;
  mode: "ratio" | "calc";
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 268;
const OX = 170;
const OY = 138;

/** 기약분수 π 계수 문자열: coef = num/den(정수 나눗셈), mfmt 마크업. */
function piCoef(num: number, den: number): string {
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return n === 1 ? "π" : `${n}π`;
  return `{${n}/${d}}π`;
}

export const sectorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SectorStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips(
    s.mode === "ratio"
      ? [
          { id: "x2", label: "각을 2배로", sub: "30°→60°" },
          { id: "x3", label: "각을 3배로", sub: "30°→90°" },
          { id: "chord", label: "현의 함정", sub: "3배일까?" },
        ]
      : [
          { id: "arc", label: "호 길이 미션", sub: "2π cm" },
          { id: "area", label: "넓이 미션", sub: "8π cm²" },
          { id: "bonus", label: "지름길 공식", sub: "S=½rl" },
        ],
  );

  const board = mboard(600);
  const stage = el("div", { class: "msc-stage" });
  const panel = el("div", { class: "msc-panel" });
  const inst = el("div", { class: "msc-inst" });
  const meters = el("div", { class: "msc-meters" });
  const ctl = el("div", { class: "msc-ctl" });
  panel.append(inst, meters, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", { class: "helper" });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let finished = false;
  let lock = false;
  let dragging = false;

  function finish(msg: string): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = msg;
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ════════════ ratio 모드 ════════════ */
  function setupRatio(): void {
    const R = 104;
    const BASE = 30; // 기준 중심각
    let x = BASE; // 현재 중심각(기준 반직선 0°에서 반시계)
    let mission: 2 | 3 | 0 = 2; // 0 = 현 국면
    helper.innerHTML = "중심각을 <b>2배</b>로 키우면 케이크 조각(호·넓이)도 2배가 될까요? 직접 벌려 봐요!";
    inst.innerHTML = `미션 1: 손잡이를 돌려 중심각을 <b>60°</b>(2배)로 만들어 보세요`;

    stage.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<circle cx="${OX}" cy="${OY}" r="${R}" stroke="${GEO.faint}" stroke-width="1.6" stroke-dasharray="4 5"/>` +
      `<g class="msc-fill"></g><g class="msc-marks"></g><g class="msc-knob"></g>` +
      `</svg>`;
    const svg = stage.querySelector("svg") as SVGSVGElement;
    const gFill = svg.querySelector(".msc-fill") as SVGGElement;
    const gMarks = svg.querySelector(".msc-marks") as SVGGElement;
    const gKnob = svg.querySelector(".msc-knob") as SVGGElement;

    const chordLen = (deg: number): number => 2 * R * Math.sin((deg * Math.PI) / 360);

    function render(): void {
      const p0 = polar(OX, OY, R, 0);
      const p1 = polar(OX, OY, R, x);
      gFill.innerHTML =
        `<path d="M${OX} ${OY} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${R} ${R} 0 ${x > 180 ? 1 : 0} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z" fill="${GEO.hlA}" opacity=".26"/>` +
        `<path d="${arcPath(OX, OY, R, 0, x)}" stroke="${GEO.hlA}" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<line x1="${OX}" y1="${OY}" x2="${p0.x.toFixed(1)}" y2="${p0.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.6"/>` +
        `<line x1="${OX}" y1="${OY}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.6"/>` +
        `<path d="${arcPath(OX, OY, 26, 0, x)}" stroke="${GEO.hlC}" stroke-width="2.2" fill="none"/>` +
        `${(() => {
          const t = polar(OX, OY, 44, x / 2);
          return `<text x="${t.x.toFixed(1)}" y="${(t.y + 4).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${GEO.hlC}">${Math.round(x)}°</text>`;
        })()}` +
        dot(OX, OY, GEO.pt, 4) +
        ptLabel(OX, OY, "O", -2, 16);
      const knob = polar(OX, OY, R, x);
      gKnob.innerHTML = `<circle cx="${knob.x.toFixed(1)}" cy="${knob.y.toFixed(1)}" r="11" fill="#FFFFFF" stroke="#2F9E44" stroke-width="3"/><circle cx="${knob.x.toFixed(1)}" cy="${knob.y.toFixed(1)}" r="3.2" fill="#2F9E44"/>`;
      // 게이지: 중심각·호·넓이(·현) — 기준 30° 대비 배율
      const ratio = x / BASE;
      const bar = (label: string, mult: number, color: string, warn = false): string =>
        `<div class="msc-meter"><span>${label}</span><i style="width:${Math.min(100, mult * 33.3).toFixed(1)}%; background:${color}"></i><b${warn ? ` class="warn"` : ""}>×${mult.toFixed(2).replace(/\.?0+$/, "")}</b></div>`;
      meters.innerHTML =
        bar("중심각", ratio, GEO.hlC) +
        bar("호 길이", ratio, GEO.hlA) +
        bar("넓이", ratio, "#2F9E44") +
        (mission === 0 ? bar("현 길이", chordLen(x) / chordLen(BASE), GEO.hlB, true) : "");
    }

    function judge(): void {
      const rx = Math.round(x);
      if (mission === 2 && Math.abs(rx - 60) <= 3) {
        x = 60;
        render();
        haptic(HAPTIC.correct);
        chips.on("x2", "호·넓이 ×2");
        toast("중심각 2배, 호도 넓이도 정확히 2배!");
        inst.innerHTML = `미션 2: 이번엔 <b>90°</b>(3배)까지!`;
        mission = 3;
      } else if (mission === 3 && Math.abs(rx - 90) <= 3) {
        x = 90;
        render();
        haptic(HAPTIC.correct);
        chips.on("x3", "정비례!");
        toast("3배면 3배! 호와 넓이는 중심각에 정비례해요");
        mission = 0;
        lock = true;
        later(chordPhase, 1500);
      }
    }

    /* 현의 함정 국면 */
    function chordPhase(): void {
      lock = false;
      render();
      inst.innerHTML = `마지막 질문: 중심각이 3배면 <b>현의 길이</b>도 3배일까요?`;
      helper.innerHTML = "호는 굽은 길, 현은 <b>직선 지름길</b>이에요. 지름길도 똑같이 늘어날까요?";
      const row = el("div", { class: "msc-choices" });
      [["3배가 된다", false], ["3배보다 짧다", true]].forEach(([label, good]) => {
        const b = el("button", { class: "msc-choice", text: label as string, attrs: { type: "button" } }) as HTMLButtonElement;
        b.addEventListener("click", () => {
          if (finished) return;
          row.querySelectorAll("button").forEach((v) => ((v as HTMLButtonElement).disabled = true));
          const c30 = chordLen(30);
          const c90 = chordLen(90);
          // 연출: 30° 현 3개 꺾인 체인 vs 90° 현 직선
          const pA = polar(OX, OY, R, 0);
          const p30 = polar(OX, OY, R, 30);
          const p60 = polar(OX, OY, R, 60);
          const p90 = polar(OX, OY, R, 90);
          gMarks.innerHTML =
            `<path d="M${pA.x.toFixed(1)} ${pA.y.toFixed(1)} L${p30.x.toFixed(1)} ${p30.y.toFixed(1)} L${p60.x.toFixed(1)} ${p60.y.toFixed(1)} L${p90.x.toFixed(1)} ${p90.y.toFixed(1)}" stroke="${GEO.hlB}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
            `<line x1="${pA.x.toFixed(1)}" y1="${pA.y.toFixed(1)}" x2="${p90.x.toFixed(1)}" y2="${p90.y.toFixed(1)}" stroke="${GEO.hlC}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="7 5"/>`;
          if (good) {
            b.classList.add("ok");
            haptic(HAPTIC.correct);
          } else {
            b.classList.add("no");
            haptic(HAPTIC.cross);
          }
          const pct = Math.round((c90 / c30) * 100) / 100;
          inst.innerHTML = `꺾어 가는 길(30° 현 3개)보다 곧장 가는 90° 현이 짧아요. 실제로는 3배가 아니라 <b>약 ${pct}배</b>!`;
          helper.innerHTML = good
            ? "정확해요! 굽은 호는 정직하게 3배가 되지만, <b>현은 지름길이라 3배보다 짧아요</b>. 현의 길이는 중심각에 정비례하지 않아요!"
            : "아쉽지만 현은 <b>3배보다 짧아요</b>. 꺾어 가는 길(30° 현 3개)보다 곧장 가는 길(90° 현)이 짧으니까요. 현의 길이는 중심각에 정비례하지 않아요!";
          chips.on("chord", "정비례 아님");
          later(() => finish("호·넓이는 중심각에 <b>정비례</b>, 현은 <b>아니에요</b>. 부채꼴의 성질, 함정까지 완벽 정복!"), 1600);
        });
        row.appendChild(b);
      });
      clear(ctl);
      ctl.appendChild(row);
    }

    svg.addEventListener("pointerdown", (e) => {
      if (lock || finished || mission === 0) return;
      capturePointer(svg, e.pointerId);
      dragging = true;
    });
    svg.addEventListener("pointermove", (e) => {
      if (!dragging || lock || finished || mission === 0) return;
      const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * W;
      const py = ((e.clientY - rect.top) / rect.height) * H;
      x = Math.min(300, Math.max(10, normDeg(angleOf(OX, OY, px, py))));
      render();
    });
    svg.addEventListener("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      if (!lock && !finished) judge();
    });
    svg.addEventListener("pointercancel", () => (dragging = false));

    render();
  }

  /* ════════════ calc 모드 ════════════ */
  function setupCalc(): void {
    let r = 5; // 반지름(cm 가정)
    let x = 90; // 중심각(15° 스냅)
    let mission: 1 | 2 | 0 = 1;
    helper.innerHTML = "반지름과 중심각, 딱 두 개만 정하면 호의 길이와 넓이가 π로 나와요. 다이얼을 돌려 봐요!";
    inst.innerHTML = `미션 1: 호의 길이가 <b>2π cm</b>인 부채꼴을 만들어 보세요 (조합은 여러 개!)`;

    stage.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<g class="msc-fill"></g><g class="msc-knob"></g>` +
      `</svg>`;
    const svg = stage.querySelector("svg") as SVGSVGElement;
    const gFill = svg.querySelector(".msc-fill") as SVGGElement;
    const gKnob = svg.querySelector(".msc-knob") as SVGGElement;

    // 반지름 스테퍼
    const stepper = el("div", { class: "msc-stepper" });
    const minus = el("button", { class: "msc-step", text: "−", attrs: { type: "button" } }) as HTMLButtonElement;
    const plus = el("button", { class: "msc-step", text: "+", attrs: { type: "button" } }) as HTMLButtonElement;
    const rRead = el("span", { class: "msc-rread" });
    stepper.append(el("span", { class: "msc-rlabel", text: "반지름" }), minus, rRead, plus);
    ctl.appendChild(stepper);

    const RPX = (): number => 30 + r * 9; // 화면 반지름

    function coefArc(): [number, number] {
      return [2 * r * x, 360]; // l = (2rx/360)π
    }
    function coefArea(): [number, number] {
      return [r * r * x, 360]; // S = (r²x/360)π
    }

    function render(): void {
      rRead.textContent = `${r} cm`;
      const RP = RPX();
      const p0 = polar(OX, OY, RP, 0);
      const p1 = polar(OX, OY, RP, x);
      gFill.innerHTML =
        `<circle cx="${OX}" cy="${OY}" r="${RP}" stroke="${GEO.faint}" stroke-width="1.6" stroke-dasharray="4 5"/>` +
        `<path d="M${OX} ${OY} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${RP} ${RP} 0 ${x > 180 ? 1 : 0} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z" fill="#2F9E44" opacity=".2"/>` +
        `<path d="${arcPath(OX, OY, RP, 0, x)}" stroke="#2F9E44" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<line x1="${OX}" y1="${OY}" x2="${p0.x.toFixed(1)}" y2="${p0.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.4"/>` +
        `<line x1="${OX}" y1="${OY}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" stroke="${GEO.ink}" stroke-width="2.4"/>` +
        (() => {
          const t = polar(OX, OY, Math.max(30, RP * 0.42), x / 2);
          return `<text x="${t.x.toFixed(1)}" y="${(t.y + 4).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="900" fill="${GEO.hlC}">${x}°</text>`;
        })() +
        (() => {
          const m = polar(OX, OY, RP / 2, x);
          const off = polar(0, 0, 11, x + 90);
          return `<text x="${(m.x + off.x).toFixed(1)}" y="${(m.y + off.y + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GEO.soft}">${r}cm</text>`;
        })() +
        dot(OX, OY, GEO.pt, 4);
      const knob = polar(OX, OY, RP, x);
      gKnob.innerHTML = `<circle cx="${knob.x.toFixed(1)}" cy="${knob.y.toFixed(1)}" r="11" fill="#FFFFFF" stroke="#2F9E44" stroke-width="3"/><circle cx="${knob.x.toFixed(1)}" cy="${knob.y.toFixed(1)}" r="3.2" fill="#2F9E44"/>`;
      const [ln, ld] = coefArc();
      const [sn, sd] = coefArea();
      meters.innerHTML =
        `<div class="msc-formula">${mfmt(`2π×${r}×{${x}/360}`)} = <b>${mfmt(piCoef(ln, ld))}</b><span>호 길이(cm)</span></div>` +
        `<div class="msc-formula">${mfmt(`π×${r}^2×{${x}/360}`)} = <b>${mfmt(piCoef(sn, sd))}</b><span>넓이(cm²)</span></div>`;
    }

    function judge(): void {
      const [ln, ld] = coefArc();
      const [sn, sd] = coefArea();
      if (mission === 1 && ln / ld === 2) {
        haptic(HAPTIC.correct);
        chips.on("arc", `r${r}·${x}°`);
        toast(`명중! 2π×${r}×${x}/360 = 2π`);
        inst.innerHTML = `미션 2: 이번엔 넓이가 <b>8π cm²</b>가 되게!`;
        mission = 2;
      } else if (mission === 2 && sn / sd === 8) {
        haptic(HAPTIC.correct);
        chips.on("area", `r${r}·${x}°`);
        toast(`명중! π×${r}²×${x}/360 = 8π`);
        mission = 0;
        lock = true;
        later(bonusPhase, 1300);
      }
    }

    /* 보너스: S = ½rl */
    function bonusPhase(): void {
      const [ln, ld] = coefArc();
      const [sn, sd] = coefArea();
      inst.innerHTML = `보너스 발견: 지금 부채꼴에서 <b>½ × r × l</b>을 계산해 보면?`;
      const btn = el("button", { class: "msc-btn pulse", text: "계산해 보기", attrs: { type: "button" } }) as HTMLButtonElement;
      clear(ctl);
      ctl.appendChild(btn);
      btn.addEventListener("click", () => {
        btn.disabled = true;
        haptic(HAPTIC.correct);
        meters.insertAdjacentHTML(
          "beforeend",
          `<div class="msc-formula pop">${mfmt(`{1/2}×${r}×`)}${mfmt(piCoef(ln, ld))} = <b>${mfmt(piCoef(sn, sd))}</b><span>넓이와 똑같아요!</span></div>`,
        );
        helper.innerHTML = "반지름과 호의 길이만 알면 중심각 없이도 넓이가 나와요. <b>S=½rl</b>, 시험이 사랑하는 지름길 공식!";
        chips.on("bonus", "확인!");
        later(() => finish("호는 2πr의 조각, 넓이는 πr²의 조각. 나누는 비율은 둘 다 <b>x/360</b>, 그리고 지름길 S=½rl까지!"), 1500);
      });
    }

    minus.addEventListener("click", () => {
      if (lock || finished || r <= 3) return;
      r -= 1;
      haptic(HAPTIC.tap);
      render();
      judge();
    });
    plus.addEventListener("click", () => {
      if (lock || finished || r >= 9) return;
      r += 1;
      haptic(HAPTIC.tap);
      render();
      judge();
    });

    svg.addEventListener("pointerdown", (e) => {
      if (lock || finished || mission === 0) return;
      capturePointer(svg, e.pointerId);
      dragging = true;
    });
    svg.addEventListener("pointermove", (e) => {
      if (!dragging || lock || finished || mission === 0) return;
      const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * W;
      const py = ((e.clientY - rect.top) / rect.height) * H;
      x = Math.min(345, Math.max(15, Math.round(normDeg(angleOf(OX, OY, px, py)) / 15) * 15));
      render();
    });
    svg.addEventListener("pointerup", () => {
      if (!dragging) return;
      dragging = false;
      if (!lock && !finished) judge();
    });
    svg.addEventListener("pointercancel", () => (dragging = false));

    render();
  }

  if (s.mode === "ratio") setupRatio();
  else setupCalc();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
