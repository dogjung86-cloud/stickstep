// 열 단원(III) 퀴즈·개념 그림: 손코딩 교육용 SVG.
// 색은 답의 단서가 되지 않도록 설계한다(예: 입자 상자 3개는 전부 같은 색,
// 오직 운동 잔상과 입자 간격만 온도의 단서).

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 온도가 서로 다른 물 (가)(나)(다): 입자 운동 비교 (다크 그림)
 *  움직임은 입자 한쪽의 호 무늬로 그린다(활발할수록 겹을 늘림). 2026-11-15 그래픽 감사: 입자를 꿰뚫는 곧은 줄은
 *  막대에 꽂힌 공처럼 보였고 한 줄은 상자 밖으로 나갔다. 호가 상자 밖으로 나가면 반대쪽에 둔다. */
export function particleTrio(showMotionLines = true): string {
  // 상자 하나를 그리는 도우미: 입자 배치 + 움직임 호(활발할수록 겹이 많다)
  const box = (bx: number, label: string, spread: number, rings: number): string => {
    const pts: [number, number][] = [];
    const n = 9;
    const cols = 3;
    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      // spread: 입자 간격(온도 높을수록 넓게)
      const cx = 50 + (c - 1) * spread + (i % 2 ? 3 : -2) * (spread / 16);
      const cy = 48 + (r - 1) * spread + (i % 3 === 1 ? 4 : -2) * (spread / 16);
      pts.push([cx, cy]);
    }
    const parts = pts
      .map(([x, y], i) => {
        let th = (((i * 137) % 360) * Math.PI) / 180;
        const reach = 9 + (rings - 1) * 3.4 + 1.5;
        // 바깥 호가 상자(안쪽 여백 3) 밖으로 나가면 반대쪽에
        const out = (a: number): boolean => x + Math.cos(a) * reach > 97 || x + Math.cos(a) * reach < 3 || y + Math.sin(a) * reach > 93 || y + Math.sin(a) * reach < 3;
        if (out(th)) th += Math.PI;
        if (out(th)) th += Math.PI / 2;
        const arcs =
          !showMotionLines || rings < 1
            ? ""
            : Array.from({ length: rings }, (_, k) => {
                const rr = 9 + k * 3.4;
                const a0 = th - 0.62;
                const a1 = th + 0.62;
                const p0 = [x + Math.cos(a0) * rr, y + Math.sin(a0) * rr];
                const p1 = [x + Math.cos(a1) * rr, y + Math.sin(a1) * rr];
                return `<path d="M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${rr} ${rr} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}" fill="none" stroke="#8FB3E8" stroke-width="1.8" stroke-linecap="round" opacity="${(0.85 - k * 0.18).toFixed(2)}"/>`;
              }).join("");
        return `${arcs}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#6E9EDB"/><circle cx="${(x - 2).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="1.8" fill="rgba(255,255,255,.4)"/>`;
      })
      .join("");
    return `<g transform="translate(${bx},10)">
      <rect x="0" y="0" width="100" height="96" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
      ${parts}
      <text x="50" y="122" text-anchor="middle" font-size="14" font-weight="700" fill="#AFC3E3">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 136" ${NS} role="img" aria-label="온도가 다른 물 세 가지의 입자 운동 모형">
    ${box(6, "(가)", 22, 1)}
    ${box(122, "(나)", 27, 2)}
    ${box(238, "(다)", 32, 3)}
  </svg>`;
}

/** 작은 금속 컵의 뜨거운 물 (가) + 큰 그릇의 찬물 (나)의 시간-온도 그래프 (라이트 그림, u3l2 문제)
 *  2026-11-22 새로 그림: (가) 80 ℃, (나) 15 ℃에서 출발해 6분에 35 ℃에서 만나고 그 뒤로 함께 간다(기울기 0으로 닿는다).
 *  검산: 두 물이 모두 물이면 (가)가 잃은 열 = (나)가 얻은 열이라 (가)의 양 × 45 = (나)의 양 × 20, 곧 찬물이 2.25배 많다.
 *  문두의 "작은 컵, 큰 그릇"이 이 비와 맞는다(양이 같다고 쓰면 열평형 온도는 47.5 ℃여야 해서 어긋난다).
 *  만나기 전 3분에도 두 곡선이 떨어져 보이게 (6 − t)^1.6 꼴로 줄인다. 세로축은 10 간격 숫자와 5 간격 옅은 눈금선이라 15, 35, 80이 모두 눈금선 위에 온다.
 *  6분 뒤 두 선은 같은 자리(35 ℃)에 겹친다. 파랑 실선 위에 주황 점선을 얹어 두 선이 함께 가는 것을 보이고, 겹친 선 위에 "35 ℃"를 적는다
 *  (예전 판은 두 선을 위아래로 1.4씩 띄워 6분 뒤에도 온도가 다른 것처럼 읽혔다, 2026-11-22 검산 지적).
 *  대체 글에 답(시각, 온도)을 쓰지 않는다. 뜨거운 물은 주황(빨강은 오답 색), 글자는 폰에서 12px 이상(설계 13). */
export function equilibriumGraph(): string {
  // 좌표계: x 44..320 (0~10분), y 26..186 (90~10℃)
  const gx = (min: number): number => 44 + min * 27.6;
  const gy = (T: number): number => 186 - (T - 10) * 2;
  const xticks = Array.from({ length: 11 }, (_, i) => {
    const x = gx(i).toFixed(1);
    return `<line x1="${x}" y1="186" x2="${x}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${x}" y="203" text-anchor="middle" font-size="13" fill="#6B7684">${i}</text>`;
  }).join("");
  const minor = [15, 25, 35, 45, 55, 65, 75, 85]
    .map((T) => `<line x1="44" y1="${gy(T)}" x2="320" y2="${gy(T)}" stroke="#F3F5F8" stroke-width="1"/>`)
    .join("");
  const yticks = [10, 20, 30, 40, 50, 60, 70, 80, 90]
    .map(
      (T) => `<line x1="44" y1="${gy(T)}" x2="320" y2="${gy(T)}" stroke="#E5E9EE" stroke-width="1"/>
      <text x="36" y="${gy(T) + 4.5}" text-anchor="end" font-size="13" fill="#6B7684">${T}</text>`,
    )
    .join("");
  // 처음 차이(가: +45, 나: −20)가 (6 − t)^1.6으로 줄어 6분에 0이 된다
  const curve = (gap: number): string =>
    Array.from({ length: 49 }, (_, i) => {
      const t = (i / 48) * 6;
      const T = 35 + gap * Math.pow((6 - t) / 6, 1.6);
      return `${i ? "L" : "M"}${gx(t).toFixed(1)},${gy(T).toFixed(1)}`;
    }).join(" ");
  // 6분부터 10분까지 두 물이 함께 가는 35 ℃ 선
  const both = `M${gx(6).toFixed(1)},${gy(35)} L${gx(10).toFixed(1)},${gy(35)}`;
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="물 (가)와 (나)의 시간에 따른 온도 그래프">
    ${minor}${yticks}${xticks}
    <line x1="44" y1="26" x2="44" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="44" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <path d="${curve(-20)}" fill="none" stroke="#3182F6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${curve(45)}" fill="none" stroke="#F08A24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${both}" fill="none" stroke="#3182F6" stroke-width="3" stroke-linecap="round"/>
    <path d="${both}" fill="none" stroke="#F08A24" stroke-width="3" stroke-dasharray="8 8"/>
    <text x="${gx(8.4).toFixed(1)}" y="${gy(35) - 9}" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968" stroke="#FFFFFF" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke">35 ℃</text>
    <text x="74" y="50" font-size="14" font-weight="800" fill="#C9650C">(가)</text>
    <text x="112" y="176" font-size="14" font-weight="800" fill="#1B64DA">(나)</text>
    <text x="6" y="15" font-size="13" fill="#4E5968">온도(℃)</text>
    <text x="340" y="219" text-anchor="end" font-size="13" fill="#4E5968">시간(분)</text>
  </svg>`;
}

/** 모양과 크기가 같은 금속, 나무, 플라스틱 숟가락을 뜨거운 국에 함께 담그고 5분 뒤의 모습 (라이트 그림, u3l3 문제, 2026-11-22)
 *  손잡이 끝의 같은 높이(y 48)에 같은 크기의 버터 조각을 붙였다. 금속 숟가락의 버터만 녹아 손잡이를 따라 흘러내렸고, 나무와 플라스틱의 버터는 그대로다.
 *  세 숟가락은 같은 기울기, 같은 길이로 국에 같은 깊이만큼 잠긴다(다른 조건이 같다는 단서). 김이나 불은 그리지 않는다(버터를 녹인 것이 손잡이를 따라 온 열이라는 점만 남긴다).
 *  이름표는 손잡이 끝 위에, 글자는 설계 13 이상. */
export function spoonButterFig(): string {
  const spoons: [number, string, [string, string, string], boolean][] = [
    [104, "금속", ["#F4F7FA", "#BFC7D1", "#7D8794"], true],
    [172, "나무", ["#E8C69A", "#C08A52", "#7E5328"], false],
    [240, "플라스틱", ["#FFFFFF", "#DCE6F2", "#9AAABD"], false],
  ];
  const TILT = 9; // 손잡이가 오른쪽으로 기운 각(도)
  const one = ([x, name, c, melted]: [number, string, [string, string, string], boolean], i: number): string => {
    const g = `spb${i}`;
    // 손잡이: 국 속(y 132)에서 손잡이 끝(y 30)까지. 버터는 y 48(끝에서 같은 거리)
    const butter = melted
      ? `<path d="M-7 46.5C-7 44 -3 43 0 43.4C3.5 43 7 44.6 7 47C7 49 5 50.5 4.2 53C3.6 56.4 4.4 61 2.6 64.4C1.6 66.2 -0.4 65.8 -0.8 63.6C-1.4 60 -0.4 56.6 -2.4 53.4C-4 51 -7 50 -7 46.5Z" fill="#FFE07A" stroke="#D9A21E" stroke-width="1.3" stroke-linejoin="round"/>
         <ellipse cx="1.8" cy="69.4" rx="2.2" ry="2.8" fill="#FFE07A" stroke="#D9A21E" stroke-width="1.1"/>
         <ellipse cx="-2.4" cy="45.6" rx="2.6" ry="1.2" fill="#FFF6CF" opacity=".9"/>`
      : `<rect x="-8.5" y="40" width="17" height="15" rx="3" fill="url(#${g}b)" stroke="#D9A21E" stroke-width="1.4"/>
         <path d="M-5.6 43.4h7" stroke="#FFF6CF" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`;
    return `<g transform="translate(${x} 0) rotate(${TILT} 0 132)">
      <defs>
        <linearGradient id="${g}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>
        <linearGradient id="${g}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0A8"/><stop offset=".6" stop-color="#FFD75A"/><stop offset="1" stop-color="#F0B92E"/></linearGradient>
      </defs>
      <rect x="-5" y="30" width="10" height="118" rx="5" fill="url(#${g}h)" stroke="${c[2]}" stroke-width="1.4"/>
      <path d="M-2 36V140" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
      ${butter}
    </g>
    <text x="${x + Math.sin((TILT * Math.PI) / 180) * 104}" y="${30 - 10}" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${name}</text>`;
  };
  return `<svg viewBox="0 0 344 206" ${NS} role="img" aria-label="뜨거운 국이 담긴 그릇에 금속, 나무, 플라스틱 숟가락이 같은 기울기로 꽂혀 있다. 세 손잡이 끝의 같은 높이에 버터 조각을 붙였는데, 금속 숟가락의 버터만 녹아 흘러내렸다">
    <defs>
      <linearGradient id="spbBowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#E9EDF2"/><stop offset="1" stop-color="#C9D0D8"/></linearGradient>
      <linearGradient id="spbSoup" gradientUnits="userSpaceOnUse" x1="0" y1="118" x2="0" y2="150"><stop offset="0" stop-color="#F7B35A"/><stop offset="1" stop-color="#D9822B"/></linearGradient>
    </defs>
    <ellipse cx="174" cy="196" rx="112" ry="7" fill="#2A3A5E" opacity=".1"/>
    <ellipse cx="174" cy="134" rx="118" ry="16" fill="url(#spbSoup)" stroke="#B9671D" stroke-width="1.4"/>
    ${spoons.map(one).join("")}
    <!-- 국 표면의 앞쪽 절반을 숟가락 위에 다시 칠해 숟가락이 국 속으로 들어간 것처럼 보이게 한다 -->
    <path d="M56 134A118 16 0 0 0 292 134Z" fill="url(#spbSoup)"/>
    <path d="M56 134C56 170 98 194 174 194C250 194 292 170 292 134C292 142 250 152 174 152C98 152 56 142 56 134Z" fill="url(#spbBowl)" stroke="#8C96A3" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M78 156C98 172 132 180 174 180" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <text x="300" y="128" text-anchor="start" font-size="13" font-weight="700" fill="#4E5968">국</text>
  </svg>`;
}

/** 구리·철·유리 막대를 동시에 가열한 열화상 (다크 그림) */
export function thermalRods(): string {
  const flame = (y: number): string => `
    <g transform="translate(51,${y + 8})">
      <path d="M0 9 C 8 5 5 -3 0 -11 C -5 -3 -8 5 0 9 Z" fill="#FF9F43"/>
      <path d="M0 5 C 4 3 3 -2 0 -6 C -3 -2 -4 3 0 5 Z" fill="#FFE9A8"/>
    </g>`;
  const rod = (y: number, label: string, frac: number): string => {
    const w = 250 * frac;
    return `<g>
      <text x="62" y="${y - 7}" font-size="13.5" font-weight="700" fill="#AFC3E3">${label}</text>
      <rect x="62" y="${y}" width="250" height="16" rx="8" fill="#22335C"/>
      ${w > 4 ? `<rect x="62" y="${y}" width="${w}" height="16" rx="8" fill="url(#heatGrad)"/>` : ""}
      <rect x="62" y="${y}" width="250" height="16" rx="8" fill="none" stroke="#31456F" stroke-width="1.2"/>
      ${flame(y)}
    </g>`;
  };
  return `<svg viewBox="0 0 344 190" ${NS} role="img" aria-label="구리, 철, 유리 막대의 왼쪽 끝을 동시에 가열한 열화상 모습">
    <defs>
      <linearGradient id="heatGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFE9A8"/>
        <stop offset=".45" stop-color="#FF9F43"/>
        <stop offset=".85" stop-color="#F0442E"/>
        <stop offset="1" stop-color="#F0442E" stop-opacity=".15"/>
      </linearGradient>
    </defs>
    ${rod(44, "구리", 0.86)}
    ${rod(102, "철", 0.44)}
    ${rod(160, "유리", 0.1)}
    <text x="30" y="186" text-anchor="middle" font-size="13" fill="#7E93B3">가열</text>
  </svg>`;
}

/** recap 카드용 미니 일러스트(64x64): 열 단원 공용 */
const MINI: Record<string, string> = {
  // 온도계 + 입자
  thermo: `<path d="M26 12a5 5 0 0 1 10 0v22a10 10 0 1 1-10 0z" fill="#FFF" stroke="#4E5968" stroke-width="3"/>
    <path d="M31 26v16" stroke="#FF6B4A" stroke-width="4"/>
    <circle cx="31" cy="44" r="4.5" fill="#FF6B4A" stroke="none"/>
    <circle cx="50" cy="18" r="4" fill="#FF9F43" stroke="none"/>
    <path d="M44 12l-3-3M56 13l3-3" stroke="#FF9F43" stroke-width="2.4"/>
    <circle cx="52" cy="42" r="4" fill="#3D8DFF" stroke="none"/>`,
  // 가열 → 활발·멀어짐
  heatUp: `<path d="M18 56c6-3 4-8 0-13-4 5-6 10 0 13z" fill="#FF9F43" stroke="none"/>
    <circle cx="30" cy="30" r="4.5" fill="#F25C54" stroke="none"/>
    <circle cx="46" cy="20" r="4.5" fill="#F25C54" stroke="none"/>
    <circle cx="50" cy="40" r="4.5" fill="#F25C54" stroke="none"/>
    <path d="M23 24l-5-5M52 12l4-5M57 46l6 3" stroke="#FF6B4A" stroke-width="2.6"/>
    <path d="M35 36c-3 2-4 5-3 8" stroke="#FFB03A" stroke-width="2.4"/>`,
  // 냉각 → 둔해짐·가까워짐
  coolDown: `<path d="M48 12v12M42 18h12M43.5 13.5l9 9M52.5 13.5l-9 9" stroke="#5AA2F8" stroke-width="2.8"/>
    <circle cx="22" cy="44" r="4.5" fill="#3D8DFF" stroke="none"/>
    <circle cx="33" cy="40" r="4.5" fill="#3D8DFF" stroke="none"/>
    <circle cx="29" cy="51" r="4.5" fill="#3D8DFF" stroke="none"/>
    <path d="M45 40l-5 3M46 52l-6-2" stroke="#8FB3E8" stroke-width="2.4"/>`,
  // 열의 이동 방향(고온 → 저온)
  flowDir: `<rect x="8" y="20" width="20" height="24" rx="6" fill="#FFDCD1" stroke="#FF6B4A" stroke-width="3"/>
    <rect x="36" y="20" width="20" height="24" rx="6" fill="#DBE9FF" stroke="#3D8DFF" stroke-width="3"/>
    <path d="M26 32h10M32 27l5 5-5 5" stroke="#FF9F43" stroke-width="3.4"/>
    <path d="M14 12c-2-3 2-4 0-7M22 13c-2-3 2-4 0-7" stroke="#FF8A5C" stroke-width="2.4"/>`,
  // 열평형(같아짐)
  balance: `<rect x="8" y="22" width="20" height="24" rx="6" fill="#EFE9FF" stroke="#8A6BFF" stroke-width="3"/>
    <rect x="36" y="22" width="20" height="24" rx="6" fill="#EFE9FF" stroke="#8A6BFF" stroke-width="3"/>
    <path d="M28 30h8M28 38h8" stroke="#04B45F" stroke-width="3.4"/>
    <path d="M14 54h36" stroke="#C4CAD2" stroke-width="2.6"/>`,
  // 입자 운동 교환(잃는 쪽 둔해지고 얻는 쪽 활발해짐)
  particleSwap: `<circle cx="18" cy="26" r="5.5" fill="#F25C54" stroke="none"/>
    <path d="M8 18l-4-4M10 34l-5 4" stroke="#FF6B4A" stroke-width="2.6"/>
    <circle cx="47" cy="42" r="5.5" fill="#3D8DFF" stroke="none"/>
    <path d="M56 36l3-2" stroke="#8FB3E8" stroke-width="2.4"/>
    <path d="M30 22c8-2 14 2 18 8" stroke="#FF9F43" stroke-width="3"/>
    <path d="M45 27l4 4-6 1z" fill="#FF9F43" stroke="none"/>`,
  // 전도: 진동 릴레이
  conduct: `<circle cx="12" cy="36" r="5" fill="#FF9F43" stroke="none"/>
    <circle cx="24" cy="36" r="5" fill="#F9BC7B" stroke="none"/>
    <circle cx="36" cy="36" r="5" fill="#B9AFD4" stroke="none"/>
    <circle cx="48" cy="36" r="5" fill="#7C93D8" stroke="none"/>
    <path d="M8 26c2-2 6-2 8 0M20 26c2-2 6-2 8 0" stroke="#FF6B4A" stroke-width="2.6"/>
    <path d="M33 27c1.6-1.4 4.4-1.4 6 0" stroke="#8FA0CF" stroke-width="2.2"/>
    <path d="M12 54c5-2.5 3.5-6.5 0-10.5-3.5 4-5 8 0 10.5z" fill="#FF9F43" stroke="none"/>`,
  // 대류: 순환
  convect: `<rect x="12" y="14" width="40" height="38" rx="9" fill="none" stroke="#4E5968" stroke-width="3"/>
    <path d="M32 44c-7 0-11-4-11-10s4-10 11-10 11 4 11 10" stroke="#0CA6C0" stroke-width="3.2"/>
    <path d="M43 28l3 6-7-1z" fill="#0CA6C0" stroke="none"/>
    <path d="M26 60c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>
    <path d="M38 60c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>`,
  // 복사: 직진(빨강은 오답 색이라 주황 계열로. 정리 카드와 분류 통의 '복사'도 같은 색 #E67700)
  radiate: `<path d="M14 44c7-3.5 5-9 0-14.5C9 35 7 40.5 14 44z" fill="#FF9F43" stroke="none"/>
    <path d="M26 22a18 18 0 0 1 0 26" stroke="#E67700" stroke-width="3"/>
    <path d="M34 16a26 26 0 0 1 0 38" stroke="#E67700" stroke-width="3" opacity=".65"/>
    <path d="M42 10a34 34 0 0 1 0 50" stroke="#E67700" stroke-width="3" opacity=".35"/>
    <circle cx="56" cy="35" r="4" fill="#FFB03A" stroke="none"/>`,
  // 비열: 1kg 블록 + 온도계 + 열
  specHeat: `<rect x="10" y="26" width="26" height="22" rx="5" fill="#FFE4B0" stroke="#C9A96A" stroke-width="3"/>
    <path d="M17 26v-5h12v5" fill="none" stroke="#C9A96A" stroke-width="3"/>
    <path d="M23 62c5-2.5 3.5-6.5 0-10.5-3.5 4-5 8 0 10.5z" fill="#FF9F43" stroke="none"/>
    <path d="M50 14a3 3 0 0 1 6 0v22a6 6 0 1 1-6 0z" fill="#FFF" stroke="#4E5968" stroke-width="3"/>
    <path d="M53 26v14" stroke="#F25C54" stroke-width="3.6"/>
    <circle cx="53" cy="42" r="3.4" fill="#F25C54" stroke="none"/>`,
  // 온도 관성: 같은 불, 다른 온도계
  inertia: `<path d="M16 60c4.5-2.2 3-6 0-9.5-3 3.5-4.5 7.3 0 9.5z" fill="#FF9F43" stroke="none"/>
    <path d="M48 60c4.5-2.2 3-6 0-9.5-3 3.5-4.5 7.3 0 9.5z" fill="#FF9F43" stroke="none"/>
    <path d="M13 8a3 3 0 0 1 6 0v26a6 6 0 1 1-6 0z" fill="#FFF" stroke="#4E5968" stroke-width="2.8"/>
    <path d="M16 30v10" stroke="#3D8DFF" stroke-width="3.4"/>
    <circle cx="16" cy="42" r="3.2" fill="#3D8DFF" stroke="none"/>
    <path d="M45 8a3 3 0 0 1 6 0v26a6 6 0 1 1-6 0z" fill="#FFF" stroke="#4E5968" stroke-width="2.8"/>
    <path d="M48 14v26" stroke="#F25C54" stroke-width="3.4"/>
    <circle cx="48" cy="42" r="3.2" fill="#F25C54" stroke="none"/>`,
  // 물의 큰 비열: 물방울은 느긋
  waterBig: `<path d="M26 8C34 20 44 28 44 40a18 18 0 1 1-36 0C8 28 18 20 26 8z" fill="#CFE4FF" stroke="#3D8DFF" stroke-width="3"/>
    <path d="M18 40a8.5 8.5 0 0 0 8 9" stroke="#8FBBF2" stroke-width="2.6"/>
    <path d="M54 20l6-3M54 32l7 0M54 44l6 3" stroke="#FF9F43" stroke-width="2.8"/>`,
  // 열팽창: 입자 간격이 벌어진다(크기는 그대로)
  expandArt: `<path d="M6 20v24M58 20v24" stroke="#C4CAD2" stroke-width="2.4" stroke-dasharray="3 4"/>
    <circle cx="20" cy="32" r="5.5" fill="#F25C54" stroke="none"/>
    <circle cx="32" cy="32" r="5.5" fill="#F25C54" stroke="none"/>
    <circle cx="44" cy="32" r="5.5" fill="#F25C54" stroke="none"/>
    <path d="M12 32H4M8 28l-4 4 4 4" stroke="#FF9F43" stroke-width="2.8"/>
    <path d="M52 32h8M56 28l4 4-4 4" stroke="#FF9F43" stroke-width="2.8"/>
    <path d="M26 52c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>
    <path d="M40 52c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>`,
  // 물질마다 다른 팽창 정도: 많이 늘어나는 금속은 구리색, 적게 늘어나는 금속은 짙은 회색(랩의 두 띠와 같은 뜻의 색, 2026-11-15 그래픽 감사)
  diffExpand: `<rect x="6" y="16" width="34" height="9" rx="4.5" fill="#C8794A" stroke="none"/>
    <path d="M42 20.5h12M50 16.5l4 4-4 4" stroke="#FF9F43" stroke-width="2.8"/>
    <rect x="6" y="38" width="34" height="9" rx="4.5" fill="#5E6B7E" stroke="none"/>
    <path d="M42 42.5h4" stroke="#C4CAD2" stroke-width="2.8"/>
    <path d="M14 60c4-2 3-5 0-8-3 3-4 6 0 8zM30 60c4-2 3-5 0-8-3 3-4 6 0 8z" fill="#FF9F43" stroke="none"/>`,
  // 바이메탈: 열팽창 작은 쪽으로 휜다(바깥: 많이 늘어나는 구리색, 안쪽: 적게 늘어나는 짙은 회색)
  bimetalArt: `<rect x="4" y="18" width="8" height="24" rx="2" fill="#C4CAD2" stroke="none"/>
    <path d="M12 26c14-2 26 2 34 14" stroke="#C8794A" stroke-width="7" stroke-linecap="round"/>
    <path d="M12 33c12-1.5 22 2 29 12" stroke="#5E6B7E" stroke-width="7" stroke-linecap="round"/>
    <path d="M26 58c4.5-2.2 3-6 0-9.5-3 3.5-4.5 7.3 0 9.5z" fill="#FF9F43" stroke="none"/>`,
};

export function miniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}

/** 질량이 같은 세 물질 (가)(나)(다)에 같은 양의 열을 가한 그래프 (라이트 그림) */
export function heatingCurves3(): string {
  // 좌표계: x 40..320 (0~5분), y 26..186 (80~20℃)
  const gx = (min: number): number => 40 + min * 56;
  const gy = (T: number): number => 186 - ((T - 20) / 60) * 160;
  const xt = Array.from({ length: 6 }, (_, i) => {
    return `<line x1="${gx(i)}" y1="186" x2="${gx(i)}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(i)}" y="202" text-anchor="middle" font-size="13" fill="#6B7684">${i}</text>`;
  }).join("");
  const yt = [20, 40, 60, 80]
    .map(
      (T) => `<line x1="40" y1="${gy(T)}" x2="320" y2="${gy(T)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="33" y="${gy(T) + 4.5}" text-anchor="end" font-size="13" fill="#6B7684">${T}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="질량이 같은 세 물질을 같은 양의 열로 가열한 시간-온도 그래프. 온도가 오르는 정도가 서로 다르다">
    ${yt}${xt}
    <line x1="40" y1="26" x2="40" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <!-- 세 선은 같은 색, 색이 정답(비열 순서)의 단서가 되지 않게 한다 -->
    <line x1="${gx(0)}" y1="${gy(20)}" x2="${gx(5)}" y2="${gy(34)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <line x1="${gx(0)}" y1="${gy(20)}" x2="${gx(5)}" y2="${gy(52)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <line x1="${gx(0)}" y1="${gy(20)}" x2="${gx(5)}" y2="${gy(76)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <text x="${gx(5) - 28}" y="${gy(35) + 22}" font-size="14" font-weight="700" fill="#4E5968">(가)</text>
    <text x="${gx(5) - 28}" y="${gy(53) - 3}" font-size="14" font-weight="700" fill="#4E5968">(나)</text>
    <text x="${gx(5) - 28}" y="${gy(76) - 7}" font-size="14" font-weight="700" fill="#4E5968">(다)</text>
    <text x="6" y="15" font-size="13" fill="#4E5968">온도(℃)</text>
    <text x="340" y="219" text-anchor="end" font-size="13" fill="#4E5968">시간(분)</text>
  </svg>`;
}

/** 길이 1 m인 세 금속 막대를 똑같이 50 ℃만큼 데웠을 때 늘어난 길이 (라이트 그림, u3l5 문제, 2026-11-22)
 *  값은 상온 근처의 선팽창 계수(철 약 12, 구리 약 17, 알루미늄 약 23, 단위는 백만분의 1/℃)로 계산한 자연값이다:
 *  1000 mm × 계수 × 50 = 0.60, 0.85, 1.15 mm. 막대 색은 재질색이고, 정답(어느 쪽으로 휘는가)의 단서가 되는 화살이나 강조는 넣지 않는다.
 *  행 차례는 철, 구리, 알루미늄(늘어난 길이 차례와 같지만 표가 그대로 보여 주는 값이라 숨길 것이 없다). 글자는 설계 13 이상. */
export function expansionTableFig(): string {
  const rows: [string, string, [string, string, string]][] = [
    ["철", "0.60", ["#B9C0C9", "#7D8794", "#545D69"]],
    ["구리", "0.85", ["#F2B48A", "#C8794A", "#8E4A24"]],
    ["알루미늄", "1.15", ["#F4F7FA", "#C9D1DB", "#8D97A4"]],
  ];
  const X0 = 14, W = 316, HEAD = 34, RH = 40;
  const c1 = 120; // 첫 칸(금속) 폭
  const body = rows
    .map(([name, d, c], i) => {
      const y = HEAD + i * RH;
      return `<rect x="${X0}" y="${y}" width="${W}" height="${RH}" fill="${i % 2 ? "#F7F9FB" : "#FFFFFF"}"/>
        <defs><linearGradient id="exb${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".55" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient></defs>
        <rect x="${X0 + 12}" y="${y + 15}" width="26" height="10" rx="5" fill="url(#exb${i})" stroke="${c[2]}" stroke-width="1.2"/>
        <text x="${X0 + 48}" y="${y + 25}" font-size="14" font-weight="700" fill="#333D4B">${name}</text>
        <text x="${X0 + c1 + (W - c1) / 2}" y="${y + 25}" text-anchor="middle" font-size="15" font-weight="700" fill="#333D4B">${d}</text>`;
    })
    .join("");
  const H = HEAD + rows.length * RH;
  return `<svg viewBox="0 -3 344 ${H + 8}" ${NS} role="img" aria-label="길이가 1 m인 철, 구리, 알루미늄 막대를 똑같이 50 ℃만큼 데웠을 때 늘어난 길이를 적은 표">
    <clipPath id="exbClip"><rect x="${X0}" y="0" width="${W}" height="${H}" rx="10"/></clipPath>
    <g clip-path="url(#exbClip)">
      <rect x="${X0}" y="0" width="${W}" height="${HEAD}" fill="#EEF2F6"/>
      ${body}
    </g>
    <text x="${X0 + c1 / 2}" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4E5968">금속 막대</text>
    <text x="${X0 + c1 + (W - c1) / 2}" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="#4E5968">늘어난 길이(mm)</text>
    <rect x="${X0}" y="0" width="${W}" height="${H}" rx="10" fill="none" stroke="#C9CFD6" stroke-width="1.4"/>
    <path d="M${X0 + c1} 0V${H}" stroke="#DCE1E7" stroke-width="1.2"/>
    ${rows.map((_, i) => `<path d="M${X0} ${HEAD + i * RH}H${X0 + W}" stroke="#DCE1E7" stroke-width="1.2"/>`).join("")}
  </svg>`;
}

/** 온돌의 구조: 아궁이·구들장·방 (라이트 그림)
 *  2026-11-15 그래픽 감사: 문제가 묻는 ㉠(구들장에서 방바닥으로), ㉡(방 안 공기가 퍼지는 것)의 자리를 그림에 표시한다.
 *  ㉠은 구들장 윗면에서 방바닥으로 가는 짧은 화살, ㉡은 방 안의 도는 고리. 표시는 답의 색 단서가 되지 않게 같은 짙은 회색.
 *  이름표는 선 밖에(오른쪽 칸과 아래), 글자는 폰에서 12px 이상(설계 13). 물결선이 '구들장' 글자를 가로지르던 것을 걷었다. */
export function ondolFig(): string {
  const stones = Array.from({ length: 6 }, (_, i) => `<rect x="${20 + i * 45.5}" y="105" width="41" height="18" rx="4" fill="#C4CAD2" stroke="#A9B1BC" stroke-width="1"/>`).join("");
  const mark = "#3A4452";
  return `<svg viewBox="0 0 344 196" ${NS} role="img" aria-label="온돌 구조 단면도. 아궁이의 불길이 구들장 아래를 지나가고 구들장 위에 방바닥과 방이 있다">
    <rect x="16" y="20" width="276" height="76" rx="10" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.5"/>
    <rect x="16" y="96" width="276" height="9" fill="#E6D3AE" stroke="#C9B08A" stroke-width="1"/>
    ${stones}
    <rect x="16" y="123" width="276" height="27" fill="#FBFCFD" stroke="#E2E6EB"/>
    <path d="M2 150 L16 123 L16 150 Z" fill="#FBFCFD" stroke="#E2E6EB"/>
    <path d="M2 126 h26 v28 h-26 Z" fill="#4E5968"/>
    <path d="M15 152 C 26 145 22 136 15 127 C 8 136 4 145 15 152 Z" fill="#FF9F43"/>
    <path d="M15 147 C 21 143 19 137 15 131 C 11 137 9 143 15 147 Z" fill="#FFD98A"/>
    <path d="M38 137 H276" stroke="#F08A24" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"/>
    <path d="M276 141.5 l9 -4.5 -9 -4.5" fill="none" stroke="#F08A24" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- ㉠ 구들장 윗면에서 방바닥으로 -->
    <path d="M118 121 V100" stroke="${mark}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M112.5 104 L118 97 L123.5 104" fill="none" stroke="${mark}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="108" y="92" text-anchor="end" font-size="15" font-weight="800" fill="${mark}">㉠</text>
    <!-- ㉡ 방 안 공기가 돈다 -->
    <path d="M150 74 C 150 44, 248 44, 248 58" fill="none" stroke="${mark}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M243.5 54 L248.5 61 L253 53.5" fill="none" stroke="${mark}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M248 66 C 248 84, 150 84, 150 80" fill="none" stroke="${mark}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M154.5 84.5 L149.5 78 L145 85" fill="none" stroke="${mark}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="199" y="69" text-anchor="middle" font-size="15" font-weight="800" fill="${mark}">㉡</text>
    <text x="26" y="40" font-size="13" font-weight="700" fill="#4E5968">방 안</text>
    <text x="298" y="105" font-size="13" font-weight="700" fill="#6B7684">방바닥</text>
    <text x="298" y="121" font-size="13" font-weight="700" fill="#6B7684">구들장</text>
    <text x="4" y="173" font-size="13" font-weight="700" fill="#4E5968">아궁이</text>
    <text x="160" y="170" text-anchor="middle" font-size="13" fill="#6B7684">뜨거운 연기가 지나가는 길</text>
  </svg>`;
}
