// 중2 Ⅷ 별과 우주 v5: 문제 그림과 정리 카드의 미니 그림. 랩 파일을 들여오지 않는다.
// 실사는 public/photos/star(출처 photos/CREDITS.md)의 것을 lazy 없이 싣는다.
const NS = `xmlns="http://www.w3.org/2000/svg"`;
const BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

/** 문제에 싣는 실사 한 장. */
export const starImg = (file: string, alt: string): string =>
  `<img src="${BASE}photos/star/${file}" alt="${alt}" style="display:block;width:100%;max-height:230px;object-fit:cover;border-radius:12px" />`;

/** 실사 두 장을 나란히(이름표는 (가), (나)). */
export const starPair = (a: [string, string], b: [string, string]): string =>
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${[a, b]
    .map(
      ([file, alt], i) =>
        `<div style="position:relative"><img src="${BASE}photos/star/${file}" alt="${alt}" style="display:block;width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px" /><span style="position:absolute;left:8px;top:8px;background:rgba(255,255,255,.93);border-radius:999px;padding:2px 10px;font-size:13px;font-weight:800;color:#232D73">${i ? "(나)" : "(가)"}</span></div>`,
    )
    .join("")}</div>`;

/** 세 별의 겉보기 등급과 절대 등급 표. */
export function magTableFig(): string {
  const rows: [string, string, string][] = [
    ["(가)", "1.0", "−2.0"],
    ["(나)", "3.0", "3.0"],
    ["(다)", "−0.5", "2.5"],
  ];
  const td = "padding:9px 6px;border-top:1px solid #E3E8F0;font-size:15px;font-weight:700;color:#191F28;text-align:center";
  const th = "padding:9px 6px;font-size:13px;font-weight:800;color:#4E5968;text-align:center;background:#F2F4F8";
  return `<table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #E3E8F0"><tr><th style="${th}">별</th><th style="${th}">겉보기 등급</th><th style="${th}">절대 등급</th></tr>${rows
    .map((r) => `<tr>${r.map((c) => `<td style="${td}">${c}</td>`).join("")}</tr>`)
    .join("")}</table>`;
}

/** 옆에서 본 우리은하(가운데가 볼록한 원반, 태양계의 자리, 원반 둘레의 구상 성단). */
export function galaxySideFig8(): string {
  const dots = [
    [70, 38], [118, 24], [206, 22], [252, 40], [92, 122], [150, 138], [214, 134], [262, 116], [44, 70], [282, 78],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#FFB36B"/>`)
    .join("");
  return `<svg viewBox="0 0 320 160" ${NS} role="img" aria-label="옆에서 본 우리은하. 가운데가 볼록한 납작한 원반이고 태양계는 중심에서 떨어져 있다"><rect width="320" height="160" rx="12" fill="#0B1326"/><ellipse cx="160" cy="80" rx="132" ry="9" fill="#5E78C8" opacity=".85"/><ellipse cx="160" cy="80" rx="34" ry="22" fill="#FFE0B0"/>${dots}<circle cx="234" cy="80" r="4" fill="#FFD23F" stroke="#fff" stroke-width="1.4"/><text x="160" y="50" text-anchor="middle" font-size="12" font-weight="800" fill="#FFE0B0">중심부</text><text x="72" y="100" text-anchor="middle" font-size="12" font-weight="800" fill="#B8C8F2">원반</text><text x="234" y="102" text-anchor="middle" font-size="12" font-weight="800" fill="#FFD23F">태양계</text><text x="252" y="26" text-anchor="middle" font-size="12" font-weight="800" fill="#FFB36B">구상 성단</text></svg>`;
}

/** 풍선 모형 그림(딱지 셋). */
export function balloonFig(): string {
  const tags: [number, number, string][] = [
    [112, 64, "ㄱ"],
    [150, 98, "ㄴ"],
    [186, 58, "ㄷ"],
  ];
  return `<svg viewBox="0 0 320 170" ${NS} role="img" aria-label="붙임딱지 세 개를 붙인 풍선"><rect width="320" height="170" rx="12" fill="#F4F6FB"/><circle cx="150" cy="82" r="66" fill="#8FA6F2" stroke="#4A5FC4" stroke-width="2.5"/><path d="M216 82 l22 -8 v16 z" fill="#4A5FC4"/><rect x="238" y="72" width="26" height="20" rx="4" fill="#C9CED6" stroke="#6B7684" stroke-width="2"/>${tags
    .map(([x, y, t]) => `<circle cx="${x}" cy="${y}" r="12" fill="#FFD84A" stroke="#8A6500" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#3A2A00">${t}</text>`)
    .join("")}<text x="251" y="112" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">집게</text></svg>`;
}

const globular = Array.from({ length: 26 }, (_, i) => {
  const a = i * 2.4;
  const r = 2 + ((i * 7) % 15);
  return `<circle cx="${(32 + Math.cos(a) * r).toFixed(1)}" cy="${(32 + Math.sin(a) * r).toFixed(1)}" r="1.7" fill="#FFB36B"/>`;
}).join("");

const MINI: Record<string, string> = {
  eyes: `<circle cx="22" cy="50" r="6" fill="#fff" stroke="#3D8FE8" stroke-width="2.4"/><circle cx="42" cy="50" r="6" fill="#fff" stroke="#3D8FE8" stroke-width="2.4"/><circle cx="32" cy="30" r="4" fill="#F7C948"/><path d="M22 44 L40 12 M42 44 L24 12" stroke="#3D8FE8" stroke-width="2" stroke-dasharray="3 3"/>`,
  pc: `<circle cx="32" cy="10" r="4.5" fill="#FFE9A8" stroke="#E2B23C" stroke-width="1.6"/><circle cx="14" cy="54" r="4.5" fill="#3E8EE0"/><circle cx="32" cy="54" r="5" fill="#FFC94A"/><path d="M14 54 L32 10 L32 54" stroke="#12B886" stroke-width="2.2"/><path d="M28 22 A 12 12 0 0 1 32 23" stroke="#12B886" stroke-width="2"/>`,
  grid: `<circle cx="8" cy="32" r="5" fill="#FFE9A8"/><rect x="20" y="27" width="10" height="10" fill="#FFD166" stroke="#3D8FE8" stroke-width="1.6"/><path d="M38 14 h20 v36 h-20 z M48 14 v36 M38 26 h20 M38 38 h20" fill="#FFF3C4" stroke="#3D8FE8" stroke-width="1.6"/>`,
  steps: `<path d="M8 52 h10 v-8 h10 v-8 h10 v-8 h10 v-8 h10" stroke="#3D8FE8" stroke-width="2.6"/><circle cx="13" cy="46" r="2" fill="#FFE9A8"/><circle cx="33" cy="30" r="3.4" fill="#FFE9A8"/><circle cx="53" cy="14" r="5.4" fill="#FFD166"/>`,
  abs: `<path d="M10 54 V10" stroke="#12B886" stroke-width="2.4" stroke-dasharray="3 3"/><circle cx="32" cy="18" r="7" fill="#FFD166"/><circle cx="32" cy="34" r="4.6" fill="#FFE9A8"/><circle cx="32" cy="48" r="2.8" fill="#E8EEF9" stroke="#9AA7BD" stroke-width="1"/><path d="M14 18 h9 M14 34 h11 M14 48 h13" stroke="#12B886" stroke-width="2"/>`,
  heater: `<rect x="8" y="14" width="48" height="36" rx="6" fill="#ECEFF4" stroke="#6B7684" stroke-width="2"/><path d="M14 24 h36" stroke="#C0392B" stroke-width="3.4"/><path d="M14 32 h36" stroke="#F26A3D" stroke-width="3.4"/><path d="M14 40 h36" stroke="#FFD23F" stroke-width="3.4"/>`,
  model: `<rect x="8" y="46" width="48" height="8" rx="2" fill="#D8C9A8" stroke="#8A7446" stroke-width="1.6"/><path d="M16 46 V26 M28 46 V26 M40 46 V26 M50 46 V26" stroke="#6B7684" stroke-width="1.6"/><circle cx="16" cy="24" r="4" fill="#fff" stroke="#6B7684" stroke-width="1.4"/><circle cx="28" cy="24" r="4" fill="#fff" stroke="#6B7684" stroke-width="1.4"/><circle cx="40" cy="24" r="4" fill="#fff" stroke="#6B7684" stroke-width="1.4"/><circle cx="50" cy="24" r="4" fill="#fff" stroke="#6B7684" stroke-width="1.4"/>`,
  sunpos: `<circle cx="32" cy="32" r="26" fill="#27345F"/><ellipse cx="32" cy="32" rx="9" ry="5" fill="#FFE0B0" transform="rotate(-30 32 32)"/><path d="M32 12 C 48 14 54 30 46 42 M32 52 C 16 50 10 34 18 22" stroke="#9CB4F2" stroke-width="3"/><circle cx="47" cy="40" r="3.4" fill="#FFD23F" stroke="#fff" stroke-width="1.4"/>`,
  band: `<rect x="6" y="10" width="52" height="44" rx="8" fill="#1B2547"/><path d="M8 44 C 22 36 40 26 56 18 L56 28 C 40 36 24 44 8 52 Z" fill="#C9D3EE" opacity=".8"/><circle cx="16" cy="18" r="1.4" fill="#fff"/><circle cx="48" cy="46" r="1.4" fill="#fff"/><circle cx="30" cy="14" r="1.2" fill="#fff"/>`,
  globular: `<circle cx="32" cy="32" r="20" fill="#FFE2B8" opacity=".35"/>${globular}`,
  dark: `<rect x="6" y="10" width="52" height="44" rx="8" fill="#B8425A"/><path d="M22 54 C 20 40 24 30 30 26 C 32 20 40 20 42 26 C 44 32 40 36 40 42 L42 54 Z" fill="#1A1420"/><circle cx="14" cy="20" r="1.4" fill="#fff"/><circle cx="50" cy="18" r="1.4" fill="#fff"/>`,
  stretch: `<path d="M8 20 h48 M8 32 h48 M8 44 h48 M14 12 v40 M32 12 v40 M50 12 v40" stroke="#B7C3E6" stroke-width="1.4"/><circle cx="14" cy="32" r="4" fill="#FFD166"/><circle cx="32" cy="20" r="4" fill="#9CC4FF"/><circle cx="50" cy="44" r="4" fill="#FF9A66"/><path d="M20 32 h6 M26 29 l4 3 l-4 3" stroke="#5B6BE8" stroke-width="2"/>`,
  tech: `<rect x="12" y="20" width="32" height="14" rx="5" fill="#E5E9EF" stroke="#6B7684" stroke-width="2"/><rect x="30" y="32" width="10" height="20" rx="3" fill="#C9D1DC" stroke="#6B7684" stroke-width="2"/><path d="M48 27 h4 M54 27 h4" stroke="#E0503A" stroke-width="2.4"/>`,
  plan: `<rect x="14" y="8" width="36" height="48" rx="5" fill="#fff" stroke="#6B7684" stroke-width="2"/><path d="M21 20 l3 3 l5 -6 M21 32 l3 3 l5 -6 M21 44 l3 3 l5 -6" stroke="#12B886" stroke-width="2.4"/><path d="M33 21 h11 M33 33 h11 M33 45 h11" stroke="#9AA7BD" stroke-width="2.4"/>`,
};

/** 정리 카드의 미니 그림(64×64). 별 단원의 옛 미니 그림(starMiniArt)과 함께 쓴다. */
export function x8Mini(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
