// [중1 Ⅲ v5] u3l5 u3ExpandLab: 「가열하면 막대는 왜 길어질까?」
// 한 통찰: 물체가 열을 받으면 입자 운동이 활발해져 입자 사이의 거리가 멀어지고, 그래서 팽창한다(입자의 크기와 수는 그대로다).
// 책의 그림(가열 전과 후의 입자 배열)을 온도 막대 하나로 이어 본다.
//   위: 한쪽 끝을 고정한 금속 막대와 처음 길이 표시   아래: 막대 속을 확대한 창(입자의 떨림과 사이 거리)
// 흐름: 뜨겁게 → 다시 식히기 → 판정 → 결론.
// 늘어나는 길이는 잘 보이게 실제보다 훨씬 크게 그렸다(무대에 "실제보다 크게 그린 그림"이라고 적는다).

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { tempColor, drawGlowParticle, drawFlame } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvRange, bvTimers } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, pill, rr, txt, SUB } from "./kit";

interface ExpandStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const T_MIN = 20;
const T_MAX = 200;
const L0 = 214; // 처음 길이(px)
const GROW = 40; // 가장 뜨거울 때 늘어난 길이(px)
const COLS = 9;
const ROWS = 3;

export const expandLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ExpandStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 3, cls: "u3x-expand", api });

  let T = T_MIN;
  let shown = T_MIN;
  let hot = false;
  let cooled = false;
  let phase: "play" | "ask" | "done" = "play";
  const seeds = Array.from({ length: COLS * ROWS }, (_, i) => ({ a: (i * 2.399) % 6.283, f: 0.012 + ((i * 7) % 5) * 0.0015 }));

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    shown += (T - shown) * Math.min(1, 0.2 * dt);
    const k = (shown - T_MIN) / (T_MAX - T_MIN);
    const len = L0 + GROW * k;
    // 고정대와 막대
    rr(ctx, 14, 34, 14, 62, 3);
    ctx.fillStyle = "#55657C";
    ctx.fill();
    rr(ctx, 28, 50, len, 30, 5);
    ctx.fillStyle = tempColor(0.1 + 0.8 * k, 0.55);
    ctx.fill();
    ctx.strokeStyle = tempColor(0.1 + 0.8 * k);
    ctx.lineWidth = 2;
    ctx.stroke();
    // 처음 길이 표시
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255,255,255,.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(28 + L0, 34);
    ctx.lineTo(28 + L0, 96);
    ctx.stroke();
    ctx.setLineDash([]);
    txt(ctx, "처음 길이", 28 + L0, 24, { size: 12, color: SUB, weight: 600 });
    if (k > 0.04) txt(ctx, "늘어남", 28 + L0 + 24, 104, { size: 12.5, color: "#FFD666", weight: 800 });
    if (k > 0.12) for (const x of [70, 130, 190]) drawFlame(ctx, x, 104, 8 + 12 * k, tMs + x * 7);
    pill(ctx, `${Math.round(shown)}℃`, 74, 22, { dot: tempColor(0.1 + 0.8 * k) });
    // 확대 창: 입자는 제자리에서 떨고, 뜨거울수록 사이가 멀어진다(크기와 수는 그대로)
    rr(ctx, 28, 118, 290, 92, 12);
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(205,225,250,.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(205,225,250,.3)";
    ctx.beginPath();
    ctx.moveTo(60, 80);
    ctx.lineTo(28, 118);
    ctx.moveTo(110, 80);
    ctx.lineTo(318, 118);
    ctx.stroke();
    const gap = 23 * (1 + 0.19 * k);
    const amp = 0.4 + 4 * k;
    const x0 = 50;
    const y0 = 164 - gap;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const sd = seeds[c * ROWS + r];
        drawGlowParticle(ctx, x0 + c * gap + Math.sin(tMs * sd.f * 2 + sd.a) * amp, y0 + r * gap + Math.cos(tMs * sd.f * 2.6 + sd.a * 1.7) * amp, 6, 0.1 + 0.8 * k, 1.5);
      }
    }
    txt(ctx, "막대 속을 확대한 창", 30, 222, { size: 12, color: SUB, align: "left", weight: 600 });
    txt(ctx, "실제보다 크게 그린 그림", 314, 222, { size: 12, color: SUB, align: "right", weight: 600 });
  });

  const range = bvRange({
    cls: "u3x-range",
    min: T_MIN,
    max: T_MAX,
    value: T,
    label: "막대의 온도",
    ticks: ["20℃", "200℃"],
    onInput: (v) => {
      T = v;
      if (!hot && T >= 185) {
        hot = true;
        haptic(HAPTIC.ctaUnlock);
      }
      if (hot && !cooled && T <= 30) {
        cooled = true;
        haptic(HAPTIC.ctaUnlock);
      }
      f.pips((hot ? 1 : 0) + (cooled ? 1 : 0));
      hint();
    },
    onChange: () => {
      if (phase === "play" && hot && cooled) {
        phase = "ask";
        range.input.disabled = true;
        tm.later(askFinal, 700);
      }
    },
  });

  function hint(): void {
    if (phase !== "play") return;
    if (!hot) f.say(T > 60 ? "막대 끝이 <b>처음 길이</b> 표시를 넘어가요. 끝까지 뜨겁게 해 봐요. 입자는 어떻게 달라지나요?" : "한쪽 끝을 고정한 금속 막대예요. <b>온도 막대</b>를 밀어 가열하고 막대 끝과 입자를 봐요.");
    else if (!cooled) f.say("입자가 크게 떨면서 <b>사이가 멀어졌어요</b>. 이번엔 다시 식혀 봐요. 길이는 어떻게 되나요?");
    else f.say("식히니 입자 사이가 가까워지고 막대도 <b>처음 길이</b>로 돌아왔어요.");
  }

  function askFinal(): void {
    T = T_MAX;
    range.set(T_MAX);
    f.say("막대를 다시 뜨겁게 했어요. 무대의 <b>확대 창</b>을 보고 골라 봐요.");
    f.slot.ask(
      "가열한 막대가 길어진 까닭은?",
      [{ t: "입자 사이의 거리가 멀어져서", ok: true }, { t: "입자 하나하나가 커져서" }, { t: "입자의 수가 늘어나서" }],
      (ok) => api.recordQuiz(ok),
      { why: "입자의 <b>크기와 수는 그대로</b>이고 사이만 벌어졌어요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(3);
    f.say("관찰 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("물체가 열을 받으면 입자 운동이 활발해져 <b>입자 사이가 멀어지고</b>, 그래서 길이와 부피가 늘어나요. 이것이 <b>열팽창</b>이에요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el);
  hint();
  api.setCTA("막대를 가열했다가 식혀 보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.stop();
  };
};
