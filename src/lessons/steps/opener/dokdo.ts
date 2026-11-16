// [도입] u2l6 dokdo: 「작은 바위섬 독도에는 생물이 몇 종이나 살까?」
// 형식: 숫자 내기를 걸고(50, 500, 5,000), 반짝이는 세 곳을 눌러 생물을 찾은 뒤, 조사단이 찾은 수가 올라가는 것으로 답을 본다.
//   1 섬과 바다, 반짝이는 세 곳. 처음 화면에서 바로 예측한다.
//   2 세 곳을 누르면 괭이갈매기, 해국, 태평줄새우가 나타나고 "내가 찾은 생물"이 3종까지 오른다.
//   3 셋을 다 찾으면 숫자가 475종까지 올라간다. 쌤이 예측과 견주어 말하고 랩(무엇으로 알까)으로 넘긴다.
// 수치의 기준: 국립생태원 독도 생태계 정밀조사(2025년 5~10월)의 475종. 여러 해 쌓인 목록 수치는 쓰지 않는다
// (근거: output/intro-redesign/research/intro-research.md 2부 D).
// 바다의 생물은 그 조사에서 독도에 처음 확인됐다고 보도된 태평줄새우다(해안무척추동물). 물고기는 그 조사의 분류군에 없어 쓰지 않는다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

const NAMES = ["괭이갈매기", "해국", "태평줄새우"];
const TOTAL = 475;
const PICKS: Array<{ t: string; verdict: string }> = [
  { t: "500종쯤", verdict: "예측과 비슷해요." },
  { t: "50종쯤", verdict: "예측의 열 배쯤이에요." },
  // 끝말에 붙어 쌤의 말이 390px 폰에서 네 줄이 되어 줄였다(세 줄 안쪽, 2026-11-16)
  { t: "5,000종쯤", verdict: "예측보다는 적지만 작은 바위섬치고는 정말 많아요." },
];

export function dokdo(c: OpenerCtx): void {
  const M = c.meta.dokdo;
  const S = c.meta.stage;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;

  const cap = el("span", { class: "opn-dk-cap", text: "내가 찾은 생물" });
  const num = el("b", { text: "0" });
  const count = el("div", { class: "opn-dk-count" }, cap, el("span", { class: "opn-dk-val" }, num, "종"));
  c.stage.append(el("div", { class: "opn-layer", html: c.art.dokdoBase }), count);

  let phase: "ask" | "play" | "count" | "done" = "ask";
  let pred = PICKS[0];
  const found = new Set<number>();

  M.spots.forEach(([x, y], i) => {
    const hit = el("button", {
      class: "opn-dk-hit",
      attrs: { type: "button", "aria-label": `반짝이는 곳 ${i + 1}`, "data-i": String(i) },
      style: { left: pct(x - 100, S.w), top: pct(y - 84, S.h), width: pct(200, S.w), height: pct(168, S.h) },
    });
    const name = el("div", { class: "opn-tag opn-dk-name", attrs: { "data-i": String(i) }, style: { left: pct(x - 110, S.w), top: pct(y + (i === 2 ? -92 : 44), S.h), width: pct(220, S.w) } }, el("span", { text: NAMES[i] }));
    hit.addEventListener("click", () => find(i));
    c.stage.append(hit, name);
  });

  function find(i: number): void {
    if (phase !== "play" || found.has(i)) return;
    found.add(i);
    c.stage.classList.add(`f${i}`);
    num.textContent = String(found.size);
    c.step.dataset.opnFound = String(found.size);
    haptic(HAPTIC.correct);
    if (found.size < 3) return;
    phase = "count";
    c.say("숨어 있던 세 종을 모두 찾았어요! 과연 과학자 조사단은 독도에서 모두 몇 종의 생물을 찾았을까요?");
    c.later(roll, 900);
  }

  function roll(): void {
    cap.textContent = "2025년 조사에서 찾은 생물";
    c.stage.classList.add("roll");
    const N = 32;
    for (let j = 1; j <= N; j++) {
      c.later(() => {
        const t = j / N;
        num.textContent = String(Math.round(3 + (TOTAL - 3) * (1 - (1 - t) * (1 - t))));
        if (j === N) wrapUp();
      }, j * 45);
    }
  }

  function wrapUp(): void {
    phase = "done";
    c.stage.classList.add("done");
    haptic(HAPTIC.correct);
    c.face("surprised");
    c.say(`무려 <b>${TOTAL}종</b>이나 살아요! ${pred.verdict} 그렇다면 한 지역의 생물이 얼마나 다양한지는 무엇을 보고 알 수 있을까요?`);
    c.finish();
  }

  c.step.dataset.opnPhase = "ask";
  c.step.dataset.opnFound = "0";
  c.ask("바다 한가운데 솟은 작은 바위섬 독도에는 생물이 얼마나 살까요? 2025년 독도 생태계 조사에서 확인한 생물은 모두 <b>몇 종</b>쯤일까요?", {
    choices: PICKS.map((p) => p.t),
    neutral: true,
    good: "예측 완료! 먼저 그림에서 <b>반짝이는 세 곳</b>을 눌러 독도에 사는 생물을 찾아보세요.",
    onDone: (picked) => {
      pred = PICKS.find((p) => p.t === picked) ?? PICKS[0];
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}
