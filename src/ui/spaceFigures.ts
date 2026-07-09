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
    <text x="16" y="24" fill="#8FA6CE" font-size="9" font-family="Pretendard, sans-serif">흑점 수(개)</text>
    <text x="250" y="146" fill="#8FA6CE" font-size="9" font-family="Pretendard, sans-serif">연도</text>
    ${[["1990", 44], ["1995", 90], ["2000", 136], ["2005", 182], ["2010", 228]]
      .map(([t, x]) => `<text x="${x}" y="142" fill="#8FA6CE" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">${t}</text><path d="M${x} 128v3" stroke="#4A5F86" stroke-width="1.2"/>`)
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

/** 누운 자전축(천왕성). */
export function uranusTiltFig(): string {
  return panel(
    280,
    132,
    `
    ${star(30, 26)}${star(250, 30)}${star(224, 108, 1, 0.6)}${star(52, 104, 1, 0.6)}
    <path d="M28 66h224" stroke="#4A5F86" stroke-width="1.4" stroke-dasharray="5 5"/>
    <text x="234" y="82" fill="#8FA6CE" font-size="9" font-family="Pretendard, sans-serif">공전 궤도면</text>
    <circle cx="140" cy="66" r="26" fill="url(#spf-ur)"/>
    <ellipse cx="140" cy="66" rx="7" ry="38" stroke="#9FD4DA" stroke-width="2.6" opacity=".8"/>
    <path d="M96 66h16M168 66h16" stroke="#FFD25E" stroke-width="2.6"/>
    <path d="M184 66l-7-4v8z" fill="#FFD25E"/>
    <text x="140" y="122" fill="#BFD4F2" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">자전축이 궤도면과 거의 나란!</text>
  `,
    `<radialGradient id="spf-ur" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#C8F0F2"/><stop offset=".6" stop-color="#7CCFD6"/><stop offset="1" stop-color="#4A9BA4"/>
    </radialGradient>`,
  );
}

// ── L2 행성 분류 ─────────────────────────────────────────────

/** 행성 두 무리 산점도 — 자체 구도: 가로축 질량·세로축 반지름(지구=1, NASA 공개 자료 기반).
 *  무리 안 상대 위치는 실제 대소 관계를 따른다(질량 수<화<금<지 / 천<해<토<목,
 *  반지름 수<화<금≈지 / 해≈천<토<목). */
export function planetGroupsFig(): string {
  const pts: [string, number, number, string][] = [
    ["수", 46, 116, "#9C9894"], ["화", 56, 111, "#C05B3C"], ["금", 72, 101, "#E2B96B"], ["지", 80, 99, "#5AA2F8"],
    ["천", 176, 64, "#8FD8DD"], ["해", 186, 66, "#6E8CE8"], ["토", 216, 42, "#E8D9A8"], ["목", 240, 26, "#D3AC7C"],
  ];
  return panel(
    280,
    150,
    `
    <path d="M34 122h224M34 122V16" stroke="#4A5F86" stroke-width="1.6"/>
    <text x="14" y="24" fill="#8FA6CE" font-size="9" font-family="Pretendard, sans-serif">반지름(지구=1)</text>
    <text x="218" y="140" fill="#8FA6CE" font-size="9" font-family="Pretendard, sans-serif">질량(지구=1)</text>
    <ellipse cx="63" cy="108" rx="36" ry="19" stroke="#5AA2F8" stroke-width="1.8" stroke-dasharray="5 4"/>
    <text x="63" y="142" fill="#9CC2F2" font-size="10" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">작고 오밀조밀</text>
    <ellipse cx="206" cy="46" rx="52" ry="32" stroke="#FFB03A" stroke-width="1.8" stroke-dasharray="5 4"/>
    <text x="206" y="100" fill="#FFD79E" font-size="10" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">크고 듬직</text>
    ${pts
      .map(
        ([n, x, y, c]) =>
          `<circle cx="${x}" cy="${y}" r="5.5" fill="${c}"/><text x="${x}" y="${y - 9}" fill="#DCE8FF" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">${n}</text>`,
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
    <!-- 남쪽 하늘: 별은 동(왼쪽)→서(오른쪽)로 흐른다 — 화살촉은 오른쪽 -->
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
  const cx = 140;
  const cy = 84;
  const R = 66;
  let ring = "";
  for (const [n, deg] of names) {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R * 0.82;
    // 정답 유추 방지 — 모든 별자리를 같은 스타일로(강조 금지)
    ring += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#9FB6DC"/>
      <text x="${x.toFixed(1)}" y="${(y - 7).toFixed(1)}" fill="#9FB6DC" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">${n}</text>`;
  }
  return panel(
    280,
    168,
    `
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.82}" stroke="#3D5378" stroke-width="1.3" stroke-dasharray="3 4"/>
    ${ring}
    <circle cx="${cx}" cy="${cy}" r="9" fill="url(#spf-sunc)"/>
    <text x="${cx + 18}" y="${cy + 4}" fill="#FFC85E" font-size="9" font-family="Pretendard, sans-serif">태양</text>
    <circle cx="${cx}" cy="${cy - 25}" r="5.5" fill="url(#spf-ea)"/>
    <text x="${cx + 12}" y="${cy - 29}" fill="#BFD8FF" font-size="10" font-weight="700" font-family="Pretendard, sans-serif">㉠지구</text>
    <path d="M${cx} ${cy - 17}L${cx} ${cy + R * 0.82 - 10}" stroke="rgba(255,170,80,.5)" stroke-width="1.3" stroke-dasharray="4 4"/>
    <path d="M${cx} ${cy - 33}L${cx} ${cy - R * 0.82 + 6}" stroke="rgba(140,190,255,.55)" stroke-width="1.3" stroke-dasharray="4 4"/>
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

/** 달 공전 8위치(마무리 9 — 태양 빛 오른쪽).
 *  라벨 배치는 자체 구도: (라)=오른쪽(삭)·(가)=위(상현)·(나)=왼쪽(망)·(다)=아래(하현).
 *  발문의 좌우 반전 함정((다) 하현을 "오른쪽이 밝다"로)과 짝. */
export function moonOrbitFig(): string {
  const cx = 140;
  const cy = 86;
  const R = 56;
  let moons = "";
  const labels: Record<number, string> = { 0: "(라)", 2: "(가)", 4: "(나)", 6: "(다)" };
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = cx + Math.cos(a) * R;
    const y = cy - Math.sin(a) * R * 0.86;
    // 밝은 반구는 항상 태양(오른쪽) 쪽
    moons += `<g>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#2E3A52"/>
      <path d="M${x.toFixed(1)} ${(y - 8).toFixed(1)}a8 8 0 0 1 0 16z" fill="#EDE2BE"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" stroke="#5A6C8E" stroke-width="1"/>
    </g>`;
    const lab = labels[i];
    if (lab) {
      const lx = cx + Math.cos(a) * (R + 24);
      const ly = cy - Math.sin(a) * (R * 0.86 + 22);
      moons += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" fill="#DCE8FF" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">${lab}</text>`;
    }
  }
  return panel(
    280,
    176,
    `
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.86}" stroke="#3D5378" stroke-width="1.4" stroke-dasharray="4 5"/>
    ${moons}
    <circle cx="${cx}" cy="${cy}" r="11" fill="url(#spf-ea2)"/>
    <path d="M${cx - 4} ${cy - 2}q3-3 6-1t5 0" stroke="#7CA65A" stroke-width="1.6"/>
    <text x="${cx}" y="${cy + 26}" fill="#BFD8FF" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">지구</text>
    <g stroke="#FFC24E" stroke-width="3">
      <path d="M268 62l-14 0M268 86l-14 0M268 110l-14 0"/>
    </g>
    <path d="M254 62l6-3.4v6.8zM254 86l6-3.4v6.8zM254 110l6-3.4v6.8z" fill="#FFC24E"/>
    <text x="258" y="132" fill="#FFD79E" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">태양 빛</text>
  `,
    `<radialGradient id="spf-ea2" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/>
    </radialGradient>`,
  );
}

/** 위상 5모양(①~⑤) — 상현 찾기 퀴즈. */
export function fivePhasesFig(): string {
  const moon = (x: number, kind: string): string => {
    const base = `<circle cx="${x}" cy="60" r="20" fill="#222E46" stroke="#5A6C8E" stroke-width="1.2"/>`;
    const lit = "#EDE2BE";
    if (kind === "new") return base;
    if (kind === "crescent")
      return `${base}<path d="M${x} 40a20 20 0 0 1 0 40 15 15 0 0 0 0-40z" fill="${lit}"/>`;
    if (kind === "first") return `${base}<path d="M${x} 40a20 20 0 0 1 0 40z" fill="${lit}"/>`;
    if (kind === "full") return `<circle cx="${x}" cy="60" r="20" fill="${lit}" stroke="#B8AB84" stroke-width="1.2"/>`;
    return `${base}<path d="M${x} 40a20 20 0 0 0 0 40z" fill="${lit}"/>`; // last: 왼쪽 밝음
  };
  const kinds = ["new", "crescent", "first", "full", "last"];
  const nums = ["①", "②", "③", "④", "⑤"];
  return panel(
    280,
    116,
    kinds
      .map((k, i) => {
        const x = 36 + i * 52;
        return `${moon(x, k)}<text x="${x}" y="102" fill="#BFD4F2" font-size="12" text-anchor="middle" font-family="Pretendard, sans-serif">${nums[i]}</text>`;
      })
      .join(""),
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
    <!-- 작은 공(달 역, 중심 y=62) — 그림자 속이라 통째로 어둡다 -->
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
  // 경로 위 점: P(t) = (196 + 0.909t, 74 + 0.417t)
  const P = (t: number): [number, number] => [196 + 0.909 * t, 74 + 0.417 * t];
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
    <!-- 지구 그림자(본그림자 쐐기 — 꼭짓점은 화면 밖) -->
    <path d="M112 57L278 66.2V81.8L112 91z" fill="rgba(10,16,32,.55)"/>
    <path d="M112 57L278 66.2M112 91L278 81.8" stroke="#3D5378" stroke-width="1.1" stroke-dasharray="3 4"/>
    <!-- 지구 -->
    <circle cx="112" cy="74" r="17" fill="url(#spf-earl)"/>
    <path d="M112 57a17 17 0 0 1 0 34z" fill="rgba(8,12,26,.5)"/>
    <text x="112" y="106" fill="#BFD4F2" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">지구</text>
    <!-- 달의 이동 경로(직선) + 진행 화살표 -->
    <path d="M${p0x.toFixed(1)} ${p0y.toFixed(1)}L${p1x.toFixed(1)} ${p1y.toFixed(1)}" stroke="#3D5378" stroke-width="1.3" stroke-dasharray="4 4"/>
    <path d="M${(p1x + 6.4).toFixed(1)} ${(p1y + 2.9).toFixed(1)}L${(p1x - 1.6).toFixed(1)} ${(p1y + 3.5).toFixed(1)}L${(p1x + 1.6).toFixed(1)} ${(p1y - 3.5).toFixed(1)}z" fill="#5A78A8"/>
    <!-- (나) 본그림자 깊숙이 — 붉은 달 -->
    <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="7" fill="#E8DCB8"/>
    <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="7" fill="rgba(120,30,16,.78)"/>
    <text x="${(nx - 4).toFixed(1)}" y="${(ny + 25).toFixed(1)}" fill="#FFD0B4" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(나)</text>
    <!-- (가) 아래 경계 걸치기 — 위 절반(그림자 안)만 붉게 -->
    <circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="7" fill="#E8DCB8"/>
    <path d="M${(gx - 7).toFixed(1)} ${gy.toFixed(1)}a7 7 0 0 1 14 0z" fill="rgba(120,30,16,.78)" transform="rotate(-3.2 ${gx.toFixed(1)} ${gy.toFixed(1)})"/>
    <text x="${gx.toFixed(1)}" y="${(gy + 22).toFixed(1)}" fill="#FFD0B4" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(가)</text>
  `,
    `<radialGradient id="spf-sunl" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#FFEDBE"/><stop offset="1" stop-color="#FFA82E"/>
    </radialGradient>
    <radialGradient id="spf-earl" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#7FB2F0"/><stop offset="1" stop-color="#1D4FA8"/>
    </radialGradient>`,
  );
}

/** 태양 구조 핫스팟 그림 — 실제 관측 사진 2패널.
 *  왼쪽: 평소의 태양(백색광, 광구·흑점 — NOIRLab 1989 극대기).
 *  오른쪽: 개기일식(NASA 2017 — 코로나·홍염·붉은 가장자리).
 *  unit7.ts 핫스팟 spot 좌표(%)와 반드시 함께 맞출 것. */
export function sunAnatomyFig(): string {
  return `<svg viewBox="0 0 280 190" ${NS} fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="spf-ansky" x1="0" y1="0" x2="0" y2="190" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0A1226"/><stop offset="1" stop-color="#141F3A"/>
      </linearGradient>
      <clipPath id="spf-anL"><circle cx="72" cy="92" r="52"/></clipPath>
      <clipPath id="spf-anR"><circle cx="208" cy="92" r="56"/></clipPath>
      <radialGradient id="spf-anGlow" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFC85E" stop-opacity=".4"/><stop offset="1" stop-color="#FFC85E" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="276" height="186" rx="14" fill="url(#spf-ansky)"/>
    ${star(20, 22)}${star(140, 16, 1, 0.6)}${star(262, 26)}${star(266, 166, 1, 0.55)}${star(16, 164, 1, 0.55)}
    <!-- 왼쪽: 평소의 태양(백색광 사진 — 광구와 흑점) -->
    <circle cx="72" cy="92" r="60" fill="url(#spf-anGlow)"/>
    <g clip-path="url(#spf-anL)">
      <image href="${photo("sun_whitelight.jpg")}" x="5.7" y="27.9" width="131.3" height="127.5" preserveAspectRatio="none"/>
    </g>
    <circle cx="72" cy="92" r="52" stroke="rgba(224,132,20,.7)" stroke-width="1.4"/>
    <!-- 오른쪽: 개기일식 사진(코로나·홍염) -->
    <g clip-path="url(#spf-anR)">
      <image href="${photo("eclipse_corona.jpg")}" x="90.1" y="18.6" width="233" height="155.5" preserveAspectRatio="none"/>
    </g>
    <circle cx="208" cy="92" r="56" stroke="rgba(170,192,232,.4)" stroke-width="1.2"/>
    <!-- 패널 라벨 -->
    <rect x="47" y="150" width="50" height="18" rx="9" fill="rgba(14,24,46,.78)" stroke="rgba(255,190,90,.4)" stroke-width="1"/>
    <text x="72" y="163" fill="#FFD79E" font-size="10" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">평소</text>
    <rect x="172" y="150" width="72" height="18" rx="9" fill="rgba(14,24,46,.78)" stroke="rgba(170,192,232,.4)" stroke-width="1"/>
    <text x="208" y="163" fill="#C8D8F8" font-size="10" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">개기일식 때</text>
    <text x="140" y="182" fill="#8FA6CE" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">실제 관측 사진이에요 — 평소엔 광구가 눈부셔서 대기는 개기일식 때 드러나요</text>
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
    case "family": // 태양 + 행성 줄
      return wrap(
        `<circle cx="18" cy="48" r="16" fill="url(#sma-sun)"/>
        <circle cx="46" cy="48" r="3.4" fill="#9C9894"/>
        <circle cx="57" cy="48" r="4.6" fill="#E2B96B"/>
        <circle cx="69" cy="48" r="4.8" fill="url(#sma-ea)"/>
        <circle cx="82" cy="48" r="4" fill="#C05B3C"/>`,
        sunG + earthG,
      );
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
    case "clockmap": // 위상 지도(궤도 위 4위상)
      return wrap(
        `<ellipse cx="48" cy="48" rx="32" ry="26" stroke="#3D5378" stroke-width="1.2" stroke-dasharray="3 4"/>
        <circle cx="48" cy="48" r="7" fill="url(#sma-ea)"/>
        <circle cx="80" cy="48" r="6" fill="#222E46" stroke="#5A6C8E" stroke-width="1"/>
        <circle cx="16" cy="48" r="6" fill="url(#sma-mo)"/>
        <g><circle cx="48" cy="22" r="6" fill="#222E46"/><path d="M48 16a6 6 0 0 1 0 12z" fill="url(#sma-mo)"/></g>
        <g><circle cx="48" cy="74" r="6" fill="#222E46"/><path d="M48 68a6 6 0 0 0 0 12z" fill="url(#sma-mo)"/></g>
        <path d="M94 40l-6 8 6 8" stroke="#FFC24E" stroke-width="2" fill="none"/>`,
        earthG + moonG,
      );
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
