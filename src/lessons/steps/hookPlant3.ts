// hookPlant3 — 중2 Ⅴ v3 훅 5장면. hook.ts가 scene 이름으로 위임한다.
// 장면: potatodrop(L2 감자+소독약) · winterberry(L3 한겨울 딸기) · veggiebag(L4 채소 봉지 숨구멍) ·
//       tropicalnight(L5 열대야 과일 가게) · sweetpotato(L6 고구마 캐기)
// 공용 규칙: 예측은 반드시 hookAsk.ask()(choices[0]=정답, good≠bad), 소재명은 도입에서 소개.
// 스타일은 styles/plant3-hook.css(.hp3- 접두). 현행 hookPlant·v2 hookPlant2와 장면·이름 무충돌.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { p3Lettuce, p3LettuceDefs } from "../../ui/plant3Kit";
import { ask } from "./hookAsk";

type Face = (kind: "smile" | "surprised" | "curious") => void;
interface HookLike {
  choices?: string[];
}

/** L2 potatodrop — 도마 위 감자에 (아이오딘이 든) 빨간 소독약 한 방울 → 청람색 반점.
 *  "녹말 탐지기"를 훅에서 손에 쥐여 주고 랩(잎 녹말 검출)으로 잇는다. */
export function renderPotatoDrop(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hp3-stage hp3-pd", attrs: { role: "button", tabindex: "0", "aria-label": "감자에 소독약 떨어뜨리기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="hp3pdPot" cx="0.36" cy="0.32" r="1">
        <stop offset="0" stop-color="#FFF6E3"/><stop offset="0.62" stop-color="#F7E7C4"/><stop offset="1" stop-color="#E8D0A0"/>
      </radialGradient>
      <linearGradient id="hp3pdBoard" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E8CFAA"/><stop offset="1" stop-color="#D5B584"/>
      </linearGradient>
    </defs>
    <ellipse cx="150" cy="196" rx="132" ry="9" fill="#2A3A5E" opacity="0.10"/>
    <rect x="22" y="128" width="256" height="62" rx="12" fill="url(#hp3pdBoard)" stroke="#A9885A" stroke-width="3"/>
    <ellipse cx="128" cy="128" rx="88" ry="14" fill="#C9A876" opacity="0.5"/>
    <g class="pd-half">
      <ellipse cx="128" cy="106" rx="62" ry="40" fill="url(#hp3pdPot)" stroke="#B08D4F" stroke-width="3"/>
      <ellipse cx="128" cy="106" rx="46" ry="28" fill="#FBF2D9" stroke="#D9C08C" stroke-width="1.6"/>
      <path d="M92 88 C104 78 122 74 138 76" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
      <g class="pd-stain">
        <ellipse cx="128" cy="104" rx="17" ry="12" fill="#364FC7" opacity="0.92"/>
        <ellipse cx="141" cy="112" rx="7" ry="5" fill="#3B5BDB" opacity="0.8"/>
        <ellipse cx="116" cy="112" rx="5" ry="3.6" fill="#3B5BDB" opacity="0.7"/>
      </g>
    </g>
    <g class="pd-drop">
      <path d="M236 92 c0 -7 5 -14 5 -14 c0 0 5 7 5 14 a5 5 0 0 1 -10 0 Z" fill="#E8590C"/>
    </g>
    <g class="pd-bottle">
      <rect x="222" y="30" width="38" height="52" rx="9" fill="#F8F0EA" stroke="#C77B4A" stroke-width="3"/>
      <rect x="231" y="16" width="20" height="16" rx="4" fill="#E8590C" stroke="#B5501E" stroke-width="2.6"/>
      <rect x="228" y="44" width="26" height="24" rx="5" fill="#FADCC8" stroke="#D9A176" stroke-width="1.8"/>
      <path d="M233 52 h16 M233 58 h11" stroke="#C77B4A" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M226 36 c4 -3 9 -4 13 -4" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "주방 실험이에요. 도마 위 <b>감자</b> 옆에 <b>아이오딘이 든 빨간 소독약</b>이 있어요. 감자 단면을 <b>탭</b>해서 소독약을 한 방울 떨어뜨려 보세요.";

  let dropped = false;
  const drop = (): void => {
    if (dropped) return;
    dropped = true;
    haptic(HAPTIC.tap);
    face("surprised");
    fig.classList.add("dropped");
    helper.innerHTML = "어라?! 빨간 소독약이 닿은 자리가 <b>검푸른 청람색</b>으로 변했어요. 소독약이 상한 것도 아닌데 — 왜 색이 변했을까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "감자 속 어떤 성분이 소독약과 만나 색이 변했다",
          "감자가 상해 있어서 색이 변했다",
          "소독약이 공기와 닿으면 원래 색이 변한다",
        ],
        good: "바로 그거예요! 감자 속 <b>녹말</b>이 소독약 속 <b>아이오딘</b>과 만나면 <b>청람색</b>으로 변해요. 오늘 이 반응을 '녹말 탐지기'로 쓸 거예요 — 잎에서도 녹말이 나올까요?",
        bad: "감자가 상하거나 공기 때문이 아니에요 — 감자 속 <b>녹말</b>이 소독약 속 <b>아이오딘</b>과 만나면 <b>청람색</b>으로 변한답니다. 이 반응이 오늘의 '녹말 탐지기'예요!",
        onDone: finish,
      });
    }, 900);
  };
  fig.addEventListener("click", drop);
  fig.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      drop();
    }
  });
}

/** L3 winterberry — 창밖은 눈 내리는 한겨울, 진열대엔 새빨간 딸기.
 *  "온실이 조건을 맞춰 준다" 예측으로 환경요인을 예고한다. */
export function renderWinterBerry(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hp3-stage hp3-wb", attrs: { role: "button", tabindex: "0", "aria-label": "딸기 팩 집어 보기" } });
  const flakes = [
    [30, 26], [58, 44], [84, 20], [40, 62], [72, 74], [24, 88], [92, 96], [56, 104],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#DCE8F5"/>`)
    .join("");
  fig.innerHTML = `
  <svg viewBox="0 0 320 214" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hp3wbWin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#39445B"/><stop offset="1" stop-color="#55638A"/>
      </linearGradient>
      <radialGradient id="hp3wbBerry" cx="0.36" cy="0.3" r="1">
        <stop offset="0" stop-color="#FF8787"/><stop offset="0.55" stop-color="#F03E3E"/><stop offset="1" stop-color="#C92A2A"/>
      </radialGradient>
    </defs>
    <ellipse cx="160" cy="202" rx="140" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <rect x="12" y="10" width="108" height="112" rx="10" fill="url(#hp3wbWin)" stroke="#8B95A1" stroke-width="3"/>
    <line x1="66" y1="12" x2="66" y2="120" stroke="#8B95A1" stroke-width="2.6"/>
    <line x1="14" y1="66" x2="118" y2="66" stroke="#8B95A1" stroke-width="2.6"/>
    ${flakes}
    <path d="M18 116 q18 -10 34 0 q16 -8 30 0 q18 -9 34 0 v4 h-98 Z" fill="#EAF2FB"/>
    <g class="wb-pack">
      <rect x="150" y="84" width="150" height="66" rx="10" fill="#FDF7EC" stroke="#C9A96B" stroke-width="3"/>
      <g>
        <ellipse cx="181" cy="122" rx="17" ry="20" fill="url(#hp3wbBerry)" stroke="#A61E1E" stroke-width="2.4"/>
        <path d="M172 106 l9 -8 9 8 -5 4 h-8 Z" fill="#2F9E44" stroke="#237032" stroke-width="2"/>
        <ellipse cx="224" cy="124" rx="17" ry="20" fill="url(#hp3wbBerry)" stroke="#A61E1E" stroke-width="2.4"/>
        <path d="M215 108 l9 -8 9 8 -5 4 h-8 Z" fill="#2F9E44" stroke="#237032" stroke-width="2"/>
        <ellipse cx="267" cy="122" rx="17" ry="20" fill="url(#hp3wbBerry)" stroke="#A61E1E" stroke-width="2.4"/>
        <path d="M258 106 l9 -8 9 8 -5 4 h-8 Z" fill="#2F9E44" stroke="#237032" stroke-width="2"/>
        <circle cx="176" cy="120" r="1.3" fill="#FFD8A8"/><circle cx="186" cy="128" r="1.3" fill="#FFD8A8"/>
        <circle cx="219" cy="122" r="1.3" fill="#FFD8A8"/><circle cx="229" cy="130" r="1.3" fill="#FFD8A8"/>
        <circle cx="262" cy="120" r="1.3" fill="#FFD8A8"/><circle cx="272" cy="128" r="1.3" fill="#FFD8A8"/>
      </g>
      <path d="M158 92 c14 -6 30 -8 44 -7" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" opacity="0.6"/>
    </g>
    <rect x="138" y="150" width="174" height="14" rx="5" fill="#D9B678" stroke="#A9854A" stroke-width="2.4"/>
    <rect x="150" y="164" width="10" height="30" fill="#C9A96B"/>
    <rect x="290" y="164" width="10" height="30" fill="#C9A96B"/>
    <g class="wb-tag">
      <rect x="196" y="34" width="88" height="30" rx="8" fill="#FFF9DB" stroke="#E8B04B" stroke-width="2.6"/>
      <text x="240" y="54" text-anchor="middle" font-size="14" font-weight="800" fill="#8A6D1A">온실 재배</text>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "창밖에 눈이 내리는 <b>한겨울 마트</b>예요. 진열대의 <b>새빨간 딸기</b>를 탭해서 집어 보세요.";

  let picked = false;
  const pick = (): void => {
    if (picked) return;
    picked = true;
    haptic(HAPTIC.tap);
    face("curious");
    fig.classList.add("picked");
    helper.innerHTML = "라벨을 보니 <b>온실 재배</b> — 밖은 꽁꽁 얼었는데, 이 딸기는 어떻게 한겨울에 이렇게 잘 자랐을까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "온실이 빛·온도·공기의 조건을 알맞게 맞춰 줘서",
          "겨울 딸기는 광합성 없이 뿌리의 양분만으로 자라서",
          "딸기는 원래 추울수록 잘 자라는 식물이라서",
        ],
        good: "정답! 비닐 온실은 한겨울에도 <b>빛·온도·이산화 탄소</b>를 딸기에게 알맞게 맞춰 줘요. 그 '알맞게'가 정확히 무엇인지, 조건을 하나씩 실험해 봐요.",
        bad: "추워서 잘 자란 것도, 광합성을 건너뛴 것도 아니에요 — 온실이 <b>빛·온도·이산화 탄소</b>를 알맞게 맞춰 준 덕분이에요. 그 '알맞게'의 정체를 실험으로 밝혀 봐요.",
        onDone: finish,
      });
    }, 700);
  };
  fig.addEventListener("click", pick);
  fig.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      pick();
    }
  });
}

/** L4 veggiebag — 마트 상추 봉지의 작은 숨구멍들. 탭하면 구멍 클로즈업 →
 *  "수확한 채소도 숨을 쉰다" 예측으로 호흡을 예고한다. */
export function renderVeggieBag(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hp3-stage hp3-vb", attrs: { role: "button", tabindex: "0", "aria-label": "봉지의 작은 구멍 살펴보기" } });
  const holes = [
    [116, 64], [156, 52], [196, 66], [136, 96], [178, 92], [216, 100], [124, 132], [164, 128], [204, 136],
  ]
    .map(([x, y]) => `<circle class="vb-hole" cx="${x}" cy="${y}" r="2.4" fill="#5C6B7A"/>`)
    .join("");
  fig.innerHTML = `
  <svg viewBox="0 0 320 212" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hp3vbBag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.85"/><stop offset="1" stop-color="#DCE9F2" stop-opacity="0.9"/>
      </linearGradient>
      ${p3LettuceDefs("vb")}
    </defs>
    <ellipse cx="160" cy="200" rx="140" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <g class="vb-bag">
      <path d="M96 42 h128 l14 22 v112 a10 10 0 0 1 -10 10 h-136 a10 10 0 0 1 -10 -10 v-112 Z" fill="url(#hp3vbBag)" stroke="#9DB2C4" stroke-width="3"/>
      <path d="M96 42 l14 22 h128" stroke="#9DB2C4" stroke-width="2" opacity="0.6"/>
      ${p3Lettuce(162, 168, 0.9, "vb")}
      ${holes}
      <path d="M104 52 c10 -5 24 -7 36 -7" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.75"/>
    </g>
    <g class="vb-zoom">
      <circle cx="252" cy="66" r="34" fill="#FFFFFF" stroke="#4E5968" stroke-width="3.2"/>
      <line x1="276" y1="92" x2="294" y2="112" stroke="#4E5968" stroke-width="6" stroke-linecap="round"/>
      <circle cx="252" cy="66" r="7" fill="#5C6B7A"/>
      <path class="vb-air" d="M240 46 q6 -6 12 0 M252 40 q6 -6 12 0" stroke="#74B9F0" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "마트에서 사 온 <b>상추 봉지</b>예요. 그런데 비닐에 <b>아주 작은 구멍</b>들이 일부러 뚫려 있네요? 구멍을 <b>탭</b>해서 크게 봐요.";

  let zoomed = false;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.tap);
    face("curious");
    fig.classList.add("zoomed");
    helper.innerHTML = "일부러 뚫은 <b>숨구멍</b>이 맞아요. 밭에서 잘려 나온 상추일 뿐인데 — 왜 봉지에 숨구멍이 필요할까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "수확한 채소도 살아서 숨을 쉬기 때문에",
          "물이 빠져나가라고 낸 배수 구멍이라서",
          "봉지가 터지지 말라고 낸 장식 구멍이라서",
        ],
        good: "맞아요! 뿌리에서 잘려 나온 상추도 여전히 <b>살아 있는 세포</b> 덩어리 — 계속 숨을 쉬어요. 꽉 막아 두면 답답해져서 쉽게 상하죠. 식물의 '숨'의 정체를 파헤쳐 봐요.",
        bad: "배수나 장식용이 아니에요 — 잘려 나온 상추도 여전히 <b>살아서 숨을 쉬기 때문</b>이랍니다. 숨을 쉰다니, 코도 없는데 어떻게? 식물의 '숨'의 정체를 파헤쳐 봐요.",
        onDone: finish,
      });
    }, 700);
  };
  fig.addEventListener("click", zoom);
  fig.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      zoom();
    }
  });
}

/** L5 tropicalnight — 열대야 밤의 과일 가게. 온도계를 탭하면 수은주가 치솟는다 →
 *  "밤이 더우면 과일이 싱거워지는 이유" 예측(광합성·호흡 수지 예고). */
export function renderTropicalNight(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hp3-stage hp3-tn", attrs: { role: "button", tabindex: "0", "aria-label": "밤 온도계 확인하기" } });
  // 수박 한 통 — 밝은 바탕 위 진초록 줄무늬(꼭지→배꼽 방향 자오선, 타원 클립)·하이라이트·덩굴 꼭지.
  const wm = (cx: number, cy: number, rx: number, ry: number, id: string, tilt: number): string => {
    const bands = [-0.68, -0.34, 0, 0.34, 0.68]
      .map((u) => {
        const tx = (cx + u * rx * 0.3).toFixed(1);
        const bx = (cx + u * rx * 1.05).toFixed(1);
        return `<path d="M${tx} ${(cy - ry * 0.88).toFixed(1)} C${bx} ${(cy - ry * 0.33).toFixed(1)} ${bx} ${(cy + ry * 0.33).toFixed(1)} ${tx} ${(cy + ry * 0.88).toFixed(1)}" stroke="#1E6B2F" stroke-width="${(7 - Math.abs(u) * 2.2).toFixed(1)}" stroke-linecap="round" clip-path="url(#${id})"/>
        <path d="M${tx} ${(cy - ry * 0.8).toFixed(1)} C${(cx + u * rx * 0.98).toFixed(1)} ${(cy - ry * 0.3).toFixed(1)} ${(cx + u * rx * 0.98).toFixed(1)} ${(cy + ry * 0.3).toFixed(1)} ${tx} ${(cy + ry * 0.8).toFixed(1)}" stroke="#14501F" stroke-width="2" stroke-linecap="round" opacity="0.5" clip-path="url(#${id})"/>`;
      })
      .join("");
    return `<g transform="rotate(${tilt} ${cx} ${cy})">
      <clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx - 1.2}" ry="${ry - 1.2}"/></clipPath>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#hp3tnWm)" stroke="#175325" stroke-width="2.8"/>
      ${bands}
      <path d="M${(cx - rx * 0.52).toFixed(1)} ${(cy - ry * 0.6).toFixed(1)} Q${(cx - rx * 0.12).toFixed(1)} ${(cy - ry * 1.0).toFixed(1)} ${(cx + rx * 0.3).toFixed(1)} ${(cy - ry * 0.78).toFixed(1)}" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.38" fill="none"/>
      <path d="M${cx} ${(cy - ry - 1).toFixed(1)} q-3 -6 -9 -8" stroke="#55763B" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    </g>`;
  };
  // 잘라 둔 웨지 — 빨간 속살+씨+흰 속껍질+초록 겉껍질(수박임을 한눈에).
  const wedge = (cx: number, cy: number, s: number, tilt: number): string => `
    <g transform="translate(${cx} ${cy}) rotate(${tilt}) scale(${s})">
      <ellipse cx="0" cy="4" rx="19" ry="4" fill="#101625" opacity="0.3"/>
      <path d="M-18.5 -30 A22.5 22.5 0 0 1 18.5 -30 L15 -26 h-30 Z" fill="#2E8B47" stroke="#175325" stroke-width="1.8"/>
      <path d="M-16.5 -28.5 A20.5 20.5 0 0 1 16.5 -28.5 L14 -25 h-28 Z" fill="#F5F0DC"/>
      <path d="M0 2 L-15.5 -27 A19 19 0 0 1 15.5 -27 Z" fill="url(#hp3tnFlesh)" stroke="#C0392B" stroke-width="1.4"/>
      <ellipse cx="-6" cy="-13" rx="1.7" ry="2.6" fill="#26211C" transform="rotate(16 -6 -13)"/>
      <ellipse cx="5" cy="-17" rx="1.7" ry="2.6" fill="#26211C" transform="rotate(-12 5 -17)"/>
      <ellipse cx="-1" cy="-22" rx="1.6" ry="2.4" fill="#26211C" transform="rotate(6 -1 -22)"/>
      <ellipse cx="8" cy="-9" rx="1.6" ry="2.4" fill="#26211C" transform="rotate(-20 8 -9)"/>
    </g>`;
  fig.innerHTML = `
  <svg viewBox="0 0 320 214" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hp3tnSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#232B45"/><stop offset="1" stop-color="#39445B"/>
      </linearGradient>
      <radialGradient id="hp3tnWm" cx="0.34" cy="0.28" r="1">
        <stop offset="0" stop-color="#D6EFA9"/><stop offset="0.55" stop-color="#A8DC80"/><stop offset="1" stop-color="#74BE58"/>
      </radialGradient>
      <radialGradient id="hp3tnFlesh" cx="0.42" cy="0.3" r="1">
        <stop offset="0" stop-color="#FF8E7A"/><stop offset="0.6" stop-color="#F0524A"/><stop offset="1" stop-color="#D02F2F"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="320" height="132" fill="url(#hp3tnSky)"/>
    <circle cx="284" cy="34" r="16" fill="#FFE8A8"/>
    <circle cx="278" cy="30" r="13" fill="#232B45"/>
    <circle cx="50" cy="26" r="1.8" fill="#DCE8F5"/><circle cx="92" cy="44" r="1.4" fill="#DCE8F5"/>
    <circle cx="150" cy="22" r="1.6" fill="#DCE8F5"/><circle cx="212" cy="40" r="1.4" fill="#DCE8F5"/>
    <ellipse cx="160" cy="204" rx="146" ry="8" fill="#101625" opacity="0.35"/>
    <rect x="16" y="120" width="288" height="16" rx="5" fill="#B5652A"/>
    <rect x="24" y="136" width="272" height="58" rx="8" fill="#D9985C" stroke="#A9713A" stroke-width="3"/>
    <g>
      <ellipse cx="88" cy="137" rx="30" ry="4.5" fill="#101625" opacity="0.3"/>
      <ellipse cx="160" cy="138" rx="25" ry="4" fill="#101625" opacity="0.3"/>
      ${wm(88, 112, 35, 27, "hp3tnWmc1", -6)}
      ${wm(160, 117, 29, 22, "hp3tnWmc2", 5)}
      ${wedge(124, 133, 0.9, -8)}
    </g>
    <g class="tn-sign">
      <rect x="196" y="88" width="104" height="42" rx="8" fill="#FFF9DB" stroke="#E8B04B" stroke-width="2.6" transform="rotate(-3 248 109)"/>
      <text x="248" y="106" text-anchor="middle" font-size="12.5" font-weight="800" fill="#8A6D1A" transform="rotate(-3 248 109)">올여름 수박이</text>
      <text x="248" y="122" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C0392B" transform="rotate(-3 248 109)">영 안 달아요…</text>
    </g>
    <g class="tn-thermo">
      <rect x="34" y="24" width="18" height="72" rx="9" fill="#FFFFFF" stroke="#8B95A1" stroke-width="2.8"/>
      <circle cx="43" cy="100" r="12" fill="#F03E3E" stroke="#B02525" stroke-width="2.6"/>
      <rect class="tn-mercury" x="39" y="66" width="8" height="30" rx="4" fill="#F03E3E"/>
      <path d="M56 36 h8 M56 52 h8 M56 68 h8 M56 84 h8" stroke="#B9C2CC" stroke-width="2.4" stroke-linecap="round"/>
      <text x="76" y="42" font-size="11" font-weight="800" fill="#DCE8F5">밤인데</text>
      <text x="76" y="56" font-size="11" font-weight="800" fill="#DCE8F5">푹푹 쪄요</text>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "한여름 밤, 과일 가게예요. <b>\"올여름 수박이 안 달아요\"</b> 푯말이 붙어 있네요. 벽의 <b>온도계</b>를 탭해서 밤 기온을 확인해 보세요.";

  let checked = false;
  const check = (): void => {
    if (checked) return;
    checked = true;
    haptic(HAPTIC.tap);
    face("surprised");
    fig.classList.add("hot");
    helper.innerHTML = "밤인데도 수은주가 쭉 — 잠 못 드는 <b>열대야</b>예요. 그런데 밤이 더운 것과 수박이 <b>싱거워지는 것</b>이 무슨 상관일까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "더운 밤엔 식물이 숨쉬기로 양분을 많이 써 버려서",
          "더위에 수박 속 설탕이 녹아 없어져서",
          "밤에도 광합성을 하느라 열매가 지쳐서",
        ],
        good: "예리해요! 밤 기온이 높으면 식물의 <b>호흡</b>이 활발해져요 — 낮에 광합성으로 모은 양분을 밤새 많이 써 버리니, 열매에 쌓일 몫이 줄어들죠. 낮과 밤의 수지를 직접 맞춰 봐요.",
        bad: "설탕이 녹아 사라지지도, 밤에 광합성을 하지도 않아요(빛이 없으니까요). 진짜 이유는 더운 밤엔 <b>호흡</b>이 활발해져 낮에 모은 양분을 많이 써 버리기 때문 — 낮과 밤의 수지를 직접 맞춰 봐요.",
        onDone: finish,
      });
    }, 800);
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

/** L6 sweetpotato — 고구마 캐기. 줄기를 당기면 굵은 고구마가 딸려 나온다 →
 *  "굵은 살은 어디서 왔나" 예측(양분 이동·저장 예고 + 반 헬몬트 회수). */
export function renderSweetPotato(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookLike,
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hp3-stage hp3-sp", attrs: { role: "button", tabindex: "0", "aria-label": "고구마 줄기 당기기" } });
  fig.innerHTML = `
  <svg viewBox="0 0 320 214" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hp3spSoil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#A9713A"/><stop offset="1" stop-color="#7A5228"/>
      </linearGradient>
      <radialGradient id="hp3spPot" cx="0.36" cy="0.3" r="1">
        <stop offset="0" stop-color="#E8909E"/><stop offset="0.55" stop-color="#C2566B"/><stop offset="1" stop-color="#96374D"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="320" height="120" fill="#EAF4FB"/>
    <circle cx="270" cy="34" r="18" fill="#FFC940" opacity="0.9"/>
    <path d="M0 118 q40 -12 80 -4 q46 -12 92 -2 q52 -12 100 0 q24 -4 48 0 v104 h-320 Z" fill="url(#hp3spSoil)"/>
    <path d="M0 118 q40 -12 80 -4 q46 -12 92 -2 q52 -12 100 0 q24 -4 48 0" stroke="#5C3D1C" stroke-width="3" fill="none"/>
    <circle cx="52" cy="150" r="3" fill="#5C3D1C" opacity="0.5"/><circle cx="240" cy="164" r="3.4" fill="#5C3D1C" opacity="0.5"/>
    <circle cx="120" cy="186" r="2.6" fill="#5C3D1C" opacity="0.5"/>
    <g class="sp-vine">
      <path d="M150 108 C142 84 150 62 168 50" stroke="#2F9E44" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M168 50 C180 42 196 42 206 48" stroke="#2F9E44" stroke-width="4.4" stroke-linecap="round" fill="none"/>
      <path d="M158 74 c-14 -2 -22 -12 -22 -22 c12 -2 22 4 26 12 Z" fill="#40A85C" stroke="#237032" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M176 46 c-2 -14 6 -24 16 -27 c4 11 -1 22 -9 27 Z" fill="#40A85C" stroke="#237032" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M206 48 c12 -6 26 -4 34 3 c-7 9 -20 11 -30 6 Z" fill="#40A85C" stroke="#237032" stroke-width="2.2" stroke-linejoin="round"/>
    </g>
    <g class="sp-tuber">
      <ellipse cx="150" cy="152" rx="40" ry="22" fill="url(#hp3spPot)" stroke="#6E2438" stroke-width="2.8" transform="rotate(-14 150 152)"/>
      <path d="M120 144 C128 136 140 132 152 132" stroke="#F5C2CC" stroke-width="4" stroke-linecap="round" opacity="0.7" transform="rotate(-14 150 152)"/>
      <path d="M186 166 c6 4 10 9 12 14 M116 142 c-6 -3 -10 -7 -13 -12" stroke="#96374D" stroke-width="2.6" stroke-linecap="round"/>
    </g>
    <g class="sp-q">
      <text x="228" y="150" font-size="20" font-weight="800" fill="#FFF3DE">?</text>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "가을 <b>고구마밭</b>이에요. 잎이 무성한 <b>줄기를 탭</b>해서 쭉 당겨 보세요 — 흙 속에서 뭐가 나올까요?";

  let pulled = false;
  const pull = (): void => {
    if (pulled) return;
    pulled = true;
    haptic(HAPTIC.correct);
    face("surprised");
    fig.classList.add("pulled");
    helper.innerHTML = "우와, <b>굵은 고구마</b>가 주렁주렁! 심을 땐 가느다란 순이었는데… 이 굵은 살은 대체 <b>어디서 온</b> 걸까요?";
    window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "잎이 만든 양분이 내려와 차곡차곡 쌓인 것",
          "뿌리가 흙 속의 양분을 빨아들여 살이 찐 것",
          "빗물을 많이 저장해서 부풀어 오른 것",
        ],
        good: "정답! 고구마의 살은 <b>잎이 광합성으로 만든 양분</b>이 아래로 내려와 쌓인 거예요. 양분이 어떤 모습으로 이동하고, 어디에 어떤 모습으로 쌓이는지 — 마지막 여행을 따라가 봐요.",
        bad: "반 헬몬트의 버드나무를 기억하나요? 5년을 자라도 흙은 거의 줄지 않았어요. 고구마의 살도 흙이나 빗물이 아니라 <b>잎이 만든 양분이 내려와 쌓인 것</b> — 그 여행을 따라가 봐요.",
        onDone: finish,
      });
    }, 900);
  };
  fig.addEventListener("click", pull);
  fig.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      pull();
    }
  });
}
