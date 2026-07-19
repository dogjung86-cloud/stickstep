// hisFigures — 역사 트랙 퀴즈 SVG + recap 미니아트(64×64 플랫).
// 파운드리 문법(3스톱 그라데이션·키라이트·접촉 그림자·재질별 최암색 외곽선) 준수.
// 파라미터형 원칙: 연표 띠(centuryStripFig)는 눈금 범위·표시 구간이 인자 — 시험·후속 단원이 재사용.
// aria 가드: 그림 aria-label에 정답(세기 이름·단계 이름)을 쓰지 않는다(crudeTowerFig 선례).

/* ---------- 사관 그림 — 같은 인물, 서로 다른 두 기록 ---------- */
export function sagwanFig(): string {
  return `<svg viewBox="0 0 400 210" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="한 인물 카드를 사이에 두고 두 역사가가 서로 다른 내용의 기록을 쓰는 그림">
    <defs>
      <linearGradient id="hf-parch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBF3DC"/><stop offset=".6" stop-color="#F0DFB4"/><stop offset="1" stop-color="#DCC48E"/></linearGradient>
      <linearGradient id="hf-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9EEF4"/></linearGradient>
      <linearGradient id="hf-cape" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8B04E"/><stop offset="1" stop-color="#C2843A"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="400" height="210" rx="16" fill="#F7FAFC"/>
    <ellipse cx="200" cy="188" rx="150" ry="8" fill="#2A3A5E" opacity=".08"/>
    <rect x="152" y="28" width="96" height="120" rx="10" fill="url(#hf-card)" stroke="#8A96A6" stroke-width="1.8"/>
    <circle cx="200" cy="66" r="20" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.4"/>
    <path d="M186 52q14-12 28 0l-3 8q-11-7-22 0z" fill="url(#hf-cape)" stroke="#8A5A26" stroke-width="1.6"/>
    <path d="M200 86v28M200 94l-14 8M200 94l14 8M200 114l-10 20M200 114l10 20" stroke="#3C4654" stroke-width="2.4" stroke-linecap="round"/>
    <text x="200" y="164" text-anchor="middle" font-size="12" font-weight="900" fill="#5B6570" font-family="Pretendard, sans-serif">같은 인물</text>
    <g>
      <rect x="20" y="52" width="112" height="76" rx="9" fill="url(#hf-parch)" stroke="#8A6A3E" stroke-width="1.8"/>
      <path d="M32 70h88M32 84h88M32 98h56" stroke="#B99B66" stroke-width="3" stroke-linecap="round" opacity=".8"/>
      <text x="76" y="120" text-anchor="middle" font-size="12.5" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">“위대한 지도자”</text>
      <path d="M132 90 L146 90" stroke="#C2843A" stroke-width="2.4" stroke-dasharray="3 4"/>
      <g stroke="#3C4654" stroke-width="2.2" fill="none">
        <circle cx="42" cy="158" r="8" fill="#FFE8CE"/>
        <path d="M42 166v18M42 172l-9 5M42 172l10 3M42 184l-7 12M42 184l7 12"/>
        <path d="M52 175l12-5" stroke="#8A6534"/>
      </g>
      <text x="90" y="176" text-anchor="middle" font-size="11" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">역사가 A의 기록</text>
    </g>
    <g>
      <rect x="268" y="52" width="112" height="76" rx="9" fill="url(#hf-parch)" stroke="#8A6A3E" stroke-width="1.8"/>
      <path d="M280 70h88M280 84h88M280 98h56" stroke="#B99B66" stroke-width="3" stroke-linecap="round" opacity=".8"/>
      <text x="324" y="120" text-anchor="middle" font-size="12.5" font-weight="900" fill="#B23428" font-family="Pretendard, sans-serif">“잔인한 정복자”</text>
      <path d="M268 90 L254 90" stroke="#C2843A" stroke-width="2.4" stroke-dasharray="3 4"/>
      <g stroke="#3C4654" stroke-width="2.2" fill="none">
        <circle cx="358" cy="158" r="8" fill="#FFE8CE"/>
        <path d="M358 166v18M358 172l-10 3M358 172l9 5M358 184l-7 12M358 184l7 12"/>
        <path d="M348 175l-12-5" stroke="#8A6534"/>
      </g>
      <text x="310" y="176" text-anchor="middle" font-size="11" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">역사가 B의 기록</text>
    </g>
  </svg>`;
}

/* ---------- 연표 띠(파라미터형) ---------- */
/** 세기 칸 연표 띠. mark 세기 칸을 ㉮로 칠해 "몇 세기?"류 문제에 쓴다(칸 안에 세기 이름은 인쇄하지 않는다).
 *  names=true면 전 칸에 세기 이름을 인쇄(개념·recap 전용 — 그 이름을 묻는 문제엔 금지). */
export function centuryStripFig(o: { start: number; end: number; mark?: number; names?: boolean; events?: { year: number; label: string }[] }): string {
  const cents: number[] = [];
  for (let c = o.start; c <= o.end; c += 1) if (c !== 0) cents.push(c);
  const W = 400;
  const L = 22;
  const R = 22;
  const bw = (W - L - R) / cents.length;
  const top = 66;
  const h = 64;
  const bcCount = cents.filter((c) => c < 0).length;
  const cells = cents
    .map((c, i) => {
      const x = L + i * bw;
      const marked = o.mark === c;
      const fill = marked ? "#BFE3E8" : c < 0 ? "#F4E7C8" : "#FBF3DC";
      const name = o.names ? `<text x="${x + bw / 2}" y="${top + 30}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#5E4626" font-family="Pretendard, sans-serif">${c < 0 ? `전 ${-c}` : c}세기</text>` : "";
      const mk = marked ? `<text x="${x + bw / 2}" y="${top + (o.names ? 48 : 38)}" text-anchor="middle" font-size="15" font-weight="900" fill="#0A5964" font-family="Pretendard, sans-serif">㉮</text>` : "";
      return `<rect x="${x}" y="${top}" width="${bw}" height="${h}" fill="${fill}" stroke="#8A6A3E" stroke-width="1.2"/>${name}${mk}`;
    })
    .join("");
  // 축 왼쪽 끝: 기원전 c세기의 왼쪽 끝 = c*100이지만, 기원후 c세기의 왼쪽 끝은 (c-1)*100 —
  // timelineKit axisMinYear와 같은 보정(양수 시작 띠에서 눈금 전체가 +100 밀리고 첫 눈금이 "1"로
  // 찍히던 버그 수정, 2026-07-20. 음수 시작 띠는 값 불변).
  const axisMin = o.start < 0 ? o.start * 100 : (o.start - 1) * 100;
  const ticks = Array.from({ length: cents.length + 1 }, (_, i) => {
    const y = axisMin + i * 100;
    const isOne = bcCount > 0 && y === 0;
    const label = isOne ? "1" : String(Math.abs(y));
    const x = L + i * bw;
    return `<line x1="${x}" y1="${top + h}" x2="${x}" y2="${top + h + 6}" stroke="#8A6A3E" stroke-width="1.4"/>
      <text x="${x}" y="${top + h + 20}" text-anchor="middle" font-size="10" font-weight="${isOne ? 900 : 700}" fill="${isOne ? "#C2843A" : "#5B6570"}" font-family="Pretendard, sans-serif">${label}</text>`;
  }).join("");
  const evts = (o.events ?? [])
    .map((e, i) => {
      const min = axisMin;
      const max = o.end * 100;
      const x = L + ((e.year - min) / (max - min)) * (W - L - R);
      const ly = i % 2 ? top + h + 34 : top - 26;
      return `<circle cx="${x}" cy="${top + h / 2}" r="5" fill="#0E7C8A" stroke="#073E46" stroke-width="1.6"/>
        <line x1="${x}" y1="${i % 2 ? top + h : ly + 8}" x2="${x}" y2="${i % 2 ? ly - 10 : top}" stroke="#0E7C8A" stroke-width="1.2" stroke-dasharray="2 3"/>
        <text x="${x}" y="${ly}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0A5964" font-family="Pretendard, sans-serif">${e.label}</text>`;
    })
    .join("");
  const bcW = bcCount * bw;
  return `<svg viewBox="0 0 ${W} 176" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="세기 칸이 나뉜 연표 띠 그림. 눈금에 연도가 적혀 있고, 표시된 구간은 동그라미 기호로 나타나 있다">
    <rect x="0" y="0" width="${W}" height="176" rx="16" fill="#F7FAFC"/>
    ${bcCount ? `<rect x="${L}" y="${top - 24}" width="${bcW}" height="18" rx="6" fill="rgba(168,122,62,.18)"/>
    <text x="${L + bcW / 2}" y="${top - 11}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">기원전</text>` : ""}
    <rect x="${L + bcW}" y="${top - 24}" width="${W - R - L - bcW}" height="18" rx="6" fill="rgba(14,124,138,.14)"/>
    <text x="${L + bcW + (W - R - L - bcW) / 2}" y="${top - 11}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#0A5964" font-family="Pretendard, sans-serif">기원후</text>
    ${cells}
    ${bcCount ? `<line x1="${L + bcW}" y1="${top - 4}" x2="${L + bcW}" y2="${top + h + 4}" stroke="#E0A72E" stroke-width="2.6"/>` : ""}
    ${ticks}${evts}
  </svg>`;
}

/* ---------- 탐구 절차 순서도(파라미터형) ---------- */
/** 역사 탐구 5단계 순서도. hide에 준 인덱스 칸은 ㉠으로 가린다(그 단계 이름을 묻는 문제용 — 유출 방지). */
export function tamguFlowFig(o?: { hide?: number }): string {
  const steps = ["탐구 주제 선정", "자료 수집", "자료 분석·해석", "해석 검증", "정리·발표"];
  const icons = [
    `<circle cx="0" cy="0" r="7" fill="none" stroke="#3182F6" stroke-width="2.2"/><path d="M0-3v3l2.4 2.4" stroke="#3182F6" stroke-width="2" stroke-linecap="round"/>`,
    `<path d="M-7-5h9l5 4v8h-14z" fill="none" stroke="#E8850C" stroke-width="2.2" stroke-linejoin="round"/><path d="M-4 0h8M-4 4h8" stroke="#E8850C" stroke-width="1.8" stroke-linecap="round"/>`,
    `<circle cx="-2" cy="-2" r="6" fill="none" stroke="#7A5CB8" stroke-width="2.2"/><path d="M3 3l5 5" stroke="#7A5CB8" stroke-width="2.4" stroke-linecap="round"/>`,
    `<path d="M-8 2q4-8 8-1 4 7 8-1" fill="none" stroke="#0CA6C0" stroke-width="2.2" stroke-linecap="round"/><path d="M-8-6h16" stroke="#0CA6C0" stroke-width="2" stroke-linecap="round"/>`,
    `<rect x="-8" y="-7" width="16" height="11" rx="2" fill="none" stroke="#04B45F" stroke-width="2.2"/><path d="M0 4v5M-5 9h10" stroke="#04B45F" stroke-width="2" stroke-linecap="round"/>`,
  ];
  const W = 400;
  const bw = 68;
  const gap = (W - 24 - bw * 5) / 4;
  const boxes = steps
    .map((name, i) => {
      const x = 12 + i * (bw + gap);
      const hidden = o?.hide === i;
      const label = hidden
        ? `<text x="${x + bw / 2}" y="96" text-anchor="middle" font-size="16" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">㉠</text>`
        : name
            .split(" ")
            .map((w, k) => `<text x="${x + bw / 2}" y="${90 + k * 14}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">${w}</text>`)
            .join("");
      const arrow = i < 4 ? `<path d="M${x + bw + 4} 74 h${gap - 9} m-6 -5 l6 5 -6 5" stroke="#8B95A1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : "";
      return `<rect x="${x}" y="40" width="${bw}" height="72" rx="10" fill="${hidden ? "#FBF0DA" : "#FFFFFF"}" stroke="${hidden ? "#C2843A" : "#B9C4D4"}" stroke-width="1.8"/>
        <g transform="translate(${x + bw / 2} 60)">${hidden ? `<circle r="7" fill="none" stroke="#C2843A" stroke-width="2" stroke-dasharray="2 3"/>` : icons[i]}</g>
        ${label}${arrow}
        <circle cx="${x + 12}" cy="50" r="7" fill="#33405A"/><text x="${x + 12}" y="53.4" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif">${i + 1}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${W} 132" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="역사 탐구의 절차를 차례로 나타낸 순서도. 일부 칸은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="${W}" height="132" rx="16" fill="#F7FAFC"/>
    ${boxes}
  </svg>`;
}

/* ---------- 연호 개념 그림 ---------- */
/** 연호 = 국왕 즉위 해에 붙인 연대 이름. 영락 1년 = 391년 대응만 그린다(9년 문제의 정답은 인쇄하지 않는다). */
export function yeonhoFig(): string {
  return `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="비석에 새긴 연호와 오늘날 연도의 대응을 나타낸 그림 — 영락 1년이 391년과 화살표로 이어져 있다">
    <defs>
      <linearGradient id="hf-stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9C4D4"/><stop offset=".55" stop-color="#8FA0B6"/><stop offset="1" stop-color="#6E8098"/></linearGradient>
      <linearGradient id="hf-cal2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9EEF4"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="400" height="190" rx="16" fill="#F7FAFC"/>
    <ellipse cx="106" cy="168" rx="66" ry="8" fill="#2A3A5E" opacity=".1"/>
    <path d="M70 160 V52 q0-16 16-18 l40-4 q16 0 16 18 V160 z" fill="url(#hf-stone)" stroke="#4E6078" stroke-width="2.2"/>
    <path d="M62 160 h160" stroke="#4E6078" stroke-width="3" stroke-linecap="round" opacity="0"/>
    <rect x="58" y="158" width="96" height="12" rx="5" fill="#8FA0B6" stroke="#4E6078" stroke-width="1.8"/>
    <text x="106" y="84" text-anchor="middle" font-size="15" font-weight="900" fill="#F2F6FB" font-family="Pretendard, sans-serif">영락 1년</text>
    <text x="106" y="106" text-anchor="middle" font-size="10" font-weight="800" fill="#D6E0EC" font-family="Pretendard, sans-serif">왕이 즉위한 해</text>
    <path d="M92 120h28M92 132h28" stroke="#5E7088" stroke-width="2" stroke-linecap="round" opacity=".7"/>
    <path d="M168 96 h56 m-8 -7 l8 7 -8 7" stroke="#C2843A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="240" y="52" width="120" height="88" rx="12" fill="url(#hf-cal2)" stroke="#B9C4D4" stroke-width="2"/>
    <rect x="240" y="52" width="120" height="26" rx="12" fill="#0E7C8A"/>
    <rect x="240" y="68" width="120" height="10" fill="url(#hf-cal2)"/>
    <text x="300" y="70" text-anchor="middle" font-size="12" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif">오늘날 연도로는</text>
    <text x="300" y="116" text-anchor="middle" font-size="24" font-weight="900" fill="#0A5964" font-family="Pretendard, sans-serif">391년</text>
    <text x="300" y="162" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">같은 해를 두 가지 방법으로 부른다</text>
  </svg>`;
}

/* ============================================================
   역사 Ⅱ(문명의 발생과 고대 세계) 그림 — 2026-07-19
   ============================================================ */

/* ---------- 문명 발생 천년 스케일 띠(정적) ----------
   연표 랩(timelineLab)은 세기(100년) 균일 칸 문법이라 문명 발생 연대(기원전 3500~2500)를 담지 못한다
   — 게이트 ① 결정에 따라 이 그림이 천 년 스케일(500년 칸)을 담당한다. 칸 폭 = 500년을 명시해
   "한 칸 = 1세기"로 오독하지 않게 한다. aria에는 정답이 될 수 있는 문명 순서를 쓰지 않는다. */
export function millenniumFig(): string {
  const W = 400;
  const L = 26;
  const R = 26;
  const years = [-4000, -3500, -3000, -2500, -2000, -1500]; // 눈금(500년 간격)
  const top = 74;
  const h = 46;
  const span = years[years.length - 1] - years[0];
  const x = (y: number): number => L + ((y - years[0]) / span) * (W - L - R);
  const cells = years.slice(0, -1).map((y, i) => `<rect x="${x(y)}" y="${top}" width="${x(years[i + 1]) - x(y)}" height="${h}" fill="${i % 2 ? "#F4E7C8" : "#FBF3DC"}" stroke="#8A6A3E" stroke-width="1.2"/>`).join("");
  const ticks = years.map((y) => `<line x1="${x(y)}" y1="${top + h}" x2="${x(y)}" y2="${top + h + 6}" stroke="#8A6A3E" stroke-width="1.4"/>
    <text x="${x(y)}" y="${top + h + 20}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#5B6570" font-family="Pretendard, sans-serif">${-y}</text>`).join("");
  const evts: { y: number; label: string; up: boolean }[] = [
    { y: -3500, label: "메소포타미아 문명", up: true },
    { y: -3000, label: "이집트 문명", up: false },
    { y: -2500, label: "인도·중국 문명", up: true },
  ];
  const evtEls = evts.map((e) => {
    const ex = x(e.y);
    const ly = e.up ? top - 14 : top + h + 38;
    return `<circle cx="${ex}" cy="${top + h / 2}" r="5.5" fill="#0E7C8A" stroke="#073E46" stroke-width="1.6"/>
      <line x1="${ex}" y1="${e.up ? ly + 4 : top + h}" x2="${ex}" y2="${e.up ? top : ly - 10}" stroke="#0E7C8A" stroke-width="1.2" stroke-dasharray="2 3"/>
      <text x="${ex}" y="${ly}" text-anchor="middle" font-size="11" font-weight="900" fill="#0A5964" font-family="Pretendard, sans-serif">${e.label}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} 186" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="기원전 4000년부터 기원전 1500년까지를 500년 칸으로 나눈 연표 띠에 네 문명의 시작 시점이 점으로 찍혀 있는 그림">
    <rect x="0" y="0" width="${W}" height="186" rx="16" fill="#F7FAFC"/>
    <rect x="${L}" y="${top - 46}" width="${W - L - R}" height="18" rx="6" fill="rgba(168,122,62,.18)"/>
    <text x="${W / 2}" y="${top - 33}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">모두 기원전 — 한 칸이 500년!</text>
    ${cells}${ticks}${evtEls}
    <text x="${W - R}" y="${top + h + 34}" text-anchor="end" font-size="9" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">(연도 단위: 년)</text>
  </svg>`;
}

/* ---------- 4대 문명 지도(파라미터형) ----------
   단순화한 아프리카·유라시아 해안선 + 큰 강 4곳. hotspot 무대(labels=false)와
   퀴즈 (가)~(라) 지목(marks=true)을 겸한다 — 라벨형 (가)(나) 문제는 shuffle:false 규약. */
export function fourRiversFig(o?: { marks?: boolean; labels?: boolean }): string {
  const marks = o?.marks ?? false;
  const labels = o?.labels ?? false;
  const name = (x: number, y: number, t: string): string =>
    labels ? `<text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" font-weight="900" fill="#0A5964" font-family="Pretendard, sans-serif">${t}</text>` : "";
  const mk = (x: number, y: number, t: string): string =>
    marks ? `<circle cx="${x}" cy="${y}" r="10" fill="#FBF0DA" stroke="#C2843A" stroke-width="1.8"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">${t}</text>` : "";
  // 해안선 검산 메모(시각 감사 재발 방지): 아프리카 서쪽 불룩·기니만 홈·희망봉·아프리카의 뿔(152,128) →
  // 수에즈(140,70)로 아시아와 연결, 홍해 사선 슬릿이 아라비아 반도(아덴 뾰족 174,138)를 가르고,
  // 페르시아만 홈(206,104) 위가 메소포타미아 스팟(196,92), 인도 반도 삼각형 끝(262,186),
  // 벵골만 홈 → 동남아 꼬리(310,168) → 중국 해안 → 황해 홈(354,96) → 북동 대륙. 유럽은 좌상단 부분만.
  return `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="아프리카와 유라시아를 단순하게 그린 지도 위에 네 개의 큰 강 유역이 표시된 그림">
    <rect x="0" y="0" width="400" height="220" rx="16" fill="#DCEFF6"/>
    <path d="M20 10 L104 10 L118 26 L112 40 L84 48 L56 44 L34 46 L20 32 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M394 12 L394 44 L380 66 L368 88 L358 92 L354 104 L344 116 L330 126 L318 142 L314 168 L304 172 L300 156 L296 138 L286 128 L282 146 L272 170 L262 186 L252 168 L246 140 L240 122 L232 112 L222 108 L214 110 L206 104 L198 96 L190 100 L182 112 L174 138 L162 118 L150 98 L144 82 L140 70 L134 62 L126 60 L116 64 L106 62 L96 66 L84 62 L70 66 L54 74 L42 88 L34 106 L30 128 L36 146 L48 152 L60 148 L72 156 L84 176 L92 196 L100 208 L110 200 L114 178 L118 156 L126 142 L136 134 L146 132 L152 128 L148 116 L144 100 L148 88 L154 78 L160 72 L168 66 L178 60 L190 54 L204 50 L220 44 L238 38 L256 30 L276 24 L298 18 L322 14 L348 10 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M356 100 L366 106 L364 116 L356 112 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M98 145 L100 118 L102 92 L104 62" stroke="#3FA3AE" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M178 72 Q186 86 200 98 M190 64 Q196 82 206 98" stroke="#3FA3AE" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M240 84 Q244 102 250 118" stroke="#3FA3AE" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M316 74 Q334 70 340 82 Q332 90 344 94 L352 98" stroke="#3FA3AE" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    ${name(86, 158, "나일강")}${name(193, 130, "티그리스·유프라테스강")}${name(252, 200, "인더스강")}${name(310, 62, "황허강")}
    ${mk(100, 76, "(가)")}${mk(194, 84, "(나)")}${mk(262, 150, "(다)")}${mk(346, 84, "(라)")}
  </svg>`;
}

/* ---------- 카스트제 4단 피라미드(파라미터형) ----------
   hide에 준 인덱스(0=브라만 … 3=수드라)는 ㉠으로 가린다(그 신분 이름을 묻는 문제용 — 유출 방지). */
export function casteFig(o?: { hide?: number }): string {
  const rows = [
    { name: "브라만", role: "제사 의식 담당", w: 96, color: "#E8D4A4" },
    { name: "크샤트리아", role: "정치·군사 담당", w: 160, color: "#EFDDB8" },
    { name: "바이샤", role: "농업·상업 등 생산 담당", w: 224, color: "#F5E7CB" },
    { name: "수드라", role: "정복당한 민족·주로 노예", w: 288, color: "#FBF1DC" },
  ];
  const els = rows.map((r, i) => {
    const y = 30 + i * 40;
    const x = (400 - r.w) / 2;
    const hidden = o?.hide === i;
    const label = hidden
      ? `<text x="200" y="${y + 20}" text-anchor="middle" font-size="15" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">㉠</text>`
      : `<text x="200" y="${y + 17}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">${r.name}</text>
         <text x="200" y="${y + 31}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8F5A1D" font-family="Pretendard, sans-serif">${r.role}</text>`;
    return `<rect x="${x}" y="${y}" width="${r.w}" height="36" rx="7" fill="${hidden ? "#FBF0DA" : r.color}" stroke="${hidden ? "#C2843A" : "#8A6A3E"}" stroke-width="1.6"/>${label}`;
  }).join("");
  return `<svg viewBox="0 0 400 210" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="위로 갈수록 좁아지는 네 단의 신분 피라미드 그림. 일부 칸은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="400" height="210" rx="16" fill="#F7FAFC"/>
    <path d="M200 12 l-150 186 M200 12 l150 186" stroke="#D9CBAA" stroke-width="1.6" stroke-dasharray="4 5"/>
    ${els}
    <text x="200" y="204" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">위로 갈수록 지위가 높다</text>
  </svg>`;
}

/* ---------- 로마 정치 변천 순서도(파라미터형) ----------
   hide 인덱스 칸은 ㉠으로 가린다(tamguFlowFig 계보 — 단계 이름을 묻는 문제용). */
export function romeFlowFig(o?: { hide?: number }): string {
  const steps = [
    { name: "왕정", sub: "왕이 다스림" },
    { name: "공화정", sub: "집정관·원로원·민회" },
    { name: "평민권 확대", sub: "호민관·평민회" },
    { name: "제정", sub: "황제가 다스림" },
  ];
  const W = 400;
  const bw = 84;
  const gap = (W - 24 - bw * 4) / 3;
  const boxes = steps.map((s, i) => {
    const x = 12 + i * (bw + gap);
    const hidden = o?.hide === i;
    const label = hidden
      ? `<text x="${x + bw / 2}" y="82" text-anchor="middle" font-size="16" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">㉠</text>`
      : `<text x="${x + bw / 2}" y="76" text-anchor="middle" font-size="12.5" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">${s.name}</text>
         <text x="${x + bw / 2}" y="92" text-anchor="middle" font-size="8.6" font-weight="700" fill="#5B6570" font-family="Pretendard, sans-serif">${s.sub}</text>`;
    const arrow = i < 3 ? `<path d="M${x + bw + 4} 72 h${gap - 9} m-6 -5 l6 5 -6 5" stroke="#8B95A1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : "";
    return `<rect x="${x}" y="46" width="${bw}" height="58" rx="10" fill="${hidden ? "#FBF0DA" : "#FFFFFF"}" stroke="${hidden ? "#C2843A" : "#B9C4D4"}" stroke-width="1.8"/>${label}${arrow}
      <circle cx="${x + 12}" cy="56" r="7" fill="#33405A"/><text x="${x + 12}" y="59.4" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif">${i + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} 124" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="로마의 정치 체제가 차례로 바뀌는 과정을 나타낸 순서도. 일부 칸은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="${W}" height="124" rx="16" fill="#F7FAFC"/>
    ${boxes}
  </svg>`;
}

/* ---------- 제자백가 4학파 카드(파라미터형) ----------
   names=true면 학파 이름을 인쇄(개념·recap 전용). 퀴즈용 기본판은 ㉮~㉱ 기호만 —
   주장 문구를 읽고 학파를 고르는 문제에 학파명이 유출되지 않게 한다. */
export function jejaFig(o?: { names?: boolean }): string {
  const cards = [
    { name: "유가", tag: "㉮", claim: "인과 예로 도덕 정치를", icon: `<path d="M-9 8 q9 -12 18 0 M0 -10 v10" stroke="#3D5BC0" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="0" cy="-13" r="3.4" fill="none" stroke="#3D5BC0" stroke-width="2.2"/>` },
    { name: "도가", tag: "㉯", claim: "자연의 순리를 따르자", icon: `<path d="M-11 2 q5 -8 11 0 t11 0 M-11 -6 q5 -8 11 0" stroke="#0E7C8A" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="8" cy="-9" r="2.6" fill="#0E7C8A"/>` },
    { name: "묵가", tag: "㉰", claim: "차별 없는 사랑과 평화", icon: `<path d="M0 8 q-12 -8 -8 -16 q3 -6 8 -1 q5 -5 8 1 q4 8 -8 16 z" fill="none" stroke="#C2843A" stroke-width="2.4" stroke-linejoin="round"/>` },
    { name: "법가", tag: "㉱", claim: "엄격한 법으로 질서를", icon: `<path d="M0 -12 v22 M-10 -8 h20 M-10 -8 l-4 8 q4 4 8 0 z M10 -8 l4 8 q-4 4 -8 0 z" stroke="#5C677D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` },
  ];
  const els = cards.map((c, i) => {
    const x = 12 + (i % 2) * 194;
    const y = 12 + Math.floor(i / 2) * 92;
    return `<rect x="${x}" y="${y}" width="182" height="80" rx="12" fill="#FFFFFF" stroke="#B9C4D4" stroke-width="1.8"/>
      <g transform="translate(${x + 30} ${y + 40})">${c.icon}</g>
      <text x="${x + 62}" y="${y + 34}" font-size="13" font-weight="900" fill="${o?.names ? "#33405A" : "#8F5A1D"}" font-family="Pretendard, sans-serif">${o?.names ? c.name : c.tag}</text>
      <text x="${x + 62}" y="${y + 54}" font-size="10.5" font-weight="700" fill="#5B6570" font-family="Pretendard, sans-serif">${c.claim}</text>`;
  }).join("");
  return `<svg viewBox="0 0 400 196" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="네 학파의 주장을 적은 카드 네 장. 학파 이름은 동그라미 기호로 표시되어 있을 수 있다">
    <rect x="0" y="0" width="400" height="196" rx="16" fill="#F7FAFC"/>
    ${els}
  </svg>`;
}

/* ---------- 비단길 개념도(정적) ---------- */
export function silkroadFig(): string {
  return `<svg viewBox="0 0 400 190" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="서쪽 도시와 동쪽 도시를 잇는 긴 길 위로 상인과 낙타가 오가고, 양쪽에서 물건이 반대 방향으로 이동하는 그림">
    <defs>
      <linearGradient id="hf-dune" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5E7C8"/><stop offset="1" stop-color="#E2C894"/></linearGradient>
      <linearGradient id="hf-sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE8F2"/><stop offset="1" stop-color="#F2EDDA"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="400" height="190" rx="16" fill="url(#hf-sky2)"/>
    <path d="M0 128 q60 -22 120 -8 q80 18 160 -4 q60 -14 120 4 l0 70 h-400 z" fill="url(#hf-dune)"/>
    <path d="M28 138 q90 -22 172 -6 q90 16 174 -10" stroke="#B99B66" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 10" fill="none"/>
    <g stroke="#4E6078" stroke-width="2" fill="#E4EAF2">
      <path d="M18 96 h44 v30 h-44 z M22 96 v-8 h8 v8 M40 96 v-12 h10 v12" stroke-linejoin="round"/>
      <path d="M24 106 a8 8 0 0 1 14 0 z M42 106 a8 8 0 0 1 14 0 z" fill="#F7FAFC"/>
    </g>
    <text x="40" y="142" text-anchor="middle" font-size="10.5" font-weight="900" fill="#5B6570" font-family="Pretendard, sans-serif">로마</text>
    <g stroke="#8A5A26" stroke-width="2" fill="#F2D9A4">
      <path d="M338 92 h46 v34 h-46 z" stroke-linejoin="round"/>
      <path d="M334 92 h54 l-6 -10 h-42 z" fill="#C89A5E"/>
      <rect x="356" y="108" width="12" height="18" fill="#8A5A26"/>
    </g>
    <text x="362" y="142" text-anchor="middle" font-size="10.5" font-weight="900" fill="#5B6570" font-family="Pretendard, sans-serif">장안</text>
    <g stroke="#6E4E26" stroke-width="2" fill="#C9A05E">
      <path d="M196 118 q6 -12 16 -12 q6 -8 12 0 q10 0 14 12 l-4 14 h-6 l-2 -8 h-16 l-2 8 h-6 z" stroke-linejoin="round"/>
      <circle cx="230" cy="104" r="4" fill="#C9A05E"/>
    </g>
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <circle cx="182" cy="106" r="7" fill="#FFE8CE"/>
      <path d="M182 113 v16 M182 118 l-8 5 M182 118 l8 4 M182 129 l-6 10 M182 129 l6 10"/>
    </g>
    <rect x="188" y="112" width="16" height="7" rx="2" fill="#0E7C8A" transform="rotate(-14 196 115)"/>
    <path d="M150 70 h-92 m8 -6 l-8 6 8 6" stroke="#0E7C8A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="104" y="58" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0A5964" font-family="Pretendard, sans-serif">비단</text>
    <path d="M250 70 h92 m-8 -6 l8 6 -8 6" stroke="#C2843A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="296" y="58" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8F5A1D" font-family="Pretendard, sans-serif">포도·석류·호두, 불교</text>
  </svg>`;
}

/* ══════════ Ⅲ. 세계 종교의 확산과 지역 문화의 발전 ══════════ */

/* ---------- 세계 종교 유산 지도(파라미터형 — Ⅲ 기함 hotspot 무대) ----------
   fourRiversFig의 검산된 해안선을 계승하되 유럽을 실제 반도꼴로 확장(이베리아·이탈리아 장화·발칸).
   다섯 유산 자리에 미니 건물 글리프만 그린다(이름은 hotspot 스팟/문제 보기 몫 — aria에도 정답 유출 금지).
   marks=true면 (가)~(마) 기호를 인쇄(라벨형 문제는 shuffle:false 규약).
   글리프 검산 메모: 샤르트르(52,26 북프랑스)·코르도바(24,52 이베리아 남부)·콘스탄티노폴리스(120,52
   발칸 동남끝)·룽먼(330,72 황허 중류 남쪽)·앙코르(310,148 동남아 반도) — 좌표는 아래 해안선 기준. */
export function worldReligionsFig(o?: { marks?: boolean }): string {
  const mk = (x: number, y: number, t: string): string =>
    o?.marks ? `<circle cx="${x}" cy="${y}" r="10" fill="#FBF0DA" stroke="#C2843A" stroke-width="1.8"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">${t}</text>` : "";
  return `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="유럽과 아프리카, 아시아를 단순하게 그린 지도 위 다섯 곳에 서로 다른 종교 건축물이 작게 그려진 그림">
    <rect x="0" y="0" width="400" height="220" rx="16" fill="#DCEFF6"/>
    <path d="M10 64 L16 44 L28 34 L20 22 L34 10 L74 10 L96 20 L112 14 L134 22 L128 36 L112 40 L120 50 L132 46 L142 52 L134 60 L118 58 L108 66 L96 60 L84 68 L96 44 L76 40 L62 48 L66 60 L54 66 L40 58 L30 64 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M394 12 L394 44 L380 66 L368 88 L358 92 L354 104 L344 116 L330 126 L318 142 L314 168 L304 172 L300 156 L296 138 L286 128 L282 146 L272 170 L262 186 L252 168 L246 140 L240 122 L232 112 L222 108 L214 110 L206 104 L198 96 L190 100 L182 112 L174 138 L162 118 L150 98 L144 82 L140 70 L134 62 L126 60 L116 64 L106 62 L96 66 L84 62 L70 66 L54 74 L42 88 L34 106 L30 128 L36 146 L48 152 L60 148 L72 156 L84 176 L92 196 L100 208 L110 200 L114 178 L118 156 L126 142 L136 134 L146 132 L152 128 L148 116 L144 100 L148 88 L154 78 L160 72 L168 66 L178 60 L190 54 L204 50 L220 44 L238 38 L256 30 L276 24 L298 18 L322 14 L348 10 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <g stroke="#6E5426" stroke-width="1.5" stroke-linejoin="round">
      <path d="M44 32 l8 -9 8 9 z M49 32 h6 v7 h-6 z" fill="#E4EAF2"/>
      <path d="M16 56 h16 v-6 h-16 z M19 50 a5 5 0 0 1 10 0 z" fill="#F2D9A4"/>
      <path d="M112 56 h16 M114 56 v-5 a6 6 0 0 1 12 0 v5 M111 51 v-8 M129 51 v-8" fill="#E4EAF2"/>
      <path d="M322 78 h16 v-6 h-16 z M325 72 v-5 h10 v5 M328 67 v-4 h4 v4" fill="#C9B48A"/>
      <path d="M302 154 l8 -12 8 12 z M306 146 l4 -7 4 7" fill="#C9A05E"/>
    </g>
    ${mk(70, 22, "(가)")}${mk(28, 74, "(나)")}${mk(134, 74, "(다)")}${mk(348, 66, "(라)")}${mk(334, 156, "(마)")}
  </svg>`;
}

/* ---------- 봉건제 구조도(파라미터형) ----------
   casteFig 계보의 4단 + 주종 계약 쌍방향 화살표(왼쪽 내려가는 토지, 오른쪽 올라가는 충성)가 심장.
   hide 인덱스(0=왕 … 3=농노)는 ㉠으로 가린다. 성직자("기도하는 자")는 오른쪽 별동 카드. */
export function feudalFig(o?: { hide?: number }): string {
  const rows = [
    { name: "왕", role: "가장 높은 주군", w: 88 },
    { name: "제후", role: "왕의 봉신 · 기사의 주군", w: 152 },
    { name: "기사", role: "장원을 다스리는 영주", w: 216 },
    { name: "농노", role: "장원의 농민", w: 280 },
  ];
  const cx = 172;
  const els = rows.map((r, i) => {
    const y = 26 + i * 44;
    const x = cx - r.w / 2;
    const hidden = o?.hide === i;
    const label = hidden
      ? `<text x="${cx}" y="${y + 21}" text-anchor="middle" font-size="15" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">㉠</text>`
      : `<text x="${cx}" y="${y + 16}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">${r.name}</text>
         <text x="${cx}" y="${y + 30}" text-anchor="middle" font-size="9" font-weight="700" fill="#8F5A1D" font-family="Pretendard, sans-serif">${r.role}</text>`;
    return `<rect x="${x}" y="${y}" width="${r.w}" height="36" rx="7" fill="${hidden ? "#FBF0DA" : ["#E8D4A4", "#EFDDB8", "#F5E7CB", "#FBF1DC"][i]}" stroke="${hidden ? "#C2843A" : "#8A6A3E"}" stroke-width="1.6"/>${label}`;
  }).join("");
  return `<svg viewBox="0 0 400 216" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="위로 갈수록 좁아지는 네 단의 피라미드 양옆으로 내려가는 화살표와 올라가는 화살표가 그려진 구조도. 일부 칸은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="400" height="216" rx="16" fill="#F7FAFC"/>
    ${els}
    <path d="M52 40 q-16 52 0 104 m-5 -8 l5 8 6 -7" stroke="#3D5BC0" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="34" y="86" text-anchor="middle" font-size="9.5" font-weight="800" fill="#3D5BC0" font-family="Pretendard, sans-serif">보호와</text>
    <text x="34" y="98" text-anchor="middle" font-size="9.5" font-weight="800" fill="#3D5BC0" font-family="Pretendard, sans-serif">토지(봉토)</text>
    <path d="M292 144 q16 -52 0 -104 m-6 8 l6 -8 5 8" stroke="#C2843A" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="312" y="86" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8F5A1D" font-family="Pretendard, sans-serif">충성과</text>
    <text x="312" y="98" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8F5A1D" font-family="Pretendard, sans-serif">군사 봉사</text>
    <rect x="330" y="140" width="62" height="40" rx="8" fill="#FFFFFF" stroke="#B9C4D4" stroke-width="1.6"/>
    <text x="361" y="157" text-anchor="middle" font-size="10.5" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">성직자</text>
    <text x="361" y="171" text-anchor="middle" font-size="8.6" font-weight="700" fill="#5B6570" font-family="Pretendard, sans-serif">기도하는 자</text>
    <text x="172" y="206" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">주종 관계는 서로 의무를 지키는 계약!</text>
  </svg>`;
}

/* ---------- 당 3성 6부 구조도(파라미터형) ----------
   중서성(정책 수립)→문하성(심의)→상서성(집행) 순서 화살표 + 상서성 아래 6부.
   hide 인덱스(0=중서성 1=문하성 2=상서성)는 ㉠으로 가린다(성 이름을 묻는 문제용). */
export function threeSixFig(o?: { hide?: number }): string {
  const seong = [
    { name: "중서성", sub: "정책 수립" },
    { name: "문하성", sub: "정책 심의" },
    { name: "상서성", sub: "정책 집행" },
  ];
  const bw = 104;
  const gap = 26;
  const x0 = (400 - bw * 3 - gap * 2) / 2;
  const boxes = seong.map((s, i) => {
    const x = x0 + i * (bw + gap);
    const hidden = o?.hide === i;
    const label = hidden
      ? `<text x="${x + bw / 2}" y="90" text-anchor="middle" font-size="16" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">㉠</text>`
      : `<text x="${x + bw / 2}" y="84" text-anchor="middle" font-size="12.5" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">${s.name}</text>
         <text x="${x + bw / 2}" y="100" text-anchor="middle" font-size="9" font-weight="700" fill="#5B6570" font-family="Pretendard, sans-serif">${s.sub}</text>`;
    const arrow = i < 2 ? `<path d="M${x + bw + 4} 82 h${gap - 9} m-6 -5 l6 5 -6 5" stroke="#8B95A1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : "";
    return `<rect x="${x}" y="58" width="${bw}" height="52" rx="10" fill="${hidden ? "#FBF0DA" : "#FFFFFF"}" stroke="${hidden ? "#C2843A" : "#B9C4D4"}" stroke-width="1.8"/>${label}${arrow}`;
  }).join("");
  const bu = ["이부", "호부", "예부", "병부", "형부", "공부"];
  const bw2 = 52;
  const bx0 = (400 - bw2 * 6 - 10 * 5) / 2;
  const buEls = bu.map((b, i) => {
    const x = bx0 + i * (bw2 + 10);
    return `<rect x="${x}" y="150" width="${bw2}" height="30" rx="7" fill="#F5EFE2" stroke="#C4B28E" stroke-width="1.4"/>
      <text x="${x + bw2 / 2}" y="169" text-anchor="middle" font-size="11" font-weight="800" fill="#5E4626" font-family="Pretendard, sans-serif">${b}</text>`;
  }).join("");
  return `<svg viewBox="0 0 400 196" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="황제 아래 세 개의 성이 화살표로 이어지고 마지막 성 아래에 여섯 개의 부가 달린 구조도. 일부 칸은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="400" height="196" rx="16" fill="#F7FAFC"/>
    <rect x="164" y="12" width="72" height="30" rx="9" fill="#33405A"/>
    <text x="200" y="32" text-anchor="middle" font-size="12.5" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif">황제</text>
    <path d="M200 42 v12 m-5 -6 l5 6 5 -6" stroke="#8B95A1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${boxes}
    <path d="M${x0 + bw * 2 + gap * 2 + bw / 2} 110 v14 M${bx0 + bw2 / 2} 138 h${bw2 * 6 + 50 - bw2} M${bx0 + bw2 / 2} 138 v6 m${bw2 + 10} -6 v6 m${bw2 + 10} -6 v6 m${bw2 + 10} -6 v6 m${bw2 + 10} -6 v6 m${bw2 + 10} -6 v6" stroke="#C4B28E" stroke-width="1.6" fill="none"/>
    ${buEls}
  </svg>`;
}

/* ---------- 동아시아 문화권 지도(파라미터형) ----------
   당·발해·신라·일본 + 사신(견당사) 왕래 화살표 + 공통 요소 4칩. labels=false면 나라 이름 대신
   (가)~(라) 기호(그 나라를 묻는 문제용 — 라벨형은 shuffle:false).
   해안 검산 메모: 대륙 동해안(190,16)→산둥(216,58)→황해 홈(196,84)→남해안(150,170), 한반도는
   (232,44)에서 남쪽 꼬리(246,118), 일본 열도는 (300,74)~(346,132) 사선 호. */
export function eastAsiaFig(o?: { labels?: boolean }): string {
  const lab = o?.labels ?? true;
  const name = (x: number, y: number, t: string, tag: string): string =>
    lab
      ? `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">${t}</text>`
      : `<circle cx="${x}" cy="${y - 4}" r="10" fill="#FBF0DA" stroke="#C2843A" stroke-width="1.8"/><text x="${x}" y="${y}" text-anchor="middle" font-size="11" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">${tag}</text>`;
  return `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="동아시아의 네 나라 사이를 화살표가 오가고 아래에 네 개의 공통 요소 칩이 놓인 지도">
    <rect x="0" y="0" width="400" height="220" rx="16" fill="#DCEFF6"/>
    <path d="M8 10 L190 16 L204 40 L216 58 L206 72 L196 84 L200 102 L192 122 L178 138 L164 154 L150 170 L128 178 L102 172 L84 178 L60 172 L36 176 L8 170 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M204 40 L232 44 L252 40 L262 52 L256 66 L250 82 L252 98 L246 118 L234 122 L224 110 L218 92 L214 72 L206 72 L216 58 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M262 52 L282 40 L302 34 L312 44 L298 54 L278 58 z" fill="#EFE6D2" stroke="#C4B28E" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M300 74 L316 66 L330 74 L322 86 L306 86 z M312 92 L336 84 L352 94 L340 110 L318 104 z M336 116 L352 108 L360 120 L348 132 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M236 90 q-24 4 -44 0 m7 -4 l-7 4 7 4" stroke="#0E7C8A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5 4"/>
    <path d="M318 96 q-40 20 -110 26 m8 -5 l-8 5 9 3" stroke="#0E7C8A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5 4"/>
    <path d="M282 52 q-30 -6 -66 -2 m8 -4 l-8 4 8 4" stroke="#0E7C8A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5 4"/>
    ${name(120, 96, "당", "(가)")}${name(284, 30, "발해", "(나)")}${name(238, 76, "신라", "(다)")}${name(342, 146, "일본", "(라)")}
    ${lab ? `<text x="196" y="130" text-anchor="middle" font-size="8.6" font-weight="700" fill="#0A5964" font-family="Pretendard, sans-serif">사신 · 유학생 · 승려</text>` : ""}
    <g font-family="Pretendard, sans-serif" font-size="10.5" font-weight="900" text-anchor="middle">
      <rect x="24" y="186" width="80" height="24" rx="12" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="1.4"/><text x="64" y="202" fill="#5E4626">한자</text>
      <rect x="116" y="186" width="80" height="24" rx="12" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="1.4"/><text x="156" y="202" fill="#0A5964">유교</text>
      <rect x="208" y="186" width="80" height="24" rx="12" fill="#EDEAFA" stroke="#5B4AC0" stroke-width="1.4"/><text x="248" y="202" fill="#3D2E86">율령</text>
      <rect x="300" y="186" width="80" height="24" rx="12" fill="#FBEFDA" stroke="#C2843A" stroke-width="1.4"/><text x="340" y="202" fill="#8F5A1D">불교</text>
    </g>
  </svg>`;
}

/* ---------- 이슬람 세계 변천 흐름(파라미터형) ----------
   본류 4칸(무함마드 시대→정통 칼리프→우마이야→아바스) + 아래 갈래 3칸(후우마이야·파티마·셀주크).
   hide 인덱스(본류 0~3)는 ㉠으로 가린다(romeFlowFig 계보). */
export function islamFlowFig(o?: { hide?: number }): string {
  const steps = [
    { name: "무함마드 시대", sub: "이슬람교 성립" },
    { name: "정통 칼리프", sub: "칼리프를 선출" },
    { name: "우마이야 왕조", sub: "칼리프 세습" },
    { name: "아바스 왕조", sub: "차별 정책 폐지" },
  ];
  const W = 400;
  const bw = 88;
  const gap = (W - 24 - bw * 4) / 3;
  const boxes = steps.map((s, i) => {
    const x = 12 + i * (bw + gap);
    const hidden = o?.hide === i;
    const label = hidden
      ? `<text x="${x + bw / 2}" y="60" text-anchor="middle" font-size="16" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">㉠</text>`
      : `<text x="${x + bw / 2}" y="54" text-anchor="middle" font-size="11" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">${s.name}</text>
         <text x="${x + bw / 2}" y="70" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5B6570" font-family="Pretendard, sans-serif">${s.sub}</text>`;
    const arrow = i < 3 ? `<path d="M${x + bw + 4} 52 h${gap - 9} m-6 -5 l6 5 -6 5" stroke="#8B95A1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : "";
    return `<rect x="${x}" y="26" width="${bw}" height="56" rx="10" fill="${hidden ? "#FBF0DA" : "#FFFFFF"}" stroke="${hidden ? "#C2843A" : "#B9C4D4"}" stroke-width="1.8"/>${label}${arrow}
      <circle cx="${x + 12}" cy="36" r="7" fill="#0E7C8A"/><text x="${x + 12}" y="39.4" text-anchor="middle" font-size="9" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif">${i + 1}</text>`;
  }).join("");
  const branches = [
    { name: "후우마이야 왕조", sub: "이베리아반도" },
    { name: "파티마 왕조", sub: "북아프리카" },
    { name: "셀주크 튀르크", sub: "지배자가 술탄 칭호" },
  ];
  const bw2 = 118;
  const bx0 = (W - bw2 * 3 - 14 * 2) / 2;
  const brEls = branches.map((b, i) => {
    const x = bx0 + i * (bw2 + 14);
    return `<rect x="${x}" y="128" width="${bw2}" height="46" rx="9" fill="#F5EFE2" stroke="#C4B28E" stroke-width="1.5"/>
      <text x="${x + bw2 / 2}" y="148" text-anchor="middle" font-size="10.5" font-weight="900" fill="#5E4626" font-family="Pretendard, sans-serif">${b.name}</text>
      <text x="${x + bw2 / 2}" y="164" text-anchor="middle" font-size="8.4" font-weight="700" fill="#8F5A1D" font-family="Pretendard, sans-serif">${b.sub}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} 188" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="이슬람 세계가 차례로 이어지는 네 칸의 순서도와 그 아래에 갈라져 나온 세 칸. 일부 칸은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="${W}" height="188" rx="16" fill="#F7FAFC"/>
    ${boxes}
    <path d="M200 88 v14 M${bx0 + bw2 / 2} 116 h${bw2 * 2 + 28} M${bx0 + bw2 / 2} 116 v8 m${bw2 + 14} -8 v8 m${bw2 + 14} -8 v8" stroke="#C4B28E" stroke-width="1.6" fill="none"/>
    ${brEls}
    <text x="200" y="16" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">이슬람 세계의 변천</text>
  </svg>`;
}

/* ══════════ Ⅳ. 지역 세계의 교류와 변화 ══════════ */

/* ---------- 송과 북방 민족의 관계(파라미터형) ----------
   가운데 송, 북쪽 요·서북 서하 카드 + 송에서 올라가는 "비단·은(물자)" 화살표(세폐 관계).
   hide: "yo" | "seoha" | "song"이면 그 카드를 ㉠으로 가린다(나라 이름을 묻는 문제용). */
export function songPressFig(o?: { hide?: "yo" | "seoha" | "song" }): string {
  const name = (key: "yo" | "seoha" | "song", x: number, y: number, t: string, sub: string): string =>
    o?.hide === key
      ? `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="16" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">㉠</text>`
      : `<text x="${x}" y="${y}" text-anchor="middle" font-size="13" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">${t}</text>
         <text x="${x}" y="${y + 15}" text-anchor="middle" font-size="8.8" font-weight="700" fill="#8F5A1D" font-family="Pretendard, sans-serif">${sub}</text>`;
  const box = (key: "yo" | "seoha" | "song", x: number, y: number, w: number): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="46" rx="10" fill="${o?.hide === key ? "#FBF0DA" : "#FFFFFF"}" stroke="${o?.hide === key ? "#C2843A" : "#B9C4D4"}" stroke-width="1.8"/>`;
  return `<svg viewBox="0 0 400 210" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="가운데 나라에서 위쪽의 두 나라로 물자 화살표가 올라가는 관계도. 일부 칸은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="400" height="210" rx="16" fill="#F7FAFC"/>
    <text x="200" y="20" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">지나친 문치주의 → 군사력 약화 → 물자로 지킨 평화</text>
    ${box("yo", 236, 34, 120)}${name("yo", 296, 54, "요(거란)", "발해를 멸망시킴 · 송과 대립")}
    ${box("seoha", 44, 34, 120)}${name("seoha", 104, 54, "서하(탕구트)", "비단길 무역의 이익 차지")}
    ${box("song", 140, 140, 120)}${name("song", 200, 160, "송", "문치주의의 나라")}
    <path d="M172 136 Q 128 110 108 86 m2 10 l-2 -10 10 3" stroke="#C2843A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M228 136 Q 272 110 292 86 m-2 10 l2 -10 -10 3" stroke="#C2843A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="142" y="96" width="116" height="22" rx="11" fill="#FBEFDA" stroke="#C2843A" stroke-width="1.6"/>
    <text x="200" y="111" text-anchor="middle" font-size="10.5" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">비단 · 은 등 물자</text>
    <text x="200" y="200" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">평화의 값은 송의 재정을 무겁게 했어요</text>
  </svg>`;
}

/* ---------- 원의 사회 구성(파라미터형) ----------
   casteFig·feudalFig 계보의 4단 + 지배/피지배 브래킷. hide 인덱스(0=몽골인 … 3=남인)는 ㉠으로
   가린다(그 계층 이름을 묻는 문제용 — aria에도 계층 이름 대신 중립 문구만). */
export function yuanClassFig(o?: { hide?: number }): string {
  const rows = [
    { name: "몽골인", role: "주요 관직 차지", w: 96 },
    { name: "색목인", role: "주로 재정 업무 담당 · 서역 출신", w: 168 },
    { name: "한인", role: "하급 관리 · 생산 활동(금의 지배를 받던 한족 등)", w: 240 },
    { name: "남인", role: "생산 활동 담당(남송 출신의 한족)", w: 300 },
  ];
  const cx = 186;
  const els = rows.map((r, i) => {
    const y = 22 + i * 44;
    const x = cx - r.w / 2;
    const hidden = o?.hide === i;
    const label = hidden
      ? `<text x="${cx}" y="${y + 22}" text-anchor="middle" font-size="15" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">㉠</text>`
      : `<text x="${cx}" y="${y + 16}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">${r.name}</text>
         <text x="${cx}" y="${y + 30}" text-anchor="middle" font-size="8.6" font-weight="700" fill="#8F5A1D" font-family="Pretendard, sans-serif">${r.role}</text>`;
    return `<rect x="${x}" y="${y}" width="${r.w}" height="36" rx="7" fill="${hidden ? "#FBF0DA" : ["#E8D4A4", "#EFDDB8", "#F5E7CB", "#FBF1DC"][i]}" stroke="${hidden ? "#C2843A" : "#8A6A3E"}" stroke-width="1.6"/>${label}`;
  }).join("");
  return `<svg viewBox="0 0 400 216" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="위로 갈수록 좁아지는 네 단의 계층 구조도. 위 두 단과 아래 두 단이 묶여 있고, 일부 칸은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="400" height="216" rx="16" fill="#F7FAFC"/>
    ${els}
    <path d="M352 26 v72 M348 26 h8 M348 98 h8" stroke="#0E7C8A" stroke-width="2" fill="none"/>
    <text x="366" y="56" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0A5964" font-family="Pretendard, sans-serif">지배</text>
    <text x="366" y="68" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0A5964" font-family="Pretendard, sans-serif">계층</text>
    <path d="M352 110 v72 M348 110 h8 M348 182 h8" stroke="#C2843A" stroke-width="2" fill="none"/>
    <text x="368" y="140" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8F5A1D" font-family="Pretendard, sans-serif">피지배</text>
    <text x="368" y="152" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8F5A1D" font-family="Pretendard, sans-serif">계층</text>
    <text x="186" y="206" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">실무에 능한 사람은 출신과 상관없이 등용했어요</text>
  </svg>`;
}

/* ---------- 일본 막부의 봉건제(파라미터형) ----------
   쇼군→다이묘→사무라이 3단 + 내려가는 보호·토지, 올라가는 충성·복종(feudalFig 계보).
   hide 인덱스(0=쇼군 1=다이묘 2=사무라이)는 ㉠으로 가린다. 천황은 오른쪽 별동 카드(형식상의 지위). */
export function bakufuFig(o?: { hide?: number }): string {
  const rows = [
    { name: "쇼군", role: "막부의 우두머리 · 실질적 지배자", w: 104 },
    { name: "다이묘", role: "번(영지)을 다스리는 영주", w: 180 },
    { name: "사무라이", role: "하급 무사", w: 256 },
  ];
  const cx = 172;
  const els = rows.map((r, i) => {
    const y = 34 + i * 52;
    const x = cx - r.w / 2;
    const hidden = o?.hide === i;
    const label = hidden
      ? `<text x="${cx}" y="${y + 24}" text-anchor="middle" font-size="15" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">㉠</text>`
      : `<text x="${cx}" y="${y + 18}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">${r.name}</text>
         <text x="${cx}" y="${y + 32}" text-anchor="middle" font-size="8.8" font-weight="700" fill="#8F5A1D" font-family="Pretendard, sans-serif">${r.role}</text>`;
    return `<rect x="${x}" y="${y}" width="${r.w}" height="40" rx="8" fill="${hidden ? "#FBF0DA" : ["#E8D4A4", "#F0DFBC", "#F8ECD2"][i]}" stroke="${hidden ? "#C2843A" : "#8A6A3E"}" stroke-width="1.6"/>${label}`;
  }).join("");
  return `<svg viewBox="0 0 400 216" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="세 단의 피라미드 양옆으로 내려가는 화살표와 올라가는 화살표가 있고 오른쪽 위에 별도의 작은 카드가 있는 구조도. 일부 칸은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="400" height="216" rx="16" fill="#F7FAFC"/>
    ${els}
    <path d="M52 48 q-14 42 0 84 m-5 -8 l5 8 6 -7" stroke="#3D5BC0" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="32" y="86" text-anchor="middle" font-size="9.5" font-weight="800" fill="#3D5BC0" font-family="Pretendard, sans-serif">보호와</text>
    <text x="32" y="98" text-anchor="middle" font-size="9.5" font-weight="800" fill="#3D5BC0" font-family="Pretendard, sans-serif">토지 분배</text>
    <path d="M292 132 q14 -42 0 -84 m-6 8 l6 -8 5 8" stroke="#C2843A" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="312" y="86" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8F5A1D" font-family="Pretendard, sans-serif">충성과</text>
    <text x="312" y="98" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8F5A1D" font-family="Pretendard, sans-serif">복종</text>
    <rect x="326" y="150" width="64" height="42" rx="8" fill="#FFFFFF" stroke="#B9C4D4" stroke-width="1.6"/>
    <text x="358" y="168" text-anchor="middle" font-size="10.5" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">천황</text>
    <text x="358" y="182" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5B6570" font-family="Pretendard, sans-serif">형식상의 지위</text>
    <text x="172" y="204" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">막부의 우두머리가 실질적인 지배권을 행사해요!</text>
  </svg>`;
}

/* ---------- 16~17세기 은의 이동(태평양 중심 지도) ----------
   미래엔 113쪽 「16~17세기 세계 은의 유통」 구도 계승 — 왼쪽 유라시아·오른쪽 아메리카 사이의
   태평양을 은이 건넌다. 화살표: 포토시→마닐라→중국(태평양) · 이와미→중국 · 유럽→중국(바닷길) +
   중국→유럽으로 나가는 비단·도자기·차. 해안선은 단순화 러프(정확 지도가 아니라 흐름도). */
export function silverFlowFig(): string {
  return `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="왼쪽 대륙과 오른쪽 대륙 사이의 바다를 가로질러 여러 방향의 화살표가 오가는 교역 흐름 지도">
    <rect x="0" y="0" width="400" height="220" rx="16" fill="#DCEFF6"/>
    <path d="M6 26 L60 18 L96 26 L128 22 L150 34 L158 52 L150 72 L140 90 L128 104 L112 96 L100 108 L92 128 L80 138 L64 130 L48 136 L28 128 L14 132 L6 120 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M96 26 l10 -12 M60 18 l-8 -8" stroke="#C4B28E" stroke-width="1.6"/>
    <path d="M168 58 L178 48 L186 60 L178 72 z M172 84 L182 78 L188 90 L178 96 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M150 118 L160 112 L166 122 L156 130 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M394 16 L342 22 L310 34 L296 52 L302 72 L312 84 L306 100 L316 112 L330 124 L322 142 L328 162 L318 184 L308 196 L300 178 L296 156 L302 136 L292 122 L286 104 L294 88 L286 72 L292 52 L286 38 L318 26 L358 16 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round" transform="translate(0 2)"/>
    <text x="52" y="66" text-anchor="middle" font-size="11" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">유럽 방면</text>
    <text x="128" y="66" text-anchor="middle" font-size="11.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">명 · 청</text>
    <text x="192" y="42" text-anchor="middle" font-size="9.5" font-weight="800" fill="#5E4626" font-family="Pretendard, sans-serif">이와미 은광</text>
    <circle cx="180" cy="58" r="3.4" fill="#8A96A6" stroke="#4A5668" stroke-width="1.4"/>
    <text x="150" y="146" text-anchor="middle" font-size="9.5" font-weight="800" fill="#5E4626" font-family="Pretendard, sans-serif">마닐라</text>
    <circle cx="157" cy="122" r="3.4" fill="#8A96A6" stroke="#4A5668" stroke-width="1.4"/>
    <text x="330" y="70" text-anchor="middle" font-size="10.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">아메리카</text>
    <circle cx="318" cy="168" r="4" fill="#8A96A6" stroke="#4A5668" stroke-width="1.6"/>
    <text x="352" y="176" text-anchor="middle" font-size="9.5" font-weight="800" fill="#5E4626" font-family="Pretendard, sans-serif">포토시 은광</text>
    <path d="M310 164 Q 230 178 168 130 m10 8 l-10 -8 12 -3" stroke="#5E6A7A" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="238" y="184" text-anchor="middle" font-size="10" font-weight="900" fill="#3E4864" font-family="Pretendard, sans-serif">은</text>
    <path d="M150 116 Q 142 104 138 96 m1 9 l-1 -9 8 3" stroke="#5E6A7A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M174 62 q-14 10 -26 16 m9 -1 l-9 1 4 -8" stroke="#5E6A7A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="176" y="80" text-anchor="middle" font-size="10" font-weight="900" fill="#3E4864" font-family="Pretendard, sans-serif">은</text>
    <path d="M44 90 Q 84 178 128 116 m-1 10 l1 -10 -9 4" stroke="#5E6A7A" stroke-width="2.6" fill="none" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="76" y="160" text-anchor="middle" font-size="10" font-weight="900" fill="#3E4864" font-family="Pretendard, sans-serif">은</text>
    <path d="M112 40 Q 80 30 52 38 m8 -5 l-8 5 9 4" stroke="#C2843A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="82" y="24" text-anchor="middle" font-size="9.5" font-weight="800" fill="#8F5A1D" font-family="Pretendard, sans-serif">비단 · 도자기 · 차</text>
    <text x="200" y="210" text-anchor="middle" font-size="9.5" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">세계의 은이 상품값으로 오간 16~17세기의 바닷길</text>
  </svg>`;
}

/* ---------- 신항로 개척 지도(파라미터형 — Ⅳ 기함 hotspot 무대) ----------
   worldReligionsFig 계보를 아메리카까지 확장한 러프 세계 지도 + 항로 3(콜럼버스·바스쿠 다 가마·
   마젤란). 마젤란 항로는 교과서처럼 왼쪽 가장자리로 나가 오른쪽 가장자리로 이어진다(태평양 분할).
   marks=true면 항로에 (가)(나)(다) 배지 인쇄(라벨형 문제는 shuffle:false — 항로 이름은 문제 몫).
   hotspot 스팟 % 검산(viewBox 400×220): 서인도 제도(104,102)=26,46.4 · 멕시코 고원(84,88)=21,40 ·
   안데스(97,164)=24.3,74.5 · 희망봉(203,186)=50.8,84.5 · 캘리컷(287,120)=71.8,54.5. */
export function searoutesFig(o?: { marks?: boolean }): string {
  const mk = (x: number, y: number, t: string): string =>
    o?.marks ? `<circle cx="${x}" cy="${y}" r="10" fill="#FBF0DA" stroke="#C2843A" stroke-width="1.8"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">${t}</text>` : "";
  return `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="여러 대륙을 단순하게 그린 세계 지도 위로 서로 다른 색의 항로 세 개가 그려진 그림">
    <rect x="0" y="0" width="400" height="220" rx="16" fill="#DCEFF6"/>
    <path d="M8 22 L48 14 L84 20 L112 30 L118 46 L106 60 L96 74 L104 86 L96 100 L84 96 L74 84 L58 78 L40 70 L22 62 L8 52 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M96 100 L110 108 L118 124 L112 146 L104 166 L96 186 L88 200 L82 184 L78 162 L82 140 L88 120 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M170 62 L176 44 L188 34 L182 24 L196 14 L232 12 L252 20 L268 16 L288 22 L282 34 L268 38 L276 46 L292 42 L302 48 L294 56 L278 56 L266 62 L256 58 L246 64 L256 44 L238 40 L226 48 L230 58 L218 64 L204 58 L192 64 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M170 64 L186 68 L196 78 L204 92 L212 108 L216 128 L212 150 L206 170 L200 186 L192 178 L184 158 L178 136 L174 112 L168 90 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M266 62 L282 60 L296 66 L302 78 L296 94 L288 108 L284 122 L278 112 L272 96 L268 80 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M302 48 L330 40 L358 36 L384 40 L394 52 L390 70 L378 84 L362 92 L344 96 L330 104 L318 96 L308 84 L304 68 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="2" stroke-linejoin="round"/>
    <path d="M330 104 L342 112 L352 124 L344 134 L332 126 z M356 108 L368 104 L376 114 L366 122 z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M346 118 L352 112 L358 120 L352 126 z" fill="#EFE6D2" stroke="#C4B28E" stroke-width="1.4" stroke-linejoin="round"/>
    <text x="196" y="52" text-anchor="middle" font-size="10" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">유럽</text>
    <text x="196" y="120" text-anchor="middle" font-size="10" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">아프리카</text>
    <text x="344" y="66" text-anchor="middle" font-size="10" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">아시아</text>
    <text x="58" y="48" text-anchor="middle" font-size="9.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">북아메리카</text>
    <text x="118" y="170" text-anchor="middle" font-size="9.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">남아메리카</text>
    <path d="M182 70 Q 140 84 108 100 m9 -6 l-9 6 10 3" stroke="#C2843A" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M186 74 Q 142 128 198 190 Q 213 200 232 186 Q 264 162 284 128 m-2 10 l2 -10 -10 4" stroke="#0E7C8A" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M182 76 Q 148 150 122 186 Q 108 206 66 208 L 10 200 M 394 150 Q 372 132 352 122 m4 9 l-4 -9 10 1" stroke="#7C6BFF" stroke-width="2.6" fill="none" stroke-dasharray="7 5" stroke-linecap="round" stroke-linejoin="round"/>
    ${mk(126, 92, "(가)")}${mk(232, 152, "(나)")}${mk(60, 200, "(다)")}
    <circle cx="104" cy="102" r="4" fill="#C0392B" stroke="#84281E" stroke-width="1.4"/>
    <circle cx="203" cy="186" r="4" fill="#0E7C8A" stroke="#0A5964" stroke-width="1.4"/>
    <circle cx="287" cy="120" r="4" fill="#0E7C8A" stroke="#0A5964" stroke-width="1.4"/>
    <circle cx="352" cy="120" r="4" fill="#7C6BFF" stroke="#4A3EA8" stroke-width="1.4"/>
  </svg>`;
}

/* ---------- 삼각 무역 순환도(파라미터형) ----------
   유럽·아프리카·아메리카 세 꼭짓점과 품목 화살표 3개 — 교과서 지도(127쪽)의 구조도판.
   노예 무역은 "노예가 된 사람들"로 중립·존중 서술(정복·수탈 가드). hide 인덱스(0=유럽→아프리카
   1=아프리카→아메리카 2=아메리카→유럽)의 품목을 ㉠으로 가린다. */
export function triangleTradeFig(o?: { hide?: number }): string {
  const goods = ["총 · 직물 · 일용품", "노예가 된 사람들", "은 · 설탕 · 담배"];
  const g = (i: number): string => (o?.hide === i ? "㉠" : goods[i]);
  return `<svg viewBox="0 0 400 232" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
    aria-label="세 대륙 이름이 적힌 세 개의 상자 사이를 화살표가 한 방향으로 도는 무역 구조도. 일부 품목은 동그라미 기호로 가려져 있을 수 있다">
    <rect x="0" y="0" width="400" height="232" rx="16" fill="#F7FAFC"/>
    <path d="M96 138 q64 74 208 0" stroke="#4E7694" stroke-width="2" fill="none" opacity=".25"/>
    <rect x="152" y="18" width="96" height="40" rx="10" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="1.8"/>
    <text x="200" y="43" text-anchor="middle" font-size="13" font-weight="900" fill="#0A5964" font-family="Pretendard, sans-serif">유럽</text>
    <rect x="278" y="140" width="102" height="40" rx="10" fill="#FBEFDA" stroke="#C2843A" stroke-width="1.8"/>
    <text x="329" y="165" text-anchor="middle" font-size="13" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">아프리카</text>
    <rect x="20" y="140" width="102" height="40" rx="10" fill="#EDEAFA" stroke="#5B4AC0" stroke-width="1.8"/>
    <text x="71" y="165" text-anchor="middle" font-size="13" font-weight="900" fill="#3D2E86" font-family="Pretendard, sans-serif">아메리카</text>
    <path d="M242 62 Q 300 88 322 134 m1 -10 l-1 10 -9 -4" stroke="#0E7C8A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="308" y="92" text-anchor="middle" font-size="10" font-weight="800" fill="#0A5964" font-family="Pretendard, sans-serif">${g(0)}</text>
    <path d="M274 172 Q 200 200 128 172 m10 6 l-10 -6 11 -3" stroke="#8F5A1D" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="200" y="216" text-anchor="middle" font-size="10" font-weight="800" fill="#8F5A1D" font-family="Pretendard, sans-serif">${g(1)}</text>
    <path d="M80 134 Q 110 84 158 60 m-10 1 l10 -1 -4 10" stroke="#5B4AC0" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="92" y="88" text-anchor="middle" font-size="10" font-weight="800" fill="#3D2E86" font-family="Pretendard, sans-serif">${g(2)}</text>
    <text x="200" y="140" text-anchor="middle" font-size="10.5" font-weight="800" fill="#4E7694" font-family="Pretendard, sans-serif">대서양</text>
  </svg>`;
}

/* ---------- recap 미니아트(64×64 플랫) ---------- */
const M = (inner: string): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">${inner}</svg>`;

export function hisMiniArt(key: string): string {
  switch (key) {
    case "factrec": // 사실로서의 역사 — 과거에 찍힌 발자국 그대로
      return M(
        `<path d="M10 50q22 6 44 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>
        <path d="M18 40q-2-7 3-8t6 5q1 5-3 6t-6-3z" fill="#8A6A3E"/><path d="M20 27l1.6-3M25 26l1-3M29 29l2-2.4" stroke="#8A6A3E" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M40 34q-2-7 3-8t6 5q1 5-3 6t-6-3z" fill="#B99B66"/><path d="M42 21l1.6-3M47 20l1-3M51 23l2-2.4" stroke="#B99B66" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "recrec": // 기록으로서의 역사 — 붓이 쓰는 두루마리
      return M(
        `<rect x="10" y="16" width="36" height="34" rx="4" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="2"/>
        <path d="M16 26h24M16 34h24M16 42h14" stroke="#B99B66" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M44 46 54 30" stroke="#C89A5E" stroke-width="4" stroke-linecap="round"/>
        <path d="M42 50l4-5 3 2z" fill="#141C26"/>`,
      );
    case "sagwan": // 사관 — 같은 것을 보는 두 색 안경
      return M(
        `<circle cx="22" cy="30" r="10" fill="rgba(63,163,174,.3)" stroke="#0E7C8A" stroke-width="2.6"/>
        <circle cx="46" cy="30" r="10" fill="rgba(232,136,62,.3)" stroke="#C2843A" stroke-width="2.6"/>
        <path d="M32 30h4M12 30l-4-4M56 30l4-4" stroke="#5B6570" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M16 52q16 6 32 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "twoface": // 역사의 두 얼굴 — 동전의 양면(사실·기록)
      return M(
        `<circle cx="26" cy="32" r="16" fill="#F2CE86" stroke="#C2843A" stroke-width="2.4"/>
        <path d="M20 32l4 4 8-9" stroke="#8F5A1D" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M42 18a16 16 0 0 1 0 28" stroke="#8A96A6" stroke-width="2.4" fill="none"/>
        <path d="M48 26l6-2M50 32h6M48 38l6 2" stroke="#8A96A6" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    case "thinkpower": // 역사적 사고력 — 톱니 맞물린 생각
      return M(
        `<circle cx="30" cy="30" r="13" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2.6"/>
        <path d="M30 13v-5M30 52v-5M13 30H8M52 30h-5M18 18l-3.6-3.6M45.6 45.6 42 42M42 18l3.6-3.6M14.4 45.6 18 42" stroke="#0E7C8A" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M25 30q5-8 10 0t-10 0z" fill="#0E7C8A" opacity="0"/>
        <path d="M26 31q4-7 8 0" stroke="#0A5964" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <circle cx="47" cy="47" r="7" fill="#FFE8B4" stroke="#C2843A" stroke-width="2.2"/>`,
      );
    case "wisdom": // 교훈 — 과거의 발자국을 딛고 오르는 계단
      return M(
        `<path d="M8 52h12V40h12V28h12V16h12" stroke="#8A93A6" stroke-width="3" stroke-linecap="round" fill="none"/>
        <circle cx="47" cy="10" r="4" fill="#FFC24D"/>
        <path d="M14 48q3-4 6 0M26 36q3-4 6 0" stroke="#C2843A" stroke-width="2.2" stroke-linecap="round" fill="none"/>`,
      );
    case "identity": // 정체성 — 뿌리에서 자라는 나
      return M(
        `<path d="M32 40V22" stroke="#7A5A2E" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M32 40q-8 2-12 10M32 40q8 2 12 10M32 34q-7-1-10 4M32 34q7-1 10 4" stroke="#A87A3E" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <circle cx="32" cy="16" r="8" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.4"/>
        <path d="M29 15h1.6M33.4 15H35M29.5 19q2.5 1.6 5 0" stroke="#3C4654" stroke-width="1.8" stroke-linecap="round"/>`,
      );
    case "diversity": // 문화 다양성 — 서로 다른 깃발이 어울림
      return M(
        `<path d="M14 52V20M32 52V14M50 52V22" stroke="#8A93A6" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M14 20h14l-3 5 3 5H14z" fill="#3F8FC8"/>
        <path d="M32 14h14l-3 5 3 5H32z" fill="#E2574C"/>
        <path d="M50 22h-13l3 5-3 5h13z" fill="#2E9E5B"/>`,
      );
    case "munheon": // 문헌 — 옛 책
      return M(
        `<path d="M14 14h26a6 6 0 0 1 6 6v30H20a6 6 0 0 1-6-6z" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="2.4"/>
        <path d="M14 44a6 6 0 0 1 6-6h26v12H20a6 6 0 0 1-6-6z" fill="#E8D4A4" stroke="#8A6A3E" stroke-width="2"/>
        <path d="M22 24h16M22 31h16" stroke="#B99B66" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "yumul": // 유물 — 빗살무늬 토기
      return M(
        `<path d="M20 14q12 5 24 0 4 14-2 24-3 8-10 12-7-4-10-12-6-10-2-24z" fill="#BE8250" stroke="#6E4626" stroke-width="2.4"/>
        <path d="M23 24l5 5M29 23l5 5M35 23l5 5M25 34l5 5M31 33l5 5" stroke="#7A4E28" stroke-width="1.8" stroke-linecap="round"/>`,
      );
    case "yujeok": // 유적 — 옛 신전 터
      return M(
        `<path d="M12 22 32 10l20 12z" fill="#C9D2DE" stroke="#6E8098" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M18 26h5v20h-5zM29 26h5v20h-5zM40 26h5v20h-5z" fill="#E4EAF2" stroke="#6E8098" stroke-width="2"/>
        <path d="M12 50h40" stroke="#6E8098" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "sacritic": // 사료 비판 — 돋보기로 문서 검증
      return M(
        `<rect x="12" y="12" width="28" height="36" rx="4" fill="#FDFCF5" stroke="#8A96A6" stroke-width="2.2"/>
        <path d="M18 22h16M18 30h16M18 38h10" stroke="#B9C1CC" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="42" cy="36" r="11" fill="rgba(191,224,236,.5)" stroke="#0E7C8A" stroke-width="2.8"/>
        <path d="M50 44l7 7" stroke="#0A5964" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M38 36l3 3 6-7" stroke="#0A5964" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
      );
    case "sunsa": // 선사↔역사 — 문자가 가른 두 시대
      return M(
        `<path d="M32 10v44" stroke="#E0A72E" stroke-width="2.6" stroke-dasharray="3 4"/>
        <path d="M12 22q5-6 10 0M10 34q6-5 12 0" stroke="#8A6A3E" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <circle cx="17" cy="46" r="4" fill="#B99B66"/>
        <rect x="40" y="18" width="16" height="22" rx="2.5" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="2"/>
        <path d="M44 24h8M44 29h8M44 34h5" stroke="#8F5A1D" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M40 48h16" stroke="#8A6A3E" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "seogi": // 서기 — 기준선에서 양쪽으로 뻗는 시간
      return M(
        `<path d="M8 32h48" stroke="#8A93A6" stroke-width="3" stroke-linecap="round"/>
        <path d="M32 14v36" stroke="#E0A72E" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M20 26l-6 6 6 6M44 26l6 6-6 6" stroke="#0E7C8A" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="32" cy="12" r="4" fill="#FFD98A" stroke="#C2843A" stroke-width="1.8"/>`,
      );
    case "segi": // 세기 — 100년 한 묶음
      return M(
        `<rect x="10" y="22" width="44" height="20" rx="5" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2.4"/>
        <path d="M21 22v20M32 22v20M43 22v20" stroke="#7FB8C2" stroke-width="1.6"/>
        <path d="M10 50q22 6 44 0" stroke="#AAB4C4" stroke-width="2.6" stroke-linecap="round"/>
        <text x="32" y="16" text-anchor="middle" font-size="11" font-weight="900" fill="#0A5964" font-family="Pretendard, sans-serif">100년</text>`,
      );
    case "yeokbang": // 기원전 역방향 — 왼쪽으로 커지는 수
      return M(
        `<path d="M54 32H14m8-8-8 8 8 8" stroke="#C2843A" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="20" y="20" text-anchor="middle" font-size="12" font-weight="900" fill="#8F5A1D" font-family="Pretendard, sans-serif">300</text>
        <text x="38" y="20" text-anchor="middle" font-size="10" font-weight="800" fill="#B99B66" font-family="Pretendard, sans-serif">200</text>
        <text x="52" y="20" text-anchor="middle" font-size="8.5" font-weight="800" fill="#C9B48A" font-family="Pretendard, sans-serif">100</text>
        <path d="M12 48q20 6 40 0" stroke="#AAB4C4" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    case "yeonho": // 연호 — 왕관과 1년
      return M(
        `<path d="M18 26l6 6 8-10 8 10 6-6v14H18z" fill="#F2C24E" stroke="#C2843A" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="18" y="40" width="28" height="6" rx="3" fill="#C2843A"/>
        <text x="32" y="58" text-anchor="middle" font-size="10" font-weight="900" fill="#7A5A2E" font-family="Pretendard, sans-serif">즉위 = 1년</text>`,
      );
    case "topic": // 탐구 주제 — 물음표 발견
      return M(
        `<circle cx="32" cy="28" r="16" fill="#EAF9FB" stroke="#0E7C8A" stroke-width="2.6"/>
        <path d="M27 24q0-6 5-6t5 5q0 4-5 6v3" stroke="#0A5964" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <circle cx="32" cy="37" r="1.8" fill="#0A5964"/>
        <path d="M43 40l8 8" stroke="#0E7C8A" stroke-width="3.2" stroke-linecap="round"/>`,
      );
    case "collect": // 자료 수집 — 책·사진·구술을 바구니에
      return M(
        `<path d="M14 34h36l-4 16H18z" fill="#E8D4A4" stroke="#8A6A3E" stroke-width="2.4" stroke-linejoin="round"/>
        <rect x="18" y="18" width="12" height="14" rx="2" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="2"/>
        <rect x="34" y="16" width="13" height="11" rx="2" fill="#D6E8F2" stroke="#3F8FC8" stroke-width="2"/>
        <circle cx="40.5" cy="21.5" r="2.6" fill="#3F8FC8"/>
        <path d="M26 40h12" stroke="#8A6A3E" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    case "analyze": // 분석·해석 — 자료 위 돋보기
      return M(
        `<rect x="12" y="14" width="26" height="34" rx="4" fill="#FDFCF5" stroke="#8A96A6" stroke-width="2.2"/>
        <path d="M18 24h14M18 31h14M18 38h9" stroke="#B9C1CC" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="42" cy="34" r="10" fill="rgba(255,232,180,.55)" stroke="#C2843A" stroke-width="2.8"/>
        <path d="M49 42l7 7" stroke="#8F5A1D" stroke-width="3.2" stroke-linecap="round"/>`,
      );
    case "verify": // 검증 — 두 말풍선의 토론
      return M(
        `<path d="M10 18h24v14H20l-6 6v-6h-4z" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M54 30H32v14h12l6 6v-6h4z" fill="#FBF0DA" stroke="#C2843A" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M16 25h12M38 37h10" stroke="#8A96A6" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "present": // 정리·발표 — 연표 칠판 앞 발표
      return M(
        `<rect x="10" y="12" width="44" height="28" rx="4" fill="#33604E" stroke="#1E3C30" stroke-width="2.2"/>
        <path d="M16 26h32" stroke="#E8F0E8" stroke-width="2" stroke-linecap="round"/>
        <circle cx="24" cy="26" r="2.4" fill="#FFD98A"/><circle cx="38" cy="26" r="2.4" fill="#FFD98A"/>
        <circle cx="32" cy="46" r="5" fill="#FFE8CE" stroke="#3C4654" stroke-width="2"/>
        <path d="M32 51v7M32 53l-6 3M32 53l6 3" stroke="#3C4654" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "gameuse": // 문화 속 역사 — 게임 카드
      return M(
        `<rect x="16" y="12" width="32" height="40" rx="5" fill="#2E3A8C" stroke="#141C4E" stroke-width="2.4"/>
        <circle cx="32" cy="26" r="7" fill="#FFE8CE" stroke="#F2F6FB" stroke-width="2"/>
        <path d="M32 33v10M32 36l-6 4M32 36l6 4" stroke="#F2F6FB" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 18l2-3 2 3M38 18l2-3 2 3" stroke="#FFD98A" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      );
    /* ── Ⅱ. 문명의 발생과 고대 세계 ── */
    case "upright": // 직립 보행 — 일어선 스틱맨, 자유로운 두 손
      return M(
        `<circle cx="32" cy="14" r="7" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.4"/>
        <path d="M32 21v18M32 27l-12-6M32 27l12-6M32 39l-8 14M32 39l8 14" stroke="#3C4654" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="16" cy="18" r="4" fill="#E8734A"/>
        <path d="M46 14l4 8-6 1z" fill="#8A93A6"/>`,
      );
    case "firelang": // 불과 언어 — 모닥불 + 말풍선
      return M(
        `<path d="M24 46q-8-8-2-18 2 6 6 6-2-8 6-14 0 8 6 12t2 14q-4 8-18 0z" fill="#F2A33E" stroke="#C86A1E" stroke-width="2"/>
        <path d="M28 42q-2-6 4-10 0 6 4 8t-2 6q-4 2-6-4z" fill="#FFD98A"/>
        <path d="M14 50h36" stroke="#8A6A3E" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M40 10h14v10h-8l-5 5v-5h-1z" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2" stroke-linejoin="round"/>`,
      );
    case "burial": // 매장 풍습 — 봉분과 선 돌(존중 톤)
      return M(
        `<path d="M12 46q20-18 40 0z" fill="#B99B66" stroke="#8A6A3E" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="28" y="20" width="8" height="14" rx="3" fill="#AAB4C4" stroke="#6E8098" stroke-width="2"/>
        <path d="M10 50h44" stroke="#8A6A3E" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M46 26q3-4 6 0" stroke="#7FB86E" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      );
    case "cavepaint": // 동굴 벽화 — 벽의 들소 낙서
      return M(
        `<path d="M8 12q24-8 48 0v40q-24 8-48 0z" fill="#E8D4A4" stroke="#8A6A3E" stroke-width="2.2"/>
        <path d="M22 36q4-8 12-8t12 6q4 4-2 6l-4 6-4-5h-8l-3 5-4-6q-2-3 1-4z" fill="#B0522E"/>
        <path d="M34 26l3-4M40 27l4-3" stroke="#7A3A1E" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "chippedstone": // 뗀석기 — 날카로운 조각 돌
      return M(
        `<path d="M32 8l14 12-4 16-10 18-10-18-4-16z" fill="#A08662" stroke="#5E4A36" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M26 16l5 5-4 6 5 6-4 6M38 14l-4 6 5 5-4 7" stroke="#78603F" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,
      );
    case "polishedstone": // 간석기 — 매끈한 돌도끼 + 반짝
      return M(
        `<path d="M24 10q10-4 16 2t2 18q-4 14-10 24-6-10-10-24-2-14 2-20z" fill="#8FA0B6" stroke="#4E6078" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M26 16q6-3 10 1" stroke="#E4EAF2" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M48 14l2-4 2 4 4 2-4 2-2 4-2-4-4-2z" fill="#FFC24D"/>`,
      );
    case "farmrev": // 신석기 혁명 — 이삭과 해
      return M(
        `<circle cx="46" cy="16" r="7" fill="#FFD98A" stroke="#E0A72E" stroke-width="2"/>
        <path d="M24 54V26" stroke="#5E9E3E" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M24 30q-8-2-10-10 8 0 10 10zM24 30q8-2 10-10-8 0-10 10zM24 40q-8-2-10-10 8 0 10 10zM24 40q8-2 10-10-8 0-10 10z" fill="#8FCE6E" stroke="#4E8E3E" stroke-width="1.6"/>
        <path d="M12 54h28" stroke="#8A6A3E" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    case "bigriver": // 큰 강 유역 — 강물과 기름진 땅
      return M(
        `<path d="M26 8q-8 12 2 22t2 26" stroke="#3FA3AE" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M40 16q4-6 10-6M42 30q6-2 10 2M40 44q6 0 8 6" stroke="#8FCE6E" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <circle cx="48" cy="12" r="2.4" fill="#5E9E3E"/><circle cx="52" cy="30" r="2.4" fill="#5E9E3E"/>`,
      );
    case "bronzeking": // 청동기와 계급 — 청동검과 왕관
      return M(
        `<path d="M24 8l4 30h-8zM24 40v12M18 48h12" stroke="#3E8E8E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="rgba(63,163,174,.2)"/>
        <path d="M36 30l5 6 6-9 6 9 5-6v12H36z" fill="#F2C24E" stroke="#C2843A" stroke-width="2.2" stroke-linejoin="round"/>`,
      );
    case "cuneitab": // 쐐기 문자 점토판
      return M(
        `<rect x="14" y="10" width="36" height="44" rx="6" fill="#C9A05E" stroke="#8A5A26" stroke-width="2.4"/>
        <path d="M20 20l6 2-4 3zM32 19l6 2-4 3zM22 30l6 2-4 3zM34 29l6 2-4 3zM26 40l6 2-4 3zM38 39l6 2-4 3z" fill="#7A4E28"/>`,
      );
    case "hamlaw": // 함무라비 법전 — 비석
      return M(
        `<path d="M20 54V22q0-12 12-12t12 12v32z" fill="#8FA0B6" stroke="#4E6078" stroke-width="2.4"/>
        <circle cx="32" cy="20" r="5" fill="#F2C24E" stroke="#C2843A" stroke-width="1.8"/>
        <path d="M24 32h16M24 38h16M24 44h10" stroke="#5E7088" stroke-width="2" stroke-linecap="round"/>
        <path d="M14 54h36" stroke="#4E6078" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    case "pyramidmir": // 이집트 — 피라미드와 태양
      return M(
        `<path d="M10 50L32 14l22 36z" fill="#E8C88E" stroke="#8A6A3E" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M32 14L22 50h20z" fill="#D8B070" stroke="#8A6A3E" stroke-width="1.4"/>
        <circle cx="52" cy="12" r="6" fill="#FFD98A" stroke="#E0A72E" stroke-width="2"/>
        <path d="M8 50h48" stroke="#8A6A3E" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "mummy": // 미라와 내세 — 관(존중 톤)
      return M(
        `<path d="M24 8h16q6 14 4 30l-4 16h-16l-4-16q-2-16 4-30z" fill="#F2C24E" stroke="#C2843A" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M26 20h12M25 30h14M26 40h12" stroke="#8F5A1D" stroke-width="2" stroke-linecap="round"/>
        <circle cx="32" cy="14" r="3" fill="#8F5A1D"/>`,
      );
    case "plancity": // 계획 도시 — 격자 도로
      return M(
        `<rect x="12" y="12" width="40" height="40" rx="6" fill="#F2E7CE" stroke="#8A6A3E" stroke-width="2.4"/>
        <path d="M12 26h40M12 40h40M26 12v40M40 12v40" stroke="#B99B66" stroke-width="2.6"/>
        <rect x="30" y="30" width="6" height="6" fill="#3FA3AE"/>`,
      );
    case "castemini": // 카스트제 — 4단
      return M(
        `<rect x="24" y="10" width="16" height="8" rx="3" fill="#E8D4A4" stroke="#8A6A3E" stroke-width="1.8"/>
        <rect x="19" y="21" width="26" height="8" rx="3" fill="#EFDDB8" stroke="#8A6A3E" stroke-width="1.8"/>
        <rect x="14" y="32" width="36" height="8" rx="3" fill="#F5E7CB" stroke="#8A6A3E" stroke-width="1.8"/>
        <rect x="9" y="43" width="46" height="8" rx="3" fill="#FBF1DC" stroke="#8A6A3E" stroke-width="1.8"/>`,
      );
    case "oracle": // 갑골 — 거북 배딱지와 갈라진 금
      return M(
        `<path d="M32 8q16 4 18 22t-18 26q-16-8-18-26T32 8z" fill="#E8D4A4" stroke="#8A6A3E" stroke-width="2.4"/>
        <path d="M32 12v40M20 24q12 6 24 0M20 40q12-6 24 0" stroke="#B99B66" stroke-width="1.8" fill="none"/>
        <path d="M32 26l7-5M32 30l-6 6" stroke="#B0522E" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    case "kingroad": // 왕의 길 — 길과 역참
      return M(
        `<path d="M8 46q24-12 48-24" stroke="#C2A54E" stroke-width="4" stroke-linecap="round"/>
        <circle cx="18" cy="41" r="3.4" fill="#0E7C8A"/><circle cx="32" cy="34" r="3.4" fill="#0E7C8A"/><circle cx="46" cy="27" r="3.4" fill="#0E7C8A"/>
        <path d="M46 14l6 4-6 4z" fill="#E2574C"/><path d="M46 14v10" stroke="#8A6A3E" stroke-width="2"/>`,
      );
    case "tolerance": // 관용 정책 — 서로 다른 두 모자의 악수
      return M(
        `<circle cx="20" cy="22" r="8" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.2"/>
        <path d="M12 16q8-6 16 0l-2 4q-6-4-12 0z" fill="#3FA3AE" stroke="#0A5964" stroke-width="1.4"/>
        <circle cx="44" cy="22" r="8" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.2"/>
        <rect x="36" y="10" width="16" height="6" rx="3" fill="#C2843A" stroke="#8A5A26" stroke-width="1.4"/>
        <path d="M20 30q4 10 12 10t12-10" stroke="#3C4654" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path d="M28 40h8" stroke="#3C4654" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "zoro": // 조로아스터교 — 소중한 불꽃
      return M(
        `<path d="M32 12q10 10 8 20 4-2 4-6 6 10-2 18t-20 0q-8-8-2-18 0 4 4 6-2-10 8-20z" fill="#F2A33E" stroke="#C86A1E" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M32 26q4 6 0 12t-4-6q0-4 4-6z" fill="#FFD98A"/>
        <rect x="22" y="50" width="20" height="5" rx="2.5" fill="#8A93A6"/>`,
      );
    case "polis": // 폴리스 — 언덕 위 신전
      return M(
        `<path d="M8 52q24-10 48 0z" fill="#8FCE6E" stroke="#4E8E3E" stroke-width="2"/>
        <path d="M18 30l14-10 14 10z" fill="#E4EAF2" stroke="#6E8098" stroke-width="2"/>
        <path d="M21 30h4v14h-4zM30 30h4v14h-4zM39 30h4v14h-4z" fill="#F6FAFD" stroke="#6E8098" stroke-width="1.8"/>
        <path d="M17 44h30" stroke="#6E8098" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "demos": // 민주 정치 — 들린 손들
      return M(
        `<path d="M14 40v-12M26 36V20M38 38V24M50 40V28" stroke="#3C4654" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="14" cy="24" r="4" fill="#FFE8CE" stroke="#3C4654" stroke-width="1.8"/>
        <circle cx="26" cy="16" r="4" fill="#FFE8CE" stroke="#3C4654" stroke-width="1.8"/>
        <circle cx="38" cy="20" r="4" fill="#FFE8CE" stroke="#3C4654" stroke-width="1.8"/>
        <circle cx="50" cy="24" r="4" fill="#FFE8CE" stroke="#3C4654" stroke-width="1.8"/>
        <path d="M10 50q22 8 44 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "ostraka": // 도편 — 이름 새긴 조각
      return M(
        `<path d="M14 20l20-8 14 10-4 18-18 10-12-12z" fill="#D8A26E" stroke="#8A5A28" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M22 26q6-4 14-2M22 34q8-2 14 0" stroke="#6E4626" stroke-width="2" stroke-linecap="round"/>
        <path d="M44 44l6 6" stroke="#8A5A28" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    case "helle": // 헬레니즘 — 동서 융합(두 기둥이 한 지붕)
      return M(
        `<path d="M14 24h36l-4-8H18z" fill="#E4EAF2" stroke="#6E8098" stroke-width="2"/>
        <path d="M18 24h6v22h-6z" fill="#F6FAFD" stroke="#6E8098" stroke-width="1.8"/>
        <path d="M40 24h6v22h-6z" fill="#F2D9A4" stroke="#8A6A3E" stroke-width="1.8"/>
        <path d="M14 46h36" stroke="#6E8098" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="32" cy="35" r="4" fill="#3FA3AE"/>`,
      );
    case "republic": // 공화정 — 견제와 균형(세 기둥)
      return M(
        `<rect x="10" y="18" width="12" height="26" rx="3" fill="#E4EAF2" stroke="#6E8098" stroke-width="2"/>
        <rect x="26" y="12" width="12" height="32" rx="3" fill="#F6FAFD" stroke="#6E8098" stroke-width="2"/>
        <rect x="42" y="18" width="12" height="26" rx="3" fill="#E4EAF2" stroke="#6E8098" stroke-width="2"/>
        <path d="M8 48h48" stroke="#6E8098" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M22 26h4M38 26h4" stroke="#C2843A" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "romebuild": // 로마 실용 문화 — 아치 수도교
      return M(
        `<rect x="8" y="20" width="48" height="8" rx="2" fill="#E0CCA8" stroke="#8A6A3E" stroke-width="2"/>
        <path d="M12 44v-10a6 6 0 0 1 12 0v10M28 44v-10a6 6 0 0 1 12 0v10M44 44v-10a6 6 0 0 1 10 0v10" stroke="#8A6A3E" stroke-width="2.2" fill="none"/>
        <path d="M10 20q22-4 44 0" stroke="#3FA3AE" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M8 46h48" stroke="#8A6A3E" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "christ": // 크리스트교 — 빛나는 십자(경건 톤)
      return M(
        `<path d="M32 12v36M20 26h24" stroke="#C2843A" stroke-width="4" stroke-linecap="round"/>
        <circle cx="32" cy="26" r="16" fill="none" stroke="#FFD98A" stroke-width="2" stroke-dasharray="2 5"/>`,
      );
    case "jeja": // 제자백가 — 여러 말풍선
      return M(
        `<path d="M8 14h20v12H16l-5 5v-5H8z" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2" stroke-linejoin="round"/>
        <path d="M56 20H36v12h12l5 5v-5h3z" fill="#FBF0DA" stroke="#C2843A" stroke-width="2" stroke-linejoin="round"/>
        <path d="M12 40h20v12H20l-5 5v-5h-3z" fill="#F1E4F8" stroke="#8A6BFF" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="46" cy="46" r="7" fill="#FFE8CE" stroke="#3C4654" stroke-width="2"/>`,
      );
    case "qinunify": // 진 통일 — 둥근 엽전(가운데 네모 구멍)
      return M(
        `<circle cx="32" cy="32" r="18" fill="#C9A05E" stroke="#8A5A26" stroke-width="2.6"/>
        <rect x="26" y="26" width="12" height="12" fill="#F7FAFC" stroke="#8A5A26" stroke-width="2.2"/>`,
      );
    case "wallmini": // 만리장성 — 능선 위 성벽
      return M(
        `<path d="M6 46q14-10 24-6t28-10v14q-16 10-28 7t-24 6z" fill="#A29C7C" stroke="#5E5A46" stroke-width="2" stroke-linejoin="round"/>
        <rect x="26" y="18" width="12" height="16" rx="2" fill="#CEC8AA" stroke="#5E5A46" stroke-width="2"/>
        <path d="M26 18h3v-3h3v3h3v-3h3v3" fill="none" stroke="#5E5A46" stroke-width="1.6"/>`,
      );
    case "hanconf": // 한 무제와 유교 — 책과 관
      return M(
        `<path d="M14 20h22a6 6 0 0 1 6 6v22H20a6 6 0 0 1-6-6z" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="2.2"/>
        <path d="M21 30h14M21 37h14" stroke="#B99B66" stroke-width="2.2" stroke-linecap="round"/>
        <rect x="40" y="10" width="16" height="6" rx="2" fill="#33405A"/>
        <path d="M42 16v6M54 16v6" stroke="#33405A" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "dharma": // 불교 — 법륜(존중 톤)
      return M(
        `<circle cx="32" cy="32" r="17" fill="none" stroke="#C2843A" stroke-width="2.8"/>
        <circle cx="32" cy="32" r="4" fill="#C2843A"/>
        <path d="M32 15v34M15 32h34M20 20l24 24M44 20L20 44" stroke="#C2843A" stroke-width="2" stroke-linecap="round"/>
        <circle cx="32" cy="32" r="17" fill="rgba(242,206,134,.18)"/>`,
      );
    case "asokapillar": // 아소카 돌기둥 — 사자 머리 기둥
      return M(
        `<rect x="27" y="22" width="10" height="30" rx="3" fill="#D8C8A8" stroke="#8A6A3E" stroke-width="2.2"/>
        <rect x="22" y="16" width="20" height="7" rx="3" fill="#C9B48A" stroke="#8A6A3E" stroke-width="1.8"/>
        <path d="M26 16q-2-8 6-8t6 8z" fill="#B99B66" stroke="#8A6A3E" stroke-width="1.8"/>
        <path d="M20 52h24" stroke="#8A6A3E" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    case "gandhara": // 간다라 양식 — 그리스 기둥 + 연꽃의 만남
      return M(
        `<path d="M12 22h14l-2-5H14zM14 22h3v20h-3zM21 22h3v20h-3z" fill="#E4EAF2" stroke="#6E8098" stroke-width="1.6"/>
        <path d="M40 42q-8-4-6-12 6 2 6 8 0-8 6-12 4 8-2 14 6-2 10 2-6 4-14 0z" fill="#F2A0B6" stroke="#C25A7A" stroke-width="1.6"/>
        <path d="M10 44h44" stroke="#8A93A6" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M28 30h8m-4-4v8" stroke="#3FA3AE" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    /* ── Ⅲ. 세계 종교의 확산과 지역 문화의 발전 ── */
    case "splitmap": // 분열의 연대기 — 갈라진 두 땅
      return M(
        `<path d="M10 20q14-6 22 2t20 0v14q-12 6-22-2t-20 2z" fill="#E8D4A4" stroke="#8A6534" stroke-width="2"/>
        <path d="M12 44q14-6 22 2t18-2v10q-10 6-20-2t-20 2z" fill="#CDE4E8" stroke="#0E7C8A" stroke-width="2"/>
        <path d="M18 36h28" stroke="#AAB4C4" stroke-width="2" stroke-dasharray="3 4"/>`,
      );
    case "fusion": // 호한 융합 — 의자와 붓의 만남
      return M(
        `<rect x="10" y="30" width="16" height="4" rx="2" fill="#C2843A"/><path d="M12 34v14M24 34v14M10 24v6h16v-6" stroke="#8A6534" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <path d="M44 46 54 26" stroke="#5E4626" stroke-width="4" stroke-linecap="round"/><path d="M42 50l4-5 3 2z" fill="#141C26"/>
        <path d="M30 38h6m-3-3v6" stroke="#0E7C8A" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "ninerank": // 문벌 귀족 — 도장 찍힌 추천장
      return M(
        `<rect x="14" y="12" width="32" height="40" rx="4" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="2"/>
        <path d="M20 22h20M20 30h20M20 38h12" stroke="#B99B66" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="40" cy="44" r="7" fill="rgba(192,57,43,.25)" stroke="#C0392B" stroke-width="2.2"/>`,
      );
    case "grotto": // 석굴 — 아치 속 불상 실루엣
      return M(
        `<path d="M14 52v-20q0-16 18-16t18 16v20z" fill="#C9B394" stroke="#8A6534" stroke-width="2.2"/>
        <path d="M20 52v-16q0-11 12-11t12 11v16z" fill="#6E583E"/>
        <circle cx="32" cy="36" r="4" fill="#E8C48A"/><path d="M26 50q0-8 6-8t6 8z" fill="#E8C48A"/>`,
      );
    case "examseal": // 과거제 — 합격 도장 찍힌 두루마리
      return M(
        `<rect x="16" y="10" width="32" height="44" rx="4" fill="#FFFFFF" stroke="#B9C4D4" stroke-width="2.2"/>
        <path d="M22 20h20M22 28h20M22 36h14" stroke="#C9D2DE" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="40" cy="44" r="8" fill="none" stroke="#0E7C8A" stroke-width="2.4"/>
        <path d="M36 44l3 3 5-6" stroke="#0E7C8A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
      );
    case "canal": // 대운하 — 물길 위의 배
      return M(
        `<path d="M8 40q12-6 24 0t24 0" stroke="#3FA3AE" stroke-width="3.4" stroke-linecap="round" fill="none"/>
        <path d="M22 38h20l-4 8h-12z" fill="#C89A5E" stroke="#84582A" stroke-width="2"/>
        <path d="M32 38v-14l10 10h-10" fill="#F2D9A4" stroke="#84582A" stroke-width="2" stroke-linejoin="round"/>
        <path d="M10 52q22 6 44 0" stroke="#AAB4C4" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    case "threesix": // 3성 6부 — 세 칸과 여섯 점
      return M(
        `<rect x="8" y="18" width="14" height="12" rx="3" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2"/>
        <rect x="25" y="18" width="14" height="12" rx="3" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2"/>
        <rect x="42" y="18" width="14" height="12" rx="3" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2"/>
        <path d="M49 30v8" stroke="#8A96A6" stroke-width="2"/>
        <circle cx="14" cy="46" r="3.4" fill="#C2843A"/><circle cx="28" cy="46" r="3.4" fill="#C2843A"/><circle cx="42" cy="46" r="3.4" fill="#C2843A"/>
        <circle cx="21" cy="54" r="3.4" fill="#C2843A"/><circle cx="35" cy="54" r="3.4" fill="#C2843A"/><circle cx="49" cy="54" r="3.4" fill="#C2843A"/>`,
      );
    case "sancai": // 당삼채 — 세 색 유약의 낙타
      return M(
        `<path d="M18 46q4-10 10-10 3-6 8 0 6 0 9 10l-3 8h-4l-1-6h-9l-1 6h-4z" fill="#F0DCB0" stroke="#6E4626" stroke-width="2" stroke-linejoin="round"/>
        <path d="M22 34q-4-2-4-8 0-5 4-6 3-1 4 2" fill="#F0DCB0" stroke="#6E4626" stroke-width="2"/>
        <path d="M28 40q5 4 10 0" stroke="#3FA36E" stroke-width="3" stroke-linecap="round"/>
        <path d="M30 32q4 2 8 0" stroke="#C2843A" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "buddhaship": // 불교 전래 — 바다 건너는 배와 탑
      return M(
        `<path d="M8 46q14-6 24 0t24 0" stroke="#3FA3AE" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M20 44h24l-5 8h-14z" fill="#C89A5E" stroke="#84582A" stroke-width="2"/>
        <path d="M30 24h8l-4-8zM28 32h12M30 40h8M32 24v16" stroke="#C2843A" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
      );
    case "namkuk": // 남북국 — 두 개의 궁궐 지붕
      return M(
        `<path d="M10 30h20l-10-10z" fill="#0E7C8A" stroke="#0A5964" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="14" y="30" width="12" height="14" fill="#E2F1F3" stroke="#0A5964" stroke-width="1.8"/>
        <path d="M34 44h20l-10-10z" fill="#C2843A" stroke="#8F5A1D" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="38" y="44" width="12" height="12" fill="#FBEFDA" stroke="#8F5A1D" stroke-width="1.8"/>`,
      );
    case "daika": // 다이카 개신 — 개혁 두루마리와 화살표
      return M(
        `<rect x="12" y="16" width="26" height="34" rx="4" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="2"/>
        <path d="M18 26h14M18 34h14M18 42h10" stroke="#B99B66" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M42 32h12m-5-5 5 5-5 5" stroke="#0E7C8A" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "kana": // 가나 — 변형되는 글자 붓질
      return M(
        `<path d="M16 20h14M23 20v22q0 6-6 6" stroke="#33405A" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M40 24q8 4 6 12t-10 8" stroke="#0E7C8A" stroke-width="3.4" stroke-linecap="round" fill="none"/>
        <path d="M32 32h4" stroke="#AAB4C4" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "envoyship": // 견당사 — 사신의 배와 깃발
      return M(
        `<path d="M8 44q14-6 24 0t24 0" stroke="#3FA3AE" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M18 42h28l-6 9h-16z" fill="#C89A5E" stroke="#84582A" stroke-width="2"/>
        <path d="M32 42v-20" stroke="#84582A" stroke-width="2.4"/>
        <path d="M32 22h12l-3 4 3 4h-12z" fill="#0E7C8A"/>`,
      );
    case "fourkeys": // 4요소 — 네 개의 칩
      return M(
        `<rect x="10" y="14" width="20" height="14" rx="7" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="2"/>
        <rect x="34" y="14" width="20" height="14" rx="7" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2"/>
        <rect x="10" y="36" width="20" height="14" rx="7" fill="#EDEAFA" stroke="#5B4AC0" stroke-width="2"/>
        <rect x="34" y="36" width="20" height="14" rx="7" fill="#FBEFDA" stroke="#C2843A" stroke-width="2"/>`,
      );
    case "localize": // 같은 재료 다른 요리 — 한 그릇 두 맛
      return M(
        `<circle cx="22" cy="30" r="11" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2.4"/>
        <circle cx="42" cy="30" r="11" fill="#FBEFDA" stroke="#C2843A" stroke-width="2.4"/>
        <path d="M18 30q4-4 8 0M38 26v8m-4-4h8" stroke="#5B6570" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M16 52q16 6 32 0" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "hanjaword": // 오늘까지의 한자 — 말풍선 속 三
      return M(
        `<path d="M12 14h40v28h-18l-8 10v-10h-14z" fill="#FFFFFF" stroke="#B9C4D4" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M24 22h16M22 28h20M20 34h24" stroke="#33405A" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "guptacrown": // 굽타 왕조 — 왕관과 물결
      return M(
        `<path d="M16 34l4-12 8 8 4-12 4 12 8-8 4 12z" fill="#F2CE86" stroke="#C2843A" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="16" y="34" width="32" height="8" rx="3" fill="#E8B45E" stroke="#C2843A" stroke-width="2"/>
        <path d="M12 52q10-5 20 0t20 0" stroke="#3FA3AE" stroke-width="2.8" stroke-linecap="round" fill="none"/>`,
      );
    case "floweroffer": // 힌두교 확산 — 꽃 공양
      return M(
        `<circle cx="32" cy="26" r="4" fill="#E8883E"/>
        <path d="M32 14q4 4 0 8-4-4 0-8zM44 26q-4 4-8 0 4-4 8 0zM32 38q-4-4 0-8 4 4 0 8zM20 26q4-4 8 0-4 4-8 0z" fill="#F2A0B6" stroke="#C25A7A" stroke-width="1.6"/>
        <path d="M18 50q14-8 28 0l-4 6h-20z" fill="#C9B48A" stroke="#8A6A3E" stroke-width="2"/>`,
      );
    case "zeroten": // 0과 10진법 — 빈 원과 구슬
      return M(
        `<circle cx="24" cy="30" r="12" fill="none" stroke="#3D5BC0" stroke-width="3.4"/>
        <circle cx="46" cy="22" r="4" fill="#C2843A"/><circle cx="46" cy="34" r="4" fill="#C2843A"/><circle cx="46" cy="46" r="4" fill="#C2843A"/>
        <path d="M14 52q18 6 36 0" stroke="#AAB4C4" stroke-width="2.8" stroke-linecap="round"/>`,
      );
    case "angkormini": // 앙코르 와트 — 다섯 탑과 반영
      return M(
        `<path d="M28 18l4-8 4 8zM16 34l4-10 4 10zM40 34l4-10 4 10zM28 34h8v-12h-8z" fill="#C9A05E" stroke="#8A5A26" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="12" y="34" width="40" height="6" fill="#C9A05E" stroke="#8A5A26" stroke-width="1.8"/>
        <path d="M12 48q10-4 20 0t20 0" stroke="#3FA3AE" stroke-width="2.8" stroke-linecap="round" fill="none"/>`,
      );
    case "persiaglass": // 사산 왕조 — 유리병
      return M(
        `<path d="M28 12h8v6q8 4 8 14 0 16-12 16t-12-16q0-10 8-14z" fill="rgba(63,163,174,.28)" stroke="#0E7C8A" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="32" cy="32" r="4" fill="none" stroke="#0E7C8A" stroke-width="2"/>
        <ellipse cx="27" cy="24" rx="2.4" ry="5" fill="#fff" opacity=".6"/>`,
      );
    case "hejira": // 헤지라 — 사막 위의 발자국과 초승달
      return M(
        `<path d="M44 12a10 10 0 1 0 4 16 8 8 0 1 1-4-16z" fill="#F2CE86" stroke="#C2843A" stroke-width="2"/>
        <path d="M10 48q22-8 44-2" stroke="#E0B25E" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M18 42l3-2M26 39l3-2M34 37l3-2M42 36l3-2" stroke="#8A6534" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    case "taxfree": // 관용 정책 — 저울 위의 화합
      return M(
        `<path d="M32 12v32M18 20h28" stroke="#5B6570" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M18 20l-6 12q6 5 12 0zM46 20l-6 12q6 5 12 0z" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2"/>
        <path d="M22 52h20" stroke="#8A96A6" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "caliphflow": // 왕조 교체 — 이어지는 화살 칩
      return M(
        `<rect x="8" y="26" width="13" height="12" rx="3" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2"/>
        <rect x="26" y="26" width="13" height="12" rx="3" fill="#FBEFDA" stroke="#C2843A" stroke-width="2"/>
        <rect x="44" y="26" width="13" height="12" rx="3" fill="#EDEAFA" stroke="#5B4AC0" stroke-width="2"/>
        <path d="M21 32h4m14 0h4" stroke="#8A96A6" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M50 38v8h-24m4-4-4 4 4 4" stroke="#AAB4C4" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "dhow": // 다우선 — 삼각돛과 계절풍
      return M(
        `<path d="M8 46q14-6 24 0t24 0" stroke="#3FA3AE" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M18 44h28l-6 8h-16z" fill="#C89A5E" stroke="#84582A" stroke-width="2"/>
        <path d="M34 44V16L18 40z" fill="#F7FAFC" stroke="#5C677D" stroke-width="2" stroke-linejoin="round"/>
        <path d="M44 22q6 2 10-2M44 30q6 2 10-2" stroke="#7FB4D6" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
      );
    case "quranlang": // 쿠란과 아랍어 — 펼친 책과 무늬
      return M(
        `<path d="M32 18q-10-6-22-2v32q12-4 22 2 10-6 22-2V16q-12-4-22 2z" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M32 18v32" stroke="#8A6A3E" stroke-width="1.8"/>
        <path d="M16 28q4-3 8 0M16 36q4-3 8 0M40 28q4-3 8 0M40 36q4-3 8 0" stroke="#0E7C8A" stroke-width="2" stroke-linecap="round" fill="none"/>`,
      );
    case "mosquemini": // 모스크 — 돔과 미너렛
      return M(
        `<rect x="20" y="34" width="24" height="18" fill="#F2D9A4" stroke="#8A6534" stroke-width="2"/>
        <path d="M20 34q12-16 24 0" fill="#3FA3AE" stroke="#0A5964" stroke-width="2"/>
        <rect x="8" y="22" width="6" height="30" fill="#F2D9A4" stroke="#8A6534" stroke-width="1.8"/>
        <rect x="50" y="22" width="6" height="30" fill="#F2D9A4" stroke="#8A6534" stroke-width="1.8"/>
        <path d="M11 22l0-4M53 22l0-4M30 26a5 5 0 1 1 2 6" stroke="#8A6534" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      );
    case "knowrelay": // 지식의 릴레이 — 바통이 된 책
      return M(
        `<rect x="24" y="24" width="16" height="12" rx="2" fill="#F7FAFC" stroke="#5C677D" stroke-width="2.2" transform="rotate(-12 32 30)"/>
        <path d="M8 34h12m-4-4 4 4-4 4M44 30h12m-4-4 4 4-4 4" stroke="#C2843A" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 52q16 6 32 0" stroke="#AAB4C4" stroke-width="2.8" stroke-linecap="round"/>`,
      );
    case "germanmove": // 게르만 이동 — 남하하는 화살들
      return M(
        `<path d="M18 12q-2 14 4 26m-5-6 5 6 6-4" stroke="#8A6534" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M40 14q4 12 0 24m-5-5 5 5 6-3" stroke="#C2843A" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 50h40" stroke="#AAB4C4" stroke-width="3" stroke-linecap="round"/>
        <path d="M26 50l3-6h6l3 6" stroke="#5C677D" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`,
      );
    case "crownpope": // 카롤루스 대관 — 관을 씌우는 손
      return M(
        `<path d="M20 30l3-9 6 6 3-9 3 9 6-6 3 9z" fill="#F2CE86" stroke="#C2843A" stroke-width="2" stroke-linejoin="round"/>
        <rect x="20" y="30" width="24" height="6" rx="2.4" fill="#E8B45E" stroke="#C2843A" stroke-width="1.8"/>
        <path d="M46 16q6 4 6 10M18 16q-6 4-6 10" stroke="#8A96A6" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <circle cx="32" cy="48" r="8" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.2"/>`,
      );
    case "sophiadome": // 성 소피아 — 큰 돔
      return M(
        `<rect x="14" y="36" width="36" height="16" fill="#E4EAF2" stroke="#5C677D" stroke-width="2"/>
        <path d="M14 36q18-20 36 0" fill="#9AA6B6" stroke="#5C677D" stroke-width="2"/>
        <path d="M32 16v-6" stroke="#5C677D" stroke-width="2" stroke-linecap="round"/>
        <rect x="22" y="42" width="6" height="10" fill="#5C677D"/><rect x="36" y="42" width="6" height="10" fill="#5C677D"/>`,
      );
    case "twochurch": // 동서 교회 — 두 갈래 성당
      return M(
        `<path d="M16 28q6-10 12 0v22h-12z" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2"/>
        <path d="M36 28l6-8 6 8v22h-12z" fill="#FBEFDA" stroke="#C2843A" stroke-width="2"/>
        <path d="M32 22v20" stroke="#AAB4C4" stroke-width="2" stroke-dasharray="3 4"/>`,
      );
    case "vassal": // 주종 서약 — 맞잡은 손과 검
      return M(
        `<circle cx="22" cy="18" r="7" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.2"/>
        <path d="M22 25v14l10 6M42 20v18l-10 7" stroke="#3C4654" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <circle cx="42" cy="13" r="7" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.2"/>
        <path d="M50 34v14M46 38h8" stroke="#5C677D" stroke-width="2.6" stroke-linecap="round"/>`,
      );
    case "manor": // 장원 — 성과 밭
      return M(
        `<rect x="24" y="18" width="16" height="18" fill="#E4EAF2" stroke="#5C677D" stroke-width="2"/>
        <path d="M24 18h4v-4h3v4h4v-4h3v4h2" fill="none" stroke="#5C677D" stroke-width="2"/>
        <path d="M10 52q6-8 12 0M26 52q6-8 12 0M42 52q6-8 12 0" stroke="#3FA36E" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <path d="M8 44h48" stroke="#8A6534" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "canossa": // 카노사 — 눈 내리는 성문
      return M(
        `<rect x="18" y="20" width="28" height="32" fill="#9AA6B6" stroke="#5C677D" stroke-width="2.2"/>
        <path d="M18 20h5v-4h4v4h5v-4h5v4h5v-4h4v4" fill="none" stroke="#5C677D" stroke-width="2"/>
        <path d="M27 52v-12q5-6 10 0v12" fill="#4E5968"/>
        <circle cx="12" cy="16" r="1.8" fill="#DCE8F0"/><circle cx="52" cy="12" r="1.8" fill="#DCE8F0"/><circle cx="10" cy="34" r="1.8" fill="#DCE8F0"/><circle cx="54" cy="30" r="1.8" fill="#DCE8F0"/>`,
      );
    case "gothicrose": // 고딕 — 첨탑과 장미창
      return M(
        `<path d="M20 24l6-14 6 14v28h-12z" fill="#E4EAF2" stroke="#5C677D" stroke-width="2"/>
        <circle cx="44" cy="30" r="10" fill="#3D2E86" stroke="#5C677D" stroke-width="2"/>
        <path d="M44 22v16M36 30h16M38 24l12 12M50 24l-12 12" stroke="#F2A0B6" stroke-width="1.6"/>`,
      );
    case "crusadegate": // 십자군 이후 — 열린 성문과 배
      return M(
        `<path d="M12 26h16v26H12z" fill="#C9B394" stroke="#8A6534" stroke-width="2"/>
        <path d="M14 26v-4h4v4m2 0v-4h4v4" fill="none" stroke="#8A6534" stroke-width="1.8"/>
        <path d="M34 46q8-4 14 0t8 0" stroke="#3FA3AE" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <path d="M40 44h12l-3 6h-7z" fill="#C89A5E" stroke="#84582A" stroke-width="1.8"/>
        <path d="M46 44V32l8 8h-8" fill="#F7FAFC" stroke="#5C677D" stroke-width="1.8" stroke-linejoin="round"/>`,
      );
    case "guildtown": // 길드 도시 — 연장 문장 방패
      return M(
        `<path d="M32 10l18 6v14q0 16-18 24-18-8-18-24V16z" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M24 28l16 12M40 28L24 40" stroke="#0A5964" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="32" cy="34" r="3.4" fill="#C2843A"/>`,
      );
    case "fadingmanor": // 장원 해체 — 기우는 담장과 새싹
      return M(
        `<path d="M10 44l24-6" stroke="#8A6534" stroke-width="3" stroke-linecap="round"/>
        <path d="M14 44v-8m8 6v-8m8 6v-8" stroke="#8A6534" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M46 52v-14" stroke="#3FA36E" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M46 42q-8-2-8-10 8 0 8 10zM46 38q8-2 8-10-8 0-8 10z" fill="#8FCE6E" stroke="#3FA36E" stroke-width="1.8"/>`,
      );
    case "renartist": // 르네상스 — 이젤과 팔레트
      return M(
        `<path d="M20 14h24v26H20zM18 40h28M24 40l-4 12M40 40l4 12" stroke="#8A6534" stroke-width="2.4" fill="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="32" cy="26" r="6" fill="#FFE8CE" stroke="#3C4654" stroke-width="2"/>
        <path d="M46 16q8 2 6 9-4-1-6-4z" fill="#F2A0B6" stroke="#C25A7A" stroke-width="1.6"/>`,
      );
    /* ── Ⅳ. 지역 세계의 교류와 변화 ── */
    case "brushrule": // 문치주의 — 붓이 칼보다 위
      return M(
        `<path d="M12 40h40" stroke="#8A6534" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M32 40V22" stroke="#8A6534" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M18 40v-8l14-14 4 4-12 14z" fill="#33405A" stroke="#1E2838" stroke-width="1.6" stroke-linejoin="round" transform="translate(0 -10) scale(.8) translate(6 8)"/>
        <path d="M40 48h10v5H40z" fill="#B9C4D4" stroke="#5E6A7A" stroke-width="1.6"/>
        <path d="M44 48v-9" stroke="#5E6A7A" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M14 22l10-8 3 4-9 9z" fill="#3FA3AE" stroke="#0A5964" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M15 46q17 6 34 0" stroke="#C2843A" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      );
    case "sepae": // 세폐 — 비단 두루마리와 은 꾸러미
      return M(
        `<rect x="10" y="26" width="26" height="12" rx="6" fill="#3FA3AE" stroke="#0A5964" stroke-width="2"/>
        <circle cx="36" cy="32" r="6" fill="#E2F1F3" stroke="#0A5964" stroke-width="1.8"/>
        <path d="M40 42q-2-8 6-9 8-1 8 7 0 8-7 8t-7-6z" fill="#E4EAF2" stroke="#5E6A7A" stroke-width="2"/>
        <path d="M44 33l3-4 3 4" stroke="#5E6A7A" stroke-width="1.8" fill="none"/>
        <path d="M14 48h36m-30-4l-6 4 6 4" stroke="#C2843A" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "wanggaehyeok": // 왕안석 개혁 — 접힌 개혁안 문서
      return M(
        `<path d="M18 12h22l8 8v32H18z" fill="#FFFFFF" stroke="#5C677D" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M40 12v8h8" fill="none" stroke="#5C677D" stroke-width="2"/>
        <path d="M24 28h16M24 36h16M24 44h10" stroke="#B9C4D4" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M42 44l8-8 4 4-8 8-5 1z" fill="#3FA3AE" stroke="#0A5964" stroke-width="1.6" stroke-linejoin="round"/>`,
      );
    case "northword": // 북방 민족의 독자 문자 — 새 글자를 새긴 패
      return M(
        `<rect x="16" y="10" width="32" height="44" rx="6" fill="#C9B394" stroke="#6E4E26" stroke-width="2.2"/>
        <path d="M26 20h12M32 20v10m-8 6h16m-14 8h12" stroke="#4A3410" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M24 44l6 4m4-4l6 4" stroke="#4A3410" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="48" cy="14" r="5" fill="#C0392B" stroke="#84281E" stroke-width="1.6"/>`,
      );
    case "ricegrow": // 모내기 — 물 댄 논의 모 두 줌
      return M(
        `<path d="M8 44h48v8H8z" fill="#7EA6C4" stroke="#4E7694" stroke-width="2"/>
        <path d="M22 44V32m0 0q-6-2-6-10 6 0 6 10zm0 0q6-2 6-10-6 0-6 10z" stroke="#3FA36E" stroke-width="2.4" fill="#8FCE6E" stroke-linejoin="round"/>
        <path d="M42 44V34m0 0q-5-2-5-9 5 0 5 9zm0 0q5-2 5-9-5 0-5 9z" stroke="#3FA36E" stroke-width="2.2" fill="#8FCE6E" stroke-linejoin="round"/>
        <path d="M12 48h8m6 0h8m6 0h8" stroke="#5E8EAE" stroke-width="1.8" stroke-linecap="round"/>`,
      );
    case "jiaozi": // 교자 — 세계 최초의 지폐
      return M(
        `<rect x="12" y="18" width="40" height="26" rx="4" fill="#DCE8CE" stroke="#5E7A4E" stroke-width="2.2"/>
        <circle cx="32" cy="31" r="7" fill="none" stroke="#5E7A4E" stroke-width="2"/>
        <path d="M17 24h8M39 38h8" stroke="#5E7A4E" stroke-width="2" stroke-linecap="round"/>
        <path d="M20 50q12 6 24 0" stroke="#C2843A" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      );
    case "sadaebu": // 사대부와 성리학 — 책 위의 붓
      return M(
        `<path d="M12 40q10-6 20-2 10 4 20-2v10q-10 6-20 2-10-4-20 2z" fill="#F2E7CE" stroke="#8A6534" stroke-width="2" stroke-linejoin="round"/>
        <path d="M32 38V48" stroke="#8A6534" stroke-width="1.6"/>
        <path d="M28 34l12-18 4 3-12 18-5 2z" fill="#3FA3AE" stroke="#0A5964" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="45" cy="13" r="3" fill="#C2843A"/>`,
      );
    case "threeinvent": // 3대 발명 — 화약·나침반·활자
      return M(
        `<rect x="10" y="34" width="12" height="16" rx="3" fill="#C0392B" stroke="#84281E" stroke-width="1.8"/>
        <path d="M16 34v-6m0 0l-3-4m3 4l3-4" stroke="#E0A72E" stroke-width="2" stroke-linecap="round"/>
        <circle cx="38" cy="42" r="9" fill="#F0DCB0" stroke="#8A6534" stroke-width="2"/>
        <path d="M38 36l3 8-3-2-3 2z" fill="#C0392B" stroke="#84281E" stroke-width="1.2" stroke-linejoin="round"/>
        <rect x="50" y="34" width="7" height="7" rx="1.5" fill="#8A96A6" stroke="#4A5668" stroke-width="1.4"/>
        <rect x="50" y="43" width="7" height="7" rx="1.5" fill="#8A96A6" stroke="#4A5668" stroke-width="1.4"/>
        <path d="M20 18q12-8 24 0" stroke="#3FA3AE" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-dasharray="2 5"/>`,
      );
    case "khanflag": // 칭기즈 칸 — 초원의 깃발과 천호 대열
      return M(
        `<path d="M20 54V14" stroke="#6E4E26" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M20 14h22l-6 7 6 7H20z" fill="#3FA3AE" stroke="#0A5964" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="30" cy="46" r="2.4" fill="#8A6534"/><circle cx="38" cy="46" r="2.4" fill="#8A6534"/><circle cx="46" cy="46" r="2.4" fill="#8A6534"/>
        <circle cx="34" cy="53" r="2.4" fill="#8A6534"/><circle cx="42" cy="53" r="2.4" fill="#8A6534"/>`,
      );
    case "yuanrule": // 원의 통치 — 대도 성문과 교초
      return M(
        `<path d="M12 50V30h40v20" stroke="#6E4E26" stroke-width="2.2" fill="#C9B394"/>
        <path d="M8 30h48l-6-9H14z" fill="#8A6534" stroke="#5E4626" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M26 50v-12h12v12" fill="#4A3410" stroke="#4A3410" stroke-width="1.6"/>
        <rect x="40" y="12" width="14" height="18" rx="2" fill="#DCE8CE" stroke="#5E7A4E" stroke-width="1.8"/>
        <path d="M43 17h8m-8 5h8" stroke="#5E7A4E" stroke-width="1.4" stroke-linecap="round"/>`,
      );
    case "colorppl": // 색목인 — 여러 빛깔의 사람들
      return M(
        `<circle cx="20" cy="24" r="6" fill="#3FA3AE" stroke="#0A5964" stroke-width="1.8"/>
        <path d="M12 46q0-10 8-10t8 10z" fill="#3FA3AE" stroke="#0A5964" stroke-width="1.8"/>
        <circle cx="42" cy="24" r="6" fill="#C2843A" stroke="#8F5A1D" stroke-width="1.8"/>
        <path d="M34 46q0-10 8-10t8 10z" fill="#C2843A" stroke="#8F5A1D" stroke-width="1.8"/>
        <path d="M24 52h16" stroke="#5B4AC0" stroke-width="2.4" stroke-linecap="round"/>`,
      );
    case "paiza": // 역참 패자 — 통행증 패
      return M(
        `<circle cx="32" cy="18" r="6" fill="none" stroke="#5E6A7A" stroke-width="2.4"/>
        <rect x="20" y="22" width="24" height="32" rx="8" fill="#E4EAF2" stroke="#5E6A7A" stroke-width="2.2"/>
        <path d="M26 32h12m-12 7h12m-12 7h8" stroke="#8A96A6" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    case "eastwest": // 동서 교류 — 마주 오가는 화살표와 낙타
      return M(
        `<path d="M10 22h36m-8-5l8 5-8 5" stroke="#C2843A" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M54 34H18m8-5l-8 5 8 5" stroke="#3FA3AE" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M24 52q3-7 8-7 3-4 6 0 5 0 7 7z" fill="#C9A05E" stroke="#6E4E26" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="45" cy="42" r="2.4" fill="#C9A05E"/>`,
      );
    case "hongmu": // 홍무제 — 한족 왕조의 회복(관모와 육유 두루마리)
      return M(
        `<path d="M18 26h28v10q0 6-14 6t-14-6z" fill="#33405A" stroke="#1E2838" stroke-width="2"/>
        <path d="M14 26h36" stroke="#1E2838" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M10 20l8 6M54 20l-8 6" stroke="#1E2838" stroke-width="2" stroke-linecap="round"/>
        <rect x="22" y="44" width="20" height="10" rx="4" fill="#F2E7CE" stroke="#8A6534" stroke-width="1.8"/>
        <path d="M27 49h10" stroke="#8A6534" stroke-width="1.6" stroke-linecap="round"/>`,
      );
    case "treasureship": // 정화의 보물선
      return M(
        `<path d="M10 42h44l-8 10H18z" fill="#8A6034" stroke="#42280F" stroke-width="2" stroke-linejoin="round"/>
        <path d="M22 42V22q8 4 8 10v10M42 42V26q6 3 6 8v8" fill="#EFE6D2" stroke="#8A7A56" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M22 20l6 2-6 2z" fill="#C0392B"/>
        <path d="M6 56q6-4 12 0t12 0 12 0 12 0" stroke="#4E7694" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
      );
    case "qingrise": // 청 — 팔기의 깃발 두 폭
      return M(
        `<path d="M22 54V14" stroke="#6E4E26" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M22 14l20 4-20 8z" fill="#E0B45E" stroke="#8A6218" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M42 54V24" stroke="#6E4E26" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M42 24l14 3-14 6z" fill="#C0392B" stroke="#84281E" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M14 54h40" stroke="#8A6534" stroke-width="2.2" stroke-linecap="round"/>`,
      );
    case "fistshake": // 강경책과 회유책 — 주먹과 악수
      return M(
        `<rect x="10" y="22" width="18" height="16" rx="6" fill="#C0392B" stroke="#84281E" stroke-width="2"/>
        <path d="M13 28h12M13 33h12" stroke="#84281E" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M36 30l8-4 6 4 4-2v10l-6 4-8-2-6-4z" fill="#F6C89A" stroke="#B4763A" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M40 34l6 3" stroke="#B4763A" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M18 48q14 8 28-2" stroke="#8B95A1" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="2 5"/>`,
      );
    case "newcrops": // 새 작물 — 고추와 옥수수
      return M(
        `<path d="M22 22q8-4 12 4 4 9-3 16-7 6-12 0-5-7 3-20z" fill="#D04A34" stroke="#84281E" stroke-width="2"/>
        <path d="M24 20q2-5 8-5" stroke="#3E6844" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M44 26q7 10 3 22-7-2-9-10t6-12z" fill="#F2D07E" stroke="#B4863A" stroke-width="2"/>
        <path d="M42 30l6 2m-7 5l7 2m-6 5l6 2" stroke="#B4863A" stroke-width="1.4" stroke-linecap="round"/>`,
      );
    case "silverflow": // 은 유입 — 말굽 은과 지구 화살
      return M(
        `<path d="M18 36q-3-10 8-11 10-1 10 8 0 10-9 10t-9-7z" fill="#E4EAF2" stroke="#5E6A7A" stroke-width="2.2"/>
        <path d="M24 28l4-5 4 5" stroke="#5E6A7A" stroke-width="1.8" fill="none"/>
        <circle cx="46" cy="44" r="10" fill="#DCEFF6" stroke="#4E7694" stroke-width="2"/>
        <path d="M40 41q6-4 12 0M40 47q6 4 12 0M46 34v20" stroke="#4E7694" stroke-width="1.4" fill="none"/>
        <path d="M12 50q14 8 24-2m-9-1l9 1-2 9" stroke="#C2843A" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "sinsa": // 신사 — 유교적 소양의 향촌 지도층
      return M(
        `<circle cx="32" cy="22" r="8" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.2"/>
        <path d="M22 16h20l-4-6H26z" fill="#33405A" stroke="#1E2838" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M20 52q0-14 12-14t12 14z" fill="#3FA3AE" stroke="#0A5964" stroke-width="2.2"/>
        <path d="M46 40h8m-4-4v8" stroke="#C2843A" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "operamask": // 경극 — 무대의 가면
      return M(
        `<path d="M18 16q14-8 28 0 4 16-4 28-10 10-20 0-8-12-4-28z" fill="#F7FAFC" stroke="#5C677D" stroke-width="2.2"/>
        <path d="M24 28q4-3 7 0M40 28q-4-3-7 0" stroke="#C0392B" stroke-width="2.2" fill="none" stroke-linecap="round" transform="translate(-1.5 0)"/>
        <path d="M26 40q6 5 12 0" stroke="#33405A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M32 14v8M22 18l4 6M42 18l-4 6" stroke="#C2843A" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "worldmapkr": // 곤여만국전도 — 타원 세계 지도
      return M(
        `<ellipse cx="32" cy="32" rx="24" ry="17" fill="#DCEFF6" stroke="#4E7694" stroke-width="2.2"/>
        <path d="M18 26q6-6 12-2 5 4 2 9-6 3-10-1t-4-6zM40 24q6 0 8 6-2 6-8 4t0-10zM30 42q6-2 10 2-4 4-10 2z" fill="#F2E7CE" stroke="#C4B28E" stroke-width="1.4"/>
        <path d="M32 15v34" stroke="#4E7694" stroke-width="1" opacity=".5"/>`,
      );
    case "samurai": // 무사의 등장 — 투구와 칼
      return M(
        `<path d="M18 30q0-12 14-12t14 12v6H18z" fill="#5E6A8C" stroke="#3E4864" stroke-width="2.2"/>
        <path d="M14 24l8 6M50 24l-8 6M32 18v-6" stroke="#3E4864" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="32" cy="12" r="2.6" fill="#E0B45E"/>
        <path d="M20 52l20-12 4 3-20 12z" fill="#B9C4D4" stroke="#5E6A7A" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M42 42l6-2" stroke="#8A6534" stroke-width="3" stroke-linecap="round"/>`,
      );
    case "sankin": // 산킨코타이 — 에도로 향하는 행렬
      return M(
        `<path d="M8 46q24-8 48 0" stroke="#B99B66" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="1 8"/>
        <circle cx="18" cy="38" r="3" fill="#33405A"/><circle cx="28" cy="36" r="3" fill="#33405A"/><circle cx="38" cy="36" r="3" fill="#33405A"/>
        <path d="M46 38V22" stroke="#6E4E26" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M46 22l12 3-12 5z" fill="#3FA3AE" stroke="#0A5964" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M8 22h14v8H8zM11 22v-4h8v4" fill="#C9B394" stroke="#6E4E26" stroke-width="1.8" stroke-linejoin="round"/>`,
      );
    case "chonin": // 조닌 문화 — 가부키 부채와 목판
      return M(
        `<path d="M14 40l10-20q8-6 16 0l10 20q-18 8-36 0z" fill="#F2A0B6" stroke="#C25A7A" stroke-width="2" stroke-linejoin="round" transform="rotate(-8 32 32)"/>
        <path d="M24 22l8 16M40 22l-8 16M32 18v20" stroke="#C25A7A" stroke-width="1.6" transform="rotate(-8 32 32)"/>
        <rect x="38" y="42" width="16" height="12" rx="2" fill="#C9B394" stroke="#6E4E26" stroke-width="1.8"/>
        <path d="M42 46h8m-8 4h5" stroke="#6E4E26" stroke-width="1.4" stroke-linecap="round"/>`,
      );
    case "tongsinsa": // 통신사 — 바다를 건너는 사절의 배
      return M(
        `<path d="M12 42h40l-7 9H19z" fill="#C9B394" stroke="#6E4E26" stroke-width="2" stroke-linejoin="round"/>
        <path d="M32 42V18" stroke="#6E4E26" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M32 18h14l-4 6 4 6H32z" fill="#3FA3AE" stroke="#0A5964" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M8 56q6-4 12 0t12 0 12 0 12 0" stroke="#4E7694" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <rect x="18" y="34" width="10" height="8" rx="2" fill="#F2E7CE" stroke="#8A6534" stroke-width="1.6"/>`,
      );
    case "mughaldome": // 무굴 제국 — 돔과 초승달
      return M(
        `<path d="M32 14q14 8 14 22v6H18v-6q0-14 14-22z" fill="#E8F0F6" stroke="#5E6A7A" stroke-width="2.2"/>
        <path d="M32 14v-4" stroke="#5E6A7A" stroke-width="2" stroke-linecap="round"/>
        <path d="M14 42h36v8H14z" fill="#C9B394" stroke="#6E4E26" stroke-width="2"/>
        <path d="M28 50v-8q4-4 8 0v8" fill="#5E6A7A"/>
        <path d="M52 16a6 6 0 1 0 3 11 4.8 4.8 0 1 1-3-11z" fill="#E0B45E" stroke="#8A6218" stroke-width="1.4"/>`,
      );
    case "akbartol": // 아크바르의 관용 — 맞잡은 두 손
      return M(
        `<path d="M10 30q8-8 18 0l4 4" stroke="#B4763A" stroke-width="2.4" fill="#F6C89A" stroke-linejoin="round"/>
        <path d="M54 30q-8-8-18 0l-4 4" stroke="#8F5A1D" stroke-width="2.4" fill="#E8B478" stroke-linejoin="round"/>
        <path d="M26 34l6 4 6-4" stroke="#8F5A1D" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M20 52q12 6 24 0" stroke="#3FA36E" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <circle cx="32" cy="16" r="4" fill="#FFE8B0" stroke="#C2843A" stroke-width="1.6"/>`,
      );
    case "taxback": // 아우랑제브 — 다시 걷는 세금 문서
      return M(
        `<rect x="16" y="14" width="28" height="36" rx="4" fill="#FFFFFF" stroke="#5C677D" stroke-width="2.2"/>
        <path d="M22 24h16m-16 8h16m-16 8h10" stroke="#B9C4D4" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="44" cy="44" r="9" fill="#FBEFDA" stroke="#C2843A" stroke-width="2"/>
        <path d="M44 39v10m-3-7h6" stroke="#8F5A1D" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "tajmahal": // 타지마할 — 돔과 네 첨탑
      return M(
        `<path d="M32 20q10 6 10 16v6H22v-6q0-10 10-16z" fill="#F7FAFC" stroke="#8A96A6" stroke-width="2.2"/>
        <path d="M32 20v-5" stroke="#8A96A6" stroke-width="2" stroke-linecap="round"/>
        <rect x="14" y="42" width="36" height="8" rx="2" fill="#F0ECE2" stroke="#8A96A6" stroke-width="1.8"/>
        <path d="M12 42V24m40 18V24" stroke="#8A96A6" stroke-width="2.4" stroke-linecap="round"/>
        <circle cx="12" cy="21" r="2.4" fill="#F7FAFC" stroke="#8A96A6" stroke-width="1.4"/>
        <circle cx="52" cy="21" r="2.4" fill="#F7FAFC" stroke="#8A96A6" stroke-width="1.4"/>
        <path d="M10 56q22-6 44 0" stroke="#7EA6C4" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
      );
    case "indoislam": // 인도·이슬람 문화 — 아치와 연꽃
      return M(
        `<path d="M16 50V32q0-14 16-14t16 14v18h-8V34q0-8-8-8t-8 8v16z" fill="#E8D4A4" stroke="#8A6A3E" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M32 54q-8-8 0-14 8 6 0 14z" fill="#F2A0B6" stroke="#C25A7A" stroke-width="1.8"/>
        <path d="M24 54q2-5 6-6m10 6q-2-5-6-6" stroke="#C25A7A" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
      );
    case "osmanmoon": // 오스만 제국 — 초승달과 별의 깃발
      return M(
        `<path d="M18 54V12" stroke="#6E4E26" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M18 12h30v22H18z" fill="#C0392B" stroke="#84281E" stroke-width="2" stroke-linejoin="round"/>
        <path d="M30 17a7 7 0 1 0 4 12 5.6 5.6 0 1 1-4-12z" fill="#FFFFFF"/>
        <path d="M39 21l1.6 3.4 3.6.4-2.7 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.5 3.6-.4z" fill="#FFFFFF"/>`,
      );
    case "shipoverhill": // 1453 — 산을 넘는 배
      return M(
        `<path d="M6 50q14-22 28-10 12-14 24 4" stroke="#8A6534" stroke-width="2.4" fill="#D8C8A4" stroke-linejoin="round"/>
        <path d="M22 34h20l-4 6H26z" fill="#8A6034" stroke="#42280F" stroke-width="1.8" stroke-linejoin="round" transform="rotate(-9 32 37)"/>
        <path d="M32 33V20" stroke="#42280F" stroke-width="2" stroke-linecap="round" transform="rotate(-9 32 30)"/>
        <path d="M32 20l9 2-9 5z" fill="#EFE6D2" stroke="#8A7A56" stroke-width="1.4" transform="rotate(-9 32 24)"/>
        <path d="M14 44l6 2m24-8l6 2" stroke="#5E4626" stroke-width="1.8" stroke-linecap="round"/>`,
      );
    case "milletring": // 밀레트 — 서로 다른 공동체의 원
      return M(
        `<circle cx="22" cy="26" r="10" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2"/>
        <circle cx="42" cy="26" r="10" fill="#FBEFDA" stroke="#C2843A" stroke-width="2"/>
        <circle cx="32" cy="44" r="10" fill="#EDEAFA" stroke="#5B4AC0" stroke-width="2"/>
        <circle cx="22" cy="26" r="3" fill="#0E7C8A"/><circle cx="42" cy="26" r="3" fill="#C2843A"/><circle cx="32" cy="44" r="3" fill="#5B4AC0"/>`,
      );
    case "yeniceri": // 예니체리 — 술탄 친위대의 모자와 창
      return M(
        `<path d="M22 30q0-10 10-10t10 10v6H22z" fill="#F7FAFC" stroke="#5C677D" stroke-width="2.2"/>
        <path d="M22 36h20l-4 16H26z" fill="#C0392B" stroke="#84281E" stroke-width="2" stroke-linejoin="round"/>
        <path d="M50 54V16m0 0l-4 8h8z" stroke="#5E6A7A" stroke-width="2.2" fill="#8A96A6" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "coffeecup": // 커피 하우스 — 김 오르는 잔
      return M(
        `<path d="M16 30h26v12q0 10-13 10T16 42z" fill="#F7FAFC" stroke="#5C677D" stroke-width="2.2"/>
        <path d="M42 33q8 0 8 6t-8 6" stroke="#5C677D" stroke-width="2" fill="none"/>
        <path d="M20 34q9 4 18 0v6q-9 4-18 0z" fill="#6E4A26" opacity=".85"/>
        <path d="M24 24q3-5 0-9M33 24q3-5 0-9" stroke="#8B95A1" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
      );
    case "caravel": // 신항로 — 대양을 건너는 범선
      return M(
        `<path d="M10 44h44l-8 9H18z" fill="#8A6034" stroke="#42280F" stroke-width="2" stroke-linejoin="round"/>
        <path d="M28 44V16" stroke="#42280F" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M28 18q-11 6-11 15 6-3 11-1zM28 18q12 7 12 16-6-3-12-2z" fill="#EFE6D2" stroke="#8A7A56" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M28 16l7 2-7 3z" fill="#C0392B"/>
        <path d="M6 58q6-4 12 0t12 0 12 0 12 0" stroke="#4E7694" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
      );
    case "routes3": // 세 항로 — 갈라지는 세 화살
      return M(
        `<circle cx="32" cy="14" r="5" fill="#F2E7CE" stroke="#C4B28E" stroke-width="1.8"/>
        <path d="M28 20Q16 34 12 50m1-9l-1 9 9-2" stroke="#C2843A" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M32 21V50m-4-8l4 8 4-8" stroke="#0E7C8A" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M36 20q12 14 16 30m-1-9l1 9-9-2" stroke="#7C6BFF" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "andes": // 잉카의 유산 — 산 위 돌계단 도시
      return M(
        `<path d="M8 54L26 20l12 20 8-12 10 26z" fill="#8FA68E" stroke="#4E6E4E" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M20 44h12m-14 5h16m-18 5h20" stroke="#F2E7CE" stroke-width="2" stroke-linecap="round"/>
        <circle cx="48" cy="14" r="4" fill="#FFD98A" stroke="#E0A72E" stroke-width="1.6"/>`,
      );
    case "triangle": // 삼각 무역 — 세 꼭짓점의 순환
      return M(
        `<circle cx="32" cy="14" r="6" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2"/>
        <circle cx="14" cy="46" r="6" fill="#EDEAFA" stroke="#5B4AC0" stroke-width="2"/>
        <circle cx="50" cy="46" r="6" fill="#FBEFDA" stroke="#C2843A" stroke-width="2"/>
        <path d="M37 19l10 20m-25-20l-10 20m8 27" stroke="#8B95A1" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 48h20m-6-4l6 4-6 4" stroke="#8B95A1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    case "pricecoin": // 가격 혁명 — 치솟는 동전 그래프
      return M(
        `<path d="M12 52V16M12 52h40" stroke="#5C677D" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M16 46q12 0 20-10t14-16" stroke="#C0392B" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M46 16l6 1-3 6z" fill="#C0392B"/>
        <circle cx="22" cy="40" r="4" fill="#E0B45E" stroke="#8A6218" stroke-width="1.6"/>
        <circle cx="30" cy="34" r="4" fill="#E0B45E" stroke="#8A6218" stroke-width="1.6"/>`,
      );
    case "theses95": // 루터 — 문에 붙은 반박문
      return M(
        `<rect x="14" y="10" width="36" height="44" rx="4" fill="#C9B394" stroke="#6E4E26" stroke-width="2.2"/>
        <path d="M32 10v44" stroke="#6E4E26" stroke-width="1.6" opacity=".6"/>
        <rect x="20" y="18" width="20" height="26" rx="2" fill="#FFFFFF" stroke="#5C677D" stroke-width="1.8" transform="rotate(-3 30 31)"/>
        <path d="M24 25h12m-12 5h12m-12 5h8" stroke="#B9C4D4" stroke-width="1.8" stroke-linecap="round" transform="rotate(-3 30 31)"/>
        <circle cx="30" cy="18" r="1.8" fill="#C0392B"/>`,
      );
    case "predest": // 칼뱅 — 책과 곧게 뻗은 빛
      return M(
        `<path d="M12 44q10-5 20-1 10 4 20-1v9q-10 5-20 1-10-4-20 1z" fill="#F2E7CE" stroke="#8A6534" stroke-width="2" stroke-linejoin="round"/>
        <path d="M32 42v10" stroke="#8A6534" stroke-width="1.6"/>
        <circle cx="32" cy="18" r="6" fill="#FFE8B0" stroke="#C2843A" stroke-width="1.8"/>
        <path d="M32 26v12M24 22l-8-6M40 22l8-6" stroke="#C2843A" stroke-width="2" stroke-linecap="round"/>`,
      );
    case "westfalen": // 베스트팔렌 — 조약 문서 위 악수
      return M(
        `<rect x="14" y="30" width="36" height="24" rx="4" fill="#FFFFFF" stroke="#5C677D" stroke-width="2.2"/>
        <path d="M20 40h24m-24 6h16" stroke="#B9C4D4" stroke-width="2" stroke-linecap="round"/>
        <path d="M14 20q8-6 14 0l4 3 4-3q6-6 14 0" stroke="#B4763A" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path d="M28 23l4 3 4-3" stroke="#8F5A1D" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
      );
    case "taxarmy": // 재정·군사 국가 — 대포와 동전
      return M(
        `<path d="M14 40l26-14 6 10-24 14z" fill="#5E6A7A" stroke="#3E4864" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="22" cy="48" r="7" fill="#33405A" stroke="#1E2838" stroke-width="2"/>
        <circle cx="48" cy="20" r="6" fill="#E0B45E" stroke="#8A6218" stroke-width="1.8"/>
        <circle cx="54" cy="32" r="5" fill="#E0B45E" stroke="#8A6218" stroke-width="1.8"/>`,
      );
    case "gloriousrev": // 명예혁명 — 의회와 권리 장전
      return M(
        `<path d="M12 30h40v22H12z" fill="#E8EEF4" stroke="#5E6A7A" stroke-width="2.2"/>
        <path d="M18 30v22m9-22v22m10 0V30m9 22V30" stroke="#9AAABA" stroke-width="1.8"/>
        <path d="M12 30l20-12 20 12z" fill="#C4D0DC" stroke="#5E6A7A" stroke-width="2" stroke-linejoin="round"/>
        <rect x="40" y="38" width="16" height="20" rx="2" fill="#FFFFFF" stroke="#C2843A" stroke-width="1.8" transform="rotate(6 48 48)"/>
        <path d="M44 44h8m-8 5h8" stroke="#C2843A" stroke-width="1.6" stroke-linecap="round" transform="rotate(6 48 48)"/>`,
      );
    case "sunking": // 루이 14세 — 태양과 왕관
      return M(
        `<circle cx="32" cy="28" r="10" fill="#FFD98A" stroke="#E0A72E" stroke-width="2"/>
        <path d="M32 12v-4M32 48v-4M16 28h-4M52 28h-4M20 16l-3-3M44 16l3-3M20 40l-3 3M44 40l3 3" stroke="#E0A72E" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M22 50l4-8 6 5 6-5 4 8z" fill="#E0B45E" stroke="#8A6218" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M22 50h20v4H22z" fill="#B88A34" stroke="#8A6218" stroke-width="1.6"/>`,
      );
    case "camelroad": // 비단길 — 사막의 낙타
      return M(
        `<path d="M8 46q14-8 24-4t24-6" stroke="#E0B25E" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M22 42q4-8 10-8 3-5 7 0 6 0 9 8l-3 8h-4l-1-5h-9l-1 5h-4z" fill="#C9A05E" stroke="#6E4E26" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="43" cy="30" r="3" fill="#C9A05E"/>
        <rect x="26" y="30" width="9" height="5" rx="2" fill="#0E7C8A"/>
        <circle cx="50" cy="12" r="5" fill="#FFD98A" stroke="#E0A72E" stroke-width="1.8"/>`,
      );
    default:
      return M(`<circle cx="32" cy="32" r="16" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2.6"/>`);
  }
}
