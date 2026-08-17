// workRightLab — 사회 Ⅻ L6 기함: 노동 3권 릴레이 "대등해지는 세 걸음". 반사실 관찰(혼자
// 협상 — 목소리가 닿지 않는 기울어진 저울, Ⅺ 만화 「우산이 된 법」의 그 저울 회수)에서 출발해
// 단결권(흩어진 점들이 모임) → 단체 교섭권(같은 높이의 테이블) → 단체 행동권(일정한 절차를
// 거친 담담한 멈춤 → 재교섭 → 타결 악수)을 한 걸음씩 세운다. 미래엔 232쪽·비상 233쪽 두 책
// 공통 노동 3권이 코어. 민감 가드: 사용자 악역화 0(중립 표정·타결 악수 마무리), 파업은 구호·
// 팻말 0의 "멈추고 기다리는" 담담한 연출만, 갈등 클로즈업 0.
// electLab·principleLab 국면 릴레이 문법 계승(ppl-* 릴레이 킷 CSS 재사용 — 신규 CSS 0줄).
// 판정 msn은 세 국면(단결권 명명 / 단체 교섭권 명명 / 행동권 = "일정한 절차" 함정).
// rAF 없음 — CSS 트랜지션 + setTimeout 체인(타이머 Set 일괄 해제).
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
  <linearGradient id="wrl-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset=".55" stop-color="#A87838"/><stop offset="1" stop-color="#8A6034"/></linearGradient>
  <linearGradient id="wrl-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F6"/></linearGradient>
  <linearGradient id="wrl-plum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C86ADB"/><stop offset=".55" stop-color="#AE3EC9"/><stop offset="1" stop-color="#8B2FA4"/></linearGradient>
</defs>`;

function wrap(inner: string): string {
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${DEFS}
    <ellipse cx="120" cy="144" rx="100" ry="5" fill="#2A3A5E" opacity=".1"/>${inner}</svg>`;
}

/** 우상단 미니 저울(대등함 게이지 — Ⅺ 만화 기울어진 저울 회수) */
function miniScale(tilt: number): string {
  return `<g transform="translate(206 24)">
    <path d="M0 4v14" stroke="#6E4E26" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M-8 18h16" stroke="#6E4E26" stroke-width="1.8" stroke-linecap="round"/>
    <g transform="rotate(${tilt})">
      <path d="M-14 4h28" stroke="#6E4E26" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M-14 4q0 4 4 4t4-4M6 4q0 4 4 4t4-4" fill="none" stroke="#6E4E26" stroke-width="1.3"/>
    </g>
  </g>`;
}

// ⓪ 혼자 협상 — 큰 책상 너머로 목소리가 닿지 않는다(반사실 관찰)
function aloneSvg(tried: boolean): string {
  const voice = tried
    ? `<g opacity=".8">
        <path d="M74 62q6-3 10-1M76 70q4-2 7-1" stroke="#8A93A6" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M96 66q2 0 3 0" stroke="#C8D2DE" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="1 4"/>
      </g>`
    : "";
  return wrap(`
    ${miniScale(-10)}
    ${stickman(56, 62, { mood: "sad", arm: "out", r: 6.4 })}
    <rect x="108" y="56" width="96" height="52" rx="7" fill="url(#wrl-desk)" stroke="#6E4E26" stroke-width="1.8"/>
    <rect x="100" y="108" width="112" height="7" rx="3.5" fill="#8A6034"/>
    ${stickman(178, 40, { mood: "ok", r: 6.8 })}
    <rect x="124" y="66" width="30" height="20" rx="3" fill="url(#wrl-paper)" stroke="#8A93A6" stroke-width="1.3"/>
    <path d="M129 72h20M129 78h14" stroke="#B8C2CE" stroke-width="1.5" stroke-linecap="round"/>
    ${voice}
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${tried ? "목소리가 책상을 넘지 못해요. 저울이 기울어 있어요" : "근로 조건을 바꾸고 싶은데, 혼자 마주 앉으면?"}</text>`);
}

// ① 단결권 — 흩어진 점들이 하나의 원으로
function unionSvg(step: number): string {
  const scattered = [
    [40, 52],
    [86, 88],
    [58, 108],
    [150, 96],
  ];
  const circled = [
    [96, 72],
    [124, 64],
    [152, 72],
    [124, 92],
  ];
  const pos = step === 0 ? scattered : circled;
  const ring =
    step >= 2
      ? `<circle cx="124" cy="76" r="42" fill="none" stroke="#AE3EC9" stroke-width="2" stroke-dasharray="5 6" class="hs8-noti"/>`
      : "";
  return wrap(`
    ${miniScale(step >= 2 ? -6 : -10)}
    ${pos.map(([x, y]) => stickman(x, y, { mood: step >= 2 ? "joy" : "ok", arm: step >= 2 ? "up" : "out", r: 5.8 })).join("")}
    ${ring}
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${step >= 2 ? "하나의 단체가 됐어요. 노동조합!" : step === 1 ? "한 사람씩 모여들어요. 한 번 더!" : "같은 고민을 하는 사람들이 흩어져 있어요"}</text>`);
}

// ② 단체 교섭권 — 같은 높이의 테이블에 마주 앉다
function bargainSvg(done: boolean): string {
  const talk = done
    ? `<g class="hs8-noti">
        <path d="M96 46q8-8 20-8h8q12 0 20 8" stroke="#AE3EC9" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M116 34l4 4 4-4" fill="none" stroke="#AE3EC9" stroke-width="2" stroke-linejoin="round"/>
      </g>`
    : "";
  return wrap(`
    ${miniScale(done ? 0 : -6)}
    <rect x="76" y="72" width="88" height="12" rx="4" fill="url(#wrl-desk)" stroke="#6E4E26" stroke-width="1.6"/>
    <path d="M86 84v26M154 84v26" stroke="#8A6034" stroke-width="4" stroke-linecap="round"/>
    ${stickman(52, 58, { mood: "ok", r: 6.4 })}
    ${stickman(38, 74, { mood: "ok", r: 5.2 })}
    ${stickman(188, 58, { mood: "ok", r: 6.4 })}
    <rect x="108" y="58" width="26" height="16" rx="3" fill="url(#wrl-paper)" stroke="#8A93A6" stroke-width="1.3"/>
    <path d="M112 63h18M112 68h12" stroke="#B8C2CE" stroke-width="1.4" stroke-linecap="round"/>
    ${talk}
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${done ? "같은 높이에서 조건을 이야기해요. 저울이 수평!" : "이제 노동조합의 이름으로 마주 앉아요"}</text>`);
}

// ③ 단체 행동권 — 절차를 거친 담담한 멈춤 → 재교섭 → 악수
function actionSvg(step: number): string {
  if (step === 0) {
    // 교섭이 어긋남 — 서로 다른 방향의 말 곡선(담담)
    return wrap(`
      ${miniScale(-4)}
      <rect x="76" y="72" width="88" height="12" rx="4" fill="url(#wrl-desk)" stroke="#6E4E26" stroke-width="1.6"/>
      ${stickman(52, 58, { mood: "sad", r: 6.4 })}
      ${stickman(188, 58, { mood: "sad", r: 6.4 })}
      <path d="M96 48q12-10 24-4" stroke="#8A93A6" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-dasharray="4 4"/>
      <path d="M144 44q-12-10-24-4" stroke="#8A93A6" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-dasharray="4 4"/>
      <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">여러 번 이야기해도 협의가 이루어지지 않았어요</text>`);
  }
  if (step === 1) {
    // 일정한 절차 — 절차 서류에 도장
    return wrap(`
      ${miniScale(-4)}
      <rect x="82" y="46" width="76" height="52" rx="6" fill="url(#wrl-paper)" stroke="#8A93A6" stroke-width="1.6"/>
      <path d="M92 60h56M92 70h44M92 80h50" stroke="#C8D2DE" stroke-width="1.8" stroke-linecap="round"/>
      <g class="hs8-noti"><circle cx="146" cy="86" r="7.4" fill="#AE3EC9"/><path d="M142.4 86l2.6 2.8 4.4-5.2" stroke="#FFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>
      ${stickman(52, 76, { mood: "ok", r: 6 })}
      <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">먼저 법이 정한 절차를 밟아요. 아무 때나가 아니에요</text>`);
  }
  if (step === 2) {
    // 담담한 멈춤 — 어두워진 작업대, 나란히 서서 기다림(구호·팻말 0)
    return wrap(`
      ${miniScale(0)}
      <rect x="46" y="56" width="148" height="34" rx="6" fill="#5A6478" opacity=".5"/>
      <rect x="58" y="64" width="26" height="18" rx="3" fill="#7E8AA0" opacity=".5"/>
      <rect x="98" y="64" width="26" height="18" rx="3" fill="#7E8AA0" opacity=".5"/>
      <rect x="138" y="64" width="26" height="18" rx="3" fill="#7E8AA0" opacity=".5"/>
      ${stickman(70, 112, { mood: "ok", arm: "down", r: 5.6 })}
      ${stickman(104, 112, { mood: "ok", arm: "down", r: 5.6 })}
      ${stickman(138, 112, { mood: "ok", arm: "down", r: 5.6 })}
      <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">일손을 멈추고 담담히 기다려요. 이것도 헌법이 보장한 권리</text>`);
  }
  // 타결 — 악수
  return wrap(`
    ${miniScale(0)}
    <g class="hs8-noti">
      <path d="M104 64q8 6 16 0" stroke="#3C4654" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </g>
    ${stickman(88, 56, { mood: "joy", r: 7 })}
    ${stickman(152, 56, { mood: "joy", r: 7 })}
    <path d="M96 74q14 8 24 0q10 8 24 0" stroke="#3C4654" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="102" y="96" width="36" height="24" rx="4" fill="url(#wrl-paper)" stroke="#8A93A6" stroke-width="1.5"/>
    <path d="M108 104h24M108 110h16" stroke="#B8C2CE" stroke-width="1.6" stroke-linecap="round"/>
    <g class="hs8-noti"><circle cx="132" cy="112" r="5.6" fill="#AE3EC9"/><path d="M129.4 112l2 2.2 3.4-4" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>
    <path d="M56 32l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6zM186 26l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" fill="#E4A8F0"/>
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">타결! 개선된 근로 조건에 함께 서명했어요</text>`);
}

interface WrlPhase {
  id: string;
  fileLabel: string;
  stageName?: string;
  intro: string;
  quiz?: { q: string; options: [string, string]; good: string; wrong: string };
}

const PHASES: WrlPhase[] = [
  {
    id: "alone",
    fileLabel: "관찰",
    intro: "스틱 카페에서 일하는 스틱맨, 근로 조건을 바꾸고 싶어 <b>혼자</b> 이야기하러 갔어요. Ⅺ 만화의 <b>기울어진 저울</b>, 기억나요? 목소리를 내 봐요.",
  },
  {
    id: "union",
    fileLabel: "첫걸음",
    stageName: "단결권",
    intro: "혼자서는 목소리가 책상을 넘지 못했어요. 그런데 같은 고민을 하는 동료들이 곳곳에 있네요. <b>함께 모여</b> 단체를 만들어요!",
    quiz: {
      q: "방금 걸은 첫걸음, 노동조합을 만들고 가입해 활동할 수 있는 권리의 이름은?",
      options: ["단결권", "단체 행동권"],
      good: "맞아요! 근로 조건을 지키고 개선하려고 <b>노동조합을 만들고 가입해 활동</b>하는 권리가 <b>단결권</b>, 대등해지는 세 걸음의 출발점이에요.",
      wrong: "행동은 아직이에요. 지금은 흩어진 사람들이 <b>단체로 뭉친</b> 단계죠. 노동조합을 만들고 가입하는 권리는 단결권이랍니다. 다시 골라 봐요!",
    },
  },
  {
    id: "bargain",
    fileLabel: "두 걸음",
    stageName: "단체 교섭권",
    intro: "이번엔 노동조합의 이름으로 <b>같은 높이의 테이블</b>에 마주 앉아요. 임금·근로 시간 같은 근로 조건을 함께 이야기해요!",
    quiz: {
      q: "노동조합이 사용자와 근로 조건에 관해 협의할 수 있는 권리는?",
      options: ["단체 교섭권", "단결권"],
      good: "정확해요! 노동조합을 <b>통해</b> 사용자와 근로 조건을 <b>협의</b>하는 권리가 <b>단체 교섭권</b>, 뭉치는 힘(단결권) 다음의 두 번째 걸음이에요.",
      wrong: "단결권은 조합을 '만들고 가입하는' 권리였죠. 만들어진 조합이 사용자와 마주 앉아 <b>협의</b>하는 권리는 단체 교섭권이에요. 다시 골라 봐요!",
    },
  },
  {
    id: "action",
    fileLabel: "세 걸음",
    stageName: "단체 행동권",
    intro: "그런데 여러 번 마주 앉아도 <b>협의가 이루어지지 않는다면</b>? 마지막 세 번째 걸음이 남아 있어요. 한 단계씩 밟아 봐요.",
    quiz: {
      q: "협의가 원만하게 이루어지지 않았을 때, 근로자들은 어떻게 할 수 있을까요?",
      options: ["일정한 절차를 거쳐 파업 등의 단체 행동을 할 수 있다", "아무 때나 곧바로 일을 멈춰도 된다"],
      good: "정확해요! <b>일정한 절차를 거쳐</b> 파업 같은 집단행동을 할 수 있는 권리가 <b>단체 행동권</b>, '절차를 거쳐'가 이 권리의 핵심 조건이랍니다.",
      wrong: "'아무 때나'가 함정이에요. 단체 행동권은 <b>일정한 절차를 거친</b> 뒤에야 쓸 수 있는 권리랍니다. 방금 도장 찍은 절차 서류가 그 증거! 다시 골라 봐요.",
    },
  },
];

// 기계 검산용 export(qa/audit-soc12-data.mjs — 걸음 순서(단결→교섭→행동)·options[0]=정답 규약 검사)
export const WORKRIGHT_PHASES = PHASES;

export const workRightLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "steps" } }, el("b", { text: "세 걸음" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge world", dataset: { g: "quiz" } }, el("b", { text: "꼼꼼 판정" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge world", dataset: { g: "final" } }, el("b", { text: "저울 수평" }), el("span", { text: "대기" })),
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
  let stepsDone = 0;

  function refreshScene(html: string): void {
    sceneBox.classList.remove("in");
    void sceneBox.offsetWidth;
    sceneBox.classList.add("in");
    sceneBox.innerHTML = html;
  }

  function stepCount(): void {
    stepsDone += 1;
    const chip = chipOf("steps");
    chip.querySelector("span")!.textContent = `${stepsDone} / 3`;
    if (stepsDone >= 3 && !chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  }

  function openQuiz(): void {
    const qz = PHASES[phase].quiz!;
    quizOpen = true;
    quizQ.innerHTML = qz.q;
    optBtns.forEach((b, i) => {
      b.classList.remove("ok", "no", "dim");
      b.innerHTML = qz.options[i];
    });
    quizCard.classList.add("show");
    later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function advance(): void {
    quizCard.classList.remove("show");
    const name = PHASES[phase].stageName;
    if (name) {
      badges.appendChild(el("span", { class: "ppl-prop", text: name }));
      stepCount();
    }
    if (phase + 1 >= PHASES.length) {
      fileTag.textContent = "타결";
      refreshScene(actionSvg(3));
      lightChip("final", "수평!");
      helper.innerHTML =
        "저울이 수평이 됐어요! <b>단결권 · 단체 교섭권 · 단체 행동권</b>, 근로자가 사용자와 <b>대등한 위치</b>에서 근로 조건을 정할 수 있도록 헌법이 보장한 노동 3권이에요. 세 걸음의 끝은 언제나 협의와 타결이랍니다!";
      api.recordQuiz(clean);
      api.enableCTA(s.cta ?? "권리 정리하러 가기");
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
        quizDone += 1;
        // 진행 중엔 서브텍스트만 갱신, 점등은 3판정 완료 때만(principleLab 조기 점등 사고 계승)
        chipOf("quiz").querySelector("span")!.textContent = `${quizDone} / 3`;
        if (quizDone >= 3) lightChip("quiz", "3 / 3");
        helper.innerHTML = PHASES[phase].quiz!.good;
        later(advance, 1500);
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        btn.classList.add("no");
        helper.innerHTML = PHASES[phase].quiz!.wrong;
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
    if (id === "alone") {
      refreshScene(aloneSvg(false));
      const b = actBtn("혼자 말해 보기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(aloneSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "목소리가 책상을 넘지 못했어요. 일자리가 필요한 쪽이 늘 약해지기 쉬운 <b>기울어진 저울</b>이죠. 그래서 헌법은 근로자에게 특별한 세 걸음을 마련해 뒀어요.";
        later(advance, 1700);
      });
    } else if (id === "union") {
      refreshScene(unionSvg(0));
      let n = 0;
      const b = actBtn("함께 모이기 (0/2)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(unionSvg(n));
        b.textContent = `함께 모이기 (${n}/2)`;
        helper.innerHTML =
          n === 1
            ? "한 사람, 두 사람, 같은 고민이 모여들어요. 한 번 더!"
            : "하나의 단체가 됐어요. 근로 조건의 유지·개선을 위해 근로자들이 만든 단체, <b>노동조합</b>! 그럼 방금 걸은 이 첫걸음의 이름은?";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(openQuiz, 1000);
        }
      });
    } else if (id === "bargain") {
      refreshScene(bargainSvg(false));
      const b = actBtn("교섭 테이블 차리기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(bargainSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "같은 높이의 테이블, 혼자일 때 닿지 않던 목소리가 이제 <b>협의</b>가 돼요. 우상단 저울도 수평! 이 두 번째 걸음의 이름은?";
        later(openQuiz, 900);
      });
    } else {
      refreshScene(actionSvg(0));
      let n = 0;
      const b = actBtn("다음 단계 밟기 (0/2)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(actionSvg(n));
        b.textContent = n >= 2 ? "일손을 멈췄어요" : `다음 단계 밟기 (${n}/2)`;
        helper.innerHTML =
          n === 1
            ? "곧바로 멈추는 게 아니에요. 먼저 <b>법이 정한 절차</b>를 밟아 도장을 받아요."
            : "절차를 거친 뒤, 일손을 멈추고 담담히 기다려요. 파업 같은 <b>집단행동</b>도 헌법이 보장한 권리예요. 그럼 마지막 걸음의 조건을 판정해 봐요!";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(openQuiz, 1100);
        }
      });
    }
  }

  mountPhase();
  api.setCTA("세 걸음을 모두 걸어요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
