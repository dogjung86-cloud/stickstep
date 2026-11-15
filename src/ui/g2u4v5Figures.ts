// 중2 Ⅳ v5의 문제 그림(밝은 카드용 SVG). 랩의 무대와 같은 장면을 계산으로 다시 그린다(문제 그림에서 랩 파일을 들여오지 않는다).
// 대체 글(aria-label)에는 답이 되는 값을 적지 않는다.
const NS = `xmlns="http://www.w3.org/2000/svg"`;
const t = (x: number, y: number, s: string, size = 12.5, fill = "#4E5968", weight = 700): string =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${weight}" fill="${fill}">${s}</text>`;

/** 물 분해 장치: 물이 든 컵에 세워 넣은 9 V 건전지. 단자에 (+), (−)를 적는다(물 분해 랩의 무대와 같다: 작은 단자가 (+), 큰 단자가 (−)).
 *  (−)극 쪽(수소) 기포가 (+)극 쪽(산소)보다 많이 올라온다. 문제와 보기가 쓰지 않는 (가), (나) 이름표는 두지 않는다. */
export function electrolysisFig(): string {
  const bub = (x: number, n: number): string => Array.from({ length: n }, (_, i) => `<circle cx="${x + ((i * 7) % 13) - 6}" cy="${104 - i * (62 / n)}" r="${2.6 + (i % 3) * 0.6}" fill="none" stroke="#5A9AE0" stroke-width="1.3"/>`).join("");
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="황산 나트륨을 녹인 물에 9 V 건전지를 세워 넣은 그림. 건전지 위쪽의 두 단자에 (+)와 (−)가 적혀 있고, 두 단자에서 기포가 올라오는데 한쪽이 다른 쪽보다 많다">
    <path d="M112 22 L118 170 Q118 176 126 176 L218 176 Q226 176 226 170 L232 22" fill="#F4F9FF" stroke="#8B99AC" stroke-width="2"/>
    <path d="M113.6 42 L118.6 169 Q119 174 126 174 L218 174 Q225 174 225.4 169 L230.4 42 Z" fill="#CFE6FB"/>
    <rect x="146" y="118" width="52" height="56" rx="5" fill="#3A4860" stroke="#1E2838" stroke-width="1.5"/><rect x="146" y="118" width="52" height="17" rx="5" fill="#D9A441"/>
    <rect x="154" y="109" width="9" height="10" rx="2" fill="#9AA5B4"/><rect x="178" y="107" width="13" height="12" rx="3" fill="#9AA5B4"/>
    ${t(158.5, 131, "(+)", 13, "#5A2A00", 800)}${t(184.5, 131, "(−)", 13, "#5A2A00", 800)}
    ${t(172, 160, "9 V", 13, "#DCE5F2", 700)}
    ${bub(158, 4)}${bub(185, 9)}
  </svg>`;
}

/** 이온의 이동 장치(위에서 본 그림): 왼쪽 (−)극, 오른쪽 (+)극. spots에 얼룩의 자리와 색, 이름표를 준다. */
export function paperFig(spots: { at: "left" | "mid" | "right"; color: string; label?: string }[], o: { poles?: boolean } = {}): string {
  const X = { left: 104, mid: 172, right: 240 };
  const poles = o.poles ?? true;
  return `<svg viewBox="0 0 344 150" ${NS} fill="none" role="img" aria-label="질산 칼륨 수용액으로 적신 거름종이의 양 끝을 집게로 집어 전원 장치에 이은 그림. 거름종이 위에 색 얼룩이 있다">
    <rect x="56" y="42" width="232" height="58" rx="6" fill="#E3EAF2" stroke="#9AA5B4" stroke-width="1.6"/>
    ${spots.map((s) => `<ellipse cx="${X[s.at]}" cy="71" rx="${s.at === "mid" ? 16 : 24}" ry="15" fill="${s.color}" opacity=".8"/>${s.label ? t(X[s.at], 126, s.label, 13, "#333D4B", 800) : ""}`).join("")}
    <rect x="44" y="34" width="16" height="74" rx="4" fill="#7F8DA3"/><rect x="284" y="34" width="16" height="74" rx="4" fill="#7F8DA3"/>
    ${poles ? t(24, 76, "(−)극", 12.5, "#2A5AA0", 800) + t(322, 76, "(+)극", 12.5, "#C0392B", 800) : t(24, 76, "A", 14, "#333D4B", 800) + t(322, 76, "B", 14, "#333D4B", 800)}
  </svg>`;
}

/** 분자 모형 세 가지: (가) 산소 원자 둘, (나) 탄소 하나와 산소 둘, (다) 산소 원자 셋. 원자의 색으로 종류를 가른다. */
export function threeModelsFig(): string {
  const O = (x: number, y: number): string => `<circle cx="${x}" cy="${y}" r="15" fill="#E8695A" stroke="#A8342A" stroke-width="1.6"/>`;
  const Cc = (x: number, y: number): string => `<circle cx="${x}" cy="${y}" r="15" fill="#5E6876" stroke="#2F3742" stroke-width="1.6"/>`;
  const bond = (x0: number, y0: number, x1: number, y1: number): string => `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#9AA5B4" stroke-width="5"/>`;
  return `<svg viewBox="0 0 344 150" ${NS} fill="none" role="img" aria-label="공 모형 세 가지. 빨간 공은 산소 원자, 회색 공은 탄소 원자이다. 모형마다 공의 종류와 개수를 살펴보세요">
    ${bond(40, 62, 74, 62)}${O(40, 62)}${O(74, 62)}${t(57, 112, "(가)", 14, "#333D4B", 800)}
    ${bond(136, 62, 208, 62)}${O(136, 62)}${O(208, 62)}${Cc(172, 62)}${t(172, 112, "(나)", 14, "#333D4B", 800)}
    ${bond(262, 76, 287, 48)}${bond(312, 76, 287, 48)}${O(262, 76)}${O(312, 76)}${O(287, 48)}${t(287, 112, "(다)", 14, "#333D4B", 800)}
    <circle cx="112" cy="136" r="6" fill="#E8695A" stroke="#A8342A"/>${t(140, 140, "산소", 12, "#4E5968")}<circle cx="184" cy="136" r="6" fill="#5E6876" stroke="#2F3742"/>${t(212, 140, "탄소", 12, "#4E5968")}
  </svg>`;
}
