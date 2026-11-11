// [Ⅶ단원 도입] u7l5 u7-moonweek: 「일주일 뒤, 달은 어떤 모양일까요?」
// 형식: 내기를 걸고, 버튼을 꾹 눌러 날짜를 하루씩 넘기며 달을 본다. 끝에서 예측과 견준다.
// 사실: 오른쪽 반달(상현달)에서 약 일주일이 지나면 보름달이 된다. 그 사이 밝은 부분이 왼쪽으로 차오른다.
// 도입은 까닭을 말하지 않는다. "달이 정말 부풀어 오른 걸까"로 맺어 바로 뒤의 달 옮기기 랩으로 넘긴다.
// 정본 훅(moonpic)은 지난주 사진과 오늘의 달을 견준 뒤 까닭을 고르게 하고 답을 바로 알려 줬다. 그 답은 랩의 판정과 결론으로 옮겼다.
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { makeHold, verdict } from "./hold";

const PICKS = ["둥근 보름달", "가느다란 눈썹달", "지금과 같은 반달"];
const DAYS = 7;

export function moonWeek(c: OpenerCtx): void {
  c.stage.append(el("div", { class: "opn-layer", html: c.art.moonweekBase }));
  const moons = Array.from({ length: DAYS + 1 }, (_, k) => c.stage.querySelector<SVGElement>(`.opn-u7-mw-m.m${k}`));
  const dots = Array.from({ length: DAYS }, (_, i) => c.stage.querySelector<SVGElement>(`.opn-u7-mw-day.d${i + 1}`));
  let hit = true;
  let day = -1;
  const show = (d: number): void => {
    if (d === day) return;
    if (day >= 0) haptic(HAPTIC.tap);
    day = d;
    moons.forEach((m, k) => m?.classList.toggle("on", k === d));
    dots.forEach((x, i) => x?.classList.toggle("on", i < d));
    c.step.dataset.opnDay = String(d);
  };
  const hold = makeHold(c, {
    cls: "opn-u7-btn hold",
    label: "날짜 넘기기",
    sub: "꾹 누르고 있어요",
    aria: "꾹 눌러 날짜를 하루씩 넘기기",
    need: 2800,
    onProgress: (p) => show(Math.min(DAYS, Math.floor(p * DAYS + 0.0001))),
    onLetGo: () => c.say("아직 일주일이 안 됐어요. 끝까지 <b>꾹</b> 눌러 주세요."),
    onDone: () => {
      c.face("surprised");
      c.say(`${verdict(hit)} 일주일 만에 <b>둥근 달</b>이 됐어요. 달이 정말 부풀어 오른 걸까요? 직접 옮겨 봐요.`);
      c.finish();
    },
  });
  c.controls.style.gridTemplateColumns = "1fr";
  c.controls.append(hold.el);
  c.controls.hidden = true;
  c.step.dataset.opnPhase = "ask";
  show(0);
  c.ask("오늘 밤 달은 오른쪽 반만 밝은 반달이에요. 일주일 뒤에는 어떤 모양일까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! <b>날짜 넘기기</b>를 꾹 눌러 하루씩 넘겨 보세요.",
    onDone: (picked) => {
      hit = picked === PICKS[0];
      c.step.dataset.opnPhase = "play";
      c.controls.hidden = false;
      c.face("curious");
      hold.arm();
    },
  });
}
