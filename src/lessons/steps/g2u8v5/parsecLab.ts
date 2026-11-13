// [중2 Ⅷ v5] g2u8l1 parsecLab: 「연주 시차로 거리를 알 수 있을까요?」
// 책의 어디에서: 연주 시차와 거리(연주 시차가 1″인 별까지의 거리가 1 pc, 멀수록 작다. 아주 먼 별은 연주 시차가 너무 작아 재기 어렵다).
// 한 통찰: 연주 시차를 재면 별까지의 거리를 안다(1″이면 1 pc, 0.5″이면 2 pc, 0.1″이면 10 pc). 그러나 아주 먼 별은 너무 작아 재기 어렵다.
// 걸음: ① 1 pc, 2 pc의 별을 재 본다(1.00″, 0.50″) ② 연주 시차가 0.10″인 별을 찾는다(10 pc) ③ 판정(0.5″와 0.1″ 가운데 더 먼 별)
//       ④ 1000 pc의 별을 재 본다(두 자리가 겹쳐 재지 못한다) ⑤ 판정(이 방법의 한계).
// 학생이 정하는 것: 별까지의 거리, 언제 잴지. 실패하는 길: 1000 pc의 별은 두 자리가 겹쳐 보여 재지 못한다.
// 검산: 연주 시차(″) = 1 ÷ 거리(pc). 6개월 사이의 시차는 그 2배. 위 사진의 두 자리 사이는 140 ÷ 거리(px)로 시차에 비례한다(1000 pc은 0.14라 겹친다).
//       아래 그림은 지구 궤도의 반지름 14, 1 pc = 25로 그려 시선의 기울기도 거리에 반비례한다(1000 pc은 그림 밖이라 끊어 그렸다). 각도는 크게 과장했다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { S, sCanvas, sDisk, sFrame, sGlow, sLine, sLog, sText, type LabStep } from "./kit";
import { skyPanel, skyStar, span } from "./parallaxKit";

const PC = [1, 2, 4, 10, 1000];
const ROW = 66; // 사진에서 별이 놓이는 줄
const GAP1 = 140; // 1 pc일 때 사진에서 두 자리 사이(px)
const AX = 46; // 태양의 가로 자리
const AY = 166;
const ORB = 14;
const U = 25; // 1 pc
const sec = (p: number): string => (p >= 0.01 ? `${p.toFixed(2)}″` : `${p}″`);
const LOGI: Record<number, number> = { 1: 0, 2: 1, 10: 2, 1000: 3 };

export const parsecLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let di = 0;
  let dShow = 1;
  let measured = false; // 지금 거리에서 쟀는가
  let mT = 0; // 재는 금이 그려진 정도
  let gShow = GAP1; // 사진에서 두 자리 사이(부드럽게 따라간다)
  let stage: "first" | "hunt" | "far" | "end" = "first";
  let asking = false;

  const log = sLog(["1 pc", "2 pc", "10 pc", "1000 pc"], 4);
  log.el.classList.add("stack");
  const bMeasure = bvBtn("main", "연주 시차 재기");
  const range = bvRange({
    cls: "g2u8x-r",
    min: 0,
    max: 4,
    value: 0,
    label: "별까지의 거리",
    ticks: ["1 pc", "2 pc", "4 pc", "10 pc", "1000 pc"],
    onInput: (v) => {
      di = v;
      measured = false;
      bMeasure.disabled = false;
      f.say(`별을 <b>${PC[v]} pc</b> 거리에 놓았어요. <b>연주 시차 재기</b>를 눌러 보세요.`);
    },
  });
  const lock = (v: boolean): void => {
    range.input.disabled = v;
    bMeasure.disabled = v || measured;
  };

  bMeasure.addEventListener("click", () => {
    if (asking) return;
    haptic(HAPTIC.tap);
    measured = true;
    bMeasure.disabled = true;
    const d = PC[di];
    const p = 1 / d;
    if (d === 1000) {
      log.set(3, "못 잼", true);
      f.say("연주 시차가 0.001″예요. 두 자리가 <b>겹쳐 보여</b> 이 사진으로는 잴 수 없어요.");
    } else {
      if (d in LOGI) log.set(LOGI[d], sec(p));
      f.say(`6개월 사이의 시차는 ${sec(2 * p)}, 그 절반인 연주 시차는 <b>${sec(p)}</b>예요.`);
    }
    tm.later(advance, 1700);
  });

  /** 잰 기록에 따라 다음 할 일을 정한다. */
  function advance(): void {
    if (asking || stage === "end") return;
    if (stage === "first") {
      if (log.has(0) && log.has(1)) {
        stage = "hunt";
        f.pips(1);
        f.say("거리가 2배가 되자 연주 시차가 절반이 됐어요. 이번에는 <b>0.10″</b>인 별을 찾아 재 보세요.");
      } else if (measured && PC[di] !== 2) f.say(log.has(0) ? "이번에는 별을 <b>2 pc</b>으로 보내고 다시 재 보세요." : "별을 <b>1 pc</b>에 놓고 재 보세요.");
      if (stage === "first") return;
    }
    if (stage === "hunt") {
      if (log.has(2)) {
        asking = true;
        lock(true);
        askFar();
      } else if (measured && PC[di] === 4) f.say("4 pc은 0.25″예요. 0.10″가 되려면 별을 <b>더 멀리</b> 보내야 해요.");
      return;
    }
    if (stage === "far" && measured && PC[di] === 1000) {
      asking = true;
      lock(true);
      askLimit();
    }
  }
  function askFar(): void {
    f.say("기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "연주 시차가 0.5″인 별과 0.1″인 별 가운데 더 먼 별은?",
      [{ t: "0.1″인 별", ok: true }, { t: "0.5″인 별" }, { t: "두 별의 거리는 같아요" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "0.5″는 <b>2 pc</b>, 0.1″는 <b>10 pc</b>이었어요.",
        onNext: () => {
          asking = false;
          stage = "far";
          f.pips(2);
          f.slot.showControls();
          api.setCTA("1000 pc의 별을 재 보세요", { enabled: false });
          lock(false);
          bMeasure.disabled = measured;
          f.say("마지막으로 막대를 끝까지 밀어 <b>1000 pc</b>의 별을 재 보세요.");
          tm.later(advance, 700);
        },
      },
    );
  }
  function askLimit(): void {
    f.say("마지막 질문이에요.");
    f.slot.ask(
      "아주 먼 별의 거리를 이 방법으로 알기 어려운 까닭은?",
      [{ t: "연주 시차가 너무 작아서", ok: true }, { t: "별이 너무 어두워서" }, { t: "지구가 공전하지 않아서" }],
      (ok) => api.recordQuiz(ok),
      { why: "두 자리가 겹쳐 보일 만큼 <b>조금만</b> 옮겨 갔어요.", onNext: finish },
    );
  }
  function finish(): void {
    stage = "end";
    f.pips(3);
    f.say("관측 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("연주 시차가 1″인 별까지의 거리가 <b>1 pc</b>이에요. 연주 시차가 <b>작을수록 먼 별</b>이고, 아주 먼 별은 연주 시차가 너무 작아 이 방법으로 거리를 알기 어려워요.");
    api.enableCTA(s.cta ?? "다음");
  }

  f.slot.setControls(range.el, bMeasure, log.el);

  st.run((ctx, w, _h, t, dt) => {
    const cx = w / 2;
    const d = PC[di];
    dShow += (Math.min(d, 13) - dShow) * Math.min(1, dt * 0.17);
    gShow += (GAP1 / d - gShow) * Math.min(1, dt * 0.17);
    const gap = gShow;
    mT += ((measured ? 1 : 0) - mT) * Math.min(1, dt * 0.1);
    // 위: 6개월 간격으로 찍은 두 사진을 겹친 모습
    skyPanel(ctx, 8, 6, w - 16, 92, "두 사진을 겹쳐 크게 본 모습", 11);
    skyStar(ctx, cx + gap / 2, ROW, S.gold);
    skyStar(ctx, cx - gap / 2, ROW, S.ok);
    sText(ctx, "처음", cx + gap / 2 + 15, ROW, { color: S.gold, px: 12, align: "left" });
    sText(ctx, "6개월 뒤", cx - gap / 2 - 15, ROW, { color: S.ok, px: 12, align: "right" });
    if (mT > 0.03) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, mT * 1.2);
      if (d === 1000) sText(ctx, "이 사진으로는 잴 수 없어요", w - 17, 20, { color: "#FF9AA5", px: 12.5, w: 800, align: "right" });
      else {
        span(ctx, cx - gap / 2, cx - gap / 2 + gap * mT, ROW + 17, "rgba(255,255,255,.75)", 1.8);
        if (gap < 24) sLine(ctx, cx, ROW - 16, cx + (gap / 2) * mT, ROW - 16, S.gold, 4);
        else span(ctx, cx, cx + (gap / 2) * mT, ROW - 16, S.gold, 2.2);
        sText(ctx, `시차 ${sec(2 / d)}`, w - 17, 20, { color: "#fff", px: 12.5, w: 800, align: "right" });
        sText(ctx, `연주 시차 ${sec(1 / d)}`, w - 17, 37, { color: S.gold, px: 13, w: 800, align: "right" });
      }
      ctx.restore();
    }
    // 아래: 옆에서 본 그림(태양과 지구 궤도, 별, 두 시선)
    const far = dShow > 11;
    const sx = far ? w - 22 : AX + U * dShow;
    sText(ctx, "태양", AX - 27, AY, { color: S.dim, px: 12 });
    sText(ctx, "지구", AX - 27, AY - ORB - 8, { color: S.dim, px: 12 });
    sText(ctx, "각도는 크게 과장한 그림", w - 10, 112, { color: S.dim, px: 12, align: "right" });
    ctx.save();
    ctx.strokeStyle = S.line;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.ellipse(AX, AY, 5, ORB, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    const brk = w - 44; // 1000 pc일 때 그림을 끊는 자리
    const lineTo = (ey: number, color: string): void => {
      if (!far) return sLine(ctx, AX, ey, sx, AY, color, 1.6);
      const yb = ey + ((AY - ey) * (brk - AX)) / (brk + 600 - AX);
      sLine(ctx, AX, ey, brk - 4, yb, color, 1.6);
      sLine(ctx, brk + 6, AY + (ey - AY) * 0.06, sx, AY, color, 1.6);
    };
    lineTo(AY - ORB, "rgba(255,209,102,.85)");
    lineTo(AY + ORB, "rgba(127,227,196,.85)");
    if (far) {
      sLine(ctx, brk - 3, AY - 22, brk - 7, AY + 22, S.ink, 1.6);
      sLine(ctx, brk + 7, AY - 22, brk + 3, AY + 22, S.ink, 1.6);
    }
    sGlow(ctx, AX, AY, 9, S.sun, 0.45);
    sDisk(ctx, AX, AY - ORB, 5, S.earth, S.gold, 1.6);
    sDisk(ctx, AX, AY + ORB, 5, S.earth, S.ok, 1.6);
    sGlow(ctx, sx, AY, 9 + Math.sin(t / 400) * 1, S.star);
    sText(ctx, "별", sx, AY - 18, { color: S.ink, px: 12.5 });
    // 거리 자
    sLine(ctx, AX, 203, far ? brk - 6 : sx, 203, S.sky, 1.6);
    sLine(ctx, AX, 198, AX, 208, S.sky, 1.6);
    if (far) sLine(ctx, brk + 6, 203, sx, 203, S.sky, 1.6);
    sLine(ctx, sx, 198, sx, 208, S.sky, 1.6);
    sText(ctx, `거리 ${d} pc`, Math.min(w - 44, Math.max(AX + 30, (AX + sx) / 2)), 218, { color: "#fff", px: 13, w: 800 });
  });

  f.say("거리가 <b>1 pc</b>인 별을 6개월 간격으로 찍었어요. <b>연주 시차 재기</b>를 눌러 보세요.");
  api.setCTA("별의 연주 시차를 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
