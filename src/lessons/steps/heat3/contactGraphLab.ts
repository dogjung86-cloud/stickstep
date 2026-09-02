// [중1 Ⅲ v3] L2 contactGraphLab — 「열량계 관찰, 온도가 만나는 순간」(교과서 탐구 재현).
// 한 통찰: 온도가 다른 두 물체가 닿으면 열은 뜨거운 쪽에서 차가운 쪽으로 이동해 결국 온도가 같아진다(열평형).
// 조작: 버튼 1개(센서 연결). 두 온도 곡선이 점점이 자라 만나고, 입자 창 2개가 실시간으로 활발도를 바꾼다.
// 목표 3: 관찰(열평형 도달) → 방향 판정 → 입자 판정.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { H3, tempColor, particleGrid, seededRandom } from "../../../ui/heat3Kit";
import type { StepRenderer } from "../../types";
import { h3AskBox, h3Goals, h3Helper, h3Timers } from "./h3Lab";

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
const GX0 = 44, GY0 = 12, GW = 268, GH = 112;
const yOf = (T: number): number => GY0 + GH - (T / 80) * GH;
const xOf = (i: number): number => GX0 + 6 + (i / N) * (GW - 12);

function particleWindow(x: number, y: number, ns: string, label: string): string {
  const pts = particleGrid(3, 2, x + 32, y + 24, 16);
  return `<g>
    <rect x="${x}" y="${y}" width="64" height="48" rx="8" fill="#F4F8FC" stroke="#C9D3DE" stroke-width="1.6"/>
    ${pts.map((p, i) => `<circle class="${ns}" data-i="${i}" cx="${p.x}" cy="${p.y}" r="4.5" fill="${tempColor(0.5)}" stroke="#FFFFFF" stroke-width="1.2"/>`).join("")}
    <text x="${x + 32}" y="${y + 62}" text-anchor="middle" font-size="10" font-weight="800" fill="${H3.sub}">${label}</text>
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
      helper.innerHTML =
        "정리! 온도가 다른 두 물체가 접촉하면 <b>열은 온도가 높은 물체에서 낮은 물체로</b> 이동하고, 두 물체의 <b>온도가 같아진 상태</b>가 <b>열평형</b>이에요. 열을 잃은 쪽 입자는 둔해지고, 얻은 쪽은 활발해져 결국 <b>활발한 정도가 같아지죠</b>.";
      api.enableCTA(s.cta ?? "열평형 정리하기");
    },
  );
  const helper = h3Helper("열량계에 <b>뜨거운 물(70℃)</b>을 붓고, <b>찬물(10℃)</b>이 든 알루미늄 컵을 넣었어요. 아래 버튼으로 <b>온도 센서를 연결</b>하고 두 물의 온도가 어떻게 변하는지 지켜보세요.");

  const stage = el("div", { class: "cgl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 168" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="110" cy="160" rx="96" ry="6" fill="#2A3A5E" opacity="0.10"/>
    <rect x="30" y="34" width="160" height="120" rx="12" fill="#E9EDF2" stroke="#8B95A1" stroke-width="3"/>
    <rect class="cgl-hotliq" x="38" y="60" width="144" height="88" rx="8" fill="${tempColor(0.9)}" opacity="0.55"/>
    <rect x="76" y="44" width="68" height="96" rx="8" fill="#F1F3F5" stroke="#8B95A1" stroke-width="2.4"/>
    <rect class="cgl-coldliq" x="80" y="70" width="60" height="66" rx="6" fill="${tempColor(0.1)}" opacity="0.6"/>
    <path d="M52 20 v40 M52 20 h-14" stroke="${H3.hot}" stroke-width="3" stroke-linecap="round"/>
    <path d="M110 20 v52 M110 20 h14" stroke="${H3.cold}" stroke-width="3" stroke-linecap="round"/>
    <rect x="8" y="6" width="56" height="20" rx="8" fill="#FFFFFF" stroke="${H3.hot}" stroke-width="2"/>
    <text class="cgl-hotread" x="36" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.hot}">70℃</text>
    <rect x="118" y="6" width="56" height="20" rx="8" fill="#FFFFFF" stroke="${H3.cold}" stroke-width="2"/>
    <text class="cgl-coldread" x="146" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.cold}">10℃</text>
    <text x="110" y="150" text-anchor="middle" font-size="10" font-weight="800" fill="${H3.sub}">열량계</text>
    ${particleWindow(212, 20, "cgl-ph", "뜨거운 물의 입자")}
    ${particleWindow(212, 96, "cgl-pc", "찬물의 입자")}
  </svg>`;
  const graph = el("div", { class: "cgl-graph" });
  graph.innerHTML = `
  <svg viewBox="0 0 340 152" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="${GX0}" y1="${GY0 - 4}" x2="${GX0}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${GX0}" y1="${GY0 + GH}" x2="${GX0 + GW + 6}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[0, 20, 40, 60, 80].map((v) => `<line x1="${GX0 - 4}" y1="${yOf(v)}" x2="${GX0 + GW}" y2="${yOf(v)}" stroke="#E5E8EB" stroke-width="1"/><text x="${GX0 - 8}" y="${yOf(v) + 4}" text-anchor="end" font-size="10" font-weight="700" fill="#8B95A1">${v}</text>`).join("")}
    <text x="12" y="${GY0 + 4}" font-size="10" font-weight="800" fill="${H3.sub}">온도(℃)</text>
    <text x="${GX0 + GW / 2}" y="${GY0 + GH + 22}" text-anchor="middle" font-size="11" font-weight="800" fill="${H3.sub}">시간</text>
    <polyline class="cgl-line cgl-hotline" points="" stroke="${H3.hot}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="cgl-line cgl-coldline" points="" stroke="${H3.cold}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="cgl-eq" opacity="0">
      <rect x="${xOf(N) - 66}" y="${yOf(TEQ) - 30}" width="60" height="20" rx="10" fill="#E6FCF5" stroke="${H3.ok}" stroke-width="1.8"/>
      <text x="${xOf(N) - 36}" y="${yOf(TEQ) - 16}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0A8F4E">열평형</text>
    </g>
  </svg>`;
  const board = el("div", { class: "ht3-board cgl-board" }, stage, graph);

  const btn = el("button", { class: "ht3-btn cgl-btn", text: "센서 연결하고 관찰 시작", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "ht3-btnrow" }, btn);
  const qBox = h3AskBox("cgl-q");

  const hotRead = stage.querySelector(".cgl-hotread") as SVGTextElement;
  const coldRead = stage.querySelector(".cgl-coldread") as SVGTextElement;
  const hotLiq = stage.querySelector(".cgl-hotliq") as SVGRectElement;
  const coldLiq = stage.querySelector(".cgl-coldliq") as SVGRectElement;
  const ph = Array.from(stage.querySelectorAll<SVGCircleElement>(".cgl-ph"));
  const pc = Array.from(stage.querySelectorAll<SVGCircleElement>(".cgl-pc"));
  const hotLine = graph.querySelector(".cgl-hotline") as SVGPolylineElement;
  const coldLine = graph.querySelector(".cgl-coldline") as SVGPolylineElement;
  const eqTag = graph.querySelector(".cgl-eq") as SVGGElement;

  let hot = HOT0;
  let cold = COLD0;
  const hotPts: string[] = [];
  const coldPts: string[] = [];

  function jitter(): void {
    if (!tm.alive()) return;
    const jit = (nodes: SVGCircleElement[], T: number, cx: number, cy: number): void => {
      const p = T / 80;
      const amp = 0.4 + 5 * Math.pow(p, 1.1);
      const base = particleGrid(3, 2, cx, cy, 14 + 4 * p);
      nodes.forEach((c, i) => {
        c.setAttribute("cx", (base[i].x + (rnd() - 0.5) * 2 * amp).toFixed(1));
        c.setAttribute("cy", (base[i].y + (rnd() - 0.5) * 2 * amp).toFixed(1));
        c.setAttribute("fill", tempColor(0.1 + 0.85 * p));
      });
    };
    jit(ph, hot, 244, 44);
    jit(pc, cold, 244, 120);
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
      eqTag.setAttribute("opacity", "1");
      btn.textContent = "관찰 완료";
      haptic(HAPTIC.correct);
      goals.collect("watch", "온도가 같아짐!");
      helper.innerHTML = "두 곡선이 <b>40℃</b>에서 만났어요. 뜨거운 물은 식고 찬물은 데워져서 결국 <b>온도가 같아졌죠</b>. 그럼 이 사이에 무슨 일이 있었던 걸까요?";
      tm.later(askDir, 800);
      return;
    }
    tm.later(tick, 170);
  }

  function askDir(): void {
    b4Ask(
      qBox,
      "온도가 같아지는 동안, <b>열은 어느 쪽으로</b> 이동했을까요?",
      [
        { t: "뜨거운 물에서 찬물로", ok: true },
        { t: "찬물에서 뜨거운 물로", ok: false },
        { t: "두 물 모두 바깥으로만 빠져나갔다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 열은 <b>온도가 높은 뜨거운 물에서 온도가 낮은 찬물로</b> 이동했어요. 그래서 뜨거운 물은 식고 찬물은 데워졌죠. 이제 오른쪽 <b>입자 창</b>을 다시 보세요."
          : "그래프를 다시 봐요. 뜨거운 물은 <b>식었고</b>(열을 잃음) 찬물은 <b>데워졌어요</b>(열을 얻음). 열은 <b>온도가 높은 쪽에서 낮은 쪽으로</b> 이동한답니다. 이제 오른쪽 <b>입자 창</b>을 다시 보세요.";
        goals.collect("dir", ok ? "정확한 판정!" : "판정 완료");
        tm.later(askPart, 1400);
      },
    );
  }

  function askPart(): void {
    b4Ask(
      qBox,
      "열평형이 된 뒤, 두 물의 <b>입자 운동</b>은 어떻게 되었나요?",
      [
        { t: "활발한 정도가 서로 같아졌다", ok: true },
        { t: "두 물 모두 입자가 멈췄다", ok: false },
        { t: "뜨거웠던 물의 입자만 여전히 훨씬 활발하다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "맞아요! 열을 잃은 쪽은 <b>둔해지고</b>, 열을 얻은 쪽은 <b>활발해져서</b> 결국 두 물의 입자 운동이 <b>똑같이 활발</b>해졌어요. 온도가 같다는 건 바로 이 뜻이에요."
          : "입자 창을 보세요. 둘 다 여전히 움직이고 있고, 그 <b>활발한 정도가 서로 같아졌어요</b>. 온도가 같다는 건 입자 운동의 활발함이 같다는 뜻이랍니다.";
        goals.collect("part", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (i > 0) return;
    haptic(HAPTIC.tap);
    btn.disabled = true;
    btn.textContent = "관찰 중…";
    helper.innerHTML = "센서를 연결했어요! 두 온도가 어떻게 변하는지, 그리고 오른쪽 <b>입자 창</b>의 움직임도 함께 보세요.";
    tm.later(tick, 300);
  });

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  jitter();
  api.setCTA("센서를 연결해서 관찰을 시작하세요", { enabled: false });
  return () => tm.clear();
};
