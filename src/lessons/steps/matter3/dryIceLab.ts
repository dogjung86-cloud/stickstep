// [중1 Ⅳ v3] L3 dryIceLab — 「드라이아이스 컵의 비누막」(교과서 해 보기: 드라이아이스의 승화 관찰).
// 한 통찰: 고체 드라이아이스는 액체를 거치지 않고 곧장 기체가 되어(승화) 컵을 채우고 비누막을 부풀린다. 컵 안에 물은 없다.
// 조작: 비누막 만들기(버튼, 끈이 컵 입구를 스친다) → 시간 흐르기(버튼, 비누막이 곡선으로 부푼다) → 판정.
// 목표 3: 비누막 → 부풀기 → 판정. rAF·캔버스 없음(경로 d 보간은 자가 예약 setTimeout).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import type { StepRenderer } from "../../types";
import { m3AskBox, m3Goals, m3Helper, m3Reveal, m3Timers } from "./m3Lab";

interface DilStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const N_TICK = 18;
const MX0 = 100, MX1 = 240, MY = 78; // 컵 입구 양 끝·높이
const domeD = (k: number): string => `M${MX0} ${MY} Q${(MX0 + MX1) / 2} ${(MY - 92 * k).toFixed(1)} ${MX1} ${MY}`;

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
      helper.innerHTML =
        "정리! 드라이아이스는 <b>고체 상태의 이산화 탄소</b>예요. 액체를 거치지 않고 <b>곧장 기체</b>가 되어 컵을 채우고 비누막을 밀어 올렸죠. 이렇게 고체가 액체 단계를 건너뛰고 곧장 기체가 되는 현상이 <b>승화</b>예요. 거꾸로 기체가 바로 고체로 변하는 것(나뭇잎의 서리)도 똑같이 <b>승화</b>라고 불러요.";
      api.enableCTA(s.cta ?? "상태 변화 정리하기");
    },
  );
  const helper = m3Helper("투명한 유리컵에 <b>드라이아이스</b>를 넣었어요. 하얀 김이 흘러넘치죠? 비눗방울 용액을 적신 <b>끈</b>으로 컵 입구를 천천히 스쳐 <b>비누막</b>을 만들어 볼게요. 아래 버튼을 누르세요.");

  const stage = el("div", { class: "dil-stage" });
  stage.innerHTML = `
  <svg viewBox="0 0 340 226" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="dilFilmG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF9BD3"/><stop offset="0.5" stop-color="#9BE1FF"/><stop offset="1" stop-color="#C6FFB0"/></linearGradient>
      <radialGradient id="dilFogG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
      <linearGradient id="dilIceG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.7" stop-color="#EAF4FF"/><stop offset="1" stop-color="#C7DCF0"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="340" height="226" rx="16" fill="#101A33"/>
    <ellipse cx="170" cy="206" rx="110" ry="8" fill="#000000" opacity="0.35"/>
    <g class="dil-fogs">
      ${[[70, 150, 34], [270, 140, 30], [88, 186, 40], [252, 190, 36], [170, 200, 60]].map(([x, y, r], i) => `<circle class="dil-fog" style="animation-delay:${i * 0.6}s" cx="${x}" cy="${y}" r="${r}" fill="url(#dilFogG)"/>`).join("")}
    </g>
    <path d="M100 78 l8 118 a10 10 0 0 0 10 8 h104 a10 10 0 0 0 10 -8 l8 -118" fill="rgba(180, 205, 240, 0.12)" stroke="#9DB2C4" stroke-width="3" stroke-linejoin="round"/>
    <g class="dil-chunks">
      <g class="dil-chunk"><path d="M128 194 l6 -18 l24 -6 l14 10 l-4 16 Z" fill="url(#dilIceG)" stroke="#8FB3D8" stroke-width="1.4"/></g>
      <g class="dil-chunk"><path d="M170 196 l4 -16 l20 -8 l18 12 l-2 14 Z" fill="url(#dilIceG)" stroke="#8FB3D8" stroke-width="1.4"/></g>
      <g class="dil-chunk"><path d="M150 176 l10 -14 l22 2 l6 14 l-10 6 Z" fill="url(#dilIceG)" stroke="#8FB3D8" stroke-width="1.4"/></g>
    </g>
    <g class="dil-fogin">
      ${[[130, 150, 26], [200, 160, 30], [166, 130, 24]].map(([x, y, r], i) => `<circle class="dil-fog" style="animation-delay:${i * 0.4 + 0.2}s" cx="${x}" cy="${y}" r="${r}" fill="url(#dilFogG)"/>`).join("")}
    </g>
    <path d="M92 78 h156" stroke="#9DB2C4" stroke-width="3" stroke-linecap="round"/>
    <path class="dil-film" d="${domeD(0)}" stroke="url(#dilFilmG)" stroke-width="3.5" fill="rgba(255,255,255,0.10)" stroke-linecap="round" opacity="0"/>
    <path class="dil-film0" d="${domeD(0)}" stroke="#FFFFFF" stroke-width="1.2" stroke-dasharray="4 4" fill="none" opacity="0"/>
    <g class="dil-string" style="transform: translate(-150px, 0)">
      <path d="M40 60 h250" stroke="#E9D8A6" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="60" r="7" fill="#FFF3BF" stroke="#C9B37A" stroke-width="1.6"/><circle cx="290" cy="60" r="7" fill="#FFF3BF" stroke="#C9B37A" stroke-width="1.6"/>
      <path d="M120 58 q6 -6 12 0 M180 58 q6 -6 12 0" stroke="#9BE1FF" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
    <text class="dil-note" x="170" y="30" text-anchor="middle" font-size="12" font-weight="800" fill="#DCE8F5">드라이아이스 컵 · 하얀 김이 흘러넘쳐요</text>
    <g class="dil-tag dil-tag-dry"><rect x="14" y="94" width="76" height="40" rx="8" fill="rgba(255,255,255,0.12)" stroke="#C9BEFF" stroke-width="1.6"/><text x="52" y="110" text-anchor="middle" font-size="12" font-weight="800" fill="#EDE9FF">컵 안에</text><text x="52" y="126" text-anchor="middle" font-size="12" font-weight="800" fill="#EDE9FF">물 없음</text></g>
  </svg>`;
  const board = el("div", { class: "mt3-board mt3-dark dil-board" }, stage);

  const btn = el("button", { class: "mt3-btn dil-btn", text: "비누막 만들기", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnRow = el("div", { class: "mt3-btnrow" }, btn);
  const qBox = m3AskBox("dil-q mt3-q");

  const film = stage.querySelector(".dil-film") as SVGPathElement;
  const film0 = stage.querySelector(".dil-film0") as SVGPathElement;
  const string = stage.querySelector(".dil-string") as SVGGElement;
  const chunks = Array.from(stage.querySelectorAll<SVGGElement>(".dil-chunk"));
  const note = stage.querySelector(".dil-note") as SVGTextElement;
  const tagDry = stage.querySelector(".dil-tag-dry") as SVGGElement;

  type Phase = "idle" | "sweep" | "filmed" | "run" | "ran" | "done";
  let phase: Phase = "idle";

  function tick(i: number): void {
    const t = i / N_TICK;
    const e = 1 - Math.pow(1 - t, 2);
    film.setAttribute("d", domeD(e));
    chunks.forEach((g, k) => { g.style.transform = `scale(${(1 - 0.22 * e - k * 0.03).toFixed(2)})`; });
    if (i === 8) tagDry.classList.add("on");
    if (i >= N_TICK) {
      phase = "ran";
      goals.collect("bulge", "볼록!");
      haptic(HAPTIC.correct);
      btn.textContent = "관찰 끝";
      note.textContent = "비누막이 볼록하게 부풀었어요";
      helper.innerHTML = "비누막이 <b>볼록하게 부풀어 올랐어요</b>. 그런데 컵 안을 보세요. 드라이아이스는 작아졌는데 <b>녹은 물이 한 방울도 없죠</b>. 비누막은 왜 부풀었을까요?";
      tm.later(askWhy, 700);
      return;
    }
    tm.later(() => tick(i + 1), 200);
  }

  function askWhy(): void {
    b4Ask(
      qBox,
      "컵 안에 물은 없는데 비누막이 <b>부풀어 오른</b> 까닭은?",
      [
        { t: "드라이아이스가 액체를 거치지 않고 바로 기체가 되어 컵을 채워서", ok: true },
        { t: "드라이아이스가 녹아 물이 되고, 그 물이 증발해서", ok: false },
        { t: "비누막이 바깥 공기를 빨아들여서", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 컵 안에 물이 고이지 않은 게 결정적 단서였죠. 드라이아이스는 <b>물이 되는 단계 없이 곧장 기체</b>가 되어 컵 안을 채우며 비누막을 밀어 올렸어요."
          : "컵 안에 물이 한 방울도 없었죠? 녹아서 물이 된 게 아니에요. 비누막이 공기를 빨아들이지도 않고요. 드라이아이스는 <b>물이 되는 단계 없이 곧장 기체</b>가 되어 컵을 채우며 비누막을 밀어 올린 거랍니다.";
        goals.collect("judge", ok ? "정확한 판정!" : "판정 완료");
        phase = "done";
      },
    );
    m3Reveal(tm, qBox);
  }

  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    haptic(HAPTIC.tap);
    if (phase === "idle") {
      phase = "sweep";
      btn.disabled = true;
      btn.textContent = "끈이 지나가는 중…";
      string.style.transform = "translate(150px, 0)";
      helper.innerHTML = "비눗방울 용액을 적신 끈이 컵 입구를 천천히 스쳐 지나가요.";
      tm.later(() => {
        film.setAttribute("opacity", "1");
        film0.setAttribute("opacity", "0.7");
        string.style.opacity = "0";
        phase = "filmed";
        goals.collect("film", "만들었어요!");
        haptic(HAPTIC.correct);
        note.textContent = "컵 입구에 얇은 비누막이 생겼어요";
        helper.innerHTML = "컵 입구에 얇은 <b>비누막</b>이 덮였어요(점선은 처음 모양). 이제 가만히 두고 <b>시간을 흘려</b> 보세요. 비누막이 어떻게 될까요?";
        btn.textContent = "시간 흐르기";
        btn.disabled = false;
      }, 1000);
    } else if (phase === "filmed") {
      phase = "run";
      btn.disabled = true;
      btn.textContent = "지켜보는 중…";
      helper.innerHTML = "비누막과 컵 안의 드라이아이스를 함께 지켜보세요.";
      tm.later(() => tick(1), 300);
    }
  });

  host.append(goals.chips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("비누막을 만들어 실험을 시작하세요", { enabled: false });
  return () => tm.clear();
};
