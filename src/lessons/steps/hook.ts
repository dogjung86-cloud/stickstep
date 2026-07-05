// hook — 스틱맨 쌤 도입 스텝. 짧은 말풍선 + "미세 상호작용"으로 궁금증을 만든다.
// 표준 레슨 공식의 1단계: hook(도입) → 랩(핵심 상호작용) → recap(정리) → 문제.
// scene:
//   "cups"  — 겉보기에 똑같은 두 컵을 만져(눌러) 보고 온도가 다름을 발견
//   "egg"   — 갓 삶은 달걀을 찬물에 퐁당 넣고, 이후를 예측(채점 없음, 사전 예측 효과)
//   "beach" — 한여름 해변: 모래를 밟고 바닷물에 발을 담가 보고, 같은 햇볕인데 왜 다른지 궁금증
//   "wire"  — 전깃줄: 여름/겨울을 오가며 늘어짐·팽팽함을 관찰하고 까닭을 예측

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { stickAvatar, setStickAvatar, type AvatarKind } from "../../ui/avatar";
import type { StepAPI, StepRenderer } from "../types";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

/** 장면 소품 아트 — 발주 래스터(public/hooks/<name>.png)를 쓰고, 없으면 SVG로 폴백.
 *  상태 변형(뜨거움/차가움, 전/후, 계절)은 set()으로 이미지를 교체한다.
 *  폴백 SVG는 컨테이너의 상태 클래스(CSS)로 반응하므로 교체 없이 그대로 둔다. */
function sceneArt(name: string, fallback: string): { el: HTMLElement; set: (n: string) => void } {
  const wrap = el("span", { class: "hook-art" });
  let broken = false;
  const mount = (n: string): void => {
    if (broken) return;
    wrap.innerHTML = "";
    const img = el("img", { attrs: { src: `${base}hooks/${n}.png`, alt: "", "aria-hidden": "true", loading: "eager" } });
    img.addEventListener("error", () => {
      broken = true;
      wrap.innerHTML = fallback;
    });
    wrap.appendChild(img);
  };
  mount(name);
  return { el: wrap, set: mount };
}

interface HookStep {
  title: string;
  lead?: string;
  narrator: string; // 시작 말풍선(HTML)
  done?: string; // 상호작용 완료 후 말풍선(HTML)
  scene: "cups" | "egg" | "beach" | "wire";
  choices?: string[]; // egg·wire 예측 선택지
  cta?: string;
}

export const hook: StepRenderer = (host, step, api) => {
  const s = step as unknown as HookStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const bubble = el("div", { class: "comic-bubble", html: s.narrator });
  const avatar = stickAvatar("smile");
  const face = (kind: AvatarKind): void => setStickAvatar(avatar, kind);
  host.appendChild(
    el(
      "div",
      { class: "comic-narrator" },
      el("div", { class: "comic-avatar" }, avatar),
      bubble,
    ),
  );

  const scene = el("div", { class: "hook-scene" });
  const helper = el("div", { class: "helper", attrs: { role: "status", "aria-live": "polite" } });
  host.append(scene, helper);

  function finish(): void {
    if (s.done) bubble.innerHTML = s.done;
    api.enableCTA(s.cta ?? "실험실 열기");
    window.setTimeout(() => face("smile"), 900);
  }

  let sceneCleanup: (() => void) | undefined;
  if (s.scene === "cups") renderCups(scene, helper, finish, face);
  else if (s.scene === "beach") renderBeach(scene, helper, finish, face);
  else if (s.scene === "wire") renderWire(scene, helper, s, finish, face);
  else sceneCleanup = renderEgg(scene, helper, s, finish, api, face);

  api.setCTA("스틱맨 쌤과 먼저 관찰해요", { enabled: false });
  return () => sceneCleanup?.();
};

// ── 장면 1: 똑같아 보이는 두 컵 ─────────────────────────────
function cupSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- 김(뜨거움) -->
    <g class="hk-steam" stroke="#FF8A5C" stroke-width="3">
      <path d="M36 26c-3-5 3-7 0-12"/>
      <path d="M48 28c-3-5 3-7 0-13"/>
      <path d="M60 26c-3-5 3-7 0-12"/>
    </g>
    <!-- 성에·물방울(차가움) -->
    <g class="hk-frost" stroke="#5AA2F8" stroke-width="2.6">
      <path d="M30 22v10M25 27h10M26.5 23.5l7 7M33.5 23.5l-7 7"/>
      <path d="M62 20v8M58 24h8M59 21l6 6M65 21l-6 6" opacity=".8"/>
      <circle cx="28" cy="58" r="2.2" fill="#BFDCFF" stroke="none"/>
      <circle cx="70" cy="64" r="2" fill="#BFDCFF" stroke="none"/>
    </g>
    <!-- 컵(두 컵이 완전히 동일) -->
    <path d="M26 36h44l-4 44a6 6 0 0 1-6 5H36a6 6 0 0 1-6-5z" fill="#F7F9FC" stroke="#4E5968" stroke-width="3"/>
    <path d="M29.5 48h37" stroke="#C9D6E6" stroke-width="2.4"/>
    <path d="M30.5 48c4 3 12 3 17.5 0s13.5-3 17.5 0l-3 32a5 5 0 0 1-5 4.5H38.5a5 5 0 0 1-5-4.5z" fill="#DCEAFF" stroke="none" opacity=".85"/>
  </svg>`;
}

function renderCups(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: (k: AvatarKind) => void): void {
  const grid = el("div", { class: "hook-cups" });
  scene.appendChild(grid);
  helper.innerHTML = "컵을 <b>눌러서</b> 만져 보세요. 두 컵 모두요!";

  const touched = new Set<string>();
  const mk = (kind: "hot" | "cold", name: string): HTMLElement => {
    const label = el("div", { class: "hook-cup-label", text: "눌러서 만져 보기" });
    const art = sceneArt("cup-plain", cupSvg());
    const cup = el("button", { class: "hook-cup", attrs: { "aria-label": `${name} — 눌러서 만져 보기` } }, art.el, label);
    cup.addEventListener("click", () => {
      if (touched.has(kind)) return;
      touched.add(kind);
      cup.classList.add(kind);
      art.set(kind === "hot" ? "cup-hot" : "cup-cold");
      const result = kind === "hot" ? "앗, 뜨거워요! 55℃" : "얼음장이에요! 10℃";
      label.textContent = result;
      cup.setAttribute("aria-label", `${name} — ${result}`);
      haptic(kind === "hot" ? HAPTIC.wrong : HAPTIC.select);
      if (touched.size === 2) {
        face("curious");
        helper.innerHTML = "겉모습은 똑같은데 온도가 달라요. <b>무엇이 다른 걸까요?</b> 비밀은 눈에 안 보이는 곳에 있어요.";
        finish();
      } else {
        face("surprised");
        helper.innerHTML = kind === "hot" ? "뜨겁죠? 이제 <b>다른 컵</b>도 만져 보세요." : "차갑죠? 이제 <b>다른 컵</b>도 만져 보세요.";
      }
    });
    return cup;
  };
  grid.append(mk("hot", "첫 번째 컵"), mk("cold", "두 번째 컵"));
}

// ── 장면 2: 갓 삶은 달걀 퐁당 + 예측 ─────────────────────────
function eggSvg(): string {
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- 유리컵(찬물) -->
    <path d="M156 46h56l-4 66a6 6 0 0 1-6 6h-36a6 6 0 0 1-6-6z" fill="#F4F8FE" stroke="#4E5968" stroke-width="3"/>
    <path d="M160.5 62c5 3 14 3 21.5 0s16.5-3 21.5 0l-3.2 48a5 5 0 0 1-5 4.6h-26.6a5 5 0 0 1-5-4.6z" fill="#CFE4FF" stroke="none" opacity=".9"/>
    <path d="M166 40v-6M175 42v-8M184 40v-6" stroke="#5AA2F8" stroke-width="2.4" opacity=".7"/>
    <!-- 접시 + 달걀 -->
    <ellipse cx="62" cy="112" rx="40" ry="9" fill="#EDF1F6" stroke="#C4CAD2" stroke-width="2.4"/>
    <g class="hk-egg">
      <g class="hk-eggsteam" stroke="#FF8A5C" stroke-width="2.8">
        <path d="M52 66c-2.5-4.5 2.5-6 0-10.5"/>
        <path d="M62 64c-2.5-4.5 2.5-6 0-10.5"/>
        <path d="M72 66c-2.5-4.5 2.5-6 0-10.5"/>
      </g>
      <ellipse cx="62" cy="92" rx="16" ry="20" fill="#FFFDF6" stroke="#4E5968" stroke-width="3"/>
      <path d="M55 82c-2 3-3 6-3 9" stroke="#D8DEE8" stroke-width="2.4"/>
    </g>
    <!-- 첨벙 -->
    <g class="hk-splash" stroke="#5AA2F8" stroke-width="2.8">
      <path d="M164 58l-7-9M184 54v-11M204 58l7-9"/>
    </g>
  </svg>`;
}

function renderEgg(scene: HTMLElement, helper: HTMLElement, s: HookStep, finish: () => void, api: StepAPI, face: (k: AvatarKind) => void): () => void {
  const art = sceneArt("egg-before", eggSvg());
  const fig = el("button", { class: "hook-egg", attrs: { type: "button", "aria-label": "달걀을 찬물에 넣기" } }, art.el);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "김이 나는 <b>갓 삶은 달걀</b>을 눌러 찬물에 넣어 보세요.";

  let dropped = false;
  let dropTimer = 0;
  fig.addEventListener("click", () => {
    if (dropped) return;
    dropped = true;
    fig.classList.add("dropped");
    art.set("egg-after");
    (fig as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    dropTimer = window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "퐁당! 시간이 지나면 달걀과 찬물은 <b>어떻게 될까요?</b> 예상을 골라 보세요.";
      const opts = s.choices ?? ["달걀만 식는다", "물만 미지근해진다", "달걀은 식고, 물은 미지근해진다"];
      opts.forEach((label) => {
        const b = el("button", { class: "hook-choice", attrs: { "aria-pressed": "false" } , text: label });
        b.addEventListener("click", () => {
          if (choicesBox.classList.contains("locked")) return;
          choicesBox.classList.add("locked");
          haptic(HAPTIC.select);
          choicesBox.querySelectorAll(".hook-choice").forEach((x) => {
            x.classList.add(x === b ? "sel" : "dim");
            x.setAttribute("aria-pressed", x === b ? "true" : "false");
            (x as HTMLButtonElement).disabled = x !== b;
          });
          helper.innerHTML = "좋아요, 예측 완료! 정답은 알려주지 않을게요 — <b>실험으로 직접 확인</b>해 봐요.";
          finish();
        });
        choicesBox.appendChild(b);
      });
      choicesBox.classList.add("show");
      api.snack("예상을 골라 보세요");
    }, 750);
  });
  return () => window.clearTimeout(dropTimer);
}

// ── 장면 3: 한여름 해변 — 모래 밟기 vs 바닷물 담그기 ─────────
function sandSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g class="hk-steam" stroke="#FF8A5C" stroke-width="3">
      <path d="M32 44c-3-5 3-7 0-12"/>
      <path d="M48 42c-3-5 3-7 0-13"/>
      <path d="M64 44c-3-5 3-7 0-12"/>
    </g>
    <path d="M8 82Q30 56 50 62T88 82Z" fill="#F7E3B4" stroke="#C9A96A" stroke-width="3"/>
    <circle cx="34" cy="74" r="1.6" fill="#C9A96A" stroke="none"/>
    <circle cx="52" cy="70" r="1.6" fill="#C9A96A" stroke="none"/>
    <circle cx="66" cy="76" r="1.6" fill="#C9A96A" stroke="none"/>
    <path d="M20 26a8 8 0 1 1 0 .1z" fill="#FFD98A" stroke="#F5A623" stroke-width="2.4"/>
    <path d="M20 12v-5M20 45v-2M6 26H1M39 26h-5M10 16l-3.5-3.5M30 16l3.5-3.5" stroke="#F5A623" stroke-width="2.2"/>
  </svg>`;
}
function seaSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g class="hk-frost" stroke="#5AA2F8" stroke-width="2.6">
      <path d="M30 34l3 3M63 30l3 3M48 26l2.5 2.5" opacity=".9"/>
      <circle cx="26" cy="46" r="2" fill="#BFDCFF" stroke="none"/>
      <circle cx="70" cy="44" r="2" fill="#BFDCFF" stroke="none"/>
    </g>
    <path d="M8 62q10-8 20 0t20 0 20 0 20 0" stroke="#5AA2F8" stroke-width="3"/>
    <path d="M8 62q10-8 20 0t20 0 20 0 20 0V88H8Z" fill="#CFE4FF" stroke="none" opacity=".9"/>
    <path d="M14 74q8-6 16 0M50 76q8-6 16 0" stroke="#8FBBF2" stroke-width="2.4"/>
  </svg>`;
}

function renderBeach(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: (k: AvatarKind) => void): void {
  const grid = el("div", { class: "hook-cups" });
  scene.appendChild(grid);
  helper.innerHTML = "한여름 낮 12시, 해가 <b>둘 다 똑같이</b> 데우고 있어요. 모래도 밟아 보고 바닷물에도 발을 담가 보세요.";

  const touched = new Set<string>();
  const mk = (kind: "hot" | "cold", name: string, artNames: [string, string], svg: string, result: string): HTMLElement => {
    const label = el("div", { class: "hook-cup-label", text: "눌러 보기" });
    const art = sceneArt(artNames[0], svg);
    const card = el("button", { class: "hook-cup", attrs: { "aria-label": `${name} — 눌러 보기` } }, art.el, label);
    card.addEventListener("click", () => {
      if (touched.has(kind)) return;
      touched.add(kind);
      card.classList.add(kind);
      art.set(artNames[1]);
      label.textContent = result;
      card.setAttribute("aria-label", `${name} — ${result}`);
      haptic(kind === "hot" ? HAPTIC.wrong : HAPTIC.select);
      if (touched.size === 2) {
        face("curious");
        helper.innerHTML = "같은 햇볕을 똑같이 받았는데 <b>모래만 뜨거워요</b>. 두 물질이 열을 받아들이는 방식이 다른 걸까요?";
        finish();
      } else {
        face("surprised");
        helper.innerHTML = kind === "hot" ? "발바닥이 뜨끈! 이제 <b>바닷물</b>에도 발을 담가 보세요." : "시원하죠? 이제 <b>모래</b>도 밟아 보세요.";
      }
    });
    return card;
  };
  grid.append(
    mk("hot", "모래사장", ["sand", "sand-hot"], sandSvg(), "앗, 뜨거워요! 50℃"),
    mk("cold", "바닷물", ["sea", "sea-cool"], seaSvg(), "시원해요! 23℃"),
  );
}

// ── 장면 4: 전깃줄 — 여름/겨울 토글 + 예측 ───────────────────
function wireSvg(): string {
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g class="hk-sun">
      <circle cx="34" cy="26" r="11" fill="#FFD98A" stroke="#F5A623" stroke-width="2.6"/>
      <path d="M34 8v-4M34 48v-3M12 26H8M60 26h-4M19 11l-3-3M49 11l3-3" stroke="#F5A623" stroke-width="2.2"/>
    </g>
    <g class="hk-snow" stroke="#5AA2F8" stroke-width="2.4">
      <path d="M34 14v24M22 26h24M25.5 17.5l17 17M42.5 17.5l-17 17"/>
      <path d="M208 18v18M199 27h18M201.6 20.6l12.8 12.8M214.4 20.6l-12.8 12.8" opacity=".75"/>
    </g>
    <g stroke="#6B7684" stroke-width="4">
      <path d="M38 34v104M202 34v104"/>
      <path d="M24 42h28M188 42h28" stroke-width="3.4"/>
    </g>
    <path class="hk-wire-s" d="M38 46Q120 104 202 46" stroke="#4E5968" stroke-width="3.2"/>
    <path class="hk-wire-w" d="M38 46Q120 58 202 46" stroke="#4E5968" stroke-width="3.2"/>
    <path d="M6 140h228" stroke="#C4CAD2" stroke-width="2.4"/>
  </svg>`;
}

function renderWire(scene: HTMLElement, helper: HTMLElement, s: HookStep, finish: () => void, face: (k: AvatarKind) => void): void {
  const art = sceneArt("wire-summer", wireSvg());
  const fig = el(
    "div",
    {
      class: "hook-wire summer",
      attrs: { role: "img", "aria-label": "여름: 전깃줄이 축 늘어져 있어요" },
    },
    art.el,
  );
  const seg = el("div", { class: "seg" });
  const summerBtn = el("button", { class: "on", text: "여름", attrs: { type: "button", "aria-pressed": "true" } });
  const winterBtn = el("button", { text: "겨울", attrs: { type: "button", "aria-pressed": "false" } });
  seg.append(summerBtn, winterBtn);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, seg, choicesBox);
  helper.innerHTML = "지금은 <b>여름</b> — 전깃줄이 축 늘어져 있어요. <b>겨울</b>로 바꾸면 어떻게 될까요?";

  const seen = new Set<string>(["summer"]);
  let asked = false;
  const setSeason = (season: "summer" | "winter"): void => {
    if (fig.classList.contains(season)) return; // 이미 켜진 계절 — 무의미 탭 무시
    fig.classList.toggle("summer", season === "summer");
    fig.classList.toggle("winter", season === "winter");
    art.set(`wire-${season}`);
    fig.setAttribute("aria-label", season === "summer" ? "여름: 전깃줄이 축 늘어져 있어요" : "겨울: 전깃줄이 팽팽해요");
    summerBtn.classList.toggle("on", season === "summer");
    winterBtn.classList.toggle("on", season === "winter");
    summerBtn.setAttribute("aria-pressed", String(season === "summer"));
    winterBtn.setAttribute("aria-pressed", String(season === "winter"));
    haptic(HAPTIC.select);
    seen.add(season);
    if (!asked && seen.size === 2) {
      asked = true;
      face("curious");
      helper.innerHTML = "겨울엔 <b>팽팽</b>, 여름엔 <b>축 늘어짐</b> — 같은 전깃줄인데요! 왜 그럴지 예상을 골라 보세요.";
      const opts = s.choices ?? ["여름엔 전봇대 사이가 멀어져서", "전깃줄이 열을 받아 길이가 늘어나서", "여름엔 바람이 약해서"];
      opts.forEach((label) => {
        const b = el("button", { class: "hook-choice", attrs: { "aria-pressed": "false" }, text: label });
        b.addEventListener("click", () => {
          if (choicesBox.classList.contains("locked")) return;
          choicesBox.classList.add("locked");
          haptic(HAPTIC.select);
          choicesBox.querySelectorAll(".hook-choice").forEach((x) => {
            x.classList.add(x === b ? "sel" : "dim");
            x.setAttribute("aria-pressed", x === b ? "true" : "false");
            (x as HTMLButtonElement).disabled = x !== b;
          });
          helper.innerHTML = "예측 완료! 정답은 실험실에서 <b>직접</b> 확인해 봐요.";
          finish();
        });
        choicesBox.appendChild(b);
      });
      choicesBox.classList.add("show");
    } else if (!asked) {
      face("surprised");
    }
  };
  summerBtn.addEventListener("click", () => setSeason("summer"));
  winterBtn.addEventListener("click", () => setSeason("winter"));
}
