// 중2 I 단원(물질의 특성) 퀴즈·개념 그림 — 손코딩 교육용 SVG. 라이트(흰 카드) 기준.
// 곡선 데이터는 CRC Handbook 자연값(실측 용해도)을 따른다. 문항 세팅 수치는 자체 제작.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

// 용해도(g/물 100 g) — CRC Handbook 실측값 근사. 10 ℃ 값: 질산 칼륨 20.9, 염화 나트륨 35.8
const SOL: Record<string, [number, number][]> = {
  kno3: [[0, 13.3], [20, 31.6], [40, 63.9], [60, 110], [80, 169]],
  nano3: [[0, 73], [20, 88], [40, 105], [60, 124], [80, 148]],
  nacl: [[0, 35.7], [20, 36], [40, 36.6], [60, 37.3], [80, 38.4]],
};

function curvePath(pts: [number, number][], gx: (t: number) => number, gy: (s: number) => number): string {
  // 단조 곡선 근사 — 구간 카트멀롬 대신 부드러운 quadratic 연결
  let d = `M${gx(pts[0][0]).toFixed(1)} ${gy(pts[0][1]).toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = gx((x0 + x1) / 2);
    d += ` Q${gx(x0 + (x1 - x0) * 0.6).toFixed(1)} ${gy(y0 + (y1 - y0) * 0.4).toFixed(1)} ${mx.toFixed(1)} ${gy((y0 + y1) / 2).toFixed(1)}`;
    d += ` T${gx(x1).toFixed(1)} ${gy(y1).toFixed(1)}`;
  }
  return d;
}

/** 마무리 1·2번 — 고체 (가)~(마)의 질량·부피 산점(밀도 비교) */
export function massVolScatterFig(): string {
  const gx = (v: number): number => 56 + (v / 45) * 262;
  const gy = (m: number): number => 168 - (m / 90) * 142;
  const pts: [string, number, number][] = [["(가)", 10, 80], ["(나)", 20, 80], ["(다)", 30, 60], ["(라)", 30, 30], ["(마)", 40, 20]];
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="부피와 질량 산점도. 가 10밀리리터 80그램, 나 20밀리리터 80그램, 다 30밀리리터 60그램, 라 30밀리리터 30그램, 마 40밀리리터 20그램">
    <line x1="56" y1="14" x2="56" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="56" y1="168" x2="326" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[20, 40, 60, 80].map((m) => `<line x1="56" y1="${gy(m)}" x2="320" y2="${gy(m)}" stroke="#EDF0F4"/><text x="48" y="${gy(m) + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">${m}</text>`).join("")}
    ${[10, 20, 30, 40].map((v) => `<text x="${gx(v)}" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">${v}</text>`).join("")}
    ${pts.map(([t, v, m]) => `<circle cx="${gx(v)}" cy="${gy(m)}" r="5" fill="#E64980"/><text x="${gx(v) + 2}" y="${gy(m) - 11}" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${t}</text>`).join("")}
    <text x="16" y="12" font-size="11" fill="#4E5968">질량(g)</text>
    <text x="326" y="198" text-anchor="end" font-size="11" fill="#4E5968">부피(mL)</text>
  </svg>`;
}

/** 용해도 곡선 3종(질산 나트륨·질산 칼륨·염화 나트륨) — L3 퀴즈(문항 세팅 수치는 자체 제작) */
export function solCurves3Fig(): string {
  const gx = (t: number): number => 54 + (t / 85) * 268;
  const gy = (s: number): number => 170 - (s / 170) * 150;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="온도에 따른 용해도 곡선. 질산 나트륨과 질산 칼륨은 가파르게 오르고 염화 나트륨은 거의 평평해요">
    <line x1="54" y1="12" x2="54" y2="170" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="54" y1="170" x2="326" y2="170" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[40, 80, 120, 160].map((s) => `<line x1="54" y1="${gy(s)}" x2="320" y2="${gy(s)}" stroke="#EDF0F4"/><text x="46" y="${gy(s) + 4}" text-anchor="end" font-size="10" fill="#8B95A1">${s}</text>`).join("")}
    ${[20, 40, 60, 80].map((t) => `<text x="${gx(t)}" y="186" text-anchor="middle" font-size="10" fill="#8B95A1">${t}</text>`).join("")}
    <path d="${curvePath(SOL.nano3, gx, gy)}" stroke="#F0A422" stroke-width="3"/>
    <path d="${curvePath(SOL.kno3, gx, gy)}" stroke="#E64980" stroke-width="3"/>
    <path d="${curvePath(SOL.nacl, gx, gy)}" stroke="#5AA2F8" stroke-width="3"/>
    <text x="${gx(64)}" y="${gy(148)}" font-size="11" font-weight="700" fill="#D18708">질산 나트륨</text>
    <text x="${gx(66)}" y="${gy(96)}" font-size="11" font-weight="700" fill="#D6336C">질산 칼륨</text>
    <text x="${gx(58)}" y="${gy(30)}" font-size="11" font-weight="700" fill="#3A7DDB">염화 나트륨</text>
    <text x="12" y="12" font-size="10.5" fill="#4E5968">용해도(g/물 100 g)</text>
    <text x="326" y="200" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

/** 고체 (가)~(라) 가열 곡선 — 같은 물질 찾기(마무리 5번). (가)·(다)의 평평한 온도가 같다 */
export function heatPlateausFig(): string {
  const gy = (c: number): number => 168 - (c / 90) * 146;
  const seg = (x0: number, tempo: number, plateau: number, cls: string, label: string, lx: number): string => {
    const pY = gy(plateau);
    const d = `M${x0} ${gy(14)} L${x0 + 44 * tempo} ${pY} L${x0 + 44 * tempo + 58} ${pY} L${x0 + 44 * tempo + 58 + 40} ${gy(plateau + 26)}`;
    return `<path d="${d}" stroke="${cls}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <text x="${lx}" y="${pY - 8}" font-size="12" font-weight="700" fill="#4E5968">${label}</text>`;
  };
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="고체 네 개의 가열 곡선. 가와 다는 55도에서, 나는 40도에서, 라는 72도에서 평평해요">
    <line x1="46" y1="12" x2="46" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="46" y1="168" x2="330" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[40, 55, 72].map((c) => `<line x1="46" y1="${gy(c)}" x2="326" y2="${gy(c)}" stroke="#EDF0F4"/><text x="38" y="${gy(c) + 4}" text-anchor="end" font-size="10" fill="#8B95A1">${c}</text>`).join("")}
    ${seg(52, 1.1, 55, "#E64980", "(가)", 96)}
    ${seg(96, 1.5, 40, "#5AA2F8", "(나)", 168)}
    ${seg(120, 1.7, 55, "#F0A422", "(다)", 224)}
    ${seg(168, 1.6, 72, "#12B886", "(라)", 288)}
    <text x="12" y="12" font-size="10.5" fill="#4E5968">온도(℃)</text>
    <text x="330" y="188" text-anchor="end" font-size="11" fill="#4E5968">가열 시간(분)</text>
  </svg>`;
}

/** 탄산음료 4조건(온도×흔들기) — 기포 비교(자체 제작 문항).
 *  네 시험관 모두 입구가 열려 있고(압력 조건 동일), 물 온도(얼음물/따뜻한 물)와 흔들기 여부만 다르다.
 *  흔드는 시험관은 살짝 기울이고 양옆에 진동 호를 그린다.
 *  주의: 기포는 절대 그리지 않는다 — 조건만 보여 줘야 문제가 성립한다(기포 수 = 정답 유출). */
export function sodaTubesFig(): string {
  const tube = (x: number, label: string, warm: boolean, shake: boolean): string => {
    const beakerFill = warm ? "#FFE0D6" : "#DDF0FB";
    const beakerLine = warm ? "#E8836A" : "#7FB8DC";
    const cx = x + 20;
    const topY = 34;
    // 시험관 몸통: 위가 뚫린 U자 벽 + 열린 입구(타원 테)
    const body = `<path d="M${cx - 10} ${topY}v76a10 10 0 0 0 20 0V${topY}" fill="#FFF4E6" stroke="#C9A26A" stroke-width="1.8"/>
      <rect x="${cx - 10}" y="76" width="20" height="52" rx="9" fill="#E8B54A" opacity=".8"/>
      <ellipse cx="${cx}" cy="${topY}" rx="10" ry="3.4" fill="#FFFBF2" stroke="#C9A26A" stroke-width="1.6"/>
      <ellipse cx="${cx}" cy="${topY}" rx="6" ry="1.9" fill="#EAD9BC"/>`;
    return `<g>
      <path d="M${x - 6} 66h52v66a10 10 0 0 1-10 10h-32a10 10 0 0 1-10-10z" fill="${beakerFill}" stroke="${beakerLine}" stroke-width="2"/>
      ${
        shake
          ? `<g transform="rotate(7 ${cx} 100)">${body}</g>
             <path d="M${cx - 17} 37q-6 6 0 13M${cx - 23} 31q-9 9 0 21" stroke="#8B99A8" stroke-width="1.8" fill="none" opacity=".9"/>
             <path d="M${cx + 17} 37q6 6 0 13M${cx + 23} 31q9 9 0 21" stroke="#8B99A8" stroke-width="1.8" fill="none" opacity=".9"/>`
          : body
      }
      <text x="${cx}" y="158" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${label}</text>
      <text x="${cx}" y="173" text-anchor="middle" font-size="9.5" fill="#8B95A1">${warm ? "따뜻한 물" : "얼음물"} · ${shake ? "흔들기" : "가만히"}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 182" ${NS} fill="none" role="img" aria-label="탄산음료 시험관 네 개의 조건. 네 시험관 모두 입구가 열려 있어요. 가는 얼음물에 가만히, 나는 얼음물에서 흔들기, 다는 따뜻한 물에 가만히, 라는 따뜻한 물에서 흔들기">
    ${tube(18, "(가)", false, false)}
    ${tube(101, "(나)", false, true)}
    ${tube(184, "(다)", true, false)}
    ${tube(267, "(라)", true, true)}
  </svg>`;
}

/** 물 vs 소금물 가열 곡선(그림 I-11) — 순물질은 일정, 혼합물은 계속 상승 */
export function waterSaltBoilFig(): string {
  const gy = (c: number): number => 160 - ((c - 20) / 100) * 132;
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="물과 소금물의 가열 곡선. 물은 100도에서 평평하고 소금물은 100도를 넘어 계속 오릅니다">
    <line x1="52" y1="12" x2="52" y2="160" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="160" x2="326" y2="160" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="${gy(100)}" x2="320" y2="${gy(100)}" stroke="#EDF0F4"/>
    <text x="44" y="${gy(100) + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">100</text>
    <path d="M58 ${gy(24)} C120 ${gy(78)} 150 ${gy(97)} 172 ${gy(100)} L320 ${gy(100)}" stroke="#5AA2F8" stroke-width="3" fill="none"/>
    <path d="M58 ${gy(24)} C122 ${gy(80)} 156 ${gy(99)} 180 ${gy(103)} C230 ${gy(109)} 280 ${gy(113)} 320 ${gy(116)}" stroke="#E64980" stroke-width="3" fill="none" stroke-dasharray="7 5"/>
    <text x="250" y="${gy(100) + 18}" font-size="11.5" font-weight="700" fill="#3A7DDB">물</text>
    <text x="238" y="${gy(117) - 8}" font-size="11.5" font-weight="700" fill="#D6336C">소금물</text>
    <text x="14" y="12" font-size="10.5" fill="#4E5968">온도(℃)</text>
    <text x="326" y="182" text-anchor="end" font-size="11" fill="#4E5968">가열 시간(분)</text>
  </svg>`;
}

/** 분별 깔때기 구조 — 마개·꼭지·두 층 */
export function funnelPartsFig(): string {
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="분별 깔때기. 위에 마개, 몸통에 위층 기름과 아래층 물, 아래에 꼭지와 비커">
    <path d="M142 26h60" stroke="#9DAABD" stroke-width="2"/>
    <rect x="158" y="16" width="28" height="14" rx="4" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.6"/>
    <path d="M136 34h72l-26 84v22h-20v-22z" fill="rgba(224,238,250,.4)" stroke="#9DAABD" stroke-width="2.2"/>
    <path d="M140 40h64l-14 44h-36z" fill="#FFE9A8" opacity=".85"/>
    <path d="M154 84h36l-8 30v16h-20v-16z" fill="#BFE0F8" opacity=".9"/>
    <path d="M154 84h36" stroke="#E8B54A" stroke-width="2"/>
    <rect x="164" y="142" width="16" height="12" rx="3" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.6"/>
    <path d="M172 154v18" stroke="#9DAABD" stroke-width="3"/>
    <path d="M146 176h52v26a8 8 0 0 1-8 8h-36a8 8 0 0 1-8-8z" fill="rgba(224,238,250,.4)" stroke="#9DAABD" stroke-width="1.8"/>
    <text x="216" y="26" font-size="11.5" font-weight="700" fill="#4E5968">마개</text>
    <text x="222" y="66" font-size="11.5" fill="#B07E22">위층(기름)</text>
    <text x="222" y="104" font-size="11.5" fill="#3A7DDB">아래층(물)</text>
    <text x="196" y="152" font-size="11.5" font-weight="700" fill="#4E5968">꼭지</text>
    <text x="120" y="200" text-anchor="end" font-size="11" fill="#8B95A1">비커 (가)</text>
    <path d="M212 22h-8M218 62h-14M218 100h-24M192 148h-8" stroke="#C4CAD2" stroke-width="1.4"/>
  </svg>`;
}

/** 물+에탄올 가열 곡선 — ①~④ 구간(L9 퀴즈, 구간 구성 수치는 자체 제작) */
export function mixDistillCurveFig(): string {
  const gy = (c: number): number => 156 - (c / 120) * 132;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="물과 에탄올 혼합물의 가열 곡선. 1구간 상승, 2구간 78도 부근 평평, 3구간 다시 상승, 4구간 100도 평평">
    <line x1="50" y1="12" x2="50" y2="156" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="50" y1="156" x2="328" y2="156" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[78, 100].map((c) => `<line x1="50" y1="${gy(c)}" x2="322" y2="${gy(c)}" stroke="#EDF0F4"/><text x="42" y="${gy(c) + 4}" text-anchor="end" font-size="10" fill="#8B95A1">${c}</text>`).join("")}
    <path d="M56 ${gy(22)} L118 ${gy(76)} C126 ${gy(78)} 134 ${gy(78)} 142 ${gy(79)} L186 ${gy(80)} L238 ${gy(98)} C246 ${gy(100)} 254 ${gy(100)} 262 ${gy(100)} L322 ${gy(100)}" stroke="#E64980" stroke-width="3" fill="none"/>
    ${[["①", 84, 40], ["②", 158, 96], ["③", 212, 68], ["④", 288, 118]].map(([t, x, c]) => `<text x="${x}" y="${gy(Number(c)) - 10}" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${t}</text>`).join("")}
    ${[130, 186, 250].map((x) => `<line x1="${x}" y1="18" x2="${x}" y2="156" stroke="#C4CAD2" stroke-width="1" stroke-dasharray="3 5"/>`).join("")}
    <text x="14" y="12" font-size="10.5" fill="#4E5968">온도(℃)</text>
    <text x="328" y="196" text-anchor="end" font-size="11" fill="#4E5968">가열 시간(분)</text>
  </svg>`;
}

/** 질산 칼륨 vs 염화 나트륨 — 냉각 석출(L8 퀴즈, 자체 세팅: 물 100 g에 40 g·15 g을 녹여 10 ℃로 냉각).
 *  판정 검산(CRC): 10 ℃ 용해도 질산 칼륨 20.9(40 g 중 약 19 g 석출) vs 염화 나트륨 35.8(15 g 그대로 용해). */
export function kno3CoolFig(): string {
  const gx = (t: number): number => 54 + (t / 65) * 268;
  const gy = (s: number): number => 166 - (s / 120) * 146;
  const kno3 = SOL.kno3.filter(([t]) => t <= 60);
  const nacl = SOL.nacl.filter(([t]) => t <= 60);
  return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="질산 칼륨과 염화 나트륨의 용해도 곡선. 물 100그램에 질산 칼륨 40그램과 염화 나트륨 15그램을 녹인 뜨거운 용액을 10도로 식히는 상황">
    <line x1="54" y1="12" x2="54" y2="166" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="54" y1="166" x2="326" y2="166" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[40, 80, 120].map((s) => `<line x1="54" y1="${gy(s)}" x2="320" y2="${gy(s)}" stroke="#EDF0F4"/><text x="46" y="${gy(s) + 4}" text-anchor="end" font-size="10" fill="#8B95A1">${s}</text>`).join("")}
    ${[10, 20, 40, 60].map((t) => `<text x="${gx(t)}" y="182" text-anchor="middle" font-size="10" fill="#8B95A1">${t}</text>`).join("")}
    <line x1="54" y1="${gy(40)}" x2="320" y2="${gy(40)}" stroke="#D6336C" stroke-width="1.6" stroke-dasharray="6 5" opacity=".75"/>
    <line x1="54" y1="${gy(15)}" x2="320" y2="${gy(15)}" stroke="#3A7DDB" stroke-width="1.6" stroke-dasharray="6 5" opacity=".75"/>
    <line x1="${gx(10)}" y1="16" x2="${gx(10)}" y2="166" stroke="#C4CAD2" stroke-width="1.2" stroke-dasharray="3 5"/>
    <path d="${curvePath(nacl, gx, gy)}" stroke="#5AA2F8" stroke-width="3"/>
    <path d="${curvePath(kno3, gx, gy)}" stroke="#E64980" stroke-width="3"/>
    <text x="${gx(33)}" y="${gy(89)}" font-size="11" font-weight="700" fill="#D6336C">질산 칼륨</text>
    <text x="${gx(26)}" y="${gy(27)}" font-size="11" font-weight="700" fill="#3A7DDB">염화 나트륨</text>
    <text x="322" y="${gy(40) - 6}" text-anchor="end" font-size="10.5" font-weight="700" fill="#D6336C">질산 칼륨 40 g</text>
    <text x="322" y="${gy(15) - 6}" text-anchor="end" font-size="10.5" font-weight="700" fill="#3A7DDB">염화 나트륨 15 g</text>
    <text x="12" y="12" font-size="10.5" fill="#4E5968">용해도(g/물 100 g)</text>
    <text x="326" y="198" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

/** 액체 3층 + 물체 — 뜨고 가라앉기(L2 퀴즈) */
export function floatLayersFig(): string {
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="컵 속 세 액체 층. 위부터 에탄올, 식용유, 물. 얼음은 식용유와 물 사이, 동전은 바닥에 있어요">
    <path d="M118 26h108v130a16 16 0 0 1-16 16h-76a16 16 0 0 1-16-16z" fill="rgba(224,238,250,.28)" stroke="#9DAABD" stroke-width="2.2"/>
    <rect x="122" y="34" width="100" height="40" fill="#FBF7E4"/>
    <rect x="122" y="74" width="100" height="42" fill="#FFE9A8"/>
    <rect x="122" y="116" width="100" height="52" fill="#BFE0F8"/>
    <path d="M122 74h100M122 116h100" stroke="#E8D9A0" stroke-width="1.6"/>
    <g transform="translate(158 106)">
      <rect x="0" y="0" width="26" height="20" rx="5" fill="#EAF6FF" stroke="#9CC6E4" stroke-width="1.8"/>
      <path d="M5 5l6 4M14 4l7 5" stroke="#FFFFFF" stroke-width="1.6"/>
    </g>
    <circle cx="172" cy="158" r="10" fill="#E8C06A" stroke="#B08D3E" stroke-width="1.8"/>
    <text x="240" y="56" font-size="11.5" fill="#8B7A2E">에탄올 (0.79)</text>
    <text x="240" y="96" font-size="11.5" fill="#B07E22">식용유 (0.91)</text>
    <text x="240" y="140" font-size="11.5" fill="#3A7DDB">물 (1.00)</text>
    <text x="112" y="112" text-anchor="end" font-size="11.5" font-weight="700" fill="#4E5968">얼음</text>
    <text x="112" y="162" text-anchor="end" font-size="11.5" font-weight="700" fill="#4E5968">동전</text>
    <path d="M236 52h-16M236 92h-18M236 136h-16M116 110h34M116 158h44" stroke="#C4CAD2" stroke-width="1.3"/>
  </svg>`;
}

/** 원유 증류탑 — hotspot용(끓는점 낮을수록 위층). 각 층 오른쪽에 용도 픽토그램(파이프 끝). */
export function crudeTowerFig(): string {
  const deck = (y: number, w: number, c: string): string =>
    `<rect x="${172 - w / 2}" y="${y}" width="${w}" height="30" rx="7" fill="${c}" stroke="#B08D3E" stroke-width="1.2" opacity=".92"/>`;
  // 용도 미니 픽토그램(cx≈286, 파이프 높이에 맞춤) — 교과서 그림 I-14의 용도 아이콘 재해석
  const icoLpg = `<g transform="translate(272 50)">
      <rect x="0" y="6" width="11" height="20" rx="4" fill="#FFB37C" stroke="#D07030" stroke-width="1.3"/>
      <rect x="3" y="2" width="5" height="5" rx="1.6" fill="#D07030"/>
      <path d="M20 22q-4-5 0-10 1.5 3 4 4-1-5 3.4-7 0 6 4 8 2 4-2 7-5 3-9.4-2z" fill="#7FB8F2" stroke="#3A7DDB" stroke-width="1.1"/>
    </g>`;
  const icoCar = `<g transform="translate(266 90)">
      <path d="M4 14 q2-7 9-8 l14 0 q7 1 9 8 l3 1 q2 1 2 3 v3 q0 2 -2 2 h-36 q-2 0 -2 -2 v-3 q0-3 3-4z" fill="#8FC0EC" stroke="#3A6FA8" stroke-width="1.3"/>
      <path d="M13 8 h12 l3 6 h-18z" fill="#EAF6FF" stroke="#3A6FA8" stroke-width="1"/>
      <circle cx="12" cy="24" r="4" fill="#4E5968"/><circle cx="30" cy="24" r="4" fill="#4E5968"/>
    </g>`;
  const icoPlane = `<g transform="translate(264 128)">
      <path d="M2 16 q16-5 30-4 l10 3 q3 1 0 3 l-10 2 q-14 1 -30 -4z" fill="#D6E6F5" stroke="#5E7E9E" stroke-width="1.2"/>
      <path d="M18 13 l-6-8 5 0 8 8z M18 19 l-6 8 5 0 8-8z" fill="#8FB3D6" stroke="#5E7E9E" stroke-width="1"/>
      <path d="M39 12 l4-5 3 1-4 5z" fill="#8FB3D6" stroke="#5E7E9E" stroke-width="1"/>
    </g>`;
  const icoTruck = `<g transform="translate(266 166)">
      <rect x="0" y="6" width="24" height="14" rx="2.4" fill="#FFD98A" stroke="#C08A2E" stroke-width="1.3"/>
      <path d="M24 10 h8 l6 6 v4 h-14z" fill="#8FC0EC" stroke="#3A6FA8" stroke-width="1.2"/>
      <circle cx="9" cy="22" r="3.8" fill="#4E5968"/><circle cx="30" cy="22" r="3.8" fill="#4E5968"/>
    </g>`;
  const icoShip = `<g transform="translate(264 204)">
      <path d="M2 14 h40 l-6 9 h-28z" fill="#5E7E9E" stroke="#3C5670" stroke-width="1.2"/>
      <rect x="8" y="7" width="9" height="7" rx="1" fill="#F2A45C"/><rect x="18" y="7" width="9" height="7" rx="1" fill="#8FC0EC"/><rect x="28" y="4" width="6" height="10" rx="1" fill="#EAF0F6" stroke="#8B99A8" stroke-width="1"/>
      <path d="M2 26 q6 3 12 0 t12 0 12 0" stroke="#7FB8F2" stroke-width="1.6"/>
    </g>`;
  const icoRoad = `<g transform="translate(268 232)">
      <path d="M0 10 h38 v8 h-38z" fill="#4E5968"/>
      <path d="M4 14 h6 M16 14 h6 M28 14 h6" stroke="#FFD98A" stroke-width="1.8"/>
    </g>`;
  return `<svg viewBox="0 0 344 260" ${NS} fill="none" role="img" aria-label="원유 증류탑. 아래에서 가열하며 위로 갈수록 끓는점이 낮은 물질이 분리되고, 층마다 쓰임새가 달라요">
    <ellipse cx="172" cy="248" rx="96" ry="7" fill="#2A3A5E" opacity=".10"/>
    <path d="M126 42h92v186a12 12 0 0 1-12 12h-68a12 12 0 0 1-12-12z" fill="#F4E9D2" stroke="#C9A26A" stroke-width="2.2"/>
    <path d="M126 42a46 18 0 0 1 92 0" fill="#F4E9D2" stroke="#C9A26A" stroke-width="2.2"/>
    ${deck(52, 74, "#FFF3D9")}
    ${deck(90, 78, "#FFE9BC")}
    ${deck(128, 82, "#FFDF9E")}
    ${deck(166, 86, "#FCD284")}
    ${deck(204, 90, "#F5C468")}
    <path d="M218 62h44M218 100h44M218 138h44M218 176h44M218 214h44" stroke="#C9A26A" stroke-width="3"/>
    ${icoLpg}${icoCar}${icoPlane}${icoTruck}${icoShip}
    <path d="M172 240v-2" stroke="#C9A26A" stroke-width="3"/>
    ${icoRoad}
    <path d="M84 226h42" stroke="#C9A26A" stroke-width="4"/>
    <g>
      <path d="M96 240q-9-11 0-22 2 7 9 9-2-11 7-15 0 13 9 17 5 9-4 15-12 7-21-4z" fill="#FF9A4A" stroke="#D95F14" stroke-width="1.4"/>
    </g>
    <text x="70" y="218" text-anchor="end" font-size="11" font-weight="700" fill="#4E5968">원유 가열</text>
  </svg>`;
}

// ── recap 미니 아트(64×64) ──────────────────────────────────
const MINI: Record<string, string> = {
  fingerMini: `<circle cx="32" cy="30" r="17" fill="none" stroke="#E64980" stroke-width="2.6"/>
    <circle cx="32" cy="30" r="11" fill="none" stroke="#E64980" stroke-width="2.2"/>
    <circle cx="32" cy="30" r="5" fill="none" stroke="#E64980" stroke-width="2"/>
    <path d="M14 52h36" stroke="#C4CAD2" stroke-width="2.4"/>`,
  densityMini: `<path d="M12 22h18v18a9 9 0 0 1-18 0z" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.2"/>
    <rect x="17" y="28" width="8" height="8" rx="2" fill="#7C8698" stroke="#4E5968" stroke-width="1.6"/>
    <path d="M40 24h14M40 34h14M47 24v-8M40 44h14" stroke="#8B95A1" stroke-width="2.2"/>
    <text x="47" y="58" text-anchor="middle" font-size="13" font-weight="800" fill="#E64980">÷</text>`,
  floatMini: `<rect x="14" y="14" width="36" height="40" rx="8" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M16 28h32M16 40h32" stroke="#C4CAD2" stroke-width="1.8"/>
    <circle cx="26" cy="21" r="4" fill="#FFD98A"/>
    <rect x="34" y="30" width="9" height="7" rx="2" fill="#BFE0F8" stroke="#7FB8DC" stroke-width="1.4"/>
    <circle cx="30" cy="49" r="4" fill="#B08D3E"/>`,
  solubMini: `<path d="M18 12h28l-4 14v22a10 10 0 0 1-20 0V26z" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.2"/>
    <circle cx="28" cy="38" r="2.4" fill="#E64980"/><circle cx="36" cy="32" r="2.4" fill="#E64980"/><circle cx="33" cy="44" r="2.4" fill="#E64980"/>
    <path d="M26 52h12" stroke="#D6336C" stroke-width="3"/>`,
  gasSolMini: `<rect x="22" y="10" width="20" height="44" rx="9" fill="#FFF4E6" stroke="#C9A26A" stroke-width="2.2"/>
    <circle cx="30" cy="44" r="2.6" fill="none" stroke="#5AA2F8" stroke-width="1.6"/>
    <circle cx="35" cy="34" r="3.2" fill="none" stroke="#5AA2F8" stroke-width="1.6"/>
    <circle cx="31" cy="22" r="4" fill="none" stroke="#5AA2F8" stroke-width="1.6"/>
    <path d="M50 20q4 4 0 8M54 16q6 6 0 14" stroke="#F25C54" stroke-width="2.2" fill="none"/>`,
  meltMini: `<path d="M12 10v42h42" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M16 46 L28 28 L44 28 L52 14" stroke="#E64980" stroke-width="3" fill="none"/>
    <path d="M28 28h16" stroke="#F0A422" stroke-width="4"/>`,
  pressBoilMini: `<path d="M14 26h24v20a12 12 0 0 1-24 0z" fill="#EAF2FD" stroke="#8B95A1" stroke-width="2.2"/>
    <rect x="12" y="20" width="28" height="7" rx="3" fill="#8B99AC"/>
    <path d="M22 12q2-4 4 0M30 12q2-4 4 0" stroke="#C4CAD2" stroke-width="2"/>
    <path d="M48 34h8M52 30l4 4-4 4" stroke="#F25C54" stroke-width="2.4" fill="none"/>`,
  pureMixMini: `<circle cx="20" cy="24" r="4" fill="#5AA2F8"/><circle cx="30" cy="18" r="4" fill="#5AA2F8"/><circle cx="25" cy="34" r="4" fill="#5AA2F8"/>
    <path d="M38 12v44" stroke="#C4CAD2" stroke-width="2"/>
    <circle cx="48" cy="22" r="4" fill="#E64980"/><circle cx="56" cy="32" r="3.4" fill="#F0A422"/><circle cx="47" cy="40" r="3.4" fill="#12B886"/>`,
  funnelMini: `<path d="M22 12h20l-7 24v10h-6V36z" fill="#EAF2FD" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M24 20h16" stroke="#E8B54A" stroke-width="3"/>
    <rect x="28" y="46" width="8" height="6" rx="2" fill="#8B99AC"/>
    <path d="M32 52v6" stroke="#5AA2F8" stroke-width="2.6"/>`,
  crystalMini: `<path d="M24 40l8-14 8 14-8 10z" fill="#FFF6DE" stroke="#E8B54A" stroke-width="2"/>
    <path d="M14 48l5-8 5 8-5 6zM40 48l5-8 5 8-5 6z" fill="#FFF6DE" stroke="#E8B54A" stroke-width="1.8"/>
    <path d="M46 14l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#5AA2F8"/>`,
  distillMini: `<path d="M18 14h12v10l-8 14a10 10 0 0 0 9 15h1" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M30 22q14-2 18 10" stroke="#8B95A1" stroke-width="2.4" fill="none"/>
    <path d="M48 34v12" stroke="#5AA2F8" stroke-width="2.6"/>
    <circle cx="48" cy="52" r="3" fill="#5AA2F8"/>
    <path d="M20 52q4-6 0-10" stroke="#F25C54" stroke-width="2.2" fill="none"/>`,
  towerMini: `<rect x="22" y="12" width="20" height="42" rx="6" fill="#FFF3D9" stroke="#C9A26A" stroke-width="2.2"/>
    <path d="M24 24h16M24 34h16M24 44h16" stroke="#C9A26A" stroke-width="1.8"/>
    <path d="M42 20h10M42 32h10M42 44h10" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M28 60q-3-4 0-7 3 3 6 0 2 4-1 7-3 2-5 0z" fill="#FF9A4A"/>`,
};

export function chemMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
