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

/* ══════════════ u4 물질의 상태 변화 ══════════════ */
// 규칙 계승: 그래프 aria-label에 정답 수치 금지(값 읽기 문항의 답 노출 방지),
// 입자 모형은 다크·전부 같은 색(배열·간격·잔상만 단서), 실험 장치 저울 표시창은 빈 패널(숫자 각인 금지).

const P4 = "#6E9EDB"; // 입자 공통색(다크)
const dot4 = (x: number, y: number, r = 6): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${P4}"/><circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.33).toFixed(1)}" r="${(r * 0.3).toFixed(1)}" fill="rgba(255,255,255,.4)"/>`;
const trail4 = (x: number, y: number, ang: number, len: number): string => {
  const dx = Math.cos(ang) * len;
  const dy = Math.sin(ang) * len;
  return `<line x1="${(x - dx * 0.5).toFixed(1)}" y1="${(y - dy * 0.5).toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}" stroke="#8FB3E8" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
};
/** 입자 배치 3종 — 상자 좌표계(0,0)~(94,84) 기준 */
const GRID4 = (): string => {
  let out = "";
  for (let i = 0; i < 9; i++) out += dot4(26 + (i % 3) * 21, 22 + Math.floor(i / 3) * 21, 6.2);
  return out;
};
const CLUMP4 = (): string => {
  const pts: [number, number][] = [[30, 30], [46, 24], [62, 32], [24, 46], [40, 42], [56, 48], [70, 44], [34, 60], [52, 62]];
  return pts.map(([x, y]) => trail4(x, y, (x + y) % 6, 3.2) + dot4(x, y, 6)).join("");
};
const SCATTER4 = (): string => {
  const pts: [number, number, number][] = [[20, 18, 0.7], [66, 14, 2.4], [44, 40, 4.1], [16, 60, 1.2], [74, 62, 5.3], [50, 72, 3.2]];
  return pts.map(([x, y, a]) => trail4(x, y, a, 8.5) + dot4(x, y, 5.2)).join("");
};

/** 상태 변화 전후 입자 모형(다크) — 왼쪽 상자가 화살표를 지나 오른쪽 상자로.
 *  melt: 규칙→붙은 불규칙 · freeze: 붙은 불규칙→규칙 · condense: 흩어짐→붙은 불규칙 · sublime: 규칙→흩어짐 */
export function particlePairFig(kind: "melt" | "freeze" | "condense" | "sublime"): string {
  const inner: Record<string, [string, string, string]> = {
    melt: [GRID4(), CLUMP4(), "규칙적으로 늘어선 입자들이 화살표를 지나 서로 붙은 채 불규칙하게 흐트러진 배열로 변하는 모형"],
    freeze: [CLUMP4(), GRID4(), "서로 붙은 채 불규칙하게 배열된 입자들이 화살표를 지나 규칙적으로 늘어선 배열로 변하는 모형"],
    condense: [SCATTER4(), CLUMP4(), "멀리 흩어져 날아다니던 입자들이 화살표를 지나 서로 붙은 불규칙한 배열로 변하는 모형"],
    sublime: [GRID4(), SCATTER4(), "규칙적으로 늘어선 입자들이 화살표를 지나 멀리 흩어져 날아다니는 배열로 변하는 모형"],
  };
  const [a, b, aria] = inner[kind];
  return `<svg viewBox="0 0 344 124" ${NS} role="img" aria-label="${aria}">
    <g transform="translate(28,14)"><rect x="0" y="0" width="94" height="84" rx="13" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>${a}</g>
    <path d="M142 56h52" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M186 44l14 12-14 12" fill="none" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(222,14)"><rect x="0" y="0" width="94" height="84" rx="13" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>${b}</g>
  </svg>`;
}

/** 상태 변화 A~F 다이어그램(라이트) — 기체 위, 고체·액체 아래. 화살표 색은 전부 중립(열 출입 단서 금지). */
export function phaseTriFig(): string {
  const box = (x: number, y: number, label: string, mini: string): string =>
    `<g transform="translate(${x},${y})">
      <rect x="0" y="0" width="96" height="58" rx="12" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.5"/>
      <text x="48" y="24" text-anchor="middle" font-size="14" font-weight="800" fill="#333D4B">${label}</text>
      <g transform="translate(24,32)">${mini}</g>
    </g>`;
  const md = (x: number, y: number, r = 3.1): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="#8B95A1"/>`;
  const miniSolid = `${md(6, 6)}${md(16, 6)}${md(26, 6)}${md(6, 15)}${md(16, 15)}${md(26, 15)}`;
  const miniLiquid = `${md(7, 8)}${md(16, 5)}${md(25, 9)}${md(11, 15)}${md(21, 15)}`;
  const miniGas = `${md(4, 4, 2.7)}${md(24, 7, 2.7)}${md(13, 14, 2.7)}${md(30, 16, 2.7)}`;
  const arrow = (x1: number, y1: number, x2: number, y2: number, lab: string, lx: number, ly: number): string => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = (a: number): number => x2 - Math.cos(ang - a) * 9;
    const hy = (a: number): number => y2 - Math.sin(ang - a) * 9;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6B7684" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M${x2} ${y2} L${hx(0.44).toFixed(1)} ${hy(0.44).toFixed(1)} M${x2} ${y2} L${hx(-0.44).toFixed(1)} ${hy(-0.44).toFixed(1)}" stroke="#6B7684" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      <circle cx="${lx}" cy="${ly}" r="11" fill="#fff" stroke="#B0B8C1" stroke-width="1.4"/>
      <text x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${lab}</text>`;
  };
  return `<svg viewBox="0 0 344 252" ${NS} role="img" aria-label="고체, 액체, 기체 세 상자 사이의 상태 변화를 화살표 A부터 F로 나타낸 그림. A는 고체에서 액체로, B는 액체에서 고체로, C는 액체에서 기체로, D는 기체에서 액체로, E는 고체에서 기체로, F는 기체에서 고체로 향한다">
    ${box(124, 10, "기체", miniGas)}
    ${box(18, 180, "고체", miniSolid)}
    ${box(230, 180, "액체", miniLiquid)}
    ${arrow(122, 196, 222, 196, "A", 172, 182)}
    ${arrow(222, 222, 122, 222, "B", 172, 238)}
    ${arrow(268, 172, 210, 76, "C", 252, 118)}
    ${arrow(228, 66, 286, 162, "D", 292, 112)}
    ${arrow(76, 172, 134, 76, "E", 92, 112)}
    ${arrow(116, 66, 58, 162, "F", 52, 118)}
  </svg>`;
}

/** 수치형 가열·냉각 곡선(라이트) — 온도 축 눈금 숫자 포함(값 읽기 문항용).
 *  t = 구간 경계 시각 [t1,t2] 또는 [t1,t2,t3,t4]. p2가 없으면 수평 구간 1개.
 *  secLabels: ㉠~㉤ 구간 라벨. aria-label에는 수치를 쓰지 않는다. */
export function examCurveFig(o: {
  mode: "heat" | "cool";
  start: number;
  p1: number;
  p2?: number;
  end: number;
  t: number[];
  tMax: number;
  yMin?: number;
  yMax: number;
  yStep: number;
  xStep?: number;
  secLabels?: boolean;
}): string {
  const yMin = o.yMin ?? 0;
  const gx = (t: number): number => 44 + t * (272 / o.tMax);
  const gy = (T: number): number => 186 - ((T - yMin) / (o.yMax - yMin)) * 156;
  const xStep = o.xStep ?? 2;
  let xt = "";
  for (let t = 0; t <= o.tMax; t += xStep) {
    xt += `<line x1="${gx(t)}" y1="186" x2="${gx(t)}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(t)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${t}</text>`;
  }
  let yt = "";
  for (let T = yMin; T <= o.yMax; T += o.yStep) {
    yt += `<line x1="44" y1="${gy(T)}" x2="320" y2="${gy(T)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="36" y="${gy(T) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${T}</text>`;
  }
  const pts: [number, number][] = [[0, o.start]];
  if (o.p2 == null) {
    pts.push([o.t[0], o.p1], [o.t[1], o.p1], [o.tMax, o.end]);
  } else {
    pts.push([o.t[0], o.p1], [o.t[1], o.p1], [o.t[2], o.p2], [o.t[3], o.p2], [o.tMax, o.end]);
  }
  const path = pts.map(([t, T], i) => `${i === 0 ? "M" : "L"}${gx(t).toFixed(1)},${gy(T).toFixed(1)}`).join(" ");
  const dash = (T: number, tEnd: number): string =>
    `<line x1="44" y1="${gy(T)}" x2="${gx(tEnd)}" y2="${gy(T)}" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>`;
  let dashes = dash(o.p1, o.t[1]);
  if (o.p2 != null) dashes += dash(o.p2, o.t[3]);
  let secs = "";
  if (o.secLabels) {
    const marks = ["㉠", "㉡", "㉢", "㉣", "㉤"];
    const bounds = [0, ...o.t, o.tMax];
    for (let i = 0; i < bounds.length - 1 && i < marks.length; i++) {
      const mid = (bounds[i] + bounds[i + 1]) / 2;
      const Tof = (idx: number): number => pts[Math.min(idx, pts.length - 1)][1];
      const hi = Math.min(gy(Math.max(Tof(i), Tof(i + 1))), 170);
      secs += `<text x="${gx(mid)}" y="${hi - 12}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${marks[i]}</text>
        <line x1="${gx(bounds[i + 1])}" y1="186" x2="${gx(bounds[i + 1])}" y2="30" stroke="#DCE0E6" stroke-width="1" stroke-dasharray="2 4"/>`;
    }
  }
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="물질을 ${o.mode === "heat" ? "가열" : "냉각"}할 때 시간에 따른 온도 그래프. 온도가 일정하게 유지되는 수평 구간이 나타난다">
    ${yt}${xt}${dashes}${secs}
    <line x1="44" y1="26" x2="44" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="44" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <path d="${path}" fill="none" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="8" y="14" font-size="11" fill="#4E5968">온도(℃)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">시간(분)</text>
  </svg>`;
}

/** 전자저울 위 거름종이 + 액체 몇 방울(라이트) — 표시창은 빈 패널(숫자 각인 금지). */
export function evapScaleFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} role="img" aria-label="전자저울 위에 액체를 몇 방울 떨어뜨린 거름종이가 놓여 있고, 표면에서 무언가 피어오르는 그림">
    <ellipse cx="172" cy="96" rx="86" ry="14" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
    <ellipse cx="172" cy="92" rx="86" ry="14" fill="#F4F6F8" stroke="#8B95A1" stroke-width="2"/>
    <ellipse cx="172" cy="92" rx="58" ry="9" fill="#fff" stroke="#B0B8C1" stroke-width="1.4"/>
    <g fill="#9EC5FB"><ellipse cx="150" cy="90" rx="7" ry="3.4"/><ellipse cx="178" cy="93" rx="8" ry="3.8"/><ellipse cx="200" cy="89" rx="6" ry="3"/></g>
    <g stroke="#9EC5FB" stroke-width="2.2" fill="none" stroke-linecap="round">
      <path d="M150 76c-3-5 3-7 0-12M178 78c-3-5 3-7 0-13M200 76c-3-5 3-7 0-12"/>
      <path d="M147 58l3-4 3 4M175 59l3-4 3 4M197 58l3-4 3 4"/>
    </g>
    <path d="M96 108h152a10 10 0 0 1 10 10v30a10 10 0 0 1-10 10H96a10 10 0 0 1-10-10v-30a10 10 0 0 1 10-10z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2"/>
    <rect x="130" y="120" width="84" height="26" rx="6" fill="#2A3442"/>
    <circle cx="234" cy="133" r="7" fill="#fff" stroke="#B0B8C1" stroke-width="1.6"/>
    <text x="172" y="176" text-anchor="middle" font-size="11" fill="#8B95A1">전자저울</text>
    <text x="60" y="84" text-anchor="end" font-size="12" font-weight="700" fill="#4E5968">거름종이</text>
    <path d="M64 86l40 5" stroke="#B0B8C1" stroke-width="1.5"/>
  </svg>`;
}

/** 밀폐 플라스크 저울 실험(라이트) — (가) 액체 상태 / (나) 전부 기체가 된 후. 표시창은 빈 패널. */
export function sealedScaleFig(): string {
  const flask = (x: number, inner: string): string => `
    <g transform="translate(${x},0)">
      <rect x="60" y="18" width="20" height="12" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
      <path d="M62 30 v18 L38 92 a10 10 0 0 0 9 14 h46 a10 10 0 0 0 9-14 L78 48 v-18" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      ${inner}
      <path d="M52 112h36a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H52a8 8 0 0 1-8-8v-16a8 8 0 0 1 8-8z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="56" y="120" width="28" height="14" rx="4" fill="#2A3442"/>
    </g>`;
  const liquid = `<path d="M44 88 L96 88 a8 8 0 0 1 4 10 l-2 4 a8 8 0 0 1 -8 4 h-48 a8 8 0 0 1 -8 -4 l-2 -4 a8 8 0 0 1 4 -10z" fill="#B7D3F2" opacity=".9" transform="translate(0,0)"/>`;
  const gasDots = [[56, 60], [76, 52], [66, 76], [50, 88], [84, 84], [72, 96]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#9EC5FB" opacity=".85"/>`)
    .join("");
  return `<svg viewBox="0 0 344 176" ${NS} role="img" aria-label="마개로 밀폐한 플라스크를 전자저울에 올린 두 장면. (가)는 바닥에 액체가 조금 있고, (나)는 액체가 모두 기체로 변한 뒤의 모습이다">
    ${flask(18, liquid)}
    ${flask(186, gasDots)}
    <text x="88" y="170" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가) 가열 전</text>
    <text x="256" y="170" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나) 모두 기체가 된 후</text>
  </svg>`;
}

/** 물의 응고 부피 변화(라이트) — 같은 병의 (가) 물 / (나) 언 뒤. 언 뒤의 높이가 더 높다. */
export function waterFreezeFig(): string {
  const jar = (x: number, level: number, fill: string, cracked: boolean): string => `
    <g transform="translate(${x},0)">
      <path d="M20 30 h72 v104 a10 10 0 0 1-10 10 H30 a10 10 0 0 1-10-10z" fill="none" stroke="#8B95A1" stroke-width="2.2"/>
      <path d="M24 ${level} h64 v${140 - level} a6 6 0 0 1-6 6 H30 a6 6 0 0 1-6-6z" fill="${fill}"/>
      ${cracked ? `<path d="M40 ${level + 10} l10 14 -8 12 M66 ${level + 6} l-6 16 9 13" fill="none" stroke="#fff" stroke-width="1.8" opacity=".8"/>` : ""}
      <line x1="12" y1="72" x2="20" y2="72" stroke="#8B95A1" stroke-width="1.6"/>
      <line x1="12" y1="102" x2="20" y2="102" stroke="#8B95A1" stroke-width="1.6"/>
    </g>`;
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="같은 유리병에 담긴 (가) 물과, 통째로 얼린 뒤의 (나). 언 뒤의 표면 높이가 물일 때보다 높다">
    ${jar(28, 82, "#B7D3F2", false)}
    ${jar(200, 62, "#EAF4FF", true)}
    <line x1="52" y1="82" x2="292" y2="82" stroke="#F04452" stroke-width="1.4" stroke-dasharray="5 5" opacity=".6"/>
    <text x="84" y="170" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가) 물</text>
    <text x="256" y="170" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나) 언 뒤</text>
    <text x="84" y="190" text-anchor="middle" font-size="11" fill="#8B95A1">처음 높이</text>
  </svg>`;
}

/** 물질의 상태 분류 순서도(라이트) — 예/아니요가 각자의 결론 칸으로 갈라진다(㉠·㉡·㉢ 빈칸). */
export function stateFlowFig(): string {
  const boxStyle = `fill="#F7F8FA" stroke="#B0B8C1" stroke-width="1.5"`;
  const ansBox = (x: number, y: number, lab: string): string =>
    `<rect x="${x}" y="${y}" width="88" height="34" rx="10" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.5"/>
     <text x="${x + 44}" y="${y + 22}" text-anchor="middle" font-size="14" font-weight="800" fill="#1B64DA">${lab}</text>`;
  const arr = (x1: number, y1: number, x2: number, y2: number): string =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
     <path d="M${x2} ${y2} l-5 -7 M${x2} ${y2} l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round" transform="rotate(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI - 90} ${x2} ${y2})"/>`;
  return `<svg viewBox="0 0 344 264" ${NS} role="img" aria-label="물질의 상태를 나누는 순서도. 첫 질문은 담는 그릇에 따라 모양이 변하는지이고, 아니요 갈래는 결론 칸 ㉠, 예 갈래는 부피도 변하는지 물은 뒤 아니요는 ㉡, 예는 ㉢ 결론 칸으로 이어진다. 결론 칸은 모두 비어 있다">
    <rect x="122" y="8" width="100" height="32" rx="10" ${boxStyle}/>
    <text x="172" y="29" text-anchor="middle" font-size="13" font-weight="700" fill="#333D4B">물질</text>
    ${arr(172, 40, 172, 58)}
    <path d="M172 58 L296 88 L172 118 L48 88 Z" fill="#FFF6E6" stroke="#E8B04B" stroke-width="1.5"/>
    <text x="172" y="83" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">담는 그릇에 따라</text>
    <text x="172" y="99" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">모양이 변하는가?</text>
    <text x="30" y="80" font-size="11.5" font-weight="700" fill="#4E5968">아니요</text>
    <path d="M48 88 H30 V140" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M30 140 l-5 -7 M30 140 l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>
    ${ansBox(8, 142, "㉠")}
    <text x="310" y="80" font-size="11.5" font-weight="700" fill="#4E5968">예</text>
    <path d="M296 88 H314 V118" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M314 118 H232 V132" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M232 132 l-5 -7 M232 132 l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M232 134 L296 162 L232 190 L168 162 Z" fill="#FFF6E6" stroke="#E8B04B" stroke-width="1.5"/>
    <text x="232" y="157" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">담는 그릇에 따라</text>
    <text x="232" y="173" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">부피도 변하는가?</text>
    <text x="150" y="154" font-size="11.5" font-weight="700" fill="#4E5968">아니요</text>
    <path d="M168 162 H120 V212" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M120 212 l-5 -7 M120 212 l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>
    ${ansBox(76, 214, "㉡")}
    <text x="304" y="154" font-size="11.5" font-weight="700" fill="#4E5968">예</text>
    <path d="M296 162 H316 V212" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M316 212 l-5 -7 M316 212 l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>
    ${ansBox(240, 214, "㉢")}
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

/* ══════════════ u5 힘의 작용 ══════════════ */
// 규칙 계승: 값 읽기 정답 수치는 aria-label 금지(그림 속 조건 값 서술은 동등 접근이라 허용),
// 힘 화살표 길이는 크기에 비례, 저울 표시창은 빈 패널, num 정답은 눈금선 위.

/** 상자에 작용하는 두 힘(파라미터형, 라이트) — opposite=false면 같은 방향(오른쪽), true면 서로 반대. */
export function forcePairFig(o: { a: number; b: number; opposite?: boolean }): string {
  const maxN = Math.max(o.a, o.b);
  const len = (n: number): number => 30 + (n / maxN) * 80;
  const arrowR = (x: number, y: number, n: number): string =>
    `<path d="M${x} ${y}h${len(n) - 12}" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
     <path d="M${x + len(n)} ${y}l-13-7v14z" fill="#5E6B7E"/>
     <text x="${x + len(n) / 2}" y="${y - 10}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${n} N</text>`;
  const arrowL = (x: number, y: number, n: number): string =>
    `<path d="M${x} ${y}h-${len(n) - 12}" stroke="#5E6B7E" stroke-width="4" stroke-linecap="round"/>
     <path d="M${x - len(n)} ${y}l13-7v14z" fill="#5E6B7E"/>
     <text x="${x - len(n) / 2}" y="${y - 10}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${n} N</text>`;
  const body = o.opposite
    ? `${arrowR(202, 82, o.a)}${arrowL(142, 82, o.b)}`
    : `${arrowR(202, 70, o.a)}${arrowR(202, 96, o.b)}`;
  return `<svg viewBox="0 0 344 130" ${NS} role="img" aria-label="상자에 ${o.a} N과 ${o.b} N의 두 힘이 ${o.opposite ? "서로 반대 방향" : "같은 방향"}으로 작용하는 그림">
    <line x1="24" y1="112" x2="320" y2="112" stroke="#D5DBE3" stroke-width="2"/>
    <rect x="142" y="60" width="60" height="44" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
    ${body}
  </svg>`;
}

/** 미는데도 정지한 상자(라이트) — 마찰력(정지) 문항용. 미는 힘 n N 화살표 + 거친 바닥 빗금. */
export function pushStillFig(n: number): string {
  let hatch = "";
  for (let x = 30; x <= 314; x += 16) hatch += `<line x1="${x}" y1="118" x2="${x - 9}" y2="130" stroke="#C9B49A" stroke-width="2"/>`;
  return `<svg viewBox="0 0 344 150" ${NS} role="img" aria-label="거친 바닥 위의 상자를 옆으로 ${n} N으로 밀고 있지만 상자는 정지해 있는 그림">
    <line x1="20" y1="118" x2="324" y2="118" stroke="#B08D5E" stroke-width="3"/>
    ${hatch}
    <rect x="150" y="66" width="66" height="52" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
    <path d="M84 92h48" stroke="#F04452" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M146 92l-14-8v16z" fill="#F04452"/>
    <text x="104" y="74" text-anchor="middle" font-size="13" font-weight="700" fill="#D6363F">${n} N</text>
    <text x="183" y="52" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">정지 상태</text>
  </svg>`;
}

/** 용수철 탄성력 그래프(파라미터형, 라이트) — slope N/cm 직선 + 안내선 점. 눈금 숫자 포함(값 읽기용). */
export function springExamGraph(o: { slope: number; xMax: number; xStep: number; yMax: number; yStep: number; dots?: number[] }): string {
  const gx = (cm: number): number => 48 + cm * (264 / o.xMax);
  const gy = (n: number): number => 168 - (n / o.yMax) * 138;
  let xt = "";
  for (let c = 0; c <= o.xMax; c += o.xStep) {
    xt += `<line x1="${gx(c)}" y1="168" x2="${gx(c)}" y2="26" stroke="#EDF0F4" stroke-width="1"/><text x="${gx(c)}" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">${c}</text>`;
  }
  let yt = "";
  for (let n = 0; n <= o.yMax; n += o.yStep) {
    yt += `<line x1="48" y1="${gy(n)}" x2="320" y2="${gy(n)}" stroke="#EDF0F4" stroke-width="1"/><text x="40" y="${gy(n) + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">${n}</text>`;
  }
  const endCm = Math.min(o.xMax, o.yMax / o.slope);
  const dots = (o.dots ?? [])
    .map(
      (cm) => `<circle cx="${gx(cm)}" cy="${gy(cm * o.slope)}" r="4.2" fill="#5E6B7E"/>
    <line x1="${gx(cm)}" y1="${gy(cm * o.slope)}" x2="${gx(cm)}" y2="168" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>
    <line x1="48" y1="${gy(cm * o.slope)}" x2="${gx(cm)}" y2="${gy(cm * o.slope)}" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="용수철이 늘어난 길이에 따른 탄성력 그래프. 원점을 지나는 직선이다">
    ${yt}${xt}
    <line x1="48" y1="26" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="320" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(endCm)}" y2="${gy(endCm * o.slope)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${dots}
    <text x="10" y="16" font-size="11" fill="#4E5968">탄성력(N)</text>
    <text x="320" y="198" text-anchor="end" font-size="11" fill="#4E5968">늘어난 길이(cm)</text>
  </svg>`;
}

/** 용수철저울 부력 3장면(라이트) — (가) 공기 중 / (나) 절반 잠김 / (다) 완전 잠김. 표시창은 빈 패널. */
export function buoyThreeFig(): string {
  const scene = (x: number, label: string, waterTop: number | null, sink: number): string => {
    const wy = 92 + sink;
    return `<g transform="translate(${x},0)">
      <rect x="30" y="14" width="40" height="22" rx="5" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="38" y="19" width="24" height="12" rx="3" fill="#2A3442"/>
      <path d="M50 36 v${wy - 58}" stroke="#8B95A1" stroke-width="2"/>
      <rect x="36" y="${wy - 22}" width="28" height="26" rx="5" fill="#C9B49A" stroke="#8B7355" stroke-width="1.8"/>
      ${waterTop != null ? `<rect x="14" y="${waterTop}" width="72" height="${142 - waterTop}" rx="6" fill="rgba(90,162,248,.22)"/><path d="M14 ${waterTop} h72" stroke="#5AA2F8" stroke-width="2"/>` : ""}
      <path d="M14 142 h72" stroke="#8B95A1" stroke-width="2.4"/>
      <path d="M14 108 v34 M86 108 v34" stroke="#8B95A1" stroke-width="2.4"/>
      <text x="50" y="164" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 176" ${NS} role="img" aria-label="용수철저울에 매단 추가 (가) 공기 중에 있을 때, (나) 물에 절반 잠겼을 때, (다) 완전히 잠겼을 때의 세 장면">
    ${scene(18, "(가)", null, 0)}
    ${scene(128, "(나)", 95, 12)}
    ${scene(238, "(다)", 88, 22)}
  </svg>`;
}

/** 물에 떠서 정지한 공(라이트) — 힘 화살표 없음(평형 판단은 문항 몫). */
export function floatBallFig(): string {
  return `<svg viewBox="0 0 344 170" ${NS} role="img" aria-label="수조의 물 위에 공이 반쯤 잠긴 채 떠서 가만히 있는 그림">
    <path d="M40 42 v96 a10 10 0 0 0 10 10 h244 a10 10 0 0 0 10-10 V42" fill="none" stroke="#8B95A1" stroke-width="2.6"/>
    <rect x="44" y="84" width="256" height="60" rx="6" fill="rgba(90,162,248,.22)"/>
    <path d="M44 84 h256" stroke="#5AA2F8" stroke-width="2.2"/>
    <circle cx="172" cy="84" r="26" fill="#FFD98A" stroke="#C9A96A" stroke-width="2.2"/>
    <path d="M132 84 a40 14 0 0 0 80 0 z" fill="rgba(90,162,248,.28)"/>
    <circle cx="163" cy="74" r="6" fill="rgba(255,255,255,.55)"/>
    <text x="172" y="30" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">떠서 정지해 있음</text>
  </svg>`;
}

/** 지구 주위 세 사과의 화살표 ㄱ·ㄴ·ㄷ(라이트) — ㄱ·ㄴ은 지구 중심 쪽, ㄷ은 먼 쪽(합답 판정용). */
export function gravityAroundFig(): string {
  const apple = (x: number, y: number): string =>
    `<circle cx="${x}" cy="${y}" r="10" fill="#F8B4B4" stroke="#D66" stroke-width="2"/><path d="M${x} ${y - 10} q3 -6 7 -7" stroke="#7A9B5A" stroke-width="2" fill="none"/>`;
  const arr = (x1: number, y1: number, x2: number, y2: number): string => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = (a: number): number => x2 - Math.cos(ang - a) * 10;
    const hy = (a: number): number => y2 - Math.sin(ang - a) * 10;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#5E6B7E" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M${x2} ${y2} L${hx(0.45).toFixed(1)} ${hy(0.45).toFixed(1)} M${x2} ${y2} L${hx(-0.45).toFixed(1)} ${hy(-0.45).toFixed(1)}" stroke="#5E6B7E" stroke-width="3.4" stroke-linecap="round" fill="none"/>`;
  };
  return `<svg viewBox="0 0 344 224" ${NS} role="img" aria-label="지구 주위 세 곳의 사과와 화살표 ㄱ, ㄴ, ㄷ. 지구 위쪽 사과의 ㄱ은 아래쪽을, 지구 오른쪽 사과의 ㄴ은 왼쪽을, 지구 아래쪽 사과의 ㄷ은 아래쪽을 향한다">
    <circle cx="172" cy="112" r="44" fill="#EAF2FD" stroke="#8FB3E8" stroke-width="2.4"/>
    <ellipse cx="156" cy="98" rx="17" ry="11" fill="#CBE4D2"/>
    <ellipse cx="190" cy="126" rx="12" ry="8" fill="#CBE4D2"/>
    <text x="172" y="116" text-anchor="middle" font-size="10.5" fill="#8B95A1">지구</text>
    ${apple(172, 32)}${arr(172, 44, 172, 62)}
    <text x="186" y="58" font-size="13" font-weight="700" fill="#4E5968">ㄱ</text>
    ${apple(300, 112)}${arr(288, 112, 264, 112)}
    <text x="270" y="98" font-size="13" font-weight="700" fill="#4E5968">ㄴ</text>
    ${apple(172, 186)}${arr(172, 198, 172, 218)}
    <text x="186" y="216" font-size="13" font-weight="700" fill="#4E5968">ㄷ</text>
  </svg>`;
}

/** 운동 분류 순서도(라이트) — 속력·방향 두 질문, 결론 칸 ㉠·㉡·㉢은 비어 있다. */
export function motionFlowFig(): string {
  const boxStyle = `fill="#F7F8FA" stroke="#B0B8C1" stroke-width="1.5"`;
  const ansBox = (x: number, y: number, lab: string): string =>
    `<rect x="${x}" y="${y}" width="88" height="34" rx="10" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.5"/>
     <text x="${x + 44}" y="${y + 22}" text-anchor="middle" font-size="14" font-weight="800" fill="#1B64DA">${lab}</text>`;
  const arrTo = (x: number, y: number): string =>
    `<path d="M${x} ${y} l-5 -7 M${x} ${y} l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 344 268" ${NS} role="img" aria-label="운동을 나누는 순서도. 첫 질문은 속력이 변하는지이고, 예 갈래는 결론 칸 ㉢으로, 아니요 갈래는 운동 방향이 변하는지 물어 아니요면 ㉠, 예면 ㉡ 결론 칸으로 이어진다. 결론 칸은 모두 비어 있다">
    <rect x="122" y="8" width="100" height="32" rx="10" ${boxStyle}/>
    <text x="172" y="29" text-anchor="middle" font-size="13" font-weight="700" fill="#333D4B">물체의 운동</text>
    <path d="M172 40 V58" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    ${arrTo(172, 58)}
    <path d="M172 58 L288 88 L172 118 L56 88 Z" fill="#FFF6E6" stroke="#E8B04B" stroke-width="1.5"/>
    <text x="172" y="83" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">속력이</text>
    <text x="172" y="99" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">변하는가?</text>
    <text x="300" y="80" font-size="11.5" font-weight="700" fill="#4E5968">예</text>
    <path d="M288 88 H318 V212" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    ${arrTo(318, 212)}
    ${ansBox(248, 214, "㉢")}
    <text x="30" y="80" text-anchor="end" font-size="11.5" font-weight="700" fill="#4E5968">아니요</text>
    <path d="M56 88 H34 V128" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    ${arrTo(34, 128)}
    <path d="M108 130 L204 158 L108 186 L12 158 Z" fill="#FFF6E6" stroke="#E8B04B" stroke-width="1.5"/>
    <text x="108" y="153" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">운동 방향이</text>
    <text x="108" y="169" text-anchor="middle" font-size="12" font-weight="700" fill="#8A5A00">변하는가?</text>
    <text x="10" y="206" font-size="11.5" font-weight="700" fill="#4E5968">아니요</text>
    <path d="M12 158 H8 V212 H36" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M36 212 l-7 -5 M36 212 l-7 5" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>
    ${ansBox(38, 195, "㉠")}
    <text x="212" y="152" font-size="11.5" font-weight="700" fill="#4E5968">예</text>
    <path d="M204 158 H224 V212" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    ${arrTo(224, 212)}
    ${ansBox(154, 214, "㉡")}
  </svg>`;
}
