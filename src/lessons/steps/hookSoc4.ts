// hookSoc4 — 사회 Ⅳ 단원(아프리카) 훅 장면 8종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수,
// 스틱맨만 손그림 라인(#3C4654). CSS 상태 클래스 접두사는 hs4-.
//   mappuzzle  L1 — 세계지도 퍼즐: 아프리카 조각이 생각보다 크다 → 두 번째 대륙(인식 뒤집기 1)
//   satnile    L2 — 위성 지도 앱 확대: 사막 한가운데 초록 리본 → 적도에서 온 강(나일)
//   herdmove   L3 — 세렝게티 다큐: 같은 곳이 반년 만에 초록↔갈색 → 비를 따라가는 대이동
//   shadelane  L4 — 여행 골목: 다닥다닥 흙집 골목이 한낮에 시원 → 환경에 맞춘 지혜
//   movienight L5 — OTT 밤: 영화 편수 세계 2위 나라는? → 놀리우드(인식 뒤집기 2)
//   classphoto L6 — 대륙 학급 사진: 반 나이 한가운데가 가장 어린 반은? → 가장 젊은 대륙(뒤집기 3)
//   flagstars  L7 — 뉴스 속 초록 깃발: 별들의 정체 → 아프리카연합 55개 회원국
//   greenline  L8 — 위성 전후: 사막 남쪽의 초록 선 → 그레이트 그린 월
// 민감 주제 가드: 빈곤·기아 이미지 금지(교과서 프레임 = 다양성·잠재력·성장), 인물은 스틱맨만.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpt = { choices?: string[] };

/** 손그림 아프리카 실루엣(장면 공용 도들 — 데이터 지도가 아니라 만화 소품).
 *  특징: 북쪽이 넓고 남쪽으로 좁아지며, 서쪽(왼쪽 아래)에 기니만 홈이 파인다. 로컬 72×80. */
const AFR_SIL =
  "M12 16q3-9 14-10l16-1q9 0 13 5l5 6q4 3 5 8l3 7-5 5-3 8-5 10-6 12-7 9q-3 4-6 0l-4-9-2-10q-1-5 2-8l-5-3-9-2q-7-2-8-8 0-6 2-9z";

/* ══════════ L1: 세계지도 퍼즐 ══════════ */
function puzzleSvg(state: 0 | 1 | 2): string {
  // state 0: 판에 북미·남미만, 트레이에 유라시아(회색)+아프리카(주황) · 1: 유라시아 놓임 ·
  // 2: 아프리카 조각을 슬롯 위로 — 북미 조각보다 커 보이는 대비가 포인트.
  const afrPlaced = state >= 2;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs4-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EADFCE"/><stop offset="1" stop-color="#D8C8AE"/></linearGradient>
      <linearGradient id="hs4-board" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE7F5"/><stop offset=".6" stop-color="#B8D8EC"/><stop offset="1" stop-color="#A2C8E0"/></linearGradient>
      <linearGradient id="hs4-afr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5A55E"/><stop offset=".55" stop-color="#E8843A"/><stop offset="1" stop-color="#C8641E"/></linearGradient>
      <linearGradient id="hs4-eur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8D2DE"/><stop offset="1" stop-color="#9AA8B8"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs4-desk)"/>
    <ellipse cx="104" cy="150" rx="92" ry="6" fill="#2A3A5E" opacity=".1"/>
    <rect x="16" y="18" width="176" height="124" rx="10" fill="url(#hs4-board)" stroke="#7A98B0" stroke-width="1.6"/>
    <path d="M28 52q6-14 22-16l14 4-2 10-10 6-4 10-10 2q-10-4-10-16z" fill="#B8C8A2" stroke="#8AA278" stroke-width="1.2"/>
    <path d="M64 96q8-2 10 6l-2 14-6 10q-6-2-6-10z" fill="#B8C8A2" stroke="#8AA278" stroke-width="1.2"/>
    ${state >= 1
      ? `<path d="M92 30l34-6q22-2 34 6l14 8-8 10-16 4-12 8-18-2-16-6-14-6z" fill="url(#hs4-eur)" stroke="#6E8098" stroke-width="1.2" class="hs4-pop"/>`
      : ""}
    <g transform="translate(96 58) scale(.86)">
      <path d="${AFR_SIL}" fill="${afrPlaced ? "url(#hs4-afr)" : "none"}" stroke="${afrPlaced ? "#A0501A" : "#7A98B0"}" stroke-width="${afrPlaced ? 1.6 : 1.8}" ${afrPlaced ? 'class="hs4-pop"' : 'stroke-dasharray="5 4"'}/>
      ${afrPlaced ? `<ellipse cx="62" cy="60" rx="4" ry="6" fill="url(#hs4-afr)" stroke="#A0501A" stroke-width="1.2" transform="rotate(-18 62 60)"/>` : ""}
    </g>
    ${state < 2
      ? `<g transform="translate(178 96) scale(.5) rotate(8)">
          <path d="${AFR_SIL}" fill="url(#hs4-afr)" stroke="#A0501A" stroke-width="2.4"/>
        </g>
        <ellipse cx="196" cy="140" rx="20" ry="4" fill="#2A3A5E" opacity=".12"/>`
      : ""}
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <circle cx="214" cy="52" r="7" fill="#FFE8CE"/>
      <path d="M214 59v13M214 63l-8 ${state < 2 ? "10" : "4"}M214 63l7 5M214 72l-6 10M214 72l6 10"/>
      ${state === 2 ? `<path d="M210 49.4q1.8 1.6 4 1.6t4-1.6" stroke-width="1.5"/>` : `<path d="M211 50h6" stroke-width="1.5"/>`}
    </g>
  </svg>`;
}

export function renderMapPuzzle(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs4-puzzle", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 퍼즐 조각 놓기" } });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "거실 바닥에 세계지도 퍼즐을 펼쳤어요. 대륙 조각이 하나씩 — <b>퍼즐판을 탭</b>해서 맞춰 볼까요?";

  let state: 0 | 1 | 2 = 0;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = puzzleSvg(state);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  const next = (): void => {
    if (state >= 2) return;
    state = (state + 1) as 1 | 2;
    haptic(HAPTIC.tap);
    show();
    if (state === 1) {
      helper.innerHTML = "가장 큰 유라시아 조각을 놓았어요. 다음은 트레이의 <b>주황 조각</b> — 어라, 꽤 큰데요? <b>한 번 더 탭!</b>";
    } else {
      face("curious");
      helper.innerHTML = "주황 조각이 딱! 지도 앱에선 작아 보이던 <b>아프리카</b>… 조각으로 만지니 느낌이 달라요. 얼마나 큰 대륙일까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "세계에서 두 번째로 큰 대륙이다",
            "다섯 번째쯤 되는 중간 크기 대륙이다",
            "가장 작은 대륙 중 하나다",
          ],
          good: "맞아요! 아시아 다음, <b>세계에서 두 번째로 큰 대륙</b>이에요. 이 큰 땅을 다섯 조각으로 나눠 하나씩 정복해 봐요!",
          bad: "퍼즐 조각을 다시 봐요 — 유라시아 다음으로 큰 조각이었죠? 아프리카는 <b>세계 두 번째 대륙</b>이에요. 흔한 지도가 크기를 작아 보이게 했을 뿐! 다섯 조각으로 나눠 정복해 봐요!",
          onDone: finish,
        });
      }, 750);
    }
  };
  fig.addEventListener("click", next);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      next();
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L2: 위성 지도 앱 — 사막 속 초록 리본 ══════════ */
function satSvg(state: 0 | 1 | 2): string {
  // state 0: 아프리카 전경(위성 톤) · 1: 사하라 확대(모래 물결 + 동쪽 가장자리 초록 기미) ·
  // 2: 나일 계곡 확대(모래 바탕 + 초록 리본 + 파란 강)
  const inner =
    state === 0
      ? `<g transform="translate(84 34) scale(1.28)">
          <path d="${AFR_SIL}" fill="#C8A45E"/>
          <path d="M22 40q14 10 30 6l6 8-10 10-14 2-12-8z" fill="#4E8E3E" opacity=".85"/>
          <path d="M18 60q10 8 22 6l-4 10-10 2z" fill="#8FAE5A" opacity=".8"/>
          <path d="M52 22q3 14 1 24" stroke="#3E7EC8" stroke-width="1.6" opacity=".9"/>
        </g>`
      : state === 1
        ? `<g>
          ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M18 ${44 + i * 16}q28-8 52 0t52 0q26-8 48 0" stroke="#C89A4E" stroke-width="5" fill="none" opacity=".5"/>`).join("")}
          <rect x="14" y="28" width="200" height="112" fill="#D9B269" opacity="0"/>
          <path d="M196 28v112" stroke="#5E9E4E" stroke-width="5" opacity=".55"/>
          <circle cx="70" cy="70" r="3" fill="#B8863E"/><circle cx="120" cy="96" r="2.4" fill="#B8863E"/><circle cx="52" cy="112" r="2.6" fill="#B8863E"/>
        </g>`
        : `<g>
          <rect x="14" y="28" width="88" height="112" fill="#D9B269"/>
          <rect x="138" y="28" width="76" height="112" fill="#D9B269"/>
          <path d="M102 28h36v112h-36z" fill="#5E9E3E"/>
          <path d="M120 28q-6 28 2 56t-2 56" stroke="#3E7EC8" stroke-width="6" fill="none" stroke-linecap="round"/>
          <path d="M108 40q4 2 0 5M132 76q-4 2 0 5M110 112q4 2 0 5" stroke="#7AC26E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        </g>`;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs4-app" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2436"/><stop offset="1" stop-color="#28324A"/></linearGradient>
      <radialGradient id="hs4-sea2" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="#3E6E9E"/><stop offset="1" stop-color="#2A527E"/></radialGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs4-app)"/>
    <rect x="14" y="28" width="200" height="112" rx="8" fill="url(#hs4-sea2)" stroke="#101828" stroke-width="1.6"/>
    <g clip-path="url(#hs4-satclip)"><clipPath id="hs4-satclip"><rect x="14" y="28" width="200" height="112" rx="8"/></clipPath>${inner}</g>
    <rect x="14" y="14" width="200" height="9" rx="4.5" fill="#3A4658"/>
    <circle cx="206" cy="18.5" r="2.6" fill="#8ED2F5"/>
    <g transform="translate(196 122)">
      <circle r="11" fill="#F2F5FA" stroke="#8A93A6" stroke-width="1.4"/>
      <circle cx="-2" cy="-2" r="4.6" fill="none" stroke="#3C4654" stroke-width="1.8"/>
      <path d="M2 2l5 5" stroke="#3C4654" stroke-width="2" stroke-linecap="round"/>
    </g>
    <rect x="18" y="146" width="${36 + state * 24}" height="5" rx="2.5" fill="#5A82B8"/>
  </svg>`;
}

export function renderSatNile(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs4-sat" });
  const btn = el("button", { class: "hs4-flipbtn", attrs: { type: "button" }, text: "돋보기로 확대하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "위성 지도 앱으로 아프리카 구경 중이에요. 북쪽의 거대한 모래빛 땅 — <b>확대</b>해 볼까요?";

  let state: 0 | 1 | 2 = 0;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = satSvg(state);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (state >= 2) return;
    state = (state + 1) as 1 | 2;
    haptic(HAPTIC.tap);
    show();
    if (state === 1) {
      helper.innerHTML = "끝없는 모래의 <b>사하라 사막</b>! 그런데 오른쪽 끝에 뭔가 <b>초록 기운</b>이… <b>한 번 더 확대!</b>";
    } else {
      btn.classList.add("done");
      btn.disabled = true;
      face("curious");
      helper.innerHTML = "사막 한가운데 <b>초록 리본</b>이 강을 따라 이어져요 — 비도 거의 안 오는 사막에 이 큰 강은 어떻게 흐를까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "강의 출발점이 비가 많이 오는 적도 부근이기 때문에",
            "사막 밑에서 바닷물이 솟아나기 때문에",
            "사막에도 사실은 비가 많이 오기 때문에",
          ],
          good: "정확해요! 이 강이 <b>나일강</b> — 비 많은 적도 부근에서 출발해, 사막을 가로질러 지중해까지 흘러요. 강도 산도 사막도 — 아프리카의 지형을 통째로 훑으러 가요!",
          bad: "사막의 하늘도 땅도 물을 주지 않아요 — 비밀은 강의 <b>출발점</b>! 이 강(나일강)은 비가 많은 적도 부근에서 시작해 사막을 가로질러요. 아프리카의 지형을 통째로 훑으러 가요!",
          onDone: finish,
        });
      }, 750);
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L3: 세렝게티 다큐 — 반년 만의 변신 ══════════ */
function herdSvg(dry: boolean): string {
  const wildebeest = (x: number, y: number, sc = 1): string => `
    <g transform="translate(${x} ${y}) scale(${sc})" fill="#4E3E30">
      <ellipse cx="0" cy="0" rx="5" ry="3"/>
      <rect x="-4.4" y="1" width="1.6" height="4" rx="0.8"/><rect x="2.8" y="1" width="1.6" height="4" rx="0.8"/>
      <path d="M4.4 -1q3-1 4 1" stroke="#4E3E30" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="8.6" cy="-0.6" r="1.8"/>
    </g>`;
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs4-tvrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E3A50"/><stop offset="1" stop-color="#1C2436"/></linearGradient>
      <linearGradient id="hs4-wetland" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FCE6E"/><stop offset="1" stop-color="#5EA84E"/></linearGradient>
      <linearGradient id="hs4-dryland" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D8B878"/><stop offset="1" stop-color="#BE9A58"/></linearGradient>
      <linearGradient id="hs4-sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dry ? "#F5D8A8" : "#9CD2F5"}"/><stop offset="1" stop-color="${dry ? "#F0E2C2" : "#D2ECFA"}"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs4-tvrim)"/>
    <rect x="16" y="16" width="208" height="122" rx="8" fill="url(#hs4-sky3)"/>
    <g clip-path="url(#hs4-tvclip)"><clipPath id="hs4-tvclip"><rect x="16" y="16" width="208" height="122" rx="8"/></clipPath>
      <path d="M16 92q52-12 104-4t104 0v50H16z" fill="url(#hs4-${dry ? "dryland" : "wetland"})"/>
      ${dry
        ? `<circle cx="196" cy="38" r="12" fill="#FFC24D"/>
          <path d="M40 104q3-6 6 0M76 116q3-6 6 0M120 108q3-6 6 0" stroke="#A8834E" stroke-width="1.4" fill="none"/>
          <path d="M56 98l6-2 2 4-6 2zM150 118l7-2 2 4-7 2z" fill="#C8A45E"/>
          ${wildebeest(196, 96, 0.62)}${wildebeest(206, 102, 0.55)}${wildebeest(214, 94, 0.5)}
          <path d="M150 96q14-4 34 0" stroke="#B8925E" stroke-width="1.6" stroke-dasharray="3 4" fill="none"/>`
        : `<g fill="#F4F8FC"><ellipse cx="58" cy="38" rx="16" ry="7"/><ellipse cx="72" cy="34" rx="12" ry="6"/><ellipse cx="170" cy="30" rx="14" ry="6"/></g>
          <path d="M52 44l-2 6M60 44l-2 6M166 38l-2 6M174 38l-2 6" stroke="#7EB2E8" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M30 100v-8M34 102v-8M96 112v-8M100 114v-8M160 104v-8M164 106v-8" stroke="#3E8E3E" stroke-width="1.6" stroke-linecap="round"/>
          ${wildebeest(70, 106)}${wildebeest(96, 98, 0.9)}${wildebeest(120, 110, 1.05)}${wildebeest(146, 100, 0.85)}${wildebeest(52, 96, 0.8)}`}
    </g>
    <rect x="104" y="138" width="32" height="8" fill="#1C2436"/>
    <rect x="88" y="146" width="64" height="5" rx="2.5" fill="#2E3A50"/>
    <circle cx="212" cy="26" r="3" fill="#E2574C"/>
  </svg>`;
}

export function renderHerdMove(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs4-herd" });
  const btn = el("button", { class: "hs4-flipbtn", attrs: { type: "button" }, text: "여섯 달 뒤로" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "자연 다큐를 보고 있어요. 1월의 세렝게티 초원 — 풀이 무성하고 <b>누 떼</b>가 가득해요. <b>여섯 달 뒤</b>엔 어떨까요?";

  let dry = false;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = herdSvg(dry);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (dry) return;
    dry = true;
    haptic(HAPTIC.tap);
    show();
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML = "같은 곳 맞아요?! 풀은 바싹 마르고, 누 떼는 <b>수백 km 북쪽</b>으로 떠났대요. 해마다 반복되는 대이동 — 왜일까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "비 내리는 곳이 계절 따라 바뀌어서, 풀을 따라 이동하는 것",
          "더위를 피해 시원한 곳으로 피서를 가는 것",
          "천적이 늘어나 도망을 다니는 것",
        ],
        good: "맞아요! 비의 띠가 계절 따라 움직여요 — 풀은 비를 따르고, 누 떼는 풀을 따르죠. 그 <b>움직이는 비 띠</b>를 직접 조종해 봐요!",
        bad: "더위나 천적 때문이라기엔 매년 같은 길을 왕복해요 — 비밀은 <b>비</b>! 비 내리는 곳이 계절 따라 바뀌고, 풀과 누 떼가 그 뒤를 따르죠. 움직이는 비 띠를 직접 조종해 봐요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L4: 사막 마을 골목 — 그늘의 지혜 ══════════ */
function laneSvg(inside: boolean): string {
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs4-hotsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A"/><stop offset="1" stop-color="#FFEBC2"/></linearGradient>
      <linearGradient id="hs4-mud" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E0B27A"/><stop offset=".55" stop-color="#C8965E"/><stop offset="1" stop-color="#A8764A"/></linearGradient>
      <linearGradient id="hs4-mudshade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B08454"/><stop offset="1" stop-color="#8F6438"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs4-hotsky)"/>
    ${inside
      ? `
      <rect x="6" y="6" width="228" height="156" rx="12" fill="#F5DFB2"/>
      <path d="M6 40h74v122H6z" fill="url(#hs4-mud)"/>
      <path d="M160 40h74v122h-74z" fill="url(#hs4-mudshade)"/>
      <rect x="80" y="34" width="80" height="128" fill="#6E5638" opacity=".55"/>
      <rect x="24" y="70" width="14" height="14" rx="2" fill="#5E4630"/>
      <rect x="46" y="96" width="12" height="18" rx="2" fill="#5E4630"/>
      <rect x="182" y="76" width="14" height="14" rx="2" fill="#4E3A28"/>
      <path d="M6 40h74M160 40h74" stroke="#8F6438" stroke-width="2.4"/>
      <path d="M14 52h58M14 64h58M168 56h58M168 68h58" stroke="#B08454" stroke-width="1" opacity=".6"/>
      <circle cx="120" cy="20" r="10" fill="#FFC24D"/>
      <ellipse cx="118" cy="152" rx="26" ry="4" fill="#2A1E12" opacity=".3"/>
      <g stroke="#3C4654" stroke-width="2.2" fill="none">
        <circle cx="118" cy="108" r="7" fill="#FFE8CE"/>
        <path d="M118 115v13M118 119l-8 3M118 119l8 2M118 128l-7 12M118 128l7 12"/>
        <path d="M114 105.4q2 1.8 4 1.8t4-1.8" stroke-width="1.5"/>
      </g>
      <path d="M129 121l6-2q3-1 3-4" stroke="#3C4654" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <rect x="136" y="110" width="7" height="6" rx="1.6" fill="#8ED2F5" stroke="#3C4654" stroke-width="1.6"/>`
      : `
      <circle cx="196" cy="30" r="13" fill="#FFB93C"/>
      <path d="M196 12v-4M212 18l3-3M218 32h5M180 18l-3-3" stroke="#E8940A" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M24 120q6-12 2-24M44 124q6-12 2-24M64 122q6-12 2-24" stroke="#E8B45E" stroke-width="2" fill="none" opacity=".7"/>
      <g transform="translate(120 96)">
        <rect x="-64" y="0" width="52" height="44" rx="3" fill="url(#hs4-mud)" stroke="#8F6438" stroke-width="1.6"/>
        <rect x="-6" y="6" width="46" height="38" rx="3" fill="url(#hs4-mud)" stroke="#8F6438" stroke-width="1.6"/>
        <rect x="46" y="2" width="50" height="42" rx="3" fill="url(#hs4-mud)" stroke="#8F6438" stroke-width="1.6"/>
        <rect x="-46" y="14" width="9" height="9" rx="1.6" fill="#5E4630"/>
        <rect x="12" y="18" width="9" height="9" rx="1.6" fill="#5E4630"/>
        <rect x="62" y="14" width="9" height="9" rx="1.6" fill="#5E4630"/>
        <path d="M-12 10v34M40 12v32" fill="none" stroke="#6E5638" stroke-width="2.6"/>
      </g>
      <ellipse cx="52" cy="150" rx="22" ry="4" fill="#2A1E12" opacity=".22"/>
      <g stroke="#3C4654" stroke-width="2.2" fill="none">
        <circle cx="52" cy="106" r="7" fill="#FFE8CE"/>
        <path d="M52 113v13M52 117l-9 2M52 117l9 2M52 126l-7 12M52 126l7 12"/>
        <path d="M49 104h6" stroke-width="1.5"/>
      </g>
      <path d="M60 116q6-4 4-10M64 118q7-4 6-12" stroke="#8FB0C8" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M44 96q-3-5 1-8M52 94q-3-5 1-8" stroke="#E8940A" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>`}
  </svg>`;
}

export function renderShadeLane(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs4-lane" });
  const btn = el("button", { class: "hs4-flipbtn", attrs: { type: "button" }, text: "골목으로 들어가기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "여행 브이로그 속 사막 마을이에요. 한낮의 땡볕 — 그런데 집들이 <b>다닥다닥</b> 붙어 있네요? <b>골목으로 들어가</b> 봐요.";

  let inside = false;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = laneSvg(inside);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (inside) return;
    inside = true;
    haptic(HAPTIC.tap);
    show();
    btn.classList.add("done");
    btn.disabled = true;
    face("smile");
    helper.innerHTML = "골목 안은 <b>짙은 그늘</b>에 시원한 바람까지! 두꺼운 흙벽 집들이 만든 서늘함이에요. 왜 이렇게 지었을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "집들 사이에 그늘이 지게 해 더위를 피하려고",
          "땅값이 비싸서 좁게 지을 수밖에 없어서",
          "옆집에 빨리 놀러 가려고",
        ],
        good: "정확해요! 해가 조금만 기울어도 골목에 그늘이 지도록 <b>촘촘하게</b> — 두꺼운 흙벽, 평평한 지붕까지 전부 환경에 맞춘 지혜랍니다. 아프리카의 생활 문화를 만나러 가요!",
        bad: "땅값이나 이웃 때문이 아니에요 — 방금 골목의 그늘을 느꼈죠? 집을 붙여 지으면 <b>그늘</b>이 생겨 더위를 피할 수 있어요. 환경에 맞춘 지혜, 아프리카의 생활 문화를 만나러 가요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L5: OTT 밤 — 영화 편수 2위의 나라 ══════════ */
function ottSvg(state: 0 | 1 | 2): string {
  const poster = (x: number, y: number, art: string, hot = false): string => `
    <g transform="translate(${x} ${y})">
      <rect width="38" height="52" rx="4" fill="#28324A" stroke="${hot ? "#F2C24E" : "#3A4658"}" stroke-width="${hot ? 2.4 : 1.4}"/>
      ${art}
    </g>`;
  const arts = [
    `<circle cx="19" cy="20" r="9" fill="#E8B93C"/><path d="M10 38q9-8 18 0" stroke="#C8965E" stroke-width="3" fill="none"/>`,
    `<circle cx="12" cy="14" r="3" fill="#8ED2F5"/><circle cx="26" cy="24" r="5" fill="#5A82B8"/><path d="M8 40l22-18" stroke="#8ED2F5" stroke-width="1.4"/>`,
    `<rect x="10" y="12" width="18" height="24" rx="3" fill="#8A93A6"/><circle cx="19" cy="20" r="4" fill="#2E3A50"/><path d="M14 40h10" stroke="#8A93A6" stroke-width="2"/>`,
    `<path d="M8 38l10-16 6 8 6-12v20z" fill="#5EA84E"/><circle cx="28" cy="14" r="4" fill="#FFC24D"/>`,
    `<path d="M19 10q8 6 8 16t-8 16q-8-6-8-16t8-16z" fill="#C86ECB"/>`,
    `<path d="M10 36q4-14 9-14t9 14z" fill="#C8965E"/><circle cx="19" cy="16" r="5" fill="#F2C24E"/>`,
  ];
  if (state < 2) {
    const row = state === 0 ? [0, 1, 2] : [3, 4, 5];
    return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
      <defs><linearGradient id="hs4-ott" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141C30"/><stop offset="1" stop-color="#1E2840"/></linearGradient></defs>
      <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs4-ott)"/>
      <rect x="18" y="18" width="70" height="9" rx="4.5" fill="#3A4658"/>
      ${poster(24, 40, arts[row[0]])}${poster(78, 40, arts[row[1]], state === 1)}${poster(132, 40, arts[row[2]])}
      <rect x="186" y="40" width="32" height="52" rx="4" fill="#222C42"/>
      <rect x="24" y="104" width="70" height="7" rx="3.5" fill="#2E3A50"/>
      <ellipse cx="120" cy="150" rx="70" ry="5" fill="#0A1020" opacity=".5"/>
      <g stroke="#5A6880" stroke-width="2.2" fill="none">
        <circle cx="196" cy="122" r="7" fill="#2E3A54"/>
        <path d="M196 129v13M196 133l-9 3M196 133l8-4M196 142l-7 11M196 142l7 11"/>
      </g>
      <rect x="212" y="124" width="12" height="20" rx="3" fill="#0C1220" stroke="#3E4E70" stroke-width="1.6"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs4-ott2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141C30"/><stop offset="1" stop-color="#1E2840"/></linearGradient>
      <linearGradient id="hs4-post" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5A55E"/><stop offset=".6" stop-color="#D9622E"/><stop offset="1" stop-color="#8F2D1D"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs4-ott2)"/>
    <g transform="translate(78 22)">
      <rect width="84" height="118" rx="6" fill="url(#hs4-post)" stroke="#F2C24E" stroke-width="2.6" class="hs4-pop"/>
      <circle cx="42" cy="34" r="14" fill="#FFE9B8"/>
      <path d="M14 96q10-26 18-26t10 12q4-18 12-18t14 32z" fill="#4E2A1E"/>
      <path d="M42 62v-14M36 54q6-8 12 0" stroke="#4E2A1E" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <rect x="10" y="102" width="64" height="8" rx="4" fill="#FFE9B8" opacity=".5"/>
    </g>
    <text x="120" y="158" text-anchor="middle" font-size="0" fill="none"> </text>
    <g transform="translate(44 96)">
      <circle r="13" fill="#28324A" stroke="#F2C24E" stroke-width="2"/>
      <text x="0" y="4.6" text-anchor="middle" font-size="13" font-weight="900" fill="#F2C24E">?</text>
    </g>
  </svg>`;
}

export function renderMovieNight(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs4-ott", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 다음 영화 보기" } });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "불 끄고 영화 고르는 밤! 뭘 볼지 몰라 포스터만 구경 중 — <b>화면을 탭</b>해서 넘겨 봐요.";

  let state: 0 | 1 | 2 = 0;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = ottSvg(state);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  const next = (): void => {
    if (state >= 2) return;
    state = (state + 1) as 1 | 2;
    haptic(HAPTIC.tap);
    show();
    if (state === 1) {
      helper.innerHTML = "볼 게 진짜 많네요. 그런데 문득 궁금해져요 — <b>이 많은 영화, 다 어디서 만들까?</b> 한 번 더 탭!";
    } else {
      face("curious");
      helper.innerHTML = "영화를 <b>가장 많이</b> 만드는 나라는 인도(볼리우드)래요. 그럼 <b>두 번째로 많이</b> 만드는 나라는 어디일까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? ["나이지리아", "미국", "프랑스"],
          good: "놀랍죠? 정답은 <b>나이지리아</b> — '놀리우드'라 불리며 한 해 2,500편 넘게 만들어요. 세계로 흘러간 아프리카 예술의 힘을 만나러 가요!",
          bad: "할리우드나 유럽을 떠올렸다면 반전! 편수 2위는 <b>나이지리아</b>예요 — '놀리우드'라 불리며 한 해 2,500편 넘게 만들죠. 세계로 흘러간 아프리카 예술의 힘을 만나러 가요!",
          onDone: finish,
        });
      }, 750);
    }
  };
  fig.addEventListener("click", next);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      next();
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L6: 대륙 학급 사진 — 반 나이의 한가운데 ══════════ */
function classSvg(state: 0 | 1 | 2): string {
  // state 0: 유럽 반(어른들 — 지팡이·서류가방) · 1: 아시아 반(고루 섞임) · 2: 아프리카 반(아이·청년 다수, 공놀이)
  const person = (x: number, y: number, h: number, extra = ""): string => `
    <g stroke="#3C4654" stroke-width="2" fill="none" transform="translate(${x} ${y})">
      <circle cx="0" cy="${-h}" r="5.4" fill="#FFE8CE"/>
      <path d="M0 ${-h + 5}v${h - 14}M0 ${-h + 9}l-6 4M0 ${-h + 9}l6 4M0 ${-9}l-5 9M0 ${-9}l5 9"/>
      ${extra}
    </g>`;
  const rows =
    state === 0
      ? `${person(56, 118, 34, `<path d="M8 -22v22" stroke-width="2.2"/>`)}${person(88, 118, 36)}${person(120, 118, 33, `<path d="M-9 -14h-4v-8" stroke-width="1.8"/>`)}${person(152, 118, 35)}${person(184, 118, 32, `<path d="M8 -20v20" stroke-width="2.2"/>`)}`
      : state === 1
        ? `${person(56, 118, 33)}${person(88, 118, 26)}${person(120, 118, 36)}${person(152, 118, 22)}${person(184, 118, 30)}`
        : `${person(52, 118, 20)}${person(78, 118, 16)}${person(104, 118, 24)}${person(130, 118, 15)}${person(156, 118, 19)}${person(184, 118, 28)}
          <circle cx="118" cy="128" r="5" fill="#E8590C" stroke="#A0400E" stroke-width="1.4"/>`;
  const tone = state === 0 ? "#8E9EC8" : state === 1 ? "#C2933A" : "#E8590C";
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs4-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2EFE8"/><stop offset="1" stop-color="#E2DCCE"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs4-wall)"/>
    <rect x="26" y="22" width="188" height="122" rx="8" fill="#FFFFFF" stroke="${tone}" stroke-width="5"/>
    <rect x="26" y="22" width="188" height="122" rx="8" fill="none" stroke="#2A3A5E" stroke-width="1" opacity=".2"/>
    <path d="M26 132h188" stroke="#D8D2C2" stroke-width="2"/>
    ${rows}
    <circle cx="46" cy="38" r="6" fill="${tone}" opacity=".8"/>
    <ellipse cx="120" cy="154" rx="86" ry="4" fill="#2A3A5E" opacity=".1"/>
  </svg>`;
}

export function renderClassPhoto(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs4-class", attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 다음 반 사진 보기" } });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "대륙을 <b>한 반</b>이라고 상상해 봐요. 반 사람들을 나이 순으로 줄 세웠을 때 <b>딱 한가운데 사람의 나이</b>를 '중위 연령'이라 해요. 첫 번째는 유럽 반 — <b>탭해서</b> 넘겨 봐요!";

  let state: 0 | 1 | 2 = 0;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = classSvg(state);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  const next = (): void => {
    if (state >= 2) return;
    state = (state + 1) as 1 | 2;
    haptic(HAPTIC.tap);
    show();
    if (state === 1) {
      helper.innerHTML = "이번엔 아시아 반 — 어른과 아이가 고루 섞여 있어요. <b>한 번 더 탭</b>, 마지막 반!";
    } else {
      face("curious");
      helper.innerHTML = "아프리카 반은 아이들과 청년이 유난히 많아요! 그럼 세 반 중 <b>중위 연령이 가장 낮은(어린) 반</b>은 어디일까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? ["아프리카", "아시아", "유럽"],
          good: "맞아요! 아프리카의 중위 연령은 <b>약 19세</b> — 세계에서 가장 젊은 대륙이에요. 젊다는 건 일하고 소비할 사람이 계속 늘어난다는 것. 이 대륙의 잠재력을 파헤쳐 봐요!",
          bad: "사진을 다시 봐요 — 아이와 청년이 가장 많던 반은 아프리카였죠? 중위 연령 <b>약 19세</b>, 세계에서 가장 젊은 대륙이에요. 젊음이 곧 힘 — 그 잠재력을 파헤쳐 봐요!",
          onDone: finish,
        });
      }, 750);
    }
  };
  fig.addEventListener("click", next);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      next();
    }
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L7: 뉴스 속 초록 깃발 ══════════ */
function flagSvg(zoom: boolean): string {
  if (!zoom) {
    return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
      <defs><linearGradient id="hs4-news" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2436"/><stop offset="1" stop-color="#28324A"/></linearGradient></defs>
      <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs4-news)"/>
      <rect x="16" y="20" width="208" height="112" rx="8" fill="#2E3A54"/>
      <path d="M16 108q104-16 208 0v24H16z" fill="#3A4A66"/>
      <ellipse cx="120" cy="104" rx="72" ry="12" fill="#4E5E7C"/>
      ${[64, 92, 120, 148, 176].map((x, i) => `
        <g transform="translate(${x} 74)">
          <path d="M0 0v22" stroke="#8A93A6" stroke-width="1.6"/>
          <path d="M0 2h13v8H0z" fill="${i === 2 ? "#2E7E4E" : ["#5A82B8", "#C2933A", "#2E7E4E", "#8E9EC8", "#B85A5A"][i]}"/>
        </g>`).join("")}
      ${[70, 98, 126, 154, 182].map((x) => `
        <g stroke="#5A6880" stroke-width="1.8" fill="none">
          <circle cx="${x}" cy="96" r="4.6" fill="#2E3A54"/>
          <path d="M${x} 100v8"/>
        </g>`).join("")}
      <rect x="16" y="120" width="120" height="10" rx="3" fill="#C0392E" opacity=".9"/>
      <rect x="20" y="123" width="70" height="4" rx="2" fill="#F2D8D2"/>
      <rect x="88" y="146" width="64" height="5" rx="2.5" fill="#2E3A50"/>
    </svg>`;
  }
  const stars = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
    return `<circle cx="${(120 + 62 * Math.cos(a)).toFixed(1)}" cy="${(82 + 44 * Math.sin(a)).toFixed(1)}" r="3.4" fill="#F2C24E" class="hs4-pop" style="animation-delay:${i * 40}ms"/>`;
  }).join("");
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs4-flag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3E7E56"/><stop offset=".55" stop-color="#2E6E46"/><stop offset="1" stop-color="#1E5636"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="#1C2436"/>
    <rect x="18" y="18" width="204" height="128" rx="10" fill="url(#hs4-flag)" stroke="#F2C24E" stroke-width="2"/>
    <g transform="translate(86 44) scale(.94)">
      <path d="${AFR_SIL}" fill="#F5EEDF" stroke="#D8C8A0" stroke-width="1.6"/>
    </g>
    ${stars}
    <path d="M40 32q10-4 18 2" stroke="#F5EEDF" stroke-width="1.4" opacity=".35" fill="none"/>
  </svg>`;
}

export function renderFlagStars(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs4-flag" });
  const btn = el("button", { class: "hs4-flipbtn", attrs: { type: "button" }, text: "깃발 확대하기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "국제 뉴스의 정상 회의 장면 — 각국 정상들 사이에 낯선 <b>초록 깃발</b>이 보여요. <b>확대</b>해 볼까요?";

  let zoom = false;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = flagSvg(zoom);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (zoom) return;
    zoom = true;
    haptic(HAPTIC.tap);
    show();
    btn.classList.add("done");
    btn.disabled = true;
    face("curious");
    helper.innerHTML = "초록 바탕에 아프리카 대륙, 그리고 대륙을 둘러싼 <b>별들의 원</b>! 이 별들은 무엇을 뜻할까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "이 연합에 함께하는 아프리카의 나라들",
          "아프리카 하늘에서 보이는 별자리",
          "아프리카에서 가장 높은 산들",
        ],
        good: "맞아요! 별 하나가 나라 하나 — <b>아프리카연합(AU)</b>의 55개 회원국이에요. 유럽연합처럼 아프리카도 손을 잡았죠. 어떤 청사진을 그리는지 보러 가요!",
        bad: "별자리도 산도 아니에요 — 별 하나가 <b>나라 하나</b>! 아프리카 55개국이 모인 <b>아프리카연합(AU)</b>의 깃발이랍니다. 손을 잡은 대륙의 청사진을 보러 가요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}

/* ══════════ L8: 위성 전후 — 사막 남쪽의 초록 선 ══════════ */
function greenSvg(after: boolean): string {
  return `<svg viewBox="0 0 240 168" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hs4-app2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C2436"/><stop offset="1" stop-color="#28324A"/></linearGradient>
      <linearGradient id="hs4-sahel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B269"/><stop offset=".55" stop-color="#CDa060"/><stop offset="1" stop-color="#B8925E"/></linearGradient>
    </defs>
    <rect x="6" y="6" width="228" height="156" rx="12" fill="url(#hs4-app2)"/>
    <rect x="14" y="28" width="200" height="112" rx="8" fill="url(#hs4-sahel)" stroke="#101828" stroke-width="1.6"/>
    <g clip-path="url(#hs4-gclip)"><clipPath id="hs4-gclip"><rect x="14" y="28" width="200" height="112" rx="8"/></clipPath>
      ${[0, 1, 2, 3].map((i) => `<path d="M14 ${40 + i * 12}q30-6 60 0t60 0q30-6 66 0" stroke="#C89A4E" stroke-width="4" fill="none" opacity=".45"/>`).join("")}
      <path d="M14 118q50 4 100 2t100-4v24H14z" fill="#B08A56" opacity=".8"/>
      <circle cx="60" cy="112" r="2.4" fill="#8F6438"/><circle cx="132" cy="120" r="2.4" fill="#8F6438"/><circle cx="188" cy="114" r="2.2" fill="#8F6438"/>
      ${after
        ? `<path d="M14 96q52-8 100-6t100 4" stroke="#2E9E5B" stroke-width="7" fill="none" stroke-linecap="round" class="hs4-pop"/>
          ${[30, 58, 86, 114, 142, 170, 198].map((x, i) => `<g transform="translate(${x} ${92 + (i % 2) * 3})"><path d="M0 4v-4" stroke="#1E6E3C" stroke-width="1.6"/><circle cy="-6" r="3.2" fill="#3F9A5C"/></g>`).join("")}
          <path d="M14 102q52-6 100-5t100 3" stroke="#7AC26E" stroke-width="2" fill="none" opacity=".6"/>`
        : ""}
    </g>
    <rect x="14" y="14" width="200" height="9" rx="4.5" fill="#3A4658"/>
    <circle cx="206" cy="18.5" r="2.6" fill="#8ED2F5"/>
    <rect x="18" y="146" width="${after ? 120 : 48}" height="5" rx="2.5" fill="#5A82B8"/>
  </svg>`;
}

export function renderGreenLine(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpt,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hs4-green" });
  const btn = el("button", { class: "hs4-flipbtn", attrs: { type: "button" }, text: "몇 년 뒤 모습 보기" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "위성 지도로 <b>사하라 사막의 남쪽 가장자리</b>를 보고 있어요. 메마른 모래와 흙의 땅 — <b>몇 년 뒤</b> 모습으로 넘겨 볼까요?";

  let after = false;
  let timer = 0;
  const show = (): void => {
    fig.innerHTML = greenSvg(after);
    fig.classList.remove("flip");
    void fig.offsetWidth;
    fig.classList.add("flip");
  };
  show();
  btn.addEventListener("click", () => {
    if (after) return;
    after = true;
    haptic(HAPTIC.tap);
    show();
    btn.classList.add("done");
    btn.disabled = true;
    face("surprised");
    helper.innerHTML = "같은 곳에 <b>가느다란 초록 선</b>이 생겼어요 — 지도를 가로질러 쭉! 이 선의 정체는 뭘까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "사막이 넓어지는 걸 막으려고 여러 나라가 함께 심는 숲",
          "우연히 자라난 거대한 잡초 밭",
          "초록색으로 포장한 고속도로",
        ],
        good: "정답! <b>그레이트 그린 월</b> — 사하라 남쪽 가장자리를 따라 아프리카 20개 나라가 함께 만드는 거대한 '초록 벽'이에요. 세계가 함께하는 노력들을 만나러 가요!",
        bad: "잡초도 도로도 저렇게 곧고 길 순 없죠 — 정체는 <b>나무의 벽</b>! 사막화를 막으려고 20개 나라가 함께 심는 <b>그레이트 그린 월</b>이에요. 세계가 함께하는 노력들을 만나러 가요!",
        onDone: finish,
      });
    }, 750);
  });
  return () => window.clearTimeout(timer);
}
