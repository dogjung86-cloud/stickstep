// [중1 Ⅲ v3] L2 contactGraphLab — 「열량계 관찰」(교과서 탐구 재현: 온도가 만나는 순간).
// 한 통찰: 온도가 다른 두 물체가 닿으면 열은 뜨거운 쪽에서 차가운 쪽으로 이동해 결국 온도가 같아진다(열평형).
// 조작: 버튼 1개(센서 연결). 두 온도 곡선이 점점이 자라 만나고, 입자 창 2개가 실시간으로 활발도를 바꾼다.
// 한 화면 예산(2026-09-03): 열량계 장면 + 그래프 세로 쌓기를 버리고 그래프 한 장 안에 작은 입자 창 2개
// (곡선이 지나지 않는 우상단·우하단 빈 자리, 온도 표시 겸용). 판정은 버튼 자리에 교체.
// 목표 3: 관찰(열평형 도달) → 방향 판정 → 입자 판정.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { H3, tempColor, particleGrid, seededRandom } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3Btn, h3Goals, h3Helper, h3Slot, h3Timers } from "./h3Lab";

interface CglStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const HOT0 = 70;
const COLD0 = 10;
const TEQ = 40;
const N = 30;
const GX0 = 42, GY0 = 16, GW = 284, GH = 132;
const yOf = (T: number): number => GY0 + GH - (T / 80) * GH;
const xOf = (i: number): number => GX0 + 6 + (i / N) * (GW - 12);
const WIN_H = { x: 202, y: 18, w: 118, h: 48 }; // 뜨거운 물 입자 창(우상단)
const WIN_C = { x: 202, y: 96, w: 118, h: 48 }; // 찬물 입자 창(우하단)

function particleWindow(win: { x: number; y: number; w: number; h: number }, ns: string, label: string, color: string): string {
  const pts = particleGrid(3, 2, win.x + win.w / 2 + 14, win.y + 32, 14);
  return `<g>
    <rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="8" fill="#FFFFFF" stroke="#F1E0D8" stroke-width="1.4"/>
    <text class="${ns}-label" x="${win.x + 8}" y="${win.y + 16}" font-size="10.5" font-weight="800" fill="${color}">${label}</text>
    ${pts.map((p, i) => `<circle class="${ns}" data-i="${i}" cx="${p.x}" cy="${p.y}" r="4.2" fill="${tempColor(0.5)}" stroke="#FFFFFF" stroke-width="1.1"/>`).join("")}
  </g>`;
}

export const contactGraphLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CglStep;
  const tm = h3Timers();
  const rnd = seededRandom(7);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = h3Goals(
    [
      { id: "watch", name: "관찰", sub: "센서 연결" },
      { id: "dir", name: "열의 방향", sub: "그래프 완성 뒤" },
      { id: "part", name: "입자 운동", sub: "방향 판정 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 열은 <b>뜨거운 물체에서 차가운 물체로</b> 흐르고, 온도가 같아진 상태가 <b>열평형</b>이에요.";
      api.enableCTA(s.cta ?? "열평형 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = h3Helper("열량계의 <b>뜨거운 물(70℃)</b> 속에 <b>찬물(10℃)</b> 컵을 넣었어요. 센서를 연결하고 두 온도를 지켜보세요.");

  const graph = el("div", { class: "cgl-graph" });
  graph.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="${GX0}" y1="${GY0 - 4}" x2="${GX0}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${GX0}" y1="${GY0 + GH}" x2="${GX0 + GW + 6}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[0, 20, 40, 60, 80].map((v) => `<line x1="${GX0 - 4}" y1="${yOf(v)}" x2="${GX0 + GW}" y2="${yOf(v)}" stroke="#EEF0F3" stroke-width="1"/><text x="${GX0 - 7}" y="${yOf(v) + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#8B95A1">${v}</text>`).join("")}
    <text x="4" y="14" font-size="11" font-weight="800" fill="${H3.sub}">℃</text>
    <text x="${GX0 + GW / 2}" y="${GY0 + GH + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="${H3.sub}">시간</text>
    <polyline class="cgl-line cgl-hotline" points="" stroke="${H3.hot}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="cgl-line cgl-coldline" points="" stroke="${H3.cold}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    ${particleWindow(WIN_H, "cgl-ph", "뜨거운 물 70℃", H3.hot)}
    ${particleWindow(WIN_C, "cgl-pc", "찬물 10℃", H3.cold)}
  </svg>`;
  const board = el("div", { class: "ht3-board cgl-board" }, graph);

  const btn = h3Btn("cgl-btn", "센서 연결하고 관찰 시작");
  const slot = h3Slot(tm, "cgl-q", btn);

  const hotLabel = graph.querySelector(".cgl-ph-label") as SVGTextElement;
  const coldLabel = graph.querySelector(".cgl-pc-label") as SVGTextElement;
  const ph = Array.from(graph.querySelectorAll<SVGCircleElement>(".cgl-ph"));
  const pc = Array.from(graph.querySelectorAll<SVGCircleElement>(".cgl-pc"));
  const hotLine = graph.querySelector(".cgl-hotline") as SVGPolylineElement;
  const coldLine = graph.querySelector(".cgl-coldline") as SVGPolylineElement;

  let hot = HOT0;
  let cold = COLD0;
  const hotPts: string[] = [];
  const coldPts: string[] = [];

  function jitter(): void {
    if (!tm.alive()) return;
    const jit = (nodes: SVGCircleElement[], T: number, cx: number, cy: number): void => {
      const p = T / 80;
      const amp = 0.4 + 4.2 * Math.pow(p, 1.1);
      const base = particleGrid(3, 2, cx, cy, 12 + 4 * p);
      nodes.forEach((c, i) => {
        c.setAttribute("cx", (base[i].x + (rnd() - 0.5) * 2 * amp).toFixed(1));
        c.setAttribute("cy", (base[i].y + (rnd() - 0.5) * 2 * amp).toFixed(1));
        c.setAttribute("fill", tempColor(0.1 + 0.85 * p));
      });
    };
    jit(ph, hot, WIN_H.x + WIN_H.w / 2 + 14, WIN_H.y + 32);
    jit(pc, cold, WIN_C.x + WIN_C.w / 2 + 14, WIN_C.y + 32);
    tm.later(jitter, 90);
  }

  let i = 0;
  function tick(): void {
    const k = Math.exp(-i / 9);
    hot = i >= N ? TEQ : TEQ + (HOT0 - TEQ) * k;
    cold = i >= N ? TEQ : TEQ - (TEQ - COLD0) * k;
    hotLabel.textContent = `뜨거운 물 ${Math.round(hot)}℃`;
    coldLabel.textContent = `찬물 ${Math.round(cold)}℃`;
    hotPts.push(`${xOf(i).toFixed(1)},${yOf(hot).toFixed(1)}`);
    coldPts.push(`${xOf(i).toFixed(1)},${yOf(cold).toFixed(1)}`);
    hotLine.setAttribute("points", hotPts.join(" "));
    coldLine.setAttribute("points", coldPts.join(" "));
    i += 1;
    if (i > N) {
      haptic(HAPTIC.correct);
      goals.collect("watch", "온도가 같아짐!");
      helper.innerHTML = "두 곡선이 <b>40℃</b>에서 만났어요. 뜨거운 물은 식고 찬물은 데워져 <b>온도가 같아졌죠</b>.";
      tm.later(askDir, 800);
      return;
    }
    tm.later(tick, 170);
  }

  function askDir(): void {
    slot.ask(
      "온도가 같아지는 동안, <b>열은 어느 쪽으로</b> 이동했을까요?",
      [
        { t: "뜨거운 물에서 찬물로", ok: true },
        { t: "찬물에서 뜨거운 물로", ok: false },
        { t: "두 물 모두 바깥으로만 빠져나갔다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 열은 <b>뜨거운 쪽에서 차가운 쪽으로</b> 옮겨 갔어요. 이제 입자 창을 다시 보세요."
          : "뜨거운 물은 <b>식었고</b>(열을 잃음) 찬물은 <b>데워졌어요</b>(열을 얻음). 열은 높은 쪽에서 낮은 쪽으로 가요.";
        goals.collect("dir", ok ? "정확한 판정!" : "판정 완료");
        tm.later(askPart, 1400);
      },
    );
  }

  function askPart(): void {
    slot.ask(
      "열평형이 된 뒤, 두 물의 <b>입자 운동</b>은 어떻게 되었나요?",
      [
        { t: "활발한 정도가 서로 같아졌다", ok: true },
        { t: "두 물 모두 입자가 멈췄다", ok: false },
        { t: "뜨거웠던 물의 입자만 여전히 훨씬 활발하다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "맞아요! 열을 잃은 쪽은 <b>둔해지고</b> 얻은 쪽은 <b>활발해져서</b> 활발한 정도가 같아졌어요."
          : "입자 창을 보세요. 둘 다 움직이고 있고, <b>활발한 정도가 서로 같아졌어요</b>. 온도가 같다는 뜻이에요.";
        goals.collect("part", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (i > 0) return;
    haptic(HAPTIC.tap);
    btn.disabled = true;
    btn.textContent = "관찰 중…";
    helper.innerHTML = "센서 연결! 두 온도가 어떻게 변하는지, 입자 창의 움직임도 함께 보세요.";
    tm.later(tick, 300);
  });

  host.append(goals.chips, helper, board, slot.el);

  jitter();
  api.setCTA("센서를 연결해서 관찰을 시작하세요", { enabled: false });
  return () => tm.clear();
};
