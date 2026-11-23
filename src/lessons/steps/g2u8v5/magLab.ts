// [중2 Ⅷ v5] g2u8l3 magLab: 「밝은 별일수록 등급의 숫자는 어떻게 될까요?」
// 다루는 내용: 본문(히파르코스가 가장 밝은 별을 1등성, 가장 어두운 별을 6등성으로 정했다. 1등급은 6등급의 100배, 1등급 차이는 약 2.5배).
// 한 통찰: 등급의 숫자가 작을수록 밝고, 1등급 작아질 때마다 약 2.5배 밝아진다.
// 학생이 정하는 것: 밝은 별부터 고르는 차례(틀리면 이름이 붙지 않는다), 비교할 등급.
// 밝기의 비는 2.512의 거듭제곱이다(1, 약 2.5, 약 6.3, 약 16, 약 40, 100).
// 막대는 한 눈금(직선)이라 어두운 등급의 막대가 낮다. 그래서 막대 사이마다 "×약 2.5" 뜀을 적고, 왼쪽 위 작은 칸에
// 고른 등급과 한 등급 어두운 별을 같은 눈금으로 크게 그린다(어느 등급을 골라도 같은 모습이라 같은 배수가 보인다).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvRange, bvTimers } from "../bio6/b6Lab";
import { S, sArrow, sBox, sCanvas, sCap, sField, sFrame, sGlow, sLog, sText, type LabStep } from "./kit";

const RATIO = ["1", "약 2.5", "약 6.3", "약 16", "약 40", "100"]; // 6등급부터 1등급까지
const VAL = [1, 2.512, 6.31, 15.85, 39.8, 100];
// 밤하늘의 별 여섯(가로, 세로는 무대 크기에 대한 비율). 0번이 가장 밝다.
const STARS: [number, number][] = [
  [0.7, 0.34],
  [0.24, 0.62],
  [0.47, 0.22],
  [0.86, 0.7],
  [0.14, 0.26],
  [0.55, 0.74],
];
const radius = (rank: number): number => 19 - rank * 2.9;

export const magLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let phase: "name" | "bars" | "end" = "name";
  let named = 0; // 이름 붙인 별의 수
  let miss = -1;
  let missT = 0;
  let sel = 0; // 막대 국면에서 고른 등급의 차례(0은 6등급, 5는 1등급)
  const log = sLog(["5등급 별", "1등급 별"], 2, true);

  if (import.meta.env.DEV) f.stage.dataset.stars = JSON.stringify(STARS);
  f.slot.setControls(sCap("밤하늘의 별을 직접 눌러 보세요. 가장 밝은 별부터 <b>차례대로</b> 누르면 1등성부터 6등성까지 이름이 붙어요."));

  st.cv.addEventListener("pointerdown", (e) => {
    if (phase !== "name") return;
    const p = st.pt(e);
    let hit = -1;
    STARS.forEach(([x, y], i) => {
      if (Math.hypot(p.x - x * st.w(), p.y - y * st.h()) < 30) hit = i;
    });
    if (hit < 0 || hit < named) return;
    if (hit === named) {
      named += 1;
      haptic(HAPTIC.correct);
      f.say(named < 6 ? `<b>${named}등성</b>을 찾았어요! 이제 남은 별들 중에서 가장 밝은 별을 눌러 보세요.` : "가장 어두운 별까지 <b>6등성</b>으로 모두 분류했어요! 등성(등급)은 숫자가 작을수록 더 밝은 별이에요.");
      if (named === 6) {
        f.pips(1);
        tm.later(toBars, 1500);
      }
    } else {
      miss = hit;
      missT = 1;
      haptic(HAPTIC.wrong);
      f.say("아직 그 별보다 <b>더 밝게 빛나는 별</b>이 남아 있어요. 가장 밝은 별부터 차례로 골라 보세요.");
    }
  });

  const range = bvRange({
    cls: "g2u8x-r",
    min: 0,
    max: 5,
    value: 0,
    label: "비교할 별의 등급",
    ticks: ["6등급", "5", "4", "3", "2", "1등급"],
    onInput: (v) => {
      sel = v;
      if (v === 1) log.set(0, "약 2.5배");
      if (v === 5) log.set(1, "100배");
      f.say(v === 0 ? "6등급 별의 밝기(1)를 기준으로 비교해 볼게요. 슬라이더를 밀어 등급을 바꿔 보세요." : `<b>${6 - v}등급</b> 별은 6등급 별보다 <b>${RATIO[v]}배</b> 밝아요(한 등급마다 약 2.5배씩 밝아져요).`);
      if (log.has(0) && log.has(1) && phase === "bars") {
        phase = "end";
        f.pips(2);
        tm.later(() => {
          range.input.disabled = true;
          askFinal();
        }, 1500);
      }
    },
  });
  function toBars(): void {
    phase = "bars";
    f.slot.setControls(range.el, log.el);
    f.say("이번에는 등급별 밝기 차이를 비교해 볼까요? <b>슬라이더를 밀어</b> 6등급부터 1등급까지 밝기가 몇 배가 되는지 확인해 보세요.");
  }
  function askFinal(): void {
    f.say("6등급부터 1등급까지 별의 밝기 배수를 모두 확인했어요!");
    f.slot.ask(
      "별의 등급 숫자가 1등급 작아질 때마다 별은 몇 배씩 밝아지나요?",
      [{ t: "약 2.5배씩 밝아져요", ok: true }, { t: "약 2.5배씩 어두워져요" }, { t: "2.5만큼씩 더해져요" }],
      (ok) => api.recordQuiz(ok),
      { why: "1등급 작아질 때마다 밝기가 <b>약 2.5배</b>씩 커져서, 5등급 차이인 1등급 별은 6등급 별보다 <b>100배</b> 밝아요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("등급 숫자가 작을수록 밝은 별이며, 1등급 차이는 약 2.5배, 5등급 차이는 100배의 밝기 차이라는 것을 확인했어요!");
    f.slot.conclude("등급의 <b>숫자가 작을수록 밝은</b> 별이에요. 1등급 작아질 때마다 약 2.5배 밝아져서, 1등급 별은 6등급 별보다 <b>100배</b> 밝아요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t, dt) => {
    if (missT > 0) missT = Math.max(0, missT - dt / 30);
    if (phase === "name") {
      sField(ctx, 0, 0, w, h, 50, 3, 0.5);
      STARS.forEach(([x, y], i) => {
        const r = radius(i);
        const shake = i === miss && missT > 0 ? Math.sin(t / 22) * 4 * missT : 0;
        sGlow(ctx, x * w + shake, y * h, r, i === miss && missT > 0 ? "#FF9AA2" : S.star, 0.32);
        if (i < named) sText(ctx, `${i + 1}등성`, x * w, y * h + r + 11, { color: S.gold, px: 12.5, w: 800 });
      });
      return;
    }
    // 등급별 밝기 막대(6등급이 1인 한 눈금. 1등급 막대가 6등급의 100배다)
    const bx = 30;
    const bw = (w - bx - 14) / 6;
    const base = h - 54;
    const top = 40;
    const mid = (i: number): number => bx + i * bw + bw / 2;
    for (let i = 0; i < 6; i++) {
      const x = bx + i * bw; // 왼쪽이 6등급(막대의 차례와 같다)
      const hh = Math.max(1.5, (VAL[i] / 100) * (base - top));
      const on = i === sel;
      sBox(ctx, x + 8, base - hh, bw - 16, hh, 3, on ? S.gold : "rgba(255,233,168,.3)");
      sGlow(ctx, x + bw / 2, base + 2 - hh - 12, 4 + i * 1.6, S.star, 0.4);
      sText(ctx, `${6 - i}등급`, x + bw / 2, base + 13, { color: on ? "#fff" : S.dim, px: 12, w: on ? 800 : 700 });
    }
    // 막대 사이의 뜀: 한 등급 밝아질 때마다 같은 배수(약 2.5). 고른 등급과 한 등급 어두운 별 사이를 밝힌다.
    for (let i = 0; i < 5; i++) {
      const on = i === sel - 1;
      const col = on ? S.gold : "rgba(232,238,249,.5)";
      const x0 = mid(i) + 7;
      const x1 = mid(i + 1) - 7;
      const y0 = base + 23;
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = on ? 2.2 : 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo((x0 + x1) / 2, y0 + 9, x1 - 2, y0 + 1);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x1 + 1, y0 - 1);
      ctx.lineTo(x1 - 6, y0 - 2.5);
      ctx.lineTo(x1 - 3.5, y0 + 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      sText(ctx, "×약 2.5", (x0 + x1) / 2, base + 41, { color: on ? S.gold : S.dim, px: 12, w: on ? 800 : 700 });
    }
    sText(ctx, `${6 - sel}등급 별의 밝기는 6등급 별의`, 12, 16, { color: S.dim, px: 12, align: "left" });
    sText(ctx, `${RATIO[sel]}배`, 12, 34, { color: S.gold, px: 16, align: "left", w: 800 });
    // 왼쪽 위 작은 칸: 고른 등급과 한 등급 어두운 별을 같은 눈금으로 크게(어느 등급을 골라도 늘 같은 모습)
    const kx = 10;
    const ky = 48;
    const kw = 126;
    const kh = 98;
    sBox(ctx, kx, ky, kw, kh, 10, "rgba(20,32,60,.92)", "rgba(143,180,255,.45)", 1.2);
    if (sel === 0) {
      sText(ctx, "슬라이더를 밀어", kx + kw / 2, ky + kh / 2 - 9, { color: S.dim, px: 12 });
      sText(ctx, "등급을 골라 보세요", kx + kw / 2, ky + kh / 2 + 9, { color: S.dim, px: 12 });
    } else {
      sText(ctx, "한 등급 차이", kx + kw / 2, ky + 13, { color: S.dim, px: 12 });
      const kb = ky + kh - 21;
      const big = 50;
      const small = big / 2.512;
      sBox(ctx, kx + 20, kb - small, 26, small, 3, "rgba(255,233,168,.45)");
      sBox(ctx, kx + 80, kb - big, 26, big, 3, S.gold);
      sText(ctx, `${7 - sel}등급`, kx + 33, kb + 11, { color: S.dim, px: 12 });
      sText(ctx, `${6 - sel}등급`, kx + 93, kb + 11, { color: "#fff", px: 12, w: 800 });
      sArrow(ctx, kx + 36, kb - small - 7, kx + 74, kb - big + 3, S.gold, 2, 7);
      sText(ctx, "×약 2.5", kx + 44, kb - big - 1, { color: S.gold, px: 12, w: 800 });
    }
  });

  f.say("맨눈으로 보이는 별 여섯 개예요. <b>가장 밝게 보이는 별부터</b> 차례로 눌러 등성을 매겨 보세요.");
  api.setCTA("별에 등급을 매겨 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
