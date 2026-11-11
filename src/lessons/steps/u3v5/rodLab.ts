// [중1 Ⅲ v5] u3l3 u3RodLab: 「어느 막대가 열을 가장 빨리 전할까?」
// 한 통찰: 전도는 입자의 운동(떨림)이 이웃 입자에 차례로 전달되는 것이고, 전도되는 빠르기는 물질마다 다르다.
// 책의 탐구(철, 구리, 유리 막대의 한쪽 끝을 가열하고 색이 번지는 빠르기를 견준다)를 손으로 한다.
// 조작: 막대 카드 셋 + 꾹 누르는 불. 누르는 동안만 가열되고, 떨림이 번지는 앞머리가 반대쪽 끝에 닿으면 그 막대는 끝.
//   유리는 정해 둔 시간(GLASS_STOP)이 지나도 끝이 뜨거워지지 않아 거기서 멈춘다(실패도 결과다).
// 흐름: 예측(정오 없음) → 세 막대 가열 → 판정(입자는 어떻게 열을 전했나) → 결론.
// 화면의 시간은 견주기 좋게 빠르게 돌린 것이다(무대에 "빠르게 돌린 화면"이라고 적는다).
// 빠르기 근거: 열이 전도되는 정도는 구리 > 철 > 유리(구리는 철의 다섯 배쯤, 유리는 철의 수십 분의 일).

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { tempColor, drawGlowParticle, drawFlame } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvTimers, type BvCard } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, u3Hold, pill, txt, rr, SUB, clamp } from "./kit";

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
const RODS: Record<Key, { name: string; secs: number; fill: string; edge: string }> = {
  cu: { name: "구리", secs: 2.2, fill: "rgba(196,120,74,.5)", edge: "#E0A070" },
  fe: { name: "철", secs: 4.6, fill: "rgba(128,142,166,.5)", edge: "#B4C0D4" },
  glass: { name: "유리", secs: 40, fill: "rgba(170,220,255,.16)", edge: "rgba(200,235,255,.8)" },
};
const ORDER: Key[] = ["cu", "fe", "glass"];

export const rodLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RodStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 4, cls: "u3x-rod", api });

  let cur: Key = "cu";
  let prog = 0; // 떨림의 앞머리(0: 가열 전, 1: 반대쪽 끝에 닿음)
  let held = 0; // 가열한 시간(초)
  let heating = false;
  let phase: "predict" | "play" | "ask" | "done" = "predict";
  let pred = "";
  const result: Partial<Record<Key, string>> = {};
  const seeds = Array.from({ length: COLS * ROWS }, (_, i) => ({ a: (i * 2.399) % 6.283, f: 0.011 + ((i * 7) % 5) * 0.0016 }));
  const heatAt = (i: number): number => clamp((prog * (COLS + 3) - i) / 3, 0, 1);

  const cards: Record<Key, BvCard> = {
    cu: bvCard("col", { name: "구리 막대", sub: "아직 안 해 봄", key: "cu" }),
    fe: bvCard("col", { name: "철 막대", sub: "아직 안 해 봄", key: "fe" }),
    glass: bvCard("col", { name: "유리 막대", sub: "아직 안 해 봄", key: "glass" }),
  };

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    host.dataset.u3Rod = `${cur}:${result[cur] ? "done" : "open"}`;
    const rod = RODS[cur];
    if (heating && !result[cur]) {
      held += dt / 60;
      prog = Math.min(1, prog + dt / 60 / rod.secs);
      if (prog >= 1) finishRod(`끝까지 ${held.toFixed(1)}초`);
      else if (cur === "glass" && held >= GLASS_STOP) finishRod(`${GLASS_STOP}초에도 미지근`);
    }
    // 받침과 불
    ctx.strokeStyle = "rgba(205,225,250,.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(332, 146);
    ctx.lineTo(332, 204);
    ctx.moveTo(316, 204);
    ctx.lineTo(342, 204);
    ctx.stroke();
    rr(ctx, 34, 196, 56, 10, 4);
    ctx.fillStyle = "#33415C";
    ctx.fill();
    if (heating) drawFlame(ctx, 62, 196, 44, tMs);
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
    // 입자: 제자리에서 떨기만 한다(뜨거울수록 크게)
    for (let i = 0; i < COLS; i++) {
      const h = heatAt(i);
      const amp = 0.5 + 4.4 * h;
      for (let r = 0; r < ROWS; r++) {
        const sd = seeds[i * ROWS + r];
        const x = X0 + i * DX + Math.sin(tMs * sd.f * 2.1 + sd.a) * amp;
        const y = Y0 + r * DY + Math.cos(tMs * sd.f * 2.7 + sd.a * 1.7) * amp;
        drawGlowParticle(ctx, x, y, 4.4, 0.12 + 0.86 * h, 1.2 + h);
      }
    }
    // 표시
    pill(ctx, `${rod.name} 막대`, 62, 20, { dot: rod.edge });
    pill(ctx, `가열 ${held.toFixed(1)}초`, 286, 20, { color: heating ? "#FFD666" : undefined });
    const hEnd = heatAt(COLS - 1);
    txt(ctx, "가열하는 끝", 62, 222, { size: 12, color: SUB, weight: 600 });
    txt(ctx, hEnd > 0.85 ? "반대쪽 끝: 뜨거워요" : hEnd > 0.2 ? "반대쪽 끝: 따뜻해져요" : "반대쪽 끝: 그대로예요", 322, 168, { size: 12.5, color: tempColor(0.12 + 0.86 * hEnd), weight: 800, align: "right" });
    txt(ctx, "빠르게 돌린 화면", 268, 222, { size: 12, color: SUB, weight: 600 });
  });

  const hold = u3Hold("불 켜기 (꾹 누르고 있기)", (down) => {
    if (phase !== "play" || result[cur]) return;
    heating = down;
    if (down) f.say("가열 중! 입자의 <b>떨림</b>이 옆 입자로 번져 가요. 반대쪽 끝이 뜨거워질 때까지 누르고 있어요.");
    else if (!result[cur]) f.say("손을 떼니 불이 꺼졌어요. 다시 <b>꾹</b> 눌러 이어서 가열해요.");
  });

  function finishRod(text: string): void {
    heating = false;
    result[cur] = text;
    cards[cur].done();
    cards[cur].sub(text);
    hold.classList.remove("down");
    hold.disabled = true;
    haptic(HAPTIC.ctaUnlock);
    const n = ORDER.filter((k) => result[k]).length;
    f.pips(n);
    const next = ORDER.find((k) => !result[k]);
    if (cur === "glass") f.say(`유리는 ${GLASS_STOP}초를 가열해도 떨림이 거의 번지지 않았어요.${next ? ` 이제 <b>${RODS[next].name} 막대</b>를 골라 봐요.` : ""}`);
    else f.say(`${RODS[cur].name} 막대는 <b>${held.toFixed(1)}초</b> 만에 반대쪽 끝까지 뜨거워졌어요.${next ? ` 이제 <b>${RODS[next].name} 막대</b>를 골라 봐요.` : ""}`);
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
      f.say(`<b>${RODS[k].name} 막대</b>예요. 불을 꾹 눌러 한쪽 끝을 가열하고, 입자의 떨림이 번지는 빠르기를 봐요.`);
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
    const head = pred.includes("구리") ? "예측대로 구리가 가장 빨랐어요." : "가장 빠른 것은 구리였어요.";
    f.say(`${head} 이번엔 막대 속 <b>입자</b>가 한 일을 떠올려 봐요.`);
    f.slot.ask(
      "막대 속 입자는 열을 어떻게 전했나요?",
      [{ t: "제자리에서 떨며 옆 입자에 전했다", ok: true }, { t: "뜨거운 입자가 끝까지 이동했다" }, { t: "입자가 점점 커졌다" }],
      (ok) => api.recordQuiz(ok),
      { why: "입자는 자리를 지키고 <b>떨림</b>만 옆으로 번졌어요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("입자의 운동이 이웃한 입자에 차례로 전달되어 열이 이동하는 것이 <b>전도</b>예요. 전도되는 빠르기는 물질마다 달라요(구리, 철, 유리 순).");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(3, cards.cu, cards.fe, cards.glass), hold);
  cards.cu.on(true);
  hold.disabled = true;
  api.setCTA("세 막대를 모두 가열해 보세요", { enabled: false });
  f.say("구리, 철, 유리 막대예요. 한쪽 끝을 똑같이 가열할 거예요. 먼저 <b>예측</b>부터 해 봐요.");
  f.slot.ask(
    "반대쪽 끝이 <b>가장 먼저</b> 뜨거워질 막대는?",
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
