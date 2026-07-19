// hookSoc7 — 사회 Ⅶ(인간과 사회생활) 훅 장면 7종. hook.ts가 renderSoc7 서브 디스패처
// (hookSoc6 문법 — 모르는 장면이면 null)로 위임한다. 파운드리 SVG 문법(근-동조 그라데이션+
// 키라이트+접촉 그림자+최암색 외곽선) 준수, 스틱맨만 손그림 라인. CSS 접두사 hs7-.
//   twinstory     L1 — 일란성 쌍둥이 입양 실화(미래엔 생각열기): 30년 후, 인사법이 다르다
//   hiddenteacher L2 — 학교에서 배운 적 없는 유행 춤을 나는 어떻게 알까(대중 매체 = 숨은 선생님)
//   profileme     L3 — 새 프로필 "나를 한 줄로" 칸에서 커서만 깜빡(자아 정체성)
//   nametags      L4 — 하루 동안 내 몸에 붙는 이름표들(첫째·학생·합창 부원 = 여러 지위)
//   doubleday     L5 — 토요일 오후 2시, 알림 두 개가 동시에 울린다(역할 갈등의 예감)
//   vinestangle   L6 — 칡과 등나무가 엉키면 생기는 말(갈등의 어원 — 미래엔 생각열기)
//   dollshelf     L7 — 장난감 가게의 새 인형들: 휠체어·지팡이·의수(두 책 공통 완구 소재)
// 민감 가드: 쌍둥이·입양은 사실 서술만(비극 연출 금지), 스틱맨 성별 표지 없음, 인형 장면은
// 존중 톤(신기해하기가 아니라 반가워하기), 예측 choices[0]=정답·good≠bad 공용 규칙.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

/* ══════════ L1: 쌍둥이 이야기 ══════════ */
function twinSvg(grown: boolean): string {
  const baby = (x: number): string => `
    <g ${STICK}>
      <circle cx="${x}" cy="96" r="7" fill="#F6EFE4"/>
      <path d="M${x} 103v9M${x} 106l-5 4M${x} 106l5 4M${x} 112l-4 6M${x} 112l4 6"/>
    </g>
    <circle cx="${x - 2.4}" cy="95" r="1" fill="#3C4654"/><circle cx="${x + 2.4}" cy="95" r="1" fill="#3C4654"/>
    <path d="M${x - 2} 99q2 1.4 4 0" stroke="#3C4654" stroke-width="1.4" stroke-linecap="round" fill="none"/>`;
  const grownL = `
    <g ${STICK}>
      <circle cx="66" cy="74" r="8" fill="#F6EFE4"/>
      <path d="M66 82q1 8-3 14l-4 6M66 82q0 10 2 16M63 96l-5 14M67 98l3 13M63 90l-11 4M64 87l14 5"/>
    </g>
    <circle cx="63.4" cy="73" r="1.1" fill="#3C4654"/><circle cx="68.6" cy="73" r="1.1" fill="#3C4654"/>
    <path d="M64 77.5q2 1.5 4 0" stroke="#3C4654" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <ellipse cx="47" cy="99" rx="7" ry="4.6" fill="url(#hs7-bowl)" stroke="#8A6A3E" stroke-width="1.4"/>
    <path d="M43 97q4-2.6 8 0" stroke="#FFFFFF" stroke-width="1.6" opacity=".7"/>
    <path d="M50 92l3-5M53 92l3-5" stroke="#8A93A6" stroke-width="1.4" stroke-linecap="round"/>`;
  const grownR = `
    <g ${STICK}>
      <circle cx="174" cy="74" r="8" fill="#F6EFE4"/>
      <path d="M174 82v18M174 100l-6 13M174 100l6 13M174 88l-12-6M174 88l12-9"/>
    </g>
    <circle cx="171.4" cy="73" r="1.1" fill="#3C4654"/><circle cx="176.6" cy="73" r="1.1" fill="#3C4654"/>
    <path d="M172 77.5q2 1.8 4 0" stroke="#3C4654" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <path d="M189 76l4-3M190 79l5-1" stroke="#8A93A6" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>
    <g stroke="#7E8AA0" stroke-width="1.6" stroke-linecap="round">
      <path d="M196 96v10M193 96v4M199 96v4M196 100v0"/>
      <path d="M193 100q3 2 6 0" fill="none"/>
    </g>`;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs7-photo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF8F1"/><stop offset="1" stop-color="#EDE6D6"/></linearGradient>
      <radialGradient id="hs7-bowl" cx=".4" cy=".35" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F3EBDA"/><stop offset="1" stop-color="#DCCDB0"/></radialGradient>
      <linearGradient id="hs7-tape" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2DFA0"/><stop offset="1" stop-color="#E3C878"/></linearGradient>
    </defs>
    <rect x="8" y="10" width="224" height="148" rx="10" fill="url(#hs7-photo)" stroke="#C9BC9E" stroke-width="1.6"/>
    <rect x="99" y="4" width="42" height="13" rx="3" fill="url(#hs7-tape)" opacity=".9"/>
    <line x1="120" y1="22" x2="120" y2="150" stroke="#C9BC9E" stroke-width="1.2" stroke-dasharray="4 4" opacity=".8"/>
    ${grown
      ? `${grownL}${grownR}
        <ellipse cx="64" cy="115" rx="13" ry="2.4" fill="#2A3A5E" opacity=".1"/>
        <ellipse cx="176" cy="115" rx="13" ry="2.4" fill="#2A3A5E" opacity=".1"/>
        <path d="M40 132q26 6 52 0M148 132q26 6 52 0" stroke="#C9BC9E" stroke-width="1.4" opacity=".7"/>`
      : `${baby(64)}${baby(176)}
        <ellipse cx="64" cy="121" rx="11" ry="2.2" fill="#2A3A5E" opacity=".1"/>
        <ellipse cx="176" cy="121" rx="11" ry="2.2" fill="#2A3A5E" opacity=".1"/>
        <path d="M52 128h24M164 128h24" stroke="#C9BC9E" stroke-width="1.4" opacity=".8"/>`}
  </svg>`;
}

export function renderTwinStory(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs7-frame" });
  const btn = el("button", { class: "hs7-btn", attrs: { type: "button" }, text: "30년 후, 다시 만나기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "실화예요. 한국에서 태어난 <b>일란성 쌍둥이 자매</b> — 같은 날, 같은 유전자로 태어났지만 한 명이 어릴 때 미국으로 입양됐어요. 30년 뒤 두 사람이 다시 만난다면?";
  fig.innerHTML = twinSvg(false);

  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    fig.innerHTML = twinSvg(true);
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML =
      "생김새는 여전히 꼭 닮았는데 — 한 명은 <b>고개 숙여 인사하고 김치를 찾고</b>, 한 명은 <b>손 흔들어 인사하고 포크를 들어요</b>. 쓰는 말도 다르죠. 왜 이렇게 달라졌을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "자란 사회에서 보고 배운 것이 서로 달라서",
          "나이가 들면서 유전자가 서서히 변해서",
          "쌍둥이라도 원래 성격은 반대로 태어나서",
        ],
        good: "정확해요! 유전자는 그대로인데 <b>배운 것</b>이 달랐던 거예요 — 언어도 인사법도 식사 예절도, 태어난 뒤 사회에서 배운 것들이죠. 그 배움의 정체를 파헤치러 가요!",
        bad: "유전자나 타고난 성격의 문제라면 생김새처럼 똑같아야 해요 — 달라진 건 언어·예절처럼 <b>자란 사회에서 배운 것들</b>이었어요. 그 배움의 정체를 파헤치러 가요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L2: 숨은 선생님 ══════════ */
function danceSvg(dancing: boolean): string {
  const man = dancing
    ? `<g ${STICK}>
        <circle cx="86" cy="52" r="9" fill="#F6EFE4"/>
        <path d="M86 61q3 10-2 20M86 66l-15-8M86 66l13-12M84 81l-12 12M84 81l13 8-2 12"/>
      </g>
      <circle cx="83" cy="50.6" r="1.1" fill="#3C4654"/><circle cx="89" cy="50.6" r="1.1" fill="#3C4654"/>
      <path d="M84 55.5q2.4 2 4.8 0" stroke="#3C4654" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M64 46l-5-3M104 42l5-5M70 96l-6 4" stroke="#8FA2C4" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`
    : `<g ${STICK}>
        <circle cx="86" cy="56" r="9" fill="#F6EFE4"/>
        <path d="M86 65v22M86 71l-11 7M86 71l11 7M86 87l-9 14M86 87l9 14"/>
      </g>
      <circle cx="83" cy="55" r="1.1" fill="#3C4654"/><circle cx="89" cy="55" r="1.1" fill="#3C4654"/>
      <path d="M84 60q2.4 1.4 4.8 0" stroke="#3C4654" stroke-width="1.4" stroke-linecap="round" fill="none"/>`;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs7-room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4EFE6"/><stop offset="1" stop-color="#E6DCC8"/></linearGradient>
      <linearGradient id="hs7-ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#39445C"/><stop offset="1" stop-color="#232B40"/></linearGradient>
      <linearGradient id="hs7-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD8F2"/><stop offset="1" stop-color="#4FA8D8"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="url(#hs7-room)"/>
    <path d="M6 122h228" stroke="#C9BC9E" stroke-width="1.4" opacity=".7"/>
    <ellipse cx="86" cy="118" rx="17" ry="3" fill="#2A3A5E" opacity=".11"/>
    ${man}
    <g>
      <rect x="150" y="46" width="46" height="76" rx="8" fill="url(#hs7-ph)" stroke="#141B2C" stroke-width="1.6"/>
      <rect x="155" y="54" width="36" height="56" rx="4" fill="url(#hs7-scr)"/>
      <g stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".95">
        <circle cx="173" cy="70" r="4.4" fill="#FFFFFF" opacity=".95"/>
        <path d="M173 75q2 5-1 9M173 78l-6-3M173 78l6-5M172 84l-5 6M172 84l6 4"/>
      </g>
      <ellipse cx="160" cy="58" rx="6" ry="2.6" fill="#FFFFFF" opacity=".35" transform="rotate(-24 160 58)"/>
      <ellipse cx="173" cy="126" rx="24" ry="3" fill="#2A3A5E" opacity=".12"/>
    </g>
    ${dancing ? `<path d="M118 40q4-8 12-8M112 58q6-2 10-8M126 84q6 0 10-6" stroke="#E8940A" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/>` : ""}
  </svg>`;
}

export function renderHiddenTeacher(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs7-frame" });
  const btn = el("button", { class: "hs7-btn", attrs: { type: "button" }, text: "따라 춰 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "요즘 유행하는 <b>챌린지 춤</b>, 학교 수업에서 배운 적도 없는데… 화면 속 동작을 보고 따라 춰 볼까요?";
  fig.innerHTML = danceSvg(false);

  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    fig.innerHTML = danceSvg(true);
    btn.classList.add("done");
    btn.disabled = true;
    face("smile");
    helper.innerHTML =
      "완벽하게 춰냈어요! 그런데 이상하죠 — 학교 선생님도, 가족도 가르쳐 준 적 없는 이 춤을 <b>누가 가르쳐 준 걸까요?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "손안의 화면 — 영상·방송 같은 대중 매체가 가르쳐 줬다",
          "타고난 춤 실력이 저절로 나온 것이다",
          "아무에게도 배우지 않고 우연히 똑같이 춘 것이다",
        ],
        good: "맞아요! 화면 너머의 <b>대중 매체</b>도 우리를 가르치는 어엿한 선생님이에요 — 학교·가족 말고도 나를 가르쳐 온 곳들을 전부 찾아 나서 봐요!",
        bad: "우연도 재능도 아니에요 — 동작 하나하나를 <b>화면을 보며 배웠죠</b>. 영상·방송 같은 대중 매체도 우리를 가르치는 선생님이랍니다. 나를 가르쳐 온 곳들을 전부 찾아 나서 봐요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 나를 한 줄로 ══════════ */
function profileSvg(tried: boolean): string {
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs7-app" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBFCFF"/><stop offset="1" stop-color="#E9EEF6"/></linearGradient>
      <radialGradient id="hs7-ava" cx=".4" cy=".35" r=".85"><stop offset="0" stop-color="#BFD8F2"/><stop offset="1" stop-color="#8FB4DC"/></radialGradient>
    </defs>
    <rect x="34" y="6" width="172" height="156" rx="14" fill="url(#hs7-app)" stroke="#B9C6D8" stroke-width="1.6"/>
    <circle cx="120" cy="44" r="21" fill="url(#hs7-ava)" stroke="#6E8EB4" stroke-width="1.6"/>
    <g ${STICK}>
      <circle cx="120" cy="38" r="6.4" fill="#F6EFE4"/>
      <path d="M120 44q0 6-1 9M113 52q6-4 14 0"/>
    </g>
    <circle cx="118" cy="37" r=".9" fill="#3C4654"/><circle cx="122" cy="37" r=".9" fill="#3C4654"/>
    <rect x="56" y="76" width="128" height="16" rx="8" fill="#EDF2F9" stroke="#C4D0E0" stroke-width="1.3"/>
    <rect x="62" y="80" width="46" height="8" rx="4" fill="#7E93B4" opacity=".8"/>
    <rect x="56" y="102" width="128" height="34" rx="10" fill="#FFFFFF" stroke="#3182F6" stroke-width="1.8"/>
    ${tried
      ? `<g class="hs7-thought">
          <rect x="63" y="109" width="52" height="9" rx="4.5" fill="#D8E4F4"/>
          <rect x="63" y="122" width="70" height="9" rx="4.5" fill="#D8E4F4"/>
          <path d="M118 111l6 5-6 5M139 124l6 5" stroke="#C0392E" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".8"/>
        </g>
        <path d="M170 96q10-4 12-12" stroke="#8FA2C4" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".7"/>`
      : `<rect class="hs7-caret" x="64" y="108" width="2.6" height="22" rx="1.3" fill="#3182F6"/>`}
    <ellipse cx="120" cy="158" rx="52" ry="3" fill="#2A3A5E" opacity=".08"/>
  </svg>`;
}

export function renderProfileMe(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs7-frame" });
  const btn = el("button", { class: "hs7-btn", attrs: { type: "button" }, text: "한 줄 써 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "새 앱에 프로필을 만들어요. 별명 칸은 금방 채웠는데 — <b>'나를 한 줄로 소개하기'</b> 칸에서 커서만 깜빡깜빡… 일단 써 볼까요?";
  fig.innerHTML = profileSvg(false);

  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    fig.innerHTML = profileSvg(true);
    btn.classList.add("done");
    btn.disabled = true;
    face("curious");
    helper.innerHTML =
      "'활발한 사람'… 지웠어요. '조용한 편'… 그것도 아닌 것 같고. 쓰고 지우기를 반복 — <b>나를 한 줄로 쓰는 게 왜 이렇게 어려울까요?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "내가 어떤 사람인지 아직 나도 뚜렷하게 알지 못해서",
          "글씨를 예쁘게 쓰는 법을 안 배워서",
          "소개할 만한 거리가 하나도 없어서",
        ],
        good: "바로 그거예요. 나의 성격·좋아하는 것·소중히 여기는 것 — <b>나를 뚜렷이 아는 일</b>은 생각보다 어렵죠. 그 '뚜렷이 아는 상태'에 이름이 있어요. 지금부터 찾아가 봐요!",
        bad: "글씨나 거리의 문제가 아니에요 — 쓸 거리는 많은데 '진짜 나다운 한 줄'이 안 골라졌던 거죠. 나를 뚜렷이 아는 일은 누구에게나 어려워요. 그 '뚜렷이 아는 상태'의 이름을 찾아가 봐요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L4: 이름표 붙는 하루 ══════════ */
function tagsSvg(stage: number): string {
  const tags = [
    { y: 64, label: "첫째", color: "#C0871C", on: stage >= 1 },
    { y: 82, label: "학생", color: "#2E8AC0", on: stage >= 2 },
    { y: 100, label: "합창 부원", color: "#862E9C", on: stage >= 3 },
  ];
  const scenes = ["집", "학교", "동아리실"][Math.max(0, Math.min(2, stage - 1))] ?? "집";
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs7-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F6FB"/><stop offset="1" stop-color="#E2E9F2"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="url(#hs7-day)"/>
    ${stage > 0 ? `<g><rect x="16" y="18" width="76" height="20" rx="10" fill="rgba(25,31,40,.78)"/><text x="54" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="#FFFFFF">지금 있는 곳: ${scenes}</text></g>` : ""}
    <ellipse cx="120" cy="140" rx="20" ry="3" fill="#2A3A5E" opacity=".12"/>
    <g ${STICK}>
      <circle cx="120" cy="46" r="10" fill="#F6EFE4"/>
      <path d="M120 56v52M120 66l-16 10M120 66l16 10M120 108l-12 22M120 108l12 22"/>
    </g>
    <circle cx="116.6" cy="44.6" r="1.2" fill="#3C4654"/><circle cx="123.4" cy="44.6" r="1.2" fill="#3C4654"/>
    <path d="M117 50q3 2 6 0" stroke="#3C4654" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    ${tags
      .map(
        (t) => `<g class="hs7-tag ${t.on ? "on" : ""}">
      <path d="M132 ${t.y}h8" stroke="${t.color}" stroke-width="1.6" stroke-dasharray="2 2.4" opacity="${t.on ? ".9" : "0"}"/>
      <rect x="141" y="${t.y - 9}" width="58" height="18" rx="6" fill="${t.on ? t.color : "#D5DCE6"}" stroke="${t.on ? "#3A2A10" : "#B4BECC"}" stroke-opacity=".25" stroke-width="1.2"/>
      <text x="170" y="${t.y + 4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${t.on ? "#FFFFFF" : "#8A94A4"}">${t.on ? t.label : "?"}</text>
    </g>`,
      )
      .join("")}
  </svg>`;
}

export function renderNameTags(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs7-frame" });
  const btn = el("button", { class: "hs7-btn", attrs: { type: "button" }, text: "하루 시작하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "평범한 토요일 아침이에요. 오늘 하루, 내 몸에 <b>보이지 않는 이름표</b>가 몇 개나 붙는지 세어 볼 거예요. 하루를 시작해 봐요!";
  fig.innerHTML = tagsSvg(0);

  let stage = 0;
  let timer = 0;
  const texts = [
    "아침 식탁 — 동생이 저를 부르네요. 집에서 나는 <b>첫째</b>! 이름표 하나가 철컥 붙었어요. 계속 가 볼까요?",
    "학교 합창 대회 안내문을 받았어요. 교문을 지나는 순간 나는 <b>학생</b> — 두 번째 이름표! 방과 후엔 어디로 가죠?",
    "동아리실 문을 여는 순간 — <b>합창 부원</b> 이름표까지! 하루 만에 세 개가 붙었네요. 그런데 이 중에서, <b>태어날 때 이미 붙어 있던</b> 이름표는 뭘까요?",
  ];
  const labels = ["집으로 가기", "학교 가기", "동아리실 가기"];
  btn.addEventListener("click", () => {
    if (stage >= 3) return;
    stage += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = tagsSvg(stage);
    helper.innerHTML = texts[stage - 1];
    if (stage < 3) {
      btn.textContent = labels[stage];
    } else {
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "첫째 — 내 의지와 상관없이 태어나면서 주어졌다",
            "학생 — 사람은 태어날 때부터 학생이다",
            "합창 부원 — 저절로 붙는 이름표다",
          ],
          good: "정확해요! <b>첫째</b>는 내가 고른 적 없이 태어나면서 주어진 이름표죠. 학생·합창 부원은 입학하고 가입하며 <b>얻은</b> 이름표고요 — 이 두 종류의 이름표에 각각 이름이 있답니다!",
          bad: "학생은 입학해서, 합창 부원은 가입해서 얻은 이름표예요 — 태어나는 순간 이미 붙어 있던 건 <b>첫째</b>뿐이죠. '주어진 이름표'와 '얻은 이름표', 이 두 종류의 이름을 배우러 가요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L5: 겹친 토요일 ══════════ */
function doubleSvg(fired: boolean): string {
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs7-ph2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#39445C"/><stop offset="1" stop-color="#232B40"/></linearGradient>
      <linearGradient id="hs7-scr2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F9FE"/><stop offset="1" stop-color="#DEE7F2"/></linearGradient>
    </defs>
    <ellipse cx="66" cy="146" rx="18" ry="3" fill="#2A3A5E" opacity=".12"/>
    <g ${STICK}>
      <circle cx="66" cy="62" r="10" fill="#F6EFE4"/>
      <path d="M66 72v42M66 82l-14 8M66 82l16-4 12 6M66 114l-11 22M66 114l11 22"/>
    </g>
    <circle cx="62.6" cy="60.6" r="1.2" fill="#3C4654"/><circle cx="69.4" cy="60.6" r="1.2" fill="#3C4654"/>
    ${fired
      ? `<path d="M62 69q4-3 8 0" stroke="#3C4654" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <path d="M78 48q3-4 3-8" stroke="#5FA8E8" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <circle cx="82" cy="36" r="2.4" fill="#5FA8E8"/>`
      : `<path d="M63 67q3 1.6 6 0" stroke="#3C4654" stroke-width="1.5" stroke-linecap="round" fill="none"/>`}
    <rect x="98" y="20" width="118" height="128" rx="12" fill="url(#hs7-ph2)" stroke="#141B2C" stroke-width="1.8"/>
    <rect x="106" y="30" width="102" height="108" rx="7" fill="url(#hs7-scr2)"/>
    <text x="157" y="47" text-anchor="middle" font-size="11" font-weight="800" fill="#39445C">토요일</text>
    <text x="157" y="60" text-anchor="middle" font-size="9.5" fill="#7E8AA0">오후 2시</text>
    ${fired
      ? `<g class="hs7-noti"><rect x="112" y="68" width="90" height="28" rx="7" fill="#FFFFFF" stroke="#3182F6" stroke-width="1.6"/>
          <circle cx="124" cy="82" r="6" fill="#EAF2FE"/><path d="M121.6 82l1.8 1.8 3.2-3.6" stroke="#3182F6" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          <text x="134" y="79" font-size="8.6" font-weight="800" fill="#26324A">합창 대회 마지막 연습</text>
          <text x="134" y="90" font-size="8" fill="#7E8AA0">우리 반 · 반주 담당</text></g>
        <g class="hs7-noti d2"><rect x="112" y="102" width="90" height="28" rx="7" fill="#FFFFFF" stroke="#E8940A" stroke-width="1.6"/>
          <circle cx="124" cy="116" r="6" fill="#FEF4E2"/><path d="M124 112v4l3 2" stroke="#E8940A" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          <text x="134" y="113" font-size="8.6" font-weight="800" fill="#26324A">할머니 칠순 잔치</text>
          <text x="134" y="124" font-size="8" fill="#7E8AA0">우리 가족 · 손주</text></g>`
      : `<rect x="112" y="68" width="90" height="62" rx="7" fill="#EDF2F9" opacity=".6"/>
        <text x="157" y="102" text-anchor="middle" font-size="9" fill="#9AA6B8">일정 확인 전</text>`}
  </svg>`;
}

export function renderDoubleDay(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs7-frame" });
  const btn = el("button", { class: "hs7-btn", attrs: { type: "button" }, text: "토요일 일정 확인하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "드디어 주말! 그런데 폰이 <b>드르륵, 드르륵</b> — 두 번 울렸어요. 토요일 일정을 확인해 볼까요?";
  fig.innerHTML = doubleSvg(false);

  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    fig.innerHTML = doubleSvg(true);
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML =
      "<b>합창 대회 마지막 연습</b>과 <b>할머니 칠순 잔치</b>가 — 둘 다 토요일 오후 2시?! 몸은 하나인데 두 곳에서 동시에 나를 불러요. 왜 이런 곤란이 생긴 걸까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "내가 여러 지위를 갖고 있어서 — 각 지위의 역할이 동시에 나를 불러서",
          "달력 앱이 고장 나서 일정이 잘못 표시돼서",
          "내가 게을러서 일정을 미리 정리하지 않아서",
        ],
        good: "정확해요! 반주 담당(우리 반)이자 손주(우리 가족) — <b>여러 지위</b>를 가진 사람에겐 역할들이 동시에 몰려올 수 있어요. 이 곤란함을 직접 겪으며 이름을 붙여 봐요!",
        bad: "앱도 게으름도 범인이 아니에요 — 두 일정 모두 진짜고, 내가 <b>여러 지위</b>(반주 담당·손주)를 가졌기에 역할이 동시에 몰려온 거죠. 이 곤란함을 직접 겪으며 이름을 붙여 봐요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 칡과 등나무 ══════════ */
function vineSvg(grown: boolean): string {
  const pole = `<rect x="116" y="26" width="8" height="112" rx="3" fill="url(#hs7-pole)" stroke="#5E4322" stroke-width="1.4"/>`;
  const vineL = grown
    ? `<path class="hs7-vine" d="M60 138q34-10 44-30t8-34q-2-14 8-22" stroke="#2E8A4C" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M84 116l-7-1M98 96l-8-3M104 76l-8-2" stroke="#2E8A4C" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="75" cy="117" rx="4.6" ry="2.6" fill="#3FA764" transform="rotate(-30 75 117)"/>
      <ellipse cx="89" cy="95" rx="4.6" ry="2.6" fill="#3FA764" transform="rotate(-38 89 95)"/>`
    : `<path d="M60 138q12-4 18-10" stroke="#2E8A4C" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const vineR = grown
    ? `<path class="hs7-vine d2" d="M180 138q-34-10-44-30t-8-34q2-14-8-22" stroke="#6E4FB8" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M156 116l7-1M142 96l8-3M136 76l8-2" stroke="#6E4FB8" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="165" cy="117" rx="4.6" ry="2.6" fill="#8A6BD0" transform="rotate(30 165 117)"/>
      <ellipse cx="151" cy="95" rx="4.6" ry="2.6" fill="#8A6BD0" transform="rotate(38 151 95)"/>`
    : `<path d="M180 138q-12-4-18-10" stroke="#6E4FB8" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const knot = grown
    ? `<g class="hs7-knot">
        <path d="M108 52q12-10 24 0t-24 10q-12-6 0-14" stroke="#2E8A4C" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M132 52q-12-10-24 0t24 10q12-6 0-14" stroke="#6E4FB8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>
      </g>
      <g class="hs7-hanja">
        <rect x="26" y="24" width="34" height="24" rx="7" fill="rgba(25,31,40,.82)"/>
        <text x="43" y="41" text-anchor="middle" font-size="13" font-weight="700" fill="#8FE8B0">葛</text>
        <rect x="180" y="24" width="34" height="24" rx="7" fill="rgba(25,31,40,.82)"/>
        <text x="197" y="41" text-anchor="middle" font-size="13" font-weight="700" fill="#C9AEF6">藤</text>
      </g>`
    : "";
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs7-field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFF6EC"/><stop offset="1" stop-color="#DCEAD4"/></linearGradient>
      <linearGradient id="hs7-pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B98D54"/><stop offset=".5" stop-color="#96682F"/><stop offset="1" stop-color="#6E4A1E"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="url(#hs7-field)"/>
    <path d="M6 138q60-6 114 0t114 0" stroke="#B8CBA0" stroke-width="1.6" opacity=".8"/>
    <ellipse cx="120" cy="141" rx="30" ry="3.4" fill="#2A3A5E" opacity=".1"/>
    ${pole}${vineL}${vineR}${knot}
  </svg>`;
}

export function renderVineTangle(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs7-frame" });
  const btn = el("button", { class: "hs7-btn", attrs: { type: "button" }, text: "덩굴 자라게 하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "기둥 하나에 덩굴 두 포기를 심었어요. 왼쪽은 <b>칡</b>, 오른쪽은 <b>등나무</b> — 그런데 이 둘, 감아 올라가는 <b>방향이 반대</b>래요. 같이 자라면 어떻게 될까요?";
  fig.innerHTML = vineSvg(false);

  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    fig.innerHTML = vineSvg(true);
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML =
      "반대로 감아 올라가던 두 덩굴이 한가운데서 <b>단단히 엉켜</b> 버렸어요! 칡 갈(葛), 등나무 등(藤) — 이 두 글자를 붙이면 우리가 아주 잘 아는 말이 돼요. 뭘까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "갈등 — 서로 엉켜 부딪치는 상황",
          "협동 — 힘을 모아 함께 오르는 것",
          "성장 — 쑥쑥 크는 것",
        ],
        good: "정답! <b>갈등(葛藤)</b>은 칡과 등나무가 엉키듯, 서로 다른 생각·목표가 부딪쳐 엉키는 상황이라는 뜻이에요. 우리 사회의 엉킨 덩굴들을 살피러 가요!",
        bad: "두 덩굴의 모습을 다시 봐요 — 함께 오르지도, 시원하게 자라지도 못하고 <b>엉켜서 부딪치고</b> 있죠. 칡 갈(葛)+등나무 등(藤) = <b>갈등</b>! 우리 사회의 엉킨 덩굴들을 살피러 가요!",
        onDone: finish,
      });
    }, 1100);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 새 인형들 ══════════ */
function dollSvg(revealed: boolean): string {
  const shelf = (y: number): string => `<rect x="20" y="${y}" width="200" height="5" rx="2.5" fill="url(#hs7-wood)" stroke="#8A6034" stroke-width="1"/>`;
  const doll = (x: number, y: number, kind: string, on: boolean): string => {
    const base = `<g ${STICK} opacity="${on ? 1 : 0.92}">
      <circle cx="${x}" cy="${y - 26}" r="6" fill="#F6EFE4"/>
      <path d="M${x} ${y - 20}v12M${x} ${y - 16}l-6 4M${x} ${y - 16}l6 4M${x} ${y - 8}l-4 8M${x} ${y - 8}l4 8"/>
    </g>
    <circle cx="${x - 2}" cy="${y - 27}" r=".9" fill="#3C4654"/><circle cx="${x + 2}" cy="${y - 27}" r=".9" fill="#3C4654"/>
    <path d="M${x - 2} ${y - 23.6}q2 1.4 4 0" stroke="#3C4654" stroke-width="1.2" stroke-linecap="round" fill="none"/>`;
    if (kind === "wheel")
      return `${base}
        <circle cx="${x}" cy="${y - 2}" r="7.5" stroke="#2E8AC0" stroke-width="2.2" fill="none"/>
        <circle cx="${x}" cy="${y - 2}" r="2" fill="#2E8AC0"/>
        <path d="M${x - 7.5} ${y - 2}h15M${x} ${y - 9.5}v15" stroke="#2E8AC0" stroke-width="1.2" opacity=".7"/>`;
    if (kind === "cane")
      return `${base}<path d="M${x + 7} ${y - 12}l4 12" stroke="#C0871C" stroke-width="2.2" stroke-linecap="round"/>`;
    if (kind === "arm")
      return `${base}<path d="M${x - 6} ${y - 12}l-3 3" stroke="#C0392E" stroke-width="3" stroke-linecap="round"/>`;
    return base;
  };
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs7-shop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF6EC"/><stop offset="1" stop-color="#EFE4D0"/></linearGradient>
      <linearGradient id="hs7-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C99A5E"/><stop offset="1" stop-color="#9E7038"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="140" rx="12" fill="url(#hs7-shop)"/>
    ${shelf(70)}${shelf(126)}
    ${doll(52, 66, "plain", true)}${doll(96, 66, "plain", true)}${doll(140, 66, "plain", true)}${doll(184, 66, "plain", true)}
    ${revealed
      ? `<g class="hs7-newdolls">${doll(64, 122, "wheel", true)}${doll(120, 122, "cane", true)}${doll(176, 122, "arm", true)}</g>`
      : `<rect x="34" y="86" width="172" height="38" rx="8" fill="#E2D6C0" opacity=".8"/><text x="120" y="109" text-anchor="middle" font-size="10" fill="#9A8A6E">새 인형 입고 준비 중</text>`}
  </svg>`;
}

export function renderDollShelf(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs7-frame" });
  const btn = el("button", { class: "hs7-btn", attrs: { type: "button" }, text: "새 인형 만나 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML =
    "장난감 가게에 왔어요. 위 칸엔 낯익은 인형들 — 그런데 아래 칸에 <b>새로 나온 인형들</b>이 들어온대요. 만나 볼까요?";
  fig.innerHTML = dollSvg(false);

  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    fig.innerHTML = dollSvg(true);
    btn.classList.add("done");
    btn.disabled = true;
    face("smile");
    helper.innerHTML =
      "<b>휠체어를 탄 인형</b>, <b>지팡이를 짚은 인형</b>, <b>팔 모양이 다른 인형</b> — 모두 밝고 당당한 표정이에요. 인형 회사는 왜 이런 인형들을 만들기 시작했을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "세상에는 다양한 모습의 사람들이 있다는 걸 알려 주려고",
          "만들기가 더 쉽고 재료비가 덜 들어서",
          "특별한 이유 없이 우연히 나온 것이라서",
        ],
        good: "맞아요! 인형 상자 속 세상이 <b>진짜 세상의 다양함</b>을 닮아야 편견이 자라지 않으니까요. 다름을 대하는 우리의 자세 — 오늘 배울 이야기예요!",
        bad: "비용이나 우연이 아니라 <b>메시지</b>예요 — 세상엔 다양한 모습의 사람들이 있고 모두가 매력적이라는 걸, 인형 상자 안에서부터 보여 주려는 거죠. 다름을 대하는 자세를 배우러 가요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ 서브 디스패처 ══════════ */
export function renderSoc7(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "twinstory") return renderTwinStory(scene, helper, s, finish, face);
  if (name === "hiddenteacher") return renderHiddenTeacher(scene, helper, s, finish, face);
  if (name === "profileme") return renderProfileMe(scene, helper, s, finish, face);
  if (name === "nametags") return renderNameTags(scene, helper, s, finish, face);
  if (name === "doubleday") return renderDoubleDay(scene, helper, s, finish, face);
  if (name === "vinestangle") return renderVineTangle(scene, helper, s, finish, face);
  if (name === "dollshelf") return renderDollShelf(scene, helper, s, finish, face);
  return null;
}
