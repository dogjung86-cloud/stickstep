// [중2 Ⅲ v5] g2u3l4 평면거울에서 상이 생기는 원리: 랩 두 판.
//
// 1) g2u3HalfMirrorLab 「거울 속 상은 어디에 있을까요?」
//    책의 어디에서: 해 보기 '평면거울에 의한 상의 특징 관찰하기'(모눈종이에 기준선을 긋고 반투명 평면거울을 세운다. 거울 앞에 물체 (가)를 놓고
//    거울 뒤 상의 자리에 크기와 모양이 같은 물체 (나)를 세워 거리와 크기를 견준다).
//    학생이 정하는 것: 세울 거울(보통 거울, 반투명 거울), (가)의 자리, (나)를 놓는 자리, 확인할 때.
//    실패하는 길: 보통 거울을 세우면 거울 뒤가 보이지 않아 (나)를 상에 맞출 수 없다. 어긋난 채 확인하면 상과 (나)가 따로 보인다.
//    한 통찰: 평면거울의 상은 거울 뒤에, 물체와 같은 거리에, 같은 크기로 생긴다. 무대는 모눈종이를 위에서 내려다본 그림이다.
//    옛 랩(mirrorImageLab)은 모눈 위에서 광선을 작도했다. 반투명 거울로 상의 자리를 찾는 실험은 없었다.
//
// 2) g2u3ExtendLab 「상은 왜 거울 뒤에 보일까요?」
//    책의 어디에서: 그림 Ⅲ-6(물체에서 나온 빛이 거울에서 반사하고, 눈으로 들어온 빛의 연장선이 거울 뒤 한 점에서 만난다).
//    학생이 정하는 것: 눈의 자리(서로 다른 세 곳)와 연장선을 남길 때.
//    한 통찰: 눈을 어디에 두어도 반사한 빛을 거슬러 이은 선은 거울 뒤의 같은 점을 지난다. 눈은 그 점에서 빛이 나온 것으로 느낀다.
//    반사점은 계산으로 구한다(상의 자리와 눈을 이은 직선이 거울과 만나는 점. 반사 법칙과 같은 말이다).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { BEAM_WHITE, drawBeam, eyeProp, mirrorProp } from "../../../ui/lightKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { LX, lxCanvas, lxFrame, lxPill, lxSeg, lxText } from "./lxKit";

interface S {
  title: string;
  cta?: string;
}

// ══════════════════════════════════════════════════════════
// 1) 모눈종이와 반투명 거울
// ══════════════════════════════════════════════════════════
const CELL = 22;
const MX = 173; // 기준선(거울)
const ROW = 126; // 물체를 놓는 줄
const PAPER = { x: 19, y: 38, w: 308, h: 176 };
type Mirror = "none" | "plain" | "half";

export const halfMirrorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "half";
  host.dataset.lx = "pick";

  let mirror: Mirror = "none";
  let da = 3; // (가): 거울 앞 몇 칸
  let db = 6; // (나): 거울 뒤 몇 칸
  let checked: "" | "ok" | "off" | "blind" = "";
  let end = false;
  const recs: number[] = [];

  const seg = lxSeg<"plain" | "half">(
    [
      { k: "plain", t: "보통 거울", sub: "뒤가 비치지 않아요" },
      { k: "half", t: "반투명 거울", sub: "뒤가 비쳐 보여요" },
    ],
    "plain",
    (k) => {
      if (end) return;
      mirror = k;
      checked = "";
      haptic(HAPTIC.tap);
      host.dataset.lx = "place";
      f.say(k === "plain" ? "보통 거울을 세웠어요. 거울 속에 (가)의 상이 보여요. <b>(나)</b>를 상의 자리로 옮기고 확인해 보세요." : "반투명 거울은 상도 보이고 거울 뒤도 비쳐요. <b>(나)</b>를 옮겨 상에 꼭 겹치게 하고 확인해 보세요.");
      sync();
    },
    "low",
  );
  seg.btns.plain.classList.remove("on");

  const stepper = (label: string, key: string, onMove: (d: number) => void): HTMLElement => {
    const mk = (t: string, d: number, k: string): HTMLButtonElement => {
      const b = el("button", { class: "g2u3x-stepb", text: t, attrs: { type: "button", "aria-label": `${label} ${d < 0 ? "왼쪽으로" : "오른쪽으로"}` } }) as HTMLButtonElement;
      b.dataset.k = k;
      b.addEventListener("click", () => {
        if (end || mirror === "none") return;
        haptic(HAPTIC.tap);
        checked = "";
        onMove(d);
        sync();
      });
      return b;
    };
    return el("div", { class: "g2u3x-stepper" }, mk("←", -1, `${key}L`), el("span", { text: label }), mk("→", 1, `${key}R`));
  };
  // (가)는 거울의 왼쪽에 있다: 오른쪽 화살표가 거울 쪽. (나)는 오른쪽에 있다: 왼쪽 화살표가 거울 쪽.
  const stepA = stepper("물체 (가)", "a", (d) => (da = Math.max(2, Math.min(6, da - d))));
  const stepB = stepper("물체 (나)", "b", (d) => (db = Math.max(1, Math.min(6, db + d))));
  const confirm = bvBtn("main", "겹쳤는지 확인하기");
  confirm.dataset.k = "confirm";
  f.slot.setControls(seg.el, el("div", { class: "g2u3x-row2" }, stepA, stepB), confirm);

  function sync(): void {
    confirm.disabled = mirror === "none" || end;
    host.dataset.lxA = String(da);
    host.dataset.lxB = String(db);
  }

  confirm.addEventListener("click", () => {
    if (end || mirror === "none") return;
    if (mirror === "plain") {
      checked = "blind";
      haptic(HAPTIC.wrong);
      f.say("보통 거울은 뒤가 보이지 않아 (나)가 상과 겹쳤는지 <b>알 수 없어요</b>. 다른 거울을 세워 보세요.");
      return;
    }
    if (db !== da) {
      checked = "off";
      haptic(HAPTIC.wrong);
      f.say(`어긋났어요. 상과 (나)가 <b>따로</b> 보여요. (나)를 ${db > da ? "거울 쪽으로" : "거울에서 멀리"} 옮겨 꼭 겹쳐 보세요.`);
      return;
    }
    if (recs.includes(da)) {
      checked = "ok";
      haptic(HAPTIC.wrong);
      f.say("이미 기록한 자리예요. <b>(가)</b>를 다른 칸으로 옮기고 다시 상을 찾아보세요.");
      return;
    }
    checked = "ok";
    recs.push(da);
    haptic(HAPTIC.correct);
    f.pips(recs.length);
    if (recs.length < 2) {
      f.say(`꼭 겹쳤어요. 거울 앞 <b>${da}칸</b>, 거울 뒤 <b>${da}칸</b>이고 크기도 같아요. (가)를 옮겨 한 번 더 해 보세요.`);
      return;
    }
    end = true;
    sync();
    f.say(`이번에도 앞 ${da}칸, 뒤 ${da}칸에서 꼭 겹쳤어요. 두 기록을 견줘 봐요.`);
    host.dataset.lx = "ask";
    tm.later(() => {
      f.slot.ask(
        "평면거울 앞 8칸에 물체를 놓으면 상은 어디에 생길까요?",
        [{ t: "거울 뒤 8칸", ok: true }, { t: "거울 뒤 4칸" }, { t: "거울 뒤 16칸" }],
        (ok) => api.recordQuiz(ok),
        { why: "두 번 모두 거울 앞의 칸 수와 거울 뒤의 칸 수가 <b>같았어요</b>.", onNext: finish },
      );
    }, 1700);
  });
  function finish(): void {
    host.dataset.lx = "done";
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("평면거울의 상은 <b>거울 뒤</b>에, 거울에서 물체까지와 <b>같은 거리</b>에, 물체와 <b>같은 크기</b>로 생겨요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const disc = (ctx: CanvasRenderingContext2D, x: number, color: string, label: string, alpha = 1, dash = false): void => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, ROW, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = dash ? color : "#1B2B45";
    ctx.lineWidth = 2;
    if (dash) ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(x, ROW, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    if (label) lxText(ctx, label, x, ROW - 24, { px: 13, w: 800, color: "#1B2B45", plain: true });
  };
  const span = (ctx: CanvasRenderingContext2D, x0: number, x1: number, n: number): void => {
    const y = ROW + 24;
    ctx.save();
    ctx.strokeStyle = "#3182F6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.moveTo(x0, y - 5);
    ctx.lineTo(x0, y + 5);
    ctx.moveTo(x1, y - 5);
    ctx.lineTo(x1, y + 5);
    ctx.stroke();
    ctx.restore();
    lxText(ctx, `${n}칸`, (x0 + x1) / 2, y + 13, { px: 13, w: 800, color: "#1B64DA", plain: true });
  };

  st.run((ctx) => {
    // 모눈종이(위에서 내려다본 모습)
    ctx.fillStyle = "#F4F6FA";
    ctx.beginPath();
    ctx.roundRect(PAPER.x, PAPER.y, PAPER.w, PAPER.h, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(49,130,246,.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = MX - 7 * CELL; x <= MX + 7 * CELL; x += CELL) {
      ctx.moveTo(x, PAPER.y);
      ctx.lineTo(x, PAPER.y + PAPER.h);
    }
    for (let y = ROW - 4 * CELL; y <= ROW + 4 * CELL; y += CELL) {
      if (y < PAPER.y || y > PAPER.y + PAPER.h) continue;
      ctx.moveTo(PAPER.x, y);
      ctx.lineTo(PAPER.x + PAPER.w, y);
    }
    ctx.stroke();
    const ax = MX - da * CELL;
    const bx = MX + db * CELL;
    const ix = MX + da * CELL;
    // 거울 뒤의 물체 (나)
    disc(ctx, bx, "#4DABF7", mirror === "half" && db === da ? "" : "(나)");
    if (mirror === "plain") {
      // 보통 거울: 뒤쪽은 가려 보이지 않는다
      ctx.fillStyle = "rgba(11,21,36,.96)";
      ctx.fillRect(MX, PAPER.y, PAPER.x + PAPER.w - MX, PAPER.h);
      lxText(ctx, "거울에 가려", MX + 78, PAPER.y + 34, { color: LX.dim });
      lxText(ctx, "보이지 않아요", MX + 78, PAPER.y + 52, { color: LX.dim });
    }
    // 상(거울 속에 보이는 (가)의 모습)
    const over = mirror === "half" && db === da;
    if (mirror !== "none") disc(ctx, ix, "#FF8787", over ? "" : "상", 0.4, true);
    if (over) lxText(ctx, "(나)와 상", ix, ROW - 24, { px: 13, w: 800, color: "#1B2B45", plain: true });
    // 물체 (가)
    disc(ctx, ax, "#FF6B6B", "(가)");
    // 거울
    if (mirror === "plain") mirrorProp(ctx, MX, PAPER.y - 4, MX, PAPER.y + PAPER.h + 4, { back: -1 });
    else if (mirror === "half") {
      ctx.save();
      ctx.strokeStyle = "rgba(120,200,255,.95)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(MX, PAPER.y - 4);
      ctx.lineTo(MX, PAPER.y + PAPER.h + 4);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = "#8B95A1";
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(MX, PAPER.y);
      ctx.lineTo(MX, PAPER.y + PAPER.h);
      ctx.stroke();
      ctx.restore();
    }
    lxText(ctx, mirror === "none" ? "가운데 점선: 기준선" : mirror === "half" ? "세운 거울: 반투명 거울" : "세운 거울: 보통 거울", 334, 22, { color: LX.ink, align: "right" });
    lxText(ctx, "거울 앞", PAPER.x + 30, PAPER.y + 14, { color: "#4E5968", plain: true });
    if (mirror !== "plain") lxText(ctx, "거울 뒤", PAPER.x + PAPER.w - 30, PAPER.y + 14, { color: "#4E5968", plain: true });
    // 확인 결과
    if (checked === "ok") {
      span(ctx, ax, MX, da);
      span(ctx, MX, ix, da);
      lxPill(ctx, "상과 (나)가 꼭 겹쳤어요", LX.green);
    } else if (checked === "off") lxPill(ctx, "상과 (나)가 어긋났어요", LX.red);
    else if (checked === "blind") lxPill(ctx, "(나)가 보이지 않아요", LX.red);
    // 기록
    recs.forEach((d, i) => lxText(ctx, `기록 ${i + 1}: 앞 ${d}칸, 뒤 ${d}칸`, PAPER.x + PAPER.w - 8, PAPER.y + PAPER.h - 10 - (recs.length - 1 - i) * 16, { align: "right", color: "#1B2B45", px: 12.5, plain: true }));
  });

  sync();
  f.say("모눈종이를 위에서 내려다본 모습이에요. 먼저 <b>기준선에 세울 거울</b>을 골라 보세요.");
  api.setCTA("상의 자리를 두 번 찾아보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};

// ══════════════════════════════════════════════════════════
// 2) 반사한 빛의 연장선
// ══════════════════════════════════════════════════════════
const EM = { x: 196 }; // 거울(세로)
const OBJ = { x: 116, y: 62 };
const IMG = { x: EM.x * 2 - OBJ.x, y: OBJ.y };
const EYE_X = 76;

export const extendLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "extend";
  host.dataset.lx = "look";

  let ey = 150;
  const kept: number[] = [];
  let end = false;

  const range = bvRange({
    cls: "g2u3x-r",
    min: 104,
    max: 208,
    value: ey,
    label: "눈의 자리 옮기기",
    onInput: (v) => {
      ey = v;
    },
  });
  const keep = bvBtn("main", "반사한 빛의 연장선 남기기");
  keep.dataset.k = "keep";
  f.slot.setControls(range.el, keep);

  const hitY = (y: number): number => IMG.y + ((y - IMG.y) * (EM.x - IMG.x)) / (EYE_X - IMG.x);

  keep.addEventListener("click", () => {
    if (end) return;
    if (kept.some((y) => Math.abs(y - ey) < 16)) {
      haptic(HAPTIC.wrong);
      f.say("그 자리의 연장선은 이미 남겼어요. <b>눈의 자리</b>를 더 옮긴 뒤 남겨 보세요.");
      return;
    }
    kept.push(ey);
    haptic(HAPTIC.correct);
    f.pips(kept.length);
    if (kept.length < 3) {
      f.say(`연장선을 남겼어요. 눈을 다른 자리로 옮겨 <b>${3 - kept.length}번</b> 더 남겨 보세요.`);
      return;
    }
    end = true;
    keep.disabled = true;
    host.dataset.lx = "ask";
    f.say("눈을 어디에 두어도 연장선은 거울 뒤의 <b>한 점</b>을 지나요. 거울까지의 거리도 견줘 보세요.");
    tm.later(() => {
      f.slot.ask(
        "거울에서 반사한 빛을 본 눈은 그 빛이 어디에서 나온 것으로 느낄까요?",
        [{ t: "거울 뒤, 연장선이 만난 점", ok: true }, { t: "거울 면 위, 빛이 반사한 점" }, { t: "거울 앞, 눈과 물체의 가운데" }],
        (ok) => api.recordQuiz(ok),
        { why: "눈은 빛이 <b>곧게</b> 온 것으로 여겨요. 그래서 연장선이 만난 점에 상이 보여요.", onNext: finish },
      );
    }, 2600);
  });
  function finish(): void {
    host.dataset.lx = "done";
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("거울에서 반사한 빛을 거슬러 곧게 이으면 <b>거울 뒤의 한 점</b>에서 만나요. 눈은 그 점에서 빛이 나온 것으로 느끼고, 그곳에 상이 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, t) => {
    // 옅은 모눈(한 칸 20)
    ctx.strokeStyle = "rgba(160,190,235,.10)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = EM.x - 180; x <= EM.x + 140; x += 20) {
      ctx.moveTo(x, 22);
      ctx.lineTo(x, 222);
    }
    for (let y = 22; y <= 222; y += 20) {
      ctx.moveTo(16, y);
      ctx.lineTo(336, y);
    }
    ctx.stroke();
    // 거울 뒤쪽 바탕
    ctx.fillStyle = "rgba(120,150,200,.07)";
    ctx.fillRect(EM.x, 22, 140, 200);
    mirrorProp(ctx, EM.x, 26, EM.x, 218, { back: -1 });
    lxText(ctx, "거울", EM.x, 14, { color: LX.dim });
    lxText(ctx, "거울 뒤", EM.x + 96, 208, { color: LX.dim });
    // 남긴 연장선
    kept.forEach((y) => {
      const hy = hitY(y);
      const ex = EM.x + 130;
      const eyy = hy + ((ex - EM.x) * (IMG.y - hy)) / (IMG.x - EM.x);
      drawBeam(ctx, [{ x: EM.x, y: hy }, { x: ex, y: eyy }], { rgb: LX.cyan, dash: [5, 5], glow: false, width: 1.5 });
      ctx.fillStyle = "rgba(232,238,249,.55)";
      ctx.beginPath();
      ctx.arc(EYE_X, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    // 지금의 빛: 물체 → 거울 → 눈
    const hy = hitY(ey);
    drawBeam(ctx, [{ x: OBJ.x, y: OBJ.y }, { x: EM.x, y: hy }, { x: EYE_X + 14, y: ey - (14 * (ey - hy)) / (EM.x - EYE_X) }], { rgb: BEAM_WHITE, flow: (t / 900) % 1, arrow: true });
    // 물체
    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    ctx.arc(OBJ.x, OBJ.y, 10, 0, Math.PI * 2);
    ctx.fill();
    lxText(ctx, "물체", OBJ.x - 30, OBJ.y, { color: LX.ink });
    eyeProp(ctx, EYE_X, ey, Math.atan2(hy - ey, EM.x - EYE_X), 14);
    lxText(ctx, "눈", EYE_X - 24, ey, { color: LX.dim });
    // 만난 점(상)
    if (kept.length >= 3) {
      const p = 0.5 + 0.5 * Math.sin(t / 220);
      ctx.fillStyle = "rgba(255,135,135,.5)";
      ctx.beginPath();
      ctx.arc(IMG.x, IMG.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(126,214,255,${0.5 + 0.4 * p})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(IMG.x, IMG.y, 14 + p * 3, 0, Math.PI * 2);
      ctx.stroke();
      lxText(ctx, "상", IMG.x + 26, IMG.y, { color: `rgba(${LX.cyan},1)`, px: 13, w: 800 });
      // 거리(한 칸 20)
      const n = Math.round((EM.x - OBJ.x) / 20);
      const y = OBJ.y - 22;
      ctx.strokeStyle = "#4DABF7";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(OBJ.x, y);
      ctx.lineTo(IMG.x, y);
      [OBJ.x, EM.x, IMG.x].forEach((x) => {
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
      });
      ctx.stroke();
      lxText(ctx, `${n}칸`, (OBJ.x + EM.x) / 2, y - 12, { color: "#B5D4FF", w: 800 });
      lxText(ctx, `${n}칸`, (IMG.x + EM.x) / 2, y - 12, { color: "#B5D4FF", w: 800 });
    }
    lxPill(ctx, `연장선 ${kept.length}/3`, LX.gold);
  });

  f.say("물체에서 나온 빛이 거울에서 반사해 눈에 들어와요. <b>눈의 자리</b>를 옮기고 반사한 빛의 연장선을 남겨 보세요.");
  api.setCTA("연장선을 세 번 남겨 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
