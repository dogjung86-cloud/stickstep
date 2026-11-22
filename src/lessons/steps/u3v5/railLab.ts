// [중1 Ⅲ v5] u3l5 u3RailLab: 「한여름의 철로에는 무슨 일이 생길까?」
// 한 통찰: 물체가 열을 받으면 입자 운동이 활발해져 입자 사이의 거리가 멀어지고, 그래서 팽창한다(입자의 크기와 수는 그대로다).
// 다루는 장면: 단원의 첫 장면(여름과 겨울의 전깃줄, 철로의 틈), 가열 전과 후의 입자 그림, "철로의 틈"(열팽창에 대비해 틈을 둔다).
// 학생이 정하는 것: 겨울에 철로 두 개를 어떻게 놓을지(틈 없이 붙여서, 또는 틈을 두고). 그다음 온도 막대로 한여름까지 데운다.
// 실패하는 길: 틈 없이 놓으면 여름에 늘어난 두 철로가 서로 밀어 위로 휜다. 겨울로 되돌려 다시 놓아야 한다.
//   위: 양 끝을 고정한 철로 두 개와 가운데의 이음 자리   아래: 철로 속을 확대한 창(입자의 떨림과 사이 거리)
// 흐름: 놓기 → 여름까지 데우기(휘면 되돌려 다시) → 판정 → 결론.
// 휜 모양은 계산으로 그린다: 한쪽 끝이 고정된 길이 L + d의 철로가 가로 L 안에 들어가려면 acos(L / (L + d))만큼 꺾인다.
// 늘어나는 길이는 잘 보이게 실제보다 훨씬 크게 그렸다(무대에 "변화를 과장하여 나타낸 모형"이라고 적는다).
// 2026-11-15 그래픽 감사 고침:
//   · 철로를 위에서 본 모습으로 그린다(두 줄의 레일과 침목, 자갈 바닥). 틈 없이 놓은 철로는 한여름에 옆으로 휜다.
//     옆에서 본 그림은 두 철로가 위로 솟아 지붕 모양이 되었는데, 실제 철로는 주로 옆으로 휜다.
//   · 판정과 결론 때 확대 창에 겨울의 입자 자리를 점선 고리로 겹쳐 둔다(같은 수, 같은 크기, 사이만 다름). 오답 보기(입자가 커져서,
//     입자 수가 늘어나서)를 가를 기준이다. 철로의 겨울 끝 자리도 점선으로 남긴다.
//   · 입자는 제자리 격자를 지키고(흔들림을 줄임) 떨림은 입자 곁의 호 무늬로 보인다. 크게 흔들어 배열이 흐트러져 녹은 것처럼 보였다.

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
const GROW = 5; // 한여름에 철로 하나가 늘어나는 길이(px)
const Y = 70; // 철로(위에서 본 모습)의 가운데 줄
const COLS = 9;
const ROWS = 3;
const PG = 19.5; // 겨울의 입자 사이(px). 한여름에는 1.22배
const PX0 = 50; // 확대 창에서 첫 입자의 x
const PYC = 168; // 확대 창에서 가운데 줄의 y
// 자갈 바닥의 작은 돌(고정 무늬)
const GRAVEL = Array.from({ length: 70 }, (_, i) => ({ x: X0 - 8 + ((i * 47.3) % (X1 - X0 + 16)), y: Y - 20 + ((i * 29.7) % 40), r: 1.2 + (i % 3) * 0.5 }));

export const railLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RailStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 3, cls: "u3x-rail", api, tall: true });

  let T = T_MIN;
  let shown = T_MIN;
  let laid: "none" | "tight" | "gap" = "none";
  let buckled = false; // 틈 없이 놓고 여름을 겪었다
  let okSummer = false;
  let phase: "play" | "ask" | "done" = "play";
  const seeds = Array.from({ length: COLS * ROWS }, (_, i) => ({ a: (i * 2.399) % 6.283, f: 0.012 + ((i * 7) % 5) * 0.0015 }));

  /** 철로 한 토막(위에서 본 모습: 침목과 두 줄의 레일). 고정된 끝에서 len만큼 뻗고, lift(라디안)만큼 이음 자리 쪽이 옆으로 꺾인다. */
  function rail(ctx: Ctx, fromLeft: boolean, len: number, lift: number, k: number): void {
    ctx.save();
    ctx.translate(fromLeft ? X0 : X1, Y);
    ctx.rotate(fromLeft ? -lift : lift);
    const sx = (s: number, w: number): number => (fromLeft ? s : -s - w);
    // 침목(철로와 함께 움직인다)
    for (let s = 8; s < len - 4; s += 26) {
      rr(ctx, sx(s, 8), -17, 8, 34, 2);
      ctx.fillStyle = "#4A5872";
      ctx.fill();
    }
    // 두 줄의 레일
    for (const off of [-9, 9]) {
      rr(ctx, sx(0, len), off - 3, len, 6, 2);
      ctx.fillStyle = tempColor(0.12 + 0.8 * k, 0.85);
      ctx.fill();
      ctx.strokeStyle = tempColor(0.12 + 0.8 * k);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  /** 떨림의 호 무늬(입자 한쪽에 겹친 호). 뜨거울수록 겹이 늘고 진해진다. 방향(th)은 입자마다 다르다(이웃끼리 마주 보는 ')(' 무늬 방지). */
  function arcs(ctx: Ctx, x: number, y: number, k: number, th: number, most = 2): void {
    const n = Math.min(most, k > 0.6 ? 2 : 1);
    ctx.strokeStyle = tempColor(0.12 + 0.8 * k);
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    const dim = most < 2 ? 0.6 : 1; // 판정 때는 겨울 자리 고리와 견주기 쉽게 옅게
    for (let i = 0; i < n; i++) {
      ctx.globalAlpha = (0.35 + 0.5 * k) * (1 - i * 0.3) * dim;
      ctx.beginPath();
      ctx.arc(x, y, 8.4 + i * 2.8, th - 0.6, th + 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    host.dataset.u3Rail = `${laid}:${buckled ? "buckled" : okSummer ? "ok" : "open"}`;
    shown += (T - shown) * Math.min(1, 0.2 * dt);
    const k = (shown - T_MIN) / (T_MAX - T_MIN);
    const grow = GROW * k;
    const judging = phase !== "play";
    // 자갈 바닥(위에서 본 모습)
    rr(ctx, X0 - 12, Y - 22, X1 - X0 + 24, 44, 9);
    ctx.fillStyle = "#1C293E";
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.07)";
    for (const g of GRAVEL) {
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (laid === "none") {
      txt(ctx, "철로 두 개를 놓을 자리", MID, Y, { size: 12.5, color: SUB });
    } else {
      const base = MID - X0 - (laid === "gap" ? GAP / 2 : 0); // 겨울의 길이
      const len = base + grow;
      const span = MID - X0; // 이음 자리까지의 가로 거리
      const lift = len > span ? Math.acos(span / len) : 0;
      rail(ctx, true, len, lift, k);
      rail(ctx, false, len, lift, k);
      if (judging && laid === "gap") {
        // 겨울의 철로 끝 자리(점선)
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = "rgba(170,205,245,.9)";
        ctx.lineWidth = 1.6;
        for (const x of [MID - GAP / 2, MID + GAP / 2]) {
          ctx.beginPath();
          ctx.moveTo(x, Y - 19);
          ctx.lineTo(x, Y + 19);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        txt(ctx, "겨울의 끝 자리", MID, Y - 31, { size: 12, color: "#AACDF5", weight: 700 });
      }
      if (lift > 0.02) txt(ctx, "서로 밀어 휘었어요", MID, Y + 40, { size: 12.5, color: "#FF8F8F", weight: 800 });
      else if (laid === "gap") txt(ctx, k > 0.9 ? "틈이 좁아졌어요" : "틈", MID, Y + 40, { size: 12.5, color: k > 0.9 ? "#7BE0B0" : SUB, weight: 800 });
      else txt(ctx, "틈 없이 붙였어요", MID, Y + 40, { size: 12.5, color: SUB, weight: 700 });
    }
    // 고정 못(양 끝)
    ctx.fillStyle = "#AEB9CC";
    ctx.fillRect(X0 - 6, Y - 17, 7, 34);
    ctx.fillRect(X1 - 1, Y - 17, 7, 34);
    txt(ctx, "위에서 본 철로", X1 + 4, Y + 40, { size: 12, color: SUB, align: "right", weight: 600 });
    pill(ctx, `철로의 온도 ${Math.round(shown)}℃`, 78, 20, { dot: tempColor(0.12 + 0.8 * k) });
    txt(ctx, shown < 5 ? "겨울" : shown > 45 ? "한여름" : "", 300, 20, { size: 13, weight: 800, color: tempColor(0.12 + 0.8 * k) });
    // 확대 창: 입자는 제자리에서 떨고(호 무늬), 뜨거울수록 사이가 멀어진다(크기와 수는 그대로)
    rr(ctx, 28, 126, 290, 84, 12);
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(205,225,250,.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const gap = PG * (1 + 0.22 * k);
    const amp = 0.25 + 0.9 * k;
    if (judging) {
      // 겨울의 입자 자리(같은 수, 같은 크기)를 점선 고리로 겹친다
      ctx.setLineDash([2.5, 2.5]);
      ctx.strokeStyle = "rgba(170,205,245,.85)";
      ctx.lineWidth = 1.3;
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          ctx.beginPath();
          ctx.arc(PX0 + c * PG, PYC + (r - 1) * PG, 5.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const sd = seeds[c * ROWS + r];
        const x = PX0 + c * gap + Math.sin(tMs * sd.f * 2 + sd.a) * amp;
        const y = PYC + (r - 1) * gap + Math.cos(tMs * sd.f * 2.6 + sd.a * 1.7) * amp;
        arcs(ctx, x, y, k, sd.a * 1.7 + 0.4, judging ? 1 : 2);
        drawGlowParticle(ctx, x, y, 5.5, 0.12 + 0.8 * k, judging ? 1.2 : 1.5);
      }
    }
    if (judging) {
      // 범례: 점선 고리 = 겨울 자리, 칠한 입자 = 지금(한여름)
      ctx.setLineDash([2.5, 2.5]);
      ctx.strokeStyle = "rgba(170,205,245,.95)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(268, 150, 5.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, "겨울", 279, 150.5, { size: 12, color: "#AACDF5", align: "left", weight: 700 });
      drawGlowParticle(ctx, 268, 176, 5.5, 0.12 + 0.8 * k, 1.2);
      txt(ctx, "한여름", 279, 176.5, { size: 12, color: tempColor(0.12 + 0.8 * k), align: "left", weight: 700 });
    }
    txt(ctx, "철로 속 입자 확대", 30, 222, { size: 12, color: SUB, align: "left", weight: 600 });
    txt(ctx, "변화를 과장하여 나타낸 모형", 314, 222, { size: 12, color: SUB, align: "right", weight: 600 });
  });

  const tight = bvBtn("", "빈틈없이 붙여 놓기");
  const spaced = bvBtn("", "틈을 남겨 두고 놓기");
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
        f.say("다시 겨울로 낮추니 철로가 줄어들며 곧게 펴졌어요. 이번에는 이음매를 어떻게 놓아 볼까요?");
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
    if (laid === "none") f.say("추운 겨울날, 양 끝이 고정된 <b>철로 두 개</b>를 이어 놓으려고 해요. 가운데 이음매를 어떻게 놓을지 골라 보세요.");
    else if (laid === "tight") f.say(buckled ? "길어진 철로가 밀려 나갈 공간이 없어서 <b>옆으로 휘어 버렸어요</b>! 이대로는 기차가 다닐 수 없으니 온도를 다시 겨울로 낮춘 뒤 다른 방법으로 놓아 보세요." : "철로를 빈틈없이 붙여 놓았어요. 이제 <b>철로의 온도</b> 막대를 오른쪽으로 밀어 한여름까지 온도를 올려 보세요.");
    else f.say(okSummer ? "철로가 길어지면서 <b>미리 남겨 둔 틈이 좁아졌지만</b> 철로가 휘지는 않았어요! 입자 사이의 거리가 멀어진 만큼 철로가 길어진 거예요." : "철로 사이에 틈을 남겨 두고 놓았어요. 이제 <b>철로의 온도</b> 막대를 오른쪽으로 밀어 한여름까지 온도를 올려 보세요.");
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
    f.say("한여름에 뜨거워진 철로 속 입자의 모습을 보고 답해 보세요.");
    f.slot.ask(
      "한여름에 온도가 올라가면 철로가 길어지는 까닭은 무엇인가요?",
      [{ t: "입자 운동이 활발해져 입자 사이의 거리가 멀어져서", ok: true }, { t: "철로를 이루는 입자 하나하나의 크기가 커져서" }, { t: "철로를 이루는 입자의 개수가 늘어나서" }],
      (ok) => api.recordQuiz(ok),
      { why: "온도가 올라가도 입자의 <b>크기와 개수는 변하지 않고</b>, 입자 사이의 거리만 멀어져요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(3);
    f.say("온도가 올라갈 때 철로가 왜 길어지는지 입자 모형으로 확인했어요!");
    f.slot.conclude("물체가 열을 받으면 입자 운동이 활발해지면서 <b>입자 사이의 거리가 멀어져</b> 길이와 부피가 늘어나요. 이 현상을 <b>열팽창</b>이라고 해요. 기차선로에 미리 틈을 남겨 두는 것도 열팽창 때문이에요.");
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
