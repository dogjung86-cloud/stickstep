// [중1 Ⅲ v5] u3l3 u3RadLab: 「난로 곁에 서면 왜 따뜻할까?」
// 한 통찰: 복사는 열이 물질을 통하지 않고 직접 이동하는 것이다. 곧게 나아가므로 가로막으면 닿지 않고, 공기가 없어도 전해진다.
// 책의 그림(난로 곁의 따뜻함)과 물음(사이를 가로막으면 왜 따뜻하지 않을까)을 손으로 한다.
//   1 난로와 사람: 거리 막대로 다가가면 받는 열이 커진다. 가림판을 세우면 열이 막힌다.
//   2 유리 상자: 전등과 온도계를 넣고 공기를 뺀다(꾹 누르기). 공기 입자가 다 빠져도 온도계는 따뜻하다.
// 흐름: 다가가기 → 가림판 → (예측) → 공기 빼기 → 판정 → 결론.
// 난로는 전기난로다(불꽃은 공기가 없으면 꺼지므로 유리 상자 실험과 어긋난다. 모닥불은 앞의 만화에 이미 나온다).
// 유리 상자에서 온도계의 눈금은 그대로 둔다(복사로 받는 열이 그대로라는 것만 보인다).

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { makeParticles, stepFree, type Box } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, u3Hold, pill, rr, txt, SUB, type Ctx } from "./kit";

interface RadStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const RAYS = [-0.5, -0.33, -0.16, 0, 0.16, 0.33, 0.5];

export const radLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RadStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 4, cls: "u3x-rad", api });

  let scene: "stove" | "box" = "stove";
  let dist = 70; // 0(가까이)~100(멀리)
  let shield = false;
  let nearDone = false;
  let shieldDone = false;
  let air = 1; // 유리 상자 속 공기(1: 가득, 0: 없음)
  let pumping = false;
  let phase: "play" | "ask" | "done" = "play";
  const airBox: Box = { x: 40, y: 46, w: 266, h: 142 };
  const airPs = makeParticles(42, airBox);

  const warmth = (): number => (shield ? 0.03 : 1 / (1 + Math.pow(dist / 36, 2)));

  /** 곧게 나아가는 열(주황 점선). (x0, y0)에서 각도 a로 xEnd까지. */
  function ray(ctx: Ctx, x0: number, y0: number, a: number, xEnd: number, tMs: number, alpha: number): void {
    const len = (xEnd - x0) / Math.cos(a);
    ctx.strokeStyle = `rgba(255,150,70,${alpha})`;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.setLineDash([9, 9]);
    ctx.lineDashOffset = -(tMs / 22) % 18;
    ctx.beginPath();
    ctx.moveTo(x0 + 6 * Math.cos(a), y0 + 6 * Math.sin(a));
    ctx.lineTo(x0 + len * Math.cos(a), y0 + len * Math.sin(a));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawStove(ctx: Ctx, tMs: number): void {
    const w = warmth();
    for (const a of RAYS) ray(ctx, 60, 130, a, shield ? 110 : 344, tMs, 0.75);
    // 전기난로
    rr(ctx, 16, 84, 44, 96, 8);
    ctx.fillStyle = "#3A475F";
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(255,${110 + 30 * Math.sin(tMs / 300 + i)},60,1)`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(24, 98 + i * 16);
      ctx.lineTo(52, 98 + i * 16);
      ctx.stroke();
    }
    rr(ctx, 10, 180, 56, 10, 4);
    ctx.fillStyle = "#2A3A55";
    ctx.fill();
    txt(ctx, "난로", 38, 204, { size: 12.5, color: SUB });
    // 가림판
    if (shield) {
      rr(ctx, 108, 60, 9, 134, 3);
      ctx.fillStyle = "#AEB9CC";
      ctx.fill();
      txt(ctx, "가림판", 112, 208, { size: 12.5, color: SUB });
    }
    // 사람: 열을 받는 만큼 난로 쪽이 달아오른다
    const x = 150 + dist * 1.5;
    const g = ctx.createRadialGradient(x - 8, 124, 4, x - 8, 124, 46);
    g.addColorStop(0, `rgba(255,130,60,${0.55 * w})`);
    g.addColorStop(1, "rgba(255,130,60,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x - 8, 124, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#E8EEF9";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.arc(x, 96, 13, 0, Math.PI * 2);
    ctx.moveTo(x, 109);
    ctx.lineTo(x, 152);
    ctx.lineTo(x - 10, 190);
    ctx.moveTo(x, 152);
    ctx.lineTo(x + 10, 190);
    ctx.moveTo(x, 122);
    ctx.lineTo(x - 20, 134);
    ctx.moveTo(x, 122);
    ctx.lineTo(x - 18, 118);
    ctx.stroke();
    // 받는 열(칸 다섯)
    const lv = Math.round(w * 5);
    txt(ctx, "받는 열", 16, 24, { size: 12.5, color: SUB, align: "left" });
    for (let i = 0; i < 5; i++) {
      rr(ctx, 64 + i * 15, 16, 12, 16, 3);
      ctx.fillStyle = i < lv ? "#FF8A4C" : "rgba(255,255,255,.12)";
      ctx.fill();
    }
    host.dataset.u3Warm = String(lv);
  }

  function drawBox(ctx: Ctx, dt: number, tMs: number): void {
    // 유리 상자
    rr(ctx, 30, 36, 286, 162, 14);
    ctx.fillStyle = "rgba(160,210,255,.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(205,225,250,.75)";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    // 공기 빼는 관
    ctx.strokeStyle = "rgba(205,225,250,.6)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(300, 198);
    ctx.lineTo(300, 222);
    ctx.stroke();
    txt(ctx, "공기 빼는 관", 292, 214, { size: 12, color: SUB, align: "right", weight: 600 });
    // 공기 입자
    stepFree(airPs, airBox, dt, 1.1, 0);
    const n = Math.round(airPs.length * air);
    ctx.fillStyle = "rgba(170,200,235,.8)";
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(airPs[i].x, airPs[i].y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // 전등과 곧게 나아가는 열
    for (const a of [-0.2, -0.07, 0.07, 0.2]) ray(ctx, 84, 118, a, 238, tMs, 0.8);
    const g = ctx.createRadialGradient(72, 118, 3, 72, 118, 30);
    g.addColorStop(0, "rgba(255,190,90,.95)");
    g.addColorStop(1, "rgba(255,150,60,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(72, 118, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFD08A";
    ctx.beginPath();
    ctx.arc(72, 118, 11, 0, Math.PI * 2);
    ctx.fill();
    rr(ctx, 64, 128, 16, 44, 3);
    ctx.fillStyle = "#3A475F";
    ctx.fill();
    txt(ctx, "전등", 72, 184, { size: 12.5, color: SUB });
    // 온도계(눈금은 그대로다)
    rr(ctx, 246, 70, 14, 86, 7);
    ctx.fillStyle = "rgba(255,255,255,.14)";
    ctx.fill();
    rr(ctx, 249.5, 96, 7, 60, 3.5);
    ctx.fillStyle = "#FF8A4C";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(253, 162, 10, 0, Math.PI * 2);
    ctx.fill();
    pill(ctx, "온도계 따뜻함", 258, 56, { size: 12, dot: "#FF8A4C" });
    pill(ctx, `상자 속 공기 ${Math.round(air * 100)}%`, 112, 20, { size: 12, dot: "rgba(170,200,235,1)" });
  }

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    host.dataset.u3Scene = scene;
    host.dataset.u3Air = air.toFixed(2);
    if (scene === "stove") drawStove(ctx, tMs);
    else {
      if (pumping && air > 0) {
        air = Math.max(0, air - dt / 150);
        if (air <= 0) onEmpty();
      }
      drawBox(ctx, dt, tMs);
    }
  });

  // ── 조작 ──
  const range = bvRange({
    cls: "u3x-range",
    min: 0,
    max: 100,
    value: dist,
    label: "난로와의 거리",
    ticks: ["가까이", "멀리"],
    onInput: (v) => {
      dist = v;
      if (!nearDone && !shield && dist <= 12) {
        nearDone = true;
        shieldBtn.disabled = false;
        haptic(HAPTIC.ctaUnlock);
        f.pips(1);
      }
      hint();
    },
  });
  const shieldBtn = bvBtn("", "가림판 세우기");
  shieldBtn.disabled = true;
  const nextBtn = bvBtn("main", "다음 실험: 유리 상자");
  nextBtn.hidden = true;
  const pump = u3Hold("공기 빼기 (꾹 누르고 있기)", (down) => {
    if (scene !== "box" || air <= 0) return;
    pumping = down;
    if (!down && air > 0) f.say("손을 떼니 멈췄어요. 공기가 다 빠질 때까지 <b>꾹</b> 눌러 주세요.");
  });

  function hint(): void {
    if (scene !== "stove") return;
    if (!nearDone) f.say("전기난로 앞이에요. <b>거리 막대</b>를 왼쪽으로 밀어 난로에 다가가 봐요. 받는 열이 어떻게 되나요?");
    else if (!shieldDone) f.say("가까울수록 열을 많이 받아요. 이번엔 난로와 사람 사이에 <b>가림판</b>을 세워 봐요.");
    else f.say(shield ? "가림판이 열을 막았어요. 열은 난로에서 <b>곧게</b> 나아가다가 가림판에 막혀요." : "가림판을 치우니 다시 따뜻해요. 이제 다음 실험으로 가 봐요.");
  }

  shieldBtn.addEventListener("click", () => {
    if (scene !== "stove") return;
    haptic(HAPTIC.tap);
    shield = !shield;
    shieldBtn.textContent = shield ? "가림판 치우기" : "가림판 세우기";
    shieldBtn.classList.toggle("on", shield);
    if (shield && !shieldDone) {
      shieldDone = true;
      f.pips(2);
      nextBtn.hidden = false;
    }
    hint();
  });

  nextBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    scene = "box";
    f.say("유리 상자에 전등과 온도계를 넣었어요. 상자 속 공기를 빼기 전에 <b>예측</b>부터 해 봐요.");
    f.slot.ask(
      "상자 속 <b>공기를 모두 빼면</b> 온도계는 어떻게 될까요?",
      [{ t: "차갑게 식는다" }, { t: "여전히 따뜻하다" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          f.slot.setControls(pump);
          f.say("<b>공기 빼기</b>를 꾹 눌러 상자 속 공기 입자를 모두 빼 봐요. 온도계는 어떻게 되나요?");
          api.setCTA("상자 속 공기를 모두 빼 보세요", { enabled: false });
        },
      },
    );
  });

  function onEmpty(): void {
    pumping = false;
    pump.disabled = true;
    pump.classList.remove("down");
    haptic(HAPTIC.correct);
    f.pips(3);
    f.say("공기 입자가 하나도 없는데 온도계는 <b>여전히 따뜻해요</b>. 열이 빈 곳을 건너 곧장 온 거예요.");
    tm.later(askFinal, 2600);
  }

  function askFinal(): void {
    phase = "ask";
    f.say("공기를 다 뺀 상자예요. 무대를 보고 골라 봐요.");
    f.slot.ask(
      "공기가 없는데도 온도계가 따뜻한 까닭은?",
      [{ t: "열이 물질 없이도 직접 이동해서", ok: true }, { t: "남은 공기 입자가 열을 날라서" }, { t: "입자의 떨림이 차례로 전달돼서" }],
      (ok) => api.recordQuiz(ok),
      { why: "상자 속에는 열을 나르거나 떨림을 전할 <b>입자가 없어요</b>.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("열이 물질을 통하지 않고 <b>직접 이동</b>하는 것이 <b>복사</b>예요. 가로막으면 닿지 않아요. 태양의 열도 이렇게 텅 빈 우주를 건너와요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el, shieldBtn, nextBtn);
  hint();
  api.setCTA("난로에 다가가고 가림판을 세워 보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.stop();
  };
};
