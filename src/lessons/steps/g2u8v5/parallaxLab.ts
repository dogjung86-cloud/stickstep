// [중2 Ⅷ v5] g2u8l1 parallaxLab: 「별이 멀어지면 시차는 어떻게 될까요?」
// 책의 어디에서: 그림 '별의 연주 시차'(지구가 E1에 있을 때와 6개월 뒤 E2에 있을 때 가까운 별 S가 먼 배경의 다른 자리에 보인다).
// 한 통찰: 6개월 간격으로 본 별의 시차는 별이 멀수록 작다(그 절반이 연주 시차).
// 학생이 정하는 것: 두 번째 관측을 언제 할지(6개월 뒤, 1년 뒤), 별까지의 거리.
// 실패하는 길: 1년 뒤에 보면 지구가 제자리로 돌아와 별이 같은 자리에 보인다(시차를 잴 수 없다).
// 그림의 각도는 크게 과장했다(무대에 적는다). 연주 시차의 값은 1 pc에 1″인 반비례 그대로다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers, bvTween } from "../bio6/b6Lab";
import { S, sCanvas, sDisk, sField, sFrame, sGlow, sLine, sLog, sRow, sText, type LabStep } from "./kit";

const SKY_Y = 28;
const SUN_Y = 196;
const ORB = 62;
const PC = [1, 1.5, 2, 2.5];
const fmt = (p: number): string => `${p.toFixed(2)}″`;

export const parallaxLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let th = Math.PI; // 지구의 자리(궤도 위의 각). π는 왼쪽(E1), 0은 오른쪽(E2)
  let obs1 = false;
  let obs2 = false;
  let failYear = false;
  let busy = false;
  let di = 0; // PC의 차례
  let dShow = PC[0];
  let finished = false;

  const bNow = bvBtn("main", "지금 별의 자리 적기");
  const bHalf = bvBtn("", "6개월 뒤에 보기");
  const bYear = bvBtn("", "1년 뒤에 보기");
  const log = sLog(["거리 1 pc", "거리 2 pc"], 2, true);
  const range = bvRange({
    cls: "g2u8x-r",
    min: 0,
    max: 3,
    value: 0,
    label: "별까지의 거리",
    ticks: ["1 pc", "1.5 pc", "2 pc", "2.5 pc"],
    onInput: (v) => {
      di = v;
      if (PC[v] === 1) log.set(0, fmt(1));
      if (PC[v] === 2) log.set(1, fmt(0.5));
      f.say(`거리 <b>${PC[v]} pc</b>: 6개월 사이의 시차는 ${fmt(2 / PC[v])}, 그 절반은 <b>${fmt(1 / PC[v])}</b>예요.`);
      if (log.has(0) && log.has(1) && !finished) {
        finished = true;
        f.pips(2);
        tm.later(() => {
          range.input.disabled = true;
          askFinal();
        }, 1400);
      }
    },
  });

  const paint = (): void => {
    bNow.disabled = busy || obs1;
    bHalf.disabled = busy || !obs1 || obs2;
    bYear.disabled = busy || !obs1 || obs2;
  };
  bNow.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    obs1 = true;
    paint();
    f.say("먼 배경 별들 사이에서 별 S가 보이는 자리를 적었어요. 두 번째 관측은 <b>언제</b> 할까요?");
  });
  const move = (half: boolean): void => {
    haptic(HAPTIC.tap);
    busy = true;
    paint();
    const from = Math.PI;
    const to = half ? 0 : -Math.PI;
    f.say(half ? "지구가 태양 둘레를 <b>반 바퀴</b> 돌고 있어요." : "지구가 태양 둘레를 <b>한 바퀴</b> 돌고 있어요.");
    bvTween(tm, half ? 1500 : 2400, (t) => (th = from + (to - from) * t), () => {
      busy = false;
      if (half) {
        obs2 = true;
        haptic(HAPTIC.correct);
        f.pips(1);
        f.say("별 S가 배경 별들 사이에서 <b>옮겨 간 자리</b>에 보여요. 이제 별까지의 거리를 바꿔 보세요.");
        tm.later(() => {
          f.slot.setControls(range.el, log.el);
          log.set(0, fmt(1));
        }, 900);
      } else {
        failYear = true;
        th = Math.PI;
        f.say("지구가 <b>제자리</b>로 돌아와 별이 같은 자리에 보여요. 옮겨 간 정도를 잴 수 없어요. 6개월 뒤에 봐야 해요.");
        bYear.classList.add("g2u8x-off");
      }
      paint();
    });
  };
  bHalf.addEventListener("click", () => move(true));
  bYear.addEventListener("click", () => !failYear && move(false));
  f.slot.setControls(bNow, sRow(bHalf, bYear));

  function askFinal(): void {
    f.say("두 기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "별까지의 거리가 2배가 되자 시차의 절반은?",
      [{ t: "절반으로 작아졌어요", ok: true }, { t: "2배로 커졌어요" }, { t: "변하지 않았어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "1 pc일 때 <b>1.00″</b>, 2 pc일 때 <b>0.50″</b>였어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("관측 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("6개월 간격으로 잰 시차의 <b>절반</b>이 연주 시차예요. 별이 <b>멀수록 연주 시차가 작아요</b>. 연주 시차가 1″인 별까지의 거리가 1 pc이에요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t, dt) => {
    const cx = w / 2;
    dShow += (PC[di] - dShow) * Math.min(1, dt * 0.17);
    const sy = SUN_Y - 56 * dShow;
    // 먼 배경 별(천구)
    ctx.fillStyle = "rgba(143,180,255,.08)";
    ctx.fillRect(0, 0, w, SKY_Y + 14);
    sField(ctx, 0, 4, w, SKY_Y + 6, 46, 7, 0.9);
    sText(ctx, "아주 먼 배경 별", 12, SKY_Y + 26, { color: S.dim, px: 12, align: "left" });
    // 지구 궤도와 태양
    ctx.save();
    ctx.strokeStyle = S.line;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.ellipse(cx, SUN_Y, ORB, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    sGlow(ctx, cx, SUN_Y, 16, S.sun, 0.45);
    sText(ctx, "태양", cx, SUN_Y + 24, { color: S.dim, px: 12 });
    const e1 = { x: cx - ORB, y: SUN_Y };
    const e2 = { x: cx + ORB, y: SUN_Y };
    const hit = (e: { x: number; y: number }): number => e.x + ((cx - e.x) * (e.y - SKY_Y)) / (e.y - sy);
    // 시선과 배경에 보이는 자리
    if (obs1) {
      sLine(ctx, e1.x, e1.y, hit(e1), SKY_Y, "rgba(143,180,255,.7)", 1.6, [5, 5]);
      sDisk(ctx, hit(e1), SKY_Y, 5, S.gold);
      sText(ctx, "처음 자리", Math.min(w - 34, hit(e1)), SKY_Y - 14, { color: S.gold, px: 12 });
    }
    if (obs2) {
      sLine(ctx, e2.x, e2.y, hit(e2), SKY_Y, "rgba(143,180,255,.7)", 1.6, [5, 5]);
      sDisk(ctx, hit(e2), SKY_Y, 5, S.ok);
      sText(ctx, "6개월 뒤", Math.max(30, hit(e2)), SKY_Y - 14, { color: S.ok, px: 12 });
      // 별에서 두 시선이 이루는 각
      const a1 = Math.atan2(e1.y - sy, e1.x - cx);
      const a2 = Math.atan2(e2.y - sy, e2.x - cx);
      ctx.save();
      ctx.strokeStyle = S.gold;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, sy, 22, a2, a1);
      ctx.stroke();
      ctx.restore();
      sText(ctx, `시차 ${fmt(2 / PC[di])}`, cx, sy + 36, { color: S.gold, px: 13, w: 800 });
      sText(ctx, `절반 ${fmt(1 / PC[di])}`, cx, sy + 52, { color: "#fff", px: 13, w: 800 });
    }
    // 별 S
    sGlow(ctx, cx, sy, 11 + Math.sin(t / 400) * 1, S.star);
    sText(ctx, "별 S", cx + 26, sy - 8, { color: S.ink, px: 12.5 });
    // 지구
    const ex = cx + Math.cos(th) * ORB;
    const ey = SUN_Y - Math.sin(th) * 14;
    if (obs2) sDisk(ctx, e1.x, e1.y, 6, "rgba(90,162,248,.35)", "rgba(255,255,255,.4)", 1);
    sDisk(ctx, ex, ey, 7, S.earth, "#fff", 1.5);
    sText(ctx, "지구", ex + (ex < cx ? -24 : 24), ey - 2, { color: S.ink, px: 12 });
    sText(ctx, "각도는 크게 과장한 그림", w - 10, SUN_Y + 24, { color: S.dim, px: 12, align: "right" });
  });

  paint();
  f.say("지구에서 가까운 <b>별 S</b>를 관측해요. 먼저 지금 별이 배경 별들 사이의 어디에 보이는지 적어 두세요.");
  api.setCTA("별을 두 번 관측해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
