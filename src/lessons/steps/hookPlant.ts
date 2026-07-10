// hookPlant — 중2 V 식물과 에너지 훅 6종.
// 조작으로 일상 장면의 변화를 먼저 본 뒤 공용 hookAsk.ask()로 예측한다.
// 모든 SVG는 240×170, 파운드리 재질 문법(3스톱 면·좌상단 키라이트·접촉 그림자·재질별 외곽선)을 따른다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { AvatarKind } from "../../ui/avatar";
import { ask } from "./hookAsk";
import "../../styles/plant-hook.css";

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
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      cleanups.forEach((cleanup) => cleanup());
      cleanups.length = 0;
      // hookAsk가 만든 버튼도 DOM에서 떼어 이벤트 리스너와 함께 회수되게 한다.
      choiceBox.replaceChildren();
    },
  };
}

function mountScene(scene: HTMLElement, className: string, svg: string, actionLabel: string): {
  art: HTMLElement;
  action: HTMLButtonElement;
  choices: HTMLElement;
} {
  const art = el("div", { class: `hk-plant ${className}`, html: svg });
  const action = el(
    "button",
    { class: "swapbtn pulse plant-action", attrs: { type: "button", "aria-label": actionLabel } },
    el("span", { text: actionLabel }),
  ) as HTMLButtonElement;
  const choices = el("div", { class: "hook-choices plant-choices" });
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

const POT_MASS_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="pm-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-scene-hi)"/><stop offset=".54" stop-color="var(--plant-scene-mid)"/><stop offset="1" stop-color="var(--plant-scene-lo)"/></linearGradient>
    <linearGradient id="pm-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--plant-wood-hi)"/><stop offset=".5" stop-color="var(--plant-wood)"/><stop offset="1" stop-color="var(--plant-wood-lo)"/></linearGradient>
    <linearGradient id="pm-scale" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-metal-hi)"/><stop offset=".52" stop-color="var(--plant-metal)"/><stop offset="1" stop-color="var(--plant-metal-lo)"/></linearGradient>
    <radialGradient id="pm-pot" cx=".34" cy=".24" r=".9"><stop offset="0" stop-color="var(--plant-clay-hi)"/><stop offset=".52" stop-color="var(--plant-clay)"/><stop offset="1" stop-color="var(--plant-clay-lo)"/></radialGradient>
    <linearGradient id="pm-soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--plant-soil)"/><stop offset=".5" stop-color="var(--plant-soil-lo)"/><stop offset="1" stop-color="var(--plant-soil-lo)"/></linearGradient>
    <radialGradient id="pm-leaf" cx=".3" cy=".22" r=".88"><stop offset="0" stop-color="var(--plant-leaf-hi)"/><stop offset=".5" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></radialGradient>
    <linearGradient id="pm-stem" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--plant-stem)"/><stop offset=".5" stop-color="var(--plant-stem-hi)"/><stop offset="1" stop-color="var(--plant-stem-lo)"/></linearGradient>
    <filter id="pm-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="2.4" stdDeviation="2.4" flood-color="var(--plant-shadow)" flood-opacity=".22"/></filter>
  </defs>
  <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#pm-bg)"/>
  <circle cx="204" cy="28" r="18" fill="var(--plant-sun)" opacity=".8"/><circle cx="199" cy="23" r="5" fill="var(--plant-sun-hi)" opacity=".72"/>
  <path d="M4 137H236V166H4Z" fill="url(#pm-desk)"/><path d="M4 137H236" stroke="var(--plant-wood-hi)" stroke-width="3" opacity=".8"/>
  <ellipse cx="123" cy="143" rx="70" ry="7" fill="var(--plant-shadow)" opacity=".12"/>
  <g filter="url(#pm-shadow)">
    <path d="M64 119h118l-8 22H72Z" fill="url(#pm-scale)" stroke="var(--plant-metal-edge)" stroke-width="1.5"/>
    <rect x="75" y="112" width="96" height="10" rx="5" fill="var(--n100)" stroke="var(--plant-metal-lo)" stroke-width="1.3"/>
    <path d="M82 120h80" stroke="var(--n0)" stroke-width="2" opacity=".72"/>
    <circle cx="52" cy="130" r="21" fill="var(--plant-metal-hi)" stroke="var(--plant-metal-lo)" stroke-width="2"/>
    <circle cx="52" cy="130" r="16" fill="var(--n100)" stroke="var(--plant-metal)" stroke-width="1"/>
    <path d="M39 126l3-1M42 119l2 2M49 115v3M57 116l-1 3M64 121l-3 2M66 129h-3" stroke="var(--plant-metal-lo)" stroke-width="1.4"/>
    <path class="pm-needle" d="M52 130L43 119" stroke="var(--red)" stroke-width="2.2"/><circle cx="52" cy="130" r="3" fill="var(--red-press)"/>
  </g>
  <g filter="url(#pm-shadow)">
    <path d="M88 75h66l-7 39q-1 7-8 7h-36q-7 0-8-7Z" fill="url(#pm-pot)" stroke="var(--plant-clay-lo)" stroke-width="1.6"/>
    <ellipse cx="121" cy="76" rx="34" ry="9" fill="var(--plant-clay-hi)" stroke="var(--plant-clay-lo)" stroke-width="1.5"/>
    <ellipse class="pm-soil" cx="121" cy="76" rx="28" ry="5.8" fill="url(#pm-soil)"/>
    <path d="M96 89c13 4 35 4 49 0" stroke="var(--plant-clay-shine)" stroke-width="2.2" opacity=".45"/>
  </g>
  <g class="pm-plant">
    <path d="M121 75C120 59 123 43 119 24" stroke="url(#pm-stem)" stroke-width="4"/>
    <path d="M121 62l-15-12M121 52l17-13M120 42l-11-12M120 33l13-11" stroke="var(--plant-stem)" stroke-width="2.4"/>
    <g fill="url(#pm-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.25">
      <path d="M107 51C92 49 88 39 92 33c12 0 20 7 19 17Z"/><path d="M136 40c14-4 23-13 20-21-12-1-22 7-23 18Z"/>
      <path d="M109 32C98 25 98 15 103 10c10 3 15 11 11 21Z"/><path d="M132 24c11-8 11-17 6-22-10 3-15 12-11 21Z"/>
      <path d="M119 21c-7-11-3-19 3-21 8 6 9 14 2 22Z"/>
    </g>
    <g stroke="var(--plant-vein)" stroke-width="1" opacity=".62"><path d="M94 35l15 13"/><path d="M154 21l-18 16"/><path d="M104 12l10 18"/><path d="M137 4l-9 18"/></g>
  </g>
  <g opacity=".72"><path d="M182 91h34" stroke="var(--plant-metal-lo)" stroke-width="1.3" stroke-dasharray="3 3"/><path d="M190 83v16M208 83v16" stroke="var(--plant-metal-lo)" stroke-width="1.2"/><rect x="187" y="64" width="25" height="18" rx="3" fill="var(--n0)" stroke="var(--plant-metal)"/><path d="M192 64v-4m8 4v-4m8 4v-4" stroke="var(--plant-metal-lo)" stroke-width="2"/></g>
</svg>`;

const WATERWEED_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="ww-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-water-scene-hi)"/><stop offset=".55" stop-color="var(--plant-water-scene-mid)"/><stop offset="1" stop-color="var(--plant-water-scene-lo)"/></linearGradient>
    <linearGradient id="ww-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--plant-water-hi)" stop-opacity=".72"/><stop offset=".52" stop-color="var(--plant-water-mid)" stop-opacity=".72"/><stop offset="1" stop-color="var(--plant-water-lo)" stop-opacity=".84"/></linearGradient>
    <linearGradient id="ww-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--n0)" stop-opacity=".72"/><stop offset=".55" stop-color="var(--plant-glass)" stop-opacity=".16"/><stop offset="1" stop-color="var(--plant-glass-edge)" stop-opacity=".34"/></linearGradient>
    <linearGradient id="ww-lamp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-metal-hi)"/><stop offset=".5" stop-color="var(--plant-metal-lo)"/><stop offset="1" stop-color="var(--plant-metal-edge)"/></linearGradient>
    <radialGradient id="ww-leaf" cx=".3" cy=".22" r=".9"><stop offset="0" stop-color="var(--plant-leaf-hi)"/><stop offset=".52" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></radialGradient>
    <linearGradient id="ww-gravel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--plant-soil-hi)"/><stop offset=".52" stop-color="var(--plant-soil)"/><stop offset="1" stop-color="var(--plant-soil-lo)"/></linearGradient>
    <radialGradient id="ww-beam" cx=".1" cy=".4" r="1"><stop offset="0" stop-color="var(--plant-sun-hi)" stop-opacity=".9"/><stop offset=".55" stop-color="var(--plant-sun)" stop-opacity=".42"/><stop offset="1" stop-color="var(--plant-sun)" stop-opacity="0"/></radialGradient>
    <filter id="ww-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="2.4" flood-color="var(--plant-water-edge)" flood-opacity=".24"/></filter>
  </defs>
  <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#ww-bg)"/>
  <ellipse cx="133" cy="151" rx="91" ry="7" fill="var(--plant-water-edge)" opacity=".13"/>
  <path class="ww-beam" d="M46 40L105 68 88 142 32 59Z" fill="url(#ww-beam)"/>
  <g filter="url(#ww-shadow)">
    <path d="M16 23h41l-7 18H23Z" fill="url(#ww-lamp)" stroke="var(--plant-metal-edge)" stroke-width="1.4"/>
    <path d="M35 23V10h31" stroke="var(--plant-metal-edge)" stroke-width="5"/><circle class="ww-bulb" cx="36" cy="32" r="7" fill="var(--plant-metal-lo)" stroke="var(--plant-metal-edge)" stroke-width="1.2"/>
    <path d="M23 26h27" stroke="var(--n0)" stroke-width="2" opacity=".6"/>
  </g>
  <g filter="url(#ww-shadow)">
    <rect x="55" y="39" width="160" height="105" rx="10" fill="url(#ww-glass)" stroke="var(--plant-glass-edge)" stroke-width="2"/>
    <path d="M58 53H212V141H58Z" fill="url(#ww-water)"/>
    <path d="M59 54c30 3 61-4 88 0s43-2 64 0" stroke="var(--plant-oxygen)" stroke-width="2.2" opacity=".78"/>
    <path d="M58 119c30-9 59-6 84 1s45 2 70-2v23H58Z" fill="url(#ww-gravel)"/>
    <g fill="var(--plant-wood-hi)" stroke="var(--plant-soil)" stroke-width=".8"><ellipse cx="73" cy="127" rx="9" ry="5"/><ellipse cx="95" cy="122" rx="11" ry="6"/><ellipse cx="123" cy="129" rx="10" ry="5"/><ellipse cx="154" cy="121" rx="12" ry="6"/><ellipse cx="185" cy="128" rx="11" ry="5"/></g>
    <g class="ww-weed" stroke="var(--plant-leaf-lo)" stroke-width="2.2">
      <path d="M106 121c-3-22 4-39 0-59M135 126c2-27-5-47 1-68M164 121c-2-22 5-37 3-55"/>
      <g fill="url(#ww-leaf)" stroke-width="1">
        <ellipse cx="101" cy="106" rx="10" ry="4" transform="rotate(-30 101 106)"/><ellipse cx="112" cy="96" rx="10" ry="4" transform="rotate(31 112 96)"/><ellipse cx="101" cy="83" rx="10" ry="4" transform="rotate(-28 101 83)"/><ellipse cx="111" cy="70" rx="9" ry="4" transform="rotate(32 111 70)"/>
        <ellipse cx="129" cy="111" rx="10" ry="4" transform="rotate(-31 129 111)"/><ellipse cx="141" cy="99" rx="11" ry="4" transform="rotate(28 141 99)"/><ellipse cx="130" cy="85" rx="10" ry="4" transform="rotate(-28 130 85)"/><ellipse cx="142" cy="70" rx="10" ry="4" transform="rotate(30 142 70)"/>
        <ellipse cx="159" cy="107" rx="10" ry="4" transform="rotate(-31 159 107)"/><ellipse cx="172" cy="96" rx="10" ry="4" transform="rotate(30 172 96)"/><ellipse cx="161" cy="82" rx="9" ry="4" transform="rotate(-28 161 82)"/>
      </g>
    </g>
    <g class="ww-bubbles" fill="var(--plant-oxygen)" fill-opacity=".66" stroke="var(--plant-oxygen)" stroke-width="1.2">
      <circle class="ww-bubble b1" cx="107" cy="88" r="3"/><circle class="ww-bubble b2" cx="138" cy="84" r="2.4"/><circle class="ww-bubble b3" cx="167" cy="90" r="3.4"/><circle class="ww-bubble b4" cx="122" cy="72" r="2"/><circle class="ww-bubble b5" cx="153" cy="68" r="2.7"/>
    </g>
    <path d="M64 46v88" stroke="var(--n0)" stroke-width="4" opacity=".28"/>
  </g>
</svg>`;

const WINDOW_PLANT_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="wp-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-room-hi)"/><stop offset=".55" stop-color="var(--plant-room-mid)"/><stop offset="1" stop-color="var(--plant-room-lo)"/></linearGradient>
    <linearGradient id="wp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--plant-sky-hi)"/><stop offset=".52" stop-color="var(--plant-sky-mid)"/><stop offset="1" stop-color="var(--plant-sky-lo)"/></linearGradient>
    <linearGradient id="wp-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--plant-wood-hi)"/><stop offset=".52" stop-color="var(--plant-wood)"/><stop offset="1" stop-color="var(--plant-wood-lo)"/></linearGradient>
    <radialGradient id="wp-pot" cx=".32" cy=".23" r=".88"><stop offset="0" stop-color="var(--plant-clay-hi)"/><stop offset=".52" stop-color="var(--plant-clay)"/><stop offset="1" stop-color="var(--plant-clay-lo)"/></radialGradient>
    <radialGradient id="wp-leaf" cx=".3" cy=".22" r=".9"><stop offset="0" stop-color="var(--plant-leaf-hi)"/><stop offset=".52" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></radialGradient>
    <linearGradient id="wp-ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-sun-hi)" stop-opacity=".82"/><stop offset=".55" stop-color="var(--plant-sun)" stop-opacity=".32"/><stop offset="1" stop-color="var(--plant-sun)" stop-opacity="0"/></linearGradient>
    <filter id="wp-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="2.2" stdDeviation="2.2" flood-color="var(--plant-shadow)" flood-opacity=".2"/></filter>
  </defs>
  <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#wp-bg)"/>
  <rect x="13" y="15" width="92" height="83" rx="5" fill="url(#wp-sky)" stroke="var(--plant-wood-lo)" stroke-width="3"/>
  <path d="M59 16V97M14 55H104" stroke="var(--n0)" stroke-width="3" opacity=".78"/><circle cx="34" cy="33" r="12" fill="var(--plant-sun)"/><circle cx="30" cy="29" r="4" fill="var(--plant-sun-hi)" opacity=".76"/>
  <path class="wp-rays" d="M16 17L121 123M55 16l92 108M95 17l73 107" stroke="url(#wp-ray)" stroke-width="13" opacity="0"/>
  <path d="M4 129H236V166H4Z" fill="url(#wp-floor)"/><path d="M4 129H236" stroke="var(--plant-wood-hi)" stroke-width="3" opacity=".72"/>
  <ellipse cx="73" cy="144" rx="39" ry="5" fill="var(--plant-shadow)" opacity=".13"/><ellipse cx="186" cy="144" rx="36" ry="5" fill="var(--plant-shadow)" opacity=".11"/>
  <g class="wp-plant wp-near" filter="url(#wp-shadow)">
    <path d="M47 105h48l-5 36H52Z" fill="url(#wp-pot)" stroke="var(--plant-clay-lo)" stroke-width="1.5"/><ellipse cx="71" cy="106" rx="25" ry="6" fill="var(--plant-soil)" stroke="var(--plant-clay-lo)" stroke-width="1.2"/>
    <g class="wp-growth"><path d="M71 105C68 88 74 68 70 48" stroke="var(--plant-stem)" stroke-width="3.4"/><path d="M70 84l-16-12M72 74l16-14M70 63l-12-11" stroke="var(--plant-stem)" stroke-width="2"/>
    <g fill="url(#wp-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.1"><ellipse cx="54" cy="70" rx="13" ry="6" transform="rotate(27 54 70)"/><ellipse cx="88" cy="58" rx="14" ry="6" transform="rotate(-29 88 58)"/><ellipse cx="58" cy="51" rx="12" ry="5.5" transform="rotate(25 58 51)"/><ellipse cx="72" cy="42" rx="10" ry="6" transform="rotate(-5 72 42)"/></g></g>
  </g>
  <g class="wp-plant wp-far" filter="url(#wp-shadow)">
    <path d="M164 105h45l-5 36h-35Z" fill="url(#wp-pot)" stroke="var(--plant-clay-lo)" stroke-width="1.5"/><ellipse cx="186" cy="106" rx="23" ry="5.5" fill="var(--plant-soil)" stroke="var(--plant-clay-lo)" stroke-width="1.2"/>
    <g class="wp-growth"><path d="M186 105C183 88 189 68 185 48" stroke="var(--plant-stem)" stroke-width="3.4"/><path d="M185 84l-16-12M187 74l16-14M185 63l-12-11" stroke="var(--plant-stem)" stroke-width="2"/>
    <g fill="url(#wp-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.1"><ellipse cx="169" cy="70" rx="13" ry="6" transform="rotate(27 169 70)"/><ellipse cx="203" cy="58" rx="14" ry="6" transform="rotate(-29 203 58)"/><ellipse cx="173" cy="51" rx="12" ry="5.5" transform="rotate(25 173 51)"/><ellipse cx="187" cy="42" rx="10" ry="6" transform="rotate(-5 187 42)"/></g></g>
  </g>
  <g opacity=".45"><path d="M117 29h102M117 38h82M117 47h94" stroke="var(--plant-wood)" stroke-width="2"/></g>
</svg>`;

const BEDROOM_PLANT_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="bp-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-room-hi)"/><stop offset=".55" stop-color="var(--plant-room-lo)"/><stop offset="1" stop-color="var(--plant-room-lo)"/></linearGradient>
    <linearGradient id="bp-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--plant-night-hi)"/><stop offset=".55" stop-color="var(--plant-night-mid)"/><stop offset="1" stop-color="var(--plant-night-lo)"/></linearGradient>
    <radialGradient id="bp-glow" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="var(--plant-sun-hi)" stop-opacity=".88"/><stop offset=".55" stop-color="var(--plant-sun)" stop-opacity=".35"/><stop offset="1" stop-color="var(--plant-sun)" stop-opacity="0"/></radialGradient>
    <linearGradient id="bp-bed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-fabric-hi)"/><stop offset=".5" stop-color="var(--plant-fabric)"/><stop offset="1" stop-color="var(--plant-fabric-lo)"/></linearGradient>
    <linearGradient id="bp-pot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-clay-hi)"/><stop offset=".52" stop-color="var(--plant-clay)"/><stop offset="1" stop-color="var(--plant-clay-lo)"/></linearGradient>
    <radialGradient id="bp-leaf" cx=".3" cy=".22" r=".88"><stop offset="0" stop-color="var(--plant-leaf-hi)"/><stop offset=".5" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></radialGradient>
    <filter id="bp-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="2.2" stdDeviation="2.3" flood-color="var(--plant-shadow-cool)" flood-opacity=".28"/></filter>
  </defs>
  <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#bp-bg)"/>
  <rect class="bp-dark" x="4" y="4" width="232" height="162" rx="16" fill="url(#bp-night)" opacity="0"/>
  <rect x="151" y="15" width="68" height="61" rx="5" fill="var(--plant-night-deep)" stroke="var(--n600)" stroke-width="3"/><path d="M185 16V75M152 45H218" stroke="var(--n500)" stroke-width="2"/>
  <path d="M194 25a13 13 0 1 0 13 18 15 15 0 0 1-13-18Z" fill="var(--plant-moon)"/><circle cx="166" cy="28" r="1.2" fill="var(--n25)"/><circle cx="208" cy="57" r="1" fill="var(--n25)"/>
  <ellipse class="bp-lamp-glow" cx="53" cy="77" rx="46" ry="55" fill="url(#bp-glow)"/>
  <g filter="url(#bp-shadow)"><path d="M33 61h38l-6 15H39Z" fill="var(--plant-wood-hi)" stroke="var(--plant-wood-lo)" stroke-width="1.3"/><path d="M52 61V40" stroke="var(--plant-wood-lo)" stroke-width="4"/><rect x="47" y="75" width="10" height="49" rx="4" fill="var(--plant-wood-lo)"/><ellipse cx="52" cy="124" rx="18" ry="5" fill="var(--plant-soil)"/></g>
  <g filter="url(#bp-shadow)"><path d="M8 112h105v38H8Z" fill="url(#bp-bed)" stroke="var(--plant-fabric-edge)" stroke-width="1.5"/><path d="M13 93h30q12 0 12 19H13Z" fill="var(--n25)" stroke="var(--plant-fabric-edge)" stroke-width="1.2"/><path d="M16 113c22 8 61 9 94 0" stroke="var(--n0)" stroke-width="3" opacity=".6"/><path d="M10 150v10M108 150v10" stroke="var(--plant-fabric-edge)" stroke-width="4"/></g>
  <ellipse cx="178" cy="150" rx="37" ry="5" fill="var(--plant-shadow-cool)" opacity=".18"/>
  <g class="bp-plant" filter="url(#bp-shadow)">
    <path d="M157 113h46l-5 35h-36Z" fill="url(#bp-pot)" stroke="var(--plant-clay-lo)" stroke-width="1.5"/><ellipse cx="180" cy="114" rx="24" ry="5.5" fill="var(--plant-soil-lo)"/>
    <path d="M180 113C177 91 183 73 179 53" stroke="var(--plant-stem)" stroke-width="3.4"/><path d="M180 93l-16-14M181 84l17-16M179 72l-13-11M180 63l13-10" stroke="var(--plant-stem)" stroke-width="2"/>
    <g fill="url(#bp-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.1"><ellipse cx="163" cy="78" rx="13" ry="6" transform="rotate(30 163 78)"/><ellipse cx="198" cy="67" rx="14" ry="6" transform="rotate(-30 198 67)"/><ellipse cx="166" cy="60" rx="12" ry="5.5" transform="rotate(26 166 60)"/><ellipse cx="194" cy="51" rx="11" ry="5" transform="rotate(-28 194 51)"/><ellipse cx="179" cy="45" rx="10" ry="6"/></g>
    <ellipse class="bp-pulse p1" cx="180" cy="78" rx="34" ry="25" stroke="var(--plant-vein)" stroke-width="1.6" opacity="0"/><ellipse class="bp-pulse p2" cx="180" cy="78" rx="34" ry="25" stroke="var(--plant-vein)" stroke-width="1.6" opacity="0"/>
  </g>
</svg>`;

const GERMINATING_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="gm-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-scene-hi)"/><stop offset=".55" stop-color="var(--plant-scene-mid)"/><stop offset="1" stop-color="var(--plant-scene-lo)"/></linearGradient>
    <linearGradient id="gm-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--n0)" stop-opacity=".78"/><stop offset=".55" stop-color="var(--plant-glass-hi)" stop-opacity=".24"/><stop offset="1" stop-color="var(--plant-glass-lo)" stop-opacity=".38"/></linearGradient>
    <linearGradient id="gm-cotton" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--n0)"/><stop offset=".52" stop-color="var(--plant-cotton)"/><stop offset="1" stop-color="var(--plant-cotton-lo)"/></linearGradient>
    <radialGradient id="gm-seed" cx=".3" cy=".22" r=".88"><stop offset="0" stop-color="var(--plant-seed-hi)"/><stop offset=".52" stop-color="var(--plant-seed)"/><stop offset="1" stop-color="var(--plant-seed-lo)"/></radialGradient>
    <linearGradient id="gm-root" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-root-hi)"/><stop offset=".52" stop-color="var(--plant-root)"/><stop offset="1" stop-color="var(--plant-root-lo)"/></linearGradient>
    <radialGradient id="gm-drop" cx=".35" cy=".25" r=".8"><stop offset="0" stop-color="var(--plant-water-hi)"/><stop offset=".52" stop-color="var(--plant-water-mid)"/><stop offset="1" stop-color="var(--plant-water-lo)"/></radialGradient>
    <filter id="gm-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="2.4" stdDeviation="2.4" flood-color="var(--plant-shadow)" flood-opacity=".22"/></filter>
  </defs>
  <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#gm-bg)"/>
  <ellipse cx="120" cy="150" rx="78" ry="7" fill="var(--plant-shadow)" opacity=".12"/>
  <g class="gm-drop" filter="url(#gm-shadow)"><path d="M55 15C65 29 69 34 69 42a14 14 0 0 1-28 0c0-8 4-13 14-27Z" fill="url(#gm-drop)" stroke="var(--plant-water-edge)" stroke-width="1.4"/><ellipse cx="50" cy="35" rx="5" ry="7" fill="var(--n0)" opacity=".52"/></g>
  <g filter="url(#gm-shadow)">
    <path d="M53 43h134l-8 98q-1 8-9 8H70q-8 0-9-8Z" fill="url(#gm-glass)" stroke="var(--plant-glass-edge)" stroke-width="2"/>
    <path d="M62 118c18-16 36-11 52-4 18-10 37-8 55 4l7 21H65Z" fill="url(#gm-cotton)" stroke="var(--plant-glass)" stroke-width="1.2"/>
    <path d="M67 125c12-7 24-4 33 2 12-8 28-7 38 0 13-8 24-6 34 1" stroke="var(--n0)" stroke-width="3" opacity=".82"/>
    <g class="gm-seed" transform="translate(120 100)">
      <path d="M-20-5C-14-22 9-24 20-10C27 3 17 17 0 19C-17 18-28 7-20-5Z" fill="url(#gm-seed)" stroke="var(--plant-seed-lo)" stroke-width="1.8"/>
      <path d="M-8-16C-1-9 2 1-1 15" stroke="var(--plant-seed-hi)" stroke-width="2.2" opacity=".7"/>
      <ellipse cx="-10" cy="-10" rx="7" ry="4" fill="var(--plant-seed-hi)" opacity=".42"/>
      <path class="gm-root" d="M-1 15C-2 29 8 35 1 48C-3 55-2 61 3 67" stroke="url(#gm-root)" stroke-width="3.3"/>
      <path class="gm-side-root r1" d="M3 41l12 7M0 52l-11 8" stroke="var(--plant-root)" stroke-width="1.8"/>
      <path class="gm-shoot" d="M1 13C2 0 10-10 11-25" stroke="var(--plant-stem-hi)" stroke-width="3.2"/>
      <path class="gm-cotyledon c1" d="M10-22C1-29-6-27-8-20c4 8 12 11 20 5Z" fill="var(--plant-seed)" stroke="var(--plant-wood-lo)" stroke-width="1.2"/>
      <path class="gm-cotyledon c2" d="M12-22c9-8 17-5 18 2-5 8-12 10-20 5Z" fill="var(--plant-seed)" stroke="var(--plant-wood-lo)" stroke-width="1.2"/>
    </g>
    <path d="M61 52v80" stroke="var(--n0)" stroke-width="4" opacity=".34"/>
  </g>
</svg>`;

const FRUIT_THINNING_SVG = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="ft-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-scene-hi)"/><stop offset=".55" stop-color="var(--plant-scene-mid)"/><stop offset="1" stop-color="var(--plant-scene-lo)"/></linearGradient>
    <linearGradient id="ft-branch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-wood)"/><stop offset=".52" stop-color="var(--plant-wood-lo)"/><stop offset="1" stop-color="var(--plant-wood-edge)"/></linearGradient>
    <radialGradient id="ft-leaf" cx=".3" cy=".22" r=".9"><stop offset="0" stop-color="var(--plant-leaf-hi)"/><stop offset=".52" stop-color="var(--plant-leaf)"/><stop offset="1" stop-color="var(--plant-leaf-lo)"/></radialGradient>
    <radialGradient id="ft-fruit" cx=".3" cy=".23" r=".88"><stop offset="0" stop-color="var(--plant-fruit-hi)"/><stop offset=".52" stop-color="var(--plant-fruit)"/><stop offset="1" stop-color="var(--plant-fruit-lo)"/></radialGradient>
    <radialGradient id="ft-sun" cx=".35" cy=".3" r=".78"><stop offset="0" stop-color="var(--plant-sun-hi)"/><stop offset=".52" stop-color="var(--plant-sun)"/><stop offset="1" stop-color="var(--plant-sun-lo)"/></radialGradient>
    <filter id="ft-shadow" x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="var(--plant-shadow)" flood-opacity=".23"/></filter>
  </defs>
  <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#ft-bg)"/>
  <circle cx="204" cy="29" r="17" fill="url(#ft-sun)"/><circle cx="199" cy="24" r="5" fill="var(--n0)" opacity=".55"/>
  <ellipse cx="120" cy="151" rx="92" ry="6" fill="var(--plant-shadow)" opacity=".1"/>
  <path d="M-7 128C47 117 84 77 119 80C160 84 190 54 246 48" stroke="url(#ft-branch)" stroke-width="15"/>
  <path d="M-5 123C47 112 82 73 119 76C159 80 190 51 245 45" stroke="var(--plant-wood-hi)" stroke-width="3.2" opacity=".43"/>
  <path d="M52 105L36 75M94 81L82 48M137 75l16-31M176 62l22-27" stroke="var(--plant-wood-lo)" stroke-width="5"/>
  <g fill="url(#ft-leaf)" stroke="var(--plant-leaf-lo)" stroke-width="1.2" filter="url(#ft-shadow)">
    <path d="M35 77C14 75 6 63 10 52c19-1 31 8 30 23Z"/><path d="M81 50C62 43 58 29 65 20c19 4 26 15 21 29Z"/><path d="M153 46c8-20 22-24 31-18-2 18-13 28-30 24Z"/><path d="M197 37c7-18 20-22 29-16-2 17-12 25-28 21Z"/><path d="M112 73c-15-15-12-29-2-35 16 10 19 23 9 36Z"/>
  </g>
  <g transform="translate(48 111)" filter="url(#ft-shadow)"><g class="ft-fruit ft-keep k1"><path d="M0-15v-8" stroke="var(--plant-wood-lo)" stroke-width="2.4"/><path d="M0-14C-13-21-21-8-17 5-14 18 0 22 0 22S14 18 17 5C21-8 13-21 0-14Z" fill="url(#ft-fruit)" stroke="var(--plant-fruit-lo)" stroke-width="1.5"/><ellipse cx="-6" cy="-7" rx="5" ry="8" fill="var(--plant-fruit-shine)" opacity=".5"/></g></g>
  <g transform="translate(82 105)" filter="url(#ft-shadow)"><g class="ft-fruit ft-remove r1"><path d="M0-12v-9" stroke="var(--plant-wood-lo)" stroke-width="2"/><path d="M0-12C-10-17-16-7-13 3-10 13 0 16 0 16S10 13 13 3C16-7 10-17 0-12Z" fill="url(#ft-fruit)" stroke="var(--plant-fruit-lo)" stroke-width="1.3"/><ellipse cx="-4" cy="-6" rx="4" ry="6" fill="var(--plant-fruit-shine)" opacity=".5"/></g></g>
  <g transform="translate(116 108)" filter="url(#ft-shadow)"><g class="ft-fruit ft-keep k2"><path d="M0-14v-11" stroke="var(--plant-wood-lo)" stroke-width="2.4"/><path d="M0-14C-12-20-20-8-16 5-13 17 0 21 0 21S13 17 16 5C20-8 12-20 0-14Z" fill="url(#ft-fruit)" stroke="var(--plant-fruit-lo)" stroke-width="1.5"/><ellipse cx="-5" cy="-7" rx="5" ry="8" fill="var(--plant-fruit-shine)" opacity=".5"/></g></g>
  <g transform="translate(150 91)" filter="url(#ft-shadow)"><g class="ft-fruit ft-remove r2"><path d="M0-12v-10" stroke="var(--plant-wood-lo)" stroke-width="2"/><path d="M0-12C-10-17-16-7-13 3-10 13 0 16 0 16S10 13 13 3C16-7 10-17 0-12Z" fill="url(#ft-fruit)" stroke="var(--plant-fruit-lo)" stroke-width="1.3"/><ellipse cx="-4" cy="-6" rx="4" ry="6" fill="var(--plant-fruit-shine)" opacity=".5"/></g></g>
  <g transform="translate(183 78)" filter="url(#ft-shadow)"><g class="ft-fruit ft-keep k3"><path d="M0-14v-11" stroke="var(--plant-wood-lo)" stroke-width="2.4"/><path d="M0-14C-12-20-20-8-16 5-13 17 0 21 0 21S13 17 16 5C20-8 12-20 0-14Z" fill="url(#ft-fruit)" stroke="var(--plant-fruit-lo)" stroke-width="1.5"/><ellipse cx="-5" cy="-7" rx="5" ry="8" fill="var(--plant-fruit-shine)" opacity=".5"/></g></g>
  <g transform="translate(213 66)" filter="url(#ft-shadow)"><g class="ft-fruit ft-remove r3"><path d="M0-11v-9" stroke="var(--plant-wood-lo)" stroke-width="2"/><path d="M0-11C-9-16-15-6-12 3-9 12 0 15 0 15S9 12 12 3C15-6 9-16 0-11Z" fill="url(#ft-fruit)" stroke="var(--plant-fruit-lo)" stroke-width="1.3"/><ellipse cx="-4" cy="-5" rx="4" ry="6" fill="var(--plant-fruit-shine)" opacity=".5"/></g></g>
  <g class="ft-flow" fill="var(--plant-glucose)" opacity="0"><circle cx="29" cy="84" r="3"/><circle cx="70" cy="84" r="3"/><circle cx="104" cy="79" r="3"/><circle cx="145" cy="70" r="3"/><circle cx="180" cy="56" r="3"/></g>
</svg>`;

export const renderPotMass: PlantHookRenderer = (scene, helper, s, finish, face) => {
  const { art, action, choices } = mountScene(scene, "hp-potmass", POT_MASS_SVG, "한 달 뒤 무게 재기");
  const life = hookLife(choices);
  helper.innerHTML = "작은 바질 화분을 한 달 동안 키웠어요. 흙의 높이는 거의 그대로인데 잎과 줄기는 훨씬 커졌어요. <b>한 달 뒤 무게</b>를 재 봐요!";
  face("curious");
  let done = false;
  life.listen(action, "click", () => {
    if (done) return;
    done = true;
    settleAction(action);
    art.classList.add("grown");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "식물의 무게는 늘었는데 화분 속 <b>흙 높이는 거의 같아요</b>. 식물이 양분을 만드는 재료는 주로 어디에서 왔을까요?";
    life.later(() => {
      face("curious");
      ask(choices, helper, {
        choices: options(s.choices, [
          "공기 중 이산화 탄소와 뿌리로 흡수한 물",
          "식물이 조금씩 먹어 없앤 흙",
          "식물의 몸으로 그대로 바뀐 빛",
        ]),
        good: "맞아요! 식물은 <b>이산화 탄소와 물</b>을 재료로 삼고 빛에너지를 이용해 양분을 만들어요. 흙의 무기 양분도 성장에 필요하지만, 흙 자체를 먹어 양분으로 만드는 것은 아니에요.",
        bad: "빛은 양분을 만드는 <b>에너지</b>이지 몸의 재료가 아니고, 식물이 흙 자체를 먹는 것도 아니에요. 광합성의 재료는 <b>공기 중 이산화 탄소와 뿌리로 흡수한 물</b>이에요.",
        onDone: finish,
      });
    }, 760);
  });
  return life.cleanup;
};
export const renderWaterweed: PlantHookRenderer = (scene, helper, s, finish, face) => {
  const { art, action, choices } = mountScene(scene, "hp-waterweed", WATERWEED_SVG, "수족관 조명 켜기");
  const life = hookLife(choices);
  helper.innerHTML = "창가 수족관의 <b>검정말</b>이에요. 아직 잎 주변에는 기포가 거의 없어요. 조명을 켜서 변화를 지켜봐요!";
  face("curious");
  let done = false;
  life.listen(action, "click", () => {
    if (done) return;
    done = true;
    settleAction(action);
    art.classList.add("lit");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "빛을 받은 검정말 잎에서 <b>기포가 연이어</b> 올라와요. 이 장면에서 광합성으로 늘어난 기체는 무엇일까요?";
    life.later(() => {
      face("curious");
      ask(choices, helper, {
        choices: options(s.choices, ["광합성으로 만들어진 산소", "검정말이 흡수하려는 이산화 탄소", "따뜻해진 물에서 생긴 수증기"]),
        good: "맞아요! 빛을 받은 검정말은 광합성을 하며 <b>산소</b>를 만들어요. 다음 실험에서는 기체 센서로 이 변화를 더 정확히 확인해요.",
        bad: "이산화 탄소는 광합성에 <b>사용되어 줄어드는 기체</b>예요. 빛을 받은 검정말 주변에서 광합성으로 늘어나는 기체는 <b>산소</b>랍니다.",
        onDone: finish,
      });
    }, 900);
  });
  return life.cleanup;
};

export const renderWindowPlant: PlantHookRenderer = (scene, helper, s, finish, face) => {
  const { art, action, choices } = mountScene(scene, "hp-windowplant", WINDOW_PLANT_SVG, "일주일 뒤 모습 보기");
  const life = hookLife(choices);
  helper.innerHTML = "같은 날 심고 물과 온도도 같게 맞춘 화분 두 개예요. 하나는 <b>창가</b>, 다른 하나는 <b>방 안쪽</b>에 두었어요. 일주일 뒤를 볼까요?";
  face("curious");
  let done = false;
  life.listen(action, "click", () => {
    if (done) return;
    done = true;
    settleAction(action);
    art.classList.add("observed");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "창가 화분은 잎이 더 풍성해졌고, 방 안쪽 화분은 덜 자랐어요. 이 차이를 만든 가장 알맞은 설명은 무엇일까요?";
    life.later(() => {
      face("curious");
      ask(choices, helper, {
        choices: options(s.choices, [
          "창가의 빛이 더 세어 광합성이 더 활발했어요",
          "창문 유리가 식물에게 양분을 주었어요",
          "방 안쪽 식물은 모든 생명 활동을 멈췄어요",
        ]),
        good: "맞아요! 다른 조건이 같다면 <b>빛의 세기</b> 차이가 광합성량을 바꾸고, 시간이 지나 성장 차이로 이어질 수 있어요.",
        bad: "창문 유리가 양분을 주는 것도 아니고, 어두운 곳에서도 식물의 생명 활동은 이어져요. 두 화분에서 달랐던 핵심 조건은 <b>빛의 세기</b>예요.",
        onDone: finish,
      });
    }, 780);
  });
  return life.cleanup;
};

export const renderBedroomPlant: PlantHookRenderer = (scene, helper, s, finish, face) => {
  const { art, action, choices } = mountScene(scene, "hp-bedroomplant", BEDROOM_PLANT_SVG, "불 끄고 밤의 화분 보기");
  const life = hookLife(choices);
  helper.innerHTML = "잠들기 전 침실이에요. 침대 옆 화분도 밤을 맞을 준비를 해요. 불을 끄면 식물의 생명활동도 모두 멈출까요?";
  face("curious");
  let done = false;
  life.listen(action, "click", () => {
    if (done) return;
    done = true;
    settleAction(action);
    art.classList.add("night");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "방은 어두워졌지만 식물은 살아 있고 세포도 계속 활동해요. 빛이 없는 밤에도 식물 세포는 양분에서 에너지를 얻을까요?";
    life.later(() => {
      face("curious");
      ask(choices, helper, {
        choices: options(s.choices, [
          "빛을 쓰는 양분 만들기는 멈추지만 산소를 써 에너지를 얻는 일은 계속돼요",
          "양분 만들기와 에너지 얻기가 모두 완전히 멈춰요",
          "식물이 산소를 모두 없애 침실을 위험하게 만들어요",
        ]),
        good: "맞아요! 빛이 없는 밤에도 식물 세포는 산소를 조금 사용해 양분에서 에너지를 얻어요. 이 과정을 <b>호흡</b>이라고 해요. 화분 한두 개가 사용하는 산소는 사람에게 위험할 정도가 아니에요.",
        bad: "식물이 밤에 침실의 산소를 모두 없애지는 않아요. 빛을 쓰는 양분 만들기는 멈추어도, 산소를 써 양분에서 에너지를 얻는 <b>호흡은 낮과 밤 모두 계속</b>돼요.",
        onDone: finish,
      });
    }, 820);
  });
  return life.cleanup;
};

export const renderGerminating: PlantHookRenderer = (scene, helper, s, finish, face) => {
  const { art, action, choices } = mountScene(scene, "hp-germinating", GERMINATING_SVG, "젖은 솜에서 하루 더 보기");
  const life = hookLife(choices);
  helper.innerHTML = "젖은 솜 위의 강낭콩이에요. 아직 초록 잎도, 흙도 없어요. 그런데 하루가 더 지나면 어떤 변화가 생길까요?";
  face("curious");
  let done = false;
  life.listen(action, "click", () => {
    if (done) return;
    done = true;
    settleAction(action);
    art.classList.add("sprouted");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "뿌리와 어린 싹이 자라기 시작했어요. 아직 펼쳐진 초록 잎이 없는데, 자라는 데 필요한 에너지는 어떻게 얻었을까요?";
    life.later(() => {
      face("curious");
      ask(choices, helper, {
        choices: options(s.choices, [
          "씨앗에 저장된 양분을 호흡에 사용했다",
          "잎이 없어도 광합성만으로 양분을 만들었다",
          "솜과 물을 그대로 에너지로 바꾸었다",
        ]),
        good: "맞아요! 잎이 펴지기 전 어린 싹은 <b>씨앗에 저장된 양분을 호흡에 사용</b>해 에너지를 얻어요. 잎이 자란 뒤에는 광합성으로 새 양분을 만들기 시작해요.",
        bad: "아직 펼쳐진 초록 잎이 없어 광합성으로 충분한 양분을 만들기 어려워요. 처음 자랄 때는 <b>씨앗 속 저장 양분을 호흡에 사용</b>해 에너지를 얻어요.",
        onDone: finish,
      });
    }, 940);
  });
  return life.cleanup;
};

export const renderFruitThinning: PlantHookRenderer = (scene, helper, s, finish, face) => {
  const { art, action, choices } = mountScene(scene, "hp-fruitthinning", FRUIT_THINNING_SVG, "작은 열매 세 개 솎아 보기");
  const life = hookLife(choices);
  helper.innerHTML = "사과 가지에 작은 열매가 빽빽하게 열렸어요. 농부는 아깝게도 일부 열매를 미리 떼어 내요. 세 개를 <b>솎아</b> 변화를 봐요!";
  face("curious");
  let done = false;
  life.listen(action, "click", () => {
    if (done) return;
    done = true;
    settleAction(action);
    art.classList.add("thinned");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "열매 수는 줄었지만 남은 열매가 더 크게 자랄 수 있어요. 열매 솎기가 이런 차이를 만드는 까닭은 무엇일까요?";
    life.later(() => {
      face("curious");
      ask(choices, helper, {
        choices: options(s.choices, [
          "잎에서 만든 양분을 받을 열매 수가 줄어 남은 열매에 더 많이 공급될 수 있다",
          "떼어 낸 열매의 양분이 공중을 날아 남은 열매로 들어간다",
          "열매를 떼는 순간 잎의 광합성량이 무조건 두 배가 된다",
        ]),
        good: "맞아요! 양분을 나누어 받을 열매가 줄면 열매 사이의 경쟁이 줄어 <b>남은 열매에 광합성산물이 더 많이 공급</b>될 수 있어요.",
        bad: "떼어 낸 열매의 양분이 되돌아오는 것도, 광합성량이 갑자기 두 배가 되는 것도 아니에요. <b>양분을 나누어 받을 열매 수가 줄어</b> 남은 열매에 더 많이 공급될 수 있어요.",
        onDone: finish,
      });
    }, 900);
  });
  return life.cleanup;
};
