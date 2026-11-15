// 물질의 상태 변화(IV) 퀴즈·개념 그림 — 손코딩 교육용 SVG.
// 색은 답의 단서가 되지 않도록 설계(입자 상자는 전부 같은 색 — 배열·간격·잔상만 단서).

const NS = `xmlns="http://www.w3.org/2000/svg"`;

const P = "#6E9EDB"; // 입자 공통색(다크 그림)
const dot = (x: number, y: number, r = 6): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${P}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.33}" r="${r * 0.3}" fill="rgba(255,255,255,.4)"/>`;
const trail = (x: number, y: number, ang: number, len: number): string => {
  const dx = Math.cos(ang) * len;
  const dy = Math.sin(ang) * len;
  return `<line x1="${(x - dx * 0.5).toFixed(1)}" y1="${(y - dy * 0.5).toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}" stroke="#8FB3E8" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
};

/** 움직임 꼬리: 입자 뒤로 가늘어지는 옅은 자국(혜성 꼬리 모양). ang은 꼬리가 뻗는 방향. */
const tail = (x: number, y: number, ang: number, len: number, r: number): string => {
  const c = Math.cos(ang), s = Math.sin(ang);
  const w = r * 0.78;
  const p = (d: number, o: number): string => `${(x + c * d - s * o).toFixed(1)} ${(y + s * d + c * o).toFixed(1)}`;
  return `<path d="M${p(0, w)} L${p(r + len, 0)} L${p(0, -w)} Z" fill="#8FB3E8" opacity=".34"/>`;
};

/** 물질의 세 가지 상태 (가)(나)(다) 입자 모형 — 순서 섞음: (가) 기체 / (나) 고체 / (다) 액체 (다크)
 *  세 상자 모두 같은 크기(반지름 6.4)의 입자 9개(2026-11-15 다시 그림, 책 그림 Ⅳ-4).
 *  고체는 서로 닿을 만큼(틈 0.6) 가지런히, 액체는 닿을 듯(틈 2~4) 불규칙하게 바닥에, 기체는 멀리 흩어 움직임 꼬리를 길게.
 *  운동이 가장 활발한 기체에만 움직임 꼬리를 단다. */
export function stateTrioFig(): string {
  const R = 6.4;
  const frame = (bx: number, label: string, inner: string): string =>
    `<g transform="translate(${bx},10)">
      <rect x="0" y="0" width="100" height="96" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
      ${inner}
      <text x="50" y="122" text-anchor="middle" font-size="14" font-weight="700" fill="#AFC3E3">${label}</text>
    </g>`;
  // (가) 기체: 상자 전체에 멀리 흩어진 9개, 움직임 꼬리
  const gasPts: [number, number, number][] = [
    [18, 18, 0.6], [54, 14, 2.6], [86, 26, 1.9], [32, 46, 5.4], [72, 50, 3.6], [14, 78, 0.2], [50, 76, 4.6], [86, 80, 2.2], [36, 92 - 6, 5.9],
  ];
  const gas = gasPts.map(([x, y, a]) => tail(x, y, a, 12, R)).join("") + gasPts.map(([x, y]) => dot(x, y, R)).join("");
  // (나) 고체: 3×3, 서로 닿게(중심 사이 13.4)
  let solid = "";
  for (let i = 0; i < 9; i++) solid += dot(50 + ((i % 3) - 1) * 13.4, 60 + (Math.floor(i / 3) - 1) * 13.4, R);
  // (다) 액체: 바닥에 5개, 그 위에 4개. 서로 닿을 듯(틈 2~4) 조금씩 어긋나게
  const liqPts: [number, number, number][] = [
    [20.6, 87.4, 0.4], [35.8, 88, 3.3], [51.4, 87.2, 5.6], [66.8, 88.2, 2.1], [82.2, 87.4, 4.4],
    [28.4, 73.4, 1.2], [44, 72.4, 4.9], [59.8, 73.8, 2.8], [75.2, 72.8, 0.9],
  ];
  const liq = liqPts.map(([x, y]) => dot(x, y, R)).join("");
  return `<svg viewBox="0 0 344 136" ${NS} role="img" aria-label="물질의 세 가지 상태를 나타낸 입자 모형 세 상자">
    ${frame(6, "(가)", gas)}
    ${frame(122, "(나)", solid)}
    ${frame(238, "(다)", liq)}
  </svg>`;
}

/** 뜨거운 물 비커 + 얼음 시계 접시 — (가) 얼음, (나) 접시 아랫면 물방울 (라이트)
 *  2026-11-15 다시 그림: 수증기는 보이지 않으므로 김 줄로 그리지 않고 작은 입자와 점선 화살(물 표면에서 접시 아랫면까지)로 그린다.
 *  물방울은 아랫면에 맺힌 둥근 방울, 얼음은 접시 위에 닿아 있다(랩 u4WatchLab과 같은 규칙). */
export function watchGlassFig(): string {
  const C = 172;
  const outerY = (dx: number): number => {
    const t = (dx + 78) / 156;
    return 62 + 87 * t * (1 - t);
  };
  const drops = [-30, -10, 10, 30]
    .map((dx, i) => {
      const r = [3.2, 3.8, 3.6, 3.1][i];
      const y = outerY(dx) - 0.4 + r;
      return `<circle cx="${C + dx}" cy="${y.toFixed(1)}" r="${r}" fill="#5AA2F8"/><circle cx="${(C + dx - r * 0.3).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.32).toFixed(1)}" fill="#fff" opacity=".8"/>`;
    })
    .join("");
  const arrows = [-24, 0, 24]
    .map((dx) => {
      const y1 = outerY(dx) + 13;
      return `<path d="M${C + dx} 118 C${C + dx - 5} 110 ${C + dx + 5} ${y1 + 8} ${C + dx} ${y1}" stroke="#8DB3E2" stroke-width="1.5" stroke-dasharray="2.6 3.2" stroke-linecap="round" fill="none"/>
        <path d="M${C + dx - 3.6} ${y1 + 4.4} L${C + dx} ${y1} L${C + dx + 3.6} ${y1 + 4.4}" stroke="#8DB3E2" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    })
    .join("");
  const vp = [[-33, 110], [-18, 103], [-3, 112], [8, 99], [20, 108], [34, 101]]
    .map(([dx, y]) => `<circle cx="${C + dx}" cy="${y}" r="2.4" fill="#8DB8EC"/>`)
    .join("");
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="뜨거운 물이 든 비커 위에 얼음이 담긴 시계 접시를 올린 그림">
    <!-- 비커와 물 -->
    <path d="M116 122h112v40a6 6 0 0 1-6 6H122a6 6 0 0 1-6-6z" fill="#DCEAFF"/>
    <path d="M116 122h112" stroke="#B9D3F5" stroke-width="1.6"/>
    <path d="M110 70v96a8 8 0 0 0 8 8h108a8 8 0 0 0 8-8V70" fill="none" stroke="#4E5968" stroke-width="3"/>
    <!-- 올라가는 수증기(입자와 점선 화살) -->
    ${arrows}${vp}
    <!-- 시계 접시: 비커 입구에 걸친 얇은 곡면 유리 -->
    <path d="M${C - 78} 62 Q${C} 105.5 ${C + 78} 62 L${C + 76} 60 Q${C} 100 ${C - 76} 60 Z" fill="#EEF4FB" stroke="#4E5968" stroke-width="2.4" stroke-linejoin="round"/>
    ${drops}
    <!-- 얼음: 접시 안쪽 곡면에 닿아 있다 -->
    <rect x="147" y="58" width="22" height="20" rx="5" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.4" transform="rotate(5 158 78)"/>
    <rect x="176" y="60.5" width="20" height="18" rx="5" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.4" transform="rotate(-5 186 78.5)"/>
    <!-- 라벨 -->
    <text x="262" y="50" font-size="13" font-weight="700" fill="#4E5968">(가) 얼음</text>
    <path d="M258 47l-58 18" stroke="#B0B8C1" stroke-width="1.6"/>
    <text x="262" y="100" font-size="13" font-weight="700" fill="#4E5968">(나) 물방울</text>
    <path d="M258 96l-51 -8" stroke="#B0B8C1" stroke-width="1.6"/>
    <text x="34" y="150" font-size="13" font-weight="700" fill="#4E5968">뜨거운 물</text>
    <path d="M94 146l26 -2" stroke="#B0B8C1" stroke-width="1.6"/>
  </svg>`;
}

/** 가열(냉각) 곡선 — (가)~(라) 구간 라벨. 온도 축에는 수치를 쓰지 않는다(용어 미도입 단원)
 *  2026-11-15 다시 그림: 비탈의 이름표는 비탈 가운데의 왼쪽 위에, 평평한 구간의 이름표는 그 구간 위에 둔다(위쪽 평평한 구간의 이름으로 읽히지 않게).
 *  끓는(응결하는) 구간을 녹는(어는) 구간보다 길게(책 그림 Ⅳ-9, Ⅳ-10). 축 글자 12.5. */
export function curveFig(mode: "heat" | "cool" = "heat"): string {
  const X0 = 44, Y0 = 188; // 원점
  const yA = mode === "heat" ? 140 : 70; // 첫 평평한 구간
  const yB = mode === "heat" ? 70 : 140; // 둘째 평평한 구간
  const p0 = mode === "heat" ? 176 : 24; // 출발 온도
  // 가열: 녹는 구간(짧게) 뒤 끓는 구간(길게). 냉각: 응결 구간(길게) 뒤 어는 구간(짧게)
  const xs = mode === "heat" ? [X0, 90, 138, 194, 306] : [X0, 90, 202, 258, 306];
  const pts: [number, number][] = [[xs[0], p0], [xs[1], yA], [xs[2], yA], [xs[3], yB], [xs[4], yB]];
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const labels = ["(가)", "(나)", "(다)", "(라)"];
  const labelEls = labels
    .map((t, i) => {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      if (y1 === y2) return `<text x="${mx}" y="${my - 11}" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${t}</text>`;
      // 비탈: 가운데에서 위쪽(왼쪽 위 또는 오른쪽 위)으로 수직 거리 16
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      let nx = dy / len, ny = -dx / len;
      if (ny > 0) { nx = -nx; ny = -ny; }
      if (i === 0 && mode === "heat") { nx = -nx; ny = -ny; } // 가열의 첫 비탈은 세로축에 붙어 있어 아래 오른쪽에
      return `<text x="${(mx + nx * 17).toFixed(1)}" y="${(my + ny * 17 + 4.5).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${t}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 216" ${NS} role="img" aria-label="${mode === "heat" ? "고체를 가열" : "기체를 냉각"}할 때 시간에 따른 온도 그래프. 수평 구간이 두 번 나타난다">
    <line x1="${X0}" y1="${Y0}" x2="${X0}" y2="24" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${X0}" y1="${Y0}" x2="326" y2="${Y0}" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${X0}" y1="${yA}" x2="${Math.max(pts[1][0], pts[2][0])}" y2="${yA}" stroke="#DDE2E8" stroke-width="1.4" stroke-dasharray="4 5"/>
    <line x1="${X0}" y1="${yB}" x2="${pts[3][0]}" y2="${yB}" stroke="#DDE2E8" stroke-width="1.4" stroke-dasharray="4 5"/>
    <path d="${line}" fill="none" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${labelEls}
    <text x="10" y="17" font-size="12.5" font-weight="700" fill="#4E5968">온도(℃)</text>
    <text x="326" y="208" text-anchor="end" font-size="12.5" font-weight="700" fill="#4E5968">${mode === "heat" ? "가열" : "냉각"} 시간(분)</text>
  </svg>`;
}

/** 액체가 기체로 바뀌는 입자 모형(기화, 다크). 상태가 변해도 입자의 수와 크기는 그대로라
 *  두 상자 모두 같은 크기(반지름 6)의 입자 9개다. 바뀌는 것은 입자 사이의 거리와 배열뿐이다.
 *  액체 무리는 상자 바닥에 고여 있다(2026-11-15, 바닥에 5개와 그 위 4개). */
export function vaporizeFig(): string {
  const liqPts: [number, number][] = [
    [31.4, 94.8], [45.2, 95.4], [59, 94.6], [72.8, 95.2], [86.6, 94.8], [38.2, 82.4], [52.2, 81.8], [66, 82.6], [79.8, 81.8],
  ];
  const liq = liqPts.map(([x, y]) => dot(x, y, 6)).join("");
  const gasPts: [number, number, number][] = [
    [222, 30, 0.6], [258, 24, 2.3], [286, 44, 4.0], [314, 24, 1.0], [232, 62, 1.4], [270, 70, 5.2], [296, 82, 3.1], [240, 88, 2.0], [272, 102, 3.6],
  ];
  const gas = gasPts.map(([x, y, a]) => trail(x, y, a, 8) + dot(x, y, 6)).join("");
  return `<svg viewBox="0 0 344 120" ${NS} role="img" aria-label="촘촘히 모여 있는 입자 9개가 화살표를 지나 넓게 흩어진 입자 9개로 변하는 모형">
    <rect x="12" y="18" width="94" height="84" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
    ${liq}
    <path d="M128 60h64" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M182 48l14 12-14 12" fill="none" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="206" y="8" width="126" height="104" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
    ${gas}
  </svg>`;
}

// ── recap 미니 아트(64×64, 카드에서는 32px로 보인다) ───────────────────
// 2026-11-15 다듬음(감사 하 후보): 확산은 가운데 무리에서 바깥으로 흩어지는 입자와 화살(분자 구조처럼 이은 선을 걷음),
//   질량은 랩과 같은 전자저울(풍선 플라스크, 숫자 칸), 부피는 같은 입자 넷이 작은 상자에서 큰 점선 상자로(빨간 점선을 카드 색 주황으로),
//   물은 예외는 체크 표시 대신 얼기 전 병의 점선 윤곽과 부푼 병, 따뜻함은 주황(빨강은 오답 색). 색은 카드의 색과 같다.
const arrowTo = (x1: number, y1: number, x2: number, y2: number, c: string, w = 2.6): string => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = (d: number): string => `${(x2 - Math.cos(a + d) * 5.5).toFixed(1)} ${(y2 - Math.sin(a + d) * 5.5).toFixed(1)}`;
  return `<path d="M${x1} ${y1} L${x2} ${y2} M${h(0.6)} L${x2} ${y2} L${h(-0.6)}" stroke="${c}" stroke-width="${w}"/>`;
};
const MINI: Record<string, string> = {
  // 확산: 가운데 무리에서 사방으로 흩어지는 입자(멀수록 옅게)
  diffuse: `<g fill="#5AA2F8"><circle cx="28.8" cy="29" r="3.8"/><circle cx="35.4" cy="28.6" r="3.8"/><circle cx="28.6" cy="35.6" r="3.8"/><circle cx="35.2" cy="35.4" r="3.8"/></g>
    ${arrowTo(23.5, 23.5, 16, 16, "#9EC5FB")}${arrowTo(40.5, 23.5, 48, 16, "#9EC5FB")}${arrowTo(40.5, 40.5, 48, 48, "#9EC5FB")}${arrowTo(23.5, 40.5, 16, 48, "#9EC5FB")}
    <g fill="#5AA2F8"><circle cx="8.5" cy="10.5" r="3" opacity=".8"/><circle cx="55" cy="8.5" r="3" opacity=".8"/><circle cx="57" cy="55" r="2.8" opacity=".75"/><circle cx="7.5" cy="54.5" r="2.8" opacity=".75"/><circle cx="32" cy="7" r="2.6" opacity=".6"/><circle cx="57.5" cy="32" r="2.6" opacity=".6"/></g>`,
  // 증발: 액체 표면에서 입자가 기체가 되어 떠난다
  evap: `<path d="M8 44q8-5 16 0t16 0t16 0V56H8z" fill="#D3F4F8"/>
    <path d="M8 44q8-5 16 0t16 0t16 0" stroke="#35C7DB" stroke-width="3"/>
    <circle cx="23" cy="30" r="3.8" fill="#35C7DB"/><circle cx="41" cy="20" r="3.8" fill="#35C7DB"/>
    ${arrowTo(23, 23.5, 23, 13, "#7FDDEA", 2.4)}${arrowTo(41, 13.5, 41, 4.5, "#7FDDEA", 2.4)}`,
  // 고체: 서로 닿을 만큼 가까이 규칙적으로
  solid: `<path d="M19.5 19.5h25M19.5 32h25M19.5 44.5h25M19.5 19.5v25M32 19.5v25M44.5 19.5v25" stroke="#BFDCFF" stroke-width="1.8"/>
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${19.5 + c * 12.5}" cy="${19.5 + r * 12.5}" r="5.4" fill="#4E9BF5"/>`).join("")).join("")}`,
  // 액체: 닿은 채 불규칙하게, 자리를 바꾸며 움직인다
  liquid: `<path d="M41 13q9 1 9 10" stroke="#C9BEFF" stroke-width="2.4"/><path d="M46.5 20.5l3.5 3 3-3.6" stroke="#C9BEFF" stroke-width="2.4"/>
    <g fill="#8A7CFA"><circle cx="13.5" cy="48" r="5.4"/><circle cx="25" cy="49" r="5.4"/><circle cx="36.5" cy="48.2" r="5.4"/><circle cx="48" cy="49" r="5.4"/><circle cx="19" cy="37.6" r="5.4"/><circle cx="30.6" cy="37" r="5.4"/><circle cx="42" cy="38.4" r="5.4"/></g>`,
  // 기체: 멀리 흩어져 빠르게(꼬리)
  gas: `<path d="M11 10l4 4M41.5 8.5l4.5 3.5M25 29l5 3M7 42l4.5 4M44 40l4.5 4" stroke="#FFB1A3" stroke-width="2.4"/>
    <g fill="#F0705E"><circle cx="18" cy="16" r="4.4"/><circle cx="49" cy="14" r="4.2"/><circle cx="33" cy="34" r="4.4"/><circle cx="14" cy="49" r="4.2"/><circle cx="51" cy="47" r="4.4"/></g>`,
  // 융해·응고: 얼음 ⇄ 물방울
  meltPair: `<rect x="7" y="21" width="21" height="19" rx="5" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.6"/><path d="M11 25.5h7" stroke="#fff" stroke-width="2"/>
    <path d="M47 18c5 6 8 10 8 15a8 8 0 1 1-16 0c0-5 3-9 8-15z" fill="#DCEAFF" stroke="#5AA2F8" stroke-width="2.6"/>
    ${arrowTo(30.5, 25, 37.5, 25, "#FF8A5C", 2.4)}${arrowTo(37.5, 44, 30.5, 44, "#5AA2F8", 2.4)}`,
  // 기화·액화: 물방울 ⇄ 흩어진 입자
  boilPair: `<path d="M15 20c4 5 7 9 7 13a7 7 0 1 1-14 0c0-4 3-8 7-13z" fill="#DCEAFF" stroke="#5AA2F8" stroke-width="2.6"/>
    <g fill="#F0705E"><circle cx="47" cy="14" r="3.4"/><circle cx="57" cy="26" r="3.2"/><circle cx="44" cy="34" r="3.2"/><circle cx="55" cy="44" r="3"/></g>
    ${arrowTo(27, 25, 35, 25, "#FF8A5C", 2.4)}${arrowTo(35, 44, 27, 44, "#5AA2F8", 2.4)}`,
  // 승화: 고체에서 액체를 건너뛰고 기체로(아치)
  sublime: `<rect x="7" y="38" width="19" height="17" rx="5" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.6"/>
    <g fill="#F0705E"><circle cx="48" cy="42" r="3.2"/><circle cx="57" cy="50" r="2.9"/><circle cx="45" cy="54" r="2.9"/></g>
    <path d="M15 32q15-24 34 2" stroke="#B49CFF" stroke-width="2.8"/><path d="M43.5 30.5l5.5 3.5 1.8-6.4" stroke="#B49CFF" stroke-width="2.8"/>`,
  // 질량은 그대로: 랩의 전자저울과 풍선 플라스크(숫자 칸이 그대로)
  mass: `<ellipse cx="32" cy="9.5" rx="6.6" ry="7.4" fill="#F9C4D6" stroke="#E0588B" stroke-width="2.2"/>
    <path d="M28 17.5h8" stroke="#E0588B" stroke-width="2.6"/>
    <path d="M28.5 18v8l-9 14.5q-1.5 3 2 3h21q3.5 0 2-3l-9-14.5v-8" fill="#EAF4FF" stroke="#5AA2F8" stroke-width="2.4"/>
    <path d="M22.5 38.5h19" stroke="#9EC5FB" stroke-width="2.2"/>
    <rect x="8" y="45" width="48" height="14" rx="3.5" fill="#E9EEF4" stroke="#8B95A1" stroke-width="2.2"/>
    <rect x="20" y="48.5" width="24" height="7" rx="1.6" fill="#24324A"/>
    <path d="M24 52h5M32 52h8" stroke="#34D399" stroke-width="2.4"/>`,
  // 부피는 달라져요: 같은 입자 넷이 작은 상자에서 큰 상자로(거리가 멀어짐)
  volume: `<rect x="4" y="31" width="20" height="20" rx="4" fill="#FFF1EA" stroke="#FF8A5C" stroke-width="2.4"/>
    <g fill="#FF8A5C"><circle cx="10" cy="37" r="3.2"/><circle cx="18" cy="37" r="3.2"/><circle cx="10" cy="45" r="3.2"/><circle cx="18" cy="45" r="3.2"/></g>
    ${arrowTo(27, 41, 33.5, 41, "#8B95A1", 2.2)}
    <rect x="37" y="11" width="23" height="40" rx="5" fill="#FFF7F2" stroke="#FF8A5C" stroke-width="2.4" stroke-dasharray="4.6 3.4"/>
    <g fill="#FF8A5C"><circle cx="43.5" cy="18" r="3.2"/><circle cx="54" cy="25" r="3.2"/><circle cx="44" cy="35" r="3.2"/><circle cx="53.5" cy="44" r="3.2"/></g>`,
  // 물은 예외: 얼기 전 병(점선) 둘레로 얼어서 부푼 병
  waterIce: `<path d="M26 7h12v7c7 3 12 9 12 19 0 13-6 24-18 24S14 46 14 33c0-10 5-16 12-19z" fill="#EAF4FF" stroke="#3D8DFF" stroke-width="2.6"/>
    <path d="M26 7h12v8l5 5v31q0 4-4 4H25q-4 0-4-4V20l5-5z" stroke="#7FB2F5" stroke-width="2" stroke-dasharray="3.4 3"/>
    <path d="M20 28q1-6 6-9" stroke="#fff" stroke-width="2.4"/>
    ${arrowTo(9, 33, 3.5, 33, "#3D8DFF", 2.2)}${arrowTo(55, 33, 60.5, 33, "#3D8DFF", 2.2)}`,
  // 열에너지 흡수: 물질 속으로 들어가는 화살표
  absorb: `<circle cx="32" cy="35" r="14" fill="rgba(255,138,92,.15)" stroke="#FF8A5C" stroke-width="2.6"/>
    ${arrowTo(10, 13, 20.5, 23.5, "#FF8A5C", 2.8)}${arrowTo(54, 13, 43.5, 23.5, "#FF8A5C", 2.8)}${arrowTo(32, 4, 32, 18, "#FF8A5C", 2.8)}
    <circle cx="32" cy="35" r="4.2" fill="#FF8A5C"/>`,
  // 온도 일정(평평한 구간): 그래프, 평평한 두 구간을 카드 색으로
  plateau: `<path d="M22 40h12M44 21h12" stroke="#8A6BFF" stroke-width="8" opacity=".28"/>
    <path d="M10 54V9M10 54h46" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M12 50L22 40h12l10-19h12" stroke="#5E6B7E" stroke-width="3"/>`,
  // 열에너지 방출: 밖으로 나가는 물결
  release: `<circle cx="32" cy="32" r="12" fill="rgba(90,162,248,.14)" stroke="#5AA2F8" stroke-width="2.6"/>
    <circle cx="32" cy="32" r="4.2" fill="#5AA2F8"/>
    <path d="M48 24q5 8 0 16M54 20q7 12 0 24M16 24q-5 8 0 16M10 20q-7 12 0 24" stroke="#FF8A5C" stroke-width="2.6"/>`,
  // 주변이 따뜻: 온도계 상승(주황)과 아지랑이
  warm: `<rect x="23" y="7" width="12" height="35" rx="6" fill="#fff" stroke="#8B95A1" stroke-width="2.4"/>
    <circle cx="29" cy="48" r="8" fill="#FF922B" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M29 42V17" stroke="#FF922B" stroke-width="4"/>
    <path d="M45 12q-3 4 0 8t0 8M53 18q-3 4 0 8t0 8" stroke="#FFC078" stroke-width="2.4"/>`,
  // 주변이 시원: 온도계 하강과 눈송이
  cool: `<rect x="23" y="7" width="12" height="35" rx="6" fill="#fff" stroke="#8B95A1" stroke-width="2.4"/>
    <circle cx="29" cy="48" r="8" fill="#5AA2F8" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M29 42V33" stroke="#5AA2F8" stroke-width="4"/>
    <path d="M49 13v12M43 19h12M44.8 14.8l8.4 8.4M53.2 14.8l-8.4 8.4" stroke="#9EC5FB" stroke-width="2.2"/>`,
};

export function miniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
