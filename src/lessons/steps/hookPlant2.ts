// hookPlant2 — 중2 Ⅴ 식물과 에너지(v2) 훅 7종.
// 문법은 hookBody와 동일: 조작 버튼 하나로 장면을 바꿔 보고, 공용 hookAsk.ask()로 예측한다.
// SVG는 240×170, 파운드리 재질 문법(3스톱 면·좌상단 키라이트·접촉 그림자·재질별 외곽선).
// 상태 애니메이션 CSS는 styles/plant2.css의 "훅 장면" 섹션에 있다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { AvatarKind } from "../../ui/avatar";
import { ask } from "./hookAsk";

type Finish = () => void;
type Face = (kind: AvatarKind) => void;
type HookData = { choices?: string[] };
type PlantHookRenderer = (
  scene: HTMLElement,
  helper: HTMLElement,
  step: HookData,
  finish: Finish,
  face: Face,
) => () => void;

interface HookLife {
  listen(target: EventTarget, type: string, handler: EventListener): void;
  later(fn: () => void, delay: number): void;
  cleanup(): void;
}

function hookLife(choiceBox: HTMLElement): HookLife {
  const timers = new Set<number>();
  const cleanups: (() => void)[] = [];
  let active = true;
  return {
    listen(target, type, handler) {
      target.addEventListener(type, handler);
      cleanups.push(() => target.removeEventListener(type, handler));
    },
    later(fn, delay) {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (active) fn();
      }, delay);
      timers.add(timer);
    },
    cleanup() {
      active = false;
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
      cleanups.forEach((c) => c());
      cleanups.length = 0;
      choiceBox.replaceChildren();
    },
  };
}

function mountScene(scene: HTMLElement, className: string, svgArt: string, actionLabel: string): {
  art: HTMLElement;
  action: HTMLButtonElement;
  choices: HTMLElement;
} {
  const art = el("div", { class: `pgx-hk ${className}`, html: svgArt });
  const action = el(
    "button",
    { class: "swapbtn pulse pgx-action", attrs: { type: "button", "aria-label": actionLabel } },
    el("span", { text: actionLabel }),
  ) as HTMLButtonElement;
  const choices = el("div", { class: "hook-choices pgx-choices" });
  scene.append(art, action, choices);
  return { art, action, choices };
}

function settleAction(action: HTMLButtonElement): void {
  action.disabled = true;
  action.classList.remove("pulse");
  action.classList.add("done-static");
}

function options(custom: string[] | undefined, fallback: string[]): string[] {
  return custom && custom.length >= 2 ? custom : fallback;
}

const DEFS = `<linearGradient id="pg-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--n0)"/><stop offset=".5" stop-color="var(--plant-scene-mid, #E6F3E8)"/><stop offset="1" stop-color="var(--plant-scene-lo, #C9E2D1)"/></linearGradient>
<linearGradient id="pg-leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--plant-leaf-hi)"/><stop offset=".55" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></linearGradient>
<linearGradient id="pg-clay" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F0B27C"/><stop offset=".55" stop-color="#D08A54"/><stop offset="1" stop-color="#8A5330"/></linearGradient>
<linearGradient id="pg-soil" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8C6242"/><stop offset="1" stop-color="#4E3421"/></linearGradient>
<linearGradient id="pg-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--n0)" stop-opacity=".92"/><stop offset=".55" stop-color="#DCEBF5" stop-opacity=".5"/><stop offset="1" stop-color="#B7D4E6" stop-opacity=".34"/></linearGradient>
<linearGradient id="pg-wood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#C9A87C"/><stop offset=".52" stop-color="#A98254"/><stop offset="1" stop-color="#7A5A36"/></linearGradient>
<radialGradient id="pg-sun" cx=".4" cy=".35" r=".7"><stop stop-color="#FFF0C2"/><stop offset=".55" stop-color="var(--plant-sun)"/><stop offset="1" stop-color="#F3A93B"/></radialGradient>
<filter id="pg-sh" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="2.2" stdDeviation="2.2" flood-color="var(--plant-shadow)" flood-opacity=".2"/></filter>`;

const svg = (inner: string): string =>
  `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${DEFS}</defs><rect x="4" y="4" width="232" height="162" rx="16" fill="url(#pg-bg)"/>${inner}</svg>`;

// ── 1. sproutpot — 화분의 흙은 그대로인데 나무만 커졌다 (L1 도입) ──
const SPROUTPOT = svg(`
<ellipse cx="120" cy="150" rx="62" ry="8" fill="var(--plant-shadow)" opacity=".13"/>
<g filter="url(#pg-sh)">
  <path d="M84 108 H156 L148 148 H92Z" fill="url(#pg-clay)" stroke="#7A4526" stroke-width="1.4"/>
  <rect x="80" y="100" width="80" height="12" rx="5" fill="url(#pg-clay)" stroke="#7A4526" stroke-width="1.4"/>
  <path d="M88 108 H152 L151 116 H89Z" fill="url(#pg-soil)"/>
</g>
<g class="pg-sap">
  <path d="M120 108 V88" stroke="var(--plant-stem)" stroke-width="3"/>
  <path d="M120 92 C110 84 104 88 106 94 C110 99 117 97 120 92Z" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.1"/>
  <path d="M120 92 C130 84 136 88 134 94 C130 99 123 97 120 92Z" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.1"/>
</g>
<g class="pg-tree">
  <path d="M120 110 V52" stroke="#7A5A36" stroke-width="7" stroke-linecap="round"/>
  <path d="M120 74 L104 62 M120 66 L136 56" stroke="#7A5A36" stroke-width="4"/>
  <ellipse cx="120" cy="44" rx="44" ry="27" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.4"/>
  <ellipse cx="98" cy="52" rx="24" ry="16" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <ellipse cx="144" cy="52" rx="22" ry="15" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
</g>
<g class="pg-soilmark">
  <path d="M74 112 H86" stroke="var(--n700)" stroke-width="1.6" stroke-dasharray="3 3"/>
  <text x="52" y="116" font-size="10" font-weight="850" fill="var(--n700)">흙</text>
  <text x="30" y="132" font-size="9.5" font-weight="800" fill="var(--n600)">높이 그대로</text>
</g>
<g class="pg-years" opacity="0"><rect x="152" y="18" width="66" height="24" rx="12" fill="var(--n0)" stroke="var(--n200)"/><text x="185" y="34" text-anchor="middle" font-size="11" font-weight="900" fill="var(--subj-plant, #27864B)">5년 뒤</text></g>`);

// ── 2. stomapeek — 잎 뒷면의 작은 문 (L2 도입) ──
const STOMAPEEK = svg(`
<ellipse cx="112" cy="146" rx="66" ry="8" fill="var(--plant-shadow)" opacity=".12"/>
<g filter="url(#pg-sh)"><path d="M36 118 C48 62 108 40 178 46 C176 116 118 142 36 118Z" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.5"/>
<path d="M40 116 C82 100 140 74 176 48" stroke="var(--plant-vein)" stroke-width="2.4"/>
<path d="M72 108 L84 82 M104 96 L112 70 M136 84 L140 60" stroke="var(--plant-vein)" stroke-width="1.4"/></g>
<g class="pg-lens">
  <circle cx="152" cy="92" r="42" fill="var(--n0)" fill-opacity=".95" stroke="var(--n700)" stroke-width="3"/>
  <path d="M182 122 L206 146" stroke="var(--n700)" stroke-width="7"/>
  <g class="pg-pores" opacity="0">
    <g fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1">
      <ellipse cx="140" cy="76" rx="11" ry="4.4"/><ellipse cx="140" cy="86" rx="11" ry="4.4"/>
      <ellipse cx="168" cy="92" rx="11" ry="4.4"/><ellipse cx="168" cy="102" rx="11" ry="4.4"/>
      <ellipse cx="140" cy="108" rx="10" ry="4"/><ellipse cx="140" cy="117" rx="10" ry="4"/>
    </g>
    <ellipse cx="140" cy="81" rx="6" ry="3.4" fill="#22402F"/>
    <ellipse cx="168" cy="97" rx="6" ry="3.4" fill="#22402F"/>
    <ellipse cx="140" cy="112.5" rx="5.4" ry="3" fill="#22402F"/>
  </g>
</g>
<text x="22" y="40" font-size="11" font-weight="900" fill="var(--n700)">잎 뒷면</text>`);

// ── 3. darkbox — 하루 동안 어둠상자를 씌운 잎 (L3 도입) ──
const DARKBOX = svg(`
<path d="M4 126H236V166H4Z" fill="url(#pg-wood)"/>
<circle cx="42" cy="34" r="16" fill="url(#pg-sun)"/>
<path d="M42 12v-6M42 62v-6M20 34h-6M70 34h-6M27 19l-4-4M61 53l4 4M57 19l4-4M27 49l-4 4" stroke="var(--plant-sun)" stroke-width="2.4"/>
<g filter="url(#pg-sh)">
  <path d="M52 96 H100 L94 126 H58Z" fill="url(#pg-clay)" stroke="#7A4526" stroke-width="1.3"/>
  <path d="M76 96 V72" stroke="var(--plant-stem)" stroke-width="3"/>
  <ellipse class="pg-leafA" cx="62" cy="66" rx="17" ry="9" transform="rotate(-18 62 66)" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <ellipse cx="92" cy="64" rx="16" ry="8.5" transform="rotate(14 92 64)" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <path d="M140 96 H188 L182 126 H146Z" fill="url(#pg-clay)" stroke="#7A4526" stroke-width="1.3"/>
  <path d="M164 96 V72" stroke="var(--plant-stem)" stroke-width="3"/>
  <ellipse class="pg-leafB" cx="150" cy="66" rx="17" ry="9" transform="rotate(-18 150 66)" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <ellipse cx="180" cy="64" rx="16" ry="8.5" transform="rotate(14 180 64)" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
</g>
<g class="pg-box"><path d="M126 40 H206 V126 H126Z" fill="#2C3440" stroke="#161B22" stroke-width="1.6"/><path d="M126 40 H206 L196 30 H136Z" fill="#3A4450" stroke="#161B22" stroke-width="1.4"/></g>
<text x="76" y="146" text-anchor="middle" font-size="10.5" font-weight="900" fill="var(--n0)">햇빛 아래</text>
<text x="164" y="146" text-anchor="middle" font-size="10.5" font-weight="900" fill="var(--n0)">어둠상자</text>`);

// ── 4. mixedtest — 두 가지를 한꺼번에 바꾼 실험 (L4 도입) ──
const MIXEDTEST = svg(`
<path d="M4 128H236V166H4Z" fill="url(#pg-wood)"/>
<g filter="url(#pg-sh)">
  <path d="M26 84 H98 V128 H26Z" fill="url(#pg-glass)" stroke="#8FB6C9" stroke-width="1.5"/>
  <path d="M142 84 H214 V128 H142Z" fill="url(#pg-glass)" stroke="#8FB6C9" stroke-width="1.5"/>
  <path d="M62 128 V104" stroke="var(--plant-stem)" stroke-width="3"/>
  <ellipse class="pg-grow-a" cx="62" cy="98" rx="20" ry="10" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <path d="M178 128 V104" stroke="var(--plant-stem)" stroke-width="3"/>
  <ellipse class="pg-grow-b" cx="178" cy="98" rx="20" ry="10" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
</g>
<g class="pg-lampnear"><circle cx="62" cy="44" r="13" fill="url(#pg-sun)" stroke="#C98A22" stroke-width="1.2"/><path d="M62 57 V70" stroke="var(--plant-sun)" stroke-width="3" stroke-dasharray="4 5"/></g>
<g class="pg-lampfar"><circle cx="178" cy="24" r="11" fill="url(#pg-sun)" stroke="#C98A22" stroke-width="1.2"/><path d="M178 35 V70" stroke="var(--plant-sun)" stroke-width="2.4" stroke-dasharray="4 6" opacity=".7"/></g>
<g class="pg-waterlabel"><text x="62" y="150" text-anchor="middle" font-size="10" font-weight="900" fill="var(--n0)">물 200 mL</text>
<text x="178" y="150" text-anchor="middle" font-size="10" font-weight="900" fill="var(--n0)">물 50 mL</text></g>
<g class="pg-flags" opacity="0">
  <rect x="20" y="12" width="86" height="20" rx="10" fill="#FFF3E6" stroke="#E8A33D"/><text x="63" y="26" text-anchor="middle" font-size="10" font-weight="900" fill="#A96410">전등도 다름</text>
  <rect x="136" y="12" width="86" height="20" rx="10" fill="#FFF3E6" stroke="#E8A33D"/><text x="179" y="26" text-anchor="middle" font-size="10" font-weight="900" fill="#A96410">물도 다름</text>
</g>`);

// ── 5. greenhouse — 빛도 이산화 탄소도 넉넉한 온실인데 (L5 도입) ──
const GREENHOUSE = svg(`
<path d="M4 130H236V166H4Z" fill="url(#pg-wood)"/>
<g filter="url(#pg-sh)">
  <path d="M28 60 L120 22 L212 60 V130 H28Z" fill="url(#pg-glass)" stroke="#8FB6C9" stroke-width="1.8"/>
  <path d="M120 22 V130 M28 60 H212 M74 41 V130 M166 41 V130" stroke="#A8C8D8" stroke-width="1.2"/>
</g>
<g>
  <path d="M62 130 V108" stroke="var(--plant-stem)" stroke-width="3"/>
  <ellipse class="pg-plant1" cx="62" cy="102" rx="18" ry="9" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <path d="M120 130 V104" stroke="var(--plant-stem)" stroke-width="3"/>
  <ellipse class="pg-plant2" cx="120" cy="98" rx="19" ry="9.5" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <path d="M178 130 V108" stroke="var(--plant-stem)" stroke-width="3"/>
  <ellipse class="pg-plant3" cx="178" cy="102" rx="18" ry="9" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
</g>
<g class="pg-gauges" opacity="0">
  <rect x="16" y="14" width="74" height="22" rx="11" fill="var(--n0)" stroke="var(--n200)"/><text x="53" y="29" text-anchor="middle" font-size="10" font-weight="900" fill="var(--subj-plant, #27864B)">빛 충분</text>
  <rect x="94" y="14" width="86" height="22" rx="11" fill="var(--n0)" stroke="var(--n200)"/><text x="137" y="29" text-anchor="middle" font-size="10" font-weight="900" fill="var(--subj-plant, #27864B)">이산화 탄소 충분</text>
  <rect x="184" y="14" width="46" height="22" rx="11" fill="#EAF2FF" stroke="#7FA9E8"/><text x="207" y="29" text-anchor="middle" font-size="11" font-weight="900" fill="#1B54B8">12 ℃</text>
</g>`);

// ── 6. mangrove — 뿌리를 물 밖으로 내민 맹그로브 (L6 도입) ──
const MANGROVE = svg(`
<rect x="4" y="96" width="232" height="70" fill="#9FC7D6"/>
<path d="M4 96 H236" stroke="#7FB0C4" stroke-width="2"/>
<circle cx="204" cy="34" r="15" fill="url(#pg-sun)"/>
<g filter="url(#pg-sh)">
  <path d="M96 96 V54" stroke="#7A5A36" stroke-width="8"/>
  <ellipse cx="96" cy="44" rx="46" ry="24" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.4"/>
  <ellipse cx="60" cy="52" rx="22" ry="14" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <ellipse cx="132" cy="52" rx="22" ry="14" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <path d="M96 96 C78 100 70 112 66 126 M96 96 C114 100 122 112 126 126 M96 96 C92 108 90 118 90 128 M96 96 C104 106 108 116 110 128" stroke="#6B4A2C" stroke-width="4"/>
</g>
<g class="pg-snorkels">
  <path d="M44 126 V102 M56 128 V108 M150 126 V104 M162 128 V110 M178 126 V106" stroke="#6B4A2C" stroke-width="5"/>
  <g class="pg-airdots" opacity="0" fill="var(--plant-oxygen)">
    <circle cx="44" cy="94" r="4"/><circle cx="56" cy="100" r="3.4"/><circle cx="150" cy="96" r="4"/><circle cx="162" cy="102" r="3.4"/><circle cx="178" cy="98" r="3.6"/>
  </g>
</g>
<path d="M4 118 C40 112 70 124 110 118 C150 112 190 124 236 116" stroke="#7FB0C4" stroke-width="2.4" opacity=".8"/>
<text x="20" y="160" font-size="10.5" font-weight="900" fill="#2C5568">갯벌 · 물속 흙</text>`);

// ── 7. honeyflower — 꽃꿀의 단맛은 어디서 왔을까 (L7 도입) ──
const HONEYFLOWER = svg(`
<ellipse cx="120" cy="152" rx="58" ry="7" fill="var(--plant-shadow)" opacity=".12"/>
<g filter="url(#pg-sh)">
  <path d="M120 148 V64" stroke="var(--plant-stem)" stroke-width="5"/>
  <ellipse cx="92" cy="104" rx="24" ry="11" transform="rotate(-20 92 104)" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <ellipse cx="150" cy="118" rx="22" ry="10" transform="rotate(16 150 118)" fill="url(#pg-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2"/>
  <g>
    <g fill="#F5A5C0" stroke="#C86C90" stroke-width="1.3">
      <ellipse cx="120" cy="40" rx="13" ry="20"/><ellipse cx="120" cy="40" rx="20" ry="13"/>
      <ellipse cx="106" cy="30" rx="13" ry="17" transform="rotate(-42 106 30)"/><ellipse cx="134" cy="30" rx="13" ry="17" transform="rotate(42 134 30)"/>
      <ellipse cx="106" cy="52" rx="13" ry="17" transform="rotate(42 106 52)"/><ellipse cx="134" cy="52" rx="13" ry="17" transform="rotate(-42 134 52)"/>
    </g>
    <circle cx="120" cy="41" r="9" fill="url(#pg-sun)" stroke="#C98A22" stroke-width="1.2"/>
  </g>
</g>
<g class="pg-nectar" opacity="0"><circle cx="120" cy="44" r="4.6" fill="var(--pgx-sugar, #FF922B)" stroke="#B45309" stroke-width="1"/>
<rect x="150" y="20" width="76" height="22" rx="11" fill="#FFF6EA" stroke="#E8A33D"/><text x="188" y="35" text-anchor="middle" font-size="10.5" font-weight="900" fill="#A96410">달콤한 꽃꿀</text></g>
<g class="pg-bee"><ellipse cx="188" cy="82" rx="11" ry="7.5" fill="#F2C14E" stroke="#8A6516" stroke-width="1.2"/><path d="M182 79 h12 M182 85 h12" stroke="#8A6516" stroke-width="2"/><ellipse cx="186" cy="72" rx="8" ry="5" fill="var(--n0)" fill-opacity=".8" stroke="#8A6516" stroke-width="1"/></g>`);

function runHook(
  scene: HTMLElement,
  helper: HTMLElement,
  step: HookData,
  finish: Finish,
  face: Face,
  config: {
    className: string; svg: string; action: string; intro: string; changed: string; state: string;
    wait?: number; choices: string[]; good: string; bad: string;
  },
): () => void {
  const { art, action, choices } = mountScene(scene, config.className, config.svg, config.action);
  const life = hookLife(choices);
  helper.innerHTML = config.intro;
  face("curious");
  let done = false;
  life.listen(action, "click", () => {
    if (done) return;
    done = true;
    settleAction(action);
    art.classList.add(config.state);
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = config.changed;
    life.later(() => {
      face("curious");
      ask(choices, helper, {
        choices: options(step.choices, config.choices),
        good: config.good,
        bad: config.bad,
        onDone: finish,
      });
    }, config.wait ?? 820);
  });
  return life.cleanup;
}

export const renderSproutPot: PlantHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "pgx-hk-sproutpot", svg: SPROUTPOT, action: "5년 뒤 화분 보기", state: "grown", wait: 1500,
  intro: "작은 묘목을 화분에 심고 <b>물만 주며</b> 5년을 길렀어요. 나무는 몰라보게 커졌는데, 화분의 <b>흙 높이는 거의 그대로</b>예요.",
  changed: "나무의 몸이 이만큼 늘어났는데 흙은 줄지 않았어요. 그 많은 몸은 대체 <b>무엇으로</b> 만들어졌을까요?",
  choices: [
    "공기 중의 이산화 탄소와 물을 재료로 스스로 만들었어요",
    "흙 속 양분을 조금씩 먹어서 몸이 커졌어요",
    "물만 마셔도 몸이 저절로 커지는 성질이 있어요",
  ],
  good: "맞아요! 식물은 <b>빛에너지</b>를 이용해 <b>공기 중 이산화 탄소와 물</b>로 스스로 양분을 만들어요. 그 양분이 쌓여 몸이 된답니다.",
  bad: "흙이 줄지 않았다는 게 결정적인 단서예요. 식물의 몸은 흙을 먹어서가 아니라 <b>공기와 물을 재료로 스스로 만든 양분</b>에서 나왔어요.",
});

export const renderStomaPeek: PlantHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "pgx-hk-stomapeek", svg: STOMAPEEK, action: "확대해서 보기", state: "zoomed", wait: 900,
  intro: "잎 뒷면은 매끈해 보이지만, 확대경을 대면 이야기가 달라져요. <b>확대해서</b> 들여다볼까요?",
  changed: "입술 모양 세포 두 개가 마주 보며 만든 <b>작은 구멍</b>이 잔뜩 보여요. 이 구멍은 무슨 일을 할까요?",
  choices: [
    "기체가 드나드는 문이에요",
    "빛을 모으는 돋보기 역할을 해요",
    "빗물을 저장하는 작은 그릇이에요",
  ],
  good: "맞아요! 이 구멍이 <b>기공</b>이에요. 잎은 여기로 이산화 탄소를 들이고 산소를 내보내요.",
  bad: "이 구멍은 빛을 모으거나 물을 담는 곳이 아니라 <b>기체가 드나드는 문(기공)</b>이에요. 잎 뒷면에 특히 많답니다.",
});

export const renderDarkBox: PlantHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "pgx-hk-darkbox", svg: DARKBOX, action: "하루 뒤 상자 열기", state: "opened", wait: 1050,
  intro: "똑같은 상추 두 포기 중 <b>한쪽에만 어둠상자</b>를 씌우고 하루를 두었어요. 상자를 열면 무엇이 달라져 있을까요?",
  changed: "상자를 열었더니 두 잎 다 <b>초록색 그대로</b>예요. 겉만 봐서는 차이를 알 수 없네요. 어떻게 확인할까요?",
  choices: [
    "잎 속에 양분(녹말)이 생겼는지 검사해요",
    "잎의 초록색이 얼마나 진한지 견주어요",
    "잎을 만져 보고 어느 쪽이 더 부드러운지 봐요",
  ],
  good: "맞아요! 겉모습이 아니라 <b>잎 속에 만들어진 양분</b>을 확인해야 해요. 다음 실험에서 직접 검사해 볼게요.",
  bad: "색이나 촉감은 하루 만에 눈에 띄게 달라지지 않아요. 확인해야 할 것은 <b>잎 속에 만들어진 양분(녹말)</b>이랍니다.",
});

export const renderMixedTest: PlantHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "pgx-hk-mixedtest", svg: MIXEDTEST, action: "두 상추 비교하기", state: "checked", wait: 1000,
  intro: "빛의 세기가 광합성에 미치는 영향을 알아보려고, 왼쪽 상추엔 전등을 <b>가까이</b> 두고 물을 <b>200 mL</b>, 오른쪽엔 전등을 <b>멀리</b> 두고 물을 <b>50 mL</b> 주었어요.",
  changed: "왼쪽이 훨씬 잘 자랐어요. 그런데 이 결과로 \"빛이 세면 광합성이 활발하다\"고 말해도 될까요?",
  choices: [
    "다르게 한 조건이 둘이라 원인을 하나로 짚을 수 없어요",
    "왼쪽이 잘 자랐으니 빛 때문이라고 말할 수 있어요",
    "물을 더 주었으니 빛은 아무 상관이 없어요",
  ],
  good: "맞아요! 빛도 물도 함께 달랐으니 <b>무엇 때문인지 가릴 수 없어요</b>. 알아보려는 조건 하나만 다르게 해야 해요.",
  bad: "결과가 달라진 원인이 빛인지 물인지 이 실험으로는 알 수 없어요. <b>다르게 하는 조건은 하나</b>, 나머지는 모두 같게 맞춰야 해요.",
});

export const renderGreenhouse: PlantHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "pgx-hk-greenhouse", svg: GREENHOUSE, action: "온실 계기판 확인", state: "measured", wait: 980,
  intro: "겨울 온실이에요. 전등으로 빛을 넉넉히 비추고 이산화 탄소도 충분히 넣어 주는데, <b>식물이 잘 자라지 않아요</b>.",
  changed: "계기판을 보니 빛도 이산화 탄소도 충분한데 <b>온도가 12 ℃</b>예요. 무엇이 문제일까요?",
  choices: [
    "온도가 낮아서 광합성이 활발하게 일어나지 못해요",
    "빛이 너무 세서 잎이 지쳤어요",
    "이산화 탄소가 많으면 오히려 광합성이 멈춰요",
  ],
  good: "맞아요! 광합성은 빛·이산화 탄소만이 아니라 <b>온도</b>의 영향도 받아요. 세 가지가 모두 알맞아야 활발해져요.",
  bad: "빛과 이산화 탄소는 넉넉했어요. 남은 조건은 <b>온도</b>예요. 광합성은 알맞은 온도에서 가장 활발하답니다.",
});

export const renderMangrove: PlantHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "pgx-hk-mangrove", svg: MANGROVE, action: "삐죽 나온 뿌리 살펴보기", state: "peeked", wait: 900,
  intro: "갯벌에 사는 맹그로브예요. 다른 나무와 달리 <b>뿌리 일부가 물 밖으로 삐죽</b> 솟아 있어요.",
  changed: "물속 흙은 공기가 잘 통하지 않아요. 뿌리를 굳이 물 밖으로 내민 까닭은 무엇일까요?",
  choices: [
    "뿌리도 호흡해야 해서 산소를 얻으려고요",
    "뿌리로도 광합성을 하려고 빛을 받는 거예요",
    "물에 떠내려가지 않게 몸을 붙잡으려고요",
  ],
  good: "맞아요! 식물도 <b>호흡</b>을 해요. 물속 흙에는 산소가 모자라서 뿌리 일부를 공기 중으로 내민 거예요.",
  bad: "뿌리에는 엽록체가 거의 없어 광합성을 하지 못해요. 뿌리가 밖으로 나온 건 <b>호흡에 필요한 산소</b>를 얻기 위해서예요.",
});

export const renderHoneyFlower: PlantHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "pgx-hk-honeyflower", svg: HONEYFLOWER, action: "꽃 속 들여다보기", state: "tasted", wait: 900,
  intro: "벌이 꽃을 찾는 까닭은 <b>달콤한 꽃꿀</b> 때문이에요. 그런데 꽃에는 잎 같은 초록색이 거의 없죠.",
  changed: "꽃 안쪽에 달콤한 꿀이 고여 있어요. 초록색 잎도 아닌 꽃이 이 <b>단맛</b>을 어디서 얻었을까요?",
  choices: [
    "잎에서 만든 양분이 꽃까지 옮겨 온 거예요",
    "꽃잎이 햇빛을 받아 그 자리에서 꿀을 만들어요",
    "뿌리가 흙에서 빨아올린 설탕이 그대로 모인 거예요",
  ],
  good: "맞아요! 광합성은 주로 <b>잎</b>에서 일어나고, 거기서 만든 양분이 <b>줄기를 타고</b> 꽃·열매·뿌리로 옮겨 가요.",
  bad: "꽃잎에는 엽록체가 거의 없고, 흙에 설탕이 녹아 있지도 않아요. 꿀의 재료는 <b>잎에서 만들어져 옮겨 온 양분</b>이에요.",
});
