// [중2 Ⅶ v5] g2u7l1 rubLab: 「문지르는 동안 무엇이 옮겨 갈까요?」
// 책의 어디에서: 본문과 그림 '물체가 대전되는 과정'(마찰할 때 털가죽에서 빨대로 전자가 이동하고, 마찰한 뒤 털가죽은 (+)전기, 빨대는 (−)전기를 띤다).
// 한 통찰: 문지를 때 옮겨 가는 것은 전자뿐이다. 전자를 잃은 쪽은 (+)전기, 얻은 쪽은 (−)전기를 띤다.
// 학생이 정하는 것: 몇 번 문지를지, 원자핵을 당겨 볼지, 언제 떼어 놓을지.
// 실패하는 길: 원자핵을 당겨도 옮겨 가지 않는다. 문지르지 않고 떼어 놓으면 두 물체는 그대로 중성이다.
// 옛 랩(rubLab)은 문지르는 끌기 하나로 끝까지 갔다. 여기서는 (+)와 (−)의 개수를 학생이 세어 가며 견준다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawElectron, drawPlus } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xBox, xCanvas, xFrame, xRow, xText, type LabStep } from "./kit";

interface E {
  x: number;
  y: number;
  tx: number;
  ty: number;
  side: 0 | 1; // 0 털가죽, 1 빨대
}
const PLUS = 6;
const MAX_MOVE = 4;

export const rubLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  // 판 위의 자리: 판마다 (+) 여섯(3×2)과 전자 자리 열(5×2)
  const slot = (side: 0 | 1, i: number): { x: number; y: number } => ({ x: (side ? 208 : 18) + 16 + (i % 5) * 22, y: 146 + Math.floor(i / 5) * 24 });
  const plusAt = (side: 0 | 1, i: number): { x: number; y: number } => ({ x: (side ? 208 : 18) + 30 + (i % 3) * 30, y: 80 + Math.floor(i / 3) * 28 });
  const es: E[] = [];
  for (const side of [0, 1] as const) for (let i = 0; i < PLUS; i++) es.push({ ...slot(side, i), tx: slot(side, i).x, ty: slot(side, i).y, side });
  let moved = 0;
  let together = 0; // 두 물체가 맞닿은 정도 0~1
  let togetherTo = 0;
  let shake = 0;
  let apart = false;
  let busy = false;
  let tried = false; // 원자핵을 당겨 봤다

  const rub = bvBtn("main", "털가죽으로 문지르기");
  const pull = bvBtn("", "원자핵 당겨 보기");
  const sep = bvBtn("", "떼어 놓고 살펴보기");
  f.slot.setControls(rub, xRow(pull, sep));
  const paint = (): void => {
    rub.disabled = busy || apart || moved >= MAX_MOVE;
    pull.disabled = busy || apart;
    sep.disabled = busy || apart;
    f.pips((moved > 0 ? 1 : 0) + (apart ? 1 : 0));
  };
  const count = (side: 0 | 1): number => es.filter((e) => e.side === side).length;
  const layout = (): void => {
    for (const side of [0, 1] as const)
      es.filter((e) => e.side === side).forEach((e, i) => {
        const p = slot(side, i);
        e.tx = p.x;
        e.ty = p.y;
      });
  };

  rub.addEventListener("click", () => {
    if (busy || apart || moved >= MAX_MOVE) return;
    haptic(HAPTIC.tap);
    busy = true;
    togetherTo = 1;
    paint();
    tm.later(() => {
      // 털가죽의 전자 하나가 빨대로 건너간다
      const e = es.filter((x) => x.side === 0).pop();
      if (e) e.side = 1;
      moved += 1;
      layout();
      haptic(HAPTIC.correct);
    }, 500);
    tm.later(() => {
      togetherTo = 0;
      busy = false;
      paint();
      f.say(moved >= MAX_MOVE ? `전자가 <b>${moved}개</b> 건너갔어요. 이제 떼어 놓고 두 물체의 (+)와 (−) 개수를 견줘 보세요.` : `전자 <b>1개</b>가 털가죽에서 빨대로 건너갔어요. 더 문지르거나, 떼어 놓고 살펴보세요.`);
    }, 1100);
  });
  pull.addEventListener("click", () => {
    if (busy || apart) return;
    haptic(HAPTIC.wrong);
    tried = true;
    shake = 1;
    f.say("원자핵은 <b>옮겨 가지 않아요</b>. 원자의 중심에 자리 잡고 있어서 문질러도 제자리예요.");
  });
  sep.addEventListener("click", () => {
    if (busy || apart) return;
    haptic(HAPTIC.tap);
    if (moved === 0) {
      f.say("문지르지 않아서 두 물체 모두 (+)와 (−)가 <b>6개씩 그대로</b>예요. 먼저 문질러 보세요.");
      return;
    }
    apart = true;
    paint();
    f.say(`털가죽은 전자가 <b>${count(0)}개</b>, 빨대는 <b>${count(1)}개</b>예요. 원자핵은 둘 다 6개 그대로고요.`);
    tm.later(ask1, 2200);
  });

  function ask1(): void {
    f.slot.ask(
      "문지르는 동안 한 물체에서 다른 물체로 옮겨 간 것은?",
      [{ t: "전자" }, { t: "원자핵" }, { t: "전자와 원자핵 모두" }].map((c, i) => ({ ...c, ok: i === 0 })),
      (ok) => api.recordQuiz(ok),
      { why: tried ? "원자핵은 당겨도 제자리였고, <b>전자</b>만 건너갔어요." : "(+)는 6개 그대로였고 <b>전자</b>의 수만 달라졌어요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.pips(3);
    f.slot.ask(
      "전자를 잃은 털가죽은 어떤 전기를 띠나요?",
      [{ t: "(+)전기", ok: true }, { t: "(−)전기" }, { t: "전기를 띠지 않아요" }],
      () => undefined,
      { why: `털가죽은 (+) 6개에 (−) ${count(0)}개라 <b>(+)가 더 많아요</b>.`, onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("서로 다른 물체를 문지르면 <b>전자</b>가 한쪽에서 다른 쪽으로 옮겨 가요. 전자를 잃은 물체는 <b>(+)전기</b>, 얻은 물체는 <b>(−)전기</b>를 띠어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t, dt) => {
    together += (togetherTo - together) * Math.min(1, dt * 0.09);
    if (shake > 0) shake = Math.max(0, shake - dt / 40);
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    const off = together * 26; // 맞닿으러 다가오는 거리
    const wob = together > 0.5 ? Math.sin(t / 45) * 5 : 0;
    // 두 판
    xBox(ctx, 18 + off, 52 + wob, 120, 146, 16, "rgba(185,133,84,.28)", "#B98554");
    xBox(ctx, 208 - off, 52, 120, 146, 16, "rgba(242,106,94,.2)", "#F26A5E");
    xText(ctx, "털가죽", 78 + off, 37 + wob, { px: 13.5, w: 800 });
    xText(ctx, "플라스틱 빨대", 268 - off, 37, { px: 13.5, w: 800 });
    for (const side of [0, 1] as const) {
      const dx = side ? -off : off;
      const dy = side ? 0 : wob;
      for (let i = 0; i < PLUS; i++) {
        const p = plusAt(side, i);
        drawPlus(ctx, p.x + dx + (shake > 0 ? Math.sin(t / 18 + i) * 3 * shake : 0), p.y + dy, 9);
      }
    }
    es.forEach((e) => {
      e.x += (e.tx - e.x) * Math.min(1, dt * 0.07);
      e.y += (e.ty - e.y) * Math.min(1, dt * 0.07);
      const dx = e.side ? -off : off;
      drawElectron(ctx, e.x + dx, e.y + (e.side ? 0 : wob), 8);
    });
    // 개수
    for (const side of [0, 1] as const) {
      const n = count(side);
      const cx = side ? 268 : 78;
      xText(ctx, `(+) ${PLUS}개 · (−) ${n}개`, cx, 213, { px: 12.5, color: n === PLUS ? X.dim : n < PLUS ? X.plus : X.minus, w: 800 });
    }
    if (apart) {
      xText(ctx, "(+)전기", 78, 17, { px: 14, color: X.plus, w: 800 });
      xText(ctx, "(−)전기", 268, 17, { px: 14, color: X.minus, w: 800 });
    } else if (moved > 0 && together < 0.1) {
      xText(ctx, `전자 ${moved}개 이동`, 173, 128, { px: 12.5, color: X.minus });
      xText(ctx, "→", 173, 146, { px: 16, color: X.minus });
    }
    ctx.restore();
  });

  paint();
  f.say("털가죽과 빨대를 크게 들여다봤어요. 붉은 알갱이는 <b>원자핵</b>(+), 파란 알갱이는 <b>전자</b>(−)예요. 문질러 보세요.");
  api.setCTA("문지르고 떼어 놓아 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
