// 물질의 상태 변화(IV) 퀴즈·개념 그림: 손코딩 교육용 SVG.
// 색은 답의 단서가 되지 않도록 설계(입자 상자는 전부 같은 색, 배열·간격·잔상만 단서).

const NS = `xmlns="http://www.w3.org/2000/svg"`;

const P = "#6E9EDB"; // 입자 공통색(다크 그림)
const dot = (x: number, y: number, r = 6): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${P}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.33}" r="${r * 0.3}" fill="rgba(255,255,255,.4)"/>`;

/** 움직임 꼬리: 입자 뒤로 가늘어지는 옅은 자국(혜성 꼬리 모양). ang은 꼬리가 뻗는 방향. */
const tail = (x: number, y: number, ang: number, len: number, r: number): string => {
  const c = Math.cos(ang), s = Math.sin(ang);
  const w = r * 0.78;
  const p = (d: number, o: number): string => `${(x + c * d - s * o).toFixed(1)} ${(y + s * d + c * o).toFixed(1)}`;
  return `<path d="M${p(0, w)} L${p(r + len, 0)} L${p(0, -w)} Z" fill="#8FB3E8" opacity=".34"/>`;
};

/** 물질의 세 가지 상태 (가)(나)(다) 입자 모형, 순서 섞음: (가) 기체 / (나) 고체 / (다) 액체 (다크)
 *  세 상자 모두 같은 크기(반지름 6.4)의 입자 9개(2026-11-15 다시 그림).
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

/** 같은 물질의 세 가지 상태를 (가) 고체 → (나) 액체 → (다) 기체 차례로 놓은 입자 모형 (다크, u4l2 문제, 2026-11-22)
 *  stateTrioFig(시험도 쓴다)와 같은 입자 9개, 같은 반지름 6.4. 차례로 견주어 무엇이 커지고 작아지는지 읽게 한다.
 *  움직임 꼬리는 액체에 짧게, 기체에 길게 단다(운동이 점점 활발해진다). 고체는 제자리에서 떨기만 하므로 꼬리를 달지 않는다.
 *  입자의 크기는 세 상자 모두 같다(보기 "입자 하나의 크기"가 커지지 않는다는 단서).
 *  고체 덩어리는 상자 가운데에 떠 있지 않고 액체와 같은 높이의 바닥에 놓인다(맨 아래 줄 중심 y 87.6, 2026-11-22 검산 지적). */
export function stateOrderFig(): string {
  const R = 6.4;
  const frame = (bx: number, label: string, inner: string): string =>
    `<g transform="translate(${bx},10)">
      <rect x="0" y="0" width="100" height="96" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
      ${inner}
      <text x="50" y="122" text-anchor="middle" font-size="14" font-weight="700" fill="#AFC3E3">${label}</text>
    </g>`;
  let solid = "";
  for (let i = 0; i < 9; i++) solid += dot(50 + ((i % 3) - 1) * 13.4, 74.2 + (Math.floor(i / 3) - 1) * 13.4, R);
  const liqPts: [number, number, number][] = [
    [20.6, 87.4, 3.6], [35.8, 88, 3.3], [51.4, 87.2, 5.6], [66.8, 88.2, 3.0], [82.2, 87.4, 4.4],
    [28.4, 73.4, 3.8], [44, 72.4, 4.9], [59.8, 73.8, 5.2], [75.2, 72.8, 4.1],
  ];
  const liq = liqPts.map(([x, y, a]) => tail(x, y, a, 4, R)).join("") + liqPts.map(([x, y]) => dot(x, y, R)).join("");
  const gasPts: [number, number, number][] = [
    [18, 18, 0.6], [54, 14, 2.6], [86, 26, 1.9], [32, 46, 5.4], [72, 50, 3.6], [14, 78, 0.2], [50, 76, 4.6], [86, 80, 2.2], [36, 86, 5.9],
  ];
  const gas = gasPts.map(([x, y, a]) => tail(x, y, a, 12, R)).join("") + gasPts.map(([x, y]) => dot(x, y, R)).join("");
  return `<svg viewBox="0 0 344 136" ${NS} role="img" aria-label="같은 물질의 세 가지 상태를 나타낸 입자 모형 세 상자 (가), (나), (다)">
    ${frame(6, "(가)", solid)}
    ${frame(122, "(나)", liq)}
    ${frame(238, "(다)", gas)}
  </svg>`;
}

/** 물과 식용유를 얼리기 전과 꽁꽁 얼린 뒤 잰 질량과 부피 (라이트, u4l4 문제, 2026-11-22)
 *  물: 50.0 g, 50.0 mL → 50.0 g, 54.5 mL(얼음은 같은 질량의 물보다 부피가 약 9% 크다, 얼음의 밀도 약 0.92 g/mL에서).
 *  식용유: 46.0 g(밀도 약 0.92 g/mL), 50.0 mL → 46.0 g, 47.0 mL(굳으면 부피가 줄어든다. 줄어드는 정도는 기름마다 조금씩 다르다).
 *  질량은 두 물질 모두 그대로다. 랩(식용유 12.60 g)과 다른 값이다. 글자는 설계 13 이상. */
export function freezeTableFig(): string {
  const X0 = 8, W = 328, HEAD = 56, RH = 38;
  const col = [X0, X0 + 76, X0 + 76 + 63, X0 + 76 + 126, X0 + 76 + 189, X0 + W]; // 칸 경계
  const mid = (i: number): number => (col[i] + col[i + 1]) / 2;
  const rows: [string, string[]][] = [
    ["물", ["50.0", "50.0", "50.0", "54.5"]],
    ["식용유", ["46.0", "50.0", "46.0", "47.0"]],
  ];
  const H = HEAD + rows.length * RH;
  const body = rows
    .map(([name, v], r) => {
      const y = HEAD + r * RH;
      return `<rect x="${X0}" y="${y}" width="${W}" height="${RH}" fill="${r % 2 ? "#F7F9FB" : "#FFFFFF"}"/>
        <text x="${mid(0)}" y="${y + 24}" text-anchor="middle" font-size="14" font-weight="700" fill="#333D4B">${name}</text>
        ${v.map((t, i) => `<text x="${mid(i + 1)}" y="${y + 24}" text-anchor="middle" font-size="14.5" font-weight="700" fill="#333D4B">${t}</text>`).join("")}`;
    })
    .join("");
  return `<svg viewBox="0 -3 344 ${H + 8}" ${NS} role="img" aria-label="물과 식용유를 얼리기 전과 얼린 뒤에 잰 질량과 부피를 적은 표">
    <clipPath id="frzClip"><rect x="${X0}" y="0" width="${W}" height="${H}" rx="10"/></clipPath>
    <g clip-path="url(#frzClip)">
      <rect x="${X0}" y="0" width="${W}" height="${HEAD}" fill="#EEF2F6"/>
      ${body}
    </g>
    <text x="${mid(0)}" y="34" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4E5968">물질</text>
    <text x="${(col[1] + col[3]) / 2}" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4E5968">얼리기 전</text>
    <text x="${(col[3] + col[5]) / 2}" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4E5968">얼린 뒤</text>
    ${[1, 2, 3, 4].map((i) => `<text x="${mid(i)}" y="47" text-anchor="middle" font-size="13" font-weight="700" fill="#6B7684">${i % 2 ? "질량(g)" : "부피(mL)"}</text>`).join("")}
    <rect x="${X0}" y="0" width="${W}" height="${H}" rx="10" fill="none" stroke="#C9CFD6" stroke-width="1.4"/>
    <path d="M${col[1]} 0V${H}M${col[3]} 0V${H}" stroke="#C9CFD6" stroke-width="1.3"/>
    <path d="M${col[2]} 30V${H}M${col[4]} 30V${H}M${col[1]} 30H${X0 + W}" stroke="#DCE1E7" stroke-width="1.1"/>
    <path d="M${X0} ${HEAD}H${X0 + W}M${X0} ${HEAD + RH}H${X0 + W}" stroke="#DCE1E7" stroke-width="1.2"/>
  </svg>`;
}

/** 가열 곡선: 구간 A~E, 시간과 온도 눈금이 있는 판 (라이트, u4l5 문제 둘, 2026-11-22)
 *  kind "solid": 20 ℃의 어떤 고체를 가열(40 ℃와 80 ℃에서 온도가 일정). A 0~2분 20→40, B 2~6분 40, C 6~10분 40→80, D 10~17분 80, E 17~19분 80→96.
 *  kind "ice"  : −20 ℃의 얼음을 가열(0 ℃와 100 ℃에서 온도가 일정). A 0~1분 −20→0, B 1~5분 0, C 5~11분 0→100, D 11~18분 100, E 18~19분 100→110.
 *  끓는(기화하는) 구간 D를 녹는(융해하는) 구간 B보다 길게 그린다. 구간 이름표는 평평한 구간은 그 위에, 비탈은 비탈 가운데의 왼쪽 위에 둔다
 *  (첫 비탈 A만 세로축에 막혀 오른쪽에 두고 지시선으로 잇는다).
 *  눈금 숫자는 평평한 구간의 온도가 눈금선 위에 오게 고른다. '녹는점, 끓는점' 같은 말은 쓰지 않는다(중1). 대체 글에 답을 쓰지 않는다. */
export function segCurveFig(kind: "solid" | "ice"): string {
  const cfg =
    kind === "solid"
      ? { yMin: 0, yMax: 100, yTicks: [0, 20, 40, 60, 80, 100], tMax: 20, tStep: 2, pts: [[0, 20], [2, 40], [6, 40], [10, 80], [17, 80], [19, 96]] as [number, number][] }
      : { yMin: -20, yMax: 120, yTicks: [-20, 0, 20, 40, 60, 80, 100, 120], tMax: 20, tStep: 2, pts: [[0, -20], [1, 0], [5, 0], [11, 100], [18, 100], [19, 110]] as [number, number][] };
  const X0 = 46, X1 = 320, Y0 = 186, Y1 = 26;
  const gx = (t: number): number => X0 + ((X1 - X0) * t) / cfg.tMax;
  const gy = (T: number): number => Y0 - ((Y0 - Y1) * (T - cfg.yMin)) / (cfg.yMax - cfg.yMin);
  const f = (v: number): string => v.toFixed(1);
  const xt = Array.from({ length: cfg.tMax / cfg.tStep + 1 }, (_, i) => {
    const t = i * cfg.tStep;
    return `<line x1="${f(gx(t))}" y1="${Y0}" x2="${f(gx(t))}" y2="${Y1}" stroke="#EEF1F5" stroke-width="1"/>
      <text x="${f(gx(t))}" y="${Y0 + 17}" text-anchor="middle" font-size="13" fill="#6B7684">${t}</text>`;
  }).join("");
  const yt = cfg.yTicks
    .map((T) => `<line x1="${X0}" y1="${f(gy(T))}" x2="${X1}" y2="${f(gy(T))}" stroke="#E5E9EE" stroke-width="1"/>
      <text x="${X0 - 7}" y="${f(gy(T) + 4.5)}" text-anchor="end" font-size="13" fill="#6B7684">${T < 0 ? `−${-T}` : T}</text>`)
    .join("");
  const P = cfg.pts.map(([t, T]) => [gx(t), gy(T)] as [number, number]);
  const line = P.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join(" ");
  const labels = ["A", "B", "C", "D", "E"]
    .map((t, i) => {
      const [x1, y1] = P[i];
      const [x2, y2] = P[i + 1];
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      if (Math.abs(y1 - y2) < 0.5) return `<text x="${f(mx)}" y="${f(my - 10)}" text-anchor="middle" font-size="14" font-weight="800" fill="#4E5968">${t}</text>`;
      // 첫 비탈은 세로축과 눈금 숫자에 붙어 있어 왼쪽 위에 둘 자리가 없다. 비탈 가운데의 오른쪽(다음 평평한 구간의 밑)에 두고,
      // 가는 지시선으로 비탈과 이어 위의 평평한 구간 이름으로 읽히지 않게 한다(2026-11-22 검산 지적: 얼음 그래프에서 A가 B 밑에 붙어 보였다)
      if (i === 0) {
        const lx = mx + 24, ly = my + 1.5; // 글자 가운데
        return `<path d="M${f(mx + 3)} ${f(my + 0.5)}L${f(lx - 7)} ${f(ly)}" stroke="#8B95A1" stroke-width="1.2" stroke-linecap="round"/>
          <text x="${f(lx)}" y="${f(ly + 5)}" text-anchor="middle" font-size="14" font-weight="800" fill="#4E5968">${t}</text>`;
      }
      // 비탈: 가운데에서 왼쪽 위로 수직 거리 15
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
      let nx = dy / len, ny = -dx / len;
      if (ny > 0) { nx = -nx; ny = -ny; }
      return `<text x="${f(mx + nx * 15)}" y="${f(my + ny * 15 + 5)}" text-anchor="middle" font-size="14" font-weight="800" fill="#4E5968">${t}</text>`;
    })
    .join("");
  const what = kind === "solid" ? "20 ℃의 어떤 고체 물질" : "−20 ℃의 얼음";
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="${what}을 일정한 세기로 가열하며 잰 시간에 따른 온도 그래프. 구간 A부터 E까지 이름이 붙어 있다">
    ${yt}${xt}
    <line x1="${X0}" y1="${Y1}" x2="${X0}" y2="${Y0}" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}" stroke="#B0B8C1" stroke-width="1.6"/>
    <path d="${line}" fill="none" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${labels}
    <text x="8" y="15" font-size="12.5" font-weight="700" fill="#4E5968">온도(℃)</text>
    <text x="340" y="220" text-anchor="end" font-size="12.5" font-weight="700" fill="#4E5968">가열 시간(분)</text>
  </svg>`;
}

/** 기체가 액체로 바뀌는 입자 모형(액화, 다크, u4l4 문제, 2026-11-22). 왼쪽은 멀리 흩어져 빠르게 움직이는 입자 9개(수증기),
 *  오른쪽은 상자 바닥에 모인 입자 9개(물방울). 상태가 변해도 입자의 수와 크기(반지름 6)는 그대로다. 달라지는 것은 입자 사이의 거리와 배열뿐이다.
 *  예전 판(기화, 액체 → 기체)과 방향이 반대다. 움직임 꼬리는 stateOrderFig와 같은 모양으로 기체에 길게, 액체에 짧게 단다.
 *  액체는 바닥에 6개, 그 위에 3개를 틈 2~3으로 어긋나게 놓는다(두 줄로 가지런하면 고체처럼 읽힌다, 2026-11-22 검산 지적). */
export function condenseFig(): string {
  const gasPts: [number, number, number][] = [
    [28, 30, 0.6], [64, 24, 2.3], [92, 44, 4.0], [120, 24, 1.0], [38, 62, 1.4], [76, 70, 5.2], [102, 82, 3.1], [46, 88, 2.0], [78, 102, 3.6],
  ];
  const gas = gasPts.map(([x, y, a]) => tail(x, y, a, 10, 6)).join("") + gasPts.map(([x, y]) => dot(x, y, 6)).join("");
  // 바닥 줄의 꼬리는 위나 옆으로만(아래로 뻗으면 상자 바닥을 뚫는다)
  const liqPts: [number, number, number][] = [
    [243.5, 94.4, 3.6], [257.4, 93.6, 4.4], [271.6, 94.8, 2.9], [285.8, 94.0, 5.3], [300.2, 94.6, 0.1], [314.4, 93.6, 4.0],
    [250.6, 81.6, 3.3], [265.0, 81.0, 5.2], [293.0, 81.2, 1.9],
  ];
  const liq = liqPts.map(([x, y, a]) => tail(x, y, a, 3.5, 6)).join("") + liqPts.map(([x, y]) => dot(x, y, 6)).join("");
  return `<svg viewBox="0 0 344 120" ${NS} role="img" aria-label="넓게 흩어진 입자 9개가 화살표를 지나 상자 바닥에 모인 입자 9개로 변하는 모형">
    <rect x="12" y="8" width="126" height="104" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
    ${gas}
    <path d="M152 60h64" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M206 48l14 12-14 12" fill="none" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="232" y="18" width="94" height="84" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
    ${liq}
  </svg>`;
}

// ── recap 미니 아트(64×64, 카드에서는 32px로 보인다) ───────────────────
// 2026-11-15 다듬음(감사 하 후보): 확산은 가운데 무리에서 바깥으로 흩어지는 입자와 화살(입자끼리 이은 선을 걷음),
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
