// [중1 Ⅲ v5] u3l3 u3RodLab: 「어느 막대가 열을 가장 빨리 전할까?」
// 한 통찰: 전도는 입자의 운동(떨림)이 이웃 입자에 차례로 전달되는 것이고, 전도되는 빠르기는 물질마다 다르다.
// 책의 탐구(철, 구리, 유리 막대의 한쪽 끝을 가열하고 색이 번지는 빠르기를 견준다)를 손으로 한다.
// 조작: 막대 카드 셋 + 꾹 누르는 불. 누르는 동안만 가열되고, 떨림이 번지는 앞머리가 반대쪽 끝에 닿으면 그 막대는 끝.
//   유리는 정해 둔 시간(GLASS_STOP)이 지나도 끝이 뜨거워지지 않아 거기서 멈춘다(실패도 결과다).
// 흐름: 예측(정오 없음) → 세 막대 가열 → 판정(입자는 어떻게 열을 전했나) → 결론.
// 화면의 시간은 견주기 좋게 빠르게 돌린 것이다(무대에 "빠르게 재생한 화면"이라고 적는다).
// 빠르기 근거: 열이 전도되는 정도는 구리 > 철 > 유리(구리는 철의 다섯 배쯤, 유리는 철의 수십 분의 일).
// 2026-11-15 그래픽 감사 고침:
//   · 입자는 제자리 격자를 지킨다. 크게 흔들던 것(뜨거우면 4.9px)을 줄이고 떨림은 입자 곁의 호 무늬(뜨거울수록 진하고 길다)로 보인다(책 그림 Ⅲ-4).
//     흐트러진 격자는 '입자가 이동한다'로 읽혔다. 막대 위에 '열의 이동 방향' 화살.
//   · 판정 때 무대가 마지막 유리 막대(번짐이 가장 작음)였다. 이제 철 막대를 반쯤 데우는 장면을 다시 돌리고, 떨림이 번지는 앞머리의
//     이웃 사이에 작은 전달 화살을 그린다. 결론 때는 세 막대의 걸린 시간을 막대그래프로 나란히.
//   · 막대 끝 아래의 ㄴ자 받침(무엇인지 읽히지 않았다)을 뺐다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { tempColor, drawGlowParticle, drawFlame } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvTimers, bvTween, type BvCard } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, u3Hold, pill, txt, rr, SUB, clamp, type Ctx } from "./kit";

interface RodStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

type Key = "cu" | "fe" | "glass";
const COLS = 15;
const ROWS = 4;
const X0 = 70;
const DX = 16.5;
const Y0 = 85;
const DY = 15.5;
const GLASS_STOP = 6.5; // 유리는 이만큼(초) 가열해도 끝이 미지근하다
const ASK_PROG = 0.55; // 판정 때 다시 돌리는 철 막대의 번짐(반쯤)
const RODS: Record<Key, { name: string; secs: number; fill: string; edge: string }> = {
  cu: { name: "구리", secs: 2.2, fill: "rgba(196,120,74,.5)", edge: "#E0A070" },
  fe: { name: "철", secs: 4.6, fill: "rgba(128,142,166,.5)", edge: "#B4C0D4" },
  glass: { name: "유리", secs: 40, fill: "rgba(170,220,255,.16)", edge: "rgba(200,235,255,.8)" },
};
const ORDER: Key[] = ["cu", "fe", "glass"];

export const rodLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RodStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 4, cls: "u3x-rod", api, tall: true });

  let cur: Key = "cu";
  let prog = 0; // 떨림의 앞머리(0: 가열 전, 1: 반대쪽 끝에 닿음)
  let held = 0; // 가열한 시간(초)
  let heating = false;
  let replay = false; // 판정 때 철 막대를 다시 데우는 중(불을 그린다)
  let phase: "predict" | "play" | "ask" | "done" = "predict";
  let pred = "";
  const result: Partial<Record<Key, string>> = {};
  const secsOf: Partial<Record<Key, number>> = {};
  const seeds = Array.from({ length: COLS * ROWS }, (_, i) => ({ a: (i * 2.399) % 6.283, f: 0.011 + ((i * 7) % 5) * 0.0016 }));
  const heatAt = (i: number): number => clamp((prog * (COLS + 3) - i) / 3, 0, 1);

  const cards: Record<Key, BvCard> = {
    cu: bvCard("col", { name: "구리 막대", sub: "가열 전", key: "cu" }),
    fe: bvCard("col", { name: "철 막대", sub: "가열 전", key: "fe" }),
    glass: bvCard("col", { name: "유리 막대", sub: "가열 전", key: "glass" }),
  };

  /** 열의 이동 방향(막대 위, 왼쪽 끝에서 오른쪽 끝으로). */
  function flowArrow(ctx: Ctx): void {
    ctx.strokeStyle = "rgba(255,214,102,.85)";
    ctx.fillStyle = "rgba(255,214,102,.85)";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(92, 58);
    ctx.lineTo(296, 58);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(306, 58);
    ctx.lineTo(295, 52);
    ctx.lineTo(295, 64);
    ctx.closePath();
    ctx.fill();
    txt(ctx, "열의 이동 방향", 199, 46, { size: 12, color: "#FFD666", weight: 700 });
  }

  /** 떨림의 호 무늬: 입자 한쪽에 겹친 호(뜨거울수록 겹이 는다). 방향(th)은 입자마다 다르다(이웃끼리 마주 보는 ')(' 무늬가 생기지 않게). */
  function arcs(ctx: Ctx, x: number, y: number, h: number, th: number, color: string): void {
    // 격자가 빽빽해 호는 한 겹만(뜨거울수록 진하고 길게). 두 겹이면 막대 속이 괄호로 어지러웠다.
    if (h < 0.22) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.35 + 0.45 * h;
    const span = 0.4 + 0.35 * h;
    ctx.beginPath();
    ctx.arc(x, y, 7.4, th - span, th + span);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /** 결론 무대: 세 막대가 반대쪽 끝까지 뜨거워지는 데 걸린 시간. */
  function drawTimes(ctx: Ctx): void {
    txt(ctx, "반대쪽 끝까지 뜨거워진 시간", 20, 24, { size: 12.5, color: "#C9D5E8", align: "left", weight: 800 });
    const BX = 104;
    const BW = 170; // 6.5초의 길이
    ORDER.forEach((k, i) => {
      const y = 66 + i * 50;
      const rod = RODS[k];
      txt(ctx, `${rod.name} 막대`, BX - 10, y, { size: 13, color: "#E8EEF9", align: "right", weight: 800 });
      const sec = secsOf[k] ?? (k === "glass" ? GLASS_STOP : rod.secs);
      const w = (Math.min(sec, GLASS_STOP) / GLASS_STOP) * BW;
      rr(ctx, BX, y - 9, w, 18, 6);
      ctx.fillStyle = k === "glass" ? "rgba(200,235,255,.35)" : rod.edge;
      ctx.fill();
      ctx.strokeStyle = rod.edge;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (k === "glass") {
        // 끝까지 가지 못했다: 점선으로 더 이어 간다
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(200,235,255,.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(BX + w + 4, y);
        ctx.lineTo(BX + w + 34, y);
        ctx.stroke();
        ctx.setLineDash([]);
        txt(ctx, "6.5초 뒤에도 미지근함", BX, y + 24, { size: 12, color: SUB, align: "left", weight: 700 });
      } else txt(ctx, `${sec.toFixed(1)}초`, BX + w + 8, y, { size: 13, color: rod.edge, align: "left", weight: 800 });
    });
    txt(ctx, "빠르게 재생한 화면", 326, 222, { size: 12, color: SUB, align: "right", weight: 600 });
  }

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    host.dataset.u3Rod = `${cur}:${result[cur] ? "done" : "open"}`;
    if (phase === "done") {
      drawTimes(ctx);
      return;
    }
    const rod = RODS[cur];
    if (heating && !result[cur]) {
      held += dt / 60;
      prog = Math.min(1, prog + dt / 60 / rod.secs);
      if (prog >= 1) finishRod(`도달 시간 ${held.toFixed(1)}초`);
      else if (cur === "glass" && held >= GLASS_STOP) finishRod(`${GLASS_STOP}초 뒤에도 미지근함`);
    }
    // 불
    rr(ctx, 34, 196, 56, 10, 4);
    ctx.fillStyle = "#33415C";
    ctx.fill();
    if (heating || replay) drawFlame(ctx, 62, 196, 44, tMs);
    else {
      ctx.fillStyle = "rgba(255,255,255,.14)";
      ctx.beginPath();
      ctx.arc(62, 188, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    // 막대
    rr(ctx, 56, 70, 272, 77, 12);
    ctx.fillStyle = rod.fill;
    ctx.fill();
    ctx.strokeStyle = rod.edge;
    ctx.lineWidth = 2;
    ctx.stroke();
    flowArrow(ctx);
    // 입자: 제자리 격자에서 조금만 떨고, 떨림은 호 무늬로 보인다(뜨거울수록 진하고 길다)
    for (let i = 0; i < COLS; i++) {
      const h = heatAt(i);
      const amp = 0.3 + 1.3 * h;
      for (let r = 0; r < ROWS; r++) {
        const sd = seeds[i * ROWS + r];
        const x = X0 + i * DX + Math.sin(tMs * sd.f * 2.1 + sd.a) * amp;
        const y = Y0 + r * DY + Math.cos(tMs * sd.f * 2.7 + sd.a * 1.7) * amp;
        arcs(ctx, x, y, h, sd.a * 1.7 + 0.4, tempColor(0.12 + 0.86 * h, 0.9));
        drawGlowParticle(ctx, x, y, 4.4, 0.12 + 0.86 * h, 1.2 + h);
      }
    }
    // 판정: 떨림이 번지는 앞머리에서 이웃으로 건네는 작은 화살
    if (phase === "ask") {
      ctx.fillStyle = "#FFD666";
      for (let i = 0; i < COLS - 1; i++) {
        const h = heatAt(i);
        const hn = heatAt(i + 1);
        if (h < 0.3 || hn > 0.85 || h - hn < 0.12) continue;
        for (const r of [0.5, 2.5]) {
          const x = X0 + i * DX + DX / 2;
          const y = Y0 + r * DY;
          ctx.beginPath();
          ctx.moveTo(x + 5, y);
          ctx.lineTo(x - 3.5, y - 4.5);
          ctx.lineTo(x - 3.5, y + 4.5);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    // 표시
    pill(ctx, `${rod.name} 막대`, 62, 20, { dot: rod.edge });
    pill(ctx, `가열 ${held.toFixed(1)}초`, 286, 20, { color: heating || replay ? "#FFD666" : undefined });
    const hEnd = heatAt(COLS - 1);
    txt(ctx, "가열하는 끝", 62, 222, { size: 12, color: SUB, weight: 600 });
    txt(ctx, hEnd > 0.85 ? "반대쪽 끝: 뜨거워짐" : hEnd > 0.2 ? "반대쪽 끝: 따뜻해지는 중" : "반대쪽 끝: 변화 없음", 322, 168, { size: 12.5, color: tempColor(0.12 + 0.86 * hEnd), weight: 800, align: "right" });
    txt(ctx, "빠르게 재생한 화면", 268, 222, { size: 12, color: SUB, weight: 600 });
  });

  const hold = u3Hold("꾹 눌러 가열하기", (down) => {
    if (phase !== "play" || result[cur]) return;
    heating = down;
    if (down) f.say("가열하는 중이에요! 입자의 <b>떨림</b>이 이웃한 입자로 차례차례 전달돼요. 반대쪽 끝까지 뜨거워지도록 계속 누르고 계세요.");
    else if (!result[cur]) f.say("손을 떼면 불이 꺼져요. 반대쪽 끝까지 열이 닿도록 다시 <b>꾹</b> 눌러 가열해 보세요.");
  });

  function finishRod(text: string): void {
    heating = false;
    result[cur] = text;
    secsOf[cur] = cur === "glass" ? GLASS_STOP : held;
    cards[cur].done();
    cards[cur].sub(text);
    hold.classList.remove("down");
    hold.disabled = true;
    haptic(HAPTIC.ctaUnlock);
    const n = ORDER.filter((k) => result[k]).length;
    f.pips(n);
    const next = ORDER.find((k) => !result[k]);
    if (cur === "glass") f.say(`유리 막대는 ${GLASS_STOP}초 동안 가열해도 입자의 떨림이 거의 전달되지 않았어요.${next ? ` 이제 <b>${RODS[next].name} 막대</b> 카드를 눌러 실험해 보세요.` : ""}`);
    else f.say(`${RODS[cur].name} 막대는 <b>${held.toFixed(1)}초</b> 만에 반대쪽 끝까지 뜨거워졌어요!${next ? ` 이제 <b>${RODS[next].name} 막대</b> 카드를 눌러 실험해 보세요.` : ""}`);
    if (!next) tm.later(askFinal, 2200);
  }

  function select(k: Key): void {
    if (heating) return;
    cur = k;
    ORDER.forEach((x) => cards[x].on(x === k));
    hold.disabled = !!result[k];
    if (result[k]) {
      prog = k === "glass" ? GLASS_STOP / RODS.glass.secs : 1;
      held = k === "glass" ? GLASS_STOP : RODS[k].secs;
    } else {
      prog = 0;
      held = 0;
      f.say(`<b>${RODS[k].name} 막대</b>를 골랐어요. 버튼을 꾹 눌러 한쪽 끝을 가열하면서 입자의 떨림이 전달되는 빠르기를 관찰해 보세요.`);
    }
  }
  ORDER.forEach((k) =>
    cards[k].el.addEventListener("click", () => {
      if (phase !== "play" || k === cur) return;
      haptic(HAPTIC.tap);
      select(k);
    }),
  );

  function askFinal(): void {
    phase = "ask";
    // 판정의 단서를 다시 보인다: 철 막대를 반쯤 데우는 장면(떨림이 이웃으로 차례로 번진다)
    cur = "fe";
    ORDER.forEach((x) => cards[x].on(x === "fe"));
    replay = true;
    bvTween(
      tm,
      2600,
      (k) => {
        prog = ASK_PROG * k;
        held = RODS.fe.secs * prog;
      },
      () => {
        replay = false;
      },
      (x) => x,
    );
    const head = pred.includes("구리") ? "예측한 대로 구리 막대가 가장 빨랐어요!" : "실험 결과, 열을 가장 빨리 전달한 것은 구리 막대였어요.";
    f.say(`${head} 가열할 때 막대 속 <b>입자</b>가 어떻게 움직였는지 떠올리며 답해 보세요.`);
    f.slot.ask(
      "가열할 때 막대 속 입자는 열을 어떻게 전달했나요?",
      [{ t: "제자리에서 떨면서 이웃한 입자에 떨림을 전달했다", ok: true }, { t: "뜨거워진 입자가 반대쪽 끝까지 직접 이동했다" }, { t: "입자 하나하나의 크기가 점점 커졌다" }],
      (ok) => api.recordQuiz(ok),
      { why: "고체 막대 속 입자는 직접 이동하지 않고 제자리에서 떨면서 <b>입자의 운동</b>만 옆으로 전달해요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    replay = false;
    f.pips(4);
    f.say("고체에서 열이 어떻게 전달되는지, 또 물질마다 빠르기가 어떻게 다른지 확인했어요!");
    f.slot.conclude("고체에서 입자의 운동이 이웃한 입자에 차례로 전달되어 열이 이동하는 현상을 <b>전도</b>라고 해요. 열이 전도되는 빠르기는 물질의 종류에 따라 달라요(구리 > 철 > 유리).");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(3, cards.cu, cards.fe, cards.glass), hold);
  cards.cu.on(true);
  hold.disabled = true;
  api.setCTA("세 막대를 모두 가열해 보세요", { enabled: false });
  f.say("구리, 철, 유리로 된 세 막대의 한쪽 끝을 같은 세기로 가열해 볼 거예요. 먼저 결과를 <b>예측</b>해 볼까요?");
  f.slot.ask(
    "가열했을 때 반대쪽 끝이 <b>가장 먼저</b> 뜨거워지는 막대는 어느 것일까요?",
    ORDER.map((k) => ({ t: `${RODS[k].name} 막대` })),
    () => undefined,
    {
      predict: true,
      onNext: () => {
        pred = f.slot.qBox.querySelector(".bv-choice.sel")?.textContent ?? "";
        phase = "play";
        f.slot.showControls();
        select("cu");
        api.setCTA("세 막대를 모두 가열해 보세요", { enabled: false });
      },
    },
  );
  return () => {
    tm.clear();
    cv.stop();
  };
};
