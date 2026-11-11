// [중1 Ⅴ v5] u5l5 slopeLab: 「어느 때 더 잘 버틸까요?」
// 책의 어디에서: 해 보기 '마찰력 알아보기'(긴 나무판 위에 나무 도막을 나무 면, 사포 면이 아래로 가게 놓고 나무판을 기울인다)와
//               '무거운 물체를 움직이게 할 때 마찰력이 크다'는 그림.
// 한 통찰: 맞닿은 면에서 미끄러짐을 방해하는 힘(마찰력)은 면이 거칠수록, 물체가 무거울수록 크다. 방향은 움직이려는 쪽과 반대다.
// 학생이 정하는 것: (1) 아래로 가는 면을 고르고 나무판의 끝을 들어 올린다. (2) 도막 수를 고르고 힘 센서로 끈다.
// 실패하는 길: 덜 기울이면 도막이 버틴다(방해하는 힘의 화살표가 보인다). 끄는 버튼을 일찍 떼면 도막이 움직이지 않는다.
// 흐름: 예상(어느 면이 더 버틸까) → 나무 면 기울이기 → 사포 면 기울이기 → 도막 1개 끌기 → 2개 끌기 → 판정 → 결론.
// 옛 랩(frictionPush)은 얼음, 나무, 모래 바닥에서 상자를 밀었다. 여기서는 책의 기울이기 실험을 그대로 한다.
// 값(자체 제작): 미끄러지기 시작하는 기울기는 나무 면 20도, 사포 면 35도. 수평에서 끌 때 도막 1개 3 N, 2개 6 N.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawForceArrow } from "../../../ui/forceProps";
import type { StepRenderer } from "../../types";
import { bvCapture, bvCard, bvCards, bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Canvas, u5Frame, u5Hold, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
type Face = "wood" | "sand";
const SLIP: Record<Face, number> = { wood: 20, sand: 35 };
const LEN = 250; // 나무판의 길이(px)
const PULL = [0, 3, 6]; // 도막 수에 따라 움직이기 시작하는 힘(N)

export const slopeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  let scene: "tilt" | "pull" = "tilt";
  let ready = false;
  // 기울이기
  let face: Face = "wood";
  let ang = 0; // 도
  let dragging = false;
  let slide = 0; // 0 제자리 ~ 1 끝까지 미끄러짐
  let sliding = false;
  const tilt: Partial<Record<Face, number>> = {};
  // 끌기
  let blocks = 1;
  let force = 0;
  let held = false;
  let moved = 0;
  let pulling = false;
  const pulled: Record<number, boolean> = {};
  let busy = false;
  let finished = false;

  const cWood = bvCard("u5x-f", { name: "나무 면을 아래로", sub: "매끈한 면", key: "wood" });
  const cSand = bvCard("u5x-f", { name: "사포 면을 아래로", sub: "거친 면", key: "sand" });
  const note = el("div", { class: "u5x-sum tall" });
  const paintTilt = (): void => {
    cWood.on(face === "wood");
    cSand.on(face === "sand");
    if (tilt.wood !== undefined) cWood.sub(`${tilt.wood}도에서 미끄러짐`);
    if (tilt.sand !== undefined) cSand.sub(`${tilt.sand}도에서 미끄러짐`);
    note.innerHTML = sliding
      ? `<b>${SLIP[face]}도</b>에서 도막이 미끄러졌어요.`
      : ang < 1
        ? "나무판의 <b>오른쪽 끝</b>(동그란 손잡이)을 위로 끌어 올려요.<br>도막이 미끄러지기 시작하는 기울기를 찾아요."
        : `기울기 <b>${Math.round(ang)}도</b>. 도막이 아직 버텨요.<br>빨간 화살표가 미끄러짐을 방해하는 힘이에요.`;
  };
  const setFace = (k: Face): void => {
    if (busy || sliding || dragging || k === face || !ready) return;
    haptic(HAPTIC.tap);
    face = k;
    ang = 0;
    slide = 0;
    paintTilt();
  };
  cWood.el.addEventListener("click", () => setFace("wood"));
  cSand.el.addEventListener("click", () => setFace("sand"));

  const pivot = (): { x: number; y: number } => ({ x: 34, y: st.h() - 30 });
  st.cv.addEventListener("pointerdown", (e) => {
    if (scene !== "tilt" || !ready || sliding || busy) return;
    const p = st.pt(e);
    const P = pivot();
    const r = (ang * Math.PI) / 180;
    if (Math.hypot(p.x - (P.x + Math.cos(r) * LEN), p.y - (P.y - Math.sin(r) * LEN)) > 64) return;
    bvCapture(st.cv, e.pointerId);
    dragging = true;
    haptic(HAPTIC.tap);
  });
  st.cv.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const p = st.pt(e);
    const P = pivot();
    ang = clamp((Math.atan2(P.y - p.y, p.x - P.x) * 180) / Math.PI, 0, 42);
    if (ang >= SLIP[face]) {
      // 미끄러지기 시작
      ang = SLIP[face];
      dragging = false;
      sliding = true;
      haptic(HAPTIC.correct);
      tilt[face] = SLIP[face];
      (face === "wood" ? cWood : cSand).done();
      paintTilt();
      const t0 = performance.now();
      const tick = (): void => {
        const k = Math.min(1, (performance.now() - t0) / 800);
        slide = k * k;
        if (k < 1) tm.later(tick, 16);
        else tm.later(afterSlide, 900);
      };
      tick();
      return;
    }
    paintTilt();
  });
  const up = (): void => {
    dragging = false;
  };
  st.cv.addEventListener("pointerup", up);
  st.cv.addEventListener("pointercancel", up);

  function afterSlide(): void {
    sliding = false;
    slide = 0;
    ang = 0;
    const n = Number(tilt.wood !== undefined) + Number(tilt.sand !== undefined);
    f.pips(n);
    if (n === 2) {
      busy = true;
      f.say("거친 <b>사포 면</b>이 아래일 때 더 많이 기울여야 미끄러졌어요. 거친 면이 더 세게 붙잡아요.");
      tm.later(toPull, 2400);
    } else {
      f.say(`기록했어요. 이번에는 <b>${tilt.wood === undefined ? "나무 면" : "사포 면"}을 아래로</b> 눌러 바꾸고 다시 기울여 보세요.`);
    }
    paintTilt();
  }

  // ── 둘째 장면: 수평에서 힘 센서로 끌기 ──
  const seg1 = el("button", { class: "u5x-seg on", text: "도막 1개", attrs: { type: "button" } }) as HTMLButtonElement;
  const seg2 = el("button", { class: "u5x-seg", text: "도막 2개", attrs: { type: "button" } }) as HTMLButtonElement;
  seg1.dataset.k = "1";
  seg2.dataset.k = "2";
  const pullBtn = u5Hold("main u5x-push", "꾹 눌러 끌기", (v) => {
    if (busy || finished || scene !== "pull") return;
    held = v;
    if (!v && !pulling && force > 0) f.say("아직 안 움직였어요. 움직일 때까지 <b>더 오래</b> 눌러 끌어 보세요.");
  });
  const note2 = el("div", { class: "u5x-sum" });
  const paintPull = (): void => {
    seg1.classList.toggle("on", blocks === 1);
    seg2.classList.toggle("on", blocks === 2);
    note2.innerHTML = `도막 1개: <b>${pulled[1] ? "3 N에서 움직임" : "아직"}</b><br>도막 2개: <b>${pulled[2] ? "6 N에서 움직임" : "아직"}</b>`;
  };
  const setBlocks = (n: number): void => {
    if (busy || finished || pulling || blocks === n) return;
    haptic(HAPTIC.tap);
    blocks = n;
    force = 0;
    moved = 0;
    paintPull();
  };
  seg1.addEventListener("click", () => setBlocks(1));
  seg2.addEventListener("click", () => setBlocks(2));

  function toPull(): void {
    scene = "pull";
    busy = false;
    f.say("이번에는 나무판을 눕히고 도막을 <b>힘 센서</b>로 끌어요. 꾹 누르면 끄는 힘이 커져요. 도막 수를 바꿔 견줘 보세요.");
    paintPull();
    f.slot.setControls(el("div", { class: "u5x-segs" }, seg1, seg2), pullBtn, note2);
    api.setCTA("도막 1개와 2개를 끌어 보세요", { enabled: false });
  }
  function slipped(): void {
    pulled[blocks] = true;
    busy = true;
    held = false;
    haptic(HAPTIC.correct);
    paintPull();
    f.pips(2 + Number(!!pulled[1]) + Number(!!pulled[2]));
    tm.later(() => {
      busy = false;
      pulling = false;
      force = 0;
      moved = 0;
      if (pulled[1] && pulled[2]) {
        finished = true;
        f.say("같은 면인데 도막이 무거워지니 힘이 <b>2배</b>로 들었어요.");
        tm.later(askFinal, 1800);
      } else f.say(`기록했어요. 이번에는 <b>도막 ${pulled[1] ? 2 : 1}개</b>로 바꿔 끌어 보세요.`);
    }, 1400);
  }

  function askFinal(): void {
    f.slot.ask(
      "도막을 끌 때 힘이 가장 많이 드는 경우는?",
      [{ t: "사포 면을 아래로, 도막 2개", ok: true }, { t: "나무 면을 아래로, 도막 2개" }, { t: "사포 면을 아래로, 도막 1개" }],
      (ok) => api.recordQuiz(ok),
      { why: "면이 <b>거칠수록</b>, 도막이 <b>무거울수록</b> 방해하는 힘이 컸어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("맞닿은 면이 <b>거칠수록</b>, 물체가 <b>무거울수록</b> 미끄러짐을 방해하는 힘이 커요. 이 힘은 움직이려는 쪽과 <b>반대</b>로 작용해요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const block = (ctx: CanvasRenderingContext2D, x: number, y: number, bw: number, bh: number, bottom: Face): void => {
    const g = ctx.createLinearGradient(0, y - bh, 0, y);
    g.addColorStop(0, "#E7C08C");
    g.addColorStop(1, "#B98753");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x - bw / 2, y - bh, bw, bh, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(90,58,26,.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - bw / 2 + 5, y - bh * 0.62);
    ctx.lineTo(x + bw / 2 - 5, y - bh * 0.56);
    ctx.stroke();
    // 아래로 간 면: 사포는 어둡고 오돌토돌하게
    ctx.fillStyle = bottom === "sand" ? "#4A4136" : "#F0D6AE";
    ctx.fillRect(x - bw / 2, y - 5, bw, 5);
    if (bottom === "sand") {
      ctx.fillStyle = "#B7A48A";
      for (let i = 0; i < bw / 4; i++) ctx.fillRect(x - bw / 2 + 1 + i * 4, y - 4 + (i % 2) * 2, 1.5, 1.5);
    }
  };
  const boardGrad = (ctx: CanvasRenderingContext2D): CanvasGradient => {
    const g = ctx.createLinearGradient(0, -9, 0, 0);
    g.addColorStop(0, "#D6A66E");
    g.addColorStop(1, "#8C5F36");
    return g;
  };

  st.run((ctx, w, h, t, dt) => {
    const gy = h - 30;
    ctx.strokeStyle = "rgba(178,204,238,.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
    if (scene === "tilt") {
      const P = pivot();
      const r = (ang * Math.PI) / 180;
      const ex = P.x + Math.cos(r) * LEN;
      const ey = P.y - Math.sin(r) * LEN;
      // 들어 올린 끝을 받치는 점선과 기울기 호
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = "rgba(232,238,249,.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex, gy);
      ctx.stroke();
      ctx.setLineDash([]);
      if (ang > 1) {
        ctx.strokeStyle = U5.gold;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(P.x, P.y, 54, -r, 0);
        ctx.stroke();
        u5Text(ctx, `${Math.round(ang)}도`, P.x + 66, P.y + 15, { color: U5.gold, px: 13 });
      }
      ctx.save();
      ctx.translate(P.x, P.y);
      ctx.rotate(-r);
      ctx.fillStyle = boardGrad(ctx);
      ctx.beginPath();
      ctx.roundRect(-6, -9, LEN + 12, 9, 3);
      ctx.fill();
      const bx = 176 - slide * 130;
      block(ctx, bx, -9, 46, 28, face);
      if (ang > 1 && !sliding) drawForceArrow(ctx, bx, -9, 30 + ang * 1.3, 0, { color: U5.back, width: 4 });
      if (sliding) drawForceArrow(ctx, bx - 23, -24, -30, 0, { color: U5.dim, width: 3 });
      ctx.restore();
      // 손잡이
      const pulse = 0.5 + 0.5 * Math.sin(t / 300);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ex, ey - 4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = U5.push;
      ctx.beginPath();
      ctx.arc(ex, ey - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      if (ready && !dragging && !sliding && !busy) {
        ctx.strokeStyle = `rgba(90,162,248,${0.35 + pulse * 0.45})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex, ey - 4, 15 + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();
        if (ang < 1) u5Text(ctx, "위로 끌기", ex - 6, ey - 30, { color: U5.dim, px: 12 });
      }
      u5Read(ctx, w, String(Math.round(ang)), "도", "기울기");
      u5Pill(ctx, sliding ? "미끄러져요" : face === "wood" ? "나무 면이 아래" : "사포 면이 아래", sliding ? U5.up : U5.gold);
    } else {
      // 눕힌 나무판 위에서 힘 센서로 끈다
      const need = PULL[blocks];
      if (held && !pulling) {
        force = Math.min(need, force + (2.4 * dt) / 60);
        if (force >= need) {
          pulling = true;
          slipped();
        }
      } else if (!held && !pulling && force > 0) force = Math.max(0, force - (9 * dt) / 60);
      if (pulling && moved < 60) moved = Math.min(60, moved + 1.6 * dt);
      ctx.save();
      ctx.translate(20, gy);
      ctx.fillStyle = boardGrad(ctx);
      ctx.beginPath();
      ctx.roundRect(0, -9, w - 40, 9, 3);
      ctx.fill();
      ctx.restore();
      const bx = 96 + moved;
      for (let i = 0; i < blocks; i++) block(ctx, bx, gy - 9 - i * 28, 46, 28, "wood");
      const shown = pulling ? need : force;
      // 줄과 힘 센서(끄는 만큼 줄이 팽팽해진다)
      const sx = bx + 23 + 46 + shown * 3;
      ctx.strokeStyle = "rgba(232,238,249,.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx + 23, gy - 23);
      ctx.lineTo(sx, gy - 23);
      ctx.stroke();
      const sg = ctx.createLinearGradient(0, gy - 36, 0, gy - 10);
      sg.addColorStop(0, "#5E7FB8");
      sg.addColorStop(1, "#2E4878");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.roundRect(sx, gy - 36, 40, 26, 6);
      ctx.fill();
      ctx.fillStyle = "#7CF0B5";
      ctx.fillRect(sx + 7, gy - 25, 26 * (shown / 6), 4);
      u5Text(ctx, "힘 센서", sx + 20, gy - 48, { px: 12, color: U5.dim });
      if (shown > 0.2) {
        const ay = gy - 9 - blocks * 28 - 12;
        drawForceArrow(ctx, bx, ay, 14 + shown * 8, 0, { color: U5.push, width: 4 });
        u5Text(ctx, "끄는 힘", bx + 30, ay - 14, { color: "#B5D4FF", px: 12 });
        drawForceArrow(ctx, bx, gy - 9, -(30 + shown * 8), 0, { color: U5.back, width: 4 });
        u5Text(ctx, "방해하는 힘", bx - 30, gy + 14, { color: "#FFD9D9", px: 12 });
      }
      u5Read(ctx, w, shown.toFixed(1), "N", "힘 센서");
      u5Pill(ctx, pulling ? `${need} N에서 움직였어요` : force > 0.1 ? "아직 꼼짝 않아요" : `도막 ${blocks}개`, pulling ? U5.up : U5.gold);
    }
  });

  // 시작: 예상부터(정오를 매기지 않는다)
  paintTilt();
  f.slot.setControls(bvCards(2, cWood, cSand), note);
  f.say("나무 도막의 한 면에는 <b>사포</b>를 붙였어요. 나무판을 기울이면 도막이 미끄러져요. 먼저 예상해 봐요.");
  f.slot.ask(
    "어느 면을 아래로 놓았을 때 나무판을 더 많이 기울여야 미끄러질까요?",
    [{ t: "거친 사포 면" }, { t: "매끈한 나무 면" }, { t: "둘이 똑같아요" }],
    () => undefined,
    {
      predict: true,
      onNext: () => {
        f.slot.showControls();
        ready = true;
        f.say("확인해 봐요. 나무판의 <b>오른쪽 끝</b>을 위로 끌어 올려 도막이 미끄러지는 기울기를 찾아요.");
      },
    },
  );
  api.setCTA("두 면에서 기울기를 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
