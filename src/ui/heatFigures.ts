// 열 단원(III) 퀴즈·개념 그림 — 손코딩 교육용 SVG.
// 색은 답의 단서가 되지 않도록 설계한다(예: 입자 상자 3개는 전부 같은 색,
// 오직 운동 잔상과 입자 간격만 온도의 단서).

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 온도가 서로 다른 물 (가)(나)(다) — 입자 운동 비교 (다크 그림) */
export function particleTrio(showMotionLines = true): string {
  // 상자 하나를 그리는 도우미: 입자 배치 + 운동 잔상(활발할수록 길게)
  const box = (bx: number, label: string, spread: number, trail: number): string => {
    const pts: [number, number][] = [];
    const n = 9;
    const cols = 3;
    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      // spread: 입자 간격(온도 높을수록 넓게)
      const cx = 50 + (c - 1) * spread + (i % 2 ? 3 : -2) * (spread / 16);
      const cy = 48 + (r - 1) * spread + (i % 3 === 1 ? 4 : -2) * (spread / 16);
      pts.push([cx, cy]);
    }
    const parts = pts
      .map(([x, y], i) => {
        const a1 = (i * 137) % 360;
        const trails =
          !showMotionLines || trail < 1
            ? ""
            : [0, 1]
                .map((k) => {
                  const ang = ((a1 + k * 150) * Math.PI) / 180;
                  const dx = Math.cos(ang) * (trail + 3);
                  const dy = Math.sin(ang) * (trail + 3);
                  return `<line x1="${(x - dx * 0.4).toFixed(1)}" y1="${(y - dy * 0.4).toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}" stroke="#8FB3E8" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
                })
                .join("");
        return `${trails}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#6E9EDB"/><circle cx="${(x - 2).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="1.8" fill="rgba(255,255,255,.4)"/>`;
      })
      .join("");
    return `<g transform="translate(${bx},10)">
      <rect x="0" y="0" width="100" height="96" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
      ${parts}
      <text x="50" y="122" text-anchor="middle" font-size="14" font-weight="700" fill="#AFC3E3">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 136" ${NS} role="img" aria-label="온도가 다른 물 세 가지의 입자 운동 모형">
    ${box(6, "(가)", 22, 0)}
    ${box(122, "(나)", 27, 4)}
    ${box(238, "(다)", 32, 9)}
  </svg>`;
}

/** 뜨거운 물 (가) + 찬물 (나)의 시간-온도 그래프 — 4분에 40℃로 열평형 (라이트 그림) */
export function equilibriumGraph(): string {
  // 좌표계: x 40..320 (0~8분), y 26..186 (60~10℃), T→y = 186-(T-10)*3.2
  const gx = (min: number): number => 40 + min * 35;
  const gy = (T: number): number => 186 - (T - 10) * 3.2;
  const xticks = Array.from({ length: 9 }, (_, i) => {
    const x = gx(i);
    return `<line x1="${x}" y1="186" x2="${x}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${x}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${i}</text>`;
  }).join("");
  const yticks = [10, 20, 30, 40, 50, 60]
    .map(
      (T) => `<line x1="40" y1="${gy(T)}" x2="320" y2="${gy(T)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="32" y="${gy(T) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${T}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="뜨거운 물과 찬물이 접촉한 후의 시간-온도 그래프. 4분부터 두 온도가 40도로 같아진다">
    ${yticks}${xticks}
    <line x1="40" y1="26" x2="40" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${gx(4)}" y1="${gy(40)}" x2="320" y2="${gy(40)}" stroke="#04B45F" stroke-width="2" stroke-dasharray="5 5" opacity=".7"/>
    <path d="M40,${gy(60)} C ${gx(1.6)},${gy(46)} ${gx(2.6)},${gy(41.5)} ${gx(4)},${gy(40)}" fill="none" stroke="#FF6B4A" stroke-width="3" stroke-linecap="round"/>
    <path d="M40,${gy(20)} C ${gx(1.6)},${gy(34)} ${gx(2.6)},${gy(38.5)} ${gx(4)},${gy(40)}" fill="none" stroke="#3182F6" stroke-width="3" stroke-linecap="round"/>
    <text x="52" y="${gy(58)}" font-size="13" font-weight="700" fill="#E8542F">(가)</text>
    <text x="52" y="${gy(21)}" font-size="13" font-weight="700" fill="#1B64DA">(나)</text>
    <text x="8" y="14" font-size="11" fill="#4E5968">온도(℃)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">시간(분)</text>
  </svg>`;
}

/** 구리·철·유리 막대를 동시에 가열한 열화상 (다크 그림) */
export function thermalRods(): string {
  const flame = (y: number): string => `
    <g transform="translate(51,${y + 8})">
      <path d="M0 9 C 8 5 5 -3 0 -11 C -5 -3 -8 5 0 9 Z" fill="#FF9F43"/>
      <path d="M0 5 C 4 3 3 -2 0 -6 C -3 -2 -4 3 0 5 Z" fill="#FFE9A8"/>
    </g>`;
  const rod = (y: number, label: string, frac: number): string => {
    const w = 250 * frac;
    return `<g>
      <text x="58" y="${y - 7}" font-size="12.5" font-weight="700" fill="#AFC3E3">${label}</text>
      <rect x="62" y="${y}" width="250" height="16" rx="8" fill="#22335C"/>
      ${w > 4 ? `<rect x="62" y="${y}" width="${w}" height="16" rx="8" fill="url(#heatGrad)"/>` : ""}
      <rect x="62" y="${y}" width="250" height="16" rx="8" fill="none" stroke="#31456F" stroke-width="1.2"/>
      ${flame(y)}
    </g>`;
  };
  return `<svg viewBox="0 0 344 190" ${NS} role="img" aria-label="구리, 철, 유리 막대의 왼쪽 끝을 동시에 가열한 열화상 사진. 구리가 가장 멀리, 유리는 거의 데워지지 않았다">
    <defs>
      <linearGradient id="heatGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFE9A8"/>
        <stop offset=".45" stop-color="#FF9F43"/>
        <stop offset=".85" stop-color="#F0442E"/>
        <stop offset="1" stop-color="#F0442E" stop-opacity=".15"/>
      </linearGradient>
    </defs>
    ${rod(44, "구리", 0.86)}
    ${rod(102, "철", 0.44)}
    ${rod(160, "유리", 0.1)}
    <text x="34" y="186" text-anchor="middle" font-size="11" fill="#7E93B3">가열</text>
  </svg>`;
}

/** recap 카드용 미니 일러스트(64x64) — 열 단원 공용 */
const MINI: Record<string, string> = {
  // 온도계 + 입자
  thermo: `<path d="M26 12a5 5 0 0 1 10 0v22a10 10 0 1 1-10 0z" fill="#FFF" stroke="#4E5968" stroke-width="3"/>
    <path d="M31 26v16" stroke="#FF6B4A" stroke-width="4"/>
    <circle cx="31" cy="44" r="4.5" fill="#FF6B4A" stroke="none"/>
    <circle cx="50" cy="18" r="4" fill="#FF9F43" stroke="none"/>
    <path d="M44 12l-3-3M56 13l3-3" stroke="#FF9F43" stroke-width="2.4"/>
    <circle cx="52" cy="42" r="4" fill="#3D8DFF" stroke="none"/>`,
  // 가열 → 활발·멀어짐
  heatUp: `<path d="M18 56c6-3 4-8 0-13-4 5-6 10 0 13z" fill="#FF9F43" stroke="none"/>
    <circle cx="30" cy="30" r="4.5" fill="#F25C54" stroke="none"/>
    <circle cx="46" cy="20" r="4.5" fill="#F25C54" stroke="none"/>
    <circle cx="50" cy="40" r="4.5" fill="#F25C54" stroke="none"/>
    <path d="M23 24l-5-5M52 12l4-5M57 46l6 3" stroke="#FF6B4A" stroke-width="2.6"/>
    <path d="M35 36c-3 2-4 5-3 8" stroke="#FFB03A" stroke-width="2.4"/>`,
  // 냉각 → 둔해짐·가까워짐
  coolDown: `<path d="M48 12v12M42 18h12M43.5 13.5l9 9M52.5 13.5l-9 9" stroke="#5AA2F8" stroke-width="2.8"/>
    <circle cx="22" cy="44" r="4.5" fill="#3D8DFF" stroke="none"/>
    <circle cx="33" cy="40" r="4.5" fill="#3D8DFF" stroke="none"/>
    <circle cx="29" cy="51" r="4.5" fill="#3D8DFF" stroke="none"/>
    <path d="M45 40l-5 3M46 52l-6-2" stroke="#8FB3E8" stroke-width="2.4"/>`,
  // 열의 이동 방향(고온 → 저온)
  flowDir: `<rect x="8" y="20" width="20" height="24" rx="6" fill="#FFDCD1" stroke="#FF6B4A" stroke-width="3"/>
    <rect x="36" y="20" width="20" height="24" rx="6" fill="#DBE9FF" stroke="#3D8DFF" stroke-width="3"/>
    <path d="M26 32h10M32 27l5 5-5 5" stroke="#FF9F43" stroke-width="3.4"/>
    <path d="M14 12c-2-3 2-4 0-7M22 13c-2-3 2-4 0-7" stroke="#FF8A5C" stroke-width="2.4"/>`,
  // 열평형(같아짐)
  balance: `<rect x="8" y="22" width="20" height="24" rx="6" fill="#EFE9FF" stroke="#8A6BFF" stroke-width="3"/>
    <rect x="36" y="22" width="20" height="24" rx="6" fill="#EFE9FF" stroke="#8A6BFF" stroke-width="3"/>
    <path d="M28 30h8M28 38h8" stroke="#04B45F" stroke-width="3.4"/>
    <path d="M14 54h36" stroke="#C4CAD2" stroke-width="2.6"/>`,
  // 입자 운동 교환(잃는 쪽 둔해지고 얻는 쪽 활발해짐)
  particleSwap: `<circle cx="18" cy="26" r="5.5" fill="#F25C54" stroke="none"/>
    <path d="M8 18l-4-4M10 34l-5 4" stroke="#FF6B4A" stroke-width="2.6"/>
    <circle cx="47" cy="42" r="5.5" fill="#3D8DFF" stroke="none"/>
    <path d="M56 36l3-2" stroke="#8FB3E8" stroke-width="2.4"/>
    <path d="M30 22c8-2 14 2 18 8" stroke="#FF9F43" stroke-width="3"/>
    <path d="M45 27l4 4-6 1z" fill="#FF9F43" stroke="none"/>`,
  // 전도 — 진동 릴레이
  conduct: `<circle cx="12" cy="36" r="5" fill="#FF9F43" stroke="none"/>
    <circle cx="24" cy="36" r="5" fill="#F9BC7B" stroke="none"/>
    <circle cx="36" cy="36" r="5" fill="#B9AFD4" stroke="none"/>
    <circle cx="48" cy="36" r="5" fill="#7C93D8" stroke="none"/>
    <path d="M8 26c2-2 6-2 8 0M20 26c2-2 6-2 8 0" stroke="#FF6B4A" stroke-width="2.6"/>
    <path d="M33 27c1.6-1.4 4.4-1.4 6 0" stroke="#8FA0CF" stroke-width="2.2"/>
    <path d="M12 54c5-2.5 3.5-6.5 0-10.5-3.5 4-5 8 0 10.5z" fill="#FF9F43" stroke="none"/>`,
  // 대류 — 순환
  convect: `<rect x="12" y="14" width="40" height="38" rx="9" fill="none" stroke="#4E5968" stroke-width="3"/>
    <path d="M32 44c-7 0-11-4-11-10s4-10 11-10 11 4 11 10" stroke="#0CA6C0" stroke-width="3.2"/>
    <path d="M43 28l3 6-7-1z" fill="#0CA6C0" stroke="none"/>
    <path d="M26 60c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>
    <path d="M38 60c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>`,
  // 복사 — 직진
  radiate: `<path d="M14 44c7-3.5 5-9 0-14.5C9 35 7 40.5 14 44z" fill="#FF9F43" stroke="none"/>
    <path d="M26 22a18 18 0 0 1 0 26" stroke="#F04452" stroke-width="3"/>
    <path d="M34 16a26 26 0 0 1 0 38" stroke="#F04452" stroke-width="3" opacity=".65"/>
    <path d="M42 10a34 34 0 0 1 0 50" stroke="#F04452" stroke-width="3" opacity=".35"/>
    <circle cx="56" cy="35" r="4" fill="#FFB03A" stroke="none"/>`,
  // 비열 — 1kg 블록 + 온도계 + 열
  specHeat: `<rect x="10" y="26" width="26" height="22" rx="5" fill="#FFE4B0" stroke="#C9A96A" stroke-width="3"/>
    <path d="M17 26v-5h12v5" fill="none" stroke="#C9A96A" stroke-width="3"/>
    <path d="M23 62c5-2.5 3.5-6.5 0-10.5-3.5 4-5 8 0 10.5z" fill="#FF9F43" stroke="none"/>
    <path d="M50 14a3 3 0 0 1 6 0v22a6 6 0 1 1-6 0z" fill="#FFF" stroke="#4E5968" stroke-width="3"/>
    <path d="M53 26v14" stroke="#F25C54" stroke-width="3.6"/>
    <circle cx="53" cy="42" r="3.4" fill="#F25C54" stroke="none"/>`,
  // 온도 관성 — 같은 불, 다른 온도계
  inertia: `<path d="M16 60c4.5-2.2 3-6 0-9.5-3 3.5-4.5 7.3 0 9.5z" fill="#FF9F43" stroke="none"/>
    <path d="M48 60c4.5-2.2 3-6 0-9.5-3 3.5-4.5 7.3 0 9.5z" fill="#FF9F43" stroke="none"/>
    <path d="M13 8a3 3 0 0 1 6 0v26a6 6 0 1 1-6 0z" fill="#FFF" stroke="#4E5968" stroke-width="2.8"/>
    <path d="M16 30v10" stroke="#3D8DFF" stroke-width="3.4"/>
    <circle cx="16" cy="42" r="3.2" fill="#3D8DFF" stroke="none"/>
    <path d="M45 8a3 3 0 0 1 6 0v26a6 6 0 1 1-6 0z" fill="#FFF" stroke="#4E5968" stroke-width="2.8"/>
    <path d="M48 14v26" stroke="#F25C54" stroke-width="3.4"/>
    <circle cx="48" cy="42" r="3.2" fill="#F25C54" stroke="none"/>`,
  // 물의 큰 비열 — 물방울은 느긋
  waterBig: `<path d="M26 8C34 20 44 28 44 40a18 18 0 1 1-36 0C8 28 18 20 26 8z" fill="#CFE4FF" stroke="#3D8DFF" stroke-width="3"/>
    <path d="M18 40a8.5 8.5 0 0 0 8 9" stroke="#8FBBF2" stroke-width="2.6"/>
    <path d="M54 20l6-3M54 32l7 0M54 44l6 3" stroke="#FF9F43" stroke-width="2.8"/>`,
  // 열팽창 — 입자 간격이 벌어진다(크기는 그대로)
  expandArt: `<path d="M6 20v24M58 20v24" stroke="#C4CAD2" stroke-width="2.4" stroke-dasharray="3 4"/>
    <circle cx="20" cy="32" r="5.5" fill="#F25C54" stroke="none"/>
    <circle cx="32" cy="32" r="5.5" fill="#F25C54" stroke="none"/>
    <circle cx="44" cy="32" r="5.5" fill="#F25C54" stroke="none"/>
    <path d="M12 32H4M8 28l-4 4 4 4" stroke="#FF9F43" stroke-width="2.8"/>
    <path d="M52 32h8M56 28l4 4-4 4" stroke="#FF9F43" stroke-width="2.8"/>
    <path d="M26 52c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>
    <path d="M40 52c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>`,
  // 물질마다 다른 팽창 정도
  diffExpand: `<rect x="6" y="16" width="34" height="9" rx="4.5" fill="#AFC6E8" stroke="none"/>
    <path d="M42 20.5h12M50 16.5l4 4-4 4" stroke="#FF9F43" stroke-width="2.8"/>
    <rect x="6" y="38" width="34" height="9" rx="4.5" fill="#9AA3AD" stroke="none"/>
    <path d="M42 42.5h4" stroke="#C4CAD2" stroke-width="2.8"/>
    <path d="M14 60c4-2 3-5 0-8-3 3-4 6 0 8zM30 60c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>`,
  // 바이메탈 — 열팽창 작은 쪽으로 휜다
  bimetalArt: `<rect x="4" y="18" width="8" height="24" rx="2" fill="#C4CAD2" stroke="none"/>
    <path d="M12 26c14-2 26 2 34 14" stroke="#AFC6E8" stroke-width="7" stroke-linecap="round"/>
    <path d="M12 33c12-1.5 22 2 29 12" stroke="#5E6B7E" stroke-width="7" stroke-linecap="round"/>
    <path d="M26 58c4.5-2.2 3-6 0-9.5-3 3.5-4.5 7.3 0 9.5z" fill="#FF9F43" stroke="none"/>`,
};

export function miniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}

/** 질량이 같은 세 물질 (가)(나)(다)에 같은 양의 열을 가한 그래프 (라이트 그림) */
export function heatingCurves3(): string {
  // 좌표계: x 40..320 (0~5분), y 26..186 (80~20℃)
  const gx = (min: number): number => 40 + min * 56;
  const gy = (T: number): number => 186 - ((T - 20) / 60) * 160;
  const xt = Array.from({ length: 6 }, (_, i) => {
    return `<line x1="${gx(i)}" y1="186" x2="${gx(i)}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(i)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${i}</text>`;
  }).join("");
  const yt = [20, 40, 60, 80]
    .map(
      (T) => `<line x1="40" y1="${gy(T)}" x2="320" y2="${gy(T)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="32" y="${gy(T) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${T}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="질량이 같은 세 물질을 같은 양의 열로 가열한 시간-온도 그래프. 온도가 오르는 정도가 서로 다르다">
    ${yt}${xt}
    <line x1="40" y1="26" x2="40" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <!-- 세 선은 같은 색 — 색이 정답(비열 순서)의 단서가 되지 않게 한다 -->
    <line x1="${gx(0)}" y1="${gy(20)}" x2="${gx(5)}" y2="${gy(34)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <line x1="${gx(0)}" y1="${gy(20)}" x2="${gx(5)}" y2="${gy(52)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <line x1="${gx(0)}" y1="${gy(20)}" x2="${gx(5)}" y2="${gy(76)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <text x="${gx(5) - 26}" y="${gy(35) + 22}" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    <text x="${gx(5) - 26}" y="${gy(53) - 2}" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
    <text x="${gx(5) - 26}" y="${gy(76) - 6}" font-size="13" font-weight="700" fill="#4E5968">(다)</text>
    <text x="8" y="14" font-size="11" fill="#4E5968">온도(℃)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">시간(분)</text>
  </svg>`;
}

/** 종이+알루미늄박 테이프 — 가열 전/후 (라이트 그림) */
export function tapeBend(): string {
  return `<svg viewBox="0 0 344 170" ${NS} role="img" aria-label="종이와 알루미늄박을 붙인 테이프. 가열 전에는 곧고, 가열 후에는 종이 쪽으로 휘어진다">
    <text x="86" y="22" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">가열 전</text>
    <text x="258" y="22" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">가열 후</text>
    <line x1="172" y1="14" x2="172" y2="156" stroke="#EDF0F4" stroke-width="1.6"/>
    <!-- 가열 전: 곧은 2층 띠 -->
    <rect x="28" y="70" width="116" height="9" rx="4.5" fill="#EDEAE2" stroke="#B9B2A2" stroke-width="1.6"/>
    <rect x="28" y="79" width="116" height="9" rx="4.5" fill="#C7D6EA" stroke="#8FA6C6" stroke-width="1.6"/>
    <text x="86" y="60" text-anchor="middle" font-size="11" fill="#8B95A1">종이(위)</text>
    <text x="86" y="106" text-anchor="middle" font-size="11" fill="#8B95A1">알루미늄박(아래)</text>
    <!-- 가열 후: 알루미늄이 더 늘어나 바깥(아래·볼록)이 되고, 끝이 종이(위) 쪽으로 말려 올라감 -->
    <path d="M204 79Q258 125 312 79" fill="none" stroke="#8FA6C6" stroke-width="12" stroke-linecap="round"/>
    <path d="M204 79Q258 125 312 79" fill="none" stroke="#C7D6EA" stroke-width="9" stroke-linecap="round"/>
    <path d="M204 70Q258 116 312 70" fill="none" stroke="#B9B2A2" stroke-width="12" stroke-linecap="round"/>
    <path d="M204 70Q258 116 312 70" fill="none" stroke="#EDEAE2" stroke-width="9" stroke-linecap="round"/>
    <path d="M252 148c5-2.5 3.5-6.5 0-10.5-3.5 4-5 8 0 10.5z" fill="#FF9F43"/>
    <path d="M266 148c5-2.5 3.5-6.5 0-10.5-3.5 4-5 8 0 10.5z" fill="#FF9F43"/>
    <text x="258" y="40" text-anchor="middle" font-size="11" fill="#8B95A1">끝이 종이 쪽으로 휘어짐</text>
  </svg>`;
}

/** 온돌의 구조 — 아궁이·구들장·방 (라이트 그림) */
export function ondolFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} role="img" aria-label="온돌 구조 단면도. 아궁이의 불이 구들장을 데우고, 데워진 방바닥이 방 안 공기를 데운다">
    <rect x="18" y="24" width="308" height="106" rx="10" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.5"/>
    <rect x="18" y="106" width="308" height="24" fill="#E7EBF0"/>
    <g>
      <rect x="30" y="108" width="42" height="20" rx="4" fill="#C4CAD2"/>
      <rect x="78" y="108" width="42" height="20" rx="4" fill="#C4CAD2"/>
      <rect x="126" y="108" width="42" height="20" rx="4" fill="#C4CAD2"/>
      <rect x="174" y="108" width="42" height="20" rx="4" fill="#C4CAD2"/>
      <rect x="222" y="108" width="42" height="20" rx="4" fill="#C4CAD2"/>
      <rect x="270" y="108" width="42" height="20" rx="4" fill="#C4CAD2"/>
    </g>
    <rect x="18" y="130" width="308" height="28" fill="#FBFCFD" stroke="#E7EAEE"/>
    <path d="M2 158 L18 130 L18 158 Z" fill="#FBFCFD" stroke="#E7EAEE"/>
    <g>
      <path d="M-2 150 h34 v22 h-40 Z" fill="#4E5968" transform="translate(14,-16)"/>
      <path d="M22 152 C 34 144 29 134 22 124 C 15 134 10 144 22 152 Z" fill="#FF9F43"/>
      <path d="M22 147 C 29 142 26 135 22 129 C 18 135 15 142 22 147 Z" fill="#FFD98A"/>
    </g>
    <path d="M40 142 H300" stroke="#FF6B4A" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"/>
    <path d="M300 146 l10 -4 -10 -4" fill="none" stroke="#FF6B4A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <g stroke="#FF9F43" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9">
      <path d="M96 100 C 92 88 100 82 96 70"/>
      <path d="M172 100 C 168 88 176 82 172 70"/>
      <path d="M248 100 C 244 88 252 82 248 70"/>
    </g>
    <text x="30" y="16" font-size="12" font-weight="700" fill="#4E5968">방 안</text>
    <text x="36" y="176" font-size="12" font-weight="700" fill="#4E5968">아궁이</text>
    <text x="172" y="102" text-anchor="middle" font-size="11.5" font-weight="700" fill="#6B7684">구들장(돌판)</text>
    <text x="172" y="152" text-anchor="middle" font-size="10.5" fill="#8B95A1">뜨거운 연기가 지나가는 길</text>
  </svg>`;
}
