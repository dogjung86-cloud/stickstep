// 힘의 작용 단원(V) 퀴즈·개념 그림 — 손코딩 교육용 SVG.
// 색이 정답의 단서가 되지 않게 설계. 라이트 그림(흰 카드 위) 기준.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 힘의 3요소 화살표 — ㉠ 시작점 ㉡ 길이 ㉢ 화살촉 (라이트) */
export function arrow3Fig(): string {
  return `<svg viewBox="0 0 344 170" ${NS} role="img" aria-label="블록에 작용하는 힘을 나타낸 화살표와 세 요소 라벨">
    <rect x="36" y="96" width="64" height="48" rx="8" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
    <path d="M48 108h40M48 120h36M48 132h40" stroke="#D5DBE3" stroke-width="2"/>
    <!-- 화살표: 블록 표면에서 우상향 -->
    <path d="M100 108 L232 52" stroke="#F04452" stroke-width="5" stroke-linecap="round"/>
    <path d="M252 44l-26 2 8 18z" fill="#F04452"/>
    <circle cx="100" cy="108" r="6.5" fill="#fff" stroke="#F04452" stroke-width="3.4"/>
    <!-- 길이 보조 점선 -->
    <path d="M104 122 L242 63" stroke="#B0B8C1" stroke-width="1.6" stroke-dasharray="5 5"/>
    <!-- 라벨 -->
    <text x="76" y="86" font-size="14" font-weight="700" fill="#4E5968">㉠</text>
    <path d="M84 90l12 12" stroke="#B0B8C1" stroke-width="1.4"/>
    <text x="168" y="118" font-size="14" font-weight="700" fill="#4E5968">㉡</text>
    <path d="M172 104l-1 -8" stroke="#B0B8C1" stroke-width="1.4"/>
    <text x="258" y="30" font-size="14" font-weight="700" fill="#4E5968">㉢</text>
    <path d="M256 34l-10 12" stroke="#B0B8C1" stroke-width="1.4"/>
  </svg>`;
}

/** 합력 계산 — (가) 같은 방향 2N+3N, (나) 반대 방향 2N·3N (라이트) */
export function netForceFig(): string {
  const block = (bx: number, label: string): string =>
    `<rect x="${bx}" y="60" width="58" height="44" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
     <text x="${bx + 29}" y="140" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 150" ${NS} role="img" aria-label="나무토막 두 개에 작용하는 힘 화살표: 가는 같은 방향 2N과 3N, 나는 반대 방향 2N과 3N">
    ${block(52, "(가)")}
    <path d="M110 72h44" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
    <path d="M162 72l-12-7v14z" fill="#5E6B7E"/>
    <text x="128" y="62" font-size="12" font-weight="700" fill="#4E5968">3 N</text>
    <path d="M110 94h30" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
    <path d="M148 94l-12-7v14z" fill="#5E6B7E"/>
    <text x="120" y="118" font-size="12" font-weight="700" fill="#4E5968">2 N</text>
    ${block(234, "(나)")}
    <path d="M292 72h44" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
    <path d="M344 72l-12-7v14z" fill="#5E6B7E"/>
    <text x="306" y="62" font-size="12" font-weight="700" fill="#4E5968">3 N</text>
    <path d="M234 94h-30" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
    <path d="M196 94l12-7v14z" fill="#5E6B7E"/>
    <text x="204" y="118" font-size="12" font-weight="700" fill="#4E5968">2 N</text>
  </svg>`;
}

/** 중력 방향 고르기 — 지구 위 (가)(나) 두 물체와 A~D 화살표 (라이트) */
export function gravityDirFig(): string {
  return `<svg viewBox="0 0 344 210" ${NS} role="img" aria-label="지구 주위 두 물체에서 뻗은 화살표 후보들">
    <circle cx="172" cy="120" r="62" fill="#EAF2FD" stroke="#8FB3E8" stroke-width="2.4"/>
    <ellipse cx="152" cy="104" rx="22" ry="14" fill="#CBE4D2"/>
    <ellipse cx="192" cy="140" rx="16" ry="10" fill="#CBE4D2"/>
    <circle cx="172" cy="120" r="3" fill="#4E5968"/>
    <text x="172" y="106" text-anchor="middle" font-size="10.5" fill="#8B95A1">지구 중심</text>
    <!-- (가) 위쪽 물체 -->
    <rect x="162" y="18" width="20" height="20" rx="5" fill="#fff" stroke="#5E6B7E" stroke-width="2.4"/>
    <text x="140" y="34" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    <path d="M172 14v-8" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M172 2l-5 8h10z" fill="#5E6B7E"/>
    <text x="182" y="10" font-size="12" font-weight="700" fill="#4E5968">A</text>
    <path d="M186 34h12" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M204 34l-8-5v10z" fill="#5E6B7E"/>
    <text x="206" y="26" font-size="12" font-weight="700" fill="#4E5968">B</text>
    <path d="M172 42v10" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M172 58l-5-8h10z" fill="#5E6B7E"/>
    <text x="180" y="58" font-size="12" font-weight="700" fill="#4E5968">C</text>
    <!-- (나) 오른쪽 물체 -->
    <rect x="296" y="110" width="20" height="20" rx="5" fill="#fff" stroke="#5E6B7E" stroke-width="2.4"/>
    <text x="322" y="126" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
    <path d="M292 120h-10" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M276 120l8-5v10z" fill="#5E6B7E"/>
    <text x="272" y="112" font-size="12" font-weight="700" fill="#4E5968">D</text>
    <path d="M306 134v10" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M306 150l-5-8h10z" fill="#5E6B7E"/>
    <text x="314" y="150" font-size="12" font-weight="700" fill="#4E5968">E</text>
    <path d="M320 106l8-8" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M332 94l-10 2 5 8z" fill="#5E6B7E"/>
    <text x="330" y="112" font-size="12" font-weight="700" fill="#4E5968">F</text>
  </svg>`;
}

/** 용수철 탄성력 그래프 — 늘어난 길이∝힘 (교과서 V-9 수치, 라이트) */
export function springGraphFig(): string {
  const gx = (cm: number): number => 48 + cm * 20;
  const gy = (n: number): number => 168 - (n / 5) * 132;
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="용수철이 늘어난 길이에 따른 탄성력 그래프. 원점을 지나는 직선">
    <line x1="48" y1="24" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="316" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[1.5, 3.0, 4.5].map((n) => `<line x1="48" y1="${gy(n)}" x2="316" y2="${gy(n)}" stroke="#EDF0F4" stroke-width="1"/><text x="40" y="${gy(n) + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">${n.toFixed(1)}</text>`).join("")}
    ${[4, 8, 12].map((cm) => `<line x1="${gx(cm)}" y1="168" x2="${gx(cm)}" y2="24" stroke="#EDF0F4" stroke-width="1"/><text x="${gx(cm)}" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">${cm}</text>`).join("")}
    <line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(13)}" y2="${gy(13 * 0.375)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${[[4, 1.5], [8, 3.0], [12, 4.5]].map(([cm, n]) => `<circle cx="${gx(cm)}" cy="${gy(n)}" r="4" fill="#5E6B7E"/>`).join("")}
    <text x="10" y="16" font-size="11" fill="#4E5968">탄성력(N)</text>
    <text x="316" y="198" text-anchor="end" font-size="11" fill="#4E5968">늘어난 길이(cm)</text>
  </svg>`;
}

/** 책상 위 책에 작용하는 두 힘 (V-18, 라이트) */
export function bookForcesFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} role="img" aria-label="책상 위에 놓인 책과 위아래 두 힘 화살표">
    <!-- 책상 -->
    <rect x="60" y="116" width="224" height="12" rx="5" fill="#D9C1A0" stroke="#B08D5E" stroke-width="2"/>
    <path d="M84 128v42M260 128v42" stroke="#B08D5E" stroke-width="6" stroke-linecap="round"/>
    <!-- 책 -->
    <rect x="136" y="92" width="72" height="22" rx="4" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M140 98h64M140 106h60" stroke="#C9D2DC" stroke-width="2"/>
    <circle cx="172" cy="103" r="3.4" fill="#4E5968"/>
    <!-- 힘 화살표 -->
    <path d="M172 88V44" stroke="#5E6B7E" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M172 34l-7 12h14z" fill="#5E6B7E"/>
    <text x="184" y="52" font-size="13" font-weight="700" fill="#4E5968">㉠ 책상 면이 떠받치는 힘</text>
    <path d="M172 118v44" stroke="#5E6B7E" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M172 172l-7-12h14z" fill="#5E6B7E"/>
    <text x="184" y="160" font-size="13" font-weight="700" fill="#4E5968">㉡ 중력</text>
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
const MINI: Record<string, string> = {
  forceDef: `<circle cx="24" cy="38" r="11" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.6"/>
    <circle cx="21" cy="34" r="3" fill="#fff"/>
    <path d="M36 30l16-10" stroke="#F04452" stroke-width="3.6"/><path d="M56 16l-9 2 4 8z" fill="#F04452"/>
    <path d="M14 52q10 6 20 0" stroke="#9EC5FB" stroke-width="2.4" fill="none"/>`,
  arrow3: `<circle cx="16" cy="48" r="4.5" fill="#fff" stroke="#F04452" stroke-width="3"/>
    <path d="M20 44L44 22" stroke="#F04452" stroke-width="3.8"/><path d="M52 14l-11 3 6 9z" fill="#F04452"/>
    <path d="M22 52l22-20" stroke="#C4CAD2" stroke-width="1.8" stroke-dasharray="3 4"/>`,
  netArt: `<path d="M8 24h20" stroke="#37C08E" stroke-width="3.4"/><path d="M32 24l-8-5v10z" fill="#37C08E"/>
    <path d="M8 36h30" stroke="#4EA3F5" stroke-width="3.4"/><path d="M42 36l-8-5v10z" fill="#4EA3F5"/>
    <path d="M8 50h44" stroke="#F04452" stroke-width="4"/><path d="M58 50l-9-6v12z" fill="#F04452"/>`,
  balanceArt: `<rect x="22" y="24" width="20" height="18" rx="4" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M20 33H6" stroke="#F04452" stroke-width="3.4"/><path d="M4 33l9-5v10z" fill="#F04452"/>
    <path d="M44 33h14" stroke="#F04452" stroke-width="3.4"/><path d="M60 33l-9-5v10z" fill="#F04452"/>
    <path d="M14 52h36" stroke="#C4CAD2" stroke-width="2.2"/><text x="32" y="62" text-anchor="middle" font-size="9" font-weight="700" fill="#8B95A1">0</text>`,
  gravityArt: `<circle cx="32" cy="40" r="15" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.4"/>
    <ellipse cx="27" cy="36" rx="6" ry="4" fill="#B8E0C4"/>
    <circle cx="32" cy="40" r="2" fill="#4E5968"/>
    <circle cx="46" cy="12" r="4" fill="#F0564C"/>
    <path d="M44 18l-8 14" stroke="#F04452" stroke-width="2.6"/><path d="M34 36l7-3-4-7z" fill="#F04452"/>`,
  weightArt: `<path d="M32 6v8" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M26 16h12l-2 22h-8z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M32 38v6" stroke="#8B95A1" stroke-width="2.4"/>
    <rect x="24" y="44" width="16" height="12" rx="3" fill="#FFD98A" stroke="#E8961E" stroke-width="2.2"/>
    <path d="M29 24h6" stroke="#F04452" stroke-width="2.4"/>`,
  massArt: `<path d="M32 12v10" stroke="#8B95A1" stroke-width="2.6"/><path d="M12 22h40" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M12 22l-6 12h12zM52 22l-6 12h12z" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2"/>
    <path d="M22 50h20" stroke="#8B95A1" stroke-width="2.6"/><path d="M26 50l6-8 6 8" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2"/>`,
  springArt: `<path d="M8 32h6l5-8 6 16 6-16 6 16 6-16 5 8h8" stroke="#8CA0BC" stroke-width="3" fill="none"/>
    <circle cx="58" cy="32" r="4" fill="none" stroke="#F0A422" stroke-width="2.6"/>`,
  elasticDir: `<path d="M10 24h22" stroke="#4EA3F5" stroke-width="3.4"/><path d="M36 24l-8-5v10z" fill="#4EA3F5"/>
    <path d="M54 40H32" stroke="#F04452" stroke-width="3.4"/><path d="M28 40l9-5v10z" fill="#F04452"/>
    <path d="M12 52q6 4 12 0t12 0 12 0" stroke="#C4CAD2" stroke-width="2.2" fill="none"/>`,
  frictionArt: `<rect x="18" y="22" width="28" height="20" rx="4" fill="#E8C06A" stroke="#B08D3E" stroke-width="2.2"/>
    <path d="M46 30h12" stroke="#4EA3F5" stroke-width="3"/><path d="M62 30l-8-5v10z" fill="#4EA3F5"/>
    <path d="M18 48H6" stroke="#F04452" stroke-width="3"/><path d="M4 48l9-5v10z" fill="#F04452"/>
    <path d="M8 44h48" stroke="#8B95A1" stroke-width="2.4"/>`,
  roughArt: `<path d="M6 40l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6" stroke="#B0764A" stroke-width="3" fill="none"/>
    <rect x="22" y="16" width="20" height="14" rx="3" fill="#E8C06A" stroke="#B08D3E" stroke-width="2"/>
    <path d="M10 54h44" stroke="#D5DBE3" stroke-width="2.4"/>`,
  buoyArt: `<path d="M8 34q8-6 16 0t16 0 16 0" stroke="#5AA2F8" stroke-width="2.6" fill="none"/>
    <rect x="24" y="26" width="16" height="14" rx="4" fill="#EAF6FF" stroke="#8FB3D6" stroke-width="2.2"/>
    <path d="M32 22V8" stroke="#F04452" stroke-width="3.4"/><path d="M32 4l-6 9h12z" fill="#F04452"/>
    <path d="M12 48h40M18 56h28" stroke="#9EC5FB" stroke-width="2.2" opacity=".7"/>`,
  volumeUp: `<path d="M6 26q8-5 14 0t14 0 14 0 10 0" stroke="#5AA2F8" stroke-width="2.4" fill="none"/>
    <rect x="12" y="30" width="14" height="12" rx="3" fill="#EAF6FF" stroke="#8FB3D6" stroke-width="2"/>
    <rect x="36" y="28" width="22" height="20" rx="4" fill="#EAF6FF" stroke="#8FB3D6" stroke-width="2.2"/>
    <path d="M19 52v6M47 52v10" stroke="#F04452" stroke-width="2.8"/>
    <path d="M19 46l-4 7h8zM47 44l-5 9h10z" fill="#F04452"/>`,
  motionArt: `<circle cx="18" cy="40" r="8" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.4"/>
    <path d="M28 40h10" stroke="#37C08E" stroke-width="2.8"/><path d="M42 40l-7-4v8z" fill="#37C08E"/>
    <path d="M34 22l10 8" stroke="#F04452" stroke-width="2.8"/><path d="M48 33l-4-9-6 7z" fill="#F04452"/>
    <path d="M46 52q6-2 10-8" stroke="#C4CAD2" stroke-width="2.2" stroke-dasharray="3 4" fill="none"/>`,
  bookArt: `<rect x="16" y="30" width="32" height="12" rx="3" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M32 26V12" stroke="#F04452" stroke-width="3"/><path d="M32 8l-6 9h12z" fill="#F04452"/>
    <path d="M32 46v14" stroke="#4EA3F5" stroke-width="3"/><path d="M32 64l-6-9h12z" fill="#4EA3F5"/>
    <path d="M10 46h44" stroke="#C4CAD2" stroke-width="2.4"/>`,
};

export function miniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
