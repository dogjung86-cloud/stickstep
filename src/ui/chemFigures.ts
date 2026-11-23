// 중2 I 단원(물질의 특성) 퀴즈·개념 그림, 손코딩 교육용 SVG. 라이트(흰 카드) 기준.
// 곡선 데이터는 CRC Handbook 자연값(실측 용해도)을 따른다. 문항 세팅 수치는 자체 제작.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

// 용해도(g/물 100 g), CRC Handbook 실측값 근사. 10 ℃ 값: 질산 칼륨 20.9, 염화 나트륨 35.8
const SOL: Record<string, [number, number][]> = {
  kno3: [[0, 13.3], [20, 31.6], [40, 63.9], [60, 110], [80, 169]],
  nano3: [[0, 73], [20, 88], [40, 105], [60, 124], [80, 148]],
  nacl: [[0, 35.7], [20, 36], [40, 36.6], [60, 37.3], [80, 38.4]],
};

function curvePath(pts: [number, number][], gx: (t: number) => number, gy: (s: number) => number): string {
  // 단조 곡선 근사, 구간 카트멀롬 대신 부드러운 quadratic 연결
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

/** 고체 (가)~(마)의 질량·부피 산점(밀도 비교) */
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

/** 용해도 곡선 3종(질산 나트륨·질산 칼륨·염화 나트륨), L3 퀴즈(문항 세팅 수치는 자체 제작) */
export function solCurves3Fig(): string {
  const gx = (t: number): number => 54 + (t / 85) * 268;
  const gy = (s: number): number => 170 - (s / 170) * 150;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="세 물질의 온도에 따른 용해도 곡선. 곡선마다 물질 이름이 붙어 있어요">
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

/** 고체 (가)~(라) 가열 곡선, 같은 물질 찾기. (가)·(다)의 평평한 온도가 같다 */
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

/** 탄산음료 4조건(온도×흔들기), 기포 비교(자체 제작 문항).
 *  네 시험관 모두 입구가 열려 있고(압력 조건 동일), 물 온도(얼음물/따뜻한 물)와 흔들기 여부만 다르다.
 *  흔드는 시험관은 살짝 기울이고 양옆에 진동 호를 그린다.
 *  주의: 기포는 절대 그리지 않는다, 조건만 보여 줘야 문제가 성립한다(기포 수 = 정답 유출). */
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

/** 물 vs 소금물 가열 곡선, 순물질은 일정, 혼합물은 계속 상승 */
export function waterSaltBoilFig(): string {
  const gy = (c: number): number => 160 - ((c - 20) / 100) * 132;
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="물과 소금물의 가열 곡선. 곡선마다 이름이 붙어 있고 100도 눈금선이 그려져 있어요">
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

/** 분별 깔때기 구조, 마개·꼭지·두 층 */
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

/** 물+에탄올 가열 곡선, ①~④ 구간(L9 퀴즈, 구간 구성 수치는 자체 제작) */
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

/** 질산 칼륨 vs 염화 나트륨, 냉각 석출(L8 퀴즈, 자체 세팅: 물 100 g에 40 g·15 g을 녹여 10 ℃로 냉각).
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

/** 액체 3층 + 물체, 뜨고 가라앉기(L2 퀴즈) */
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

/** 원유 증류탑(시험 그림): 왼쪽 아래 원통형 가열로(속에 나선 관), 앞을 잘라 선반이 보이는 탑, 높이마다 뽑아내는 관 끝의 병과 산물 이름.
 *  이 그림을 쓰는 문항이 탑 안 온도의 방향과 끓는점 차례를 묻기 때문에 온도 색, 온도 글자, 끓는점 범위는 넣지 않는다(aria도 같다). */
export function crudeTowerFig(): string {
  const TX = 150, TR = 27; // 탑 가운데, 반지름
  const TL = TX - TR, TRt = TX + TR;
  const DOME = 30, SHELL0 = 40, WIN0 = 42, WIN1 = 236, BASE = 248;
  const trays = Array.from({ length: 9 }, (_, k) => 56 + k * 19); // 56 ~ 208
  const FEED = 222, POOL = 228;
  const BX = 212; // 병 가운데(관은 여기서 아래로 꺾인다)
  const prod: { y: number; name: string; col: string; kind: "gas" | "liq" | "lump" }[] = [
    { y: 16, name: "액화 석유 가스", col: "#D0EBFF", kind: "gas" },
    { y: trays[1] - 3, name: "휘발유", col: "#FFF3BF", kind: "liq" },
    { y: trays[3] - 3, name: "등유", col: "#FFE08A", kind: "liq" },
    { y: trays[5] - 3, name: "경유", col: "#F4B34A", kind: "liq" },
    { y: trays[7] - 3, name: "중유", col: "#8A5226", kind: "liq" },
    { y: 231, name: "찌꺼기", col: "#2B211A", kind: "lump" },
  ];
  const trayCol = ["#FFF6CC", "#FFF0B0", "#FFE48A", "#FFDA70", "#F8C45A", "#F1AE45", "#E2913A", "#C97733", "#AE6230"];
  const pipe = (d: string, c = "#9AA5B2", w = 4): string =>
    `<path d="${d}" stroke="#5E6874" stroke-width="${w + 1.4}" stroke-linejoin="round" stroke-linecap="round" fill="none"/>` +
    `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" fill="none"/>`;
  // 탑 속: 선반(판 + 판 위 액체 + 덮개 둘) + 넘친 액체가 내려가는 칸(양쪽 번갈아)
  const IL = TL + 2.5, IR = TRt - 2.5;
  let inside = "";
  trays.forEach((ty, k) => {
    const left = k % 2 === 0, dw = 8;
    const pl = left ? IL + dw : IL, pr = left ? IR : IR - dw;
    const next = k < trays.length - 1 ? trays[k + 1] : FEED - 4;
    inside += `<rect x="${left ? IL : IR - dw}" y="${ty}" width="${dw}" height="${next - ty - 3}" fill="${trayCol[k]}" opacity=".85"/>`;
    inside += `<rect x="${pl}" y="${ty - 3}" width="${pr - pl}" height="3" fill="${trayCol[k]}"/>`;
    inside += `<rect x="${pl}" y="${ty}" width="${pr - pl}" height="1.8" fill="#8E99A6"/>`;
    inside += `<path d="M${left ? IL + dw : IR - dw} ${ty - 3}v${next - ty}" stroke="#B9C2CC" stroke-width="1.1"/>`;
    for (const c of [0.3, 0.72]) {
      const cx = pl + (pr - pl) * c;
      inside += `<path d="M${(cx - 3.4).toFixed(1)} ${ty - 1.6}v-2.6a3.4 3.4 0 0 1 6.8 0v2.6z" fill="#C9D1DA" stroke="#7D8794" stroke-width=".8"/>`;
    }
  });
  // 원통형 가열로(앞을 잘라 나선 관과 불꽃을 보인다)
  const FX = 46, FR = 19, FY0 = 168, FY1 = 226;
  const coil = (front: boolean): string => {
    let d = "";
    const n = 120, turns = 3, rx = 10, ry = 2.6, yT = 184, yB = 212;
    const p = (th: number, s: number): string => `${(FX + rx * Math.cos(th)).toFixed(1)} ${(yB - (yB - yT) * s + ry * Math.sin(th)).toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * turns * i) / n + Math.PI, b = (Math.PI * 2 * turns * (i + 1)) / n + Math.PI;
      if ((Math.sin(a) > 0) !== front) continue;
      d += `M${p(a, i / n)}L${p(b, (i + 1) / n)}`;
    }
    return front
      ? `<path d="${d}" stroke="#5A1E10" stroke-width="3.4" stroke-linecap="round"/><path d="${d}" stroke="#FF8A3D" stroke-width="2.2" stroke-linecap="round"/>`
      : `<path d="${d}" stroke="#7A3A22" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>`;
  };
  const flame = (x: number): string =>
    `<path d="M${x - 3} 219q.6-5 3-8.5q2.4 3.5 3 8.5z" fill="#FFB347"/><path d="M${x - 1.6} 219q.4-2.6 1.6-4.4q1.2 1.8 1.6 4.4z" fill="#5AA2F8"/>`;
  const furnace = `
    <ellipse cx="${FX + 2}" cy="${FY1 + 4}" rx="${FR + 6}" ry="3.6" fill="#2A3A5E" opacity=".12"/>
    <path d="M${FX - FR} ${FY0}V${FY1}a${FR} 4 0 0 0 ${FR * 2} 0V${FY0}z" fill="#C9D1DA" stroke="#6E7885" stroke-width="1.3"/>
    <path d="M${FX - FR + 4} ${FY0 + 2}V${FY1 + 2}" stroke="#F4F6F8" stroke-width="2.4" opacity=".8"/>
    <ellipse cx="${FX}" cy="${FY0}" rx="${FR}" ry="4" fill="#E9EDF2" stroke="#6E7885" stroke-width="1.3"/>
    <rect x="${FX - 14}" y="${FY0 + 9}" width="28" height="${FY1 - FY0 - 12}" rx="3" fill="#2A1712" stroke="#E1E6EC" stroke-width="1.4"/>
    ${coil(false)}${flame(FX - 8)}${flame(FX)}${flame(FX + 8)}${coil(true)}`;
  // 관: 원유 → 가열로 바닥, 가열로 위 → 탑 아래쪽, 뽑아내는 관(끝은 병 입구로 꺾인다)
  const feedIn = pipe(`M2 244H${FX - 10}V${FY1 + 3}`);
  const feedOut = pipe(`M${FX + FR - 1} ${FY0 + 6}H98V${FEED}H${TL + 1}`, "#D9734A", 4.4);
  const outs = prod
    .map((p) => {
      const x0 = p.kind === "gas" ? TX : p.kind === "lump" ? IR - 2 : TRt - 1;
      const head = p.kind === "gas" ? `M${TX} ${DOME + 2}V${p.y}` : `M${x0} ${p.y}`;
      return pipe(`${head}H${BX}v5`) + `<path d="M${p.kind === "gas" ? TX + 5 : TRt + 2} ${p.y}H${BX}v4" stroke="${p.col}" stroke-width="1.5" fill="none" stroke-linejoin="round"/>`;
    })
    .join("");
  // 산물 병(가스통, 유리병, 찌꺼기 덩이)
  const vessel = (p: (typeof prod)[number]): string => {
    const top = p.y + 6;
    if (p.kind === "gas")
      return `<rect x="${BX - 3.2}" y="${top}" width="6.4" height="2" fill="#59636E"/>
        <rect x="${BX - 6.5}" y="${top + 3}" width="13" height="19" rx="5" fill="#E8EDF2" stroke="#6E7885" stroke-width="1.1"/>
        <rect x="${BX - 6}" y="${top + 9}" width="12" height="2.6" fill="#3D8FE8"/>
        <path d="M${BX - 3.6} ${top + 6}v12" stroke="#FFFFFF" stroke-width="1.4" opacity=".9"/>`;
    if (p.kind === "lump")
      return `<ellipse cx="${BX + 1}" cy="${top + 12}" rx="10" ry="2" fill="#2A3A5E" opacity=".12"/>
        <path d="M${BX - 10} ${top + 11}q-.6-7 5-9q6-4 11 .4q5 2.6 4 8.6z" fill="#2B211A" stroke="#120D0A" stroke-width="1"/>
        <ellipse cx="${BX - 4}" cy="${top + 4.6}" rx="2.4" ry=".9" fill="#FFFFFF" opacity=".35"/>`;
    const x0 = BX - 7, y0 = top + 3, bh = 16;
    const outline = `M${BX - 2.6} ${top}V${y0}q-4.4 .4-4.4 3.4V${y0 + bh - 2.4}q0 2.4 2.4 2.4h10q2.4 0 2.4-2.4V${y0 + 3.4}q0-3-4.4-3.4V${top}`;
    return `<path d="${outline}z" fill="#EEF3F8"/>
      <rect x="${x0}" y="${y0 + 5}" width="14" height="${bh - 5}" rx="2.2" fill="${p.col}"/>
      <path d="${outline}" fill="none" stroke="#6E7885" stroke-width="1.1"/>
      <path d="M${x0 + 2.4} ${y0 + 4}v${bh - 7}" stroke="#FFFFFF" stroke-width="1.2" opacity=".9"/>`;
  };
  const labels = prod
    .map((p) => `<text x="${BX + 14}" y="${p.y + (p.kind === "gas" ? 16 : 17)}" font-size="12" font-weight="700" fill="#333D4B">${p.name}</text>`)
    .join("");
  return `<svg viewBox="0 0 344 262" ${NS} fill="none" role="img" aria-label="원유를 분리하는 증류탑. 왼쪽 아래 가열로의 나선 관을 지나며 데워진 원유가 탑 아래쪽으로 들어가요. 앞을 잘라 낸 탑 속에 여러 층의 선반이 있고, 탑의 여러 높이에 달린 관에서 액화 석유 가스, 휘발유, 등유, 경유, 중유가, 바닥의 관에서 찌꺼기가 나와 각각 병에 모여요">
    <ellipse cx="${TX + 3}" cy="${BASE + 4}" rx="44" ry="4.5" fill="#2A3A5E" opacity=".12"/>
    <path d="M${TL - 3} ${WIN1}L${TL - 7} ${BASE}H${TRt + 7}L${TRt + 3} ${WIN1}z" fill="#AEB7C2" stroke="#6E7885" stroke-width="1.2"/>
    <path d="M${TL} ${SHELL0}C${TL} ${DOME},${TRt} ${DOME},${TRt} ${SHELL0}z" fill="#E3E8EE" stroke="#6E7885" stroke-width="1.3"/>
    <rect x="${TL}" y="${SHELL0}" width="${TR * 2}" height="${WIN0 - SHELL0 + 2}" fill="#D5DCE4"/>
    <rect x="${TL}" y="${WIN0}" width="${TR * 2}" height="${WIN1 - WIN0}" fill="#E1E6EC" stroke="#6E7885" stroke-width="1.3"/>
    <rect x="${IL}" y="${WIN0 + 1}" width="${IR - IL}" height="${WIN1 - WIN0 - 2}" fill="#F5F7FA"/>
    <rect x="${IL}" y="${POOL}" width="${IR - IL}" height="${WIN1 - POOL - 1}" fill="#3A2C20"/>
    ${inside}
    ${outs}
    ${feedIn}${feedOut}
    <path d="M${TL - 10} ${FEED}h9" stroke="#C2410C" stroke-width="1.6"/><path d="M${TL - 1} ${FEED}l-5-3.2v6.4z" fill="#C2410C"/>
    <path d="M6 244h6" stroke="#4E5968" stroke-width="1.6"/><path d="M14 244l-5-3.2v6.4z" fill="#4E5968"/>
    ${furnace}
    ${prod.map(vessel).join("")}
    ${labels}
    <text x="${FX}" y="160" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">가열로</text>
    <text x="4" y="259" font-size="12" font-weight="700" fill="#4E5968">원유</text>
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
  // 끓는점과 압력(2026-11-15 다시 그림): 뚜껑을 누르는 아래 화살(압력)과 온도계 옆 위 화살(끓는 온도가 올라감)
  pressBoilMini: `<path d="M28 3V14M23 9L28 14.5L33 9" stroke="#3182F6" stroke-width="3.2"/>
    <rect x="25" y="17.5" width="6" height="5" rx="1.5" fill="#5B6578"/>
    <path d="M13 29V46a7 7 0 0 0 7 7H36a7 7 0 0 0 7-7V29" fill="#EAF2FD" stroke="#8B95A1" stroke-width="2.8"/>
    <path d="M15.5 36H40.5V46a5 5 0 0 1-5 5H20.5a5 5 0 0 1-5-5Z" fill="#8CC4F8"/>
    <rect x="9" y="22.5" width="38" height="7" rx="3" fill="#8B99AC"/>
    <rect x="49" y="17" width="7" height="31" rx="3.5" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
    <path d="M52.5 46V24" stroke="#F25C54" stroke-width="3"/>
    <circle cx="52.5" cy="50" r="4.6" fill="#F25C54"/>
    <path d="M52.5 13V3M48.5 7.5L52.5 3L56.5 7.5" stroke="#F0A422" stroke-width="2.8"/>`,
  // 끓는점(2026-11-15 새로): 끓는 냄비 속의 온도계. 끓는 동안 온도계 눈금은 멈춰 있다
  boilPointMini: `<path d="M21 22q3-4 0-7.5t0-7.5M30 22q3-4 0-7.5t0-7.5" stroke="#ADB5BD" stroke-width="2.4" fill="none"/>
    <path d="M14 30V47a7 7 0 0 0 7 7H43a7 7 0 0 0 7-7V30" fill="#EAF2FD" stroke="#8B95A1" stroke-width="2.8"/>
    <path d="M16.5 36H47.5V47a5 5 0 0 1-5 5H21.5a5 5 0 0 1-5-5Z" fill="#8CC4F8"/>
    <circle cx="22.5" cy="45.5" r="2.4" fill="#fff"/><circle cx="29" cy="41" r="2.8" fill="#fff"/><circle cx="30" cy="48.5" r="1.9" fill="#fff"/>
    <path d="M11 30H53M7 34h7M50 34h7" stroke="#8B95A1" stroke-width="3"/>
    <rect x="37.5" y="7" width="7" height="39" rx="3.5" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
    <path d="M41 44V20" stroke="#F25C54" stroke-width="3"/>
    <circle cx="41" cy="47" r="4.6" fill="#F25C54"/>`,
  pureMixMini: `<circle cx="20" cy="24" r="4" fill="#5AA2F8"/><circle cx="30" cy="18" r="4" fill="#5AA2F8"/><circle cx="25" cy="34" r="4" fill="#5AA2F8"/>
    <path d="M38 12v44" stroke="#C4CAD2" stroke-width="2"/>
    <circle cx="48" cy="22" r="4" fill="#E64980"/><circle cx="56" cy="32" r="3.4" fill="#F0A422"/><circle cx="47" cy="40" r="3.4" fill="#12B886"/>`,
  // 분별 깔때기(2026-11-15 다시 그림): 둥근 몸통 속 두 층(위 식용유, 아래 물), 손잡이를 세운 꼭지로 아래층이 나온다
  funnelMini: `<rect x="27" y="2" width="10" height="5" rx="2" fill="#8B99AC"/>
    <path d="M28.5 7V12C16 16 12 26 20 34L30 44H34L44 34C52 26 48 16 35.5 12V7Z" fill="#EAF2FD"/>
    <path d="M21.5 17.5Q32 14.5 42.5 17.5L47.6 26H16.4Z" fill="#FFD98A"/>
    <path d="M16.4 26H47.6C47.2 30 45.6 32.6 43.6 34.6L34 44H30L20.4 34.6C18.4 32.6 16.8 30 16.4 26Z" fill="#8CC4F8"/>
    <path d="M28.5 7V12C16 16 12 26 20 34L30 44H34L44 34C52 26 48 16 35.5 12V7" stroke="#8B95A1" stroke-width="2.6"/>
    <rect x="30.4" y="44" width="3.2" height="11" fill="#EAF2FD" stroke="#8B95A1" stroke-width="1.6"/>
    <circle cx="32" cy="48.5" r="3.6" fill="#8B99AC"/>
    <rect x="30.9" y="43.5" width="2.2" height="10" rx="1.1" fill="#4E5968"/>
    <path d="M32 56.5V60" stroke="#5AA2F8" stroke-width="2.6"/>
    <circle cx="32" cy="62" r="1.9" fill="#5AA2F8"/>`,
  crystalMini: `<path d="M24 40l8-14 8 14-8 10z" fill="#FFF6DE" stroke="#E8B54A" stroke-width="2"/>
    <path d="M14 48l5-8 5 8-5 6zM40 48l5-8 5 8-5 6z" fill="#FFF6DE" stroke="#E8B54A" stroke-width="1.8"/>
    <path d="M46 14l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#5AA2F8"/>`,
  // 증류(2026-11-15 다시 그림): 가지 달린 플라스크의 혼합물을 가열하면 유리관을 지나 얼음물 속 시험관에 모인다(랩 무대와 같은 구성)
  distillMini: `<rect x="11.5" y="6.5" width="9" height="5.5" rx="1.5" fill="#8B99AC"/>
    <path d="M13 12V22L5.5 38.5a3 3 0 0 0 2.7 4.3H23.8a3 3 0 0 0 2.7-4.3L19 22V12" fill="#EAF2FD" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M9 32H23L25.6 38.4a2.2 2.2 0 0 1-2 3H8.4a2.2 2.2 0 0 1-2-3Z" fill="#B9A6FF"/>
    <path d="M19 16H40.5Q43 16 43 19V38" stroke="#8B95A1" stroke-width="2.6" fill="none"/>
    <path d="M16 59c-3.6-2.6-2.8-6.2 0-9.5 2.8 3.3 3.6 6.9 0 9.5z" fill="#F0A422"/>
    <path d="M34.5 34H55.5V54a3 3 0 0 1-3 3H37.5a3 3 0 0 1-3-3Z" fill="#BFE0F8"/>
    <path d="M39.5 25V47a3.5 3.5 0 0 0 7 0V25" fill="#fff" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M41 42.5H45V47a2 2 0 0 1-4 0Z" fill="#B9A6FF"/>
    <path d="M33 28V54a4 4 0 0 0 4 4H53a4 4 0 0 0 4-4V28" stroke="#8B95A1" stroke-width="2.6" fill="none"/>`,
  towerMini: `<rect x="22" y="12" width="20" height="42" rx="6" fill="#FFF3D9" stroke="#C9A26A" stroke-width="2.2"/>
    <path d="M24 24h16M24 34h16M24 44h16" stroke="#C9A26A" stroke-width="1.8"/>
    <path d="M42 20h10M42 32h10M42 44h10" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M28 60q-3-4 0-7 3 3 6 0 2 4-1 7-3 2-5 0z" fill="#FF9A4A"/>`,
  // ── 보조 카드 글리프(recap 전 카드 미니아트 표준, 2026-07-10) ──
  // 생활 속 밀도: 수면 위 구명튜브(↑)와 가라앉는 납 벨트(↓)
  lifeDensityMini: `<path d="M8 32q6-5 12 0t12 0t12 0t12 0" stroke="#5AA2F8" stroke-width="2.2" fill="none"/>
    <circle cx="22" cy="24" r="7" fill="none" stroke="#F0A422" stroke-width="4.5"/>
    <path d="M22 12v-4M19 10l3-3 3 3" stroke="#F0A422" stroke-width="2" fill="none"/>
    <rect x="38" y="42" width="16" height="8" rx="2" fill="#7C8698" stroke="#4E5968" stroke-width="1.6"/>
    <path d="M46 54v4M43 56l3 3 3-3" stroke="#8B95A1" stroke-width="2" fill="none"/>`,
  // 압력이 낮으면 용해도 ↓: 뚜껑 연 탄산음료에서 달아나는 기포
  pressGasMini: `<rect x="27" y="16" width="10" height="8" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2"/>
    <path d="M27 24h10q6 4 6 11v14a10 10 0 0 1-10 5h-2a10 10 0 0 1-10-5V35q0-7 6-11z" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.2"/>
    <rect x="40" y="6" width="13" height="6" rx="2" fill="#8B99AC" transform="rotate(18 46 9)"/>
    <circle cx="31" cy="44" r="2" fill="none" stroke="#5AA2F8" stroke-width="1.4"/>
    <circle cx="34" cy="36" r="2.6" fill="none" stroke="#5AA2F8" stroke-width="1.4"/>
    <circle cx="30" cy="29" r="2.2" fill="none" stroke="#5AA2F8" stroke-width="1.4"/>
    <circle cx="40" cy="12" r="2.2" fill="none" stroke="#5AA2F8" stroke-width="1.4"/>
    <circle cx="46" cy="18" r="1.8" fill="none" stroke="#5AA2F8" stroke-width="1.4"/>`,
  // 혼합물의 성질: 섞여 있어도 각자 성질 유지, 그래서 다시 분리
  mixKeepMini: `<rect x="8" y="20" width="22" height="26" rx="5" fill="none" stroke="#8B95A1" stroke-width="2.2"/>
    <circle cx="14" cy="27" r="3" fill="#5AA2F8"/><circle cx="23" cy="31" r="3" fill="#E64980"/>
    <circle cx="15" cy="39" r="3" fill="#E64980"/><circle cx="24" cy="40" r="3" fill="#5AA2F8"/>
    <path d="M33 33h7M37 30l4 3-4 3" stroke="#8B95A1" stroke-width="2" fill="none"/>
    <rect x="45" y="14" width="14" height="14" rx="4" fill="none" stroke="#5AA2F8" stroke-width="1.8"/>
    <circle cx="50" cy="21" r="2.6" fill="#5AA2F8"/><circle cx="55" cy="21" r="2.6" fill="#5AA2F8"/>
    <rect x="45" y="36" width="14" height="14" rx="4" fill="none" stroke="#E64980" stroke-width="1.8"/>
    <circle cx="50" cy="43" r="2.6" fill="#E64980"/><circle cx="55" cy="43" r="2.6" fill="#E64980"/>`,
  // 석출: 식힌 용액 바닥에 되돌아온 고체 결정
  depositMini: `<path d="M20 12h24l-3 12v20a9 9 0 0 1-18 0V24z" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="2.2"/>
    <circle cx="28" cy="26" r="2.2" fill="#E64980"/><circle cx="36" cy="31" r="2.2" fill="#E64980"/>
    <path d="M27 46l4-6 4 6-4 5z" fill="#FFF6DE" stroke="#E8B54A" stroke-width="1.8"/>
    <path d="M36 49l3-4.5 3 4.5-3 4z" fill="#FFF6DE" stroke="#E8B54A" stroke-width="1.6"/>
    <path d="M54 18v14M50 28l4 5 4-5" stroke="#5AA2F8" stroke-width="2.2" fill="none"/>`,
  // 용해도 곡선(2026-11-15 새로): 축 두 개와 오른쪽 위로 휘어 오르는 곡선, 곡선 위의 점 하나(그 온도의 최대로 녹는 양)
  solCurveMini: `<path d="M13 8V51H56" stroke="#8B95A1" stroke-width="2.8"/>
    <path d="M14 47C30 46 42 36 52 13" stroke="#E64980" stroke-width="3.4"/>
    <circle cx="38.9" cy="34.6" r="4.4" fill="#F0A422" stroke="#fff" stroke-width="1.6"/>`,
  // 순물질과 혼합물의 가열 곡선(2026-11-15 새로): 같이 오르다가 순물질(파랑)은 평평해지고 혼합물(분홍)은 꺾인 뒤에도 계속 오른다
  pureMixCurveMini: `<path d="M10 8V53H57" stroke="#8B95A1" stroke-width="2.8"/>
    <path d="M12 50L28 26L55 13" stroke="#E64980" stroke-width="3.4"/>
    <path d="M12 50L26 29H55" stroke="#5AA2F8" stroke-width="3.4"/>`,
};

export function chemMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
