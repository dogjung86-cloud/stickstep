// fairTrialLab — 사회 Ⅺ L6 기함: 공정한 재판 4제도 반사실 릴레이. 가상 "스틱 시 법원"에서
// "이 장치가 없다면?"(principleLab 반사실 문법의 재판판)을 하나씩 체험한다 — 외압에 흔들리는
// 판사석에 바람막이를 세우고(사법권의 독립), 닫힌 커튼을 걷어 방청석을 열고(공개 재판주의),
// 소문 카드를 기각하고 증거를 채택하고(증거 재판주의), 잘못된 판결에 다시 기회를 연다(심급 제도).
// 미래엔 214~215·비상 214쪽 두 책 공통 4제도가 코어. 불공정 재판 사례는 전부 가상(실사건 0).
// electLab·principleLab 국면 릴레이 문법 계승(ppl-* 릴레이 킷 CSS 재사용 — 신규 CSS 0줄).
// 판정 msn은 세 국면(독립=헌법과 법률·양심 / 증거=적법 수집 증거 / 심급=항소 명명).
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
  <linearGradient id="ftl-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset=".55" stop-color="#A87838"/><stop offset="1" stop-color="#8A6034"/></linearGradient>
  <linearGradient id="ftl-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F6"/></linearGradient>
  <linearGradient id="ftl-shield" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07E2E"/><stop offset=".55" stop-color="#8C5A16"/><stop offset="1" stop-color="#6E4610"/></linearGradient>
  <linearGradient id="ftl-curtain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA0B8"/><stop offset="1" stop-color="#5A6B86"/></linearGradient>
  <linearGradient id="ftl-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECC26A"/><stop offset="1" stop-color="#A8781E"/></linearGradient>
</defs>`;

function wrap(inner: string): string {
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${DEFS}
    <ellipse cx="120" cy="144" rx="100" ry="5" fill="#2A3A5E" opacity=".1"/>${inner}</svg>`;
}

/** 판사석 공용 소품 */
function bench(x = 120, y = 58, tilt = 0): string {
  return `<g transform="rotate(${tilt} ${x} ${y})">
    ${stickman(x, y - 18, { r: 5.6, mood: tilt !== 0 ? "sad" : "ok" })}
    <rect x="${x - 32}" y="${y}" width="64" height="20" rx="4" fill="url(#ftl-desk)" stroke="#6E4E26" stroke-width="1.6"/>
    <rect x="${x - 38}" y="${y + 20}" width="76" height="6" rx="3" fill="#8A6034"/>
  </g>`;
}

// ① 사법권의 독립 — 외압 화살표(guarded=false) → 바람막이(true)
function indepSvg(guarded: boolean): string {
  const arrows = guarded
    ? `<g opacity=".9">
        <path d="M26 58h28M204 58h-28M40 96h20M200 96h-20" stroke="#C0392E" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 7"/>
      </g>`
    : `<g>
        <path d="M22 56h40M218 56h-40M34 96h30M206 96h-30" stroke="#C0392E" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M56 50l8 6-8 6M184 50l-8 6 8 6M58 90l8 6-8 6M182 90l-8 6 8 6" fill="none" stroke="#C0392E" stroke-width="2.4" stroke-linejoin="round"/>
      </g>`;
  const walls = guarded
    ? `<g class="hs8-noti">
        <rect x="72" y="34" width="7" height="76" rx="3.5" fill="url(#ftl-shield)" stroke="#5A3A0C" stroke-width="1.4"/>
        <rect x="161" y="34" width="7" height="76" rx="3.5" fill="url(#ftl-shield)" stroke="#5A3A0C" stroke-width="1.4"/>
        <path d="M75.5 30l2 4h-4zM164.5 30l2 4h-4z" fill="#8C5A16"/>
      </g>`
    : "";
  return wrap(`
    ${bench(120, 62, guarded ? 0 : -3)}
    ${arrows}${walls}
    <text x="120" y="126" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${guarded ? "바람막이 완성, 판사석이 흔들리지 않아요" : "힘센 기관·여론의 압력 화살표가 판사석을 흔들어요"}</text>
    <text x="42" y="40" text-anchor="middle" font-size="8" font-weight="800" fill="#C0392E" opacity="${guarded ? 0.35 : 1}">압력</text>
    <text x="198" y="40" text-anchor="middle" font-size="8" font-weight="800" fill="#C0392E" opacity="${guarded ? 0.35 : 1}">간섭</text>`);
}

// ② 공개 재판주의 — 커튼(open 0..2: 닫힘→반→활짝+방청객)
function openCourtSvg(open: number): string {
  const curtainW = open === 0 ? 96 : open === 1 ? 52 : 10;
  const gallery =
    open >= 2
      ? `<g class="hs8-noti">
        ${stickman(46, 116, { r: 5, mood: "ok" })}${stickman(84, 120, { r: 5, mood: "joy" })}${stickman(120, 118, { r: 5, mood: "ok" })}${stickman(156, 120, { r: 5, mood: "ok" })}${stickman(194, 116, { r: 5, mood: "joy" })}
      </g>`
      : "";
  return wrap(`
    ${bench(120, 46)}
    <rect x="30" y="20" width="180" height="76" rx="6" fill="none" stroke="#B8C2CE" stroke-width="1.6"/>
    <path d="M30 20v76M210 20v76" stroke="#8A93A6" stroke-width="2"/>
    <g>
      <rect x="${120 - curtainW}" y="21" width="${curtainW}" height="74" fill="url(#ftl-curtain)" opacity=".92"/>
      <rect x="120" y="21" width="${curtainW}" height="74" fill="url(#ftl-curtain)" opacity=".92"/>
      ${curtainW > 20 ? `<path d="M${120 - curtainW + 12} 24v68M${120 - 24} 24v68M${120 + 24} 24v68M${120 + curtainW - 12} 24v68" stroke="#4A5A74" stroke-width="1.4" opacity=".6"/>` : ""}
    </g>
    ${gallery}
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${open >= 2 ? "누구나 지켜보는 재판, 몰래 판결할 수 없어요" : open === 1 ? "커튼이 열리는 중…" : "커튼 뒤 밀실 재판, 안이 보이지 않아요"}</text>`);
}

// ③ 증거 재판주의 — 소문 카드 기각(rej), 증거 카드 채택(acc)
function evidenceSvg(rej: boolean, acc: boolean): string {
  const rumor = rej
    ? `<g opacity=".45" transform="rotate(-14 64 96)">
      <rect x="40" y="80" width="48" height="32" rx="5" fill="#EEF2F6" stroke="#8A93A6" stroke-width="1.5"/>
      <path d="M50 90q6-6 12 0q6 6 12 0" stroke="#8A93A6" stroke-width="1.6" fill="none"/>
      <path d="M50 100h28" stroke="#B8C2CE" stroke-width="1.5"/>
      <path d="M46 84l36 24M82 84l-36 24" stroke="#C0392E" stroke-width="2.4" stroke-linecap="round"/>
    </g>`
    : `<g transform="rotate(-6 64 92)">
      <rect x="40" y="76" width="48" height="32" rx="5" fill="url(#ftl-paper)" stroke="#8A93A6" stroke-width="1.5"/>
      <path d="M50 86q6-6 12 0q6 6 12 0" stroke="#8A93A6" stroke-width="1.6" fill="none"/>
      <path d="M50 96h28M50 102h18" stroke="#B8C2CE" stroke-width="1.5"/>
      <ellipse cx="64" cy="70" rx="13" ry="7" fill="#FFF" stroke="#B8C2CE" stroke-width="1.2"/>
      <ellipse cx="52" cy="76" rx="3" ry="1.8" fill="#FFF" stroke="#B8C2CE" stroke-width="1"/>
    </g>`;
  const proof = acc
    ? `<g class="hs8-noti" transform="rotate(5 176 92)">
      <rect x="152" y="76" width="48" height="32" rx="5" fill="url(#ftl-paper)" stroke="#8C5A16" stroke-width="1.8"/>
      <circle cx="166" cy="92" r="7" fill="none" stroke="#39455C" stroke-width="1.8"/>
      <path d="M171 97l6 6" stroke="#39455C" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M182 86h12M182 92h12M182 98h8" stroke="#C8A360" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="196" cy="76" r="6.6" fill="#8C5A16"/>
      <path d="M193 76l2.2 2.4 3.8-4.6" stroke="#FFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>`
    : `<g transform="rotate(5 176 92)">
      <rect x="152" y="76" width="48" height="32" rx="5" fill="url(#ftl-paper)" stroke="#8A93A6" stroke-width="1.5"/>
      <circle cx="166" cy="92" r="7" fill="none" stroke="#39455C" stroke-width="1.8"/>
      <path d="M171 97l6 6" stroke="#39455C" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M182 86h12M182 92h12M182 98h8" stroke="#B8C2CE" stroke-width="1.5" stroke-linecap="round"/>
    </g>`;
  return wrap(`
    ${bench(120, 40)}
    ${rumor}${proof}
    <text x="64" y="126" text-anchor="middle" font-size="8" font-weight="800" fill="#5A6478">"그 사람이래" 소문</text>
    <text x="176" y="126" text-anchor="middle" font-size="8" font-weight="800" fill="#5A6478">적법하게 수집한 증거</text>
    <text x="120" y="142" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${rej && acc ? "판결의 근거는 오직 증거!" : "판사의 책상 앞, 무엇으로 판단해야 할까요?"}</text>`);
}

// ④ 심급 제도 — 3계단(climb 0..2)
function appealSvg(climb: number): string {
  const man = climb === 0 ? stickman(58, 78, { mood: "sad", arm: "down", r: 5.6 }) : climb === 1 ? stickman(120, 56, { mood: "ok", arm: "up", r: 5.6 }) : stickman(178, 34, { mood: "joy", arm: "up", r: 5.6 });
  return wrap(`
    <rect x="28" y="104" width="70" height="32" rx="4" fill="url(#ftl-desk)" stroke="#6E4E26" stroke-width="1.5"/>
    <rect x="88" y="82" width="70" height="54" rx="4" fill="url(#ftl-desk)" stroke="#6E4E26" stroke-width="1.5" opacity="${climb >= 1 ? 1 : 0.45}"/>
    <rect x="148" y="60" width="70" height="76" rx="4" fill="url(#ftl-desk)" stroke="#6E4E26" stroke-width="1.5" opacity="${climb >= 2 ? 1 : 0.45}"/>
    <text x="63" y="124" text-anchor="middle" font-size="8.6" font-weight="900" fill="#FFF">1심</text>
    <text x="123" y="112" text-anchor="middle" font-size="8.6" font-weight="900" fill="#FFF" opacity="${climb >= 1 ? 1 : 0.6}">2심</text>
    <text x="183" y="92" text-anchor="middle" font-size="8.6" font-weight="900" fill="#FFF" opacity="${climb >= 2 ? 1 : 0.6}">대법원</text>
    ${climb >= 1 ? `<path d="M74 92q18-14 32-14" stroke="#8C5A16" stroke-width="2" stroke-dasharray="4 4" fill="none"/>` : ""}
    ${climb >= 2 ? `<path d="M134 70q18-14 32-14" stroke="#8C5A16" stroke-width="2" stroke-dasharray="4 4" fill="none"/>` : ""}
    ${man}
    <text x="120" y="148" text-anchor="middle" font-size="8.6" font-weight="700" fill="#7E8AA0">${climb >= 2 ? "세 번까지 저울질, 잘못된 판결을 바로잡을 기회" : climb === 1 ? "항소! 2심 법원이 다시 살펴봐요" : "1심 판결, 그런데 억울함이 남는다면?"}</text>`);
}

// 피날레 — 4기둥 위 수평 저울
function templeSvg(): string {
  const cols = [52, 100, 148, 196].map(
    (x, i) =>
      `<rect x="${x - 8}" y="72" width="16" height="46" rx="3" fill="url(#ftl-shield)" stroke="#5A3A0C" stroke-width="1.4"/>
      <text x="${x}" y="134" text-anchor="middle" font-size="7.2" font-weight="800" fill="#5A4420">${["사법권 독립", "공개 재판", "증거 재판", "심급 제도"][i]}</text>`,
  ).join("");
  return wrap(`
    <rect x="34" y="118" width="176" height="7" rx="3.5" fill="#8A6034"/>
    ${cols}
    <rect x="36" y="62" width="172" height="10" rx="4" fill="url(#ftl-gold)" stroke="#8A6034" stroke-width="1.4"/>
    <g class="hs8-noti">
      <path d="M120 54V30" stroke="#6E4610" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M78 32h84" stroke="#6E4610" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M120 26l3.4 5h-6.8z" fill="#8C5A16"/>
      <path d="M78 32v6M70 38h16m-16 0q0 6 8 6t8-6" fill="none" stroke="#6E4610" stroke-width="1.7"/>
      <path d="M162 32v6M154 38h16m-16 0q0 6 8 6t8-6" fill="none" stroke="#6E4610" stroke-width="1.7"/>
      <path d="M70 38q0 6 8 6t8-6z" fill="url(#ftl-gold)"/>
      <path d="M154 38q0 6 8 6t8-6z" fill="url(#ftl-gold)"/>
    </g>
    <path d="M30 20l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6zM210 16l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" fill="#F2C24E"/>`);
}

interface FtlPhase {
  id: string;
  fileLabel: string;
  stageName: string;
  intro: string;
  quiz?: { q: string; options: [string, string]; good: string; wrong: string };
}

const PHASES: FtlPhase[] = [
  {
    id: "indep",
    fileLabel: "장치 1",
    stageName: "사법권의 독립",
    intro: "스틱 시 법원에 이상 신호, 힘센 기관과 들끓는 여론이 <b>판사석을 흔들어요</b>. 이대로면 판결이 압력에 휘둘리고 말아요. 판사석 양옆에 <b>바람막이</b>를 세워요!",
    quiz: {
      q: "바람막이 안의 법관은 오직 무엇에 따라 심판해야 할까요?",
      options: ["헌법과 법률, 그리고 법관의 양심", "힘센 기관과 여론의 뜻"],
      good: "맞아요! 법관은 <b>헌법과 법률에 의하여 그 양심에 따라 독립</b>하여 심판해요. 법원의 독립과 법관의 신분 보장이 이 바람막이의 정체랍니다.",
      wrong: "그 뜻을 따르는 순간 재판은 저울이 아니라 바람개비가 돼요. 법관이 따를 것은 <b>헌법과 법률, 그리고 양심</b>뿐! 다시 골라 봐요.",
    },
  },
  {
    id: "open",
    fileLabel: "장치 2",
    stageName: "공개 재판주의",
    intro: "이번엔 법정에 <b>커튼</b>이 쳐졌어요. 안에서 무슨 일이 벌어지는지 아무도 볼 수 없죠. 몰래 하는 재판은 몰래 기울 수 있어요. 커튼을 활짝 걷어요!",
  },
  {
    id: "evid",
    fileLabel: "장치 3",
    stageName: "증거 재판주의",
    intro: "판사의 책상에 카드 두 장, \"그 사람이 그랬대\"라는 <b>소문</b>과, 적법하게 수집한 <b>증거</b>. 판결의 근거가 될 자격이 있는 쪽만 남겨요!",
    quiz: {
      q: "재판에서 사실을 인정하는 근거가 되어야 하는 것은 무엇일까요?",
      options: ["적법한 절차에 따라 수집한 증거", "많은 사람이 믿는 소문"],
      good: "정확해요! 아무리 널리 퍼진 이야기라도 소문은 소문, 재판은 <b>적법한 절차로 수집한 증거</b>로만 사실을 인정해요. 이게 증거 재판주의랍니다.",
      wrong: "믿는 사람이 많다고 사실이 되진 않아요. 소문으로 판결하면 억울한 사람이 생기죠. 재판의 근거는 <b>적법하게 수집한 증거</b>뿐! 다시 골라 봐요.",
    },
  },
  {
    id: "appeal",
    fileLabel: "장치 4",
    stageName: "심급 제도",
    intro: "장치를 다 갖춰도 사람인 법관은 <b>잘못된 판결</b>을 내릴 수 있어요. 그래서 마지막 장치, 급이 다른 법원에서 <b>여러 번 재판받을 기회</b>를 열어 둬요. 계단을 올라 봐요!",
    quiz: {
      q: "1심 판결에 불복해 2심 재판을 청구하는 것, 뭐라고 부를까요?",
      options: ["항소", "상고"],
      good: "맞아요! <b>1심 → 2심 청구가 항소</b>, <b>2심 → 대법원 청구가 상고</b>, 우리나라는 이렇게 세 번까지 재판받을 수 있는 3심제가 원칙이에요.",
      wrong: "상고는 <b>2심 판결에 불복해 대법원으로</b> 갈 때의 이름이에요. 1심에서 2심으로 가는 첫 계단은 항소랍니다. 다시 골라 봐요!",
    },
  },
];

// 기계 검산용 export(qa/audit-soc11-data.mjs — options[0]=정답 규약·4제도 순서 검사)
export const FAIRTRIAL_PHASES = PHASES;

export const fairTrialLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "steps" } }, el("b", { text: "네 장치" }), el("span", { text: "0 / 4" })),
    el("div", { class: "pn-badge world", dataset: { g: "quiz" } }, el("b", { text: "꼼꼼 판정" }), el("span", { text: "0 / 3" })),
    el("div", { class: "pn-badge world", dataset: { g: "final" } }, el("b", { text: "저울 완성" }), el("span", { text: "대기" })),
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
    chip.querySelector("span")!.textContent = `${stepsDone} / 4`;
    if (stepsDone >= 4 && !chip.classList.contains("on")) {
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
      fileTag.textContent = "저울 완성";
      refreshScene(templeSvg());
      lightChip("final", "완성!");
      helper.innerHTML =
        "네 장치 완성! <b>사법권의 독립 · 공개 재판주의 · 증거 재판주의 · 심급 제도</b>, 이 네 기둥이 받치고 있어야 재판의 저울이 기울지 않아요. 공정한 재판은 국민의 자유와 권리를 지키는 마지막 울타리랍니다!";
      api.recordQuiz(clean);
      api.enableCTA(s.cta ?? "제도 정리하러 가기");
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
    if (id === "indep") {
      refreshScene(indepSvg(false));
      const b = actBtn("바람막이 세우기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (b.disabled) return;
        haptic(HAPTIC.select);
        refreshScene(indepSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "압력 화살표가 힘을 잃었어요. 법원을 다른 기관에서 <b>독립</b>시키고 법관의 <b>신분을 보장</b>한 거예요. 그럼 이 안의 법관은 무엇을 따라야 할까요?";
        later(openQuiz, 900);
      });
    } else if (id === "open") {
      refreshScene(openCourtSvg(0));
      let n = 0;
      const b = actBtn("커튼 걷기 (0/2)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(openCourtSvg(n));
        b.textContent = `커튼 걷기 (${n}/2)`;
        helper.innerHTML =
          n === 1
            ? "커튼이 조금 열렸어요. 조금 더!"
            : "활짝! <b>방청석</b>에 시민들이 앉았어요. 누구나 재판 과정을 지켜볼 수 있으면 몰래 기울이는 판결이 설 자리를 잃죠. 이게 <b>공개 재판주의</b>예요.";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(advance, 1600);
        }
      });
    } else if (id === "evid") {
      refreshScene(evidenceSvg(false, false));
      const b1 = actBtn("소문 카드 기각하기");
      const b2 = actBtn("증거 카드 채택하기");
      controls.append(b1, b2);
      let rej = false;
      let acc = false;
      const done = (): void => {
        if (rej && acc) {
          helper.innerHTML = "책상 위에 남은 건 증거뿐, 그렇다면 판결의 근거가 될 자격, 어느 쪽에 있을까요?";
          later(openQuiz, 900);
        }
      };
      b1.addEventListener("click", () => {
        if (rej) return;
        rej = true;
        haptic(HAPTIC.select);
        refreshScene(evidenceSvg(rej, acc));
        b1.disabled = true;
        b1.classList.add("done");
        if (!acc) helper.innerHTML = "소문 카드 기각! \"~그랬대\"는 법정에서 힘을 잃어요.";
        done();
      });
      b2.addEventListener("click", () => {
        if (acc) return;
        acc = true;
        haptic(HAPTIC.select);
        refreshScene(evidenceSvg(rej, acc));
        b2.disabled = true;
        b2.classList.add("done");
        if (!rej) helper.innerHTML = "증거 카드 채택! 적법한 절차로 모은 증거만 법정에 남아요.";
        done();
      });
    } else {
      refreshScene(appealSvg(0));
      let n = 0;
      const b = actBtn("다시 재판 청구하기 (0/2)");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (n >= 2) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(appealSvg(n));
        b.textContent = n >= 2 ? "대법원 도착!" : `다시 재판 청구하기 (${n}/2)`;
        helper.innerHTML =
          n === 1
            ? "1심 판결에 불복, 한 계단 위 법원이 사건을 <b>다시</b> 살펴봐요. 아직 한 계단이 더 남았어요!"
            : "마지막 계단, 최고 법원인 <b>대법원</b>이에요. 이렇게 급을 달리하는 법원에서 세 번까지 재판받을 수 있는 게 <b>심급 제도(3심제)</b>! 그런데 방금 오른 첫 계단의 이름은?";
        if (n >= 2) {
          b.disabled = true;
          b.classList.add("done");
          later(openQuiz, 1000);
        }
      });
    }
  }

  mountPhase();
  api.setCTA("네 장치를 모두 갖춰요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
