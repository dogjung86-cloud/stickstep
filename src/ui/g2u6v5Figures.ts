// 중2 Ⅵ v5의 문제 그림(밝은 카드 위의 SVG). 랩의 무대와 같은 장면을 문제에서 다시 묻는 데 쓴다. 좌표는 계산으로 놓는다.
// 그림의 aria에는 답을 적지 않는다.

const svg = (h: number, body: string, aria: string): string =>
  `<svg viewBox="0 0 340 ${h}" role="img" aria-label="${aria}" style="display:block;width:100%;height:auto;font-family:inherit"><rect x="1" y="1" width="338" height="${h - 2}" rx="14" fill="#FFFFFF" stroke="#F0DADD" stroke-width="2"/>${body}</svg>`;
const t = (x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: string; weight?: number } = {}): string =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "middle"}" font-size="${o.size ?? 13}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? "#333D4B"}">${s}</text>`;

/** 한 음료를 담은 홈 셋에 시약을 한 가지씩 떨어뜨린 결과(아이오딘 청람색, 뷰렛 보라색, 수단 Ⅲ 변화 없음). */
export function plateRowFig(): string {
  const cols: [string, string, string, number][] = [
    ["아이오딘-아이오딘화", "청람색으로 변함", "#2B2F8A", 17],
    ["뷰렛 용액", "보라색으로 변함", "#8A4FD0", 17],
    ["수단 Ⅲ 용액", "변화 없음", "#E3B1A6", 10],
  ];
  let body = "";
  cols.forEach(([name, res, col, r], i) => {
    const x = 60 + i * 110;
    body += t(x, 26, name, { size: 12.5, weight: 800 }) + (i === 0 ? t(x, 42, "칼륨 용액", { size: 12.5, weight: 800 }) : "");
    body += `<circle cx="${x}" cy="84" r="27" fill="#F4F7FB" stroke="#B9C6D8" stroke-width="2"/><circle cx="${x}" cy="84" r="${r}" fill="${col}"/>`;
    body += t(x, 134, res, { size: 12.5, fill: "#4E5968" });
  });
  return svg(150, body, "같은 음료를 담은 홈 세 개에 아이오딘-아이오딘화 칼륨 용액, 뷰렛 용액, 수단 Ⅲ 용액을 각각 떨어뜨린 결과");
}

/** 침의 소화 작용 실험: 녹말 용액 + 증류수 (가), 녹말 용액 + 침 용액 (나)를 37 ℃의 물이 담긴 비커에 담갔다.
 *  물 높이가 시험관 속 용액보다 위다(용액이 물에 다 잠기게 둔다). 시험관은 반투명이라 잠긴 부분에 물이 비친다(2026-11-15, 그래픽 감사 C081). */
export function salivaTubesFig(): string {
  const WATER = 62; // 물의 높이
  const tube = (x: number, label: string, sub: string): string =>
    `<path d="M${x - 13} 30 L${x - 13} 128 A13 13 0 0 0 ${x + 13} 128 L${x + 13} 30" fill="rgba(255,255,255,.28)" stroke="#8FA3BC" stroke-width="2"/>` +
    `<path d="M${x - 11} 78 L${x - 11} 128 A11 11 0 0 0 ${x + 11} 128 L${x + 11} 78 Z" fill="#F4F4EC" fill-opacity=".72"/><line x1="${x - 11}" y1="78" x2="${x + 11}" y2="78" stroke="#C9CCBD" stroke-width="1.4"/>` +
    `<line x1="${x - 17}" y1="30" x2="${x + 17}" y2="30" stroke="#8FA3BC" stroke-width="2.4" stroke-linecap="round"/>` +
    `${t(x, 20, label, { weight: 800 })}${t(x, 170, "녹말 용액", { size: 12.5 })}${t(x, 187, sub, { size: 12.5, fill: "#C2255C", weight: 800 })}`;
  // 비커: 유리 벽과 물(물 높이 WATER에서 바닥까지)
  const beaker =
    `<path d="M54 ${WATER} L54 142 Q54 150 62 150 L278 150 Q286 150 286 142 L286 ${WATER} Z" fill="#FFE3B8" fill-opacity=".7"/>` +
    `<line x1="54" y1="${WATER}" x2="286" y2="${WATER}" stroke="#F0B860" stroke-width="2"/>` +
    `<path d="M48 42 L54 46 L54 142 Q54 150 62 150 L278 150 Q286 150 286 142 L286 46 L292 42" fill="none" stroke="#8FA3BC" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M60 52 L60 136" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
  const body = `${beaker}${t(170, 112, "37 ℃의 물", { size: 12.5, fill: "#9A6A1C" })}${tube(102, "(가)", "+ 증류수")}${tube(238, "(나)", "+ 침 용액")}`;
  return svg(200, body, "녹말 용액과 증류수를 넣은 시험관 (가), 녹말 용액과 침 용액을 넣은 시험관 (나)를 37도의 물이 담긴 비커에 담근 모습");
}

/** 호흡운동 모형: 투명한 통 속의 작은 고무풍선, Y자관, 통, 고무 막에 (가)~(라) 기호를 붙였다. */
export function chestModelFig(): string {
  let body = "";
  body += `<path d="M156 46 C156 58 112 58 112 74 L112 140 L228 140 L228 74 C228 58 184 58 184 46 Z" fill="rgba(160,200,255,.12)"/>`;
  body += `<path d="M156 30 L156 46 C156 58 112 58 112 74 L112 140 M184 30 L184 46 C184 58 228 58 228 74 L228 140" fill="none" stroke="#7F93AD" stroke-width="2.4" stroke-linejoin="round"/>`;
  body += `<rect x="154" y="28" width="32" height="18" rx="3" fill="#5A6577" stroke="#3A4252" stroke-width="1.4"/>`;
  body += `<path d="M170 8 L170 70 M170 70 L150 84 M170 70 L190 84" fill="none" stroke="#5AB0F2" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  body += `<ellipse cx="144" cy="104" rx="15" ry="19" fill="#F58CA0" stroke="#B4405A" stroke-width="2"/><ellipse cx="196" cy="104" rx="15" ry="19" fill="#F58CA0" stroke="#B4405A" stroke-width="2"/>`;
  body += `<path d="M112 140 Q170 150 228 140" fill="none" stroke="#9B5DE5" stroke-width="5" stroke-linecap="round"/>`;
  const lab = (x: number, y: number, s: string, tx: number, ty: number): string => `<line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="#8B95A1" stroke-width="1.4"/>${t(x, y + 4.5, s, { anchor: x < 170 ? "end" : "start", weight: 800 })}`;
  body += lab(92, 16, "(가)", 164, 16) + lab(250, 90, "(나)", 230, 92) + lab(92, 106, "(다)", 128, 106) + lab(250, 152, "(라)", 214, 145);
  return svg(166, body, "투명한 통의 마개를 지나는 Y자관 끝에 작은 고무풍선 두 개가 달려 있고 통 아래에 고무 막을 씌운 모형. 네 부분에 기호가 붙어 있다");
}

/** 건강한 사람의 세 곳에 들어 있는 물질의 표(혈액, 여과된 액체, 오줌). 포도당 줄의 오줌 칸이 ㉠이다. */
export function urineTableFig(): string {
  const cols = ["토리의 혈액", "여과된 액체", "오줌"];
  const rows: [string, string[]][] = [
    ["단백질", ["있음", "없음", "없음"]],
    ["포도당", ["있음", "있음", "㉠"]],
    ["요소", ["있음", "있음", "있음"]],
  ];
  let body = "";
  cols.forEach((c, i) => (body += t(132 + i * 82, 28, c, { size: 12.5, weight: 800 })));
  rows.forEach(([name, vals], r) => {
    const y = 60 + r * 34;
    body += `<line x1="14" y1="${y - 20}" x2="326" y2="${y - 20}" stroke="#E5E8EB" stroke-width="1.5"/>` + t(48, y + 2, name, { weight: 800 });
    vals.forEach((v, i) => (body += t(132 + i * 82, y + 2, v, { size: 13, fill: v === "㉠" ? "#C2255C" : v === "없음" ? "#8B95A1" : "#333D4B", weight: v === "㉠" ? 800 : 700 })));
  });
  return svg(146, body, "건강한 사람의 토리의 혈액, 여과된 액체, 오줌에 단백질, 포도당, 요소가 있는지를 나타낸 표. 포도당의 오줌 칸은 기호로 가려져 있다");
}
