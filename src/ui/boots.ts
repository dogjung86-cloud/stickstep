// 장화 글리프 — 레벨 뱃지·도감용 SVG(core/level.ts의 tier id와 1:1).
// 콘텐츠 그림이 아니라 UI 아이콘이라 core/icons.ts와 같은 결의 손코딩 SVG를 쓴다.
// 면 그라데이션 + 하이라이트 + 재질 최암색 외곽선(파운드리 문법의 아이콘판).

interface BootLook {
  body?: string; // 단색 몸통
  grad?: [string, string]; // 세로 그라데이션(은·금·다이아·은하)
  rainbow?: boolean; // 무지개 6스톱
  line: string; // 외곽선·솔(재질 최암색)
  star?: boolean; // 별 시리즈
  facets?: boolean; // 다이아 커팅 선
  sparkles?: boolean; // 은하 별가루
}

const RAINBOW = ["#F25562", "#F5A623", "#FFD335", "#20BD6D", "#3D8BFF", "#8A63E8"];

const LOOK: Record<string, BootLook> = {
  yellow: { body: "#FFC531", line: "#C08A10" },
  green: { body: "#20BD6D", line: "#0B7A46" },
  blue: { body: "#3D8BFF", line: "#1B5FCC" },
  red: { body: "#F25562", line: "#B72E3B" },
  rainbow: { rainbow: true, line: "#5B4A9E" },
  "star-yellow": { body: "#FFC531", line: "#C08A10", star: true },
  "star-green": { body: "#20BD6D", line: "#0B7A46", star: true },
  "star-blue": { body: "#3D8BFF", line: "#1B5FCC", star: true },
  "star-red": { body: "#F25562", line: "#B72E3B", star: true },
  "star-rainbow": { rainbow: true, line: "#5B4A9E", star: true },
  silver: { grad: ["#E8EDF4", "#A9B6C8"], line: "#77869C" },
  gold: { grad: ["#FFD75E", "#E29A19"], line: "#A66A08" },
  diamond: { grad: ["#C9F4FD", "#66C6E5"], line: "#3D93B4", facets: true },
  galaxy: { grad: ["#4A54E1", "#232858"], line: "#161A3E", sparkles: true },
};

let uid = 0;

/** 장화 SVG 문자열. size = 표시 폭(px). */
export function bootArt(tierId: string, size = 24): string {
  const lk = LOOK[tierId] ?? LOOK.yellow;
  const id = `bt${uid++}`;
  const h = Math.round((size * 38) / 44);

  let defs = "";
  let bodyFill = lk.body ?? "#FFC531";
  if (lk.grad) {
    defs = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lk.grad[0]}"/><stop offset="1" stop-color="${lk.grad[1]}"/></linearGradient>`;
    bodyFill = `url(#${id})`;
  } else if (lk.rainbow) {
    const stops = RAINBOW.map((c, i) => `<stop offset="${(i / (RAINBOW.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join("");
    defs = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient>`;
    bodyFill = `url(#${id})`;
  }

  // 몸통(발끝 오른쪽) — 목·발등·앞코가 한 패스, 밑창은 어두운 밴드로 덮는다.
  const body =
    "M12 4.5h11.5a3 3 0 0 1 3 3V19c0 2.8 1.9 4.4 4.8 4.9l1.2.2c3.4.6 5.9 3.4 5.9 6.8v.1a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3z";
  const sole = "M9 29.4h29.4v1.6a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3z";

  const parts: string[] = [
    defs ? `<defs>${defs}</defs>` : "",
    `<path d="${body}" fill="${bodyFill}" stroke="${lk.line}" stroke-width="1.6" stroke-linejoin="round"/>`,
    `<rect x="9.8" y="5.3" width="16" height="4.2" rx="2.1" fill="${lk.line}" opacity=".3"/>`,
    `<path d="M13.3 12v12.6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".42"/>`,
  ];
  if (lk.facets) {
    parts.push(`<path d="M17.5 5.5 11 17M24 5.5 14.5 22.5" stroke="#fff" stroke-width="1.3" opacity=".55" fill="none"/>`);
  }
  if (lk.sparkles) {
    parts.push(
      `<circle cx="15.2" cy="12.2" r="1.5" fill="#FFF6D8" opacity=".95"/>`,
      `<circle cx="21.8" cy="20.4" r="1" fill="#FFF6D8" opacity=".8"/>`,
      `<circle cx="13" cy="23.5" r=".8" fill="#FFF6D8" opacity=".7"/>`,
    );
  }
  parts.push(`<path d="${sole}" fill="${lk.line}"/>`);
  if (lk.star) {
    parts.push(
      `<path d="M17.7 11.4l1.9 3.8 4.2.6-3 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3-3 4.2-.6z" fill="#fff" stroke="${lk.line}" stroke-width="1" stroke-linejoin="round"/>`,
    );
  }

  return `<svg viewBox="0 0 44 38" width="${size}" height="${h}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${parts.join("")}</svg>`;
}

/** 러너 실착용 대표색(스텝 러시 — 캔버스는 단색만 그린다). 무지개 계열은 rainbow 플래그로
 *  순환 연출을 맡기고, 그라데이션 계열은 밝은 쪽을 대표색으로 쓴다. LOOK이 단일 진실 공급원. */
export function bootColor(tierId: string): { color: string; rainbow: boolean } {
  const lk = LOOK[tierId] ?? LOOK.yellow;
  return { color: lk.body ?? lk.grad?.[0] ?? "#FFC531", rainbow: !!lk.rainbow };
}

export const BOOT_RAINBOW = RAINBOW;
