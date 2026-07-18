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
    default:
      return M(`<circle cx="32" cy="32" r="16" fill="#E2F1F3" stroke="#0E7C8A" stroke-width="2.6"/>`);
  }
}
