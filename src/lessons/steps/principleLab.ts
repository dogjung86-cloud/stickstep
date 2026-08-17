// principleLab — 사회 Ⅸ L5 기함: 민주주의 기본 원리 4종 릴레이. 가상 "스틱 왕국"에 원리 장치를
// 하나씩 장착하며 "이 원리가 없다면?"(미래엔 175쪽 각 원리 박스의 Q — 반사실 구조)을 체험한다.
// kimchiLab 국면 릴레이 문법 계승 — 한 국면 = 한 원리 = 한 조작(주권 옮기기 탭 → 자치 두 갈래 체험 →
// 최고 규칙 세우기 탭 → 권력 블록 3분할 탭). 판정은 msn-quiz(options[0]=정답), 원리 '이름'은 정답
// 직후 배지로 명명 — 용어 선경험 원칙(concept가 뒤에서 정리). 피날레 = 네 기둥 + 이념 지붕 신전.
// 민감 가드: 왕·대표 전부 익명 스틱맨(현실 인물·정당 0), 왕정 장면은 명령 두루마리로만(폭력 0).
// rAF 없음 — CSS 트랜지션 + setTimeout 체인(타이머 Set 일괄 해제). CSS 접두 ppl-.
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

/* ── 장면 SVG — 스틱 왕국 무대(국면·상태별 재렌더) ── */

/** 시민 스틱맨 한 명(작은 왕관 옵션) */
function citizen(x: number, y: number, crowned: boolean, mood: "sad" | "ok" | "joy" = "ok"): string {
  const face =
    mood === "sad"
      ? `<circle cx="${x - 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 2} ${y + 3.6}q2-1.6 4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`
      : mood === "joy"
        ? `<path d="M${x - 3.2} ${y - 1.2}q1.3-1.5 2.6 0M${x + 0.6} ${y - 1.2}q1.3-1.5 2.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/><path d="M${x - 2.4} ${y + 2.6}q2.4 2.2 4.8 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`
        : `<circle cx="${x - 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2.1}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 1.8} ${y + 3}q1.8 1.3 3.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`;
  const crown = crowned
    ? `<path d="M${x - 4.6} ${y - 8.6} l1.5 2.8 3.1-2.2 3.1 2.2 1.5-2.8 v3.4 h-9.2z" fill="#F2C24E" stroke="#B8860E" stroke-width="1" stroke-linejoin="round"/>`
    : "";
  return `<g ${STICK}>
    <circle cx="${x}" cy="${y}" r="6.4" fill="#F6EFE4"/>
    <path d="M${x} ${y + 6}v13M${x} ${y + 19}l-5 9M${x} ${y + 19}l5 9M${x} ${y + 10}l-7 5M${x} ${y + 10}l7 5"/>
  </g>${face}${crown}`;
}

/** 명령 두루마리(왕정의 소품) */
function scroll(x: number, y: number, rot = 0): string {
  return `<g transform="rotate(${rot} ${x} ${y})">
    <rect x="${x - 8}" y="${y - 5}" width="16" height="10" rx="2" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="1.2"/>
    <path d="M${x - 4.6} ${y - 1.6}h9.2M${x - 4.6} ${y + 1.6}h6" stroke="#B99B66" stroke-width="1.1" stroke-linecap="round"/>
  </g>`;
}

const DEFS = `<defs>
  <linearGradient id="ppl-dais" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2D2A8"/><stop offset="1" stop-color="#C2AC7C"/></linearGradient>
  <linearGradient id="ppl-book" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EB2E2"/><stop offset=".55" stop-color="#4A86C8"/><stop offset="1" stop-color="#2A6AAE"/></linearGradient>
  <linearGradient id="ppl-col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EFE3C4"/><stop offset=".5" stop-color="#E2D2A8"/><stop offset="1" stop-color="#C8B482"/></linearGradient>
  <linearGradient id="ppl-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5EBD2"/><stop offset="1" stop-color="#DCC998"/></linearGradient>
</defs>`;

function wrap(inner: string): string {
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${DEFS}
    <ellipse cx="120" cy="142" rx="100" ry="5" fill="#2A3A5E" opacity=".1"/>${inner}</svg>`;
}

// ① 국민 주권: 큰 왕관의 왕 vs 주권이 국민에게 온 뒤
function sovereignSvg(moved: boolean): string {
  if (!moved) {
    return wrap(`
      <rect x="92" y="52" width="56" height="16" rx="4" fill="url(#ppl-dais)" stroke="#8A7648" stroke-width="1.5"/>
      <rect x="102" y="68" width="36" height="10" rx="3" fill="url(#ppl-dais)" stroke="#8A7648" stroke-width="1.3"/>
      ${citizen(120, 34, false, "ok")}
      <path d="M112 22 l2.6 5 5.4-4 5.4 4 2.6-5 v7 h-16z" fill="#F2C24E" stroke="#B8860E" stroke-width="1.3" stroke-linejoin="round"/>
      ${scroll(96, 40, -18)}${scroll(146, 42, 14)}
      ${citizen(48, 104, false, "sad")}${citizen(88, 108, false, "sad")}${citizen(152, 108, false, "sad")}${citizen(192, 104, false, "sad")}
    `);
  }
  return wrap(`
    <rect x="92" y="120" width="56" height="10" rx="4" fill="url(#ppl-dais)" stroke="#8A7648" stroke-width="1.4" opacity=".7"/>
    ${citizen(48, 74, true, "joy")}${citizen(96, 70, true, "joy")}${citizen(144, 70, true, "joy")}${citizen(192, 74, true, "joy")}
    <path d="M104 30l3 6.4 7-1-4.6 5.4 3.4 6-6.6-2.6-5 4.8.6-7.2-6.2-3.4 6.8-2z" fill="#F2C24E" opacity=".9"/>
    <path d="M58 40l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6zM180 36l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" fill="#F2C24E"/>
  `);
}

// ② 국민 자치: 직접(광장 원형) / 간접(투표→대표)
function selfruleSvg(mode: "none" | "direct" | "rep"): string {
  if (mode === "direct") {
    return wrap(`
      <circle cx="120" cy="84" r="46" fill="none" stroke="#C8B482" stroke-width="1.6" stroke-dasharray="6 6"/>
      ${citizen(120, 34, true, "joy")}${citizen(70, 62, true, "ok")}${citizen(170, 62, true, "ok")}
      ${citizen(70, 112, true, "ok")}${citizen(170, 112, true, "ok")}${citizen(120, 122, true, "joy")}
      <path d="M112 76h16M120 68v16" stroke="#1864AB" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
    `);
  }
  if (mode === "rep") {
    return wrap(`
      <rect x="150" y="56" width="52" height="14" rx="4" fill="url(#ppl-dais)" stroke="#8A7648" stroke-width="1.5"/>
      ${citizen(176, 38, false, "joy")}
      <rect x="168" y="46" width="16" height="4" rx="2" fill="#1864AB"/>
      <rect x="34" y="86" width="34" height="22" rx="4" fill="url(#ppl-book)" stroke="#0F4676" stroke-width="1.5"/>
      <rect x="44" y="83" width="14" height="3.6" rx="1.8" fill="#0F4676"/>
      <g transform="rotate(-12 51 76)"><rect x="45" y="70" width="10" height="12" rx="1.4" fill="#FFFFFF" stroke="#1864AB" stroke-width="1.2"/><circle cx="50" cy="76" r="2" fill="none" stroke="#1864AB" stroke-width="1.1"/></g>
      ${citizen(48, 126, true, "ok")}${citizen(88, 128, true, "ok")}${citizen(128, 128, true, "ok")}
      <path d="M96 108 Q130 84 160 72" stroke="#1864AB" stroke-width="2" fill="none" stroke-dasharray="5 5" marker-end="none"/>
      <path d="M156 70l6 1-3.6 5z" fill="#1864AB"/>
      <path d="M60 118q-3-2-3-5.4 0-3 2.6-3 1.6 0 2.4 1.6.8-1.6 2.4-1.6 2.6 0 2.6 3 0 3.4-3 5.4l-2 1.4z" fill="#E8746A" opacity=".85"/>
    `);
  }
  return wrap(`
    ${citizen(48, 64, true, "ok")}${citizen(96, 60, true, "ok")}${citizen(144, 60, true, "ok")}${citizen(192, 64, true, "ok")}
    <text x="120" y="118" text-anchor="middle" font-size="11" font-weight="800" fill="#7E8AA0">주인이 된 국민, 나라는 누가 다스리죠?</text>
  `);
}

// ③ 입헌주의: 폭주하는 대표 vs 최고 규칙 아래
function constitutionSvg(ruled: boolean): string {
  if (!ruled) {
    return wrap(`
      <rect x="96" y="58" width="48" height="14" rx="4" fill="url(#ppl-dais)" stroke="#8A7648" stroke-width="1.5" transform="rotate(-3 120 65)"/>
      ${citizen(120, 40, false, "ok")}
      <rect x="112" y="48" width="16" height="4" rx="2" fill="#1864AB"/>
      ${scroll(84, 52, -22)}${scroll(158, 50, 18)}${scroll(96, 30, -8)}${scroll(146, 28, 10)}
      ${citizen(52, 112, true, "sad")}${citizen(120, 118, true, "sad")}${citizen(188, 112, true, "sad")}
      <path d="M70 84l6-8M176 82l-6-8" stroke="#C0392E" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>
    `);
  }
  return wrap(`
    <g class="ppl-bookdrop">
      <rect x="86" y="16" width="68" height="26" rx="6" fill="url(#ppl-book)" stroke="#0F4676" stroke-width="1.8"/>
      <path d="M120 20v18M96 24h14M96 30h12M130 24h14M130 30h12" stroke="#EAF2FB" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="98" cy="20.5" rx="6" ry="1.8" fill="#fff" opacity=".4"/>
    </g>
    <rect x="96" y="66" width="48" height="12" rx="4" fill="url(#ppl-dais)" stroke="#8A7648" stroke-width="1.5"/>
    ${citizen(120, 50, false, "ok")}
    <rect x="112" y="58" width="16" height="4" rx="2" fill="#1864AB"/>
    ${scroll(120, 88, 0)}
    ${citizen(52, 112, true, "joy")}${citizen(188, 112, true, "joy")}
    <path d="M84 34l-8 2M156 34l8 2" stroke="#4A86C8" stroke-width="1.8" stroke-linecap="round"/>
  `);
}

// ④ 권력 분립: 한 손의 세 블록 → 세 기둥 + 견제 화살표
function separateSvg(split: number): string {
  const blocks = [
    { x: 48, label: "법 만들기", on: split >= 1 },
    { x: 120, label: "법 집행하기", on: split >= 2 },
    { x: 192, label: "법 적용·재판", on: split >= 3 },
  ];
  if (split === 0) {
    return wrap(`
      ${citizen(120, 36, false, "ok")}
      <rect x="112" y="44" width="16" height="4" rx="2" fill="#1864AB"/>
      <g>
        <rect x="84" y="66" width="72" height="16" rx="4" fill="#EDE0C8" stroke="#8A7648" stroke-width="1.5"/>
        <rect x="84" y="86" width="72" height="16" rx="4" fill="#EDE0C8" stroke="#8A7648" stroke-width="1.5"/>
        <rect x="84" y="106" width="72" height="16" rx="4" fill="#EDE0C8" stroke="#8A7648" stroke-width="1.5"/>
        <path d="M120 66v56" stroke="#8A7648" stroke-width="1.2" opacity=".4"/>
      </g>
      <text x="120" y="140" text-anchor="middle" font-size="10.4" font-weight="800" fill="#C0392E">세 가지 힘이 전부 한곳에!</text>
    `);
  }
  const cols = blocks
    .map((b) =>
      b.on
        ? `<g class="ppl-colup">
            <rect x="${b.x - 22}" y="64" width="44" height="52" rx="5" fill="url(#ppl-col)" stroke="#8A7648" stroke-width="1.5"/>
            <path d="M${b.x - 14} 70v40M${b.x} 70v40M${b.x + 14} 70v40" stroke="#B8A472" stroke-width="1" opacity=".6"/>
            <rect x="${b.x - 24}" y="116" width="48" height="8" rx="3" fill="url(#ppl-dais)" stroke="#8A7648" stroke-width="1.3"/>
            <rect x="${b.x - 22}" y="52" width="44" height="12" rx="6" fill="#1864AB"/>
            <text x="${b.x}" y="60.6" text-anchor="middle" font-size="7.8" font-weight="800" fill="#FFFFFF">${b.label}</text>
          </g>`
        : `<rect x="${b.x - 22}" y="96" width="44" height="20" rx="4" fill="#EDE0C8" stroke="#8A7648" stroke-width="1.4" opacity=".5"/>`,
    )
    .join("");
  const arrows =
    split >= 3
      ? `<g stroke="#C0871C" stroke-width="1.8" fill="none" opacity=".9">
          <path d="M74 84q22-14 44-2"/><path d="M114 80l6 2-4 5z" fill="#C0871C" stroke="none"/>
          <path d="M146 84q22-14 44-2"/><path d="M186 80l6 2-4 5z" fill="#C0871C" stroke="none"/>
          <path d="M182 128q-62 14-124 0"/><path d="M62 130l-6-3 5-4z" fill="#C0871C" stroke="none"/>
        </g>`
      : "";
  return wrap(`${cols}${arrows}`);
}

// 피날레: 네 기둥 + 이념 지붕 신전
function templeSvg(): string {
  const cols = [40, 94, 148, 202].map(
    (x, i) => `<g>
      <rect x="${x - 16}" y="72" width="32" height="52" rx="4" fill="url(#ppl-col)" stroke="#8A7648" stroke-width="1.5"/>
      <path d="M${x - 8} 78v40M${x} 78v40M${x + 8} 78v40" stroke="#B8A472" stroke-width="1" opacity=".6"/>
      <rect x="${x - 17}" y="60" width="34" height="11" rx="5.5" fill="#1864AB"/>
      <text x="${x}" y="68" text-anchor="middle" font-size="6.8" font-weight="800" fill="#FFFFFF">${["국민 주권", "국민 자치", "입헌주의", "권력 분립"][i]}</text>
    </g>`,
  ).join("");
  return wrap(`
    <path d="M18 46 L120 10 L222 46 v8 H18z" fill="url(#ppl-roof)" stroke="#8A7648" stroke-width="1.8" stroke-linejoin="round"/>
    <text x="120" y="42" text-anchor="middle" font-size="9.6" font-weight="800" fill="#6E5A28">인간의 존엄성 · 자유 · 평등</text>
    ${cols}
    <rect x="14" y="124" width="212" height="10" rx="4" fill="url(#ppl-dais)" stroke="#8A7648" stroke-width="1.4"/>
    <path d="M120 0l1.8 4 4 1.8-4 1.8-1.8 4-1.8-4-4-1.8 4-1.8z" fill="#F2C24E"/>
  `);
}

interface Phase {
  id: string;
  fileLabel: string;
  prop: string; // 명명될 원리
  intro: string;
  q: string;
  options: [string, string];
  good: string;
  wrong: string;
}

const PHASES: Phase[] = [
  {
    id: "sovereign",
    fileLabel: "첫 번째 장치",
    prop: "국민 주권",
    intro: "스틱 왕국, 큰 왕관을 쓴 한 사람이 명령 두루마리로 모든 것을 정하고 있어요. 아래 <b>주권 옮기기</b> 버튼으로 나라의 주인을 바꿔 봐요.",
    q: "나라의 뜻을 정하는 최고의 힘은 누구에게 있어야 할까요?",
    options: ["국민 모두에게", "가장 힘센 한 사람에게"],
    good: "맞아요! 국가의 의사를 결정하는 최고 권력, <b>주권이 국민에게</b> 있다는 원리, <b>국민 주권</b>이에요. 모든 국가 권력은 국민의 동의와 지지를 바탕으로 해야 하죠.",
    wrong: "한 사람이 최고의 힘을 쥐면 그 힘이 국민의 자유와 권리를 억누를 때 막을 방법이 없어요. 방금 시무룩하던 시민들처럼요. 다시 골라 봐요!",
  },
  {
    id: "selfrule",
    fileLabel: "두 번째 장치",
    prop: "국민 자치",
    intro: "주인이 된 국민, 그럼 나랏일은 누가 다스리죠? <b>두 가지 방법을 모두</b> 눌러 체험해 봐요.",
    q: "방금 체험한 두 방법(직접 정하기 · 대표 뽑아 맡기기)의 공통점은 무엇일까요?",
    options: ["주권을 가진 국민이 스스로 나라를 다스린다", "누군가 국민 대신 마음대로 정해 준다"],
    good: "정확해요! 모두 모여 직접 정하든(직접 민주주의), 대표를 뽑아 맡기든(간접 민주주의), <b>주권을 가진 국민이 스스로 다스린다</b>는 원리, <b>국민 자치</b>예요.",
    wrong: "대표를 뽑는 쪽도 '마음대로'가 아니에요. 국민이 뽑고, 국민이 지켜보죠. 두 방법 다 다스리는 힘의 뿌리는 국민이랍니다. 다시 골라 봐요!",
  },
  {
    id: "constitution",
    fileLabel: "세 번째 장치",
    prop: "입헌주의",
    intro: "그런데 뽑힌 대표가 명령 두루마리를 마구 뿌리기 시작했어요! <b>최고 규칙 세우기</b> 버튼으로 대표보다 높은 규칙을 올려 봐요.",
    q: "나라의 가장 높은 자리에 올린 이 '최고 규칙'이 하는 일은 무엇일까요?",
    options: ["국가기관을 구성하고 권력을 행사하는 기준이 된다", "대표가 더 마음대로 하도록 도와준다"],
    good: "그거예요! 이 최고 규칙의 이름이 <b>헌법</b>, 헌법에 따라 국가기관을 만들고 권력을 행사해야 한다는 원리가 <b>입헌주의</b>예요. 권력의 남용을 막는 울타리죠.",
    wrong: "방향이 반대예요. 최고 규칙은 대표 '위'에 있어요. 대표의 힘이 규칙 아래에 놓이는 순간, 마음대로 뿌리던 두루마리가 멈췄죠. 다시 골라 봐요!",
  },
  {
    id: "separate",
    fileLabel: "네 번째 장치",
    prop: "권력 분립",
    intro: "마지막 위험, 법을 만들고, 집행하고, 재판하는 힘이 전부 한곳에 쌓여 있어요! <b>일 나누기</b>를 세 번 눌러 힘을 나눠 봐요.",
    q: "국가의 힘을 서로 다른 기관이 나누어 맡게 하는 까닭은 무엇일까요?",
    options: ["서로 견제하며 균형을 이루어 권력의 남용을 막으려고", "일을 세 배 빠르게 끝내려고"],
    good: "정확해요! 법을 만드는 <b>입법부</b>, 집행하는 <b>행정부</b>, 적용·재판하는 <b>사법부</b>가 서로 <b>견제와 균형</b>을 이루게 하는 원리, <b>권력 분립</b>이에요. 한곳에 모인 힘은 남용되기 쉬우니까요.",
    wrong: "속도의 문제가 아니에요. 오히려 서로 확인하느라 느려질 수도 있죠. 그래도 나누는 까닭은 한곳에 모인 힘이 국민의 자유와 권리를 침해하기 쉽기 때문이랍니다. 다시 골라 봐요!",
  },
];

const FINALE_Q = "네 가지 장치가 함께 지키려는 것은 결국 무엇일까요?";
const FINALE_OPTS: [string, string] = [
  "인간의 존엄성과 국민의 자유·평등",
  "나라가 결정을 빨리 내리는 속도",
];

// 기계 검산용 export(qa/audit-soc9-data.mjs — options[0]=정답 규약 검사)
export const PRINCIPLE_PHASES = PHASES;
export const PRINCIPLE_FINALE = { q: FINALE_Q, options: FINALE_OPTS };

export const principleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "gears" } }, el("b", { text: "네 장치" }), el("span", { text: "0 / 4" })),
    el("div", { class: "pn-badge world", dataset: { g: "twoway" } }, el("b", { text: "두 갈래 자치" }), el("span", { text: "0 / 2" })),
    el("div", { class: "pn-badge world", dataset: { g: "roof" } }, el("b", { text: "설계도 완성" }), el("span", { text: "대기" })),
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
  const setChip = (g: string, sub?: string): void => {
    const chip = goalChips.querySelector(`[data-g="${g}"]`) as HTMLElement;
    if (!chip) return;
    if (sub) chip.querySelector("span")!.textContent = sub;
    if (!chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  };
  const gearCount = (n: number): void => {
    const chip = goalChips.querySelector('[data-g="gears"]') as HTMLElement;
    chip.querySelector("span")!.textContent = `${n} / 4`;
    if (n >= 4 && !chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  };

  let phase = 0; // 0..3 국면, 4 = 피날레
  let clean = true;
  let quizOpen = false;
  let phaseReady = false;
  let finaleMode = false;

  function refreshScene(html: string): void {
    sceneBox.classList.remove("in");
    void sceneBox.offsetWidth;
    sceneBox.classList.add("in");
    sceneBox.innerHTML = html;
  }

  function openQuiz(): void {
    const q = finaleMode ? FINALE_Q : PHASES[phase].q;
    const opts = finaleMode ? FINALE_OPTS : PHASES[phase].options;
    quizOpen = true;
    quizQ.innerHTML = q;
    optBtns.forEach((b, i) => {
      b.classList.remove("ok", "no", "dim");
      b.innerHTML = opts[i];
    });
    quizCard.classList.add("show");
    later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function toNext(): void {
    quizOpen = false;
    quizCard.classList.remove("show");
    if (finaleMode) return;
    const done = phase + 1;
    gearCount(done);
    badges.appendChild(el("span", { class: "ppl-prop", text: PHASES[phase].prop }));
    if (done >= PHASES.length) {
      // 피날레 — 신전 완성
      finaleMode = true;
      fileTag.textContent = "설계도 완성";
      refreshScene(templeSvg());
      helper.innerHTML =
        "네 기둥이 전부 섰어요. 그 위에 지붕이 얹혔네요. 이 신전이 지키려는 것이 무엇인지, 마지막 판정이에요!";
      setChip("roof", "판정 중");
      later(openQuiz, 900);
      return;
    }
    phase = done;
    phaseReady = false;
    fileTag.textContent = PHASES[phase].fileLabel;
    helper.innerHTML = PHASES[phase].intro;
    mountPhase();
  }

  optBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (!quizOpen) return;
      if (i === 0) {
        haptic(HAPTIC.correct);
        btn.classList.add("ok");
        optBtns[1].classList.add("dim");
        if (finaleMode) {
          quizOpen = false;
          setChip("roof", "완성!");
          helper.innerHTML =
            "완성! 국민 주권·국민 자치·입헌주의·권력 분립, 네 기둥이 받치는 지붕이 <b>인간의 존엄성·자유·평등</b>이에요. 원리는 이념을 지키는 장치랍니다!";
          api.recordQuiz(clean);
          api.enableCTA(s.cta ?? "설계도 정리하기");
          return;
        }
        helper.innerHTML = PHASES[phase].good;
        quizOpen = false;
        later(toNext, 1600);
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        btn.classList.add("no");
        helper.innerHTML = finaleMode
          ? "속도라면 오히려 한 사람이 다 정하는 쪽이 빠르겠죠. 그런데도 넷으로 나눠 지킨 것은 사람이에요. 다시 골라 봐요!"
          : PHASES[phase].wrong;
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  function actBtn(label: string): HTMLButtonElement {
    return el("button", { class: "btn ppl-act", attrs: { type: "button" }, text: label }) as HTMLButtonElement;
  }

  function mountPhase(): void {
    controls.innerHTML = "";
    if (PHASES[phase].id === "sovereign") {
      refreshScene(sovereignSvg(false));
      const b = actBtn("주권 옮기기, 나라의 주인은 국민!");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (phaseReady) return;
        phaseReady = true;
        haptic(HAPTIC.select);
        refreshScene(sovereignSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "큰 왕관이 사라지고, 시민들 머리 위에 <b>작은 왕관이 하나씩</b>! 모두가 주인이 된 나라예요. 아래에서 뜻을 골라 봐요.";
        later(openQuiz, 800);
      });
    } else if (PHASES[phase].id === "selfrule") {
      refreshScene(selfruleSvg("none"));
      const b1 = actBtn("모두 모여 직접 정하기");
      const b2 = actBtn("대표를 뽑아 맡기기");
      controls.append(b1, b2);
      const tried = new Set<string>();
      const tryMode = (mode: "direct" | "rep", btn: HTMLButtonElement, msg: string): void => {
        if (tried.has(mode)) return;
        tried.add(mode);
        haptic(HAPTIC.select);
        refreshScene(selfruleSvg(mode));
        btn.classList.add("done");
        btn.disabled = true;
        helper.innerHTML = msg;
        // 진행 중엔 서브텍스트만 — 칩 점등(on)은 두 갈래를 모두 걸은 뒤에만
        const chip = goalChips.querySelector('[data-g="twoway"]') as HTMLElement;
        chip.querySelector("span")!.textContent = `${tried.size} / 2`;
        if (tried.size >= 2) {
          phaseReady = true;
          setChip("twoway", "둘 다 체험!");
          later(openQuiz, 900);
        }
      };
      b1.addEventListener("click", () =>
        tryMode("direct", b1, "광장에 모두 모여 <b>직접</b> 정했어요. 아주 먼 옛날 아테네가 이 방식이었죠. 이제 다른 방법도 눌러 봐요!"),
      );
      b2.addEventListener("click", () =>
        tryMode("rep", b2, "투표로 <b>대표를 뽑아</b> 나랏일을 맡겼어요. 국민은 대표를 지켜보고 있고요. 오늘날 대부분 나라의 방식이에요!"),
      );
    } else if (PHASES[phase].id === "constitution") {
      refreshScene(constitutionSvg(false));
      const b = actBtn("최고 규칙 세우기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (phaseReady) return;
        phaseReady = true;
        haptic(HAPTIC.select);
        refreshScene(constitutionSvg(true));
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML = "가장 높은 자리에 <b>파란 큰 책</b>이 올라갔어요. 대표도 그 아래! 마구 날리던 두루마리가 멈췄네요. 이 책의 정체를 골라 봐요.";
        later(openQuiz, 800);
      });
    } else {
      refreshScene(separateSvg(0));
      let n = 0;
      const b = actBtn("일 나누기 (0/3)");
      controls.appendChild(b);
      const msgs = [
        "첫 번째 기둥, <b>법을 만드는 일</b>이 독립했어요!",
        "두 번째 기둥, <b>법을 집행하는 일</b>이 독립했어요!",
        "세 번째 기둥, <b>법을 적용해 재판하는 일</b>까지! 세 기둥 사이에 서로 지켜보는 화살표가 생겼어요.",
      ];
      b.addEventListener("click", () => {
        if (phaseReady) return;
        n += 1;
        haptic(HAPTIC.select);
        refreshScene(separateSvg(n));
        b.textContent = `일 나누기 (${Math.min(3, n)}/3)`;
        helper.innerHTML = msgs[Math.min(2, n - 1)];
        if (n >= 3) {
          phaseReady = true;
          b.disabled = true;
          b.classList.add("done");
          later(openQuiz, 900);
        }
      });
    }
  }

  mountPhase();
  api.setCTA("네 가지 장치를 모두 달아요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
