// hookBody3 — 중2 Ⅵ v3 훅 5장면. hook.ts가 scene 이름으로 위임한다.
// 장면: bodyscan(L1 체성분표 — 몸의 3분의 2가 물?!) · dripbag(L2 링거 미스터리) ·
//       hiccup(L4 딸꾹질의 범인) · peetest(L5 소변검사) · warmbody(L6 한겨울 체온)
// 공용 규칙: 예측은 반드시 hookAsk.ask()(choices[0]=정답, good≠bad), 소재명은 도입에서 소개.
// 스타일은 styles/body3-hook.css(.hb3- 접두). 현행 hookBody 6종·v2 hookAnimal 12종과 이름·장면 무충돌.
// L3(순환)는 하비 만화(comic)로 열어 훅이 없다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";

type Face = (kind: "smile" | "surprised" | "curious") => void;
interface HookLike {
  choices?: string[];
}

/** L1 bodyscan — 체성분 측정 결과지: 몸 실루엣의 물 게이지가 3분의 2까지 차오른다.
 *  "몸은 무엇으로 지어졌나"를 영양소 단원의 문으로 쓴다. */
export function renderBodyScan(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hb3-stage hb3-bs", attrs: { role: "button", tabindex: "0", "aria-label": "체성분 측정 시작하기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 216" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hb3bsPad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#EDF2F8"/><stop offset="1" stop-color="#D9E2EE"/>
      </linearGradient>
      <linearGradient id="hb3bsWater" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#1E9BB8"/><stop offset="0.7" stop-color="#22B8CF"/><stop offset="1" stop-color="#66D9E8"/>
      </linearGradient>
      <clipPath id="hb3bsBody"><path d="M120 44 a17 17 0 1 1 34 0 a17 17 0 1 1 -34 0 M118 66 c-12 4 -18 14 -18 28 v34 c0 6 8 6 9 0 l3 -26 v82 c0 8 12 8 13 0 l4 -52 h6 l4 52 c1 8 13 8 13 0 v-82 l3 26 c1 6 9 6 9 0 v-34 c0 -14 -6 -24 -18 -28 Z"/></clipPath>
    </defs>
    <ellipse cx="160" cy="206" rx="140" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <rect x="96" y="196" width="130" height="12" rx="6" fill="url(#hb3bsPad)" stroke="#B9C6D6" stroke-width="2.4"/>
    <circle cx="116" cy="202" r="3" fill="#8FA3BA"/><circle cx="206" cy="202" r="3" fill="#8FA3BA"/>
    <!-- 몸 실루엣(빈 병) + 물 게이지 -->
    <g>
      <path d="M120 44 a17 17 0 1 1 34 0 a17 17 0 1 1 -34 0 M118 66 c-12 4 -18 14 -18 28 v34 c0 6 8 6 9 0 l3 -26 v82 c0 8 12 8 13 0 l4 -52 h6 l4 52 c1 8 13 8 13 0 v-82 l3 26 c1 6 9 6 9 0 v-34 c0 -14 -6 -24 -18 -28 Z" fill="#FDFBF7" stroke="#4E5968" stroke-width="3"/>
      <g clip-path="url(#hb3bsBody)">
        <rect class="bs-fill" x="92" y="24" width="140" height="176" fill="url(#hb3bsWater)"/>
        <path class="bs-wave" d="M92 26 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 v8 h-120 Z" fill="#A5E7F0" opacity="0.55"/>
      </g>
      <circle cx="130" cy="41" r="2.4" fill="#4E5968"/><circle cx="144" cy="41" r="2.4" fill="#4E5968"/>
      <path d="M132 50 q5 4 10 0" stroke="#4E5968" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    </g>
    <!-- 결과지 카드 -->
    <g class="bs-sheet">
      <rect x="216" y="52" width="86" height="112" rx="10" fill="#FFFFFF" stroke="#C9D3DF" stroke-width="2.6"/>
      <rect x="226" y="64" width="66" height="9" rx="4.5" fill="#DEE6EF"/>
      <rect x="226" y="84" width="44" height="7" rx="3.5" fill="#22B8CF"/>
      <rect x="226" y="98" width="30" height="7" rx="3.5" fill="#E9EEF4"/>
      <rect x="226" y="112" width="36" height="7" rx="3.5" fill="#E9EEF4"/>
      <rect x="226" y="126" width="26" height="7" rx="3.5" fill="#E9EEF4"/>
      <text class="bs-q" x="259" y="152" text-anchor="middle" font-size="17" font-weight="800" fill="#22B8CF">?</text>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "학교 신체검사 날, <b>체성분 측정기</b> 위에 올라갔어요. 결과지에서 유난히 큰 항목이 하나 — 파란 줄의 <b>체수분</b>이에요. 실루엣을 <b>탭</b>해서 몸을 스캔해 보세요.";

  let scanned = false;
  const scan = (): void => {
    if (scanned) return;
    scanned = true;
    haptic(HAPTIC.tap);
    face("surprised");
    fig.classList.add("scan");
    helper.innerHTML = "스캔 중… 파란 게이지가 몸을 타고 차오르다가 <b>절반을 훌쩍 넘긴 곳</b>에서 멈칫해요. 우리 몸을 이루는 성분 중 <b>가장 많은 것</b>은 뭘까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "물 — 몸의 3분의 2가량이 물이다",
          "단백질 — 살과 근육이 대부분이니까",
          "무기염류 — 단단한 뼈가 가장 무거우니까",
        ],
        good: "맞아요! 우리 몸 구성 성분 중 <b>가장 많은 것은 물</b>이에요 — 몸의 3분의 2가량이 물이죠. 그리고 물도, 단백질도, 뼈의 재료도 전부 <b>음식물 속 영양소</b>에서 왔답니다. 몸이라는 집의 재료 창고를 열어 봐요!",
        bad: "살도 뼈도 있지만 1위는 따로 있어요 — 우리 몸의 <b>3분의 2가량은 물</b>이랍니다. 그리고 물을 포함한 몸의 재료는 전부 <b>음식물 속 영양소</b>에서 왔어요. 재료 창고를 열어 봐요!",
        onDone: finish,
      });
    }, 1500);
  };
  fig.addEventListener("click", scan);
  fig.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      scan();
    }
  });
}

/** L2 dripbag — 링거 미스터리: 밥을 못 먹어도 포도당 수액으로 기운이 난다.
 *  "크기가 큰 영양소는 그대로 쓸 수 없다"(소화의 필요성)를 예측으로 세운다. */
export function renderDripBag(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hb3-stage hb3-dp", attrs: { role: "button", tabindex: "0", "aria-label": "수액 팩 열기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 216" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hb3dpBag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FDFEFF"/><stop offset="0.6" stop-color="#EAF4FD"/><stop offset="1" stop-color="#D7E9F9"/>
      </linearGradient>
      <linearGradient id="hb3dpBed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFF7EC"/><stop offset="1" stop-color="#F3E3CC"/>
      </linearGradient>
    </defs>
    <ellipse cx="160" cy="208" rx="146" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <!-- 침대 + 스틱맨 -->
    <rect x="18" y="150" width="200" height="42" rx="10" fill="url(#hb3dpBed)" stroke="#D9BE93" stroke-width="3"/>
    <rect x="18" y="140" width="46" height="26" rx="8" fill="#FFFFFF" stroke="#D9C7A8" stroke-width="2.6"/>
    <rect x="24" y="192" width="8" height="14" rx="3" fill="#C9A876"/><rect x="196" y="192" width="8" height="14" rx="3" fill="#C9A876"/>
    <g stroke="#333D4B" stroke-width="3" stroke-linecap="round" fill="none">
      <circle cx="52" cy="128" r="13" fill="#FFFFFF"/>
      <path d="M65 138 c22 -4 44 -4 66 0 M131 138 l28 4"/>
    </g>
    <circle cx="48" cy="126" r="2" fill="#333D4B"/><circle cx="57" cy="126" r="2" fill="#333D4B"/>
    <path d="M49 133 q4 3 8 0" stroke="#333D4B" stroke-width="2" stroke-linecap="round" fill="none"/>
    <rect x="64" y="136" width="112" height="16" rx="8" fill="#B7E3F5" stroke="#7CC0DE" stroke-width="2.4"/>
    <!-- 링거 폴대 + 수액 팩 -->
    <path d="M262 200 v-160 h-30" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    <path d="M244 200 h36" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    <g class="dp-bag">
      <rect x="212" y="44" width="42" height="58" rx="9" fill="url(#hb3dpBag)" stroke="#7CA6CC" stroke-width="3"/>
      <rect x="224" y="36" width="18" height="10" rx="3" fill="#9AB8D4"/>
      <rect x="218" y="56" width="30" height="20" rx="4" fill="#FFFFFF" stroke="#B9D2E8" stroke-width="1.8"/>
      <circle cx="226" cy="66" r="3" fill="#FF922B"/><circle cx="236" cy="63" r="3" fill="#FF922B"/><circle cx="241" cy="70" r="3" fill="#FF922B"/>
      <path d="M218 50 c5 -3 11 -4 16 -4" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
    </g>
    <g class="dp-cham">
      <rect x="227" y="108" width="12" height="18" rx="5" fill="#EAF4FD" stroke="#7CA6CC" stroke-width="2.4"/>
      <circle class="dp-drop" cx="233" cy="114" r="2.6" fill="#4DABF7"/>
    </g>
    <path class="dp-tube" d="M233 126 C233 156 196 132 172 143" stroke="#A5CBE8" stroke-width="3.4" stroke-linecap="round" fill="none"/>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "몸살로 아무것도 못 먹은 날 — 병원에서 <b>링거(수액)</b>를 맞으면 신기하게 기운이 나요. 팩 안에는 <b>포도당</b>이 녹아 있대요. 수액 팩을 <b>탭</b>해 보세요.";

  let dripped = false;
  const drip = (): void => {
    if (dripped) return;
    dripped = true;
    haptic(HAPTIC.tap);
    face("curious");
    fig.classList.add("drip");
    helper.innerHTML = "똑, 똑 — <b>포도당</b>이 혈관으로 곧장 들어가 기운을 채워요. 그런데 이상하죠. 밥의 주성분인 <b>녹말</b>을 물에 풀어 혈관에 넣으면 안 될까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "녹말은 포도당보다 훨씬 커서, 그대로는 몸의 세포가 쓸 수 없다",
          "녹말도 포도당과 크기가 비슷해서 그대로 넣어도 된다",
          "녹말이 포도당보다 작아서 오히려 더 잘 들어간다",
        ],
        good: "정확해요! <b>포도당은 아주 작아</b> 세포 안으로 바로 들어가지만, <b>녹말·단백질·지방은 커서</b> 그대로는 들어가지 못해요. 그래서 몸에는 큰 영양소를 잘게 나누는 과정 — <b>소화</b>가 필요하답니다.",
        bad: "크기가 문제예요 — <b>녹말은 포도당이 길게 이어진 큰 덩어리</b>라 그대로는 세포로 들어갈 수 없어요. 그래서 큰 영양소를 작게 나누는 과정, <b>소화</b>가 필요한 거랍니다.",
        onDone: finish,
      });
    }, 1100);
  };
  fig.addEventListener("click", drip);
  fig.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      drip();
    }
  });
}

/** L4 hiccup — 딸꾹질의 범인: 가슴과 배 사이 근육 막(가로막)의 존재를 일상에서 발견.
 *  "허파는 스스로 못 움직인다"로 이어지는 문. */
export function renderHiccup(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hb3-stage hb3-hc", attrs: { role: "button", tabindex: "0", "aria-label": "몸속 들여다보기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 216" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="hb3hcLung" cx="0.38" cy="0.3" r="1">
        <stop offset="0" stop-color="#FFD9DF"/><stop offset="0.65" stop-color="#F7AEB9"/><stop offset="1" stop-color="#E98D9C"/>
      </radialGradient>
      <linearGradient id="hb3hcCup" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#EAF6FF"/><stop offset="1" stop-color="#CBE7F7"/>
      </linearGradient>
    </defs>
    <ellipse cx="160" cy="208" rx="140" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <g class="hc-body">
      <g stroke="#333D4B" stroke-width="3" stroke-linecap="round" fill="none">
        <circle cx="120" cy="46" r="15" fill="#FFFFFF"/>
        <path d="M120 61 v14"/>
      </g>
      <circle cx="115" cy="44" r="2.2" fill="#333D4B"/><circle cx="125" cy="44" r="2.2" fill="#333D4B"/>
      <ellipse class="hc-mouth" cx="120" cy="52" rx="3" ry="4" fill="#333D4B"/>
      <!-- 몸통 반투명 뷰(몸속) -->
      <path d="M88 82 q32 -14 64 0 l6 82 q-38 12 -76 0 Z" fill="#FFF3EE" stroke="#4E5968" stroke-width="3"/>
      <g class="hc-lungs">
        <path d="M104 96 c-9 3 -13 14 -13 26 c0 12 6 19 13 19 c7 0 11 -8 11 -20 v-18 c0 -6 -5 -9 -11 -7 Z" fill="url(#hb3hcLung)" stroke="#C4707F" stroke-width="2.6"/>
        <path d="M136 96 c9 3 13 14 13 26 c0 12 -6 19 -13 19 c-7 0 -11 -8 -11 -20 v-18 c0 -6 5 -9 11 -7 Z" fill="url(#hb3hcLung)" stroke="#C4707F" stroke-width="2.6"/>
        <path d="M120 84 v22 M120 100 l-9 6 M120 100 l9 6" stroke="#C4707F" stroke-width="3" stroke-linecap="round"/>
      </g>
      <path class="hc-dia" d="M90 148 q30 -14 60 0" stroke="#E23B4B" stroke-width="4.5" stroke-linecap="round" fill="none"/>
      <path d="M86 166 q34 10 68 0" stroke="#D9BE93" stroke-width="2.4" stroke-dasharray="4 5" fill="none" opacity="0.7"/>
    </g>
    <g class="hc-jolt" opacity="0">
      <path d="M64 84 l-10 -8 M60 104 l-12 0 M64 124 l-10 8" stroke="#F59F00" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M176 84 l10 -8 M180 104 l12 0 M176 124 l10 8" stroke="#F59F00" stroke-width="3.6" stroke-linecap="round"/>
    </g>
    <!-- 물컵 -->
    <g>
      <path d="M236 148 l6 44 h30 l6 -44 Z" fill="url(#hb3hcCup)" stroke="#8FB8D4" stroke-width="3"/>
      <path d="M241 158 l3 26 q13 5 26 0 l3 -26 q-16 -6 -32 0 Z" fill="#9BD6F0" opacity="0.75"/>
      <path d="M242 152 c6 -2 12 -3 18 -3" stroke="#FFFFFF" stroke-width="3.6" stroke-linecap="round" opacity="0.7"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "물을 급하게 마시다가 — <b>딸꾹!</b> 몸이 저 혼자 움찔했어요. 몸속이 비치는 그림에서 <b>가슴 아래 빨간 막</b>이 보이죠? 몸통을 <b>탭</b>해서 딸꾹질을 재현해 보세요.";

  let jolted = false;
  const jolt = (): void => {
    if (jolted) return;
    jolted = true;
    haptic(HAPTIC.wrong);
    face("surprised");
    fig.classList.add("jolt");
    helper.innerHTML = "딸꾹! — 방금 <b>가슴과 배 사이의 빨간 막</b>이 제멋대로 움찔하면서 숨이 훅 끌려 들어왔어요. 딸꾹질의 범인, 이 막의 정체는 뭘까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "가슴과 배 사이를 가르는 근육 막 — 숨쉬기를 움직이는 장치다",
          "허파 그 자체 — 허파가 스스로 크게 움직인 것이다",
          "심장 — 심장이 박자를 놓치면 딸꾹질이 난다",
        ],
        good: "정답! 이 막의 이름은 <b>가로막</b> — 허파 아래에 지붕처럼 펼쳐진 <b>근육 막</b>이에요. 사실 <b>허파에는 근육이 없어 스스로 움직이지 못하고</b>, 이 가로막과 갈비뼈가 숨을 만들어 준답니다. 어떻게? 오늘 랩에서 확인해요.",
        bad: "허파도 심장도 범인이 아니에요 — <b>허파에는 근육이 없어 스스로 움직이지 못해요</b>. 움찔한 범인은 가슴과 배 사이의 근육 막, <b>가로막</b>! 이 막과 갈비뼈가 숨을 만드는 원리를 오늘 랩에서 확인해요.",
        onDone: finish,
      });
    }, 1000);
  };
  fig.addEventListener("click", jolt);
  fig.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      jolt();
    }
  });
}

/** L5 peetest — 신체검사 소변검사: 오줌 몇 방울에 몸속 사정이 담기는 까닭.
 *  "오줌은 혈액에서 걸러 만든 것"을 예측으로 세워 여과·재흡수로 잇는다. */
export function renderPeeTest(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hb3-stage hb3-pt", attrs: { role: "button", tabindex: "0", "aria-label": "검사 스틱 담그기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 216" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hb3ptCup" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FEFEFB"/><stop offset="1" stop-color="#EFEBDD"/>
      </linearGradient>
      <linearGradient id="hb3ptDesk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#EDE0C8"/><stop offset="1" stop-color="#DCC9A4"/>
      </linearGradient>
    </defs>
    <rect x="0" y="168" width="320" height="48" fill="url(#hb3ptDesk)"/>
    <path d="M0 168 h320" stroke="#C3AB7E" stroke-width="3"/>
    <ellipse cx="120" cy="196" rx="90" ry="7" fill="#2A3A5E" opacity="0.08"/>
    <!-- 종이컵(소변 시료) -->
    <g>
      <path d="M84 108 l10 82 h52 l10 -82 Z" fill="url(#hb3ptCup)" stroke="#C9BD9C" stroke-width="3"/>
      <ellipse cx="120" cy="108" rx="36" ry="9" fill="#FFFDF6" stroke="#C9BD9C" stroke-width="3"/>
      <ellipse cx="120" cy="112" rx="28" ry="6.5" fill="#F5D664"/>
      <path d="M92 120 c8 -3 16 -4 24 -4" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.65"/>
    </g>
    <!-- 검사 스틱(색 패치 4칸) -->
    <g class="pt-stick">
      <rect x="212" y="34" width="18" height="118" rx="6" fill="#FFFFFF" stroke="#B9C2CC" stroke-width="2.6"/>
      <rect class="pt-pad pt-p1" x="216" y="112" width="10" height="12" rx="2.5" fill="#E9EEF4"/>
      <rect class="pt-pad pt-p2" x="216" y="96" width="10" height="12" rx="2.5" fill="#E9EEF4"/>
      <rect class="pt-pad pt-p3" x="216" y="80" width="10" height="12" rx="2.5" fill="#E9EEF4"/>
      <rect class="pt-pad pt-p4" x="216" y="64" width="10" height="12" rx="2.5" fill="#E9EEF4"/>
    </g>
    <!-- 결과 카드(뒤 배경) -->
    <g opacity="0.9">
      <rect x="252" y="60" width="52" height="92" rx="8" fill="#FFFFFF" stroke="#D3DAE3" stroke-width="2.4"/>
      <rect x="259" y="70" width="38" height="7" rx="3.5" fill="#DEE6EF"/>
      <circle cx="266" cy="92" r="5" fill="#FFD43B"/><rect x="276" y="88" width="20" height="7" rx="3.5" fill="#EDF1F6"/>
      <circle cx="266" cy="112" r="5" fill="#74B816"/><rect x="276" y="108" width="20" height="7" rx="3.5" fill="#EDF1F6"/>
      <circle cx="266" cy="132" r="5" fill="#4DABF7"/><rect x="276" y="128" width="20" height="7" rx="3.5" fill="#EDF1F6"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "신체검사 날 보건실 — 종이컵에 <b>오줌</b>을 조금 받고, 색 패치가 달린 <b>검사 스틱</b>을 담그면 건강 상태를 알 수 있대요. 스틱을 <b>탭</b>해서 담가 보세요.";

  let dipped = false;
  const dip = (): void => {
    if (dipped) return;
    dipped = true;
    haptic(HAPTIC.tap);
    face("curious");
    fig.classList.add("dip");
    helper.innerHTML = "스틱의 패치들이 <b>알록달록 색을 바꿔요</b> — 오줌 몇 방울에서 몸속 건강이 읽히는 거예요. 어떻게 이런 일이 가능할까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "오줌은 혈액을 걸러 만든 것이라, 몸속 사정이 그대로 담겨 있다",
          "오줌은 마신 물이 그대로 나온 것이라, 물의 성분을 알 수 있다",
          "오줌 색이 진하면 병, 연하면 건강 — 색만 보면 된다",
        ],
        good: "핵심을 짚었어요! 오줌은 <b>혈액을 거르고 추려서</b> 만든 액체예요. 그래서 혈액 속 사정 — 몸의 상태가 오줌에 묻어나죠. 혈액을 거르는 그 정수장이 바로 <b>콩팥</b>이랍니다.",
        bad: "마신 물이 그대로 나오는 게 아니에요 — 오줌은 <b>혈액을 거르고 추려서</b> 만든 액체랍니다. 그래서 혈액 속 사정이 오줌에 담기는 거예요. 이 일을 하는 정수장이 <b>콩팥</b>이죠.",
        onDone: finish,
      });
    }, 1200);
  };
  fig.addEventListener("click", dip);
  fig.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      dip();
    }
  });
}

/** L6 warmbody — 한겨울 밤에도 36.5℃: 몸의 열은 어디서 오나.
 *  세포호흡(영양소 분해 = 에너지)의 문. */
export function renderWarmBody(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hb3-stage hb3-wm", attrs: { role: "button", tabindex: "0", "aria-label": "체온계 확인하기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 216" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hb3wmSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2A3654"/><stop offset="1" stop-color="#46567E"/>
      </linearGradient>
      <linearGradient id="hb3wmQuilt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFB3B9"/><stop offset="1" stop-color="#F08792"/>
      </linearGradient>
    </defs>
    <!-- 창밖 겨울 밤 -->
    <rect x="26" y="26" width="104" height="88" rx="10" fill="url(#hb3wmSky)" stroke="#6E7B99" stroke-width="3"/>
    <path d="M78 26 v88 M26 70 h104" stroke="#6E7B99" stroke-width="3"/>
    <circle cx="48" cy="46" r="2.4" fill="#DCE8F5"/><circle cx="102" cy="40" r="2" fill="#DCE8F5"/><circle cx="62" cy="94" r="2.2" fill="#DCE8F5"/>
    <circle cx="94" cy="86" r="2.4" fill="#DCE8F5"/><circle cx="42" cy="82" r="1.8" fill="#DCE8F5"/><circle cx="112" cy="98" r="2" fill="#DCE8F5"/>
    <!-- 침대 + 이불 속 스틱맨 -->
    <ellipse cx="170" cy="204" rx="140" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <rect x="60" y="182" width="230" height="18" rx="8" fill="#D9BE93" stroke="#B99A66" stroke-width="3"/>
    <g stroke="#333D4B" stroke-width="3" stroke-linecap="round" fill="none">
      <circle cx="100" cy="152" r="14" fill="#FFFFFF"/>
    </g>
    <circle cx="95" cy="150" r="2.2" fill="#333D4B"/><circle cx="105" cy="150" r="2.2" fill="#333D4B"/>
    <path d="M96 158 q4 3 8 0" stroke="#333D4B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M118 148 q60 -22 150 -8 q14 2 14 20 v10 q0 12 -14 12 h-138 q-14 0 -14 -14 Z" fill="url(#hb3wmQuilt)" stroke="#D06070" stroke-width="3"/>
    <path d="M150 150 q8 14 0 30 M192 146 q8 14 0 30 M234 146 q8 14 0 30" stroke="#FFD3D9" stroke-width="2.6" fill="none"/>
    <!-- 열 아지랑이(답 공개 연출) -->
    <g class="wm-heat" opacity="0">
      <path d="M96 122 q5 -8 0 -16 q-5 -8 0 -16" stroke="#FFA94D" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      <path d="M112 126 q5 -8 0 -16 q-5 -8 0 -16" stroke="#FFC078" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    </g>
    <!-- 체온계 -->
    <g class="wm-thermo">
      <rect x="236" y="52" width="54" height="26" rx="13" fill="#FFFFFF" stroke="#B9C2CC" stroke-width="3"/>
      <rect x="230" y="60" width="12" height="10" rx="5" fill="#C9CDD2"/>
      <rect class="wm-num" x="246" y="60" width="34" height="10" rx="4" fill="#E9EEF4"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "창밖은 눈 내리는 <b>한겨울 밤</b>, 난로도 핫팩도 없어요. 그런데 이불 속 몸은 밤새 따끈해요. 귀에 대는 <b>체온계</b>를 탭해서 재 볼까요?";

  let checked = false;
  const check = (): void => {
    if (checked) return;
    checked = true;
    haptic(HAPTIC.tap);
    face("surprised");
    fig.classList.add("hot");
    helper.innerHTML = "삑 — <b>36.5도</b>. 방 공기는 차가운데 몸은 온종일, 밤새도록 이 온도를 지켜요. 몸을 데우는 이 <b>열</b>은 대체 어디서 나올까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "온몸의 세포가 영양소를 분해하면서 에너지를 내고 있다",
          "심장이 뜨거워서 온몸에 열을 돌린다",
          "이불이 열을 만들어 몸을 데워 준다",
        ],
        good: "정확해요! 지금 이 순간에도 <b>온몸의 세포</b>가 영양소를 분해해 에너지를 꺼내고 있어요 — 그 에너지의 일부가 <b>체온</b>이 되죠. 이 과정의 이름이 오늘의 주인공, <b>세포호흡</b>이랍니다.",
        bad: "이불은 열을 <b>만들지</b> 못해요(새어 나가는 열을 막을 뿐) — 심장도 펌프이지 난로가 아니죠. 열의 진짜 공장은 <b>온몸의 세포</b>! 세포가 영양소를 분해해 에너지를 꺼내는 <b>세포호흡</b>이 오늘의 주인공이에요.",
        onDone: finish,
      });
    }, 1100);
  };
  fig.addEventListener("click", check);
  fig.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      check();
    }
  });
}
