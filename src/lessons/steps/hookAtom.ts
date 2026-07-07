// hookAtom — 중2 IV(물질의 구성) 훅 장면 6종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법 준수, 상태 CSS는 ui.css의 "중2 IV 훅" 섹션.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;

function ask(box: HTMLElement, opts: string[], helper: HTMLElement, doneMsg: string, finish: () => void): void {
  opts.forEach((label) => {
    const b = el("button", { class: "hook-choice", attrs: { "aria-pressed": "false" }, text: label });
    b.addEventListener("click", () => {
      if (box.classList.contains("locked")) return;
      box.classList.add("locked");
      haptic(HAPTIC.select);
      box.querySelectorAll(".hook-choice").forEach((x) => {
        x.classList.add(x === b ? "sel" : "dim");
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
        (x as HTMLButtonElement).disabled = x !== b;
      });
      helper.innerHTML = doneMsg;
      finish();
    });
    box.appendChild(b);
  });
  box.classList.add("show");
}

// ── L1: 구리 조각 vs 소금 결정 — 확대해 보기 ─────────────────
function zoomtwoSvg(kind: "cu" | "salt"): string {
  const zoomIn =
    kind === "cu"
      ? `<g class="hc-in"><circle cx="34" cy="60" r="8" fill="url(#hcz-cu)"/><circle cx="52" cy="60" r="8" fill="url(#hcz-cu)"/><circle cx="43" cy="46" r="8" fill="url(#hcz-cu)"/><circle cx="61" cy="46" r="8" fill="url(#hcz-cu)"/><circle cx="25" cy="46" r="8" fill="url(#hcz-cu)"/><circle cx="34" cy="32" r="8" fill="url(#hcz-cu)"/><circle cx="52" cy="32" r="8" fill="url(#hcz-cu)"/></g>`
      : `<g class="hc-in"><circle cx="30" cy="34" r="6" fill="url(#hcz-na)"/><circle cx="52" cy="34" r="10" fill="url(#hcz-cl)"/><circle cx="30" cy="56" r="10" fill="url(#hcz-cl)"/><circle cx="52" cy="58" r="6" fill="url(#hcz-na)"/></g>`;
  const outer =
    kind === "cu"
      ? `<g class="hc-out"><path d="M22 30h44l8 34-30 12-28-14z" fill="url(#hcz-cup)"/><path d="M28 36l30-3" stroke="#FFE0C0" stroke-width="3" opacity=".7"/></g>`
      : `<g class="hc-out"><rect x="24" y="28" width="42" height="42" rx="6" fill="url(#hcz-sal)" transform="rotate(8 45 49)"/><path d="M32 36l10-4" stroke="#FFFFFF" stroke-width="3" opacity=".8"/></g>`;
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="hcz-cup" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0B078"/><stop offset=".55" stop-color="#D8844A"/><stop offset="1" stop-color="#9E5A28"/></linearGradient>
      <linearGradient id="hcz-sal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#E4EAF2"/><stop offset="1" stop-color="#B8C4D4"/></linearGradient>
      <radialGradient id="hcz-cu" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFD2A8"/><stop offset="1" stop-color="#C06A2E"/></radialGradient>
      <radialGradient id="hcz-na" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#D6BCFF"/><stop offset="1" stop-color="#8A5CD0"/></radialGradient>
      <radialGradient id="hcz-cl" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#A8ECB8"/><stop offset="1" stop-color="#2E9A4E"/></radialGradient>
    </defs>
    <ellipse cx="48" cy="82" rx="26" ry="4.5" fill="#2A3A5E" opacity=".12"/>
    ${outer}${zoomIn}
  </svg>`;
}

export function renderZoomTwo(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): void {
  const grid = el("div", { class: "hook-cups" });
  scene.appendChild(grid);
  helper.innerHTML = "구리 조각과 소금 결정 — 둘 다 <b>꾹 눌러 입자 수준까지 확대</b>해 보세요!";
  const seen = new Set<string>();
  const mk = (kind: "cu" | "salt", name: string, msg: string): HTMLElement => {
    const label = el("div", { class: "hook-cup-label", text: "눌러서 확대" });
    const card = el("button", { class: "hook-cup hcz", attrs: { "aria-label": `${name} — 눌러서 확대` }, html: "" });
    card.appendChild(el("span", { class: "hook-art", html: zoomtwoSvg(kind) }));
    card.appendChild(label);
    card.addEventListener("click", () => {
      if (seen.has(kind)) return;
      seen.add(kind);
      card.classList.add("zoomed");
      label.textContent = msg;
      haptic(HAPTIC.select);
      face("surprised");
      if (seen.size === 2) {
        face("curious");
        helper.innerHTML =
          "구리는 <b>똑같은 알갱이</b>만, 소금은 <b>두 종류</b>가 번갈아 있어요! 이 차이가 물질의 세계를 가르는 기준이래요 — 실험실에서 판정해 봐요.";
        finish();
      } else {
        helper.innerHTML = "오! 이제 <b>다른 쪽</b>도 확대해 보세요.";
      }
    });
    return card;
  };
  grid.append(mk("cu", "구리 조각", "전부 같은 입자!"), mk("salt", "소금 결정", "두 종류가 번갈아!"));
}

// ── L2: 만국 공통 기호 — 공항 표지판 ─────────────────────────
function signSvg(kind: "wifi" | "wc" | "plug"): string {
  const inner =
    kind === "wifi"
      ? `<path d="M28 56q20-18 40 0" stroke="#EAF1FA" stroke-width="5" fill="none"/><path d="M36 64q12-11 24 0" stroke="#EAF1FA" stroke-width="5" fill="none"/><circle cx="48" cy="73" r="4.5" fill="#EAF1FA"/>`
      : kind === "wc"
        ? `<circle cx="38" cy="34" r="6" fill="#EAF1FA"/><path d="M38 42v14l-5 16M38 56l5 16M30 48h16" stroke="#EAF1FA" stroke-width="4.4" fill="none"/><circle cx="60" cy="34" r="6" fill="#EAF1FA"/><path d="M60 42l-7 20h14z" fill="#EAF1FA"/>`
        : `<rect x="34" y="30" width="28" height="26" rx="7" stroke="#EAF1FA" stroke-width="4.4" fill="none"/><path d="M42 30v-8M54 30v-8M48 56v14" stroke="#EAF1FA" stroke-width="4.4"/>`;
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs><linearGradient id="hcs-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E86D8"/><stop offset="1" stop-color="#2A5AA8"/></linearGradient></defs>
    <ellipse cx="48" cy="86" rx="24" ry="4" fill="#2A3A5E" opacity=".12"/>
    <rect x="16" y="14" width="64" height="64" rx="14" fill="url(#hcs-b)"/>
    <rect x="16" y="14" width="64" height="64" rx="14" stroke="#1A3C78" stroke-width="2"/>
    <path d="M24 22q10-4 22-2" stroke="#9CC2FF" stroke-width="3" opacity=".6"/>
    ${inner}
  </svg>`;
}

export function renderSigns(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): void {
  const grid = el("div", { class: "hook-cups three" });
  scene.appendChild(grid);
  helper.innerHTML = "여기는 낯선 나라의 공항. 글자를 하나도 몰라도 괜찮아요 — 표지판을 <b>모두 눌러</b> 뜻을 맞혀 봐요!";
  const seen = new Set<string>();
  const answers: [string, "wifi" | "wc" | "plug", string][] = [
    ["와이파이!", "wifi", "인터넷 되는 곳"],
    ["화장실!", "wc", "급할 때"],
    ["콘센트!", "plug", "충전하는 곳"],
  ];
  answers.forEach(([msg, kind, sub]) => {
    const label = el("div", { class: "hook-cup-label", text: "무슨 뜻?" });
    const card = el("button", { class: "hook-cup" }, el("span", { class: "hook-art", html: signSvg(kind) }), label);
    card.addEventListener("click", () => {
      if (seen.has(kind)) return;
      seen.add(kind);
      label.textContent = `${msg} — ${sub}`;
      card.classList.add("cold");
      haptic(HAPTIC.select);
      if (seen.size === 3) {
        face("curious");
        helper.innerHTML =
          "말이 안 통해도 <b>기호는 통해요</b>! 과학자들도 전 세계가 함께 쓰는 <b>원소 기호</b>를 만들었죠 — H, O, Fe… 실험실에서 기호로 물질을 조립해 봐요.";
        finish();
      } else face("surprised");
    });
    grid.appendChild(card);
  });
}

// ── L3: 원자 속 들여다보기 — 3단 줌 ─────────────────────────
function peekSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="hcp-pen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F5C93C"/><stop offset="1" stop-color="#D89A18"/></linearGradient>
      <radialGradient id="hcp-c" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#AEB8C6"/><stop offset="1" stop-color="#3E4854"/></radialGradient>
      <radialGradient id="hcp-n" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFB09A"/><stop offset="1" stop-color="#C23A20"/></radialGradient>
      <radialGradient id="hcp-e" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#B8DCFF"/><stop offset="1" stop-color="#2E6DB4"/></radialGradient>
    </defs>
    <!-- 1단: 연필 -->
    <g class="hcp-s hcp-s0">
      <ellipse cx="120" cy="118" rx="70" ry="6" fill="#2A3A5E" opacity=".12"/>
      <rect x="48" y="78" width="120" height="22" rx="6" fill="url(#hcp-pen)"/>
      <path d="M168 78l26 11-26 11z" fill="#E8CFA0"/>
      <path d="M186 85.5l8 3.5-8 3.5z" fill="#3E4854"/>
      <path d="M54 82h100" stroke="#FFE9A8" stroke-width="3" opacity=".8"/>
    </g>
    <!-- 2단: 탄소 원자들 -->
    <g class="hcp-s hcp-s1" opacity="0">
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${70 + (i % 4) * 34 + (Math.floor(i / 4) % 2) * 17}" cy="${66 + Math.floor(i / 4) * 30}" r="13" fill="url(#hcp-c)"/>`).join("")}
      <circle cx="120" cy="120" r="13" fill="url(#hcp-c)" stroke="#EAF1FA" stroke-width="2.4"/>
    </g>
    <!-- 3단: 원자 내부(핵 + 전자) -->
    <g class="hcp-s hcp-s2" opacity="0">
      <ellipse cx="120" cy="86" rx="76" ry="52" stroke="#3E5478" stroke-width="1.6" stroke-dasharray="5 6"/>
      <circle cx="120" cy="86" r="17" fill="url(#hcp-n)"/>
      <circle cx="114" cy="80" r="4" fill="#FFD6BE"/><circle cx="127" cy="84" r="4" fill="#FFD6BE"/><circle cx="118" cy="93" r="4" fill="#96787">
      </circle>
      <circle cx="60" cy="62" r="7" fill="url(#hcp-e)"/><circle cx="184" cy="70" r="7" fill="url(#hcp-e)"/>
      <circle cx="86" cy="126" r="7" fill="url(#hcp-e)"/><circle cx="164" cy="118" r="7" fill="url(#hcp-e)"/>
    </g>
  </svg>`;
}

export function renderPeekAtom(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): void {
  const fig = el("div", { class: "hcp s0" });
  fig.innerHTML = peekSvg();
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "더 확대하기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "연필심(흑연)이에요. 계속 확대하면 뭐가 나올까요? <b>확대</b>를 눌러요!";
  let stage = 0;
  btn.addEventListener("click", () => {
    if (stage >= 2) return;
    stage++;
    fig.classList.remove("s0", "s1", "s2");
    fig.classList.add(`s${stage}`);
    haptic(HAPTIC.select);
    if (stage === 1) {
      face("surprised");
      helper.innerHTML = "<b>탄소 원자</b>들이 빼곡! 그럼 저 원자 알갱이 하나를 <b>더</b> 확대하면…?";
    } else {
      (btn as HTMLButtonElement).disabled = true;
      btn.classList.add("done-static");
      (btn.querySelector("span") as HTMLElement).textContent = "원자 속이 보여요!";
      face("curious");
      helper.innerHTML = "원자 속엔 무언가 더 있었어요! 가운데 덩어리와 주위의 작은 알갱이들 — 정체가 뭘까요?";
      window.setTimeout(() => {
        ask(
          choicesBox,
          s.choices ?? ["가운데 (+)원자핵과 주위의 (−)전자", "속이 꽉 찬 단단한 구슬", "아무것도 없이 텅 비어 있다"],
          helper,
          "예측 완료! 실험실 <b>원자 조립소</b>에서 부품을 직접 넣으며 확인해요.",
          finish,
        );
      }, 700);
    }
  });
}

// ── L4: 뒤죽박죽 메뉴판 정리 ─────────────────────────────────
function menuSvg(): string {
  const item = (x: number, y: number, w: number, hue: string): string =>
    `<g class="hcm-item"><rect x="${x}" y="${y}" width="${w}" height="10" rx="5" fill="${hue}"/></g>`;
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <defs><linearGradient id="hcm-bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF7EE"/><stop offset="1" stop-color="#E8DEC8"/></linearGradient></defs>
    <ellipse cx="120" cy="160" rx="76" ry="5" fill="#2A3A5E" opacity=".12"/>
    <rect x="42" y="10" width="156" height="148" rx="12" fill="url(#hcm-bd)" stroke="#B8A87E" stroke-width="2.4"/>
    <g class="hcm-messy">
      ${item(58, 28, 60, "#E08A6A")}${item(140, 30, 40, "#7FA6D8")}${item(70, 52, 44, "#8FBF6A")}
      ${item(128, 56, 56, "#E08A6A")}${item(56, 80, 52, "#7FA6D8")}${item(120, 84, 40, "#8FBF6A")}
      ${item(64, 108, 40, "#8FBF6A")}${item(116, 112, 60, "#E08A6A")}${item(60, 134, 56, "#7FA6D8")}
    </g>
    <g class="hcm-tidy" opacity="0">
      ${item(58, 32, 56, "#E08A6A")}${item(58, 46, 48, "#E08A6A")}${item(58, 60, 52, "#E08A6A")}
      ${item(58, 84, 50, "#7FA6D8")}${item(58, 98, 56, "#7FA6D8")}${item(58, 112, 44, "#7FA6D8")}
      ${item(140, 32, 44, "#8FBF6A")}${item(140, 46, 50, "#8FBF6A")}${item(140, 60, 40, "#8FBF6A")}
      <rect x="52" y="24" width="70" height="56" rx="7" stroke="#D8845A" stroke-width="1.8" stroke-dasharray="4 4"/>
      <rect x="52" y="76" width="70" height="56" rx="7" stroke="#6A90C8" stroke-width="1.8" stroke-dasharray="4 4"/>
      <rect x="134" y="24" width="58" height="56" rx="7" stroke="#7AA85A" stroke-width="1.8" stroke-dasharray="4 4"/>
    </g>
  </svg>`;
}

export function renderMenuSort(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): void {
  const fig = el("div", { class: "hcm" });
  fig.innerHTML = menuSvg();
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "메뉴판 정리하기" }));
  scene.append(fig, btn);
  helper.innerHTML = "이 식당 메뉴판, 밥·면·음료가 <b>뒤죽박죽</b>이에요. 뭘 시켜야 할지 하나도 모르겠죠?";
  let done = false;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    fig.classList.add("tidy");
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.add("done-static");
    (btn.querySelector("span") as HTMLElement).textContent = "종류별로 착착!";
    haptic(HAPTIC.correct);
    face("smile");
    helper.innerHTML =
      "<b>비슷한 것끼리 묶으니</b> 한눈에 보여요! 과학자들도 118가지 원소를 이렇게 정리했어요 — 그 표가 바로 <b>주기율표</b>. 신기하게도 <b>같은 세로줄 원소는 성질까지 닮았대요</b>.";
    window.setTimeout(() => {
      face("curious");
      finish();
    }, 800);
  });
}

// ── L5: 약수터의 톡 쏘는 물 ─────────────────────────────────
function springSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="hcw-rock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FA0B0"/><stop offset="1" stop-color="#4E5E6E"/></linearGradient>
      <linearGradient id="hcw-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFDCFF"/><stop offset="1" stop-color="#7FB0E8"/></linearGradient>
      <linearGradient id="hcw-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0E6C8"/><stop offset="1" stop-color="#C8B888"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="158" rx="80" ry="5" fill="#2A3A5E" opacity=".12"/>
    <path d="M30 40q40-26 90-12l40 14q30 12 46 40l-20 12q-60 24-132 8z" fill="url(#hcw-rock)"/>
    <path d="M52 44q26-12 52-8" stroke="#C6D2DE" stroke-width="3" opacity=".6"/>
    <path d="M96 66q6 2 6 10v20" stroke="#5E6E7E" stroke-width="8"/>
    <path class="hcw-stream" d="M100 96q0 18 -2 30" stroke="url(#hcw-w)" stroke-width="5"/>
    <path d="M62 128q38 14 78 0v14q-38 12-78 0z" fill="url(#hcw-w)" opacity=".8"/>
    <g class="hcw-cup"><path d="M138 118q16-6 30 0l-4 22q-11 5-22 0z" fill="url(#hcw-g)" stroke="#8A7A4E" stroke-width="2"/></g>
    <g class="hcw-fizz" stroke="#8FC4FF" stroke-width="2.2" opacity="0">
      <circle cx="148" cy="108" r="2.4"/><circle cx="158" cy="100" r="2"/><circle cx="153" cy="92" r="1.7"/>
      <path d="M166 106l4-4M170 112l5-2"/>
    </g>
  </svg>`;
}

export function renderSpringWater(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hcw" });
  fig.innerHTML = springSvg();
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "바가지로 한 모금" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "산길을 걷다 만난 약수터! 목이 마르니 시원하게 한 모금 마셔 볼까요?";
  let timer = 0;
  let done = false;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    fig.classList.add("drank");
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.add("done-static");
    (btn.querySelector("span") as HTMLElement).textContent = "어? 톡 쏘고 쌉싸름해!";
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "그냥 맹물이 아니에요 — 살짝 <b>쇠 맛</b>에 <b>톡 쏘는 느낌</b>까지! 물속에 뭐가 들어 있는 걸까요?";
    timer = window.setTimeout(() => {
      face("curious");
      ask(
        choicesBox,
        s.choices ?? ["전하를 띤 작은 입자(이온)들이 녹아 있다", "아주 작은 모래 알갱이가 섞여 있다", "물 분자 자체의 맛이 다른 것이다"],
        helper,
        "예측 완료! 실험실에서 <b>분자</b>를 조립하고 <b>이온</b>을 직접 만들어 봐요.",
        finish,
      );
    }, 850);
  });
  return () => window.clearTimeout(timer);
}

// ── L6: 자석의 끌림 — 전하도 끌릴까? ─────────────────────────
function magnetSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="hcg-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A76"/><stop offset="1" stop-color="#D6452E"/></linearGradient>
      <linearGradient id="hcg-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FA6E8"/><stop offset="1" stop-color="#2E5AB4"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="140" rx="82" ry="5" fill="#2A3A5E" opacity=".12"/>
    <g class="hcg-m1"><rect x="26" y="66" width="62" height="40" rx="8" fill="url(#hcg-r)" stroke="#8E2A18" stroke-width="2"/><rect x="70" y="66" width="18" height="40" rx="4" fill="#EAF1FA" opacity=".85"/></g>
    <g class="hcg-m2"><rect x="152" y="66" width="62" height="40" rx="8" fill="url(#hcg-b)" stroke="#1A3C88" stroke-width="2"/><rect x="152" y="66" width="18" height="40" rx="4" fill="#EAF1FA" opacity=".85"/></g>
    <g class="hcg-spark" stroke="#FFD978" stroke-width="2.6" opacity="0"><path d="M116 60l4 8M124 60l-4 8M112 112l6-6M128 112l-6-6"/></g>
  </svg>`;
}

export function renderMagnetPull(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hcg" });
  fig.innerHTML = magnetSvg();
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "자석 가까이 밀기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "자석 두 개가 서로 다른 극을 마주 보고 있어요. 밀어서 가까이 해 볼까요?";
  let timer = 0;
  let done = false;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    fig.classList.add("snap");
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.add("done-static");
    (btn.querySelector("span") as HTMLElement).textContent = "철컥! 달라붙었어요";
    haptic(HAPTIC.correct);
    face("surprised");
    helper.innerHTML = "다른 극끼리는 <b>서로 끌어당겨요</b>. 그런데 — 전자를 잃거나 얻어 <b>전하를 띤 이온</b>도, 전기의 극을 만나면 끌려갈까요?";
    timer = window.setTimeout(() => {
      face("curious");
      ask(
        choicesBox,
        s.choices ?? ["양이온은 (−)극으로, 음이온은 (+)극으로 끌려간다", "이온은 너무 작고 가벼워 움직이지 않는다", "모든 이온이 같은 극으로 몰려간다"],
        helper,
        "예측 완료! 실험실에서 <b>색깔 있는 이온</b>으로 직접 확인해요 — 눈에 보인답니다!",
        finish,
      );
    }, 850);
  });
  return () => window.clearTimeout(timer);
}
