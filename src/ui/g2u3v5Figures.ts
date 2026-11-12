// 중2 Ⅲ v5: 정리 카드의 미니 그림과 문제 그림(계산으로 그린 SVG).
// 미니 그림은 64×64 평면 그림이다(lightFigures의 lightMiniArt와 같은 문법). 옛 미니 그림으로 모자란 카드만 여기에 더했다.

const NS = `xmlns="http://www.w3.org/2000/svg"`;
const INK = "#33415C";

const MINI: Record<string, string> = {
  // 스스로 빛을 내는 물체(광원): 해와 전구
  source: `<circle cx="22" cy="24" r="9" fill="#FFC83D"/>${[0, 45, 90, 135, 180, 225, 270, 315]
    .map((d) => {
      const a = (d * Math.PI) / 180;
      return `<line x1="${(22 + Math.cos(a) * 13).toFixed(1)}" y1="${(24 + Math.sin(a) * 13).toFixed(1)}" x2="${(22 + Math.cos(a) * 18).toFixed(1)}" y2="${(24 + Math.sin(a) * 18).toFixed(1)}" stroke="#F0A422" stroke-width="2.4"/>`;
    })
    .join("")}<path d="M44 34a8 8 0 1 1 8 0v5h-8z" fill="#FFE9A6" stroke="${INK}" stroke-width="2"/><rect x="45" y="40" width="6" height="5" rx="1.5" fill="${INK}"/>`,
  // 광원 → 물체 → 눈
  seePath: `<circle cx="13" cy="14" r="6" fill="#FFC83D"/><rect x="24" y="44" width="16" height="11" rx="2" fill="#F5F0E4" stroke="#C9413A" stroke-width="2"/><path d="M47 24c4-5 10-5 14 0c-4 5-10 5-14 0z" fill="#fff" stroke="${INK}" stroke-width="1.8"/><circle cx="54" cy="24" r="2.6" fill="${INK}"/><path d="M17 19L29 41" stroke="#F0A422" stroke-width="2.4"/><path d="M29 41l-5.4-3.2M29 41l.4-6.2" stroke="#F0A422" stroke-width="2.4"/><path d="M36 42L50 28" stroke="#F0A422" stroke-width="2.4"/><path d="M50 28l-6 .8M50 28l-.8 6" stroke="#F0A422" stroke-width="2.4"/>`,
};

/** 문제 그림: 모눈 위의 파동 한 장면. 진폭은 ampCells칸, 파장은 lenCells칸(한 칸 20). 마루와 골의 자리는 계산으로 찍는다. */
export function waveGridFig(ampCells: number, lenCells: number): string {
  const C = 20;
  const W = 320;
  const H = 180;
  const x0 = 20;
  const cy = 90;
  let grid = "";
  for (let x = x0; x <= W - 20; x += C) grid += `<line x1="${x}" y1="10" x2="${x}" y2="170" stroke="#E5E8EB"/>`;
  for (let y = 10; y <= 170; y += C) grid += `<line x1="${x0}" y1="${y}" x2="${W - 20}" y2="${y}" stroke="#E5E8EB"/>`;
  let d = "";
  for (let x = x0; x <= W - 20; x += 2) {
    const y = cy - ampCells * C * Math.sin((2 * Math.PI * (x - x0)) / (lenCells * C));
    d += `${x === x0 ? "M" : "L"}${x} ${y.toFixed(1)}`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="모눈 위에 그린 파동의 한 장면"><rect width="${W}" height="${H}" rx="12" fill="#fff"/>${grid}<line x1="${x0}" y1="${cy}" x2="${W - 20}" y2="${cy}" stroke="#8B95A1" stroke-width="1.5" stroke-dasharray="5 4"/><path d="${d}" fill="none" stroke="#2F8EE0" stroke-width="3" stroke-linejoin="round"/><text x="${W - 24}" y="${cy + 15}" text-anchor="end" font-size="12" font-weight="700" fill="#4E5968">진동 중심</text></svg>`;
}

/** 문제 그림: 소리 분석 화면 세 장 (가)(나)(다). 칸마다 진폭(px)과 같은 시간 동안의 진동 횟수를 준다. */
export function soundTrioFig(specs: { amp: number; cycles: number }[]): string {
  const W = 330;
  const H = 128;
  const pw = 98;
  const labels = ["(가)", "(나)", "(다)"];
  let out = "";
  specs.forEach((sp, i) => {
    const x0 = 8 + i * (pw + 10);
    const cy = 52;
    let d = "";
    for (let x = 0; x <= pw - 12; x += 1.5) {
      const y = cy - sp.amp * Math.sin((x / (pw - 12)) * sp.cycles * Math.PI * 2);
      d += `${x === 0 ? "M" : "L"}${(x0 + 6 + x).toFixed(1)} ${y.toFixed(1)}`;
    }
    out += `<rect x="${x0}" y="8" width="${pw}" height="88" rx="8" fill="#0B1524"/><line x1="${x0 + 4}" y1="${cy}" x2="${x0 + pw - 4}" y2="${cy}" stroke="rgba(232,238,249,.4)" stroke-dasharray="4 4"/><path d="${d}" fill="none" stroke="#63E6BE" stroke-width="2.2" stroke-linejoin="round"/><text x="${x0 + pw - 6}" y="90" text-anchor="end" font-size="11" font-weight="700" fill="rgba(232,238,249,.7)">시간</text><text x="${x0 + pw / 2}" y="116" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">${labels[i]}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="소리 분석 화면 세 장"><rect width="${W}" height="${H}" rx="12" fill="#fff"/>${out}</svg>`;
}

/** 정리 카드의 미니 그림. */
export function lxMini(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
