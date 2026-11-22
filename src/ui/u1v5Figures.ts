// 중1 Ⅰ v5 문제 그림. 좌표는 계산으로 놓는다(눈대중 없음).

/** 두 컵 (가), (나)의 물 온도를 60분 동안 30분마다 잰 꺾은선 그래프. 값은 자체 제작: (가) 17, 24, 29 / (나) 17, 19, 21 ℃.
 *  그림의 글은 축 이름과 눈금, 선 이름뿐이다(답을 말하지 않는다). */
export function twoCupGraphFig(): string {
  const X = [70, 180, 290];
  const y = (t: number): number => 176 - (t - 15) * (140 / 15); // 15 ℃ = 176, 30 ℃ = 36
  const A = [17, 24, 29];
  const B = [17, 19, 21];
  const pts = (v: number[]): string => v.map((t, i) => `${X[i]},${y(t)}`).join(" ");
  const dots = (v: number[], c: string): string => v.map((t, i) => `<circle cx="${X[i]}" cy="${y(t)}" r="5" fill="${c}" stroke="#fff" stroke-width="1.6"/>`).join("");
  const grid = [15, 20, 25, 30].map((t) => `<line x1="48" y1="${y(t)}" x2="316" y2="${y(t)}" stroke="#E5E8EB" stroke-width="1"/><text x="40" y="${y(t) + 4.5}" text-anchor="end" font-size="12" font-weight="600" fill="#6B7684">${t}</text>`).join("");
  const xs = ["처음", "30분 뒤", "60분 뒤"].map((t, i) => `<text x="${X[i]}" y="196" text-anchor="middle" font-size="12" font-weight="600" fill="#6B7684">${t}</text>`).join("");
  return `<svg viewBox="0 0 340 208" width="100%" role="img" aria-label="두 컵 (가)와 (나)의 물 온도를 60분 동안 잰 꺾은선 그래프">
    <rect x="0" y="0" width="340" height="208" rx="14" fill="#F9FAFB"/>
    ${grid}${xs}
    <text x="12" y="20" font-size="12" font-weight="700" fill="#4E5968">온도(℃)</text>
    <line x1="48" y1="30" x2="48" y2="176" stroke="#8B95A1" stroke-width="1.6"/>
    <line x1="48" y1="176" x2="320" y2="176" stroke="#8B95A1" stroke-width="1.6"/>
    <polyline points="${pts(A)}" fill="none" stroke="#F08C00" stroke-width="2.8" stroke-linejoin="round"/>
    <polyline points="${pts(B)}" fill="none" stroke="#3182F6" stroke-width="2.8" stroke-linejoin="round"/>
    ${dots(A, "#F08C00")}${dots(B, "#3182F6")}
    <text x="304" y="${y(29) + 5}" font-size="14" font-weight="800" fill="#C46A00">(가)</text>
    <text x="304" y="${y(21) + 5}" font-size="14" font-weight="800" fill="#1B64DA">(나)</text>
  </svg>`;
}
