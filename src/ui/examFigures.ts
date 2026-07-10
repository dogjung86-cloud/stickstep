// 단원 종합 평가 그림 — 손코딩 교육용 SVG (u3 열 파일럿).
// heatFigures 문법 계승: 색은 답의 단서가 되지 않게(비교 곡선은 같은 색, 라벨만 구분),
// 그래프·표는 파라미터형으로 만들어 문항마다 수치를 달리 쓴다. 새 단원 시험 그림은 섹션을 나눠 추가.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/* ══════════════ u3 열 ══════════════ */

/** 열평형 시간-온도 그래프(파라미터형) — 뜨거운 쪽·차가운 쪽이 tEq분에 eq℃로 만난다. (라이트) */
export function eqGraph(o: {
  hot: number;
  cold: number;
  eq: number;
  tEq: number;
  tMax: number;
  yMax: number;
  yStep: number;
  hotLabel?: string;
  coldLabel?: string;
}): string {
  const yMin = 0;
  const gx = (t: number): number => 40 + t * (280 / o.tMax);
  const gy = (T: number): number => 186 - ((T - yMin) / (o.yMax - yMin)) * 160;
  const xStep = o.tMax <= 8 ? 1 : 2;
  let xt = "";
  for (let t = 0; t <= o.tMax; t += xStep) {
    xt += `<line x1="${gx(t)}" y1="186" x2="${gx(t)}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(t)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${t}</text>`;
  }
  let yt = "";
  for (let T = yMin; T <= o.yMax; T += o.yStep) {
    yt += `<line x1="40" y1="${gy(T)}" x2="320" y2="${gy(T)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="32" y="${gy(T) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${T}</text>`;
  }
  const curve = (from: number, color: string): string => {
    const d = from - o.eq;
    return `<path d="M40,${gy(from)} C ${gx(o.tEq * 0.4)},${gy(o.eq + d * 0.3)} ${gx(o.tEq * 0.68)},${gy(o.eq + d * 0.07)} ${gx(o.tEq)},${gy(o.eq)} L ${gx(o.tMax)},${gy(o.eq)}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
  };
  const hotName = o.hotLabel ?? "(가)";
  const coldName = o.coldLabel ?? "(나)";
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="온도가 다른 두 물질이 접촉한 후의 시간-온도 그래프. 두 곡선이 한 점에서 만나 나란해진다">
    ${yt}${xt}
    <line x1="40" y1="26" x2="40" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${gx(o.tEq)}" y1="${gy(o.eq)}" x2="${gx(o.tEq)}" y2="186" stroke="#B9C2CE" stroke-width="1.4" stroke-dasharray="4 5"/>
    ${curve(o.hot, "#FF6B4A")}
    ${curve(o.cold, "#3182F6")}
    <text x="48" y="${gy(o.hot) + 4}" font-size="13" font-weight="700" fill="#E8542F">${hotName}</text>
    <text x="48" y="${gy(o.cold) + (o.cold < o.eq ? 16 : -8)}" font-size="13" font-weight="700" fill="#1B64DA">${coldName}</text>
    <text x="8" y="14" font-size="11" fill="#4E5968">온도(℃)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">시간(분)</text>
  </svg>`;
}

/** 질량이 같은 물질들을 같은 세기 불로 가열한 직선 그래프(파라미터형). 선 색은 전부 같다. (라이트) */
export function heatCurves(o: {
  start: number;
  ends: { label: string; T: number }[];
  tMax: number;
  yMax: number;
  yStep: number;
}): string {
  const gx = (t: number): number => 40 + t * (280 / o.tMax);
  const gy = (T: number): number => 186 - (T / o.yMax) * 160;
  let xt = "";
  for (let t = 0; t <= o.tMax; t += 1) {
    xt += `<line x1="${gx(t)}" y1="186" x2="${gx(t)}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(t)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${t}</text>`;
  }
  let yt = "";
  for (let T = 0; T <= o.yMax; T += o.yStep) {
    yt += `<line x1="40" y1="${gy(T)}" x2="320" y2="${gy(T)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="32" y="${gy(T) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${T}</text>`;
  }
  const lines = o.ends
    .map(
      (e) => `<line x1="${gx(0)}" y1="${gy(o.start)}" x2="${gx(o.tMax)}" y2="${gy(e.T)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="${gx(o.tMax) + 4}" y="${gy(e.T) + 4}" font-size="12.5" font-weight="700" fill="#4E5968">${e.label}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="질량이 같은 물질들을 같은 양의 열로 가열한 시간-온도 그래프. 온도가 오르는 기울기가 서로 다르다">
    ${yt}${xt}
    <line x1="40" y1="26" x2="40" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    ${lines}
    <text x="8" y="14" font-size="11" fill="#4E5968">온도(℃)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">시간(분)</text>
  </svg>`;
}

/** 가벼운 SVG 표(파라미터형) — 표 해석 문항용. 셀 텍스트는 짧게. (라이트) */
export function svgTable(head: string[], rows: string[][], o?: { firstColHead?: boolean }): string {
  const W = 344;
  const cols = head.length;
  const colW = (W - 16) / cols;
  const rowH = 32;
  const H = rowH * (rows.length + 1) + 16;
  const cellX = (c: number): number => 8 + c * colW;
  let out = `<rect x="8" y="8" width="${W - 16}" height="${rowH}" fill="#F2F4F7"/>`;
  head.forEach((h, c) => {
    out += `<text x="${cellX(c) + colW / 2}" y="${8 + rowH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${h}</text>`;
  });
  rows.forEach((r, i) => {
    const y = 8 + rowH * (i + 1);
    if (o?.firstColHead) out += `<rect x="8" y="${y}" width="${colW}" height="${rowH}" fill="#F7F8FA"/>`;
    r.forEach((v, c) => {
      out += `<text x="${cellX(c) + colW / 2}" y="${y + rowH / 2 + 4.5}" text-anchor="middle" font-size="12.5" ${c === 0 && o?.firstColHead ? 'font-weight="700"' : ""} fill="#333D4B">${v}</text>`;
    });
  });
  let grid = "";
  for (let i = 0; i <= rows.length + 1; i++) {
    grid += `<line x1="8" y1="${8 + rowH * i}" x2="${W - 8}" y2="${8 + rowH * i}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  }
  for (let c = 0; c <= cols; c++) {
    grid += `<line x1="${8 + c * colW}" y1="8" x2="${8 + c * colW}" y2="${8 + rowH * (rows.length + 1)}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="자료 표">${out}${grid}</svg>`;
}

/** 온도가 다른 물 (가)(나) — 입자 운동 2박스 모형 (다크) */
export function particleDuo(): string {
  const box = (bx: number, label: string, spread: number, trail: number): string => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 9; i++) {
      const c = i % 3;
      const r = Math.floor(i / 3);
      const cx = 56 + (c - 1) * spread + (i % 2 ? 3 : -2) * (spread / 16);
      const cy = 50 + (r - 1) * spread + (i % 3 === 1 ? 4 : -2) * (spread / 16);
      pts.push([cx, cy]);
    }
    const parts = pts
      .map(([x, y], i) => {
        const a1 = (i * 137) % 360;
        const trails =
          trail < 1
            ? ""
            : [0, 1]
                .map((k) => {
                  const ang = ((a1 + k * 150) * Math.PI) / 180;
                  const dx = Math.cos(ang) * (trail + 3);
                  const dy = Math.sin(ang) * (trail + 3);
                  return `<line x1="${(x - dx * 0.4).toFixed(1)}" y1="${(y - dy * 0.4).toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}" stroke="#8FB3E8" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
                })
                .join("");
        return `${trails}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5" fill="#6E9EDB"/><circle cx="${(x - 2).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="2" fill="rgba(255,255,255,.4)"/>`;
      })
      .join("");
    return `<g transform="translate(${bx},10)">
      <rect x="0" y="0" width="112" height="100" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
      ${parts}
      <text x="56" y="126" text-anchor="middle" font-size="14" font-weight="700" fill="#AFC3E3">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 140" ${NS} role="img" aria-label="같은 물질 (가)와 (나)의 입자 운동 모형. (나)의 입자가 더 활발하게 움직이고 간격도 넓다">
    ${box(40, "(가)", 22, 0)}
    ${box(192, "(나)", 31, 8)}
  </svg>`;
}

/** 온도계 눈금 읽기 — 큰 눈금 10℃, 작은 눈금 2℃, 액체 기둥이 value℃까지. (라이트) */
export function thermometerRead(value: number): string {
  const yOf = (T: number): number => 168 - T * 2.6; // 0℃=168, 50℃=38
  let ticks = "";
  for (let T = 0; T <= 50; T += 2) {
    const major = T % 10 === 0;
    ticks += `<line x1="${major ? 132 : 140}" y1="${yOf(T)}" x2="152" y2="${yOf(T)}" stroke="#8B95A1" stroke-width="${major ? 1.8 : 1}"/>`;
    if (major) ticks += `<text x="124" y="${yOf(T) + 4}" text-anchor="end" font-size="12" fill="#4E5968">${T}</text>`;
  }
  return `<svg viewBox="0 0 344 214" ${NS} role="img" aria-label="눈금이 새겨진 알코올 온도계. 액체 기둥이 눈금 사이 어느 지점까지 올라와 있다">
    <rect x="156" y="26" width="18" height="150" rx="9" fill="#F4F6F8" stroke="#8B95A1" stroke-width="2"/>
    <circle cx="165" cy="188" r="16" fill="#F25C54" stroke="#8B95A1" stroke-width="2"/>
    <rect x="160" y="${yOf(value)}" width="10" height="${178 - yOf(value)}" rx="5" fill="#F25C54"/>
    ${ticks}
    <text x="196" y="40" font-size="11.5" fill="#8B95A1">단위: ℃</text>
    <path d="M214 ${yOf(value)} h-32" stroke="#3182F6" stroke-width="1.6" stroke-dasharray="4 4"/>
    <text x="220" y="${yOf(value) + 4}" font-size="12" font-weight="700" fill="#1B64DA">액체 기둥 끝</text>
  </svg>`;
}

/** 열의 이동 세 장면 (가)(나)(다) — 짝짓기 문항용. (라이트) */
export function threeWaysFig(): string {
  const flame = (x: number, y: number, s = 1): string =>
    `<g transform="translate(${x},${y}) scale(${s})"><path d="M0 10 C 8 5 5 -2 0 -9 C -5 -2 -8 5 0 10 Z" fill="#FF9F43"/><path d="M0 6.5 C 4.5 3.5 3 -1 0 -5 C -3 -1 -4.5 3.5 0 6.5 Z" fill="#FFD98A"/></g>`;
  const panel = (x: number, label: string, inner: string): string =>
    `<g transform="translate(${x},8)">
      <rect x="0" y="0" width="104" height="128" rx="12" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
      ${inner}
      <text x="52" y="152" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  // (가) 전도 — 금속 막대의 한쪽 끝 가열, 열이 손잡이 쪽으로 번짐
  const cond = `
    <defs><linearGradient id="exRodG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#F0442E"/><stop offset=".55" stop-color="#FF9F43"/><stop offset="1" stop-color="#8B95A1"/>
    </linearGradient></defs>
    <rect x="14" y="52" width="76" height="12" rx="6" fill="url(#exRodG)"/>
    <rect x="14" y="52" width="76" height="12" rx="6" fill="none" stroke="#6B7684" stroke-width="1.2"/>
    ${flame(22, 86, 1)}
    <path d="M34 40 h34 M62 35 l8 5 -8 5" fill="none" stroke="#FF6B4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  // (나) 대류 — 주전자 물이 순환
  const conv = `
    <path d="M28 36 h48 v52 a8 8 0 0 1 -8 8 h-32 a8 8 0 0 1 -8 -8 Z" fill="#DCEBFB" stroke="#6B7684" stroke-width="1.6"/>
    <path d="M52 82 c-12 0 -16 -8 -16 -16 s6 -16 16 -16 16 8 16 16" fill="none" stroke="#0CA6C0" stroke-width="2.6"/>
    <path d="M68 58 l3 9 -9 -2" fill="none" stroke="#0CA6C0" stroke-width="2.2" stroke-linejoin="round"/>
    ${flame(52, 106, 1)}`;
  // (다) 복사 — 태양의 열이 물질 없이 직접 도달
  const rad = `
    <circle cx="26" cy="30" r="13" fill="#FFD98A" stroke="#F5A623" stroke-width="2"/>
    <g stroke="#F5A623" stroke-width="2" stroke-linecap="round"><path d="M26 10v-5M26 55v-5M6 30H2M45 30h5"/></g>
    <g stroke="#FF6B4A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M40 42 L64 66 M64 66 l-8 -1 M64 66 l1 -8"/>
      <path d="M46 34 L78 66 M78 66 l-8 -1 M78 66 l1 -8" opacity=".65"/>
    </g>
    <rect x="16" y="100" width="74" height="10" rx="5" fill="#D9E2EC"/>
    <text x="53" y="94" text-anchor="middle" font-size="10" fill="#8B95A1">땅</text>`;
  return `<svg viewBox="0 0 344 164" ${NS} fill="none" role="img" aria-label="열이 이동하는 세 장면. (가) 금속 막대 한쪽 끝을 가열, (나) 주전자 속 물의 순환, (다) 태양의 열이 땅에 직접 도달">
    ${panel(8, "(가)", cond)}
    ${panel(120, "(나)", conv)}
    ${panel(232, "(다)", rad)}
  </svg>`;
}

/** 해풍/육풍 — 낮(mode "day")·밤(mode "night")의 해안 대류 순환. (라이트) */
export function seaBreeze(mode: "day" | "night"): string {
  const day = mode === "day";
  const skyIcon = day
    ? `<circle cx="46" cy="36" r="15" fill="#FFD98A" stroke="#F5A623" stroke-width="2"/>
       <g stroke="#F5A623" stroke-width="2" stroke-linecap="round"><path d="M46 14v-6M46 64v-6M24 36h-6M74 36h-6"/></g>`
    : `<path d="M52 22 a15 15 0 1 0 8 27 a12 12 0 0 1 -8 -27 Z" fill="#DFE6F4" stroke="#8B95A1" stroke-width="1.8"/>
       <circle cx="86" cy="26" r="1.8" fill="#B9C2CE"/><circle cx="104" cy="42" r="1.6" fill="#B9C2CE"/><circle cx="70" cy="48" r="1.4" fill="#B9C2CE"/>`;
  // 낮: 육지 위 상승(빨강 위 화살), 바다 위 하강(파랑 아래 화살), 지표 바람은 바다→육지
  // 밤: 반대 — 상승은 바다, 하강은 육지, 지표 바람은 육지→바다
  const upX = day ? 96 : 258;
  const dnX = day ? 258 : 96;
  const surf = day
    ? `<path d="M282 150 H140 M140 150 l10 -6 M140 150 l10 6" stroke="#0CA6C0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M110 150 H252 M252 150 l-10 -6 M252 150 l-10 6" stroke="#0CA6C0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 344 216" ${NS} role="img" aria-label="${day ? "낮" : "밤"}의 해안. 육지와 바다 위 공기의 오르내림과 지표 부근 바람의 방향을 나타낸 그림">
    <rect x="8" y="8" width="328" height="160" rx="14" fill="${day ? "#F2F8FE" : "#EEF1F8"}" stroke="#DCE0E6" stroke-width="1.4"/>
    ${skyIcon}
    <path d="M8 132 C 60 118 110 122 168 140 L168 168 L8 168 Z" fill="#EFD9A8" stroke="#D9BC7C" stroke-width="1.4"/>
    <rect x="168" y="140" width="168" height="28" fill="#9CC4EE"/>
    <path d="M176 146 q8 -5 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" fill="none" stroke="#7FAFE4" stroke-width="2"/>
    <path d="M${upX} 128 V76 M${upX} 76 l-7 10 M${upX} 76 l7 10" stroke="#FF6B4A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${dnX} 76 V128 M${dnX} 128 l-7 -10 M${dnX} 128 l7 -10" stroke="#3182F6" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${surf}
    <text x="66" y="188" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">육지</text>
    <text x="266" y="188" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">바다</text>
    <text x="172" y="210" text-anchor="middle" font-size="11" fill="#8B95A1">화살표: 공기의 움직임</text>
  </svg>`;
}

/** 비열 비교 실험 순서도 — ㉠에 들어갈 결론을 묻는 문항용. (라이트) */
export function flowChart(): string {
  const boxStyle = `fill="#F7F8FA" stroke="#B0B8C1" stroke-width="1.5"`;
  const arrow = (x: number, y1: number, y2: number): string =>
    `<path d="M${x} ${y1} V${y2} M${x} ${y2} l-5 -7 M${x} ${y2} l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  // '예'와 '아니요'가 각자 다른 결론 칸(㉠/㉡)으로 갈라진다 — 한 상자로 수렴하면 순서도로서 혼동(감사 지적)
  return `<svg viewBox="0 0 344 258" ${NS} role="img" aria-label="비열 비교 실험 순서도. 질량을 같게 한 두 물질을 같은 세기 불로 가열해 온도 변화를 비교하고, 예 갈래의 결론 칸 ㉠과 아니요 갈래의 결론 칸 ㉡은 비어 있다">
    <rect x="62" y="8" width="220" height="34" rx="10" ${boxStyle}/>
    <text x="172" y="30" text-anchor="middle" font-size="12.5" font-weight="700" fill="#333D4B">물질 A와 B의 질량을 같게 잰다</text>
    ${arrow(172, 42, 58)}
    <rect x="62" y="58" width="220" height="34" rx="10" ${boxStyle}/>
    <text x="172" y="80" text-anchor="middle" font-size="12.5" font-weight="700" fill="#333D4B">같은 세기의 불로 같은 시간 가열한다</text>
    ${arrow(172, 92, 108)}
    <path d="M172 108 L294 134 L172 160 L50 134 Z" fill="#FFF6E6" stroke="#E8B04B" stroke-width="1.5"/>
    <text x="172" y="131" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">A의 온도가 B보다</text>
    <text x="172" y="147" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">많이 올랐다?</text>
    <text x="308" y="126" font-size="11.5" font-weight="700" fill="#4E5968">예</text>
    <path d="M294 134 H249 V170" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M249 170 l-5 -7 M249 170 l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>
    <text x="24" y="126" font-size="11.5" font-weight="700" fill="#4E5968">아니요</text>
    <path d="M50 134 H95 V170" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M95 170 l-5 -7 M95 170 l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="182" y="172" width="134" height="36" rx="10" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="249" y="195" text-anchor="middle" font-size="14" font-weight="800" fill="#1B64DA">㉠</text>
    <rect x="28" y="172" width="134" height="36" rx="10" ${boxStyle}/>
    <text x="95" y="195" text-anchor="middle" font-size="14" font-weight="800" fill="#6B7684">㉡</text>
    <text x="172" y="240" text-anchor="middle" font-size="11.5" fill="#8B95A1">'예'라면 결론 칸 ㉠에는 어떤 말이 들어갈까요?</text>
  </svg>`;
}

/** 바이메탈 가열 전/후 — A(위)·B(아래)를 붙인 띠가 가열 후 A 쪽(위)으로 휜다. (라이트) */
export function bimetalBend(): string {
  return `<svg viewBox="0 0 344 176" ${NS} role="img" aria-label="금속 A와 B를 붙인 바이메탈. 가열 전에는 곧고, 가열 후에는 A 쪽인 위로 휘어진다">
    <text x="86" y="24" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">가열 전</text>
    <text x="258" y="24" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">가열 후</text>
    <line x1="172" y1="16" x2="172" y2="162" stroke="#EDF0F4" stroke-width="1.6"/>
    <rect x="20" y="66" width="12" height="40" rx="2" fill="#C4CAD2"/>
    <rect x="32" y="78" width="112" height="9" rx="4.5" fill="#AFC6E8" stroke="#8FA6C6" stroke-width="1.2"/>
    <rect x="32" y="87" width="112" height="9" rx="4.5" fill="#9AA3AD" stroke="#7C8590" stroke-width="1.2"/>
    <text x="152" y="76" font-size="12" font-weight="700" fill="#5E7BA6">A(위)</text>
    <text x="152" y="104" font-size="12" font-weight="700" fill="#6B7684">B(아래)</text>
    <rect x="192" y="66" width="12" height="40" rx="2" fill="#C4CAD2"/>
    <path d="M204 82 Q 258 44 310 40" fill="none" stroke="#8FA6C6" stroke-width="10" stroke-linecap="round"/>
    <path d="M204 82 Q 258 44 310 40" fill="none" stroke="#AFC6E8" stroke-width="7" stroke-linecap="round"/>
    <path d="M204 91 Q 262 52 312 48" fill="none" stroke="#7C8590" stroke-width="10" stroke-linecap="round"/>
    <path d="M204 91 Q 262 52 312 48" fill="none" stroke="#9AA3AD" stroke-width="7" stroke-linecap="round"/>
    <path d="M250 148 c 6 -3 4.5 -8 0 -13 c -4.5 5 -6 10 0 13z" fill="#FF9F43"/>
    <path d="M268 148 c 6 -3 4.5 -8 0 -13 c -4.5 5 -6 10 0 13z" fill="#FF9F43"/>
    <text x="258" y="166" text-anchor="middle" font-size="11" fill="#8B95A1">아래에서 가열</text>
  </svg>`;
}

/** 바이메탈 화재경보기 — 위쪽에 접점·경보종, 아래쪽에서 화재의 열. (라이트) */
export function fireAlarm(): string {
  return `<svg viewBox="0 0 344 206" ${NS} role="img" aria-label="바이메탈 화재경보기 구조. 금속 (가)가 위, (나)가 아래인 띠가 있고, 띠의 오른쪽 끝 위에 접점과 경보종이 연결되어 있다">
    <rect x="8" y="8" width="328" height="172" rx="14" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
    <circle cx="284" cy="44" r="17" fill="#FFD98A" stroke="#C9A96A" stroke-width="2"/>
    <path d="M284 61 l-6 8 h12 Z" fill="#C9A96A"/>
    <text x="284" y="26" text-anchor="middle" font-size="11" fill="#8B95A1">경보종</text>
    <rect x="36" y="42" width="26" height="16" rx="3" fill="#C4CAD2"/>
    <text x="49" y="34" text-anchor="middle" font-size="11" fill="#8B95A1">전원</text>
    <path d="M62 50 H226" stroke="#6B7684" stroke-width="2"/>
    <path d="M267 44 H240 V96" stroke="#6B7684" stroke-width="2" fill="none"/>
    <rect x="232" y="96" width="16" height="8" rx="2" fill="#6B7684"/>
    <text x="286" y="102" text-anchor="middle" font-size="11" fill="#8B95A1">접점</text>
    <path d="M36 58 V128 H60" stroke="#6B7684" stroke-width="2" fill="none"/>
    <rect x="52" y="112" width="14" height="34" rx="2" fill="#C4CAD2"/>
    <rect x="66" y="122" width="176" height="8" rx="4" fill="#AFC6E8" stroke="#8FA6C6" stroke-width="1.1"/>
    <rect x="66" y="130" width="176" height="8" rx="4" fill="#9AA3AD" stroke="#7C8590" stroke-width="1.1"/>
    <text x="120" y="116" font-size="12" font-weight="700" fill="#5E7BA6">(가)</text>
    <text x="120" y="152" font-size="12" font-weight="700" fill="#6B7684">(나)</text>
    <path d="M154 172 c 6 -3 4.5 -8 0 -13 c -4.5 5 -6 10 0 13z" fill="#FF9F43"/>
    <path d="M176 172 c 6 -3 4.5 -8 0 -13 c -4.5 5 -6 10 0 13z" fill="#FF9F43"/>
    <text x="172" y="198" text-anchor="middle" font-size="11" fill="#8B95A1">화재가 나면 띠가 데워져요. 띠가 접점에 닿으면 경보가 울려요.</text>
  </svg>`;
}

/** 액체 열팽창 비교 — 같은 부피의 액체 A·B·C를 뜨거운 물 수조에 담근 뒤 유리관 높이. (라이트) */
export function liquidExpand(): string {
  const flask = (x: number, label: string, rise: number): string => `
    <rect x="${x + 21}" y="${60 - rise}" width="8" height="${52 + rise}" fill="#7FAFE4"/>
    <rect x="${x + 19}" y="36" width="12" height="78" rx="5" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M${x + 19} 108 L${x + 4} 138 a8 8 0 0 0 8 10 h26 a8 8 0 0 0 8 -10 L${x + 31} 108" fill="#B7D3F2" stroke="#8B95A1" stroke-width="1.8"/>
    <text x="${x + 25}" y="${52 - rise}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1B64DA">${label}</text>`;
  return `<svg viewBox="0 0 344 208" ${NS} role="img" aria-label="같은 부피의 액체 A, B, C가 든 병을 뜨거운 물에 담근 모습. 유리관 속 액체 높이가 A, B, C 순으로 높다">
    <rect x="16" y="118" width="312" height="66" rx="12" fill="#FBE3DC" stroke="#E8B0A0" stroke-width="1.6"/>
    <path d="M40 130 q8 -5 16 0 t16 0" fill="none" stroke="#E8A08C" stroke-width="1.6"/>
    <path d="M262 130 q8 -5 16 0 t16 0" fill="none" stroke="#E8A08C" stroke-width="1.6"/>
    <text x="296" y="176" text-anchor="middle" font-size="11" fill="#B0705E">뜨거운 물</text>
    <line x1="36" y1="60" x2="308" y2="60" stroke="#8B95A1" stroke-width="1.4" stroke-dasharray="5 5"/>
    <text x="36" y="52" font-size="10.5" fill="#8B95A1">처음 높이</text>
    ${flask(52, "A", 34)}
    ${flask(148, "B", 18)}
    ${flask(244, "C", 6)}
  </svg>`;
}

/** 금속 구와 고리 — (가) 가열 전에는 통과, (나) 구를 가열한 후에는 걸린다. (라이트) */
export function ringSphere(): string {
  const ring = (x: number, y: number): string => `
    <ellipse cx="${x}" cy="${y}" rx="34" ry="10" fill="none" stroke="#8B95A1" stroke-width="4"/>
    <ellipse cx="${x}" cy="${y}" rx="22" ry="6" fill="#fff"/>
    <line x1="${x + 32}" y1="${y + 8}" x2="${x + 44}" y2="${y + 40}" stroke="#8B95A1" stroke-width="3"/>`;
  return `<svg viewBox="0 0 344 196" ${NS} role="img" aria-label="금속 구와 고리 실험. 가열 전에는 구가 고리를 통과하고, 구를 가열한 후에는 고리에 걸려 통과하지 못한다">
    <text x="90" y="24" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">(가) 가열 전</text>
    <text x="256" y="24" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">(나) 구를 가열한 후</text>
    <line x1="172" y1="16" x2="172" y2="184" stroke="#EDF0F4" stroke-width="1.6"/>
    <circle cx="90" cy="52" r="19" fill="#C4CAD2" stroke="#7C8590" stroke-width="1.6"/>
    <circle cx="84" cy="46" r="5" fill="rgba(255,255,255,.55)"/>
    <path d="M90 78 V104 M90 104 l-6 -9 M90 104 l6 -9" fill="none" stroke="#3182F6" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    ${ring(90, 122)}
    <circle cx="90" cy="152" r="19" fill="#C4CAD2" stroke="#7C8590" stroke-width="1.6" opacity=".45"/>
    <circle cx="256" cy="66" r="23" fill="#E8B7A6" stroke="#B0705E" stroke-width="1.6"/>
    <circle cx="249" cy="59" r="6" fill="rgba(255,255,255,.5)"/>
    <path d="M236 94 c 6 -3 4.5 -8 0 -13 c -4.5 5 -6 10 0 13z" fill="#FF9F43"/>
    <path d="M276 94 c 6 -3 4.5 -8 0 -13 c -4.5 5 -6 10 0 13z" fill="#FF9F43"/>
    ${ring(256, 130)}
    <path d="M234 148 l44 -36 M278 148 l-44 -36" stroke="#F04452" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
  </svg>`;
}

/** 액체 팽창 실험 그래프 — 온도에 따라 유리관 눈금이 비례해 오르는 직선. 수치 읽기 문항용. (라이트) */
export function expandScaleGraph(): string {
  const gx = (T: number): number => 40 + T * 3.5; // 0~80℃
  const gy = (n: number): number => 186 - n * 4; // 0~40칸
  let xt = "";
  for (let T = 0; T <= 80; T += 20) {
    xt += `<line x1="${gx(T)}" y1="186" x2="${gx(T)}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(T)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${T}</text>`;
  }
  let yt = "";
  for (let n = 0; n <= 40; n += 10) {
    yt += `<line x1="40" y1="${gy(n)}" x2="320" y2="${gy(n)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="32" y="${gy(n) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${n}</text>`;
  }
  const dot = (T: number, n: number): string => `
    <line x1="${gx(T)}" y1="${gy(n)}" x2="${gx(T)}" y2="186" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>
    <line x1="40" y1="${gy(n)}" x2="${gx(T)}" y2="${gy(n)}" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>
    <circle cx="${gx(T)}" cy="${gy(n)}" r="4.5" fill="#3182F6"/>`;
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="온도에 따른 유리관 눈금 그래프. 원점을 지나는 직선 위에 20도에서 10칸, 60도에서 30칸인 점이 찍혀 있다">
    ${yt}${xt}
    <line x1="40" y1="26" x2="40" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(78)}" y2="${gy(39)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${dot(20, 10)}
    ${dot(60, 30)}
    <text x="8" y="14" font-size="11" fill="#4E5968">눈금(칸)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}
