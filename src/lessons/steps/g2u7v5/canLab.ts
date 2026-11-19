// [중2 Ⅶ v5] g2u7l2 canLab: 「닿지도 않았는데 깡통은 왜 굴러올까요?」
// 책의 어디에서: 해 보기 '금속 물체가 전기를 띠는 현상 관찰하기' 및 정전기 유도 개념((−) 막대뿐 아니라 (+) 유리 막대 접근 시에도 가까운 쪽 인력 > 먼 쪽 척력으로 끌려옴).
// 한 통찰: (−) 막대를 가까이 하면 전자가 먼 쪽으로 밀려나고, (+) 막대를 가까이 하면 전자가 가까운 쪽으로 끌려온다. 어느 쪽이든 가까운 쪽에 반대 전기가 유도되고 가까운 쪽의 인력이 먼 쪽의 척력보다 커서 깡통이 끌려온다. 전자의 전체 수는 변하지 않는다.
// 학생이 정하는 것: 중성 / (−) / (+) 막대 선택, 왼쪽·오른쪽 접근 방향, 거리 슬라이더, 관찰이 끝난 뒤 직접 확인 문제 열기.
// 실패하는 길: 중성 막대는 아무 일도 일으키지 않는다. 대전된 막대가 깡통에 닿으면 전자가 건너가 같은 전기를 띠며 밀려난다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawElectron } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { X, clamp, xArrow, xCanvas, xFrame, xPill, xRow, xSegs, xSign, xText, type LabStep } from "./kit";

type RodKind = "plain" | "neg" | "pos";

const R = 66; // 깡통 반지름
const ROW = 56; // 몰린 전자가 서는 안쪽 테두리의 반지름
const N_E = 16;
const PLUS: [number, number][] = [];
const HOME: [number, number][] = [];
{
  const d = 14;
  for (let i = -3; i < 3; i++)
    for (let j = -3; j < 3; j++) {
      const x = (i + 0.5) * d;
      const y = (j + 0.5) * d;
      if (Math.hypot(x, y) > 41) continue;
      ((i + j) % 2 === 0 ? PLUS : HOME).push([x, y]);
    }
  HOME.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}
/** 안쪽 테두리 한쪽(dir: -1 왼쪽, +1 오른쪽)을 따라 선 16자리. */
const edgeRow = (dir: number): [number, number][] =>
  Array.from({ length: N_E }, (_, i) => {
    const a = ((-95 + (190 * i) / (N_E - 1)) * Math.PI) / 180;
    return [dir * Math.cos(a) * ROW, Math.sin(a) * ROW] as [number, number];
  });

export const canLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api, tall: true });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let rodKind: RodKind = "plain";
  let side: -1 | 1 = -1; // 막대가 있는 쪽(-1 왼쪽)
  let closeness = 0; // 0 멀리, 1 닿음
  let shift = 0; // 전자가 몰린 정도
  let canX = 0;
  let roll = 0;
  let touched = false;
  let ready = false;
  let finished = false;
  const seen = { plain: false, neg: false, pos: false };

  const charged = (): boolean => rodKind !== "plain";

  const rod = xSegs<RodKind>(
    [
      { k: "plain", t: "중성 막대" },
      { k: "neg", t: "(−) 막대" },
      { k: "pos", t: "(+) 막대" },
    ],
    "plain",
    (k) => {
      rodKind = k;
      reset(false);
      if (k === "neg") f.say("털가죽으로 문질러 <b>(−)전기</b>를 띤 막대예요. 깡통에 닿지 않게 가까이 대 보세요.");
      else if (k === "pos") f.say("명주로 문질러 <b>(+)전기</b>를 띤 막대예요. 이번에는 전자가 어느 쪽으로 움직일까요?");
      else f.say("전기를 띠지 않은 <b>중성 막대</b>예요. 깡통 가까이에 대면 어떻게 될까요?");
    },
  );
  const where = xSegs(
    [
      { k: "L", t: "왼쪽에서 접근" },
      { k: "R", t: "오른쪽에서 접근" },
    ],
    "L",
    (k) => {
      side = k === "L" ? -1 : 1;
      reset(false);
    },
  );
  const flipSideBtn = bvBtn("", "반대쪽에서 접근");
  flipSideBtn.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    side = side === -1 ? 1 : -1;
    where.set(side === -1 ? "L" : "R");
    reset(false);
  });
  const goAskBtn = bvBtn("main", "확인 문제 풀기");
  goAskBtn.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    finished = true;
    rod.lock(true);
    where.lock(true);
    dist.input.disabled = true;
    ask1();
  });

  const dist = bvRange({
    cls: "g2u7x-r",
    min: 0,
    max: 100,
    value: 0,
    label: "막대와 깡통 사이의 거리",
    ticks: ["멀리", "가까이", "접촉(닿음)"],
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
  const done = (): number => (seen.plain ? 1 : 0) + (seen.neg ? 1 : 0) + (seen.pos ? 1 : 0);

  function touch(): void {
    touched = true;
    dist.input.disabled = true;
    haptic(HAPTIC.wrong);
    if (rodKind === "neg") {
      f.say("막대가 깡통에 <b>닿아 버렸어요</b>! 전자가 깡통으로 건너와 같은 (−)전기를 띠며 밀려났어요. 닿지 않게 가까이만 대 보세요.");
    } else if (rodKind === "pos") {
      f.say("막대가 깡통에 <b>닿아 버렸어요</b>! 깡통 속 전자 일부가 (+) 막대로 건너가 깡통도 (+)전기를 띠며 밀려났어요.");
    } else {
      f.say("막대가 깡통에 닿았어요. 이번에는 닿지 않게 가까이만 대 보세요.");
    }
    tm.later(() => {
      reset(true);
      f.say("막대를 처음 위치로 물렸어요. 이번에는 깡통에 <b>닿지 않게</b> 가까이만 대 보세요.");
    }, 2200);
  }

  function check(): void {
    if (closeness < 0.62) return;
    const before = done();
    if (rodKind === "plain") {
      if (!seen.plain) f.say("깡통 속 전자가 <b>고르게 퍼진 채</b> 움직이지 않아요. 이제 <b>(−) 막대</b>와 <b>(+) 막대</b>를 가까이 대 보세요.");
      seen.plain = true;
    } else if (rodKind === "neg") {
      if (!seen.neg) {
        haptic(HAPTIC.correct);
        seen.neg = true;
        f.say("전자가 <b>먼 쪽</b>으로 밀려나 가까운 쪽이 (+)전기를 띠어요! 가까운 쪽의 <b>큰 인력</b> 때문에 깡통이 끌려와요.");
      }
    } else if (rodKind === "pos") {
      if (!seen.pos) {
        haptic(HAPTIC.correct);
        seen.pos = true;
        f.say("이번에는 전자가 <b>가까운 쪽</b>으로 끌려와 가까운 쪽이 (−)전기를 띠어요! 역시 <b>큰 인력</b>이 작용해 끌려와요.");
      }
    }
    if (done() !== before) f.pips(done());
    if (done() === 3 && !ready && !finished) {
      ready = true;
      f.slot.setControls(rod.el, xRow(flipSideBtn, goAskBtn), dist.el);
      f.say("세 막대를 모두 비교했어요! 더 관찰한 뒤 준비되면 <b>확인 문제 풀기</b>를 눌러 보세요.");
    } else if (done() === 2) {
      const miss = !seen.plain ? "중성 막대" : !seen.neg ? "(−) 막대" : "(+) 막대";
      if (before !== done()) {
        f.say(`${rodKind === "pos" ? "전자가 가까운 쪽으로 몰리며 끌려와요!" : "전자가 먼 쪽으로 밀려나며 끌려와요!"} 이제 <b>${miss}</b>도 비교해 보세요.`);
      }
    }
  }

  function ask1(): void {
    f.slot.ask(
      "(+)전기를 띤 막대와 (−)전기를 띤 막대를 깡통에 각각 가까이 대면 가까운 쪽은 어떤 전기를 띠나요?",
      [
        { t: "막대와 서로 반대 종류의 전기를 띠어 둘 다 끌려와요", ok: true },
        { t: "막대와 같은 종류의 전기를 띠어 밀려나요" },
        { t: "(+) 막대일 때만 끌려오고 (−) 막대일 때는 밀려나요" },
      ],
      (ok) => api.recordQuiz(ok),
      {
        why: "(−) 막대면 가까운 쪽이 <b>(+)</b>, (+) 막대면 가까운 쪽이 <b>(−)</b>를 띠고, 가까운 쪽의 인력이 먼 쪽의 척력보다 커서 둘 다 끌려와요.",
        onNext: ask2,
      },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "막대가 닿지 않게 가까이 대는 동안 깡통 속 전자의 전체 개수는 어떻게 되나요?",
      [{ t: "변함없이 그대로예요", ok: true }, { t: "처음보다 늘어났어요" }, { t: "처음보다 줄어들었어요" }],
      () => undefined,
      { why: "막대가 닿지 않았으므로 전자는 밖으로 나가거나 들어오지 않고 <b>깡통 안에서 위치만</b> 이동했어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("대전체의 종류와 관계없이 가까운 쪽에 반대 전기가 유도되어 끌려온다는 것을 확인했어요!");
    f.slot.conclude("금속 깡통에 대전체를 가까이 대면 깡통 속 전자가 이동해 <b>가까운 쪽에는 반대 전기</b>, 먼 쪽에는 같은 전기가 유도돼요. 가까운 쪽의 인력이 먼 쪽의 척력보다 크므로 깡통은 (+)·(−) 어느 대전체 쪽으로든 끌려와요.");
    api.enableCTA(s.cta ?? "다음");
  }

  let gone = 0; // 접촉 시 전자 이동 정도(0~1)
  st.run((ctx, w, h, _t, dt) => {
    const floor = h - 28;
    const isChg = charged();
    const eff = isChg ? clamp((closeness - 0.15) / 0.75, 0, 1) : 0;
    shift += (eff - shift) * Math.min(1, dt * 0.12);
    gone += ((touched && isChg ? 1 : 0) - gone) * Math.min(1, dt * 0.1);

    const pull = touched && isChg ? -1 : isChg && closeness > 0.6 ? 1 : 0;
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

    // 책상 바닥 그림자 + 알루미늄 깡통
    const shGrad = ctx.createRadialGradient(cx, floor + 2, 4, cx, floor + 2, R * 0.72);
    shGrad.addColorStop(0, "rgba(4, 10, 22, 0.5)");
    shGrad.addColorStop(1, "rgba(4, 10, 22, 0)");
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(cx, floor + 2, R * 0.72, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const g = ctx.createRadialGradient(cx - 22, cy - 24, 6, cx, cy, R);
    g.addColorStop(0, "#F7FAFF");
    g.addColorStop(0.68, "#BCC8DA");
    g.addColorStop(1, "#7B89A1");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5C6A82";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // 금속 하이라이트 호
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, R - 1.5, -Math.PI * 0.84, -Math.PI * 0.36);
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(roll);
    ctx.strokeStyle = "rgba(92,106,130,.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, R - 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(R - 7, 0);
    ctx.lineTo(R - 1, 0);
    ctx.stroke();
    ctx.restore();

    // 원자핵(+): 제자리 고정
    PLUS.forEach(([x, y]) => xSign(ctx, cx + x, cy + y, true, 5.5, 0.92));

    // 전자(−): (−) 막대면 먼 쪽(-side), (+) 막대면 가까운 쪽(+side) 안쪽 테두리로 이동
    const targetDir = rodKind === "pos" ? side : -side;
    const target = edgeRow(targetDir);
    const e = shift * shift * (3 - 2 * shift);
    HOME.forEach(([x, y], i) => {
      // (+) 막대와 닿았을 때 3개 전자가 막대로 건너가는 애니메이션
      if (rodKind === "pos" && gone > 0.02 && i >= 6 && i <= 8) {
        const k = i - 6;
        const [tx, ty] = target[i];
        const sx = cx + x + (tx - x) * e;
        const sy = cy + y + (ty - y) * e;
        const ex = cx + side * (R + 22 + k * 14);
        drawElectron(ctx, sx + (ex - sx) * gone, sy + (cy - sy) * gone, 5.5);
        return;
      }
      const [fx, fy] = target[i];
      drawElectron(ctx, cx + x + (fx - x) * e, cy + y + (fy - y) * e, 5.5);
    });

    // (−) 막대와 닿았을 때 막대의 전자 3개가 깡통으로 건너옴
    if (rodKind === "neg" && gone > 0.02) {
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

    // 가까운 쪽 큰 인력 vs 먼 쪽 작은 척력 비교 화살표(접촉하지 않고 유도되었을 때)
    if (shift > 0.45 && !touched && isChg) {
      const ay = cy + 36;
      const nearX = cx + side * (R - 14);
      const farX = cx - side * (R - 14);
      // 가까운 쪽: 굵고 긴 인력 화살표(막대 쪽으로)
      xArrow(ctx, nearX, ay, nearX + side * 38, ay, "#3FD6C0", 4, 10);
      xText(ctx, "큰 인력", nearX + side * 24, ay + 15, { px: 12, w: 800, color: "#7FE3C4" });
      // 먼 쪽: 가늘고 짧은 척력 화살표(막대 반대쪽으로)
      xArrow(ctx, farX, ay, farX - side * 18, ay, "rgba(255,157,138,.88)", 2.2, 7);
      xText(ctx, "작은 척력", farX - side * 16, ay + 15, { px: 12, w: 700, color: "rgba(255,175,158,.9)" });
    }

    // 막대
    const tip = cx + side * (R + 1 + (1 - closeness) * 35);
    const rl = 70;
    const rx = side < 0 ? tip - rl : tip;
    ctx.fillStyle = rodKind === "neg" ? "#3D8FE8" : rodKind === "pos" ? "#E05A45" : "#9AA7BD";
    ctx.strokeStyle = rodKind === "neg" ? "#1F5FB0" : rodKind === "pos" ? "#9C2F1E" : "#66738A";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, cy - 8, rl, 16, 8);
    ctx.fill();
    ctx.stroke();
    const signs = !isChg ? 0 : touched ? 1 : 4;
    for (let i = 0; i < signs; i++) {
      xSign(ctx, side < 0 ? rx + 12 + i * 15 : rx + rl - 12 - i * 15, cy, rodKind === "pos", 5.5);
    }
    xText(ctx, rodKind === "neg" ? "(−) 막대" : rodKind === "pos" ? "(+) 막대" : "중성 막대", rx + rl / 2, cy - 21, { px: 12, color: X.dim });

    // 띠는 전기 표시
    if (touched && isChg) {
      xText(
        ctx,
        rodKind === "neg" ? "전자가 건너와 (−)전기" : "전자가 빠져나가 (+)전기",
        cx,
        cy - R - 12,
        { px: 13, color: rodKind === "neg" ? X.minus : X.plus, w: 800 },
      );
    } else if (shift > 0.45 && isChg) {
      const nearPlus = rodKind === "neg";
      xText(ctx, nearPlus ? "(+)전기" : "(−)전기", cx + side * (R - 10), cy - R - 12, { px: 13, color: nearPlus ? X.plus : X.minus, w: 800 });
      xText(ctx, nearPlus ? "(−)전기" : "(+)전기", cx - side * (R - 10), cy - R - 12, { px: 13, color: nearPlus ? X.minus : X.plus, w: 800 });
    }

    // 전자·원자핵 개수 표시
    const ne = N_E + (touched && isChg ? (rodKind === "neg" ? 3 : -3) : 0);
    const lx = w - 96;
    drawElectron(ctx, lx, 22, 5.5);
    xText(ctx, `전자 ${ne}개`, lx + 11, 22, { px: 12.5, align: "left", color: ne !== N_E ? (ne > N_E ? X.minus : X.plus) : X.ink, w: 800 });
    xSign(ctx, lx, 41, true, 5.5);
    xText(ctx, `원자핵 ${PLUS.length}개`, lx + 11, 41, { px: 12.5, align: "left", color: X.ink, w: 800 });
    xPill(
      ctx,
      touched ? "막대가 닿았어요" : shift > 0.45 ? (rodKind === "pos" ? "전자가 가까운 쪽으로 몰림" : "전자가 먼 쪽으로 몰림") : "전자가 고르게 퍼져 있음",
      touched ? X.plus : rodKind === "pos" ? X.plus : X.minus,
    );
  });

  f.say("금속 깡통 속 붉은 점은 원자핵(+), 파란 입자는 전자(−)예요. 세 가지 막대를 골라 깡통에 <b>닿지 않게 가까이</b> 대 보세요.");
  api.setCTA("세 막대를 가까이 대고 비교해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
