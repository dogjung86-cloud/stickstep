// [중1 Ⅳ v3] L3 dryIceLab — 「드라이아이스 컵의 비누막」(교과서 해 보기: 드라이아이스의 승화 관찰).
// 한 통찰: 고체 드라이아이스는 액체를 거치지 않고 곧장 기체가 되어(승화) 컵을 채우고 비누막을 부풀린다. 컵 안에 물은 없다.
// 조작: 비누막 씌우기(버튼) → 시간 흐르기(버튼, 비누막이 곡선으로 부푼다) → 판정.
// 한 화면 예산: 끈 스윕 연출·안내 글자·태그 제거(helper가 말한다). 컵·덩어리 2·김·비누막만.
// 목표 3: 비누막 → 부풀기 → 판정. rAF·캔버스 없음(경로 d 보간은 자가 예약 setTimeout).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";
import { m3Btn, m3Goals, m3Helper, m3Slot, m3Timers } from "./m3Lab";

interface DilStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N_TICK = 18;
const MX0 = 110, MX1 = 230, MY = 62; // 컵 입구 양 끝·높이
const domeD = (k: number): string => `M${MX0} ${MY} Q${(MX0 + MX1) / 2} ${(MY - 104 * k).toFixed(1)} ${MX1} ${MY}`;

export const dryIceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DilStep;
  const tm = m3Timers();

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goals = m3Goals(
    [
      { id: "film", name: "비누막", sub: "컵 입구에" },
      { id: "bulge", name: "부풀기", sub: "시간이 흐르면" },
      { id: "judge", name: "판정", sub: "부푼 뒤" },
    ],
    () => {
      helper.innerHTML = "정리! 고체가 액체 단계를 건너뛰고 곧장 기체가 되는 것이 <b>승화</b>예요. 기체 → 고체도 같은 이름이에요.";
      api.enableCTA(s.cta ?? "상태 변화 정리하기");
      if (s.curio) host.appendChild(curioCard(s.curio)); // 궁금증 카드는 목표를 다 채운 뒤에(판정 시점 한 화면 예산)
    },
  );
  const helper = m3Helper("유리컵에 <b>드라이아이스</b>를 넣었어요. 컵 입구에 <b>비누막</b>을 씌워 볼게요.");

  const stage = el("div", { class: "dil-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="dilFilmG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF9BD3"/><stop offset="0.5" stop-color="#9BE1FF"/><stop offset="1" stop-color="#C6FFB0"/></linearGradient>
      <radialGradient id="dilFogG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
      <linearGradient id="dilIceG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.7" stop-color="#EAF4FF"/><stop offset="1" stop-color="#C7DCF0"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="340" height="180" fill="#101A33"/>
    <ellipse cx="170" cy="168" rx="100" ry="7" fill="#000000" opacity="0.35"/>
    <g class="dil-fogs">
      ${[[80, 130, 30], [262, 126, 28], [170, 164, 54]].map(([x, y, r], i) => `<circle class="dil-fog" style="animation-delay:${i * 0.6}s" cx="${x}" cy="${y}" r="${r}" fill="url(#dilFogG)"/>`).join("")}
    </g>
    <path d="M110 62 l8 92 a10 10 0 0 0 10 8 h84 a10 10 0 0 0 10 -8 l8 -92" fill="rgba(180, 205, 240, 0.12)" stroke="#9DB2C4" stroke-width="3" stroke-linejoin="round"/>
    <g class="dil-chunks">
      <g class="dil-chunk"><path d="M138 156 l6 -18 l24 -6 l14 10 l-4 16 Z" fill="url(#dilIceG)" stroke="#8FB3D8" stroke-width="1.4"/></g>
      <g class="dil-chunk"><path d="M178 158 l4 -16 l20 -8 l18 12 l-2 14 Z" fill="url(#dilIceG)" stroke="#8FB3D8" stroke-width="1.4"/></g>
    </g>
    <g class="dil-fogin">
      ${[[144, 118, 24], [200, 124, 26]].map(([x, y, r], i) => `<circle class="dil-fog" style="animation-delay:${i * 0.4 + 0.2}s" cx="${x}" cy="${y}" r="${r}" fill="url(#dilFogG)"/>`).join("")}
    </g>
    <path d="M102 62 h136" stroke="#9DB2C4" stroke-width="3" stroke-linecap="round"/>
    <path class="dil-film0" d="${domeD(0)}" stroke="#FFFFFF" stroke-width="1.2" stroke-dasharray="4 4" fill="none" opacity="0"/>
    <path class="dil-film" d="${domeD(0)}" stroke="url(#dilFilmG)" stroke-width="3.5" fill="rgba(255,255,255,0.10)" stroke-linecap="round"/>
  </svg>`;
  const board = el("div", { class: "mt3-board mt3-dark dil-board" }, stage);

  const btn = m3Btn("dil-btn", "비누막 씌우기");
  const slot = m3Slot(tm, "dil-q", btn);

  const film = stage.querySelector(".dil-film") as SVGPathElement;
  const film0 = stage.querySelector(".dil-film0") as SVGPathElement;
  const chunks = Array.from(stage.querySelectorAll<SVGGElement>(".dil-chunk"));

  type Phase = "idle" | "filmed" | "run" | "done";
  let phase: Phase = "idle";

  function tick(i: number): void {
    const t = i / N_TICK;
    const e = 1 - Math.pow(1 - t, 2);
    film.setAttribute("d", domeD(e));
    chunks.forEach((g, k) => { g.style.transform = `scale(${(1 - 0.22 * e - k * 0.03).toFixed(2)})`; });
    if (i >= N_TICK) {
      phase = "done";
      goals.collect("bulge", "볼록!");
      haptic(HAPTIC.correct);
      helper.innerHTML = "비누막이 <b>볼록하게</b> 부풀었어요. 그런데 컵 안에 <b>녹은 물은 한 방울도 없죠</b>.";
      tm.later(askWhy, 700);
      return;
    }
    tm.later(() => tick(i + 1), 200);
  }

  function askWhy(): void {
    slot.ask(
      "컵 안에 물은 없는데 비누막이 <b>부푼</b> 까닭은?",
      [
        { t: "액체를 거치지 않고 바로 기체가 되어 컵을 채워서", ok: true },
        { t: "녹아서 물이 되고, 그 물이 증발해서", ok: false },
        { t: "비누막이 바깥 공기를 빨아들여서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 물이 고이지 않은 게 단서였죠. <b>곧장 기체</b>가 되어 컵을 채우며 비누막을 밀어 올렸어요."
          : "컵 안에 물이 없었죠? 녹은 게 아니에요. <b>곧장 기체</b>가 되어 컵을 채우며 비누막을 밀어 올린 거예요.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
      },
    );
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    haptic(HAPTIC.tap);
    if (phase === "idle") {
      phase = "filmed";
      btn.disabled = true;
      board.classList.add("filmed");
      film0.setAttribute("opacity", "0.7");
      tm.later(() => {
        goals.collect("film", "씌웠어요!");
        haptic(HAPTIC.correct);
        helper.innerHTML = "얇은 <b>비누막</b>이 덮였어요(점선은 처음 모양). 가만히 두고 <b>시간을 흘려</b> 보세요.";
        btn.textContent = "시간 흐르기";
        btn.disabled = false;
      }, 600);
    } else if (phase === "filmed") {
      phase = "run";
      btn.disabled = true;
      btn.textContent = "지켜보는 중…";
      helper.innerHTML = "비누막과 컵 안의 드라이아이스를 함께 지켜보세요.";
      tm.later(() => tick(1), 300);
    }
  });

  host.append(goals.chips, helper, board, slot.el);

  api.setCTA("비누막을 씌워 실험을 시작하세요", { enabled: false });
  return () => tm.clear();
};
