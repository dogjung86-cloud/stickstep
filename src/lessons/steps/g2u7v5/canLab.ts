// [중2 Ⅶ v5] g2u7l2 canLab: 「닿지도 않았는데 깡통은 왜 굴러올까요?」
// 책의 어디에서: 해 보기 '금속 물체가 전기를 띠는 현상 관찰하기'(눕힌 알루미늄 깡통에 털가죽으로 문지른 플라스틱 막대를 닿지 않게 가까이 가져간다)와
//   그림 '금속 물체에서의 정전기 유도'(가져가기 전과 후의 전자 분포).
// 한 통찰: 대전체를 가까이 하면 깡통 속 전자가 먼 쪽으로 몰려, 가까운 쪽은 (+), 먼 쪽은 (−)전기를 띤다. 전자의 수는 그대로다.
// 학생이 정하는 것: 막대를 문지를지, 어느 쪽에서 가져갈지, 얼마나 가까이 가져갈지.
// 실패하는 길: 문지르지 않은 막대는 아무 일도 일으키지 않는다. 막대가 깡통에 닿으면 전자가 건너가 깡통이 밀려난다(다시 해야 한다).
// 옛 랩(inductionLab)은 막대를 끌어 한 번 보여 주고 끝났다. 여기서는 거리 막대를 밀며 전자가 몰리는 것을 그 자리에서 본다. 깡통은 둥근 바닥 쪽에서 본 모습이다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawElectron } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvRange, bvTimers } from "../bio6/b6Lab";
import { X, clamp, xCanvas, xFrame, xPill, xSegs, xSign, xText, type LabStep } from "./kit";

// 그림(2026-11-15 그래픽 감사 C092): 깡통을 지름 132로 키워 무대 위쪽 빈자리를 쓰고, (+)와 전자를 겹치지 않는 고른 바둑판(간격 14)에 번갈아 둔다.
//   막대를 가까이 하면 전자 16개가 먼 쪽 안쪽 테두리(반지름 56, 깡통 테두리보다 안쪽)를 따라 겹치지 않게 줄을 선다. 깡통 밖으로 나가지 않는다.
//   무대 오른쪽 위에 '전자 16개, 원자핵 16개'를 늘 써서 막대를 움직여도 개수가 그대로임을 보인다(둘째 판정의 답). 막대가 닿으면 전자 3개가 건너와 19개가 된다.
const R = 66; // 깡통 반지름
const ROW = 56; // 몰린 전자가 서는 안쪽 테두리의 반지름
const N_E = 16;
const PLUS: [number, number][] = [];
const HOME: [number, number][] = [];
{
  // 칸의 가운데(±7, ±21, ±35)에서 반지름 41 안의 32자리. 90도씩 돌려도 같은 꼴이고, 바둑판처럼 칠하면 16과 16으로 나뉜다
  const d = 14;
  for (let i = -3; i < 3; i++)
    for (let j = -3; j < 3; j++) {
      const x = (i + 0.5) * d;
      const y = (j + 0.5) * d;
      if (Math.hypot(x, y) > 41) continue;
      ((i + j) % 2 === 0 ? PLUS : HOME).push([x, y]);
    }
  HOME.sort((a, b) => a[1] - b[1] || a[0] - b[0]); // 위에서 아래 차례(먼 쪽 줄의 자리와 차례대로 짝짓는다)
}
/** 먼 쪽 안쪽 테두리를 따라 선 자리(away = 먼 쪽 x 방향). 위에서 아래 차례. */
const farRow = (away: number): [number, number][] =>
  Array.from({ length: N_E }, (_, i) => {
    const a = ((-95 + (190 * i) / (N_E - 1)) * Math.PI) / 180;
    return [away * Math.cos(a) * ROW, Math.sin(a) * ROW] as [number, number];
  });

export const canLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let charged = false;
  let side: -1 | 1 = -1; // 막대가 있는 쪽(-1 왼쪽)
  let closeness = 0; // 0 멀리, 1 닿음
  let shift = 0; // 전자가 몰린 정도(부드럽게 따라간다)
  let canX = 0; // 깡통이 굴러간 거리
  let roll = 0;
  let touched = false;
  let finished = false;
  const seen = { plain: false, near: false, other: false };

  const rod = xSegs(
    [
      { k: "plain", t: "문지르지 않은 막대" },
      { k: "neg", t: "문지른 막대 (−)" },
    ],
    "plain",
    (k) => {
      charged = k === "neg";
      reset(false);
      f.say(charged ? "털가죽으로 문질러 <b>(−)전기</b>를 띤 막대예요. 닿지 않게 가까이 가져가 보세요." : "문지르지 않은 막대예요. 가까이 가져가면 어떻게 될까요?");
    },
  );
  const where = xSegs(
    [
      { k: "L", t: "왼쪽에서" },
      { k: "R", t: "오른쪽에서" },
    ],
    "L",
    (k) => {
      side = k === "L" ? -1 : 1;
      reset(false);
    },
  );
  const dist = bvRange({
    cls: "g2u7x-r",
    min: 0,
    max: 100,
    value: 0,
    label: "막대를 깡통에 가까이",
    ticks: ["멀리", "가까이", "닿음"],
    onInput: (v) => {
      if (touched || finished) return;
      closeness = v / 100;
      if (v >= 98) touch();
      else check();
    },
  });
  f.slot.setControls(rod.el, where.el, dist.el);

  function reset(keepSay: boolean): void {
    closeness = 0;
    canX = 0;
    touched = false;
    dist.set(0);
    dist.input.disabled = false;
    if (!keepSay) f.pips(done());
  }
  const done = (): number => (seen.plain ? 1 : 0) + (seen.near ? 1 : 0) + (seen.other ? 1 : 0);
  function touch(): void {
    touched = true;
    dist.input.disabled = true;
    haptic(HAPTIC.wrong);
    f.say(charged ? "막대가 <b>닿았어요</b>. 전자가 깡통으로 건너가 깡통이 밀려나요. 닿지 않게 다시 해 봐요." : "막대가 닿았어요. 닿지 않게 다시 가져가 보세요.");
    tm.later(() => {
      reset(true);
      f.say("처음 자리로 돌려놓았어요. 이번에는 <b>닿지 않게</b> 가까이 가져가 보세요.");
    }, 2600);
  }
  const sides = new Set<number>();
  function check(): void {
    if (closeness < 0.62) return;
    const before = done();
    if (!charged) {
      if (!seen.plain) f.say("전자가 <b>고르게 퍼진 그대로</b>예요. 깡통도 움직이지 않아요. 문지른 막대로도 해 봐요.");
      seen.plain = true;
    } else if (!sides.has(side)) {
      sides.add(side);
      haptic(HAPTIC.correct);
      if (sides.size === 1) {
        seen.near = true;
        f.say("전자가 막대에서 <b>먼 쪽</b>으로 몰리고 깡통이 굴러와요. 반대쪽에서도 해 봐요.");
      } else {
        seen.other = true;
        f.say("이번에도 전자는 <b>먼 쪽</b>으로 몰리고, 깡통은 막대 쪽으로 굴러와요.");
      }
    }
    if (done() !== before) f.pips(done());
    if (done() === 3 && !finished) {
      finished = true;
      rod.lock(true);
      where.lock(true);
      dist.input.disabled = true;
      tm.later(ask1, 2400);
    } else if (seen.near && seen.other && !seen.plain) f.say("<b>문지르지 않은 막대</b>도 가까이 가져가서 비교해 보세요.");
  }

  function ask1(): void {
    f.slot.ask(
      "(−)전기를 띤 막대와 가까운 쪽 깡통이 띠는 전기는?",
      [{ t: "(+)전기", ok: true }, { t: "(−)전기" }, { t: "전기를 띠지 않아요" }],
      (ok) => api.recordQuiz(ok),
      { why: "전자가 먼 쪽으로 밀려나 가까운 쪽에는 <b>(+)</b>가 남았어요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "막대를 가까이 하는 동안 깡통 속 전자의 전체 개수는?",
      [{ t: "그대로예요", ok: true }, { t: "늘어났어요" }, { t: "줄어들었어요" }],
      () => undefined,
      { why: "닿지 않았으니 전자는 <b>깡통 안에서 자리만</b> 옮겼어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("(−)전기를 띤 막대를 가까이 하면 깡통의 전자가 <b>먼 쪽으로</b> 밀려나요. 가까운 쪽은 (+), 먼 쪽은 (−)전기를 띠어 깡통이 막대 쪽으로 끌려와요.");
    api.enableCTA(s.cta ?? "다음");
  }

  let gone = 0; // 닿았을 때 건너온 전자가 들어온 정도(0~1)
  st.run((ctx, w, h, _t, dt) => {
    const floor = h - 28;
    const eff = charged ? clamp((closeness - 0.15) / 0.75, 0, 1) : 0;
    shift += (eff - shift) * Math.min(1, dt * 0.12);
    gone += ((touched && charged ? 1 : 0) - gone) * Math.min(1, dt * 0.1);
    // 굴러오기: 충분히 가까우면 막대 쪽으로(닿았으면 반대로)
    const pull = touched && charged ? -1 : charged && closeness > 0.6 ? 1 : 0;
    const goal = pull * side * 20;
    const prev = canX;
    canX += (goal - canX) * Math.min(1, dt * 0.03);
    roll += (canX - prev) / R;
    const cx = w / 2 + canX;
    const cy = floor - R;
    // 책상
    ctx.strokeStyle = X.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, floor);
    ctx.lineTo(w, floor);
    ctx.stroke();
    xText(ctx, "책상", 24, floor + 14, { color: X.dim, px: 12 });
    // 깡통(둥근 바닥 쪽에서 본 모습)
    const g = ctx.createRadialGradient(cx - 20, cy - 22, 6, cx, cy, R);
    g.addColorStop(0, "#F2F5FA");
    g.addColorStop(0.72, "#B9C4D4");
    g.addColorStop(1, "#7F8CA3");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5C6A82";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(roll);
    ctx.strokeStyle = "rgba(92,106,130,.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, R - 3, 0, Math.PI * 2);
    ctx.stroke();
    // 돌아가는 것이 보이게 테두리에 작은 이음매 하나
    ctx.beginPath();
    ctx.moveTo(R - 7, 0);
    ctx.lineTo(R - 1, 0);
    ctx.stroke();
    ctx.restore();
    // (+): 제자리(원자핵은 움직이지 않는다)
    PLUS.forEach(([x, y]) => xSign(ctx, cx + x, cy + y, true, 5.5, 0.92));
    // 전자: 막대에서 먼 쪽의 안쪽 테두리로 줄을 선다(깡통 안에서 자리만 옮긴다)
    const far = farRow(-side);
    const e = shift * shift * (3 - 2 * shift);
    HOME.forEach(([x, y], i) => {
      const [fx, fy] = far[i];
      drawElectron(ctx, cx + x + (fx - x) * e, cy + y + (fy - y) * e, 5.5);
    });
    // 닿았을 때: 막대의 전자 셋이 건너와 가까운 쪽 테두리 안에 선다
    if (gone > 0.02) {
      [-14, 0, 14].forEach((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const tx = cx + side * Math.cos(a) * ROW;
        const ty = cy + Math.sin(a) * ROW;
        const sx = cx + side * (R + 22 + i * 14);
        ctx.save();
        ctx.globalAlpha = Math.min(1, gone * 1.4);
        drawElectron(ctx, sx + (tx - sx) * gone, cy + (ty - cy) * gone, 5.5);
        ctx.restore();
      });
    }
    // 막대
    const tip = cx + side * (R + 1 + (1 - closeness) * 35); // 닿음(1)이면 깡통 테두리에 붙는다
    const rl = 70;
    const rx = side < 0 ? tip - rl : tip;
    ctx.fillStyle = charged ? "#3D8FE8" : "#9AA7BD";
    ctx.strokeStyle = charged ? "#1F5FB0" : "#66738A";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, cy - 8, rl, 16, 8);
    ctx.fill();
    ctx.stroke();
    const signs = !charged ? 0 : touched ? 1 : 4;
    for (let i = 0; i < signs; i++) xSign(ctx, side < 0 ? rx + 12 + i * 15 : rx + rl - 12 - i * 15, cy, false, 5.5);
    xText(ctx, "막대", rx + rl / 2, cy - 21, { px: 12, color: X.dim });
    // 띠는 전기
    if (touched && charged) xText(ctx, "전자가 건너와 (−)전기", cx, cy - R - 12, { px: 13, color: X.minus, w: 800 });
    else if (shift > 0.45) {
      xText(ctx, "(+)전기", cx + side * (R - 10), cy - R - 12, { px: 13, color: X.plus, w: 800 });
      xText(ctx, "(−)전기", cx - side * (R - 10), cy - R - 12, { px: 13, color: X.minus, w: 800 });
    }
    // 개수: 막대를 가까이 해도 그대로, 닿으면 건너온 만큼 늘어난다
    const ne = N_E + (touched && charged ? 3 : 0);
    const lx = w - 96;
    drawElectron(ctx, lx, 22, 5.5);
    xText(ctx, `전자 ${ne}개`, lx + 11, 22, { px: 12.5, align: "left", color: ne > N_E ? X.minus : X.ink, w: 800 });
    xSign(ctx, lx, 41, true, 5.5);
    xText(ctx, `원자핵 ${PLUS.length}개`, lx + 11, 41, { px: 12.5, align: "left", color: X.ink, w: 800 });
    xPill(ctx, touched ? "막대가 닿았어요" : shift > 0.45 ? "전자가 먼 쪽으로 몰림" : "전자가 고르게 퍼져 있음", touched ? X.plus : X.minus);
  });

  f.say("깡통 속 붉은 점은 원자핵(+), 파란 알갱이는 전자(−)예요. 막대를 골라 <b>가까이</b> 가져가 보세요.");
  api.setCTA("막대를 깡통에 가져가 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
