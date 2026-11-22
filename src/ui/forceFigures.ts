// 힘의 작용 단원(V) 퀴즈·개념 그림. 손코딩 교육용 SVG.
// 색이 정답의 단서가 되지 않게 설계. 라이트 그림(흰 카드 위) 기준.
// 화살표의 약속(단원 전체, 2026-11-15 그래픽 손질): 시작점 = 작용점(물체에 닿은 자리나 물체 가운데), 길이 = 값에 비례.
// 정리 미니아트의 색은 랩과 정리 그림(qa/scifig-g1)의 약속을 따른다: 가한 힘 파랑, 중력과 방해하는 힘과 되당기는 힘 빨강,
// 떠받치는 힘과 부력과 합친 힘 초록(흰 카드 위라 정리 그림과 같은 짙은 색). 그림 속 글자는 12px 이상, 흰 테.

const NS = `xmlns="http://www.w3.org/2000/svg"`;
const C_PUSH = "#1C7ED6";
const C_BACK = "#E03131";
const C_UP = "#2B8A3E";
const C_AMBER = "#E8890C"; // 두 번째 사람의 힘(랩의 '나'와 같은 주황 계열)

/** 흰 테를 두른 힘 화살표(미니아트와 문제 그림). 시작점 (x1, y1)에서 촉 끝 (x2, y2)까지, w는 몸통 굵기, hd는 촉 길이. */
function arw(x1: number, y1: number, x2: number, y2: number, color: string, w = 3.2, hd = 8, halo = 2.2): string {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const bx = x2 - ux * (hd - 1);
  const by = y2 - uy * (hd - 1);
  const hb = hd * 0.55;
  const p = (x: number, y: number): string => `${x.toFixed(2)} ${y.toFixed(2)}`;
  const head = `M${p(x2, y2)} L${p(x2 - ux * hd - uy * hb, y2 - uy * hd + ux * hb)} L${p(x2 - ux * hd + uy * hb, y2 - uy * hd - ux * hb)} Z`;
  return (
    (halo ? `<path d="M${p(x1, y1)} L${p(bx, by)}" stroke="#fff" stroke-width="${w + halo * 2}" stroke-linecap="round"/><path d="${head}" fill="#fff" stroke="#fff" stroke-width="${halo * 2}" stroke-linejoin="round"/>` : "") +
    `<path d="M${p(x1, y1)} L${p(bx, by)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/><path d="${head}" fill="${color}"/>`
  );
}

/** 힘의 3요소 화살표: ㉠ 시작점 ㉡ 길이 ㉢ 화살촉 (라이트). 나무 도막에 작용하는 가한 힘(파랑) */
export function arrow3Fig(): string {
  return `<svg viewBox="0 0 344 170" ${NS} role="img" aria-label="나무 도막에 작용하는 힘을 나타낸 화살표와 세 요소 라벨">
    <defs>
      <linearGradient id="a3wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0CF9C"/><stop offset=".55" stop-color="#D9A86A"/><stop offset="1" stop-color="#BD8749"/></linearGradient>
    </defs>
    <ellipse cx="68" cy="146" rx="40" ry="4.5" fill="#2A3A5E" opacity=".12"/>
    <rect x="36" y="96" width="64" height="48" rx="5" fill="url(#a3wood)" stroke="#8A5A2B" stroke-width="1.6"/>
    <path d="M41 108c9-3 18 2 27 0s17-3 27 0M41 121c10 2 19-3 29-1s15 3 25 0M41 134c8-2 17 2 26 0s19-2 28 1" stroke="#A8743E" stroke-width="1.3" fill="none" opacity=".75"/>
    <path d="M40 99.5h56" stroke="#FFF1D6" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
    <!-- 화살표: 도막 표면(작용점)에서 우상향 -->
    <path d="M100 108 L232 52" stroke="${C_PUSH}" stroke-width="5" stroke-linecap="round"/>
    <path d="M252 44l-26 2 8 18z" fill="${C_PUSH}"/>
    <circle cx="100" cy="108" r="6.5" fill="#fff" stroke="${C_PUSH}" stroke-width="3.4"/>
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

/** 합력 계산: (가) 같은 방향 4N+2N, (나) 반대 방향 4N·2N (라이트, 화살표 길이 2:1).
 *  두 힘은 토막에 닿은 면에서 시작한다. (나)의 두 힘은 토막 가운데 높이의 한 직선 위(돌지 않는 배치), (가)는 가운데 줄을 사이에 두고 위아래 대칭. */
export function netForceFig(): string {
  const block = (bx: number, label: string): string =>
    `<rect x="${bx}" y="60" width="58" height="44" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
     <text x="${bx + 29}" y="140" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 150" ${NS} role="img" aria-label="나무토막 두 개에 작용하는 힘 화살표: 가는 같은 방향 4N과 2N, 나는 반대 방향 4N과 2N">
    ${block(52, "(가)")}
    <path d="M110 71h44" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
    <path d="M162 71l-12-7v14z" fill="#5E6B7E"/>
    <text x="128" y="58" font-size="12" font-weight="700" fill="#4E5968">4 N</text>
    <path d="M110 93h18" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
    <path d="M136 93l-12-7v14z" fill="#5E6B7E"/>
    <text x="112" y="117" font-size="12" font-weight="700" fill="#4E5968">2 N</text>
    ${block(234, "(나)")}
    <path d="M292 82h44" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
    <path d="M344 82l-12-7v14z" fill="#5E6B7E"/>
    <text x="306" y="69" font-size="12" font-weight="700" fill="#4E5968">4 N</text>
    <path d="M234 82h-18" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
    <path d="M208 82l12-7v14z" fill="#5E6B7E"/>
    <text x="212" y="69" font-size="12" font-weight="700" fill="#4E5968">2 N</text>
  </svg>`;
}

/** 순서 놓기 항목의 작은 그림: 모눈(한 칸 1 N) 위 수레에 작용하는 두 힘. a, b는 오른쪽이 +인 값(N).
 *  두 화살표는 수레 가운데에서 위아래 두 줄로 시작한다(같은 쪽이어도 겹치지 않게). 글(text)은 그림 아래에 작게 붙인다. */
export function twoForceItem(a: number, b: number, text: string): string {
  const U = 7;
  const W = 112;
  const H = 23;
  const cx = W / 2;
  let grid = "";
  for (let x = cx - 7 * U; x <= cx + 7 * U + 0.1; x += U) grid += `<path d="M${x} 1V${H - 1}" stroke="#E9ECF0" stroke-width="1"/>`;
  const row = (v: number, y: number): string => (v ? arw(cx, y, cx + v * U, y, "#4E5968", 2.4, 5.5, 1.1) : "");
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ${NS} aria-hidden="true" style="display:block;overflow:visible">${grid}<rect x="${cx - 6}" y="2" width="12" height="${H - 4}" rx="2.5" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.6"/>${row(a, 7.5)}${row(b, 15.5)}<circle cx="${cx}" cy="7.5" r="1.5" fill="#4E5968"/><circle cx="${cx}" cy="15.5" r="1.5" fill="#4E5968"/></svg>`;
  return `<span style="display:flex;flex-direction:column;align-items:center;gap:2px">${svg}<span style="font-size:12.5px;line-height:16px">${text}</span></span>`;
}

/** 중력 방향 고르기: 지구 왼쪽 (가)·아래쪽 (나) 물체와 A~F 화살표 (라이트) */
export function gravityDirFig(): string {
  return `<svg viewBox="0 0 344 210" ${NS} role="img" aria-label="지구 주위 두 물체에서 뻗은 화살표 후보들">
    <circle cx="172" cy="88" r="52" fill="#EAF2FD" stroke="#8FB3E8" stroke-width="2.4"/>
    <ellipse cx="154" cy="72" rx="20" ry="13" fill="#CBE4D2"/>
    <ellipse cx="192" cy="106" rx="14" ry="9" fill="#CBE4D2"/>
    <circle cx="172" cy="88" r="3" fill="#4E5968"/>
    <text x="172" y="75" text-anchor="middle" font-size="12" font-weight="700" fill="#5E6B7E" stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke">지구 중심</text>
    <!-- (가) 왼쪽 물체 -->
    <rect x="30" y="78" width="20" height="20" rx="5" fill="#fff" stroke="#5E6B7E" stroke-width="2.4"/>
    <text x="40" y="136" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    <path d="M26 88h-10" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M10 88l8-5v10z" fill="#5E6B7E"/>
    <text x="8" y="78" font-size="12" font-weight="700" fill="#4E5968">A</text>
    <path d="M54 88h14" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M74 88l-8-5v10z" fill="#5E6B7E"/>
    <text x="58" y="78" font-size="12" font-weight="700" fill="#4E5968">B</text>
    <path d="M40 102v10" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M40 118l-5-8h10z" fill="#5E6B7E"/>
    <text x="48" y="120" font-size="12" font-weight="700" fill="#4E5968">C</text>
    <!-- (나) 아래쪽 물체 -->
    <rect x="162" y="158" width="20" height="20" rx="5" fill="#fff" stroke="#5E6B7E" stroke-width="2.4"/>
    <text x="190" y="174" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
    <path d="M172 154v-6" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M172 142l-5 8h10z" fill="#5E6B7E"/>
    <text x="156" y="152" text-anchor="end" font-size="12" font-weight="700" fill="#4E5968">E</text>
    <path d="M172 182v8" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M172 196l-5-8h10z" fill="#5E6B7E"/>
    <text x="180" y="200" font-size="12" font-weight="700" fill="#4E5968">D</text>
    <path d="M186 154l8-8" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/><path d="M198 142l-10 2 5 8z" fill="#5E6B7E"/>
    <text x="202" y="150" font-size="12" font-weight="700" fill="#4E5968">F</text>
  </svg>`;
}

/** 용수철 탄성력 그래프: 늘어난 길이∝힘 (자체 수치 0.5 N/cm, 라이트) */
export function springGraphFig(): string {
  const gx = (cm: number): number => 48 + cm * 20;
  const gy = (n: number): number => 168 - (n / 7) * 132;
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="용수철이 늘어난 길이에 따른 탄성력 그래프. 원점을 지나는 직선">
    <line x1="48" y1="24" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="316" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[2, 4, 6].map((n) => `<line x1="48" y1="${gy(n)}" x2="316" y2="${gy(n)}" stroke="#EDF0F4" stroke-width="1"/><text x="40" y="${gy(n) + 4.5}" text-anchor="end" font-size="12" font-weight="600" fill="#6B7684">${n}</text>`).join("")}
    ${[4, 8, 12].map((cm) => `<line x1="${gx(cm)}" y1="168" x2="${gx(cm)}" y2="24" stroke="#EDF0F4" stroke-width="1"/><text x="${gx(cm)}" y="184" text-anchor="middle" font-size="12" font-weight="600" fill="#6B7684">${cm}</text>`).join("")}
    <line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(13)}" y2="${gy(13 * 0.5)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${[[4, 2], [8, 4], [12, 6]].map(([cm, n]) => `<circle cx="${gx(cm)}" cy="${gy(n)}" r="4" fill="#5E6B7E"/>`).join("")}
    <text x="10" y="16" font-size="12" font-weight="700" fill="#4E5968">탄성력(N)</text>
    <text x="316" y="197" text-anchor="end" font-size="12" font-weight="700" fill="#4E5968">늘어난 길이(cm)</text>
  </svg>`;
}

/** 책상 위 책에 작용하는 두 힘 (라이트). 두 힘 모두 책 가운데 점(작용점)에서 위아래로, 같은 길이. 책과 책상판 위를 지나는 곳은 흰 테 */
export function bookForcesFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} role="img" aria-label="책상 위에 놓인 책과, 책 가운데 점에서 위아래로 뻗은 두 힘 화살표">
    <!-- 책상 -->
    <rect x="60" y="116" width="224" height="12" rx="5" fill="#D9C1A0" stroke="#B08D5E" stroke-width="2"/>
    <path d="M84 128v42M260 128v42" stroke="#B08D5E" stroke-width="6" stroke-linecap="round"/>
    <!-- 책 -->
    <rect x="136" y="92" width="72" height="22" rx="4" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M140 98h64M140 106h60" stroke="#C9D2DC" stroke-width="2"/>
    <!-- 힘 화살표: 책 가운데 점에서 -->
    ${arw(172, 103, 172, 49, "#5E6B7E", 4.4, 12, 2.4)}
    <text x="184" y="58" font-size="13" font-weight="700" fill="#4E5968">㉠ 책상 면이 떠받치는 힘</text>
    ${arw(172, 103, 172, 157, "#5E6B7E", 4.4, 12, 2.4)}
    <text x="184" y="150" font-size="13" font-weight="700" fill="#4E5968">㉡ 중력</text>
    <circle cx="172" cy="103" r="4.2" fill="#fff" stroke="#4E5968" stroke-width="2.4"/>
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
// 화살표는 물체에서 시작하고(작용점), 색은 랩의 약속(가한 힘 파랑, 중력·방해하는 힘·되당기는 힘 빨강, 떠받치는 힘·부력·합친 힘 초록).
const MINI: Record<string, string> = {
  forceDef: `<circle cx="24" cy="38" r="11" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.6"/>
    <circle cx="21" cy="34" r="3" fill="#fff"/>
    ${arw(33.5, 31.5, 56, 17, C_PUSH, 3.6, 9, 0)}
    <path d="M14 52q10 6 20 0" stroke="#9EC5FB" stroke-width="2.4" fill="none"/>`,
  arrow3: `<path d="M22 52l22-20" stroke="#C4CAD2" stroke-width="1.8" stroke-dasharray="3 4"/>
    ${arw(16, 48, 52, 14, C_PUSH, 3.8, 11, 0)}
    <circle cx="16" cy="48" r="4.5" fill="#fff" stroke="${C_PUSH}" stroke-width="3"/>`,
  // 같은 쪽 두 힘(파랑 2칸, 주황 3칸)을 합친 힘(초록 5칸). 셋 다 같은 자리에서 시작하고 길이가 값에 비례한다
  netArt: `<path d="M7 14v42" stroke="#D5DBE3" stroke-width="2"/>
    ${arw(7, 20, 27, 20, C_PUSH, 3.4, 8, 0)}
    ${arw(7, 33, 37, 33, C_AMBER, 3.4, 8, 0)}
    ${arw(7, 48, 57, 48, C_UP, 4.2, 9.5, 0)}`,
  // 크기가 같고 방향이 반대인 두 힘(물체에 닿은 면에서), 가운데 초록 점은 합친 힘 0(랩의 표시와 같다)
  balanceArt: `<ellipse cx="32" cy="45" rx="13" ry="2.4" fill="#2A3A5E" opacity=".1"/>
    <rect x="22" y="24" width="20" height="18" rx="4" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    ${arw(22, 33, 4, 33, C_AMBER, 3.4, 8, 0)}
    ${arw(42, 33, 60, 33, C_PUSH, 3.4, 8, 0)}
    <circle cx="32" cy="33" r="3.6" fill="${C_UP}" stroke="#fff" stroke-width="1.4"/>`,
  gravityArt: `<circle cx="32" cy="40" r="15" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.4"/>
    <ellipse cx="27" cy="36" rx="6" ry="4" fill="#B8E0C4"/>
    <circle cx="32" cy="40" r="2" fill="#4E5968"/>
    <circle cx="46" cy="12" r="4" fill="#F0564C"/>
    ${arw(44, 15.5, 34.2, 32.8, C_BACK, 2.6, 7.5, 1.4)}`,
  weightArt: `<path d="M32 6v8" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M26 16h12l-2 22h-8z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M32 38v6" stroke="#8B95A1" stroke-width="2.4"/>
    <rect x="24" y="44" width="16" height="12" rx="3" fill="#FFD98A" stroke="#E8961E" stroke-width="2.2"/>
    <path d="M29 24h6" stroke="#2B3445" stroke-width="2.4"/>`,
  massArt: `<path d="M32 12v10" stroke="#8B95A1" stroke-width="2.6"/><path d="M12 22h40" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M12 22l-6 12h12zM52 22l-6 12h12z" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2"/>
    <path d="M22 50h20" stroke="#8B95A1" stroke-width="2.6"/><path d="M26 50l6-8 6 8" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2"/>`,
  springArt: `<path d="M8 32h6l5-8 6 16 6-16 6 16 6-16 5 8h8" stroke="#8CA0BC" stroke-width="3" fill="none"/>
    <circle cx="58" cy="32" r="4" fill="none" stroke="#F0A422" stroke-width="2.6"/>`,
  // 고리를 당기는 힘(파랑)과 되당기는 힘(빨강): 둘 다 고리(작용점)에서
  elasticDir: `<path d="M5 20v24" stroke="#8B95A1" stroke-width="3"/>
    <path d="M6 32h3l3-8 4 16 4-16 4 16 4-16 4 16 3-8h4" stroke="#8CA0BC" stroke-width="2.4" fill="none"/>
    <circle cx="43.5" cy="32" r="4" fill="none" stroke="#8CA0BC" stroke-width="2.4"/>
    ${arw(43.5, 32, 61, 32, C_PUSH, 3, 7.5, 1.4)}
    ${arw(43.5, 32, 26, 32, C_BACK, 3, 7.5, 1.4)}`,
  // 끄는 힘(파랑, 오른쪽 면에서)과 마찰력(빨강, 맞닿은 면에서 반대쪽). 멈춰 있는 동안이라 같은 길이
  frictionArt: `<path d="M3 46h56" stroke="#8B95A1" stroke-width="2.4"/>
    <rect x="20" y="25" width="22" height="20" rx="3.5" fill="#E8C06A" stroke="#B08D3E" stroke-width="2.2"/>
    ${arw(42, 35, 61, 35, C_PUSH, 3, 7.5, 1.4)}
    ${arw(31, 45.5, 12, 45.5, C_BACK, 3, 7.5, 1.4)}`,
  roughArt: `<path d="M6 40l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6" stroke="#B0764A" stroke-width="3" fill="none"/>
    <rect x="22" y="16" width="20" height="14" rx="3" fill="#E8C06A" stroke="#B08D3E" stroke-width="2"/>
    <path d="M10 54h44" stroke="#D5DBE3" stroke-width="2.4"/>`,
  // 부력(초록): 물에 잠긴 물체의 가운데에서 위로
  buoyArt: `<path d="M8 30q8-6 16 0t16 0 16 0" stroke="#5AA2F8" stroke-width="2.6" fill="none"/>
    <rect x="24" y="33" width="16" height="16" rx="4" fill="#EAF6FF" stroke="#8FB3D6" stroke-width="2.2"/>
    ${arw(32, 41, 32, 9, C_UP, 3.4, 9, 1.6)}
    <path d="M12 56h40" stroke="#9EC5FB" stroke-width="2.2" opacity=".7"/>`,
  // 잠긴 부피가 2배면 부력(초록)도 2배: 두 물체의 가운데에서 위로 10px과 20px
  volumeUp: `<path d="M6 24q8-5 14 0t14 0 14 0 10 0" stroke="#5AA2F8" stroke-width="2.4" fill="none"/>
    <rect x="11" y="36" width="15" height="13" rx="3" fill="#EAF6FF" stroke="#8FB3D6" stroke-width="2"/>
    <rect x="35" y="31" width="24" height="23" rx="4" fill="#EAF6FF" stroke="#8FB3D6" stroke-width="2.2"/>
    ${arw(18.5, 42.5, 18.5, 30.5, C_UP, 2.8, 7, 1.4)}
    ${arw(47, 42.5, 47, 18.5, C_UP, 2.8, 7, 1.4)}`,
  // 오른쪽으로 가는 공(운동 방향 초록)에 옆에서 힘(파랑)을 주면 길이 휜다(점선)
  motionArt: `<path d="M27 37q17 2 27 19" stroke="#C4CAD2" stroke-width="2.2" stroke-dasharray="3 4" fill="none"/>
    <circle cx="18" cy="34" r="8" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.4"/>
    ${arw(18, 34, 46, 34, C_UP, 3, 8, 1.4)}
    ${arw(18, 34, 18, 58, C_PUSH, 3, 8, 1.4)}`,
  // 책상 위 책: 책 가운데에서 위로 떠받치는 힘(초록), 아래로 중력(빨강), 같은 길이
  bookArt: `<path d="M8 43.6h48" stroke="#C4CAD2" stroke-width="2.4"/>
    <rect x="16" y="30" width="32" height="12" rx="3" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    ${arw(32, 36, 32, 10, C_UP, 3.2, 8.5, 1.6)}
    ${arw(32, 36, 32, 62, C_BACK, 3.2, 8.5, 1.6)}`,
};

export function miniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
