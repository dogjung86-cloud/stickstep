// hookBio2 — 중1 Ⅱ. 생물의 구성과 다양성(재제작) 훅 10종.
// 규격은 steps/hookBody.ts를 그대로 계승한다: hookLife(타이머·리스너 일괄 해제)·mountScene·
// settleAction·options 헬퍼 + (scene, helper, step, finish, face) => cleanup 시그니처.
// 예측은 공용 hookAsk.ask()만 쓴다(로컬 ask 복제 금지 — CLAUDE.md '훅 예측 규칙').
// 장면 문법: 조작 1개 → 장면 변화 → (필요하면) 예측.
// SVG는 240×170, 파운드리 재질 문법(근-동조 3스톱 면·좌상단 키라이트·바닥 접촉 그림자·
// 재질별 최암색 1.4~1.6px 외곽선). 스틱맨만 손그림 라인. 텍스트는 12px 이상.
// 상태·모션·배치는 styles/bio3-hook.css(.hb2- 접두사)가 맡는다.

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

function mountArt(scene: HTMLElement, className: string, svgArt: string): HTMLElement {
  const art = el("div", { class: `hk-bio2 ${className}`, html: svgArt });
  scene.appendChild(art);
  return art;
}

function actionBtn(label: string): HTMLButtonElement {
  return el(
    "button",
    { class: "swapbtn pulse hb2-action", attrs: { type: "button", "aria-label": label } },
    el("span", { text: label }),
  ) as HTMLButtonElement;
}

function mountScene(scene: HTMLElement, className: string, svgArt: string, actionLabel: string): {
  art: HTMLElement;
  action: HTMLButtonElement;
  choices: HTMLElement;
} {
  const art = mountArt(scene, className, svgArt);
  const action = actionBtn(actionLabel);
  const choices = el("div", { class: "hook-choices hb2-choices" });
  scene.append(action, choices);
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

/** 버튼 라벨 교체(단계마다 안내가 달라지는 장면용) */
function relabel(action: HTMLButtonElement, label: string): void {
  action.setAttribute("aria-label", label);
  const span = action.querySelector("span");
  if (span) span.textContent = label;
}

// ── 공용 재질 정의 ───────────────────────────────────────────
// 근-동조 3스톱(밝은 톤 → 본색 → 어두운 톤)만 쓴다. 외곽선은 각 재질의 최암색.
const GLASS_LO = "#9DBBD4";
const METAL_LO = "#7E8B9C";
const WOOD_LO = "#9C7A48";
const LEAF_LO = "#0B7E5D";
const NUC_LO = "#3B4CA8";
const ICE_LO = "#6E9CC4";
const CLAY_LO = "#A55A3C";
const INK = "#26364A";

const DEFS = `<linearGradient id="hb2-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF"/><stop offset=".54" stop-color="#F1FBF7"/><stop offset="1" stop-color="#DFF3EA"/></linearGradient>
<linearGradient id="hb2-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF" stop-opacity=".96"/><stop offset=".55" stop-color="#E2F0FA" stop-opacity=".66"/><stop offset="1" stop-color="#C3DCEE" stop-opacity=".46"/></linearGradient>
<linearGradient id="hb2-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F6F8FB"/><stop offset=".52" stop-color="#D7DFE9"/><stop offset="1" stop-color="#A8B4C3"/></linearGradient>
<linearGradient id="hb2-wood" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#F0DAB6"/><stop offset=".52" stop-color="#DCBF8F"/><stop offset="1" stop-color="#BE9A66"/></linearGradient>
<linearGradient id="hb2-leaf" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#B5F0DA"/><stop offset=".54" stop-color="#46D2A8"/><stop offset="1" stop-color="#109B73"/></linearGradient>
<linearGradient id="hb2-nuc" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#DAE1FF"/><stop offset=".52" stop-color="#8E9DF1"/><stop offset="1" stop-color="#5567CE"/></linearGradient>
<linearGradient id="hb2-water" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#E8F5FF"/><stop offset=".5" stop-color="#B7DDF6"/><stop offset="1" stop-color="#88C0E6"/></linearGradient>
<filter id="hb2-drop" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="2.2" stdDeviation="2.2" flood-color="#2A3A5E" flood-opacity=".2"/></filter>`;

/** 바닥 접촉 그림자 — 파운드리 규칙(#2A3A5E, opacity .10~.12) */
function contact(cx: number, cy: number, rx: number, ry = 5): string {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2A3A5E" opacity=".11"/>`;
}

function svgOpen(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs>${DEFS}`;
}

// ── 공용 러너 1: 조작 1번 → 변화(여러 단계) → 예측 ───────────
interface Phase { cls: string; at: number; note: string }

function runHook(
  scene: HTMLElement,
  helper: HTMLElement,
  step: HookData,
  finish: Finish,
  face: Face,
  config: {
    className: string; svg: string; action: string; intro: string; changed: string; state: string;
    phases?: Phase[]; wait?: number; choices: string[]; good: string; bad: string;
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
    (config.phases ?? []).forEach((phase) => {
      life.later(() => {
        art.classList.add(phase.cls);
        helper.innerHTML = phase.note;
        haptic(HAPTIC.tap);
      }, phase.at);
    });
    life.later(() => {
      face("curious");
      ask(choices, helper, {
        choices: options(step.choices, config.choices),
        good: config.good,
        bad: config.bad,
        onDone: finish,
      });
    }, config.wait ?? 900);
  });
  return life.cleanup;
}

// ── 공용 러너 2: 같은 버튼을 여러 번 → 단계별 변화 → 예측(또는 관찰 종료) ──
interface Stage { cls: string; note: string; label?: string }

function runSteps(
  scene: HTMLElement,
  helper: HTMLElement,
  step: HookData,
  finish: Finish,
  face: Face,
  config: {
    className: string; svg: string; action: string; intro: string; stages: Stage[];
    wait?: number; choices?: string[]; good?: string; bad?: string; outro?: string;
  },
): () => void {
  const { art, action, choices } = mountScene(scene, config.className, config.svg, config.action);
  const life = hookLife(choices);
  helper.innerHTML = config.intro;
  face("curious");
  let at = 0;
  life.listen(action, "click", () => {
    if (at >= config.stages.length) return;
    const stage = config.stages[at];
    at += 1;
    art.classList.add(stage.cls);
    helper.innerHTML = stage.note;
    haptic(HAPTIC.select);
    face(at === config.stages.length ? "surprised" : "curious");
    if (at < config.stages.length) {
      if (stage.label) relabel(action, stage.label);
      return;
    }
    settleAction(action);
    life.later(() => {
      face("curious");
      if (config.choices && config.good && config.bad) {
        ask(choices, helper, {
          choices: options(step.choices, config.choices),
          good: config.good,
          bad: config.bad,
          onDone: finish,
        });
        return;
      }
      if (config.outro) helper.innerHTML = config.outro;
      finish();
    }, config.wait ?? 900);
  });
  return life.cleanup;
}

// ── L2 celldot — 양파 껍질을 현미경으로 3단 확대 ─────────────
function cellDotSvg(): string {
  const cx = 138;
  const cy = 94;
  const bw = 22;
  const bh = 15;
  const bricks: string[] = [];
  const dots: string[] = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 5; c++) {
      const x = cx - 55 + c * bw + (r % 2 ? -bw / 2 : 0);
      const y = cy - 52.5 + r * bh;
      bricks.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw - 2}" height="${bh - 2}" rx="3.5" fill="url(#hb2-leaf)" opacity=".62" stroke="${LEAF_LO}" stroke-width="1.4"/>`,
      );
      dots.push(
        `<circle cx="${(x + bw * 0.58).toFixed(1)}" cy="${(y + bh * 0.5).toFixed(1)}" r="3.2" fill="url(#hb2-nuc)" stroke="${NUC_LO}" stroke-width="1"/>`,
      );
    }
  }
  const tags = ["맨눈", "40배", "100배", "400배"]
    .map((t, i) => `<text class="hb2-cd-t${i}" x="205" y="30" text-anchor="middle" font-size="12" font-weight="900" fill="#4E5968">${t}</text>`)
    .join("");
  return `${svgOpen()}<clipPath id="hb2-cd-clip"><circle cx="${cx}" cy="${cy}" r="52"/></clipPath>
<radialGradient id="hb2-cd-field" cx=".32" cy=".26" r=".92"><stop stop-color="#FFFFFF"/><stop offset=".6" stop-color="#FBF4EA"/><stop offset="1" stop-color="#EFE1CE"/></radialGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
<g filter="url(#hb2-drop)"><rect x="14" y="22" width="74" height="34" rx="6" fill="url(#hb2-glass)" stroke="${GLASS_LO}" stroke-width="1.5"/>
<path d="M25 32h38a6 6 0 0 1 0 14H25a6 6 0 0 1 0-14Z" fill="url(#hb2-leaf)" opacity=".8" stroke="${LEAF_LO}" stroke-width="1.4"/>
<path d="M22 28c11-3 25-3 34 0" stroke="#FFFFFF" stroke-width="2.4" opacity=".6"/></g>
${contact(51, 60, 35, 4.5)}
<text x="51" y="76" text-anchor="middle" font-size="12" font-weight="850" fill="#4E5968">양파 껍질</text>
<g filter="url(#hb2-drop)"><circle cx="${cx}" cy="${cy}" r="57" fill="url(#hb2-metal)" stroke="${METAL_LO}" stroke-width="1.6"/>
<circle cx="${cx}" cy="${cy}" r="52" fill="url(#hb2-cd-field)" stroke="#C9B79E" stroke-width="1.4"/></g>
<g clip-path="url(#hb2-cd-clip)"><g class="hb2-cd-skin" stroke="#D9C6AC" stroke-width="2.6" opacity=".9"><path d="M88 70c22 10 46 10 70-2"/><path d="M86 92c24 12 50 10 72-4"/><path d="M90 114c22 10 46 8 68-6"/></g>
<g class="hb2-cd-bricks">${bricks.join("")}<g class="hb2-cd-dots">${dots.join("")}</g></g></g>
<circle cx="118" cy="70" r="17" fill="#FFFFFF" opacity=".2"/>
${contact(cx, 156, 52)}${tags}</svg>`;
}

export const renderCellDot: BodyHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "hb2-celldot", svg: cellDotSvg(), action: "확대", state: "z1", wait: 1780,
  phases: [
    { cls: "z2", at: 560, note: "더 확대했어요. 칸들이 <b>벽돌담</b>처럼 줄지어 있어요!" },
    { cls: "z3", at: 1120, note: "아주 크게 보니 칸마다 <b>작고 둥근 점</b>이 하나씩 들어 있어요. 이 점은 무엇일까요?" },
  ],
  intro: "양파 껍질을 아주 얇게 벗겨 <b>받침 유리</b>에 올렸어요. 맨눈으로는 그냥 얇은 막인데, 확대하면 무엇이 보일까요?",
  changed: "칸 같은 무늬가 드러났어요. 조금 더 확대해 볼까요?",
  choices: [
    "세포의 생명활동을 조절하는 부분이에요",
    "세포가 밖에서 빨아들인 물방울이에요",
    "확대할 때 유리에 묻은 얼룩이에요",
  ],
  good: "맞아요! 이 둥근 점은 <b>핵</b>이에요. 유전물질이 들어 있어 세포의 생명활동을 조절하지요.",
  bad: "물방울이나 얼룩이라면 칸마다 하나씩, 같은 자리에 있을 리 없어요. 이 점은 <b>세포의 생명활동을 조절하는 부분</b>이랍니다.",
});

// ── L3 slidepress — 덮개 유리를 덮는 두 가지 방법 ────────────
function slidePressSvg(): string {
  return `${svgOpen()}</defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
<path d="M4 140h232v26H4Z" fill="url(#hb2-wood)"/><path d="M4 140h232" stroke="${WOOD_LO}" stroke-width="1.5"/>
${contact(120, 140, 84, 6)}
<g class="hb2-sp-slide" filter="url(#hb2-drop)"><rect x="28" y="118" width="184" height="11" rx="3.5" fill="url(#hb2-glass)" stroke="${GLASS_LO}" stroke-width="1.5"/>
<path d="M36 121h44" stroke="#FFFFFF" stroke-width="2.4" opacity=".7"/></g>
<path class="hb2-sp-water" d="M86 118q34-19 68 0Z" fill="url(#hb2-water)" stroke="#7FB6DC" stroke-width="1.4"/>
<g class="hb2-sp-air"><circle cx="102" cy="112" r="5.4" fill="#FFFFFF" opacity=".92" stroke="#7FB6DC" stroke-width="1.4"/><circle cx="121" cy="109" r="6.4" fill="#FFFFFF" opacity=".92" stroke="#7FB6DC" stroke-width="1.4"/><circle cx="139" cy="112" r="4.8" fill="#FFFFFF" opacity=".92" stroke="#7FB6DC" stroke-width="1.4"/></g>
<g class="hb2-sp-cover"><rect x="88" y="42" width="66" height="8" rx="2.6" fill="url(#hb2-glass)" stroke="${GLASS_LO}" stroke-width="1.5"/><path d="M93 44h22" stroke="#FFFFFF" stroke-width="2.2" opacity=".75"/></g>
<text x="121" y="30" text-anchor="middle" font-size="12" font-weight="850" fill="#4E5968">덮개 유리</text>
<text x="212" y="152" text-anchor="end" font-size="12" font-weight="850" fill="#4E5968">받침 유리</text>
<g class="hb2-sp-tag"><rect x="14" y="60" width="92" height="26" rx="13" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.4"/>
<text class="hb2-sp-ok" x="60" y="77" text-anchor="middle" font-size="12" font-weight="900" fill="#0B7E5D">공기방울 없음</text>
<text class="hb2-sp-no" x="60" y="77" text-anchor="middle" font-size="12" font-weight="900" fill="#C2255C">공기방울 갇힘</text></g></svg>`;
}

export const renderSlidePress: BodyHookRenderer = (scene, helper, _step, finish, face) => {
  const art = mountArt(scene, "hb2-slidepress", slidePressSvg());
  const row = el("div", { class: "hb2-btnrow" });
  const tiltBtn = actionBtn("비스듬히 덮기");
  const dropBtn = actionBtn("그냥 내려놓기");
  const choices = el("div", { class: "hook-choices hb2-choices" });
  row.append(tiltBtn, dropBtn);
  scene.append(row, choices);
  const life = hookLife(choices);
  helper.innerHTML =
    "<b>받침 유리</b> 위 물방울에 <b>덮개 유리</b>를 덮어요. 두 가지 방법을 <b>모두</b> 해 보고 차이를 찾아봐요!";
  face("curious");

  const tried = new Set<string>();
  let ended = false;
  const play = (kind: "tilt" | "drop"): void => {
    art.classList.remove("tilted", "dropped");
    void art.offsetWidth; // 다시 눌러도 처음부터 재생되게 리플로우로 애니메이션 리셋
    art.classList.add(kind === "tilt" ? "tilted" : "dropped");
    haptic(HAPTIC.select);
    tried.add(kind);
    face(kind === "drop" ? "surprised" : "curious");
    helper.innerHTML = kind === "tilt"
      ? "한쪽 끝을 먼저 대고 <b>천천히</b> 내리니 공기가 옆으로 밀려나요. 유리 사이가 물로만 채워졌어요!"
      : "그냥 <b>수평으로 툭</b> 내려놓으니 공기가 빠져나가지 못했어요. 동그란 <b>공기방울</b>이 갇혔어요!";
    if (tried.size < 2 || ended) return;
    ended = true;
    life.later(() => {
      tiltBtn.disabled = true;
      dropBtn.disabled = true;
      tiltBtn.classList.remove("pulse");
      dropBtn.classList.remove("pulse");
      face("smile");
      helper.innerHTML =
        "같은 물방울인데 덮는 방법만 달랐어요. 공기방울은 세포를 가려서 관찰을 방해해요. 이제 <b>현미경 표본</b>을 직접 만들어 봐요!";
      finish();
    }, 1150);
  };
  life.listen(tiltBtn, "click", () => play("tilt"));
  life.listen(dropBtn, "click", () => play("drop"));
  return life.cleanup;
};

// ── L4 signalrun — 압정을 밟는 순간 발에서 뇌까지 ────────────
function signalRunSvg(): string {
  return `${svgOpen()}<linearGradient id="hb2-spark" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#FFD666"/><stop offset=".5" stop-color="#FFB020"/><stop offset="1" stop-color="#E8590C"/></linearGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
<path d="M4 142h232v24H4Z" fill="url(#hb2-wood)"/><path d="M4 142h232" stroke="${WOOD_LO}" stroke-width="1.5"/>
${contact(146, 143, 46, 5)}
<g class="hb2-sr-tack" filter="url(#hb2-drop)"><path d="M126 142l4-14" stroke="${METAL_LO}" stroke-width="3"/><ellipse cx="130" cy="126" rx="11" ry="5" fill="url(#hb2-metal)" stroke="${METAL_LO}" stroke-width="1.5"/><ellipse cx="127" cy="124.5" rx="4" ry="1.6" fill="#FFFFFF" opacity=".8"/></g>
<text x="130" y="160" text-anchor="middle" font-size="12" font-weight="850" fill="#4E5968">압정</text>
<g class="hb2-sr-stick" stroke="${INK}" stroke-width="3.2" fill="none">
<circle cx="152" cy="38" r="13" fill="#FFFFFF"/><path d="M147 36h.4M157 36h.4" stroke-width="3.4"/><path d="M147 44q5 4 10 0"/>
<path d="M152 51v36"/><path d="M152 60l-18 12M152 60l19 10"/><path d="M152 87l-22 55M152 87l19 55"/></g>
<path class="hb2-sr-signal" d="M130 140l-4-34 26-19v-38" stroke="url(#hb2-spark)" stroke-width="5.5" stroke-dasharray="120" stroke-dashoffset="120"/>
<g class="hb2-sr-bang"><rect x="176" y="16" width="46" height="26" rx="13" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.4"/><path d="M180 34l-6 8 9-3Z" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.4"/><text x="199" y="34" text-anchor="middle" font-size="13" font-weight="900" fill="#E8590C">앗!</text></g>
<g class="hb2-sr-fast"><rect x="14" y="112" width="98" height="26" rx="13" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.4"/><text x="63" y="129" text-anchor="middle" font-size="12" font-weight="900" fill="#0B7E5D">눈 깜짝할 사이</text></g></svg>`;
}

export const renderSignalRun: BodyHookRenderer = (scene, helper, step, finish, face) => runHook(scene, helper, step, finish, face, {
  className: "hb2-signalrun", svg: signalRunSvg(), action: "발을 밟다", state: "stepped", wait: 1500,
  phases: [{ cls: "yelled", at: 780, note: "발끝에서 머리까지 신호가 <b>순식간에</b> 올라갔어요. 이렇게 빨리 신호를 보내려면 세포가 어떤 모양이어야 할까요?" }],
  intro: "바닥에 떨어진 <b>압정</b>을 그만 밟았어요. 발끝에서 머리까지는 꽤 먼데, 아픔은 언제 느껴질까요?",
  changed: "밟자마자 발끝에서 <b>번쩍</b> 신호가 출발해요!",
  choices: [
    "가늘고 길어서 멀리까지 이어져야 해요",
    "동그랗고 통통해서 잘 굴러가야 해요",
    "납작하고 넓어서 빈틈없이 붙어 있어야 해요",
  ],
  good: "맞아요! 신호를 멀리 전하는 세포는 <b>가늘고 길게 뻗어</b> 있어요. 하는 일에 알맞은 모양을 갖춘 거예요.",
  bad: "굴러가거나 넓게 덮는 모양은 신호를 <b>멀리 이어 보내기</b>에는 알맞지 않아요. 그런 세포는 가늘고 길게 뻗어 있어야 해요.",
});

// ── L5 blockflower — 블록으로 한 단계씩 꽃 만들기 ────────────
function blockFlowerSvg(): string {
  const block = (x: number, y: number, w: number, h: number, g: string, lo: string, rot = 0): string =>
    `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#${g})" stroke="${lo}" stroke-width="1.5"/><path d="M${x + 3} ${y + 3.5}h${Math.max(4, w - 12)}" stroke="#FFFFFF" stroke-width="2" opacity=".65"/></g>`;
  // 꽃 중심 y. 화분 테두리(y 106~119)보다 충분히 위에 두고, 그 사이를 줄기가 잇는다
  // — 꽃이 화분 위에 '심긴' 것으로 읽혀야 한다(실사용 피드백 2026-07-26: 꽃이 테두리에 겹쳐 있었다).
  const FLOWER_CY = 58;
  const petal = (a: number): string => {
    const rad = (a * Math.PI) / 180;
    const px = 120 + Math.cos(rad) * 22 - 10;
    const py = FLOWER_CY + Math.sin(rad) * 22 - 8;
    return block(px, py, 20, 16, "hb2-bf-pink", "#C2255C", a + 90);
  };
  const scatter = [
    block(30, 40, 22, 17, "hb2-bf-pink", "#C2255C", -14),
    block(66, 26, 22, 17, "hb2-bf-pink", "#C2255C", 12),
    block(150, 32, 22, 17, "hb2-bf-pink", "#C2255C", 22),
    block(190, 52, 22, 17, "hb2-bf-sun", "#B58309", -8),
    block(40, 96, 24, 16, "hb2-leaf", LEAF_LO, 8),
    block(178, 104, 24, 16, "hb2-leaf", LEAF_LO, -16),
  ].join("");
  const parts = [
    block(52, 54, 22, 17, "hb2-bf-pink", "#C2255C", -8),
    block(76, 50, 22, 17, "hb2-bf-pink", "#C2255C", 6),
    block(100, 54, 22, 17, "hb2-bf-pink", "#C2255C", -4),
    block(150, 52, 16, 40, "hb2-leaf", LEAF_LO, 0),
    block(174, 66, 26, 15, "hb2-leaf", LEAF_LO, 14),
  ].join("");
  // 줄기는 꽃 아래(74)에서 화분 테두리 속(120)까지 — 화분이 뒤에 그려져 줄기 끝을 덮으므로 '심긴' 모양이 된다.
  const flower = `<g>${[0, 72, 144, 216, 288].map(petal).join("")}
${block(112, 74, 16, 46, "hb2-leaf", LEAF_LO, 0)}${block(130, 90, 26, 14, "hb2-leaf", LEAF_LO, 16)}
<circle cx="120" cy="${FLOWER_CY}" r="12" fill="url(#hb2-bf-sun)" stroke="#B58309" stroke-width="1.5"/><circle cx="116" cy="${FLOWER_CY - 4}" r="4" fill="#FFFFFF" opacity=".6"/></g>`;
  const tags = ["조각", "부품", "꽃", "화분 식물"]
    .map((t, i) => `<text class="hb2-bf-t${i}" x="120" y="162" text-anchor="middle" font-size="12" font-weight="900" fill="#4E5968">${t}</text>`)
    .join("");
  return `${svgOpen()}<linearGradient id="hb2-bf-pink" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFD6E6"/><stop offset=".54" stop-color="#F783AC"/><stop offset="1" stop-color="#D6336C"/></linearGradient>
<linearGradient id="hb2-bf-sun" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFEEB5"/><stop offset=".54" stop-color="#FFC93C"/><stop offset="1" stop-color="#D9A106"/></linearGradient>
<linearGradient id="hb2-bf-pot" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F5C4A8"/><stop offset=".52" stop-color="#DE8A62"/><stop offset="1" stop-color="#B85C38"/></linearGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
${contact(120, 148, 74, 6)}
<g class="hb2-bf-l1">${scatter}</g>
<g class="hb2-bf-l2">${parts}</g>
<g class="hb2-bf-l3">${flower}</g>
<g class="hb2-bf-l4" filter="url(#hb2-drop)"><path d="M92 116h56l-7 30H99Z" fill="url(#hb2-bf-pot)" stroke="${CLAY_LO}" stroke-width="1.5"/><rect x="88" y="106" width="64" height="13" rx="4" fill="url(#hb2-bf-pot)" stroke="${CLAY_LO}" stroke-width="1.5"/><path d="M95 110h20" stroke="#FFFFFF" stroke-width="2.2" opacity=".55"/></g>
${tags}</svg>`;
}

export const renderBlockFlower: BodyHookRenderer = (scene, helper, step, finish, face) => runSteps(scene, helper, step, finish, face, {
  className: "hb2-blockflower", svg: blockFlowerSvg(), action: "조립하기", wait: 950,
  intro: "블록 <b>조각</b>이 흩어져 있어요. 조립 버튼을 눌러 한 단계씩 꽃을 만들어 봐요!",
  stages: [
    { cls: "s1", note: "같은 조각끼리 모이니 <b>부품</b>이 됐어요. 꽃잎 뭉치와 줄기예요!", label: "조립하기" },
    { cls: "s2", note: "부품을 이어 붙이니 드디어 <b>꽃 한 송이</b>가 됐어요!", label: "조립하기" },
    { cls: "s3", note: "꽃을 화분에 심으니 하나의 <b>화분 식물</b>이 완성! 생물의 몸도 이렇게 단계를 거쳐 이루어질까요?" },
  ],
  choices: [
    "작은 단위가 모여 점점 큰 단계를 이뤄요",
    "몸은 처음부터 통째로 하나여서 단계가 없어요",
    "큰 몸이 잘게 쪼개지면서 작은 단위가 생겨요",
  ],
  good: "맞아요! 생물의 몸도 <b>작은 단위가 모여 점점 큰 단계</b>를 이루며 만들어져요. 그 단계 이름을 곧 만나요.",
  bad: "몸은 통째로 하나이거나 큰 것이 쪼개져 생기는 게 아니에요. <b>작은 단위가 모여 점점 큰 단계</b>를 이루는 순서랍니다.",
});

// ── L6 biomedoor — 전시관 문 세 개를 차례로 열기 ─────────────
function biomeDoorSvg(): string {
  const xs = [14, 88, 162];
  const clips = xs
    .map((x, i) => `<clipPath id="hb2-bd-c${i}"><rect x="${x}" y="26" width="58" height="96" rx="4"/></clipPath>`)
    .join("");
  // 열대 = 큰부리새. 사막(선인장)·극지(펭귄)처럼 **실루엣만으로 정체가 읽혀야** 한다
  // (실사용 피드백 2026-07-26: 구판은 몸통 타원 + 노란 얼룩이라 무슨 생물인지 알 수 없었다).
  // 큰 부리가 이 새의 식별 기호이므로 머리보다 크게 그리고, 잎은 네 귀퉁이로 밀어 새를 가리지 않게 한다.
  const tropic = `<rect x="14" y="26" width="58" height="96" fill="url(#hb2-bd-tropic)"/>
<path d="M14 32q19-7 27 7-17 0-27 9Z" fill="url(#hb2-leaf)" stroke="${LEAF_LO}" stroke-width="1.3"/>
<path d="M72 42q-21 1-24 17 16-7 24-5Z" fill="url(#hb2-leaf)" stroke="${LEAF_LO}" stroke-width="1.3"/>
<path d="M14 114q17-13 30-5-17 4-25 13Z" fill="url(#hb2-leaf)" stroke="${LEAF_LO}" stroke-width="1.3"/>
<path d="M17 99h42" stroke="#8A6A3C" stroke-width="3.4" stroke-linecap="round"/>
<g><path d="M33 93l-9 7 4-12Z" fill="#22374F"/>
<ellipse cx="40" cy="83" rx="11" ry="13" fill="url(#hb2-bd-peng)" stroke="#22374F" stroke-width="1.3"/>
<ellipse cx="41" cy="87" rx="6" ry="8" fill="#FFE9A8"/>
<circle cx="41" cy="66" r="8.5" fill="url(#hb2-bd-peng)" stroke="#22374F" stroke-width="1.3"/>
<path d="M48 60q17 3 18 8-10 6-19 1Z" fill="url(#hb2-bd-bird)" stroke="#B3400B" stroke-width="1.3"/>
<circle cx="44" cy="63" r="2.7" fill="#FFFFFF"/><circle cx="44.7" cy="63" r="1.2" fill="#22374F"/>
<path d="M37 95v4M44 95v4" stroke="#F59F00" stroke-width="2.4" stroke-linecap="round"/></g>`;
  const desert = `<rect x="88" y="26" width="58" height="96" fill="url(#hb2-bd-sand)"/>
<circle cx="132" cy="44" r="11" fill="#FFE08C" opacity=".85"/>
<g><rect x="106" y="56" width="16" height="52" rx="8" fill="url(#hb2-leaf)" stroke="${LEAF_LO}" stroke-width="1.5"/>
<path d="M106 78h-9v-12" stroke="${LEAF_LO}" stroke-width="7" stroke-linecap="round"/><path d="M106 78h-9v-12" stroke="#46D2A8" stroke-width="4" stroke-linecap="round"/>
<path d="M122 88h8V74" stroke="${LEAF_LO}" stroke-width="7" stroke-linecap="round"/><path d="M122 88h8V74" stroke="#46D2A8" stroke-width="4" stroke-linecap="round"/></g>
<g><path d="M96 112q7-6 13 0 5-5 9 1" stroke="#9C7A48" stroke-width="4.5" fill="none"/><path d="M118 113l8 4" stroke="#9C7A48" stroke-width="3"/><circle cx="97" cy="110" r="1.8" fill="#FFFFFF"/></g>
${contact(114, 110, 22, 4)}`;
  const polar = `<rect x="162" y="26" width="58" height="96" fill="url(#hb2-bd-ice)"/>
<path d="M162 94h58v28h-58Z" fill="#F2FAFF" stroke="${ICE_LO}" stroke-width="1.4"/>
<path d="M166 94l14-26 14 26Z" fill="#DCEEFB" stroke="${ICE_LO}" stroke-width="1.4"/>
<path d="M196 94l12-20 12 20Z" fill="#E9F5FE" stroke="${ICE_LO}" stroke-width="1.4"/>
<g><ellipse cx="192" cy="86" rx="12" ry="17" fill="url(#hb2-bd-peng)" stroke="#243B57" stroke-width="1.4"/>
<ellipse cx="192" cy="90" rx="7" ry="12" fill="#FFFFFF"/><circle cx="192" cy="68" r="9" fill="url(#hb2-bd-peng)" stroke="#243B57" stroke-width="1.4"/>
<circle cx="189" cy="66" r="2" fill="#FFFFFF"/><path d="M192 70l7 3-7 3Z" fill="#F59F00" stroke="#B37300" stroke-width="1"/>
<path d="M186 102l-6 4M198 102l6 4" stroke="#F59F00" stroke-width="3"/></g>`;
  const arts = [tropic, desert, polar];
  const doors = xs
    .map((x, i) => `<g class="hb2-bd-d${i}"><g clip-path="url(#hb2-bd-c${i})">${arts[i]}</g>
<rect x="${x - 4}" y="22" width="66" height="104" rx="7" fill="none" stroke="${WOOD_LO}" stroke-width="3.5"/>
<g class="hb2-bd-panel"><rect x="${x}" y="26" width="58" height="96" rx="4" fill="url(#hb2-wood)" stroke="${WOOD_LO}" stroke-width="1.5"/>
<rect x="${x + 8}" y="36" width="42" height="34" rx="4" fill="none" stroke="${WOOD_LO}" stroke-width="1.5" opacity=".7"/>
<path d="M${x + 6} 30h20" stroke="#FFFFFF" stroke-width="2.2" opacity=".55"/>
<circle cx="${x + 48}" cy="80" r="4.2" fill="url(#hb2-metal)" stroke="${METAL_LO}" stroke-width="1.4"/></g></g>`)
    .join("");
  const labels = ["열대", "사막", "극지"]
    .map((t, i) => `<text x="${xs[i] + 29}" y="146" text-anchor="middle" font-size="12" font-weight="900" fill="#4E5968">${t}</text>`)
    .join("");
  return `${svgOpen()}${clips}
<linearGradient id="hb2-bd-tropic" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3FA37A"/><stop offset=".54" stop-color="#1C7A55"/><stop offset="1" stop-color="#0C5138"/></linearGradient>
<linearGradient id="hb2-bd-sand" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FBE7C2"/><stop offset=".54" stop-color="#EFCE95"/><stop offset="1" stop-color="#D9AC63"/></linearGradient>
<linearGradient id="hb2-bd-ice" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#EAF6FF"/><stop offset=".52" stop-color="#C6E2F5"/><stop offset="1" stop-color="#9CC5E4"/></linearGradient>
<linearGradient id="hb2-bd-bird" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFC9A3"/><stop offset=".52" stop-color="#F76707"/><stop offset="1" stop-color="#C4400A"/></linearGradient>
<linearGradient id="hb2-bd-peng" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6C8299"/><stop offset=".52" stop-color="#3C5570"/><stop offset="1" stop-color="#22374F"/></linearGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
${contact(120, 130, 100, 6)}${doors}${labels}</svg>`;
}

export const renderBiomeDoor: BodyHookRenderer = (scene, helper, step, finish, face) => runSteps(scene, helper, step, finish, face, {
  className: "hb2-biomedoor", svg: biomeDoorSvg(), action: "문 열기", wait: 980,
  intro: "생물 전시관에 문이 셋 있어요. <b>열대·사막·극지</b>의 문이지요. 하나씩 열어 봐요!",
  stages: [
    { cls: "o1", note: "열대의 문이 열렸어요. 넓은 잎 사이로 <b>화려한 새</b>가 보여요!", label: "다음 문 열기" },
    { cls: "o2", note: "사막의 문이에요. 물을 머금은 <b>선인장</b>과 <b>도마뱀</b>이 있어요. 열대와 완전히 다르네요!", label: "다음 문 열기" },
    { cls: "o3", note: "마지막은 극지예요. 얼음 위에 <b>펭귄</b>이 서 있어요. 세 곳에 사는 생물의 종류는 같을까요?" },
  ],
  choices: [
    "환경이 다르면 사는 생물의 종류도 달라요",
    "지구 어디든 사는 생물의 종류는 거의 같아요",
    "더운 곳일수록 사는 생물의 종류가 적어져요",
  ],
  good: "맞아요! <b>환경이 다르면 그곳에 사는 생물의 종류도 달라져요</b>. 그래서 지구 전체의 생물은 훨씬 다양해지지요.",
  bad: "세 문 안의 생물은 서로 완전히 달랐어요. 더운 곳이라고 생물이 적지도 않고요. <b>환경이 다르면 사는 생물의 종류도 달라진답니다</b>.",
});

// ── L7 beakpick — 부리 모양 3종이 자기 먹이로 날아가 집는다 ───
// 도구 그림은 '부리 모양'의 비유다(집게 모양 = 굵고 튼튼한 부리, 핀셋 모양 = 가늘고 뾰족한 부리,
// 숟가락 모양 = 넓적하고 오목한 부리). 문구는 전부 "~ 모양의 부리"로 읽히게 쓴다.
// 연출: 대기 위치(무대 위) → 정답 먹이 카드로 이동 → 내려가 쪼기 → 먹이가 딸려 오르며 결과 라벨.
// 카드를 먼저, 부리를 나중에 그린다 — 부리가 카드 안으로 내려가므로 카드 위에 있어야 한다.
function beakPickSvg(): string {
  const cardX = [16, 88, 160];
  const names = ["큰 씨앗", "틈 속 애벌레", "작은 알갱이"];
  // 카드마다 '움직이지 않는 배경(props)'과 '집히면 딸려 올라오는 먹이(foods)'를 나눈다 —
  // 둘째 칸에서 나무 틈까지 통째로 떠오르면 "애벌레를 꺼냈다"로 읽히지 않는다.
  const props = [
    "",
    // 틈은 카드 한가운데(x+32)에 둔다 — 핀셋 모양 부리의 두 끝이 모이는 자리와 정확히 맞춘다.
    `<rect x="${cardX[1] + 8}" y="82" width="48" height="32" rx="5" fill="url(#hb2-wood)" stroke="${WOOD_LO}" stroke-width="1.5"/><path d="M${cardX[1] + 32} 82v32" stroke="#7A5A32" stroke-width="6"/>`,
    "",
  ];
  const foods = [
    `<ellipse cx="${cardX[0] + 32}" cy="98" rx="17" ry="12" fill="url(#hb2-bp-seed)" stroke="#8A5A2B" stroke-width="1.5"/><path d="M${cardX[0] + 22} 93q10-6 20 0" stroke="#8A5A2B" stroke-width="1.4" opacity=".7"/><ellipse cx="${cardX[0] + 26}" cy="93" rx="5" ry="3" fill="#FFFFFF" opacity=".45"/>`,
    // 애벌레는 마디 원 3개로 그린다 — 곧은 세로선은 바운딩 박스 폭이 0이라 그라데이션이 아예 칠해지지 않는다.
    `<circle cx="${cardX[1] + 31}" cy="101" r="2.8" fill="url(#hb2-leaf)" stroke="${LEAF_LO}" stroke-width="1.2"/>
<circle cx="${cardX[1] + 33}" cy="95" r="3.2" fill="url(#hb2-leaf)" stroke="${LEAF_LO}" stroke-width="1.2"/>
<circle cx="${cardX[1] + 32}" cy="88.5" r="3.6" fill="url(#hb2-leaf)" stroke="${LEAF_LO}" stroke-width="1.2"/>
<circle cx="${cardX[1] + 30.6}" cy="87.4" r="1.1" fill="#0B4E3A"/>`,
    // 알갱이 무더기의 무게중심도 카드 한가운데(x+32) — 숟가락 모양 부리가 그대로 퍼 올린다.
    [
      [19, 94], [29, 90], [39, 95], [23, 103], [35, 103], [45, 98], [28, 110], [40, 111],
    ]
      .map(([dx, dy]) => `<circle cx="${cardX[2] + dx}" cy="${dy}" r="4.2" fill="url(#hb2-bp-grain)" stroke="#B08A55" stroke-width="1.2"/>`)
      .join(""),
  ];
  // 집힌 순간의 반짝임 — 4각 글린트 3개(카드 안쪽에만 놓는다)
  const glint = (gx: number, gy: number, r: number): string => {
    const k = r * 0.18;
    const n = (v: number): string => v.toFixed(1);
    return `<path d="M${n(gx)} ${n(gy - r)}Q${n(gx + k)} ${n(gy - k)} ${n(gx + r)} ${n(gy)}Q${n(gx + k)} ${n(gy + k)} ${n(gx)} ${n(gy + r)}Q${n(gx - k)} ${n(gy + k)} ${n(gx - r)} ${n(gy)}Q${n(gx - k)} ${n(gy - k)} ${n(gx)} ${n(gy - r)}Z" fill="url(#hb2-bp-glint)" stroke="#E0A100" stroke-width=".9"/>`;
  };
  const cards = cardX
    .map((x, i) => `<g><rect x="${x}" y="72" width="64" height="50" rx="9" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.5"/>${props[i]}
<g class="hb2-bp-food hb2-bp-f${i}">${foods[i]}</g>
<g class="hb2-bp-spark hb2-bp-k${i}">${glint(x + 11, 85, 4.6)}${glint(x + 53, 91, 3.8)}${glint(x + 33, 77, 3.2)}</g></g>
<text x="${x + 32}" y="136" text-anchor="middle" font-size="12" font-weight="850" fill="#4E5968">${names[i]}</text>
<text class="hb2-bp-res hb2-bp-r${i}" x="${x + 32}" y="156" text-anchor="middle" font-size="12" font-weight="900" fill="#9AA3AD"> </text>`)
    .join("");
  const tools = `<g class="hb2-bp-tool hb2-bp-clip"><path d="M104 16v22q0 10 12 14M136 16v22q0 10-12 14" stroke="url(#hb2-bp-steel)" stroke-width="7"/><path d="M104 16v22q0 10 12 14M136 16v22q0 10-12 14" stroke="${METAL_LO}" stroke-width="1.4" fill="none" opacity=".55"/></g>
<g class="hb2-bp-tool hb2-bp-tweez"><path d="M112 16l7 36 1 6M128 16l-7 36-1 6" stroke="url(#hb2-bp-steel)" stroke-width="4"/></g>
<g class="hb2-bp-tool hb2-bp-spoon"><rect x="117" y="14" width="6" height="26" rx="3" fill="url(#hb2-bp-steel)" stroke="${METAL_LO}" stroke-width="1.2"/><path d="M106 44q14-14 28 0-6 16-14 16t-14-16Z" fill="url(#hb2-bp-steel)" stroke="${METAL_LO}" stroke-width="1.4"/><ellipse cx="114" cy="46" rx="5" ry="2.6" fill="#FFFFFF" opacity=".6"/></g>`;
  return `${svgOpen()}<linearGradient id="hb2-bp-steel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F8FAFC"/><stop offset=".5" stop-color="#CFD8E3"/><stop offset="1" stop-color="#96A3B4"/></linearGradient>
<linearGradient id="hb2-bp-seed" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F2D2A8"/><stop offset=".52" stop-color="#C9884A"/><stop offset="1" stop-color="#9A5F2B"/></linearGradient>
<radialGradient id="hb2-bp-grain" cx=".32" cy=".28" r=".9"><stop stop-color="#FCEBCB"/><stop offset=".55" stop-color="#EBC98F"/><stop offset="1" stop-color="#C79E5C"/></radialGradient>
<radialGradient id="hb2-bp-glint" cx=".36" cy=".3" r=".86"><stop stop-color="#FFFBEA"/><stop offset=".52" stop-color="#FFD666"/><stop offset="1" stop-color="#F0A81E"/></radialGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
<g><rect x="7" y="7" width="62" height="18" rx="9" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.4"/>
<text x="38" y="20" text-anchor="middle" font-size="12" font-weight="900" fill="#4E5968">부리 모양</text></g>
${cards}<g class="hb2-bp-arm">${tools}</g></svg>`;
}

/** 이동 연출을 끄는 환경 — 결과만 즉시 보여 준다(CLAUDE.md 모션 격상 ④) */
const BP_REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Beak { key: string; name: string; ok: number; aim: string; note: string }

const BEAKS: Beak[] = [
  {
    key: "clip", name: "집게 모양", ok: 0,
    aim: "<b>집게 모양의 부리</b>가 <b>큰 씨앗</b> 쪽으로 날아가요!",
    note: "<b>집게 모양의 부리</b>는 굵고 튼튼해서 <b>큰 씨앗</b>을 꽉 잡았어요. 좁은 틈에는 들어가지 못하고, 작은 알갱이는 자꾸 놓쳐요.",
  },
  {
    key: "tweez", name: "핀셋 모양", ok: 1,
    aim: "<b>핀셋 모양의 부리</b>가 <b>틈 속 애벌레</b> 쪽으로 날아가요!",
    note: "<b>핀셋 모양의 부리</b>는 가늘고 뾰족해서 <b>틈 속 애벌레</b>를 쏙 꺼냈어요. 큰 씨앗은 미끄러지고, 작은 알갱이는 하나씩밖에 못 집어요.",
  },
  {
    key: "spoon", name: "숟가락 모양", ok: 2,
    aim: "<b>숟가락 모양의 부리</b>가 <b>작은 알갱이</b> 쪽으로 날아가요!",
    note: "<b>숟가락 모양의 부리</b>는 넓적하고 오목해서 <b>작은 알갱이</b>를 한 번에 퍼 담았어요. 큰 씨앗은 굴러 떨어지고, 좁은 틈에는 들어가지 않아요.",
  },
];

export const renderBeakPick: BodyHookRenderer = (scene, helper, step, finish, face) => {
  const art = mountArt(scene, "hb2-beakpick", beakPickSvg());
  const row = el("div", { class: "hb2-chiprow" });
  const chips = BEAKS.map((beak) =>
    el("button", { class: "hb2-chip", text: beak.name, attrs: { type: "button", "aria-pressed": "false" } }) as HTMLButtonElement,
  );
  row.append(...chips);
  const action = actionBtn("집어 보기");
  const choices = el("div", { class: "hook-choices hb2-choices" });
  scene.append(row, action, choices);
  const life = hookLife(choices);
  helper.innerHTML =
    "부리 모양은 <b>집게 모양·핀셋 모양·숟가락 모양</b> 셋, 먹이는 <b>큰 씨앗·틈 속 애벌레·작은 알갱이</b> 셋이에요. 부리 모양을 하나 골라 집어 봐요!";
  face("curious");

  const results = [0, 1, 2].map((i) => art.querySelector(`.hb2-bp-r${i}`));
  const foodEls = [0, 1, 2].map((i) => art.querySelector(`.hb2-bp-f${i}`));
  const sparkEls = [0, 1, 2].map((i) => art.querySelector(`.hb2-bp-k${i}`));
  const AIMS = ["aim0", "aim1", "aim2"];
  const beat = (ms: number): number => (BP_REDUCED ? 0 : ms); // 이동 연출을 끄면 결과만 즉시
  const tried = new Set<string>();
  let picked = 0;
  let ended = false;
  let busy = false; // 이동 중에는 부리를 바꾸지 못하게(날아가는 중에 모양이 바뀌면 읽히지 않는다)
  const select = (idx: number): void => {
    picked = idx;
    chips.forEach((chip, i) => {
      chip.classList.toggle("on", i === idx);
      chip.setAttribute("aria-pressed", String(i === idx));
    });
    // 고른 부리 모양이 무대 위에 바로 보이게(무엇을 집을지 예상하며 누르도록)
    art.classList.remove("t-clip", "t-tweez", "t-spoon");
    art.classList.add(`t-${BEAKS[idx].key}`);
    haptic(HAPTIC.tap);
  };
  select(0);

  life.listen(action, "click", () => {
    if (ended || busy) return;
    busy = true;
    action.disabled = true;
    const beak = BEAKS[picked];
    // ① 대기 위치로 즉시 되돌린 뒤(warp = 전환 끄기) 정답 먹이 카드 위로 날아간다
    art.classList.add("warp");
    art.classList.remove(...AIMS, "dip");
    foodEls.forEach((food, i) => food?.setAttribute("class", `hb2-bp-food hb2-bp-f${i}`));
    sparkEls.forEach((spark, i) => spark?.setAttribute("class", `hb2-bp-spark hb2-bp-k${i}`));
    results.forEach((res, i) => res?.setAttribute("class", `hb2-bp-res hb2-bp-r${i}`));
    void art.offsetWidth; // 리플로우로 대기 위치를 확정 — 다시 눌러도 처음부터 날아간다
    art.classList.remove("warp");
    art.classList.add(AIMS[beak.ok]);
    haptic(HAPTIC.tap);
    helper.innerHTML = beak.aim;
    face("curious");
    // ② 도착하면 살짝 내려가 집는 동작
    life.later(() => art.classList.add("dip"), beat(650));
    // ③ 집힌 먹이가 딸려 오르며 반짝이고, 그제서야 성공·실패 라벨이 뜬다
    life.later(() => {
      foodEls.forEach((food, i) =>
        food?.setAttribute("class", `hb2-bp-food hb2-bp-f${i} ${i === beak.ok ? "hit" : "miss"}`));
      sparkEls[beak.ok]?.setAttribute("class", `hb2-bp-spark hb2-bp-k${beak.ok} on`);
      results.forEach((res, i) => {
        if (!res) return;
        const good = i === beak.ok;
        res.textContent = good ? "성공" : "실패";
        res.setAttribute("class", `hb2-bp-res hb2-bp-r${i} on ${good ? "ok" : "no"}`);
      });
      haptic(HAPTIC.select);
      tried.add(beak.key);
      chips[picked].classList.add("done");
      helper.innerHTML = beak.note;
      face("surprised");
      const more = tried.size < BEAKS.length;
      // ④ 부리는 대기 위치로 돌아가고 먹이는 제자리로 — 못 집은 먹이의 흐림만 남는다
      life.later(() => {
        art.classList.remove(...AIMS, "dip");
        foodEls[beak.ok]?.setAttribute("class", `hb2-bp-food hb2-bp-f${beak.ok}`);
        if (!more) return;
        const next = BEAKS.findIndex((b) => !tried.has(b.key));
        if (next >= 0) select(next);
        action.disabled = false;
        busy = false;
      }, beat(1000));
      if (more) return;
      ended = true;
      settleAction(action);
      chips.forEach((chip) => { chip.disabled = true; });
      life.later(() => {
        face("curious");
        helper.innerHTML =
          "<b>부리 모양</b>마다 잘 집히는 먹이가 달랐어요. 부리 모양이 조금씩 다른 새들이 같은 곳에 살면 어떻게 될까요?";
        life.later(() => {
          ask(choices, helper, {
            choices: options(step.choices, [
              "먹이에 잘 맞는 부리를 가진 새가 더 잘 살아남아요",
              "먹이를 많이 쓸수록 부리가 점점 길어져요",
              "부리 모양이 달라도 먹이를 얻는 데는 아무 차이가 없어요",
            ]),
            good: "맞아요! 부리 모양마다 잘 집히는 먹이가 달랐듯, <b>먹이에 잘 맞는 부리</b>를 가진 새가 먹이를 더 잘 얻어 살아남기 쉬워요.",
            bad: "부리는 많이 쓴다고 자라지 않고, 먹이와 무관하지도 않아요. 한 마리의 부리는 평생 그대로예요. <b>먹이에 잘 맞는 부리</b>를 가진 새가 더 잘 살아남는답니다.",
            onDone: finish,
          });
        }, beat(620));
      }, beat(1100));
    }, beat(1120));
  });
  chips.forEach((chip, i) => life.listen(chip, "click", () => { if (!ended && !busy) select(i); }));
  return life.cleanup;
};

// ── L8 batwho — 박쥐·갈매기·다람쥐의 특징 살펴보기 ────────────
function batWhoSvg(): string {
  const cols = [100, 155, 210];
  const rows = [
    { label: "날개", has: [true, true, false] },
    { label: "몸의 털", has: [true, false, true] },
    { label: "젖 먹임", has: [true, false, true] },
    { label: "알 낳기", has: [false, true, false] },
  ];
  const mark = (x: number, y: number, yes: boolean): string =>
    yes
      ? `<g><circle cx="${x}" cy="${y}" r="8.5" fill="url(#hb2-leaf)" stroke="${LEAF_LO}" stroke-width="1.4"/><path d="M${x - 4} ${y}l3 3.4 5.4-6" stroke="#FFFFFF" stroke-width="2.3" fill="none"/></g>`
      : `<g><circle cx="${x}" cy="${y}" r="8.5" fill="url(#hb2-metal)" stroke="${METAL_LO}" stroke-width="1.4"/><path d="M${x - 4.4} ${y}h8.8" stroke="#FFFFFF" stroke-width="2.4"/></g>`;
  const table = rows
    .map((r, i) => `<g class="hb2-bw-row hb2-bw-r${i}"><text x="12" y="${92 + i * 20}" font-size="12" font-weight="850" fill="#4E5968">${r.label}</text>
${cols.map((cx, c) => mark(cx, 88 + i * 20, r.has[c])).join("")}</g>`)
    .join("");
  const bat = `<g><path d="M100 38q-20-16-30-4 8 0 10 8 8 6 14-2Z" fill="url(#hb2-bw-bat)" stroke="#4B3A5C" stroke-width="1.4"/>
<path d="M100 38q20-16 30-4-8 0-10 8-8 6-14-2Z" fill="url(#hb2-bw-bat)" stroke="#4B3A5C" stroke-width="1.4"/>
<ellipse cx="100" cy="38" rx="9" ry="12" fill="url(#hb2-bw-bat)" stroke="#4B3A5C" stroke-width="1.4"/>
<path d="M94 28l-2-8 7 5M106 28l2-8-7 5" fill="url(#hb2-bw-bat)" stroke="#4B3A5C" stroke-width="1.4"/>
<circle cx="97" cy="33" r="1.8" fill="#FFFFFF"/><circle cx="103" cy="33" r="1.8" fill="#FFFFFF"/></g>`;
  const gull = `<g><ellipse cx="155" cy="40" rx="15" ry="10" fill="url(#hb2-bw-gull)" stroke="#A9B5C4" stroke-width="1.4"/>
<path d="M148 36q14-14 24-2-12 2-18 6Z" fill="#C6D2DE" stroke="#A9B5C4" stroke-width="1.3"/>
<circle cx="145" cy="30" r="8" fill="url(#hb2-bw-gull)" stroke="#A9B5C4" stroke-width="1.4"/>
<path d="M138 30l-8 3 8 3Z" fill="#FFD43B" stroke="#B58309" stroke-width="1.1"/>
<circle cx="143" cy="28" r="1.8" fill="#26364A"/><path d="M152 50v6M160 50v6" stroke="#F59F00" stroke-width="2.4"/></g>`;
  const squirrel = `<g><path d="M222 50q14-10 8-24-10-12-20-2 12-2 14 8 2 10-6 16Z" fill="url(#hb2-bw-squi)" stroke="#8F5A24" stroke-width="1.4"/>
<ellipse cx="208" cy="44" rx="12" ry="10" fill="url(#hb2-bw-squi)" stroke="#8F5A24" stroke-width="1.4"/>
<circle cx="201" cy="32" r="8.5" fill="url(#hb2-bw-squi)" stroke="#8F5A24" stroke-width="1.4"/>
<path d="M196 25l-1-7 6 4M206 25l2-7-6 4" fill="url(#hb2-bw-squi)" stroke="#8F5A24" stroke-width="1.3"/>
<circle cx="198" cy="31" r="1.8" fill="#26364A"/><path d="M203 52v5M212 52v5" stroke="#8F5A24" stroke-width="2.4"/></g>`;
  const names = ["박쥐", "갈매기", "다람쥐"]
    .map((t, i) => `<text x="${cols[i]}" y="68" text-anchor="middle" font-size="12" font-weight="900" fill="#4E5968">${t}</text>`)
    .join("");
  return `${svgOpen()}<linearGradient id="hb2-bw-bat" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#C3AECD"/><stop offset=".52" stop-color="#8A6E9B"/><stop offset="1" stop-color="#5D4870"/></linearGradient>
<linearGradient id="hb2-bw-gull" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF"/><stop offset=".52" stop-color="#E8EDF3"/><stop offset="1" stop-color="#C2CBD6"/></linearGradient>
<linearGradient id="hb2-bw-squi" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F7D3A9"/><stop offset=".52" stop-color="#DA9A5A"/><stop offset="1" stop-color="#A96C33"/></linearGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
${bat}${gull}${squirrel}${names}
<path d="M12 76h216" stroke="#DCE0E6" stroke-width="1.4"/>${table}</svg>`;
}

export const renderBatWho: BodyHookRenderer = (scene, helper, step, finish, face) => runSteps(scene, helper, step, finish, face, {
  className: "hb2-batwho", svg: batWhoSvg(), action: "특징 살펴보기", wait: 980,
  intro: "<b>박쥐·갈매기·다람쥐</b>가 모였어요. 특징을 하나씩 살펴보며 누구와 누구를 한 무리로 묶을지 생각해 봐요!",
  stages: [
    { cls: "f1", note: "<b>날개가 있어요</b> — 박쥐와 갈매기는 있고, 다람쥐는 없어요.", label: "다음 특징 보기" },
    { cls: "f2", note: "<b>몸이 털로 덮여 있어요</b> — 박쥐와 다람쥐는 털, 갈매기는 깃털이에요.", label: "다음 특징 보기" },
    { cls: "f3", note: "<b>새끼를 낳아 젖을 먹여요</b> — 박쥐와 다람쥐만 그렇대요!", label: "다음 특징 보기" },
    { cls: "f4", note: "<b>알을 낳아요</b> — 갈매기만이에요. 박쥐는 갈매기와 다람쥐 중 어느 쪽과 더 가까울까요?" },
  ],
  choices: [
    "다람쥐요, 새끼를 낳아 젖을 먹이니까요",
    "갈매기요, 둘 다 날개가 있어 날 수 있으니까요",
    "셋 다 사는 곳이 달라서 어느 쪽과도 가깝지 않아요",
  ],
  good: "맞아요! 날개가 있다는 점보다 <b>털이 있고 새끼를 낳아 젖을 먹인다</b>는 특징이 박쥐와 다람쥐를 한 무리로 묶어요.",
  bad: "날 수 있다는 것만으로 같은 무리가 되지는 않아요. 박쥐는 <b>털이 있고 새끼를 낳아 젖을 먹여</b> 다람쥐와 더 가깝답니다.",
});

// ── L9 noplant — 접시 위 버섯을 자세히 보기 ──────────────────
function noPlantSvg(): string {
  const clues = ["초록색이 아니에요", "스스로 움직이지 않아요", "죽은 나무에서 양분을 얻어요"];
  const strips = clues
    .map((t, i) => `<g class="hb2-np-clue hb2-np-c${i}"><rect x="14" y="${100 + i * 24}" width="212" height="20" rx="10" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.4"/>
<circle cx="27" cy="${110 + i * 24}" r="4.2" fill="url(#hb2-leaf)"/>
<text x="38" y="${114 + i * 24}" font-size="12" font-weight="850" fill="#4E5968">${t}</text></g>`)
    .join("");
  return `${svgOpen()}<radialGradient id="hb2-np-cap" cx=".32" cy=".24" r=".9"><stop stop-color="#F2D9BE"/><stop offset=".54" stop-color="#C79A6E"/><stop offset="1" stop-color="#96683F"/></radialGradient>
<linearGradient id="hb2-np-stem" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#FFFBF3"/><stop offset=".5" stop-color="#F0E3CE"/><stop offset="1" stop-color="#CDB897"/></linearGradient>
<linearGradient id="hb2-np-log" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#C6A47E"/><stop offset=".52" stop-color="#9A7550"/><stop offset="1" stop-color="#6E5133"/></linearGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
<g class="hb2-np-log" filter="url(#hb2-drop)"><path d="M170 56h48q6 0 6 6v22q0 6-6 6h-48q-6 0-6-6V62q0-6 6-6Z" fill="url(#hb2-np-log)" stroke="#5B4128" stroke-width="1.5"/>
<ellipse cx="170" cy="73" rx="6" ry="17" fill="#B08D66" stroke="#5B4128" stroke-width="1.4"/><ellipse cx="170" cy="73" rx="2.6" ry="8" fill="#7A5B3B"/></g>
<g class="hb2-np-hypha" stroke="#F0E3CE" stroke-width="2" opacity=".95"><path d="M132 82q18 8 34 2"/><path d="M132 88q16 14 32 10"/><path d="M134 76q14-2 26-6"/></g>
${contact(104, 92, 52, 6)}
<g filter="url(#hb2-drop)"><path d="M52 92q0-10 8-12h88q8 2 8 12-14 6-52 6t-52-6Z" fill="#FFFFFF" stroke="#C9D1DA" stroke-width="1.5"/></g>
<g class="hb2-np-mush" filter="url(#hb2-drop)"><path d="M92 88q0-24 10-26h6q10 2 10 26Z" fill="url(#hb2-np-stem)" stroke="#B29B79" stroke-width="1.5"/>
<path d="M60 62q6-38 44-38t44 38q-22 10-44 10T60 62Z" fill="url(#hb2-np-cap)" stroke="#7A5232" stroke-width="1.6"/>
<ellipse cx="86" cy="40" rx="14" ry="7" fill="#FFFFFF" opacity=".35"/>
<circle cx="120" cy="40" r="5" fill="#F2D9BE" opacity=".8"/><circle cx="76" cy="56" r="4" fill="#F2D9BE" opacity=".7"/></g>
${strips}</svg>`;
}

export const renderNoPlant: BodyHookRenderer = (scene, helper, step, finish, face) => runSteps(scene, helper, step, finish, face, {
  className: "hb2-noplant", svg: noPlantSvg(), action: "자세히 보기", wait: 960,
  intro: "접시에 <b>버섯</b> 하나가 놓여 있어요. 자세히 보며 단서를 하나씩 찾아봐요!",
  stages: [
    { cls: "c1", note: "잎도 없고 <b>초록색도 아니에요</b>. 그러니 햇빛으로 스스로 양분을 만들지는 못하겠죠?", label: "더 자세히 보기" },
    { cls: "c2", note: "한참을 봐도 <b>스스로 움직이지 않아요</b>. 먹이를 찾아 돌아다니지도 않고요.", label: "더 자세히 보기" },
    { cls: "c3", note: "실 같은 것이 <b>죽은 나무</b>에 파고들어 양분을 얻고 있어요! 버섯은 식물일까요, 동물일까요?" },
  ],
  choices: [
    "둘 다 아니에요, 다른 무리가 필요해요",
    "식물이에요, 움직이지 않고 한자리에 붙어 있으니까요",
    "동물이에요, 초록색이 아니고 스스로 양분을 못 만드니까요",
  ],
  good: "맞아요! 버섯은 <b>광합성을 하지 않지만 동물도 아니에요</b>. 식물도 동물도 아닌 다른 무리가 필요하답니다.",
  bad: "움직이지 않는다고 식물, 초록색이 아니라고 동물인 것은 아니에요. 버섯은 <b>식물도 동물도 아닌 다른 무리</b>랍니다.",
});

// ── L10 seedvault — 종자은행 서랍 열기 ───────────────────────
function seedVaultSvg(): string {
  const seedRow = (y: number, kind: number): string => {
    const cols = [50, 74, 98, 122, 146, 170, 194];
    return cols
      .map((x, i) => {
        if (kind === 0) return `<circle cx="${x}" cy="${y}" r="5.4" fill="url(#hb2-sv-a)" stroke="#8A5A2B" stroke-width="1.2"/>`;
        if (kind === 1) return `<ellipse cx="${x}" cy="${y}" rx="6.4" ry="4.2" transform="rotate(${i % 2 ? 14 : -12} ${x} ${y})" fill="url(#hb2-sv-b)" stroke="#7A6320" stroke-width="1.2"/>`;
        return `<path d="M${x} ${y - 5.6}q6 5.6 0 11.2-6-5.6 0-11.2Z" fill="url(#hb2-sv-c)" stroke="#5B4128" stroke-width="1.2"/>`;
      })
      .join("");
  };
  const drawers = [0, 1, 2]
    .map((i) => {
      const top = 24 + i * 38;
      return `<g class="hb2-sv-d${i}"><rect x="36" y="${top}" width="168" height="34" rx="5" fill="#31435C" stroke="#243549" stroke-width="1.4"/>
<g class="hb2-sv-seeds">${seedRow(top + 17, i)}</g>
<g class="hb2-sv-front"><rect x="36" y="${top}" width="168" height="34" rx="5" fill="url(#hb2-metal)" stroke="${METAL_LO}" stroke-width="1.5"/>
<path d="M42 ${top + 5}h56" stroke="#FFFFFF" stroke-width="2.2" opacity=".6"/>
<rect x="98" y="${top + 12}" width="44" height="9" rx="4.5" fill="#F1F4F8" stroke="${METAL_LO}" stroke-width="1.3"/></g></g>`;
    })
    .join("");
  const tags = ["잠긴 씨앗 서랍", "모은 씨앗 6종", "모은 씨앗 14종", "모은 씨앗 23종"]
    .map((t, i) => `<text class="hb2-sv-t${i}" x="120" y="157" text-anchor="middle" font-size="12" font-weight="900" fill="#4E5968">${t}</text>`)
    .join("");
  return `${svgOpen()}<radialGradient id="hb2-sv-a" cx=".32" cy=".28" r=".9"><stop stop-color="#F6DDBB"/><stop offset=".55" stop-color="#D19A5C"/><stop offset="1" stop-color="#9A5F2B"/></radialGradient>
<radialGradient id="hb2-sv-b" cx=".32" cy=".28" r=".9"><stop stop-color="#FBF3C9"/><stop offset=".55" stop-color="#E4CD72"/><stop offset="1" stop-color="#A98F2C"/></radialGradient>
<radialGradient id="hb2-sv-c" cx=".32" cy=".28" r=".9"><stop stop-color="#D9C3A5"/><stop offset=".55" stop-color="#A98460"/><stop offset="1" stop-color="#6E5133"/></radialGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
${contact(120, 141, 92, 5)}
<g filter="url(#hb2-drop)"><rect x="28" y="16" width="184" height="122" rx="9" fill="url(#hb2-metal)" stroke="${METAL_LO}" stroke-width="1.6"/>
<path d="M36 22h44" stroke="#FFFFFF" stroke-width="2.4" opacity=".65"/></g>
${drawers}${tags}</svg>`;
}

export const renderSeedVault: BodyHookRenderer = (scene, helper, step, finish, face) => runSteps(scene, helper, step, finish, face, {
  className: "hb2-seedvault", svg: seedVaultSvg(), action: "서랍 열기", wait: 960,
  intro: "씨앗을 모아 두는 <b>종자은행</b>이에요. 서랍을 하나씩 열어 봐요!",
  stages: [
    { cls: "o1", note: "첫 서랍이 열렸어요. 둥근 씨앗이 종류별로 담겨 있어요.", label: "다음 서랍 열기" },
    { cls: "o2", note: "두 번째 서랍에는 <b>전혀 다른 모양</b>의 씨앗이 들어 있어요!", label: "다음 서랍 열기" },
    { cls: "o3", note: "서랍을 열수록 씨앗 종류가 늘어나요. 왜 이렇게 많은 종류의 씨앗을 모아 둘까요?" },
  ],
  choices: [
    "식물이 사라지는 것을 막아 생물다양성을 지키려고요",
    "씨앗을 오래 보관하면 더 크고 좋은 씨앗으로 변해서요",
    "가장 잘 자라는 한 종류만 골라 남기려고요",
  ],
  good: "맞아요! 종류마다 씨앗을 모아 두면 어떤 식물이 사라져도 <b>다시 싹 틔울 기회</b>가 남아요. 생물다양성을 지키는 방법이지요.",
  bad: "씨앗은 오래 둔다고 좋아지지 않고, 한 종류만 남기는 것은 오히려 위험해요. <b>여러 종류를 함께 지켜 두는 것</b>이 목적이랍니다.",
});

// ── L1(예비) scalezoom — 손등에 돋보기를 대고 더 확대하기 ────
function scaleZoomSvg(): string {
  const cx = 148;
  const cy = 78;
  const cells: string[] = [];
  const nucs: string[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      const w = 26;
      const h = 19;
      const x = cx - 65 + c * w + (r % 2 ? -w / 2 : 0);
      const y = cy - 57 + r * h;
      cells.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w - 3}" height="${h - 3}" rx="7" fill="url(#hb2-sz-cell)" stroke="#B0714E" stroke-width="1.4" opacity=".9"/>`);
      nucs.push(`<circle cx="${(x + w * 0.5).toFixed(1)}" cy="${(y + h * 0.48).toFixed(1)}" r="3.6" fill="url(#hb2-nuc)" stroke="${NUC_LO}" stroke-width="1"/>`);
    }
  }
  const ridge: string[] = [];
  for (let i = 0; i < 9; i++) {
    ridge.push(`<path d="M${cx - 60} ${cy - 52 + i * 13}q30 9 60 0q30-9 60 0" stroke="#D89A78" stroke-width="1.6" opacity=".75"/>`);
    ridge.push(`<path d="M${cx - 56 + i * 14} ${cy - 54}q9 26 0 52" stroke="#E4B396" stroke-width="1.4" opacity=".6"/>`);
  }
  const tags = ["맨눈", "확대경 10배", "현미경 100배", "현미경 400배"]
    .map((t, i) => `<text class="hb2-sz-t${i}" x="62" y="158" text-anchor="middle" font-size="12" font-weight="900" fill="#4E5968">${t}</text>`)
    .join("");
  return `${svgOpen()}<clipPath id="hb2-sz-clip"><circle cx="${cx}" cy="${cy}" r="46"/></clipPath>
<linearGradient id="hb2-sz-skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFE7D4"/><stop offset=".52" stop-color="#F3C09A"/><stop offset="1" stop-color="#D2946A"/></linearGradient>
<linearGradient id="hb2-sz-cell" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFEEE2"/><stop offset=".54" stop-color="#F6C6A6"/><stop offset="1" stop-color="#D08F68"/></linearGradient></defs>
<rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hb2-bg)"/>
${contact(120, 140, 86, 6)}
<g filter="url(#hb2-drop)"><path d="M46 132V70q0-10 10-10t10 10v10V54q0-10 10-10t10 10v26V50q0-10 10-10t10 10v30V58q0-10 10-10t10 10v56q0 18-18 18H64q-18 0-18-18Z" fill="url(#hb2-sz-skin)" stroke="#B4794F" stroke-width="1.6"/>
<path d="M62 76q22 10 44 0" stroke="#E0AA86" stroke-width="2.4" opacity=".8"/></g>
<g clip-path="url(#hb2-sz-clip)"><circle cx="${cx}" cy="${cy}" r="46" fill="url(#hb2-sz-skin)"/>
<g class="hb2-sz-plain" stroke="#E0AA86" stroke-width="2.6" opacity=".85"><path d="M106 60q42 14 84 0"/><path d="M104 84q44 16 88-2"/><path d="M108 108q40 12 80-4"/></g>
<g class="hb2-sz-ridge">${ridge.join("")}</g>
<g class="hb2-sz-cells">${cells.join("")}<g class="hb2-sz-nuc">${nucs.join("")}</g></g></g>
<g filter="url(#hb2-drop)"><circle cx="${cx}" cy="${cy}" r="50" fill="none" stroke="url(#hb2-metal)" stroke-width="8"/>
<circle cx="${cx}" cy="${cy}" r="54" fill="none" stroke="${METAL_LO}" stroke-width="1.4"/>
<circle cx="${cx}" cy="${cy}" r="46" fill="none" stroke="${METAL_LO}" stroke-width="1.4"/>
<path d="M${cx - 33} ${cy + 38}l-22 24" stroke="url(#hb2-metal)" stroke-width="11" stroke-linecap="round"/>
<path d="M${cx - 33} ${cy + 38}l-22 24" stroke="${METAL_LO}" stroke-width="1.4" fill="none" opacity=".5"/></g>
<path d="M${cx - 28} ${cy - 30}q14-10 28-2" stroke="#FFFFFF" stroke-width="4" opacity=".45"/>
<g><rect x="14" y="142" width="96" height="22" rx="11" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.4"/>${tags}</g></svg>`;
}

export const renderScaleZoom: BodyHookRenderer = (scene, helper, step, finish, face) => runSteps(scene, helper, step, finish, face, {
  className: "hb2-scalezoom", svg: scaleZoomSvg(), action: "더 확대", wait: 1050,
  intro: "내 <b>손등</b>에 돋보기를 대 봤어요. 매끈해 보이는 이 피부를 더 크게 보면 무엇이 보일까요?",
  stages: [
    { cls: "s1", note: "피부에 <b>가는 결</b>이 그물처럼 나 있어요! 더 크게 볼까요?", label: "더 확대" },
    { cls: "s2", note: "결 사이로 <b>작은 칸</b>들이 어렴풋이 보이기 시작해요!", label: "더 확대" },
    { cls: "s3", note: "칸 하나하나가 또렷해졌어요. 칸마다 가운데에 <b>둥근 점</b>도 보여요!" },
  ],
  outro: "매끈해 보이던 손등이 아주 작은 <b>칸</b>으로 빽빽하게 채워져 있었어요. 이 칸의 정체를 지금부터 알아봐요!",
});

