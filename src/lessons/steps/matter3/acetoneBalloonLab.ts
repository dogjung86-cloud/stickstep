// [중1 Ⅳ v3] L4 acetoneBalloonLab — 「아세톤 풍선, 기화하면 얼마나 커질까」(교과서 해 보기 재현).
// 한 통찰: 액체가 기화하면 입자 사이의 거리가 매우 멀어져 부피가 크게 늘어난다. 입자의 종류·개수는 그대로다.
// 조작: 따뜻한 바람 불기(버튼) → 풍선 관찰 → 부피 판정 → 개수 판정.
// 목표 3: 풍선 관찰 → 부피 판정 → 개수 판정. 입자 창은 액체 무리 → 기체 흩어짐 좌표 보간(자가 예약 setTimeout).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { M3, flaskSvg, seededRandom, stateParticles, type Pt } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3AskBox, m3Goals, m3Helper, m3Reveal, m3Timers } from "./m3Lab";

interface AblStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N_TICK = 20;
const FX = 118, BASE = 214, FH = 100; // 플라스크 바닥 중심·높이
const NECK_TOP = BASE - FH;
const WIN = { x: 226, y: 36, w: 104, h: 156 };

export const acetoneBalloonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as AblStep;
  const tm = m3Timers();
  const rnd = seededRandom(91);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "watch", name: "풍선 관찰", sub: "바람을 불면" },
      { id: "vol", name: "부피 판정", sub: "관찰 뒤" },
      { id: "count", name: "개수 판정", sub: "부피 판정 뒤" },
    ],
    () => {
      helper.innerHTML =
        "정리! 아세톤이 기화하면서 <b>입자 사이의 거리가 매우 멀어져</b> 부피가 크게 늘어났어요. 하지만 <b>입자의 종류와 개수는 그대로</b>라 물질의 성질과 질량은 변하지 않죠. 융해·기화·승화(고체→기체)는 부피가 <b>늘고</b>, 응고·액화·승화(기체→고체)는 부피가 <b>줄어요</b>.";
      api.enableCTA(s.cta ?? "입자 배열 정리하기");
    },
  );
  const helper = m3Helper("삼각 플라스크에 <b>아세톤</b>을 아주 조금(1 mL) 넣고 입구에 <b>고무풍선</b>을 씌웠어요. 아세톤은 낮은 온도에서도 잘 기화하는 액체예요. 플라스크 바닥에 <b>머리 말리개의 따뜻한 바람</b>을 불어 볼게요. 아래 버튼을 누르세요.");

  const liq = stateParticles("liquid", WIN.x, WIN.y, WIN.w, WIN.h, rnd);
  const gas = stateParticles("gas", WIN.x, WIN.y, WIN.w, WIN.h, rnd, 5, 20);
  const stage = el("div", { class: "abl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 234" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="ablBalloonG" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#FFB3C6"/><stop offset="0.6" stop-color="#F06595"/><stop offset="1" stop-color="#C2255C"/></radialGradient>
      <linearGradient id="ablDryerG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8F9FA"/><stop offset="1" stop-color="#C3CBD4"/></linearGradient>
    </defs>
    <ellipse cx="${FX}" cy="224" rx="76" ry="6" fill="#2A3A5E" opacity="0.10"/>
    <ellipse class="abl-balloon" cx="${FX}" cy="${NECK_TOP - 14}" rx="12" ry="14" fill="url(#ablBalloonG)" stroke="#A61E4D" stroke-width="1.6"/>
    ${flaskSvg(FX, BASE, FH, "abl", "#D0EBFF", 0.22)}
    <path d="M${FX - 16} ${NECK_TOP + 2} h32" stroke="#C2255C" stroke-width="5" stroke-linecap="round"/>
    <g class="abl-dryer">
      <rect x="16" y="150" width="46" height="26" rx="8" fill="url(#ablDryerG)" stroke="#8B95A1" stroke-width="2"/>
      <rect x="58" y="156" width="14" height="14" rx="3" fill="#8B95A1"/>
      <rect x="22" y="176" width="14" height="26" rx="4" fill="#8B95A1"/>
    </g>
    <g class="abl-wind">
      ${[150, 160, 170].map((y, i) => `<path d="M76 ${y + i * 2} h22 M104 ${y + i * 2 + 1} h14" stroke="${M3.warm}" stroke-width="2.4" stroke-linecap="round" opacity="0.9"/>`).join("")}
    </g>
    <text x="${FX}" y="20" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">고무풍선을 씌운 플라스크</text>
    <text class="abl-note" x="${FX}" y="232" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">아세톤 1 mL</text>
    <g class="abl-win">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="10" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">입자의 눈</text>
      ${liq.map((p, i) => `<circle class="abl-p" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4"/>`).join("")}
      <text class="abl-wintxt" x="${WIN.x + WIN.w / 2}" y="${WIN.y + WIN.h + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">액체: 12개, 가까이</text>
    </g>
  </svg>`;
  const board = el("div", { class: "mt3-board abl-board" }, stage);

  const btn = el("button", { class: "mt3-btn abl-btn", text: "따뜻한 바람 불기", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "mt3-btnrow" }, btn);
  const qBox = m3AskBox("abl-q mt3-q");

  const balloon = stage.querySelector(".abl-balloon") as SVGEllipseElement;
  const liqPath = stage.querySelector(".abl-liq") as SVGPathElement;
  const pEls = Array.from(stage.querySelectorAll<SVGCircleElement>(".abl-p"));
  const wintxt = stage.querySelector(".abl-wintxt") as SVGTextElement;
  const note = stage.querySelector(".abl-note") as SVGTextElement;

  type Phase = "idle" | "run" | "ran" | "askVol" | "askCount" | "done";
  let phase: Phase = "idle";
  let prog = 0;

  function jitter(): void {
    if (!tm.alive()) return;
    pEls.forEach((c, i) => {
      const a: Pt = liq[i], b: Pt = gas[i];
      const amp = 1.5 + 4 * prog;
      c.setAttribute("cx", (a.x + (b.x - a.x) * prog + (rnd() - 0.5) * amp).toFixed(1));
      c.setAttribute("cy", (a.y + (b.y - a.y) * prog + (rnd() - 0.5) * amp).toFixed(1));
    });
    tm.later(jitter, 150);
  }

  function tick(i: number): void {
    const t = i / N_TICK;
    const e = 1 - Math.pow(1 - t, 2);
    prog = e;
    const ry = 14 + 30 * e, rx = 12 + 30 * e;
    balloon.setAttribute("rx", rx.toFixed(1));
    balloon.setAttribute("ry", ry.toFixed(1));
    balloon.setAttribute("cy", (NECK_TOP - ry).toFixed(1));
    liqPath.setAttribute("opacity", (0.6 * (1 - e)).toFixed(2));
    if (i === 8) wintxt.textContent = "기화 중: 사이가 멀어져요";
    if (i >= N_TICK) {
      phase = "ran";
      wintxt.textContent = "기체: 12개, 매우 멀리";
      note.textContent = "액체 아세톤이 거의 다 기체가 됐어요";
      goals.collect("watch", "빵빵!");
      haptic(HAPTIC.correct);
      btn.textContent = "관찰 끝";
      board.classList.remove("blowing");
      helper.innerHTML = "풍선이 <b>빵빵하게 부풀었어요</b>. 플라스크 바닥의 액체 아세톤은 거의 사라졌고요. 입자 창에서는 입자들이 <b>매우 멀리</b> 흩어졌죠. 풍선은 왜 부풀었을까요?";
      tm.later(askVol, 700);
      return;
    }
    tm.later(() => tick(i + 1), 200);
  }

  function askVol(): void {
    phase = "askVol";
    b4Ask(
      qBox,
      "풍선이 <b>부풀어 오른</b> 까닭은 무엇일까요?",
      [
        { t: "아세톤이 기화하면서 입자 사이의 거리가 크게 멀어져 부피가 늘어나서", ok: true },
        { t: "머리 말리개의 바람이 풍선 속으로 들어가서", ok: false },
        { t: "아세톤 입자의 개수가 늘어나서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 바람은 플라스크 <b>바깥</b> 바닥에만 닿았고, 풍선 속으로 들어갈 길은 없었죠. 액체 아세톤이 <b>기화</b>하면서 입자 사이가 매우 멀어져 부피가 크게 늘어난 거예요. 그럼 입자의 개수는?"
          : "풍선은 플라스크 입구를 꽉 막고 있어서 바람이 들어갈 수 없어요. 입자가 늘어난 것도 아니고요. 액체 아세톤이 <b>기화</b>하면서 <b>입자 사이의 거리가 매우 멀어져</b> 부피가 크게 늘어난 거예요. 그럼 입자의 개수는?";
        goals.collect("vol", ok ? "정확한 판정!" : "판정 완료");
        tm.later(askCount, 1400);
      },
    );
    m3Reveal(tm, qBox);
  }

  function askCount(): void {
    phase = "askCount";
    b4Ask(
      qBox,
      "기화한 뒤, 플라스크 안 아세톤 <b>입자의 종류와 개수</b>는 어떻게 되었나요?",
      [
        { t: "종류도 개수도 그대로다", ok: true },
        { t: "개수가 훨씬 늘어났다", ok: false },
        { t: "다른 종류의 입자로 바뀌었다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 입자 창의 입자는 처음부터 끝까지 <b>12개, 같은 입자</b>였어요. 달라진 건 <b>사이의 거리와 배열</b>뿐. 그래서 상태가 변해도 물질의 성질과 질량은 변하지 않아요."
          : "입자 창을 세어 보세요. 처음에도 나중에도 <b>12개</b>, 모양도 같은 입자예요. 상태 변화는 입자가 늘거나 다른 것으로 바뀌는 일이 아니라 <b>입자 사이의 거리와 배열</b>이 바뀌는 일이랍니다.";
        goals.collect("count", ok ? "정확한 판정!" : "판정 완료");
        phase = "done";
      },
    );
    m3Reveal(tm, qBox);
  }

  btn.addEventListener("click", () => {
    if (btn.disabled || phase !== "idle") return;
    haptic(HAPTIC.tap);
    phase = "run";
    btn.disabled = true;
    btn.textContent = "바람을 부는 중…";
    board.classList.add("blowing");
    helper.innerHTML = "따뜻한 바람을 플라스크 바닥에 불고 있어요. 풍선과 입자 창을 함께 보세요.";
    tm.later(() => tick(1), 400);
  });

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  jitter();
  api.setCTA("따뜻한 바람을 불어 보세요", { enabled: false });
  return () => tm.clear();
};
