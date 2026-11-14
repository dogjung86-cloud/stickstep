// [중2 Ⅷ v5] g2u8l1 parallaxLab: 「별이 멀어지면 시차는 어떻게 될까요?」
// 책의 어디에서: 그림 '별의 연주 시차'(6개월 간격의 두 시선이 별에서 만드는 각이 시차, 그 절반이 연주 시차. 별이 멀수록 작다).
// 한 통찰: 별이 멀수록 시차가 작다(거리가 2배, 3배가 되면 옮겨 간 칸 수는 1/2, 1/3). 그 시차의 절반으로 별의 거리를 나타낸다.
// 걸음: ① 2배 멀어지면 어떻게 될지 예측 ② 별을 1배에서 4배까지 보내며 옮겨 간 칸 수를 적는다 ③ 판정(6배라면 몇 칸?)
//       ④ 태양과 별을 이은 선으로 시차를 반으로 나누고, 별을 다시 옮겨 절반의 각도 함께 작아지는 것을 본다 ⑤ 판정.
// 학생이 정하는 것: 별까지의 거리. 앞 랩(orbitLab)에서 지구를 옮겨 본 두 자리(처음, 6개월 뒤)를 여기서는 한꺼번에 놓고 본다.
// 검산: 밤하늘 칸의 별 자리는 시선의 방향(기울기)으로 정한다. 지구 궤도의 반지름 40, 거리 n배 = 32n이라 기울기는 40/(32n),
//       밤하늘에서 가운데로부터 ±6/n칸(한 칸 22). 두 자리 사이는 12/n칸: 1배 12칸, 2배 6칸, 3배 4칸, 4배 3칸(거리 × 칸 수 = 12로 반비례).
//       아주 먼 배경 별은 지구가 어디에 있든 같은 방향에 보이므로 밤하늘 칸의 기준이 된다. 각도는 크게 과장했다(무대에 적는다).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { S, sArrow, sCanvas, sDisk, sFrame, sGlow, sLine, sLog, sText, type LabStep } from "./kit";
import { angleArc, skyPanel, skyStar, skyTicks, span } from "./parallaxKit";

const ROW = 33; // 밤하늘 칸에서 별이 놓이는 줄
const SUN_Y = 200;
const ORB = 40;
const UNIT = 32; // 거리 1배
const TICK = 22;
const TOTAL = 12; // 거리 1배일 때 옮겨 간 칸 수
const cells = (n: number): number => TOTAL / n;

export const parallaxLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let n = 1; // 별까지의 거리(배)
  let nShow = 1;
  let phase: "predict" | "far" | "half" | "halfMove" | "end" = "predict";
  let halfT = 0; // 반으로 나누는 선이 그려진 정도
  let movedHalf = false;

  const log = sLog(["거리 1배", "거리 2배", "거리 3배", "거리 4배"], 4);
  log.el.classList.add("stack");
  const bHalf = bvBtn("main", "시차를 반으로 나누기");
  const range = bvRange({
    cls: "g2u8x-r",
    min: 1,
    max: 4,
    value: 1,
    label: "별까지의 거리",
    ticks: ["1배", "2배", "3배", "4배"],
    onInput: (v) => {
      n = v;
      if (phase === "far") {
        log.set(v - 1, `${cells(v)}칸`);
        f.say(v === 1 ? "거리 1배: 두 자리 사이가 <b>12칸</b>이에요." : `거리 <b>${v}배</b>: 두 시선이 좁아져 <b>${cells(v)}칸</b>만 옮겨 보여요.`);
        if ([0, 1, 2, 3].every((i) => log.has(i))) {
          phase = "end";
          f.pips(1);
          tm.later(() => {
            range.input.disabled = true;
            askRule();
          }, 1500);
        }
      } else if (phase === "halfMove") {
        f.say(`거리 <b>${v}배</b>: 시차가 작아지니 그 <b>절반</b>도 함께 작아져요.`);
        if (v !== 2 && !movedHalf) {
          movedHalf = true;
          tm.later(() => {
            range.input.disabled = true;
            askHalf();
          }, 1800);
        }
      }
    },
  });

  function startFar(): void {
    phase = "far";
    f.slot.setControls(range.el, log.el);
    log.set(0, `${cells(1)}칸`);
    f.say("예측 완료! 막대를 밀어 별을 <b>멀리</b> 보내고 옮겨 간 칸 수를 보세요.");
  }
  function askRule(): void {
    f.say("기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "거리가 6배인 별은 몇 칸 옮겨 보일까요?",
      [{ t: "2칸", ok: true }, { t: "1칸" }, { t: "6칸" }],
      (ok) => api.recordQuiz(ok),
      { why: "거리 × 칸 수가 늘 <b>12</b>예요(1×12, 2×6, 3×4, 4×3).", onNext: startHalf },
    );
  }
  function startHalf(): void {
    phase = "half";
    f.pips(2);
    n = 2;
    range.set(2);
    f.slot.setControls(bHalf);
    api.setCTA("시차를 반으로 나눠 보세요", { enabled: false });
    f.say("이번에는 각을 봐요. 두 시선이 별에서 만드는 각이 <b>시차</b>예요. 반으로 나눠 보세요.");
  }
  bHalf.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    bHalf.disabled = true;
    phase = "halfMove";
    f.say("태양과 별을 이은 선이 시차를 <b>똑같이 둘로</b> 나눠요. 한쪽이 시차의 절반이에요.");
    tm.later(() => {
      range.input.disabled = false;
      f.slot.setControls(range.el);
      f.say("막대를 밀어 별의 거리를 바꾸고, <b>절반의 각</b>이 어떻게 되는지 보세요.");
    }, 2600);
  });
  function askHalf(): void {
    f.say("마지막 질문이에요.");
    f.slot.ask(
      "별이 멀어지면 시차의 절반은?",
      [{ t: "함께 작아져요", ok: true }, { t: "그대로예요" }, { t: "오히려 커져요" }],
      (ok) => api.recordQuiz(ok),
      { why: "시차가 작아지면 <b>그 절반</b>도 작아져요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("관측 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("별이 <b>멀수록 시차가 작아요</b>. 거리가 2배, 3배가 되면 밤하늘에서 옮겨 간 칸 수는 2분의 1, 3분의 1이 돼요. 6개월 간격으로 잰 시차의 <b>절반</b>으로 별의 거리를 나타내요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t, dt) => {
    const cx = w / 2;
    nShow += (n - nShow) * Math.min(1, dt * 0.17);
    const d = UNIT * nShow;
    const sy = SUN_Y - d;
    const off = ((TOTAL / 2) * TICK) / nShow; // 밤하늘 칸에서 가운데로부터의 거리
    const e1 = { x: cx - ORB, y: SUN_Y };
    const e2 = { x: cx + ORB, y: SUN_Y };
    const half = phase === "halfMove" || (phase === "end" && movedHalf);
    halfT += ((half ? 1 : 0) - halfT) * Math.min(1, dt * 0.08);
    // 위: 지구에서 본 밤하늘(두 번 본 자리를 함께 놓았다)
    skyPanel(ctx, 8, 6, w - 16, 50, "지구에서 본 밤하늘");
    skyTicks(ctx, cx, 56, TICK, 6);
    span(ctx, cx - off, cx + off, ROW, "rgba(255,255,255,.55)", 1.6);
    skyStar(ctx, cx + off, ROW, S.gold);
    skyStar(ctx, cx - off, ROW, S.ok);
    sText(ctx, `옮겨 간 칸 수 ${Math.round(cells(nShow) * 10) / 10}칸`, w - 17, 18, { color: "#fff", px: 12.5, w: 800, align: "right" });
    // 아래: 위에서 내려다본 모습
    sText(ctx, "위에서 내려다본 모습", 12, 70, { color: S.dim, px: 12, align: "left" });
    sText(ctx, `거리 ${n}배`, w - 12, 70, { color: S.gold, px: 13, w: 800, align: "right" });
    sText(ctx, "각도는 크게 과장한 그림", w - 10, 221, { color: S.dim, px: 12, align: "right" });
    ctx.save();
    ctx.strokeStyle = S.line;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.ellipse(cx, SUN_Y, ORB, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // 두 시선(지구에서 별을 지나 조금 더)
    const ux = ORB / Math.hypot(ORB, d);
    const uy = d / Math.hypot(ORB, d);
    sArrow(ctx, e1.x, e1.y, cx + ux * 12, sy - uy * 12, "rgba(255,209,102,.85)", 1.8, 7);
    sArrow(ctx, e2.x, e2.y, cx - ux * 12, sy - uy * 12, "rgba(127,227,196,.85)", 1.8, 7);
    // 별에서 두 시선이 만드는 각(시차)과 그 절반
    const a1 = Math.atan2(e1.y - sy, e1.x - cx); // 왼쪽 지구 쪽
    const a2 = Math.atan2(e2.y - sy, e2.x - cx); // 오른쪽 지구 쪽
    const r = 19;
    if (halfT > 0.02) {
      ctx.save();
      ctx.globalAlpha = halfT;
      angleArc(ctx, cx, sy, r + 7, a2, Math.PI / 2, S.ok, "rgba(127,227,196,.3)");
      sLine(ctx, cx, sy, cx, sy + (SUN_Y - sy) * halfT, "#fff", 1.6);
      sText(ctx, "초록 각이 절반", w - 12, 88, { color: S.ok, px: 12.5, w: 800, align: "right" });
      ctx.restore();
    }
    angleArc(ctx, cx, sy, r, a2, a1, S.gold);
    const lb = a1 + 0.5;
    sText(ctx, "시차", cx + Math.cos(lb) * (r + 13), sy + Math.sin(lb) * (r + 13), { color: S.gold, px: 12.5, w: 800, align: "right" });
    // 태양, 별, 두 지구
    sGlow(ctx, cx, SUN_Y, 13, S.sun, 0.45);
    sText(ctx, "태양", cx, SUN_Y + 20, { color: S.dim, px: 12 });
    sGlow(ctx, cx, sy, 10 + Math.sin(t / 400) * 1, S.star);
    sText(ctx, "별 S", cx + 15, sy - 4, { color: S.ink, px: 12.5, align: "left" });
    sDisk(ctx, e1.x, e1.y, 7, S.earth, S.gold, 2);
    sDisk(ctx, e2.x, e2.y, 7, S.earth, S.ok, 2);
    sText(ctx, "처음", e1.x - 12, e1.y, { color: S.gold, px: 12, align: "right" });
    sText(ctx, "6개월 뒤", e2.x + 12, e2.y, { color: S.ok, px: 12, align: "left" });
  });

  f.say("지구가 <b>처음</b>과 <b>6개월 뒤</b>에 본 별 S예요. 밤하늘에서 12칸 옮겨 보여요.");
  api.setCTA("별을 멀리 보내 보세요", { enabled: false });
  f.slot.ask(
    "별 S가 2배 멀어지면 옮겨 간 칸 수는 어떻게 될까요?",
    [{ t: "절반으로 줄어요" }, { t: "2배로 늘어요" }, { t: "그대로예요" }],
    () => undefined,
    { predict: true, onNext: startFar },
  );
  return () => {
    tm.clear();
    st.stop();
  };
};
