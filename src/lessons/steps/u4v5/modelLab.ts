// [중1 Ⅳ v5] u4l2 입자 모형 랩: 「입자 모형은 어떤 상태일까요?」
// 책의 해 보기(물질의 상태를 입자 모형으로 표현하기)를 뒤집었다: 움직이는 입자 모형을 보고 어떤 상태인지 가려낸다.
// 무대는 단원의 입자 뷰(같은 시뮬레이션, 물리 수치 불변). 이름표 없이 모형만 보여 주고 세 번 묻는다(액체, 고체, 기체 차례).
// 앞의 두 랩에서 입자의 눈으로 세 상태를 이미 보았으므로 여기서는 보기만 하던 비교 화면 대신 판정으로 확인한다.

import { el } from "../../../core/dom";
import type { StepRenderer } from "../../types";
import { u4Lab, u4Matter, type U4Step } from "./u4Kit";

const ROUNDS = [
  { T: 42, ans: "액체", why: "서로 붙어 있지만 <b>자리를 바꾸며</b> 움직여요. 액체예요." },
  { T: -16, ans: "고체", why: "<b>규칙적으로</b> 늘어서 제자리에서만 떨어요. 고체예요." },
  { T: 114, ans: "기체", why: "서로 <b>멀리 떨어져</b> 사방으로 날아다녀요. 기체예요." },
] as const;

export const u4ModelLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-model" });
  const { f, tm } = lab;
  const label = el("span", { text: "입자 모형 1" });
  const m = u4Matter(lab, { sim: { count: 44, r: 6.2, temp: ROUNDS[0].T }, view: "particle", onReady: () => round(0) });
  m.pill.append(label);

  function round(i: number): void {
    if (i >= ROUNDS.length) {
      lab.finish("입자 사이의 <b>거리</b>, <b>배열</b>, <b>움직임</b>을 보면 고체, 액체, 기체를 가려낼 수 있어요.");
      return;
    }
    const r = ROUNDS[i];
    m.ms.setTemp(r.T);
    label.textContent = `입자 모형 ${i + 1}`;
    host.dataset.u4Round = String(i + 1);
    f.say("움직이는 <b>입자 모형</b>이에요. 입자 사이의 거리와 움직임을 잘 보세요.");
    api.setCTA("입자 모형을 살펴보세요", { enabled: false });
    tm.later(
      () =>
        f.slot.ask(
          "입자들이 이렇게 모여 움직이는 물질은 <b>어떤 상태</b>일까요?",
          ["고체", "액체", "기체"].map((t) => ({ t, ok: t === r.ans })),
          (ok) => api.recordQuiz(ok),
          {
            why: r.why,
            onNext: () => {
              f.pips(i + 1);
              f.slot.showControls();
              round(i + 1);
            },
          },
        ),
      i === 0 ? 1200 : 2200,
    );
  }

  f.say("움직이는 <b>입자 모형</b>이에요. 입자 사이의 거리와 움직임을 잘 보세요.");
  api.setCTA("입자 모형을 살펴보세요", { enabled: false });
  return lab.cleanup;
};
