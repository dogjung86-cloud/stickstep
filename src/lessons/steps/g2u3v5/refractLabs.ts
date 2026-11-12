// [중2 Ⅲ v5] g2u3l2 빛의 굴절: 랩 두 판.
//
// 1) g2u3TankLab 「물에 들어간 빛은 어떻게 나아갈까요?」
//    책의 어디에서: 해 보기 '빛의 굴절 관찰하기'(사각 수조의 물에 우유를 두세 방울 넣어 젓고, 뚜껑을 덮어 향 연기를 채운 뒤,
//    레이저 지시기의 빛을 공기에서 물로 비스듬히 비춘다. 들어가는 각을 점점 키운다. 배경을 어둡게 하면 길이 더 잘 보인다).
//    학생이 정하는 것: 준비의 차례(우유, 향 연기, 불 끄기)와 쏠 때. 길이 다 보이면 레이저의 기울기와 기록할 때(서로 다른 각 셋).
//    실패하는 길: 우유 없이 쏘면 물속 길이, 연기 없이 쏘면 공기 중 길이 보이지 않는다(빛이 닿은 점만 보인다). 밝은 방에서는 흐리다.
//    한 통찰: 공기에서 물로 비스듬히 들어간 빛은 경계면에서 꺾이고, 꺾인 각은 들어간 각보다 작다.
//    옛 랩(refractLab)은 준비가 끝난 수조에서 레이저만 돌렸다.
//
// 2) g2u3CoinLab 「물을 부으면 왜 동전이 보일까요?」
//    책의 어디에서: 그림 Ⅲ-4(물을 붓기 전에는 보이지 않던 컵 속의 동전이 물을 부으면 보인다)와 스스로 확인하기 2(물에 담근 다리).
//    학생이 정하는 것: 물의 높이, 눈이 느끼는 자리를 볼 때.
//    실패하는 길: 물이 낮으면 동전에서 나온 빛이 컵의 벽에 막힌다.
//    한 통찰: 경계면에서 꺾인 빛이 눈에 들어오고, 눈은 그 빛이 곧게 온 것으로 여겨 물체가 실제보다 떠올라 보인다.
//    굴절은 계산으로 그린다(물의 굴절률 1.33. 수면의 한 점을 이분법으로 찾는다).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { BEAM_GREEN, BEAM_WHITE, drawBeam, drawNormal, eyeProp, laserBody } from "../../../ui/lightKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { LX, lxAngle, lxCanvas, lxFrame, lxLog, lxPill, lxText, rad } from "./lxKit";

interface S {
  title: string;
  cta?: string;
}
const N_WATER = 1.33;

// ══════════════════════════════════════════════════════════
// 1) 수조와 레이저 지시기
// ══════════════════════════════════════════════════════════
const TX0 = 44;
const TX1 = 302;
const TY0 = 30;
const TY1 = 208;
const WY = 112; // 수면
const HX = 160; // 빛이 수면에 닿는 점

type Prep = "milk" | "smoke" | "dark";

export const tankLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 4, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "tank";
  host.dataset.lx = "prep";

  const prep: Record<Prep, boolean> = { milk: false, smoke: false, dark: false };
  let on = false; // 레이저가 켜져 있다
  let th = 40; // 들어가는 각(도)
  let phase: "prep" | "measure" | "end" = "prep";
  const got: number[] = [];

  // 준비 국면의 조작부
  const PREPS: { k: Prep; t: string; sub: string }[] = [
    { k: "smoke", t: "향 연기", sub: "뚜껑 덮고 채우기" },
    { k: "dark", t: "불 끄기", sub: "배경을 어둡게" },
    { k: "milk", t: "우유 방울", sub: "물에 넣고 젓기" },
  ];
  const prepBtns = PREPS.map((p) => {
    const b = el("button", { class: "g2u3x-seg", attrs: { type: "button", "aria-pressed": "false" } }, el("b", { text: p.t }), el("i", { text: p.sub })) as HTMLButtonElement;
    b.dataset.k = p.k;
    b.addEventListener("click", () => {
      if (phase !== "prep") return;
      prep[p.k] = !prep[p.k];
      b.classList.toggle("on", prep[p.k]);
      b.setAttribute("aria-pressed", String(prep[p.k]));
      haptic(HAPTIC.tap);
      if (on) judgeShot();
      else f.say("준비물은 다시 누르면 뺄 수 있어요. <b>레이저 쏘기</b>를 눌러 빛의 길이 보이는지 확인해요.");
    });
    return b;
  });
  const prepRow = el("div", { class: "g2u3x-segs tall" }, ...prepBtns);
  prepRow.style.gridTemplateColumns = "repeat(3, 1fr)";
  const fire = bvBtn("main", "레이저 쏘기");
  fire.dataset.k = "fire";
  f.slot.setControls(prepRow, fire);

  function judgeShot(): void {
    const { milk, smoke, dark } = prep;
    if (!milk && !smoke) f.say("빛이 닿은 <b>점</b>만 보이고 빛이 지나간 길은 보이지 않아요. 준비물을 더해 보세요.");
    else if (!smoke) f.say("물속의 길은 보이는데 <b>공기 중의 길</b>이 보이지 않아요. 무엇을 더할까요?");
    else if (!milk) f.say("공기 중의 길은 보이는데 <b>물속의 길</b>이 보이지 않아요. 무엇을 더할까요?");
    else if (!dark) f.say("길이 보이지만 <b>흐려요</b>. 주변이 밝아서예요. 무엇을 하면 좋을까요?");
    else {
      f.say("빛의 길이 또렷해요. 곧게 가던 빛이 <b>물의 표면에서 꺾였어요</b>.");
      haptic(HAPTIC.correct);
      phase = "measure";
      f.pips(1);
      tm.later(startMeasure, 2000);
    }
  }
  fire.addEventListener("click", () => {
    if (phase !== "prep") return;
    on = true;
    haptic(HAPTIC.tap);
    fire.textContent = "레이저가 켜져 있어요";
    judgeShot();
  });

  // 재는 국면의 조작부
  const log = lxLog(["첫째", "둘째", "셋째"]);
  const range = bvRange({
    cls: "g2u3x-r",
    min: 0,
    max: 7,
    value: 4,
    label: "레이저 기울이기",
    onInput: (v) => {
      th = v * 10;
    },
  });
  const rec = bvBtn("main", "두 각 기록하기");
  rec.dataset.k = "rec";
  const refr = (deg: number): number => (Math.asin(Math.sin(rad(deg)) / N_WATER) * 180) / Math.PI;

  function startMeasure(): void {
    host.dataset.lx = "measure";
    f.slot.setControls(range.el, log.el, rec);
    f.say("이제 레이저를 기울여 <b>들어간 각</b>과 <b>꺾인 각</b>을 견줘요. 각을 바꿔 세 번 기록해 보세요.");
    api.setCTA("각을 바꿔 세 번 재 보세요", { enabled: false });
  }
  rec.addEventListener("click", () => {
    if (phase !== "measure") return;
    if (got.includes(th)) {
      haptic(HAPTIC.wrong);
      f.say("이미 기록한 각이에요. 레이저를 <b>다른 각</b>으로 기울여 다시 재 보세요.");
      return;
    }
    got.push(th);
    haptic(HAPTIC.correct);
    const r = Math.round(refr(th));
    log.set(got.length - 1, `${th}° → ${r}°`, "들어간 각 → 꺾인 각");
    f.pips(1 + got.length);
    if (got.length < 3) {
      f.say(th === 0 ? "수면에 <b>수직으로</b> 비추면 꺾이지 않고 곧게 가요. 비스듬히 기울여 더 재 보세요." : `들어간 각 ${th}°에 꺾인 각은 <b>${r}°</b>. 각을 바꿔 ${3 - got.length}번 더 재 보세요.`);
      return;
    }
    phase = "end";
    f.say("세 번을 쟀어요. 기록을 보며 두 각이 어떻게 달라졌는지 생각해 봐요.");
    host.dataset.lx = "ask";
    tm.later(() => {
      f.slot.ask(
        "레이저를 더 기울여 들어가는 각을 키우면 꺾인 각은 어떻게 될까요?",
        [{ t: "커지지만 들어간 각보다 작아요", ok: true }, { t: "커져서 들어간 각과 같아져요" }, { t: "오히려 점점 작아져요" }],
        (ok) => api.recordQuiz(ok),
        { why: "비스듬히 비춘 기록에서 꺾인 각은 늘 들어간 각보다 <b>작았고</b>, 함께 커졌어요.", onNext: finish },
      );
    }, 1300);
  });
  function finish(): void {
    host.dataset.lx = "done";
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("공기에서 물로 <b>비스듬히</b> 들어간 빛은 물의 표면에서 <b>꺾여요</b>. 꺾인 각은 들어간 각보다 작고, 들어간 각이 커지면 함께 커져요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, t) => {
    const { milk, smoke, dark } = prep;
    // 수조
    ctx.save();
    // 공기 칸(연기)
    ctx.fillStyle = smoke ? "rgba(190,200,215,.20)" : "rgba(120,150,200,.05)";
    ctx.fillRect(TX0, TY0, TX1 - TX0, WY - TY0);
    // 물
    const wg = ctx.createLinearGradient(0, WY, 0, TY1);
    wg.addColorStop(0, milk ? "rgba(170,200,235,.42)" : "rgba(70,140,220,.30)");
    wg.addColorStop(1, milk ? "rgba(140,170,215,.36)" : "rgba(40,90,180,.30)");
    ctx.fillStyle = wg;
    ctx.fillRect(TX0, WY, TX1 - TX0, TY1 - WY);
    ctx.strokeStyle = "rgba(190,225,255,.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(TX0, WY);
    ctx.lineTo(TX1, WY);
    ctx.stroke();
    // 유리벽
    ctx.strokeStyle = "rgba(214,230,250,.75)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(TX0, TY0);
    ctx.lineTo(TX0, TY1);
    ctx.lineTo(TX1, TY1);
    ctx.lineTo(TX1, TY0);
    ctx.stroke();
    if (smoke) {
      // 뚜껑
      ctx.fillStyle = "#8FA3C4";
      ctx.beginPath();
      ctx.roundRect(TX0 - 6, TY0 - 7, TX1 - TX0 + 12, 8, 3);
      ctx.fill();
    }
    ctx.restore();
    lxText(ctx, "공기", TX0 + 24, WY - 16, { color: LX.dim });
    lxText(ctx, "물", TX0 + 18, WY + 18, { color: LX.dim });

    // 레이저와 빛
    const a = rad(th);
    const r = Math.asin(Math.sin(a) / N_WATER);
    const lx0 = HX - Math.sin(a) * 74;
    const ly0 = WY - Math.cos(a) * 74;
    const bx = HX + Math.tan(r) * (TY1 - WY);
    const dim = dark ? 1 : 0.32;
    if (on) {
      const flow = (t / 900) % 1;
      if (smoke) drawBeam(ctx, [{ x: lx0, y: ly0 }, { x: HX, y: WY }], { rgb: BEAM_GREEN, flow, alpha: dim, glow: dark });
      if (milk) drawBeam(ctx, [{ x: HX, y: WY }, { x: bx, y: TY1 - 2 }], { rgb: BEAM_GREEN, flow, alpha: dim, glow: dark });
      // 빛이 닿은 점
      [[HX, WY], [bx, TY1 - 2]].forEach(([x, y]) => {
        ctx.fillStyle = `rgba(${BEAM_GREEN},${0.9 * (dark ? 1 : 0.6)})`;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    if (phase !== "prep") {
      drawNormal(ctx, HX, WY, -Math.PI / 2, 62);
      drawNormal(ctx, HX, WY, Math.PI / 2, 80);
      lxAngle(ctx, HX, WY, 36, -Math.PI / 2, -Math.PI / 2 - a, LX.amber, `${th}°`, 56);
      lxAngle(ctx, HX, WY, 36, Math.PI / 2, Math.PI / 2 - r, LX.cyan, `${Math.round((r * 180) / Math.PI)}°`, 58);
    }
    laserBody(ctx, lx0, ly0, Math.atan2(WY - ly0, HX - lx0), { len: 40 });
    // 밝은 방
    if (!dark) {
      ctx.fillStyle = "rgba(214,226,244,.20)";
      ctx.fillRect(0, 0, 346, 230);
    }
    if (phase === "prep") lxPill(ctx, dark ? "어두운 방" : "밝은 방", dark ? LX.blue : LX.gold, true);
    else lxPill(ctx, "들어간 각(노랑), 꺾인 각(파랑)", LX.gold, true, 196);
  });

  f.say("수조의 물에 레이저를 비춰요. 먼저 <b>레이저 쏘기</b>를 눌러 빛이 지나가는 길이 보이는지 확인해요.");
  api.setCTA("빛의 길이 보이게 준비해요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};

// ══════════════════════════════════════════════════════════
// 2) 컵 속의 동전
// ══════════════════════════════════════════════════════════
const CUP = { x0: 108, x1: 238, top: 104, bot: 204 };
const COIN = { x: 138, y: 200 };
const EYE = { x: 318, y: 44 };

/** 동전에서 나와 수면(ys)의 한 점에서 꺾여 눈으로 가는 빛. 그 점의 x를 이분법으로 찾는다. */
function surfacePoint(ys: number): number {
  let lo = COIN.x;
  let hi = EYE.x;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    const tw = Math.atan((m - COIN.x) / (COIN.y - ys));
    const ta = Math.atan((EYE.x - m) / (ys - EYE.y));
    if (N_WATER * Math.sin(tw) - Math.sin(ta) > 0) hi = m;
    else lo = m;
  }
  return (lo + hi) / 2;
}

const leader = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): void => {
  ctx.save();
  ctx.strokeStyle = "rgba(232,238,249,.5)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
};

export const coinLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "coin";
  host.dataset.lx = "pour";

  let level = 0; // 0~100
  let ghost = false;
  let sawVisible = false;
  let sawGhost = false;
  let asked = false;

  const range = bvRange({
    cls: "g2u3x-r",
    min: 0,
    max: 100,
    value: 0,
    label: "컵에 물 붓기",
    ticks: ["빈 컵", "가득"],
    onInput: (v) => {
      level = v;
      update();
    },
  });
  const ghostBtn = bvBtn("main", "눈이 느끼는 동전의 자리 보기");
  ghostBtn.dataset.k = "ghost";
  ghostBtn.disabled = true;
  f.slot.setControls(range.el, ghostBtn);

  const waterY = (): number => CUP.bot - 4 - (level / 100) * (CUP.bot - CUP.top - 14);
  /** 지금 물 높이에서의 빛의 길. visible이면 눈까지 간다. */
  const path = (): { px: number; py: number; visible: boolean; wallY: number } => {
    if (level < 3) {
      const wallY = COIN.y + ((CUP.x1 - COIN.x) * (EYE.y - COIN.y)) / (EYE.x - COIN.x);
      return { px: COIN.x, py: COIN.y, visible: wallY < CUP.top, wallY };
    }
    const py = waterY();
    const px = surfacePoint(py);
    const wallY = py + ((CUP.x1 - px) * (EYE.y - py)) / (EYE.x - px);
    return { px, py, visible: px < CUP.x1 && wallY < CUP.top, wallY };
  };

  function update(): void {
    if (asked) return;
    const p = path();
    host.dataset.lxSee = p.visible ? "1" : "0";
    ghostBtn.disabled = !p.visible;
    if (!p.visible) {
      ghost = false;
      f.say(level < 3 ? "동전에서 나온 빛이 <b>컵의 벽</b>에 막혀 눈에 닿지 않아요. 컵에 <b>물을 부어</b> 보세요." : "빛이 수면에서 꺾였지만 아직 벽에 막혀요. 물을 <b>더</b> 부어 보세요.");
      f.pips(sawGhost ? 2 : sawVisible ? 1 : 0);
      return;
    }
    if (!sawVisible) {
      sawVisible = true;
      haptic(HAPTIC.correct);
    }
    f.pips(sawGhost ? 2 : 1);
    if (!ghost) f.say("수면에서 꺾인 빛이 벽을 넘어 <b>눈에 들어왔어요</b>. 눈이 느끼는 동전의 자리를 확인해 보세요.");
  }
  ghostBtn.addEventListener("click", () => {
    if (asked || ghostBtn.disabled) return;
    ghost = true;
    haptic(HAPTIC.tap);
    f.say("눈은 빛이 <b>곧게</b> 온 것으로 여겨요. 그래서 동전이 실제보다 떠오른 자리에 있는 것처럼 보여요.");
    if (sawGhost) return;
    sawGhost = true;
    f.pips(2);
    asked = true;
    host.dataset.lx = "ask";
    tm.later(() => {
      f.slot.ask(
        "같은 까닭으로, 물에 담근 다리를 물 밖에서 보면 어떻게 보일까요?",
        [{ t: "실제보다 짧아 보여요", ok: true }, { t: "실제보다 길어 보여요" }, { t: "실제와 똑같이 보여요" }],
        (ok) => api.recordQuiz(ok),
        { why: "발끝도 동전처럼 <b>떠올라</b> 보여요. 그래서 다리가 짧아 보여요.", onNext: finish },
      );
    }, 2600);
  });
  function finish(): void {
    host.dataset.lx = "done";
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("물속에서 나온 빛은 물과 공기의 경계면에서 <b>꺾여</b> 눈에 들어와요. 눈은 빛이 곧게 온 것으로 여겨 물체가 <b>실제보다 떠올라</b> 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, t) => {
    const p = path();
    const wy = waterY();
    // 물
    if (level >= 3) {
      const wg = ctx.createLinearGradient(0, wy, 0, CUP.bot);
      wg.addColorStop(0, "rgba(90,160,235,.42)");
      wg.addColorStop(1, "rgba(50,110,200,.42)");
      ctx.fillStyle = wg;
      ctx.fillRect(CUP.x0, wy, CUP.x1 - CUP.x0, CUP.bot - wy);
      ctx.strokeStyle = "rgba(190,225,255,.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CUP.x0, wy);
      ctx.lineTo(CUP.x1, wy);
      ctx.stroke();
    }
    // 컵(속이 비치지 않는 컵)
    ctx.save();
    const cg = ctx.createLinearGradient(CUP.x0 - 10, 0, CUP.x0, 0);
    cg.addColorStop(0, "#7E8FAE");
    cg.addColorStop(1, "#B9C6DD");
    ctx.fillStyle = cg;
    ctx.fillRect(CUP.x0 - 10, CUP.top, 10, CUP.bot - CUP.top + 10);
    ctx.fillRect(CUP.x1, CUP.top, 10, CUP.bot - CUP.top + 10);
    ctx.fillRect(CUP.x0 - 10, CUP.bot, CUP.x1 - CUP.x0 + 20, 10);
    ctx.restore();
    // 동전
    const coin = (x: number, y: number, alpha: number): void => {
      ctx.save();
      ctx.globalAlpha = alpha;
      const g = ctx.createLinearGradient(x - 14, y - 4, x + 14, y + 4);
      g.addColorStop(0, "#F7D774");
      g.addColorStop(1, "#C99A2E");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, 14, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    coin(COIN.x, COIN.y, 1);
    lxText(ctx, "동전", CUP.x0 - 34, COIN.y, { color: LX.dim });
    leader(ctx, CUP.x0 - 18, COIN.y, COIN.x - 16, COIN.y);
    // 빛의 길
    const flow = (t / 900) % 1;
    if (p.visible) {
      drawBeam(ctx, [{ x: COIN.x, y: COIN.y - 3 }, { x: p.px, y: p.py }, { x: EYE.x - 14, y: EYE.y + 8 }], { rgb: BEAM_WHITE, flow, arrow: true });
      if (ghost) {
        // 눈에 들어온 빛을 곧게 거슬러 이은 선과, 그 위에 떠오른 동전
        const gx = COIN.x + 10;
        const gy = p.py + ((gx - p.px) * (EYE.y - p.py)) / (EYE.x - p.px);
        drawBeam(ctx, [{ x: p.px, y: p.py }, { x: gx, y: gy }], { rgb: LX.cyan, dash: [5, 5], glow: false, width: 1.6 });
        coin(gx, gy, 0.55);
        lxText(ctx, "눈이 느끼는", CUP.x0 - 50, gy - 8, { color: `rgba(${LX.cyan},1)` });
        lxText(ctx, "동전의 자리", CUP.x0 - 50, gy + 8, { color: `rgba(${LX.cyan},1)` });
        leader(ctx, CUP.x0 - 12, gy, gx - 16, gy);
      }
    } else {
      const ex = CUP.x1;
      drawBeam(ctx, [{ x: COIN.x, y: COIN.y - 3 }, { x: p.px, y: p.py }, { x: ex, y: p.wallY }], { rgb: BEAM_WHITE, flow });
      ctx.strokeStyle = LX.red;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ex - 6, p.wallY - 6);
      ctx.lineTo(ex + 6, p.wallY + 6);
      ctx.moveTo(ex + 6, p.wallY - 6);
      ctx.lineTo(ex - 6, p.wallY + 6);
      ctx.stroke();
    }
    eyeProp(ctx, EYE.x, EYE.y, Math.atan2(CUP.top - EYE.y, CUP.x1 - EYE.x), 15);
    lxText(ctx, "눈", EYE.x, EYE.y + 26, { color: LX.dim });
    lxPill(ctx, p.visible ? "동전이 보여요" : "동전이 안 보여요", p.visible ? LX.green : LX.red);
  });

  update();
  api.setCTA("물을 부어 동전을 찾아보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
