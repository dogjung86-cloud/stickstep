// 중2 III(빛과 파동) 퀴즈·개념 그림 — 손코딩 교육용 SVG. 라이트(흰 카드) 기준.
// 색이 정답의 단서가 되지 않게 설계(경로 후보는 전부 같은 색). recap 미니아트 포함.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 광선 위 진행 방향 화살촉(V자) — 어설픈 반쪽 틱이 잡선처럼 보이는 문제를 막는다.
 *  (x1,y1)→(x2,y2) 광선의 t 지점에 열린 V를 그린다. */
function rayArrow(x1: number, y1: number, x2: number, y2: number, t: number, color: string, len = 9): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const n = Math.hypot(dx, dy) || 1;
  const ux = dx / n;
  const uy = dy / n;
  const ax = x1 + dx * t;
  const ay = y1 + dy * t;
  // 화살촉 날개 = 역방향(-u)을 ±0.45rad 회전한 두 선
  const wing = (sign: number): [number, number] => {
    const cos = Math.cos(0.45);
    const sin = Math.sin(0.45) * sign;
    const wx = -ux * cos + uy * sin;
    const wy = -ux * sin - uy * cos;
    return [ax + wx * len, ay + wy * len];
  };
  const [w1x, w1y] = wing(1);
  const [w2x, w2y] = wing(-1);
  return `<path d="M${w1x.toFixed(1)} ${w1y.toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}L${w2x.toFixed(1)} ${w2y.toFixed(1)}" stroke="${color}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
}

/** L1 마무리 1번 — 광선이 거울 면과 20°를 이루는 그림(입사각·반사각은?) */
export function reflectAngleFig(): string {
  // 거울 수평, 입사점 (172,150). 광선은 거울면과 20° → 법선과 70°.
  const P = { x: 172, y: 150 };
  const deg = (20 * Math.PI) / 180;
  const L = 128;
  const sx = P.x - Math.cos(deg) * L;
  const sy = P.y - Math.sin(deg) * L;
  const rx = P.x + Math.cos(deg) * L;
  const ry = P.y - Math.sin(deg) * L;
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="거울에 입사한 빛이 거울 면과 20도를 이루는 그림">
    <line x1="30" y1="150" x2="314" y2="150" stroke="#5E6B7E" stroke-width="3.4"/>
    ${Array.from({ length: 14 }, (_, i) => `<line x1="${44 + i * 20}" y1="150" x2="${36 + i * 20}" y2="162" stroke="#B0B8C1" stroke-width="1.6"/>`).join("")}
    <line x1="${P.x}" y1="150" x2="${P.x}" y2="34" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="6 6"/>
    <text x="${P.x + 8}" y="30" font-size="11.5" fill="#8B95A1">법선</text>
    <path d="M${sx} ${sy}L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    <path d="M${P.x} ${P.y}L${rx} ${ry}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    ${rayArrow(sx, sy, P.x, P.y, 0.55, "#4E5968")}
    ${rayArrow(P.x, P.y, rx, ry, 0.55, "#4E5968")}
    <path d="M${P.x - 52} 150 A52 52 0 0 1 ${P.x - Math.cos(deg) * 52} ${P.y - Math.sin(deg) * 52}" stroke="#F25C54" stroke-width="2.4"/>
    <text x="${P.x - 82}" y="142" font-size="13" font-weight="800" fill="#F25C54">20°</text>
    <text x="${sx - 4}" y="${sy - 8}" font-size="11.5" fill="#4E5968">빛</text>
    <text x="292" y="176" font-size="11.5" fill="#8B95A1">거울</text>
  </svg>`;
}

/** L2 — 공기→물 굴절 경로 고르기(①~⑤, 전부 같은 색 — 색이 단서가 되지 않게).
 *  ②가 스넬 법칙 실제 계산값(입사각 55.8° → 굴절각 38.5°), ③은 직진 함정, ⑤는 반사 함정. */
export function refractPathFig(): string {
  const P = { x: 172, y: 96 };
  const paths: [string, number, number, number, number][] = [
    // [라벨, 끝 x, 끝 y, 라벨 dx, 라벨 dy]
    ["①", 188, 184, -4, 15],
    ["②", 239, 180, 0, 16],
    ["③", 289, 176, 6, 14],
    ["④", 322, 146, 8, 4],
    ["⑤", 278, 22, 8, 2],
  ];
  return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="공기에서 물로 비스듬히 들어간 빛이 나아갈 경로 다섯 가지">
    <rect x="20" y="96" width="304" height="98" rx="8" fill="#EAF3FE"/>
    <line x1="20" y1="96" x2="324" y2="96" stroke="#7FB0E0" stroke-width="2.4"/>
    <text x="30" y="88" font-size="11.5" fill="#8B95A1">공기</text>
    <text x="30" y="114" font-size="11.5" fill="#5E86B4">물</text>
    <line x1="${P.x}" y1="20" x2="${P.x}" y2="186" stroke="#B0B8C1" stroke-width="1.6" stroke-dasharray="5 6"/>
    <path d="M66 24L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
    ${rayArrow(66, 24, P.x, P.y, 0.55, "#4E5968")}
    ${paths
      .map(
        ([lb, x, y, dx, dy]) =>
          `<path d="M${P.x} ${P.y}L${x} ${y}" stroke="#8B95A1" stroke-width="2" stroke-dasharray="5 5"/>
           <text x="${x + dx}" y="${y + dy}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${lb}</text>`,
      )
      .join("")}
  </svg>`;
}

/** L2 마무리 2번 — 물을 붓기 전/후 컵 속 동전 */
export function coinCupFig(): string {
  const cup = (x: number, water: boolean): string => `
    <g transform="translate(${x},0)">
      <ellipse cx="70" cy="176" rx="52" ry="5" fill="#EDF0F4"/>
      ${water ? `<path d="M28 92h84v66a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8z" fill="#CBE2FB"/><ellipse cx="70" cy="92" rx="42" ry="5" fill="#E4F1FF" stroke="#9CC2E8" stroke-width="1.4"/>` : ""}
      <path d="M24 58h92l-6 102a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8z" stroke="#8B95A1" stroke-width="2.6" fill="${water ? "none" : "#F9FBFD"}" ${water ? "" : 'fill-opacity=".5"'}/>
      <ellipse cx="82" cy="160" rx="13" ry="4.5" fill="#F0C25E" stroke="#B08D3E" stroke-width="1.6"/>
      ${water
        ? `<path d="M148 34L96 92 82 158" stroke="#E8A03E" stroke-width="2.2" stroke-dasharray="5 5"/>`
        : `<path d="M148 34L104 84" stroke="#B0B8C1" stroke-width="2.2" stroke-dasharray="5 5"/><path d="M104 84l-8 10" stroke="#E2E6EC" stroke-width="2.2" stroke-dasharray="4 5"/>`}
      <g transform="translate(150,32)">
        <path d="M-11 0Q0-8 11 0Q0 8 -11 0z" fill="#fff" stroke="#4E5968" stroke-width="1.8"/>
        <circle cx="-2" cy="0" r="3.4" fill="#5E86B4"/>
      </g>
      <text x="70" y="196" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${water ? "물을 부은 후" : "물을 붓기 전"}</text>
    </g>`;
  return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="물을 붓기 전에는 동전이 안 보이고, 부으면 보인다">${cup(4, false)}${cup(178, true)}</svg>`;
}

/** L4 마무리 4번 — 평면거울에 비친 강아지와 상 (가) */
export function dogMirrorFig(): string {
  const dog = (x: number, ghost: boolean): string => `
    <g transform="translate(${x},96)" ${ghost ? 'opacity=".55"' : ""} stroke="${ghost ? "#7FA6CC" : "#4E5968"}" stroke-width="2.4" fill="${ghost ? "#EAF3FE" : "#FFF7EE"}" ${ghost ? 'stroke-dasharray="4 4"' : ""}>
      <ellipse cx="0" cy="24" rx="26" ry="17"/>
      <circle cx="${ghost ? -30 : 30}" cy="6" r="13"/>
      <path d="M${ghost ? -38 : 38} -4l${ghost ? -4 : 4}-9 ${ghost ? 7 : -7} 3M${ghost ? -24 : 24} -6l${ghost ? 3 : -3}-8 ${ghost ? -7 : 7} 2" fill="none"/>
      <circle cx="${ghost ? -33 : 33}" cy="4" r="1.8" fill="${ghost ? "#7FA6CC" : "#4E5968"}" stroke="none"/>
      <path d="M${ghost ? 24 : -24} 14q${ghost ? 10 : -10}-3 ${ghost ? 12 : -12}-12" fill="none"/>
      <path d="M-12 39v8M12 39v8" fill="none"/>
    </g>`;
  return `<svg viewBox="0 0 344 176" ${NS} fill="none" role="img" aria-label="평면거울 앞의 강아지와 거울 속 상 (가)">
    <line x1="172" y1="16" x2="172" y2="160" stroke="#5E6B7E" stroke-width="4"/>
    ${Array.from({ length: 8 }, (_, i) => `<line x1="176" y1="${22 + i * 18}" x2="186" y2="${14 + i * 18}" stroke="#B0B8C1" stroke-width="1.6"/>`).join("")}
    ${dog(84, false)}
    ${dog(260, true)}
    <text x="84" y="166" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">강아지</text>
    <text x="260" y="166" text-anchor="middle" font-size="12" font-weight="700" fill="#5E86B4">(가)</text>
    <text x="160" y="14" text-anchor="end" font-size="11" fill="#8B95A1">평면거울</text>
  </svg>`;
}

/** L5 — 볼록·오목 거울 단면(어느 쪽이 어떤 상?) */
export function twoMirrorsFig(): string {
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="볼록 거울과 오목 거울의 단면">
    <g transform="translate(88,84)">
      <path d="M-14 -56Q26 0 -14 56" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
      ${Array.from({ length: 7 }, (_, i) => {
        const t = -0.9 + (i * 1.8) / 6;
        const y = t * 56;
        const x = -14 + (1 - t * t) * 40;
        return `<line x1="${x}" y1="${y}" x2="${x + 10}" y2="${y - 8}" stroke="#B0B8C1" stroke-width="1.6"/>`;
      }).join("")}
      <text x="0" y="80" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가) 볼록 거울</text>
      <path d="M-70 0h34M-42 -4l6 4-6 4" stroke="#8B95A1" stroke-width="2" fill="none"/>
    </g>
    <g transform="translate(258,84)">
      <path d="M14 -56Q-26 0 14 56" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
      ${Array.from({ length: 7 }, (_, i) => {
        const t = -0.9 + (i * 1.8) / 6;
        const y = t * 56;
        const x = 14 - (1 - t * t) * 40;
        return `<line x1="${x}" y1="${y}" x2="${x + 10}" y2="${y - 8}" stroke="#B0B8C1" stroke-width="1.6"/>`;
      }).join("")}
      <text x="0" y="80" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나) 오목 거울</text>
      <path d="M-72 0h34M-44 -4l6 4-6 4" stroke="#8B95A1" stroke-width="2" fill="none"/>
    </g>
  </svg>`;
}

/** L5 마무리 6번 — 렌즈 (가)(나)로 가까운 물체를 본 모습 */
export function twoLensFig(): string {
  const bug = (x: number, y: number, s: number): string => `
    <g transform="translate(${x},${y}) scale(${s})">
      <ellipse cx="0" cy="0" rx="10" ry="8" fill="#E86A5A" stroke="#A8382C" stroke-width="1.4"/>
      <circle cx="0" cy="-7.5" r="4" fill="#3C4654"/>
      <line x1="0" y1="-8" x2="0" y2="8" stroke="#3C4654" stroke-width="1"/>
      <circle cx="-4" cy="-1" r="1.5" fill="#3C4654"/><circle cx="4" cy="2" r="1.5" fill="#3C4654"/>
    </g>`;
  const lens = (x: number, convex: boolean, label: string, mag: number): string => `
    <g transform="translate(${x},0)">
      ${convex
        ? `<path d="M0 26Q22 84 0 142Q-22 84 0 26z" fill="#EAF3FE" stroke="#7FA6CC" stroke-width="2.2"/>`
        : `<path d="M-13 26h26Q4 84 13 142h-26Q-4 84 -13 26z" fill="#EAF3FE" stroke="#7FA6CC" stroke-width="2.2"/>`}
      ${bug(0, 84, mag)}
      <text x="0" y="166" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>
    </g>`;
  return `<svg viewBox="0 0 344 176" ${NS} fill="none" role="img" aria-label="렌즈 두 개로 가까운 무당벌레를 본 모습 — 가는 크게, 나는 작게 보인다">
    ${bug(52, 84, 1)}
    <text x="52" y="166" text-anchor="middle" font-size="11.5" fill="#8B95A1">실제 크기</text>
    ${lens(172, true, "(가)", 1.75)}
    ${lens(292, false, "(나)", 0.6)}
  </svg>`;
}

/** L6 마무리 8번 — 모니터 확대: 빨강·초록 화소만 켜짐 */
export function pixelRGFig(): string {
  const cell = (x: number, y: number): string => {
    const bars = [
      ["#E5322E", true],
      ["#12A84E", true],
      ["#B9C2CE", false],
    ] as [string, boolean][];
    return bars
      .map(
        ([c, on], k) =>
          `<rect x="${x + k * 26}" y="${y}" width="18" height="52" rx="4" fill="${c}" opacity="${on ? 1 : 0.28}"/>`,
      )
      .join("");
  };
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="모니터 화면 확대 — 빨간색과 초록색 화소는 켜지고 파란색 화소는 꺼져 있다">
    <rect x="42" y="16" width="260" height="150" rx="12" fill="#10161F"/>
    ${[0, 1].flatMap((r) => [0, 2].map((c) => cell(74 + c * 52, 32 + r * 66))).join("")}
    <rect x="42" y="16" width="260" height="150" rx="12" stroke="#8B95A1" stroke-width="2"/>
    <text x="52" y="182" font-size="11" fill="#8B95A1">현미경으로 확대한 모습</text>
  </svg>`;
}

/** L6 마무리 7번 — 어떤 옷에 빨강·초록·파랑 조명을 비춘 모습 */
export function clothLightFig(): string {
  const shirt = (x: number, bodyColor: string, lightName: string, lightColor: string): string => `
    <g transform="translate(${x},0)">
      <circle cx="0" cy="30" r="13" fill="${lightColor}" opacity=".9"/>
      <path d="M-9 39 L-22 116 L22 116 L9 39" fill="none"/>
      <path d="M-20 52h40l6 64h-52z" fill="${bodyColor}" stroke="#3C4654" stroke-width="1.6"/>
      <path d="M-20 52l-12 14 8 10 8-8M20 52l12 14-8 10-8-8" fill="${bodyColor}" stroke="#3C4654" stroke-width="1.6"/>
      <path d="M-8 52q8 7 16 0" stroke="#3C4654" stroke-width="1.6" fill="none"/>
      <text x="0" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${lightName}</text>
    </g>`;
  return `<svg viewBox="0 0 344 156" ${NS} fill="none" role="img" aria-label="같은 옷이 빨간 조명에선 검은색, 초록 조명에선 초록색, 파란 조명에선 파란색으로 보인다">
    ${shirt(66, "#20262E", "빨간 조명", "#E5322E")}
    ${shirt(172, "#18A34A", "초록 조명", "#12A84E")}
    ${shirt(278, "#2454C8", "파란 조명", "#3A6CFF")}
  </svg>`;
}

/** L7 — 파동 단면(눈금 포함): 파장·진폭 읽기 */
export function waveReadFig(): string {
  let d = "";
  for (let x = 0; x <= 280; x += 4) {
    const y = 96 - Math.sin((x / 280) * Math.PI * 4) * 44; // 파장 140px = 2m
    d += `${d ? "L" : "M"}${x + 44} ${y.toFixed(1)}`;
  }
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="눈금이 있는 파동 그래프 — 가로 눈금 1미터, 세로 진폭 표시">
    <line x1="44" y1="20" x2="44" y2="172" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="44" y1="96" x2="330" y2="96" stroke="#D0D6DE" stroke-width="1.4"/>
    ${[0, 1, 2, 3, 4].map((i) => `<line x1="${44 + i * 70}" y1="96" x2="${44 + i * 70}" y2="172" stroke="#EDF0F4" stroke-width="1.2"/><text x="${44 + i * 70}" y="188" text-anchor="middle" font-size="10.5" fill="#8B95A1">${i}</text>`).join("")}
    ${[44, -44].map((v) => `<line x1="40" y1="${96 - v}" x2="48" y2="${96 - v}" stroke="#B0B8C1" stroke-width="1.6"/>`).join("")}
    <text x="36" y="56" text-anchor="end" font-size="10.5" fill="#8B95A1">20</text>
    <text x="36" y="146" text-anchor="end" font-size="10.5" fill="#8B95A1">-20</text>
    <path d="${d}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <text x="14" y="14" font-size="11" fill="#4E5968">변위(cm)</text>
    <text x="330" y="188" text-anchor="end" font-size="11" fill="#4E5968">거리(m)</text>
  </svg>`;
}

/** L7 hotspot — 마루·골·파장·진폭 찾기용 큰 파동 그림(다크 무대).
 *  기하 규약(스팟 좌표와 1:1 — hotspot 스텝은 pad0로 SVG를 스테이지에 꽉 채워
 *  스팟 % = 좌표/viewBox × 100 이 정확히 성립):
 *  파형 y = 112 − 46·sin((x−30)/284·4π), x∈[30,314] — 마루 (65.5,66)·(207.5,66),
 *  골 (136.5,158)·(278.5,158). 파장 브래킷 y=44(65.5→207.5), 진폭 브래킷 x=296(중심→골). */
export function waveHotspotFig(): string {
  let d = "";
  for (let x = 30; x <= 314; x += 2) {
    const y = 112 - Math.sin(((x - 30) / 284) * Math.PI * 4) * 46;
    d += `${d ? "L" : "M"}${x} ${y.toFixed(1)}`;
  }
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="파동의 각 부분을 찾는 그림">
    <line x1="24" y1="112" x2="320" y2="112" stroke="rgba(196,214,240,.45)" stroke-width="1.4" stroke-dasharray="5 6"/>
    <text x="28" y="104" font-size="10.5" fill="rgba(196,214,240,.8)">진동 중심</text>
    <path d="${d}" stroke="#8FD6FF" stroke-width="3.4" stroke-linecap="round"/>
    <!-- 마루(첫 번째)·골(첫 번째) 점 — 곡선 위 정확한 위치 -->
    <circle cx="65.5" cy="66" r="4.5" fill="#FFD978"/>
    <circle cx="136.5" cy="158" r="4.5" fill="#8FB6FF"/>
    <!-- 파장 브래킷: 마루 → 이웃 마루 -->
    <path d="M65.5 44h142M65.5 38v12M207.5 38v12" stroke="#D8BEFF" stroke-width="2"/>
    <path d="M65.5 50v13M207.5 50v13" stroke="#D8BEFF" stroke-width="1.4" stroke-dasharray="2 3" opacity=".7"/>
    <!-- 진폭 브래킷: 진동 중심 → 골 깊이(두 번째 골 옆) -->
    <path d="M296 112v46M290 112h12M290 158h12" stroke="#7EE6D0" stroke-width="2"/>
    <path d="M282 158h10" stroke="#7EE6D0" stroke-width="1.4" stroke-dasharray="2 3" opacity=".7"/>
  </svg>`;
}

/** L7 waveLab 하단 설명 — 파동 4요소 정지 그림(라이트 카드).
 *  파형 y = 96 − 38·sin((x−26)/280·4π), x∈[26,306] — 마루 (61,58)·(201,58), 골 (131,134)·(271,134). */
export function waveExplainFig(): string {
  let d = "";
  for (let x = 26; x <= 306; x += 2) {
    const y = 96 - Math.sin(((x - 26) / 280) * Math.PI * 4) * 38;
    d += `${d ? "L" : "M"}${x} ${y.toFixed(1)}`;
  }
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="파동의 네 요소 — 마루, 골, 파장, 진폭">
    <line x1="20" y1="96" x2="320" y2="96" stroke="#C4CBD4" stroke-width="1.3" stroke-dasharray="5 6"/>
    <text x="320" y="88" text-anchor="end" font-size="10" fill="#8B95A1">진동 중심</text>
    <path d="${d}" stroke="#5AA2F8" stroke-width="3" stroke-linecap="round"/>
    <circle cx="61" cy="58" r="4" fill="#E8961E"/>
    <text x="61" y="50" text-anchor="middle" font-size="11.5" font-weight="800" fill="#E8961E">마루</text>
    <circle cx="131" cy="134" r="4" fill="#3A6CD8"/>
    <text x="131" y="153" text-anchor="middle" font-size="11.5" font-weight="800" fill="#3A6CD8">골</text>
    <path d="M61 36h140M61 30v12M201 30v12" stroke="#7C5CD6" stroke-width="1.8"/>
    <path d="M61 42v14M201 42v14" stroke="#7C5CD6" stroke-width="1.2" stroke-dasharray="2 3" opacity=".65"/>
    <text x="131" y="28" text-anchor="middle" font-size="11.5" font-weight="800" fill="#7C5CD6">파장</text>
    <path d="M288 96v38M283 96h10M283 134h10" stroke="#0B9E96" stroke-width="1.8"/>
    <text x="288" y="152" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0B9E96">진폭</text>
  </svg>`;
}

/** L8 soundLab 하단 설명 — 3요소 미니 그래프(비교 쌍) */
export function soundMiniFig(kind: "amp" | "freq" | "tone"): string {
  const wavePath = (x0: number, x1: number, amp: number, cycles: number, mode: "sine" | "tri" = "sine"): string => {
    let d = "";
    for (let x = x0; x <= x1; x += 1.5) {
      const p = ((x - x0) / (x1 - x0)) * cycles;
      const v = mode === "sine" ? Math.sin(p * Math.PI * 2) : 1 - 4 * Math.abs(((p + 0.25) % 1) - 0.5);
      d += `${d ? "L" : "M"}${x} ${(24 - v * amp).toFixed(1)}`;
    }
    return d;
  };
  const inner =
    kind === "amp"
      ? `<path d="${wavePath(3, 43, 17, 2)}" stroke="#37B6D8" stroke-width="2.2"/>
         <path d="${wavePath(49, 89, 6.5, 2)}" stroke="#AEB8C6" stroke-width="2"/>`
      : kind === "freq"
        ? `<path d="${wavePath(3, 43, 12, 1.5)}" stroke="#AEB8C6" stroke-width="2"/>
           <path d="${wavePath(49, 89, 12, 4)}" stroke="#8A6BFF" stroke-width="2.2"/>`
        : `<path d="${wavePath(3, 43, 12, 2)}" stroke="#E8961E" stroke-width="2.2"/>
           <path d="${wavePath(49, 89, 12, 2, "tri")}" stroke="#E8961E" stroke-width="2.2"/>`;
  return `<svg viewBox="0 0 92 48" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <line x1="2" y1="24" x2="90" y2="24" stroke="#E6EAF0" stroke-width="1"/>
    <line x1="46" y1="6" x2="46" y2="42" stroke="#EDF0F4" stroke-width="1"/>
    ${inner}
  </svg>`;
}

/** L7 마무리 10번 — 호수의 공과 돌 */
export function pondBallFig(): string {
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="호수에 뜬 축구공 뒤쪽에 돌이 떨어져 물결이 퍼진다">
    <rect x="12" y="86" width="320" height="70" rx="10" fill="#D6E9FB"/>
    <path d="M12 88h320" stroke="#7FB0E0" stroke-width="2.2"/>
    ${[16, 34, 54].map((r) => `<ellipse cx="252" cy="88" rx="${r}" ry="${r * 0.26}" stroke="#7FA6CC" stroke-width="1.8" fill="none" opacity="${1 - r / 80}"/>`).join("")}
    <circle cx="252" cy="76" r="7" fill="#8B95A1" stroke="#5E6B7E" stroke-width="1.6"/>
    <path d="M252 40v22M247 56l5 7 5-7" stroke="#8B95A1" stroke-width="2" fill="none"/>
    <g transform="translate(120,74)">
      <circle cx="0" cy="0" r="15" fill="#fff" stroke="#4E5968" stroke-width="2.2"/>
      <path d="M0-4l4.5 3-1.7 5.3H-2.8L-4.5-1z" fill="#4E5968"/>
      <path d="M-10-9q5 4 5 9M10-9q-5 4-5 9" stroke="#8B95A1" stroke-width="1.6" fill="none"/>
    </g>
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <circle cx="52" cy="34" r="8"/>
      <path d="M52 42v16M52 47l9 5M52 47l-8 6M52 58l-6 11M52 58l7 11"/>
    </g>
    <text x="120" y="122" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">축구공</text>
    <text x="252" y="122" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">돌</text>
  </svg>`;
}

/** L8 마무리 13번 — 파형 (가)~(라): 세기·높낮이 비교 */
export function waveFourFig(): string {
  const cell = (x: number, y: number, label: string, amp: number, cyc: number): string => {
    let d = "";
    for (let i = 0; i <= 116; i += 2) {
      const yy = 40 - Math.sin((i / 116) * Math.PI * 2 * cyc) * amp;
      d += `${d ? "L" : "M"}${x + 18 + i} ${(y + yy).toFixed(1)}`;
    }
    return `<text x="${x}" y="${y + 12}" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>
      <line x1="${x + 18}" y1="${y + 40}" x2="${x + 134}" y2="${y + 40}" stroke="#E2E6EC" stroke-width="1.2"/>
      <path d="${d}" stroke="#5E6B7E" stroke-width="2.2" fill="none"/>`;
  };
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="파형 네 개 — 가는 진폭이 크고, 나는 진폭이 작고, 다는 진동수가 크고, 라는 진동수가 작다">
    ${cell(14, 8, "(가)", 30, 3)}
    ${cell(184, 8, "(나)", 10, 3)}
    ${cell(14, 100, "(다)", 19, 6)}
    ${cell(184, 100, "(라)", 19, 1.5)}
  </svg>`;
}

/** L8 — 피아노 건반 ㉠㉡㉢ (진동수 비교) */
export function pianoKeysFig(): string {
  const white = Array.from({ length: 10 }, (_, i) => `<rect x="${32 + i * 28}" y="36" width="27" height="108" rx="3" fill="#FDFEFF" stroke="#B0B8C1" stroke-width="1.4"/>`).join("");
  const blackIdx = [0, 1, 3, 4, 5, 7, 8];
  const black = blackIdx.map((i) => `<rect x="${32 + i * 28 + 19}" y="36" width="17" height="66" rx="2.5" fill="#333D4B"/>`).join("");
  const mark = (i: number, t: string): string =>
    `<circle cx="${32 + i * 28 + 13.5}" cy="128" r="9.5" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.6"/><text x="${32 + i * 28 + 13.5}" y="132.5" text-anchor="middle" font-size="11" font-weight="800" fill="#1B64DA">${t}</text>`;
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="피아노 건반 — 왼쪽부터 ㉠, 가운데 ㉡, 오른쪽 ㉢">
    <rect x="28" y="24" width="288" height="124" rx="8" fill="#E7EBF0"/>
    ${white}${black}
    ${mark(0, "㉠")}${mark(4, "㉡")}${mark(9, "㉢")}
    <text x="32" y="16" font-size="10.5" fill="#8B95A1">낮은 음 ←</text>
    <text x="316" y="16" text-anchor="end" font-size="10.5" fill="#8B95A1">→ 높은 음</text>
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
const MINI: Record<string, string> = {
  reflectLaw: `<path d="M8 50h48" stroke="#5E6B7E" stroke-width="2.8"/>
    <path d="M32 50V14" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="4 4"/>
    <path d="M12 18L32 50l20-32" stroke="#F0A422" stroke-width="2.8" fill="none"/>
    <path d="M24 34a14 14 0 0 1 16 0" stroke="#37B6D8" stroke-width="2" fill="none"/>`,
  diffuse: `<path d="M8 46l8-5 8 6 8-6 8 5 8-5 8 6" stroke="#5E6B7E" stroke-width="2.6" fill="none"/>
    <path d="M14 12l6 30M30 12l2 29M46 12l-4 30" stroke="#F0A422" stroke-width="2" fill="none"/>
    <path d="M20 42l10-18M32 41l-6-20M42 42l12-14" stroke="#37B6D8" stroke-width="2" fill="none"/>`,
  refractBend: `<path d="M8 34h48" stroke="#5AA2F8" stroke-width="2.4"/>
    <rect x="8" y="34" width="48" height="22" rx="4" fill="#5AA2F8" opacity=".18"/>
    <path d="M14 8L32 34l10 22" stroke="#F0A422" stroke-width="2.8" fill="none"/>
    <path d="M32 34l16 22" stroke="#B0B8C1" stroke-width="1.8" stroke-dasharray="3 4"/>`,
  strawBend: `<path d="M14 30h36l-3 24a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="#EAF3FE" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M18 34h28" stroke="#5AA2F8" stroke-width="2"/>
    <path d="M42 8L32 33" stroke="#F0A422" stroke-width="3"/>
    <path d="M32 33l-5 20" stroke="#F0A422" stroke-width="3.6" opacity=".75"/>`,
  lampSee: `<circle cx="18" cy="16" r="8" fill="#FFD98A" stroke="#E8961E" stroke-width="2"/>
    <path d="M18 16l24 14" stroke="#F0A422" stroke-width="2.2"/>
    <path d="M42 30l10 14" stroke="#F0A422" stroke-width="2.2"/>
    <rect x="34" y="24" width="15" height="12" rx="3" fill="#7FB8F2" stroke="#3E6EA4" stroke-width="1.8"/>
    <path d="M44 50q6-4 12-1" stroke="#4E5968" stroke-width="2" fill="none"/>
    <circle cx="56" cy="47" r="4.6" fill="#fff" stroke="#4E5968" stroke-width="2"/>`,
  mirrorGhost: `<path d="M32 8v48" stroke="#5E6B7E" stroke-width="3"/>
    <path d="M12 44V22l8 8" stroke="#F0A422" stroke-width="2.6" fill="none"/>
    <path d="M52 44V22l-8 8" stroke="#37B6D8" stroke-width="2.4" stroke-dasharray="4 4" fill="none"/>
    <path d="M20 52h-14M58 52h-14" stroke="#8B95A1" stroke-width="2"/>`,
  distEqual: `<path d="M32 6v52" stroke="#5E6B7E" stroke-width="2.8"/>
    <path d="M8 32h20M36 32h20" stroke="#37B6D8" stroke-width="2.2"/>
    <path d="M12 28l-4 4 4 4M28 28l4 4-4 4M40 28l-4 4 4 4M52 28l4 4-4 4" stroke="#37B6D8" stroke-width="2" fill="none"/>
    <text x="16" y="22" font-size="11" font-weight="800" fill="#4E5968">d</text>
    <text x="42" y="22" font-size="11" font-weight="800" fill="#4E5968">d</text>`,
  cvxMirror: `<path d="M40 8Q16 32 40 56" stroke="#5E6B7E" stroke-width="3" fill="none"/>
    <path d="M46 16l8-6M46 48l8 6M48 32h8" stroke="#B0B8C1" stroke-width="1.8"/>
    <path d="M14 40V24" stroke="#F0A422" stroke-width="2.8"/>
    <path d="M10 24l4-5 4 5z" fill="#F0A422"/>
    <path d="M30 36v-7" stroke="#37B6D8" stroke-width="2.2"/>
    <path d="M27.5 29l2.5-3.4 2.5 3.4z" fill="#37B6D8"/>`,
  ccvMirror: `<path d="M24 8Q48 32 24 56" stroke="#5E6B7E" stroke-width="3" fill="none"/>
    <path d="M18 16l-8-6M18 48l-8 6M16 32H8" stroke="#B0B8C1" stroke-width="1.8"/>
    <path d="M46 40V22" stroke="#F0A422" stroke-width="2.8"/>
    <path d="M42 22l4-5 4 5z" fill="#F0A422"/>
    <path d="M56 34v14" stroke="#37B6D8" stroke-width="2.2"/>
    <path d="M53.5 48l2.5 3.4 2.5-3.4z" fill="#37B6D8"/>`,
  cvxLens: `<path d="M32 6Q42 32 32 58Q22 32 32 6z" fill="#EAF3FE" stroke="#7FA6CC" stroke-width="2.2"/>
    <path d="M4 32h10M50 32h10" stroke="#B0B8C1" stroke-width="1.8"/>
    <path d="M12 40V24" stroke="#F0A422" stroke-width="2.8"/>
    <path d="M8 24l4-5 4 5z" fill="#F0A422"/>
    <path d="M52 26v20" stroke="#37B6D8" stroke-width="2.2"/>
    <path d="M49.5 46l2.5 3.4 2.5-3.4z" fill="#37B6D8" transform="rotate(180 52 47.7)"/>`,
  ccvLens: `<path d="M24 8h16Q34 32 40 56H24Q30 32 24 8z" fill="#EAF3FE" stroke="#7FA6CC" stroke-width="2.2"/>
    <path d="M2 32h10M52 32h10" stroke="#B0B8C1" stroke-width="1.8"/>
    <path d="M10 42V22" stroke="#F0A422" stroke-width="2.8"/>
    <path d="M6 22l4-5 4 5z" fill="#F0A422"/>
    <path d="M50 38v-8" stroke="#37B6D8" stroke-width="2.2"/>
    <path d="M47.5 30l2.5-3.4 2.5 3.4z" fill="#37B6D8"/>`,
  objColor: `<circle cx="24" cy="26" r="11" fill="#F25C54"/>
    <path d="M24 37q-2 10 2 18" stroke="#3F9B4F" stroke-width="2.6" fill="none"/>
    <ellipse cx="33" cy="46" rx="7" ry="3.6" fill="#4CAF50" transform="rotate(28 33 46)"/>
    <path d="M44 10l8 8M48 8l6 12" stroke="#F25C54" stroke-width="2.2"/>
    <path d="M8 12l8 6" stroke="#F25C54" stroke-width="2.2"/>`,
  colorTri: `<circle cx="32" cy="22" r="13" fill="#E5322E" opacity=".85"/>
    <circle cx="24" cy="36" r="13" fill="#12A84E" opacity=".8" style="mix-blend-mode:screen"/>
    <circle cx="40" cy="36" r="13" fill="#2454D8" opacity=".8" style="mix-blend-mode:screen"/>`,
  pixelMini: `<rect x="10" y="14" width="44" height="36" rx="6" fill="#10161F"/>
    <rect x="16" y="20" width="8" height="24" rx="2.5" fill="#E5322E"/>
    <rect x="28" y="20" width="8" height="24" rx="2.5" fill="#12A84E"/>
    <rect x="40" y="20" width="8" height="24" rx="2.5" fill="#3A6CFF" opacity=".3"/>
    <path d="M10 58h44" stroke="#FFD978" stroke-width="3"/>`,
  waveMini: `<path d="M6 32q6.5-20 13 0t13 0 13 0 13 0" stroke="#37B6D8" stroke-width="2.8" fill="none"/>
    <circle cx="12.5" cy="18" r="2.6" fill="#F0A422"/>
    <circle cx="19" cy="46" r="2.6" fill="#5AA2F8"/>
    <path d="M12.5 10h26M12.5 6v8M38.5 6v8" stroke="#8A6BFF" stroke-width="1.8"/>`,
  mediumBall: `<path d="M6 36q6.5-14 13 0t13 0 13 0 13 0" stroke="#5AA2F8" stroke-width="2.6" fill="none"/>
    <circle cx="32" cy="24" r="6" fill="#fff" stroke="#5E6B7E" stroke-width="2"/>
    <path d="M32 10v6M32 40v6" stroke="#F0A422" stroke-width="2.2"/>
    <path d="M29 13l3-4 3 4M29 43l3 4 3-4" stroke="#F0A422" stroke-width="2" fill="none"/>`,
  ampMini: `<path d="M6 32q7-26 14 0t14 0" stroke="#37B6D8" stroke-width="2.8" fill="none"/>
    <path d="M34 32q7-9 14 0t8 0" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
    <path d="M13 6v12M10 32h6" stroke="#F0A422" stroke-width="2"/>`,
  freqMini: `<path d="M6 32q4-16 8 0t8 0 8 0" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
    <path d="M36 32q2-16 4 0t4 0 4 0 4 0 4 0 4 0" stroke="#8A6BFF" stroke-width="2.6" fill="none"/>`,
  toneMini: `<path d="M6 24q6-14 12 0t12 0" stroke="#37B6D8" stroke-width="2.4" fill="none"/>
    <path d="M6 46l6-10 6 10 6-10 6 10" stroke="#F0A422" stroke-width="2.4" fill="none"/>
    <path d="M42 14v36" stroke="#E2E6EC" stroke-width="1.6"/>
    <circle cx="52" cy="24" r="5" fill="#8A6BFF"/>
    <path d="M52 29v14" stroke="#8A6BFF" stroke-width="2.2"/>`,
  periodMini: `<circle cx="32" cy="32" r="20" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M32 32V18M32 32l9 7" stroke="#4E5968" stroke-width="2.4"/>
    <path d="M50 14a24 24 0 0 1 6 10" stroke="#F0A422" stroke-width="2.2" fill="none"/>`,
};

export function lightMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
