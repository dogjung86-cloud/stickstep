// meetLab, 두 직선 교차 실험실(중2 수학 Ⅲ L10, 책 128~133쪽). 파란 고정 직선(x-y=1)과
// 주황 조종 직선(y=ax+b)을 겹쳐 놓고, a·b를 조종하며 연립방정식의 해와 교점의 관계를
// 세 국면으로 전부 만들어 본다: 한 점(해 하나)·평행(해 없음)·일치(해 무수히 많음).
// 국면 1(hit): 교점을 과녁 (2, 1)에 명중, 검산 카드가 두 방정식 동시 대입을 보여 준다
//              (교점의 좌표 = 연립방정식의 해).
// 국면 2(par): a=1(기울기 같게), b≠-1, 교점이 사라진다(해가 없다).
// 국면 3(same): a=1, b=-1, 두 직선이 완전히 포개진다(해가 무수히 많다).
// 상태 배지가 교점 좌표/없음/무수히를 실시간 표시. 스테퍼는 lineFamilyLab(.lfm-) 문법 재사용.
// 목표 칩 3: hit·par·same. rAF 금지(CSS 트랜지션+타이머 Set). 스타일: math2.css .mel-* 섹션
// (mtl 접두는 math.css 선점이라 mel 사용).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mfmt, mboard, mtoast, goalChips, planeSpec } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

export const meetLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "hit", label: "과녁 명중", sub: "교점을 (2, 1)에" },
    { id: "par", label: "해가 없게", sub: "잠김" },
    { id: "same", label: "해가 무수히", sub: "잠김" },
  ]);

  const board = mboard(540);
  const statusCard = el("div", { class: "mel-status", attrs: { "aria-live": "polite" } });
  const spec = planeSpec({ min: -5, max: 5, size: 340 });
  const svgWrap = el("div", { class: "mcl-plane" });
  const O = `${spec.px(0)}px ${spec.py(0)}px`;
  svgWrap.innerHTML =
    `<svg viewBox="${spec.vb}" xmlns="http://www.w3.org/2000/svg" fill="none">${spec.grid}` +
    // 과녁 (2, 1)
    `<g class="mel-target"><circle cx="${spec.px(2)}" cy="${spec.py(1)}" r="11" fill="none" stroke="#E8A93E" stroke-width="2" stroke-dasharray="4 3"/>` +
    `<circle cx="${spec.px(2)}" cy="${spec.py(1)}" r="3" fill="#E8A93E"/>` +
    `<text x="${spec.px(2) + 13}" y="${spec.py(1) - 9}" font-size="10.5" font-weight="900" fill="#9C5A10">(2, 1)</text></g>` +
    // 고정 직선 y=x-1 (파랑)
    `<g class="mel-fixed" style="transform-origin:${O}; transform: translateY(${spec.unit.toFixed(1)}px) rotate(-45deg)">` +
    `<line x1="${spec.px(0) - 300}" y1="${spec.py(0)}" x2="${spec.px(0) + 300}" y2="${spec.py(0)}" stroke="#3D5BC0" stroke-width="3" stroke-linecap="round"/>` +
    `</g>` +
    `<text x="${spec.px(3.4)}" y="${spec.py(3.4 - 1) - 10}" font-size="10.5" font-weight="800" font-style="italic" fill="#27408B">x−y=1</text>` +
    // 조종 직선 y=ax+b (주황)
    `<g class="mel-move" style="transform-origin:${O}; transition: transform .3s var(--ease-out)">` +
    `<line x1="${spec.px(0) - 300}" y1="${spec.py(0)}" x2="${spec.px(0) + 300}" y2="${spec.py(0)}" stroke="#F08C00" stroke-width="3" stroke-linecap="round"/>` +
    `</g>` +
    `<g class="mel-x"></g>` +
    `</svg>`;
  const ctlRow = el("div", { class: "lfm-ctl" });
  const checkCard = el("div", { class: "mel-check" });
  board.append(statusCard, svgWrap, ctlRow, checkCard);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "파란 직선(x−y=1)은 고정, <b>주황 직선(y=ax+b)</b>이 조종간이에요. 미션 1: 교점을 <b>과녁 (2, 1)</b>에!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const gMove = svgWrap.querySelector(".mel-move") as SVGGElement;
  const gX = svgWrap.querySelector(".mel-x") as SVGGElement;
  const gFixed = svgWrap.querySelector(".mel-fixed") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let a = -1;
  let b = 4;
  let finished = false;

  const fmtA = (v: number): string => (v % 1 === 0 ? String(v) : v.toFixed(1));
  const eqStr = (): string => {
    const ax = a === 1 ? "x" : a === -1 ? "-x" : `${fmtA(a)}x`;
    return b === 0 ? `y=${ax}` : b > 0 ? `y=${ax}+${b}` : `y=${ax}-${Math.abs(b)}`;
  };
  const prettyNum = (v: number): string => {
    const r = Math.round(v * 100) / 100;
    return String(r % 1 === 0 ? r : r.toFixed(2)).replace("-", "−");
  };

  function paint(): void {
    gMove.style.transform = `translateY(${(-b * spec.unit).toFixed(1)}px) rotate(${(-Math.atan(a) * 180) / Math.PI}deg)`;
    let state: "one" | "par" | "same";
    if (a === 1 && b === -1) state = "same";
    else if (a === 1) state = "par";
    else state = "one";
    if (state === "one") {
      const ix = (b + 1) / (1 - a);
      const iy = ix - 1;
      const inView = ix >= spec.min && ix <= spec.max && iy >= spec.min && iy <= spec.max;
      gX.innerHTML = inView
        ? `<circle cx="${spec.px(ix)}" cy="${spec.py(iy)}" r="6" fill="#FFFFFF" stroke="#C2255C" stroke-width="2.6"/>`
        : "";
      statusCard.innerHTML =
        `<span class="mel-pill one">교점 1개</span> ${mfmt(eqStr())} <span class="mel-co">교점 (${prettyNum(ix)}, ${prettyNum(iy)})${inView ? "" : " · 화면 밖"}</span>`;
    } else if (state === "par") {
      gX.innerHTML = "";
      statusCard.innerHTML = `<span class="mel-pill zero">교점 없음</span> ${mfmt(eqStr())} <span class="mel-co">나란히, 영영 안 만나요</span>`;
    } else {
      gX.innerHTML = "";
      statusCard.innerHTML = `<span class="mel-pill inf">교점 무수히</span> ${mfmt(eqStr())} <span class="mel-co">완전히 포개졌어요</span>`;
    }
    judge(state);
  }

  function judge(state: "one" | "par" | "same"): void {
    if (state === "one" && !chips.has("hit")) {
      const ix = (b + 1) / (1 - a);
      if (Math.abs(ix - 2) < 1e-9) {
        chips.on("hit", "(2, 1)!");
        haptic(HAPTIC.correct);
        checkCard.innerHTML =
          `<b class="mel-ck">검산</b> (2, 1)을 두 식에 대입 → ` +
          `<span class="mel-ok">x−y=1: 2−1=1 참!</span> ` +
          `<span class="mel-ok">${eqStr().replace("y=", "y=").replace(/-/g, "−")}: 1=${fmtA(a).replace("-", "−")}×2${b >= 0 ? "+" + b : "−" + Math.abs(b)} 참!</span> ` +
          `두 식을 동시에 만족 = <b>연립방정식의 해</b>!`;
        checkCard.classList.add("show");
        toast("교점의 좌표 (2, 1)이 곧 연립방정식의 해!");
        helper.innerHTML =
          "명중! 이번엔 반대로, 두 직선이 <b>영영 만나지 않게</b> 해 보세요. 힌트: 파란 직선의 기울기는 1이에요.";
        const sub = chips.el.querySelector(`[data-g="par"] span`) as HTMLElement;
        sub.textContent = "a를 파랑과 같게";
      }
    }
    if (state === "par" && chips.has("hit") && !chips.has("par")) {
      chips.on("par", "해가 없다!");
      haptic(HAPTIC.correct);
      checkCard.classList.remove("show");
      toast("기울기가 같고 y절편이 다르면 평행, 교점 없음 = 해가 없다!");
      helper.innerHTML = "마지막 미션: 두 직선을 <b>완전히 포개</b> 보세요. 주황이 파랑(y=x−1)과 똑같아지려면?";
      const sub = chips.el.querySelector(`[data-g="same"] span`) as HTMLElement;
      sub.textContent = "b까지 맞추기";
    }
    if (state === "same" && chips.has("par") && !chips.has("same") && !finished) {
      finished = true;
      chips.on("same", "해가 무수히!");
      haptic(HAPTIC.done);
      gFixed.classList.add("mel-glow");
      toast("한 몸이 됐어요! 직선 위 모든 점이 해, 해가 무수히 많다!");
      helper.innerHTML =
        "정리! 연립방정식의 해 = 두 그래프의 <b>교점의 좌표</b>. 한 점에서 만나면 해 하나, " +
        "평행하면 해가 없고, 일치하면 무수히 많아요. 그래프 한 장이면 해의 개수가 보여요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  function stepper(label: string, get: () => number, set: (v: number) => void, step: number, min: number, max: number, skipZero: boolean): HTMLElement {
    const read = el("span", { class: "lfm-read", html: `<i>${label}</i> = <b>${fmtA(get()).replace("-", "−")}</b>` });
    const mk = (d: number): HTMLButtonElement => {
      const bt = el("button", { class: "ct-btn", attrs: { type: "button", "aria-label": `${label} ${d > 0 ? "키우기" : "줄이기"}` } }, el("span", { text: d > 0 ? "+" : "−" })) as HTMLButtonElement;
      bt.addEventListener("click", () => {
        let next = Math.round((get() + d * step) * 2) / 2;
        if (skipZero && next === 0) next = d > 0 ? step : -step;
        next = Math.max(min, Math.min(max, next));
        if (next === get()) return;
        set(next);
        haptic(HAPTIC.tap);
        read.innerHTML = `<i>${label}</i> = <b>${fmtA(get()).replace("-", "−")}</b>`;
        paint();
      });
      return bt;
    };
    return el("div", { class: "lfm-step" }, mk(-1), read, mk(1));
  }

  ctlRow.append(
    stepper("a", () => a, (v) => (a = v), 0.5, -3, 3, true),
    stepper("b", () => b, (v) => (b = v), 1, -4, 4, false),
  );

  paint();
  api.setCTA("세 가지 만남을 모두 만들면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    void later;
  };
};
