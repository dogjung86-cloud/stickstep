// starFigures — 중2 VIII 별과 우주 그림(등급 figTabs 3종 + 퀴즈 SVG + starMiniArt).
// 파운드리 문법: 근-동조 그라데이션 면 + 키라이트 + 접촉 그림자 + 재질별 최암색 외곽선.
// 천체 실사가 있는 주제(은하·성단·성운)는 public/photos/star/ 사진을 쓰고,
// 여기는 "개념 기하"가 본질인 도해(등급 사슬·시차 비교·은하 옆모습 라벨판)만 SVG로 그린다.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/** 발광 별 한 개(도해용) — r 크기, 색 지정 */
function star(x: number, y: number, r: number, fill: string, glow = true): string {
  const g = glow ? `<circle cx="${x}" cy="${y}" r="${r * 2.1}" fill="${fill}" opacity=".14"/>` : "";
  const spikes: string[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    spikes.push(
      `<line x1="${x + Math.cos(a) * r * 1.15}" y1="${y + Math.sin(a) * r * 1.15}" x2="${x + Math.cos(a) * r * 1.9}" y2="${y + Math.sin(a) * r * 1.9}" stroke="${fill}" stroke-width="${Math.max(1.1, r * 0.16)}" opacity=".75"/>`,
    );
  }
  return `${g}<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>${spikes.join("")}`;
}

// ── figTabs ①: 등급의 계단 — 1등급 작아질 때마다 약 2.5배 밝게 ──
export function magChainFig(): string {
  const stars: string[] = [];
  const labels: string[] = [];
  for (let m = 6; m >= 1; m--) {
    const i = 6 - m; // 0..5
    const x = 42 + i * 52;
    const r = 3.2 + i * 2.35;
    const y = 118 - i * 7;
    stars.push(star(x, y, r, i >= 4 ? "#FFE9A8" : "#E8EEF9"));
    labels.push(`<text x="${x}" y="168" fill="#8A97AC" font-size="12" font-weight="700" text-anchor="middle">${m}등급</text>`);
    if (i < 5)
      labels.push(
        `<text x="${x + 26}" y="${y - 26 - i * 3}" fill="#5B6BE8" font-size="10.5" font-weight="800" text-anchor="middle">×2.5</text>`,
      );
  }
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="등급의 계단. 6등급에서 1등급으로 갈수록 별이 커지고, 한 계단마다 약 2.5배 밝아져요">
  <rect x="8" y="8" width="328" height="150" rx="14" fill="#101A2E"/>
  ${stars.join("")}
  <path d="M42 138 L302 100" stroke="#3A4A68" stroke-width="1.4" stroke-dasharray="4 5"/>
  ${labels.join("")}
  <text x="172" y="186" fill="#556070" font-size="11.5" font-weight="700" text-anchor="middle">숫자가 작을수록 밝은 별 — 5계단(6→1등급)이면 약 100배!</text>
</svg>`;
}

// ── figTabs ②: 등급의 확장 — 더 밝으면 0, 음수까지 ──
export function magMinusFig(): string {
  const rows = [
    { name: "보름달", m: "−12.7", x: 62, r: 15, c: "#FFF0C8" },
    { name: "금성", m: "−4.9", x: 148, r: 9, c: "#FFE9A8" },
    { name: "시리우스", m: "−1.5", x: 222, r: 6.4, c: "#E8F2FF" },
    { name: "북극성", m: "2.1", x: 290, r: 4, c: "#E8EEF9" },
  ];
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="1등급보다 밝은 천체는 0등급, 음수 등급으로 나타내요. 보름달 약 마이너스 12.7, 금성 마이너스 4.9, 시리우스 마이너스 1.5, 북극성 2.1등급">
  <rect x="8" y="8" width="328" height="150" rx="14" fill="#101A2E"/>
  ${rows.map((r) => star(r.x, 74, r.r, r.c)).join("")}
  ${rows
    .map(
      (r) =>
        `<text x="${r.x}" y="124" fill="#C8D4E8" font-size="11.5" font-weight="700" text-anchor="middle">${r.name}</text>
         <text x="${r.x}" y="141" fill="#8FA0FF" font-size="12" font-weight="800" text-anchor="middle">${r.m}등급</text>`,
    )
    .join("")}
  <path d="M40 30 L304 30" stroke="#3A4A68" stroke-width="1.4"/>
  <path d="M300 26 L306 30 L300 34" stroke="#3A4A68" stroke-width="1.4"/>
  <text x="44" y="22" fill="#8A97AC" font-size="10.5" font-weight="700">밝다</text>
  <text x="300" y="22" fill="#8A97AC" font-size="10.5" font-weight="700" text-anchor="end">어둡다</text>
  <text x="172" y="186" fill="#556070" font-size="11.5" font-weight="700" text-anchor="middle">1등급보다 밝으면 0등급, 그보다 밝으면 음수(−) 등급이에요</text>
</svg>`;
}

// ── figTabs ③: 겉보기 vs 절대 등급 — 같은 출발선(10 pc)에 세우기 ──
export function absMagFig(): string {
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="왼쪽은 실제 하늘, 가까운 촛불별이 먼 왕별보다 밝아 보여요. 오른쪽은 두 별을 같은 거리 선에 세운 모습, 왕별이 훨씬 밝아요">
  <rect x="8" y="8" width="160" height="150" rx="14" fill="#101A2E"/>
  <rect x="176" y="8" width="160" height="150" rx="14" fill="#101A2E"/>
  <text x="88" y="28" fill="#C8D4E8" font-size="11.5" font-weight="800" text-anchor="middle">눈에 보이는 대로</text>
  <text x="256" y="28" fill="#C8D4E8" font-size="11.5" font-weight="800" text-anchor="middle">같은 거리에 세우면</text>
  ${star(52, 78, 9, "#FFE9A8")}
  <text x="52" y="112" fill="#8A97AC" font-size="10.5" font-weight="700" text-anchor="middle">가까운 꼬마별</text>
  ${star(128, 60, 4.4, "#E8EEF9")}
  <text x="128" y="86" fill="#8A97AC" font-size="10.5" font-weight="700" text-anchor="middle">먼 왕별</text>
  <text x="88" y="142" fill="#F0A0B4" font-size="11" font-weight="800" text-anchor="middle">꼬마별이 더 밝아 보여요!</text>
  <line x1="256" y1="40" x2="256" y2="118" stroke="#5B6BE8" stroke-width="1.6" stroke-dasharray="5 5"/>
  ${star(226, 80, 4.2, "#FFE9A8")}
  <text x="226" y="112" fill="#8A97AC" font-size="10.5" font-weight="700" text-anchor="middle">꼬마별</text>
  ${star(292, 72, 11, "#E8F2FF")}
  <text x="292" y="112" fill="#8A97AC" font-size="10.5" font-weight="700" text-anchor="middle">왕별</text>
  <text x="256" y="142" fill="#8AE0C8" font-size="11" font-weight="800" text-anchor="middle">진짜 밝기는 왕별의 승리!</text>
  <text x="172" y="186" fill="#556070" font-size="11.5" font-weight="700" text-anchor="middle">절대 등급 = 모든 별을 같은 거리(10 pc)에 두고 매긴 등급</text>
</svg>`;
}

// ── 퀴즈: 두 별의 연주 시차 비교 ──
export function parallaxCompareFig(): string {
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="별 가와 나의 연주 시차 비교 그림. 가의 시차각이 나보다 커요">
  <rect x="8" y="8" width="328" height="192" rx="14" fill="#101A2E"/>
  <ellipse cx="172" cy="172" rx="86" ry="14" fill="none" stroke="#3A4A68" stroke-width="1.3" stroke-dasharray="3 5"/>
  <circle cx="172" cy="172" r="8" fill="#FFC24D"/>
  <circle cx="86" cy="172" r="6" fill="#3E8EE0"/>
  <circle cx="258" cy="172" r="6" fill="#3E8EE0"/>
  ${star(172, 92, 7, "#FFE9A8")}
  <text x="192" y="96" fill="#C8D4E8" font-size="12" font-weight="800">㉮</text>
  ${star(172, 34, 5.4, "#E8EEF9")}
  <text x="190" y="38" fill="#C8D4E8" font-size="12" font-weight="800">㉯</text>
  <line x1="86" y1="172" x2="172" y2="92" stroke="#FFC45A" stroke-width="1.6"/>
  <line x1="258" y1="172" x2="172" y2="92" stroke="#FFC45A" stroke-width="1.6"/>
  <line x1="86" y1="172" x2="172" y2="34" stroke="#7ED6FF" stroke-width="1.4" stroke-dasharray="5 4"/>
  <line x1="258" y1="172" x2="172" y2="34" stroke="#7ED6FF" stroke-width="1.4" stroke-dasharray="5 4"/>
  <path d="M 156 110 A 22 22 0 0 1 188 110" stroke="#FFE9A8" stroke-width="2.2" fill="none"/>
  <path d="M 162 51 A 15 15 0 0 1 182 51" stroke="#BFD8FF" stroke-width="2" fill="none"/>
</svg>`;
}

// ── 퀴즈: 별 셋의 색과 표면 온도 ──
export function colorTempFig(): string {
  const rows = [
    { x: 70, c: "#9CC4FF", name: "청백색" },
    { x: 172, c: "#FFF2D0", name: "황백색" },
    { x: 274, c: "#FF9A66", name: "적색" },
  ];
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="색이 다른 세 별. 가는 청백색, 나는 황백색, 다는 적색이에요">
  <rect x="8" y="8" width="328" height="152" rx="14" fill="#101A2E"/>
  ${rows.map((r) => star(r.x, 72, 13, r.c)).join("")}
  ${rows
    .map(
      (r, i) =>
        `<text x="${r.x}" y="118" fill="#C8D4E8" font-size="12.5" font-weight="800" text-anchor="middle">${["㉮", "㉯", "㉰"][i]}</text>
         <text x="${r.x}" y="138" fill="#8A97AC" font-size="11" font-weight="700" text-anchor="middle">${r.name}</text>`,
    )
    .join("")}
</svg>`;
}

// ── 개념·퀴즈: 옆에서 본 우리은하(라벨판) ──
export function galaxySideFig(labels = true): string {
  const lb = labels
    ? `<text x="172" y="52" fill="#C8D4E8" font-size="11.5" font-weight="800" text-anchor="middle">중심부(불룩)</text>
       <text x="60" y="118" fill="#C8D4E8" font-size="11.5" font-weight="800" text-anchor="middle">원반(나선팔)</text>
       <line x1="60" y1="106" x2="96" y2="96" stroke="#5B6BE8" stroke-width="1.3"/>
       <text x="284" y="42" fill="#C8D4E8" font-size="11.5" font-weight="800" text-anchor="middle">구상 성단(헤일로)</text>
       <line x1="278" y1="48" x2="258" y2="60" stroke="#5B6BE8" stroke-width="1.3"/>
       <text x="236" y="128" fill="#FFE9A8" font-size="11.5" font-weight="800">태양계</text>
       <line x1="232" y1="118" x2="224" y2="99" stroke="#FFC45A" stroke-width="1.3"/>`
    : "";
  // 헤일로의 구상 성단 점들
  const halo: string[] = [];
  const pts = [
    [96, 44], [140, 30], [210, 28], [258, 60], [286, 88], [70, 66], [46, 96], [300, 118], [120, 140], [250, 140],
  ];
  for (const [hx, hy] of pts) halo.push(`<circle cx="${hx}" cy="${hy}" r="3" fill="#C8B8FF" opacity=".8"/><circle cx="${hx}" cy="${hy}" r="1.4" fill="#F0EAFF"/>`);
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="옆에서 본 우리은하. 가운데가 불룩한 납작한 원반 모양이고, 주위 헤일로에 구상 성단이 흩어져 있어요. 태양계는 중심에서 떨어진 원반 위에 있어요">
  <rect x="8" y="8" width="328" height="152" rx="14" fill="#0C1526"/>
  ${halo.join("")}
  <ellipse cx="172" cy="92" rx="118" ry="13" fill="#2A3C66"/>
  <ellipse cx="172" cy="92" rx="118" ry="13" fill="none" stroke="#44598C" stroke-width="1.4"/>
  <ellipse cx="172" cy="91" rx="106" ry="9" fill="#3A4E80" opacity=".8"/>
  <ellipse cx="172" cy="90" rx="34" ry="20" fill="#FFE0B0"/>
  <ellipse cx="172" cy="90" rx="20" ry="12" fill="#FFF2D8"/>
  <circle cx="224" cy="94" r="4.4" fill="#FFC45A"/>
  <circle cx="224" cy="94" r="2" fill="#FFF4DC"/>
  ${lb}
</svg>`;
}

// ── recap 미니아트 ──
const MINI: Record<string, string> = {
  sicha: `<circle cx="32" cy="14" r="5" fill="#FFE9A8"/><circle cx="14" cy="50" r="5" fill="#3E8EE0"/><circle cx="50" cy="50" r="5" fill="#3E8EE0"/>
    <line x1="14" y1="50" x2="32" y2="14" stroke="#FFC45A" stroke-width="2"/><line x1="50" y1="50" x2="32" y2="14" stroke="#7ED6FF" stroke-width="2"/>
    <path d="M 25 26 A 10 10 0 0 1 39 26" stroke="#9CA8FF" stroke-width="2.4" fill="none"/>`,
  light: `<circle cx="12" cy="32" r="6" fill="#FFE9A8"/><path d="M18 26 L54 12 M18 32 L56 32 M18 38 L54 52" stroke="#FFC45A" stroke-width="2"/>
    <rect x="44" y="16" width="4" height="32" rx="2" fill="#5B6BE8"/>`,
  mag: `<circle cx="14" cy="44" r="9" fill="#FFE9A8"/><circle cx="34" cy="38" r="6" fill="#E8EEF9"/><circle cx="50" cy="32" r="3.4" fill="#C8D4E8"/>
    <path d="M12 16 L52 16" stroke="#5B6BE8" stroke-width="2" stroke-dasharray="3 3"/>`,
  color: `<circle cx="14" cy="32" r="7" fill="#FF9A66"/><circle cx="32" cy="32" r="7" fill="#FFF2D0"/><circle cx="50" cy="32" r="7" fill="#9CC4FF"/>
    <path d="M10 48 L54 48" stroke="#8A97AC" stroke-width="2"/><path d="M48 44 L54 48 L48 52" stroke="#8A97AC" stroke-width="2" fill="none"/>`,
  galaxy: `<ellipse cx="32" cy="32" rx="22" ry="8" fill="#3A4E80"/><ellipse cx="32" cy="31" rx="9" ry="5" fill="#FFE0B0"/>
    <circle cx="44" cy="33" r="2.4" fill="#FFC45A"/><circle cx="14" cy="14" r="2" fill="#C8B8FF"/><circle cx="52" cy="16" r="2" fill="#C8B8FF"/><circle cx="10" cy="46" r="2" fill="#C8B8FF"/>`,
  cluster: `<circle cx="20" cy="20" r="2.4" fill="#9CC4FF"/><circle cx="12" cy="30" r="2" fill="#9CC4FF"/><circle cx="26" cy="32" r="2.2" fill="#9CC4FF"/><circle cx="18" cy="42" r="1.8" fill="#9CC4FF"/>
    <circle cx="46" cy="32" r="11" fill="#FFE9C8" opacity=".28"/><circle cx="46" cy="32" r="7" fill="#FFE9C8" opacity=".4"/>
    <circle cx="44" cy="30" r="1.6" fill="#FFF2D8"/><circle cx="48" cy="34" r="1.6" fill="#FFF2D8"/><circle cx="46" cy="28" r="1.4" fill="#FFF2D8"/><circle cx="42" cy="34" r="1.4" fill="#FFF2D8"/><circle cx="50" cy="30" r="1.4" fill="#FFF2D8"/>`,
  nebula: `<path d="M18 40 C 8 36 10 22 22 22 C 24 12 40 12 44 20 C 56 20 58 34 48 38 C 50 46 36 50 30 44 C 26 48 18 46 18 40 Z" fill="#F2A0C8" opacity=".55"/>
    <circle cx="30" cy="30" r="2" fill="#FFF"/><circle cx="40" cy="28" r="1.6" fill="#FFF"/>`,
  balloon: `<circle cx="32" cy="28" r="17" fill="none" stroke="#5B6BE8" stroke-width="2.4"/>
    <circle cx="24" cy="20" r="2.4" fill="#FFC45A"/><circle cx="42" cy="24" r="2.4" fill="#FFC45A"/><circle cx="30" cy="40" r="2.4" fill="#FFC45A"/>
    <path d="M28 47 L36 47 L32 53 Z" fill="#5B6BE8"/>`,
  rocket: `<path d="M32 8 C 40 16 42 30 38 42 L26 42 C 22 30 24 16 32 8 Z" fill="#E8EEF9"/><circle cx="32" cy="24" r="4.4" fill="#7ED6FF"/>
    <path d="M26 42 L20 52 L27 48 Z M38 42 L44 52 L37 48 Z" fill="#F0A0B4"/><path d="M29 44 L35 44 L32 56 Z" fill="#FFC45A"/>`,
};
export function starMiniArt(key: string): string {
  return `<svg viewBox="0 0 64 64" ${NS} fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MINI[key] ?? ""}</svg>`;
}
