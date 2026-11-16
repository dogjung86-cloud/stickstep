// [중2 Ⅷ v5] g2u8l1 parallaxLab: 「별이 멀어지면 시차는 어떻게 될까요?」
// 책의 어디에서: 그림 '별의 연주 시차'(6개월 간격의 두 시선이 별에서 만드는 각이 시차, 그 절반이 연주 시차. 별이 멀수록 작다).
// 한 통찰: 별이 멀수록 시차가 작다(거리가 2배, 3배가 되면 옮겨 간 칸 수는 1/2, 1/3). 그 시차의 절반으로 별의 거리를 나타낸다.
// 걸음: ① 2배 멀어지면 어떻게 될지 예측 ② 별을 1배에서 4배까지 보내며 옮겨 간 칸 수를 적는다 ③ 판정(6배라면 몇 칸?)
//       ④ 태양과 별을 이은 선으로 시차를 반으로 나누고, 별을 다시 옮겨 절반의 각도 함께 작아지는 것을 본다 ⑤ 판정.
// 학생이 정하는 것: 별까지의 거리. 앞 랩(orbitLab)에서 지구를 옮겨 본 두 자리(처음, 6개월 뒤)를 여기서는 한꺼번에 놓고 본다.
// 검산: 밤하늘 칸의 별 자리는 시선의 방향(기울기)으로 정한다. 지구 궤도의 반지름 40, 거리 n배 = 32n이라 기울기는 40/(32n),
//       밤하늘에서 가운데로부터 ±6/n칸(한 칸 22). 두 자리 사이는 12/n칸: 1배 12칸, 2배 6칸, 3배 4칸, 4배 3칸(거리 × 칸 수 = 12로 반비례).
//       아주 먼 배경 별은 지구가 어디에 있든 같은 방향에 보이므로 밤하늘 칸의 기준이 된다. 각도는 크게 과장했다(무대에 적는다).
// 밤하늘 칸은 아주 먼 배경이라 '방향'을 보여 주는 칸이다. 시선을 별 S를 지나 이 칸의 별 자리까지 곧게 이어 그리면
//       유한한 그림에서는 거리 n배와 칸 수 n분의 1이 함께 맞을 수 없다(배경이 그림 안의 가까운 거리에 놓이게 된다). 그래서 두 시선은 별을 지나
//       조금 더(밤하늘 칸 아래까지만) 옅게 늘여 엇갈리는 모습만 보이고, 어느 자리인지는 색(처음 금색, 6개월 뒤 초록)으로 잇는다.
// 기록은 무대 왼쪽에 거리마다 한 줄(거리, 칸 수만큼의 막대, 칸 수)로 쌓는다. 판정 때 조작 칸의 기록 줄이 숨어도 1~4배의 칸 수가 무대에 남는다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { S, sArrow, sBox, sCanvas, sDisk, sFrame, sGlow, sLine, sLog, sText, type LabStep } from "./kit";
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
  const bHalf = bvBtn("main", "시차의 절반(연주 시차) 표시하기");
  const range = bvRange({
    cls: "g2u8x-r",
    min: 1,
    max: 4,
    value: 1,
    label: "별까지의 거리",
    ticks: ["1배", "2배", "3배", "4배"],
    onInput: (v) => {
      const nearer = v < n; // 바로 전보다 가까워졌는가(가까워지면 시차와 그 절반이 커진다)
      n = v;
      if (phase === "far") {
        log.set(v - 1, `${cells(v)}칸`);
        f.say(v === 1 ? "거리가 1배일 때는 6개월 동안 별이 <b>12칸</b> 옮겨 보여요." : `거리가 <b>${v}배</b>로 멀어지자 두 시선이 이루는 각이 좁아져 <b>${cells(v)}칸</b>(1/${v})만 옮겨 보여요.`);
        if ([0, 1, 2, 3].every((i) => log.has(i))) {
          phase = "end";
          f.pips(1);
          tm.later(() => {
            range.input.disabled = true;
            askRule();
          }, 1500);
        }
      } else if (phase === "halfMove") {
        f.say(nearer ? `거리가 <b>${v}배</b>로 가까워지자 시차가 커지면서 시차의 <b>절반(초록색 각)</b>도 함께 커져요.` : `거리가 <b>${v}배</b>가 되자 시차가 작아지면서 시차의 <b>절반(초록색 각)</b>도 함께 작아져요.`);
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
    f.say("예측 완료! 슬라이더를 밀어 별을 <b>멀리</b> 보내고 옮겨 간 칸 수를 보세요.");
  }
  function askRule(): void {
    f.say("거리가 1배에서 4배까지 멀어질 때 옮겨 보인 칸 수를 모두 기록했어요!");
    f.slot.ask(
      "이 규칙대로라면 거리가 6배인 별은 밤하늘에서 몇 칸 옮겨 보일까요?",
      [{ t: "2칸", ok: true }, { t: "1칸" }, { t: "6칸" }],
      (ok) => api.recordQuiz(ok),
      { why: "옮겨 보인 칸 수는 거리에 반비례해요. 거리가 1배일 때 12칸이므로, 거리가 6배이면 12 ÷ 6 = <b>2칸</b> 옮겨 보여요.", onNext: startHalf },
    );
  }
  function startHalf(): void {
    phase = "half";
    f.pips(2);
    n = 2;
    range.set(2);
    f.slot.setControls(bHalf);
    api.setCTA("시차를 반으로 나눠 보세요", { enabled: false });
    f.say("이번에는 두 시선이 별에서 이루는 각도인 <b>시차</b>를 살펴볼까요? 아래 버튼을 눌러 시차를 반으로 나누어 보세요.");
  }
  bHalf.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    bHalf.disabled = true;
    phase = "halfMove";
    f.say("태양과 별을 잇는 기준선이 시차를 <b>똑같이 절반으로</b> 나누었어요! 이 절반의 각을 <b>연주 시차</b>라고 불러요.");
    tm.later(() => {
      range.input.disabled = false;
      f.slot.setControls(range.el);
      f.say("이제 슬라이더를 움직여 별의 거리를 바꾸면서 <b>시차의 절반(초록색 각)</b>이 어떻게 변하는지 확인해 보세요.");
    }, 2600);
  });
  function askHalf(): void {
    f.say("별의 거리에 따라 시차의 절반이 어떻게 달라지는지 확인했어요!");
    f.slot.ask(
      "별까지의 거리가 멀어지면 시차의 절반(연주 시차)은 어떻게 되나요?",
      [{ t: "시차와 함께 작아져요", ok: true }, { t: "변함없이 그대로예요" }, { t: "오히려 점점 커져요" }],
      (ok) => api.recordQuiz(ok),
      { why: "별이 멀어질수록 시차가 작아지므로, 시차의 절반인 <b>연주 시차</b>도 거리에 반비례하여 작아져요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("별까지의 거리가 멀수록 시차와 연주 시차가 반비례하여 작아진다는 것을 확인했어요!");
    f.slot.conclude("별까지의 거리가 <b>멀수록 시차는 작아져요</b>. 거리가 2배, 3배로 멀어지면 시차도 1/2, 1/3로 줄어들어요. 지구에서 6개월 간격으로 관측한 시차의 <b>절반(연주 시차)</b>을 이용하면 별까지의 거리를 구할 수 있어요.");
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
    // 아래: 비스듬히 내려다본 모습(궤도를 납작한 타원으로 그렸다)
    sText(ctx, "비스듬히 내려다본 모습", 12, 70, { color: S.dim, px: 12, align: "left" });
    // 기록: 거리마다 옮겨 간 칸 수(칸 수만큼의 막대). 판정 때도 남는다.
    [1, 2, 3, 4].forEach((d, i) => {
      if (!log.has(i)) return;
      const y = 128 + i * 15; // 왼쪽 아래(별의 '시차' 이름표와 겹치지 않는 자리)
      const now = Math.abs(nShow - d) < 0.5;
      const col = now ? S.gold : "rgba(255,209,102,.62)";
      sText(ctx, `${d}배`, 14, y, { color: now ? "#fff" : S.dim, px: 12, align: "left", w: now ? 800 : 700 });
      sBox(ctx, 36, y - 3, cells(d) * 4, 6, 2, col);
      sText(ctx, `${cells(d)}칸`, 36 + cells(d) * 4 + 5, y, { color: col, px: 12.5, w: 800, align: "left" });
    });
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
    // 두 시선(지구에서 별을 지나 조금 더). 별을 지난 뒤로는 밤하늘 칸 아래까지 옅은 점선으로 늘인다(엇갈리는 모습).
    const ux = ORB / Math.hypot(ORB, d);
    const uy = d / Math.hypot(ORB, d);
    const ext = Math.max(0, Math.min(64, (sy - 64) / uy)); // 별에서 밤하늘 칸 아래(높이 64)까지, 길어도 64
    if (ext > 6) {
      ctx.save();
      const fade = (x0: number, y0: number, x1: number, y1: number, rgbs: string): void => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, `rgba(${rgbs},.7)`);
        g.addColorStop(1, `rgba(${rgbs},0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      };
      fade(cx + ux * 12, sy - uy * 12, cx + ux * ext, sy - uy * ext, "255,209,102");
      fade(cx - ux * 12, sy - uy * 12, cx - ux * ext, sy - uy * ext, "127,227,196");
      ctx.restore();
    }
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

  f.say("지구가 <b>처음 위치</b>와 <b>6개월 뒤 위치</b>에서 관측한 별 S의 모습이에요. 거리가 1배일 때는 밤하늘에서 12칸 옮겨 보여요.");
  api.setCTA("별을 멀리 보내 보세요", { enabled: false });
  f.slot.ask(
    "별 S가 지금보다 2배 더 멀어지면 밤하늘에서 옮겨 보이는 칸 수는 어떻게 될까요?",
    [{ t: "절반으로 줄어요" }, { t: "2배로 늘어요" }, { t: "그대로예요" }],
    () => undefined,
    { predict: true, onNext: startFar },
  );
  return () => {
    tm.clear();
    st.stop();
  };
};
