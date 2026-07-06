// hookSpace — VII 태양계 단원 훅 장면들(hook.ts가 위임).
//   "stargaze"    L1 · 밤하늘의 유난히 밝은 점 — 망원경으로 보니 별이 아니라 행성!
//   "planetsize"  L2 · 지구 몇 개면 목성 지름이 될까? 예측 → 지구 11개 줄 세우기
//   "shadowclock" L4 · 시계탑 그림자가 하루 동안 도는 까닭 예측(244쪽 도입)
//   "moonpic"     L5 · 며칠 전 달 사진과 오늘 달이 다르다(248쪽 도입) + 오개념 예측
//   "sunglasses"  L6 · 태양 관측 안경을 쓰니 태양이 한 입 베어문 모양(252쪽 도입)
// 파운드리 재질 문법(근-동조 그라데이션·키라이트·접촉 그림자·최암색 외곽선)을 따르고,
// 스틱맨 캐릭터만 손그림 라인을 유지한다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { AvatarKind } from "../../ui/avatar";

interface HookStepLike {
  choices?: string[];
}

function askChoices(
  box: HTMLElement,
  opts: string[],
  helper: HTMLElement,
  doneMsg: string,
  finish: () => void,
): void {
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

// ── L1: 밤하늘의 밝은 점 ─────────────────────────────────────
export function renderStargaze(
  scene: HTMLElement,
  helper: HTMLElement,
  finish: () => void,
  face: (k: AvatarKind) => void,
): () => void {
  const fig = el("div", { class: "hk-space-night" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="hsSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226"/><stop offset=".7" stop-color="#13203E"/><stop offset="1" stop-color="#1E3054"/>
      </linearGradient>
      <radialGradient id="hsGlow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFF6D8" stop-opacity=".95"/><stop offset=".4" stop-color="#FFE9A8" stop-opacity=".5"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hsSat" x1="150" y1="52" x2="176" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F4E5BC"/><stop offset=".55" stop-color="#E2C88E"/><stop offset="1" stop-color="#B99A5E"/>
      </linearGradient>
      <linearGradient id="hsHill" x1="0" y1="140" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1C2C4E"/><stop offset="1" stop-color="#101B34"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hsSky)"/>
    <g class="hs-stars" fill="#DCE8FF">
      <circle cx="34" cy="34" r="1.5"/><circle cx="66" cy="22" r="1.2"/><circle cx="96" cy="44" r="1.6"/>
      <circle cx="128" cy="24" r="1.2"/><circle cx="196" cy="30" r="1.5"/><circle cx="214" cy="66" r="1.2"/>
      <circle cx="46" cy="72" r="1.3"/><circle cx="86" cy="88" r="1.1"/><circle cx="150" cy="96" r="1.3"/>
      <circle cx="200" cy="108" r="1.2"/><circle cx="28" cy="110" r="1.2"/><circle cx="120" cy="70" r="1.1"/>
    </g>
    <!-- 유난히 밝은 점(행성) -->
    <g class="hs-planet-dot">
      <circle cx="163" cy="64" r="13" fill="url(#hsGlow)"/>
      <circle cx="163" cy="64" r="3.2" fill="#FFF3C4"/>
    </g>
    <!-- 망원경 뷰(처음엔 숨김) -->
    <g class="hs-scope">
      <circle cx="163" cy="64" r="34" fill="#0B1524" stroke="#8FB3E8" stroke-width="2.6"/>
      <g>
        <ellipse cx="163" cy="64" rx="26" ry="7" stroke="#D9C08A" stroke-width="3" opacity=".9"/>
        <circle cx="163" cy="64" r="11" fill="url(#hsSat)"/>
        <path d="M154 58q9-4 18 0" stroke="#FFF4D0" stroke-width="2" opacity=".8"/>
      </g>
      <path d="M139 40l-8-8M187 40l8-8M139 88l-8 8M187 88l8 8" stroke="#8FB3E8" stroke-width="2" opacity=".5"/>
    </g>
    <path d="M4 152q60-24 118-10t114 4v16a16 16 0 0 1-16 16H20a16 16 0 0 1-16-16z" fill="url(#hsHill)"/>
    <!-- 스틱맨 + 망원경(손그림 라인) -->
    <ellipse cx="60" cy="158" rx="26" ry="3.6" fill="#000" opacity=".18"/>
    <g stroke="#E8EEF8" stroke-width="2.6">
      <circle cx="52" cy="118" r="8" fill="#101B34"/>
      <path d="M52 126v18M52 132l-9 6M52 132l12-4M52 144l-7 12M52 144l8 11"/>
      <path d="M62 126l22-12" stroke-width="4"/>
      <path d="M84 112l6-3" stroke-width="6"/>
    </g>
  </svg>`;
  const helperMsg = (): void => {
    helper.innerHTML = "별들 사이, <b>유난히 밝게 빛나는 점</b>이 하나 있어요. 눌러서 망원경으로 봐요!";
  };
  helperMsg();
  const btn = el("button", { class: "hk-space-hit", attrs: { type: "button", "aria-label": "밝은 점을 망원경으로 보기" } });
  const wrap = el("div", { class: "hk-space-wrap" }, fig, btn);
  scene.appendChild(wrap);

  let seen = false;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (seen) return;
    seen = true;
    fig.classList.add("scoped");
    btn.disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "우아 — 점이 아니라 <b>고리를 두른 둥근 천체</b>예요! 별이 아니라 <b>행성(토성)</b>이었어요.";
    timer = window.setTimeout(() => {
      face("curious");
      helper.innerHTML = "밤하늘엔 스스로 빛나는 별 말고도 <b>태양 둘레를 도는 식구들</b>이 숨어 있어요. 태양계로 떠나 볼까요?";
      finish();
    }, 1400);
  });
  return () => window.clearTimeout(timer);
}

// ── L2: 지구 몇 개 = 목성? ───────────────────────────────────
export function renderPlanetSize(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): () => void {
  const NS = "http://www.w3.org/2000/svg";
  const fig = el("div", { class: "hk-space-night" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="${NS}" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="hpSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226"/><stop offset="1" stop-color="#182848"/>
      </linearGradient>
      <linearGradient id="hpJup" x1="60" y1="30" x2="180" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#EADFC6"/><stop offset=".5" stop-color="#D3AC7C"/><stop offset="1" stop-color="#A9714C"/>
      </linearGradient>
      <radialGradient id="hpJupHl" cx=".32" cy=".26" r=".7">
        <stop offset="0" stop-color="#FFF7E2" stop-opacity=".85"/><stop offset="1" stop-color="#FFF7E2" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hpEarth" x1="0" y1="-5" x2="0" y2="5" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#7FB2F0"/><stop offset="1" stop-color="#2E6FD4"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#hpSky)"/>
    <circle cx="26" cy="26" r="1.4" fill="#DCE8FF"/><circle cx="212" cy="34" r="1.4" fill="#DCE8FF"/>
    <circle cx="196" cy="140" r="1.2" fill="#DCE8FF"/><circle cx="38" cy="140" r="1.2" fill="#DCE8FF"/>
    <!-- 목성 -->
    <circle cx="120" cy="85" r="57" fill="url(#hpJup)"/>
    <circle cx="120" cy="85" r="57" fill="url(#hpJupHl)"/>
    <g stroke="#B57B50" stroke-width="5" opacity=".55">
      <path d="M68 66q52 12 104 0"/><path d="M64 92q56 12 112 0"/><path d="M72 116q48 12 96 0"/>
    </g>
    <ellipse cx="141" cy="106" rx="10" ry="6" fill="#C4553E"/>
    <circle cx="120" cy="85" r="57" stroke="#7C4E33" stroke-width="1.6"/>
    <!-- 지구 줄(지름 위) -->
    <g class="hp-earthrow"></g>
    <!-- 기준 지구 -->
    <circle cx="120" cy="152" r="5.2" fill="url(#hpEarth)"/>
    <circle cx="120" cy="152" r="5.2" stroke="#1B4B9E" stroke-width="1.2"/>
    <path d="M116 150q3-2 5 0t4 1" stroke="#7CA65A" stroke-width="1.6"/>
  </svg>`;
  const row = fig.querySelector(".hp-earthrow") as unknown as SVGGElement;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), choicesBox);
  helper.innerHTML = "아래 작은 파란 공이 <b>지구</b>, 큰 행성이 <b>목성</b>이에요. 목성 지름을 지구로 채우면 <b>몇 개</b>쯤 들어갈까요?";
  face("curious");

  let timer = 0;
  const timers: number[] = [];
  askChoices(
    choicesBox,
    s.choices ?? ["지구 3개", "지구 6개", "지구 11개"],
    helper,
    "그럼 직접 세어 볼까요? 지구가 한 줄로 들어갑니다 —",
    () => {
      // 지구 11개 애니메이션
      const R = 57;
      const r = R / 11;
      for (let i = 0; i < 11; i++) {
        timers.push(
          window.setTimeout(() => {
            const cx = 120 - R + r + i * 2 * r;
            const c = document.createElementNS(NS, "circle");
            c.setAttribute("cx", String(cx));
            c.setAttribute("cy", "85");
            c.setAttribute("r", String(r - 0.3));
            c.setAttribute("fill", "#5AA2F8");
            c.setAttribute("stroke", "#1B4B9E");
            c.setAttribute("stroke-width", "0.8");
            c.classList.add("hp-earthpop");
            row.appendChild(c);
            haptic(HAPTIC.tap);
            if (i === 10) {
              face("surprised");
              helper.innerHTML = "정답은 <b>약 11개</b>! 목성 지름은 지구의 약 11배예요. 그런데 이렇게 큰 행성들끼리 <b>닮은 점</b>이 있대요 — 분류해 볼까요?";
              timer = window.setTimeout(finish, 700);
            }
          }, 200 + i * 170),
        );
      }
    },
  );
  return () => {
    window.clearTimeout(timer);
    timers.forEach((t) => window.clearTimeout(t));
  };
}

// ── L4: 시계탑 그림자 ────────────────────────────────────────
export function renderShadowClock(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-space-day t-morning" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="scSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#BFE0FF"/><stop offset="1" stop-color="#E8F4FF"/>
      </linearGradient>
      <radialGradient id="scSun" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFE9A8"/><stop offset=".55" stop-color="#FFD25E"/><stop offset="1" stop-color="#FFB03A"/>
      </radialGradient>
      <linearGradient id="scTower" x1="108" y1="60" x2="136" y2="130" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FBFDFF"/><stop offset=".5" stop-color="#E2E9F2"/><stop offset="1" stop-color="#C2CDDD"/>
      </linearGradient>
      <linearGradient id="scGrass" x1="0" y1="130" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#BFE3A8"/><stop offset="1" stop-color="#93C77C"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#scSky)"/>
    <path d="M4 134h232v16a16 16 0 0 1-16 16H20a16 16 0 0 1-16-16z" fill="url(#scGrass)"/>
    <circle class="sc-sun" cx="48" cy="46" r="15" fill="url(#scSun)"/>
    <!-- 그림자(시각별 3종) -->
    <g fill="#2A3A5E">
      <path class="sc-sh sc-sh-m" d="M122 132l58 14-4 6-56-14z" opacity=".16"/>
      <path class="sc-sh sc-sh-n" d="M116 132h12l3 10h-18z" opacity=".16"/>
      <path class="sc-sh sc-sh-e" d="M122 132l-58 14 4 6 56-14z" opacity=".16"/>
    </g>
    <!-- 시계탑 -->
    <ellipse cx="122" cy="134" rx="20" ry="3.4" fill="#2A3A5E" opacity=".10"/>
    <path d="M110 66h24v66h-24z" fill="url(#scTower)"/>
    <path d="M110 66h24v66h-24z" stroke="#9DAABD" stroke-width="1.6"/>
    <path d="M113 72v54" stroke="#FFFFFF" stroke-width="3.4" opacity=".7"/>
    <path d="M108 62h28l-14-14z" fill="#E4906A"/>
    <path d="M108 62h28l-14-14z" stroke="#B05E3C" stroke-width="1.6"/>
    <circle cx="122" cy="88" r="9" fill="#FFFFFF" stroke="#9DAABD" stroke-width="1.6"/>
    <path class="sc-hand" d="M122 88v-6M122 88l4 3" stroke="#4E5968" stroke-width="1.8"/>
  </svg>`;
  const seg = el("div", { class: "seg" });
  const mk = (id: "morning" | "noon" | "evening", label: string): HTMLButtonElement => {
    const b = el("button", { text: label, attrs: { type: "button", "aria-pressed": String(id === "morning") } }) as HTMLButtonElement;
    if (id === "morning") b.classList.add("on");
    b.addEventListener("click", () => setTime(id, b));
    return b;
  };
  const btns = [mk("morning", "아침"), mk("noon", "낮 12시"), mk("evening", "저녁")];
  seg.append(...btns);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), seg, choicesBox);
  helper.innerHTML = "아침의 시계탑이에요. 시간을 <b>낮 → 저녁</b>으로 바꿔 보며 그림자를 관찰!";

  const seen = new Set(["morning"]);
  let asked = false;
  function setTime(id: "morning" | "noon" | "evening", btn: HTMLButtonElement): void {
    fig.className = `hk-space-day t-${id}`;
    btns.forEach((b) => {
      b.classList.toggle("on", b === btn);
      b.setAttribute("aria-pressed", String(b === btn));
    });
    haptic(HAPTIC.select);
    seen.add(id);
    if (!asked && seen.size === 3) {
      asked = true;
      face("curious");
      helper.innerHTML = "해가 움직이니 <b>그림자 방향</b>이 하루 종일 돌아요. 그런데… 진짜로 움직인 건 누구일까요?";
      askChoices(
        choicesBox,
        s.choices ?? ["태양이 지구 둘레를 돈다", "지구가 스스로 돈다", "시계탑이 아주 조금씩 돈다"],
        helper,
        "예측 완료! 우주에서 내려다보며 <b>직접 확인</b>해 봐요.",
        finish,
      );
    } else if (!asked) {
      face("surprised");
    }
  }
}

// ── L5: 달 사진 비교 ─────────────────────────────────────────
export function renderMoonPic(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-space-phone pic0" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="mpBody" x1="70" y1="10" x2="170" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#3A4658"/><stop offset=".5" stop-color="#242E3E"/><stop offset="1" stop-color="#171F2C"/>
      </linearGradient>
      <linearGradient id="mpSky" x1="0" y1="30" x2="0" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0C1530"/><stop offset="1" stop-color="#1B2C52"/>
      </linearGradient>
      <radialGradient id="mpMoon" cx=".36" cy=".3" r=".8">
        <stop offset="0" stop-color="#FCF6E4"/><stop offset=".7" stop-color="#E8DCB8"/><stop offset="1" stop-color="#C9BA8E"/>
      </radialGradient>
    </defs>
    <ellipse cx="120" cy="163" rx="52" ry="4" fill="#2A3A5E" opacity=".12"/>
    <rect x="72" y="8" width="96" height="152" rx="14" fill="url(#mpBody)"/>
    <rect x="72" y="8" width="96" height="152" rx="14" stroke="#0D131D" stroke-width="1.6"/>
    <rect x="79" y="26" width="82" height="116" rx="6" fill="url(#mpSky)"/>
    <rect x="100" y="14" width="40" height="5" rx="2.5" fill="#0D131D"/>
    <circle cx="90" cy="52" r="1.1" fill="#DCE8FF"/><circle cx="148" cy="44" r="1.2" fill="#DCE8FF"/>
    <circle cx="132" cy="118" r="1" fill="#DCE8FF"/><circle cx="96" cy="122" r="1" fill="#DCE8FF"/>
    <!-- 사진 1: 오른쪽 반달(상현) -->
    <g class="mp-pic mp-pic0">
      <path d="M120 60a24 24 0 0 1 0 48z" fill="url(#mpMoon)"/>
      <path d="M120 60a24 24 0 0 1 0 48" stroke="#A89A72" stroke-width="1.4"/>
      <circle cx="128" cy="76" r="3" fill="#C9BA8E" opacity=".8"/>
      <circle cx="124" cy="94" r="2.2" fill="#C9BA8E" opacity=".7"/>
    </g>
    <!-- 사진 2: 보름달 -->
    <g class="mp-pic mp-pic1">
      <circle cx="120" cy="84" r="24" fill="url(#mpMoon)"/>
      <circle cx="120" cy="84" r="24" stroke="#A89A72" stroke-width="1.4"/>
      <circle cx="111" cy="74" r="4" fill="#C9BA8E" opacity=".7"/>
      <circle cx="128" cy="88" r="3.2" fill="#C9BA8E" opacity=".7"/>
      <circle cx="116" cy="98" r="2.4" fill="#C9BA8E" opacity=".6"/>
    </g>
    <text class="mp-date mp-d0" x="120" y="152" fill="#8FA6CE" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">지난주 화요일 밤</text>
    <text class="mp-date mp-d1" x="120" y="152" fill="#8FA6CE" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">오늘 밤</text>
  </svg>`;
  const swapBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "오늘 밤 사진 보기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), swapBtn, choicesBox);
  helper.innerHTML = "지난주에 찍은 달 사진이에요 — <b>오른쪽 반쪽만</b> 빛나는 반달이네요. 오늘 밤 달과 비교해 볼까요?";

  let swapped = false;
  swapBtn.addEventListener("click", () => {
    if (swapped) return;
    swapped = true;
    fig.classList.remove("pic0");
    fig.classList.add("pic1");
    swapBtn.classList.add("done-static");
    (swapBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "오늘은 <b>동그란 보름달</b>! 일주일 만에 모양이 변했어요. 왜 그럴까요?";
    window.setTimeout(() => {
      face("curious");
      askChoices(
        choicesBox,
        s.choices ?? ["달의 모양 자체가 변한다", "지구 그림자가 달을 가린다", "태양 빛을 받아 밝은 부분이 달라 보인다"],
        helper,
        "예측 완료! <b>진짜 3D 달</b>을 돌려 보며 확인해 봐요.",
        finish,
      );
    }, 800);
  });
}

// ── L6: 태양 관측 안경 ───────────────────────────────────────
export function renderSunGlasses(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-space-day bare" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="sgSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#AFD8FF"/><stop offset="1" stop-color="#E4F2FF"/>
      </linearGradient>
      <radialGradient id="sgSun" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFF6D8"/><stop offset=".5" stop-color="#FFD25E"/><stop offset="1" stop-color="#FFB03A"/>
      </radialGradient>
      <radialGradient id="sgBlaze" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="sgFilm" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226" stop-opacity=".93"/><stop offset="1" stop-color="#101B34" stop-opacity=".9"/>
      </linearGradient>
      <linearGradient id="sgHill" x1="0" y1="136" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#9CCB84"/><stop offset="1" stop-color="#7AB365"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#sgSky)"/>
    <path d="M4 140q60-22 116-10t116 2v6a16 16 0 0 1-16 16H20a16 16 0 0 1-16-16z" fill="url(#sgHill)"/>
    <!-- 맨눈: 눈부신 태양 -->
    <g class="sg-bare">
      <circle cx="120" cy="64" r="44" fill="url(#sgBlaze)"/>
      <circle cx="120" cy="64" r="20" fill="url(#sgSun)"/>
    </g>
    <!-- 관측 안경 뷰: 검은 필터 + 한 입 베어문 태양 -->
    <g class="sg-filter">
      <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#sgFilm)"/>
      <g>
        <circle cx="120" cy="64" r="20" fill="#FF9E3D"/>
        <circle cx="132" cy="56" r="16" fill="#0A1226"/>
      </g>
      <path d="M40 20l6 6M200 20l-6 6" stroke="#31446E" stroke-width="2" opacity=".6"/>
    </g>
    <!-- 스틱맨(손그림) -->
    <ellipse cx="52" cy="160" rx="20" ry="3.2" fill="#2A3A5E" opacity=".12"/>
    <g stroke="#3C4654" stroke-width="2.6">
      <circle cx="52" cy="118" r="8.5" fill="#fff"/>
      <path d="M52 127v17M52 133l-10 5M52 133l10 5M52 144l-7 13M52 144l7 13"/>
    </g>
    <path class="sg-glass" d="M44 116h16v5h-16z" fill="#101B34" stroke="#101B34" stroke-width="1.4"/>
  </svg>`;
  const wearBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "태양 관측 안경 쓰기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), wearBtn, choicesBox);
  helper.innerHTML = "한낮 하늘이 <b>이상하게 어둑</b>해졌어요. 태양은 맨눈으로 보면 절대 안 돼요 — <b>관측 안경</b>을 써 봐요!";

  let worn = false;
  wearBtn.addEventListener("click", () => {
    if (worn) return;
    worn = true;
    fig.classList.remove("bare");
    fig.classList.add("filtered");
    wearBtn.classList.remove("pulse");
    wearBtn.classList.add("done-static");
    (wearBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "태양이 <b>한 입 베어문 모양</b>이에요! 달처럼 이지러지고 있어요.";
    window.setTimeout(() => {
      face("curious");
      askChoices(
        choicesBox,
        s.choices ?? ["구름이 태양을 가리는 중이다", "달이 태양 앞을 지나가는 중이다", "태양이 실제로 조금씩 꺼지고 있다"],
        helper,
        "예측 완료! 태양·달·지구를 <b>직접 일렬로 세워서</b> 확인해 봐요.",
        finish,
      );
    }, 900);
  });
}
