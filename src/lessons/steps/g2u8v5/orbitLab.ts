// [중2 Ⅷ v5] g2u8l1 orbitLab: 「지구가 돌면 별은 어디에 보일까요?」
// 책의 어디에서: 그림 '별의 연주 시차'(지구가 E1에 있을 때와 6개월 뒤 E2에 있을 때 가까운 별 S가 먼 배경의 다른 자리에 보인다).
// 한 통찰: 두 눈 대신 지구가 자리를 옮긴다. 지구가 태양 둘레를 돌면 가까운 별이 먼 배경 별 사이에서 옮겨 보이고, 6개월 뒤에 가장 많이 옮겨 보인다.
// 걸음: ① 지금 별의 자리를 적는다 ② 언제 가장 많이 옮겨 보일지 예측한다 ③ 지구를 3개월씩 옮기며 하늘에서 옮겨 간 칸을 적는다 ④ 판정(옮겨 보인 까닭).
// 학생이 정하는 것: 지구를 언제 자리까지 옮길지. 실패하는 길: 1년 뒤에 보면 지구가 제자리로 돌아와 별이 처음 자리에 보인다(0칸).
// 그림 둘을 잇는다: 아래는 위에서 내려다본 모습, 위는 지구에서 본 밤하늘. 지구에서 별 S를 지나는 시선을 곧게 늘인 끝이 밤하늘 칸에서 별이 보이는 자리다.
// 검산: 지구가 궤도의 왼쪽 끝(가로로 −60)에 있으면 시선은 별(높이 80)을 지나 밤하늘 줄(높이 160)에서 가로 +60에 닿는다. 오른쪽 끝이면 −60.
//       눈금 한 칸이 15라 처음 자리에서 3개월 뒤 4칸, 6개월 뒤 8칸, 9개월 뒤 4칸, 1년 뒤 0칸. 거리와 각도는 크게 과장했다(무대에 적는다).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { S, sCanvas, sDisk, sFrame, sGlow, sLine, sLog, sText, type LabStep } from "./kit";
import { skyMark, skyPanel, skyTicks, span } from "./parallaxKit";

const ROW = 36; // 밤하늘 칸에서 별이 놓이는 줄
const STAR_Y = 116;
const SUN_Y = 196;
const ORB = 60;
const RY = 13;
const TICK = 15;
const WHEN = ["지금", "3개월 뒤", "6개월 뒤", "9개월 뒤", "1년 뒤"];

/** 지구의 자리(궤도 위의 각 th)에서 본 별 S가 밤하늘 줄에 놓이는 가로 자리(가운데가 0). */
const skyX = (th: number): number => {
  const ex = Math.cos(th) * ORB;
  const ey = SUN_Y - Math.sin(th) * RY;
  return ex + ((0 - ex) * (ey - ROW)) / (ey - STAR_Y);
};
/** 처음 자리에서 옮겨 간 칸 수(3개월마다). */
const moved = (i: number): number => Math.round(Math.abs(skyX(Math.PI) - skyX(Math.PI + (i * Math.PI) / 2)) / TICK);

export const orbitLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let mi = 0; // 막대의 자리(3개월마다)
  let th = Math.PI; // 지구의 자리. π는 왼쪽 끝이고, 위에서 볼 때 시계 반대 방향으로 돈다
  let noted = false; // 처음 자리를 적었는가
  let finished = false;

  const bNow = bvBtn("main", "지금 별의 자리 적기");
  const log = sLog(["3개월 뒤", "6개월 뒤", "9개월 뒤", "1년 뒤"], 4);
  log.el.classList.add("stack");
  const range = bvRange({
    cls: "g2u8x-r",
    min: 0,
    max: 4,
    value: 0,
    label: "얼마 뒤에 볼까요",
    ticks: ["지금", "3개월", "6개월", "9개월", "1년"],
    onInput: (v) => {
      mi = v;
      if (v === 0) {
        f.say("지구가 처음 자리에 있어요. 막대를 밀어 지구를 옮겨 보세요.");
        return;
      }
      const n = moved(v);
      log.set(v - 1, `${n}칸`);
      if (v === 4) f.say("1년 뒤에는 지구가 <b>제자리</b>로 돌아와 별도 처음 자리에 보여요.");
      else if (v === 2) f.say("지구가 태양 <b>반대편</b>에 왔어요. 별이 처음 자리에서 <b>8칸</b> 옮겨 보여요.");
      else f.say(`${WHEN[v]}, 별 S가 처음 자리에서 <b>${n}칸</b> 옮겨 보여요.`);
      if (log.has(1) && log.has(3) && !finished) {
        finished = true;
        f.pips(2);
        tm.later(() => {
          range.input.disabled = true;
          askFinal();
        }, 1700);
      } else if (!finished && (log.has(1) || log.has(3))) {
        tm.later(() => !finished && f.say(log.has(1) ? "이번에는 <b>1년 뒤</b>까지 지구를 옮겨 보세요." : "이번에는 <b>6개월 뒤</b>로 지구를 옮겨 보세요."), 1900);
      }
    },
  });

  bNow.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    noted = true;
    bNow.disabled = true;
    f.say("밤하늘에 별 S의 <b>처음 자리</b>를 적었어요. 이제 예측해 보세요.");
    tm.later(askPredict, 900);
  });
  f.slot.setControls(bNow);

  function askPredict(): void {
    f.slot.ask(
      "별 S는 언제 가장 많이 옮겨 보일까요?",
      [{ t: "3개월 뒤" }, { t: "6개월 뒤" }, { t: "1년 뒤" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          f.pips(1);
          f.slot.setControls(range.el, log.el);
          f.say("예측 완료! 막대를 밀어 지구를 옮기고, 별이 <b>몇 칸</b> 옮겨 보이는지 보세요.");
        },
      },
    );
  }
  function askFinal(): void {
    f.say("기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "별 S가 밤하늘에서 옮겨 보인 까닭은?",
      [{ t: "지구가 자리를 옮겨서", ok: true }, { t: "별 S가 실제로 움직여서" }, { t: "배경 별이 움직여서" }],
      (ok) => api.recordQuiz(ok),
      { why: "별은 그대로 있고 <b>지구</b>가 태양 둘레를 돌았어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("관측 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("지구가 태양 둘레를 돌면 가까운 별이 먼 배경 별 사이에서 옮겨 보여요. <b>6개월 뒤</b> 태양 반대편에서 볼 때 가장 많이 옮겨 보이고, 1년 뒤에는 제자리예요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t, dt) => {
    const cx = w / 2;
    const goal = Math.PI + (mi * Math.PI) / 2;
    th += (goal - th) * Math.min(1, dt * 0.16);
    const ex = cx + Math.cos(th) * ORB;
    const ey = SUN_Y - Math.sin(th) * RY;
    const sx = cx + skyX(th);
    const first = cx + skyX(Math.PI);
    // 위: 지구에서 본 밤하늘
    skyPanel(ctx, 8, 6, w - 16, 60, "지구에서 본 밤하늘");
    skyTicks(ctx, cx, 66, TICK, 5);
    // 아래: 위에서 내려다본 모습(지구 궤도와 태양)
    ctx.save();
    ctx.strokeStyle = S.line;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.ellipse(cx, SUN_Y, ORB, RY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    sGlow(ctx, cx, SUN_Y, 14, S.sun, 0.45);
    sText(ctx, "태양", cx - 27, SUN_Y, { color: S.dim, px: 12 });
    sText(ctx, "위에서 내려다본 모습", 12, 80, { color: S.dim, px: 12, align: "left" });
    sText(ctx, "크게 과장한 그림", w - 10, 221, { color: S.dim, px: 12, align: "right" });
    // 처음 자리의 지구와 시선(적은 뒤에 남는다)
    if (noted) {
      const e1x = cx - ORB;
      if (Math.abs(th - Math.PI) > 0.05) {
        sLine(ctx, e1x, SUN_Y, first, ROW, "rgba(255,209,102,.4)", 1.4, [4, 5]);
        sDisk(ctx, e1x, SUN_Y, 6, "rgba(90,162,248,.3)", "rgba(255,255,255,.4)", 1);
      }
      skyMark(ctx, first, ROW, S.gold);
      sText(ctx, "처음", first, ROW + 17, { color: S.gold, px: 12 });
      const n = Math.abs(sx - first) / TICK;
      if (n > 0.3) {
        span(ctx, first, sx, ROW, "rgba(255,209,102,.75)", 1.8);
        sText(ctx, `처음 자리에서 ${Math.round(n)}칸`, w - 17, 18, { color: S.gold, px: 12.5, w: 800, align: "right" });
      }
    }
    // 지금의 시선: 지구에서 별 S를 지나 밤하늘까지
    sLine(ctx, ex, ey, sx, ROW, "rgba(143,180,255,.8)", 1.6, [5, 5]);
    // 별 S(실제 자리)와 밤하늘에 보이는 별 S
    sGlow(ctx, cx, STAR_Y, 10 + Math.sin(t / 400) * 1, S.star);
    sText(ctx, "별 S", cx + 24, STAR_Y + 2, { color: S.ink, px: 12.5 });
    sGlow(ctx, sx, ROW, 9, S.star);
    // 지구
    sDisk(ctx, ex, ey, 7, S.earth, "#fff", 1.5);
    sText(ctx, "지구", ex + (ex < cx - 4 ? -24 : 24), ey, { color: S.ink, px: 12 });
  });

  f.say("가까운 <b>별 S</b>를 봐요. 먼저 지금 별이 밤하늘의 어디에 보이는지 적어 두세요.");
  api.setCTA("지구를 옮기며 별을 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
