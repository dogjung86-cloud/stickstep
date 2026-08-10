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

// ── 심장 구조도(L3 concept) — 4방·판막·혈관 라벨. 정면 뷰(왼쪽 = 몸의 오른쪽) ──
export function heartMapFig(): string {
  const chamber = (x: number, y: number, w: number, h: number, label: string, thick: boolean): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#FFF2F3" stroke="#C2626F" stroke-width="${thick ? 6 : 3}"/>
     <text x="${x + w / 2}" y="${y + h / 2 + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="#A94854">${label}</text>`;
  const valve = (x: number, y: number): string =>
    `<path d="M${x - 12} ${y} q6 3 11 10 M${x + 12} ${y} q-6 3 -11 10" stroke="#B8236B" stroke-width="3.6" stroke-linecap="round" fill="none"/>`;
  const vlab = (x: number, y: number, t: string, anchor = "middle"): string =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="12" font-weight="800" fill="#4E5968">${t}</text>`;
  return SVG(
    340,
    252,
    `<path d="M118 46 v-24" stroke="#7F9DC4" stroke-width="15" stroke-linecap="round"/>
     <path d="M152 40 v-20" stroke="#C46A7C" stroke-width="12" stroke-linecap="round"/>
     <path d="M192 40 v-20" stroke="#7F9DC4" stroke-width="12" stroke-linecap="round"/>
     <path d="M226 46 v-24" stroke="#E05B6E" stroke-width="15" stroke-linecap="round"/>
     ${vlab(84, 18, "대정맥", "end")}
     ${vlab(150, 12, "폐동맥")}
     ${vlab(196, 12, "폐정맥", "start")}
     ${vlab(258, 18, "대동맥", "start")}
     <path d="M96 22 l14 4 M214 12 v6 M136 16 h6 M246 22 l-12 4" stroke="#B0B8C1" stroke-width="1.8"/>
     <path d="M172 52 C126 30 74 58 78 116 C81 168 122 204 172 220 C222 204 263 168 266 116 C270 58 218 30 172 52 Z" fill="#FDE2E5" stroke="#C2626F" stroke-width="4"/>
     ${chamber(98, 62, 66, 44, "우심방", false)}
     ${chamber(180, 62, 66, 44, "좌심방", false)}
     ${chamber(96, 126, 70, 66, "우심실", true)}
     ${chamber(178, 126, 70, 66, "좌심실", true)}
     ${valve(131, 110)}
     ${valve(213, 110)}
     ${valve(150, 42)}
     ${valve(192, 42)}
     <path d="M262 148 h30" stroke="#B0B8C1" stroke-width="1.8"/>
     <text x="296" y="144" text-anchor="start" font-size="11.5" font-weight="700" fill="#8B95A1">
       <tspan x="296" dy="0">심실 벽은</tspan><tspan x="296" dy="14">두껍고</tspan><tspan x="296" dy="14">탄력 있어요</tspan>
     </text>
     <path d="M120 116 l6 -3" stroke="#B0B8C1" stroke-width="1.8"/>
     <text x="66" y="120" text-anchor="middle" font-size="11.5" font-weight="800" fill="#B8236B">판막</text>
     <text x="170" y="244" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8B95A1">심방 = 받는 곳(정맥과 연결) · 심실 = 내보내는 곳(동맥과 연결)</text>`,
    "심장의 구조 — 두 심방과 두 심실, 판막",
  );
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
  const arr = (d: string, c: string): string =>
    `<path d="${d}" stroke="${c}" stroke-width="5" fill="none" marker-end="url(#b6loopArr)" stroke-linecap="round"/>`;
  const lab = (x: number, y: number, t: string): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="11" font-weight="800" fill="#4E5968">${t}</text>`;
  return SVG(
    340,
    258,
    `<defs><marker id="b6loopArr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="context-stroke"/></marker></defs>
     <rect x="118" y="14" width="104" height="34" rx="14" fill="#E3F2FB" stroke="#7CB2D4" stroke-width="2.6"/>
     <text x="170" y="36" text-anchor="middle" font-size="13" font-weight="800" fill="#3E759B">허파</text>
     <rect x="118" y="212" width="104" height="34" rx="14" fill="#FFF7E8" stroke="#E3C58A" stroke-width="2.6"/>
     <text x="170" y="234" text-anchor="middle" font-size="12.5" font-weight="800" fill="#A9832B">온몸의 조직세포</text>
     ${cham(104, 88, "우심방", hideEnd)}
     ${cham(176, 88, "좌심방")}
     ${cham(104, 132, "우심실")}
     ${cham(176, 132, "좌심실")}
     ${arr("M100 147 C46 140 46 60 116 31", "#7F9DC4")}
     ${arr("M224 31 C290 58 290 92 240 101", "#E05B6E")}
     ${arr("M240 149 C302 152 302 212 226 224", "#E05B6E")}
     ${arr("M114 226 C40 200 58 96 100 103", "#7F9DC4")}
     ${lab(46, 76, "폐동맥")}
     ${lab(294, 76, "폐정맥")}
     ${lab(298, 192, "대동맥")}
     ${lab(44, 186, "대정맥")}
     ${lab(170, 66, "허파순환")}
     <text x="170" y="196" text-anchor="middle" font-size="11" font-weight="800" fill="#8B95A1">온몸순환</text>`,
    "혈액의 순환 경로 모식도",
  );
}

// ── 기체 교환 그림(L4) — 허파꽈리·조직세포 두 현장. blanks: ["o2"]면 산소 화살표 라벨을 ㉠로 ──
export function gasExchangeFig(blanks: string[] = []): string {
  const hideO2 = blanks.includes("o2");
  const gasArr = (x1: number, y1: number, x2: number, y2: number, c: string): string =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="4.5" stroke-linecap="round" marker-end="url(#b6gasArr)"/>`;
  const glab = (x: number, y: number, t: string, c: string, hidden = false): string =>
    hidden
      ? `<g><circle cx="${x}" cy="${y}" r="12" fill="#F1F3F5" stroke="#ADB5BD" stroke-width="2" stroke-dasharray="4 3"/>
         <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#868E96">㉠</text></g>`
      : `<g><rect x="${x - 26}" y="${y - 11}" width="52" height="22" rx="11" fill="#FFFFFF" stroke="${c}" stroke-width="2"/>
         <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#333D4B">${t}</text></g>`;
  return SVG(
    340,
    212,
    `<defs><marker id="b6gasArr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="context-stroke"/></marker></defs>
     <!-- 허파꽈리 현장 -->
     <circle cx="84" cy="74" r="46" fill="#E3F2FB" stroke="#7CB2D4" stroke-width="3"/>
     <text x="84" y="44" text-anchor="middle" font-size="12" font-weight="800" fill="#3E759B">허파꽈리</text>
     <rect x="26" y="128" width="288" height="30" rx="15" fill="#FDE2E5" stroke="#E07A85" stroke-width="2.6"/>
     <text x="170" y="147.5" text-anchor="middle" font-size="12" font-weight="800" fill="#C9303E">모세혈관</text>
     ${gasArr(66, 96, 58, 126, B6.o2)}
     ${glab(44, 106, "산소", "#BDDEF5", hideO2)}
     ${gasArr(112, 126, 104, 96, B6.co2)}
     ${glab(136, 106, "이산화 탄소", "#DCD2F7")}
     <!-- 조직세포 현장 -->
     <rect x="196" y="34" width="118" height="76" rx="18" fill="#FFF7E8" stroke="#E3C58A" stroke-width="3"/>
     <text x="255" y="58" text-anchor="middle" font-size="12" font-weight="800" fill="#A9832B">조직세포</text>
     ${gasArr(236, 126, 228, 106, B6.o2)}
     ${gasArr(282, 106, 274, 126, B6.co2)}
     ${blanks.length ? "" : `<text x="170" y="190" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8B95A1">허파꽈리: 산소는 혈관으로, 이산화 탄소는 꽈리로</text>
     <text x="170" y="206" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8B95A1">조직세포: 산소는 세포로, 이산화 탄소는 혈관으로</text>`}`,
    "허파꽈리와 조직세포에서의 기체 교환",
  );
}

// ── 콩팥단위 구조도(L5) — blanks: ["glom"]이면 토리 라벨을 ㉠로 가림 ──────
export function nephronMapFig(blanks: string[] = []): string {
  const hideGlom = blanks.includes("glom");
  const lab = (x: number, y: number, t: string, hidden = false): string =>
    hidden
      ? `<g><circle cx="${x}" cy="${y}" r="12" fill="#F1F3F5" stroke="#ADB5BD" stroke-width="2" stroke-dasharray="4 3"/>
         <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#868E96">㉠</text></g>`
      : `<g><rect x="${x - 36}" y="${y - 11}" width="72" height="22" rx="11" fill="#FFFFFF" stroke="#E3E8EF" stroke-width="1.8"/>
         <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#4E5968">${t}</text></g>`;
  return SVG(
    340,
    218,
    `<path d="M22 42 h56" stroke="#E05B6E" stroke-width="12" stroke-linecap="round" opacity="0.5"/>
     <circle cx="128" cy="52" r="30" fill="#FDE2E5" stroke="#E07A85" stroke-width="3"/>
     <path d="M110 44 q9 -10 21 -3 q12 -8 17 3 q8 7 -2 13 q2 12 -12 9 q-12 7 -17 -3 q-10 -4 -7 -19" stroke="#D96A78" stroke-width="3" fill="none" stroke-linecap="round"/>
     <path d="M88 66 a45 45 0 0 0 80 0" stroke="#C9A876" stroke-width="4" fill="none"/>
     <path d="M128 88 v22 q0 14 -38 14 q-38 0 -38 20 q0 20 38 20 q52 0 70 8" stroke="#F3D9B8" stroke-width="18" fill="none" stroke-linecap="round"/>
     <path d="M232 100 q26 22 4 48 q-16 20 8 36" stroke="#E05B6E" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.4"/>
     ${lab(128, 14, "토리", hideGlom)}
     ${lab(236, 78, "보먼주머니")}
     <path d="M212 74 l-30 -8" stroke="#B0B8C1" stroke-width="1.8"/>
     ${lab(44, 130, "세뇨관")}
     ${lab(284, 176, "모세혈관")}
     <text x="170" y="210" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8B95A1">콩팥단위 = 토리 + 보먼주머니 + 세뇨관</text>`,
    "콩팥단위의 구조",
  );
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
  const arr = (d: string, c: string): string =>
    `<path d="${d}" stroke="${c}" stroke-width="3.4" fill="none" marker-end="url(#b6teamArr)" stroke-linecap="round"/>`;
  const note = (x: number, y: number, t: string, c: string): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${c}">${t}</text>`;
  return SVG(
    340,
    250,
    `<defs><marker id="b6teamArr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="context-stroke"/></marker></defs>
     <rect x="42" y="96" width="256" height="58" rx="20" fill="#FDE2E5" stroke="#E07A85" stroke-width="2.8"/>
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
