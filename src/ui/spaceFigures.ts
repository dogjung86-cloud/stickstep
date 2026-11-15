// spaceFigures — VII 태양계 단원 퀴즈 SVG + recap 미니아트.
// 파운드리 재질 문법: 근-동조 그라데이션 면 + 키라이트 + 발광(우주는 접촉 그림자 대신 글로우).
// 태양 관련 그림은 실제 관측 사진(public/photos/, NASA·NOIRLab — CREDITS.md)을 SVG <image>로 임베드한다.

const NS = `xmlns="http://www.w3.org/2000/svg"`;
const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const photo = (name: string): string => `${base}photos/${name}`;

const panel = (w: number, h: number, inner: string, defs = ""): string =>
  `<svg viewBox="0 0 ${w} ${h}" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="spf-sky" x1="0" y1="0" x2="0" y2="${h}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226"/><stop offset="1" stop-color="#16233F"/>
      </linearGradient>${defs}
    </defs>
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="14" fill="url(#spf-sky)"/>
    ${inner}
  </svg>`;

const star = (x: number, y: number, r = 1.2, o = 0.8): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(220,232,255,${o})"/>`;

// ── L3 태양 ──────────────────────────────────────────────────

/** 흑점 확대 — 실제 관측 사진(Hinode G-band, 흑점+쌀알 무늬). 콜아웃은 좌하단 태그에서
 *  점선 리더로 흑점을 가리킨다(자체 구도 — 발문 "어두운 부분 (가)"와 짝). */
export function sunspotFig(): string {
  return `<svg viewBox="0 0 280 180" ${NS} fill="none" aria-hidden="true">
    <defs>
      <clipPath id="spf-spclip"><rect x="2" y="2" width="276" height="176" rx="14"/></clipPath>
    </defs>
    <g clip-path="url(#spf-spclip)">
      <image href="${photo("sunspot_hinode.jpg")}" x="2" y="-34" width="276" height="260" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <rect x="2" y="2" width="276" height="176" rx="14" stroke="rgba(94,44,8,.55)" stroke-width="1.6"/>
    <circle cx="163" cy="122" r="12" stroke="#FFF2D8" stroke-width="1.8" stroke-dasharray="4 3"/>
    <path d="M64 146l87 -20" stroke="#FFF2D8" stroke-width="2" stroke-dasharray="5 4"/>
    <rect x="28" y="136" width="36" height="22" rx="8" fill="rgba(20,12,4,.72)"/>
    <text x="46" y="151" fill="#FFE9C0" font-size="12" font-weight="800" text-anchor="middle" font-family="Pretendard, sans-serif">(가)</text>
  </svg>`;
}

/** 흑점 수 그래프(마무리 13) — 실관측 1990~2010 창.
 *  1990 부근은 22주기 극대(1989.9) 직후라 높고, 1996 무렵 극소(가), 2000 무렵 23주기 극대(나),
 *  2002 이중 봉우리 어깨, 2008~2009 깊은 극소 뒤 살짝 회복. 극대→극대 약 11년. */
export function sunspotGraphFig(): string {
  return panel(
    280,
    160,
    `
    <path d="M34 128h224M34 128V18" stroke="#4A5F86" stroke-width="1.6"/>
    <text x="40" y="16" fill="#9FB4D8" font-size="10.5" font-weight="700" font-family="Pretendard, sans-serif">흑점 수(개)</text>
    <text x="262" y="154" fill="#9FB4D8" font-size="10.5" font-weight="700" text-anchor="end" font-family="Pretendard, sans-serif">연도</text>
    ${[["1990", 44], ["1995", 90], ["2000", 136], ["2005", 182], ["2010", 228]]
      .map(([t, x]) => `<text x="${x}" y="143" fill="#9FB4D8" font-size="10.5" text-anchor="middle" font-family="Pretendard, sans-serif">${t}</text><path d="M${x} 128v3" stroke="#4A5F86" stroke-width="1.2"/>`)
      .join("")}
    <path d="M40 38 C 50 40, 62 60, 76 82 C 90 104, 96 116, 103 120 C 112 125, 120 96, 130 62 C 136 46, 140 40, 145 42 C 150 46, 154 44, 162 58 C 176 82, 198 112, 216 124 C 224 129, 234 118, 244 102"
      stroke="#FFB03A" stroke-width="2.6" fill="none"/>
    <circle cx="103" cy="120" r="3" fill="#FFB03A"/>
    <text x="103" y="108" fill="#FFE0A8" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(가)</text>
    <circle cx="142" cy="41" r="3" fill="#FFB03A"/>
    <text x="142" y="29" fill="#FFE0A8" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(나)</text>
  `,
  );
}

/** 누운 자전축(천왕성). 천왕성은 실사(photos/uranus.jpg, 보이저 2, 원판 가운데 (596.4, 596.1), 반지름 482.7px) 위에
 *  고리와 자전축만 코드로 얹는다. 자전축 기울기 97.8°라 축은 궤도면에서 약 8° 들려 있고, 고리는 축에 수직이라 거의 세로로 선다.
 *  고리의 뒤쪽 반은 행성 뒤로(먼저 그림), 앞쪽 반은 행성 앞으로(나중에 그림). 글자는 설계 10.5px 이상(폰 약 12.6px). */
export function uranusTiltFig(): string {
  const cx = 140;
  const cy = 64;
  const R = 26;
  const s = R / 482.7;
  const ring = (half: "back" | "front"): string =>
    `<path d="M${cx} ${cy - 47}A9 47 0 0 ${half === "front" ? 1 : 0} ${cx} ${cy + 47}" stroke="#A8DCE2" stroke-width="2.4" opacity="${half === "front" ? 0.95 : 0.55}"/>`;
  return panel(
    280,
    132,
    `
    ${star(30, 26)}${star(250, 30)}${star(224, 108, 1, 0.6)}${star(52, 104, 1, 0.6)}
    <path d="M22 ${cy}h236" stroke="#4A5F86" stroke-width="1.4" stroke-dasharray="5 5"/>
    <text x="262" y="${cy + 16}" fill="#9FB4D8" font-size="10.5" font-weight="700" text-anchor="end" font-family="Pretendard, sans-serif">공전 궤도면</text>
    <g transform="rotate(-8 ${cx} ${cy})">${ring("back")}</g>
    <clipPath id="spf-urc"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>
    <image href="${photo("uranus.jpg")}" x="${(cx - 596.4 * s).toFixed(2)}" y="${(cy - 596.1 * s).toFixed(2)}" width="${(1200 * s).toFixed(2)}" height="${(1200 * s).toFixed(2)}" clip-path="url(#spf-urc)"/>
    <g transform="rotate(-8 ${cx} ${cy})">
      ${ring("front")}
      <path d="M${cx - R - 30} ${cy}H${cx - R - 3}M${cx + R + 3} ${cy}H${cx + R + 30}" stroke="#FFD25E" stroke-width="2.6"/>
      <path d="M${cx + R + 38} ${cy}l-9-4.6v9.2z" fill="#FFD25E"/>
    </g>
    <text x="${cx + R + 40}" y="${cy - 14}" fill="#FFE08A" font-size="10.5" font-weight="800" font-family="Pretendard, sans-serif">자전축</text>
    <text x="${cx}" y="123" fill="#C9DAF4" font-size="10.5" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">자전축이 궤도면과 거의 나란해요</text>
  `,
  );
}

// ── L2 행성 분류 ─────────────────────────────────────────────

/** 행성 두 무리 산점도 — 자체 구도: 가로축 질량·세로축 반지름(지구=1, NASA 공개 자료 기반).
 *  무리 안 상대 위치는 실제 대소 관계를 따른다(질량 수<화<금<지 / 천<해<토<목,
 *  반지름 수<화<금≈지 / 해≈천<토<목). */
export function planetGroupsFig(): string {
  // [이름, 점 x, 점 y, 색, 이름표 x, 이름표 y]: 이름표는 점끼리 붙은 곳에서 서로 비켜 둔다(금과 지가 겹치던 것)
  const pts: [string, number, number, string, number, number][] = [
    ["수", 46, 116, "#9C9894", 43, 105], ["화", 56, 111, "#C05B3C", 57, 99], ["금", 72, 101, "#E2B96B", 70, 89], ["지", 80, 99, "#5AA2F8", 92, 103],
    ["천", 176, 64, "#8FD8DD", 172, 52], ["해", 186, 66, "#6E8CE8", 190, 82], ["토", 216, 42, "#E8D9A8", 216, 30], ["목", 240, 26, "#D3AC7C", 240, 14],
  ];
  const t = (x: number, y: number, s: string, o = ""): string =>
    `<text x="${x}" y="${y}" font-size="10.5" font-family="Pretendard, sans-serif" ${o}>${s}</text>`;
  return panel(
    280,
    150,
    `
    <path d="M34 122h224M34 122V16" stroke="#4A5F86" stroke-width="1.6"/>
    ${t(40, 14, "반지름(지구=1)", 'fill="#9FB4D8" font-weight="700"')}
    ${t(262, 140, "질량(지구=1)", 'fill="#9FB4D8" font-weight="700" text-anchor="end"')}
    <ellipse cx="63" cy="106" rx="38" ry="22" stroke="#5AA2F8" stroke-width="1.8" stroke-dasharray="5 4"/>
    ${t(63, 142, "작고 오밀조밀", 'fill="#9CC2F2" font-weight="700" text-anchor="middle"')}
    <ellipse cx="206" cy="46" rx="52" ry="32" stroke="#FFB03A" stroke-width="1.8" stroke-dasharray="5 4"/>
    ${t(206, 100, "크고 듬직", 'fill="#FFD79E" font-weight="700" text-anchor="middle"')}
    ${pts
      .map(
        ([n, x, y, c, lx, ly]) =>
          `<circle cx="${x}" cy="${y}" r="5.5" fill="${c}"/>${t(lx, ly + 3.6, n, 'fill="#E4EDFF" font-weight="700" text-anchor="middle" paint-order="stroke" stroke="#0E1A30" stroke-width="2.6" stroke-linejoin="round"')}`,
      )
      .join("")}
  `,
  );
}

// ── L4 일주·공전 ─────────────────────────────────────────────

/** 북쪽 하늘 일주(동심원, 마무리 6) — 자체 구도.
 *  회전 화살표는 반드시 시계 반대 방향(오른쪽 옆구리에서 위로 감아 올라감):
 *  t=+50°(180,117.5) → t=−30°(193.7,39), sweep 0 = 화면 기준 반시계. 화살촉은 진행 방향(좌상). */
export function northSkyFig(): string {
  let arcs = "";
  for (let i = 1; i <= 6; i++) {
    const r = i * 15;
    arcs += `<circle cx="140" cy="70" r="${r}" stroke="rgba(190,214,255,${0.42 - i * 0.045})" stroke-width="1.6" stroke-dasharray="${(r * 3.7).toFixed(0)} ${(r * 2.3).toFixed(0)}" transform="rotate(${i * 47 + 12} 140 70)"/>`;
  }
  return panel(
    280,
    150,
    `
    ${arcs}
    <circle cx="140" cy="70" r="2.6" fill="#FFF0C8"/>
    <path d="M180 117.5A62 62 0 0 0 193.7 39" stroke="#FFD25E" stroke-width="2.2" fill="none"/>
    <path d="M189.2 31.2l8 5.8-7 4z" fill="#FFD25E"/>
    <path d="M6 133q64-24 128-13t140 3v11a14 14 0 0 1-14 14H20a14 14 0 0 1-14-14z" fill="#0A1428"/>
  `,
  );
}

/** 남쪽 하늘 일주(수평 궤적 — "어느 하늘일까?" 퀴즈). */
export function southTrailFig(): string {
  let lines = "";
  let sd = 13;
  const rnd = (): number => {
    sd = (sd * 48271) % 2147483647;
    return sd / 2147483647;
  };
  for (let i = 0; i < 16; i++) {
    const y = 18 + rnd() * 86;
    const x = 16 + rnd() * 160;
    const len = 54 + rnd() * 44;
    lines += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}h${len.toFixed(0)}" stroke="rgba(190,214,255,${(0.2 + rnd() * 0.3).toFixed(2)})" stroke-width="1.6"/>
      <circle cx="${(x + len).toFixed(0)}" cy="${y.toFixed(0)}" r="1.6" fill="rgba(226,238,255,.9)"/>`;
  }
  return panel(
    280,
    150,
    `
    ${lines}
    <!-- 남쪽 하늘: 별은 동(왼쪽)→서(오른쪽)로 흐른다. 화살촉은 오른쪽 -->
    <path d="M96 122h84" stroke="#FFD25E" stroke-width="2.4"/>
    <path d="M189 122l-9-4.5v9z" fill="#FFD25E"/>
    <path d="M6 134q80-20 140-8t128 0v10a14 14 0 0 1-14 14H20a14 14 0 0 1-14-14z" fill="#0A1428"/>
  `,
  );
}

/** 황도 12궁 미니(마무리 7 — 지구 ㉠ = 5월 위치, 그림 VII-8 기준).
 *  지구는 궤도 위쪽(천칭자리 앞) — 태양 너머(아래) 별자리 = 양자리(태양 쪽, 못 봄),
 *  지구 등 뒤(위) = 천칭자리(한밤 남쪽 하늘). 양(90°)↔천칭(270°)은 실제로도 마주 보는 짝. */
export function zodiacQuizFig(): string {
  const names: [string, number][] = [
    ["게", 0], ["쌍둥이", 30], ["황소", 60], ["양", 90], ["물고기", 120], ["물병", 150],
    ["염소", 180], ["궁수", 210], ["전갈", 240], ["천칭", 270], ["처녀", 300], ["사자", 330],
  ];
  // 글자는 설계 10.5px(폰 약 13px). 고리를 키우고 그림을 168에서 196으로 늘려 이름 사이를 띄웠다(예전 9px, 2026-11-15 그래픽 감사).
  const cx = 140;
  const cy = 98;
  const R = 80;
  const RY = 62;
  let ring = "";
  for (const [n, deg] of names) {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * RY;
    // 정답 유추 방지 — 모든 별자리를 같은 스타일로(강조 금지)
    ring += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.3" fill="#9FB6DC"/>
      <text x="${x.toFixed(1)}" y="${(y - 7).toFixed(1)}" fill="#B4C7E6" font-size="10.5" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">${n}</text>`;
  }
  return panel(
    280,
    196,
    `
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${RY}" stroke="#3D5378" stroke-width="1.3" stroke-dasharray="3 4"/>
    ${ring}
    <circle cx="${cx}" cy="${cy}" r="10" fill="url(#spf-sunc)"/>
    <text x="${cx + 16}" y="${cy + 4}" fill="#FFC85E" font-size="10.5" font-weight="700" font-family="Pretendard, sans-serif">태양</text>
    <circle cx="${cx}" cy="${cy - 30}" r="6" fill="url(#spf-ea)"/>
    <text x="${cx + 12}" y="${cy - 30}" fill="#BFD8FF" font-size="11" font-weight="700" font-family="Pretendard, sans-serif">㉠지구</text>
    <path d="M${cx} ${cy - 22}L${cx} ${cy + RY - 21}" stroke="rgba(255,170,80,.5)" stroke-width="1.3" stroke-dasharray="4 4"/>
    <path d="M${cx} ${cy - 38}L${cx} ${cy - RY + 7}" stroke="rgba(140,190,255,.55)" stroke-width="1.3" stroke-dasharray="4 4"/>
  `,
    `<radialGradient id="spf-sunc" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#FFEDBE"/><stop offset="1" stop-color="#FFB03A"/>
    </radialGradient>
    <radialGradient id="spf-ea" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/>
    </radialGradient>`,
  );
}

// ── L5 달의 위상 ─────────────────────────────────────────────

/** 달 사진을 햇빛 받은 달처럼 조금 밝히는 필터(사진이 고르게 어두운 편이라 작은 원판에서 회색 덩이로 보인다). */
const MOON_BRIGHT = `<filter id="spf-mbr" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="1.3" intercept=".04"/><feFuncG type="linear" slope="1.3" intercept=".04"/><feFuncB type="linear" slope="1.28" intercept=".04"/></feComponentTransfer></filter>`;

/** 실사 달(photos/moon_lro.jpg, 원판 가운데 (700, 700), 반지름 약 700px) 위에 위상의 어두운 부분을 덮는다.
 *  e는 삭에서 반시계로 잰 각(도): 0 삭, 90 상현(오른쪽 반달), 180 망, 270 하현(왼쪽 반달). 위에서 내려다본 궤도의 달은
 *  햇빛이 오른쪽에서 오면 늘 오른쪽 반이 밝으므로 e = 90으로 그린다. 그림 안에 MOON_BRIGHT 필터(spf-mbr)가 있어야 한다.
 *  어두운 부분 = 밝은 부분의 나머지: 왼쪽 반원 + 명암 경계(가로 반지름 r|cos e|인 타원 호). 이우는 달은 좌우로 뒤집는다. */
function phaseMoon(id: string, cx: number, cy: number, r: number, e: number): string {
  const s = r / 694;
  const deg = ((e % 360) + 360) % 360;
  const a = deg <= 180 ? deg : 360 - deg;
  const rx = r * Math.abs(Math.cos((a * Math.PI) / 180));
  const f = (v: number): string => v.toFixed(2);
  const dark =
    a > 179.5
      ? ""
      : `<path d="M${f(cx)} ${f(cy - r)}A${r} ${r} 0 0 0 ${f(cx)} ${f(cy + r)}A${f(Math.max(0.01, rx))} ${r} 0 0 ${a < 90 ? 0 : 1} ${f(cx)} ${f(cy - r)}Z" fill="#0B1222" opacity=".9"${deg > 180 ? ` transform="translate(${f(2 * cx)} 0) scale(-1 1)"` : ""}/>`;
  return `<clipPath id="${id}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${r}"/></clipPath>
    <g clip-path="url(#${id})"><image href="${photo("moon_lro.jpg")}" x="${f(cx - 700 * s)}" y="${f(cy - 700 * s)}" width="${f(1400 * s)}" height="${f(1400 * s)}" preserveAspectRatio="none" filter="url(#spf-mbr)"/>${dark}</g>
    <circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" stroke="#5A6C8E" stroke-width="1" opacity=".8"/>`;
}

/** 달 공전 8위치(마무리 9 — 태양 빛 오른쪽).
 *  라벨 배치는 자체 구도: (라)=오른쪽(삭)·(가)=위(상현)·(나)=왼쪽(망)·(다)=아래(하현).
 *  발문의 좌우 반전 함정((다) 하현을 "오른쪽이 밝다"로)과 짝.
 *  달은 실사 위에 햇빛 쪽(오른쪽) 반만 밝게, 궤도에는 도는 방향(시계 반대) 화살 둘(보기 "(라)에서 (가)를 지나…"가 방향을 전제한다).
 *  글자는 설계 10.5px 이상(폰 약 13px). */
export function moonOrbitFig(): string {
  const cx = 140;
  const cy = 86;
  const R = 56;
  const RY = R * 0.86;
  let moons = "";
  const labels: Record<number, string> = { 0: "(라)", 2: "(가)", 4: "(나)", 6: "(다)" };
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = cx + Math.cos(a) * R;
    const y = cy - Math.sin(a) * RY;
    moons += phaseMoon(`spf-mo${i}`, x, y, 8, 90); // 밝은 반구는 항상 태양(오른쪽) 쪽
    const lab = labels[i];
    if (lab) {
      const lx = cx + Math.cos(a) * (R + 24);
      const ly = cy - Math.sin(a) * (RY + 22);
      moons += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" fill="#DCE8FF" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">${lab}</text>`;
    }
  }
  // 도는 방향 화살(궤도 위, 두 달 사이): 각 a0에서 a1(도)까지, 끝에 화살촉
  const at = (d: number): [number, number] => [cx + Math.cos((d * Math.PI) / 180) * R, cy - Math.sin((d * Math.PI) / 180) * RY];
  const arrow = (a0: number, a1: number): string => {
    let d = "";
    for (let t = a0; t <= a1 + 0.01; t += 3) {
      const [x, y] = at(t);
      d += `${d ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    const r1 = (a1 * Math.PI) / 180;
    const tx = -R * Math.sin(r1);
    const ty = -RY * Math.cos(r1);
    const tl = Math.hypot(tx, ty);
    const ux = tx / tl;
    const uy = ty / tl;
    const [ex, ey] = at(a1);
    const tip = `${(ex + ux * 5).toFixed(1)} ${(ey + uy * 5).toFixed(1)}`;
    const b1 = `${(ex - ux * 2 - uy * 4.2).toFixed(1)} ${(ey - uy * 2 + ux * 4.2).toFixed(1)}`;
    const b2 = `${(ex - ux * 2 + uy * 4.2).toFixed(1)} ${(ey - uy * 2 - ux * 4.2).toFixed(1)}`;
    return `<path d="${d}" stroke="#9DBBF0" stroke-width="2.2"/><path d="M${tip}L${b1}L${b2}z" fill="#9DBBF0"/>`;
  };
  return panel(
    280,
    176,
    `
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${RY}" stroke="#3D5378" stroke-width="1.4" stroke-dasharray="4 5"/>
    ${arrow(102, 121)}${arrow(282, 301)}
    ${moons}
    <circle cx="${cx}" cy="${cy}" r="11" fill="url(#spf-ea2)"/>
    <path d="M${cx - 4} ${cy - 2}q3-3 6-1t5 0" stroke="#7CA65A" stroke-width="1.6"/>
    <text x="${cx}" y="${cy + 26}" fill="#BFD8FF" font-size="10.5" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">지구</text>
    <g stroke="#FFC24E" stroke-width="3">
      <path d="M268 62l-14 0M268 86l-14 0M268 110l-14 0"/>
    </g>
    <path d="M254 62l6-3.4v6.8zM254 86l6-3.4v6.8zM254 110l6-3.4v6.8z" fill="#FFC24E"/>
    <text x="258" y="132" fill="#FFD79E" font-size="10.5" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">태양 빛</text>
  `,
    `<radialGradient id="spf-ea2" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/>
    </radialGradient>${MOON_BRIGHT}`,
  );
}

/** 위상 5모양(①~⑤) — 상현 찾기 퀴즈. 실사 달 위에 어두운 부분을 덮는다(②는 초승달: 오른쪽 가장자리만 밝다).
 *  예전에는 ②의 안쪽 호를 반지름 15의 원호로 써서 브라우저가 반지름을 20으로 키웠고, 두 호가 같은 반원을 지나 ①과 같은 빈 원이었다. */
export function fivePhasesFig(): string {
  const kinds = [0, 50, 90, 180, 270]; // 삭, 초승달, 상현달, 망, 하현달
  const nums = ["①", "②", "③", "④", "⑤"];
  return panel(
    280,
    116,
    kinds
      .map((e, i) => {
        const x = 36 + i * 52;
        return `${phaseMoon(`spf-5p${i}`, x, 60, 20, e)}<text x="${x}" y="102" fill="#BFD4F2" font-size="12" text-anchor="middle" font-family="Pretendard, sans-serif">${nums[i]}</text>`;
      })
      .join(""),
    MOON_BRIGHT,
  );
}

// ── L6 일식·월식 ─────────────────────────────────────────────

/** 손전등—큰 공—작은 공 모형(마무리 10) — 월식형 배치(자체 구도).
 *  광축(y=62) 위에 세 물체가 정확히 일직선. 빛은 큰 공까지만 닿고,
 *  큰 공 뒤로 그림자가 길게 이어져 그 속의 작은 공 (가)가 통째로 어두워진다.
 *  그림자 경계: y = 62 ± (17 − 17(x−128)/292) — x=205에서 반높이 12.5 > 작은 공 r9(완전히 안). */
export function eclipseModelFig(): string {
  return panel(
    280,
    140,
    `
    <rect x="20" y="96" width="240" height="10" rx="5" fill="#26344E"/>
    <rect x="20" y="96" width="240" height="4" rx="2" fill="#3A4C6E"/>
    <!-- 손전등 (중심 y=62) -->
    <path d="M28 96v-24" stroke="#5A6C8E" stroke-width="2.4"/>
    <rect x="24" y="53" width="32" height="18" rx="6" fill="url(#spf-torch)"/>
    <path d="M30 56h18" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
    <path d="M56 51l14 11v0l-14 11z" fill="#4A5A76"/>
    <path d="M56 51l14 11-14 11z" stroke="#2E3A52" stroke-width="1.2"/>
    <!-- 빛(손전등→큰 공까지만, 공 지름만큼 벌어진다) -->
    <path d="M70 55L111 45v34L70 69z" fill="url(#spf-beam)"/>
    <!-- 큰 공 그림자(큰 공 뒤→오른쪽 끝, 서서히 좁아진다) -->
    <path d="M145 45L278 53.7v16.6L145 79z" fill="rgba(6,10,20,.5)"/>
    <path d="M145 45L278 53.7M145 79L278 70.3" stroke="#3D5378" stroke-width="1" stroke-dasharray="3 3"/>
    <!-- 큰 공(지구 역, 중심 y=62) -->
    <path d="M128 96V79" stroke="#5A6C8E" stroke-width="2.4"/>
    <circle cx="128" cy="62" r="17" fill="url(#spf-ball2)"/>
    <path d="M128 45a17 17 0 0 1 0 34z" fill="rgba(10,16,32,.5)"/>
    <!-- 작은 공(달 역, 중심 y=62), 그림자 속이라 통째로 어둡다 -->
    <path d="M205 96V71" stroke="#5A6C8E" stroke-width="2.4"/>
    <circle cx="205" cy="62" r="9" fill="url(#spf-ball1)"/>
    <circle cx="205" cy="62" r="9" fill="rgba(10,14,26,.6)"/>
    <!-- 라벨 -->
    <text x="40" y="122" fill="#BFD4F2" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">손전등</text>
    <text x="128" y="122" fill="#BFD4F2" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">큰 공</text>
    <text x="205" y="122" fill="#BFD4F2" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">(가) 작은 공</text>
  `,
    `<linearGradient id="spf-torch" x1="0" y1="53" x2="0" y2="71" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#6E809E"/><stop offset="1" stop-color="#41506C"/>
    </linearGradient>
    <linearGradient id="spf-beam" x1="70" y1="62" x2="120" y2="62" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="rgba(255,228,150,.42)"/><stop offset="1" stop-color="rgba(255,228,150,.18)"/>
    </linearGradient>
    <radialGradient id="spf-ball1" cx=".3" cy=".35" r=".8">
      <stop offset="0" stop-color="#FFF6D8"/><stop offset="1" stop-color="#D9C36E"/>
    </radialGradient>
    <radialGradient id="spf-ball2" cx=".3" cy=".35" r=".8">
      <stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/>
    </radialGradient>`,
  );
}

/** 지구 그림자 속 달(마무리 12 — (가) 경계 걸치기 / (나) 깊숙이. 자체 구도).
 *  기하 규칙: 그림자 반높이 h(x) = 17 − 0.0554(x−112) (꼭짓점 x≈419) — 경계선 y = 74 ± h(x).
 *  달의 이동 경로는 (196,74)를 지나는 +24.6° 직선(원본과 반대 기울기) —
 *  (나)는 경로 위·본그림자 중심(깊숙이), (가)는 경로 위·아래쪽 경계에 정확히 걸친다:
 *  0.417t = 12.35 − 0.0504t → t=26.4 → (220,85), h(220)=11.0 = |y−74| 검산 일치(절반만 가려짐). */
export function lunarPathFig(): string {
  return lunarPathSvg(1);
}

/** 같은 그림을 위아래로 뒤집은 판: 달의 길이 오른쪽 위로 올라간다. 북극 위에서 내려다볼 때 달은 반시계로 돌므로
 *  (태양이 왼쪽이면 지구 뒤에서 위로) 레슨의 월식 랩(u7LunarLab)과 방향이 같다. (가)는 그림자의 위쪽 경계에 걸친다. */
export function lunarPathUpFig(): string {
  return lunarPathSvg(-1);
}

function lunarPathSvg(sy: 1 | -1): string {
  // 경로 위 점: P(t) = (196 + 0.909t, 74 ± 0.417t)
  const P = (t: number): [number, number] => [196 + 0.909 * t, 74 + sy * 0.417 * t];
  const [nx, ny] = P(0); // (나) — 본그림자 깊숙이
  const [gx, gy] = P(26.4); // (가) — 본그림자 아래 경계 위(절반 노출)
  const [p0x, p0y] = P(-36);
  const [p1x, p1y] = P(56);
  return panel(
    280,
    150,
    `
    <circle cx="20" cy="74" r="24" fill="url(#spf-sunl)"/>
    <g stroke="#FFC24E" stroke-width="2.6">
      <path d="M52 56h12M52 74h12M52 92h12"/>
    </g>
    <path d="M64 56l6-3.4v6.8zM64 74l6-3.4v6.8zM64 92l6-3.4v6.8z" fill="#FFC24E"/>
    <text x="58" y="42" fill="#FFD79E" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">태양 빛</text>
    <!-- 지구 그림자(본그림자 쐐기, 꼭짓점은 화면 밖) -->
    <path d="M112 57L278 66.2V81.8L112 91z" fill="rgba(10,16,32,.55)"/>
    <path d="M112 57L278 66.2M112 91L278 81.8" stroke="#3D5378" stroke-width="1.1" stroke-dasharray="3 4"/>
    <!-- 지구 -->
    <circle cx="112" cy="74" r="17" fill="url(#spf-earl)"/>
    <path d="M112 57a17 17 0 0 1 0 34z" fill="rgba(8,12,26,.5)"/>
    <text x="112" y="106" fill="#BFD4F2" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">지구</text>
    <!-- 달의 이동 경로(직선) + 진행 화살표 -->
    <path d="M${p0x.toFixed(1)} ${p0y.toFixed(1)}L${p1x.toFixed(1)} ${p1y.toFixed(1)}" stroke="#3D5378" stroke-width="1.3" stroke-dasharray="4 4"/>
    <path d="M${(p1x + 6.4).toFixed(1)} ${(p1y + sy * 2.9).toFixed(1)}L${(p1x - 1.6).toFixed(1)} ${(p1y + sy * 3.5).toFixed(1)}L${(p1x + 1.6).toFixed(1)} ${(p1y - sy * 3.5).toFixed(1)}z" fill="#5A78A8"/>
    <!-- (나) 본그림자 깊숙이, 붉은 달 -->
    <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="7" fill="#E8DCB8"/>
    <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="7" fill="rgba(120,30,16,.78)"/>
    <text x="${(nx - 4).toFixed(1)}" y="${(ny + 25).toFixed(1)}" fill="#FFD0B4" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(나)</text>
    <!-- (가) 아래 경계 걸치기, 위 절반(그림자 안)만 붉게 -->
    <circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="7" fill="#E8DCB8"/>
    <path d="M${(gx - 7).toFixed(1)} ${gy.toFixed(1)}a7 7 0 0 ${sy === 1 ? 1 : 0} 14 0z" fill="rgba(120,30,16,.78)" transform="rotate(${-3.2 * sy} ${gx.toFixed(1)} ${gy.toFixed(1)})"/>
    <text x="${gx.toFixed(1)}" y="${(gy + (sy === 1 ? 22 : -12)).toFixed(1)}" fill="#FFD0B4" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(가)</text>
  `,
    `<radialGradient id="spf-sunl" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#FFEDBE"/><stop offset="1" stop-color="#FFA82E"/>
    </radialGradient>
    <radialGradient id="spf-earl" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#7FB2F0"/><stop offset="1" stop-color="#1D4FA8"/>
    </radialGradient>`,
  );
}

/** 태양 구조 핫스팟 그림: 실제 관측 사진 세 칸(2026-11-15 그래픽 손질). unit7.ts 핫스팟은 pad0이라 spot 좌표(%) = 이 viewBox(280×184) 좌표 비율이다.
 *  왼쪽: 평소의 태양(백색광, NOIRLab 1989 극대기, 원판 가운데 (905, 855) 반지름 760px). 광구와 흑점.
 *  가운데: 개기일식(NASA 2017, 달 가운데 (958, 597) 반지름 255.3px). 코로나.
 *  오른쪽: 태양의 오른쪽 가장자리를 채층에서 나오는 빛(304Å)으로 크게 찍은 사진(NASA SDO, 2048px 사진의 (1700, 600)부터 0.3배). 채층과 홍염 고리.
 *  예전 두 칸 그림은 개기일식 사진에서 채층과 홍염이 거의 안 보여(채층 자리가 흰 코로나) 누를 자리 고리가 그 자리를 덮었다.
 *  작은 대상(흑점, 홍염)은 누를 자리를 비켜 두고 짧은 지시선으로 잇는다(누를 자리 고리는 26px라 대상을 덮는다). */
export function sunAnatomyFig(): string {
  const A = { x: 52, y: 72, r: 44 };
  const B = { x: 146, y: 72, r: 46, moon: 25 };
  const C = { x: 198, y: 22, w: 76, h: 100, sx: 1700, sy: 600, s: 0.3 };
  const sa = A.r / 760;
  const sb = B.moon / 255.3;
  const t = (x: number, y: number, str: string, fill: string, size = 10.5, w = 700): string =>
    `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${w}" text-anchor="middle" font-family="Pretendard, sans-serif">${str}</text>`;
  // 지시선: 대상 쪽 끝에 점선 고리(흑점 둘, 홍염 고리를 둘러싼다), 누를 자리 쪽 끝은 누를 자리 고리 밑으로 들어간다
  const lead = (x1: number, y1: number, x2: number, y2: number, ring: number): string =>
    `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="rgba(6,10,20,.75)" stroke-width="3"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="#FFF2D8" stroke-width="1.3"/>` +
    `<circle cx="${x1}" cy="${y1}" r="${ring}" stroke="#FFF2D8" stroke-width="1.2" stroke-dasharray="2.4 2"/>`;
  return `<svg viewBox="0 0 280 184" ${NS} fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="spf-ansky" x1="0" y1="0" x2="0" y2="184" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226"/><stop offset="1" stop-color="#141F3A"/>
      </linearGradient>
      <clipPath id="spf-anL"><circle cx="${A.x}" cy="${A.y}" r="${A.r}"/></clipPath>
      <clipPath id="spf-anM"><circle cx="${B.x}" cy="${B.y}" r="${B.r}"/></clipPath>
      <clipPath id="spf-anR"><rect x="${C.x}" y="${C.y}" width="${C.w}" height="${C.h}" rx="10"/></clipPath>
      <radialGradient id="spf-anGlow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFC85E" stop-opacity=".4"/><stop offset="1" stop-color="#FFC85E" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="276" height="180" rx="14" fill="url(#spf-ansky)"/>
    ${star(14, 14)}${star(104, 12, 1, 0.6)}${star(186, 14)}${star(266, 140, 1, 0.55)}${star(12, 124, 1, 0.55)}
    <!-- 왼쪽: 평소의 태양(백색광 사진, 광구와 흑점) -->
    <circle cx="${A.x}" cy="${A.y}" r="${A.r + 8}" fill="url(#spf-anGlow)"/>
    <g clip-path="url(#spf-anL)">
      <image href="${photo("sun_whitelight.jpg")}" x="${(A.x - 905 * sa).toFixed(2)}" y="${(A.y - 855 * sa).toFixed(2)}" width="${(1785 * sa).toFixed(2)}" height="${(1733 * sa).toFixed(2)}"/>
    </g>
    <!-- 가운데: 개기일식 사진(코로나) -->
    <g clip-path="url(#spf-anM)">
      <image href="${photo("eclipse_corona.jpg")}" x="${(B.x - 958 * sb).toFixed(2)}" y="${(B.y - 597 * sb).toFixed(2)}" width="${(1920 * sb).toFixed(2)}" height="${(1280 * sb).toFixed(2)}"/>
    </g>
    <circle cx="${B.x}" cy="${B.y}" r="${B.r}" stroke="rgba(170,192,232,.4)" stroke-width="1.2"/>
    <!-- 오른쪽: 가장자리를 크게(채층에서 나오는 빛으로 찍은 사진) -->
    <g clip-path="url(#spf-anR)">
      <rect x="${C.x}" y="${C.y}" width="${C.w}" height="${C.h}" fill="#0A0503"/>
      <image href="${photo("sun_304.jpg")}" x="${(C.x - C.sx * C.s).toFixed(2)}" y="${(C.y - C.sy * C.s).toFixed(2)}" width="${(2048 * C.s).toFixed(2)}" height="${(2048 * C.s).toFixed(2)}"/>
    </g>
    <rect x="${C.x}" y="${C.y}" width="${C.w}" height="${C.h}" rx="10" stroke="rgba(255,140,90,.45)" stroke-width="1.2"/>
    <!-- 작은 대상의 지시선(흑점 둘, 홍염 고리) -->
    ${lead(53, 68, 78, 44, 6.5)}
    ${lead(224, 60, 256, 44, 9)}
    <!-- 칸 이름 -->
    ${t(A.x, 133, "평소", "#FFD79E")}
    ${t(B.x, 133, "개기일식 때", "#C8D8F8")}
    ${t(C.x + C.w / 2, 136, "가장자리 확대", "#FFB89A")}
    ${t(140, 158, "실제 관측 사진이에요. 대기는 개기일식 때 보여요.", "#A9BCDD", 10.5, 600)}
    ${t(140, 174, "오른쪽은 채층에서 나오는 빛으로 찍은 사진이에요.", "#A9BCDD", 10.5, 600)}
  </svg>`;
}

// ── recap 미니아트 ───────────────────────────────────────────

export function spaceMiniArt(key: string): string {
  const wrap = (inner: string, defs = ""): string =>
    `<svg viewBox="0 0 96 96" ${NS} fill="none" stroke-linecap="round" aria-hidden="true">
      <defs>
        <linearGradient id="sma-bg" x1="0" y1="0" x2="0" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#0C1630"/><stop offset="1" stop-color="#1A2A4E"/>
        </linearGradient>${defs}
      </defs>
      <rect x="2" y="2" width="92" height="92" rx="18" fill="url(#sma-bg)"/>
      ${star(18, 20, 1.1, 0.7)}${star(78, 16, 1.2, 0.8)}${star(82, 76, 1, 0.55)}${star(14, 72, 1, 0.55)}
      ${inner}
    </svg>`;
  const sunG = `<radialGradient id="sma-sun" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#FFEDBE"/><stop offset=".55" stop-color="#FFC24E"/><stop offset="1" stop-color="#F59E2C"/>
  </radialGradient>`;
  const earthG = `<radialGradient id="sma-ea" cx=".35" cy=".3" r=".8">
    <stop offset="0" stop-color="#9FC6F4"/><stop offset=".6" stop-color="#2E6FD4"/><stop offset="1" stop-color="#1B4B9E"/>
  </radialGradient>`;
  const moonG = `<radialGradient id="sma-mo" cx=".35" cy=".3" r=".8">
    <stop offset="0" stop-color="#F6EED6"/><stop offset="1" stop-color="#C2B48C"/>
  </radialGradient>`;

  switch (key) {
    case "family": {
      // 태양 + 행성 여덟(카드 글 '행성 여덟 개'와 맞춘다). 왼쪽 아래 귀퉁이의 태양 둘레, 가까운 차례의 궤도 호 위에 하나씩.
      // [궤도 반지름, 각(°, 오른쪽이 0이고 위로 잰다), 크기, 색]. 크기는 무리끼리만 대강(목성형이 크다).
      const SX = 8;
      const SY = 88;
      const P: [number, number, number, string][] = [
        [28, 70, 1.7, "#A7A39E"], [33, 52, 2.5, "#E2B96B"], [38, 34, 2.6, "#4D8FE6"], [43, 16, 2.1, "#D0673F"],
        [52, 78, 5.2, "#D9B07E"], [61, 55, 4.4, "#E8D49E"], [70, 34, 3.3, "#9BDDE2"], [78, 14, 3.2, "#5E86E8"],
      ];
      let orbits = "";
      let dots = "";
      P.forEach(([o, a, r, c], i) => {
        const x = SX + o * Math.cos((a * Math.PI) / 180);
        const y = SY - o * Math.sin((a * Math.PI) / 180);
        orbits += `<circle cx="${SX}" cy="${SY}" r="${o}" stroke="#7E9FD6" stroke-width=".8" opacity=".28"/>`;
        if (i === 5) dots += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r * 2).toFixed(1)}" ry="${(r * 0.55).toFixed(1)}" stroke="#D9C08A" stroke-width="1.3" transform="rotate(-16 ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
        dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"/>`;
      });
      return wrap(
        `<clipPath id="sma-fam-c"><rect x="2" y="2" width="92" height="92" rx="18"/></clipPath>
        <g clip-path="url(#sma-fam-c)">${orbits}<circle cx="${SX}" cy="${SY}" r="24" fill="url(#sma-sun)"/></g>${dots}`,
        sunG,
      );
    }
    case "orbiters": // 혜성 꼬리 + 위성
      return wrap(
        `<circle cx="30" cy="60" r="11" fill="url(#sma-sun)"/>
        <circle cx="66" cy="34" r="5" fill="#DCE8F6"/>
        <path d="M70 30l16-12M72 36l18-6M66 28l10-16" stroke="rgba(150,210,255,.75)" stroke-width="2.6"/>
        <ellipse cx="30" cy="60" rx="26" ry="12" stroke="#3D5378" stroke-width="1.2" stroke-dasharray="3 4"/>`,
        sunG,
      );
    case "terra": // 암석 행성
      return wrap(
        `<circle cx="48" cy="48" r="22" fill="url(#sma-mars)"/>
        <ellipse cx="48" cy="30" rx="13" ry="4.6" fill="#F6FAFF" opacity=".95"/>
        <ellipse cx="40" cy="52" rx="7" ry="5" fill="rgba(92,44,30,.55)"/>
        <ellipse cx="58" cy="42" rx="5" ry="4" fill="rgba(92,44,30,.45)"/>`,
        `<radialGradient id="sma-mars" cx=".35" cy=".3" r=".8">
          <stop offset="0" stop-color="#E8916E"/><stop offset=".6" stop-color="#C05B3C"/><stop offset="1" stop-color="#8E3A24"/>
        </radialGradient>`,
      );
    case "jovian": // 고리 행성
      return wrap(
        `<g transform="rotate(-16 48 48)">
          <circle cx="48" cy="48" r="18" fill="url(#sma-sat)"/>
          <ellipse cx="48" cy="48" rx="32" ry="9" stroke="#D9C08A" stroke-width="3.4" opacity=".9"/>
          <path d="M33 42q15-6 30 0" stroke="#C08A5C" stroke-width="2.4" opacity=".6"/>
        </g>`,
        `<radialGradient id="sma-sat" cx=".35" cy=".3" r=".8">
          <stop offset="0" stop-color="#F4E8C4"/><stop offset=".6" stop-color="#E0C894"/><stop offset="1" stop-color="#B08D58"/>
        </radialGradient>`,
      );
    case "granule": // 광구·흑점
      return wrap(
        `<circle cx="48" cy="48" r="26" fill="url(#sma-sun)"/>
        <circle cx="40" cy="44" r="6" fill="#5E2C08"/>
        <circle cx="58" cy="56" r="3.6" fill="#5E2C08" opacity=".85"/>
        <path d="M34 34q6-4 10 0M52 36q6-4 10 0M40 62q6 4 12 0" stroke="rgba(255,236,180,.6)" stroke-width="2"/>`,
        sunG,
      );
    case "corona": // 개기일식 코로나
      return wrap(
        `<circle cx="48" cy="48" r="24" fill="url(#sma-cor)"/>
        <circle cx="48" cy="48" r="15" fill="#070B14"/>
        <circle cx="48" cy="48" r="15.6" stroke="#FF5436" stroke-width="1.6"/>
        <path d="M48 18v8M48 70v8M18 48h8M70 48h8M27 27l6 6M63 63l6 6M69 27l-6 6M27 69l6-6" stroke="rgba(214,230,255,.55)" stroke-width="2"/>`,
        `<radialGradient id="sma-cor" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#DCE8FF" stop-opacity=".9"/><stop offset="1" stop-color="#DCE8FF" stop-opacity="0"/>
        </radialGradient>`,
      );
    case "spin": // 지구 자전
      return wrap(
        `<circle cx="48" cy="48" r="20" fill="url(#sma-ea)"/>
        <path d="M40 42q6-4 10-1t8 1" stroke="#7CA65A" stroke-width="2.4"/>
        <path d="M48 22v-8M48 74v8" stroke="#8FB3E8" stroke-width="2" stroke-dasharray="3 3"/>
        <path d="M74 40a28 28 0 0 0-18-14" stroke="#FFD25E" stroke-width="2.6" fill="none"/>
        <path d="M56 26l-8-2 6-6z" fill="#FFD25E"/>`,
        earthG,
      );
    case "zodiac": // 공전 + 별자리 링
      return wrap(
        `<ellipse cx="48" cy="48" rx="34" ry="26" stroke="#3D5378" stroke-width="1.3" stroke-dasharray="3 4"/>
        <circle cx="48" cy="48" r="9" fill="url(#sma-sun)"/>
        <circle cx="76" cy="42" r="5" fill="url(#sma-ea)"/>
        ${star(14, 42, 1.6, 0.95)}${star(22, 30, 1.4, 0.85)}${star(30, 24, 1.4, 0.85)}
        ${star(66, 74, 1.4, 0.85)}${star(76, 68, 1.4, 0.85)}`,
        sunG + earthG,
      );
    case "phases": // 위상 4종
      return wrap(
        `<circle cx="28" cy="30" r="10" fill="#222E46" stroke="#5A6C8E" stroke-width="1.2"/>
        <g><circle cx="66" cy="30" r="10" fill="#222E46"/><path d="M66 20a10 10 0 0 1 0 20z" fill="url(#sma-mo)"/></g>
        <circle cx="28" cy="66" r="10" fill="url(#sma-mo)"/>
        <g><circle cx="66" cy="66" r="10" fill="#222E46"/><path d="M66 56a10 10 0 0 0 0 20z" fill="url(#sma-mo)"/></g>`,
        moonG,
      );
    case "eclipse": // 태양-달-지구 정렬
      return wrap(
        `<circle cx="18" cy="48" r="12" fill="url(#sma-sun)"/>
        <circle cx="48" cy="48" r="6" fill="url(#sma-mo)"/>
        <path d="M54 44l24 8-24 8z" fill="rgba(6,10,20,.6)"/>
        <circle cx="80" cy="48" r="11" fill="url(#sma-ea)"/>
        <ellipse cx="72" cy="48" rx="2.6" ry="4" fill="#060A14" opacity=".85"/>`,
        sunG + earthG + moonG,
      );
    case "clockmap": {
      // 위상 지도(그림 Ⅶ-9의 두 고리): 안쪽 궤도 위의 달은 어느 자리에서나 햇빛 쪽(오른쪽) 반이 밝고,
      // 바깥의 작은 원이 그 자리에서 지구에서 보이는 모양이다(삭은 안 보임, 위 상현은 오른쪽, 왼쪽 망은 둥글게, 아래 하현은 왼쪽).
      // 예전에는 궤도 위에 보이는 모양을 그대로 얹어 망 자리 달이 통째로, 하현 자리 달이 태양 반대쪽이 밝았다(2026-11-15 그래픽 감사).
      const half = (x: number, y: number, side: "R" | "L"): string =>
        `<circle cx="${x}" cy="${y}" r="5.5" fill="#222E46" stroke="#5A6C8E" stroke-width=".9"/><path d="M${x} ${y - 5.5}a5.5 5.5 0 0 ${side === "R" ? 1 : 0} 0 11z" fill="url(#sma-mo)"/>`;
      return wrap(
        `<ellipse cx="44" cy="48" rx="20" ry="18" stroke="#3D5378" stroke-width="1.2" stroke-dasharray="3 3.4"/>
        <circle cx="44" cy="48" r="6.5" fill="url(#sma-ea)"/>
        ${half(64, 48, "R")}${half(44, 30, "R")}${half(24, 48, "R")}${half(44, 66, "R")}
        <circle cx="79" cy="48" r="5.5" fill="#222E46" stroke="#7B8DB0" stroke-width="1" stroke-dasharray="2 1.6"/>
        ${half(44, 13, "R")}
        <circle cx="9.5" cy="48" r="5.5" fill="url(#sma-mo)"/>
        ${half(44, 83, "L")}
        <path d="M94 40l-6 8 6 8" stroke="#FFC24E" stroke-width="2" fill="none"/>`,
        earthG + moonG,
      );
    }
    case "redmoon": // 개기월식 붉은 달
      return wrap(
        `<circle cx="48" cy="48" r="22" fill="url(#sma-red)"/>
        <circle cx="40" cy="42" r="5" fill="rgba(60,14,8,.5)"/>
        <circle cx="56" cy="56" r="4" fill="rgba(60,14,8,.45)"/>
        <circle cx="48" cy="48" r="26" stroke="rgba(255,120,80,.35)" stroke-width="2"/>`,
        `<radialGradient id="sma-red" cx=".35" cy=".3" r=".8">
          <stop offset="0" stop-color="#E86A48"/><stop offset=".6" stop-color="#B33A24"/><stop offset="1" stop-color="#701E12"/>
        </radialGradient>`,
      );
    case "aurora": // 태양풍·오로라
      return wrap(
        `<path d="M20 70q4-26 12-30M34 74q4-22 10-28M50 74q2-20 8-26M64 72q2-18 8-24" stroke="url(#sma-au)" stroke-width="6" opacity=".85"/>
        <circle cx="76" cy="24" r="9" fill="url(#sma-sun)"/>
        <path d="M62 30l-8 6M66 38l-9 4" stroke="rgba(255,190,90,.6)" stroke-width="2"/>`,
        sunG +
          `<linearGradient id="sma-au" x1="0" y1="74" x2="0" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#2AE8A4" stop-opacity=".9"/><stop offset="1" stop-color="#7C5CFF" stop-opacity=".2"/>
        </linearGradient>`,
      );
    default:
      return wrap(`<circle cx="48" cy="48" r="18" fill="url(#sma-ea)"/>`, earthG);
  }
}
