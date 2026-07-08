// hookElec — 중2 VII(전기와 자기) 훅 장면 8종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션 + 좌상단 키라이트 + 접촉 그림자 + 재질별 최암색 외곽선) 준수,
// 스틱맨 캐릭터만 손그림 라인(밝은 배경 #3C4654 · 밤 배경 #E8EEF8) 유지.
// 상태 애니메이션 CSS는 ui.css의 "중2 VII 전기와 자기 훅(hookElec)" 섹션 — 접두사 he-.
// 과학 규칙: 이동하는 건 언제나 전자 · 대전체를 가까이 하면 항상 인력 · L7 '오른손 법칙' 용어 금지 ·
// L8은 "자석 사이에서 전류가 흐르는 코일이 힘을 받는다"까지만(F=BIL·플레밍 금지).
//   wintershock  L1 겨울밤 정전기 3연타(문손잡이 찌릿·스웨터 타닥·풍선 머리카락) 미니 코믹 + 예측
//   balloondoll  L2 풍선을 스웨터에 문지르고 → 알루미늄박 인형에 가까이 + 예측
//   deadclock    L3 멈춘 벽시계 — 전지를 갈아 끼우면 다시 똑딱 + 예측
//   brightpair   L4 전지 1개 → 2개 직렬, 전구가 더 밝아진다 + 예측
//   multitap     L5 멀티탭 — 플러그 하나를 뽑으면 나머지는? + 예측
//   labelpeek    L6 가전 라벨 뒤집어 보기 — 다리미 1500W vs 충전기 6W(예측 없음)
//   compasswire  L7 전선 옆 나침반 — 스위치를 켜자 바늘이 홱! + 예측
//   ebike        L8 전기 자전거 — 페달 없이 바퀴가 돈다 + 예측

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
interface HookOpts {
  choices?: string[];
}

const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

// ══════════════════════════════════════════════════════════
// L1. wintershock — 겨울밤 정전기 3연타 미니 코믹
// ══════════════════════════════════════════════════════════
// 발주 스틱맨 컷 쌍(public/elec/hook/{knob,sweater,balloon}-{calm,zap}.webp) —
// 탭하면 calm → zap 크로스페이드(스파크·곤두선 머리는 이미지에 그려져 있다).
export function renderWinterShock(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const grid = el("div", { class: "hook-cups three" });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(grid, choicesBox);
  helper.innerHTML = "건조한 겨울밤이에요. 세 장면을 <b>모두 탭</b>해서 무슨 일이 일어나는지 봐요!";

  const seen = new Set<string>();
  let timer = 0;
  const mk = (key: string, name: string, file: string, before: string, after: string): HTMLElement => {
    const label = el("div", { class: "hook-cup-label", text: before });
    const frame = el(
      "span",
      { class: "he-wframe" },
      el("img", { class: "calm", attrs: { src: `${IMG_BASE}elec/hook/${file}-calm.webp`, alt: "" } }),
      el("img", { class: "zap", attrs: { src: `${IMG_BASE}elec/hook/${file}-zap.webp`, alt: "" } }),
    );
    const card = el("button", { class: "hook-cup he-wcard", attrs: { type: "button", "aria-label": `${name} — 탭해서 보기` } });
    card.append(frame, label);
    card.addEventListener("click", () => {
      // 애니 재생(재탭 시 리플레이)
      card.classList.remove("lit");
      void card.offsetWidth;
      card.classList.add("lit");
      haptic(HAPTIC.tap);
      label.textContent = after;
      card.setAttribute("aria-label", `${name} — ${after}`);
      if (seen.has(key)) return;
      seen.add(key);
      if (seen.size === 1) {
        face("surprised");
        helper.innerHTML = "찌릿—! 나머지 <b>두 장면</b>도 탭해 봐요.";
      } else if (seen.size === 2) {
        helper.innerHTML = "또 찌릿! <b>마지막 장면</b>도 탭!";
      } else {
        face("curious");
        helper.innerHTML = "하룻밤에 세 번이나 찌릿찌릿 — 세 장면의 <b>공통 범인</b>은 누구일까요?";
        timer = window.setTimeout(() => {
          ask(choicesBox, helper, {
            choices: s.choices ?? ["물체를 문지르거나 비빌 때 생긴 전기", "콘센트에서 새어 나온 전기", "몸속 자석의 힘"],
            good: "맞아요! 스웨터도, 문손잡이를 잡은 손도(옷에 비벼진 몸!), 풍선도 — 모두 <b>문지르고 비빈 뒤</b>였어요. 이 전기의 정체를 실험실에서 파헤쳐요!",
            bad: "콘센트의 전기도, 자석의 힘도 아니에요 — 세 장면 모두 <b>문지르거나 비빈 직후</b>였다는 게 단서예요! 마찰이 만든 전기랍니다. 실험실에서 확인해요.",
            onDone: finish,
          });
        }, 800);
      }
    });
    return card;
  };
  grid.append(
    mk("knob", "금속 문손잡이", "knob", "문손잡이 잡기", "찌릿, 따가워!"),
    mk("swt", "스웨터 벗기", "sweater", "스웨터 벗기", "타닥타닥!"),
    mk("bal", "문지른 풍선", "balloon", "풍선 대 보기", "머리카락이 쭈뼛!"),
  );
  return () => window.clearTimeout(timer);
}

// ══════════════════════════════════════════════════════════
// L2. balloondoll — 문지른 풍선 → 알루미늄박 인형이 벌떡
// ══════════════════════════════════════════════════════════
// 기하: 풍선 초기 중심 (58,84) → charged에서 translate(96,-14) = (154,70).
// 인형은 발 (176,130) 기준으로 서 있게 그리고, CSS가 rotate(80°)로 눕혀 둔다(attract에서 -8°).
function balloonDollSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="heB-desk" x1="0" y1="132" x2="0" y2="141" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#D8B27E"/><stop offset="1" stop-color="#B08850"/></linearGradient>
      <linearGradient id="heB-swt" x1="24" y1="106" x2="96" y2="132" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF9A82"/><stop offset=".55" stop-color="#E86450"/><stop offset="1" stop-color="#B83E2E"/></linearGradient>
      <radialGradient id="heB-bal" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFB3A2"/><stop offset=".5" stop-color="#F0705A"/><stop offset="1" stop-color="#C24028"/></radialGradient>
      <linearGradient id="heB-foil" x1="166" y1="94" x2="190" y2="128" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F4F8FE"/><stop offset=".5" stop-color="#C6D3E2"/><stop offset="1" stop-color="#8FA2B8"/></linearGradient>
    </defs>
    <!-- 접촉 그림자 + 책상 -->
    <ellipse cx="60" cy="131" rx="46" ry="4" fill="#2A3A5E" opacity=".10"/>
    <ellipse cx="192" cy="131" rx="26" ry="3.5" fill="#2A3A5E" opacity=".10"/>
    <rect x="10" y="132" width="220" height="9" rx="4.5" fill="url(#heB-desk)"/>
    <rect x="10" y="132" width="220" height="3" rx="1.5" fill="#F2D9AE" opacity=".8"/>
    <path d="M26 141v20M214 141v20" stroke="#8A6434" stroke-width="4"/>
    <!-- 스웨터 더미 -->
    <path d="M18 132q8 -28 44 -28t44 28z" fill="url(#heB-swt)"/>
    <path d="M18 132q8 -28 44 -28t44 28" stroke="#8E2A1C" stroke-width="1.4"/>
    <path d="M34 120q4 -3 4 3M50 114q4 -3 4 3M66 114q4 -3 4 3M82 120q4 -3 4 3" stroke="#FFC9B8" stroke-width="1.4" opacity=".85"/>
    <path d="M32 114q13 -8 28 -7" stroke="#FFD8CC" stroke-width="2.4" opacity=".75"/>
    <ellipse cx="62" cy="106" rx="10" ry="3.4" fill="#C8503A" stroke="#8E2A1C" stroke-width="1.1"/>
    <!-- 알루미늄박 인형(축 늘어짐 — CSS가 눕혀 둔다) -->
    <g class="he-doll">
      <circle cx="176" cy="99" r="7" fill="url(#heB-foil)"/>
      <circle cx="176" cy="99" r="7" stroke="#6E7E94" stroke-width="1.2"/>
      <path d="M172 95q3 -2.6 7 -1.6" stroke="#FFFFFF" stroke-width="1.5" opacity=".85"/>
      <path d="M169 107h14l4 17h-22z" fill="url(#heB-foil)" stroke="#6E7E94" stroke-width="1.2"/>
      <path d="M169 109l-9 6 1.8 3 9.2 -6z" fill="url(#heB-foil)" stroke="#6E7E94" stroke-width="1"/>
      <path d="M183 109l9 6 -1.8 3 -9.2 -6z" fill="url(#heB-foil)" stroke="#6E7E94" stroke-width="1"/>
      <path d="M171 124h5.4v6h-5.4zM175.4 124h5.4v6h-5.4z" fill="url(#heB-foil)" stroke="#6E7E94" stroke-width="1" transform="translate(-3 0)"/>
      <path d="M173 112l3 4M180 117l2.6 -2.6M175 120h4" stroke="#7E92AC" stroke-width="1" opacity=".85"/>
    </g>
    <!-- 끌림 순간 반짝 -->
    <g class="he-pullspk" opacity="0" stroke="#FFE9A8" stroke-width="1.8">
      <path d="M160 82l4 3M168 92l3 -2M158 92l3 3"/>
    </g>
    <!-- 풍선(문지르면 대전 → 인형 곁으로) -->
    <g class="he-bal">
      <ellipse cx="58" cy="84" rx="16" ry="20" fill="url(#heB-bal)"/>
      <ellipse cx="58" cy="84" rx="16" ry="20" stroke="#8E2A1C" stroke-width="1.4"/>
      <ellipse cx="51" cy="75" rx="4.6" ry="7" fill="#FFD8CC" opacity=".75"/>
      <path d="M58 104l-3.4 4.4h6.8z" fill="#C24028"/>
      <path d="M58 109q5 9 -1 17" stroke="#B8C2D2" stroke-width="1.4"/>
      <g class="he-min" opacity="0">
        <g transform="translate(50 88)"><circle r="4" fill="#5AA2F8" stroke="#1B4B9E" stroke-width="1.1"/><path d="M-2 0h4" stroke="#FFFFFF" stroke-width="1.5"/></g>
        <g transform="translate(64 91)"><circle r="4" fill="#5AA2F8" stroke="#1B4B9E" stroke-width="1.1"/><path d="M-2 0h4" stroke="#FFFFFF" stroke-width="1.5"/></g>
        <g transform="translate(57 72)"><circle r="4" fill="#5AA2F8" stroke="#1B4B9E" stroke-width="1.1"/><path d="M-2 0h4" stroke="#FFFFFF" stroke-width="1.5"/></g>
      </g>
    </g>
    <!-- 마찰 반짝(문지를 때) -->
    <g class="he-fric" opacity="0" stroke="#FFD24A" stroke-width="1.8">
      <path d="M40 102l5 -3M72 100l5 3M56 110v-5"/>
    </g>
  </svg>`;
}

export function renderBalloonDoll(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("button", {
    class: "he-fig he-bd",
    html: balloonDollSvg(),
    attrs: { type: "button", "aria-label": "풍선을 스웨터에 문지르기 — 세 번 탭" },
  });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "책상 위엔 축 늘어진 <b>알루미늄박 인형</b>, 왼쪽엔 스웨터와 풍선. 먼저 <b>풍선을 탭해</b> 스웨터에 문질러요(3번)!";

  let rubs = 0;
  let charged = false;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };
  fig.addEventListener("click", () => {
    if (charged) return;
    rubs++;
    haptic(HAPTIC.tap);
    fig.classList.remove("rub");
    void fig.offsetWidth;
    fig.classList.add("rub");
    if (rubs === 1) helper.innerHTML = "쓱싹— 좋아요! <b>두 번 더</b> 문질러요.";
    else if (rubs === 2) helper.innerHTML = "쓱싹 쓱싹— <b>한 번 더!</b>";
    else {
      charged = true;
      (fig as HTMLButtonElement).disabled = true;
      face("surprised");
      later(() => {
        fig.classList.remove("rub");
        fig.classList.add("charged");
      }, 600);
      helper.innerHTML = "풍선이 <b>(−)전기를 띠었어요</b> — 전자가 옮겨 왔거든요(지난 시간!). 풍선이 인형 곁으로 가요…";
      later(() => {
        face("curious");
        helper.innerHTML = "이제 이 풍선을 인형에 <b>가까이</b> 가져가면 — 어떻게 될까요?";
        ask(choicesBox, helper, {
          choices: s.choices ?? ["인형이 풍선 쪽으로 끌려온다", "아무 일도 일어나지 않는다", "인형이 풍선에서 밀려난다"],
          good: "좋은 예측! 정말 그런지 — 풍선을 조금만 더 가까이…",
          bad: "인형은 문지르지 않아서 전기를 띠지 않았는데도, 결과는 <b>끌려온다</b>예요! 직접 봐요 — 풍선을 조금만 더 가까이…",
          onDone: () => {
            later(() => {
              fig.classList.add("attract");
              haptic(HAPTIC.correct);
              face("surprised");
              later(() => {
                helper.innerHTML = "벌떡! 인형이 <b>풍선 쪽으로 끌려와 붙었어요</b>. 문지르지도 않은 금속이 왜 끌려올까요 — 깡통 실험에서 전자의 움직임으로 밝혀요!";
                finish();
              }, 950);
            }, 550);
          },
        });
      }, 1650);
    }
  });
  return () => timers.forEach((t) => window.clearTimeout(t));
}
// ══════════════════════════════════════════════════════════
// L3. deadclock — 한밤의 멈춘 벽시계, 전지를 갈면 다시 똑딱
// ══════════════════════════════════════════════════════════
// 시계 중심 (120,62). 초침 회전은 CSS transform-box: view-box + px origin(120px 62px) —
// fill-box는 어긋난다(CLAUDE.md 시계 규칙). 초침은 222°(37초)에 멈춰 있다가 alive에서 초당 1틱.
function deadClockSvg(): string {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const big = i % 3 === 0;
    const r1 = big ? 24 : 26;
    const x1 = (120 + Math.sin(a) * r1).toFixed(1);
    const y1 = (62 - Math.cos(a) * r1).toFixed(1);
    const x2 = (120 + Math.sin(a) * 28.4).toFixed(1);
    const y2 = (62 - Math.cos(a) * 28.4).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#55647E" stroke-width="${big ? 2.4 : 1.4}"/>`;
  }).join("");
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="heC-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#13203E"/><stop offset="1" stop-color="#0B1524"/></linearGradient>
      <linearGradient id="heC-floor" x1="0" y1="146" x2="0" y2="166" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1C2C4E"/><stop offset="1" stop-color="#101B34"/></linearGradient>
      <linearGradient id="heC-case" x1="90" y1="30" x2="150" y2="95" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F2F6FB"/><stop offset=".5" stop-color="#C6D3E2"/><stop offset="1" stop-color="#8FA2B8"/></linearGradient>
      <linearGradient id="heC-obat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#AEB8C6"/><stop offset="1" stop-color="#6E7E94"/></linearGradient>
      <linearGradient id="heC-nbat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD44A"/><stop offset=".55" stop-color="#EFB800"/><stop offset="1" stop-color="#C08E00"/></linearGradient>
      <radialGradient id="heC-moon" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#F4F8FF"/><stop offset="1" stop-color="#C6D6F2"/></radialGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#heC-night)"/>
    <path d="M4 150q80 -10 232 -4v4a16 16 0 0 1 -16 16H20a16 16 0 0 1 -16 -16z" fill="url(#heC-floor)"/>
    <!-- 달 + 별 -->
    <circle cx="36" cy="30" r="12" fill="url(#heC-moon)" opacity=".9"/>
    <circle cx="32" cy="27" r="2.4" fill="#AEBEDC" opacity=".6"/><circle cx="40" cy="34" r="1.7" fill="#AEBEDC" opacity=".6"/>
    <circle cx="70" cy="20" r="1.3" fill="#DCE8FF"/><circle cx="206" cy="26" r="1.4" fill="#DCE8FF"/><circle cx="182" cy="46" r="1.1" fill="#DCE8FF"/>
    <!-- 벽시계 -->
    <circle cx="120" cy="62" r="37" fill="url(#heC-case)"/>
    <circle cx="120" cy="62" r="37" stroke="#55647E" stroke-width="1.6"/>
    <path d="M96 40q9 -10 22 -12" stroke="#FFFFFF" stroke-width="3" opacity=".7"/>
    <circle class="he-cface" cx="120" cy="62" r="30" fill="#DEE6F2"/>
    ${ticks}
    <path d="M120 62L110 52" stroke="#31415C" stroke-width="3.4" transform="rotate(214 120 62)"/>
    <path d="M120 62L120 38" stroke="#31415C" stroke-width="2.6" transform="rotate(48 120 62)"/>
    <path class="he-sec" d="M120 70L120 36" stroke="#F0564A" stroke-width="1.8"/>
    <circle cx="120" cy="62" r="2.6" fill="#31415C"/>
    <!-- 전지 칸(시계 아래) -->
    <rect x="108" y="96" width="24" height="19" rx="4" fill="#0E1830" stroke="#55647E" stroke-width="1.2"/>
    <g class="he-obat">
      <rect x="117" y="97.5" width="6" height="2.6" rx="1.2" fill="#6E7E94"/>
      <rect x="113.5" y="100" width="13" height="12.5" rx="2.5" fill="url(#heC-obat)"/>
      <rect x="113.5" y="100" width="13" height="12.5" rx="2.5" stroke="#4E5E78" stroke-width="1"/>
      <path d="M116 106h8" stroke="#4E5E78" stroke-width="1.4"/>
    </g>
    <g class="he-nbat" opacity="0">
      <rect x="117" y="97.5" width="6" height="2.6" rx="1.2" fill="#C08E00"/>
      <rect x="113.5" y="100" width="13" height="12.5" rx="2.5" fill="url(#heC-nbat)"/>
      <rect x="113.5" y="100" width="13" height="12.5" rx="2.5" stroke="#8A6600" stroke-width="1"/>
      <path d="M117 104.5h5M119.5 102v5" stroke="#7E5C00" stroke-width="1.3"/>
    </g>
    <circle class="he-ring" cx="120" cy="105" r="17" stroke="#FFC45A" stroke-width="2" stroke-dasharray="5 5"/>
    <!-- 갸웃하는 스틱맨(밤 손그림 라인) -->
    <ellipse cx="196" cy="158" rx="18" ry="3" fill="#000" opacity=".18"/>
    <g stroke="#E8EEF8" stroke-width="2.4" fill="none">
      <g class="he-shead"><circle cx="196" cy="108" r="8" fill="#101B34"/></g>
      <path d="M196 116v16M196 121l-8 6M196 121l8 6M196 132l-6 13M196 132l6 13"/>
    </g>
    <text class="he-q" x="212" y="94" font-size="13" font-weight="800" fill="#8FA6C8">?</text>
    <text class="he-q" x="221" y="82" font-size="9" font-weight="800" fill="#8FA6C8" opacity=".8">?</text>
  </svg>`;
}

export function renderDeadClock(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("button", {
    class: "he-fig he-dc",
    html: deadClockSvg(),
    attrs: { type: "button", "aria-label": "시계의 전지 칸을 탭해서 새 전지로 갈아 끼우기" },
  });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "한밤중, 벽시계가 <b>멈췄어요</b> — 초침이 꼼짝도 안 해요. 시계 아래 <b>전지 칸을 탭</b>해서 새 전지로 갈아 끼워요!";

  let swapped = false;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };
  fig.addEventListener("click", () => {
    if (swapped) return;
    swapped = true;
    (fig as HTMLButtonElement).disabled = true;
    fig.classList.add("swap");
    haptic(HAPTIC.select);
    helper.innerHTML = "낡은 전지는 빼고, <b>새 전지</b>를 딸깍 —";
    later(() => {
      fig.classList.add("alive");
      haptic(HAPTIC.correct);
      face("surprised");
      helper.innerHTML = "다시 <b>똑딱똑딱!</b> 시계를 깨운 건 전지였어요.";
    }, 800);
    later(() => {
      face("curious");
      helper.innerHTML = "그럼 전지가 시계에 <b>준 것</b>은 뭘까요?";
      ask(choicesBox, helper, {
        choices: s.choices ?? ["전기를 밀어 보내는 힘", "정확한 시간 정보", "태엽을 감는 힘"],
        good: "좋은 예측! 전지 속엔 시간 정보가 아니라 <b>전기를 밀어 보내는 힘</b>이 들어 있어요. 그 힘의 정체를 물의 회로와 나란히 놓고 밝혀 봐요!",
        bad: "전지 속에 시간 정보나 태엽은 없어요 — 전지가 주는 건 <b>전기를 밀어 보내는 힘</b>이에요! 그 힘이 다 떨어지면 시계도 멈추죠. 물의 회로에서 확인해요.",
        onDone: finish,
      });
    }, 2100);
  });
  return () => timers.forEach((t) => window.clearTimeout(t));
}
// ══════════════════════════════════════════════════════════
// L4. brightpair — 전지 1개 회로, 예측 후 전지를 하나 더(직렬) 끼우면 더 밝게
// ══════════════════════════════════════════════════════════
// 기하: 전지 홀더 (36..108, 114..140) 터미널 y=127 · 전구 유리 중심 (176,72) r16 · 받침 나사 (168..184, 88..102).
// 전류 점은 닫힌 루프 한 바퀴: 홀더 왼끝 → 왼쪽 벽 → 위 → 오른쪽 벽 → 전구 → 홀더 오른끝(느림/빠름 두 벌).
function brightPairSvg(): string {
  const loop = "M36 127 H20 Q14 127 14 121 V38 Q14 32 20 32 H196 Q202 32 202 38 V90 Q202 96 196 96 H184 L168 96 H156 Q148 96 148 104 V119 Q148 127 140 127 H36 Z";
  const dot = (cls: string, dur: number, begin: number): string =>
    `<g class="${cls}"><circle r="2.8" fill="#FFC45A"/><circle r="5" fill="#FFC45A" opacity=".25"/><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${loop}"/></g>`;
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="heP-desk" x1="0" y1="140" x2="0" y2="149" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#D8B27E"/><stop offset="1" stop-color="#B08850"/></linearGradient>
      <linearGradient id="heP-holder" x1="36" y1="114" x2="108" y2="140" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4E608A"/><stop offset=".55" stop-color="#3A4A70"/><stop offset="1" stop-color="#28334E"/></linearGradient>
      <linearGradient id="heP-bat" x1="0" y1="120" x2="0" y2="134" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFD44A"/><stop offset=".55" stop-color="#EFB800"/><stop offset="1" stop-color="#C08E00"/></linearGradient>
      <linearGradient id="heP-metal" x1="168" y1="88" x2="184" y2="102" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F2F6FB"/><stop offset=".5" stop-color="#C6D3E2"/><stop offset="1" stop-color="#8FA2B8"/></linearGradient>
      <radialGradient id="heP-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".95"/><stop offset=".5" stop-color="#FFD470" stop-opacity=".4"/><stop offset="1" stop-color="#FFD470" stop-opacity="0"/></radialGradient>
      <radialGradient id="heP-glass" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".9"/><stop offset=".55" stop-color="#E6F0FA" stop-opacity=".45"/><stop offset="1" stop-color="#C2D4E6" stop-opacity=".35"/></radialGradient>
    </defs>
    <!-- 실험대 -->
    <ellipse cx="72" cy="141" rx="42" ry="3.5" fill="#2A3A5E" opacity=".10"/>
    <ellipse cx="176" cy="141" rx="20" ry="3" fill="#2A3A5E" opacity=".10"/>
    <rect x="10" y="140" width="220" height="9" rx="4.5" fill="url(#heP-desk)"/>
    <rect x="10" y="140" width="220" height="3" rx="1.5" fill="#F2D9AE" opacity=".8"/>
    <path d="M26 149v14M214 149v14" stroke="#8A6434" stroke-width="4"/>
    <!-- 전선(어두운 심 + 밝은 코어) -->
    <g stroke="#4E5E78" stroke-width="3.4">
      <path d="M108 127 H140 Q148 127 148 119 V104 Q148 96 156 96 H168"/>
      <path d="M36 127 H20 Q14 127 14 121 V38 Q14 32 20 32 H196 Q202 32 202 38 V90 Q202 96 196 96 H184"/>
    </g>
    <g stroke="#8FA4C2" stroke-width="1.1" opacity=".8">
      <path d="M108 127 H140 Q148 127 148 119 V104 Q148 96 156 96 H168"/>
      <path d="M36 127 H20 Q14 127 14 121 V38 Q14 32 20 32 H196 Q202 32 202 38 V90 Q202 96 196 96 H184"/>
    </g>
    <!-- 전류 점(느림 = 전지 1개 / 빠름 = 전지 2개) -->
    <g class="he-flow1">${dot("d", 4.6, 0)}${dot("d", 4.6, -1.15)}${dot("d", 4.6, -2.3)}${dot("d", 4.6, -3.45)}</g>
    <g class="he-flow2" opacity="0">${dot("d", 2.3, 0)}${dot("d", 2.3, -0.57)}${dot("d", 2.3, -1.15)}${dot("d", 2.3, -1.72)}</g>
    <!-- 전지 홀더(2구) -->
    <rect x="36" y="114" width="72" height="26" rx="6" fill="url(#heP-holder)"/>
    <rect x="36" y="114" width="72" height="26" rx="6" stroke="#1E2A46" stroke-width="1.4"/>
    <path d="M40 118q14 -3 28 -1" stroke="#7E92BC" stroke-width="1.8" opacity=".6"/>
    <!-- 전지 1(장착됨) -->
    <rect x="42" y="120" width="26" height="14" rx="3" fill="url(#heP-bat)"/>
    <rect x="42" y="120" width="26" height="14" rx="3" stroke="#8A6600" stroke-width="1"/>
    <rect x="68" y="124" width="3.5" height="6" rx="1.5" fill="#C6D3E2"/>
    <path d="M62 127h5M64.5 124.5v5" stroke="#7E5C00" stroke-width="1.2"/>
    <path d="M45 127h5" stroke="#7E5C00" stroke-width="1.2"/>
    <path d="M44 122q10 -1.6 20 0" stroke="#FFEBA0" stroke-width="1.4" opacity=".85"/>
    <!-- 빈 슬롯(예측 후 탭) + 새 전지 -->
    <rect class="he-slot2" x="76" y="120" width="26" height="14" rx="3" stroke="#FFC45A" stroke-width="1.6" stroke-dasharray="4 3"/>
    <g class="he-bat2" opacity="0">
      <rect x="76" y="120" width="26" height="14" rx="3" fill="url(#heP-bat)"/>
      <rect x="76" y="120" width="26" height="14" rx="3" stroke="#8A6600" stroke-width="1"/>
      <rect x="102" y="124" width="3.5" height="6" rx="1.5" fill="#C6D3E2"/>
      <path d="M96 127h5M98.5 124.5v5" stroke="#7E5C00" stroke-width="1.2"/>
      <path d="M79 127h5" stroke="#7E5C00" stroke-width="1.2"/>
      <path d="M78 122q10 -1.6 20 0" stroke="#FFEBA0" stroke-width="1.4" opacity=".85"/>
    </g>
    <!-- 전구(받침 기둥 + 나사 + 유리 + 필라멘트 + 글로우 2단) -->
    <rect x="173" y="100" width="6" height="40" rx="2" fill="#55647E"/>
    <ellipse cx="176" cy="140" rx="13" ry="3.5" fill="#55647E"/>
    <circle class="he-glow1" cx="176" cy="72" r="27" fill="url(#heP-glow)"/>
    <circle class="he-glow2" opacity="0" cx="176" cy="72" r="42" fill="url(#heP-glow)"/>
    <circle cx="176" cy="72" r="16" fill="url(#heP-glass)"/>
    <circle cx="176" cy="72" r="16" stroke="#9DB4CE" stroke-width="1.5"/>
    <path d="M166 64q3 -6 9 -7" stroke="#FFFFFF" stroke-width="2.2" opacity=".8"/>
    <path d="M171 86V79M181 86V79" stroke="#7E8FA8" stroke-width="1.3"/>
    <path class="he-fil" d="M171 79l2.5 -6 2.5 5 2.5 -5 2.5 6" stroke="#FFB03A" stroke-width="1.8"/>
    <rect x="168" y="88" width="16" height="14" rx="3" fill="url(#heP-metal)"/>
    <rect x="168" y="88" width="16" height="14" rx="3" stroke="#6E7E94" stroke-width="1.1"/>
    <path d="M168 92.5h16M168 97h16" stroke="#8FA2B8" stroke-width="1.1"/>
  </svg>`;
}

export function renderBrightPair(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("button", {
    class: "he-fig he-bp",
    html: brightPairSvg(),
    attrs: { type: "button", "aria-label": "빈 전지 자리를 탭해서 전지 하나 더 끼우기" },
  });
  (fig as HTMLButtonElement).disabled = true;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "전지 <b>1개</b>로 전구가 켜져 있어요(전선 위 흐름 점이 보이죠?). 옆의 <b>빈자리</b>에 전지를 하나 더(직렬) 끼우면 — 밝기는?";
  face("curious");

  let ready = false;
  let boosted = false;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };
  ask(choicesBox, helper, {
    choices: s.choices ?? ["전구가 지금보다 더 밝아진다", "밝기는 변하지 않는다", "불이 오히려 꺼진다"],
    good: "좋은 예측! 정말 그런지 — 홀더의 <b>빈자리를 탭</b>해서 전지를 끼워 봐요.",
    bad: "전지를 늘리면 전기를 <b>미는 힘(전압)이 커져요</b> — 그대로이거나 꺼지지 않아요. 홀더의 <b>빈자리를 탭</b>해서 직접 확인!",
    onDone: () => {
      ready = true;
      (fig as HTMLButtonElement).disabled = false;
      fig.classList.add("ready");
    },
  });
  fig.addEventListener("click", () => {
    if (!ready || boosted) return;
    boosted = true;
    (fig as HTMLButtonElement).disabled = true;
    fig.classList.remove("ready");
    fig.classList.add("boost");
    haptic(HAPTIC.correct);
    face("surprised");
    helper.innerHTML = "딸깍 — <b>확 밝아졌어요!</b> 흐름 점도 빨라졌죠?";
    later(() => {
      face("curious");
      helper.innerHTML = "전지 2개 직렬 = 미는 힘(전압) 2배. 전류계 없이도 밝기가 말해 주네요 — <b>전류가 커졌다</b>는 걸!";
      finish();
    }, 1100);
  });
  return () => timers.forEach((t) => window.clearTimeout(t));
}
// ══════════════════════════════════════════════════════════
// L5. multitap — 멀티탭 하나에 스탠드·선풍기·충전기, 하나를 뽑으면?
// ══════════════════════════════════════════════════════════
// 기하: 탁자 윗면 y=100, 멀티탭 (60..180, 143..161), 소켓 x=84/120/156(cy 152).
// 플러그 스텁 케이블은 20px(바깥 코드와 10px 겹침) — out에서 -10px 들려도 이어져 보인다.
function multiTapSvg(): string {
  const socket = (x: number): string =>
    `<circle cx="${x}" cy="152" r="6.5" fill="#E8EEF6" stroke="#9DB4CE" stroke-width="1.1"/><circle cx="${x - 2.4}" cy="152" r="1.3" fill="#31415C"/><circle cx="${x + 2.4}" cy="152" r="1.3" fill="#31415C"/>`;
  const blade = (rot: number): string =>
    `<path d="M118 62 C112 48 122 42 128 47 C132 54 126 60 118 62 Z" fill="#9FC6EE" stroke="#5E7EA4" stroke-width="1" transform="rotate(${rot} 118 62)"/>`;
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="heM-desk" x1="0" y1="100" x2="0" y2="108" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#D8B27E"/><stop offset="1" stop-color="#B08850"/></linearGradient>
      <linearGradient id="heM-strip" x1="0" y1="143" x2="0" y2="161" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#DCE6F2"/><stop offset="1" stop-color="#B8C6DA"/></linearGradient>
      <linearGradient id="heM-lamp" x1="46" y1="52" x2="62" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8FC0F0"/><stop offset=".55" stop-color="#5E92C8"/><stop offset="1" stop-color="#3A669A"/></linearGradient>
      <linearGradient id="heM-cone" x1="0" y1="66" x2="0" y2="98" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".85"/><stop offset="1" stop-color="#FFE9A8" stop-opacity=".08"/></linearGradient>
      <linearGradient id="heM-white" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#E4EAF2"/><stop offset="1" stop-color="#C2CEDC"/></linearGradient>
    </defs>
    <!-- 탁자(위 선반) + 바닥 -->
    <rect x="10" y="100" width="220" height="8" rx="4" fill="url(#heM-desk)"/>
    <rect x="10" y="100" width="220" height="2.6" rx="1.3" fill="#F2D9AE" opacity=".8"/>
    <path d="M24 108v56M216 108v56" stroke="#8A6434" stroke-width="4"/>
    <path d="M10 164h220" stroke="#C4CAD2" stroke-width="2"/>
    <ellipse cx="120" cy="162" rx="64" ry="4" fill="#2A3A5E" opacity=".12"/>
    <!-- 스탠드(테이블 왼쪽) -->
    <ellipse cx="40" cy="99" rx="13" ry="3.2" fill="#2A3A5E" opacity=".10"/>
    <g class="he-glowL">
      <path d="M52 66 L84 98 L34 98 Z" fill="url(#heM-cone)"/>
      <ellipse cx="59" cy="97" rx="21" ry="3.6" fill="#FFE9A8" opacity=".4"/>
      <circle cx="56" cy="64" r="2.6" fill="#FFF3C4"/>
    </g>
    <ellipse cx="40" cy="97" rx="12" ry="3.4" fill="#55647E"/>
    <path d="M40 95V72Q40 64 48 62" stroke="#55647E" stroke-width="3"/>
    <circle cx="54" cy="60" r="8.5" fill="url(#heM-lamp)"/>
    <circle cx="54" cy="60" r="8.5" stroke="#2A4A70" stroke-width="1.3"/>
    <path d="M48 55q3 -3.4 7 -3.6" stroke="#DCEBFA" stroke-width="2" opacity=".85"/>
    <!-- 선풍기(테이블 가운데) -->
    <ellipse cx="118" cy="99" rx="15" ry="3.4" fill="#2A3A5E" opacity=".10"/>
    <ellipse cx="118" cy="97" rx="14" ry="3.6" fill="#55647E"/>
    <path d="M118 95V84" stroke="#55647E" stroke-width="3.4"/>
    <circle cx="118" cy="62" r="21" stroke="#8FA2B8" stroke-width="1.6"/>
    <circle cx="118" cy="62" r="21" fill="#F4F8FE" opacity=".25"/>
    <g class="he-fanb">${blade(0)}${blade(120)}${blade(240)}</g>
    <circle cx="118" cy="62" r="4.2" fill="url(#heM-white)" stroke="#7E8FA8" stroke-width="1.1"/>
    <g class="he-windF" stroke="#9FC1E8" stroke-width="2">
      <path d="M144 54q10 4 0 10M150 64q12 4 0 12M146 76q8 3 0 8"/>
    </g>
    <!-- 폰(테이블 오른쪽, 충전 중) -->
    <ellipse cx="197" cy="99" rx="14" ry="3.2" fill="#2A3A5E" opacity=".10"/>
    <rect x="186" y="56" width="24" height="42" rx="6" fill="#31415C"/>
    <rect x="186" y="56" width="24" height="42" rx="6" stroke="#16233F" stroke-width="1.3"/>
    <rect x="189.5" y="61" width="17" height="32" rx="3" fill="#16233F"/>
    <g class="he-scrON">
      <rect x="189.5" y="61" width="17" height="32" rx="3" fill="#1E3350"/>
      <path d="M199 68l-5 9h4.4l-3.4 9 8.4 -11h-4.4l3.4 -7z" fill="#EFB800"/>
      <circle cx="204" cy="59" r="1.5" fill="#04B45F"/>
    </g>
    <path d="M189 59q7 -2 14 0" stroke="#5E7294" stroke-width="1.2" opacity=".7"/>
    <!-- 코드(기기 → 멀티탭 근처, 플러그 스텁과 10px 겹침) -->
    <g stroke="#7E8FA8" stroke-width="2">
      <path d="M46 98 Q66 108 78 114 Q84 116 84 118"/>
      <path d="M112 98 Q112 110 118 114 Q120 116 120 118"/>
      <path d="M194 99 Q190 116 172 118 Q160 119 156 120"/>
    </g>
    <!-- 멀티탭 -->
    <path d="M60 152 H30 Q22 152 22 144 V132" stroke="#7E8FA8" stroke-width="2.4"/>
    <rect x="60" y="143" width="120" height="18" rx="9" fill="url(#heM-strip)"/>
    <rect x="60" y="143" width="120" height="18" rx="9" stroke="#9DB4CE" stroke-width="1.3"/>
    <path d="M66 147q26 -2.6 52 -1.6" stroke="#FFFFFF" stroke-width="2" opacity=".85"/>
    ${socket(84)}${socket(120)}${socket(156)}
    <circle cx="172" cy="152" r="2.2" fill="#F0564A"/>
    <!-- 플러그 3개(탭 대상) -->
    <g class="he-plug" data-d="lamp">
      <rect class="he-hit" x="70" y="106" width="28" height="46" rx="6" fill="#FFFFFF" opacity="0"/>
      <path d="M84 108V130" stroke="#7E8FA8" stroke-width="2"/>
      <path d="M81.5 143v6M86.5 143v6" stroke="#8FA2B8" stroke-width="2.2"/>
      <rect class="he-pbody" x="77" y="130" width="14" height="13" rx="3.5" fill="url(#heM-white)" stroke="#9DB4CE" stroke-width="1.2"/>
      <path d="M80 133q3 -1.6 6 -1" stroke="#FFFFFF" stroke-width="1.4" opacity=".9"/>
    </g>
    <g class="he-plug" data-d="fan">
      <rect class="he-hit" x="106" y="106" width="28" height="46" rx="6" fill="#FFFFFF" opacity="0"/>
      <path d="M120 108V130" stroke="#7E8FA8" stroke-width="2"/>
      <path d="M117.5 143v6M122.5 143v6" stroke="#8FA2B8" stroke-width="2.2"/>
      <rect class="he-pbody" x="113" y="130" width="14" height="13" rx="3.5" fill="url(#heM-white)" stroke="#9DB4CE" stroke-width="1.2"/>
      <path d="M116 133q3 -1.6 6 -1" stroke="#FFFFFF" stroke-width="1.4" opacity=".9"/>
    </g>
    <g class="he-plug" data-d="chg">
      <rect class="he-hit" x="142" y="106" width="28" height="46" rx="6" fill="#FFFFFF" opacity="0"/>
      <path d="M156 110V128" stroke="#7E8FA8" stroke-width="2"/>
      <path d="M152.5 143v6M159.5 143v6" stroke="#8FA2B8" stroke-width="2.2"/>
      <rect class="he-pbody" x="147" y="126" width="18" height="17" rx="4" fill="url(#heM-white)" stroke="#9DB4CE" stroke-width="1.2"/>
      <path d="M150 130q4 -2 8 -1.4" stroke="#FFFFFF" stroke-width="1.4" opacity=".9"/>
      <circle cx="156" cy="134" r="1.6" fill="#8FA2B8"/>
    </g>
  </svg>`;
}

export function renderMultiTap(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  // 흐름(나레이터 약속과 일치): ① 플러그를 하나씩 꽂아 "따로따로 켜진다"를 확인 →
  // ② "하나를 뽑으면 나머지는?" 예측 → ③ 뽑아서 검증(이후 자유 토글).
  const fig = el("div", {
    class: "he-fig he-mt plugin off-lamp off-fan off-chg",
    html: multiTapSvg(),
    attrs: { role: "img", "aria-label": "멀티탭 하나와 뽑혀 있는 플러그 셋 — 하나씩 탭해 꽂아 보기" },
  });
  fig.querySelectorAll(".he-plug").forEach((g) => g.classList.add("out"));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "스탠드·선풍기·충전기 — 셋 다 <b>멀티탭 하나</b>를 쓰는데 지금은 전부 뽑혀 있어요. 플러그를 <b>하나씩 탭해 꽂아</b> 보세요!";
  face("curious");

  const NAME: Record<string, string> = { lamp: "스탠드", fan: "선풍기", chg: "충전기" };
  let phase: "plugin" | "asking" | "pull" = "plugin";
  let confirmed = false;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };
  const allIn = (): boolean => fig.querySelectorAll(".he-plug.out").length === 0;
  fig.addEventListener("click", (e) => {
    if (phase === "asking") return; // 예측 중에는 장면을 잠근다
    const g = (e.target as Element).closest(".he-plug") as SVGGElement | null;
    if (!g) return;
    const d = g.dataset.d ?? "";
    const out = g.classList.toggle("out");
    fig.classList.toggle(`off-${d}`, out);
    haptic(HAPTIC.select);
    if (phase === "plugin") {
      if (!out && !allIn()) {
        helper.innerHTML = `딸깍 — <b>${NAME[d]}만 켜졌어요</b>! 다른 건 꿈쩍도 안 하죠. 나머지도 꽂아 봐요.`;
      } else if (allIn()) {
        phase = "asking";
        fig.classList.remove("plugin");
        face("curious");
        helper.innerHTML = "셋 다 <b>따로따로</b> 켜졌어요 — 서로 눈치도 안 보네요. 그럼 이제, 이 중 <b>하나를 뽑으면</b> 나머지 둘은?";
        ask(choicesBox, helper, {
          choices: s.choices ?? ["나머지 둘은 그대로 켜져 있다", "셋 다 함께 꺼진다", "나머지 둘이 더 세게 켜진다"],
          good: "좋은 예측! 정말 그런지 — 플러그 <b>하나를 탭해서 뽑아</b> 봐요.",
          bad: "한 줄로 이어졌다면 다 꺼지고, 나눠 쓰던 전기가 몰린다면 세지겠죠 — 과연 그럴까요? 플러그 <b>하나를 탭해서 뽑아</b> 직접 확인!",
          onDone: () => {
            phase = "pull";
            fig.classList.add("ready");
          },
        });
      } else {
        helper.innerHTML = `${NAME[d]}를 도로 뽑았어요 — 그 기구만 꺼져요. 셋 다 꽂아 봐요!`;
      }
      return;
    }
    // phase === "pull"
    if (!confirmed && out) {
      confirmed = true;
      fig.classList.remove("ready");
      face("surprised");
      helper.innerHTML = `쏙 — <b>${NAME[d]}만 꺼지고</b> 나머지 둘은 그대로 쌩쌩해요!`;
      later(() => {
        face("curious");
        helper.innerHTML = "콘센트끼리는 서로 영향이 없네요. 멀티탭 속 전선이 <b>어떻게</b> 이어져 있길래? 회로 실험대에서 두 연결을 비교해요! (다른 플러그도 뽑았다 꽂았다 해 보세요)";
        finish();
      }, 1300);
    } else if (confirmed) {
      helper.innerHTML = out ? `${NAME[d]}를 뽑았어요 — 나머지는 그대로!` : `${NAME[d]}를 다시 꽂았어요 — 바로 켜져요!`;
    }
  });
  return () => timers.forEach((t) => window.clearTimeout(t));
}
// ══════════════════════════════════════════════════════════
// L6. labelpeek — 다리미 1500W vs 충전기 6W, 라벨 뒤집어 보기 (ask 없음)
// ══════════════════════════════════════════════════════════
function lpPlate(title: string, watt: string): string {
  return `<g class="he-back" opacity="0">
    <rect x="12" y="20" width="72" height="56" rx="8" fill="#F2F5FA"/>
    <rect x="12" y="20" width="72" height="56" rx="8" stroke="#B8C6DA" stroke-width="1.4"/>
    <path d="M18 26q16 -3 32 -2" stroke="#FFFFFF" stroke-width="2" opacity=".9"/>
    <circle cx="19" cy="27" r="1.5" fill="#B8C6DA"/><circle cx="77" cy="27" r="1.5" fill="#B8C6DA"/>
    <circle cx="19" cy="69" r="1.5" fill="#B8C6DA"/><circle cx="77" cy="69" r="1.5" fill="#B8C6DA"/>
    <text x="48" y="37" text-anchor="middle" font-size="8" font-weight="700" fill="#8B95A1">${title}</text>
    <text x="48" y="52" text-anchor="middle" font-size="12" font-weight="800" fill="#31415C">220 V</text>
    <text x="48" y="69" text-anchor="middle" font-size="15" font-weight="800" fill="#C79400">${watt}</text>
  </g>`;
}
function lpIronSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="heL1-body" x1="20" y1="30" x2="80" y2="62" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8FC0F0"/><stop offset=".55" stop-color="#5E92C8"/><stop offset="1" stop-color="#3A669A"/></linearGradient>
      <linearGradient id="heL1-sole" x1="0" y1="62" x2="0" y2="72" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F2F6FB"/><stop offset="1" stop-color="#9FB0C4"/></linearGradient>
    </defs>
    <g class="he-front">
      <ellipse cx="48" cy="76" rx="32" ry="3.4" fill="#2A3A5E" opacity=".11"/>
      <path d="M12 62 H84 L77 71 H19 Z" fill="url(#heL1-sole)"/>
      <path d="M12 62 H84 L77 71 H19 Z" stroke="#6E7E94" stroke-width="1.2"/>
      <path d="M18 62 Q16 44 36 40 H56 Q76 40 80 52 L83 62 z" fill="url(#heL1-body)"/>
      <path d="M18 62 Q16 44 36 40 H56 Q76 40 80 52 L83 62" stroke="#24446E" stroke-width="1.4"/>
      <path d="M30 40 Q30 22 47 22 Q64 22 64 40 h-9 Q55 31 47 31 Q39 31 39 40 z" fill="#3A669A"/>
      <path d="M30 40 Q30 22 47 22 Q64 22 64 40" stroke="#24446E" stroke-width="1.4"/>
      <path d="M24 48q6 -6 16 -6" stroke="#DCEBFA" stroke-width="2.4" opacity=".85"/>
      <circle cx="70" cy="48" r="2.6" fill="#DCEBFA" stroke="#24446E" stroke-width="1"/>
    </g>
    ${lpPlate("전기다리미", "1500 W")}
  </svg>`;
}
function lpChargerSvg(): string {
  return `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="heL2-body" x1="30" y1="30" x2="66" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#E4EAF2"/><stop offset="1" stop-color="#C2CEDC"/></linearGradient>
    </defs>
    <g class="he-front">
      <ellipse cx="48" cy="76" rx="24" ry="3.2" fill="#2A3A5E" opacity=".11"/>
      <path d="M40 30v-9M56 30v-9" stroke="#8FA2B8" stroke-width="3.4"/>
      <rect x="30" y="30" width="36" height="42" rx="9" fill="url(#heL2-body)"/>
      <rect x="30" y="30" width="36" height="42" rx="9" stroke="#9DB4CE" stroke-width="1.3"/>
      <path d="M35 38q5 -4 12 -4" stroke="#FFFFFF" stroke-width="2.2" opacity=".9"/>
      <rect x="42" y="62" width="12" height="5" rx="2" fill="#31415C"/>
    </g>
    ${lpPlate("휴대 전화 충전기", "6 W")}
  </svg>`;
}

export function renderLabelPeek(scene: HTMLElement, helper: HTMLElement, _s: HookOpts, finish: () => void, face: Face): () => void {
  const grid = el("div", { class: "hook-cups" });
  scene.appendChild(grid);
  helper.innerHTML = "전기다리미와 휴대 전화 충전기 — 뒷면 라벨에 정체가 새겨져 있대요. <b>둘 다 눌러서 뒤집어</b> 봐요!";

  const seen = new Set<string>();
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };
  const mk = (key: string, name: string, svg: string, after: string, firstMsg: string): HTMLElement => {
    const label = el("div", { class: "hook-cup-label", text: "뒤집어 보기" });
    const card = el("button", { class: "hook-cup he-lcard", html: svg, attrs: { type: "button", "aria-label": `${name} — 눌러서 라벨 보기` } });
    card.appendChild(label);
    card.addEventListener("click", () => {
      if (seen.has(key)) return;
      seen.add(key);
      card.classList.add("flip");
      (card as HTMLButtonElement).disabled = true;
      label.textContent = after;
      card.setAttribute("aria-label", `${name} — ${after}`);
      haptic(HAPTIC.select);
      if (seen.size === 1) {
        face("surprised");
        helper.innerHTML = firstMsg;
      } else {
        face("surprised");
        later(() => {
          face("curious");
          helper.innerHTML =
            "둘 다 <b>220V</b>(전기를 밀어 주는 정도)는 똑같은데 — W는 <b>1500 대 6, 250배</b>! 이 <b>W(와트)</b>가 바로 오늘의 주인공, <b>1초에 쓰는 전기 에너지</b>의 단위랍니다.";
          finish();
        }, 750);
      }
    });
    return card;
  };
  grid.append(
    mk("iron", "전기다리미", lpIronSvg(), "220V · 1500W!", "<b>1500W</b>?! 숫자가 어마어마해요. 이제 <b>충전기</b>도 뒤집어 봐요."),
    mk("chg", "휴대 전화 충전기", lpChargerSvg(), "220V · 6W!", "<b>6W</b> — 아담하네요. 이제 <b>다리미</b>도 뒤집어 봐요."),
  );
  return () => timers.forEach((t) => window.clearTimeout(t));
}
// ══════════════════════════════════════════════════════════
// L7. compasswire — 나침반 위 전선, 스위치를 켜면 바늘이 홱(외르스테드)
// ══════════════════════════════════════════════════════════
// 기하 검산: (+)극 → 스위치 → 오른쪽 세로 전선(나침반 위, y 126→46 = 화면 위쪽) → 왼쪽으로 귀환.
// 바늘(나침반)은 전선 '아래'에 있으므로 전선 아래 지점의 자기장은 서쪽(−x) → N극이 반시계로 돈다
// = SVG rotate(−74°). ('오른손 법칙' 용어는 금지 — 코드 주석으로만 검산 기록.)
function compassWireSvg(): string {
  const loop = "M64 140 Q64 136 72 136 H100 L120 136 H142 Q150 134 150 126 V46 Q150 38 142 38 H18 Q10 38 10 46 V132 Q10 140 16 140 H62 Z";
  const dot = (begin: number): string =>
    `<g><circle r="2.6" fill="#FFC45A"/><circle r="4.6" fill="#FFC45A" opacity=".25"/><animateMotion dur="3.2s" begin="${begin}s" repeatCount="indefinite" path="${loop}"/></g>`;
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 * Math.PI) / 180;
    const x1 = (150 + Math.sin(a) * 20.5).toFixed(1);
    const y1 = (92 - Math.cos(a) * 20.5).toFixed(1);
    const x2 = (150 + Math.sin(a) * 23).toFixed(1);
    const y2 = (92 - Math.cos(a) * 23).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8FA2B8" stroke-width="${i % 2 === 0 ? 1.8 : 1.1}"/>`;
  }).join("");
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="heO-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFDFC2"/><stop offset="1" stop-color="#D6BE96"/></linearGradient>
      <linearGradient id="heO-brass" x1="122" y1="66" x2="176" y2="120" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6E6B8"/><stop offset=".55" stop-color="#D8B86A"/><stop offset="1" stop-color="#A8853C"/></linearGradient>
      <linearGradient id="heO-bat" x1="0" y1="130" x2="0" y2="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFD44A"/><stop offset=".55" stop-color="#EFB800"/><stop offset="1" stop-color="#C08E00"/></linearGradient>
      <linearGradient id="heO-red" x1="0" y1="68" x2="0" y2="92" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF6E5A"/><stop offset="1" stop-color="#D8352A"/></linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#heO-desk)"/>
    <path d="M4 58h232M4 112h232" stroke="#C2A87C" stroke-width="1.2" opacity=".45"/>
    <!-- 나침반(케이스 그림자 + 황동 링 + 눈금판) -->
    <ellipse cx="152" cy="124" rx="30" ry="5" fill="#2A3A5E" opacity=".12"/>
    <circle cx="150" cy="92" r="30" fill="url(#heO-brass)"/>
    <circle cx="150" cy="92" r="30" stroke="#7E6228" stroke-width="1.5"/>
    <path d="M130 74q6 -8 16 -10" stroke="#FFF6DC" stroke-width="2.6" opacity=".85"/>
    <circle cx="150" cy="92" r="24" fill="#F6F9FD"/>
    <circle cx="150" cy="92" r="24" stroke="#B8C6DA" stroke-width="1"/>
    ${ticks}
    <text x="150" y="79" text-anchor="middle" font-size="8.5" font-weight="800" fill="#D8352A">N</text>
    <!-- 바늘(N 빨강 위 + 꼬리 회색) — CSS가 on에서 -74° 회전 -->
    <g class="he-ndl">
      <path d="M150 92 L145.5 78 L150 68 L154.5 78 Z" fill="url(#heO-red)" stroke="#A8261E" stroke-width="1"/>
      <path d="M150 92 L145.5 106 L150 116 L154.5 106 Z" fill="#C6D0DC" stroke="#8FA2B8" stroke-width="1"/>
      <circle cx="150" cy="92" r="3" fill="#31415C"/>
      <circle cx="149" cy="91" r="1" fill="#FFFFFF"/>
    </g>
    <!-- 전선(나침반 '위'를 지남 — 그림자 + 심 + 코어 + 글로우) -->
    <path d="M152 64 V122" stroke="#2A3A5E" stroke-width="3" opacity=".16"/>
    <g stroke="#4E5E78" stroke-width="3.4">
      <path d="M20 140 H16 Q10 140 10 132 V46 Q10 38 18 38 H142 Q150 38 150 46 V126 Q150 134 142 136 H120"/>
      <path d="M100 136 H72 Q64 136 64 140"/>
    </g>
    <g stroke="#8FA4C2" stroke-width="1.1" opacity=".8">
      <path d="M20 140 H16 Q10 140 10 132 V46 Q10 38 18 38 H142 Q150 38 150 46 V126 Q150 134 142 136 H120"/>
      <path d="M100 136 H72 Q64 136 64 140"/>
    </g>
    <path class="he-wglow" opacity="0" d="M150 46 V126" stroke="#FFC45A" stroke-width="7"/>
    <g class="he-dots" opacity="0">${dot(0)}${dot(-0.8)}${dot(-1.6)}${dot(-2.4)}</g>
    <!-- 전지(가로) -->
    <rect x="22" y="130" width="40" height="20" rx="5" fill="url(#heO-bat)"/>
    <rect x="22" y="130" width="40" height="20" rx="5" stroke="#8A6600" stroke-width="1.1"/>
    <rect x="17" y="134" width="5" height="12" rx="2" fill="#C6D3E2" stroke="#6E7E94" stroke-width="1"/>
    <rect x="62" y="136" width="4.5" height="8" rx="1.8" fill="#C6D3E2" stroke="#6E7E94" stroke-width="1"/>
    <path d="M24 133q16 -2 26 0" stroke="#FFEBA0" stroke-width="1.6" opacity=".85"/>
    <path d="M50 140h7M53.5 136.5v7" stroke="#7E5C00" stroke-width="1.4"/>
    <path d="M28 140h7" stroke="#7E5C00" stroke-width="1.4"/>
    <!-- 스위치(접점 2 + 레버) + 안내 링 -->
    <circle cx="100" cy="136" r="3" fill="#8FA2B8" stroke="#4E5E78" stroke-width="1.2"/>
    <circle cx="120" cy="136" r="3" fill="#8FA2B8" stroke="#4E5E78" stroke-width="1.2"/>
    <path class="he-lever" d="M100 136 L119 136" stroke="#6E7E94" stroke-width="3.6"/>
    <circle class="he-ring" opacity="0" cx="110" cy="132" r="15" stroke="#FFC45A" stroke-width="2" stroke-dasharray="5 5"/>
  </svg>`;
}

export function renderCompassWire(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  // 흐름(나레이터 약속과 일치): ① 스위치를 먼저 켠다 → 바늘이 홱! ② "왜 움직였을까" 예측 ③ 껐다 켰다 자유 재현.
  const fig = el("button", {
    class: "he-fig he-cw ready",
    html: compassWireSvg(),
    attrs: { type: "button", "aria-label": "스위치를 탭해서 전류 켜고 끄기" },
  });
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "나침반 바늘(빨간 쪽이 <b>N극</b>)은 늘 북쪽만 봐요. 그 <b>위로 전선</b>이 지나가고, 스위치는 아직 꺼짐. <b>스위치를 탭</b>해서 전류를 흘려 보세요!";
  face("curious");

  let asked = false;
  let answered = false;
  let on = false;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };
  fig.addEventListener("click", () => {
    on = !on;
    fig.classList.toggle("on", on);
    haptic(HAPTIC.select);
    if (!asked && on) {
      asked = true;
      fig.classList.remove("ready");
      face("surprised");
      haptic(HAPTIC.correct);
      helper.innerHTML = "휙—! 전선은 자석도 아닌데 <b>바늘이 돌아갔어요</b>.";
      later(() => {
        face("curious");
        helper.innerHTML = "전선은 바늘에 닿지도 않았는데… <b>왜 움직였을까요?</b>";
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "전류가 흐르는 전선 둘레에 자석 같은 성질이 생겨서",
            "전선이 뜨거워져 주변 공기가 바늘을 밀어서",
            "전지가 나침반 바늘을 직접 끌어당겨서",
          ],
          good: "맞아요! 전류가 흐르는 전선 둘레엔 <b>자석 같은 성질</b>이 생겨요 — 200년 전 외르스테드도 강의 중에 우연히 이 장면을 봤죠. 스위치를 껐다 켰다 해 보세요, <b>전류가 흐를 때만</b> 바늘이 돌아요!",
          bad: "열도, 전지의 끌어당김도 아니에요 — 스위치를 꺼 보면 바늘이 바로 돌아오거든요. 비밀은 <b>전류가 흐르는 전선 둘레에 생기는 자석 같은 성질</b>! 껐다 켰다 하며 확인하고, 코일로 크게 재현해 봐요.",
          onDone: () => {
            answered = true;
            finish();
          },
        });
      }, 1200);
    } else if (answered) {
      helper.innerHTML = on
        ? "켜짐 — 바늘이 <b>휙</b> 돌아가요!"
        : "꺼짐 — 바늘이 <b>북쪽</b>으로 되돌아와요.";
    }
  });
  return () => timers.forEach((t) => window.clearTimeout(t));
}
// ══════════════════════════════════════════════════════════
// L8. ebike — 페달 없이 달리는 전기 자전거
// ══════════════════════════════════════════════════════════
// 기하: 뒷바퀴 (78,124) r22(허브 모터 r8) · 앞바퀴 (172,124) r22 · 크랭크 (120,126) —
// 페달은 y111~140에 정지, 발은 발판(y106) 위 — "페달을 안 밟는다"가 그림으로 읽힌다.
function ebikeSvg(): string {
  const spokes = (cx: number, cls: string): string =>
    `<g class="${cls}">
      <path d="M${cx} ${124 - 17}V${124 + 17}" stroke="#B8C2D2" stroke-width="1.6"/>
      <path d="M${cx} ${124 - 17}V${124 + 17}" stroke="#B8C2D2" stroke-width="1.6" transform="rotate(60 ${cx} 124)"/>
      <path d="M${cx} ${124 - 17}V${124 + 17}" stroke="#B8C2D2" stroke-width="1.6" transform="rotate(120 ${cx} 124)"/>
    </g>`;
  const wheel = (cx: number): string =>
    `<circle cx="${cx}" cy="124" r="22" stroke="#2E3540" stroke-width="5"/>
     <circle cx="${cx}" cy="124" r="17" stroke="#B8C2D2" stroke-width="1.6"/>`;
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="heE-frame" x1="100" y1="86" x2="170" y2="130" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8FC0F0"/><stop offset=".55" stop-color="#5E92C8"/><stop offset="1" stop-color="#3A669A"/></linearGradient>
      <linearGradient id="heE-batt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD44A"/><stop offset=".55" stop-color="#EFB800"/><stop offset="1" stop-color="#C08E00"/></linearGradient>
      <radialGradient id="heE-hub" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#F2F6FB"/><stop offset=".55" stop-color="#C6D3E2"/><stop offset="1" stop-color="#8FA2B8"/></radialGradient>
    </defs>
    <!-- 길 + 접촉 그림자 -->
    <path d="M6 146H234" stroke="#C4CAD2" stroke-width="2.4"/>
    <g class="he-road" stroke="#D8DEE8" stroke-width="3">
      <path d="M14 153h18M62 153h18M110 153h18M158 153h18M206 153h18M254 153h18"/>
    </g>
    <ellipse cx="78" cy="147" rx="24" ry="3" fill="#2A3A5E" opacity=".12"/>
    <ellipse cx="172" cy="147" rx="24" ry="3" fill="#2A3A5E" opacity=".12"/>
    <!-- 바람 스트릭(달릴 때) -->
    <g class="he-windE" opacity="0" stroke="#9FC1E8" stroke-width="2.4">
      <path d="M22 66h22M14 88h28M26 106h20"/>
    </g>
    <g class="he-bike">
      <!-- 바퀴(뒤: 허브 모터) -->
      ${wheel(78)}${spokes(78, "he-spo1")}
      ${wheel(172)}${spokes(172, "he-spo2")}
      <circle cx="78" cy="124" r="8" fill="url(#heE-hub)"/>
      <circle cx="78" cy="124" r="8" stroke="#55647E" stroke-width="1.4"/>
      <path d="M78 119.5l-2.8 5.4h2.5l-2.1 5 5 -6.4h-2.5l2 -4z" fill="#C79400"/>
      <circle cx="172" cy="124" r="3.5" fill="url(#heE-hub)" stroke="#55647E" stroke-width="1.2"/>
      <!-- 프레임(로우 스텝) + 배터리 팩 -->
      <g stroke="url(#heE-frame)" stroke-width="4.4">
        <path d="M158 96 Q128 118 120 126"/>
        <path d="M120 126 L102 86"/>
        <path d="M120 126 L78 124"/>
        <path d="M103 92 L78 124"/>
        <path d="M158 96 L172 124"/>
        <path d="M158 96 L166 76"/>
      </g>
      <rect x="125" y="106" width="28" height="9" rx="4.5" fill="url(#heE-batt)" stroke="#8A6600" stroke-width="1.1" transform="rotate(-38 139 110.5)"/>
      <path d="M166 76 L178 72" stroke="#31415C" stroke-width="3.4"/>
      <rect x="92" y="81" width="24" height="6" rx="3" fill="#31415C"/>
      <!-- 크랭크 + 정지한 페달(발과 떨어져 있음) -->
      <circle cx="120" cy="126" r="6" stroke="#55647E" stroke-width="1.6"/>
      <path d="M120 126 L112 114M120 126 L128 138" stroke="#55647E" stroke-width="2.6"/>
      <rect x="106" y="111" width="10" height="3.6" rx="1.8" fill="#55647E"/>
      <rect x="124" y="136.2" width="10" height="3.6" rx="1.8" fill="#55647E"/>
      <!-- 발판(footboard) -->
      <path d="M101 106 H127" stroke="#55647E" stroke-width="3.4"/>
      <!-- 스틱맨 라이더(손그림 라인) — 발은 발판 위 -->
      <g stroke="#3C4654" stroke-width="2.6" fill="none">
        <circle cx="110" cy="52" r="8" fill="#FFFFFF"/>
        <path d="M108 60 L102 86"/>
        <path d="M106 66 Q138 64 168 76"/>
        <path d="M102 86 Q113 96 110 105"/>
        <path d="M102 86 Q122 98 117 105"/>
      </g>
    </g>
  </svg>`;
}

export function renderEbike(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "he-fig he-eb", html: ebikeSvg(), attrs: { role: "img", "aria-label": "전기 자전거에 앉은 스틱맨 — 발은 발판 위, 페달은 밟지 않음" } });
  const btn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "출발!" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btn, choicesBox);
  helper.innerHTML = "스틱맨이 <b>전기 자전거</b>에 탔어요. 발은 <b>발판 위</b> — 페달엔 올리지도 않았죠. 출발 버튼을 눌러 볼까요?";

  let going = false;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };
  btn.addEventListener("click", () => {
    if (going) return;
    going = true;
    (btn as HTMLButtonElement).disabled = true;
    btn.classList.add("done-static");
    (btn.querySelector("span") as HTMLElement).textContent = "슝 — 달린다!";
    fig.classList.add("go");
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "달려요! 그런데 보세요 — 발은 여전히 <b>발판 위</b>, 페달은 <b>꼼짝도 안 해요</b>. 대체 무엇이 바퀴를 돌릴까요?";
    later(() => {
      face("curious");
      ask(choicesBox, helper, {
        choices: s.choices ?? ["자석 사이에서 전류가 흐르는 코일이 받는 힘", "내리막길을 굴러 내려가는 힘", "뒤에서 불어 주는 바람의 힘"],
        good: "정확해요! 뒷바퀴 통 속엔 <b>자석과 코일</b>이 숨어 있어요 — 자석 사이에 놓인 코일에 전류가 흐르면 코일이 <b>힘을 받아</b> 바퀴를 돌리죠. 3D 전기 그네에서 그 힘을 직접 만나요!",
        bad: "길은 평평하고 바람도 잔잔해요 — 비밀은 <b>뒷바퀴 통 속</b>! 자석 사이에 놓인 코일에 전류가 흐르면 코일이 <b>힘을 받아</b> 바퀴를 돌린답니다. 3D 전기 그네에서 확인!",
        onDone: finish,
      });
    }, 1400);
  });
  return () => timers.forEach((t) => window.clearTimeout(t));
}
