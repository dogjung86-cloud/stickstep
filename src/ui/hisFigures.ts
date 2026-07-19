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
  const ticks = Array.from({ length: cents.length + 1 }, (_, i) => {
    const y = o.start * 100 + i * 100;
    const isOne = i === bcCount;
    const label = isOne ? "1" : String(Math.abs(y));
    const x = L + i * bw;
    return `<line x1="${x}" y1="${top + h}" x2="${x}" y2="${top + h + 6}" stroke="#8A6A3E" stroke-width="1.4"/>
      <text x="${x}" y="${top + h + 20}" text-anchor="middle" font-size="10" font-weight="${isOne ? 900 : 700}" fill="${isOne ? "#C2843A" : "#5B6570"}" font-family="Pretendard, sans-serif">${label}</text>`;
  }).join("");
  const evts = (o.events ?? [])
    .map((e, i) => {
      const min = o.start * 100;
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
    <line x1="${L + bcW}" y1="${top - 4}" x2="${L + bcW}" y2="${top + h + 4}" stroke="#E0A72E" stroke-width="2.6"/>
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
