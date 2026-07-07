// hookGeo — 중2 II 단원(지권의 변화) 훅 장면 9종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수.
// 스틱맨 캐릭터만 손그림 라인(#3C4654, 2.4px) 유지. CSS 상태 클래스 접두사는 hg2-.
//   stripemount L1 — 오르노칼 줄무늬 산: 탭마다 색 층이 한 겹씩 → 줄무늬 정체 예측
//   foolsgold   L2 — 황철석(노란 돌): 뒤집어 반짝 → 조흔판에 문지르면 검은 가루 → 진짜 금? 예측
//   dolstatue   L3 — 돌하르방(구멍) vs 해태상(반짝 알갱이): 번갈아 확대 관찰 → 까닭 예측
//   bookcliff   L4 — 채석강 책 절벽: 드래그로 층을 넘기며 세기 → 줄무늬 생성 예측
//   pressrock   L5 — 프레스 속 쿠키 반죽 초코칩: 홀드로 납작 → 암석 알갱이 예측
//   cappadocia  L6 — 카파도키아 버섯 바위: 세월 슬라이더 → 몇만 년 뒤 예측
//   gravestone  L7 — 오래된 비석: 탭 연타로 세월 → 글자 사라진 까닭 예측
//   puzzlemap   L8 — 남아메리카·아프리카 조각: 드래그 스냅 → 우연일까 예측
//   quakenews   L9 — 지진 속보 지도: 같은 지역만 반복 → 까닭 예측
//   eggearth    L1 — 삶은 달걀 반 자르기(지구 내부 비유): 세 겹 단면 → 지구 속 예측

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;

// ── L1: 오르노칼 줄무늬 산 ──────────────────────────────────
// 잿빛 산 → 탭할 때마다 아래에서부터 색 층이 한 겹씩 드러난다.
function stripemountSvg(): string {
  // 산 실루엣(봉우리 3개)과, 실루엣에 클립되는 기울어진 색 띠 5장
  const mount = "M14 138 L58 66 L84 92 L120 34 L156 88 L184 60 L226 138 Z";
  const bands: [string, string, string][] = [
    // [면 그라데이션 id, 최암색, 띠 path(아래→위 순서)]
    ["hg2-b1", "#8A6A3E", "M8 138 L232 138 L232 118 L8 126 Z"],
    ["hg2-b2", "#A8552E", "M8 126 L232 118 L232 96 L8 104 Z"],
    ["hg2-b3", "#8E4258", "M8 104 L232 96 L232 76 L8 84 Z"],
    ["hg2-b4", "#B07E22", "M8 84 L232 76 L232 56 L8 62 Z"],
    ["hg2-b5", "#5E5470", "M8 62 L232 56 L232 20 L8 20 Z"],
  ];
  const grads = `
    <linearGradient id="hg2-b1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2DFB2"/><stop offset=".55" stop-color="#DFC088"/><stop offset="1" stop-color="#C09B5C"/></linearGradient>
    <linearGradient id="hg2-b2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5B27E"/><stop offset=".55" stop-color="#E08B52"/><stop offset="1" stop-color="#C26838"/></linearGradient>
    <linearGradient id="hg2-b3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E294AC"/><stop offset=".55" stop-color="#C46E8C"/><stop offset="1" stop-color="#A25470"/></linearGradient>
    <linearGradient id="hg2-b4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5D488"/><stop offset=".55" stop-color="#E0B45C"/><stop offset="1" stop-color="#C29438"/></linearGradient>
    <linearGradient id="hg2-b5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B0A4C8"/><stop offset=".55" stop-color="#8E80AC"/><stop offset="1" stop-color="#6E6290"/></linearGradient>
    <linearGradient id="hg2-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCEBFA"/><stop offset="1" stop-color="#F6E8D2"/></linearGradient>
    <linearGradient id="hg2-rockbase" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C8CBD4"/><stop offset=".55" stop-color="#A8ACB8"/><stop offset="1" stop-color="#888C9A"/></linearGradient>`;
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>${grads}<clipPath id="hg2-mclip"><path d="${mount}"/></clipPath></defs>
    <rect x="10" y="12" width="220" height="126" rx="10" fill="url(#hg2-sky)"/>
    <circle cx="204" cy="34" r="11" fill="#FFC24D"/><circle cx="204" cy="34" r="16" fill="#FFC24D" opacity=".22"/>
    <ellipse cx="120" cy="146" rx="98" ry="7" fill="#2A3A5E" opacity=".10"/>
    <!-- 잿빛 바탕 산 -->
    <path d="${mount}" fill="url(#hg2-rockbase)"/>
    <!-- 색 층(탭마다 .on) -->
    <g clip-path="url(#hg2-mclip)">
      ${bands.map(([g, dark, d], i) => `<g class="hg2-band" data-b="${i}"><path d="${d}" fill="url(#${g})"/><path d="${d}" stroke="${dark}" stroke-width="1.4" opacity=".55"/></g>`).join("")}
      <path class="hg2-shine" d="M52 72 L120 34 L188 64" stroke="#FFFFFF" stroke-width="5" opacity="0"/>
    </g>
    <path d="${mount}" stroke="#5A5E6E" stroke-width="1.6"/>
    <path d="M58 66 L84 92 M120 34 L156 88" stroke="#5A5E6E" stroke-width="1.2" opacity=".5"/>
    <!-- 산 아래 스틱맨(손그림 라인) -->
    <g stroke="#3C4654" stroke-width="2.4" fill="none">
      <circle cx="32" cy="118" r="7" fill="#FFFFFF"/>
      <path d="M32 125v14M32 130l-7 4M32 130l8-6M32 139l-6 9M32 139l6 9"/>
    </g>
    <path d="M10 138h220" stroke="#B8AE9E" stroke-width="2"/>
  </svg>`;
}

export function renderStripemount(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hg2-mount",
    attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 산의 색 층 드러내기" },
  });
  fig.innerHTML = stripemountSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "아르헨티나의 <b>오르노칼산</b>이에요. 멀리서는 잿빛인데, 가까이 가면… <b>탭해서</b> 산의 맨얼굴을 한 겹씩 확인해요!";

  const bands = [...fig.querySelectorAll(".hg2-band")] as SVGGElement[];
  let n = 0;
  let timer = 0;
  const reveal = (): void => {
    if (n >= bands.length) return;
    bands[n].classList.add("on");
    n++;
    haptic(HAPTIC.tap);
    fig.classList.remove("reveal");
    void fig.offsetWidth;
    fig.classList.add("reveal");
    if (n === 1) helper.innerHTML = "우와, <b>색 띠</b>가 드러났어요! 계속 탭!";
    else if (n === 3) {
      face("surprised");
      helper.innerHTML = "겹겹이 <b>색이 다 달라요</b>. 몇 겹이나 있을까요? 계속!";
    } else if (n >= bands.length) {
      face("curious");
      helper.innerHTML = "산 전체가 <b>무지개떡</b>처럼 층층! 이 줄무늬의 정체는 뭘까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "색이 다른 퇴적물이 층층이 쌓여 굳은 것",
            "화산에서 흘러내린 용암이 굳은 자국",
            "햇빛과 바람에 바래서 생긴 얼룩",
          ],
          good: "좋은 예측이에요! 색과 알갱이가 다른 <b>퇴적물이 한 겹 한 겹 쌓여 굳으면</b> 이런 줄무늬가 남아요. 실험실에서 직접 쌓아 봐요!",
          bad: "용암 자국도, 바랜 얼룩도 아니에요 — 방금 한 겹씩 드러났듯 <b>서로 다른 퇴적물이 차곡차곡 쌓여 굳은</b> 무늬예요. 실험실에서 직접 쌓아 봐요!",
          onDone: finish,
        });
      }, 750);
    }
  };
  fig.addEventListener("click", reveal);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      reveal();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L2: 황철석 — 조흔판 검사 ────────────────────────────────
function foolsgoldSvg(): string {
  return `<svg viewBox="0 0 240 176" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg2-py" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFEFB0"/><stop offset=".5" stop-color="#F2C74E"/><stop offset="1" stop-color="#C9952A"/>
      </linearGradient>
      <linearGradient id="hg2-plate" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F2F4F8"/><stop offset="1" stop-color="#DDE2EA"/>
      </linearGradient>
    </defs>
    <ellipse cx="74" cy="96" rx="40" ry="6" fill="#2A3A5E" opacity=".12"/>
    <!-- 조흔판(흰 사기판) -->
    <g>
      <ellipse cx="156" cy="152" rx="62" ry="7" fill="#2A3A5E" opacity=".11"/>
      <rect x="98" y="118" width="116" height="30" rx="7" fill="url(#hg2-plate)"/>
      <rect x="98" y="118" width="116" height="30" rx="7" stroke="#AAB4C4" stroke-width="1.5"/>
      <path d="M106 124q16-3 34-1" stroke="#FFFFFF" stroke-width="3.4" opacity=".9"/>
      <!-- 검은 조흔(문지른 뒤 나타남) -->
      <g class="hg2-streak">
        <path d="M116 133 q22 -4 66 0" stroke="#3E4652" stroke-width="6" opacity=".85"/>
        <path d="M120 138 q20 -2 50 1" stroke="#57616F" stroke-width="3" opacity=".6"/>
      </g>
    </g>
    <!-- 황철석 덩이(입방 결정 뭉치) -->
    <g class="hg2-nug">
      <g class="hg2-nug-flip">
        <path d="M46 66 L62 46 L92 42 L104 58 L98 84 L70 92 L50 84 Z" fill="url(#hg2-py)"/>
        <path d="M46 66 L62 46 L92 42 L104 58 L98 84 L70 92 L50 84 Z" stroke="#8A6114" stroke-width="1.6"/>
        <path d="M62 46 L74 60 L104 58 M74 60 L70 92 M50 84 L74 60" stroke="#B08A24" stroke-width="1.2" opacity=".8"/>
        <rect x="80" y="62" width="14" height="14" fill="#FFE9A0" stroke="#B08A24" stroke-width="1.1" transform="rotate(8 87 69)"/>
        <path d="M56 56q8-7 20-8" stroke="#FFFFFF" stroke-width="3.4" opacity=".8"/>
      </g>
      <g class="hg2-sparkle" fill="#FFFFFF" opacity="0">
        <path d="M100 40l2.6 5.4 5.4 2.6-5.4 2.6-2.6 5.4-2.6-5.4-5.4-2.6 5.4-2.6z"/>
        <path d="M44 52l1.8 3.8 3.8 1.8-3.8 1.8-1.8 3.8-1.8-3.8-3.8-1.8 3.8-1.8z"/>
      </g>
    </g>
    <text x="26" y="168" font-size="10.5" font-weight="700" fill="#8B95A1">조흔판</text>
    <path d="M52 164 q24 -2 44 -8" stroke="#C4CAD2" stroke-width="1.3"/>
  </svg>`;
}

export function renderFoolsgold(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hg2-pyrite",
    attrs: { role: "button", tabindex: "0", "aria-label": "노란 돌을 탭해서 뒤집어 보기" },
  });
  fig.innerHTML = foolsgoldSvg();
  const btn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "조흔판에 문지르기" }));
  const row = el("div", { class: "gp-controls" }, btn);
  row.style.display = "none";
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, row, choicesBox);
  helper.innerHTML = "금빛으로 반짝이는 돌을 주웠어요 — 이름은 <b>황철석</b>. 진짜 금과 꼭 닮았대요! <b>탭해서 뒤집어</b> 보세요.";

  let flips = 0;
  let rubbed = false;
  let timer = 0;
  fig.addEventListener("click", () => {
    if (rubbed) return;
    flips++;
    haptic(HAPTIC.tap);
    fig.classList.remove("spin");
    void fig.offsetWidth;
    fig.classList.add("spin");
    if (flips === 1) helper.innerHTML = "반짝—! 뒷면도 온통 금빛이에요. <b>한 번 더</b> 굴려 봐요.";
    if (flips === 2) {
      face("curious");
      helper.innerHTML = "아무리 봐도 금 같아요. 가리는 법이 있대요 — 흰 사기판, <b>조흔판</b>에 문질러 가루 색을 보는 거예요!";
      row.style.display = "";
    }
  });
  btn.addEventListener("click", () => {
    if (rubbed) return;
    rubbed = true;
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.add("done-static");
    haptic(HAPTIC.tap);
    fig.classList.add("rubbed");
    timer = window.setTimeout(() => {
      face("surprised");
      haptic(HAPTIC.correct);
      helper.innerHTML = "쓱싹— 긁힌 자리에 <b>검은 가루</b>가 남았어요! 겉은 금빛인데 가루는 검다니. 이 돌, 진짜 금일까요?";
      timer = window.setTimeout(() => {
        face("curious");
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "가루 색이 다르니 진짜 금이 아니다",
            "겉이 이렇게 반짝이니 진짜 금이 맞다",
            "검은 가루는 조흔판이 긁혀 나온 부스러기다",
          ],
          good: "예리해요! 겉모습은 속여도 <b>가루의 색</b>은 못 속여요 — 진짜 금은 가루도 <b>노란색</b>인데 이 돌은 검은 가루를 남겼거든요. 실험실에서 확인!",
          bad: "반짝임은 겉모습일 뿐이에요. 흰 판이 부스러졌다면 가루도 흰색이어야죠 — 검은 가루는 <b>돌 자신의 가루 색</b>! 진짜 금이라면 가루도 <b>노란색</b>이에요. 실험실에서 확인!",
          onDone: finish,
        });
      }, 900);
    }, 1100);
  });
  return () => window.clearTimeout(timer);
}

// ── L3: 돌하르방 vs 해태상 ──────────────────────────────────
function dolstatueSvg(): string {
  return `<svg viewBox="0 0 240 176" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg2-dol" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8E98A8"/><stop offset=".55" stop-color="#6E7888"/><stop offset="1" stop-color="#525C6C"/>
      </linearGradient>
      <linearGradient id="hg2-hae" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F2EEE4"/><stop offset=".55" stop-color="#DCD4C4"/><stop offset="1" stop-color="#B8AE9A"/>
      </linearGradient>
      <radialGradient id="hg2-lensg" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#F4FAFF" stop-opacity=".15"/><stop offset=".85" stop-color="#D6EBFA" stop-opacity=".3"/><stop offset="1" stop-color="#9CC0DE" stop-opacity=".6"/>
      </radialGradient>
    </defs>
    <!-- 돌하르방(현무암: 구멍 숭숭) -->
    <g class="hg2-statue" data-s="dol" style="cursor:pointer">
      <ellipse cx="62" cy="164" rx="34" ry="5.5" fill="#2A3A5E" opacity=".12"/>
      <path d="M44 98 q-6 30 2 56 q16 8 32 0 q8 -26 2 -56 q-18 -8 -36 0z" fill="url(#hg2-dol)"/>
      <path d="M44 98 q-6 30 2 56 q16 8 32 0 q8 -26 2 -56 q-18 -8 -36 0z" stroke="#3E4652" stroke-width="1.6"/>
      <ellipse cx="62" cy="84" rx="21" ry="19" fill="url(#hg2-dol)" stroke="#3E4652" stroke-width="1.6"/>
      <path d="M46 70 q14 -12 32 0 l3 8 q-19 -9 -38 0 z" fill="#525C6C" stroke="#3E4652" stroke-width="1.6"/>
      <path d="M52 84 q4 -4 8 0 M64 84 q4 -4 8 0" stroke="#2E3540" stroke-width="2.2"/>
      <ellipse cx="62" cy="93" rx="4.5" ry="6" fill="#57616F" stroke="#2E3540" stroke-width="1.4"/>
      <path d="M50 76 q10 -5 24 0" stroke="#B8C2D2" stroke-width="2" opacity=".5"/>
      <g fill="#3E4652" opacity=".85">
        <circle cx="52" cy="108" r="1.7"/><circle cx="70" cy="104" r="1.4"/><circle cx="60" cy="120" r="1.9"/>
        <circle cx="74" cy="126" r="1.5"/><circle cx="50" cy="132" r="1.6"/><circle cx="64" cy="142" r="1.7"/>
        <circle cx="56" cy="88" r="1.3"/><circle cx="72" cy="90" r="1.2"/>
      </g>
    </g>
    <!-- 해태상(화강암: 반짝 알갱이) -->
    <g class="hg2-statue" data-s="hae" style="cursor:pointer">
      <ellipse cx="178" cy="164" rx="36" ry="5.5" fill="#2A3A5E" opacity=".12"/>
      <path d="M150 158 q-4 -34 12 -50 q-10 -8 -4 -20 q10 -12 26 -8 q16 4 16 20 q0 10 -8 14 q18 16 14 44 q-28 10 -56 0z" fill="url(#hg2-hae)"/>
      <path d="M150 158 q-4 -34 12 -50 q-10 -8 -4 -20 q10 -12 26 -8 q16 4 16 20 q0 10 -8 14 q18 16 14 44 q-28 10 -56 0z" stroke="#8A7E66" stroke-width="1.6"/>
      <path d="M158 84 q-8 -4 -8 -12 M196 88 q8 -2 8 -12" stroke="#8A7E66" stroke-width="2"/>
      <path d="M166 92 q4 -4 8 0 M184 92 q4 -4 8 0" stroke="#5E5644" stroke-width="2.2"/>
      <path d="M170 104 q6 5 12 0" stroke="#5E5644" stroke-width="2"/>
      <path d="M156 74 q8 -8 20 -8" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>
      <g fill="#8A7E66" opacity=".7">
        <circle cx="162" cy="124" r="1.3"/><circle cx="186" cy="120" r="1.2"/><circle cx="174" cy="138" r="1.4"/><circle cx="194" cy="142" r="1.2"/>
      </g>
      <g class="hg2-glint2" fill="#FFFFFF">
        <path d="M168 116l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6z" opacity=".9"/>
        <path d="M190 132l1.3 2.7 2.7 1.3-2.7 1.3-1.3 2.7-1.3-2.7-2.7-1.3 2.7-1.3z" opacity=".8"/>
      </g>
    </g>
    <!-- 돋보기 인셋(가운데 위) -->
    <g class="hg2-lens">
      <circle cx="120" cy="44" r="34" fill="#FFFFFF"/>
      <g class="hg2-tex hg2-tex-dol">
        <circle cx="120" cy="44" r="32" fill="#6E7888"/>
        <g fill="#3E4652">
          <ellipse cx="108" cy="34" rx="5" ry="4"/><ellipse cx="130" cy="30" rx="3.6" ry="3"/>
          <ellipse cx="118" cy="52" rx="6" ry="4.6"/><ellipse cx="134" cy="48" rx="4" ry="3.4"/>
          <ellipse cx="104" cy="52" rx="3.4" ry="2.8"/><ellipse cx="124" cy="40" rx="2.6" ry="2.2"/>
        </g>
        <path d="M102 28 q8 -8 20 -8" stroke="#B8C2D2" stroke-width="2.4" opacity=".5"/>
      </g>
      <g class="hg2-tex hg2-tex-hae">
        <circle cx="120" cy="44" r="32" fill="#E4DCCA"/>
        <g stroke="#8A7E66" stroke-width="1">
          <path d="M104 30 l10 4 l-2 10 l-11 -3 z" fill="#F6F2E8"/>
          <path d="M116 36 l12 -4 l6 9 l-9 7 z" fill="#E8B4A8"/>
          <path d="M112 48 l10 4 l-4 10 l-10 -4 z" fill="#F6F2E8"/>
          <path d="M130 46 l9 2 l-1 10 l-10 -2 z" fill="#C8CCD4"/>
          <path d="M104 44 l7 2 l-2 8 l-7 -2 z" fill="#5E5644"/>
        </g>
        <g class="hg2-glint" fill="#FFFFFF">
          <path d="M126 28l1.8 3.8 3.8 1.8-3.8 1.8-1.8 3.8-1.8-3.8-3.8-1.8 3.8-1.8z"/>
          <path d="M112 56l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z"/>
        </g>
      </g>
      <circle cx="120" cy="44" r="34" fill="url(#hg2-lensg)" stroke="#8FB3D6" stroke-width="2.6"/>
      <path class="hg2-tail-l" d="M94 66 L74 84" stroke="#8FB3D6" stroke-width="3.4"/>
      <path class="hg2-tail-r" d="M146 66 L166 84" stroke="#8FB3D6" stroke-width="3.4"/>
    </g>
    <text x="62" y="174" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8B95A1">돌하르방</text>
    <text x="178" y="174" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8B95A1">해태상</text>
  </svg>`;
}

export function renderDolstatue(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hg2-statues", attrs: { role: "img", "aria-label": "돌하르방과 해태상 — 탭해서 확대 관찰" } });
  fig.innerHTML = dolstatueSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "왼쪽은 제주도 <b>돌하르방</b>, 오른쪽은 궁궐 앞 <b>해태상</b> — 둘 다 돌로 만들었어요. <b>번갈아 탭</b>해서 돋보기로 관찰!";

  const seen = new Set<string>();
  let asked = false;
  let timer = 0;
  fig.addEventListener("click", (e) => {
    if (asked) return;
    const g = (e.target as Element).closest(".hg2-statue") as SVGGElement | null;
    if (!g) return;
    const id = g.dataset.s!;
    haptic(HAPTIC.tap);
    fig.classList.toggle("showdol", id === "dol");
    fig.classList.toggle("showhae", id === "hae");
    fig.querySelectorAll(".hg2-statue").forEach((x) => x.classList.toggle("sel", x === g));
    if (!seen.has(id)) {
      seen.add(id);
      if (seen.size === 1) {
        face("surprised");
        helper.innerHTML = id === "dol"
          ? "구멍이 <b>숭숭</b>! 꼭 스펀지 같아요. 이제 <b>해태상</b>도 탭!"
          : "구멍 없이 <b>알갱이가 반짝반짝</b>! 이제 <b>돌하르방</b>도 탭!";
      } else {
        asked = true;
        face("curious");
        helper.innerHTML = "한쪽은 구멍 숭숭, 한쪽은 반짝 알갱이 — 같은 돌인데 <b>왜 이렇게 다를까요?</b>";
        timer = window.setTimeout(() => {
          ask(choicesBox, helper, {
            choices: s.choices ?? [
              "돌이 만들어진 과정이 서로 달라서",
              "바닷바람이 한쪽만 깎아 구멍을 내서",
              "만든 장인의 조각 솜씨가 달라서",
            ],
            good: "좋은 예측! 구멍도 반짝임도 조각 솜씨가 아니라 <b>돌이 태어난 과정</b>이 남긴 흔적이에요. 실험실에서 두 돌의 비밀을 파헤쳐요!",
            bad: "바람도 솜씨도 아니에요 — 구멍과 반짝 알갱이는 돌이 <b>처음 만들어질 때부터</b> 지닌 무늬거든요. <b>만들어진 과정이 다른</b> 거예요. 실험실에서 파헤쳐요!",
            onDone: finish,
          });
        }, 900);
      }
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L4: 채석강 책 절벽 — 위로 쓸어 넘기기 ───────────────────
function bookcliffSvg(): string {
  // 얇은 층 20장 — 톤이 번갈아 다른 수평 띠
  const tones = ["#D8C9A8", "#C4B28C", "#B09C74", "#CBBA96", "#A8946A"];
  const layers = Array.from({ length: 20 }, (_, i) => {
    const y = 36 + i * 4.7;
    return `<path d="M46 ${y.toFixed(1)} h150 l6 2.2 h-162 z" fill="${tones[i % 5]}" stroke="#6E5E42" stroke-width="${i % 4 === 0 ? 0.9 : 0.5}" stroke-opacity=".55"/>`;
  }).join("");
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg2-cliffsea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8FCBE8"/><stop offset="1" stop-color="#4A88C0"/>
      </linearGradient>
      <linearGradient id="hg2-scanb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFE9A8" stop-opacity="0"/><stop offset=".5" stop-color="#FFD24A" stop-opacity=".5"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="10" y="14" width="220" height="118" rx="10" fill="#E8F2FA"/>
    <!-- 절벽(책을 쌓은 듯한 층) -->
    <g>
      ${layers}
      <path d="M46 36 h150 l6 2.2 v92 h-162 v-92 z" stroke="#4E4432" stroke-width="1.6"/>
    </g>
    <!-- 읽기 스캔 밴드(드래그로 위로) -->
    <g class="hg2-scan"><rect x="42" y="118" width="166" height="14" rx="4" fill="url(#hg2-scanb)"/><path d="M42 125 h166" stroke="#F5A623" stroke-width="1.6" opacity=".9"/></g>
    <!-- 바다 -->
    <rect x="10" y="132" width="220" height="26" rx="8" fill="url(#hg2-cliffsea)" opacity=".9"/>
    <path d="M16 136 q12 4 24 0 t24 0 24 0 24 0 24 0 24 0 24 0 24 0" stroke="#DFF2FC" stroke-width="1.8" opacity=".8"/>
    <!-- 층 카운터 칩 -->
    <g>
      <rect x="150" y="18" width="76" height="20" rx="10" fill="#191F28" opacity=".78"/>
      <text class="hg2-count" x="188" y="32" text-anchor="middle" font-size="11.5" font-weight="800" fill="#FFE9A8">0겹</text>
    </g>
    <!-- 절벽 위 스틱맨 -->
    <g stroke="#3C4654" stroke-width="2.4" fill="none">
      <circle cx="30" cy="96" r="7" fill="#FFFFFF"/>
      <path d="M30 103v13M30 108l-7 3M30 108l8-4M30 116l-6 10M30 116l6 10"/>
    </g>
  </svg>`;
}

export function renderBookcliff(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hg2-cliff",
    attrs: { role: "slider", tabindex: "0", "aria-label": "위로 쓸어 올리며 절벽의 층 살펴보기", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" },
  });
  fig.innerHTML = bookcliffSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "전북 부안의 <b>채석강</b> — 절벽이 꼭 책 수만 권을 쌓은 것 같아요. 아래에서 <b>위로 쓸어 넘기며</b> 몇 겹인지 세어 봐요!";

  const count = fig.querySelector(".hg2-count") as SVGTextElement;
  let dragging = false;
  let lastY = 0;
  let p = 0; // 0..1
  let done = false;
  let timer = 0;
  let lastStep = 0;
  const apply = (): void => {
    fig.style.setProperty("--scan", String(p));
    fig.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    count.textContent = `${Math.round(p * 1500)}겹`;
    const step = Math.floor(p * 10);
    if (step !== lastStep) {
      lastStep = step;
      haptic(HAPTIC.tap);
    }
    if (p > 0.4 && p < 0.98 && !done) helper.innerHTML = "…아직도 줄무늬가 이어져요. <b>계속 위로!</b>";
    if (p >= 1 && !done) {
      done = true;
      fig.classList.add("top");
      face("surprised");
      haptic(HAPTIC.correct);
      helper.innerHTML = "꼭대기까지 <b>1,500겹</b>이 넘어요! 책장처럼 얇은 줄무늬가 수천 겹… <b>어떻게 생겼을까요?</b>";
      timer = window.setTimeout(() => {
        face("curious");
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "퇴적물이 아주 오랜 시간 쌓이고 굳어서",
            "파도가 절벽을 여러 번 깎아 줄을 새겨서",
            "큰 지진이 날 때마다 금이 한 줄씩 가서",
          ],
          good: "맞아요! 한 겹 한 겹이 <b>퇴적물이 쌓인 세월의 기록</b>이에요 — 절벽 전체가 수만 년짜리 책이죠. 실험실에서 확인!",
          bad: "파도와 지진이 새긴 게 아니에요 — 파도는 절벽을 <b>드러냈을 뿐</b>, 줄무늬 자체는 <b>퇴적물이 오랜 시간 차곡차곡 쌓여 굳은</b> 거예요. 실험실에서 확인!",
          onDone: finish,
        });
      }, 900);
    }
  };
  fig.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastY = e.clientY;
    fig.setPointerCapture?.(e.pointerId);
    haptic(HAPTIC.tap);
  });
  fig.addEventListener("pointermove", (e) => {
    if (!dragging || done) return;
    const dy = lastY - e.clientY; // 위로 끌면 양수
    lastY = e.clientY;
    if (dy > 0) p = clamp(p + dy / 220, 0, 1);
    apply();
  });
  const up = (): void => {
    dragging = false;
  };
  fig.addEventListener("pointerup", up);
  fig.addEventListener("pointercancel", up);
  fig.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      p = clamp(p + 0.2, 0, 1);
      apply();
      e.preventDefault();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L5: 프레스 속 초코칩 반죽 — 홀드로 납작하게 ─────────────
function pressrockSvg(): string {
  // 초코칩 7개: [cx, cy, 기울기(deg)] — 반죽 중심 (120, 128)
  const chips: [number, number, number][] = [
    [96, 116, -38], [122, 110, 24], [146, 118, -60], [108, 134, 52], [134, 138, -18], [120, 126, 78], [150, 136, 30],
  ];
  return `<svg viewBox="0 0 240 176" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg2-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F2F6FB"/><stop offset=".5" stop-color="#C9D4E2"/><stop offset="1" stop-color="#9AA8BC"/>
      </linearGradient>
      <linearGradient id="hg2-dough" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFE8C2"/><stop offset=".55" stop-color="#F2CE96"/><stop offset="1" stop-color="#D9AC6C"/>
      </linearGradient>
      <linearGradient id="hg2-chip" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8A5A3A"/><stop offset="1" stop-color="#54321C"/>
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="166" rx="86" ry="6" fill="#2A3A5E" opacity=".12"/>
    <!-- 프레스 틀 -->
    <rect x="34" y="14" width="14" height="140" rx="5" fill="url(#hg2-steel)" stroke="#76849A" stroke-width="1.4"/>
    <rect x="192" y="14" width="14" height="140" rx="5" fill="url(#hg2-steel)" stroke="#76849A" stroke-width="1.4"/>
    <rect x="28" y="8" width="184" height="14" rx="6" fill="url(#hg2-steel)" stroke="#76849A" stroke-width="1.4"/>
    <rect x="28" y="150" width="184" height="12" rx="5" fill="url(#hg2-steel)" stroke="#76849A" stroke-width="1.4"/>
    <path d="M34 154 h172" stroke="#FFFFFF" stroke-width="2" opacity=".6"/>
    <!-- 위 판(내려온다) -->
    <g class="hg2-platen">
      <rect x="52" y="26" width="136" height="18" rx="6" fill="url(#hg2-steel)" stroke="#5E6B7E" stroke-width="1.6"/>
      <path d="M60 31 h56" stroke="#FFFFFF" stroke-width="2.6" opacity=".7"/>
      <path d="M112 44 v6 M128 44 v6" stroke="#76849A" stroke-width="3"/>
    </g>
    <!-- 반죽 + 초코칩 -->
    <g>
      <ellipse class="hg2-doughball" cx="120" cy="128" rx="46" ry="26" fill="url(#hg2-dough)"/>
      <ellipse class="hg2-doughline" cx="120" cy="128" rx="46" ry="26" stroke="#B4884A" stroke-width="1.6"/>
      <path class="hg2-doughhl" d="M92 114 q12 -10 30 -10" stroke="#FFF6E4" stroke-width="4" opacity=".8"/>
      <g class="hg2-chips">
        ${chips.map(([x, y, a], i) => `<rect class="hg2-chipbit" data-i="${i}" x="-7" y="-3.6" width="14" height="7.2" rx="3.4" fill="url(#hg2-chip)" stroke="#3E2412" stroke-width="1" transform="translate(${x} ${y}) rotate(${a})"/>`).join("")}
      </g>
    </g>
    <g class="hg2-squeeze" stroke="#FFB03A" stroke-width="2.2" opacity="0">
      <path d="M58 128 q-6 -6 0 -12 M182 128 q6 -6 0 -12"/>
    </g>
  </svg>`;
}

export function renderPressrock(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hg2-press",
    attrs: { role: "button", tabindex: "0", "aria-label": "꾹 눌러서 반죽 납작하게 만들기" },
  });
  fig.innerHTML = pressrockSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "돌 얘기 전에 부엌 실험! 프레스에 <b>초코칩 쿠키 반죽</b>을 넣었어요. <b>꾹 누른 채 기다려</b> 보세요.";

  const chips: [number, number, number][] = [
    [96, 116, -38], [122, 110, 24], [146, 118, -60], [108, 134, 52], [134, 138, -18], [120, 126, 78], [150, 136, 30],
  ];
  const platen = fig.querySelector(".hg2-platen") as SVGGElement;
  const ball = fig.querySelector(".hg2-doughball") as SVGEllipseElement;
  const line = fig.querySelector(".hg2-doughline") as SVGEllipseElement;
  const hl = fig.querySelector(".hg2-doughhl") as SVGPathElement;
  const bits = [...fig.querySelectorAll(".hg2-chipbit")] as SVGRectElement[];
  let p = 0;
  let holding = false;
  let done = false;
  let raf = 0;
  let timer = 0;
  const applyP = (): void => {
    platen.setAttribute("transform", `translate(0 ${(82 * p).toFixed(1)})`); // p=1일 때 판 밑면(44+82)이 반죽 윗면(126)에 닿는다
    const rx = 46 + 26 * p;
    const ry = 26 - 15 * p;
    const cy = 128 + 9 * p;
    for (const eln of [ball, line]) {
      eln.setAttribute("rx", rx.toFixed(1));
      eln.setAttribute("ry", ry.toFixed(1));
      eln.setAttribute("cy", cy.toFixed(1));
    }
    hl.setAttribute("opacity", String(0.8 * (1 - p)));
    bits.forEach((b, i) => {
      const [x0, y0, a0] = chips[i];
      const x = 120 + (x0 - 120) * (1 + 0.62 * p);
      const y = cy + (y0 - 128) * (1 - 0.68 * p);
      const a = a0 * (1 - p);
      b.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})`);
    });
    fig.classList.toggle("pressing", holding && !done);
  };
  const tick = (): void => {
    if (holding && !done) {
      p = Math.min(1, p + 0.016);
      applyP();
      if (p >= 1) {
        done = true;
        fig.classList.add("done");
        face("surprised");
        haptic(HAPTIC.correct);
        helper.innerHTML = "납작—! 제멋대로 기울어 있던 칩들이 <b>옆으로 나란히 누웠어요</b>. 그럼 깊은 땅속에서 암석이 이렇게 눌리면요?";
        timer = window.setTimeout(() => {
          face("curious");
          ask(choicesBox, helper, {
            choices: s.choices ?? [
              "알갱이가 힘의 방향과 수직으로 줄지어 선다",
              "암석은 단단해서 알갱이가 꿈쩍도 하지 않는다",
              "알갱이가 모두 가루가 되어 사라진다",
            ],
            good: "완벽한 예측! 땅속 깊은 곳에서 큰 힘을 받은 암석도 초코칩처럼 <b>알갱이가 힘과 수직으로 줄지어</b> 서요. 실험실에서 확인!",
            bad: "꿈쩍 않지도, 가루가 되어 사라지지도 않아요 — 방금 초코칩처럼 알갱이들이 <b>누르는 힘과 수직 방향으로 나란히</b> 눕는답니다. 실험실에서 확인!",
            onDone: finish,
          });
        }, 900);
      }
    } else if (!holding && !done && p > 0) {
      p = Math.max(0, p - 0.03);
      applyP();
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

// ── L6: 카파도키아 버섯 바위 — 세월 슬라이더 ────────────────
function cappadociaSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg2-cap" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#9A8A78"/><stop offset=".55" stop-color="#7E6E5A"/><stop offset="1" stop-color="#5E5040"/>
      </linearGradient>
      <linearGradient id="hg2-tuff" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F6E8CE"/><stop offset=".55" stop-color="#E4CEA8"/><stop offset="1" stop-color="#C4A878"/>
      </linearGradient>
      <linearGradient id="hg2-capsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FBE4C8"/><stop offset="1" stop-color="#F2CDA4"/>
      </linearGradient>
    </defs>
    <rect x="10" y="12" width="220" height="130" rx="10" fill="url(#hg2-capsky)" opacity=".7"/>
    <circle cx="42" cy="36" r="10" fill="#FFC24D"/><circle cx="42" cy="36" r="15" fill="#FFC24D" opacity=".22"/>
    <path d="M10 142 h220" stroke="#B89A6E" stroke-width="2"/>
    <ellipse cx="128" cy="146" rx="66" ry="6" fill="#2A3A5E" opacity=".11"/>
    <!-- 멀리 있는 작은 버섯 바위 -->
    <g opacity=".55">
      <path d="M196 142 v-26 q0 -6 6 -6 t6 6 v26 z" fill="url(#hg2-tuff)" stroke="#9A7E4E" stroke-width="1.2"/>
      <path d="M192 112 q10 -10 20 0 q-2 5 -10 5 t-10 -5z" fill="url(#hg2-cap)" stroke="#463A2C" stroke-width="1.2"/>
    </g>
    <!-- 주인공 버섯 바위: 기둥은 JS가 다시 그림 -->
    <g>
      <path class="hg2-pillar" d="" fill="url(#hg2-tuff)"/>
      <path class="hg2-pillarline" d="" stroke="#9A7E4E" stroke-width="1.6" fill="none"/>
      <path class="hg2-pillarhl" d="M116 84 q2 20 0 46" stroke="#FFF6E0" stroke-width="4" opacity=".75"/>
      <g class="hg2-caprock">
        <path d="M96 78 q14 -26 32 -26 t32 26 q-6 8 -32 8 t-32 -8z" fill="url(#hg2-cap)"/>
        <path d="M96 78 q14 -26 32 -26 t32 26 q-6 8 -32 8 t-32 -8z" stroke="#463A2C" stroke-width="1.6"/>
        <path d="M106 62 q8 -8 18 -8" stroke="#C8BCA8" stroke-width="3" opacity=".8"/>
      </g>
    </g>
    <!-- 모래 바람 -->
    <g class="hg2-dust" fill="#D9BC8C">
      <circle cx="96" cy="112" r="2.2"/><circle cx="88" cy="124" r="1.7"/><circle cx="164" cy="104" r="2"/><circle cx="170" cy="120" r="1.5"/>
    </g>
    <g class="hg2-wind" stroke="#C8A870" stroke-width="2" opacity=".55">
      <path d="M60 100 q12 -4 24 0 M52 120 q14 -5 28 0"/>
    </g>
  </svg>`;
}

export function renderCappadocia(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hg2-fairy", attrs: { role: "img", "aria-label": "버섯 모양 바위" } });
  fig.innerHTML = cappadociaSvg();
  // 공용 커스텀 슬라이더(sl-track plain) — 세월
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const fillEl = el("div", { class: "sl-fill" });
  const track = el("div", { class: "sl-track plain" }, fillEl, thumb);
  const slider = el(
    "div",
    {
      class: "slider hp-slider",
      attrs: {
        role: "slider", tabindex: "0", "aria-label": "세월 흘리기",
        "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0", "aria-valuetext": "지금",
      },
    },
    track,
    el("div", { class: "hp-slider-caps" }, el("span", { text: "지금" }), el("span", { text: "5만 년 뒤" })),
  );
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, slider, choicesBox);
  helper.innerHTML = "튀르키예 <b>카파도키아</b>의 버섯 바위예요. 모자 돌 아래 무른 기둥이 바람에 깎이는 중! <b>세월 슬라이더</b>를 밀어 보세요.";

  const pillar = fig.querySelector(".hg2-pillar") as SVGPathElement;
  const pillarLine = fig.querySelector(".hg2-pillarline") as SVGPathElement;
  const pillarHl = fig.querySelector(".hg2-pillarhl") as SVGPathElement;
  let t = 0; // 0..1 세월
  let peak = 0;
  let done = false;
  let timer = 0;
  const drawPillar = (): void => {
    // 목(윗부분)이 가장 많이 깎인다: neck 반폭 24→7, 밑동 반폭 30→18
    const neck = 24 - 17 * t;
    const base = 30 - 12 * t;
    const d = `M${128 - neck} 80 C${128 - neck - 3} 100 ${128 - base - 2} 118 ${128 - base} 142 L${128 + base} 142 C${128 + base + 2} 118 ${128 + neck + 3} 100 ${128 + neck} 80 Z`;
    pillar.setAttribute("d", d);
    pillarLine.setAttribute("d", d);
    pillarHl.setAttribute("opacity", String(0.75 * (1 - t))); // 가늘어지면 하이라이트가 기둥 밖으로 나가므로 함께 사그라든다
  };
  drawPillar();
  const setT = (v: number): void => {
    t = clamp(v, 0, 1);
    peak = Math.max(peak, t);
    drawPillar();
    const f = t * 100;
    thumb.style.left = `${f}%`;
    fillEl.style.width = `${f}%`;
    slider.setAttribute("aria-valuenow", String(Math.round(f)));
    slider.setAttribute("aria-valuetext", `${Math.round(t * 5)}만 년 뒤`);
    fig.classList.add("eroding");
    if (t > 0.5 && t < 0.95 && !done) helper.innerHTML = "기둥 <b>목이 점점 가늘어져요</b>… 더 밀어요!";
    if (t >= 0.98 && !done) {
      done = true;
      fig.classList.add("teeter");
      face("surprised");
      haptic(HAPTIC.correct);
      helper.innerHTML = "모자 돌이 <b>위태위태</b>! 이대로 몇만 년이 더 흐르면 이 바위는 어떻게 될까요?";
      timer = window.setTimeout(() => {
        face("curious");
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "계속 깎여 나가 언젠가 무너진다",
            "바위는 단단해서 이 모습 그대로 남는다",
            "깎인 만큼 돌이 다시 자라 되돌아온다",
          ],
          good: "그래요 — 단단한 바위도 바람과 물에 <b>쉬지 않고 깎여요</b>. 지표의 모습은 끊임없이 변한답니다. 실험실에서 확인!",
          bad: "돌은 다시 자라지 않고, 영원히 버티지도 못해요 — 방금처럼 <b>조금씩 계속 깎여</b> 언젠가 무너져요. 지표는 끊임없이 변한답니다. 실험실에서 확인!",
          onDone: finish,
        });
      }, 900);
    }
  };
  const fromClientX = (cx: number): void => {
    const rect = track.getBoundingClientRect();
    setT(Math.max(peak, (cx - rect.left) / rect.width)); // 세월은 되돌릴 수 없다
  };
  let drag = false;
  slider.addEventListener("pointerdown", (e) => {
    drag = true;
    slider.classList.add("drag");
    slider.setPointerCapture(e.pointerId);
    fromClientX(e.clientX);
    haptic(HAPTIC.tap);
  });
  slider.addEventListener("pointermove", (e) => {
    if (drag) fromClientX(e.clientX);
  });
  const end = (): void => {
    drag = false;
    slider.classList.remove("drag");
    fig.classList.remove("eroding");
  };
  slider.addEventListener("pointerup", end);
  slider.addEventListener("pointercancel", end);
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      setT(t + 0.15);
      e.preventDefault();
    }
  });
  requestAnimationFrame(() => setT(0));
  return () => window.clearTimeout(timer);
}

// ── L7: 오래된 비석 — 탭 연타로 세월 경과 ───────────────────
function gravestoneSvg(): string {
  // 비문 느낌의 획(실제 글자 아님 — 추상 획 3열)
  const glyphs = [
    "M96 66h16M104 66v20M98 92h12", "M126 64h14M126 76h14M126 88h14M133 64v24",
    "M96 106h16M96 118h16M104 106v24", "M126 104v24M126 116h14M140 104v24",
  ].map((d) => `<path class="hg2-glyph" d="${d}" stroke="#57616F" stroke-width="2.6"/>`).join("");
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg2-stone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#E2E6EC"/><stop offset=".55" stop-color="#C2C9D4"/><stop offset="1" stop-color="#9AA4B2"/>
      </linearGradient>
      <linearGradient id="hg2-grass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9CCB7E"/><stop offset="1" stop-color="#6FA854"/>
      </linearGradient>
    </defs>
    <rect x="10" y="126" width="220" height="26" rx="9" fill="url(#hg2-grass)"/>
    <path d="M28 128q3-8 6 0M58 130q3-8 6 0M182 128q3-8 6 0M206 130q3-8 6 0" stroke="#568040" stroke-width="2"/>
    <ellipse cx="120" cy="140" rx="60" ry="6" fill="#2A3A5E" opacity=".12"/>
    <!-- 비석 -->
    <g>
      <rect x="76" y="128" width="88" height="12" rx="4" fill="#AAB4C2" stroke="#6E7888" stroke-width="1.5"/>
      <path d="M86 132 V64 q0 -22 34 -22 t34 22 v68 z" fill="url(#hg2-stone)"/>
      <path d="M86 132 V64 q0 -22 34 -22 t34 22 v68 z" stroke="#6E7888" stroke-width="1.6"/>
      <path d="M92 62 q4 -14 20 -16" stroke="#FFFFFF" stroke-width="4" opacity=".7"/>
      ${glyphs}
      <!-- 금(세월) -->
      <path class="hg2-crack hg2-crack1" d="M94 46 l10 12 -6 10 8 12" stroke="#76808E" stroke-width="1.6"/>
      <path class="hg2-crack hg2-crack2" d="M150 70 l-8 14 6 12 -8 14" stroke="#76808E" stroke-width="1.6"/>
      <!-- 이끼 -->
      <g class="hg2-moss hg2-moss1" fill="#7FA860">
        <ellipse cx="94" cy="122" rx="10" ry="6"/><ellipse cx="104" cy="127" rx="7" ry="4.4"/>
      </g>
      <g class="hg2-moss hg2-moss2" fill="#6F9C52">
        <ellipse cx="150" cy="118" rx="8" ry="5"/><ellipse cx="120" cy="46" rx="9" ry="4.6"/><ellipse cx="143" cy="127" rx="6.5" ry="4"/>
      </g>
      <!-- 모서리 떨어져 나감 -->
      <path class="hg2-chipoff" d="M154 42 q-6 8 -14 6 q4 -10 14 -6z" fill="#8E98A6"/>
    </g>
    <!-- 세월 칩 -->
    <g>
      <rect x="158" y="18" width="66" height="20" rx="10" fill="#191F28" opacity=".78"/>
      <text class="hg2-year" x="191" y="32" text-anchor="middle" font-size="11.5" font-weight="800" fill="#BFDCFF">지금</text>
    </g>
  </svg>`;
}

export function renderGravestone(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hg2-grave",
    attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 세월 흘리기" },
  });
  fig.innerHTML = gravestoneSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "또렷하게 글자를 새긴 <b>비석</b>이 세워졌어요. <b>탭할 때마다</b> 세월이 훌쩍 흘러요. 지켜봐요!";

  const yearEl = fig.querySelector(".hg2-year") as SVGTextElement;
  const YEARS = [100, 200, 350, 500];
  let stage = 0;
  let timer = 0;
  const advance = (): void => {
    if (stage >= 4) return;
    stage++;
    haptic(HAPTIC.tap);
    fig.classList.add(`st${stage}`);
    yearEl.textContent = `${YEARS[stage - 1]}년 뒤`;
    if (stage === 1) helper.innerHTML = "100년 — 획이 살짝 <b>옅어졌어요</b>. 계속 탭!";
    else if (stage === 2) helper.innerHTML = "200년 — 돌에 가는 <b>금</b>이 갔어요!";
    else if (stage === 3) {
      face("surprised");
      helper.innerHTML = "350년 — <b>이끼</b>가 끼고 글자가 흐릿…";
    } else {
      face("curious");
      helper.innerHTML = "500년 — 그 또렷하던 글자가 <b>거의 사라졌어요</b>. 아무도 건드리지 않았는데, 누가 지운 걸까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "물과 공기, 생물이 조금씩 돌을 부수고 녹여서",
            "사람들 손길에 닳고 닳아서",
            "새길 때 칠한 먹물이 빗물에 씻겨서",
          ],
          good: "정확해요! 빗물·공기·이끼 같은 것들이 <b>아주 천천히 돌을 부수고 녹였어요</b>. 눈에 안 보여도 쉬지 않는 작용이죠. 실험실에서 확인!",
          bad: "손길도 먹물도 아니에요 — 깊게 <b>새긴 홈 자체</b>가 얕아졌잖아요. 물·공기·생물이 오랜 세월 <b>돌을 부수고 녹인</b> 거예요. 실험실에서 확인!",
          onDone: finish,
        });
      }, 900);
    }
  };
  fig.addEventListener("click", advance);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      advance();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L8: 대륙 퍼즐 — 남아메리카·아프리카 맞추기 ──────────────
// 두 대륙의 마주 보는 해안선은 같은 곡선 E를 공유한다(맞물림). E는 3악장:
// ① A에서 살짝 서쪽으로(아프리카 서부 불룩/기아나 해안) ② 동쪽으로 브라질 '어깨' 돌출
//   (아프리카 쪽에선 기니만 홈) ③ 남서로 길게 내려와 B(브라질 동해안/앙골라 해안).
const DRIFT_EDGE = "C98 44 98 50 100 56 C106 62 120 64 126 72 C130 80 118 86 112 94 C106 104 100 118 96 134"; // A(106,38)→B(96,134)
const DRIFT_EDGE_REV = "C100 118 106 104 112 94 C118 86 130 80 126 72 C120 64 106 62 100 56 C98 50 98 44 106 38"; // B→A
function puzzlemapSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg2-ocean" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8FCBE8"/><stop offset="1" stop-color="#5A96C8"/>
      </linearGradient>
      <linearGradient id="hg2-land1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#B8E0A0"/><stop offset=".55" stop-color="#94C878"/><stop offset="1" stop-color="#6FA854"/>
      </linearGradient>
      <linearGradient id="hg2-land2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F2D898"/><stop offset=".55" stop-color="#DDB868"/><stop offset="1" stop-color="#BC9440"/>
      </linearGradient>
    </defs>
    <rect x="10" y="12" width="220" height="146" rx="12" fill="url(#hg2-ocean)"/>
    <g stroke="#CFE8F8" stroke-width=".8" opacity=".45">
      <path d="M10 49h220M10 86h220M10 123h220M65 12v146M120 12v146M175 12v146"/>
    </g>
    <!-- 남아메리카(고정): 북쪽이 넓고 남쪽 파타고니아 꼬리로 가늘게 -->
    <g class="hg2-sam">
      <path d="M106 38 ${DRIFT_EDGE} Q94 144 88 151 Q81 156 79 148 Q76 140 78 131 Q73 114 69 98 Q63 78 67 62 Q72 46 86 40 Q98 34 106 38 Z" fill="url(#hg2-land1)"/>
      <path d="M106 38 ${DRIFT_EDGE} Q94 144 88 151 Q81 156 79 148 Q76 140 78 131 Q73 114 69 98 Q63 78 67 62 Q72 46 86 40 Q98 34 106 38 Z" stroke="#4E7A38" stroke-width="1.6"/>
      <path d="M72 54 q10 -9 24 -11" stroke="#E2F4D4" stroke-width="3" opacity=".8"/>
    </g>
    <!-- 아프리카(드래그): 북부(사하라)가 넓고, 동쪽에 작은 뿔, 남쪽 끝은 둥글게.
         서해안(왼쪽)은 공유 곡선 E의 역방향 — 기니만 홈이 브라질 어깨를 문다 -->
    <g class="hg2-africa" style="cursor:grab">
      <ellipse cx="130" cy="144" rx="30" ry="5" fill="#2A3A5E" opacity=".10"/>
      <path d="M96 134 ${DRIFT_EDGE_REV} Q120 32 138 33 Q157 35 163 47 Q167 54 171 59 Q163 67 157 75 Q152 96 142 112 Q131 129 119 137 Q104 144 96 134 Z" fill="url(#hg2-land2)"/>
      <path d="M96 134 ${DRIFT_EDGE_REV} Q120 32 138 33 Q157 35 163 47 Q167 54 171 59 Q163 67 157 75 Q152 96 142 112 Q131 129 119 137 Q104 144 96 134 Z" stroke="#8E6A24" stroke-width="1.6"/>
      <path d="M124 41 q14 -5 28 4" stroke="#FBEECB" stroke-width="3" opacity=".8"/>
    </g>
    <!-- 맞물린 이음새 + 별 반짝(스냅 시) -->
    <path class="hg2-seam" d="M106 38 ${DRIFT_EDGE}" stroke="#FFFFFF" stroke-width="2.6" stroke-dasharray="150" stroke-dashoffset="150"/>
    <g class="hg2-stars" fill="#FFF6C8">
      <path d="M122 66l2 4.2 4.2 2-4.2 2-2 4.2-2-4.2-4.2-2 4.2-2z"/>
      <path d="M110 94l1.6 3.4 3.4 1.6-3.4 1.6-1.6 3.4-1.6-3.4-3.4-1.6 3.4-1.6z"/>
      <path d="M99 120l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z"/>
    </g>
    <text x="70" y="154" text-anchor="middle" font-size="10.5" font-weight="700" fill="#EAF6FF">남아메리카</text>
    <text x="192" y="154" text-anchor="middle" font-size="10.5" font-weight="700" fill="#EAF6FF">아프리카</text>
  </svg>`;
}

export function renderPuzzlemap(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hg2-drift",
    attrs: { role: "button", tabindex: "0", "aria-label": "아프리카 조각을 끌어서 남아메리카에 맞추기" },
  });
  fig.innerHTML = puzzlemapSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "지도에서 오려 낸 <b>남아메리카</b>와 <b>아프리카</b> 조각이에요. 아프리카를 <b>끌어서</b> 남아메리카 옆에 대 보세요!";

  const svg = fig.querySelector("svg") as unknown as SVGSVGElement;
  const africa = fig.querySelector(".hg2-africa") as SVGGElement;
  let ox = 52; // 시작 오프셋(뷰박스 단위) — 아프리카 동쪽 끝(x≈171)이 바다 밖으로 안 나가게
  let oy = 10;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let fit = false;
  let timer = 0;
  const applyPos = (): void => {
    africa.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px)`;
  };
  applyPos();
  const trySnap = (): void => {
    if (fit || Math.abs(ox) > 13 || Math.abs(oy) > 13) return;
    fit = true;
    ox = 0;
    oy = 0;
    fig.classList.add("fit");
    applyPos();
    haptic(HAPTIC.correct);
    face("surprised");
    helper.innerHTML = "딱—! 해안선이 <b>퍼즐처럼 들어맞아요</b>. 대서양을 사이에 두고 수천 km 떨어진 두 대륙인데… 우연일까요?";
    timer = window.setTimeout(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "두 대륙은 원래 한 덩어리였다가 갈라졌다",
          "우연히 모양이 비슷할 뿐이다",
          "파도가 양쪽 해안을 비슷하게 깎았다",
        ],
        good: "대담한 예측 — 과학자들도 그렇게 생각했어요! 두 대륙은 <b>원래 한 덩어리</b>였다가 갈라져 이동했어요. 그 초대륙의 이름이 <b>판게아</b>! 실험실에서 증거를 모아요.",
        bad: "우연이나 파도로 보기엔 너무 딱 맞죠? 두 대륙은 <b>원래 한 덩어리였다가 갈라져</b> 지금 자리로 이동한 거예요. 그 초대륙이 바로 <b>판게아</b>! 실험실에서 증거를 모아요.",
        onDone: finish,
      });
    }, 1000);
  };
  fig.addEventListener("pointerdown", (e) => {
    if (fit) return;
    const hit = (e.target as Element).closest(".hg2-africa");
    if (!hit) return;
    dragging = true;
    fig.classList.add("dragging");
    lastX = e.clientX;
    lastY = e.clientY;
    fig.setPointerCapture?.(e.pointerId);
    haptic(HAPTIC.tap);
  });
  fig.addEventListener("pointermove", (e) => {
    if (!dragging || fit) return;
    const scale = 240 / (svg.getBoundingClientRect().width || 240);
    ox = clamp(ox + (e.clientX - lastX) * scale, -20, 90);
    oy = clamp(oy + (e.clientY - lastY) * scale, -40, 40);
    lastX = e.clientX;
    lastY = e.clientY;
    applyPos();
    trySnap();
  });
  const up = (): void => {
    dragging = false;
    fig.classList.remove("dragging");
    trySnap();
  };
  fig.addEventListener("pointerup", up);
  fig.addEventListener("pointercancel", up);
  fig.addEventListener("keydown", (e) => {
    if (fit) return;
    const step = 8;
    if (e.key === "ArrowLeft") ox -= step;
    else if (e.key === "ArrowRight") ox += step;
    else if (e.key === "ArrowUp") oy -= step;
    else if (e.key === "ArrowDown") oy += step;
    else return;
    e.preventDefault();
    applyPos();
    trySnap();
  });
  return () => window.clearTimeout(timer);
}

// ── L9: 지진 속보 뉴스 — 같은 지역만 반복 ───────────────────
const HG2_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
function quakenewsSvg(): string {
  // 뉴스 화면 속 세계 지도 — 발주 평면 지도(public/geo/figs/worldmap.webp)를 원형 크롭 문법처럼
  // clipPath 라운드 사각으로 임베드. 마커 좌표는 이 지도 위 실제 위치(일본·칠레·수마트라) 기준.
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg2-tv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2E3A50"/><stop offset="1" stop-color="#1A2334"/>
      </linearGradient>
      <clipPath id="hg2-mapclip"><rect x="26" y="44" width="188" height="86" rx="9"/></clipPath>
    </defs>
    <ellipse cx="120" cy="164" rx="84" ry="5" fill="#2A3A5E" opacity=".12"/>
    <rect x="14" y="10" width="212" height="148" rx="14" fill="url(#hg2-tv)"/>
    <rect x="14" y="10" width="212" height="148" rx="14" stroke="#101826" stroke-width="1.6"/>
    <path d="M24 18 q40 -6 90 -4" stroke="#4A5C7A" stroke-width="3" opacity=".5"/>
    <!-- 상단 바 -->
    <rect x="26" y="20" width="44" height="17" rx="8.5" fill="#F04452"/>
    <text x="48" y="32.5" text-anchor="middle" font-size="10" font-weight="800" fill="#FFFFFF">속보</text>
    <circle class="hg2-live" cx="82" cy="28.5" r="3.4" fill="#F04452"/>
    <text x="92" y="32.5" font-size="10" font-weight="700" fill="#C9D6E8">세계 지진 소식</text>
    <!-- 지도(발주 이미지) -->
    <g>
      <rect x="26" y="44" width="188" height="86" rx="9" fill="#1E4E8C"/>
      <image href="${HG2_BASE}geo/figs/worldmap.webp" x="26" y="44" width="188" height="86" preserveAspectRatio="xMidYMid slice" clip-path="url(#hg2-mapclip)"/>
      <rect x="26" y="44" width="188" height="86" rx="9" stroke="#101826" stroke-width="1.4"/>
      <!-- 지진 마커 3지역 + 재발 -->
      <g class="hg2-quake" data-q="jp">
        <circle class="hg2-ring" cx="176" cy="79" r="9" stroke="#FF8A5C" stroke-width="2"/>
        <circle class="hg2-qdot" cx="176" cy="79" r="4" fill="#F04452" stroke="#FFFFFF" stroke-width="1.2"/>
        <text x="176" y="68" text-anchor="middle" font-size="9" font-weight="800" fill="#FFFFFF" stroke="#10203A" stroke-width="2.6" paint-order="stroke">일본</text>
      </g>
      <g class="hg2-quake" data-q="cl">
        <circle class="hg2-ring" cx="78" cy="116" r="9" stroke="#FF8A5C" stroke-width="2"/>
        <circle class="hg2-qdot" cx="78" cy="116" r="4" fill="#F04452" stroke="#FFFFFF" stroke-width="1.2"/>
        <text x="78" y="105" text-anchor="middle" font-size="9" font-weight="800" fill="#FFFFFF" stroke="#10203A" stroke-width="2.6" paint-order="stroke">칠레</text>
      </g>
      <g class="hg2-quake" data-q="id">
        <circle class="hg2-ring" cx="158" cy="98" r="9" stroke="#FF8A5C" stroke-width="2"/>
        <circle class="hg2-qdot" cx="158" cy="98" r="4" fill="#F04452" stroke="#FFFFFF" stroke-width="1.2"/>
        <text x="150" y="116" text-anchor="middle" font-size="9" font-weight="800" fill="#FFFFFF" stroke="#10203A" stroke-width="2.6" paint-order="stroke">인도네시아</text>
      </g>
      <g class="hg2-quake" data-q="jp2">
        <circle class="hg2-ring" cx="182" cy="86" r="7" stroke="#FF8A5C" stroke-width="2"/>
        <circle class="hg2-qdot" cx="182" cy="86" r="3.4" fill="#F04452" stroke="#FFFFFF" stroke-width="1"/>
      </g>
    </g>
    <!-- 하단 자막 바 -->
    <rect x="26" y="136" width="188" height="14" rx="5" fill="#101A2C"/>
    <text class="hg2-ticker" x="34" y="146.5" font-size="9" font-weight="700" fill="#8FA6C4">오늘의 지진 소식을 기다리는 중…</text>
  </svg>`;
}

export function renderQuakenews(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hg2-news", attrs: { role: "img", "aria-label": "세계 지진 속보 뉴스 화면" } });
  fig.innerHTML = quakenewsSvg();
  const btn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "다음 속보 받기" }));
  const row = el("div", { class: "gp-controls" }, btn);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, row, choicesBox);
  helper.innerHTML = "저녁 뉴스 시간이에요. 세계 곳곳의 <b>지진 속보</b>가 들어와요. <b>속보 받기</b>를 눌러 보세요!";

  const ticker = fig.querySelector(".hg2-ticker") as SVGTextElement;
  const SEQ: [string, string, string][] = [
    ["jp", "일본 앞바다에서 지진 발생!", "<b>일본</b> 부근이래요. 또 눌러 봐요."],
    ["cl", "칠레 해안에서 강한 지진!", "이번엔 지구 반대편 <b>칠레</b>! 계속!"],
    ["id", "인도네시아에서 또 지진!", "<b>인도네시아</b>… 어쩐지 바다 근처만? 한 번 더!"],
    ["jp2", "일본 부근에서 다시 지진!", ""],
  ];
  let n = 0;
  let timer = 0;
  btn.addEventListener("click", () => {
    if (n >= SEQ.length) return;
    const [key, tick, msg] = SEQ[n];
    n++;
    haptic(HAPTIC.tap);
    fig.querySelector(`.hg2-quake[data-q="${key}"]`)?.classList.add("on");
    ticker.textContent = tick;
    if (n < SEQ.length) {
      if (n === 3) face("surprised");
      helper.innerHTML = msg;
    } else {
      (btn as HTMLButtonElement).disabled = true;
      btn.classList.add("done-static");
      face("curious");
      helper.innerHTML = "네 번 다 <b>비슷한 지역</b>이에요! 우리 동네엔 안 오는 지진이 왜 늘 같은 곳에서만 일어날까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "그 지역들이 판과 판의 경계에 있어서",
            "그 나라들의 날씨가 유독 사나워서",
            "우연히 이번에 차례가 겹쳤을 뿐이라서",
          ],
          good: "날카로운 예측! 지진이 잦은 곳을 이어 보면 <b>띠 모양</b> — 바로 <b>판과 판이 만나는 경계</b>예요. 실험실에서 지도에 점을 찍어 확인!",
          bad: "날씨도 우연도 아니에요 — 지진 소식이 온 곳들을 지도에 이어 보면 <b>띠 모양</b>이 나타나요. 그 띠가 <b>판과 판이 만나는 경계</b>랍니다. 실험실에서 확인!",
          onDone: finish,
        });
      }, 900);
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L1 도입: 삶은 달걀 자르기 — 지구 내부 비유 ──────────────
function eggearthSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg2-eggsh" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFFDF4"/><stop offset=".55" stop-color="#F2E8D2"/><stop offset="1" stop-color="#D9C9A8"/>
      </linearGradient>
      <linearGradient id="hg2-eggwh" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDEAE0"/>
      </linearGradient>
      <radialGradient id="hg2-eggyo" cx=".38" cy=".32" r=".75">
        <stop offset="0" stop-color="#FFE292"/><stop offset=".7" stop-color="#FFC24D"/><stop offset="1" stop-color="#E8A226"/>
      </radialGradient>
      <linearGradient id="hg2-knife" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F4F8FD"/><stop offset="1" stop-color="#B9C6D6"/>
      </linearGradient>
    </defs>
    <!-- 접시 -->
    <ellipse cx="120" cy="150" rx="78" ry="7" fill="#2A3A5E" opacity=".11"/>
    <ellipse cx="120" cy="142" rx="86" ry="16" fill="#F6F9FC"/>
    <ellipse cx="120" cy="140" rx="86" ry="16" fill="#FFFFFF" stroke="#C6D0DC" stroke-width="1.5"/>
    <ellipse cx="120" cy="141" rx="62" ry="10" fill="#EDF2F8"/>
    <!-- 통째 달걀(자르기 전) -->
    <g class="hg2-eggwhole">
      <ellipse cx="120" cy="106" rx="30" ry="38" fill="url(#hg2-eggsh)"/>
      <ellipse cx="120" cy="106" rx="30" ry="38" stroke="#B8A67E" stroke-width="1.6"/>
      <path d="M106 84 q4 -8 12 -10" stroke="#FFFFFF" stroke-width="4" opacity=".85"/>
      <circle cx="112" cy="122" r="1.3" fill="#C9B890"/><circle cx="130" cy="96" r="1.1" fill="#C9B890"/>
    </g>
    <!-- 잘린 두 쪽(자른 뒤) -->
    <g class="hg2-egghalves">
      <!-- 왼쪽 반(바깥면) -->
      <g class="hg2-half-l">
        <path d="M104 68 a30 38 0 0 0 0 76 z" fill="url(#hg2-eggsh)" stroke="#B8A67E" stroke-width="1.6"/>
        <path d="M96 84 q3 -8 8 -12" stroke="#FFFFFF" stroke-width="3.4" opacity=".8"/>
      </g>
      <!-- 오른쪽 반(단면: 껍데기·흰자·노른자) -->
      <g class="hg2-half-r">
        <ellipse cx="150" cy="106" rx="27" ry="35" fill="url(#hg2-eggsh)"/>
        <ellipse cx="150" cy="106" rx="27" ry="35" stroke="#B8A67E" stroke-width="1.8"/>
        <ellipse cx="150" cy="106" rx="24.5" ry="32.5" fill="url(#hg2-eggwh)" stroke="#D8D2C2" stroke-width="1"/>
        <ellipse cx="150" cy="108" rx="13" ry="15" fill="url(#hg2-eggyo)" stroke="#D08A18" stroke-width="1.4"/>
        <ellipse cx="145" cy="101" rx="4.6" ry="3.4" fill="#FFF3C8" opacity=".9"/>
        <path d="M136 84 q6 -6 14 -6" stroke="#FFFFFF" stroke-width="3" opacity=".8"/>
      </g>
    </g>
    <!-- 칼 -->
    <g class="hg2-knifeg">
      <path d="M118 14 l6 0 4 40 q-2 8 -7 8 t-7 -8 z" fill="url(#hg2-knife)" stroke="#8A99AC" stroke-width="1.4"/>
      <rect x="115" y="2" width="12" height="14" rx="4" fill="#6E7888" stroke="#4E5866" stroke-width="1.3"/>
      <path d="M120 20 l2 30" stroke="#FFFFFF" stroke-width="1.6" opacity=".8"/>
    </g>
    <g class="hg2-cutflash" stroke="#FFFFFF" stroke-width="3" opacity="0">
      <path d="M120 60 v92"/>
    </g>
  </svg>`;
}

export function renderEggearth(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", {
    class: "hg2-eggearth",
    attrs: { role: "button", tabindex: "0", "aria-label": "탭해서 삶은 달걀 반으로 자르기" },
  });
  fig.innerHTML = eggearthSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "접시 위에 <b>삶은 달걀</b>이 있어요. 겉은 매끈한 껍데기뿐이죠? <b>탭해서 반으로 잘라</b> 볼까요!";

  let cut = false;
  let timer = 0;
  const doCut = (): void => {
    if (cut) return;
    cut = true;
    haptic(HAPTIC.tap);
    fig.classList.add("cut");
    timer = window.setTimeout(() => {
      face("surprised");
      haptic(HAPTIC.correct);
      helper.innerHTML = "쫙—! 겉은 한 겹 같았는데 속은 <b>껍데기·흰자·노른자 세 겹</b>! 그럼 우리가 밟고 선 <b>지구 속</b>은 어떨까요?";
      timer = window.setTimeout(() => {
        face("curious");
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "달걀처럼 여러 겹의 층으로 되어 있다",
            "속까지 전부 같은 암석으로 꽉 차 있다",
            "속은 텅 비어 있다",
          ],
          good: "바로 그 직감! 지구도 달걀처럼 <b>겹겹의 층</b>이에요 — 몇 겹인지 직접 뜯어 보러 가요.",
          bad: "겉만 보면 그렇게 보이죠 — 하지만 지구도 달걀처럼 <b>속이 여러 겹</b>이에요. 몇 겹인지 직접 뜯어 확인하러 가요!",
          onDone: finish,
        });
      }, 1000);
    }, 650);
  };
  fig.addEventListener("click", doCut);
  fig.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      doCut();
    }
  });
  return () => window.clearTimeout(timer);
}
