// [중2 Ⅲ v5] g2u3l1 빛의 반사: 랩 두 판.
//
// 1) g2u3ReflectLab 「반사한 빛은 어느 쪽으로 갈까요?」
//    책의 어디에서: 해 보기 '빛의 반사 관찰하기'(각도기가 달린 거울에 슬릿 레이저를 비추고, 비춘 빛과 반사한 빛이 거울 면에 수직인 선과 이루는 각을 잰다. 각도를 바꿔 가며 되풀이한다).
//    학생이 정하는 것: 레이저를 얼마나 기울일지와 기록할 때(서로 다른 각 셋). 이어서 반사한 빛을 가린 채 과녁을 맞히게 레이저를 놓는다.
//    실패하는 길: 같은 각을 또 기록하면 칸이 늘지 않는다. 과녁 맞히기에서 각이 틀리면 반사한 빛이 과녁을 빗나가는 것이 그대로 보인다.
//    한 통찰: 비춘 빛의 각과 반사한 빛의 각은 늘 같다(용어 '입사각, 반사각, 법선'은 바로 뒤 개념 스텝에서 붙인다).
//    옛 랩(reflectLab)은 레이저를 돌리며 두 눈금이 같아지는 것을 구경하고 목표 칩을 채웠다. 기록과 과녁 맞히기는 없었다.
//
// 2) g2u3RoughLab 「거친 면에서도 두 각은 같을까요?」
//    책에는 없는 내용이다(정반사와 난반사). 단원 종합 평가가 이 내용을 묻고 있어 랩 하나로 남겼다(설계 문서의 "사용자가 정할 것").
//    학생이 정하는 것: 면(매끈한 면, 거친 면)과 빛이 닿는 자리. 자리마다 그 자리의 수직선과 두 각이 그려진다. 이어서 나란한 빛 다섯 줄기를 한꺼번에 비춘다.
//    한 통찰: 거친 면에서도 빛줄기 하나하나는 두 각이 같다. 닿는 곳마다 면의 기울기가 달라 흩어질 뿐이다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { BEAM_GREEN, BEAM_WHITE, drawBeam, drawNormal, drawProtractor, laserBody, mirrorProp, capturePointer } from "../../../ui/lightKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { DW, LX, clamp, lxCanvas, lxFrame, lxAngle, lxLog, lxPill, lxSeg, lxText, rad } from "./lxKit";

interface S {
  title: string;
  cta?: string;
}

// ══════════════════════════════════════════════════════════
// 1) 각도기 거울과 슬릿 레이저
// ══════════════════════════════════════════════════════════
const OX = 173;
const OY = 182;
const RIM = 118; // 레이저가 놓이는 거리
const PRO = 92; // 각도기 반지름

export const reflectLab5: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 4, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();

  let th = 30; // 비춘 빛이 수직선과 이루는 각(도)
  let phase: "measure" | "aim" | "shot" | "end" = "measure";
  let target = 50;
  let shotOk = false;
  const got: number[] = [];
  host.dataset.lx = "measure";
  host.dataset.lxLab = "reflect";

  const log = lxLog(["첫째", "둘째", "셋째"]);
  const range = bvRange({
    cls: "g2u3x-r",
    min: 2,
    max: 16,
    value: 6,
    label: "레이저 기울이기",
    onInput: (v) => {
      th = v * 5;
      if (phase === "shot") phase = "aim";
    },
  });
  const rec = bvBtn("main g2u3x-rec", "두 각 기록하기");
  rec.dataset.k = "rec";
  f.slot.setControls(range.el, log.el, rec);

  // 무대에서 레이저를 직접 끌어도 된다
  let dragging = false;
  const fromPointer = (e: PointerEvent): void => {
    const p = st.pt(e);
    const a = (Math.atan2(OX - p.x, OY - p.y) * 180) / Math.PI; // 수직선에서 왼쪽으로 기운 각
    const v = clamp(Math.round(a / 5), 2, 16);
    th = v * 5;
    range.set(v);
    if (phase === "shot") phase = "aim";
  };
  st.cv.addEventListener("pointerdown", (e) => {
    if (phase === "end") return;
    const p = st.pt(e);
    if (p.x > OX + 10 || p.y > OY) return;
    capturePointer(st.cv, e);
    dragging = true;
    haptic(HAPTIC.tap);
    fromPointer(e);
  });
  st.cv.addEventListener("pointermove", (e) => {
    if (dragging) fromPointer(e);
  });
  const up = (): void => {
    dragging = false;
  };
  st.cv.addEventListener("pointerup", up);
  st.cv.addEventListener("pointercancel", up);

  rec.addEventListener("click", () => {
    if (phase === "end") return;
    if (phase === "measure") {
      if (got.includes(th)) {
        haptic(HAPTIC.wrong);
        f.say("이미 기록한 각이에요. 레이저를 <b>다른 각</b>으로 기울여 다시 재 보세요.");
        return;
      }
      got.push(th);
      haptic(HAPTIC.correct);
      log.set(got.length - 1, `${th}° → ${th}°`, "비춘 각 → 반사한 각");
      f.pips(got.length);
      if (got.length < 3) {
        f.say(`비춘 각 ${th}°에 반사한 각도 <b>${th}°</b>. 각을 바꿔 ${3 - got.length}번 더 재 보세요.`);
        return;
      }
      // 과녁 맞히기: 기록하지 않은 각을 과녁으로
      target = [50, 65, 35, 20].find((t) => !got.includes(t)) ?? 50;
      phase = "aim";
      host.dataset.lx = "aim";
      host.dataset.lxTarget = String(target);
      rec.textContent = "빛 쏘기";
      f.say(`이번에는 반사한 빛을 가렸어요. 수직선에서 <b>${target}°</b>에 놓인 과녁을 맞히게 레이저를 놓고 쏴 보세요.`);
      api.setCTA("과녁을 맞혀 보세요", { enabled: false });
      return;
    }
    // 쏘기
    phase = "shot";
    shotOk = th === target;
    if (shotOk) {
      haptic(HAPTIC.correct);
      phase = "end";
      host.dataset.lx = "hit";
      f.pips(4);
      f.say(`명중! 비춘 각을 <b>${target}°</b>로 맞추니 반사한 빛도 ${target}°로 나아갔어요.`);
      tm.later(askFinal, 1800);
    } else {
      haptic(HAPTIC.wrong);
      f.say(`빗나갔어요. 비춘 각이 ${th}°라 반사한 빛도 <b>${th}°</b>로 나아갔어요. 과녁은 ${target}°에 있어요.`);
    }
  });

  function askFinal(): void {
    host.dataset.lx = "ask";
    f.slot.ask(
      "비춘 빛의 각을 20°에서 40°로 키우면 반사한 빛의 각은 어떻게 될까요?",
      [{ t: "똑같이 40°로 커져요", ok: true }, { t: "20° 그대로예요" }, { t: "10°로 작아져요" }],
      (ok) => api.recordQuiz(ok),
      { why: "세 번 모두 두 각이 같았어요. 한쪽이 커지면 다른 쪽도 <b>똑같이</b> 커져요.", onNext: finish },
    );
  }
  function finish(): void {
    host.dataset.lx = "done";
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("거울에 비춘 빛과 반사한 빛이 <b>거울 면에 수직인 선</b>과 이루는 각은 <b>항상 같아요</b>. 한쪽이 커지면 다른 쪽도 똑같이 커져요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, t) => {
    const a = rad(th);
    const lx = OX - Math.sin(a) * RIM;
    const ly = OY - Math.cos(a) * RIM;
    const showOut = phase === "measure" || phase === "shot" || phase === "end";
    // 거울과 각도기
    drawProtractor(ctx, OX, OY, PRO, 0, { alpha: 0.9 });
    mirrorProp(ctx, OX - 128, OY, OX + 128, OY, { back: 1 });
    drawNormal(ctx, OX, OY, -Math.PI / 2, PRO + 26);
    lxText(ctx, "점선: 거울 면에 수직인 선", OX, OY + 24, { color: LX.dim });
    // 과녁
    if (phase === "aim" || phase === "shot" || (phase === "end" && shotOk)) {
      const ta = rad(target);
      const tx = OX + Math.sin(ta) * (PRO + 22);
      const ty = OY - Math.cos(ta) * (PRO + 22);
      const hit = (phase === "shot" || phase === "end") && shotOk;
      ctx.save();
      [11, 7, 3].forEach((r, i) => {
        ctx.beginPath();
        ctx.arc(tx, ty, r, 0, Math.PI * 2);
        ctx.fillStyle = i === 1 ? "#fff" : hit ? LX.green : LX.red;
        ctx.fill();
      });
      if (hit) {
        ctx.strokeStyle = `rgba(81,207,102,${0.5 + 0.4 * Math.sin(t / 160)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tx, ty, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      lxText(ctx, `과녁 ${target}°`, clamp(tx + 4, 40, DW - 34), ty - 20, { color: "#FFD0D0" });
    }
    // 빛
    const flow = (t / 900) % 1;
    drawBeam(ctx, [{ x: lx, y: ly }, { x: OX, y: OY }], { rgb: BEAM_GREEN, flow });
    if (showOut) {
      const ex = OX + Math.sin(a) * (PRO + 40);
      const ey = OY - Math.cos(a) * (PRO + 40);
      drawBeam(ctx, [{ x: OX, y: OY }, { x: ex, y: ey }], { rgb: BEAM_GREEN, flow, arrow: true });
      lxAngle(ctx, OX, OY, 44, -Math.PI / 2, -Math.PI / 2 + a, LX.cyan, `${th}°`, 64);
    } else {
      lxText(ctx, "?", OX + 30, OY - 52, { color: `rgba(${LX.cyan},1)`, px: 18, w: 800 });
    }
    lxAngle(ctx, OX, OY, 44, -Math.PI / 2, -Math.PI / 2 - a, LX.amber, `${th}°`, 64);
    laserBody(ctx, lx, ly, Math.atan2(OY - ly, OX - lx), { len: 44 });
    lxPill(ctx, phase === "aim" ? "반사한 빛은 가렸어요" : "비춘 각(노랑), 반사한 각(파랑)", phase === "aim" ? LX.red : LX.gold);
  });

  f.say("<b>슬릿 레이저</b>를 기울여 거울에 비추고 <b>두 각 기록하기</b>를 눌러요. 각을 바꿔 세 번 재 보세요.");
  api.setCTA("각을 바꿔 세 번 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};

// ══════════════════════════════════════════════════════════
// 2) 매끈한 면과 거친 면
// ══════════════════════════════════════════════════════════
type Face = "flat" | "rough";
const SY = 176; // 면의 기준 높이
/** 거친 면의 꺾인 점(x, 높이 차). 기울기는 ±15° 안쪽으로 고정해 두었다. */
const ROUGH: [number, number][] = [
  [20, 0], [52, -7], [84, 2], [112, -5], [140, 3], [170, -4], [198, 4], [226, -3], [256, 5], [286, -4], [326, 2],
];
const surfY = (face: Face, x: number): number => {
  if (face === "flat") return SY;
  for (let i = 1; i < ROUGH.length; i++) {
    if (x <= ROUGH[i][0]) {
      const [x0, y0] = ROUGH[i - 1];
      const [x1, y1] = ROUGH[i];
      return SY + y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return SY;
};
const facetOf = (face: Face, x: number): number => {
  if (face === "flat") return 0;
  for (let i = 1; i < ROUGH.length; i++) if (x <= ROUGH[i][0]) return i;
  return ROUGH.length - 1;
};
/** 그 자리의 면에 수직인 방향(위쪽). */
const normalAt = (face: Face, x: number): { nx: number; ny: number } => {
  if (face === "flat") return { nx: 0, ny: -1 };
  const i = facetOf(face, x);
  const dx = ROUGH[i][0] - ROUGH[i - 1][0];
  const dy = ROUGH[i][1] - ROUGH[i - 1][1];
  const L = Math.hypot(dx, dy);
  return { nx: dy / L, ny: -dx / L };
};
const IN = { x: Math.sin(rad(30)), y: Math.cos(rad(30)) }; // 빛이 나아가는 방향(오른쪽 아래)

export const roughLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();

  let face: Face = "flat";
  let hx = 126;
  let five = false;
  let asked = false;
  const seen: Record<Face, Set<number>> = { flat: new Set(), rough: new Set() };
  const fiveSeen = new Set<Face>();
  host.dataset.lx = "probe";
  host.dataset.lxLab = "rough";

  const seg = lxSeg<Face>(
    [
      { k: "flat", t: "매끈한 면", sub: "거울" },
      { k: "rough", t: "거친 면", sub: "종이를 크게 본 모습" },
    ],
    "flat",
    (k) => {
      face = k;
      haptic(HAPTIC.tap);
      touch();
    },
  );
  const range = bvRange({
    cls: "g2u3x-r",
    min: 50,
    max: 290,
    value: hx,
    label: "빛이 닿는 자리 옮기기",
    onInput: (v) => {
      hx = v;
      five = false;
      touch();
    },
  });
  const fiveBtn = bvBtn("main g2u3x-five", "나란한 빛 다섯 줄기 비추기");
  fiveBtn.dataset.k = "five";
  fiveBtn.disabled = true;
  f.slot.setControls(seg.el, range.el, fiveBtn);

  function touch(): void {
    if (asked) return;
    if (!five) seen[face].add(facetOf(face, hx));
    const roughN = seen.rough.size;
    if (face === "rough" && roughN >= 3) seg.done("rough");
    if (seen.flat.size >= 1 && face === "flat") seg.done("flat");
    const ready = roughN >= 3 && seen.flat.size >= 1;
    fiveBtn.disabled = !ready;
    f.pips(ready ? 1 + fiveSeen.size : 0);
    if (five) return;
    if (face === "flat") f.say(roughN >= 3 ? "매끈한 면은 어디에 닿아도 수직선의 방향이 같아요. 이제 <b>다섯 줄기</b>를 비춰 보세요." : "매끈한 면에서는 두 각이 같아요. 이제 <b>거친 면</b>을 골라 닿는 자리를 옮겨 보세요.");
    else if (roughN < 3) f.say(`닿는 자리마다 수직선이 기울어요. 두 각을 견주며 <b>${3 - roughN}곳</b> 더 옮겨 보세요.`);
    else f.say("거친 면에서도 닿는 자리마다 <b>두 각은 같았어요</b>. 이제 <b>다섯 줄기</b>를 비춰 보세요.");
  }

  fiveBtn.addEventListener("click", () => {
    if (asked) return;
    five = true;
    fiveSeen.add(face);
    haptic(HAPTIC.tap);
    f.pips(1 + fiveSeen.size);
    if (fiveSeen.size < 2) {
      f.say(face === "flat" ? "나란히 들어간 빛이 <b>나란히</b> 반사했어요. <b>거친 면</b>에도 다섯 줄기를 비춰 보세요." : "나란히 들어간 빛이 <b>여러 방향</b>으로 흩어졌어요. <b>매끈한 면</b>에도 비춰 보세요.");
      return;
    }
    f.say("매끈한 면은 나란히, 거친 면은 여러 방향으로 반사했어요. 까닭을 생각해 봐요.");
    asked = true;
    host.dataset.lx = "ask";
    tm.later(() => {
      f.slot.ask(
        "거친 면에서 반사한 빛이 여러 방향으로 흩어지는 까닭은 무엇일까요?",
        [{ t: "닿는 곳마다 면의 기울기가 달라서", ok: true }, { t: "거친 면에서는 두 각이 달라져서" }, { t: "거친 면이 빛을 모두 흡수해서" }],
        (ok) => api.recordQuiz(ok),
        { why: "어느 자리에서나 두 각은 같았어요. 달랐던 것은 <b>수직선의 방향</b>이에요.", onNext: finish },
      );
    }, 1700);
  });

  function finish(): void {
    host.dataset.lx = "done";
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("거친 면에서도 빛줄기 하나하나는 <b>두 각이 같아요</b>. 닿는 곳마다 면의 기울기가 달라 여러 방향으로 흩어질 뿐이에요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const drawSurface = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.beginPath();
    if (face === "flat") {
      ctx.moveTo(20, SY);
      ctx.lineTo(326, SY);
    } else {
      ROUGH.forEach(([x, dy], i) => (i ? ctx.lineTo(x, SY + dy) : ctx.moveTo(x, SY + dy)));
    }
    ctx.lineTo(326, 214);
    ctx.lineTo(20, 214);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, SY - 8, 0, 214);
    if (face === "flat") {
      g.addColorStop(0, "#C9DBF2");
      g.addColorStop(0.15, "#7F97BB");
      g.addColorStop(1, "#3A4B6B");
    } else {
      g.addColorStop(0, "#F3EAD7");
      g.addColorStop(0.2, "#CDBE9F");
      g.addColorStop(1, "#7E7460");
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  };
  const oneRay = (ctx: CanvasRenderingContext2D, x: number, flow: number, detail: boolean): void => {
    const y = surfY(face, x);
    const { nx, ny } = normalAt(face, x);
    const dot = IN.x * nx + IN.y * ny;
    const rx = IN.x - 2 * dot * nx;
    const ry = IN.y - 2 * dot * ny;
    const len = detail ? 150 : 120;
    drawBeam(ctx, [{ x: x - IN.x * len, y: y - IN.y * len }, { x, y }], { rgb: detail ? BEAM_GREEN : BEAM_WHITE, flow, width: detail ? undefined : 1.4, alpha: detail ? undefined : 0.45, glow: detail });
    drawBeam(ctx, [{ x, y }, { x: x + rx * 104, y: y + ry * 104 }], { rgb: detail ? BEAM_GREEN : BEAM_WHITE, flow, arrow: true, width: detail ? undefined : 1.6 });
    if (!detail) return;
    const nd = Math.atan2(ny, nx);
    drawNormal(ctx, x, y, nd, 70);
    const ang = Math.round((Math.acos(clamp(-dot, -1, 1)) * 180) / Math.PI);
    lxAngle(ctx, x, y, 34, nd, Math.atan2(-IN.y, -IN.x), LX.amber, `${ang}°`, 54);
    lxAngle(ctx, x, y, 34, nd, Math.atan2(ry, rx), LX.cyan, `${ang}°`, 54);
  };

  st.run((ctx, t) => {
    drawSurface(ctx);
    const flow = (t / 900) % 1;
    if (five) {
      [-64, -32, 0, 32, 64].forEach((dx) => oneRay(ctx, clamp(173 + dx + (face === "rough" ? 9 : 0), 40, 300), flow, false));
      lxPill(ctx, face === "flat" ? "나란히 반사해요" : "여러 방향으로 흩어져요", face === "flat" ? LX.blue : LX.gold);
    } else {
      oneRay(ctx, hx, flow, true);
      lxPill(ctx, "비춘 각(노랑), 반사한 각(파랑)", LX.gold);
    }
    lxText(ctx, face === "flat" ? "매끈한 면" : "거친 면", 173, 202, { px: 13, w: 800 });
  });

  touch();
  f.say("빛 한 줄기가 면에 닿아요. <b>닿는 자리</b>를 옮기며 그 자리의 수직선과 두 각을 견줘 보세요.");
  api.setCTA("두 면에서 두 각을 견줘 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
