// socFigures12 — 사회 Ⅻ(인권과 기본권) 그림 모듈. socFigures11 문법 계승 —
// 개념 도해(벡터)+스틱맨 장면, 파운드리 문법 준수, 스틱맨만 손그림 라인.
//   · 퀴즈 그림 라벨은 (가)(나)·㉠㉡식 중립 라벨만 — 정답 유출 금지(aria에도 개념 이름 대신 묘사만).
//   · 민감 가드(인권 단원): 무성별 스틱맨, 침해 장면 재현·클로즈업 0(서류·방패·문·저울로만),
//     특정 집단 표지 0, 조직도류 연결선은 출발-도착 짝이 곧 의미(localOrgFig 오독 교훈 — 배선 눈검수).
const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

function shell(vw: number, vh: number, inner: string, aria: string, defs = ""): string {
  return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${aria}">
    <defs>
      <linearGradient id="s12-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#EEF2F8"/></linearGradient>
      <linearGradient id="s12-plum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C86ADB"/><stop offset=".55" stop-color="#AE3EC9"/><stop offset="1" stop-color="#8B2FA4"/></linearGradient>
      <linearGradient id="s12-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECC26A"/><stop offset="1" stop-color="#A8781E"/></linearGradient>
      <linearGradient id="s12-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset=".55" stop-color="#A87838"/><stop offset="1" stop-color="#8A6034"/></linearGradient>
      ${defs}
    </defs>
    <rect x="2" y="2" width="${vw - 4}" height="${vh - 4}" rx="14" fill="url(#s12-paper)" stroke="#D3DCE8" stroke-width="1.6"/>
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

/** 방패 배지(라운드 삼각) */
function shieldGlyph(x: number, y: number, w: number, opts: { crack?: boolean; fill?: string; stroke?: string } = {}): string {
  const h = w * 1.16;
  const path = `M${x} ${y - h / 2}c${w * 0.34} ${h * 0.1} ${w * 0.44} ${h * 0.04} ${w / 2} 0v${h * 0.46}c0 ${h * 0.3} -${w * 0.22} ${h * 0.44} -${w / 2} ${h * 0.54}c-${w * 0.28} -${h * 0.1} -${w / 2} -${h * 0.24} -${w / 2} -${h * 0.54}v-${h * 0.46}c${w * 0.06} ${h * 0.04} ${w * 0.16} ${h * 0.1} ${w / 2} 0z`;
  const crack = opts.crack
    ? `<path d="M${x - w * 0.1} ${y - h * 0.32}l${w * 0.14} ${h * 0.18}l-${w * 0.16} ${h * 0.14}l${w * 0.12} ${h * 0.2}" stroke="#5A3A66" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : "";
  return `<path d="${path}" fill="${opts.fill ?? "url(#s12-plum)"}" stroke="${opts.stroke ?? "#6E2482"}" stroke-width="1.6"/>
    <path d="M${x - w * 0.24} ${y - h * 0.3}q${w * 0.1} -${h * 0.08} ${w * 0.3} -${h * 0.04}" stroke="#E8C2F2" stroke-width="1.4" fill="none" opacity=".8"/>${crack}`;
}

/* ---------- L1: 두 장면 판별 — 게시된 점수 종이 vs 할인 안내판 ---------- */
export function violCardFig(): string {
  const inner = `
    <line x1="150" y1="14" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 26, "(가)")}
    ${pill(224, 26, "(나)")}
    <!-- (가) 게시판에 붙은 개인 점수 종이, 열린 자물쇠(정보가 새어 나감) -->
    <rect x="34" y="44" width="84" height="60" rx="6" fill="url(#s12-wood)" stroke="#6E4E26" stroke-width="1.6"/>
    <rect x="46" y="54" width="34" height="40" rx="3" fill="url(#s12-paper)" stroke="#8A93A6" stroke-width="1.3" transform="rotate(-3 63 74)"/>
    <path d="M52 64h20M52 72h14M52 80h18" stroke="#B8C2CE" stroke-width="1.7" stroke-linecap="round" transform="rotate(-3 63 74)"/>
    <g transform="translate(96 66)">
      <rect x="-7" y="0" width="14" height="12" rx="2.6" fill="#C0392E" opacity=".85"/>
      <path d="M-3.6 0v-4q0-4.4 3.6-4.4q3.6 0 3.6 4.4v1" stroke="#C0392E" stroke-width="2" fill="none"/>
    </g>
    ${tinyMan(76, 124, { mood: "sad", r: 5 })}
    <text x="76" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">내 점수가 모두에게 공개됐어요</text>
    <!-- (나) 교통 요금 할인 안내, 하트(배려) -->
    <rect x="182" y="44" width="84" height="60" rx="6" fill="url(#s12-paper)" stroke="#8A93A6" stroke-width="1.6"/>
    <rect x="192" y="54" width="40" height="14" rx="7" fill="#EAF2FA" stroke="#8A93A6" stroke-width="1.2"/>
    <path d="M198 61h28" stroke="#B8C2CE" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M240 66c0-4 3.4-6.4 6.6-6.4c2 0 3.6 1 4.4 2.4c.8-1.4 2.4-2.4 4.4-2.4c3.2 0 6.6 2.4 6.6 6.4c0 5.4-6.6 9-11 12c-4.4-3-11-6.6-11-12z" fill="#2E8A4C" opacity=".8"/>
    <path d="M196 78h44M196 88h32" stroke="#C8D2DE" stroke-width="1.8" stroke-linecap="round"/>
    ${tinyMan(224, 124, { mood: "joy", r: 5 })}
    <text x="224" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">청소년은 요금을 적게 내요</text>`;
  return shell(300, 158, inner, "두 장면 비교, 왼쪽은 게시판에 붙은 개인 점수 종이와 열린 자물쇠, 오른쪽은 청소년 요금 안내와 하트 표시");
}

/* ---------- L2: 다섯 방패와 ㉠ 토대(왕관 자리) ---------- */
export function shieldCrestFig(): string {
  const names = ["평등권", "자유권", "참정권", "청구권", "사회권"];
  const xs = [54, 103, 152, 201, 250];
  const shields = xs
    .map((x, i) => `${shieldGlyph(x, 58, 34)}<text x="${x}" y="62" text-anchor="middle" font-size="9.4" font-weight="800" fill="#FFFFFF">${names[i]}</text>`)
    .join("");
  const inner = `
    ${shields}
    ${xs.map((x) => `<path d="M${x} 84v14" stroke="#B8A0C8" stroke-width="1.6" stroke-dasharray="3 3"/>`).join("")}
    <rect x="30" y="100" width="240" height="30" rx="8" fill="url(#s12-gold)" stroke="#8A6034" stroke-width="1.6"/>
    ${pill(150, 115, "㉠")}
    <text x="150" y="146" text-anchor="middle" font-size="9.6" fill="#7E8AA0">다섯 방패가 딛고 선 받침돌</text>`;
  return shell(300, 156, inner, "다섯 개의 방패가 나란히 서 있고 그 아래 받침돌에 빈칸 기호가 있는 구조도");
}

/* ---------- L3: 다섯 서랍 캐비닛 — ㉠ 서랍 속 세부 권리 ---------- */
export function drawerFig(): string {
  const rows = [0, 1, 2, 3].map(
    (i) => `<rect x="40" y="${28 + i * 26}" width="104" height="22" rx="4" fill="${i === 1 ? "url(#s12-plum)" : "#EAF0F6"}" stroke="#8A93A6" stroke-width="1.3"/>
      <circle cx="92" cy="${39 + i * 26}" r="2.6" fill="${i === 1 ? "#E8C2F2" : "#8A93A6"}"/>`,
  ).join("");
  const inner = `
    <rect x="34" y="20" width="116" height="116" rx="8" fill="url(#s12-paper)" stroke="#7E8AA0" stroke-width="1.8"/>
    ${rows}
    ${pill(58, 39 + 26, "㉠")}
    <!-- 열린 ㉠ 서랍에서 나온 카드 3장 -->
    <g transform="rotate(-4 216 46)"><rect x="178" y="30" width="76" height="22" rx="6" fill="#FDFEFF" stroke="#AE3EC9" stroke-width="1.5"/><text x="216" y="45" text-anchor="middle" font-size="10.4" font-weight="800" fill="#39455C">선거권</text></g>
    <g><rect x="182" y="62" width="90" height="22" rx="6" fill="#FDFEFF" stroke="#AE3EC9" stroke-width="1.5"/><text x="227" y="77" text-anchor="middle" font-size="10.4" font-weight="800" fill="#39455C">공무 담임권</text></g>
    <g transform="rotate(3 222 106)"><rect x="180" y="94" width="86" height="22" rx="6" fill="#FDFEFF" stroke="#AE3EC9" stroke-width="1.5"/><text x="223" y="109" text-anchor="middle" font-size="10.4" font-weight="800" fill="#39455C">국민 투표권</text></g>
    <path d="M148 66q14 0 22-6M148 70q16 4 24 4M148 76q14 8 22 22" stroke="#C8B0D4" stroke-width="1.5" fill="none" stroke-dasharray="3 3"/>
    <text x="150" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">㉠ 서랍을 열었더니 이 카드들이 들어 있어요</text>`;
  return shell(300, 160, inner, "다섯 칸 서랍장에서 빈칸 기호가 붙은 서랍이 열려 선거권·공무 담임권·국민 투표권 카드가 나온 그림");
}

/* ---------- L4: 제한의 틀 — 목적 3 + 형식 + 넘을 수 없는 선 ---------- */
export function limitFrameFig(): string {
  const aims = [
    { x: 62, t1: "국가", t2: "안전 보장" },
    { x: 150, t1: "질서", t2: "유지" },
    { x: 238, t1: "공공", t2: "복리" },
  ];
  const aimBoxes = aims
    .map(
      (a) => `<rect x="${a.x - 40}" y="24" width="80" height="34" rx="8" fill="#EAF2FA" stroke="#8A93A6" stroke-width="1.4"/>
      <text x="${a.x}" y="38" text-anchor="middle" font-size="9.8" font-weight="800" fill="#39455C">${a.t1}</text>
      <text x="${a.x}" y="50" text-anchor="middle" font-size="9.8" font-weight="800" fill="#39455C">${a.t2}</text>
      <path d="M${a.x} 58v12" stroke="#8A93A6" stroke-width="1.6"/>`,
    )
    .join("");
  const inner = `
    <text x="150" y="18" text-anchor="middle" font-size="10" font-weight="800" fill="#5A6478">이 목적을 위해 필요한 경우에만</text>
    ${aimBoxes}
    <rect x="70" y="70" width="160" height="26" rx="8" fill="url(#s12-plum)" stroke="#6E2482" stroke-width="1.5"/>
    ${pill(150, 83, "㉠")}
    <path d="M150 96v10" stroke="#8A93A6" stroke-width="1.6"/>
    <path d="M40 118h220" stroke="#C0392E" stroke-width="2.6" stroke-dasharray="7 5"/>
    ${shieldGlyph(150, 134, 22, { fill: "#FDFEFF", stroke: "#C0392E" })}
    <path d="M150 128c0-2.4 2-3.8 3.9-3.8c1.2 0 2.1.6 2.6 1.4c.5-.8 1.4-1.4 2.6-1.4c1.9 0 3.9 1.4 3.9 3.8c0 3.2-3.9 5.4-6.5 7.2c-2.6-1.8-6.5-4-6.5-7.2z" fill="#C0392E" transform="translate(-6.5 -3)"/>
    <text x="248" y="122" text-anchor="middle" font-size="9.4" font-weight="800" fill="#C0392E">넘을 수 없는 선</text>
    <text x="150" y="156" text-anchor="middle" font-size="9.6" fill="#7E8AA0">제한하더라도 이 선 아래는 건드릴 수 없어요</text>`;
  return shell(300, 164, inner, "세 가지 목적 상자에서 빈칸 형식 상자로 이어지고, 그 아래 넘을 수 없는 붉은 선과 방패 심장이 있는 구조도");
}

/* ---------- L5: 세 개의 문 — 법봉·책과 저울·맞잡은 손 ---------- */
export function threeDoorsFig(): string {
  const door = (x: number, label: string, glyph: string): string => `
    <rect x="${x - 40}" y="40" width="80" height="86" rx="8" fill="url(#s12-paper)" stroke="#8A93A6" stroke-width="1.6"/>
    <rect x="${x - 30}" y="58" width="60" height="68" rx="5" fill="url(#s12-wood)" stroke="#6E4E26" stroke-width="1.5"/>
    <circle cx="${x + 20}" cy="94" r="2.6" fill="#5A4420"/>
    <circle cx="${x}" cy="40" r="17" fill="#FDFEFF" stroke="#AE3EC9" stroke-width="1.8"/>
    ${glyph}
    ${pill(x, 140, label)}`;
  // (가) 법봉 (나) 책+저울 (다) 맞잡은 두 손
  const gavel = `<g transform="translate(74 40) rotate(-34)"><rect x="-8" y="-3" width="16" height="6" rx="2.4" fill="#8A6034"/><rect x="-1.6" y="3" width="3.2" height="9" rx="1.4" fill="#A87838"/></g>`;
  const bookScale = `<g transform="translate(150 40)">
    <rect x="-9" y="2" width="18" height="6" rx="1.6" fill="#8B2FA4"/>
    <path d="M0 0v-8M-7 -4h14" stroke="#39455C" stroke-width="1.5"/>
    <path d="M-7 -4q0 3 2.6 3t2.6-3M1.8 -4q0 3 2.6 3t2.6-3" fill="none" stroke="#39455C" stroke-width="1.1"/>
  </g>`;
  const hands = `<g transform="translate(226 40)" ${STICK.replace('stroke-width="2"', 'stroke-width="1.7"')}>
    <path d="M-10 2q4-5 9-2M10 -1q-4-4-8 0M-3 0q3-2 6 1"/>
  </g>`;
  const inner = `
    ${door(74, "(가)", gavel)}
    ${door(150, "(나)", bookScale)}
    ${door(226, "(다)", hands)}
    <text x="150" y="24" text-anchor="middle" font-size="10" font-weight="800" fill="#5A6478">방패가 뚫렸을 때 두드리는 세 개의 문</text>`;
  return shell(300, 158, inner, "세 개의 문 그림, 각각 문 위에 작은 나무 망치, 책과 저울, 맞잡은 손 모양 간판이 걸려 있다");
}

/* ---------- L6: 세 걸음 장면 — 모임·테이블·담담한 멈춤 ---------- */
export function laborStepsFig(): string {
  const inner = `
    ${pill(58, 26, "(가)")}
    ${pill(150, 26, "(나)")}
    ${pill(242, 26, "(다)")}
    <line x1="104" y1="16" x2="104" y2="144" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    <line x1="196" y1="16" x2="196" y2="144" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    <!-- (가) 흩어진 사람들이 원으로 모임 -->
    ${tinyMan(40, 62, { r: 4.6 })}${tinyMan(74, 58, { r: 4.6 })}${tinyMan(44, 92, { r: 4.6 })}${tinyMan(72, 92, { r: 4.6, mood: "joy" })}
    <circle cx="57" cy="80" r="30" fill="none" stroke="#AE3EC9" stroke-width="1.8" stroke-dasharray="4 5"/>
    <text x="58" y="136" text-anchor="middle" font-size="9.4" fill="#7E8AA0">하나의 단체로</text>
    <!-- (나) 같은 높이 테이블 -->
    <rect x="122" y="84" width="56" height="8" rx="3" fill="url(#s12-wood)" stroke="#6E4E26" stroke-width="1.3"/>
    ${tinyMan(116, 62, { r: 5 })}${tinyMan(184, 62, { r: 5 })}
    <path d="M136 54q14-10 28 0" stroke="#AE3EC9" stroke-width="1.7" fill="none" stroke-linecap="round"/>
    <text x="150" y="136" text-anchor="middle" font-size="9.4" fill="#7E8AA0">마주 앉아 협의</text>
    <!-- (다) 어두운 작업대 + 나란한 기다림 -->
    <rect x="206" y="52" width="72" height="22" rx="4" fill="#7E8AA0" opacity=".45"/>
    ${tinyMan(222, 96, { r: 4.6, arm: "down" })}${tinyMan(242, 96, { r: 4.6, arm: "down" })}${tinyMan(262, 96, { r: 4.6, arm: "down" })}
    <text x="242" y="136" text-anchor="middle" font-size="9.4" fill="#7E8AA0">절차 거쳐 멈춤</text>`;
  return shell(300, 152, inner, "세 장면 그림, 흩어진 사람들이 단체로 모이는 장면, 같은 높이 테이블에 마주 앉은 장면, 작업을 멈추고 나란히 기다리는 장면");
}

/* ---------- L7: 침해 유형 → 도움 창구 배선도 ---------- */
export function remedyMapFig(): string {
  // 배선 규칙(localOrgFig 교훈): 좌측 침해 카드 2장 → 우측 창구 2곳으로 각각 실선 1:1,
  // 그리고 두 카드 모두에서 법원으로 점선(재판은 공통의 길) — 오독 없는 1:1+공통 구조.
  const inner = `
    <rect x="24" y="30" width="108" height="34" rx="8" fill="#EAF2FA" stroke="#8A93A6" stroke-width="1.4"/>
    <text x="78" y="44" text-anchor="middle" font-size="9.6" font-weight="800" fill="#39455C">임금을 받지 못했어요</text>
    <text x="78" y="57" text-anchor="middle" font-size="8.8" fill="#5A6478">(「근로 기준법」 위반)</text>
    <rect x="24" y="86" width="108" height="34" rx="8" fill="#EAF2FA" stroke="#8A93A6" stroke-width="1.4"/>
    <text x="78" y="100" text-anchor="middle" font-size="9.6" font-weight="800" fill="#39455C">이유 없이 해고됐어요</text>
    <text x="78" y="113" text-anchor="middle" font-size="8.8" fill="#5A6478">(부당 해고·부당 노동 행위)</text>
    <rect x="188" y="30" width="88" height="34" rx="8" fill="url(#s12-plum)"/>
    ${pill(232, 47, "㉠")}
    <rect x="188" y="86" width="88" height="34" rx="8" fill="url(#s12-plum)"/>
    ${pill(232, 103, "㉡")}
    <path d="M132 47h52" stroke="#39455C" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M178 42l8 5-8 5" fill="none" stroke="#39455C" stroke-width="2" stroke-linejoin="round"/>
    <path d="M132 103h52" stroke="#39455C" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M178 98l8 5-8 5" fill="none" stroke="#39455C" stroke-width="2" stroke-linejoin="round"/>
    <path d="M78 64v22M78 120v10q0 8 8 8h64q10 0 10-8" stroke="#B8C2CE" stroke-width="1.5" fill="none" stroke-dasharray="4 4"/>
    <rect x="112" y="132" width="76" height="22" rx="8" fill="#FDFEFF" stroke="#8A93A6" stroke-width="1.4"/>
    <text x="150" y="147" text-anchor="middle" font-size="9.6" font-weight="800" fill="#5A6478">법원(재판)도 가능</text>
    <text x="150" y="20" text-anchor="middle" font-size="10" font-weight="800" fill="#5A6478">일터에서 권리를 침해당했다면?</text>`;
  return shell(300, 164, inner, "두 침해 상황 카드가 각각 다른 빈칸 창구로 화살표로 이어지고, 아래에 법원 재판도 가능하다는 공통 길이 점선으로 표시된 배선도");
}

/* ---------- recap 미니아트(64×64 플랫 — 전 카드 필수) ---------- */
export function soc12MiniArt(key: string): string {
  const box = (inner: string): string =>
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">${inner}</svg>`;
  const P = "#AE3EC9";
  const PD = "#8B2FA4";
  const GOLD = "#E8A20C";
  const INK = "#39455C";
  const miniShield = (x: number, y: number, w: number, fill = P): string => {
    const h = w * 1.16;
    return `<path d="M${x} ${y - h / 2}c${w * 0.34} ${h * 0.1} ${w * 0.44} ${h * 0.04} ${w / 2} 0v${h * 0.46}c0 ${h * 0.3} -${w * 0.22} ${h * 0.44} -${w / 2} ${h * 0.54}c-${w * 0.28} -${h * 0.1} -${w / 2} -${h * 0.24} -${w / 2} -${h * 0.54}v-${h * 0.46}c${w * 0.06} ${h * 0.04} ${w * 0.16} ${h * 0.1} ${w / 2} 0z" fill="${fill}" stroke="${PD}" stroke-width="1.6"/>`;
  };
  const arts: Record<string, string> = {
    // L1
    right: box(`<circle cx="20" cy="26" r="7" fill="#F6EFE4" stroke="${INK}" stroke-width="2"/><circle cx="44" cy="26" r="7" fill="#F6EFE4" stroke="${INK}" stroke-width="2"/>
      <path d="M20 33v12M44 33v12" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="20" cy="12" r="4" fill="${P}"/><circle cx="44" cy="12" r="4" fill="${P}"/>
      <path d="M14 52h36" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>`),
    viol: box(`${miniShield(32, 30, 30)}<path d="M28 20l6 8-7 6 6 9" stroke="#FBECEE" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="14" r="7" fill="#C0392E"/><path d="M50 10.4v4.4M50 17.6v.4" stroke="#FFF" stroke-width="1.8" stroke-linecap="round"/>`),
    sense: box(`<circle cx="28" cy="28" r="14" fill="#EAF2FA" stroke="${INK}" stroke-width="2.6"/><path d="M38 38l12 12" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M22 28c2-4 10-4 12 0c-2 4-10 4-12 0z" fill="${P}"/><circle cx="28" cy="28" r="2" fill="#FFF"/>`),
    udhr: box(`<rect x="16" y="12" width="32" height="40" rx="4" fill="#FDFEFF" stroke="${INK}" stroke-width="2"/>
      <path d="M22 22h20M22 30h20M22 38h14" stroke="#B8C2CE" stroke-width="2" stroke-linecap="round"/>
      <path d="M40 8q6 4 12 2q-2 6 2 10" stroke="${P}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="46" cy="46" r="7" fill="${GOLD}"/><path d="M43 46l2.2 2.4 3.8-4.6" stroke="#FFF" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    // L2
    basic: box(`<path d="M32 14q-12-4-20 0v34q8-4 20 0q12-4 20 0V14q-8-4-20 0z" fill="#FDFEFF" stroke="${INK}" stroke-width="2"/>
      <path d="M32 14v34" stroke="#C8D2DE" stroke-width="1.8"/>
      ${miniShield(32, 30, 16)}`),
    dignity: box(`<path d="M14 26l6 8 12-12 12 12 6-8v10q-18 6-36 0z" fill="${GOLD}" stroke="#8A6034" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="14" cy="22" r="2.4" fill="${GOLD}"/><circle cx="32" cy="18" r="2.4" fill="${GOLD}"/><circle cx="50" cy="22" r="2.4" fill="${GOLD}"/>
      <path d="M18 48h28" stroke="${P}" stroke-width="3" stroke-linecap="round"/>`),
    five: box(`${miniShield(14, 24, 12)}${miniShield(32, 18, 12)}${miniShield(50, 24, 12)}${miniShield(22, 42, 12)}${miniShield(42, 42, 12)}`),
    // L3
    freeSub: box(`<circle cx="32" cy="18" r="6" fill="#F6EFE4" stroke="${INK}" stroke-width="2"/>
      <path d="M32 24v10" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M32 34q-12 6-18 16M32 34v18M32 34q12 6 18 16" stroke="${P}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 5"/>`),
    partSub: box(`<rect x="14" y="28" width="36" height="22" rx="4" fill="${P}" stroke="${PD}" stroke-width="1.8"/>
      <rect x="26" y="32" width="12" height="3" rx="1.5" fill="#FFF"/>
      <rect x="24" y="12" width="16" height="12" rx="2.4" fill="${GOLD}" stroke="#8A6034" stroke-width="1.5"/>
      <path d="M28 24v4" stroke="#8A6034" stroke-width="2"/>`),
    claimSub: box(`<rect x="14" y="16" width="26" height="34" rx="4" fill="#FDFEFF" stroke="${INK}" stroke-width="2"/>
      <path d="M20 26h14M20 34h10" stroke="#B8C2CE" stroke-width="2" stroke-linecap="round"/>
      <circle cx="46" cy="42" r="9" fill="${P}"/><path d="M42 42l3 3.2 5-6" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
    eqsoc: box(`<path d="M18 20h28" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M18 20q0 5 5 5t5-5M36 20q0 5 5 5t5-5" fill="none" stroke="${INK}" stroke-width="1.8"/>
      <path d="M12 46q20 10 40 0" stroke="${P}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M20 44v6M32 46v6M44 44v6" stroke="${P}" stroke-width="1.8" stroke-linecap="round"/>`),
    // L4
    aim3: box(`<circle cx="32" cy="32" r="17" fill="none" stroke="${P}" stroke-width="2.4"/>
      <circle cx="32" cy="32" r="9" fill="none" stroke="${P}" stroke-width="2"/>
      <circle cx="32" cy="32" r="3" fill="${P}"/>
      <path d="M46 18l8-8M50 22l6-6" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round"/>`),
    bylaw: box(`<rect x="18" y="10" width="28" height="40" rx="4" fill="#FDFEFF" stroke="${INK}" stroke-width="2"/>
      <path d="M24 20h16M24 28h16M24 36h10" stroke="#B8C2CE" stroke-width="2" stroke-linecap="round"/>
      <rect x="24" y="50" width="16" height="6" rx="3" fill="${GOLD}"/>
      <path d="M12 56h40" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`),
    core: box(`${miniShield(32, 30, 34, "#FDFEFF")}
      <path d="M32 24c0-3.4 2.8-5.4 5.4-5.4c1.7 0 3 .8 3.7 2c.7-1.2 2-2 3.7-2c2.6 0 5.4 2 5.4 5.4c0 4.5-5.5 7.6-9.1 10.1c-3.6-2.5-9.1-5.6-9.1-10.1z" fill="#C0392E" transform="translate(-9 0)"/>
      <path d="M12 52h40" stroke="#C0392E" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="5 4"/>`),
    // L5
    court: box(`<g transform="translate(30 26) rotate(-30)"><rect x="-11" y="-4" width="22" height="8" rx="3" fill="#A87838" stroke="#6E4E26" stroke-width="1.4"/><rect x="-2" y="4" width="4" height="14" rx="2" fill="#8A6034"/></g>
      <rect x="16" y="46" width="32" height="6" rx="3" fill="${INK}"/>`),
    consti: box(`<rect x="14" y="22" width="20" height="28" rx="3" fill="${P}" stroke="${PD}" stroke-width="1.6"/>
      <path d="M18 30h12M18 36h12M18 42h8" stroke="#E8C2F2" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M46 20v14M39 26h14" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M39 26q0 4 3.5 4t3.5-4M46 26q0 4 3.5 4t3.5-4" fill="none" stroke="${INK}" stroke-width="1.5"/>`),
    nhrc: box(`<path d="M14 34q6-8 14-3M50 32q-6-6-12-1M26 32q5-3 10 1" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="20" cy="18" r="5" fill="#F6EFE4" stroke="${INK}" stroke-width="1.8"/>
      <circle cx="44" cy="18" r="5" fill="#F6EFE4" stroke="${INK}" stroke-width="1.8"/>
      <path d="M18 48h28" stroke="${P}" stroke-width="3" stroke-linecap="round"/>`),
    moredoor: box(`<rect x="12" y="18" width="16" height="30" rx="3" fill="${P}" opacity=".85"/>
      <rect x="36" y="18" width="16" height="30" rx="3" fill="${P}" opacity=".55"/>
      <circle cx="24" cy="34" r="1.8" fill="#FFF"/><circle cx="48" cy="34" r="1.8" fill="#FFF"/>
      <path d="M10 52h44" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`),
    // L6
    worker: box(`<circle cx="32" cy="16" r="6" fill="#F6EFE4" stroke="${INK}" stroke-width="2"/>
      <path d="M32 22v14M32 26l-10 6M32 26l10 6M32 36l-7 12M32 36l7 12" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <rect x="42" y="28" width="12" height="10" rx="2" fill="${GOLD}" stroke="#8A6034" stroke-width="1.4"/>
      <path d="M46 28v-3h4v3" stroke="#8A6034" stroke-width="1.6" fill="none"/>`),
    wright: box(`<rect x="16" y="12" width="32" height="40" rx="4" fill="#FDFEFF" stroke="${INK}" stroke-width="2"/>
      <path d="M22 22h20M22 30h20M22 38h12" stroke="#B8C2CE" stroke-width="2" stroke-linecap="round"/>
      ${miniShield(44, 44, 18)}`),
    three3: box(`<circle cx="18" cy="20" r="7" fill="${P}"/><circle cx="46" cy="20" r="7" fill="${P}" opacity=".75"/><circle cx="32" cy="44" r="7" fill="${P}" opacity=".55"/>
      <path d="M23 24l18 16M41 24l-18 16M18 27v0" stroke="${PD}" stroke-width="1.8" stroke-linecap="round"/>`),
    // L7
    teen: box(`${miniShield(26, 32, 26)}
      <ellipse cx="47" cy="44" rx="9" ry="3.4" fill="#EEF2F6" stroke="${INK}" stroke-width="1.6"/>
      <circle cx="44" cy="40" r="2.6" fill="${GOLD}"/>`),
    wviol: box(`<rect x="14" y="18" width="26" height="32" rx="4" fill="#FDFEFF" stroke="${INK}" stroke-width="2" transform="rotate(-8 27 34)"/>
      <path d="M20 28h14M20 35h10" stroke="#B8C2CE" stroke-width="2" stroke-linecap="round" transform="rotate(-8 27 34)"/>
      <circle cx="47" cy="20" r="7" fill="#C0392E"/><path d="M47 16.4v4.4M47 23.6v.4" stroke="#FFF" stroke-width="1.8" stroke-linecap="round"/>`),
    wremedy: box(`<rect x="10" y="24" width="18" height="24" rx="3" fill="${P}"/>
      <rect x="36" y="24" width="18" height="24" rx="3" fill="${P}" opacity=".65"/>
      <path d="M19 18v-6h26v6" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="19" cy="36" r="1.8" fill="#FFF"/><circle cx="45" cy="36" r="1.8" fill="#FFF"/>`),
    act2: box(`<path d="M14 46q18-24 36 0" stroke="${P}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="14" cy="46" r="4" fill="${GOLD}"/><circle cx="32" cy="28" r="4" fill="${GOLD}"/><circle cx="50" cy="46" r="4" fill="${GOLD}"/>
      <path d="M32 16l1.8 3.8 3.8 1.8-3.8 1.8-1.8 3.8-1.8-3.8-3.8-1.8 3.8-1.8z" fill="${P}"/>`),
    grad: box(`<circle cx="32" cy="32" r="16" fill="none" stroke="${P}" stroke-width="2.4"/>
      <path d="M16 32q16-10 32 0M16 32q16 10 32 0M32 16v32" stroke="${P}" stroke-width="1.6" fill="none"/>
      <path d="M44 14l2 4.2 4.2 2-4.2 2-2 4.2-2-4.2-4.2-2 4.2-2z" fill="${GOLD}"/>`),
  };
  return arts[key] ?? box(`<circle cx="32" cy="32" r="12" fill="#AE3EC9"/>`);
}
