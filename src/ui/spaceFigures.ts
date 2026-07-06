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

/** 흑점 확대 — 실제 관측 사진(Hinode G-band, 흑점+쌀알 무늬). (마무리 4) */
export function sunspotFig(): string {
  return `<svg viewBox="0 0 280 180" ${NS} fill="none" aria-hidden="true">
    <defs>
      <clipPath id="spf-spclip"><rect x="2" y="2" width="276" height="176" rx="14"/></clipPath>
    </defs>
    <g clip-path="url(#spf-spclip)">
      <image href="${photo("sunspot_hinode.jpg")}" x="2" y="-34" width="276" height="260" preserveAspectRatio="xMidYMid slice"/>
    </g>
    <rect x="2" y="2" width="276" height="176" rx="14" stroke="rgba(94,44,8,.55)" stroke-width="1.6"/>
    <path d="M204 148l-38 -24" stroke="#FFF2D8" stroke-width="2"/>
    <circle cx="163" cy="122" r="3" fill="#FFF2D8"/>
    <rect x="204" y="136" width="34" height="22" rx="8" fill="rgba(20,12,4,.72)"/>
    <text x="221" y="151" fill="#FFE9C0" font-size="12" font-weight="800" text-anchor="middle" font-family="Pretendard, sans-serif">(가)</text>
  </svg>`;
}

/** 흑점 수 그래프(마무리 13, ESA 2022 — 약 11년 주기). */
export function sunspotGraphFig(): string {
  return panel(
    280,
    160,
    `
    <path d="M34 128h224M34 128V18" stroke="#4A5F86" stroke-width="1.6"/>
    <text x="16" y="24" fill="#8FA6CE" font-size="9" font-family="Pretendard, sans-serif">흑점 수(개)</text>
    <text x="250" y="146" fill="#8FA6CE" font-size="9" font-family="Pretendard, sans-serif">연도</text>
    ${[["2000", 44], ["2005", 90], ["2010", 136], ["2015", 182], ["2020", 228]]
      .map(([t, x]) => `<text x="${x}" y="142" fill="#8FA6CE" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">${t}</text><path d="M${x} 128v3" stroke="#4A5F86" stroke-width="1.2"/>`)
      .join("")}
    <path d="M40 40 C 60 44, 76 78, 96 112 C 108 128, 116 126, 128 112 C 148 88, 158 72, 172 70 C 186 72, 200 96, 214 118 C 224 130, 232 128, 244 112"
      stroke="#FFB03A" stroke-width="2.6" fill="none"/>
    <circle cx="108" cy="122" r="3" fill="#FFB03A"/>
    <text x="108" y="110" fill="#FFE0A8" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(가)</text>
    <circle cx="172" cy="70" r="3" fill="#FFB03A"/>
    <text x="172" y="58" fill="#FFE0A8" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(나)</text>
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

/** 행성 질량·반지름 두 무리(NASA 2023 그래프의 재구성). */
export function planetGroupsFig(): string {
  const pts: [string, number, number, string][] = [
    ["수", 52, 116, "#9C9894"], ["금", 66, 104, "#E2B96B"], ["지", 74, 100, "#5AA2F8"], ["화", 60, 110, "#C05B3C"],
    ["목", 232, 30, "#D3AC7C"], ["토", 214, 44, "#E8D9A8"], ["천", 176, 66, "#8FD8DD"], ["해", 172, 60, "#6E8CE8"],
  ];
  return panel(
    280,
    150,
    `
    <path d="M34 122h224M34 122V16" stroke="#4A5F86" stroke-width="1.6"/>
    <text x="14" y="24" fill="#8FA6CE" font-size="9" font-family="Pretendard, sans-serif">질량(지구=1)</text>
    <text x="216" y="140" fill="#8FA6CE" font-size="9" font-family="Pretendard, sans-serif">반지름(지구=1)</text>
    <ellipse cx="64" cy="108" rx="34" ry="22" stroke="#5AA2F8" stroke-width="1.8" stroke-dasharray="5 4"/>
    <text x="64" y="142" fill="#9CC2F2" font-size="10" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">작고 오밀조밀</text>
    <ellipse cx="202" cy="48" rx="52" ry="34" stroke="#FFB03A" stroke-width="1.8" stroke-dasharray="5 4"/>
    <text x="202" y="104" fill="#FFD79E" font-size="10" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">크고 듬직</text>
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

/** 북쪽 하늘 일주(동심원, 마무리 6). */
export function northSkyFig(): string {
  let arcs = "";
  for (let i = 1; i <= 6; i++) {
    const r = i * 15;
    arcs += `<circle cx="140" cy="70" r="${r}" stroke="rgba(190,214,255,${0.42 - i * 0.045})" stroke-width="1.6" stroke-dasharray="${(r * 4.4).toFixed(0)} ${(r * 1.9).toFixed(0)}" transform="rotate(${i * 34} 140 70)"/>`;
  }
  return panel(
    280,
    150,
    `
    ${arcs}
    <circle cx="140" cy="70" r="2.6" fill="#FFF0C8"/>
    <path d="M198 42a62 62 0 0 1-20 74" stroke="#FFD25E" stroke-width="2.2" fill="none"/>
    <path d="M178 116l10-1-5-9z" fill="#FFD25E"/>
    <path d="M6 132q70-26 132-12t136 2v12a14 14 0 0 1-14 14H20a14 14 0 0 1-14-14z" fill="#0A1428"/>
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

/** 황도 12궁 미니(마무리 7 — 지구 ㉠ = 2월 위치). */
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
    <text x="${cx}" y="${cy + 22}" fill="#FFC85E" font-size="9" text-anchor="middle" font-family="Pretendard, sans-serif">태양</text>
    <circle cx="${cx + 30}" cy="${cy}" r="5.5" fill="url(#spf-ea)"/>
    <text x="${cx + 30}" y="${cy - 11}" fill="#BFD8FF" font-size="10" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">㉠지구</text>
    <path d="M${cx + 22} ${cy}L${cx - R + 10} ${cy}" stroke="rgba(255,170,80,.5)" stroke-width="1.3" stroke-dasharray="4 4"/>
    <path d="M${cx + 38} ${cy}L${cx + R - 4} ${cy}" stroke="rgba(140,190,255,.55)" stroke-width="1.3" stroke-dasharray="4 4"/>
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

/** 달 공전 8위치(마무리 9 — 태양 빛 오른쪽). */
export function moonOrbitFig(): string {
  const cx = 140;
  const cy = 86;
  const R = 56;
  let moons = "";
  const labels: Record<number, string> = { 0: "(가)", 2: "(나)", 4: "(다)", 6: "(라)" };
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

/** 손전등—작은 공—큰 공 모형(마무리 10).
 *  광축(y=62) 위에 세 물체가 정확히 일직선. 빛은 작은 공까지만,
 *  작은 공 뒤로는 그림자 원뿔이 큰 공까지 이어져 (가)에 그림자 자국을 만든다. */
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
    <!-- 빛(손전등→작은 공까지만) -->
    <path d="M70 55l49 .8v12.4L70 69z" fill="url(#spf-beam)"/>
    <!-- 작은 공 그림자 원뿔(작은 공 뒤→큰 공) -->
    <path d="M137 55.6L190 48v28l-53-6.6z" fill="rgba(6,10,20,.5)"/>
    <path d="M137 55.6L190 48M137 68.4L190 76" stroke="#3D5378" stroke-width="1" stroke-dasharray="3 3"/>
    <!-- 작은 공(달, 중심 y=62) -->
    <path d="M128 96V71" stroke="#5A6C8E" stroke-width="2.4"/>
    <circle cx="128" cy="62" r="9" fill="url(#spf-ball1)"/>
    <path d="M128 53a9 9 0 0 1 0 18z" fill="rgba(10,16,32,.5)"/>
    <!-- 큰 공(지구, 중심 y=62) + 그림자 자국 -->
    <path d="M207 96V79" stroke="#5A6C8E" stroke-width="2.4"/>
    <circle cx="207" cy="62" r="17" fill="url(#spf-ball2)"/>
    <path d="M207 45a17 17 0 0 1 0 34z" fill="rgba(10,16,32,.38)"/>
    <ellipse cx="191.5" cy="62" rx="4.2" ry="8.6" fill="#0A1020" opacity=".85"/>
    <!-- 라벨 -->
    <text x="40" y="122" fill="#BFD4F2" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">손전등</text>
    <text x="128" y="122" fill="#BFD4F2" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">작은 공</text>
    <text x="207" y="122" fill="#BFD4F2" font-size="10" text-anchor="middle" font-family="Pretendard, sans-serif">(가) 큰 공</text>
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

/** 지구 그림자 속 달(마무리 12 — (가) 깊숙이 / (나) 걸치기).
 *  기하 규칙: 그림자 꼭짓점 (420,74) 기준 본그림자 경계선 y = 74 ± (17 − 17(x−112)/308).
 *  달의 이동 경로는 (196,74)를 지나는 −28° 직선 — (가)는 경로 위·본그림자 안,
 *  (나)는 경로 위·본그림자 위쪽 경계에 정확히 걸친다(절반만 가려짐). */
export function lunarPathFig(): string {
  // 경로 위 점: P(t) = (196 + 0.883t, 74 − 0.469t)
  const P = (t: number): [number, number] => [196 + 0.883 * t, 74 - 0.469 * t];
  const [gx, gy] = P(0); // (가) — 본그림자 깊숙이
  const [nx, ny] = P(23.9); // (나) — 본그림자 위 경계 위(절반 노출)
  const [p0x, p0y] = P(-34);
  const [p1x, p1y] = P(58);
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
    <path d="M${p1x.toFixed(1)} ${p1y.toFixed(1)}l-8.2 1.4 5.2 6.4z" fill="#5A78A8"/>
    <!-- (가) 본그림자 깊숙이 — 붉은 달 -->
    <circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="7" fill="#E8DCB8"/>
    <circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="7" fill="rgba(120,30,16,.78)"/>
    <text x="${gx.toFixed(1)}" y="${(gy + 22).toFixed(1)}" fill="#FFD0B4" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(가)</text>
    <!-- (나) 경계 걸치기 — 아래 절반(그림자 안)만 붉게 -->
    <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="7" fill="#E8DCB8"/>
    <path d="M${(nx - 7).toFixed(1)} ${(ny + 0.4).toFixed(1)}a7 7 0 0 0 14 0.8z" fill="rgba(120,30,16,.78)" transform="rotate(5.5 ${nx.toFixed(1)} ${ny.toFixed(1)})"/>
    <text x="${nx.toFixed(1)}" y="${(ny - 13).toFixed(1)}" fill="#FFD0B4" font-size="11" font-weight="700" text-anchor="middle" font-family="Pretendard, sans-serif">(나)</text>
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
