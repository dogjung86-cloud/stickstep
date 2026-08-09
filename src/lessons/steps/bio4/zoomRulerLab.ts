// [중1 Ⅱ v3] L1 zoomRulerLab — 「양파 줌 사다리」.
// 한 통찰: 배율을 올릴수록 보이는 폭이 그만큼 좁아지고(시야 폭 = 1배 폭 ÷ 배율),
// ×40에서 처음으로 세포 벽돌담이 드러난다 — 세포는 0.1 mm대, 맨눈으로는 못 보는 크기.
// 시야 검산: ×1 = 80 mm → ×10 = 8 mm → ×40 = 2 mm → ×400 = 0.2 mm(= 200 µm, 세포 1~2칸).
// 조작: 배율 버튼 4단(순서 해제 — ×400까지 가면 자유 이동) → 세포 크기 판정 질문(첫 시도만 채점).
// rAF·캔버스 없음 — SVG 레이어 + CSS 전환(수학 랩 문법). 타이머는 Set으로 모아 cleanup.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";

interface ZrlStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 배율 사다리 — view = 보이는 폭 라벨(1배 80 mm에서 정확히 ÷배율). */
const LEVELS = [
  { mag: "×1", view: "8 cm", hint: "맨눈으로 본 양파예요. 더 가까이!" },
  { mag: "×10", view: "8 mm", hint: "얇게 벗긴 속껍질 한 장 — 아직은 매끈해 보여요." },
  { mag: "×40", view: "2 mm", hint: "벽돌담이 나타났어요! 이 칸 하나하나가 세포예요." },
  { mag: "×400", view: "0.2 mm (= 200 µm)", hint: "세포 한 칸이 화면 가득 — 아래 질문에 답해 보세요." },
] as const;

// ── 레이어 SVG(파운드리 문법: 그라데이션 면·좌상단 키라이트·접촉 그림자·최암색 외곽선) ──
const svgOpen = `<svg viewBox="0 0 340 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;

/** ×1 — 양파 반쪽(단면이 보이게). */
function onionScene(): string {
  const rings = [64, 50, 37, 25, 14, 6]
    .map((r) => `<ellipse cx="170" cy="126" rx="${r}" ry="${r * 1.06}" stroke="#E2B98C" stroke-width="2.4" fill="none"/>`)
    .join("");
  return `${svgOpen}
    <defs>
      <radialGradient id="zrlOnion" cx="0.38" cy="0.3" r="1">
        <stop offset="0" stop-color="#FFFDF6"/><stop offset="0.55" stop-color="#FFF3DC"/><stop offset="1" stop-color="#F3DBB4"/>
      </radialGradient>
    </defs>
    <ellipse cx="170" cy="208" rx="96" ry="12" fill="#2A3A5E" opacity="0.11"/>
    <path d="M96 126 C96 66 128 44 170 44 C212 44 244 66 244 126 C244 184 212 204 170 204 C128 204 96 184 96 126 Z"
      fill="url(#zrlOnion)" stroke="#B07A38" stroke-width="3"/>
    ${rings}
    <path d="M160 46 C162 30 166 24 170 16 C174 24 178 30 180 46" fill="#EAD9A8" stroke="#B07A38" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M150 203 l-5 13 M170 205 l0 14 M190 203 l5 13" stroke="#B07A38" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M120 74 C132 60 146 54 158 52" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
  </svg>`;
}

/** ×10 — 벗겨 낸 반투명 속껍질 한 장(아직 매끈). */
function peelScene(): string {
  return `${svgOpen}
    <defs>
      <linearGradient id="zrlPeel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFFCF1"/><stop offset="0.6" stop-color="#FBF0D8"/><stop offset="1" stop-color="#F2E2BD"/>
      </linearGradient>
    </defs>
    <ellipse cx="170" cy="196" rx="110" ry="10" fill="#2A3A5E" opacity="0.10"/>
    <path d="M78 92 C120 74 226 74 262 96 C266 132 258 168 250 182 C196 196 116 194 92 180 C80 152 74 116 78 92 Z"
      fill="url(#zrlPeel)" stroke="#D9BE8C" stroke-width="2.8" opacity="0.96"/>
    <path d="M250 182 C258 170 262 156 263 146 C252 152 244 166 243 178 Z" fill="#EBD9AE" stroke="#D9BE8C" stroke-width="2.2"/>
    <path d="M96 100 C130 88 176 86 204 90" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
    <path d="M108 150 C150 158 210 158 236 150" stroke="#E6D2A4" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>
  </svg>`;
}

/** ×40 — 세포 벽돌담. 검산: 시야 2 mm ÷ 가로 약 5칸 ≈ 칸당 0.4 mm(양파 표피세포 실측 크기대). */
function wallScene(): string {
  const cells: string[] = [];
  const W = 66;
  const H = 44;
  for (let row = 0; row < 5; row++) {
    const off = row % 2 === 0 ? 0 : -W / 2;
    for (let col = 0; col < 7; col++) {
      const x = 6 + off + col * (W + 4);
      const y = 10 + row * (H + 3);
      if (x > 340 || x + W < 0) continue;
      cells.push(
        `<rect x="${x}" y="${y}" rx="12" width="${W}" height="${H}" fill="#F8F0CF" stroke="#C9A96B" stroke-width="2.6"/>`,
      );
    }
  }
  return `${svgOpen}<rect x="0" y="0" width="340" height="240" fill="#FBF6E4"/>${cells.join("")}</svg>`;
}

/** ×400 — 세포 한 칸 클로즈업(+이웃 가장자리). 속 알갱이는 다음 레슨 브리지(라벨 없음). */
function cellScene(): string {
  return `${svgOpen}
    <rect x="0" y="0" width="340" height="240" fill="#FCF7E6"/>
    <rect x="-40" y="-30" rx="34" width="200" height="140" fill="#F8F0CF" stroke="#B99655" stroke-width="5"/>
    <rect x="-30" y="122" rx="34" width="180" height="150" fill="#F8F0CF" stroke="#B99655" stroke-width="5"/>
    <rect x="172" y="-20" rx="40" width="230" height="284" fill="#FAF2D6" stroke="#B99655" stroke-width="6"/>
    <circle cx="262" cy="116" r="26" fill="#D9B678" opacity="0.85" stroke="#A9854A" stroke-width="2.6"/>
    <circle cx="254" cy="108" r="8" fill="#FFF6DE" opacity="0.7"/>
    <path d="M196 26 C220 16 250 14 276 20" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.5"/>
  </svg>`;
}

const SCENES = [onionScene, peelScene, wallScene, cellScene];

export const zoomRulerLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ZrlStep;
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
    el("div", { class: "pn-badge b4", dataset: { g: "wall" } }, el("b", { text: "세포 발견" }), el("span", { text: "×40에서" })),
    el("div", { class: "pn-badge b4", dataset: { g: "close" } }, el("b", { text: "클로즈업" }), el("span", { text: "×400까지" })),
    el("div", { class: "pn-badge b4", dataset: { g: "size" } }, el("b", { text: "크기 판정" }), el("span", { text: "질문 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "양파 한 조각에서 출발해요. <b>배율 버튼</b>을 차례로 눌러 깊이 들어가면서, 아래 <b>눈금(보이는 폭)</b>이 어떻게 변하는지 지켜보세요.",
  });

  const layers = SCENES.map((fn, i) => el("div", { class: "zrl-layer" + (i === 0 ? " cur" : ""), html: fn() }));
  const viewport = el("div", { class: "zrl-view" }, ...layers);
  const rulerLabel = el("b", { text: LEVELS[0].view });
  const ruler = el(
    "div",
    { class: "zrl-ruler" },
    el("span", { class: "zrl-tick l" }),
    el("span", { class: "zrl-line" }),
    el("span", { class: "zrl-tick r" }),
    el("div", { class: "zrl-ruler-cap" }, el("span", { text: "여기서 보이는 폭 " }), rulerLabel),
  );
  const board = el("div", { class: "b4-board zrl-board" }, viewport, ruler);

  let cur = 0;
  let reached = 0;
  const magRow = el("div", { class: "zrl-mags" });
  const magBtns = LEVELS.map((lv, i) => {
    const b = el("button", { class: "zrl-mag" + (i === 0 ? " cur" : ""), text: lv.mag, attrs: { type: "button" } }) as HTMLButtonElement;
    b.disabled = i > 1;
    b.addEventListener("click", () => goTo(i));
    magRow.appendChild(b);
    return b;
  });

  const qBox = el("div", { class: "hook-choices zrl-q" });
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
        "정리! 배율을 올릴수록 <b>보이는 폭이 그만큼 좁아지고</b>(×400이면 400분의 1), 그제야 <b>0.1 mm대의 세포</b>가 모습을 드러냈어요. 세포처럼 작은 세계를 보려면 <b>현미경</b>이 필요한 이유죠.";
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  function goTo(i: number): void {
    if (i === cur) return;
    if (reached < LEVELS.length - 1 && i !== cur + 1) return; // 순서 해제: 끝까지 가 보기 전엔 한 칸씩
    haptic(HAPTIC.tap);
    const prev = cur;
    cur = i;
    reached = Math.max(reached, i);
    layers.forEach((ly, k) => {
      ly.classList.remove("cur", "out", "in");
      if (k === prev) ly.classList.add(i > prev ? "out" : "in");
      if (k === i) ly.classList.add("cur");
    });
    rulerLabel.textContent = LEVELS[i].view;
    ruler.classList.remove("pulse");
    void ruler.offsetWidth;
    ruler.classList.add("pulse");
    magBtns.forEach((b, k) => {
      b.classList.toggle("cur", k === i);
      b.disabled = reached < LEVELS.length - 1 ? !(k === cur || k === cur + 1) : false;
    });
    if (!finished) helper.innerHTML = `<b>${LEVELS[i].mag}</b> — ${LEVELS[i].hint}`;
    if (i === 2) collect("wall", "벽돌담!");
    if (i === 3) {
      collect("close", "세포 한 칸!");
      showQuestion();
    }
  }

  let qShown = false;
  function showQuestion(): void {
    if (qShown) return;
    qShown = true;
    qBox.style.display = "";
    qBox.appendChild(
      el("div", { class: "hook-q", html: "화면을 거의 꽉 채운 <b>세포 한 칸</b> — 실제 크기는 어느 정도일까요? 눈금으로 어림해 보세요." }),
    );
    const choices = [
      { t: "머리카락 굵기쯤 (약 0.1 mm)", ok: true },
      { t: "쌀알만 하다 (약 5 mm)", ok: false },
      { t: "동전만 하다 (약 2 cm)", ok: false },
    ];
    const order = choices.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let answered = false;
    order.forEach((idx) => {
      const c = choices[idx];
      const b = el("button", { class: "hook-choice", text: c.t, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        haptic(c.ok ? HAPTIC.correct : HAPTIC.wrong);
        const btns = [...qBox.querySelectorAll<HTMLButtonElement>(".hook-choice")];
        btns.forEach((x) => {
          const mine = x === b;
          x.classList.add(mine ? (c.ok ? "sel" : "miss") : "dim");
          x.disabled = !mine;
        });
        if (!c.ok) {
          const goodBtn = btns.find((x) => x.textContent === choices[0].t);
          goodBtn?.classList.remove("dim");
          goodBtn?.classList.add("reveal");
        }
        api.recordQuiz(c.ok);
        helper.innerHTML = c.ok
          ? "정확해요! 보이는 폭이 <b>0.2 mm</b>인데 세포가 화면을 거의 채우니, 세포 한 칸은 <b>약 0.1 mm대</b> — 머리카락 굵기 언저리예요. 맨눈으로 낱낱이 보기엔 너무 작죠."
          : "눈금을 다시 봐요 — 화면 전체가 <b>0.2 mm</b>밖에 안 돼요. 그 안을 거의 채운 세포는 <b>약 0.1 mm대</b>, 머리카락 굵기 언저리랍니다. 쌀알(5 mm)과는 50배 차이예요.";
        collect("size", "약 0.1 mm!");
      });
      qBox.appendChild(b);
    });
    later(() => qBox.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  }

  host.append(goalChips, helper, board, magRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("배율을 ×400까지 올려 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
