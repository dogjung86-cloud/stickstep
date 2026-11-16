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
import { mCoil, mCoilEnds, mCompass, mSlot } from "./magKit";
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
      f.say(`오른손의 <b>네 손가락</b>을 코일에 흐르는 전류 방향(앞쪽 도선에서 ${up ? "위" : "아래"}쪽)으로 감아 쥐어 보세요.`);
      f.slot.ask(
        `코일 앞쪽 도선에서 전류가 ${up ? "위" : "아래"}로 흐를 때, N극이 되는 곳은 어느 쪽 끝인가요?`,
        [{ t: up ? "왼쪽 끝" : "오른쪽 끝", ok: true }, { t: up ? "오른쪽 끝" : "왼쪽 끝" }, { t: "N극이 생기지 않아요" }],
        (ok) => picked(ok),
        { why: `오른손 네 손가락을 앞쪽에서 ${up ? "위" : "아래"}로 감아 쥐면 엄지손가락이 <b>${up ? "왼쪽" : "오른쪽"}</b>을 가리켜요.`, onNext: next },
      );
    } else {
      f.say("이번에는 반대로 찾아볼까요? 나침반 바늘을 보고 오른손 <b>엄지손가락</b>을 코일의 N극 쪽으로 먼저 향하게 해 보세요.");
      f.slot.ask(
        "나침반 바늘을 보니 코일의 오른쪽 끝이 N극이에요. 코일 앞쪽 도선에서 전류는 어느 방향으로 흐를까요?",
        [{ t: "아래쪽으로 흘러요", ok: true }, { t: "위쪽으로 흘러요" }, { t: "전류가 흐르지 않아요" }],
        (ok) => picked(ok),
        { why: "오른손 엄지손가락이 오른쪽(N극)을 향하도록 감아 쥐면, 네 손가락은 코일 앞쪽에서 <b>아래쪽</b>으로 감겨요.", onNext: next },
      );
    }
  }
  function picked(ok: boolean): void {
    if (r === 0) api.recordQuiz(ok);
    shown = true;
    showAt = now;
    const rd = ROUNDS[r];
    if (rd.hide === "compass") f.say(`나침반의 빨간 바늘(N극)이 <b>${rd.dir === 1 ? "오른쪽" : "왼쪽"}</b>을 가리켜요. 오른손 엄지손가락이 가리킨 방향과 일치하는지 확인해 보세요.`);
    else f.say("코일에 전류 화살표가 나타났어요! 오른손 네 손가락을 감아 쥔 방향과 일치하는지 확인해 보세요.");
  }
  function next(): void {
    r += 1;
    if (r < ROUNDS.length) ask();
    else {
      f.pips(3);
      f.say("오른손 네 손가락과 엄지손가락으로 코일의 전류 방향과 자기장(N극) 방향을 찾는 방법을 익혔어요!");
      f.slot.conclude("오른손의 <b>네 손가락</b>을 코일에 흐르는 전류의 방향으로 감아 쥐면, <b>엄지손가락</b>이 가리키는 쪽이 코일의 <b>N극</b>(자기장이 나오는 쪽)이 돼요. 전류의 방향이 반대가 되면 N극과 S극의 위치도 서로 바뀌어요.");
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
    // 전원 장치와 전선(코일의 두 끝, 왼쪽 아래와 오른쪽 아래에 잇는다)
    const ends = mCoilEnds(CX, CY);
    ctx.strokeStyle = "rgba(255,196,90,.75)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(ends.lx, ends.y);
    ctx.lineTo(ends.lx, 206);
    ctx.lineTo(ends.rx, 206);
    ctx.lineTo(ends.rx, ends.y);
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
      // 극 이름표는 코일 끝의 바깥 아래(코일 끝에서 내려가는 전선과 겹치지 않게)
      xText(ctx, "N극", CX + rd.dir * 78, CY + 36, { px: 12.5, color: "#FFB3A6" });
      xText(ctx, "S극", CX - rd.dir * 78, CY + 36, { px: 12.5, color: "#9CC8FF" });
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
