// 중2 Ⅴ v5의 문제 그림(밝은 카드 위의 SVG). 랩의 무대와 같은 장면을 문제에서 다시 묻는 데 쓴다. 좌표는 계산으로 놓는다.
// 그림의 aria에는 답을 적지 않는다.

const svg = (h: number, body: string, aria: string): string =>
  `<svg viewBox="0 0 340 ${h}" role="img" aria-label="${aria}" style="display:block;width:100%;height:auto;font-family:inherit"><rect x="1" y="1" width="338" height="${h - 2}" rx="14" fill="#FFFFFF" stroke="#E1EBE4" stroke-width="2"/>${body}</svg>`;
const t = (x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: string; weight?: number } = {}): string =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "middle"}" font-size="${o.size ?? 13}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? "#333D4B"}">${s}</text>`;

/** 전등을 켠 측정과 끈 측정의 농도 그래프. 이산화 탄소: (가) 조금 오름, (나) 내려감. 산소: (다) 오름, (라) 조금 내려감.
 *  네 선의 색과 굵기를 모두 다르게 두어, 선의 생김새로 같은 측정끼리 짝지을 수 없게 한다. */
export function gasLinesFig(): string {
  const panel = (x: number, title: string, a: [string, number, string], b: [string, number, string]): string => {
    const y0 = 34;
    const h = 96;
    const py = (v: number): number => y0 + h - 10 - (h - 24) * v;
    const line = (end: number, col: string, dash: boolean): string =>
      `<polyline points="${Array.from({ length: 11 }, (_, i) => `${x + 16 + i * 11.6},${py(0.5 + (end - 0.5) * (1 - Math.pow(1 - i / 10, 1.6))).toFixed(1)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"${dash ? ' stroke-dasharray="6 5"' : ""}/>`;
    return `<rect x="${x}" y="${y0}" width="150" height="${h}" rx="10" fill="#F6FAF7" stroke="#DCE7DF"/>${t(x + 75, 24, title, { size: 13, weight: 800 })}
      <line x1="${x + 16}" y1="${y0 + 10}" x2="${x + 16}" y2="${y0 + h - 10}" stroke="#A9B6A9" stroke-width="2"/><line x1="${x + 16}" y1="${y0 + h - 10}" x2="${x + 140}" y2="${y0 + h - 10}" stroke="#A9B6A9" stroke-width="2"/>
      ${line(a[1], a[2], false)}${line(b[1], b[2], false)}
      ${t(x + 138, py(a[1]) + (a[1] > 0.5 ? -7 : 16), a[0], { size: 13, anchor: "end", fill: a[2], weight: 800 })}${t(x + 138, py(b[1]) + (b[1] > 0.5 ? -7 : 16), b[0], { size: 13, anchor: "end", fill: b[2], weight: 800 })}
      ${t(x + 78, y0 + h + 16, "시간(분)", { size: 12, fill: "#8B95A1" })}`;
  };
  return svg(156, panel(14, "이산화 탄소 농도", ["(가)", 0.64, "#5F4BE8"], ["(나)", 0.16, "#C46A00"]) + panel(176, "산소 농도", ["(다)", 0.86, "#0B7285"], ["(라)", 0.38, "#C2255C"]), "시간에 따른 이산화 탄소 농도 그래프의 두 선 (가), (나)와 산소 농도 그래프의 두 선 (다), (라)");
}

/** 켠 전등의 수에 따라 5분 동안 늘어난 산소의 양(막대 넷). */
export function lampBarsFig(): string {
  const vals = [2, 4, 5, 5];
  let body = t(170, 24, "5분 동안 늘어난 산소의 양", { weight: 800 });
  body += `<line x1="52" y1="36" x2="52" y2="136" stroke="#A9B6A9" stroke-width="2"/><line x1="52" y1="136" x2="310" y2="136" stroke="#A9B6A9" stroke-width="2"/>`;
  vals.forEach((v, i) => {
    const x = 84 + i * 60;
    body += `<rect x="${x - 17}" y="${136 - v * 18}" width="34" height="${v * 18}" rx="5" fill="#4DABF7" stroke="#1C7ED6" stroke-width="1.5"/>${t(x, 154, `${i + 1}개`, { size: 13 })}`;
  });
  body += t(170, 174, "켠 전등의 수", { size: 12, fill: "#8B95A1" });
  return svg(184, body, "켠 전등의 수가 1개에서 4개일 때 늘어난 산소의 양을 나타낸 막대 그래프");
}

/** 아이오딘 용액을 떨어뜨린 잎 조각 둘. (가)는 청람색, (나)는 옅은 갈색. */
export function leafPiecesFig(): string {
  const dish = (cx: number, label: string, fill: string, edge: string): string =>
    `<ellipse cx="${cx}" cy="78" rx="66" ry="26" fill="#F1F6FB" stroke="#A9BBD0" stroke-width="2"/><rect x="${cx - 28}" y="58" width="56" height="36" rx="6" fill="${fill}" stroke="${edge}" stroke-width="2"/>${t(cx, 128, label, { weight: 800 })}`;
  return svg(142, dish(92, "(가)", "#2B2F8A", "#14164A") + dish(248, "(나)", "#E3C27A", "#A07C2E"), "아이오딘 용액을 떨어뜨린 뒤의 잎 조각 (가)와 (나)");
}

/** 광합성과 호흡을 잇는 그림. 위 화살표의 물질 칸은 ㉠, 아래 화살표의 물질 칸은 ㉡으로 가린다. */
export function cycleBlankFig(): string {
  const box = (x: number, name: string, sub: string, fill: string): string => `<rect x="${x}" y="62" width="108" height="56" rx="12" fill="${fill}"/>${t(x + 54, 86, name, { size: 15, fill: "#fff", weight: 800 })}${t(x + 54, 106, sub, { size: 12, fill: "#fff" })}`;
  const pill = (x: number, y: number, s: string): string => `<rect x="${x - 38}" y="${y - 14}" width="76" height="28" rx="14" fill="#fff" stroke="#8B95A1" stroke-width="2"/>${t(x, y + 5, s, { weight: 800 })}`;
  const body = `
    ${box(20, "광합성", "엽록체", "#2F9450")}${box(212, "호흡", "마이토콘드리아", "#B5683A")}
    <path d="M92 62 L92 30 L248 30 L248 52" fill="none" stroke="#2F9450" stroke-width="3"/><polygon points="248,62 241,49 255,49" fill="#2F9450"/>
    <path d="M248 118 L248 150 L92 150 L92 128" fill="none" stroke="#B5683A" stroke-width="3"/><polygon points="92,118 85,131 99,131" fill="#B5683A"/>
    ${pill(170, 30, "㉠")}${pill(170, 150, "㉡")}`;
  return svg(180, body, "광합성에서 호흡으로 가는 화살표의 빈칸 ㉠과 호흡에서 광합성으로 가는 화살표의 빈칸 ㉡");
}

/** 식물 한 포기의 줄기 속 두 관. (가)는 뿌리에서 잎 쪽으로만 올라가는 화살표, (나)는 잎에서 위아래로 가는 화살표. */
export function tubesFig(): string {
  const body = `
    <rect x="0" y="150" width="340" height="40" fill="#EAD9C4"/><rect x="1" y="1" width="338" height="188" rx="14" fill="none" stroke="#E1EBE4" stroke-width="2"/>
    <rect x="144" y="30" width="52" height="130" rx="6" fill="#CDEBD3" stroke="#2F7D46" stroke-width="2"/>
    <rect x="150" y="34" width="18" height="122" rx="4" fill="#E7F3FD" stroke="#3B9AE1" stroke-width="1.6"/><rect x="172" y="34" width="18" height="122" rx="4" fill="#FFF3DD" stroke="#F08C00" stroke-width="1.6"/>
    <line x1="159" y1="150" x2="159" y2="54" stroke="#3B9AE1" stroke-width="4"/><polygon points="159,40 152,56 166,56" fill="#3B9AE1"/>
    <line x1="181" y1="60" x2="181" y2="136" stroke="#F08C00" stroke-width="4"/><polygon points="181,44 174,60 188,60" fill="#F08C00"/><polygon points="181,152 174,136 188,136" fill="#F08C00"/>
    <path d="M144 96 C 116 60, 56 62, 40 92 C 60 122, 118 120, 144 96 Z" fill="#58BD6E" stroke="#1F6B3A" stroke-width="2"/>${t(92, 97, "잎", { fill: "#fff", weight: 800 })}
    <ellipse cx="170" cy="170" rx="34" ry="13" fill="#B7729A" stroke="#6E3A5A" stroke-width="2"/>${t(232, 175, "뿌리", { size: 12, fill: "#6B7684" })}
    <line x1="158" y1="46" x2="126" y2="22" stroke="#8B95A1"/>${t(112, 22, "(가)", { weight: 800 })}<line x1="188" y1="80" x2="226" y2="70" stroke="#8B95A1"/>${t(244, 74, "(나)", { weight: 800 })}`;
  return `<svg viewBox="0 0 340 190" role="img" aria-label="줄기 속의 두 관 (가)와 (나), (가)의 화살표는 위로만, (나)의 화살표는 위와 아래로 향한다" style="display:block;width:100%;height:auto;font-family:inherit"><rect x="1" y="1" width="338" height="188" rx="14" fill="#FFFFFF"/>${body}</svg>`;
}
