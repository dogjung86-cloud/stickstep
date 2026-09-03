// [중1 Ⅳ v3] L4 oliveFreezeLab — 「올리브유 얼리기, 저울과 색 테이프」(교과서 탐구 재현).
// 한 통찰: 액체가 응고하면 입자 사이가 가까워지고 규칙적으로 배열되어 부피는 줄지만, 입자의 종류와 개수가 그대로라 질량은 변하지 않는다.
// 조작: 얼음+소금에 넣어 얼리기(버튼) → 저울에 다시 올리기(버튼) → 질량 판정 → 부피 판정.
// 목표 3: 얼리기 → 질량 판정 → 부피 판정. 입자 창은 액체 배치 → 규칙 격자로 좌표를 보간(자가 예약 setTimeout).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { M3, scaleSvg, seededRandom, stateParticles, type Pt } from "../../../ui/matter3Kit";
import type { StepRenderer } from "../../types";
import { m3AskBox, m3Goals, m3Helper, m3Reveal, m3Timers } from "./m3Lab";

interface OflStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const MASS = "12.60 g";
const WIN = { x: 236, y: 42, w: 94, h: 118 };
const N_TICK = 14;

export const oliveFreezeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as OflStep;
  const tm = m3Timers();
  const rnd = seededRandom(77);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "freeze", name: "얼리기", sub: "얼음+소금에" },
      { id: "mass", name: "질량 판정", sub: "다시 재기" },
      { id: "vol", name: "부피 판정", sub: "질량 판정 뒤" },
    ],
    () => {
      helper.innerHTML =
        "정리! 올리브유가 응고할 때 <b>질량은 그대로</b>(입자의 종류와 개수가 변하지 않으니까요), <b>부피는 줄어요</b>(입자 사이의 거리가 가까워지고 규칙적으로 배열되니까요). 상태가 변할 때 변하는 것은 <b>입자의 배열</b>, 그래서 부피예요.";
      api.enableCTA(s.cta ?? "기화 실험으로");
    },
  );
  const helper = m3Helper("작은 유리병에 <b>올리브유</b>를 넣고 뚜껑을 닫은 뒤, 액체 높이에 <b>빨간 테이프</b>를 붙이고 질량을 쟀어요. <b>" + MASS + "</b>. 이제 얼음과 소금을 섞은 비커에 넣어 <b>얼려</b> 볼게요. 아래 버튼을 누르세요.");

  const liq = stateParticles("liquid", WIN.x, WIN.y, WIN.w, WIN.h, rnd);
  const sol = stateParticles("solid", WIN.x, WIN.y, WIN.w, WIN.h, rnd);
  const stage = el("div", { class: "ofl-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 230" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="oflIceG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.7" stop-color="#E3F0FF"/><stop offset="1" stop-color="#BFD8F2"/></linearGradient>
    </defs>
    <ellipse cx="86" cy="220" rx="70" ry="6" fill="#2A3A5E" opacity="0.10"/>
    <ellipse cx="190" cy="220" rx="52" ry="6" fill="#2A3A5E" opacity="0.10"/>
    ${scaleSvg(30, 168, 112, "ofl", MASS)}
    <g class="ofl-beaker">
      <rect x="146" y="112" width="88" height="96" rx="8" fill="#EAF4FB" opacity="0.7"/>
      ${[[156, 176, 18], [188, 186, 22], [212, 170, 16], [166, 152, 14], [200, 146, 18]].map(([x, y, w]) => `<path d="M${x} ${y} l${w * 0.3} -${w * 0.6} l${w * 0.7} ${w * 0.1} l${w * 0.1} ${w * 0.5} l-${w * 0.6} ${w * 0.35} Z" fill="url(#oflIceG)" stroke="#8FB3D8" stroke-width="1.2"/>`).join("")}
      ${Array.from({ length: 16 }, () => `<circle cx="${(150 + rnd() * 80).toFixed(1)}" cy="${(120 + rnd() * 84).toFixed(1)}" r="1.4" fill="#FFFFFF" stroke="#B9C2CC" stroke-width="0.6"/>`).join("")}
      <path d="M144 110 v90 a10 10 0 0 0 10 10 h72 a10 10 0 0 0 10 -10 v-90" fill="none" stroke="${M3.glass}" stroke-width="3"/>
      <path d="M138 110 h100" stroke="${M3.glass}" stroke-width="3" stroke-linecap="round"/>
      <text x="190" y="102" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">얼음 + 소금</text>
    </g>
    <g class="ofl-jar">
      <rect class="ofl-oil" x="64" y="104" width="44" height="60" rx="5" fill="${M3.oil}" opacity="0.85"/>
      <rect x="62" y="98" width="48" height="70" rx="6" fill="none" stroke="${M3.glass}" stroke-width="2.6"/>
      <rect x="66" y="88" width="40" height="12" rx="3" fill="#8B95A1" stroke="#5C6B7A" stroke-width="1.4"/>
      <path d="M70 108 v52" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
      <rect class="ofl-tape1" x="58" y="102" width="56" height="4" rx="1.5" fill="#F03E3E"/>
      <rect class="ofl-tape2" x="58" y="108" width="56" height="4" rx="1.5" fill="#3B5BDB"/>
      <g class="ofl-frost">${[[62, 120], [110, 140], [66, 150]].map(([x, y]) => `<path d="M${x - 4} ${y} h8 M${x} ${y - 4} v8" stroke="#74B9F0" stroke-width="1.4" stroke-linecap="round"/>`).join("")}</g>
    </g>
    <g class="ofl-win">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="10" fill="#F6F4FF" stroke="#D9D2FF" stroke-width="2"/>
      <text x="${WIN.x + WIN.w / 2}" y="${WIN.y + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.matterDeep}">입자의 눈</text>
      ${liq.map((p, i) => `<circle class="ofl-p" data-i="${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${M3.part}" stroke="#FFFFFF" stroke-width="1.4"/>`).join("")}
      <text class="ofl-wintxt" x="${WIN.x + WIN.w / 2}" y="${WIN.y + WIN.h + 16}" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">액체: 불규칙</text>
    </g>
    <text class="ofl-note" x="86" y="30" text-anchor="middle" font-size="12" font-weight="800" fill="${M3.sub}">빨간 테이프 = 얼리기 전 높이</text>
  </svg>`;
  const board = el("div", { class: "mt3-board ofl-board" }, stage);

  const btn = el("button", { class: "mt3-btn ofl-btn", text: "얼음과 소금에 넣어 얼리기", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "mt3-btnrow" }, btn);
  const qBox = m3AskBox("ofl-q mt3-q");

  const jar = stage.querySelector(".ofl-jar") as SVGGElement;
  const oil = stage.querySelector(".ofl-oil") as SVGRectElement;
  const read = stage.querySelector(".ofl-read") as SVGTextElement;
  const pEls = Array.from(stage.querySelectorAll<SVGCircleElement>(".ofl-p"));
  const wintxt = stage.querySelector(".ofl-wintxt") as SVGTextElement;
  const note = stage.querySelector(".ofl-note") as SVGTextElement;

  type Phase = "idle" | "moving" | "freezing" | "frozen" | "back" | "askMass" | "askVol" | "done";
  let phase: Phase = "idle";
  let frozen = false;

  function jitter(): void {
    if (!tm.alive()) return;
    if (phase === "idle" || phase === "moving") {
      pEls.forEach((c, i) => {
        c.setAttribute("cx", (liq[i].x + (rnd() - 0.5) * 3).toFixed(1));
        c.setAttribute("cy", (liq[i].y + (rnd() - 0.5) * 3).toFixed(1));
      });
    } else if (frozen) {
      pEls.forEach((c, i) => {
        c.setAttribute("cx", (sol[i].x + (rnd() - 0.5) * 1.2).toFixed(1));
        c.setAttribute("cy", (sol[i].y + (rnd() - 0.5) * 1.2).toFixed(1));
      });
    }
    tm.later(jitter, 170);
  }

  function freezeTick(i: number): void {
    const t = i / N_TICK;
    oil.setAttribute("y", (104 + 6 * t).toFixed(1));
    oil.setAttribute("height", (60 - 6 * t).toFixed(1));
    if (i === Math.floor(N_TICK / 2)) oil.setAttribute("fill", M3.oilFrozen);
    pEls.forEach((c, k) => {
      const a: Pt = liq[k], b: Pt = sol[k];
      c.setAttribute("cx", (a.x + (b.x - a.x) * t).toFixed(1));
      c.setAttribute("cy", (a.y + (b.y - a.y) * t).toFixed(1));
    });
    if (i >= N_TICK) {
      frozen = true;
      phase = "frozen";
      board.classList.add("frozen", "tape2");
      wintxt.textContent = "고체: 규칙적";
      note.textContent = "파란 테이프 = 얼린 뒤 높이";
      goals.collect("freeze", "굳었어요!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "올리브유가 하얗게 <b>굳었어요</b>. 액면이 <b>내려가서</b> 파란 테이프를 새로 붙였죠. 입자 창에서는 입자들이 <b>규칙적으로, 더 가깝게</b> 모였고요. 이제 병 표면의 물기를 닦고 <b>즉시</b> 저울에 다시 올려 봐요.";
      btn.textContent = "물기 닦고 저울에 다시 올리기";
      btn.disabled = false;
      return;
    }
    tm.later(() => freezeTick(i + 1), 220);
  }

  function askMass(): void {
    phase = "askMass";
    b4Ask(
      qBox,
      "얼리기 전 <b>" + MASS + "</b>이던 올리브유의 질량은 얼린 뒤 어떻게 되었나요?",
      [
        { t: "그대로 " + MASS, ok: true },
        { t: "굳어서 더 무거워졌다", ok: false },
        { t: "부피가 줄었으니 더 가벼워졌다", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        read.textContent = MASS;
        helper.innerHTML = ok
          ? "정확해요! 저울도 <b>" + MASS + "</b> 그대로예요. 굳으면서 <b>입자의 종류도 개수도 변하지 않았으니</b> 질량이 변할 리 없죠. 그럼 부피는 왜 줄었을까요?"
          : "저울을 보세요. <b>" + MASS + "</b> 그대로예요. 굳는 동안 <b>입자의 종류도 개수도 변하지 않았으니</b> 질량은 변하지 않아요. 부피가 줄어든 것과 질량은 별개랍니다. 그럼 부피는 왜 줄었을까요?";
        goals.collect("mass", ok ? "정확한 판정!" : "판정 완료");
        tm.later(askVol, 1400);
      },
    );
    m3Reveal(tm, qBox);
  }

  function askVol(): void {
    phase = "askVol";
    b4Ask(
      qBox,
      "액면이 내려갔어요(부피 감소). 올리브유가 응고할 때 <b>부피가 줄어든</b> 까닭은?",
      [
        { t: "입자 사이의 거리가 가까워지고 규칙적으로 배열되어서", ok: true },
        { t: "입자의 개수가 줄어들어서", ok: false },
        { t: "입자 하나하나가 작아져서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 입자 창을 다시 보세요. 개수는 12개 그대로인데 <b>사이가 가까워지고 규칙적으로</b> 모였죠. 그래서 전체가 차지하는 자리, 즉 부피가 줄어든 거예요."
          : "입자 창의 개수를 세어 보세요. 얼리기 전에도 후에도 <b>12개</b>고, 입자 하나의 크기도 같아요. 달라진 건 <b>입자 사이의 거리와 배열</b>이에요. 가까워지고 규칙적으로 모여서 부피가 줄었답니다.";
        goals.collect("vol", ok ? "정확한 판정!" : "판정 완료");
        phase = "done";
      },
    );
    m3Reveal(tm, qBox);
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    haptic(HAPTIC.tap);
    if (phase === "idle") {
      phase = "moving";
      btn.disabled = true;
      btn.textContent = "얼리는 중…";
      jar.style.transform = "translate(104px, 22px)";
      read.textContent = "0.00 g";
      helper.innerHTML = "병을 얼음과 소금 속에 푹 넣었어요. 올리브유가 잠길 만큼요. 액면과 입자 창을 지켜보세요.";
      tm.later(() => {
        phase = "freezing";
        freezeTick(1);
      }, 1100);
    } else if (phase === "frozen") {
      phase = "back";
      btn.disabled = true;
      btn.textContent = "다시 재는 중…";
      jar.style.transform = "translate(0, 0)";
      helper.innerHTML = "저울 위로 돌아왔어요. 표시창을 보기 전에, 질량이 어떻게 됐을지 먼저 판정해 보세요.";
      tm.later(askMass, 1100);
    }
  });

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  jitter();
  api.setCTA("올리브유를 얼려 보세요", { enabled: false });
  return () => tm.clear();
};
