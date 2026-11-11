// [중1 Ⅲ v5] u3l1 u3TempLab: 「온도가 오르면 입자는 어떻게 될까?」
// 한 통찰: 온도는 입자 운동이 활발한 정도다. 온도가 높을수록 입자가 활발하게 움직이고 입자 사이가 멀어진다.
// 책의 활동(물의 온도를 조절하며 입자 운동을 견주는 시뮬레이션)을 그대로 손으로 한다.
// 조작: 온도 막대 하나. 흐름: 뜨겁게 → 차갑게 → 비밀의 물과 같은 온도로 맞추기(입자만 보고) → 판정 → 결론.
// 비밀의 물은 온도 색을 숨긴다(회색). 단서는 입자의 빠르기와 입자 사이의 거리(물 높이)뿐이다.
// 물 높이의 변화는 입자 사이가 멀어지는 것을 보이려고 실제보다 크게 그렸다(입자 모형).

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { tempColor, drawGlowParticle, drawFlame, makeParticles, stepFree, motionWord, type Box, type FreeParticle } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, beaker, water, pill, txt, rr, SUB, type Ctx } from "./kit";

interface TempStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const T_MIN = 5;
const T_MAX = 95;
const SECRET = 70;
const TOL = 9;
const N = 24;
const BOTTOM = 190;
const t01 = (T: number): number => (T - 0) / 100;
const levelOf = (T: number): number => 78 + t01(T) * 44; // 물 높이(px)
const speedOf = (T: number): number => 0.18 + Math.pow(t01(T), 1.5) * 3.4;
const repelOf = (T: number): number => 17 + t01(T) * 7;

interface Cup {
  x: number;
  w: number;
  T: number; // 그리는 온도(부드럽게 따라간다)
  ps: FreeParticle[];
}
const boxOf = (c: Cup): Box => ({ x: c.x + 9, y: BOTTOM - levelOf(c.T) + 8, w: c.w - 18, h: levelOf(c.T) - 16 });
const makeCup = (x: number, w: number, T: number): Cup => {
  const c: Cup = { x, w, T, ps: [] };
  c.ps = makeParticles(N, boxOf(c));
  return c;
};

export const tempLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TempStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 4, cls: "u3x-temp", api });

  let T = 25;
  let phase: "explore" | "match" | "ask" | "done" = "explore";
  let hot = false;
  let cold = false;
  let solved = false;
  let wrongFlash = 0;
  const mine = makeCup(22, 132, T);
  const secret = makeCup(192, 132, SECRET);

  function drawCup(ctx: Ctx, c: Cup, dt: number, tMs: number, o: { gray: boolean; label: string; fire: boolean }): void {
    const lv = levelOf(c.T);
    const k = t01(c.T);
    water(ctx, c.x + 3, BOTTOM - lv, c.w - 6, BOTTOM - 2, o.gray ? "rgba(160,176,200,.12)" : tempColor(k, 0.14), o.gray ? "rgba(190,204,224,.5)" : tempColor(k, 0.75));
    stepFree(c.ps, boxOf(c), dt, speedOf(c.T), repelOf(c.T));
    for (const p of c.ps) {
      if (o.gray) {
        ctx.fillStyle = "#C5D0E0";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.4)";
        ctx.beginPath();
        ctx.arc(p.x - 1.5, p.y - 1.6, 1.6, 0, Math.PI * 2);
        ctx.fill();
      } else drawGlowParticle(ctx, p.x, p.y, 4.6, k, 1.9);
    }
    beaker(ctx, c.x, 46, c.w, BOTTOM - 46);
    // 받침: 불(따뜻할 때) 또는 얼음(차가울 때)
    if (o.fire) {
      const cx = c.x + c.w / 2;
      if (c.T > 34) drawFlame(ctx, cx, BOTTOM + 30, 10 + (c.T - 34) * 0.28, tMs);
      else if (c.T < 18) {
        for (let i = -1; i <= 1; i++) {
          rr(ctx, cx + i * 22 - 9, BOTTOM + 9, 18, 16, 4);
          ctx.fillStyle = "rgba(170,215,255,.85)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,.7)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      ctx.strokeStyle = "rgba(205,225,250,.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x + 10, BOTTOM + 6);
      ctx.lineTo(c.x + c.w - 10, BOTTOM + 6);
      ctx.stroke();
    }
    pill(ctx, o.label, c.x + c.w / 2, 26, { dot: o.gray ? "#C5D0E0" : tempColor(k) });
  }

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    if (host.dataset.u3Phase !== phase) host.dataset.u3Phase = phase;
    mine.T += (T - mine.T) * Math.min(1, 0.2 * dt);
    drawCup(ctx, mine, dt, tMs, { gray: false, label: `내 물 ${Math.round(T)}℃`, fire: true });
    if (phase === "explore") {
      // 오른쪽: 큰 온도계와 입자 운동의 말
      const x = 258;
      const top = 52;
      const bot = 168;
      rr(ctx, x - 9, top - 8, 18, bot - top + 16, 9);
      ctx.fillStyle = "rgba(255,255,255,.1)";
      ctx.fill();
      const y = bot - ((mine.T - 0) / 100) * (bot - top);
      rr(ctx, x - 4.5, y, 9, bot - y + 4, 4.5);
      ctx.fillStyle = tempColor(t01(mine.T));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, bot + 10, 12, 0, Math.PI * 2);
      ctx.fill();
      for (const v of [0, 50, 100]) txt(ctx, `${v}`, x + 17, bot - (v / 100) * (bot - top), { size: 12, color: SUB, align: "left", weight: 600 });
      txt(ctx, "온도계", x, 26, { size: 12.5, color: SUB });
      txt(ctx, "입자 운동이", x, 196, { size: 12, color: SUB, weight: 600 });
      txt(ctx, motionWord(t01(mine.T)), x, 212, { size: 14, weight: 800, color: tempColor(t01(mine.T)) });
    } else {
      if (wrongFlash > 0) wrongFlash -= dt;
      drawCup(ctx, secret, dt, tMs, { gray: !solved, label: solved ? `비밀의 물 ${SECRET}℃` : "비밀의 물 ?℃", fire: false });
      if (solved) {
        if (phase === "match") txt(ctx, "같은 온도, 같은 움직임", 258, BOTTOM + 22, { size: 12.5, color: "#7BE0B0" });
      } else txt(ctx, "입자만 보고 맞혀요", 258, BOTTOM + 22, { size: 12.5, color: wrongFlash > 0 ? "#FF8F8F" : SUB });
    }
  });

  const range = bvRange({
    cls: "u3x-range",
    min: T_MIN,
    max: T_MAX,
    value: T,
    label: "물의 온도",
    ticks: ["차갑게", "뜨겁게"],
    onInput: (v) => {
      T = v;
      if (phase === "explore") {
        if (T >= 85 && !hot) {
          hot = true;
          haptic(HAPTIC.ctaUnlock);
        }
        if (T <= 12 && !cold) {
          cold = true;
          haptic(HAPTIC.ctaUnlock);
        }
        f.pips((hot ? 1 : 0) + (cold ? 1 : 0));
      }
      hint();
    },
    onChange: () => {
      if (phase === "explore" && hot && cold) startMatch();
    },
  });
  const check = bvBtn("main", "이 온도로 확인하기");
  check.hidden = true;

  function hint(): void {
    if (phase === "explore") {
      if (!hot && !cold) f.say("<b>온도 막대</b>를 밀어 물을 데워 봐요. 물속 입자가 어떻게 달라지나요?");
      else if (hot && !cold) f.say(T >= 85 ? "입자가 빠르게 움직이고 서로 멀어졌어요. 이번엔 <b>차갑게</b> 식혀 봐요." : "이번엔 막대를 왼쪽 끝까지 밀어 <b>차갑게</b> 식혀 봐요.");
      else if (!hot && cold) f.say(T <= 12 ? "입자가 둔해지고 서로 가까워졌어요. 이번엔 <b>뜨겁게</b> 데워 봐요." : "이번엔 막대를 오른쪽 끝까지 밀어 <b>뜨겁게</b> 데워 봐요.");
    } else if (phase === "match" && !solved) {
      f.say("새 컵의 온도는 비밀이에요. <b>입자의 움직임</b>이 같아지게 내 물의 온도를 맞추고 확인을 눌러요.");
    }
  }

  function startMatch(): void {
    phase = "match";
    check.hidden = false;
    haptic(HAPTIC.tap);
    hint();
    api.setCTA("비밀의 물과 같은 온도를 만들어 보세요", { enabled: false });
  }

  check.addEventListener("click", () => {
    if (phase !== "match" || solved) return;
    const d = T - SECRET;
    if (Math.abs(d) <= TOL) {
      solved = true;
      check.disabled = true;
      range.input.disabled = true;
      haptic(HAPTIC.correct);
      f.pips(3);
      f.say(`맞혔어요. 비밀의 물은 <b>${SECRET}℃</b>였어요. 입자의 움직임만 보고도 온도를 알 수 있네요.`);
      tm.later(askFinal, 1900);
    } else {
      haptic(HAPTIC.wrong);
      wrongFlash = 40;
      f.say(d < 0 ? "아직 달라요. 비밀의 물은 입자가 <b>더 활발</b>하고 사이도 더 멀어요. 온도를 올려 봐요." : "아직 달라요. 비밀의 물은 입자가 <b>더 둔하고</b> 사이도 더 가까워요. 온도를 내려 봐요.");
    }
  });

  function askFinal(): void {
    phase = "ask";
    T = T_MIN;
    range.set(T_MIN);
    f.say("내 물을 가장 차갑게 식혔어요. 무대의 <b>내 물</b>을 보고 골라 봐요.");
    f.slot.ask(
      "가장 차가운 물에서 입자는 어떤가요?",
      [{ t: "둔해졌지만 계속 움직인다", ok: true }, { t: "완전히 멈춰 있다" }, { t: "입자가 작아졌다" }],
      (ok) => api.recordQuiz(ok),
      { why: "차가운 물의 입자도 <b>느리게 계속</b> 움직여요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(4);
    f.say("관찰 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("<b>온도</b>는 입자 운동이 활발한 정도예요. 온도가 높을수록 입자가 활발하게 움직이고 입자 사이가 멀어져요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el, check);
  hint();
  api.setCTA("온도를 바꿔 입자를 관찰해 보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.stop();
  };
};
