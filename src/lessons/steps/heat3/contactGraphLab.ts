// [중1 Ⅲ v3] L2 contactGraphLab — 「열량계 관찰」(교과서 탐구 재현: 온도가 만나는 순간).
// 한 통찰: 온도가 다른 두 물체가 닿으면 열은 뜨거운 쪽에서 차가운 쪽으로 이동해 결국 온도가 같아진다(열평형).
// 조작: 버튼 1개(센서 연결). 왼쪽 열량계(뜨거운 물 속에 넣은 찬물 컵)의 온도 표시와 물 색이 변하고, 오른쪽 그래프에
// 두 곡선이 자라 만난다. 입자는 따로 창을 두지 않고 두 물속에 직접 그려 활발한 정도가 같아지는 것을 보인다.
// 한 화면 예산 재조정(2026-09-04): 첫 판(장면 + 그래프 세로 쌓기)은 한 화면을 넘겨 그래프 한 장으로 줄였더니
// "찬물 컵을 넣고 진행하는 실험"이 사라졌다는 피드백 — 장면과 그래프를 한 보드(340×180)에 좌우로 나눠 되살렸다.
// 목표 3: 관찰(열평형 도달) → 방향 판정 → 입자 판정. 판정은 버튼 자리에 교체, 오답은 정답 카드(b4Ask)로.

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
// 오른쪽 그래프(보드 x 158~334)
const GX0 = 186, GY0 = 18, GW = 140, GH = 118;
const yOf = (T: number): number => GY0 + GH - (T / 80) * GH;
const xOf = (i: number): number => GX0 + 4 + (i / N) * (GW - 8);
// 왼쪽 장면 — 뜨거운 물 입자 6개(컵 왼쪽 물속), 찬물 입자 4개(컵 속)
const HOTP = { cx: 48, cy: 106, cols: 2, rows: 3 };
const COLDP = { cx: 104, cy: 104, cols: 2, rows: 2 };

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

  const hotPts0 = particleGrid(HOTP.cols, HOTP.rows, HOTP.cx, HOTP.cy, 18);
  const coldPts0 = particleGrid(COLDP.cols, COLDP.rows, COLDP.cx, COLDP.cy, 14);
  const stage = el("div", { class: "cgl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- 열량계: 바깥 통(뜨거운 물) 속에 찬물 컵 -->
    <rect x="14" y="40" width="130" height="118" rx="10" fill="#E9EDF2" stroke="#8B95A1" stroke-width="2.6"/>
    <rect class="cgl-hotliq" x="20" y="58" width="118" height="94" rx="6" fill="${tempColor(0.9)}" opacity="0.55"/>
    <rect x="78" y="46" width="52" height="92" rx="6" fill="#F7F8FA" stroke="#8B95A1" stroke-width="2.2"/>
    <rect class="cgl-coldliq" x="82" y="68" width="44" height="66" rx="4" fill="${tempColor(0.1)}" opacity="0.6"/>
    <!-- 온도 센서 2개(줄 + 표시) -->
    <path d="M38 24 v56" stroke="${H3.hot}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="38" cy="82" r="3.5" fill="${H3.hot}"/>
    <path d="M104 24 v54" stroke="${H3.cold}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="104" cy="80" r="3.5" fill="${H3.cold}"/>
    <rect x="14" y="6" width="48" height="18" rx="9" fill="#FFFFFF" stroke="${H3.hot}" stroke-width="2"/>
    <text class="cgl-hotread" x="38" y="19" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.hot}">70℃</text>
    <rect x="80" y="6" width="48" height="18" rx="9" fill="#FFFFFF" stroke="${H3.cold}" stroke-width="2"/>
    <text class="cgl-coldread" x="104" y="19" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.cold}">10℃</text>
    <!-- 입자의 눈: 두 물속에 직접 -->
    ${hotPts0.map((p, i) => `<circle class="cgl-ph" data-i="${i}" cx="${p.x}" cy="${p.y}" r="4.2" fill="${tempColor(0.9)}" stroke="#FFFFFF" stroke-width="1.1"/>`).join("")}
    ${coldPts0.map((p, i) => `<circle class="cgl-pc" data-i="${i}" cx="${p.x}" cy="${p.y}" r="4.2" fill="${tempColor(0.1)}" stroke="#FFFFFF" stroke-width="1.1"/>`).join("")}
    <!-- 그래프 -->
    <line x1="${GX0}" y1="${GY0 - 4}" x2="${GX0}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${GX0}" y1="${GY0 + GH}" x2="${GX0 + GW + 4}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[0, 20, 40, 60, 80].map((v) => `<line x1="${GX0 - 3}" y1="${yOf(v)}" x2="${GX0 + GW}" y2="${yOf(v)}" stroke="#EEF0F3" stroke-width="1"/><text x="${GX0 - 6}" y="${yOf(v) + 4}" text-anchor="end" font-size="10" font-weight="700" fill="#8B95A1">${v}</text>`).join("")}
    <text x="${GX0 - 6}" y="9" text-anchor="end" font-size="10" font-weight="800" fill="${H3.sub}">℃</text>
    <text x="${GX0 + GW / 2}" y="${GY0 + GH + 17}" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.sub}">시간</text>
    <polyline class="cgl-line cgl-hotline" points="" stroke="${H3.hot}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="cgl-line cgl-coldline" points="" stroke="${H3.cold}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  const board = el("div", { class: "ht3-board cgl-board" }, stage);

  const btn = h3Btn("cgl-btn", "센서 연결하고 관찰 시작");
  const slot = h3Slot(tm, "cgl-q", btn);

  const hotRead = stage.querySelector(".cgl-hotread") as SVGTextElement;
  const coldRead = stage.querySelector(".cgl-coldread") as SVGTextElement;
  const hotLiq = stage.querySelector(".cgl-hotliq") as SVGRectElement;
  const coldLiq = stage.querySelector(".cgl-coldliq") as SVGRectElement;
  const ph = Array.from(stage.querySelectorAll<SVGCircleElement>(".cgl-ph"));
  const pc = Array.from(stage.querySelectorAll<SVGCircleElement>(".cgl-pc"));
  const hotLine = stage.querySelector(".cgl-hotline") as SVGPolylineElement;
  const coldLine = stage.querySelector(".cgl-coldline") as SVGPolylineElement;

  let hot = HOT0;
  let cold = COLD0;
  const hotPts: string[] = [];
  const coldPts: string[] = [];

  // 입자 흔들림 — 온도가 높을수록 진폭이 크고, 열평형에 이르면 두 물의 진폭이 같아진다.
  function jitter(): void {
    if (!tm.alive()) return;
    const jit = (nodes: SVGCircleElement[], T: number, base: { x: number; y: number }[]): void => {
      const p = T / 80;
      const amp = 0.4 + 4.2 * Math.pow(p, 1.1);
      nodes.forEach((c, i) => {
        c.setAttribute("cx", (base[i].x + (rnd() - 0.5) * 2 * amp).toFixed(1));
        c.setAttribute("cy", (base[i].y + (rnd() - 0.5) * 2 * amp).toFixed(1));
        c.setAttribute("fill", tempColor(0.1 + 0.85 * p));
      });
    };
    jit(ph, hot, hotPts0);
    jit(pc, cold, coldPts0);
    tm.later(jitter, 90);
  }

  let i = 0;
  function tick(): void {
    const k = Math.exp(-i / 9);
    hot = i >= N ? TEQ : TEQ + (HOT0 - TEQ) * k;
    cold = i >= N ? TEQ : TEQ - (TEQ - COLD0) * k;
    hotRead.textContent = `${Math.round(hot)}℃`;
    coldRead.textContent = `${Math.round(cold)}℃`;
    hotLiq.setAttribute("fill", tempColor(0.15 + 0.75 * (hot / 80)));
    coldLiq.setAttribute("fill", tempColor(0.15 + 0.75 * (cold / 80)));
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
          ? "정확해요! 열은 <b>뜨거운 쪽에서 차가운 쪽으로</b> 옮겨 갔어요. 이제 물속 입자를 다시 보세요."
          : "뜨거운 물은 <b>식었고</b>(열을 잃음) 찬물은 <b>데워졌어요</b>(열을 얻음). 열은 높은 쪽에서 낮은 쪽으로 가요.";
        goals.collect("dir", ok ? "정확한 판정!" : "판정 완료");
      },
      { why: "뜨거운 물은 <b>식고</b> 찬물은 <b>데워졌어요</b>. 열은 높은 쪽에서 낮은 쪽으로 가요.", onNext: askPart },
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
          : "물속 입자를 보세요. 둘 다 움직이고 있고, <b>활발한 정도가 서로 같아졌어요</b>. 온도가 같다는 뜻이에요.";
        goals.collect("part", ok ? "정확한 판정!" : "판정 완료");
      },
      { why: "둘 다 움직이지만 <b>활발한 정도가 서로 같아졌어요</b>. 온도가 같다는 뜻이에요." },
    );
  }

  btn.addEventListener("click", () => {
    if (i > 0) return;
    haptic(HAPTIC.tap);
    btn.disabled = true;
    btn.textContent = "관찰 중…";
    helper.innerHTML = "센서 연결! 두 온도가 어떻게 변하는지, 물속 입자의 움직임도 함께 보세요.";
    tm.later(tick, 300);
  });

  host.append(goals.chips, helper, board, slot.el);

  jitter();
  api.setCTA("센서를 연결해서 관찰을 시작하세요", { enabled: false });
  return () => tm.clear();
};
