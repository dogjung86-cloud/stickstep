// 기체의 성질 단원(VI) 퀴즈·개념 그림 — 손코딩 교육용 SVG. 라이트(흰 카드) 기준.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** VI-2 고무풍선 속 기체 입자 — 모든 방향 화살표 (L1 문제) */
export function balloonParticleFig(): string {
  const P: [number, number, number][] = [
    [150, 66, -0.9], [196, 96, 0.3], [156, 128, 2.4], [216, 60, -0.2], [236, 128, 1.2], [186, 152, 1.8],
  ];
  const parts = P.map(([x, y, a]) => {
    const dx = Math.cos(a) * 20;
    const dy = Math.sin(a) * 20;
    return `<circle cx="${x}" cy="${y}" r="7" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1.6"/>
      <path d="M${x + dx * 0.55} ${y + dy * 0.55}L${x + dx} ${y + dy}" stroke="#5E6B7E" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M${x + dx} ${y + dy}l${-dx * 0.28 - dy * 0.16} ${-dy * 0.28 + dx * 0.16}M${x + dx} ${y + dy}l${-dx * 0.28 + dy * 0.16} ${-dy * 0.28 - dx * 0.16}" stroke="#5E6B7E" stroke-width="2" stroke-linecap="round"/>`;
  }).join("");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="풍선 단면 속에서 여러 방향으로 움직이는 기체 입자들">
    <path d="M64 100c0-42 30-70 66-70 20 0 34 8 44 20l-18 130c-52-4-92-34-92-80z" fill="#FFE9A8" stroke="#E8B54A" stroke-width="2.4" opacity=".55"/>
    <path d="M110 178l8 12h-20z" fill="#E8B54A"/>
    <rect x="128" y="34" width="132" height="136" rx="14" fill="#FFF7E2" stroke="#E8B54A" stroke-width="2"/>
    <text x="134" y="26" font-size="11.5" fill="#8B95A1">풍선 안쪽 확대</text>
    ${parts}
  </svg>`;
}

/** VI-3 압력-부피 반비례 곡선 (자체 수치: 1기압 24mL · 2기압 12mL · 4기압 6mL) */
export function pvCurveFig(): string {
  const gx = (p: number): number => 56 + ((p - 0) / 4.6) * 264;
  const gy = (v: number): number => 176 - (v / 27.6) * 148;
  let d = "";
  for (let p = 0.9; p <= 4.4; p += 0.05) d += `${d ? "L" : "M"}${gx(p).toFixed(1)} ${gy(24 / p).toFixed(1)}`;
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="압력에 따른 부피 반비례 그래프. 1기압 24밀리리터, 2기압 12밀리리터, 4기압 6밀리리터">
    <line x1="56" y1="20" x2="56" y2="176" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="56" y1="176" x2="326" y2="176" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[24, 12, 6].map((v) => `<line x1="56" y1="${gy(v)}" x2="320" y2="${gy(v)}" stroke="#EDF0F4"/><text x="48" y="${gy(v) + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">${v}</text>`).join("")}
    ${[1, 2, 3, 4].map((p) => `<text x="${gx(p)}" y="192" text-anchor="middle" font-size="10.5" fill="#8B95A1">${p}</text>`).join("")}
    <path d="${d}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${[[1, 24], [2, 12], [4, 6]].map(([p, v]) => `<circle cx="${gx(p)}" cy="${gy(v)}" r="4.2" fill="#5E6B7E"/><line x1="${gx(p)}" y1="${gy(v)}" x2="${gx(p)}" y2="176" stroke="#C9D2DC" stroke-width="1.2" stroke-dasharray="3 4"/>`).join("")}
    <text x="16" y="14" font-size="11" fill="#4E5968">부피(mL)</text>
    <text x="326" y="206" text-anchor="end" font-size="11" fill="#4E5968">압력(기압)</text>
  </svg>`;
}

/** 마무리 4번 — 그래프 모양 고르기(①~⑤) */
export function graphChoicesFig(): string {
  const cell = (i: number, x: number, y: number, path: string): string =>
    `<g transform="translate(${x},${y})">
      <text x="0" y="10" font-size="12" font-weight="700" fill="#4E5968">${["①", "②", "③", "④", "⑤"][i]}</text>
      <line x1="16" y1="14" x2="16" y2="66" stroke="#B0B8C1" stroke-width="1.4"/>
      <line x1="16" y1="66" x2="92" y2="66" stroke="#B0B8C1" stroke-width="1.4"/>
      <path d="${path}" stroke="#5E6B7E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <text x="8" y="24" font-size="8.5" fill="#8B95A1">부피</text>
      <text x="92" y="76" text-anchor="end" font-size="8.5" fill="#8B95A1">압력</text>
    </g>`;
  return `<svg viewBox="0 0 344 180" ${NS} fill="none" role="img" aria-label="부피와 압력 그래프 보기 다섯 개">
    ${cell(0, 8, 6, "M20 22 L86 62")}
    ${cell(1, 122, 6, "M20 62 L86 22")}
    ${cell(2, 236, 6, "M20 20 C34 22 34 40 46 48 C58 56 74 58 88 59")}
    ${cell(3, 8, 96, "M20 30h66")}
    ${cell(4, 122, 96, "M20 24 L52 56 L86 56")}
  </svg>`;
}

/** 마무리 5번/VI-4 — 실린더+추: (가) 추 1개 큰 부피, (나) 추 2개 절반 부피 */
export function pistonWeightsFig(): string {
  const jar = (x: number, label: string, pistonY: number, weights: number, parts: [number, number][]): string => {
    const w = 108;
    const bot = 158;
    return `<g>
      <rect x="${x}" y="40" width="${w}" height="${bot - 40}" rx="8" fill="#F4F8FC" stroke="#9DAABD" stroke-width="2"/>
      <rect x="${x + 4}" y="${pistonY}" width="${w - 8}" height="10" rx="4" fill="#8B99AC"/>
      <rect x="${x + w / 2 - 3}" y="${pistonY - 22}" width="6" height="22" fill="#8B99AC"/>
      ${Array.from({ length: weights }, (_, i) => `<rect x="${x + w / 2 - 11 - (weights - 1) * 7 + i * 22}" y="${pistonY - 40}" width="20" height="17" rx="3" fill="#E8C06A" stroke="#B08D3E" stroke-width="1.6"/>`).join("")}
      ${parts.map(([px, py]) => `<circle cx="${x + px}" cy="${py}" r="6" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1.4"/>`).join("")}
      <text x="${x + w / 2}" y="176" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 186" ${NS} fill="none" role="img" aria-label="실린더 두 개. 가는 추 한 개에 부피가 크고, 나는 추 두 개에 부피가 절반">
    ${jar(38, "(가)", 68, 1, [[26, 96], [58, 88], [86, 104], [36, 128], [70, 122], [88, 142], [48, 146]])}
    ${jar(198, "(나)", 108, 2, [[24, 122], [50, 130], [78, 124], [36, 146], [66, 144], [88, 138], [54, 118]])}
  </svg>`;
}

/** 마무리 7번 — 부피-온도 직선 위 (가)(나)(다) */
export function tempVolLineFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="온도에 따른 부피 직선 그래프 위의 세 점 가, 나, 다">
    <line x1="52" y1="18" x2="52" y2="158" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="158" x2="322" y2="158" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="132" x2="310" y2="52" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${[[92, 120, "(가)"], [180, 94, "(나)"], [268, 68, "(다)"]].map(([x, y, t]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="#5E6B7E"/><text x="${x}" y="${Number(y) - 10}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${t}</text>`).join("")}
    <text x="14" y="14" font-size="11" fill="#4E5968">부피(mL)</text>
    <text x="322" y="176" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
const MINI: Record<string, string> = {
  pressDef: `<path d="M18 10l6 26M46 10l-6 26" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M24 36h16l-3 8h-10z" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2"/>
    <path d="M14 52h36" stroke="#C4CAD2" stroke-width="2.4"/>
    <path d="M27 44l5 8M37 44l-5 8" stroke="#F04452" stroke-width="2.2"/>`,
  gasHit: `<rect x="10" y="14" width="44" height="38" rx="9" fill="none" stroke="#8B95A1" stroke-width="2.6"/>
    <circle cx="24" cy="30" r="4.6" fill="#5AA2F8"/><path d="M28 27l8-6" stroke="#5AA2F8" stroke-width="2"/>
    <circle cx="40" cy="42" r="4.6" fill="#5AA2F8"/><path d="M44 40l7 3" stroke="#5AA2F8" stroke-width="2"/>
    <circle cx="34" cy="20" r="4.6" fill="#5AA2F8"/><path d="M31 17l-6-5" stroke="#5AA2F8" stroke-width="2"/>
    <path d="M54 40l5 2M12 12l-4-4" stroke="#F0A422" stroke-width="2.4"/>`,
  boylePiston: `<rect x="8" y="22" width="48" height="22" rx="6" fill="#EAF2FD" stroke="#8B95A1" stroke-width="2.2"/>
    <rect x="24" y="24" width="6" height="18" rx="2" fill="#5E6B7E"/>
    <path d="M20 33h-12" stroke="#5E6B7E" stroke-width="3"/>
    <circle cx="38" cy="30" r="3" fill="#5AA2F8"/><circle cx="47" cy="36" r="3" fill="#5AA2F8"/><circle cx="41" cy="39" r="3" fill="#5AA2F8"/>
    <path d="M14 52h36" stroke="#F04452" stroke-width="2.4"/><path d="M46 48l6 4-6 4" fill="none" stroke="#F04452" stroke-width="2.2"/>`,
  inverseCurve: `<path d="M12 10v42h42" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M16 14 C24 16 22 30 30 36 C38 42 46 44 52 45" stroke="#37B6D8" stroke-width="3" fill="none"/>
    <circle cx="18" cy="16" r="2.6" fill="#37B6D8"/><circle cx="30" cy="36" r="2.6" fill="#37B6D8"/><circle cx="48" cy="44" r="2.6" fill="#37B6D8"/>`,
  snackBag: `<path d="M18 14h28l4 38a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" fill="#FFE9A8" stroke="#E8961E" stroke-width="2.2"/>
    <path d="M18 14q14 8 28 0" stroke="#E8961E" stroke-width="2" fill="none"/>
    <path d="M10 30l-4-4M56 28l4-4M8 44h-6M60 42h6" stroke="#5AA2F8" stroke-width="2.2"/>`,
  diverMini: `<path d="M8 16q10-5 18 0t18 0 14 0" stroke="#5AA2F8" stroke-width="2.2" fill="none"/>
    <circle cx="40" cy="46" r="5" fill="none" stroke="#37B6D8" stroke-width="2"/>
    <circle cx="34" cy="32" r="7" fill="none" stroke="#37B6D8" stroke-width="2.2"/>
    <circle cx="28" cy="17" r="9.5" fill="none" stroke="#37B6D8" stroke-width="2.4"/>`,
  charlesHeat: `<rect x="26" y="8" width="12" height="34" rx="6" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
    <circle cx="32" cy="48" r="8" fill="#F25C54"/>
    <rect x="29" y="22" width="6" height="20" rx="3" fill="#F25C54"/>
    <path d="M46 30h8M50 26l4 4-4 4" stroke="#F0A422" stroke-width="2.4" fill="none"/>`,
  linearLine: `<path d="M12 10v42h42" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M16 46 L50 18" stroke="#F0A422" stroke-width="3"/>
    <circle cx="22" cy="41" r="2.6" fill="#F0A422"/><circle cx="34" cy="31" r="2.6" fill="#F0A422"/><circle cx="46" cy="21" r="2.6" fill="#F0A422"/>`,
  hotairMini: `<ellipse cx="32" cy="22" rx="16" ry="18" fill="#FFD98A" stroke="#E8961E" stroke-width="2.2"/>
    <path d="M24 38l3 8M40 38l-3 8" stroke="#8B95A1" stroke-width="2"/>
    <rect x="26" y="46" width="12" height="9" rx="2.5" fill="#C89A5A" stroke="#8A5F30" stroke-width="1.8"/>
    <path d="M30 40q2-4 4 0" stroke="#F25C54" stroke-width="2.2" fill="none"/>`,
  soccerCold: `<circle cx="30" cy="34" r="16" fill="#fff" stroke="#5E6B7E" stroke-width="2.4"/>
    <path d="M20 26q8 8 4 14q6 2 10-3" fill="none" stroke="#8B95A1" stroke-width="2"/>
    <path d="M30 30l4-5 5 3-1 6-6 1z" fill="#5E6B7E"/>
    <path d="M50 16l3-3M54 24h4M50 32l3 3" stroke="#37B6D8" stroke-width="2.2"/>`,
};

export function gasMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
