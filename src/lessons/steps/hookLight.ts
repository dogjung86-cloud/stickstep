// hookLight — 중2 III(빛과 파동) 훅 장면 8종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션 + 키라이트 + 접촉 그림자 + 최암색 외곽선),
// 캐릭터(고양이·스틱맨)만 손그림 라인 유지. 상태 애니메이션 CSS는 ui.css의 "중2 III 훅" 섹션.

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

// ── L1: 산 위의 거울 — 겨울 해가 안 드는 마을(노르웨이 류칸 실화) ──
// 기하 규약(반사 법칙으로 검산):
//   태양 원반 (30,24) 가장자리 S=(38,26) → 거울 중심 M=(64,28), 입사 방향 u=(0.997,0.077).
//   거울면 각도별 반사 방향(v = u − 2(u·n)n):
//   s1 글라스 −15° → v=(0.825,−0.565) → 하늘 (93,8) / s2 10° → v=(0.963,0.269) → 마을 위 (232,75)
//   s3 22.6° → v=(0.757,0.654) → 마을 명중 (182,130). CSS 회전값이 이 각도와 1:1 대응.
function mirrortownSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A5580"/><stop offset=".55" stop-color="#2C4166"/><stop offset="1" stop-color="#243450"/></linearGradient>
      <linearGradient id="hl-mt" x1="0" y1="40" x2="60" y2="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5E7294"/><stop offset=".55" stop-color="#42536F"/><stop offset="1" stop-color="#2C3A52"/></linearGradient>
      <linearGradient id="hl-vil" x1="150" y1="120" x2="230" y2="160" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4E5F7C"/><stop offset="1" stop-color="#333F56"/></linearGradient>
      <radialGradient id="hl-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4CC"/><stop offset=".55" stop-color="#FFD470"/><stop offset="1" stop-color="#FFD470" stop-opacity="0"/></radialGradient>
      <linearGradient id="hl-beamg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".95"/><stop offset="1" stop-color="#FFE9A8" stop-opacity=".3"/></linearGradient>
      <linearGradient id="hl-shade" x1="0" y1="0" x2="1" y2=".3"><stop offset="0" stop-color="#101A2E" stop-opacity=".38"/><stop offset="1" stop-color="#101A2E" stop-opacity=".16"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="150" rx="12" fill="url(#hl-sky)"/>
    <!-- 겨울 태양 — 하늘 왼쪽 위, 빛은 여기서 출발한다 -->
    <g class="hl-sunbody">
      <circle cx="30" cy="24" r="19" fill="url(#hl-sun)"/>
      <circle cx="30" cy="24" r="9" fill="#FFEEB0"/>
      <circle cx="27" cy="21" r="3.4" fill="#FFF8DC"/>
      ${[20, 65, 115, 160, 205, 250, 295, 340].map((a) => {
        const r = (a * Math.PI) / 180;
        const c = Math.cos(r);
        const s = Math.sin(r);
        return `<line x1="${(30 + c * 12.5).toFixed(1)}" y1="${(24 + s * 12.5).toFixed(1)}" x2="${(30 + c * 16.5).toFixed(1)}" y2="${(24 + s * 16.5).toFixed(1)}" stroke="#FFE9A8" stroke-width="2" opacity=".85"/>`;
      }).join("")}
    </g>
    <path d="M6 158L64 44l52 114z" fill="url(#hl-mt)"/>
    <path d="M64 44l14 28-9 3 13 26" stroke="#8FA6C8" stroke-width="2" opacity=".5" fill="none"/>
    <path d="M52 68q10-6 22 0" stroke="#EAF2FF" stroke-width="3" opacity=".8"/>
    <!-- 산그늘 — 골짜기(마을 쪽)가 어두운 이유 -->
    <path d="M64 44L234 130v28H96z" fill="url(#hl-shade)"/>
    <!-- 마을(그늘) -->
    <g class="hl-village">
      <ellipse cx="188" cy="156" rx="42" ry="4" fill="#0B1524" opacity=".3"/>
      <path d="M156 132h26v22h-26z" fill="url(#hl-vil)"/>
      <path d="M154 132l15-12 15 12z" fill="#5E7294"/>
      <path d="M186 138h24v16h-24z" fill="url(#hl-vil)"/>
      <path d="M184 138l14-11 14 11z" fill="#5E7294"/>
      <rect class="hl-win" x="163" y="139" width="7" height="8" rx="1.5" fill="#3A4A66"/>
      <rect class="hl-win" x="193" y="143" width="7" height="7" rx="1.5" fill="#3A4A66"/>
    </g>
    <!-- 태양 → 거울 입사광(항상 표시 — 빛의 출발점은 태양) -->
    <path class="hl-bin" d="M38 26L64 28" stroke="url(#hl-beamg)" stroke-width="4"/>
    <!-- 반사 빔(상태별) — 각 상태의 거울면 각도로 반사 법칙 검산 완료 -->
    <path class="hl-beam hl-b0" d="M38 26L64 28L93 8" stroke="url(#hl-beamg)" stroke-width="4" opacity="0"/>
    <path class="hl-beam hl-b1" d="M38 26L64 28L232 75" stroke="url(#hl-beamg)" stroke-width="4" opacity="0"/>
    <path class="hl-beam hl-b2" d="M38 26L64 28L182 130" stroke="url(#hl-beamg)" stroke-width="5" opacity="0"/>
    <!-- 산꼭대기 거울(빔 위에 그려 회전이 또렷이 보이게) -->
    <g class="hl-mirror">
      <path d="M64 44v-13" stroke="#8B95A1" stroke-width="2.6"/>
      <g class="hl-mirror-glass">
        <rect x="52" y="24.5" width="24" height="7" rx="2.5" fill="#CFE4F8" stroke="#8FB2D8" stroke-width="1.4"/>
        <path d="M55 26.5h8" stroke="#FFFFFF" stroke-width="1.8"/>
      </g>
    </g>
    <circle class="hl-spot" cx="182" cy="130" r="14" fill="#FFE9A8" opacity="0"/>
  </svg>`;
}

export function renderMirrorTown(
  scene: HTMLElement,
  helper: HTMLElement,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hl-town s0", attrs: { role: "img", "aria-label": "산 그늘에 잠긴 겨울 마을과 산 위의 거울" } });
  fig.innerHTML = mirrortownSvg();
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "산 위의 거울 돌리기" }));
  scene.append(fig, btn);
  helper.innerHTML =
    "노르웨이의 이 산골 마을은 <b>겨울 내내 해가 산에 가려</b> 그늘이에요. 사람들은 산꼭대기에 <b>거대한 거울</b>을 세웠죠. 거울을 돌려 마을을 비춰 보세요!";

  let stage = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (stage >= 3) return;
    stage++;
    haptic(HAPTIC.select);
    fig.classList.remove("s0", "s1", "s2", "s3");
    fig.classList.add(`s${stage}`);
    if (stage === 1) {
      face("surprised");
      helper.innerHTML = "햇빛이 하늘로 튕겨 나갔어요! 거울이 너무 서 있네요. <b>한 번 더</b> 돌려 봐요.";
    } else if (stage === 2) {
      helper.innerHTML = "아깝다 — 이번엔 마을 지붕 <b>위로 휙</b> 지나갔어요. 조금만 되돌려요!";
    } else {
      (btn as HTMLButtonElement).disabled = true;
      btn.classList.add("done-static");
      (btn.querySelector("span") as HTMLElement).textContent = "명중! 마을이 환해졌어요";
      face("smile");
      haptic(HAPTIC.correct);
      helper.innerHTML =
        "광장에 햇빛이 쏟아져요! 거울이 빛의 <b>방향을 꺾어</b> 준 거예요. 그런데 — 빛은 거울에서 <b>어떤 규칙</b>으로 꺾일까요? 실험실에서 각도를 재 봐요.";
      timer = window.setTimeout(() => {
        face("curious");
        finish();
      }, 700);
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L2: 물을 부으면 나타나는 동전 ──────────────────────────
function coinSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hlc-cup" x1="70" y1="50" x2="170" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F7FAFE"/><stop offset=".5" stop-color="#DCE6F2"/><stop offset="1" stop-color="#C0CEDF"/>
      </linearGradient>
      <linearGradient id="hlc-water" x1="0" y1="70" x2="0" y2="145" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#BFDCFF" stop-opacity=".85"/><stop offset="1" stop-color="#8FBBF2" stop-opacity=".6"/>
      </linearGradient>
      <radialGradient id="hlc-coin" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFE28A"/><stop offset="1" stop-color="#D8A23A"/></radialGradient>
    </defs>
    <ellipse cx="120" cy="152" rx="58" ry="5" fill="#2A3A5E" opacity=".12"/>
    <!-- 물(부으면 차오름) -->
    <g class="hlc-waterbox" opacity="0">
      <path d="M78 84h84v56a8 8 0 0 1-8 8H86a8 8 0 0 1-8-8z" fill="url(#hlc-water)"/>
      <ellipse cx="120" cy="84" rx="42" ry="5" fill="#E4F0FF" opacity=".9"/>
    </g>
    <!-- 동전 -->
    <ellipse class="hlc-coin" cx="104" cy="141" rx="13" ry="4.6" fill="url(#hlc-coin)" stroke="#A87820" stroke-width="1.4"/>
    <path d="M98 140q6-2.4 12 0" stroke="#FFF2C8" stroke-width="1.4" opacity=".8"/>
    <!-- 컵(반투명 유리) -->
    <path d="M74 50h92l-6 92a8 8 0 0 1-8 8H88a8 8 0 0 1-8-8z" fill="url(#hlc-cup)" opacity=".28"/>
    <path d="M74 50h92l-6 92a8 8 0 0 1-8 8H88a8 8 0 0 1-8-8z" stroke="#9DB4CE" stroke-width="2.4"/>
    <path d="M82 60l4 74" stroke="#FFFFFF" stroke-width="2.6" opacity=".6"/>
    <!-- 시선(눈 → 컵) : 물 없으면 테두리에 막히고, 있으면 굴절해 동전까지 -->
    <g stroke-width="2.4">
      <path class="hlc-ray-block" d="M226 44L168 66" stroke="#8FA6C8" stroke-dasharray="5 5"/>
      <path class="hlc-ray-bent" d="M226 44L162 84 104 138" stroke="#FFD98A" stroke-dasharray="5 5" opacity="0"/>
    </g>
    <!-- 눈(오른쪽 위) -->
    <g transform="translate(228,42)">
      <path d="M-12 0Q0-9 12 0Q0 9 -12 0z" fill="#FFFFFF" stroke="#31415C" stroke-width="2"/>
      <circle cx="-2" cy="0" r="4" fill="#2E6DB4"/>
      <circle cx="-3" cy="-1" r="1.4" fill="#FFFFFF"/>
    </g>
  </svg>`;
}

export function renderCoinMagic(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hlc", attrs: { role: "img", "aria-label": "빈 컵 바닥의 동전 — 컵 벽에 가려 보이지 않아요" } });
  fig.innerHTML = coinSvg();
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "물 붓기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "컵 바닥에 동전이 있지만, 이 눈높이에선 <b>컵 벽에 가려 안 보여요</b>. 그대로 두고 <b>물만</b> 부으면…?";

  let timer = 0;
  let done = false;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.add("done-static");
    (btn.querySelector("span") as HTMLElement).textContent = "동전이 나타났어요!";
    fig.classList.add("filled");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "우와 — 눈도 컵도 동전도 <b>그대로</b>인데 동전이 보여요! 왜일까요?";
    timer = window.setTimeout(() => {
      face("curious");
      ask(
        choicesBox,
        s.choices ?? ["동전의 빛이 수면에서 꺾여 눈까지 와서", "물이 돋보기처럼 컵 속을 키워서", "동전이 물에 살짝 떠올라서"],
        helper,
        "예측 완료! 실험실에서 빛이 물을 만나면 <b>어떻게 꺾이는지</b> 직접 쏘아 봐요.",
        finish,
      );
    }, 850);
  });
  return () => window.clearTimeout(timer);
}

// ── L3: 캄캄한 방 — 전등 켜기 ───────────────────────────────
function darkroomSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <radialGradient id="hld-glow" cx=".5" cy=".18" r=".9"><stop offset="0" stop-color="#FFE9B8" stop-opacity=".9"/><stop offset=".45" stop-color="#FFDf9A" stop-opacity=".28"/><stop offset="1" stop-color="#FFDF9A" stop-opacity="0"/></radialGradient>
      <linearGradient id="hld-desk" x1="0" y1="118" x2="0" y2="136" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8A6A44"/><stop offset="1" stop-color="#5E4426"/></linearGradient>
      <linearGradient id="hld-book" x1="96" y1="104" x2="150" y2="120" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6FAFF"/><stop offset="1" stop-color="#C9D8EA"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="150" rx="12" fill="#0A111E"/>
    <!-- 불빛(켜지면) -->
    <g class="hld-light" opacity="0">
      <rect x="6" y="8" width="228" height="150" rx="12" fill="url(#hld-glow)"/>
      <path d="M120 30L74 118h92z" fill="#FFE9B8" opacity=".12"/>
    </g>
    <!-- 천장 전등 -->
    <path d="M120 8v14" stroke="#5E6B7E" stroke-width="2.6"/>
    <path d="M108 30q12-12 24 0l-4 6h-16z" fill="#8FA0B8"/>
    <circle class="hld-bulb" cx="120" cy="40" r="7" fill="#3A4453"/>
    <!-- 책상 + 책 + 고양이(불 켜져야 보임) -->
    <g class="hld-stuff" opacity=".08">
      <ellipse cx="120" cy="140" rx="72" ry="5" fill="#000" opacity=".4"/>
      <rect x="52" y="118" width="136" height="9" rx="4" fill="url(#hld-desk)"/>
      <path d="M60 127v14M180 127v14" stroke="#4A3520" stroke-width="4"/>
      <path d="M96 118l24-10 26 8-24 9z" fill="url(#hld-book)" stroke="#8FA0B8" stroke-width="1.4"/>
      <path d="M120 108l2 8" stroke="#AFC2D8" stroke-width="1.4"/>
      <!-- 고양이(손그림 라인) -->
      <g stroke="#E8EEF6" stroke-width="2.2" fill="none">
        <circle cx="160" cy="98" r="9.5" fill="#0E1626"/>
        <path d="M153 92l-2.5-6 6 2.5M167 92l2.5-6-6 2.5"/>
        <path d="M156 99h2.6M161.5 99h2.6" stroke-width="1.8"/>
        <path d="M160 102q-1.5 1.6-3 0M160 102q1.5 1.6 3 0" stroke-width="1.6"/>
        <path d="M152 108q8 6 16 0" stroke-width="2"/>
        <path d="M170 108q6 3 5 9" stroke-width="2"/>
      </g>
    </g>
    <!-- 부스럭 표시(어두울 때) -->
    <g class="hld-rustle" stroke="#5E7294" stroke-width="2">
      <path d="M164 84q3-4 0-8M172 86q4-5 0-11"/>
    </g>
  </svg>`;
}

export function renderDarkroom(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hld", attrs: { role: "img", "aria-label": "캄캄한 방 — 무언가 부스럭거려요" } });
  fig.innerHTML = darkroomSvg();
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "전등 켜기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "한밤중, 캄캄한 방에서 <b>부스럭</b> 소리가! 아무것도 안 보여요. 스위치를 켜 볼까요?";

  let timer = 0;
  let done = false;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.add("done-static");
    (btn.querySelector("span") as HTMLElement).textContent = "범인은 고양이!";
    fig.classList.add("lit");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "고양이가 책 위에! 그런데 이상하죠 — 고양이는 <b>아까도 거기 있었어요</b>. 빛이 있어야만 보이는 이유는 뭘까요?";
    timer = window.setTimeout(() => {
      face("curious");
      ask(
        choicesBox,
        s.choices ?? ["물체에서 반사된 빛이 눈에 들어와야 보인다", "눈에서 나간 빛이 물체에 닿아야 보인다", "밝으면 눈이 커져서 잘 보이는 것뿐이다"],
        helper,
        "예측 완료! 밤 캠핑장에서 <b>빛의 경로</b>를 직접 이어 봐요.",
        finish,
      );
    }, 850);
  });
  return () => window.clearTimeout(timer);
}

// ── L4: 거울 앞 고양이 ──────────────────────────────────────
function catmirrorSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hlm-fr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9AA6E"/><stop offset="1" stop-color="#9A7A42"/></linearGradient>
      <linearGradient id="hlm-gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EAF4FF"/><stop offset=".55" stop-color="#CFE0F4"/><stop offset="1" stop-color="#AFC8E8"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="156" rx="86" ry="5" fill="#2A3A5E" opacity=".12"/>
    <!-- 거울(세로 스탠드) -->
    <rect x="112" y="26" width="10" height="124" rx="5" fill="url(#hlm-fr)"/>
    <rect x="122" y="30" width="76" height="116" rx="10" fill="url(#hlm-gl)" opacity=".9"/>
    <rect x="122" y="30" width="76" height="116" rx="10" stroke="#8FB2D8" stroke-width="1.6"/>
    <path d="M130 42q-4 18 2 34" stroke="#FFFFFF" stroke-width="3" opacity=".75"/>
    <!-- 실제 고양이(왼쪽, 손그림 라인) -->
    <g class="hlm-cat" stroke="#3C4654" stroke-width="2.6" fill="#FFF7EE">
      <ellipse cx="62" cy="120" rx="24" ry="17"/>
      <circle cx="78" cy="92" r="14"/>
      <path d="M68 82l-3-9 8 4M88 82l3-9-8 4" fill="#FFF7EE"/>
      <circle cx="74" cy="90" r="1.8" fill="#3C4654" stroke="none"/>
      <circle cx="83" cy="90" r="1.8" fill="#3C4654" stroke="none"/>
      <path d="M78 95q-1.8 2-3.6 0M78 95q1.8 2 3.6 0" stroke-width="1.8" fill="none"/>
      <path d="M40 118q-8-2-7-10" fill="none"/>
      <g class="hlm-paw"><path d="M84 108l12-6" fill="none"/><circle cx="97" cy="101" r="4" fill="#FFF7EE"/></g>
      <path class="hlm-leg" d="M52 134v6M72 136v5" fill="none"/>
    </g>
    <!-- 거울 속 상(오른쪽, 반전 + 반투명) -->
    <g class="hlm-img" opacity=".55" stroke="#5E7294" stroke-width="2.4" fill="#EDF3FB">
      <ellipse cx="172" cy="118" rx="20" ry="14.5"/>
      <circle cx="158" cy="94" r="12"/>
      <path d="M150 86l-2.6-8 7 3.6M166 86l2.6-8-7 3.6" fill="#EDF3FB"/>
      <circle cx="155" cy="92" r="1.5" fill="#5E7294" stroke="none"/>
      <circle cx="162" cy="92" r="1.5" fill="#5E7294" stroke="none"/>
      <g class="hlm-paw2"><path d="M152 108l-10-5" fill="none"/><circle cx="141" cy="102" r="3.4" fill="#EDF3FB"/></g>
    </g>
  </svg>`;
}

export function renderCatMirror(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("button", { class: "hlm", attrs: { type: "button", "aria-label": "거울 앞 고양이 — 눌러서 앞발 들기" } });
  fig.innerHTML = catmirrorSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "고양이가 거울 속 '낯선 고양이'를 경계 중! <b>고양이를 눌러</b> 앞발을 들게 해 보세요.";

  let taps = 0;
  let timer = 0;
  fig.addEventListener("click", () => {
    if (taps >= 3) return;
    taps++;
    haptic(HAPTIC.tap);
    fig.classList.remove("wave");
    void fig.offsetWidth;
    fig.classList.add("wave");
    if (taps === 1) {
      face("surprised");
      helper.innerHTML = "앞발을 들자 거울 속 고양이도 <b>동시에</b> 들었어요! 몇 번 더 눌러 봐요.";
    } else if (taps === 3) {
      (fig as HTMLButtonElement).disabled = true;
      face("curious");
      helper.innerHTML = "똑같이 따라 하는 거울 속 고양이 — 그런데 저 고양이는 <b>어디에 있는</b> 걸까요?";
      timer = window.setTimeout(() => {
        ask(
          choicesBox,
          s.choices ?? ["거울 뒤쪽에 있는 것처럼 보일 뿐, 실제로는 없다", "거울 표면에 그려져 있다", "거울 뒤에 진짜 고양이 공간이 있다"],
          helper,
          "예측 완료! 실험실에서 상이 생기는 <b>정확한 위치</b>를 작도해 봐요.",
          finish,
        );
      }, 500);
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L5: 숟가락 셀카 — 오목한 앞면 vs 볼록한 뒷면 ─────────────
function spoonSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hls-sp" x1="60" y1="30" x2="150" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F2F7FD"/><stop offset=".5" stop-color="#C6D3E2"/><stop offset="1" stop-color="#93A5BC"/>
      </linearGradient>
      <radialGradient id="hls-bowl" cx=".38" cy=".3" r=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#D2DEEC"/><stop offset="1" stop-color="#9FB2C9"/></radialGradient>
    </defs>
    <ellipse cx="120" cy="158" rx="66" ry="5" fill="#2A3A5E" opacity=".12"/>
    <!-- 숟가락 -->
    <ellipse cx="104" cy="74" rx="46" ry="56" fill="url(#hls-bowl)"/>
    <ellipse cx="104" cy="74" rx="46" ry="56" stroke="#7E92AC" stroke-width="2.4"/>
    <path d="M78 40q-10 22 0 48" stroke="#FFFFFF" stroke-width="4" opacity=".8"/>
    <path d="M139 110l52 44" stroke="url(#hls-sp)" stroke-width="13" stroke-linecap="round"/>
    <path d="M141 114l46 39" stroke="#FFFFFF" stroke-width="2.4" opacity=".55"/>
    <!-- 앞면(오목): 거꾸로 작은 스틱맨 얼굴 -->
    <g class="hls-front" stroke="#3C4654" stroke-width="2.2" fill="none" transform="rotate(180 104 74)">
      <circle cx="104" cy="74" r="15" fill="#FFFFFF"/>
      <circle cx="98.5" cy="70" r="1.7" fill="#3C4654" stroke="none"/>
      <circle cx="109.5" cy="70" r="1.7" fill="#3C4654" stroke="none"/>
      <path d="M97 80q7 5 14 0"/>
    </g>
    <!-- 뒷면(볼록): 바로 선 작은 얼굴 -->
    <g class="hls-back" stroke="#3C4654" stroke-width="2.2" fill="none" opacity="0">
      <circle cx="104" cy="74" r="13" fill="#FFFFFF"/>
      <circle cx="99.5" cy="71" r="1.5" fill="#3C4654" stroke="none"/>
      <circle cx="108.5" cy="71" r="1.5" fill="#3C4654" stroke="none"/>
      <path d="M98 79q6 4.5 12 0"/>
    </g>
  </svg>`;
}

export function renderSpoon(
  scene: HTMLElement,
  helper: HTMLElement,
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hls front", attrs: { role: "img", "aria-label": "숟가락 앞면에 비친 거꾸로 선 얼굴" } });
  fig.innerHTML = spoonSvg();
  const seg = el("div", { class: "seg" });
  const frontBtn = el("button", { class: "on", text: "오목한 앞면", attrs: { type: "button", "aria-pressed": "true" } });
  const backBtn = el("button", { text: "볼록한 뒷면", attrs: { type: "button", "aria-pressed": "false" } });
  seg.append(frontBtn, backBtn);
  scene.append(fig, seg);
  helper.innerHTML = "숟가락 <b>오목한 앞면</b>에 얼굴을 비추면 — 어라, <b>거꾸로</b>! 이제 <b>뒷면</b>으로 뒤집어 봐요.";

  const seen = new Set<string>(["front"]);
  let timer = 0;
  const setSide = (side: "front" | "back"): void => {
    if (fig.classList.contains(side)) return;
    fig.classList.toggle("front", side === "front");
    fig.classList.toggle("back", side === "back");
    frontBtn.classList.toggle("on", side === "front");
    backBtn.classList.toggle("on", side === "back");
    frontBtn.setAttribute("aria-pressed", String(side === "front"));
    backBtn.setAttribute("aria-pressed", String(side === "back"));
    fig.setAttribute("aria-label", side === "front" ? "오목한 앞면 — 거꾸로 선 얼굴" : "볼록한 뒷면 — 바로 선 작은 얼굴");
    haptic(HAPTIC.select);
    seen.add(side);
    if (side === "back") {
      face("surprised");
      helper.innerHTML = "뒷면(볼록)에선 <b>바로 선 작은 얼굴</b>! 같은 숟가락인데 면의 <b>휜 방향</b>만 달라요.";
    } else {
      helper.innerHTML = "다시 앞면(오목) — <b>거꾸로</b>! 신기하죠?";
    }
    if (seen.size === 2) {
      timer = window.setTimeout(() => {
        face("curious");
        helper.innerHTML =
          "오목하면 거꾸로, 볼록하면 바로?! 게다가 거리에 따라서도 달라진대요. 실험실 <b>광학 벤치</b>에서 네 가지 거울·렌즈를 전부 비교해 봐요!";
        finish();
      }, 900);
    }
  };
  frontBtn.addEventListener("click", () => setSide("front"));
  backBtn.addEventListener("click", () => setSide("back"));
  return () => window.clearTimeout(timer);
}

// ── L6: 점묘화 — 빨강+초록 점이 만든 노란 물고기 ─────────────
function pointillismSvg(): string {
  const dots: string[] = [];
  // 물고기 몸통 영역에 빨강·초록 점을 교차로 뿌린다(결정적 배치)
  for (let i = 0; i < 90; i++) {
    const a = (i * 137.5) % 360;
    const rr = Math.sqrt((i % 45) / 45);
    const x = 108 + Math.cos((a * Math.PI) / 180) * rr * 46;
    const y = 82 + Math.sin((a * Math.PI) / 180) * rr * 27;
    const c = i % 2 ? "#E5322E" : "#12A84E";
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="${c}"/>`);
  }
  for (let i = 0; i < 16; i++) {
    const x = 160 + (i % 4) * 7 + (i % 2) * 3;
    const y = 66 + Math.floor(i / 4) * 11;
    const c = i % 2 ? "#E5322E" : "#12A84E";
    dots.push(`<circle cx="${x}" cy="${y}" r="2.4" fill="${c}"/>`);
  }
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hlp-fr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9AA6E"/><stop offset="1" stop-color="#9A7A42"/></linearGradient>
      <radialGradient id="hlp-fish" cx=".4" cy=".4" r=".75"><stop offset="0" stop-color="#FFE884"/><stop offset="1" stop-color="#F5C93C"/></radialGradient>
    </defs>
    <rect x="14" y="12" width="212" height="146" rx="6" fill="#F4EFE4"/>
    <rect x="14" y="12" width="212" height="146" rx="6" stroke="url(#hlp-fr)" stroke-width="7"/>
    <rect x="20" y="18" width="200" height="134" rx="3" stroke="#D8CBAE" stroke-width="1.6"/>
    <!-- 멀리서 본 노란 물고기 -->
    <g class="hlp-far">
      <ellipse cx="108" cy="82" rx="48" ry="29" fill="url(#hlp-fish)"/>
      <path d="M152 82l30-19v38z" fill="url(#hlp-fish)"/>
      <circle cx="86" cy="76" r="4" fill="#3C4654"/>
      <path d="M96 94q12 7 24 0" stroke="#D8A93C" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M64 120q40 12 96 2" stroke="#7FB8D8" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    </g>
    <!-- 확대해 보면 — 점, 점, 점 -->
    <g class="hlp-near" opacity="0">
      ${dots.join("")}
      <circle cx="86" cy="76" r="4.2" fill="#3C4654"/>
      <circle cx="66" cy="120" r="2.6" fill="#3A7CC8"/><circle cx="84" cy="124" r="2.6" fill="#3A7CC8"/>
      <circle cx="104" cy="123" r="2.6" fill="#3A7CC8"/><circle cx="124" cy="121" r="2.6" fill="#3A7CC8"/>
    </g>
    <g class="hlp-loupe" opacity="0">
      <circle cx="150" cy="86" r="34" stroke="#8B95A1" stroke-width="4"/>
      <path d="M174 112l16 16" stroke="#8B95A1" stroke-width="7" stroke-linecap="round"/>
    </g>
  </svg>`;
}

export function renderPointillism(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("button", { class: "hlp", attrs: { type: "button", "aria-label": "점묘화 속 노란 물고기 — 눌러서 확대" } });
  fig.innerHTML = pointillismSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "화가가 점만 찍어 그린 그림이에요. 물고기가 <b>노란색</b>이네요! 그림을 <b>눌러 확대</b>해 보세요.";

  let timer = 0;
  let zoomed = false;
  fig.addEventListener("click", () => {
    if (zoomed) return;
    zoomed = true;
    (fig as HTMLButtonElement).disabled = true;
    fig.classList.add("zoom");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "가까이 보니 — <b>빨간 점과 초록 점</b>뿐! 노란 물감은 한 방울도 안 썼어요. 그런데 왜 노랗게 보였을까요?";
    timer = window.setTimeout(() => {
      face("curious");
      ask(
        choicesBox,
        s.choices ?? ["빨간 빛과 초록 빛이 눈에서 합쳐져 노랑으로 보였다", "빨강과 초록 물감이 종이에서 섞여 노랑이 됐다", "노란 조명이 그림을 비추고 있었다"],
        helper,
        "예측 완료! 실험실에서 <b>빛의 삼원색</b>을 직접 겹쳐 봐요.",
        finish,
      );
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

// ── L7: 낚시찌와 물결 ────────────────────────────────────────
function fishingSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hlf-water" x1="0" y1="86" x2="0" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#6FA8E0"/><stop offset="1" stop-color="#31609E"/>
      </linearGradient>
      <linearGradient id="hlf-float" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF7A6E"/><stop offset="1" stop-color="#E0453A"/></linearGradient>
    </defs>
    <rect x="6" y="8" width="228" height="150" rx="12" fill="#17263C"/>
    <rect x="6" y="88" width="228" height="70" rx="12" fill="url(#hlf-water)" opacity=".8"/>
    <path d="M6 90h228" stroke="#BFDCFF" stroke-width="2" opacity=".7"/>
    <!-- 스틱맨 낚시꾼 -->
    <g stroke="#E8EEF6" stroke-width="2.4" fill="none">
      <circle cx="34" cy="40" r="8"/>
      <path d="M34 48v18M34 53l10 6M34 53l-8 7M34 66l-7 12M34 66l8 12"/>
      <path d="M44 59L84 36" stroke-width="2"/>
      <path d="M84 36q2 22-4 46" stroke="#AFC2D8" stroke-width="1.4" stroke-dasharray="3 4"/>
    </g>
    <!-- 물결(돌 던지면 퍼짐) -->
    <g class="hlf-rip" stroke="#D6EAFF" stroke-width="2" opacity="0">
      <ellipse cx="150" cy="92" rx="10" ry="3"/>
      <ellipse cx="150" cy="92" rx="24" ry="7" opacity=".7"/>
      <ellipse cx="150" cy="92" rx="40" ry="11" opacity=".4"/>
    </g>
    <!-- 찌(빨강) -->
    <g class="hlf-float">
      <path d="M80 74v22" stroke="#F5B63C" stroke-width="3"/>
      <ellipse cx="80" cy="90" rx="6.5" ry="9" fill="url(#hlf-float)" stroke="#A8261E" stroke-width="1.4"/>
      <ellipse cx="78" cy="86" rx="2" ry="3" fill="#FFD1C8" opacity=".8"/>
    </g>
    <!-- 던질 돌 표시 -->
    <circle class="hlf-stone" cx="196" cy="30" r="7" fill="#8B95A1" stroke="#5E6B7E" stroke-width="1.6"/>
  </svg>`;
}

export function renderFishing(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hlf", attrs: { role: "img", "aria-label": "잔잔한 호수에 낚시찌가 떠 있어요" } });
  fig.innerHTML = fishingSvg();
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "퐁당 — 돌 던지기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "고요한 호수에 빨간 낚시찌가 <b>둥실</b>. 저 옆에 돌을 던지면 물결이 일 텐데 — 던져 볼까요?";

  let timer = 0;
  let done = false;
  btn.addEventListener("click", () => {
    if (done) return;
    done = true;
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.add("done-static");
    (btn.querySelector("span") as HTMLElement).textContent = "물결이 퍼져요!";
    fig.classList.add("splash");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "동심원 물결이 찌 쪽으로 <b>퍼져 가요</b>! 물결이 찌를 지나가면, 찌는 어떻게 될까요?";
    timer = window.setTimeout(() => {
      face("curious");
      ask(
        choicesBox,
        s.choices ?? ["제자리에서 위아래로만 출렁인다", "물결을 따라 물가로 밀려온다", "물결에 밀려 반대쪽으로 떠내려간다"],
        helper,
        "예측 완료! 실험실 물결 수조에서 <b>탁구공</b>으로 직접 확인해요.",
        finish,
      );
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

// ── L8: 칼림바 — 길이가 다른 막대의 소리 ─────────────────────
function kalimbaSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hlk-body" x1="60" y1="40" x2="180" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#C89A5A"/><stop offset=".55" stop-color="#A97C42"/><stop offset="1" stop-color="#7E5A2C"/>
      </linearGradient>
      <linearGradient id="hlk-tine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8EFF6"/><stop offset="1" stop-color="#9FB0C4"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="156" rx="70" ry="5" fill="#2A3A5E" opacity=".12"/>
    <rect x="56" y="44" width="128" height="108" rx="16" fill="url(#hlk-body)"/>
    <rect x="56" y="44" width="128" height="108" rx="16" stroke="#5E421E" stroke-width="2"/>
    <path d="M66 54q30-8 60 0" stroke="#E8CFA0" stroke-width="2.6" opacity=".6"/>
    <circle cx="120" cy="118" r="17" fill="#3A2812"/>
    <circle cx="120" cy="118" r="17" stroke="#5E421E" stroke-width="2"/>
    <rect x="60" y="74" width="120" height="8" rx="4" fill="#5E421E"/>
    <!-- 막대 2개: 긴 것(낮은 음) / 짧은 것(높은 음) -->
    <g class="hlk-t1">
      <rect x="86" y="30" width="13" height="74" rx="6" fill="url(#hlk-tine)" stroke="#5E7294" stroke-width="1.6"/>
      <rect x="89" y="34" width="3" height="30" rx="1.5" fill="#FFFFFF" opacity=".7"/>
    </g>
    <g class="hlk-t2">
      <rect x="140" y="48" width="13" height="56" rx="6" fill="url(#hlk-tine)" stroke="#5E7294" stroke-width="1.6"/>
      <rect x="143" y="52" width="3" height="22" rx="1.5" fill="#FFFFFF" opacity=".7"/>
    </g>
    <!-- 소리 물결 -->
    <g class="hlk-w1" stroke="#8A6BFF" stroke-width="2.2" opacity="0">
      <path d="M74 34q-6 8 0 16M66 28q-9 12 0 26"/>
    </g>
    <g class="hlk-w2" stroke="#37B6D8" stroke-width="2.2" opacity="0">
      <path d="M166 50q5 6 0 12M173 45q8 10 0 21"/>
    </g>
  </svg>`;
}

export function renderKalimba(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hlk" });
  fig.innerHTML = kalimbaSvg();
  const longBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "긴 막대 튕기기" }));
  const shortBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "짧은 막대 튕기기" }));
  const btnRow = el("div", { class: "gp-controls" }, longBtn, shortBtn);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btnRow, choicesBox);
  helper.innerHTML = "엄지 피아노 <b>칼림바</b>예요. 두 막대를 <b>각각 튕겨</b> 소리를 비교해 보세요!";

  // 훅에서도 진짜 소리 — 탭은 사용자 제스처라 오디오 허용. 실패하면 조용히 시각만.
  let actx: AudioContext | null = null;
  const ping = (freqHz: number): void => {
    try {
      if (!actx) {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        actx = new AC();
      }
      void actx.resume();
      const osc = actx.createOscillator();
      const g = actx.createGain();
      osc.type = "sine";
      osc.frequency.value = freqHz;
      g.gain.setValueAtTime(0.14, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.7);
      osc.connect(g);
      g.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + 0.75);
    } catch {
      actx = null;
    }
  };

  const plucked = new Set<string>();
  let timer = 0;
  const pluck = (which: "long" | "short"): void => {
    haptic(HAPTIC.select);
    fig.classList.remove("p1", "p2");
    void fig.offsetWidth;
    fig.classList.add(which === "long" ? "p1" : "p2");
    ping(which === "long" ? 262 : 523);
    plucked.add(which);
    if (plucked.size === 1) {
      face("surprised");
      helper.innerHTML = which === "long" ? "<b>둥—</b> 낮고 묵직한 소리! 이제 <b>짧은 막대</b>도!" : "<b>띵!</b> 높고 맑은 소리! 이제 <b>긴 막대</b>도!";
    } else if (!choicesBox.classList.contains("show")) {
      face("curious");
      helper.innerHTML = "긴 막대는 <b>낮은 소리</b>, 짧은 막대는 <b>높은 소리</b> — 같은 세기로 튕겼는데 왜 다를까요?";
      timer = window.setTimeout(() => {
        ask(
          choicesBox,
          s.choices ?? ["막대 길이가 달라 1초에 떨리는 횟수가 달라서", "긴 막대가 더 무거워 소리가 커져서", "짧은 막대가 몸통에 더 가까워서"],
          helper,
          "예측 완료! 실험실 소리 합성기에서 <b>진동수</b>를 직접 돌려 봐요.",
          finish,
        );
      }, 800);
    }
  };
  longBtn.addEventListener("click", () => pluck("long"));
  shortBtn.addEventListener("click", () => pluck("short"));
  return () => {
    window.clearTimeout(timer);
    void actx?.close();
  };
}
