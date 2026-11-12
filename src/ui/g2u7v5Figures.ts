// 중2 Ⅶ v5의 문제 그림과 정리 카드의 작은 그림. 모두 계산으로 그린다(눈대중 좌표 없음).
// 정리 카드의 그림 가운데 지금 단원의 것(ui/elecFigures의 elecMiniArt)으로 충분한 카드는 그것을 쓰고, 새 카드에 필요한 것만 여기에 둔다.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 전압과 전류의 그래프 문제 그림: 니크롬선 A(20 Ω)와 B(10 Ω). 눈금은 전압 2 V, 전류 0.1 A 간격. */
export function viPairFig(): string {
  const x0 = 52;
  const y0 = 168;
  const gw = 228;
  const gh = 132;
  const X = (v: number): number => x0 + (v / 6) * gw;
  const Y = (a: number): number => y0 - (a / 0.6) * gh;
  let grid = "";
  for (let i = 1; i <= 3; i++) grid += `<path d="M${X(i * 2)} ${y0}V${y0 - gh}" stroke="#E5E8EB"/><text x="${X(i * 2)}" y="${y0 + 16}" text-anchor="middle">${i * 2}</text>`;
  for (let i = 1; i <= 6; i++) grid += `<path d="M${x0} ${Y(i * 0.1)}H${x0 + gw}" stroke="#E5E8EB"/><text x="${x0 - 7}" y="${Y(i * 0.1) + 4}" text-anchor="end">${(i * 0.1).toFixed(1)}</text>`;
  const dot = (v: number, a: number, c: string): string => `<circle cx="${X(v)}" cy="${Y(a)}" r="4" fill="${c}"/>`;
  return `<svg viewBox="0 0 320 204" ${NS} role="img" aria-label="전압과 전류의 그래프. 원점을 지나는 직선 A와 B가 있고 B가 A보다 가파르다" font-family="Pretendard, sans-serif" font-size="12" fill="#4E5968">
    ${grid}
    <path d="M${x0} ${y0 - gh - 8}V${y0}H${x0 + gw + 8}" stroke="#333D4B" stroke-width="1.5" fill="none"/>
    <text x="${x0}" y="${y0 + 16}" text-anchor="middle">0</text>
    <text x="${x0 + gw + 6}" y="${y0 + 32}" text-anchor="end" font-weight="700" fill="#333D4B">전압(V)</text>
    <text x="${x0 - 30}" y="${y0 - gh - 14}" font-weight="700" fill="#333D4B">전류(A)</text>
    <path d="M${X(0)} ${Y(0)}L${X(6)} ${Y(0.3)}" stroke="#3182F6" stroke-width="2.4"/>
    <path d="M${X(0)} ${Y(0)}L${X(6)} ${Y(0.6)}" stroke="#F0902B" stroke-width="2.4"/>
    ${dot(2, 0.1, "#3182F6")}${dot(4, 0.2, "#3182F6")}${dot(6, 0.3, "#3182F6")}${dot(2, 0.2, "#F0902B")}${dot(4, 0.4, "#F0902B")}${dot(6, 0.6, "#F0902B")}
    <text x="${X(6) + 6}" y="${Y(0.3) + 4}" font-size="14" font-weight="800" fill="#1B64DA">A</text>
    <text x="${X(6) + 6}" y="${Y(0.6) + 6}" font-size="14" font-weight="800" fill="#C96A10">B</text>
  </svg>`;
}

/** 전구 두 개의 회로 문제 그림. series: 한 줄, parallel: 두 갈래(아래 갈래에 스위치). 전구 이름은 (가), (나). */
export function twoBulbFig(kind: "series" | "parallel"): string {
  const bulb = (x: number, y: number, name: string): string =>
    `<circle cx="${x}" cy="${y}" r="15" fill="#FFF3C4" stroke="#333D4B" stroke-width="1.5"/><path d="M${x - 9} ${y - 9}L${x + 9} ${y + 9}M${x + 9} ${y - 9}L${x - 9} ${y + 9}" stroke="#333D4B" stroke-width="1.3"/><text x="${x}" y="${y - 22}" text-anchor="middle" font-weight="800" fill="#333D4B">${name}</text>`;
  const batt = `<path d="M150 168V152M150 184V168" stroke="none"/><path d="M148 156V180" stroke="#333D4B" stroke-width="2.2"/><path d="M158 162V174" stroke="#333D4B" stroke-width="4"/><text x="140" y="150" text-anchor="middle">(+)</text><text x="168" y="150" text-anchor="middle">(−)</text>`;
  const body =
    kind === "series"
      ? `<path d="M148 168H40V56H95M125 56H195M225 56H280V168H158" fill="none" stroke="#333D4B" stroke-width="1.6"/>${bulb(110, 56, "(가)")}${bulb(210, 56, "(나)")}`
      : `<path d="M148 168H40V48H145M175 48H280V168H158M40 108H100M132 104L104 96M132 108H145M175 108H280" fill="none" stroke="#333D4B" stroke-width="1.6"/><circle cx="102" cy="108" r="2.6" fill="#333D4B"/><circle cx="132" cy="108" r="2.6" fill="#333D4B"/><text x="117" y="130" text-anchor="middle">스위치</text>${bulb(160, 48, "(가)")}${bulb(160, 108, "(나)")}`;
  const alt = kind === "series" ? "전지에 전구 (가)와 (나)를 한 줄로 이은 회로" : "전지에 전구 (가)와 (나)를 두 갈래로 나눠 이은 회로. (나)가 있는 갈래에 스위치가 있다";
  return `<svg viewBox="0 0 320 196" ${NS} role="img" aria-label="${alt}" font-family="Pretendard, sans-serif" font-size="12" fill="#4E5968">${body}${batt}</svg>`;
}

const MINI: Record<string, string> = {
  resistMini: `<path d="M6 32h10l4-10 8 20 8-20 8 20 4-10h10" stroke="#C79400" stroke-width="3.2"/><path d="M12 50h40" stroke="#C9D1DE" stroke-width="2.4"/>`,
  conductMini: `<rect x="8" y="14" width="48" height="14" rx="7" fill="#F2C879" stroke="#B5852A" stroke-width="2"/><path d="M16 21h26m0 0l-6-4m6 4l-6 4" stroke="#8A5A00" stroke-width="2.4"/><rect x="8" y="38" width="48" height="14" rx="7" fill="#E5E8EB" stroke="#8B95A1" stroke-width="2"/><path d="M26 41l12 8m0-8l-12 8" stroke="#8B95A1" stroke-width="2.4"/>`,
  wattMini: `<circle cx="32" cy="34" r="20" fill="#FFF7DC" stroke="#C79400" stroke-width="2.6"/><path d="M32 34V20M32 34l9 6" stroke="#8A6500" stroke-width="3"/><path d="M26 8h12" stroke="#C79400" stroke-width="3"/>`,
  effMini: `<rect x="8" y="22" width="48" height="20" rx="6" fill="#FFD9D2" stroke="#D9735F" stroke-width="2"/><rect x="8" y="22" width="19" height="20" rx="6" fill="#FFE08A" stroke="#C79400" stroke-width="2"/><path d="M17 12v6m-5-4l3 4m7-4l-3 4" stroke="#C79400" stroke-width="2.2"/>`,
  standbyMini: `<rect x="18" y="12" width="28" height="26" rx="6" fill="#EEF4FF" stroke="#5E7FB8" stroke-width="2.4"/><path d="M27 20v8M37 20v8" stroke="#5E7FB8" stroke-width="3"/><path d="M32 38v8c0 6-10 6-10 12" stroke="#5E7FB8" stroke-width="2.6"/><circle cx="46" cy="48" r="4" fill="#F04452"/>`,
  handMini: `<path d="M12 40h26" stroke="#FF7B6B" stroke-width="3"/><path d="M38 40l-7-5m7 5l-7 5" stroke="#FF7B6B" stroke-width="3"/><path d="M24 52V20" stroke="#EFB800" stroke-width="3"/><path d="M24 20l-5 7m5-7l5 7" stroke="#EFB800" stroke-width="3"/><path d="M44 22l10-8" stroke="#12B886" stroke-width="3"/><path d="M54 14l-9 1m9-1l-2 9" stroke="#12B886" stroke-width="3"/>`,
};

/** 정리 카드의 작은 그림(64×64). */
export function x7Mini(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
