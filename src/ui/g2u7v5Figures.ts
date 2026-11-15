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
  // 전구와 전지는 회로 기호가 아니라 물건의 모습으로 그린다(이 단원은 회로 기호를 배우지 않는다. 책의 문제 그림도 그렇다).
  const bulb = (x: number, y: number, name: string): string =>
    `<path d="M${x - 9} ${y - 31}l-4 -5M${x} ${y - 34}v-6M${x + 9} ${y - 31}l4 -5" stroke="#F0A422" stroke-width="1.6" stroke-linecap="round"/>` +
    `<circle cx="${x}" cy="${y - 17}" r="13" fill="#FFE98A" stroke="#333D4B" stroke-width="1.5"/>` +
    `<path d="M${x - 4} ${y - 6}v-7l4 -5l4 5v7" fill="none" stroke="#B5852A" stroke-width="1.2"/>` +
    `<rect x="${x - 6}" y="${y - 6}" width="12" height="11" rx="2" fill="#B0B8C1" stroke="#333D4B" stroke-width="1.5"/>` +
    `<text x="${x + 24}" y="${y - 22}" text-anchor="middle" font-weight="800" fill="#333D4B">${name}</text>`;
  const batt =
    `<rect x="131" y="158" width="40" height="20" rx="4" fill="#DDE3EA" stroke="#333D4B" stroke-width="1.5"/><rect x="131" y="158" width="15" height="20" rx="4" fill="#F0902B" stroke="#333D4B" stroke-width="1.5"/>` +
    `<rect x="127" y="164" width="4" height="8" rx="1" fill="#8B95A1" stroke="#333D4B" stroke-width="1.2"/>` +
    `<text x="124" y="150" text-anchor="middle">(+)</text><text x="176" y="150" text-anchor="middle">(−)</text><text x="151" y="194" text-anchor="middle">전지</text>`;
  const body =
    kind === "series"
      ? `<path d="M127 168H40V56H104M116 56H204M216 56H280V168H171" fill="none" stroke="#333D4B" stroke-width="1.6"/>${bulb(110, 56, "(가)")}${bulb(210, 56, "(나)")}`
      : `<path d="M127 168H40V48H154M166 48H280V168H171M40 108H154M166 108H280" fill="none" stroke="#333D4B" stroke-width="1.6"/><path d="M82 108H112" stroke="#333D4B" stroke-width="4" stroke-linecap="round"/><circle cx="82" cy="108" r="3.4" fill="#fff" stroke="#333D4B" stroke-width="1.5"/><circle cx="112" cy="108" r="3.4" fill="#fff" stroke="#333D4B" stroke-width="1.5"/><text x="97" y="128" text-anchor="middle">스위치</text>${bulb(160, 48, "(가)")}${bulb(160, 108, "(나)")}`;
  const alt = kind === "series" ? "전지에 전구 (가)와 (나)를 한 줄로 이은 회로" : "전지에 전구 (가)와 (나)를 두 갈래로 나눠 이은 회로. (나)가 있는 갈래에 스위치가 있다";
  return `<svg viewBox="0 0 320 200" ${NS} role="img" aria-label="${alt}" font-family="Pretendard, sans-serif" font-size="12" fill="#4E5968">${body}${batt}</svg>`;
}

const MINI: Record<string, string> = {
  resistMini: `<path d="M6 32h10l4-10 8 20 8-20 8 20 4-10h10" stroke="#C79400" stroke-width="3.2"/><path d="M12 50h40" stroke="#C9D1DE" stroke-width="2.4"/>`,
  conductMini: `<rect x="8" y="14" width="48" height="14" rx="7" fill="#F2C879" stroke="#B5852A" stroke-width="2"/><path d="M16 21h26m0 0l-6-4m6 4l-6 4" stroke="#8A5A00" stroke-width="2.4"/><rect x="8" y="38" width="48" height="14" rx="7" fill="#E5E8EB" stroke="#8B95A1" stroke-width="2"/><path d="M26 41l12 8m0-8l-12 8" stroke="#8B95A1" stroke-width="2.4"/>`,
  wattMini: `<circle cx="32" cy="34" r="20" fill="#FFF7DC" stroke="#C79400" stroke-width="2.6"/><path d="M32 34V20M32 34l9 6" stroke="#8A6500" stroke-width="3"/><path d="M26 8h12" stroke="#C79400" stroke-width="3"/>`,
  effMini: `<rect x="8" y="22" width="48" height="20" rx="6" fill="#FFD9D2" stroke="#D9735F" stroke-width="2"/><rect x="8" y="22" width="19" height="20" rx="6" fill="#FFE08A" stroke="#C79400" stroke-width="2"/><path d="M17 12v6m-5-4l3 4m7-4l-3 4" stroke="#C79400" stroke-width="2.2"/>`,
  standbyMini: `<rect x="18" y="12" width="28" height="26" rx="6" fill="#EEF4FF" stroke="#5E7FB8" stroke-width="2.4"/><path d="M27 20v8M37 20v8" stroke="#5E7FB8" stroke-width="3"/><path d="M32 38v8c0 6-10 6-10 12" stroke="#5E7FB8" stroke-width="2.6"/><circle cx="46" cy="48" r="4" fill="#F04452"/>`,
  handMini: `<path d="M12 40h26" stroke="#FF7B6B" stroke-width="3"/><path d="M38 40l-7-5m7 5l-7 5" stroke="#FF7B6B" stroke-width="3"/><path d="M24 52V20" stroke="#EFB800" stroke-width="3"/><path d="M24 20l-5 7m5-7l5 7" stroke="#EFB800" stroke-width="3"/><path d="M44 22l10-8" stroke="#12B886" stroke-width="3"/><path d="M54 14l-9 1m9-1l-2 9" stroke="#12B886" stroke-width="3"/>`,
  // 2026-11-15 그래픽 감사 C104: 카드의 한 문장 핵심을 도상 하나로(예전 그림은 눈, 한쪽 화살표, 무늬 없는 막대, 번개라 읽히지 않거나 다르게 읽혔다)
  // 전류가 만드는 자기장: 짧은 코일, 둘레를 도는 자기장 고리 둘(오른쪽 끝에서 나와 왼쪽 끝으로), 오른쪽 끝의 나침반(N극이 바깥을 가리킨다)
  coilFieldMini:
    `<path d="M44 29C46 9 15 9 16 29" stroke="#E0452E" stroke-width="1.8"/><path d="M30 11.2L26 14l4 2.8" stroke="#E0452E" stroke-width="1.8"/>` +
    `<path d="M44 35C46 55 15 55 16 35" stroke="#E0452E" stroke-width="1.8"/><path d="M30 47.2L26 50l4 2.8" stroke="#E0452E" stroke-width="1.8"/>` +
    `<path d="M18 32h24" stroke="#5E3A18" stroke-width="1.4"/>` +
    [19, 25, 31, 37].map((x) => `<ellipse cx="${x + 2}" cy="32" rx="2.6" ry="9" stroke="#C97F3A" stroke-width="2.4"/>`).join("") +
    `<circle cx="54.5" cy="32" r="7" fill="#F7F9FC" stroke="#8B95A1" stroke-width="1.6"/><path d="M61 32l-6.5-2.6v5.2z" fill="#E0452E"/><path d="M48 32l6.5-2.6v5.2z" fill="#3D8FE8"/>`,
  // 전기력: 다른 종류(+, −)는 서로를 향한 화살표 둘(끌어당김), 같은 종류(−, −)는 서로 멀어지는 화살표 둘(밀어냄)
  forcePairMini:
    `<circle cx="12" cy="19" r="7" fill="#E8836B"/><path d="M8.5 19h7M12 15.5v7" stroke="#FFF" stroke-width="2"/>` +
    `<circle cx="52" cy="19" r="7" fill="#5A9AE0"/><path d="M48.5 19h7" stroke="#FFF" stroke-width="2"/>` +
    `<path d="M21 19h8m-3-3 3 3-3 3M43 19h-8m3-3-3 3 3 3" stroke="#4E5968" stroke-width="2"/>` +
    `<circle cx="24" cy="45" r="7" fill="#5A9AE0"/><path d="M20.5 45h7" stroke="#FFF" stroke-width="2"/>` +
    `<circle cx="40" cy="45" r="7" fill="#5A9AE0"/><path d="M36.5 45h7" stroke="#FFF" stroke-width="2"/>` +
    `<path d="M15 45H6m3-3-3 3 3 3M49 45h9m-3-3 3 3-3 3" stroke="#4E5968" stroke-width="2"/>`,
  // 정전기 유도: (−)전기를 띤 막대 곁에서 깡통의 가까운 쪽은 (+), 먼 쪽은 (−). 깡통 속 화살표는 전자가 먼 쪽으로 밀려나는 것
  inductNegMini:
    `<rect x="3" y="26" width="19" height="12" rx="6" fill="#5A9AE0"/><path d="M7 32h4M14 32h4" stroke="#FFF" stroke-width="1.8"/>` +
    `<circle cx="44" cy="32" r="16" fill="#D8E2EE" stroke="#8B99AC" stroke-width="1.6"/>` +
    `<circle cx="33" cy="26" r="3.6" fill="#E8836B"/><circle cx="33" cy="38" r="3.6" fill="#E8836B"/><path d="M31.4 26h3.2M33 24.4v3.2M31.4 38h3.2M33 36.4v3.2" stroke="#FFF" stroke-width="1.2"/>` +
    `<circle cx="55" cy="26" r="3.6" fill="#4C9AF0"/><circle cx="55" cy="38" r="3.6" fill="#4C9AF0"/><path d="M53.4 26h3.2M53.4 38h3.2" stroke="#FFF" stroke-width="1.2"/>` +
    `<path d="M39 32h9m-3-2.6 3 2.6-3 2.6" stroke="#2E5AA8" stroke-width="1.8"/>`,
  // 끌려오는 까닭: 가까운 쪽 (+)와 막대의 (−)가 끌어당겨 깡통이 막대 쪽으로 굴러온다(아래 청록 화살표)
  pullMini:
    `<rect x="3" y="20" width="19" height="12" rx="6" fill="#5A9AE0"/><path d="M7 26h4M14 26h4" stroke="#FFF" stroke-width="1.8"/>` +
    `<circle cx="44" cy="26" r="15" fill="#D8E2EE" stroke="#8B99AC" stroke-width="1.6"/>` +
    `<circle cx="33.5" cy="26" r="3.6" fill="#E8836B"/><path d="M31.9 26h3.2M33.5 24.4v3.2" stroke="#FFF" stroke-width="1.2"/>` +
    `<circle cx="54.5" cy="26" r="3.6" fill="#4C9AF0"/><path d="M52.9 26h3.2" stroke="#FFF" stroke-width="1.2"/>` +
    `<path d="M54 51H32m4.5-4L32 51l4.5 4" stroke="#0B9E96" stroke-width="2.6"/>`,
  // 전류의 방향: 전선 위 노란 화살표(전류)와 그 반대로 가는 파란 전자 알갱이
  currentDirMini:
    `<path d="M14 17h34m-5-4.5 5 4.5-5 4.5" stroke="#E0A800" stroke-width="2.8"/>` +
    `<path d="M5 33h54" stroke="#8FA4C2" stroke-width="5"/>` +
    [16, 32, 48].map((x) => `<circle cx="${x}" cy="33" r="4.4" fill="#4C9AF0" stroke="#1F5FB0" stroke-width="1"/><path d="M${x - 2} 33h4" stroke="#FFF" stroke-width="1.4"/>`).join("") +
    `<path d="M48 48H16m5-4.5L16 48l5 4.5" stroke="#3D8FE8" stroke-width="2.4"/>`,
};

/** 정리 카드의 작은 그림(64×64). */
export function x7Mini(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
