// [중1 Ⅲ v5] u3l5 u3TapeLab: 「붙인 두 띠는 어느 쪽으로 휠까?」
// 한 통찰: 같은 열을 받아도 열팽창하는 정도는 물질마다 다르다. 두 물질을 붙여 가열하면 덜 늘어나는 쪽으로 휜다(바이메탈).
// 책의 활동(알루미늄박에 종이를 붙인 테이프를 가열한다)과 그림(전기다리미 속 바이메탈)을 차례로 손으로 한다.
//   1 알루미늄박이 위, 종이가 아래인 띠를 가열(꾹 누르기): 종이 쪽(아래)으로 휜다. 손을 떼면 식으며 펴진다.
//   2 띠를 뒤집어(종이가 위) 가열: 이번엔 위로 휜다. 어느 쪽이 위든 종이 쪽으로 휜다.
//   3 다리미 속 바이메탈: 전원을 켜면 뜨거워진 띠가 열팽창 정도가 작은 금속 쪽으로 휘어 접점에서 떨어지고(전기 끊김), 식으면 다시 붙는다.
// 흐름: 예측(정오 없음) → 1 → 2 → 3 → 판정 → 결론.
// 띠의 모양은 계산으로 그린다: 휜 정도(곡률)가 정해지면 띠는 원호이고, 두 겹은 그 원호에서 두께의 반만큼 안팎으로 떨어진 선이다
// (바깥 겹이 저절로 더 길다). 휘는 정도는 잘 보이게 실제보다 크게 잡았다.
// 2026-11-15 그래픽 감사 고침:
//   · 다리미 장면: 띠는 데워지자마자 휘기 시작해 끝이 접점에서 떨어졌는데 끊기기 전까지 '전기가 흘러요'가 함께 보였다.
//     이제 접점은 띠 끝 아래를 받치는 탄성 접점(용수철 판)이라 띠 끝을 따라 올라가며 붙어 있다가, 끊기는 순간 제자리로 튕겨 내려가
//     그때에만 틈이 생긴다(틈을 노란 점선 고리로 가장 진하게). 식어 띠 끝이 내려오면 접점이 다시 올라와 붙는다.
//     회로에 콘센트를 그리고, 띠는 데워질수록 달아오른 빛을 두른다.
//   · 색의 뜻: 많이 늘어나는 금속은 구리색, 적게 늘어나는 금속은 짙은 회색, 알루미늄박은 은백색(같은 파랑 회색이 '많이'와 '적게'를 오갔다).
//     정리 카드 미니아트 둘(heatFigures의 diffExpand, bimetalArt)도 같은 색이다.

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
const C_AL = "#D5DBE3"; // 알루미늄박(은백색)
const C_PAPER = "#F1E3BE";
const C_SMALL = "#737D8A"; // 열팽창 정도가 작은 금속(짙은 회색)
const C_BIG = "#C8794A"; // 열팽창 정도가 큰 금속(구리색)
const CUT = 0.36; // 접점이 떨어지는 열(이때 띠 끝은 26px쯤 올라가 있다)
const REJOIN = 0.1; // 다시 붙는 열
const POST_X = 286; // 탄성 접점의 기둥
const REST = Y0 + THICK + 4.5; // 접점 단추 가운데의 제자리(곧은 띠의 아랫면에 닿는다)

/** 두 #rrggbb 색을 t(0~1)만큼 섞는다. */
function mix(a: string, b: string, t: number): string {
  const p = (c: string, i: number): number => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const ch = (i: number): number => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t);
  return `rgb(${ch(0)},${ch(1)},${ch(2)})`;
}

export const tapeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TapeStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 4, cls: "u3x-tape", api, tall: true });

  let stage: "predict" | "alTop" | "paperTop" | "iron" | "ask" | "done" = "predict";
  let heat = 0; // 0~1
  let heating = false;
  let reached = false; // 이 배치에서 끝까지 휘어 봤는가
  let power = false; // 다리미 전원
  let cuts = 0; // 바이메탈이 전기를 끊은 횟수
  let contact = true;
  let pred = "";

  /** 띠 한 겹. off: 가운데 원호에서 위쪽(+)이나 아래쪽(-)으로 떨어진 거리. kappa > 0이면 위로 휜다. */
  function layer(ctx: Ctx, kappa: number, off: number, color: string, width = THICK): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
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
  /** 띠 끝(아랫면)의 자리. */
  const endBottom = (kappa: number): { x: number; y: number } => {
    const th = kappa * LEN;
    const px = Math.abs(kappa) < 1e-5 ? LEN : Math.sin(th) / kappa;
    const py = Math.abs(kappa) < 1e-5 ? 0 : -(1 - Math.cos(th)) / kappa;
    return { x: X0 + px + Math.sin(th) * THICK, y: Y0 + py + Math.cos(th) * THICK };
  };
  let leafY = REST; // 탄성 접점 단추의 가운데 y

  /** 벽의 콘센트(전원). 왼쪽과 오른쪽에 전선이 붙는다. */
  function outlet(ctx: Ctx, x: number, y: number, live: boolean): void {
    rr(ctx, x - 14, y - 14, 28, 28, 6);
    const g = ctx.createLinearGradient(0, y - 14, 0, y + 14);
    g.addColorStop(0, "#F4F6FA");
    g.addColorStop(1, "#C9D2DE");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = live ? "#FFD666" : "#8794AA";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = "#2B3440";
    rr(ctx, x - 6.5, y - 6, 3.4, 10, 1.7);
    ctx.fill();
    rr(ctx, x + 3.1, y - 6, 3.4, 10, 1.7);
    ctx.fill();
  }

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
    let gapRing: { x: number; y: number; r: number } | null = null;
    if (iron) {
      // 회로: 콘센트 → 고정대 → 띠 → 접점 → 기둥 → 전열선 → 콘센트
      if (contact && heat > CUT) {
        contact = false;
        cuts += 1;
        onCut();
      } else if (!contact && heat < REJOIN) contact = true;
      const live = power && contact;
      const end = endBottom(kappa);
      // 탄성 접점: 붙어 있는 동안 띠 끝을 따라 올라가고, 끊기면 제자리로 튕겨 내려간다
      const target = contact ? end.y + 4.5 : REST;
      leafY += (target - leafY) * Math.min(1, (contact ? 0.6 : 0.35) * dt);
      const wire = live ? "#FFD666" : "rgba(205,225,250,.45)";
      ctx.strokeStyle = wire;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(56, Y0 + 13);
      ctx.lineTo(56, 196);
      ctx.lineTo(POST_X, 196);
      ctx.stroke();
      outlet(ctx, 82, 196, live);
      txt(ctx, "콘센트", 82, 220, { size: 12, color: SUB, weight: 600 });
      // 전열선(물결)
      ctx.strokeStyle = live ? "#FF7A3D" : "rgba(205,225,250,.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const x = 118 + i * 4;
        const y = 196 + (i % 2 ? -6 : 6) * (i === 0 || i === 24 ? 0 : 1);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
      txt(ctx, "전열선", 166, 220, { size: 12, color: SUB, weight: 600 });
      // 탄성 접점의 기둥과 용수철 판, 단추
      rr(ctx, POST_X - 4, 126, 8, 72, 3);
      ctx.fillStyle = "#55657C";
      ctx.fill();
      const tipX = end.x - 6;
      ctx.strokeStyle = "#AEB9CC";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(POST_X, 130);
      ctx.quadraticCurveTo(tipX + 26, leafY + 22, tipX + 3, leafY + 3);
      ctx.stroke();
      ctx.fillStyle = "#E8EDF4";
      ctx.beginPath();
      ctx.arc(tipX, leafY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7D8AA0";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      txt(ctx, "접점", tipX - 8, leafY + 12, { size: 12, color: "#C9D5E8", align: "right", weight: 700 });
      if (live) {
        // 붙은 자리로 전기가 흐른다
        const sg = ctx.createRadialGradient(tipX, end.y, 0.5, tipX, end.y, 9);
        sg.addColorStop(0, "rgba(255,240,170,.95)");
        sg.addColorStop(1, "rgba(255,214,102,0)");
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(tipX, end.y, 9, 0, Math.PI * 2);
        ctx.fill();
      } else if (power && leafY - 4.5 - end.y > 3) gapRing = { x: tipX, y: (end.y + leafY - 4.5) / 2, r: (leafY - 4.5 - end.y) / 2 + 9 };
      pill(ctx, !power ? "전원 꺼짐" : live ? "전기가 흘러요" : "전기가 끊겼어요", 286, 216, { size: 12.5, dot: live ? "#FFD666" : "#8794AA" });
      swatch(ctx, 70, 26, C_SMALL, "열팽창 정도가 작은 금속");
      swatch(ctx, 70, 44, C_BIG, "열팽창 정도가 큰 금속");
      // 데워진 띠의 빛(달아오를수록 진하게): 띠 둘레에 번지는 주황 빛
      if (heat > 0.03) {
        ctx.save();
        ctx.shadowColor = `rgba(255,140,60,${Math.min(0.95, heat * 2.2).toFixed(2)})`;
        ctx.shadowBlur = 16;
        layer(ctx, kappa, 0, `rgba(255,170,100,${Math.min(0.6, heat * 1.4).toFixed(2)})`, THICK * 2 + 2);
        ctx.restore();
      }
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
    // 다리미의 두 금속은 데워질수록 달아오른 색으로(온도 색)
    const hot = iron ? Math.min(1, heat * 1.8) : 0;
    layer(ctx, kappa, THICK / 2, hot ? mix(topC, "#FFB07A", 0.35 * hot) : topC);
    layer(ctx, kappa, -THICK / 2, hot ? mix(botC, "#FF9A50", 0.3 * hot) : botC);
    if (gapRing) {
      // 접점에서 떨어진 틈: 무대에서 가장 진하게
      const pulse = 1 + 0.08 * Math.sin(tMs / 160);
      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "#FFD666";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(gapRing.x, gapRing.y, gapRing.r * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      txt(ctx, "떨어졌어요", gapRing.x + gapRing.r + 6, gapRing.y, { size: 12.5, color: "#FFD666", align: "left", weight: 800 });
    }
  });

  const hold = u3Hold("꾹 눌러 가열하기", (down) => {
    if (stage !== "alTop" && stage !== "paperTop") return;
    heating = down;
    if (down) f.say("가열하는 중이에요! 두 겹으로 붙인 띠가 어느 쪽으로 휘는지 끝까지 누르며 관찰해 보세요.");
    else if (!reached) f.say("손을 떼면 띠가 식으면서 다시 펴져요. 완전히 휠 때까지 끝까지 <b>꾹</b> 눌러 주세요.");
  });
  const act = bvBtn("", "띠 뒤집기");
  act.hidden = true;

  function onReached(): void {
    reached = true;
    haptic(HAPTIC.ctaUnlock);
    if (stage === "alTop") {
      f.pips(1);
      const head = pred.includes("종이") ? "예측대로" : "예측과 달리";
      f.say(`${head} 가열하자 띠가 아래에 있는 <b>종이 쪽</b>으로 휘었어요! 이번에는 띠의 위아래를 뒤집어서 다시 가열해 볼까요?`);
      act.textContent = "띠 뒤집기 (종이가 위로 오게)";
    } else {
      f.pips(2);
      f.say("띠를 뒤집어 가열하니 이번에는 위쪽에 있는 <b>종이 쪽</b>으로 휘었어요! 알루미늄박이 종이보다 열팽창을 더 많이 해서 덜 늘어나는 종이 쪽으로 밀어내기 때문이에요.");
      act.textContent = "전기다리미 속 바이메탈 보기";
    }
    act.hidden = false;
  }

  function onCut(): void {
    if (cuts === 1) {
      haptic(HAPTIC.correct);
      f.pips(3);
      f.say("금속 띠가 뜨거워지자 <b>열팽창 정도가 작은 금속</b>(위쪽)으로 휘면서 접점에서 떨어졌어요! 덕분에 전기가 자동으로 끊겨 과열을 막아 줘요.");
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
      f.say("전기다리미의 온도를 일정하게 유지해 주는 장치예요. 열팽창 정도가 다른 두 금속을 붙인 띠가 회로를 연결하고 있어요. <b>전원 켜기</b>를 눌러 보세요.");
      api.setCTA("전원을 켜고 띠를 지켜보세요", { enabled: false });
    } else if (stage === "iron" && !power) {
      power = true;
      act.disabled = true;
      act.textContent = "작동 중";
      f.say("전기가 흐르면서 전열선이 뜨거워지고 있어요. 함께 뜨거워진 금속 띠가 어떻게 움직이는지 살펴보세요.");
    }
  });

  function askFinal(): void {
    f.say("온도가 내려가면 금속 띠가 다시 펴져 전기가 흐르고, 너무 뜨거워지면 다시 휘어 전기를 끊어요. 아래 질문에 답해 볼까요?");
    f.slot.ask(
      "열팽창 정도가 다른 두 물질을 붙인 띠를 가열하면 어느 쪽으로 휘나요?",
      [{ t: "열팽창 정도가 작아 덜 늘어나는 쪽으로", ok: true }, { t: "열팽창 정도가 커서 더 많이 늘어나는 쪽으로" }, { t: "위아래 위치와 상관없이 항상 위쪽으로" }],
      (ok) => api.recordQuiz(ok),
      { why: "더 많이 늘어나는 쪽이 바깥쪽을 감싸듯 밀어내므로, <b>덜 늘어나는 쪽(안쪽)</b>으로 휘어져요.", onNext: finish },
    );
  }

  function finish(): void {
    stage = "done";
    f.pips(4);
    f.say("물질마다 열팽창하는 정도가 달라서 생기는 현상과 바이메탈의 원리를 모두 확인했어요!");
    f.slot.conclude("같은 열을 받아도 <b>열팽창하는 정도는 물질의 종류마다 달라요</b>. 열팽창 정도가 다른 두 금속을 붙여 놓으면 가열할 때 덜 늘어나는 쪽으로 휘는데, 이를 이용한 온도 조절 장치를 <b>바이메탈</b>이라고 해요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(hold, act);
  api.setCTA("띠를 가열해 보세요", { enabled: false });
  f.say("위쪽에는 알루미늄박, 아래쪽에는 종이를 붙여서 만든 띠예요. 이 띠를 가열하면 어떻게 될지 먼저 <b>예측</b>해 볼까요?");
  f.slot.ask(
    "알루미늄박과 종이를 붙인 띠를 가열하면 어떻게 될까요?",
    [{ t: "종이 쪽(아래)으로 휜다" }, { t: "알루미늄박 쪽(위)으로 휜다" }, { t: "휘지 않고 반듯하게 길어진다" }],
    () => undefined,
    {
      predict: true,
      onNext: () => {
        pred = f.slot.qBox.querySelector(".bv-choice.sel")?.textContent ?? "";
        stage = "alTop";
        f.slot.showControls();
        // 버튼 이름이 "꾹 눌러 가열하기"로 바뀌어 부르는 글도 맞췄다(raceLab의 수정안과 같은 꼴)
        f.say("<b>꾹 눌러 가열하기</b> 버튼을 누른 채로 띠가 어느 쪽으로 휘는지 끝까지 지켜봐요.");
        api.setCTA("띠를 가열해 보세요", { enabled: false });
      },
    },
  );
  return () => {
    tm.clear();
    cv.stop();
  };
};
