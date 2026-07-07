// SVG 아이콘 — 이모지 금지 규칙에 따라 모든 픽토그램은 여기서 나온다.
// 전부 24x24 viewBox, currentColor 기반. stroke 아이콘이 기본, fill 아이콘은 fill:true.

interface IconDef { v: string; sw?: number; fill?: boolean; }

const ICONS: Record<string, IconDef> = {
  check: { v: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', sw: 3.2 },
  checkThick: { v: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', sw: 3.6 },
  x: { v: '<path d="M6 6l12 12M18 6L6 18"/>', sw: 2.4 },
  xThick: { v: '<path d="M7 7l10 10M17 7L7 17"/>', sw: 3.2 },
  lock: { v: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', sw: 2.1 },
  play: { v: '<path d="M8 5.5v13l11-6.5z"/>', fill: true },
  chevron: { v: '<path d="M9.5 6l6 6-6 6"/>', sw: 2.4 },
  back: { v: '<path d="M15 6l-6 6 6 6"/>', sw: 2.2 },
  chevronDown: { v: '<path d="M6 9.5l6 6 6-6"/>', sw: 2.4 },
  flame: { v: '<path d="M12.6 2.5c.5 3.8-4.9 5.6-4.9 10a4.9 4.9 0 0 0 9.8 0c0-2.2-1.1-3.4-1.5-5.2 1.9 1 3.2 3 3.2 5.2A7.2 7.2 0 1 1 7.7 7.2c1.6-1.9 4.3-2.9 4.9-4.7z"/>', fill: true },
  thermo: { v: '<path d="M10 4.5a2 2 0 0 1 4 0v8.6a4.6 4.6 0 1 1-4 0z"/><path d="M12 10.5v6.5"/><circle cx="12" cy="17" r="1.2"/>', sw: 2 },
  expand: { v: '<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/><path d="M4 4l5.5 5.5M20 4l-5.5 5.5M4 20l5.5-5.5M20 20l-5.5-5.5"/>', sw: 2 },
  clock: { v: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', sw: 2 },
  star: { v: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9z"/>', fill: true },
  sparkle: { v: '<path d="M12 2l1.7 6.1L20 10l-6.3 1.9L12 18l-1.7-6.1L4 10l6.3-1.9z"/>', fill: true },
  bolt: { v: '<path d="M13 2L5 13h5l-1 9 8-11h-5z"/>', fill: true },
  target: { v: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>', sw: 2 },
  bulb: { v: '<path d="M9.5 18h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5A6 6 0 0 1 12 3z"/>', sw: 2 },
  flask: { v: '<path d="M9 3h6"/><path d="M10 3v6.5l-4.6 8A2 2 0 0 0 7.2 20.5h9.6a2 2 0 0 0 1.8-3l-4.6-8V3"/><path d="M7.5 15h9"/>', sw: 2 },
  book: { v: '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 20.5A2.5 2.5 0 0 1 7.5 18H19v3H7.5"/>', sw: 2 },
  trophy: { v: '<path d="M8 4h8v4.5a4 4 0 0 1-8 0z"/><path d="M8 6H5.5v1a3 3 0 0 0 3 3M16 6h2.5v1a3 3 0 0 1-3 3"/><path d="M10.5 13.5h3V17h-3z"/><path d="M8 20h8M9 20l.5-3M15 20l-.5-3"/>', sw: 2 },
  leaf: { v: '<path d="M4 20c0-9 7-15 16-15 0 9-6 16-16 15z"/><path d="M9 15c2.5-2.5 5.5-4 9-5"/>', sw: 2 },
  tree: { v: '<path d="M12 3l6 8h-3.5l3 5H7.5l3-5H6z"/><path d="M12 16v5"/>', sw: 2 },
  microscope: { v: '<path d="M6 21h11"/><path d="M9 21v-3"/><path d="M8 18a6 6 0 0 0 9-5"/><path d="M11.5 4.5l3 3-3.2 3.2-3-3z"/><path d="M12.8 8.8l1.8 1.8"/><path d="M9 18h3"/>', sw: 2 },
  cell: { v: '<circle cx="12" cy="12" r="9"/><circle cx="13" cy="11" r="3.2"/><circle cx="7.5" cy="14" r="1.1"/><circle cx="16" cy="16" r="1"/>', sw: 2 },
  dna: { v: '<path d="M8 3c0 5 8 6 8 9s-8 4-8 9"/><path d="M16 3c0 5-8 6-8 9s8 4 8 9"/><path d="M9 6h6M8.5 9h7M8.5 15h7M9 18h6"/>', sw: 2 },
  mushroom: { v: '<path d="M4 11a8 6 0 0 1 16 0z"/><path d="M10 11v6a2 2 0 0 0 4 0v-6"/>', sw: 2 },
  paw: { v: '<circle cx="7" cy="9" r="1.8"/><circle cx="12" cy="7" r="1.9"/><circle cx="17" cy="9" r="1.8"/><path d="M12 12c-3 0-5 2-5 4.5S9 20 12 20s5-1 5-3.5S15 12 12 12z"/>', fill: true },
  globe: { v: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>', sw: 1.8 },
  recycle: { v: '<path d="M7 8l-3 5 3 1.5"/><path d="M12 4l3 5-3 1.5"/><path d="M17 11l2.5 4a2 2 0 0 1-1.7 3H13"/><path d="M9 18H6a2 2 0 0 1-1.7-3"/><path d="M15 5l-3-2-2.5 2.5"/>', sw: 1.9 },
  swap: { v: '<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>', sw: 2.2 },
  plus: { v: '<path d="M12 6v12M6 12h12"/>', sw: 2.4 },
  route: { v: '<circle cx="6.5" cy="18.5" r="2.2"/><circle cx="17.5" cy="5.5" r="2.2"/><path d="M8.7 18.5H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h5.3"/>', sw: 2 },
  compass: { v: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>', sw: 2 },
  layers: { v: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', sw: 2 },
  heart: { v: '<path d="M12 20S4 14.5 4 9.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 8 2.2C20 14.5 12 20 12 20z"/>', fill: true },
  handSparkle: { v: '<path d="M12 3l1.3 3.2L16.5 7l-3.2 1.3L12 11l-1.3-2.7L7.5 7l3.2-.8z"/><path d="M6 21v-6a2 2 0 0 1 4 0M10 15a2 2 0 0 1 4 0v6"/>', sw: 2 },
  // ── 중2 III 빛과 파동 ──
  reflect: { v: '<path d="M3 19h18"/><path d="M4.5 4.5L12 18.6 19.5 6"/><path d="M19.5 10.5V6h-4.4"/>', sw: 2.1 },
  prism: { v: '<path d="M12 4L21 19.5H3z"/><path d="M1.5 9.5l6.5 3M15.5 13.5l7 4.5"/>', sw: 2 },
  eye: { v: '<path d="M2.2 12S5.8 5.8 12 5.8 21.8 12 21.8 12 18.2 18.2 12 18.2 2.2 12 2.2 12z"/><circle cx="12" cy="12" r="3.1"/>', sw: 2 },
  mirror: { v: '<ellipse cx="12" cy="9" rx="5.5" ry="7"/><path d="M12 16v4.5M8.5 20.5h7"/><path d="M9.8 5.8Q8.4 7.6 8.8 10"/>', sw: 2 },
  lens: { v: '<path d="M12 3.2c3.1 2.4 4.7 5.3 4.7 8.8s-1.6 6.4-4.7 8.8c-3.1-2.4-4.7-5.3-4.7-8.8S8.9 5.6 12 3.2z"/><path d="M2 12h3.4M18.6 12H22"/>', sw: 2 },
  rgb: { v: '<circle cx="12" cy="8.6" r="4.9"/><circle cx="8.6" cy="14.6" r="4.9"/><circle cx="15.4" cy="14.6" r="4.9"/>', sw: 1.9 },
  wave: { v: '<path d="M2 12c1.6-4.8 3.4-7.2 5-7.2S10.4 9 12 12s3.4 7.2 5 7.2 3.4-2.4 5-7.2"/>', sw: 2.1 },
  note: { v: '<path d="M9.2 17.5V5.2l10-2v11.5"/><ellipse cx="6.6" cy="17.6" rx="2.7" ry="2.2"/><ellipse cx="16.6" cy="14.8" rx="2.7" ry="2.2"/>', sw: 2 },
  // ── 중2 IV 물질의 구성 ──
  atom: { v: '<circle cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="9" ry="3.8"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(-60 12 12)"/>', sw: 1.7 },
  grid: { v: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9.2h17M3.5 14.9h17M9.2 3.5v17M14.9 3.5v17"/>', sw: 1.8 },
  molecule: { v: '<circle cx="7.5" cy="15.5" r="3.4"/><circle cx="16.5" cy="15.5" r="3.4"/><circle cx="12" cy="7.2" r="3.8"/><path d="M9.6 10.3l-1 2.1M14.4 10.3l1 2.1"/>', sw: 1.9 },
  ionArrow: { v: '<circle cx="9" cy="13" r="6.2"/><path d="M9 10.4v5.2M6.4 13h5.2"/><path d="M16 4.5h4.5M18.25 2.25v4.5"/>', sw: 1.9 },
};

export function icon(
  name: string,
  size = 24,
  opts: { sw?: number; cls?: string; style?: string } = {},
): string {
  const def = ICONS[name];
  if (!def) return "";
  const stroke = def.fill
    ? `fill="currentColor" stroke="none"`
    : `fill="none" stroke="currentColor" stroke-width="${opts.sw ?? def.sw ?? 2}" stroke-linecap="round" stroke-linejoin="round"`;
  const cls = opts.cls ? ` class="${opts.cls}"` : "";
  const style = opts.style ? ` style="${opts.style}"` : "";
  return `<svg${cls}${style} width="${size}" height="${size}" viewBox="0 0 24 24" ${stroke}>${def.v}</svg>`;
}
