// hookAnimal — 중2 Ⅵ 동물과 에너지 훅 12장면의 디스패처 + 앞쪽 6장면(L1~L6).
// 독립 스텝 타입 `animalHook` (과학 hook.ts 디스패치는 건드리지 않는다 — 병합 충돌 0).
//
// 장면 계약: (scene, helper, finish, face, choices?) — 공용 hookAsk.ask()만 쓴다.
//  · choices[0]이 항상 과학적으로 옳은 예측(화면에는 셔플되어 나온다)
//  · good·bad 문구는 반드시 다르게(bad는 고른 오개념을 짚고 옳은 방향을 준다)
//  · 예측은 채점하지 않는다 · 소재의 이름·설정은 도입(narrator/helper)에서 먼저 소개
//  · 조작 먼저 → 예측 나중(VII에서 확정된 훅 문법)
// SVG는 파운드리 재질 문법: 3스톱 그라데이션 면 + 좌상단 키라이트 + 접촉 그림자 + 재질별 최암색 외곽선.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { stickAvatar, setStickAvatar, type AvatarKind } from "../../ui/avatar";
import { SUBSTANCE, TISSUE, VESSEL } from "../../ui/animalKit";
import { ask } from "./hookAsk";
import type { StepAPI, StepRenderer, Step } from "../types";
import "../../styles/animal.css";

export type Face = (k: AvatarKind) => void;
export type AnimalSceneFn = (
  scene: HTMLElement,
  helper: HTMLElement,
  finish: () => void,
  face: Face,
  choices?: string[],
) => void;

// ── 공용 SVG 조각 ──────────────────────────────────────────────────────────
export const SH = (cx: number, cy: number, rx: number, o = 0.12): string =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#2A3A5E" opacity="${o}"/>`;

export const wrapSvg = (inner: string, defs = "", vb = "0 0 360 200"): string =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none"><defs>${defs}</defs>${inner}</svg>`;

/** 3스톱 세로 그라데이션 정의 — 재질 하나에 id 하나. */
export const lg3 = (id: string, hi: string, mid: string, lo: string): string =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient>`;

/** 구면(알갱이) 그라데이션 — 좌상단 키라이트. */
export const rg3 = (id: string, hi: string, mid: string, lo: string): string =>
  `<radialGradient id="${id}" cx=".34" cy=".3" r=".78"><stop offset="0" stop-color="${hi}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></radialGradient>`;

export const mkBtn = (label: string): HTMLButtonElement =>
  el("button", { class: "swapbtn an-pulse", attrs: { type: "button" } }, el("span", { text: label }));

// ── 타이머 수명 관리 ───────────────────────────────────────────────────────
// 장면은 window.setTimeout/setInterval을 직접 쓰지 않는다. 스텝을 떠난 뒤에도 콜백이 살아
// 떨어져 나간 DOM을 만지거나(맥박 인터벌) 다음 마운트에 끼어드는 것을 막는다.
interface AnLife { timeouts: Set<number>; intervals: Set<number> }
let LIFE: AnLife | null = null;

/** 장면 전용 setTimeout — 스텝 이탈 시 자동 취소된다. */
export function later(fn: () => void, ms: number): void {
  const life = LIFE;
  const id = window.setTimeout(() => {
    life?.timeouts.delete(id);
    if (life === LIFE) fn();
  }, ms);
  life?.timeouts.add(id);
}

/** 장면 전용 setInterval — stop()을 부르거나 스텝을 떠나면 멈춘다. */
export function every(fn: () => void, ms: number): { stop: () => void } {
  const life = LIFE;
  const id = window.setInterval(() => {
    if (life !== LIFE) {
      window.clearInterval(id);
      return;
    }
    fn();
  }, ms);
  life?.intervals.add(id);
  return {
    stop: () => {
      window.clearInterval(id);
      life?.intervals.delete(id);
    },
  };
}

/** 장면 표준 마운트 — 그림 → 조작 버튼 → 선택지 상자. */
export function mount(scene: HTMLElement, svg: string, label: string): {
  fig: HTMLElement;
  btn: HTMLButtonElement;
  box: HTMLElement;
} {
  const fig = el("div", {});
  fig.innerHTML = svg;
  const btn = mkBtn(label);
  const box = el("div", { class: "hook-choices" });
  scene.append(fig, btn, box);
  return { fig, btn, box };
}

/** 버튼 1회 소비 + 햅틱 — 모든 장면이 같은 리듬을 쓴다. */
export function once(btn: HTMLButtonElement, fn: () => void): void {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.classList.remove("an-pulse");
    haptic(HAPTIC.select);
    fn();
  });
}

const q = <T extends Element>(fig: HTMLElement, sel: string): T => fig.querySelector(sel) as T;
const show = (fig: HTMLElement, sel: string, v = "1"): void => {
  const node = q<SVGElement>(fig, sel);
  if (node) node.style.opacity = v;
};

/* ── 1. lunchtray — 급식판에서 반찬을 걷어내면? (L1 영양소) ───────────── */
export const renderLunchtray: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const dish = (x: number, y: number, rx: number, ry: number, fill: string, cls = ""): string =>
    `<g class="${cls}" style="transition:opacity .5s">
      <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#E9EEF5" stroke="#B8C4D2" stroke-width="1.4"/>
      <ellipse cx="${x}" cy="${y - 2}" rx="${rx - 7}" ry="${ry - 5}" fill="${fill}"/>
      <ellipse cx="${x - rx * 0.3}" cy="${y - ry * 0.5}" rx="${rx * 0.24}" ry="${ry * 0.22}" fill="#FFFFFF" opacity=".34"/>
    </g>`;
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#lt-bg)"/>
      ${SH(180, 178, 140, 0.13)}
      <rect x="26" y="42" width="308" height="128" rx="14" fill="url(#lt-tray)" stroke="#9FB0C2" stroke-width="1.8"/>
      <path d="M180 42 V170 M26 106 H180" stroke="#9FB0C2" stroke-width="1.4" opacity=".8"/>
      ${dish(103, 74, 56, 24, "url(#lt-rice)")}
      ${dish(103, 138, 56, 24, "url(#lt-soup)", "lt-go")}
      ${dish(232, 68, 42, 20, "url(#lt-meat)", "lt-go")}
      ${dish(310, 68, 30, 18, "url(#lt-veg)", "lt-go")}
      ${dish(232, 138, 42, 20, "url(#lt-fruit)", "lt-go")}
      ${dish(310, 138, 30, 18, "url(#lt-milk)", "lt-go")}`,
      `${lg3("lt-bg", "#FFF9F0", "#FBF0E2", "#F2E4D0")}
      ${lg3("lt-tray", "#F4F8FC", "#E6EDF5", "#D2DCE8")}
      ${rg3("lt-rice", "#FFFFFF", "#F5F2EA", "#DCD5C4")}
      ${rg3("lt-soup", "#FFD9A8", "#E8A24E", "#A66518")}
      ${rg3("lt-meat", "#E9A9A0", "#C46A60", "#7E332C")}
      ${rg3("lt-veg", "#B7E39A", "#63B04A", "#2C6B1E")}
      ${rg3("lt-fruit", "#FFC7A8", "#F0894E", "#A6491A")}
      ${rg3("lt-milk", "#FFFFFF", "#F0F4FA", "#CDD8E6")}`,
    ),
    "반찬을 다 치우고 밥만 남기기",
  );
  helper.innerHTML = "오늘 급식판이에요. 밥·국·고기·나물·과일·우유가 골고루 담겼어요. 그런데 <b>밥만 먹고 싶은 날</b>, 나머지를 다 치우면 어떻게 될까요?";

  once(btn, () => {
    fig.querySelectorAll<SVGGElement>(".lt-go").forEach((g, i) => {
      later(() => { g.style.opacity = "0"; }, 120 * i);
    });
    later(() => {
      face("surprised");
      helper.innerHTML = "이제 급식판에는 <b>밥 한 그릇</b>뿐이에요. 밥에 많이 든 영양소는 에너지원이 되는 <b>탄수화물</b>이고요.";
      later(() => {
        ask(box, helper, {
          choices: choices ?? [
            "몸을 만들고 몸의 상태를 조절하는 영양소가 부족해져요",
            "탄수화물이 에너지원이니까 밥만 먹어도 아무 문제 없어요",
            "밥에도 모든 영양소가 골고루 들어 있어서 괜찮아요",
          ],
          good: "맞아요! 영양소는 <b>에너지원</b> 말고도 <b>몸을 구성</b>하고 <b>생명활동을 조절</b>하는 일을 나눠 맡아요. 어떤 영양소가 어떤 일을 하는지, 이번 레슨에서 직접 식판을 채우며 알아봐요!",
          bad: "에너지는 채워지지만 그게 전부예요. 근육과 뼈를 <b>만드는</b> 영양소, 몸의 상태를 <b>조절하는</b> 영양소는 밥만으로는 채워지지 않아요. 영양소마다 맡은 일이 다르거든요 — 이번 레슨에서 확인해요!",
          onDone: finish,
        });
      }, 900);
    }, 900);
  });
};

/* ── 2. mysterytube — 라벨 없는 시험관 (L2 영양소 검출) ──────────────── */
export const renderMysterytube: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const tube = (x: number, label = "?"): string =>
    `<g transform="translate(${x} 0)">
      ${SH(0, 168, 15, 0.14)}
      <path d="M-13 44 h26 v96 a13 13 0 0 1 -26 0 Z" fill="url(#mt-glass)" stroke="#9AB2C4" stroke-width="1.6"/>
      <path d="M-11 96 h22 v44 a11 11 0 0 1 -22 0 Z" fill="url(#mt-liq)"/>
      <rect x="-14" y="40" width="28" height="7" rx="3.5" fill="#DCE6EF" stroke="#9AB2C4" stroke-width="1.2"/>
      <rect x="-13" y="60" width="26" height="16" rx="3" fill="#FFFFFF" stroke="#C6D2DE" stroke-width="1.2"/>
      <text x="0" y="72" text-anchor="middle" font-size="11" font-weight="900" fill="#8A97A6">${label}</text>
    </g>`;
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#mt-bg)"/>
      <rect x="26" y="150" width="308" height="26" rx="8" fill="url(#mt-rack)" stroke="#8B6A46" stroke-width="1.6"/>
      ${tube(80)}${tube(147)}${tube(214)}${tube(281)}
      <g class="mt-sniff" style="opacity:0;transition:opacity .5s">
        <path d="M300 44 q10 -14 20 -4 q10 -12 18 2" stroke="#9AA7B5" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M296 58 q12 -12 22 -2" stroke="#9AA7B5" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      </g>
      <text x="180" y="32" text-anchor="middle" font-size="13" font-weight="900" fill="#5C6E80">라벨이 떨어진 시험관 4개</text>`,
      `${lg3("mt-bg", "#F6F9FC", "#EDF2F8", "#DFE7F0")}
      ${lg3("mt-glass", "#FFFFFF", "#F2F7FB", "#DCE7F0")}
      ${lg3("mt-liq", "#F4F7FA", "#E4EBF2", "#CBD8E4")}
      ${lg3("mt-rack", "#E2C79E", "#C9A876", "#9A7A48")}`,
    ),
    "냄새 맡고 흔들어 보기",
  );
  helper.innerHTML = "실험실 시험관 네 개의 <b>라벨이 떨어졌어요</b>. 안에는 밥물·양파즙·달걀흰자액·식용유가 하나씩 들어 있는데, 겉보기로는 다 비슷해 보여요.";

  once(btn, () => {
    show(fig, ".mt-sniff");
    later(() => {
      face("curious");
      helper.innerHTML = "흔들어도, 냄새를 맡아도 잘 모르겠어요. 게다가 <b>실험실에서는 절대 맛을 보면 안 돼요</b>. 그럼 어떤 방법이 남았을까요?";
      later(() => {
        ask(box, helper, {
          choices: choices ?? [
            "특정 영양소를 만나면 색이 변하는 용액을 떨어뜨려 봐요",
            "시험관의 무게를 재서 무거운 쪽을 찾아요",
            "햇빛에 비춰 보고 투명한 정도로 구분해요",
          ],
          good: "정확해요! 영양소마다 <b>특정 시약과 만나면 색이 변하는</b> 성질이 있어요. 이번 레슨에서 시약 네 가지를 직접 떨어뜨려 정체를 밝혀 봐요!",
          bad: "무게나 투명한 정도는 양에 따라 달라져서 <b>무엇이 들었는지</b>는 알려 주지 못해요. 대신 영양소는 <b>특정 시약과 만나면 정해진 색</b>으로 변해요 — 그 색이 이름표가 되어 준답니다!",
          onDone: finish,
        });
      }, 1000);
    }, 800);
  });
};

/* ── 3. cellgate — 세포막 문 앞의 녹말과 포도당 (L3 소화) ────────────── */
export const renderCellgate: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const bead = (x: number, y: number, r: number, fill: string): string =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${SUBSTANCE.starch.lo}" stroke-width="1.4"/>`;
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#cg-bg)"/>
      <path d="M198 16 q22 26 0 52 q-22 26 0 52 q22 26 0 52 q-22 26 0 28" stroke="url(#cg-mem)" stroke-width="13" stroke-linecap="round" fill="none"/>
      <path d="M198 16 q22 26 0 52 q-22 26 0 52 q22 26 0 52 q-22 26 0 28" stroke="#FFFFFF" stroke-width="3" opacity=".35" fill="none"/>
      <text x="272" y="34" text-anchor="middle" font-size="12" font-weight="900" fill="#3F7C93">세포 안</text>
      <text x="104" y="34" text-anchor="middle" font-size="12" font-weight="900" fill="#8A6A2A">세포 밖</text>
      <g class="cg-glu" style="transition:transform .8s cubic-bezier(.22,1,.36,1)">
        ${bead(96, 148, 9, "url(#cg-sugar)")}
        ${bead(126, 156, 9, "url(#cg-sugar)")}
      </g>
      <g class="cg-starch" style="transition:transform .5s cubic-bezier(.34,1.35,.5,1)">
        <path d="M52 78 h96" stroke="${SUBSTANCE.starch.lo}" stroke-width="7" stroke-linecap="round"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => bead(52 + i * 19.2, 78 + (i % 2 ? 6 : -6), 10, "url(#cg-starch)")).join("")}
      </g>
      <g class="cg-bump" style="opacity:0;transition:opacity .3s">
        <path d="M176 62 l-10 -10 M176 78 l-12 0 M176 94 l-10 10" stroke="#E03A4B" stroke-width="3" stroke-linecap="round"/>
      </g>`,
      `${lg3("cg-bg", "#F6FAFC", "#EAF3F7", "#DCEAF0")}
      ${lg3("cg-mem", TISSUE.membrane.hi, TISSUE.membrane.mid, TISSUE.membrane.lo)}
      ${rg3("cg-starch", SUBSTANCE.starch.hi, SUBSTANCE.starch.mid, SUBSTANCE.starch.lo)}
      ${rg3("cg-sugar", SUBSTANCE.sugar.hi, SUBSTANCE.sugar.mid, SUBSTANCE.sugar.lo)}`,
    ),
    "둘 다 세포 안으로 밀어 넣기",
  );
  helper.innerHTML = "세포를 감싼 <b>세포막</b>이에요. 밖에는 알갱이가 길게 이어진 <b>녹말</b>과, 알갱이 하나짜리 <b>포도당</b>이 있어요. 둘 다 세포 안으로 밀어 넣어 볼까요?";

  once(btn, () => {
    const glu = q<SVGGElement>(fig, ".cg-glu");
    const starch = q<SVGGElement>(fig, ".cg-starch");
    glu.style.transform = "translateX(150px)";
    starch.style.transform = "translateX(58px)";
    later(() => {
      starch.style.transform = "translateX(34px)";
      show(fig, ".cg-bump");
      haptic(HAPTIC.wrong);
      face("surprised");
      helper.innerHTML = "포도당은 쏙 들어갔는데 <b>녹말은 막에 걸려 튕겨 나왔어요</b>. 녹말은 알갱이가 길게 이어져 있어 세포막을 통과하기엔 너무 크거든요.";
      later(() => {
        ask(box, helper, {
          choices: choices ?? [
            "녹말을 작은 조각으로 잘라 주면 통과할 수 있어요",
            "세포막의 구멍을 더 크게 넓히면 돼요",
            "녹말은 원래 세포 안으로 들어갈 필요가 없어요",
          ],
          good: "그거예요! 큰 영양소를 <b>세포막을 통과할 수 있는 작은 크기</b>로 잘라 주는 과정 — 그게 바로 <b>소화</b>예요. 우리 몸이 어떤 도구로 자르는지 이번 레슨에서 만나 봐요!",
          bad: "세포막의 크기는 우리가 늘릴 수 없고, 녹말은 <b>반드시</b> 세포 안으로 들어가야 에너지원이 돼요. 남은 방법은 하나 — 녹말을 <b>작게 자르는 것</b>! 그 과정을 소화라고 부른답니다.",
          onDone: finish,
        });
      }, 1100);
    }, 850);
  });
};

/* ── 4. pineapple — 파인애플에 재운 고기 (L4 소화효소) ───────────────── */
export const renderPineapple: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const plate = (x: number, cls: string): string =>
    `<g>
      ${SH(x, 160, 52, 0.14)}
      <ellipse cx="${x}" cy="152" rx="54" ry="16" fill="#EAF0F7" stroke="#B4C2D2" stroke-width="1.6"/>
      <g class="${cls}" style="transition:transform .7s var(--ease)">
        <path d="M${x - 34} 140 q6 -30 34 -30 q28 0 34 30 Z" fill="url(#pa-meat)" stroke="#7E332C" stroke-width="1.6"/>
        <path d="M${x - 20} 126 q14 -8 30 0" stroke="#FFFFFF" stroke-width="2" opacity=".4" stroke-linecap="round"/>
      </g>
    </g>`;
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#pa-bg)"/>
      ${plate(102, "pa-plain")}
      ${plate(258, "pa-soak")}
      <g class="pa-juice" style="opacity:.9">
        <path d="M214 118 q44 -12 88 0 q-6 22 -44 22 q-38 0 -44 -22 Z" fill="url(#pa-juice)" opacity=".55"/>
      </g>
      <text x="102" y="42" text-anchor="middle" font-size="12" font-weight="900" fill="#5C6E80">그냥 둔 고기</text>
      <text x="258" y="42" text-anchor="middle" font-size="12" font-weight="900" fill="#B57A1E">파인애플즙에 재운 고기</text>
      <g transform="translate(300 60)">
        <ellipse cx="0" cy="0" rx="17" ry="20" fill="url(#pa-fruit)" stroke="#9A7414" stroke-width="1.4"/>
        <path d="M0 -19 l-8 -16 M0 -19 l0 -19 M0 -19 l9 -15" stroke="#3D8A34" stroke-width="3" stroke-linecap="round"/>
        <path d="M-9 -8 l18 12 M-9 4 l18 -12" stroke="#B98A1C" stroke-width="1.2" opacity=".7"/>
      </g>`,
      `${lg3("pa-bg", "#FFFBF2", "#FBF3E4", "#F1E6D2")}
      ${lg3("pa-meat", "#E9A9A0", "#C46A60", "#7E332C")}
      ${lg3("pa-juice", "#FFF0B8", "#F5DC7C", "#C9A32A")}
      ${rg3("pa-fruit", "#FFE99A", "#E8BE41", "#9A7414")}`,
    ),
    "30분 뒤 젓가락으로 눌러 보기",
  );
  helper.innerHTML = "같은 고기 두 덩이예요. 오른쪽만 <b>파인애플즙</b>에 30분 재워 두었어요. 젓가락으로 눌러 보면 어떨까요?";

  once(btn, () => {
    const soak = q<SVGGElement>(fig, ".pa-soak");
    soak.style.transform = "translateY(9px) scaleY(.62)";
    later(() => {
      face("surprised");
      helper.innerHTML = "왼쪽은 그대로 탱탱한데 <b>파인애플즙에 재운 고기만 흐물흐물</b>해졌어요! 고기의 주된 영양소는 <b>단백질</b>이랍니다.";
      later(() => {
        ask(box, helper, {
          choices: choices ?? [
            "파인애플 속 어떤 물질이 단백질을 잘게 분해했어요",
            "파인애플즙이 고기에 스며들어 물러 보이는 거예요",
            "파인애플의 단맛이 고기의 짠맛을 덮어서 그래요",
          ],
          good: "맞아요! 파인애플에는 <b>단백질을 자르는 물질</b>이 들어 있어요. 우리 몸속에도 영양소를 자르는 전용 가위가 있는데, 그 이름이 <b>소화효소</b>예요 — 이번 레슨의 주인공이죠!",
          bad: "물이 스며들거나 맛이 섞이는 것만으로는 고기의 <b>질감 자체가 무너지지</b> 않아요. 파인애플에는 <b>단백질을 잘게 자르는 물질</b>이 들어 있거든요. 우리 몸속 같은 역할을 하는 것이 소화효소랍니다!",
          onDone: finish,
        });
      }, 1000);
    }, 850);
  });
};

/* ── 5. foldtowel — 평평한 천 vs 주름진 천 (L5 융털·표면적) ──────────── */
export const renderFoldtowel: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const zig = (x0: number, y: number, w: number, n: number, h: number): string => {
    let d = `M${x0} ${y}`;
    for (let i = 0; i < n; i++) {
      d += ` l${w / n / 2} ${-h} l${w / n / 2} ${h}`;
    }
    return d;
  };
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#ft-bg)"/>
      ${SH(102, 172, 44, 0.13)}${SH(258, 172, 44, 0.13)}
      <path d="M62 78 h80 v88 a6 6 0 0 1 -6 6 h-68 a6 6 0 0 1 -6 -6 Z" fill="url(#ft-cup)" stroke="#9AB2C4" stroke-width="1.6"/>
      <path d="M218 78 h80 v88 a6 6 0 0 1 -6 6 h-68 a6 6 0 0 1 -6 -6 Z" fill="url(#ft-cup)" stroke="#9AB2C4" stroke-width="1.6"/>
      <path d="M68 132 h68" stroke="url(#ft-cloth)" stroke-width="9" stroke-linecap="round"/>
      <path d="${zig(224, 132, 68, 6, 15)}" stroke="url(#ft-cloth)" stroke-width="7" stroke-linejoin="round" fill="none"/>
      <g class="ft-w1" style="opacity:0;transition:opacity .5s"><rect x="64" y="150" width="76" height="22" rx="4" fill="url(#ft-water)" opacity=".85"/></g>
      <g class="ft-w2" style="opacity:0;transition:opacity .5s"><rect x="220" y="112" width="76" height="60" rx="4" fill="url(#ft-water)" opacity=".85"/></g>
      <text x="102" y="60" text-anchor="middle" font-size="12" font-weight="900" fill="#5C6E80">평평한 천</text>
      <text x="258" y="60" text-anchor="middle" font-size="12" font-weight="900" fill="#2E7D96">주름진 천</text>
      <text x="180" y="34" text-anchor="middle" font-size="12.5" font-weight="900" fill="#5C6E80">천의 길이도, 컵의 크기도 똑같아요</text>`,
      `${lg3("ft-bg", "#F7FBFD", "#EDF5F9", "#DFEBF2")}
      ${lg3("ft-cup", "#FFFFFF", "#F1F6FA", "#DCE7EF")}
      ${lg3("ft-cloth", "#FFE0C8", "#E9A377", "#9A5A2E")}
      ${lg3("ft-water", SUBSTANCE.water.hi, SUBSTANCE.water.mid, SUBSTANCE.water.lo)}`,
    ),
    "두 컵에 물 붓기",
  );
  helper.innerHTML = "길이가 <b>완전히 똑같은</b> 천 두 장이에요. 왼쪽은 평평하게 펴서, 오른쪽은 주름을 접어서 같은 컵에 넣었어요. 물을 부으면 어느 쪽이 더 많이 빨아들일까요?";

  once(btn, () => {
    show(fig, ".ft-w1");
    show(fig, ".ft-w2");
    later(() => {
      face("surprised");
      helper.innerHTML = "주름진 천이 <b>훨씬 더 많은 물</b>을 머금었어요. 천의 길이는 똑같았는데 말이죠!";
      later(() => {
        ask(box, helper, {
          choices: choices ?? [
            "주름 덕분에 물에 닿는 표면이 훨씬 넓어졌기 때문이에요",
            "주름진 천이 더 무거워서 물을 끌어당겼기 때문이에요",
            "주름을 접으면 천의 재질 자체가 달라지기 때문이에요",
          ],
          good: "정확해요! 같은 양의 천이라도 <b>접으면 닿는 면이 넓어져요</b>. 우리 몸에도 이 방법을 극단까지 쓴 기관이 있어요 — 영양소를 흡수하는 <b>작은창자</b>예요. 이번 레슨에서 직접 접어 봐요!",
          bad: "무게나 재질은 그대로예요(같은 천이니까요!). 달라진 건 딱 하나, <b>물에 닿는 표면의 넓이</b>예요. 접을수록 넓어지죠. 우리 몸의 작은창자가 바로 이 전략을 쓴답니다!",
          onDone: finish,
        });
      }, 1000);
    }, 900);
  });
};

/* ── 6. pulsecheck — 제자리 뛰기 뒤 맥박 (L6 심장과 혈관) ────────────── */
export const renderPulsecheck: AnimalSceneFn = (scene, helper, finish, face, choices) => {
  const { fig, btn, box } = mount(
    scene,
    wrapSvg(
      `<rect x="8" y="10" width="344" height="180" rx="16" fill="url(#pc-bg)"/>
      ${SH(112, 168, 56, 0.13)}
      <g transform="translate(70 60)">
        <path d="M6 84 q-4 -46 30 -50 q34 4 30 50 Z" fill="url(#pc-arm)" stroke="#B07A56" stroke-width="1.6"/>
        <path d="M12 40 q24 -10 48 0" stroke="#C99070" stroke-width="2" opacity=".6" stroke-linecap="round"/>
        <path d="M22 34 q14 22 32 8" stroke="${VESSEL.poor.mid}" stroke-width="3.4" stroke-linecap="round" opacity=".75"/>
        <circle class="pc-finger" cx="34" cy="40" r="9" fill="url(#pc-arm)" stroke="#B07A56" stroke-width="1.6"/>
      </g>
      <g transform="translate(248 96)">
        <circle class="pc-heart" cx="0" cy="0" r="34" fill="url(#pc-heart)" stroke="${TISSUE.heart.lo}" stroke-width="2"/>
        <path d="M-13 -4 q0 -12 8 -12 q5 0 5 6 q0 -6 5 -6 q8 0 8 12 q0 12 -13 20 q-13 -8 -13 -20 Z" fill="#FFFFFF" opacity=".92"/>
      </g>
      <text x="248" y="52" text-anchor="middle" font-size="12" font-weight="900" fill="#5C6E80">1분 동안 뛴 횟수</text>
      <text class="pc-num" x="248" y="164" text-anchor="middle" font-size="20" font-weight="900" fill="${TISSUE.heart.lo}">72번</text>`,
      `${lg3("pc-bg", "#FFF7F8", "#FBEDEF", "#F3E0E4")}
      ${lg3("pc-arm", "#F7D9C2", "#E5B48F", "#B07A56")}
      ${rg3("pc-heart", TISSUE.heart.hi, TISSUE.heart.mid, TISSUE.heart.lo)}`,
    ),
    "제자리 뛰기 20번 하고 다시 재기",
  );
  helper.innerHTML = "손목에 손가락을 대면 <b>콩닥콩닥</b> 맥박이 느껴져요. 가만히 앉아 있을 때는 1분에 <b>72번</b>. 이제 제자리 뛰기를 20번 해 볼까요?";

  once(btn, () => {
    const heart = q<SVGCircleElement>(fig, ".pc-heart");
    const num = q<SVGTextElement>(fig, ".pc-num");
    let n = 72;
    let beat = false;
    heart.style.transition = "transform .12s var(--ease)";
    heart.style.transformOrigin = "248px 96px";
    const timer = every(() => {
      n += 7;
      beat = !beat;
      num.textContent = `${n}번`;
      heart.style.transform = beat ? "scale(1.1)" : "scale(1)";
      if (n >= 128) {
        timer.stop();
        heart.style.transform = "scale(1)";
        num.textContent = "128번";
        face("surprised");
        helper.innerHTML = "심장이 1분에 <b>128번</b>! 거의 두 배로 빨라졌어요. 몸은 왜 심장을 더 빨리 뛰게 만들었을까요?";
        later(() => {
          ask(box, helper, {
            choices: choices ?? [
              "다리 근육에 산소와 영양소를 더 빨리 보내야 하기 때문이에요",
              "몸이 뜨거워지면 심장도 따라 흥분해서 빨라지는 거예요",
              "숨이 차니까 심장이 허파 대신 일을 해 주는 거예요",
            ],
            good: "정확해요! 열심히 일하는 근육에는 <b>산소와 영양소</b>가 더 많이 필요해요. 그걸 온몸으로 실어 나르는 펌프가 <b>심장</b>이고요. 이번 레슨에서 심장 속을 들여다봐요!",
            bad: "체온이나 숨이 원인이 아니에요. 다리 근육이 갑자기 일을 많이 하니 <b>산소와 영양소가 더 빨리, 더 많이</b> 배달돼야 하거든요. 그 배달 펌프가 바로 심장이랍니다!",
            onDone: finish,
          });
        }, 1000);
      }
    }, 170);
  });
};

// ── 디스패처 ──────────────────────────────────────────────────────────────
interface AnimalHookStep {
  title: string;
  lead?: string;
  narrator: string;
  done?: string;
  scene: string;
  choices?: string[];
  cta?: string;
}

/** 장면 레지스트리 — hookAnimal2.ts가 import 시점에 자기 장면을 등록한다(순환 참조 회피). */
export const ANIMAL_SCENES: Record<string, AnimalSceneFn> = {
  lunchtray: renderLunchtray,
  mysterytube: renderMysterytube,
  cellgate: renderCellgate,
  pineapple: renderPineapple,
  foldtowel: renderFoldtowel,
  pulsecheck: renderPulsecheck,
};

export function registerAnimalScenes(more: Record<string, AnimalSceneFn>): void {
  Object.assign(ANIMAL_SCENES, more);
}

export const animalHook: StepRenderer = (host: HTMLElement, step: Step, api: StepAPI) => {
  const s = step as unknown as AnimalHookStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const bubble = el("div", { class: "comic-bubble", html: s.narrator });
  const avatar = stickAvatar("smile");
  const face: Face = (kind) => setStickAvatar(avatar, kind);
  host.appendChild(el("div", { class: "comic-narrator" }, el("div", { class: "comic-avatar" }, avatar), bubble));

  const scene = el("div", { class: "hook-scene anhk" });
  const helper = el("div", { class: "helper", attrs: { role: "status", "aria-live": "polite" } });
  host.append(scene, helper);

  // 이 마운트의 타이머 수명. later()/every()가 여기에 등록되고, cleanup이 전부 취소한다.
  const life: AnLife = { timeouts: new Set(), intervals: new Set() };
  LIFE = life;

  function finish(): void {
    if (LIFE !== life) return;
    if (s.done) bubble.innerHTML = s.done;
    api.enableCTA(s.cta ?? "실험실 열기");
    later(() => face("smile"), 900);
  }

  const fn = ANIMAL_SCENES[s.scene];
  if (fn) fn(scene, helper, finish, face, s.choices);
  else {
    helper.textContent = "장면을 준비하고 있어요.";
    api.enableCTA(s.cta ?? "계속하기");
  }

  api.setCTA(s.cta ?? "실험실 열기", { enabled: false });
  return () => {
    life.timeouts.forEach((id) => window.clearTimeout(id));
    life.intervals.forEach((id) => window.clearInterval(id));
    life.timeouts.clear();
    life.intervals.clear();
    if (LIFE === life) LIFE = null;
  };
};
