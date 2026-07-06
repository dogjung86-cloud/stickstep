// civFigures — I 단원(과학과 인류의 지속가능한 삶) recap 미니아트.
// 파운드리 문법의 다크 미니 패널(다른 단원 recap 아트와 같은 결).

const NS = `xmlns="http://www.w3.org/2000/svg"`;

export function civMiniArt(key: string): string {
  const wrap = (inner: string, defs = ""): string =>
    `<svg viewBox="0 0 96 96" ${NS} fill="none" stroke-linecap="round" aria-hidden="true">
      <defs>
        <linearGradient id="cma-bg" x1="0" y1="0" x2="0" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#0C1630"/><stop offset="1" stop-color="#1A2A4E"/>
        </linearGradient>${defs}
      </defs>
      <rect x="2" y="2" width="92" height="92" rx="18" fill="url(#cma-bg)"/>
      ${inner}
    </svg>`;
  const blueG = `<linearGradient id="cma-bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FB2F0"/><stop offset="1" stop-color="#2E6FD4"/></linearGradient>`;
  const warmG = `<radialGradient id="cma-wa" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F0A422"/></radialGradient>`;
  const greenG = `<linearGradient id="cma-gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CE0B4"/><stop offset="1" stop-color="#12B886"/></linearGradient>`;

  switch (key) {
    case "steps123": // 물음표 → 전구 → 저울(공정한 설계)
      return wrap(
        `<path d="M18 34q0-10 10-10t10 8q0 6-8 9l-1 5" stroke="#8FB3E8" stroke-width="4"/>
        <circle cx="28" cy="54" r="2.6" fill="#8FB3E8"/>
        <circle cx="62" cy="30" r="11" fill="url(#cma-wa)"/>
        <path d="M58 44h8M59 49h6" stroke="#FFD79E" stroke-width="2.6"/>
        <path d="M30 70h36M48 62v8M36 70l-6 10h12zM60 70l-6 10h12z" stroke="url(#cma-bl)" stroke-width="3"/>`,
        warmG + blueG,
      );
    case "steps456": // 플라스크 → 그래프 → 체크
      return wrap(
        `<path d="M28 20v12l-9 18a7 7 0 0 0 6 10h12a7 7 0 0 0 6-10l-9-18V20" stroke="#8FB3E8" stroke-width="3.4"/>
        <path d="M24 20h14" stroke="#8FB3E8" stroke-width="3.4"/>
        <path d="M23 50h16" stroke="#4ADEC2" stroke-width="4"/>
        <path d="M56 66V38M56 66h26" stroke="#5A78A8" stroke-width="2.6"/>
        <path d="M58 60l7-8 6 4 9-12" stroke="url(#cma-gr)" stroke-width="3.4"/>
        <path d="M66 24l5 5 9-10" stroke="#FFD25E" stroke-width="4"/>`,
        blueG + greenG,
      );
    case "control": // 같음·같음·다름(하나만 다르게)
      return wrap(
        `<g stroke-width="3">
          <path d="M16 40h14l-2 26H18z" fill="rgba(143,179,232,.2)" stroke="#8FB3E8"/>
          <path d="M41 40h14l-2 26H43z" fill="rgba(143,179,232,.2)" stroke="#8FB3E8"/>
          <path d="M66 40h14l-2 26H68z" fill="rgba(74,222,194,.28)" stroke="#4ADEC2"/>
        </g>
        <path d="M20 30q3-4 6 0t6 0M45 30q3-4 6 0t6 0" stroke="#5A78A8" stroke-width="2.4"/>
        <path d="M70 26l3 4 5-6" stroke="#4ADEC2" stroke-width="3.4"/>`,
      );
    case "graphread": // 그래프 + 돋보기
      return wrap(
        `<path d="M18 72V26M18 72h58" stroke="#5A78A8" stroke-width="2.8"/>
        <path d="M22 66q14-8 22-22t14-18" stroke="#FFD25E" stroke-width="3.6"/>
        <path d="M22 66q16-4 30-10t20-14" stroke="#8FB3E8" stroke-width="3" opacity=".75"/>
        <circle cx="58" cy="38" r="13" stroke="#4ADEC2" stroke-width="3.4"/>
        <path d="M67 48l10 10" stroke="#4ADEC2" stroke-width="4"/>`,
      );
    case "principle": // 전구 → 톱니 → 도시
      return wrap(
        `<circle cx="22" cy="30" r="9" fill="url(#cma-wa)"/>
        <path d="M19 41h6M20 45h4" stroke="#FFD79E" stroke-width="2"/>
        <path d="M34 32h8M58 32h-4" stroke="#5A78A8" stroke-width="2.6"/>
        <path d="M38 30l4 2-4 2z" fill="#5A78A8"/>
        <g stroke="#8FB3E8" stroke-width="3">
          <circle cx="50" cy="32" r="7"/>
          <path d="M50 22v-4M50 42v4M40 32h-4M60 32h4M43 25l-3-3M57 39l3 3M57 25l3-3M43 39l-3 3"/>
        </g>
        <path d="M20 76V62h10v14M34 76V54h12v22M50 76V60h10v16M64 76V50h12v26" stroke="url(#cma-bl)" stroke-width="3.2"/>
        <path d="M14 76h68" stroke="#5A78A8" stroke-width="2.6"/>`,
        warmG + blueG,
      );
    case "moments": // 증기 기관차
      return wrap(
        `<circle cx="26" cy="22" r="6" fill="rgba(220,232,255,.35)"/>
        <circle cx="38" cy="16" r="8" fill="rgba(220,232,255,.3)"/>
        <circle cx="52" cy="12" r="5" fill="rgba(220,232,255,.25)"/>
        <path d="M18 44h34v18H18zM52 50h16l8 8v4H52z" fill="rgba(143,179,232,.22)" stroke="#8FB3E8" stroke-width="3"/>
        <rect x="22" y="30" width="8" height="14" fill="rgba(143,179,232,.22)" stroke="#8FB3E8" stroke-width="3"/>
        <circle cx="30" cy="68" r="6" stroke="#4ADEC2" stroke-width="3.4"/>
        <circle cx="56" cy="68" r="6" stroke="#4ADEC2" stroke-width="3.4"/>
        <circle cx="72" cy="68" r="4.4" stroke="#4ADEC2" stroke-width="3"/>
        <path d="M12 78h72" stroke="#5A78A8" stroke-width="2.8"/>`,
      );
    case "aitech": // 칩 + 스파클
      return wrap(
        `<rect x="30" y="30" width="36" height="36" rx="7" stroke="#8FB3E8" stroke-width="3.4" fill="rgba(143,179,232,.14)"/>
        <path d="M40 24v-8M56 24v-8M40 80v-8M56 80v-8M24 40h-8M24 56h-8M80 40h-8M80 56h-8" stroke="#5A78A8" stroke-width="3"/>
        <path d="M48 38c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z" fill="#4ADEC2"/>`,
      );
    case "ethics": // 방패 + 하트
      return wrap(
        `<path d="M48 16l24 8v20c0 16-10 26-24 34C34 70 24 60 24 44V24z" stroke="#8FB3E8" stroke-width="3.4" fill="rgba(143,179,232,.14)"/>
        <path d="M48 56s-12-7-12-15a7 7 0 0 1 12-5 7 7 0 0 1 12 5c0 8-12 15-12 15z" fill="#FF8FA0"/>`,
      );
    case "crisis": // 지구 + 온도계
      return wrap(
        `<circle cx="40" cy="52" r="24" fill="url(#cma-bl)" opacity=".9"/>
        <path d="M26 44q8-8 16-4t10 8q-10 5-17 2t-9-6zM40 66q8-4 14-1-6 6-14 1z" fill="#7CA65A"/>
        <circle cx="40" cy="52" r="24" stroke="#1B3A78" stroke-width="2.4"/>
        <rect x="70" y="22" width="9" height="40" rx="4.5" fill="#fff" opacity=".92"/>
        <rect x="72.3" y="34" width="4.4" height="26" fill="#F04452"/>
        <circle cx="74.5" cy="66" r="6.4" fill="#F04452"/>`,
        blueG,
      );
    case "solutions": // 태양광 패널 + 재활용 화살표
      return wrap(
        `<circle cx="26" cy="24" r="9" fill="url(#cma-wa)"/>
        <path d="M34 46l10-14h28l10 14z" fill="rgba(143,179,232,.25)" stroke="#8FB3E8" stroke-width="3"/>
        <path d="M48 36l-4 10M62 36l-2 10M42 41h36" stroke="#8FB3E8" stroke-width="2"/>
        <path d="M48 46v10" stroke="#8FB3E8" stroke-width="3"/>
        <g stroke="url(#cma-gr)" stroke-width="3.6" fill="none">
          <path d="M34 72a12 12 0 0 1 20-9"/>
          <path d="M60 60a12 12 0 0 1-4 21"/>
        </g>
        <path d="M52 58l4 5-7 1zM56 84l-6-2 4-6z" fill="#12B886"/>`,
        warmG + greenG,
      );
    default:
      return wrap(`<circle cx="48" cy="48" r="18" fill="url(#cma-bl)"/>`, blueG);
  }
}
