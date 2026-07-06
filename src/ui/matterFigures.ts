// 물질의 상태 변화(IV) 퀴즈·개념 그림 — 손코딩 교육용 SVG.
// 색은 답의 단서가 되지 않도록 설계(입자 상자는 전부 같은 색 — 배열·간격·잔상만 단서).

const NS = `xmlns="http://www.w3.org/2000/svg"`;

const P = "#6E9EDB"; // 입자 공통색(다크 그림)
const dot = (x: number, y: number, r = 6): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${P}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.33}" r="${r * 0.3}" fill="rgba(255,255,255,.4)"/>`;
const trail = (x: number, y: number, ang: number, len: number): string => {
  const dx = Math.cos(ang) * len;
  const dy = Math.sin(ang) * len;
  return `<line x1="${(x - dx * 0.5).toFixed(1)}" y1="${(y - dy * 0.5).toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}" stroke="#8FB3E8" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
};

/** 물질의 세 가지 상태 (가)(나)(다) 입자 모형 — 순서 섞음: (가) 기체 / (나) 고체 / (다) 액체 (다크) */
export function stateTrioFig(): string {
  const frame = (bx: number, label: string, inner: string): string =>
    `<g transform="translate(${bx},10)">
      <rect x="0" y="0" width="100" height="96" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
      ${inner}
      <text x="50" y="122" text-anchor="middle" font-size="14" font-weight="700" fill="#AFC3E3">${label}</text>
    </g>`;
  // (가) 기체 — 멀리 흩어짐 + 긴 잔상
  const gasPts: [number, number, number][] = [
    [22, 24, 0.7], [72, 18, 2.4], [50, 50, 4.1], [16, 70, 1.2], [82, 66, 5.3], [58, 84, 3.2],
  ];
  const gas = gasPts.map(([x, y, a]) => trail(x, y, a, 9) + dot(x, y, 5.4)).join("");
  // (나) 고체 — 3×3 규칙 격자, 잔상 없음
  let solid = "";
  for (let i = 0; i < 9; i++) {
    const c = i % 3;
    const r = Math.floor(i / 3);
    solid += dot(30 + c * 20, 28 + r * 20, 6.4);
  }
  // (다) 액체 — 서로 닿은 불규칙 뭉침 + 짧은 잔상
  const liqPts: [number, number, number][] = [
    [30, 62, 0.4], [46, 56, 2.2], [62, 64, 3.9], [38, 76, 1.5], [56, 78, 5.1], [70, 76, 2.8], [46, 68, 0.9], [26, 76, 4.4],
  ];
  const liq = liqPts.map(([x, y, a]) => trail(x, y, a, 3.4) + dot(x, y, 6)).join("");
  return `<svg viewBox="0 0 344 136" ${NS} role="img" aria-label="물질의 세 가지 상태를 나타낸 입자 모형 세 상자">
    ${frame(6, "(가)", gas)}
    ${frame(122, "(나)", solid)}
    ${frame(238, "(다)", liq)}
  </svg>`;
}

/** 뜨거운 물 비커 + 얼음 시계 접시 — (가) 얼음, (나) 접시 아랫면 물방울 (라이트) */
export function watchGlassFig(): string {
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="뜨거운 물이 든 비커 위에 얼음이 담긴 시계 접시를 올린 그림">
    <!-- 비커 -->
    <path d="M110 70v96a8 8 0 0 0 8 8h108a8 8 0 0 0 8-8V70" fill="none" stroke="#4E5968" stroke-width="3"/>
    <path d="M116 108h112v54a6 6 0 0 1-6 6H122a6 6 0 0 1-6-6z" fill="#DCEAFF"/>
    <!-- 김 -->
    <g stroke="#B0B8C1" stroke-width="2.6" fill="none" stroke-linecap="round">
      <path d="M150 96c-3-5 3-7 0-12"/>
      <path d="M172 94c-3-5 3-7 0-13"/>
      <path d="M194 96c-3-5 3-7 0-12"/>
    </g>
    <!-- 시계 접시 + 얼음 -->
    <path d="M100 64q72 22 144 0" fill="none" stroke="#4E5968" stroke-width="3"/>
    <g>
      <rect x="142" y="38" width="26" height="22" rx="6" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.6"/>
      <rect x="176" y="42" width="22" height="18" rx="5" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.6"/>
    </g>
    <!-- 아랫면 물방울 -->
    <g fill="#5AA2F8">
      <circle cx="150" cy="80" r="3.4"/>
      <circle cx="172" cy="83" r="3.8"/>
      <circle cx="196" cy="80" r="3.2"/>
    </g>
    <!-- 라벨 -->
    <text x="256" y="46" font-size="13" font-weight="700" fill="#4E5968">(가) 얼음</text>
    <path d="M252 44l-46 4" stroke="#B0B8C1" stroke-width="1.6"/>
    <text x="256" y="92" font-size="13" font-weight="700" fill="#4E5968">(나) 물방울</text>
    <path d="M252 88l-48 -4" stroke="#B0B8C1" stroke-width="1.6"/>
    <text x="60" y="140" font-size="13" font-weight="700" fill="#4E5968">뜨거운 물</text>
    <path d="M100 136l18 2" stroke="#B0B8C1" stroke-width="1.6"/>
  </svg>`;
}

/** 가열(냉각) 곡선 — (가)~(라) 구간 라벨. 온도 축 수치는 t1·t2로만(용어 미도입 단원) */
export function curveFig(mode: "heat" | "cool" = "heat"): string {
  // 좌표: x 40..320, y 30..180
  const seg = (x1: number, y1: number, x2: number, y2: number): string =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>`;
  const yHi = 52;
  const yMid = 96;
  const yLo = 156;
  const pts =
    mode === "heat"
      ? [
          [40, 172, 84, yLo], // (가) 상승
          [84, yLo, 156, yLo], // (나) 수평
          [156, yLo, 226, yMid], // (다) 상승
          [226, yMid, 300, yMid], // (라) 수평 — 더 높은 온도로 보이게 y 좌표 반전 필요
        ]
      : [
          [40, 38, 84, yHi],
          [84, yHi, 156, yHi],
          [156, yHi, 226, yMid],
          [226, yMid, 300, yMid],
        ];
  // heat 모드: 두 번째 수평이 첫 번째보다 높아야 한다 — y 좌표 다시 계산
  const heatPts = [
    [40, 172, 84, yMid + 30],
    [84, yMid + 30, 156, yMid + 30],
    [156, yMid + 30, 226, yHi + 10],
    [226, yHi + 10, 300, yHi + 10],
  ];
  const coolPts = [
    [40, 38, 84, yHi + 10],
    [84, yHi + 10, 156, yHi + 10],
    [156, yHi + 10, 226, yMid + 30],
    [226, yMid + 30, 300, yMid + 30],
  ];
  const use = mode === "heat" ? heatPts : coolPts;
  void pts;
  const labels = ["(가)", "(나)", "(다)", "(라)"];
  const labelEls = use
    .map((p, i) => {
      const mx = (p[0] + p[2]) / 2;
      const my = Math.min(p[1], p[3]) - 10;
      return `<text x="${mx}" y="${my}" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${labels[i]}</text>`;
    })
    .join("");
  const dashY = mode === "heat" ? [yMid + 30, yHi + 10] : [yHi + 10, yMid + 30];
  return `<svg viewBox="0 0 344 216" ${NS} role="img" aria-label="${mode === "heat" ? "고체를 가열" : "기체를 냉각"}할 때 시간에 따른 온도 그래프. 수평 구간이 두 번 나타난다">
    <line x1="40" y1="26" x2="40" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="${dashY[0]}" x2="300" y2="${dashY[0]}" stroke="#E7EAEE" stroke-width="1.4" stroke-dasharray="4 5"/>
    <line x1="40" y1="${dashY[1]}" x2="300" y2="${dashY[1]}" stroke="#E7EAEE" stroke-width="1.4" stroke-dasharray="4 5"/>
    ${use.map((p) => seg(p[0], p[1], p[2], p[3])).join("")}
    ${labelEls}
    <text x="8" y="16" font-size="11" fill="#4E5968">온도(℃)</text>
    <text x="316" y="204" text-anchor="end" font-size="11" fill="#4E5968">${mode === "heat" ? "가열" : "냉각"} 시간(분)</text>
  </svg>`;
}

/** 액체 → 기체 입자 모형(기화) — 대단원 7번 (다크) */
export function vaporizeFig(): string {
  const liqPts: [number, number][] = [
    [34, 52], [50, 46], [66, 54], [42, 66], [58, 68], [74, 64], [50, 58], [30, 68], [68, 44],
  ];
  const liq = liqPts.map(([x, y]) => dot(x, y, 6)).join("");
  const gasPts: [number, number, number][] = [
    [222, 30, 0.6], [258, 24, 2.3], [286, 44, 4.0], [232, 62, 1.4], [270, 70, 5.2], [296, 82, 3.1], [240, 88, 2.0],
  ];
  const gas = gasPts.map(([x, y, a]) => trail(x, y, a, 8) + dot(x, y, 5.4)).join("");
  return `<svg viewBox="0 0 344 120" ${NS} role="img" aria-label="촘촘히 모여 있는 입자들이 화살표를 지나 넓게 흩어진 입자로 변하는 모형">
    <rect x="12" y="18" width="94" height="84" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
    ${liq}
    <path d="M128 60h64" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M182 48l14 12-14 12" fill="none" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="206" y="8" width="126" height="104" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
    ${gas}
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
const MINI: Record<string, string> = {
  // 확산 — 중앙에서 퍼져 나가는 입자
  diffuse: `<circle cx="32" cy="32" r="5" fill="#5AA2F8"/>
    <circle cx="16" cy="20" r="3.4" fill="#5AA2F8" opacity=".85"/><circle cx="48" cy="18" r="3.2" fill="#5AA2F8" opacity=".8"/>
    <circle cx="52" cy="42" r="3" fill="#5AA2F8" opacity=".75"/><circle cx="14" cy="46" r="3" fill="#5AA2F8" opacity=".7"/>
    <path d="M27 26l-7-6M38 26l7-7M39 37l8 5M26 38l-8 5" stroke="#9EC5FB" stroke-width="2.4"/>`,
  // 증발 — 수면 위로 떠나는 입자
  evap: `<path d="M10 44q11-6 22 0t22 0" stroke="#5AA2F8" stroke-width="3" fill="none"/>
    <path d="M12 52h40" stroke="#BFDCFF" stroke-width="3"/>
    <circle cx="24" cy="30" r="3.6" fill="#35C7DB"/><circle cx="40" cy="22" r="3.2" fill="#35C7DB" opacity=".85"/>
    <path d="M24 24v-8M40 16v-6" stroke="#8FE3EE" stroke-width="2.4"/>
    <path d="M21 13l3-4 3 4M37 7l3-4 3 4" stroke="#8FE3EE" stroke-width="2.4" fill="none"/>`,
  // 고체 — 규칙 격자
  solid: `${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${18 + c * 14}" cy="${18 + r * 14}" r="5" fill="#5AA2F8"/>`).join("")).join("")}
    <path d="M18 18h28M18 32h28M18 46h28M18 18v28M32 18v28M46 18v28" stroke="#BFDCFF" stroke-width="1.6" opacity=".7"/>`,
  // 액체 — 닿은 채 불규칙
  liquid: `<circle cx="22" cy="26" r="5.4" fill="#8A7CFA"/><circle cx="36" cy="22" r="5.4" fill="#8A7CFA"/>
    <circle cx="46" cy="32" r="5.4" fill="#8A7CFA"/><circle cx="28" cy="38" r="5.4" fill="#8A7CFA"/>
    <circle cx="40" cy="44" r="5.4" fill="#8A7CFA"/><circle cx="18" cy="46" r="5.4" fill="#8A7CFA"/>
    <path d="M50 18q4 4 0 8" stroke="#C9BEFF" stroke-width="2.4" fill="none"/>`,
  // 기체 — 흩어짐 + 꼬리
  gas: `<circle cx="18" cy="16" r="4.2" fill="#F0705E"/><circle cx="48" cy="14" r="4" fill="#F0705E"/>
    <circle cx="32" cy="34" r="4.2" fill="#F0705E"/><circle cx="14" cy="48" r="4" fill="#F0705E"/><circle cx="50" cy="46" r="4.2" fill="#F0705E"/>
    <path d="M12 10l4 4M42 10l4 3M26 30l4 3M9 42l4 4M44 40l4 4" stroke="#FFB1A3" stroke-width="2.4"/>`,
  // 융해·응고 — 얼음⇄물방울
  meltPair: `<rect x="8" y="20" width="20" height="18" rx="5" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.6"/>
    <path d="M46 20c5 6 8 10 8 14a8 8 0 1 1-16 0c0-4 3-8 8-14z" fill="#DCEAFF" stroke="#5AA2F8" stroke-width="2.6"/>
    <path d="M30 24h8M34 20l4 4-4 4" stroke="#FF8A5C" stroke-width="2.4" fill="none"/>
    <path d="M38 44h-8M34 48l-4-4 4-4" stroke="#5AA2F8" stroke-width="2.4" fill="none"/>`,
  // 기화·액화 — 물방울⇄김
  boilPair: `<path d="M16 22c4 5 7 9 7 12a7 7 0 1 1-14 0c0-3 3-7 7-12z" fill="#DCEAFF" stroke="#5AA2F8" stroke-width="2.6"/>
    <g fill="#F0705E"><circle cx="46" cy="18" r="3.4"/><circle cx="56" cy="28" r="3"/><circle cx="44" cy="34" r="3"/></g>
    <path d="M28 24h8M32 20l4 4-4 4" stroke="#FF8A5C" stroke-width="2.4" fill="none"/>
    <path d="M40 46H32M36 50l-4-4 4-4" stroke="#5AA2F8" stroke-width="2.4" fill="none"/>`,
  // 승화 — 얼음⇄김 (액체 건너뜀 아치)
  sublime: `<rect x="8" y="36" width="18" height="16" rx="5" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.6"/>
    <g fill="#F0705E"><circle cx="48" cy="40" r="3.2"/><circle cx="56" cy="48" r="2.8"/><circle cx="46" cy="52" r="2.8"/></g>
    <path d="M16 30q16-20 34 6" stroke="#B49CFF" stroke-width="2.8" fill="none"/>
    <path d="M46 30l4 6-7 1" fill="none" stroke="#B49CFF" stroke-width="2.8"/>
    <path d="M34 14q-3 3 0 6" stroke="#D9CBFF" stroke-width="2" fill="none"/>`,
  // 질량 그대로 — 수평 저울
  mass: `<path d="M32 14v26" stroke="#8B95A1" stroke-width="3"/>
    <path d="M12 22h40" stroke="#8B95A1" stroke-width="3"/>
    <path d="M12 22l-5 12h10zM52 22l-5 12h10z" fill="#DCEAFF" stroke="#5AA2F8" stroke-width="2.2"/>
    <path d="M22 48h20" stroke="#8B95A1" stroke-width="3"/>
    <path d="M26 48l6-8 6 8" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>`,
  // 부피 변화 — 커지는 상자
  volume: `<rect x="10" y="26" width="18" height="18" rx="4" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.4"/>
    <rect x="34" y="14" width="24" height="30" rx="5" fill="none" stroke="#F0705E" stroke-width="2.4" stroke-dasharray="5 4"/>
    <path d="M30 34h6M33 31l3 3-3 3" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
    <path d="M46 8l4-4 4 4M58 22l4-4" stroke="#FFB1A3" stroke-width="2.2" fill="none"/>`,
  // 물은 예외 — 부푼 페트병
  waterIce: `<path d="M26 10h12v6c6 3 9 8 9 14 0 12-6 22-15 22S17 42 17 30c0-6 3-11 9-14z" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.6"/>
    <path d="M22 30l5 5 9-9" stroke="#5AA2F8" stroke-width="2.6" fill="none"/>
    <path d="M12 26l-5-2M12 36l-5 2M52 26l5-2M52 36l5 2" stroke="#9EC5FB" stroke-width="2.4"/>`,
  // 열에너지 흡수 — 물질 속으로 들어가는 화살표
  absorb: `<circle cx="32" cy="34" r="14" fill="rgba(255,138,92,.15)" stroke="#FF8A5C" stroke-width="2.6"/>
    <path d="M10 14l10 10M54 14l-10 10M32 6v14" stroke="#FF8A5C" stroke-width="2.8"/>
    <path d="M28 16l4 4 4-4M16 20l4 4M48 20l-4 4" stroke="#FF8A5C" stroke-width="2.8" fill="none"/>
    <circle cx="32" cy="34" r="4" fill="#FF8A5C"/>`,
  // 온도 일정(수평 구간) — 그래프
  plateau: `<path d="M10 52V12M10 52h44" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M12 46l10-12h14l10-14h12" stroke="#F0705E" stroke-width="3" fill="none"/>
    <path d="M22 34h14M46 20h12" stroke="#FFB03A" stroke-width="4" opacity=".7"/>`,
  // 열에너지 방출 — 밖으로 나가는 물결
  release: `<circle cx="32" cy="32" r="12" fill="rgba(90,162,248,.14)" stroke="#5AA2F8" stroke-width="2.6"/>
    <circle cx="32" cy="32" r="4" fill="#5AA2F8"/>
    <path d="M48 24q5 8 0 16M54 20q7 12 0 24M16 24q-5 8 0 16M10 20q-7 12 0 24" stroke="#FF8A5C" stroke-width="2.6" fill="none"/>`,
  // 주변이 따뜻 — 온도계 상승
  warm: `<rect x="26" y="8" width="12" height="34" rx="6" fill="#fff" stroke="#8B95A1" stroke-width="2.4"/>
    <circle cx="32" cy="48" r="8" fill="#F0705E" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M32 42V20" stroke="#F0705E" stroke-width="4"/>
    <path d="M46 16l6-6M48 28h8" stroke="#FFB1A3" stroke-width="2.4"/>`,
  // 주변이 시원 — 온도계 하강 + 눈송이
  cool: `<rect x="26" y="8" width="12" height="34" rx="6" fill="#fff" stroke="#8B95A1" stroke-width="2.4"/>
    <circle cx="32" cy="48" r="8" fill="#5AA2F8" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M32 42V32" stroke="#5AA2F8" stroke-width="4"/>
    <path d="M50 16v10M45 21h10M46.5 17.5l7 7M53.5 17.5l-7 7" stroke="#9EC5FB" stroke-width="2.2"/>`,
};

export function miniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
