// [중2 Ⅴ v3] L1 greenHuntLab — 「초록의 정체 추적」.
// 한 통찰: 잎의 초록은 세포 속 알갱이(엽록체)의 색이고, 광합성은 바로 그 엽록체에서 일어난다.
// 조작: 무대의 빛나는 고리를 탭해 3단 줌(잎 → 잎세포 → 엽록체) → 판정 질문(광합성 장소).
// rAF·캔버스 없음 — SVG 레이어 + CSS 전환(중1 Ⅱ v3 zoomRulerLab 문법). 타이머는 Set으로 cleanup.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { P3 } from "../../../ui/plant3Kit";
import type { StepRenderer } from "../../types";

interface GhzStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const svgOpen = `<svg viewBox="0 0 340 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;

/** 확대 목표를 알리는 빛 고리(탭 대상 시각 앵커 — 히트는 무대 전체). */
const ring = (cx: number, cy: number, r: number): string =>
  `<g class="ghz-ring"><circle cx="${cx}" cy="${cy}" r="${r}" stroke="#FFFFFF" stroke-width="3" opacity="0.9"/>
   <circle cx="${cx}" cy="${cy}" r="${r + 7}" stroke="${P3.leaf}" stroke-width="2" opacity="0.55"/></g>`;

/** ×1 — 잎 한 장(전체가 고르게 초록으로 보인다). */
function leafScene(): string {
  return `${svgOpen}
    <defs>
      <radialGradient id="ghzLeaf" cx="0.38" cy="0.3" r="1">
        <stop offset="0" stop-color="#69C77E"/><stop offset="0.6" stop-color="#40A85C"/><stop offset="1" stop-color="#2E8B49"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="340" height="240" fill="#F2FAF0"/>
    <ellipse cx="170" cy="216" rx="110" ry="10" fill="#2A3A5E" opacity="0.09"/>
    <path d="M170 22 C232 52 258 108 244 156 C232 196 202 214 170 216 C138 214 108 196 96 156 C82 108 108 52 170 22 Z"
      fill="url(#ghzLeaf)" stroke="#1E5A2A" stroke-width="3.2"/>
    <path d="M170 30 L170 214 M170 74 C150 84 132 100 122 118 M170 74 C190 84 208 100 218 118
      M170 118 C152 128 138 142 130 158 M170 118 C188 128 202 142 210 158 M170 162 C158 170 148 180 142 190 M170 162 C182 170 192 180 198 190"
      stroke="#1E5A2A" stroke-width="2.2" stroke-linecap="round" opacity="0.55"/>
    <path d="M126 62 C140 46 156 38 170 36" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.4"/>
    ${ring(196, 108, 26)}
  </svg>`;
}

/** ×수백 — 잎세포 벽돌담. 초록은 세포 전체가 아니라 세포 속 알갱이들이다(검정말 관찰상). */
function cellScene(): string {
  const cells: string[] = [];
  const W = 88;
  const H = 62;
  for (let row = 0; row < 4; row++) {
    const off = row % 2 === 0 ? 0 : -W / 2;
    for (let col = 0; col < 6; col++) {
      const x = 4 + off + col * (W + 5);
      const y = 4 + row * (H + 4);
      if (x > 340 || x + W < 0) continue;
      const grains = [
        [x + 20, y + 18], [x + 44, y + 14], [x + 66, y + 24], [x + 26, y + 42], [x + 52, y + 44],
      ]
        .map(([gx, gy], i) => `<ellipse cx="${gx}" cy="${gy}" rx="9.5" ry="6.5" fill="${P3.chloro}" stroke="#1E5A2A" stroke-width="1.4" transform="rotate(${(i * 37) % 60 - 30} ${gx} ${gy})"/>`)
        .join("");
      cells.push(
        `<rect x="${x}" y="${y}" rx="14" width="${W}" height="${H}" fill="#F4F9E8" stroke="#A8B98A" stroke-width="2.6"/>${grains}`,
      );
    }
  }
  return `${svgOpen}<rect x="0" y="0" width="340" height="240" fill="#FAFCF2"/>${cells.join("")}${ring(224, 106, 20)}</svg>`;
}

/** ×수천 — 엽록체 하나 클로즈업. 엽록소가 빛을 붙잡는 연출(노랑 화살 → 초록 알갱이). */
function chloroScene(): string {
  const grana = [
    [128, 108], [168, 88], [208, 112], [148, 142], [196, 148], [172, 118],
  ]
    .map(([x, y]) => `<g><ellipse cx="${x}" cy="${y}" rx="15" ry="9" fill="#1E7A34"/><ellipse cx="${x}" cy="${y - 3}" rx="15" ry="9" fill="#2F9E44"/><ellipse cx="${x}" cy="${y - 6}" rx="15" ry="9" fill="#37B24D"/></g>`)
    .join("");
  return `${svgOpen}
    <defs>
      <radialGradient id="ghzChl" cx="0.4" cy="0.32" r="1">
        <stop offset="0" stop-color="#B2F2BB"/><stop offset="0.55" stop-color="#69DB7C"/><stop offset="1" stop-color="#40A85C"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="340" height="240" fill="#F4F9E8"/>
    <ellipse cx="170" cy="212" rx="120" ry="9" fill="#2A3A5E" opacity="0.08"/>
    <ellipse cx="170" cy="120" rx="118" ry="74" fill="url(#ghzChl)" stroke="#1E5A2A" stroke-width="3.4"/>
    <ellipse cx="170" cy="120" rx="104" ry="62" fill="none" stroke="#8CE99A" stroke-width="2" opacity="0.6"/>
    ${grana}
    <g class="ghz-rays">
      <path d="M36 34 L96 78 M60 22 L112 64 M88 16 L130 56" stroke="${P3.light}" stroke-width="5" stroke-linecap="round"/>
      <path d="M92 74 l8 6 -10 2 Z M108 60 l8 6 -10 2 Z M126 52 l8 6 -10 2 Z" fill="${P3.light}"/>
    </g>
    <g class="ghz-spark">
      <path d="M150 96 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 Z" fill="#FFF3BF"/>
      <path d="M198 128 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="#FFF3BF"/>
    </g>
    <path d="M96 76 C112 58 136 48 158 46" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
  </svg>`;
}

const SCENES = [leafScene, cellScene, chloroScene];
const HINTS = [
  "잎이에요. 어디를 봐도 온통 초록이죠. 빛나는 고리를 <b>탭</b>해서 더 가까이!",
  "세포 벽돌담이 나타났어요. 그런데 초록이 세포 전체가 아니라 <b>알갱이들</b>에만 몰려 있네요! 고리를 탭해 알갱이 하나를 크게 봐요.",
  "이 알갱이가 <b>엽록체</b>, 속의 초록 색소 <b>엽록소</b>가 빛에너지를 붙잡고 있어요(반짝!). 아래 질문에 답해 보세요.",
];

export const greenHuntLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as GhzStep;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge p3", dataset: { g: "cell" } }, el("b", { text: "세포 도착" }), el("span", { text: "한 번 더 확대" })),
    el("div", { class: "pn-badge p3", dataset: { g: "chloro" } }, el("b", { text: "초록의 정체" }), el("span", { text: "알갱이 클로즈업" })),
    el("div", { class: "pn-badge p3", dataset: { g: "judge" } }, el("b", { text: "장소 판정" }), el("span", { text: "질문 대기" })),
  );
  const helper = el("div", { class: "helper", html: HINTS[0] });

  const layers = SCENES.map((fn, i) => el("div", { class: "ghz-layer" + (i === 0 ? " cur" : ""), html: fn() }));
  const board = el("div", {
    class: "p3-board ghz-board",
    attrs: { role: "button", tabindex: "0", "aria-label": "빛나는 고리를 탭해 확대하기" },
  }, ...layers);

  const qBox = el("div", { class: "hook-choices ghz-q" });
  qBox.style.display = "none";

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 잎의 초록은 세포 속 <b>엽록체</b>의 색이고, 광합성은 바로 그 엽록체에서 일어나요. 엽록체 속 <b>엽록소</b>가 빛에너지를 흡수하는 초록 색소랍니다.";
      api.enableCTA(s.cta ?? "용어로 정리하기");
    }
  }

  let cur = 0;
  function zoomIn(): void {
    if (cur >= SCENES.length - 1) return;
    haptic(HAPTIC.tap);
    const prev = cur;
    cur += 1;
    layers.forEach((ly, k) => {
      ly.classList.remove("cur", "out", "in");
      if (k === prev) ly.classList.add("out");
      if (k === cur) ly.classList.add("cur");
    });
    helper.innerHTML = HINTS[cur];
    if (cur === 1) collect("cell", "벽돌담 발견!");
    if (cur === 2) {
      collect("chloro", "엽록체!");
      later(showQuestion, 900);
    }
  }

  let qShown = false;
  function showQuestion(): void {
    if (qShown) return;
    qShown = true;
    b4Ask(
      qBox,
      "그렇다면, 식물이 양분을 만드는 <b>광합성</b>은 어디에서 일어날까요?",
      [
        { t: "세포 속 초록 알갱이, 엽록체에서", ok: true },
        { t: "세포 안 어디서나 골고루", ok: false },
        { t: "잎의 겉껍질(표면)에서만", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 광합성은 세포 어디서나가 아니라 <b>엽록체 안에서만</b> 일어나요. 초록이 알갱이에 몰려 있던 이유죠."
          : "방금 본 장면을 떠올려요. 초록은 세포 전체가 아니라 <b>알갱이(엽록체)</b>에만 몰려 있었죠? 광합성도 바로 그 엽록체 안에서만 일어난답니다.";
        collect("judge", "엽록체!");
      },
    );
  }

  board.addEventListener("click", zoomIn);
  board.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      k.preventDefault();
      zoomIn();
    }
  });

  host.append(goalChips, helper, board, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("고리를 탭해 끝까지 들어가 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
