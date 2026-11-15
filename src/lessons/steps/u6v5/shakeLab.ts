// u6ShakeLab (u6l1 둘째 랩): 「기체의 압력은 어떻게 생길까?」
// 나온 곳: 해 보기 "쇠구슬을 넣은 페트병을 흔들어 압력 느껴 보기"와 고무풍선 속 기체 입자 그림.
// 학생이 정하는 것: 쇠구슬의 개수(5개, 20개)와 흔드는 세기(가만히 ~ 세게).
// 실패하는 길: 가만히 두면 쇠구슬이 바닥에 가라앉고 손바닥이 받는 힘은 0이다(움직여 부딪혀야 힘이 생긴다).
// 차례: 1 페트병을 흔들며 손바닥이 받는 힘을 본다 → 판정(힘이 가장 컸을 때) → 2 쇠구슬을 기체 입자로 바꾼 풍선: 흔들지 않아도 입자가 스스로 움직이며
//       사방의 벽에 부딪힌다. 공기를 더 불어 넣어 본다 → 판정(어느 쪽을 미는가) → 결론.
// 손바닥이 받는 힘은 입구를 막은 손바닥에 부딪힌 횟수와 빠르기로 셈한다(꾸민 값이 아니다).
// 병은 눕힌 페트병이다(왼쪽 바닥, 몸통, 어깨, 목, 오른쪽 입구). 쇠구슬은 몸통과 어깨에서 튕기고 목을 지나 손바닥에 부딪힌다.
//   부딪힌 자리에는 번쩍임과 손바닥을 미는 짧은 화살이 잠깐 남는다(풍선 단계의 벽 번쩍임과 같은 문법).
// 옛 판(타이어 단면에 펌프 버튼)과 다른 점: 비유의 출발점이 교과서의 쇠구슬 활동이고, 학생이 개수와 세기를 정한다.
import { haptic, HAPTIC } from "../../../core/haptics";
import { GasBox, type GasBounds } from "../../../ui/gasKit";
import { bvBtn, bvCard, bvCards, bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, vbar, clamp01, ease, noteRow, HitRate, dots, drawDots, type Dot } from "./u6Kit";

// 눕힌 페트병: 몸통(X0~XB), 어깨(XB~XS), 목(XS~XM), 입구(XM). MY는 병의 가운데 높이, HB와 HN은 몸통과 목의 안쪽 반높이.
const G = { X0: 40, XB: 196, XS: 220, XM: 240, MY: 116, HB: 36, HN: 16, R: 5.5 };
const BOT: GasBounds = { x0: G.X0, y0: G.MY - G.HB, x1: G.XB, y1: G.MY + G.HB };
const halfAt = (x: number): number => (x <= G.XB ? G.HB : x <= G.XS ? G.HB + (G.HN - G.HB) * ((x - G.XB) / (G.XS - G.XB)) : G.HN);
// 어깨(비스듬한 벽)의 바깥쪽 법선(위쪽 벽 기준, 아래쪽은 y 부호를 바꾼다)
const SH_N = ((): [number, number] => {
  const dx = G.XS - G.XB;
  const dy = G.HB - G.HN;
  const L = Math.hypot(dx, dy);
  return [dy / L, -dx / L];
})();
const LV = ["가만히", "살살", "빠르게", "세게"];

export const shakeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-shake", label: "쇠구슬을 넣은 페트병과 고무풍선 속 기체 입자", wait: "페트병을 흔들어 보세요" });
  const { frame, tm } = lab;
  let phase: "beads" | "ask" | "gas" | "done" = "beads";
  // ── 쇠구슬 ──
  const box = new GasBox(1.5);
  let n = 5;
  let lv = 0;
  let wasStill = true;
  let force = 0;
  const hr = new HitRate();
  let strong = 0; // 20개를 세게 흔든 시간(프레임)
  let shaken = false;
  let noteKey = "";
  box.setCount(n, BOT);

  const c5 = bvCard("u6x-end", { name: "쇠구슬 5개", key: "5" });
  const c20 = bvCard("u6x-end", { name: "쇠구슬 20개", key: "20" });
  const range = bvRange({
    cls: "u6x-rg",
    min: 0,
    max: 3,
    value: 0,
    label: "흔드는 세기",
    ticks: ["가만히", "살살", "빠르게", "세게"],
    onInput: (v) => {
      lv = v;
      if (v > 0 && !shaken) {
        shaken = true;
        frame.say("쇠구슬이 손바닥에 부딪힐 때마다 톡톡 밀어요. <b>20개</b>를 넣고 <b>세게</b>도 흔들어 보세요.");
      }
      sync();
    },
  });
  const note = noteRow();
  frame.slot.setControls(bvCards(2, c5, c20), range.el, note.el);
  const sync = (): void => {
    c5.on(n === 5);
    c20.on(n === 20);
    host.dataset.u6N = String(n);
    host.dataset.u6Lv = String(lv);
  };
  const setN = (v: number): void => {
    if (phase !== "beads" || n === v) return;
    n = v;
    haptic(HAPTIC.tap);
    box.setCount(n, BOT);
    sync();
  };
  c5.el.addEventListener("click", () => setN(5));
  c20.el.addEventListener("click", () => setN(20));

  // ── 풍선 속 입자 ──
  let gas: Dot[] = [];
  let gn = 14;
  let R = 50;
  const sides = { 위: 0, 아래: 0, 왼쪽: 0, 오른쪽: 0 };
  const flashes: { a: number; age: number }[] = [];
  const blow = bvBtn("main", "풍선에 공기 더 불어 넣기");
  const gasNote = noteRow();
  let blown = 0;
  blow.addEventListener("click", () => {
    if (phase !== "gas" || gn >= 38) return;
    gn += 12;
    blown += 1;
    haptic(HAPTIC.tap);
    gas.push(...dots(12, R, 1.3));
    gasNote.set(`풍선 속 입자 <b>${gn}개</b>`, gn >= 38 ? "팽팽해요" : "조금 더 커졌어요");
    blow.disabled = gn >= 38;
    if (blown === 1) {
      api.setCTA("입자가 미는 쪽을 살펴보세요", { enabled: false });
      frame.say("입자가 늘자 풍선이 <b>사방으로</b> 커졌어요. 벽마다 적힌 수는 부딪힌 횟수예요.");
      tm.later(askSides, 2200);
    }
  });

  function askSides(): void {
    if (phase !== "gas") return;
    frame.pips(2);
    frame.slot.ask(
      "풍선 속 입자는 풍선의 <b>어느 쪽</b>을 밀고 있나요?",
      [{ t: "위, 아래, 옆을 모두 밀어요", ok: true }, { t: "아래쪽만 밀어요" }, { t: "위쪽만 밀어요" }],
      (ok) => lab.grade(ok),
      {
        why: "입자는 <b>모든 방향</b>으로 움직여 사방의 벽에 부딪혀요.",
        onNext: () => {
          phase = "done";
          lab.phase("done");
          frame.pips(3);
          frame.say("입자는 쉬지 않고 움직이며 풍선의 안쪽 면을 두드려요.");
          frame.slot.conclude("기체 입자는 스스로 <b>모든 방향</b>으로 움직이며 벽에 부딪혀요. 이 충돌이 벽을 미는 힘이 <b>기체의 압력</b>이에요. 입자가 많을수록 더 자주 부딪혀 압력이 커져요.");
          api.enableCTA(s.cta ?? "용어 정복하기");
        },
      },
    );
  }

  const toGas = (): void => {
    phase = "gas";
    lab.phase("gas");
    gas = dots(gn, R, 1.3);
    api.setCTA("풍선에 공기를 불어 넣어 보세요", { enabled: false });
    frame.say("쇠구슬을 아주 작은 <b>기체 입자</b>로 바꾼 풍선이에요. 입자는 흔들지 않아도 <b>스스로</b> 움직여요.");
    gasNote.set(`풍선 속 입자 <b>${gn}개</b>`, "말랑해요");
    frame.slot.setControls(blow, gasNote.el);
  };

  const askForce = (): void => {
    phase = "ask";
    lab.phase("ask");
    frame.pips(1);
    frame.say("가만히 둘 때, 살살 흔들 때, 많이 넣고 세게 흔들 때를 떠올려 보세요.");
    frame.slot.ask(
      "손바닥이 받는 힘이 <b>가장 컸을</b> 때는 언제인가요?",
      [{ t: "쇠구슬이 많고 세게 흔들 때", ok: true }, { t: "쇠구슬이 적고 살살 흔들 때" }, { t: "쇠구슬을 가만히 둘 때" }],
      (ok) => lab.grade(ok),
      { why: "많이, 빠르게 부딪힐수록 손바닥을 세게 밀어요.", onNext: toGas },
    );
  };

  lab.phase("beads");
  frame.say("쇠구슬을 넣은 페트병의 입구를 <b>손바닥</b>으로 막았어요. 막대를 밀어 흔들어 보세요.");
  sync();

  const palmHits: { y: number; age: number }[] = [];
  /** 흔드는 동안 쇠구슬을 병 모양 안에서 움직인다. 손바닥(입구)에 부딪힌 횟수를 돌려준다. */
  const moveBeads = (dt: number, sp: number): number => {
    let hits = 0;
    for (const p of box.parts) {
      p.x += p.vx * sp * dt;
      p.y += p.vy * sp * dt;
      if (p.x < G.X0 + G.R) {
        p.x = G.X0 + G.R;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > G.XM - G.R) {
        p.x = G.XM - G.R;
        if (p.vx > 0) {
          p.vx = -p.vx;
          hits++;
          palmHits.push({ y: p.y, age: 0 });
        }
      }
      const h = halfAt(p.x) - G.R;
      const dy = p.y - G.MY;
      if (Math.abs(dy) > h) {
        const sg = Math.sign(dy);
        if (p.x > G.XB && p.x < G.XS) {
          // 어깨: 비스듬한 벽에서 튕긴다
          const nx = SH_N[0];
          const ny = -SH_N[1] * sg;
          const vn = p.vx * nx + p.vy * ny;
          if (vn > 0) {
            p.vx -= 2 * vn * nx;
            p.vy -= 2 * vn * ny;
          }
        } else if (p.vy * sg > 0) p.vy = -p.vy;
        p.y = G.MY + sg * h;
      }
    }
    return hits;
  };

  const drawBeads = (ctx: CanvasRenderingContext2D, dt: number, tMs: number): void => {
    if (lv === 0) {
      // 가만히: 쇠구슬이 몸통 바닥에 가라앉는다(목과 어깨에 있던 구슬은 몸통 쪽으로 미끄러진다)
      for (const p of box.parts) {
        p.vy += 0.3 * dt;
        p.vx *= 0.94;
        p.x = Math.max(G.X0 + G.R, Math.min(G.XM - G.R, p.x + p.vx * dt - (p.x > G.XB - G.R ? 0.8 * dt : 0)));
        p.y += p.vy * dt;
        const floor = G.MY + halfAt(p.x) - G.R;
        if (p.y > floor) {
          p.y = floor;
          p.vy = 0;
        }
      }
      wasStill = true;
      hr.push(0, dt);
    } else {
      if (wasStill) {
        for (const p of box.parts) {
          const a = Math.random() * Math.PI * 2;
          p.vx = Math.cos(a) * 1.5;
          p.vy = Math.sin(a) * 1.5;
        }
        wasStill = false;
      }
      const sp = 0.5 + lv * 0.7;
      hr.push(moveBeads(dt, sp) * sp, dt);
      if (n === 20 && lv >= 3 && phase === "beads") {
        strong += dt;
        if (strong > 100) {
          phase = "ask";
          range.input.disabled = true;
          api.setCTA("손바닥이 받는 힘을 살펴보세요", { enabled: false });
          tm.later(askForce, 500);
        }
      }
    }
    box.flashes.length = 0;
    // 손바닥에 부딪히는 잦기와 빠르기. 입구가 몸통보다 좁아 옛 네모 병보다 덜 부딪히므로, 같은 조작에서 막대 높이가 비슷하게 0.085로 나눈다
    force = ease(force, clamp01(hr.value() / 0.085), 0.1, dt);
    host.dataset.u6Force = force.toFixed(2);
    if (noteKey !== `${n}|${lv}`) {
      noteKey = `${n}|${lv}`;
      note.set(`쇠구슬 <b>${n}개</b>`, lv ? `<b>${LV[lv]}</b> 흔드는 중` : "<b>가만히</b> 둔 채");
    }

    const sx = lv ? Math.sin(tMs / (140 - lv * 28)) * (1.5 + lv * 1.6) : 0;
    ctx.save();
    ctx.translate(sx, 0);
    const { X0, XB, XS, XM, MY, HB, HN } = G;
    const wB = HB + 5; // 바깥 반높이(몸통)
    const wN = HN + 4; // 바깥 반높이(목)
    // 바닥 그림자
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.ellipse((X0 + XM) / 2, MY + wB + 9, 104, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // 페트병(눕힌 모습): 둥근 바닥(왼쪽), 몸통, 어깨, 목, 입구(오른쪽)
    const bottle = new Path2D();
    bottle.moveTo(XM + 2, MY - wN);
    bottle.lineTo(XS, MY - wN);
    bottle.lineTo(XB, MY - wB);
    bottle.lineTo(X0 + 16, MY - wB);
    bottle.quadraticCurveTo(X0 - 6, MY - wB, X0 - 6, MY);
    bottle.quadraticCurveTo(X0 - 6, MY + wB, X0 + 16, MY + wB);
    bottle.lineTo(XB, MY + wB);
    bottle.lineTo(XS, MY + wN);
    bottle.lineTo(XM + 2, MY + wN);
    bottle.closePath();
    const glass = ctx.createLinearGradient(0, MY - wB, 0, MY + wB);
    glass.addColorStop(0, "rgba(190,220,250,.20)");
    glass.addColorStop(0.5, "rgba(170,205,245,.07)");
    glass.addColorStop(1, "rgba(150,190,240,.14)");
    ctx.fillStyle = glass;
    ctx.fill(bottle);
    // 몸통의 골(페트병 줄무늬)과 목의 나사산
    ctx.strokeStyle = "rgba(200,222,252,.18)";
    ctx.lineWidth = 1.2;
    for (const x of [78, 118, 158]) {
      ctx.beginPath();
      ctx.moveTo(x, MY - wB + 3);
      ctx.lineTo(x, MY + wB - 3);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(200,222,252,.45)";
    for (const x of [226, 231]) {
      ctx.beginPath();
      ctx.moveTo(x, MY - wN - 1);
      ctx.lineTo(x, MY + wN + 1);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(205,226,252,.7)";
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.stroke(bottle);
    // 윗면의 빛
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X0 + 22, MY - wB + 6);
    ctx.lineTo(XB - 10, MY - wB + 6);
    ctx.stroke();
    for (const p of box.parts) {
      const g = ctx.createRadialGradient(p.x - 1.5, p.y - 1.8, 0.5, p.x, p.y, 5.5);
      g.addColorStop(0, "#FFFFFF");
      g.addColorStop(0.5, "#B8C4D6");
      g.addColorStop(1, "#6F7E96");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // 입구를 막은 손: 손바닥이 입구를 덮고, 손가락과 엄지가 목을 감싼다. 받는 힘만큼 밀려난다
    const push = force * 6;
    const hx = XM + 2 + push;
    ctx.fillStyle = "#F6D6BE";
    ctx.strokeStyle = "#C99A7C";
    ctx.lineWidth = 1.5;
    const part = (x: number, y: number, w: number, h: number, r: number): void => {
      rr(ctx, x, y, w, h, r);
      ctx.fill();
      ctx.stroke();
    };
    part(XS - 1 + push, MY - wN - 10, hx - XS + 10, 11, 5.5); // 손가락(목 위)
    part(XS + 3 + push, MY + wN - 1, hx - XS + 6, 11, 5.5); // 엄지(목 아래)
    part(hx + 8, MY - 20, 30, 40, 12); // 손목 쪽
    part(hx, MY - 30, 17, 60, 8); // 손바닥
    // 손바닥에 부딪힌 자리: 번쩍임과 손바닥을 미는 짧은 화살
    for (const h of palmHits) {
      h.age += 0.035 * dt;
      const a = Math.max(0, 1 - h.age);
      // 번쩍임은 입구 안쪽(어두운 자리)에, 미는 화살은 손바닥 위에 진한 주황으로
      ctx.strokeStyle = `rgba(255,224,138,${a.toFixed(3)})`;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(hx - 2.5, h.y - 7);
      ctx.lineTo(hx - 2.5, h.y + 7);
      ctx.stroke();
      ctx.fillStyle = `rgba(232,118,30,${a.toFixed(3)})`;
      ctx.strokeStyle = `rgba(232,118,30,${a.toFixed(3)})`;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(hx + 3, h.y);
      ctx.lineTo(hx + 11, h.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx + 15, h.y);
      ctx.lineTo(hx + 10, h.y - 3.6);
      ctx.lineTo(hx + 10, h.y + 3.6);
      ctx.closePath();
      ctx.fill();
    }
    for (let i = palmHits.length - 1; i >= 0; i--) if (palmHits[i].age >= 1) palmHits.splice(i, 1);
    ctx.restore();
    txt(ctx, "손바닥", XM + 12, MY + 50, { align: "center", color: "#C9D6EC" });
    pill(ctx, "쇠구슬을 넣은 페트병", 12, 7, { dot: "#B8C4D6" });
    txt(ctx, "손바닥이", 308, 40, { align: "center", color: "#9FB2D0" });
    txt(ctx, "받는 힘", 308, 56, { align: "center", color: "#9FB2D0" });
    vbar(ctx, 297, 70, 22, 112, force, force > 0.6 ? "#FF9F5A" : "#FFD68A");
    txt(ctx, lv === 0 && force < 0.05 ? "없음" : force > 0.6 ? "세요" : force > 0.25 ? "보통" : "약해요", 308, 198, { align: "center", size: 13, weight: 800, color: "#E8EEF9" });
  };

  const drawGas = (ctx: CanvasRenderingContext2D, dt: number): void => {
    R = ease(R, 36 + gn * 0.9, 0.08, dt);
    const cx = 150;
    const cy = 124;
    const lim = R - 4;
    for (const p of gas) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const d = Math.hypot(p.x, p.y);
      if (d > lim) {
        const nx = p.x / d;
        const ny = p.y / d;
        const dot = p.vx * nx + p.vy * ny;
        if (dot > 0) {
          p.vx -= 2 * dot * nx;
          p.vy -= 2 * dot * ny;
          const a = Math.atan2(ny, nx);
          flashes.push({ a, age: 0 });
          if (Math.abs(nx) > Math.abs(ny)) sides[nx > 0 ? "오른쪽" : "왼쪽"] += 1;
          else sides[ny > 0 ? "아래" : "위"] += 1;
        }
        p.x = nx * lim;
        p.y = ny * lim;
      }
    }
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,120,150,.14)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,170,190,.9)";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    // 풍선 꼭지
    ctx.fillStyle = "rgba(255,170,190,.9)";
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + R + 8);
    ctx.lineTo(cx + 5, cy + R + 8);
    ctx.lineTo(cx, cy + R - 1);
    ctx.fill();
    drawDots(ctx, gas, cx, cy, 205, 3);
    for (const f of flashes) {
      f.age += 0.06 * dt;
      ctx.strokeStyle = `rgba(255,214,138,${Math.max(0, (1 - f.age) * 0.7)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, R, f.a - 0.12, f.a + 0.12);
      ctx.stroke();
    }
    for (let i = flashes.length - 1; i >= 0; i--) if (flashes[i].age >= 1) flashes.splice(i, 1);
    const c = "#FFD68A";
    txt(ctx, `위 ${sides.위}`, cx, cy - R - 11, { align: "center", color: c });
    txt(ctx, `아래 ${sides.아래}`, cx + 34, cy + R + 10, { color: c });
    txt(ctx, `왼쪽 ${sides.왼쪽}`, cx - R - 8, cy, { align: "right", color: c });
    txt(ctx, `오른쪽 ${sides.오른쪽}`, cx + R + 8, cy, { color: c });
    pill(ctx, "고무풍선 속 기체 입자", 12, 7, { dot: "#5AA2F8" });
  };

  lab.run((ctx, dt, tMs) => (phase === "gas" || phase === "done" ? drawGas(ctx, dt) : drawBeads(ctx, dt, tMs)));
  return () => lab.cleanup();
};
