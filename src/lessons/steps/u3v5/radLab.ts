// [중1 Ⅲ v5] u3l3 u3RadLab: 「난로 곁에 서면 왜 따뜻할까?」
// 한 통찰: 복사는 열이 물질을 통하지 않고 직접 이동하는 것이다. 곧게 나아가므로 가로막으면 닿지 않고, 공기가 없어도 전해진다.
// 책의 그림(난로 곁의 따뜻함)과 물음(사이를 가로막으면 왜 따뜻하지 않을까)을 손으로 한다.
//   1 난로와 사람: 거리 막대로 다가가면 받는 열이 커진다. 가림판을 세우면 열이 막힌다.
//   2 유리 상자: 전등과 온도계를 넣고 공기를 뺀다(꾹 누르기). 공기 입자가 다 빠져도 온도계는 따뜻하다.
// 흐름: 다가가기 → 가림판 → (예측) → 공기 빼기 → 판정 → 결론.
// 난로는 전기난로다(불꽃은 공기가 없으면 꺼지므로 유리 상자 실험과 어긋난다. 모닥불은 앞의 만화에 이미 나온다).
// 유리 상자에서 온도계의 눈금은 그대로 둔다(복사로 받는 열이 그대로라는 것만 보인다).
// 2026-11-15 그래픽 감사 고침(난로 장면): 받는 열이 구석의 작은 다섯 칸이었고, 빛줄기가 사람 몸을 뚫고 무대 끝까지 갔다.
//   이제 빛줄기는 몸 앞(손, 몸통, 머리, 다리)에서 멈추고 닿은 자리가 빛난다. 난로에서 퍼져 나가므로 멀어질수록 몸에 닿는 줄 수가 준다.
//   받는 열 칸은 사람 머리 위로 옮겨 키웠다. 사람은 흰 선 막대 인물에서 옷 입은 인물로(난로 쪽으로 손을 내밀었다, 책 그림 Ⅲ-6).

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { makeParticles, stepFree, type Box } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, u3Hold, pill, rr, txt, SUB, type Ctx } from "./kit";

interface RadStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const RAYS = [-0.5, -0.33, -0.16, 0, 0.16, 0.33, 0.5];

export const radLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RadStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 4, cls: "u3x-rad", api, tall: true });

  let scene: "stove" | "box" = "stove";
  let dist = 70; // 0(가까이)~100(멀리)
  let shield = false;
  let nearDone = false;
  let shieldDone = false;
  let air = 1; // 유리 상자 속 공기(1: 가득, 0: 없음)
  let pumping = false;
  let phase: "play" | "ask" | "done" = "play";
  const airBox: Box = { x: 40, y: 46, w: 266, h: 142 };
  const airPs = makeParticles(42, airBox);

  const warmth = (): number => (shield ? 0.03 : 1 / (1 + Math.pow(dist / 36, 2)));

  /** 곧게 나아가는 열(주황 점선). (x0, y0)에서 각도 a로 xEnd까지. */
  function ray(ctx: Ctx, x0: number, y0: number, a: number, xEnd: number, tMs: number, alpha: number): void {
    const len = (xEnd - x0) / Math.cos(a);
    ctx.strokeStyle = `rgba(255,150,70,${alpha})`;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.setLineDash([9, 9]);
    ctx.lineDashOffset = -(tMs / 22) % 18;
    ctx.beginPath();
    ctx.moveTo(x0 + 6 * Math.cos(a), y0 + 6 * Math.sin(a));
    ctx.lineTo(x0 + len * Math.cos(a), y0 + len * Math.sin(a));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /** 사람(x는 몸 가운데)의 앞쪽(난로 쪽) 가장자리. 그 높이에 몸이 없으면 null. */
  function bodyFront(x: number, y: number): number | null {
    if (y >= 89 && y < 111) return x - Math.sqrt(Math.max(0, 121 - (y - 100) * (y - 100)));
    if (y >= 111 && y < 114) return x - 4;
    if (y >= 120 && y < 134) return x - 31; // 앞으로 내민 팔과 손
    if (y >= 114 && y < 154) return x - 11;
    if (y >= 154 && y <= 190) return x - 10;
    return null;
  }

  /** 옷 입은 사람(난로 쪽으로 손을 내밀었다). 얼굴은 비운다(앱 화풍). */
  function drawPerson(ctx: Ctx, x: number): void {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // 바닥 그림자
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.beginPath();
    ctx.ellipse(x, 192, 20, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // 다리
    ctx.strokeStyle = "#2B3852";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x - 5, 150);
    ctx.lineTo(x - 7, 186);
    ctx.moveTo(x + 5, 150);
    ctx.lineTo(x + 7, 186);
    ctx.stroke();
    ctx.fillStyle = "#1B2536";
    rr(ctx, x - 14, 184, 12, 6, 3);
    ctx.fill();
    rr(ctx, x + 1, 184, 12, 6, 3);
    ctx.fill();
    // 몸통(옷)
    const g = ctx.createLinearGradient(x - 12, 0, x + 12, 0);
    g.addColorStop(0, "#6E97E6");
    g.addColorStop(1, "#3F69C2");
    rr(ctx, x - 12, 112, 24, 42, 8);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "#2A4E96";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 앞으로 내민 팔과 손
    ctx.strokeStyle = "#4F7AD0";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x - 5, 121);
    ctx.lineTo(x - 24, 127);
    ctx.stroke();
    ctx.fillStyle = "#F2C9A0";
    ctx.beginPath();
    ctx.arc(x - 27, 127.5, 4.6, 0, Math.PI * 2);
    ctx.fill();
    // 목과 머리
    ctx.fillStyle = "#F2C9A0";
    rr(ctx, x - 3.5, 106, 7, 8, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, 100, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#B88660";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    // 머리카락(뒤통수 쪽이 오른쪽)
    ctx.fillStyle = "#3B2A20";
    ctx.beginPath();
    ctx.moveTo(x - 10.5, 97);
    ctx.quadraticCurveTo(x - 9, 86.5, x + 1, 88.6);
    ctx.quadraticCurveTo(x + 12.5, 89.5, x + 11.2, 103);
    ctx.quadraticCurveTo(x + 6, 95, x - 10.5, 97);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawStove(ctx: Ctx, tMs: number): void {
    const w = warmth();
    const x = 150 + dist * 1.5;
    // 빛줄기: 가림판이나 몸 앞에서 멈춘다(몸에 닿은 줄은 닿은 자리를 기억해 둔다)
    const hits: [number, number][] = [];
    for (const a of RAYS) {
      const k = Math.tan(a);
      let end = 344;
      if (shield) end = 110;
      else {
        for (let xx = 70; xx <= 344; xx += 1.5) {
          const yy = 130 + (xx - 60) * k;
          const fr = bodyFront(x, yy);
          if (fr !== null && xx >= fr) {
            end = xx;
            hits.push([xx, yy]);
            break;
          }
        }
      }
      ray(ctx, 60, 130, a, end, tMs, 0.75);
    }
    // 전기난로
    rr(ctx, 16, 84, 44, 96, 8);
    ctx.fillStyle = "#3A475F";
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(255,${110 + 30 * Math.sin(tMs / 300 + i)},60,1)`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(24, 98 + i * 16);
      ctx.lineTo(52, 98 + i * 16);
      ctx.stroke();
    }
    rr(ctx, 10, 180, 56, 10, 4);
    ctx.fillStyle = "#2A3A55";
    ctx.fill();
    txt(ctx, "난로", 38, 204, { size: 12.5, color: SUB });
    // 가림판
    if (shield) {
      rr(ctx, 108, 60, 9, 134, 3);
      ctx.fillStyle = "#AEB9CC";
      ctx.fill();
      txt(ctx, "가림판", 112, 208, { size: 12.5, color: SUB });
    }
    // 사람: 열을 받는 만큼 난로 쪽이 달아오른다
    const g = ctx.createRadialGradient(x - 14, 128, 4, x - 14, 128, 44);
    g.addColorStop(0, `rgba(255,130,60,${0.5 * w})`);
    g.addColorStop(1, "rgba(255,130,60,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x - 14, 128, 44, 0, Math.PI * 2);
    ctx.fill();
    drawPerson(ctx, x);
    // 빛줄기가 닿은 자리
    for (const [hx, hy] of hits) {
      const hg = ctx.createRadialGradient(hx, hy, 0.5, hx, hy, 7);
      hg.addColorStop(0, "rgba(255,214,140,.95)");
      hg.addColorStop(1, "rgba(255,150,70,0)");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(hx, hy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    // 받는 열(칸 다섯): 사람 머리 위에 크게
    const lv = Math.round(w * 5);
    const mx = Math.max(166, Math.min(290, x));
    rr(ctx, mx - 53, 44, 106, 46, 10);
    ctx.fillStyle = "rgba(11,21,36,.88)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,138,76,.35)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    txt(ctx, "받는 열", mx, 56, { size: 12.5, color: "#E8EEF9", weight: 800 });
    for (let i = 0; i < 5; i++) {
      rr(ctx, mx - 45 + i * 18.4, 66, 15, 18, 4);
      ctx.fillStyle = i < lv ? "#FF8A4C" : "rgba(255,255,255,.12)";
      ctx.fill();
      if (i < lv) {
        ctx.strokeStyle = "#FFC9A0";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
    host.dataset.u3Warm = String(lv);
    host.dataset.u3Hits = String(hits.length);
  }

  function drawBox(ctx: Ctx, dt: number, tMs: number): void {
    // 유리 상자
    rr(ctx, 30, 36, 286, 162, 14);
    ctx.fillStyle = "rgba(160,210,255,.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(205,225,250,.75)";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    // 공기 빼는 관
    ctx.strokeStyle = "rgba(205,225,250,.6)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(300, 198);
    ctx.lineTo(300, 222);
    ctx.stroke();
    txt(ctx, "공기 빼는 관", 292, 214, { size: 12, color: SUB, align: "right", weight: 600 });
    // 공기 입자
    stepFree(airPs, airBox, dt, 1.1, 0);
    const n = Math.round(airPs.length * air);
    ctx.fillStyle = "rgba(170,200,235,.8)";
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.arc(airPs[i].x, airPs[i].y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // 전등과 곧게 나아가는 열
    for (const a of [-0.2, -0.07, 0.07, 0.2]) ray(ctx, 84, 118, a, 238, tMs, 0.8);
    const g = ctx.createRadialGradient(72, 118, 3, 72, 118, 30);
    g.addColorStop(0, "rgba(255,190,90,.95)");
    g.addColorStop(1, "rgba(255,150,60,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(72, 118, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFD08A";
    ctx.beginPath();
    ctx.arc(72, 118, 11, 0, Math.PI * 2);
    ctx.fill();
    rr(ctx, 64, 128, 16, 44, 3);
    ctx.fillStyle = "#3A475F";
    ctx.fill();
    txt(ctx, "전등", 72, 184, { size: 12.5, color: SUB });
    // 온도계(눈금은 그대로다)
    rr(ctx, 246, 70, 14, 86, 7);
    ctx.fillStyle = "rgba(255,255,255,.14)";
    ctx.fill();
    rr(ctx, 249.5, 96, 7, 60, 3.5);
    ctx.fillStyle = "#FF8A4C";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(253, 162, 10, 0, Math.PI * 2);
    ctx.fill();
    pill(ctx, "온도계: 따뜻함", 258, 56, { size: 12, dot: "#FF8A4C" });
    pill(ctx, `상자 속 공기 ${Math.round(air * 100)}%`, 112, 20, { size: 12, dot: "rgba(170,200,235,1)" });
  }

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    host.dataset.u3Scene = scene;
    host.dataset.u3Air = air.toFixed(2);
    if (scene === "stove") drawStove(ctx, tMs);
    else {
      if (pumping && air > 0) {
        air = Math.max(0, air - dt / 150);
        if (air <= 0) onEmpty();
      }
      drawBox(ctx, dt, tMs);
    }
  });

  // ── 조작 ──
  const range = bvRange({
    cls: "u3x-range",
    min: 0,
    max: 100,
    value: dist,
    label: "난로와의 거리",
    ticks: ["가까이", "멀리"],
    onInput: (v) => {
      dist = v;
      if (!nearDone && !shield && dist <= 12) {
        nearDone = true;
        shieldBtn.disabled = false;
        haptic(HAPTIC.ctaUnlock);
        f.pips(1);
      }
      hint();
    },
  });
  const shieldBtn = bvBtn("", "가림판 세우기");
  shieldBtn.disabled = true;
  const nextBtn = bvBtn("main", "공기 없는 상자 실험하기");
  nextBtn.hidden = true;
  const pump = u3Hold("꾹 눌러 공기 빼기", (down) => {
    if (scene !== "box" || air <= 0) return;
    pumping = down;
    if (!down && air > 0) f.say("손을 떼면 펌프가 멈춰요. 상자 속 공기가 모두 빠질 때까지 끝까지 <b>꾹</b> 눌러 주세요.");
  });

  function hint(): void {
    if (scene !== "stove") return;
    if (!nearDone) f.say("전기난로가 켜져 있어요. <b>난로와의 거리</b> 막대를 왼쪽으로 밀어 난로 가까이로 다가가 보세요. 전달되는 열의 양이 어떻게 달라지나요?");
    else if (!shieldDone) f.say("난로에 가까워질수록 열을 더 많이 받아요! 이번에는 난로와 사람 사이에 <b>가림판</b>을 세워 보세요.");
    else f.say(shield ? "가림판을 세우니 열이 가로막혀 전달되지 않아요! 이제 가림판을 다시 치우거나 다음 실험으로 넘어가 보세요." : "가림판을 치우니 다시 열이 곧장 전달돼요. 이제 공기가 없는 상자에서도 열이 이동하는지 알아볼까요?");
  }

  shieldBtn.addEventListener("click", () => {
    if (scene !== "stove") return;
    haptic(HAPTIC.tap);
    shield = !shield;
    shieldBtn.textContent = shield ? "가림판 치우기" : "가림판 세우기";
    shieldBtn.classList.toggle("on", shield);
    if (shield && !shieldDone) {
      shieldDone = true;
      f.pips(2);
      nextBtn.hidden = false;
    }
    hint();
  });

  nextBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    scene = "box";
    f.say("유리 상자 안에 켜진 전등과 온도계를 넣었어요. 상자 속 공기를 모두 빼기 전에 결과를 <b>예측</b>해 볼까요?");
    f.slot.ask(
      "상자 속 <b>공기를 모두 빼내면</b> 온도계의 온도는 어떻게 될까요?",
      [{ t: "열이 전달되지 않아 차갑게 식는다" }, { t: "공기가 없어도 여전히 따뜻하다" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          f.slot.setControls(pump);
          f.say("<b>꾹 눌러 공기 빼기</b> 버튼을 눌러 상자 속 공기 입자를 모두 빼내 보세요. 온도계는 어떻게 될까요?");
          api.setCTA("상자 속 공기를 모두 빼 보세요", { enabled: false });
        },
      },
    );
  });

  function onEmpty(): void {
    pumping = false;
    pump.disabled = true;
    pump.classList.remove("down");
    haptic(HAPTIC.correct);
    f.pips(3);
    f.say("상자 속에 공기 입자가 하나도 없는데도 온도계는 <b>여전히 따뜻해요</b>! 열이 아무 물질도 없는 빈 공간을 지나 곧장 전달된 거예요.");
    tm.later(askFinal, 2600);
  }

  function askFinal(): void {
    phase = "ask";
    f.say("공기를 모두 빼낸 유리 상자 안의 모습을 보고 답해 보세요.");
    f.slot.ask(
      "상자 속에 공기가 없는데도 전등의 열이 온도계에 전달된 까닭은 무엇인가요?",
      [{ t: "열이 물질을 거치지 않고 직접 이동해서", ok: true }, { t: "남아 있는 공기 입자가 직접 이동하며 열을 날라서" }, { t: "공기 입자의 떨림이 이웃한 입자로 전달돼서" }],
      (ok) => api.recordQuiz(ok),
      { why: "공기를 모두 뺀 상자 속에는 대류나 전도를 일으킬 <b>공기 입자가 없어요</b>.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(4);
    f.say("공기가 없는 빈 공간에서도 열이 직접 이동한다는 것을 확인했어요!");
    f.slot.conclude("열이 물질의 도움 없이 <b>직접 이동</b>하는 현상을 <b>복사</b>라고 해요. 태양이 텅 빈 우주 공간을 지나 지구까지 열을 보내는 것도 복사 때문이에요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el, shieldBtn, nextBtn);
  hint();
  api.setCTA("난로에 다가가고 가림판을 세워 보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.stop();
  };
};
