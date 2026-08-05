// socFigures8 — 사회 Ⅷ(다양한 문화의 이해) 그림 모듈. socFigures7 문법 계승 —
// 개념 도해(벡터)+스틱맨 장면, 파운드리 문법 준수, 스틱맨만 손그림 라인.
//   · 퀴즈 그림 라벨은 (가)(나)식 중립 라벨만 — 정답 유출 금지(aria에도 개념 이름 대신 묘사만).
//   · 민감 가드: 무성별 스틱맨, 특정 문화 희화화 금지 — 태도 그림은 깃발·말풍선 같은 추상 소품만.
const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

function shell(vw: number, vh: number, inner: string, aria: string, defs = ""): string {
  return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${aria}">
    <defs>
      <linearGradient id="s8-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#EEF2F8"/></linearGradient>
      ${defs}
    </defs>
    <rect x="2" y="2" width="${vw - 4}" height="${vh - 4}" rx="14" fill="url(#s8-paper)" stroke="#D3DCE8" stroke-width="1.6"/>
    ${inner}
  </svg>`;
}

/** (가)(나) 라벨 필 */
function pill(x: number, y: number, label: string): string {
  return `<rect x="${x - 17}" y="${y - 11}" width="34" height="19" rx="9.5" fill="#39455C"/>
    <text x="${x}" y="${y + 3}" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">${label}</text>`;
}

/* ---------- L1: '문화'의 두 가지 뜻(가/나 판별) ---------- */
export function cultMeanFig(): string {
  const inner = `
    <line x1="150" y1="14" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 26, "(가)")}
    ${pill(224, 26, "(나)")}
    <!-- (가) 살아가는 방식 전체: 밥상·집·인사 -->
    <ellipse cx="48" cy="70" rx="17" ry="5.4" fill="#EDE0C8" stroke="#B8A278" stroke-width="1.3"/>
    <path d="M40 66q4-2.4 8-1M50 66q3-1 6 1" stroke="#C9B98E" stroke-width="1.3" fill="none"/>
    <path d="M64 54l3-6M68 54l3-6" stroke="#8A93A6" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M92 76 L106 64 L120 76 M96 76v14h20V76" stroke="#8A93A6" stroke-width="2" fill="none" stroke-linejoin="round"/>
    ${(() => {
      const x = 62;
      return `<g ${STICK}><circle cx="${x}" cy="104" r="6.4" fill="#F6EFE4"/><path d="M${x} 110q1 7-3 11l-3 5M${x} 110q0 8 2 13M${x - 1} 122l-4 10M${x + 1} 123l3 10M${x - 1} 116l-8 3M${x} 114l10 4"/></g>`;
    })()}
    ${(() => {
      const x = 96;
      return `<g ${STICK}><circle cx="${x}" cy="106" r="6.4" fill="#F6EFE4"/><path d="M${x} 112v16M${x} 128l-5 10M${x} 128l5 10M${x} 118l-8 5M${x} 118l8 5"/></g>`;
    })()}
    <text x="76" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">밥상 · 집 · 인사 — 살아가는 방식</text>
    <!-- (나) 예술·교양: 무대와 음표 -->
    <rect x="186" y="66" width="76" height="44" rx="6" fill="#F3E9FA" stroke="#B98CD0" stroke-width="1.4"/>
    <path d="M186 66q38 12 76 0" stroke="#B98CD0" stroke-width="1.2" fill="none" opacity=".7"/>
    <path d="M206 96v-16q0-3 3-3l8-2v16" stroke="#6E2E86" stroke-width="2" fill="none"/>
    <circle cx="203" cy="97" r="3.4" fill="#6E2E86"/><circle cx="214" cy="93" r="3.4" fill="#6E2E86"/>
    <path d="M232 84l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="#F2C24E"/>
    <text x="224" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">공연 · 예술 — 세련되고 교양 있는 것</text>`;
  return shell(300, 158, inner, "두 장면 비교 — 왼쪽은 밥상과 집과 인사 등 생활 전체, 오른쪽은 공연 무대와 음표");
}

/* ---------- L2: 하나의 지붕, 두 개의 결혼식(보편성·특수성) ---------- */
export function univSpecFig(): string {
  const inner = `
    <path d="M28 54 Q150 6 272 54" stroke="#C13B2E" stroke-width="2.6" fill="none" stroke-dasharray="7 6"/>
    <rect x="112" y="16" width="76" height="20" rx="10" fill="#FDECE6" stroke="#E8A28E" stroke-width="1.3"/>
    <text x="150" y="30" text-anchor="middle" font-size="10.5" font-weight="800" fill="#A22F24">어느 사회에나 결혼식</text>
    <line x1="150" y1="44" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 56, "(가)")}
    ${pill(224, 56, "(나)")}
    <!-- (가) 전통 혼례: 상 위 표주박, 한 쌍의 절 -->
    <ellipse cx="76" cy="106" rx="30" ry="6" fill="#EDE0C8" stroke="#B8A278" stroke-width="1.3"/>
    <path d="M70 98q3-4 6 0M80 98q3-4 6 0" stroke="#C05621" stroke-width="1.8" fill="none"/>
    <g ${STICK}><circle cx="52" cy="80" r="6" fill="#F6EFE4"/><path d="M52 86q4 5 10 6M52 86q1 8 0 12M52 98l-4 9M52 98l5 9"/></g>
    <g ${STICK}><circle cx="100" cy="80" r="6" fill="#F6EFE4"/><path d="M100 86q-4 5-10 6M100 86q-1 8 0 12M100 98l-4 9M100 98l5 9"/></g>
    <text x="76" y="146" text-anchor="middle" font-size="9.6" fill="#7E8AA0">마주 서서 절을 올려요</text>
    <!-- (나) 서양식: 케이크와 손잡기 -->
    <g stroke="#B98CD0" stroke-width="1.4">
      <rect x="208" y="96" width="32" height="12" rx="3" fill="#F7EFFB"/>
      <rect x="214" y="86" width="20" height="10" rx="3" fill="#F3E9FA"/>
      <path d="M224 82v4" stroke-width="1.8"/><circle cx="224" cy="80" r="2" fill="#F2C24E" stroke="none"/>
    </g>
    <g ${STICK}><circle cx="196" cy="72" r="6" fill="#F6EFE4"/><path d="M196 78v14M196 92l-5 10M196 92l5 10M196 82l8 4"/></g>
    <g ${STICK}><circle cx="252" cy="72" r="6" fill="#F6EFE4"/><path d="M252 78v14M252 92l-5 10M252 92l5 10M252 82l-8 4"/></g>
    <path d="M204 86q10 2 20 0" stroke="#8A93A6" stroke-width="1.2" opacity=".0"/>
    <text x="224" y="146" text-anchor="middle" font-size="9.6" fill="#7E8AA0">케이크를 자르며 축하해요</text>`;
  return shell(300, 158, inner, "하나의 큰 지붕 아래 서로 다른 두 결혼식 장면 — 전통 혼례와 케이크가 있는 예식");
}

/* ---------- L3: 공중전화 → 스마트폰(속성 판별 그림) ---------- */
export function phoneShiftFig(): string {
  const inner = `
    ${pill(70, 26, "(가)")}
    ${pill(230, 26, "(나)")}
    <!-- (가) 공중전화 부스 -->
    <rect x="46" y="42" width="48" height="88" rx="6" fill="#FBE8E4" stroke="#C05621" stroke-width="1.8"/>
    <rect x="54" y="54" width="32" height="34" rx="4" fill="#FFF6F2" stroke="#C05621" stroke-width="1.3"/>
    <rect x="62" y="96" width="16" height="22" rx="3" fill="#F2C4B4" stroke="#C05621" stroke-width="1.2"/>
    <path d="M66 60q-4 6 0 12l4-3q-2-3 0-6z" fill="#C05621"/>
    <ellipse cx="70" cy="136" rx="26" ry="3" fill="#2A3A5E" opacity=".08"/>
    <!-- 화살표 -->
    <path d="M118 88h56" stroke="#8FA2BC" stroke-width="3" stroke-linecap="round"/>
    <path d="M166 80l12 8-12 8" stroke="#8FA2BC" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="146" y="76" text-anchor="middle" font-size="10" font-weight="700" fill="#7E8AA0">시간이 흐르며</text>
    <!-- (나) 스마트폰 -->
    <rect x="206" y="46" width="48" height="84" rx="10" fill="#3E4A5E" stroke="#283242" stroke-width="1.8"/>
    <rect x="212" y="54" width="36" height="62" rx="5" fill="#BFD8EE"/>
    <circle cx="230" cy="123" r="3" fill="#8A93A6"/>
    <path d="M220 66h20M220 76h20M220 86h13" stroke="#7EA6C8" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="230" cy="136" rx="26" ry="3" fill="#2A3A5E" opacity=".08"/>
    <text x="150" y="150" text-anchor="middle" font-size="9.8" fill="#7E8AA0">거리의 (가)는 줄고, 손안의 (나)가 자리를 대신했어요</text>`;
  return shell(300, 158, inner, "공중전화 부스에서 스마트폰으로 바뀌어 가는 모습을 나타낸 화살표 그림");
}

/* ---------- L4: 일방향(가) vs 쌍방향(나) 미디어 흐름 ---------- */
export function mediaFlowFig(): string {
  const dot = (x: number, y: number, c = "#5FA8E8"): string => `<circle cx="${x}" cy="${y}" r="6.4" fill="${c}" stroke="#2E6EA8" stroke-width="1.4"/>`;
  const inner = `
    <line x1="150" y1="14" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 26, "(가)")}
    ${pill(224, 26, "(나)")}
    <!-- (가) 하나 → 여럿(한 방향) -->
    <path d="M62 56l14-14 14 14M76 42v18" stroke="#C0392E" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="66" y="60" width="20" height="14" rx="3" fill="#FDECE6" stroke="#C0392E" stroke-width="1.6"/>
    ${dot(40, 116)}${dot(76, 124)}${dot(112, 116)}
    <g stroke="#8FA2BC" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M68 80 L46 106"/><path d="M49 100l-3 6 6 1"/>
      <path d="M76 80 L76 112"/><path d="M72 106l4 6 4-6"/>
      <path d="M84 80 L106 106"/><path d="M100 107l6 1-3-7"/>
    </g>
    <text x="76" y="146" text-anchor="middle" font-size="9.8" fill="#7E8AA0">만드는 쪽 → 받는 쪽, 한 방향</text>
    <!-- (나) 여럿 ↔ 여럿(그물) -->
    ${dot(196, 62, "#7FBE92")}${dot(252, 62, "#7FBE92")}${dot(196, 116, "#7FBE92")}${dot(252, 116, "#7FBE92")}${dot(224, 89, "#F2C24E")}
    <g stroke="#8FA2BC" stroke-width="1.8" fill="none" stroke-linecap="round">
      <path d="M203 68l14 14M245 68l-14 14M203 110l14-14M245 110l-14-14M204 62h40M204 116h40M196 70v38M252 70v38"/>
    </g>
    <g fill="#5A7A9E">
      <path d="M216 60l-6 2 6 2zM232 64l6-2-6-2zM216 118l-6-2 6-2zM232 114l6 2-6 2z"/>
    </g>
    <text x="224" y="146" text-anchor="middle" font-size="9.8" fill="#7E8AA0">누구나 만들고 주고받는 그물</text>`;
  return shell(300, 158, inner, "두 미디어 흐름 비교 — 왼쪽은 방송탑에서 여러 사람으로 한 방향 화살표, 오른쪽은 사람들끼리 얽힌 양방향 그물");
}

/* ---------- L5: 기사처럼 생긴 화면(구석의 작은 표시) ---------- */
export function adNewsFig(): string {
  const inner = `
    <rect x="36" y="18" width="228" height="124" rx="10" fill="#FFFFFF" stroke="#C4CDD8" stroke-width="1.6"/>
    <rect x="48" y="30" width="120" height="10" rx="5" fill="#39455C"/>
    <rect x="48" y="46" width="90" height="7" rx="3.5" fill="#C4CDD8"/>
    <rect x="222" y="28" width="32" height="15" rx="7.5" fill="#FFF3CC" stroke="#E2C26E" stroke-width="1.2"/>
    <text x="238" y="39" text-anchor="middle" font-size="9" font-weight="800" fill="#9A7A1E">광고</text>
    <rect x="48" y="62" width="128" height="52" rx="6" fill="#EAF2FA" stroke="#B9CCE0" stroke-width="1.2"/>
    <path d="M60 104l16-18 12 12 10-8 18 14z" fill="#9EC0DE"/>
    <circle cx="118" cy="76" r="6" fill="#F2C24E"/>
    <g fill="#DCE3EC"><rect x="188" y="62" width="64" height="7" rx="3.5"/><rect x="188" y="74" width="64" height="7" rx="3.5"/><rect x="188" y="86" width="46" height="7" rx="3.5"/></g>
    <rect x="188" y="100" width="64" height="20" rx="10" fill="#3182F6"/>
    <text x="220" y="114" text-anchor="middle" font-size="10" font-weight="800" fill="#FFFFFF">바로 구매</text>
    <text x="150" y="152" text-anchor="middle" font-size="9.8" fill="#7E8AA0">기사처럼 보이는 화면 — 구석의 작은 표시를 찾았나요?</text>`;
  return shell(300, 160, inner, "신문 기사처럼 생긴 화면 — 오른쪽 위에 작은 광고 표시, 아래에 구매 버튼");
}

/* ---------- L7: 두 개의 저울 없는 태도(가/나 — 깃발 은유) ---------- */
export function attitudeFig(): string {
  const flag = (x: number, y: number, h: number, c: string, cd: string): string => `
    <path d="M${x} ${y}v${h}" stroke="#6E4A26" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M${x} ${y}h20l-5 6 5 6h-20z" fill="${c}" stroke="${cd}" stroke-width="1.3"/>`;
  const inner = `
    <line x1="150" y1="14" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 26, "(가)")}
    ${pill(224, 26, "(나)")}
    <!-- (가) 내 깃발만 높이, 남의 깃발 내려봄 -->
    ${flag(48, 46, 66, "#C13B2E", "#8E2318")}
    ${flag(104, 92, 26, "#8FA2BC", "#5A7A9E")}
    <g ${STICK}><circle cx="72" cy="84" r="6.4" fill="#F6EFE4"/><path d="M72 90v16M72 106l-5 11M72 106l5 11M72 95l-11-6M72 95l9 7"/></g>
    <circle cx="70" cy="83" r="1" fill="#3C4654"/><circle cx="74.4" cy="83" r="1" fill="#3C4654"/>
    <path d="M70.4 87.4q1.8-1.2 3.6 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>
    <text x="76" y="146" text-anchor="middle" font-size="9.8" fill="#7E8AA0">내 것만 높이고 남의 것은 낮춰 봐요</text>
    <!-- (나) 남의 깃발을 우러러보고 내 깃발을 떨어뜨림 -->
    ${flag(252, 46, 66, "#8FA2BC", "#5A7A9E")}
    <g transform="rotate(24 206 116)">${flag(206, 106, 20, "#C13B2E", "#8E2318")}</g>
    <g ${STICK}><circle cx="228" cy="84" r="6.4" fill="#F6EFE4"/><path d="M228 90v16M228 106l-5 11M228 106l5 11M228 95l11-7M228 95l-8 6"/></g>
    <path d="M226 81.6q1.4-1.6 2.8 0M230.4 81.6q1.4-1.6 2.8 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>
    <text x="224" y="146" text-anchor="middle" font-size="9.8" fill="#7E8AA0">남의 것만 우러러보고 내 것을 버려요</text>`;
  return shell(300, 158, inner, "깃발을 든 두 장면 — 왼쪽은 자기 깃발만 높이 들고, 오른쪽은 남의 깃발을 우러러보며 자기 깃발을 떨어뜨린 모습");
}

/* ---------- recap 미니아트(64×64 플랫 — 전 카드 필수) ---------- */
const M = (body: string): string =>
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

export function soc8MiniArt(key: string): string {
  switch (key) {
    /* ── L1 문화의 의미 ── */
    case "wideculture": // 생활양식 전체 — 밥그릇·집·말풍선이 든 큰 원
      return M(
        `<circle cx="32" cy="32" r="24" fill="#FDECE6" stroke="#C13B2E" stroke-width="2.4"/>
        <path d="M20 38q0 6 8 6t8-6z" fill="#C13B2E" opacity=".8"/>
        <path d="M36 22l5-4 5 4v7h-10z" fill="none" stroke="#A22F24" stroke-width="2"/>
        <rect x="18" y="20" width="12" height="8" rx="4" fill="#E8A28E"/>`,
      );
    case "narrowculture": // 예술·교양 — 무대 커튼과 음표
      return M(
        `<path d="M10 14h44v10q-22 8-44 0z" fill="#B98CD0"/>
        <path d="M14 24q4 22 4 26M50 24q-4 22-4 26" stroke="#8E5EAE" stroke-width="2.4" fill="none"/>
        <path d="M30 48V30q0-3 3-3l7-2v17" stroke="#6E2E86" stroke-width="2.4" fill="none"/>
        <circle cx="27" cy="49" r="4" fill="#6E2E86"/><circle cx="37" cy="43" r="4" fill="#6E2E86"/>`,
      );
    case "notculture": // 문화 아닌 것 거르기 — 체와 알갱이
      return M(
        `<path d="M12 24h40l-6 14H18z" fill="#F2F5F9" stroke="#8A93A6" stroke-width="2.2"/>
        <path d="M20 28h24M22 33h20" stroke="#B9C2D0" stroke-width="1.6" stroke-dasharray="3 3"/>
        <circle cx="26" cy="48" r="3" fill="#C0871C"/><circle cx="34" cy="52" r="2.6" fill="#8A93A6"/><circle cx="41" cy="47" r="2.4" fill="#C0871C"/>
        <path d="M24 12l2 5M32 10v6M40 12l-2 5" stroke="#C13B2E" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    /* ── L2 보편성·특수성 ── */
    case "univroof": // 하나의 지붕 아래 세 집
      return M(
        `<path d="M8 26 Q32 8 56 26" stroke="#C13B2E" stroke-width="2.6" fill="none" stroke-dasharray="5 4"/>
        <path d="M12 40a8 8 0 0 1 16 0z" fill="#DCE6F0" stroke="#8A93A6" stroke-width="1.8"/>
        <path d="M26 40l6-8 6 8v8H26z" fill="#F2C4B4" stroke="#C05621" stroke-width="1.8"/>
        <path d="M44 34h12l-2 14h-8z" fill="#CBE3D2" stroke="#4E9E5E" stroke-width="1.8"/>`,
      );
    case "specdance": // 서로 다른 춤 동작 셋
      return M(
        `<g stroke="#C13B2E" stroke-width="2.4" stroke-linecap="round" fill="none">
          <circle cx="14" cy="18" r="5" fill="#F6EFE4"/><path d="M14 23q-2 8 -6 10M14 23q3 7 8 8M12 33l-3 12M17 32l2 12"/>
        </g>
        <g stroke="#C0871C" stroke-width="2.4" stroke-linecap="round" fill="none">
          <circle cx="34" cy="16" r="5" fill="#F6EFE4"/><path d="M34 21v12M34 25l-7-4M34 25l7-4M34 33l-5 11M34 33l5 11"/>
        </g>
        <g stroke="#2E8AC0" stroke-width="2.4" stroke-linecap="round" fill="none">
          <circle cx="52" cy="18" r="5" fill="#F6EFE4"/><path d="M52 23q2 8 6 10M52 23q-3 7-8 8M54 33l3 12M49 32l-2 12"/>
        </g>`,
      );
    case "envshape": // 환경이 문화를 빚는다 — 해·눈이 그릇을 다르게
      return M(
        `<circle cx="18" cy="14" r="7" fill="#F2C24E"/>
        <path d="M40 10l2 4M48 12l-2 4M44 8v5" stroke="#7EB8E8" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 40q0 8 10 8t10-8z" fill="#E8A28E" stroke="#C05621" stroke-width="1.8"/>
        <path d="M34 40q0 8 10 8t10-8z" fill="#BFD8EE" stroke="#2E6EA8" stroke-width="1.8"/>
        <path d="M8 56h48" stroke="#B9C2D0" stroke-width="2" stroke-linecap="round"/>`,
      );
    /* ── L3 문화의 속성 ── */
    case "sharesoup": // 공유성 — 한 냄비 두 숟가락
      return M(
        `<path d="M14 30h36l-3 14q-1 6-8 6H25q-7 0-8-6z" fill="#4E4038" stroke="#2E241E" stroke-width="2"/>
        <ellipse cx="32" cy="30" rx="18" ry="5" fill="#E8543E" stroke="#8E2318" stroke-width="1.6"/>
        <path d="M22 22l-6-10M42 22l6-10" stroke="#8A6A3E" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="15" cy="10" rx="4" ry="2.4" fill="#EDE0C8" stroke="#8A6A3E" stroke-width="1.3"/>
        <ellipse cx="49" cy="10" rx="4" ry="2.4" fill="#EDE0C8" stroke="#8A6A3E" stroke-width="1.3"/>`,
      );
    case "learnhands": // 학습성 — 큰 손이 작은 손에게
      return M(
        `<path d="M8 22q10-8 20-4" stroke="#C0871C" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M56 44q-10 8-20 4" stroke="#862E9C" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M26 16l6 4-2 7" stroke="#C0871C" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <path d="M38 48l-6-4 2-7" stroke="#862E9C" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <path d="M28 28q4-3 8 0l-1 8q-3 2-6 0z" fill="#DDEBB8" stroke="#7A9646" stroke-width="1.8"/>`,
      );
    case "stackbook": // 축적성 — 층층이 쌓인 레시피
      return M(
        `<rect x="12" y="42" width="40" height="9" rx="3" fill="#EDE0C8" stroke="#B8A278" stroke-width="1.6"/>
        <rect x="14" y="31" width="36" height="9" rx="3" fill="#F2B09E" stroke="#C2664E" stroke-width="1.6"/>
        <rect x="16" y="20" width="32" height="9" rx="3" fill="#E8C87E" stroke="#B8923E" stroke-width="1.6"/>
        <path d="M30 10l2 4.4 4.4 2-4.4 2-2 4.4-2-4.4-4.4-2 4.4-2z" fill="#C13B2E"/>`,
      );
    case "whitered": // 변동성 — 하양에서 빨강으로
      return M(
        `<path d="M8 32q4-10 14-8 6-6 12 0-2 10-12 12-10-1-14-4z" fill="#FDFAF2" stroke="#B8A87E" stroke-width="1.8" transform="translate(0 -4)"/>
        <path d="M30 44h8" stroke="#8FA2BC" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M35 40l5 4-5 4" stroke="#8FA2BC" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M38 52q4-10 14-8 6-6 12 0-2 10-12 12-10-1-14-4z" fill="#E8543E" stroke="#8E2318" stroke-width="1.8" transform="translate(-4 -10)"/>`,
      );
    case "webwhole": // 전체성 — 연결망
      return M(
        `<circle cx="32" cy="32" r="9" fill="#E8543E" stroke="#8E2318" stroke-width="1.8"/>
        <circle cx="12" cy="14" r="5.4" fill="#FDECE6" stroke="#C13B2E" stroke-width="1.8"/>
        <circle cx="52" cy="14" r="5.4" fill="#FDECE6" stroke="#C13B2E" stroke-width="1.8"/>
        <circle cx="12" cy="52" r="5.4" fill="#FDECE6" stroke="#C13B2E" stroke-width="1.8"/>
        <circle cx="52" cy="52" r="5.4" fill="#FDECE6" stroke="#C13B2E" stroke-width="1.8"/>
        <path d="M17 18l9 8M47 18l-9 8M17 48l9-8M47 48l-9-8" stroke="#C13B2E" stroke-width="2"/>`,
      );
    /* ── L4 미디어 ── */
    case "bridge": // 매개물 — 두 절벽을 잇는 다리
      return M(
        `<path d="M6 44V24M58 44V24" stroke="#8A93A6" stroke-width="3" stroke-linecap="round"/>
        <path d="M6 30q26-14 52 0" stroke="#2E8AC0" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M16 27v10M32 23v14M48 27v10" stroke="#5FA8E8" stroke-width="2"/>
        <circle cx="12" cy="52" r="4.6" fill="#F2C24E"/><circle cx="52" cy="52" r="4.6" fill="#7FBE92"/>`,
      );
    case "twoway": // 생산자=소비자 — 맞물린 두 화살표
      return M(
        `<path d="M14 26h30l-6-8" stroke="#C13B2E" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M50 38H20l6 8" stroke="#2E8AC0" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="10" cy="26" r="5" fill="#F2C24E"/><circle cx="54" cy="38" r="5" fill="#7FBE92"/>`,
      );
    case "mediaday": // 하루를 채운 미디어 — 시계와 화면들
      return M(
        `<circle cx="24" cy="28" r="14" fill="#FFF" stroke="#8A93A6" stroke-width="2.2"/>
        <path d="M24 20v8l6 4" stroke="#39455C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <rect x="40" y="14" width="16" height="11" rx="2.5" fill="#BFD8EE" stroke="#2E6EA8" stroke-width="1.6"/>
        <rect x="42" y="32" width="12" height="20" rx="3" fill="#3E4A5E" stroke="#283242" stroke-width="1.6"/>
        <rect x="44" y="35" width="8" height="12" rx="1.5" fill="#BFD8EE"/>
        <path d="M12 48q8 6 18 4" stroke="#C4CDD8" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      );
    /* ── L5 미디어 리터러시 ── */
    case "fourlens": // 네 개의 돋보기
      return M(
        `<g stroke="#C13B2E" stroke-width="2.4" fill="#FDF6F3">
          <circle cx="18" cy="18" r="8"/><circle cx="46" cy="18" r="8"/><circle cx="18" cy="46" r="8"/><circle cx="46" cy="46" r="8"/>
        </g>
        <path d="M24 24l6 6M52 24l-6 6M24 40l6-6M52 40l-6-6" stroke="#8E2318" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "stampfake": // 도장 — 사각 테와 빗금
      return M(
        `<rect x="10" y="18" width="44" height="28" rx="6" fill="none" stroke="#C0392E" stroke-width="3" transform="rotate(-8 32 32)"/>
        <path d="M18 32h28M22 26h20M22 38h20" stroke="#C0392E" stroke-width="2.4" stroke-linecap="round" transform="rotate(-8 32 32)" opacity=".8"/>`,
      );
    case "sharestop": // 공유 전 멈춤 — 화살표와 손바닥
      return M(
        `<path d="M8 32h24" stroke="#8FA2BC" stroke-width="3" stroke-linecap="round"/>
        <path d="M26 26l8 6-8 6" stroke="#8FA2BC" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M42 20v22q0 6 6 6t6-6V26M46 18v20M50 16v22M54 20v18" stroke="#C0871C" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
      );
    /* ── L6 다문화 사회 ── */
    case "threedoors": // 세 개의 문, 하나의 마당
      return M(
        `<rect x="8" y="16" width="14" height="24" rx="2.5" fill="#F2C4B4" stroke="#C05621" stroke-width="1.8"/>
        <rect x="25" y="16" width="14" height="24" rx="2.5" fill="#CBE3D2" stroke="#4E9E5E" stroke-width="1.8"/>
        <rect x="42" y="16" width="14" height="24" rx="2.5" fill="#BFD8EE" stroke="#2E6EA8" stroke-width="1.8"/>
        <ellipse cx="32" cy="50" rx="22" ry="6" fill="#FDECE6" stroke="#E8A28E" stroke-width="1.8"/>`,
      );
    case "onetable": // 모두의 한 상
      return M(
        `<ellipse cx="32" cy="34" rx="22" ry="8" fill="#EDE0C8" stroke="#B8A278" stroke-width="2"/>
        <circle cx="22" cy="32" r="4" fill="#7A9646"/><circle cx="32" cy="30" r="4" fill="#E8543E"/><circle cx="42" cy="32" r="4" fill="#F2C24E"/>
        <path d="M14 48q4-5 9-5M50 48q-4-5-9-5M32 52v-6" stroke="#3C4654" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    case "newyear": // 서로 다른 새해 음식 셋
      return M(
        `<ellipse cx="15" cy="34" rx="9" ry="5" fill="#F8FAFC" stroke="#8A93A6" stroke-width="1.6"/>
        <ellipse cx="15" cy="32" rx="6" ry="3" fill="#EDE6D6"/>
        <path d="M28 30q0-6 8-6t8 6q-2 5-8 5t-8-5z" fill="#F6EFE0" stroke="#B8A278" stroke-width="1.6"/>
        <rect x="46" y="26" width="12" height="12" rx="2" fill="#7A9646" stroke="#5E7E36" stroke-width="1.6"/>
        <path d="M46 32h12M52 26v12" stroke="#EDE6D6" stroke-width="1.6"/>
        <path d="M10 14l2 4M32 12v5M54 14l-2 4" stroke="#F2C24E" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    /* ── L7 문화 이해 태도 ── */
    case "threeglasses": // 세 개의 안경
      return M(
        `<g stroke="#C0392E" stroke-width="2.2" fill="none"><circle cx="12" cy="16" r="6"/><circle cx="27" cy="16" r="6"/><path d="M18 16h3"/></g>
        <g stroke="#C0871C" stroke-width="2.2" fill="none"><circle cx="37" cy="34" r="6"/><circle cx="52" cy="34" r="6"/><path d="M43 34h3"/></g>
        <g stroke="#2E8A4C" stroke-width="2.2" fill="none"><circle cx="12" cy="50" r="6"/><circle cx="27" cy="50" r="6"/><path d="M18 50h3"/></g>
        <path d="M45 46l3 3 6-6" stroke="#2E8A4C" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "eyelevel": // 우열 없이 나란한 두 깃발
      return M(
        `<path d="M16 14v36M48 14v36" stroke="#6E4A26" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M16 14h14l-4 5 4 5H16z" fill="#C13B2E"/>
        <path d="M48 14h-14l4 5-4 5h14z" fill="#2E8AC0"/>
        <path d="M10 54h44" stroke="#B9C2D0" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "lineheart": // 보편적 가치의 선 — 하트를 지키는 울타리
      return M(
        `<path d="M32 46q-14-9-14-19 0-8 8-8 4 0 6 4 2-4 6-4 8 0 8 8 0 10-14 19z" fill="#FDECE6" stroke="#C13B2E" stroke-width="2.2"/>
        <path d="M8 54h48" stroke="#39455C" stroke-width="3" stroke-linecap="round"/>`,
      );
    default:
      return M(`<circle cx="32" cy="32" r="16" fill="#FDECE6" stroke="#C13B2E" stroke-width="2.4"/>`);
  }
}
