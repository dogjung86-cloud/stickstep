// [중1 Ⅳ v3] L6 freezeCurveLab — 「물이 얼 때의 온도 곡선」(교과서 해 보기: 물이 얼 때의 온도 측정).
// 한 통찰: 물이 어는 동안(응고) 온도는 일정하게 유지된다. 물이 얼음으로 변하는 동안 열에너지를 방출하기 때문이다.
// 조작: 냉각 시작(버튼) → 곡선이 자라며 '온도 일정 구간' → 온도 판정 → 열에너지 판정.
// 목표 3: 냉각 관찰 → 구간 판정 → 열에너지 판정. rAF·캔버스 없음(입자 창은 액체 → 규칙 격자 좌표 보간).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { M3, seededRandom, stateParticles, type Pt } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3AskBox, m3Goals, m3Helper, m3Reveal, m3Timers } from "./m3Lab";

interface FrzStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N = 40;
const TICK_MS = 200;
const GX0 = 44, GY0 = 12, GW = 268, GH = 112;
const T_MIN = -15, T_MAX = 25;
const yOf = (T: number): number => GY0 + GH - ((T - T_MIN) / (T_MAX - T_MIN)) * GH;
const xOf = (i: number): number => GX0 + 6 + (i / N) * (GW - 12);
const tOf = (i: number): number => (i <= 12 ? 20 - (20 * i) / 12 : i <= 28 ? 0 : -(8 * (i - 28)) / 12);
const WIN = { x: 214, y: 24, w: 104, h: 130 };
const TUBE = { x: 96, y: 22, w: 28, h: 138 };

export const freezeCurveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FrzStep;
  const tm = m3Timers();
  const rnd = seededRandom(23);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "watch", name: "냉각 관찰", sub: "센서 연결" },
      { id: "temp", name: "구간 판정", sub: "곡선 완성 뒤" },
      { id: "energy", name: "열에너지", sub: "구간 판정 뒤" },
    ],
    () => {
      helper.innerHTML =
        "정리! 물이 어는 동안(<b>응고</b>) 온도는 <b>일정하게 유지</b>돼요. 물이 얼음으로 변하는 동안 <b>열에너지를 방출</b>하기 때문이죠. 액화·응고·기체에서 고체로의 승화는 모두 열에너지를 <b>방출</b>하는 상태 변화예요. 냉각하면 입자 운동이 둔해지고 사이가 가까워져요.";
      api.enableCTA(s.cta ?? "이용 실험으로");
    },
  );
  const helper = m3Helper("<b>증류수</b>가 든 시험관을 얼음과 소금을 섞은 비커에 넣고 <b>온도 센서</b>를 꽂았어요. 지금 20℃. 아래 버튼으로 센서를 연결하고 온도 곡선과 입자 창을 지켜보세요.");

  const liq = stateParticles("liquid", WIN.x, WIN.y, WIN.w, WIN.h, rnd);
  const sol = stateParticles("solid", WIN.x, WIN.y, WIN.w, WIN.h, rnd);
  const stage = el("div", { class: "frz-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 192" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="frzIceG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.7" stop-color="#E3F0FF"/><stop offset="1" stop-color="#BFD8F2"/></linearGradient>
      <linearGradient id="frzWaterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A6DBFF"/><stop offset="1" stop-color="#5DB2F0"/></linearGradient>
    </defs>
    <ellipse cx="110" cy="170" rx="80" ry="5" fill="#2A3A5E" opacity="0.10"/>
    <rect x="40" y="70" width="140" height="96" rx="8" fill="#EAF4FB" opacity="0.7"/>
    ${[[52, 130, 20], [140, 140, 22], [58, 100, 16], [150, 100, 18], [130, 156, 14]].map(([x, y, w]) => `<path d="M${x} ${y} l${w * 0.3} -${w * 0.6} l${w * 0.7} ${w * 0.1} l${w * 0.1} ${w * 0.5} l-${w * 0.6} ${w * 0.35} Z" fill="url(#frzIceG)" stroke="#8FB3D8" stroke-width="1.2"/>`).join("")}
    ${Array.from({ length: 14 }, () => `<circle cx="${(46 + rnd() * 128).toFixed(1)}" cy="${(78 + rnd() * 80).toFixed(1)}" r="1.4" fill="#FFFFFF" stroke="#B9C2CC" stroke-width="0.6"/>`).join("")}
    <path d="M38 68 v90 a10 10 0 0 0 10 10 h124 a10 10 0 0 0 10 -10 v-90" fill="none" stroke="${M3.glass}" stroke-width="3"/>
    <path d="M32 68 h152" stroke="${M3.glass}" stroke-width="3" stroke-linecap="round"/>
    <g class="frz-tube">
      <rect class="frz-water" x="${TUBE.x + 3}" y="${TUBE.y + 30}" width="${TUBE.w - 6}" height="${TUBE.h - 44}" rx="4" fill="url(#frzWaterG)" opacity="0.8"/>
      <rect class="frz-ice" x="${TUBE.x + 3}" y="${TUBE.y + TUBE.h - 14}" width="${TUBE.w - 6}" height="0" rx="4" fill="url(#frzIceG)" opacity="0.95"/>
      <path d="M${TUBE.x} ${TUBE.y} v${TUBE.h - 14} a14 14 0 0 0 28 0 v-${TUBE.h - 14}" fill="none" stroke="${M3.glass}" stroke-width="2.6"/>
      <path d="M${TUBE.x - 4} ${TUBE.y} h36" stroke="${M3.glass}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M${TUBE.x + 10} ${TUBE.y + 4} v-14 h40" stroke="#4E5968" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M${TUBE.x + 10} ${TUBE.y + 4} v${TUBE.h - 34}" stroke="#4E5968" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="${TUBE.x + 10}" cy="${TUBE.y + TUBE.h - 30}" r="3.5" fill="#4E5968"/>
    </g>
    <rect x="148" y="6" width="56" height="22" rx="8" fill="#FFFFFF" stroke="${M3.cold}" stroke-width="2"/>
    <text class="frz-read" x="176" y="21" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.cold}">20℃</text>
    <g class="frz-frost">${[[44, 76], [172, 80], [48, 154]].map(([x, y]) => `<path d="M${x - 4} ${y} h8 M${x} ${y - 4} v8" stroke="#74B9F0" stroke-width="1.4" stroke-linecap="round"/>`).join("")}</g>
    <text x="110" y="186" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">얼음 + 소금</text>
    <g class="frz-win">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="10" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">입자의 눈</text>
      ${liq.map((p, i) => `<circle class="frz-p" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4"/>`).join("")}
      <text class="frz-wintxt" x="${WIN.x + WIN.w / 2}" y="${WIN.y + WIN.h + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">물: 비교적 자유롭게</text>
    </g>
  </svg>`;
  const graph = el("div", { class: "mt3-graph" });
  graph.innerHTML = `
  <svg viewBox="0 0 340 152" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="${GX0}" y1="${GY0 - 4}" x2="${GX0}" y2="${GY0 + GH}" stroke="#A9B6A9" stroke-width="2.2"/>
    <line x1="${GX0}" y1="${yOf(0)}" x2="${GX0 + GW + 6}" y2="${yOf(0)}" stroke="#A9B6A9" stroke-width="2.2"/>
    ${[-10, 0, 10, 20].map((v) => `<line x1="${GX0 - 4}" y1="${yOf(v)}" x2="${GX0 + GW}" y2="${yOf(v)}" stroke="${v === 0 ? "#D9D2FF" : "#EEF0F3"}" stroke-width="1"/><text x="${GX0 - 8}" y="${yOf(v) + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#8B95A1">${v < 0 ? "−" + Math.abs(v) : v}</text>`).join("")}
    <text x="10" y="${GY0 + 2}" font-size="11" font-weight="800" fill="${M3.sub}">온도(℃)</text>
    <text x="${GX0 + GW / 2}" y="${GY0 + GH + 24}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">냉각 시간</text>
    <polyline class="frz-line" points="" stroke="${M3.cold}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="frz-zone" opacity="0"><rect x="${xOf(13)}" y="${yOf(0) - 26}" width="86" height="20" rx="10" fill="#EEF4FF" stroke="${M3.cold}" stroke-width="1.6"/><text x="${xOf(13) + 43}" y="${yOf(0) - 12}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${M3.cold}">물이 어는 중</text></g>
  </svg>`;
  const board = el("div", { class: "mt3-board frz-board" }, stage, graph);

  const btn = el("button", { class: "mt3-btn frz-btn", text: "센서 연결하고 냉각 시작", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "mt3-btnrow" }, btn);
  const qBox = m3AskBox("frz-q mt3-q");

  const read = stage.querySelector(".frz-read") as SVGTextElement;
  const ice = stage.querySelector(".frz-ice") as SVGRectElement;
  const pEls = Array.from(stage.querySelectorAll<SVGCircleElement>(".frz-p"));
  const wintxt = stage.querySelector(".frz-wintxt") as SVGTextElement;
  const line = graph.querySelector(".frz-line") as SVGPolylineElement;
  const zone = graph.querySelector(".frz-zone") as SVGGElement;
  const pts: string[] = [];
  let i = 0;
  let prog = 0; // 응고 진행(0~1)
  let running = false;

  function jitter(): void {
    if (!tm.alive()) return;
    const amp = 3 - 2.2 * prog;
    pEls.forEach((c, k) => {
      const a: Pt = liq[k], b: Pt = sol[k];
      c.setAttribute("cx", (a.x + (b.x - a.x) * prog + (rnd() - 0.5) * amp).toFixed(1));
      c.setAttribute("cy", (a.y + (b.y - a.y) * prog + (rnd() - 0.5) * amp).toFixed(1));
    });
    tm.later(jitter, 170);
  }

  function tick(): void {
    const T = tOf(i);
    read.textContent = `${T < 0 ? "−" + Math.abs(Math.round(T)) : Math.round(T)}℃`;
    pts.push(`${xOf(i).toFixed(1)},${yOf(T).toFixed(1)}`);
    line.setAttribute("points", pts.join(" "));
    if (i > 12 && i <= 28) {
      prog = (i - 12) / 16;
      const hh = (TUBE.h - 44) * prog;
      ice.setAttribute("y", (TUBE.y + TUBE.h - 14 - hh).toFixed(1));
      ice.setAttribute("height", hh.toFixed(1));
      if (i === 14) {
        zone.setAttribute("opacity", "1");
        wintxt.textContent = "어는 중: 규칙적으로 모여요";
      }
    }
    if (i === 28) {
      wintxt.textContent = "얼음: 규칙적·제자리";
      helper.innerHTML = "물이 어는 동안 곡선이 <b>0℃에서 평평</b>했어요. 다 얼자 다시 내려가기 시작하네요.";
    }
    i += 1;
    if (i > N) {
      running = false;
      goals.collect("watch", "0℃로 일정!");
      haptic(HAPTIC.correct);
      btn.textContent = "관찰 끝";
      helper.innerHTML = "냉각 끝. 온도가 내려가다가 <b>물이 어는 동안은 0℃에서 일정</b>했고, 다 얼고 나서 다시 내려갔어요. 판정해 볼까요?";
      tm.later(askTemp, 700);
      return;
    }
    tm.later(tick, TICK_MS);
  }

  function askTemp(): void {
    b4Ask(
      qBox,
      "물이 <b>어는 동안</b> 온도는 어떻게 되었나요?",
      [
        { t: "일정하게 유지되었다", ok: true },
        { t: "계속 천천히 내려갔다", ok: false },
        { t: "잠깐 올랐다가 내려갔다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 어는 동안은 <b>일정하게 유지</b>됐어요. 가열할 때와 똑같이 평평한 구간이 나왔죠. 그럼 이 동안 열에너지는 어떻게 되고 있었을까요?"
          : "평평한 구간을 다시 보세요. 어는 동안 온도는 오르지도 내리지도 않고 <b>일정하게 유지</b>됐어요. 그럼 이 동안 열에너지는 어떻게 되고 있었을까요?";
        goals.collect("temp", ok ? "정확한 판정!" : "판정 완료");
        tm.later(askEnergy, 1400);
      },
    );
    m3Reveal(tm, qBox);
  }

  function askEnergy(): void {
    b4Ask(
      qBox,
      "물이 어는 동안 온도가 일정했던 까닭은?",
      [
        { t: "물이 얼음으로 변하는 동안 열에너지를 방출하기 때문", ok: true },
        { t: "물이 얼음으로 변하는 동안 열에너지를 흡수하기 때문", ok: false },
        { t: "얼음과 소금이 열에너지를 주지 않기 때문", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 냉각은 물이 열에너지를 <b>내보내는(방출하는)</b> 과정이에요. 어는 동안 내보낸 열에너지가 온도를 내리는 대신 <b>상태 변화</b>에 쓰인 셈이라 온도가 그대로였죠."
          : "냉각 중이니 흡수가 아니라 <b>방출</b>이에요. 물이 얼음으로 변하는 동안 열에너지를 계속 내보내는데, 그 열에너지는 온도를 내리는 데가 아니라 <b>상태 변화</b>에 쓰이는 몫이라 온도가 일정했던 거예요.";
        goals.collect("energy", ok ? "정확한 판정!" : "판정 완료");
      },
    );
    m3Reveal(tm, qBox);
  }

  btn.addEventListener("click", () => {
    if (i > 0 || btn.disabled) return;
    haptic(HAPTIC.tap);
    running = true;
    btn.disabled = true;
    btn.textContent = "냉각 중…";
    board.classList.add("cooling");
    helper.innerHTML = "센서를 연결했어요! 온도 표시와 그래프, 시험관 속 물, 입자 창을 함께 보세요.";
    tm.later(tick, 300);
  });

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  jitter();
  void running;
  api.setCTA("센서를 연결해서 냉각을 시작하세요", { enabled: false });
  return () => tm.clear();
};
