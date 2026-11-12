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

/** 정리 카드의 미니 그림. */
export function lxMini(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
