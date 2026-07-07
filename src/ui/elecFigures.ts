// elecFigures — 중2 VII(전기와 자기) 퀴즈·개념 그림 — 손코딩 교육용 SVG(라이트 카드 기준) + recap 미니아트.
// 전하 표현: (+) 붉은 원 / (−) 파란 원(chemKit 전자 톤과 동조). 회로 기호는 실물풍(전지·전구·스위치).

const NS = `xmlns="http://www.w3.org/2000/svg"`;

const plus = (x: number, y: number, r = 7): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#E8836B" stroke="#A8442E" stroke-width="1.2"/><path d="M${x - r * 0.45} ${y}h${r * 0.9}M${x} ${y - r * 0.45}v${r * 0.9}" stroke="#FFF" stroke-width="1.6" stroke-linecap="round"/>`;
const minus = (x: number, y: number, r = 7): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#5A9AE0" stroke="#2A5AA0" stroke-width="1.2"/><path d="M${x - r * 0.45} ${y}h${r * 0.9}" stroke="#FFF" stroke-width="1.6" stroke-linecap="round"/>`;

/** L1 — 마찰 전/후의 털가죽·빨대 대전 상태(마무리 2번) */
export function rubBeforeAfterFig(): string {
  const fur = (x: number, y: number): string => `
    <ellipse cx="${x}" cy="${y}" rx="52" ry="30" fill="#C9975E" stroke="#8A5E2A" stroke-width="1.6"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${x - 44 + i * 11} ${y - 26}q2-7 6-9" stroke="#8A5E2A" stroke-width="1.4" fill="none"/>`).join("")}`;
  const straw = (x: number, y: number): string =>
    `<rect x="${x - 55}" y="${y - 7}" width="110" height="14" rx="7" fill="#7FB0E8" stroke="#3E6EA4" stroke-width="1.6"/>
     <path d="M${x - 46} ${y - 3}h30" stroke="#D6E9FF" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
  return `<svg viewBox="0 0 344 240" ${NS} fill="none" role="img" aria-label="마찰 전에는 둘 다 중성, 마찰 후에는 털가죽이 플러스, 빨대가 마이너스로 대전된다">
    <text x="86" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">마찰 전</text>
    <text x="258" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">마찰 후</text>
    <g>
      ${fur(86, 66)}
      ${plus(66, 58)}${minus(80, 70)}${plus(96, 58)}${minus(106, 70)}
      ${straw(86, 150)}
      ${plus(58, 150, 6)}${minus(76, 150, 6)}${plus(96, 150, 6)}${minus(114, 150, 6)}
      <text x="86" y="196" text-anchor="middle" font-size="11" fill="#8B95A1">둘 다 (+)=(−) — 중성</text>
    </g>
    <path d="M158 110h28M178 104l8 6-8 6" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
    <g>
      ${fur(258, 66)}
      ${plus(238, 58)}${plus(258, 70)}${plus(278, 58)}${minus(266, 54, 6)}
      ${straw(258, 150)}
      ${plus(236, 150, 6)}${minus(222, 150, 6)}${minus(252, 150, 6)}${minus(270, 150, 6)}${minus(288, 150, 6)}
      <text x="258" y="196" text-anchor="middle" font-size="11" fill="#8B95A1">전자가 털가죽 → 빨대로!</text>
    </g>
    <text x="172" y="226" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">마찰 후 — 털가죽 ( ? )전기, 빨대 ( ? )전기</text>
  </svg>`;
}

/** L2 — (−)대전 막대를 깡통에 접근(마무리 5번) */
export function canInductionFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="마이너스 대전체인 플라스틱 막대를 알루미늄 깡통에 가까이 가져가는 그림">
    <line x1="20" y1="158" x2="324" y2="158" stroke="#C9D2DC" stroke-width="2"/>
    <g transform="rotate(-32 84 74)">
      <rect x="34" y="64" width="100" height="17" rx="8" fill="#5E6B7E" stroke="#333D4B" stroke-width="1.6"/>
      ${minus(52, 72, 6)}${minus(76, 72, 6)}${minus(100, 72, 6)}${minus(120, 72, 6)}
    </g>
    <text x="60" y="34" font-size="11.5" font-weight="700" fill="#4E5968">(−)대전 플라스틱 막대</text>
    <g>
      <rect x="170" y="88" width="128" height="66" rx="33" fill="#D8E2EE" stroke="#8B99AC" stroke-width="2"/>
      <ellipse cx="176" cy="121" rx="12" ry="33" fill="#B8C6D8" stroke="#8B99AC" stroke-width="1.6"/>
      <text x="240" y="80" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">알루미늄 깡통</text>
      <text x="196" y="126" font-size="14" font-weight="800" fill="#C43A2E">(가)</text>
      <text x="266" y="126" font-size="14" font-weight="800" fill="#2E5AA8">(나)</text>
    </g>
    <path d="M150 120q-10 8 0 16" stroke="#F0A422" stroke-width="2" fill="none"/>
    <text x="172" y="180" text-anchor="middle" font-size="11" fill="#8B95A1">(가)는 막대와 가까운 쪽, (나)는 먼 쪽</text>
  </svg>`;
}

/** L4 — 어떤 니크롬선의 전압-전류 그래프(마무리 3번: 저항 구하기 — 3V에 300mA → 10Ω) */
export function viGraphFig(): string {
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="원점을 지나는 직선 그래프 — 전압 3볼트에서 전류 300밀리암페어">
    <line x1="52" y1="20" x2="52" y2="170" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="170" x2="320" y2="170" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[1, 2, 3].map((v) => `<line x1="${52 + v * 80}" y1="170" x2="${52 + v * 80}" y2="174" stroke="#B0B8C1" stroke-width="1.4"/><text x="${52 + v * 80}" y="188" text-anchor="middle" font-size="11" fill="#6B7684">${v}</text>`).join("")}
    ${[100, 200, 300].map((c, i) => `<line x1="48" y1="${170 - (i + 1) * 44}" x2="52" y2="${170 - (i + 1) * 44}" stroke="#B0B8C1" stroke-width="1.4"/><text x="42" y="${174 - (i + 1) * 44}" text-anchor="end" font-size="11" fill="#6B7684">${c}</text>`).join("")}
    ${[0.5, 1, 1.5, 2, 2.5, 3].map((v) => `<circle cx="${52 + v * 80}" cy="${170 - v * 44}" r="3.4" fill="#3182F6"/>`).join("")}
    <line x1="52" y1="170" x2="308" y2="${170 - 3.2 * 44}" stroke="#3182F6" stroke-width="2" opacity=".55"/>
    <path d="M292 38v${170 - 38}" stroke="#F0A422" stroke-width="1.4" stroke-dasharray="4 4"/>
    <path d="M52 ${170 - 3 * 44}h240" stroke="#F0A422" stroke-width="1.4" stroke-dasharray="4 4"/>
    <text x="24" y="16" font-size="11.5" font-weight="700" fill="#4E5968">전류(mA)</text>
    <text x="320" y="200" text-anchor="end" font-size="11.5" font-weight="700" fill="#4E5968">전압(V)</text>
  </svg>`;
}

/** L3 — 회로 속 전류의 방향 문제(마무리 4번: (가)(나)는 전류 방향, 전자는 그 반대) */
export function electronFlowFig(): string {
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="전지와 전구가 연결된 회로 — (가)와 (나)는 전류가 흐르는 방향">
    <path d="M92 156h-40V44h240v112h-40" stroke="#8B95A1" stroke-width="4" fill="none" stroke-linecap="round"/>
    <rect x="92" y="140" width="120" height="32" rx="7" fill="#AEBDD6" stroke="#4E5A70" stroke-width="1.8"/>
    <text x="122" y="161" font-size="15" font-weight="800" fill="#333D4B">+</text>
    <text x="182" y="161" font-size="15" font-weight="800" fill="#333D4B">−</text>
    <circle cx="172" cy="44" r="19" fill="#FFF3C4" stroke="#C8A23E" stroke-width="1.8"/>
    <path d="M164 50q4-8 8-1t8-1" stroke="#E8963E" stroke-width="2" fill="none"/>
    <path d="M52 116v-26M47 96l5-7 5 7" stroke="#2E5AA8" stroke-width="2.6" fill="none"/>
    <text x="40" y="110" text-anchor="end" font-size="13" font-weight="800" fill="#2E5AA8">(가)</text>
    <path d="M292 90v26M287 110l5 7 5-7" stroke="#2E5AA8" stroke-width="2.6" fill="none"/>
    <text x="304" y="108" font-size="13" font-weight="800" fill="#2E5AA8">(나)</text>
    <text x="172" y="192" text-anchor="middle" font-size="11" fill="#8B95A1">(가)·(나)는 전류의 방향이에요 — 전자는 어느 쪽일까요?</text>
  </svg>`;
}

/** L5 — 병렬 전구 (가)(나) 회로(마무리 6번) */
export function parallelBulbsFig(): string {
  const bulb = (x: number, y: number, label: string): string => `
    <circle cx="${x}" cy="${y}" r="16" fill="#FFF3C4" stroke="#C8A23E" stroke-width="1.8"/>
    <path d="M${x - 7} ${y + 4}q3.5-7 7-1t7-1" stroke="#E8963E" stroke-width="1.8" fill="none"/>
    <text x="${x}" y="${y - 24}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="전구 두 개가 병렬로 연결된 회로, 나 전구 가지에 스위치가 있다">
    <path d="M60 166V56h224v110z" stroke="#8B95A1" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M116 56v-34h112v34" stroke="#8B95A1" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${bulb(172, 56, "")}
    ${bulb(172, 22, "")}
    <text x="150" y="62" text-anchor="end" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
    <text x="150" y="28" text-anchor="end" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
    <rect x="122" y="150" width="100" height="30" rx="7" fill="#AEBDD6" stroke="#4E5A70" stroke-width="1.8"/>
    <text x="146" y="170" font-size="14" font-weight="800" fill="#333D4B">+</text>
    <text x="196" y="170" font-size="14" font-weight="800" fill="#333D4B">−</text>
    <circle cx="196" cy="22" r="4" fill="#5E6B7E"/>
    <path d="M196 22l15-9" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <circle cx="214" cy="22" r="4" fill="#5E6B7E"/>
    <text x="205" y="12" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치</text>
  </svg>`;
}

/** L5 개념 — 직렬 비유: 한 물길에 물레방아 두 개(높이를 나눠 갖고, 물살은 하나) */
export function seriesWaterFig(): string {
  const wheel = (x: number, y: number, r: number): string => `
    <circle cx="${x}" cy="${y}" r="${r}" stroke="#C9A05E" stroke-width="4" fill="none"/>
    ${[0, 1, 2, 3].map((i) => `<line x1="${x}" y1="${y}" x2="${(x + Math.cos((i / 4) * Math.PI * 2 + 0.4) * r).toFixed(1)}" y2="${(y + Math.sin((i / 4) * Math.PI * 2 + 0.4) * r).toFixed(1)}" stroke="#8A6A34" stroke-width="3"/>`).join("")}`;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="직렬 비유 — 하나의 물길이 두 물레방아를 차례로 돌린다. 높이차를 나눠 갖고 물살은 같다">
    <path d="M36 28h60l14 40h60l14 40h60l14 40h50" stroke="#7FB0E8" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M36 28h60l14 40h60l14 40h60l14 40h50" stroke="#BFDCFF" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${wheel(124, 62, 22)}
    ${wheel(198, 102, 22)}
    <path d="M96 34v34M96 51h-8M96 51h8" stroke="#F0A422" stroke-width="1.8"/>
    <text x="72" y="56" text-anchor="end" font-size="11" font-weight="800" fill="#E8961E">높이 ①</text>
    <path d="M170 74v34M170 91h-8M170 91h8" stroke="#F0A422" stroke-width="1.8"/>
    <text x="160" y="96" text-anchor="end" font-size="11" font-weight="800" fill="#E8961E">높이 ②</text>
    <text x="172" y="176" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">물길은 하나 — <tspan font-weight="800">물살(전류)은 어디서나 같다!</tspan></text>
    <text x="172" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">전체 높이차(전압)는 방아 둘이 <tspan font-weight="800">나눠</tspan> 쓴다</text>
  </svg>`;
}

/** L5 개념 — 병렬 비유: 같은 높이에서 갈라진 두 물길(높이는 같고, 물이 나뉜다) */
export function parallelWaterFig(): string {
  const wheel = (x: number, y: number, r: number): string => `
    <circle cx="${x}" cy="${y}" r="${r}" stroke="#C9A05E" stroke-width="4" fill="none"/>
    ${[0, 1, 2, 3].map((i) => `<line x1="${x}" y1="${y}" x2="${(x + Math.cos((i / 4) * Math.PI * 2 + 0.4) * r).toFixed(1)}" y2="${(y + Math.sin((i / 4) * Math.PI * 2 + 0.4) * r).toFixed(1)}" stroke="#8A6A34" stroke-width="3"/>`).join("")}`;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="병렬 비유 — 같은 높이에서 두 물길로 갈라져 물레방아를 하나씩 돌린다. 높이차는 같고 물이 나뉜다">
    <path d="M30 40h70" stroke="#7FB0E8" stroke-width="11" stroke-linecap="round"/>
    <path d="M100 40q30 0 30 26l0 20M100 40q60 8 96 8l60 0" stroke="#7FB0E8" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M130 86l0 34q0 26 40 26h130M256 48l0 72" stroke="#7FB0E8" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M256 120q0 26 30 26" stroke="#7FB0E8" stroke-width="9" fill="none" stroke-linecap="round"/>
    ${wheel(130, 104, 21)}
    ${wheel(256, 86, 21)}
    <path d="M312 54v82M312 95h-8M312 95h8" stroke="#F0A422" stroke-width="1.8"/>
    <text x="312" y="48" text-anchor="middle" font-size="10.5" font-weight="800" fill="#E8961E">같은 높이!</text>
    <text x="172" y="176" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">두 방아 모두 <tspan font-weight="800">같은 높이차(전압)</tspan>에서 돈다</text>
    <text x="172" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">대신 물(전류)은 두 길로 <tspan font-weight="800">나뉜다</tspan> — 합치면 전체!</text>
  </svg>`;
}

/** L8 — 전동기 원리(코일 좌우 전류 반대 → 힘 반대 → 회전) */
export function motorFig(): string {
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="전동기 구조 — 자석 사이 코일의 왼쪽과 오른쪽에 반대 방향 전류가 흘러 반대 방향 힘을 받아 회전한다">
    <rect x="26" y="48" width="42" height="120" rx="8" fill="#E8836B" stroke="#A8442E" stroke-width="1.8"/>
    <text x="47" y="115" text-anchor="middle" font-size="17" font-weight="800" fill="#FFF">N</text>
    <rect x="276" y="48" width="42" height="120" rx="8" fill="#7FA6E8" stroke="#2E5AA8" stroke-width="1.8"/>
    <text x="297" y="115" text-anchor="middle" font-size="17" font-weight="800" fill="#FFF">S</text>
    <path d="M84 108h176" stroke="#C9D2DC" stroke-width="1.6" stroke-dasharray="5 5"/>
    <text x="172" y="100" text-anchor="middle" font-size="10.5" fill="#8B95A1">자기장: N → S</text>
    <g stroke="#C97F3A" stroke-width="6" fill="none" stroke-linecap="round">
      <path d="M124 66v88M220 66v88M124 66h96M124 154h96"/>
    </g>
    <path d="M124 100l0 22M119 116l5 7 5-7" stroke="#E8961E" stroke-width="2.4" fill="none"/>
    <path d="M220 122l0-22M215 106l5-7 5 7" stroke="#E8961E" stroke-width="2.4" fill="none"/>
    <path d="M124 44v-18M119 32l5-7 5 7" stroke="#0B9E96" stroke-width="3" fill="none"/>
    <text x="124" y="16" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0B9E96">힘 ↑</text>
    <path d="M220 176v18M215 188l5 7 5-7" stroke="#0B9E96" stroke-width="3" fill="none"/>
    <text x="220" y="212" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0B9E96">힘 ↓</text>
    <path d="M158 186a40 26 0 1 0 8-4" stroke="#8B95A1" stroke-width="2" fill="none"/>
    <path d="M162 180l-6 7 9 2z" fill="#8B95A1"/>
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
const MINI: Record<string, string> = {
  sparkMini: `<path d="M34 8L20 32h8l-4 22 17-26h-9z" fill="#F5C400" stroke="#B8860B" stroke-width="1.6" stroke-linejoin="round"/>`,
  rubMini: `<ellipse cx="22" cy="22" rx="16" ry="10" fill="#C9975E"/><rect x="28" y="38" width="30" height="8" rx="4" fill="#7FB0E8"/>
    <circle cx="40" cy="28" r="5" fill="#5A9AE0"/><path d="M38 28h4" stroke="#FFF" stroke-width="1.6"/>
    <path d="M34 22q6-4 8 2" stroke="#8B95A1" stroke-width="1.6" fill="none"/>`,
  forceMini: `<circle cx="20" cy="32" r="9" fill="#E8836B"/><path d="M16 32h8M20 28v8" stroke="#FFF" stroke-width="2"/>
    <circle cx="46" cy="32" r="9" fill="#5A9AE0"/><path d="M42 32h8" stroke="#FFF" stroke-width="2"/>
    <path d="M30 32h6M34 29l3 3-3 3M36 32h-6" stroke="#4E5968" stroke-width="1.8" fill="none"/>`,
  inductMini: `<rect x="8" y="24" width="26" height="9" rx="4.5" fill="#5E6B7E" transform="rotate(-18 21 28)"/>
    <rect x="30" y="34" width="28" height="16" rx="8" fill="#D8E2EE" stroke="#8B99AC" stroke-width="1.6"/>
    <text x="36" y="46" font-size="10" font-weight="800" fill="#C43A2E">+</text>
    <text x="50" y="46" font-size="10" font-weight="800" fill="#2E5AA8">−</text>`,
  currentMini: `<path d="M8 32h48" stroke="#8FA4C2" stroke-width="4" stroke-linecap="round"/>
    <circle cx="20" cy="32" r="3" fill="#F0A422"/><circle cx="34" cy="32" r="3" fill="#F0A422"/><circle cx="48" cy="32" r="3" fill="#F0A422"/>
    <path d="M52 26l6 6-6 6" stroke="#F0A422" stroke-width="2" fill="none"/>`,
  voltMini: `<rect x="12" y="36" width="14" height="16" rx="3" fill="#C23A28"/>
    <path d="M19 34V16h24v14" stroke="#7FB0E8" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M40 42v-8M36 38h8" stroke="#F0A422" stroke-width="2"/>
    <circle cx="43" cy="46" r="9" stroke="#C9A05E" stroke-width="2.6" fill="none"/>`,
  ohmMini: `<path d="M12 52V14M12 52h42" stroke="#8B95A1" stroke-width="2"/>
    <path d="M12 52L50 20" stroke="#3182F6" stroke-width="2.6"/>
    <circle cx="24" cy="42" r="2.4" fill="#3182F6"/><circle cx="36" cy="32" r="2.4" fill="#3182F6"/><circle cx="46" cy="24" r="2.4" fill="#3182F6"/>`,
  seriesMini: `<path d="M8 32h12M28 32h8M44 32h12" stroke="#8FA4C2" stroke-width="3.4" stroke-linecap="round"/>
    <circle cx="24" cy="32" r="5.5" fill="#FFE9A8" stroke="#C8A23E" stroke-width="1.4"/>
    <circle cx="40" cy="32" r="5.5" fill="#FFE9A8" stroke="#C8A23E" stroke-width="1.4"/>`,
  parallelMini: `<path d="M10 32h8M46 32h8M18 32q6-14 14-14t14 14M18 32q6 14 14 14t14-14" stroke="#8FA4C2" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="18" r="5.5" fill="#FFE9A8" stroke="#C8A23E" stroke-width="1.4"/>
    <circle cx="32" cy="46" r="5.5" fill="#FFE9A8" stroke="#C8A23E" stroke-width="1.4"/>`,
  energyMini: `<circle cx="24" cy="26" r="12" fill="#FFE9A8" stroke="#C8A23E" stroke-width="1.8"/>
    <path d="M20 28q2-5 4-1t4-1" stroke="#E8963E" stroke-width="1.6" fill="none"/>
    <path d="M42 18l6 6M44 30l8 2M40 40l6 6" stroke="#F0A422" stroke-width="2.2"/>`,
  fieldMini: `<ellipse cx="32" cy="32" rx="22" ry="12" stroke="#8B95A1" stroke-width="1.8" fill="none"/>
    <ellipse cx="32" cy="32" rx="12" ry="6" stroke="#B0B8C1" stroke-width="1.6" fill="none"/>
    <circle cx="32" cy="32" r="4" fill="#C97F3A"/>
    <path d="M54 30l-4 4" stroke="#E0452E" stroke-width="2.4"/>`,
  compassMini: `<circle cx="32" cy="32" r="16" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
    <path d="M32 20l5 12-5 12-5-12z" fill="#E0452E"/><path d="M32 44l-5-12h10z" fill="#B0B8C1"/>`,
  swingMini: `<path d="M14 12h36" stroke="#5E7090" stroke-width="3"/>
    <path d="M22 12l6 26M42 12l-6 26" stroke="#C97F3A" stroke-width="2.6"/>
    <path d="M28 38h8" stroke="#C97F3A" stroke-width="3.4"/>
    <path d="M40 40l10 4M46 40l4 4-4 4" stroke="#0B9E96" stroke-width="2" fill="none"/>`,
  motorMini: `<circle cx="32" cy="32" r="15" stroke="#C97F3A" stroke-width="3" fill="none"/>
    <path d="M32 17a15 15 0 0 1 12 24" stroke="#0B9E96" stroke-width="3" fill="none"/>
    <path d="M44 41l2-6-7 1z" fill="#0B9E96"/>
    <rect x="6" y="24" width="8" height="16" rx="2" fill="#E8836B"/>
    <rect x="50" y="24" width="8" height="16" rx="2" fill="#7FA6E8"/>`,
};

export function elecMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
