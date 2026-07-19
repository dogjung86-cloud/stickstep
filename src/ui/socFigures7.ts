// socFigures7 — 사회 Ⅶ(인간과 사회생활) 그림 모듈. 일반사회 첫 단원: 지도가 없다 —
// 전부 개념 도해(벡터)와 스틱맨 장면이다. 파운드리 문법(근-동조 그라데이션+키라이트+
// 접촉 그림자+재질별 최암색 외곽선) 준수, 스틱맨만 손그림 라인.
//   · 파라미터형 유출 방지: lifeAgencyFig({hide})·statusFig({letters})는 퀴즈에서 라벨을
//     ㉠㉡…으로 가려 정답 인쇄를 막는다(geoCycleQuizFig 계보).
//   · 민감 가드: 스틱맨은 무성별 기본형(성별 표지 없음), 차별 장면은 추상(거절 손짓·문)만 —
//     특정 집단 표지 금지, 가해 클로즈업 금지.
const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

function shell(vw: number, vh: number, inner: string, aria: string, defs = ""): string {
  return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${aria}">
    <defs>
      <linearGradient id="s7-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#EEF2F8"/></linearGradient>
      ${defs}
    </defs>
    <rect x="2" y="2" width="${vw - 4}" height="${vh - 4}" rx="14" fill="url(#s7-paper)" stroke="#D3DCE8" stroke-width="1.6"/>
    ${inner}
  </svg>`;
}

/** 미니 스틱맨(밝은 배경용) — 서 있는 기본 포즈. mood: smile|sad */
function tinyMan(x: number, y: number, r: number, mood: "smile" | "sad" = "smile", tone = "#3C4654"): string {
  const mouth = mood === "smile" ? `M${x - r * 0.34} ${y + r * 0.42}q${r * 0.34} ${r * 0.3} ${r * 0.68} 0` : `M${x - r * 0.34} ${y + r * 0.55}q${r * 0.34} -${r * 0.3} ${r * 0.68} 0`;
  const h = r * 3.6;
  return `<g stroke="${tone}" stroke-width="2" stroke-linecap="round" fill="none">
      <circle cx="${x}" cy="${y}" r="${r}" fill="#F6EFE4"/>
      <path d="M${x} ${y + r}v${h * 0.42}M${x} ${y + r + h * 0.13}l${-r * 0.9} ${r * 0.62}M${x} ${y + r + h * 0.13}l${r * 0.9} ${r * 0.62}M${x} ${y + r + h * 0.42}l${-r * 0.72} ${h * 0.3}M${x} ${y + r + h * 0.42}l${r * 0.72} ${h * 0.3}"/>
    </g>
    <circle cx="${x - r * 0.34}" cy="${y - r * 0.14}" r="${Math.max(1, r * 0.13)}" fill="${tone}"/>
    <circle cx="${x + r * 0.34}" cy="${y - r * 0.14}" r="${Math.max(1, r * 0.13)}" fill="${tone}"/>
    <path d="${mouth}" stroke="${tone}" stroke-width="1.4" stroke-linecap="round" fill="none"/>`;
}

/* ---------- L1: 쌍둥이 대비(퀴즈 그림) ---------- */
export function twinFig(): string {
  const inner = `
    <line x1="150" y1="16" x2="150" y2="152" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    <text x="76" y="30" text-anchor="middle" font-size="11" font-weight="800" fill="#5A6B84">한국에서 자란 ㉮</text>
    <text x="224" y="30" text-anchor="middle" font-size="11" font-weight="800" fill="#5A6B84">미국에서 자란 ㉯</text>
    <g ${STICK}>
      <circle cx="76" cy="62" r="10" fill="#F6EFE4"/>
      <path d="M76 72q2 10-3 18l-5 8M76 72q1 12 3 20M73 88l-6 18M79 92l4 15M72 80l-13 5M74 78l16 6"/>
    </g>
    <circle cx="72.8" cy="60.8" r="1.2" fill="#3C4654"/><circle cx="79.2" cy="60.8" r="1.2" fill="#3C4654"/>
    <path d="M73.4 65.5q2.6 1.8 5.2 0" stroke="#3C4654" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <ellipse cx="55" cy="94" rx="9" ry="5.6" fill="url(#s7-bowl)" stroke="#8A6A3E" stroke-width="1.4"/>
    <path d="M50 91.6q5-3 10 0" stroke="#FFFFFF" stroke-width="1.6" opacity=".75"/>
    <path d="M60 86l4-6M64 86l4-6" stroke="#8A93A6" stroke-width="1.4" stroke-linecap="round"/>
    <text x="76" y="136" text-anchor="middle" font-size="10" fill="#7E8AA0">고개 숙여 인사 · 김치</text>
    <g ${STICK}>
      <circle cx="224" cy="62" r="10" fill="#F6EFE4"/>
      <path d="M224 72v24M224 96l-8 16M224 96l8 16M224 79l-14-8M224 79l14-11"/>
    </g>
    <circle cx="220.8" cy="60.8" r="1.2" fill="#3C4654"/><circle cx="227.2" cy="60.8" r="1.2" fill="#3C4654"/>
    <path d="M221.4 65.5q2.6 2 5.2 0" stroke="#3C4654" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <path d="M242 66l4-3M243 70l5-1" stroke="#8A93A6" stroke-width="1.3" stroke-linecap="round" opacity=".85"/>
    <g stroke="#7E8AA0" stroke-width="1.6" stroke-linecap="round">
      <path d="M251 88v12M248 88v5M254 88v5"/><path d="M248 93q3 2 6 0" fill="none"/>
    </g>
    <text x="224" y="136" text-anchor="middle" font-size="10" fill="#7E8AA0">손 흔들어 인사 · 포크</text>
    <ellipse cx="76" cy="112" rx="14" ry="2.4" fill="#2A3A5E" opacity=".08"/>
    <ellipse cx="224" cy="114" rx="14" ry="2.4" fill="#2A3A5E" opacity=".08"/>`;
  const defs = `<radialGradient id="s7-bowl" cx=".4" cy=".35" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F3EBDA"/><stop offset="1" stop-color="#DCCDB0"/></radialGradient>`;
  return shell(300, 152, inner, "같은 얼굴의 쌍둥이 두 사람 — 인사법과 식사 도구가 서로 다른 모습", defs);
}

/* ---------- L2: 생애 트랙 도해(hide = 기관 이름 ㉠~㉣ 가림 — 퀴즈 유출 방지판) ---------- */
export function lifeAgencyFig(opts?: { hide?: boolean }): string {
  const hide = opts?.hide ?? false;
  const stations = [
    { x: 45, name: "아기", agency: "가족", mark: "㉠" },
    { x: 115, name: "어린이", agency: "또래 집단", mark: "㉡" },
    { x: 185, name: "청소년", agency: "학교", mark: "㉢" },
    { x: 255, name: "어른", agency: "직장", mark: "㉣" },
  ];
  const inner = `
    <rect x="18" y="26" width="264" height="20" rx="10" fill="#EAF4FE" stroke="#7EB8E8" stroke-width="1.3"/>
    <text x="150" y="40" text-anchor="middle" font-size="10.5" font-weight="800" fill="#2E6EA8">${hide ? "㉤ — 평생에 걸쳐 영향" : "대중 매체 — 평생에 걸쳐 영향"}</text>
    <path d="M20 108h260" stroke="#8FA2BC" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M272 104l8 4-8 4" stroke="#8FA2BC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    ${stations
      .map(
        (st, i) => `
      ${tinyMan(st.x, 72 - i * 2, 6 + i * 0.8)}
      <circle cx="${st.x}" cy="108" r="4" fill="#FFFFFF" stroke="#5A7A9E" stroke-width="2"/>
      <text x="${st.x}" y="126" text-anchor="middle" font-size="10.5" font-weight="800" fill="#39455C">${st.name}</text>
      <rect x="${st.x - 26}" y="132" width="52" height="17" rx="8.5" fill="${hide ? "#EEF1F6" : "#F3E9FA"}" stroke="${hide ? "#B9C2D0" : "#B98CD0"}" stroke-width="1.2"/>
      <text x="${st.x}" y="144" text-anchor="middle" font-size="9.5" font-weight="800" fill="${hide ? "#6E7A8C" : "#6E2E86"}">${hide ? st.mark : st.agency}</text>`,
      )
      .join("")}
    <path d="M45 52v46M115 50v48M185 48v50M255 46v52" stroke="#C9D2E0" stroke-width="1" stroke-dasharray="3 4"/>`;
  return shell(300, 158, inner, hide ? "인생 트랙 위 네 시기와 가려진 기관 이름표, 위에는 전체를 덮는 띠" : "인생 트랙 — 아기·어린이·청소년·어른 시기별 사회화 기관과 평생을 덮는 대중 매체 띠");
}

/* ---------- L4: 지위 이름표 도해(letters = ㉠㉡ 가림) ---------- */
export function statusFig(opts?: { letters?: boolean }): string {
  const lt = opts?.letters ?? false;
  const tag = (x: number, y: number, w: number, label: string, kind: "asc" | "ach"): string => {
    const c = kind === "asc" ? "#C0871C" : "#2E8AC0";
    const bg = kind === "asc" ? "#FBF3E2" : "#E8F3FB";
    return `<g>
      <rect x="${x}" y="${y}" width="${w}" height="20" rx="7" fill="${bg}" stroke="${c}" stroke-width="1.5"/>
      <circle cx="${x + 10}" cy="${y + 10}" r="2.6" fill="none" stroke="${c}" stroke-width="1.4"/>
      <text x="${x + w / 2 + 5}" y="${y + 14}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#39455C">${label}</text>
    </g>`;
  };
  const inner = `
    ${tinyMan(150, 46, 11)}
    <ellipse cx="150" cy="102" rx="17" ry="2.6" fill="#2A3A5E" opacity=".08"/>
    <path d="M136 58q-30-2-58 6M164 58q30-2 58 6M140 74q-26 8-48 26M160 74q26 8 48 26" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="3 4"/>
    ${tag(16, 56, 62, lt ? "㉠" : "첫째", "asc")}
    ${tag(222, 56, 62, lt ? "㉡" : "학생", "ach")}
    ${tag(30, 96, 76, lt ? "㉢" : "이모·삼촌", "asc")}
    ${tag(196, 96, 88, lt ? "㉣" : "합창 부원", "ach")}
    <rect x="30" y="130" width="12" height="12" rx="4" fill="#FBF3E2" stroke="#C0871C" stroke-width="1.5"/>
    <text x="48" y="140" font-size="10" fill="#5A6B84">태어나면서 주어진 지위</text>
    <rect x="176" y="130" width="12" height="12" rx="4" fill="#E8F3FB" stroke="#2E8AC0" stroke-width="1.5"/>
    <text x="194" y="140" font-size="10" fill="#5A6B84">노력으로 얻은 지위</text>`;
  return shell(300, 152, inner, lt ? "한 사람에게 붙은 네 개의 지위 이름표 — 이름이 가려져 있고 색으로 두 종류가 구분됨" : "한 사람에게 붙은 네 개의 지위 이름표 — 두 색으로 나뉜 모습");
}

/* ---------- L5: 역할 갈등 도해(퀴즈 그림) ---------- */
export function roleClashFig(): string {
  const inner = `
    <circle cx="150" cy="34" r="15" fill="#FFF6E2" stroke="#E8940A" stroke-width="1.6"/>
    <path d="M150 25v9l6 4" stroke="#B06E08" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <text x="150" y="64" text-anchor="middle" font-size="10" font-weight="800" fill="#8A6A2E">같은 시각</text>
    ${tinyMan(150, 92, 10)}
    <ellipse cx="150" cy="142" rx="16" ry="2.6" fill="#2A3A5E" opacity=".08"/>
    <rect x="14" y="82" width="86" height="34" rx="10" fill="#E8F3FB" stroke="#2E8AC0" stroke-width="1.5"/>
    <text x="57" y="96" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1E5A82">반주 담당의 역할</text>
    <text x="57" y="109" text-anchor="middle" font-size="9" fill="#4E6E86">마지막 연습 이끌기</text>
    <rect x="200" y="82" width="86" height="34" rx="10" fill="#FBF3E2" stroke="#C0871C" stroke-width="1.5"/>
    <text x="243" y="96" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8A5E10">손주의 역할</text>
    <text x="243" y="109" text-anchor="middle" font-size="9" fill="#8A7246">칠순 잔치 축하하기</text>
    <path d="M104 99l30 0" stroke="#2E8AC0" stroke-width="2" stroke-dasharray="4 4" marker-end="none"/>
    <path d="M132 95l6 4-6 4" stroke="#2E8AC0" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M196 99l-30 0" stroke="#C0871C" stroke-width="2" stroke-dasharray="4 4"/>
    <path d="M168 95l-6 4 6 4" stroke="#C0871C" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return shell(300, 152, inner, "같은 시각, 한 사람을 양쪽에서 부르는 두 역할 — 반주 담당의 역할과 손주의 역할이 화살표로 당기는 모습");
}

/* ---------- L6: 차이 vs 차별 두 장면(퀴즈 그림 — (가)(나)) ---------- */
export function diffDiscFig(): string {
  const inner = `
    <line x1="150" y1="14" x2="150" y2="152" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    <text x="76" y="30" text-anchor="middle" font-size="11.5" font-weight="900" fill="#39455C">(가)</text>
    <text x="224" y="30" text-anchor="middle" font-size="11.5" font-weight="900" fill="#39455C">(나)</text>
    ${tinyMan(52, 62, 8)}
    ${tinyMan(100, 66, 6.6)}
    <ellipse cx="52" cy="102" rx="12" ry="2.2" fill="#2A3A5E" opacity=".08"/>
    <ellipse cx="100" cy="100" rx="10" ry="2.2" fill="#2A3A5E" opacity=".08"/>
    <path d="M60 44q8-8 16-2M92 50q6-6 12-1" stroke="#8FB88F" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0"/>
    <text x="76" y="128" text-anchor="middle" font-size="9.6" fill="#5A7A5E">키도 좋아하는 것도 서로 달라요</text>
    <text x="76" y="141" text-anchor="middle" font-size="9.6" font-weight="800" fill="#2E7E46">— 함께 어울려요</text>
    <rect x="248" y="42" width="34" height="66" rx="4" fill="#EDE4D4" stroke="#B49A6E" stroke-width="1.6"/>
    <circle cx="254" cy="76" r="2" fill="#8A7246"/>
    ${tinyMan(210, 64, 8, "sad")}
    <ellipse cx="210" cy="104" rx="12" ry="2.2" fill="#2A3A5E" opacity=".08"/>
    <path d="M236 60l-8 8M228 60l8 8" stroke="#C0392E" stroke-width="2.4" stroke-linecap="round"/>
    <text x="224" y="128" text-anchor="middle" font-size="9.6" fill="#8A5A5A">다르다는 이유로 못 들어가게 해요</text>
    <text x="224" y="141" text-anchor="middle" font-size="9.6" font-weight="800" fill="#B03030">— 부당한 대우</text>`;
  return shell(300, 156, inner, "두 장면 비교 — 가는 서로 다른 두 사람이 어울리는 모습, 나는 다르다는 이유로 문 앞에서 거절당하는 모습");
}

/* ---------- L3: 자아 정체성 마인드맵(미래엔 134쪽 활동 계승 — 퀴즈 그림) ---------- */
export function idMapFig(): string {
  const leaf = (x: number, y: number, w: number, label: string, c: string): string => `
    <rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="#FFFFFF" stroke="${c}" stroke-width="1.6"/>
    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10" font-weight="800" fill="#39455C">${label}</text>`;
  const inner = `
    <path d="M150 76l-78-26M150 76l78-26M150 86l-78 32M150 86l78 32" stroke="#C9D2E0" stroke-width="1.6"/>
    <circle cx="150" cy="80" r="26" fill="#F3E9FA" stroke="#862E9C" stroke-width="2"/>
    <text x="150" y="77" text-anchor="middle" font-size="12" font-weight="900" fill="#4A1458">나는 어떤</text>
    <text x="150" y="91" text-anchor="middle" font-size="12" font-weight="900" fill="#4A1458">사람일까?</text>
    ${leaf(64, 44, 84, "나의 성격", "#5FA8E8")}
    ${leaf(236, 44, 96, "내가 잘하는 것", "#4CB878")}
    ${leaf(60, 124, 104, "소중하게 여기는 것", "#E8940A")}
    ${leaf(238, 124, 100, "내가 바라는 모습", "#C08ADC")}`;
  return shell(300, 152, inner, "가운데 '나는 어떤 사람일까' 물음에서 네 갈래로 뻗은 마인드맵 — 성격, 잘하는 것, 소중한 것, 바라는 모습");
}

/* ---------- L7: 대처의 두 차원(퀴즈·정리 그림) ---------- */
export function civicFig(): string {
  const inner = `
    <rect x="14" y="18" width="130" height="126" rx="12" fill="#F2F9F3" stroke="#7EC098" stroke-width="1.5"/>
    <text x="79" y="38" text-anchor="middle" font-size="11.5" font-weight="900" fill="#1E7E46">개인적 차원</text>
    <circle cx="44" cy="64" r="12" fill="#FFFFFF" stroke="#4CB878" stroke-width="1.8"/>
    <path d="M38 64q3-6 6-1 3-5 6 1-3 6-6 7-3-1-6-7z" fill="#4CB878" opacity=".9"/>
    <text x="66" y="61" font-size="9.6" fill="#39455C">다양성을</text>
    <text x="66" y="72" font-size="9.6" fill="#39455C">존중하기</text>
    <circle cx="44" cy="98" r="12" fill="#FFFFFF" stroke="#4CB878" stroke-width="1.8"/>
    <path d="M37 95q7-5 14 0M37 101q7 5 14 0" stroke="#4CB878" stroke-width="1.7" fill="none" stroke-linecap="round"/>
    <text x="66" y="95" font-size="9.6" fill="#39455C">편견·고정 관념</text>
    <text x="66" y="106" font-size="9.6" fill="#39455C">버리기</text>
    <text x="30" y="132" font-size="9.6" fill="#39455C">차별을 보면 함께 나서기</text>
    <rect x="156" y="18" width="130" height="126" rx="12" fill="#F1F6FC" stroke="#7EA8DC" stroke-width="1.5"/>
    <text x="221" y="38" text-anchor="middle" font-size="11.5" font-weight="900" fill="#2E5EA8">사회적 차원</text>
    <circle cx="186" cy="64" r="12" fill="#FFFFFF" stroke="#5E8FC8" stroke-width="1.8"/>
    <path d="M186 55v14M180 60h12M181 60l-3 6h6zM191 60l-3 6h6zM182 72h8" stroke="#5E8FC8" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <text x="208" y="61" font-size="9.6" fill="#39455C">차별을 막는</text>
    <text x="208" y="72" font-size="9.6" fill="#39455C">법과 제도</text>
    <circle cx="186" cy="98" r="12" fill="#FFFFFF" stroke="#5E8FC8" stroke-width="1.8"/>
    <path d="M178 103l8-9 8 9zM186 94v-4" stroke="#5E8FC8" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="208" y="95" font-size="9.6" fill="#39455C">모두를 위한</text>
    <text x="208" y="106" font-size="9.6" fill="#39455C">시설·디자인</text>
    <text x="172" y="132" font-size="9.6" fill="#39455C">함께 겪는 문제는 제도 개선</text>`;
  return shell(300, 158, inner, "차별에 대처하는 두 차원 — 개인적 차원의 마음가짐과 사회적 차원의 법·제도");
}

/* ---------- recap 미니아트(64×64 플랫 — 전 카드 필수) ---------- */
const M = (body: string): string =>
  `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

export function soc7MiniArt(key: string): string {
  switch (key) {
    /* ── L1 사회화 ── */
    case "social": // 아기 → 어른 성장 화살표
      return M(
        `<circle cx="18" cy="34" r="7" fill="#F2C24E"/>
        <path d="M18 41v9M18 44l-5 4M18 44l5 4" stroke="#8A6A2E" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M28 32h12" stroke="#8FA2C4" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M37 28l5 4-5 4" stroke="#8FA2C4" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="50" cy="22" r="6" fill="#862E9C"/>
        <path d="M50 28v14M50 32l-6 5M50 32l6 5M50 42l-5 9M50 42l5 9" stroke="#4A1458" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    case "twins": // 쌍둥이 두 얼굴 — 같은 얼굴, 다른 말풍선
      return M(
        `<circle cx="22" cy="34" r="10" fill="#F2C24E"/>
        <circle cx="42" cy="34" r="10" fill="#F2C24E"/>
        <circle cx="19" cy="32" r="1.4" fill="#5A3E10"/><circle cx="25" cy="32" r="1.4" fill="#5A3E10"/>
        <circle cx="39" cy="32" r="1.4" fill="#5A3E10"/><circle cx="45" cy="32" r="1.4" fill="#5A3E10"/>
        <path d="M19 38q3 2.4 6 0M39 38q3 2.4 6 0" stroke="#5A3E10" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        <rect x="8" y="10" width="16" height="10" rx="5" fill="#E8590C"/>
        <rect x="40" y="10" width="16" height="10" rx="5" fill="#2E8AC0"/>`,
      );
    case "socfunc": // 문화를 다음 세대로 — 건네는 두 손과 상자
      return M(
        `<rect x="24" y="24" width="16" height="14" rx="3.5" fill="#C08ADC"/>
        <path d="M24 30h16M32 24v14" stroke="#6E2E86" stroke-width="1.8"/>
        <path d="M8 40q8-8 16-6M56 40q-8-8-16-6" stroke="#8FA2C4" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <circle cx="10" cy="46" r="5" fill="#F2C24E"/><circle cx="54" cy="46" r="5" fill="#5FA8E8"/>`,
      );
    /* ── L2 사회화 기관 ── */
    case "agencies": // 트랙 위 네 개의 문
      return M(
        `<path d="M6 48h52" stroke="#8FA2C4" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M10 48v-10l6-5 6 5v10z" fill="#F2A72E"/>
        <rect x="26" y="34" width="11" height="14" rx="2.5" fill="#4CB878"/>
        <path d="M42 48v-12h12v12z" fill="#5FA8E8"/><path d="M42 36l6-5 6 5" stroke="#2E5EA8" stroke-width="2" fill="none" stroke-linejoin="round"/>
        <circle cx="52" cy="18" r="7" fill="#C08ADC"/><path d="M49 18h6M52 15v6" stroke="#6E2E86" stroke-width="1.6"/>`,
      );
    case "mediaband": // 트랙 전체를 덮는 방송 띠
      return M(
        `<rect x="8" y="26" width="48" height="12" rx="6" fill="#5FA8E8"/>
        <path d="M8 48h48" stroke="#8FA2C4" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="14" cy="48" r="3" fill="#F2C24E"/><circle cx="30" cy="48" r="3" fill="#F2C24E"/><circle cx="46" cy="48" r="3" fill="#F2C24E"/>
        <path d="M20 20q12-8 24 0" stroke="#2E5EA8" stroke-width="2" stroke-linecap="round" fill="none"/>
        <circle cx="32" cy="14" r="2.4" fill="#2E5EA8"/>`,
      );
    case "resocial": // 어른과 새 기기 — 다시 배우기
      return M(
        `<rect x="34" y="16" width="18" height="26" rx="4" fill="#39445C"/>
        <rect x="37" y="20" width="12" height="14" rx="2" fill="#7EC8FF"/>
        <circle cx="43" cy="38" r="1.8" fill="#7EC8FF"/>
        <circle cx="16" cy="24" r="6" fill="#F2C24E"/>
        <path d="M16 30v12M16 34l8-4M16 34l-6 5M16 42l-5 8M16 42l5 8" stroke="#8A6A2E" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M52 10l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#F2C24E"/>`,
      );
    /* ── L3 자아 정체성 ── */
    case "identity": // 거울 속 나
      return M(
        `<rect x="30" y="10" width="26" height="42" rx="9" fill="#D6ECF8" stroke="#5E8FC8" stroke-width="2.4"/>
        <circle cx="43" cy="26" r="5" fill="#5FA8E8"/>
        <path d="M43 31v10M43 34l-5 3M43 34l5 3" stroke="#2E5EA8" stroke-width="2" stroke-linecap="round"/>
        <circle cx="14" cy="28" r="5.4" fill="#F2C24E"/>
        <path d="M14 33v10M14 36l5 3M14 36l-4 4M14 43l-4 8M14 43l4 8" stroke="#8A6A2E" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    case "idbuild": // 여러 화살표가 모여 만드는 나
      return M(
        `<circle cx="32" cy="34" r="9" fill="#C08ADC"/>
        <path d="M32 30v8M28 34h8" stroke="#6E2E86" stroke-width="0" />
        <path d="M10 14l12 12M54 14l-12 12M10 54l12-12M54 54l-12-12" stroke="#8FA2C4" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="10" cy="12" r="4" fill="#F2A72E"/><circle cx="54" cy="12" r="4" fill="#4CB878"/>
        <circle cx="10" cy="56" r="4" fill="#5FA8E8"/><circle cx="54" cy="56" r="4" fill="#E2574C"/>`,
      );
    case "mediaeye": // 화면을 가려 보는 눈 — 비판적 수용
      return M(
        `<rect x="12" y="14" width="40" height="26" rx="5" fill="#39445C"/>
        <rect x="16" y="18" width="32" height="18" rx="3" fill="#7EC8FF"/>
        <path d="M20 50q12-10 24 0" stroke="#39455C" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <circle cx="32" cy="48" r="4.6" fill="#FFFFFF" stroke="#39455C" stroke-width="2"/>
        <circle cx="32" cy="48" r="1.8" fill="#39455C"/>`,
      );
    /* ── L4 지위·역할 ── */
    case "statustags": // 두 색 이름표
      return M(
        `<rect x="8" y="16" width="24" height="16" rx="5" fill="#FBF3E2" stroke="#C0871C" stroke-width="2.4"/>
        <circle cx="15" cy="24" r="2.4" fill="none" stroke="#C0871C" stroke-width="1.6"/>
        <rect x="32" y="34" width="24" height="16" rx="5" fill="#E8F3FB" stroke="#2E8AC0" stroke-width="2.4"/>
        <circle cx="39" cy="42" r="2.4" fill="none" stroke="#2E8AC0" stroke-width="1.6"/>
        <path d="M18 34l10 8" stroke="#8FA2C4" stroke-width="1.8" stroke-dasharray="3 3"/>`,
      );
    case "rolescript": // 역할 = 기대 악보, 역할 행동 = 연주
      return M(
        `<rect x="10" y="12" width="26" height="32" rx="4" fill="#FFFFFF" stroke="#8FA2C4" stroke-width="2.2"/>
        <path d="M15 20h16M15 26h16M15 32h10" stroke="#B9C6DC" stroke-width="2" stroke-linecap="round"/>
        <circle cx="46" cy="38" r="6" fill="#F2C24E"/>
        <path d="M46 44v9M46 46l-5 4M46 46l6 2M46 53l-4 7M46 53l4 7" stroke="#8A6A2E" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M50 24q4-3 6 1t-4 5q-4-1-2-6z" fill="#E2574C"/>`,
      );
    case "prizefine": // 보상(별)과 제재(빗금 카드)
      return M(
        `<path d="M20 12l3.4 7 7.6 1.1-5.5 5.4 1.3 7.6-6.8-3.6-6.8 3.6 1.3-7.6-5.5-5.4 7.6-1.1z" fill="#F2C24E" stroke="#C08A1E" stroke-width="1.6" stroke-linejoin="round"/>
        <rect x="36" y="34" width="20" height="16" rx="4" fill="#FDEEEF" stroke="#E2574C" stroke-width="2.2"/>
        <path d="M40 38l12 8M52 38l-12 8" stroke="#E2574C" stroke-width="2"/>`,
      );
    /* ── L5 역할 갈등 ── */
    case "clash": // 한 점을 양쪽에서 당기는 두 화살표
      return M(
        `<circle cx="32" cy="32" r="7" fill="#F2C24E"/>
        <path d="M25 32H8M39 32h17" stroke="#8FA2C4" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M13 27l-5 5 5 5M51 27l5 5-5 5" stroke="#8FA2C4" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="8" cy="18" r="5" fill="#5FA8E8"/><circle cx="56" cy="18" r="5" fill="#E8940A"/>
        <path d="M28 46q4 3 8 0" stroke="#8A6A2E" stroke-width="0"/>`,
      );
    case "priority": // 우선순위 — 번호 계단
      return M(
        `<rect x="8" y="38" width="14" height="16" rx="3.5" fill="#5FA8E8"/>
        <rect x="25" y="28" width="14" height="26" rx="3.5" fill="#4CB878"/>
        <rect x="42" y="16" width="14" height="38" rx="3.5" fill="#C08ADC"/>
        <circle cx="49" cy="10" r="4" fill="#F2C24E"/>`,
      );
    case "institution": // 제도 — 받쳐 주는 지붕
      return M(
        `<path d="M10 26l22-12 22 12" stroke="#5E8FC8" stroke-width="3" fill="none" stroke-linejoin="round"/>
        <path d="M16 30v18M32 30v18M48 30v18" stroke="#8FA2C4" stroke-width="3" stroke-linecap="round"/>
        <path d="M10 52h44" stroke="#5E8FC8" stroke-width="3" stroke-linecap="round"/>
        <circle cx="24" cy="42" r="3.4" fill="#F2C24E"/><circle cx="40" cy="42" r="3.4" fill="#F2C24E"/>`,
      );
    /* ── L6 갈등·차이·차별 ── */
    case "tangle": // 엉킨 두 덩굴
      return M(
        `<rect x="29" y="10" width="6" height="46" rx="3" fill="#B98D54"/>
        <path d="M12 54q18-8 16-24t8-18" stroke="#2E8A4C" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M52 54q-18-8-16-24t-8-18" stroke="#6E4FB8" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="32" cy="30" r="6" fill="none" stroke="#39455C" stroke-width="2" stroke-dasharray="3 3"/>`,
      );
    case "diffline": // 차이(=)와 차별(≠)을 가르는 기준선
      return M(
        `<circle cx="18" cy="24" r="7" fill="#5FA8E8"/>
        <circle cx="46" cy="24" r="7" fill="#F2A72E"/>
        <path d="M14 44h36" stroke="#39455C" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M22 52h20" stroke="#39455C" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M8 24h4M52 24h4" stroke="#8FA2C4" stroke-width="0"/>`,
      );
    case "blindglasses": // 편견의 색안경 — 벗어 두기
      return M(
        `<circle cx="20" cy="30" r="9" fill="rgba(94,110,140,.4)" stroke="#5E6E8C" stroke-width="2.4"/>
        <circle cx="44" cy="30" r="9" fill="rgba(94,110,140,.4)" stroke="#5E6E8C" stroke-width="2.4"/>
        <path d="M29 30h6M11 30l-5-4M53 30l5-4" stroke="#5E6E8C" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M14 48l8 6 14-12" stroke="#4CB878" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    /* ── L7 대처하는 시민 ── */
    case "yield": // 양보·타협 — 맞잡은 두 손
      return M(
        `<path d="M8 34q10-10 20-4M56 34q-10-10-20-4" stroke="#8FA2C4" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <rect x="24" y="26" width="16" height="12" rx="6" fill="#F2C24E" stroke="#C08A1E" stroke-width="1.8"/>
        <circle cx="10" cy="42" r="5.4" fill="#5FA8E8"/><circle cx="54" cy="42" r="5.4" fill="#4CB878"/>
        <path d="M26 14l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#F2A72E" opacity=".9"/>`,
      );
    case "openmind": // 열린 마음 — 하트와 여는 문
      return M(
        `<path d="M32 50q-16-10-16-22 0-8 8-8 5 0 8 5 3-5 8-5 8 0 8 8 0 12-16 22z" fill="#E86E8A" stroke="#B04058" stroke-width="2"/>
        <path d="M12 14h12v10" stroke="#8FA2C4" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "lawshield": // 법의 방패
      return M(
        `<path d="M32 8l20 7v14q0 18-20 27-20-9-20-27V15z" fill="#5E8FC8" stroke="#2E5EA8" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M32 20v14M25 26h14M26 26l-3 6h6zM38 26l-3 6h6z" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      );
    default:
      return M(`<circle cx="32" cy="32" r="14" fill="#C9D2E0"/>`);
  }
}
