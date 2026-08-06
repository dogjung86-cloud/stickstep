// electLab — 사회 Ⅹ L3 기함: 선거 과정 6단계 릴레이. "선거 관리 위원이 된 나"가 학급 회장
// 선거 한 판을 처음(선거인 명부)부터 끝(당선인 결정)까지 직접 굴린다 — 미래엔 188쪽 "선거 과정
// 한눈에 보기"·비상 183쪽 절차도의 앱판(무대는 훅 위촉장을 회수한 가상 학급 — 현실 선거 0).
// principleLab 국면 릴레이 문법 계승(ppl-* 릴레이 킷 CSS 재사용 — hs8 재사용 관례의 랩판).
// 판정 msn은 세 국면만(운동=공약 보는 눈·투표=비밀 칸막이(L2 회수)·당선=최다 득표) — 여섯 번
// 전부 묻으면 피로해서 조작 국면(명부·등록·개표)은 연타 조작만으로 전진한다.
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

function stickman(x: number, y: number, opts: { arm?: "up" | "down" | "out"; mood?: "ok" | "sad" | "joy"; r?: number; tone?: string } = {}): string {
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
  const badge = opts.tone ? `<circle cx="${x + r - 1}" cy="${y - r + 1}" r="3" fill="${opts.tone}"/>` : "";
  return `<g ${STICK}><circle cx="${x}" cy="${y}" r="${r}" fill="#F6EFE4"/>
    <path d="M${x} ${y + r}v${r + 6}M${x} ${y + r * 2 + 6}l-${r - 1} ${r + 3}M${x} ${y + r * 2 + 6}l${r - 1} ${r + 3}${arms}"/></g>${face}${badge}`;
}

const DEFS = `<defs>
  <linearGradient id="elc-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F6"/></linearGradient>
  <linearGradient id="elc-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8CBA0"/><stop offset=".55" stop-color="#D9B98A"/><stop offset="1" stop-color="#C4A272"/></linearGradient>
  <linearGradient id="elc-booth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A4CE52"/><stop offset=".55" stop-color="#7CB024"/><stop offset="1" stop-color="#5C940D"/></linearGradient>
  <linearGradient id="elc-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FBE3A"/><stop offset=".55" stop-color="#5C940D"/><stop offset="1" stop-color="#47730A"/></linearGradient>
</defs>`;

function wrap(inner: string): string {
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${DEFS}
    <ellipse cx="120" cy="144" rx="100" ry="5" fill="#2A3A5E" opacity=".1"/>${inner}</svg>`;
}

// ① 선거인 명부 작성 — 명단 체크(checked 0..3)
function rosterSvg(checked: number): string {
  const rows = [0, 1, 2].map((i) => {
    const y = 52 + i * 24;
    const on = checked > i;
    return `<g opacity="${on ? 1 : 0.5}">
      <circle cx="76" cy="${y}" r="7" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.6"/>
      <rect x="92" y="${y - 4}" width="56" height="8" rx="4" fill="${on ? "#8A93A6" : "#C9D2DC"}"/>
      <rect x="156" y="${y - 7}" width="14" height="14" rx="3" fill="${on ? "#5C940D" : "#FFF"}" stroke="${on ? "#47730A" : "#B8C2CE"}" stroke-width="1.4"/>
      ${on ? `<path d="M159 ${y}l2.4 2.6 4-4.8" stroke="#FFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` : ""}
    </g>`;
  }).join("");
  return wrap(`
    <g transform="rotate(-1 120 80)">
      <rect x="56" y="22" width="128" height="112" rx="6" fill="url(#elc-paper)" stroke="#B8C2CE" stroke-width="1.6"/>
      <rect x="72" y="30" width="96" height="14" rx="7" fill="#5C940D"/>
      <text x="120" y="40" text-anchor="middle" font-size="9" font-weight="800" fill="#FFF">선거인 명부</text>
      ${rows}
      <ellipse cx="78" cy="27" rx="10" ry="2" fill="#fff" opacity=".55"/>
    </g>`);
}

// ② 후보자 등록 — 접수 창구(reg 0..2)
function registerSvg(reg: number): string {
  const cand = (x: number, num: string, on: boolean, fresh: boolean): string =>
    on
      ? `<g${fresh ? ` class="hs8-noti"` : ""}>
        ${stickman(x, 58, { mood: "joy", arm: "up" })}
        <rect x="${x - 13}" y="84" width="26" height="14" rx="7" fill="#FFF" stroke="#5C940D" stroke-width="1.5"/>
        <text x="${x}" y="94" text-anchor="middle" font-size="9" font-weight="900" fill="#47730A">${num}</text>
      </g>`
      : `<circle cx="${x}" cy="62" r="10" fill="none" stroke="#C9D2DC" stroke-width="1.6" stroke-dasharray="4 4"/>`;
  return wrap(`
    <rect x="40" y="104" width="160" height="16" rx="5" fill="url(#elc-desk)" stroke="#8A6A3E" stroke-width="1.6"/>
    <text x="120" y="115.5" text-anchor="middle" font-size="8.6" font-weight="800" fill="#5A4420">후보자 등록 접수처</text>
    ${cand(84, "기호 ①", reg >= 1, reg === 1)}
    ${cand(156, "기호 ②", reg >= 2, reg === 2)}
    <g transform="rotate(6 208 42)"><rect x="196" y="32" width="24" height="18" rx="3" fill="url(#elc-paper)" stroke="#8A93A6" stroke-width="1.3"/><path d="M201 39h14M201 44h9" stroke="#A8B2C2" stroke-width="1.3"/></g>`);
}

// ③ 선거 운동 — 공약 포스터(seen: Set 크기 0..2, focus: 지금 보는 쪽)
function campaignSvg(seenA: boolean, seenB: boolean, focus: "" | "a" | "b"): string {
  const poster = (x: number, num: string, on: boolean, hot: boolean, iconRows: string): string => `
    <g opacity="${on ? 1 : 0.55}"${hot ? ` class="hs8-noti"` : ""}>
      <rect x="${x - 44}" y="24" width="88" height="96" rx="6" fill="url(#elc-paper)" stroke="${on ? "#5C940D" : "#B8C2CE"}" stroke-width="1.8"/>
      ${stickman(x, 48, { mood: "joy", r: 5.4 })}
      <rect x="${x - 22}" y="66" width="44" height="12" rx="6" fill="#5C940D"/>
      <text x="${x}" y="74.7" text-anchor="middle" font-size="8" font-weight="900" fill="#FFF">${num}</text>
      ${iconRows}
    </g>`;
  const rowsA = `<g stroke="#8A93A6" stroke-width="1.6" stroke-linecap="round">
      <path d="M${120 - 96} 90h52M${120 - 96} 98h40"/></g>
    <path d="M${120 - 70} 108q4-6 8 0q4 6 8 0" stroke="#C0871C" stroke-width="1.6" fill="none"/>`;
  const rowsB = `<g stroke="#8A93A6" stroke-width="1.6" stroke-linecap="round">
      <path d="M${120 + 24} 90h52M${120 + 24} 98h40"/></g>
    <rect x="${120 + 42}" y="104" width="16" height="11" rx="2" fill="none" stroke="#2E8AC0" stroke-width="1.6"/>
    <path d="M${120 + 46} 104v-3h8v3" stroke="#2E8AC0" stroke-width="1.4" fill="none"/>`;
  return wrap(`
    ${poster(72, "기호 ①", seenA, focus === "a", rowsA)}
    ${poster(168, "기호 ②", seenB, focus === "b", rowsB)}
    <text x="120" y="140" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">공약을 꼼꼼히 살펴보는 중…</text>`);
}

// ④ 투표 — 기표소(stamped)
function voteSvg(stamped: boolean): string {
  return wrap(`
    <path d="M52 26h136v14H52z" fill="url(#elc-booth)" stroke="#47730A" stroke-width="1.7"/>
    <path d="M56 40v76M184 40v76" stroke="#47730A" stroke-width="3" stroke-linecap="round"/>
    <rect x="68" y="52" width="104" height="52" rx="5" fill="#EFF4E4" stroke="#A8BE7A" stroke-width="1.5"/>
    <rect x="84" y="66" width="72" height="26" rx="3" fill="url(#elc-paper)" stroke="#8A93A6" stroke-width="1.4"/>
    <text x="102" y="82" text-anchor="middle" font-size="8" font-weight="800" fill="#39455C">기호 ①</text>
    <text x="138" y="82" text-anchor="middle" font-size="8" font-weight="800" fill="#39455C">기호 ②</text>
    ${stamped ? `<g class="hs8-noti"><circle cx="102" cy="88" r="5" fill="none" stroke="#C0392E" stroke-width="1.8"/><circle cx="102" cy="88" r="1.6" fill="#C0392E"/></g>` : ""}
    ${stamped ? `<g transform="rotate(14 150 100)"><rect x="144" y="94" width="9" height="10" rx="2" fill="url(#elc-booth)" stroke="#47730A" stroke-width="1.2"/><rect x="142" y="104" width="13" height="3.4" rx="1.4" fill="#47730A"/></g>` : `<g transform="rotate(-8 150 96)"><rect x="144" y="90" width="9" height="10" rx="2" fill="url(#elc-booth)" stroke="#47730A" stroke-width="1.2"/><rect x="142" y="100" width="13" height="3.4" rx="1.4" fill="#47730A"/></g>`}
    <text x="120" y="132" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">칸막이 안 — 나만 아는 한 표</text>`);
}

// ⑤ 개표 — 막대 상승(round 0..3, 최종 7:5)
function countSvg(round: number): string {
  const a = [0, 3, 5, 7][round];
  const b = [0, 2, 4, 5][round];
  const bar = (x: number, n: number, color: string, label: string): string => `
    <rect x="${x - 18}" y="${112 - n * 10}" width="36" height="${n * 10}" rx="4" fill="${color}"/>
    <text x="${x}" y="${104 - n * 10}" text-anchor="middle" font-size="10" font-weight="900" fill="#39455C">${n || ""}</text>
    <text x="${x}" y="128" text-anchor="middle" font-size="8.6" font-weight="800" fill="#5A6478">${label}</text>`;
  return wrap(`
    <rect x="36" y="20" width="168" height="96" rx="8" fill="url(#elc-paper)" stroke="#B8C2CE" stroke-width="1.6"/>
    <path d="M48 112h144" stroke="#8A93A6" stroke-width="1.6"/>
    ${bar(92, a, "url(#elc-box)", "기호 ①")}
    ${bar(148, b, "#8FA8C8", "기호 ②")}
    <g transform="rotate(-8 40 130)"><rect x="30" y="122" width="20" height="14" rx="2" fill="#FFF" stroke="#8A93A6" stroke-width="1.3"/></g>
    <g transform="rotate(6 204 132)"><rect x="194" y="124" width="20" height="14" rx="2" fill="#FFF" stroke="#8A93A6" stroke-width="1.3"/></g>`);
}

// ⑥ 당선인 결정 — 확정 신(시작 상태는 개표 완료 화면을 그대로 씀)
function winnerSvg(): string {
  return wrap(`
    <g class="hs8-noti">
      ${stickman(120, 52, { mood: "joy", arm: "up", r: 7 })}
      <rect x="92" y="86" width="56" height="16" rx="8" fill="url(#elc-box)"/>
      <text x="120" y="97" text-anchor="middle" font-size="9" font-weight="900" fill="#FFF">기호 ① 당선</text>
      <path d="M84 30l-6-5M156 30l6-5M120 22v-7" stroke="#E2A020" stroke-width="2" stroke-linecap="round"/>
      <path d="M70 44l2 4.4 4.4 2-4.4 2-2 4.4-2-4.4-4.4-2 4.4-2zM172 38l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="#F2C24E"/>
    </g>
    ${stickman(64, 120, { mood: "joy", arm: "up", r: 5.2 })}
    ${stickman(120, 126, { mood: "joy", arm: "up", r: 5.2 })}
    ${stickman(176, 120, { mood: "joy", arm: "up", r: 5.2 })}`);
}

// 피날레 — 6단계 완성 띠
function stripSvg(): string {
  const steps = ["명부 작성", "후보 등록", "선거 운동", "투표", "개표", "당선 결정"];
  const nodes = steps
    .map((t, i) => {
      const x = 34 + i * 34.5;
      const y = i % 2 === 0 ? 52 : 92;
      return `<g>
      <circle cx="${x}" cy="${y}" r="13" fill="url(#elc-box)"/>
      <text x="${x}" y="${y + 3.4}" text-anchor="middle" font-size="9.6" font-weight="900" fill="#FFF">${i + 1}</text>
      <text x="${x}" y="${y + (i % 2 === 0 ? -20 : 28)}" text-anchor="middle" font-size="7.8" font-weight="800" fill="#3E5228">${t}</text>
    </g>`;
    })
    .join("");
  const path = steps
    .map((_, i) => {
      if (i === steps.length - 1) return "";
      const x1 = 34 + i * 34.5;
      const y1 = i % 2 === 0 ? 52 : 92;
      const x2 = 34 + (i + 1) * 34.5;
      const y2 = (i + 1) % 2 === 0 ? 52 : 92;
      return `<path d="M${x1 + 11} ${y1 + (y2 > y1 ? 7 : -7)} L${x2 - 11} ${y2 + (y2 > y1 ? -7 : 7)}" stroke="#8FA86A" stroke-width="2" stroke-dasharray="4 4"/>`;
    })
    .join("");
  return wrap(`${path}${nodes}
    <text x="120" y="132" text-anchor="middle" font-size="9.6" font-weight="800" fill="#47730A">여섯 단계 완주 — 공정한 선거 한 판 완성!</text>`);
}

interface ElcPhase {
  id: string;
  fileLabel: string;
  stageName: string; // 배지에 쌓일 단계 이름
  intro: string;
  quiz?: { q: string; options: [string, string]; good: string; wrong: string };
}

const PHASES: ElcPhase[] = [
  {
    id: "roster",
    fileLabel: "1단계",
    stageName: "선거인 명부 작성",
    intro: "선거 관리 위원의 첫 임무 — <b>투표할 수 있는 사람의 명단</b>부터 만들어요. 우리 반 학생들을 한 명씩 확인해 명부에 올려요!",
  },
  {
    id: "register",
    fileLabel: "2단계",
    stageName: "후보자 등록",
    intro: "명부 완성! 이제 <b>회장이 되고 싶은 사람</b>이 후보로 나설 차례 — 접수처에서 후보 등록을 받아요.",
  },
  {
    id: "campaign",
    fileLabel: "3단계",
    stageName: "선거 운동",
    intro: "후보들이 <b>선거 운동</b>을 시작했어요 — 포스터와 연설로 지지를 호소하죠. 유권자의 눈으로 두 공약을 모두 살펴봐요.",
    quiz: {
      q: "유권자가 공약을 살필 때 가장 중요한 것은 무엇일까요?",
      options: ["실현 가능성이 있는지, 후보의 능력은 어떤지 꼼꼼히 따진다", "포스터가 예쁜 쪽을 고른다"],
      good: "맞아요! 듣기 좋은 약속이 아니라 <b>지킬 수 있는 약속인지</b>, 후보의 능력과 자질은 어떤지 살피는 것 — 올바른 선택을 하는 유권자의 자세예요.",
      wrong: "포스터 솜씨는 회장의 능력과 상관없죠 — 유권자는 <b>공약의 실현 가능성</b>과 후보의 능력·자질을 꼼꼼히 살펴야 해요. 다시 골라 봐요!",
    },
  },
  {
    id: "vote",
    fileLabel: "4단계",
    stageName: "투표",
    intro: "드디어 <b>투표일</b>! 유권자가 기표소에 들어가 소중한 한 표를 행사해요 — 도장을 꾹 찍어 봐요.",
    quiz: {
      q: "기표소에 칸막이가 서 있는 까닭은 무엇일까요?",
      options: ["누구에게 투표했는지 다른 사람이 알지 못하게 하려고", "투표 도장을 잃어버리지 않게 하려고"],
      good: "정확해요! 지난 시간에 배운 <b>비밀 선거</b>의 원칙이 기표소 칸막이로 지켜지고 있는 거예요 — 원칙은 종이 위가 아니라 현장에 살아 있죠.",
      wrong: "도장은 끈에 묶여 있어서 괜찮아요! 칸막이의 진짜 임무는 <b>내 선택을 가려 주는 것</b> — 비밀 선거의 원칙을 지키는 장치랍니다. 다시 골라 봐요!",
    },
  },
  {
    id: "count",
    fileLabel: "5단계",
    stageName: "개표",
    intro: "투표 종료! 투표함을 열어 <b>표를 세는 개표</b>가 시작돼요 — 한 묶음씩 집계해 봐요.",
  },
  {
    id: "winner",
    fileLabel: "6단계",
    stageName: "당선인 결정",
    intro: "개표 결과 <b>7 대 5</b> — 이제 마지막 단계, 당선인을 결정할 시간이에요!",
    quiz: {
      q: "당선인은 어떻게 정해질까요?",
      options: ["가장 많은 표를 얻은 후보가 당선인이 된다", "선거 관리 위원이 마음에 드는 후보를 고른다"],
      good: "맞아요! <b>가장 많은 표를 얻은 후보</b>가 당선 — 유권자들의 표가 대표자를 결정하는 거예요. 선거 관리 위원은 그 과정을 공정하게 지킬 뿐이죠.",
      wrong: "선거 관리 위원은 심판이지 결정권자가 아니에요 — 당선인을 정하는 건 오직 <b>유권자들의 표</b>! 가장 많은 표를 얻은 후보가 당선된답니다. 다시 골라 봐요!",
    },
  },
];

// 기계 검산용 export(qa/audit-soc10-data.mjs — options[0]=정답 규약·단계 순서 검사)
export const ELECT_PHASES = PHASES;

export const electLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "steps" } }, el("b", { text: "여섯 단계" }), el("span", { text: "0 / 6" })),
    el("div", { class: "pn-badge world", dataset: { g: "quiz" } }, el("b", { text: "꼼꼼 판정" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge world", dataset: { g: "final" } }, el("b", { text: "당선 확정" }), el("span", { text: "대기" })),
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
    chip.querySelector("span")!.textContent = `${stepsDone} / 6`;
    if (stepsDone >= 6 && !chip.classList.contains("on")) {
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
    badges.appendChild(el("span", { class: "ppl-prop", text: PHASES[phase].stageName }));
    stepCount();
    if (phase + 1 >= PHASES.length) {
      // 피날레 — 6단계 띠
      fileTag.textContent = "선거 완주";
      refreshScene(stripSvg());
      lightChip("final", "완주!");
      helper.innerHTML =
        "선거 한 판 완주! <b>명부 작성 → 후보 등록 → 선거 운동 → 투표 → 개표 → 당선인 결정</b> — 이 여섯 단계가 공정한 선거의 길이에요. 나라의 선거도 똑같은 순서로 굴러간답니다!";
      api.recordQuiz(clean);
      api.enableCTA(s.cta ?? "역할 정리하러 가기");
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
        // 진행 중엔 서브텍스트만 갱신, 점등(on)은 3판정 완료 때만(principleLab 조기 점등 사고 계승)
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
    if (id === "roster") {
      refreshScene(rosterSvg(0));
      let n = 0;
      const b = actBtn("명단 확인하기 (0/3)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 3) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(rosterSvg(n));
        b.textContent = `명단 확인하기 (${n}/3)`;
        if (n >= 3) {
          b.disabled = true;
          b.classList.add("done");
          helper.innerHTML = "명부 완성! 선거 날 우리 반 학생이면 <b>누구나</b> 이 명단에 올라요 — 보통 선거의 원칙, 기억나죠?";
          later(advance, 1200);
        }
      });
    } else if (id === "register") {
      refreshScene(registerSvg(0));
      let n = 0;
      const b = actBtn("후보 등록 받기 (0/2)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(registerSvg(n));
        b.textContent = `후보 등록 받기 (${n}/2)`;
        helper.innerHTML = n === 1 ? "첫 번째 후보 등록 — <b>기호 ①</b>번이에요!" : "두 번째 후보까지 등록 완료 — <b>기호 ②</b>번! 이제 선거 운동이 시작돼요.";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(advance, 1200);
        }
      });
    } else if (id === "campaign") {
      refreshScene(campaignSvg(false, false, ""));
      const b1 = actBtn("기호 ① 공약 살피기");
      const b2 = actBtn("기호 ② 공약 살피기");
      controls.append(b1, b2);
      const seen = new Set<string>();
      const look = (key: "a" | "b", btn: HTMLButtonElement, msg: string): void => {
        if (seen.has(key)) return;
        seen.add(key);
        haptic(HAPTIC.select);
        refreshScene(campaignSvg(seen.has("a"), seen.has("b"), key));
        btn.classList.add("done");
        btn.disabled = true;
        helper.innerHTML = msg;
        if (seen.size >= 2) later(openQuiz, 900);
      };
      b1.addEventListener("click", () =>
        look("a", b1, "기호 ①의 공약: \"<b>매일 급식에 디저트 열 가지!</b>\" — 와, 신나는데… 우리 반 힘으로 지킬 수 있는 약속일까요?"),
      );
      b2.addEventListener("click", () =>
        look("b", b2, "기호 ②의 공약: \"<b>건의함을 만들어 매주 학급 회의에 올릴게요</b>\" — 구체적인 방법까지 담겨 있네요. 두 공약을 비교해 봐요!"),
      );
    } else if (id === "vote") {
      refreshScene(voteSvg(false));
      const b = actBtn("기표하기 — 도장 꾹!");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(voteSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "꾹 — 소중한 한 표가 찍혔어요. 접어서 투표함에 넣으면 끝! 그런데 이 칸막이, 왜 서 있는 걸까요?";
        later(openQuiz, 800);
      });
    } else if (id === "count") {
      refreshScene(countSvg(0));
      let n = 0;
      const b = actBtn("개표하기 (0/3)");
      controls.appendChild(b);
      const msgs = [
        "첫 묶음 — 기호 ① 3표, 기호 ② 2표!",
        "두 번째 묶음 — 5 대 4, 초박빙이에요!",
        "마지막 묶음까지 — <b>7 대 5</b>! 개표 완료, 이제 결과를 확정해요.",
      ];
      b.addEventListener("click", () => {
        if (n >= 3) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(countSvg(n));
        b.textContent = `개표하기 (${n}/3)`;
        helper.innerHTML = msgs[n - 1];
        if (n >= 3) {
          b.disabled = true;
          b.classList.add("done");
          later(advance, 1300);
        }
      });
    } else {
      refreshScene(countSvg(3));
      const b = actBtn("당선인 확정하기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(winnerSvg());
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "더 많은 표를 얻은 <b>기호 ①</b>이 당선! 그런데 — 당선인은 무엇으로 정해진 걸까요? 마지막 판정이에요.";
        later(openQuiz, 800);
      });
    }
  }

  mountPhase();
  api.setCTA("여섯 단계를 모두 완주해요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
