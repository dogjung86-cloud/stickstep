// [중1 Ⅲ v5] u3l2 u3ContactLab: 「뜨거운 물과 찬물이 닿으면?」
// 한 통찰: 온도가 다른 두 물체가 닿으면 열은 온도가 높은 쪽에서 낮은 쪽으로 이동하고, 두 온도가 같아지면 멈춘다(열평형).
// 책의 탐구(열량계의 뜨거운 물에 찬물이 든 알루미늄 컵을 넣고 온도 센서로 두 온도를 잰다)를 한 무대에 옮겼다.
//   왼쪽: 열량계와 컵(두 물의 입자, 벽을 건너는 열 화살표)   오른쪽: 시간과 온도 그래프(두 선이 만난다)
// 학생이 정하는 것: 컵 속 물의 온도, 그리고 실험의 차례(컵 넣기 → 뚜껑 닫기 → 측정 시작).
//   컵이 바깥 물보다 차가울 때와 뜨거울 때를 한 번씩 넣어 보면 열의 방향이 뒤집힌다.
// 실패하는 길: 뚜껑을 닫지 않고 측정하면 열이 공기 중으로 빠져나가 두 온도가 만난 뒤에도 계속 내려간다(그 실험은 세지 않는다).
//   컵과 바깥 물의 온도가 거의 같으면 열이 이동하지 않는다.
// 흐름: 찬 컵 실험 → (예측) → 뜨거운 컵 실험 → 판정 → 결론. 순서는 학생이 바꿔도 된다.
// 셈: 바깥 물이 컵 속 물의 두 배라고 두었다. 같아지는 온도 = (2 × 바깥 + 컵) ÷ 3.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { tempColor, drawGlowParticle, makeParticles, stepFree, type Box, type FreeParticle } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, water, pill, txt, rr, graphAxes, graphLine, SUB, INK, type Ctx } from "./kit";

interface ContactStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const OUT0 = 60; // 바깥 물의 처음 온도
const TAU = 62; // 온도 차가 줄어드는 빠르기(프레임)
const RUN = 230; // 한 번의 실험 길이(프레임)
const C_OUT = "#FFA25E";
const C_CUP = "#6FD3FF";
const ROOM = 20; // 방 온도
const LIFT = 74; // 넣기 전 컵이 떠 있는 높이
const speedOf = (T: number): number => 0.16 + Math.pow(T / 100, 1.5) * 2.6;

export const contactLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ContactStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 3, cls: "u3x-contact", api });

  let cup0 = 10; // 넣기 전 컵 속 물의 온도(막대)
  let inserted = false;
  let lift = 1; // 1: 컵이 열량계 위에 있다, 0: 들어갔다
  let t = 0; // 넣은 뒤 흐른 시간(프레임)
  let run0 = { cup: cup0, fin: 0 };
  let settled = false;
  let lid = false; // 열량계의 뚜껑
  let measuring = false; // 측정 시작을 눌렀는가
  let leaky = false; // 뚜껑 없이 측정한 실험
  let coldDone = false;
  let hotDone = false;
  let predicted = false;
  let phase: "play" | "ask" | "done" = "play";
  let curveOut: [number, number][] = [];
  let curveCup: [number, number][] = [];

  const finOf = (c: number): number => (2 * OUT0 + c) / 3;
  const tempsAt = (tt: number): { out: number; cup: number } => {
    const k = Math.exp(-tt / TAU);
    // 뚜껑이 없으면 두 물 모두 방 온도(20℃) 쪽으로 식어 간다
    const leak = (v: number): number => (leaky ? ROOM + (v - ROOM) * Math.exp(-tt / 260) : v);
    return { out: leak(run0.fin + (OUT0 - run0.fin) * k), cup: leak(run0.fin + (run0.cup - run0.fin) * k) };
  };

  // 입자: 바깥 물은 컵 양옆 두 칸, 컵 속은 한 칸
  const boxL: Box = { x: 27, y: 124, w: 30, h: 78 };
  const boxR: Box = { x: 123, y: 124, w: 30, h: 78 };
  const psL = makeParticles(7, boxL);
  const psR = makeParticles(7, boxR);
  const psC: FreeParticle[] = makeParticles(8, { x: 71, y: 126, w: 38, h: 56 });

  function drawScene(ctx: Ctx, dt: number, tMs: number, out: number, cup: number): void {
    const dy = -LIFT * lift;
    // 열량계: 두꺼운 단열 벽
    rr(ctx, 12, 102, 156, 112, 12);
    ctx.fillStyle = "#33415C";
    ctx.fill();
    rr(ctx, 22, 106, 136, 102, 7);
    ctx.fillStyle = "#0E1A2E";
    ctx.fill();
    water(ctx, 22, 116, 136, 208, tempColor(out / 100, 0.2), tempColor(out / 100, 0.8), 6);
    stepFree(psL, boxL, dt, speedOf(out), 13);
    stepFree(psR, boxR, dt, speedOf(out), 13);
    for (const p of [...psL, ...psR]) drawGlowParticle(ctx, p.x, p.y, 4, out / 100, 1.8);
    // 컵(알루미늄)
    const cx = 64;
    const cy = 110 + dy;
    rr(ctx, cx, cy, 52, 80, 6);
    ctx.fillStyle = "#101C30";
    ctx.fill();
    water(ctx, cx + 3, cy + 10, 46, cy + 77, tempColor(cup / 100, 0.22), tempColor(cup / 100, 0.8), 4);
    const boxC: Box = { x: cx + 7, y: cy + 16, w: 38, h: 56 };
    for (const p of psC) {
      // 컵이 움직이면 입자도 함께 옮긴다
      p.y += boxC.y - lastCupY;
      p.py += boxC.y - lastCupY;
    }
    lastCupY = boxC.y;
    stepFree(psC, boxC, dt, speedOf(cup), 12);
    for (const p of psC) drawGlowParticle(ctx, p.x, p.y, 4, cup / 100, 1.8);
    ctx.strokeStyle = "#C9D3E0";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 2);
    ctx.lineTo(cx, cy + 2);
    ctx.lineTo(cx, cy + 76);
    ctx.quadraticCurveTo(cx, cy + 80, cx + 5, cy + 80);
    ctx.lineTo(cx + 47, cy + 80);
    ctx.quadraticCurveTo(cx + 52, cy + 80, cx + 52, cy + 76);
    ctx.lineTo(cx + 52, cy + 2);
    ctx.lineTo(cx + 55, cy - 2);
    ctx.stroke();
    // 열 화살표: 컵 벽을 건넌다(온도가 높은 쪽에서 낮은 쪽으로). 온도 차가 클수록 굵다.
    const diff = out - cup;
    if (measuring && lift < 0.05 && Math.abs(diff) > 1.5) {
      const into = diff > 0; // 바깥에서 컵으로
      const a = Math.min(1, Math.abs(diff) / 25);
      const sl = ((tMs / 500) % 1) * 8;
      for (const side of [-1, 1]) {
        const wallX = side < 0 ? cx : cx + 52;
        const dir = (into ? 1 : -1) * -side; // +1이면 오른쪽으로
        const x0 = wallX - dir * 12 + dir * sl;
        const y0 = cy + 44;
        ctx.strokeStyle = `rgba(255,214,102,${0.55 + 0.45 * a})`;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 2.5 + 2 * a;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x0 - dir * 6, y0);
        ctx.lineTo(x0 + dir * 9, y0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x0 + dir * 16, y0);
        ctx.lineTo(x0 + dir * 7, y0 - 6);
        ctx.lineTo(x0 + dir * 7, y0 + 6);
        ctx.closePath();
        ctx.fill();
      }
      txt(ctx, "열", cx + 26, cy + 96, { size: 12.5, color: "#FFD666", weight: 800 });
    }
    // 뚜껑: 닫으면 덮개가 놓이고, 연 채로 측정하면 열이 위로 빠져나간다
    if (lid) {
      rr(ctx, 6, 94, 168, 13, 5);
      ctx.fillStyle = "#6B7C96";
      ctx.fill();
      txt(ctx, "뚜껑", 150, 84, { size: 12, color: SUB, weight: 600 });
    } else if (measuring && leaky && !settled) {
      ctx.strokeStyle = "rgba(255,150,70,.8)";
      ctx.lineWidth = 2;
      for (const x of [34, 48, 132, 146]) {
        const ph = tMs / 220 + x;
        ctx.beginPath();
        ctx.moveTo(x, 104);
        ctx.quadraticCurveTo(x + 5 * Math.sin(ph), 92, x, 80);
        ctx.stroke();
      }
    }
    pill(ctx, `컵 ${Math.round(cup)}℃`, 50, 15, { size: 12, dot: C_CUP });
    pill(ctx, `바깥 ${Math.round(out)}℃`, 128, 15, { size: 12, dot: C_OUT });
  }
  let lastCupY = 110 - LIFT + 16;
  psC.forEach((p) => {
    p.y -= LIFT;
    p.py -= LIFT;
  });

  function drawGraph(ctx: Ctx): void {
    const g = graphAxes(ctx, { x: 212, y: 46, w: 122, h: 132, tMax: RUN, vMin: 0, vMax: 100, ticks: [0, 50, 100], xLabel: "시간", yLabel: "온도(℃)" });
    if (settled && leaky) txt(ctx, "계속 내려가요", 276, 55, { size: 12.5, color: "#FF8F8F", weight: 800 });
    if (settled && !leaky) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(123,224,176,.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(g.px(0), g.py(run0.fin));
      ctx.lineTo(g.px(RUN), g.py(run0.fin));
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, `같아졌어요 ${Math.round(run0.fin)}℃`, 276, 55, { size: 12.5, color: "#7BE0B0", weight: 800 });
    }
    graphLine(ctx, g, curveOut, C_OUT);
    graphLine(ctx, g, curveCup, C_CUP);
    if (!curveOut.length) txt(ctx, "측정하면 그려져요", 273, 112, { size: 12, color: SUB, weight: 600 });
    // 범례
    ctx.fillStyle = C_OUT;
    ctx.fillRect(214, 213, 12, 3);
    txt(ctx, "바깥 물", 230, 215, { size: 12, color: INK, align: "left", weight: 600 });
    ctx.fillStyle = C_CUP;
    ctx.fillRect(278, 213, 12, 3);
    txt(ctx, "컵 속 물", 294, 215, { size: 12, color: INK, align: "left", weight: 600 });
  }

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    host.dataset.u3Settled = settled ? (leaky ? "leak" : "1") : "0";
    const target = inserted ? 0 : 1;
    lift += (target - lift) * Math.min(1, 0.16 * dt);
    if (Math.abs(target - lift) < 0.004) lift = target;
    let out = OUT0;
    let cup = cup0;
    if (inserted) {
      if (measuring && lift < 0.2 && !settled) {
        t = Math.min(RUN, t + dt);
        const v = tempsAt(t);
        curveOut.push([t, v.out]);
        curveCup.push([t, v.cup]);
        if (t >= RUN) onSettled();
      }
      const v = measuring ? tempsAt(t) : { out: OUT0, cup: cup0 };
      out = v.out;
      cup = v.cup;
    }
    drawScene(ctx, dt, tMs, out, cup);
    drawGraph(ctx);
  });

  const range = bvRange({
    cls: "u3x-range",
    min: 5,
    max: 95,
    value: cup0,
    label: "컵 속 물의 온도",
    ticks: [{ t: "5℃", p: 0 }, { t: "바깥 물 60℃", p: 61 }, { t: "95℃", p: 100 }],
    onInput: (v) => {
      cup0 = v;
      hint();
    },
  });
  const put = bvBtn("", "컵 넣기");
  const lidBtn = bvBtn("", "뚜껑 닫기");
  const btn = bvBtn("main", "측정 시작");
  const row = el("div", { class: "u3x-row" }, put, lidBtn);
  const sync = (): void => {
    put.textContent = inserted ? "컵 꺼내기" : "컵 넣기";
    put.disabled = measuring && !settled;
    lidBtn.textContent = lid ? "뚜껑 열기" : "뚜껑 닫기";
    lidBtn.classList.toggle("on", lid);
    lidBtn.disabled = !inserted || measuring;
    btn.disabled = !inserted || measuring;
    range.input.disabled = inserted;
  };

  function hint(): void {
    if (phase !== "play" || inserted) return;
    if (!coldDone && !hotDone) f.say("<b>60℃ 물</b>이 든 열량계예요. 컵의 온도를 정해 넣고, 뚜껑을 닫은 뒤 측정을 시작해요.");
    else if (coldDone && !hotDone) f.say(cup0 >= 80 ? "좋아요. 컵을 넣고 뚜껑을 닫은 뒤 측정해 예측을 확인해 봐요." : "이번엔 온도 막대를 올려 컵 속 물을 <b>바깥 물보다 뜨겁게</b>(80℃ 이상) 만들고 넣어 봐요.");
    else if (!coldDone && hotDone) f.say(cup0 <= 40 ? "좋아요. 컵을 넣고 뚜껑을 닫은 뒤 측정해 예측을 확인해 봐요." : "이번엔 온도 막대를 내려 컵 속 물을 <b>바깥 물보다 차갑게</b>(40℃ 이하) 만들고 넣어 봐요.");
  }

  function onSettled(): void {
    settled = true;
    if (leaky) {
      haptic(HAPTIC.wrong);
      f.say("뚜껑이 열려 있어 열이 <b>공기 중으로</b> 빠져나갔어요. 두 온도가 만난 뒤에도 계속 내려가요. 컵을 꺼내 다시 해 봐요.");
      sync();
      return;
    }
    t = 1e6; // 두 온도를 같아진 값에 딱 맞춘다
    curveOut.push([RUN, run0.fin]);
    curveCup.push([RUN, run0.fin]);
    haptic(HAPTIC.ctaUnlock);
    const fin = Math.round(run0.fin);
    const d = run0.cup - OUT0;
    if (Math.abs(d) < 6) f.say("두 물의 온도가 거의 같아서 열이 이동하지 않았어요. 컵을 꺼내 온도 차이를 크게 해 봐요.");
    else if (d <= -20) {
      coldDone = true;
      f.say(`열이 <b>바깥 물에서 컵으로</b> 이동했어요. 바깥 물은 식고 컵 속 물은 데워져 <b>${fin}℃</b>에서 같아졌어요.`);
    } else if (d >= 20) {
      hotDone = true;
      f.say(`열이 <b>컵에서 바깥 물로</b> 이동했어요. 컵 속 물은 식고 바깥 물은 데워져 <b>${fin}℃</b>에서 같아졌어요.`);
    } else f.say(`<b>${fin}℃</b>에서 같아졌어요. 온도 차이가 작아 변화도 작네요. 컵을 꺼내 차이를 크게 해 봐요.`);
    f.pips((coldDone ? 1 : 0) + (hotDone ? 1 : 0));
    sync();
    if (coldDone && hotDone) {
      put.disabled = true;
      tm.later(askFinal, 2600);
    }
  }

  function takeOut(): void {
    inserted = false;
    settled = false;
    measuring = false;
    lid = false;
    t = 0;
    sync();
    if ((coldDone || hotDone) && !predicted) {
      predicted = true;
      const toHot = coldDone;
      if (toHot) {
        cup0 = 90;
        range.set(90);
      } else {
        cup0 = 10;
        range.set(10);
      }
      f.say("바깥 물을 새 60℃ 물로 바꿨어요. 넣기 전에 <b>예측</b>부터 해 봐요.");
      f.slot.ask(
        toHot ? "이번엔 컵 속 물이 <b>더 뜨거워요</b>. 열은 어디로 갈까요?" : "이번엔 컵 속 물이 <b>더 차가워요</b>. 열은 어디로 갈까요?",
        [{ t: "컵 속 물에서 바깥 물로" }, { t: "바깥 물에서 컵 속 물로" }],
        () => undefined,
        {
          predict: true,
          onNext: () => {
            f.slot.showControls();
            hint();
            api.setCTA("실험으로 예측을 확인해 보세요", { enabled: false });
          },
        },
      );
    } else hint();
  }

  put.addEventListener("click", () => {
    if (phase !== "play" || (measuring && !settled)) return;
    haptic(HAPTIC.tap);
    if (inserted) {
      takeOut();
      return;
    }
    inserted = true;
    sync();
    f.say("컵을 넣었어요. 열이 밖으로 새지 않게 <b>뚜껑</b>을 닫고 <b>측정 시작</b>을 눌러요.");
  });
  lidBtn.addEventListener("click", () => {
    if (phase !== "play" || !inserted || measuring) return;
    haptic(HAPTIC.tap);
    lid = !lid;
    sync();
  });
  btn.addEventListener("click", () => {
    if (phase !== "play" || !inserted || measuring) return;
    haptic(HAPTIC.tap);
    measuring = true;
    leaky = !lid;
    settled = false;
    t = 0;
    run0 = { cup: cup0, fin: finOf(cup0) };
    curveOut = [[0, OUT0]];
    curveCup = [[0, cup0]];
    sync();
    f.say("측정을 시작했어요. 컵의 벽을 건너는 <b>열 화살표</b>와 두 온도의 그래프를 지켜봐요.");
  });

  function askFinal(): void {
    phase = "ask";
    f.say("찬 컵과 뜨거운 컵을 모두 넣어 봤어요. 두 번의 결과를 떠올리며 골라 봐요.");
    f.slot.ask(
      "두 번의 실험에서 열은 언제나 어느 쪽으로 이동했나요?",
      [{ t: "온도가 높은 물에서 낮은 물로", ok: true }, { t: "늘 바깥 물에서 컵 속 물로" }, { t: "늘 컵 속 물에서 바깥 물로" }],
      (ok) => api.recordQuiz(ok),
      { why: "컵이 차가울 땐 <b>컵으로</b>, 뜨거울 땐 <b>바깥으로</b> 갔어요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("열은 <b>온도가 높은 물체에서 낮은 물체로</b> 이동해요. 두 물체의 온도가 같아지면 멈추는데, 이 상태를 <b>열평형</b>이라고 해요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el, row, btn);
  sync();
  hint();
  api.setCTA("찬 컵과 뜨거운 컵으로 실험해 보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.stop();
  };
};
