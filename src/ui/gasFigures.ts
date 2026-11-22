// 기체의 성질 단원(VI) 퀴즈·개념 그림. 손코딩 교육용 SVG, 라이트(흰 카드) 기준.
// 문제 그림은 폰에서 폭 344가 316px쯤으로 줄어든다(0.92배). 그래서 그림 속 글자는 13.5px 이상으로 쓴다(폰 표시 12px 이상).

const NS = `xmlns="http://www.w3.org/2000/svg"`;
const f1 = (v: number): string => v.toFixed(1);

/** 화살(몸통 + 머리). (x0, y0)에서 (x1, y1)로. */
function arrowSvg(x0: number, y0: number, x1: number, y1: number, color: string, w = 2.4, head = 7): string {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const hx = (s: number): string => f1(x1 - head * Math.cos(a + s * 0.5));
  const hy = (s: number): string => f1(y1 - head * Math.sin(a + s * 0.5));
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}M${hx(-1)} ${hy(-1)}L${f1(x1)} ${f1(y1)}L${hx(1)} ${hy(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}

/** 고무풍선 속 기체 입자 (L1 문제): 둥근 풍선 한 개와, 벽 한 조각을 쐐기 모양으로 크게 본 칸.
 *  확대 칸 안에서 입자는 여러 방향으로 움직이고, 벽에 닿은 입자 자리에는 벽을 미는 표시가 있다. */
export function balloonParticleFig(): string {
  // 풍선(왼쪽)
  const bx = 78;
  const by = 92;
  const br = 58;
  // 확대할 자리: 풍선 오른쪽 위의 벽
  const za = -0.42;
  const zx = bx + Math.cos(za) * br;
  const zy = by + Math.sin(za) * br;
  const zr = 13;
  // 확대 칸(오른쪽)
  const cx = 250;
  const cy = 100;
  const cr = 84;
  // 두 원의 바깥 접선(쐐기의 두 변)
  const dx = cx - zx;
  const dy = cy - zy;
  const D = Math.hypot(dx, dy);
  const th = Math.atan2(dy, dx);
  const be = Math.acos((zr - cr) / D);
  const tp = (s: number): [string, string, string, string] => {
    const a = th + s * be;
    return [f1(zx + zr * Math.cos(a)), f1(zy + zr * Math.sin(a)), f1(cx + cr * Math.cos(a)), f1(cy + cr * Math.sin(a))];
  };
  const [ax0, ay0, ax1, ay1] = tp(1);
  const [bx0, by0, bx1, by1] = tp(-1);
  // 확대 칸 속 풍선 벽: 칸의 오른쪽을 지나는 큰 원호(안쪽이 왼쪽)
  const wallX = cx + 46; // 칸 가운데 높이에서 벽 안쪽 면의 x
  const wR = 260; // 벽의 굽은 정도(확대했으니 거의 곧다)
  const wcx = wallX - wR;
  const wallAt = (y: number): number => wcx + Math.sqrt(wR * wR - (y - cy) * (y - cy));
  const wallPath = (off: number): string => {
    let d = "";
    for (let y = cy - cr - 4; y <= cy + cr + 4; y += 6) d += `${d ? "L" : "M"}${f1(wallAt(y) + off)} ${f1(y)}`;
    return d;
  };
  // 확대 칸 속 입자: [x, y, 방향(rad)]. 벽에 닿은 둘은 벽 쪽을 향한다
  const P: [number, number, number][] = [
    [200, 58, -2.2], [236, 84, 1.55], [196, 124, 2.9], [226, 150, 0.6], [252, 46, -1.75], [256, 120, -1.9],
  ];
  const hitY = [72, 136];
  const parts = P.map(([x, y, a]) => `<circle cx="${x}" cy="${y}" r="8" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1.6"/>${arrowSvg(x + Math.cos(a) * 11, y + Math.sin(a) * 11, x + Math.cos(a) * 30, y + Math.sin(a) * 30, "#5E6B7E", 2.4, 7)}`).join("");
  // 벽에 닿은 입자 둘: 벽에 붙어 있고, 닿은 자리에 주황 표시와 벽을 미는 짧은 화살
  const hits = hitY
    .map((y) => {
      const wx = wallAt(y);
      return `<circle cx="${f1(wx - 9)}" cy="${y}" r="8" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1.6"/>
      <path d="M${f1(wx + 1)} ${y - 12}q4 12 0 24" stroke="#F0A422" stroke-width="3.4" stroke-linecap="round" fill="none"/>
      ${arrowSvg(wx + 6, y, wx + 22, y, "#F0A422", 2.6, 6)}`;
    })
    .join("");
  // 풍선 속 작은 입자(전체 모습)
  const small: [number, number][] = [[52, 70], [86, 60], [104, 96], [64, 110], [92, 130], [44, 96], [118, 70], [76, 86]];
  const smallDots = small.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1"/>`).join("");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="둥근 풍선과, 풍선 벽 한 조각을 크게 본 그림. 확대한 칸 속 입자들은 여러 방향으로 움직이고 일부는 벽에 부딪힌다">
    <defs><clipPath id="gfBalZ"><circle cx="${cx}" cy="${cy}" r="${cr}"/></clipPath></defs>
    <path d="M${ax0} ${ay0}L${ax1} ${ay1}A${cr} ${cr} 0 0 1 ${bx1} ${by1}L${bx0} ${by0}A${zr} ${zr} 0 0 0 ${ax0} ${ay0}z" fill="#FFF4D6" opacity=".8"/>
    <path d="M${ax0} ${ay0}L${ax1} ${ay1}M${bx0} ${by0}L${bx1} ${by1}" stroke="#D9B45C" stroke-width="1.4" stroke-dasharray="4 4"/>
    <path d="M${bx} ${by + br}q-8 22 4 40" stroke="#B9A27A" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="${bx}" cy="${by}" r="${br}" fill="#FFE9A8" stroke="#E8B54A" stroke-width="2.6"/>
    <path d="M${bx - 6} ${by + br + 7}l6-9 6 9z" fill="#E8B54A"/>
    <ellipse cx="${bx - 24}" cy="${by - 30}" rx="12" ry="7" transform="rotate(-35 ${bx - 24} ${by - 30})" fill="#FFFFFF" opacity=".7"/>
    ${smallDots}
    <circle cx="${f1(zx)}" cy="${f1(zy)}" r="${zr}" stroke="#C99A2E" stroke-width="2"/>
    <g clip-path="url(#gfBalZ)">
      <rect x="${cx - cr}" y="${cy - cr}" width="${cr * 2}" height="${cr * 2}" fill="#FFFDF5"/>
      <path d="${wallPath(0)}L${cx + cr + 10} ${cy + cr + 10}L${cx + cr + 10} ${cy - cr - 10}z" fill="#F4F7FB"/>
      <path d="${wallPath(0)}" stroke="#E8B54A" stroke-width="12"/>
      <path d="${wallPath(-6)}" stroke="#D9A43C" stroke-width="1.4"/>
      ${parts}
      ${hits}
    </g>
    <circle cx="${cx}" cy="${cy}" r="${cr}" stroke="#C99A2E" stroke-width="2.4"/>
    <text x="${cx + 28}" y="${cy + cr + 14}" font-size="13.5" font-weight="700" fill="#8A6A1E">풍선 벽</text>
  </svg>`;
}

/** 압력과 부피의 반비례 곡선 (자체 수치: 1기압 24mL · 2기압 12mL). 4기압 자리는 곡선만 두어, 답을 셈으로 구하게 한다. */
export function pvCurveFig(): string {
  const gx = (p: number): number => 60 + (p / 4.6) * 262;
  const gy = (v: number): number => 170 - (v / 27.6) * 146;
  let d = "";
  for (let p = 0.9; p <= 4.42; p += 0.04) d += `${d ? "L" : "M"}${f1(gx(p))} ${f1(gy(24 / p))}`;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="압력에 따른 부피 그래프. 1기압에서 24밀리리터, 2기압에서 12밀리리터">
    <line x1="60" y1="18" x2="60" y2="170" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="60" y1="170" x2="328" y2="170" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[24, 12].map((v) => `<line x1="60" y1="${f1(gy(v))}" x2="322" y2="${f1(gy(v))}" stroke="#EDF0F4"/><text x="52" y="${f1(gy(v) + 5)}" text-anchor="end" font-size="13.5" fill="#6B7684">${v}</text>`).join("")}
    ${[1, 2, 3, 4].map((p) => `<text x="${f1(gx(p))}" y="188" text-anchor="middle" font-size="13.5" fill="#6B7684">${p}</text>`).join("")}
    <path d="${d}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${[[1, 24], [2, 12]].map(([p, v]) => `<line x1="${f1(gx(p))}" y1="${f1(gy(v))}" x2="${f1(gx(p))}" y2="170" stroke="#C9D2DC" stroke-width="1.2" stroke-dasharray="3 4"/><circle cx="${f1(gx(p))}" cy="${f1(gy(v))}" r="4.6" fill="#5E6B7E"/>`).join("")}
    <text x="14" y="13" font-size="13.5" fill="#4E5968">부피(mL)</text>
    <text x="328" y="206" text-anchor="end" font-size="13.5" fill="#4E5968">압력(기압)</text>
  </svg>`;
}

/** 그래프 모양 고르기(①~⑤). 정답 ④ 반비례 곡선은 부피 = 24 ÷ 압력의 점으로 긋는다(처음이 가장 가파르고 갈수록 완만).
 *  ⑤는 같은 휘어짐으로 올라가는 곡선(가파르게 늘다가 완만해진다)이라 곡선 모양만 보고 고르면 틀린다. ① 내려가는 직선, ② 올라가는 직선, ③ 수평선. */
export function graphChoicesFig(): string {
  // 칸 하나의 좌표: 세로축 x=28(위 20 ~ 아래 72), 가로축 y=72(28 ~ 104). 선은 x 32~100, y 24~68 안에 그린다.
  const cell = (i: number, x: number, y: number, path: string): string =>
    `<g transform="translate(${x},${y})">
      <text x="0" y="14" font-size="14" font-weight="700" fill="#4E5968">${["①", "②", "③", "④", "⑤"][i]}</text>
      <text x="33" y="15" font-size="13.5" fill="#6B7684">부피</text>
      <path d="M28 20V72H104" stroke="#B0B8C1" stroke-width="1.4"/>
      <path d="${path}" stroke="#5E6B7E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="104" y="89" text-anchor="end" font-size="13.5" fill="#6B7684">압력</text>
    </g>`;
  let inv = "";
  for (let p = 1; p <= 4.61; p += 0.06) inv += `${inv ? "L" : "M"}${f1(32 + ((p - 1) / 3.6) * 68)} ${f1(68 - (24 / p / 24) * 42)}`;
  // ⑤ 올라가는 곡선: 처음이 가파르고 갈수록 완만(높이 = 42 × √(가로 비율))
  let rise = "";
  for (let i = 0; i <= 34; i++) rise += `${rise ? "L" : "M"}${f1(32 + (i / 34) * 68)} ${f1(68 - Math.sqrt(i / 34) * 42)}`;
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="부피와 압력 그래프 보기 다섯 개">
    ${cell(0, 6, 4, "M32 26L100 66")}
    ${cell(1, 122, 4, "M32 66L100 26")}
    ${cell(2, 238, 4, "M32 42H100")}
    ${cell(3, 6, 102, inv)}
    ${cell(4, 122, 102, rise)}
  </svg>`;
}

/** 실린더+추: (가) 추 1개 큰 부피, (나) 추 2개 절반 부피. 윗면이 열린 통 안에서 추가 피스톤 위에 놓이고, 입자는 피스톤 아래에만 있다. */
export function pistonWeightsFig(): string {
  const jar = (x: number, label: string, pistonY: number, weights: number, parts: [number, number][]): string => {
    const w = 108;
    const bot = 158;
    const wTop = pistonY - 17;
    return `<g>
      <path d="M${x} 34V${bot - 8}q0 8 8 8H${x + w - 8}q8 0 8-8V34" fill="#F4F8FC" stroke="#9DAABD" stroke-width="2.2" stroke-linecap="round"/>
      <rect x="${x + 2}" y="${pistonY + 10}" width="${w - 4}" height="${bot - pistonY - 12}" rx="4" fill="#E6F0FB"/>
      <rect x="${x + 3}" y="${pistonY}" width="${w - 6}" height="10" rx="3" fill="#8B99AC"/>
      ${Array.from({ length: weights }, (_, i) => `<rect x="${x + w / 2 - 11 - (weights - 1) * 12 + i * 24}" y="${wTop}" width="22" height="17" rx="3" fill="#E8C06A" stroke="#B08D3E" stroke-width="1.6"/>`).join("")}
      ${parts.map(([px, py]) => `<circle cx="${x + px}" cy="${py}" r="6" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1.4"/>`).join("")}
      <text x="${x + w / 2}" y="180" text-anchor="middle" font-size="14" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 188" ${NS} fill="none" role="img" aria-label="윗면이 열린 실린더 두 개. 가는 추 한 개를 얹어 부피가 크고, 나는 추 두 개를 얹어 부피가 절반">
    ${jar(38, "(가)", 70, 1, [[24, 98], [58, 92], [86, 104], [36, 126], [70, 120], [88, 142], [48, 146]])}
    ${jar(198, "(나)", 110, 2, [[18, 130], [42, 133], [68, 129], [92, 134], [30, 149], [56, 148], [82, 150]])}
  </svg>`;
}

/** 부피-온도 직선 위 (가)(나)(다) */
export function tempVolLineFig(): string {
  return `<svg viewBox="0 0 344 192" ${NS} fill="none" role="img" aria-label="온도에 따른 부피 직선 그래프 위의 세 점 가, 나, 다">
    <line x1="52" y1="22" x2="52" y2="158" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="158" x2="322" y2="158" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="132" x2="310" y2="52" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${[[92, 120, "(가)"], [180, 94, "(나)"], [268, 68, "(다)"]].map(([x, y, t]) => `<circle cx="${x}" cy="${y}" r="4.4" fill="#5E6B7E"/><text x="${x}" y="${Number(y) - 11}" text-anchor="middle" font-size="14" font-weight="700" fill="#4E5968">${t}</text>`).join("")}
    <text x="12" y="15" font-size="13.5" fill="#4E5968">부피(mL)</text>
    <text x="322" y="182" text-anchor="end" font-size="13.5" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

// ── recap 미니 아트(64×64, 카드에서 32~48px로 보인다) ──────────────
// 색: 입자 파랑(#5AA2F8), 미는 힘과 충돌은 주황(#F0A422), 뜨거운 입자는 주황(#FF8A3D). 빨강(오답 색)은 쓰지 않는다.
const dotC = (x: number, y: number, r = 3.4, c = "#5AA2F8"): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const MINI: Record<string, string> = {
  // 압력: 같은 힘(같은 길이의 화살)이 왼쪽은 1칸에 몰리고, 오른쪽은 6칸에 나뉜다
  pressDef: `<path d="M16 4v14M41 4v14" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M12 14l4 5 4-5M37 14l4 5 4-5" stroke="#8B95A1" stroke-width="2.4" fill="none"/>
    <path d="M16 25v20" stroke="#F0A422" stroke-width="3.6"/><path d="M11 39l5 7 5-7" stroke="#F0A422" stroke-width="3.2" fill="none"/>
    <rect x="12" y="49" width="8" height="8" rx="1.5" fill="#FF8A3D"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${28.5 + i * 5} 40v5" stroke="#F0A422" stroke-width="2.2"/>`).join("")}
    <rect x="26" y="49" width="30" height="8" rx="1.5" fill="#BFE6F2" stroke="#37B6D8" stroke-width="1.4"/>
    <path d="M31 49v8M36 49v8M41 49v8M46 49v8M51 49v8" stroke="#37B6D8" stroke-width="1.2"/>`,
  // 기체의 압력: 상자 벽 안쪽에 닿은 입자와, 닿은 자리의 번쩍임(벽 위의 주황)
  gasHit: `<rect x="8" y="10" width="48" height="44" rx="8" stroke="#8B95A1" stroke-width="2.8"/>
    <path d="M56 17v14" stroke="#F0A422" stroke-width="3.8"/>
    ${dotC(50, 24, 4.4)}<path d="M45 26l-8 4" stroke="#5AA2F8" stroke-width="2"/>
    <path d="M17 54h14" stroke="#F0A422" stroke-width="3.8"/>
    ${dotC(24, 48, 4.4)}<path d="M26 43l4-8" stroke="#5AA2F8" stroke-width="2"/>
    ${dotC(24, 24, 4.4)}<path d="M20 20l-5-4" stroke="#5AA2F8" stroke-width="2"/>
    ${dotC(41, 41, 4.4)}<path d="M37 38l-5-4" stroke="#5AA2F8" stroke-width="2"/>`,
  // 보일 법칙: 피스톤을 밀어 넣은 주사기(미는 화살은 주황)
  boylePiston: `<rect x="8" y="22" width="48" height="22" rx="6" fill="#EAF2FD" stroke="#8B95A1" stroke-width="2.2"/>
    <rect x="24" y="24" width="6" height="18" rx="2" fill="#5E6B7E"/>
    <path d="M20 33h-12" stroke="#5E6B7E" stroke-width="3"/>
    <circle cx="38" cy="30" r="3" fill="#5AA2F8"/><circle cx="47" cy="36" r="3" fill="#5AA2F8"/><circle cx="41" cy="39" r="3" fill="#5AA2F8"/>
    <path d="M14 52h36" stroke="#F0A422" stroke-width="2.6"/><path d="M45 47l6 5-6 5" fill="none" stroke="#F0A422" stroke-width="2.6"/>`,
  // 반비례 곡선: 부피 = 24 ÷ 압력의 점(처음이 가장 가파르다)
  inverseCurve: (() => {
    let d = "";
    for (let p = 1; p <= 4.61; p += 0.15) d += `${d ? "L" : "M"}${f1(16 + ((p - 1) / 3.6) * 36)} ${f1(48 - (24 / p / 24) * 34)}`;
    return `<path d="M12 10v42h42" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="${d}" stroke="#37B6D8" stroke-width="3" fill="none"/>
    <circle cx="16" cy="14" r="2.6" fill="#37B6D8"/><circle cx="26" cy="31" r="2.6" fill="#37B6D8"/><circle cx="46" cy="39.5" r="2.6" fill="#37B6D8"/>`;
  })(),
  // 보일 법칙을 입자로: 같은 수(넷)의 입자가 긴 통과 절반 통에. 좁은 통은 벽 충돌(벽 위의 주황)이 많다
  boyleParticles: `<rect x="6" y="8" width="52" height="18" rx="5" fill="#F2F7FD" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M10 10v14" stroke="#5E6B7E" stroke-width="3"/>
    ${dotC(18, 14)}${dotC(30, 20)}${dotC(41, 13)}${dotC(51, 20)}
    <path d="M58 12v6" stroke="#F0A422" stroke-width="3"/>
    <rect x="32" y="36" width="26" height="18" rx="5" fill="#F2F7FD" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M36 38v14M36 45H10" stroke="#5E6B7E" stroke-width="3"/>
    ${dotC(42, 41)}${dotC(51, 41)}${dotC(45, 49)}${dotC(53, 49)}
    <path d="M58 39v5M58 47v5M41 36h7M43 54h8" stroke="#F0A422" stroke-width="3"/>`,
  // 누르는 압력이 커지면: 눌려 납작해진 공기 주머니(입자 수는 같고 사이만 좁다)
  bubbleSquash: `<path d="M3 51h58" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M5 51a11.5 14 0 0 1 23 0" fill="#EAF6FD" stroke="#37B6D8" stroke-width="2.4"/>
    ${dotC(11.5, 46, 2.6)}${dotC(17, 41, 2.6)}${dotC(22.5, 46.5, 2.6)}${dotC(16.5, 48, 2.6)}
    <path d="M33 51q0-7 7-8h11q7 1 7 8" fill="#EAF6FD" stroke="#37B6D8" stroke-width="2.4"/>
    ${dotC(39.5, 47.5, 2.6)}${dotC(45, 47.5, 2.6)}${dotC(50.5, 47.5, 2.6)}${dotC(55.5, 48, 2.6)}
    <path d="M40 2v35a5.5 5.5 0 0 0 11 0V2" fill="#F6D6BE" stroke="#C99A7C" stroke-width="2"/>
    <path d="M42 24q3.5 2 7 0" stroke="#C99A7C" stroke-width="1.6"/>
    <path d="M33 14v13M29 22l4 5 4-5" stroke="#F0A422" stroke-width="2.6" fill="none"/>`,
  diverMini: `<path d="M8 16q10-5 18 0t18 0 14 0" stroke="#5AA2F8" stroke-width="2.2" fill="none"/>
    <circle cx="40" cy="46" r="5" fill="none" stroke="#37B6D8" stroke-width="2"/>
    <circle cx="34" cy="32" r="7" fill="none" stroke="#37B6D8" stroke-width="2.2"/>
    <circle cx="28" cy="17" r="9.5" fill="none" stroke="#37B6D8" stroke-width="2.4"/>`,
  // 샤를 법칙: 섭씨 그래프는 원점을 지나지 않는다(세로축 위쪽에서 시작하는 직선)
  linearLine: `<path d="M12 10v42h42" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M12 38L52 16" stroke="#F0A422" stroke-width="3"/>
    <circle cx="22" cy="32.5" r="2.6" fill="#F0A422"/><circle cx="34" cy="26" r="2.6" fill="#F0A422"/><circle cx="46" cy="19.3" r="2.6" fill="#F0A422"/>`,
  // 샤를 법칙을 입자로: 같은 수(셋)의 입자. 차가운 쪽은 꼬리가 짧고, 뜨거운 쪽은 꼬리가 길고 벽 충돌 표시가 크다(부피도 크다)
  charlesParticles: `<rect x="5" y="26" width="24" height="30" rx="5" fill="#EEF5FD" stroke="#8B95A1" stroke-width="2.2"/>
    ${dotC(13, 34, 3.2)}<path d="M13 34l-3.5 2" stroke="#5AA2F8" stroke-width="1.8"/>
    ${dotC(22, 42, 3.2)}<path d="M22 42l3-3" stroke="#5AA2F8" stroke-width="1.8"/>
    ${dotC(13, 49, 3.2)}<path d="M13 49l3 2" stroke="#5AA2F8" stroke-width="1.8"/>
    <path d="M29 39v4" stroke="#F0A422" stroke-width="2"/>
    <rect x="35" y="18" width="24" height="38" rx="5" fill="#FFF3E8" stroke="#8B95A1" stroke-width="2.2"/>
    ${dotC(42, 26, 3.4, "#FF8A3D")}<path d="M42 26l7 8" stroke="#FF8A3D" stroke-width="2"/>
    ${dotC(52, 39, 3.4, "#FF8A3D")}<path d="M52 39l-10-3" stroke="#FF8A3D" stroke-width="2"/>
    ${dotC(48, 49, 3.4, "#FF8A3D")}<path d="M48 49l-10 1" stroke="#FF8A3D" stroke-width="2"/>
    <path d="M59 32v14M39 56h12" stroke="#F0A422" stroke-width="3.6"/>`,
  charlesHeat: `<rect x="26" y="8" width="12" height="34" rx="6" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
    <circle cx="32" cy="48" r="8" fill="#FF8A3D"/>
    <rect x="29" y="22" width="6" height="20" rx="3" fill="#FF8A3D"/>
    <path d="M46 30h8M50 26l4 4-4 4" stroke="#F0A422" stroke-width="2.4" fill="none"/>`,
  hotairMini: `<ellipse cx="32" cy="22" rx="16" ry="18" fill="#FFD98A" stroke="#E8961E" stroke-width="2.2"/>
    <path d="M24 38l3 8M40 38l-3 8" stroke="#8B95A1" stroke-width="2"/>
    <rect x="26" y="46" width="12" height="9" rx="2.5" fill="#C89A5A" stroke="#8A5F30" stroke-width="1.8"/>
    <path d="M30 40q2-4 4 0" stroke="#F25C54" stroke-width="2.2" fill="none"/>`,
  soccerCold: `<circle cx="30" cy="34" r="16" fill="#fff" stroke="#5E6B7E" stroke-width="2.4"/>
    <path d="M20 26q8 8 4 14q6 2 10-3" fill="none" stroke="#8B95A1" stroke-width="2"/>
    <path d="M30 30l4-5 5 3-1 6-6 1z" fill="#5E6B7E"/>
    <path d="M50 16l3-3M54 24h4M50 32l3 3" stroke="#37B6D8" stroke-width="2.2"/>`,
};

export function gasMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
