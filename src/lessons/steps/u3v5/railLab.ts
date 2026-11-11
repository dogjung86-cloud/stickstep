// [중1 Ⅲ v5] u3l5 u3RailLab: 「한여름의 철로에는 무슨 일이 생길까?」
// 한 통찰: 물체가 열을 받으면 입자 운동이 활발해져 입자 사이의 거리가 멀어지고, 그래서 팽창한다(입자의 크기와 수는 그대로다).
// 책에서: 단원의 첫 그림(여름과 겨울의 전깃줄, 철로의 틈), 가열 전과 후의 입자 그림, "철로의 틈"(열팽창에 대비해 틈을 둔다).
// 학생이 정하는 것: 겨울에 철로 두 개를 어떻게 놓을지(틈 없이 붙여서, 또는 틈을 두고). 그다음 온도 막대로 한여름까지 데운다.
// 실패하는 길: 틈 없이 놓으면 여름에 늘어난 두 철로가 서로 밀어 위로 휜다. 겨울로 되돌려 다시 놓아야 한다.
//   위: 양 끝을 고정한 철로 두 개와 가운데의 이음 자리   아래: 철로 속을 확대한 창(입자의 떨림과 사이 거리)
// 흐름: 놓기 → 여름까지 데우기(휘면 되돌려 다시) → 판정 → 결론.
// 휜 모양은 계산으로 그린다: 한쪽 끝이 고정된 길이 L + d의 철로가 가로 L 안에 들어가려면 acos(L / (L + d))만큼 들린다.
// 늘어나는 길이는 잘 보이게 실제보다 훨씬 크게 그렸다(무대에 "실제보다 크게 그린 그림"이라고 적는다).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { tempColor, drawGlowParticle } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, pill, rr, txt, SUB, type Ctx } from "./kit";

interface RailStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const T_MIN = -10;
const T_MAX = 60;
const X0 = 20;
const X1 = 326;
const MID = (X0 + X1) / 2;
const GAP = 14; // 틈을 두고 놓았을 때 겨울의 틈(px)
const GROW = 6; // 한여름에 철로 하나가 늘어나는 길이(px)
const Y = 70;
const COLS = 9;
const ROWS = 3;

export const railLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RailStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 3, cls: "u3x-rail", api });

  let T = T_MIN;
  let shown = T_MIN;
  let laid: "none" | "tight" | "gap" = "none";
  let buckled = false; // 틈 없이 놓고 여름을 겪었다
  let okSummer = false;
  let phase: "play" | "ask" | "done" = "play";
  const seeds = Array.from({ length: COLS * ROWS }, (_, i) => ({ a: (i * 2.399) % 6.283, f: 0.012 + ((i * 7) % 5) * 0.0015 }));

  function rail(ctx: Ctx, fromLeft: boolean, len: number, lift: number, k: number): void {
    // 고정된 끝에서 len만큼 뻗고, lift(라디안)만큼 이음 자리 쪽이 들린다
    ctx.save();
    ctx.translate(fromLeft ? X0 : X1, Y);
    ctx.rotate(fromLeft ? -lift : lift);
    rr(ctx, fromLeft ? 0 : -len, -9, len, 18, 3);
    ctx.fillStyle = tempColor(0.12 + 0.8 * k, 0.6);
    ctx.fill();
    ctx.strokeStyle = tempColor(0.12 + 0.8 * k);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    host.dataset.u3Rail = `${laid}:${buckled ? "buckled" : okSummer ? "ok" : "open"}`;
    shown += (T - shown) * Math.min(1, 0.2 * dt);
    const k = (shown - T_MIN) / (T_MAX - T_MIN);
    const grow = GROW * k;
    // 침목과 자갈
    ctx.fillStyle = "#3A475F";
    for (let x = X0 + 8; x < X1; x += 26) ctx.fillRect(x, Y + 9, 10, 8);
    rr(ctx, X0 - 8, Y + 17, X1 - X0 + 16, 8, 4);
    ctx.fillStyle = "#2A3A55";
    ctx.fill();
    // 고정 못
    ctx.fillStyle = "#AEB9CC";
    ctx.fillRect(X0 - 4, Y - 14, 6, 28);
    ctx.fillRect(X1 - 2, Y - 14, 6, 28);
    if (laid === "none") {
      txt(ctx, "철로 두 개를 놓을 자리", MID, Y - 2, { size: 12.5, color: SUB });
    } else {
      const base = MID - X0 - (laid === "gap" ? GAP / 2 : 0); // 겨울의 길이
      const len = base + grow;
      const span = MID - X0; // 이음 자리까지의 가로 거리
      const lift = len > span ? Math.acos(span / len) : 0;
      rail(ctx, true, len, lift, k);
      rail(ctx, false, len, lift, k);
      if (lift > 0.02) txt(ctx, "서로 밀어 휘었어요", MID, Y + 44, { size: 12.5, color: "#FF8F8F", weight: 800 });
      else if (laid === "gap") txt(ctx, k > 0.9 ? "틈이 좁아졌어요" : "틈", MID, Y + 44, { size: 12.5, color: k > 0.9 ? "#7BE0B0" : SUB, weight: 800 });
      else txt(ctx, "틈 없이 붙였어요", MID, Y + 44, { size: 12.5, color: SUB, weight: 700 });
    }
    pill(ctx, `철로의 온도 ${Math.round(shown)}℃`, 78, 20, { dot: tempColor(0.12 + 0.8 * k) });
    txt(ctx, shown < 5 ? "겨울" : shown > 45 ? "한여름" : "", 300, 20, { size: 13, weight: 800, color: tempColor(0.12 + 0.8 * k) });
    // 확대 창: 입자는 제자리에서 떨고, 뜨거울수록 사이가 멀어진다(크기와 수는 그대로)
    rr(ctx, 28, 126, 290, 84, 12);
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(205,225,250,.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const gap = 21 * (1 + 0.22 * k);
    const amp = 0.4 + 3.6 * k;
    const y0 = 168 - gap;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const sd = seeds[c * ROWS + r];
        drawGlowParticle(ctx, 50 + c * gap + Math.sin(tMs * sd.f * 2 + sd.a) * amp, y0 + r * gap + Math.cos(tMs * sd.f * 2.6 + sd.a * 1.7) * amp, 5.5, 0.12 + 0.8 * k, 1.5);
      }
    }
    txt(ctx, "철로 속을 확대한 창", 30, 222, { size: 12, color: SUB, align: "left", weight: 600 });
    txt(ctx, "실제보다 크게 그린 그림", 314, 222, { size: 12, color: SUB, align: "right", weight: 600 });
  });

  const tight = bvBtn("", "틈 없이 붙여 놓기");
  const spaced = bvBtn("", "틈을 두고 놓기");
  const range = bvRange({
    cls: "u3x-range",
    min: T_MIN,
    max: T_MAX,
    value: T,
    label: "철로의 온도",
    ticks: ["겨울 영하 10℃", "한여름 60℃"],
    onInput: (v) => {
      T = v;
      if (phase !== "play" || laid === "none") return;
      if (T >= 56) {
        if (laid === "tight" && !buckled) {
          buckled = true;
          haptic(HAPTIC.wrong);
        } else if (laid === "gap" && !okSummer) {
          okSummer = true;
          haptic(HAPTIC.correct);
          f.pips(2);
        }
      }
      hint();
    },
    onChange: () => {
      if (phase !== "play") return;
      if (laid === "tight" && buckled && T <= -6) {
        // 겨울로 되돌렸다: 다시 놓을 수 있다
        laid = "none";
        buckled = false;
        tight.disabled = true; // 해 본 길은 닫는다
        spaced.disabled = false;
        range.input.disabled = true;
        f.pips(0);
        f.say("겨울이 되자 철로가 다시 줄어 펴졌어요. 이번엔 어떻게 놓을까요?");
      } else if (laid === "gap" && okSummer) {
        phase = "ask";
        range.input.disabled = true;
        tm.later(askFinal, 1500);
      }
    },
  });
  range.input.disabled = true;

  function hint(): void {
    if (phase !== "play") return;
    if (laid === "none") f.say("겨울이에요. 양 끝을 고정한 <b>철로 두 개</b>를 놓을 거예요. 가운데 이음 자리를 어떻게 할까요?");
    else if (laid === "tight") f.say(buckled ? "늘어난 철로가 갈 곳이 없어 <b>위로 휘었어요</b>. 기차가 다닐 수 없어요. 겨울로 되돌려 다시 놓아 봐요." : "틈 없이 놓았어요. <b>온도 막대</b>를 밀어 한여름까지 데워 봐요. 철로 끝과 입자를 봐요.");
    else f.say(okSummer ? "철로가 늘어나 <b>틈이 좁아졌지만</b> 휘지 않았어요. 입자 사이가 멀어진 만큼 철로가 길어졌어요." : "틈을 두고 놓았어요. <b>온도 막대</b>를 밀어 한여름까지 데워 봐요. 틈과 입자를 봐요.");
  }

  const lay = (how: "tight" | "gap"): void => {
    if (phase !== "play" || laid !== "none") return;
    haptic(HAPTIC.tap);
    laid = how;
    tight.disabled = spaced.disabled = true;
    range.input.disabled = false;
    f.pips(1);
    hint();
    api.setCTA("한여름까지 데워 보세요", { enabled: false });
  };
  tight.addEventListener("click", () => lay("tight"));
  spaced.addEventListener("click", () => lay("gap"));

  function askFinal(): void {
    f.say("한여름의 철로예요. 무대의 <b>확대 창</b>을 보고 골라 봐요.");
    f.slot.ask(
      "한여름에 철로가 길어진 까닭은?",
      [{ t: "입자 사이의 거리가 멀어져서", ok: true }, { t: "입자 하나하나가 커져서" }, { t: "입자의 수가 늘어나서" }],
      (ok) => api.recordQuiz(ok),
      { why: "입자의 <b>크기와 수는 그대로</b>이고 사이만 벌어졌어요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("물체가 열을 받으면 입자 운동이 활발해져 <b>입자 사이가 멀어지고</b>, 그래서 길이와 부피가 늘어나요. 이것이 <b>열팽창</b>이에요. 그래서 철로에는 틈을 둬요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(el("div", { class: "u3x-row" }, tight, spaced), range.el);
  hint();
  api.setCTA("철로 두 개를 놓아 보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.stop();
  };
};
