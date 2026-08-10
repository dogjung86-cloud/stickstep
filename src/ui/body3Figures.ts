// body3Figures — 중2 Ⅵ v3 퀴즈·concept 도해 + recap 미니아트.
// 규약: 퀴즈용 그림은 정답 유출 차단 인자(blanks)를 받고, concept·recap은 무인자.
// 색은 body3Kit.B6 시맨틱만 사용. 어두운 면 위 라벨은 흰 글자 + 그 면의 최암색 할로.
import { B6 } from "./body3Kit";

const SVG = (w: number, h: number, inner: string, label?: string): string =>
  `<svg viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg"${label ? ` role="img" aria-label="${label}"` : ` aria-hidden="true"`}>${inner}</svg>`;

// ── 검출 반응 도해(L1) — 시약 ↔ 영양소 ↔ 반응색 대응표 ─────────────────
// blanks: 가릴 행 키("starch"|"sugar"|"protein"|"fat") — 색 원과 색 이름을 ?로 바꾼다.
// 퀴즈 전용(정답 유출 차단), concept·recap은 무인자로 전체 공개.
const DETECT_ROWS = [
  { key: "starch", reagent: "아이오딘-아이오딘화 칼륨", target: "녹말", color: B6.iodine, colorName: "청람색", heat: false },
  { key: "sugar", reagent: "베네딕트 (+가열)", target: "포도당 등 당분", color: B6.benedict, colorName: "황적색", heat: true },
  { key: "protein", reagent: "뷰렛", target: "단백질", color: B6.biuret, colorName: "보라색", heat: false },
  { key: "fat", reagent: "수단 III", target: "지방", color: B6.sudan, colorName: "선홍색", heat: false },
] as const;

export function detectMatchFig(blanks: string[] = []): string {
  const rows = DETECT_ROWS.map((r, i) => {
    const y = 28 + i * 44;
    const hidden = blanks.includes(r.key);
    const mark = blanks.length ? (hidden ? "㉠" : "") : "";
    const circle = hidden
      ? `<circle cx="292" cy="${y}" r="13" fill="#F1F3F5" stroke="#ADB5BD" stroke-width="2" stroke-dasharray="4 3"/>
         <text x="292" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#868E96">${mark || "?"}</text>`
      : `<circle cx="292" cy="${y}" r="13" fill="${r.color}"/>
         <text x="292" y="${y + 26}" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">${r.colorName}</text>`;
    return `<g>
      <rect x="10" y="${y - 15}" width="158" height="30" rx="15" fill="#F8F9FA" stroke="#DEE2E6" stroke-width="1.6"/>
      <text x="89" y="${y + 4.5}" text-anchor="middle" font-size="${r.reagent.length > 10 ? 10.5 : 12}" font-weight="700" fill="#333D4B">${r.reagent}</text>
      <path d="M174 ${y} h20 M188 ${y - 4} l8 4 -8 4 Z" stroke="#ADB5BD" stroke-width="2" fill="#ADB5BD"/>
      <text x="230" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${B6.ink}">${r.target}</text>
      ${circle}
    </g>`;
  }).join("");
  return SVG(330, 202, rows, "영양소 검출 반응 대응표");
}

// ── 소화 여행 복습(L2 흡수 concept) — 발주 해부도 위 기관 라벨+분해 요약 오버레이 ──
// 좌표는 body/figs/digestive.webp(3:4) 실측 % — 이미지를 바꾸면 반드시 재실측.
const IMG_BASE = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/");

export function digestReviewFig(): string {
  type Pill = { name: string; sub?: string; x: number; y: number; tx: number; ty: number; tone: string; hot?: boolean };
  const PILLS: Pill[] = [
    { name: "입", sub: "녹말 분해 시작", x: 15, y: 10, tx: 41, ty: 13, tone: "#F3C9A8" },
    { name: "식도", sub: "지나가는 길", x: 81, y: 22, tx: 52, ty: 28, tone: "#E3E8EF" },
    { name: "간", sub: "쓸개즙 생산", x: 14, y: 44, tx: 37, ty: 52, tone: "#F3C9A8" },
    { name: "위", sub: "단백질 분해 시작", x: 82, y: 46, tx: 64, ty: 54, tone: "#F3C9A8" },
    { name: "쓸개", sub: "쓸개즙 저장", x: 13, y: 56, tx: 36.5, ty: 58.5, tone: "#F3C9A8" },
    { name: "이자", sub: "소화효소 3종", x: 82, y: 60, tx: 60, ty: 60.5, tone: "#F3C9A8" },
    { name: "큰창자", sub: "물 흡수", x: 14, y: 71, tx: 32.5, ty: 71, tone: "#E3E8EF" },
    { name: "작은창자", sub: "소화 완성 + 흡수!", x: 81, y: 77, tx: 57, ty: 76, tone: "#E23B4B", hot: true },
  ];
  const W = 340;
  const H = 453; // 3:4
  const px = (p: number): number => (p / 100) * W;
  const py = (p: number): number => (p / 100) * H;
  const parts = PILLS.map((p) => {
    const w = p.sub ? Math.max(64, Math.max(p.name.length, (p.sub?.length ?? 0) * 0.82) * 11 + 22) : p.name.length * 13 + 24;
    const h = p.sub ? 34 : 22;
    const x = px(p.x) - w / 2;
    const y = py(p.y) - h / 2;
    return `<line x1="${px(p.x)}" y1="${py(p.y)}" x2="${px(p.tx)}" y2="${py(p.ty)}" stroke="${p.hot ? "#E23B4B" : "#B0B8C1"}" stroke-width="${p.hot ? 2.4 : 1.8}"/>
      <circle cx="${px(p.tx)}" cy="${py(p.ty)}" r="${p.hot ? 4 : 3.2}" fill="${p.hot ? "#E23B4B" : "#8B95A1"}" stroke="#FFFFFF" stroke-width="1.6"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#FFFFFF" stroke="${p.hot ? "#E23B4B" : p.tone}" stroke-width="${p.hot ? 2.4 : 1.8}"/>
      <text x="${px(p.x)}" y="${y + (p.sub ? 14.5 : 15.5)}" text-anchor="middle" font-size="12" font-weight="800" fill="${p.hot ? "#C9303E" : "#333D4B"}">${p.name}</text>
      ${p.sub ? `<text x="${px(p.x)}" y="${y + 28}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${p.hot ? "#E23B4B" : "#8B95A1"}">${p.sub}</text>` : ""}`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="소화계 복습 — 기관별 분해 요약">
    <image href="${IMG_BASE}body/figs/digestive.webp" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
    ${parts}
  </svg>`;
}

// ── 융털 확대(L2 흡수 concept) — 발주 일러스트 위 양분·통로 라벨 오버레이 ──
// 좌표는 body/figs/v2/villus-absorption.webp(3:2) 실측 % — 왼쪽 알갱이 = 수용성(청록·보라),
// 오른쪽 노란 알갱이 = 지방 산물, 중앙 노란 관 = 암죽관, 붉은·파란 그물 = 모세혈관.
export function villusLabeledFig(): string {
  const W = 340;
  const H = 227; // 3:2
  const pill = (x: number, y: number, lines: string[], tone: string, ink: string): string => {
    const w = Math.max(...lines.map((l) => l.length)) * 10.2 + 20;
    const h = lines.length > 1 ? 34 : 21;
    return `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="#FFFFFF" fill-opacity="0.94" stroke="${tone}" stroke-width="2"/>
      ${lines.map((l, i) => `<text x="${x}" y="${y - h / 2 + 15 + i * 13}" text-anchor="middle" font-size="${lines.length > 1 ? 10.5 : 11}" font-weight="800" fill="${ink}">${l}</text>`).join("")}`;
  };
  const lead = (x1: number, y1: number, x2: number, y2: number, c: string): string =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.8"/>
     <circle cx="${x2}" cy="${y2}" r="3" fill="${c}" stroke="#FFFFFF" stroke-width="1.4"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="융털 확대 — 양분이 흡수되는 두 길">
    <image href="${IMG_BASE}body/figs/v2/villus-absorption.webp" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
    <rect x="6" y="6" width="74" height="20" rx="10" fill="#E23B4B"/>
    <text x="43" y="20" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">융털 확대</text>
    ${pill(87, 45, ["포도당 · 아미노산"], "#0CA678", "#0B7285")}
    ${lead(87, 56, 84, 74, "#0CA678")}
    ${pill(253, 45, ["지방산 ·", "모노글리세라이드"], "#E8A80C", "#B07D08")}
    ${lead(253, 62, 234, 82, "#E8A80C")}
    ${pill(64, 204, ["모세혈관"], "#E05B6E", "#C9303E")}
    ${lead(90, 197, 122, 172, "#E05B6E")}
    ${pill(276, 204, ["암죽관"], "#D9A76A", "#A9662B")}
    ${lead(250, 199, 162, 180, "#D9A76A")}
  </svg>`;
}

// ── 소화계 모식도(L2 concept) — 소화관 세로 흐름 + 부속 기관 곁가지 ──────
// 경로도는 한글 라벨이 본질이라 벡터로 그린다(하이브리드 방침 — 실사풍은 발주본 bimg 곁들임).
export function digestMapFig(): string {
  const duct = (y: number, label: string, w = 86): string =>
    `<g><rect x="${62 - w / 2 + 43}" y="${y - 17}" width="${w}" height="34" rx="12" fill="#FFF7F5" stroke="#E8B9B2" stroke-width="2.4"/>
     <text x="105" y="${y + 5}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#C9303E">${label}</text></g>`;
  const side = (x: number, y: number, label: string, tone: string): string =>
    `<g><rect x="${x - 40}" y="${y - 16}" width="80" height="32" rx="12" fill="#FFFFFF" stroke="${tone}" stroke-width="2.2"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text></g>`;
  const arrow = (d: string): string => `<path d="${d}" stroke="#B0B8C1" stroke-width="2.2" fill="none" marker-end="url(#b6arrow)"/>`;
  return SVG(
    340,
    268,
    `<defs><marker id="b6arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#B0B8C1"/></marker></defs>
    <path d="M105 42 v206" stroke="#F1D9D5" stroke-width="5" stroke-linecap="round"/>
    ${duct(30, "입")}
    ${duct(72, "식도")}
    ${duct(114, "위")}
    ${duct(156, "작은창자", 96)}
    ${duct(198, "큰창자")}
    ${duct(240, "항문")}
    ${side(255, 30, "침샘", "#F3C9A8")}
    ${arrow("M215 30 h-56")}
    ${side(255, 88, "간", "#F3C9A8")}
    ${arrow("M255 104 v14")}
    ${side(255, 134, "쓸개", "#F3C9A8")}
    ${arrow("M215 140 l-52 12")}
    ${side(255, 186, "이자", "#F3C9A8")}
    ${arrow("M215 180 l-52 -16")}
    <text x="250" y="222" text-anchor="middle" font-size="11" font-weight="700" fill="#8B95A1">침·쓸개즙·이자액이</text>
    <text x="250" y="237" text-anchor="middle" font-size="11" font-weight="700" fill="#8B95A1">소화관으로 분비돼요</text>`,
    "소화계 모식도 — 소화관과 부속 기관",
  );
}

// ── 녹말 소화 흐름도(L2 퀴즈) — blanks: ["final"]이면 최종 산물을 ㉠로 가림 ──
export function starchFlowFig(blanks: string[] = []): string {
  const hideFinal = blanks.includes("final");
  const boxc = (x: number, label: string, hidden = false): string =>
    hidden
      ? `<g><rect x="${x - 38}" y="86" width="76" height="34" rx="12" fill="#F1F3F5" stroke="#ADB5BD" stroke-width="2" stroke-dasharray="4 3"/>
         <text x="${x}" y="108" text-anchor="middle" font-size="14" font-weight="800" fill="#868E96">㉠</text></g>`
      : `<g><rect x="${x - 38}" y="86" width="76" height="34" rx="12" fill="#FFF4E6" stroke="#F3C9A8" stroke-width="2.4"/>
         <text x="${x}" y="108" text-anchor="middle" font-size="13.5" font-weight="800" fill="#D9480F">${label}</text></g>`;
  const enz = (x: number, l1: string, l2: string): string =>
    `<path d="M${x - 22} 103 h44" stroke="#B0B8C1" stroke-width="2.4" marker-end="url(#b6arrow2)"/>
     <text x="${x}" y="82" text-anchor="middle" font-size="11.5" font-weight="800" fill="#7048E8">${l1}</text>
     <text x="${x}" y="132" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8B95A1">${l2}</text>`;
  return SVG(
    340,
    150,
    `<defs><marker id="b6arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#B0B8C1"/></marker></defs>
    ${boxc(52, "녹말")}
    ${enz(113, "아밀레이스", "(입 · 침)")}
    ${boxc(170, "엿당")}
    ${enz(230, "아밀레이스", "(작은창자 · 이자액)")}
    ${boxc(290, "포도당", hideFinal)}`,
    "녹말의 소화 과정 흐름도",
  );
}

// ── 라스터 오버레이 공용 소품 — 흰 필 라벨·리더선·㉠ 가림(villus 문법의 승격판) ──
const rpill = (x: number, y: number, text: string, stroke: string, ink: string, size = 10.5): string => {
  const w = Math.round(text.length * (size + 0.8)) + 16;
  return `<rect x="${x - w / 2}" y="${y - 10}" width="${w}" height="20" rx="10" fill="#FFFFFF" fill-opacity="0.93" stroke="${stroke}" stroke-width="1.8"/>
    <text x="${x}" y="${y + 3.8}" text-anchor="middle" font-size="${size}" font-weight="800" fill="${ink}">${text}</text>`;
};
const rlead = (x1: number, y1: number, x2: number, y2: number, c: string): string =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.8"/>
   <circle cx="${x2}" cy="${y2}" r="3" fill="${c}" stroke="#FFFFFF" stroke-width="1.4"/>`;
const rblank = (x: number, y: number): string =>
  `<circle cx="${x}" cy="${y}" r="12" fill="#F1F3F5" stroke="#ADB5BD" stroke-width="2" stroke-dasharray="4 3"/>
   <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#868E96">㉠</text>`;

// ── 심장 구조도(L3 concept) — 발주 해부 단면(heart.webp) 위 라벨 오버레이 ──
// 좌표는 heart.webp(1:1) 실측 % — 정면 뷰라 화면 왼쪽 = 몸의 오른쪽(우심방·우심실).
// 파랑 = 산소 적은 혈액 쪽(우측·대정맥·폐동맥), 빨강 = 산소 많은 쪽(좌측·대동맥·폐정맥).
export function heartMapFig(): string {
  const BLU = ["#5B84B5", "#245B9B"] as const;
  const RED = ["#D06A76", "#B7353E"] as const;
  const GRY = ["#9AA4B2", "#5A6472"] as const;
  return `<svg viewBox="0 0 340 368" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="심장의 구조 — 두 심방과 두 심실, 판막">
    <image href="${IMG_BASE}body/figs/heart.webp" x="0" y="0" width="340" height="340" preserveAspectRatio="xMidYMid slice"/>
    ${rpill(99, 44, "대정맥", BLU[0], BLU[1])}
    ${rpill(160, 20, "대동맥", RED[0], RED[1])}
    ${rpill(231, 75, "폐동맥", BLU[0], BLU[1])}
    ${rpill(286, 105, "폐정맥", RED[0], RED[1])}
    ${rpill(102, 129, "우심방", BLU[0], BLU[1])}
    ${rpill(112, 218, "우심실", BLU[0], BLU[1])}
    ${rpill(241, 126, "좌심방", RED[0], RED[1])}
    ${rpill(224, 221, "좌심실", RED[0], RED[1])}
    ${rpill(112, 173, "판막", GRY[0], GRY[1], 10)}
    ${rpill(214, 167, "판막", GRY[0], GRY[1], 10)}
    ${rlead(268, 252, 252, 238, "#B0B8C1")}
    <text x="272" y="250" font-size="10" font-weight="700" fill="#8B95A1"><tspan x="272" dy="0">심실 벽이</tspan><tspan x="272" dy="13">심방보다</tspan><tspan x="272" dy="13">두꺼워요</tspan></text>
    <text x="170" y="360" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8B95A1">심방 = 받는 곳(정맥과 연결) · 심실 = 내보내는 곳(동맥과 연결)</text>
  </svg>`;
}

// ── 순환 경로 모식도(L3 퀴즈) — blanks: ["bodyEnd"]면 우심방 라벨을 ㉠로 가림 ──
export function twoLoopFig(blanks: string[] = []): string {
  const hideEnd = blanks.includes("bodyEnd");
  const cham = (x: number, y: number, label: string, hidden = false): string =>
    hidden
      ? `<rect x="${x}" y="${y}" width="60" height="30" rx="10" fill="#F1F3F5" stroke="#ADB5BD" stroke-width="2" stroke-dasharray="4 3"/>
         <text x="${x + 30}" y="${y + 20}" text-anchor="middle" font-size="13" font-weight="800" fill="#868E96">㉠</text>`
      : `<rect x="${x}" y="${y}" width="60" height="30" rx="10" fill="#FFF2F3" stroke="#C2626F" stroke-width="2.6"/>
         <text x="${x + 30}" y="${y + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="#A94854">${label}</text>`;
  const arr = (d: string, c: string, tip: [number, number, number]): string =>
    `<path d="${d}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>
     <path d="M-7 -9 L0 0 L7 -9 Z" fill="${c}" transform="translate(${tip[0]} ${tip[1]}) rotate(${tip[2]})"/>`;
  const lab = (x: number, y: number, t: string): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="11" font-weight="800" fill="#4E5968">${t}</text>`;
  return SVG(
    340,
    258,
    `<rect x="118" y="14" width="104" height="34" rx="14" fill="#E3F2FB" stroke="#7CB2D4" stroke-width="2.6"/>
     <text x="170" y="36" text-anchor="middle" font-size="13" font-weight="800" fill="#3E759B">허파</text>
     <rect x="118" y="212" width="104" height="34" rx="14" fill="#FFF7E8" stroke="#E3C58A" stroke-width="2.6"/>
     <text x="170" y="234" text-anchor="middle" font-size="12.5" font-weight="800" fill="#A9832B">온몸의 조직세포</text>
     ${cham(104, 88, "우심방", hideEnd)}
     ${cham(176, 88, "좌심방")}
     ${cham(104, 132, "우심실")}
     ${cham(176, 132, "좌심실")}
     ${arr("M100 147 C46 140 46 60 112 32", "#7F9DC4", [116, 31, -113])}
     ${arr("M224 31 C290 58 290 92 236 100", "#E05B6E", [240, 101, 82])}
     ${arr("M240 149 C302 152 302 212 230 223", "#E05B6E", [226, 224, 81])}
     ${arr("M114 226 C40 200 58 96 96 103", "#7F9DC4", [100, 103, -80])}
     ${lab(46, 76, "폐동맥")}
     ${lab(294, 76, "폐정맥")}
     ${lab(298, 192, "대동맥")}
     ${lab(44, 186, "대정맥")}
     ${lab(170, 66, "허파순환")}
     <text x="170" y="196" text-anchor="middle" font-size="11" font-weight="800" fill="#8B95A1">온몸순환</text>`,
    "혈액의 순환 경로 모식도",
  );
}

// ── 기체 교환 그림(L4) — 발주 일러스트(alveoli-exchange.webp) 위 라벨 오버레이 ──
// 좌표는 v2/alveoli-exchange.webp(3:2) 실측 % — 파란 알갱이·화살표 = 산소(꽈리→혈관),
// 보라 알갱이·화살표 = 이산화 탄소(혈관→꽈리). blanks: ["o2"]면 산소 라벨을 ㉠로 가리고
// 조직세포 승강장 줄(정답 유출 경로)을 함께 생략한다.
export function gasExchangeFig(blanks: string[] = []): string {
  const hideO2 = blanks.includes("o2");
  const H = hideO2 ? 227 : 318;
  const cellStrip = `
    <text x="170" y="243" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8B95A1">조직세포 승강장 — 방향이 반대!</text>
    <rect x="14" y="252" width="112" height="52" rx="14" fill="#FFF7E8" stroke="#E3C58A" stroke-width="2.6"/>
    <text x="70" y="282" text-anchor="middle" font-size="12.5" font-weight="800" fill="#A9832B">조직세포</text>
    <rect x="214" y="252" width="112" height="52" rx="14" fill="#FDE2E5" stroke="#E07A85" stroke-width="2.6"/>
    <text x="270" y="282" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C9303E">모세혈관</text>
    <path d="M206 268 H147" stroke="${B6.o2}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M140 268 l9 -5 v10 Z" fill="${B6.o2}"/>
    <text x="170" y="258" text-anchor="middle" font-size="10" font-weight="800" fill="#1971A8">산소</text>
    <path d="M134 290 H193" stroke="${B6.co2}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M200 290 l-9 -5 v10 Z" fill="${B6.co2}"/>
    <text x="170" y="309" text-anchor="middle" font-size="10" font-weight="800" fill="#5F3DC4">이산화 탄소</text>`;
  return `<svg viewBox="0 0 340 ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${hideO2 ? "허파꽈리에서의 기체 교환" : "허파꽈리와 조직세포에서의 기체 교환"}">
    <image href="${IMG_BASE}body/figs/v2/alveoli-exchange.webp" x="0" y="0" width="340" height="227" preserveAspectRatio="xMidYMid slice"/>
    ${rpill(82, 30, "허파꽈리 안", "#E8A08A", "#B25B43")}
    ${rpill(279, 34, "모세혈관", "#E07A85", "#C9303E")}
    ${hideO2 ? rblank(88, 100) : rpill(88, 100, "산소", "#4DABF7", "#1971A8", 10)}
    ${rpill(243, 68, "이산화 탄소", "#9775FA", "#5F3DC4", 10)}
    ${hideO2 ? "" : cellStrip}
  </svg>`;
}

// ── 콩팥단위 구조도(L5) — 발주 해부도(nephron.webp) 위 라벨 오버레이 ──────
// 좌표는 body/figs/nephron.webp(4:3) 실측 %. blanks: ["glom"]이면 토리 라벨을 ㉠로 가림.
export function nephronMapFig(blanks: string[] = []): string {
  const hideGlom = blanks.includes("glom");
  const AMB = ["#D9A76A", "#A9662B"] as const;
  // ㉠ 모드에서는 하단 구성 요약도 뺀다 — "토리"가 인쇄되면 정답 유출 표면이 된다.
  return `<svg viewBox="0 0 340 ${hideGlom ? 255 : 278}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="콩팥단위의 구조">
    <image href="${IMG_BASE}body/figs/nephron.webp" x="0" y="0" width="340" height="255" preserveAspectRatio="xMidYMid slice"/>
    ${hideGlom ? rblank(58, 64) : rpill(58, 64, "토리", "#E07A85", "#C9303E")}
    ${rpill(65, 102, "보먼주머니", AMB[0], AMB[1])}
    ${rpill(170, 191, "세뇨관", AMB[0], AMB[1])}
    ${rpill(170, 130, "모세혈관", "#E07A85", "#C9303E")}
    ${rpill(299, 97, "집합관", "#B0B8C1", "#5A6472")}
    ${hideGlom ? "" : `<text x="170" y="271" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8B95A1">콩팥단위 = 토리 + 보먼주머니 + 세뇨관</text>`}
  </svg>`;
}

// ── 기관계 통합 모식도(L6) — blanks: ["dig"]면 소화계 박스를 (가)로 가림 ──
export function teamFig(blanks: string[] = []): string {
  const hideDig = blanks.includes("dig");
  const org = (x: number, y: number, label: string, tone: string, ink: string, hidden = false): string =>
    hidden
      ? `<rect x="${x - 44}" y="${y - 20}" width="88" height="40" rx="13" fill="#F1F3F5" stroke="#ADB5BD" stroke-width="2" stroke-dasharray="4 3"/>
         <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#868E96">(가)</text>`
      : `<rect x="${x - 44}" y="${y - 20}" width="88" height="40" rx="13" fill="${tone}" stroke="${ink}" stroke-width="2.6"/>
         <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">${label}</text>`;
  const arr = (d: string, c: string): string => {
    const m = /M(\d+) (\d+) v(-?\d+)/.exec(d)!;
    const x = Number(m[1]);
    const y1 = Number(m[2]);
    const dy = Number(m[3]);
    const y2 = y1 + dy;
    const down = dy > 0;
    return `<path d="M${x} ${y1} v${dy + (down ? -6 : 6)}" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M${x - 5} ${y2 + (down ? -7 : 7)} L${x} ${y2} L${x + 5} ${y2 + (down ? -7 : 7)} Z" fill="${c}"/>`;
  };
  const note = (x: number, y: number, t: string, c: string): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${c}">${t}</text>`;
  return SVG(
    340,
    250,
    `<rect x="42" y="96" width="256" height="58" rx="20" fill="#FDE2E5" stroke="#E07A85" stroke-width="2.8"/>
     <text x="170" y="130" text-anchor="middle" font-size="13.5" font-weight="800" fill="#C9303E">순환계</text>
     ${org(88, 36, "소화계", "#FFF4E6", "#F3C9A8", hideDig)}
     ${org(252, 36, "호흡계", "#E3F2FB", "#7CB2D4")}
     ${org(88, 218, "배설계", "#FBF3DC", "#D9C08C")}
     <rect x="208" y="198" width="88" height="40" rx="13" fill="#FFF7E8" stroke="#E3C58A" stroke-width="2.6"/>
     <text x="252" y="223" text-anchor="middle" font-size="13" font-weight="800" fill="#A9832B">조직세포</text>
     ${arr("M88 58 v34", B6.glucose)}
     ${note(60, 78, "영양소", "#C46A12")}
     ${arr("M244 58 v34", B6.o2)}
     ${arr("M262 92 v-34", B6.co2)}
     ${note(296, 78, "산소·이산화 탄소", "#5F3DC4")}
     ${arr("M88 158 v34", B6.urea)}
     ${note(56, 182, "요소", "#7A5D1D")}
     ${arr("M244 158 v34", B6.o2)}
     ${arr("M262 192 v-34", B6.co2)}
     ${note(300, 182, "물질 교환", "#8B95A1")}`,
    "세포호흡을 떠받치는 기관계의 통합 작용",
  );
}

// ── recap 미니아트(64×64 플랫 — 과학 *Figures 관례) ─────────────────────
const MINI: Record<string, string> = {};

/** 물방울(물 = 구성 성분 1위) */
MINI.waterBody = `<circle cx="32" cy="34" r="22" fill="#E7F5FF"/><path d="M32 14 C40 26 46 32 46 40 a14 14 0 0 1 -28 0 c0 -8 6 -14 14 -26 Z" fill="${B6.water}"/><path d="M26 40 c0 5 3 8 7 9" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`;

/** 여섯 재료(영양소 6종 = 색점 육각 배치) */
MINI.sixMats = `<circle cx="32" cy="14" r="7" fill="${B6.carb}"/><circle cx="48" cy="23" r="7" fill="${B6.protein}"/><circle cx="48" cy="41" r="7" fill="${B6.fat}"/><circle cx="32" cy="50" r="7" fill="${B6.vitamin}"/><circle cx="16" cy="41" r="7" fill="${B6.mineral}"/><circle cx="16" cy="23" r="7" fill="${B6.water}"/><circle cx="32" cy="32" r="5" fill="#FFFFFF" stroke="#CED4DA" stroke-width="2"/>`;

/** 에너지원 3형제(장작+불꽃) */
MINI.energyLogs = `<rect x="12" y="42" width="40" height="7" rx="3.5" fill="#B08D4F" transform="rotate(-8 32 45)"/><rect x="12" y="48" width="40" height="7" rx="3.5" fill="#8D6E3A" transform="rotate(6 32 51)"/><path d="M32 12 c7 8 12 13 12 20 a12 12 0 0 1 -24 0 c0 -7 5 -12 12 -20 Z" fill="#FF922B"/><path d="M32 22 c4 5 6 8 6 12 a6 6 0 0 1 -12 0 c0 -4 2 -7 6 -12 Z" fill="${B6.energy}"/>`;

/** 검출 색 짝(시험관 4개 + 반응색) */
MINI.colorTubes = `<g stroke-width="2"><rect x="8" y="14" width="10" height="34" rx="5" fill="#E7ECFB" stroke="#B9C2CC"/><rect x="9.5" y="30" width="7" height="16" rx="3.5" fill="${B6.iodine}"/><rect x="22" y="14" width="10" height="34" rx="5" fill="#FDEDE4" stroke="#B9C2CC"/><rect x="23.5" y="30" width="7" height="16" rx="3.5" fill="${B6.benedict}"/><rect x="36" y="14" width="10" height="34" rx="5" fill="#F0EAFB" stroke="#B9C2CC"/><rect x="37.5" y="30" width="7" height="16" rx="3.5" fill="${B6.biuret}"/><rect x="50" y="14" width="10" height="34" rx="5" fill="#FDE9EC" stroke="#B9C2CC"/><rect x="51.5" y="30" width="7" height="16" rx="3.5" fill="${B6.sudan}"/></g>`;

/** 좁은 문과 조각 상자(소화 = 크기 문제) */
MINI.doorParts = `<rect x="24" y="12" width="18" height="40" rx="3" fill="#FFF7F5" stroke="#C9303E" stroke-width="2.6"/><circle cx="38" cy="33" r="2" fill="#C9303E"/><rect x="6" y="20" width="13" height="10" rx="2" fill="${B6.carb}"/><rect x="6" y="34" width="13" height="10" rx="2" fill="${B6.carb}" opacity="0.75"/><path d="M46 24 h8 M50 20 l6 4 -6 4 Z" stroke="${B6.carb}" stroke-width="2.4" fill="${B6.carb}"/><circle cx="52" cy="40" r="4" fill="${B6.glucose}"/><circle cx="58" cy="46" r="4" fill="${B6.glucose}"/>`;

/** 전담 가위(효소 특이성 — 모양 다른 가위 2개와 사슬) */
MINI.enzymeScissors = `<path d="M10 22 h26" stroke="${B6.carb}" stroke-width="3"/><circle cx="14" cy="22" r="4.5" fill="${B6.carb}"/><circle cx="26" cy="22" r="4.5" fill="${B6.carb}"/><circle cx="38" cy="22" r="4.5" fill="${B6.carb}"/><path d="M44 12 l12 14 M56 12 l-12 14" stroke="#7048E8" stroke-width="3" stroke-linecap="round"/><circle cx="45" cy="28" r="3.4" fill="none" stroke="#7048E8" stroke-width="2.4"/><circle cx="55" cy="28" r="3.4" fill="none" stroke="#7048E8" stroke-width="2.4"/><path d="M10 46 h20" stroke="${B6.protein}" stroke-width="3"/><circle cx="14" cy="46" r="4.5" fill="${B6.protein}"/><circle cx="26" cy="46" r="4.5" fill="${B6.protein}"/><path d="M40 40 q6 6 0 12" stroke="#C9CDD2" stroke-width="2.6" fill="none"/><text x="52" y="52" font-size="14" font-weight="800" fill="#8B95A1">?</text>`;

/** 접힌 융털 카펫(표면적) */
MINI.villiFold = `<rect x="8" y="40" width="48" height="12" rx="4" fill="#FBEEEC" stroke="#E8B9B2" stroke-width="2"/><path d="M12 40 v-14 a5 5 0 0 1 10 0 v14 M24 40 v-18 a5 5 0 0 1 10 0 v18 M36 40 v-14 a5 5 0 0 1 10 0 v14" fill="#FFB3B9" stroke="#E07A85" stroke-width="2.2"/><circle cx="17" cy="30" r="1.6" fill="#FFFFFF"/><circle cx="29" cy="27" r="1.6" fill="#FFFFFF"/><circle cx="41" cy="30" r="1.6" fill="#FFFFFF"/>`;

/** 판막 스윙 문(심장 = 일방통행 펌프) */
MINI.heartDoor = `<path d="M32 14 C22 6 8 12 9 26 C10 40 20 48 32 54 C44 48 54 40 55 26 C56 12 42 6 32 14 Z" fill="#FDE2E5" stroke="#C2626F" stroke-width="2.6"/><path d="M24 28 q4 2 7 8 M40 28 q-4 2 -7 8" stroke="#B8236B" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M32 18 v6 M29 21 l3 4 3 -4" stroke="#E23B4B" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;

/** 혈관 3종(굵기·벽 다른 관) */
MINI.vesselTrio = `<path d="M8 16 h48" stroke="#E05B6E" stroke-width="11" stroke-linecap="round"/><path d="M8 16 h48" stroke="#FFD3D9" stroke-width="4" stroke-linecap="round"/><path d="M8 34 h48" stroke="#D9A0AA" stroke-width="6" stroke-linecap="round"/><path d="M8 34 h48" stroke="#FFE8EB" stroke-width="2.4" stroke-linecap="round"/><path d="M8 50 q12 4 24 0 t24 0" stroke="#E8B9B2" stroke-width="2.6" fill="none"/><circle cx="20" cy="49" r="1.8" fill="#E05B6E"/><circle cx="34" cy="51" r="1.8" fill="#E05B6E"/><circle cx="46" cy="49" r="1.8" fill="#E05B6E"/>`;

/** 혈액 구성(혈장 + 혈구 3종) */
MINI.bloodCrew = `<path d="M14 10 h36 l-4 44 h-28 Z" fill="#FFF3D6" stroke="#E3C58A" stroke-width="2.4"/><circle cx="26" cy="38" r="6.5" fill="${B6.oxyBlood}"/><circle cx="26" cy="38" r="2.6" fill="#FFB3B9"/><circle cx="40" cy="30" r="7.5" fill="#FFFFFF" stroke="#B49FE3" stroke-width="2.4"/><circle cx="40" cy="30" r="3" fill="#B49FE3"/><path d="M36 46 l4 -3 4 3 -2 4 h-4 Z" fill="#F59F00"/>`;

/** 두 순환 고리(8자) */
MINI.loopTwo = `<rect x="24" y="26" width="16" height="12" rx="4" fill="#FDE2E5" stroke="#C2626F" stroke-width="2.2"/><path d="M30 26 C12 18 12 4 32 8 C50 4 50 18 34 26" stroke="#7CB2D4" stroke-width="3" fill="none" marker-end="none"/><path d="M30 38 C10 46 12 60 32 56 C52 60 52 46 34 38" stroke="#E05B6E" stroke-width="3" fill="none"/><path d="M14 12 l-2 4 4 1 Z" fill="#7CB2D4"/><path d="M50 52 l2 -4 -4 -1 Z" fill="#E05B6E"/>`;

/** 거꾸로 나무(호흡계 — 숨관→숨관가지→허파꽈리) */
MINI.lungTree = `<path d="M32 8 v14 M32 22 c-8 4 -14 8 -16 16 M32 22 c8 4 14 8 16 16 M16 38 c-3 5 -3 9 -2 12 M48 38 c3 5 3 9 2 12" stroke="#C4707F" stroke-width="3.4" stroke-linecap="round" fill="none"/><circle cx="12" cy="53" r="5" fill="#BBE3F5" stroke="#7CB2D4" stroke-width="2"/><circle cx="21" cy="55" r="5" fill="#BBE3F5" stroke="#7CB2D4" stroke-width="2"/><circle cx="43" cy="55" r="5" fill="#BBE3F5" stroke="#7CB2D4" stroke-width="2"/><circle cx="52" cy="53" r="5" fill="#BBE3F5" stroke="#7CB2D4" stroke-width="2"/>`;

/** 부피↑ = 압력↓ = 공기 in(호흡운동) */
MINI.pressureFlow = `<path d="M14 20 h36 l4 34 h-44 Z" fill="#EAF2F8" stroke="#8FA6B8" stroke-width="2.6"/><path d="M18 54 q14 -8 28 0" stroke="#E23B4B" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M32 4 v12 M28 12 l4 6 4 -6" stroke="#4DABF7" stroke-width="3" stroke-linecap="round" fill="none"/><ellipse cx="32" cy="34" rx="10" ry="12" fill="#FFB3B9" stroke="#E07A85" stroke-width="2.2"/>`;

/** 승강장 교환(기체 교환 — 파랑 in·보라 out) */
MINI.swapStation = `<rect x="10" y="24" width="44" height="16" rx="8" fill="#FDE2E5" stroke="#E07A85" stroke-width="2.2"/><circle cx="20" cy="14" r="5" fill="${B6.o2}"/><path d="M20 20 v8 M17 24 l3 5 3 -5" stroke="${B6.o2}" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="44" cy="52" r="5" fill="${B6.co2}"/><path d="M44 46 v-8 M41 42 l3 -5 3 5" stroke="${B6.co2}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;

/** 위험물 포장(암모니아→요소, 간) */
MINI.wastePack = `<path d="M18 22 l3 -6 3 6 6 -3 -3 6 6 3 -6 3 3 6 -6 -3 -3 6 -3 -6 -6 3 3 -6 -6 -3 6 -3 Z" fill="#F59F00" stroke="#C77E0A" stroke-width="1.6"/><rect x="32" y="30" width="24" height="20" rx="5" fill="#EDE6D6" stroke="${B6.urea}" stroke-width="2.4"/><path d="M32 40 h24 M44 30 v20" stroke="${B6.urea}" stroke-width="1.8"/><path d="M26 40 h4 M28 38 l4 2 -4 2 Z" fill="#8B95A1" stroke="#8B95A1" stroke-width="1.6"/>`;

/** 체 3단(여과·재흡수·분비) */
MINI.filterSteps = `<path d="M10 16 h44" stroke="#C9A876" stroke-width="3.4" stroke-linecap="round"/><path d="M18 16 v6 M26 16 v6 M34 16 v6 M42 16 v6" stroke="#C9A876" stroke-width="2"/><circle cx="22" cy="30" r="3.4" fill="${B6.glucose}"/><circle cx="34" cy="34" r="3" fill="${B6.water}"/><circle cx="44" cy="30" r="3" fill="${B6.urea}"/><path d="M22 36 q-6 6 -6 12 M16 44 l0 6 M20 46 l-4 4" stroke="${B6.glucose}" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M44 36 v14 M41 46 l3 5 3 -5" stroke="${B6.urea}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;

/** 오줌의 길(방울 계단) */
MINI.peePath = `<path d="M14 12 q20 2 22 16 q2 12 14 14" stroke="#F5D664" stroke-width="5" stroke-linecap="round" fill="none"/><rect x="38" y="44" width="18" height="12" rx="5" fill="#FBF3DC" stroke="#D9C08C" stroke-width="2.2"/><circle cx="14" cy="12" r="5" fill="#FDE2E5" stroke="#E07A85" stroke-width="2"/><path d="M50 40 c2 -4 4 -6 4 -6 c0 0 2 2 2 5 a3 3 0 0 1 -6 1 Z" fill="#F5D664"/>`;

/** 세포 속 불꽃(세포호흡) */
MINI.cellFire = `<rect x="10" y="12" width="44" height="40" rx="12" fill="#FFF7E8" stroke="#E3C58A" stroke-width="2.6"/><path d="M26 44 c4 -10 7 -13 10 -17 c3 4 6 7 10 17 a10 10 0 0 1 -20 0 Z" fill="#FF922B"/><path d="M31 45 c2 -5 3.4 -7 5 -9 c1.6 2 3 4 5 9 a5 5 0 0 1 -10 0 Z" fill="${B6.energy}"/><circle cx="20" cy="20" r="3" fill="${B6.glucose}"/><circle cx="46" cy="20" r="3" fill="${B6.o2}"/>`;

/** 에너지의 쓰임(온도계+달리기) */
MINI.energyUse = `<rect x="12" y="10" width="8" height="30" rx="4" fill="#FFFFFF" stroke="#B9C2CC" stroke-width="2"/><rect x="14.5" y="22" width="3" height="16" fill="#F03E3E"/><circle cx="16" cy="44" r="6" fill="#F03E3E" stroke="#B9C2CC" stroke-width="2"/><g stroke="#333D4B" stroke-width="2.6" stroke-linecap="round" fill="none"><circle cx="42" cy="18" r="6" fill="#FFFFFF"/><path d="M42 24 l-2 12 M40 36 l-6 10 M40 36 l8 8 M42 28 l-8 2 M42 28 l9 -3"/></g><path d="M52 48 h6 M50 52 h8" stroke="#FFB005" stroke-width="2" stroke-linecap="round"/>`;

/** 네 기관계 퍼즐(통합) */
MINI.teamFour = `<rect x="10" y="10" width="20" height="20" rx="5" fill="#FFF4E6" stroke="#F3C9A8" stroke-width="2"/><rect x="34" y="10" width="20" height="20" rx="5" fill="#E3F2FB" stroke="#7CB2D4" stroke-width="2"/><rect x="10" y="34" width="20" height="20" rx="5" fill="#FBF3DC" stroke="#D9C08C" stroke-width="2"/><rect x="34" y="34" width="20" height="20" rx="5" fill="#FFF7E8" stroke="#E3C58A" stroke-width="2"/><circle cx="32" cy="32" r="8" fill="#FDE2E5" stroke="#E07A85" stroke-width="2.4"/>`;

/** 자리표시(키 미등록) — 저작 중 눈에 띄게 */
const FALLBACK = `<rect x="10" y="10" width="44" height="44" rx="10" fill="#F1F3F5" stroke="#CED4DA" stroke-width="2"/><text x="32" y="38" text-anchor="middle" font-size="16" fill="#868E96">?</text>`;

export function b6MiniArt(key: string): string {
  return SVG(64, 64, MINI[key] ?? FALLBACK);
}
