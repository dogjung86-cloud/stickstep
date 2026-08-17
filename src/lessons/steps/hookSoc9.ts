// hookSoc9 — 사회 Ⅸ(민주주의와 시민) 훅 장면 7종. hook.ts가 renderSoc9 서브 디스패처
// (hookSoc8 문법 — 모르는 장면이면 null)로 위임한다. 파운드리 SVG 문법(근-동조 그라데이션+
// 키라이트+접촉 그림자+최암색 외곽선) 준수, 스틱맨만 손그림 라인. CSS 접두사 hs9-
// (hs8-frame·hs8-btn·hs8-noti·hs8-ring은 완전 동일 스타일이라 재사용 — soc.css 정의).
//   seatwar    L1 — 자리 바꾸기 대소동(서로 다른 세 주장 — 갈등을 어떻게 풀까)
//   oneway     L2 — 게시판에 일방 통보된 체험 학습 장소(왜 다들 시큰둥할까)
//   lotclass   L3 — 반장을 제비뽑기로 뽑는다면?(추첨 상자 — 아테네 예고)
//   hundredmen L4 — 1832년 무렵 영국, 스틱맨 100명 중 투표할 수 있던 사람은?(점등 그리드)
//   kingnope   L5 — 옛날 왕은 뭐든 마음대로, 오늘의 지도자는?(권력의 출처)
//   idiotword  L6 — 'idiot'의 어원(고대 그리스, 공동체에 무관심한 사람)
//   uniformday L7 — 편안한 교복은 누가 만들었을까(공론장 예고)
// 민감 가드(정치 단원): 현실 정당·정치인·국기·구호·피켓 문구 0, 전투·무기 0, 무성별 스틱맨,
// 예측 choices[0]=정답·good≠bad 공용 규칙, 소재 이름은 도입에서 먼저 소개.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

/* ══════════ L1: 자리 바꾸기 대소동 ══════════ */
function seatSvg(step: number, latest: number): string {
  const man = (x: number, talking: boolean): string => `
    <g ${STICK}><circle cx="${x}" cy="92" r="7" fill="#F6EFE4"/><path d="M${x} 99v17M${x} 116l-6 13M${x} 116l6 13M${x} 104l-9 6M${x} 104l9 6"/></g>
    <circle cx="${x - 2.2}" cy="91" r="1.1" fill="#3C4654"/><circle cx="${x + 2.2}" cy="91" r="1.1" fill="#3C4654"/>
    ${talking ? `<ellipse cx="${x}" cy="95.8" rx="1.7" ry="2.2" fill="none" stroke="#3C4654" stroke-width="1.2"/>` : `<path d="M${x - 2} 95.4q2 1.6 4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`}`;
  const bubble = (cx: number, inner: string, on: boolean, fresh: boolean): string =>
    on
      ? `<g${fresh ? ` class="hs8-noti"` : ""}>
          <path d="M${cx - 3} 79l3 6 3-6z" fill="#FFF" stroke="#8A93A6" stroke-width="1.1"/>
          <rect x="${cx - 17}" y="56" width="34" height="24" rx="9" fill="#FFF" stroke="#8A93A6" stroke-width="1.3"/>
          ${inner}
        </g>`
      : "";
  const sunIcon = (cx: number): string => `<circle cx="${cx}" cy="67.5" r="4.4" fill="#FFB93E" stroke="#E2932E" stroke-width="1.2"/>
    <g stroke="#E2932E" stroke-width="1.3"><path d="M${cx} 60.2v-2M${cx} 74.8v2M${cx - 7.3} 67.5h-2M${cx + 7.3} 67.5h2M${cx - 5.2} 62.3l-1.5-1.5M${cx + 5.2} 72.7l1.5 1.5M${cx + 5.2} 62.3l1.5-1.5M${cx - 5.2} 72.7l-1.5 1.5"/></g>`;
  const boardIcon = (cx: number): string => `<rect x="${cx - 8}" y="62.5" width="16" height="10" rx="1.5" fill="#3A7E58" stroke="#215E40" stroke-width="1.2"/>
    <path d="M${cx - 4.5} 66h9M${cx - 4.5} 69h6" stroke="#DFF2E6" stroke-width="1.1"/>`;
  const friendsIcon = (cx: number): string => `<g stroke="#3C4654" stroke-width="1.4" fill="none" stroke-linecap="round">
    <circle cx="${cx - 4.5}" cy="63.6" r="2.4" fill="#F6EFE4"/><path d="M${cx - 4.5} 66v5.4M${cx - 4.5} 71.4l-2.4 4.2M${cx - 4.5} 71.4l2.4 4.2M${cx - 4.5} 67.8l-2.8 2M${cx - 4.5} 67.8l2.8 2"/>
    <circle cx="${cx + 4.5}" cy="63.6" r="2.4" fill="#F6EFE4"/><path d="M${cx + 4.5} 66v5.4M${cx + 4.5} 71.4l-2.4 4.2M${cx + 4.5} 71.4l2.4 4.2M${cx + 4.5} 67.8l-2.8 2M${cx + 4.5} 67.8l2.8 2"/></g>`;
  const cells = Array.from({ length: 8 }, (_, k) => {
    const cx0 = 100 + (k % 4) * 19.6;
    const cy0 = 25 + Math.floor(k / 4) * 20;
    return `<rect x="${cx0}" y="${cy0}" width="17" height="17" rx="3" fill="#FDFBF6" stroke="#C2A45E" stroke-width="1.1"/>`;
  }).join("");
  const bolt =
    step >= 3
      ? `<path class="hs8-ring" d="M143 20l-12 15h8l-8 16 17-19h-8l9-12z" fill="#FFD43B" stroke="#E2932E" stroke-width="1.3" stroke-linejoin="round"/>`
      : "";
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs9-chalk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E8E68"/><stop offset=".55" stop-color="#2E7452"/><stop offset="1" stop-color="#215E40"/></linearGradient>
      <linearGradient id="hs9-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3DC"/><stop offset="1" stop-color="#EBD9AE"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="137" rx="92" ry="5" fill="#2A3A5E" opacity=".1"/>
    <rect x="36" y="8" width="168" height="66" rx="8" fill="url(#hs9-chalk)" stroke="#8A6A3E" stroke-width="2"/>
    <ellipse cx="62" cy="16" rx="14" ry="3.4" fill="#fff" opacity=".14"/>
    <text x="66" y="32" text-anchor="middle" font-size="9.5" font-weight="800" fill="#EAF4EE">자리 바꾸기</text>
    <path d="M50 38h32" stroke="#EAF4EE" stroke-width="1.2" opacity=".55" stroke-dasharray="3 3"/>
    <rect x="96" y="18" width="84" height="48" rx="6" fill="url(#hs9-panel)" stroke="#8A6A3E" stroke-width="1.4"/>
    <circle cx="138" cy="21.5" r="1.8" fill="#E2604A" stroke="#B84434" stroke-width=".8"/>
    ${cells}
    ${bolt}
    ${man(60, step > 0)}
    ${man(120, step > 1)}
    ${man(180, step > 2)}
    ${bubble(60, sunIcon(60), step > 0, latest === 0)}
    ${bubble(120, boardIcon(120), step > 1, latest === 1)}
    ${bubble(180, friendsIcon(180), step > 2, latest === 2)}
  </svg>`;
}

export function renderSeatWar(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "의견 듣기 (0/3)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = seatSvg(0, -1);
  helper.innerHTML = "오늘은 <b>자리 바꾸는 날</b>! 그런데 원하는 자리가 서로 달라 교실이 시끌시끌해요. 한 명씩 의견을 들어 볼까요?";
  const caps = [
    "① \"<b>창가 자리</b>가 좋아! 햇살 드는 자리가 최고야.\"",
    "② \"난 <b>칠판 앞</b>! 여기가 제일 잘 보이거든.\"",
    "③ \"뭐니 뭐니 해도 <b>친구 옆</b>이 최고지!\", 어이쿠, 세 의견이 정면충돌이에요!",
  ];
  let i = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (i >= 3) return;
    i += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = seatSvg(i, i - 1);
    helper.innerHTML = caps[i - 1];
    btn.textContent = `의견 듣기 (${i}/3)`;
    if (i >= 3) {
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      timer = window.setTimeout(() => {
        helper.innerHTML = "창가, 칠판 앞, 친구 옆… 모두가 동시에 만족할 수는 없어 보여요. 이 소동, 어떻게 풀어야 할까요?";
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "모두의 의견을 모아 함께 조정한다",
            "목소리가 가장 큰 사람 말대로 한다",
            "아무도 못 바꾸게 자리를 영영 고정한다",
          ],
          good: "좋은 감각이에요! 서로 다른 의견을 모아 <b>함께 조정하는 것</b>, 사실 이런 활동에는 어엿한 이름이 붙어 있답니다. 그 이름이 무엇인지, 판정소에서 확인하러 가요!",
          bad: "목소리 크기로 정하면 나머지는 그 결정에 따르기 어렵고, 자리를 영영 고정하면 문제를 미룰 뿐이에요. 답은 <b>모두의 의견을 모아 함께 조정하는 것</b>! 이런 활동에 붙은 이름을 판정소에서 확인하러 가요.",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L2: 일방 통보된 체험 학습 ══════════ */
function onewaySvg(stage: number): string {
  const kid = (x: number, mark: string, delay: string): string => `
    <g class="hs8-noti"${delay ? ` style="animation-delay:${delay}"` : ""}>
      <g ${STICK}><circle cx="${x}" cy="99" r="7" fill="#F6EFE4"/><path d="M${x} 106v16M${x} 122l-5 12M${x} 122l5 12M${x} 110l-4 12M${x} 110l4 12"/></g>
      <circle cx="${x - 2.2}" cy="98" r="1.1" fill="#3C4654"/><circle cx="${x + 2.2}" cy="98" r="1.1" fill="#3C4654"/>
      <path d="M${x - 2.2} 102.6h4.4" stroke="#3C4654" stroke-width="1.3"/>
      ${mark}
    </g>`;
  const qmark = (x: number): string => `<text x="${x}" y="90" text-anchor="middle" font-size="12" font-weight="900" fill="#5E6A7E">?</text>`;
  const droop = (x: number): string => `<path d="M${x + 9} 90l3-3M${x + 10.5} 93.5l4-1.5" stroke="#8A93A6" stroke-width="1.3" fill="none"/>`;
  const paper =
    stage >= 1
      ? `<g${stage === 1 ? ` class="hs9-drop"` : ""}>
          <g transform="rotate(-2 120 53)">
            <rect x="94" y="26" width="52" height="56" rx="3" fill="#FFFFFF" stroke="#B8C2CE" stroke-width="1.3"/>
            <circle cx="101" cy="32" r="2.4" fill="#E2604A" stroke="#B84434" stroke-width=".8"/>
            <circle cx="139" cy="32" r="2.4" fill="#3E8EC4" stroke="#2E6A94" stroke-width=".8"/>
            <path d="M114 40c-5.2 0-8.4 3.9-8.4 8.2 0 6.2 8.4 13.2 8.4 13.2s8.4-7 8.4-13.2c0-4.3-3.2-8.2-8.4-8.2z" fill="#E8543E" stroke="#B84434" stroke-width="1.2"/>
            <circle cx="114" cy="48.4" r="3" fill="#FFF"/>
            <path d="M126 56q8 4 9 13" stroke="#3E4A5E" stroke-width="2" fill="none"/>
            <path d="M137 71l-5.4-2.2 3-3.4z" fill="#3E4A5E"/>
            <path d="M100 76h40" stroke="#DCE3EC" stroke-width="2.4"/>
          </g>
          ${stage === 1 ? `<path d="M88 22l-5-5M152 22l5-5M120 14v-6" stroke="#8A93A6" stroke-width="1.6" opacity=".7"/>` : ""}
        </g>`
      : "";
  const kids =
    stage >= 2
      ? `${kid(78, qmark(89), "")}${kid(120, droop(120), ".35s")}${kid(162, qmark(173), ".7s")}`
      : "";
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs9-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FAFD"/><stop offset="1" stop-color="#E4EBF2"/></linearGradient>
      <linearGradient id="hs9-cork" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8CBA0"/><stop offset=".6" stop-color="#D9B98A"/><stop offset="1" stop-color="#C4A272"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="138" rx="96" ry="5" fill="#2A3A5E" opacity=".1"/>
    <rect x="10" y="6" width="220" height="114" rx="10" fill="url(#hs9-wall)"/>
    <path d="M10 120h220" stroke="#C4CDD8" stroke-width="1.6"/>
    <rect x="60" y="14" width="120" height="78" rx="7" fill="url(#hs9-cork)" stroke="#8A6A3E" stroke-width="2"/>
    <ellipse cx="84" cy="21" rx="12" ry="3" fill="#fff" opacity=".2"/>
    <rect x="68" y="24" width="16" height="12" rx="2" fill="#EDF2F7" stroke="#C4CDD8" stroke-width="1" transform="rotate(-4 76 30)"/>
    ${paper}
    ${kids}
  </svg>`;
}

export function renderOneWay(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "게시판 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = onewaySvg(0);
  helper.innerHTML = "복도가 웅성웅성, <b>체험 학습 장소</b>가 정해졌대요. 그런데 누구에게도 물어본 적이 없다는데요? 게시판부터 보러 가요.";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = onewaySvg(stage);
    if (stage === 1) {
      helper.innerHTML = "쿵! 공고 한 장이 붙었어요. 지도 핀과 화살표가 그려져 있네요. 장소는 <b>이미 결정</b>, 안내는 이 종이 한 장뿐이래요.";
      btn.textContent = "반 친구들 표정 보기";
    } else {
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      helper.innerHTML = "모여든 친구들 머리 위로 물음표가 둥둥, 어깨는 축 처졌어요. 나쁜 곳도 아닌 것 같은데, 왜 다들 시큰둥할까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "함께 정하지 않고 일방적으로 정해져서",
            "장소가 나빠서",
            "공고 종이가 작아서",
          ],
          good: "바로 그거예요! <b>함께 정하지 않은 결정</b>은 따르고 싶은 마음이 잘 생기지 않아요. 그래서 여럿이 함께 정하는 데에는 기술이 필요하답니다. 그 기술을 배우러 가요!",
          bad: "장소나 종이 크기의 문제가 아니에요. 아무도 의견을 묻지 않고 <b>일방적으로 정해졌다</b>는 게 핵심이죠. 함께 정하지 않은 결정은 따르기 어렵거든요. 여럿이 함께 정하는 기술을 배우러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 반장을 제비뽑기로? ══════════ */
function lotSvg(stage: number): string {
  const eyes =
    stage === 2
      ? `<circle cx="41.6" cy="79" r="1.8" fill="none" stroke="#3C4654" stroke-width="1.2"/><circle cx="48.4" cy="79" r="1.8" fill="none" stroke="#3C4654" stroke-width="1.2"/><ellipse cx="45" cy="84.6" rx="1.8" ry="2.4" fill="none" stroke="#3C4654" stroke-width="1.2"/>`
      : `<circle cx="42.6" cy="79" r="1.1" fill="#3C4654"/><circle cx="47.4" cy="79" r="1.1" fill="#3C4654"/><path d="M43 83.4q2 1.6 4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`;
  const arms = stage === 2 ? `M45 94l-10-8M45 94l10-8` : `M45 94l-8 7M45 94l8 7`;
  const slip =
    stage === 2
      ? `<g class="hs8-noti">
          <path d="M128 50l-2-7M136 48l1-7M144 50l4-6" stroke="#C2A45E" stroke-width="1.4"/>
          <g transform="rotate(8 150 40)">
            <rect x="133" y="30" width="34" height="20" rx="3" fill="#FFF" stroke="#8A93A6" stroke-width="1.3"/>
            <path d="M139 38h22M139 43h14" stroke="#8A93A6" stroke-width="1.7"/>
          </g>
        </g>`
      : "";
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs9-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B8894E"/><stop offset=".55" stop-color="#9A6E38"/><stop offset="1" stop-color="#7E5628"/></linearGradient>
      <linearGradient id="hs9-box" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2B478"/><stop offset=".55" stop-color="#C89454"/><stop offset="1" stop-color="#A87838"/></linearGradient>
    </defs>
    <ellipse cx="122" cy="137" rx="92" ry="5" fill="#2A3A5E" opacity=".1"/>
    <g ${STICK}><circle cx="45" cy="80" r="8" fill="#F6EFE4"/><path d="M45 88v22M45 110l-6 16M45 110l6 16"/><path d="${arms}"/></g>
    ${eyes}
    <rect x="66" y="90" width="108" height="9" rx="3" fill="#C89A5E" stroke="#84582A" stroke-width="1.4"/>
    <ellipse cx="88" cy="94" rx="10" ry="2.2" fill="#fff" opacity=".25"/>
    <path d="M74 99h92l7 32H67z" fill="url(#hs9-desk)" stroke="#6E4A26" stroke-width="1.5"/>
    <g${stage === 1 ? ` class="hs9-shake"` : ""}>
      <rect x="106" y="53" width="28" height="7" rx="2" fill="#3E2A16"/>
      <rect x="106" y="45" width="8" height="10" rx="1" fill="#FFF" stroke="#C4CDD8" stroke-width="1" transform="rotate(-10 110 50)"/>
      <rect x="116" y="43" width="8" height="10" rx="1" fill="#FFF" stroke="#C4CDD8" stroke-width="1" transform="rotate(6 120 48)"/>
      <rect x="126" y="45" width="8" height="10" rx="1" fill="#FFF" stroke="#C4CDD8" stroke-width="1" transform="rotate(14 130 50)"/>
      <rect x="98" y="58" width="44" height="32" rx="4" fill="url(#hs9-box)" stroke="#5E3A1E" stroke-width="1.6"/>
      <ellipse cx="108" cy="63" rx="7" ry="2" fill="#fff" opacity=".3"/>
      <text x="120" y="80" text-anchor="middle" font-size="8.5" font-weight="800" fill="#FFF3E0">이름표</text>
    </g>
    ${slip}
  </svg>`;
}

export function renderLotClass(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "상자 흔들기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = lotSvg(0);
  helper.innerHTML = "만약 우리 반 반장을 투표가 아니라 <b>제비뽑기</b>로 뽑는다면? 교탁 위에 반 전체의 이름표가 든 상자가 놓였어요. 상상만 해도 아찔한데…";
  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = lotSvg(stage);
    if (stage === 1) {
      helper.innerHTML = "달그락달그락, 상자 속에서 이름표들이 뒤섞여요. 누가 나올지 아무도 몰라요. 이제 한 장 뽑아 볼까요?";
      btn.textContent = "한 장 뽑기";
    } else {
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      helper.innerHTML = "뽑힌 이름표 한 장, 이 사람이 오늘부터 반장?! 그런데 말이죠, 아주 먼 옛날에 나랏일 맡을 사람을 정말 '제비뽑기'로 정한 나라가 있었을까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "있었다. 추첨으로 나랏일을 맡겼다",
            "없었다. 나랏일은 언제나 시험으로 뽑았다",
            "없었다. 왕이 전부 정했다",
          ],
          good: "놀랍게도 <b>있었어요</b>! 2500년 전 어느 도시 나라는 나랏일 맡을 사람 상당수를 정말 추첨으로 정했답니다. 어떻게 그런 일이 가능했는지, 만화로 확인하러 가요!",
          bad: "시험으로 뽑는 건 다른 시대, 다른 곳의 이야기고, 왕이 다 정한 나라도 많았지만, 2500년 전 어느 도시 나라는 정말 <b>제비뽑기로 나랏일을 맡겼어요</b>. 모두가 번갈아 맡는 나라! 만화로 확인하러 가요.",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L4: 1832년, 100명 중 몇 명? ══════════ */
function hundredSvg(lit: boolean): string {
  const LIT_ORDER = [12, 37, 61, 88];
  const men: string[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const i = r * 10 + c;
      const x = 35 + c * 19;
      const y = 34 + r * 10.8;
      const di = LIT_ORDER.indexOf(i);
      if (lit && di >= 0) {
        men.push(`<g class="hs8-noti" style="animation-delay:${(di * 0.12).toFixed(2)}s">
          <circle cx="${x}" cy="${y + 3}" r="7.2" fill="#3182F6" opacity=".16"/>
          <g stroke="#1B64DA" stroke-width="1.7" stroke-linecap="round" fill="none"><circle cx="${x}" cy="${y}" r="2.2" fill="#EEF4FF"/><path d="M${x} ${y + 2.2}v5.2"/></g>
        </g>`);
      } else {
        const col = lit ? "#C4CDD8" : "#5E6A7E";
        men.push(`<g stroke="${col}" stroke-width="1.5" stroke-linecap="round" fill="none"><circle cx="${x}" cy="${y}" r="2.1" fill="${lit ? "#EEF2F7" : "#F6EFE4"}"/><path d="M${x} ${y + 2.1}v5.1"/></g>`);
      }
    }
  }
  const pill = lit
    ? `<g class="hs8-noti" style="animation-delay:.6s">
        <rect x="95" y="15" width="50" height="14" rx="7" fill="#EEF4FF" stroke="#9EBCE8" stroke-width="1.2"/>
        <text x="120" y="25" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1B64DA">4 / 100</text>
      </g>`
    : "";
  return `<svg viewBox="0 0 240 152" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs9-oldair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF6E8"/><stop offset=".6" stop-color="#F4EAD2"/><stop offset="1" stop-color="#EADCBC"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="146" rx="96" ry="5" fill="#2A3A5E" opacity=".1"/>
    <rect x="14" y="10" width="212" height="130" rx="12" fill="url(#hs9-oldair)" stroke="#D9CBAE" stroke-width="1.4"/>
    <ellipse cx="40" cy="18" rx="14" ry="3" fill="#fff" opacity=".35"/>
    ${men.join("")}
    ${pill}
  </svg>`;
}

export function renderHundredMen(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "투표할 수 있던 사람 켜기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = hundredSvg(false);
  helper.innerHTML = "약 200년 전, <b>1832년 무렵의 영국</b> 어느 마을이에요. 마을 사람이 100명이라면, 그중 나랏일에 투표할 수 있던 사람은 몇 명이었을까요? 버튼으로 켜서 확인해 봐요.";
  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    fig.innerHTML = hundredSvg(true);
    face("surprised");
    helper.innerHTML = "고작 <b>4명 정도</b>! 나머지 96명에게는 아예 투표권이 없었어요. 왜 이렇게 적었을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "재산 등 조건을 갖춘 사람에게만 투표권을 줘서",
          "사람들이 투표를 귀찮아해서",
          "투표소가 너무 멀어서",
        ],
        good: "정확해요! 그 시절에는 <b>재산 같은 조건</b>을 갖춘 사람에게만 투표권을 줬어요. 재산·성별 같은 조건의 벽이 어떻게 낮아져 왔는지, 타임라인 여행으로 따라가 봐요!",
        bad: "귀찮아서도, 멀어서도 아니에요. <b>재산 등 조건을 갖춘 사람에게만</b> 투표권을 주던 시대였거든요. 그 조건의 벽이 어떻게 낮아져 왔는지, 타임라인 여행으로 따라가 봐요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L5: 왕도 못 하는 일? ══════════ */
function kingSvg(revealed: boolean): string {
  const scroll = (x: number, y: number, rot: number): string => `
    <g transform="rotate(${rot} ${x + 4.5} ${y + 3})">
      <rect x="${x}" y="${y}" width="9" height="6" rx="1.2" fill="#FFF8E8" stroke="#C2A45E" stroke-width="1"/>
      <circle cx="${x + 0.5}" cy="${y + 3}" r="1.6" fill="#EBD9AE" stroke="#C2A45E" stroke-width=".8"/>
    </g>`;
  const today = revealed
    ? `<g class="hs8-noti">
        <ellipse cx="156" cy="45" rx="27" ry="13" fill="#F2C24E" opacity=".18"/>
        <rect x="136" y="33" width="40" height="25" rx="3" fill="url(#hs9-book)" stroke="#8A6A2E" stroke-width="1.5"/>
        <path d="M156 33v25" stroke="#8A6A2E" stroke-width="1.2"/>
        <path d="M141 41h10M141 47h10M161 41h10M161 47h10" stroke="#FFF" stroke-width="1.3" opacity=".85"/>
        <rect x="142" y="114" width="28" height="12" rx="2" fill="#C9BB9E" stroke="#857659" stroke-width="1.2"/>
        <g ${STICK}><circle cx="156" cy="83" r="6.5" fill="#F6EFE4"/><path d="M156 90v14M156 104l-4 10M156 104l4 10M156 94l-8 6M156 94l8 6"/></g>
        <circle cx="153.8" cy="82" r="1.1" fill="#3C4654"/><circle cx="158.2" cy="82" r="1.1" fill="#3C4654"/><path d="M154 86q2 1.6 4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>
        <g ${STICK}><circle cx="196" cy="96.5" r="6" fill="#F6EFE4"/><path d="M196 103v13M196 116l-4 10M196 116l4 10M196 107l-7 5M196 107l7 5"/></g>
        <circle cx="193.9" cy="95.5" r="1" fill="#3C4654"/><circle cx="198.1" cy="95.5" r="1" fill="#3C4654"/><path d="M194.2 99.6q1.8 1.5 3.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>
        <g ${STICK}><circle cx="212" cy="96.5" r="6" fill="#F6EFE4"/><path d="M212 103v13M212 116l-4 10M212 116l4 10M212 107l-7 5M212 107l7 5"/></g>
        <circle cx="209.9" cy="95.5" r="1" fill="#3C4654"/><circle cx="214.1" cy="95.5" r="1" fill="#3C4654"/><path d="M210.2 99.6q1.8 1.5 3.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>
        <path d="M132 126h88" stroke="#9EBCE8" stroke-width="1.2" opacity=".7"/>
      </g>`
    : `<rect x="136" y="32" width="80" height="96" rx="8" fill="#FFF" opacity=".5" stroke="#9EBCE8" stroke-width="1.6" stroke-dasharray="6 5"/>
      <text x="176" y="92" text-anchor="middle" font-size="30" font-weight="900" fill="#9EBCE8">?</text>`;
  return `<svg viewBox="0 0 240 146" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs9-old" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3DC"/><stop offset=".6" stop-color="#F2E4C2"/><stop offset="1" stop-color="#E6D2A6"/></linearGradient>
      <linearGradient id="hs9-today" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F9FE"/><stop offset="1" stop-color="#DCEAF8"/></linearGradient>
      <linearGradient id="hs9-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6C9AC"/><stop offset=".55" stop-color="#C2B394"/><stop offset="1" stop-color="#A8987A"/></linearGradient>
      <linearGradient id="hs9-book" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D97E"/><stop offset=".55" stop-color="#EDC45E"/><stop offset="1" stop-color="#D9A83E"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="141" rx="100" ry="4.6" fill="#2A3A5E" opacity=".1"/>
    <rect x="14" y="8" width="100" height="128" rx="10" fill="url(#hs9-old)" stroke="#C2A45E" stroke-width="1.5"/>
    <ellipse cx="34" cy="16" rx="10" ry="2.6" fill="#fff" opacity=".3"/>
    <text x="64" y="24" text-anchor="middle" font-size="10.5" font-weight="900" fill="#8A6A2E">옛날</text>
    <path d="M28 64h34l-5 60H33z" fill="url(#hs9-stone)" stroke="#6E5E46" stroke-width="1.5"/>
    <path d="M33 78h24M31 94h26M30 110h25" stroke="#857659" stroke-width="1" opacity=".5"/>
    <rect x="25" y="59" width="40" height="7" rx="2" fill="#C9BB9E" stroke="#857659" stroke-width="1.2"/>
    <g ${STICK}><circle cx="45" cy="30" r="6.5" fill="#F6EFE4"/><path d="M45 37v12M45 49l-4 10M45 49l4 10M45 41l9-7M45 41l-8 5"/></g>
    <circle cx="42.8" cy="29" r="1.1" fill="#3C4654"/><circle cx="47.2" cy="29" r="1.1" fill="#3C4654"/><path d="M43 33.5h4" stroke="#3C4654" stroke-width="1.3"/>
    <path d="M39 21.5l3 4 3-5 3 5 3-4v6H39z" fill="#F2C24E" stroke="#B8860E" stroke-width="1.1"/>
    ${scroll(52, 28, 18)}
    ${scroll(72, 52, 24)}
    ${scroll(88, 72, -12)}
    ${scroll(68, 86, 40)}
    <g ${STICK}><circle cx="69.5" cy="102" r="5.2" fill="#F6EFE4"/><path d="M86 112 L74 104M86 112l-3 14M86 112l3 14M80 108l-1 10"/></g>
    <g ${STICK}><circle cx="90.5" cy="106" r="4.8" fill="#F6EFE4"/><path d="M106 115 L95 108M106 115l-3 11M106 115l3 11M100 111l-1 9"/></g>
    <path d="M20 126h88" stroke="#C2A45E" stroke-width="1.2" opacity=".6"/>
    <rect x="126" y="8" width="100" height="128" rx="10" fill="url(#hs9-today)" stroke="#9EBCE8" stroke-width="1.5"/>
    <ellipse cx="146" cy="16" rx="10" ry="2.6" fill="#fff" opacity=".4"/>
    <text x="176" y="24" text-anchor="middle" font-size="10.5" font-weight="900" fill="#2E5E94">오늘</text>
    ${today}
  </svg>`;
}

export function renderKingNope(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "오늘로 건너오기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = kingSvg(false);
  helper.innerHTML = "옛날 왕은 높은 단 위에서 <b>명령 두루마리</b>를 뿌리면 그만이었대요. 뭐든 마음대로! 그런데 오늘날 나라의 지도자는 마음대로 못 하는 일이 훨씬 많아요. 왜일까요?";
  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    fig.innerHTML = kingSvg(true);
    face("curious");
    helper.innerHTML = "오늘 카드에선 단이 낮아지고, 사람들은 엎드리는 대신 서서 지켜봐요. 그리고 지도자 머리 위, <b>커다란 책 한 권</b>! 지도자도 그 아래에 있네요. 오늘날, 나라를 움직이는 힘(권력)은 어디서 나올까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "국민에게서 나온다",
          "가장 힘센 사람에게서 나온다",
          "옛날부터 내려온 전통에서 나온다",
        ],
        good: "그래요! 오늘날 나라를 움직이는 힘은 <b>국민에게서</b> 나와요. 그래서 지도자도 규칙 아래에 있는 거죠. 이 답은 나라의 최고 규칙 첫 장에 또렷이 적혀 있답니다. 설계도를 열어 보러 가요!",
        bad: "힘센 사람도, 오래된 전통도 아니에요. 오늘날 그 힘은 <b>국민에게서</b> 나온답니다. 그래서 지도자도 커다란 책, 그러니까 나라의 최고 규칙 아래에 있는 거예요. 그 첫 장에 적힌 답을 설계도에서 확인하러 가요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: idiot의 어원 ══════════ */
function idiotSvg(marked: boolean): string {
  const mini = (x: number, y: number): string => `<g stroke="#3C4654" stroke-width="1.5" stroke-linecap="round" fill="none">
    <circle cx="${x}" cy="${y}" r="2.6" fill="#F6EFE4"/><path d="M${x} ${y + 2.6}v5M${x} ${y + 7.6}l-2.6 4.4M${x} ${y + 7.6}l2.6 4.4M${x} ${y + 4.6}l-3 2.2M${x} ${y + 4.6}l3 2.2"/></g>`;
  const pill = marked
    ? `<g class="hs8-noti">
        <rect x="159" y="64" width="22" height="15" rx="7.5" fill="#FFF6E0" stroke="#E2C26E" stroke-width="1.3"/>
        <text x="170" y="75.5" text-anchor="middle" font-size="10.5" font-weight="900" fill="#9A7A1E">?</text>
      </g>`
    : "";
  return `<svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs9-gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF4E0"/><stop offset="1" stop-color="#F6E4C0"/></linearGradient>
      <linearGradient id="hs9-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8DCA0"/><stop offset=".6" stop-color="#B0CC86"/><stop offset="1" stop-color="#9EBE72"/></linearGradient>
      <linearGradient id="hs9-col" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4EFE4"/><stop offset=".55" stop-color="#E0D6C2"/><stop offset="1" stop-color="#C9BBA0"/></linearGradient>
      <linearGradient id="hs9-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E09A6C"/><stop offset="1" stop-color="#B86E42"/></linearGradient>
      <linearGradient id="hs9-hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FAFD"/><stop offset="1" stop-color="#DCE6F0"/></linearGradient>
    </defs>
    <rect x="8" y="6" width="224" height="118" rx="10" fill="url(#hs9-gsky)"/>
    <path d="M8 124 Q56 62 112 124 Z" fill="url(#hs9-hill)" stroke="#7E9E52" stroke-width="1.4"/>
    <path d="M58 90V72" stroke="#8A6A3E" stroke-width="1.6"/>
    <path d="M58 72l12 4-12 4z" fill="#E8944E" stroke="#B86A2E" stroke-width="1"/>
    ${mini(46, 83)}
    ${mini(58, 81)}
    ${mini(70, 83)}
    <ellipse cx="104" cy="120" rx="1.7" ry="1" fill="#8A93A6" opacity=".55"/>
    <ellipse cx="94" cy="114" rx="1.7" ry="1" fill="#8A93A6" opacity=".55"/>
    <ellipse cx="84" cy="107" rx="1.7" ry="1" fill="#8A93A6" opacity=".55"/>
    <ellipse cx="76" cy="100" rx="1.7" ry="1" fill="#8A93A6" opacity=".55"/>
    <g ${STICK}><circle cx="116" cy="90" r="7" fill="#F6EFE4"/><path d="M116 97v15M116 112l-9 12M116 112l10 11M116 101l-8 6M116 101l9-4"/></g>
    <circle cx="113.6" cy="89" r="1.1" fill="#3C4654"/><circle cx="118.4" cy="89" r="1.1" fill="#3C4654"/><path d="M114 93.4q2 1.6 4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>
    <rect x="133" y="52" width="22" height="6" rx="1.5" fill="url(#hs9-col)" stroke="#B8A882" stroke-width="1.2"/>
    <rect x="136" y="58" width="16" height="58" fill="url(#hs9-col)" stroke="#B8A882" stroke-width="1.2"/>
    <path d="M140 60v54M144 60v54M148 60v54" stroke="#C9BBA0" stroke-width="1" opacity=".8"/>
    <rect x="133" y="116" width="22" height="6" rx="1.5" fill="url(#hs9-col)" stroke="#B8A882" stroke-width="1.2"/>
    <ellipse cx="202" cy="128" rx="26" ry="3" fill="#2A3A5E" opacity=".08"/>
    <path d="M178 90 L202 70 L226 90 Z" fill="url(#hs9-roof)" stroke="#96522E" stroke-width="1.4"/>
    <rect x="183" y="90" width="38" height="34" rx="2.5" fill="url(#hs9-hs)" stroke="#8A93A6" stroke-width="1.4"/>
    <ellipse cx="192" cy="94" rx="6" ry="1.8" fill="#fff" opacity=".4"/>
    <rect x="197" y="104" width="11" height="20" rx="2" fill="#C9A876" stroke="#8A6A3E" stroke-width="1.1"/>
    <ellipse cx="170" cy="128" rx="13" ry="2.6" fill="#2A3A5E" opacity=".12"/>
    <ellipse cx="116" cy="128" rx="14" ry="2.6" fill="#2A3A5E" opacity=".12"/>
    <g ${STICK}><circle cx="170" cy="94" r="7" fill="#F6EFE4"/><path d="M170 101v16M170 117l-5 7M170 117l5 7M170 105l-7 4 8 3M170 105l7 4-8 3"/></g>
    <path d="M8 124h224" stroke="#C2B49A" stroke-width="1.4"/>
    ${pill}
  </svg>`;
}

export function renderIdiotWord(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "이 단어의 고향 가 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = idiotSvg(false);
  helper.innerHTML = "'<b>idiot(이디어트)</b>'라는 영어 단어, 지금은 '바보'라는 뜻으로 쓰이죠. 그런데 이 단어의 고향은 아주 먼 옛날 그리스래요. 한번 가 볼까요?";
  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    fig.innerHTML = idiotSvg(true);
    face("curious");
    helper.innerHTML = "언덕 위 모임 장소로 걸어가는 사람, 그리고 등을 돌린 채 자기 집 앞에만 서 있는 사람, 그리스 사람들은 <b>등 돌린 쪽</b>을 '이디오테스'라고 불렀대요. 옛 그리스에서 이 말은 원래 어떤 사람을 가리켰을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "공동체의 일에 관심 없이 자기 일만 돌보는 사람",
          "머리가 나쁜 사람",
          "달리기가 느린 사람",
        ],
        good: "맞아요! 원래는 <b>공동체의 일에 관심을 끄고 자기 일만 돌보는 사람</b>을 가리키는 말이었어요. 그리고 이 무관심은 오늘날에도 민주주의의 큰 숙제랍니다. 왜 그런지 이번 시간에 들여다봐요!",
        bad: "머리도, 달리기도 아니에요. 옛 그리스에서 이 말은 <b>공동체의 일에 관심 없이 자기 일만 돌보는 사람</b>을 가리켰어요. 그 무관심이 오늘날에도 민주주의의 큰 숙제라는 것, 이번 시간에 들여다봐요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 편안한 교복의 비밀 ══════════ */
function uniformSvg(traced: boolean): string {
  const trace = traced
    ? `<g class="hs8-noti">
        <path d="M102 58H134" stroke="#E2932E" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M141 58l-9-5.4v10.8z" fill="#E2932E"/>
      </g>
      <g class="hs8-noti d2">
        <ellipse cx="120" cy="152" rx="52" ry="4.5" fill="#2A3A5E" opacity=".1"/>
        <ellipse cx="120" cy="136" rx="42" ry="9.5" fill="url(#hs9-table)" stroke="#6E4A26" stroke-width="1.5"/>
        <ellipse cx="106" cy="133.5" rx="12" ry="2.6" fill="#fff" opacity=".22"/>
        <path d="M92 142l-3 10M148 142l3 10" stroke="#6E4A26" stroke-width="2"/>
        <g ${STICK}><circle cx="74" cy="120" r="6" fill="#F6EFE4"/><path d="M74 126v10M74 130l8 4M74 130l-6 5"/></g>
        <circle cx="71.9" cy="119" r="1" fill="#3C4654"/><circle cx="76.1" cy="119" r="1" fill="#3C4654"/><path d="M72.2 123q1.8 1.5 3.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>
        <g ${STICK}><circle cx="166" cy="120" r="6" fill="#F6EFE4"/><path d="M166 126v10M166 130l-8 4M166 130l6 5"/></g>
        <circle cx="163.9" cy="119" r="1" fill="#3C4654"/><circle cx="168.1" cy="119" r="1" fill="#3C4654"/><path d="M164.2 123q1.8 1.5 3.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>
        <g ${STICK}><circle cx="120" cy="111" r="5" fill="#F6EFE4"/><path d="M120 116v9M120 120l7 3M120 120l-7 3"/></g>
        <circle cx="118.2" cy="110.2" r=".9" fill="#3C4654"/><circle cx="121.8" cy="110.2" r=".9" fill="#3C4654"/><path d="M118.4 113.6q1.6 1.3 3.2 0" stroke="#3C4654" stroke-width="1.1" fill="none"/>
        <g ${STICK}><circle cx="120" cy="153" r="5" fill="#F6EFE4"/><path d="M112 160q8-6 16 0"/></g>
      </g>`
    : "";
  return `<svg viewBox="0 0 240 162" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs9-jkt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E5E76"/><stop offset=".55" stop-color="#3A4A5E"/><stop offset="1" stop-color="#2A3A4C"/></linearGradient>
      <linearGradient id="hs9-swt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2DED2"/><stop offset=".55" stop-color="#A8CCBC"/><stop offset="1" stop-color="#8FB8A6"/></linearGradient>
      <radialGradient id="hs9-table" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#C89A5E"/><stop offset="1" stop-color="#84582A"/></radialGradient>
    </defs>
    <path d="M26 16h188" stroke="#8A93A6" stroke-width="3" stroke-linecap="round"/>
    <circle cx="26" cy="16" r="2.4" fill="#5E6A7E"/><circle cx="214" cy="16" r="2.4" fill="#5E6A7E"/>
    <path d="M72 26v-4q0-6 6-6" stroke="#5E6A7E" stroke-width="1.8" fill="none"/>
    <path d="M168 26v-4q0-6 6-6" stroke="#5E6A7E" stroke-width="1.8" fill="none"/>
    <path d="M54 42 Q54 34 63 31 L72 28 L81 31 Q90 34 90 42 L92 86 Q92 90 88 90 H56 Q52 90 52 86 Z" fill="url(#hs9-jkt)" stroke="#16202E" stroke-width="1.5"/>
    <path d="M65 31 L72 48 L79 31 Z" fill="#F7FAFD" stroke="#C4CDD8" stroke-width="1"/>
    <path d="M65 31 L72 48 M79 31 L72 48" stroke="#16202E" stroke-width="1.4"/>
    <path d="M72 33.5l2.6 3.2-1.6 2.6 2.6 13-3.6 5-3.6-5 2.6-13-1.6-2.6z" fill="#7E93AE" stroke="#46586E" stroke-width="1"/>
    <circle cx="80" cy="62" r="1.2" fill="#C4CDD8"/><circle cx="80" cy="70" r="1.2" fill="#C4CDD8"/>
    <path d="M58 44 L56 88 M86 44 L88 88" stroke="#16202E" stroke-width="1" opacity=".4"/>
    <ellipse cx="63" cy="40" rx="7" ry="2.6" fill="#fff" opacity=".16"/>
    <text x="72" y="104" text-anchor="middle" font-size="9.5" font-weight="800" fill="#5E6A7E">정장형</text>
    <path d="M148 44 Q148 36 158 33 L164 30 H172 L178 33 Q188 36 188 44 L190 84 Q190 89 185 89 H151 Q146 89 146 84 Z" fill="url(#hs9-swt)" stroke="#4E7E6C" stroke-width="1.5"/>
    <path d="M163 31q5 5 10 0" stroke="#4E7E6C" stroke-width="1.6" fill="none"/>
    <path d="M148 82h40" stroke="#4E7E6C" stroke-width="1.2" opacity=".7"/>
    <path d="M156 82.5v5M168 83v5M180 82.5v5" stroke="#4E7E6C" stroke-width="1" opacity=".5"/>
    <path d="M152 46 L150 86 M184 46 L186 86" stroke="#4E7E6C" stroke-width="1" opacity=".4"/>
    <ellipse cx="158" cy="42" rx="7" ry="2.6" fill="#fff" opacity=".28"/>
    <text x="168" y="104" text-anchor="middle" font-size="9.5" font-weight="800" fill="#5E6A7E">활동복형</text>
    ${trace}
  </svg>`;
}

export function renderUniformDay(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "바뀐 이유 추적하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = uniformSvg(false);
  helper.innerHTML = "요즘 학교엔 <b>편안한 교복</b>이 늘고 있어요. 몸에 딱 붙는 정장형 대신 활동하기 좋은 옷, 어느 날 갑자기 바뀐 걸까요?";
  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    fig.innerHTML = uniformSvg(true);
    face("curious");
    helper.innerHTML = "두 옷 사이에 숨어 있던 장면, <b>원탁</b>에 학생도 어른도 함께 둘러앉아 있었네요. '편안한 교복'은 누가 만들었을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "학생·학부모·교사·시민이 함께 토론해 정했다",
          "교복 회사가 정해서 통보했다",
          "어느 날 하늘에서 뚝 떨어졌다",
        ],
        good: "정답! 학생·학부모·교사·시민이 한자리에 모여 <b>토론으로 합의</b>를 만든 결과래요. 그렇게 여럿이 모여 이야기하는 자리에는 이름이 있답니다. 이번 시간에 배워요!",
        bad: "회사의 통보도, 하늘에서 떨어진 것도 아니에요. 학생·학부모·교사·시민이 <b>함께 토론해 합의</b>를 만든 결과랍니다. 그렇게 여럿이 모여 이야기하는 자리에 붙은 이름, 이번 시간에 배워요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ── 서브 디스패처(hookSoc8 문법 — 모르는 장면이면 null) ── */
export function renderSoc9(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "seatwar") return renderSeatWar(scene, helper, s, finish, face);
  if (name === "oneway") return renderOneWay(scene, helper, s, finish, face);
  if (name === "lotclass") return renderLotClass(scene, helper, s, finish, face);
  if (name === "hundredmen") return renderHundredMen(scene, helper, s, finish, face);
  if (name === "kingnope") return renderKingNope(scene, helper, s, finish, face);
  if (name === "idiotword") return renderIdiotWord(scene, helper, s, finish, face);
  if (name === "uniformday") return renderUniformDay(scene, helper, s, finish, face);
  return null;
}

/* === 필요한 CSS (soc.css에 붙일 것) ===
   hs8-frame·hs8-btn·hs8-noti(+.d2)·hs8-ring은 완전 동일 스타일이라 그대로 재사용 —
   아래 두 애니메이션만 신규다(Ⅸ 훅 섹션으로 soc.css 끝에 추가).

.hs9-shake { animation: hs9Shake .55s var(--ease) infinite; transform-box: fill-box; transform-origin: center bottom; }
@keyframes hs9Shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-3deg) translateX(-1px); }
  75% { transform: rotate(3deg) translateX(1px); }
}
.hs9-drop { animation: hs9Drop .5s var(--spring-bounce) backwards; transform-box: fill-box; transform-origin: center top; }
@keyframes hs9Drop {
  0% { opacity: 0; transform: translateY(-26px); }
  70% { opacity: 1; transform: translateY(2px); }
  100% { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .hs9-shake, .hs9-drop { animation: none; }
}
=== */

