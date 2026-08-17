// hookSoc8 — 사회 Ⅷ(다양한 문화의 이해) 훅 장면 7종. hook.ts가 renderSoc8 서브 디스패처
// (hookSoc7 문법 — 모르는 장면이면 null)로 위임한다. 파운드리 SVG 문법(근-동조 그라데이션+
// 키라이트+접촉 그림자+최암색 외곽선) 준수, 스틱맨만 손그림 라인. CSS 접두사 hs8-.
//   wordhunt   L1 — 하루 동안 만난 '문화'라는 말 셋: 상품권·전통문화·문화 시민(뜻이 다 다르다?)
//   greetmix   L2 — 여행지에서 받은 혀 내밀기 인사(티베트 — 존중·환영, 비상 지도서 소재)
//   birthsoup  L3 — 생일 아침 미역국, 옆집도 짝꿍네도(약속한 적 없는 공유)
//   mycomment  L4 — 내가 올린 영상에 댓글이 차오른다(소비자가 생산자로 — 경계 붕괴)
//   mugwort    L5 — "쑥과 마늘 100일이면 지능이…" 게시물(미래엔 156쪽 소재 계승)
//   doorbell   L6 — 초인종 소리, 서로 다른 문화의 세 손님(저녁상 고민)
//   siesta     L7 — 오후 2시, 식당이 모두 닫혔다(남유럽 낮잠 문화 — 미래엔 생각열기)
// 민감 가드: 인사·낮잠 문화를 놀리는 연출 금지(놀람은 허용, 비하 금지), 예측 choices[0]=정답·
// good≠bad 공용 규칙, 종교·민족 표지 없는 무성별 스틱맨.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

/* ══════════ L1: '문화' 단어 수집 ══════════ */
function wordSvg(idx: number): string {
  const scenes = [
    // 0: 문화상품권 선물
    `<g>
      <rect x="70" y="52" width="100" height="56" rx="8" fill="url(#hs8-gift)" stroke="#8A6A2E" stroke-width="1.6"/>
      <text x="120" y="76" text-anchor="middle" font-size="13" font-weight="900" fill="#5E4A16">문화 상품권</text>
      <path d="M80 92h80" stroke="#C2A45E" stroke-width="1.6" opacity=".7"/>
      <ellipse cx="88" cy="60" rx="9" ry="3" fill="#fff" opacity=".4"/>
      <g ${STICK}><circle cx="42" cy="66" r="8" fill="#F6EFE4"/><path d="M42 74v18M42 92l-6 12M42 92l6 12M42 80l14-8M42 80l-10 8"/></g>
      <circle cx="39.6" cy="65" r="1.1" fill="#3C4654"/><circle cx="44.4" cy="65" r="1.1" fill="#3C4654"/><path d="M40 69q2 1.6 4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>
      <g ${STICK}><circle cx="198" cy="66" r="8" fill="#F6EFE4"/><path d="M198 74v18M198 92l-6 12M198 92l6 12M198 80l-14-8M198 80l10 8"/></g>
      <circle cx="195.6" cy="65" r="1.1" fill="#3C4654"/><circle cx="200.4" cy="65" r="1.1" fill="#3C4654"/><path d="M196 69q2 1.6 4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>
    </g>`,
    // 1: 박물관 전통문화 포스터
    `<g>
      <rect x="64" y="34" width="112" height="76" rx="6" fill="url(#hs8-poster)" stroke="#8A5E2E" stroke-width="1.6"/>
      <text x="120" y="54" text-anchor="middle" font-size="13" font-weight="900" fill="#6E4A1E">전통문화 축제</text>
      <path d="M96 84q6-16 24-16t24 16z" fill="#D97E5A" stroke="#A4532E" stroke-width="1.4"/>
      <path d="M104 84q4-10 16-10t16 10" stroke="#F2B48E" stroke-width="1.3" fill="none"/>
      <circle cx="120" cy="62" r="4" fill="#F2C24E" stroke="#B8860E" stroke-width="1.1"/>
      <ellipse cx="78" cy="42" rx="8" ry="2.6" fill="#fff" opacity=".4"/>
      <g ${STICK}><circle cx="40" cy="72" r="8" fill="#F6EFE4"/><path d="M40 80v18M40 98l-6 12M40 98l6 12M40 86l12-6M40 86l-10 9"/></g>
      <circle cx="37.6" cy="71" r="1.1" fill="#3C4654"/><circle cx="42.4" cy="71" r="1.1" fill="#3C4654"/><circle cx="40" cy="75.6" r="1.4" fill="none" stroke="#3C4654" stroke-width="1.1"/>
    </g>`,
    // 2: '문화 시민' 현수막 아래 줄서기
    `<g>
      <path d="M40 40h160l-6 18H46z" fill="url(#hs8-banner)" stroke="#2E6A94" stroke-width="1.6"/>
      <text x="120" y="54" text-anchor="middle" font-size="12.5" font-weight="900" fill="#173A52">문화 시민의 줄서기</text>
      <g ${STICK}><circle cx="76" cy="80" r="7" fill="#F6EFE4"/><path d="M76 87v16M76 103l-5 11M76 103l5 11M76 92l-8 6M76 92l8 6"/></g>
      <g ${STICK}><circle cx="112" cy="80" r="7" fill="#F6EFE4"/><path d="M112 87v16M112 103l-5 11M112 103l5 11M112 92l-8 6M112 92l8 6"/></g>
      <g ${STICK}><circle cx="148" cy="80" r="7" fill="#F6EFE4"/><path d="M148 87v16M148 103l-5 11M148 103l5 11M148 92l-8 6M148 92l8 6"/></g>
      ${[76, 112, 148].map((x) => `<circle cx="${x - 2.2}" cy="79" r="1" fill="#3C4654"/><circle cx="${x + 2.2}" cy="79" r="1" fill="#3C4654"/><path d="M${x - 2} 83q2 1.4 4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`).join("")}
      <path d="M64 118h120" stroke="#C4CDD8" stroke-width="2" stroke-dasharray="6 5"/>
    </g>`,
  ];
  return `<svg viewBox="0 0 240 132" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs8-gift" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCE9B8"/><stop offset=".6" stop-color="#F2CE7E"/><stop offset="1" stop-color="#DCAE4E"/></linearGradient>
      <linearGradient id="hs8-poster" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3DC"/><stop offset="1" stop-color="#EBD9AE"/></linearGradient>
      <linearGradient id="hs8-banner" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE0F2"/><stop offset="1" stop-color="#8FC2DE"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="122" rx="86" ry="5" fill="#2A3A5E" opacity=".08"/>
    ${scenes[idx]}
  </svg>`;
}

export function renderWordHunt(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "오늘 하루 되감기 (1/3)" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "오늘 하루, <b>'문화'</b>라는 말을 세 번이나 만났어요. 하루를 되감으며 그 장면들을 다시 볼까요?";
  fig.innerHTML = wordSvg(0);
  const caps = [
    "① 생일 선물로 받은 <b>문화 상품권</b>, 책·영화·공연에 쓰라는 카드죠.",
    "② 박물관 앞 <b>전통문화 축제</b> 포스터, 조상들의 살아온 방식이래요.",
    "③ 그리고 '<b>문화 시민</b>의 줄서기' 현수막, 여기선 교양 있는 모습이란 뜻 같아요. 어라, 셋 다 '문화'인데…?",
  ];
  helper.innerHTML = caps[0];
  let i = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (i >= 2) return;
    i += 1;
    haptic(HAPTIC.select);
    fig.innerHTML = wordSvg(i);
    helper.innerHTML = caps[i];
    btn.textContent = `오늘 하루 되감기 (${i + 1}/3)`;
    if (i >= 2) {
      btn.classList.add("done");
      btn.disabled = true;
      face("surprised");
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "쓰임에 따라 넓은 뜻과 좁은 뜻이 섞여 있다",
            "세 장면 모두 완전히 같은 뜻이다",
            "'문화'는 예술에만 쓸 수 있는 말이다",
          ],
          good: "날카로워요! 예술·교양을 가리키는 <b>좁은 뜻</b>과 살아가는 방식 전체를 가리키는 <b>넓은 뜻</b>이 섞여 있었죠. 그 정체를 판정소에서 갈라 봐요!",
          bad: "세 장면을 다시 봐요. 상품권의 문화(예술), 전통문화(생활 방식), 문화 시민(교양)… 같은 단어인데 가리키는 것이 달랐어요. '문화'에는 넓은 뜻과 좁은 뜻이 있답니다. 판정소에서 갈라 봐요!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L2: 혀 내밀기 인사 ══════════ */
function greetSvg(revealed: boolean): string {
  const localFace = revealed
    ? `<path d="M160.4 60.6q1.3-1.5 2.6 0M166 60.6q1.3-1.5 2.6 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`
    : `<circle cx="161.6" cy="61" r="1.1" fill="#3C4654"/><circle cx="166.4" cy="61" r="1.1" fill="#3C4654"/>`;
  return `<svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs8-mount" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCE8F2"/><stop offset="1" stop-color="#B4CCE0"/></linearGradient>
      <linearGradient id="hs8-flagline" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E2604A"/><stop offset=".5" stop-color="#F2C24E"/><stop offset="1" stop-color="#3E8EC4"/></linearGradient>
    </defs>
    <path d="M8 96 L60 40 L104 88 L150 34 L232 96 Z" fill="url(#hs8-mount)" stroke="#8AA4BE" stroke-width="1.4"/>
    <path d="M60 40l6-6M150 34l6-6" stroke="#fff" stroke-width="2" opacity=".7"/>
    <path d="M30 30q60 18 180 4" stroke="url(#hs8-flagline)" stroke-width="3" stroke-dasharray="10 7" opacity=".8"/>
    <ellipse cx="120" cy="126" rx="92" ry="5" fill="#2A3A5E" opacity=".1"/>
    <g ${STICK}><circle cx="76" cy="62" r="8" fill="#F6EFE4"/><path d="M76 70v20M76 90l-6 13M76 90l6 13M76 77l-11 7M76 77l13-4"/></g>
    <circle cx="73.6" cy="61" r="1.4" fill="#3C4654"/><circle cx="78.4" cy="61" r="1.4" fill="#3C4654"/>
    ${revealed ? `<path d="M74 65.6q2 1.8 4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>` : `<ellipse cx="76" cy="66" rx="1.6" ry="2.2" fill="none" stroke="#3C4654" stroke-width="1.2"/><path d="M84 52l3-3M85.5 55l4-1.5" stroke="#8A93A6" stroke-width="1.3"/>`}
    <g ${STICK}><circle cx="164" cy="62" r="8" fill="#F6EFE4"/><path d="M164 70v20M164 90l-6 13M164 90l6 13M164 77l11 7M164 77l-13-4"/></g>
    ${localFace}
    <path d="M162.6 65.5q1.4 3.5 2.8 0z" fill="#E2604A" stroke="#B84434" stroke-width="1"/>
    ${revealed ? `<path d="M150 46l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z" fill="#F2C24E"/>` : ""}
  </svg>`;
}

export function renderGreetMix(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "안내 책자 펼쳐 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = greetSvg(false);
  helper.innerHTML =
    "높은 산의 나라를 여행 중이에요. 길에서 만난 분께 인사했더니, 그분이 <b>혀를 살짝 내밀었어요?!</b> 나를 놀리는 걸까요…?";
  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "존중과 환영을 담은 그 지역의 인사법이다",
          "처음 본 사람을 놀리는 장난이다",
          "말이 통하지 않아 아무 뜻 없이 한 행동이다",
        ],
        good: "정답! 티베트에서 혀를 살짝 내미는 건 <b>존중과 환영의 인사</b>래요. 우리에겐 '메롱'이어도 그곳에선 반가움, 같은 행동, 다른 뜻! 어디에나 인사는 있는데 모습이 다 다르네요?",
        bad: "안내 책자의 답, 티베트에서 혀를 살짝 내미는 건 <b>존중과 환영의 인사</b>예요! 놀림도, 뜻 없는 행동도 아니었죠. 같은 '인사'인데 사회마다 모습이 이렇게 달라요.",
        onDone: finish,
      });
    }, 700);
    fig.innerHTML = greetSvg(true);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 생일 미역국 ══════════ */
function soupSvg(houses: boolean): string {
  const bowl = (x: number, y: number, sc = 1): string => `
    <g transform="translate(${x} ${y}) scale(${sc})">
      <path d="M-14 0q0 10 14 10T14 0z" fill="url(#hs8-bowl)" stroke="#6E4A26" stroke-width="1.5"/>
      <ellipse cx="0" cy="0" rx="14" ry="4.4" fill="#8FAE58" stroke="#5E7E36" stroke-width="1.2"/>
      <path d="M-8 -1q4-2 8-1M2 0q4-1 6 1" stroke="#C2D89A" stroke-width="1.3" fill="none"/>
      <g stroke="#E8944E" stroke-width="1.6" fill="none" opacity=".8"><path d="M-5 -8c-2-3 2-4 0-7"/><path d="M5 -8c-2-3 2-4 0-7"/></g>
    </g>`;
  const house = (x: number, label: string): string => `
    <g transform="translate(${x} 0)">
      <rect x="-26" y="52" width="52" height="44" rx="5" fill="url(#hs8-house)" stroke="#8A93A6" stroke-width="1.4"/>
      <path d="M-30 54 L0 32 L30 54" fill="none" stroke="#5E6A7E" stroke-width="2.4" stroke-linejoin="round"/>
      <rect x="-16" y="62" width="32" height="24" rx="3" fill="#FFF8E8" stroke="#C2A45E" stroke-width="1.2"/>
      ${bowl(0, 76, 0.75)}
      <text x="0" y="110" text-anchor="middle" font-size="10" font-weight="800" fill="#5E6A7E">${label}</text>
    </g>`;
  return `<svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="hs8-bowl" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#C89A5E"/><stop offset="1" stop-color="#84582A"/></radialGradient>
      <linearGradient id="hs8-house" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FAFD"/><stop offset="1" stop-color="#DCE6F0"/></linearGradient>
    </defs>
    ${
      houses
        ? `${house(48, "우리 집")}${house(120, "옆집")}${house(192, "짝꿍네")}
           <ellipse cx="120" cy="126" rx="100" ry="5" fill="#2A3A5E" opacity=".08"/>`
        : `<rect x="58" y="26" width="42" height="30" rx="5" fill="#FFF" stroke="#C4CDD8" stroke-width="1.4"/>
           <path d="M58 34h42" stroke="#C4CDD8" stroke-width="1.2"/>
           <circle cx="79" cy="45" r="6" fill="none" stroke="#E2604A" stroke-width="2"/>
           <text x="79" y="48.5" text-anchor="middle" font-size="9" font-weight="900" fill="#E2604A">7</text>
           ${bowl(150, 66, 1.4)}
           <g ${STICK}><circle cx="94" cy="76" r="8" fill="#F6EFE4"/><path d="M94 84v18M94 102l-6 12M94 102l6 12M94 90l12-4M94 90l-11 6"/></g>
           <circle cx="91.6" cy="75" r="1.1" fill="#3C4654"/><circle cx="96.4" cy="75" r="1.1" fill="#3C4654"/><path d="M92 79q2 1.6 4 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>
           <ellipse cx="120" cy="122" rx="86" ry="5" fill="#2A3A5E" opacity=".1"/>`
    }
  </svg>`;
}

export function renderBirthSoup(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "다른 집도 들여다보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = soupSvg(false);
  helper.innerHTML = "오늘은 내 생일, 아침 밥상에 어김없이 <b>미역국</b>이 올라왔어요. 그런데 문득, 다른 집들도 그럴까요?";
  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    fig.innerHTML = soupSvg(true);
    face("surprised");
    helper.innerHTML = "옆집 생일상에도, 짝꿍네 생일상에도 <b>미역국</b>! 서로 약속한 적도 없는데 말이죠.";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "우리 사회 구성원들이 같은 문화를 함께 나누고 있어서",
          "법으로 생일에는 미역국을 먹게 정해져 있어서",
          "미역국이 우리나라에서 가장 싼 음식이라서",
        ],
        good: "바로 그거예요! 약속하지 않아도 통하는 건 <b>같은 문화를 함께 나누기 때문</b>, 김치 한 포기 속에서 이런 성질을 다섯 개나 찾아낼 수 있대요. 수사 시작!",
        bad: "법도 가격도 아니에요. 생일 미역국은 우리 사회 구성원들이 <b>함께 나누어 온 문화</b>라서 약속 없이도 통하는 거랍니다. 이런 성질, 김치 한 포기에서 다섯 개나 찾을 수 있대요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L4: 내가 올린 영상 ══════════ */
function videoSvg(views: number, comments: number, uploaded: boolean): string {
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs8-ph" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E6A7E"/><stop offset=".55" stop-color="#3E4A5E"/><stop offset="1" stop-color="#283242"/></linearGradient>
      <linearGradient id="hs8-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7FAFD"/><stop offset="1" stop-color="#E4EBF2"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="140" rx="70" ry="5" fill="#2A3A5E" opacity=".1"/>
    <rect x="66" y="10" width="108" height="126" rx="14" fill="url(#hs8-ph)" stroke="#1B2430" stroke-width="1.8"/>
    <rect x="74" y="20" width="92" height="106" rx="8" fill="url(#hs8-scr)"/>
    <rect x="80" y="26" width="80" height="46" rx="6" fill="#BFD8EE" stroke="#8AAECC" stroke-width="1.2"/>
    <g ${STICK}><circle cx="112" cy="42" r="5.5" fill="#F6EFE4"/><path d="M112 47v9M112 56l-4 7M112 56l4 7M112 50l-6 3M112 50l7-2"/></g>
    <path d="M128 38l7 4-7 4z" fill="#fff" stroke="#5E88AA" stroke-width="1.2"/>
    ${
      uploaded
        ? `<g class="hs8-noti"><rect x="80" y="78" width="80" height="18" rx="9" fill="#FDECE6" stroke="#E8A28E" stroke-width="1.2"/>
           <circle cx="92" cy="87" r="5" fill="#E8543E"/><path d="M90 87l1.6 1.8 2.6-3" stroke="#fff" stroke-width="1.3" fill="none"/>
           <text x="102" y="90.5" font-size="9.5" font-weight="800" fill="#B84A34">조회 ${views}</text></g>
           <g class="hs8-noti d2"><rect x="80" y="100" width="80" height="18" rx="9" fill="#EDF6EE" stroke="#9EC8A4" stroke-width="1.2"/>
           <path d="M88 105h10q3 0 3 3v3q0 3-3 3h-6l-4 3z" fill="#4E9E5E"/>
           <text x="105" y="112.5" font-size="9.5" font-weight="800" fill="#3A7A46">댓글 ${comments}</text></g>`
        : `<rect x="88" y="86" width="64" height="20" rx="10" fill="#3182F6"/>
           <path d="M114 91l6 5-6 5M106 96h13" stroke="#fff" stroke-width="1.8" fill="none"/>`
    }
  </svg>`;
}

export function renderMyComment(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "영상 올리기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = videoSvg(0, 0, false);
  helper.innerHTML = "어제 찍은 <b>춤 연습 영상</b>을 처음으로 공유 플랫폼에 올려 보려고 해요. 두근두근, 올려 볼까요?";
  let fired = false;
  const timers: number[] = [];
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    const seq: [number, number][] = [
      [12, 2],
      [87, 14],
      [312, 41],
    ];
    seq.forEach(([v, c], i) => {
      timers.push(
        window.setTimeout(() => {
          fig.innerHTML = videoSvg(v, c, true);
          haptic(HAPTIC.select);
          if (i === seq.length - 1) {
            face("surprised");
            helper.innerHTML = "하룻밤 새 조회 312, 댓글 41! 어제까지 나는 <b>보기만 하는 사람</b>이었는데… 오늘은 무언가 달라졌어요.";
            timers.push(
              window.setTimeout(() => {
                ask(choicesBox, helper, {
                  choices: s.choices ?? [
                    "정보를 받기만 하던 사람도 만들어 퍼뜨리는 사람이 될 수 있게 됐다",
                    "화면이 예전보다 커지고 선명해졌다",
                    "정보가 전달되는 속도가 예전보다 느려졌다",
                  ],
                  good: "정확해요! 예전 미디어는 소수가 만들고 모두가 받기만 했지만, 이제는 <b>누구나 생산자</b>가 될 수 있죠. 생산자와 소비자의 경계가 무너진 새 미디어 시대예요!",
                  bad: "화면 크기나 속도의 문제가 아니에요. 어제의 나는 받기만 했는데 오늘의 나는 <b>만들어 퍼뜨렸죠</b>. 생산자와 소비자의 경계가 무너진 것, 그게 새 미디어 시대의 심장이랍니다.",
                  onDone: finish,
                });
              }, 900),
            );
          }
        }, 650 * (i + 1)),
      );
    });
  });
  return () => timers.forEach((t) => window.clearTimeout(t));
}

/* ══════════ L5: 쑥과 마늘 게시물 ══════════ */
function mugwortSvg(alerted: boolean): string {
  return `<svg viewBox="0 0 240 150" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs8-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2F7"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="140" rx="86" ry="5" fill="#2A3A5E" opacity=".08"/>
    <rect x="38" y="14" width="164" height="112" rx="12" fill="url(#hs8-card)" stroke="#C4CDD8" stroke-width="1.6"/>
    <circle cx="58" cy="34" r="9" fill="#DCE6F0" stroke="#8A93A6" stroke-width="1.3"/>
    <path d="M54 32q4-3 8 0M54 37q4 2 8 0" stroke="#8A93A6" stroke-width="1.2" fill="none"/>
    <rect x="74" y="26" width="66" height="7" rx="3.5" fill="#C4CDD8"/>
    <rect x="74" y="37" width="40" height="5" rx="2.5" fill="#DCE3EC"/>
    <text x="52" y="66" font-size="11.5" font-weight="800" fill="#3E4A5E">쑥과 마늘을 100일 먹으면</text>
    <text x="52" y="82" font-size="11.5" font-weight="800" fill="#3E4A5E">지능이 높아진다?!</text>
    <g transform="translate(160 66)">
      <path d="M0 12q-6-4-4-11 5-3 9 1 4-4 9-1 2 7-4 11z" fill="#8FAE58" stroke="#5E7E36" stroke-width="1.3"/>
      <path d="M22 4q5 2 4 9-4 4-9 2-2-6 5-11z" fill="#EDE6D6" stroke="#B8A278" stroke-width="1.3"/>
      <path d="M27 2v4" stroke="#8A9346" stroke-width="1.6"/>
    </g>
    <rect x="52" y="96" width="52" height="16" rx="8" fill="#EEF4FF" stroke="#9EBCE8" stroke-width="1.2"/>
    <text x="78" y="107.5" text-anchor="middle" font-size="9" font-weight="800" fill="#3168C4">좋아요 999</text>
    ${
      alerted
        ? `<g class="hs8-noti"><rect x="120" y="94" width="74" height="20" rx="10" fill="#FFF6E0" stroke="#E2C26E" stroke-width="1.3"/>
           <text x="157" y="107.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="#9A7A1E">친구: 나도 봤어!</text></g>`
        : ""
    }
  </svg>`;
}

export function renderMugwort(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "친구에게 물어보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = mugwortSvg(false);
  helper.innerHTML =
    "웹 게시판에서 이런 글을 봤어요. <b>\"쑥과 마늘을 100일 동안 먹으면 지능이 높아진다\"</b>. 좋아요가 999개나 되는데요?!";
  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    fig.innerHTML = mugwortSvg(true);
    face("curious");
    helper.innerHTML = "친구도 <b>\"어제 나도 봤어! 진짜인가 봐\"</b>라는데요… 여러 명이 봤으면 사실인 걸까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "출처와 근거부터 따져 본 뒤에 판단한다",
          "여러 명이 봤고 좋아요도 많으니 사실로 믿는다",
          "재미있으니 일단 널리 공유부터 한다",
        ],
        good: "좋은 습관이에요! <b>많이 퍼졌다 ≠ 사실</b>, 출처가 믿을 만한지, 근거가 튼튼한지부터 따지는 거죠. 마침 수상한 게시물이 하나 더 있는데… 수사대 출동!",
        bad: "좋아요 수와 사실 여부는 별개예요. 잘못된 정보일수록 자극적이라 더 빨리 퍼지기도 하거든요. <b>출처와 근거부터</b> 따져 보는 것! 마침 수상한 게시물이 하나 더 있어요. 수사대 출동!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 초인종과 세 손님 ══════════ */
function doorbellSvg(open: boolean): string {
  const guest = (x: number, acc: string, mouth: string): string => `
    <g ${STICK}><circle cx="${x}" cy="58" r="8" fill="#F6EFE4"/><path d="M${x} 66v20M${x} 86l-6 13M${x} 86l6 13M${x} 73l-10 7M${x} 73l10 7"/></g>
    ${acc}
    <circle cx="${x - 2.4}" cy="57" r="1.1" fill="#3C4654"/><circle cx="${x + 2.4}" cy="57" r="1.1" fill="#3C4654"/>${mouth}`;
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs8-door" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C89A5E"/><stop offset=".5" stop-color="#A87838"/><stop offset="1" stop-color="#84582A"/></linearGradient>
      <linearGradient id="hs8-hall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6E4"/><stop offset="1" stop-color="#F2E2C4"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="136" rx="92" ry="5" fill="#2A3A5E" opacity=".1"/>
    <rect x="24" y="12" width="192" height="120" rx="8" fill="#E8EEF5" stroke="#C4CDD8" stroke-width="1.4"/>
    ${
      open
        ? `<rect x="52" y="20" width="136" height="106" rx="6" fill="url(#hs8-hall)" stroke="#C2A45E" stroke-width="1.4"/>
           ${guest(84, `<path d="M76 51q8-5 16 0l-1.6 3.4H77.6z" fill="#0CA678" opacity=".3" stroke="#0CA678" stroke-width="1.1"/>`, `<path d="M81.6 61.5q2.4 2 4.8 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`)}
           ${guest(120, `<circle cx="120" cy="47.6" r="1.5" fill="#C13B2E"/>`, `<path d="M117.6 61.5q2.4 2 4.8 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`)}
           ${guest(156, `<path d="M162 46l4-2M163 49l5-1" stroke="#7A9646" stroke-width="1.3"/>`, `<path d="M153.6 61.5q2.4 2 4.8 0" stroke="#3C4654" stroke-width="1.3" fill="none"/>`)}`
        : `<rect x="88" y="24" width="64" height="102" rx="4" fill="url(#hs8-door)" stroke="#5E3A1E" stroke-width="1.8"/>
           <circle cx="142" cy="76" r="3" fill="#F2C24E" stroke="#8A6A2E" stroke-width="1.2"/>
           <path d="M96 32q24-5 48 0" stroke="#C89A5E" stroke-width="1.2" opacity=".7" fill="none"/>
           <circle cx="168" cy="44" r="7" fill="#FFF" stroke="#8A93A6" stroke-width="1.4"/>
           <circle cx="168" cy="44" r="2.6" fill="#E2604A"/>
           <path d="M178 36q4 4 0 8M182 32q7 7 0 14" stroke="#E8944E" stroke-width="2" fill="none" class="hs8-ring"/>`
    }
  </svg>`;
}

export function renderDoorbell(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "문 열어 드리기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = doorbellSvg(false);
  helper.innerHTML =
    "딩동! 오늘 우리 집 저녁에 <b>세 나라에서 온 손님들</b>이 오기로 했어요. 가족의 오랜 친구들이래요. 문을 열어 볼까요?";
  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    fig.innerHTML = doorbellSvg(true);
    face("cheer");
    helper.innerHTML = "반가운 세 손님! 그런데 부엌의 나는 문득 고민에 빠져요. <b>저녁상에 뭘 올리지?</b>";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "손님마다 먹지 않는 음식이 있는지 먼저 알아본다",
          "가장 비싼 재료로 무조건 화려하게 차린다",
          "우리가 늘 먹던 대로만 차리면 충분하다",
        ],
        good: "사려 깊어요! 문화나 종교에 따라 <b>삼가는 음식</b>이 있을 수 있죠. 다름을 먼저 알아보는 것이 진짜 환대의 시작이에요. 상 차리러 가요!",
        bad: "비싼 상보다, 익숙한 상보다 먼저 할 일이 있어요. 손님마다 문화나 종교에 따라 <b>먹지 않는 음식</b>이 있을 수 있거든요. 다름을 알아보는 것이 환대의 시작! 상 차리러 가요.",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 낮잠 시간의 거리 ══════════ */
function siestaSvg(walked: boolean): string {
  const shop = (x: number, w: number, awning: string): string => `
    <g transform="translate(${x} 0)">
      <rect x="0" y="44" width="${w}" height="56" rx="4" fill="#F4EDE0" stroke="#B8A882" stroke-width="1.4"/>
      <path d="M-4 44 h${w + 8} l-6 -12 h-${w - 4} z" fill="${awning}" stroke="#8A5E2E" stroke-width="1.3"/>
      <rect x="${w / 2 - 12}" y="60" width="24" height="40" rx="3" fill="#D9CBAE" stroke="#8A6A3E" stroke-width="1.3"/>
      <rect x="${w / 2 - 8}" y="72" width="16" height="12" rx="2" fill="#FFF" stroke="#B8A278" stroke-width="1.1"/>
      <circle cx="${w / 2 + 4}" cy="78" r="4.6" fill="none" stroke="#5E6A7E" stroke-width="1.6"/>
      <path d="M${w / 2 + 4} 75v3l2 2" stroke="#5E6A7E" stroke-width="1.4" fill="none"/>
    </g>`;
  return `<svg viewBox="0 0 240 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hs8-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE8B8"/><stop offset="1" stop-color="#FFD892"/></linearGradient>
      <linearGradient id="hs8-awn1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2604A"/><stop offset="1" stop-color="#C24A38"/></linearGradient>
      <linearGradient id="hs8-awn2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E9E5E"/><stop offset="1" stop-color="#3A7E48"/></linearGradient>
    </defs>
    <rect x="10" y="8" width="220" height="112" rx="10" fill="url(#hs8-sky)"/>
    <circle cx="204" cy="28" r="12" fill="#FFB93E" stroke="#E2932E" stroke-width="1.6"/>
    <g stroke="#E2932E" stroke-width="1.8"><path d="M204 10v6M204 40v6M188 28h-6M222 28h6M192 16l4 4M216 40l4 4M216 16l-4 4M192 40l4-4"/></g>
    ${shop(30, 76, "url(#hs8-awn1)")}
    ${walked ? shop(130, 76, "url(#hs8-awn2)") : ""}
    ${
      walked
        ? `<g ${STICK}><circle cx="212" cy="92" r="6.4" fill="#F6EFE4"/><path d="M212 98q-6 3-10 2M212 98q3 6 1 10M203 100l-5 8M213 108l4 8"/></g>
           <path d="M206 84q3-3 6-1M216 82q3 1 3 4" stroke="#8A93A6" stroke-width="1.2" fill="none" opacity=".8"/>
           <ellipse cx="210" cy="118" rx="14" ry="2.6" fill="#2A3A5E" opacity=".12"/>`
        : ""
    }
    <g ${STICK}><circle cx="${walked ? 120 : 150}" cy="78" r="8" fill="#F6EFE4"/><path d="M${walked ? 120 : 150} 86v18M${walked ? 120 : 150} 104l-6 13M${walked ? 120 : 150} 104l6 13M${walked ? 120 : 150} 92l-11 5M${walked ? 120 : 150} 92l11 5"/></g>
    <circle cx="${(walked ? 120 : 150) - 2.4}" cy="77" r="1.2" fill="#3C4654"/><circle cx="${(walked ? 120 : 150) + 2.4}" cy="77" r="1.2" fill="#3C4654"/>
    <ellipse cx="${walked ? 120 : 150}" cy="82.5" rx="1.5" ry="2" fill="none" stroke="#3C4654" stroke-width="1.1"/>
    <path d="M${(walked ? 120 : 150) + 8} 68l3-3M${(walked ? 120 : 150) + 9.5} 71.5l4-1.5" stroke="#8A93A6" stroke-width="1.3"/>
    <ellipse cx="120" cy="132" rx="96" ry="5" fill="#2A3A5E" opacity=".1"/>
  </svg>`;
}

export function renderSiesta(scene: HTMLElement, helper: HTMLElement, s: HookOpt, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hs8-frame" });
  const btn = el("button", { class: "hs8-btn", attrs: { type: "button" }, text: "옆 골목 식당도 가 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  fig.innerHTML = siestaSvg(false);
  helper.innerHTML =
    "남부 유럽 여행 중, 오후 2시, 배가 고파 식당에 갔더니 <b>문이 닫혀 있어요</b>. 한창 붐빌 시간인데요?";
  let fired = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (fired) return;
    fired = true;
    haptic(HAPTIC.select);
    btn.classList.add("done");
    btn.disabled = true;
    fig.innerHTML = siestaSvg(true);
    face("surprised");
    helper.innerHTML = "옆 골목 식당도 닫혔고… 그늘에서는 사람들이 <b>느긋하게 낮잠</b>을 자고 있어요. 대체 왜일까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "한낮 더위를 피해 쉬어 가는 그 지역의 생활 방식이라서",
          "장사가 안되어 가게들이 모두 문을 닫은 것이라서",
          "게을러서 일할 시간에 자는 것이라서",
        ],
        good: "그래요! 무더운 한낮을 피해 쉬고 저녁까지 일하는 <b>그 땅의 기후에 맞춘 생활 방식</b>이에요. 낯설다고 틀린 건 아니죠. 문화를 보는 '안경' 이야기를 시작해 봐요!",
        bad: "망한 것도, 게으른 것도 아니에요. 무더운 한낮을 피해 쉬고 저녁 늦게까지 일하는, <b>그 땅의 기후에 맞춘 생활 방식</b>이랍니다. 낯선 문화를 어떤 눈으로 봐야 할지, 안경 이야기를 시작해 봐요!",
        onDone: finish,
      });
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

/* ── 서브 디스패처(hookSoc7 문법 — 모르는 장면이면 null) ── */
export function renderSoc8(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "wordhunt") return renderWordHunt(scene, helper, s, finish, face);
  if (name === "greetmix") return renderGreetMix(scene, helper, s, finish, face);
  if (name === "birthsoup") return renderBirthSoup(scene, helper, s, finish, face);
  if (name === "mycomment") return renderMyComment(scene, helper, s, finish, face);
  if (name === "mugwort") return renderMugwort(scene, helper, s, finish, face);
  if (name === "doorbell") return renderDoorbell(scene, helper, s, finish, face);
  if (name === "siesta") return renderSiesta(scene, helper, s, finish, face);
  return null;
}
