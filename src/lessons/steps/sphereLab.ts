// sphereLab, 구의 겉넓이·부피 랩(Ⅴ 입체도형 — 교과서 222~224쪽).
// 국면 3개: 1 오렌지 껍질 실험(예측 먼저: 껍질로 단면 원 몇 개? → 조각들이 날아가 4개 채움 → 4πr²) →
//   2 물 실험(예측: 구의 물이 꼭 맞는 원기둥의 얼마? → 2/3 → V=4/3πr³ 유도 카드) →
//   3 마무리 계산 미션(반지름 3cm 구: 겉넓이도 부피도 36π, 숫자의 우연).
// rAF 금지: 연출은 CSS transition + setTimeout 체인(타이머 Set 일괄 해제).

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, mfmt } from "../../ui/mathKit";
import { GEO } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface SphereStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 240;

export const sphereLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SphereStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "peel", label: "껍질 실험", sub: "원 몇 개?" },
    { id: "water", label: "물 실험", sub: "기둥의 얼마?" },
    { id: "calc", label: "36π의 우연", sub: "r=3" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "msp-stage" });
  stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none"><g class="msp-scene"></g></svg>`;
  const panel = el("div", { class: "msp-panel" });
  const inst = el("div", { class: "msp-inst" });
  const eqs = el("div", { class: "msp-eqs" });
  const ctl = el("div", { class: "msp-ctl" });
  panel.append(inst, eqs, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "구는 펼칠 수 없는 유일한 도형! 그래서 실험으로 잰답니다. 오렌지 한 알이면 충분해요.",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const scene = stage.querySelector(".msp-scene") as SVGGElement;

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

  function choiceRow(
    labels: string[],
    goodIdx: number,
    onGood: (btn: HTMLButtonElement) => void,
    wrongMsg: (label: string) => string,
  ): HTMLElement {
    const row = el("div", { class: "msp-choices" });
    labels.forEach((label, i) => {
      const b = el("button", { class: "msp-choice", html: label, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished || lock) return;
        if (i === goodIdx) {
          lock = true;
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          onGood(b);
        } else {
          haptic(HAPTIC.cross);
          toast(wrongMsg(label));
        }
      });
      row.appendChild(b);
    });
    return row;
  }

  /* ── 국면 1: 오렌지 껍질 ── */
  function startPeel(): void {
    inst.innerHTML = `구 모양 오렌지의 <b>껍질 전부</b>로, 반 자른 단면과 같은 원을 <b>몇 개</b> 채울 수 있을까요?`;
    const or = 36;
    const cy = 120;
    scene.innerHTML =
      // 왼쪽: 반 자른 오렌지(단면)
      `<circle cx="64" cy="${cy}" r="${or}" fill="#F2A64C" stroke="#C9722A" stroke-width="2.4"/>` +
      `<circle cx="64" cy="${cy}" r="${or - 7}" fill="#FBD9A8"/>` +
      Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return `<path d="M64 ${cy} L${(64 + (or - 9) * Math.cos(a)).toFixed(1)} ${(cy - (or - 9) * Math.sin(a)).toFixed(1)}" stroke="#F2A64C" stroke-width="2"/>`;
      }).join("") +
      `<text x="64" y="${cy + or + 20}" text-anchor="middle" font-size="11" font-weight="800" fill="${GEO.soft}">반지름 r인 단면</text>` +
      // 오른쪽: 빈 원 4칸(2×2)
      `<g class="msp-slots">` +
      [0, 1, 2, 3]
        .map((i) => {
          const x = 182 + (i % 2) * 82;
          const y = 78 + Math.floor(i / 2) * 84;
          return `<circle class="msp-slot" data-i="${i}" cx="${x}" cy="${y}" r="${or}" fill="none" stroke="${GEO.faint}" stroke-width="2" stroke-dasharray="6 6"/>`;
        })
        .join("") +
      `</g><g class="msp-peel"></g>`;
    const row = choiceRow(
      ["2개", "3개", "4개"],
      2,
      () => runPeel(),
      (l) => (l === "2개" ? "더 넉넉해요! 구의 겉은 생각보다 넓어요." : "3개보다 많아요! 껍질을 다 벗겨 확인해요."),
    );
    clear(ctl);
    ctl.appendChild(row);
  }

  function runPeel(): void {
    inst.innerHTML = "껍질을 벗겨 원을 채워 봐요...";
    const gPeel = scene.querySelector(".msp-peel") as SVGGElement;
    const or = 36;
    [0, 1, 2, 3].forEach((i) => {
      later(() => {
        const x = 182 + (i % 2) * 82;
        const y = 78 + Math.floor(i / 2) * 84;
        gPeel.insertAdjacentHTML(
          "beforeend",
          `<g style="opacity:0; transition: opacity .4s">` +
            `<circle cx="${x}" cy="${y}" r="${or}" fill="#F2A64C" fill-opacity=".82" stroke="#C9722A" stroke-width="2"/>` +
            `<path d="M${x - 20} ${y - 8} q10 -12 24 -6 M${x - 12} ${y + 14} q14 8 26 -2" stroke="#C9722A" stroke-width="1.6" fill="none" opacity=".6"/>` +
            `</g>`,
        );
        later(() => ((gPeel.lastElementChild as SVGGElement).style.opacity = "1"), 20);
        haptic(HAPTIC.tap);
        if (i === 3) {
          later(() => {
            haptic(HAPTIC.done);
            toast("껍질 한 알 = 원 4개, 딱 맞게 끝!");
            eqs.appendChild(
              el("div", { class: "msp-concl pop", html: `구의 겉넓이 = 원 넓이의 4배 = <b>4πr²</b>` }),
            );
            chips.on("peel", "4개!");
            later(startWater, 1800);
          }, 500);
        }
      }, 500 + i * 750);
    });
  }

  /* ── 국면 2: 물 실험 ── */
  function startWater(): void {
    if (finished) return;
    lock = false;
    clear(eqs);
    inst.innerHTML = `구가 <b>꼭 맞게 들어가는</b> 원기둥 그릇! 구 안의 물을 부으면 그릇의 <b>얼마</b>가 찰까요?`;
    helper.innerHTML = "구의 지름 = 그릇의 높이 = 그릇의 지름. 예측 먼저!";
    const cy = 128;
    const r = 40;
    scene.innerHTML =
      // 왼쪽: 물이 가득한 구
      `<circle cx="72" cy="${cy}" r="${r}" fill="#7CC4E8" fill-opacity=".5" stroke="${GEO.ink}" stroke-width="2.4"/>` +
      `<ellipse cx="72" cy="${cy}" rx="${r}" ry="10" fill="none" stroke="#5AA8D0" stroke-width="1.4" stroke-dasharray="4 4"/>` +
      `<text x="72" y="${cy + r + 20}" text-anchor="middle" font-size="11" font-weight="800" fill="${GEO.soft}">물이 가득한 구</text>` +
      // 오른쪽: 원기둥(높이 2r) + 눈금
      `<g class="msp-cup">` +
      `<path d="M${196 - r} ${cy - r} V${cy + r} A${r} 11 0 0 0 ${196 + r} ${cy + r} V${cy - r}" stroke="${GEO.ink}" stroke-width="2.4" fill="none"/>` +
      `<ellipse cx="196" cy="${cy - r}" rx="${r}" ry="11" fill="none" stroke="${GEO.ink}" stroke-width="2" stroke-dasharray="5 5"/>` +
      [1, 2].map((k) => `<line x1="${196 - r}" y1="${(cy + r - (2 * r * k) / 3).toFixed(1)}" x2="${196 - r + 10}" y2="${(cy + r - (2 * r * k) / 3).toFixed(1)}" stroke="${GEO.soft}" stroke-width="2"/>`).join("") +
      `<g class="msp-water"></g></g>` +
      `<text x="196" y="${cy + r + 20}" text-anchor="middle" font-size="11" font-weight="800" fill="${GEO.soft}">꼭 맞는 원기둥</text>`;
    const row = choiceRow(
      [mfmt("{1/2}"), mfmt("{2/3}"), mfmt("{3/4}")],
      1,
      () => runWater(),
      (l) => (l.includes("1") ? "절반보다는 빵빵해요, 구는 통통하니까!" : "3/4까지는 안 돼요. 사이 어딘가!"),
    );
    clear(ctl);
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function runWater(): void {
    inst.innerHTML = "물을 부어 봐요...";
    const cy = 128;
    const r = 40;
    const gW = scene.querySelector(".msp-water") as SVGGElement;
    const yTop = cy + r - (2 * r * 2) / 3;
    gW.innerHTML =
      `<path class="msp-wfill" d="M${196 - r} ${cy + r} A${r} 11 0 0 0 ${196 + r} ${cy + r} Z" fill="#7CC4E8" fill-opacity=".55"/>`;
    const fill = gW.querySelector(".msp-wfill") as SVGPathElement;
    fill.style.transition = "d .1s";
    let stepi = 0;
    const rise = (): void => {
      stepi += 1;
      const y = cy + r - ((cy + r - yTop) * stepi) / 8;
      gW.innerHTML =
        `<path d="M${196 - r} ${y.toFixed(1)} V${cy + r} A${r} 11 0 0 0 ${196 + r} ${cy + r} V${y.toFixed(1)} A${r} 11 0 0 0 ${196 - r} ${y.toFixed(1)} Z" fill="#7CC4E8" fill-opacity=".55"/>` +
        `<ellipse cx="196" cy="${y.toFixed(1)}" rx="${r}" ry="11" fill="#A8DCF2" fill-opacity=".8" stroke="#5AA8D0" stroke-width="1.2"/>`;
      if (stepi < 8) later(rise, 130);
      else {
        haptic(HAPTIC.done);
        toast("눈금 딱 2/3에서 멈췄어요!");
        eqs.appendChild(
          el("div", {
            class: "msp-concl pop",
            html: `구의 부피 = 원기둥의 ${mfmt("{2/3}")} = ${mfmt("{2/3}")}×πr²×2r = <b>${mfmt("{4/3}")}πr³</b>`,
          }),
        );
        chips.on("water", "2/3!");
        later(startCalc, 2000);
      }
    };
    later(rise, 400);
  }

  /* ── 국면 3: 36π의 우연 ── */
  function startCalc(): void {
    if (finished) return;
    lock = false;
    clear(eqs);
    inst.innerHTML = `마지막 미션: 반지름 <b>3cm</b>인 구의 <b>겉넓이</b>는? 공식 <b>4πr²</b>에 r=3을 넣어 봐요`;
    helper.innerHTML = "계산이 끝나면 부피와 비교해 봐요. 재미있는 우연이 기다려요!";
    const row = choiceRow(
      ["36π cm²", "12π cm²", "27π cm²"],
      0,
      () => {
        eqs.appendChild(el("div", { class: "msp-eq pop", html: `겉넓이 = 4π×3² = <b>36π</b> cm²` }));
        later(() => {
          eqs.appendChild(
            el("div", {
              class: "msp-concl pop",
              html: `부피도 ${mfmt("{4/3}")}π×3³ = <b>36π</b> cm³! 반지름 3에서만 생기는 숫자의 우연이에요`,
            }),
          );
          chips.on("calc", "36π=36π");
          haptic(HAPTIC.done);
          later(finish, 1500);
        }, 1400);
      },
      (l) => (l.includes("12") ? "12π는 4π×3, 제곱을 잊었어요!" : "27π는 3³, 겉넓이는 4πr²!"),
    );
    clear(ctl);
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "겉넓이 <b>4πr²</b>(원 4개), 부피 <b>4/3πr³</b>(기둥의 2/3). 펼칠 수 없는 구도 실험이면 정복!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  startPeel();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
