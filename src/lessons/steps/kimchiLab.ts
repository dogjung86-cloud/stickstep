// kimchiLab — 사회 Ⅷ L3 기함: 김치 한 포기로 문화의 속성 5(공유성·학습성·축적성·변동성·전체성)를
// 국면 릴레이로 발견하는 랩. "기함에 다 담기 금지" 원칙과의 정합: 다섯 속성을 한 화면에 겹치지 않고
// **한 국면 = 한 속성 = 한 조작**(맛보기 탭 → 김장 3연타 → 세대 층 쌓기 → 시간 슬라이더 → 연쇄 점등)
// 으로 차례로 지나가는 서사형이다(수학 Ⅵ 통계 노선). 판정은 msn-quiz 문법(options[0]=정답 고정),
// 속성 '이름'은 정답 직후 배지로 명명 — 용어 선경험 원칙(concept가 뒤에서 정리).
// 변동성 국면의 역사 사실: 고추는 임진왜란 무렵 전해진 외래 작물 — 그 전 김치는 하얀 절임이었다
// (다른 문화와의 접촉에 의한 변동). 축적성(미래엔 김치 사례)과의 혼동 방지: 축적성 국면은
// "전해지고 쌓인다"(세대 축), 변동성 국면은 "달라진다"(시간 축 모습 변화)로 프레임을 분리한다.
// rAF 없음 — CSS 트랜지션 + setTimeout 체인(수학 랩 문법, 타이머는 Set으로 모아 cleanup 일괄 해제).
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

/* ── 장면 SVG 5종(파운드리 문법 — 스틱맨만 손그림 라인) ── */

// ① 공유성: 김치찌개 한 냄비, 두 스틱맨 — 맛본 뒤 반응이 갈린다
function shareSvg(stage: 0 | 1): string {
  const koFace = stage === 0
    ? `<circle cx="61.6" cy="63" r="1.1" fill="#3C4654"/><circle cx="66.4" cy="63" r="1.1" fill="#3C4654"/><path d="M62 67q2 1.4 4 0" stroke="#3C4654" stroke-width="1.4" fill="none"/>`
    : `<path d="M60.4 62.6q1.4-1.6 2.8 0M65 62.6q1.4-1.6 2.8 0" stroke="#3C4654" stroke-width="1.4" fill="none"/><path d="M61 66.5q3 2.6 6 0" stroke="#3C4654" stroke-width="1.5" fill="none"/>`;
  const frFace = stage === 0
    ? `<circle cx="173.6" cy="63" r="1.1" fill="#3C4654"/><circle cx="178.4" cy="63" r="1.1" fill="#3C4654"/><path d="M174 67q2 1.4 4 0" stroke="#3C4654" stroke-width="1.4" fill="none"/>`
    : `<circle cx="173.6" cy="63" r="1.5" fill="#3C4654"/><circle cx="178.4" cy="63" r="1.5" fill="#3C4654"/><ellipse cx="176" cy="68" rx="1.8" ry="2.4" fill="none" stroke="#3C4654" stroke-width="1.4"/><path d="M183 56l3-3M184 59l4-1" stroke="#8A93A6" stroke-width="1.4"/>`;
  const steam = stage === 1
    ? `<g stroke="#E8944E" stroke-width="2" fill="none" opacity=".85"><path d="M112 34c-3-5 3-7 0-12"/><path d="M122 36c-3-5 3-7 0-13"/><path d="M132 34c-3-5 3-7 0-12"/></g>`
    : `<g stroke="#E8944E" stroke-width="2" fill="none" opacity=".5"><path d="M117 36c-2-4 2-6 0-9"/><path d="M127 36c-2-4 2-6 0-9"/></g>`;
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="kcl-pot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E4038"/><stop offset=".5" stop-color="#38302B"/><stop offset="1" stop-color="#241F1C"/></linearGradient>
      <linearGradient id="kcl-stew" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8543E"/><stop offset="1" stop-color="#B83224"/></linearGradient>
      <linearGradient id="kcl-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A76C"/><stop offset="1" stop-color="#A87838"/></linearGradient>
    </defs>
    <rect x="24" y="106" width="192" height="12" rx="6" fill="url(#kcl-table)" stroke="#7A4E1E" stroke-width="1.4"/>
    <ellipse cx="120" cy="118" rx="70" ry="5" fill="#2A3A5E" opacity=".1"/>
    ${steam}
    <path d="M92 52h56l-5 46q-1 8-9 8h-28q-8 0-9-8z" fill="url(#kcl-pot)" stroke="#17130F" stroke-width="1.6"/>
    <ellipse cx="120" cy="52" rx="28" ry="7" fill="url(#kcl-stew)" stroke="#8E2318" stroke-width="1.4"/>
    <path d="M100 50q6-3 12-1M126 49q7-2 12 1" stroke="#F2937E" stroke-width="1.6" opacity=".8"/>
    <path d="M84 54q-6 2-6 7M156 54q6 2 6 7" stroke="#17130F" stroke-width="3" stroke-linecap="round"/>
    <path d="M98 62q-3 5-2 10" stroke="#fff" stroke-width="1.8" opacity=".35"/>
    <g ${STICK}>
      <circle cx="64" cy="63" r="8" fill="#F6EFE4"/>
      <path d="M64 71v20M64 91l-6 13M64 91l6 13M64 78l-11 6M64 78l12-8"/>
    </g>
    <path d="M76 68l14-8" stroke="#8A6A3E" stroke-width="1.8"/><ellipse cx="91" cy="59" rx="3.4" ry="1.6" fill="#EDE0C8" stroke="#8A6A3E" stroke-width="1.1"/>
    ${koFace}
    <g ${STICK}>
      <circle cx="176" cy="63" r="8" fill="#F6EFE4"/>
      <path d="M176 71v20M176 91l-6 13M176 91l6 13M176 78l11 6M176 78l-12-8"/>
    </g>
    <path d="M164 68l-14-8" stroke="#8A6A3E" stroke-width="1.8"/><ellipse cx="149" cy="59" rx="3.4" ry="1.6" fill="#EDE0C8" stroke="#8A6A3E" stroke-width="1.1"/>
    ${frFace}
  </svg>`;
}

// ② 학습성: 김장 돗자리 — 탭마다 아이가 배추 절이기→속 만들기→바르기를 배워 간다
function learnSvg(step: 0 | 1 | 2 | 3): string {
  const done = (i: number): string => (step > i ? "" : `opacity=".28"`);
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="kcl-mat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EADFC8"/><stop offset="1" stop-color="#D2C0A0"/></linearGradient>
      <radialGradient id="kcl-bowlR" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#F27E64"/><stop offset="1" stop-color="#C23A28"/></radialGradient>
      <linearGradient id="kcl-cabb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDEBB8"/><stop offset="1" stop-color="#AECB78"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="120" rx="96" ry="16" fill="url(#kcl-mat)" stroke="#B8A278" stroke-width="1.4"/>
    <g ${done(0)}>
      <path d="M56 108q-3-12 8-14 2-6 10-5 6-8 14-2 4 4 2 10 3 8-6 11z" fill="url(#kcl-cabb)" stroke="#7A9646" stroke-width="1.5"/>
      <path d="M66 96q4 6 3 12M76 92q2 8 0 15" stroke="#8FAE58" stroke-width="1.3" fill="none"/>
      <path d="M58 90l4 3M88 88l-4 3M73 82v4" stroke="#9EB8D8" stroke-width="1.4" opacity=".9"/>
    </g>
    <g ${done(1)}>
      <ellipse cx="120" cy="106" rx="18" ry="9" fill="url(#kcl-bowlR)" stroke="#8E2318" stroke-width="1.5"/>
      <ellipse cx="120" cy="103" rx="14" ry="5.4" fill="#E8543E"/>
      <path d="M112 102q4-2.6 8-1M120 104q4-1.6 7 0" stroke="#F6B09E" stroke-width="1.4" fill="none"/>
    </g>
    <g ${done(2)}>
      <path d="M158 100q-2-8 6-9 2-4 8-3 5-5 10 0 3 3 1 7 3 6-5 8z" fill="url(#kcl-cabb)" stroke="#7A9646" stroke-width="1.4"/>
      <path d="M162 96q8 4 18 2M164 101q8 3 16 0" stroke="#D14A32" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <g ${STICK}>
      <circle cx="104" cy="52" r="8" fill="#F6EFE4"/>
      <path d="M104 60v18M104 78l-7 12M104 78l7 12M104 66l-12 9M104 66l14 6"/>
    </g>
    <circle cx="101.6" cy="51" r="1.1" fill="#3C4654"/><circle cx="106.4" cy="51" r="1.1" fill="#3C4654"/>
    <path d="M102 55q2 1.4 4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>
    <g ${STICK}>
      <circle cx="140" cy="60" r="6.4" fill="#F6EFE4"/>
      <path d="M140 66v14M140 80l-5 10M140 80l5 10M140 71l-9 5M140 71l10 4"/>
    </g>
    <circle cx="138" cy="59" r="1" fill="#3C4654"/><circle cx="142" cy="59" r="1" fill="#3C4654"/>
    <path d="M138.4 62.6q1.6 1.2 3.2 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>
    ${step > 0 ? `<path d="M126 44q6-6 12 0" stroke="#E8944E" stroke-width="1.6" fill="none" opacity=".9"/>` : ""}
  </svg>`;
}

// ③ 축적성: 레시피 공책 — 세대를 넘길 때마다 지혜의 층이 쌓인다
function stackSvg(layers: number): string {
  const L = [
    { y: 96, c: "#EDE0C8", s: "#B8A278", t: "절임 채소" },
    { y: 78, c: "#F2B09E", s: "#C2664E", t: "고춧가루" },
    { y: 60, c: "#E8C87E", s: "#B8923E", t: "젓갈 감칠맛" },
    { y: 42, c: "#DDEBB8", s: "#8FAE58", t: "오늘의 김치" },
  ];
  const rows = L.slice(0, layers)
    .map(
      (r, i) => `<g class="kcl-layer" style="--d:${i}">
      <rect x="76" y="${r.y}" width="88" height="16" rx="5" fill="${r.c}" stroke="${r.s}" stroke-width="1.4"/>
      <circle cx="86" cy="${r.y + 8}" r="2.6" fill="${r.s}"/>
      <path d="M94 ${r.y + 8}h58" stroke="${r.s}" stroke-width="2" stroke-linecap="round" opacity=".55"/>
    </g>`,
    )
    .join("");
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="kcl-book" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3DC"/><stop offset="1" stop-color="#E4D4AC"/></linearGradient>
    </defs>
    <path d="M60 118 h120 v10 q-60 8 -120 0 z" fill="#8E5D2A" opacity=".9"/>
    <rect x="64" y="30" width="112" height="90" rx="8" fill="url(#kcl-book)" stroke="#8A6A3E" stroke-width="1.8"/>
    <path d="M64 40q56-8 112 0" stroke="#C9B98E" stroke-width="1.2" fill="none" opacity=".7"/>
    <ellipse cx="120" cy="126" rx="66" ry="4.6" fill="#2A3A5E" opacity=".1"/>
    ${rows}
    ${layers >= 4 ? `<path d="M178 36l2 4.4 4.4 2-4.4 2-2 4.4-2-4.4-4.4-2 4.4-2z" fill="#F2C24E"/>` : ""}
  </svg>`;
}

// ④ 변동성: 시간 슬라이더 — 하얀 절임(고추 전래 전) ↔ 오늘의 빨간 김치
function changeSvg(): string {
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="kcl-jarW" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#FDFAF2"/><stop offset="1" stop-color="#E2D8C2"/></radialGradient>
      <radialGradient id="kcl-jarR" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#F2937E"/><stop offset="1" stop-color="#C23A28"/></radialGradient>
      <linearGradient id="kcl-crock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A9744A"/><stop offset="1" stop-color="#5E3A1E"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="126" rx="72" ry="6" fill="#2A3A5E" opacity=".1"/>
    <path d="M92 48h56l6 14q6 14 6 26 0 34-40 34t-40-34q0-12 6-26z" fill="url(#kcl-crock)" stroke="#3E2812" stroke-width="1.8"/>
    <ellipse cx="120" cy="48" rx="28" ry="8" fill="#4E3016" stroke="#3E2812" stroke-width="1.4"/>
    <g class="kcl-white">
      <path d="M104 44q-3-10 6-12 2-5 9-4 8-4 12 3 4 4 1 9 2 7-7 8-12 3-21-4z" fill="url(#kcl-jarW)" stroke="#B8A87E" stroke-width="1.5"/>
      <path d="M108 34q5 5 4 11M118 30q2 7 1 13" stroke="#CBC0A2" stroke-width="1.2" fill="none"/>
    </g>
    <g class="kcl-red">
      <path d="M104 44q-3-10 6-12 2-5 9-4 8-4 12 3 4 4 1 9 2 7-7 8-12 3-21-4z" fill="url(#kcl-jarR)" stroke="#8E2318" stroke-width="1.5"/>
      <path d="M108 34q5 5 4 11M118 30q2 7 1 13" stroke="#F6B09E" stroke-width="1.3" fill="none"/>
      <path d="M100 40l-3-2M136 36l3-2" stroke="#D14A32" stroke-width="1.6"/>
    </g>
    <path d="M100 66q-4 8-3 16" stroke="#fff" stroke-width="2" opacity=".3" fill="none"/>
  </svg>`;
}

// ⑤ 전체성: 김치 노드 연결망 — 하나가 변하면 연결된 생활이 함께 변한다
function wholeSvg(lit: number): string {
  const node = (x: number, y: number, on: boolean, icon: string): string => `
    <g opacity="${on ? 1 : 0.32}">
      <circle cx="${x}" cy="${y}" r="17" fill="${on ? "#FDF0E8" : "#F2F5F9"}" stroke="${on ? "#C13B2E" : "#8A93A6"}" stroke-width="1.8"/>
      ${icon}
    </g>`;
  const line = (x1: number, y1: number, x2: number, y2: number, on: boolean): string =>
    `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${on ? "#C13B2E" : "#C4CDD8"}" stroke-width="${on ? 2.6 : 1.8}" stroke-dasharray="${on ? "none" : "4 4"}"/>`;
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${line(120, 75, 52, 44, lit >= 1)}${line(120, 75, 120, 26, lit >= 2)}${line(120, 75, 188, 44, lit >= 3)}
    <g>
      <circle cx="120" cy="75" r="22" fill="#FDECE6" stroke="#C13B2E" stroke-width="2.2"/>
      <path d="M112 70q-2-6 4-7 1-3 6-2 5-3 8 2 2 3 0 6 1 4-4 5-8 2-14-4z" fill="#E8543E" stroke="#8E2318" stroke-width="1.2"/>
      <path d="M113 82q7 3 14 0" stroke="#C23A28" stroke-width="1.6" fill="none"/>
    </g>
    ${node(52, 44, lit >= 1, `<rect x="43" y="36" width="18" height="14" rx="3" fill="none" stroke="${lit >= 1 ? "#C13B2E" : "#8A93A6"}" stroke-width="1.6"/><path d="M46 40h12M52 36v14" stroke="${lit >= 1 ? "#C13B2E" : "#8A93A6"}" stroke-width="1.3"/>`)}
    ${node(120, 26, lit >= 2, `<rect x="112" y="17" width="16" height="18" rx="3" fill="none" stroke="${lit >= 2 ? "#C13B2E" : "#8A93A6"}" stroke-width="1.6"/><path d="M115 22h10M115 26h10" stroke="${lit >= 2 ? "#C13B2E" : "#8A93A6"}" stroke-width="1.3"/>`)}
    ${node(188, 44, lit >= 3, `<path d="M180 50l4-9h9l3 9M182 50h13" stroke="${lit >= 3 ? "#C13B2E" : "#8A93A6"}" stroke-width="1.6" fill="none"/><circle cx="184" cy="52" r="2" fill="${lit >= 3 ? "#C13B2E" : "#8A93A6"}"/><circle cx="193" cy="52" r="2" fill="${lit >= 3 ? "#C13B2E" : "#8A93A6"}"/>`)}
    <g ${STICK}>
      <circle cx="36" cy="106" r="7" fill="#F6EFE4"/>
      <path d="M36 113v16M36 129l-5 11M36 129l5 11M36 118l-8 5M36 118l9 4"/>
    </g>
    <circle cx="33.9" cy="105" r="1" fill="#3C4654"/><circle cx="38.1" cy="105" r="1" fill="#3C4654"/>
    <path d="M34.4 109q1.6 1.2 3.2 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>
    <ellipse cx="120" cy="140" rx="80" ry="4" fill="#2A3A5E" opacity=".08"/>
  </svg>`;
}

interface Phase {
  id: string;
  fileLabel: string; // 수사 파일 이름(속성 이름은 스포일러라 뒤에 명명)
  prop: string; // 명명될 속성
  intro: string; // helper
  q: string;
  options: [string, string]; // [0] = 정답
  good: string;
  wrong: string;
}

const PHASES: Phase[] = [
  {
    id: "share",
    fileLabel: "첫 번째 비밀",
    prop: "공유성",
    intro: "김치찌개 앞에 두 사람 — 아래 <b>맛보기 버튼</b>으로 두 사람에게 국물을 맛보게 해요.",
    q: "뜨거운 국물의 '시원하다'가 한국 사람들 사이에서 통하는 까닭은 무엇일까요?",
    options: ["같은 문화를 함께 나누고 있어서", "한국 사람의 혀가 남다르게 태어나서"],
    good: "맞아요! 한 사회의 구성원들은 언어와 표현, 규범 같은 문화를 <b>함께 나누고</b> 있어요 — 그래서 서로 통하고, 행동을 예측할 수 있죠. 이 속성의 이름은 <b>공유성</b>!",
    wrong: "혀가 다르게 태어난다면 외국에서 자란 한국계 사람도 '시원하다'를 알아야겠죠? 이건 몸이 아니라 <b>함께 나눈 문화</b>의 문제랍니다. 다시 골라 봐요!",
  },
  {
    id: "learn",
    fileLabel: "두 번째 비밀",
    prop: "학습성",
    intro: "김장 날이에요! 아이는 아직 서툴러요 — <b>함께 담가 보기</b>를 눌러 어른과 한 단계씩 배워 봐요.",
    q: "김장 솜씨는 어떻게 생긴 걸까요?",
    options: ["어른들과 함께하며 배워서", "태어날 때부터 유전자에 새겨져 있어서"],
    good: "그렇죠! 문화는 태어나면서 저절로 갖게 되는 게 아니라, 자신이 속한 사회에서 <b>후천적으로 배워 익히는</b> 거예요 — 이 속성의 이름은 <b>학습성</b>!",
    wrong: "유전자에 새겨져 있다면 배추를 처음 본 아기도 김장을 해야겠죠? 방금 화면에서 아이는 어른과 <b>함께하며 배웠어요</b>. 다시 골라 봐요!",
  },
  {
    id: "stack",
    fileLabel: "세 번째 비밀",
    prop: "축적성",
    intro: "오래된 레시피 공책이에요. <b>세대 넘기기</b>를 눌러 지혜가 쌓이는 과정을 넘겨 봐요.",
    q: "김치가 세대를 거치며 점점 풍부해진 비결은 무엇일까요?",
    options: ["앞 세대의 지혜가 전해지고 그 위에 새것이 쌓여서", "세대마다 옛것을 버리고 처음부터 새로 만들어서"],
    good: "정확해요! 앞선 세대의 지식과 경험이 말과 글로 <b>전해지고</b>, 그 위에 새로운 것이 <b>쌓여</b> 문화는 점점 풍부해져요 — 이 속성의 이름은 <b>축적성</b>!",
    wrong: "공책을 다시 봐요 — 층이 하나씩 '위에' 쌓였지, 앞 장을 찢고 새로 쓰지 않았어요. 전해지고 쌓이는 것이 비결이랍니다. 다시 골라 봐요!",
  },
  {
    id: "change",
    fileLabel: "네 번째 비밀",
    prop: "변동성",
    intro: "타임머신 항아리예요! 슬라이더를 <b>왼쪽 끝(옛날)까지</b> 밀어 보고, 다시 오늘로 돌아와 봐요.",
    q: "김치의 색이 바뀐 것처럼, 문화는 시간이 지나면 어떻게 될까요?",
    options: ["새 재료나 다른 문화와 만나며 계속 변한다", "처음 모습 그대로 영원히 멈춰 있다"],
    good: "맞아요! 고추라는 <b>외래 작물과의 만남</b>이 김치의 색을 바꿨죠 — 문화는 새로운 발명이나 다른 문화와의 접촉으로 <b>끊임없이 변해요</b>. 이 속성의 이름은 <b>변동성</b>!",
    wrong: "방금 시간 여행에서 봤죠 — 옛날 김치는 하얀색이었어요! 문화는 멈춰 있지 않고 계속 변한답니다. 다시 골라 봐요!",
  },
  {
    id: "whole",
    fileLabel: "다섯 번째 비밀",
    prop: "전체성",
    intro: "마지막 비밀 — <b>세상이 변한다</b> 버튼을 눌러, 1인 가구가 늘어난 세상이 김치 문화에 어떤 물결을 일으키는지 봐요.",
    q: "1인 가구 증가로 김치 문화가 변하자, 연결된 생활 모습들은 어떻게 됐나요?",
    options: ["연결된 다른 생활 모습도 함께 변한다", "김치만 변하고 나머지 생활은 그대로다"],
    good: "그거예요! 문화의 요소들은 서로 <b>긴밀하게 연결</b>되어 있어서, 한 부분이 변하면 다른 부분도 함께 변해요 — 이 속성의 이름은 <b>전체성</b>!",
    wrong: "연결망을 다시 봐요 — 소포장 김치, 김치냉장고, 배달까지 줄줄이 켜졌죠? 문화는 홀로 변하지 않아요. 다시 골라 봐요!",
  },
];

// 기계 검산용 export(qa/audit-soc8-data.mjs — options[0]=정답 규약 검사)
export const KIMCHI_PHASES = PHASES;

export const kimchiLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "files" } }, el("b", { text: "다섯 비밀" }), el("span", { text: "0 / 5" })),
    el("div", { class: "pn-badge world", dataset: { g: "time" } }, el("b", { text: "시간 여행" }), el("span", { text: "하양 김치 찾기" })),
    el("div", { class: "pn-badge world", dataset: { g: "web" } }, el("b", { text: "연결망" }), el("span", { text: "물결 완성" })),
  );
  const helper = el("div", { class: "helper", html: PHASES[0].intro });

  // 무대: 파일 라벨 + 장면 + 속성 배지 스트립
  const fileTag = el("div", { class: "kcl-file", text: PHASES[0].fileLabel });
  const sceneBox = el("div", { class: "kcl-scene" });
  const badges = el("div", { class: "kcl-badges" });
  const stage = el("div", { class: "stage kcl-stage" }, fileTag, sceneBox, badges);

  // 조작부(국면별 교체)
  const controls = el("div", { class: "kcl-controls" });

  // 판정(msn 문법 — options[0]=정답, 셔플 없음)
  const quizQ = el("div", { class: "msn-q" });
  const optBtns = [0, 1].map((i) => el("button", { class: "msn-opt", attrs: { type: "button" }, dataset: { o: String(i) } }));
  const quizCard = el("div", { class: "msn-quiz kcl-quiz" }, quizQ, ...optBtns);

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
  const chipCount = (n: number): void => {
    const chip = goalChips.querySelector('[data-g="files"]') as HTMLElement;
    chip.querySelector("span")!.textContent = `${n} / 5`;
    if (n >= 5 && !chip.classList.contains("on")) {
      chip.classList.add("on");
      haptic(HAPTIC.ctaUnlock);
    }
  };

  let phase = 0;
  let clean = true;
  let quizOpen = false;
  let phaseReady = false; // 조작 완료 → 판정 개방

  function openQuiz(): void {
    const p = PHASES[phase];
    quizOpen = true;
    quizQ.innerHTML = p.q;
    optBtns.forEach((b, i) => {
      b.classList.remove("ok", "no", "dim");
      b.innerHTML = p.options[i];
    });
    quizCard.classList.add("show");
    later(() => quizCard.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function closeQuizToNext(): void {
    quizOpen = false;
    quizCard.classList.remove("show");
    const done = phase + 1;
    chipCount(done);
    // 속성 배지 적재
    badges.appendChild(el("span", { class: "kcl-prop", text: PHASES[phase].prop }));
    if (done >= PHASES.length) {
      helper.innerHTML =
        "다섯 비밀이 전부 풀렸어요 — <b>공유성·학습성·축적성·변동성·전체성</b>. 김치 한 포기가 품고 있던 문화의 다섯 속성이에요!";
      api.recordQuiz(clean);
      api.enableCTA(s.cta ?? "용어로 정리하기");
      return;
    }
    phase = done;
    phaseReady = false;
    const p = PHASES[phase];
    fileTag.textContent = p.fileLabel;
    helper.innerHTML = p.intro;
    mountPhase();
  }

  optBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (!quizOpen) return;
      if (i === 0) {
        haptic(HAPTIC.correct);
        btn.classList.add("ok");
        optBtns[1].classList.add("dim");
        helper.innerHTML = PHASES[phase].good;
        quizOpen = false;
        later(closeQuizToNext, 1500);
      } else {
        clean = false;
        haptic(HAPTIC.wrong);
        btn.classList.add("no");
        helper.innerHTML = PHASES[phase].wrong;
        later(() => btn.classList.remove("no"), 900);
      }
    });
  });

  /* ── 국면별 조작 마운트 ── */
  function actBtn(label: string): HTMLButtonElement {
    return el("button", { class: "btn kcl-act", attrs: { type: "button" }, text: label }) as HTMLButtonElement;
  }

  function mountPhase(): void {
    controls.innerHTML = "";
    sceneBox.classList.remove("in");
    void sceneBox.offsetWidth;
    sceneBox.classList.add("in");

    if (PHASES[phase].id === "share") {
      sceneBox.innerHTML = shareSvg(0);
      const b = actBtn("국물 한 입 맛보기");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (phaseReady) return;
        phaseReady = true;
        haptic(HAPTIC.select);
        sceneBox.innerHTML = shareSvg(1);
        b.disabled = true;
        b.classList.add("done");
        helper.innerHTML =
          "한국 스틱맨은 <b>\"캬— 시원하다!\"</b> 그런데 옆 친구는 <b>\"뜨거운데 왜 시원해?!\"</b> — 같은 국물인데 반응이 갈렸어요. 아래에서 까닭을 골라 봐요!";
        later(openQuiz, 700);
      });
    } else if (PHASES[phase].id === "learn") {
      let n = 0;
      sceneBox.innerHTML = learnSvg(0);
      const b = actBtn("함께 담가 보기 (0/3)");
      controls.appendChild(b);
      const stepsTxt = ["배추 절이기부터 — 소금을 골고루!", "양념 속 만들기 — 어른의 비율을 어깨너머로!", "속 바르기 — 아이의 손놀림이 제법이에요!"];
      b.addEventListener("click", () => {
        if (phaseReady) return;
        n += 1;
        haptic(HAPTIC.select);
        sceneBox.innerHTML = learnSvg(Math.min(3, n) as 0 | 1 | 2 | 3);
        b.textContent = `함께 담가 보기 (${Math.min(3, n)}/3)`;
        helper.innerHTML = stepsTxt[Math.min(2, n - 1)];
        if (n >= 3) {
          phaseReady = true;
          b.disabled = true;
          b.classList.add("done");
          helper.innerHTML = "세 번 함께했더니 아이 손이 야무져졌어요 — 이 솜씨, 어디서 왔을까요?";
          later(openQuiz, 700);
        }
      });
    } else if (PHASES[phase].id === "stack") {
      let n = 1;
      sceneBox.innerHTML = stackSvg(1);
      const b = actBtn("세대 넘기기");
      controls.appendChild(b);
      const gens = ["옛날엔 소금에 절인 채소였어요.", "고춧가루가 더해져 매콤해졌어요.", "젓갈의 감칠맛이 얹혔어요.", "오늘의 김치 — 층층이 쌓인 지혜예요!"];
      b.addEventListener("click", () => {
        if (phaseReady) return;
        n += 1;
        haptic(HAPTIC.select);
        sceneBox.innerHTML = stackSvg(Math.min(4, n));
        helper.innerHTML = gens[Math.min(3, n - 1)];
        if (n >= 4) {
          phaseReady = true;
          b.disabled = true;
          b.classList.add("done");
          later(openQuiz, 800);
        }
      });
    } else if (PHASES[phase].id === "change") {
      sceneBox.innerHTML = changeSvg();
      const wrap = el("div", { class: "kcl-timeline" });
      const lab = el("div", { class: "kcl-time-lab", html: "<b>오늘</b>의 김치" });
      const range = el("input", { class: "kcl-range", attrs: { type: "range", min: "0", max: "100", value: "100", "aria-label": "시간 여행 슬라이더" } }) as HTMLInputElement;
      const ends = el("div", { class: "kcl-time-ends" }, el("span", { text: "고추가 오기 전" }), el("span", { text: "오늘" }));
      wrap.append(lab, range, ends);
      controls.appendChild(wrap);
      let sawWhite = false;
      const paint = (): void => {
        const v = Number(range.value);
        const red = sceneBox.querySelector(".kcl-red") as SVGGElement | null;
        if (red) red.style.opacity = String(v / 100);
        lab.innerHTML = v <= 8 ? "새하얀 <b>절임 김치</b> — 고추가 오기 전!" : v >= 92 ? "<b>오늘</b>의 빨간 김치" : "시간을 건너는 중…";
        if (v <= 8 && !sawWhite) {
          sawWhite = true;
          haptic(HAPTIC.correct);
          setChip("time", "하양 발견!");
          helper.innerHTML =
            "발견! 고추는 <b>다른 나라에서 전해진 작물</b>이에요 — 그 전의 김치는 하얀 절임이었죠. 이제 슬라이더를 <b>오늘</b>로 되돌려 봐요.";
        }
        if (sawWhite && v >= 92 && !phaseReady) {
          phaseReady = true;
          helper.innerHTML = "하양에서 빨강으로 — 시간 여행 완료! 아래에서 이 변화의 뜻을 골라 봐요.";
          later(openQuiz, 500);
        }
      };
      range.addEventListener("input", paint);
      paint();
    } else {
      sceneBox.innerHTML = wholeSvg(0);
      const b = actBtn("세상이 변한다 — 1인 가구 증가!");
      controls.appendChild(b);
      b.addEventListener("click", () => {
        if (phaseReady) return;
        phaseReady = true;
        b.disabled = true;
        b.classList.add("done");
        haptic(HAPTIC.select);
        const msgs = [
          "혼자 먹을 만큼만 — <b>소포장 김치</b>가 생겨나요.",
          "김장독 대신 <b>김치냉장고</b>가 자리를 잡아요.",
          "담그는 대신 <b>주문해 먹는 집</b>도 늘어나요.",
        ];
        [1, 2, 3].forEach((k, i) =>
          later(() => {
            sceneBox.innerHTML = wholeSvg(k);
            helper.innerHTML = msgs[i];
            haptic(HAPTIC.select);
            if (k === 3) {
              setChip("web", "물결 완성!");
              later(openQuiz, 800);
            }
          }, 750 * (i + 1)),
        );
      });
    }
  }

  mountPhase();
  api.setCTA("다섯 비밀을 모두 풀어요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
    timers.clear();
  };
};
