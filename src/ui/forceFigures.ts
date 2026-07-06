// 힘 단원(V) 퀴즈·recap 그림 — 손코딩 SVG.
// 색은 개념 구분용 보조일 뿐 정답 단서가 되지 않도록 라벨과 구조로 읽히게 한다.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 힘 화살표의 세 요소 — 작용점, 방향, 크기 */
export function forceArrowFig(): string {
  return `<svg viewBox="0 0 344 180" ${NS} role="img" aria-label="나무 블록에 우상향 힘 화살표가 그려진 그림">
    <defs>
      <linearGradient id="ffWood" x1="76" y1="82" x2="184" y2="138" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F1D6A3"/><stop offset=".55" stop-color="#D7A86A"/><stop offset="1" stop-color="#B77E3E"/>
      </linearGradient>
      <radialGradient id="ffWoodHi" cx=".28" cy=".18" r=".72">
        <stop offset="0" stop-color="#FFF2D2" stop-opacity=".9"/><stop offset="1" stop-color="#FFF2D2" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="130" cy="144" rx="74" ry="8" fill="#2A3A5E" opacity=".10"/>
    <rect x="58" y="78" width="132" height="58" rx="12" fill="url(#ffWood)"/>
    <rect x="58" y="78" width="132" height="58" rx="12" fill="url(#ffWoodHi)"/>
    <rect x="58" y="78" width="132" height="58" rx="12" stroke="#9B6733" stroke-width="1.6"/>
    <path d="M72 94q22-7 43 0M86 118q30 8 70-1" stroke="#C48B4E" stroke-width="2" opacity=".55"/>
    <circle cx="190" cy="98" r="5.2" fill="#F04452"/>
    <path d="M190 98l76-76" stroke="#F04452" stroke-width="5" stroke-linecap="round"/>
    <path d="M266 22l-4 24-20-20z" fill="#F04452"/>
    <path d="M196 104l70-70" stroke="#D4DAE3" stroke-width="1.6" stroke-dasharray="5 5"/>
    <path d="M205 98q20-8 34-22" stroke="#D4DAE3" stroke-width="1.6" stroke-dasharray="4 5"/>
    <text x="178" y="75" font-size="14" font-weight="800" fill="#4E5968">㉠ 작용점</text>
    <path d="M184 78l6 14" stroke="#B0B8C1" stroke-width="1.6"/>
    <text x="220" y="86" font-size="14" font-weight="800" fill="#4E5968">㉡ 길이</text>
    <path d="M226 88l18-18" stroke="#B0B8C1" stroke-width="1.6"/>
    <text x="270" y="34" font-size="14" font-weight="800" fill="#4E5968">㉢ 방향</text>
    <path d="M270 38l-9 6" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="34" y1="152" x2="312" y2="152" stroke="#E7EAEE" stroke-width="1.6"/>
  </svg>`;
}

const MINI: Record<string, string> = {
  forceDef: `<defs>
      <radialGradient id="fmBall" cx=".32" cy=".28" r=".75">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset=".42" stop-color="#DCEAFF"/><stop offset="1" stop-color="#8FB3E8"/>
      </radialGradient>
    </defs>
    <path d="M12 39q9-10 18-6" stroke="#8B95A1" stroke-width="3"/>
    <path d="M12 39l-6 8M16 42l-4 10" stroke="#8B95A1" stroke-width="3"/>
    <circle cx="43" cy="32" r="13" fill="url(#fmBall)" stroke="#6B8DBE" stroke-width="2"/>
    <path d="M24 32h15" stroke="#F04452" stroke-width="4"/>
    <path d="M39 25l9 7-9 7" fill="#F04452"/>
    <path d="M48 15l3 5 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill="#F0A422" opacity=".85"/>`,
  arrow3: `<circle cx="18" cy="46" r="4.5" fill="#4E5968"/>
    <path d="M18 46l30-30" stroke="#F04452" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M48 16l-3 17-14-14z" fill="#F04452"/>
    <path d="M24 46l28-28" stroke="#B0B8C1" stroke-width="1.6" stroke-dasharray="4 4"/>
    <circle cx="18" cy="46" r="7" stroke="#D4DAE3" stroke-width="1.6"/>
    <circle cx="34" cy="30" r="3" fill="#4E5968"/>
    <circle cx="48" cy="16" r="4" fill="#4E5968"/>
    <path d="M12 54h12M28 54h12M44 54h8" stroke="#D4DAE3" stroke-width="2" stroke-linecap="round"/>`,
};

export function miniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
