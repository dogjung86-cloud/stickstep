// policyLab — 사회 Ⅹ L5 기함: 정치과정 5단계+환류 릴레이. 훅(schoolzone)이 예고한 "학교 앞
// 노란 표지판"이 태어나는 길을 목소리의 시점에서 따라간다 — 미래엔 192쪽 정치과정 단계 도식·
// 비상 190쪽 어린이 보호 구역 사례의 앱판(무대는 가상 "스틱 시" — 현실 기관·법령명 0).
// principleLab 릴레이 문법 계승(ppl-* 릴레이 킷 재사용) + 이 랩만의 장치 = **상단 정거장 트랙**:
// 다섯 정거장을 목소리 카드가 이동하며, 피날레에 평가→표출로 감기는 환류 화살표가 "과정은
// 순환한다"를 시각화한다(두 책 공통 환류 개념 — 교과서 도식의 되돌아가는 화살표).
// 판정 msn 3곳 = 담당 주체 함정 지점(집약=정당·언론(국가기관 아님)·결정=국회·집행=정부(국회 아님))
// + 피날레 환류 판정. rAF 없음 — CSS 트랜지션 + setTimeout 체인.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

function stickman(x: number, y: number, opts: { arm?: "up" | "down" | "out"; mood?: "ok" | "sad" | "joy"; r?: number } = {}): string {
  const r = opts.r ?? 6;
  const arm = opts.arm ?? "out";
  const arms =
    arm === "up"
      ? `M${x} ${y + r + 4}l-${r + 2} -7M${x} ${y + r + 4}l${r + 2} -9`
      : arm === "down"
        ? `M${x} ${y + r + 4}l-${r + 1} ${r + 1}M${x} ${y + r + 4}l${r + 1} ${r + 1}`
        : `M${x} ${y + r + 4}l-${r + 2} 4M${x} ${y + r + 4}l${r + 2} 4`;
  const mood = opts.mood ?? "ok";
  const face =
    mood === "sad"
      ? `<circle cx="${x - 2}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 2} ${y + 3.4}q2-1.6 4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`
      : mood === "joy"
        ? `<path d="M${x - 3} ${y - 1.2}q1.2-1.4 2.4 0M${x + 0.6} ${y - 1.2}q1.2-1.4 2.4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/><path d="M${x - 2.2} ${y + 2.6}q2.2 2 4.4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`
        : `<circle cx="${x - 2}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 1.7} ${y + 2.9}q1.7 1.2 3.4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`;
  return `<g ${STICK}><circle cx="${x}" cy="${y}" r="${r}" fill="#F6EFE4"/>
    <path d="M${x} ${y + r}v${r + 6}M${x} ${y + r * 2 + 6}l-${r - 1} ${r + 3}M${x} ${y + r * 2 + 6}l${r - 1} ${r + 3}${arms}"/></g>${face}`;
}

const DEFS = `<defs>
  <linearGradient id="pcy-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F6"/></linearGradient>
  <linearGradient id="pcy-lime" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FBE3A"/><stop offset=".55" stop-color="#5C940D"/><stop offset="1" stop-color="#47730A"/></linearGradient>
  <linearGradient id="pcy-hall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFE3C4"/><stop offset=".5" stop-color="#E2D2A8"/><stop offset="1" stop-color="#C8B482"/></linearGradient>
  <linearGradient id="pcy-sign" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE066"/><stop offset="1" stop-color="#F2C24E"/></linearGradient>
</defs>`;

const STATIONS = ["이익 표출", "이익 집약", "정책 결정", "정책 집행", "정책 평가"];

/** 상단 정거장 트랙 — at: 현재 정거장(0..4), loop: 환류 화살표 점등 */
function trackSvg(at: number, loop: boolean): string {
  const nodes = STATIONS.map((t, i) => {
    const x = 28 + i * 46;
    const on = i <= at;
    const cur = i === at;
    return `<g>
      <circle cx="${x}" cy="18" r="${cur ? 10 : 8}" fill="${on ? "url(#pcy-lime)" : "#E4EAF0"}" stroke="${on ? "#47730A" : "#B8C2CE"}" stroke-width="1.5"${cur ? ` class="hs8-ring"` : ""}/>
      <text x="${x}" y="21.4" text-anchor="middle" font-size="8.6" font-weight="900" fill="${on ? "#FFF" : "#8A93A6"}">${i + 1}</text>
      <text x="${x}" y="40" text-anchor="middle" font-size="7.2" font-weight="800" fill="${on ? "#3E5228" : "#9AA6B4"}">${t}</text>
    </g>`;
  }).join("");
  const lines = STATIONS.slice(0, -1)
    .map((_, i) => {
      const x = 28 + i * 46;
      return `<path d="M${x + (i === at ? 10 : 8) + 2} 18h${46 - 24}" stroke="${i < at ? "#8FA86A" : "#D2DAE2"}" stroke-width="2"/>`;
    })
    .join("");
  const feedback = loop
    ? `<path d="M212 30 q10 22 -12 26 H44 q-24 -2 -14 -24" stroke="#C0871C" stroke-width="2.2" fill="none" stroke-dasharray="6 5" class="hs8-noti"/>
       <path d="M28 36l-4 7 8 1z" fill="#C0871C" class="hs8-noti"/>
       <text x="120" y="52" text-anchor="middle" font-size="7.6" font-weight="800" fill="#8A5A14">평가가 다시 첫 정거장으로, 환류</text>`
    : "";
  return `<g>${lines}${nodes}${feedback}</g>`;
}

function wrap(at: number, loop: boolean, inner: string): string {
  return `<svg viewBox="0 0 240 190" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${DEFS}
    <rect x="6" y="4" width="228" height="${loop ? 56 : 44}" rx="10" fill="#F4F8EC" stroke="#D8E2C4" stroke-width="1.2"/>
    ${trackSvg(at, loop)}
    <ellipse cx="120" cy="184" rx="100" ry="5" fill="#2A3A5E" opacity=".1"/>
    <g transform="translate(0 ${loop ? 62 : 50})">${inner}</g>`;
}

// ① 이익 표출 — 목소리 셋(heard 0..3)
function voiceSvg(heard: number): string {
  const voices = [
    { x: 52, text: "등하굣길이 위험해요", c: "#C0392E" },
    { x: 120, text: "차 때문에 안 보여요", c: "#C0871C" },
    { x: 188, text: "신호가 너무 짧아요", c: "#2E8AC0" },
  ];
  const men = voices.map((v, i) => stickman(v.x, 76, { mood: heard > i ? "ok" : "sad", arm: heard > i ? "up" : "out", r: 5.8 })).join("");
  const bubbles = voices
    .map((v, i) =>
      heard > i
        ? `<g${heard === i + 1 ? ` class="hs8-noti"` : ""}>
        <rect x="${v.x - 32}" y="24" width="64" height="20" rx="9" fill="#FFF" stroke="${v.c}" stroke-width="1.5"/>
        <path d="M${v.x - 3} 44l3 5 3-5z" fill="#FFF" stroke="${v.c}" stroke-width="1.1"/>
        <text x="${v.x}" y="37" text-anchor="middle" font-size="7.4" font-weight="800" fill="#39455C">${v.text}</text>
      </g>`
        : "",
    )
    .join("");
  return `${men}${bubbles}
    <text x="120" y="122" text-anchor="middle" font-size="8.4" font-weight="700" fill="#7E8AA0">스틱 시 학교 앞, 흩어져 있던 목소리들</text>`;
}

// ② 이익 집약 — 말풍선 3 → 문서 1
function gatherSvg(merged: boolean): string {
  if (!merged) {
    return `${[52, 120, 188].map((x, i) => `<g transform="rotate(${-8 + i * 8} ${x} 48)"><rect x="${x - 28}" y="34" width="56" height="18" rx="8" fill="#FFF" stroke="#8A93A6" stroke-width="1.4"/><path d="M${x - 14} 43h28" stroke="#B8C2CE" stroke-width="1.6"/></g>`).join("")}
      <path d="M62 62q58 26 116 0" stroke="#C9D2DC" stroke-width="1.8" stroke-dasharray="5 5" fill="none"/>
      <text x="120" y="112" text-anchor="middle" font-size="8.4" font-weight="700" fill="#7E8AA0">흩어진 목소리, 이대로는 힘이 약해요</text>`;
  }
  return `<g class="hs8-noti">
      <rect x="76" y="22" width="88" height="66" rx="6" fill="url(#pcy-paper)" stroke="#5C940D" stroke-width="1.8"/>
      <rect x="88" y="30" width="64" height="11" rx="5.5" fill="#5C940D"/>
      <text x="120" y="38" text-anchor="middle" font-size="7.4" font-weight="800" fill="#FFF">안전 대책 요구안</text>
      <path d="M88 50h64M88 58h64M88 66h44" stroke="#A8B2C2" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M88 76h28" stroke="#5C940D" stroke-width="2" stroke-linecap="round"/>
    </g>
    <g transform="translate(34 96)"><rect x="-22" y="-9" width="44" height="18" rx="9" fill="#EAF2FB" stroke="#2E8AC0" stroke-width="1.4"/><text x="0" y="3.4" text-anchor="middle" font-size="7.6" font-weight="800" fill="#1E6490">정당</text></g>
    <g transform="translate(206 96)"><rect x="-22" y="-9" width="44" height="18" rx="9" fill="#F3EDFB" stroke="#8A5EC0" stroke-width="1.4"/><text x="0" y="3.4" text-anchor="middle" font-size="7.6" font-weight="800" fill="#6A42A0">언론</text></g>
    <path d="M56 92q26-18 44-26M184 92q-26-18-44-26" stroke="#B8C2CE" stroke-width="1.6" fill="none" stroke-dasharray="4 4"/>
    <text x="120" y="118" text-anchor="middle" font-size="8.4" font-weight="700" fill="#7E8AA0">세 목소리가 하나의 요구안으로 모였어요</text>`;
}

// ③ 정책 결정 — 회의장 + 의사봉
function decideSvg(decided: boolean): string {
  const hall = `<path d="M60 40 L120 18 L180 40 v6 H60z" fill="url(#pcy-hall)" stroke="#8A7648" stroke-width="1.7" stroke-linejoin="round"/>
    ${[76, 106, 136, 166].map((x) => `<rect x="${x - 5}" y="46" width="10" height="26" rx="2" fill="url(#pcy-hall)" stroke="#8A7648" stroke-width="1.3"/>`).join("")}
    <rect x="56" y="72" width="128" height="8" rx="3" fill="url(#pcy-hall)" stroke="#8A7648" stroke-width="1.4"/>`;
  if (!decided) {
    return `${hall}
      <text x="120" y="100" text-anchor="middle" font-size="8.8" font-weight="800" fill="#5A6478">회의장, 요구안이 도착했어요</text>
      <g transform="rotate(-6 120 112)"><rect x="104" y="104" width="32" height="20" rx="3" fill="url(#pcy-paper)" stroke="#5C940D" stroke-width="1.5"/><path d="M110 111h20M110 117h13" stroke="#A8B2C2" stroke-width="1.4"/></g>`;
  }
  return `${hall}
    <g class="hs8-noti">
      <g transform="rotate(-28 132 100)"><rect x="120" y="94" width="24" height="10" rx="4" fill="#A87838" stroke="#6E4E26" stroke-width="1.4"/><rect x="130" y="104" width="4" height="14" rx="2" fill="#C89A5E" stroke="#6E4E26" stroke-width="1.1"/></g>
      <rect x="88" y="96" width="22" height="5" rx="2.4" fill="#8A6034"/>
      <path d="M112 88l-4-4M120 86v-6M104 88l2-6" stroke="#E2A020" stroke-width="1.6" stroke-linecap="round"/>
    </g>
    <rect x="60" y="112" width="120" height="18" rx="6" fill="url(#pcy-lime)"/>
    <text x="120" y="124.5" text-anchor="middle" font-size="8.4" font-weight="800" fill="#FFF">"학교 앞 보호 구역을 정한다", 통과!</text>`;
}

// ④ 정책 집행 — 표지판·바닥 설치
function executeSvg(built: boolean): string {
  const road = `<rect x="30" y="86" width="180" height="26" rx="5" fill="#8A93A6" opacity=".8"/>
    <path d="M42 99h16M74 99h16M106 99h16M138 99h16M170 99h16" stroke="#FFF" stroke-width="2.6" stroke-dasharray="8 12" opacity=".8"/>`;
  if (!built) {
    return `${road}
      ${stickman(60, 62, { arm: "out", r: 5.6 })}
      <g transform="rotate(8 168 66)"><rect x="152" y="54" width="32" height="24" rx="3" fill="url(#pcy-paper)" stroke="#8A93A6" stroke-width="1.4"/><path d="M158 62h20M158 68h14" stroke="#A8B2C2" stroke-width="1.4"/></g>
      <text x="120" y="128" text-anchor="middle" font-size="8.4" font-weight="700" fill="#7E8AA0">결정문이 현장에 도착, 이제 실행할 차례</text>`;
  }
  return `${road}
    <g class="hs8-noti">
      <path d="M74 86V46" stroke="#5A6478" stroke-width="2.2"/>
      <rect x="58" y="26" width="32" height="22" rx="4" fill="url(#pcy-sign)" stroke="#B8860E" stroke-width="1.7"/>
      <text x="74" y="40" text-anchor="middle" font-size="6.2" font-weight="800" fill="#5A4A0E">어린이 보호</text>
    </g>
    <g class="hs8-noti" style="animation-delay:.25s">
      <path d="M130 86l-14-26h44l10 26z" fill="url(#pcy-sign)" stroke="#B8860E" stroke-width="1.6" stroke-linejoin="round"/>
    </g>
    ${stickman(196, 62, { mood: "joy", arm: "up", r: 5.6 })}
    <text x="120" y="128" text-anchor="middle" font-size="8.4" font-weight="700" fill="#7E8AA0">표지판과 노란 바닥이 실제로 설치됐어요!</text>`;
}

// ⑤ 정책 평가 — 별점 + 새 목소리
function evalSvg(rated: boolean): string {
  const stars = [0, 1, 2, 3, 4]
    .map((i) => {
      const x = 76 + i * 22;
      const on = rated && i < 4;
      return `<path d="M${x} 30l3.4 7 7.6 1-5.5 5.4 1.3 7.6-6.8-3.6-6.8 3.6 1.3-7.6-5.5-5.4 7.6-1z" fill="${on ? "#F2C24E" : "#E4EAF0"}" stroke="${on ? "#C0871C" : "#B8C2CE"}" stroke-width="1.2"${rated && i < 4 ? ` class="hs8-noti"` : ""}/>`;
    })
    .join("");
  const extra = rated
    ? `<g class="hs8-noti" style="animation-delay:.4s">
        ${stickman(180, 84, { mood: "sad", arm: "up", r: 5.6 })}
        <rect x="130" y="56" width="76" height="18" rx="8" fill="#FFF" stroke="#C0392E" stroke-width="1.5"/>
        <path d="M172 74l3 5 3-5z" fill="#FFF" stroke="#C0392E" stroke-width="1.1"/>
        <text x="168" y="68" text-anchor="middle" font-size="7.2" font-weight="800" fill="#39455C">아침엔 아직 위험해요!</text>
      </g>`
    : `${stickman(120, 84, { mood: "ok", r: 5.8 })}`;
  return `${stars}${extra}
    <text x="120" y="126" text-anchor="middle" font-size="8.4" font-weight="700" fill="#7E8AA0">${rated ? "칭찬 속에 새로운 목소리가 태어났어요" : "시민들이 정책의 성적표를 매겨요"}</text>`;
}

interface PcyPhase {
  id: string;
  fileLabel: string;
  stageName: string;
  intro: string;
  quiz?: { q: string; options: [string, string]; good: string; wrong: string };
}

const PHASES: PcyPhase[] = [
  {
    id: "voice",
    fileLabel: "정거장 ①",
    stageName: "이익 표출",
    intro: "스틱 시 학교 앞, 걱정하는 사람들이 있어요. <b>목소리 모으기</b> 버튼으로 한 명씩 들어 봐요.",
  },
  {
    id: "gather",
    fileLabel: "정거장 ②",
    stageName: "이익 집약",
    intro: "목소리가 셋, 그런데 흩어져 있으면 힘이 약해요. <b>하나로 모으기</b>를 눌러 요구안으로 묶어 봐요.",
    quiz: {
      q: "흩어진 목소리를 모아 요약하고 대안을 제시하는 일은 주로 누가 할까요?",
      options: ["정당과 언론", "국회와 정부"],
      good: "맞아요! 이익을 모아 요약하는 <b>이익 집약</b>은 주로 <b>정당과 언론</b>의 몫이에요. 국회와 정부는 그다음 정거장에서 결정을 맡죠. 시험에 잘 나오는 함정이랍니다!",
      wrong: "국회와 정부는 '결정'의 정거장에서 만나요. 그 전에 목소리를 모아 다듬는 건 <b>정당과 언론</b>의 일이에요. 단계마다 주인공이 다르답니다. 다시 골라 봐요!",
    },
  },
  {
    id: "decide",
    fileLabel: "정거장 ③",
    stageName: "정책 결정",
    intro: "요구안이 회의장에 도착했어요. <b>회의 열기</b>를 눌러 결정의 순간을 지켜봐요.",
    quiz: {
      q: "요구를 바탕으로 법을 만들어 정책을 결정하는 국가기관은 어디일까요?",
      options: ["국회, 정부와 함께 정책을 결정한다", "시장 상인들의 단체"],
      good: "정확해요! <b>국회</b>가 관련 법률을 만들고 <b>정부와 함께</b> 정책을 결정해요. 개인과 집단의 요구가 드디어 나라의 약속이 되는 정거장이죠.",
      wrong: "단체는 요구를 '내는' 쪽이에요. 그 요구로 법을 만들어 정책을 '결정'하는 공식 기관은 <b>국회</b>(정부와 함께)랍니다. 다시 골라 봐요!",
    },
  },
  {
    id: "execute",
    fileLabel: "정거장 ④",
    stageName: "정책 집행",
    intro: "결정됐다고 끝이 아니에요. 누군가 현장에서 <b>실행</b>해야 진짜가 되죠. <b>정책 실행하기</b>를 눌러요.",
    quiz: {
      q: "결정된 정책을 현장에서 실제로 실행하는 곳은 어디일까요?",
      options: ["정부", "국회"],
      good: "맞아요! 표지판을 세우고 바닥을 칠하는 <b>집행</b>은 <b>정부</b>의 일이에요. 국회는 법을 만들고, 정부는 그 법을 현실로 만들죠. 이것도 단골 함정!",
      wrong: "국회의 일은 법을 만드는 것까지, 그 법을 들고 현장에서 실행하는 건 <b>정부</b>랍니다. 결정과 집행의 주인공을 가르는 게 이 단원의 열쇠예요. 다시 골라 봐요!",
    },
  },
  {
    id: "evaluate",
    fileLabel: "정거장 ⑤",
    stageName: "정책 평가",
    intro: "표지판이 선 지 한 달, 시민들이 <b>성적표</b>를 매길 차례예요. <b>별점 남기기</b>를 눌러요.",
  },
];

const FINALE_Q = "평가에서 나온 새로운 목소리(\"아침엔 아직 위험해요\")는 이제 어떻게 될까요?";
const FINALE_OPTS: [string, string] = [
  "다시 정치과정에 반영된다. 과정은 한 바퀴로 끝나지 않고 순환한다",
  "정책이 이미 정해졌으니 그냥 사라진다",
];

// 기계 검산용 export(qa/audit-soc10-data.mjs — 단계 순서·options[0]=정답 규약 검사)
export const POLICY_PHASES = PHASES;
export const POLICY_FINALE = { q: FINALE_Q, options: FINALE_OPTS };
export const POLICY_STATIONS = STATIONS;

export const policyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "stations" } }, el("b", { text: "다섯 정거장" }), el("span", { text: "0 / 5" })),
    el("div", { class: "pn-badge world", dataset: { g: "quiz" } }, el("b", { text: "담당 판정" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge world", dataset: { g: "loop" } }, el("b", { text: "환류 확인" }), el("span", { text: "대기" })),
  );
  const helper = el("div", { class: "helper", html: PHASES[0].intro });

  const fileTag = el("div", { class: "ppl-file", text: PHASES[0].fileLabel });
  const sceneBox = el("div", { class: "ppl-scene" });
  const badges = el("div", { class: "ppl-badges" });
  const stage = el("div", { class: "stage ppl-stage" }, fileTag, sceneBox, badges);

  const controls = el("div", { class: "ppl-controls" });

  const quizQ = el("div", { class: "msn-q" });
  const optBtns = [0, 1].map((i) => el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: String(i) } }));
  const quizCard = el("div", { class: "msn-quiz ppl-quiz" }, quizQ, ...optBtns);

  host.append(goalChips, helper, stage, controls, quizCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  const chipOf = (g: string): HTMLElement => goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement;
  const lightChip = (g: string, sub?: string): void => {
    const chip = chipOf(g);
    if (sub) chip.querySelector("span")!.textContent = sub;
    if (!chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  };

  let phase = 0;
  let clean = true;
  let quizOpen = false;
  let quizDone = 0;
  let stationsDone = 0;
  let finaleMode = false;

  function refreshScene(html: string): void {
    sceneBox.classList.remove("in");
    void sceneBox.offsetWidth;
    sceneBox.classList.add("in");
    sceneBox.innerHTML = html;
  }

  function openQuiz(): void {
    const q = finaleMode ? FINALE_Q : PHASES[phase].quiz!.q;
    const opts = finaleMode ? FINALE_OPTS : PHASES[phase].quiz!.options;
    quizOpen = true;
    quizQ.innerHTML = q;
    optBtns.forEach((b, i) => {
      b.classList.remove("ok", "no", "dim");
      b.innerHTML = opts[i];
    });
    quizCard.classList.add("show");
    later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function advance(): void {
    quizCard.classList.remove("show");
    badges.appendChild(el("span", { class: "ppl-prop", text: PHASES[phase].stageName }));
    stationsDone += 1;
    const chip = chipOf("stations");
    chip.querySelector("span")!.textContent = `${stationsDone} / 5`;
    if (stationsDone >= 5 && !chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
    if (phase + 1 >= PHASES.length) {
      // 피날레 — 환류 화살표 점등 + 마지막 판정
      finaleMode = true;
      fileTag.textContent = "숨은 정거장";
      refreshScene(wrap(4, true, evalSvg(true)));
      helper.innerHTML =
        "그런데 트랙을 봐요. 평가 정거장에서 <b>첫 정거장으로 되감기는 화살표</b>가 생겼어요! 새 목소리의 운명, 마지막 판정이에요.";
      later(openQuiz, 1000);
      return;
    }
    phase += 1;
    fileTag.textContent = PHASES[phase].fileLabel;
    helper.innerHTML = PHASES[phase].intro;
    mountPhase();
  }

  optBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (!quizOpen) return;
      if (i === 0) {
        quizOpen = false;
        haptic(HAPTIC.correct);
        btn.classList.add("ok");
        optBtns[1].classList.add("dim");
        if (finaleMode) {
          lightChip("loop", "순환 확인!");
          helper.innerHTML =
            "완주! <b>이익 표출 → 이익 집약 → 정책 결정 → 정책 집행 → 정책 평가</b>, 그리고 평가가 다시 표출로 이어지는 <b>환류</b>까지, 목소리가 정책이 되는 길은 <b>순환하는 길</b>이에요. 시민의 목소리가 멈추지 않는 한, 정치과정도 멈추지 않죠!",
          quizCard.classList.remove("show");
          api.recordQuiz(clean);
          api.enableCTA(s.cta ?? "길 이름 정리하기");
          return;
        }
        quizDone += 1;
        // 진행 중엔 서브텍스트만, 점등은 3판정 완료 때만
        chipOf("quiz").querySelector("span")!.textContent = `${quizDone} / 3`;
        if (quizDone >= 3) lightChip("quiz", "3 / 3");
        helper.innerHTML = PHASES[phase].quiz!.good;
        later(advance, 1500);
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        btn.classList.add("no");
        helper.innerHTML = finaleMode
          ? "사라지기엔 아까운 목소리죠. 트랙의 노란 화살표를 봐요. 평가에서 나온 의견은 다시 첫 정거장(표출)으로 들어가 과정을 한 바퀴 더 돌려요. 다시 골라 봐요!"
          : PHASES[phase].quiz!.wrong;
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  function actBtn(label: string): HTMLButtonElement {
    return el("button", { class: "btn ppl-act", attrs: { type: "button" }, text: label }) as HTMLButtonElement;
  }

  function mountPhase(): void {
    controls.innerHTML = "";
    const id = PHASES[phase].id;
    if (id === "voice") {
      refreshScene(wrap(0, false, voiceSvg(0)));
      let n = 0;
      const b = actBtn("목소리 모으기 (0/3)");
      controls.appendChild(b);
      const msgs = [
        "\"<b>등하굣길이 위험해요</b>\", 학부모의 걱정이 첫 목소리예요.",
        "\"<b>세워 둔 차 때문에 아이들이 안 보여요</b>\", 운전자도 목소리를 냈어요.",
        "\"<b>건널목 신호가 너무 짧아요</b>\", 학생의 목소리까지, 셋! 이렇게 요구를 자유롭게 표현하는 게 첫 정거장이에요.",
      ];
      b.addEventListener("click", () => {
        if (n >= 3) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(wrap(0, false, voiceSvg(n)));
        b.textContent = `목소리 모으기 (${n}/3)`;
        helper.innerHTML = msgs[n - 1];
        if (n >= 3) {
          b.disabled = true;
          b.classList.add("done");
          later(advance, 1400);
        }
      });
    } else if (id === "gather") {
      refreshScene(wrap(1, false, gatherSvg(false)));
      const b = actBtn("하나로 모으기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(wrap(1, false, gatherSvg(true)));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "세 목소리가 <b>하나의 요구안</b>으로! 모아서 요약하니 힘이 세졌어요. 그런데 이 일은 주로 누가 할까요?";
        later(openQuiz, 800);
      });
    } else if (id === "decide") {
      refreshScene(wrap(2, false, decideSvg(false)));
      const b = actBtn("회의 열기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(wrap(2, false, decideSvg(true)));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "탕탕탕, \"학교 앞을 보호 구역으로 정한다\", <b>통과</b>! 요구가 드디어 나라의 약속이 됐어요. 이 결정은 어디의 일일까요?";
        later(openQuiz, 800);
      });
    } else if (id === "execute") {
      refreshScene(wrap(3, false, executeSvg(false)));
      const b = actBtn("정책 실행하기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(wrap(3, false, executeSvg(true)));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "노란 표지판이 서고 바닥이 칠해졌어요. 훅에서 본 <b>그 표지판</b>이 바로 이 순간 태어난 거예요! 실행은 누구의 일일까요?";
        later(openQuiz, 800);
      });
    } else {
      refreshScene(wrap(4, false, evalSvg(false)));
      const b = actBtn("별점 남기기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(wrap(4, false, evalSvg(true)));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "별 넷, \"많이 안전해졌어요!\" 그런데 그때, <b>새로운 목소리</b>가 들려요: \"아침엔 아직 위험해요!\"";
        later(advance, 1400);
      });
    }
  }

  mountPhase();
  api.setCTA("다섯 정거장을 모두 지나요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
