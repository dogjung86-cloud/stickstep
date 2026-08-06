// socFigures11 — 사회 Ⅺ(일상생활과 법) 그림 모듈. socFigures10 문법 계승 —
// 개념 도해(벡터)+스틱맨 장면, 파운드리 문법 준수, 스틱맨만 손그림 라인.
//   · 퀴즈 그림 라벨은 (가)(나)·㉠㉡식 중립 라벨만 — 정답 유출 금지(aria에도 개념 이름 대신 묘사만).
//   · 민감 가드: 무성별 스틱맨, 실사건·실명 0, 범죄 장면 재현 0(제재는 문서·저울로만 표현),
//     조직도류 연결선은 출발-도착 짝이 곧 의미(localOrgFig 오독 교훈 — 배선 눈검수 필수).
const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

function shell(vw: number, vh: number, inner: string, aria: string, defs = ""): string {
  return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${aria}">
    <defs>
      <linearGradient id="s11-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#EEF2F8"/></linearGradient>
      <linearGradient id="s11-brown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07E2E"/><stop offset=".55" stop-color="#8C5A16"/><stop offset="1" stop-color="#6E4610"/></linearGradient>
      <linearGradient id="s11-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECC26A"/><stop offset="1" stop-color="#A8781E"/></linearGradient>
      <linearGradient id="s11-stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EFE7D6"/><stop offset=".5" stop-color="#E0D4BC"/><stop offset="1" stop-color="#C8B896"/></linearGradient>
      ${defs}
    </defs>
    <rect x="2" y="2" width="${vw - 4}" height="${vh - 4}" rx="14" fill="url(#s11-paper)" stroke="#D3DCE8" stroke-width="1.6"/>
    ${inner}
  </svg>`;
}

/** (가)(나)·㉠㉡ 라벨 필 */
function pill(x: number, y: number, label: string): string {
  return `<rect x="${x - 17}" y="${y - 11}" width="34" height="19" rx="9.5" fill="#39455C"/>
    <text x="${x}" y="${y + 3}" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">${label}</text>`;
}

/** 미니 스틱맨(정면·팔 포즈 옵션) */
function tinyMan(x: number, y: number, opts: { arm?: "up" | "down" | "out"; mood?: "ok" | "sad" | "joy"; r?: number } = {}): string {
  const r = opts.r ?? 6;
  const arm = opts.arm ?? "out";
  const arms =
    arm === "up"
      ? `M${x} ${y + r + 4}l-${r + 2} -6M${x} ${y + r + 4}l${r + 2} -8`
      : arm === "down"
        ? `M${x} ${y + r + 4}l-${r + 1} ${r}M${x} ${y + r + 4}l${r + 1} ${r}`
        : `M${x} ${y + r + 4}l-${r + 2} 4M${x} ${y + r + 4}l${r + 2} 4`;
  const mood = opts.mood ?? "ok";
  const face =
    mood === "sad"
      ? `<circle cx="${x - 2}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 1.8} ${y + 3.4}q1.8-1.5 3.6 0" stroke="#3C4654" stroke-width="1.1" fill="none"/>`
      : mood === "joy"
        ? `<path d="M${x - 3} ${y - 1}q1.2-1.4 2.4 0M${x + 0.6} ${y - 1}q1.2-1.4 2.4 0" stroke="#3C4654" stroke-width="1.1" fill="none"/><path d="M${x - 2} ${y + 2.6}q2 1.8 4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`
        : `<circle cx="${x - 2}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 1.6} ${y + 2.8}q1.6 1.2 3.2 0" stroke="#3C4654" stroke-width="1.1" fill="none"/>`;
  return `<g ${STICK}><circle cx="${x}" cy="${y}" r="${r}" fill="#F6EFE4"/>
    <path d="M${x} ${y + r}v${r + 6}M${x} ${y + r * 2 + 6}l-${r - 1} ${r + 3}M${x} ${y + r * 2 + 6}l${r - 1} ${r + 3}${arms}"/></g>${face}`;
}

/* ---------- L1: 위반의 결과 두 장면 — 양심의 가책 vs 국가의 제재 ---------- */
export function lawMoralFig(): string {
  const inner = `
    <line x1="150" y1="14" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 26, "(가)")}
    ${pill(224, 26, "(나)")}
    <!-- (가) 자리를 양보하지 않음: 마음의 구름 + 주변의 시선 -->
    ${tinyMan(66, 66, { arm: "down", mood: "sad", r: 6.4 })}
    <rect x="46" y="92" width="40" height="12" rx="4" fill="#B8C2CE"/>
    <path d="M84 44q6-8 14-4 6-6 12-1 5 4 2 10 3 3-1 6-4 3-9 1H88q-7-2-4-12z" fill="#EEF2F8" stroke="#B8C2CE" stroke-width="1.3"/>
    ${tinyMan(108, 106, { mood: "sad", r: 5 })}
    <text x="76" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">마음이 무겁고, 시선이 따가워요</text>
    <!-- (나) 신호 위반: 신호등 + 국가의 제재 문서 -->
    <rect x="186" y="40" width="13" height="28" rx="4" fill="#39455C"/>
    <circle cx="192.5" cy="48" r="4.4" fill="#E8746A"/><circle cx="192.5" cy="60" r="4.4" fill="#3E4A5C"/>
    <rect x="189.5" y="68" width="6" height="22" rx="2.4" fill="#39455C"/>
    ${tinyMan(228, 62, { arm: "down", r: 6.4 })}
    <g transform="rotate(-8 250 104)">
      <rect x="234" y="90" width="34" height="26" rx="3" fill="#FFFFFF" stroke="#8C5A16" stroke-width="1.6"/>
      <path d="M240 98h22M240 103h15" stroke="#C8A360" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="260" cy="110" r="4.6" fill="none" stroke="#C0392E" stroke-width="1.5"/>
    </g>
    <text x="224" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">국가가 정한 제재를 받아요</text>`;
  return shell(300, 158, inner, "두 장면 비교 — 왼쪽은 무거운 마음과 주변의 시선, 오른쪽은 신호등 앞에서 제재 문서를 받는 장면");
}

/* ---------- L2: 정의의 두 얼굴 — 같은 것은 같게, 다른 것은 다르게 ---------- */
export function justiceFig(): string {
  const inner = `
    <line x1="150" y1="14" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 26, "(가)")}
    ${pill(224, 26, "(나)")}
    <!-- (가) 같은 것은 같게: 두 사람이 똑같은 카드를 받음 -->
    ${tinyMan(52, 62, { r: 6 })}${tinyMan(100, 62, { r: 6 })}
    <rect x="38" y="92" width="28" height="18" rx="3" fill="#FFFFFF" stroke="#8C5A16" stroke-width="1.6"/>
    <rect x="86" y="92" width="28" height="18" rx="3" fill="#FFFFFF" stroke="#8C5A16" stroke-width="1.6"/>
    <path d="M44 99h16M44 104h10M92 99h16M92 104h10" stroke="#C8A360" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M70 98h12M76 92v12" stroke="#5A6478" stroke-width="1.8" stroke-linecap="round"/>
    <text x="76" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">같은 일에는 똑같은 잣대</text>
    <!-- (나) 다른 것은 다르게: 더 많이 일한 쪽에 더 큰 몫 -->
    ${tinyMan(190, 62, { r: 6 })}${tinyMan(252, 56, { arm: "up", mood: "joy", r: 6 })}
    <rect x="178" y="94" width="24" height="14" rx="3" fill="url(#s11-gold)" stroke="#8A6034" stroke-width="1.3"/>
    <rect x="234" y="84" width="36" height="24" rx="3" fill="url(#s11-gold)" stroke="#8A6034" stroke-width="1.5"/>
    <path d="M244 78q8-6 16 0" stroke="#A8781E" stroke-width="1.6" fill="none"/>
    <text x="224" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">노력한 만큼 다른 몫</text>`;
  return shell(300, 158, inner, "두 장면 비교 — 왼쪽은 두 사람이 똑같은 카드를 받는 장면, 오른쪽은 더 많이 일한 사람이 더 큰 몫을 받는 장면");
}

/* ---------- L3: 법의 두 구역 지도 — ㉠ 공적 관계 / ㉡ 사적 관계 ---------- */
export function lawZoneFig(): string {
  const inner = `
    <path d="M150 20v124" stroke="#8C5A16" stroke-width="2" stroke-dasharray="6 5"/>
    ${pill(76, 30, "㉠")}
    ${pill(224, 30, "㉡")}
    <!-- ㉠ 구역: 관공서(기둥 건물) + 투표함 + 세금 문서 -->
    <path d="M76 44L46 60h60z" fill="url(#s11-stone)" stroke="#8A93A6" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="50" y="60" width="52" height="5" rx="1.6" fill="#C8B896" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="55" y="65" width="8" height="22" rx="1.6" fill="url(#s11-stone)" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="72" y="65" width="8" height="22" rx="1.6" fill="url(#s11-stone)" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="89" y="65" width="8" height="22" rx="1.6" fill="url(#s11-stone)" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="48" y="87" width="56" height="5" rx="2" fill="#C8B896" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="42" y="104" width="28" height="20" rx="4" fill="#4A86C8" stroke="#2A5A94" stroke-width="1.5"/>
    <rect x="50" y="100" width="12" height="4" rx="2" fill="#2A5A94"/>
    <g transform="rotate(-6 96 114)"><rect x="84" y="104" width="24" height="18" rx="2.6" fill="#FFF" stroke="#8A93A6" stroke-width="1.3"/><path d="M89 110h14M89 115h9" stroke="#A8B2C2" stroke-width="1.2"/></g>
    <text x="76" y="146" text-anchor="middle" font-size="9.6" fill="#7E8AA0">국가가 등장하는 생활</text>
    <!-- ㉡ 구역: 집 + 가게 + 계약 악수 -->
    <path d="M196 58l16-12 16 12v22h-32z" fill="#FFF" stroke="#B8926A" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="207" y="66" width="10" height="14" rx="1.6" fill="#E0D4BC" stroke="#B8926A" stroke-width="1.1"/>
    <rect x="238" y="52" width="30" height="28" rx="3" fill="#FFF" stroke="#B8926A" stroke-width="1.5"/>
    <path d="M236 52h34l-3-8h-28z" fill="url(#s11-gold)" stroke="#8A6034" stroke-width="1.3"/>
    ${tinyMan(210, 104, { r: 5.4 })}${tinyMan(244, 104, { r: 5.4 })}
    <path d="M218 116q9 4 18 0" stroke="#3C4654" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <text x="224" y="146" text-anchor="middle" font-size="9.6" fill="#7E8AA0">개인끼리 어울리는 생활</text>`;
  return shell(300, 158, inner, "가운데 점선으로 나뉜 두 구역 — 왼쪽은 기둥 건물과 투표함과 문서, 오른쪽은 집과 가게와 악수하는 두 사람");
}

/* ---------- L4: 사회법의 세 갈래 — 우산 아래 ㉠㉡㉢ ---------- */
export function socialLawFig(): string {
  const inner = `
    <path d="M150 24q-72 0-104 34 6-8 18-6-2-10 10-14-1-9 12-10 3-8 16-6 6-7 16-4 8-5 16-2 8-3 16 2 10-3 16 4 13-2 16 6 13 1 12 10 12 4 10 14 12-2 18 6-32-34-104-34z" fill="url(#s11-brown)" stroke="#5A3A0C" stroke-width="1.8" stroke-linejoin="round" transform="translate(0 2)"/>
    <path d="M150 24v-8" stroke="#5A3A0C" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M150 60v6" stroke="#8C5A16" stroke-width="2" stroke-linecap="round"/>
    <path d="M62 52q-3 6-10 6" stroke="#8A93A6" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M240 48q3 6 10 6" stroke="#8A93A6" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <!-- 세 칸: ㉠ 일터 / ㉡ 시장 / ㉢ 살림 -->
    <rect x="26" y="72" width="78" height="62" rx="8" fill="#FFF" stroke="#C8B896" stroke-width="1.5"/>
    ${pill(65, 84, "㉠")}
    ${tinyMan(50, 106, { r: 5.2 })}
    <rect x="66" y="100" width="26" height="16" rx="2.6" fill="url(#s11-stone)" stroke="#A89878" stroke-width="1.2"/>
    <path d="M70 108h18M70 112h12" stroke="#B8A888" stroke-width="1.3" stroke-linecap="round"/>
    <text x="65" y="128" text-anchor="middle" font-size="8.6" fill="#7E8AA0">일하는 사람</text>
    <rect x="111" y="72" width="78" height="62" rx="8" fill="#FFF" stroke="#C8B896" stroke-width="1.5"/>
    ${pill(150, 84, "㉡")}
    <path d="M132 106h14l2-8h-18zM158 106h14l2-8h-18z" fill="url(#s11-gold)" stroke="#8A6034" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M139 94q4-6 8 0M165 94q4-6 8 0" stroke="#8A6034" stroke-width="1.3" fill="none"/>
    <path d="M144 112h12" stroke="#5A6478" stroke-width="1.8" stroke-linecap="round"/>
    <text x="150" y="128" text-anchor="middle" font-size="8.6" fill="#7E8AA0">공정한 시장·소비자</text>
    <rect x="196" y="72" width="78" height="62" rx="8" fill="#FFF" stroke="#C8B896" stroke-width="1.5"/>
    ${pill(235, 84, "㉢")}
    <path d="M223 108q-6-8 0-12 4-3 8 0 4-3 8 0 6 4 0 12l-8 7z" fill="#E8746A" stroke="#B84434" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M248 100l12 0m-6-6v12" stroke="#5A6478" stroke-width="1.8" stroke-linecap="round"/>
    <text x="235" y="128" text-anchor="middle" font-size="8.6" fill="#7E8AA0">어려울 때의 버팀목</text>
    <text x="150" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">하나의 큰 우산 아래 세 갈래 길</text>`;
  return shell(300, 160, inner, "큰 우산 아래 세 칸 — 일하는 사람의 칸, 저울과 시장의 칸, 하트와 도움의 칸");
}

/* ---------- L5: 두 법정의 자리 배치 — (가) 민사 / (나) 형사 ---------- */
export function trialCompareFig(): string {
  const benchArt = (cx: number): string => `
    ${tinyMan(cx, 38, { r: 5 })}
    <rect x="${cx - 24}" y="52" width="48" height="13" rx="3" fill="url(#s11-brown)" stroke="#6E4E26" stroke-width="1.3"/>`;
  const inner = `
    <line x1="150" y1="14" x2="150" y2="150" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 22, "(가)")}
    ${pill(224, 22, "(나)")}
    ${benchArt(76)}
    ${tinyMan(42, 88, { arm: "up", r: 5.4 })}
    <rect x="28" y="112" width="30" height="8" rx="2.6" fill="#C8A360"/>
    <text x="43" y="134" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5A6478">소송을 건 쪽</text>
    ${tinyMan(110, 88, { r: 5.4 })}
    <rect x="96" y="112" width="30" height="8" rx="2.6" fill="#C8A360"/>
    <text x="110" y="134" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5A6478">소송을 당한 쪽</text>
    ${benchArt(224)}
    ${tinyMan(186, 88, { arm: "up", r: 5.4 })}
    <rect x="172" y="112" width="30" height="8" rx="2.6" fill="#8FA0B8"/>
    <text x="187" y="134" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5A6478">국가 대표 기소</text>
    ${tinyMan(246, 88, { r: 5.4 })}${tinyMan(272, 92, { r: 4.6 })}
    <rect x="234" y="112" width="52" height="8" rx="2.6" fill="#8FA0B8"/>
    <text x="258" y="134" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5A6478">재판받는 쪽·조력자</text>
    <text x="150" y="150" text-anchor="middle" font-size="0" fill="#7E8AA0"> </text>`;
  return shell(300, 158, inner, "두 법정 자리 배치 비교 — 왼쪽 법정은 두 개인이 마주 서고, 오른쪽 법정은 국가 쪽 자리와 재판받는 쪽 자리가 마주 선다");
}

/* ---------- L6: 공정한 재판의 네 장치 카드 — (가)~(라) 아이콘 ---------- */
export function fairDeviceFig(): string {
  const card = (x: number, y: number, label: string, icon: string): string => `
    <rect x="${x - 64}" y="${y - 32}" width="128" height="64" rx="9" fill="#FFFFFF" stroke="#C8B896" stroke-width="1.5"/>
    ${pill(x - 41, y - 16, label)}
    <g transform="translate(${x + 14} ${y})">${icon}</g>`;
  const inner = `
    ${card(80, 48, "(가)", `
      <rect x="-26" y="-14" width="8" height="30" rx="3" fill="#8C5A16"/>
      <rect x="18" y="-14" width="8" height="30" rx="3" fill="#8C5A16"/>
      <rect x="-8" y="-6" width="16" height="12" rx="2.6" fill="#C89A5E" stroke="#6E4E26" stroke-width="1.3"/>
      <circle cx="0" cy="-13" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.4"/>
      <path d="M-40 -8h7M33 -8h7M-40 6h7M33 6h7" stroke="#C0392E" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="1 4"/>`)}
    ${card(220, 48, "(나)", `
      <rect x="-26" y="-18" width="52" height="26" rx="3.4" fill="none" stroke="#8A93A6" stroke-width="1.5"/>
      <path d="M-24 -16q6 10 0 22M24 -16q-6 10 0 22" stroke="#5A6B86" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="-8" cy="16" r="3.4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.2"/>
      <circle cx="4" cy="16" r="3.4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.2"/>
      <circle cx="16" cy="16" r="3.4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.2"/>
      <circle cx="0" cy="-6" r="4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.2"/>`)}
    ${card(80, 118, "(다)", `
      <circle cx="-12" cy="-4" r="9" fill="none" stroke="#39455C" stroke-width="2"/>
      <path d="M-5 3l9 9" stroke="#39455C" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="8" y="-16" width="15" height="19" rx="2.4" fill="#FFF" stroke="#8C5A16" stroke-width="1.4"/>
      <circle cx="16" cy="13" r="5.6" fill="#8C5A16"/>
      <path d="M13.6 13l1.7 1.9 3-3.6" stroke="#FFF" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`)}
    ${card(220, 118, "(라)", `
      <rect x="-28" y="6" width="16" height="11" rx="2.2" fill="#E8CFA0" stroke="#8A6034" stroke-width="1.3"/>
      <rect x="-13" y="-4" width="16" height="21" rx="2.2" fill="#D8B476" stroke="#8A6034" stroke-width="1.3"/>
      <rect x="2" y="-14" width="16" height="31" rx="2.2" fill="#C89A4E" stroke="#8A6034" stroke-width="1.3"/>
      <path d="M-22 2l11-7M-7 -9l11-7" stroke="#8C5A16" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="3 3"/>`)}
    <text x="150" y="152" text-anchor="middle" font-size="9.6" fill="#7E8AA0">스틱 시 법원이 갖춘 네 가지 장치</text>`;
  return shell(300, 162, inner, "네 장의 장치 카드 — 판사석 양옆 바람막이, 열린 커튼과 방청객, 돋보기와 채택 도장 찍힌 서류, 세 단의 계단");
}

/* ---------- L7: 세 계단 심급 구조 — ㉠(1심→2심)·㉡(2심→대법원) 화살표 ----------
   연결선 배선 주의(localOrgFig 교훈): ㉠은 1심 상자에서 출발해 2심 상자에 닿고,
   ㉡은 2심 상자에서 출발해 대법원 상자에 닿는다 — 출발·도착이 곧 의미. */
export function appealLadderFig(): string {
  const box = (x: number, y: number, w: number, label: string): string => `
    <rect x="${x - w / 2}" y="${y - 17}" width="${w}" height="34" rx="7" fill="url(#s11-brown)" stroke="#5A3A0C" stroke-width="1.6"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#FFF">${label}</text>`;
  const inner = `
    ${box(64, 118, 76, "1심 법원")}
    ${box(150, 80, 76, "2심 법원")}
    ${box(236, 42, 76, "대법원")}
    <path d="M92 102 Q112 84 122 82" stroke="#8C5A16" stroke-width="2.4" fill="none" stroke-dasharray="5 4"/>
    <path d="M116 78l8 3-6 6" fill="none" stroke="#8C5A16" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    ${pill(96, 66, "㉠")}
    <path d="M178 64 Q198 46 208 44" stroke="#8C5A16" stroke-width="2.4" fill="none" stroke-dasharray="5 4"/>
    <path d="M202 40l8 3-6 6" fill="none" stroke="#8C5A16" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    ${pill(182, 28, "㉡")}
    <text x="64" y="148" text-anchor="middle" font-size="9" fill="#7E8AA0">처음 재판</text>
    <text x="150" y="112" text-anchor="middle" font-size="9" fill="#7E8AA0">다시 한 번</text>
    <text x="236" y="74" text-anchor="middle" font-size="9" fill="#7E8AA0">마지막 판단</text>`;
  return shell(300, 158, inner, "계단처럼 놓인 세 법원 상자 — 첫 상자에서 둘째 상자로 가는 화살표와 둘째 상자에서 셋째 상자로 가는 화살표에 각각 빈 라벨");
}

/* ---------- recap 카드 미니아트 — 64×64 플랫(soc 관례) ---------- */
const MA: Record<string, string> = {
  // L1
  norm: `<circle cx="22" cy="24" r="6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.7"/><circle cx="42" cy="24" r="6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.7"/>
    <path d="M22 30v10M42 30v10" stroke="#3C4654" stroke-width="1.7" stroke-linecap="round"/>
    <rect x="14" y="46" width="36" height="10" rx="4" fill="#EADFC8" stroke="#8C5A16" stroke-width="1.6"/>
    <path d="M20 51h24" stroke="#8C5A16" stroke-width="1.5" stroke-linecap="round"/>`,
  law: `<path d="M16 18q16-5 32 0v26q-16-5-32 0z" fill="#B07E2E" stroke="#6E4610" stroke-width="1.8" stroke-linejoin="round"/>
    <rect x="24" y="26" width="16" height="10" rx="2" fill="none" stroke="#ECC26A" stroke-width="1.5"/>
    <path d="M16 44q16-5 32 0v4q-16-5-32 0z" fill="#F4EADA" stroke="#6E4610" stroke-width="1.4"/>`,
  moralvs: `<path d="M20 26q-6-8 0-11 4-2 7 1 3-3 7-1 6 3 0 11l-7 6z" fill="#E8746A" stroke="#B84434" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="36" y="34" width="16" height="20" rx="2.6" fill="#FFF" stroke="#8C5A16" stroke-width="1.7"/>
    <path d="M40 41h8M40 46h6" stroke="#C8A360" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M30 46h4" stroke="#5A6478" stroke-width="1.8" stroke-linecap="round"/>`,
  force: `<rect x="18" y="14" width="28" height="36" rx="4" fill="#FFF" stroke="#8C5A16" stroke-width="1.8"/>
    <path d="M24 24h16M24 30h16M24 36h10" stroke="#C8A360" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="44" cy="46" r="9" fill="#8C5A16"/>
    <path d="M40 46l2.8 3 4.6-5.6" stroke="#FFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  // L2
  justice: `<path d="M32 14v30" stroke="#6E4610" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M14 20h36" stroke="#6E4610" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M14 20v5M8 25h12m-12 0q0 6 6 6t6-6" fill="none" stroke="#6E4610" stroke-width="1.6"/>
    <path d="M50 20v5M44 25h12m-12 0q0 6 6 6t6-6" fill="none" stroke="#6E4610" stroke-width="1.6"/>
    <path d="M8 25q0 6 6 6t6-6zM44 25q0 6 6 6t6-6z" fill="#ECC26A"/>
    <rect x="22" y="44" width="20" height="6" rx="3" fill="#8C5A16"/>`,
  samediff: `<rect x="12" y="18" width="16" height="16" rx="3" fill="#ECC26A" stroke="#8A6034" stroke-width="1.5"/>
    <rect x="36" y="18" width="16" height="16" rx="3" fill="#ECC26A" stroke="#8A6034" stroke-width="1.5"/>
    <path d="M28 44h8M32 40v8" stroke="#5A6478" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M14 52h14M40 48h12v8" stroke="#8C5A16" stroke-width="1.8" stroke-linecap="round" fill="none"/>`,
  func3: `<path d="M32 10l14 5v10q0 12-14 19-14-7-14-19V15z" fill="#EADFC8" stroke="#8C5A16" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M26 26l4.6 4.8 8-9.6" stroke="#8C5A16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M16 52q8 5 16 0M32 52q8 5 16 0" stroke="#C8A360" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  // L3
  pubzone: `<path d="M32 12L14 24h36z" fill="#EFE7D6" stroke="#8A93A6" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="18" y="26" width="6" height="18" rx="1.6" fill="#EFE7D6" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="29" y="26" width="6" height="18" rx="1.6" fill="#EFE7D6" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="40" y="26" width="6" height="18" rx="1.6" fill="#EFE7D6" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="12" y="44" width="40" height="6" rx="2.4" fill="#C8B896" stroke="#8A93A6" stroke-width="1.2"/>`,
  privzone: `<path d="M14 34l12-10 12 10v14H14z" fill="#FFF" stroke="#B8926A" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="22" y="38" width="8" height="10" rx="1.6" fill="#E0D4BC" stroke="#B8926A" stroke-width="1.1"/>
    <rect x="38" y="32" width="16" height="16" rx="2" fill="#FFF" stroke="#B8926A" stroke-width="1.5"/>
    <path d="M36 32h20l-2-6H38z" fill="#ECC26A" stroke="#8A6034" stroke-width="1.2"/>`,
  lawmap: `<path d="M32 12v40" stroke="#8C5A16" stroke-width="1.8" stroke-dasharray="4 4"/>
    <rect x="8" y="20" width="20" height="14" rx="3" fill="#D8E6F5" stroke="#2E6AC0" stroke-width="1.5"/>
    <rect x="36" y="20" width="20" height="14" rx="3" fill="#FBEED6" stroke="#C0871C" stroke-width="1.5"/>
    <path d="M14 42h8M40 42h12" stroke="#8A93A6" stroke-width="1.6" stroke-linecap="round"/>`,
  // L4
  umbrella: `<path d="M32 16q-20 0-24 16 3-4 8-3 0-5 8-5 2-4 8-3 6-1 8 3 8 0 8 5 5-1 8 3-4-16-24-16z" fill="#8C5A16" stroke="#5A3A0C" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M32 32v16q0 5-5 5" stroke="#6E4610" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="22" cy="46" r="4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.4"/>
    <circle cx="42" cy="46" r="4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.4"/>`,
  labor: `<rect x="14" y="30" width="36" height="20" rx="4" fill="#EFE7D6" stroke="#A89878" stroke-width="1.5"/>
    <path d="M20 30v-6q12-8 24 0v6" fill="none" stroke="#8C5A16" stroke-width="1.8"/>
    <path d="M22 40h20M22 45h12" stroke="#B8A888" stroke-width="1.5" stroke-linecap="round"/>`,
  econlaw: `<path d="M14 40h16l2-10h-20zM34 40h16l2-10h-20z" fill="#ECC26A" stroke="#8A6034" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M20 26q4-7 9 0M40 26q4-7 9 0" stroke="#8A6034" stroke-width="1.4" fill="none"/>
    <path d="M26 50h12" stroke="#5A6478" stroke-width="1.8" stroke-linecap="round"/>`,
  welfare: `<path d="M32 46q-14-9 0-19 5-4 9 0 4-4 9 0 8 7-4 15" fill="none" stroke="#B84434" stroke-width="0"/>
    <path d="M22 40q-8-9 0-14 5-3 10 1 5-4 10-1 8 5 0 14l-10 8z" fill="#E8746A" stroke="#B84434" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M44 20l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#F2C24E"/>`,
  // L5
  court: `<rect x="14" y="40" width="28" height="6" rx="3" fill="#A87838" stroke="#6E4E26" stroke-width="1.4"/>
    <g transform="rotate(-30 34 26)">
      <rect x="24" y="20" width="20" height="10" rx="3.4" fill="#C89A5E" stroke="#6E4E26" stroke-width="1.6"/>
      <rect x="32" y="30" width="4" height="16" rx="2" fill="#8A6034"/>
    </g>`,
  civiltrk: `<circle cx="18" cy="24" r="5.4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.6"/>
    <circle cx="46" cy="24" r="5.4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.6"/>
    <path d="M18 29v9M46 29v9" stroke="#3C4654" stroke-width="1.6" stroke-linecap="round"/>
    <rect x="24" y="42" width="16" height="12" rx="2.4" fill="#FFF" stroke="#2E6AC0" stroke-width="1.6"/>
    <path d="M28 47h8M28 50h5" stroke="#8FB2DC" stroke-width="1.3" stroke-linecap="round"/>`,
  crimtrk: `<circle cx="24" cy="30" r="8" fill="none" stroke="#39455C" stroke-width="2"/>
    <path d="M30 36l8 8" stroke="#39455C" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="38" y="18" width="16" height="20" rx="2.6" fill="#FFF" stroke="#8A5EC0" stroke-width="1.6"/>
    <path d="M42 24h8M42 29h6" stroke="#B49ADC" stroke-width="1.4" stroke-linecap="round"/>`,
  // L6
  indep: `<rect x="26" y="26" width="12" height="10" rx="2.4" fill="#C89A5E" stroke="#6E4E26" stroke-width="1.4"/>
    <circle cx="32" cy="18" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <rect x="12" y="16" width="5" height="30" rx="2.4" fill="#8C5A16"/>
    <rect x="47" y="16" width="5" height="30" rx="2.4" fill="#8C5A16"/>
    <path d="M4 22h5M55 22h5M4 34h5M55 34h5" stroke="#C0392E" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="1 4"/>`,
  openc: `<rect x="12" y="14" width="40" height="30" rx="4" fill="none" stroke="#8A93A6" stroke-width="1.6"/>
    <path d="M14 16q6 12 0 26M50 16q-6 12 0 26" stroke="#5A6B86" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="26" cy="52" r="3.6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.3"/>
    <circle cx="38" cy="52" r="3.6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.3"/>
    <circle cx="32" cy="28" r="4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.3"/>`,
  evid: `<circle cx="26" cy="26" r="10" fill="none" stroke="#39455C" stroke-width="2.2"/>
    <path d="M34 34l10 10" stroke="#39455C" stroke-width="2.6" stroke-linecap="round"/>
    <rect x="38" y="14" width="14" height="18" rx="2.4" fill="#FFF" stroke="#8C5A16" stroke-width="1.5"/>
    <circle cx="45" cy="48" r="6" fill="#8C5A16"/>
    <path d="M42.4 48l1.8 2 3.2-3.8" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  ladder3: `<rect x="8" y="42" width="18" height="12" rx="2.4" fill="#E8CFA0" stroke="#8A6034" stroke-width="1.4"/>
    <rect x="24" y="30" width="18" height="24" rx="2.4" fill="#D8B476" stroke="#8A6034" stroke-width="1.4"/>
    <rect x="40" y="18" width="18" height="36" rx="2.4" fill="#C89A4E" stroke="#8A6034" stroke-width="1.4"/>
    <path d="M14 36l12-8M30 24l12-8" stroke="#8C5A16" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 3"/>`,
  // L7
  appeal: `<rect x="10" y="40" width="20" height="14" rx="3" fill="#B07E2E" stroke="#6E4610" stroke-width="1.5"/>
    <rect x="34" y="16" width="20" height="14" rx="3" fill="#8C5A16" stroke="#5A3A0C" stroke-width="1.5"/>
    <path d="M28 38q8-8 12-10" stroke="#8C5A16" stroke-width="2.2" fill="none" stroke-dasharray="4 3"/>
    <path d="M36 26l6 1-4 5" fill="none" stroke="#8C5A16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  supreme: `<path d="M32 10L12 22h40z" fill="#EFE7D6" stroke="#8A93A6" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="16" y="24" width="7" height="18" rx="1.8" fill="#EFE7D6" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="28.5" y="24" width="7" height="18" rx="1.8" fill="#EFE7D6" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="41" y="24" width="7" height="18" rx="1.8" fill="#EFE7D6" stroke="#8A93A6" stroke-width="1.1"/>
    <rect x="12" y="42" width="40" height="6" rx="2.4" fill="#C8B896" stroke="#8A93A6" stroke-width="1.2"/>
    <path d="M28 14l2 3 3.6-2-1.4 4" stroke="#E2A020" stroke-width="0" fill="none"/>
    <circle cx="32" cy="17" r="2" fill="#E2B45E"/>`,
  finalstamp: `<rect x="16" y="14" width="26" height="32" rx="3" fill="#FFF" stroke="#8A93A6" stroke-width="1.6"/>
    <path d="M22 22h14M22 28h14M22 34h9" stroke="#B8C2CE" stroke-width="1.4" stroke-linecap="round"/>
    <g transform="rotate(-12 44 42)"><circle cx="44" cy="42" r="9" fill="none" stroke="#8C5A16" stroke-width="2"/><path d="M39.6 42l2.8 3 5-6" stroke="#8C5A16" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`,
  nextdoor: `<rect x="18" y="14" width="28" height="38" rx="3.4" fill="#EADFC8" stroke="#8C5A16" stroke-width="1.8"/>
    <circle cx="40" cy="34" r="2.2" fill="#6E4610"/>
    <path d="M24 8l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#F2C24E"/>
    <path d="M50 22q6 4 0 8" stroke="#C8A360" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
};

/** recap 카드 미니아트 — 64×64 플랫(soc 관례) */
export function soc11MiniArt(key: string): string {
  const body = MA[key] ?? `<circle cx="32" cy="32" r="16" fill="#F4EADA" stroke="#8C5A16" stroke-width="2"/>`;
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">${body}</svg>`;
}
