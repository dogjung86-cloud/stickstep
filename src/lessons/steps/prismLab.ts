// prismLab, 기둥의 겉넓이·부피 랩(Ⅴ 입체도형 — 교과서 214~217쪽).
// 국면 3개: 1 원기둥 전개도 펼치기(가로 스와이프 → 옆면 직사각형의 가로 = 밑면 둘레 발견) →
//   2 겉넓이 조립(r=3, h=5: 옆면 가로 판정 → 밑넓이×2+옆넓이 카드 완성) →
//   3 부피 층 쌓기(밑넓이 9π를 한 층씩 5층 → 45π, 부피=밑넓이×높이).
// rAF 금지: 펼침 보간은 pointermove에서만, 연출은 CSS transition + setTimeout 체인.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface PrismStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 250;

export const prismLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PrismStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "unroll", label: "전개도 펼치기", sub: "옆면의 정체" },
    { id: "surf", label: "겉넓이 조립", sub: "밑×2+옆" },
    { id: "vol", label: "부피 쌓기", sub: "밑넓이×높이" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "mpr-stage" });
  stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none"><g class="mpr-scene"></g></svg>`;
  const panel = el("div", { class: "mpr-panel" });
  const inst = el("div", { class: "mpr-inst" });
  const eqs = el("div", { class: "mpr-eqs" });
  const ctl = el("div", { class: "mpr-ctl" });
  panel.append(inst, eqs, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "겉넓이의 비밀 병기는 <b>전개도</b>! 통조림 라벨을 뜯듯 원기둥을 펼쳐 봐요.",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const scene = stage.querySelector(".mpr-scene") as SVGGElement;
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
  let t = 0; // 펼침 진행도 0~1
  let finished = false;
  let lock = false;
  let dragging = false;
  let lastX = 0;

  const R = 38; // 밑면 반지름(픽셀)
  const HH = 96; // 높이(픽셀)
  const CIRC = 2 * Math.PI * R; // 펼친 옆면 가로

  /** 펼침 t 상태 렌더: 옆면 사각형(가로 2R→CIRC 보간) + 밑면 원 2개(옆→위아래로 이동). */
  function render(): void {
    const w = 2 * R + (CIRC - 2 * R) * t;
    const cx = W / 2;
    const cy = H / 2 + 6;
    const rectY = cy - HH / 2;
    const ry = 12 * (1 - t) + 2 * t;
    // 밑면 원: t=0이면 몸통 위아래 타원, t=1이면 분리된 정원
    const topY = rectY - (12 + (R - 4) * t);
    const botY = rectY + HH + (12 + (R - 4) * t);
    const rr = R * (0.98 + 0.02 * t);
    scene.innerHTML =
      `<rect x="${(cx - w / 2).toFixed(1)}" y="${rectY}" width="${w.toFixed(1)}" height="${HH}" fill="#2F9E44" fill-opacity=".16" stroke="${GEO.ink}" stroke-width="2.4"/>` +
      `<ellipse cx="${cx}" cy="${topY.toFixed(1)}" rx="${rr.toFixed(1)}" ry="${(ry + (rr - ry) * t).toFixed(1)}" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2.2"/>` +
      `<ellipse cx="${cx}" cy="${botY.toFixed(1)}" rx="${rr.toFixed(1)}" ry="${(ry + (rr - ry) * t).toFixed(1)}" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2.2"/>` +
      (t > 0.85
        ? `<path d="M${(cx - w / 2).toFixed(1)} ${rectY - 8} H${(cx + w / 2).toFixed(1)}" stroke="#E8547E" stroke-width="2.2" marker-start="none"/>` +
          `<text x="${cx}" y="${rectY - 14}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#E8547E">가로 = 밑면 둘레!</text>`
        : "") +
      `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${GEO.soft}">${t < 0.5 ? "원기둥" : "옆면(직사각형)"}</text>`;
  }

  function startPhase1(): void {
    inst.innerHTML = "무대를 <b>좌우로 문질러</b> 원기둥 라벨을 끝까지 펼쳐 보세요";
    render();
  }

  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    lock = false;
    inst.innerHTML = `반지름 <b>3cm</b>, 높이 <b>5cm</b> 원기둥이라면, 옆면 직사각형의 <b>가로</b>는? 힌트: 가로는 밑면 원이 한 바퀴 구른 길이, 즉 <b>둘레 2πr</b>!`;
    helper.innerHTML = "라벨을 펼치던 그 장면을 떠올리며 골라 보세요!";
    const row = el("div", { class: "mpr-choices" });
    [
      ["6π cm", true],
      ["9π cm", false],
      ["3 cm", false],
    ].forEach(([label, good]) => {
      const b = el("button", { class: "mpr-choice", html: label as string, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished || phase !== 2) return;
        if (good) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          eqs.innerHTML = "";
          eqs.appendChild(el("div", { class: "mpr-eq pop", html: `옆넓이 = 6π × 5 = <b>30π</b> cm²` }));
          later(() => {
            eqs.appendChild(
              el("div", { class: "mpr-concl pop", html: `겉넓이 = 밑넓이×2 + 옆넓이 = 9π×2 + 30π = <b>48π cm²</b>` }),
            );
            chips.on("surf", "48π");
            haptic(HAPTIC.correct);
            later(startPhase3, 1700);
          }, 1300);
        } else {
          haptic(HAPTIC.cross);
          toast(label === "9π cm" ? "9π는 밑면의 넓이! 가로는 둘레 2πr이에요." : "3cm는 반지름! 한 바퀴 구른 길이는 2πr이에요.");
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
  }

  /* ── 국면 3: 부피 층 쌓기 ── */
  let layers = 0;
  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    clear(eqs);
    clear(ctl);
    inst.innerHTML = `부피는 <b>밑넓이(9π cm²) 층을 높이만큼</b> 쌓은 것! 5층을 쌓아 보세요`;
    helper.innerHTML = "1cm 두께의 팬케이크를 쌓듯이. 한 층에 9π씩!";
    const cx = W / 2;
    const baseY = H - 42;
    scene.innerHTML =
      `<ellipse cx="${cx}" cy="${baseY}" rx="${R}" ry="12" fill="none" stroke="${GEO.faint}" stroke-width="1.8" stroke-dasharray="5 5"/>` +
      `<g class="mpr-layers"></g>` +
      `<text class="mpr-vol" x="${cx}" y="34" text-anchor="middle" font-size="14" font-weight="900" fill="#1E7A31">부피: 0</text>`;
    const btn = el("button", { class: "mpr-btn pulse", text: "한 층 쌓기 (+9π)", attrs: { type: "button" } }) as HTMLButtonElement;
    ctl.appendChild(btn);
    const gL = scene.querySelector(".mpr-layers") as SVGGElement;
    const vol = scene.querySelector(".mpr-vol") as SVGTextElement;
    btn.addEventListener("click", () => {
      if (finished || layers >= 5) return;
      haptic(HAPTIC.tap);
      const y = baseY - layers * 19 - 9;
      gL.insertAdjacentHTML(
        "beforeend",
        `<g class="mpr-lay" style="opacity:0; transition: opacity .3s">` +
          `<path d="M${cx - R} ${y} v-14 a${R} 12 0 0 0 ${2 * R} 0 v14" fill="#2F9E44" fill-opacity=".2" stroke="none"/>` +
          `<ellipse cx="${cx}" cy="${y - 14}" rx="${R}" ry="12" fill="#7ACF8B" fill-opacity=".5" stroke="#1E7A31" stroke-width="1.8"/>` +
          `<path d="M${cx - R} ${y - 14} v14 a${R} 12 0 0 0 ${2 * R} 0 v-14" fill="none" stroke="#1E7A31" stroke-width="1.8"/>` +
          `</g>`,
      );
      later(() => ((gL.lastElementChild as SVGGElement).style.opacity = "1"), 20);
      layers += 1;
      vol.textContent = `부피: 9π × ${layers} = ${9 * layers}π`;
      if (layers >= 5) {
        haptic(HAPTIC.done);
        btn.disabled = true;
        toast("5층 완성! 부피 45π cm³");
        eqs.appendChild(
          el("div", { class: "mpr-concl pop", html: `부피 = 밑넓이 × 높이 = 9π × 5 = <b>45π cm³</b>` }),
        );
        chips.on("vol", "45π");
        later(finish, 1300);
      }
    });
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "겉넓이는 <b>펼쳐서</b>(밑×2+옆), 부피는 <b>쌓아서</b>(밑넓이×높이). 기둥 완전 정복!";
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
      chips.on("unroll", "직사각형!");
      toast("옆면의 정체는 직사각형, 가로는 밑면 둘레!");
      later(startPhase2, 1500);
    }
  });
  svg.addEventListener("pointerup", () => (dragging = false));
  svg.addEventListener("pointercancel", () => (dragging = false));

  startPhase1();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
