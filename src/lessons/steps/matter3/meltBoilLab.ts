// [중1 Ⅳ v3] L5 meltBoilLab — 「얼음을 끝까지 가열하면, 온도 곡선」(교과서 탐구: 얼음이 녹고 물이 끓을 때의 온도 측정).
// 메타볼 무대 재사용(단원의 정체성): 온도 스케줄이 시뮬을 몰고, 무대 위 물질이 얼음 → 물 → 수증기로 변한다.
// 한 통찰: 상태가 변하는 동안(녹는 동안·끓는 동안)은 흡수한 열에너지가 모두 상태 변화에 쓰여 온도가 일정하게 유지된다.
// 조작: 가열 시작(버튼) → 곡선이 자라며 두 번의 '온도 일정 구간' → 온도 판정 → 열에너지 판정.
// 목표 판정은 스케줄(상태값)로 — 렌더 루프(rAF)가 멈춘 QA 환경에서도 완주된다. cleanup에서 loop.stop()+stage.dispose().

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { createLoop } from "../../../core/anim";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { createMatterStage, type MatterStage } from "../../../ui/matterStage";
import type { SimBounds } from "../../../engine/matterSim";
import { M3 } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3AskBox, m3Goals, m3Helper, m3Reveal, m3Timers } from "./m3Lab";

interface MblStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N = 60; // 틱 수(= 그래프 가로축 '시간')
const TICK_MS = 190;
const GX0 = 44, GY0 = 12, GW = 268, GH = 112;
const T_MIN = -20, T_MAX = 120;
const yOf = (T: number): number => GY0 + GH - ((T - T_MIN) / (T_MAX - T_MIN)) * GH;
const xOf = (i: number): number => GX0 + 6 + (i / N) * (GW - 12);

/** 표시 온도(그래프·필) — 융해 0℃·기화 100℃ 구간이 평평하다. */
function tDisp(i: number): number {
  if (i <= 8) return -10 + (10 * i) / 8;
  if (i <= 22) return 0;
  if (i <= 44) return (100 * (i - 22)) / 22;
  return 100;
}
/** 시뮬 온도 — 평평한 구간 동안 상 혼합비가 서서히 바뀌게(sol = 1-smooth(-2,3,T), gas = smooth(96,104,T)) 스윕. */
function tSim(i: number): number {
  if (i <= 8) return -10 + (8 * i) / 8; // -10 → -2
  if (i <= 22) return -2 + (5 * (i - 8)) / 14; // -2 → 3 (녹는 중)
  if (i <= 44) return 3 + (93 * (i - 22)) / 22; // 3 → 96
  if (i <= 58) return 96 + (8 * (i - 44)) / 14; // 96 → 104 (끓는 중)
  return 104 + 6 * (i - 58);
}
const walls = (w: number, h: number): SimBounds => ({ x0: w * 0.3, y0: h * 0.08, x1: w * 0.7, y1: h * 0.74 });

export const meltBoilLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as MblStep;
  const tm = m3Timers();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "melt", name: "녹는 구간", sub: "0℃에서" },
      { id: "boil", name: "끓는 구간", sub: "100℃에서" },
      { id: "judge", name: "판정", sub: "가열이 끝난 뒤" },
    ],
    () => {
      helper.innerHTML =
        "정리! 얼음이 녹는 동안(<b>융해</b>)과 물이 끓는 동안(<b>기화</b>)에는 온도가 <b>일정하게 유지</b>돼요. 흡수한 <b>열에너지가 모두 상태 변화에 쓰이기</b> 때문이죠. 융해·기화·고체에서 기체로의 승화는 모두 열에너지를 <b>흡수</b>하는 상태 변화예요.";
      api.enableCTA(s.cta ?? "흡수하는 상태 변화 정리하기");
    },
  );
  const helper = m3Helper("비커에 <b>얼음</b>을 넣고 온도계를 꽂았어요. 지금 <b>−10℃</b>. 아래 버튼으로 <b>가열</b>을 시작하고, 온도 곡선이 어떤 모양으로 자라는지 지켜보세요. 무대의 <b>입자의 눈</b>도 눌러 보고요.");

  let heating = false;
  const stage: MatterStage = createMatterStage({
    height: "224px",
    sim: { temp: -10, count: 44, r: 6.5, cols: 8, walls },
    cap: "입자 44개",
    overlay: (ctx, w, h, _sim, tMs) => {
      const b = walls(w, h);
      ctx.save();
      // 비커
      const g = ctx.createLinearGradient(b.x0, 0, b.x1, 0);
      g.addColorStop(0, "rgba(214, 228, 255, 0.9)");
      g.addColorStop(0.5, "rgba(160, 190, 235, 0.55)");
      g.addColorStop(1, "rgba(120, 150, 200, 0.85)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(b.x0 - 4, b.y0 - 8);
      ctx.lineTo(b.x0 - 4, b.y1 + 4);
      ctx.lineTo(b.x1 + 4, b.y1 + 4);
      ctx.lineTo(b.x1 + 4, b.y0 - 8);
      ctx.stroke();
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(200, 214, 240, 0.7)";
      ctx.beginPath();
      ctx.moveTo(b.x0 - 4, b.y0 - 8);
      ctx.lineTo(b.x1 + 4, b.y0 - 8);
      ctx.stroke();
      ctx.setLineDash([]);
      // 가열 장치 + 불꽃(가열 중에만)
      const cx = (b.x0 + b.x1) / 2;
      ctx.fillStyle = "#6B7684";
      ctx.fillRect(cx - 34, b.y1 + 10, 68, 8);
      ctx.fillStyle = "#4E5968";
      ctx.fillRect(cx - 24, b.y1 + 18, 48, 6);
      if (heating) {
        const fl = 1 + 0.08 * Math.sin(tMs / 90);
        const drawFlame = (x: number, sc: number, col: string): void => {
          ctx.beginPath();
          ctx.moveTo(x, b.y1 + 10);
          ctx.bezierCurveTo(x - 12 * sc, b.y1 + 4, x - 10 * sc, b.y1 - 14 * fl * sc, x, b.y1 - 22 * fl * sc);
          ctx.bezierCurveTo(x + 10 * sc, b.y1 - 14 * fl * sc, x + 12 * sc, b.y1 + 4, x, b.y1 + 10);
          ctx.fillStyle = col;
          ctx.fill();
        };
        drawFlame(cx - 16, 0.9, "rgba(255, 146, 43, 0.9)");
        drawFlame(cx + 16, 0.9, "rgba(255, 146, 43, 0.9)");
        drawFlame(cx, 1.1, "rgba(255, 146, 43, 0.95)");
        drawFlame(cx, 0.6, "rgba(255, 224, 102, 0.95)");
      }
      ctx.restore();
    },
  });
  const pill = el("div", { class: "mt3-pill", html: "<b>−10℃</b> · 얼음" });
  stage.hud.appendChild(pill);
  const stageWrap = el("div", { class: "mbl-stage" }, stage.el);

  const graph = el("div", { class: "mt3-graph mbl-graph" });
  graph.innerHTML = `
  <svg viewBox="0 0 340 152" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="${GX0}" y1="${GY0 - 4}" x2="${GX0}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${GX0}" y1="${GY0 + GH}" x2="${GX0 + GW + 6}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[-20, 0, 20, 40, 60, 80, 100, 120].map((v) => `<line x1="${GX0 - 4}" y1="${yOf(v)}" x2="${GX0 + GW}" y2="${yOf(v)}" stroke="${v === 0 || v === 100 ? "#D9D2FF" : "#EEF0F3"}" stroke-width="${v === 0 || v === 100 ? 1.4 : 1}"/>${[0, 40, 80, 100].includes(v) ? `<text x="${GX0 - 8}" y="${yOf(v) + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#8B95A1">${v}</text>` : ""}`).join("")}
    <text x="10" y="${GY0 + 2}" font-size="11" font-weight="800" fill="${M3.sub}">온도(℃)</text>
    <text x="${GX0 + GW / 2}" y="${GY0 + GH + 24}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">가열 시간</text>
    <polyline class="mbl-line" points="" stroke="${M3.matter}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="mbl-zone mbl-zone-melt" opacity="0"><rect x="${xOf(9)}" y="${yOf(0) - 24}" width="86" height="20" rx="10" fill="#F0ECFF" stroke="${M3.matter}" stroke-width="1.6"/><text x="${xOf(9) + 43}" y="${yOf(0) - 10}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${M3.matterDeep}">얼음이 녹는 중</text></g>
    <g class="mbl-zone mbl-zone-boil" opacity="0"><rect x="${xOf(30)}" y="${yOf(100) + 6}" width="84" height="20" rx="10" fill="#F0ECFF" stroke="${M3.matter}" stroke-width="1.6"/><text x="${xOf(30) + 42}" y="${yOf(100) + 20}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${M3.matterDeep}">물이 끓는 중</text></g>
  </svg>`;

  const btn = el("button", { class: "mt3-btn mbl-btn", text: "가열 시작", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "mt3-btnrow" }, btn);
  const qBox = m3AskBox("mbl-q mt3-q");

  const line = graph.querySelector(".mbl-line") as SVGPolylineElement;
  const zoneMelt = graph.querySelector(".mbl-zone-melt") as SVGGElement;
  const zoneBoil = graph.querySelector(".mbl-zone-boil") as SVGGElement;
  const pts: string[] = [];
  let i = 0;

  const stateName = (k: number): string => (k <= 8 ? "얼음" : k <= 22 ? "얼음이 녹는 중" : k <= 44 ? "물" : k <= 58 ? "물이 끓는 중" : "수증기");

  function tick(): void {
    const T = tDisp(i);
    stage.setTemp(tSim(i));
    pill.innerHTML = `<b>${Math.round(T) === 0 ? "0" : Math.round(T) < 0 ? "−" + Math.abs(Math.round(T)) : Math.round(T)}℃</b> · ${stateName(i)}`;
    pts.push(`${xOf(i).toFixed(1)},${yOf(T).toFixed(1)}`);
    line.setAttribute("points", pts.join(" "));
    if (i === 12) zoneMelt.setAttribute("opacity", "1");
    if (i === 22) {
      goals.collect("melt", "0℃로 일정!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "얼음이 녹는 동안 곡선이 <b>0℃에서 평평</b>했어요. 열은 계속 주고 있는데 온도가 안 올랐죠. 다 녹자 다시 오르기 시작해요. 이번엔 <b>끓을 때</b>를 보세요.";
    }
    if (i === 48) zoneBoil.setAttribute("opacity", "1");
    if (i === 58) {
      goals.collect("boil", "100℃로 일정!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "물이 끓는 동안에도 곡선이 <b>100℃에서 평평</b>해요. 계속 가열해도 온도가 더 오르지 않죠. 물이 수증기로 변하고 있어요.";
    }
    i += 1;
    if (i > N) {
      heating = false;
      btn.textContent = "가열 끝";
      helper.innerHTML = "가열 끝. 그래프에 <b>평평한 구간이 두 번</b> 나왔어요. 얼음이 녹을 때(0℃)와 물이 끓을 때(100℃). 이제 판정해 볼까요?";
      tm.later(askTemp, 700);
      return;
    }
    tm.later(tick, TICK_MS);
  }

  function askTemp(): void {
    b4Ask(
      qBox,
      "얼음이 <b>녹는 동안</b>과 물이 <b>끓는 동안</b>, 온도는 어떻게 되었나요?",
      [
        { t: "일정하게 유지되었다", ok: true },
        { t: "계속 천천히 올랐다", ok: false },
        { t: "잠깐 내려갔다가 다시 올랐다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 상태가 변하는 동안에는 온도가 <b>일정하게 유지</b>돼요. 그런데 열은 계속 주고 있었잖아요? 그 열에너지는 어디로 갔을까요?"
          : "그래프의 평평한 두 구간을 다시 보세요. 오르지도 내리지도 않고 <b>일정하게 유지</b>됐어요. 그런데 열은 계속 주고 있었죠. 그 열에너지는 어디로 갔을까요?";
        tm.later(askEnergy, 1400);
      },
    );
    m3Reveal(tm, qBox);
  }

  function askEnergy(): void {
    b4Ask(
      qBox,
      "온도가 일정한 동안, 물질이 <b>흡수한 열에너지</b>는 어디에 쓰였을까요?",
      [
        { t: "입자의 배열을 바꾸는 상태 변화에 모두 쓰였다", ok: true },
        { t: "가열 장치로 다시 되돌아갔다", ok: false },
        { t: "쓰이지 않고 물질 밖으로 빠져나가 사라졌다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 흡수한 열에너지가 <b>상태 변화에 모두</b> 쓰였기 때문에 온도를 올릴 몫이 남지 않았던 거예요. 얼음이 녹을 때도, 물이 끓을 때도요."
          : "열에너지는 되돌아가지도, 사라지지도 않았어요. 얼음을 물로, 물을 수증기로 바꾸는 <b>상태 변화에 모두</b> 쓰였기 때문에 온도를 올릴 몫이 남지 않았던 거예요.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
      },
    );
    m3Reveal(tm, qBox);
  }

  btn.addEventListener("click", () => {
    if (i > 0 || btn.disabled) return;
    haptic(HAPTIC.tap);
    heating = true;
    btn.disabled = true;
    btn.textContent = "가열 중…";
    helper.innerHTML = "가열 시작! 온도 필과 그래프, 무대의 얼음을 함께 보세요.";
    tm.later(tick, 300);
  });

  host.append(goals.chips, helper, stageWrap, graph, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const loop = createLoop((dt, t) => stage.tick(dt, t));
  let ro: ResizeObserver | null = null;
  tm.later(() => {
    stage.resize();
    loop.start();
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => stage.resize());
      ro.observe(stage.el);
    }
  }, 0);
  api.setCTA("가열 시작 버튼을 누르세요", { enabled: false });
  return () => {
    tm.clear();
    loop.stop();
    ro?.disconnect();
    stage.dispose();
  };
};
