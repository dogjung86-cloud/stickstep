// hookStar — 중2 VIII(별과 우주) 훅 장면 7종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법 + 천체는 실사(public/photos/star/, NASA·ESO — SVG로 그리지 않는다) 원칙.
// 상태 애니메이션 CSS는 ui.css의 "중2 VIII 별과 우주 훅(hookStar)" 섹션 — 접두사 hst-.
//   thumbjump   L1 엄지 시차 — 왼눈·오른눈 전환에 엄지가 점프 + 예측(가까우면 점프 폭?)
//   nightroad   L2 밤길 가로등 — 같은 등인데 멀수록 어둑 + 예측(왜?)
//   brightlie   L3 가장 밝아 보이는 별이 최강? — 시리우스 vs 데네브 거리 반전 + 예측
//   gasflame    L4 파란 가스불 vs 주황 촛불 — 어느 쪽이 더 뜨거울까 + 예측
//   milkyband   L5 시골 밤하늘의 뿌연 띠(은하수 실사) — 정체 예측
//   orionblur   L6 오리온 허리띠 아래 뿌연 얼룩(실사 스코프) — 정체 예측
//   movingstar  L8 밤하늘을 천천히 가로지르는 밝은 점(ISS 실사) — 정체 예측

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const starPhoto = (name: string): string => `${base}photos/star/${name}`;

// ══════════════════════════════════════════════════════════
// L1. thumbjump — 엄지 시차(왼눈·오른눈 전환)
// ══════════════════════════════════════════════════════════
export function renderThumbJump(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hst-frame" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="tjSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#BFDCFA"/><stop offset=".72" stop-color="#DCEDFC"/><stop offset="1" stop-color="#EAF4FD"/>
      </linearGradient>
      <linearGradient id="tjThumb" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#F4C89A"/><stop offset=".55" stop-color="#EDB37E"/><stop offset="1" stop-color="#D89860"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#tjSky)"/>
    <!-- 먼 배경: 산과 나무(움직이지 않는 기준) -->
    <path d="M4 120 L60 84 L112 118 L164 80 L236 122 L236 166 L4 166 Z" fill="#A9CBEA" opacity=".7"/>
    <g stroke="#4E7A4E" stroke-width="3">
      <line x1="70" y1="118" x2="70" y2="96"/><line x1="170" y1="116" x2="170" y2="94"/>
    </g>
    <circle cx="70" cy="88" r="12" fill="#69A869"/><circle cx="170" cy="86" r="12" fill="#69A869"/>
    <ellipse cx="120" cy="150" rx="86" ry="7" fill="#2A3A5E" opacity=".10"/>
    <!-- 엄지(두 위치 — 눈에 따라 전환) -->
    <g class="hst-thumb L">
      <path d="M92 150 L92 108 Q92 96 102 96 Q112 96 112 108 L112 150 Z" fill="url(#tjThumb)" stroke="#8A5A30" stroke-width="1.5"/>
      <path d="M96 104 Q98 100 103 100" stroke="#C88E58" stroke-width="1.4"/>
    </g>
    <g class="hst-thumb R">
      <path d="M128 150 L128 108 Q128 96 138 96 Q148 96 148 108 L148 150 Z" fill="url(#tjThumb)" stroke="#8A5A30" stroke-width="1.5"/>
      <path d="M132 104 Q134 100 139 100" stroke="#C88E58" stroke-width="1.4"/>
    </g>
    <!-- 점프 화살표 -->
    <path class="hst-jump" d="M104 88 Q120 76 136 88" stroke="#3182F6" stroke-width="2.6" stroke-dasharray="4 4"/>
  </svg>`;
  const btnL = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "왼눈만 뜨기" }));
  const btnR = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "오른눈만 뜨기" }));
  const row = el("div", { class: "gp-controls" }, btnL, btnR);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, row, choicesBox);
  helper.innerHTML = "팔을 쭉 뻗고 엄지를 세웠어요. <b>한쪽 눈씩 번갈아</b> 떠 보세요!";

  let swaps = 0;
  let asked = false;
  const seen = new Set<string>();
  const press = (side: "L" | "R"): void => {
    fig.classList.toggle("eyeR", side === "R");
    seen.add(side);
    swaps++;
    haptic(HAPTIC.tap);
    if (seen.size >= 2 && swaps >= 3 && !asked) {
      asked = true;
      face("surprised");
      helper.innerHTML = "엄지가 나무 사이를 <b>폴짝폴짝 점프</b>해요! 그럼 — 팔을 굽혀 엄지를 <b>얼굴 가까이</b> 가져오면, 점프 폭은 어떻게 될까요?";
      choicesBox.classList.add("show");
      ask(choicesBox, helper, {
        choices: ["점프 폭이 더 커진다", "점프 폭이 더 작아진다", "그대로다"],
        good: "맞아요! <b>가까울수록 위치 차(시차)가 커져요</b>. 별도 똑같아요 — 이 점프 폭으로 <b>별까지의 거리</b>를 잰답니다.",
        bad: "직접 해 보면 반대예요 — 엄지가 가까울수록 두 눈의 <b>보는 방향 차이가 커져서</b> 점프 폭도 커져요. 이 원리로 별까지 거리를 재요!",
        onDone: finish,
      });
    }
  };
  const onL = (): void => press("L");
  const onR = (): void => press("R");
  btnL.addEventListener("click", onL);
  btnR.addEventListener("click", onR);
  return () => {
    btnL.removeEventListener("click", onL);
    btnR.removeEventListener("click", onR);
  };
}

// ══════════════════════════════════════════════════════════
// L2. nightroad — 밤길 가로등(같은 등, 다른 밝기)
// ══════════════════════════════════════════════════════════
export function renderNightRoad(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hst-frame" });
  const lampAt = (x: number, y: number, s: number, glow: number): string => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <circle cx="0" cy="-46" r="${18 * glow}" fill="url(#nrGlow)"/>
      <line x1="0" y1="0" x2="0" y2="-42" stroke="#2E3A50" stroke-width="4"/>
      <circle cx="0" cy="-46" r="6" fill="#FFF0BE" stroke="#8A6A20" stroke-width="1.2"/>
      <ellipse cx="0" cy="2" rx="14" ry="3" fill="#2A3A5E" opacity=".12"/>
    </g>`;
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="nrSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226"/><stop offset=".75" stop-color="#16223E"/><stop offset="1" stop-color="#202E4E"/>
      </linearGradient>
      <radialGradient id="nrGlow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFF2C4" stop-opacity=".95"/><stop offset=".5" stop-color="#FFE9A8" stop-opacity=".4"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#nrSky)"/>
    <path d="M4 150 L236 128 L236 166 L4 166 Z" fill="#1A2440"/>
    <path d="M18 156 L226 133" stroke="#3A4A70" stroke-width="2" stroke-dasharray="8 10" opacity=".6"/>
    ${lampAt(52, 148, 1.35, 1.25)}
    ${lampAt(136, 141, 0.92, 0.8)}
    ${lampAt(198, 136, 0.62, 0.5)}
    <!-- 스틱맨(밤 라인) -->
    <g stroke="#E8EEF8" stroke-width="2.6" fill="none">
      <circle cx="30" cy="120" r="8" fill="none"/>
      <line x1="30" y1="128" x2="30" y2="146"/>
      <line x1="30" y1="134" x2="21" y2="141"/><line x1="30" y1="134" x2="39" y2="141"/>
      <line x1="30" y1="146" x2="23" y2="158"/><line x1="30" y1="146" x2="37" y2="158"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "밤길의 가로등 — 전부 <b>똑같은 등</b>인데, 먼 등일수록 어둑해 보여요. 왜 그럴까요?";
  window.setTimeout(() => {
    choicesBox.classList.add("show");
    ask(choicesBox, helper, {
      choices: ["빛이 퍼져서 내 눈에 닿는 양이 줄어든다", "먼 등은 전기를 아껴서 약하게 켠다", "밤공기가 빛을 다 먹어 버린다"],
      good: "정확해요! 빛은 <b>사방으로 퍼지며</b> 나아가서, 멀수록 같은 넓이가 받는 빛이 줄어요. 얼마나 줄어드는지 — 오늘 직접 재 봐요!",
      bad: "등은 전부 같은 밝기로 켜져 있어요(공기도 빛을 그만큼 먹지 못해요). 진짜 이유는 <b>빛이 퍼지기 때문</b> — 멀수록 내 눈에 닿는 양이 줄어드는 거예요. 얼마나 줄어드는지 재 보러 가요!",
      onDone: finish,
    });
    face("curious");
  }, 900);
  return () => {};
}

// ══════════════════════════════════════════════════════════
// L3. brightlie — 가장 밝아 보이는 별이 최강일까(시리우스 vs 데네브)
// ══════════════════════════════════════════════════════════
export function renderBrightLie(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hst-frame" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="blSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226"/><stop offset="1" stop-color="#182848"/>
      </linearGradient>
      <radialGradient id="blG1" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#F4FAFF" stop-opacity=".95"/><stop offset=".45" stop-color="#BFDCFF" stop-opacity=".5"/><stop offset="1" stop-color="#BFDCFF" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#blSky)"/>
    <g fill="#DCE8FF" opacity=".8">
      <circle cx="30" cy="30" r="1.2"/><circle cx="72" cy="20" r="1"/><circle cx="150" cy="26" r="1.1"/><circle cx="210" cy="42" r="1.2"/>
      <circle cx="46" cy="120" r="1.1"/><circle cx="196" cy="130" r="1.2"/><circle cx="110" cy="140" r="1"/>
    </g>
    <!-- 시리우스: 화려하게 밝음 -->
    <g class="hst-sirius">
      <circle cx="76" cy="76" r="22" fill="url(#blG1)"/>
      <circle cx="76" cy="76" r="5" fill="#F4FAFF"/>
      <path d="M76 48 L76 104 M48 76 L104 76" stroke="#DCE8FF" stroke-width="1.6" opacity=".7"/>
    </g>
    <text x="76" y="122" fill="#BFD8FF" font-size="11" font-weight="700" text-anchor="middle">시리우스</text>
    <!-- 데네브: 수수한 점 -->
    <circle cx="178" cy="66" r="2.6" fill="#E8EEF9"/>
    <text x="178" y="90" fill="#8FA6D0" font-size="11" font-weight="700" text-anchor="middle">데네브</text>
    <!-- 거리 공개 배지(처음엔 숨김) -->
    <g class="hst-dist">
      <rect x="30" y="128" width="92" height="20" rx="10" fill="#101A2E" stroke="#3A4A68"/>
      <text x="76" y="142" fill="#7ED6FF" font-size="10.5" font-weight="800" text-anchor="middle">8.6광년 — 이웃!</text>
      <rect x="132" y="96" width="94" height="20" rx="10" fill="#101A2E" stroke="#3A4A68"/>
      <text x="179" y="110" fill="#F0A0B4" font-size="10.5" font-weight="800" text-anchor="middle">약 1,500광년!</text>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "밤하늘에서 가장 밝게 빛나는 별, 시리우스. 그럼 시리우스는 데네브보다 <b>진짜로 더 강한 별</b>일까요?";
  window.setTimeout(() => {
    choicesBox.classList.add("show");
    ask(choicesBox, helper, {
      choices: ["아닐 수도 — 가까워서 밝아 보이는 걸 수도", "그렇다 — 밝게 보이면 강한 별", "별의 밝기는 전부 똑같다"],
      good: "날카로워요! 거리를 보면 — 시리우스는 <b>8.6광년 이웃</b>, 데네브는 <b>약 1,500광년</b>. 데네브가 훨씬 먼데도 보인다는 건, 진짜 밝기는 데네브가 <b>압도적</b>이라는 뜻! 그래서 '공정한 비교 자'가 필요해요.",
      bad: "함정이었어요! 거리를 공개하면 — 시리우스는 <b>8.6광년 이웃</b>이고 데네브는 <b>약 1,500광년</b>. 그렇게 먼데도 보이니, 진짜 밝기는 데네브의 압승이에요. '보이는 밝기'와 '진짜 밝기'를 가르는 자를 배워 봐요!",
      onDone: () => {
        fig.classList.add("revealed");
        finish();
      },
    });
    face("curious");
  }, 900);
  return () => {};
}

// ══════════════════════════════════════════════════════════
// L4. gasflame — 파란 가스불 vs 주황 촛불
// ══════════════════════════════════════════════════════════
export function renderGasFlame(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hst-frame" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="gfBg" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1A2334"/><stop offset="1" stop-color="#243044"/>
      </linearGradient>
      <linearGradient id="gfBlue" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#2E6BD8"/><stop offset=".6" stop-color="#5B9CF0"/><stop offset="1" stop-color="#BFDCFF"/>
      </linearGradient>
      <linearGradient id="gfOrange" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#E86A2E"/><stop offset=".55" stop-color="#F5A03C"/><stop offset="1" stop-color="#FFE9A8"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#gfBg)"/>
    <!-- 가스레인지 -->
    <rect x="28" y="118" width="80" height="12" rx="6" fill="#3A4658" stroke="#141C2A" stroke-width="1.4"/>
    <g class="hst-flame">
      <path d="M52 118 Q50 96 62 84 Q60 102 68 106 Q66 92 74 86 Q74 104 84 118 Z" fill="url(#gfBlue)" opacity=".92"/>
    </g>
    <text x="68" y="150" fill="#9CC4FF" font-size="11" font-weight="700" text-anchor="middle">가스불</text>
    <!-- 촛불 -->
    <rect x="158" y="96" width="14" height="34" rx="4" fill="#F2E6D0" stroke="#B09A70" stroke-width="1.2"/>
    <line x1="165" y1="92" x2="165" y2="96" stroke="#6A5030" stroke-width="1.6"/>
    <g class="hst-flame slow">
      <path d="M165 62 Q173 76 170 86 Q168 92 165 92 Q162 92 160 86 Q157 76 165 62 Z" fill="url(#gfOrange)"/>
    </g>
    <text x="165" y="150" fill="#FFC49A" font-size="11" font-weight="700" text-anchor="middle">촛불</text>
    <ellipse cx="120" cy="158" rx="92" ry="5" fill="#000" opacity=".18"/>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "부엌의 <b>파란 가스불</b>과 식탁의 <b>주황 촛불</b> — 색만 보고 고르면, 어느 불이 더 뜨거울까요?";
  window.setTimeout(() => {
    choicesBox.classList.add("show");
    ask(choicesBox, helper, {
      choices: ["파란 가스불", "주황 촛불", "색과 온도는 상관없다"],
      good: "맞아요! <b>파란 불꽃이 더 뜨거워요</b>(가스불 약 1,400 ℃ > 촛불 약 1,000 ℃). '빨강·주황 = 뜨겁다' 이미지와 반대죠? 별의 세계도 똑같답니다 — 오늘의 주제!",
      bad: "빨강·주황이 '뜨거운 색'처럼 느껴지지만 실제론 반대예요 — <b>파란 가스불(약 1,400 ℃)이 촛불(약 1,000 ℃)보다 뜨거워요</b>. 색은 온도의 온도계 — 별에서도 똑같이 통해요!",
      onDone: finish,
    });
    face("curious");
  }, 900);
  return () => {};
}

// ══════════════════════════════════════════════════════════
// L5. milkyband — 시골 밤하늘의 뿌연 띠(은하수 실사)
// ══════════════════════════════════════════════════════════
export function renderMilkyBand(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hst-frame" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <clipPath id="mbClip"><rect x="4" y="4" width="232" height="128" rx="16"/></clipPath>
    <g clip-path="url(#mbClip)">
      <image href="${starPhoto("milkyway-pan.webp")}" x="-30" y="-38" width="310" height="155" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <rect x="4" y="4" width="232" height="128" rx="16" stroke="#3A4A68" stroke-width="1.6"/>
    <!-- 지평선 실루엣 -->
    <path d="M4 132 L48 122 L84 130 L130 118 L180 130 L236 124 L236 166 L4 166 Z" fill="#0E1626"/>
    <g stroke="#E8EEF8" stroke-width="2.4" fill="none">
      <circle cx="120" cy="140" r="7"/>
      <line x1="120" y1="147" x2="120" y2="160"/>
      <line x1="120" y1="151" x2="111" y2="145"/><line x1="120" y1="151" x2="129" y2="145"/>
    </g>
    <text x="120" y="30" fill="#DCE8FF" font-size="11" font-weight="700" text-anchor="middle" opacity=".85">깜깜한 시골 밤하늘</text>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "불빛 없는 시골 밤하늘 — 하늘을 가로지르는 <b>뿌연 강</b> 같은 띠가 보여요. 저 띠의 정체는 뭘까요?";
  window.setTimeout(() => {
    choicesBox.classList.add("show");
    ask(choicesBox, helper, {
      choices: ["수천억 개 별의 무리 — 우리은하", "높은 하늘의 얇은 구름", "달빛이 공기에 번진 것"],
      good: "맞아요! 저 뿌연 띠는 구름이 아니라 <b>셀 수 없이 많은 별</b> — 우리가 사는 별의 도시, <b>우리은하를 안에서 본 모습</b>이에요. 오늘 그 지도를 펼쳐 봐요!",
      bad: "구름이나 달빛 번짐처럼 보이지만 — 망원경으로 보면 <b>전부 별</b>이에요! 수천억 개의 별이 모인 <b>우리은하를 안쪽에서 본 모습</b>이랍니다. 그 지도를 펼치러 가요!",
      onDone: finish,
    });
    face("surprised");
  }, 900);
  return () => {};
}

// ══════════════════════════════════════════════════════════
// L6. orionblur — 오리온 허리띠 아래 뿌연 얼룩(실사 스코프)
// ══════════════════════════════════════════════════════════
export function renderOrionBlur(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hst-frame" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="obSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226"/><stop offset="1" stop-color="#141F3C"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#obSky)"/>
    <!-- 오리온자리 별 배치(허리띠 3 + 어깨·무릎) -->
    <g fill="#E8EEF9">
      <circle cx="86" cy="34" r="2.6" fill="#FFB08A"/><circle cx="152" cy="30" r="2.2" fill="#BFD8FF"/>
      <circle cx="104" cy="74" r="2"/><circle cx="120" cy="80" r="2"/><circle cx="136" cy="86" r="2"/>
      <circle cx="84" cy="132" r="2.2" fill="#BFD8FF"/><circle cx="156" cy="128" r="2.4" fill="#BFD8FF"/>
    </g>
    <g stroke="#3A4A68" stroke-width="1" opacity=".7">
      <path d="M86 34 L104 74 M152 30 L136 86 M104 74 L84 132 M136 86 L156 128 M104 74 L120 80 L136 86"/>
    </g>
    <!-- 뿌연 얼룩(성운 자리) -->
    <circle class="hst-blur" cx="122" cy="108" r="7" fill="#F2A0C8" opacity=".4"/>
    <!-- 망원경 뷰(탭하면 실사) -->
    <g class="hst-scope">
      <clipPath id="obClip"><circle cx="122" cy="108" r="36"/></clipPath>
      <circle cx="122" cy="108" r="36" fill="#04070E"/>
      <g clip-path="url(#obClip)">
        <image href="${starPhoto("orion-nebula.webp")}" x="86" y="72" width="72" height="72" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <circle cx="122" cy="108" r="36" stroke="#8FB3E8" stroke-width="2.4"/>
    </g>
    <text x="120" y="158" fill="#8FA6D0" font-size="10.5" font-weight="700" text-anchor="middle">오리온자리 — 허리띠 아래를 봐요</text>
  </svg>`;
  const zoomBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "망원경으로 보기" }));
  const row = el("div", { class: "gp-controls" }, zoomBtn);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, row, choicesBox);
  helper.innerHTML = "겨울 밤하늘의 오리온자리. 허리띠 세 별 아래에 <b>뿌옇게 번진 얼룩</b>이 있어요 — 별이라기엔 흐릿해요.";

  let asked = false;
  const onZoom = (): void => {
    fig.classList.add("scoped");
    zoomBtn.classList.remove("pulse");
    haptic(HAPTIC.tap);
    if (asked) return;
    asked = true;
    face("surprised");
    helper.innerHTML = "우와 — 별이 아니라 <b>붉게 빛나는 구름</b>이에요! 이 구름의 정체는 뭘까요?";
    window.setTimeout(() => {
      choicesBox.classList.add("show");
      ask(choicesBox, helper, {
        choices: ["가스와 티끌(먼지)의 구름", "아주 멀리 있는 별 하나", "지구 대기의 수증기 구름"],
        good: "맞아요! 별 사이 공간의 <b>가스와 티끌 구름 — 성운</b>이에요. 심지어 저곳은 <b>새 별이 태어나는 요람</b>이랍니다. 오늘은 별 무리(성단)와 이 구름(성운)을 구경해요!",
        bad: "별 하나라기엔 너무 번져 있고, 지구의 구름이면 별과 함께 움직이지 않겠죠? 정체는 별 사이의 <b>가스와 티끌 구름 — 성운</b>! 심지어 새 별이 태어나는 요람이에요.",
        onDone: finish,
      });
    }, 400);
  };
  zoomBtn.addEventListener("click", onZoom);
  return () => zoomBtn.removeEventListener("click", onZoom);
}

// ══════════════════════════════════════════════════════════
// L8. movingstar — 밤하늘을 천천히 가로지르는 밝은 점(ISS)
// ══════════════════════════════════════════════════════════
export function renderMovingStar(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hst-frame" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="msSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226"/><stop offset=".8" stop-color="#141F3C"/><stop offset="1" stop-color="#1C2A4C"/>
      </linearGradient>
      <radialGradient id="msGlow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".5" stop-color="#CFE2FF" stop-opacity=".45"/><stop offset="1" stop-color="#CFE2FF" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#msSky)"/>
    <g fill="#DCE8FF" opacity=".85">
      <circle cx="36" cy="40" r="1.3"/><circle cx="90" cy="24" r="1.1"/><circle cx="140" cy="44" r="1.3"/><circle cx="206" cy="30" r="1.2"/>
      <circle cx="60" cy="90" r="1.1"/><circle cx="190" cy="96" r="1.3"/><circle cx="120" cy="70" r="1"/><circle cx="222" cy="120" r="1.1"/>
    </g>
    <!-- 이동하는 밝은 점(스코프 켜면 ISS 실사) -->
    <g class="hst-mover">
      <circle cx="0" cy="0" r="12" fill="url(#msGlow)"/>
      <circle cx="0" cy="0" r="2.6" fill="#FFFFFF"/>
    </g>
    <g class="hst-scope">
      <clipPath id="msClip"><circle cx="120" cy="66" r="36"/></clipPath>
      <circle cx="120" cy="66" r="36" fill="#04070E"/>
      <g clip-path="url(#msClip)">
        <image href="${starPhoto("iss.webp")}" x="80" y="34" width="80" height="53" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <circle cx="120" cy="66" r="36" stroke="#8FB3E8" stroke-width="2.4"/>
    </g>
    <path d="M4 142 L60 130 L120 140 L190 128 L236 138 L236 166 L4 166 Z" fill="#0E1626"/>
    <g stroke="#E8EEF8" stroke-width="2.4" fill="none">
      <circle cx="52" cy="148" r="7"/>
      <line x1="52" y1="155" x2="52" y2="164"/>
      <line x1="52" y1="157" x2="44" y2="152"/><line x1="52" y1="157" x2="60" y2="151"/>
    </g>
  </svg>`;
  const zoomBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "망원경으로 보기" }));
  const row = el("div", { class: "gp-controls" }, zoomBtn);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, row, choicesBox);
  helper.innerHTML = "밤하늘에 <b>깜빡이지도 않고 천천히 미끄러지는</b> 밝은 점! 비행기도 별똥별도 아니에요. 정체가 뭘까요?";

  let asked = false;
  const onZoom = (): void => {
    fig.classList.add("scoped");
    zoomBtn.classList.remove("pulse");
    haptic(HAPTIC.tap);
    if (asked) return;
    asked = true;
    face("surprised");
    helper.innerHTML = "확대해 보니 — <b>거대한 인공 구조물</b>이에요! 저것의 정체는?";
    window.setTimeout(() => {
      choicesBox.classList.add("show");
      ask(choicesBox, helper, {
        choices: ["사람이 만든 우주 정거장(ISS)", "아주 가까운 행성", "높이 나는 인공조명 드론"],
        good: "맞아요! <b>국제우주정거장(ISS)</b> — 축구장만 한 크기로 <b>90분에 지구 한 바퀴</b>를 돌아요. 안에는 지금도 사람이 살죠. 인류가 우주로 나간 이야기를 시작해요!",
        bad: "행성은 저렇게 빨리 움직이지 않고, 드론은 저 높이(약 400 km)까지 못 올라가요. 정체는 <b>국제우주정거장(ISS)</b> — 90분에 지구를 한 바퀴 도는, 사람이 사는 우주 기지예요!",
        onDone: finish,
      });
    }, 400);
  };
  zoomBtn.addEventListener("click", onZoom);
  return () => zoomBtn.removeEventListener("click", onZoom);
}
