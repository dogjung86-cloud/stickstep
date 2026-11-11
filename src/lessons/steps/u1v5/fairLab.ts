// [중1 Ⅰ v5] u1l2 fairLab: 「색깔만 달라지게 하려면?」
// 한 통찰: 알아보려는 조건(색깔) 하나만 다르게 하고 나머지를 같게 맞춰야 온도 차이의 원인을 말할 수 있다(변인 통제).
// 조작: 조건 카드 셋(색종이 색깔, 물의 양, 놓는 곳)을 눌러 같게 또는 다르게 정하고 실험을 시작한다.
//       처음에는 도입 장면처럼 어긋나 있다(왼쪽 컵만 그늘, 왼쪽 컵만 물이 두 배). 틀린 채로 돌려도 된다. 결과가 실패를 보여 준다.
// 흐름: 조건 정하기 ↔ 실험(2시간을 2.4초로) → 공정한 실험이 나오면 판정 → 결론.
// 값: 처음 20 ℃. 2시간 동안 오르는 폭은 검은색 19, 파란색 14, 흰색 9(정본의 자체 제작 값. 뒤의 문제 해설이 39 ℃를 쓴다).
//     물이 두 배면 오르는 폭이 0.55배, 그늘이면 0.3배(방향만 맞춘 어림).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvFrame, bvTimers, bvTween } from "../bio6/b6Lab";

interface FairStep {
  title: string;
  cta?: string;
}

type Key = "color" | "water" | "place";
const T0 = 20;
const RISE = [19, 14, 9]; // 검은색, 파란색, 흰색
const CX = [92, 176, 260];
const PAPER = ["#2A2F38", "#3B82F6", "#F1F4F8"];
const PAPER_LINE = ["#6B7686", "#8DB8FF", "#FFFFFF"];
const NAMES = ["검은 컵", "파란 컵", "흰 컵"];

const COND: Record<Key, { name: string; same: string; diff: string }> = {
  color: { name: "색종이 색깔", same: "모두 흰색", diff: "세 가지 색" },
  water: { name: "물의 양", same: "모두 100 mL", diff: "왼쪽만 200 mL" },
  place: { name: "놓는 곳", same: "모두 햇빛", diff: "왼쪽만 그늘" },
};

function stageSvg(): string {
  const cups = CX.map(
    (cx, i) => `
    <g class="u1f-cup" data-i="${i}">
      <ellipse cx="${cx}" cy="197" rx="34" ry="5" fill="#000" opacity=".28"/>
      <rect class="u1f-water" x="${cx - 23}" y="146" width="46" height="46" rx="3" fill="#6FB7FF" opacity=".55"/>
      <path d="M${cx - 26} 116 L${cx - 24} 194 H${cx + 24} L${cx + 26} 116" fill="rgba(255,255,255,.07)" stroke="#B9C8DE" stroke-width="1.6" stroke-linejoin="round"/>
      <rect class="u1f-paper" x="${cx - 25.5}" y="154" width="51" height="38" rx="2" fill="${PAPER[i]}" stroke="${PAPER_LINE[i]}" stroke-width="1.2"/>
      <rect x="${cx + 9}" y="104" width="7" height="82" rx="3.5" fill="#0E1A2E" stroke="#C9D5E8" stroke-width="1.1"/>
      <rect class="u1f-merc" x="${cx + 10.6}" y="170" width="3.8" height="14" rx="1.9" fill="#FF6B6B"/>
      <text class="u1f-temp" x="${cx}" y="98" text-anchor="middle">20 ℃</text>
      <text class="u1f-ml" x="${cx}" y="217" text-anchor="middle">100 mL</text>
    </g>`,
  ).join("");
  return `<svg viewBox="0 0 346 230" role="img" aria-label="햇빛 아래 색종이로 감싼 컵 세 개와 온도계">
    <defs>
      <radialGradient id="u1fSun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".55" stop-color="#FFC94A"/><stop offset="1" stop-color="#FFC94A" stop-opacity="0"/></radialGradient>
    </defs>
    <rect x="0" y="198" width="346" height="32" fill="#0F1C33"/>
    <line x1="0" y1="198" x2="346" y2="198" stroke="#2A3E60" stroke-width="1.2"/>
    <circle cx="36" cy="36" r="34" fill="url(#u1fSun)"/>
    <circle cx="36" cy="36" r="15" fill="#FFD766"/>
    ${CX.map((cx, i) => `<line class="u1f-ray" data-i="${i}" x1="54" y1="50" x2="${cx - 6}" y2="112" stroke="#FFE08A" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round" opacity=".5"/>`).join("")}
    ${cups}
    <g class="u1f-shade">
      <line x1="${CX[0] - 36}" y1="60" x2="${CX[0] - 36}" y2="198" stroke="#C9D5E8" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M${CX[0] - 50} 76 Q${CX[0] - 4} 34 ${CX[0] + 42} 76 Z" fill="#E8590C" stroke="#FFB27A" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M${CX[0] - 20} 76 Q${CX[0] - 6} 52 ${CX[0] - 4} 44 Q${CX[0] + 2} 56 ${CX[0] + 12} 76" fill="#FFD8B5" opacity=".55"/>
    </g>
  </svg>`;
}

export const fairLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FairStep;
  const tm = bvTimers();
  host.classList.add("u1x-step");
  const f = bvFrame(host, { title: s.title, steps: 3, cls: "u1f-stage", qCls: "u1f-q", api });
  f.stage.innerHTML = stageSvg();
  const timeEl = el("div", { class: "bv-pill u1f-time", text: "처음" });
  const verdictEl = el("div", { class: "u1x-verdict" });
  f.stage.append(timeEl, verdictEl);
  const q = <T extends Element>(sel: string): T[] => Array.from(f.stage.querySelectorAll<T>(sel));
  const waters = q<SVGRectElement>(".u1f-water");
  const papers = q<SVGRectElement>(".u1f-paper");
  const mercs = q<SVGRectElement>(".u1f-merc");
  const temps = q<SVGTextElement>(".u1f-temp");
  const mls = q<SVGTextElement>(".u1f-ml");
  const rays = q<SVGLineElement>(".u1f-ray");
  const cupEls = q<SVGGElement>(".u1f-cup");
  const shade = f.stage.querySelector(".u1f-shade") as SVGGElement;

  // 다르게(true)인지. 처음은 도입 장면처럼 어긋나 있다.
  const diff: Record<Key, boolean> = { color: true, water: true, place: true };
  let phase: "set" | "run" | "result" | "ask" | "done" = "set";
  let runs = 0;
  let fairDone = false;
  const setPhase = (p: typeof phase): void => {
    phase = p;
    host.dataset.u1Phase = p;
  };

  const finalTemps = (): number[] =>
    RISE.map((r, i) => {
      let rise = diff.color ? r : RISE[2];
      if (i === 0 && diff.water) rise *= 0.55;
      if (i === 0 && diff.place) rise *= 0.3;
      return T0 + rise;
    });

  function showTemps(v: number[]): void {
    v.forEach((t, i) => {
      temps[i].textContent = `${Math.round(t)} ℃`;
      const h = 14 + ((t - T0) / 20) * 62;
      mercs[i].setAttribute("y", (184 - h).toFixed(1));
      mercs[i].setAttribute("height", h.toFixed(1));
    });
  }

  function paintSetup(): void {
    papers.forEach((p, i) => {
      p.setAttribute("fill", diff.color ? PAPER[i] : PAPER[2]);
      p.setAttribute("stroke", diff.color ? PAPER_LINE[i] : PAPER_LINE[2]);
    });
    const big = diff.water;
    waters[0].setAttribute("y", big ? "124" : "146");
    waters[0].setAttribute("height", big ? "68" : "46");
    mls[0].textContent = big ? "200 mL" : "100 mL";
    mls[0].classList.toggle("odd", big);
    shade.style.display = diff.place ? "" : "none";
    rays[0].style.display = diff.place ? "none" : "";
    cupEls[0].classList.toggle("dim", diff.place);
  }

  // ── 조건 카드 ──
  const conds = {} as Record<Key, { el: HTMLButtonElement; tag: HTMLElement; sub: HTMLElement }>;
  (Object.keys(COND) as Key[]).forEach((k) => {
    const tag = el("span", { class: "u1x-tag" });
    const sub = el("i");
    const b = el("button", { class: "u1x-cond", attrs: { type: "button" }, dataset: { k } }, el("b", { text: COND[k].name }), tag, sub) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (fairDone || phase === "run") return;
      haptic(HAPTIC.tap);
      diff[k] = !diff[k];
      reset();
    });
    conds[k] = { el: b, tag, sub };
  });
  function paintConds(): void {
    (Object.keys(COND) as Key[]).forEach((k) => {
      const c = conds[k];
      c.tag.textContent = diff[k] ? "다르게" : "같게";
      c.tag.classList.toggle("diff", diff[k]);
      c.sub.textContent = diff[k] ? COND[k].diff : COND[k].same;
      c.el.dataset.diff = diff[k] ? "1" : "0";
      c.el.setAttribute("aria-label", `${COND[k].name}: ${diff[k] ? "다르게" : "같게"}, ${c.sub.textContent}`);
    });
  }
  const RUN = "실험 시작 (햇빛에 2시간)";
  const runBtn = bvBtn("main u1f-run", RUN);

  function reset(): void {
    setPhase("set");
    timeEl.textContent = "처음";
    verdictEl.className = "u1x-verdict";
    temps.forEach((t) => t.classList.remove("top"));
    showTemps([T0, T0, T0]);
    paintSetup();
    paintConds();
    runBtn.disabled = false;
    runBtn.textContent = RUN;
    f.say(runs === 0 ? "조건 카드를 눌러 <b>같게</b> 할지 <b>다르게</b> 할지 정하고 실험을 시작해 봐요." : "조건을 바꿨어요. <b>실험 시작</b>을 눌러 결과가 어떻게 달라지는지 봐요.");
  }

  function resultSay(v: number[]): { fair: boolean; say: string; label: string } {
    const others = [diff.water ? "물의 양" : "", diff.place ? "놓는 곳" : ""].filter(Boolean);
    if (!diff.color) {
      if (!others.length) return { fair: false, label: "색깔이 모두 같아요", say: "세 컵이 똑같이 올랐어요. 색깔이 같으면 <b>색깔의 영향</b>을 알아볼 수 없어요." };
      return { fair: false, label: "색깔이 모두 같아요", say: `색깔은 같고 <b>${others.join(", ")}</b>만 달라요. 색깔을 알아보는 실험이 아니에요.` };
    }
    if (others.length) {
      const top = v.indexOf(Math.max(...v));
      return {
        fair: false,
        label: "공정하지 않아요",
        say: `<b>${NAMES[top]}</b>이 가장 뜨거워요. 그런데 <b>${others.join(", ")}</b>도 달라서 색깔 때문인지 알 수 없어요.`,
      };
    }
    return { fair: true, label: "공정한 실험이에요", say: "색깔만 달랐어요. 온도 차이는 <b>색깔 때문</b>이라고 말할 수 있어요. 검은 컵이 가장 뜨거워요." };
  }

  function run(): void {
    if (phase !== "set") return;
    setPhase("run");
    runs += 1;
    haptic(HAPTIC.tap);
    runBtn.disabled = true;
    f.say("햇빛에 두고 1시간마다 온도를 재요. 온도계를 지켜봐요.");
    const target = finalTemps();
    bvTween(
      tm,
      2400,
      (t) => {
        showTemps(target.map((x) => T0 + (x - T0) * t));
        timeEl.textContent = t < 0.12 ? "처음" : t < 0.6 ? "1시간 뒤" : "2시간 뒤";
      },
      () => {
        const r = resultSay(target);
        const max = Math.max(...target);
        if (target.filter((x) => x === max).length === 1) temps[target.indexOf(max)].classList.add("top");
        verdictEl.textContent = r.label;
        verdictEl.className = `u1x-verdict show ${r.fair ? "ok" : "no"}`;
        host.dataset.u1Fair = r.fair ? "1" : "0";
        f.say(r.say);
        f.pips(r.fair || fairDone ? 2 : 1);
        runBtn.textContent = r.fair ? "공정한 실험 성공" : "카드를 눌러 조건을 바꿔 보세요";
        if (r.fair && !fairDone) {
          fairDone = true;
          haptic(HAPTIC.ctaUnlock);
          setPhase("result");
          tm.later(askFinal, 2200);
        } else {
          setPhase("result");
        }
      },
      (x) => x,
    );
  }
  runBtn.addEventListener("click", run);

  function askFinal(): void {
    setPhase("ask");
    // 판정의 근거를 무대에 남긴다: 검은 컵만 그늘에 둔 실험의 결과를 다시 보여 준다
    diff.color = true;
    diff.water = false;
    diff.place = true;
    paintSetup();
    temps.forEach((t) => t.classList.remove("top"));
    showTemps(finalTemps());
    verdictEl.textContent = "공정하지 않아요";
    verdictEl.className = "u1x-verdict show no";
    f.say("공정한 실험에 성공했어요. 이번에는 무대의 <b>검은 컵만 그늘에 둔 실험</b>을 보고 골라 봐요.");
    f.slot.ask(
      "검은 컵만 그늘에 두었더니 검은 컵이 가장 덜 뜨거웠어요. 알 수 있는 것은?",
      [
        { t: "색깔 때문인지 알 수 없다", ok: true },
        { t: "검은색은 잘 데워지지 않는다" },
        { t: "그늘에 두면 더 잘 데워진다" },
      ],
      (ok) => api.recordQuiz(ok),
      { why: "색깔과 <b>놓는 곳</b>이 함께 달라서 원인을 가릴 수 없어요.", onNext: finish },
    );
  }

  function finish(): void {
    setPhase("done");
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("알아보려는 것 <b>하나만 다르게</b> 두고 나머지 조건은 모두 같게 맞춰요. 이렇게 조건을 맞추는 일이 <b>변인 통제</b>예요.");
    api.enableCTA(s.cta ?? "다음");
  }

  f.slot.setControls(el("div", { class: "u1x-conds" }, conds.color.el, conds.water.el, conds.place.el), runBtn);
  reset();
  api.setCTA("공정한 실험을 만들어 보세요", { enabled: false });
  return () => tm.clear();
};
