// connectLab — 세 시대 연결 랩(사회 Ⅰ L3). 서울의 나 → 지구 반대편 브라질 친구에게
// 같은 "안부"를 세 시대의 수단(돛단배·전신·스마트폰)으로 보내며 걸린 시간을 재 본다.
// 교과서 원리: 교통·통신의 발달 → 시공간 거리의 단축 → 지역 간 공간적 상호 작용 활발.
//   · 무대는 SVG 한 장(딥네이비 밤 장면) — rAF 금지, CSS 트랜지션/키프레임 + setTimeout 체인만.
//   · 세 이동 레인: 바다 위(돛단배) / 바다 밑 케이블(전신 펄스) / 하늘 아치(전파 봉투).
//   · 시대 세그 → 소품 교체, 「안부 전하기」 → 연출(연출 중 버튼 잠금, 재생 무제한).
// 목표 3개: 돛단배·전신·스마트폰으로 각각 한 번씩 보내기 → 결론 + recordQuiz + CTA.
// 타이머는 Set에 모아 cleanup에서 일괄 해제(worldPlaceLab later() 패턴).
// 밤 장면 스틱맨은 stargaze 문법(밝은 잉크 #E8EEF8 + 어두운 머리 fill + 접촉 그림자).
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ConnectStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type EraId = "sail" | "tel" | "phone";

const ERAS: { id: EraId; name: string; means: string; intro: string }[] = [
  {
    id: "sail",
    name: "1800년대",
    means: "돛단배",
    intro: "<b>1800년대</b>예요. 안부 편지는 돛단배에 실려 바람의 힘으로 바다를 건너요. 「안부 전하기」를 눌러 보세요!",
  },
  {
    id: "tel",
    name: "1900년대",
    means: "전신",
    intro: "<b>1900년대</b>예요. 바다 밑에 <b>전신 케이블</b>이 깔렸어요 — 편지 대신 전기 신호로 안부를 보내요!",
  },
  {
    id: "phone",
    name: "오늘",
    means: "스마트폰",
    intro: "<b>오늘</b>이에요. 주머니 속 <b>스마트폰</b>이 전파로 세계와 이어져 있어요. 바로 보내 봐요!",
  },
];

// ── 무대 SVG(400×235) ─────────────────────────────────────────
// 좌표 메모: 왼쪽 언덕 정상 (44~78, y≈110) 위 나(feet 51.5·62, y112.5),
// 오른쪽 언덕 정상 (344~391, y≈117) 위 친구(feet 334·344.5, y118.5).
// 바다 수면 y=168~172, 돛단배 항로 x 128→268(Δ140), 케이블 M118 176 Q200 222 282 176,
// 하늘 아치 M58 78 Q200 -14 342 78(전파 봉투: Δx 284 · 봉우리 -46).
function sceneSvg(): string {
  return `<svg viewBox="0 0 400 235" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="cnl-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0A1424"/><stop offset=".55" stop-color="#0F2138"/><stop offset="1" stop-color="#17324E"/>
      </linearGradient>
      <linearGradient id="cnl-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1C3E60"/><stop offset=".5" stop-color="#122944"/><stop offset="1" stop-color="#0C1B30"/>
      </linearGradient>
      <linearGradient id="cnl-hillL" x1="0" y1="0" x2=".6" y2="1">
        <stop offset="0" stop-color="#3E6054"/><stop offset=".55" stop-color="#2C4842"/><stop offset="1" stop-color="#1B2F2C"/>
      </linearGradient>
      <linearGradient id="cnl-hillR" x1="0" y1="0" x2=".6" y2="1">
        <stop offset="0" stop-color="#4C6440"/><stop offset=".55" stop-color="#364A2E"/><stop offset="1" stop-color="#232F1E"/>
      </linearGradient>
      <linearGradient id="cnl-palmT" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8A6A42"/><stop offset=".55" stop-color="#6E5030"/><stop offset="1" stop-color="#4E3820"/>
      </linearGradient>
      <linearGradient id="cnl-palmL" x1="0" y1="0" x2=".7" y2="1">
        <stop offset="0" stop-color="#4E8E52"/><stop offset=".55" stop-color="#38703E"/><stop offset="1" stop-color="#26522C"/>
      </linearGradient>
      <linearGradient id="cnl-hull" x1="0" y1="0" x2=".3" y2="1">
        <stop offset="0" stop-color="#96683C"/><stop offset=".55" stop-color="#78502A"/><stop offset="1" stop-color="#563818"/>
      </linearGradient>
      <linearGradient id="cnl-sailc" x1="0" y1="0" x2=".6" y2="1">
        <stop offset="0" stop-color="#F7F1E2"/><stop offset=".55" stop-color="#E6DAC0"/><stop offset="1" stop-color="#CCBC9C"/>
      </linearGradient>
      <radialGradient id="cnl-keyl" cx=".4" cy=".35" r=".75">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
      <mask id="cnl-mmask">
        <rect x="80" y="8" width="32" height="32" fill="#fff"/>
        <circle cx="100.5" cy="21" r="8.6" fill="#000"/>
      </mask>
    </defs>

    <!-- 하늘·별·달 -->
    <rect x="0" y="0" width="400" height="235" fill="url(#cnl-sky)"/>
    <g fill="#DCE8FA">
      <circle cx="22" cy="20" r="1" opacity=".6"/><circle cx="46" cy="36" r=".8" opacity=".45"/>
      <circle class="cnl-tw" cx="78" cy="10" r="1.1" opacity=".8"/><circle cx="128" cy="30" r=".8" opacity=".5"/>
      <circle cx="150" cy="10" r="1" opacity=".7"/><circle class="cnl-tw2" cx="182" cy="24" r=".9" opacity=".55"/>
      <circle cx="216" cy="10" r="1.1" opacity=".8"/><circle cx="246" cy="30" r=".8" opacity=".5"/>
      <circle class="cnl-tw" cx="272" cy="14" r="1" opacity=".7"/><circle cx="306" cy="40" r=".8" opacity=".5"/>
      <circle cx="330" cy="10" r="1" opacity=".75"/><circle class="cnl-tw2" cx="368" cy="26" r="1.1" opacity=".8"/>
      <circle cx="388" cy="52" r=".8" opacity=".5"/><circle cx="12" cy="58" r=".8" opacity=".5"/>
    </g>
    <circle cx="96" cy="24" r="16" fill="#F0EAD8" opacity=".07"/>
    <circle cx="96" cy="24" r="10" fill="#EDE6D2" mask="url(#cnl-mmask)"/>

    <!-- 안부가 다니는 아치 경로(점선) — 전파 편이 이 길을 난다 -->
    <path class="cnl-arch" d="M58 78 Q 200 -14 342 78" stroke="#7FA8D8" stroke-width="1.5" stroke-dasharray="3 8"/>

    <!-- 바다 -->
    <rect x="0" y="168" width="400" height="67" fill="url(#cnl-sea)"/>
    <path d="M0 168.5 H400" stroke="#2E5578" stroke-width="1" opacity=".55"/>
    <path d="M110 180 q12 -3.5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" stroke="#5688B8" stroke-width="1.5" opacity=".5"/>
    <path d="M128 194 q12 -3 24 0 t24 0 t24 0 t24 0 t24 0 t24 0" stroke="#5688B8" stroke-width="1.3" opacity=".32"/>
    <path d="M150 208 q12 -2.5 24 0 t24 0 t24 0 t24 0 t24 0" stroke="#5688B8" stroke-width="1.2" opacity=".2"/>

    <!-- 전신: 바다 밑 케이블(언덕이 양 끝을 덮도록 언덕보다 먼저) -->
    <g class="cnl-g-cable">
      <path d="M118 176 Q 200 222 282 176" stroke="#365472" stroke-width="3"/>
      <path d="M118 176 Q 200 222 282 176" stroke="#4E7294" stroke-width="1" opacity=".45"/>
      <path class="cnl-pulse" d="M118 176 Q 200 222 282 176" pathLength="600" stroke="#6FD4FF" stroke-width="7" opacity=".3" stroke-dasharray="34 640" style="stroke-dashoffset:34"/>
      <path class="cnl-pulse" d="M118 176 Q 200 222 282 176" pathLength="600" stroke="#D2F2FF" stroke-width="2.6" opacity=".95" stroke-dasharray="34 640" style="stroke-dashoffset:34"/>
    </g>

    <!-- 왼쪽 언덕: 서울의 나 -->
    <g>
      <path d="M-8 235 L-8 148 Q 14 112 44 109 Q 62 107.5 78 112 Q 100 118 113 142 Q 119 154 122 172 L 123 235 Z" fill="url(#cnl-hillL)"/>
      <ellipse cx="40" cy="122" rx="42" ry="16" fill="url(#cnl-keyl)"/>
      <path d="M30 130 q7 -5 14 -1 M64 122 q8 -4 15 1 M90 140 q7 -3 13 2" stroke="#1B332E" stroke-width="1.1" opacity=".8"/>
      <path d="M-8 148 Q 14 112 44 109 Q 62 107.5 78 112 Q 100 118 113 142 Q 119 154 122 172" stroke="#10201C" stroke-width="1.5"/>
      <ellipse cx="118" cy="173" rx="16" ry="3.5" fill="#04101A" opacity=".5"/>
      <!-- 남산 타워 실루엣(서울 단서) -->
      <path d="M22 111 L26 74 L30 111 Z" fill="#1E2C3A" stroke="#141E2A" stroke-width="1"/>
      <ellipse cx="26" cy="74" rx="6" ry="2.8" fill="#26364A" stroke="#141E2A" stroke-width="1"/>
      <circle cx="22.5" cy="74" r=".8" fill="#F5C86A"/><circle cx="26" cy="74.8" r=".8" fill="#F5C86A"/><circle cx="29.5" cy="74" r=".8" fill="#F5C86A"/>
      <path d="M26 71.2 V56" stroke="#26364A" stroke-width="1.3"/>
      <circle class="cnl-beacon" cx="26" cy="55" r="1.4" fill="#FF6E62"/>
      <!-- 나(밤 스틱맨 — 지구 반대편을 향해 손 흔드는 포즈) -->
      <ellipse cx="56.5" cy="113.5" rx="10" ry="2" fill="#000" opacity=".25"/>
      <g stroke="#E8EEF8" stroke-width="2.4">
        <circle cx="54" cy="86" r="5.5" fill="#0E1E32"/>
        <path d="M55 92l2 11M55.5 97l9 -6M55.5 98.5l-7 4.5M57 103l-5.5 9.5M57 103l5 9.5"/>
      </g>
      <text x="56" y="127" font-size="9.5" font-weight="700" fill="#AFC4E4" text-anchor="middle" opacity=".85">나 · 서울</text>
    </g>

    <!-- 오른쪽 언덕: 브라질 친구(야자수 한 그루) -->
    <g>
      <path d="M277 235 L278 172 Q 282 152 297 139 Q 317 122 344 117 Q 372 113 391 119 Q 402 122 408 132 L 408 235 Z" fill="url(#cnl-hillR)"/>
      <ellipse cx="352" cy="130" rx="44" ry="16" fill="url(#cnl-keyl)"/>
      <path d="M300 148 q7 -4 14 0 M330 128 q8 -4 15 1" stroke="#1E2A18" stroke-width="1.1" opacity=".8"/>
      <path d="M278 172 Q 282 152 297 139 Q 317 122 344 117 Q 372 113 391 119 Q 402 122 408 132" stroke="#17240F" stroke-width="1.5"/>
      <ellipse cx="282" cy="173" rx="14" ry="3.5" fill="#04101A" opacity=".5"/>
      <!-- 야자수 -->
      <ellipse cx="363" cy="121" rx="9" ry="1.8" fill="#05140B" opacity=".45"/>
      <path d="M358 120 Q 362 99 371 86 L 375 89 Q 367 101 364 121 Z" fill="url(#cnl-palmT)" stroke="#38270F" stroke-width="1.3"/>
      <path d="M361 108 q3.5 1.5 6.5 .8 M363 99 q3 1.5 6 .8" stroke="#4E3820" stroke-width=".9" opacity=".7"/>
      <path d="M373 87 Q 371 70 359 64 Q 370 72 376 85 Z" fill="url(#cnl-palmL)" stroke="#1C3A1E" stroke-width="1.2"/>
      <path d="M373 87 Q 359 74 341 78 Q 359 82 372 90 Z" fill="url(#cnl-palmL)" stroke="#1C3A1E" stroke-width="1.2"/>
      <path d="M373 87 Q 388 73 398 79 Q 388 82 375 90 Z" fill="url(#cnl-palmL)" stroke="#1C3A1E" stroke-width="1.2"/>
      <path d="M373 87 Q 353 86 344 97 Q 360 91 373 90 Z" fill="url(#cnl-palmL)" stroke="#1C3A1E" stroke-width="1.2"/>
      <path d="M373 87 Q 392 85 400 97 Q 386 91 374 90 Z" fill="url(#cnl-palmL)" stroke="#1C3A1E" stroke-width="1.2"/>
      <circle cx="370" cy="90" r="2.1" fill="#6E4E2A" stroke="#3A280F" stroke-width=".9"/>
      <circle cx="376" cy="92" r="1.8" fill="#6E4E2A" stroke="#3A280F" stroke-width=".9"/>
      <!-- 친구(밤 스틱맨 — 나를 향해 손 흔드는 포즈) -->
      <ellipse cx="340" cy="119.5" rx="10" ry="2" fill="#000" opacity=".25"/>
      <g stroke="#E8EEF8" stroke-width="2.4">
        <circle cx="342" cy="92" r="5.5" fill="#0E1E32"/>
        <path d="M341 98.5l-2 10.5M340.5 103.5l-9 -6M340.5 105l7 4.5M339 109l-5 9.5M339 109l5.5 9.5"/>
      </g>
      <text x="342" y="134" font-size="9.5" font-weight="700" fill="#AFC4E4" text-anchor="middle" opacity=".85">친구 · 브라질</text>
    </g>

    <!-- 전신: 해안 전신주·램프·전보 종이(언덕 위 소품) -->
    <g class="cnl-g-cable2">
      <ellipse cx="106" cy="134" rx="4" ry="1.2" fill="#10201C" opacity=".6"/>
      <path d="M106 134 V112" stroke="#54677A" stroke-width="2"/>
      <path d="M99 116 H113" stroke="#54677A" stroke-width="1.8"/>
      <circle cx="101" cy="115" r="1" fill="#7A94AC"/><circle cx="111" cy="115" r="1" fill="#7A94AC"/>
      <circle class="cnl-lamp cnl-lampL" cx="106" cy="109" r="2" fill="#9FE0FF"/>
      <path d="M106 117 Q 116 150 118 176" stroke="#54677A" stroke-width="1.2" opacity=".85"/>
      <ellipse cx="296" cy="142" rx="4" ry="1.2" fill="#1E2A18" opacity=".6"/>
      <path d="M296 142 V120" stroke="#54677A" stroke-width="2"/>
      <path d="M289 124 H303" stroke="#54677A" stroke-width="1.8"/>
      <circle cx="291" cy="123" r="1" fill="#7A94AC"/><circle cx="301" cy="123" r="1" fill="#7A94AC"/>
      <circle class="cnl-lamp cnl-lampR" cx="296" cy="117" r="2" fill="#9FE0FF"/>
      <path d="M296 125 Q 286 154 282 176" stroke="#54677A" stroke-width="1.2" opacity=".85"/>
      <g transform="translate(350 104) rotate(6)">
        <g class="cnl-slip cnl-pop">
          <rect x="-6.5" y="-5" width="13" height="10" rx="1" fill="#F6F3E8" stroke="#B8AE96" stroke-width="1"/>
          <path d="M-3.5 -2 H3.5 M-3.5 .5 H4 M-3.5 3 H1.5" stroke="#9AA2AE" stroke-width=".9"/>
        </g>
      </g>
    </g>

    <!-- 돛단배(사이 바다 항해) + 도착 봉투 -->
    <g class="cnl-g-boat">
      <g transform="translate(128 174)">
        <g class="cnl-boat-mv">
          <g class="cnl-boat-bob">
            <ellipse cx="0" cy="6.5" rx="15.5" ry="2.6" fill="#030E18" opacity=".5"/>
            <path class="cnl-wake" d="M-18 3.5 q-5.5 2 -10.5 1.2 M-17 6.2 q-4.5 1.5 -8 .9" stroke="#9EC8E8" stroke-width="1.4"/>
            <path d="M-17 -2.5 L17 -2.5 Q 13.5 6 4 7.5 L-7.5 7.5 Q -14.5 5 -17 -2.5 Z" fill="url(#cnl-hull)" stroke="#34200C" stroke-width="1.3"/>
            <path d="M-17 -2.5 H17" stroke="#C09A66" stroke-width="1" opacity=".55"/>
            <path d="M1 -2.5 V-29" stroke="#4E3418" stroke-width="2"/>
            <path d="M3 -27.5 Q 16 -18 16.5 -4.5 L3 -4.5 Z" fill="url(#cnl-sailc)" stroke="#9A8A64" stroke-width="1.1"/>
            <path d="M5.5 -21 Q 11 -15.5 11.5 -6.5" stroke="#C8B896" stroke-width=".9" opacity=".6"/>
            <path d="M-1 -24 Q -12.5 -17 -13 -4.5 L-1 -4.5 Z" fill="#EADEC4" stroke="#9A8A64" stroke-width="1"/>
            <path d="M1 -29 L8 -26.8 L1 -24.8 Z" fill="#D85448" stroke="#A83428" stroke-width=".8"/>
            <g class="cnl-boat-mail">
              <rect x="-12.5" y="-8" width="8" height="5.6" rx=".9" fill="#F6F2E4" stroke="#B0A488" stroke-width=".9"/>
              <path d="M-12.5 -8 l4 2.9 l4 -2.9" stroke="#B0A488" stroke-width=".9"/>
            </g>
          </g>
        </g>
      </g>
      <g transform="translate(350 104) rotate(-8)">
        <g class="cnl-gotmail cnl-pop">
          <path class="cnl-spark" d="M-11 -9 l-3.2 -3.2 M11 -9 l3.2 -3.2 M0 -11 V-15.4" stroke="#FFD27E" stroke-width="1.5"/>
          <rect x="-7" y="-5" width="14" height="10" rx="1.4" fill="#F6F2E4" stroke="#B0A488" stroke-width="1"/>
          <path d="M-7 -5 L0 1.5 L7 -5" stroke="#B0A488" stroke-width="1"/>
        </g>
      </g>
    </g>

    <!-- 스마트폰: 두 손의 폰 + 전파 아크 + 수신 링·말풍선 -->
    <g class="cnl-g-phone">
      <g class="cnl-arcs">
        <path d="M60.5 80.5 a6.5 6.5 0 0 1 9 0" stroke="#7FD8FF" stroke-width="1.6"/>
        <path d="M58 76.5 a10 10 0 0 1 14 0" stroke="#7FD8FF" stroke-width="1.6"/>
        <path d="M55.5 72.5 a13.5 13.5 0 0 1 19 0" stroke="#7FD8FF" stroke-width="1.6"/>
      </g>
      <rect x="62.3" y="85.5" width="4.8" height="8.4" rx="1.3" fill="#182A40" stroke="#56789A" stroke-width=".9"/>
      <rect x="63.4" y="87" width="2.6" height="5.4" rx=".7" fill="#9FE8FF" opacity=".9"/>
      <rect x="329" y="93" width="4.8" height="8.4" rx="1.3" fill="#182A40" stroke="#56789A" stroke-width=".9"/>
      <rect x="330.1" y="94.5" width="2.6" height="5.4" rx=".7" fill="#9FE8FF" opacity=".9"/>
      <circle class="cnl-ringFr" cx="331.4" cy="97.2" r="4.5" stroke="#9FE8FF" stroke-width="1.8"/>
      <g transform="translate(330 72)">
        <g class="cnl-bubble cnl-pop">
          <rect x="-24" y="-13" width="48" height="20" rx="7" fill="#F7FAFF" stroke="#7FA8D8" stroke-width="1.1"/>
          <path d="M2 6.5 L8.5 16 L12.5 6.2" fill="#F7FAFF" stroke="#7FA8D8" stroke-width="1.1"/>
          <text x="0" y="1" font-size="11" font-weight="800" fill="#1E3A5C" text-anchor="middle">안녕!</text>
        </g>
      </g>
    </g>

    <!-- 전파 편(아치를 나는 봉투) — 최상단 -->
    <g transform="translate(58 78)">
      <g class="cnl-fly">
        <g class="cnl-fly-x">
          <g class="cnl-fly-y">
            <circle r="6.5" fill="#9FE8FF" opacity=".35"/>
            <path d="M-8.5 -1.6 h-6 M-8.5 1.6 h-4" stroke="#9FE8FF" stroke-width="1.4" opacity=".7"/>
            <rect x="-5" y="-3.6" width="10" height="7.2" rx="1" fill="#F8FBFF" stroke="#6FA8D8" stroke-width="1"/>
            <path d="M-5 -3.6 L0 .6 L5 -3.6" stroke="#6FA8D8" stroke-width="1"/>
          </g>
        </g>
      </g>
    </g>
  </svg>`;
}

export const connectLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ConnectStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // 목표 칩 3개 — 달성하면 부제가 걸린 시간으로 바뀌어 칩 줄이 곧 비교표가 된다.
  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "sail" } }, el("b", { text: "돛단배로" }), el("span", { text: "보내기" })),
    el("div", { class: "pn-badge world", dataset: { g: "tel" } }, el("b", { text: "전신으로" }), el("span", { text: "보내기" })),
    el("div", { class: "pn-badge world", dataset: { g: "phone" } }, el("b", { text: "스마트폰으로" }), el("span", { text: "보내기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "지구 반대편 <b>브라질 친구</b>에게 안부를 전해 볼 거예요. 시대마다 걸리는 시간을 재 봐요 — 먼저 <b>1800년대 돛단배</b>부터! 「안부 전하기」를 눌러요.",
  });

  // 무대(SVG + HTML 오버레이: 달력·결과 필)
  const stage = el("div", { class: "cnl-stage", dataset: { era: "sail" } });
  stage.innerHTML = sceneSvg();
  const calDay = el("div", { class: "cnl-cal-day", text: "1일" });
  const calCap = el("div", { class: "cnl-cal-cap", text: "출발!" });
  const calPage = el("div", { class: "cnl-cal-page" }, calDay, calCap);
  const cal = el("div", { class: "cnl-cal", attrs: { "aria-hidden": "true" } }, el("div", { class: "cnl-cal-head" }), calPage);
  const resultV = el("b", { class: "cnl-result-v", text: "—" });
  const result = el(
    "div",
    { class: "cnl-result", attrs: { "aria-live": "polite" } },
    el("span", { class: "cnl-result-k", text: "걸린 시간" }),
    resultV,
  );
  stage.append(cal, result);

  // 조작부(무대 아래): 시대 세그 3개 + 안부 전하기
  const eraBtns = new Map<EraId, HTMLButtonElement>();
  const erasRow = el("div", { class: "cnl-eras", attrs: { role: "group", "aria-label": "시대 고르기" } });
  for (const def of ERAS) {
    const btn = el(
      "button",
      { class: def.id === "sail" ? "cnl-era on" : "cnl-era", attrs: { type: "button", "aria-pressed": String(def.id === "sail") } },
      el("b", { text: def.name }),
      el("span", { text: def.means }),
    );
    btn.addEventListener("click", () => pickEra(def.id));
    erasRow.appendChild(btn);
    eraBtns.set(def.id, btn);
  }
  const sendBtn = el("button", { class: "cnl-send", attrs: { type: "button" }, text: "안부 전하기" });
  sendBtn.addEventListener("click", () => send());

  host.append(goalChips, helper, stage, erasRow, sendBtn); // 지시(helper)는 조작 요소 위
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 무대 부품 참조 ----
  const q = <T extends Element>(sel: string): T => stage.querySelector(sel) as T;
  const boatMv = q<SVGGElement>(".cnl-boat-mv");
  const boatMail = q<SVGGElement>(".cnl-boat-mail");
  const pulses = Array.from(stage.querySelectorAll<SVGPathElement>(".cnl-pulse"));
  const lampL = q<SVGCircleElement>(".cnl-lampL");
  const lampR = q<SVGCircleElement>(".cnl-lampR");
  const arcs = q<SVGGElement>(".cnl-arcs");
  const ringFr = q<SVGCircleElement>(".cnl-ringFr");
  const bubble = q<SVGGElement>(".cnl-bubble");
  const gotmail = q<SVGGElement>(".cnl-gotmail");
  const slip = q<SVGGElement>(".cnl-slip");
  const fly = q<SVGGElement>(".cnl-fly");
  const flyX = q<SVGGElement>(".cnl-fly-x");
  const flyY = q<SVGGElement>(".cnl-fly-y");

  // ---- 상태 ----
  let era: EraId = "sail";
  let busy = false;
  let finished = false;
  const goals = new Set<EraId>();
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };
  const reflow = (): void => {
    void stage.getBoundingClientRect();
  };

  function setBusy(b: boolean): void {
    busy = b;
    sendBtn.disabled = b;
    sendBtn.textContent = b ? "전하는 중…" : "안부 전하기";
    for (const btn of eraBtns.values()) btn.disabled = b;
  }

  // 연출 잔상 일괄 리셋(시대 전환·재전송 공용) — 트랜지션 없이 원위치.
  function resetTransients(): void {
    stage.classList.remove("going", "flying");
    bubble.classList.remove("show");
    gotmail.classList.remove("show");
    slip.classList.remove("show");
    boatMv.style.transition = "none";
    boatMv.style.transform = "translateX(0px)";
    boatMail.style.opacity = "";
    for (const p of pulses) {
      p.style.transition = "none";
      p.style.setProperty("stroke-dashoffset", "34");
    }
    fly.style.opacity = "0";
    flyX.style.transition = "none";
    flyX.style.transform = "translateX(0px)";
    flyY.style.transition = "none";
    flyY.style.transform = "translateY(0px)";
    lampL.classList.remove("blink");
    lampR.classList.remove("blink");
    arcs.classList.remove("zap");
    ringFr.classList.remove("ping");
    cal.classList.remove("show");
    reflow();
  }

  function pickEra(id: EraId): void {
    if (busy || id === era) return;
    era = id;
    stage.dataset.era = id;
    for (const [k, btn] of eraBtns) {
      btn.classList.toggle("on", k === id);
      btn.setAttribute("aria-pressed", String(k === id));
    }
    resetTransients();
    helper.innerHTML = ERAS.find((d) => d.id === id)!.intro;
    haptic(HAPTIC.tap);
  }

  function setResult(v: string): void {
    resultV.textContent = v;
    resultV.classList.remove("pop");
    void resultV.offsetWidth;
    resultV.classList.add("pop");
  }

  function calSet(day: number, cap: string): void {
    calDay.textContent = `${day}일`;
    calCap.textContent = cap;
    calPage.classList.remove("flip");
    void calPage.offsetWidth;
    calPage.classList.add("flip");
  }

  function collect(id: EraId, timeText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = timeText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      later(() => {
        helper.innerHTML =
          "돛단배 <b>두 달</b>이 스마트폰 <b>1초</b>가 됐어요 — 교통과 통신이 발달할수록 세계는 더 자주, 더 빠르게 연결돼요. 이렇게 지역 사이에 사람·물자·정보가 오가는 것을 <b>공간적 상호 작용</b>이라고 해요!";
        haptic(HAPTIC.done);
        api.recordQuiz(true);
        api.enableCTA(s.cta ?? "개념 정리하기");
      }, 1400);
    }
  }

  // ---- 연출 3종 ----
  function sendSail(): void {
    stage.classList.add("going");
    cal.classList.add("show");
    calSet(1, "돛 올려 출발!");
    boatMv.style.transition = "transform 2800ms cubic-bezier(.45,.05,.55,.95)";
    boatMv.style.transform = "translateX(140px)"; // 항로 x 128→268
    helper.innerHTML = "편지를 실은 돛단배가 <b>천천히</b> 바다를 건너요 — 위 달력이 팔랑팔랑 넘어가요!";
    const days = [4, 9, 15, 22, 30, 38, 46, 53, 60];
    days.forEach((d, i) => {
      later(() => calSet(d, d < 30 ? "바다 위 항해 중…" : d < 60 ? "벌써 한 달째…" : "두 달째!"), 300 + i * 270);
    });
    later(() => {
      stage.classList.remove("going");
      boatMail.style.opacity = "0";
      gotmail.classList.add("show");
      haptic(HAPTIC.correct);
      calSet(60, "두 달 걸렸어요!");
      setResult("약 두 달");
      helper.innerHTML = "약 <b>두 달</b> 걸렸어요! 바람의 힘으로 가던 시절엔 지구 반대편 소식이 계절이 바뀔 즈음에야 닿았어요.";
      collect("sail", "두 달");
    }, 2850);
    later(() => setBusy(false), 3500);
  }

  function sendTel(): void {
    lampL.classList.add("blink");
    for (const p of pulses) {
      p.style.transition = "stroke-dashoffset 1200ms linear";
      p.style.setProperty("stroke-dashoffset", "-606"); // 34 → -606: 케이블을 훑고 지나간다
    }
    helper.innerHTML = "따다다닥 — 전기 신호가 <b>바다 밑 케이블</b>을 타고 지구 반대편으로 달려가요!";
    later(() => {
      lampR.classList.add("blink");
      slip.classList.add("show");
      haptic(HAPTIC.correct);
    }, 1200);
    later(() => {
      setResult("몇 시간");
      helper.innerHTML =
        "<b>몇 시간</b> 만에 도착! 신호는 순식간에 바다를 건넜고, 전보를 접수하고 번역해 집까지 배달하는 시간을 더해도 몇 시간이면 안부가 닿았어요.";
      collect("tel", "몇 시간");
    }, 1500);
    later(() => setBusy(false), 2150);
  }

  function sendPhone(): void {
    stage.classList.add("flying");
    arcs.classList.add("zap");
    fly.style.opacity = "1";
    flyX.style.transition = "transform 250ms linear";
    flyX.style.transform = "translateX(284px)"; // 아치 58→342
    flyY.style.transition = "transform 125ms cubic-bezier(.3,.6,.55,1)";
    flyY.style.transform = "translateY(-46px)"; // 아치 봉우리
    helper.innerHTML = "번쩍 — 전파가 빛의 빠르기로 날아가요!";
    later(() => {
      flyY.style.transition = "transform 125ms cubic-bezier(.45,0,.7,.4)";
      flyY.style.transform = "translateY(0px)";
    }, 125);
    later(() => {
      fly.style.opacity = "0";
      ringFr.classList.add("ping");
      bubble.classList.add("show");
      haptic(HAPTIC.correct);
    }, 260);
    later(() => {
      setResult("1초 미만");
      helper.innerHTML = "<b>1초</b>도 안 걸려요! 보내는 순간 지구 반대편 친구의 화면에 말풍선이 떠요.";
      collect("phone", "1초 미만");
    }, 650);
    later(() => {
      setBusy(false);
      stage.classList.remove("flying");
    }, 1200);
  }

  function send(): void {
    if (busy) return;
    setBusy(true);
    resetTransients();
    haptic(HAPTIC.select);
    setResult("…");
    if (era === "sail") sendSail();
    else if (era === "tel") sendTel();
    else sendPhone();
  }

  api.setCTA("세 시대 모두 안부를 전해요", { enabled: false });

  return () => {
    for (const t of timers) window.clearTimeout(t);
  };
};
