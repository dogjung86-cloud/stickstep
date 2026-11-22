// [중1 Ⅴ v5] u5l5 slopeLab: 「어느 때 더 잘 버틸까요?」
// 실험: 나무 도막은 그대로 두고 바닥 판의 재질을 바꿔(매끈한 아크릴판, 거친 고무 매트) 판을 기울인다. 이어서 무거운 물체일수록 마찰력이 큰지 끌어서 확인한다.
// 한 통찰: 맞닿은 면에서 미끄러짐을 방해하는 힘(마찰력)은 면이 거칠수록, 물체가 무거울수록 크다. 방향은 움직이려는 쪽과 반대다.
// 학생이 정하는 것: (1) 바닥 판을 고르고 판의 끝을 들어 올린다. (2) 도막 수를 고르고 힘 센서로 끈다.
// 실패하는 길: 덜 기울이면 도막이 버틴다(방해하는 힘의 화살표가 보인다). 끄는 버튼을 일찍 떼면 도막이 움직이지 않는다.
// 흐름: 예상(어느 판에서 더 버틸까) → 아크릴판 기울이기 → 고무 매트 기울이기 → 도막 1개 끌기 → 2개 끌기 → 판정 → 결론.
// 옛 랩(frictionPush)은 얼음, 나무, 모래 바닥에서 상자를 밀었다. 2026-11-22에 도막의 면을 뒤집던 판을 바닥 판을 바꾸는 판으로 바꿨다.
// 값(자체 제작): 미끄러지기 시작하는 기울기는 아크릴판 20도, 고무 매트 35도. 수평으로 눕힌 아크릴판에서 끌 때 도막 1개 3 N, 2개 6 N.
// 화살표(2026-11-15 그래픽 손질): 끌기 장면의 끄는 힘(줄을 맨 아래 도막 오른쪽 면에서)과 방해하는 힘(맞닿은 면에서)은 같은 식(1 N에 PPX px)이라
//   꼼짝 않는 동안 늘 같은 길이다. 기울이기 장면의 방해하는 힘은 0에서 자라 기울기의 sin에 비례한다(빗면 아래로 미끄러지려는 힘과 같은 크기).
//   첫 판이 미끄러진 기울기는 옅은 판 그림자와 이름표로 남아 둘째 판을 기울일 때 두 기울기를 한 무대에서 비교한다.
//   고무 매트는 짙은 회색 판에 오돌토돌한 돌기, 아크릴판은 밝고 투명한 판에 흰 광택 줄로 그린다(한눈에 거친 판과 매끈한 판으로 보이게).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCapture, bvCard, bvCards, bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Arrow, u5Canvas, u5Frame, u5Hold, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
type Face = "acrylic" | "rubber";
const SLIP: Record<Face, number> = { acrylic: 20, rubber: 35 };
const NAME: Record<Face, string> = { acrylic: "아크릴판", rubber: "고무 매트" };
const LEN = 250; // 바닥 판의 길이(px)
const PULL = [0, 3, 6]; // 도막 수에 따라 움직이기 시작하는 힘(N)
const PPX = 9; // 끌기 장면의 두 화살표: 1 N에 9px(덧붙이는 길이 없이)
const TPX = 100; // 기울이기 장면의 방해하는 힘: 길이 = TPX × sin(기울기)(20도 34px, 35도 57px)

export const slopeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  let scene: "tilt" | "pull" = "tilt";
  let ready = false;
  // 기울이기
  let face: Face = "acrylic";
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

  const cAcr = bvCard("u5x-f", { name: "아크릴판", sub: "매끈한 판", key: "acrylic" });
  const cRub = bvCard("u5x-f", { name: "고무 매트", sub: "거친 판", key: "rubber" });
  const note = el("div", { class: "u5x-sum tall" });
  const paintTilt = (): void => {
    cAcr.on(face === "acrylic");
    cRub.on(face === "rubber");
    if (tilt.acrylic !== undefined) cAcr.sub(`${tilt.acrylic}도에서 미끄러짐`);
    if (tilt.rubber !== undefined) cRub.sub(`${tilt.rubber}도에서 미끄러짐`);
    note.innerHTML = sliding
      ? `<b>${SLIP[face]}도</b>에서 도막이 미끄러졌어요.`
      : ang < 1
        ? "판의 <b>오른쪽 끝</b>(동그란 손잡이)을 위로 끌어 올려요.<br>도막이 미끄러지기 시작하는 기울기를 찾아요."
        : `기울기 <b>${Math.round(ang)}도</b>. 두 힘이 비겨 아직 버텨요.<br>빨간 화살표가 미끄러짐을 방해하는 힘이에요.`;
  };
  const setFace = (k: Face): void => {
    if (busy || sliding || dragging || k === face || !ready) return;
    haptic(HAPTIC.tap);
    face = k;
    ang = 0;
    slide = 0;
    paintTilt();
  };
  cAcr.el.addEventListener("click", () => setFace("acrylic"));
  cRub.el.addEventListener("click", () => setFace("rubber"));

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
      (face === "acrylic" ? cAcr : cRub).done();
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
    const n = Number(tilt.acrylic !== undefined) + Number(tilt.rubber !== undefined);
    f.pips(n);
    if (n === 2) {
      busy = true;
      f.say(`거친 <b>고무 매트(${SLIP.rubber}도)</b> 위에서 매끈한 <b>아크릴판(${SLIP.acrylic}도)</b>보다 훨씬 더 잘 버텼어요!`);
      tm.later(toPull, 2400);
    } else {
      f.say(`기록 완료! 이번에는 <b>${tilt.acrylic === undefined ? NAME.acrylic : NAME.rubber}</b> 카드를 고른 뒤 다시 기울여 보세요.`);
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
    f.say("이번엔 평평하게 눕힌 <b>아크릴판</b> 위에서 <b>도막 1개</b>와 <b>2개</b>를 끌어 봐요. <b>꾹 눌러 끌기</b>를 움직일 때까지 눌러 보세요.");
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
        f.say(`도막을 2개로 쌓아 무거워지니 움직이는 데 드는 힘도 <b>${PULL[1]} N에서 ${PULL[2]} N으로 2배</b>가 됐어요!`);
        tm.later(askFinal, 1800);
      } else f.say(`기록했어요. 이번에는 <b>도막 ${pulled[1] ? 2 : 1}개</b>로 바꿔 끌어 보세요.`);
    }, 1400);
  }

  function askFinal(): void {
    f.slot.ask(
      "도막을 끌 때 힘이 가장 많이 드는 경우는?",
      [{ t: "고무 매트 위에서, 도막 2개", ok: true }, { t: "아크릴판 위에서, 도막 2개" }, { t: "고무 매트 위에서, 도막 1개" }],
      (ok) => api.recordQuiz(ok),
      { why: "바닥 판이 <b>거칠수록</b>, 도막이 <b>무거울수록</b> 방해하는 힘이 컸어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("바닥의 거칠기와 물체의 무게에 따라 미끄러짐을 막는 힘이 어떻게 달라지는지 밝혔어요!");
    f.slot.conclude("맞닿은 면이 <b>거칠수록</b>, 물체가 <b>무거울수록</b> 미끄러짐을 방해하는 힘이 커요. 이 힘은 움직이려는 쪽과 <b>반대</b>로 작용해요.");
    api.enableCTA(s.cta ?? "다음");
  }

  // 나무 도막(어느 장면에서나 같은 도막, 아랫면은 나무 면)
  const block = (ctx: CanvasRenderingContext2D, x: number, y: number, bw: number, bh: number): void => {
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
    ctx.fillStyle = "#F0D6AE";
    ctx.fillRect(x - bw / 2, y - 5, bw, 5);
  };
  // 바닥 판(두께 9, 윗면이 y = -9). 아크릴판은 밝고 투명한 판에 흰 광택 줄, 고무 매트는 짙은 판에 오돌토돌한 돌기
  const plank = (ctx: CanvasRenderingContext2D, x0: number, len: number, kind: Face, ghost = false): void => {
    if (ghost) {
      ctx.fillStyle = kind === "rubber" ? "rgba(120,128,140,.18)" : "rgba(190,226,244,.16)";
      ctx.strokeStyle = kind === "rubber" ? "rgba(170,178,190,.6)" : "rgba(200,232,248,.6)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.roundRect(x0, -9, len, 9, 3);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }
    const g = ctx.createLinearGradient(0, -9, 0, 0);
    if (kind === "rubber") {
      g.addColorStop(0, "#4A505A");
      g.addColorStop(1, "#24282E");
    } else {
      g.addColorStop(0, "#E4F3FB");
      g.addColorStop(1, "#9CC7DE");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(x0, -9, len, 9, 3);
    ctx.fill();
    if (kind === "rubber") {
      // 윗면의 돌기(같은 간격, 한눈에 거친 면으로 보이게)
      ctx.fillStyle = "#5C636E";
      for (let x = x0 + 4; x < x0 + len - 2; x += 7) {
        ctx.beginPath();
        ctx.arc(x, -9, 2, Math.PI, 0);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x0 + 6, -6.5);
      ctx.lineTo(x0 + len - 6, -6.5);
      ctx.stroke();
    }
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
      // 앞서 미끄러진 면의 기울기: 옅은 판 그림자, 점선 호, 이름표로 남긴다(두 기울기를 한 무대에서 비교)
      (Object.keys(tilt) as Face[]).forEach((k) => {
        const a = tilt[k];
        if (a === undefined || (sliding && k === face)) return;
        const rg = (a * Math.PI) / 180;
        ctx.save();
        ctx.translate(P.x, P.y);
        ctx.rotate(-rg);
        plank(ctx, -6, LEN + 12, k, true);
        ctx.restore();
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = "rgba(240,164,34,.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(P.x, P.y, 70, -rg, 0);
        ctx.stroke();
        ctx.restore();
        const gx = P.x + Math.cos(rg) * LEN;
        const gy2 = P.y - Math.sin(rg) * LEN;
        // 이름표는 옅은 판의 끝 아래(지금 기울이는 판과 겹치지 않게)
        u5Text(ctx, `${NAME[k]} ${a}도`, gx - 2, gy2 + 22, { color: "#F5C76E", px: 12.5 });
      });
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
      plank(ctx, -6, LEN + 12, face);
      const bx = 176 - slide * 130;
      block(ctx, bx, -9, 46, 28);
      // 미끄러지려는 힘(파랑, 빗면 아래쪽)과 방해하는 힘(빨강, 맞닿은 면에서 빗면 위쪽)
      if (ang > 1) {
        const L = TPX * Math.sin(r);
        u5Arrow(ctx, bx - 23, -23, -L, 0, { color: U5.push, width: 4 });
        u5Arrow(ctx, bx, -9, sliding ? L * 0.76 : L, 0, { color: U5.back, width: 4 });
        if (!sliding && ang >= 8) {
          u5Text(ctx, "미끄러지려는 힘", bx - 23 - L / 2, -40, { color: "#B5D4FF", px: 12 });
          u5Text(ctx, "방해하는 힘", bx + L / 2, 13, { color: "#FFD9D9", px: 12 });
        }
      }
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
      u5Pill(ctx, sliding ? "미끄러져요" : `${NAME[face]} 위`, sliding ? U5.up : U5.gold);
    } else {
      // 눕힌 아크릴판 위에서 힘 센서로 끈다
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
      plank(ctx, 0, w - 40, "acrylic");
      ctx.restore();
      const bx = 96 + moved;
      for (let i = 0; i < blocks; i++) block(ctx, bx, gy - 9 - i * 28, 46, 28);
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
        // 두 힘은 같은 식(1 N에 PPX px)이라 꼼짝 않는 동안, 그리고 일정한 빠르기로 끌리는 동안 늘 같은 길이다
        const L = shown * PPX;
        // 끄는 힘: 줄을 맨 자리(아래 도막 오른쪽 면)에서 줄을 따라 오른쪽으로
        u5Arrow(ctx, bx + 23, gy - 23, L, 0, { color: U5.push, width: 4 });
        u5Text(ctx, "끄는 힘", bx + 23 + (46 + shown * 3) / 2, gy - 38, { color: "#B5D4FF", px: 12 });
        // 방해하는 힘: 맞닿은 면(아래 도막 아랫면 가운데)에서 왼쪽으로
        u5Arrow(ctx, bx, gy - 9, -L, 0, { color: U5.back, width: 4 });
        u5Text(ctx, "방해하는 힘", bx - L / 2, gy + 14, { color: "#FFD9D9", px: 12 });
      }
      u5Read(ctx, w, shown.toFixed(1), "N", "힘 센서");
      u5Pill(ctx, pulling ? `${need} N에서 움직였어요` : force > 0.1 ? "아직 꼼짝 않아요" : `도막 ${blocks}개`, pulling ? U5.up : U5.gold);
    }
  });

  // 시작: 예상부터(정오를 매기지 않는다)
  paintTilt();
  f.slot.setControls(bvCards(2, cAcr, cRub), note);
  f.say("나무 도막은 그대로 두고 <b>바닥 판</b>만 바꿔 기울여 볼게요. 판을 기울이기 전에 먼저 예상해 볼까요?");
  f.slot.ask(
    "어느 판 위에서 판을 더 많이 기울여야 도막이 미끄러질까요?",
    [{ t: "거친 고무 매트" }, { t: "매끈한 아크릴판" }, { t: "둘이 똑같아요" }],
    () => undefined,
    {
      predict: true,
      onNext: () => {
        f.slot.showControls();
        ready = true;
        f.say("직접 확인해 봐요! 판의 <b>오른쪽 끝 손잡이</b>를 위로 끌어 올려 미끄러지는 각도를 찾아보세요.");
      },
    },
  );
  api.setCTA("두 판에서 기울기를 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
