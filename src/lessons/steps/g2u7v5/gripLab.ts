// [중2 Ⅶ v5] g2u7l7 gripLab: 「오른손으로 N극을 찾아요」
// 책의 어디에서: 본문(오른손의 네 손가락을 전류의 방향으로 감아쥘 때 엄지손가락이 가리키는 방향이 코일 내부에서의 자기장의 방향).
// 한 통찰: 전류의 방향을 알면 오른손으로 N극이 되는 끝을 찾을 수 있고, 거꾸로 N극을 알면 전류의 방향을 찾을 수 있다.
// 걸음: ① 앞쪽에서 전류가 위로 흐를 때 N극이 되는 끝을 맞힌다 → ② 전류를 뒤집은 코일에서 다시 맞힌다 → ③ 나침반이 알려 주는 N극에서 거꾸로 전류의 방향을 맞힌다.
//   답하면 그 자리에서 나침반 두 개와 코일 속 자기장 화살표가 나타나 맞는지 보여 준다(판정은 누른 보기에 새겨진다).
// 학생이 정하는 것: 자기 오른손을 화면 앞에 대고 감아 쥔 뒤 고르는 답.
// 실패하는 길: 왼손으로 쥐거나 손가락을 전류와 반대로 감으면 엄지가 반대쪽을 가리킨다(틀린 답을 고르면 나침반이 반대를 가리키는 것을 본다).
// 방향의 약속은 magKit.ts와 같다: 앞쪽 전류가 위(dir = -1)이면 코일 속 자기장은 왼쪽이고 왼쪽 끝이 N극.

import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { mCoil, mCompass, mSlot } from "./magKit";
import { X, xArrow, xCanvas, xFrame, xText, type LabStep } from "./kit";

const CX = 173;
const CY = 112;
interface Round {
  dir: 1 | -1; // 1이면 코일 속 자기장이 오른쪽(오른쪽 끝이 N극)
  hide: "compass" | "current"; // 답하기 전에 가려 두는 것
}
const ROUNDS: Round[] = [
  { dir: -1, hide: "compass" },
  { dir: 1, hide: "compass" },
  { dir: 1, hide: "current" },
];

export const gripLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 3, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let r = 0;
  let shown = false; // 답한 뒤 가려 둔 것을 보여 주는 중
  let showAt = 0;
  let now = 0;

  function ask(): void {
    const rd = ROUNDS[r];
    shown = false;
    f.pips(r);
    if (rd.hide === "compass") {
      const up = rd.dir === -1;
      f.say(`오른손 <b>네 손가락</b>을 노란 화살표 방향(앞쪽에서 ${up ? "위" : "아래"}로)으로 감아 쥐어 보세요.`);
      f.slot.ask(
        `코일의 앞쪽에서 전류가 ${up ? "위" : "아래"}로 흘러요. N극이 되는 끝은?`,
        [{ t: up ? "왼쪽 끝" : "오른쪽 끝", ok: true }, { t: up ? "오른쪽 끝" : "왼쪽 끝" }, { t: "N극은 생기지 않아요" }],
        (ok) => picked(ok),
        { why: `네 손가락을 ${up ? "위" : "아래"}로 감아 쥐면 엄지가 <b>${up ? "왼쪽" : "오른쪽"}</b>을 가리켜요.`, onNext: next },
      );
    } else {
      f.say("이번에는 거꾸로예요. 나침반을 보고 <b>엄지</b>부터 N극 쪽으로 향하게 해 보세요.");
      f.slot.ask(
        "나침반을 보니 오른쪽 끝이 N극이에요. 코일의 앞쪽에서 전류는?",
        [{ t: "아래로 흘러요", ok: true }, { t: "위로 흘러요" }, { t: "흐르지 않아요" }],
        (ok) => picked(ok),
        { why: "엄지를 오른쪽에 두고 쥐면 네 손가락이 앞쪽에서 <b>아래로</b> 감겨요.", onNext: next },
      );
    }
  }
  function picked(ok: boolean): void {
    if (r === 0) api.recordQuiz(ok);
    shown = true;
    showAt = now;
    const rd = ROUNDS[r];
    if (rd.hide === "compass") f.say(`나침반의 N극이 <b>${rd.dir === 1 ? "오른쪽" : "왼쪽"}</b>을 가리켜요. 엄지가 가리킨 쪽이 맞았는지 견줘 보세요.`);
    else f.say("전류 화살표가 나타났어요. 네 손가락이 감긴 방향과 같은지 견줘 보세요.");
  }
  function next(): void {
    r += 1;
    if (r < ROUNDS.length) ask();
    else {
      f.pips(3);
      f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
      f.slot.conclude("오른손 <b>네 손가락</b>을 전류의 방향으로 감아 쥐면 <b>엄지</b>가 가리키는 끝이 N극이에요. 전류의 방향이 바뀌면 N극도 반대쪽 끝으로 옮겨 가요.");
      api.enableCTA(s.cta ?? "다음");
    }
  }

  st.run((ctx, w, _h, t) => {
    now = t;
    const k = w / 346;
    const rd = ROUNDS[Math.min(r, ROUNDS.length - 1)];
    const end = r >= ROUNDS.length;
    const a = end ? 1 : shown ? Math.min(1, (t - showAt) / 500) : 0; // 드러나는 정도
    const showCur = rd.hide !== "current" || shown || end;
    const showCmp = rd.hide !== "compass" || shown || end;
    ctx.save();
    ctx.scale(k, k);
    // 전원 장치와 전선
    ctx.strokeStyle = "rgba(255,196,90,.75)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(CX - 53, CY);
    ctx.lineTo(CX - 53, 206);
    ctx.lineTo(CX + 53, 206);
    ctx.lineTo(CX + 53, CY);
    ctx.stroke();
    ctx.fillStyle = "rgba(11,21,36,.9)";
    ctx.strokeStyle = X.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(CX - 40, 193, 80, 26, 8);
    ctx.fill();
    ctx.stroke();
    xText(ctx, "전원 장치", CX, 206.5, { px: 12, color: X.dim });
    mCoil(ctx, CX, CY, { cur: showCur, dir: rd.dir });
    if (!showCur) xText(ctx, "전류의 방향은?", CX, CY - 36, { px: 12.5, color: X.cur });
    else xText(ctx, `앞쪽에서 ${rd.dir === 1 ? "아래" : "위"}로`, CX, CY - 36, { px: 12.5, color: X.cur });
    // 나침반 두 개(코일의 양 끝). 코일 끝에서는 바늘이 코일 속 자기장과 같은 쪽을 가리킨다
    const ang = rd.dir === 1 ? 0 : Math.PI;
    for (const x of [62, 284]) {
      if (showCmp) {
        ctx.globalAlpha = rd.hide === "compass" ? a : 1;
        mCompass(ctx, x, CY, ang, 19);
        ctx.globalAlpha = 1;
      } else mSlot(ctx, x, CY, "?", 19);
    }
    if ((shown || end) && a > 0) {
      ctx.globalAlpha = a;
      xArrow(ctx, CX - rd.dir * 36, CY, CX + rd.dir * 36, CY, X.field, 2.8, 9);
      xText(ctx, "N극", CX + rd.dir * 56, CY + 36, { px: 12.5, color: "#FFB3A6" });
      xText(ctx, "S극", CX - rd.dir * 56, CY + 36, { px: 12.5, color: "#9CC8FF" });
      xText(ctx, "엄지 방향", CX, CY + 36, { px: 12, color: X.field });
      ctx.globalAlpha = 1;
    }
    xText(ctx, "빨간 끝이 N극", 62, 30, { px: 12, color: X.dim, align: "left" });
    ctx.restore();
  });

  api.setCTA("오른손으로 감아 쥐고 답해 보세요", { enabled: false });
  ask();
  return () => {
    tm.clear();
    st.stop();
  };
};
