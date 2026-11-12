// [중2 Ⅷ v5] g2u8l3 magLab: 「밝은 별일수록 등급의 숫자는 어떻게 될까요?」
// 책의 어디에서: 본문(히파르코스가 가장 밝은 별을 1등성, 가장 어두운 별을 6등성으로 정했다. 1등급은 6등급의 100배, 1등급 차이는 약 2.5배).
// 한 통찰: 등급의 숫자가 작을수록 밝고, 1등급 작아질 때마다 약 2.5배 밝아진다.
// 학생이 정하는 것: 밝은 별부터 고르는 차례(틀리면 이름이 붙지 않는다), 견줄 등급.
// 밝기의 비는 2.512의 거듭제곱이다(1, 약 2.5, 약 6.3, 약 16, 약 40, 100).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvRange, bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sCap, sField, sFrame, sGlow, sLog, sText, type LabStep } from "./kit";

const RATIO = ["1", "약 2.5", "약 6.3", "약 16", "약 40", "100"]; // 6등급부터 1등급까지
const VAL = [1, 2.512, 6.31, 15.85, 39.8, 100];
// 밤하늘의 별 여섯(가로, 세로는 무대 크기에 대한 비율). 0번이 가장 밝다.
const STARS: [number, number][] = [
  [0.7, 0.34],
  [0.24, 0.62],
  [0.47, 0.22],
  [0.86, 0.7],
  [0.14, 0.26],
  [0.55, 0.74],
];
const radius = (rank: number): number => 19 - rank * 2.9;

export const magLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let phase: "name" | "bars" | "end" = "name";
  let named = 0; // 이름 붙인 별의 수
  let miss = -1;
  let missT = 0;
  let sel = 0; // 막대 국면에서 고른 등급의 차례(0은 6등급, 5는 1등급)
  const log = sLog(["5등급 별", "1등급 별"], 2, true);

  if (import.meta.env.DEV) f.stage.dataset.stars = JSON.stringify(STARS);
  f.slot.setControls(sCap("무대의 별을 직접 눌러요. 가장 밝은 별부터 <b>차례로</b> 고르면 1등성, 2등성… 이름이 붙어요."));

  st.cv.addEventListener("pointerdown", (e) => {
    if (phase !== "name") return;
    const p = st.pt(e);
    let hit = -1;
    STARS.forEach(([x, y], i) => {
      if (Math.hypot(p.x - x * st.w(), p.y - y * st.h()) < 30) hit = i;
    });
    if (hit < 0 || hit < named) return;
    if (hit === named) {
      named += 1;
      haptic(HAPTIC.correct);
      f.say(named < 6 ? `<b>${named}등성</b>이라고 이름 붙였어요. 남은 별 가운데 가장 밝은 별을 눌러요.` : "가장 어두운 별이 <b>6등성</b>이 됐어요. 숫자가 작을수록 밝은 별이에요.");
      if (named === 6) {
        f.pips(1);
        tm.later(toBars, 1500);
      }
    } else {
      miss = hit;
      missT = 1;
      haptic(HAPTIC.wrong);
      f.say("그 별보다 <b>더 밝은 별</b>이 아직 남아 있어요. 가장 밝은 별부터 골라요.");
    }
  });

  const range = bvRange({
    cls: "g2u8x-r",
    min: 0,
    max: 5,
    value: 0,
    label: "견줄 별의 등급",
    ticks: ["6등급", "5", "4", "3", "2", "1등급"],
    onInput: (v) => {
      sel = v;
      if (v === 1) log.set(0, "약 2.5배");
      if (v === 5) log.set(1, "100배");
      f.say(v === 0 ? "6등급 별을 기준으로 견줘요. 막대를 밀어 등급을 바꿔 보세요." : `<b>${6 - v}등급</b> 별은 6등급 별보다 <b>${RATIO[v]}배</b> 밝아요.`);
      if (log.has(0) && log.has(1) && phase === "bars") {
        phase = "end";
        f.pips(2);
        tm.later(() => {
          range.input.disabled = true;
          askFinal();
        }, 1500);
      }
    },
  });
  function toBars(): void {
    phase = "bars";
    f.slot.setControls(range.el, log.el);
    f.say("이번에는 밝기를 견줘요. <b>막대를 밀어</b> 6등급에서 1등급까지 등급을 바꿔 보세요.");
  }
  function askFinal(): void {
    f.say("기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "등급의 숫자가 1 작아질 때마다 별의 밝기는?",
      [{ t: "약 2.5배 밝아져요", ok: true }, { t: "약 2.5배 어두워져요" }, { t: "1배씩 더해져요" }],
      (ok) => api.recordQuiz(ok),
      { why: "6등급이 1, 5등급이 <b>약 2.5</b>, 1등급이 <b>100</b>이었어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("관측 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("등급의 <b>숫자가 작을수록 밝은</b> 별이에요. 1등급 작아질 때마다 약 2.5배 밝아져서, 1등급 별은 6등급 별보다 <b>100배</b> 밝아요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t, dt) => {
    if (missT > 0) missT = Math.max(0, missT - dt / 30);
    if (phase === "name") {
      sField(ctx, 0, 0, w, h, 50, 3, 0.5);
      STARS.forEach(([x, y], i) => {
        const r = radius(i);
        const shake = i === miss && missT > 0 ? Math.sin(t / 22) * 4 * missT : 0;
        sGlow(ctx, x * w + shake, y * h, r, i === miss && missT > 0 ? "#FF9AA2" : S.star, 0.32);
        if (i < named) sText(ctx, `${i + 1}등성`, x * w, y * h + r + 11, { color: S.gold, px: 12.5, w: 800 });
      });
      return;
    }
    // 등급별 밝기 막대(6등급이 1)
    const bx = 30;
    const bw = (w - bx - 14) / 6;
    const base = h - 34;
    const top = 44;
    for (let i = 0; i < 6; i++) {
      const x = bx + i * bw; // 왼쪽이 6등급(막대의 차례와 같다)
      const hh = Math.max(1.5, (VAL[i] / 100) * (base - top));
      const on = i === sel;
      sBox(ctx, x + 8, base - hh, bw - 16, hh, 3, on ? S.gold : "rgba(255,233,168,.3)");
      sGlow(ctx, x + bw / 2, base + 2 - hh - 12, 4 + i * 1.6, S.star, 0.4);
      sText(ctx, `${6 - i}등급`, x + bw / 2, base + 16, { color: on ? "#fff" : S.dim, px: 12, w: on ? 800 : 700 });
    }
    sText(ctx, `${6 - sel}등급 별의 밝기는 6등급 별의`, 12, 16, { color: S.dim, px: 12, align: "left" });
    sText(ctx, `${RATIO[sel]}배`, 12, 34, { color: S.gold, px: 16, align: "left", w: 800 });
  });

  f.say("맨눈으로 보이는 별 여섯 개예요. <b>가장 밝게 보이는 별부터</b> 차례로 눌러 등성을 매겨 보세요.");
  api.setCTA("별에 등급을 매겨 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
