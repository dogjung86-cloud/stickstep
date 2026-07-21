// hookChem — 중2 I 단원(물질의 특성) 훅 장면 9종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수.
// 스틱맨 캐릭터만 손그림 라인(#3C4654, 2.4px) 유지.
//   rings     L1 — 백금 반지 vs 은반지: 굴려 봐도 똑같다 → 구별법 예측
//   deadsea   L2 — 사해: 스틱맨을 눌러 넣어도 뿅 떠오름 → 까닭 예측
//   cocoa     L3 — 코코아에 설탕: 어느 순간부터 바닥에 쌓임 → 더 녹이는 법 예측
//   fishmouth L4 — 한여름 연못: 해를 올리면 물고기가 수면에서 뻐끔 → 까닭 예측
//   gallium   L5 — 손바닥 위 갈륨 동전: 꾹 쥐고 있으면 녹아내림 → 까닭 예측(갈륨은 도입에서 소개)
//   milkzoom  L6 — 우유 확대: 렌즈로 보면 물·지방·단백질 알갱이 → 순물질일까 예측
//   soysauce  L7 — 간장+올리브유: 흔들어도 가만두면 두 층 → 분리법 예측
//   syrup     L8 — 냉장고 속 시럽병: 문을 열면 흰 결정이 반짝 → 까닭 예측
//   perfume   L9 — 장미 향 솥: 불을 지피면 김이 관을 타고 방울방울 → 원리 예측

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;

// ── L1: 백금 반지 vs 은반지 ─────────────────────────────────
function ringsSvg(): string {
  const ring = (id: string, cx: number): string => `
    <g class="hc-ring" data-r="${id}" style="cursor:pointer">
      <circle cx="${cx}" cy="92" r="40" fill="transparent" pointer-events="all"/>
      <ellipse cx="${cx}" cy="128" rx="34" ry="7" fill="#2A3A5E" opacity=".11"/>
      <g class="hc-ring-spin">
        <circle cx="${cx}" cy="92" r="30" fill="none" stroke="url(#hc-metal)" stroke-width="11"/>
        <circle cx="${cx}" cy="92" r="30" fill="none" stroke="#7C8698" stroke-width="1.4" opacity=".7"/>
        <circle cx="${cx}" cy="92" r="19" fill="none" stroke="#8A94A6" stroke-width="1.2" opacity=".5"/>
        <path d="M${cx - 16} ${cx === 78 ? 74 : 74}q6-8 16-9" stroke="#FFFFFF" stroke-width="4" opacity=".8" fill="none"/>
      </g>
      <g class="hc-sparkle" fill="#FFFFFF" opacity="0">
        <path d="M${cx + 20} 66l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4z"/>
      </g>
    </g>`;
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hc-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F4F7FB"/><stop offset=".5" stop-color="#C9D2DE"/><stop offset="1" stop-color="#9AA6B6"/>
      </linearGradient>
    </defs>
    <rect x="12" y="120" width="216" height="18" rx="9" fill="rgba(120,140,170,.14)"/>
    ${ring("a", 78)}
    ${ring("b", 162)}
    <text x="78" y="146" text-anchor="middle" font-size="11" font-weight="700" fill="#8B95A1">? ? ?</text>
    <text x="162" y="146" text-anchor="middle" font-size="11" font-weight="700" fill="#8B95A1">? ? ?</text>
  </svg>`;
}

export function renderRings(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hc-rings", attrs: { role: "img", "aria-label": "똑같이 생긴 반지 두 개" } });
  fig.innerHTML = ringsSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "하나는 <b>백금</b>, 하나는 <b>은</b> 반지예요. 반지를 <b>탭해서 굴려</b> 보세요!";

  const spun = new Set<string>();
  let timer = 0;
  fig.addEventListener("click", (e) => {
    const g = (e.target as Element).closest(".hc-ring") as SVGGElement | null;
    if (!g || spun.size === 2) return;
    const id = g.dataset.r!;
    haptic(HAPTIC.tap);
    g.classList.remove("spin");
    void (g as unknown as HTMLElement).offsetWidth;
    g.classList.add("spin");
    if (!spun.has(id)) {
      spun.add(id);
      if (spun.size === 1) helper.innerHTML = "반짝— 은백색이네요. <b>다른 쪽</b>도 굴려 봐요.";
      if (spun.size === 2) {
        face("surprised");
        helper.innerHTML = "굴려 봐도 <b>색도 광택도 똑같아요</b>! 겉모습 말고, 뭘 비교해야 할까요?";
        timer = window.setTimeout(() => {
          face("curious");
          ask(choicesBox, helper, {
            choices: s.choices ?? ["같은 부피일 때 질량이 다른지 잰다", "돋보기로 색을 더 자세히 본다", "두드려서 소리를 비교한다"],
            good: "좋은 예측이에요! 양이 아니라 <b>물질 고유의 성질</b>을 재야 해요 — 실험실에서 확인!",
            bad: "색과 소리로는 이 둘을 못 갈라요 — 방금 굴려 봤듯 겉모습이 똑같거든요. 열쇠는 <b>같은 부피일 때의 질량</b> 같은 고유 성질! 실험실에서 확인해요.",
            onDone: finish,
          });
        }, 800);
      }
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L2: 사해에 둥둥 ─────────────────────────────────────────
function deadseaSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hc-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7FC4E8"/><stop offset="1" stop-color="#4A88C0"/>
      </linearGradient>
      <linearGradient id="hc-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFE8C8"/><stop offset="1" stop-color="#FFD4A8"/>
      </linearGradient>
    </defs>
    <rect x="10" y="14" width="220" height="76" rx="10" fill="url(#hc-sky)" opacity=".5"/>
    <circle cx="204" cy="34" r="13" fill="#FFC24D"/>
    <circle cx="204" cy="34" r="18" fill="#FFC24D" opacity=".25"/>
    <rect x="10" y="86" width="220" height="70" rx="10" fill="url(#hc-sea)" opacity=".8"/>
    <path class="hc-wave" d="M14 90q14 5 28 0t28 0 28 0 28 0 28 0 28 0 28 0" stroke="#DFF2FC" stroke-width="2" opacity=".8"/>
    <g class="hc-salt" fill="#FFFFFF" opacity=".9">
      <path d="M26 148l4-4 4 4-4 4zM40 150l3-3 3 3-3 3zM206 146l4-4 4 4-4 4z"/>
    </g>
    <!-- 둥둥 뜬 스틱맨(손그림 라인) + 신문 -->
    <g class="hc-floatman">
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="96" cy="84" r="9" fill="#FFFFFF"/>
        <path d="M104 88q18 0 34 1" />
        <path d="M138 89q10 6 18 2"/>
        <path d="M112 90l8-10M126 90l7-9"/>
      </g>
      <g class="hc-news" transform="rotate(-18 122 70)">
        <rect x="112" y="60" width="22" height="16" rx="2" fill="#FFF8EC" stroke="#C9BFA8" stroke-width="1.3"/>
        <path d="M115 65h16M115 69h16M115 73h10" stroke="#B9AE94" stroke-width="1.2"/>
      </g>
      <path d="M92 76q2-3 6-3" stroke="#3C4654" stroke-width="2"/>
    </g>
  </svg>`;
}

export function renderDeadsea(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hc-deadsea",
    attrs: { role: "button", tabindex: "0", "aria-label": "사해에 뜬 사람을 눌러 물에 넣어 보기" },
  });
  fig.innerHTML = deadseaSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "여기는 소금 호수 <b>사해</b>. 신문을 읽으며 둥둥— <b>꾹 눌러서</b> 물에 넣어 보세요!";

  let dunks = 0;
  let timer = 0;
  let locked = false;
  const press = (): void => {
    if (locked) return;
    fig.classList.add("dunk");
    haptic(HAPTIC.tap);
  };
  const release = (): void => {
    if (locked || !fig.classList.contains("dunk")) return;
    fig.classList.remove("dunk");
    fig.classList.remove("bob");
    void fig.offsetWidth;
    fig.classList.add("bob");
    dunks++;
    if (dunks === 1) {
      face("surprised");
      helper.innerHTML = "뿅! 밀어 넣어도 <b>바로 떠올라요</b>. 한 번 더!";
    } else if (dunks >= 2) {
      locked = true;
      face("curious");
      helper.innerHTML = "수영을 못해도 가라앉질 않아요. <b>왜 그럴까요?</b>";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? ["소금물이라 물보다 밀도가 커서", "사해의 물이 특별히 따뜻해서", "바람이 아래에서 받쳐 줘서"],
          good: "바로 그거예요! 소금이 잔뜩 녹아 <b>밀도가 큰 물</b> — 사람이 그 위에 떠요. 실험실에서 확인!",
          bad: "온도나 바람 때문이 아니에요 — 비밀은 물에 잔뜩 녹은 <b>소금</b>! 소금물은 밀도가 커서 사람이 위에 떠요. 실험실에서 확인해요.",
          onDone: finish,
        });
      }, 700);
    }
  };
  fig.addEventListener("pointerdown", press);
  fig.addEventListener("pointerup", release);
  fig.addEventListener("pointercancel", release);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      press();
      window.setTimeout(release, 420);
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L3: 코코아에 설탕 붓기 ──────────────────────────────────
function cocoaSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hc-cocoa" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8A5A3A"/><stop offset="1" stop-color="#5E3A22"/>
      </linearGradient>
      <linearGradient id="hc-mug" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFF4F8"/><stop offset=".55" stop-color="#F3CFE0"/><stop offset="1" stop-color="#D898BC"/>
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="150" rx="56" ry="7" fill="#2A3A5E" opacity=".12"/>
    <g>
      <path d="M74 66h92v62a18 18 0 0 1-18 18h-56a18 18 0 0 1-18-18z" fill="url(#hc-mug)" stroke="#B4749A" stroke-width="1.6"/>
      <path d="M166 78h12a14 14 0 0 1 0 28h-12" stroke="#B4749A" stroke-width="6" fill="none"/>
      <ellipse cx="120" cy="66" rx="46" ry="10" fill="url(#hc-cocoa)" stroke="#4A2C18" stroke-width="1.5"/>
      <path d="M84 58q8-6 16-2" stroke="#FFFFFF" stroke-width="3" opacity=".55"/>
      <g class="hc-steam" stroke="#D8E4F0" stroke-width="2.4" opacity=".7">
        <path d="M104 46q-4-8 2-14M124 44q-4-8 2-14M144 46q-4-8 2-14"/>
      </g>
    </g>
    <g class="hc-pile" fill="#FFFFFF">
      <ellipse class="hc-pile1" cx="120" cy="70" rx="0" ry="0"/>
    </g>
    <g class="hc-spoonfall" opacity="0">
      <circle cx="116" cy="40" r="1.8" fill="#FFF"/><circle cx="122" cy="34" r="1.5" fill="#FFF"/><circle cx="126" cy="44" r="1.6" fill="#FFF"/>
    </g>
  </svg>`;
}

export function renderCocoa(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hc-cocoa", attrs: { role: "img", "aria-label": "코코아 잔" } });
  fig.innerHTML = cocoaSvg();
  const btn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "설탕 한 숟갈 넣기" }));
  const row = el("div", { class: "gp-controls" }, btn);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, row, choicesBox);
  helper.innerHTML = "차가운 코코아가 심심해요. <b>설탕</b>을 넣어 볼까요?";

  let n = 0;
  let timer = 0;
  const pile = (): SVGEllipseElement | null => fig.querySelector(".hc-pile1");
  btn.addEventListener("click", () => {
    if (n >= 5) return;
    n++;
    haptic(HAPTIC.tap);
    fig.classList.remove("pour");
    void fig.offsetWidth;
    fig.classList.add("pour");
    if (n <= 2) {
      helper.innerHTML = n === 1 ? "스르륵— <b>잘 녹아요</b>. 한 숟갈 더!" : "아직도 잘 녹네요. 계속!";
    } else {
      const p = pile();
      if (p) {
        p.setAttribute("rx", String(10 + (n - 3) * 7));
        p.setAttribute("ry", String(2.4 + (n - 3) * 1.4));
      }
      if (n === 3) {
        face("surprised");
        helper.innerHTML = "어라? 이제 <b>바닥에 쌓이기 시작</b>해요. 더 넣어도 소용없을까요?";
      }
      if (n >= 5) {
        (btn as HTMLButtonElement).disabled = true;
        face("curious");
        helper.innerHTML = "아무리 저어도 <b>더는 안 녹아요</b>. 남은 설탕까지 녹이려면 어떻게 해야 할까요?";
        timer = window.setTimeout(() => {
          ask(choicesBox, helper, {
            choices: s.choices ?? ["코코아를 따뜻하게 데운다", "숟가락으로 더 세게 젓는다", "더 큰 컵에 옮겨 담는다"],
            good: "좋은 예측! <b>녹는 양의 한계</b>가 온도에 따라 정말 달라지는지 — 실험실에서 확인해요!",
            bad: "세게 젓거나 컵을 바꿔도 한계는 그대로예요 — 젓기는 빨리 녹게 할 뿐, 더 많이 녹게 하진 못해요. 열쇠는 <b>온도</b>! 실험실에서 확인해요.",
            onDone: finish,
          });
        }, 800);
      }
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L4: 한여름 연못, 뻐끔거리는 물고기 ──────────────────────
function fishSvg(): string {
  const fish = (cls: string, x: number, y: number, s2: number, flip = false): string => `
    <g class="${cls}" transform="translate(${x} ${y}) scale(${flip ? -s2 : s2} ${s2})">
      <path d="M0 0q8-7 18-1 6 4 1 8-9 5-19-1 4-3 0-6z" fill="url(#hc-fish)" stroke="#B4562E" stroke-width="1.2"/>
      <path d="M19 2l7-5-1 7 1 6-7-5" fill="url(#hc-fish)" stroke="#B4562E" stroke-width="1.2"/>
      <circle cx="5" cy="1.6" r="1.3" fill="#3A2418"/>
    </g>`;
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hc-pond" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6FB4DC"/><stop offset="1" stop-color="#37648F"/>
      </linearGradient>
      <linearGradient id="hc-fish" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFB37C"/><stop offset="1" stop-color="#E07038"/>
      </linearGradient>
    </defs>
    <g class="hc-sun2" style="cursor:grab">
      <circle cx="52" cy="118" r="15" fill="#FFC24D"/>
      <circle cx="52" cy="118" r="22" fill="#FFC24D" opacity=".22"/>
      <g stroke="#FFC24D" stroke-width="2.4">
        <path d="M52 96v-8M52 148v-6M30 118h-8M74 118h6M37 103l-6-6M67 103l6-6M37 133l-6 6M67 133l6 6"/>
      </g>
    </g>
    <rect x="10" y="76" width="220" height="82" rx="10" fill="url(#hc-pond)" opacity=".85"/>
    <path d="M14 80q14 5 28 0t28 0 28 0 28 0 28 0 28 0 28 0" stroke="#D8EEFA" stroke-width="2" opacity=".8"/>
    ${fish("hc-fish-a", 88, 128, 1.15)}
    ${fish("hc-fish-b", 156, 138, 0.95, true)}
    ${fish("hc-fish-c", 122, 120, 0.8)}
    <g class="hc-bubbles" fill="#EAF6FF" opacity="0">
      <circle cx="96" cy="86" r="2.4"/><circle cx="104" cy="82" r="1.7"/><circle cx="150" cy="86" r="2.2"/><circle cx="128" cy="84" r="1.8"/>
    </g>
  </svg>`;
}

export function renderFishmouth(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hc-fishpond",
    attrs: { role: "slider", tabindex: "0", "aria-label": "해를 위로 끌어 올려 한낮 만들기", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" },
  });
  fig.innerHTML = fishSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "아침의 연못이에요. <b>해를 위로 끌어 올려</b> 한여름 대낮을 만들어 보세요!";

  const sun = fig.querySelector(".hc-sun2") as SVGGElement;
  let dragging = false;
  let lastY = 0; // iOS는 movementY를 지원하지 않아 직접 추적
  let heat = 0; // 0..1
  let done = false;
  let timer = 0;
  const apply = (): void => {
    const dy = -74 * heat;
    sun.setAttribute("transform", `translate(0 ${dy})`);
    fig.setAttribute("aria-valuenow", String(Math.round(heat * 100)));
    fig.style.setProperty("--heat", String(heat));
    if (heat > 0.85 && !done) {
      done = true;
      fig.classList.add("noon");
      face("surprised");
      haptic(HAPTIC.correct);
      helper.innerHTML = "물이 뜨끈해지자 물고기들이 <b>수면으로 올라와 뻐끔뻐끔</b>! 왜 그럴까요?";
      timer = window.setTimeout(() => {
        face("curious");
        ask(choicesBox, helper, {
          choices: s.choices ?? ["물이 따뜻해지면 녹아 있던 산소가 줄어들어서", "물고기가 햇볕을 쬐고 싶어서", "수면의 먹이가 많아져서"],
          good: "예리해요! 온도가 오르면 <b>기체가 물에 덜 녹아요</b> — 산소가 부족해진 거예요. 실험실로!",
          bad: "햇볕도 먹이도 아니에요 — 물이 따뜻해지면 <b>산소가 물에 덜 녹아서</b> 숨쉬기가 힘들어진 거예요. 그래서 산소가 많은 수면으로! 실험실에서 확인해요.",
          onDone: finish,
        });
      }, 900);
    }
  };
  const onDown = (e: PointerEvent): void => {
    dragging = true;
    lastY = e.clientY;
    fig.setPointerCapture?.(e.pointerId);
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging || done) return;
    const dy = lastY - e.clientY; // 위로 끌면 양수
    lastY = e.clientY;
    heat = Math.min(1, Math.max(heat, heat + dy / 130));
    apply();
  };
  const onUp = (): void => {
    dragging = false;
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowUp") {
      heat = Math.min(1, heat + 0.2);
      apply();
      e.preventDefault();
    }
  };
  fig.addEventListener("pointerdown", onDown);
  fig.addEventListener("pointermove", onMove);
  fig.addEventListener("pointerup", onUp);
  fig.addEventListener("pointercancel", onUp);
  fig.addEventListener("keydown", onKey);
  return () => window.clearTimeout(timer);
}

// ── L5: 손바닥 위 갈륨 동전 ─────────────────────────────────
// 위에서 내려다본 펼친 손(스틱맨 라인 문법) 위에 은색 동전 — 동그란 동전이라
// 형태가 즉시 읽힌다. 갈륨이라는 이름은 도입 문구에서 먼저 소개한다(맥락 규칙).
function galliumSvg(): string {
  const finger = (x: number, len: number): string =>
    `<path d="M${x} 106 v-${len} a7.5 7.5 0 0 1 15 0 v${len} z" fill="#FFFFFF" stroke="#3C4654" stroke-width="2.4"/>`;
  // 동전 테두리 톱니(테두리 돌기) — 원 둘레를 따라 짧은 눈금
  const ridges = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2;
    const x1 = 112 + Math.cos(a) * 24.5;
    const y1 = 124 + Math.sin(a) * 18.5;
    const x2 = 112 + Math.cos(a) * 27;
    const y2 = 124 + Math.sin(a) * 20.5;
    return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
  }).join("");
  return `<svg viewBox="0 0 240 176" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hc-ga" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F8FBFF"/><stop offset=".5" stop-color="#C6D4E4"/><stop offset="1" stop-color="#93A6BC"/>
      </linearGradient>
    </defs>
    <ellipse cx="118" cy="166" rx="58" ry="6" fill="#2A3A5E" opacity=".12"/>
    <!-- 손(위에서 본 모습): 손가락 4개 → 엄지 → 손바닥 → 손목 순서로 겹쳐 그리기 -->
    <g class="hc-hand">
      ${finger(76, 34)}${finger(95, 44)}${finger(114, 40)}${finger(133, 30)}
      <!-- 엄지(왼쪽에서 비스듬히) -->
      <path d="M62 132 l-20 -14 a8 8 0 0 1 10 -12 l20 14 z" fill="#FFFFFF" stroke="#3C4654" stroke-width="2.4"/>
      <!-- 손바닥(손가락 밑동을 덮는다) -->
      <path d="M70 106 h80 q6 22 -4 38 q-8 14 -36 14 t-36 -14 q-10 -16 -4 -38 z" fill="#FFFFFF" stroke="#3C4654" stroke-width="2.6"/>
      <!-- 손금 두 줄 -->
      <path d="M86 124 q18 10 42 4 M92 140 q14 7 34 2" stroke="#8B95A1" stroke-width="1.6" opacity=".8"/>
      <!-- 손목 -->
      <path d="M96 158 q14 6 28 0 l3 12 q-17 6 -34 0 z" fill="#FFFFFF" stroke="#3C4654" stroke-width="2.4"/>
    </g>
    <!-- 갈륨 동전: 손바닥 한가운데(살짝 기운 원반 + 테두리 톱니 + 안쪽 면 + 별 문양) -->
    <g class="hc-spoon">
      <g class="hc-spoon-solid">
        <ellipse cx="112" cy="127" rx="27" ry="20.5" fill="#8FA2B8"/>
        <ellipse cx="112" cy="124" rx="27" ry="20.5" fill="url(#hc-ga)" stroke="#6E7E92" stroke-width="1.6"/>
        <g stroke="#7C8EA4" stroke-width="1.2">${ridges}</g>
        <ellipse cx="112" cy="124" rx="19" ry="14" fill="none" stroke="#A8B8CC" stroke-width="1.3"/>
        <path d="M112 116l2.6 5.4 6 .9-4.3 4.2 1 5.9-5.3-2.8-5.3 2.8 1-5.9-4.3-4.2 6-.9z" fill="#DFE9F4" stroke="#8FA2B8" stroke-width="1"/>
        <ellipse cx="102" cy="114" rx="9" ry="4.6" fill="#FFFFFF" opacity=".75" transform="rotate(-18 102 114)"/>
      </g>
      <!-- 녹은 웅덩이: 손바닥 굴곡을 따라 퍼지고, 방울이 또르르 -->
      <g class="hc-spoon-melt" opacity="0">
        <path class="hc-melt-blob" d="M82 122 q20 -12 56 -4 q12 3 8 10 q-6 10 -34 12 q-26 2 -34 -8 q-4 -6 4 -10z" fill="url(#hc-ga)" stroke="#6E7E92" stroke-width="1.4"/>
        <ellipse cx="98" cy="124" rx="8" ry="3.2" fill="#FFFFFF" opacity=".8"/>
        <circle cx="104" cy="146" r="3.2" fill="url(#hc-ga)" stroke="#6E7E92" stroke-width="1"/>
        <circle cx="122" cy="103" r="2.4" fill="url(#hc-ga)" stroke="#6E7E92" stroke-width="1"/>
      </g>
    </g>
    <g class="hc-heatwave" stroke="#FFB37C" stroke-width="2" opacity="0">
      <path d="M56 96q4-6 0-12M170 120q4-6 0-12"/>
    </g>
  </svg>`;
}

export function renderGallium(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hc-gallium",
    attrs: { role: "button", tabindex: "0", "aria-label": "동전을 꾹 쥐고 있기" },
  });
  fig.innerHTML = galliumSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "<b>갈륨</b>이라는 금속으로 만든 동전을 손 위에 올렸어요. <b>꾹 누른 채 잠시 기다려</b> 보세요.";

  let hold = 0;
  let raf = 0;
  let holding = false;
  let done = false;
  let timer = 0;
  const tick = (): void => {
    if (holding && !done) {
      hold = Math.min(1, hold + 0.014);
      fig.style.setProperty("--melt", String(hold));
      if (hold > 0.25) fig.classList.add("warming");
      if (hold >= 1) {
        done = true;
        fig.classList.add("melted");
        face("surprised");
        haptic(HAPTIC.correct);
        helper.innerHTML = "사르르— 갈륨 동전이 <b>손바닥 위에서 녹아</b> 버렸어요! 철 동전은 멀쩡한데, 왜죠?";
        timer = window.setTimeout(() => {
          face("curious");
          ask(choicesBox, helper, {
            choices: s.choices ?? ["갈륨의 녹는점이 체온보다 낮아서", "손에 힘을 너무 세게 줘서", "손바닥의 땀에 녹은 것이라서"],
            good: "정확해요! 갈륨의 <b>녹는점은 약 30 °C</b> — 체온(36.5 °C)이면 충분히 녹아요. 실험실로!",
            bad: "힘도 땀도 금속을 못 녹여요 — 갈륨은 <b>녹는점이 약 30 °C</b>라서 체온(36.5 °C)만으로 녹은 거예요. 물질마다 녹는점이 달라요. 실험실로!",
            onDone: finish,
          });
        }, 900);
      }
    } else if (!holding && !done) {
      hold = Math.max(0, hold - 0.03);
      fig.style.setProperty("--melt", String(hold));
      if (hold < 0.2) fig.classList.remove("warming");
    }
    raf = requestAnimationFrame(tick);
  };
  const down = (): void => {
    holding = true;
    haptic(HAPTIC.tap);
  };
  const up = (): void => {
    holding = false;
  };
  fig.addEventListener("pointerdown", down);
  fig.addEventListener("pointerup", up);
  fig.addEventListener("pointercancel", up);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      holding = true;
    }
  });
  fig.addEventListener("keyup", () => {
    holding = false;
  });
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(timer);
  };
}

// ── L6: 우유 확대경 ─────────────────────────────────────────
function milkSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hc-milk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8E4DC"/>
      </linearGradient>
      <radialGradient id="hc-lens" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#F4FAFF" stop-opacity=".2"/><stop offset=".85" stop-color="#D6EBFA" stop-opacity=".35"/><stop offset="1" stop-color="#9CC0DE" stop-opacity=".6"/>
      </radialGradient>
    </defs>
    <ellipse cx="104" cy="152" rx="46" ry="6" fill="#2A3A5E" opacity=".12"/>
    <g>
      <path d="M72 58h64v74a12 12 0 0 1-12 12H84a12 12 0 0 1-12-12z" fill="rgba(214,235,250,.28)" stroke="#B8D6EC" stroke-width="1.8"/>
      <path d="M76 84h56v48a10 10 0 0 1-10 10H86a10 10 0 0 1-10-10z" fill="url(#hc-milk)"/>
      <ellipse cx="104" cy="84" rx="28" ry="6" fill="#FFFFFF" stroke="#D8D2C6" stroke-width="1"/>
      <path d="M80 66q6-4 12-2" stroke="#FFFFFF" stroke-width="3" opacity=".8"/>
    </g>
    <!-- 확대경(탭 시 등장하는 내부 알갱이) -->
    <g class="hc-lensview" opacity="0">
      <circle cx="164" cy="84" r="44" fill="url(#hc-lens)" stroke="#8FB3D6" stroke-width="2.4"/>
      <g class="hc-drops">
        <circle cx="150" cy="72" r="8" fill="#FFF4C8" stroke="#D8B84A" stroke-width="1.2"/>
        <circle cx="178" cy="96" r="6" fill="#FFF4C8" stroke="#D8B84A" stroke-width="1.2"/>
        <circle cx="170" cy="66" r="4" fill="#FFE9EE" stroke="#D890A8" stroke-width="1.2"/>
        <circle cx="152" cy="98" r="4.6" fill="#FFE9EE" stroke="#D890A8" stroke-width="1.2"/>
        <circle cx="166" cy="84" r="2.6" fill="#CFE6F8" stroke="#88AECE" stroke-width="1"/>
        <circle cx="184" cy="78" r="2.2" fill="#CFE6F8" stroke="#88AECE" stroke-width="1"/>
      </g>
      <path d="M196 116l16 16" stroke="#8FB3D6" stroke-width="7"/>
    </g>
  </svg>`;
}

export function renderMilkzoom(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hc-milk", attrs: { role: "button", tabindex: "0", "aria-label": "우유를 확대경으로 보기" } });
  fig.innerHTML = milkSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "새하얀 우유 한 잔. 우유는 <b>한 가지 물질</b>일까요? <b>탭해서 확대경</b>으로 들여다봐요!";

  let zoomed = false;
  let timer = 0;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.tap);
    fig.classList.add("zoom");
    face("surprised");
    helper.innerHTML = "우와 — 물속에 <b>지방 방울, 단백질 알갱이</b>가 잔뜩! 겉은 하나처럼 보였는데요.";
    timer = window.setTimeout(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? ["여러 물질이 섞여 있는 혼합물이다", "우유라는 한 가지 순물질이다", "물이 하얗게 변한 것이다"],
        good: "맞아요! 우유는 물·지방·단백질이 <b>제 성질을 지닌 채 섞인</b> 혼합물이에요. 실험실로!",
        bad: "확대경을 다시 봐요 — 방울과 알갱이가 <b>따로따로</b> 보였죠? 우유는 한 가지 물질이 아니라 물·지방·단백질이 섞인 <b>혼합물</b>이에요. 실험실로!",
        onDone: finish,
      });
    }, 900);
  };
  fig.addEventListener("click", zoom);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      zoom();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L7: 간장 + 올리브유 흔들기 ──────────────────────────────
function sauceSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hc-oil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2C14E"/>
      </linearGradient>
      <linearGradient id="hc-soy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6B4226"/><stop offset="1" stop-color="#3E2412"/>
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="154" rx="40" ry="6" fill="#2A3A5E" opacity=".12"/>
    <g class="hc-bottle">
      <path d="M106 34h28v12l8 10v84a12 12 0 0 1-12 12h-20a12 12 0 0 1-12-12V56l8-10z" fill="rgba(224,238,250,.25)" stroke="#B8D6EC" stroke-width="1.8"/>
      <rect x="104" y="22" width="32" height="12" rx="4" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.4"/>
      <!-- 섞임 상태(에멀션) -->
      <g class="hc-mixed">
        <rect x="100" y="62" width="40" height="86" rx="9" fill="#8A6A3E"/>
        <g fill="#FFE9A8" opacity=".85">
          <circle cx="110" cy="76" r="3.4"/><circle cx="126" cy="86" r="2.6"/><circle cx="116" cy="102" r="3"/>
          <circle cx="130" cy="116" r="3.4"/><circle cx="108" cy="126" r="2.4"/><circle cx="122" cy="138" r="3"/>
        </g>
      </g>
      <!-- 분리 상태(위 기름 / 아래 간장) -->
      <g class="hc-split" opacity="0">
        <rect x="100" y="62" width="40" height="34" rx="9" fill="url(#hc-oil)"/>
        <rect x="100" y="96" width="40" height="52" rx="9" fill="url(#hc-soy)"/>
        <path d="M101 96h38" stroke="#FFF0C0" stroke-width="1.6" opacity=".9"/>
      </g>
      <ellipse cx="112" cy="70" rx="5" ry="14" fill="#FFFFFF" opacity=".28" transform="rotate(8 112 70)"/>
    </g>
  </svg>`;
}

export function renderSoysauce(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hc-sauce", attrs: { role: "button", tabindex: "0", "aria-label": "병 흔들기" } });
  fig.innerHTML = sauceSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "간장과 올리브유를 한 병에 넣었어요. <b>톡톡 두드려 마구 흔들어</b> 섞어 보세요!";

  let shakes = 0;
  let settled = false;
  let t1 = 0;
  let t2 = 0;
  const shake = (): void => {
    if (settled) return;
    shakes++;
    haptic(HAPTIC.tap);
    fig.classList.remove("shake");
    void fig.offsetWidth;
    fig.classList.add("shake");
    window.clearTimeout(t1);
    if (shakes >= 3) {
      settled = true;
      helper.innerHTML = "뿌옇게 섞였어요! 이제 <b>가만히 두고</b> 지켜봐요…";
      t1 = window.setTimeout(() => {
        fig.classList.add("settle");
        face("surprised");
        haptic(HAPTIC.correct);
        helper.innerHTML = "스르륵— 다시 <b>두 층으로</b>! 기름은 위, 간장은 아래. 따로 담으려면 어떻게 할까요?";
        t2 = window.setTimeout(() => {
          face("curious");
          ask(choicesBox, helper, {
            choices: s.choices ?? ["아래층부터 조심히 따라 낸다", "다시 세게 흔들어 섞는다", "빨대로 가운데를 뽑는다"],
            good: "좋은 감각이에요! <b>밀도 차</b>로 나뉜 두 층 — 분별 깔때기로 아래층부터! 실험실로!",
            bad: "흔들면 도로 섞이고, 가운데를 뽑으면 두 층이 함께 딸려 와요 — 이미 <b>밀도 차</b>로 나뉜 층을 살려서 <b>아래층부터</b> 받아 내는 게 정석! 실험실로!",
            onDone: finish,
          });
        }, 1000);
      }, 1400);
    } else {
      helper.innerHTML = "더 세게! 톡톡 <b>몇 번 더</b> 흔들어요!";
    }
  };
  fig.addEventListener("click", shake);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      shake();
    }
  });
  return () => {
    window.clearTimeout(t1);
    window.clearTimeout(t2);
  };
}

// ── L8: 냉장고 속 시럽병 ────────────────────────────────────
function syrupSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hc-fridge" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#F2F7FC"/><stop offset="1" stop-color="#CBD8E4"/>
      </linearGradient>
      <linearGradient id="hc-syr" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFD98C"/><stop offset="1" stop-color="#E8A83E"/>
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="158" rx="66" ry="6" fill="#2A3A5E" opacity=".12"/>
    <!-- 냉장고 -->
    <rect x="58" y="16" width="124" height="140" rx="12" fill="url(#hc-fridge)" stroke="#9AAaba" stroke-width="1.8"/>
    <g class="hc-door">
      <rect x="58" y="16" width="124" height="140" rx="12" fill="url(#hc-fridge)" stroke="#9AAABA" stroke-width="1.8"/>
      <rect x="166" y="66" width="6" height="34" rx="3" fill="#8C99A8"/>
    </g>
    <!-- 내부 -->
    <g class="hc-inside" opacity="0">
      <rect x="64" y="22" width="112" height="128" rx="9" fill="#EDF4FA" stroke="#C2D2E0" stroke-width="1.4"/>
      <path d="M66 70h108M66 116h108" stroke="#C2D2E0" stroke-width="2"/>
      <g class="hc-cold" stroke="#9CC6E4" stroke-width="1.6" opacity=".8">
        <path d="M78 30l6 6M84 30l-6 6M156 34l6 6M162 34l-6 6"/>
      </g>
      <!-- 시럽병 + 바닥 결정 -->
      <g>
        <path d="M104 78h30v6l5 6v22a8 8 0 0 1-8 8h-24a8 8 0 0 1-8-8V90l5-6z" fill="url(#hc-syr)" stroke="#B07E22" stroke-width="1.5"/>
        <rect x="102" y="70" width="34" height="9" rx="3" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.3"/>
        <g class="hc-crystals" fill="#FFF6DE" stroke="#D8B84A" stroke-width="1">
          <path d="M104 114l4-5 4 5-4 4zM114 116l3-4 3 4-3 3zM124 114l4-5 4 5-4 4z"/>
        </g>
        <ellipse cx="110" cy="88" rx="4" ry="9" fill="#FFFFFF" opacity=".4" transform="rotate(10 110 88)"/>
      </g>
    </g>
    <g class="hc-sparkle2" fill="#FFFFFF" opacity="0">
      <path d="M140 106l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2z"/>
    </g>
  </svg>`;
}

export function renderSyrup(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hc-syrup", attrs: { role: "button", tabindex: "0", "aria-label": "냉장고 문 열기" } });
  fig.innerHTML = syrupSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "어제 만든 <b>설탕 시럽</b>을 냉장고에 넣어 뒀어요. <b>문을 열어</b> 볼까요?";

  let opened = false;
  let timer = 0;
  const open = (): void => {
    if (opened) return;
    opened = true;
    haptic(HAPTIC.tap);
    fig.classList.add("open");
    face("surprised");
    helper.innerHTML = "어라? 병 바닥에 <b>흰 알갱이</b>가 자라 있어요! 분명 다 녹였는데…";
    timer = window.setTimeout(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? ["차가워지자 녹을 수 있는 양이 줄어서", "설탕이 상해서 굳은 것이라서", "물이 증발해 시럽이 마른 것이라서"],
        good: "정확해요! 온도가 내려가면 <b>용해도가 작아져</b> 넘친 설탕이 결정으로 — 이게 <b>석출</b>이에요!",
        bad: "상하거나 마른 게 아니에요 — 밀폐된 병인데도 생겼잖아요? 차가워지며 <b>녹을 수 있는 한계(용해도)가 줄어</b> 넘친 설탕이 결정으로 나온 거예요. 이게 <b>석출</b>!",
        onDone: finish,
      });
    }, 900);
  };
  fig.addEventListener("click", open);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      open();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L9: 장미 향 솥(증류로 향수 만들기) ──────────────────────
function perfumeSvg(): string {
  return `<svg viewBox="0 0 240 176" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hc-pot" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#D8A46A"/><stop offset=".55" stop-color="#B5763A"/><stop offset="1" stop-color="#8C531E"/>
      </linearGradient>
      <linearGradient id="hc-vial" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFD7E4"/><stop offset="1" stop-color="#F291B4"/>
      </linearGradient>
    </defs>
    <ellipse cx="86" cy="162" rx="52" ry="6" fill="#2A3A5E" opacity=".12"/>
    <ellipse cx="196" cy="162" rx="26" ry="5" fill="#2A3A5E" opacity=".12"/>
    <!-- 솥(장미꽃잎+물) -->
    <g>
      <path d="M46 92h80a0 0 0 0 1 0 0v28a40 22 0 0 1-80 0v-28z" fill="url(#hc-pot)" stroke="#5E3510" stroke-width="1.8"/>
      <ellipse cx="86" cy="92" rx="40" ry="10" fill="#7A4A18" stroke="#5E3510" stroke-width="1.6"/>
      <ellipse cx="86" cy="90" rx="34" ry="7" fill="#3E6FA8" opacity=".7"/>
      <g fill="#E86A8A">
        <circle cx="72" cy="88" r="4"/><circle cx="94" cy="86" r="3.4"/><circle cx="104" cy="90" r="3"/><circle cx="82" cy="92" r="3.2"/>
      </g>
      <ellipse cx="66" cy="104" rx="6" ry="14" fill="#FFFFFF" opacity=".18" transform="rotate(10 66 104)"/>
    </g>
    <!-- 관(솥 → 병) -->
    <path d="M120 82q34-22 62 6 8 9 8 26" stroke="#C9D4E0" stroke-width="6" opacity=".9"/>
    <path d="M120 82q34-22 62 6 8 9 8 26" stroke="#8C99A8" stroke-width="6" opacity=".35" stroke-dasharray="2 10"/>
    <!-- 김(관 위) -->
    <g class="hc-vapor" stroke="#D8E4F0" stroke-width="2.6" opacity="0">
      <path d="M128 74q-2-8 4-12M148 66q-2-8 4-12M170 68q-2-8 4-12"/>
    </g>
    <!-- 향수 병 -->
    <g>
      <path d="M184 124h24v6a12 12 0 0 1 6 10v14a10 10 0 0 1-10 10h-16a10 10 0 0 1-10-10v-14a12 12 0 0 1 6-10z" fill="rgba(224,238,250,.3)" stroke="#B8D6EC" stroke-width="1.6"/>
      <rect class="hc-fill" x="180" y="158" width="32" height="0" fill="url(#hc-vial)"/>
      <rect x="188" y="114" width="16" height="10" rx="3" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.3"/>
    </g>
    <g class="hc-dropfall" fill="#F2A4C0" opacity="0">
      <circle cx="196" cy="136" r="2.6"/>
    </g>
    <!-- 불(버튼으로 점화) -->
    <g class="hc-flame2" opacity="0">
      <path d="M80 148q-8-10 0-20 2 6 8 8-2-10 6-14 0 12 8 16 4 8-4 14-10 6-18-4z" fill="#FF9A4A" stroke="#D95F14" stroke-width="1.4"/>
      <path d="M84 146q-3-5 1-9 3 4 6 5 1 5-2 7-3 1-5-3z" fill="#FFD24A"/>
    </g>
  </svg>`;
}

export function renderPerfume(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hc-perfume", attrs: { role: "img", "aria-label": "장미 꽃잎 솥과 향수 병" } });
  fig.innerHTML = perfumeSvg();
  const btn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "불 지피기" }));
  const row = el("div", { class: "gp-controls" }, btn);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, row, choicesBox);
  helper.innerHTML = "솥 안엔 <b>장미 꽃잎과 물</b>. 옛날 방식으로 향수를 만들어 볼까요? <b>불을 지펴요!</b>";

  let lit = false;
  let fill = 0;
  let iv = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (lit) return;
    lit = true;
    (btn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.tap);
    fig.classList.add("lit");
    helper.innerHTML = "보글보글… <b>김이 관을 타고</b> 넘어가요!";
    iv = window.setInterval(() => {
      fill = Math.min(1, fill + 0.12);
      const h = 26 * fill;
      const r = fig.querySelector(".hc-fill") as SVGRectElement | null;
      if (r) {
        r.setAttribute("height", String(h));
        r.setAttribute("y", String(160 - h)); // 병 바닥(y≈160)에서 위로 차오름
      }
      fig.classList.remove("dripping");
      void fig.offsetWidth;
      fig.classList.add("dripping");
      if (fill >= 1) {
        window.clearInterval(iv);
        face("surprised");
        haptic(HAPTIC.correct);
        helper.innerHTML = "똑… 똑… 병에 <b>향기 나는 액체</b>가 모였어요! 꽃잎은 솥에 그대로인데, 어떻게 향기만 왔을까요?";
        timer = window.setTimeout(() => {
          face("curious");
          ask(choicesBox, helper, {
            choices: s.choices ?? ["향 성분이 기체가 됐다가 식어서 다시 액체가 됐다", "향기 입자가 관 속을 걸어 넘어왔다", "꽃잎이 아주 작게 부서져 넘어왔다"],
            good: "완벽한 예측! <b>기화 → 냉각(액화)</b> — 이게 바로 <b>증류</b>의 원리예요. 실험실로!",
            bad: "입자가 걸어오지도, 꽃잎이 부서져 넘어오지도 않았어요 — 김을 봤죠? 향 성분이 <b>기체가 됐다가 식어서 다시 액체</b>가 된 거예요. 이게 <b>증류</b>! 실험실로!",
            onDone: finish,
          });
        }, 1000);
      }
    }, 700);
  });
  return () => {
    window.clearInterval(iv);
    window.clearTimeout(timer);
  };
}
