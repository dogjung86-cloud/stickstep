// hookBio — II 단원(생물의 구성과 다양성) 훅 장면들(hook.ts가 위임).
//   "cellzoom"  L1 · 매끈해 보이는 잎에 확대경을 대면 작은 방(세포)이 드러난다(발견)
//   "stain"     L2 · 투명해 안 보이던 표본에 염색액을 떨어뜨리면 핵이 드러난다 — 왜 염색할까? 예측
//   "bodycount" L3 · 우리 몸은 세포가 몇 개일까? 예측(약 37조 개)
//   "ladybugs"  L4 · 같은 무당벌레인데 무늬가 다 다르다 — 변이 발견
//   "batbird"   L5 · 박쥐는 새 무리일까, 쥐 무리일까? 예측(젖먹이 = 포유류)
//   "foodweb"   L6 · 먹이그물에서 한 종이 사라지면? 예측(연쇄로 흔들린다)
// 파운드리 재질 문법(근-동조 그라데이션·키라이트·접촉 그림자·최암색 외곽선)을 따르고,
// 스틱맨 캐릭터만 손그림 라인을 유지한다. 생물 단원 액센트 = 그린(#12B886).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

interface HookStepLike {
  choices?: string[];
}

// ── L1: 잎 속 작은 방(세포) ─────────────────────────────────
export function renderCellZoom(
  scene: HTMLElement,
  helper: HTMLElement,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio bare" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="czBg" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#EAF7EC"/><stop offset="1" stop-color="#D3EED8"/>
      </linearGradient>
      <radialGradient id="czLeaf" cx=".4" cy=".32" r=".8">
        <stop offset="0" stop-color="#7FD08C"/><stop offset=".6" stop-color="#4CB07A"/><stop offset="1" stop-color="#2C7C45"/>
      </radialGradient>
      <radialGradient id="czLens" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#F4FBF5" stop-opacity=".2"/><stop offset=".8" stop-color="#DFF3E4" stop-opacity=".1"/><stop offset="1" stop-color="#BFE6C8" stop-opacity=".35"/>
      </radialGradient>
      <clipPath id="czClip"><circle cx="150" cy="76" r="40"/></clipPath>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#czBg)"/>
    <!-- 잎 -->
    <path d="M120 30c40 6 60 34 60 66-36 4-66-8-78-36M120 30c-40 6-60 34-60 66 36 4 66-8 78-36" fill="url(#czLeaf)"/>
    <path d="M120 30v106" stroke="#2C7C45" stroke-width="2.4" opacity=".7"/>
    <path d="M120 58c14 4 22 10 30 22M120 58c-14 4-22 10-30 22M120 88c12 3 18 8 24 18M120 88c-12 3-18 8-24 18" stroke="#2C7C45" stroke-width="1.4" opacity=".5"/>
    <ellipse cx="100" cy="52" rx="14" ry="9" fill="#C9F0CF" opacity=".45"/>
    <!-- 확대경 뷰(세포 격자) — 처음엔 숨김 -->
    <g class="cz-cells" clip-path="url(#czClip)">
      <rect x="108" y="34" width="84" height="84" fill="#DCF3DE"/>
      <g stroke="#5F9E6E" stroke-width="1.6">
        <path d="M110 50h80M110 68h80M110 86h80M110 104h80M128 36v82M148 36v82M168 36v82"/>
      </g>
      <g fill="#7C6BFF" opacity=".85">
        <circle cx="119" cy="59" r="3.4"/><circle cx="139" cy="77" r="3.4"/><circle cx="159" cy="59" r="3.4"/>
        <circle cx="177" cy="95" r="3.4"/><circle cx="119" cy="95" r="3.4"/><circle cx="159" cy="95" r="3"/>
      </g>
    </g>
    <!-- 확대경 -->
    <g class="cz-loupe">
      <circle cx="150" cy="76" r="40" fill="url(#czLens)"/>
      <circle cx="150" cy="76" r="40" stroke="#3A424E" stroke-width="4"/>
      <circle cx="150" cy="76" r="35" stroke="#EAF7EC" stroke-width="1.4" opacity=".6"/>
      <path d="M178 104l22 22" stroke="#3A424E" stroke-width="9" stroke-linecap="round"/>
      <path d="M178 104l22 22" stroke="#5A6470" stroke-width="4" stroke-linecap="round"/>
      <path d="M138 60a20 20 0 0 1 12-8" stroke="#fff" stroke-width="3" opacity=".55"/>
    </g>
    <!-- 스틱맨(손그림) -->
    <ellipse cx="40" cy="150" rx="15" ry="2.6" fill="#2A3A5E" opacity=".12"/>
    <g stroke="#3C4654" stroke-width="2.4">
      <circle cx="40" cy="112" r="7.5" fill="#fff"/>
      <path d="M40 120v14M40 125l-9 4M40 125l11-4M40 134l-6 12M40 134l7 12"/>
    </g>
  </svg>`;
  const zoomBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "확대경으로 잎 들여다보기" }));
  scene.append(el("div", { class: "hk-space-wrap" }, fig), zoomBtn);
  helper.innerHTML = "매끈해 보이는 <b>나뭇잎</b>이에요. 그런데 아주 크게 확대하면 뭐가 보일까요? 확대경을 대 봐요!";
  face("curious");

  let done = false;
  zoomBtn.addEventListener("click", () => {
    if (done) return;
    done = true;
    fig.classList.remove("bare");
    fig.classList.add("zoomed");
    zoomBtn.classList.remove("pulse");
    zoomBtn.classList.add("done-static");
    (zoomBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "우아 — 매끈한 줄 알았던 잎이 <b>작은 방들</b>로 가득 차 있어요! 이 방 하나하나가 바로 <b>세포</b>예요.";
    window.setTimeout(() => {
      face("smile");
      helper.innerHTML = "지구의 <b>모든 생물</b>이 이런 세포로 이루어져 있어요. 세포 속으로 더 들어가 볼까요?";
      finish();
    }, 1500);
  });
}

// ── L2: 염색해야 보인다 ─────────────────────────────────────
export function renderStain(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio-stain clear" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="stBg" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0E1626"/><stop offset="1" stop-color="#1A2740"/>
      </linearGradient>
      <radialGradient id="stField" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#F4FAFF" stop-opacity=".12"/><stop offset="1" stop-color="#F4FAFF" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="stDrop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FA0FF"/><stop offset="1" stop-color="#3D63D2"/></linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#stBg)"/>
    <!-- 현미경 시야(원형) -->
    <circle cx="120" cy="90" r="66" fill="#0A1220"/>
    <circle cx="120" cy="90" r="66" fill="url(#stField)"/>
    <circle cx="120" cy="90" r="66" stroke="#2C3A52" stroke-width="3"/>
    <!-- 세포들: clear일 땐 윤곽만 희미, stained일 땐 핵이 파랗게 -->
    <g class="st-cells">
      ${[
        [96, 70], [140, 66], [116, 96], [154, 100], [90, 108], [132, 122], [156, 74], [100, 132],
      ]
        .map(
          ([x, y]) => `<g class="st-cell">
        <ellipse cx="${x}" cy="${y}" rx="18" ry="13" fill="rgba(200,220,255,.05)" stroke="rgba(150,180,230,.35)" stroke-width="1.4"/>
        <circle class="st-nuc" cx="${x - 2}" cy="${y}" r="5" fill="url(#stDrop)"/>
      </g>`,
        )
        .join("")}
    </g>
    <!-- 스포이트 -->
    <g class="st-dropper">
      <rect x="112" y="6" width="16" height="30" rx="4" fill="#4A5568"/>
      <path d="M114 36h12l-6 10z" fill="#6A7688"/>
      <rect x="114" y="2" width="12" height="8" rx="3" fill="#8A6BFF"/>
      <circle class="st-bead" cx="120" cy="50" r="4" fill="url(#stDrop)"/>
    </g>
  </svg>`;
  const dropBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "염색액 한 방울 떨어뜨리기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), dropBtn, choicesBox);
  helper.innerHTML = "현미경에 세포를 올렸는데 <b>너무 투명해서</b> 잘 안 보여요. 과학자들은 왜 <b>염색액</b>을 떨어뜨릴까요?";
  face("curious");

  let dropped = false;
  dropBtn.addEventListener("click", () => {
    if (dropped) return;
    dropped = true;
    fig.classList.remove("clear");
    fig.classList.add("stained");
    dropBtn.classList.remove("pulse");
    dropBtn.classList.add("done-static");
    (dropBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "한 방울 떨어뜨리자 <b>핵이 또렷하게</b> 드러났어요! 자, 그럼 염색액은 무슨 일을 한 걸까요?";
    window.setTimeout(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? ["특정 부분(핵)을 물들여 잘 보이게 한다", "세포를 더 크게 키운다", "세포를 움직이게 한다"],
        good: "맞아요! 염색액이 <b>핵 같은 특정 부분을 물들여</b> 잘 보이게 해요. 진짜 현미경으로 양파 세포를 관찰해 봐요!",
        bad: "세포를 키우거나 움직이게 한 게 아니에요 — 염색액은 <b>핵 같은 특정 부분을 물들여</b> 투명해서 안 보이던 걸 또렷하게 만들어요. 진짜 현미경으로 관찰해 봐요.",
        onDone: finish,
      });
    }, 900);
  });
}

// ── L3: 우리 몸은 세포 몇 개? ───────────────────────────────
export function renderBodyCount(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio-body" });
  // 확대 말풍선 속 세포 격자 — 근-동조 그라데이션 + 좌상단 하이라이트(matterFigures dot 문법)
  const cell = (x: number, y: number): string =>
    `<rect x="${x - 8}" y="${y - 8}" width="16" height="16" rx="4.5" fill="url(#bcCell)" stroke="#2E8C4A" stroke-width="1"/>` +
    `<circle cx="${x + 1}" cy="${y + 1}" r="3.2" fill="url(#bcNuc)"/>` +
    `<ellipse cx="${x - 3}" cy="${y - 3}" rx="3.4" ry="2.2" fill="#FFFFFF" opacity=".45"/>`;
  let grid = "";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) grid += cell(160 + c * 12, 36 + r * 12);
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="bcBg" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#EAF7EC"/><stop offset="1" stop-color="#D8EEDD"/>
      </linearGradient>
      <radialGradient id="bcBody" cx=".4" cy=".28" r=".9"><stop offset="0" stop-color="#5FE0B0"/><stop offset=".55" stop-color="#2FB489"/><stop offset="1" stop-color="#0E7A5E"/></radialGradient>
      <radialGradient id="bcCell" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#B7F0C6"/><stop offset=".55" stop-color="#7FD08C"/><stop offset="1" stop-color="#3B8C4E"/></radialGradient>
      <radialGradient id="bcNuc" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#B49BF0"/><stop offset="1" stop-color="#6E4AC0"/></radialGradient>
      <radialGradient id="bcGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset="1" stop-color="#B7F0D4" stop-opacity="0"/></radialGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#bcBg)"/>
    <!-- 사람 실루엣 (그라데이션 + 하이라이트 + 접촉 그림자) -->
    <ellipse cx="86" cy="152" rx="40" ry="6" fill="#2A3A5E" opacity=".14"/>
    <circle cx="86" cy="42" r="17" fill="url(#bcBody)" stroke="#0E7A5E" stroke-width="1.6"/>
    <path d="M86 60 C 62 60 52 74 52 94 L 52 118 A 8 8 0 0 0 60 126 L 112 126 A 8 8 0 0 0 120 118 L 120 94 C 120 74 110 60 86 60 Z" fill="url(#bcBody)" stroke="#0E7A5E" stroke-width="1.6"/>
    <path d="M56 74 L 40 108 M116 74 L 132 108" stroke="url(#bcBody)" stroke-width="13" stroke-linecap="round"/>
    <path d="M56 74 L 40 108" stroke="#0E7A5E" stroke-width="1" opacity=".4"/>
    <path d="M72 126 L 68 150 M100 126 L 104 150" stroke="url(#bcBody)" stroke-width="13" stroke-linecap="round"/>
    <ellipse cx="79" cy="36" rx="6" ry="4.4" fill="#FFFFFF" opacity=".5"/>
    <ellipse cx="70" cy="82" rx="7" ry="16" fill="#FFFFFF" opacity=".22"/>
    <!-- 확대선 -->
    <path d="M104 66 L 150 44" stroke="#37C08E" stroke-width="1.6" stroke-dasharray="4 4"/>
    <!-- 확대 말풍선: 세포 격자 -->
    <g class="bc-zoom">
      <circle cx="184" cy="60" r="40" fill="url(#bcGlow)"/>
      <circle cx="184" cy="60" r="32" fill="#EDFBEF" stroke="#37C08E" stroke-width="2.6"/>
      <clipPath id="bcClip"><circle cx="184" cy="60" r="30"/></clipPath>
      <g clip-path="url(#bcClip)">${grid}</g>
      <circle cx="184" cy="60" r="32" fill="none" stroke="#2E8C4A" stroke-width="1" opacity=".4"/>
      <ellipse cx="172" cy="44" rx="10" ry="6" fill="#FFFFFF" opacity=".4"/>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), choicesBox);
  helper.innerHTML = "우리 몸도 세포로 이루어져 있어요. 그렇다면 <b>사람 한 명의 몸</b>은 세포가 몇 개나 될까요? 예상해 봐요!";
  face("curious");
  ask(choicesBox, helper, {
    choices: s.choices ?? ["약 37조 개", "약 1만 개", "약 100만 개"],
    good: "정답은 <b>약 37조 개</b>! 상상하기 힘든 숫자죠. 이 많은 세포가 아무렇게나 뭉친 게 아니라, <b>차곡차곡 조립</b>돼 몸이 돼요.",
    bad: "생각보다 훨씬 많아요 — 사람 몸은 <b>약 37조 개</b>의 세포로 이루어져 있어요! 이 많은 세포가 <b>차곡차곡 조립</b>돼 몸이 돼요.",
    onDone: () => {
      fig.classList.add("reveal");
      face("surprised");
      finish();
    },
  });
}

// ── L4: 무당벌레는 다 다르다(변이) ──────────────────────────
export function renderLadybugs(
  scene: HTMLElement,
  helper: HTMLElement,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const NS = "http://www.w3.org/2000/svg";
  // 6마리, 무늬(점 개수·배치)가 제각각
  const bugs: [number, number, number[]][] = [
    [56, 52, [-8, -6, 8, -6, 0, 8]],
    [120, 44, [-9, 0, 9, 0]],
    [184, 54, [-7, -7, 7, -7, -7, 7, 7, 7]],
    [58, 116, [0, -8, -8, 6, 8, 6]],
    [122, 122, [-6, -6, 6, -6, -6, 6, 6, 6, 0, 0]],
    [186, 114, [0, 0]],
  ];
  const bug = (cx: number, cy: number, dots: number[], i: number): string => {
    let spots = "";
    for (let k = 0; k < dots.length; k += 2) {
      spots += `<circle cx="${cx + dots[k]}" cy="${cy + dots[k + 1]}" r="2.4" fill="#1E1210"/>`;
    }
    return `<g class="lb-bug lb-${i}">
      <ellipse cx="${cx}" cy="${cy + 15}" rx="15" ry="3" fill="#2A3A5E" opacity=".12"/>
      <path d="M${cx} ${cy - 15}a15 15 0 0 1 0 30 15 15 0 0 1 0-30z" fill="#1E1210"/>
      <path d="M${cx} ${cy - 14}a14 14 0 0 1 14 14 14 14 0 0 1-14 14z" fill="url(#lbR)"/>
      <path d="M${cx} ${cy - 14}a14 14 0 0 0-14 14 14 14 0 0 0 14 14z" fill="url(#lbR2)"/>
      <path d="M${cx} ${cy - 14}v28" stroke="#1E1210" stroke-width="1.6"/>
      <circle cx="${cx}" cy="${cy - 13}" r="4.4" fill="#1E1210"/>
      ${spots}
      <path d="M${cx - 8} ${cy - 30}a4 4 0 0 1 3 4M${cx + 8} ${cy - 30}a4 4 0 0 0-3 4" stroke="#1E1210" stroke-width="1.4"/>
    </g>`;
  };
  const fig = el("div", { class: "hk-bio" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="${NS}" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="lbBg" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F0F8EC"/><stop offset="1" stop-color="#DCEED0"/>
      </linearGradient>
      <linearGradient id="lbR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0505A"/><stop offset="1" stop-color="#C4283A"/></linearGradient>
      <linearGradient id="lbR2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E23E4C"/><stop offset="1" stop-color="#A81E30"/></linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#lbBg)"/>
    <path d="M14 150q40-10 100-6t112 4" stroke="#9EC77E" stroke-width="2" opacity=".5"/>
    ${bugs.map(([x, y, d], i) => bug(x, y, d, i)).join("")}
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), choicesBox);
  helper.innerHTML = "여기 무당벌레 <b>여섯 마리</b>가 있어요. 전부 <b>같은 종</b>인데… 자세히 보면 이상한 점이 있죠?";
  face("curious");
  let tapped = 0;
  const bugEls = [...fig.querySelectorAll<HTMLElement>(".lb-bug")];
  let asked = false;
  bugEls.forEach((b) => {
    b.style.cursor = "pointer";
    b.addEventListener("click", () => {
      if (b.classList.contains("on")) return;
      b.classList.add("on");
      tapped += 1;
      haptic(HAPTIC.tap);
      if (tapped >= 3 && !asked) {
        asked = true;
        face("surprised");
        helper.innerHTML = "눈치챘나요? <b>무늬(점 개수)가 다 달라요!</b> 같은 종인데도 개체마다 특징이 다른 것 — 이걸 뭐라고 부를까요?";
        ask(choicesBox, helper, {
          choices: ["변이 — 같은 종 안의 차이", "돌연변이 딱 하나", "서로 다른 종이라서"],
          good: "맞아요, <b>변이</b>예요! 이 다양한 변이가 생물다양성의 씨앗이 돼요. 랩에서 그 힘을 확인해 봐요.",
          bad: "돌연변이 하나도, 다른 종도 아니에요 — 같은 종인데 개체마다 특징이 다른 것, 이게 <b>변이</b>예요. 이 변이가 생물다양성의 씨앗이 돼요. 랩에서 확인해 봐요.",
          onDone: finish,
        });
      } else if (tapped < 3) {
        helper.innerHTML = `${tapped}마리 확인 — 점 개수를 세어 보세요. 세 마리는 눌러 비교해 봐요!`;
      }
    });
  });
}

// ── L5: 박쥐는 어느 무리? ───────────────────────────────────
export function renderBatBird(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio-night" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="bbSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1A2140"/><stop offset="1" stop-color="#2E3A5E"/>
      </linearGradient>
      <linearGradient id="bbBat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A4658"/><stop offset="1" stop-color="#2A2734"/></linearGradient>
      <radialGradient id="bbMoon" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FCF6E4"/><stop offset="1" stop-color="#D8CBA0"/></radialGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#bbSky)"/>
    <circle cx="196" cy="40" r="20" fill="url(#bbMoon)"/>
    <circle cx="190" cy="34" r="4" fill="#C9BC90" opacity=".5"/><circle cx="202" cy="48" r="3" fill="#C9BC90" opacity=".4"/>
    <circle cx="40" cy="30" r="1.4" fill="#DCE8FF"/><circle cx="70" cy="20" r="1.1" fill="#DCE8FF"/><circle cx="150" cy="26" r="1.2" fill="#DCE8FF"/>
    <!-- 박쥐 -->
    <g transform="translate(120 84)">
      <path d="M0 -14c6 0 10 5 10 12s-4 13-10 16c-6-3-10-9-10-16s4-12 10-12z" fill="url(#bbBat)"/>
      <path d="M-2 -18a3 3 0 0 1-3-5M2 -18a3 3 0 0 0 3-5" stroke="#2A2734" stroke-width="2.4"/>
      <path d="M-8 -6C-30 -20-52 -16-58 2c14-4 22 2 30 8-4-6-2-12 8-16z" fill="url(#bbBat)"/>
      <path d="M8 -6C30 -20 52 -16 58 2c-14-4-22 2-30 8 4-6 2-12-8-16z" fill="url(#bbBat)"/>
      <path d="M-58 2c14-4 22 2 30 8M58 2c-14-4-22 2-30 8" stroke="#1A1720" stroke-width="1.2" opacity=".6"/>
      <circle cx="-3" cy="-8" r="1.4" fill="#FFD25E"/><circle cx="3" cy="-8" r="1.4" fill="#FFD25E"/>
      <path d="M-4 -2q4 3 8 0" stroke="#1A1720" stroke-width="1.2"/>
    </g>
    <!-- 두 무리 표지 -->
    <g class="bb-side bb-bird">
      <path d="M22 128q8-8 18-4-6 2-4 8" fill="none" stroke="#8FB3E8" stroke-width="2.4"/>
      <text x="34" y="150" fill="#8FB3E8" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">새 무리?</text>
    </g>
    <g class="bb-side bb-mouse">
      <ellipse cx="206" cy="132" rx="12" ry="8" fill="#9A8B7A"/>
      <circle cx="196" cy="128" r="5" fill="#9A8B7A"/><circle cx="193" cy="124" r="2.4" fill="#B8A894"/>
      <path d="M218 132q10 2 8 10" stroke="#9A8B7A" stroke-width="2" fill="none"/>
      <text x="206" y="152" fill="#C4A88A" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">쥐 무리?</text>
    </g>
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), choicesBox);
  helper.innerHTML = "<b>박쥐</b>는 날개가 있어 하늘을 날아요. 그럼 박쥐는 <b>새</b>와 한 무리일까요, 아니면 <b>쥐</b>와 한 무리일까요?";
  face("curious");
  ask(choicesBox, helper, {
    choices: s.choices ?? ["젖을 먹여 키우니 쥐(포유류) 무리", "날개가 있으니 새 무리", "혼자 따로 한 무리"],
    good: "박쥐는 온몸이 털로 덮이고 <b>새끼에게 젖을 먹여</b> 키워요 — 그래서 새가 아니라 <b>쥐와 같은 포유류</b>! 분류는 <b>겉모습이 아니라 진짜 특징</b>으로 해요.",
    bad: "날개만 보면 새 같지만 아니에요 — 박쥐는 <b>온몸이 털로 덮이고 새끼에게 젖을 먹여</b> 키워요. 그래서 <b>쥐와 같은 포유류</b>! 분류는 겉모습이 아니라 진짜 특징으로 해요.",
    onDone: () => {
      face("surprised");
      finish();
    },
  });
}

// ── L6: 먹이그물에서 하나가 빠지면? ─────────────────────────
export function renderFoodWeb(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-bio-web full" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="fwBg" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#EAF3FF"/><stop offset="1" stop-color="#DCEAF6"/>
      </linearGradient>
      <radialGradient id="fwSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F5A028"/></radialGradient>
      <radialGradient id="fwGrass" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#7FD08C"/><stop offset="1" stop-color="#3B8C3B"/></radialGradient>
      <radialGradient id="fwHop" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#A6D96A"/><stop offset="1" stop-color="#5A9E2E"/></radialGradient>
      <radialGradient id="fwFrog" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#6BC48E"/><stop offset="1" stop-color="#2E8C58"/></radialGradient>
      <radialGradient id="fwHawk" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#B08D6A"/><stop offset="1" stop-color="#6D4526"/></radialGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#fwBg)"/>
    <circle cx="210" cy="30" r="14" fill="url(#fwSun)"/>
    <!-- 먹이 사슬 노드: 풀 → 메뚜기 → 개구리 → 매, 화살표로 연결 -->
    <g class="fw-links" stroke="#8FA6C8" stroke-width="2.2">
      <path d="M52 120q24-18 48-8" marker-end="url(#fwArr)"/>
      <path d="M108 104q24-14 44-6" marker-end="url(#fwArr)"/>
      <path d="M160 92q22-16 40-30" marker-end="url(#fwArr)"/>
    </g>
    <defs><marker id="fwArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 1l6 3-6 3z" fill="#8FA6C8"/></marker></defs>
    <!-- 풀 -->
    <g class="fw-node fw-grass"><ellipse cx="44" cy="140" rx="16" ry="4" fill="#2C7C45" opacity=".15"/><circle cx="44" cy="126" r="15" fill="url(#fwGrass)"/><path d="M44 118v-8M38 120l-4-6M50 120l4-6" stroke="#2C7C45" stroke-width="2.4"/><text x="44" y="130" fill="#0E5A2E" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">풀</text></g>
    <!-- 메뚜기 -->
    <g class="fw-node fw-hop"><ellipse cx="102" cy="112" rx="14" ry="4" fill="#2C7C45" opacity=".15"/><circle cx="102" cy="98" r="14" fill="url(#fwHop)"/><path d="M96 96l-8 6M108 96l8 6M100 104l-4 8M104 104l4 8" stroke="#3B7A1E" stroke-width="2"/><text x="102" y="102" fill="#2C5A12" font-size="8.5" text-anchor="middle" font-family="Pretendard, sans-serif">메뚜기</text></g>
    <!-- 개구리 -->
    <g class="fw-node fw-frog"><ellipse cx="156" cy="98" rx="15" ry="4" fill="#2C7C45" opacity=".15"/><circle cx="156" cy="84" r="15" fill="url(#fwFrog)"/><circle cx="150" cy="78" r="3.4" fill="#EAFBF3"/><circle cx="162" cy="78" r="3.4" fill="#EAFBF3"/><circle cx="150" cy="78" r="1.6" fill="#123"/><circle cx="162" cy="78" r="1.6" fill="#123"/><path d="M150 90q6 4 12 0" stroke="#1E5A38" stroke-width="1.8"/></g>
    <!-- 매 -->
    <g class="fw-node fw-hawk"><ellipse cx="204" cy="74" rx="16" ry="4" fill="#2C7C45" opacity=".12"/><circle cx="204" cy="60" r="15" fill="url(#fwHawk)"/><path d="M192 56q-10-6-16-2 8 0 12 6M216 56q10-6 16-2-8 0-12 6" fill="url(#fwHawk)"/><path d="M200 62l8 0-4 5z" fill="#F0B03A"/><circle cx="199" cy="56" r="1.8" fill="#1E1210"/></g>
  </svg>`;
  const pullBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "메뚜기를 사라지게 해 보기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), pullBtn, choicesBox);
  helper.innerHTML = "풀 → 메뚜기 → 개구리 → 매로 이어지는 <b>먹이 관계</b>예요. 만약 가운데 <b>메뚜기가 모두 사라지면</b> 어떻게 될까요?";
  face("curious");

  let pulled = false;
  pullBtn.addEventListener("click", () => {
    if (pulled) return;
    pulled = true;
    fig.classList.add("collapse");
    pullBtn.classList.remove("pulse");
    pullBtn.classList.add("done-static");
    (pullBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "메뚜기가 사라지자 <b>개구리는 먹이를 잃고</b>, 매까지 흔들려요. 반대로 풀은 먹히지 않아 지나치게 번져요 — 연쇄로 무너지죠!";
    window.setTimeout(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? ["연쇄로 여러 종이 함께 흔들린다", "한 종만 없어지고 끝난다"],
        good: "맞아요 — 그래서 <b>종이 다양하고 먹이 관계가 그물처럼 복잡할수록</b> 생태계가 안정돼요. 무엇을 지켜야 할지 알아봐요.",
        bad: "한 종만 없어지고 끝나지 않아요 — 개구리는 먹이를 잃고 매까지 흔들려 <b>연쇄로 여러 종이 함께</b> 흔들려요. 그래서 먹이 관계가 복잡할수록 안정적이에요. 무엇을 지켜야 할지 알아봐요.",
        onDone: () => {
          face("smile");
          finish();
        },
      });
    }, 1100);
  });
}
