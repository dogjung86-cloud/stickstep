// hookBody — 중2 VI 동물과 에너지 훅 6종.
// 조작으로 일상 장면의 변화를 먼저 본 뒤 공용 hookAsk.ask()로 예측한다.
// SVG는 240×170, 파운드리 재질 문법(3스톱 면·키라이트·접촉 그림자·재질별 외곽선)을 따른다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { AvatarKind } from "../../ui/avatar";
import { ask } from "./hookAsk";

type Finish = () => void;
type Face = (kind: AvatarKind) => void;
type HookData = { choices?: string[] };
type BodyHookRenderer = (
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
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      cleanups.forEach((cleanup) => cleanup());
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
  const art = el("div", { class: `hk-body ${className}`, html: svgArt });
  const action = el(
    "button",
    { class: "swapbtn pulse body-action", attrs: { type: "button", "aria-label": actionLabel } },
    el("span", { text: actionLabel }),
  ) as HTMLButtonElement;
  const choices = el("div", { class: "hook-choices body-choices" });
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

const COMMON_DEFS = `<linearGradient id="hb-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--n0)"/><stop offset=".54" stop-color="var(--subj-body-tint)"/><stop offset="1" stop-color="var(--body-tissue-hi)"/></linearGradient>
<linearGradient id="hb-wood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--body-cell-hi)"/><stop offset=".52" stop-color="var(--body-cell)"/><stop offset="1" stop-color="var(--body-cell-lo)"/></linearGradient>
<linearGradient id="hb-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--n0)" stop-opacity=".9"/><stop offset=".55" stop-color="var(--body-airway-hi)" stop-opacity=".48"/><stop offset="1" stop-color="var(--body-airway)" stop-opacity=".3"/></linearGradient>
<linearGradient id="hb-organ" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-organ-hi)"/><stop offset=".54" stop-color="var(--body-organ)"/><stop offset="1" stop-color="var(--body-organ-lo)"/></linearGradient>
<linearGradient id="hb-air" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-airway-hi)"/><stop offset=".55" stop-color="var(--body-airway)"/><stop offset="1" stop-color="var(--body-airway-lo)"/></linearGradient>
<filter id="hb-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="2.2" stdDeviation="2.2" flood-color="var(--body-shadow)" flood-opacity=".2"/></filter>`;

const BREAD_ONLY_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${COMMON_DEFS}<radialGradient id="hb-bread" cx=".3" cy=".22" r=".9"><stop stop-color="var(--body-cell-hi)"/><stop offset=".55" stop-color="var(--body-cell)"/><stop offset="1" stop-color="var(--body-cell-lo)"/></radialGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb-bg)"/><path d="M4 129H236V166H4Z" fill="url(#hb-wood)"/><ellipse cx="120" cy="144" rx="78" ry="8" fill="var(--body-shadow)" opacity=".11"/>
<g filter="url(#hb-shadow)"><ellipse cx="120" cy="121" rx="72" ry="18" fill="var(--n0)" stroke="var(--body-airway-lo)" stroke-width="1.5"/><ellipse cx="120" cy="117" rx="61" ry="12" fill="var(--body-airway-hi)" opacity=".55"/>
<g class="hb-bread-stack" fill="url(#hb-bread)" stroke="var(--body-cell-lo)" stroke-width="1.5"><path d="M82 101 C80 89 91 82 105 84 H136 C151 82 161 91 158 103 L154 115 H86Z"/><path d="M88 88 C86 76 98 69 111 71 H140 C154 70 163 79 160 91 L157 102 H91Z"/><path d="M94 75 C92 63 103 56 116 58 H145 C158 57 167 66 164 78 L161 89 H97Z"/></g><path d="M104 65 C115 60 128 60 138 62" stroke="var(--n0)" stroke-width="2.5" opacity=".52"/></g>
<g class="hb-day-tags">${[0,1,2,3,4].map((i) => `<g transform="translate(${42+i*38} 26)"><circle r="13" fill="var(--n0)" stroke="var(--n300)"/><path d="M-7 1h14" stroke="var(--body-cell-lo)" stroke-width="3"/><text y="5" text-anchor="middle" font-size="10" font-weight="900" fill="var(--n700)">${i+1}</text></g>`).join("")}</g>
<g class="hb-alert" opacity="0"><path d="M25 94 C16 84 18 70 31 65 C43 61 54 69 53 81 C52 94 39 101 25 94Z" fill="var(--subj-body-tint)" stroke="var(--subj-body-press)" stroke-width="1.5"/><path d="M31 72v10M31 87v1" stroke="var(--subj-body)" stroke-width="2.5"/></g></svg>`;

const CHEW_RICE_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${COMMON_DEFS}<radialGradient id="hb-rice" cx=".3" cy=".2" r=".9"><stop stop-color="var(--n0)"/><stop offset=".55" stop-color="var(--body-airway-hi)"/><stop offset="1" stop-color="var(--body-airway)"/></radialGradient></defs><rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb-bg)"/><path d="M4 131H236V166H4Z" fill="url(#hb-wood)"/><ellipse cx="84" cy="139" rx="53" ry="7" fill="var(--body-shadow)" opacity=".11"/>
<g filter="url(#hb-shadow)"><path d="M32 86 H136 L127 134 Q84 151 41 134Z" fill="url(#hb-glass)" stroke="var(--body-airway-lo)" stroke-width="1.6"/><ellipse cx="84" cy="86" rx="52" ry="17" fill="var(--n0)" stroke="var(--body-airway-lo)" stroke-width="1.4"/><g fill="url(#hb-rice)" stroke="var(--body-airway-lo)" stroke-width=".6">${[[54,82],[68,77],[84,81],[99,76],[113,83],[62,91],[79,91],[95,91]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="11" ry="4" transform="rotate(-12 ${x} ${y})"/>`).join("")}</g></g>
<g class="hb-mouth" transform="translate(175 66)"><circle cx="0" cy="12" r="34" fill="url(#hb-organ)" stroke="var(--body-organ-lo)" stroke-width="1.6"/><path class="hb-jaw" d="M-16 12 Q0 28 18 11" stroke="var(--n800)" stroke-width="3"/><path d="M-12 15 Q0 20 12 14" stroke="var(--body-organ-lo)" stroke-width="2"/></g><g class="hb-sweet" opacity="0" fill="var(--body-nutrient)" stroke="var(--body-cell-lo)" stroke-width="1">${[[149,37],[179,24],[205,43],[201,93]].map(([x,y])=>`<path d="M${x} ${y-6} l2 4 5 1 -4 3 1 5 -4-2 -5 2 1-5 -4-3 5-1Z"/>`).join("")}</g><g class="hb-chews" opacity="0"><rect x="142" y="119" width="68" height="27" rx="13.5" fill="var(--n0)" stroke="var(--n200)"/><text x="176" y="137" text-anchor="middle" font-size="12" font-weight="900" fill="var(--subj-body-press)">오래 씹기</text></g></svg>`;

const PULSE_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${COMMON_DEFS}</defs><rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb-bg)"/><ellipse cx="120" cy="148" rx="88" ry="7" fill="var(--body-shadow)" opacity=".1"/>
<path d="M28 113 C57 87 95 80 126 91 C151 100 174 104 211 94" stroke="url(#hb-organ)" stroke-width="34" stroke-linecap="round"/><path d="M35 102 C67 84 102 85 126 94" stroke="var(--n0)" stroke-width="4" opacity=".32"/>
<path d="M48 111 C82 94 113 100 145 103 C169 106 186 102 207 96" stroke="var(--body-deoxygenated)" stroke-width="8"/><g class="hb-pulse-rings" opacity="0"><circle cx="142" cy="103" r="10" stroke="var(--subj-body)" stroke-width="3"/><circle cx="142" cy="103" r="19" stroke="var(--subj-body)" stroke-width="2" opacity=".58"/><circle cx="142" cy="103" r="29" stroke="var(--subj-body)" stroke-width="1.5" opacity=".28"/></g>
<g class="hb-heart" transform="translate(63 48)" filter="url(#hb-shadow)"><path d="M0 25 C-8 15 -21 8 -20-5 C-19-16 -7-18 0-8 C7-19 21-15 20-4 C19 8 8 17 0 25Z" fill="url(#hb-organ)" stroke="var(--body-organ-lo)" stroke-width="1.5"/></g><path class="hb-wave" d="M101 48h18l8-17 11 35 10-23 8 5h37" stroke="var(--subj-body)" stroke-width="3" stroke-dasharray="100" stroke-dashoffset="100"/></svg>`;

const DEEP_BREATH_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${COMMON_DEFS}</defs><rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb-bg)"/><ellipse cx="120" cy="153" rx="62" ry="7" fill="var(--body-shadow)" opacity=".11"/>
<g class="hb-chest"><path d="M78 33 C56 57 55 118 71 147 H169 C186 116 184 56 160 33Z" fill="var(--n0)" stroke="var(--body-tissue-lo)" stroke-width="1.6"/><g stroke="var(--body-cell-lo)" stroke-width="3" opacity=".58">${[0,1,2,3,4].map(i=>`<path d="M78 ${58+i*14} Q120 ${44+i*14} 162 ${58+i*14}"/>`).join("")}</g>
<g class="hb-lungs"><path d="M115 58 C92 45 77 66 80 102 C81 128 97 139 111 126 C116 116 115 83 115 58Z" fill="url(#hb-organ)" stroke="var(--body-airway-lo)" stroke-width="1.5"/><path d="M125 58 C148 45 163 66 160 102 C159 128 143 139 129 126 C124 116 125 83 125 58Z" fill="url(#hb-organ)" stroke="var(--body-airway-lo)" stroke-width="1.5"/></g><path d="M120 26V72M120 57L99 77M120 57L141 77" stroke="var(--body-airway-lo)" stroke-width="6"/><path class="hb-diaphragm" d="M73 128 Q120 101 167 128" stroke="var(--body-protein)" stroke-width="5"/>
<path class="hb-air-in" d="M120 8V37" stroke="var(--body-oxygen)" stroke-width="4" marker-end="url(#hb-in)" opacity="0"/></g></svg>`.replace("</defs>", `<marker id="hb-in" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1L9 5L1 9Z" fill="var(--body-oxygen)"/></marker></defs>`);

const PEE_COLOR_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${COMMON_DEFS}<linearGradient id="hb-urine" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--body-fat)"/><stop offset=".55" stop-color="var(--body-nutrient)"/><stop offset="1" stop-color="var(--body-cell-lo)"/></linearGradient></defs><rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb-bg)"/><path d="M4 132H236V166H4Z" fill="url(#hb-wood)"/><ellipse cx="120" cy="144" rx="76" ry="7" fill="var(--body-shadow)" opacity=".11"/>
<g filter="url(#hb-shadow)"><path d="M39 39H91L84 125Q65 138 46 125Z" fill="url(#hb-glass)" stroke="var(--body-airway-lo)" stroke-width="1.6"/><path class="hb-water" d="M43 62H87L82 122Q65 132 48 122Z" fill="var(--body-oxygen)" opacity=".66"/><path d="M48 48 C57 43 66 43 72 45" stroke="var(--n0)" stroke-width="3" opacity=".62"/>
<path d="M145 47H202L196 128Q174 140 152 128Z" fill="url(#hb-glass)" stroke="var(--body-airway-lo)" stroke-width="1.6"/><path class="hb-urine" d="M149 82H198L194 125Q174 135 154 125Z" fill="url(#hb-urine)"/><path d="M154 54 C163 49 174 49 182 51" stroke="var(--n0)" stroke-width="3" opacity=".62"/></g><path class="hb-pour" d="M92 67 C116 76 130 84 146 99" stroke="var(--body-oxygen)" stroke-width="5" stroke-dasharray="75" stroke-dashoffset="75"/><text x="65" y="153" text-anchor="middle" font-size="12" font-weight="850" fill="var(--n700)">물</text><text x="174" y="153" text-anchor="middle" font-size="12" font-weight="850" fill="var(--n700)">오줌 표본</text></svg>`;

const AFTER_RUN_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${COMMON_DEFS}</defs><rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb-bg)"/><path d="M4 132H236V166H4Z" fill="var(--body-cell-hi)"/><path d="M4 143 C51 133 90 151 132 141 C175 130 207 146 236 138V166H4Z" fill="var(--body-cell)" opacity=".45"/><ellipse cx="121" cy="145" rx="43" ry="6" fill="var(--body-shadow)" opacity=".12"/>
<g class="hb-runner" stroke="var(--n800)" stroke-width="4" fill="none"><circle cx="116" cy="39" r="15" fill="var(--n0)"/><path d="M115 55L118 94M117 68L90 82M117 69L145 82M117 94L95 126M118 94L144 123"/></g><path class="hb-heart-run" d="M0 18 C-7 9 -18 5 -17-5 C-16-14 -6-15 0-7 C6-15 17-12 17-3 C16 7 7 14 0 18Z" transform="translate(116 73) scale(.45)" fill="url(#hb-organ)" stroke="var(--body-organ-lo)" stroke-width="2"/>
<g class="hb-sweat" opacity="0" fill="var(--body-oxygen)" stroke="var(--body-airway-lo)" stroke-width="1">${[[94,38],[142,33],[88,61]].map(([x,y])=>`<path d="M${x} ${y-7} C${x+6} ${y} ${x+4} ${y+7} ${x} ${y+7} C${x-4} ${y+7} ${x-6} ${y} ${x} ${y-7}Z"/>`).join("")}</g><g class="hb-breath-lines" opacity="0" stroke="var(--body-carbon)" stroke-width="3">${[0,1,2].map(i=>`<path d="M145 ${48+i*10} C168 ${43+i*10} 186 ${46+i*10} 207 ${40+i*10}"/>`).join("")}</g><path class="hb-pulse-line" d="M31 42h34l8-14 9 30 10-20 8 4h22" stroke="var(--subj-body)" stroke-width="3" stroke-dasharray="110" stroke-dashoffset="110"/></svg>`;

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
    }, config.wait ?? 760);
  });
  return life.cleanup;
}

export const renderBreadOnly: BodyHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "hb-breadonly", svg: BREAD_ONLY_SVG, action: "닷새째 식판 보기", state: "observed",
  intro: "좋아하는 빵만 먹겠다고 정한 첫날이에요. 배는 부른데, <b>닷새 동안 빵만</b> 먹어도 몸에 필요한 것을 모두 얻을까요?",
  changed: "닷새째에도 식판에는 빵뿐이에요. 배가 부른 것과 몸에 필요한 영양소를 고루 얻는 것은 같은 일일까요?",
  choices: ["음식마다 든 영양소가 달라 여러 음식을 골고루 먹어야 해요", "배만 부르면 한 가지 음식으로 모든 영양소를 얻어요", "빵에는 영양소가 전혀 없어 먹어도 소용없어요"],
  good: "맞아요! 빵에도 탄수화물 같은 영양소가 있지만, <b>한 음식에 모든 영양소가 알맞게 든 것은 아니에요</b>. 여러 음식을 골고루 먹어야 해요.",
  bad: "빵에도 영양소는 들어 있지만 모든 종류가 알맞게 들어 있지는 않아요. <b>배부름과 균형 잡힌 영양 섭취는 다르다</b>는 점을 기억해요.",
});

export const renderChewRice: BodyHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "hb-chewrice", svg: CHEW_RICE_SVG, action: "밥을 오래 씹어 보기", state: "chewed", wait: 820,
  intro: "갓 지은 밥은 설탕을 넣지 않았는데도, <b>오래 씹으면 단맛</b>이 느껴질 때가 있어요. 직접 오래 씹어 봐요!",
  changed: "씹을수록 은은한 단맛이 올라와요. 입안에서 밥의 녹말에 어떤 변화가 생겼을까요?",
  choices: ["침의 아밀레이스가 녹말을 단맛 나는 엿당으로 분해했어요", "이가 녹말을 포도당 원자로 완전히 부쉈어요", "혀가 설탕을 새로 만들어 밥에 넣었어요"],
  good: "맞아요! 침 속 <b>아밀레이스</b>가 녹말을 엿당으로 분해해 단맛이 느껴져요. 이는 소화가 입에서부터 시작된다는 단서예요.",
  bad: "이는 음식물을 잘게 만들지만 영양소를 화학적으로 분해하는 주인공은 아니에요. 침 속 <b>아밀레이스가 녹말을 엿당으로</b> 바꾸어요.",
});

export const renderPulse: BodyHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "hb-pulse", svg: PULSE_SVG, action: "손목 맥박 짚기", state: "felt", wait: 720,
  intro: "가만히 있어도 손목 안쪽에서 규칙적인 두근거림이 느껴져요. 손가락을 대고 <b>맥박</b>을 짚어 봐요!",
  changed: "손목에서 심장과 같은 리듬이 느껴져요. 심장에서 멀리 떨어진 손목까지 왜 두근거릴까요?",
  choices: ["심장이 밀어낸 혈액의 압력 변화가 동맥을 따라 전해져요", "손목의 뼈가 스스로 수축하며 피를 만들어요", "정맥의 판막이 심장 대신 온몸의 피를 짜내요"],
  good: "맞아요! 심장이 수축해 혈액을 내보낼 때 생긴 <b>압력 변화가 동맥을 따라</b> 전해져 맥박으로 느껴져요.",
  bad: "손목뼈나 정맥 판막이 심장처럼 피를 내보내는 것은 아니에요. <b>심장의 수축이 만든 압력 변화</b>가 동맥을 따라 전해지는 거예요.",
});

export const renderDeepBreath: BodyHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "hb-deepbreath", svg: DEEP_BREATH_SVG, action: "깊게 숨 들이쉬기", state: "breathed", wait: 820,
  intro: "심호흡을 하면 가슴이 크게 부풀어요. 허파가 근육처럼 힘껏 당겨서 커지는 걸까요? <b>깊게 들이쉬어</b> 변화를 봐요!",
  changed: "가슴둘레가 넓어지고 가로막은 아래로 움직였어요. 근육이 없는 허파에 공기가 들어온 까닭은 무엇일까요?",
  choices: ["갈비뼈와 가로막이 흉강을 넓혀 허파 속 압력이 낮아졌어요", "허파 근육이 공기를 빨아들여 갈비뼈를 밀었어요", "심장이 허파 안으로 공기를 직접 펌프질했어요"],
  good: "맞아요! 갈비뼈가 올라가고 가로막이 내려가 <b>흉강 부피가 커지면 압력이 낮아져</b> 바깥 공기가 들어와요.",
  bad: "허파에는 스스로 움직이는 근육이 없고 심장도 공기를 넣지 않아요. <b>갈비뼈와 가로막이 흉강의 부피와 압력</b>을 바꾸어요.",
});

export const renderPeeColor: BodyHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "hb-peecolor", svg: PEE_COLOR_SVG, action: "물 두 컵 마신 뒤 보기", state: "drank", wait: 860,
  intro: "물을 적게 마신 날에는 오줌 색이 진하고, 물을 많이 마시면 맑아져요. <b>물 두 컵</b>을 마신 뒤 표본을 비교해 봐요!",
  changed: "같은 사람인데도 오줌 색이 훨씬 옅어졌어요. 콩팥은 들어온 물의 양에 어떻게 반응했을까요?",
  choices: ["몸에 남길 필요가 적은 물이 오줌에 더 섞여 농도가 옅어졌어요", "물을 마시면 요소가 모두 사라져 오줌이 순수한 물이 돼요", "방광이 물을 영양소로 바꾸어 색을 없앴어요"],
  good: "맞아요! 물이 충분하면 몸으로 되돌려 보내지 않은 물이 오줌에 더 많이 섞여 <b>노폐물의 농도가 옅어질</b> 수 있어요.",
  bad: "물을 마셔도 오줌 속 요소가 모두 사라지는 것은 아니고 방광은 물을 바꾸지 않아요. <b>콩팥에서 물의 재흡수량이 조절</b>되어 농도가 달라져요.",
});

export const renderAfterRun: BodyHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "hb-afterrun", svg: AFTER_RUN_SVG, action: "운동장 한 바퀴 달리기", state: "ran", wait: 760,
  intro: "출발 전에는 숨도 맥박도 잔잔해요. 운동장을 힘껏 달리고 나면 몸은 왜 동시에 <b>헥헥대고 땀</b>을 흘릴까요?",
  changed: "숨과 맥박이 빨라지고 몸이 뜨거워졌어요. 근육세포에서 에너지를 더 많이 얻을 때 네 기관계는 어떻게 반응할까요?",
  choices: ["산소와 영양소 공급, 이산화 탄소와 노폐물 배출을 함께 늘려요", "소화계 하나만 빨라지고 다른 기관계는 모두 쉬어요", "근육세포가 산소 없이 영양소를 그대로 힘으로 바꾸어요"],
  good: "맞아요! 운동할 때는 근육세포의 에너지 사용이 늘어 <b>소화·순환·호흡·배설계가 물질 공급과 배출에 함께 협력</b>해요.",
  bad: "한 기관계만으로는 근육세포에 필요한 물질을 대고 노폐물을 치울 수 없어요. <b>여러 기관계가 연결되어 함께</b> 일해야 해요.",
});
