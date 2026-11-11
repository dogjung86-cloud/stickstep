// [중1 Ⅲ v5] u3l5 u3TapeLab: 「붙인 두 띠는 어느 쪽으로 휠까?」
// 한 통찰: 같은 열을 받아도 열팽창하는 정도는 물질마다 다르다. 두 물질을 붙여 가열하면 덜 늘어나는 쪽으로 휜다(바이메탈).
// 책의 활동(알루미늄박에 종이를 붙인 테이프를 가열한다)과 그림(전기다리미 속 바이메탈)을 차례로 손으로 한다.
//   1 알루미늄박이 위, 종이가 아래인 띠를 가열(꾹 누르기): 종이 쪽(아래)으로 휜다. 손을 떼면 식으며 펴진다.
//   2 띠를 뒤집어(종이가 위) 가열: 이번엔 위로 휜다. 어느 쪽이 위든 종이 쪽으로 휜다.
//   3 다리미 속 바이메탈: 전원을 켜면 뜨거워진 띠가 열팽창 정도가 작은 금속 쪽으로 휘어 접점에서 떨어지고(전기 끊김), 식으면 다시 붙는다.
// 흐름: 예측(정오 없음) → 1 → 2 → 3 → 판정 → 결론.
// 띠의 모양은 계산으로 그린다: 휜 정도(곡률)가 정해지면 띠는 원호이고, 두 겹은 그 원호에서 두께의 반만큼 안팎으로 떨어진 선이다
// (바깥 겹이 저절로 더 길다). 휘는 정도는 잘 보이게 실제보다 크게 잡았다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, u3Hold, hotPlate, pill, rr, txt, SUB, type Ctx } from "./kit";

interface TapeStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const X0 = 64;
const Y0 = 104;
const LEN = 178;
const THICK = 7;
const BEND = 0.0046; // 가장 뜨거울 때의 곡률(1/px)
const C_AL = "#C9D3E0";
const C_PAPER = "#F1E3BE";
const C_SMALL = "#8FA3C4"; // 열팽창 정도가 작은 금속
const C_BIG = "#D08A5A"; // 열팽창 정도가 큰 금속

export const tapeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TapeStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 4, cls: "u3x-tape", api });

  let stage: "predict" | "alTop" | "paperTop" | "iron" | "ask" | "done" = "predict";
  let heat = 0; // 0~1
  let heating = false;
  let reached = false; // 이 배치에서 끝까지 휘어 봤는가
  let power = false; // 다리미 전원
  let cuts = 0; // 바이메탈이 전기를 끊은 횟수
  let contact = true;
  let pred = "";

  /** 띠 한 겹. off: 가운데 원호에서 위쪽(+)이나 아래쪽(-)으로 떨어진 거리. kappa > 0이면 위로 휜다. */
  function layer(ctx: Ctx, kappa: number, off: number, color: string): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = THICK;
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const sLen = (LEN * i) / 40;
      const th = kappa * sLen;
      const px = Math.abs(kappa) < 1e-5 ? sLen : Math.sin(th) / kappa;
      const py = Math.abs(kappa) < 1e-5 ? 0 : -(1 - Math.cos(th)) / kappa;
      const x = X0 + px - Math.sin(th) * off;
      const y = Y0 + py - Math.cos(th) * off;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
  const swatch = (ctx: Ctx, x: number, y: number, color: string, label: string): void => {
    rr(ctx, x, y - 5, 16, 10, 3);
    ctx.fillStyle = color;
    ctx.fill();
    txt(ctx, label, x + 21, y + 0.5, { size: 12.5, align: "left", weight: 600 });
  };

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = stage;
    host.dataset.u3Reached = reached ? "1" : "0";
    host.dataset.u3Cuts = String(cuts);
    const iron = stage === "iron" || stage === "ask" || stage === "done";
    // 온도: 가열 중이면 오르고 아니면 식는다. 다리미는 접점이 붙어 있는 동안만 전기가 흘러 뜨거워진다.
    const on = iron ? power && contact : heating;
    heat = Math.max(0, Math.min(1, heat + (on ? dt / (iron ? 170 : 95) : -dt / (iron ? 230 : 150))));
    if (!iron && heat >= 1 && !reached) onReached();
    // 위쪽 겹과 아래쪽 겹, 휘는 방향(덜 늘어나는 쪽으로)
    const paperOnTop = stage === "paperTop";
    const topC = iron ? C_SMALL : paperOnTop ? C_PAPER : C_AL;
    const botC = iron ? C_BIG : paperOnTop ? C_AL : C_PAPER;
    const dir = iron || paperOnTop ? 1 : -1; // +1: 위로 휜다
    const kappa = dir * BEND * heat;
    // 고정대
    rr(ctx, 30, 60, 16, 150, 4);
    ctx.fillStyle = "#3A475F";
    ctx.fill();
    rr(ctx, 40, Y0 - 13, 30, 26, 5);
    ctx.fillStyle = "#55657C";
    ctx.fill();
    if (iron) {
      // 회로: 고정대 → 전원 → 전열선 → 접점
      if (contact && heat > 0.36) {
        contact = false;
        cuts += 1;
        onCut();
      } else if (!contact && heat < 0.1) contact = true;
      const live = power && contact;
      ctx.strokeStyle = live ? "#FFD666" : "rgba(205,225,250,.45)";
      ctx.lineWidth = 2.4;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(38, Y0 + 13);
      ctx.lineTo(38, 196);
      ctx.lineTo(X0 + LEN + 8, 196);
      ctx.lineTo(X0 + LEN + 8, Y0 + 12);
      ctx.stroke();
      // 접점(띠 끝 아래의 받침)
      rr(ctx, X0 + LEN - 6, Y0 + 5, 28, 8, 3);
      ctx.fillStyle = "#AEB9CC";
      ctx.fill();
      // 전열선(물결)
      ctx.strokeStyle = live ? "#FF7A3D" : "rgba(205,225,250,.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const x = 110 + i * 4;
        const y = 196 + (i % 2 ? -6 : 6) * (i === 0 || i === 24 ? 0 : 1);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
      txt(ctx, "전열선", 158, 218, { size: 12, color: SUB, weight: 600 });
      pill(ctx, !power ? "전원 꺼짐" : live ? "전기가 흘러요" : "전기가 끊겼어요", 262, 150, { size: 12.5, dot: live ? "#FFD666" : "#8794AA" });
      swatch(ctx, 70, 26, C_SMALL, "열팽창 정도가 작은 금속");
      swatch(ctx, 70, 44, C_BIG, "열팽창 정도가 큰 금속");
    } else {
      hotPlate(ctx, 90, 200, 170, heating ? 1 : 0);
      if (heat > 0.05) {
        // 올라오는 열기
        ctx.strokeStyle = `rgba(255,150,70,${0.5 * heat})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const x = 116 + i * 40;
          const ph = tMs / 240 + i;
          ctx.beginPath();
          ctx.moveTo(x, 194);
          ctx.quadraticCurveTo(x + 6 * Math.sin(ph), 180, x, 166);
          ctx.stroke();
        }
      }
      swatch(ctx, 70, 26, topC, paperOnTop ? "종이 (위)" : "알루미늄박 (위)");
      swatch(ctx, 70, 44, botC, paperOnTop ? "알루미늄박 (아래)" : "종이 (아래)");
      if (heat < 0.03 && !reached) txt(ctx, "가열 전: 곧게 펴져 있어요", 170, 138, { size: 12, color: SUB, weight: 600 });
    }
    layer(ctx, kappa, THICK / 2, topC);
    layer(ctx, kappa, -THICK / 2, botC);
  });

  const hold = u3Hold("가열하기 (꾹 누르고 있기)", (down) => {
    if (stage !== "alTop" && stage !== "paperTop") return;
    heating = down;
    if (down) f.say("가열 중! 띠가 어느 쪽으로 휘는지 봐요. 끝까지 누르고 있어요.");
    else if (!reached) f.say("손을 떼니 띠가 식으며 다시 펴져요. 끝까지 <b>꾹</b> 눌러 주세요.");
  });
  const act = bvBtn("", "띠 뒤집기");
  act.hidden = true;

  function onReached(): void {
    reached = true;
    haptic(HAPTIC.ctaUnlock);
    if (stage === "alTop") {
      f.pips(1);
      const head = pred.includes("종이") ? "예측대로" : "예측과 달리";
      f.say(`${head} 띠가 <b>종이 쪽</b>(아래)으로 휘었어요. 손을 떼면 식으며 펴져요. 이번엔 띠를 뒤집어 봐요.`);
      act.textContent = "띠 뒤집기 (종이를 위로)";
    } else {
      f.pips(2);
      f.say("뒤집으니 위로 휘어요. 이번에도 <b>종이 쪽</b>이에요. 알루미늄박이 종이보다 더 많이 늘어나기 때문이에요.");
      act.textContent = "다리미 속 장치 보기";
    }
    act.hidden = false;
  }

  function onCut(): void {
    if (cuts === 1) {
      haptic(HAPTIC.correct);
      f.pips(3);
      f.say("뜨거워진 띠가 <b>열팽창 정도가 작은 금속</b> 쪽으로 휘어 접점에서 떨어졌어요. 전기가 끊겨 더 뜨거워지지 않아요.");
    } else if (cuts === 2 && stage === "iron") {
      stage = "ask";
      tm.later(askFinal, 500);
    }
  }

  act.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    if (stage === "alTop" && reached) {
      stage = "paperTop";
      heat = 0;
      heating = false;
      reached = false;
      act.hidden = true;
      f.say("띠를 뒤집었어요. 이제 <b>종이가 위</b>, 알루미늄박이 아래예요. 다시 가열해 봐요. 어느 쪽으로 휠까요?");
    } else if (stage === "paperTop" && reached) {
      stage = "iron";
      heat = 0;
      heating = false;
      hold.hidden = true;
      act.textContent = "전원 켜기";
      act.classList.add("main");
      f.say("전기다리미 속 장치예요. 두 금속을 붙인 띠가 전기의 길을 잇고 있어요. <b>전원</b>을 켜 봐요.");
      api.setCTA("전원을 켜고 띠를 지켜보세요", { enabled: false });
    } else if (stage === "iron" && !power) {
      power = true;
      act.disabled = true;
      act.textContent = "전원 켜짐";
      f.say("전기가 흘러 전열선이 뜨거워져요. 띠도 함께 뜨거워지는데, 어떻게 되는지 지켜봐요.");
    }
  });

  function askFinal(): void {
    f.say("식으면 다시 붙어 전기가 흐르고, 뜨거워지면 또 끊겨요. 그래서 다리미가 너무 뜨거워지지 않아요.");
    f.slot.ask(
      "두 물질을 붙인 띠를 가열하면 어느 쪽으로 휘나요?",
      [{ t: "덜 늘어나는 물질 쪽으로", ok: true }, { t: "더 늘어나는 물질 쪽으로" }, { t: "늘 위쪽으로" }],
      (ok) => api.recordQuiz(ok),
      { why: "더 늘어나는 쪽이 <b>바깥</b>, 덜 늘어나는 쪽이 <b>안쪽</b>이 돼요.", onNext: finish },
    );
  }

  function finish(): void {
    stage = "done";
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("같은 열을 받아도 <b>열팽창하는 정도는 물질마다 달라요</b>. 그래서 두 물질을 붙여 가열하면 덜 늘어나는 쪽으로 휘어요. 이것을 쓴 장치가 <b>바이메탈</b>이에요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(hold, act);
  api.setCTA("띠를 가열해 보세요", { enabled: false });
  f.say("알루미늄박 아래에 종이를 붙여 만든 띠예요. 한쪽 끝을 고정하고 가열할 거예요. 먼저 <b>예측</b>부터 해 봐요.");
  f.slot.ask(
    "가열하면 띠는 어떻게 될까요?",
    [{ t: "종이 쪽(아래)으로 휜다" }, { t: "알루미늄박 쪽(위)으로 휜다" }, { t: "곧은 채로 길어지기만 한다" }],
    () => undefined,
    {
      predict: true,
      onNext: () => {
        pred = f.slot.qBox.querySelector(".bv-choice.sel")?.textContent ?? "";
        stage = "alTop";
        f.slot.showControls();
        f.say("<b>가열하기</b>를 꾹 눌러 봐요. 띠가 어느 쪽으로 휘는지 끝까지 지켜봐요.");
        api.setCTA("띠를 가열해 보세요", { enabled: false });
      },
    },
  );
  return () => {
    tm.clear();
    cv.stop();
  };
};
