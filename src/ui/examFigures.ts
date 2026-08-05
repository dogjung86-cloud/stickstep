// 단원 종합 평가 그림 — 손코딩 교육용 SVG (u3 열 파일럿).
// heatFigures 문법 계승: 색은 답의 단서가 되지 않게(비교 곡선은 같은 색, 라벨만 구분),
// 그래프·표는 파라미터형으로 만들어 문항마다 수치를 달리 쓴다. 새 단원 시험 그림은 섹션을 나눠 추가.

const NS = `xmlns="http://www.w3.org/2000/svg"`;

/* ══════════════ u2 생물의 구성과 다양성 ══════════════ */

/** 이름을 숨긴 세포 세 종류의 모양 비교 — 기능 판별용. */
export function bioCellRolesExamFig(): string {
  return `<svg viewBox="0 0 344 174" ${NS} fill="none" role="img" aria-label="㉠부터 ㉢까지 서로 다른 모양의 세포 세 종류를 비교한 그림">
    <defs>
      <linearGradient id="bcr-bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#F7FBF9"/><stop offset="1" stop-color="#EAF5EF"/></linearGradient>
      <radialGradient id="bcr-pink" cx="35%" cy="30%" r="75%"><stop stop-color="#FFA7B9"/><stop offset="1" stop-color="#D94C6A"/></radialGradient>
    </defs>
    <rect x="2" y="2" width="340" height="170" rx="18" fill="url(#bcr-bg)"/>
    <g transform="translate(16 22)">
      <text x="48" y="12" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">㉠</text>
      <path d="M48 64C24 52 19 35 6 31M48 64C25 71 18 89 5 97M48 64C65 43 80 30 95 18M48 64C70 68 86 77 101 91" stroke="#D2774C" stroke-width="3" stroke-linecap="round"/>
      <circle cx="48" cy="64" r="19" fill="#F4A375" stroke="#B65D3A" stroke-width="2"/>
      <circle cx="48" cy="64" r="7" fill="#7967D8"/>
      <path d="M68 61C82 56 94 57 108 62" stroke="#D2774C" stroke-width="5" stroke-linecap="round"/>
      ${[80, 91, 102].map((x) => `<path d="M${x} 59q5-6 10 0" stroke="#B65D3A" stroke-width="1.4"/>`).join("")}
    </g>
    <g transform="translate(122 23)">
      <text x="50" y="12" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">㉡</text>
      ${[[30,48,-14],[67,43,13],[49,79,-5],[83,76,18],[21,83,9]].map(([x,y,r]) => `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="19" ry="12" fill="url(#bcr-pink)" stroke="#A92B49" stroke-width="1.8"/><ellipse cx="${x}" cy="${y}" rx="8" ry="4" fill="#A92B49" opacity=".5"/></g>`).join("")}
    </g>
    <g transform="translate(232 23)">
      <text x="48" y="12" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">㉢</text>
      ${Array.from({length:12},(_,i)=>{const row=Math.floor(i/4),col=i%4,x=8+col*23+(row%2)*4,y=35+row*29;return `<path d="M${x} ${y}q9-7 18 0l3 16q-9 8-21 1z" fill="#76C69B" stroke="#367C5A" stroke-width="1.4"/><ellipse cx="${x+10}" cy="${y+9}" rx="4" ry="3" fill="#6D61C9"/>`;}).join("")}
    </g>
  </svg>`;
}

/** 받침 유리를 움직이는 방향만 제시하는 그림. 보이는 상의 이동 방향은 숨긴다.
 *  (u2 v2에서는 미사용 · 상의 상하좌우 반전이 재제작 레슨에 도입되지 않았다.) */
export function bioSlideMoveFig(dir: "left" | "right" | "up" | "down"): string {
  const d = { left: [-34, 0], right: [58, 0], up: [0, -28], down: [0, 28] }[dir];
  const [dx, dy] = d;
  const x2 = 172 + dx, y2 = 126 + dy;
  const angle = Math.atan2(dy, dx), ah = 10;
  const p1 = `${x2},${y2}`;
  const p2 = `${x2 - ah * Math.cos(angle - .55)},${y2 - ah * Math.sin(angle - .55)}`;
  const p3 = `${x2 - ah * Math.cos(angle + .55)},${y2 - ah * Math.sin(angle + .55)}`;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="현미경 재물대 위의 받침 유리를 화살표 방향으로 움직이는 그림">
    <rect x="2" y="2" width="340" height="186" rx="18" fill="#F5F8FB"/>
    <rect x="44" y="74" width="256" height="78" rx="12" fill="#465367"/>
    <rect x="92" y="88" width="160" height="48" rx="6" fill="#EAF4F6" stroke="#8DAAB2" stroke-width="2"/>
    <rect x="126" y="95" width="92" height="34" rx="3" fill="#BFE5E0" opacity=".72"/>
    <circle cx="172" cy="112" r="7" fill="#7C6BFF" opacity=".9"/>
    <line x1="172" y1="126" x2="${x2}" y2="${y2}" stroke="#F05A67" stroke-width="4" stroke-linecap="round"/>
    <path d="M${p1}L${p2}L${p3}Z" fill="#F05A67"/>
    <circle cx="172" cy="43" r="27" fill="#DDE7F2" stroke="#65758A" stroke-width="6"/>
    <circle cx="172" cy="43" r="14" fill="#A9D9E8" opacity=".8"/>
  </svg>`;
}

/** 같은 표본을 서로 다른 배율로 본 두 관찰 범위 · 수와 크기 비교용. */
export function bioFieldPairFig(aCount = 18, bCount = 6): string {
  const field = (cx: number, count: number, label: string): string => {
    const cols = Math.ceil(Math.sqrt(count));
    const gap = count > 10 ? 18 : 28;
    const r = count > 10 ? 6 : 10;
    const sx = cx - ((cols - 1) * gap) / 2, rows = Math.ceil(count / cols), sy = 78 - ((rows - 1) * gap) / 2;
    const cells = Array.from({ length: count }, (_, i) => {
      const x = sx + (i % cols) * gap, y = sy + Math.floor(i / cols) * gap;
      return `<rect x="${x-r}" y="${y-r*.72}" width="${r*2}" height="${r*1.44}" rx="${Math.max(2,r*.28)}" fill="#D9B7EE" stroke="#8065A5" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="${Math.max(1.6,r*.22)}" fill="#6D54A4"/>`;
    }).join("");
    return `<circle cx="${cx}" cy="82" r="66" fill="#F7F1FA" stroke="#4D596B" stroke-width="6"/>${cells}<text x="${cx}" y="166" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>`;
  };
  return `<svg viewBox="0 0 344 184" ${NS} fill="none" role="img" aria-label="같은 표본을 서로 다른 배율로 관찰한 두 개의 동그란 관찰 범위">
    <rect x="2" y="2" width="340" height="180" rx="18" fill="#F7F9FC"/>${field(91,aCount,"(가)")}${field(253,bCount,"(나)")}
  </svg>`;
}

/** 동물 또는 식물의 구성 단계 일부를 기호로 숨긴 흐름도. */
export function bioOrgFlowExamFig(kind: "animal" | "plant", hidden: number[] = [1, 3]): string {
  const steps = kind === "animal" ? ["세포", "조직", "기관", "기관계", "개체"] : ["세포", "조직", "조직계", "기관", "개체"];
  const symbols = ["㉠", "㉡", "㉢", "㉣", "㉤"];
  return `<svg viewBox="0 0 344 118" ${NS} fill="none" role="img" aria-label="${kind === "animal" ? "동물" : "식물"}의 구성 단계 다섯 칸 중 일부가 기호로 가려진 흐름도">
    <defs><linearGradient id="bof-bg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#F4FAF6"/><stop offset="1" stop-color="#E7F3EA"/></linearGradient></defs>
    <rect x="2" y="2" width="340" height="114" rx="18" fill="url(#bof-bg)"/>
    ${steps.map((s,i)=>{const x=13+i*66;return `${i?`<path d="M${x-12} 58h12" stroke="#7DA58C" stroke-width="2.4"/><path d="M${x-1} 54l7 4-7 4z" fill="#7DA58C"/>`:""}<rect x="${x}" y="36" width="56" height="44" rx="12" fill="${hidden.includes(i)?"#FFF3D7":"#FFFFFF"}" stroke="${hidden.includes(i)?"#E3A12F":"#86AD95"}" stroke-width="1.7"/><text x="${x+28}" y="62" text-anchor="middle" font-size="${hidden.includes(i)?16:11.5}" font-weight="800" fill="#344E42">${hidden.includes(i)?symbols[i]:s}</text>`;}).join("")}
  </svg>`;
}

/** 두 지역의 생물 종류·개체 분포 비교 — 점 색은 종류, 점 개수는 개체 수. */
export function bioDiversityGridFig(a: number[] = [5, 4, 3], b: number[] = [8, 2]): string {
  const colors = ["#EF6B7A", "#4BAE82", "#4C83D5", "#E5A33F", "#8B6FD1"];
  const panel = (x: number, counts: number[], label: string): string => {
    let dots = "", i = 0;
    counts.forEach((n,k)=>{for(let j=0;j<n;j++,i++){const dx=x+24+(i%5)*20,dy=53+Math.floor(i/5)*22;dots+=`<circle cx="${dx}" cy="${dy}" r="6.5" fill="${colors[k]}" stroke="#fff" stroke-width="1.4"/>`;}});
    return `<rect x="${x}" y="28" width="140" height="108" rx="14" fill="#FFFFFF" stroke="#B9D6C4" stroke-width="1.7"/>${dots}<text x="${x+70}" y="158" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>`;
  };
  return `<svg viewBox="0 0 344 174" ${NS} fill="none" role="img" aria-label="색이 같은 점은 같은 종류를 뜻하는 두 지역 A와 B의 생물 분포도">
    <rect x="2" y="2" width="340" height="170" rx="18" fill="#EEF7F1"/>${panel(22,a,"A 지역")}${panel(182,b,"B 지역")}
  </svg>`;
}

/** 5계 후보 A~E의 특징표 — 행 이름은 숨겨 분류 근거만 판독한다. */
export function bioKingdomClueTableFig(): string {
  const rows = [
    ["A", "×", "○", "×", "흡수"],
    ["B", "○", "○", "○", "스스로 만듦"],
    ["C", "○", "×", "×", "섭취"],
    ["D", "○", "다양", "다양", "다양"],
    ["E", "○", "○", "×", "흡수"],
  ];
  const cols = [42, 102, 162, 222, 288];
  return `<svg viewBox="0 0 344 226" ${NS} fill="none" role="img" aria-label="A부터 E까지 다섯 생물 무리의 핵막, 세포벽, 광합성, 양분 획득 특징을 비교한 표">
    <rect x="2" y="2" width="340" height="222" rx="18" fill="#F7FAF8"/>
    <rect x="18" y="24" width="308" height="34" rx="10" fill="#DDEFE3"/>
    ${["후보","핵막","세포벽","광합성","양분"].map((t,i)=>`<text x="${cols[i]}" y="46" text-anchor="middle" font-size="10.5" font-weight="800" fill="#355546">${t}</text>`).join("")}
    ${rows.map((r,ri)=>{const y=58+ri*31;return `<rect x="18" y="${y}" width="308" height="29" rx="7" fill="${ri%2?"#F2F7F4":"#FFFFFF"}"/>${r.map((t,i)=>`<text x="${cols[i]}" y="${y+19}" text-anchor="middle" font-size="${i===4?9.5:11}" font-weight="${i===0?800:650}" fill="#4E5968">${t}</text>`).join("")}`;}).join("")}
  </svg>`;
}

/** 연도별 개체 수 막대그래프 — 단위는 마리, 값은 파라미터형. */
export function bioPopulationBarsFig(values: number[] = [48, 36, 24, 18], labels: string[] = ["1년", "2년", "3년", "4년"]): string {
  const max = Math.max(10, ...values), top = Math.ceil(max / 10) * 10;
  const gy = (v:number)=>176-v/top*138;
  const grid = Array.from({length:5},(_,i)=>{const v=top*i/4,y=gy(v);return `<line x1="44" y1="${y}" x2="326" y2="${y}" stroke="#E3E8ED"/><text x="36" y="${y+4}" text-anchor="end" font-size="10" fill="#8B95A1">${v}</text>`;}).join("");
  return `<svg viewBox="0 0 344 218" ${NS} fill="none" role="img" aria-label="여러 해에 걸친 한 생물의 개체 수를 나타낸 막대그래프">
    <rect x="2" y="2" width="340" height="214" rx="18" fill="#FAFBFC"/>${grid}
    <line x1="44" y1="38" x2="44" y2="176" stroke="#9CA7B4" stroke-width="1.6"/><line x1="44" y1="176" x2="326" y2="176" stroke="#9CA7B4" stroke-width="1.6"/>
    ${values.map((v,i)=>{const x=65+i*65,y=gy(v);return `<rect x="${x}" y="${y}" width="38" height="${176-y}" rx="6" fill="#54B889"/><text x="${x+19}" y="${y-6}" text-anchor="middle" font-size="11" font-weight="800" fill="#347A5B">${v}</text><text x="${x+19}" y="196" text-anchor="middle" font-size="10.5" fill="#596574">${labels[i]??i+1}</text>`;}).join("")}
    <text x="20" y="28" font-size="10" fill="#8B95A1">개체 수(마리)</text>
  </svg>`;
}

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
  // 같은 T가 둘 이상이면 선이 포개진다 — 라벨을 세로로 흩어 판독 가능하게(u3 v2 검산 치명 1건 반영).
  // 같은 물질 후보를 묻는 문항이 이 구도를 쓰므로 선 겹침 자체는 의도된 자료다.
  const sameT = new Map<number, number>();
  const lines = o.ends
    .map((e) => {
      const k = sameT.get(e.T) ?? 0;
      sameT.set(e.T, k + 1);
      const dup = o.ends.filter((x) => x.T === e.T).length > 1;
      const dy = dup ? (k === 0 ? -7 : 12) : 4;
      return `<line x1="${gx(0)}" y1="${gy(o.start)}" x2="${gx(o.tMax)}" y2="${gy(e.T)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="${gx(o.tMax) + 4}" y="${gy(e.T) + dy}" font-size="12.5" font-weight="700" fill="#4E5968">${e.label}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="질량이 같은 물질들을 같은 양의 열로 가열한 시간-온도 그래프">
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
export function particleDuo(showMotionLines = true): string {
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
          !showMotionLines || trail < 1
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
  return `<svg viewBox="0 0 344 214" ${NS} role="img" aria-label="눈금이 새겨진 알코올 온도계. 액체 기둥이 어느 눈금까지 올라와 있다">
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
    <path d="M204 82.5 C246 82.5 280 68 312 47" fill="none" stroke="#8FA6C6" stroke-width="11.4" stroke-linecap="round"/>
    <path d="M204 82.5 C246 82.5 280 68 312 47" fill="none" stroke="#AFC6E8" stroke-width="9" stroke-linecap="round"/>
    <path d="M204 91.5 C246 91.5 280 77 312 56" fill="none" stroke="#7C8590" stroke-width="11.4" stroke-linecap="round"/>
    <path d="M204 91.5 C246 91.5 280 77 312 56" fill="none" stroke="#9AA3AD" stroke-width="9" stroke-linecap="round"/>
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
    <rect x="${x + 19}" y="18" width="12" height="96" rx="5" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M${x + 19} 108 L${x + 4} 138 a8 8 0 0 0 8 10 h26 a8 8 0 0 0 8 -10 L${x + 31} 108" fill="#B7D3F2" stroke="#8B95A1" stroke-width="1.8"/>
    <text x="${x + 25}" y="${Math.max(14, 52 - rise)}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1B64DA">${label}</text>`;
  return `<svg viewBox="0 0 344 208" ${NS} role="img" aria-label="같은 부피의 액체 A, B, C가 든 병을 뜨거운 물에 담근 모습. 유리관 속 액체 높이가 A, B, C 순으로 높다">
    <rect x="16" y="118" width="312" height="66" rx="12" fill="#FBE3DC" stroke="#E8B0A0" stroke-width="1.6"/>
    <path d="M40 130 q8 -5 16 0 t16 0" fill="none" stroke="#E8A08C" stroke-width="1.6"/>
    <path d="M262 130 q8 -5 16 0 t16 0" fill="none" stroke="#E8A08C" stroke-width="1.6"/>
    <text x="296" y="176" text-anchor="middle" font-size="11" fill="#B0705E">뜨거운 물</text>
    <line x1="36" y1="60" x2="308" y2="60" stroke="#8B95A1" stroke-width="1.4" stroke-dasharray="5 5"/>
    <text x="10" y="52" font-size="10.5" fill="#8B95A1">처음 높이</text>
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
const SCATTER4 = (showMotionLines = true): string => {
  const pts: [number, number, number][] = [[20, 18, 0.7], [66, 14, 2.4], [44, 40, 4.1], [16, 60, 1.2], [74, 62, 5.3], [50, 72, 3.2]];
  return pts.map(([x, y, a]) => `${showMotionLines ? trail4(x, y, a, 8.5) : ""}${dot4(x, y, 5.2)}`).join("");
};

/** 상태 변화 전후 입자 모형(다크) — 왼쪽 상자가 화살표를 지나 오른쪽 상자로.
 *  melt: 규칙→붙은 불규칙 · freeze: 붙은 불규칙→규칙 · condense: 흩어짐→붙은 불규칙 · sublime: 규칙→흩어짐 */
export function particlePairFig(kind: "melt" | "freeze" | "condense" | "sublime", showMotionLines = true): string {
  const inner: Record<string, [string, string, string]> = {
    melt: [GRID4(), CLUMP4(), "규칙적으로 늘어선 입자들이 화살표를 지나 서로 붙은 채 불규칙하게 흐트러진 배열로 변하는 모형"],
    freeze: [CLUMP4(), GRID4(), "서로 붙은 채 불규칙하게 배열된 입자들이 화살표를 지나 규칙적으로 늘어선 배열로 변하는 모형"],
    condense: [SCATTER4(showMotionLines), CLUMP4(), "멀리 흩어져 날아다니던 입자들이 화살표를 지나 서로 붙은 불규칙한 배열로 변하는 모형"],
    sublime: [GRID4(), SCATTER4(showMotionLines), "규칙적으로 늘어선 입자들이 화살표를 지나 멀리 흩어져 날아다니는 배열로 변하는 모형"],
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
    ${arrow(268, 172, 210, 76, "C", 234, 126)}
    ${arrow(228, 66, 286, 162, "D", 278, 104)}
    ${arrow(76, 172, 134, 76, "E", 110, 126)}
    ${arrow(116, 66, 58, 162, "F", 66, 104)}
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
  const liquid = `<path d="M44 88 L96 88 a8 8 0 0 1 4 10 l-2 4 a8 8 0 0 1 -8 4 h-48 a8 8 0 0 1 -8 -4 l-2 -4 a8 8 0 0 1 4 -10z" fill="#B7D3F2" opacity=".9" transform="translate(3,0)"/>`;
  const gasDots = [[56, 60], [76, 52], [66, 76], [50, 88], [84, 84], [72, 96]]
    .map(([x, y]) => `<circle cx="${x + 4}" cy="${y + 4}" r="3" fill="#9EC5FB" opacity=".85"/>`)
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
  // aria에 미는 힘 값을 낭독하지 않는다(정지 문항은 그 값이 곧 정답 — 값 제시는 문두·그림 라벨 몫).
  return `<svg viewBox="0 0 344 150" ${NS} role="img" aria-label="거친 바닥 위의 상자를 옆으로 밀고 있지만 상자는 정지해 있는 그림. 미는 힘의 크기는 그림에 적혀 있다">
    <line x1="20" y1="118" x2="324" y2="118" stroke="#B08D5E" stroke-width="3"/>
    ${hatch}
    <rect x="150" y="66" width="66" height="52" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
    <path d="M84 92h48" stroke="#F04452" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M146 92l-14-8v16z" fill="#F04452"/>
    <text x="104" y="74" text-anchor="middle" font-size="13" font-weight="700" fill="#D6363F">${n} N</text>
    <text x="183" y="52" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">정지 상태</text>
  </svg>`;
}

/** 용수철 탄성력 그래프(파라미터형, 라이트) — slope N/cm 직선 + 안내선 점. 눈금 숫자 포함(값 읽기용).
 *  lines 옵션: 이름 붙은 직선 여러 개(용수철 A·B 비교용 — u5 v2 확장, 기존 단일 slope 호출 무영향). */
export function springExamGraph(o: { slope: number; xMax: number; xStep: number; yMax: number; yStep: number; dots?: number[]; lines?: { slope: number; name: string }[] }): string {
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
  const multi = (o.lines ?? [])
    .map((l) => {
      const end = Math.min(o.xMax, o.yMax / l.slope);
      return `<line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(end)}" y2="${gy(end * l.slope)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="${gx(end) + (end >= o.xMax ? -6 : 10)}" y="${gy(end * l.slope) - 8}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${l.name}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="용수철이 늘어난 길이에 따른 탄성력 그래프. 원점을 지나는 직선${o.lines?.length ? ` ${o.lines.length}개(${o.lines.map((l) => l.name).join("·")})가 기울기를 달리해 그려져 있다` : "이다"}">
    ${yt}${xt}
    <line x1="48" y1="26" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="320" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    ${o.lines?.length ? multi : `<line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(endCm)}" y2="${gy(endCm * o.slope)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>`}
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
      <path d="M14 74 v68 M86 74 v68" stroke="#8B95A1" stroke-width="2.4"/>
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

/* ══════════════ u6 기체의 성질 ══════════════ */
// 규칙 계승: 값 읽기 정답 수치는 aria-label 금지(그림 속 조건 값 서술은 동등 접근이라 허용),
// num 정답은 눈금선 위, 입자 개수는 어느 장면이든 동일하게 그린다(개수 함정 문항의 시각 근거).
// 수치 앵커(레슨 24·30.0 회피): 보일 k=40/60/48, 샤를 0℃ 55.0 mL + 0.2 mL/℃(55/273≈0.2 자연 기울기).

/** 압력-부피 반비례 곡선(파라미터형, 라이트) — 곱 k 일정. 눈금 숫자 포함(값 읽기용). */
export function gasPvGraphFig(o: { k: number; pMax: number; pStep?: number; vMax: number; vStep: number; dots?: number[] }): string {
  const pStep = o.pStep ?? 1;
  const gx = (p: number): number => 48 + p * (264 / o.pMax);
  const gy = (v: number): number => 168 - (v / o.vMax) * 138;
  let xt = "";
  for (let p = 0; p <= o.pMax; p += pStep) {
    xt += `<line x1="${gx(p)}" y1="168" x2="${gx(p)}" y2="26" stroke="#EDF0F4" stroke-width="1"/><text x="${gx(p)}" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">${p}</text>`;
  }
  let yt = "";
  for (let v = 0; v <= o.vMax; v += o.vStep) {
    yt += `<line x1="48" y1="${gy(v)}" x2="320" y2="${gy(v)}" stroke="#EDF0F4" stroke-width="1"/><text x="40" y="${gy(v) + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  const pMin = Math.max(o.k / o.vMax, 0.4);
  let d = "";
  for (let p = pMin; p <= o.pMax; p += 0.03) d += `${d ? "L" : "M"}${gx(p).toFixed(1)} ${gy(o.k / p).toFixed(1)}`;
  const dots = (o.dots ?? [])
    .map(
      (p) => `<circle cx="${gx(p)}" cy="${gy(o.k / p)}" r="4.2" fill="#5E6B7E"/>
    <line x1="${gx(p)}" y1="${gy(o.k / p)}" x2="${gx(p)}" y2="168" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>
    <line x1="48" y1="${gy(o.k / p)}" x2="${gx(p)}" y2="${gy(o.k / p)}" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="온도가 일정할 때 압력에 따른 기체의 부피 그래프. 휘어지며 내려가는 곡선이다">
    ${yt}${xt}
    <line x1="48" y1="26" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="320" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <path d="${d}" fill="none" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${dots}
    <text x="10" y="16" font-size="11" fill="#4E5968">부피(mL)</text>
    <text x="320" y="198" text-anchor="end" font-size="11" fill="#4E5968">압력(기압)</text>
  </svg>`;
}

/** 온도(℃)-부피 직선(파라미터형, 라이트) — 0℃ 절편 v0 > 0. 눈금 숫자 포함(값 읽기용).
 *  marks를 주면 (가)(나)(다) 라벨 점, dots를 주면 안내선 점을 찍는다. */
export function gasTvGraphFig(o: {
  v0: number;
  slope: number;
  tMax: number;
  tStep: number;
  vMin: number;
  vMax: number;
  vStep: number;
  dots?: number[];
  marks?: { t: number; label: string }[];
}): string {
  const gx = (t: number): number => 48 + t * (264 / o.tMax);
  const gy = (v: number): number => 168 - ((v - o.vMin) / (o.vMax - o.vMin)) * 138;
  const vAt = (t: number): number => o.v0 + o.slope * t;
  let xt = "";
  for (let t = 0; t <= o.tMax; t += o.tStep) {
    xt += `<line x1="${gx(t)}" y1="168" x2="${gx(t)}" y2="26" stroke="#EDF0F4" stroke-width="1"/><text x="${gx(t)}" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">${t}</text>`;
  }
  let yt = "";
  for (let v = o.vMin; v <= o.vMax; v += o.vStep) {
    yt += `<line x1="48" y1="${gy(v)}" x2="320" y2="${gy(v)}" stroke="#EDF0F4" stroke-width="1"/><text x="40" y="${gy(v) + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  const tEnd = Math.min(o.tMax, (o.vMax - o.v0) / o.slope);
  const dots = (o.dots ?? [])
    .map(
      (t) => `<circle cx="${gx(t)}" cy="${gy(vAt(t))}" r="4.2" fill="#5E6B7E"/>
    <line x1="${gx(t)}" y1="${gy(vAt(t))}" x2="${gx(t)}" y2="168" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>
    <line x1="48" y1="${gy(vAt(t))}" x2="${gx(t)}" y2="${gy(vAt(t))}" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>`,
    )
    .join("");
  const marks = (o.marks ?? [])
    .map(
      (m) => `<circle cx="${gx(m.t)}" cy="${gy(vAt(m.t))}" r="4.4" fill="#5E6B7E"/>
    <text x="${gx(m.t)}" y="${gy(vAt(m.t)) - 11}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${m.label}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="압력이 일정할 때 온도에 따른 기체의 부피 그래프. 오른쪽 위로 오르는 직선이다">
    ${yt}${xt}
    <line x1="48" y1="26" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="320" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${gx(0)}" y1="${gy(o.v0)}" x2="${gx(tEnd)}" y2="${gy(vAt(tEnd))}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${dots}${marks}
    <text x="10" y="16" font-size="11" fill="#4E5968">부피(mL)</text>
    <text x="320" y="198" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

/** 온도-부피 그래프 모양 고르기 ①~⑤(라이트) — ②만 옳다(0℃ 부피>0에서 오르는 직선).
 *  ①은 원점 통과 직선(0℃면 부피 0 함정), ③ 반비례 곡선, ④ 수평선, ⑤ 내려가는 직선.
 *  (정답을 첫 보기 ①에 두지 않는 shuffle:false 규칙 준수용 배치.) */
export function gasTvChoicesFig(): string {
  const cell = (i: number, x: number, y: number, body: string): string =>
    `<g transform="translate(${x},${y})">
      <text x="0" y="10" font-size="12" font-weight="700" fill="#4E5968">${["①", "②", "③", "④", "⑤"][i]}</text>
      <line x1="16" y1="14" x2="16" y2="66" stroke="#B0B8C1" stroke-width="1.4"/>
      <line x1="16" y1="66" x2="92" y2="66" stroke="#B0B8C1" stroke-width="1.4"/>
      ${body}
      <text x="12" y="24" text-anchor="end" font-size="8.5" fill="#8B95A1">부피</text>
      <text x="92" y="76" text-anchor="end" font-size="8.5" fill="#8B95A1">온도</text>
    </g>`;
  const line = (d: string): string => `<path d="${d}" stroke="#5E6B7E" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 344 180" ${NS} fill="none" role="img" aria-label="온도와 부피 그래프 보기 다섯 개">
    ${cell(0, 8, 6, line("M16 66 L86 24"))}
    ${cell(1, 122, 6, line("M16 44 L86 24"))}
    ${cell(2, 236, 6, line("M20 20 C34 22 34 40 46 48 C58 56 74 58 88 59"))}
    ${cell(3, 8, 96, line("M16 36h70"))}
    ${cell(4, 122, 96, line("M16 24 L86 56"))}
  </svg>`;
}

/** 밀폐 용기 세 개 (가)(나)(다) 입자 모형(라이트) — 입자 수는 셋 다 6개로 같다.
 *  (나)는 부피가 절반(온도 같음 = 화살표 길이 같음), (다)는 부피 같고 화살표만 길다(온도 높음). */
export function gasParticleTrioFig(): string {
  const part = (x: number, y: number, ang: number, len: number): string => {
    const dx = Math.cos(ang) * len;
    const dy = Math.sin(ang) * len;
    return `<circle cx="${x}" cy="${y}" r="5" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1.4"/>
      <path d="M${x + dx * 0.4} ${y + dy * 0.4}L${x + dx} ${y + dy}" stroke="#5E6B7E" stroke-width="2" stroke-linecap="round"/>
      <path d="M${x + dx} ${y + dy}l${(-dx * 0.3 - dy * 0.18).toFixed(1)} ${(-dy * 0.3 + dx * 0.18).toFixed(1)}M${x + dx} ${y + dy}l${(-dx * 0.3 + dy * 0.18).toFixed(1)} ${(-dy * 0.3 - dx * 0.18).toFixed(1)}" stroke="#5E6B7E" stroke-width="1.8" stroke-linecap="round"/>`;
  };
  const box = (x: number, w: number, h: number, label: string, len: number, seed: number): string => {
    const P: [number, number, number][] = [
      [0.24, 0.3, -0.8 + seed], [0.72, 0.24, 0.5 + seed], [0.5, 0.56, 2.2 + seed],
      [0.22, 0.76, 1.1 + seed], [0.78, 0.7, -2.4 + seed], [0.52, 0.9, -1.2 + seed],
    ];
    const inner = P.map(([fx, fy, a]) => part(x + 14 + fx * (w - 28), 40 + 14 + fy * (h - 28), a, len)).join("");
    return `<rect x="${x}" y="40" width="${w}" height="${h}" rx="10" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2.2"/>
      ${inner}
      <text x="${x + w / 2}" y="${40 + h + 20}" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${label}</text>`;
  };
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="밀폐 용기 세 개의 입자 모형. 입자 수는 셋 다 같다. 나는 가보다 부피가 절반이고 화살표 길이는 같으며, 다는 가와 부피가 같고 화살표가 더 길다">
    ${box(8, 96, 120, "(가)", 11, 0)}
    ${box(124, 96, 60, "(나)", 11, 0.7)}
    ${box(240, 96, 120, "(다)", 19, 1.4)}
  </svg>`;
}

/** 피스톤 실린더 (가)(나) 비교(파라미터형, 라이트) — 추 개수로 압력, 피스톤 높이로 부피를 표현.
 *  입자는 양쪽 7개로 같다. wa/wb = 추 개수, va/vb = 기체 기둥 높이 비(0~1). */
export function gasPistonDuoFig(o: { wa: number; wb: number; va: number; vb: number }): string {
  const jar = (x: number, label: string, weights: number, vol: number): string => {
    const w = 108;
    const bot = 168;
    const top = 56;
    const pistonY = bot - (bot - top) * vol;
    const P: [number, number][] = [
      [0.22, 0.2], [0.6, 0.14], [0.85, 0.32], [0.3, 0.52], [0.7, 0.5], [0.18, 0.82], [0.62, 0.85],
    ];
    const parts = P.map(([fx, fy]) => `<circle cx="${x + 10 + fx * (w - 20)}" cy="${pistonY + 8 + fy * (bot - pistonY - 14)}" r="5.4" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1.4"/>`).join("");
    return `<g>
      <path d="M${x} ${top - 14} V${bot} H${x + w} V${top - 14}" fill="#F4F8FC" stroke="#9DAABD" stroke-width="2"/>
      <rect x="${x + 3}" y="${pistonY}" width="${w - 6}" height="9" rx="4" fill="#8B99AC"/>
      <rect x="${x + w / 2 - 3}" y="${pistonY - 18}" width="6" height="18" fill="#8B99AC"/>
      ${Array.from({ length: weights }, (_, i) => `<rect x="${x + w / 2 - 10 - (weights - 1) * 11 + i * 22}" y="${pistonY - 34}" width="20" height="15" rx="3" fill="#E8C06A" stroke="#B08D3E" stroke-width="1.6"/>`).join("")}
      ${parts}
      <text x="${x + w / 2}" y="${bot + 22}" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="피스톤이 자유롭게 움직이는 실린더 두 개. 가에는 추 ${o.wa}개, 나에는 추 ${o.wb}개가 올려져 있고 입자 수는 같다">
    ${jar(46, "(가)", o.wa, o.va)}
    ${jar(196, "(나)", o.wb, o.vb)}
  </svg>`;
}

/** 스펀지 위 병 세 개(라이트) — (가) 빈 병 바로 세움 / (나) 물 채운 병 바로 세움 / (다) 물 채운 병 거꾸로.
 *  dents=true면 눌린 깊이 (가)<(나)<(다)를 그린다 — 눌림이 문항의 전제일 때만 켤 것.
 *  (압력 크기를 "묻는" 문항이 눌림을 보여 주면 그림이 정답을 누설한다 — u6 감사 지적.) */
export function gasBottleSpongeFig(o?: { dents?: boolean }): string {
  const dents = o?.dents === true;
  const sponge = (x: number, dent: number, mouth?: boolean): string => {
    const w = 96;
    const cx = x + w / 2;
    const half = mouth ? 13 : 30;
    return `<path d="M${x} 150 h${cx - half - x} q3 ${dent} ${half} ${dent} q${half - 3} 0 ${half} ${-dent} h${x + w - cx - half} v22 h-${w} z"
      fill="#FFE3B3" stroke="#D9A85C" stroke-width="2"/>`;
  };
  const bottleUp = (x: number, filled: boolean): string =>
    `<path d="M${x + 8} 70 q-8 10 -8 22 v56 h60 v-56 q0-12 -8-22 l-4-8 h-36 z" fill="${filled ? "rgba(90,162,248,.30)" : "#F7FAFE"}" stroke="#8B95A1" stroke-width="2.2"/>
     <rect x="${x + 16}" y="48" width="28" height="14" rx="3" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
     ${filled ? `<path d="M${x + 2} 92 h56" stroke="#5AA2F8" stroke-width="1.8"/>` : ""}`;
  const bottleDown = (x: number, dent: number): string =>
    `<g transform="translate(${x + 60},${198 + dent}) rotate(180)">
       <path d="M8 70 q-8 10 -8 22 v56 h60 v-56 q0-12 -8-22 l-4-8 h-36 z" fill="rgba(90,162,248,.30)" stroke="#8B95A1" stroke-width="2.2"/>
       <rect x="16" y="48" width="28" height="14" rx="3" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
     </g>`;
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="스펀지 위에 병 세 개를 올린 그림. 가는 빈 병을 바로 세웠고, 나는 물을 가득 채워 바로 세웠고, 다는 같은 병에 물을 가득 채워 좁은 뚜껑이 아래로 가게 거꾸로 세웠다">
    ${sponge(18, dents ? 3 : 0)}${bottleUp(36, false)}
    ${sponge(124, dents ? 8 : 0)}${bottleUp(142, true)}
    ${sponge(230, dents ? 14 : 0, true)}${bottleDown(248, dents ? 14 : 0)}
    <text x="66" y="190" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    <text x="172" y="190" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
    <text x="278" y="190" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(다)</text>
  </svg>`;
}

/** 끝 막은 주사기 (가)(나) 입자 모형(라이트) — (가) 피스톤 당김(공간 넓음) / (나) 누름(공간 좁음).
 *  입자는 양쪽 6개로 같고 크기도 같다. */
export function gasSyringeDuoFig(): string {
  const syringe = (y: number, label: string, plungerX: number, parts: [number, number][]): string => {
    const bodyX = 70;
    const bodyW = 220;
    return `<g>
      <rect x="${bodyX}" y="${y}" width="${bodyW}" height="52" rx="10" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2.2"/>
      <path d="M${bodyX + bodyW} ${y + 18} h18 v16 h-18" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2.2"/>
      <rect x="${bodyX + bodyW + 18}" y="${y + 21}" width="12" height="10" rx="2" fill="#8B99AC"/>
      <rect x="${plungerX}" y="${y + 4}" width="10" height="44" rx="3" fill="#8B99AC"/>
      <path d="M${plungerX} ${y + 26} h-40" stroke="#8B99AC" stroke-width="6"/>
      <rect x="${plungerX - 52}" y="${y + 14}" width="12" height="24" rx="3" fill="#8B99AC"/>
      ${parts.map(([px, py]) => `<circle cx="${plungerX + 16 + px * (bodyX + bodyW - plungerX - 28)}" cy="${y + 10 + py * 34}" r="5.2" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1.4"/>`).join("")}
      <text x="6" y="${y + 32}" font-size="13" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  const spread: [number, number][] = [[0.1, 0.2], [0.34, 0.7], [0.5, 0.15], [0.66, 0.55], [0.84, 0.25], [0.92, 0.8]];
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="끝을 막은 주사기 두 개의 입자 모형. 가는 피스톤이 당겨져 공간이 넓고, 나는 피스톤이 눌려 공간이 좁다. 입자 수와 크기는 서로 같다">
    ${syringe(14, "(가)", 92, spread)}
    ${syringe(100, "(나)", 176, spread)}
  </svg>`;
}

/* ══════════════ u7 태양계 ══════════════ */
// 다크 스테이지(figureDark) 전용 — spaceFigures 문법 계승: 달의 밝은 반구는 항상 태양(오른쪽) 쪽,
// 공전·회전은 시계 반대 방향, 각도 값은 문항의 조건이라 그림에 표기(정답이 아닌 조건 수치).
// 천체 실사는 그리지 않는다 — public/photos/(NASA)를 <img>로 임베드(풀 파일 pimg 헬퍼).

/** 북쪽 하늘 일주 회전(파라미터형, 다크) — 북극성 중심, 별이 A에서 B로 시계 반대 deg도 회전.
 *  각도는 문항의 조건(시간 계산용) — 그림에 표기한다. */
export function starSpinFig(deg: number): string {
  const cx = 172;
  const cy = 118;
  const R = 78;
  const a0 = -18;
  // 시계 반대 = 각도 증가 방향(수학 각). 시작 a0, 끝 a0+deg.
  const pos = (d: number): [number, number] => [cx + Math.cos((d * Math.PI) / 180) * R, cy - Math.sin((d * Math.PI) / 180) * R];
  const [ax, ay] = pos(a0);
  const [bx, by] = pos(a0 + deg);
  const large = deg > 180 ? 1 : 0;
  const arcR = R - 16;
  const [aax, aay] = [cx + Math.cos(((a0 + 8) * Math.PI) / 180) * arcR, cy - Math.sin(((a0 + 8) * Math.PI) / 180) * arcR];
  const [abx, aby] = [cx + Math.cos(((a0 + deg - 4) * Math.PI) / 180) * arcR, cy - Math.sin(((a0 + deg - 4) * Math.PI) / 180) * arcR];
  const mid = a0 + deg / 2;
  const [mx, my] = [cx + Math.cos((mid * Math.PI) / 180) * (arcR - 20), cy - Math.sin((mid * Math.PI) / 180) * (arcR - 20)];
  return `<svg viewBox="0 0 344 224" ${NS} fill="none" role="img" aria-label="북쪽 하늘 그림. 가운데 북극성이 있고, 별 A가 시계 반대 방향으로 ${deg}도 돌아 B 위치로 간 모습">
    <defs><marker id="star-spin-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#8FB3E8"/></marker></defs>
    <circle cx="${cx}" cy="${cy}" r="${R}" stroke="#2C4066" stroke-width="1.4" stroke-dasharray="4 5"/>
    <circle cx="${cx}" cy="${cy}" r="4.6" fill="#FFE9A8"/>
    <circle cx="${cx}" cy="${cy}" r="8.5" stroke="rgba(255,233,168,.4)" stroke-width="1.4"/>
    <text x="${cx}" y="${cy + 22}" text-anchor="middle" font-size="11" fill="#AFC3E3">북극성</text>
    <path d="M${aax.toFixed(1)} ${aay.toFixed(1)}A${arcR} ${arcR} 0 ${large} 0 ${abx.toFixed(1)} ${aby.toFixed(1)}" stroke="#8FB3E8" stroke-width="2" stroke-dasharray="5 5" marker-end="url(#star-spin-arrow)"/>
    <text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="#DCE8FF">${deg}°</text>
    <circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="5.4" fill="#EDE2BE"/>
    <text x="${(ax + 14).toFixed(1)}" y="${(ay + 4).toFixed(1)}" font-size="12.5" font-weight="700" fill="#DCE8FF">A</text>
    <circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="5.4" fill="#EDE2BE"/>
    <text x="${(bx - 16).toFixed(1)}" y="${(by + 4).toFixed(1)}" font-size="12.5" font-weight="700" fill="#DCE8FF">B</text>
    <path d="M24 214h296" stroke="#3D5378" stroke-width="2"/>
    <text x="322" y="208" text-anchor="end" font-size="10" fill="#7E93B8">지평선</text>
  </svg>`;
}

/** 태양~여덟 행성 배열(다크) — 왼쪽 태양, 거리순 A~H. 크기는 개략 비례(문항은 특징 매칭). */
export function planetOrderFig(): string {
  const P: { r: number; c1: string; c2: string; ring?: boolean; vring?: boolean }[] = [
    { r: 4, c1: "#B9AC9C", c2: "#8A7E6E" },
    { r: 6, c1: "#F2D9A0", c2: "#C2A366" },
    { r: 6.4, c1: "#9FC6F4", c2: "#2E6FD4" },
    { r: 5, c1: "#E8927C", c2: "#B05B3C" },
    { r: 15, c1: "#F0CFA0", c2: "#B98A54" },
    { r: 13, c1: "#F0DFB2", c2: "#C0A56E", ring: true },
    { r: 8.5, c1: "#BFEAEA", c2: "#5FA8B8", vring: true },
    { r: 8.5, c1: "#9FB8F4", c2: "#3E5FD4" },
  ];
  const xs = [64, 96, 130, 163, 208, 254, 292, 322];
  const labels = "ABCDEFGH";
  const planets = P.map((p, i) => {
    const x = xs[i];
    const ring = p.ring ? `<ellipse cx="${x}" cy="96" rx="${p.r + 8}" ry="${p.r * 0.34}" stroke="#C9B98A" stroke-width="2" transform="rotate(-14 ${x} 96)"/>` : "";
    const vring = p.vring ? `<ellipse cx="${x}" cy="96" rx="${p.r * 0.34}" ry="${p.r + 6}" stroke="#9CC4C4" stroke-width="1.6"/>` : "";
    return `<circle cx="${x}" cy="96" r="${p.r}" fill="url(#exu7-p${i})"/>${ring}${vring}
      <text x="${x}" y="${96 + p.r + 20}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#DCE8FF">${labels[i]}</text>`;
  }).join("");
  const defs = P.map((p, i) => `<radialGradient id="exu7-p${i}" cx=".33" cy=".3" r=".85"><stop offset="0" stop-color="${p.c1}"/><stop offset="1" stop-color="${p.c2}"/></radialGradient>`).join("");
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="왼쪽의 태양에서 가까운 순서대로 늘어선 여덟 행성 A부터 H. 크기만 개략적으로 비례해 그린 그림">
    <defs>${defs}
      <radialGradient id="exu7-sun" cx=".8" cy=".5" r="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2A93B"/></radialGradient>
    </defs>
    <circle cx="-8" cy="96" r="42" fill="url(#exu7-sun)"/>
    <text x="18" y="42" font-size="11" fill="#FFD79E">태양</text>
    ${planets}
  </svg>`;
}

/** 달 공전 8위치 ①~⑧(다크) — 햇빛 오른쪽, 밝은 반구는 항상 오른쪽, 반시계 공전.
 *  ①=태양 쪽(삭 자리), ③=위(상현), ⑤=태양 반대(망), ⑦=아래(하현). */
export function moonPhase8Fig(): string {
  const cx = 156;
  const cy = 104;
  const R = 66;
  const nums = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];
  let moons = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = cx + Math.cos(a) * R;
    const y = cy - Math.sin(a) * R * 0.88;
    moons += `<g>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#2E3A52"/>
      <path d="M${x.toFixed(1)} ${(y - 8).toFixed(1)}a8 8 0 0 1 0 16z" fill="#EDE2BE"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" stroke="#5A6C8E" stroke-width="1"/>
    </g>`;
    const lx = cx + Math.cos(a) * (R + 25);
    const ly = cy - Math.sin(a) * (R * 0.88 + 23);
    moons += `<text x="${lx.toFixed(1)}" y="${(ly + 5.5).toFixed(1)}" fill="#DCE8FF" font-size="17.5" font-weight="800" text-anchor="middle">${nums[i]}</text>`;
  }
  return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="지구를 중심으로 한 달의 공전 궤도 여덟 위치 그림. 햇빛은 오른쪽에서 들어오고, 각 위치의 달은 오른쪽 반구만 밝다. 1번이 태양 쪽이고 시계 반대 방향으로 8번까지 번호가 붙어 있다">
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.88}" stroke="#3D5378" stroke-width="1.4" stroke-dasharray="4 5"/>
    ${moons}
    <circle cx="${cx}" cy="${cy}" r="12" fill="url(#exu7-earth)"/>
    <path d="M${cx - 5} ${cy - 2}q3-3 6-1t6 0" stroke="#7CA65A" stroke-width="1.6"/>
    <text x="${cx}" y="${cy + 28}" fill="#BFD8FF" font-size="9.5" text-anchor="middle">지구</text>
    <defs><radialGradient id="exu7-earth" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/></radialGradient></defs>
    <g stroke="#FFC24E" stroke-width="3">
      <path d="M336 74l-16 0M336 104l-16 0M336 134l-16 0"/>
    </g>
    <path d="M320 74l7-4v8zM320 104l7-4v8zM320 134l7-4v8z" fill="#FFC24E"/>
    <text x="328" y="156" fill="#FFD79E" font-size="9.5" text-anchor="middle">태양 빛</text>
  </svg>`;
}

/** 일식 그림자 지역(다크) — 태양—달—지구 일렬. 달의 짙은 그림자(본영)가 닿는 좁은 A 지역과
 *  옅은 그림자(반영)가 닿는 넓은 B 지역. 개기/부분일식 관측 지역 문항용. */
export function eclipseShadowFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="태양, 달, 지구가 일렬로 늘어선 그림. 달의 짙은 그림자가 지구 표면의 좁은 A 지역에, 옅은 그림자가 그 둘레의 넓은 B 지역에 드리워 있다">
    <defs>
      <radialGradient id="exu7-sun2" cx=".5" cy=".5" r=".9"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2A93B"/></radialGradient>
      <radialGradient id="exu7-earth2" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/></radialGradient>
      <radialGradient id="exu7-moon2" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#D8D2C0"/><stop offset="1" stop-color="#8E8874"/></radialGradient>
    </defs>
    <circle cx="30" cy="95" r="34" fill="url(#exu7-sun2)"/>
    <text x="30" y="146" text-anchor="middle" font-size="10.5" fill="#FFD79E">태양</text>
    <path d="M34 61L292 84.5L292 105.5L34 129z" fill="rgba(255,228,150,.07)"/>
    <path d="M158 84L292 63L292 127L158 106z" fill="rgba(10,16,32,.35)"/>
    <path d="M158 84L292 63M158 106L292 127" stroke="#3D5378" stroke-width="1" stroke-dasharray="3 4"/>
    <path d="M158 84L292 93.2L292 96.8L158 106z" fill="rgba(4,8,18,.85)"/>
    <circle cx="150" cy="95" r="9" fill="url(#exu7-moon2)"/>
    <text x="150" y="120" text-anchor="middle" font-size="10.5" fill="#BFD4F2">달</text>
    <circle cx="298" cy="95" r="36" fill="url(#exu7-earth2)"/>
    <path d="M285 72q6-4 12-2M280 108q8 5 16 3" stroke="#7CA65A" stroke-width="2"/>
    <path d="M264 93.2a36 36 0 0 1 .4 3.6" stroke="#F25757" stroke-width="5" stroke-linecap="round"/>
    <text x="252" y="92" text-anchor="end" font-size="12.5" font-weight="700" fill="#FF8A8A">A</text>
    <path d="M266 74a36 36 0 0 0 -3.8 17M266 116a36 36 0 0 1 -3.6 -14" stroke="#FFC24E" stroke-width="3.4" stroke-linecap="round"/>
    <text x="252" y="72" text-anchor="end" font-size="12.5" font-weight="700" fill="#FFD79E">B</text>
    <text x="298" y="146" text-anchor="middle" font-size="10.5" fill="#BFD8FF">지구</text>
  </svg>`;
}

/* ══════════════ g2u1 물질의 특성 ══════════════ */

function solSegPath(pts: [number, number][], gx: (t: number) => number, gy: (s: number) => number): string {
  let d = `M${gx(pts[0][0]).toFixed(1)} ${gy(pts[0][1]).toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += ` Q${gx(x0 + (x1 - x0) * 0.55).toFixed(1)} ${gy(y0 + (y1 - y0) * 0.38).toFixed(1)} ${gx(x1).toFixed(1)} ${gy(y1).toFixed(1)}`;
  }
  return d;
}

/** 온도-용해도 곡선(파라미터형, 라이트) — 눈금 숫자 포함(값 읽기·석출량 문항용).
 *  곡선 색은 전부 같은 중립색(색이 답의 단서가 되지 않게), 곡선 끝 라벨로 구분한다.
 *  guideS(수평)·guideT(세로) 점선과 dots(경계 점)로 상황을 표시. aria-label에 정답 수치를 쓰지 않는다. */
export function chemSolCurveExamFig(o: {
  curves: { label: string; pts: [number, number][] }[];
  tMax: number;
  sMax: number;
  tStep: number;
  sStep: number;
  guideS?: number[];
  guideT?: number[];
  dots?: [number, number, string?][];
}): string {
  const gx = (t: number): number => 52 + t * (258 / o.tMax);
  const gy = (s: number): number => 186 - (s / o.sMax) * 156;
  let xt = "";
  for (let t = 0; t <= o.tMax; t += o.tStep) {
    xt += `<line x1="${gx(t)}" y1="186" x2="${gx(t)}" y2="24" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(t)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${t}</text>`;
  }
  let yt = "";
  for (let s = 0; s <= o.sMax; s += o.sStep) {
    yt += `<line x1="52" y1="${gy(s)}" x2="316" y2="${gy(s)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="44" y="${gy(s) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${s}</text>`;
  }
  const guides =
    (o.guideS ?? []).map((s) => `<line x1="52" y1="${gy(s)}" x2="310" y2="${gy(s)}" stroke="#B9C2CE" stroke-width="1.3" stroke-dasharray="4 5"/>`).join("") +
    (o.guideT ?? []).map((t) => `<line x1="${gx(t)}" y1="186" x2="${gx(t)}" y2="28" stroke="#B9C2CE" stroke-width="1.3" stroke-dasharray="4 5"/>`).join("");
  const curves = o.curves
    .map((c) => {
      const last = c.pts[c.pts.length - 1];
      return `<path d="${solSegPath(c.pts, gx, gy)}" stroke="#5E6B7E" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text x="${gx(last[0]) - 2}" y="${gy(last[1]) - 9}" text-anchor="end" font-size="11.5" font-weight="700" fill="#4E5968">${c.label}</text>`;
    })
    .join("");
  const dots = (o.dots ?? [])
    .map(
      ([t, s, lb]) => `<circle cx="${gx(t)}" cy="${gy(s)}" r="4.5" fill="#E64980"/>${
        lb ? `<text x="${gx(t) + 9}" y="${gy(s) + 4.5}" font-size="12" font-weight="800" fill="#D6336C">${lb}</text>` : ""
      }`,
    )
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="온도에 따른 고체의 용해도 곡선. 물 100그램 기준이며 축의 눈금 숫자로 값을 읽는다">
    ${yt}${xt}${guides}
    <line x1="52" y1="24" x2="52" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="186" x2="316" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    ${curves}${dots}
    <text x="8" y="14" font-size="10.5" fill="#4E5968">용해도(g/물 100 g)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

/** 부피-질량 원점 직선(파라미터형, 라이트) — 기울기=밀도. 눈금 숫자 포함(값 읽기 문항용).
 *  선 색은 전부 같고 라벨로 구분. dots는 [부피, 질량] 강조 점. aria-label에 정답 수치를 쓰지 않는다. */
export function chemMassVolExamFig(o: {
  lines: { label: string; density: number }[];
  vMax: number;
  mMax: number;
  vStep: number;
  mStep: number;
  /** [부피, 질량, 라벨?] — 라벨은 점 곁에 인쇄(문두가 P·Q로 지칭하는 문항의 렌더 보장 · g2u1 v2 검산 A 반영). */
  dots?: [number, number, string?][];
}): string {
  const gx = (v: number): number => 52 + v * (258 / o.vMax);
  const gy = (m: number): number => 186 - (m / o.mMax) * 156;
  let xt = "";
  for (let v = 0; v <= o.vMax; v += o.vStep) {
    xt += `<line x1="${gx(v)}" y1="186" x2="${gx(v)}" y2="24" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(v)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  let yt = "";
  for (let m = 0; m <= o.mMax; m += o.mStep) {
    yt += `<line x1="52" y1="${gy(m)}" x2="316" y2="${gy(m)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="44" y="${gy(m) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${m}</text>`;
  }
  const lines = o.lines
    .map((l) => {
      const vEnd = Math.min(o.vMax, o.mMax / l.density);
      const mEnd = vEnd * l.density;
      return `<line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(vEnd)}" y2="${gy(mEnd)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="${gx(vEnd) + (vEnd >= o.vMax ? -4 : 4)}" y="${gy(mEnd) - 8}" text-anchor="${vEnd >= o.vMax ? "end" : "start"}" font-size="11.5" font-weight="700" fill="#4E5968">${l.label}</text>`;
    })
    .join("");
  const dots = (o.dots ?? [])
    .map(
      ([v, m, lb]) => `<circle cx="${gx(v)}" cy="${gy(m)}" r="4.5" fill="#E64980"/>
      <line x1="${gx(v)}" y1="${gy(m)}" x2="${gx(v)}" y2="186" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>
      <line x1="52" y1="${gy(m)}" x2="${gx(v)}" y2="${gy(m)}" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>${
        lb ? `<text x="${gx(v) + 9}" y="${gy(m) + 12}" font-size="12" font-weight="800" fill="#D6336C">${lb}</text>` : ""
      }`,
    )
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="여러 물질의 부피와 질량 그래프. 원점을 지나는 직선들이며 축의 눈금 숫자로 값을 읽는다">
    ${yt}${xt}
    <line x1="52" y1="24" x2="52" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="186" x2="316" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    ${lines}${dots}
    <text x="8" y="14" font-size="11" fill="#4E5968">질량(g)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">부피(cm³)</text>
  </svg>`;
}

/** 액체 (가)~(라) 가열 곡선(라이트) — 끓는점 비교·순물질/혼합물 판별 합답형용.
 *  (가)·(다)는 같은 온도에서 평평(시작 위치만 다름), (나)는 더 낮은 온도에서 평평,
 *  (라)는 끓는 동안에도 계속 오른다. 곡선 시작점을 엇갈려 겹침을 피한다(heatPlateausFig 문법).
 *  aria-label에는 판별 단서를 쓰지 않는다. */
export function chemBoilCurvesFig(): string {
  const gy = (c: number): number => 168 - (c / 110) * 146;
  // plen = 끓는 평평 구간 길이(px) — 양이 많은 액체일수록 길게(기울기 완만 + 구간 김이 한 세트).
  const seg = (x0: number, tempo: number, plateau: number, label: string, lx: number, plen: number): string => {
    const pY = gy(plateau);
    return `<path d="M${x0} ${gy(16)} L${x0 + 40 * tempo} ${pY} L${x0 + 40 * tempo + plen} ${pY}" stroke="#5E6B7E" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <text x="${lx}" y="${pY - 8}" font-size="12" font-weight="700" fill="#4E5968">${label}</text>`;
  };
  const riser = (x0: number, label: string): string =>
    `<path d="M${x0} ${gy(16)} L${x0 + 44} ${gy(74)} C${x0 + 66} ${gy(88)} ${x0 + 88} ${gy(94)} ${x0 + 108} ${gy(99)}" stroke="#5E6B7E" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <text x="${x0 + 96}" y="${gy(99) - 9}" font-size="12" font-weight="700" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="서로 다른 비커에 담긴 액체 네 개를 각각 가열한 시간-온도 그래프">
    <line x1="46" y1="12" x2="46" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="46" y1="168" x2="330" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[58, 82].map((c) => `<line x1="46" y1="${gy(c)}" x2="326" y2="${gy(c)}" stroke="#EDF0F4"/><text x="38" y="${gy(c) + 4}" text-anchor="end" font-size="10" fill="#8B95A1">${c}</text>`).join("")}
    ${seg(52, 1.15, 82, "(가)", 100, 46)}
    ${seg(92, 1.5, 58, "(나)", 158, 54)}
    ${seg(128, 1.75, 82, "(다)", 226, 88)}
    ${riser(200, "(라)")}
    <text x="12" y="12" font-size="10.5" fill="#4E5968">온도(℃)</text>
    <text x="330" y="188" text-anchor="end" font-size="11" fill="#4E5968">가열 시간(분)</text>
  </svg>`;
}

/** 서로 섞이지 않는 액체 층 기둥(파라미터형, 라이트) — layers는 위→아래 라벨.
 *  objAt이 있으면 작은 공이 그 경계에 떠 있다(0=맨 위 표면, i=층 i·i+1 사이, 층 수=맨 바닥). */
export function chemColumnFig(o: { layers: string[]; objLabel?: string; objAt?: number }): string {
  const n = o.layers.length;
  const top = 30;
  const bot = 172;
  const h = (bot - top) / n;
  const tints = ["#FBF7E4", "#FFE9A8", "#BFE0F8", "#E7DFF8", "#FFE0D6"];
  const layers = o.layers
    .map((lb, i) => {
      const y = top + i * h;
      return `<rect x="122" y="${y}" width="100" height="${h}" fill="${tints[i % tints.length]}"/>
      <line x1="122" y1="${y}" x2="222" y2="${y}" stroke="#E2D8B8" stroke-width="${i === 0 ? 0 : 1.5}"/>
      <text x="240" y="${y + h / 2 + 4}" font-size="12.5" font-weight="700" fill="#4E5968">${lb}</text>
      <path d="M236 ${y + h / 2} h-16" stroke="#C4CAD2" stroke-width="1.3"/>`;
    })
    .join("");
  let obj = "";
  if (o.objAt != null) {
    const y = o.objAt >= n ? bot - 9 : top + o.objAt * h;
    obj = `<circle cx="150" cy="${y}" r="9" fill="#F2C14E" stroke="#B08D3E" stroke-width="1.8"/>
      <text x="108" y="${y + 4}" text-anchor="end" font-size="12" font-weight="700" fill="#4E5968">${o.objLabel ?? "P"}</text>
      <path d="M112 ${y} h26" stroke="#C4CAD2" stroke-width="1.3"/>`;
  }
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="서로 섞이지 않는 액체 여러 층이 담긴 원통. 층마다 라벨이 붙어 있다">
    <path d="M118 24h108v134a16 16 0 0 1-16 16h-76a16 16 0 0 1-16-16z" fill="rgba(224,238,250,.28)" stroke="#9DAABD" stroke-width="2.2"/>
    ${layers}${obj}
  </svg>`;
}

/** 분별 깔때기(중립 라벨판, 라이트) — 층 이름 대신 ㉠(위층)·㉡(아래층). 마개·꼭지·비커 포함. */
export function chemFunnelABFig(): string {
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="분별 깔때기에 서로 섞이지 않는 두 액체가 위층과 아래층으로 나뉘어 있고, 아래에 비커가 놓여 있다">
    <path d="M142 26h60" stroke="#9DAABD" stroke-width="2"/>
    <rect x="158" y="16" width="28" height="14" rx="4" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.6"/>
    <path d="M136 34h72l-26 84v22h-20v-22z" fill="rgba(224,238,250,.4)" stroke="#9DAABD" stroke-width="2.2"/>
    <path d="M140 40h64l-14 44h-36z" fill="#FFF3C9" opacity=".9"/>
    <path d="M154 84h36l-8 30v16h-20v-16z" fill="#CBE4F8" opacity=".95"/>
    <path d="M154 84h36" stroke="#D9C27C" stroke-width="2"/>
    <rect x="164" y="142" width="16" height="12" rx="3" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.6"/>
    <path d="M172 154v18" stroke="#9DAABD" stroke-width="3"/>
    <path d="M146 176h52v26a8 8 0 0 1-8 8h-36a8 8 0 0 1-8-8z" fill="rgba(224,238,250,.4)" stroke="#9DAABD" stroke-width="1.8"/>
    <text x="216" y="26" font-size="11.5" font-weight="700" fill="#4E5968">마개</text>
    <text x="224" y="66" font-size="13" font-weight="800" fill="#4E5968">㉠</text>
    <text x="224" y="104" font-size="13" font-weight="800" fill="#4E5968">㉡</text>
    <text x="196" y="152" font-size="11.5" font-weight="700" fill="#4E5968">꼭지</text>
    <text x="120" y="200" text-anchor="end" font-size="11" fill="#8B95A1">비커</text>
    <path d="M212 22h-8M220 62h-16M220 100h-26M192 148h-8" stroke="#C4CAD2" stroke-width="1.4"/>
  </svg>`;
}

/** 증류 장치(라이트) — A 온도계(감온부가 가지관 높이), B 둥근 플라스크 속 혼합물(끓임쪽 포함),
 *  C 찬물이 흐르는 냉각 장치, D 받는 그릇. 장치 각 부분의 역할 문항용. */
export function chemDistillApparatusFig(): string {
  return `<svg viewBox="0 0 344 228" ${NS} fill="none" role="img" aria-label="증류 장치. 둥근 플라스크 위에 온도계가 꽂혀 있고, 옆으로 뻗은 관이 찬물이 흐르는 냉각 장치를 지나 받는 그릇으로 이어진다">
    <circle cx="96" cy="132" r="44" fill="rgba(224,238,250,.4)" stroke="#9DAABD" stroke-width="2.2"/>
    <path d="M82 96V58a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v38" fill="rgba(224,238,250,.4)" stroke="#9DAABD" stroke-width="2.2"/>
    <path d="M60 132a36 36 0 0 0 72 0z" fill="#CBE4F8" opacity=".95"/>
    <circle cx="84" cy="158" r="2.4" fill="#8B95A1"/><circle cx="98" cy="164" r="2.4" fill="#8B95A1"/><circle cx="110" cy="156" r="2.4" fill="#8B95A1"/>
    <rect x="93" y="24" width="6" height="66" rx="3" fill="#FFF" stroke="#9DAABD" stroke-width="1.8"/>
    <rect x="94.5" y="58" width="3" height="30" rx="1.5" fill="#F25C54"/>
    <path d="M110 66h34l64 58" stroke="#9DAABD" stroke-width="2.4"/>
    <path d="M148 84l52 47" stroke="#9DAABD" stroke-width="0"/>
    <rect x="150" y="74" width="88" height="26" rx="10" transform="rotate(42 194 87)" fill="rgba(191,224,248,.5)" stroke="#7FB8DC" stroke-width="2"/>
    <path d="M236 148l-8 -8M172 74l-6 -8" stroke="#7FB8DC" stroke-width="0"/>
    <path d="M231 132q10 2 12 12M162 92q-10-2-12-12" stroke="#7FB8DC" stroke-width="2.4"/>
    <path d="M243 150l-4-8M147 74l4 8" stroke="#7FB8DC" stroke-width="0"/>
    <path d="M218 154v22" stroke="#9DAABD" stroke-width="2.4"/>
    <path d="M198 178h44v28a8 8 0 0 1-8 8h-28a8 8 0 0 1-8-8z" fill="rgba(224,238,250,.4)" stroke="#9DAABD" stroke-width="1.8"/>
    <path d="M88 196q-10-13 0-26 3 8 11 10-3-12 8-17 0 14 10 19 5 10-5 17-14 8-24-3z" fill="#FF9A4A" stroke="#D95F14" stroke-width="1.4"/>
    <text x="120" y="34" font-size="12.5" font-weight="800" fill="#4E5968">A</text>
    <path d="M116 30h-14" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="34" y="120" text-anchor="end" font-size="12.5" font-weight="800" fill="#4E5968">B</text>
    <path d="M38 118h20" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="266" y="96" font-size="12.5" font-weight="800" fill="#4E5968">C</text>
    <path d="M262 94l-32 14" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="258" y="204" font-size="12.5" font-weight="800" fill="#4E5968">D</text>
    <path d="M254 200h-12" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="96" y="218" text-anchor="middle" font-size="10.5" fill="#8B95A1">가열</text>
  </svg>`;
}

// ── g2u2(지권의 변화) 시험 전용 ──────────────────────────────
// aria-label에 정오 단서 금지 — 분포의 '모양'을 말하지 않는다.

/** 암석 분류 순서도 — 질문 2단 분기, 예/아니요가 각자의 결론 칸으로 갈라진다(수렴 금지).
 *  시작 상자에 담을 암석 목록과 질문 2개를 파라미터로 — 문항마다 각도를 바꿔 재사용. */
export function geoRockFlowFig(o: { start: string; q1: string; q2: string }): string {
  const result = (x: number, y: number, label: string): string =>
    `<rect x="${x}" y="${y}" width="76" height="38" rx="10" fill="#F8FAFC" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 4"/>
     <text x="${x + 38}" y="${y + 24}" text-anchor="middle" font-size="14.5" font-weight="800" fill="#4E5968">${label}</text>`;
  const yes = (x: number, y: number): string => `<text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0CA678">예</text>`;
  const no = (x: number, y: number): string => `<text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8B95A1">아니요</text>`;
  return `<svg viewBox="0 0 344 252" ${NS} fill="none" role="img" aria-label="암석 분류 순서도. 시작 상자의 암석들을 두 가지 질문으로 차례로 갈라 가, 나, 다 세 칸으로 나눕니다">
    <rect x="72" y="10" width="200" height="34" rx="17" fill="#F2F4F6" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="172" y="31" text-anchor="middle" font-size="12" font-weight="800" fill="#333D4B">${o.start}</text>
    <line x1="172" y1="44" x2="172" y2="64" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M172 66 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <rect x="62" y="68" width="220" height="38" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="172" y="91" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1B64DA">${o.q1}</text>
    <line x1="282" y1="87" x2="308" y2="87" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M310 87 l-7 -4.5 v9 z" fill="#8B95A1"/>
    ${yes(296, 80)}
    ${result(258, 100, "(가)")}
    <line x1="172" y1="106" x2="172" y2="132" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M172 134 l-4.5 -7 h9 z" fill="#8B95A1"/>
    ${no(154, 124)}
    <rect x="62" y="136" width="220" height="38" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="172" y="159" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1B64DA">${o.q2}</text>
    <line x1="282" y1="155" x2="308" y2="155" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M310 155 l-7 -4.5 v9 z" fill="#8B95A1"/>
    ${yes(296, 148)}
    ${result(258, 168, "(나)")}
    <line x1="172" y1="174" x2="172" y2="202" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M172 204 l-4.5 -7 h9 z" fill="#8B95A1"/>
    ${no(154, 194)}
    ${result(134, 206, "(다)")}
  </svg>`;
}

/** 두 판 사이가 벌어진 거리-시간 그래프(원점 직선, 파라미터형) — num 값 읽기용.
 *  정답 수치는 반드시 x·y 눈금선 교차점 위에 얹는다. aria에 수치·기울기 언급 금지. */
export function geoDriftRateFig(o: { xMax: number; xStep: number; yMax: number; yStep: number; slope: number; dots?: [number, number][] }): string {
  const L = 54, R = 328, T = 22, B = 176;
  const px = (v: number): number => L + ((R - L) * v) / o.xMax;
  const py = (v: number): number => B - ((B - T) * v) / o.yMax;
  let grid = "";
  for (let x = 0; x <= o.xMax; x += o.xStep) {
    grid += `<line x1="${px(x)}" y1="${T}" x2="${px(x)}" y2="${B}" stroke="#EDF0F4" stroke-width="1.1"/>
      <text x="${px(x)}" y="${B + 16}" text-anchor="middle" font-size="10.5" fill="#8B95A1">${x}</text>`;
  }
  for (let y = 0; y <= o.yMax; y += o.yStep) {
    grid += `<line x1="${L}" y1="${py(y)}" x2="${R}" y2="${py(y)}" stroke="#EDF0F4" stroke-width="1.1"/>
      <text x="${L - 6}" y="${py(y) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${y}</text>`;
  }
  const endX = Math.min(o.xMax, o.yMax / o.slope);
  // 가이드 점선은 그리지 않는다 — 값 읽기(눈금 따라가기)가 문항의 과제라, 축까지 이어 주면 정답이 바로 읽힌다.
  const dots = (o.dots ?? [])
    .map(([x, y]) => `<circle cx="${px(x)}" cy="${py(y)}" r="3.4" fill="#FFF" stroke="#F04452" stroke-width="2"/>`)
    .join("");
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="두 판 사이가 벌어진 거리를 시간에 따라 나타낸 그래프예요. 가로축은 시간, 세로축은 벌어진 거리이고 원점을 지나는 직선이 그려져 있어요">
    ${grid}
    <line x1="${L}" y1="${B}" x2="${R}" y2="${B}" stroke="#8B95A1" stroke-width="1.6"/>
    <line x1="${L}" y1="${B}" x2="${L}" y2="${T}" stroke="#8B95A1" stroke-width="1.6"/>
    <line x1="${L}" y1="${B}" x2="${px(endX)}" y2="${py(endX * o.slope)}" stroke="#3A7DDB" stroke-width="2.6"/>
    ${dots}
    <text x="10" y="14" font-size="10.5" fill="#4E5968">벌어진 거리(cm)</text>
    <text x="${R}" y="${B + 32}" text-anchor="end" font-size="10.5" fill="#4E5968">시간(년)</text>
  </svg>`;
}

/** 암석 순환 시험판 — recap용 rockCycleFig와 달리 과정 라벨을 ㉠~㉤로 감춘다
 *  (과정명을 묻는 문항에서 라벨 문자가 정답을 유출하므로). 정거장 이름은 유지.
 *  ㉠ 마그마→화성암 · ㉡ 화성암→퇴적물 · ㉢ 퇴적물→퇴적암 · ㉣ 퇴적암→변성암 · ㉤ 변성암→마그마 */
export function geoCycleQuizFig(): string {
  const node = (cx: number, cy: number, name: string, bg: string, line: string, ink: string): string =>
    `<rect x="${cx - 42}" y="${cy - 17}" width="84" height="34" rx="17" fill="${bg}" stroke="${line}" stroke-width="1.5"/>
     <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="${ink}">${name}</text>`;
  const arrow = (d: string, tip: [number, number, number]): string =>
    `<path d="${d}" stroke="#8B95A1" stroke-width="1.9" fill="none"/>
     <path d="M${tip[0]} ${tip[1]} l-8 -3 l2 8 z" fill="#8B95A1" transform="rotate(${tip[2]} ${tip[0]} ${tip[1]})"/>`;
  const tag = (x: number, y: number, t: string): string =>
    `<circle cx="${x}" cy="${y}" r="11" fill="#FFFFFF" stroke="#5AA2F8" stroke-width="1.6"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">${t}</text>`;
  return `<svg viewBox="0 0 344 250" ${NS} fill="none" role="img" aria-label="암석의 순환 그림. 마그마, 화성암, 퇴적물, 퇴적암, 변성암 다섯 정거장이 화살표로 이어져 있고, 각 화살표에는 과정 이름 대신 동그라미 기호가 붙어 있어요">
    ${arrow("M76 190 C56 160 48 148 46 134", [46, 134, -14])}
    ${tag(42, 168, "㉠")}
    ${arrow("M58 92 C70 68 94 52 126 44", [126, 44, 68])}
    ${tag(84, 56, "㉡")}
    ${arrow("M218 44 C250 52 274 68 286 92", [286, 92, 148])}
    ${tag(262, 56, "㉢")}
    ${arrow("M298 134 C296 148 288 160 268 190", [268, 190, 205])}
    ${tag(302, 168, "㉣")}
    ${arrow("M202 214 L144 214", [144, 214, 0])}
    ${tag(173, 232, "㉤")}
    ${node(100, 214, "마그마", "#FFE3E0", "#F25C54", "#C0362E")}
    ${node(46, 110, "화성암", "#FDE7EE", "#E64980", "#B03668")}
    ${node(172, 36, "퇴적물", "#F2F4F6", "#8B95A1", "#4E5968")}
    ${node(298, 110, "퇴적암", "#FFF4E6", "#C9A26A", "#8E6A34")}
    ${node(244, 214, "변성암", "#E6FCF5", "#12B886", "#087F5B")}
  </svg>`;
}


// ── g2u2 v2(지권의 변화 재출제) 시험 전용 — 실지도 킷 + 신작 헬퍼 ──────────────
// 파일럿 스테이징(qa/g2u2v2-pilot.ts)에서 승격(2026-07-26). 배경 = PALEOMAP 실지도(plateMap 랩과
// 같은 자산), 점·경계 = plateMap.ts lon/lat 실데이터 복제. 사진 임베드(pic 계열)는 풀 파일 로컬 관행.
const GEO_IMG_BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";

/** 화성암 생성 장소 단면 — 지표(용암) 부근 A, 지하 깊은 곳(마그마) 부근 B. */
export function geoMagmaSiteFig(): string {
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="화산과 땅속의 단면 그림. 산 위로 흘러나온 용암 부근에 A, 땅속 깊은 곳의 마그마 부근에 B가 표시되어 있어요">
    <rect x="8" y="8" width="328" height="86" fill="#DDF0FB"/>
    <path d="M8 94 h100 l52 -58 q12 -12 24 0 l52 58 h100 v114 h-328 z" fill="#C9A26A" stroke="#8E6A34" stroke-width="1.4"/>
    <path d="M8 138 h328 M8 172 h328" stroke="#B08D52" stroke-width="1.2" opacity=".6"/>
    <path d="M160 36 q12 -10 24 0 l-4 6 q-8 -6 -16 0 z" fill="#F2F4F6" opacity=".9"/>
    <path d="M164 42 q8 -7 16 0 l30 52 h-76 z" fill="#B0836A" stroke="#8E5A3A" stroke-width="1.3"/>
    <path d="M168 46 q4 8 8 0 q4 8 8 0 l20 46 h-56 z" fill="#F25C54" opacity=".85"/>
    <path d="M210 92 q26 4 40 14 q8 6 4 12" stroke="#F25C54" stroke-width="7" stroke-linecap="round" opacity=".8"/>
    <path d="M172 92 q-4 34 -6 52 q-2 22 6 34 q8 -12 6 -34 q-2 -18 -6 -52z" fill="#E8590C" opacity=".85"/>
    <ellipse cx="172" cy="186" rx="52" ry="22" fill="#D6336C" opacity=".9"/>
    <ellipse cx="172" cy="186" rx="30" ry="12" fill="#F25C54" opacity=".9"/>
    <circle cx="252" cy="112" r="11" fill="#FFFFFF" stroke="#4E5968" stroke-width="1.6"/>
    <text x="252" y="116.5" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">A</text>
    <path d="M252 101 q0 -8 -6 -12" stroke="#4E5968" stroke-width="1.3"/>
    <circle cx="236" cy="186" r="11" fill="#FFFFFF" stroke="#4E5968" stroke-width="1.6"/>
    <text x="236" y="190.5" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">B</text>
    <path d="M225 186 h-14" stroke="#4E5968" stroke-width="1.3"/>
    <rect x="8" y="8" width="328" height="200" rx="2" stroke="#8B95A1" stroke-width="1.4"/>
  </svg>`;
}

/** 이분 검색표(질문 4 · 결과 5) — 시작 목록과 질문 문구는 파라미터. 예/아니요는 각자 결론 칸(한 칸 합류 금지).
 *  q4는 두 줄 상자(파일럿 눈검수에서 (다) 칸과의 겹침을 잡아 재배치 — 결과 행과 x 분리). */
export function geoKeyFiveFig(o: { start: string; q1: string; q2: string; q3: string; q4: [string, string] }): string {
  const q = (cx: number, cy: number, w: number, t: string): string =>
    `<rect x="${cx - w / 2}" y="${cy - 17}" width="${w}" height="34" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
     <text x="${cx}" y="${cy + 4.5}" text-anchor="middle" font-size="11" font-weight="700" fill="#1B64DA">${t}</text>`;
  const res = (cx: number, cy: number, label: string): string =>
    `<rect x="${cx - 30}" y="${cy - 16}" width="60" height="32" rx="9" fill="#F8FAFC" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 4"/>
     <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">${label}</text>`;
  const edge = (x1: number, y1: number, x2: number, y2: number, lbl: string, yes: boolean): string =>
    `<path d="M${x1} ${y1} C ${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2 - 4}" stroke="#8B95A1" stroke-width="1.7" fill="none"/>
     <path d="M${x2} ${y2} l-4.2 -7 h8.4 z" fill="#8B95A1"/>
     <text x="${(x1 + x2) / 2 + (x2 > x1 ? 12 : -12)}" y="${(y1 + y2) / 2 - 2}" text-anchor="middle" font-size="10" font-weight="800" fill="${yes ? "#0CA678" : "#8B95A1"}">${lbl}</text>`;
  return `<svg viewBox="0 0 344 312" ${NS} fill="none" role="img" aria-label="암석 분류 순서도. 시작 목록의 암석들을 네 가지 질문에 예, 아니요로 답하며 가, 나, 다, 라, 마 다섯 칸으로 나눕니다">
    <rect x="62" y="8" width="220" height="30" rx="15" fill="#F2F4F6" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="172" y="27" text-anchor="middle" font-size="11.5" font-weight="800" fill="#333D4B">${o.start}</text>
    <line x1="172" y1="38" x2="172" y2="54" stroke="#8B95A1" stroke-width="1.7"/>
    <path d="M172 56 l-4.2 -7 h8.4 z" fill="#8B95A1"/>
    ${q(172, 75, 216, o.q1)}
    ${edge(120, 92, 86, 136, "예", true)}
    ${edge(224, 92, 252, 136, "아니요", false)}
    ${q(86, 153, 150, o.q2)}
    ${q(252, 153, 160, o.q3)}
    ${edge(56, 170, 40, 204, "예", true)}
    ${edge(116, 170, 126, 204, "아니요", false)}
    ${res(40, 220, "(가)")}
    ${res(126, 220, "(나)")}
    ${edge(218, 170, 202, 204, "예", true)}
    ${edge(286, 170, 288, 194, "아니요", false)}
    ${res(202, 220, "(다)")}
    <rect x="236" y="194" width="104" height="40" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="288" y="210" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1B64DA">${o.q4[0]}</text>
    <text x="288" y="224" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1B64DA">${o.q4[1]}</text>
    ${edge(262, 234, 248, 266, "예", true)}
    ${edge(314, 234, 312, 266, "아니요", false)}
    ${res(248, 283, "(라)")}
    ${res(312, 283, "(마)")}
  </svg>`;
}

// ── 실지도 래스터 + 실좌표 오버레이 공용(plateMap 랩과 같은 지도·데이터 계보) ──────────
// 배경 = PALEOMAP 실지도(public/geo/maps — C.R. Scotese, photos/CREDITS.md 기재 자산 재사용).
// 점·경계 좌표는 plateMap.ts의 lon/lat 실데이터 복제(승격 때 공용 export 검토).
// 투영(equirect): x=(lon+180)/360·1000, y=(90−lat)/180·500 — 창(window)으로 잘라 328px 폭에 맞춘다.
export const MAP_NOW = "geo/maps/Map01a_PALEOMAP_PaleoAtlas_000.webp";
let FIG_UID = Math.floor(Math.random() * 1e9); // 번들마다 난수 기점 — 갤러리(다중 번들 합본)의 clip id 충돌 방지

export interface MapWin {
  img: string;
  open: string;
  close: string;
  px: (lon: number) => number;
  py: (lat: number) => number;
  h: number;
}
/** 경위도 창을 (x, y) 위치 폭 w 프레임으로 자른 실지도 배경 + 클립 그룹. */
export function mapWindow(o: { lon0: number; lon1: number; lat0: number; lat1: number; x: number; y: number; w: number; src?: string }): MapWin {
  const wx0 = ((o.lon0 + 180) / 360) * 1000;
  const wx1 = ((o.lon1 + 180) / 360) * 1000;
  const wy0 = ((90 - o.lat0) / 180) * 500;
  const wy1 = ((90 - o.lat1) / 180) * 500;
  const s = o.w / (wx1 - wx0);
  const h = (wy1 - wy0) * s;
  const id = `gmw${FIG_UID++}`;
  const img = `<image href="${GEO_IMG_BASE}${o.src ?? MAP_NOW}" x="${(o.x - wx0 * s).toFixed(1)}" y="${(o.y - wy0 * s).toFixed(1)}" width="${(1000 * s).toFixed(1)}" height="${(500 * s).toFixed(1)}" preserveAspectRatio="none"/>`;
  return {
    img,
    open: `<defs><clipPath id="${id}"><rect x="${o.x}" y="${o.y}" width="${o.w}" height="${h.toFixed(1)}" rx="10"/></clipPath></defs><g clip-path="url(#${id})">`,
    close: `</g><rect x="${o.x}" y="${o.y}" width="${o.w}" height="${h.toFixed(1)}" rx="10" fill="none" stroke="#8B95A1" stroke-width="1.4"/>`,
    px: (lon: number) => o.x + (((lon + 180) / 360) * 1000 - wx0) * s,
    py: (lat: number) => o.y + (((90 - lat) / 180) * 500 - wy0) * s,
    h,
  };
}

/** 지진 95지점(lon, lat, 등급) — 실제 지진대(불의 고리·알프스-히말라야·대양저 경계·열곡). plateMap 복제. */
export const QUAKES: readonly (readonly [number, number, number])[] = [
  [-71.6, -33.0, 3], [-70.3, -27.4, 2], [-71.7, -30.6, 2], [-73.0, -36.8, 3], [-72.1, -39.8, 2],
  [-76.9, -12.1, 3], [-79.0, -8.1, 2], [-79.9, -2.2, 2], [-78.5, 0.6, 1],
  [-77.0, 3.9, 2], [-84.1, 9.9, 2], [-86.3, 12.2, 2], [-90.5, 14.3, 2],
  [-93.1, 16.4, 2], [-99.1, 17.5, 3], [-102.3, 18.6, 2], [-104.8, 19.9, 1],
  [-118.2, 34.1, 3], [-122.4, 37.8, 3], [-124.2, 40.4, 2], [-125.6, 44.5, 1], [-131.5, 52.5, 2],
  [-147.5, 61.2, 2], [-153.0, 57.8, 2], [-160.5, 55.3, 2], [-168.0, 53.5, 1],
  [-175.0, 51.8, 2], [178.5, 51.7, 1], [171.0, 52.3, 1], [160.3, 54.8, 2], [158.6, 52.9, 3],
  [153.9, 47.8, 2], [148.0, 44.5, 2], [143.9, 42.7, 3], [142.4, 38.3, 3], [141.0, 35.7, 2], [132.6, 33.9, 2],
  [140.6, 30.5, 1], [143.2, 25.0, 2], [146.0, 18.0, 2], [147.5, 13.5, 1],
  [121.5, 17.5, 2], [124.0, 11.5, 2], [126.5, 7.0, 3],
  [95.9, 4.4, 3], [97.9, 1.5, 2], [100.9, -2.9, 2], [102.9, -5.3, 2], [106.0, -7.6, 2],
  [110.5, -8.3, 2], [115.2, -8.8, 2], [119.8, -9.8, 1], [124.9, -8.8, 2], [119.9, -0.6, 2],
  [143.9, -4.0, 2], [150.5, -5.6, 2], [156.0, -7.5, 2], [161.0, -10.4, 1],
  [167.5, -15.5, 2], [173.5, -41.3, 2], [171.7, -43.5, 2],
  [-175.0, -21.0, 2], [-177.5, -26.0, 1], [-179.0, -30.5, 1],
  [84.7, 28.2, 3], [86.9, 27.9, 2], [78.5, 32.5, 1], [73.6, 34.5, 2], [70.5, 36.5, 3],
  [67.0, 30.2, 2], [96.1, 22.0, 2], [91.9, 27.3, 1], [74.6, 42.9, 1],
  [57.3, 30.3, 2], [52.8, 28.5, 1], [48.5, 38.5, 1], [44.0, 39.5, 2], [38.3, 38.5, 3], [35.5, 37.0, 2],
  [28.2, 36.7, 2], [25.7, 35.3, 2], [22.0, 38.2, 2], [16.3, 38.3, 2], [13.5, 42.5, 2], [3.0, 36.6, 1],
  [-17.0, 66.2, 1], [-22.8, 63.9, 2], [-29.5, 52.5, 1], [-43.0, 29.5, 1], [-45.5, 15.5, 1], [-13.5, -7.5, 1],
  [40.0, 12.5, 1], [36.8, -1.3, 1], [29.5, -6.0, 1], [34.9, -13.5, 1],
];

/** 화산 ~60지점(lon, lat) — 불의 고리+지중해+열곡+아이슬란드. 알프스-히말라야 벨트는 실제로
 *  화산이 드물어 비어 있다(지진·화산 분포가 "거의(완전이 아닌)" 일치하는 실증). plateMap 복제. */
export const VOLCS: readonly (readonly [number, number])[] = [
  [-78.4, -0.7], [-77.4, 1.2], [-75.3, 4.9], [-71.9, -15.8], [-67.7, -23.3], [-72.0, -39.4], [-72.6, -42.8], [-70.6, -35.4],
  [-90.9, 14.5], [-89.6, 13.8], [-86.7, 12.5], [-84.2, 10.5], [-98.6, 19.0], [-103.6, 19.5],
  [-122.2, 46.2], [-121.7, 45.4], [-122.3, 41.4], [-153.4, 59.4], [-161.9, 55.4], [-164.0, 54.8], [-176.1, 52.1],
  [160.6, 56.1], [158.8, 53.3], [153.2, 48.1],
  [138.7, 35.4], [130.7, 31.6], [131.1, 32.9], [140.8, 42.5],
  [140.9, 27.2], [145.8, 18.1],
  [120.4, 15.1], [123.7, 13.3], [121.0, 14.0],
  [98.4, 3.2], [105.4, -6.1], [110.4, -7.5], [112.9, -7.9], [118.0, -8.25], [121.7, -8.5], [124.8, 1.4], [127.9, 1.7],
  [152.2, -4.3], [151.3, -5.1], [168.3, -16.3], [175.6, -39.3], [177.2, -37.5],
  [-175.4, -20.5],
  [-19.7, 64.0], [-17.3, 64.4], [-22.4, 63.9], [-25.5, 37.8], [-17.9, 28.6],
  [15.0, 37.7], [14.4, 40.8], [15.2, 38.8], [25.4, 36.4],
  [40.7, 13.6], [29.2, -1.5], [35.9, -2.8],
  [-155.3, 19.4],
];

/** 대서양 한가운데를 남북으로 지나는 판 경계 폴리라인(lon, lat) — plateMap BOUNDS 복제(확대 때 전 경계 승격). */
export const RIDGE_ATL: readonly (readonly [number, number])[] = [
  [-10, 72], [-16, 68], [-19, 65], [-24, 61], [-28, 56], [-31, 50], [-30, 44], [-35, 38], [-41, 31],
  [-45, 24], [-46, 17], [-40, 11], [-31, 7], [-25, 2], [-16, -4], [-13, -11], [-14, -19], [-15, -27],
  [-17, -35], [-14, -43], [-12, -50],
];

/** 판 경계 폴리라인 전체(lon, lat) — plateMap BOUNDS 복제(날짜변경선 넘는 경계는 2조각). */
export const BOUNDS_ALL: readonly (readonly (readonly [number, number])[])[] = [
  [[-150, 58], [-159, 56], [-168, 53.6], [-179.8, 51.6]],
  [[179.8, 51.6], [171, 52.5], [163, 55], [158, 52], [153, 47], [147, 43], [142, 39], [140, 34], [141, 29], [143, 23], [146, 17], [147, 11], [143, 5]],
  [[-131, 52], [-127, 48], [-125, 43], [-122, 37], [-116, 31], [-108, 23], [-104, 18], [-96, 15], [-88, 11], [-84, 9], [-80, 1], [-78, -7], [-74, -15], [-71, -23], [-72, -32], [-74, -41], [-76, -50]],
  [[122, 20], [125, 13], [127, 6], [129, 0]],
  [[92, 10], [95, 4], [98, -2], [102, -6], [107, -8.5], [113, -9.5], [119, -10], [125, -9], [131, -7]],
  [[-179.5, -16], [-177.5, -23], [-178.5, -29]],
  [[179.5, -30], [176, -36], [172, -42], [167, -47]],
  RIDGE_ATL,
  [[-9, 36], [0, 37], [10, 38], [19, 39], [27, 37], [35, 37], [44, 37], [52, 33], [60, 28], [68, 31], [76, 33], [84, 29], [92, 27], [98, 25]],
  [[34, 28], [37, 21], [41, 14], [39, 8], [36, 2], [34, -4], [32, -10], [34, -16], [34, -22]],
];


export const quakeDot = (x: number, y: number, r = 2.1): string =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#FF5252" stroke="rgba(255,255,255,.6)" stroke-width=".6"/>`;
export const volcTri = (x: number, y: number, s = 3.1): string =>
  `<path d="M${x.toFixed(1)} ${(y - s).toFixed(1)} l${s * 0.9} ${s * 1.7} h-${s * 1.8} z" fill="#FFA94D" stroke="#7E3A14" stroke-width=".6"/>`;
export const chip = (x: number, y: number, t: string, w = 36): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="19" rx="9.5" fill="rgba(255,255,255,.94)" stroke="#C4CAD2" stroke-width="1.1"/>
   <text x="${x + w / 2}" y="${y + 13.5}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#4E5968">${t}</text>`;

/** 세계 지진(또는 화산) 분포 지도 — 실지도 배경 + 실좌표 점.
 *  boundary: 판 경계 폴리라인 겹침(노랑 점선 — plateMap 랩과 같은 문법) · marks: ㉮㉯ 위치 칩. */
export function geoQuakeBeltFig(o?: { kind?: "quake" | "volcano"; boundary?: boolean; marks?: { lon: number; lat: number; t: string }[] }): string {
  const kind = o?.kind ?? "quake";
  const W = mapWindow({ lon0: -180, lon1: 180, lat0: 72, lat1: -58, x: 8, y: 8, w: 328 });
  const marks =
    kind === "quake"
      ? QUAKES.map(([lon, lat]) => quakeDot(W.px(lon), W.py(lat))).join("")
      : VOLCS.map(([lon, lat]) => volcTri(W.px(lon), W.py(lat))).join("");
  const bounds = o?.boundary
    ? BOUNDS_ALL.map(
        (line) =>
          `<path d="${line.map(([lon, lat], i) => `${i === 0 ? "M" : "L"}${W.px(lon).toFixed(1)} ${W.py(lat).toFixed(1)}`).join("")}" stroke="rgba(255,255,255,.55)" stroke-width="3.6" fill="none"/>` +
          `<path d="${line.map(([lon, lat], i) => `${i === 0 ? "M" : "L"}${W.px(lon).toFixed(1)} ${W.py(lat).toFixed(1)}`).join("")}" stroke="#FFD43B" stroke-width="1.8" stroke-dasharray="6 4" fill="none"/>`,
      ).join("")
    : "";
  const pos = o?.marks
    ? o.marks.map((m) => {
        const x = W.px(m.lon);
        const y = W.py(m.lat);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10.5" fill="rgba(255,255,255,.94)" stroke="#D6336C" stroke-width="1.6"/>
        <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#D6336C">${m.t}</text>`;
      }).join("")
    : "";
  const legend =
    (kind === "quake"
      ? `${quakeDot(16, 8 + W.h + 13, 2.6)}<text x="26" y="${8 + W.h + 17}" font-size="10.5" fill="#4E5968">지진이 발생한 지점</text>`
      : `${volcTri(16, 8 + W.h + 13, 3.4)}<text x="26" y="${8 + W.h + 17}" font-size="10.5" fill="#4E5968">화산 활동이 일어난 지역</text>`) +
    (o?.boundary
      ? `<line x1="168" y1="${8 + W.h + 13}" x2="190" y2="${8 + W.h + 13}" stroke="#FFD43B" stroke-width="2.6" stroke-dasharray="6 4"/><text x="196" y="${8 + W.h + 17}" font-size="10.5" fill="#4E5968">판의 경계</text>`
      : "");
  return `<svg viewBox="0 0 344 ${Math.round(8 + W.h + 26)}" ${NS} fill="none" role="img" aria-label="세계 지도 위에 ${kind === "quake" ? "지진이 발생한 지점" : "화산 활동이 일어난 지역"}이 표시되어 있어요${o?.boundary ? ". 판의 경계선도 함께 그려져 있어요" : ""}. 표시가 어떻게 분포하는지 살펴보세요">
    ${W.open}${W.img}${bounds}${pos}${W.close}
    ${marks}
    ${legend}
  </svg>`;
}

/** (가)(나) 두 분포 지도 대조(상하 2패널) — 지진·화산 실좌표. 알프스-히말라야 벨트의
 *  화산 공백이 "거의 일치(완전 일치 아님)"의 실측 근거로 그림에 남는다. */
export function geoTwinMapsFig(o: { left: "quake" | "volcano"; right: "quake" | "volcano" }): string {
  const panel = (y: number, kind: "quake" | "volcano", label: string): string => {
    const W = mapWindow({ lon0: -180, lon1: 180, lat0: 72, lat1: -58, x: 8, y, w: 328 });
    const marks =
      kind === "quake"
        ? QUAKES.map(([lon, lat]) => quakeDot(W.px(lon), W.py(lat), 1.9)).join("")
        : VOLCS.map(([lon, lat]) => volcTri(W.px(lon), W.py(lat), 2.8)).join("");
    return `${W.open}${W.img}${W.close}${marks}${chip(14, y + 6, label)}`;
  };
  const h = 118.4;
  const ly = 8 + h + 8 + h + 12;
  return `<svg viewBox="0 0 344 ${Math.round(ly + 16)}" ${NS} fill="none" role="img" aria-label="두 장의 세계 지도. 가 지도와 나 지도에 서로 다른 종류의 표시가 찍혀 있어요. 두 분포를 비교해 보세요">
    ${panel(8, o.left, "(가)")}
    ${panel(8 + h + 8, o.right, "(나)")}
    ${quakeDot(16, ly + 5, 2.6)}<text x="26" y="${ly + 9}" font-size="10.5" fill="#4E5968">지진 발생 지점</text>
    ${volcTri(190, ly + 5, 3.4)}<text x="200" y="${ly + 9}" font-size="10.5" fill="#4E5968">화산 활동 지역</text>
  </svg>`;
}

/** 판 경계 실경로 + 이동 방향 화살표 실지도.
 *  scene "atlantic"(기본) = 남대서양 확대(벌어짐 ㉮) · "world2" = 세계 전도에 벌어짐 ㉮·모임 ㉯ 두 경계. */
export function geoPlateArrowsFig(o?: { scene?: "atlantic" | "world2" }): string {
  const scene = o?.scene ?? "atlantic";
  const W =
    scene === "atlantic"
      ? mapWindow({ lon0: -75, lon1: 25, lat0: 20, lat1: -40, x: 8, y: 8, w: 328 })
      : mapWindow({ lon0: -105, lon1: 25, lat0: 18, lat1: -48, x: 8, y: 8, w: 328 });
  const line = (pts: readonly (readonly [number, number])[]): string => {
    const d = pts.map(([lon, lat], i) => `${i === 0 ? "M" : "L"}${W.px(lon).toFixed(1)} ${W.py(lat).toFixed(1)}`).join("");
    return `<path d="${d}" stroke="rgba(255,255,255,.75)" stroke-width="4.2" fill="none"/>
      <path d="${d}" stroke="#FFD43B" stroke-width="2.2" stroke-dasharray="8 5" fill="none"/>`;
  };
  const arrow = (lon: number, lat: number, deg: number, len = 13): string => {
    const x = W.px(lon);
    const y = W.py(lat);
    return `<g transform="rotate(${deg} ${x.toFixed(1)} ${y.toFixed(1)})">
      <line x1="${(x - len).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + len - 5).toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.85)" stroke-width="5.6"/>
      <line x1="${(x - len).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + len - 5).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#1971C2" stroke-width="3"/>
      <path d="M${(x + len + 2).toFixed(1)} ${y.toFixed(1)} l-10 -5.5 v11 z" fill="#1971C2" stroke="rgba(255,255,255,.85)" stroke-width="1.1"/>
    </g>`;
  };
  const tag = (lon: number, lat: number, t: string): string => {
    const x = W.px(lon);
    const y = W.py(lat);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10.5" fill="rgba(255,255,255,.94)" stroke="#D6336C" stroke-width="1.6"/>
      <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#D6336C">${t}</text>`;
  };
  const body =
    scene === "atlantic"
      ? `${line(RIDGE_ATL)}${arrow(-52, -14, 180, 16)}${arrow(8, -10, 0, 16)}`
      : `${line(RIDGE_ATL)}${line(BOUNDS_ALL[2])}${arrow(-48, -4, 180, 13)}${arrow(2, -2, 0, 13)}${arrow(-92, -26, 0, 13)}${arrow(-58, -28, 180, 13)}`;
  const tags =
    scene === "atlantic"
      ? tag(-20, 4, "㉮")
      : `${tag(-21, 6, "㉮")}${tag(-79, -37, "㉯")}`;
  const ly = 8 + W.h + 13;
  return `<svg viewBox="0 0 344 ${Math.round(8 + W.h + 26)}" ${NS} fill="none" role="img" aria-label="실제 지도 위에 판의 경계선과 경계 양쪽 판이 움직이는 방향 화살표가 표시되어 있어요">
    ${W.open}${W.img}
    ${body}
    ${W.close}
    ${tags}
    <line x1="16" y1="${ly}" x2="38" y2="${ly}" stroke="#FFD43B" stroke-width="3" stroke-dasharray="8 5"/>
    <text x="44" y="${ly + 4}" font-size="10.5" fill="#4E5968">판의 경계</text>
    <line x1="128" y1="${ly}" x2="146" y2="${ly}" stroke="#1971C2" stroke-width="3"/>
    <path d="M152 ${ly} l-8 -4.6 v9.2 z" fill="#1971C2"/>
    <text x="158" y="${ly + 4}" font-size="10.5" fill="#4E5968">판의 이동 방향</text>
  </svg>`;
}

/** 대륙 이동 증거 실지도 창 — mode "fossil"(기본): 남대서양, 마주 보는 해안 화석 구역 띠.
 *  mode "mountain": 북대서양, 북아메리카 동부와 유럽 북부의 산맥 띠가 이어짐. */
export function geoCoastFitFig(o?: { mode?: "fossil" | "mountain" }): string {
  const mode = o?.mode ?? "fossil";
  if (mode === "mountain") {
    const W = mapWindow({ lon0: -92, lon1: 26, lat0: 66, lat1: 22, x: 8, y: 8, w: 328 });
    const belt = (a: readonly [number, number], b: readonly [number, number]): string =>
      `<line x1="${W.px(a[0]).toFixed(1)}" y1="${W.py(a[1]).toFixed(1)}" x2="${W.px(b[0]).toFixed(1)}" y2="${W.py(b[1]).toFixed(1)}" stroke="rgba(255,255,255,.75)" stroke-width="11" stroke-linecap="round"/>
       <line x1="${W.px(a[0]).toFixed(1)}" y1="${W.py(a[1]).toFixed(1)}" x2="${W.px(b[0]).toFixed(1)}" y2="${W.py(b[1]).toFixed(1)}" stroke="#B0836A" stroke-width="7" opacity=".9" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 344 ${Math.round(8 + W.h + 8)}" ${NS} fill="none" role="img" aria-label="바다를 사이에 둔 두 대륙의 실제 지도예요. 왼쪽 대륙과 오른쪽 대륙에 있는 산맥 구역이 굵은 띠로 표시되어 있고, 두 띠가 점선으로 이어져 있어요">
      ${W.open}${W.img}
      ${belt([-84, 33], [-66, 46])}
      ${belt([-8, 54], [9, 63])}
      <line x1="${W.px(-64).toFixed(1)}" y1="${W.py(47).toFixed(1)}" x2="${W.px(-10).toFixed(1)}" y2="${W.py(53.5).toFixed(1)}" stroke="#E8CB9C" stroke-width="2" stroke-dasharray="6 5"/>
      ${W.close}
      ${chip(14, 14, "(가)")}
      ${chip(294, 14, "(나)")}
    </svg>`;
  }
  const W = mapWindow({ lon0: -85, lon1: 40, lat0: 15, lat1: -42, x: 8, y: 8, w: 328 });
  const band = (lon: number, lat0: number, lat1: number, bend: number): string =>
    `<path d="M${W.px(lon).toFixed(1)} ${W.py(lat0).toFixed(1)} q${bend} ${(W.py(lat1) - W.py(lat0)) / 2} 0 ${(W.py(lat1) - W.py(lat0)).toFixed(1)}" stroke="rgba(255,255,255,.75)" stroke-width="10" fill="none" stroke-linecap="round"/>
     <path d="M${W.px(lon).toFixed(1)} ${W.py(lat0).toFixed(1)} q${bend} ${(W.py(lat1) - W.py(lat0)) / 2} 0 ${(W.py(lat1) - W.py(lat0)).toFixed(1)}" stroke="#E64980" stroke-width="6" opacity=".8" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 344 ${Math.round(8 + W.h + 8)}" ${NS} fill="none" role="img" aria-label="바다를 사이에 둔 두 대륙의 실제 지도예요. 왼쪽 대륙의 오른쪽 해안과 오른쪽 대륙의 왼쪽 해안 모양이 서로 닮았고, 양쪽 해안의 같은 화석 구역이 점선으로 이어져 있어요">
    ${W.open}${W.img}
    ${band(-45, -18, -32, 10)}
    ${band(13.5, -16, -30, -10)}
    <line x1="${W.px(-42).toFixed(1)}" y1="${W.py(-25).toFixed(1)}" x2="${W.px(11).toFixed(1)}" y2="${W.py(-23).toFixed(1)}" stroke="#FAA2C1" stroke-width="2" stroke-dasharray="6 5"/>
    ${W.close}
    ${chip(14, 14, "(가)")}
    ${chip(294, 14, "(나)")}
  </svg>`;
}

/** 대륙 이동 4단계 — PALEOMAP 실제 고지리 지도 4장(2×2, 순서 뒤섞어 라벨).
 *  (가)=약 9천만 년 전 · (나)=약 2억 4천만 년 전(판게아) · (다)=현재 · (라)=약 1억 7천만 년 전.
 *  시대 수치는 그림에 쓰지 않는다(순서 추론 과제 보존). */
export function geoDriftPanelsFig(): string {
  const P = (x: number, y: number, src: string, label: string): string => {
    const id = `gdp${FIG_UID++}`;
    return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="160" height="80" rx="8"/></clipPath></defs>
    <g clip-path="url(#${id})"><image href="${GEO_IMG_BASE}geo/maps/${src}" x="${x}" y="${y}" width="160" height="80" preserveAspectRatio="none"/></g>
    <rect x="${x}" y="${y}" width="160" height="80" rx="8" fill="none" stroke="#8B95A1" stroke-width="1.3"/>
    ${chip(x + 6, y + 6, label, 34)}`;
  };
  return `<svg viewBox="0 0 344 184" ${NS} fill="none" role="img" aria-label="네 장의 실제 세계 지도. 대륙의 분포가 서로 다른 네 모습에 가, 나, 다, 라 표시가 붙어 있어요">
    ${P(8, 8, "ma090.webp", "(가)")}
    ${P(176, 8, "ma240.webp", "(나)")}
    ${P(8, 96, "Map01a_PALEOMAP_PaleoAtlas_000.webp", "(다)")}
    ${P(176, 96, "ma175.webp", "(라)")}
  </svg>`;
}

/** 변성암 광물 배열·압력 도해 — candidates: 배열만 보여 주고 압력 방향 후보 ㉮(위아래)·㉯(좌우) 제시.
 *  pair: (가)(나) 두 도해 비교(둘 다 위아래 압력, 배열만 다름). */
export function geoPressFig(o: { mode: "candidates" | "pair" }): string {
  const grains = (cx: number, cy: number, dir: "h" | "v"): string => {
    let out = "";
    const rows = [[-26, 3], [0, 4], [26, 3]] as [number, number][];
    rows.forEach(([dy, n]) => {
      for (let i = 0; i < n; i++) {
        const dx = (i - (n - 1) / 2) * 34;
        out += dir === "h"
          ? `<ellipse cx="${cx + dx}" cy="${cy + dy}" rx="14" ry="4.6" fill="#8A6844" stroke="#5E4430" stroke-width="1"/>`
          : `<ellipse cx="${cx + dy}" cy="${cy + dx * 0.68}" rx="4.6" ry="14" fill="#8A6844" stroke="#5E4430" stroke-width="1"/>`;
      }
    });
    return out;
  };
  const press = (cx: number, topY: number, botY: number, color: string): string =>
    `<line x1="${cx}" y1="${topY - 22}" x2="${cx}" y2="${topY - 4}" stroke="${color}" stroke-width="3.4"/>
     <path d="M${cx} ${topY} l-6 -9 h12 z" fill="${color}"/>
     <line x1="${cx}" y1="${botY + 22}" x2="${cx}" y2="${botY + 4}" stroke="${color}" stroke-width="3.4"/>
     <path d="M${cx} ${botY} l-6 9 h12 z" fill="${color}"/>`;
  if (o.mode === "pair") {
    const panel = (x: number, dir: "h" | "v", label: string): string =>
      `<g transform="translate(${x} 0)">
        <rect x="10" y="52" width="140" height="92" rx="8" fill="#EFE7DA" stroke="#9C8465" stroke-width="1.5"/>
        ${grains(80, 98, dir)}
        ${press(80, 52, 144, "#1B64DA")}
        <rect x="14" y="160" width="34" height="19" rx="9.5" fill="#FFFFFF" stroke="#C4CAD2" stroke-width="1.2"/>
        <text x="31" y="173.5" text-anchor="middle" font-size="11.5" font-weight="800" fill="#4E5968">${label}</text>
      </g>`;
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="가와 나 두 그림. 둘 다 암석 덩어리를 위아래에서 누르는 화살표가 있고, 가는 납작한 광물들이 가로로 누워 있고 나는 세로로 서 있어요">
      ${panel(14, "h", "(가)")}
      ${panel(174, "v", "(나)")}
    </svg>`;
  }
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="암석 덩어리 속에 납작한 광물들이 가로 방향으로 나란히 누워 있어요. 위아래 방향 화살표 쌍에 ㉮, 좌우 방향 화살표 쌍에 ㉯가 표시되어 있어요">
    <rect x="92" y="58" width="160" height="92" rx="8" fill="#EFE7DA" stroke="#9C8465" stroke-width="1.5"/>
    ${grains(172, 104, "h")}
    ${press(172, 58, 150, "#1B64DA")}
    <text x="186" y="30" font-size="13" font-weight="800" fill="#1B64DA">㉮</text>
    <line x1="52" y1="104" x2="76" y2="104" stroke="#F76707" stroke-width="3.4"/>
    <path d="M88 104 l-11 -6 v12 z" fill="#F76707"/>
    <line x1="292" y1="104" x2="268" y2="104" stroke="#F76707" stroke-width="3.4"/>
    <path d="M256 104 l11 -6 v12 z" fill="#F76707"/>
    <text x="40" y="88" font-size="13" font-weight="800" fill="#F76707">㉯</text>
  </svg>`;
}

/** 판의 구조 단면 시험판 — plateSectionFig의 라벨(대륙·해양 지각, 맨틀의 윗부분, 판·두께)을
 *  ㉠~㉣로 감춘다(라벨 인쇄판은 이름·두께 문항 정답 유출 — geoCycleQuizFig 계보). */
export function geoPlateQuizFig(): string {
  const tag = (x: number, y: number, t: string): string =>
    `<circle cx="${x}" cy="${y}" r="11" fill="#FFFFFF" stroke="#5AA2F8" stroke-width="1.6"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">${t}</text>`;
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="땅의 단면 그림. 왼쪽 뭍과 오른쪽 바다 밑의 겉껍질 층, 그 아래 층이 있고, 위쪽 일부 구간을 묶은 표시와 함께 동그라미 기호 네 개가 붙어 있어요">
    <path d="M188 40 h132 v26 h-132 z" fill="#BFE0F8"/>
    <path d="M196 46 q10 4 20 0 M250 52 q10 4 20 0" stroke="#8FBBF2" stroke-width="1.6"/>
    <path d="M24 40 h164 v26 l-14 0 q-6 42 -34 46 q-40 6 -84 0 q-26 -4 -32 -40 z" fill="#C9A26A" stroke="#8E6A34" stroke-width="1.6"/>
    <path d="M34 48 q30 -6 60 0" stroke="#E8CB9C" stroke-width="3" opacity=".8"/>
    <path d="M52 40 q4 -8 10 0 M96 40 q4 -8 10 0" stroke="#3F9B4F" stroke-width="1.8"/>
    <path d="M174 66 h146 v20 h-146 z" fill="#8B7355" stroke="#5E4A30" stroke-width="1.5"/>
    <path d="M24 72 q6 36 32 40 q44 6 84 0 q28 -4 34 -46 l146 20 v64 h-296 z" fill="#F29A66" stroke="#C4602E" stroke-width="1.4"/>
    <line x1="24" y1="150" x2="320" y2="150" stroke="#7E3A14" stroke-width="2.2" stroke-dasharray="8 6"/>
    <rect x="24" y="150" width="296" height="46" fill="#E07038" opacity=".85"/>
    <path d="M48 172 q14 -8 28 0 M120 178 q14 -8 28 0 M210 170 q14 -8 28 0 M280 180 q12 -7 24 0" stroke="#FFB98C" stroke-width="2" opacity=".8"/>
    <rect x="24" y="40" width="296" height="156" stroke="#4E4432" stroke-width="1.6"/>
    ${tag(96, 26, "㉠")}
    <path d="M96 37 v10" stroke="#4E5968" stroke-width="1.3"/>
    ${tag(260, 26, "㉡")}
    <path d="M260 37 v33" stroke="#4E5968" stroke-width="1.3"/>
    ${tag(150, 128, "㉢")}
    <path d="M8 40 q-6 2 -6 12 v34 q0 8 -5 10 q5 2 5 10 v34 q0 8 6 10" stroke="#4E5968" stroke-width="1.8" fill="none"/>
    ${tag(14, 130, "㉣")}
  </svg>`;
}

/** 여러 대륙의 옛 빙하 흔적 + 이동 방향 — 실지도(남반구 중심 창) 위 오버레이. 적도선 포함. */
export function geoGlacierMapFig(): string {
  const W = mapWindow({ lon0: -90, lon1: 160, lat0: 30, lat1: -60, x: 8, y: 8, w: 328 });
  const ice = (lon: number, lat: number, rx: number, ry: number): string =>
    `<ellipse cx="${W.px(lon).toFixed(1)}" cy="${W.py(lat).toFixed(1)}" rx="${rx}" ry="${ry}" fill="#A5D8FF" opacity=".82" stroke="#1971C2" stroke-width="1.2"/>`;
  const arr = (lon: number, lat: number, deg: number): string => {
    const x = W.px(lon);
    const y = W.py(lat);
    return `<g transform="rotate(${deg} ${x.toFixed(1)} ${y.toFixed(1)})">
      <line x1="${(x - 12).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + 7).toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,.85)" stroke-width="5.4"/>
      <line x1="${(x - 12).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + 7).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#1971C2" stroke-width="2.8"/>
      <path d="M${(x + 14).toFixed(1)} ${y.toFixed(1)} l-9 -5 v10 z" fill="#1971C2" stroke="rgba(255,255,255,.85)" stroke-width="1"/>
    </g>`;
  };
  const eqY = W.py(0);
  const ly = 8 + W.h + 12;
  return `<svg viewBox="0 0 344 ${Math.round(ly + 16)}" ${NS} fill="none" role="img" aria-label="실제 세계 지도 위에 여러 대륙에 남은 옛 빙하의 흔적과 빙하가 움직인 방향 화살표가 표시되어 있어요. 적도를 나타내는 선도 있어요">
    ${W.open}${W.img}
    <line x1="8" y1="${eqY.toFixed(1)}" x2="336" y2="${eqY.toFixed(1)}" stroke="#FFC078" stroke-width="1.6" stroke-dasharray="7 5"/>
    ${ice(-56, -28, 15, 10)}
    ${ice(24, -29, 16, 10)}
    ${ice(78, 21, 13, 9)}
    ${ice(133, -27, 15, 9)}
    ${arr(-60, -20, -140)}
    ${arr(28, -20, -90)}
    ${arr(80, 28, -70)}
    ${arr(139, -19, -35)}
    ${W.close}
    <rect x="12" y="${(eqY - 9).toFixed(1)}" width="32" height="17" rx="8.5" fill="rgba(255,244,230,.95)" stroke="#F76707" stroke-width="1"/>
    <text x="28" y="${(eqY + 3.5).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#D9480F">적도</text>
    <rect x="16" y="${ly}" width="14" height="10" fill="#A5D8FF" stroke="#1971C2" stroke-width="1"/>
    <text x="36" y="${ly + 9}" font-size="10.5" fill="#4E5968">빙하의 흔적</text>
    <line x1="128" y1="${ly + 5}" x2="146" y2="${ly + 5}" stroke="#1971C2" stroke-width="2.6"/>
    <path d="M152 ${ly + 5} l-8 -4.6 v9.2 z" fill="#1971C2"/>
    <text x="158" y="${ly + 9}" font-size="10.5" fill="#4E5968">빙하가 이동한 방향</text>
  </svg>`;
}


// ── g2u3(빛과 파동) 시험 전용 ──────────────────────────────
// 규칙 계승: 값 읽기 정답 수치는 aria-label 금지(그림 속 조건 값 서술은 동등 접근이라 허용),
// 경로 후보는 전부 같은 색(색이 단서 금지), 라벨형 그림은 정답을 첫 칸에 두지 않게 그림 단계에서 설계.
// 광학 기하는 정확한 계산으로(반사=미러링, 물→공기 굴절=법선에서 멀어짐 — 눈대중 좌표 금지).
// 수치 앵커(레슨 35°·42°·12cm·파장 2m·진폭 20cm·주기 0.5s·50Hz 회피): 시험은 25°·40°·65°·
// 3칸·파장 4m·진폭 15·30cm·주기 0.4s·40Hz 계열로 세팅.

/** 광선 위 진행 방향 화살촉(V자) — lightFigures.rayArrow와 같은 문법(시험 그림 로컬판). */
function lray(x1: number, y1: number, x2: number, y2: number, t: number, color: string, len = 9): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const n = Math.hypot(dx, dy) || 1;
  const ux = dx / n;
  const uy = dy / n;
  const ax = x1 + dx * t;
  const ay = y1 + dy * t;
  const wing = (sign: number): [number, number] => {
    const cos = Math.cos(0.45);
    const sin = Math.sin(0.45) * sign;
    const wx = -ux * cos + uy * sin;
    const wy = -ux * sin - uy * cos;
    return [ax + wx * len, ay + wy * len];
  };
  const [w1x, w1y] = wing(1);
  const [w2x, w2y] = wing(-1);
  return `<path d="M${w1x.toFixed(1)} ${w1y.toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}L${w2x.toFixed(1)} ${w2y.toFixed(1)}" stroke="${color}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
}

/** 반사 각도 그림(파라미터형) — 거울 수평, 입사 광선의 각을 거울 면 기준(mirror) 또는
 *  법선 기준(normal)으로 표시한다. 표시 각은 문항의 조건 값(aria 서술 허용). */
export function lightAngleExamFig(o: { mark: "mirror" | "normal"; deg: number }): string {
  const P = { x: 172, y: 150 };
  const elev = o.mark === "mirror" ? o.deg : 90 - o.deg; // 광선의 거울면 기준 고도각
  const rad = (elev * Math.PI) / 180;
  const L = 124;
  const sx = P.x - Math.cos(rad) * L;
  const sy = P.y - Math.sin(rad) * L;
  const rx = P.x + Math.cos(rad) * L;
  const ry = P.y - Math.sin(rad) * L;
  const arc =
    o.mark === "mirror"
      ? `<path d="M${P.x - 52} 150 A52 52 0 0 1 ${(P.x - Math.cos(rad) * 52).toFixed(1)} ${(P.y - Math.sin(rad) * 52).toFixed(1)}" stroke="#E8961E" stroke-width="2.4" fill="none"/>
         <text x="${P.x - 88}" y="136" font-size="13" font-weight="800" fill="#B26A00">${o.deg}°</text>`
      : `<path d="M${P.x} ${P.y - 54} A54 54 0 0 0 ${(P.x - Math.cos(rad) * 54).toFixed(1)} ${(P.y - Math.sin(rad) * 54).toFixed(1)}" stroke="#E8961E" stroke-width="2.4" fill="none"/>
         <text x="${P.x - 40}" y="${P.y - 62}" font-size="13" font-weight="800" fill="#B26A00">${o.deg}°</text>`;
  return `<svg viewBox="0 0 344 196" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="수평으로 놓인 거울에 빛이 비스듬히 들어와 반사되는 그림. 들어오는 빛이 ${o.mark === "mirror" ? "거울 면" : "법선"}과 이루는 각이 ${o.deg}도로 표시되어 있어요">
    <line x1="30" y1="150" x2="314" y2="150" stroke="#5E6B7E" stroke-width="3.4"/>
    ${Array.from({ length: 14 }, (_, i) => `<line x1="${44 + i * 20}" y1="150" x2="${36 + i * 20}" y2="162" stroke="#B0B8C1" stroke-width="1.6"/>`).join("")}
    <line x1="${P.x}" y1="150" x2="${P.x}" y2="34" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="6 6"/>
    <text x="${P.x + 8}" y="30" font-size="11.5" fill="#8B95A1">법선</text>
    ${arc}
    <path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    <path d="M${P.x} ${P.y}L${rx.toFixed(1)} ${ry.toFixed(1)}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    ${lray(sx, sy, P.x, P.y, 0.55, "#4E5968")}
    ${lray(P.x, P.y, rx, ry, 0.55, "#4E5968")}
    <text x="${(sx - 6).toFixed(1)}" y="${(sy - 8).toFixed(1)}" font-size="11.5" fill="#4E5968">빛</text>
    <text x="292" y="176" font-size="11.5" fill="#8B95A1">거울</text>
  </svg>`;
}

/** 반원 각도기 반사 실험 장치(파라미터형) — 법선이 0°, 거울 면 쪽이 90°(10° 간격 눈금).
 *  입사 광선이 눈금 inc°를 가리킨다(조건 값 — aria 서술 허용). 반사각 읽기 문항용. */
export function lightProtractorFig(o: { inc: number }): string {
  const C = { x: 172, y: 152 };
  const R = 112;
  let ticks = "";
  for (let a = -90; a <= 90; a += 10) {
    const rad = (a * Math.PI) / 180;
    const inner = Math.abs(a) % 30 === 0 ? R - 14 : R - 8;
    ticks += `<line x1="${(C.x + Math.sin(rad) * inner).toFixed(1)}" y1="${(C.y - Math.cos(rad) * inner).toFixed(1)}" x2="${(C.x + Math.sin(rad) * R).toFixed(1)}" y2="${(C.y - Math.cos(rad) * R).toFixed(1)}" stroke="#8B95A1" stroke-width="${Math.abs(a) % 30 === 0 ? 1.8 : 1.1}"/>`;
    if (Math.abs(a) % 30 === 0) {
      const tx = C.x + Math.sin(rad) * (R - 26);
      const ty = C.y - Math.cos(rad) * (R - 26);
      ticks += `<text x="${tx.toFixed(1)}" y="${(ty + 4).toFixed(1)}" text-anchor="middle" font-size="10" fill="#6B7684">${Math.abs(a)}</text>`;
    }
  }
  const rad = (o.inc * Math.PI) / 180;
  const bx = C.x - Math.sin(rad) * (R + 16);
  const by = C.y - Math.cos(rad) * (R + 16);
  const ex = C.x + Math.sin(rad) * (R + 16);
  const ey = C.y - Math.cos(rad) * (R + 16);
  return `<svg viewBox="0 0 344 210" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="반원 각도기의 중심에 거울이 수평으로 놓인 반사 실험 장치. 각도기 눈금은 법선 방향이 0도, 거울 면 쪽이 90도예요. 왼쪽 광원 장치에서 나온 빛이 눈금 ${o.inc}도를 따라 거울 중심에 들어와 오른쪽으로 반사되어 나가요">
    <path d="M${C.x - R} ${C.y} A${R} ${R} 0 0 1 ${C.x + R} ${C.y}" fill="#F7F9FC" stroke="#B0B8C1" stroke-width="2"/>
    ${ticks}
    <line x1="${C.x}" y1="${C.y}" x2="${C.x}" y2="${C.y - R + 2}" stroke="#8B95A1" stroke-width="1.6" stroke-dasharray="5 5"/>
    <rect x="${C.x - 46}" y="${C.y}" width="92" height="10" rx="2" fill="#DCE3EC" stroke="#5E6B7E" stroke-width="2"/>
    <path d="M${bx.toFixed(1)} ${by.toFixed(1)}L${C.x} ${C.y}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    <path d="M${C.x} ${C.y}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    ${lray(bx, by, C.x, C.y, 0.5, "#4E5968")}
    ${lray(C.x, C.y, ex, ey, 0.55, "#4E5968")}
    <g transform="translate(${(bx - 4).toFixed(1)},${(by - 4).toFixed(1)}) rotate(${o.inc})">
      <rect x="-30" y="-11" width="30" height="22" rx="5" fill="#5E6B7E"/>
      <rect x="-2" y="-5" width="6" height="10" rx="2" fill="#37B6D8"/>
    </g>
    <text x="296" y="200" font-size="11.5" fill="#8B95A1">거울</text>
    <text x="46" y="24" font-size="11.5" fill="#8B95A1">광원 장치</text>
  </svg>`;
}

/** 물→공기 굴절 경로 고르기(①~⑤, 전부 같은 색) — 물속 30°(법선 기준) 입사.
 *  ③이 스넬 실제 계산값(sin30×1.33=0.665 → 약 42°, 법선에서 멀어짐), ②는 직진 함정,
 *  ①은 법선 쪽(공기→물 방향과 혼동) 함정, ④는 수면에 붙는 극단, ⑤는 반사 함정. 정답 ③(첫 칸 금지 설계). */
export function lightRefractUpFig(): string {
  const P = { x: 172, y: 100 };
  const cands: [string, number, number, number, number][] = [
    ["①", 200, 14, 0, -4],
    ["②", 222, 14, 8, -4],
    ["③", 249, 14, 10, -2],
    ["④", 312, 49, 10, 6],
    ["⑤", 221, 184, 8, 14],
  ];
  return `<svg viewBox="0 0 344 212" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="물속에서 비스듬히 올라온 빛이 물과 공기의 경계면에 도착한 그림. 경계면을 지난 뒤 빛이 나아갈 경로 후보 다섯 가지가 번호로 표시되어 있어요">
    <rect x="20" y="100" width="304" height="94" rx="8" fill="#EAF3FE"/>
    <line x1="20" y1="100" x2="324" y2="100" stroke="#7FB0E0" stroke-width="2.4"/>
    <text x="30" y="92" font-size="11.5" fill="#8B95A1">공기</text>
    <text x="30" y="120" font-size="11.5" fill="#5E86B4">물</text>
    <line x1="${P.x}" y1="16" x2="${P.x}" y2="190" stroke="#B0B8C1" stroke-width="1.6" stroke-dasharray="5 6"/>
    <path d="M123.5 184L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
    ${lray(123.5, 184, P.x, P.y, 0.55, "#4E5968")}
    ${cands
      .map(
        ([lb, x, y, dx, dy]) =>
          `<path d="M${P.x} ${P.y}L${x} ${y}" stroke="#8B95A1" stroke-width="2" stroke-dasharray="5 5"/>
           <text x="${x + dx}" y="${y + dy}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${lb}</text>`,
      )
      .join("")}
  </svg>`;
}

/** 물체를 보는 경로 그림 — 스탠드(광원)→책 ㉠, 책→눈 ㉡ 화살표. */
export function lightSeePathFig(): string {
  return `<svg viewBox="0 0 344 190" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="책상 위 스탠드와 책, 오른쪽 위 사람 눈이 그려져 있어요. 스탠드에서 책으로 가는 화살표에 기호 ㉠, 책에서 눈으로 가는 화살표에 기호 ㉡이 붙어 있어요">
    <line x1="16" y1="168" x2="328" y2="168" stroke="#B0B8C1" stroke-width="2.4"/>
    <g>
      <path d="M56 166v-84" stroke="#5E6B7E" stroke-width="5" stroke-linecap="round"/>
      <path d="M56 82q30 -14 58 6" stroke="#5E6B7E" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M100 74l26 22-14 18-26-22z" fill="#3C4654"/>
      <circle cx="112" cy="94" r="7" fill="#FFD978"/>
      <rect x="38" y="164" width="36" height="7" rx="3.5" fill="#5E6B7E"/>
    </g>
    <g>
      <path d="M148 168l14-26h44l14 26z" fill="#F9FBFD" stroke="#8B95A1" stroke-width="2"/>
      <path d="M162 142q22 -8 44 0M184 142v26" stroke="#8B95A1" stroke-width="1.8" fill="none"/>
    </g>
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <path d="M282 52q12 -10 28 0q-12 10 -28 0z" fill="#fff"/>
      <circle cx="296" cy="52" r="4.4" fill="#5E86B4" stroke="none"/>
      <path d="M284 42l-4 -5M296 40v-6M308 42l4 -5"/>
    </g>
    <path d="M118 100L172 136" stroke="#F0A422" stroke-width="2.8"/>
    ${lray(118, 100, 172, 136, 0.6, "#F0A422")}
    <path d="M196 134L282 62" stroke="#F0A422" stroke-width="2.8"/>
    ${lray(196, 134, 282, 62, 0.6, "#F0A422")}
    <circle cx="138" cy="112" r="11" fill="#FFF" stroke="#E8961E" stroke-width="1.6"/>
    <text x="138" y="116.5" text-anchor="middle" font-size="12" font-weight="800" fill="#B26A00">㉠</text>
    <circle cx="244" cy="92" r="11" fill="#FFF" stroke="#E8961E" stroke-width="1.6"/>
    <text x="244" y="96.5" text-anchor="middle" font-size="12" font-weight="800" fill="#B26A00">㉡</text>
    <text x="56" y="184" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">스탠드</text>
    <text x="184" y="184" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">책</text>
    <text x="296" y="36" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">눈</text>
  </svg>`;
}

/** 모눈 평면거울 상 위치 고르기 — 물체는 거울에서 3칸, 후보 ①~⑤(정답 ③ = 거울 뒤 3칸).
 *  ①1칸·②2칸·③3칸·④4칸·⑤거울 면 위 — 라벨형 그림, 정답 첫 칸 금지 설계. */
export function lightMirrorGridFig(): string {
  const cell = 24;
  let grid = "";
  for (let c = 0; c <= 12; c++) grid += `<line x1="${28 + c * cell}" y1="24" x2="${28 + c * cell}" y2="192" stroke="#EDF0F4" stroke-width="1.2"/>`;
  for (let r = 0; r <= 7; r++) grid += `<line x1="28" y1="${24 + r * cell}" x2="316" y2="${24 + r * cell}" stroke="#EDF0F4" stroke-width="1.2"/>`;
  const cand = (x: number, t: string): string =>
    `<circle cx="${x}" cy="108" r="12.5" fill="#FFF" stroke="#3182F6" stroke-width="1.8"/><text x="${x}" y="113.5" text-anchor="middle" font-size="16" font-weight="800" fill="#1B64DA">${t}</text>`;
  return `<svg viewBox="0 0 344 216" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="모눈 위에 세로로 선 평면거울과 촛불 모양 물체가 그려져 있어요. 물체는 거울에서 모눈 3칸 떨어져 있고, 상이 생길 위치 후보 다섯 곳에 번호가 붙어 있어요. 번호 1부터 4는 거울 뒤 1칸부터 4칸 위치, 번호 5는 거울 면 위예요">
    ${grid}
    <line x1="172" y1="20" x2="172" y2="196" stroke="#5E6B7E" stroke-width="4"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="176" y1="${28 + i * 19}" x2="185" y2="${20 + i * 19}" stroke="#B0B8C1" stroke-width="1.5"/>`).join("")}
    <g transform="translate(100,108)">
      <path d="M-7 22h14v-24h-14z" fill="#F5C878" stroke="#C08A3E" stroke-width="1.8"/>
      <path d="M0 -12q6 7 0 12q-6 -5 0 -12z" fill="#F0A422"/>
    </g>
    <path d="M100 138h72" stroke="#8B95A1" stroke-width="1.6" stroke-dasharray="4 4"/>
    <path d="M100 133v10M172 133v10" stroke="#8B95A1" stroke-width="1.6"/>
    <text x="136" y="154" text-anchor="middle" font-size="10.5" fill="#6B7684">3칸</text>
    ${cand(196, "①")}${cand(220, "②")}${cand(244, "③")}${cand(268, "④")}${cand(172, "⑤")}
    <text x="152" y="16" text-anchor="end" font-size="11" fill="#8B95A1">평면거울</text>
    <text x="100" y="86" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
  </svg>`;
}

/** 화면 확대 화소 그림(파라미터형) — R/G/B 화소의 켜짐/꺼짐을 문항마다 달리 쓴다. */
export function lightPixelExamFig(o: { on: [boolean, boolean, boolean] }): string {
  const bars: [string, string][] = [
    ["#E5322E", "빨간색"],
    ["#12A84E", "초록색"],
    ["#3A6CFF", "파란색"],
  ];
  const cell = (x: number, y: number): string =>
    bars.map(([c], k) => `<rect x="${x + k * 26}" y="${y}" width="18" height="52" rx="4" fill="${c}" opacity="${o.on[k] ? 1 : 0.24}"/>`).join("");
  const onNames = bars.filter((_, k) => o.on[k]).map(([, n]) => n).join("과 ");
  const offNames = bars.filter((_, k) => !o.on[k]).map(([, n]) => n).join("과 ");
  return `<svg viewBox="0 0 344 190" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="화면 한 부분을 확대한 모습 — ${onNames} 화소는 켜져 있고 ${offNames} 화소는 꺼져 있어요">
    <rect x="42" y="16" width="260" height="150" rx="12" fill="#10161F"/>
    ${[0, 1].flatMap((r) => [0, 2].map((c) => cell(74 + c * 52, 32 + r * 66))).join("")}
    <rect x="42" y="16" width="260" height="150" rx="12" stroke="#8B95A1" stroke-width="2"/>
    <text x="52" y="182" font-size="11" fill="#8B95A1">확대한 모습</text>
  </svg>`;
}

/** 조명 3색 아래 풍선(파라미터형) — 같은 풍선이 빨강/초록/파랑 조명에서 어떻게 보이는지.
 *  seen: 각 조명 아래에서 보이는 색(fill·한글 이름) — 조건 값이라 aria 서술 허용. */
export function lightBalloonFig(o: { seen: { fill: string; name: string }[] }): string {
  const lampColors = ["#E5322E", "#12A84E", "#3A6CFF"];
  const lampNames = ["빨간 조명", "초록 조명", "파란 조명"];
  const one = (i: number): string => {
    const x = 66 + i * 106;
    return `<g transform="translate(${x},0)">
      <circle cx="0" cy="26" r="12" fill="${lampColors[i]}" opacity=".92"/>
      <path d="M-8 34 L-19 74 M8 34 L19 74" stroke="${lampColors[i]}" stroke-width="1.6" opacity=".4"/>
      <ellipse cx="0" cy="94" rx="26" ry="32" fill="${o.seen[i].fill}" stroke="#3C4654" stroke-width="1.8"/>
      <path d="M0 126l-5 8h10z" fill="${o.seen[i].fill}" stroke="#3C4654" stroke-width="1.6"/>
      <path d="M0 134q-6 14 2 26" stroke="#8B95A1" stroke-width="1.6" fill="none"/>
      <text x="0" y="178" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${lampNames[i]}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 190" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="같은 풍선에 빨간 조명, 초록 조명, 파란 조명을 하나씩 비춘 모습이에요. 풍선은 차례대로 ${o.seen.map((s) => s.name).join(", ")}으로 보여요">
    ${[0, 1, 2].map(one).join("")}
  </svg>`;
}

/** 파동 그래프(파라미터형) — 가로 거리(m) 또는 시간(초) 축, 세로 변위 축.
 *  amp·wavelength(가로축 단위 기준)는 반드시 눈금선 위 값으로 세팅한다(num 값 읽기 규칙). */
export function lightWaveGraphFig(o: {
  xMax: number;
  xStep: number;
  yMax: number;
  yStep: number;
  amp: number;
  wavelength: number;
  xLabel: string;
  yLabel: string;
}): string {
  const L = 52;
  const R = 324;
  const T = 24;
  const B = 172;
  const mid = (T + B) / 2;
  const px = (v: number): number => L + ((R - L) * v) / o.xMax;
  const py = (v: number): number => mid - (v / o.yMax) * ((B - T) / 2);
  const fmt = (v: number): string => String(Math.round(v * 1000) / 1000);
  let grid = "";
  for (let x = 0; x <= o.xMax + 1e-9; x += o.xStep) {
    grid += `<line x1="${px(x).toFixed(1)}" y1="${T}" x2="${px(x).toFixed(1)}" y2="${B}" stroke="#EDF0F4" stroke-width="1.1"/>
      <text x="${px(x).toFixed(1)}" y="${B + 16}" text-anchor="middle" font-size="10" fill="#8B95A1">${fmt(x)}</text>`;
  }
  for (let y = -o.yMax; y <= o.yMax + 1e-9; y += o.yStep) {
    grid += `<line x1="${L}" y1="${py(y).toFixed(1)}" x2="${R}" y2="${py(y).toFixed(1)}" stroke="#EDF0F4" stroke-width="1.1"/>
      <text x="${L - 6}" y="${(py(y) + 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="#8B95A1">${fmt(y)}</text>`;
  }
  let d = "";
  for (let x = 0; x <= o.xMax + 1e-9; x += o.xMax / 140) {
    const y = o.amp * Math.sin((2 * Math.PI * x) / o.wavelength);
    d += `${d ? "L" : "M"}${px(x).toFixed(1)} ${py(y).toFixed(1)}`;
  }
  return `<svg viewBox="0 0 344 206" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="가로축이 ${o.xLabel}, 세로축이 ${o.yLabel}인 파동 그래프예요. 눈금을 따라 값을 읽어 보세요">
    ${grid}
    <line x1="${L}" y1="${mid}" x2="${R}" y2="${mid}" stroke="#C4CBD4" stroke-width="1.4"/>
    <line x1="${L}" y1="${T}" x2="${L}" y2="${B}" stroke="#8B95A1" stroke-width="1.6"/>
    <path d="${d}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <text x="10" y="14" font-size="10.5" fill="#4E5968">${o.yLabel}</text>
    <text x="${R}" y="${B + 32}" text-anchor="end" font-size="10.5" fill="#4E5968">${o.xLabel}</text>
  </svg>`;
}

/** 파형 비교 그림(파라미터형) — 같은 시간 동안 기록한 (가)~(라) 파형. 레슨 그림과
 *  배치를 달리 쓰기 위한 시험판. aria는 중립(모양 서술 금지 — 비교가 곧 문항의 과제). */
export function lightWave4Fig(o: { cells: { label: string; amp: number; cyc: number }[] }): string {
  const cell = (x: number, y: number, c: { label: string; amp: number; cyc: number }): string => {
    let d = "";
    for (let i = 0; i <= 116; i += 2) {
      const yy = 40 - Math.sin((i / 116) * Math.PI * 2 * c.cyc) * c.amp;
      d += `${d ? "L" : "M"}${x + 18 + i} ${(y + yy).toFixed(1)}`;
    }
    return `<text x="${x}" y="${y + 12}" font-size="12.5" font-weight="800" fill="#4E5968">${c.label}</text>
      <line x1="${x + 18}" y1="${y + 40}" x2="${x + 134}" y2="${y + 40}" stroke="#E2E6EC" stroke-width="1.2"/>
      <path d="${d}" stroke="#5E6B7E" stroke-width="2.2" fill="none"/>`;
  };
  return `<svg viewBox="0 0 344 190" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="서로 다른 네 소리를 같은 시간 동안 기록한 파형 네 개예요. 파형의 키와 촘촘함을 비교해 보세요">
    ${cell(14, 8, o.cells[0])}
    ${cell(184, 8, o.cells[1])}
    ${cell(14, 100, o.cells[2])}
    ${cell(184, 100, o.cells[3])}
  </svg>`;
}

/** 팬플루트 관 그림 — 길이가 다른 관 여섯에 ㉠㉡㉢ 기호(marks: 관 인덱스 0=가장 긴 관).
 *  기호가 붙는 관을 문항마다 달리 쓴다(레슨 실로폰 ㉠긴~㉢짧 배열 회피). */
export function lightPipesFig(o: { marks: [number, number, number] }): string {
  const pipe = (i: number): string => {
    const x = 58 + i * 40;
    const h = 128 - i * 13;
    return `<rect x="${x}" y="34" width="26" height="${h}" rx="7" fill="#EAF0F6" stroke="#5E6B7E" stroke-width="2"/>
      <ellipse cx="${x + 13}" cy="36" rx="9" ry="3.4" fill="#C9D4E0" stroke="#5E6B7E" stroke-width="1.4"/>`;
  };
  const symbols = ["㉠", "㉡", "㉢"];
  const marks = o.marks
    .map((idx, k) => {
      const cx = 58 + idx * 40 + 13;
      const cy = 34 + (128 - idx * 13) - 16;
      return `<circle cx="${cx}" cy="${cy}" r="10.5" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.6"/>
        <text x="${cx}" y="${cy + 4.5}" text-anchor="middle" font-size="11" font-weight="800" fill="#1B64DA">${symbols[k]}</text>`;
    })
    .join("");
  // aria는 중립 — 기호가 붙은 관의 길이 서열을 말하지 않는다(길이 비교가 곧 문항의 과제, lightWave4Fig와 동일 문법)
  return `<svg viewBox="0 0 344 200" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="길이가 서로 다른 관 여섯 개를 나란히 묶은 악기 그림. 세 관에 ㉠, ㉡, ㉢ 기호가 붙어 있어요 — 기호가 붙은 관의 길이를 비교해 보세요">
    <path d="M48 44 L302 44" stroke="#B0846A" stroke-width="5" stroke-linecap="round" opacity=".55"/>
    ${Array.from({ length: 6 }, (_, i) => pipe(i)).join("")}
    ${marks}
  </svg>`;
}

/* ══════════════ g2u4 물질의 구성 시험 전용 ══════════════ */
// atomFigures 문법 계승(라이트 카드): CPK 색(O 빨강·H 흰·C 짙은 회색·N 파랑·Cl 초록), 원자핵 붉은 공, 전자 파란 (−) 알갱이.
// aria-label에 정오 단서 금지 — 기호(㉠㉡㉢·A~E)가 붙은 알갱이·칸의 정체와 개수, 색소의 전하 부호를 말하지 않는다.

// 라이트 카드용 원자 공 팔레트(atomFigures fourModelFig 계열 + chemKit CPK 대소 관계 유지: H < C·N·O < Cl)
const XEL: Record<string, { fill: string; line: string; r: number }> = {
  H: { fill: "#F4F7FB", line: "#9AA5B4", r: 8 },
  O: { fill: "#E8695A", line: "#A8342A", r: 12 },
  C: { fill: "#6E7887", line: "#3E4654", r: 12 },
  N: { fill: "#5C86D8", line: "#2A5AA0", r: 12 },
  Cl: { fill: "#6CC080", line: "#3E8A54", r: 13 },
};
const xball = (x: number, y: number, el: string): string => {
  const s = XEL[el];
  return `<circle cx="${x}" cy="${y}" r="${s.r}" fill="${s.fill}" stroke="${s.line}" stroke-width="1.4"/>`;
};
const xbond = (x0: number, y0: number, x1: number, y1: number): string =>
  `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#9AA5B4" stroke-width="4" stroke-linecap="round"/>`;
const xnuc = (x: number, y: number, p: number, r = 15): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#E8836B"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.32}" r="${r * 0.32}" fill="#FFC0AE" opacity=".8"/>
   <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#A8442E" stroke-width="1.6"/>
   <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="${r * 0.6}" font-weight="800" fill="#fff">+${p}</text>`;
const xelec = (x: number, y: number, r = 6): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#5A9AE0" stroke="#2A5AA0" stroke-width="1.3"/><line x1="${x - r * 0.45}" y1="${y}" x2="${x + r * 0.45}" y2="${y}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`;

/** 분자 모형(파라미터형) — key: H2·O2·O3·CO·CO2·H2O·NH3·CH4·HCl, label: (가)(나)… 문항마다 조합을 달리 쓴다.
 *  aria는 중립 — 모형이 어떤 분자인지 말하지 않는다(판독이 곧 과제). */
export function atomMolsFig(mols: { key: "H2" | "O2" | "O3" | "CO" | "CO2" | "H2O" | "NH3" | "CH4" | "HCl"; label: string }[]): string {
  const draw = (key: string, cx: number, cy: number): string => {
    switch (key) {
      case "H2": return xbond(cx - 12, cy, cx + 12, cy) + xball(cx - 12, cy, "H") + xball(cx + 12, cy, "H");
      case "O2": return xbond(cx - 15, cy, cx + 15, cy) + xball(cx - 15, cy, "O") + xball(cx + 15, cy, "O");
      case "O3": return xbond(cx, cy - 12, cx - 26, cy + 8) + xbond(cx, cy - 12, cx + 26, cy + 8) + xball(cx, cy - 12, "O") + xball(cx - 26, cy + 8, "O") + xball(cx + 26, cy + 8, "O");
      case "CO": return xbond(cx - 16, cy, cx + 16, cy) + xball(cx - 16, cy, "C") + xball(cx + 16, cy, "O");
      case "CO2": return xbond(cx - 34, cy, cx + 34, cy) + xball(cx - 34, cy, "O") + xball(cx + 34, cy, "O") + xball(cx, cy, "C");
      case "H2O": return xbond(cx, cy - 6, cx - 17, cy + 12) + xbond(cx, cy - 6, cx + 17, cy + 12) + xball(cx - 17, cy + 12, "H") + xball(cx + 17, cy + 12, "H") + xball(cx, cy - 6, "O");
      case "NH3": return xbond(cx, cy - 6, cx - 20, cy + 12) + xbond(cx, cy - 6, cx, cy + 16) + xbond(cx, cy - 6, cx + 20, cy + 12) + xball(cx - 20, cy + 12, "H") + xball(cx, cy + 16, "H") + xball(cx + 20, cy + 12, "H") + xball(cx, cy - 6, "N");
      case "CH4": return xbond(cx, cy, cx, cy - 22) + xbond(cx, cy, cx - 20, cy + 12) + xbond(cx, cy, cx + 20, cy + 12) + xbond(cx, cy, cx, cy + 24) + xball(cx, cy - 22, "H") + xball(cx - 20, cy + 12, "H") + xball(cx + 20, cy + 12, "H") + xball(cx, cy + 24, "H") + xball(cx, cy, "C");
      case "HCl": return xbond(cx - 16, cy + 2, cx + 14, cy) + xball(cx - 16, cy + 2, "H") + xball(cx + 14, cy, "Cl");
      default: return "";
    }
  };
  const n = mols.length;
  const pos: [number, number][] = n === 1 ? [[172, 54]] : n === 2 ? [[94, 58], [250, 58]] : n === 3 ? [[60, 58], [172, 58], [284, 58]] : [[94, 54], [250, 54], [94, 146], [250, 146]];
  const H = n === 1 ? 124 : n <= 3 ? 132 : 222;
  const cells = mols
    .map((m, i) => {
      const [cx, cy] = pos[i];
      const molecule = n === 1
        ? `<g transform="translate(${cx} ${cy}) scale(1.55)">${draw(m.key, 0, 0)}</g>`
        : draw(m.key, cx, cy);
      return molecule + `<text x="${cx}" y="${cy + 56}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${m.label}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 ${H}" ${NS} fill="none" role="img" aria-label="분자 모형 ${mols.map((m) => m.label).join(", ")} — 각 모형을 이루는 공(원자)의 색깔 종류와 개수를 살펴보세요">${cells}</svg>`;
}

/** 원자 구조 ㉠㉡㉢ 판독(파라미터형) — 원자핵 속 밝은 알갱이(양성자)·회색 알갱이(중성자)와 궤도의 전자에
 *  기호만 붙인다. 원자핵 +N 라벨은 일부러 없음(개수 세기·정체 판정이 과제). 기본값은 리튬(3p·4n·3e). */
export function atomStructQuizFig(o: { p: number; n: number; e: number } = { p: 3, n: 4, e: 3 }): string {
  const cx = 172, cy = 100;
  const ring6: [number, number][] = [[0, -14], [12, -7], [12, 7], [0, 14], [-12, 7], [-12, -7]];
  const extra: [number, number][] = [[0, 0], [0, -26], [0, 26]];
  const spots: [number, number][] = [...ring6, ...extra].slice(0, o.p + o.n);
  // 양성자·중성자 배치: 짝수 자리 양성자, 홀수 자리 중성자(모자라면 순서대로)
  const kinds: boolean[] = [];
  let pl = o.p, nl = o.n;
  for (let i = 0; i < spots.length; i++) {
    const wantP = i % 2 === 0;
    if (wantP && pl > 0) { kinds.push(true); pl--; }
    else if (!wantP && nl > 0) { kinds.push(false); nl--; }
    else if (pl > 0) { kinds.push(true); pl--; }
    else { kinds.push(false); nl--; }
  }
  const grainSvg = spots
    .map(([dx, dy], idx) =>
      kinds[idx]
        ? `<circle cx="${cx + dx}" cy="${cy + dy}" r="7.5" fill="#FFB49C" stroke="#C05038" stroke-width="1.5"/><text x="${cx + dx}" y="${cy + dy + 3}" text-anchor="middle" font-size="8" font-weight="900" fill="#8E2B1D">+</text>`
        : `<circle cx="${cx + dx}" cy="${cy + dy}" r="7.5" fill="#C2BBB6" stroke="#7A6E68" stroke-width="1.5"/><text x="${cx + dx}" y="${cy + dy + 3}" text-anchor="middle" font-size="7.5" font-weight="900" fill="#5F5651">0</text>`,
    )
    .join("");
  const eAngles = [-90, 150, 30, -30, -150, 90, 60, -120].slice(0, o.e);
  const ePos = eAngles.map((a) => [cx + 112 * Math.cos((a * Math.PI) / 180), cy + 62 * Math.sin((a * Math.PI) / 180)] as [number, number]);
  const tag = (x: number, y: number, t: string): string =>
    `<circle cx="${x}" cy="${y}" r="11" fill="#FFFFFF" stroke="#5AA2F8" stroke-width="1.6"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">${t}</text>`;
  // ㉠→양성자(첫 밝은 알갱이) ㉡→중성자(첫 회색 알갱이) ㉢→전자(표지에서 가장 가까운 것 —
  // 첫 전자(꼭대기)로 이으면 표선이 그림을 가로질러 ㉡ 선과 X자로 교차한다(눈검수 적발))
  const pIdx = kinds.indexOf(true), nIdx = kinds.indexOf(false);
  const pT: [number, number] = [cx + spots[pIdx][0], cy + spots[pIdx][1]];
  const nT: [number, number] = [cx + spots[nIdx][0], cy + spots[nIdx][1]];
  const eT = ePos.reduce((best, p) => (Math.hypot(p[0] - 310, p[1] - 146) < Math.hypot(best[0] - 310, best[1] - 146) ? p : best), ePos[0]);
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="원자 모형 — 가운데 덩어리(원자핵) 속에 밝은 알갱이와 회색 알갱이가 섞여 있고, 주위 점선 궤도에 작은 알갱이들이 있어요. 세 종류의 알갱이에 ㉠, ㉡, ㉢ 기호가 붙어 있어요">
    <ellipse cx="${cx}" cy="${cy}" rx="112" ry="62" stroke="#C9D2DC" stroke-width="1.6" stroke-dasharray="5 6"/>
    <circle cx="${cx}" cy="${cy}" r="30" fill="#F6E3DC" stroke="#D8A08C" stroke-width="1.6"/>
    ${grainSvg}
    ${ePos.map(([x, y]) => xelec(x, y, 6.5)).join("")}
    <line x1="66" y1="42" x2="${pT[0] - 6}" y2="${pT[1] - 6}" stroke="#8B95A1" stroke-width="1.4"/>
    ${tag(56, 36, "㉠")}
    <line x1="286" y1="42" x2="${nT[0] + 6}" y2="${nT[1] - 5}" stroke="#8B95A1" stroke-width="1.4"/>
    ${tag(296, 36, "㉡")}
    <line x1="300" y1="140" x2="${eT[0] + 7}" y2="${eT[1] + 3}" stroke="#8B95A1" stroke-width="1.4"/>
    ${tag(310, 146, "㉢")}
  </svg>`;
}

/** 주기율표 뼈대 + 위치 표시(파라미터형) — 1~3주기 단축형(1·2·13~18족). cells에 넣은 칸만
 *  라벨(A~E·㉠㉡·원소 기호)이 찍힌다. aria는 위치를 말하지 않는다(위치 읽기가 과제). */
export function atomPeriodicExamFig(o: { cells: { g: number; period: number; t: string; tone?: "blue" | "amber" }[] }): string {
  const gIdx = (g: number): number => (g <= 2 ? g - 1 : g - 11);
  const bx = (g: number): number => 34 + gIdx(g) * 34;
  const by = (period: number): number => 30 + (period - 1) * 40;
  const skeleton: string[] = [];
  const valid: [number, number][] = [[1, 1], [18, 1]];
  for (const g of [1, 2, 13, 14, 15, 16, 17, 18]) { valid.push([g, 2], [g, 3]); }
  for (const [g, p] of valid) {
    skeleton.push(`<rect x="${bx(g)}" y="${by(p)}" width="30" height="36" rx="5" fill="#F7F9FC" stroke="#C4CCD6" stroke-width="1.3"/>`);
  }
  const marks = o.cells
    .map((c) => {
      const tint = c.tone === "amber" ? ["#FFF4E0", "#F0A422", "#C77800"] : ["#EEF4FF", "#3182F6", "#1B64DA"];
      return `<rect x="${bx(c.g)}" y="${by(c.period)}" width="30" height="36" rx="5" fill="${tint[0]}" stroke="${tint[1]}" stroke-width="1.6"/>
        <text x="${bx(c.g) + 15}" y="${by(c.period) + 24}" text-anchor="middle" font-size="${c.t.length > 1 ? 12 : 14}" font-weight="800" fill="${tint[2]}">${c.t}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="주기율표 일부(1~3주기, 1·2·13~18족 칸만 있는 단축형) — 몇 개의 칸에 기호가 적혀 있어요. 각 기호가 놓인 세로줄과 가로줄 위치를 살펴보세요">
    ${["1", "2", "13", "14", "15", "16", "17", "18"].map((g, i) => `<text x="${49 + i * 34}" y="22" text-anchor="middle" font-size="9.5" fill="#8B95A1">${g}족</text>`).join("")}
    <text x="16" y="52" font-size="9.5" fill="#8B95A1">1</text><text x="16" y="92" font-size="9.5" fill="#8B95A1">2</text><text x="16" y="132" font-size="9.5" fill="#8B95A1">3</text>
    <text x="14" y="176" font-size="9" fill="#B0B8C1">주기</text>
    ${skeleton.join("")}
    ${marks}
  </svg>`;
}

/** 주기율표 한 칸 확대 ㉠㉡㉢ — 칸 속 세 자리(위 숫자·가운데 기호·아래 이름)의 뜻을 묻는 문항용.
 *  cellAnatomyFig(개념용)와 달리 정답 라벨을 전부 감춘 시험판. */
export function atomCellQuizFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="수소의 주기율표 한 칸을 확대한 그림 — 위 왼쪽의 원자 번호 1을 ㉠이, 가운데 원소 기호 H를 ㉡이 가리켜요">
    <rect x="130" y="24" width="96" height="132" rx="10" fill="#F0F4F9"/>
    <rect x="124" y="18" width="96" height="132" rx="10" fill="#FAFCFF" stroke="#B8C2CE" stroke-width="1.6"/>
    <text x="138" y="42" font-size="16" font-weight="800" fill="#C43A2E">1</text>
    <text x="172" y="98" text-anchor="middle" font-family="Georgia, serif" font-size="44" font-weight="800" fill="#2E5AA8">H</text>
    <text x="172" y="132" text-anchor="middle" font-size="14" font-weight="800" fill="#0B8A5E">수소</text>
    <line x1="105" y1="38" x2="134" y2="38" stroke="#C43A2E" stroke-width="1.6"/>
    <circle cx="94" cy="38" r="11" fill="#FFF" stroke="#E2695F" stroke-width="1.6"/>
    <text x="94" y="42.5" text-anchor="middle" font-size="12" font-weight="800" fill="#C43A2E">㉠</text>
    <line x1="239" y1="82" x2="197" y2="82" stroke="#2E5AA8" stroke-width="1.6"/>
    <circle cx="250" cy="82" r="11" fill="#FFF" stroke="#5AA2F8" stroke-width="1.6"/>
    <text x="250" y="86.5" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">㉡</text>
    <text x="172" y="176" text-anchor="middle" font-size="11" fill="#8B95A1">주기율표의 한 칸</text>
  </svg>`;
}

/** 물질 분류 순서도(파라미터형) — 질문 1이 예/아니요로 갈라지고, 양쪽 각각 질문 2로 다시 갈라져
 *  (가)~(라) 네 결론 칸이 전부 분리된다(한 칸 수렴 금지 — u3 저작 함정 ④). */
export function atomFlowFig(o: { start: string; q1: string; q2: string }): string {
  const result = (cx: number, label: string): string =>
    `<rect x="${cx - 32}" y="186" width="64" height="34" rx="10" fill="#F8FAFC" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 4"/>
     <text x="${cx}" y="208" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">${label}</text>`;
  const yes = (x: number, y: number): string => `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" font-weight="800" fill="#0CA678">예</text>`;
  const no = (x: number, y: number): string => `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" font-weight="800" fill="#8B95A1">아니요</text>`;
  const arrow = (x0: number, y0: number, x1: number, y1: number): string => {
    const a = Math.atan2(y1 - y0, x1 - x0);
    const deg = (a * 180) / Math.PI + 90;
    return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#8B95A1" stroke-width="1.7"/>
      <path d="M${x1} ${y1 + 1} l-4.5 -8 h9 z" fill="#8B95A1" transform="rotate(${deg} ${x1} ${y1})"/>`;
  };
  return `<svg viewBox="0 0 344 232" ${NS} fill="none" role="img" aria-label="물질 분류 순서도 — 시작 상자의 물질들을 질문 두 개로 차례로 갈라 (가), (나), (다), (라) 네 칸으로 나눠요. 두 질문의 예와 아니요가 각각 다른 칸으로 이어져요">
    <rect x="62" y="8" width="220" height="30" rx="15" fill="#F2F4F6" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="172" y="27" text-anchor="middle" font-size="11.5" font-weight="800" fill="#333D4B">${o.start}</text>
    <line x1="172" y1="38" x2="172" y2="50" stroke="#8B95A1" stroke-width="1.7"/>
    <rect x="62" y="52" width="220" height="34" rx="11" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="172" y="73" text-anchor="middle" font-size="11" font-weight="700" fill="#1B64DA">${o.q1}</text>
    ${arrow(150, 86, 92, 120)}${yes(106, 104)}
    ${arrow(194, 86, 252, 120)}${no(242, 104)}
    <rect x="17" y="122" width="150" height="32" rx="10" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.4"/>
    <text x="92" y="142" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1B64DA">${o.q2}</text>
    <rect x="177" y="122" width="150" height="32" rx="10" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.4"/>
    <text x="252" y="142" text-anchor="middle" font-size="10.5" font-weight="700" fill="#1B64DA">${o.q2}</text>
    ${arrow(74, 154, 52, 184)}${yes(52, 172)}
    ${arrow(110, 154, 132, 184)}${no(140, 172)}
    ${arrow(234, 154, 212, 184)}${yes(212, 172)}
    ${arrow(270, 154, 292, 184)}${no(300, 172)}
    ${result(52, "(가)")}${result(132, "(나)")}${result(212, "(다)")}${result(292, "(라)")}
  </svg>`;
}

/** 물에 전류를 흘려 분해하는 장치 · (가) 시험관은 전원 (−)극 쪽, (나)는 (+)극 쪽. 모인 기체는 (가)가 더 많다.
 *  aria는 장치·연결만 말하고 기체의 정체와 부피 비율 수치는 말하지 않는다(해석이 과제). */
export function atomElectrolysisFig(): string {
  const tube = (x: number, gasH: number, label: string): string => `
    <rect x="${x}" y="36" width="44" height="134" rx="10" fill="#EAF3FC" stroke="#8B99AC" stroke-width="2"/>
    <rect x="${x + 3}" y="40" width="38" height="${gasH}" rx="7" fill="#FDFEFF"/>
    <rect x="${x + 3}" y="${40 + gasH}" width="38" height="${126 - gasH}" fill="#C9DFF6"/>
    <text x="${x + 22}" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${label}</text>
    ${[0, 1, 2, 3].map((i) => `<circle cx="${x + 12 + (i % 2) * 20}" cy="${152 - i * 9}" r="${1.6 + (i % 2) * 0.6}" fill="#AACCEE"/>`).join("")}`;
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="물에 전류를 흘려 분해하는 장치 · 물이 든 용기에 전극 두 개가 있고 그 위에 시험관 (가)와 (나)가 거꾸로 세워져 있어요. (가)는 전원의 (−)극과, (나)는 (+)극과 연결되어 있어요. 두 시험관에 모인 기체의 양을 비교해 보세요">
    <rect x="52" y="84" width="240" height="106" rx="10" fill="#EAF3FC" stroke="#9FB6CE" stroke-width="1.8"/>
    <rect x="56" y="98" width="232" height="88" rx="7" fill="#D8E9FA"/>
    ${tube(96, 78, "(가)")}
    ${tube(204, 39, "(나)")}
    <rect x="112" y="148" width="12" height="34" rx="3" fill="#7A8797"/>
    <rect x="220" y="148" width="12" height="34" rx="3" fill="#7A8797"/>
    <path d="M118 182 V212 H150" stroke="#6B7684" stroke-width="2" fill="none"/>
    <path d="M226 182 V212 H194" stroke="#6B7684" stroke-width="2" fill="none"/>
    <rect x="150" y="202" width="44" height="20" rx="6" fill="#F2F4F6" stroke="#8B95A1" stroke-width="1.5"/>
    <rect x="150" y="202" width="20" height="20" rx="6" fill="#5A88D8"/>
    <text x="160" y="216" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">−</text>
    <text x="184" y="216" text-anchor="middle" font-size="12" font-weight="800" fill="#C43A2E">+</text>
  </svg>`;
}

/** 이온 이동(전기영동) 번짐 상태(파라미터형) — 거름종이 가운데 색 점이 한쪽 극으로 번진 모습.
 *  hex: 색소 색, dir: 번진 방향, leftSign: 왼쪽 전극 부호. aria는 관찰 사실(방향·극 배치)만 말한다. */
export function atomIonMoveExamFig(o: { hex: string; dir: "left" | "right"; leftSign: "+" | "−" }): string {
  const rightSign = o.leftSign === "+" ? "−" : "+";
  const poleFill = (s: string): string => (s === "+" ? "#F0685A" : "#5A88D8");
  const smearCx = o.dir === "left" ? 132 : 212;
  const smearCx2 = o.dir === "left" ? 104 : 240;
  return `<svg viewBox="0 0 344 150" ${NS} fill="none" role="img" aria-label="거름종이 양 끝에 전극이 있고 왼쪽이 (${o.leftSign})극, 오른쪽이 (${rightSign})극이에요. 가운데 떨어뜨린 색 얼룩이 ${o.dir === "left" ? "왼쪽" : "오른쪽"} 전극 쪽으로 번져 있어요">
    <rect x="40" y="50" width="264" height="60" rx="8" fill="#EFF3F7"/>
    <rect x="52" y="58" width="240" height="44" rx="6" fill="#FBFCFE" stroke="#C4CAD2" stroke-width="1.5"/>
    <rect x="32" y="52" width="18" height="56" rx="4" fill="#8B99AC"/>
    <rect x="294" y="52" width="18" height="56" rx="4" fill="#8B99AC"/>
    <path d="M41 52 V30" stroke="#6B7684" stroke-width="2"/>
    <path d="M303 52 V30" stroke="#6B7684" stroke-width="2"/>
    <circle cx="41" cy="22" r="10" fill="${poleFill(o.leftSign)}"/>
    <text x="41" y="26.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${o.leftSign}</text>
    <circle cx="303" cy="22" r="10" fill="${poleFill(rightSign)}"/>
    <text x="303" y="26.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${rightSign}</text>
    <circle cx="172" cy="80" r="9" fill="${o.hex}" opacity=".28"/>
    <ellipse cx="${smearCx}" cy="80" rx="34" ry="12" fill="${o.hex}" opacity=".55"/>
    <ellipse cx="${smearCx2}" cy="80" rx="18" ry="9" fill="${o.hex}" opacity=".85"/>
    <text x="172" y="134" text-anchor="middle" font-size="10.5" fill="#8B95A1">처음 떨어뜨린 자리는 가운데(희미한 자국)</text>
  </svg>`;
}

/** 이온 조성 원그래프(파라미터형) — slices: 라벨·백분율·색(hide면 범례 %를 ㉠로 감춤 — num 산수용).
 *  aria는 숨긴 조각의 값을 말하지 않는다. */
export function atomPieFig(o: { slices: { label: string; pct: number; hex: string; hide?: boolean }[] }): string {
  const cx = 96, cy = 84, r = 62;
  let acc = -90;
  const paths = o.slices
    .map((s) => {
      const a0 = (acc * Math.PI) / 180;
      acc += s.pct * 3.6;
      const a1 = (acc * Math.PI) / 180;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const large = s.pct > 50 ? 1 : 0;
      return `<path d="M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${s.hex}" stroke="#fff" stroke-width="1.6"/>`;
    })
    .join("");
  const legend = o.slices
    .map((s, i) => {
      const y = 28 + i * 25;
      return `<rect x="188" y="${y - 10}" width="13" height="13" rx="3.5" fill="${s.hex}"/>
        <text x="208" y="${y + 1}" font-size="11.5" font-weight="700" fill="#333D4B">${s.label}</text>
        <text x="330" y="${y + 1}" text-anchor="end" font-size="11.5" font-weight="800" fill="${s.hide ? "#C43A2E" : "#4E5968"}">${s.hide ? "㉠ %" : `${s.pct} %`}</text>`;
    })
    .join("");
  const spoken = o.slices.map((s) => (s.hide ? `${s.label} ㉠ 퍼센트` : `${s.label} ${s.pct} 퍼센트`)).join(", ");
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="이온 조성 원그래프 — ${spoken}">
    ${paths}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#DCE0E6" stroke-width="1.4"/>
    ${legend}
  </svg>`;
}

/** 전기 전도 실험(파라미터형) — 액체마다 전극·전구를 꽂은 비커, on이면 전구가 켜진다.
 *  결과 해석 문항 전용(관찰 결과가 전제) — 예측 문항에는 붙이지 않는다. */
export function atomCondFig(o: { cups: { label: string; on: boolean }[] }): string {
  const n = o.cups.length;
  const cell = 344 / n;
  const cups = o.cups
    .map((c, i) => {
      const cx = cell * i + cell / 2;
      const bulb = c.on
        ? `<circle cx="${cx}" cy="46" r="13" fill="#FFD84A" stroke="#E0A420" stroke-width="1.8"/>
           ${[-50, -18, 18, 50].map((d) => { const a = ((d - 90) * Math.PI) / 180; return `<line x1="${(cx + 16 * Math.cos(a)).toFixed(1)}" y1="${(46 + 16 * Math.sin(a)).toFixed(1)}" x2="${(cx + 23 * Math.cos(a)).toFixed(1)}" y2="${(46 + 23 * Math.sin(a)).toFixed(1)}" stroke="#F0B428" stroke-width="2.2" stroke-linecap="round"/>`; }).join("")}`
        : `<circle cx="${cx}" cy="46" r="13" fill="#E8EBF0" stroke="#B0B8C1" stroke-width="1.8"/>`;
      return `
        <rect x="${cx - 40}" y="100" width="80" height="74" rx="8" fill="#EAF3FC" stroke="#9FB6CE" stroke-width="1.8"/>
        <rect x="${cx - 36}" y="114" width="72" height="56" rx="6" fill="#D8E9FA"/>
        <rect x="${cx - 17}" y="88" width="7" height="60" rx="2.5" fill="#8B99AC"/>
        <rect x="${cx + 10}" y="88" width="7" height="60" rx="2.5" fill="#8B99AC"/>
        <path d="M${cx - 13.5} 88 V64 Q${cx - 13.5} 58 ${cx - 8} 58 H${cx - 6}M${cx + 13.5} 88 V64 Q${cx + 13.5} 58 ${cx + 8} 58 H${cx + 6}" stroke="#6B7684" stroke-width="1.8" fill="none"/>
        ${bulb}
        <text x="${cx}" y="196" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${c.label}</text>`;
    })
    .join("");
  const spoken = o.cups.map((c) => `${c.label}의 전구는 ${c.on ? "켜졌어요" : "켜지지 않았어요"}`).join(", ");
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="전극과 전구를 꽂은 비커 실험 — ${spoken}">${cups}</svg>`;
}

/** 이온 생성 전·후 모형(파라미터형) — 왼쪽 중성 원자(양성자 p·전자 p), 오른쪽 이온(전자 after).
 *  tell이면 화살표 위에 '전자 n개 잃음/얻음'을 적는다(결과 묻기용). 없으면 개수 비교가 과제. */
export function atomIonFormExamFig(o: { p: number; after: number; tell?: boolean }): string {
  const ring = (cx: number, cy: number, cnt: number, rx: number, ry: number): string =>
    Array.from({ length: cnt }, (_, i) => {
      const th = (Math.PI * 2 * i) / cnt - Math.PI / 2;
      return xelec(Math.round(cx + rx * Math.cos(th)), Math.round(cy + ry * Math.sin(th)), 6);
    }).join("");
  const diff = o.after - o.p;
  const text = o.tell ? `<text x="172" y="44" text-anchor="middle" font-size="10.5" font-weight="700" fill="${diff < 0 ? "#F04452" : "#3182F6"}">전자 ${Math.abs(diff)}개 ${diff < 0 ? "잃음" : "얻음"}</text>` : "";
  return `<svg viewBox="0 0 344 130" ${NS} fill="none" role="img" aria-label="원자가 이온으로 변하는 모형 — 왼쪽은 변하기 전 원자, 오른쪽은 변한 뒤의 입자예요. 원자핵의 숫자와 주위 알갱이 개수를 비교해 보세요">
    ${xnuc(80, 66, o.p, 15)}${ring(80, 66, o.p, 36, 26)}
    <path d="M140 66h56M188 60l8 6-8 6" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
    ${text}
    ${xnuc(258, 66, o.p, 15)}${ring(258, 66, o.after, 38, 28)}
    <text x="80" y="122" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">변하기 전</text>
    <text x="258" y="122" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">변한 후</text>
  </svg>`;
}

// ── g2u7(전기와 자기) 시험 전용 ──────────────────────────────
// 전하 알갱이는 elecFigures 톤((+) 붉은 원·(−) 파란 원)과 동조. 전류 화살표는 볼트 옐로+진갈색 테두리.
// aria는 전부 중립 — 판독·계산 과제의 답(부호·수치·힘 방향)을 낭독하지 않는다.

const eplus = (x: number, y: number, r = 6.5): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#E8836B" stroke="#A8442E" stroke-width="1.2"/><path d="M${x - r * 0.45} ${y}h${r * 0.9}M${x} ${y - r * 0.45}v${r * 0.9}" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"/>`;
const eminus = (x: number, y: number, r = 6.5): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#5A9AE0" stroke="#2A5AA0" stroke-width="1.2"/><path d="M${x - r * 0.45} ${y}h${r * 0.9}" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"/>`;
const ebattery = (x: number, y: number, w = 84, h = 26, flip = false): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#AEBDD6" stroke="#4E5A70" stroke-width="1.8"/>
   <text x="${x + w * 0.26}" y="${y + h * 0.68}" font-size="${h * 0.55}" font-weight="800" fill="#333D4B">${flip ? "−" : "+"}</text>
   <text x="${x + w * 0.68}" y="${y + h * 0.68}" font-size="${h * 0.55}" font-weight="800" fill="#333D4B">${flip ? "+" : "−"}</text>`;
const ebulb = (x: number, y: number, r = 14): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF3C4" stroke="#C8A23E" stroke-width="1.8"/>
   <path d="M${x - r * 0.45} ${y + r * 0.25}q${r * 0.22}-${r * 0.5} ${r * 0.45}-${r * 0.07}t${r * 0.45}-${r * 0.07}" stroke="#E8963E" stroke-width="1.7" fill="none"/>`;

/** 마찰 전/후 전하 분포 모형 · v2 확대판(헝겊 폭 128·깊이 54, moved 3 = 9알갱이 수용 · 파일럿 검수 반영).
 *  (가) 막대 = 전자를 잃는 쪽 · (나) 헝겊 = 얻는 쪽 · 시작은 (+)3·(−)3 중성. */
export function elecRubExamFig(o: { moved: number }): string {
  const rod = (x: number, y: number): string =>
    `<rect x="${x - 62}" y="${y - 18}" width="124" height="34" rx="15" fill="#C8DCEC" stroke="#7A94AC" stroke-width="1.8"/>
     <path d="M${x - 48} ${y - 10}h34" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  const cloth = (x: number, y: number): string =>
    `<path d="M${x - 64} ${y - 21}q14 -8 32 0t32 0t32 0t32 0v54q-14 8 -32 0t-32 0t-32 0t-32 0z" fill="#E8C9A0" stroke="#A87A44" stroke-width="1.8"/>
     ${[0, 1, 2].map((i) => `<path d="M${x - 34 + i * 34} ${y - 12}v38" stroke="#C79A66" stroke-width="1.2"/>`).join("")}`;
  const charges = (x: number, y: number, p: number, m: number): string => {
    const both = [...Array.from({ length: p }, () => "p"), ...Array.from({ length: m }, () => "m")];
    return both
      .map((k, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const cx = x - 39 + col * 26;
        const cy = y - 8 + row * 15;
        return k === "p" ? g7p(cx, cy) : g7m(cx, cy);
      })
      .join("");
  };
  const P = 3;
  const M0 = 3;
  return `<svg viewBox="0 0 344 248" ${NS} fill="none" role="img" aria-label="서로 다른 두 물체 (가)와 (나)를 마찰하기 전과 후의 전하 분포 모형 · 알갱이의 종류와 개수를 비교해 읽어요">
    <text x="30" y="40" font-size="12" font-weight="800" fill="#4E5968">마찰 전</text>
    ${rod(120, 64)}${charges(120, 64, P, M0)}
    ${cloth(258, 64)}${charges(258, 64, P, M0)}
    <text x="120" y="22" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
    <text x="258" y="22" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
    <path d="M172 110v18M167 122l5 7 5-7" stroke="#8B95A1" stroke-width="2" fill="none"/>
    <text x="30" y="166" font-size="12" font-weight="800" fill="#4E5968">마찰 후</text>
    ${rod(120, 190)}${charges(120, 190, P, M0 - o.moved)}
    ${cloth(258, 190)}${charges(258, 190, P, M0 + o.moved)}
  </svg>`;
}
/** 대전 막대 × 눕힌 깡통 정전기 유도(시험판) — 레슨 그림과 좌우·부호·라벨 전부 교체:
 *  막대가 오른쪽에서 접근, 기본 (−)대전. ㉠=막대와 가까운 쪽(오른쪽), ㉡=먼 쪽(왼쪽). */
export function elecCanExamFig(o?: { pol?: "+" | "-" }): string {
  const pol = o?.pol ?? "-";
  const sign = pol === "-" ? eminus : eplus;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="대전된 플라스틱 막대를 눕힌 알루미늄 깡통의 오른쪽에서 가까이 가져가는 그림 — ㉠은 막대와 가까운 쪽, ㉡은 먼 쪽">
    <line x1="20" y1="158" x2="324" y2="158" stroke="#C9D2DC" stroke-width="2"/>
    <g>
      <rect x="46" y="88" width="128" height="66" rx="33" fill="#D8E2EE" stroke="#8B99AC" stroke-width="2"/>
      <ellipse cx="168" cy="121" rx="12" ry="33" fill="#B8C6D8" stroke="#8B99AC" stroke-width="1.6"/>
      <text x="104" y="80" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">알루미늄 깡통</text>
      <text x="66" y="127" font-size="14" font-weight="800" fill="#4E5968">㉡</text>
      <text x="140" y="127" font-size="14" font-weight="800" fill="#4E5968">㉠</text>
    </g>
    <g transform="rotate(28 254 74)">
      <rect x="204" y="64" width="104" height="17" rx="8" fill="#D9C9EC" stroke="#8F78AC" stroke-width="1.6"/>
      <path d="M214 68h32" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>
      ${sign(224, 72.5, 6)}${sign(248, 72.5, 6)}${sign(272, 72.5, 6)}${sign(292, 72.5, 6)}
    </g>
    <text x="252" y="34" font-size="11.5" font-weight="700" fill="#4E5968">(${pol})대전 막대</text>
    <path d="M196 120q10 8 0 16" stroke="#F0A422" stroke-width="2" fill="none"/>
    <text x="172" y="180" text-anchor="middle" font-size="11" fill="#8B95A1">깡통은 잘 구르도록 눕혀 두었어요</text>
  </svg>`;
}

/** 검전기(자기완결 문항용) — 금속판·금속박 구조 라벨 + 대전체 접근. 금속박은 접근 전 닫힌 상태. */
export function elecScopeFig(): string {
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="금속판과 금속박으로 이루어진 검전기에 대전된 막대를 가까이 가져가는 그림 — 금속박은 아직 닫혀 있다">
    <g transform="rotate(24 234 46)">
      <rect x="188" y="38" width="96" height="16" rx="8" fill="#C8DCEC" stroke="#7A94AC" stroke-width="1.6"/>
      ${eminus(206, 46, 5.5)}${eminus(228, 46, 5.5)}${eminus(250, 46, 5.5)}${eminus(268, 46, 5.5)}
    </g>
    <text x="266" y="22" font-size="11.5" font-weight="700" fill="#4E5968">(−)대전 막대</text>
    <ellipse cx="150" cy="64" rx="34" ry="9" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.8"/>
    <rect x="146" y="70" width="8" height="52" fill="#B7C2CE" stroke="#8C99A8" stroke-width="1.4"/>
    <path d="M96 116h108a10 10 0 0 1 10 10v52a10 10 0 0 1-10 10H96a10 10 0 0 1-10-10v-52a10 10 0 0 1 10-10z" fill="rgba(224,238,250,.35)" stroke="#9DAABD" stroke-width="2.2"/>
    <path d="M150 122l-7 42M150 122l7 42" stroke="#D9B44A" stroke-width="3.4" stroke-linecap="round"/>
    <text x="52" y="66" text-anchor="end" font-size="11.5" font-weight="700" fill="#4E5968">금속판</text>
    <path d="M56 62h56" stroke="#C4CAD2" stroke-width="1.3"/>
    <text x="52" y="150" text-anchor="end" font-size="11.5" font-weight="700" fill="#4E5968">금속박</text>
    <path d="M56 146h84" stroke="#C4CAD2" stroke-width="1.3"/>
  </svg>`;
}

/** 전압-전류 그래프(파라미터형) — lines: 저항 r(Ω)의 원점 직선(I(mA) = V/r×1000).
 *  dots는 점만 표시(가이드 점선 금지 — 값 읽기 과제 보존, g2u2 관행). 눈금은 vStep·iStep. */
export function elecViExamFig(o: {
  lines: { label: string; r: number }[];
  vMax: number;
  vStep: number;
  iMax: number;
  iStep: number;
  dots?: [number, number][];
}): string {
  const gx = (v: number): number => 52 + v * (264 / o.vMax);
  const gy = (ma: number): number => 178 - (ma / o.iMax) * 150;
  let grid = "";
  for (let v = o.vStep; v <= o.vMax; v += o.vStep)
    grid += `<line x1="${gx(v)}" y1="178" x2="${gx(v)}" y2="26" stroke="#EDF0F4" stroke-width="1"/><text x="${gx(v)}" y="194" text-anchor="middle" font-size="10.5" fill="#8B95A1">${v}</text>`;
  for (let ma = o.iStep; ma <= o.iMax; ma += o.iStep)
    grid += `<line x1="52" y1="${gy(ma)}" x2="320" y2="${gy(ma)}" stroke="#EDF0F4" stroke-width="1"/><text x="46" y="${gy(ma) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${ma}</text>`;
  const lines = o.lines
    .map((l) => {
      const iEndMa = Math.min(o.iMax, (o.vMax / l.r) * 1000);
      const vEnd = (iEndMa / 1000) * l.r;
      return `<line x1="${gx(0)}" y1="${gy(0)}" x2="${gx(vEnd)}" y2="${gy(iEndMa)}" stroke="#3182F6" stroke-width="2.6" stroke-linecap="round"/>
      <text x="${gx(vEnd) + (vEnd >= o.vMax ? -4 : 6)}" y="${gy(iEndMa) - 8}" text-anchor="${vEnd >= o.vMax ? "end" : "start"}" font-size="12" font-weight="800" fill="#2E5AA8">${l.label}</text>`;
    })
    .join("");
  const dots = (o.dots ?? []).map(([v, ma]) => `<circle cx="${gx(v)}" cy="${gy(ma)}" r="4.5" fill="#E8636B"/>`).join("");
  return `<svg viewBox="0 0 344 214" ${NS} fill="none" role="img" aria-label="니크롬선에 걸어 준 전압에 따른 전류의 세기 그래프 — 축의 눈금 숫자로 값을 읽어요">
    ${grid}
    <line x1="52" y1="26" x2="52" y2="178" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="178" x2="320" y2="178" stroke="#B0B8C1" stroke-width="1.6"/>
    ${lines}${dots}
    <text x="14" y="16" font-size="11" font-weight="700" fill="#4E5968">전류(mA)</text>
    <text x="334" y="210" text-anchor="end" font-size="11" font-weight="700" fill="#4E5968">전압(V)</text>
  </svg>`;
}

/** 전압-전류 그래프 모양 고르기 ①~⑤ — 정답(원점 직선)은 ②에 배치, ①은 원점을 지나지 않는 함정
 *  (라벨형 그림의 정답 위치 설계 — u6 gasTvChoicesFig 관행). shuffle:false 전용. */
export function elecViChoicesFig(): string {
  const cell = (x: number, num: string, path: string): string =>
    `<g transform="translate(${x} 0)">
      <rect x="4" y="18" width="58" height="58" rx="8" fill="#F7F9FC" stroke="#D9DFE6" stroke-width="1.4"/>
      <text x="33" y="13" text-anchor="middle" font-size="12" font-weight="800" fill="#4E5968">${num}</text>
      <line x1="12" y1="68" x2="12" y2="24" stroke="#B0B8C1" stroke-width="1.3"/>
      <line x1="12" y1="68" x2="58" y2="68" stroke="#B0B8C1" stroke-width="1.3"/>
      <path d="${path}" stroke="#3182F6" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>`;
  return `<svg viewBox="0 0 344 96" ${NS} fill="none" role="img" aria-label="전압에 따른 전류 그래프의 모양 다섯 가지 — 번호 ①부터 ⑤ 중에서 골라요">
    ${cell(2, "①", "M12 46 L54 26")}
    ${cell(70, "②", "M12 68 L54 28")}
    ${cell(138, "③", "M12 64 Q20 34 54 30")}
    ${cell(206, "④", "M12 40 H54")}
    ${cell(274, "⑤", "M12 30 L54 62")}
  </svg>`;
}

/** 전지 1개에 전구 1개(가) vs 전구 2개(나) 비교 회로 — right로 (나)의 연결(직렬/병렬)을 정한다.
 *  전구 저항은 모두 같다는 전제의 밝기·전류 비교 문항용. */
export function elecTwoCircuitFig(o: { right: "series" | "parallel" }): string {
  const left = `
    <path d="M72 150H46V56h100v94h-24" stroke="#8B95A1" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    ${ebulb(96, 56, 13)}
    ${ebattery(72, 138, 50, 22)}
    <text x="96" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>`;
  const right =
    o.right === "series"
      ? `
    <path d="M228 150h-30V56h112v94h-30" stroke="#8B95A1" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    ${ebulb(230, 56, 13)}
    ${ebulb(278, 56, 13)}
    ${ebattery(228, 138, 50, 22)}
    <text x="254" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>`
      : `
    <path d="M228 150h-30V70h112v80h-30" stroke="#8B95A1" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M226 70v-34h58v34" stroke="#8B95A1" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    ${ebulb(254, 70, 12)}
    ${ebulb(254, 36, 12)}
    ${ebattery(228, 138, 50, 22)}
    <text x="254" y="14" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>`;
  return `<svg viewBox="0 0 344 172" ${NS} fill="none" role="img" aria-label="전지 한 개짜리 회로 두 개 — (가)는 전구 한 개, (나)는 전구 두 개가 연결되어 있다">
    ${left}${right}
  </svg>`;
}

/** 회로 위 세 지점 ㉠㉡㉢(전류 비교 문항용) — series: 한 줄 회로의 앞·사이·뒤 / parallel: 전체·두 갈래. */
export function elecPointsFig(o: { mode: "series" | "parallel" }): string {
  const dot = (x: number, y: number, t: string): string =>
    `<circle cx="${x}" cy="${y}" r="5" fill="#F0A422" stroke="#B87700" stroke-width="1.6"/>
     <text x="${x}" y="${y - 12}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">${t}</text>`;
  if (o.mode === "series")
    return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="전지에 전구 두 개가 한 줄로 연결된 회로 — 도선 위 세 지점에 ㉠㉡㉢ 표시가 있다">
      <path d="M130 152H56V52h232v100h-100" stroke="#8B95A1" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      ${ebulb(140, 52, 14)}
      ${ebulb(216, 52, 14)}
      ${ebattery(130, 140, 58, 24)}
      ${dot(92, 52, "㉠")}
      ${dot(178, 52, "㉡")}
      ${dot(262, 52, "㉢")}
    </svg>`;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="전지에 전구 두 개가 두 갈래로 연결된 회로 — 갈라지기 전 도선에 ㉠, 두 갈래에 ㉡㉢ 표시가 있다">
    <path d="M132 164H56V64h232v100h-100" stroke="#8B95A1" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M120 64v-34h104v34" stroke="#8B95A1" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    ${ebulb(172, 64, 13)}
    ${ebulb(172, 30, 13)}
    ${ebattery(130, 152, 58, 24)}
    ${dot(84, 64, "㉠")}
    ${dot(216, 30, "㉡")}
    ${dot(216, 64, "㉢")}
  </svg>`;
}

/** 전기 기구 에너지 전환 분류 순서도(파라미터형) — 예/아니요가 각자의 결론 칸 A/B/C로 갈라진다
 *  (한 칸 수렴 금지 — u3 관행). q1·q2는 판정 질문 문구. */
export function elecFlowFig(o: { q1: string; q2: string }): string {
  const dia = (x: number, y: number, w: number, h: number, t: string): string =>
    `<path d="M${x} ${y - h / 2} L${x + w / 2} ${y} L${x} ${y + h / 2} L${x - w / 2} ${y} Z" fill="#FFF7E0" stroke="#D9B44A" stroke-width="1.8"/>
     <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">${t}</text>`;
  const box = (x: number, y: number, t: string): string =>
    `<rect x="${x - 26}" y="${y}" width="52" height="32" rx="8" fill="#EAF3FC" stroke="#9FB6CE" stroke-width="1.8"/>
     <text x="${x}" y="${y + 21}" text-anchor="middle" font-size="14" font-weight="800" fill="#2E5AA8">${t}</text>`;
  const headDown = (x: number, y: number): string => `<path d="M${x} ${y}l-4.2 -7.4h8.4z" fill="#8B95A1"/>`;
  const lbl = (x: number, y: number, t: string): string =>
    `<text x="${x}" y="${y}" font-size="10.5" font-weight="700" fill="#6B7684">${t}</text>`;
  return `<svg viewBox="0 0 344 224" ${NS} fill="none" role="img" aria-label="전기 기구를 두 가지 질문으로 A, B, C 세 칸에 나누는 순서도">
    <rect x="128" y="8" width="88" height="26" rx="13" fill="#F0F3F7" stroke="#C4CAD2" stroke-width="1.6"/>
    <text x="172" y="26" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">전기 기구</text>
    <path d="M172 34v20" stroke="#8B95A1" stroke-width="1.8"/>${headDown(172, 56)}
    ${dia(172, 80, 192, 48, o.q1)}
    <path d="M76 80H40v50" stroke="#8B95A1" stroke-width="1.8" fill="none"/>${headDown(40, 132)}${lbl(46, 72, "예")}
    ${box(40, 134, "A")}
    <path d="M172 104v22" stroke="#8B95A1" stroke-width="1.8"/>${headDown(172, 128)}${lbl(178, 122, "아니요")}
    ${dia(172, 152, 192, 48, o.q2)}
    <path d="M172 176v12" stroke="#8B95A1" stroke-width="1.8"/>${headDown(172, 190)}${lbl(148, 188, "예")}
    ${box(172, 190, "B")}
    <path d="M268 152h36v34" stroke="#8B95A1" stroke-width="1.8" fill="none"/>${headDown(304, 188)}${lbl(276, 144, "아니요")}
    ${box(304, 190, "C")}
  </svg>`;
}

/** 전기 기구 표시 라벨(명판) — 정격 전압·소비 전력 해석 문항용. aria는 수치를 낭독하지 않는다. */
export function elecLabelFig(o: { volt: number; watt: number }): string {
  return `<svg viewBox="0 0 344 140" ${NS} fill="none" role="img" aria-label="전기 기구 뒷면에 붙은 표시 라벨 — 적힌 값을 읽어 해석해요">
    <rect x="70" y="18" width="204" height="104" rx="14" fill="#F4F6F9" stroke="#B7C2CE" stroke-width="2.2"/>
    <rect x="84" y="32" width="176" height="44" rx="8" fill="#FFFFFF" stroke="#D9DFE6" stroke-width="1.4"/>
    <text x="172" y="62" text-anchor="middle" font-size="24" font-weight="800" fill="#333D4B">${o.volt}V - ${o.watt}W</text>
    <circle cx="104" cy="98" r="9" fill="none" stroke="#9DAABD" stroke-width="1.8"/>
    <path d="M100 94l8 8M108 94l-8 8" stroke="#9DAABD" stroke-width="1.6"/>
    <path d="M128 92h60M128 100h44" stroke="#C4CAD2" stroke-width="3" stroke-linecap="round"/>
    <path d="M236 90a8 8 0 0 1 0 16M228 92v12" stroke="#9DAABD" stroke-width="1.8" fill="none"/>
  </svg>`;
}

/** 전동기 사시도(시험판) — 힘 화살표 없음(질문 과제). (가)=코일 왼쪽 변, (나)=오른쪽 변.
 *  물리 검산(기본 상태): 자기장 B = N(왼)→S(오른) = +x. 전류는 전지 (+)극(왼쪽 도선)에서 나와
 *  (가) 변을 앞→뒤(−z)로 흐름 → F = IL×B ∝ (−ẑ)×x̂ = −ŷ = 아래. (나) 변은 뒤→앞(+z) → 힘 위.
 *  즉 기본: (가) 아래·(나) 위. reverse면 전류·힘 모두 반대((가) 위·(나) 아래). */
export function elecMotorExamFig(o?: { reverse?: boolean }): string {
  const rev = o?.reverse ?? false;
  // 코일 꼭짓점(사시): 앞변 (128,150)-(232,150), 뒷변 (152,108)-(256,108). 도선 x=162(+)·x=197(−).
  const cur = (x1: number, y1: number, x2: number, y2: number): string => {
    const [a1, b1, a2, b2] = rev ? [x2, y2, x1, y1] : [x1, y1, x2, y2];
    const mx = a1 + (a2 - a1) * 0.6;
    const my = b1 + (b2 - b1) * 0.6;
    const ang = (Math.atan2(b2 - b1, a2 - a1) * 180) / Math.PI;
    return `<g transform="rotate(${ang} ${mx} ${my})"><path d="M${mx + 6.5} ${my}l-9 -5.5v11z" fill="#FFD400" stroke="#6E3F16" stroke-width="1.1" stroke-linejoin="round"/></g>`;
  };
  return `<svg viewBox="0 0 344 214" ${NS} fill="none" role="img" aria-label="왼쪽 N극과 오른쪽 S극 자석 사이에 수평으로 놓인 사각 코일 — 전류의 방향이 화살표로 표시되어 있고 (가)는 왼쪽 변, (나)는 오른쪽 변이에요">
    <path d="M30 58l16 -12h20v96l-16 12h-20z" fill="#E8836B" stroke="#A8442E" stroke-width="1.8"/>
    <text x="58" y="100" text-anchor="middle" font-size="16" font-weight="800" fill="#FFF">N</text>
    <path d="M278 58l16 -12h20v96l-16 12h-20z" fill="#7FA6E8" stroke="#2E5AA8" stroke-width="1.8"/>
    <text x="306" y="100" text-anchor="middle" font-size="16" font-weight="800" fill="#FFF">S</text>
    <path d="M92 96h156M238 90l10 6-10 6" stroke="#C9D2DC" stroke-width="1.8" fill="none" stroke-dasharray="6 5"/>
    <text x="172" y="86" text-anchor="middle" font-size="10.5" fill="#8B95A1">자기장의 방향</text>
    <g stroke="#C97F3A" stroke-width="5.5" fill="none" stroke-linecap="round">
      <path d="M128 150 L152 108 M232 150 L256 108 M152 108 H256"/>
      <path d="M128 150 H162 M197 150 H232"/>
    </g>
    ${cur(162, 150, 128, 150) /* 앞변 왼쪽: (+)도선 → 왼쪽으로 */}
    ${cur(128, 150, 152, 108) /* (가) 변: 앞→뒤 */}
    ${cur(152, 108, 256, 108) /* 뒷변: 왼→오 */}
    ${cur(256, 108, 232, 150) /* (나) 변: 뒤→앞 */}
    ${cur(232, 150, 197, 150) /* 앞변 오른쪽: (−)도선 쪽으로 */}
    <text x="106" y="140" text-anchor="end" font-size="13" font-weight="800" fill="#4E5968">(가)</text>
    <path d="M110 136l26 -12" stroke="#C4CAD2" stroke-width="1.3"/>
    <text x="262" y="146" font-size="13" font-weight="800" fill="#4E5968">(나)</text>
    <path d="M260 140l-14 -10" stroke="#C4CAD2" stroke-width="1.3"/>
    <path d="M162 150 V178 M197 150 V178" stroke="#8B95A1" stroke-width="2.6"/>
    ${ebattery(140, 178, 84, 24, rev) /* 전류 반전판은 전지를 거꾸로 끼운 그림(− 왼쪽) — 극과 전류 방향 일관 */}
  </svg>`;
}

// ── g2u8(별과 우주) 시험 전용 ──────────────────────────────
// 다크 우주 스타일(u7 섹션 계승 — figureDark: true, 스트로크 #2C4066·텍스트 #DCE8FF).
// aria는 판독 과제를 낭독하지 않는다(정답 유출 금지 — crudeTowerFig 선례).

/** 발광 별(도해용) — starFigures.star와 같은 문법의 로컬 헬퍼 */
function xstar(x: number, y: number, r: number, fill: string): string {
  const spikes: string[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    spikes.push(
      `<line x1="${(x + Math.cos(a) * r * 1.15).toFixed(1)}" y1="${(y + Math.sin(a) * r * 1.15).toFixed(1)}" x2="${(x + Math.cos(a) * r * 1.9).toFixed(1)}" y2="${(y + Math.sin(a) * r * 1.9).toFixed(1)}" stroke="${fill}" stroke-width="${Math.max(1.1, r * 0.16)}" opacity=".75"/>`,
    );
  }
  return `<circle cx="${x}" cy="${y}" r="${r * 2.1}" fill="${fill}" opacity=".13"/><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>${spikes.join("")}`;
}

/** 지구 공전 궤도(왼쪽 세로 타원)에서 세 별 (가)(나)(다)를 본 시차각(다크) —
 *  별이 멀수록 시선 부채꼴이 좁아진다. 각 값 라벨은 파라미터(기본 0.4″/0.2″/0.1″). */
export function starParallax3Fig(o: { p: [string, string, string] } = { p: ["0.4″", "0.2″", "0.1″"] }): string {
  const ex = 52; // 태양 x
  const top: [number, number] = [ex, 56];
  const bot: [number, number] = [ex, 148];
  const stars: { x: number; label: string }[] = [
    { x: 138, label: "(가)" },
    { x: 216, label: "(나)" },
    { x: 306, label: "(다)" },
  ];
  const rays = stars
    .map(
      (s) =>
        `<line x1="${top[0]}" y1="${top[1]}" x2="${s.x}" y2="102" stroke="#5B7BB8" stroke-width="1.3" stroke-dasharray="4 4" opacity=".8"/>
         <line x1="${bot[0]}" y1="${bot[1]}" x2="${s.x}" y2="102" stroke="#5B7BB8" stroke-width="1.3" stroke-dasharray="4 4" opacity=".8"/>`,
    )
    .join("");
  const marks = stars
    .map(
      (s, i) =>
        `${xstar(s.x, 102, 6, "#EDE2BE")}
         <text x="${s.x}" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="#DCE8FF">${s.label}</text>
         <text x="${s.x}" y="136" text-anchor="middle" font-size="11.5" font-weight="800" fill="#8FB3E8">${o.p[i]}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="지구 공전 궤도의 양 끝에서 세 별 (가), (나), (다)를 바라본 시차각이 각각 표시된 그림">
    <ellipse cx="${ex}" cy="102" rx="16" ry="46" stroke="#2C4066" stroke-width="1.4" stroke-dasharray="4 5"/>
    <circle cx="${ex}" cy="102" r="7" fill="#FFC24D"/>
    <text x="${ex}" y="185" text-anchor="middle" font-size="10.5" fill="#7E93B8">태양</text>
    <circle cx="${top[0]}" cy="${top[1]}" r="5" fill="#3E8EE0"/>
    <circle cx="${bot[0]}" cy="${bot[1]}" r="5" fill="#3E8EE0"/>
    <text x="${ex - 24}" y="${top[1]}" text-anchor="middle" font-size="10.5" fill="#AFC3E3">지구</text>
    <text x="${ex - 24}" y="${bot[1] + 8}" text-anchor="middle" font-size="10.5" fill="#AFC3E3">지구</text>
    ${rays}${marks}
    <text x="172" y="24" text-anchor="middle" font-size="10.5" fill="#7E93B8">6개월 간격으로 두 위치에서 관측</text>
  </svg>`;
}

/** 6개월 간격 관측 두 장면(다크 2패널) — 배경별 ㉯는 고정, 별 ㉮가 ㉯ 쪽으로 다가와 보인다.
 *  간격 라벨 g1(6개월 전)·g2(현재)는 파라미터 — 이동각 = g1−g2, 연주 시차는 그 절반. */
export function starShiftPairFig(o: { g1: string; g2: string }): string {
  const panel = (px: number, title: string, ax: number, gap: string): string => {
    const bx = 118; // ㉯ 고정 위치(패널 좌표)
    return `<g transform="translate(${px} 0)">
      <rect x="8" y="30" width="152" height="128" rx="12" fill="#0C1526" stroke="#22304C" stroke-width="1.2"/>
      <text x="84" y="20" text-anchor="middle" font-size="11.5" font-weight="700" fill="#AFC3E3">${title}</text>
      <circle cx="34" cy="58" r="1.6" fill="#5B7BB8"/><circle cx="132" cy="52" r="1.4" fill="#5B7BB8"/>
      <circle cx="52" cy="132" r="1.4" fill="#5B7BB8"/><circle cx="140" cy="120" r="1.6" fill="#5B7BB8"/>
      ${xstar(bx, 88, 4, "#C9D6F0")}
      <text x="${bx}" y="70" text-anchor="middle" font-size="12" font-weight="800" fill="#DCE8FF">㉯</text>
      ${xstar(ax, 112, 6, "#FFE9A8")}
      <text x="${ax}" y="140" text-anchor="middle" font-size="12" font-weight="800" fill="#FFE9A8">㉮</text>
      <path d="M${ax} 96 L${ax} 88 L${bx} 88" stroke="#8FB3E8" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/>
      <text x="${(ax + bx) / 2}" y="82" text-anchor="middle" font-size="11" font-weight="800" fill="#8FB3E8">${gap}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 172" ${NS} fill="none" role="img" aria-label="6개월 간격으로 같은 하늘을 관측한 두 장면 — 배경별 ㉯에 대한 별 ㉮의 위치와 두 별 사이 각이 표시되어 있어요">
    ${panel(6, "6개월 전", 44, o.g1)}
    <path d="M166 94h12M174 90l6 4-6 4" stroke="#5E7398" stroke-width="1.6" fill="none"/>
    ${panel(178, "현재", 88, o.g2)}
  </svg>`;
}

/** 광원에서 나온 같은 빛다발이 거리 1·2·3배 지점에서 덮는 격자(다크) —
 *  한 칸 크기는 같고 판이 1×1 → 2×2 → 3×3으로 커진다(면적 1:4:9). */
export function starBrightGridFig(): string {
  const grid = (x: number, n: number): string => {
    const s = 26; // 한 칸 한 변
    const half = (n * s) / 2;
    const lines: string[] = [];
    for (let i = 0; i <= n; i++) {
      lines.push(`<line x1="${x + i * s - half}" y1="${102 - half}" x2="${x + i * s - half}" y2="${102 + half}" stroke="#4A6292" stroke-width="1.3"/>`);
      lines.push(`<line x1="${x - half}" y1="${102 - half + i * s}" x2="${x + half}" y2="${102 - half + i * s}" stroke="#4A6292" stroke-width="1.3"/>`);
    }
    return `<rect x="${x - half}" y="${102 - half}" width="${n * s}" height="${n * s}" fill="#FFE9A8" opacity="${0.34 / n}"/>${lines.join("")}`;
  };
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="광원에서 나온 한 빛다발이 거리가 1배, 2배, 3배인 지점에서 각각 덮는 격자판의 크기를 나타낸 그림">
    ${xstar(26, 102, 8, "#FFE9A8")}
    <line x1="34" y1="96" x2="316" y2="60" stroke="#8B6F3A" stroke-width="1.2" stroke-dasharray="5 4"/>
    <line x1="34" y1="108" x2="316" y2="144" stroke="#8B6F3A" stroke-width="1.2" stroke-dasharray="5 4"/>
    ${grid(112, 1)}${grid(196, 2)}${grid(292, 3)}
    <text x="112" y="184" text-anchor="middle" font-size="11" font-weight="700" fill="#AFC3E3">거리 1배</text>
    <text x="196" y="184" text-anchor="middle" font-size="11" font-weight="700" fill="#AFC3E3">거리 2배</text>
    <text x="292" y="184" text-anchor="middle" font-size="11" font-weight="700" fill="#AFC3E3">거리 3배</text>
  </svg>`;
}

/** 색(가로 7단) × 겉보기 등급(세로) 산점도(다크 · g2u8 v2 패치판 msFigV2 승격).
 *  파일럿 눈검수 반영 2건: 하단 "표면 온도 높음·낮음" 방향 라벨 제거(정답 인쇄) · col 5 이상 별
 *  라벨 왼쪽 배치(가장자리 잘림). mag: 1(위, 밝음)~5(아래, 어둠) · col: 0(청)~6(적). */
export function starMagScatterFig(o: { pts: { label: string; col: number; mag: number }[] }): string {
  const COLS = ["청색", "청백색", "백색", "황백색", "황색", "주황색", "적색"];
  const HEX = ["#9CC4FF", "#BFD8FF", "#F0F4FA", "#FFF2D0", "#FFE9A8", "#FFC08A", "#FF9A66"];
  const gx = (c: number): number => 66 + c * 42;
  const gy = (m: number): number => 26 + (m - 1) * 32;
  let axis = "";
  for (let m = 1; m <= 5; m++)
    axis += `<line x1="46" y1="${gy(m)}" x2="330" y2="${gy(m)}" stroke="#1E2C48" stroke-width="1"/>
      <text x="38" y="${gy(m) + 4}" text-anchor="end" font-size="10.5" fill="#7E93B8">${m}</text>`;
  const cols = COLS.map(
    (c, i) => `<text x="${gx(i)}" y="184" text-anchor="middle" font-size="9.5" fill="#AFC3E3">${c}</text>`,
  ).join("");
  const pts = o.pts
    .map((p) => {
      const left = p.col >= 5;
      return `${vstar(gx(p.col), gy(p.mag), 6, HEX[p.col])}
      <text x="${gx(p.col) + (left ? -15 : 15)}" y="${gy(p.mag) - 8}" text-anchor="${left ? "end" : "start"}" font-size="12" font-weight="800" fill="#DCE8FF">${p.label}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="가로축은 별의 색(청색에서 적색까지 일곱 단계), 세로축은 겉보기 등급인 그래프에 별 ${o.pts.map((p) => p.label).join(", ")}의 위치가 점으로 표시된 그림">
    ${axis}
    <line x1="46" y1="18" x2="46" y2="168" stroke="#3D5378" stroke-width="1.6"/>
    <line x1="46" y1="168" x2="330" y2="168" stroke="#3D5378" stroke-width="1.6"/>
    <text x="14" y="14" font-size="10" fill="#7E93B8">겉보기 등급</text>
    ${cols}${pts}
  </svg>`;
}
/** 색이 다른 별 셋(다크) — 레슨 colorTempFig의 시험판(라벨·색 구성 파라미터). */
export function colorTempTrioFig(o: { stars: { label: string; name: string; hex: string }[] }): string {
  const xs = [70, 172, 274];
  const body = o.stars
    .map(
      (s, i) => `${xstar(xs[i], 66, 13, s.hex)}
      <text x="${xs[i]}" y="112" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8FF">${s.label}</text>
      <text x="${xs[i]}" y="132" text-anchor="middle" font-size="11" font-weight="700" fill="#AFC3E3">${s.name}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 152" ${NS} fill="none" role="img" aria-label="색이 서로 다른 세 별과 각 별의 색 이름이 표시된 그림">${body}</svg>`;
}

/** 옆에서 본 우리은하(다크, 시험판) — 이름 라벨 대신 위치 기호 ㉠(중심부)·㉡(원반 위 한 점)·㉢(원반 바깥 공간).
 *  galaxySideFig의 이름 라벨은 위치 문항의 정답을 인쇄하므로 시험판을 따로 둔다(geoCycleQuizFig 계보). */
export function starGalaxyQuizFig(): string {
  const halo: string[] = [];
  const pts = [
    [96, 44], [140, 30], [210, 28], [258, 60], [286, 88], [70, 66], [46, 96], [300, 118], [120, 140], [250, 140],
  ];
  for (const [hx, hy] of pts) halo.push(`<circle cx="${hx}" cy="${hy}" r="2.6" fill="#8FA0C8" opacity=".55"/>`);
  const mark = (x: number, y: number, t: string, tx: number, ty: number): string =>
    `<circle cx="${x}" cy="${y}" r="7" stroke="#FFE9A8" stroke-width="1.8" fill="none"/>
     <circle cx="${x}" cy="${y}" r="2.2" fill="#FFE9A8"/>
     <line x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" stroke="#8B6F3A" stroke-width="1.1"/>
     <text x="${tx}" y="${ty - 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#FFE9A8">${t}</text>`;
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="옆에서 본 우리은하 그림 위에 세 위치 ㉠, ㉡, ㉢이 기호로만 표시되어 있어요">
    ${halo.join("")}
    <ellipse cx="172" cy="92" rx="118" ry="13" fill="#2A3C66"/>
    <ellipse cx="172" cy="92" rx="118" ry="13" fill="none" stroke="#44598C" stroke-width="1.4"/>
    <ellipse cx="172" cy="91" rx="106" ry="9" fill="#3A4E80" opacity=".8"/>
    <ellipse cx="172" cy="90" rx="34" ry="20" fill="#FFE0B0"/>
    <ellipse cx="172" cy="90" rx="20" ry="12" fill="#FFF2D8"/>
    ${mark(172, 90, "㉠", 128, 46)}
    ${mark(238, 93, "㉡", 262, 128)}
    ${mark(96, 44, "㉢", 62, 30)}
  </svg>`;
}

/** 옆에서 본 우리은하 + 두 별 무리의 분포(다크) — ㉮는 원반(나선팔)을 따라,
 *  ㉯는 중심부 주위와 원반 바깥(헤일로)에 구형으로. 점 색은 같다(색이 답의 단서가 되지 않게). */
export function starClusterMapFig(): string {
  const dot = (x: number, y: number): string => `<circle cx="${x}" cy="${y}" r="3" fill="#C8D4E8"/><circle cx="${x}" cy="${y}" r="1.2" fill="#F0F4FA"/>`;
  const disk = [[86, 92], [120, 95], [150, 89], [200, 95], [232, 90], [262, 93]].map(([x, y]) => dot(x, y)).join("");
  const halo = [[100, 42], [150, 26], [216, 30], [262, 52], [292, 80], [66, 62], [48, 108], [296, 124], [128, 146], [236, 148], [172, 60], [172, 122]]
    .map(([x, y]) => dot(x, y))
    .join("");
  return `<svg viewBox="0 0 344 176" ${NS} fill="none" role="img" aria-label="옆에서 본 우리은하에 두 별 무리 ㉮와 ㉯가 어디에 분포하는지 점으로 나타낸 그림">
    <ellipse cx="172" cy="92" rx="120" ry="12" fill="#2A3C66"/>
    <ellipse cx="172" cy="92" rx="120" ry="12" fill="none" stroke="#44598C" stroke-width="1.3"/>
    <ellipse cx="172" cy="90" rx="30" ry="17" fill="#5A6DA0"/>
    ${disk}${halo}
    <text x="316" y="96" font-size="13" font-weight="800" fill="#DCE8FF">㉮</text>
    <line x1="312" y1="93" x2="268" y2="93" stroke="#3D5378" stroke-width="1.1"/>
    <text x="316" y="34" font-size="13" font-weight="800" fill="#DCE8FF">㉯</text>
    <line x1="312" y1="32" x2="268" y2="52" stroke="#3D5378" stroke-width="1.1"/>
    <text x="60" y="168" font-size="10.5" fill="#7E93B8">㉮ 원반(나선팔) 위 · ㉯ 중심부 주위와 원반 바깥</text>
  </svg>`;
}

/** 우주 팽창 화살표 그림(다크) — 은하 A에서 관측: 가까운 B는 짧은 화살표, 먼 C는 긴 화살표. */
export function starExpandArrowFig(): string {
  const gal = (x: number, tone: string): string =>
    `<ellipse cx="${x}" cy="96" rx="17" ry="7" fill="${tone}" opacity=".85"/>
     <ellipse cx="${x}" cy="96" rx="7" ry="4" fill="#FFF2D8"/>`;
  const arrow = (x1: number, x2: number): string =>
    `<line x1="${x1}" y1="72" x2="${x2}" y2="72" stroke="#F0A0B4" stroke-width="2.6"/>
     <path d="M${x2} 72l-9 -5v10z" fill="#F0A0B4"/>`;
  return `<svg viewBox="0 0 344 160" ${NS} fill="none" role="img" aria-label="은하 A에서 은하 B와 C를 관측한 그림 — 각 은하의 움직임이 화살표로 표시되어 있어요">
    ${gal(56, "#4A5E92")}
    <circle cx="56" cy="96" r="24" stroke="#FFE9A8" stroke-width="1.4" stroke-dasharray="4 4" fill="none"/>
    <text x="56" y="140" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8FF">A</text>
    <text x="56" y="156" text-anchor="middle" font-size="10" fill="#7E93B8">(관측 기준)</text>
    ${gal(150, "#4A5E92")}
    <text x="150" y="140" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8FF">B</text>
    ${arrow(170, 196)}
    ${gal(276, "#4A5E92")}
    <text x="276" y="140" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8FF">C</text>
    ${arrow(296, 338)}
  </svg>`;
}

/** 코일 + 전지 + 열린 스위치 + 나침반 ㉠(코일 왼쪽 끝) 배치도 — 정성 관찰 문항용(바늘 방향은 채점 대상 아님). */
export function elecCoilCompassFig(): string {
  const turns = [0, 1, 2, 3, 4]
    .map((i) => `<ellipse cx="${132 + i * 22}" cy="96" rx="11" ry="20" stroke="#C97F3A" stroke-width="4" fill="none"/>`)
    .join("");
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="코일과 전지, 열린 스위치로 이루어진 회로 — 코일의 왼쪽 끝에 나침반 ㉠이 놓여 있다">
    <path d="M121 96h-11v66h58M231 96h25v66h-30" stroke="#8B95A1" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${turns}
    ${ebattery(168, 150, 58, 24)}
    <circle cx="240" cy="162" r="4" fill="#5E6B7E"/>
    <path d="M240 162l16 -10" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <circle cx="258" cy="162" r="4" fill="#5E6B7E"/>
    <text x="250" y="186" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치(열림)</text>
    <circle cx="70" cy="96" r="24" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
    <path d="M70 78l7 18-7 18-7-18z" fill="#E0452E"/>
    <path d="M70 114l-7-18h14z" fill="#B0B8C1"/>
    <text x="70" y="46" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>
    <text x="196" y="66" text-anchor="middle" font-size="11" fill="#8B95A1">코일</text>
  </svg>`;
}

// ── g2u7 v2 신작(파일럿 승격 · 재출제 2호) ──

/** (+)·(−) 전하 알갱이(examFigures eplus·eminus와 같은 시각 문법의 로컬판) */
const g7p = (x: number, y: number, r = 5.8): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#FBE3E0" stroke="#D06050" stroke-width="1.3"/>
   <path d="M${x - r * 0.5} ${y}h${r}M${x} ${y - r * 0.5}v${r}" stroke="#C24437" stroke-width="1.4" stroke-linecap="round"/>`;
const g7m = (x: number, y: number, r = 5.8): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#E3EDFB" stroke="#5B87C9" stroke-width="1.3"/>
   <path d="M${x - r * 0.5} ${y}h${r}" stroke="#3A6BAE" stroke-width="1.4" stroke-linecap="round"/>`;


/** HG elecHangFig · 실에 매단 가벼운 물체 장면(마찰 전기력 관찰) · 힘 화살표는 그리지 않는다(판정이 과제).
 *  mode "repel" = 같은 대전체 두 개가 V자로 벌어짐 · "attract" = 매단 물체가 오른쪽 대전체 쪽으로 기울어짐. */
export function elecHangFig(o: { mode: "repel" | "attract"; left: string; right: string; neutral?: boolean }): string {
  const bar = `<line x1="60" y1="26" x2="284" y2="26" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 26v-8M284 26v-8" stroke="#8B95A1" stroke-width="3"/>`;
  if (o.mode === "repel")
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="천장 막대의 한 점에 실 두 가닥으로 매단 두 물체가 서로 기울어져 벌어진 채 멈춰 있는 그림">
      ${bar}
      <line x1="172" y1="26" x2="120" y2="120" stroke="#B0B8C1" stroke-width="1.8"/>
      <line x1="172" y1="26" x2="224" y2="120" stroke="#B0B8C1" stroke-width="1.8"/>
      <g transform="rotate(-26 120 136)"><rect x="98" y="122" width="44" height="28" rx="7" fill="#C8DCEC" stroke="#7A94AC" stroke-width="1.8"/></g>
      <g transform="rotate(26 224 136)"><rect x="202" y="122" width="44" height="28" rx="7" fill="#C8DCEC" stroke="#7A94AC" stroke-width="1.8"/></g>
      <text x="96" y="176" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.left}</text>
      <text x="248" y="176" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.right}</text>
    </svg>`;
  if (o.neutral)
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="실에 매단 가벼운 물체의 옆으로 대전된 막대를 가까이 가져가는 그림">
    ${bar}
    <line x1="150" y1="26" x2="150" y2="118" stroke="#B0B8C1" stroke-width="1.8"/>
    <circle cx="150" cy="130" r="15" fill="#D8E2EE" stroke="#8B99AC" stroke-width="1.8"/>
    <text x="128" y="166" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.left}</text>
    <g transform="rotate(24 262 108)">
      <rect x="222" y="100" width="96" height="16" rx="8" fill="#D9C9EC" stroke="#8F78AC" stroke-width="1.6"/>
      <path d="M232 104h30" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    </g>
    <path d="M252 118l-24 6M232 121l-9 5 10 2" stroke="#8B95A1" stroke-width="1.8" fill="none"/>
    <text x="268" y="70" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.right}</text>
  </svg>`;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="실에 매단 가벼운 물체 옆으로 막대를 가까이 가져가자 물체가 막대 쪽으로 기울어진 그림">
    ${bar}
    <line x1="150" y1="26" x2="186" y2="118" stroke="#B0B8C1" stroke-width="1.8"/>
    <circle cx="190" cy="130" r="15" fill="#D8E2EE" stroke="#8B99AC" stroke-width="1.8"/>
    <text x="128" y="166" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.left}</text>
    <g transform="rotate(24 262 108)">
      <rect x="222" y="100" width="96" height="16" rx="8" fill="#D9C9EC" stroke="#8F78AC" stroke-width="1.6"/>
      <path d="M232 104h30" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    </g>
    <text x="268" y="70" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${o.right}</text>
  </svg>`;
}

/** PF elecPairForceFig · 매달린 대전체 A·B·C와 두 쌍의 힘 관계 화살표.
 *  rel1 = A·B 사이, rel2 = B·C 사이("att" 인력=마주보기 · "rep" 척력=등지기). 부호는 B만 인쇄. */
export function elecPairForceFig(o: { rel1: "att" | "rep"; rel2: "att" | "rep"; bSign: "+" | "-" }): string {
  const ball = (x: number, name: string, sign?: string): string =>
    `<line x1="${x}" y1="24" x2="${x}" y2="78" stroke="#B0B8C1" stroke-width="1.6"/>
     <circle cx="${x}" cy="96" r="19" fill="${sign ? "#FFF7E0" : "#F0F3F7"}" stroke="#9DAABD" stroke-width="1.8"/>
     <text x="${x}" y="${sign ? 102 : 101}" text-anchor="middle" font-size="${sign ? 14 : 13}" font-weight="800" fill="#4E5968">${sign ?? "?"}</text>
     <text x="${x}" y="150" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">${name}</text>`;
  const arr = (x1: number, x2: number): string =>
    `<path d="M${x1} 96H${x2}" stroke="#F0A422" stroke-width="2.4"/><path d="M${x2} 96l${x1 < x2 ? -8 : 8} -4.6v9.2z" fill="#F0A422"/>`;
  const pair = (cx: number, rel: "att" | "rep"): string =>
    rel === "att" ? arr(cx - 26, cx - 6) + arr(cx + 26, cx + 6) : arr(cx - 6, cx - 26) + arr(cx + 6, cx + 26);
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="실에 매단 대전체 A, B, C 사이에 작용하는 힘의 방향이 화살표로 표시된 그림 · B의 전기 종류만 적혀 있다">
    <line x1="30" y1="24" x2="314" y2="24" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    ${ball(70, "A")}${ball(172, "B", `(${o.bSign === "+" ? "+" : "−"})`)}${ball(274, "C")}
    ${pair(121, o.rel1)}${pair(223, o.rel2)}
  </svg>`;
}

/** SC elecScopeChoicesFig · 검전기 전하 분포 5컷 고르기(그림이 곧 선택지 · shuffle:false 전용).
 *  pol = 가까이 가져간 대전체의 부호. 물리 정답 컷은 ②에 고정(라벨형 정답 위치 설계 관행):
 *  (−)대전체 기준 · 금속판 (+)·금속박 (−)·박 벌어짐. 미끼 = ①부호 반전 ③벌어짐 누락 ④양쪽 (+) ⑤양쪽 (−)닫힘. */
export function elecScopeChoicesFig(o: { pol: "+" | "-" }): string {
  const near = o.pol === "-" ? "p" : "m";
  const far = o.pol === "-" ? "m" : "p";
  const sgn = (k: string, x: number, y: number): string => (k === "p" ? g7p(x, y, 3.6) : g7m(x, y, 3.6));
  const cell = (x: number, num: string, plate: string, foil: string, open: boolean): string => {
    const foilPath = open
      ? `<path d="M33 40l-6 16M33 40l6 16" stroke="#D9B44A" stroke-width="2.4" stroke-linecap="round"/>`
      : `<path d="M33 40l-1.6 16M33 40l1.6 16" stroke="#D9B44A" stroke-width="2.4" stroke-linecap="round"/>`;
    return `<g transform="translate(${x} 0)">
      <text x="33" y="13" text-anchor="middle" font-size="12" font-weight="800" fill="#4E5968">${num}</text>
      <ellipse cx="33" cy="22" rx="15" ry="4.5" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.4"/>
      <rect x="31" y="26" width="4" height="14" fill="#B7C2CE" stroke="#8C99A8" stroke-width="1"/>
      <rect x="12" y="32" width="42" height="34" rx="5" fill="rgba(224,238,250,.35)" stroke="#9DAABD" stroke-width="1.4"/>
      ${foilPath}
      ${sgn(plate, 24, 22)}${sgn(plate, 33, 22)}${sgn(plate, 42, 22)}
      ${sgn(foil, 26, 60)}${sgn(foil, 40, 60)}
    </g>`;
  };
  return `<svg viewBox="0 0 344 78" ${NS} fill="none" role="img" aria-label="검전기의 금속판과 금속박에 표시된 전하 분포와 금속박이 벌어진 모습이 서로 다른 다섯 가지 그림 · 번호 ①부터 ⑤">
    ${cell(2, "①", far, near, true)}
    ${cell(70, "②", near, far, true)}
    ${cell(138, "③", near, far, false)}
    ${cell(206, "④", near, near, true)}
    ${cell(274, "⑤", far, far, false)}
  </svg>`;
}

/* CF elecCircuitFig 공용 소품 · 전류 화살표는 볼트 옐로+진갈색 테두리(SCI_GUIDE 관행) */
const cfWire = (d: string): string => `<path d="${d}" stroke="#8B95A1" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
const cfBattery = (cx: number, y: number, w = 58, h = 22, flip = false): string => {
  const px = flip ? cx + w / 2 - 13 : cx - w / 2 + 13;
  const mx = flip ? cx - w / 2 + 13 : cx + w / 2 - 13;
  return `<rect x="${cx - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="6" fill="#AEBDD6" stroke="#4E5A70" stroke-width="1.8"/>
    <text x="${px}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#333D4B">+</text>
    <text x="${mx}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#333D4B">−</text>`;
};
const cfBulb = (x: number, y: number, r = 13): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF3C4" stroke="#C8A23E" stroke-width="1.8"/>
   <path d="M${x - 7} ${y + 4}q3.5 -7 7 -1t7 -1" stroke="#E8963E" stroke-width="1.8" fill="none"/>`;
const cfArrow = (x: number, y: number, ang: number): string =>
  `<g transform="rotate(${ang} ${x} ${y})"><path d="M${x + 7} ${y}l-10 -6v12z" fill="#FFD400" stroke="#6E3F16" stroke-width="1.1" stroke-linejoin="round"/></g>`;

/** CF elecCircuitFig · 파라미터 회로도 워크호스. 수치는 그림 라벨로 인쇄(정보 이분) · 정답 수치는 인쇄 금지.
 *  kind: "open" 열린 스위치 회로 · "basic" 닫힌 회로+전류 화살표 ㉠ · "symbols" 기호 회로도 ㉠㉡㉢ ·
 *  "series" 같은 전구 n개 직렬(+전지 라벨) · "parallelSwitch" 병렬 두 갈래·한 갈래에만 스위치 S ·
 *  "labelR" 니크롬선 저항·전류 라벨 회로. */
export function elecCircuitFig(o: {
  kind:
    | "open"
    | "basic"
    | "symbols"
    | "series"
    | "parallelSwitch"
    | "labelR"
    | "dirs"
    | "nichromeLen"
    | "twin"
    | "battery2"
    | "parallelN"
    | "parallelAdd"
    | "branchAmps";
  bulbs?: number;
  volt?: string;
  ohm?: string;
  amp?: string;
  /** branchAmps 전용 · 인쇄할 라벨만 넘긴다(정답 값은 넘기지 않는 게 저작 규약) */
  main?: string;
  b1?: string;
  b2?: string;
}): string {
  if (o.kind === "dirs") {
    // 같은 회로 두 컷 · (가)는 전류 방향을 옳게(전지 + 왼쪽 → 시계 방향), (나)는 반대로 표시.
    // 곡선 화살표는 회전 방향 판독이 모호해 도선 위 화살표 3개로 명시(눈검수 반영 재작도).
    const mini = (ox: number, name: string, correct: boolean): string => {
      const a = (x: number, y: number, ang: number): string => cfArrow(x, y, correct ? ang : ang + 180);
      return `<text x="${ox + 62}" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${name}</text>
      ${cfWire(`M${ox + 40} 160H${ox + 8}V54h112v106h-24`)}
      ${cfBulb(ox + 64, 54, 12)}
      ${cfBattery(ox + 68, 160, 48, 20)}
      ${a(ox + 8, 104, 270)}${a(ox + 90, 54, 0)}${a(ox + 120, 110, 90)}`;
    };
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="같은 전지와 전구 회로 두 개 · (가)와 (나)는 도선 위 화살표로 전류의 방향을 서로 반대로 표시해 두었다">
      ${mini(16, "(가)", true)}
      ${mini(196, "(나)", false)}
    </svg>`;
  }
  if (o.kind === "nichromeLen") {
    // 같은 전지·같은 굵기, 길이만 1배/2배인 니크롬선 (가)(나) 비교.
    const box = (x: number, w: number, label: string): string =>
      `<rect x="${x - w / 2}" y="40" width="${w}" height="22" rx="6" fill="#F4E6D8" stroke="#B98A5A" stroke-width="1.8"/>
       <path d="M${x - w / 2 + 7} 51l8 -6 8 6 8 -6 8 6${w > 100 ? " 8 -6 8 6 8 -6 8 6" : ""}" stroke="#B98A5A" stroke-width="1.5" fill="none"/>
       <text x="${x}" y="82" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8A5A2E">${label}</text>`;
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="같은 전지에 굵기가 같고 길이만 다른 니크롬선을 하나씩 연결한 두 회로 (가)와 (나)">
      <text x="96" y="22" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
      ${cfWire("M72 160H40V51h24M128 51h24v109h-24")}
      ${box(96, 64, "길이 1배")}
      ${cfBattery(100, 160, 48, 20)}
      <text x="248" y="22" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
      ${cfWire("M224 160H182V51h10M310 51h10v109h-58")}
      ${box(251, 118, "길이 2배")}
      ${cfBattery(252, 160, 48, 20)}
    </svg>`;
  }
  if (o.kind === "twin") {
    // 같은 전지·같은 전구 2개씩 · (가) 직렬 vs (나) 병렬 직접 대결.
    return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="같은 전지와 같은 전구 두 개씩으로 만든 두 회로 · (가)는 한 줄로, (나)는 두 갈래로 연결되어 있다">
      <text x="92" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
      ${cfWire("M68 168H36V62h112v106h-24")}
      ${cfBulb(70, 62, 11)}${cfBulb(114, 62, 11)}
      ${cfBattery(96, 168, 48, 20)}
      <text x="252" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
      ${cfWire("M228 168H196V90h112v78h-24")}
      ${cfWire("M216 90v-34h72v34")}
      ${cfBulb(252, 56, 11)}
      ${cfBulb(252, 90, 11)}
      ${cfBattery(256, 168, 48, 20)}
    </svg>`;
  }
  if (o.kind === "battery2") {
    // 전지 1개(가) vs 같은 전지 2개 직렬(나) · 전구는 같다.
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="같은 전구에 전지 한 개를 연결한 회로 (가)와 같은 전지 두 개를 한 줄로 연결한 회로 (나)">
      <text x="92" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
      ${cfWire("M68 160H36V54h112v106h-24")}
      ${cfBulb(92, 54, 12)}
      ${cfBattery(96, 160, 48, 20)}
      <text x="252" y="20" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
      ${cfWire("M200 160h-4V54h112v106h-4")}
      ${cfBulb(252, 54, 12)}
      ${cfBattery(226, 160, 48, 20)}
      ${cfBattery(280, 160, 48, 20)}
    </svg>`;
  }
  if (o.kind === "parallelN") {
    // 같은 전구 n개(2~3) 병렬 + 전지 라벨(volt) · 각 갈래 전압 판독 문항용.
    const n = Math.min(3, Math.max(2, o.bulbs ?? 3));
    const ys = n === 2 ? [34, 70] : [22, 56, 90];
    return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="전지 한 개에 똑같은 전구 여러 개가 갈래를 나누어 연결된 회로 · 전지의 전압이 적혀 있다">
      ${cfWire(`M134 182H56V${ys[n - 1]}h232v${182 - ys[n - 1]}h-96`)}
      ${ys
        .slice(0, n - 1)
        .map((y) => cfWire(`M120 ${ys[n - 1]}v${y - ys[n - 1]}h104v${ys[n - 1] - y}`.replace(`v0h104v0`, "h104")))
        .join("")}
      ${ys.map((y) => cfBulb(172, y, 11)).join("")}
      ${cfBattery(166, 182)}
      <text x="166" y="156" text-anchor="middle" font-size="12.5" font-weight="800" fill="#2E5AA8">${o.volt ?? ""}</text>
      <text x="60" y="16" font-size="10.5" fill="#8B95A1">똑같은 전구 ${n}개</text>
    </svg>`;
  }
  if (o.kind === "parallelAdd") {
    // 병렬 2갈래 + 점선(추가 예정) 갈래 · 갈래 추가의 효과 문항용.
    return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="전지에 전구 두 개가 두 갈래로 연결된 회로 · 전구 한 개를 더 다는 갈래가 점선으로 표시되어 있다">
      ${cfWire("M134 182H56V90h232v92h-96")}
      ${cfWire("M120 90v-34h104v34")}
      ${cfBulb(172, 56, 11)}
      ${cfBulb(172, 90, 11)}
      <path d="M120 90v-68h104v68" stroke="#B0B8C1" stroke-width="2.6" fill="none" stroke-dasharray="7 6"/>
      <circle cx="172" cy="22" r="11" fill="none" stroke="#B0B8C1" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="298" y="26" text-anchor="end" font-size="10.5" fill="#8B95A1">추가하려는 갈래</text>
      ${cfBattery(166, 182)}
    </svg>`;
  }
  if (o.kind === "branchAmps") {
    // 병렬 두 갈래 + 전류 라벨(주어진 값만 인쇄 · 정답 값 인쇄 금지).
    return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="전지에 전구 두 개가 두 갈래로 연결된 회로 · 도선 위에 주어진 전류값이 적혀 있다">
      ${cfWire("M134 182H56V90h232v92h-96")}
      ${cfWire("M120 90v-34h104v34")}
      ${cfBulb(172, 56, 11)}
      ${cfBulb(172, 90, 11)}
      ${cfBattery(166, 182)}
      ${o.main ? `${cfArrow(84, 90, 0)}<text x="84" y="114" text-anchor="middle" font-size="12" font-weight="800" fill="#8A6600">${o.main}</text>` : ""}
      ${o.b1 ? `${cfArrow(200, 56, 0)}<text x="206" y="40" font-size="12" font-weight="800" fill="#8A6600">${o.b1}</text>` : ""}
      ${o.b2 ? `${cfArrow(200, 90, 0)}<text x="206" y="126" font-size="12" font-weight="800" fill="#8A6600">${o.b2}</text>` : ""}
    </svg>`;
  }
  if (o.kind === "open" || o.kind === "basic") {
    const open = o.kind === "open";
    const sw = open
      ? `<circle cx="252" cy="52" r="4" fill="#5E6B7E"/><circle cx="286" cy="52" r="4" fill="#5E6B7E"/>
         <path d="M252 52l26 -16" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
         <text x="269" y="26" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치(열림)</text>`
      : `<circle cx="252" cy="52" r="4" fill="#5E6B7E"/><circle cx="286" cy="52" r="4" fill="#5E6B7E"/>
         <path d="M252 52h34" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
         <text x="269" y="30" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치(닫힘)</text>`;
    const arrow = open
      ? ""
      : `${cfArrow(150, 52, 0)}<text x="150" y="34" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>`;
    return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="전지, 전구, 스위치가 도선으로 연결된 회로 그림${open ? " · 스위치는 열려 있다" : " · 도선 위에 ㉠ 화살표가 표시되어 있다"}">
      ${cfWire("M136 152H56V52h192")}${cfWire("M290 52h-2")}${cfWire("M286 52h2V152h-94")}
      ${cfBulb(96, 52)}
      ${sw}
      ${cfBattery(164, 152)}
      ${arrow}
    </svg>`;
  }
  if (o.kind === "symbols") {
    return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="전기 회로를 기호로 나타낸 회로도 · 세 부품에 ㉠, ㉡, ㉢ 표시가 있다">
      <path d="M160 140H60V44h100M184 140h100V44H184M160 44h24" stroke="#4E5968" stroke-width="2" fill="none"/>
      <path d="M160 128v24M184 134v12" stroke="#4E5968" stroke-width="2"/>
      <path d="M160 128v24" stroke="#4E5968" stroke-width="3.4"/>
      <path d="M184 122v36" stroke="#4E5968" stroke-width="1.6"/>
      <circle cx="120" cy="44" r="15" fill="none" stroke="#4E5968" stroke-width="2"/>
      <path d="M109.4 33.4l21.2 21.2M130.6 33.4l-21.2 21.2" stroke="#4E5968" stroke-width="1.8"/>
      <circle cx="240" cy="44" r="3.6" fill="#4E5968"/><circle cx="272" cy="44" r="3.6" fill="#4E5968"/>
      <path d="M240 44l26 -15" stroke="#4E5968" stroke-width="2.2" stroke-linecap="round"/>
      <text x="172" y="112" text-anchor="middle" font-size="14" font-weight="800" fill="#2E5AA8">㉠</text>
      <path d="M172 118v14" stroke="#C4CAD2" stroke-width="1.3"/>
      <text x="120" y="84" text-anchor="middle" font-size="14" font-weight="800" fill="#2E5AA8">㉡</text>
      <path d="M120 62v10" stroke="#C4CAD2" stroke-width="1.3"/>
      <text x="256" y="84" text-anchor="middle" font-size="14" font-weight="800" fill="#2E5AA8">㉢</text>
      <path d="M256 62v10" stroke="#C4CAD2" stroke-width="1.3"/>
    </svg>`;
  }
  if (o.kind === "series") {
    const n = o.bulbs ?? 4;
    const xs = Array.from({ length: n }, (_, i) => 76 + (192 / (n - 1)) * i);
    return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="전지 한 개에 똑같은 전구 여러 개가 한 줄로 연결된 회로 · 전지의 전압이 적혀 있다">
      ${cfWire("M136 152H48V52h248v100h-84")}
      ${xs.map((x) => cfBulb(x, 52, 12)).join("")}
      ${cfBattery(172, 152)}
      <text x="172" y="126" text-anchor="middle" font-size="12.5" font-weight="800" fill="#2E5AA8">${o.volt ?? ""}</text>
      <text x="172" y="24" text-anchor="middle" font-size="10.5" fill="#8B95A1">똑같은 전구 ${n}개</text>
    </svg>`;
  }
  if (o.kind === "parallelSwitch") {
    // 스위치 S는 병렬 구간(갈림 120 ~ 합류 224) 안(186~214)에 두어 ㉡ 갈래 전용임을 위상으로 보장.
    return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="전지에 전구 두 개가 두 갈래로 연결된 회로 · 한 갈래에만 스위치 S가 있고 지금은 닫혀 있다">
      ${cfWire("M134 170H56V70h232v100h-96")}
      ${cfWire("M120 70v-36h104v36")}
      ${cfBulb(172, 34, 12)}
      <text x="172" y="12" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">㉠</text>
      ${cfBulb(150, 70, 12)}
      <text x="150" y="98" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">㉡</text>
      <circle cx="186" cy="70" r="3.6" fill="#5E6B7E"/><circle cx="214" cy="70" r="3.6" fill="#5E6B7E"/>
      <path d="M186 70h28" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="214" y="94" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">스위치 S(닫힘)</text>
      ${cfBattery(166, 170)}
    </svg>`;
  }
  return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="전지와 니크롬선이 연결된 회로 · 그림에 적힌 값을 읽어 계산해요">
    ${cfWire("M136 152H56V52h60M228 52h60v100h-94")}
    <rect x="116" y="40" width="112" height="24" rx="6" fill="#F4E6D8" stroke="#B98A5A" stroke-width="1.8"/>
    <path d="M124 52l10 -7 10 7 10 -7 10 7 10 -7 10 7 10 -7 10 7 10 -7 10 7" stroke="#B98A5A" stroke-width="1.6" fill="none"/>
    <text x="172" y="86" text-anchor="middle" font-size="12.5" font-weight="800" fill="#8A5A2E">니크롬선 ${o.ohm ?? ""}</text>
    ${o.amp ? `${cfArrow(268, 52, 0)}<text x="268" y="32" text-anchor="middle" font-size="12" font-weight="800" fill="#8A6600">${o.amp}</text>` : ""}
    ${o.volt ? `<text x="164" y="124" text-anchor="middle" font-size="12.5" font-weight="800" fill="#2E5AA8">${o.volt}</text>` : ""}
    ${cfBattery(164, 152)}
  </svg>`;
}

/** EB elecEnergyBarFig · 전기 에너지 흐름 도식(1초 기준) · 입력 → 빛/열/운동 갈래.
 *  정답 판독이 과제이므로 aria는 값을 낭독하지 않는다. */
export function elecEnergyBarFig(o: { rows: { name: string; inW: number; parts: { label: string; w: number }[] }[] }): string {
  const H = o.rows.length * 92 + 8;
  const tone: Record<string, [string, string]> = {
    빛: ["#FFF3C4", "#C8A23E"],
    열: ["#FBE3E0", "#D06050"],
    운동: ["#E3EDFB", "#5B87C9"],
    소리: ["#EDE6FA", "#8F78AC"],
  };
  const row = (r: { name: string; inW: number; parts: { label: string; w: number }[] }, i: number): string => {
    const y = 10 + i * 92;
    const parts = r.parts
      .map((p, j) => {
        const px = 208;
        const py = y + 10 + j * 38;
        const [f, s] = tone[p.label] ?? ["#F0F3F7", "#9DAABD"];
        return `<path d="M168 ${y + 30} q20 ${py + 14 - (y + 30)} 36 ${py + 14 - (y + 30)}" stroke="#C4CAD2" stroke-width="1.8" fill="none"/>
          <path d="M${px - 6} ${py + 14}l8 -4.4v8.8z" fill="#C4CAD2"/>
          <rect x="${px + 4}" y="${py}" width="118" height="28" rx="8" fill="${f}" stroke="${s}" stroke-width="1.6"/>
          <text x="${px + 63}" y="${py + 18.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#4E5968">${p.label} ${p.w}W</text>`;
      })
      .join("");
    return `<rect x="14" y="${y + 8}" width="86" height="44" rx="9" fill="#F0F3F7" stroke="#C4CAD2" stroke-width="1.6"/>
      <text x="57" y="${y + 35}" text-anchor="middle" font-size="12" font-weight="700" fill="#333D4B">${r.name}</text>
      <path d="M100 ${y + 30}h20" stroke="#C4CAD2" stroke-width="1.8"/>
      <rect x="120" y="${y + 16}" width="48" height="28" rx="8" fill="#EAF3FC" stroke="#9FB6CE" stroke-width="1.6"/>
      <text x="144" y="${y + 34.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#2E5AA8">${r.inW}W</text>
      ${parts}`;
  };
  return `<svg viewBox="0 0 344 ${H}" ${NS} fill="none" role="img" aria-label="전기 기구가 1초 동안 쓰는 전기 에너지가 어떤 에너지로 얼마씩 바뀌는지 나타낸 흐름 그림 · 갈래의 값을 비교해 읽어요">
    ${o.rows.map(row).join("")}
  </svg>`;
}

/** CP elecCoilPolesFig · 코일·전지·나침반 파라미터판(기존 elecCoilCompassFig 고정판과 별개).
 *  variant "one" = 열린 스위치(닫기 직전) + 코일 오른쪽 끝 나침반 ㉠(바늘 남북 그대로 · 정답 미인쇄)
 *  variant "deflected" = 닫힌 스위치 + 바늘이 돌아가 멈춘 상태(동쪽) · "열면?" 문항용
 *  variant "two" = 코일 양 끝 나침반 ㉠㉡(바늘 없는 ? 원판 · 관계 판정이 과제라 정답 미인쇄)
 *  variant "pair" = 전지 방향만 반대인 (가)(나) 두 회로 비교(바늘 남북 그대로)
 *  variant "nail" = 쇠못 전자석 + 클립. 권선 앞뒤 판독을 요구하지 않는 구도(감싸쥐기 3D 판독 금지). */
export function elecCoilPolesFig(o: { variant: "one" | "deflected" | "two" | "pair" | "nail" }): string {
  const needleE = (x: number, y: number): string =>
    `<path d="M${x + 18} ${y}l-18 7 -18 -7 18 -7z" fill="#E0452E" transform="rotate(0 ${x} ${y})"/>
     <path d="M${x - 18} ${y}l18 -7v14z" fill="#B0B8C1"/>`;
  if (o.variant === "deflected") {
    const turns = [0, 1, 2, 3, 4]
      .map((i) => `<ellipse cx="${96 + i * 22}" cy="92" rx="11" ry="20" stroke="#C97F3A" stroke-width="4" fill="none"/>`)
      .join("");
    return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="코일과 전지, 닫힌 스위치로 이루어진 회로 · 코일 오른쪽 끝의 나침반 ㉠ 바늘이 옆으로 돌아가 멈춰 있다">
      ${cfWire("M85 92H74v66h57")}
      ${cfWire("M189 158h39M252 158h16v-66h-73")}
      ${turns}
      ${cfBattery(160, 150, 58, 24)}
      <circle cx="232" cy="158" r="4" fill="#5E6B7E"/><circle cx="252" cy="158" r="4" fill="#5E6B7E"/>
      <path d="M232 158h20" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="242" y="182" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치(닫힘)</text>
      <circle cx="300" cy="92" r="24" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      ${needleE(300, 92)}
      <text x="300" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>
      <text x="140" y="62" text-anchor="middle" font-size="11" fill="#8B95A1">코일</text>
    </svg>`;
  }
  if (o.variant === "two") {
    const turns = [0, 1, 2, 3, 4]
      .map((i) => `<ellipse cx="${130 + i * 22}" cy="92" rx="11" ry="20" stroke="#C97F3A" stroke-width="4" fill="none"/>`)
      .join("");
    return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="전류가 흐르는 코일의 양 끝에 나침반 ㉠과 ㉡이 하나씩 놓여 있는 회로 · 두 나침반의 바늘 방향은 가려져 있다">
      ${cfWire("M119 92h-9v66h44M229 92h9v66h-44")}
      ${turns}
      ${cfBattery(172, 150, 58, 24)}
      <circle cx="58" cy="92" r="24" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      <text x="58" y="99" text-anchor="middle" font-size="16" font-weight="800" fill="#8B95A1">?</text>
      <text x="58" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>
      <circle cx="292" cy="92" r="24" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      <text x="292" y="99" text-anchor="middle" font-size="16" font-weight="800" fill="#8B95A1">?</text>
      <text x="292" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉡</text>
      <text x="174" y="56" text-anchor="middle" font-size="11" fill="#8B95A1">전류가 흐르는 코일</text>
    </svg>`;
  }
  if (o.variant === "pair") {
    const mini = (ox: number, name: string, flip: boolean): string => {
      const turns = [0, 1, 2]
        .map((i) => `<ellipse cx="${ox + 34 + i * 18}" cy="92" rx="9" ry="16" stroke="#C97F3A" stroke-width="3.4" fill="none"/>`)
        .join("");
      return `<text x="${ox + 62}" y="24" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${name}</text>
      <path d="M${ox + 27} 92h-7v54h32M${ox + 95} 92h9v54h-34" stroke="#8B95A1" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${turns}
      ${cfBattery(ox + 62, 140, 44, 18, flip)}
      <circle cx="${ox + 128}" cy="92" r="19" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      <path d="M${ox + 128} 78l5.5 14 -5.5 14 -5.5 -14z" fill="#E0452E"/>
      <path d="M${ox + 128} 106l-5.5 -14h11z" fill="#B0B8C1"/>
      <text x="${ox + 128}" y="50" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">㉠</text>`;
    };
    return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="같은 코일과 나침반으로 만든 두 회로 (가)와 (나) · 전지의 방향만 서로 반대다">
      ${mini(8, "(가)", false)}
      ${mini(186, "(나)", true)}
    </svg>`;
  }
  if (o.variant === "one") {
    // 스위치는 아래 도선 위 열린 상태(들린 레버 + 실제 끊김) · 문두 "닫기 직전"과 일치.
    const turns = [0, 1, 2, 3, 4]
      .map((i) => `<ellipse cx="${96 + i * 22}" cy="92" rx="11" ry="20" stroke="#C97F3A" stroke-width="4" fill="none"/>`)
      .join("");
    return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="코일과 전지, 열린 스위치로 이루어진 회로 · 코일의 오른쪽 끝에 나침반 ㉠이 놓여 있고 바늘은 아직 남북을 가리킨다">
      ${cfWire("M85 92H74v66h57")}
      ${cfWire("M189 158h39M256 158h12v-66h-73")}
      ${turns}
      ${cfBattery(160, 150, 58, 24)}
      <circle cx="232" cy="158" r="4" fill="#5E6B7E"/><circle cx="252" cy="158" r="4" fill="#5E6B7E"/>
      <path d="M232 158l17 -12" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
      <text x="242" y="182" text-anchor="middle" font-size="10.5" fill="#8B95A1">스위치(닫기 직전)</text>
      <circle cx="300" cy="92" r="24" fill="#F7F9FC" stroke="#8B95A1" stroke-width="2"/>
      <path d="M300 74l7 18 -7 18 -7 -18z" fill="#E0452E"/>
      <path d="M300 110l-7 -18h14z" fill="#B0B8C1"/>
      <text x="300" y="42" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>
      <text x="140" y="62" text-anchor="middle" font-size="11" fill="#8B95A1">코일</text>
    </svg>`;
  }
  const turns = [0, 1, 2, 3, 4, 5]
    .map((i) => `<ellipse cx="${118 + i * 17}" cy="92" rx="8.5" ry="17" stroke="#C97F3A" stroke-width="3.4" fill="none"/>`)
    .join("");
  return `<svg viewBox="0 0 344 204" ${NS} fill="none" role="img" aria-label="쇠못에 코일을 감고 전지에 연결한 전자석 · 못의 뾰족한 끝에 클립이 붙어 있다">
    <path d="M96 92h-16v66h64M226 92h30v66h-40" stroke="#8B95A1" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M92 84h150l26 8 -26 8H92z" fill="#C3CBD6" stroke="#7C8798" stroke-width="1.8"/>
    ${turns}
    ${cfBattery(170, 150, 58, 24)}
    <text x="140" y="56" text-anchor="middle" font-size="11" fill="#8B95A1">쇠못에 감은 코일</text>
    <ellipse cx="266" cy="110" rx="4.5" ry="10" transform="rotate(14 266 110)" fill="none" stroke="#7C8798" stroke-width="2.2"/>
    <ellipse cx="266" cy="106.5" rx="2.6" ry="6" transform="rotate(14 266 106.5)" fill="none" stroke="#7C8798" stroke-width="1.4"/>
    <ellipse cx="280" cy="112" rx="4.5" ry="10" transform="rotate(-10 280 112)" fill="none" stroke="#7C8798" stroke-width="2.2"/>
    <ellipse cx="280" cy="108.5" rx="2.6" ry="6" transform="rotate(-10 280 108.5)" fill="none" stroke="#7C8798" stroke-width="1.4"/>
    <text x="292" y="146" text-anchor="middle" font-size="10.5" fill="#8B95A1">클립</text>
  </svg>`;
}

/** SW elecSwingExamFig · 말굽자석 틈의 코일 그네 사시도(자기장·전류·힘 3벡터는 2D 평면 불가 · 사시 관행).
 *  힘 후보 ㉮(안쪽·화면 뒤 대각)·㉯(바깥쪽·화면 앞 대각)만 표시하고 실제 힘 방향은 그리지 않는다.
 *  검산(F = IL×B · 오른손 좌표 x=오른쪽·y=위·z=화면 앞):
 *    기본: B = 아래팔(N)→위팔(S) = +y · 아래변 전류 I = 왼→오 = +x → F ∝ x̂×ŷ = +z = 앞 = ㉯.
 *    swapPoles(위 N·아래 S): B = −y → F = −z = ㉮. · revCurrent: I = −x → F = −z = ㉮.
 *    둘 다: F = +z = ㉯. 전류 반전판은 전원 (+)(−) 라벨까지 뒤집는다(극·전류 일관 관행). */
export function elecSwingExamFig(o?: { swapPoles?: boolean; revCurrent?: boolean }): string {
  const sp = o?.swapPoles ?? false;
  const rv = o?.revCurrent ?? false;
  const topPole = sp ? ["N", "#E8836B", "#A8442E"] : ["S", "#7FA6E8", "#2E5AA8"];
  const botPole = sp ? ["S", "#7FA6E8", "#2E5AA8"] : ["N", "#E8836B", "#A8442E"];
  // 사시 깊이축 = (+26, −14): 뒤(안쪽) = 오른쪽 위 대각. 슬랩 앞면 x 46~176, 틈 y 116~150.
  const slab = (y: number, [t, f, s]: string[]): string =>
    `<path d="M46 ${y}l26 -14h130l-26 14z" fill="${f}" opacity=".72" stroke="${s}" stroke-width="1.6"/>
     <path d="M176 ${y}l26 -14v20l-26 14z" fill="${f}" opacity=".55" stroke="${s}" stroke-width="1.6"/>
     <rect x="46" y="${y}" width="130" height="20" fill="${f}" stroke="${s}" stroke-width="1.8"/>
     <text x="104" y="${y + 15}" text-anchor="middle" font-size="13" font-weight="800" fill="#FFF">${t}</text>`;
  // 말굽자석 몸통(U자 연결부) · 위·아래 극 색을 반씩.
  const bridge = `<rect x="20" y="96" width="26" height="37" fill="${topPole[1]}" stroke="${topPole[2]}" stroke-width="1.8"/>
    <rect x="20" y="133" width="26" height="37" fill="${botPole[1]}" stroke="${botPole[2]}" stroke-width="1.8"/>`;
  const cur = (x: number, y: number, ang: number): string => cfArrow(x, y, rv ? ang + 180 : ang);
  // 자기장 화살표는 극 배치를 따라간다: 기본 N(아래)→S(위) = 위 방향 · swapPoles면 아래 방향.
  const field = sp
    ? `<path d="M66 120V144M61 138l5 7 5 -7" stroke="#5E6B7E" stroke-width="2" fill="none" stroke-dasharray="4 3"/>`
    : `<path d="M66 146V122M61 128l5 -7 5 7" stroke="#5E6B7E" stroke-width="2" fill="none" stroke-dasharray="4 3"/>`;
  const halo = `stroke="#FFF" stroke-width="3.4" paint-order="stroke" style="paint-order:stroke"`;
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="스탠드에 매단 코일 그네의 아래변이 옆으로 눕힌 말굽자석의 두 극 사이 틈에 들어가 있는 사시 그림 · 그네가 움직일 수 있는 두 방향에 ㉮(안쪽)와 ㉯(바깥쪽) 표시가 있다">
    <path d="M78 22h174" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    <path d="M78 22v-8M252 22v-8" stroke="#8B95A1" stroke-width="3"/>
    <path d="M112 22v18M170 22v18" stroke="#6E7B8E" stroke-width="2.6"/>
    <g stroke="#C97F3A" stroke-width="4.5" fill="none" stroke-linecap="round">
      <path d="M112 40v58l-6 35M170 40v58l6 35"/>
      <path d="M104 133h74"/>
    </g>
    ${bridge}
    ${slab(96, topPole)}
    ${slab(150, botPole)}
    ${field}
    <text x="66" y="112" text-anchor="middle" font-size="10.5" font-weight="700" fill="#4E5968" ${halo}>자기장</text>
    ${cur(110, 72, 90)}${cur(136, 133, 0)}${cur(172, 72, 270)}
    <text x="192" y="64" font-size="11" font-weight="700" fill="#8A6600" ${halo}>전류</text>
    <path d="M166 130l32 -17M198 113l-4.5 9.5M198 113l-10.5 0.5" stroke="#FFF" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M166 130l32 -17M198 113l-4.5 9.5M198 113l-10.5 0.5" stroke="#04B45F" stroke-width="2.4" fill="none"/>
    <text x="204" y="104" font-size="12.5" font-weight="800" fill="#04865F" ${halo}>㉮ 안쪽</text>
    <path d="M162 140l-32 17M130 157l10.5 -0.5M130 157l4.5 -9.5" stroke="#FFF" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M162 140l-32 17M130 157l10.5 -0.5M130 157l4.5 -9.5" stroke="#E0452E" stroke-width="2.4" fill="none"/>
    <text x="128" y="186" font-size="12.5" font-weight="800" fill="#C23B2E" ${halo}>㉯ 바깥쪽</text>
    <rect x="252" y="192" width="76" height="32" rx="7" fill="#AEBDD6" stroke="#4E5A70" stroke-width="1.6"/>
    <text x="${rv ? 312 : 270}" y="213" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">+</text>
    <text x="${rv ? 270 : 312}" y="212" text-anchor="middle" font-size="13" font-weight="800" fill="#333D4B">−</text>
    <text x="290" y="186" text-anchor="middle" font-size="10" fill="#8B95A1">전원</text>
    <path d="M252 200h-14V22M252 216h-22V22" stroke="#8B95A1" stroke-width="1.8" fill="none" opacity=".6"/>
  </svg>`;
}

// ── u7 v2 신작(파일럿 승격 · 재출제 3호) ──
// 다크 우주 문법(u7 섹션 계승): 밝은 반구 = 태양 쪽 · 회전 반시계 · figureDark: true.
const U7_IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
/** 조건 자료 상자(u7 v2 · 미래엔 2 계보 — 텍스트 조건 (가)(나)(다)). 시각자료로 집계한다. */
export const dbox = (rows: [string, string][]): string =>
  `<div style="border:1.5px solid #D9DFE6;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:7px">
    ${rows.map(([tag, body]) => `<div style="display:flex;gap:8px;font-size:13.2px;line-height:1.55;word-break:keep-all"><b style="flex:none;color:#4E5968">${tag}</b><span>${body}</span></div>`).join("")}
  </div>`;



/** SG 흑점 수 연도 그래프(다크·파라미터형) · 실제 태양 사이클 연도만 사용(극대 1957·1968·1979 ·
 *  극소 1954·1964·1976·1986). 레슨 sunspotGraphFig 창(1990~2010·극소 1996·극대 2000)과 분리.
 *  극대·극소 연도는 곡선 위 라벨로 직접 표기(눈금 사이 판독 오차 차단 · 정답 값은 라벨·눈금 위 원칙).
 *  가이드 점선 없음. peaks·dips는 [연도, 라벨 표시 여부]. */
export function sunspotCycleFig(o: { y0: number; y1: number; peaks: number[]; dips: number[]; labelPeaks?: boolean }): string {
  const L = 46;
  const R = 330;
  const TOP = 34;
  const BASE = 168;
  const HI = 58;
  const x = (yr: number): number => L + ((yr - o.y0) / (o.y1 - o.y0)) * (R - L);
  // 곡선: 극소(BASE 근처)와 극대(HI)를 번갈아 지나는 부드러운 산봉우리 열.
  const pts: [number, number][] = [];
  const knots = [...o.dips.map((y) => [y, BASE - 8] as [number, number]), ...o.peaks.map((y) => [y, HI] as [number, number])].sort((a, b) => a[0] - b[0]);
  if (knots.length && knots[0][0] > o.y0) pts.push([o.y0, BASE - 22]);
  pts.push(...knots);
  if (knots.length && knots[knots.length - 1][0] < o.y1) pts.push([o.y1, BASE - 30]);
  let d = `M${x(pts[0][0]).toFixed(1)} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [py, pv] = pts[i - 1];
    const [cy, cv] = pts[i];
    const mx = (x(py) + x(cy)) / 2;
    d += ` C${mx.toFixed(1)} ${pv}, ${mx.toFixed(1)} ${cv}, ${x(cy).toFixed(1)} ${cv}`;
  }
  let ticks = "";
  for (let yr = Math.ceil(o.y0 / 5) * 5; yr <= o.y1; yr += 5) {
    ticks += `<path d="M${x(yr).toFixed(1)} ${BASE}v5" stroke="#3D5378" stroke-width="1.6"/>
      <text x="${x(yr).toFixed(1)}" y="${BASE + 20}" text-anchor="middle" font-size="10.5" fill="#AFC3E3">${yr}</text>`;
  }
  const peakLabels = (o.labelPeaks ?? true)
    ? o.peaks.map((yr) => `<circle cx="${x(yr).toFixed(1)}" cy="${HI}" r="3.4" fill="#FFD25E"/>
        <text x="${x(yr).toFixed(1)}" y="${HI - 10}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#FFE9A8">${yr}년</text>`).join("")
    : "";
  return `<svg viewBox="0 0 344 214" ${NS} fill="none" role="img" aria-label="여러 해 동안 관측한 흑점 수의 변화 그래프. 가장 많았던 해가 곡선 위에 표시되어 있다">
    <path d="M${L} ${TOP - 10}V${BASE}H${R + 6}" stroke="#3D5378" stroke-width="2"/>
    <text x="${L - 8}" y="${TOP + 2}" text-anchor="end" font-size="10.5" fill="#AFC3E3">많음</text>
    <text x="${L - 8}" y="${BASE}" text-anchor="end" font-size="10.5" fill="#AFC3E3">적음</text>
    <text x="18" y="${(TOP + BASE) / 2}" text-anchor="middle" font-size="10.5" fill="#8FA6CE" transform="rotate(-90 18 ${(TOP + BASE) / 2})">흑점 수</text>
    ${ticks}
    <text x="${R}" y="${BASE + 34}" text-anchor="end" font-size="10.5" fill="#8FA6CE">연도(년)</text>
    <path d="${d}" stroke="#FFD25E" stroke-width="2.4"/>
    ${peakLabels}
  </svg>`;
}

/** SP 태양 실사 가림판(다크) · 실제 사진 위 기호 콜아웃만(이름 라벨 없음 · sunAnatomyFig의 시험판).
 *  normal: 백색광 전면(㉠ 둥근 표면 전체 · ㉡ 검은 점). eclipse: 개기일식(㉢ 밖으로 뻗은 진주빛).
 *  사진 좌표는 눈검수로 확정(흑점 위치에 ㉡이 실제로 닿는지 갤러리에서 판정). */
export function sunLabelFig(kind: "normal" | "eclipse"): string {
  if (kind === "normal") {
    return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="망원경으로 찍은 태양 전체 사진. 둥근 면 전체를 가리키는 기호와 표면의 검은 점 하나를 가리키는 기호가 붙어 있다">
      <defs><clipPath id="u7sp-n"><circle cx="172" cy="118" r="86"/></clipPath></defs>
      <g clip-path="url(#u7sp-n)"><image href="${U7_IMG_BASE}photos/sun_whitelight.jpg" x="80" y="26" width="184" height="184" preserveAspectRatio="xMidYMid slice"/></g>
      <circle cx="172" cy="118" r="86" stroke="rgba(224,150,40,.65)" stroke-width="1.6"/>
      <path d="M258 60L218 82" stroke="#8FB3E8" stroke-width="1.8"/>
      <circle cx="286" cy="52" r="15" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
      <text x="286" y="57" text-anchor="middle" font-size="13.5" font-weight="800" fill="#DCE8FF">㉠</text>
      <text x="286" y="82" text-anchor="middle" font-size="9.5" fill="#AFC3E3">둥근 면 전체</text>
      <path d="M84 178L163 118" stroke="#8FB3E8" stroke-width="1.8"/>
      <circle cx="174" cy="110" r="13" stroke="#8FB3E8" stroke-width="1.6" stroke-dasharray="4 3" fill="none"/>
      <circle cx="62" cy="186" r="15" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
      <text x="62" y="191" text-anchor="middle" font-size="13.5" font-weight="800" fill="#DCE8FF">㉡</text>
      <text x="62" y="214" text-anchor="middle" font-size="9.5" fill="#AFC3E3">검은 점</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="검게 가려진 둥근 천체 둘레로 밝은 빛이 멀리 뻗어 있는 사진. 그 빛을 가리키는 기호가 붙어 있다">
    <defs><clipPath id="u7sp-e"><circle cx="172" cy="118" r="92"/></clipPath></defs>
    <g clip-path="url(#u7sp-e)"><image href="${U7_IMG_BASE}photos/eclipse_corona.jpg" x="66" y="12" width="212" height="212" preserveAspectRatio="xMidYMid slice"/></g>
    <path d="M268 66L232 96" stroke="#8FB3E8" stroke-width="1.8"/>
    <circle cx="292" cy="56" r="15" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
    <text x="292" y="61" text-anchor="middle" font-size="13.5" font-weight="800" fill="#DCE8FF">㉢</text>
    <text x="292" y="86" text-anchor="middle" font-size="9.5" fill="#AFC3E3">밖으로 뻗은 빛</text>
  </svg>`;
}

/** SK 방향별 일주 궤적(다크·파라미터형) · 교과서 표준 구도(우리나라 기준):
 *  동쪽 하늘 = 오른쪽 위로 비스듬히 떠오름(↗) · 서쪽 하늘 = 오른쪽 아래로 비스듬히 짐(↘) ·
 *  남쪽 하늘 = 왼쪽(동)에서 오른쪽(서)으로 수평(→). 화살촉은 진행 방향(레슨 northSkyFig 검산 계보).
 *  choices 모드 = "북쪽 하늘을 오래 찍으면?" ①~⑤ 미니 컷(정답 ② 반시계 동심원 · shuffle:false 전용). */
export function skyTrailFig(o: { dir: "e" | "w" | "s"; choices?: boolean; hideLabel?: boolean }): string {
  // hideLabel: "어느 방향 하늘인가"를 묻는 문항용 · 방향 필을 "관측 기록"으로 중립화(검산 B-3 유출 차단).
  if (o.choices) {
    const mini = (cx: number, kind: string, num: string): string => {
      let art = "";
      if (kind === "ccw") art = `<circle cx="${cx}" cy="64" r="9" stroke="#BED6FF" stroke-width="1.4" stroke-dasharray="10 6"/><circle cx="${cx}" cy="64" r="17" stroke="#BED6FF" stroke-width="1.4" stroke-dasharray="18 9"/><path d="M${cx + 17} 64A17 17 0 0 0 ${cx} 47" stroke="#FFD25E" stroke-width="1.8"/><path d="M${cx - 2} 44l-5 4 6 3z" fill="#FFD25E"/><circle cx="${cx}" cy="64" r="1.8" fill="#FFF0C8"/>`;
      else if (kind === "cw") art = `<circle cx="${cx}" cy="64" r="9" stroke="#BED6FF" stroke-width="1.4" stroke-dasharray="10 6"/><circle cx="${cx}" cy="64" r="17" stroke="#BED6FF" stroke-width="1.4" stroke-dasharray="18 9"/><path d="M${cx + 17} 64A17 17 0 0 1 ${cx} 81" stroke="#FFD25E" stroke-width="1.8"/><path d="M${cx - 2} 84l-5-4 6-3z" fill="#FFD25E"/><circle cx="${cx}" cy="64" r="1.8" fill="#FFF0C8"/>`;
      else if (kind === "flat") art = `<path d="M${cx - 20} 56h40M${cx - 20} 66h40M${cx - 20} 76h40" stroke="#BED6FF" stroke-width="1.6"/><path d="M${cx + 22} 66l-7-3.5v7z" fill="#FFD25E" transform="rotate(180 ${cx + 18} 66)"/>`;
      else if (kind === "rise") art = `<path d="M${cx - 18} 80l28-24M${cx - 22} 68l28-24M${cx - 8} 86l28-24" stroke="#BED6FF" stroke-width="1.6"/><path d="M${cx + 12} 54l1-8-8 2z" fill="#FFD25E"/>`;
      else art = `<path d="M${cx - 22} 46q22 18 44 0M${cx - 22} 62q22 18 44 0M${cx - 22} 78q22 18 44 0" stroke="#BED6FF" stroke-width="1.6"/>`;
      return `${art}<text x="${cx}" y="108" text-anchor="middle" font-size="13" font-weight="800" fill="#DCE8FF">${num}</text>`;
    };
    return `<svg viewBox="0 0 344 128" ${NS} fill="none" role="img" aria-label="북쪽 하늘을 오랫동안 찍었을 때 나올 수 있는 별 궤적 다섯 가지 후보 그림">
      <rect x="4" y="8" width="336" height="112" rx="14" fill="#0E1830"/>
      ${mini(40, "rise", "①")}${mini(106, "ccw", "②")}${mini(172, "flat", "③")}${mini(238, "cw", "④")}${mini(304, "wave", "⑤")}
    </svg>`;
  }
  const label = o.hideLabel ? "관측 기록" : o.dir === "e" ? "동쪽 하늘" : o.dir === "w" ? "서쪽 하늘" : "남쪽 하늘";
  let sd = o.dir === "e" ? 7 : o.dir === "w" ? 11 : 17;
  const rnd = (): number => {
    sd = (sd * 48271) % 2147483647;
    return sd / 2147483647;
  };
  let lines = "";
  for (let i = 0; i < 13; i++) {
    const x0 = 24 + rnd() * 210;
    const y0 = 22 + rnd() * 96;
    const len = 52 + rnd() * 40;
    const op = (0.22 + rnd() * 0.3).toFixed(2);
    if (o.dir === "s") {
      lines += `<path d="M${x0.toFixed(0)} ${y0.toFixed(0)}h${len.toFixed(0)}" stroke="rgba(190,214,255,${op})" stroke-width="1.6"/><circle cx="${(x0 + len).toFixed(0)}" cy="${y0.toFixed(0)}" r="1.6" fill="rgba(226,238,255,.9)"/>`;
    } else if (o.dir === "e") {
      const dy = len * 0.62;
      lines += `<path d="M${x0.toFixed(0)} ${(y0 + dy).toFixed(0)}l${len.toFixed(0)} ${(-dy).toFixed(0)}" stroke="rgba(190,214,255,${op})" stroke-width="1.6"/><circle cx="${(x0 + len).toFixed(0)}" cy="${y0.toFixed(0)}" r="1.6" fill="rgba(226,238,255,.9)"/>`;
    } else {
      const dy = len * 0.62;
      lines += `<path d="M${x0.toFixed(0)} ${y0.toFixed(0)}l${len.toFixed(0)} ${dy.toFixed(0)}" stroke="rgba(190,214,255,${op})" stroke-width="1.6"/><circle cx="${(x0 + len).toFixed(0)}" cy="${(y0 + dy).toFixed(0)}" r="1.6" fill="rgba(226,238,255,.9)"/>`;
    }
  }
  const arrow =
    o.dir === "s"
      ? `<path d="M118 128h84" stroke="#FFD25E" stroke-width="2.4"/><path d="M211 128l-9-4.5v9z" fill="#FFD25E"/>`
      : o.dir === "e"
        ? `<path d="M128 150l64-40" stroke="#FFD25E" stroke-width="2.4"/><path d="M196 106l-10-1 4 9z" fill="#FFD25E"/>`
        : `<path d="M128 110l64 40" stroke="#FFD25E" stroke-width="2.4"/><path d="M196 154l-4-9-6 8z" fill="#FFD25E"/>`;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="한 방향 하늘을 오랫동안 찍은 별 궤적 그림. 궤적이 기울어진 모양과 노란 화살표가 별이 움직인 방향을 나타내고, 아래에 지평선이 있다">
    <rect x="4" y="6" width="336" height="172" rx="14" fill="#0E1830"/>
    ${lines}
    ${arrow}
    <path d="M10 168q80-22 160-10t164 2v8a10 10 0 0 1-10 10H20a10 10 0 0 1-10-10z" fill="#04080F" stroke="#3D5378" stroke-width="1.4"/>
    <text x="30" y="174" font-size="9.5" fill="#7E93B8">지평선</text>
    <rect x="130" y="184" width="84" height="20" rx="10" fill="#16233F" stroke="#2C4066" stroke-width="1"/>
    <text x="172" y="198" text-anchor="middle" font-size="11" font-weight="700" fill="#BFD4F2">${label}</text>
  </svg>`;
}

/** SS2 북쪽 하늘 위치 후보(다크) · 북극성 중심 원 궤도 + 30도 간격 눈금 틱 + 별 A + 후보 ㉠~㉤.
 *  offsets = A로부터의 각도(반시계 +). 후보 라벨은 offsets 순서대로 ㉠~㉤.
 *  [검산] 시계 반대 = 수학 각 증가 방향. 정답 후보가 ㉠(첫 보기)이 되지 않게 배치할 것. */
export function starSpinChoiceFig(o: { fromDeg: number; offsets: number[] }): string {
  const cx = 172;
  const cy = 116;
  const R = 80;
  const pos = (d: number, r: number): [number, number] => [cx + Math.cos((d * Math.PI) / 180) * r, cy - Math.sin((d * Math.PI) / 180) * r];
  let ticks = "";
  for (let d = 0; d < 360; d += 30) {
    const [tx1, ty1] = pos(d, R - 4);
    const [tx2, ty2] = pos(d, R + 4);
    ticks += `<path d="M${tx1.toFixed(1)} ${ty1.toFixed(1)}L${tx2.toFixed(1)} ${ty2.toFixed(1)}" stroke="#3D5378" stroke-width="1.6"/>`;
  }
  const [ax, ay] = pos(o.fromDeg, R);
  const G = ["㉠", "㉡", "㉢", "㉣", "㉤"];
  const cands = o.offsets
    .map((off, i) => {
      const [px, py] = pos(o.fromDeg + off, R);
      const [lx, ly] = pos(o.fromDeg + off, R + 22);
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.6" stroke="#8FB3E8" stroke-width="1.6" stroke-dasharray="3 3"/>
        <text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="800" fill="#DCE8FF">${G[i]}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 232" ${NS} fill="none" role="img" aria-label="북쪽 하늘 그림. 가운데 북극성이 있고 원 궤도에 30도 간격 눈금이 있다. 별 A와 다섯 개의 점선 원 후보 자리가 표시되어 있다">
    <circle cx="${cx}" cy="${cy}" r="${R}" stroke="#2C4066" stroke-width="1.4" stroke-dasharray="4 5"/>
    ${ticks}
    <circle cx="${cx}" cy="${cy}" r="4.6" fill="#FFE9A8"/>
    <text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="10.5" fill="#AFC3E3">북극성</text>
    <text x="${cx + 42}" y="${cy - 4}" font-size="9.5" fill="#7E93B8">눈금 간격 30°</text>
    <circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="5.6" fill="#EDE2BE"/>
    <text x="${(ax + 15).toFixed(1)}" y="${(ay + 4).toFixed(1)}" font-size="12.5" font-weight="700" fill="#DCE8FF">A</text>
    ${cands}
    <path d="M24 222h296" stroke="#3D5378" stroke-width="2"/>
    <text x="322" y="216" text-anchor="end" font-size="10" fill="#7E93B8">지평선</text>
  </svg>`;
}

/** ZE 황도 12궁(다크·파라미터형) · 레슨 zodiacQuizFig(㉠=5월·양↔천칭)와 별개 시험판: 지구 위치가
 *  파라미터. earthDeg = 지구가 놓인 별자리 쪽 각도(그 별자리 "앞"). 별자리 배열은 레슨과 동일 각도표.
 *  [검산] 태양 쪽(못 보는) 별자리 = earthDeg+180 · 한밤 남쪽 별자리 = earthDeg. 두 점선(태양 방향·
 *  반대 방향)이 판독 장치. 전 별자리 같은 스타일(강조 금지 · 정답 유추 방지). */
export function zodiacExamFig(o: { earthDeg: number }): string {
  const names: [string, number][] = [
    ["게", 0], ["쌍둥이", 30], ["황소", 60], ["양", 90], ["물고기", 120], ["물병", 150],
    ["염소", 180], ["궁수", 210], ["전갈", 240], ["천칭", 270], ["처녀", 300], ["사자", 330],
  ];
  const cx = 172;
  const cy = 108;
  const R = 84;
  let ring = "";
  for (const [n, deg] of names) {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R * 0.82;
    ring += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="#9FB6DC"/>
      <text x="${x.toFixed(1)}" y="${(y - 7).toFixed(1)}" fill="#9FB6DC" font-size="9.5" text-anchor="middle">${n}</text>`;
  }
  const ea = (o.earthDeg * Math.PI) / 180;
  const eR = R - 26;
  const ex = cx + Math.cos(ea) * eR;
  const ey = cy + Math.sin(ea) * eR * 0.82;
  const ox = cx + Math.cos(ea) * (R - 8);
  const oy = cy + Math.sin(ea) * (R - 8) * 0.82;
  const sx = cx - Math.cos(ea) * (R - 8);
  const sy = cy - Math.sin(ea) * (R - 8) * 0.82;
  return `<svg viewBox="0 0 344 224" ${NS} fill="none" role="img" aria-label="가운데 태양을 두고 열두 별자리가 빙 둘러 있는 그림. 궤도 위의 지구에서 태양 방향과 그 반대 방향으로 점선이 그어져 있다">
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.82}" stroke="#3D5378" stroke-width="1.3" stroke-dasharray="3 4"/>
    ${ring}
    <circle cx="${cx}" cy="${cy}" r="10" fill="url(#u7ze-sun)"/>
    <text x="${cx + 20}" y="${cy + 4}" fill="#FFC85E" font-size="9.5">태양</text>
    <path d="M${ex.toFixed(1)} ${ey.toFixed(1)}L${sx.toFixed(1)} ${sy.toFixed(1)}" stroke="rgba(255,170,80,.55)" stroke-width="1.3" stroke-dasharray="4 4"/>
    <path d="M${ex.toFixed(1)} ${ey.toFixed(1)}L${ox.toFixed(1)} ${oy.toFixed(1)}" stroke="rgba(140,190,255,.6)" stroke-width="1.3" stroke-dasharray="4 4"/>
    <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="6" fill="url(#u7ze-ea)"/>
    <text x="${(ex - Math.cos(ea) * 24).toFixed(1)}" y="${(ey - Math.sin(ea) * 0.82 * 24 + 4).toFixed(1)}" fill="#BFD8FF" font-size="10.5" font-weight="700" text-anchor="middle">지구</text>
    <defs>
      <radialGradient id="u7ze-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFEDBE"/><stop offset="1" stop-color="#FFB03A"/></radialGradient>
      <radialGradient id="u7ze-ea" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/></radialGradient>
    </defs>
  </svg>`;
}

/** EO 지구 낮밤 관측자(다크) · 북극 위에서 본 조감. 햇빛 오른쪽 · 자전 반시계.
 *  [검산] 오른쪽 절반 = 낮. 반시계 자전이므로 A(오른쪽) = 한낮 · B(위) = 해 질 무렵(밝은 쪽 → 어두운
 *  쪽으로 넘어감) · C(왼쪽) = 한밤 · D(아래) = 해 뜰 무렵(어두운 쪽 → 밝은 쪽). */
export function earthDayNightFig(): string {
  const cx = 156;
  const cy = 118;
  const R = 62;
  const obs = (deg: number, name: string): string => {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R;
    const y = cy - Math.sin(a) * R;
    const lx = cx + Math.cos(a) * (R + 22);
    const ly = cy - Math.sin(a) * (R + 22);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.4" fill="#FFE9A8" stroke="#B98A3A" stroke-width="1.2"/>
      <text x="${lx.toFixed(1)}" y="${(ly + 5).toFixed(1)}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#DCE8FF">${name}</text>`;
  };
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="북극 위에서 내려다본 지구 그림. 오른쪽에서 햇빛이 들어와 오른쪽 절반이 밝고, 지구 둘레 네 곳에 관측자 A, B, C, D가 표시되어 있으며 자전 방향 화살표는 시계 반대 방향이다">
    <defs>
      <clipPath id="u7eo-day"><rect x="${cx}" y="${cy - R - 2}" width="${R + 4}" height="${R * 2 + 4}"/></clipPath>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#16233F" stroke="#3D5378" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#2E5FA8" clip-path="url(#u7eo-day)"/>
    <path d="M${cx} ${cy - R}V${cy + R}" stroke="#5A6C8E" stroke-width="1.2" stroke-dasharray="4 4"/>
    <path d="M${cx - 18} ${cy - 8}q6-6 12-2t12 0" stroke="#7CA65A" stroke-width="1.6"/>
    <path d="M${cx + 8} ${cy + 18}q8-4 16 0" stroke="#7CA65A" stroke-width="1.6"/>
    <path d="M${cx + 30} ${cy - R - 26}a${R + 30} ${R + 30} 0 0 1 -60 0" stroke="#8FB3E8" stroke-width="2" fill="none" stroke-dasharray="6 5"/>
    <path d="M${cx - 30} ${cy - R - 22}l-4-8 9-1z" fill="#8FB3E8"/>
    <text x="${cx}" y="${cy - R - 36}" text-anchor="middle" font-size="10" fill="#8FB3E8">자전 방향(서 → 동)</text>
    ${obs(0, "A")}${obs(90, "B")}${obs(180, "C")}${obs(270, "D")}
    <g stroke="#FFC24E" stroke-width="3"><path d="M336 88l-18 0M336 118l-18 0M336 148l-18 0"/></g>
    <path d="M318 88l7-4v8zM318 118l7-4v8zM318 148l7-4v8z" fill="#FFC24E"/>
    <text x="327" y="170" fill="#FFD79E" font-size="9.5" text-anchor="middle">햇빛</text>
  </svg>`;
}

/** MO 달 공전 위치판(다크·파라미터형) · 지구 중심 4위치. moonPhase8Fig(반구 인쇄 8위치)와 역할 분리:
 *  달 원판은 중립 회색(위상 미인쇄 · 위치→위상 추론이 과제). 햇빛 오른쪽 고정.
 *  [검산] 오른쪽 = 삭 자리 · 위 = 상현 자리 · 왼쪽 = 망 자리 · 아래 = 하현 자리(반시계 공전).
 *  labels = [오른쪽, 위, 왼쪽, 아래] 순 라벨 문자열. arrow = 반시계 공전 화살표 표시. */
export function moonPosFig(o: { labels: [string, string, string, string]; arrow?: boolean }): string {
  const cx = 156;
  const cy = 112;
  const R = 66;
  const spots = [0, 90, 180, 270].map((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R;
    const y = cy - Math.sin(a) * R * 0.88;
    const lx = cx + Math.cos(a) * (R + 24);
    const ly = cy - Math.sin(a) * (R * 0.88 + 22);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#3A4560" stroke="#5A6C8E" stroke-width="1.2"/>
      <text x="${lx.toFixed(1)}" y="${(ly + 5.5).toFixed(1)}" fill="#DCE8FF" font-size="14.5" font-weight="800" text-anchor="middle">${o.labels[i]}</text>`;
  }).join("");
  const arrow = o.arrow
    ? `<path d="M${cx + R - 6} ${cy - 26}A${R} ${R * 0.88} 0 0 0 ${cx + 22} ${cy - R * 0.88 + 3}" stroke="#8FB3E8" stroke-width="2" fill="none"/>
       <path d="M${cx + 18} ${cy - R * 0.88 - 3}l-8 3 5 6z" fill="#8FB3E8"/>
       <text x="${cx + R + 4}" y="${cy - 40}" font-size="9.5" fill="#8FB3E8">공전 방향</text>`
    : "";
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="지구를 중심으로 한 달의 공전 궤도 그림. 햇빛은 오른쪽에서 들어오고, 궤도 위 네 곳에 달의 자리가 표시되어 있다. 달의 밝은 부분은 그리지 않은 중립 그림">
    <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * 0.88}" stroke="#3D5378" stroke-width="1.4" stroke-dasharray="4 5"/>
    ${spots}
    ${arrow}
    <circle cx="${cx}" cy="${cy}" r="12" fill="url(#u7mo-earth)"/>
    <path d="M${cx - 5} ${cy - 2}q3-3 6-1t6 0" stroke="#7CA65A" stroke-width="1.6"/>
    <text x="${cx}" y="${cy + 28}" fill="#BFD8FF" font-size="9.5" text-anchor="middle">지구</text>
    <defs><radialGradient id="u7mo-earth" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/></radialGradient></defs>
    <g stroke="#FFC24E" stroke-width="3"><path d="M336 82l-16 0M336 112l-16 0M336 142l-16 0"/></g>
    <path d="M320 82l7-4v8zM320 112l7-4v8zM320 142l7-4v8z" fill="#FFC24E"/>
    <text x="328" y="164" fill="#FFD79E" font-size="9.5" text-anchor="middle">태양 빛</text>
  </svg>`;
}

/** EA 세 천체 배열(다크·파라미터형) · 그림자 없이 배열만(eclipseShadowFig의 그림자 판독과 역할 분리).
 *  kind solar = 태양 · 달 · 지구 차례(일식 배치) · lunar = 태양 · 지구 · 달(월식 배치).
 *  tilt = 달이 일직선에서 위로 벗어난 컷(궤도 기울어짐 · 얇은 그림자 띠가 지구 위를 비껴감).
 *  [검산] 천체 이름은 라벨로 인쇄(배열 판정이 과제 · 이름 동정이 과제가 아님). */
export function eclipseAlignFig(o: { kind: "solar" | "lunar"; tilt?: boolean }): string {
  const defs = `<defs>
    <radialGradient id="u7ea-sun" cx=".5" cy=".5" r=".9"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2A93B"/></radialGradient>
    <radialGradient id="u7ea-earth" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9FC6F4"/><stop offset="1" stop-color="#2E6FD4"/></radialGradient>
    <radialGradient id="u7ea-moon" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#D8D2C0"/><stop offset="1" stop-color="#8E8874"/></radialGradient>
  </defs>`;
  const sun = `<circle cx="52" cy="96" r="34" fill="url(#u7ea-sun)"/><text x="52" y="146" text-anchor="middle" font-size="10.5" fill="#FFD79E">태양</text>`;
  if (o.tilt) {
    // [검산] 달은 지구를 도는 위성이라 지구 곁의 기울어진 궤도(타원) 위, 태양 쪽 끝에 그린다
    // (검수 지적: 태양 쪽에 붕 뜬 초판은 삭의 자리로 안 읽힘). 그림자 띠는 태양(52,96)→달(241,64)
    // 연장선 · 지구 x구간(262~322)에서 띠 아래변이 지구 윗변(y66)보다 위를 지나 비껴간다.
    // 기울기는 시각 과장(캡션 명시 · 수치 라벨 없음 · 5° 직접 묻기 금지 원칙).
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="태양과 지구 사이에서, 지구 둘레를 도는 달의 궤도가 기울어져 달이 일직선보다 위로 벗어나 있는 그림. 달의 그림자 띠가 지구 위쪽을 비껴 지나간다">
      ${defs}
      ${sun}
      <path d="M96 96H332" stroke="#5A6C8E" stroke-width="1.2" stroke-dasharray="5 5"/>
      <text x="118" y="110" font-size="9" fill="#5A7396">태양과 지구를 잇는 선</text>
      <ellipse cx="292" cy="96" rx="60" ry="13" transform="rotate(32 292 96)" stroke="#8FB3E8" stroke-width="1.2" stroke-dasharray="4 4"/>
      <path d="M216 144L259 94" stroke="#8FB3E8" stroke-width="1"/>
      <text x="196" y="156" text-anchor="middle" font-size="9.5" fill="#8FB3E8">달의 공전 궤도(기울어짐)</text>
      <circle cx="241" cy="64" r="9" fill="url(#u7ea-moon)"/>
      <text x="241" y="46" text-anchor="middle" font-size="10.5" fill="#BFD4F2">달</text>
      <path d="M249 60L336 46L336 56L250 69z" fill="rgba(10,16,32,.55)"/>
      <text x="296" y="40" text-anchor="middle" font-size="9.5" fill="#8FA6CE">달의 그림자</text>
      <circle cx="292" cy="96" r="30" fill="url(#u7ea-earth)"/>
      <path d="M282 78q6-4 12-2M278 108q8 5 16 3" stroke="#7CA65A" stroke-width="2"/>
      <text x="292" y="146" text-anchor="middle" font-size="10.5" fill="#BFD8FF">지구</text>
      <text x="172" y="182" text-anchor="middle" font-size="9" fill="#66788F">궤도 기울기는 실제보다 과장해 그렸어요</text>
    </svg>`;
  }
  const mid = o.kind === "solar"
    ? `<circle cx="176" cy="96" r="9" fill="url(#u7ea-moon)"/><text x="176" y="120" text-anchor="middle" font-size="10.5" fill="#BFD4F2">달</text>
       <circle cx="292" cy="96" r="30" fill="url(#u7ea-earth)"/><path d="M282 78q6-4 12-2M278 108q8 5 16 3" stroke="#7CA65A" stroke-width="2"/><text x="292" y="146" text-anchor="middle" font-size="10.5" fill="#BFD8FF">지구</text>`
    : `<circle cx="192" cy="96" r="30" fill="url(#u7ea-earth)"/><path d="M182 78q6-4 12-2M178 108q8 5 16 3" stroke="#7CA65A" stroke-width="2"/><text x="192" y="146" text-anchor="middle" font-size="10.5" fill="#BFD8FF">지구</text>
       <circle cx="296" cy="96" r="9" fill="url(#u7ea-moon)"/><text x="296" y="120" text-anchor="middle" font-size="10.5" fill="#BFD4F2">달</text>`;
  return `<svg viewBox="0 0 344 170" ${NS} fill="none" role="img" aria-label="태양과 두 천체가 한 줄로 늘어선 배열 그림. 각 천체에 이름이 붙어 있다">
    ${defs}
    ${sun}
    <path d="M96 96H332" stroke="#5A6C8E" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${mid}
  </svg>`;
}

/** EP 식 진행 컷(다크·파라미터형) · mode next: 진행 (가)(나) 두 컷 + 다음 모습 후보 ①~⑤.
 *  [검산 · 진행 방향 규칙] 일식 = 태양의 오른쪽(서쪽)부터 가려진다 · 월식 = 달의 왼쪽(동쪽)부터
 *  가려진다(남쪽 하늘 기준 · 근거는 달의 서에서 동으로 가는 공전). 정답 컷은 ②에 배치(shuffle:false).
 *  개기월식 컷의 달 색은 모식(실제 붉은 색감은 사진 몫). */
export function eclipseProgressFig(o: { kind: "solar" | "lunar"; mode?: "next" | "order" | "label" }): string {
  const sunDisk = (cx: number, cy: number, r: number, cover: number, fromRight: boolean): string => {
    const off = (1.55 - cover * 1.35) * r * (fromRight ? 1 : -1);
    return `<defs>${cover === 0 ? "" : ""}</defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFD879"/>
      ${cover > 0 ? `<circle cx="${(cx + off).toFixed(1)}" cy="${cy}" r="${r * 1.02}" fill="#0E1830"/>` : ""}
      <circle cx="${cx}" cy="${cy}" r="${r}" stroke="#B98A3A" stroke-width="1" fill="none"/>`;
  };
  const moonDisk = (cx: number, cy: number, r: number, cover: number, fromLeft: boolean): string => {
    const off = (1.55 - cover * 1.35) * r * (fromLeft ? -1 : 1);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#EDE2BE"/>
      ${cover > 0 ? `<circle cx="${(cx + off).toFixed(1)}" cy="${cy}" r="${r * 1.06}" fill="#1A2438" opacity=".94"/>` : ""}
      <circle cx="${cx}" cy="${cy}" r="${r}" stroke="#7E93B8" stroke-width="1" fill="none"/>`;
  };
  const disk = (cx: number, cy: number, r: number, cover: number, correctDir: boolean): string =>
    o.kind === "solar" ? sunDisk(cx, cy, r, cover, correctDir) : moonDisk(cx, cy, r, cover, correctDir);
  const capt = o.kind === "solar" ? "일식이 진행되는 모습(남쪽 하늘 기준)" : "월식이 진행되는 모습(남쪽 하늘 기준)";
  if (o.mode === "order") {
    // 순서 배열판(월식 342용): 세 장면을 순서 없이 (가)(나)(다) 나열. [검산] 문두를 "가려지는 동안"으로
    // 한정해야 복원 국면 역순의 복수 정답이 차단된다. 정답 순서 = (나) 온달 → (다) 살짝 → (가) 절반
    // (월식은 달의 왼쪽부터 · fromLeft = true).
    return `<svg viewBox="0 0 344 152" ${NS} fill="none" role="img" aria-label="월식이 진행되는 동안의 세 장면을 순서 없이 늘어놓은 그림. 달이 가려진 정도가 장면마다 다르다">
      <rect x="4" y="6" width="336" height="140" rx="14" fill="#0E1830"/>
      <text x="172" y="26" text-anchor="middle" font-size="10.5" fill="#8FA6CE">월식이 진행되는 동안의 세 장면(순서 없이 나열 · 남쪽 하늘 기준)</text>
      ${disk(70, 78, 26, 0.5, true)}
      <text x="70" y="126" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(가)</text>
      ${disk(172, 78, 26, 0, true)}
      <text x="172" y="126" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(나)</text>
      ${disk(274, 78, 26, 0.22, true)}
      <text x="274" y="126" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(다)</text>
    </svg>`;
  }
  if (o.mode === "label") {
    // 라벨판(일식 359용): 태양 원판 양 가장자리 ㉮(왼쪽)·㉯(오른쪽)만. 달은 그리지 않는다(접근 방향
    // 인쇄 = 정답 유출). [검산] 먼저 가려지는 쪽 = ㉯(오른쪽 · 서쪽) · 근거는 달의 서→동 공전.
    return `<svg viewBox="0 0 344 172" ${NS} fill="none" role="img" aria-label="곧 일식이 시작될 태양 원판 그림. 왼쪽 가장자리와 오른쪽 가장자리에 기호가 붙어 있다">
      <rect x="4" y="6" width="336" height="160" rx="14" fill="#0E1830"/>
      <text x="172" y="28" text-anchor="middle" font-size="10.5" fill="#8FA6CE">곧 일식이 시작돼요(남쪽 하늘 기준)</text>
      ${sunDisk(172, 96, 42, 0, true)}
      <circle cx="106" cy="96" r="14" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
      <text x="106" y="101" text-anchor="middle" font-size="13" font-weight="800" fill="#DCE8FF">㉮</text>
      <path d="M120 96h8" stroke="#8FB3E8" stroke-width="1.6"/>
      <circle cx="238" cy="96" r="14" fill="#12203C" stroke="#8FB3E8" stroke-width="1.4"/>
      <text x="238" y="101" text-anchor="middle" font-size="13" font-weight="800" fill="#DCE8FF">㉯</text>
      <path d="M224 96h-8" stroke="#8FB3E8" stroke-width="1.6"/>
    </svg>`;
  }
  const cand = (cx: number, num: string, cover: number, correctDir: boolean): string =>
    `${disk(cx, 168, 17, cover, correctDir)}<text x="${cx}" y="206" text-anchor="middle" font-size="13" font-weight="800" fill="#DCE8FF">${num}</text>`;
  return `<svg viewBox="0 0 344 218" ${NS} fill="none" role="img" aria-label="식이 진행되는 두 장면 (가), (나)와 다음에 올 모습 후보 다섯 개가 그려진 그림">
    <rect x="4" y="6" width="336" height="206" rx="14" fill="#0E1830"/>
    <text x="172" y="26" text-anchor="middle" font-size="10.5" fill="#8FA6CE">${capt}</text>
    ${disk(100, 62, 24, 0.22, true)}
    <text x="100" y="104" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(가)</text>
    <path d="M148 62h32M173 56l9 6-9 6z" fill="#8FB3E8" stroke="#8FB3E8" stroke-width="1.6"/>
    ${disk(238, 62, 24, 0.5, true)}
    <text x="238" y="104" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">(나)</text>
    <path d="M20 122h304" stroke="#2C4066" stroke-width="1.2"/>
    <text x="28" y="139" font-size="10" fill="#8FA6CE">바로 다음에 올 모습은?</text>
    ${cand(46, "①", 0, true)}
    ${cand(109, "②", 0.78, true)}
    ${cand(172, "③", 0.5, false)}
    ${cand(235, "④", 0.22, true)}
    ${cand(298, "⑤", 0.78, false)}
  </svg>`;
}

/** PD 행성 분류 순서도(라이트) · 코딩 분기(천재 06 계보 · 질문·행성 세트는 자체 제작).
 *  [검산] 질문 1 "표면에 충돌 구덩이가 많고 대기가 거의 없는가" 예 = A(수성) · 아니요 → 질문 2
 *  "뚜렷하고 큰 고리를 가졌는가" 예 = B(토성) · 아니요 = C(해왕성). 결론 칸은 각자 분리(수렴 금지). */
export function planetFlowFig(q1: string, q2: string, o?: { names?: string; reveal?: [string, string, string]; hideQ2?: boolean }): string {
  const box = (x: number, y: number, w: number, h: number, txt: string, fill = "#F7F9FC"): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="#C9D2DD" stroke-width="1.4"/>
     ${txt}`;
  const t = (x: number, y: number, s: string, size = 11.5, w = 700, fill = "#333D4B"): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="${w}" fill="${fill}">${s}</text>`;
  const names = o?.names ?? "수성 · 토성 · 해왕성";
  const r1 = o?.reveal?.[0] ?? "A";
  const r2 = o?.reveal?.[1] ?? "B";
  const r3 = o?.reveal?.[2] ?? "C";
  const rs = o?.reveal ? 12 : 14;
  const q2txt = o?.hideQ2 ? `${t(234, 133, "㉠ ?", 13)}${t(234, 149, "(질문 2)", 9.5, 600, "#8B95A1")}` : `${t(234, 133, q2, 11)}${t(234, 149, "(질문 2)", 9.5, 600, "#8B95A1")}`;
  return `<svg viewBox="0 0 344 218" ${NS} fill="none" role="img" aria-label="행성을 두 가지 질문으로 나누는 순서도. 질문마다 예와 아니요 갈래가 있고 끝 칸은 세 곳으로 갈라진다">
    ${box(92, 10, 160, 30, t(172, 29, names, 12), "#EEF4FF")}
    <path d="M172 40v14" stroke="#8B95A1" stroke-width="1.6"/>
    ${box(52, 54, 240, 40, `${t(172, 71, q1, 11)}${t(172, 87, "(질문 1)", 9.5, 600, "#8B95A1")}`)}
    <path d="M90 94v22M234 94v22" stroke="#8B95A1" stroke-width="1.6"/>
    ${t(76, 110, "예", 10.5, 700, "#04B45F")}${t(248, 110, "아니요", 10.5, 700, "#F04452")}
    ${box(58, 116, 64, 32, t(90, 137, r1, rs), "#FFF7E8")}
    ${box(140, 116, 188, 40, q2txt)}
    <path d="M196 156v22M296 156v22" stroke="#8B95A1" stroke-width="1.6"/>
    ${t(182, 172, "예", 10.5, 700, "#04B45F")}${t(312, 172, "아니요", 10.5, 700, "#F04452")}
    ${box(160, 178, 72, 32, t(196, 199, r2, rs), "#FFF7E8")}
    ${box(260, 178, 72, 32, t(296, 199, r3, rs), "#FFF7E8")}
  </svg>`;
}

/** PC 위상 카드 셔플판(다크) · 다섯 모양 카드 (가)~(마)를 뒤섞어 나열(순서 배열 문항 전용 ·
 *  fivePhasesFig의 고정 ①~⑤ 제시와 구분). shapes = 카드 순서대로 위상 키.
 *  [검산] 모양: new=거의 안 보임 · crescent=오른쪽 가는 조각 · first=오른쪽 반 · full=온면 ·
 *  last=왼쪽 반(밝은 쪽 = 태양 쪽 원칙의 지구 시점판). */
export function phaseCardsFig(shapes: ("new" | "crescent" | "first" | "full" | "last")[]): string {
  const moon = (cx: number, kind: string): string => {
    const r = 16;
    const base = `<circle cx="${cx}" cy="58" r="${r}" fill="#232E48" stroke="#5A6C8E" stroke-width="1"/>`;
    if (kind === "new") return base;
    if (kind === "full") return `<circle cx="${cx}" cy="58" r="${r}" fill="#EDE2BE" stroke="#B9AE8C" stroke-width="1"/>`;
    if (kind === "first") return `${base}<path d="M${cx} ${58 - r}a${r} ${r} 0 0 1 0 ${r * 2}z" fill="#EDE2BE"/>`;
    if (kind === "last") return `${base}<path d="M${cx} ${58 - r}a${r} ${r} 0 0 0 0 ${r * 2}z" fill="#EDE2BE"/>`;
    return `${base}<path d="M${cx} ${58 - r}a${r} ${r} 0 0 1 0 ${r * 2}a${r * 1.5} ${r * 1.5} 0 0 0 0 ${-r * 2}z" fill="#EDE2BE"/>`;
  };
  const tags = ["(가)", "(나)", "(다)", "(라)", "(마)"];
  return `<svg viewBox="0 0 344 118" ${NS} fill="none" role="img" aria-label="뒤섞어 놓은 달의 다섯 가지 모양 카드. 각 카드에 가나다 순서 기호가 붙어 있다">
    <rect x="4" y="6" width="336" height="106" rx="14" fill="#0E1830"/>
    ${shapes.map((k, i) => `${moon(44 + i * 64, k)}<text x="${44 + i * 64}" y="98" text-anchor="middle" font-size="12" font-weight="700" fill="#DCE8FF">${tags[i]}</text>`).join("")}
  </svg>`;
}

/** WS 같은 시각 서쪽 하늘 연속 관측(다크) · 15일 간격 3컷(천재 11 계보 · 별자리는 가상 점군).
 *  [검산] 해 진 직후 서쪽 하늘: 같은 별자리가 날이 갈수록 태양 쪽(지평선 쪽)으로 낮아진다 =
 *  태양이 별자리 사이를 서에서 동으로 이동(연주 운동)한 결과. 컷 순서 (가)→(나)→(다). */
export function westSkyFig(o?: { v?: 2 }): string {
  // v 2 = 별자리 모양·높이·간격(10일)이 다른 두 번째 자료셋(같은 그림 두 문항 금지 · 자료셋 배타).
  const alt = o?.v === 2;
  const cut = (x0: number, tag: string, starY: number): string => {
    const pts = alt
      ? [[0, 0], [12, -14], [28, -8], [40, -18], [18, -24], [34, 2]]
      : [[0, 0], [14, -10], [26, -2], [36, -14], [22, -22]];
    const line = alt
      ? `<path d="M${x0 + 34} ${starY}L${x0 + 46} ${starY - 14}L${x0 + 62} ${starY - 8}L${x0 + 74} ${starY - 18}M${x0 + 46} ${starY - 14}L${x0 + 52} ${starY - 24}M${x0 + 62} ${starY - 8}L${x0 + 68} ${starY + 2}" stroke="rgba(190,214,255,.5)" stroke-width="1"/>`
      : `<path d="M${x0 + 34} ${starY}L${x0 + 48} ${starY - 10}L${x0 + 60} ${starY - 2}L${x0 + 70} ${starY - 14}M${x0 + 48} ${starY - 10}L${x0 + 56} ${starY - 22}" stroke="rgba(190,214,255,.5)" stroke-width="1"/>`;
    const cluster = pts.map(([dx, dy]) => `<circle cx="${x0 + 34 + dx}" cy="${starY + dy}" r="1.9" fill="#EDE2BE"/>`).join("") + line;
    return `<rect x="${x0}" y="16" width="104" height="150" rx="10" fill="#0E1830" stroke="#22314F" stroke-width="1"/>
      ${cluster}
      <path d="M${x0 + 6} 142q30-10 52-6t46 2v8a8 8 0 0 1-8 8h-82a8 8 0 0 1-8-8z" fill="#0A1428"/>
      <circle cx="${x0 + 20}" cy="150" r="7" fill="#FF9E4A" opacity=".85"/>
      <text x="${x0 + 52}" y="180" text-anchor="middle" font-size="11" font-weight="700" fill="#AFC3E3">${tag}</text>`;
  };
  const g1 = alt ? 66 : 58;
  const g2 = alt ? 94 : 92;
  const g3 = alt ? 122 : 124;
  const t2 = alt ? "(나) 10일 뒤" : "(나) 15일 뒤";
  const t3 = alt ? "(다) 20일 뒤" : "(다) 30일 뒤";
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="며칠 간격으로 같은 시각에 서쪽 하늘을 관측한 세 장면. 같은 별자리가 점점 지평선 가까이 내려가 있다">
    ${cut(8, "(가)", g1)}${cut(120, t2, g2)}${cut(232, t3, g3)}
    <text x="172" y="192" text-anchor="middle" font-size="9.5" fill="#7E93B8">해가 진 직후 · 서쪽 하늘 · 주황 점은 해가 진 자리</text>
  </svg>`;
}

// ── u3 v2 신작(파일럿 승격 · 재출제 10호) ──
// 열 단원 문법: 입자 모형은 개수·크기 고정(온도 단서는 떨림 줄 수와 간격뿐 · 호 최대 2줄) ·
// 균일 가열(뜨거운 물 담금)로 방향성 가열 논쟁 차단 · 회로형은 전류 경로 한 바퀴 검산.


/** PB 입자 운동 모형 N박스(다크 · 파라미터형) · particleTrio/Duo 대체 신작.
 *  개수는 9개 고정(개수·크기는 온도의 단서가 아님을 구조로 보장) · spread 간격 · trail 운동 세기.
 *  운동 표시는 입자 옆 호(弧) 떨림 줄(교과서 문법 · 실측 미래엔 "호 줄 수만 다름" 계승):
 *  trail 0 = 없음 · 1~7 = 1줄 · 8+ = 2줄(최대 2줄 · 3단계 0/1/2가 한눈에 갈리는 상한 ·
 *  파일럿 2차 검수 "떨림 과함 · 2줄vs3줄 구분 곤란" 반영). 긴 직선 잔상은 잡선으로 읽혀 폐기
 *  (1차 검수 반영). 색은 전부 같은 파랑 · aria는 중립(순서 낭독 금지). */
export function htParticleBoxFig(boxes: { label: string; spread: number; trail: number; count?: number }[]): string {
  const n = boxes.length;
  const bw = n === 2 ? 112 : 100;
  const xs = n === 2 ? [40, 192] : [6, 122, 238];
  const box = (bx: number, label: string, spread: number, trail: number, count = 9): string => {
    const pts: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const c = i % 3;
      const r = Math.floor(i / 3);
      const rows = Math.ceil(count / 3);
      const cx = bw / 2 + (c - 1) * spread + (i % 2 ? 3 : -2) * (spread / 16);
      const cy = 48 + (r - (rows - 1) / 2) * spread + (i % 3 === 1 ? 4 : -2) * (spread / 16);
      pts.push([cx, cy]);
    }
    const arcN = trail < 1 ? 0 : trail < 8 ? 1 : 2;
    const parts = pts
      .map(([x, y], i) => {
        const deg = (i * 137 + 40) % 360;
        let arcs = "";
        for (let k = 0; k < arcN; k++) {
          const r = 9 + k * 4.2;
          const sy = (r * 0.522).toFixed(1);
          const sx = (r * 0.852).toFixed(1);
          arcs += `<path d="M${(x + Number(sx)).toFixed(1)} ${(y - Number(sy)).toFixed(1)} A${r} ${r} 0 0 1 ${(x + Number(sx)).toFixed(1)} ${(y + Number(sy)).toFixed(1)}" fill="none" stroke="#8FB3E8" stroke-width="1.7" stroke-linecap="round" opacity=".8"/>`;
        }
        const wrapped = arcs ? `<g transform="rotate(${deg} ${x.toFixed(1)} ${y.toFixed(1)})">${arcs}</g>` : "";
        return `${wrapped}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#6E9EDB"/><circle cx="${(x - 2).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="1.8" fill="rgba(255,255,255,.4)"/>`;
      })
      .join("");
    return `<g transform="translate(${bx},10)">
      <rect x="0" y="0" width="${bw}" height="96" rx="14" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>
      ${parts}
      <text x="${bw / 2}" y="122" text-anchor="middle" font-size="14" font-weight="700" fill="#AFC3E3">${label}</text>
    </g>`;
  };
  // aria는 파라미터에서 파생한다(문두 조건과 모순되는 고정 문구 금지 · u3 v2 검산 반영).
  // 판독 결과(어느 쪽이 뜨거운가)는 낭독하지 않고, 무엇이 같고 무엇이 다른지만 서술한다.
  const uniq = (arr: (number | undefined)[]): number => new Set(arr).size;
  const sameSpread = uniq(boxes.map((b) => b.spread)) === 1;
  const sameTrail = uniq(boxes.map((b) => (b.trail < 1 ? 0 : b.trail < 8 ? 1 : 2))) === 1;
  const sameCount = uniq(boxes.map((b) => b.count ?? 9)) === 1;
  const parts: string[] = [];
  parts.push(sameCount ? "입자의 개수는 상자마다 같다" : "입자의 개수가 상자마다 다르다");
  parts.push(sameSpread ? "입자 사이의 간격도 같다" : "입자 사이의 간격이 서로 다르다");
  parts.push(sameTrail ? "입자 옆 움직임 표시도 같다" : "입자 옆 움직임 표시의 수가 서로 다르다");
  return `<svg viewBox="0 0 344 136" ${NS} role="img" aria-label="입자 운동 모형 ${n}가지. ${parts.join(", ")}">
    ${boxes.map((b, i) => box(xs[i], b.label, b.spread, b.trail, b.count)).join("")}
  </svg>`;
}

/** SC 한 장면 3방식(라이트 · 파운드리 문법) · 미5·천02 계보(모닥불·캠핑 소재 회피).
 *  hearth: 벽난로 위 주전자(A 물 순환 · B 금속 손잡이 · C 앞에서 손 쬐는 스틱맨).
 *  kitchen: 가스레인지 냄비(A 물 순환 · B 꽂힌 금속 국자 · C 불 곁 버터 접시).
 *  라벨은 A·B·C 콜아웃만(방식 이름 인쇄 금지) · aria 중립. */
export function htSceneFig(scene: "hearth" | "kitchen"): string {
  const tag = (x: number, y: number, t: string): string =>
    `<circle cx="${x}" cy="${y}" r="13" fill="#FFF" stroke="#3182F6" stroke-width="1.8"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">${t}</text>`;
  const flame = (x: number, y: number, s = 1): string =>
    `<g transform="translate(${x},${y}) scale(${s})"><path d="M0 10 C 8 5 5 -2 0 -9 C -5 -2 -8 5 0 10 Z" fill="#FF9F43"/><path d="M0 6.5 C 4.5 3.5 3 -1 0 -5 C -3 -1 -4.5 3.5 0 6.5 Z" fill="#FFD98A"/></g>`;
  if (scene === "hearth") {
    return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="벽난로 불 위에 걸린 주전자와 그 앞에서 손을 쬐는 사람 그림. 주전자 속 물, 주전자 손잡이, 사람의 손에 각각 기호 A, B, C가 붙어 있다">
      <rect x="8" y="8" width="328" height="180" rx="14" fill="#FBF7F0" stroke="#DCE0E6" stroke-width="1.4"/>
      <path d="M30 168 h130 v-96 a14 14 0 0 1 14 -14 h0" fill="none"/>
      <rect x="34" y="60" width="120" height="108" rx="8" fill="#E8DCCB" stroke="#C9B79A" stroke-width="1.6"/>
      <rect x="46" y="120" width="96" height="48" rx="6" fill="#3A2E24"/>
      <path d="M58 160 h24 M70 166 h28 M96 160 h24" stroke="#8A6842" stroke-width="7" stroke-linecap="round"/>
      ${flame(94, 146, 1.5)}${flame(78, 150, 1.05)}${flame(112, 150, 1.1)}
      <path d="M64 118 h60 v4 h-60 Z" fill="#6B7684"/>
      <path d="M80 84 a14 18 0 0 1 28 0 l3 30 h-34 Z" fill="#9AA3AD" stroke="#6B7684" stroke-width="1.6"/>
      <path d="M80 84 q14 -12 28 0" fill="none" stroke="#6B7684" stroke-width="1.6"/>
      <rect x="88" y="70" width="12" height="8" rx="2" fill="#8B95A1" stroke="#6B7684" stroke-width="1.2"/>
      <path d="M111 92 q16 4 14 20" fill="none" stroke="#C46A2B" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="94" cy="104" rx="13" ry="9" fill="#DCEBFB" opacity=".9"/>
      <path d="M90 108 c-6 -2 -6 -8 0 -10 m8 0 c6 2 6 8 0 10" stroke="#0CA6C0" stroke-width="1.8" fill="none"/>
      <path d="M98 98 l3 4 -5 0" fill="none" stroke="#0CA6C0" stroke-width="1.6" stroke-linejoin="round"/>
      <g stroke="#FF6B4A" stroke-width="2" stroke-linecap="round" fill="none" opacity=".85">
        <path d="M162 120 q8 -4 16 0 q8 4 16 0"/>
        <path d="M162 136 q8 -4 16 0 q8 4 16 0"/>
        <path d="M162 152 q8 -4 16 0 q8 4 16 0"/>
      </g>
      <g stroke="#4E5968" stroke-width="2.6" stroke-linecap="round" fill="none">
        <circle cx="284" cy="96" r="13" stroke-width="2.4"/>
        <path d="M284 109 v40 M284 122 l-24 -8 M284 122 l-22 14 M284 149 l-14 22 M284 149 l14 22"/>
        <path d="M260 114 l-14 4 M262 136 l-16 -2"/>
      </g>
      <ellipse cx="284" cy="176" rx="26" ry="5" fill="#2A3A5E" opacity=".10"/>
      ${tag(64, 96, "A")}
      <path d="M74 99 L84 102" stroke="#3182F6" stroke-width="1.6"/>
      ${tag(146, 74, "B")}
      <path d="M137 80 L126 96" stroke="#3182F6" stroke-width="1.6"/>
      ${tag(238, 108, "C")}
      <path d="M245 117 L252 128" stroke="#3182F6" stroke-width="1.6"/>
      <text x="172" y="206" text-anchor="middle" font-size="11" fill="#8B95A1">벽난로 위 주전자 · 앞에 선 사람</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="가스레인지 불 위 냄비 그림. 냄비 속 물, 냄비에 꽂힌 금속 국자의 손잡이, 불 곁에 둔 버터 접시에 각각 기호 A, B, C가 붙어 있다">
    <rect x="8" y="8" width="328" height="180" rx="14" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
    <rect x="30" y="150" width="284" height="18" rx="6" fill="#DCE0E6"/>
    <rect x="70" y="144" width="120" height="8" rx="4" fill="#6B7684"/>
    ${flame(114, 138, 1.1)}${flame(132, 136, 1.35)}${flame(150, 138, 1.1)}
    <path d="M57 84 h150 v44 a10 10 0 0 1 -10 10 h-130 a10 10 0 0 1 -10 -10 Z" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.8"/>
    <rect x="57" y="84" width="150" height="10" fill="#B0B8C1"/>
    <ellipse cx="115" cy="112" rx="20" ry="12" fill="#DCEBFB" opacity=".92"/>
    <path d="M109 118 c-8 -3 -8 -10 0 -13 m12 0 c8 3 8 10 0 13" stroke="#0CA6C0" stroke-width="2" fill="none"/>
    <path d="M121 103 l4 5 -6 0" fill="none" stroke="#0CA6C0" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M177 92 L211 44" stroke="#B45309" stroke-width="6" stroke-linecap="round"/>
    <path d="M177 92 L211 44" stroke="#E8A25A" stroke-width="3.4" stroke-linecap="round"/>
    <ellipse cx="173" cy="98" rx="10" ry="6" fill="#9AA3AD" stroke="#6B7684" stroke-width="1.4"/>
    <g stroke="#FF6B4A" stroke-width="2" stroke-linecap="round" fill="none" opacity=".85">
      <path d="M176 150 q8 -4 16 0 q8 4 16 0 q8 -4 16 0"/>
      <path d="M186 162 q8 -4 16 0 q8 4 16 0"/>
    </g>
    <ellipse cx="268" cy="150" rx="30" ry="8" fill="#FFF" stroke="#C4CAD2" stroke-width="1.6"/>
    <path d="M254 138 h26 a4 4 0 0 1 4 4 v6 h-34 v-6 a4 4 0 0 1 4 -4 Z" fill="#FFDE8A" stroke="#E0B84B" stroke-width="1.4"/>
    <path d="M258 138 q4 -6 10 -4" stroke="#E0B84B" stroke-width="1.4" fill="none"/>
    <ellipse cx="268" cy="172" rx="30" ry="5" fill="#2A3A5E" opacity=".10"/>
    ${tag(114, 64, "A")}
    <path d="M114 77 L114 98" stroke="#3182F6" stroke-width="1.6"/>
    ${tag(243, 30, "B")}
    <path d="M233 37 L215 43" stroke="#3182F6" stroke-width="1.6"/>
    ${tag(310, 118, "C")}
    <path d="M302 127 L284 140" stroke="#3182F6" stroke-width="1.6"/>
    <text x="172" y="206" text-anchor="middle" font-size="11" fill="#8B95A1">가스레인지 위 냄비 · 국자 · 버터 접시</text>
  </svg>`;
}

/** RD 열화상풍 막대 비교(다크 · 파라미터형) · thermalRods(레슨 고정 구리/철/유리) 대체 신작.
 *  rods: 재질 이름 + 데워진 비율(0~1 · 0이면 회색 중립). beads: 한 막대 위 구슬 위치(0~1 배열 ·
 *  촛농 구슬 예측 문항용 · 중립 상태 원칙이라 frac 0과 함께 쓴다). 왼쪽 끝 가열 고정. */
export function htRodsFig(rods: { name: string; frac: number; beads?: { at: number; label: string }[] }[]): string {
  const flame = (y: number): string => `
    <g transform="translate(51,${y + 8})">
      <path d="M0 9 C 8 5 5 -3 0 -11 C -5 -3 -8 5 0 9 Z" fill="#FF9F43"/>
      <path d="M0 5 C 4 3 3 -2 0 -6 C -3 -2 -4 3 0 5 Z" fill="#FFE9A8"/>
    </g>`;
  const H = rods.length * 58 + 30;
  const rod = (r: { name: string; frac: number; beads?: { at: number; label: string }[] }, i: number): string => {
    const y = 40 + i * 58;
    const w = 250 * r.frac;
    const beads = (r.beads ?? [])
      .map(
        (b) => `<circle cx="${62 + 250 * b.at}" cy="${y - 6}" r="7" fill="#EDE2BE" stroke="#B9A96A" stroke-width="1.4"/>
      <text x="${62 + 250 * b.at}" y="${y - 18}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#DCE8FF">${b.label}</text>`,
      )
      .join("");
    return `<g>
      <text x="58" y="${y - 7}" font-size="12.5" font-weight="700" fill="#AFC3E3">${r.name}</text>
      <rect x="62" y="${y}" width="250" height="16" rx="8" fill="#22335C"/>
      ${w > 4 ? `<rect x="62" y="${y}" width="${w}" height="16" rx="8" fill="url(#u3HeatGrad)"/>` : ""}
      <rect x="62" y="${y}" width="250" height="16" rx="8" fill="none" stroke="#31456F" stroke-width="1.2"/>
      ${beads}
      ${flame(y)}
    </g>`;
  };
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="막대의 왼쪽 끝을 같은 불로 동시에 가열하는 실험 그림. ${rods.some((r) => r.frac > 0) ? "막대마다 데워진 부분의 길이가 다르게 표시되어 있다" : "아직 가열하기 전이다"}${rods.some((r) => (r.beads ?? []).length) ? ". 막대 위에는 이름표가 붙은 구슬이 놓여 있다" : ""}">
    <defs>
      <linearGradient id="u3HeatGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#FFE9A8"/>
        <stop offset=".45" stop-color="#FF9F43"/>
        <stop offset=".85" stop-color="#F0442E"/>
        <stop offset="1" stop-color="#F0442E" stop-opacity=".15"/>
      </linearGradient>
    </defs>
    ${rods.map(rod).join("")}
    <text x="34" y="${H - 6}" text-anchor="middle" font-size="11" fill="#7E93B3">가열</text>
  </svg>`;
}

/** RM 방 단면 · 설치 위치(라이트 · 파라미터형) · 비03·천09 계보.
 *  arrows "none"이면 위치 A(벽 위)·B(벽 아래) 배지만(예측 중립) · "cool"이면 A에서 찬 공기가
 *  내려오는 순환 화살표 · "warm"이면 B에서 더운 공기가 올라가는 순환. */
export function htRoomFig(o: { arrows: "none" | "cool" | "warm" }): string {
  const badge = (x: number, y: number, t: string): string =>
    `<rect x="${x - 15}" y="${y - 13}" width="30" height="26" rx="8" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.6" stroke-dasharray="4 3"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">${t}</text>`;
  const cool = `
    <path d="M84 66 C 120 96 150 132 148 158" fill="none" stroke="#3182F6" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M148 158 l-8 -8 M148 158 l3 -10" fill="none" stroke="#3182F6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M196 158 C 236 132 258 100 260 70" fill="none" stroke="#FF6B4A" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 8"/>
    <path d="M260 70 l-9 6 M260 70 l-2 11" fill="none" stroke="#FF6B4A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const warm = `
    <path d="M264 148 C 240 112 210 84 180 68" fill="none" stroke="#FF6B4A" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M180 68 l11 1 M180 68 l6 10" fill="none" stroke="#FF6B4A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M120 70 C 96 100 84 128 86 152" fill="none" stroke="#3182F6" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 8"/>
    <path d="M86 152 l-3 -10 M86 152 l9 -6" fill="none" stroke="#3182F6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="방 안 단면 그림. 한쪽 벽의 위쪽에 A, 반대쪽 벽의 아래쪽에 B 위치가 표시되어 있다${o.arrows === "none" ? "" : o.arrows === "cool" ? ". A 쪽에서 바닥으로 내려가는 화살표와 반대편에서 위로 올라가는 화살표가 그려져 있다" : ". B 쪽에서 위로 올라가는 화살표와 반대편에서 아래로 내려가는 화살표가 그려져 있다"}">
    <rect x="24" y="20" width="296" height="164" rx="10" fill="#F7F8FA" stroke="#B0B8C1" stroke-width="2"/>
    <rect x="150" y="34" width="60" height="46" rx="6" fill="#DCEBFB" stroke="#B9C2CE" stroke-width="1.4"/>
    <path d="M150 57 h60 M180 34 v46" stroke="#B9C2CE" stroke-width="1.2"/>
    <path d="M54 184 v-26 a10 10 0 0 1 20 0 v26" fill="#C4CAD2"/>
    ${o.arrows === "cool" ? cool : o.arrows === "warm" ? warm : ""}
    ${badge(66, 54, "A")}
    ${badge(288, 150, "B")}
    <text x="172" y="202" text-anchor="middle" font-size="11" fill="#8B95A1">방 안 · A는 벽 위쪽, B는 벽 아래쪽 위치</text>
  </svg>`;
}

/** FC2 비열 비교 실험 순서도(라이트 · 파라미터형) · v1 flowChart의 각도 교체판.
 *  ask "yes"면 ㉠(예 갈래) 강조 · "no"면 ㉡(아니요 갈래) 강조 · 캡션 중립.
 *  예/아니요 분기가 각자 결론 칸으로 갈라진다(감사 지적 계승). */
export function htFlowFig(o: { ask: "yes" | "no" }): string {
  const boxStyle = `fill="#F7F8FA" stroke="#B0B8C1" stroke-width="1.5"`;
  const hi = `fill="#EEF4FF" stroke="#3182F6" stroke-width="1.6"`;
  const arrow = (x: number, y1: number, y2: number): string =>
    `<path d="M${x} ${y1} V${y2} M${x} ${y2} l-5 -7 M${x} ${y2} l5 -7" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  const yes = o.ask === "yes";
  return `<svg viewBox="0 0 344 258" ${NS} role="img" aria-label="비열 비교 실험 순서도. 질량을 같게 한 두 물질을 같은 세기 불로 가열해 온도 변화를 비교하고, 예 갈래의 결론 칸과 아니요 갈래의 결론 칸이 비어 있다">
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
    <rect x="182" y="172" width="134" height="36" rx="10" ${yes ? hi : boxStyle}/>
    <text x="249" y="195" text-anchor="middle" font-size="14" font-weight="800" fill="${yes ? "#1B64DA" : "#6B7684"}">㉠</text>
    <rect x="28" y="172" width="134" height="36" rx="10" ${yes ? boxStyle : hi}/>
    <text x="95" y="195" text-anchor="middle" font-size="14" font-weight="800" fill="${yes ? "#6B7684" : "#1B64DA"}">㉡</text>
    <text x="172" y="240" text-anchor="middle" font-size="11.5" fill="#8B95A1">갈라진 두 결론 칸 ㉠과 ㉡에는 각각 어떤 말이 들어갈까요?</text>
  </svg>`;
}

/** BM 바이메탈(라이트 · 파라미터형) · bimetalBend/fireAlarm 고정형 대체 신작.
 *  strip: 데우기 전(곧음)/뜨거운 물에 담가 골고루 데운 후(bend 방향) 2컷 · 라벨은 위/아래 금속 이름.
 *  가열원은 뜨거운 물(균일 가열) · 아래 불꽃 연출 폐기(파일럿 1차 검수 반영 · "아래가 먼저 데워져
 *  위로 휜다"는 과도기 직관과 충돌하지 않게 설계 단계에서 제거).
 *  iron: 전기다리미 온도 스위치 · 전원→열선→접점→띠→기둥의 한 줄 직렬 회로(끊긴 데 없음 검산) ·
 *  평소 닿아 있는 중립 상태만 그림(휘는 방향은 그리지 않는다 · 예측 문항 중립 원칙). */
export function htBimetalFig(o: { top: string; bottom: string; mode: "strip" | "iron"; bend?: "up" | "down"; cool?: boolean }): string {
  if (o.mode === "strip") {
    const down = o.bend === "down";
    const bathFill = o.cool ? "#E3F0FC" : "#FBE3DC";
    const bathEdge = o.cool ? "#9FBFE4" : "#E8B0A0";
    const bathWave = o.cool ? "#8FB3DC" : "#E8A08C";
    const bathName = o.cool ? "얼음물" : "뜨거운 물";
    const before = o.cool ? "식히기 전" : "데우기 전";
    const afterT = o.cool ? "식힌 후" : "데운 후";
    const capt = o.cool ? "얼음물에 담가 골고루 식힌 후" : "뜨거운 물에 담가 골고루 데운 후";
    const steam = o.cool ? "" : `<path d="M216 28 c -3 -4 3 -6 0 -10 M322 28 c -3 -4 3 -6 0 -10" stroke="#D9A08C" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    const after = down
      ? `<path d="M204 82.5 C246 82.5 280 97 312 118" fill="none" stroke="#8FA6C6" stroke-width="11.4" stroke-linecap="round"/>
         <path d="M204 82.5 C246 82.5 280 97 312 118" fill="none" stroke="#AFC6E8" stroke-width="9" stroke-linecap="round"/>
         <path d="M204 91.5 C246 91.5 280 106 312 127" fill="none" stroke="#7C8590" stroke-width="11.4" stroke-linecap="round"/>
         <path d="M204 91.5 C246 91.5 280 106 312 127" fill="none" stroke="#9AA3AD" stroke-width="9" stroke-linecap="round"/>`
      : `<path d="M204 82.5 C246 82.5 280 68 312 47" fill="none" stroke="#8FA6C6" stroke-width="11.4" stroke-linecap="round"/>
         <path d="M204 82.5 C246 82.5 280 68 312 47" fill="none" stroke="#AFC6E8" stroke-width="9" stroke-linecap="round"/>
         <path d="M204 91.5 C246 91.5 280 77 312 56" fill="none" stroke="#7C8590" stroke-width="11.4" stroke-linecap="round"/>
         <path d="M204 91.5 C246 91.5 280 77 312 56" fill="none" stroke="#9AA3AD" stroke-width="9" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 344 176" ${NS} role="img" aria-label="두 금속을 붙인 띠를 ${bathName}에 담가 골고루 ${o.cool ? "식히기" : "데우기"} 전과 후의 모습. ${before}에는 곧고, ${afterT}에는 한쪽으로 휘어져 있다">
      <text x="86" y="24" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${before}</text>
      <text x="258" y="24" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${afterT}</text>
      <line x1="172" y1="16" x2="172" y2="162" stroke="#EDF0F4" stroke-width="1.6"/>
      <rect x="20" y="66" width="12" height="40" rx="2" fill="#C4CAD2"/>
      <rect x="32" y="78" width="112" height="9" rx="4.5" fill="#AFC6E8" stroke="#8FA6C6" stroke-width="1.2"/>
      <rect x="32" y="87" width="112" height="9" rx="4.5" fill="#9AA3AD" stroke="#7C8590" stroke-width="1.2"/>
      <text x="148" y="72" font-size="12" font-weight="700" fill="#5E7BA6">${o.top}(위)</text>
      <text x="148" y="110" font-size="12" font-weight="700" fill="#6B7684">${o.bottom}(아래)</text>
      <rect x="206" y="36" width="128" height="122" rx="12" fill="${bathFill}" stroke="${bathEdge}" stroke-width="1.6"/>
      <path d="M214 45 q8 -5 16 0 t16 0" fill="none" stroke="${bathWave}" stroke-width="1.6"/>
      <path d="M286 45 q8 -5 16 0 t16 0" fill="none" stroke="${bathWave}" stroke-width="1.6"/>
      ${steam}
      <rect x="192" y="66" width="12" height="40" rx="2" fill="#C4CAD2"/>
      ${after}
      <text x="296" y="150" text-anchor="middle" font-size="11" fill="${o.cool ? "#4E6E96" : "#B0705E"}">${bathName}</text>
      <text x="258" y="172" text-anchor="middle" font-size="11" fill="#8B95A1">${capt}</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 344 206" ${NS} role="img" aria-label="전기다리미 온도 스위치의 구조. 전원에서 나온 도선이 열선을 지나 접점으로 이어지고, 두 금속을 붙인 띠의 오른쪽 끝이 위쪽 접점에 닿아 회로가 연결되어 있다">
    <rect x="8" y="8" width="328" height="172" rx="14" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
    <rect x="36" y="34" width="26" height="16" rx="3" fill="#C4CAD2"/>
    <text x="49" y="26" text-anchor="middle" font-size="11" fill="#8B95A1">전원</text>
    <path d="M62 42 H96" stroke="#6B7684" stroke-width="2" fill="none"/>
    <path d="M96 42 c3 -8 9 -8 12 0 c3 8 9 8 12 0 c3 -8 9 -8 12 0" stroke="#E8542F" stroke-width="2.2" fill="none"/>
    <text x="114" y="64" text-anchor="middle" font-size="11" fill="#B0705E">다리미 열선</text>
    <path d="M132 42 H236 V114" stroke="#6B7684" stroke-width="2" fill="none"/>
    <rect x="228" y="114" width="16" height="8" rx="2" fill="#6B7684"/>
    <text x="252" y="121" font-size="11" fill="#8B95A1">접점</text>
    <path d="M36 50 V128 H52" stroke="#6B7684" stroke-width="2" fill="none"/>
    <rect x="52" y="112" width="14" height="34" rx="2" fill="#C4CAD2"/>
    <rect x="66" y="122" width="176" height="8" rx="4" fill="#AFC6E8" stroke="#8FA6C6" stroke-width="1.1"/>
    <rect x="66" y="130" width="176" height="8" rx="4" fill="#9AA3AD" stroke="#7C8590" stroke-width="1.1"/>
    <text x="120" y="116" font-size="12" font-weight="700" fill="#5E7BA6">${o.top}(위)</text>
    <text x="120" y="152" font-size="12" font-weight="700" fill="#6B7684">${o.bottom}(아래)</text>
    <text x="172" y="198" text-anchor="middle" font-size="11" fill="#8B95A1">평소 모습 · 띠 끝이 접점에 닿아 열선으로 전류가 흐른다</text>
  </svg>`;
}

/** EG 온도-눈금 보간 그래프(라이트 · 파라미터형) · v1 expandScaleGraph(고정값) 대체 신작.
 *  조건 점 2개만 값 라벨(조건 수치는 허용) · 묻는 지점은 무표시 · 가이드 점선은 축까지 잇지
 *  않는다(g2u2 관행) · 정답은 눈금 위 검산 의무. */
export function htExpandGraphFig(o: { xMax: number; xStep: number; yMax: number; yStep: number; pts: [number, number][] }): string {
  const gx = (T: number): number => 40 + T * (280 / o.xMax);
  const gy = (n: number): number => 186 - (n / o.yMax) * 160;
  let xt = "";
  for (let T = 0; T <= o.xMax; T += o.xStep) {
    xt += `<line x1="${gx(T)}" y1="186" x2="${gx(T)}" y2="26" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(T)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${T}</text>`;
  }
  let yt = "";
  for (let n = 0; n <= o.yMax; n += o.yStep) {
    yt += `<line x1="40" y1="${gy(n)}" x2="320" y2="${gy(n)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="32" y="${gy(n) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${n}</text>`;
  }
  const [p1, p2] = o.pts;
  const slope = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  const y0 = p1[1] - slope * p1[0];
  const xEnd = o.xMax * 0.96;
  // 라벨은 직선을 피해 배치(파일럿 1차 검수 반영 · 직선이 글자를 가로지르던 결함):
  // 아래 점은 점 아래(우하) · 위 점은 점 위(좌상 · anchor end) · 오름 직선과 겹치지 않는 사분면.
  const sorted = [...o.pts].sort((a, b) => a[1] - b[1]);
  const dots = sorted
    .map(([T, n], i) => {
      const label = `(${T} ℃, ${n}칸)`;
      const pos =
        i === 0
          ? `x="${gx(T) + 2}" y="${gy(n) + 19}" text-anchor="start"`
          : `x="${gx(T) - 7}" y="${gy(n) - 9}" text-anchor="end"`;
      return `<circle cx="${gx(T)}" cy="${gy(n)}" r="4.5" fill="#3182F6"/>
      <text ${pos} font-size="11.5" font-weight="700" fill="#1B64DA">${label}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="액체가 든 가는 유리관을 데우며 온도에 따라 액체 기둥의 눈금을 기록한 그래프. 직선 위에 측정한 점 두 개가 값과 함께 표시되어 있다">
    ${yt}${xt}
    <line x1="40" y1="26" x2="40" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="40" y1="186" x2="320" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${gx(0)}" y1="${gy(y0)}" x2="${gx(xEnd)}" y2="${gy(y0 + slope * xEnd)}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${dots}
    <text x="8" y="14" font-size="11" fill="#4E5968">눈금(칸)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

/** IN 보온병 단면(라이트) · 층 이름 대신 ㉠㉡㉢ 기호(정답 인쇄 방지 기호판 · geoCycleQuizFig 계보).
 *  ㉠ 마개 · ㉡ 이중 벽 사이 진공 층 · ㉢ 반짝이는 안쪽 벽면. 확대분 사용 · 파일럿은 부록 눈검수. */
export function htInsulFig(): string {
  return `<svg viewBox="0 0 344 226" ${NS} fill="none" role="img" aria-label="보온병을 세로로 자른 단면 그림. 마개, 이중 벽 사이의 빈 층, 반짝이는 안쪽 벽면에 각각 동그라미 기호가 붙어 있다">
    <rect x="8" y="8" width="328" height="196" rx="14" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
    <rect x="128" y="26" width="88" height="24" rx="6" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
    <path d="M118 50 h108 v112 a14 14 0 0 1 -14 14 h-80 a14 14 0 0 1 -14 -14 Z" fill="#DCE0E6" stroke="#8B95A1" stroke-width="2"/>
    <path d="M132 60 h80 v98 a8 8 0 0 1 -8 8 h-64 a8 8 0 0 1 -8 -8 Z" fill="#FFF" stroke="#B0B8C1" stroke-width="1.6"/>
    <path d="M140 68 h64 v88 a6 6 0 0 1 -6 6 h-52 a6 6 0 0 1 -6 -6 Z" fill="#EAF3FF" stroke="#9FBBDF" stroke-width="1.4"/>
    <path d="M144 74 q6 22 0 44 q-4 18 2 36" stroke="#FFF" stroke-width="2.4" opacity=".9" fill="none"/>
    <path d="M146 92 c8 -5 16 -5 24 0 m-24 16 c8 -5 16 -5 24 0" stroke="#7FAFE4" stroke-width="1.6" fill="none" opacity=".7"/>
    <circle cx="86" cy="38" r="14" fill="#12203C" opacity="0"/>
    <circle cx="84" cy="38" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="84" y="43" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉠</text>
    <path d="M98 40 L128 38" stroke="#3182F6" stroke-width="1.5"/>
    <circle cx="70" cy="112" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="70" y="117" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉡</text>
    <path d="M84 112 L125 110" stroke="#3182F6" stroke-width="1.5"/>
    <circle cx="278" cy="92" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="278" y="97" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉢</text>
    <path d="M264 94 L208 86" stroke="#3182F6" stroke-width="1.5"/>
    <text x="172" y="220" text-anchor="middle" font-size="11" fill="#8B95A1">보온병을 세로로 자른 단면</text>
  </svg>`;
}

/** LT 액체 열팽창 비교 장치(라이트 · 파라미터형) · liquidExpand(고정 A>B>C) 대체 신작.
 *  같은 부피 액체가 든 병 3개를 뜨거운 물 수조에 담근 뒤 유리관 높이 비교(천04 계보).
 *  rise는 px(처음 높이 기준선 위로) · 이름 라벨 파라미터. 확대분 사용 · 파일럿은 부록 눈검수. */
export function htLiquidTubesFig(tubes: { name: string; rise: number }[]): string {
  const xs = [52, 148, 244];
  const flask = (x: number, name: string, rise: number): string => `
    <rect x="${x + 21}" y="${60 - rise}" width="8" height="${52 + rise}" fill="#7FAFE4"/>
    <rect x="${x + 19}" y="18" width="12" height="96" rx="5" fill="none" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M${x + 19} 108 L${x + 4} 138 a8 8 0 0 0 8 10 h26 a8 8 0 0 0 8 -10 L${x + 31} 108" fill="#B7D3F2" stroke="#8B95A1" stroke-width="1.8"/>
    <text x="${x + 25}" y="164" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${name}</text>`;
  return `<svg viewBox="0 0 344 216" ${NS} role="img" aria-label="같은 부피의 액체가 든 병 세 개를 뜨거운 물이 담긴 수조에 담근 실험 그림. 유리관 속 액체 기둥의 높이가 서로 다르다">
    <rect x="16" y="118" width="312" height="66" rx="12" fill="#FBE3DC" stroke="#E8B0A0" stroke-width="1.6"/>
    <path d="M40 130 q8 -5 16 0 t16 0" fill="none" stroke="#E8A08C" stroke-width="1.6"/>
    <path d="M262 130 q8 -5 16 0 t16 0" fill="none" stroke="#E8A08C" stroke-width="1.6"/>
    <text x="296" y="178" text-anchor="middle" font-size="11" fill="#B0705E">뜨거운 물</text>
    <line x1="36" y1="60" x2="308" y2="60" stroke="#8B95A1" stroke-width="1.4" stroke-dasharray="5 5"/>
    <text x="10" y="52" font-size="10.5" fill="#8B95A1">처음 높이</text>
    ${tubes.map((t, i) => flask(xs[i], t.name, t.rise)).join("")}
  </svg>`;
}

/** POT 냄비 단면(라이트) · 금속 몸통 ㉠ · 플라스틱 손잡이 ㉡ 기호판(이름 미인쇄 · 재질 판정 문항용).
 *  확대분 276 사용 · 갤러리 카드가 데뷔 눈검수를 겸한다. */
export function htPotFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="냄비를 세로로 자른 단면 그림. 몸통 부분과 손잡이 부분에 각각 동그라미 기호가 붙어 있다">
    <rect x="8" y="8" width="328" height="156" rx="14" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.4"/>
    <path d="M96 66 h152 v54 a10 10 0 0 1 -10 10 h-132 a10 10 0 0 1 -10 -10 Z" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.8"/>
    <rect x="96" y="66" width="152" height="9" fill="#B0B8C1"/>
    <ellipse cx="172" cy="100" rx="52" ry="16" fill="#DCEBFB" opacity=".85"/>
    <rect x="244" y="80" width="58" height="14" rx="7" fill="#2F3A48" stroke="#1F2833" stroke-width="1.4"/>
    <rect x="40" y="80" width="58" height="14" rx="7" fill="#2F3A48" stroke="#1F2833" stroke-width="1.4"/>
    <circle cx="140" cy="34" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="140" y="39" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉠</text>
    <path d="M148 45 L162 66" stroke="#3182F6" stroke-width="1.5"/>
    <circle cx="292" cy="46" r="14" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="292" y="51" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">㉡</text>
    <path d="M287 59 L280 78" stroke="#3182F6" stroke-width="1.5"/>
    <text x="172" y="180" text-anchor="middle" font-size="11" fill="#8B95A1">국을 끓이는 냄비 · ㉠ 몸통과 ㉡ 손잡이는 서로 다른 재료예요</text>
  </svg>`;
}

/** SE 태양-우주-지구 복사 도해(다크) · 사이 공간이 텅 비어 있음(입자 없음)을 라벨로 명시.
 *  확대분 280 사용 · 갤러리 카드가 데뷔 눈검수를 겸한다. */
export function htSunEarthFig(): string {
  return `<svg viewBox="0 0 344 150" ${NS} fill="none" role="img" aria-label="왼쪽의 태양에서 나온 열이 아무것도 없는 텅 빈 공간을 지나 오른쪽의 지구에 도달하는 모습을 나타낸 그림">
    <circle cx="52" cy="72" r="34" fill="#F2A93B"/>
    <circle cx="52" cy="72" r="26" fill="#FFE9A8"/>
    <g stroke="#F2A93B" stroke-width="2.2" stroke-linecap="round"><path d="M52 26 v-10 M52 118 v10 M6 72 h-2 M14 34 l-7 -7 M14 110 l-7 7"/></g>
    <circle cx="296" cy="72" r="24" fill="#3D6ED9"/>
    <path d="M282 62 q8 -6 14 0 t12 4 q-2 8 -10 8 t-16 -12" fill="#4CAF6E"/>
    <g stroke="#FF6B4A" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".9">
      <path d="M96 58 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>
      <path d="M96 86 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"/>
      <path d="M256 58 l10 3 -8 6 M256 86 l10 3 -8 6" stroke-width="2"/>
    </g>
    <text x="176" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#AFC3E3">태양과 지구 사이 · 아무것도 없는 텅 빈 공간</text>
    <text x="52" y="138" text-anchor="middle" font-size="12" font-weight="700" fill="#FFE9A8">태양</text>
    <text x="296" y="128" text-anchor="middle" font-size="12" font-weight="700" fill="#AFC3E3">지구</text>
  </svg>`;
}

// ── u1 v2 신작(파일럿 승격 · 신규 출제 12호) ──
// 탐구 과정·계획표·결과 그래프·문명 사슬·연표·주장 말풍선. 전부 파라미터형 · aria 중립.
/** 한글 줄바꿈(공백 단위) · 라벨·말풍선 공용. */
const u1WrapKo = (s: string, per: number): string[] => {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > per) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
};

// ── IF 탐구 과정 흐름도(세로 사슬 · 빈칸 ㉠ · 되돌아가는 화살표) ────────────
/** o.blank = ㉠ 점선 칸 인덱스 · o.loop = [from, to] 되돌아가는 곡선 화살표. */
export function inquiryFlowFig(o: { steps: string[]; blank?: number; loop?: [number, number] }): string {
  const BW = 168;
  const BH = 31;
  const GAP = 15;
  // loop가 없으면 오른쪽 되돌림 화살표 자리가 통째로 비므로 사슬을 중앙 정렬한다.
  const X = o.loop ? 52 : (344 - BW) / 2;
  const n = o.steps.length;
  const H = 12 + n * BH + (n - 1) * GAP + 12;
  const yOf = (i: number): number => 12 + i * (BH + GAP);
  let body = "";
  o.steps.forEach((s, i) => {
    const y = yOf(i);
    const bl = o.blank === i;
    body += `<rect x="${X}" y="${y}" width="${BW}" height="${BH}" rx="9" fill="${bl ? "#FFFFFF" : "#F2F4F7"}" stroke="${bl ? "#3182F6" : "#C9D0D8"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>
      <text x="${X + BW / 2}" y="${y + BH / 2 + 4.5}" text-anchor="middle" font-size="13" font-weight="${bl ? 800 : 600}" fill="${bl ? "#1B64DA" : "#333D4B"}">${bl ? "㉠" : s}</text>`;
    if (i < n - 1) {
      const ay = y + BH;
      const tip = ay + GAP - 2;
      body += `<path d="M${X + BW / 2} ${ay} V${tip} M${X + BW / 2} ${tip} l-4.5 -6 M${X + BW / 2} ${tip} l4.5 -6" fill="none" stroke="#8B95A1" stroke-width="1.5" stroke-linecap="round"/>`;
    }
  });
  if (o.loop) {
    const [from, to] = o.loop;
    const y1 = yOf(from) + BH / 2;
    const y2 = yOf(to) + BH / 2;
    const R = X + BW + 6;
    const OUT = X + BW + 44;
    body += `<path d="M${R} ${y1} H${OUT} V${y2} H${R + 7}" fill="none" stroke="#F0A422" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${R} ${y2} l7 -4.5 M${R} ${y2} l7 4.5" fill="none" stroke="#F0A422" stroke-width="1.8" stroke-linecap="round"/>
      <text x="${OUT + 6}" y="${(y1 + y2) / 2 - 4}" font-size="10.5" font-weight="700" fill="#B4690E">고쳐서</text>
      <text x="${OUT + 6}" y="${(y1 + y2) / 2 + 8}" font-size="10.5" font-weight="700" fill="#B4690E">다시</text>`;
  }
  const aria = o.blank === undefined
    ? "탐구 과정의 단계를 위에서 아래로 이은 흐름도"
    : "탐구 과정의 단계를 위에서 아래로 이은 흐름도. 한 칸은 비어 있고 기호로 표시되어 있다";
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="${aria}">${body}</svg>`;
}

// ── PT 탐구 계획표(행 라벨 | 내용 2열 · 빈칸 ㉠) ─────────────────────────
export function planTableFig(o: { rows: [string, string][]; blank?: number }): string {
  const W = 344;
  const LW = 96;
  const RW = W - 16 - LW;
  const heights = o.rows.map(([, v]) => Math.max(1, u1WrapKo(v, 17).length) * 17 + 15);
  const H = heights.reduce((a, b) => a + b, 0) + 16;
  let body = "";
  let y = 8;
  o.rows.forEach(([k, v], i) => {
    const h = heights[i];
    const bl = o.blank === i;
    body += `<rect x="8" y="${y}" width="${LW}" height="${h}" fill="#F2F4F7"/>
      <text x="${8 + LW / 2}" y="${y + h / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${k}</text>`;
    if (bl) {
      body += `<rect x="${8 + LW + 5}" y="${y + 5}" width="${RW - 10}" height="${h - 10}" rx="7" fill="#FFFFFF" stroke="#3182F6" stroke-width="1.6" stroke-dasharray="5 4"/>
        <text x="${8 + LW + RW / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#1B64DA">㉠</text>`;
    } else {
      const lines = u1WrapKo(v, 17);
      lines.forEach((ln, j) => {
        body += `<text x="${8 + LW + 10}" y="${y + h / 2 - ((lines.length - 1) * 17) / 2 + j * 17 + 4.5}" font-size="12.5" fill="#333D4B">${ln}</text>`;
      });
    }
    y += h;
  });
  let grid = `<line x1="${8 + LW}" y1="8" x2="${8 + LW}" y2="${y}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  let gy = 8;
  grid += `<line x1="8" y1="8" x2="${W - 8}" y2="8" stroke="#DCE0E6" stroke-width="1.2"/>`;
  for (const h of heights) {
    gy += h;
    grid += `<line x1="8" y1="${gy}" x2="${W - 8}" y2="${gy}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  }
  grid += `<line x1="8" y1="8" x2="8" y2="${y}" stroke="#DCE0E6" stroke-width="1.2"/><line x1="${W - 8}" y1="8" x2="${W - 8}" y2="${y}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  const aria = o.blank === undefined
    ? "탐구 계획을 항목별로 적은 표"
    : "탐구 계획을 항목별로 적은 표. 한 칸은 비어 있고 기호로 표시되어 있다";
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="${aria}">${body}${grid}</svg>`;
}

// ── VT 변인 배정 표(조건 | 같게 | 다르게 · q = ㉠ 빈칸) ─────────────────
export function variableTableFig(o: { items: string[]; marks: ("same" | "diff" | "q")[] }): string {
  const W = 344;
  const C1 = 176;
  const C2 = (W - 16 - C1) / 2;
  const RH = 30;
  const H = RH * (o.items.length + 1) + 16;
  let body = `<rect x="8" y="8" width="${W - 16}" height="${RH}" fill="#F2F4F7"/>
    <text x="${8 + C1 / 2}" y="${8 + RH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">조건</text>
    <text x="${8 + C1 + C2 / 2}" y="${8 + RH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">같게</text>
    <text x="${8 + C1 + C2 * 1.5}" y="${8 + RH / 2 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">다르게</text>`;
  o.items.forEach((it, i) => {
    const y = 8 + RH * (i + 1);
    body += `<text x="18" y="${y + RH / 2 + 4.5}" font-size="12.5" fill="#333D4B">${it}</text>`;
    const m = o.marks[i];
    const cx = m === "diff" ? 8 + C1 + C2 * 1.5 : 8 + C1 + C2 / 2;
    if (m === "q") {
      body += `<text x="${8 + C1 + C2}" y="${y + RH / 2 + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#1B64DA">㉠</text>`;
    } else {
      body += `<path d="M${cx - 6} ${y + RH / 2} l4.5 5 l8 -10" fill="none" stroke="#04B45F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  });
  let grid = "";
  for (let i = 0; i <= o.items.length + 1; i++) {
    grid += `<line x1="8" y1="${8 + RH * i}" x2="${W - 8}" y2="${8 + RH * i}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  }
  for (const x of [8, 8 + C1, 8 + C1 + C2, W - 8]) {
    grid += `<line x1="${x}" y1="8" x2="${x}" y2="${8 + RH * (o.items.length + 1)}" stroke="#DCE0E6" stroke-width="1.2"/>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="실험 조건마다 같게 할지 다르게 할지를 표시한 표">${body}${grid}</svg>`;
}

// ── CG 결과 꺾은선 그래프(집단 비교 · 정답 판독값은 눈금선 위) ───────────
export function resultLineFig(o: {
  xTicks: string[];
  series: { name: string; color: string; points: number[] }[];
  yMin: number;
  yMax: number;
  yStep: number;
  yLabel: string;
  xLabel: string;
}): string {
  const L = 44;
  const R = 306;
  const TOP = 26;
  const BASE = 182;
  const n = o.xTicks.length;
  const gx = (i: number): number => L + (i * (R - L)) / (n - 1);
  const gy = (v: number): number => BASE - ((v - o.yMin) / (o.yMax - o.yMin)) * (BASE - TOP);
  let grid = "";
  for (let v = o.yMin; v <= o.yMax; v += o.yStep) {
    grid += `<line x1="${L}" y1="${gy(v)}" x2="${R}" y2="${gy(v)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${L - 8}" y="${gy(v) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  o.xTicks.forEach((t, i) => {
    grid += `<line x1="${gx(i)}" y1="${BASE}" x2="${gx(i)}" y2="${TOP}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(i)}" y="${BASE + 16}" text-anchor="middle" font-size="10.5" fill="#8B95A1">${t}</text>`;
  });
  let lines = "";
  o.series.forEach((s) => {
    const d = s.points.map((p, i) => `${i ? "L" : "M"}${gx(i)},${gy(p)}`).join(" ");
    lines += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    s.points.forEach((p, i) => {
      lines += `<circle cx="${gx(i)}" cy="${gy(p)}" r="3.6" fill="#FFFFFF" stroke="${s.color}" stroke-width="2.4"/>`;
    });
    const last = s.points[s.points.length - 1];
    lines += `<text x="${R + 4}" y="${gy(last) + 4}" font-size="11.5" font-weight="700" fill="${s.color}">${s.name}</text>`;
  });
  return `<svg viewBox="0 0 344 214" ${NS} role="img" aria-label="여러 집단의 측정값을 시간에 따라 이은 꺾은선 그래프">
    ${grid}
    <line x1="${L}" y1="${TOP}" x2="${L}" y2="${BASE}" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${L}" y1="${BASE}" x2="${R}" y2="${BASE}" stroke="#B0B8C1" stroke-width="1.6"/>
    ${lines}
    <text x="6" y="14" font-size="11" fill="#4E5968">${o.yLabel}</text>
    <text x="338" y="210" text-anchor="end" font-size="11" fill="#4E5968">${o.xLabel}</text>
  </svg>`;
}

// ── BR 결과 막대 그래프(값 라벨 미인쇄 · 높이 판독이 과제) ───────────────
export function resultBarFig(o: {
  bars: { label: string; value: number }[];
  yMax: number;
  yStep: number;
  yLabel: string;
}): string {
  const L = 44;
  const R = 320;
  const TOP = 26;
  const BASE = 176;
  const n = o.bars.length;
  const slot = (R - L) / n;
  const bw = Math.min(40, slot * 0.54);
  const gy = (v: number): number => BASE - (v / o.yMax) * (BASE - TOP);
  let grid = "";
  for (let v = 0; v <= o.yMax; v += o.yStep) {
    grid += `<line x1="${L}" y1="${gy(v)}" x2="${R}" y2="${gy(v)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${L - 8}" y="${gy(v) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  let bars = "";
  o.bars.forEach((b, i) => {
    const cx = L + slot * (i + 0.5);
    bars += `<rect x="${cx - bw / 2}" y="${gy(b.value)}" width="${bw}" height="${BASE - gy(b.value)}" rx="3" fill="#7FB2F0"/>
      <rect x="${cx - bw / 2}" y="${gy(b.value)}" width="${bw}" height="4" rx="2" fill="#3182F6"/>`;
    u1WrapKo(b.label, 6).forEach((ln, j) => {
      bars += `<text x="${cx}" y="${BASE + 16 + j * 13}" text-anchor="middle" font-size="11" fill="#4E5968">${ln}</text>`;
    });
  });
  return `<svg viewBox="0 0 344 212" ${NS} role="img" aria-label="여러 항목의 값을 막대 높이로 나타낸 그래프">
    ${grid}
    <line x1="${L}" y1="${TOP}" x2="${L}" y2="${BASE}" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${L}" y1="${BASE}" x2="${R}" y2="${BASE}" stroke="#B0B8C1" stroke-width="1.6"/>
    ${bars}
    <text x="6" y="14" font-size="11" fill="#4E5968">${o.yLabel}</text>
  </svg>`;
}

// ── EX 실험 장치 (가)(나) 2패널(조건 이름 미인쇄 · 판독이 과제) ──────────
interface SetupSpec {
  liquidH: number;
  liquidColor?: string;
  cubes?: number;
  heat?: boolean;
  lid?: boolean;
}
export function setupPairFig(o: { a: SetupSpec; b: SetupSpec }): string {
  const panel = (s: SetupSpec, ox: number, tag: string): string => {
    const BX = ox + 30;
    const BW = 92;
    const BY = 30;
    const BH = 96;
    const lh = Math.round(BH * s.liquidH);
    const ly = BY + BH - lh;
    let g = `<path d="M${BX} ${BY} v${BH} a10 10 0 0 0 10 10 h${BW - 20} a10 10 0 0 0 10 -10 v${-BH}" fill="rgba(200,225,255,.18)" stroke="#9AA7B8" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M${BX + 2} ${ly} v${lh - 2} a8 8 0 0 0 8 8 h${BW - 20} a8 8 0 0 0 8 -8 v${-(lh - 2)} z" fill="${s.liquidColor ?? "#BFDDFA"}" opacity=".85"/>
      <ellipse cx="${BX + BW / 2}" cy="${ly}" rx="${BW / 2 - 2}" ry="4" fill="#DCEBFB"/>`;
    for (let i = 0; i < (s.cubes ?? 0); i++) {
      const cx = BX + BW / 2 - 11 + i * 22;
      g += `<rect x="${cx - 8}" y="${BY + BH - 20}" width="16" height="16" rx="3" fill="#FFFFFF" stroke="#B0B8C1" stroke-width="1.4"/>`;
    }
    // 뚜껑은 컵 폭 +4까지만(양쪽 2px) · 컵 크기가 달라 보이면 "컵의 크기" 오답이 참처럼 읽힌다.
    if (s.lid) {
      g += `<rect x="${BX - 2}" y="${BY - 7}" width="${BW + 4}" height="7" rx="3" fill="#9AA7B8"/>
        <rect x="${BX + BW / 2 - 7}" y="${BY - 12}" width="14" height="6" rx="3" fill="#9AA7B8"/>`;
    }
    if (s.heat) {
      g += `<path d="M${BX + BW / 2 - 22} 148 h44" stroke="#9AA7B8" stroke-width="3" stroke-linecap="round"/>`;
      for (let i = -1; i <= 1; i++) {
        const fx = BX + BW / 2 + i * 15;
        g += `<path d="M${fx} 146 q-5 -8 0 -14 q5 6 0 14z" fill="#F5A028"/><path d="M${fx} 146 q-2.6 -5 0 -8.5 q2.6 3.5 0 8.5z" fill="#FFD25E"/>`;
      }
    } else {
      g += `<path d="M${BX + BW / 2 - 22} 148 h44" stroke="#9AA7B8" stroke-width="3" stroke-linecap="round"/>`;
    }
    g += `<text x="${BX + BW / 2}" y="172" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${tag}</text>`;
    return g;
  };
  return `<svg viewBox="0 0 344 182" ${NS} role="img" aria-label="같은 모양의 실험 장치 두 개를 나란히 놓고 조건을 달리한 그림">
    ${panel(o.a, 0, "(가)")}${panel(o.b, 172, "(나)")}
  </svg>`;
}

// ── CH 원리 → 기술 → 기기 → 문명 사슬(가로 · 빈칸 ㉠) ─────────────────
export function chainFig(o: { cells: string[]; blank?: number }): string {
  const n = o.cells.length;
  const GAP = 16;
  const W = 344;
  const CW = (W - 16 - GAP * (n - 1)) / n;
  const CH2 = 66;
  let body = "";
  o.cells.forEach((c, i) => {
    const x = 8 + i * (CW + GAP);
    const bl = o.blank === i;
    body += `<rect x="${x}" y="18" width="${CW}" height="${CH2}" rx="10" fill="${bl ? "#FFFFFF" : "#F2F4F7"}" stroke="${bl ? "#3182F6" : "#C9D0D8"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>`;
    if (bl) {
      body += `<text x="${x + CW / 2}" y="${18 + CH2 / 2 + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#1B64DA">㉠</text>`;
    } else {
      const lines = u1WrapKo(c, 5);
      lines.forEach((ln, j) => {
        body += `<text x="${x + CW / 2}" y="${18 + CH2 / 2 - ((lines.length - 1) * 15) / 2 + j * 15 + 4.5}" text-anchor="middle" font-size="12.5" font-weight="600" fill="#333D4B">${ln}</text>`;
      });
    }
    if (i < n - 1) {
      const ax = x + CW + 2;
      body += `<path d="M${ax} ${18 + CH2 / 2} h${GAP - 6} M${ax + GAP - 6} ${18 + CH2 / 2} l-6 -4 M${ax + GAP - 6} ${18 + CH2 / 2} l-6 4" fill="none" stroke="#8B95A1" stroke-width="1.6" stroke-linecap="round"/>`;
    }
  });
  const aria = o.blank === undefined
    ? "네 칸이 화살표로 이어진 가로 흐름 그림"
    : "네 칸이 화살표로 이어진 가로 흐름 그림. 한 칸은 비어 있고 기호로 표시되어 있다";
  return `<svg viewBox="0 0 344 100" ${NS} role="img" aria-label="${aria}">${body}</svg>`;
}

// ── TL 문명 연표(가로 축 + 사건 카드 · hide는 라벨 가림) ─────────────────
export function timelineFig(o: { events: { era: string; label: string }[]; hide?: number[] }): string {
  const n = o.events.length;
  // 축 양 끝은 카드 반폭만큼 안쪽으로 · 끝 카드가 뷰박스를 넘어 잘리는 것을 막는다.
  const CW = 74;
  const L = CW / 2 + 8;
  const R = 344 - CW / 2 - 8;
  const PER = 5;
  // 카드 높이는 가장 긴 라벨의 줄 수를 따라간다(고정 높이면 세 줄 라벨이 상자 밖으로 흘러넘친다).
  const maxLines = Math.max(1, ...o.events.map((e) => (e.label ? u1WrapKo(e.label, PER).length : 1)));
  const CH2 = 20 + maxLines * 14;
  const GAPV = 22;
  const AY = CH2 + GAPV + 8;
  const H = AY * 2;
  const gx = (i: number): number => L + (i * (R - L)) / (n - 1);
  const MARK = ["㉠", "㉡", "㉢", "㉣"];
  let body = `<path d="M${L - 14} ${AY} H${R + 14} M${R + 14} ${AY} l-7 -4.5 M${R + 14} ${AY} l-7 4.5" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round"/>`;
  o.events.forEach((e, i) => {
    const x = gx(i);
    const up = i % 2 === 0;
    const cy = up ? AY - GAPV - CH2 : AY + GAPV;
    const hid = (o.hide ?? []).includes(i);
    body += `<line x1="${x}" y1="${AY}" x2="${x}" y2="${up ? cy + CH2 : cy}" stroke="#C9D0D8" stroke-width="1.4"/>
      <circle cx="${x}" cy="${AY}" r="4.6" fill="#FFFFFF" stroke="#3182F6" stroke-width="2.4"/>
      <rect x="${x - CW / 2}" y="${cy}" width="${CW}" height="${CH2}" rx="9" fill="${hid ? "#FFFFFF" : "#F2F4F7"}" stroke="${hid ? "#3182F6" : "#C9D0D8"}" stroke-width="${hid ? 1.7 : 1.3}"${hid ? ' stroke-dasharray="5 4"' : ""}/>
      <text x="${x}" y="${cy + 15}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8B95A1">${e.era}</text>`;
    if (hid) {
      body += `<text x="${x}" y="${cy + CH2 / 2 + 12}" text-anchor="middle" font-size="15" font-weight="800" fill="#1B64DA">${MARK[i] ?? "㉠"}</text>`;
    } else {
      u1WrapKo(e.label, PER).forEach((ln, j) => {
        body += `<text x="${x}" y="${cy + 30 + j * 14}" text-anchor="middle" font-size="11" font-weight="600" fill="#333D4B">${ln}</text>`;
      });
    }
  });
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="시간 축 위아래로 사건 카드를 번갈아 배치한 연표">${body}</svg>`;
}

// ── DB 두 학생 주장 말풍선 ────────────────────────────────────────────
export function debateFig(o: { a: { name: string; claim: string }; b: { name: string; claim: string } }): string {
  const bubble = (name: string, claim: string, y: number, right: boolean): string => {
    const lines = u1WrapKo(claim, 20);
    const BH = lines.length * 17 + 22;
    const BX = right ? 44 : 8;
    const BW = 292;
    const tone = right ? "#F0A422" : "#3182F6";
    const fillT = right ? "#FFF7E8" : "#EEF4FF";
    let g = `<rect x="${BX}" y="${y}" width="${BW}" height="${BH}" rx="13" fill="${fillT}" stroke="${tone}" stroke-width="1.4"/>`;
    g += right
      ? `<path d="M${BX + BW - 26} ${y + BH} l-4 11 l16 -11z" fill="${fillT}" stroke="${tone}" stroke-width="1.4" stroke-linejoin="round"/>`
      : `<path d="M${BX + 26} ${y + BH} l4 11 l-16 -11z" fill="${fillT}" stroke="${tone}" stroke-width="1.4" stroke-linejoin="round"/>`;
    lines.forEach((ln, j) => {
      g += `<text x="${BX + 14}" y="${y + 19 + j * 17}" font-size="12.5" fill="#333D4B">${ln}</text>`;
    });
    const nx = right ? BX + BW - 12 : BX + 12;
    g += `<text x="${nx}" y="${y + BH + 24}" text-anchor="${right ? "end" : "start"}" font-size="12" font-weight="800" fill="${tone}">${name}</text>`;
    return g;
  };
  const aLines = u1WrapKo(o.a.claim, 20).length;
  const y2 = 8 + (aLines * 17 + 22) + 34;
  const H = y2 + (u1WrapKo(o.b.claim, 20).length * 17 + 22) + 34;
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="두 학생이 각자의 주장을 말하는 말풍선 두 개">
    ${bubble(o.a.name, o.a.claim, 8, false)}${bubble(o.b.name, o.b.claim, y2, true)}
  </svg>`;
}
// ── u1 v2 섹션 끝 ──

// ── u4 v2 신작(파일럿 승격 · 재출제 9호) ──
// 입자 운동 표현 3종이 정본(설계표 §8-2): 기체 = 블러 꼬리 · 고체 = 바깥 괄호 호 · 액체 = 2겹 괄호+회전.


/** 다크 입자 프리미티브(u4 v2) · 컷 간 입자 개수 12개 통일(개수 보존 검산 가능 설계 · v1의 9/6 혼재 보정).
 *  운동 표현은 교과서 세 상태 그림 문법(사용자 원본 이미지 검수로 확정):
 *  기체 = 날아가는 방향의 블러 꼬리(원뿔 잔상) · 고체 = 입자 양옆 괄호형 진동 호 ( ) ·
 *  액체 = 같은 괄호 호를 더 크게 2겹 + 입자별 회전(고체보다 크게 흔들리는 느낌). */
const dotP = (x: number, y: number, r = 5.6): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#6E9EDB"/><circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.33).toFixed(1)}" r="${(r * 0.3).toFixed(1)}" fill="rgba(255,255,255,.4)"/>`;
/** 기체 블러 꼬리 · ang = 날아가는 방향(라디안) · 꼬리는 반대쪽으로 좁아지며 페이드. */
const gasTailP = (x: number, y: number, ang: number, len: number, r = 4.7): string => {
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const px = -dy;
  const py = dx;
  const w = r * 0.8;
  const tx = x - dx * len;
  const ty = y - dy * len;
  return `<path d="M${(x - px * w).toFixed(1)} ${(y - py * w).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} L${(x + px * w).toFixed(1)} ${(y + py * w).toFixed(1)} Z" fill="#8FB3E8" opacity=".22"/>
    <circle cx="${(x - dx * len * 0.55).toFixed(1)}" cy="${(y - dy * len * 0.55).toFixed(1)}" r="${(r * 0.55).toFixed(1)}" fill="#8FB3E8" opacity=".13"/>`;
};
/** 고체 진동 호 · 교과서 (나) 문법: 격자 덩어리의 **맨 바깥쪽에만** 그린다(입자 사이사이에는 없음).
 *  side = 그 입자가 덩어리 가장자리에서 바깥을 향한 면. */
const vibSideP = (x: number, y: number, side: "l" | "r" | "t" | "b", r = 5.8): string => {
  const rr = r + 3;
  const S = `stroke="#8FB3E8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"`;
  if (side === "l") return `<path d="M${(x - rr).toFixed(1)} ${(y - 4.8).toFixed(1)}q-2.4 4.8 0 9.6" ${S}/>`;
  if (side === "r") return `<path d="M${(x + rr).toFixed(1)} ${(y - 4.8).toFixed(1)}q2.4 4.8 0 9.6" ${S}/>`;
  if (side === "t") return `<path d="M${(x - 4.8).toFixed(1)} ${(y - rr).toFixed(1)}q4.8 -2.4 9.6 0" ${S}/>`;
  return `<path d="M${(x - 4.8).toFixed(1)} ${(y + rr).toFixed(1)}q4.8 2.4 9.6 0" ${S}/>`;
};
/** 바깥 방향(중심 반대쪽) 진동 호 1개 · 고리형 고체(얼음)용. */
const vibOutP = (x: number, y: number, cx: number, cy: number, r = 5.2): string => {
  const deg = ((Math.atan2(y - cy, x - cx) * 180) / Math.PI).toFixed(1);
  const rr = r + 3;
  return `<g transform="rotate(${deg} ${x} ${y})"><path d="M${(x + rr).toFixed(1)} ${(y - 4.8).toFixed(1)}q2.4 4.8 0 9.6" stroke="#8FB3E8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/></g>`;
};
/** 액체 진동 호 · 괄호 2겹 + 입자별 회전(교과서 (다) 문법 · 고체보다 크게 흔들림). */
const vib2P = (x: number, y: number, i: number, r = 5.6): string => {
  const rot = [0, 26, -26, 13, -13][i % 5];
  const r1 = r + 2.8;
  const r2 = r + 5.8;
  const arc = (rr: number): string =>
    `M${(x - rr).toFixed(1)} ${(y - 4.6).toFixed(1)}q-2.3 4.6 0 9.2M${(x + rr).toFixed(1)} ${(y - 4.6).toFixed(1)}q2.3 4.6 0 9.2`;
  return `<g transform="rotate(${rot} ${x} ${y})">
    <path d="${arc(r1)}" stroke="#8FB3E8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/>
    <path d="${arc(r2)}" stroke="#8FB3E8" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".3"/>
  </g>`;
};
/** 배치 3종 · 상자 좌표계 (0,0)~(94,84) · 전부 12개. */
const gridP = (): string => {
  let out = "";
  for (let i = 0; i < 12; i++) {
    const c = i % 4;
    const rw = Math.floor(i / 4);
    const x = 20 + c * 18;
    const y = 24 + rw * 20;
    let vib = "";
    if (c === 0) vib += vibSideP(x, y, "l");
    if (c === 3) vib += vibSideP(x, y, "r");
    if (rw === 0) vib += vibSideP(x, y, "t");
    if (rw === 2) vib += vibSideP(x, y, "b");
    out += vib + dotP(x, y, 5.8);
  }
  return out;
};
const clumpP = (): string => {
  // 교과서 액체 표준(사용자 검수 반영): 서로 닿을 듯 말 듯한 틈(중심 간 = 지름의 1.3배쯤)을 두고
  // 불규칙하게 아래쪽 2/3를 채운다 · 다닥다닥 겹칠 듯 뭉치면 실격 · 위 1/3은 자유 표면으로 비움.
  const pts: [number, number][] = [
    [21, 41], [36, 38], [50, 42], [65, 39], [79, 42],
    [27, 55], [42, 53], [57, 56], [71, 53],
    [33, 68], [48, 70], [63, 67],
  ];
  return pts.map(([x, y], i) => vib2P(x, y, i) + dotP(x, y, 5.6)).join("");
};
const scatterP = (motion = true): string => {
  const pts: [number, number][] = [
    [14, 14], [46, 10], [78, 16], [28, 32], [62, 30], [86, 38],
    [12, 48], [42, 46], [72, 52], [22, 68], [54, 66], [82, 72],
  ];
  return pts.map(([x, y], i) => `${motion ? gasTailP(x, y, ((i * 137) % 360) * (Math.PI / 180), 13) : ""}${dotP(x, y, 4.7)}`).join("");
};
/** 상태 성질 모형용 성긴 기체(교과서 세 상태 그림 표준 · 5~6개 + 날아가는 블러 꼬리).
 *  변화 전후 2컷(PP2·SB)은 개수 보존 검산 때문에 scatterP(12)를 유지한다(천체 실측 12=12 계보). */
const scatterSparseP = (): string => {
  const pts: [number, number][] = [[20, 16], [64, 12], [84, 42], [38, 40], [16, 66], [64, 66]];
  return pts.map(([x, y], i) => `${gasTailP(x, y, ((i * 137 + 40) % 360) * (Math.PI / 180), 18, 5)}${dotP(x, y, 5)}`).join("");
};
const boxP = (x: number, y: number, inner: string, label?: string): string =>
  `<g transform="translate(${x},${y})"><rect x="0" y="0" width="94" height="84" rx="13" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>${inner}</g>${label ? `<text x="${x + 47}" y="${y + 104}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#AFC3E3">${label}</text>` : ""}`;

/** PP2 상태 변화 입자 모형 2컷(다크·6방향) · 왼쪽 상자가 화살표를 지나 오른쪽 상자로.
 *  컷 간 입자 개수 12 = 12(개수 보존 판정 성립). aria는 중립(방향·상태 판독 결과를 낭독하지 않는다). */
export function particleChangeFig(kind: "melt" | "freeze" | "vaporize" | "condense" | "sublime" | "deposit", o?: { labels?: [string, string] }): string {
  const arr: Record<string, [string, string]> = {
    melt: [gridP(), clumpP()],
    freeze: [clumpP(), gridP()],
    vaporize: [clumpP(), scatterP()],
    condense: [scatterP(), clumpP()],
    sublime: [gridP(), scatterP()],
    deposit: [scatterP(), gridP()],
  };
  const [a, b] = arr[kind];
  const la = o?.labels?.[0];
  const lb = o?.labels?.[1];
  const H = la ? 132 : 116;
  return `<svg viewBox="0 0 344 ${H}" ${NS} fill="none" role="img" aria-label="입자 배열 모형 두 상자. 왼쪽 상자의 배열이 화살표를 지나 오른쪽 상자의 배열로 변한다">
    ${boxP(28, 14, a, la)}
    <path d="M142 56h52" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M186 44l14 12-14 12" fill="none" stroke="#AFC3E3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${boxP(222, 14, b, lb)}
  </svg>`;
}

/** PT3 세 상태 입자 모형(다크·배정 파라미터판) · order로 (가)(나)(다) 배정을 바꾼다
 *  (구 stateTrioFig 고정 배열 (가)기체(나)고체(다)액체의 회피판). motion = 운동 표현 유지. */
export function stateTrioParamFig(order: ("solid" | "liquid" | "gas")[]): string {
  const inner: Record<string, string> = { solid: gridP(), liquid: clumpP(), gas: scatterSparseP() };
  const tags = ["(가)", "(나)", "(다)"];
  return `<svg viewBox="0 0 344 136" ${NS} fill="none" role="img" aria-label="물질의 세 가지 상태를 나타낸 입자 배열 모형 세 상자. 상자마다 입자의 배열과 간격이 다르다">
    ${order.map((k, i) => boxP(16 + i * 108, 8, inner[k], tags[i])).join("")}
  </svg>`;
}

/** SM 한 상태 입자 모형 단독(다크·확대 1컷). */
export function stateSingleFig(kind: "solid" | "liquid" | "gas"): string {
  const inner: Record<string, string> = { solid: gridP(), liquid: clumpP(), gas: scatterSparseP() };
  return `<svg viewBox="0 0 344 128" ${NS} fill="none" role="img" aria-label="어떤 상태의 입자 배열 모형 한 상자">
    <g transform="translate(114,10) scale(1.24)"><rect x="0" y="0" width="94" height="84" rx="13" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>${inner[kind]}</g>
  </svg>`;
}

/** MX 융해 진행 중(수평 구간) 공존 모형(다크 1컷) · 아래쪽 규칙 덩어리 + 둘레 흐트러진 입자. */
export function meltMixFig(): string {
  // 아직 안 녹은 규칙 덩어리(하단 · 밀집 격자 · 진동 호) + 먼저 녹은 입자(둘레 · 운동 잔상) · 경계 분리.
  let grid = "";
  const gp: [number, number][] = [[33, 56], [47, 56], [61, 56], [33, 70], [47, 70], [61, 70]];
  gp.forEach(([x, y], i) => {
    const c = i % 3;
    const rw = Math.floor(i / 3);
    let vib = "";
    if (c === 0) vib += vibSideP(x, y, "l");
    if (c === 2) vib += vibSideP(x, y, "r");
    if (rw === 0) vib += vibSideP(x, y, "t");
    if (rw === 1) vib += vibSideP(x, y, "b");
    grid += vib + dotP(x, y, 5.8);
  });
  const liq: [number, number][] = [[16, 26], [38, 20], [62, 24], [82, 34], [12, 52], [82, 62]];
  const liqArt = liq.map(([x, y], i) => vib2P(x, y, i, 5.4) + dotP(x, y, 5.4)).join("");
  return `<svg viewBox="0 0 344 128" ${NS} fill="none" role="img" aria-label="가열 중인 용기 속 입자 모형 한 상자. 규칙적으로 모여 있는 부분과 흐트러진 부분이 함께 있다">
    <g transform="translate(114,10) scale(1.24)"><rect x="0" y="0" width="94" height="84" rx="13" fill="rgba(255,255,255,.04)" stroke="#2C4066" stroke-width="1.5"/>${liqArt}${grid}</g>
  </svg>`;
}

/** IL 물/얼음 입자 배열 비교(다크 2컷) · 얼음은 가운데가 빈 고리(틈) 얼개 · 물은 촘촘 불규칙.
 *  같은 개수(12)로 그려 부피 차이의 원인이 "틈"임을 판독하게 한다. */
export function iceLatticeFig(): string {
  // 얼음 = 가운데가 빈 육각 고리 얼개 · 고리 결합선을 함께 그려 "틈"이 한눈에 읽히게 한다(점만으로는 약함).
  const ringHex = (cx: number, cy: number, r: number): string => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    const outline = `<path d="${pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")} Z" stroke="#3D5378" stroke-width="1.6" fill="none"/>`;
    return outline + pts.map(([x, y]) => vibOutP(x, y, cx, cy) + dotP(x, y, 5.2)).join("");
  };
  const ice = `${ringHex(31, 30, 16)}${ringHex(63, 56, 16)}<line x1="31" y1="46" x2="49" y2="48" stroke="#3D5378" stroke-width="1.6"/>`;
  return `<svg viewBox="0 0 344 132" ${NS} fill="none" role="img" aria-label="두 입자 배열 모형. 왼쪽 상자는 물, 오른쪽 상자는 얼음이라고 표시되어 있다">
    ${boxP(48, 8, clumpP(), "(가) 물")}
    ${boxP(202, 8, ice, "(나) 얼음")}
  </svg>`;
}

/** EB 증발/끓음 비교 모형(다크 2컷) · (가) 표면에서만 조용히 이탈 · (나) 액체 속 기포 + 활발한 이탈. */
export function evapBoilFig(): string {
  const surface = (esc: string, inner: string): string => `${inner}${esc}`;
  const liqLow = ((): string => {
    const pts: [number, number][] = [[20, 46], [38, 42], [56, 47], [74, 43], [26, 60], [46, 62], [64, 58], [78, 64], [34, 74], [56, 74]];
    return pts.map(([x, y], i) => vib2P(x, y, i, 5.4) + dotP(x, y, 5.4)).join("");
  })();
  const evap = surface(`${gasTailP(36, 18, -1.35, 10, 4.8)}${dotP(36, 18, 4.8)}${gasTailP(70, 12, -1.75, 10, 4.8)}${dotP(70, 12, 4.8)}<path d="M24 34h46" stroke="#3D5378" stroke-width="1.6" stroke-dasharray="4 4"/>`, liqLow);
  const boilLiq = ((): string => {
    const pts: [number, number][] = [[18, 48], [36, 44], [72, 46], [24, 62], [78, 62], [40, 76], [60, 76]];
    return pts.map(([x, y], i) => vib2P(x, y, i, 5.4) + dotP(x, y, 5.4)).join("");
  })();
  const bubble = `<circle cx="52" cy="58" r="12" stroke="#8FB3E8" stroke-width="1.6" fill="rgba(143,179,232,.08)"/>${dotP(48, 56, 3.6)}${dotP(57, 60, 3.6)}
    <circle cx="66" cy="34" r="8" stroke="#8FB3E8" stroke-width="1.4" fill="rgba(143,179,232,.08)"/>${dotP(66, 34, 3.2)}`;
  const boil = surface(`${gasTailP(28, 14, -1.55, 11, 4.8)}${dotP(28, 14, 4.8)}${gasTailP(56, 10, -1.3, 11, 4.8)}${dotP(56, 10, 4.8)}${gasTailP(82, 16, -1.85, 11, 4.8)}${dotP(82, 16, 4.8)}<path d="M14 28h66" stroke="#3D5378" stroke-width="1.6" stroke-dasharray="4 4"/>${bubble}`, boilLiq);
  return `<svg viewBox="0 0 344 132" ${NS} fill="none" role="img" aria-label="액체가 기체로 변하는 두 가지 방식의 입자 모형 (가)와 (나). 두 상자의 속 모습이 서로 다르다">
    ${boxP(48, 8, evap, "(가)")}
    ${boxP(202, 8, boil, "(나)")}
  </svg>`;
}

/** QC 정성 가열·냉각 곡선(라이트) · 실측 3사 이식: 눈금 수치 없음 · 축 라벨(온도(℃)/시간(분))과
 *  원점 0만 · 구간 라벨 ㉠~㉤(레슨 (가)~(라) 회피) · 경계 세로 점선. pair = 같은 물질 양 비교 두 곡선. */
export function qualCurveFig(o: { mode: "heat" | "cool"; plateaus?: 1 | 2; secs?: boolean; pair?: boolean }): string {
  const L = 42;
  const BASE = 164;
  const TOP = 24;
  // secs 모드에서는 구간 라벨(㉠~)이 BASE+18 줄을 쓰므로 시간(분) 축 제목을 한 줄 아래로 내린다(겹침 방지).
  const axis = `<path d="M${L} ${TOP - 8}V${BASE}H326" stroke="#B0B8C1" stroke-width="1.6" fill="none"/>
    <text x="${L - 10}" y="${BASE + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">0</text>
    <text x="10" y="16" font-size="11" fill="#4E5968">온도(℃)</text>
    <text x="336" y="${BASE + (o.secs ? 34 : 18)}" text-anchor="end" font-size="11" fill="#4E5968">시간(분)</text>`;
  const seg = (pts: [number, number][], color = "#5E6B7E", w = 3): string =>
    `<path d="${pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ")}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (o.pair) {
    const pa: [number, number][] = [[L, 148], [104, 92], [156, 92], [232, 38]];
    const pb: [number, number][] = [[L, 148], [138, 92], [252, 92], [318, 44]];
    return `<svg viewBox="0 0 344 196" ${NS} role="img" aria-label="같은 물질을 가열한 두 온도 그래프 (가)와 (나). 온도가 일정하게 유지되는 구간의 높이는 서로 같고, 길이는 서로 다르다">
      ${axis}
      <line x1="${L}" y1="92" x2="326" y2="92" stroke="#DCE0E6" stroke-width="1.2" stroke-dasharray="3 4"/>
      ${seg(pa, "#4E5968")}${seg(pb, "#3182F6")}
      <text x="238" y="34" font-size="11.5" font-weight="700" fill="#4E5968">(가)</text>
      <text x="322" y="40" text-anchor="end" font-size="11.5" font-weight="700" fill="#3182F6">(나)</text>
    </svg>`;
  }
  const two = o.plateaus === 2;
  let pts: [number, number][];
  if (o.mode === "heat") {
    pts = two
      ? [[L, 152], [102, 112], [158, 112], [216, 62], [266, 62], [318, 32]]
      : [[L, 148], [128, 92], [216, 92], [312, 38]];
  } else {
    pts = two
      ? [[L, 34], [102, 74], [158, 74], [216, 124], [266, 124], [318, 154]]
      : [[L, 40], [128, 96], [216, 96], [312, 150]];
  }
  let secs = "";
  if (o.secs) {
    const marks = ["㉠", "㉡", "㉢", "㉣", "㉤"];
    const bounds = [L, ...pts.slice(1, -1).map(([x]) => x), 326];
    for (let i = 0; i < bounds.length - 1 && i < marks.length; i++) {
      const mid = (bounds[i] + bounds[i + 1]) / 2;
      secs += `<text x="${mid.toFixed(0)}" y="${BASE + 18}" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${marks[i]}</text>`;
      if (i > 0) secs += `<line x1="${bounds[i]}" y1="${BASE}" x2="${bounds[i]}" y2="${TOP}" stroke="#DCE0E6" stroke-width="1" stroke-dasharray="2 4"/>`;
    }
  }
  return `<svg viewBox="0 0 344 ${o.secs ? 206 : 192}" ${NS} role="img" aria-label="물질을 ${o.mode === "heat" ? "가열" : "냉각"}할 때 시간에 따른 온도 변화를 나타낸 그래프. 온도가 일정하게 유지되는 구간이 있다">
    ${axis}${secs}
    ${seg(pts)}
  </svg>`;
}

/** TRI 상태 변화 삼각 다이어그램(라이트·모형 꼭짓점판) · 꼭짓점 = 입자 모형 원판(상태 이름 미표기 ·
 *  판독 과제) · 화살표 (가)~(바) 고정 배정: (가) 고체→액체 · (나) 액체→고체 · (다) 액체→기체 ·
 *  (라) 기체→액체 · (마) 고체→기체 · (바) 기체→고체. 위 = 기체 · 좌하 = 고체 · 우하 = 액체(앱 관례). */
export function phaseTriModelFig(): string {
  const md = (x: number, y: number, r = 3): string => `<circle cx="${x}" cy="${y}" r="${r}" fill="#8B95A1"/>`;
  const gtail = (x: number, y: number, deg: number): string => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const px = -dy;
    const py = dx;
    const w = 2.1;
    const L = 7.5;
    return `<path d="M${(x - px * w).toFixed(1)} ${(y - py * w).toFixed(1)} L${(x - dx * L).toFixed(1)} ${(y - dy * L).toFixed(1)} L${(x + px * w).toFixed(1)} ${(y + py * w).toFixed(1)} Z" fill="#8B95A1" opacity=".3"/>`;
  };
  const miniSolid = `${md(-11, -6)}${md(0, -6)}${md(11, -6)}${md(-11, 5)}${md(0, 5)}${md(11, 5)}${md(-11, 16)}${md(0, 16)}${md(11, 16)}`;
  const miniLiquid = `${md(-12, -4)}${md(-1, -8)}${md(10, -3)}${md(-7, 7)}${md(4, 6)}${md(13, 9)}${md(-2, 17)}${md(9, 18)}`;
  const miniGas = `${gtail(-14, -10, 215)}${md(-14, -10, 2.6)}${gtail(8, -14, 80)}${md(8, -14, 2.6)}${gtail(15, 2, 340)}${md(15, 2, 2.6)}${gtail(-6, 4, 150)}${md(-6, 4, 2.6)}${gtail(-15, 14, 250)}${md(-15, 14, 2.6)}${gtail(6, 16, 30)}${md(6, 16, 2.6)}`;
  const node = (cx: number, cy: number, inner: string): string =>
    `<circle cx="${cx}" cy="${cy}" r="38" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.5"/><g transform="translate(${cx},${cy})">${inner}</g>`;
  const arrow = (x1: number, y1: number, x2: number, y2: number, lab: string, lx: number, ly: number): string => {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = (a: number): number => x2 - Math.cos(ang - a) * 9;
    const hy = (a: number): number => y2 - Math.sin(ang - a) * 9;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6B7684" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M${x2} ${y2} L${hx(0.44).toFixed(1)} ${hy(0.44).toFixed(1)} M${x2} ${y2} L${hx(-0.44).toFixed(1)} ${hy(-0.44).toFixed(1)}" stroke="#6B7684" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <circle cx="${lx}" cy="${ly}" r="14" fill="#fff" stroke="#B0B8C1" stroke-width="1.4"/>
      <text x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#333D4B">${lab}</text>`;
  };
  return `<svg viewBox="0 0 344 258" ${NS} fill="none" role="img" aria-label="세 개의 입자 배열 원판 사이를 화살표 (가)부터 (바)까지가 잇는 상태 변화 그림. 원판에는 상태 이름이 적혀 있지 않다">
    ${node(172, 52, miniGas)}
    ${node(66, 200, miniSolid)}
    ${node(278, 200, miniLiquid)}
    ${arrow(112, 188, 226, 188, "(가)", 169, 172)}
    ${arrow(226, 218, 112, 218, "(나)", 169, 236)}
    ${arrow(266, 158, 210, 78, "(다)", 222, 134)}
    ${arrow(226, 62, 288, 154, "(라)", 298, 92)}
    ${arrow(80, 158, 136, 78, "(마)", 122, 134)}
    ${arrow(118, 62, 56, 154, "(바)", 46, 92)}
  </svg>`;
}

/** DF 확산 관찰(라이트) · time = 색소 한 방울의 시간 순 3컷 · temp = 같은 시간 뒤 뜨거운 물/차가운 물 비교. */
export function diffuseSeqFig(mode: "time" | "temp"): string {
  const beaker = (x: number, w: number, ink: string, label: string): string => `
    <g transform="translate(${x},0)">
      <path d="M6 18 V96 a8 8 0 0 0 8 8 H${w - 14} a8 8 0 0 0 8-8 V18" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      <line x1="2" y1="18" x2="${w - 2}" y2="18" stroke="#8B95A1" stroke-width="2" stroke-linecap="round"/>
      <rect x="8" y="30" width="${w - 16}" height="72" rx="6" fill="#EAF3FF"/>
      ${ink}
      <text x="${w / 2}" y="124" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  if (mode === "time") {
    const drop = `<ellipse cx="46" cy="94" rx="15" ry="7" fill="#3B6FD4" opacity=".85"/>`;
    const mid = `<ellipse cx="46" cy="84" rx="24" ry="18" fill="#3B6FD4" opacity=".38"/><ellipse cx="46" cy="92" rx="30" ry="10" fill="#3B6FD4" opacity=".5"/>`;
    const full = `<rect x="8" y="30" width="76" height="72" rx="6" fill="#3B6FD4" opacity=".34"/>`;
    return `<svg viewBox="0 0 344 132" ${NS} fill="none" role="img" aria-label="물이 든 비커 바닥에 색소 한 방울을 떨어뜨린 뒤 시간 순서대로 관찰한 세 장면">
      ${beaker(14, 92, drop, "(가)")}${beaker(126, 92, mid, "(나)")}${beaker(238, 92, full, "(다)")}
    </svg>`;
  }
  const spreadBig = `<ellipse cx="53" cy="76" rx="36" ry="30" fill="#3B6FD4" opacity=".4"/><ellipse cx="53" cy="90" rx="42" ry="14" fill="#3B6FD4" opacity=".5"/>`;
  const spreadSmall = `<ellipse cx="53" cy="92" rx="18" ry="9" fill="#3B6FD4" opacity=".7"/>`;
  return `<svg viewBox="0 0 344 132" ${NS} fill="none" role="img" aria-label="같은 시간이 지난 뒤 두 비커를 비교한 그림. 한쪽은 뜨거운 물, 다른 쪽은 차가운 물이라고 표시되어 있다">
    ${beaker(46, 106, spreadBig, "(가) 뜨거운 물")}${beaker(196, 106, spreadSmall, "(나) 차가운 물")}
  </svg>`;
}

/** OB 열린 접시 증발 저울(라이트 2컷) · (가) 직후 진한 얼룩 · (나) 시간이 지난 뒤 옅은 얼룩 ·
 *  표시창은 빈 패널(숫자 각인 금지 · u4 원조 관행). */
export function openScaleFig(): string {
  const unit = (x: number, stain: string, label: string): string => `
    <g transform="translate(${x},0)">
      <ellipse cx="76" cy="42" rx="52" ry="10" fill="#F4F6F8" stroke="#8B95A1" stroke-width="1.8"/>
      <ellipse cx="76" cy="38" rx="52" ry="10" fill="#fff" stroke="#8B95A1" stroke-width="1.8"/>
      <ellipse cx="76" cy="38" rx="34" ry="6.4" fill="#FDFEFF" stroke="#C9D0D9" stroke-width="1.2"/>
      ${stain}
      <path d="M28 56h96a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="46" y="64" width="60" height="16" rx="4" fill="#2A3442"/>
      <text x="76" y="112" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  const wetStain = `<ellipse cx="76" cy="37" rx="24" ry="4.6" fill="#9EC5FB" opacity=".9"/>`;
  const dryStain = `<ellipse cx="76" cy="37" rx="11" ry="2.6" fill="#C9DDF7" opacity=".8"/>
    <g stroke="#9EC5FB" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M62 26c-2-4 2-6 0-10M90 27c-2-4 2-6 0-10"/></g>`;
  return `<svg viewBox="0 0 344 124" ${NS} fill="none" role="img" aria-label="전자저울 위 접시에 액체를 떨어뜨린 거름종이를 올린 두 장면. 얼룩의 크기가 서로 다르고 표시창은 비어 있다">
    ${unit(10, wetStain, "(가) 떨어뜨린 직후")}${unit(182, dryStain, "(나) 시간이 지난 뒤")}
  </svg>`;
}

/** SY 주사기 압축 비교(라이트 2컷) · 입구를 막고 피스톤을 누른 결과 · (가) 공기 크게 눌림 · (나) 물 거의 안 눌림. */
export function syringeFig(): string {
  const unit = (y: number, plungerX: number, inner: string, label: string): string => `
    <g transform="translate(30,${y})">
      <rect x="60" y="6" width="180" height="34" rx="8" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      <rect x="240" y="14" width="16" height="18" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
      <rect x="256" y="19" width="10" height="8" rx="3" fill="#8B95A1"/>
      ${inner}
      <rect x="${plungerX}" y="8" width="9" height="30" rx="3" fill="#B7C0CC" stroke="#8B95A1" stroke-width="1.4"/>
      <rect x="${plungerX - 44}" y="19" width="46" height="8" rx="3" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.4"/>
      <rect x="${plungerX - 56}" y="10" width="12" height="26" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.4"/>
      <path d="M${plungerX - 78} 23h14M${plungerX - 70} 17l8 6-8 6" stroke="#F04452" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="150" y="62" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  const airDots = [[172, 16], [196, 24], [184, 32], [212, 15], [222, 30], [206, 23]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#9EC5FB"/>`)
    .join("");
  const waterFill = `<rect x="122" y="8" width="118" height="30" rx="6" fill="#B7D3F2" opacity=".9"/>` +
    [[130, 15], [148, 27], [166, 14], [184, 28], [202, 15], [220, 27], [232, 16], [139, 21], [157, 20], [175, 21], [193, 21], [211, 20]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#6E9EDB"/>`)
      .join("");
  return `<svg viewBox="0 0 344 148" ${NS} fill="none" role="img" aria-label="입구를 막은 주사기 두 개를 같은 힘으로 누른 그림. (가)는 피스톤이 깊이 들어갔고 (나)는 거의 들어가지 않았다">
    ${unit(2, 168, airDots, "(가) 공기")}
    ${unit(78, 118, waterFill, "(나) 물")}
  </svg>`;
}

/** SB 밀폐 용기 상태 변화 전후(라이트) · zip = 지퍼 백(드라이아이스류 · 저울 없음 · 부피 대비) ·
 *  flask = 마개 플라스크+저울(빈 패널 · 질량 대비) · open = 마개 없는 대비판. */
export function sealedPairFig(o: { vessel: "zip" | "flask"; open?: boolean }): string {
  // 라이트 그림용 기체 꼬리(교과서 문법 · 지퍼 백 기체 입자에도 운동 꼬리를 그린다 · 천재 실측 계보).
  const ltail = (x: number, y: number, deg: number, L = 9, w = 2.6): string => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const px = -dy;
    const py = dx;
    return `<path d="M${(x - px * w).toFixed(1)} ${(y - py * w).toFixed(1)} L${(x - dx * L).toFixed(1)} ${(y - dy * L).toFixed(1)} L${(x + px * w).toFixed(1)} ${(y + py * w).toFixed(1)} Z" fill="#9EC5FB" opacity=".4"/>`;
  };
  if (o.vessel === "zip") {
    const flat = `
      <g transform="translate(20,26)">
        <path d="M4 44 Q2 20 14 16 H128 Q140 20 138 44 Q140 62 128 64 H14 Q2 62 4 44z" fill="#F4F8FE" stroke="#8B95A1" stroke-width="2"/>
        <rect x="10" y="10" width="122" height="9" rx="4" fill="#C9D6E8" stroke="#8B95A1" stroke-width="1.4"/>
        <g transform="translate(46,25)">${[...Array(12)].map((_, i) => dotP(7 + (i % 4) * 12.5, 8 + Math.floor(i / 4) * 11.5, 4.2)).join("")}</g>
        <text x="71" y="92" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(가) 넣은 직후</text>
      </g>`;
    const puffed = `
      <g transform="translate(186,10)">
        <path d="M6 58 Q-6 26 22 14 H118 Q146 26 134 58 Q146 84 112 92 H28 Q-6 84 6 58z" fill="#F4F8FE" stroke="#8B95A1" stroke-width="2"/>
        <rect x="16" y="6" width="110" height="9" rx="4" fill="#C9D6E8" stroke="#8B95A1" stroke-width="1.4"/>
        ${[[34, 34], [66, 26], [98, 36], [26, 56], [56, 50], [88, 56], [112, 48], [44, 72], [76, 70], [104, 72], [60, 86], [88, 84]].map(([x, y], i) => `${ltail(x, y, (i * 137 + 25) % 360, 8, 2.4)}<circle cx="${x}" cy="${y}" r="3.6" fill="#9EC5FB"/>`).join("")}
        <text x="70" y="118" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(나) 시간이 지난 뒤</text>
      </g>`;
    return `<svg viewBox="0 0 344 140" ${NS} fill="none" role="img" aria-label="꼭 잠근 지퍼 백 두 장면. 하나는 납작하고 안에 고체 조각이 있으며, 다른 하나는 크게 부풀어 있다">${flat}${puffed}</svg>`;
  }
  const flask = (x: number, inner: string, label: string, open?: boolean): string => `
    <g transform="translate(${x},0)">
      ${open ? `<path d="M62 20h16" stroke="#8B95A1" stroke-width="1.8"/>` : `<rect x="60" y="12" width="20" height="12" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>`}
      <path d="M62 24 v16 L40 82 a10 10 0 0 0 9 14 h42 a10 10 0 0 0 9-14 L78 40 v-16" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      ${inner}
      <path d="M50 102h40a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H50a8 8 0 0 1-8-8v-14a8 8 0 0 1 8-8z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="55" y="108" width="30" height="13" rx="4" fill="#2A3442"/>
      <text x="70" y="152" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  const liquid = `<path d="M46 86 L94 86 a7 7 0 0 1 3 9 l-1 3 a8 8 0 0 1-8 5 h-46 a8 8 0 0 1-8-5 l-1-3 a7 7 0 0 1 3-9z" fill="#B7D3F2" opacity=".9" transform="translate(4,0)"/>`;
  const gasDots = [[58, 56], [78, 48], [68, 72], [52, 84], [86, 80], [74, 92]].map(([x, y], i) => `${ltail(x, y, (i * 137 + 60) % 360, 7, 2)}<circle cx="${x}" cy="${y}" r="3" fill="#9EC5FB" opacity=".85"/>`).join("");
  return `<svg viewBox="0 0 344 160" ${NS} fill="none" role="img" aria-label="${o.open ? "마개를 열어 둔" : "마개로 꼭 막은"} 플라스크를 전자저울에 올린 두 장면. 왼쪽은 바닥에 액체가 있고 오른쪽은 액체가 보이지 않는다. 표시창은 비어 있다">
    ${flask(24, liquid, "(가) 가열 전", o.open)}
    ${flask(186, gasDots, "(나) 모두 기체가 된 후", o.open)}
  </svg>`;
}

/** DW 물 + 드라이아이스 비커(라이트) · ㉠ 물속 기포 · ㉡ 비커 바깥 면 물방울 · ㉢ 흘러내리는 흰 김 ·
 *  기호 라벨만 붙이고 정체는 인쇄하지 않는다(판정 과제). */
export function dryiceBeakerFig(): string {
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="물이 든 비커 바닥에 흰 고체 덩어리가 있고, 물속에 둥근 기포가 오르며, 비커 바깥 면에 작은 물방울이 맺혀 있고, 비커 위로 흰 김이 넘쳐 흘러내린다. 세 곳에 기호가 붙어 있다">
    <path d="M116 44 V168 a10 10 0 0 0 10 10 h92 a10 10 0 0 0 10-10 V44" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
    <line x1="110" y1="44" x2="234" y2="44" stroke="#8B95A1" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="120" y="72" width="104" height="102" rx="7" fill="#DCEBFB"/>
    <path d="M138 160 l16 -8 18 9 16 -9 14 8 v12 h-64z" fill="#F2F7FD" stroke="#B9CBDF" stroke-width="1.6"/>
    <circle cx="150" cy="128" r="7" fill="#fff" stroke="#9DB8D6" stroke-width="1.5"/>
    <circle cx="182" cy="104" r="5.4" fill="#fff" stroke="#9DB8D6" stroke-width="1.5"/>
    <circle cx="204" cy="136" r="6.4" fill="#fff" stroke="#9DB8D6" stroke-width="1.5"/>
    <circle cx="168" cy="84" r="4.6" fill="#fff" stroke="#9DB8D6" stroke-width="1.5"/>
    <g fill="#9EC5FB"><circle cx="112" cy="96" r="4.2"/><circle cx="111" cy="120" r="3.6"/><circle cx="113" cy="146" r="4"/><circle cx="239" cy="104" r="4"/><circle cx="240" cy="132" r="3.6"/></g>
    <path d="M128 40 Q120 24 138 22 Q142 8 166 12 Q178 2 198 10 Q220 6 224 22 Q240 26 232 40 Q246 52 262 64 Q278 78 270 92 Q286 100 292 114" fill="none" stroke="#C9D4E2" stroke-width="10" stroke-linecap="round" opacity=".75"/>
    <path d="M120 40 Q98 50 84 66 Q70 80 74 96" fill="none" stroke="#C9D4E2" stroke-width="9" stroke-linecap="round" opacity=".7"/>
    <path d="M262 150 L216 136" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="278" cy="154" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="278" y="159" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">㉠</text>
    <path d="M68 168 L108 147" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="54" cy="174" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="54" y="179" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">㉡</text>
    <path d="M296 96 L268 82" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="310" cy="92" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="310" y="97" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">㉢</text>
    <text x="172" y="200" text-anchor="middle" font-size="11" fill="#8B95A1">물이 든 비커 + 흰 고체 덩어리</text>
  </svg>`;
}


/** FCQ 상태 판별 순서도 질문 가림판(라이트) · 첫 질문 = 압축성(인쇄), 두 번째 질문(모양)을 ㉮로 가린다.
 *  e234의 순서도(stateFlowFig · 모양→부피 순)와 위상을 다르게 잡았다: 결론 칸이 인쇄되어도 e234의
 *  빈칸(㉡액체·㉢기체) 자리 대응을 보여 주지 않게(검산 A 유출 적발의 구조적 봉합). */
export function flowQuizFig(): string {
  const ansBox = (x: number, y: number, lab: string): string =>
    `<rect x="${x}" y="${y}" width="84" height="32" rx="10" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.5"/>
     <text x="${x + 42}" y="${y + 21}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#1B64DA">${lab}</text>`;
  const qShape = (cx: number, cy: number, w: number, txt1: string, txt2: string, masked: boolean): string =>
    `<path d="M${cx} ${cy - 30} L${cx + w} ${cy} L${cx} ${cy + 30} L${cx - w} ${cy} Z" fill="${masked ? "#FFF1F0" : "#FFF6E6"}" stroke="${masked ? "#F04452" : "#E8B04B"}" stroke-width="1.5"/>` +
    (masked
      ? `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="15" font-weight="800" fill="#D6173A">㉮</text>`
      : `<text x="${cx}" y="${cy - 3}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8A5A00">${txt1}</text>
         <text x="${cx}" y="${cy + 13}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#8A5A00">${txt2}</text>`);
  const arr = (x1: number, y1: number, x2: number, y2: number): string =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="#8B95A1" stroke-width="1.8"/>`;
  return `<svg viewBox="0 0 344 250" ${NS} fill="none" role="img" aria-label="물질의 상태를 나누는 순서도. 첫 질문은 힘을 가할 때 부피가 크게 줄어드는지 묻고, 두 번째 질문 하나가 기호로 가려져 있다">
    <rect x="128" y="6" width="88" height="30" rx="10" fill="#F7F8FA" stroke="#B0B8C1" stroke-width="1.5"/>
    <text x="172" y="26" text-anchor="middle" font-size="12.5" font-weight="700" fill="#333D4B">물질</text>
    ${arr(172, 36, 172, 48)}
    ${qShape(172, 78, 118, "힘을 가하면 부피가", "크게 줄어드는가?", false)}
    <text x="298" y="68" font-size="11" font-weight="700" fill="#4E5968">예</text>
    ${arr(290, 78, 314, 78)}${arr(314, 78, 314, 120)}
    ${ansBox(252, 122, "기체")}
    <text x="146" y="124" text-anchor="end" font-size="11" font-weight="700" fill="#4E5968">아니요</text>
    ${arr(172, 108, 172, 128)}
    ${qShape(172, 158, 76, "", "", true)}
    <text x="58" y="150" text-anchor="end" font-size="11" font-weight="700" fill="#4E5968">아니요</text>
    ${arr(96, 158, 64, 158)}${arr(64, 158, 64, 204)}
    ${ansBox(22, 206, "고체")}
    <text x="300" y="190" font-size="11" font-weight="700" fill="#4E5968">예</text>
    ${arr(248, 158, 292, 158)}${arr(292, 158, 292, 204)}
    ${ansBox(250, 206, "액체")}
  </svg>`;
}

/** GA 기체 질량 증거(라이트) · 같은 튜브의 바람 넣기 전/후 + 전자저울(빈 패널). */
export function gasWeighFig(): string {
  const scale = (x: number): string => `
    <path d="M${x} 96h104a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H${x}a8 8 0 0 1-8-8v-18a8 8 0 0 1 8-8z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
    <rect x="${x + 24}" y="104" width="56" height="14" rx="4" fill="#2A3442"/>`;
  return `<svg viewBox="0 0 344 156" ${NS} fill="none" role="img" aria-label="같은 튜브를 전자저울에 올린 두 장면. 하나는 쭈글쭈글하고 다른 하나는 빵빵하게 부풀어 있다. 표시창은 비어 있다">
    <g transform="translate(18,0)">
      <path d="M28 82 q-10 -18 8 -26 q-6 -16 18 -18 q10 -12 30 -6 q18 -8 26 6 q20 0 16 18 q14 10 2 26 q-46 14 -100 0z" fill="#FBD9CF" stroke="#C97B5F" stroke-width="2"/>
      <circle cx="80" cy="66" r="6" fill="#C97B5F"/>
      ${scale(26)}
      <text x="78" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(가) 바람 넣기 전</text>
    </g>
    <g transform="translate(186,0)">
      <circle cx="76" cy="52" r="42" fill="#FBD9CF" stroke="#C97B5F" stroke-width="2.4"/>
      <circle cx="76" cy="52" r="22" fill="#fff" stroke="#C97B5F" stroke-width="2"/>
      <circle cx="112" cy="66" r="6" fill="#C97B5F"/>
      ${scale(24)}
      <text x="76" y="148" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(나) 빵빵하게 넣은 후</text>
    </g>
  </svg>`;
}

/** VE 부피 급증 도식(라이트) · 소량의 액체(또는 고체)가 기체가 되며 훨씬 넓은 공간을 차지한다 ·
 *  입자 개수는 양쪽 같게(12) · 배율 수치는 인쇄하지 않는다. */
export function volumeJumpFig(from: "liquid" | "solid"): string {
  const srcInner = from === "liquid"
    ? `<rect x="12" y="46" width="52" height="24" rx="5" fill="#B7D3F2"/>` + [[20, 52], [30, 60], [40, 51], [50, 60], [58, 52], [26, 66], [46, 66], [56, 64], [18, 60], [36, 55], [52, 55], [42, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#4A7BC0"/>`).join("")
    : `<rect x="18" y="42" width="40" height="30" rx="6" fill="#EAF4FF" stroke="#9DB8D6" stroke-width="1.5"/>` + [[28, 50], [40, 50], [50, 50], [28, 60], [40, 60], [50, 60], [28, 68], [40, 68], [50, 68], [34, 55], [46, 55], [34, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#7FA4CC"/>`).join("");
  const gasDots = [[36, 30], [96, 20], [150, 34], [52, 66], [118, 58], [166, 74], [28, 100], [86, 92], [146, 104], [62, 128], [120, 130], [172, 118]]
    .map(([x, y], i) => {
      const a = (((i * 137 + 45) % 360) * Math.PI) / 180;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const px = -dy;
      const py = dx;
      return `<path d="M${(x - px * 2.2).toFixed(1)} ${(y - py * 2.2).toFixed(1)} L${(x - dx * 8).toFixed(1)} ${(y - dy * 8).toFixed(1)} L${(x + px * 2.2).toFixed(1)} ${(y + py * 2.2).toFixed(1)} Z" fill="#7FA4CC" opacity=".35"/><circle cx="${x}" cy="${y}" r="3" fill="#7FA4CC"/>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 164" ${NS} fill="none" role="img" aria-label="작은 그릇에 담긴 물질이 기체가 되어 훨씬 넓은 점선 상자 공간을 차지하는 그림. 입자의 개수는 양쪽이 같다">
    <g transform="translate(8,44)">
      <path d="M8 40 V64 a8 8 0 0 0 8 8 H60 a8 8 0 0 0 8-8 V40" fill="none" stroke="#8B95A1" stroke-width="2"/>
      ${srcInner}
    </g>
    <path d="M92 84h32" stroke="#8B95A1" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M118 74l14 10-14 10" fill="none" stroke="#8B95A1" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(140,8)">
      <rect x="4" y="4" width="192" height="144" rx="14" fill="rgba(158,197,251,.08)" stroke="#9DB8D6" stroke-width="1.8" stroke-dasharray="7 6"/>
      ${gasDots}
    </g>
  </svg>`;
}

/** LD 끓는 물 위 국자 실험(라이트) · 시계 접시 구도 교체판 · (가) 국자 속 얼음물 · (나) 국자 아랫면 물방울. */
export function ladleFig(): string {
  return `<svg viewBox="0 0 344 214" ${NS} fill="none" role="img" aria-label="끓는 물이 든 냄비 위에 얼음물을 담은 국자를 들고 있는 실험 그림. 국자 아랫면에 작은 물방울이 맺혀 있고 두 곳에 기호가 붙어 있다">
    <path d="M84 130h176v44a12 12 0 0 1-12 12H96a12 12 0 0 1-12-12z" fill="#E8EDF3" stroke="#8B95A1" stroke-width="2.2"/>
    <rect x="92" y="138" width="160" height="40" rx="8" fill="#DCEBFB"/>
    <path d="M100 142q10 6 20 0t20 0 20 0 20 0 20 0 20 0" stroke="#9DB8D6" stroke-width="2" fill="none"/>
    <circle cx="120" cy="158" r="4.6" fill="#fff" stroke="#9DB8D6" stroke-width="1.4"/>
    <circle cx="176" cy="164" r="5.4" fill="#fff" stroke="#9DB8D6" stroke-width="1.4"/>
    <circle cx="226" cy="156" r="4.2" fill="#fff" stroke="#9DB8D6" stroke-width="1.4"/>
    <g stroke="#C9D4E2" stroke-width="7" stroke-linecap="round" opacity=".8" fill="none">
      <path d="M128 122c-4-10 6-14 2-24M172 120c-4-10 6-14 2-24M216 122c-4-10 6-14 2-24"/>
    </g>
    <path d="M138 64 a34 20 0 0 0 68 0z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M150 64 a22 12 0 0 0 44 0" fill="#DCEBFB"/>
    <path d="M154 60 l10 -7 8 7 9 -6 8 6" stroke="#B9CBDF" stroke-width="2" fill="none"/>
    <path d="M206 60 L292 34" stroke="#8B95A1" stroke-width="4" stroke-linecap="round"/>
    <rect x="286" y="22" width="34" height="14" rx="6" transform="rotate(-17 286 22)" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.4"/>
    <g fill="#6FA6E8"><circle cx="152" cy="88" r="3.4"/><circle cx="172" cy="92" r="4"/><circle cx="192" cy="87" r="3.2"/></g>
    <path d="M60 52 L136 60" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="44" cy="50" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="44" y="55" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">(가)</text>
    <path d="M66 100 L150 92" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="50" cy="102" r="14" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="50" y="107" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">(나)</text>
    <text x="172" y="204" text-anchor="middle" font-size="11" fill="#8B95A1">(가) 국자 속 얼음물 · (나) 국자 아랫면</text>
  </svg>`;
}

/** WC 겨울 아침 장면 종합(라이트) · ㉠ 유리창 성에 · ㉡ 입김 · ㉢ 빨랫줄의 언 빨래 · 정체 미인쇄. */
export function winterSceneFig(): string {
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="겨울 아침 마당 장면. 유리창에 얼음 결정 무늬, 사람 입 앞의 하얀 김, 빨랫줄에 뻣뻣하게 언 빨래가 있고 세 곳에 기호가 붙어 있다">
    <rect x="20" y="26" width="96" height="120" rx="8" fill="#EAF3FB" stroke="#8B95A1" stroke-width="2"/>
    <line x1="68" y1="26" x2="68" y2="146" stroke="#8B95A1" stroke-width="1.6"/>
    <line x1="20" y1="86" x2="116" y2="86" stroke="#8B95A1" stroke-width="1.6"/>
    <g stroke="#BFDCF2" stroke-width="1.8" fill="none">
      <path d="M28 42l12 12M40 42l-12 12M34 38v20M26 48h16"/>
      <path d="M84 108l14 14M98 108l-14 14M91 104v22M80 115h22"/>
    </g>
    <circle cx="196" cy="76" r="16" fill="#FBE8D8" stroke="#C99B72" stroke-width="1.8"/>
    <path d="M186 96q10 10 20 0" stroke="#C99B72" stroke-width="1.8" fill="none"/>
    <path d="M180 68q-4 4 0 8M212 68q4 4 0 8" stroke="#C99B72" stroke-width="1.6" fill="none"/>
    <path d="M214 84 q16 -4 26 4 q12 -2 16 6" stroke="#D9E2EC" stroke-width="8" stroke-linecap="round" fill="none" opacity=".85"/>
    <path d="M196 92v34l-10 34M196 126l12 34M196 104l-16 8M196 104l18 6" stroke="#C99B72" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M258 60 L338 54" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M268 60 l-3 34 h26 l-3 -35" fill="#F4F7FA" stroke="#9AA6B4" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M304 58 l-2 26 h20 l-2 -27" fill="#F4F7FA" stroke="#9AA6B4" stroke-width="1.8" stroke-linejoin="round"/>
    <g stroke="#C7D6E4" stroke-width="1.2"><path d="M270 70h20M269 80h21M306 68h15M305 76h16"/></g>
    <path d="M56 160 L44 132" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="60" cy="172" r="13" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="60" y="177" text-anchor="middle" font-size="12" font-weight="800" fill="#333D4B">㉠</text>
    <path d="M232 116 L242 96" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="228" cy="128" r="13" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="228" y="133" text-anchor="middle" font-size="12" font-weight="800" fill="#333D4B">㉡</text>
    <path d="M296 116 L288 96" stroke="#B0B8C1" stroke-width="1.6"/>
    <circle cx="300" cy="128" r="13" fill="#fff" stroke="#8B95A1" stroke-width="1.4"/>
    <text x="300" y="133" text-anchor="middle" font-size="12" font-weight="800" fill="#333D4B">㉢</text>
  </svg>`;
}

/** LN3 빨래 세 방법 3컷(라이트) · (가) 응달에 뭉쳐 널기 · (나) 양달에 펼쳐 널기 · (다) 양달 펼침+바람.
 *  증발 조건(온도·표면·바람) 판독용 · 확대 217 multi 데뷔. */
export function laundryTrioFig(): string {
  const panel = (x: number, sun: boolean, spread: boolean, wind: boolean, label: string): string => {
    const sky = sun
      ? `<circle cx="88" cy="18" r="9" fill="#FFD25E"/><path d="M88 4v-3M100 8l2-2M104 18h3M76 8l-2-2" stroke="#FFD25E" stroke-width="2" stroke-linecap="round"/>`
      : `<path d="M70 14q6-8 16-6q4-8 14-5q10-2 12 7q8 2 5 9h-44q-6-1-3-5z" fill="#CBD5E1"/>`;
    const line = `<line x1="8" y1="42" x2="102" y2="42" stroke="#8B95A1" stroke-width="2"/>`;
    const clothes = spread
      ? `<path d="M20 42l-3 26h16l-3-26z" fill="#BFDCF2" stroke="#8FA8BE" stroke-width="1.5"/>
         <path d="M48 42l-3 26h16l-3-26z" fill="#F9D9C0" stroke="#C9A183" stroke-width="1.5"/>
         <path d="M76 42l-3 26h16l-3-26z" fill="#CFead2" stroke="#93B897" stroke-width="1.5"/>`
      : `<path d="M38 42l-6 24q14 8 28 0l-6-24z" fill="#BFDCF2" stroke="#8FA8BE" stroke-width="1.5"/>
         <path d="M46 46l-3 18h14l-3-18z" fill="#F9D9C0" stroke="#C9A183" stroke-width="1.5" opacity=".9"/>`;
    const windArt = wind
      ? `<path d="M6 54q8-4 14 0M4 62q10-5 18 0" stroke="#7FB2E5" stroke-width="2" fill="none" stroke-linecap="round"/>`
      : "";
    return `<g transform="translate(${x},4)">
      <rect x="0" y="0" width="110" height="78" rx="10" fill="#F7FAFD" stroke="#DCE3EA" stroke-width="1.4"/>
      ${sky}${line}${clothes}${windArt}
      <text x="55" y="98" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 110" ${NS} fill="none" role="img" aria-label="같은 빨래를 세 가지 방법으로 널어 말리는 그림. 응달에 뭉쳐 넌 것, 햇볕에 펼쳐 넌 것, 햇볕에 펼치고 바람까지 부는 것">
    ${panel(6, false, false, false, "(가)")}
    ${panel(118, true, true, false, "(나)")}
    ${panel(230, true, true, true, "(다)")}
  </svg>`;
}

/** WT 물의 세 가지 상태(라이트 3컷) · (가) 얼음 · (나) 물 · (다) 수증기(눈에 보이지 않음 표기) ·
 *  이름 라벨을 인쇄하므로 명명 문항 금지 · 성질·공통점 판정 전용(확대 246 데뷔). */
export function waterThreeFig(): string {
  const panel = (x: number, art: string, label: string): string => `
    <g transform="translate(${x},4)">
      <rect x="0" y="0" width="104" height="86" rx="10" fill="#F7FAFD" stroke="#DCE3EA" stroke-width="1.4"/>
      ${art}
      <text x="52" y="106" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  const ice = `<g transform="translate(26,22)">
    <path d="M8 14 L30 6 L52 14 L52 34 L30 44 L8 34 Z" fill="#EAF4FF" stroke="#9DB8D6" stroke-width="2" stroke-linejoin="round"/>
    <path d="M8 14 L30 22 L52 14 M30 22 V44" stroke="#C4DCEF" stroke-width="1.6" fill="none"/>
  </g>`;
  const water = `<g transform="translate(28,14)">
    <path d="M6 8 V52 a8 8 0 0 0 8 8 h20 a8 8 0 0 0 8-8 V8" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
    <rect x="9" y="22" width="30" height="35" rx="5" fill="#B7D3F2"/>
  </g>`;
  // (다) 주둥이 앞은 빈 점선 원만 · "안 보인다"를 글자로 선언하면 타 문항(김 판정)의 열쇠가
  // 인쇄되는 유출(검산 A 적발)이라, 시각(빈 원)으로만 전한다.
  const steam = `<g transform="translate(10,10)">
    <path d="M14 52 a20 12 0 0 1 40 0 l4 8 H10z" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M50 46 L64 38 l6 4 -10 8z" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.4"/>
    <circle cx="76" cy="30" r="15" fill="none" stroke="#9DB8D6" stroke-width="1.5" stroke-dasharray="4 3"/>
  </g>`;
  return `<svg viewBox="0 0 344 116" ${NS} fill="none" role="img" aria-label="물의 세 가지 상태 그림. 얼음, 물, 그리고 끓는 주전자 주둥이 앞의 점선 원">
    ${panel(6, ice, "(가) 얼음")}
    ${panel(120, water, "(나) 물")}
    ${panel(234, steam, "(다) 수증기")}
  </svg>`;
}

/** PR 옮겨 담기 착시(라이트) · 좁고 긴 컵의 주스를 넓은 대접에 남김없이 옮긴 두 장면(높이 대비). */
export function pourFig(): string {
  return `<svg viewBox="0 0 344 156" ${NS} fill="none" role="img" aria-label="좁고 긴 컵에 높이 담긴 주스를 넓은 대접에 남김없이 옮겨 담은 두 장면. 대접에서는 낮게 깔려 있다">
    <g transform="translate(58,8)">
      <path d="M8 6 V104 a8 8 0 0 0 8 8 h28 a8 8 0 0 0 8-8 V6" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      <rect x="11" y="30" width="38" height="79" rx="5" fill="#FBD46B" opacity=".85"/>
      <text x="30" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(가)</text>
    </g>
    <path d="M152 76h28" stroke="#8B95A1" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M174 66l14 10-14 10" fill="none" stroke="#8B95A1" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(200,42)">
      <path d="M2 24 a62 34 0 0 0 124 0 v-12 H2z" fill="#fff" stroke="#8B95A1" stroke-width="2"/>
      <path d="M8 26 a56 26 0 0 0 112 0 v-4 H8z" fill="#FBD46B" opacity=".85"/>
      <ellipse cx="64" cy="20" rx="56" ry="9" fill="#FFE9A8" opacity=".9"/>
      <text x="64" y="98" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">(나)</text>
    </g>
  </svg>`;
}

/** IC 얼음 띄운 컵 단면(라이트) · 얼음의 일부가 수면 위로 나와 떠 있는 관찰 그림. */
export function iceCupFig(): string {
  return `<svg viewBox="0 0 344 152" ${NS} fill="none" role="img" aria-label="물이 든 유리컵 단면. 얼음 조각이 물에 떠 있고 일부가 수면 위로 나와 있다">
    <path d="M122 20 V116 a10 10 0 0 0 10 10 h80 a10 10 0 0 0 10-10 V20" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
    <rect x="126" y="52" width="92" height="70" rx="7" fill="#DCEBFB"/>
    <line x1="126" y1="52" x2="218" y2="52" stroke="#9DB8D6" stroke-width="1.8"/>
    <path d="M150 34 l40 -6 14 22 -6 24 -40 6 -14 -22z" fill="#F2F9FF" stroke="#9DB8D6" stroke-width="2"/>
    <path d="M150 34 l14 22M204 50 l-6 24" stroke="#C4DCEF" stroke-width="1.6"/>
    <text x="172" y="146" text-anchor="middle" font-size="11" fill="#8B95A1">물에 뜬 얼음</text>
  </svg>`;
}

// ── u5 v2 신작(파일럿 승격 · 재출제 7호) ──
// 힘 단원 문법: 화살표 길이 = 값 비례(코드 보장) · 방향이 정답인 문항은 후보 화살표 ㉮~ 제시형만 ·
// 운동 방향은 속이 빈 초록(힘과 구분) · 저울류 표시창은 빈 패널(값은 콜아웃) · quiet 옵션은
// 조건 값이 곧 정답인 평형 문항 전용(aria 값 낭독 생략 · 값은 문두가 제공).


/** 공용 화살표(라이트) · 촉 포함. 길이는 호출부가 값에 비례해 계산한다. */
function fArr(x1: number, y1: number, x2: number, y2: number, color: string, w = 4.4, dash = ""): string {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - Math.cos(ang) * 11;
  const by = y2 - Math.sin(ang) * 11;
  const hx = (a: number): number => x2 - Math.cos(ang - a) * 12;
  const hy = (a: number): number => y2 - Math.sin(ang - a) * 12;
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>
  <path d="M${x2.toFixed(1)} ${y2.toFixed(1)} L${hx(0.44).toFixed(1)} ${hy(0.44).toFixed(1)} L${hx(-0.44).toFixed(1)} ${hy(-0.44).toFixed(1)} Z" fill="${color}"/>`;
}
const DIRV: Record<string, [number, number]> = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] };
const DIRKO: Record<string, string> = { r: "오른쪽", l: "왼쪽", u: "위쪽", d: "아래쪽" };

/** AR 화살표 표현 헬퍼(라이트 · 파라미터형) · L1 전용.
 *  anat: 화살표 한 개에 ㉮(시작점)·㉯(길이 구간)·㉰(화살촉) 기호 · aria는 기호 위치만(요소 이름 낭독 금지).
 *  grid: 모눈 위 화살표 1~3개(칸 수 파라미터) + "모눈 한 칸 = ○" 캡션 옵션 · aria에 칸 수 낭독 금지.
 *  cards: 후보 화살표 카드 ①~⑤(길이·방향·굵기 변형 · 정답 카드가 첫 칸이 되지 않게 저작). */
export function arrowAnatFig(
  o:
    | { mode: "anat" }
    | { mode: "grid"; cell?: string; arrows: { row: number; cells: number; start?: number; dir?: "r" | "l"; name?: string }[] }
    | { mode: "cards"; cards: { len: number; dir: "r" | "l" | "u"; w?: number }[] },
): string {
  if (o.mode === "anat") {
    return `<svg viewBox="0 0 344 128" ${NS} role="img" aria-label="힘을 나타낸 화살표 하나. 시작점에 ㉮, 몸통의 길이 구간에 ㉯, 화살촉에 ㉰ 기호가 붙어 있다">
      <circle cx="72" cy="66" r="6" fill="#34434F"/>
      ${fArr(72, 66, 268, 66, "#5E6B7E", 5)}
      <path d="M72 46 v-8 M256 46 v-8" stroke="#B0B8C1" stroke-width="1.4"/>
      <path d="M72 42 H256" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="4 4"/>
      <text x="72" y="94" text-anchor="middle" font-size="14" font-weight="800" fill="#4E5968">㉮</text>
      <text x="164" y="32" text-anchor="middle" font-size="14" font-weight="800" fill="#4E5968">㉯</text>
      <text x="272" y="94" text-anchor="middle" font-size="14" font-weight="800" fill="#4E5968">㉰</text>
    </svg>`;
  }
  if (o.mode === "grid") {
    const rows = Math.max(...o.arrows.map((a) => a.row)) + 1;
    const H = 20 + rows * 42 + (o.cell ? 26 : 8);
    const x0 = 36;
    let grid = "";
    for (let c = 0; c <= 8; c++) grid += `<line x1="${x0 + c * 32}" y1="14" x2="${x0 + c * 32}" y2="${14 + rows * 42}" stroke="#E4E9EF" stroke-width="1"/>`;
    for (let r = 0; r <= rows; r++) grid += `<line x1="${x0}" y1="${14 + r * 42}" x2="${x0 + 256}" y2="${14 + r * 42}" stroke="#E4E9EF" stroke-width="1"/>`;
    const arrows = o.arrows
      .map((a) => {
        const y = 14 + a.row * 42 + 21;
        const bx = x0 + 8 + (a.start ?? 0) * 32;
        const sx = a.dir === "l" ? bx + a.cells * 32 : bx;
        const ex = a.dir === "l" ? bx : bx + a.cells * 32;
        const name = a.name ? `<text x="${(a.dir === "l" ? ex : sx) - 14}" y="${y + 5}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">${a.name}</text>` : "";
        return `<circle cx="${sx}" cy="${y}" r="4.6" fill="#34434F"/>${fArr(sx, y, ex, y, "#5E6B7E", 4.6)}${name}`;
      })
      .join("");
    const cap = o.cell ? `<text x="292" y="${H - 8}" text-anchor="end" font-size="12" font-weight="700" fill="#4E5968">모눈 한 칸 = ${o.cell}</text>` : "";
    return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="모눈 위에 그린 힘 화살표${o.arrows.length > 1 ? " 여러 개. 길이와 방향을 모눈 칸으로 비교할 수 있다" : " 하나"}">${grid}${arrows}${cap}</svg>`;
  }
  const cards = o.cards
    .map((c, i) => {
      const cx = 8 + i * 66 + 33;
      const cyMid = 52;
      const [dx, dy] = DIRV[c.dir];
      const half = c.len / 2;
      const sx = cx - dx * half;
      const sy = cyMid + 10 - dy * half;
      return `<g>
        <rect x="${8 + i * 66}" y="8" width="62" height="86" rx="12" fill="#F7F9FB" stroke="#D5DBE3" stroke-width="1.4"/>
        <text x="${cx}" y="28" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${["①", "②", "③", "④", "⑤"][i]}</text>
        <circle cx="${sx}" cy="${sy}" r="3.8" fill="#34434F"/>
        ${fArr(sx, sy, sx + dx * c.len, sy + dy * c.len, "#5E6B7E", c.w ?? 4.4)}
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 102" ${NS} role="img" aria-label="힘 화살표 후보 카드 ①에서 ⑤. 길이나 방향, 굵기가 서로 다르다">${cards}</svg>`;
}

/** FB 수평면 힘 장면(라이트 · 파라미터형) · 물체+힘 화살표 워크호스.
 *  화살표 길이는 n 값에 단조 증가(최소 가시폭 보정 어핀 · 대소 관계는 항상 정확하나 정확한
 *  배수는 라벨 몫 · 배수 판정 과제는 AR 모눈이 전담) · tone: act 주황(작용힘)/resist 파랑(마찰·반응)/
 *  grav 남색(중력)/buoy 하늘(부력)/기본 중립 · motion: 속이 빈 초록 화살표(힘과 구분).
 *  같은 방향 수평 화살표 여럿이면 세로 스택(겹침 방지) · 수직 화살표는 물체 가장자리에서 시작,
 *  뷰박스 높이 동적 확장(잘림 방지). cand: 방향 후보 점선 화살표 ㉮~(방향이 정답인 문항은
 *  반드시 후보 제시형 · 단정 화살표 금지). aria는 각 화살표의 방향·라벨 값만 서술(그림 속 조건
 *  서술 = 동등 접근 · 판정 결과 낭독 금지). */
export function forceSceneFig(o: {
  obj?: "box" | "ball" | "bag" | "cart";
  arrows?: { dir: "l" | "r" | "u" | "d"; n?: number; label?: string; tone?: "act" | "resist" | "grav" | "buoy" }[];
  motion?: "l" | "r";
  ground?: "line" | "rough" | "ice" | "water" | "none";
  still?: boolean;
  cand?: { name: string; dir: "l" | "r" | "u" | "d" }[];
  cap?: string;
  /** true면 aria에 라벨 값을 낭독하지 않는다(값이 곧 정답인 평형 문항용 · 값은 문두가 제공). */
  quiet?: boolean;
}): string {
  const TONE: Record<string, string> = { act: "#E8710A", resist: "#4A7DDB", grav: "#3F5875", buoy: "#37A8DB" };
  const arrows = o.arrows ?? [];
  const maxN = Math.max(1, ...arrows.map((a) => a.n ?? 0));
  const len = (n?: number): number => (n ? 26 + (n / maxN) * 66 : 62);
  const gy = 118;
  let ground = "";
  if (o.ground === "rough") {
    let hatch = "";
    for (let x = 30; x <= 314; x += 16) hatch += `<line x1="${x}" y1="${gy}" x2="${x - 9}" y2="${gy + 11}" stroke="#C9B49A" stroke-width="2"/>`;
    ground = `<line x1="20" y1="${gy}" x2="324" y2="${gy}" stroke="#B08D5E" stroke-width="3"/>${hatch}`;
  } else if (o.ground === "ice") {
    ground = `<line x1="20" y1="${gy}" x2="324" y2="${gy}" stroke="#9CC8EE" stroke-width="3"/><path d="M40 ${gy + 8} h44 M130 ${gy + 8} h30 M240 ${gy + 8} h50" stroke="#C9E4F8" stroke-width="2.4" stroke-linecap="round"/>`;
  } else if (o.ground === "water") {
    ground = `<rect x="24" y="86" width="296" height="52" rx="6" fill="rgba(90,162,248,.20)"/><path d="M24 86 h296" stroke="#5AA2F8" stroke-width="2.2"/>`;
  } else if (o.ground !== "none") {
    ground = `<line x1="24" y1="${gy}" x2="320" y2="${gy}" stroke="#D5DBE3" stroke-width="2"/>`;
  }
  const cx = 172;
  let objSvg = "";
  const inWater = o.ground === "water";
  const oy = 74;
  let objTop = oy;
  let objBot = oy + 44;
  if (o.obj === "ball") {
    // 물 장면의 공은 수면(86) 아래 완전 잠김 배치(수면 위 노출 = "잠긴 공" 문두와 모순 · 검산 B 반영)
    const cy = inWater ? 112 : 96;
    objSvg = `<circle cx="${cx}" cy="${cy}" r="22" fill="#FFD98A" stroke="#C9A96A" stroke-width="2.2"/>`;
    objTop = cy - 22;
    objBot = cy + 22;
  } else if (o.obj === "bag") {
    objSvg = `<path d="M${cx - 26} ${gy} v-30 q0 -10 10 -10 h32 q10 0 10 10 v30 z" fill="#D9C6EC" stroke="#9A7FBE" stroke-width="2"/><path d="M${cx - 8} ${gy - 40} q8 -14 16 0" fill="none" stroke="#9A7FBE" stroke-width="2.4"/>`;
    objTop = gy - 52;
    objBot = gy;
  } else if (o.obj === "cart") {
    objSvg = `<rect x="${cx - 30}" y="${gy - 40}" width="60" height="26" rx="6" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/><circle cx="${cx - 16}" cy="${gy - 8}" r="7" fill="#8B95A1"/><circle cx="${cx + 16}" cy="${gy - 8}" r="7" fill="#8B95A1"/>`;
    objTop = gy - 40;
    objBot = gy;
  } else {
    objSvg = `<rect x="${cx - 30}" y="${oy}" width="60" height="44" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>`;
  }
  const midY = inWater ? 92 : 96;
  const offsetsFor = (count: number): number[] => (count === 1 ? [0] : count === 2 ? [-13, 13] : [-16, 0, 16]);
  const hOffsets = new Map<number, number>();
  for (const dir of ["l", "r"]) {
    const idxs = arrows.map((a, i) => (a.dir === dir ? i : -1)).filter((i) => i >= 0);
    const offs = offsetsFor(idxs.length);
    idxs.forEach((idx, k) => hOffsets.set(idx, offs[k] ?? 0));
  }
  let maxY = 152;
  const arrParts: string[] = [];
  arrows.forEach((a, i) => {
    const color = a.tone ? TONE[a.tone] : "#5E6B7E";
    const L = len(a.n);
    const [dx, dy] = DIRV[a.dir];
    let sx = cx + dx * 32;
    let sy = midY + (hOffsets.get(i) ?? 0);
    if (a.dir === "u") { sx = cx; sy = objTop - 4; }
    if (a.dir === "d") { sx = cx; sy = objBot + 4; }
    let ex = sx + dx * L;
    let ey = sy + dy * L;
    if (a.dir === "u" && ey < 16) ey = 16;
    if (a.dir === "d") maxY = Math.max(maxY, ey + 10);
    const lx = a.dir === "u" || a.dir === "d" ? sx + 16 : (sx + ex) / 2;
    const ly = a.dir === "u" || a.dir === "d" ? (sy + ey) / 2 : sy - 12;
    const label = a.label ? `<text x="${lx}" y="${ly}" text-anchor="${a.dir === "u" || a.dir === "d" ? "start" : "middle"}" font-size="12.5" font-weight="700" fill="${color}">${a.label}</text>` : "";
    arrParts.push(fArr(sx, sy, ex, ey, color, 4.6) + label);
  });
  const hasCand = (o.cand ?? []).length > 0;
  const motion = o.motion
    ? (() => {
        const [dx] = DIRV[o.motion!];
        const sx = cx + dx * (hasCand ? 44 : 6);
        const y = objTop - 22;
        return `${fArr(sx, y, sx + dx * 58, y, "#37C08E", 3.6)}<text x="${sx + dx * 29}" y="${y - 9}" text-anchor="middle" font-size="11" font-weight="700" fill="#2C9973">운동 방향</text>`;
      })()
    : "";
  const cand = (o.cand ?? [])
    .map((c) => {
      const [dx, dy] = DIRV[c.dir];
      let sx = cx + dx * 34;
      let sy = midY;
      if (c.dir === "u") { sx = cx; sy = objTop - 6; }
      if (c.dir === "d") { sx = cx; sy = objBot + 6; }
      const ex = sx + dx * 40;
      const ey = sy + dy * 40;
      if (c.dir === "d") maxY = Math.max(maxY, ey + 22);
      return `${fArr(sx, sy, ex, ey, "#8B95A1", 3.4, "5 5")}<text x="${ex + dx * 13}" y="${ey + dy * 16 + 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${c.name}</text>`;
    })
    .join("");
  const still = o.still ? `<text x="${cx}" y="50" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">정지 상태</text>` : "";
  const H = Math.ceil(o.cap ? maxY + 16 : maxY);
  const cap = o.cap ? `<text x="172" y="${H - 6}" text-anchor="middle" font-size="11.5" fill="#8B95A1">${o.cap}</text>` : "";
  const ariaArr = arrows.map((a) => `${DIRKO[a.dir]}으로${!o.quiet && a.label ? " " + a.label : ""} 화살표`).join(", ");
  const ariaCand = (o.cand ?? []).map((c) => `${c.name}는 ${DIRKO[c.dir]}`).join(", ");
  const aria = `물체 그림.${arrows.length ? " 힘 화살표: " + ariaArr + "." : ""}${o.motion ? ` ${DIRKO[o.motion]}으로 움직이는 중.` : ""}${o.cand?.length ? " 후보 화살표: " + ariaCand + "." : ""}${o.still ? " 정지 상태라고 적혀 있다." : ""}`;
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="${aria}">${ground}${objSvg}${arrParts.join("")}${motion}${cand}${still}${cap}</svg>`;
}

/** GD 천체 주위 중력 방향(라이트 · 파라미터형) · 물체 위치 deg(0=오른쪽·90=위)와 후보 화살표.
 *  후보 dir: in(중심 쪽)·out(바깥)·u/d/l/r(화면 절대 방향). 화살표는 짧게(행성 원 침범 방지),
 *  라벨은 화살표 중간의 수직 옆자리. aria는 화면 절대 방향으로만 서술(중심 쪽 여부는 판정
 *  과제라 낭독 금지). 레슨 (가)(나)+A~F 그림과 위치·기호 체계 분리. */
export function gravityDirsFig(o: {
  body?: "earth" | "moon";
  spots: { label: string; deg: number; cands: { name: string; dir: "in" | "out" | "u" | "d" | "l" | "r" }[] }[];
}): string {
  const cx = 172;
  const cy = 118;
  const R = 46;
  const moon = o.body === "moon";
  const planet = moon
    ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#F0F1F3" stroke="#9AA2AA" stroke-width="2.4"/>
       <circle cx="${cx - 14}" cy="${cy - 10}" r="8" fill="#DCDFE3"/><circle cx="${cx + 12}" cy="${cy + 14}" r="6" fill="#DCDFE3"/><circle cx="${cx + 18}" cy="${cy - 16}" r="4.5" fill="#DCDFE3"/>
       <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10.5" fill="#8B95A1">달</text>`
    : `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#EAF2FD" stroke="#8FB3E8" stroke-width="2.4"/>
       <ellipse cx="${cx - 16}" cy="${cy - 14}" rx="17" ry="11" fill="#CBE4D2"/><ellipse cx="${cx + 18}" cy="${cy + 14}" rx="12" ry="8" fill="#CBE4D2"/>
       <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10.5" fill="#8B95A1">지구</text>`;
  const ariaParts: string[] = [];
  const spots = o.spots
    .map((s) => {
      const rad = (s.deg * Math.PI) / 180;
      const px = cx + Math.cos(rad) * (R + 44);
      const py = cy - Math.sin(rad) * (R + 44);
      // 물체 라벨은 접선 방향 옆자리(위·중심 쪽 후보 화살표와 겹치지 않게 · 파일럿 눈검수 반영)
      const tx = px - Math.sin(rad) * 26;
      const ty = py - Math.cos(rad) * 26;
      const obj = `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9" fill="#D9C6EC" stroke="#9A7FBE" stroke-width="2"/>
        <text x="${tx.toFixed(1)}" y="${(ty + 4.5).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${s.label}</text>`;
      const cands = s.cands
        .map((c) => {
          let vx = 0;
          let vy = 0;
          if (c.dir === "in") { vx = cx - px; vy = cy - py; }
          else if (c.dir === "out") { vx = px - cx; vy = py - cy; }
          else { [vx, vy] = DIRV[c.dir]; }
          const m = Math.hypot(vx, vy) || 1;
          const ux = vx / m;
          const uy = vy / m;
          const sx = px + ux * 12;
          const sy = py + uy * 12;
          const ex = px + ux * 38;
          const ey = py + uy * 38;
          const mx = (sx + ex) / 2 - uy * 15;
          const my = (sy + ey) / 2 + ux * 15;
          const dko = Math.abs(ux) > Math.abs(uy) ? (ux > 0 ? "오른쪽" : "왼쪽") : uy > 0 ? "아래쪽" : "위쪽";
          ariaParts.push(`${c.name}는 ${dko}`);
          return `${fArr(sx, sy, ex, ey, "#5E6B7E", 3.6)}<text x="${mx.toFixed(1)}" y="${(my + 4.5).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${c.name}</text>`;
        })
        .join("");
      return obj + cands;
    })
    .join("");
  return `<svg viewBox="0 0 344 236" ${NS} role="img" aria-label="${moon ? "달" : "지구"} 주위 물체들과 후보 화살표. 화면 기준으로 ${ariaParts.join(", ")} 방향을 가리킨다">${planet}${spots}</svg>`;
}

/** SH 용수철 장면(라이트 · 파라미터형) · hang(천장 매달림)/pull(벽 수평 당김)/press(바닥 압축).
 *  dims: [원래 길이 라벨, 지금 길이 라벨] · 원래 길이는 왼쪽 구간 화살표+가로 점선, 지금 길이는
 *  오른쪽 구간 화살표(정보 이분 배치 · 값은 파라미터). cands: 탄성력 방향 후보 점선 화살표
 *  (방향 정답 문항은 후보 제시형만). pull 모드에서 forceLabel과 cands는 동시 사용 금지(겹침 ·
 *  당기는 힘 표기는 문두 서술로). */
export function springHangFig(o: {
  kind: "hang" | "pull" | "press";
  dims?: [string, string];
  weightLabel?: string;
  forceLabel?: string;
  cands?: { name: string; dir: "u" | "d" | "l" | "r" }[];
}): string {
  const coilV = (x: number, y1: number, y2: number, w = 13): string => {
    const n = 7;
    const step = (y2 - y1) / (n * 2);
    let d = `M${x} ${y1}`;
    for (let i = 0; i < n * 2; i++) d += ` L${x + (i % 2 ? -w : w)} ${(y1 + step * (i + 0.5)).toFixed(1)}`;
    d += ` L${x} ${y2}`;
    return `<path d="${d}" fill="none" stroke="#7E8B9C" stroke-width="3" stroke-linejoin="round"/>`;
  };
  const coilH = (y: number, x1: number, x2: number, w = 13): string => {
    const n = 7;
    const step = (x2 - x1) / (n * 2);
    let d = `M${x1} ${y}`;
    for (let i = 0; i < n * 2; i++) d += ` L${(x1 + step * (i + 0.5)).toFixed(1)} ${y + (i % 2 ? -w : w)}`;
    d += ` L${x2} ${y}`;
    return `<path d="${d}" fill="none" stroke="#7E8B9C" stroke-width="3" stroke-linejoin="round"/>`;
  };
  let body = "";
  let H = 200;
  const cands = (cx: number, cy: number): string =>
    (o.cands ?? [])
      .map((c) => {
        const [dx, dy] = DIRV[c.dir];
        const sx = cx + dx * 20;
        const sy = cy + dy * 20;
        return `${fArr(sx, sy, sx + dx * 40, sy + dy * 40, "#8B95A1", 3.4, "5 5")}<text x="${sx + dx * 56}" y="${sy + dy * 56 + 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${c.name}</text>`;
      })
      .join("");
  if (o.kind === "hang") {
    let hatch = "";
    for (let x = 96; x <= 250; x += 15) hatch += `<line x1="${x}" y1="22" x2="${x + 9}" y2="10" stroke="#B0B8C1" stroke-width="2"/>`;
    const dims = o.dims
      ? `<path d="M232 22 H286 M232 150 H286" stroke="#C4CAD2" stroke-width="1.3" stroke-dasharray="4 4"/>
         <path d="M272 26 V146" stroke="#8B95A1" stroke-width="1.6"/>
         <path d="M272 26 l-4 8 h8 z M272 146 l-4 -8 h8 z" fill="#8B95A1"/>
         <text x="280" y="90" font-size="11.5" font-weight="700" fill="#4E5968">${o.dims[1]}</text>
         <path d="M58 92 H160" stroke="#C4CAD2" stroke-width="1.3" stroke-dasharray="4 4"/>
         <path d="M104 26 V88" stroke="#B0B8C1" stroke-width="1.6"/>
         <path d="M104 26 l-4 8 h8 z M104 88 l-4 -8 h8 z" fill="#B0B8C1"/>
         <text x="96" y="60" text-anchor="end" font-size="11.5" font-weight="700" fill="#8B95A1">${o.dims[0]}</text>`
      : "";
    body = `<line x1="90" y1="22" x2="254" y2="22" stroke="#8B95A1" stroke-width="3"/>${hatch}
      ${coilV(172, 22, 150)}
      <rect x="150" y="150" width="44" height="34" rx="6" fill="#C9B49A" stroke="#8B7355" stroke-width="2"/>
      <text x="172" y="172" text-anchor="middle" font-size="11.5" font-weight="700" fill="#5B4632">${o.weightLabel ?? "추"}</text>
      ${dims}${cands(172, 167)}`;
    H = 208;
  } else if (o.kind === "pull") {
    let hatch = "";
    for (let y = 52; y <= 128; y += 15) hatch += `<line x1="40" y1="${y}" x2="28" y2="${y + 9}" stroke="#B0B8C1" stroke-width="2"/>`;
    const force = o.forceLabel
      ? `${fArr(268, 90, 322, 90, "#E8710A", 4.6)}<text x="295" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="#E8710A">${o.forceLabel}</text>`
      : "";
    body = `<line x1="40" y1="46" x2="40" y2="134" stroke="#8B95A1" stroke-width="3"/>${hatch}
      ${coilH(90, 40, 244)}
      <circle cx="256" cy="90" r="7" fill="none" stroke="#7E8B9C" stroke-width="3"/>
      ${force}${cands(266, 52)}`;
    H = 160;
  } else {
    const force = o.forceLabel
      ? `${fArr(172, 26, 172, 66, "#E8710A", 4.6)}<text x="190" y="44" font-size="12.5" font-weight="700" fill="#E8710A">${o.forceLabel}</text>`
      : "";
    body = `<rect x="140" y="70" width="64" height="10" rx="4" fill="#D5DBE3"/>
      ${coilV(172, 80, 140, 15)}
      <line x1="90" y1="142" x2="254" y2="142" stroke="#8B95A1" stroke-width="3"/>
      ${force}${cands(172, 108)}`;
    H = 168;
  }
  const aria = o.kind === "hang" ? "천장에 매단 용수철에 추가 걸려 있는 그림" : o.kind === "pull" ? "벽에 고정한 용수철을 옆으로 당기는 그림" : "바닥 위 용수철을 위에서 누르는 그림";
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="${aria}${o.dims ? `. 길이 표시 ${o.dims[0]}와 ${o.dims[1]}` : ""}${o.forceLabel ? `. 힘 라벨 ${o.forceLabel}` : ""}${o.cands?.length ? ". 방향 후보 화살표가 붙어 있다" : ""}">${body}</svg>`;
}

/** BS 용수철저울·추 잠김 장면(라이트 · 파라미터형) · buoyThreeFig 대체 확장.
 *  water: none(공기 중)/half(절반 잠김)/full(완전 잠김)/deep(완전 잠김 더 깊이).
 *  val: 저울 옆 콜아웃 라벨(표시창은 빈 패널 유지 · 값 제시는 콜아웃이 담당).
 *  quiet: aria에 콜아웃 값을 낭독하지 않는다(값이 곧 정답인 함정 문항용 · 값은 문두가 제공). */
export function buoyScaleFig(o: { scenes: { label: string; water: "none" | "half" | "full" | "deep"; val?: string }[]; quiet?: boolean }): string {
  const n = o.scenes.length;
  const W = 344 / n;
  const scene = (i: number, s: { label: string; water: string; val?: string }): string => {
    const cx = W / 2;
    const sink = s.water === "deep" ? 30 : s.water === "full" ? 16 : 0;
    const wy = 96 + sink;
    const waterTop = s.water === "none" ? null : s.water === "half" ? wy - 8 : s.water === "full" ? wy - 34 : wy - 48;
    const val = s.val
      ? `<g><rect x="${cx + 24}" y="20" width="58" height="24" rx="8" fill="#FFF0F3" stroke="#E8829B" stroke-width="1.6"/>
         <path d="M${cx + 24} 32 l-8 4 8 4z" fill="#E8829B"/>
         <text x="${cx + 53}" y="36" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C9365E">${s.val}</text></g>`
      : "";
    return `<g transform="translate(${i * W},0)">
      <rect x="${cx - 20}" y="14" width="40" height="24" rx="5" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="${cx - 12}" y="19" width="24" height="13" rx="3" fill="#2A3442"/>
      <path d="M${cx} 38 v${wy - 60}" stroke="#8B95A1" stroke-width="2"/>
      <rect x="${cx - 14}" y="${wy - 22}" width="28" height="26" rx="5" fill="#C9B49A" stroke="#8B7355" stroke-width="1.8"/>
      ${waterTop != null ? `<rect x="${cx - 38}" y="${waterTop}" width="76" height="${162 - waterTop}" rx="6" fill="rgba(90,162,248,.22)"/><path d="M${cx - 38} ${waterTop} h76" stroke="#5AA2F8" stroke-width="2"/>` : ""}
      <path d="M${cx - 38} 162 h76" stroke="#8B95A1" stroke-width="2.4"/>
      <path d="M${cx - 38} 58 v104 M${cx + 38} 58 v104" stroke="#8B95A1" stroke-width="2.4"/>
      ${val}
      <text x="${cx}" y="184" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${s.label}</text>
    </g>`;
  };
  const KO: Record<string, string> = { none: "물 밖", half: "절반 잠김", full: "완전히 잠김", deep: "완전히 잠긴 채 더 깊이" };
  const aria = o.scenes.map((s) => `${s.label} ${KO[s.water]}${s.val ? (o.quiet ? " 저울 옆에 값 표시" : " 저울 값 " + s.val) : ""}`).join(", ");
  return `<svg viewBox="0 0 344 196" ${NS} role="img" aria-label="용수철저울에 추를 매달아 물에 넣는 장면. ${aria}. 저울 표시창은 비어 있다">${o.scenes.map((s, i) => scene(i, s)).join("")}</svg>`;
}

/** FR 마찰 측정 장면(라이트 · 파라미터형) · 판+도막(쌓기)+수평 용수철저울(빈 표시창)+당김 화살표.
 *  surface: smooth(민면)/rough(빗금)/wet(물기) · val: 저울 옆 콜아웃(움직이기 시작하는 순간의 값).
 *  quiet: aria에 콜아웃 값을 낭독하지 않는다(값이 곧 정답인 평형 문항용 · 값은 문두가 제공). */
export function frictionRigFig(o: { boards: { surface: "smooth" | "rough" | "wet"; blocks: 1 | 2; val?: string; label?: string }[]; quiet?: boolean }): string {
  const row = (i: number, b: { surface: string; blocks: number; val?: string; label?: string }): string => {
    const y0 = i * 96;
    const by = y0 + 66;
    let surf = "";
    if (b.surface === "rough") {
      for (let x = 44; x <= 240; x += 14) surf += `<line x1="${x}" y1="${by + 4}" x2="${x - 8}" y2="${by + 13}" stroke="#B08D5E" stroke-width="1.8"/>`;
    } else if (b.surface === "wet") {
      surf = `<ellipse cx="90" cy="${by + 8}" rx="26" ry="4.5" fill="rgba(90,162,248,.35)"/><ellipse cx="180" cy="${by + 9}" rx="34" ry="5" fill="rgba(90,162,248,.30)"/>`;
    }
    const blocks =
      b.blocks === 2
        ? `<rect x="86" y="${by - 26}" width="44" height="26" rx="4" fill="#C9B49A" stroke="#8B7355" stroke-width="1.8"/><rect x="86" y="${by - 50}" width="44" height="26" rx="4" fill="#D8C7AC" stroke="#8B7355" stroke-width="1.8"/>`
        : `<rect x="86" y="${by - 26}" width="44" height="26" rx="4" fill="#C9B49A" stroke="#8B7355" stroke-width="1.8"/>`;
    const val = b.val
      ? `<g><rect x="238" y="${by - 58}" width="56" height="23" rx="8" fill="#FFF0F3" stroke="#E8829B" stroke-width="1.6"/>
         <path d="M258 ${by - 35} l4 8 4 -8z" fill="#E8829B"/>
         <text x="266" y="${by - 42}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#C9365E">${b.val}</text></g>`
      : "";
    return `<g>
      <rect x="40" y="${by}" width="208" height="7" rx="3" fill="#E3D5C0" stroke="#B08D5E" stroke-width="1.6"/>${surf}
      ${blocks}
      <line x1="130" y1="${by - 13}" x2="176" y2="${by - 13}" stroke="#8B95A1" stroke-width="2"/>
      <rect x="176" y="${by - 22}" width="54" height="18" rx="6" fill="#EDF1F6" stroke="#8B95A1" stroke-width="1.8"/>
      <rect x="184" y="${by - 18}" width="26" height="10" rx="2.5" fill="#2A3442"/>
      ${fArr(232, by - 13, 296, by - 13, "#E8710A", 4.4)}
      ${val}
      ${b.label ? `<text x="24" y="${by - 4}" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${b.label}</text>` : ""}
    </g>`;
  };
  const H = o.boards.length * 96 + 6;
  const KO: Record<string, string> = { smooth: "매끈한 면", rough: "거친 면", wet: "물기 있는 면" };
  const aria = o.boards.map((b) => `${b.label ?? ""} ${KO[b.surface]} 위 도막 ${b.blocks}개${b.val ? (o.quiet ? ", 저울 옆에 값 표시" : ", 저울 옆 값 " + b.val) : ""}`).join(". ");
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="나무 도막을 용수철저울로 당기는 마찰 측정 장면. ${aria}. 저울 표시창은 비어 있다">${o.boards.map((b, i) => row(i, b)).join("")}</svg>`;
}

/** 떨어져 있는 두 상자 A·B에 힘이 하나씩(한 물체 조건 판정 전용 · 화살표 길이 동일 = 크기 동일). */
export function twoBoxesFig(): string {
  const arr = (x1: number, x2: number, y: number): string => {
    const dir = x2 > x1 ? 1 : -1;
    return `<line x1="${x1}" y1="${y}" x2="${x2 - dir * 11}" y2="${y}" stroke="#5E6B7E" stroke-width="4.6" stroke-linecap="round"/>
      <path d="M${x2} ${y} l${-dir * 12} -7 v14 z" fill="#5E6B7E"/>`;
  };
  return `<svg viewBox="0 0 344 140" ${NS} role="img" aria-label="서로 떨어져 있는 상자 A와 B. A에는 오른쪽으로 5 N 화살표 하나, B에는 왼쪽으로 5 N 화살표 하나가 그려져 있다">
    <line x1="16" y1="112" x2="328" y2="112" stroke="#D5DBE3" stroke-width="2"/>
    <rect x="44" y="68" width="52" height="44" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
    <text x="70" y="94" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">A</text>
    ${arr(98, 158, 90)}
    <text x="128" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">5 N</text>
    <rect x="248" y="68" width="52" height="44" rx="7" fill="#EDF1F6" stroke="#B0B8C1" stroke-width="2"/>
    <text x="274" y="94" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">B</text>
    ${arr(246, 186, 90)}
    <text x="216" y="74" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">5 N</text>
  </svg>`;
}

/** TJ 같은 시간 간격 위치 기록(라이트 · 파라미터형) · 공 위치 배열이 전부(궤적 경향은 좌표가 만든다).
 *  공 사이 파란 화살표 길이 = 실제 간격(코드 보장 · 속력 변화가 화살표 길이로 읽힘).
 *  aria는 "같은 시간 간격 기록"까지만(간격 경향·방향 변화 낭독 금지 = 판독 과제). */
export function trajStroboFig(o: { pts: [number, number][]; cap?: string }): string {
  const r = 9;
  const balls = o.pts
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i === 0 ? "#F0A422" : "#FFE9C4"}" stroke="#D08A18" stroke-width="1.8"/>`)
    .join("");
  let arrows = "";
  for (let i = 0; i < o.pts.length - 1; i++) {
    const [x1, y1] = o.pts[i];
    const [x2, y2] = o.pts[i + 1];
    const d = Math.hypot(x2 - x1, y2 - y1);
    // 간격이 공 지름 수준이면 화살표가 뭉개진다(거의 멈춤) · 생략이 물리적으로도 자연
    if (d < 2 * (r + 3) + 15) continue;
    const ux = (x2 - x1) / d;
    const uy = (y2 - y1) / d;
    arrows += fArr(x1 + ux * (r + 3), y1 + uy * (r + 3), x2 - ux * (r + 3), y2 - uy * (r + 3), "#4A7DDB", 3.4);
  }
  const cap = o.cap ? `<text x="172" y="152" text-anchor="middle" font-size="11.5" fill="#8B95A1">${o.cap}</text>` : "";
  return `<svg viewBox="0 0 344 158" ${NS} role="img" aria-label="같은 시간 간격으로 기록한 공의 위치들. 이웃한 위치 사이에 화살표가 그려져 있다">${arrows}${balls}${cap}</svg>`;
}
// ── u5 v2 신작 끝 ──

// ── g2u3 v2 신작(파일럿 승격 · 재출제 6호) ──
// 거울 단면 marc() 몸통 문법이 정본(설계표 §8-2): 반사면 호 + 평평한 등 + 회색 채움 + 등 빗금.
// LRP 경로 후보는 공간 정렬 고정(§8-1) · LWG/LW4는 v1 개조판(v1 함수와 공존 · 시험 전용).


/** 광선 위 진행 방향 화살촉(V자) · examFigures lray와 동일 문법(파일럿 로컬판). */
export function ar(x1: number, y1: number, x2: number, y2: number, t: number, color: string, len = 9): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const n = Math.hypot(dx, dy) || 1;
  const ux = dx / n;
  const uy = dy / n;
  const ax = x1 + dx * t;
  const ay = y1 + dy * t;
  const wing = (sign: number): [number, number] => {
    const cos = Math.cos(0.45);
    const sin = Math.sin(0.45) * sign;
    const wx = -ux * cos + uy * sin;
    const wy = -ux * sin - uy * cos;
    return [ax + wx * len, ay + wy * len];
  };
  const [w1x, w1y] = wing(1);
  const [w2x, w2y] = wing(-1);
  return `<path d="M${w1x.toFixed(1)} ${w1y.toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}L${w2x.toFixed(1)} ${w2y.toFixed(1)}" stroke="${color}" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
}

/** 거울 단면 = 속이 찬 재질 몸통(사용자 파일럿 검수 반영 재작도).
 *  가는 호+빗금만으로는 볼록/오목이 안 읽힌다(호가 "부푼 곡선"으로만 보임 · 검수 지적 3건의 공통
 *  뿌리) → 반사면 호 + 평평한 등(오른쪽) + 회색 채움의 닫힌 몸통으로 그린다.
 *  볼록(벨리 왼쪽 c < p0x) = 왼쪽으로 불룩한 D자 몸통 · 오목(벨리 오른쪽 c > p0x) = 왼쪽이 파인
 *  초승달 몸통. 반사면은 항상 왼쪽 · 빗금은 등(오른쪽 평면)에. */
export function marc(p0x: number, c: number, half: number, w = 3.4): string {
  const apex = (p0x + 2 * c + p0x) / 4;
  const backX = Math.max(p0x, apex) + 10;
  const ticks = Array.from({ length: 6 }, (_, i) => {
    const y = -half + 7 + ((half * 2 - 14) * i) / 5;
    return `<line x1="${(backX - 1).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(backX + 8).toFixed(1)}" y2="${(y - 8).toFixed(1)}" stroke="#B0B8C1" stroke-width="1.6"/>`;
  }).join("");
  return `<path d="M${p0x} ${-half} Q${c} 0 ${p0x} ${half} L${backX} ${half} L${backX} ${-half} Z" fill="#E4E9F0" stroke="#8B95A1" stroke-width="1.2"/>
    <path d="M${p0x} ${-half} Q${c} 0 ${p0x} ${half}" fill="none" stroke="#5E6B7E" stroke-width="${w}" stroke-linecap="round"/>${ticks}`;
}

/** 기호 배지(㉠㉡·①~⑤ 공용). */
export function badge(x: number, y: number, t: string, r = 11): string {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF" stroke="#3182F6" stroke-width="1.6"/>
    <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">${t}</text>`;
}

/** xLAE 반사 각도 그림(개조판) · v1 lightAngleExamFig + spread(두 광선 사이 각 호) 옵션.
 *  mark: 표시 기준(거울면/법선/사이각) · deg: 그림에 인쇄되는 조건 각(aria 서술 허용 · 조건 값) ·
 *  spread "ask" = 사이각 호를 ?로, "show" = 사이각 값을 인쇄하고 입사각을 ?로(역산형).
 *  검산: 광선 고도각 = 거울면 기준 각(mirror는 deg 그대로 · normal은 90 minus deg ·
 *  spread-show는 90 minus 사이각/2). */
export function xLAE(o: { mark: "mirror" | "normal"; deg: number; spread?: "ask" | "show" }): string {
  const P = { x: 172, y: 150 };
  const elevDeg = o.spread === "show" ? 90 - o.deg / 2 : o.mark === "mirror" ? o.deg : 90 - o.deg;
  const rad = (elevDeg * Math.PI) / 180;
  const L = 122;
  const sx = P.x - Math.cos(rad) * L;
  const sy = P.y - Math.sin(rad) * L;
  const rx = P.x + Math.cos(rad) * L;
  const ry = P.y - Math.sin(rad) * L;
  let arcs = "";
  if (o.spread === "show") {
    arcs += `<path d="M${(P.x - Math.cos(rad) * 62).toFixed(1)} ${(P.y - Math.sin(rad) * 62).toFixed(1)} A62 62 0 0 1 ${(P.x + Math.cos(rad) * 62).toFixed(1)} ${(P.y - Math.sin(rad) * 62).toFixed(1)}" stroke="#E8961E" stroke-width="2.4" fill="none"/>
      <text x="${P.x}" y="${P.y - 70}" text-anchor="middle" font-size="13" font-weight="800" fill="#B26A00">${o.deg}°</text>
      <path d="M${P.x} ${P.y - 40} A40 40 0 0 0 ${(P.x - Math.cos(rad) * 40).toFixed(1)} ${(P.y - Math.sin(rad) * 40).toFixed(1)}" stroke="#37B6D8" stroke-width="2" fill="none"/>
      <text x="${P.x - 52}" y="${P.y - 44}" font-size="13" font-weight="800" fill="#1187A6">?</text>`;
  } else {
    arcs +=
      o.mark === "mirror"
        ? `<path d="M${P.x - 52} ${P.y} A52 52 0 0 1 ${(P.x - Math.cos(rad) * 52).toFixed(1)} ${(P.y - Math.sin(rad) * 52).toFixed(1)}" stroke="#E8961E" stroke-width="2.4" fill="none"/>
           <text x="${P.x - 88}" y="136" font-size="13" font-weight="800" fill="#B26A00">${o.deg}°</text>`
        : `<path d="M${P.x} ${P.y - 54} A54 54 0 0 0 ${(P.x - Math.cos(rad) * 54).toFixed(1)} ${(P.y - Math.sin(rad) * 54).toFixed(1)}" stroke="#E8961E" stroke-width="2.4" fill="none"/>
           <text x="${P.x - 40}" y="${P.y - 62}" font-size="13" font-weight="800" fill="#B26A00">${o.deg}°</text>`;
    if (o.spread === "ask")
      arcs += `<path d="M${(P.x - Math.cos(rad) * 66).toFixed(1)} ${(P.y - Math.sin(rad) * 66).toFixed(1)} A66 66 0 0 1 ${(P.x + Math.cos(rad) * 66).toFixed(1)} ${(P.y - Math.sin(rad) * 66).toFixed(1)}" stroke="#37B6D8" stroke-width="2" stroke-dasharray="5 4" fill="none"/>
      <text x="${P.x}" y="${P.y - 74}" text-anchor="middle" font-size="13" font-weight="800" fill="#1187A6">?</text>`;
  }
  const cond =
    o.spread === "show"
      ? `입사 광선과 반사 광선 사이의 각이 ${o.deg}도로 표시되어 있고 입사각 자리에 물음표가 있어요`
      : `들어오는 빛이 ${o.mark === "mirror" ? "거울 면" : "법선"}과 이루는 각이 ${o.deg}도로 표시되어 있어요` +
        (o.spread === "ask" ? ". 입사 광선과 반사 광선 사이의 각 자리에 물음표가 있어요" : "");
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="수평으로 놓인 거울에 빛이 비스듬히 들어와 반사되는 그림. ${cond}">
    <line x1="30" y1="150" x2="314" y2="150" stroke="#5E6B7E" stroke-width="3.4"/>
    ${Array.from({ length: 14 }, (_, i) => `<line x1="${44 + i * 20}" y1="150" x2="${36 + i * 20}" y2="162" stroke="#B0B8C1" stroke-width="1.6"/>`).join("")}
    <line x1="${P.x}" y1="150" x2="${P.x}" y2="30" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="6 6"/>
    <text x="${P.x + 8}" y="26" font-size="11.5" fill="#8B95A1">법선</text>
    ${arcs}
    <path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    <path d="M${P.x} ${P.y}L${rx.toFixed(1)} ${ry.toFixed(1)}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
    ${ar(sx, sy, P.x, P.y, 0.55, "#4E5968")}
    ${ar(P.x, P.y, rx, ry, 0.55, "#4E5968")}
    <text x="${(sx - 6).toFixed(1)}" y="${(sy - 8).toFixed(1)}" font-size="11.5" fill="#4E5968">빛</text>
    <text x="292" y="176" font-size="11.5" fill="#8B95A1">거울</text>
  </svg>`;
}

/** LSR 표면 광선 다발(신작 · 파라미터형) · 비상01 돋보기 계보의 평활도 비교판.
 *  smooth: 매끈한 면 + 나란한 입사 3줄 + 나란한 반사 3줄(전부 45° 미러링).
 *  rough: 울퉁불퉁한 면 + 나란한 입사 3줄 + 제각각 반사 3줄(반사점마다 국소 법선 점선 ·
 *         낱낱은 그 법선 기준 미러링 = 법칙 성립을 기하로 보장).
 *  dir: 매끈한 유리판 + 광원 + 반사 다발이 한 방향 + 사람 A(반사 방향)·B(다른 방향).
 *  aria는 표면 상태와 배치만 서술(반사 방향의 정오 판정 낭독 금지). */
export function xLSR(kind: "smooth" | "rough" | "dir"): string {
  const inc = 42;
  const rad = (inc * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  if (kind === "dir") {
    return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="매끈한 유리판에 프로젝터 빛이 비스듬히 닿아 반사되고, 서로 다른 자리에 학생 A와 B가 서 있는 그림">
      <line x1="30" y1="160" x2="314" y2="160" stroke="#5E6B7E" stroke-width="3.6"/>
      <text x="300" y="182" font-size="11" fill="#8B95A1">유리판</text>
      <g transform="translate(52,54)"><rect x="-26" y="-16" width="44" height="30" rx="6" fill="#5E6B7E"/><circle cx="24" cy="-1" r="7" fill="#37B6D8"/></g>
      <text x="30" y="24" font-size="11" fill="#8B95A1">프로젝터</text>
      ${[0, 1].map((i) => {
        const px = 128 + i * 26;
        const sx = 74 + i * 26;
        return `<path d="M${sx} 58L${px} 160" stroke="#F0A422" stroke-width="2.6" stroke-linecap="round"/>${ar(sx, 58, px, 160, 0.55, "#F0A422")}
          <path d="M${px} 160L${px + 54} 58" stroke="#F0A422" stroke-width="2.6" stroke-linecap="round"/>${ar(px, 160, px + 54, 58, 0.6, "#F0A422")}`;
      }).join("")}
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="222" cy="46" r="9"/><path d="M222 55v26M222 64l-11 12M222 64l11 12M222 81l-9 16M222 81l9 16"/>
        <circle cx="296" cy="86" r="9"/><path d="M296 95v26M296 104l-11 12M296 104l11 12M296 121l-9 16M296 121l9 16"/>
      </g>
      <text x="222" y="30" text-anchor="middle" font-size="12.5" font-weight="800" fill="#1B64DA">A</text>
      <text x="296" y="70" text-anchor="middle" font-size="12.5" font-weight="800" fill="#1B64DA">B</text>
    </svg>`;
  }
  const roughSurf = `<path d="M30 160 l24 -7 l22 9 l24 -10 l23 8 l25 -8 l24 9 l23 -9 l24 8 l24 -7 l24 8 l23 -6" stroke="#5E6B7E" stroke-width="3.2" fill="none" stroke-linejoin="round"/>`;
  const smoothSurf = `<line x1="30" y1="160" x2="314" y2="160" stroke="#5E6B7E" stroke-width="3.6"/>`;
  // rough 반사점 3곳: 국소 경사각(도) · 반사 방향은 국소 법선 기준 미러링으로 계산한다.
  const tilts = [-16, 9, -27];
  const hits = [96, 172, 248];
  const beams = hits
    .map((hx, i) => {
      const hy = kind === "rough" ? 156 : 160;
      const sx = hx - dx * 110;
      const sy = hy - dy * 110;
      let out = "";
      if (kind === "smooth") {
        const ex = hx + dx * 110;
        const ey = hy - dy * 110;
        out = `<path d="M${hx} ${hy}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#F0A422" stroke-width="2.6" stroke-linecap="round"/>${ar(hx, hy, ex, ey, 0.6, "#F0A422")}`;
      } else {
        const t = (tilts[i] * Math.PI) / 180;
        const nx = Math.sin(t);
        const ny = -Math.cos(t);
        const ix = dx;
        const iy = dy;
        const dot = ix * nx + iy * ny;
        const ox = ix - 2 * dot * nx;
        const oy = iy - 2 * dot * ny;
        const ex = hx + ox * 105;
        const ey = hy + oy * 105;
        out = `<line x1="${(hx + nx * 34).toFixed(1)}" y1="${(hy + ny * 34).toFixed(1)}" x2="${(hx - nx * 8).toFixed(1)}" y2="${(hy - ny * 8).toFixed(1)}" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="4 4"/>
          <path d="M${hx} ${hy}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#F0A422" stroke-width="2.6" stroke-linecap="round"/>${ar(hx, hy, ex, ey, 0.6, "#F0A422")}`;
      }
      return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${hx} ${hy}" stroke="#4E5968" stroke-width="2.6" stroke-linecap="round"/>${ar(sx, sy, hx, hy, 0.55, "#4E5968")}${out}`;
    })
    .join("");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="${kind === "smooth" ? "매끈한 표면에 나란한 빛 세 줄기가 들어와 반사되는 그림" : "울퉁불퉁한 표면에 나란한 빛 세 줄기가 들어와 반사되는 그림. 반사점마다 표면에 수직인 점선이 함께 그려져 있어요"}">
    ${kind === "smooth" ? smoothSurf : roughSurf}
    ${beams}
    <text x="298" y="186" font-size="11" fill="#8B95A1">${kind === "smooth" ? "매끈한 면" : "거친 면"}</text>
  </svg>`;
}

/** LRP 굴절 경로 그림(신작 · 파라미터형 워크호스) · 스넬 n=1.33 좌표 검산.
 *  dir "down"=공기에서 물로 · "up"=물에서 공기로. inc=입사각(도).
 *  mode "paths": 경계 통과 후 경로 후보 ①~⑤(전부 같은 색 점선) · 공간 정렬 고정 구조(§8-1).
 *  mode "obs": 물속 물체(bottom=바닥)에서 나온 빛이 굴절해 눈에 오고, 연장선 위 후보 ㉠㉡㉢
 *    (noCands면 후보 없이 연장선만 · e226 이유 고르기용).
 *  mode "vert": 수직 입사 후보(ans 자리에 직진) · "arc": 입사·굴절각 (가)(나) 호 · "both": 굴절+반사
 *    동시 작도 · "glass": 유리판 통과 · "two": 입사각 두 벌 비교.
 *  검산: down r=asin(sin i ÷ 1.33) · up r=asin(1.33 × sin i) · 반사 후보는 입사 대칭. */
export function xLRP(o: {
  dir: "down" | "up";
  inc: number;
  mode: "paths" | "obs" | "vert" | "arc" | "both" | "glass" | "two";
  ans?: number;
  scene?: "bottom" | "object";
  noCands?: boolean;
}): string {
  const P = { x: 172, y: 100 };
  const n = 1.33;
  const incR = (o.inc * Math.PI) / 180;
  const refR = o.dir === "down" ? Math.asin(Math.sin(incR) / n) : Math.asin(Math.min(0.999, Math.sin(incR) * n));
  const waterBox = (h: number): string => `<rect x="20" y="100" width="304" height="${h}" rx="8" fill="#EAF3FE"/>
    <line x1="20" y1="100" x2="324" y2="100" stroke="#7FB0E0" stroke-width="2.4"/>
    <text x="30" y="92" font-size="11.5" fill="#8B95A1">공기</text>
    <text x="30" y="120" font-size="11.5" fill="#5E86B4">물</text>
    <line x1="${P.x}" y1="16" x2="${P.x}" y2="${94 + h}" stroke="#B0B8C1" stroke-width="1.6" stroke-dasharray="5 6"/>`;
  const water = waterBox(96);
  if (o.mode === "vert") {
    // 수직 입사 · 후보 = 좌우 꺾임 함정 사이에 직진(ans 자리). 검산: 입사각 0 = 굴절각 0.
    const cand = [-30, -16, -7, 18];
    const ans = o.ans ?? 4;
    let oi = 0;
    const ordered: number[] = [];
    for (let k = 1; k <= 5; k++) ordered.push(k === ans ? 0 : cand[oi++]);
    return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="공기에서 물 표면에 수직으로 내려온 빛이 경계면에 도착한 그림. 물속에서 나아갈 경로 후보 다섯 가지가 번호로 표시되어 있어요">
      ${water}
      <path d="M${P.x} 18L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
      ${ar(P.x, 18, P.x, P.y, 0.55, "#4E5968")}
      ${ordered
        .map((deg, i) => {
          const a = (Math.abs(deg) * Math.PI) / 180;
          const sgn = deg < 0 ? -1 : 1;
          const ex = P.x + sgn * Math.sin(a) * 84;
          const ey = P.y + Math.cos(a) * 84;
          return `<path d="M${P.x} ${P.y}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#8B95A1" stroke-width="2" stroke-dasharray="5 5"/>${badge(ex + sgn * 8, ey + 12, ["①", "②", "③", "④", "⑤"][i])}`;
        })
        .join("")}
    </svg>`;
  }
  if (o.mode === "arc" || o.mode === "both") {
    // 완성 작도(공기→물): 입사·굴절(+both는 반사까지) 실선 · 각 호는 (가)(나) 라벨(수치 미인쇄).
    const sx = P.x - Math.sin(incR) * 96;
    const sy = P.y - Math.cos(incR) * 92;
    const gx = P.x + Math.sin(refR) * 88;
    const gy = P.y + Math.cos(refR) * 88;
    const rx2 = P.x + Math.sin(incR) * 96;
    const ry2 = P.y - Math.cos(incR) * 92;
    const arc = (deg: number, up: boolean, left: boolean, r: number, lab: string): string => {
      const a = (deg * Math.PI) / 180;
      const ex = P.x + (left ? -1 : 1) * Math.sin(a) * r;
      const ey = P.y + (up ? -1 : 1) * Math.cos(a) * r;
      const y0 = up ? P.y - r : P.y + r;
      const sweep = up === left ? 0 : 1;
      return `<path d="M${P.x} ${y0} A${r} ${r} 0 0 ${sweep} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#E8961E" stroke-width="2.2" fill="none"/>
        <text x="${(P.x + (left ? -1 : 1) * (Math.sin(a / 2) * (r + 16))).toFixed(1)}" y="${(P.y + (up ? -1 : 1) * (Math.cos(a / 2) * (r + 14))).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="#B26A00">${lab}</text>`;
    };
    return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="공기에서 비스듬히 내려온 빛이 물 표면에서 ${o.mode === "both" ? "일부는 반사되고 일부는 굴절되어 물속으로 들어가는" : "굴절되어 물속으로 들어가는"} 작도 그림. 입사각 자리에 (가), 굴절각 자리에 (나) 표시가 있어요">
      ${water}
      <path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
      ${ar(sx, sy, P.x, P.y, 0.55, "#4E5968")}
      <path d="M${P.x} ${P.y}L${gx.toFixed(1)} ${gy.toFixed(1)}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
      ${ar(P.x, P.y, gx, gy, 0.6, "#4E5968")}
      ${o.mode === "both" ? `<path d="M${P.x} ${P.y}L${rx2.toFixed(1)} ${ry2.toFixed(1)}" stroke="#4E5968" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>${ar(P.x, P.y, rx2, ry2, 0.6, "#4E5968")}` : ""}
      ${arc(o.inc, true, true, 46, "(가)")}
      ${arc((refR * 180) / Math.PI, false, false, 46, "(나)")}
    </svg>`;
  }
  if (o.mode === "glass") {
    // 유리판 통과 · 위 경계 굴절각 r(법선 쪽) · 아래 경계에서 원래 각으로 복귀(평행 이동).
    const gT = 78;
    const gB = 138;
    const rr = Math.asin(Math.sin(incR) / 1.5);
    const e1 = { x: 150, y: gT };
    const e2 = { x: 150 + Math.tan(rr) * (gB - gT), y: gB };
    const s = { x: e1.x - Math.sin(incR) * 78, y: gT - Math.cos(incR) * 74 };
    const out = { x: e2.x + Math.sin(incR) * 80, y: gB + Math.cos(incR) * 76 };
    return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="공기 속에 놓인 유리판을 빛이 비스듬히 통과하는 작도 그림. 유리판에 들어갈 때와 나올 때 두 경계면에서 각각 꺾이는 경로가 그려져 있어요">
      <rect x="24" y="${gT}" width="296" height="${gB - gT}" rx="6" fill="#E4F0FA" stroke="#9CBEDD" stroke-width="1.8"/>
      <text x="34" y="${gT - 8}" font-size="11.5" fill="#8B95A1">공기</text>
      <text x="34" y="${(gT + gB) / 2 + 4}" font-size="11.5" fill="#5E86B4">유리</text>
      <text x="34" y="${gB + 18}" font-size="11.5" fill="#8B95A1">공기</text>
      <line x1="${e1.x}" y1="${gT - 44}" x2="${e1.x}" y2="${gT + 34}" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 5"/>
      <line x1="${e2.x.toFixed(1)}" y1="${gB - 34}" x2="${e2.x.toFixed(1)}" y2="${gB + 44}" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 5"/>
      <path d="M${s.x.toFixed(1)} ${s.y.toFixed(1)}L${e1.x} ${e1.y}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
      ${ar(s.x, s.y, e1.x, e1.y, 0.55, "#4E5968")}
      <path d="M${e1.x} ${e1.y}L${e2.x.toFixed(1)} ${e2.y.toFixed(1)}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
      ${ar(e1.x, e1.y, e2.x, e2.y, 0.6, "#4E5968")}
      <path d="M${e2.x.toFixed(1)} ${e2.y.toFixed(1)}L${out.x.toFixed(1)} ${out.y.toFixed(1)}" stroke="#4E5968" stroke-width="3" stroke-linecap="round"/>
      ${ar(e2.x, e2.y, out.x, out.y, 0.6, "#4E5968")}
    </svg>`;
  }
  if (o.mode === "two") {
    // 입사각 2벌(inc · inc+18) 완성 작도 · 각 벌의 굴절각은 스넬 정확 계산(관찰형).
    const mk = (i: number, color: string, lab: string): string => {
      const iR = (i * Math.PI) / 180;
      const rR = Math.asin(Math.sin(iR) / n);
      const sx = P.x - Math.sin(iR) * 92;
      const sy = P.y - Math.cos(iR) * 88;
      const gx = P.x + Math.sin(rR) * 86;
      const gy = P.y + Math.cos(rR) * 84;
      return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${P.x} ${P.y}" stroke="${color}" stroke-width="2.8" stroke-linecap="round"/>
        ${ar(sx, sy, P.x, P.y, 0.55, color)}
        <path d="M${P.x} ${P.y}L${gx.toFixed(1)} ${gy.toFixed(1)}" stroke="${color}" stroke-width="2.8" stroke-linecap="round"/>
        ${ar(P.x, P.y, gx, gy, 0.6, color)}
        <text x="${(sx - 4).toFixed(1)}" y="${(sy - 8).toFixed(1)}" font-size="11.5" font-weight="800" fill="${color}">${lab}</text>`;
    };
    return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="공기에서 물로 빛을 서로 다른 두 각도로 비추어, 광선 두 벌이 각각 굴절되는 모습을 한 그림에 겹쳐 그린 작도예요. 광선 A보다 광선 B가 법선에서 더 기울어 들어와요">
      ${water}
      ${mk(o.inc, "#5E6B7E", "A")}
      ${mk(Math.min(78, o.inc + 18), "#C838A6", "B")}
    </svg>`;
  }
  if (o.mode === "paths") {
    // 입사 광선: down은 공기(위)에서 · up은 물(아래)에서 경계점 P로.
    const sIn = o.dir === "down" ? -1 : 1;
    const sx = P.x - Math.sin(incR) * 96;
    const sy = P.y + sIn * Math.cos(incR) * 92;
    // 후보는 공간 정렬 고정 구조(번호가 법선→수면 순서를 따라야 오독이 없다 · §8 확정):
    // down = [과다·과다·정답 r0·직진 inc·반사] → 정답 ③ / up = [직진 inc·정답 r0·과다·과다·반사] → 정답 ②.
    const r0 = (refR * 180) / Math.PI;
    const ordered =
      o.dir === "down"
        ? [Math.max(8, r0 - 20), Math.max(16, r0 - 10), r0, o.inc, -o.inc]
        : [o.inc, r0, Math.min(70, r0 + 13), Math.min(82, r0 + 26), -o.inc];
    const sOut = o.dir === "down" ? 1 : -1;
    const paths = ordered
      .map((deg, i) => {
        const refl = deg < 0;
        const a = (Math.abs(deg) * Math.PI) / 180;
        const len = 88;
        const ex = P.x + Math.sin(a) * len;
        const ey = refl ? P.y + sIn * Math.cos(a) * len : P.y + sOut * Math.cos(a) * len;
        // 배지: 광선 끝을 광선 방향으로 연장한 자리 · 이웃과 겹치지 않게 반경을 번갈아 늘인다.
        const bd = 16 + (i % 2) * 15;
        const lx = P.x + Math.sin(a) * (len + bd);
        const ly = refl ? P.y + sIn * Math.cos(a) * (len + bd) : P.y + sOut * Math.cos(a) * (len + bd);
        return `<path d="M${P.x} ${P.y}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#8B95A1" stroke-width="2" stroke-dasharray="5 5"/>
          ${badge(lx, ly, ["①", "②", "③", "④", "⑤"][i])}`;
      })
      .join("");
    return `<svg viewBox="0 ${o.dir === "up" ? -20 : 0} 344 ${o.dir === "up" ? 252 : 232}" ${NS} fill="none" role="img" aria-label="${o.dir === "down" ? "공기에서 비스듬히 내려온 빛이 물 표면에 도착한 그림" : "물속에서 비스듬히 올라온 빛이 물과 공기의 경계면에 도착한 그림"}. 경계면을 지난 뒤 빛이 나아갈 경로 후보 다섯 가지가 번호로 표시되어 있어요">
      ${waterBox(126)}
      <path d="M${sx.toFixed(1)} ${sy.toFixed(1)}L${P.x} ${P.y}" stroke="#4E5968" stroke-width="3.2" stroke-linecap="round"/>
      ${ar(sx, sy, P.x, P.y, 0.55, "#4E5968")}
      ${paths}
    </svg>`;
  }
  // obs 모드: 물속 물체 O에서 나온 빛이 경계 Q에서 굴절해 눈 E로 · 눈의 연장선(점선) 위 ㉠㉡㉢.
  const objX = o.scene === "bottom" ? 150 : 118;
  const objY = o.scene === "bottom" ? 188 : 166;
  const upR = Math.asin(Math.min(0.999, Math.sin(incR) * n));
  const Q = { x: objX + Math.tan(incR) * (objY - 100) * 0.62, y: 100 };
  const E = { x: Q.x + Math.sin(upR) * 74, y: 100 - Math.cos(upR) * 74 };
  // 연장선: 눈에서 Q를 지나 물속으로 곧게 늘인 선 · 그 위 후보 3곳(떠 보이는 위치가 정답 자리).
  const ux = (Q.x - E.x) / Math.hypot(Q.x - E.x, Q.y - E.y);
  const uy = (Q.y - E.y) / Math.hypot(Q.x - E.x, Q.y - E.y);
  // 후보 3곳: ㉠(수면 바로 아래 · 과도) · ㉡(실제 물체보다 조금 얕음 = 정답 자리) · ㉢(실제보다 깊음).
  const cands = (o.scene === "bottom" ? [30, 56, 82] : [36, 70, 110]).map((d, i) => {
    const cx = Q.x + ux * d;
    const cy = Q.y + uy * d;
    return { cx, cy, t: ["㉠", "㉡", "㉢"][i] };
  });
  const objArt =
    o.scene === "bottom"
      ? `<path d="M${objX - 16} ${objY} h32" stroke="#8A6842" stroke-width="6" stroke-linecap="round"/><text x="${objX + 24}" y="${objY + 4}" font-size="11" fill="#5E86B4">바닥 돌</text>`
      : `<circle cx="${objX}" cy="${objY}" r="9" fill="#F5C878" stroke="#C08A3E" stroke-width="1.8"/><text x="${objX}" y="${objY + 24}" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">물체</text>`;
  return `<svg viewBox="0 0 344 212" ${NS} fill="none" role="img" aria-label="물속 ${o.scene === "bottom" ? "바닥" : "물체"}에서 나온 빛이 수면에서 꺾여 물 밖 눈에 들어오는 그림. ${o.noCands ? "눈에 들어온 빛을 물속으로 곧게 늘인 점선이 함께 그려져 있어요" : "눈에 들어온 빛을 곧게 늘인 점선 위에 기호 ㉠, ㉡, ㉢ 세 위치가 표시되어 있어요"}">
    ${water}
    ${objArt}
    <path d="M${objX} ${objY}L${Q.x.toFixed(1)} ${Q.y.toFixed(1)}" stroke="#F0A422" stroke-width="2.8" stroke-linecap="round"/>
    ${ar(objX, objY, Q.x, Q.y, 0.55, "#F0A422")}
    <path d="M${Q.x.toFixed(1)} ${Q.y.toFixed(1)}L${E.x.toFixed(1)} ${E.y.toFixed(1)}" stroke="#F0A422" stroke-width="2.8" stroke-linecap="round"/>
    ${ar(Q.x, Q.y, E.x, E.y, 0.6, "#F0A422")}
    <path d="M${E.x.toFixed(1)} ${E.y.toFixed(1)}L${(Q.x + ux * 96).toFixed(1)} ${(Q.y + uy * 96).toFixed(1)}" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="5 5"/>
    ${o.noCands ? "" : cands.map((c) => badge(c.cx, c.cy, c.t)).join("")}
    <g stroke="#3C4654" stroke-width="2.2" fill="none">
      <path d="M${(E.x - 14).toFixed(1)} ${(E.y - 10).toFixed(1)}q12 -10 28 0q-12 10 -28 0z" fill="#fff"/>
      <circle cx="${E.x.toFixed(1)}" cy="${(E.y - 10).toFixed(1)}" r="4.2" fill="#5E86B4" stroke="none"/>
    </g>
    <text x="${(E.x + 22).toFixed(1)}" y="${(E.y - 22).toFixed(1)}" font-size="11.5" font-weight="700" fill="#4E5968">눈</text>
  </svg>`;
}

/** LSEE 물체를 보는 과정 장면(신작 · 파라미터형) · v1 lightSeePathFig(고정형) 대체.
 *  lamp: 스탠드→책 ㉠ · 책→눈 ㉡ / torch: 손전등→벽시계 ㉠ · 시계→눈 ㉡ · 눈 앞 ㉢(순서 배열용) /
 *  moon: 태양→달 ㉠ · 달→지구 사람 눈 ㉡ / window: 창밖 태양→화분 ㉠ · 화분→눈 ㉡ /
 *  water: 태양→물고기 ㉠(입수 굴절 반영) · 물고기→수면 ㉡ · 수면→눈 ㉢.
 *  경로 화살표는 전부 같은 색(순서·정오 단서 금지) · aria는 배치만 서술. */
export function xLSEE(mode: "lamp" | "torch" | "moon" | "window" | "water"): string {
  const eye = (x: number, y: number): string => `<g stroke="#3C4654" stroke-width="2.2" fill="none">
      <path d="M${x - 14} ${y}q12 -10 28 0q-12 10 -28 0z" fill="#fff"/>
      <circle cx="${x}" cy="${y}" r="4.2" fill="#5E86B4" stroke="none"/>
    </g>`;
  const ray = (x1: number, y1: number, x2: number, y2: number, tag: string, tx: number, ty: number): string =>
    `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#F0A422" stroke-width="2.8"/>${ar(x1, y1, x2, y2, 0.6, "#F0A422")}${badge(tx, ty, tag)}`;
  if (mode === "lamp") {
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="책상 위에 켜진 스탠드와 책, 오른쪽 위에 사람 눈이 그려져 있어요. 스탠드에서 책으로 가는 화살표에 기호 ㉠, 책에서 눈으로 가는 화살표에 기호 ㉡이 붙어 있어요">
      <line x1="16" y1="168" x2="328" y2="168" stroke="#B0B8C1" stroke-width="2.4"/>
      <g><path d="M56 166v-84" stroke="#5E6B7E" stroke-width="5" stroke-linecap="round"/>
        <path d="M56 82q30 -14 58 6" stroke="#5E6B7E" stroke-width="5" stroke-linecap="round" fill="none"/>
        <path d="M100 74l26 22-14 18-26-22z" fill="#3C4654"/><circle cx="112" cy="94" r="7" fill="#FFD978"/>
        <rect x="38" y="164" width="36" height="7" rx="3.5" fill="#5E6B7E"/></g>
      <g><path d="M148 168l14-26h44l14 26z" fill="#F9FBFD" stroke="#8B95A1" stroke-width="2"/>
        <path d="M162 142q22 -8 44 0M184 142v26" stroke="#8B95A1" stroke-width="1.8" fill="none"/></g>
      ${eye(296, 52)}
      ${ray(118, 100, 172, 136, "㉠", 138, 112)}
      ${ray(196, 134, 282, 62, "㉡", 244, 92)}
      <text x="56" y="184" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">스탠드</text>
      <text x="184" y="184" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">책</text>
      <text x="296" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">눈</text>
    </svg>`;
  }
  if (mode === "torch") {
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="캄캄한 방에서 손전등이 벽시계를 비추고, 오른쪽 아래에 사람 눈이 있어요. 손전등에서 시계로 가는 화살표에 ㉠, 시계에서 눈으로 가는 화살표에 ㉡, 눈에 기호 ㉢이 붙어 있어요">
      <rect x="10" y="10" width="324" height="170" rx="14" fill="#1A2536"/>
      <g transform="translate(52,132)"><rect x="-24" y="-10" width="40" height="20" rx="7" fill="#8B95A1"/><path d="M16 -12 L30 -16 V16 L16 12Z" fill="#5E6B7E"/></g>
      <circle cx="210" cy="52" r="26" fill="#F6F8FB" stroke="#8B95A1" stroke-width="2.4"/>
      <path d="M210 52 v-14 M210 52 l10 6" stroke="#3C4654" stroke-width="2.4" stroke-linecap="round"/>
      ${eye(288, 148)}
      ${ray(84, 122, 188, 68, "㉠", 132, 88)}
      ${ray(228, 68, 276, 136, "㉡", 258, 96)}
      ${badge(316, 148, "㉢")}
      <text x="52" y="168" text-anchor="middle" font-size="11" fill="#AFC3E3">손전등</text>
      <text x="210" y="24" text-anchor="middle" font-size="11" fill="#AFC3E3">벽시계</text>
    </svg>`;
  }
  if (mode === "moon") {
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="밤하늘 장면. 왼쪽 위 태양에서 달로 가는 화살표에 ㉠, 달에서 지상의 사람 눈으로 가는 화살표에 ㉡이 붙어 있어요">
      <rect x="10" y="10" width="324" height="170" rx="14" fill="#1A2536"/>
      <circle cx="52" cy="44" r="18" fill="#FFD470"/><text x="52" y="78" text-anchor="middle" font-size="11" fill="#AFC3E3">태양</text>
      <circle cx="196" cy="42" r="14" fill="#E8ECF3"/><text x="196" y="24" text-anchor="middle" font-size="11" fill="#AFC3E3">달</text>
      <g stroke="#AFC3E3" stroke-width="2.4" fill="none">
        <circle cx="284" cy="122" r="9"/><path d="M284 131v24M284 139l-10 11M284 139l10 11M284 155l-8 15M284 155l8 15"/></g>
      ${ray(74, 44, 178, 42, "㉠", 126, 30)}
      ${ray(206, 54, 278, 112, "㉡", 246, 78)}
    </svg>`;
  }
  if (mode === "water") {
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="연못가에서 물속 물고기를 내려다보는 장면. 태양에서 물고기로 가는 화살표에 ㉠, 물고기에서 수면까지 가는 화살표에 ㉡, 수면에서 꺾여 눈으로 가는 화살표에 ㉢이 붙어 있어요">
      <rect x="16" y="112" width="312" height="66" rx="8" fill="#EAF3FE"/>
      <line x1="16" y1="112" x2="328" y2="112" stroke="#7FB0E0" stroke-width="2.2"/>
      <circle cx="44" cy="36" r="14" fill="#FFD470"/><text x="44" y="66" text-anchor="middle" font-size="10.5" fill="#8B95A1">태양</text>
      <g transform="translate(150,152)"><path d="M-14 0 q14 -10 26 0 q-12 10 -26 0z" fill="#F0A422" stroke="#C08A3E" stroke-width="1.4"/><path d="M-14 0 l-9 -7 v14 z" fill="#E8961E"/><circle cx="7" cy="-2" r="1.6" fill="#3C4654"/></g>
      <text x="150" y="176" text-anchor="middle" font-size="10.5" fill="#5E86B4">물고기</text>
      <g stroke="#3C4654" stroke-width="2.2" fill="none"><path d="M270 54q11 -9 26 0q-11 9 -26 0z" fill="#fff"/><circle cx="283" cy="54" r="4" fill="#5E86B4" stroke="none"/></g>
      <text x="283" y="36" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">눈</text>
      <path d="M60 44L115.8 112" stroke="#F0A422" stroke-width="2.6"/>${ar(60, 44, 115.8, 112, 0.55, "#F0A422")}
      <path d="M115.8 112L137 150" stroke="#F0A422" stroke-width="2.6"/>${badge(84, 78, "㉠")}
      <path d="M162 146L216 112" stroke="#F0A422" stroke-width="2.6"/>${ar(162, 146, 216, 112, 0.6, "#F0A422")}${badge(196, 138, "㉡")}
      <path d="M216 112L268 62" stroke="#F0A422" stroke-width="2.6"/>${ar(216, 112, 268, 62, 0.6, "#F0A422")}${badge(232, 78, "㉢")}
    </svg>`;
  }
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="낮의 교실 창가 장면. 창밖 태양에서 창가 화분으로 가는 화살표에 ㉠, 화분에서 사람 눈으로 가는 화살표에 ㉡이 붙어 있어요">
    <rect x="18" y="14" width="120" height="120" rx="8" fill="#EAF3FE" stroke="#B0B8C1" stroke-width="2"/>
    <circle cx="58" cy="46" r="15" fill="#FFD470"/><text x="58" y="76" text-anchor="middle" font-size="10.5" fill="#8B95A1">태양</text>
    <g transform="translate(174,120)"><path d="M-14 0 h28 l-5 26 h-18 Z" fill="#C97B4A"/><path d="M0 -2 q-14 -18 -4 -30 M0 -2 q12 -16 6 -28 M0 -2 v-24" stroke="#2E9E63" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <text x="174" y="168" text-anchor="middle" font-size="11" font-weight="700" fill="#4E5968">화분</text>
    ${eye(298, 62)}
    <text x="298" y="44" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">눈</text>
    ${ray(76, 58, 164, 104, "㉠", 118, 78)}
    ${ray(190, 110, 284, 70, "㉡", 240, 86)}
  </svg>`;
}

/** LMR 평면거울 작도 광선도(신작 · 파라미터형) · 미4 계보. 거울 = 세로선 x=208.
 *  기하: 상점 = 물체의 거울 대칭점 · 반사점 = (상점과 눈을 잇는 직선)이 거울과 만나는 점
 *  (반사 법칙과 완전 동치 · 눈대중 금지). 실선 = 물체→반사점→눈 · 점선 = 반사점→상점 연장.
 *  mode base: 한 쌍(눈 하나) + ㉠(반사 광선)·㉡(연장선) 배지 / ghost: 두 눈 · 상 자리 물음표 /
 *  dist: 물체~거울 거리 라벨 인쇄 / distRev: 물체~상 거리 인쇄 · 거울~물체 ? /
 *  eye2: 눈 두 위치(같은 상점으로 두 벌 작도 = 상 위치 불변의 물증).
 *  aria는 작도 요소만 서술(거리 정답 수치·판정 결과 낭독 금지). */
export function xLMR(o: { mode: "base" | "ghost" | "dist" | "distRev" | "eye2"; d1?: number; d2?: number }): string {
  const MX = 208;
  const obj = { x: 118, y: 128 };
  const img = { x: 2 * MX - obj.x, y: obj.y };
  const mk = (ex: number, ey: number): { hx: number; hy: number } => {
    // 반사점 = 상점→눈 직선과 거울(x=MX)의 교점.
    const t = (MX - img.x) / (ex - img.x);
    return { hx: MX, hy: img.y + (ey - img.y) * t };
  };
  const eyeA = { x: 96, y: 44 };
  const A = mk(eyeA.x, eyeA.y);
  const eyeB = { x: 46, y: 84 };
  const B = mk(eyeB.x, eyeB.y);
  const candle = (x: number, y: number, ghost = false): string =>
    `<g transform="translate(${x},${y})" opacity="${ghost ? 0.55 : 1}">
      <path d="M-7 22h14v-24h-14z" fill="${ghost ? "#EAD9BC" : "#F5C878"}" stroke="#C08A3E" stroke-width="1.6"${ghost ? ` stroke-dasharray="4 3"` : ""}/>
      <path d="M0 -12q6 7 0 12q-6 -5 0 -12z" fill="#F0A422"${ghost ? ` opacity=".6"` : ""}/>
    </g>`;
  const eyeArt = (x: number, y: number): string => `<g stroke="#3C4654" stroke-width="2" fill="none">
      <path d="M${x - 12} ${y}q10 -9 24 0q-10 9 -24 0z" fill="#fff"/><circle cx="${x}" cy="${y}" r="3.8" fill="#5E86B4" stroke="none"/></g>`;
  const mirror = `<line x1="${MX}" y1="18" x2="${MX}" y2="188" stroke="#5E6B7E" stroke-width="4"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${MX + 4}" y1="${28 + i * 18}" x2="${MX + 13}" y2="${20 + i * 18}" stroke="#B0B8C1" stroke-width="1.5"/>`).join("")}
    <text x="${MX - 6}" y="14" text-anchor="end" font-size="11" fill="#8B95A1">평면거울</text>`;
  const rayTo = (h: { hx: number; hy: number }, e: { x: number; y: number }): string =>
    `<path d="M${obj.x} ${obj.y}L${h.hx.toFixed(1)} ${h.hy.toFixed(1)}" stroke="#F0A422" stroke-width="2.8"/>${ar(obj.x, obj.y, h.hx, h.hy, 0.55, "#F0A422")}
     <path d="M${h.hx.toFixed(1)} ${h.hy.toFixed(1)}L${e.x} ${e.y}" stroke="#F0A422" stroke-width="2.8"/>${ar(h.hx, h.hy, e.x, e.y, 0.6, "#F0A422")}
     <path d="M${h.hx.toFixed(1)} ${h.hy.toFixed(1)}L${img.x} ${img.y}" stroke="#8B95A1" stroke-width="1.8" stroke-dasharray="5 5"/>`;
  if (o.mode === "eye2") {
    return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="평면거울 앞 물체에서 나온 빛이 거울에서 반사되어 서로 다른 두 위치의 눈에 각각 들어가는 작도 그림. 두 반사 광선을 거울 뒤로 늘인 점선이 그려져 있어요">
      ${mirror}${candle(obj.x, obj.y)}${candle(img.x, img.y, true)}
      ${rayTo(A, eyeA)}${rayTo(B, eyeB)}
      ${eyeArt(eyeA.x, eyeA.y)}${eyeArt(eyeB.x, eyeB.y)}
      <text x="${eyeA.x - 20}" y="${eyeA.y - 10}" font-size="11.5" font-weight="700" fill="#4E5968">눈 A</text>
      <text x="${eyeB.x - 24}" y="${eyeB.y + 22}" font-size="11.5" font-weight="700" fill="#4E5968">눈 B</text>
      <text x="${obj.x}" y="${obj.y + 40}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
    </svg>`;
  }
  if (o.mode === "dist" || o.mode === "distRev") {
    const lab =
      o.mode === "dist"
        ? `<path d="M${obj.x} 168h${MX - obj.x}" stroke="#8B95A1" stroke-width="1.6"/><path d="M${obj.x} 163v10M${MX} 163v10" stroke="#8B95A1" stroke-width="1.6"/>
           <text x="${(obj.x + MX) / 2}" y="184" text-anchor="middle" font-size="11.5" font-weight="800" fill="#4E5968">${o.d1} cm</text>`
        : `<path d="M${obj.x} 168h${img.x - obj.x}" stroke="#8B95A1" stroke-width="1.6"/><path d="M${obj.x} 163v10M${img.x} 163v10" stroke="#8B95A1" stroke-width="1.6"/>
           <text x="${(obj.x + img.x) / 2}" y="184" text-anchor="middle" font-size="11.5" font-weight="800" fill="#4E5968">${o.d2} cm</text>
           <path d="M${obj.x} 156h${MX - obj.x}" stroke="#37B6D8" stroke-width="1.6" stroke-dasharray="4 4"/>
           <text x="${(obj.x + MX) / 2 + 14}" y="152" text-anchor="middle" font-size="12" font-weight="800" fill="#1187A6">?</text>`;
    return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="평면거울 앞에 물체가, 거울 뒤 같은 거리에 상이 그려진 작도 그림. 거리 표시선이 함께 그려져 있어요">
      ${mirror}${candle(obj.x, obj.y)}${candle(img.x, img.y, true)}
      ${rayTo(A, eyeA)}${eyeArt(eyeA.x, eyeA.y)}
      ${lab}
      <text x="${obj.x - 14}" y="${obj.y + 6}" text-anchor="end" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
      <text x="${img.x + 18}" y="${img.y + 6}" font-size="11.5" font-weight="700" fill="#8B95A1">상</text>
    </svg>`;
  }
  if (o.mode === "base") {
    // 한 쌍(눈 하나)만 그려 ㉠(반사 광선)·㉡(연장선) 지칭을 또렷하게(파일럿 눈검수 반영).
    return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="평면거울 앞 물체에서 나온 빛이 거울에서 반사되어 눈에 들어가고, 그 빛을 거울 뒤로 곧게 늘인 점선이 그려진 작도 그림. 반사된 빛에 기호 ㉠, 점선에 기호 ㉡이 붙어 있어요">
      ${mirror}${candle(obj.x, obj.y)}${candle(img.x, img.y, true)}
      ${rayTo(A, eyeA)}
      ${eyeArt(eyeA.x, eyeA.y)}
      ${badge((A.hx + eyeA.x) / 2 + 2, (A.hy + eyeA.y) / 2 + 16, "㉠")}
      ${badge((A.hx + img.x) / 2, (A.hy + img.y) / 2 - 15, "㉡")}
      <text x="${obj.x}" y="${obj.y + 40}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
      <text x="${eyeA.x - 20}" y="${eyeA.y - 12}" font-size="11.5" font-weight="700" fill="#4E5968">눈</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="평면거울 앞 물체에서 나온 빛이 거울의 서로 다른 두 곳에서 반사되어 두 위치의 눈에 들어가고, 반사 광선들을 거울 뒤로 곧게 늘인 점선들이 거울 뒤 한 점에 모이는 작도 그림. 그 점 위에 물음표가 있어요">
    ${mirror}${candle(obj.x, obj.y)}${candle(img.x, img.y, true)}
    ${rayTo(A, eyeA)}${rayTo(B, eyeB)}
    ${eyeArt(eyeA.x, eyeA.y)}${eyeArt(eyeB.x, eyeB.y)}
    <circle cx="${img.x}" cy="${img.y - 34}" r="12" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.6"/><text x="${img.x}" y="${img.y - 29}" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">?</text>
    <text x="${obj.x}" y="${obj.y + 40}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
  </svg>`;
}

/** LMRfull 전신 거울 작도(신작) · 키 hcm의 사람 · 거울 필요 구간 = 키의 절반(계산 작도).
 *  기하: 머리끝 반사점 y = (머리+눈)/2 · 발끝 반사점 y = (발+눈)/2 · 두 점 사이가 필요 구간.
 *  구간 길이는 ?로 표시(정답 h/2 인쇄 금지). */
export function xLMRfull(hcm: number): string {
  const MX = 252;
  const px = 84;
  const top = 38;
  const foot = 178;
  const eyeY = top + 12;
  const m1 = (top + eyeY) / 2;
  const m2 = (foot + eyeY) / 2;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="키 ${hcm}센티미터인 사람이 세로로 세운 평면거울 앞에 서 있는 작도 그림. 머리끝과 발끝에서 나온 빛이 거울에서 반사되어 눈에 들어오는 광선과, 거울에서 실제로 쓰인 구간이 표시되어 있어요">
    <line x1="${MX}" y1="20" x2="${MX}" y2="196" stroke="#C4CBD4" stroke-width="3"/>
    <line x1="${MX}" y1="${m1}" x2="${MX}" y2="${m2}" stroke="#3182F6" stroke-width="5"/>
    <g stroke="#3C4654" stroke-width="2.6" fill="none">
      <circle cx="${px}" cy="${top + 8}" r="9"/>
      <path d="M${px} ${top + 17}v52M${px} ${top + 30}l-13 14M${px} ${top + 30}l13 14M${px} ${top + 69}l-11 ${foot - top - 69 - 11}M${px} ${top + 69}l11 ${foot - top - 69 - 11}"/>
    </g>
    <path d="M${px} ${top}L${MX} ${m1}" stroke="#F0A422" stroke-width="2.4"/>${ar(px, top, MX, m1, 0.55, "#F0A422")}
    <path d="M${MX} ${m1}L${px + 6} ${eyeY}" stroke="#F0A422" stroke-width="2.4"/>${ar(MX, m1, px + 6, eyeY, 0.6, "#F0A422")}
    <path d="M${px} ${foot}L${MX} ${m2}" stroke="#F0A422" stroke-width="2.4"/>${ar(px, foot, MX, m2, 0.55, "#F0A422")}
    <path d="M${MX} ${m2}L${px + 6} ${eyeY + 4}" stroke="#F0A422" stroke-width="2.4"/>${ar(MX, m2, px + 6, eyeY + 4, 0.6, "#F0A422")}
    <path d="M${px - 32} ${top}h-8M${px - 32} ${foot}h-8"/>
    <line x1="${px - 36}" y1="${top}" x2="${px - 36}" y2="${foot}" stroke="#8B95A1" stroke-width="1.5"/>
    <text x="${px - 42}" y="${(top + foot) / 2}" text-anchor="end" font-size="11.5" font-weight="800" fill="#4E5968">${hcm} cm</text>
    <line x1="${MX + 22}" y1="${m1}" x2="${MX + 22}" y2="${m2}" stroke="#37B6D8" stroke-width="1.6"/>
    <path d="M${MX + 17} ${m1}h10M${MX + 17} ${m2}h10" stroke="#37B6D8" stroke-width="1.6"/>
    <text x="${MX + 30}" y="${(m1 + m2) / 2 + 4}" font-size="13" font-weight="800" fill="#1187A6">?</text>
    <text x="${MX}" y="208" text-anchor="middle" font-size="11" fill="#8B95A1">평면거울</text>
  </svg>`;
}

/** xLMG 모눈 평면거울 상 위치(개조판) · v1 3칸 고정을 cells·후보 배치 파라미터로.
 *  cells: 물체~거울 모눈 칸 수 · order: 후보 ①~⑤가 가리키는 위치(거울 뒤 칸수 · 0=거울 면 ·
 *  공간 정렬 §8-1) · withImage: 후보 대신 상을 그려 완성 작도(판독 num·판정 bogi용).
 *  정답 유출 금지: 후보 모드에서는 상을 그리지 않는다. */
export function xLMG(o: { cells: number; order?: number[]; withImage?: boolean }): string {
  const cell = 24;
  const MX = 172;
  let grid = "";
  for (let c = 0; c <= 12; c++) grid += `<line x1="${28 + c * cell}" y1="24" x2="${28 + c * cell}" y2="192" stroke="#EDF0F4" stroke-width="1.2"/>`;
  for (let r = 0; r <= 7; r++) grid += `<line x1="28" y1="${24 + r * cell}" x2="316" y2="${24 + r * cell}" stroke="#EDF0F4" stroke-width="1.2"/>`;
  const ox = MX - o.cells * cell;
  const candle = (x: number, ghost = false): string => `<g transform="translate(${x},108)" opacity="${ghost ? 0.6 : 1}">
      <path d="M-7 22h14v-24h-14z" fill="${ghost ? "#EAD9BC" : "#F5C878"}" stroke="#C08A3E" stroke-width="1.8"${ghost ? ` stroke-dasharray="4 3"` : ""}/>
      <path d="M0 -12q6 7 0 12q-6 -5 0 -12z" fill="#F0A422"${ghost ? ` opacity=".6"` : ""}/></g>`;
  const cands = (o.order ?? [])
    .map((cellsBehind, i) => {
      const x = cellsBehind === 0 ? MX : MX + cellsBehind * cell;
      return badge(x, 108, ["①", "②", "③", "④", "⑤"][i], 11);
    })
    .join("");
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="모눈 위에 세로로 선 평면거울과 촛불 모양 물체가 그려져 있어요. 물체는 거울에서 모눈 ${o.cells}칸 떨어져 있고, ${o.withImage ? "거울 뒤에는 물체의 상이 함께 그려져 있어요" : "상이 생길 위치 후보 다섯 곳에 번호가 붙어 있어요"}">
    ${grid}
    <line x1="${MX}" y1="20" x2="${MX}" y2="196" stroke="#5E6B7E" stroke-width="4"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${MX + 4}" y1="${28 + i * 19}" x2="${MX + 13}" y2="${20 + i * 19}" stroke="#B0B8C1" stroke-width="1.5"/>`).join("")}
    ${candle(ox)}
    ${o.withImage ? candle(MX + o.cells * cell, true) : cands}
    <path d="M${ox} 142h${MX - ox}" stroke="#8B95A1" stroke-width="1.6" stroke-dasharray="4 4"/>
    <path d="M${ox} 137v10M${MX} 137v10" stroke="#8B95A1" stroke-width="1.6"/>
    <text x="${(ox + MX) / 2}" y="158" text-anchor="middle" font-size="10.5" fill="#6B7684">${o.cells}칸</text>
    <text x="152" y="16" text-anchor="end" font-size="11" fill="#8B95A1">평면거울</text>
    <text x="${ox}" y="86" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">물체</text>
  </svg>`;
}

/** LXS 거울·렌즈 단면 카드(신작 · 파라미터형) · 천02 계보. kinds 순서대로 (가)~(라) 배치.
 *  거울 = marc 몸통(§8-2) · 렌즈 = 유리 단면 윤곽.
 *  aria는 "네 가지 단면"만(각 카드의 정체 낭독 금지 · 식별이 곧 과제). */
export function xLXS(kinds: ("cvm" | "ccm" | "cvl" | "ccl")[]): string {
  const art = (k: string): string => {
    // 거울 단면: 반사면은 왼쪽 · 빗금(뒷면)은 오른쪽 고정(marc) · 벨리 방향이 볼록/오목을 가른다.
    if (k === "cvm") return marc(10, -32, 34);
    if (k === "ccm") return marc(-10, 32, 34);
    if (k === "cvl") return `<path d="M0 -36 q17 36 0 72 q-17 -36 0 -72 z" fill="#DCEBFB" stroke="#5E86B4" stroke-width="2.6"/>`;
    return `<path d="M-11 -36 h22 q-13 36 0 72 h-22 q13 -36 0 -72 z" fill="#DCEBFB" stroke="#5E86B4" stroke-width="2.6"/>`;
  };
  const labels = ["(가)", "(나)", "(다)", "(라)"];
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="거울과 렌즈의 옆 단면 네 가지가 (가)부터 (라)까지 카드로 나란히 그려져 있어요. 단면의 휜 방향과 뒷면 표시를 보고 종류를 구분해 보세요">
    ${kinds
      .map((k, i) => {
        const x = 27 + i * 76;
        return `<g transform="translate(${x + 27},92)">
        <rect x="-34" y="-72" width="68" height="128" rx="12" fill="#F7F9FC" stroke="#DCE3EC" stroke-width="1.6"/>
        ${art(k)}
        <text x="0" y="76" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${labels[i]}</text>
      </g>`;
      })
      .join("")}
  </svg>`;
}

/** LOB 광학 관찰 2컷(신작) · 장치 단면 + 물체(촛불) 가까이/멀리 · 상 자리 ?(정답 미인쇄).
 *  device: ccm(오목 거울 · marc 몸통) | cvl(볼록 렌즈). 그림은 조건(장치 종류 · 거리 변화)만
 *  제시하고 상의 모습은 인쇄하지 않는다(예측이 과제). */
export function xLOB(device: "ccm" | "cvl"): string {
  const dev =
    device === "ccm"
      ? marc(-12, 38, 40, 3.6)
      : `<path d="M0 -42 q19 42 0 84 q-19 -42 0 -84 z" fill="#DCEBFB" stroke="#5E86B4" stroke-width="2.6"/>`;
  const candle = (x: number): string => `<g transform="translate(${x},22)">
      <path d="M-6 18h12v-20h-12z" fill="#F5C878" stroke="#C08A3E" stroke-width="1.6"/>
      <path d="M0 -10q5 6 0 10q-5 -4 0 -10z" fill="#F0A422"/></g>`;
  const cut = (label: string, objX: number, y: number): string => `<g transform="translate(0,${y})">
      <text x="18" y="6" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>
      <line x1="34" y1="22" x2="318" y2="22" stroke="#E2E6EC" stroke-width="1.4"/>
      <g transform="translate(292,22)">${dev}</g>
      ${candle(objX)}
      <circle cx="${(objX + 292) / 2 + 46}" cy="-14" r="11" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.5"/>
      <text x="${(objX + 292) / 2 + 46}" y="-9.5" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">?</text>
    </g>`;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="같은 ${device === "ccm" ? "오목 거울" : "볼록 렌즈"} 앞에 촛불을 (가)는 가까이, (나)는 멀리 둔 두 장면. 이때 보이는 모습 자리에는 물음표가 있어요">
    ${cut("(가) 가까이", 224, 42)}
    ${cut("(나) 멀리", 66, 138)}
  </svg>`;
}

/** LVN 빛의 삼원색 벤(신작) · 비상04 계보. 겹침 영역은 전부 무채색(원 테두리만 · 알파 채움도
 *  금지 = 겹침 색 힌트가 정답 인쇄 · §8-4) · 물을 자리만 ㉠㉡ 기호(㉠=빨+파 겹침 · ㉡=중앙). */
export function xLVN(): string {
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="빨간빛, 초록빛, 파란빛 세 원이 서로 겹치게 그려진 그림. 겹친 부분은 색이 칠해져 있지 않고, 빨간빛과 파란빛이 겹친 자리에 기호 ㉠, 세 빛이 모두 겹친 가운데 자리에 기호 ㉡이 있어요">
    <circle cx="142" cy="78" r="56" fill="none" stroke="#E5322E" stroke-width="2.8"/>
    <circle cx="202" cy="78" r="56" fill="none" stroke="#12A84E" stroke-width="2.8"/>
    <circle cx="172" cy="130" r="56" fill="none" stroke="#3A6CFF" stroke-width="2.8"/>
    <text x="96" y="34" font-size="11.5" font-weight="700" fill="#C22A26">빨간빛</text>
    <text x="222" y="34" font-size="11.5" font-weight="700" fill="#0E8A40">초록빛</text>
    <text x="172" y="198" text-anchor="middle" font-size="11.5" font-weight="700" fill="#2A52CC">파란빛</text>
    ${badge(139, 122, "㉠")}
    ${badge(172, 96, "㉡")}
  </svg>`;
}

/** LSW 용수철 파동 2컷(신작) · 비08 계보. 손이 흔든 폭(화살표)과 그 결과 파형을 함께 그린다.
 *  vary "amp": 같은 빠르기 · (나)는 폭 2배(파형 진폭 2배 · 파장 동일) /
 *  vary "freq": 같은 폭 · (나)는 두 배 빠르게(파장 절반 · 진폭 동일).
 *  판독이 과제이므로 요소 이름은 인쇄하지 않는다. aria 방향은 그림 화살표(위아래)와 일치(§8-6). */
export function xLSW(vary: "amp" | "freq"): string {
  const wave = (y: number, amp: number, cyc: number, arrowH: number): string => {
    let d = "";
    for (let i = 0; i <= 232; i += 2) {
      const yy = -Math.sin((i / 232) * Math.PI * 2 * cyc) * amp;
      d += `${d ? "L" : "M"}${86 + i} ${(y + yy).toFixed(1)}`;
    }
    return `<g>
      <g stroke="#3C4654" stroke-width="2.2" fill="none">
        <circle cx="46" cy="${y - 26}" r="7"/><path d="M46 ${y - 19}v20M46 ${y - 12}l-8 9M46 ${y - 12}l9 8M46 ${y + 1}l-7 13M46 ${y + 1}l7 13"/>
      </g>
      <path d="M62 ${y - arrowH}v${arrowH * 2}" stroke="#37B6D8" stroke-width="2.2"/>
      <path d="M58 ${y - arrowH + 5}l4 -5 4 5M58 ${y + arrowH - 5}l4 5 4 -5" stroke="#37B6D8" stroke-width="2" fill="none"/>
      <path d="${d}" stroke="#5E6B7E" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="318" y1="${y - 26}" x2="318" y2="${y + 26}" stroke="#8B95A1" stroke-width="4"/>
    </g>`;
  };
  const a2 = vary === "amp" ? 40 : 20;
  const c2 = vary === "freq" ? 6 : 3;
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="긴 용수철의 한쪽 끝을 사람이 위아래로 흔들어 파동을 만드는 두 장면 (가), (나). (나)는 (가)보다 ${vary === "amp" ? "더 큰 폭으로" : "더 빠르게"} 흔드는 장면이에요">
    <text x="18" y="30" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
    ${wave(58, 20, 3, 26)}
    <text x="18" y="126" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
    ${wave(158, a2, c2, vary === "amp" ? 46 : 26)}
  </svg>`;
}

/** LFC 소리 비교 순서도(신작) · 천09 계보 · 예/아니요 분기가 각자의 결론 칸으로(u3 FC2 문법).
 *  결론 칸 ㉠㉡ 가림(정답 미인쇄) · 아니요 화살표는 가로 화살촉 + 결론 칸과 같은 높이 정렬 ·
 *  아니요 라벨은 다이아 오른쪽 꼭짓점 바깥 위(사용자 검수 2차 반영 · 어느 쪽과도 겹치지 않는 자리). */
export function xLFC(): string {
  const box = (x: number, y: number, w: number, h: number, t: string, fill = "#F7F9FC"): string =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="#8B95A1" stroke-width="1.6"/>
     <text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#333D4B">${t}</text>`;
  const dia = (x: number, y: number, w: number, h: number, t1: string, t2: string): string =>
    `<path d="M${x + w / 2} ${y} L${x + w} ${y + h / 2} L${x + w / 2} ${y + h} L${x} ${y + h / 2} Z" fill="#FFF7E8" stroke="#E8961E" stroke-width="1.6"/>
     <text x="${x + w / 2}" y="${y + h / 2 - 2}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8A5B00">${t1}</text>
     <text x="${x + w / 2}" y="${y + h / 2 + 11}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#8A5B00">${t2}</text>`;
  const vArrow = (x: number, y1: number, y2: number, lab?: string): string =>
    `<path d="M${x} ${y1}L${x} ${y2}" stroke="#8B95A1" stroke-width="1.8"/>
     <path d="M${x - 4} ${y2 - 6}l4 6 4 -6" stroke="#8B95A1" stroke-width="1.8" fill="none"/>
     ${lab ? `<text x="${x + 9}" y="${(y1 + y2) / 2 + 4}" font-size="10.5" font-weight="800" fill="#6B7684">${lab}</text>` : ""}`;
  const hArrow = (x1: number, x2: number, y: number, lab: string, labY: number): string =>
    `<path d="M${x1} ${y}L${x2} ${y}" stroke="#8B95A1" stroke-width="1.8"/>
     <path d="M${x2 - 6} ${y - 4}l6 4 -6 4" stroke="#8B95A1" stroke-width="1.8" fill="none"/>
     <text x="${x1 + 4}" y="${labY}" font-size="10.5" font-weight="800" fill="#6B7684">${lab}</text>`;
  const mark = (x: number, y: number, t: string): string =>
    `<rect x="${x}" y="${y}" width="84" height="34" rx="9" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.7"/>
     <text x="${x + 42}" y="${y + 21}" text-anchor="middle" font-size="13" font-weight="800" fill="#1B64DA">${t}</text>`;
  return `<svg viewBox="0 0 344 246" ${NS} fill="none" role="img" aria-label="두 소리의 파형을 비교하는 순서도. 첫 갈림길은 파형의 키가 같은지, 두 번째 갈림길은 파형의 촘촘한 정도가 같은지를 묻고, 각 갈림길의 아니요 방향 결론 칸에 기호 ㉠과 ㉡이 있어요">
    ${box(112, 8, 120, 32, "두 소리의 파형 관찰")}
    ${vArrow(172, 40, 56)}
    ${dia(104, 56, 136, 46, "파형의 키(높이)가", "서로 같은가?")}
    ${hArrow(240, 250, 79, "아니요", 56)}
    ${mark(250, 62, "㉠")}
    ${vArrow(172, 102, 122, "예")}
    ${dia(96, 122, 152, 46, "파형의 촘촘한 정도가", "서로 같은가?")}
    ${hArrow(248, 254, 145, "아니요", 122)}
    ${mark(254, 128, "㉡")}
    ${vArrow(172, 168, 188, "예")}
    ${box(96, 188, 152, 34, "파형의 생김새를 비교한다")}
  </svg>`;
}

/** LCU 물컵 두드리기(신작) · 천11 계보. 같은 컵 세 개 · 물 높이만 다름.
 *  숟가락 소품은 검수 반영으로 제거(어느 컵 위에 두어도 그 컵을 지목하는 힌트 · 문두가 서술).
 *  aria는 물 높이 서열만 중립 서술(높낮이 정답 낭독 금지). */
export function xLCU(): string {
  const cup = (x: number, level: number, label: string): string => `<g transform="translate(${x},44)">
      <path d="M0 0 L8 108 H60 L68 0" fill="none" stroke="#8B95A1" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M${(8 * (108 - level)) / 108} ${108 - level} L8 108 H60 L${68 - (8 * (108 - level)) / 108} ${108 - level} Z" fill="#BFE0FA" opacity=".85"/>
      <line x1="${(8 * (108 - level)) / 108}" y1="${108 - level}" x2="${68 - (8 * (108 - level)) / 108}" y2="${108 - level}" stroke="#5E86B4" stroke-width="2"/>
      <text x="34" y="132" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${label}</text>
    </g>`;
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="같은 유리컵 세 개 (가), (나), (다)에 물이 서로 다른 높이로 담겨 있는 그림. 물은 (가)가 가장 적고 (다)가 가장 많아요">
    ${cup(36, 28, "(가)")}
    ${cup(138, 62, "(나)")}
    ${cup(240, 96, "(다)")}
  </svg>`;
}

/** xLWG 파동 그래프(개조판) · v1 lightWaveGraphFig + phase(cos = 마루가 x=0·λ 위 눈금선) ·
 *  dim(마루~골 세로 치수선 기호 + 마루 높이 수평 가이드 점선) · marks(㉠~㉤ 지점 배지) 옵션.
 *  값 읽기 규칙: 정답 수치는 반드시 눈금선 위 · aria에 정답 수치 낭독 금지(축 이름만). */
export function xLWG(o: {
  xMax: number;
  xStep: number;
  yMax: number;
  yStep: number;
  amp: number;
  wavelength: number;
  xLabel: string;
  yLabel: string;
  phase?: "sin" | "cos";
  dim?: string;
  marks?: { x: number; y: number; t: string }[];
}): string {
  const L = 52;
  const R = 324;
  const T = 24;
  const B = 172;
  const mid = (T + B) / 2;
  const px = (v: number): number => L + ((R - L) * v) / o.xMax;
  const py = (v: number): number => mid - (v / o.yMax) * ((B - T) / 2);
  const fmt = (v: number): string => String(Math.round(v * 1000) / 1000);
  let grid = "";
  for (let x = 0; x <= o.xMax + 1e-9; x += o.xStep) {
    grid += `<line x1="${px(x).toFixed(1)}" y1="${T}" x2="${px(x).toFixed(1)}" y2="${B}" stroke="#EDF0F4" stroke-width="1.1"/>
      <text x="${px(x).toFixed(1)}" y="${B + 16}" text-anchor="middle" font-size="10" fill="#8B95A1">${fmt(x)}</text>`;
  }
  for (let y = -o.yMax; y <= o.yMax + 1e-9; y += o.yStep) {
    grid += `<line x1="${L}" y1="${py(y).toFixed(1)}" x2="${R}" y2="${py(y).toFixed(1)}" stroke="#EDF0F4" stroke-width="1.1"/>
      <text x="${L - 6}" y="${(py(y) + 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="#8B95A1">${fmt(y)}</text>`;
  }
  let d = "";
  const ph = o.phase ?? "sin";
  for (let x = 0; x <= o.xMax + 1e-9; x += o.xMax / 140) {
    const t = (2 * Math.PI * x) / o.wavelength;
    const y = o.amp * (ph === "cos" ? Math.cos(t) : Math.sin(t));
    d += `${d ? "L" : "M"}${px(x).toFixed(1)} ${py(y).toFixed(1)}`;
  }
  let extra = "";
  if (o.dim) {
    // 마루~골 세로 치수선: 골 x 위치에 화살표 선 + 마루 높이에서 오는 수평 가이드 점선.
    const crestX = px(o.wavelength * (ph === "cos" ? 0 : 0.25));
    const cx = px(o.wavelength * (ph === "cos" ? 0.5 : 0.75));
    extra += `<line x1="${crestX.toFixed(1)}" y1="${py(o.amp).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${py(o.amp).toFixed(1)}" stroke="#E8961E" stroke-width="1.4" stroke-dasharray="4 3"/>
      <line x1="${cx.toFixed(1)}" y1="${py(o.amp).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${py(-o.amp).toFixed(1)}" stroke="#E8961E" stroke-width="2"/>
      <path d="M${(cx - 4).toFixed(1)} ${(py(o.amp) + 6).toFixed(1)}l4 -6 4 6M${(cx - 4).toFixed(1)} ${(py(-o.amp) - 6).toFixed(1)}l4 6 4 -6" stroke="#E8961E" stroke-width="1.8" fill="none"/>
      <text x="${(cx + 8).toFixed(1)}" y="${mid + 4}" font-size="13" font-weight="800" fill="#B26A00">${o.dim}</text>`;
  }
  if (o.marks) extra += o.marks.map((m) => badge(px(m.x), py(m.y) + (m.y >= 0 ? -16 : 16), m.t)).join("");
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="가로축이 ${o.xLabel}, 세로축이 ${o.yLabel}인 파동 그래프예요. 눈금을 따라 값을 읽어 보세요">
    ${grid}
    <line x1="${L}" y1="${mid}" x2="${R}" y2="${mid}" stroke="#C4CBD4" stroke-width="1.4"/>
    <line x1="${L}" y1="${T}" x2="${L}" y2="${B}" stroke="#8B95A1" stroke-width="1.6"/>
    <path d="${d}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${extra}
    <text x="10" y="14" font-size="10.5" fill="#4E5968">${o.yLabel}</text>
    <text x="${R}" y="${B + 32}" text-anchor="end" font-size="10.5" fill="#4E5968">${o.xLabel}</text>
  </svg>`;
}

/** xLW4 파형 비교(개조판) · v1 4칸 + pair(2칸 대형) 옵션. aria 중립(모양 서술 금지). */
export function xLW4(o: { cells: { label: string; amp: number; cyc: number; noise?: boolean }[]; pair?: boolean }): string {
  const W = o.pair ? 250 : 116;
  const cell = (x: number, y: number, c: { label: string; amp: number; cyc: number; noise?: boolean }): string => {
    let d = "";
    for (let i = 0; i <= W; i += 2) {
      let yy = -Math.sin((i / W) * Math.PI * 2 * c.cyc) * c.amp;
      if (c.noise) yy += Math.sin((i / W) * Math.PI * 2 * c.cyc * 3.1) * c.amp * 0.45 + Math.sin((i / W) * Math.PI * 2 * c.cyc * 5.3) * c.amp * 0.22;
      d += `${d ? "L" : "M"}${x + 18 + i} ${(y + 40 + yy).toFixed(1)}`;
    }
    return `<text x="${x}" y="${y + 12}" font-size="12.5" font-weight="800" fill="#4E5968">${c.label}</text>
      <line x1="${x + 18}" y1="${y + 40}" x2="${x + 18 + W}" y2="${y + 40}" stroke="#E2E6EC" stroke-width="1.2"/>
      <path d="${d}" stroke="#5E6B7E" stroke-width="2.2" fill="none"/>`;
  };
  if (o.pair)
    return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="같은 시간 동안 기록한 두 소리의 파형이에요. 반복 횟수를 비교해 보세요">
      ${cell(38, 8, o.cells[0])}${cell(38, 100, o.cells[1])}
    </svg>`;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="서로 다른 네 소리를 같은 시간 동안 기록한 파형 네 개예요. 파형의 키와 촘촘함을 비교해 보세요">
    ${cell(14, 8, o.cells[0])}
    ${cell(184, 8, o.cells[1])}
    ${cell(14, 100, o.cells[2])}
    ${cell(184, 100, o.cells[3])}
  </svg>`;
}

/* ══════════ 파일럿 미사용 신작 모드 데뷔 카드(부록 · 눈검수용) ══════════ */

// ── g2u1 v2 신작(파일럿 승격 · 재출제 11호) ──
// 물질의 특성 그림 문법: 기포·결정 등 '결과'는 그리지 않는다(예측 과제 중립) · 라벨은 (가)(나)·㉠㉡ 중립 ·
// aria는 파라미터 파생 중립 문구(값·정오 낭독 금지) · 값 읽기 문항의 판독점은 반드시 눈금선 위 ·
// chemBoilCurvesParamFig는 chemFigures.chemBoilCurvesFig(고정 58/82)의 시험용 파라미터판.


/** SC2 질량-부피 산점도(파라미터형 · 라이트) · 점 좌표를 축 눈금으로 읽어 밀도를 비교한다.
 *  레슨 massVolScatterFig(고정 좌표 · aria가 전 좌표 낭독)의 시험판. aria는 중립(값 낭독 금지).
 *  전 점의 좌표는 눈금선 위에만 둔다(판독 과제 성립 조건). */
export function chemScatterExamFig(o: {
  pts: [string, number, number][];
  vMax: number;
  mMax: number;
  vStep: number;
  mStep: number;
}): string {
  const gx = (v: number): number => 52 + v * (258 / o.vMax);
  const gy = (m: number): number => 186 - (m / o.mMax) * 156;
  let xt = "";
  for (let v = 0; v <= o.vMax; v += o.vStep) {
    xt += `<line x1="${gx(v)}" y1="186" x2="${gx(v)}" y2="24" stroke="#EDF0F4" stroke-width="1"/>
      <text x="${gx(v)}" y="202" text-anchor="middle" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  let yt = "";
  for (let m = 0; m <= o.mMax; m += o.mStep) {
    yt += `<line x1="52" y1="${gy(m)}" x2="316" y2="${gy(m)}" stroke="#EDF0F4" stroke-width="1"/>
      <text x="44" y="${gy(m) + 3.5}" text-anchor="end" font-size="10.5" fill="#8B95A1">${m}</text>`;
  }
  const dots = o.pts
    .map(
      ([lb, v, m]) => `<circle cx="${gx(v)}" cy="${gy(m)}" r="5" fill="#E64980"/>
      <text x="${gx(v) + 2}" y="${gy(m) - 11}" text-anchor="middle" font-size="12" font-weight="700" fill="#4E5968">${lb}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 222" ${NS} role="img" aria-label="여러 물질의 부피와 질량을 나타낸 산점도. 점마다 라벨이 붙어 있고 축 눈금으로 값을 읽는다">
    ${yt}${xt}
    <line x1="52" y1="24" x2="52" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="52" y1="186" x2="316" y2="186" stroke="#B0B8C1" stroke-width="1.6"/>
    ${dots}
    <text x="8" y="14" font-size="11" fill="#4E5968">질량(g)</text>
    <text x="338" y="218" text-anchor="end" font-size="11" fill="#4E5968">부피(cm³)</text>
  </svg>`;
}

/** GT 탄산음료 시험관 조건 비교(파라미터형 · 라이트) · 수조 온도(얼음물/따뜻한 물)×마개 유무.
 *  레슨 sodaTubesFig(온도×흔들기)와 조건 축을 분리한 시험판. 기포는 절대 그리지 않는다(정답 유출).
 *  마개 있는 시험관은 입구에 회색 마개, 없는 시험관은 입구가 열려 있다. */
export function chemGasTubesFig(o: { tubes: { label: string; warm: boolean; capped: boolean }[] }): string {
  const bathW = 150;
  const bath = (bx: number, warm: boolean, tubes: { label: string; capped: boolean }[]): string => {
    const water = warm ? "#FFDFD0" : "#D6ECFC";
    const edge = warm ? "#E8A187" : "#9CC4E4";
    const deco = warm
      ? ""
      : `<rect x="${bx + 14}" y="128" width="14" height="11" rx="3" fill="#FFFFFF" stroke="#B9D9F2" stroke-width="1.4"/><rect x="${bx + 122}" y="132" width="12" height="10" rx="3" fill="#FFFFFF" stroke="#B9D9F2" stroke-width="1.4"/>`;
    const ts = tubes
      .map((t, i) => {
        const tx = bx + 42 + i * 52;
        return `<path d="M${tx} 58v96a12 12 0 0 0 24 0V58" fill="#FDF3E0" stroke="#B9A187" stroke-width="1.8"/>
        <path d="M${tx} 96v58a12 12 0 0 0 24 0V96z" fill="#F5D9A8" opacity=".9"/>
        ${t.capped ? `<rect x="${tx - 2}" y="48" width="28" height="12" rx="4" fill="#C9D4E0" stroke="#8C99A8" stroke-width="1.6"/>` : `<path d="M${tx - 3} 56h30" stroke="#B9A187" stroke-width="1.8"/>`}
        <text x="${tx + 12}" y="36" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${t.label}</text>`;
      })
      .join("");
    return `<path d="M${bx} 118h${bathW}v54a12 12 0 0 1 -12 12h-${bathW - 24}a12 12 0 0 1 -12 -12z" fill="${water}" stroke="${edge}" stroke-width="2"/>
      ${deco}${ts}
      <text x="${bx + bathW / 2}" y="204" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">${warm ? "따뜻한 물" : "얼음물"}</text>`;
  };
  const cold = o.tubes.filter((t) => !t.warm);
  const hot = o.tubes.filter((t) => t.warm);
  return `<svg viewBox="0 0 344 214" ${NS} fill="none" role="img" aria-label="탄산음료가 담긴 시험관 여러 개가 온도가 다른 두 수조에 담겨 있고, 시험관마다 마개 유무가 다르다">
    ${bath(10, false, cold)}
    ${bath(184, true, hot)}
  </svg>`;
}

/** SF 혼합 고체 분리 순서도(파라미터형 · 라이트) · 시작 상자·질문 2개·결과 3칸(㉮㉯㉰ 가림).
 *  geoRockFlowFig 문법 이식: 예/아니요가 각자의 결론 칸으로 갈라진다(수렴 금지). 결과 칸 이름을
 *  물으면 칸에 인쇄하지 않는다(가림판이 기본). */
export function chemSepFlowFig(o: { start: string; q1: string; q2: string }): string {
  const result = (x: number, y: number, label: string): string =>
    `<rect x="${x}" y="${y}" width="76" height="38" rx="10" fill="#F8FAFC" stroke="#B0B8C1" stroke-width="1.4" stroke-dasharray="5 4"/>
     <text x="${x + 38}" y="${y + 24}" text-anchor="middle" font-size="14.5" font-weight="800" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 252" ${NS} fill="none" role="img" aria-label="혼합물 분리 순서도. 시작 상자의 혼합물을 질문 두 개로 차례로 갈라 세 칸으로 나눈다">
    <rect x="72" y="10" width="200" height="34" rx="17" fill="#F2F4F6" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="172" y="31" text-anchor="middle" font-size="12" font-weight="800" fill="#333D4B">${o.start}</text>
    <line x1="172" y1="44" x2="172" y2="64" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M172 66 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <rect x="62" y="68" width="220" height="38" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="172" y="91" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1B64DA">${o.q1}</text>
    <line x1="62" y1="87" x2="34" y2="87" stroke="#8B95A1" stroke-width="1.8"/>
    <line x1="34" y1="87" x2="34" y2="104" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M34 106 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <text x="46" y="80" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0CA678">예</text>
    ${result(0, 108, "㉮")}
    <line x1="186" y1="106" x2="186" y2="130" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M186 132 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <text x="206" y="122" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8B95A1">아니요</text>
    <rect x="96" y="134" width="196" height="38" rx="12" fill="#EAF2FD" stroke="#5AA2F8" stroke-width="1.5"/>
    <text x="194" y="157" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1B64DA">${o.q2}</text>
    <line x1="96" y1="153" x2="34" y2="153" stroke="#8B95A1" stroke-width="1.8"/>
    <line x1="34" y1="153" x2="34" y2="196" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M34 198 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <text x="84" y="148" text-anchor="middle" font-size="10.5" font-weight="800" fill="#0CA678">예</text>
    ${result(0, 200, "㉰")}
    <line x1="172" y1="172" x2="172" y2="196" stroke="#8B95A1" stroke-width="1.8"/>
    <path d="M172 198 l-4.5 -7 h9 z" fill="#8B95A1"/>
    <text x="192" y="188" text-anchor="middle" font-size="10.5" font-weight="800" fill="#8B95A1">아니요</text>
    ${result(134, 200, "㉯")}
  </svg>`;
}

/** PM 입자 모형 상자(파라미터형 · 라이트) · 상자마다 입자 구성이 다르다(comp = 종류별 개수).
 *  종류 0 = 파란 원, 종류 1 = 주황 삼각형(이 단원 금지어 회피 · "입자 모형"으로만 서술).
 *  aria는 중립(어느 상자가 순물질인지 낭독 금지). */
export function chemPureMixFig(o: { boxes: { label: string; comp: number[] }[] }): string {
  const n = o.boxes.length;
  const bw = n === 4 ? 76 : 100;
  const gap = n === 4 ? 8 : 16;
  const x0 = (344 - n * bw - (n - 1) * gap) / 2;
  const shape = (kind: number, cx: number, cy: number): string =>
    kind === 0
      ? `<circle cx="${cx}" cy="${cy}" r="6.4" fill="#5AA2F8" stroke="#3A7DDB" stroke-width="1.2"/>`
      : `<path d="M${cx} ${cy - 7.4} L${cx + 6.8} ${cy + 4.8} L${cx - 6.8} ${cy + 4.8} z" fill="#F0A422" stroke="#D18708" stroke-width="1.2"/>`;
  const boxes = o.boxes
    .map((b, i) => {
      const bx = x0 + i * (bw + gap);
      const total = b.comp.reduce((a, c) => a + c, 0);
      const kinds: number[] = [];
      b.comp.forEach((cnt, k) => { for (let j = 0; j < cnt; j++) kinds.push(k); });
      const parts = kinds
        .map((k, j) => {
          const col = j % 3;
          const row = Math.floor(j / 3);
          const jit = ((i * 7 + j * 5) % 4) - 1.5;
          const cx = bw / 2 + (col - 1) * (bw / 3.4) + jit;
          const cy = 34 + row * 26 + (((j * 11 + i * 3) % 5) - 2);
          const kind = total > 6 && kinds.length > 0 ? kinds[(j * 5 + i) % kinds.length] : k;
          return shape(kind, cx, cy);
        })
        .join("");
      return `<g transform="translate(${bx},14)">
        <rect x="0" y="0" width="${bw}" height="112" rx="12" fill="#F8FAFC" stroke="#C4CAD2" stroke-width="1.6"/>
        ${parts}
        <text x="${bw / 2}" y="136" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${b.label}</text>
      </g>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 156" ${NS} fill="none" role="img" aria-label="상자마다 입자 배열 모형이 그려져 있다. 상자에 라벨이 붙어 있다">${boxes}</svg>`;
}

/** FT 거름 장치(라이트) · 깔때기 속 거름종이 위에 남은 고체 ㉠, 아래 그릇에 모인 거른 용액 ㉡.
 *  내용물의 이름은 인쇄하지 않는다(㉠㉡ 판정 과제). */
export function chemFilterFig(): string {
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="거름 장치. 깔때기에 거름종이가 접혀 있고 위에 고체가 남아 있으며, 아래 그릇에 거른 용액이 모여 있다">
    <path d="M118 34h108l-40 62v34h-28v-34z" fill="rgba(224,238,250,.35)" stroke="#9DAABD" stroke-width="2.2"/>
    <path d="M128 40h88l-33 50h-22z" fill="#FFFFFF" stroke="#C9CFD8" stroke-width="1.6"/>
    <path d="M150 52l8 -9 7 9 8 -8 7 8 8 -9 7 9" stroke="#B08D3E" stroke-width="0" fill="none"/>
    ${[152, 166, 180, 194].map((x, i) => `<rect x="${x}" y="${46 + (i % 2) * 6}" width="9" height="9" rx="2" transform="rotate(45 ${x + 4} ${50 + (i % 2) * 6})" fill="#CBB3E8" stroke="#9A7BC8" stroke-width="1.2"/>`).join("")}
    <path d="M172 130v26" stroke="#9DAABD" stroke-width="3"/>
    <path d="M132 158h80v36a10 10 0 0 1 -10 10h-60a10 10 0 0 1 -10 -10z" fill="rgba(224,238,250,.4)" stroke="#9DAABD" stroke-width="2"/>
    <path d="M136 178h72v16a10 10 0 0 1 -10 10h-52a10 10 0 0 1 -10 -10z" fill="#EAE2F6" opacity=".85"/>
    <text x="258" y="52" font-size="13.5" font-weight="800" fill="#4E5968">㉠</text>
    <path d="M252 50h-42" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="258" y="192" font-size="13.5" font-weight="800" fill="#4E5968">㉡</text>
    <path d="M252 188h-40" stroke="#C4CAD2" stroke-width="1.4"/>
    <text x="104" y="46" text-anchor="end" font-size="11" fill="#8B95A1">거름종이</text>
    <path d="M108 42h22" stroke="#C4CAD2" stroke-width="1.3"/>
  </svg>`;
}

/** MB 물·혼합물 가열 곡선 쌍(파라미터형 · 라이트 · 눈금 포함) · (가) 순물질은 plat 온도에서 수평,
 *  (나) 혼합물은 mixStart(>plat)에서 끓기 시작해 계속 오른다. 라벨은 (가)(나) 중립(이름 인쇄 금지).
 *  값 읽기 문항은 mixStart를 눈금선 위에 둔다. */
export function chemMixBoilFig(o: { plat: number; mixStart: number; yMin: number; yMax: number; yStep: number }): string {
  const gy = (c: number): number => 168 - ((c - o.yMin) / (o.yMax - o.yMin)) * 146;
  let yt = "";
  for (let T = o.yMin; T <= o.yMax; T += o.yStep) {
    yt += `<line x1="50" y1="${gy(T)}" x2="322" y2="${gy(T)}" stroke="#EDF0F4"/><text x="42" y="${gy(T) + 4}" text-anchor="end" font-size="10" fill="#8B95A1">${T}</text>`;
  }
  const s = o.yMin + (o.yMax - o.yMin) * 0.08;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="두 액체의 가열 곡선. 곡선에 가와 나 라벨이 붙어 있고 세로축 눈금으로 온도를 읽는다">
    ${yt}
    <line x1="50" y1="12" x2="50" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="50" y1="168" x2="322" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <path d="M56 ${gy(s)} C120 ${gy(o.plat - 8)} 148 ${gy(o.plat - 1)} 168 ${gy(o.plat)} L318 ${gy(o.plat)}" stroke="#5E6B7E" stroke-width="2.8" fill="none"/>
    <path d="M56 ${gy(s)} C124 ${gy(o.mixStart - 9)} 156 ${gy(o.mixStart - 1)} 180 ${gy(o.mixStart)} C230 ${gy(o.mixStart + 3)} 280 ${gy(o.mixStart + 5)} 318 ${gy(o.mixStart + 7)}" stroke="#5E6B7E" stroke-width="2.8" fill="none" stroke-dasharray="7 5"/>
    <text x="300" y="${gy(o.plat) + 17}" font-size="12" font-weight="700" fill="#4E5968">(가)</text>
    <text x="296" y="${gy(o.mixStart + 7) - 9}" font-size="12" font-weight="700" fill="#4E5968">(나)</text>
    <text x="14" y="12" font-size="10.5" fill="#4E5968">온도(℃)</text>
    <text x="322" y="192" text-anchor="end" font-size="11" fill="#4E5968">가열 시간(분)</text>
  </svg>`;
}

/** 액체 (가)~(라) 가열 곡선 파라미터판 · chemBoilCurvesFig(고정 58/82)의 확장.
 *  (가)·(다)는 t2에서 평평(다는 기울기 완만+구간 김 = 양 많음 세트), (나)는 t1, (라)는 계속 상승.
 *  이식 때 chemBoilCurvesFig에 {t1,t2} 옵션으로 통합한다(기본값 = 현행 58/82 렌더 무영향). */
export function chemBoilCurvesParamFig(o: { t1: number; t2: number }): string {
  const top = o.t2 + 28;
  const gy = (c: number): number => 168 - (c / top) * 146;
  const seg = (x0: number, tempo: number, plateau: number, label: string, lx: number, plen: number): string => {
    const pY = gy(plateau);
    return `<path d="M${x0} ${gy(16)} L${x0 + 40 * tempo} ${pY} L${x0 + 40 * tempo + plen} ${pY}" stroke="#5E6B7E" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <text x="${lx}" y="${pY - 8}" font-size="12" font-weight="700" fill="#4E5968">${label}</text>`;
  };
  const rTop = o.t2 * 0.9;
  const riser = (x0: number, label: string): string =>
    `<path d="M${x0} ${gy(16)} L${x0 + 44} ${gy(rTop * 0.72)} C${x0 + 66} ${gy(rTop * 0.86)} ${x0 + 88} ${gy(rTop * 0.94)} ${x0 + 108} ${gy(rTop)}" stroke="#5E6B7E" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <text x="${x0 + 96}" y="${gy(rTop) - 9}" font-size="12" font-weight="700" fill="#4E5968">${label}</text>`;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="서로 다른 비커에 담긴 액체 네 개를 각각 가열한 시간-온도 그래프">
    <line x1="46" y1="12" x2="46" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="46" y1="168" x2="330" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    ${[o.t1, o.t2].map((c) => `<line x1="46" y1="${gy(c)}" x2="326" y2="${gy(c)}" stroke="#EDF0F4"/><text x="38" y="${gy(c) + 4}" text-anchor="end" font-size="10" fill="#8B95A1">${c}</text>`).join("")}
    ${seg(52, 1.15, o.t2, "(가)", 100, 46)}
    ${seg(92, 1.5, o.t1, "(나)", 158, 54)}
    ${seg(128, 1.75, o.t2, "(다)", 226, 88)}
    ${riser(200, "(라)")}
    <text x="12" y="12" font-size="10.5" fill="#4E5968">온도(℃)</text>
    <text x="330" y="188" text-anchor="end" font-size="11" fill="#4E5968">가열 시간(분)</text>
  </svg>`;
}
// ── g2u1 v2 신작 끝 ──

// ── u6 v2 신작(스테이징 승격 · 재출제 5호) ──
// 기체 단원 문법: 입자 운동 = 블러 꼬리(gasTailP 계보 · 화살표 잔상 금지) · 꼬리 세기 2단만 ·
// 밀폐 비교 문항은 입자 수 동일(주입 슬롯 BALL2만 차등 허용) · 그래프 dots는 점만(가이드 점선
// 금지) · 상태 표현(부풂·찌그러짐)은 실루엣 한 덩어리(윤곽 밖 덧선 금지 · 함몰 제어점은 안쪽) ·
// 장면 SVG도 파운드리 재질 문법(3스톱 그라데이션 · 키라이트 · 접촉 그림자 · 최암색 윤곽).
// ── (pilot 저작분) ──


/* 기체 입자 파츠(라이트) · 운동 표시 = 날아가는 방향 반대쪽 블러 꼬리(원뿔 잔상+페이드 원).
 * u4 v2에서 사용자 검수로 확정한 교과서 기체 문법의 라이트 팔레트판 · 화살표·직선 잔상 금지.
 * 꼬리 세기는 2단만(1 짧음 9.5 · 2 김 17) · 3단 구분은 판독 곤란(u3 검수 계보). */
export const g6dot = (x: number, y: number, r = 5): string =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#7FB8F2" stroke="#4E86C4" stroke-width="1.3"/>`;
const g6tail = (x: number, y: number, ang: number, len: number, r = 5): string => {
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const px = -dy;
  const py = dx;
  const w = r * 0.82;
  const tx = x - dx * len;
  const ty = y - dy * len;
  return `<path d="M${(x - px * w).toFixed(1)} ${(y - py * w).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} L${(x + px * w).toFixed(1)} ${(y + py * w).toFixed(1)} Z" fill="#6FA3E0" opacity=".5"/>
    <circle cx="${(x - dx * len * 0.6).toFixed(1)}" cy="${(y - dy * len * 0.6).toFixed(1)}" r="${(r * 0.55).toFixed(1)}" fill="#6FA3E0" opacity=".26"/>`;
};
export const g6part = (x: number, y: number, ang: number, tail: 1 | 2, r = 5): string =>
  g6tail(x, y, ang, tail === 2 ? 20 : 11, r) + g6dot(x, y, r);

/* 입자 배치 프리셋(상자 내부 fraction 좌표) · 해시 산포의 겹침 사고 방지용 고정 좌표. */
export const PSET: Record<number, [number, number][]> = {
  3: [[0.28, 0.3], [0.7, 0.42], [0.42, 0.74]],
  4: [[0.25, 0.25], [0.72, 0.3], [0.3, 0.72], [0.7, 0.75]],
  6: [[0.22, 0.22], [0.66, 0.18], [0.82, 0.52], [0.3, 0.55], [0.6, 0.8], [0.18, 0.84]],
  8: [[0.2, 0.2], [0.55, 0.14], [0.85, 0.28], [0.3, 0.45], [0.68, 0.5], [0.16, 0.68], [0.5, 0.82], [0.84, 0.78]],
  9: [[0.18, 0.18], [0.5, 0.14], [0.82, 0.2], [0.24, 0.46], [0.56, 0.44], [0.86, 0.5], [0.2, 0.78], [0.52, 0.8], [0.82, 0.78]],
  12: [[0.15, 0.15], [0.44, 0.12], [0.74, 0.17], [0.9, 0.38], [0.28, 0.34], [0.58, 0.36], [0.13, 0.52], [0.42, 0.56], [0.72, 0.58], [0.24, 0.8], [0.54, 0.84], [0.85, 0.8]],
};

/** GP 밀폐 상자 입자 모형(파라미터형 · 라이트) · w 상자 폭 · count 입자 수 · tail 꼬리 세기(1/2).
 *  밀폐 비교 문항은 count 동일 의무(설계표 §5 · 주입 문항만 차등 허용). aria 중립(개수·순서 낭독 금지). */
export function gasBoxesExamFig(boxes: { label: string; w: number; count: 3 | 4 | 6 | 8 | 9 | 12; tail: 1 | 2 }[]): string {
  const H = 118;
  const top = 26;
  const gap = 16;
  const totalW = boxes.reduce((s, b) => s + b.w, 0) + gap * (boxes.length - 1);
  let x = (344 - totalW) / 2;
  let out = "";
  boxes.forEach((b, bi) => {
    const pts = PSET[b.count]
      .map(([fx, fy], i) => g6part(x + 13 + fx * (b.w - 26), top + 12 + fy * (H - 24), ((i * 137 + bi * 53 + 40) % 360) * (Math.PI / 180), b.tail, b.w < 70 ? 4.2 : 5))
      .join("");
    out += `<rect x="${x}" y="${top}" width="${b.w}" height="${H}" rx="10" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2.2"/>${pts}
      <text x="${x + b.w / 2}" y="${top + H + 20}" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${b.label}</text>`;
    x += b.w + gap;
  });
  return `<svg viewBox="0 0 344 188" ${NS} fill="none" role="img" aria-label="밀폐 상자 ${boxes.length}개의 기체 입자 모형">${out}</svg>`;
}

/** GMC 압축 후 입자 모형 고르기 ①~⑤(라이트 · shuffle:false 전용) · 기준 (가) = 넓은 상자 · 입자 6.
 *  정답 ③ = 부피 절반 · 입자 6 · 크기 그대로(간격만 좁음). ① 개수 감소 · ② 크기 축소 · ④ 부피
 *  그대로 · ⑤ 개수 증가 함정. 정답을 ①에 두지 않는 라벨형 그림 설계(EXAM_GUIDE u6 관행). */
export function gasShrinkChoicesFig(): string {
  const mini = (x: number, y: number, no: string, w: number, count: 3 | 6 | 9, r: number): string => {
    const bx = x + (96 - w) / 2;
    const pts = PSET[count].map(([fx, fy]) => g6dot(bx + 8 + fx * (w - 16), y + 20 + fy * 46, r)).join("");
    return `<text x="${x + 48}" y="${y + 10}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${no}</text>
      <rect x="${bx}" y="${y + 14}" width="${w}" height="58" rx="7" fill="#F7FAFE" stroke="#8B95A1" stroke-width="1.8"/>${pts}`;
  };
  const base = PSET[6].map(([fx, fy], i) => g6part(124 + 10 + fx * 76, 30 + 8 + fy * 44, ((i * 137 + 40) % 360) * (Math.PI / 180), 1, 4.2)).join("");
  return `<svg viewBox="0 0 344 268" ${NS} fill="none" role="img" aria-label="기준 입자 모형 한 개와 보기 모형 다섯 개">
    <text x="172" y="18" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">(가) 누르기 전</text>
    <rect x="124" y="26" width="96" height="60" rx="8" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2"/>${base}
    ${mini(14, 100, "①", 48, 3, 4.2)}
    ${mini(124, 100, "②", 48, 6, 2.5)}
    ${mini(234, 100, "③", 48, 6, 4.2)}
    ${mini(66, 186, "④", 96, 6, 4.2)}
    ${mini(180, 186, "⑤", 48, 9, 4.2)}
  </svg>`;
}

/** SY 끝 막은 주사기 (가)(나) 2컷(파라미터형 · 라이트) · mode push(나 = 누름) / pull(나 = 당김).
 *  입자 6개 동일 · 꼬리 짧음 동일(온도 일정) · 눈금 없음(판정용 중립) · 붉은 화살표 = 조작 방향. */
export function gasSyringeExamFig(mode: "push" | "pull"): string {
  const syr = (y: number, label: string, plungerX: number, arrow?: "in" | "out"): string => {
    const bodyX = 74;
    const bodyW = 212;
    const pts = PSET[6]
      .map(([fx, fy], i) => g6part(plungerX + 14 + fx * (bodyX + bodyW - plungerX - 26), y + 9 + fy * 34, ((i * 137 + 20) % 360) * (Math.PI / 180), 1, 4.6))
      .join("");
    const ar = arrow
      ? arrow === "in"
        ? `<path d="M${plungerX - 88} ${y + 26} h30 m0 0 l-9 -6 m9 6 l-9 6" stroke="#F25757" stroke-width="3" fill="none" stroke-linecap="round"/>`
        : `<path d="M${plungerX - 22} ${y - 6} h-30 m0 0 l9 -6 m-9 6 l9 6" stroke="#F25757" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : "";
    return `<g>
      <rect x="${bodyX}" y="${y}" width="${bodyW}" height="52" rx="10" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2.2"/>
      <path d="M${bodyX + bodyW} ${y + 18} h16 v16 h-16" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2.2"/>
      <rect x="${bodyX + bodyW + 16}" y="${y + 21}" width="11" height="10" rx="2" fill="#8B99AC"/>
      <rect x="${plungerX}" y="${y + 4}" width="10" height="44" rx="3" fill="#8B99AC"/>
      <path d="M${plungerX} ${y + 26} h-38" stroke="#8B99AC" stroke-width="6"/>
      <rect x="${plungerX - 50}" y="${y + 14}" width="12" height="24" rx="3" fill="#8B99AC"/>
      ${pts}${ar}
      <text x="8" y="${y + 32}" font-size="13" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  const nb = mode === "push" ? 172 : 92;
  return `<svg viewBox="0 0 344 172" ${NS} fill="none" role="img" aria-label="끝을 막은 주사기 두 개. 가는 조작 전이고 나는 피스톤을 ${mode === "push" ? "누른" : "당긴"} 뒤다">
    ${syr(14, "(가)", 128)}
    ${syr(102, "(나)", nb, mode === "push" ? "in" : "out")}
  </svg>`;
}

/** SHOE 눈 단면 신발 대비(고정형 · 라이트) · (가) 바닥 넓은 겨울 부츠(얕게 눌림) ·
 *  (나) 굽 좁은 구두(굽만 깊이 박힘 · 앞코는 표면). 몸무게 같음 조건은 문두 몫 · 그림은 박힌
 *  깊이 대비가 판독 재료. 파운드리 재질 문법(파일럿 검수 반영 재작도): 3스톱 그라데이션 면 ·
 *  키라이트 · 접촉 그림자 · 재질별 최암색 윤곽. 부츠 = 옆모습 실루엣(발목통+털 밴드+발등+넓은
 *  밑창 트레드), 구두 = 펌프스 실루엣(토·발등 라인·힐 카운터+가는 굽). */
export function snowBootsFig(): string {
  return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="눈 단면 위 신발 두 켤레의 옆모습. 왼쪽은 바닥이 넓은 겨울 부츠가 눈에 얕게 눌려 있고, 오른쪽은 굽이 가는 구두의 굽이 눈 속 깊이 박혀 있다">
    <defs>
      <linearGradient id="u6sbBoot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E7B77C"/><stop offset=".55" stop-color="#CD9350"/><stop offset="1" stop-color="#AA7132"/>
      </linearGradient>
      <linearGradient id="u6sbShoe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#D96F84"/><stop offset=".5" stop-color="#B84A62"/><stop offset="1" stop-color="#8E3046"/>
      </linearGradient>
      <linearGradient id="u6sbSnow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#D9E5F3"/>
      </linearGradient>
    </defs>
    <path d="M8 112 H54 q4 0 6 3 q3 5 10 5 H140 q7 0 10 -5 q2 -3 6 -3 H243 q4 0 5 5 l3 26 q1 4 5 4 h8 q4 0 5 -4 l3 -26 q1 -5 5 -5 H336 V170 H8 Z" fill="url(#u6sbSnow)"/>
    <path d="M8 112 H54 q4 0 6 3 q3 5 10 5 H140 q7 0 10 -5 q2 -3 6 -3 H243 q4 0 5 5 l3 26 q1 4 5 4 h8 q4 0 5 -4 l3 -26 q1 -5 5 -5 H336" stroke="#B9C8DB" stroke-width="2" fill="none"/>
    <ellipse cx="104" cy="118" rx="52" ry="6" fill="#2A3A5E" opacity=".10"/>
    <ellipse cx="262" cy="142" rx="10" ry="4" fill="#2A3A5E" opacity=".12"/>
    <g>
      <path d="M78 46 q-1 40 -8 54 q-3 6 2 6 h66 q6 0 5 -6 q-2 -14 -12 -20 q-9 -6 -22 -8 l-2 -26 z" fill="url(#u6sbBoot)" stroke="#6E4A22" stroke-width="1.6"/>
      <path d="M83 52 q-1 30 -5 44" stroke="#F3DBB6" stroke-width="2.4" opacity=".7" fill="none"/>
      <path d="M109 76 q12 3 19 9" stroke="#8A5C2A" stroke-width="1.6" fill="none"/>
      <rect x="72" y="32" width="42" height="17" rx="8" fill="#F6EFE3" stroke="#C9B99B" stroke-width="1.4"/>
      <path d="M78 49 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0" stroke="#DDD0B8" stroke-width="1.4" fill="none"/>
      <path d="M60 106 q0 -6 7 -6 h74 q7 0 7 6 l0 6 q0 5 -7 5 h-74 q-7 0 -7 -5 z" fill="#4C5B72" stroke="#334052" stroke-width="1.5"/>
      <path d="M66 117 v-5 M78 117 v-5 M90 117 v-5 M102 117 v-5 M114 117 v-5 M126 117 v-5 M138 117 v-5" stroke="#334052" stroke-width="2.4"/>
      <text x="104" y="164" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    </g>
    <g transform="translate(263,138) rotate(-10) scale(0.22) translate(-511,-380)">
      <path d="m490 363.2v-1.4141l4.92 2.5605c0.2429 0.1265 0.5242 0.1239 0.7871 0.1934-0.5271-8.4215-1.0777-16.842-1.6563-25.26-0.5931-8.6304-1.2142-17.258-1.9375-25.879-0.8883-10.588-1.9321-21.165-3.2539-31.707-1.2839-10.24-2.8299-20.448-4.7305-30.592-0.3092-1.6502-0.6284-3.302-1-4.9394-0.3714-1.6369-0.7957-3.2613-1.3144-4.8575-1.0195-3.1372-2.4157-6.1753-4.3789-8.8261-2.0718-2.7975-4.767-5.1332-7.8457-6.7579-3.0413-1.6048-6.4393-2.5093-9.8711-2.7265-1.4333-0.091-2.8723-0.064-4.3027 0.064-1.4298 0.1287-2.8531 0.3585-4.254 0.6719-1.6786 0.3756-3.334 0.8726-4.914 1.5527-1.2245 0.5271-2.3434 1.2584-3.4551 1.9942-3.0681 2.2735-6.1302 4.5573-9.1211 6.9316-6.7174 5.3326-13.281 10.857-19.726 16.516-8.7998 7.7256-17.381 15.707-25.527 24.119-8.5318 8.8103-16.576 18.082-24.473 27.465-9.511 11.301-18.829 22.785-29.049 33.449-5.9153 6.1726-12.12 12.058-18.309 17.957-4.6715 4.4531-9.3558 8.9343-14.613 12.678-5.258 3.7439-11.042 6.7124-17.049 9.0762-6.1849 2.434-12.62 4.2348-19.172 5.3535-9.8061 1.6743-19.806 1.8161-29.754 1.7422-9.5534-0.071-19.109-0.3366-28.631-1.1191-12.426-1.0213-24.762-2.9178-37.098-4.7305-16.228-2.3847-32.491-4.6284-48.551-7.9668-11.482-2.3869-22.845-5.3318-34.111-8.5879-9.6632-2.7927-19.26-5.8161-28.967-8.4531-11.848-3.2188-23.956-5.8956-35.02-11.219-3.2671-1.5719-6.4473-3.3821-9.2129-5.7265-0.76804-0.6511-1.4946-1.3569-2.1543-2.1172-0.46573 0.6605-0.99244 1.5427-1.209 2.1894-0.37225 1.1119-0.43371 2.3068-0.35352 3.4766 0.0456 0.665 0.14104 1.3425 0.44141 1.9375 0.34269 0.6788 0.92563 1.1995 1.5137 1.6816 1.0988 0.901 2.2592 1.7266 3.4512 2.5 4.8223 3.129 10.139 5.4124 15.49 7.5117 9.8619 3.8689 19.944 7.1645 30.127 10.084 14.999 4.3001 30.225 7.7872 45.562 10.654 21.626 4.0428 43.463 6.8515 65.297 9.5567 17.5 2.1682 35.025 4.2724 52.639 5.1054 10.086 0.477 20.191 0.5361 30.281 0.1758 11.946-0.4265 24.068-1.4839 35.211-5.8086 7.9618-3.09 15.232-7.7847 21.832-13.205 11.782-9.676 21.463-21.616 30.984-33.523 12.499-15.63 24.888-31.372 38.379-46.154 8.349-9.1478 17.106-17.912 25.893-26.641 3.9109-3.885 7.8822-7.7121 11.93-11.453 2.6165-2.4184 5.2354-4.833 7.9883-7.0957 6.0783-4.9961 12.584-9.5277 19.67-12.947 2.9307-1.4143 5.9923-2.6468 9.2128-3.1133 0.5449-0.079 1.0975-0.032 1.6465-0.066 2.3297-0.148 4.6791-0.01 6.9434 0.5645 1.271 0.3225 2.493 0.8249 3.6836 1.3789 1.6564 0.7707 3.2229 1.707 4.5312 2.9785 2.4902 2.42 4.0236 5.6633 5.1055 8.9629 2.1185 6.4608 2.6871 13.306 3.6094 20.043 1.1504 8.4027 2.869 16.724 3.8593 25.146 0.8703 7.402 1.1752 14.857 1.6192 22.297 0.2497 4.1837 0.5254 8.3657 0.8164 12.547 0.3323 4.7747 0.6789 9.5487 0.9336 14.328 0.462 8.668 0.6803 18.763 0.6562 27.443z" fill="#4E3A44"/>
      <path d="m476.84 64.248c-8.0651 6.3047-16.547 12.716-24.475 18.914-9.5888 7.496-19.21 14.953-28.633 22.656-12.441 10.17-24.531 20.762-36.6 31.371-11.893 10.455-23.774 20.934-36.102 30.873-16.197 13.058-33.151 25.172-49.049 38.592-8.3924 7.0842-16.531 14.561-25.822 20.416-4.6905 2.9557-9.6423 5.4765-14.676 7.8007-7.3135 3.3771-14.809 6.3479-22.359 9.1563-6.0896 2.2651-12.223 4.427-18.484 6.1602-7.1597 1.9817-14.472 3.3967-21.832 4.4023-7.4727 1.021-14.998 1.6211-22.533 1.9355-2.6412 0.1103-5.2856 0.1867-7.9238 0.3536-3.0308 0.1916-6.0778 0.509-8.9785 1.4082-1.2964 0.4018-2.5658 0.9223-3.6973 1.6718-0.38956 0.2581-0.87987 0.6595-1.2676 0.9981-0.12563 0.8144-0.0761 1.6632 0.21094 2.4355 0.29501 0.7936 0.82836 1.4833 1.4531 2.0547s1.3416 1.0325 2.0684 1.4668c2.8894 1.7265 5.9944 3.0651 9.1543 4.2246 4.5765 1.6794 9.2913 2.9919 14.086 3.8731 4.9373 0.9074 9.9501 1.3555 14.965 1.584 5.6315 0.2565 11.278 0.2366 16.9-0.1758 7.4293-0.5451 14.808-1.7766 22.006-3.6973 6.5311-1.7428 12.901-4.0481 19.176-6.5625 6.9667-2.7918 13.837-5.8488 20.416-9.4609 7.615-4.181 14.814-9.0937 21.66-14.441 5.9884-4.6778 11.709-9.6881 17.43-14.69 7.6511-6.6889 15.331-13.386 22.158-20.914 5.1477-5.6757 9.7822-11.793 14.689-17.678 7.074-8.483 14.71-16.477 22.408-24.398 10.592-10.899 21.312-21.673 32.131-32.346 16.34-16.119 32.905-32.011 49.648-47.711 7.2516-6.7997 14.538-13.562 21.871-20.273z" fill="#A83A52"/>
      <path d="m544.61 10.867c-0.4794-0.0545-0.9699-0.0288-1.4433 0.0645-0.9136 0.17995-1.7666 0.5964-2.545 1.1074-0.7352 1.6051-1.6563 3.1264-2.7382 4.5215-1.5495 1.9979-3.4177 3.7273-5.3536 5.3535-3.0572 2.5683-6.3023 4.901-9.4609 7.3438-4.8505 3.7512-9.4955 7.76-14.191 11.703-6.3841 5.3607-12.867 10.605-19.172 16.059-15.414 13.331-29.734 27.873-44.816 41.578-9.0449 8.2189-18.367 16.14-27.139 24.65-6.0654 5.8844-11.859 12.043-17.926 17.926-5.1131 4.9585-10.419 9.7195-15.438 14.773-6.3948 6.4395-12.307 13.336-18.332 20.123-5.6043 6.3125-11.312 12.536-16.725 19.014-5.206 6.2297-10.148 12.701-15.846 18.484-3.3225 3.3724-6.8875 6.495-10.389 9.6817-4.4551 4.0549-8.813 8.2204-13.379 12.15-5.5531 4.7797-11.405 9.2037-17.426 13.379-3.9735 2.7555-8.0225 5.4036-12.15 7.9218-8.9954 5.4875-18.379 10.363-28.168 14.262-10.892 4.3376-22.313 7.4641-33.979 8.627-6.4851 0.6465-13.022 0.6856-19.529 0.3223-6.4292-0.359-12.85-1.1126-19.127-2.5469-6.7318-1.5381-13.271-3.8533-19.598-6.6211-2.4541-1.0737-4.9366-2.2581-6.7988-4.1836-1.1304-1.1688-2.0125-2.6223-2.2891-4.2246-0.11789-0.6829-0.12328-1.3929 0.0625-2.0606 0.16815-0.6042 0.34827-1.0346 0.61719-1.3945 0.077-0.1514 0.10293-0.2751 0.1875-0.4239-3.7824 1.8141-7.6069 3.5374-11.504 5.0898-11.65 4.6412-23.74 8.0834-35.854 11.328-11.501 3.0805-23.047 5.9896-34.607 8.8378-9.2355 2.2754-18.505 4.5192-27.428 7.8145-8.9079 3.2899-17.553 7.7051-24.461 14.221-2.5321 2.3884-4.8364 5.0813-6.3477 8.2168-1.4147 2.9351-2.0977 6.2027-2.1172 9.4609-0.0144 2.3996 0.34298 4.8526 1.4707 6.9707 0.90444 1.6988 2.2664 3.1131 3.7344 4.3576 2.7656 2.3443 5.9458 4.1546 9.2129 5.7265 11.064 5.3232 23.171 8 35.02 11.219 9.7068 2.637 19.304 5.6604 28.967 8.4531 11.266 3.2561 22.629 6.201 34.111 8.5879 16.059 3.3384 32.322 5.5821 48.551 7.9667 12.336 1.8127 24.671 3.7093 37.098 4.7305 9.5216 0.7825 19.077 1.0481 28.631 1.1191 9.9478 0.074 19.948-0.068 29.754-1.7422 6.5518-1.1187 12.987-2.9195 19.172-5.3535 6.0064-2.3638 11.791-5.3323 17.049-9.0762 5.2575-3.7434 9.9418-8.2246 14.613-12.678 6.1883-5.8989 12.393-11.784 18.309-17.957 10.22-10.664 19.538-22.148 29.049-33.449 7.897-9.3833 15.941-18.654 24.473-27.465 8.1461-8.412 16.728-16.393 25.527-24.119 6.4452-5.6586 13.009-11.183 19.726-16.516 2.9935-2.3763 6.0581-4.6622 9.1289-6.9375 0.955-0.7076 1.8754-1.4616 2.8399-2.1562 6.5073-4.6864 13.24-9.0577 20.166-13.1 9.5568-5.5772 19.471-10.521 29.504-15.188 12.145-5.6484 24.473-10.894 36.725-16.309 10.217-4.5152 20.381-9.1486 30.588-13.686 4.6971-2.0879 9.4387-4.1737 13.644-7.1289 1.486-1.0441 2.898-2.1932 4.2246-3.4336 1.4606-1.3655 2.8204-2.848 3.961-4.4902 1.1489-1.6542 2.0696-3.4659 2.7285-5.3691 1.3044-3.768 1.5647-7.8091 1.6738-11.795 0.131-4.7836 0.063-9.5753-0.2637-14.35-0.4774-6.981-1.5074-13.917-2.9062-20.773-1.5199-7.4496-3.475-14.805-5.6328-22.096-2.0809-7.0305-4.3523-14.007-6.9551-20.861-2.5474-6.7086-5.4192-13.312-8.9785-19.543-2.8024-4.906-6.0179-9.5603-9.1543-14.26-2.281-3.4176-4.532-6.8762-7.2617-9.9473-0.5071-0.57047-1.0435-1.1367-1.7168-1.4961-0.4257-0.22719-0.8936-0.36148-1.3731-0.41602z" fill="#D6506A" stroke="#5E1F30" stroke-width="5"/>
      <path d="m159.55 254.42c-1.8113 0.9374-3.3498 2.4083-4.3184 4.2031-0.39284 0.7281-0.69472 1.5128-0.82227 2.3301-5e-4 0 5e-4 0.01 0 0.01 0.38771-0.3386 0.87802-0.74 1.2676-0.9981 1.1315-0.7495 2.4009-1.27 3.6973-1.6718 2.9007-0.8992 5.9477-1.2166 8.9785-1.4082 2.6382-0.1669 5.2826-0.2433 7.9238-0.3536 7.5355-0.3144 15.061-0.9145 22.533-1.9355 7.3605-1.0056 14.672-2.4206 21.832-4.4023 6.2618-1.7332 12.395-3.8951 18.484-6.1602 7.5501-2.8084 15.046-5.7792 22.359-9.1563 5.0334-2.3242 9.9852-4.845 14.676-7.8007 9.2917-5.8553 17.43-13.332 25.822-20.416 15.898-13.42 32.852-25.534 49.049-38.592 12.328-9.939 24.208-20.418 36.102-30.873 12.069-10.61 24.158-21.201 36.6-31.371 9.4232-7.7031 19.044-15.16 28.633-22.656 7.9297-6.199 16.414-12.612 24.48-18.918 7.558-6.917 15.164-13.78 22.84-20.566 5.9969-5.3025 12.043-10.568 18.486-15.318-22.505 15.689-44.527 32.072-66.022 49.119-19.864 15.754-39.272 32.072-58.801 48.24-17.814 14.749-35.732 29.377-53.346 44.365-13.866 11.8-27.551 23.828-41.9 35.035-13.786 10.767-28.229 20.798-43.838 28.695-7.4104 3.7496-15.086 7.0177-23.062 9.332-6.0723 1.762-12.291 2.9639-18.486 4.2246-6.3742 1.297-12.742 2.6596-19.189 3.5215-4.8792 0.6523-9.7948 1.0164-14.715 1.1758-4.5507 0.1475-9.1209 0.1203-13.629 0.7598-1.9408 0.2753-3.8938 0.6849-5.6348 1.5859z" fill="#CE4458"/>
      <path d="m580.49 156.26c-1.3266 1.2404-2.7386 2.3895-4.2246 3.4336-4.2058 2.9552-8.9474 5.041-13.644 7.1289-10.207 4.537-20.371 9.1704-30.588 13.686-12.251 5.4144-24.579 10.66-36.725 16.309-10.033 4.6661-19.947 9.6103-29.504 15.188-6.9261 4.0419-13.659 8.4132-20.166 13.1-0.9645 0.6946-1.8849 1.4486-2.8399 2.1562 1.1093-0.7335 2.2258-1.4624 3.4473-1.9883 1.58-0.6801 3.2354-1.1771 4.914-1.5527 2.8031-0.6271 5.6901-0.9178 8.5567-0.7363 3.4318 0.2172 6.8298 1.1217 9.8711 2.7265 3.0787 1.6247 5.7739 3.9604 7.8457 6.7579 1.9632 2.6508 3.3594 5.6889 4.3789 8.8261 1.0378 3.1935 1.696 6.4964 2.3144 9.7969 1.9006 10.144 3.4466 20.352 4.7305 30.592 1.3218 10.542 2.3656 21.119 3.2539 31.707 0.7233 8.6206 1.3444 17.248 1.9375 25.879 0.5786 8.4181 1.1292 16.838 1.6563 25.26 0.3071 0.081 0.5999 0.2246 0.9199 0.2246h15.742c0.326 0 0.5837-0.2639 0.584-0.5898 5e-4 -0.6167 0.011-1.8708 0.051-4.4141 0.075-4.753 0.7171-15.909 1.0156-23.512s0.4802-15.595 1.2383-22.098c0.758-6.5025 1.4375-9.138 3.0058-16.883 1.5683-7.7449 3.7783-20.448 6.7051-29.512s6.28-15.77 10.5-24.75 10.11-20.047 15-29 9.5457-17.005 14.25-24.75c4.7044-7.7451 11.247-16.923 13.914-21.742 2.6673-4.819 2.6884-4.5396 3.3574-6.0976 0.669-1.5581 1.1025-3.0019 1.1269-3.6914 0.012-0.3448 0.1407-1.1421-0.7578-1.5704-0.8984-0.4283-1.8672 0.1172-1.8672 0.1172z" fill="#B0405A"/>
      <path d="m151.52 258.46c-0.36284 0.6387-0.66898 1.3307-0.80469 1.8183-0.18578 0.6677-0.18039 1.3777-0.0625 2.0606 0.27659 1.6023 1.1587 3.0558 2.2891 4.2246 1.8622 1.9255 4.3447 3.1099 6.7988 4.1836 6.3264 2.7678 12.866 5.083 19.598 6.6211 6.2774 1.4343 12.698 2.1879 19.127 2.5469 6.5071 0.3633 13.044 0.3242 19.529-0.3223 11.666-1.1629 23.087-4.2894 33.979-8.627 9.7893-3.8985 19.173-8.7742 28.168-14.262 4.1279-2.5182 8.1769-5.1663 12.15-7.9218 6.0208-4.1753 11.873-8.5993 17.426-13.379 4.5659-3.9299 8.9238-8.0954 13.379-12.15 3.5012-3.1867 7.0662-6.3093 10.389-9.6817 5.6978-5.7833 10.64-12.255 15.846-18.484 5.413-6.4774 11.12-12.701 16.725-19.014 6.0252-6.7866 11.937-13.684 18.332-20.123 5.0188-5.0539 10.324-9.8149 15.438-14.773 6.0666-5.8832 11.86-12.041 17.926-17.926 8.7718-8.5099 18.094-16.432 27.139-24.65 15.083-13.705 29.402-28.247 44.816-41.578 6.3052-5.4533 12.788-10.698 19.172-16.059 4.6959-3.9431 9.3409-7.9519 14.191-11.703 3.1586-2.4427 6.4037-4.7754 9.4609-7.3438 1.9359-1.6263 3.8041-3.3556 5.3536-5.3535 1.0819-1.3951 2.003-2.9164 2.7382-4.5215-0.7784 0.51102-1.4903 1.1169-2.2089 1.709-6.4251 5.2938-13.546 9.6709-20.246 14.611-6.443 4.7505-12.49 10.016-18.486 15.318-15.124 13.373-29.99 27.034-44.717 40.844-16.743 15.7-33.309 31.592-49.648 47.711-10.819 10.673-21.539 21.447-32.131 32.346-7.6977 7.9213-15.334 15.915-22.408 24.398-4.9072 5.8848-9.5417 12.002-14.689 17.678-6.8275 7.5277-14.507 14.225-22.158 20.914-5.7209 5.0014-11.441 10.012-17.43 14.69-6.8461 5.3477-14.045 10.26-21.66 14.441-6.5788 3.6121-13.449 6.6691-20.416 9.4609-6.2745 2.5144-12.645 4.8197-19.176 6.5625-7.1974 1.9207-14.577 3.1522-22.006 3.6973-5.6222 0.4124-11.269 0.4323-16.9 0.1758-5.0148-0.2285-10.028-0.6766-14.965-1.584-4.7946-0.8812-9.5094-2.1937-14.086-3.8731-3.1599-1.1595-6.2649-2.4981-9.1543-4.2246-0.72678-0.4343-1.4436-0.8954-2.0684-1.4668s-1.1581-1.2611-1.4531-2.0547c-0.28822-0.7754-0.33849-1.6279-0.21094-2.4453 0.12755-0.8173 0.42943-1.602 0.82227-2.3301 0.96851-1.7948 2.5071-3.2657 4.3184-4.2031-2.6345 1.4249-5.3228 2.7478-8.0234 4.043z" fill="#ED96A8"/>
      <path d="m511.22 364.76h-14.592c-0.32 0-0.6128-0.1434-0.9199-0.2246 0 0.075 0.011 0.1497 0.016 0.2246v13.846c0.3023 0.079 0.5897 0.2207 0.9043 0.2207h13.381c1.1675 0 2.1133-0.9459 2.1133-2.1133v-11.049c0-0.4992-0.4031-0.9043-0.9023-0.9043z" fill="#3A2028"/>
      <path d="m495.72 378.61v-13.846c0-0.075-0.011-0.1497-0.016-0.2246-0.2629-0.07-0.5442-0.067-0.7871-0.1934l-4.9199-2.5605v13.164c-1e-4 0.5555 0.31 1.0638 0.8027 1.3203l4.1172 2.1445c0.2477 0.1289 0.5344 0.1256 0.8027 0.1953z" fill="#2E1820"/>
    </g>
    <ellipse cx="246.5" cy="114" rx="5.5" ry="3.2" fill="#F4F9FE"/>
    <ellipse cx="270" cy="114" rx="6.5" ry="3.2" fill="#F4F9FE"/>
    <text x="252" y="164" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
  </svg>`;
}

/** STY 심해 상자(파라미터형 · 라이트) · phase down: 수면의 밀폐 상자 + 아래로 내리는 로프 + 심해
 *  물음표(결과 미제시 중립 · 예측 문항용). phase up: 심해의 쪼그라든 상자 + 위로 화살표 + 수면 물음표. */
export function deepSeaBoxFig(phase: "down" | "up"): string {
  const box = (cx: number, cy: number, w: number, h: number, crumpled?: boolean): string =>
    crumpled
      ? `<path d="M${cx - w / 2} ${cy - h / 2 + 3} l6 -4 8 3 7 -3 9 4 7 -2 5 4 -2 ${h - 8} -7 3 -8 -2 -9 3 -8 -3 -7 2 -3 -4 z" fill="#FDFEFF" stroke="#8B95A1" stroke-width="2"/>
         <path d="M${cx - w / 2 + 6} ${cy - 2} l${w - 14} -3 M${cx - w / 2 + 4} ${cy + 6} l${w - 10} 2" stroke="#C3CBD6" stroke-width="1.4"/>`
      : `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="5" fill="#FDFEFF" stroke="#8B95A1" stroke-width="2.2"/>
         <path d="M${cx - w / 2} ${cy - 4} h${w} M${cx - 8} ${cy - h / 2} v${h}" stroke="#D7DEE8" stroke-width="1.6"/>`;
  const down = phase === "down";
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="바다 단면 그림. ${down ? "수면 근처에 밀폐 상자가 있고 깊은 곳으로 내리는 중이다" : "깊은 곳에 쪼그라든 밀폐 상자가 있고 수면 쪽으로 올리는 중이다"}">
    <rect x="8" y="30" width="328" height="162" rx="10" fill="#DCEBFB"/>
    <rect x="8" y="108" width="328" height="84" rx="10" fill="#B9D6F4"/>
    <rect x="8" y="156" width="328" height="36" rx="10" fill="#93BCE8"/>
    <path d="M10 32 q14 -8 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0" stroke="#6FA8E0" stroke-width="2.4" fill="none"/>
    <text x="322" y="52" text-anchor="end" font-size="11" fill="#4E5968">수면</text>
    <text x="322" y="184" text-anchor="end" font-size="11" fill="#3D5378">깊은 바닷속</text>
    ${down
      ? `${box(120, 62, 74, 48)}<path d="M120 86 v66" stroke="#8B95A1" stroke-width="2" stroke-dasharray="5 5"/>
         <path d="M120 152 l-7 -10 m7 10 l7 -10" stroke="#8B95A1" stroke-width="2" fill="none"/>
         <circle cx="120" cy="172" r="13" fill="none" stroke="#5E6B7E" stroke-width="2"/>
         <text x="120" y="177" text-anchor="middle" font-size="14" font-weight="800" fill="#5E6B7E">?</text>`
      : `${box(120, 168, 46, 32, true)}<path d="M120 148 v-64" stroke="#8B95A1" stroke-width="2" stroke-dasharray="5 5"/>
         <path d="M120 84 l-7 10 m7 -10 l7 10" stroke="#8B95A1" stroke-width="2" fill="none"/>
         <circle cx="120" cy="62" r="13" fill="none" stroke="#5E6B7E" stroke-width="2"/>
         <text x="120" y="67" text-anchor="middle" font-size="14" font-weight="800" fill="#5E6B7E">?</text>`}
  </svg>`;
}

/** PET 같은 페트병 두 개(고정형 · 라이트) · (가) 팽팽하게 부푼 병 · (나) 찌그러진 병.
 *  배경·산 묘사 없음(장소 단서를 그리면 정답 인쇄 · 매칭이 과제).
 *  실루엣 한 덩어리 원칙(파일럿 검수 반영 재작도): 옆선 자체가 볼록/오목한 닫힌 윤곽 하나 ·
 *  윤곽 밖 덧선은 이중 윤곽으로 읽혀 실격. 찌그러짐 = 오른쪽 중간 깊은 함몰 + 왼쪽 완만한
 *  굴곡 + 함몰 안 주름 2획. */
export function twoBottlesFig(): string {
  const capNeck = (cx: number): string =>
    `<rect x="${cx - 14}" y="28" width="28" height="13" rx="3" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
     <path d="M${cx - 10} 41 h20 l4 13 h-28 z" fill="#EAF2FB" stroke="#8B95A1" stroke-width="2"/>`;
  return `<svg viewBox="0 0 344 192" ${NS} fill="none" role="img" aria-label="뚜껑을 닫은 똑같은 페트병 두 개. 가는 옆면이 팽팽하게 부풀었고 나는 옆면이 안으로 찌그러져 있다">
    ${capNeck(118)}
    <path d="M104 54 C93 68 87 86 88 102 C89 121 94 139 101 148 Q104 152 109 152 H127 Q132 152 135 148 C142 139 147 121 148 102 C149 86 143 68 132 54 Z" fill="#F2F8FE" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M97 82 C94 96 95 114 100 130" stroke="#D7E2EF" stroke-width="2.2" fill="none"/>
    <text x="118" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    ${capNeck(232)}
    <path d="M218 54 C211 63 208 74 211 84 C219 94 220 106 211 116 C207 127 210 140 216 148 Q218 152 223 152 H240 Q245 152 247 148 C252 140 254 128 251 118 C240 112 238 98 250 90 C254 76 251 63 246 54 Z" fill="#F2F8FE" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M243 98 q7 6 3 14 M214 98 q4 7 1 14" stroke="#B9C4D2" stroke-width="1.6" fill="none"/>
    <text x="232" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
  </svg>`;
}

/** QT 정성 온도-부피 직선(파라미터형 · 라이트) · 눈금·수치 없음(원점 0만). marks = 직선 위 점
 *  라벨(f 0~1 위치) · extrap = 0 ℃ 왼쪽 아래 점선 외삽(절편 함정 문항용). 실측 정성 그래프 계보. */
export function gasTvQualFig(o: { marks?: { f: number; label: string }[]; extrap?: boolean }): string {
  const x0 = o.extrap ? 128 : 48;
  const y0 = 132;
  const xe = 314;
  const ye = 52;
  const lx = (f: number): number => x0 + f * (xe - x0);
  const ly = (f: number): number => y0 - f * (y0 - ye);
  const marks = (o.marks ?? [])
    .map((m) => `<circle cx="${lx(m.f)}" cy="${ly(m.f)}" r="4.4" fill="#5E6B7E"/>
      <text x="${lx(m.f)}" y="${ly(m.f) - 12}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${m.label}</text>`)
    .join("");
  const extrap = o.extrap
    ? `<path d="M${x0} ${y0} L60 ${y0 + 26}" stroke="#8B99AC" stroke-width="2" stroke-dasharray="5 5"/>`
    : "";
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="압력이 일정할 때 온도에 따른 기체의 부피를 나타낸 그래프. 눈금 없이 오른쪽 위로 오르는 직선이다">
    <line x1="48" y1="26" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="320" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${x0}" y1="${y0}" x2="${xe}" y2="${ye}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${extrap}${marks}
    ${o.extrap ? `<line x1="${x0}" y1="168" x2="${x0}" y2="164" stroke="#8B95A1" stroke-width="1.6"/><text x="${x0}" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">0</text>` : `<text x="48" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">0</text>`}
    <text x="10" y="16" font-size="11" fill="#4E5968">부피</text>
    <text x="320" y="198" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

/** WB 물중탕 대조 실험(고정형 · 라이트) · 끝 막은 같은 주사기를 (가) 뜨거운 물 · (나) 얼음물에
 *  세워 담근 시작 상태. 피스톤 높이는 양쪽 동일(결과 미제시 중립 · 예측 문항용).
 *  (가)의 김 곡선은 사후 갤러리 검수(2026-08-01)로 제거: 피스톤 곁 갈색 호가 떨림 표시로
 *  오독된다 · 뜨거움은 물 색과 라벨이 이미 전달(같은 까닭으로 SYW·SYDUO·WB2도 김 제거). */
export function waterBathFig(): string {
  const set = (x: number, label: string, hot: boolean): string => {
    const water = hot ? "#FADCC8" : "#D5E9FB";
    const deco = hot
      ? ""
      : `<rect x="${x + 22}" y="92" width="15" height="12" rx="3" fill="#FDFEFF" stroke="#9DB8D4" stroke-width="1.6" transform="rotate(-12 ${x + 29} 98)"/>
         <rect x="${x + 58}" y="100" width="13" height="11" rx="3" fill="#FDFEFF" stroke="#9DB8D4" stroke-width="1.6" transform="rotate(14 ${x + 64} 105)"/>`;
    return `<g>
      <path d="M${x + 6} 78 v66 q0 8 8 8 h62 q8 0 8 -8 v-66" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
      <rect x="${x + 8}" y="86" width="76" height="64" rx="6" fill="${water}"/>
      ${deco}
      <rect x="${x + 38}" y="52" width="18" height="84" rx="6" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2"/>
      <rect x="${x + 41}" y="60" width="12" height="7" rx="2" fill="#8B99AC"/>
      <rect x="${x + 45}" y="38" width="4" height="24" fill="#8B99AC"/>
      <rect x="${x + 39}" y="32" width="16" height="7" rx="3" fill="#8B99AC"/>
      ${g6dot(x + 43, 106, 3.4)}${g6dot(x + 51, 118, 3.4)}${g6dot(x + 44, 128, 3.4)}${g6dot(x + 52, 96, 3.4)}
      <text x="${x + 46}" y="172" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 182" ${NS} fill="none" role="img" aria-label="끝을 막은 같은 주사기 두 개를 뜨거운 물이 든 비커와 얼음물이 든 비커에 각각 세워 담근 그림. 피스톤 높이는 아직 같다">
    ${set(56, "(가) 뜨거운 물", true)}
    ${set(196, "(나) 얼음물", false)}
  </svg>`;
}

/** JAR 포개져 낀 그릇(고정형 · 라이트) · 큰 그릇 안에 작은 그릇이 끼었고 사이에 공기가 갇힌 단면.
 *  분리 방법은 그리지 않는다(방법 고안이 과제 · 중립). */
export function stuckBowlsFig(): string {
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="큰 그릇 안에 작은 그릇이 포개져 끼어 있는 단면 그림. 두 그릇 사이 아래쪽에 공기가 갇혀 있다">
    <path d="M62 52 q4 74 60 78 h100 q56 -4 60 -78" fill="#FDFEFF" stroke="#8B95A1" stroke-width="2.6"/>
    <path d="M92 44 q3 56 46 60 h68 q43 -4 46 -60" fill="#F2F7FD" stroke="#8B95A1" stroke-width="2.4"/>
    <path d="M62 52 h-14 M282 52 h14 M92 44 h-12 M252 44 h12" stroke="#8B95A1" stroke-width="2.2"/>
    ${g6dot(140, 116, 3.6)}${g6dot(172, 122, 3.6)}${g6dot(204, 116, 3.6)}${g6dot(172, 108, 3.6)}
    <path d="M226 122 q30 16 60 6" stroke="#B9C2CE" stroke-width="1.6" fill="none"/>
    <text x="290" y="146" text-anchor="middle" font-size="11" fill="#66707E">갇힌 공기</text>
  </svg>`;
}

/** BAL2 병 입구 풍선 2컷(고정형 · 라이트) · (가) 풍선이 병 밖으로 부풂 · (나) 풍선이 입구 안으로
 *  오목하게 빨려 듦. 대야의 물은 중립 회색(어느 쪽이 따뜻한 물인지 매칭하는 것이 과제). */
export function bottleBalloonFig(): string {
  const set = (x: number, label: string, up: boolean): string => `<g>
    <path d="M${x - 46} 118 h92 l-9 34 h-74 z" fill="#EDF1F6" stroke="#9DA8B7" stroke-width="2"/>
    <path d="M${x - 20} 64 q0 -8 6 -10 v-8 h28 v8 q6 2 6 10 v50 q0 10 -8 12 h-24 q-8 -2 -8 -12 z" fill="#F2F8FE" stroke="#8B95A1" stroke-width="2.2"/>
    ${up
      ? `<ellipse cx="${x}" cy="28" rx="15" ry="19" fill="#FBD3C4" stroke="#D98D6E" stroke-width="2"/><path d="M${x - 8} 46 h16" stroke="#D98D6E" stroke-width="2"/>`
      : `<path d="M${x - 7} 48 q-4 6 -3 12" stroke="#D98D6E" stroke-width="1.6" fill="none"/><path d="M${x + 7} 48 q4 6 3 12" stroke="#D98D6E" stroke-width="1.6" fill="none"/><ellipse cx="${x}" cy="74" rx="10" ry="16" fill="#FBD3C4" stroke="#D98D6E" stroke-width="2"/><path d="M${x - 8} 47 h16" stroke="#D98D6E" stroke-width="2"/>`}
    <text x="${x}" y="170" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${label}</text>
  </g>`;
  return `<svg viewBox="0 0 344 178" ${NS} fill="none" role="img" aria-label="입구에 고무풍선을 씌운 똑같은 유리병 두 개가 각각 대야에 담겨 있다. 가는 풍선이 병 위로 부풀었고 나는 풍선이 병 입구 안쪽으로 오므라들었다">
    ${set(96, "(가)", true)}
    ${set(248, "(나)", false)}
  </svg>`;
}

/** CAN 캔 밀봉 냉각 2컷(고정형 · 라이트) · (가) 뜨거운 물로 헹궈 김이 나는 캔을 막은 직후 ·
 *  (나) 식은 뒤 찌그러진 캔. 과정 인과를 묻는 문항의 관찰 자료(전후 대비). */
export function canCoolFig(): string {
  return `<svg viewBox="0 0 344 176" ${NS} fill="none" role="img" aria-label="입구를 막은 알루미늄 캔 두 컷. 가는 김이 나는 막 밀봉한 캔이고 나는 식은 뒤 옆면이 찌그러진 캔이다">
    <g>
      <rect x="76" y="46" width="64" height="98" rx="10" fill="#EAF0F7" stroke="#8B95A1" stroke-width="2.4"/>
      <ellipse cx="108" cy="46" rx="32" ry="9" fill="#D8E0EA" stroke="#8B95A1" stroke-width="2"/>
      <rect x="98" y="34" width="20" height="9" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
      <path d="M92 26 q6 -10 0 -18 M108 24 q6 -10 0 -18 M124 26 q6 -10 0 -18" stroke="#B9C2CE" stroke-width="2" fill="none" stroke-linecap="round"/>
      <text x="108" y="166" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가) 밀봉 직후</text>
    </g>
    <path d="M162 96 h26 m0 0 l-8 -6 m8 6 l-8 6" stroke="#8B99AC" stroke-width="2.6" fill="none"/>
    <g>
      <path d="M212 50 q-4 24 6 34 q-10 14 2 30 q-8 12 4 28 h44 q12 -14 3 -28 q11 -16 1 -30 q10 -12 5 -34 z" fill="#EAF0F7" stroke="#8B95A1" stroke-width="2.4"/>
      <ellipse cx="243" cy="50" rx="31" ry="9" fill="#D8E0EA" stroke="#8B95A1" stroke-width="2"/>
      <rect x="233" y="38" width="20" height="9" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.6"/>
      <path d="M222 84 l14 6 m-12 24 l14 -4 m-12 26 l13 5" stroke="#C3CBD6" stroke-width="1.6"/>
      <text x="243" y="166" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나) 식은 뒤</text>
    </g>
  </svg>`;
}

/** PV 압력-부피 반비례 곡선 v2(파라미터형 · 라이트) · 곱 k 일정 · 눈금 숫자 포함(값 읽기용).
 *  dots는 곡선 위 점만 찍는다(축까지 잇는 가이드 점선 금지 · 점선이 정답 눈금을 가리키면 판독
 *  과제가 무력화 · g2u2 확립 관행). 저작 검산: 전 dots가 눈금 교차점 위 · 곱 = k 일치. */
export function gasPvGraphV2Fig(o: { k: number; pMax: number; pStep?: number; vMax: number; vStep: number; dots?: number[] }): string {
  const pStep = o.pStep ?? 1;
  const gx = (p: number): number => 48 + p * (264 / o.pMax);
  const gy = (v: number): number => 168 - (v / o.vMax) * 138;
  let xt = "";
  for (let p = 0; p <= o.pMax; p += pStep) {
    xt += `<line x1="${gx(p)}" y1="168" x2="${gx(p)}" y2="26" stroke="#EDF0F4" stroke-width="1"/><text x="${gx(p)}" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">${p}</text>`;
  }
  let yt = "";
  for (let v = 0; v <= o.vMax; v += o.vStep) {
    yt += `<line x1="48" y1="${gy(v)}" x2="320" y2="${gy(v)}" stroke="#EDF0F4" stroke-width="1"/><text x="40" y="${gy(v) + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  // 곡선 하한: 정수 축은 0.4(구판 값 유지) · 소수 축(pStep<1)은 k/vMax부터 그려 좌상단 절단 방지
  // (검산 A 지적 · 감압 그래프 vMax 128 눈금까지 곡선이 닿게).
  const pMin = Math.max(o.k / o.vMax, (o.pStep ?? 1) < 1 ? o.k / o.vMax : 0.4);
  let d = "";
  for (let p = pMin; p <= o.pMax; p += 0.03) d += `${d ? "L" : "M"}${gx(p).toFixed(1)} ${gy(o.k / p).toFixed(1)}`;
  const dots = (o.dots ?? []).map((p) => `<circle cx="${gx(p)}" cy="${gy(o.k / p)}" r="4.4" fill="#5E6B7E"/>`).join("");
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="온도가 일정할 때 압력에 따른 기체의 부피 그래프. 휘어지며 내려가는 곡선이다">
    ${yt}${xt}
    <line x1="48" y1="26" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="320" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <path d="${d}" fill="none" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${dots}
    <text x="10" y="16" font-size="11" fill="#4E5968">부피(mL)</text>
    <text x="320" y="198" text-anchor="end" font-size="11" fill="#4E5968">압력(기압)</text>
  </svg>`;
}

/** TV 온도-부피 직선 v2(파라미터형 · 라이트) · 절편 v0 > 0 · 기울기 slope · 눈금 숫자 포함.
 *  dots는 직선 위 점만(가이드 점선 금지 · PV v2와 동일 관행). vMin부터 눈금을 시작해 절편이
 *  첫 눈금 위에 오게 세팅한다. 저작 검산: v0/273 ≈ slope 자연값 · 전 dots 값이 눈금 위. */
export function gasTvGraphV2Fig(o: { v0: number; slope: number; tMax: number; tStep: number; vMin: number; vMax: number; vStep: number; dots?: number[] }): string {
  const gx = (t: number): number => 48 + t * (264 / o.tMax);
  const gy = (v: number): number => 168 - ((v - o.vMin) / (o.vMax - o.vMin)) * 138;
  const vAt = (t: number): number => o.v0 + o.slope * t;
  let xt = "";
  for (let t = 0; t <= o.tMax; t += o.tStep) {
    xt += `<line x1="${gx(t)}" y1="168" x2="${gx(t)}" y2="26" stroke="#EDF0F4" stroke-width="1"/><text x="${gx(t)}" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">${t}</text>`;
  }
  let yt = "";
  for (let v = o.vMin; v <= o.vMax; v += o.vStep) {
    yt += `<line x1="48" y1="${gy(v)}" x2="320" y2="${gy(v)}" stroke="#EDF0F4" stroke-width="1"/><text x="40" y="${gy(v) + 4}" text-anchor="end" font-size="10.5" fill="#8B95A1">${v}</text>`;
  }
  const tEnd = Math.min(o.tMax, (o.vMax - o.v0) / o.slope);
  const dots = (o.dots ?? []).map((t) => `<circle cx="${gx(t)}" cy="${gy(vAt(t))}" r="4.4" fill="#5E6B7E"/>`).join("");
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="압력이 일정할 때 온도에 따른 기체의 부피 그래프. 오른쪽 위로 오르는 직선이다">
    ${yt}${xt}
    <line x1="48" y1="26" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="320" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="${gx(0)}" y1="${gy(o.v0)}" x2="${gx(tEnd)}" y2="${gy(vAt(tEnd))}" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    ${dots}
    <text x="10" y="16" font-size="11" fill="#4E5968">부피(mL)</text>
    <text x="320" y="198" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

// ── (rest-a 저작분) ──

/** BRICK 벽돌 두 배치(고정형 · 라이트) · (가) 같은 벽돌 2장을 좁은 면으로 세워 포갬 ·
 *  (나) 1장을 넓은 면으로 눕힘. 파묻힘 결과는 그리지 않는다(비교 추론이 과제 · 중립).
 *  힘 2배(2장)와 접지 면적 대비가 그림 판독 재료. */
export function brickStackFig(): string {
  return `<svg viewBox="0 0 344 186" ${NS} fill="none" role="img" aria-label="모래 바닥 위 벽돌 배치 두 가지. 가는 같은 벽돌 두 장을 좁은 면이 바닥에 닿게 세워 포갰고, 나는 벽돌 한 장을 넓은 면이 바닥에 닿게 눕혀 놓았다">
    <defs>
      <linearGradient id="u6raBrick" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E09A6B"/><stop offset=".55" stop-color="#C1734A"/><stop offset="1" stop-color="#9A5433"/>
      </linearGradient>
      <linearGradient id="u6raSand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F4E7CE"/><stop offset="1" stop-color="#E2CBA2"/>
      </linearGradient>
    </defs>
    <path d="M8 128 h328 v46 h-328 z" fill="url(#u6raSand)"/>
    <path d="M8 128 h328" stroke="#C9AE7E" stroke-width="2"/>
    <circle cx="52" cy="146" r="1.6" fill="#CBB183"/><circle cx="188" cy="154" r="1.6" fill="#CBB183"/>
    <circle cx="300" cy="142" r="1.6" fill="#CBB183"/><circle cx="140" cy="164" r="1.4" fill="#CBB183"/>
    <ellipse cx="100" cy="128" rx="27" ry="5" fill="#2A3A5E" opacity=".11"/>
    <g>
      <rect x="80" y="82" width="40" height="46" rx="3" fill="url(#u6raBrick)" stroke="#6E3A20" stroke-width="1.6"/>
      <rect x="80" y="34" width="40" height="46" rx="3" fill="url(#u6raBrick)" stroke="#6E3A20" stroke-width="1.6"/>
      <path d="M84 40 v34 M84 88 v34" stroke="#F0BE93" stroke-width="2.2" opacity=".7"/>
      <path d="M80 81 h40" stroke="#6E3A20" stroke-width="1.2" opacity=".6"/>
    </g>
    <ellipse cx="244" cy="128" rx="54" ry="6" fill="#2A3A5E" opacity=".11"/>
    <g>
      <rect x="196" y="88" width="96" height="40" rx="3" fill="url(#u6raBrick)" stroke="#6E3A20" stroke-width="1.6"/>
      <path d="M202 93 h58" stroke="#F0BE93" stroke-width="2.2" opacity=".7"/>
      <path d="M226 100 h36 M212 112 h52" stroke="#8A4A2C" stroke-width="1.2" opacity=".5"/>
    </g>
    <text x="100" y="166" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    <text x="244" y="166" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
  </svg>`;
}

/** PIN 압정 확대 단면(고정형 · 라이트) · 넓적한 머리를 엄지로 누르고 뾰족한 끝이 판을 파고드는
 *  구조 대비가 판독 재료. 머리 넓음(손끝 안 아픔)과 끝 뾰족(잘 박힘)을 한 그림에. */
export function thumbtackFig(): string {
  return `<svg viewBox="0 0 344 186" ${NS} fill="none" role="img" aria-label="엄지손가락으로 압정을 판에 눌러 꽂는 확대 그림. 압정의 머리는 넓적하고 판을 파고드는 끝은 아주 뾰족하다">
    <defs>
      <linearGradient id="u6raCork" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E9C99C"/><stop offset="1" stop-color="#CFA671"/>
      </linearGradient>
      <linearGradient id="u6raPinHead" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F58A8A"/><stop offset=".5" stop-color="#DE5252"/><stop offset="1" stop-color="#B23A3A"/>
      </linearGradient>
      <linearGradient id="u6raThumb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FBD9C0"/><stop offset="1" stop-color="#EFB894"/>
      </linearGradient>
    </defs>
    <rect x="34" y="132" width="276" height="38" rx="4" fill="url(#u6raCork)" stroke="#A67B48" stroke-width="2"/>
    <circle cx="80" cy="150" r="1.8" fill="#B98F5C"/><circle cx="150" cy="158" r="1.6" fill="#B98F5C"/>
    <circle cx="236" cy="148" r="1.8" fill="#B98F5C"/><circle cx="286" cy="158" r="1.5" fill="#B98F5C"/>
    <ellipse cx="172" cy="133" rx="42" ry="4.6" fill="#2A3A5E" opacity=".12"/>
    <path d="M132 26 q-14 16 -6 30 q7 12 24 14 h44 q17 -2 24 -14 q8 -14 -6 -30 q-20 -14 -40 -14 q-20 0 -40 14 z" fill="url(#u6raThumb)" stroke="#C98F66" stroke-width="1.8"/>
    <path d="M148 22 q10 -7 24 -7" stroke="#FDEDE0" stroke-width="2.6" opacity=".8" fill="none"/>
    <path d="M150 40 q22 10 44 0" stroke="#D9A075" stroke-width="1.4" fill="none" opacity=".7"/>
    <ellipse cx="172" cy="78" rx="56" ry="11" fill="url(#u6raPinHead)" stroke="#7E2626" stroke-width="1.8"/>
    <path d="M126 80 q4 9 14 11 h64 q10 -2 14 -11 l-4 8 q-6 7 -12 7 h-60 q-6 0 -12 -7 z" fill="#A83232" stroke="#7E2626" stroke-width="1.4"/>
    <path d="M132 74 q14 -5 34 -5" stroke="#FBB9B9" stroke-width="2.4" opacity=".85" fill="none"/>
    <rect x="167" y="94" width="10" height="16" rx="2" fill="#C9D2DC" stroke="#7A8798" stroke-width="1.3"/>
    <path d="M167 110 L172 146 L177 110 z" fill="#B7C2CE" stroke="#7A8798" stroke-width="1.3"/>
    <path d="M170 112 L172 140" stroke="#EDF2F8" stroke-width="1.2" opacity=".85"/>
  </svg>`;
}

/** MAT 구조용 공기 매트(고정형 · 라이트) · 건물에서 떨어지는 사람 + 바닥의 부푼 매트.
 *  눌린 결과는 그리지 않는다(받아 내는 원리가 과제 · 낙하 중 장면 중립). 스틱맨은 손그림 라인. */
export function rescueMatFig(): string {
  return `<svg viewBox="0 0 344 198" ${NS} fill="none" role="img" aria-label="높은 건물에서 뛰어내린 사람이 아직 공중에 떠 있고, 바닥에는 공기를 가득 채워 크게 부풀린 구조용 매트가 놓여 있는 그림">
    <defs>
      <linearGradient id="u6raBd" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#D4DAE3"/><stop offset=".6" stop-color="#B9C2CF"/><stop offset="1" stop-color="#9AA6B6"/>
      </linearGradient>
      <linearGradient id="u6raMat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFB35C"/><stop offset=".55" stop-color="#F28C3B"/><stop offset="1" stop-color="#D96E1E"/>
      </linearGradient>
    </defs>
    <rect x="10" y="12" width="76" height="162" rx="4" fill="url(#u6raBd)" stroke="#7C8899" stroke-width="2"/>
    <path d="M10 12 h76" stroke="#6E7A8B" stroke-width="3"/>
    ${[30, 62, 94, 126].map((y) => `<rect x="22" y="${y}" width="20" height="18" rx="2" fill="#DCEBFB" stroke="#93A3B8" stroke-width="1.2"/><rect x="52" y="${y}" width="20" height="18" rx="2" fill="#DCEBFB" stroke="#93A3B8" stroke-width="1.2"/>`).join("")}
    <g stroke="#333D4B" stroke-width="2.6" stroke-linecap="round" fill="none">
      <circle cx="176" cy="52" r="8" fill="#fff"/>
      <path d="M176 60 v24 M176 66 l-16 -8 M176 66 l16 -8 M176 84 l-11 16 M176 84 l12 15"/>
    </g>
    <path d="M156 34 q10 -6 20 -4 M198 40 q8 6 8 16" stroke="#B0B8C1" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="216" cy="174" rx="104" ry="7" fill="#2A3A5E" opacity=".11"/>
    <path d="M118 172 q-4 -40 22 -44 h152 q26 4 22 44 z" fill="url(#u6raMat)" stroke="#A85212" stroke-width="2.2"/>
    <path d="M132 136 q14 -8 34 -9" stroke="#FFD9AC" stroke-width="3" opacity=".8" fill="none"/>
    <path d="M168 130 v42 M216 128 v44 M264 130 v42" stroke="#C46318" stroke-width="1.8" opacity=".65"/>
    <circle cx="306" cy="158" r="6" fill="#B85A14" stroke="#8A3F0C" stroke-width="1.4"/>
    <path d="M8 172 h328" stroke="#B0B8C1" stroke-width="2"/>
  </svg>`;
}

/** SEAT 소파와 의자(고정형 · 라이트) · (가) 푹신한 소파 · (나) 딱딱한 나무 의자. 앉은 스틱맨은
 *  사후 갤러리 검수(2026-08-01)로 제거(자세가 어색해 오히려 방해) · 파묻힘 대비는 문두·해설이 서술. */
export function sofaChairFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="가는 방석이 두툼한 푹신한 소파, 나는 등받이와 좌판이 평평한 딱딱한 나무 의자 그림">
    <defs>
      <linearGradient id="u6raSofa" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#DFAF86"/><stop offset=".55" stop-color="#C08A5D"/><stop offset="1" stop-color="#9A6A41"/>
      </linearGradient>
      <linearGradient id="u6raWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#DDB57C"/><stop offset=".55" stop-color="#BE9155"/><stop offset="1" stop-color="#936B35"/>
      </linearGradient>
    </defs>
    <ellipse cx="95" cy="164" rx="66" ry="6" fill="#2A3A5E" opacity=".11"/>
    <g>
      <rect x="34" y="70" width="122" height="92" rx="14" fill="url(#u6raSofa)" stroke="#6E4527" stroke-width="2"/>
      <path d="M42 78 q16 -8 36 -9" stroke="#F2D3B4" stroke-width="2.6" opacity=".75" fill="none"/>
      <rect x="34" y="96" width="18" height="52" rx="9" fill="#B27E51" stroke="#6E4527" stroke-width="1.6"/>
      <rect x="138" y="96" width="18" height="52" rx="9" fill="#B27E51" stroke="#6E4527" stroke-width="1.6"/>
      <path d="M56 120 h78" stroke="#6E4527" stroke-width="2" opacity=".55" stroke-linecap="round"/>
    </g>
    <ellipse cx="258" cy="164" rx="52" ry="6" fill="#2A3A5E" opacity=".11"/>
    <g>
      <rect x="292" y="46" width="12" height="116" rx="3" fill="url(#u6raWood)" stroke="#61451E" stroke-width="1.8"/>
      <rect x="294.5" y="54" width="2.5" height="60" fill="#EBCB98" opacity=".7"/>
      <rect x="216" y="106" width="86" height="11" rx="3" fill="url(#u6raWood)" stroke="#61451E" stroke-width="1.8"/>
      <path d="M222 106 h50" stroke="#EBCB98" stroke-width="2" opacity=".7"/>
      <rect x="222" y="117" width="9" height="45" fill="url(#u6raWood)" stroke="#61451E" stroke-width="1.6"/>
      <rect x="284" y="117" width="9" height="45" fill="url(#u6raWood)" stroke="#61451E" stroke-width="1.6"/>
    </g>
    <text x="95" y="182" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    <text x="258" y="182" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
  </svg>`;
}

/** BALL2 공기 주입 전후 공 단면(고정형 · 라이트) · (가) 옆이 살짝 꺼진 공(입자 6) · (나) 펌프가
 *  연결된 팽팽한 공(입자 9). 입자 수 차등은 주입 슬롯만 허용하는 §5 예외의 유일 사용처.
 *  함몰 실루엣은 한 덩어리 윤곽(제어점 안쪽 · §7-2). aria에 개수 낭독 금지. */
export function ballPumpFig(): string {
  const parts = (cx: number, cy: number, pts: [number, number][]): string =>
    pts.map(([dx, dy], i) => g6part(cx + dx, cy + dy, ((i * 137 + 30) % 360) * (Math.PI / 180), 1, 4.4)).join("");
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="속이 보이는 공 두 개의 모형. 가는 옆면이 살짝 꺼진 공이고, 나는 공기 펌프의 호스가 연결된 팽팽하게 부푼 공이다. 두 공 속에 움직이는 기체 입자들이 그려져 있다">
    <defs>
      <linearGradient id="u6raBall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FDFEFF"/><stop offset=".55" stop-color="#E9EEF5"/><stop offset="1" stop-color="#CCD7E4"/>
      </linearGradient>
      <linearGradient id="u6raPump" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8FA0B5"/><stop offset="1" stop-color="#5E6B7E"/>
      </linearGradient>
    </defs>
    <ellipse cx="92" cy="158" rx="42" ry="5.5" fill="#2A3A5E" opacity=".11"/>
    <path d="M92 44 C64 44 46 66 46 96 C46 124 66 148 92 148 C108 148 120 142 126 130 C120 116 118 103 120 91 C122 80 126 71 131 65 C123 50 109 44 92 44 Z" fill="url(#u6raBall)" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M60 66 q-8 14 -6 30" stroke="#FDFEFF" stroke-width="2.6" opacity=".9" fill="none"/>
    <path d="M128 92 q-2 4 -1 8 M123 95 q-1 3 0 6" stroke="#AEB9C6" stroke-width="1.4" fill="none"/>
    ${parts(90, 96, [[-26, -28], [14, -34], [28, 2], [-30, 12], [-2, 6], [10, 36]])}
    <ellipse cx="252" cy="158" rx="46" ry="5.5" fill="#2A3A5E" opacity=".11"/>
    <circle cx="252" cy="96" r="52" fill="url(#u6raBall)" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M220 64 q-10 14 -8 32" stroke="#FDFEFF" stroke-width="2.6" opacity=".9" fill="none"/>
    ${parts(252, 96, [[-30, -26], [2, -38], [30, -22], [-38, 4], [-8, -6], [22, 10], [-24, 28], [6, 32], [34, 26]])}
    <rect x="306" y="18" width="14" height="52" rx="4" fill="url(#u6raPump)" stroke="#46525F" stroke-width="1.6"/>
    <rect x="298" y="10" width="30" height="8" rx="3" fill="#7C8899" stroke="#46525F" stroke-width="1.4"/>
    <path d="M313 70 q1 26 -10 34" stroke="#5E6B7E" stroke-width="4" fill="none" stroke-linecap="round"/>
    <rect x="297" y="102" width="11" height="9" rx="2.5" fill="#8B99AC" stroke="#46525F" stroke-width="1.3" transform="rotate(38 302 106)"/>
    <text x="92" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    <text x="252" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
  </svg>`;
}

// ── (rest-b 저작분) ──

/** GC 압력-부피 개형 고르기 ①~⑤(고정형 · 라이트 · shuffle:false 전용) · 정답 ③ 반비례 곡선.
 *  ① 하강 직선 · ② 상승 직선 · ④ 수평선 · ⑤ 꺾인 선 함정. 첫 칸 정답 금지 배치(설계표 §5). */
export function gasPvChoicesFig(): string {
  const cell = (i: number, x: number, y: number, body: string): string =>
    `<g transform="translate(${x},${y})">
      <text x="0" y="10" font-size="12" font-weight="700" fill="#4E5968">${["①", "②", "③", "④", "⑤"][i]}</text>
      <line x1="16" y1="14" x2="16" y2="66" stroke="#B0B8C1" stroke-width="1.4"/>
      <line x1="16" y1="66" x2="92" y2="66" stroke="#B0B8C1" stroke-width="1.4"/>
      ${body}
    </g>`;
  const S = `stroke="#5E6B7E" stroke-width="2.6" fill="none" stroke-linecap="round"`;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="가로축이 압력, 세로축이 부피인 작은 그래프 보기 다섯 개">
    ${cell(0, 14, 6, `<path d="M22 22 L86 60" ${S}/>`)}
    ${cell(1, 124, 6, `<path d="M22 60 L86 20" ${S}/>`)}
    ${cell(2, 234, 6, `<path d="M22 20 Q30 52 52 58 Q70 62 88 63" ${S}/>`)}
    ${cell(3, 68, 100, `<path d="M22 38 H88" ${S}/>`)}
    ${cell(4, 180, 100, `<path d="M22 24 L54 56 H88" ${S}/>`)}
  </svg>`;
}

/** FC 이행 순서도 ㉠㉡㉢(파라미터형 · 라이트) · 각 칸은 공통부(head) 아래 두 갈래 중 하나를
 *  고르는 빈칸(양자택일 · 천06 계보 · u3 순서도 문법의 u6판) · 2줄 레이아웃(한 줄 초과 잘림 방지).
 *  aria는 구조만(선택지 방향 낭독 금지). */
export function gasFlowFig(o: { start: string; steps: { head: string; a: string; b: string }[] }): string {
  const M = ["㉠", "㉡", "㉢"];
  let out = "";
  let y = 14;
  out += `<rect x="52" y="${y}" width="240" height="34" rx="17" fill="#EEF3FA" stroke="#8B95A1" stroke-width="2"/>
    <text x="172" y="${y + 22}" text-anchor="middle" font-size="13" font-weight="700" fill="#333D4B">${o.start}</text>`;
  y += 34;
  o.steps.forEach((s, i) => {
    out += `<path d="M172 ${y} v13 m0 0 l-5 -7 m5 7 l5 -7" stroke="#8B99AC" stroke-width="2" fill="none"/>`;
    y += 13;
    out += `<rect x="30" y="${y}" width="284" height="54" rx="10" fill="#FDFEFF" stroke="#8B95A1" stroke-width="2"/>
      <text x="46" y="${y + 23}" font-size="13" font-weight="800" fill="#1B64DA">${M[i]}</text>
      <text x="70" y="${y + 23}" font-size="12.8" font-weight="700" fill="#333D4B">${s.head}</text>
      <text x="70" y="${y + 43}" font-size="12.4" fill="#4E5968">( ${s.a}  ·  ${s.b} )</text>`;
    y += 54;
  });
  return `<svg viewBox="0 0 344 ${y + 12}" ${NS} fill="none" role="img" aria-label="순서도. 시작 상자에서 화살표를 따라 내려가며 기호 칸마다 괄호 속 두 갈래 가운데 하나를 고른다">${out}</svg>`;
}

/** PC3 피스톤 실린더 1~3컷(파라미터형 · 라이트) · w = 추 개수 · vol = 기체 기둥 비율 ·
 *  tail = 꼬리 세기(1/2 · 온도 축 지원). gasPistonDuoFig의 꼬리+3컷 확장판(§5). */
export function gasPistonTrioFig(cuts: { label: string; w: number; vol: number; tail: 1 | 2 }[]): string {
  const jar = (x: number, c: { label: string; w: number; vol: number; tail: 1 | 2 }): string => {
    const wJar = 88;
    const bot = 168;
    const top = 52;
    const pistonY = bot - (bot - top) * c.vol;
    // 기둥이 낮은 컷(vol<0.3)은 입자를 가로로 펴고 반지름을 줄여 겹침 방지(검산 A 제안 반영).
    const low = bot - pistonY < 36;
    const pts: [number, number][] = low
      ? [[0.14, 0.34], [0.4, 0.66], [0.64, 0.32], [0.86, 0.62]]
      : [[0.3, 0.3], [0.72, 0.42], [0.34, 0.72], [0.66, 0.82]];
    const parts = pts
      .map(([fx, fy], i) => g6part(x + 12 + fx * (wJar - 24), pistonY + 8 + fy * (bot - pistonY - 16), ((i * 137 + 50) % 360) * (Math.PI / 180), c.tail, low ? 3.4 : 4.2))
      .join("");
    let weights = "";
    for (let i = 0; i < c.w; i += 1) {
      weights += `<rect x="${x + wJar / 2 - 26 + (i % 2) * 26}" y="${pistonY - 14 - Math.floor(i / 2) * 12}" width="26" height="11" rx="2.5" fill="#8B99AC" stroke="#5E6B7E" stroke-width="1.3"/>`;
    }
    return `<g>
      <path d="M${x} ${top - 26} v${bot - top + 26} h${wJar} v-${bot - top + 26}" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
      <rect x="${x + 2}" y="${pistonY}" width="${wJar - 4}" height="7" fill="#B7C2CE" stroke="#5E6B7E" stroke-width="1.4"/>
      ${weights}${parts}
      <text x="${x + wJar / 2}" y="${bot + 20}" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${c.label}</text>
    </g>`;
  };
  const gap = 26;
  const totalW = cuts.length * 88 + (cuts.length - 1) * gap;
  let x = (344 - totalW) / 2;
  let out = "";
  for (const c of cuts) {
    out += jar(x, c);
    x += 88 + gap;
  }
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="추를 올린 피스톤 실린더 ${cuts.length}개. 추의 개수와 피스톤 높이가 서로 다르고 안에 기체 입자가 그려져 있다">${out}</svg>`;
}

/** 미는 손 공용 파츠 · 오픈 팜 손바닥 벡터(무료 아이콘 이식 · 손가락 4개 위로 편 원본을 눕혀 쓴다).
 *  가운뎃손가락 끝이 tipX에서 대상 면에 닿고 손목은 왼쪽 · 엄지는 위 · dir -1은 좌우 반전.
 *  자작 손(팜 블록+스트립 4개+아래 엄지 타원)은 엄지가 맨 아래로 가 어색하다는 사후 갤러리 검수
 *  (2026-08-01)로 교체 · u6rbHand 그라데이션 의존도 함께 폐기(rest-e COIN·FOUNTAIN 공용). */
const HAND_BASE =
  "M43.865 93.979a43.548 43.548 0 0123.898 7.127V89.281c0-12.063 4.935-23.029 12.876-30.961 7.932-7.941 18.898-12.866 30.961-12.866a43.513 43.513 0 0125.052 7.903v-9.529c0-12.064 4.926-23.03 12.866-30.962C157.459 4.925 168.415 0 180.478 0c12.064 0 23.03 4.925 30.961 12.866 7.941 7.942 12.876 18.898 12.876 30.962v9.671c7.015-4.774 15.485-7.582 24.579-7.582 12.063 0 23.02 4.925 30.961 12.866 7.941 7.941 12.866 18.908 12.866 30.961v208.3a72.82 72.82 0 01.832 11.004V321.3l1.087-1.021c7.535-7.081 14.918-14.464 17.688-17.244 18.69-18.717 38.816-22.687 54.774-17.62a41.811 41.811 0 0118.368 11.778c4.897 5.388 8.461 12.063 10.239 19.541 4.225 17.707-1.494 40.008-23.493 59.709l-.359.359.01.01-.076.066-96.379 97.315.018.029c-.226.227-.463.444-.709.652-14.076 13.537-27.897 22.82-42.89 28.786-15.239 6.069-31.329 8.602-49.792 8.602h-62.356c-33.202 0-63.056-13.575-84.666-35.44C13.33 454.87 0 424.562 0 391.247v-82.199c0-2.874.161-5.71.473-8.509a10.004 10.004 0 01-.445-3.063v-159.67c0-12.063 4.926-23.02 12.867-30.961 7.941-7.942 18.907-12.866 30.97-12.866z";
const HAND_SKIN =
  "M252.362 337.64c7.675 1.654 15.79 4.087 24.294 7.345a3.41 3.41 0 011.772 1.196c2.318 2.98 5.89 3.173 8.979 1.32 2.85-1.618 5.703-3.933 8.22-6.033 3.182-2.654 6.742-5.876 10.284-9.206 6.134-5.763 12.12-11.688 18.071-17.639 6.379-6.374 12.782-10.478 18.849-12.7 10.864-3.981 22.372-2.395 30.291 6.172 9.032 9.273 8.887 23.928 4.012 35.141-2.704 6.225-7.15 12.657-13.666 18.936l-4.954 4.751-95.217 96.139c-24.394 23.484-47.433 32.722-81.258 32.722h-62.356c-57.687 0-103.204-47.228-103.204-104.528v-82.199c0-23.973 13.827-44.01 36.709-52.131 13.327-4.025 18.939-2.783 30.66-2.783h136.194c25.593 0 48.04 17.33 54.912 41.554 2.95 10.416 2.111 20.011 2.111 30.717-.047 2.32-2.246 3.998-4.502 3.265-7.665-2.515-15.051-4.399-22.122-5.673-38.152-6.872-77.318 2.909-93.508 41.478-4.231 10.072-6.265 20.958-6.744 31.841l12.999.155c.488-10.17 2.241-17.467 5.772-26.953 14.428-34.34 50.429-39.978 83.402-32.887zM22.618 260.367a3.441 3.441 0 01-6.101-2.179V137.815c0-15.015 12.326-27.348 27.348-27.348 15.017 0 27.338 12.335 27.338 27.348v97.873a3.445 3.445 0 01-3.238 3.426c-8.59.517-16.702 2.605-24.081 5.977a68.096 68.096 0 00-17.123 11.229 71.915 71.915 0 00-4.143 4.047zm112.89-21.371H87.691a3.441 3.441 0 01-3.44-3.44V89.29c0-15 12.348-27.348 27.349-27.348 15.092 0 27.348 12.41 27.348 27.348v146.266a3.441 3.441 0 01-3.44 3.44zm68.879 0H156.57a3.441 3.441 0 01-3.44-3.44V43.837c0-15.092 12.41-27.349 27.348-27.349 15.092 0 27.349 12.411 27.349 27.349v191.719a3.441 3.441 0 01-3.44 3.44zm44.534 6.246a69.284 69.284 0 00-23.964-6.076 3.442 3.442 0 01-3.41-3.44V89.753c0-15.098 12.406-27.338 27.347-27.338 15.008 0 27.348 12.323 27.348 27.338V257.99a3.472 3.472 0 01-1.048 2.459 3.432 3.432 0 01-4.851-.068l-.832-.85a70.652 70.652 0 00-20.59-14.289z";
const HAND_HI =
  "M252.362 337.64c7.675 1.654 15.79 4.087 24.294 7.345a3.41 3.41 0 011.772 1.196c2.318 2.98 5.89 3.173 8.979 1.32 2.85-1.618 5.703-3.933 8.22-6.033 3.182-2.654 6.742-5.876 10.284-9.206 6.134-5.763 12.12-11.688 18.071-17.639 6.379-6.374 12.782-10.478 18.849-12.7 10.864-3.981 22.372-2.395 30.291 6.172 9.032 9.273 8.887 23.928 4.012 35.141-2.704 6.225-7.15 12.657-13.666 18.936l-4.954 4.751-95.217 96.139c-24.394 23.484-47.433 32.722-81.258 32.722h-52.976c-57.686 0-103.203-47.228-103.203-104.528v-82.199c0-23.973 13.827-34.63 36.708-42.751 13.327-4.024 18.94-2.783 30.66-2.783h126.814c25.593 0 48.044 17.33 54.912 41.554 2.952 10.415 2.111 10.631 2.111 21.337-.047 2.32-2.246 3.998-4.502 3.265-7.665-2.515-15.051-4.399-22.122-5.673-38.152-6.872-77.318 2.909-93.508 41.478-4.231 10.072-6.265 20.958-6.744 31.841l12.999.155c.488-10.17 2.241-17.467 5.772-26.953 14.428-34.34 50.429-39.978 83.402-32.887zm5.94-92.398a69.29 69.29 0 00-23.965-6.076 3.443 3.443 0 01-3.41-3.44V99.134c0-15.099 12.407-27.339 27.347-27.339 15.008 0 17.968 12.323 17.968 27.339V257.99a3.472 3.472 0 01-1.048 2.459 3.432 3.432 0 01-4.851-.068l-.832-.85c-5.927-5.915-3.514-10.783-11.209-14.289zm-226.304 5.745a3.44 3.44 0 01-6.101-2.18V147.195c0-15.014 2.946-27.348 17.968-27.348 15.017 0 27.338 12.335 27.338 27.348v88.493c-.033 8.356-15.546-9.59-39.205 15.299zm103.51-11.991H97.072a3.441 3.441 0 01-3.44-3.44V98.671c0-15.001 2.967-27.349 17.968-27.349 15.092 0 27.348 12.411 27.348 27.349v136.885a3.441 3.441 0 01-3.44 3.44zm68.879 0h-38.436a3.441 3.441 0 01-3.44-3.44V53.217c0-15.092 3.029-27.348 17.967-27.348 15.092 0 27.349 12.41 27.349 27.348v182.339a3.441 3.441 0 01-3.44 3.44z";
export const pressHand = (tipX: number, cy: number, dir: 1 | -1): string => {
  // 원본 좌표계 397×512(손끝이 위) · rotate(90) 선적용 후 scale(s,-s)로 눕힌다:
  // (x,y) → (tipX - s·y, cy + 198.5s - s·x) = 손끝(y=0)이 tipX · 엄지(x=397)가 위 · 세로 중앙 cy.
  const s = 0.16;
  const body = `<g transform="translate(${tipX},${Math.round((cy + 198.5 * s) * 10) / 10}) scale(${s},${-s}) rotate(90)">
    <path d="${HAND_BASE}" fill="#000000" fill-rule="nonzero"/>
    <path d="${HAND_SKIN}" fill="#FDD0BF" fill-rule="nonzero"/>
    <path d="${HAND_HI}" fill="#FEDECF" fill-rule="nonzero"/>
  </g>`;
  return dir === 1 ? body : `<g transform="translate(${2 * tipX},0) scale(-1,1)">${body}</g>`;
};

/** HANDS 풍선 누르기 장면(고정형 · 라이트) · 두 손의 손가락이 풍선 옆면에 닿아 지그시 누르는 중 ·
 *  눌린 옆면은 물결 오목(제어점 안쪽 · §7-2). 되돌아온 결과는 그리지 않는다(까닭이 과제). */
export function balloonPressFig(): string {
  return `<svg viewBox="0 0 344 186" ${NS} fill="none" role="img" aria-label="입구를 묶은 고무풍선을 두 손이 양옆에서 지그시 누르고 있는 그림. 손가락이 닿은 풍선의 양 옆면이 안쪽으로 살짝 들어가 있다">
    <defs>
      <radialGradient id="u6rbBal" cx=".38" cy=".3" r="1">
        <stop offset="0" stop-color="#FFD9CE"/><stop offset=".55" stop-color="#F9A08C"/><stop offset="1" stop-color="#E06A55"/>
      </radialGradient>
    </defs>
    <ellipse cx="172" cy="168" rx="62" ry="6" fill="#2A3A5E" opacity=".1"/>
    <path d="M172 30 C202 30 220 50 222 76 C223 84 218 92 218 100 C218 108 223 116 221 124 C216 144 198 154 172 154 C146 154 128 144 123 124 C121 116 126 108 126 100 C126 92 121 84 122 76 C124 50 142 30 172 30 Z" fill="url(#u6rbBal)" stroke="#B84A38" stroke-width="2.2"/>
    <path d="M144 46 q-10 10 -12 26" stroke="#FFE3DA" stroke-width="3" opacity=".9" fill="none"/>
    <path d="M166 154 h12 l4 10 h-20 z" fill="#E06A55" stroke="#B84A38" stroke-width="1.8"/>
    ${pressHand(124, 100, 1)}
    ${pressHand(220, 100, -1)}
  </svg>`;
}

/** AIRSHOE 운동화 에어 주머니(고정형 · 라이트) · 착지 순간 옆모습 + 뒤축 공기층 확대 인셋.
 *  운동화 본체는 무료 벡터(스니커즈) 이식(뒤축 왼쪽 · 앞코 오른쪽으로 눕혀 좌표 재계산) ·
 *  자작 파랑 실루엣이 신발로 안 읽힌다는 사후 갤러리 검수(2026-08-01)로 교체.
 *  눌린 정도는 살짝만(변화 판정이 과제 · 입자 수 판독 과제 아님). */
export function airShoeFig(): string {
  return `<svg viewBox="0 0 344 186" ${NS} fill="none" role="img" aria-label="바닥에 막 닿은 운동화의 옆모습. 뒤축 밑창 속 공기층이 동그란 확대 그림으로 함께 그려져 있고 그 안에 기체 입자들이 있다">
    <path d="M8 152 h328" stroke="#B0B8C1" stroke-width="2.4"/>
    <ellipse cx="131" cy="152" rx="92" ry="5.5" fill="#2A3A5E" opacity=".11"/>
    <path d="M52 36 q17 -9 34 -11 M62 50 q14 -8 29 -9" stroke="#C2CDDA" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M45.1 77.6C71.8 72.2 94.1 71.9 111.8 77L143.8 123.1L81.6 126.3L45.1 77.6Z" fill="#000000" fill-rule="evenodd"/>
    <path d="M213.9 108.1L203.1 123.7L137.6 134.5L128.6 109.3C126.1 102.4 122 97.1 115.9 93.1C106.8 87.1 102.7 76.2 105.3 65.8C105.8 63.9 107 62.5 108.8 61.7C110.6 61 112.5 61.1 114.2 62L141.7 77.3C152.1 83.1 161.8 86.6 173.5 88.8L198.5 93.5C204.4 94.6 209 98.1 211.6 103.4L213.9 108.1ZM129.8 122L126.6 111.6C124.6 105.3 121.3 100.5 116.2 96.3L102 85C81.1 88.7 62.5 84.9 45.1 77.6L43.4 81.5C38.7 92.1 37.9 102.7 41.1 113.9L44 124.2L129.8 122L129.8 122Z" fill="#0d0b0c" fill-rule="evenodd"/>
    <path d="M213.9 108.1L203.1 123.7L137.6 134.5L128.6 109.3C128.1 108 127.6 106.8 127 105.6C141.2 109.7 153.8 116.7 169.6 117.8C184.7 118.8 199.2 111.4 213.9 108.1ZM129.8 122L126.6 111.6C125.8 109.1 124.8 106.8 123.5 104.7C119.8 103.7 116 103.1 112 102.8C100.2 102 86.1 108.7 74.6 111.1C64.7 113.2 55.2 110.4 46 108C43.1 102.3 42 94.9 41.3 87C38.5 95.8 38.5 104.6 41.1 113.9L44 124.2L129.8 122L129.8 122Z" fill="#000000" fill-rule="evenodd"/>
    <path d="M223.5 110.7C224.4 113.4 224.5 116.2 223.8 119.2C222.6 123.9 219.7 127.4 215.3 129.4L196.6 137.8C174.8 147.7 152.5 148.9 130.2 141.7C119.4 138.1 109.1 138.2 98.3 141.7L94.2 143.1C83.5 146.6 73.9 147.8 62.7 147.2L48.9 146.4C43.3 146 38.8 141.5 38.5 135.8L38 124.7C37.9 122.9 38.6 121.3 39.9 120C41.3 118.8 43 118.3 44.8 118.6L57.4 120.7C67.5 122.3 76.5 121.6 86.2 118.5L88.9 117.6C106.3 111.9 123 112.4 140.1 119.1C155.9 125.3 171.8 125.2 187.6 118.8L216 107.3C217.5 106.7 219 106.7 220.5 107.4C222 108 223 109.2 223.5 110.7Z" fill="#ebe1e3" fill-rule="evenodd"/>
    <path d="M42.4 118.7C43.1 118.5 43.9 118.5 44.8 118.6L57.4 120.7C67.5 122.3 76.5 121.6 86.2 118.5L88.9 117.6C106.3 111.9 123 112.4 140.1 119.1C155.9 125.3 171.8 125.2 187.6 118.8L213.9 108.1L213.9 108.1L192.2 122C171.9 134.8 150.5 129.3 128.1 122C117.3 118.5 107.1 118.5 96.3 122L92.1 123.4C81.5 126.9 69.1 129.1 58.6 125L43.9 119.4C43.4 119.1 42.9 118.9 42.4 118.7Z" fill="#d8d3d3" fill-rule="evenodd"/>
    <rect x="48" y="130" width="42" height="12" rx="6" fill="#EAF2FB" stroke="#8B99AC" stroke-width="1.5" opacity=".94"/>
    <circle cx="69" cy="136" r="27" fill="none" stroke="#5E86B4" stroke-width="1.6" stroke-dasharray="4 4"/>
    <path d="M96 128 q58 -50 118 -54" stroke="#5E86B4" stroke-width="1.6" fill="none" stroke-dasharray="4 4"/>
    <circle cx="262" cy="58" r="46" fill="#F7FAFE" stroke="#5E86B4" stroke-width="2.2"/>
    <path d="M224 42 q-2 18 6 32" stroke="#D8E8FA" stroke-width="2.4" fill="none" opacity=".9"/>
    ${g6part(246, 44, 0.7, 1, 4.4)}${g6part(278, 38, 2.4, 1, 4.4)}${g6part(256, 70, 4.1, 1, 4.4)}${g6part(282, 64, 5.5, 1, 4.4)}
    <text x="262" y="118" text-anchor="middle" font-size="11" fill="#4E5968">밑창 공기층 확대</text>
  </svg>`;
}

/** SQZ 말랑한 밀폐 페트병 누르기(고정형 · 라이트) · 두 손이 병 몸통을 누르는 중 · 옆면이 살짝
 *  들어간 실루엣 한 덩어리(§7-2 함몰 문법 · 제어점 안쪽). 뚜껑 닫힘이 밀폐 단서. */
export function bottleSqueezeFig(): string {
  return `<svg viewBox="0 0 344 186" ${NS} fill="none" role="img" aria-label="뚜껑을 꼭 닫은 말랑한 페트병을 두 손으로 양옆에서 누르고 있는 그림. 병의 양 옆면이 살짝 안으로 들어가 있다">
    <defs>
      <linearGradient id="u6rbPet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FDFEFF"/><stop offset=".5" stop-color="#EAF2FB"/><stop offset="1" stop-color="#D3E0EF"/>
      </linearGradient>
    </defs>
    <ellipse cx="172" cy="164" rx="46" ry="5.5" fill="#2A3A5E" opacity=".1"/>
    <rect x="158" y="16" width="28" height="13" rx="3" fill="#5E9ED6" stroke="#3D6E9E" stroke-width="1.8"/>
    <path d="M162 29 h20 l4 12 h-28 z" fill="url(#u6rbPet)" stroke="#8B95A1" stroke-width="2"/>
    <path d="M158 41 C147 52 143 66 145 80 C154 90 154 104 146 114 C144 132 149 148 155 156 Q158 160 163 160 H181 Q186 160 189 156 C195 148 200 132 198 114 C190 104 190 90 199 80 C201 66 197 52 186 41 Z" fill="url(#u6rbPet)" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M191 88 q5 5 2 12 M153 88 q-3 6 -1 11" stroke="#B9C4D2" stroke-width="1.5" fill="none"/>
    <path d="M152 54 q-3 10 -2 20" stroke="#FDFEFF" stroke-width="2.4" opacity=".9" fill="none"/>
    ${pressHand(142, 100, 1)}
    ${pressHand(202, 100, -1)}
  </svg>`;
}

// ── (rest-c 저작분) ──

/** VC 감압 용기(파라미터형 · 라이트) · 유리 용기 속 묶은 풍선 + 펌프. 시작 상태 중립(풍선 크기
 *  변화 미제시 · 변화 예측이 과제). 계기 숫자 없음 · 화살표는 공기가 빠지는 방향만. */
export function gasVacuumJarFig(_o?: { inner?: "balloon" }): string {
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="받침대 위 투명한 감압 용기 안에 묶은 고무풍선이 들어 있고, 옆의 펌프가 관으로 연결되어 용기 속 공기를 빼내는 그림">
    <defs>
      <linearGradient id="u6rcJar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F4F9FE"/><stop offset="1" stop-color="#DCE8F5"/>
      </linearGradient>
      <radialGradient id="u6rcBal" cx=".38" cy=".32" r="1">
        <stop offset="0" stop-color="#FFD9CE"/><stop offset=".55" stop-color="#F9A08C"/><stop offset="1" stop-color="#E06A55"/>
      </radialGradient>
    </defs>
    <ellipse cx="132" cy="172" rx="92" ry="6" fill="#2A3A5E" opacity=".11"/>
    <path d="M52 160 h160 l-6 12 h-148 z" fill="#B9C2CE" stroke="#7A8798" stroke-width="1.8"/>
    <path d="M62 160 v-88 q0 -36 70 -36 q70 0 70 36 v88" fill="url(#u6rcJar)" stroke="#8B95A1" stroke-width="2.4" opacity=".92"/>
    <path d="M72 76 q4 -22 26 -30" stroke="#FDFEFF" stroke-width="2.6" opacity=".9" fill="none"/>
    <circle cx="132" cy="104" r="26" fill="url(#u6rcBal)" stroke="#B84A38" stroke-width="2"/>
    <path d="M126 130 h12 l3 7 h-18 z" fill="#E06A55" stroke="#B84A38" stroke-width="1.6"/>
    <path d="M122 86 q-5 7 -5 16" stroke="#FFE3DA" stroke-width="2.2" opacity=".9" fill="none"/>
    <path d="M202 132 h44" stroke="#7A8798" stroke-width="5"/>
    <path d="M212 126 h14 m0 0 l-5 -4 m5 4 l-5 4" stroke="#F25757" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <rect x="246" y="112" width="18" height="42" rx="4" fill="#C9D2DC" stroke="#7A8798" stroke-width="1.8"/>
    <rect x="250" y="86" width="10" height="30" rx="3" fill="#8B99AC" stroke="#5E6B7E" stroke-width="1.4"/>
    <rect x="240" y="78" width="30" height="10" rx="4" fill="#7C8899" stroke="#46525F" stroke-width="1.4"/>
    <text x="255" y="172" text-anchor="middle" font-size="11" fill="#66707E">펌프</text>
  </svg>`;
}

/** AIRBED 공기 침대 단면(고정형 · 라이트) · 누운 사람 자리가 살짝 꺼진 상태(문두가 관찰 서술).
 *  속 기체 입자 표시 · 스틱맨은 손그림 라인. */
export function airBedFig(): string {
  return `<svg viewBox="0 0 344 176" ${NS} fill="none" role="img" aria-label="공기를 채운 침대의 단면 그림. 누운 사람의 몸 아래가 살짝 눌려 들어가 있고 침대 속에 기체 입자들이 그려져 있다">
    <defs>
      <linearGradient id="u6rcBed" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#B8E0D0"/><stop offset=".55" stop-color="#8CC7B0"/><stop offset="1" stop-color="#63A98E"/>
      </linearGradient>
    </defs>
    <ellipse cx="172" cy="156" rx="130" ry="6" fill="#2A3A5E" opacity=".11"/>
    <path d="M40 152 C38 118 48 107 64 106 L104 105 C114 105 116 113 124 117 C140 124 168 124 184 117 C192 113 194 105 204 105 L280 106 C296 107 306 118 304 152 Z" fill="url(#u6rcBed)" stroke="#3F7A62" stroke-width="2.2"/>
    <path d="M54 116 q12 -8 32 -9" stroke="#DDF2E9" stroke-width="2.8" opacity=".85" fill="none"/>
    <path d="M96 152 v-38 M172 152 v-30 M248 152 v-40" stroke="#4E8D73" stroke-width="1.6" opacity=".55"/>
    ${g6part(120, 138, 0.8, 1, 4)}${g6part(198, 136, 2.6, 1, 4)}${g6part(258, 138, 4.4, 1, 4)}${g6part(76, 140, 5.6, 1, 4)}
    <g stroke="#333D4B" stroke-width="2.6" stroke-linecap="round" fill="none">
      <circle cx="94" cy="88" r="7.5" fill="#fff"/>
      <path d="M101 92 Q122 110 148 114 L182 115 M182 115 L222 106 L252 103 M124 107 l12 -13 M148 114 l16 -10"/>
    </g>
  </svg>`;
}

/** BUB 방울 상승 모식도(고정형 · 라이트) · 깊이가 다른 방울 세 개(위로 갈수록 큼) + 속 입자
 *  (개수 동일 · 간격 차등). 개수 낭독 금지 · 크기 변화는 관찰 서술이라 aria 허용. */
export function bubbleRiseFig(): string {
  const bub = (cx: number, cy: number, r: number, pr: number, spread: number): string => {
    const pts: [number, number][] = [[0, -spread], [-spread * 0.87, spread * 0.5], [spread * 0.87, spread * 0.5]];
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#EAF4FE" stroke="#7FA9D4" stroke-width="2"/>
      <path d="M${cx - r * 0.5} ${cy - r * 0.62} q-${r * 0.28} ${r * 0.3} -${r * 0.22} ${r * 0.62}" stroke="#FDFEFF" stroke-width="2" fill="none" opacity=".95"/>
      ${pts.map(([dx, dy]) => g6dot(cx + dx, cy + dy, pr)).join("")}`;
  };
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="물속 단면 모식도. 깊은 곳에서 수면 쪽으로 올라가는 방울 세 개가 위로 갈수록 커지며, 방울마다 속에 기체 입자가 그려져 있다">
    <rect x="8" y="26" width="328" height="182" rx="10" fill="#D6E9FA"/>
    <rect x="8" y="118" width="328" height="90" rx="10" fill="#B5D5F1"/>
    <rect x="8" y="170" width="328" height="38" rx="10" fill="#8FBBE6"/>
    <path d="M10 28 q14 -8 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0 t28 0" stroke="#6FA8E0" stroke-width="2.4" fill="none"/>
    <text x="326" y="46" text-anchor="end" font-size="11" fill="#4E5968">수면</text>
    <path d="M150 168 q10 -34 4 -62 q-6 -26 6 -52" stroke="#9FC3E8" stroke-width="1.6" stroke-dasharray="4 5" fill="none"/>
    ${bub(158, 178, 13, 2.9, 5.2)}
    ${bub(150, 116, 19, 2.9, 8.6)}
    ${bub(160, 56, 26, 2.9, 12.5)}
    <text x="326" y="196" text-anchor="end" font-size="11" fill="#33517A">깊은 곳</text>
  </svg>`;
}

/** CUSHION 완충 공기 봉투 상자 단면(고정형 · 라이트) · 유리컵을 공기 봉투들이 둘러싼 택배 상자.
 *  훅 소재(뽁뽁이 캡)와 다른 사물(큰 공기 봉투) · 충격 장면은 그리지 않는다(원리가 과제). */
export function cushionBoxFig(): string {
  const pouch = (x: number, y: number, w: number, h: number, rot: number): string =>
    `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#EAF3FC" stroke="#8FA9C6" stroke-width="1.8"/>
      <path d="M${x + w * 0.24} ${y + h * 0.3} q ${w * 0.1} ${h * 0.16} 0 ${h * 0.4}" stroke="#FDFEFF" stroke-width="2" fill="none" opacity=".95"/>
      ${g6dot(x + w * 0.42, y + h * 0.5, 2.6)}${g6dot(x + w * 0.66, y + h * 0.38, 2.6)}${g6dot(x + w * 0.62, y + h * 0.66, 2.6)}
    </g>`;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="택배 상자의 단면. 가운데 유리컵을 공기를 채운 말랑한 봉투들이 사방에서 둘러싸고 있다">
    <defs>
      <linearGradient id="u6rcBox" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E4C08E"/><stop offset=".6" stop-color="#CDA26A"/><stop offset="1" stop-color="#B0854E"/>
      </linearGradient>
      <linearGradient id="u6rcCup" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#D9E4F0"/>
      </linearGradient>
    </defs>
    <ellipse cx="172" cy="172" rx="108" ry="6" fill="#2A3A5E" opacity=".11"/>
    <path d="M64 40 h216 v128 h-216 z" fill="url(#u6rcBox)" stroke="#7E5A2E" stroke-width="2.4"/>
    <path d="M64 40 l-16 -18 h216 l16 18 z" fill="#D9B27E" stroke="#7E5A2E" stroke-width="2"/>
    <path d="M72 48 q20 -5 44 -6" stroke="#F2DBB6" stroke-width="2.4" opacity=".8" fill="none"/>
    <rect x="74" y="52" width="196" height="106" rx="6" fill="#F6EEDF"/>
    ${pouch(84, 58, 74, 40, -8)}
    ${pouch(190, 56, 72, 40, 7)}
    ${pouch(82, 112, 76, 40, 6)}
    ${pouch(188, 114, 74, 40, -6)}
    <path d="M152 84 h40 l-5 52 q-1 8 -8 8 h-14 q-7 0 -8 -8 z" fill="url(#u6rcCup)" stroke="#8B95A1" stroke-width="2.2" opacity=".96"/>
    <path d="M158 90 q-1 20 2 40" stroke="#FDFEFF" stroke-width="2.2" opacity=".95" fill="none"/>
  </svg>`;
}

/** RISE 하늘로 오르는 풍선(고정형 · 라이트) · 세 고도의 같은 풍선(위로 갈수록 큼 · 문두가 관찰
 *  서술이라 크기 변화 표현 허용) + 상승 점선. 터짐 장면은 그리지 않는다. */
export function riseBalloonFig(): string {
  const bal = (cx: number, cy: number, r: number): string =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#u6rcRise)" stroke="#B8503E" stroke-width="1.8"/>
     <path d="M${cx - r * 0.44} ${cy - r * 0.5} q-${r * 0.24} ${r * 0.34} -${r * 0.14} ${r * 0.72}" stroke="#FFE3DA" stroke-width="1.8" fill="none" opacity=".9"/>
     <path d="M${cx - 3.5} ${cy + r} h7 l2 ${r * 0.22} h-11 z" fill="#E06A55"/>
     <path d="M${cx} ${cy + r + r * 0.22} q ${r * 0.16} ${r * 0.5} -${r * 0.1} ${r * 0.9}" stroke="#B8503E" stroke-width="1.3" fill="none"/>`;
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="땅에서 하늘 높이 올라가는 헬륨 풍선을 세 높이에서 그린 그림. 높이 올라갈수록 풍선이 커져 있다">
    <defs>
      <linearGradient id="u6rcSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#B7D9F8"/><stop offset=".6" stop-color="#D7EAFB"/><stop offset="1" stop-color="#EEF6FE"/>
      </linearGradient>
      <radialGradient id="u6rcRise" cx=".38" cy=".32" r="1">
        <stop offset="0" stop-color="#FFD9CE"/><stop offset=".55" stop-color="#F9A08C"/><stop offset="1" stop-color="#E06A55"/>
      </radialGradient>
    </defs>
    <rect x="8" y="10" width="328" height="182" rx="10" fill="url(#u6rcSky)"/>
    <path d="M8 192 h328 v14 h-328 z" fill="#BFDCC1"/>
    <path d="M8 192 h328" stroke="#8FBC94" stroke-width="2"/>
    <ellipse cx="70" cy="52" rx="26" ry="10" fill="#FDFEFF" opacity=".9"/>
    <ellipse cx="94" cy="58" rx="20" ry="8" fill="#FDFEFF" opacity=".75"/>
    <ellipse cx="272" cy="96" rx="24" ry="9" fill="#FDFEFF" opacity=".8"/>
    <path d="M196 176 q-18 -34 -6 -62 q10 -24 -2 -52" stroke="#B0BFD0" stroke-width="1.6" stroke-dasharray="4 5" fill="none"/>
    ${bal(206, 172, 11)}
    ${bal(186, 112, 16)}
    ${bal(196, 42, 23)}
  </svg>`;
}

/** VG 감압 측정 그래프 · gasPvGraphV2Fig의 축 라벨 교체 wrap(§7-3 · 용기 속 압력 축 · 소수 눈금). */
export function vacuumGraphFig(o: { k: number; pMax: number; pStep: number; vMax: number; vStep: number; dots?: number[] }): string {
  return gasPvGraphV2Fig(o).replace("압력(기압)", "용기 속 압력(기압)");
}

// ── (rest-d 저작분) ──

/** GHC 가열 후 입자 모형 고르기 ①~⑤(고정형 · 라이트 · shuffle:false 전용) · 기준 (가) = 가열 전
 *  (입자 6 · 짧은 꼬리). 정답 ④ = 부피 커짐 · 입자 6 · 긴 꼬리(e248 압축판 정답 ③과 칸 분리).
 *  ① 개수 감소 · ② 크기 커짐 · ③ 부피 그대로 · ⑤ 개수 증가 함정. */
export function gasHeatChoicesFig(): string {
  const mini = (x: number, cw: number, y: number, no: string, w: number, count: 3 | 6 | 9, r: number, tail: 1 | 2): string => {
    const bx = x + (cw - w) / 2;
    const pts = PSET[count]
      .map(([fx, fy], i) => g6part(bx + 9 + fx * (w - 18), y + 20 + fy * 44, ((i * 137 + 40) % 360) * (Math.PI / 180), tail, r))
      .join("");
    return `<text x="${x + cw / 2}" y="${y + 10}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${no}</text>
      <rect x="${bx}" y="${y + 14}" width="${w}" height="56" rx="7" fill="#F7FAFE" stroke="#8B95A1" stroke-width="1.8"/>${pts}`;
  };
  const base = PSET[6].map(([fx, fy], i) => g6part(130 + 9 + fx * 66, 30 + 8 + fy * 42, ((i * 137 + 40) % 360) * (Math.PI / 180), 1, 4.2)).join("");
  return `<svg viewBox="0 0 344 268" ${NS} fill="none" role="img" aria-label="기준이 되는 가열 전 입자 모형 한 개와 가열 후 후보 모형 다섯 개">
    <text x="172" y="18" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">(가) 데우기 전</text>
    <rect x="130" y="26" width="84" height="58" rx="8" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2"/>${base}
    ${mini(4, 108, 100, "①", 84, 3, 4.2, 2)}
    ${mini(118, 108, 100, "②", 84, 6, 6, 1)}
    ${mini(232, 108, 100, "③", 84, 6, 4.2, 2)}
    ${mini(28, 136, 186, "④", 118, 6, 4.2, 2)}
    ${mini(180, 136, 186, "⑤", 118, 9, 4.2, 2)}
  </svg>`;
}

/** WARM 끝 막은 주사기 물중탕 단독(고정형 · 라이트) · 따뜻한 물 + 피스톤이 밀려 나가는
 *  방향 화살표(결과는 문두 서술 · 까닭이 과제). 김 곡선은 사후 갤러리 검수(2026-08-01)로 제거:
 *  피스톤 곁 갈색 호가 떨림 표시로 오독 · 따뜻함은 물 색과 라벨이 전달(WB 계보 공통 조치). */
export function syringeWarmFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="끝을 막은 주사기를 따뜻한 물이 든 비커에 세워 담근 그림. 피스톤 옆에 위쪽으로 향한 화살표가 있다">
    <ellipse cx="172" cy="176" rx="80" ry="6" fill="#2A3A5E" opacity=".11"/>
    <path d="M116 84 v74 q0 10 10 10 h92 q10 0 10 -10 v-74" fill="none" stroke="#8B95A1" stroke-width="2.6"/>
    <rect x="119" y="94" width="106" height="71" rx="7" fill="#FADCC8"/>
    <rect x="158" y="52" width="22" height="98" rx="7" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2.2"/>
    <rect x="162" y="62" width="14" height="8" rx="2.5" fill="#8B99AC"/>
    <rect x="166.5" y="34" width="5" height="30" fill="#8B99AC"/>
    <rect x="159" y="27" width="20" height="8" rx="3.5" fill="#8B99AC"/>
    ${g6dot(165, 92, 3.6)}${g6dot(174, 106, 3.6)}${g6dot(166, 122, 3.6)}${g6dot(175, 136, 3.6)}
    <path d="M196 60 v-24 m0 0 l-6 8 m6 -8 l6 8" stroke="#F25757" stroke-width="3" fill="none" stroke-linecap="round"/>
    <text x="262" y="150" text-anchor="middle" font-size="11" fill="#66707E">따뜻한 물</text>
  </svg>`;
}

/** QT2 기체 양이 다른 두 직선(고정형 · 라이트) · 눈금 없는 정성 온도-부피 · A(위) B(아래) ·
 *  같은 온도 비교용 세로 점선 하나. */
export function gasTvQual2Fig(): string {
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="압력이 일정할 때 온도에 따른 두 기체 A와 B의 부피를 나타낸 그래프. 눈금 없이 오른쪽 위로 오르는 직선 두 개가 있고 A가 B보다 위에 있다">
    <line x1="48" y1="26" x2="48" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="168" x2="320" y2="168" stroke="#B0B8C1" stroke-width="1.6"/>
    <line x1="48" y1="118" x2="308" y2="34" stroke="#5E6B7E" stroke-width="3" stroke-linecap="round"/>
    <line x1="48" y1="146" x2="308" y2="98" stroke="#8B99AC" stroke-width="3" stroke-linecap="round"/>
    <line x1="196" y1="168" x2="196" y2="60" stroke="#C6CFDA" stroke-width="1.6" stroke-dasharray="5 5"/>
    <circle cx="196" cy="70" r="4.4" fill="#5E6B7E"/>
    <circle cx="196" cy="119" r="4.4" fill="#8B99AC"/>
    <text x="318" y="34" font-size="12.5" font-weight="700" fill="#4E5968">A</text>
    <text x="318" y="100" font-size="12.5" font-weight="700" fill="#8B99AC">B</text>
    <text x="48" y="184" text-anchor="middle" font-size="10.5" fill="#8B95A1">0</text>
    <text x="10" y="16" font-size="11" fill="#4E5968">부피</text>
    <text x="320" y="198" text-anchor="end" font-size="11" fill="#4E5968">온도(℃)</text>
  </svg>`;
}

/** BALCOLD 실온·냉장 풍선 2컷(고정형 · 라이트) · (가) 실온의 팽팽한 풍선 · (나) 냉장고에서 막
 *  꺼낸 쪼그라든 풍선(함몰 실루엣 한 덩어리 · 제어점 안쪽 · §7-2). 장소는 문두가 서술. */
export function coldBalloonFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="같은 고무풍선 두 개. 가는 둥글고 팽팽하게 부풀어 있고, 나는 옆면이 쪼글쪼글하게 줄어들어 있다">
    <defs>
      <radialGradient id="u6rdBal" cx=".38" cy=".32" r="1">
        <stop offset="0" stop-color="#D9E8FF"/><stop offset=".55" stop-color="#9FBDF2"/><stop offset="1" stop-color="#6E90D6"/>
      </radialGradient>
    </defs>
    <ellipse cx="96" cy="164" rx="44" ry="5.5" fill="#2A3A5E" opacity=".1"/>
    <circle cx="96" cy="88" r="52" fill="url(#u6rdBal)" stroke="#4A66A8" stroke-width="2.2"/>
    <path d="M64 58 q-9 13 -8 30" stroke="#EDF4FF" stroke-width="2.6" opacity=".9" fill="none"/>
    <path d="M90 140 h12 l4 10 h-20 z" fill="#6E90D6" stroke="#4A66A8" stroke-width="1.8"/>
    <text x="96" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    <ellipse cx="248" cy="164" rx="34" ry="5" fill="#2A3A5E" opacity=".1"/>
    <path d="M248 62 C266 62 280 74 282 92 C272 98 272 110 281 118 C276 132 264 140 250 140 C236 140 226 133 221 121 C229 112 228 100 219 93 C222 76 232 62 248 62 Z" fill="url(#u6rdBal)" stroke="#4A66A8" stroke-width="2.2"/>
    <path d="M231 74 q-5 8 -5 16" stroke="#EDF4FF" stroke-width="2.2" opacity=".9" fill="none"/>
    <path d="M266 92 q4 6 1 12 M232 104 q-3 5 -1 10" stroke="#5877B8" stroke-width="1.5" fill="none"/>
    <path d="M242 140 h12 l4 10 h-20 z" fill="#6E90D6" stroke="#4A66A8" stroke-width="1.8"/>
    <text x="248" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
  </svg>`;
}

/** SYDUO 두 가지 조작 대비(고정형 · 라이트) · (가) 피스톤을 손으로 누르는 주사기 · (나) 따뜻한
 *  물에 담근 주사기. 어느 컷이 어떤 조작인지 판독이 과제의 재료. */
export function syringeTwoOpsFig(): string {
  const syr = (x: number, y: number): string => `
    <rect x="${x}" y="${y}" width="20" height="84" rx="6" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2"/>
    <rect x="${x + 3.5}" y="${y + 9}" width="13" height="7" rx="2.5" fill="#8B99AC"/>
    <rect x="${x + 7.5}" y="${y - 22}" width="5" height="24" fill="#8B99AC"/>
    <rect x="${x + 1}" y="${y - 28}" width="18" height="7" rx="3" fill="#8B99AC"/>
    ${g6dot(x + 7, y + 32, 3.4)}${g6dot(x + 13, y + 46, 3.4)}${g6dot(x + 8, y + 62, 3.4)}${g6dot(x + 13, y + 74, 3.4)}`;
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="끝을 막은 같은 주사기 두 개. 가는 피스톤 위를 손이 아래로 누르고 있고, 나는 따뜻한 물이 든 비커에 세워져 있다">
    <g>
      ${syr(86, 74)}
      <path d="M96 40 v-14" stroke="#F25757" stroke-width="3" stroke-linecap="round"/>
      <path d="M96 44 l-6 -9 m6 9 l6 -9" stroke="#F25757" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M66 12 q30 -10 58 2 q8 4 4 10 q-4 5 -12 3 q-20 -5 -40 -2 q-9 1 -12 -4 q-3 -6 2 -9 z" fill="#FBD9C0" stroke="#C98F66" stroke-width="1.8"/>
      <text x="96" y="192" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    </g>
    <g>
      <path d="M196 96 v64 q0 10 10 10 h72 q10 0 10 -10 v-64" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
      <rect x="199" y="106" width="86" height="60" rx="6" fill="#FADCC8"/>
      ${syr(232, 66)}
      <text x="242" y="192" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
    </g>
  </svg>`;
}

/** WB2 두 물중탕 설계 대조(고정형 · 라이트) · (가) 기체 부분까지 물에 잠긴 주사기 · (나) 물이
 *  얕아 기체 부분이 물 밖에 나온 주사기(설계 결함 판독이 과제). 둘 다 따뜻한 물(물 색·문두가
 *  전달) · 김 곡선은 사후 갤러리 검수(2026-08-01)로 제거(피스톤 곁 갈색 호 오독 · WB 계보 공통). */
export function waterBath2Fig(): string {
  const set = (x: number, label: string, waterH: number): string => {
    const top = 150 - waterH;
    return `<g>
      <path d="M${x} 78 v72 q0 9 9 9 h64 q9 0 9 -9 v-72" fill="none" stroke="#8B95A1" stroke-width="2.4"/>
      <rect x="${x + 3}" y="${top}" width="76" height="${waterH + 6}" rx="6" fill="#FADCC8"/>
      <rect x="${x + 31}" y="58" width="20" height="88" rx="6" fill="#F7FAFE" stroke="#8B95A1" stroke-width="2"/>
      <rect x="${x + 34.5}" y="66" width="13" height="7" rx="2.5" fill="#8B99AC"/>
      <rect x="${x + 38.5}" y="40" width="5" height="24" fill="#8B99AC"/>
      <rect x="${x + 32}" y="34" width="18" height="7" rx="3" fill="#8B99AC"/>
      ${g6dot(x + 38, 96, 3.2)}${g6dot(x + 45, 112, 3.2)}${g6dot(x + 39, 128, 3.2)}
      <text x="${x + 41}" y="178" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">${label}</text>
    </g>`;
  };
  return `<svg viewBox="0 0 344 192" ${NS} fill="none" role="img" aria-label="따뜻한 물이 든 비커에 끝을 막은 주사기를 세운 실험 장치 두 개. 가는 물이 깊어 주사기의 기체가 든 부분까지 잠겨 있고, 나는 물이 얕아 기체가 든 부분이 물 밖에 나와 있다">
    ${set(50, "(가)", 66)}
    ${set(212, "(나)", 22)}
  </svg>`;
}

// ── (rest-e 저작분) ──

/** COIN 병 입구 동전(고정형 · 라이트) · 차가운 주스 병 입구에 동전이 얹혀 있는 장면(동전이 살짝
 *  기운 순간 · 파운드리 재질 문법). 들썩임·감싸 쥐기는 문두가 서술 · 손은 그리지 않는다(사후 검수
 *  3차 확정: 미는 손도 감싸 쥔 손 이식도 어색해 손 무그림 + 문두 "그림처럼" 삭제로 정리). */
export function coinBottleFig(): string {
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="차가운 유리병의 입구 위에 동전이 얹혀 있는 그림. 동전 한쪽이 살짝 들려 있다">
    <defs>
      <linearGradient id="u6reBot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#EDF6EE"/><stop offset=".5" stop-color="#CFE8D3"/><stop offset="1" stop-color="#A8D0AF"/>
      </linearGradient>
      <linearGradient id="u6reCoin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F5D98A"/><stop offset="1" stop-color="#D2A64B"/>
      </linearGradient>
    </defs>
    <ellipse cx="172" cy="180" rx="56" ry="6" fill="#2A3A5E" opacity=".11"/>
    <path d="M154 60 q-2 -18 6 -26 h24 q8 8 6 26 q14 14 14 44 v58 q0 14 -14 14 h-36 q-14 0 -14 -14 v-58 q0 -30 14 -44 z" fill="url(#u6reBot)" stroke="#5F8F68" stroke-width="2.2"/>
    <path d="M150 84 q-4 22 -2 44" stroke="#F4FBF5" stroke-width="2.6" opacity=".9" fill="none"/>
    <path d="M148 118 q10 4 20 2 M180 120 q8 2 16 -1" stroke="#7FB08A" stroke-width="1.4" fill="none" opacity=".6"/>
    <g transform="rotate(-8 172 30)">
      <ellipse cx="172" cy="33.5" rx="23" ry="6.5" fill="#B8923F" stroke="#9A7626" stroke-width="1.4"/>
      <ellipse cx="172" cy="29.5" rx="23" ry="6.5" fill="url(#u6reCoin)" stroke="#9A7626" stroke-width="1.6"/>
      <path d="M155 28 q9 -3 22 -3" stroke="#FBEBBB" stroke-width="1.6" opacity=".9" fill="none"/>
    </g>
  </svg>`;
}

/** EGG 집기병 위 삶은 달걀(고정형 · 라이트) · 달걀이 입구에 얹힌 병을 얼음물 통에 담근 시작
 *  장면(빨려 드는 결과는 그리지 않는다 · 까닭이 과제). */
export function eggJarFig(): string {
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="입구가 좁은 유리병 위에 껍데기를 깐 삶은 달걀이 얹혀 있고, 병째 얼음물이 든 큰 통에 담가 둔 그림">
    <defs>
      <linearGradient id="u6reJar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F4F9FE"/><stop offset="1" stop-color="#DCE8F5"/>
      </linearGradient>
    </defs>
    <ellipse cx="172" cy="184" rx="110" ry="6" fill="#2A3A5E" opacity=".11"/>
    <path d="M60 96 v72 q0 12 12 12 h200 q12 0 12 -12 v-72" fill="none" stroke="#8B95A1" stroke-width="2.6"/>
    <rect x="64" y="106" width="216" height="68" rx="8" fill="#D5E9FB"/>
    <rect x="84" y="118" width="20" height="15" rx="4" fill="#FDFEFF" stroke="#9DB8D4" stroke-width="1.6" transform="rotate(-14 94 125)"/>
    <rect x="244" y="128" width="18" height="14" rx="4" fill="#FDFEFF" stroke="#9DB8D4" stroke-width="1.6" transform="rotate(12 253 135)"/>
    <path d="M148 70 q-2 -12 8 -16 h32 q10 4 8 16 q10 10 10 30 v42 q0 12 -12 12 h-44 q-12 0 -12 -12 v-42 q0 -20 10 -30 z" fill="url(#u6reJar)" stroke="#8B95A1" stroke-width="2.2" opacity=".95"/>
    <path d="M146 92 q-3 18 -1 34" stroke="#FDFEFF" stroke-width="2.4" opacity=".9" fill="none"/>
    <ellipse cx="172" cy="46" rx="20" ry="25" fill="#FDF6E8" stroke="#C9B48E" stroke-width="2"/>
    <path d="M160 32 q-5 8 -5 16" stroke="#FFFDF6" stroke-width="2.4" opacity=".95" fill="none"/>
    <text x="286" y="100" text-anchor="middle" font-size="11" fill="#4E7191">얼음물</text>
  </svg>`;
}

/** BALW 병 입구 풍선 데움 단독(고정형 · 라이트) · 김이 나는 따뜻한 물 대야 + 부푼 풍선.
 *  파일럿 BAL2(2컷 매칭 · e343)와 달리 단독 1컷: 2컷판을 쓰면 e343의 매칭 정답이 인쇄되는
 *  교차 유출이라 분리(§7-3). */
export function bottleWarmFig(): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="김이 나는 따뜻한 물이 담긴 대야에 유리병이 세워져 있고, 병 입구에 씌운 고무풍선이 봉긋하게 부풀어 있는 그림">
    <ellipse cx="172" cy="176" rx="76" ry="6" fill="#2A3A5E" opacity=".11"/>
    <path d="M108 122 h128 l-12 44 h-104 z" fill="#FADCC8" stroke="#C98F66" stroke-width="2"/>
    <path d="M126 112 q7 -12 0 -22 M156 110 q7 -12 0 -22 M186 112 q7 -12 0 -22 M216 110 q7 -12 0 -22" stroke="#D9A88C" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M152 78 q0 -9 7 -11 v-9 h30 v9 q7 2 7 11 v52 q0 11 -9 13 h-26 q-9 -2 -9 -13 z" fill="#F2F8FE" stroke="#8B95A1" stroke-width="2.2"/>
    <path d="M158 82 q-2 16 0 34" stroke="#FDFEFF" stroke-width="2.2" opacity=".9" fill="none"/>
    <ellipse cx="172" cy="34" rx="17" ry="21" fill="#FBD3C4" stroke="#D98D6E" stroke-width="2"/>
    <path d="M162 20 q-5 7 -5 14" stroke="#FEEFE9" stroke-width="2" opacity=".95" fill="none"/>
    <path d="M164 54 h16" stroke="#D98D6E" stroke-width="2"/>
    <text x="278" y="150" text-anchor="middle" font-size="11" fill="#8A5A34">따뜻한 물</text>
  </svg>`;
}

/** WINTERKICK 같은 공의 두 국면(고정형 · 라이트) · (가) 서리 내린 밖에서 쪼그라든 공 ·
 *  (나) 착지 순간 바닥에 눌린 공. 어느 국면이 어떤 원인인지 짝 짓기가 과제(원인은 그리지 않음). */
export function winterKickFig(): string {
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="같은 공의 두 장면. 가는 서리가 내린 풀밭 위에서 옆면이 쪼글쪼글 줄어든 공이고, 나는 공중에서 떨어져 바닥에 막 닿아 아랫면이 납작하게 눌린 공이다">
    <defs>
      <radialGradient id="u6reBall" cx=".38" cy=".32" r="1">
        <stop offset="0" stop-color="#FFE3C8"/><stop offset=".55" stop-color="#F2AE72"/><stop offset="1" stop-color="#D9853F"/>
      </radialGradient>
    </defs>
    <path d="M8 150 h150 v6 h-150 z" fill="#E8F1F8"/>
    <path d="M14 150 l4 -8 M30 150 l4 -9 M48 150 l4 -8 M66 150 l5 -9 M86 150 l4 -8 M106 150 l4 -9 M126 150 l4 -8 M144 150 l4 -8" stroke="#B9CFE2" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="84" cy="150" rx="40" ry="5" fill="#2A3A5E" opacity=".1"/>
    <path d="M84 66 C104 66 118 78 121 96 C112 102 112 114 120 121 C114 136 101 144 85 144 C70 144 58 137 53 124 C61 116 60 103 51 96 C55 79 67 66 84 66 Z" fill="url(#u6reBall)" stroke="#A85E20" stroke-width="2.2"/>
    <path d="M66 78 q-6 8 -6 17" stroke="#FFEFD9" stroke-width="2.4" opacity=".9" fill="none"/>
    <path d="M104 96 q4 6 1 12 M64 108 q-3 5 -1 10" stroke="#B4702E" stroke-width="1.5" fill="none"/>
    <text x="84" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(가)</text>
    <path d="M186 150 h150 v6 h-150 z" fill="#EDEAE2"/>
    <ellipse cx="258" cy="150" rx="42" ry="5" fill="#2A3A5E" opacity=".12"/>
    <path d="M258 62 C280 62 296 78 296 100 C296 118 288 132 274 139 Q258 144 242 139 C228 132 220 118 220 100 C220 78 236 62 258 62 Z" fill="url(#u6reBall)" stroke="#A85E20" stroke-width="2.2"/>
    <path d="M240 74 q-7 9 -7 19" stroke="#FFEFD9" stroke-width="2.4" opacity=".9" fill="none"/>
    <path d="M242 139 q16 4 32 0" stroke="#A85E20" stroke-width="1.8" fill="none"/>
    <path d="M228 56 q-6 -10 -2 -20 M288 56 q6 -10 2 -20" stroke="#C9B9A0" stroke-width="2" fill="none" stroke-linecap="round"/>
    <text x="258" y="180" text-anchor="middle" font-size="13" font-weight="700" fill="#4E5968">(나)</text>
  </svg>`;
}

/** FOUNTAIN 분수 장난감 단면(고정형 · 라이트) · 물 위 공기층 + 물속까지 내려간 관 + 관 위 물방울.
 *  감싸 쥐기는 문두가 서술 · 손은 그리지 않는다(사후 검수 3차 확정: 손 무그림으로 정리).
 *  관·공기층 구조 판독이 풀이의 필수 재료(구조를 모르면 못 푸는 의존 설계). */
export function fountainToyFig(): string {
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="물이 절반쯤 담긴 투명한 병의 단면. 물 위에는 공기층이 있고, 병 마개를 뚫고 물속 바닥 근처까지 내려간 가는 관이 있으며, 관 끝은 병 위로 나와 있다. 관 위로 물방울이 튀어 오른다">
    <defs>
      <linearGradient id="u6reWat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#BBDCF8"/><stop offset="1" stop-color="#8FC0EC"/>
      </linearGradient>
    </defs>
    <ellipse cx="172" cy="190" rx="64" ry="6" fill="#2A3A5E" opacity=".11"/>
    <path d="M136 66 q-8 4 -8 14 v92 q0 12 12 12 h64 q12 0 12 -12 v-92 q0 -10 -8 -14 z" fill="#F4F9FE" stroke="#8B95A1" stroke-width="2.2" opacity=".96"/>
    <path d="M132 118 h80 v54 q0 8 -8 8 h-64 q-8 0 -8 -8 z" fill="url(#u6reWat)" opacity=".92"/>
    <path d="M132 118 h80" stroke="#6FA8E0" stroke-width="2"/>
    <rect x="150" y="56" width="44" height="12" rx="4" fill="#C4CAD2" stroke="#8B95A1" stroke-width="1.8"/>
    ${g6dot(150, 92, 3.4)}${g6dot(172, 84, 3.4)}${g6dot(192, 96, 3.4)}${g6dot(160, 104, 3.4)}
    <rect x="168" y="26" width="8" height="140" rx="3" fill="#EAF2FB" stroke="#7A8798" stroke-width="1.8"/>
    <circle cx="172" cy="16" r="3" fill="#5E9ED6"/>
    <circle cx="164" cy="8" r="2.4" fill="#5E9ED6"/>
    <circle cx="181" cy="10" r="2.4" fill="#5E9ED6"/>
    <text x="284" y="100" text-anchor="middle" font-size="11" fill="#66707E">공기층</text>
    <path d="M270 96 q-30 -6 -66 -6" stroke="#B9C2CE" stroke-width="1.4" fill="none"/>
  </svg>`;
}

/** HOTAIR 버너를 끈 열기구(고정형 · 라이트) · 불꽃 없음 + 아래 방향 화살표(하강 중 장면 ·
 *  까닭이 과제). 아래가 열린 구조(입자 출입 가능)가 이 소재의 핵심이라 입구를 뚜렷하게. */
export function hotairDownFig(): string {
  return `<svg viewBox="0 0 344 216" ${NS} fill="none" role="img" aria-label="하늘에 떠 있는 열기구. 풍선 아래 버너에 불꽃이 꺼져 있고, 열기구 옆에 아래쪽을 향한 화살표가 있다">
    <defs>
      <linearGradient id="u6reEnv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFC38A"/><stop offset=".55" stop-color="#F29A55"/><stop offset="1" stop-color="#D97730"/>
      </linearGradient>
      <linearGradient id="u6reSky2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#C3E0FA"/><stop offset="1" stop-color="#EAF4FE"/>
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="328" height="200" rx="10" fill="url(#u6reSky2)"/>
    <ellipse cx="70" cy="44" rx="26" ry="10" fill="#FDFEFF" opacity=".9"/>
    <ellipse cx="286" cy="70" rx="22" ry="9" fill="#FDFEFF" opacity=".8"/>
    <path d="M172 22 C216 22 240 52 240 86 C240 112 222 130 196 142 L188 154 H156 L148 142 C122 130 104 112 104 86 C104 52 128 22 172 22 Z" fill="url(#u6reEnv)" stroke="#A85E20" stroke-width="2.2"/>
    <path d="M138 40 q-14 18 -14 44" stroke="#FFE0BE" stroke-width="3" opacity=".85" fill="none"/>
    <path d="M148 26 q-18 56 0 114 M196 26 q18 56 0 114" stroke="#B4702E" stroke-width="1.6" fill="none" opacity=".7"/>
    <path d="M156 154 l-6 22 M188 154 l6 22" stroke="#8A5A2E" stroke-width="2"/>
    <rect x="150" y="176" width="44" height="24" rx="5" fill="#C08A50" stroke="#7E5426" stroke-width="2"/>
    <path d="M156 182 h32 M156 190 h32" stroke="#9A6A38" stroke-width="1.4"/>
    <rect x="166" y="160" width="12" height="10" rx="2" fill="#8B99AC" stroke="#5E6B7E" stroke-width="1.4"/>
    <path d="M172 156 q3 -6 0 -10" stroke="#B0B8C1" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M262 120 v44 m0 0 l-8 -11 m8 11 l8 -11" stroke="#5E6B7E" stroke-width="3.4" fill="none" stroke-linecap="round"/>
  </svg>`;
}
// ── u6 v2 신작 끝 ──

// ── g2u8 v2 신작(파일럿·확대 승격 · 과학 재출제 4호) ──
// 공전 궤도 관측 시점(pick/year/quarter)·거리 2관측점·거리 밝기 순서도·등급 눈금 띠·
// 우리은하 실사 마커·색 별 나열. 전부 파라미터형 · aria는 파라미터 파생(정답 미낭독).
const G2U8_IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
/** 발광 별(파일럿 vstar 복제) */
const vstar = (x: number, y: number, r: number, fill: string): string => {
  const spikes: string[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    spikes.push(
      `<line x1="${(x + Math.cos(a) * r * 1.15).toFixed(1)}" y1="${(y + Math.sin(a) * r * 1.15).toFixed(1)}" x2="${(x + Math.cos(a) * r * 1.9).toFixed(1)}" y2="${(y + Math.sin(a) * r * 1.9).toFixed(1)}" stroke="${fill}" stroke-width="${Math.max(1.1, r * 0.16)}" opacity=".75"/>`,
    );
  }
  return `<circle cx="${x}" cy="${y}" r="${r * 2.1}" fill="${fill}" opacity=".13"/><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>${spikes.join("")}`;
};

/** OP starOrbitPickFig 모드 확장판(이식 승격 정본 · 파일럿 무인자 호출 = pick과 동일 렌더).
 *  pick: 네 위치 A~D(연주 시차 두 시점 고르기) · year: 첫 관측과 1년 뒤 관측(위치 판독이 과제라
 *  "같은 자리" 문구는 그림·aria에 쓰지 않는다) · quarter: A(위)에서 B(오른쪽)까지 3개월 두 시점.
 *  시차각 수치 미인쇄 · aria는 mode에서 파생(u3 v2 관행 5). */
export function starOrbitPickFig(o?: { mode?: "pick" | "year" | "quarter" }): string {
  const mode = o?.mode ?? "pick";
  const cx = 130;
  const cy = 104;
  const R = 62;
  const pos: { x: number; y: number; t: string }[] = [
    { x: cx, y: cy - R, t: "A" },
    { x: cx + R, y: cy, t: "B" },
    { x: cx, y: cy + R, t: "C" },
    { x: cx - R, y: cy, t: "D" },
  ];
  const dot = (p: { x: number; y: number; t: string }, on: boolean, withLabel: boolean): string =>
    `<circle cx="${p.x}" cy="${p.y}" r="6" fill="${on ? "#3E8EE0" : "none"}" stroke="${on ? "none" : "#33486E"}" stroke-width="1.6"/>
     ${withLabel ? `<text x="${p.x + (p.x === cx ? 14 : p.x > cx ? 15 : -15)}" y="${p.y === cy ? p.y + 4 : p.y > cy ? p.y + 17 : p.y - 10}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${on ? "#DCE8FF" : "#5E7398"}">${p.t}</text>` : ""}`;
  const base = `<circle cx="${cx}" cy="${cy}" r="${R}" stroke="#2C4066" stroke-width="1.4" stroke-dasharray="4 5"/>
    <circle cx="${cx}" cy="${cy}" r="9" fill="#FFC24D"/>
    <text x="${cx}" y="${cy + 26}" text-anchor="middle" font-size="10.5" fill="#7E93B8">태양</text>
    ${vstar(312, cy, 7, "#FFE9A8")}
    <text x="312" y="70" text-anchor="middle" font-size="11" fill="#AFC3E3">별</text>`;
  let body = "";
  let caption = "";
  let aria = "";
  if (mode === "pick") {
    body = pos.map((p) => dot(p, true, true)).join("");
    body += `<path d="M${cx + R - 4} ${cy - 14}a14 14 0 0 1 3 10" stroke="#5E7398" stroke-width="1.4" fill="none"/>
      <path d="M${cx + R - 1} ${cy - 5}l3 -6 3 6" stroke="#5E7398" stroke-width="1.4" fill="none"/>`;
    caption = "이웃한 두 위치 사이의 간격 = 3개월";
    aria = "태양 둘레를 도는 지구 공전 궤도 위에 네 위치 A, B, C, D가 표시되어 있고, 오른쪽 멀리 별이 있는 그림";
  } else if (mode === "year") {
    body = dot(pos[0], true, false) + [pos[1], pos[2], pos[3]].map((p) => dot(p, false, false)).join("");
    body += `<circle cx="${pos[0].x}" cy="${pos[0].y}" r="10.5" stroke="#FFE9A8" stroke-width="1.4" fill="none" stroke-dasharray="3 3"/>
      <text x="${pos[0].x}" y="${pos[0].y - 18}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#DCE8FF">관측 ① · 관측 ②</text>`;
    const ax = (deg: number, rr: number): [number, number] => [cx + rr * Math.cos((deg * Math.PI) / 180), cy + rr * Math.sin((deg * Math.PI) / 180)];
    const [sx1, sy1] = ax(-63, R + 14);
    const [ex1, ey1] = ax(-117, R + 14);
    body += `<path d="M${sx1.toFixed(1)} ${sy1.toFixed(1)} A${R + 14} ${R + 14} 0 1 1 ${ex1.toFixed(1)} ${ey1.toFixed(1)}" stroke="#8B6F3A" stroke-width="1.6" fill="none" stroke-dasharray="5 4"/>
      <path d="M${ex1.toFixed(1)} ${ey1.toFixed(1)}l9 -1 -5 8z" fill="#8B6F3A"/>`;
    caption = "관측 ② = 관측 ①의 1년 뒤(지구가 궤도를 한 바퀴 돎)";
    aria = "지구 공전 궤도 위에 첫 관측 시점과 1년 뒤의 두 번째 관측 시점이 표시된 그림 · 두 시점의 궤도 위 위치를 살펴보세요";
  } else {
    body = dot(pos[0], true, true) + dot(pos[1], true, true) + dot(pos[2], false, true) + dot(pos[3], false, true);
    const ax = (deg: number, rr: number): [number, number] => [cx + rr * Math.cos((deg * Math.PI) / 180), cy + rr * Math.sin((deg * Math.PI) / 180)];
    const [sx2, sy2] = ax(-80, R + 14);
    const [ex2, ey2] = ax(-10, R + 14);
    body += `<path d="M${sx2.toFixed(1)} ${sy2.toFixed(1)} A${R + 14} ${R + 14} 0 0 1 ${ex2.toFixed(1)} ${ey2.toFixed(1)}" stroke="#8B6F3A" stroke-width="1.6" fill="none" stroke-dasharray="5 4"/>
      <path d="M${ex2.toFixed(1)} ${ey2.toFixed(1)}l-2 -9 8 4z" fill="#8B6F3A"/>`;
    caption = "A에서 B까지 = 3개월";
    aria = "지구 공전 궤도 위에 3개월 간격의 두 관측 위치 A와 B가 표시된 그림";
  }
  return `<svg viewBox="0 0 344 208" ${NS} fill="none" role="img" aria-label="${aria}">
    ${base}${body}
    <text x="172" y="196" text-anchor="middle" font-size="10.5" fill="#7E93B8">${caption}</text>
  </svg>`;
}

/** DP starDistPairFig(파일럿 복제 · aria는 far 파생) · 거리 비 라벨(r · far r)만 인쇄, 밝기 배수 미인쇄. */
export function starDistPairFig(o: { far: number }): string {
  const sx = 34;
  const y = 92;
  const r1 = 64;
  const gx = sx + r1;
  const fx = sx + r1 * o.far;
  const eye = (x: number, label: string): string =>
    `<circle cx="${x}" cy="${y}" r="10" fill="#16233C" stroke="#5B7BB8" stroke-width="1.6"/>
     <circle cx="${x - 3}" cy="${y}" r="3.4" fill="#C9D6F0"/>
     <text x="${x}" y="${y + 30}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8FF">${label}</text>`;
  const brace = (x1: number, x2: number, ly: number, t: string): string =>
    `<path d="M${x1} ${ly}h${x2 - x1}" stroke="#8B6F3A" stroke-width="1.2" stroke-dasharray="4 4"/>
     <path d="M${x1} ${ly - 4}v8M${x2} ${ly - 4}v8" stroke="#8B6F3A" stroke-width="1.2"/>
     <text x="${(x1 + x2) / 2}" y="${ly - 8}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#C9A96A">${t}</text>`;
  return `<svg viewBox="0 0 344 168" ${NS} fill="none" role="img" aria-label="같은 별을 (가)는 별에서 거리 r인 곳, (나)는 거리 ${o.far}r인 곳에서 관측하는 그림">
    ${vstar(sx, y, 8, "#FFE9A8")}
    <text x="${sx}" y="${y - 24}" text-anchor="middle" font-size="11" fill="#AFC3E3">별</text>
    ${eye(gx, "(가)")}
    ${eye(fx, "(나)")}
    ${brace(sx, gx, 44, "r")}
    ${brace(sx, fx, 24, `${o.far}r`)}
  </svg>`;
}

/** FL starFlowFig · 거리·넓이·밝기 관계 순서도(라이트) · 결론 칸 ㉠·㉡은 비어 있다(관계 채우기). */
export function starFlowFig(): string {
  const box = (y: number, w: number, text: string, sub?: string): string => {
    const x = (344 - w) / 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="42" rx="10" fill="#F7F9FC" stroke="#C4CAD2" stroke-width="1.4"/>
      <text x="172" y="${y + (sub ? 18 : 26)}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#333D4B">${text}</text>
      ${sub ? `<text x="172" y="${y + 34}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#1B64DA">${sub}</text>` : ""}`;
  };
  const arrow = (y: number): string => `<path d="M172 ${y}v14M167 ${y + 8}l5 7 5-7" stroke="#8B95A1" stroke-width="1.8" fill="none"/>`;
  return `<svg viewBox="0 0 344 194" ${NS} fill="none" role="img" aria-label="별까지의 거리가 멀어질 때 빛이 덮는 넓이와 밝기가 어떻게 되는지 빈칸 ㉠과 ㉡으로 묻는 순서도">
    ${box(8, 250, "별까지의 거리가 멀어진다")}
    ${arrow(52)}
    ${box(70, 280, "빛이 덮는 넓이는", "㉠")}
    ${arrow(114)}
    ${box(132, 280, "우리 눈에 보이는 별의 밝기는", "㉡")}
  </svg>`;
}

/** MB starMagBandFig(파일럿 복제 · aria는 min·max·별 라벨 파생, 등급 위칫값은 aria 미포함).
 *  밝기 배수(2.5·100)와 밝음·어두움 방향 라벨은 인쇄하지 않는다(판독·계산이 과제). */
export function starMagBandFig(o: { min: number; max: number; stars: { mag: number; label: string }[] }): string {
  const x0 = 34;
  const x1 = 310;
  const y = 108;
  const gx = (m: number): number => x0 + ((m - o.min) / (o.max - o.min)) * (x1 - x0);
  let ticks = "";
  for (let m = o.min; m <= o.max; m++)
    ticks += `<line x1="${gx(m)}" y1="${y - 6}" x2="${gx(m)}" y2="${y + 6}" stroke="#4A6292" stroke-width="1.4"/>
      <text x="${gx(m)}" y="${y + 26}" text-anchor="middle" font-size="11" fill="#AFC3E3">${m}</text>`;
  const stars = o.stars
    .map(
      (s) => `${vstar(gx(s.mag), y - 34, 6.5, "#FFE9A8")}
      <line x1="${gx(s.mag)}" y1="${y - 20}" x2="${gx(s.mag)}" y2="${y - 8}" stroke="#8B6F3A" stroke-width="1.2" stroke-dasharray="3 3"/>
      <text x="${gx(s.mag)}" y="${y - 56}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#DCE8FF">${s.label}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 152" ${NS} fill="none" role="img" aria-label="겉보기 등급 ${o.min}부터 ${o.max}까지 눈금이 새겨진 띠 위에 별 ${o.stars.map((s) => s.label).join(", ")}의 위치가 표시된 그림">
    <line x1="${x0 - 10}" y1="${y}" x2="${x1 + 12}" y2="${y}" stroke="#3D5378" stroke-width="1.8"/>
    ${ticks}${stars}
    <text x="${x1 + 16}" y="${y + 26}" text-anchor="start" font-size="10.5" fill="#7E93B8">등급</text>
  </svg>`;
}

/** TM starTopMarksFig · 위에서 본 우리은하 실사 위 위치 마커 A·B·C(중심 · 중간 · 가장자리).
 *  마커에 이름·거리 라벨 없음(위치 판정이 과제). 실사 스코프 문법(뷰포트가 클립을 완전히 덮는다). */
export function starTopMarksFig(): string {
  const mark = (x: number, y: number, t: string): string =>
    `<circle cx="${x}" cy="${y}" r="9" stroke="#FFE9A8" stroke-width="2" fill="none"/>
     <circle cx="${x}" cy="${y}" r="2.4" fill="#FFE9A8"/>
     <text x="${x}" y="${y - 15}" text-anchor="middle" font-size="14" font-weight="800" fill="#FFE9A8" stroke="#0B1524" stroke-width="3" paint-order="stroke">${t}</text>`;
  return `<svg viewBox="0 0 344 300" ${NS} fill="none" role="img" aria-label="위에서 내려다본 우리은하 그림 위에 세 위치 A, B, C가 기호로만 표시되어 있어요">
    <rect x="0" y="0" width="344" height="300" fill="#0B1524"/>
    <image href="${G2U8_IMG_BASE}photos/star/milkyway-top.webp" x="22" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice"/>
    ${mark(164, 140, "A")}
    ${mark(238, 190, "B")}
    ${mark(316, 150, "C")}
  </svg>`;
}

/** CT 확장판 starColorRowFig · 색이 다른 별 N개 한 줄 나열(색 이름 병기 · aria는 라벨 파생).
 *  colorTempTrioFig가 3별 자리·"세 별" aria 고정이라 5별 호출용 신작(이식 때 별도 이름으로 승격). */
export function starColorRowFig(o: { stars: { label: string; name: string; hex: string }[] }): string {
  const n = o.stars.length;
  const body = o.stars
    .map((s, i) => {
      const x = Math.round((344 / (n + 1)) * (i + 1));
      return `${vstar(x, 60, n > 4 ? 10 : 13, s.hex)}
      <text x="${x}" y="104" text-anchor="middle" font-size="12" font-weight="800" fill="#DCE8FF">${s.label}</text>
      <text x="${x}" y="122" text-anchor="middle" font-size="10.5" font-weight="700" fill="#AFC3E3">${s.name}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 344 142" ${NS} fill="none" role="img" aria-label="색이 서로 다른 별 ${o.stars.map((s) => s.label).join(", ")}와 각 별의 색 이름이 표시된 그림">${body}</svg>`;
}
// ── g2u8 v2 섹션 끝 ──

/* ══════════════ g2u4 v2 재출제 전용(빌드 승격 · 수정은 qa/g2u4v2-*.ts에서) ══════════════ */
// 신작·개조 헬퍼 · build-g2u4v2-lessons.mjs가 스테이징 로컬 정의를 그대로 승격한다(멱등).
// 중성자 표기 = 교과서 그림 Ⅳ-4 문법(양성자 + 표시 · 중성자 무표시 회색 · 구 atomStructQuizFig의
// "0" 라벨 폐기 사유는 blueprint §7-2). 구판(atomStructQuizFig·atomCellQuizFig·atomPieFig)은
// v1 폐기로 참조가 사라지지만 하위 호환을 위해 유지한다.
/** CQ2 주기율표 칸 확대(파라미터판) · 구 atomCellQuizFig(수소 고정)의 대체 · 칸 내용이 파라미터고
 *  aria가 세 표지의 정체(원자 번호·원소 기호·원소 이름)를 말하지 않는다(정체 판정이 곧 과제).
 *  ㉠ = 위 왼쪽 숫자 · ㉡ = 가운데 큰 글자 · ㉢ = 아래 한글. */
export function cellQuiz2Fig(o: { no: number; sym: string; name: string }): string {
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="주기율표의 한 칸을 확대한 그림 · 칸의 위 왼쪽 숫자를 ㉠이, 가운데 큰 글자를 ㉡이, 아래 한글 낱말을 ㉢이 가리켜요">
    <rect x="130" y="24" width="96" height="132" rx="10" fill="#F0F4F9"/>
    <rect x="124" y="18" width="96" height="132" rx="10" fill="#FAFCFF" stroke="#B8C2CE" stroke-width="1.6"/>
    <text x="138" y="42" font-size="16" font-weight="800" fill="#C43A2E">${o.no}</text>
    <text x="172" y="98" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="800" fill="#2E5AA8">${o.sym}</text>
    <text x="172" y="132" text-anchor="middle" font-size="14" font-weight="800" fill="#0B8A5E">${o.name}</text>
    <line x1="105" y1="38" x2="134" y2="38" stroke="#C43A2E" stroke-width="1.6"/>
    <circle cx="94" cy="38" r="11" fill="#FFF" stroke="#E2695F" stroke-width="1.6"/>
    <text x="94" y="42.5" text-anchor="middle" font-size="12" font-weight="800" fill="#C43A2E">㉠</text>
    <line x1="239" y1="82" x2="200" y2="82" stroke="#2E5AA8" stroke-width="1.6"/>
    <circle cx="250" cy="82" r="11" fill="#FFF" stroke="#5AA2F8" stroke-width="1.6"/>
    <text x="250" y="86.5" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">㉡</text>
    <line x1="105" y1="127" x2="140" y2="127" stroke="#0B8A5E" stroke-width="1.6"/>
    <circle cx="94" cy="127" r="11" fill="#FFF" stroke="#4CB18C" stroke-width="1.6"/>
    <text x="94" y="131.5" text-anchor="middle" font-size="12" font-weight="800" fill="#0B8A5E">㉢</text>
    <text x="172" y="176" text-anchor="middle" font-size="11" fill="#8B95A1">주기율표의 한 칸</text>
  </svg>`;
}

/** AM2 분자 모형 확장판(파일 로컬) · atomMolsFig에 없는 H2O2 키를 보태고 같은 팔레트로 그린다.
 *  이식 때 examFigures atomMolsFig switch에 H2O2 케이스를 추가하며 이 로컬판은 승격 삭제.
 *  H2O2 기하: H-O-O-H 지그재그(가운데 산소 2개 가로 결합 · 수소는 양끝 아래 대각). */
const AM2EL: Record<string, { fill: string; line: string; r: number }> = {
  H: { fill: "#F4F7FB", line: "#9AA5B4", r: 8 },
  O: { fill: "#E8695A", line: "#A8342A", r: 12 },
};
const am2ball = (x: number, y: number, el: string): string => {
  const s = AM2EL[el];
  return `<circle cx="${x}" cy="${y}" r="${s.r}" fill="${s.fill}" stroke="${s.line}" stroke-width="1.4"/>`;
};
const am2bond = (x0: number, y0: number, x1: number, y1: number): string =>
  `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#9AA5B4" stroke-width="4" stroke-linecap="round"/>`;
const am2draw = (key: "H2O" | "H2O2", cx: number, cy: number): string =>
  key === "H2O"
    ? am2bond(cx, cy - 6, cx - 17, cy + 12) + am2bond(cx, cy - 6, cx + 17, cy + 12) + am2ball(cx - 17, cy + 12, "H") + am2ball(cx + 17, cy + 12, "H") + am2ball(cx, cy - 6, "O")
    : am2bond(cx - 16, cy - 4, cx + 16, cy - 4) + am2bond(cx - 16, cy - 4, cx - 34, cy + 14) + am2bond(cx + 16, cy - 4, cx + 34, cy + 14) + am2ball(cx - 34, cy + 14, "H") + am2ball(cx + 34, cy + 14, "H") + am2ball(cx - 16, cy - 4, "O") + am2ball(cx + 16, cy - 4, "O");
export function molsFig2(mols: { key: "H2O" | "H2O2"; label: string }[]): string {
  const n = mols.length;
  const pos: [number, number][] = n === 1 ? [[172, 54]] : [[94, 58], [250, 58]];
  const H = n === 1 ? 124 : 132;
  const cells = mols
    .map((m, i) => {
      const [cx, cy] = pos[i];
      const molecule = n === 1 ? `<g transform="translate(${cx} ${cy}) scale(1.55)">${am2draw(m.key, 0, 0)}</g>` : am2draw(m.key, cx, cy);
      return molecule + (m.label ? `<text x="${cx}" y="${cy + 56}" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">${m.label}</text>` : "");
    })
    .join("");
  return `<svg viewBox="0 0 344 ${H}" ${NS} fill="none" role="img" aria-label="분자 모형${mols.some((m) => m.label) ? " " + mols.map((m) => m.label).filter(Boolean).join(", ") : ""} · 각 모형을 이루는 공(원자)의 색깔 종류와 개수를 살펴보세요">${cells}</svg>`;
}

/** SQ2 원자 구조 ㉠㉡㉢ 판독(교과서 그림 Ⅳ-4 문법판) · 구 atomStructQuizFig(중성자 "0" 라벨)의 대체.
 *  교과서 표기 = 양성자: 빨간 공에 흰 + 표시 · 중성자: 표시 없는 회색 공 · 전자: 파란 (−) 알갱이.
 *  "0" 라벨은 교과서에 없는 창작 표기라 폐기(사용자 파일럿 검수 지시 · 미래엔 144~145쪽 대조).
 *  핵 알갱이 상한 9(p+n ≤ 9). 이식 때 examFigures의 구판을 이 문법으로 교체 승격한다. */
export function structQuiz2Fig(o: { p: number; n: number; e: number }): string {
  const cx = 172, cy = 100;
  const ring6: [number, number][] = [[0, -14], [12, -7], [12, 7], [0, 14], [-12, 7], [-12, -7]];
  const extra: [number, number][] = [[0, 0], [0, -26], [0, 26]];
  const spots: [number, number][] = [...ring6, ...extra].slice(0, o.p + o.n);
  const kinds: boolean[] = [];
  let pl = o.p, nl = o.n;
  for (let i = 0; i < spots.length; i++) {
    const wantP = i % 2 === 0;
    if (wantP && pl > 0) { kinds.push(true); pl--; }
    else if (!wantP && nl > 0) { kinds.push(false); nl--; }
    else if (pl > 0) { kinds.push(true); pl--; }
    else { kinds.push(false); nl--; }
  }
  const grainSvg = spots
    .map(([dx, dy], idx) =>
      kinds[idx]
        ? `<circle cx="${cx + dx}" cy="${cy + dy}" r="7.5" fill="#F0685A" stroke="#A8342A" stroke-width="1.5"/><text x="${cx + dx}" y="${cy + dy + 3.2}" text-anchor="middle" font-size="9" font-weight="900" fill="#FFF">+</text>`
        : `<circle cx="${cx + dx}" cy="${cy + dy}" r="7.5" fill="#C9C2BD" stroke="#7A6E68" stroke-width="1.5"/>`,
    )
    .join("");
  const eAngles = [-90, 150, 30, -30, -150, 90, 60, -120].slice(0, o.e);
  const ePos = eAngles.map((a) => [cx + 112 * Math.cos((a * Math.PI) / 180), cy + 62 * Math.sin((a * Math.PI) / 180)] as [number, number]);
  const xelec2 = (x: number, y: number, r = 6.5): string =>
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#5A9AE0" stroke="#2A5AA0" stroke-width="1.3"/><line x1="${(x - r * 0.45).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + r * 0.45).toFixed(1)}" y2="${y.toFixed(1)}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`;
  const tag = (x: number, y: number, t: string): string =>
    `<circle cx="${x}" cy="${y}" r="11" fill="#FFFFFF" stroke="#5AA2F8" stroke-width="1.6"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#1B64DA">${t}</text>`;
  const pIdx = kinds.indexOf(true), nIdx = kinds.indexOf(false);
  const pT: [number, number] = [cx + spots[pIdx][0], cy + spots[pIdx][1]];
  const nT: [number, number] = [cx + spots[nIdx][0], cy + spots[nIdx][1]];
  const eT = ePos.reduce((best, p) => (Math.hypot(p[0] - 310, p[1] - 146) < Math.hypot(best[0] - 310, best[1] - 146) ? p : best), ePos[0]);
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="원자 모형 · 가운데 덩어리(원자핵) 속에 + 표시가 있는 알갱이와 아무 표시가 없는 회색 알갱이가 섞여 있고, 주위 점선 궤도에 작은 알갱이들이 있어요. 세 종류의 알갱이에 ㉠, ㉡, ㉢ 기호가 붙어 있어요">
    <ellipse cx="${cx}" cy="${cy}" rx="112" ry="62" stroke="#C9D2DC" stroke-width="1.6" stroke-dasharray="5 6"/>
    <circle cx="${cx}" cy="${cy}" r="30" fill="#F6E3DC" stroke="#D8A08C" stroke-width="1.6"/>
    ${grainSvg}
    ${ePos.map(([x, y]) => xelec2(x, y)).join("")}
    <line x1="66" y1="42" x2="${pT[0] - 6}" y2="${pT[1] - 6}" stroke="#8B95A1" stroke-width="1.4"/>
    ${tag(56, 36, "㉠")}
    <line x1="286" y1="42" x2="${nT[0] + 6}" y2="${nT[1] - 5}" stroke="#8B95A1" stroke-width="1.4"/>
    ${tag(296, 36, "㉡")}
    <line x1="300" y1="140" x2="${eT[0] + 7}" y2="${eT[1] + 3}" stroke="#8B95A1" stroke-width="1.4"/>
    ${tag(310, 146, "㉢")}
  </svg>`;
}

/** PIE2 이온 조성 원그래프(범례 좌측 이동판) · 구 atomPieFig의 우측 정렬 %가 긴 라벨과 겹치는
 *  결함의 해소판(사용자 파일럿 검수 "목록을 왼쪽으로" 반영) · 원을 왼쪽으로 당기고 범례를
 *  "이름(이온식) NN %" 한 줄 좌정렬로 흘려 겹침이 구조적으로 불가능하게 한다. 이식 때 승격. */
export function pieFig2(o: { slices: { label: string; pct: number; hex: string }[] }): string {
  const cx = 84, cy = 88, r = 58;
  let acc = -90;
  const paths = o.slices
    .map((s) => {
      const a0 = (acc * Math.PI) / 180;
      acc += s.pct * 3.6;
      const a1 = (acc * Math.PI) / 180;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const large = s.pct > 50 ? 1 : 0;
      return `<path d="M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${s.hex}" stroke="#fff" stroke-width="1.6"/>`;
    })
    .join("");
  const legend = o.slices
    .map((s, i) => {
      const y = 32 + i * 26;
      return `<rect x="152" y="${y - 10}" width="13" height="13" rx="3.5" fill="${s.hex}"/>
        <text x="172" y="${y + 1}" font-size="11.2" font-weight="700" fill="#333D4B">${s.label} <tspan font-weight="800" fill="#4E5968">${s.pct} %</tspan></text>`;
    })
    .join("");
  const spoken = o.slices.map((s) => `${s.label} ${s.pct} 퍼센트`).join(", ");
  return `<svg viewBox="0 0 344 176" ${NS} fill="none" role="img" aria-label="이온 조성 원그래프 · ${spoken}">
    ${paths}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#DCE0E6" stroke-width="1.4"/>
    ${legend}
  </svg>`;
}

const NM_EL: Record<string, { fill: string; line: string; r: number }> = {
  N: { fill: "#5C86D8", line: "#2A5AA0", r: 12 },
  C: { fill: "#6E7887", line: "#3E4654", r: 12 },
  O: { fill: "#E8695A", line: "#A8342A", r: 12 },
};
const nmBall = (x: number, y: number, el: string): string => {
  const s = NM_EL[el];
  return `<circle cx="${x}" cy="${y}" r="${s.r}" fill="${s.fill}" stroke="${s.line}" stroke-width="1.4"/>`;
};
const nmBond = (x0: number, y0: number, x1: number, y1: number): string =>
  `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#9AA5B4" stroke-width="4" stroke-linecap="round"/>`;
/** N2·CO 두 분자 모형(파일 로컬 · atomMolsFig 문법) · (가) 질소 분자(파란 공 2) · (나) 일산화 탄소. */
export function n2CoFig(): string {
  return `<svg viewBox="0 0 344 132" ${NS} fill="none" role="img" aria-label="분자 모형 (가), (나) · 각 모형을 이루는 공(원자)의 색깔 종류와 개수를 살펴보세요">
    ${nmBond(94 - 13, 58, 94 + 13, 58)}${nmBall(94 - 13, 58, "N")}${nmBall(94 + 13, 58, "N")}
    <text x="94" y="114" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">(가)</text>
    ${nmBond(250 - 16, 58, 250 + 16, 58)}${nmBall(250 - 16, 58, "C")}${nmBall(250 + 16, 58, "O")}
    <text x="250" y="114" text-anchor="middle" font-size="12.5" font-weight="700" fill="#4E5968">(나)</text>
  </svg>`;
}

/** N2 단독 분자 모형(파일 로컬 · atomMolsFig 문법 · 파란 공 2 = 질소). */
export function n2Fig(): string {
  const ball = (x: number, y: number): string => `<circle cx="${x}" cy="${y}" r="18.6" fill="#5C86D8" stroke="#2A5AA0" stroke-width="1.4"/>`;
  return `<svg viewBox="0 0 344 124" ${NS} fill="none" role="img" aria-label="분자 모형 · 모형을 이루는 공(원자)의 색깔 종류와 개수를 살펴보세요">
    <line x1="152" y1="54" x2="192" y2="54" stroke="#9AA5B4" stroke-width="6" stroke-linecap="round"/>
    ${ball(152, 54)}${ball(192, 54)}
  </svg>`;
}

/** IF2 이온 생성 예측판(파일 로컬) · 왼쪽 원자만 그리고 오른쪽은 물음표(결과 선노출 금지 ·
 *  atomIonFormExamFig의 중립 예측 모드). e 전자 수 ≤ 12(링 겹침 상한). */
export function ionFormBeforeFig(o: { p: number }): string {
  const ring = Array.from({ length: o.p }, (_, i) => {
    const th = (Math.PI * 2 * i) / o.p - Math.PI / 2;
    const x = Math.round(80 + 36 * Math.cos(th));
    const y = Math.round(66 + 26 * Math.sin(th));
    return `<circle cx="${x}" cy="${y}" r="6" fill="#5A9AE0" stroke="#2A5AA0" stroke-width="1.3"/><line x1="${x - 2.7}" y1="${y}" x2="${x + 2.7}" y2="${y}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`;
  }).join("");
  return `<svg viewBox="0 0 344 130" ${NS} fill="none" role="img" aria-label="원자가 이온으로 변하는 과정을 예측하는 모형 · 왼쪽은 변하기 전 원자이고, 오른쪽은 물음표로 비워져 있어요">
    <circle cx="80" cy="66" r="15" fill="#E8836B"/><circle cx="75.5" cy="61" r="4.8" fill="#FFC0AE" opacity=".8"/>
    <circle cx="80" cy="66" r="15" fill="none" stroke="#A8442E" stroke-width="1.6"/>
    <text x="80" y="70" text-anchor="middle" font-size="9" font-weight="800" fill="#fff">+${o.p}</text>
    ${ring}
    <path d="M140 66h56M188 60l8 6-8 6" stroke="#8B95A1" stroke-width="2.2" fill="none"/>
    <rect x="216" y="30" width="84" height="72" rx="12" fill="#F8FAFC" stroke="#B0B8C1" stroke-width="1.5" stroke-dasharray="6 5"/>
    <text x="258" y="74" text-anchor="middle" font-size="26" font-weight="800" fill="#8B95A1">?</text>
    <text x="80" y="122" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">변하기 전</text>
    <text x="258" y="122" text-anchor="middle" font-size="11.5" font-weight="700" fill="#4E5968">변한 후</text>
  </svg>`;
}

const imBase = (leftLabel: string, rightLabel: string, leftFill: string, rightFill: string): string => `
    <rect x="40" y="50" width="264" height="60" rx="8" fill="#EFF3F7"/>
    <rect x="52" y="58" width="240" height="44" rx="6" fill="#FBFCFE" stroke="#C4CAD2" stroke-width="1.5"/>
    <rect x="32" y="52" width="18" height="56" rx="4" fill="#8B99AC"/>
    <rect x="294" y="52" width="18" height="56" rx="4" fill="#8B99AC"/>
    <path d="M41 52 V30" stroke="#6B7684" stroke-width="2"/>
    <path d="M303 52 V30" stroke="#6B7684" stroke-width="2"/>
    <circle cx="41" cy="22" r="10" fill="${leftFill}"/>
    <text x="41" y="26.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${leftLabel}</text>
    <circle cx="303" cy="22" r="10" fill="${rightFill}"/>
    <text x="303" y="26.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${rightLabel}</text>`;



/** IM-still 중립 초기 상태(번짐 전 · 가운데 색 점만) · 예측 문항 전용(결과 선노출 금지). */
export function ionMoveStillFig(o: { hex: string; leftSign: "+" | "−" }): string {
  const rightSign = o.leftSign === "+" ? "−" : "+";
  const pole = (s: string): string => (s === "+" ? "#F0685A" : "#5A88D8");
  return `<svg viewBox="0 0 344 150" ${NS} fill="none" role="img" aria-label="거름종이 양 끝에 전극이 있고 왼쪽이 (${o.leftSign})극, 오른쪽이 (${rightSign})극이에요. 가운데에 색소 한 방울이 막 떨어져 있고 아직 번지지 않았어요">
    ${imBase(o.leftSign, rightSign, pole(o.leftSign), pole(rightSign))}
    <circle cx="172" cy="80" r="11" fill="${o.hex}" opacity=".85"/>
    <text x="172" y="134" text-anchor="middle" font-size="10.5" fill="#8B95A1">전류를 흘리기 전(가운데에 막 떨어뜨림)</text>
  </svg>`;
}

/** IM-duo 두 색 반대 번짐 · 두 성분의 전하 조합 판정 전용. */
export function ionMoveDuoFig(o: { hexA: string; hexB: string; leftSign: "+" | "−" }): string {
  const rightSign = o.leftSign === "+" ? "−" : "+";
  const pole = (s: string): string => (s === "+" ? "#F0685A" : "#5A88D8");
  return `<svg viewBox="0 0 344 150" ${NS} fill="none" role="img" aria-label="거름종이 양 끝에 전극이 있고 왼쪽이 (${o.leftSign})극, 오른쪽이 (${rightSign})극이에요. 가운데 떨어뜨린 두 색소가 서로 반대 방향으로 번져 있어요">
    ${imBase(o.leftSign, rightSign, pole(o.leftSign), pole(rightSign))}
    <circle cx="172" cy="80" r="8" fill="#B0B8C1" opacity=".3"/>
    <ellipse cx="128" cy="80" rx="30" ry="11" fill="${o.hexA}" opacity=".6"/>
    <ellipse cx="104" cy="80" rx="16" ry="8" fill="${o.hexA}" opacity=".85"/>
    <text x="104" y="60" text-anchor="middle" font-size="11" font-weight="800" fill="#4E5968">㉮</text>
    <ellipse cx="216" cy="80" rx="30" ry="11" fill="${o.hexB}" opacity=".6"/>
    <ellipse cx="240" cy="80" rx="16" ry="8" fill="${o.hexB}" opacity=".85"/>
    <text x="240" y="60" text-anchor="middle" font-size="11" font-weight="800" fill="#4E5968">㉯</text>
    <text x="172" y="134" text-anchor="middle" font-size="10.5" fill="#8B95A1">처음 떨어뜨린 자리는 가운데(희미한 자국)</text>
  </svg>`;
}

/** IM-mask 극 가림판 · 번짐 방향과 전하 정보에서 가려진 극을 역추론하는 문항 전용.
 *  색소는 무명 회색(색-전하 대응 창작 금지 · aria 중립). */
export function ionMoveMaskFig(o: { dir: "left" | "right" }): string {
  const smearCx = o.dir === "left" ? 132 : 212;
  const smearCx2 = o.dir === "left" ? 104 : 240;
  return `<svg viewBox="0 0 344 150" ${NS} fill="none" role="img" aria-label="거름종이 양 끝에 전극이 있는데 두 전극의 부호는 가려져 있어요. 가운데 떨어뜨린 색소 얼룩이 ${o.dir === "left" ? "왼쪽" : "오른쪽"} 전극 쪽으로 번져 있어요">
    ${imBase("?", "?", "#B0B8C1", "#B0B8C1")}
    <circle cx="172" cy="80" r="9" fill="#8B95A1" opacity=".28"/>
    <ellipse cx="${smearCx}" cy="80" rx="34" ry="12" fill="#8B95A1" opacity=".5"/>
    <ellipse cx="${smearCx2}" cy="80" rx="18" ry="9" fill="#8B95A1" opacity=".8"/>
    <text x="172" y="134" text-anchor="middle" font-size="10.5" fill="#8B95A1">색소의 실제 색은 나타내지 않았어요(회색으로 표시)</text>
  </svg>`;
}
/* ══════════════ g2u4 v2 end ══════════════ */

// == u2 v2 신작(파일럿 승격 · 재출제 13호) ==
// 크기 띠·세포 한 개와 여럿·표본 단계·모양 카드·혈관 단면·구성 단계 사다리·분포 자료·
// 특징 분포 막대·분류 중첩도·이분 순서도·5계 검색표·먹이 그물·서식지 분단.
// 전부 파라미터형 · aria는 파라미터에서 파생 · 전 그림 의존 설계.
// (세포 구조는 SVG 도해가 아니라 발주 실사 + 기호 배지 = 레슨 파일 로컬 cellPhotoFig가 담당한다.)
const U2SYM = ["㉠", "㉡", "㉢", "㉣", "㉤"];
const U2PAREN = ["(가)", "(나)", "(다)", "(라)", "(마)"];

/** 한글 줄바꿈(공백 단위) · 라벨 공용. */
const u2WrapKo = (s: string, per: number): string[] => {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > per) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
};

// ── SB 크기 비교(band 로그 띠 · pair 두 생물 대조 · ruler 1 mm 확대) ───────────
/** o.mode band = 대상들을 크기 띠 위에 핀으로 · pair = 두 생물의 세포 크기·세포 수 대조 ·
 *  ruler = 1 mm 한 칸 안에 세포가 늘어선 모습. aria는 mode·라벨에서 파생한다. */
export function sizeBandFig(
  o:
    | { mode: "band"; items: { label: string; um: number }[] }
    | { mode: "pair"; a: { name: string; cellUm: number; many: number }; b: { name: string; cellUm: number; many: number } }
    | { mode: "ruler"; cells: number; cellUm: number },
): string {
  if (o.mode === "band") {
    const L = 30;
    const R = 322;
    const X = (um: number): number => L + (Math.log10(um) / 5) * (R - L);
    const ticks: [number, string][] = [
      [1, "1 µm"],
      [10, "10 µm"],
      [100, "100 µm"],
      [1000, "1 mm"],
      [10000, "1 cm"],
      [100000, "10 cm"],
    ];
    const bandY = 128;
    let body = `<line x1="${L}" y1="${bandY}" x2="${R}" y2="${bandY}" stroke="#8B95A1" stroke-width="1.8"/>`;
    for (const [v, t] of ticks) {
      const x = X(v);
      body += `<line x1="${x.toFixed(1)}" y1="${bandY - 6}" x2="${x.toFixed(1)}" y2="${bandY + 6}" stroke="#8B95A1" stroke-width="1.4"/>
        <text x="${x.toFixed(1)}" y="${bandY + 24}" text-anchor="middle" font-size="11.5" fill="#4E5968">${t}</text>`;
    }
    o.items.forEach((it, i) => {
      const x = X(it.um);
      const y = i % 2 === 0 ? 44 : 82;
      body += `<line x1="${x.toFixed(1)}" y1="${y + 14}" x2="${x.toFixed(1)}" y2="${bandY - 4}" stroke="#B0B8C1" stroke-width="1.2" stroke-dasharray="3 3"/>
        <circle cx="${x.toFixed(1)}" cy="${bandY}" r="5" fill="#12B886"/>
        <rect x="${(x - 39).toFixed(1)}" y="${y - 13}" width="78" height="27" rx="8" fill="#E9F8F1" stroke="#12B886" stroke-width="1.3"/>
        <text x="${x.toFixed(1)}" y="${y + 5}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0B6E4F">${it.label}</text>`;
    });
    return `<svg viewBox="0 0 344 168" ${NS} role="img" aria-label="여러 대상의 크기를 나타낸 띠. 왼쪽으로 갈수록 작고 오른쪽으로 갈수록 크다. 표시된 대상은 ${o.items
      .map((i) => i.label)
      .join(", ")}">
      <rect x="2" y="2" width="340" height="164" rx="18" fill="#F7FAF9"/>${body}</svg>`;
  }
  if (o.mode === "pair") {
    const panel = (x: number, s: { name: string; cellUm: number; many: number }, tag: string): string => {
      const barW = Math.round(s.many * 108);
      return `<text x="${x + 74}" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${tag} ${s.name}</text>
        <rect x="${x + 22}" y="40" width="104" height="58" rx="12" fill="#FFFFFF" stroke="#C9D0D8" stroke-width="1.4"/>
        <rect x="${x + 48}" y="52" width="52" height="34" rx="10" fill="#D9F2E6" stroke="#12B886" stroke-width="1.8"/>
        <circle cx="${x + 74}" cy="69" r="7" fill="#7048E8"/>
        <text x="${x + 74}" y="114" text-anchor="middle" font-size="11.5" fill="#4E5968">세포 한 개 약 ${s.cellUm} µm</text>
        <text x="${x + 22}" y="140" font-size="11.5" fill="#4E5968">세포 수</text>
        <rect x="${x + 22}" y="148" width="108" height="12" rx="6" fill="#EDF0F3"/>
        <rect x="${x + 22}" y="148" width="${barW}" height="12" rx="6" fill="#3182F6"/>`;
    };
    return `<svg viewBox="0 0 344 176" ${NS} role="img" aria-label="${o.a.name}와 ${o.b.name}의 세포 한 개의 크기와 세포 수를 나란히 나타낸 자료">
      <rect x="2" y="2" width="340" height="172" rx="18" fill="#F7FAFC"/>
      ${panel(8, o.a, "(가)")}${panel(178, o.b, "(나)")}
      <line x1="172" y1="18" x2="172" y2="164" stroke="#DCE0E6" stroke-width="1.2"/></svg>`;
  }
  const cw = 268 / o.cells;
  let cells = "";
  for (let i = 0; i < o.cells; i += 1) {
    cells += `<rect x="${(38 + i * cw).toFixed(1)}" y="66" width="${(cw - 1.6).toFixed(1)}" height="40" rx="3" fill="#D9F2E6" stroke="#12B886" stroke-width="1.2"/>`;
  }
  return `<svg viewBox="0 0 344 156" ${NS} role="img" aria-label="자의 눈금 한 칸을 확대해 그 안에 세포 ${o.cells}개가 줄지어 늘어선 모습을 나타낸 그림">
    <rect x="2" y="2" width="340" height="152" rx="18" fill="#FAFBFC"/>
    <line x1="38" y1="40" x2="306" y2="40" stroke="#4E5968" stroke-width="1.6"/>
    <line x1="38" y1="32" x2="38" y2="48" stroke="#4E5968" stroke-width="1.6"/>
    <line x1="306" y1="32" x2="306" y2="48" stroke="#4E5968" stroke-width="1.6"/>
    <text x="172" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">자의 눈금 한 칸 = 1 mm</text>
    ${cells}
    <text x="172" y="128" text-anchor="middle" font-size="12" fill="#4E5968">세포 한 개의 한 변은 약 ${o.cellUm} µm</text></svg>`;
}

// ── OM 몸이 세포 한 개인 생물 ↔ 여러 개인 생물 ──────────────────────────────
export function oneVsManyFig(o: { aName: string; bName: string }): string {
  let many = "";
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 6; c += 1) {
      const x = 196 + c * 20;
      const y = 52 + r * 18;
      const inBody = Math.abs(c - 2.5) * 1.5 + Math.abs(r - 2) < 5.2;
      if (inBody) many += `<rect x="${x}" y="${y}" width="17" height="15" rx="4" fill="#D9F2E6" stroke="#12B886" stroke-width="1.1"/><circle cx="${x + 8.5}" cy="${y + 7.5}" r="2.4" fill="#7048E8"/>`;
    }
  }
  return `<svg viewBox="0 0 344 164" ${NS} role="img" aria-label="두 생물 ${o.aName}, ${o.bName}의 몸을 확대해 나란히 그린 그림">
    <rect x="2" y="2" width="340" height="160" rx="18" fill="#F7FAF9"/>
    <text x="88" y="28" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${o.aName}</text>
    <text x="256" y="28" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${o.bName}</text>
    <ellipse cx="88" cy="98" rx="58" ry="42" fill="#D9F2E6" stroke="#12B886" stroke-width="2.2"/>
    <circle cx="88" cy="98" r="13" fill="#7048E8"/>
    ${many}
    <line x1="172" y1="16" x2="172" y2="150" stroke="#DCE0E6" stroke-width="1.2"/></svg>`;
}

// ── SS 현미경표본 만들기 네 칸(순서는 파라미터 그대로 · blank는 ㉠) ──────────
export function slideStepsFig(o: { steps: string[]; blank?: number }): string {
  const BW = 74;
  const GAP = 12;
  const X0 = (344 - (BW * 4 + GAP * 3)) / 2;
  let body = "";
  o.steps.forEach((s, i) => {
    const x = X0 + i * (BW + GAP);
    const bl = o.blank === i;
    const lines = bl ? ["㉠"] : u2WrapKo(s, 6);
    body += `<rect x="${x}" y="44" width="${BW}" height="84" rx="11" fill="${bl ? "#FFFFFF" : "#F4F7FA"}" stroke="${bl ? "#3182F6" : "#C0C8D2"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>
      <circle cx="${x + BW / 2}" cy="34" r="11" fill="#3182F6"/><text x="${x + BW / 2}" y="38.5" text-anchor="middle" font-size="12" font-weight="900" fill="#FFFFFF">${i + 1}</text>`;
    lines.forEach((ln, j) => {
      body += `<text x="${x + BW / 2}" y="${86 - ((lines.length - 1) * 16) / 2 + j * 16 + (bl ? 2 : 0)}" text-anchor="middle" font-size="${bl ? 16 : 12}" font-weight="${bl ? 900 : 600}" fill="${bl ? "#1B64DA" : "#333D4B"}">${ln}</text>`;
    });
    if (i < 3) body += `<path d="M${x + BW + 1} 86 h9 M${x + BW + 10} 86 l-5 -4 M${x + BW + 10} 86 l-5 4" stroke="#8B95A1" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  });
  return `<svg viewBox="0 0 344 146" ${NS} role="img" aria-label="한 학생이 실제로 한 차례를 네 칸에 나타낸 그림. 각 칸의 내용은 ${o.steps
    .map((s, i) => (o.blank === i ? "가려진 칸" : s))
    .join(", ")}">
    <rect x="2" y="2" width="340" height="142" rx="18" fill="#FAFBFC"/>${body}</svg>`;
}

// ── VC 좁아진 통로를 지나는 세포 단면 ──────────────────────────────────────
/** narrowW = 좁아진 곳의 폭(px) · restW = 눌리지 않은 세포의 폭. restW가 narrowW보다 크게
 *  그려져야 "크기가 작아서 통과한다"는 오답이 그림으로 반박된다(설계 의존 조건).
 *  stiff = 잘 휘지 않는 단단한 세포. 이때는 좁아진 곳 **앞에서 멈춘** 모습으로 그리고
 *  "지나온 뒤" 세포를 그리지 않는다(검산 A 적발 · 구판은 단단한 세포를 좁은 곳 한가운데
 *  덮어 그려 "지나가지 못한다"는 정답을 그림이 반박했다). aria도 stiff에서 파생한다. */
export function vesselCrossFig(o: { narrowW: number; stiff?: boolean }): string {
  const midY = 100;
  const half = o.narrowW / 2;
  const wall = (sign: number): string =>
    `<path d="M8 ${midY + sign * 46}C90 ${midY + sign * 46} 118 ${midY + sign * half} 172 ${midY + sign * half}C226 ${midY + sign * half} 254 ${midY + sign * 46} 336 ${midY + sign * 46}" fill="none" stroke="#D96A7E" stroke-width="5" stroke-linecap="round"/>`;
  const disc = (cx: number, squeeze: number): string =>
    `<g transform="translate(${cx} ${midY})"><ellipse cx="0" cy="0" rx="${26 - squeeze * 8}" ry="${13 - squeeze * 3}" fill="#EF7C90" stroke="#A92B49" stroke-width="1.8"/><ellipse cx="0" cy="0" rx="${11 - squeeze * 3}" ry="${5 - squeeze}" fill="#C94867"/></g>`;
  const stiffBall = (cx: number): string =>
    `<circle cx="${cx}" cy="${midY}" r="24" fill="#C9CFD8" stroke="#5A6473" stroke-width="2"/>
     <path d="M${cx + 30} ${midY - 20} l14 14 l-14 14" fill="none" stroke="#B04A5E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M${cx + 34} ${midY - 6} h16 M${cx + 42} ${midY - 14} v16" fill="none" stroke="#B04A5E" stroke-width="3" stroke-linecap="round" transform="rotate(45 ${cx + 42} ${midY - 6})"/>`;
  const body = o.stiff
    ? `${disc(64, 0)}${stiffBall(122)}`
    : `${disc(80, 0)}${disc(172, 1)}${disc(268, 0)}
       <text x="268" y="${midY + 40}" text-anchor="middle" font-size="11.5" fill="#4E5968">지나온 뒤</text>`;
  return `<svg viewBox="0 0 344 200" ${NS} role="img" aria-label="가운데가 좁아진 관과 그 안의 세포를 옆에서 본 그림${
    o.stiff ? ". 단단한 세포 하나가 좁아진 곳 앞에 멈춰 서 있다" : ". 세포 셋이 좁아진 곳을 차례로 지나고 있다"
  }">
    <rect x="2" y="2" width="340" height="196" rx="18" fill="#FFF6F8"/>
    ${wall(1)}${wall(-1)}
    <path d="M12 ${midY}h30 M42 ${midY} l-7 -5 M42 ${midY} l-7 5" stroke="#8B95A1" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${body}
    <line x1="172" y1="${midY - half - 6}" x2="172" y2="${midY - half - 22}" stroke="#8B95A1" stroke-width="1.1"/>
    <text x="172" y="${midY - half - 26}" text-anchor="middle" font-size="11.5" fill="#4E5968">좁아진 곳</text>
    <text x="${o.stiff ? 64 : 80}" y="${midY + 40}" text-anchor="middle" font-size="11.5" fill="#4E5968">들어가기 전</text></svg>`;
}

// ── OL 동물·식물 구성 단계 사다리 두 줄(hide 자리는 ㉠㉡㉢㉣) ────────────────
const U2_OL_A = ["세포", "조직", "기관", "기관계", "개체"];
const U2_OL_P = ["세포", "조직", "조직계", "기관", "개체"];
export function orgLadderPairFig(o: { hideA?: number[]; hideP?: number[] }): string {
  const hideA = o.hideA ?? [];
  const hideP = o.hideP ?? [];
  const BW = 58;
  const GAP = 8;
  const X0 = (344 - (BW * 5 + GAP * 4)) / 2;
  const row = (names: string[], hide: number[], symOffset: number, y: number, tag: string): string => {
    let out = `<text x="12" y="${y - 10}" font-size="12" font-weight="800" fill="#4E5968">${tag}</text>`;
    names.forEach((s, i) => {
      const x = X0 + i * (BW + GAP);
      const k = hide.indexOf(i);
      const bl = k >= 0;
      out += `<rect x="${x}" y="${y}" width="${BW}" height="36" rx="10" fill="${bl ? "#FFFFFF" : "#F2F6FA"}" stroke="${bl ? "#3182F6" : "#B7C2CE"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>
        <text x="${x + BW / 2}" y="${y + 23}" text-anchor="middle" font-size="${bl ? 15 : 11.5}" font-weight="${bl ? 900 : 700}" fill="${bl ? "#1B64DA" : "#333D4B"}">${bl ? U2SYM[symOffset + k] : s}</text>`;
      if (i < 4)
        out += `<path d="M${x + BW + 1} ${y + 18} h5 M${x + BW + 6} ${y + 18} l-4 -3 M${x + BW + 6} ${y + 18} l-4 3" stroke="#8B95A1" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    });
    return out;
  };
  return `<svg viewBox="0 0 344 150" ${NS} role="img" aria-label="동물과 식물의 구성 단계를 각각 다섯 칸으로 나타낸 두 줄. 동물 줄은 ${hideA.length}칸, 식물 줄은 ${hideP.length}칸이 기호로 가려져 있다">
    <rect x="2" y="2" width="340" height="146" rx="18" fill="#F6FAF7"/>
    ${row(U2_OL_A, hideA, 0, 34, "동물")}
    ${row(U2_OL_P, hideP, hideA.length, 100, "식물")}</svg>`;
}

// ── DP 두 지역 생물 분포(점 색 = 종류 · 범례는 기호로) ──────────────────────
/** 범례는 두지 않는다 · 패널마다 쓰는 색 가짓수가 달라 공용 범례가 판독을 오도한다(검산 B 적발).
 *  "색이 같으면 같은 종류"라는 규약은 문두가 제시한다. */
export function diversityPlotFig(o: { panels: { label: string; kinds: number[] }[] }): string {
  const COLORS = ["#EF6B7A", "#4BAE82", "#4C83D5", "#E5A33F", "#8B6FD1", "#3BB1C4"];
  const panel = (x: number, p: { label: string; kinds: number[] }): string => {
    let dots = "";
    let i = 0;
    p.kinds.forEach((n, k) => {
      for (let j = 0; j < n; j += 1, i += 1) {
        const dx = x + 20 + (i % 5) * 22;
        const dy = 44 + Math.floor(i / 5) * 22;
        dots += `<circle cx="${dx}" cy="${dy}" r="7" fill="${COLORS[k]}" stroke="#FFFFFF" stroke-width="1.4"/>`;
      }
    });
    return `<rect x="${x}" y="26" width="140" height="112" rx="14" fill="#FFFFFF" stroke="#C3D6C9" stroke-width="1.6"/>${dots}
      <text x="${x + 70}" y="158" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">${p.label}</text>`;
  };
  return `<svg viewBox="0 0 344 174" ${NS} role="img" aria-label="두 지역 ${o.panels
    .map((p) => p.label)
    .join(", ")}에서 관찰된 생물을 색이 있는 점으로 나타낸 자료">
    <rect x="2" y="2" width="340" height="170" rx="18" fill="#EEF7F1"/>
    ${panel(22, o.panels[0])}${panel(182, o.panels[1])}</svg>`;
}

// ── TB 같은 종류 무리의 특징 분포 막대(세대별·지역별 두 패널) ────────────────
export function traitBarsFig(o: { panels: { label: string; bars: number[] }[]; axisNote: string }): string {
  const H = 100;
  const top = Math.max(4, Math.ceil(Math.max(...o.panels.flatMap((p) => p.bars)) / 2) * 2);
  const panel = (y: number, p: { label: string; bars: number[] }): string => {
    const base = y + H - 26;
    let out = `<text x="14" y="${y + 12}" font-size="12" font-weight="800" fill="#4E5968">${p.label}</text>
      <line x1="46" y1="${base}" x2="322" y2="${base}" stroke="#9CA7B4" stroke-width="1.4"/>
      <line x1="46" y1="${y + 16}" x2="46" y2="${base}" stroke="#9CA7B4" stroke-width="1.4"/>`;
    for (let t = 0; t <= top; t += 2) {
      const gy = base - (t / top) * (base - y - 20);
      out += `<line x1="46" y1="${gy.toFixed(1)}" x2="322" y2="${gy.toFixed(1)}" stroke="#E6EBF0"/><text x="40" y="${(gy + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#8B95A1">${t}</text>`;
    }
    p.bars.forEach((v, i) => {
      const bx = 62 + i * 52;
      const bh = (v / top) * (base - y - 20);
      out += `<rect x="${bx}" y="${(base - bh).toFixed(1)}" width="34" height="${bh.toFixed(1)}" rx="4" fill="#54B889"/>
        <text x="${bx + 17}" y="${base + 15}" text-anchor="middle" font-size="11" fill="#596574">${"①②③④⑤"[i]}</text>`;
    });
    return out;
  };
  return `<svg viewBox="0 0 344 ${H * o.panels.length + 34}" ${NS} role="img" aria-label="${o.panels
    .map((p) => p.label)
    .join("와 ")}에서 같은 종류 무리의 특징이 어떻게 나뉘어 있는지 막대로 나타낸 자료">
    <rect x="2" y="2" width="340" height="${H * o.panels.length + 30}" rx="18" fill="#FAFBFC"/>
    ${o.panels.map((p, i) => panel(16 + i * H, p)).join("")}
    <text x="172" y="${H * o.panels.length + 26}" text-anchor="middle" font-size="11" fill="#8B95A1">${o.axisNote}</text></svg>`;
}

// ── RN 분류 단계 포함 관계 중첩도(안쪽이 좁은 무리) ─────────────────────────
const U2RANKS = ["종", "속", "과", "목", "강", "문", "계"];
export function rankNestFig(o: { hide?: number[]; dots?: { label: string; level: number }[] }): string {
  const hide = o.hide ?? [];
  const IN = 15;
  let body = "";
  for (let i = 6; i >= 0; i -= 1) {
    const d = 6 - i;
    const x = 8 + d * IN;
    const y = 8 + d * IN;
    const w = 328 - d * IN * 2;
    const h = 212 - d * IN * 2;
    const k = hide.indexOf(i);
    const bl = k >= 0;
    body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${12 - d}" fill="${d % 2 ? "#F4F8FB" : "#FFFFFF"}" stroke="${bl ? "#3182F6" : "#B7C2CE"}" stroke-width="${bl ? 1.8 : 1.2}"${bl ? ' stroke-dasharray="5 4"' : ""}/>
      <text x="${x + 8}" y="${y + 15}" font-size="${bl ? 13 : 11.5}" font-weight="${bl ? 900 : 700}" fill="${bl ? "#1B64DA" : "#4E5968"}">${bl ? U2PAREN[k] : U2RANKS[i]}</text>`;
  }
  for (const d of o.dots ?? []) {
    const dd = 6 - d.level;
    const cx = 328 - dd * IN - 22;
    const cy = 8 + dd * IN + 15;
    body += `<circle cx="${cx}" cy="${cy}" r="10" fill="#12B886"/><text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" font-weight="900" fill="#FFFFFF">${d.label}</text>`;
  }
  return `<svg viewBox="0 0 344 228" ${NS} role="img" aria-label="분류 단계를 크기가 다른 상자 일곱 개로 겹쳐 나타낸 그림${hide.length ? `. ${hide.length}칸은 이름 대신 기호로 표시되어 있다` : ""}">${body}</svg>`;
}

// ── DK 이분 분류 순서도(기준 한 개 · 결론 두 칸이 서로 다르게) ───────────────
export function dichotomyFig(o: { items: string[]; q: string | null; yes: string[]; no: string[] }): string {
  const box = (x: number, y: number, w: number, h: number, lines: string[], tone: "top" | "q" | "leaf", blank: boolean): string => {
    const fill = tone === "q" ? (blank ? "#FFFFFF" : "#EAF3FE") : tone === "top" ? "#F2F4F7" : "#F0FAF4";
    const stroke = blank ? "#3182F6" : tone === "q" ? "#5AA2F8" : tone === "top" ? "#C0C8D2" : "#7BBE8E";
    let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="11" fill="${fill}" stroke="${stroke}" stroke-width="${blank ? 1.8 : 1.4}"${blank ? ' stroke-dasharray="5 4"' : ""}/>`;
    lines.forEach((ln, j) => {
      out += `<text x="${x + w / 2}" y="${y + h / 2 + 4.5 - ((lines.length - 1) * 16) / 2 + j * 16}" text-anchor="middle" font-size="${blank ? 15 : 12.5}" font-weight="${blank ? 900 : 700}" fill="${blank ? "#1B64DA" : "#333D4B"}">${ln}</text>`;
    });
    return out;
  };
  const qLines = o.q === null ? ["(가)"] : u2WrapKo(o.q, 14);
  const qh = Math.max(38, qLines.length * 17 + 20);
  // 갈래 화살표는 반드시 "아래 결론 상자를 가리키도록" 꺾어 내린다(사용자 검수 지적).
  // 예전 판은 옆으로만 꺾여 상자를 안 가리켰다.
  const qBottom = 62 + qh;
  const midY = qBottom + 20;
  const y2 = qBottom + 42;
  const H = y2 + 58;
  const branch = (fromX: number, toX: number): string =>
    `<path d="M${fromX} ${qBottom} V${midY} H${toX} V${y2 - 3}" fill="none" stroke="#8B95A1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M${toX} ${y2 - 3} l-4.5 -6 M${toX} ${y2 - 3} l4.5 -6" fill="none" stroke="#8B95A1" stroke-width="1.5" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="생물 ${o.items.length}가지를 기준 하나로 두 무리로 나눈 순서도${o.q === null ? ". 기준 자리는 비어 있다" : ""}">
    <rect x="2" y="2" width="340" height="${H - 4}" rx="18" fill="#FAFBFC"/>
    ${box(52, 14, 240, 34, [o.items.join(" · ")], "top", false)}
    <path d="M172 48 v10 M172 60 l-4 -6 M172 60 l4 -6" stroke="#8B95A1" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    ${box(72, 62, 200, qh, qLines, "q", o.q === null)}
    ${branch(110, 88)}${branch(234, 256)}
    <text x="96" y="${midY - 5}" font-size="11.5" font-weight="700" fill="#0B6E4F">예</text>
    <text x="248" y="${midY - 5}" text-anchor="end" font-size="11.5" font-weight="700" fill="#B4690E">아니요</text>
    ${box(14, y2, 148, 44, [o.yes.join(" · ")], "leaf", false)}
    ${box(182, y2, 148, 44, [o.no.join(" · ")], "leaf", false)}</svg>`;
}

// ── KQ 5계 검색표 시험판(결과 칸·질문 칸 각각 가림) ─────────────────────────
const U2_KQ_Q = ["핵막이 있나요?", "균계·식물계·동물계 가운데 하나인가요?", "광합성을 하나요?", "세포벽이 있나요?"];
const U2_KQ_SIDE = ["아니요", "아니요", "예", "아니요"];
const U2_KQ_LEAF = ["원핵생물계", "원생생물계", "식물계", "동물계"];
const U2_KQ_LAST = "균계";
export function kingdomKeyQuizFig(o: { blanks?: number[]; qBlanks?: number[] }): string {
  const blanks = o.blanks ?? [];
  const qBlanks = o.qBlanks ?? [];
  const BX = 10;
  // 질문 상자 폭은 168 · 곁가지 "아니요" 라벨이 결과 상자에 덮이지 않을 만큼 사이를 벌린다(검산 B 적발).
  const BW = 168;
  const BH = 44;
  const GAP = 22;
  const LX = 232;
  const LW = 100;
  const LH = 32;
  const spine = BX + BW / 2;
  let body = "";
  U2_KQ_Q.forEach((q, i) => {
    const y = 14 + i * (BH + GAP);
    const cy = y + BH / 2;
    const qk = qBlanks.indexOf(i);
    const qb = qk >= 0;
    const lines = qb ? [U2SYM[qk]] : u2WrapKo(q, 11);
    body += `<rect x="${BX}" y="${y}" width="${BW}" height="${BH}" rx="12" fill="${qb ? "#FFFFFF" : "#EAF3FE"}" stroke="${qb ? "#3182F6" : "#5AA2F8"}" stroke-width="${qb ? 1.8 : 1.4}"${qb ? ' stroke-dasharray="5 4"' : ""}/>`;
    lines.forEach((ln, j) => {
      body += `<text x="${spine}" y="${cy + 4.5 - ((lines.length - 1) * 16) / 2 + j * 16}" text-anchor="middle" font-size="${qb ? 16 : 12.5}" font-weight="${qb ? 900 : 700}" fill="${qb ? "#1B64DA" : "#1F4E86"}">${ln}</text>`;
    });
    body += `<path d="M${BX + BW} ${cy} h${LX - BX - BW - 4} M${LX - 4} ${cy} l-6 -4 M${LX - 4} ${cy} l-6 4" stroke="#8B95A1" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <text x="${BX + BW + 6}" y="${cy - 6}" font-size="10.5" font-weight="700" fill="#4E5968">${U2_KQ_SIDE[i]}</text>`;
    const lk = blanks.indexOf(i);
    const lb = lk >= 0;
    body += `<rect x="${LX}" y="${cy - LH / 2}" width="${LW}" height="${LH}" rx="10" fill="${lb ? "#FFFFFF" : "#E9F8F1"}" stroke="${lb ? "#3182F6" : "#12B886"}" stroke-width="${lb ? 1.8 : 1.5}"${lb ? ' stroke-dasharray="5 4"' : ""}/>
      <text x="${LX + LW / 2}" y="${cy + 4.5}" text-anchor="middle" font-size="${lb ? 14 : 12}" font-weight="900" fill="${lb ? "#1B64DA" : "#0B6E4F"}">${lb ? U2PAREN[lk] : U2_KQ_LEAF[i]}</text>`;
    const nextY = y + BH;
    body += `<path d="M${spine} ${nextY} v${GAP - 4} M${spine} ${nextY + GAP - 4} l-4 -6 M${spine} ${nextY + GAP - 4} l4 -6" stroke="#8B95A1" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <text x="${spine + 6}" y="${nextY + 14}" font-size="10.5" font-weight="700" fill="#4E5968">${U2_KQ_SIDE[i] === "예" ? "아니요" : "예"}</text>`;
  });
  const lastY = 14 + 4 * (BH + GAP);
  const lk = blanks.indexOf(4);
  const lb = lk >= 0;
  body += `<rect x="${spine - LW / 2}" y="${lastY}" width="${LW}" height="${LH}" rx="10" fill="${lb ? "#FFFFFF" : "#E9F8F1"}" stroke="${lb ? "#3182F6" : "#12B886"}" stroke-width="${lb ? 1.8 : 1.5}"${lb ? ' stroke-dasharray="5 4"' : ""}/>
    <text x="${spine}" y="${lastY + 21}" text-anchor="middle" font-size="${lb ? 14 : 12}" font-weight="900" fill="${lb ? "#1B64DA" : "#0B6E4F"}">${lb ? U2PAREN[lk] : U2_KQ_LAST}</text>`;
  return `<svg viewBox="0 0 344 ${lastY + LH + 14}" ${NS} role="img" aria-label="생물을 다섯 무리로 나누는 검색표. 질문을 따라 예와 아니요로 갈라진다${blanks.length ? ` · 결과 칸 ${blanks.length}곳` : ""}${qBlanks.length ? ` · 질문 칸 ${qBlanks.length}곳` : ""}${blanks.length || qBlanks.length ? "이 기호로 가려져 있다" : ""}">
    <rect x="2" y="2" width="340" height="${lastY + LH + 10}" rx="18" fill="#F7FAFC"/>${body}</svg>`;
}

// ── FW 먹이 관계 두 그물(갈래 수가 다르게) ─────────────────────────────────
export function foodWebQuizFig(o: { panels: { label: string; kind: "chain" | "web" }[] }): string {
  const PH = 132;
  const node = (x: number, y: number, t: string): string =>
    `<rect x="${x - 30}" y="${y - 13}" width="60" height="26" rx="13" fill="#FFFFFF" stroke="#7BBE8E" stroke-width="1.5"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#2A6B47">${t}</text>`;
  // 끝점은 상자 "경계"까지만 자른다 · 축별 고정 오프셋(31,15)을 빼면 대각선이 상자 안에 파묻힌다(검산 B 적발).
  const arrow = (x1: number, y1: number, x2: number, y2: number): string => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const ca = Math.abs(Math.cos(a));
    const sa = Math.abs(Math.sin(a));
    const t = Math.min(ca > 1e-6 ? 31 / ca : 1e9, sa > 1e-6 ? 14 / sa : 1e9);
    const sx = x1 + Math.cos(a) * t;
    const sy = y1 + Math.sin(a) * t;
    const ex = x2 - Math.cos(a) * t;
    const ey = y2 - Math.sin(a) * t;
    return `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#8B95A1" stroke-width="1.5"/>
      <path d="M${ex.toFixed(1)} ${ey.toFixed(1)} l${(-Math.cos(a - 0.5) * 7).toFixed(1)} ${(-Math.sin(a - 0.5) * 7).toFixed(1)} M${ex.toFixed(1)} ${ey.toFixed(1)} l${(-Math.cos(a + 0.5) * 7).toFixed(1)} ${(-Math.sin(a + 0.5) * 7).toFixed(1)}" stroke="#8B95A1" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  };
  const panel = (y0: number, p: { label: string; kind: "chain" | "web" }): string => {
    const yTop = y0 + 34;
    const yMid = y0 + 74;
    const yBot = y0 + 112;
    let out = `<text x="12" y="${y0 + 16}" font-size="12" font-weight="800" fill="#4E5968">${p.label}</text>`;
    if (p.kind === "chain") {
      out += node(56, yBot, "나뭇잎") + node(56, yMid, "애벌레") + node(56, yTop, "박새") + node(210, yTop, "족제비");
      out += arrow(56, yBot, 56, yMid) + arrow(56, yMid, 56, yTop) + arrow(56, yTop, 210, yTop);
    } else {
      // 족제비는 박새·들쥐 사이 높이에 두어 두 갈래가 모두 뚜렷한 길이로 그려지게 한다.
      const yPred = y0 + 54;
      out += node(52, yBot, "나뭇잎") + node(146, yBot, "씨앗") + node(52, yMid, "애벌레") + node(146, yMid, "들쥐") + node(52, yTop, "박새") + node(256, yPred, "족제비");
      out += arrow(52, yBot, 52, yMid) + arrow(52, yMid, 52, yTop) + arrow(146, yBot, 146, yMid);
      out += arrow(52, yTop, 256, yPred) + arrow(146, yMid, 256, yPred);
    }
    return out;
  };
  return `<svg viewBox="0 0 344 ${PH * o.panels.length + 20}" ${NS} role="img" aria-label="${o.panels
    .map((p) => p.label)
    .join(", ")} ${o.panels.length > 1 ? "두 생태계" : "한 생태계"}의 먹이 관계를 화살표로 이어 나타낸 그림">
    <rect x="2" y="2" width="340" height="${PH * o.panels.length + 16}" rx="18" fill="#F5FBF7"/>
    ${o.panels.map((p, i) => panel(8 + i * PH, p)).join("")}</svg>`;
}

// ── HC 숲 서식지 분단 전후(도로·생태통로) ──────────────────────────────────
export function habitatCutFig(o: { panels: { label: string; stage: "before" | "after" | "corridor" }[] }): string {
  const PW = 160;
  // 동물 종류는 색만으로 구분하면 판독이 어렵다 · 종류마다 모양도 함께 다르게 그린다(눈검수 반영).
  const ico = (x: number, y: number, kind: number): string => {
    const C = ["#7A4E2E", "#C77B14", "#4A5566", "#1F6B3E", "#6A45C4"][kind];
    if (kind === 0) return `<circle cx="${x}" cy="${y}" r="5.6" fill="${C}"/>`;
    if (kind === 1) return `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="1.6" fill="${C}"/>`;
    if (kind === 2) return `<path d="M${x} ${y - 6.2}l5.6 10h-11.2z" fill="${C}"/>`;
    if (kind === 3) return `<path d="M${x} ${y - 6.4}l6 6.4l-6 6.4l-6 -6.4z" fill="${C}"/>`;
    return `<path d="M${x - 5.6} ${y}h11.2M${x} ${y - 5.6}v11.2" stroke="${C}" stroke-width="3.4" stroke-linecap="round"/>`;
  };
  const panel = (x0: number, p: { label: string; stage: "before" | "after" | "corridor" }): string => {
    const split = p.stage !== "before";
    let out = `<rect x="${x0}" y="30" width="${PW}" height="132" rx="12" fill="#CFE8D3" stroke="#7BBE8E" stroke-width="1.6"/>`;
    if (split) {
      out += `<rect x="${x0}" y="86" width="${PW}" height="22" fill="#B9BFC7"/>
        <line x1="${x0}" y1="97" x2="${x0 + PW}" y2="97" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="10 8"/>`;
    }
    if (p.stage === "corridor") {
      out += `<rect x="${x0 + 54}" y="80" width="52" height="34" rx="10" fill="#8FCB9B" stroke="#3F8B57" stroke-width="1.8"/>`;
    }
    const spots: [number, number, number][] =
      p.stage === "before"
        ? [[34, 56, 0], [96, 50, 1], [62, 74, 2], [126, 70, 3], [40, 128, 4], [104, 134, 0], [136, 122, 1]]
        : p.stage === "after"
          ? [[34, 56, 0], [96, 50, 1], [104, 134, 0]]
          : [[34, 56, 0], [96, 50, 1], [62, 72, 2], [104, 134, 0], [136, 126, 1]];
    for (const [dx, dy, k] of spots) out += ico(x0 + dx, dy, k);
    out += `<text x="${x0 + PW / 2}" y="18" text-anchor="middle" font-size="12.5" font-weight="800" fill="#333D4B">${p.label}</text>`;
    return out;
  };
  return `<svg viewBox="0 0 344 176" ${NS} role="img" aria-label="같은 숲을 ${o.panels
    .map((p) => p.label)
    .join(", ")} 두 시기로 나타낸 그림. 초록 바탕은 숲, 회색 띠는 도로이며 작은 도형은 그곳에서 관찰된 동물을 뜻한다">
    <rect x="2" y="2" width="340" height="172" rx="18" fill="#F4FAF5"/>
    ${o.panels.map((p, i) => panel(10 + i * 172, p)).join("")}</svg>`;
}
// == u2 v2 섹션 끝 ==

// -- g2u6 v2 신작(파일럿 승격 · 신규 출제 15호) --
// 검출 시험관·영양소 도표·소화 격자·흐름도·순환 경로·호흡 모형·허파꽈리·기관계 도해 +
// 발주 라스터 하이브리드 3종(기호 배지·2패널·방향 화살표) + 표/카드/이동 도해 범용 3종.
// 전부 파라미터형 · aria는 파라미터에서 파생한다.
const G2U6_IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
/** 한글 줄바꿈(공백 단위) · 라벨·상자 문구 공용. */
const g2u6WrapKo = (s: string, per: number): string[] => {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > per) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
};

/** 받침 판정 조사 · aria 낭독이 어색해지지 않게(검산 A 3-6). 괄호·기호는 안쪽 글자로 판정한다. */
const g2u6Josa = (w: string, pair: string): string => {
  const [a, b] = pair.split("/");
  const m = w.replace(/[()㉠-㉣]/g, "").trim();
  // 기호만으로 된 라벨(㉠~㉣)은 지우고 나면 빈 문자열이 된다 · 우리말 관례는 "㉠은"이라 받침 있는 쪽.
  if (!m) return a;
  const c = m.charCodeAt(m.length - 1);
  if (Number.isNaN(c)) return b;
  // A~E·숫자 등 한글이 아닌 라벨은 읽을 때 모음으로 끝나므로 받침 없는 쪽(는·를)을 쓴다.
  if (c < 0xac00 || c > 0xd7a3) return b;
  return (c - 0xac00) % 28 ? a : b;
};

/** 기호 배지(원 안 기호) · 전 헬퍼 공용. 흰 원 + 파란 테로 어떤 바탕 위에서도 읽힌다. */
const g2u6Mark = (x: number, y: number, t: string, r = 12.5): string =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" stroke="#3182F6" stroke-width="1.8"/>
   <text x="${x}" y="${y + 4.4}" text-anchor="middle" font-size="${r > 11 ? 12.5 : 11}" font-weight="800" fill="#1B64DA">${t}</text>`;

/** 어두운 면 위 흰 라벨 · 할로는 그 면의 최암색으로(흰 할로는 글자를 지운다 · bodyFigures 계보). */
const g2u6T = (x: number, y: number, t: string, o?: { size?: number; anchor?: string; fill?: string; halo?: string; weight?: number }): string => {
  const s = o?.size ?? 12;
  const a = o?.anchor ?? "middle";
  const f = o?.fill ?? "#333D4B";
  const w = o?.weight ?? 700;
  const halo = o?.halo ? `stroke="${o.halo}" stroke-width="3" paint-order="stroke"` : "";
  return `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" font-weight="${w}" fill="${f}" ${halo}>${t}</text>`;
};

// ══════════════════ 발주 라스터 하이브리드 ══════════════════
// SCI_GUIDE g2u6 하이브리드 방침: **발주 라스터 위에 한글 기호·지시선은 SVG/DOM으로 얹는다.**
// 라스터에는 글자가 하나도 없으므로, 같은 라스터라도 기호 세트·가림 대상·질문 축을 바꾸면
// 자료셋이 갈린다(레슨은 `bodyLabeled`로 이름 라벨을 얹으므로 시험은 기호만 얹어 verbatim을 피한다).
// 좌표는 %(그림 기준)다 · 반드시 스크린샷으로 눈으로 맞춘다(CLAUDE.md 세포도 좌표 관행).
type G2u6Pin = { x: number; y: number; t: string; lx?: number; ly?: number };
export const rasterFig = (
  file: string,
  alt: string,
  pins: G2u6Pin[],
  o?: { base?: string; caption?: string },
): string => {
  const base = o?.base ?? "body/figs";
  const lines = pins
    .filter((p) => p.lx !== undefined && p.ly !== undefined)
    .map((p) => `<line x1="${p.x}" y1="${p.y}" x2="${p.lx}" y2="${p.ly}" stroke="#8B95A1" stroke-width="1" vector-effect="non-scaling-stroke"/>`)
    .join("");
  const badges = pins
    .map(
      (p) =>
        `<span style="position:absolute;left:${p.lx ?? p.x}%;top:${p.ly ?? p.y}%;transform:translate(-50%,-50%);width:27px;height:27px;border-radius:999px;background:#fff;border:1.9px solid #3182F6;color:#1B64DA;font-size:12.5px;font-weight:800;line-height:23px;text-align:center;box-shadow:0 1px 4px rgba(10,20,40,.2)">${p.t}</span>`,
    )
    .join("");
  return `<div style="position:relative;border-radius:14px;overflow:hidden;background:#FBFCFD;border:1px solid #DCE0E6">
    <img src="${G2U6_IMG_BASE}${base}/${file}" alt="${alt}" style="display:block;width:100%"/>
    ${lines ? `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${lines}</svg>` : ""}
    ${badges}
    ${o?.caption ? `<div style="position:absolute;left:0;right:0;bottom:0;padding:5px 8px;background:rgba(251,252,253,.92);font-size:10.8px;font-weight:700;color:#6B7684;text-align:center">${o.caption}</div>` : ""}
  </div>`;
};

/** 라스터 두 장을 (가)(나)로 나란히 · 들숨·날숨처럼 한 쌍이 곧 자료인 문항용. */
export const rasterPair = (
  a: { file: string; label: string },
  b: { file: string; label: string },
  alt: string,
  base = "body/figs/v2",
): string =>
  `<div style="display:flex;gap:8px" role="img" aria-label="${alt}">
    ${[a, b]
      .map(
        (c) => `<div style="flex:1;border:1px solid #DCE0E6;border-radius:12px;overflow:hidden;background:#FBFCFD">
        <img src="${G2U6_IMG_BASE}${base}/${c.file}" alt="" style="display:block;width:100%"/>
        <div style="padding:5px 0 7px;text-align:center;font-size:13px;font-weight:900;color:#191F28">${c.label}</div>
      </div>`,
      )
      .join("")}
  </div>`;

/** 라스터 위에 물질 이동 화살표를 얹는다(콩팥단위 세 과정 등). %좌표 · 화살촉 자동. */
export const rasterArrows = (
  file: string,
  alt: string,
  arrows: { x1: number; y1: number; x2: number; y2: number; c: string; t?: string; tx?: number; ty?: number }[],
  base = "body/figs/v2",
): string => {
  const body = arrows
    .map((a) => {
      const dx = a.x2 - a.x1;
      const dy = a.y2 - a.y1;
      const L = Math.hypot(dx, dy) || 1;
      const ux = dx / L;
      const uy = dy / L;
      return `<path d="M${a.x1} ${a.y1} L${a.x2} ${a.y2} M${a.x2} ${a.y2} l${(-ux * 4 - uy * 2.4).toFixed(2)} ${(-uy * 4 + ux * 2.4).toFixed(2)} M${a.x2} ${a.y2} l${(-ux * 4 + uy * 2.4).toFixed(2)} ${(-uy * 4 - ux * 2.4).toFixed(2)}" fill="none" stroke="${a.c}" stroke-width="2.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    })
    .join("");
  const badges = arrows
    .filter((a) => a.t)
    .map(
      (a) =>
        `<span style="position:absolute;left:${a.tx ?? (a.x1 + a.x2) / 2}%;top:${a.ty ?? (a.y1 + a.y2) / 2 + 9}%;transform:translate(-50%,-50%);width:27px;height:27px;border-radius:999px;background:#fff;border:1.9px solid ${a.c};color:${a.c};font-size:12.5px;font-weight:800;line-height:23px;text-align:center;box-shadow:0 1px 4px rgba(10,20,40,.2)">${a.t}</span>`,
    )
    .join("");
  return `<div style="position:relative;border-radius:14px;overflow:hidden;background:#FBFCFD;border:1px solid #DCE0E6">
    <img src="${G2U6_IMG_BASE}${base}/${file}" alt="${alt}" style="display:block;width:100%"/>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${body}</svg>
    ${badges}
  </div>`;
};

// ══════════════════ L1 영양소 ══════════════════

/** NT 검출 반응 시험관 열(파라미터형).
 *  tubes[].tint = 관찰된 용액 색 키 · heated = 가열 표시(중탕 물 표시) · reagent 라벨은 선택.
 *  aria는 파라미터 파생이며 **관찰 서술까지만** 한다(어느 영양소인지는 낭독하지 않는다). */
const G2U6_TINT: Record<string, [string, string]> = {
  none: ["#DDE3EA", "변화 없음"],
  blue: ["#8FB3E8", "푸른색"],
  navy: ["#2C3E8F", "청람색"],
  purple: ["#9B59B6", "보라색"],
  orange: ["#E8833A", "황적색"],
  red: ["#E8455F", "선홍색"],
};
export function bodyTestTubesFig(o: { tubes: { label: string; tint: string; reagent?: string; heated?: boolean }[]; hideTint?: number }): string {
  const n = o.tubes.length;
  const W = 344;
  const gap = n <= 3 ? 96 : n === 4 ? 78 : 64;
  const x0 = (W - gap * n) / 2 + gap / 2;
  // 시약 설명은 한 줄에 들어갈 글자 수를 **칸 폭에서** 뽑고, 그러고도 넘치면 글자 크기를 줄인다.
  // 상수 나눗셈(gap/5.6)으로 줄바꿈만 하면 한글 한 글자가 10.5px라 4관에서 옆 칸을 침범한다(갤러리 적발).
  const per = Math.max(4, Math.floor((gap - 6) / 9));
  const rlines = (s?: string): string[] => (s ? g2u6WrapKo(s, per) : []);
  const rsize = (ls: string[]): number => (ls.length ? Math.max(7.6, Math.min(10.5, (gap - 6) / Math.max(...ls.map((l) => l.length)))) : 10.5);
  const body = o.tubes
    .map((t, i) => {
      const cx = x0 + i * gap;
      const hidden = o.hideTint === i;
      const [col] = G2U6_TINT[t.tint] ?? G2U6_TINT.none;
      const fill = hidden ? "#F2F4F7" : col;
      const heat = t.heated
        ? `<path d="M${cx - 26} 128 h52 a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-52 a4 4 0 0 1 -4 -4 v-14 a4 4 0 0 1 4 -4 Z" fill="#FFE3C4" stroke="#E8A25A" stroke-width="1.3"/>
           <path d="M${cx - 14} 137 q4 -5 8 0 q4 5 8 0 q4 -5 8 0" fill="none" stroke="#E8833A" stroke-width="1.6" stroke-linecap="round"/>`
        : "";
      return `<g>
        ${heat}
        <ellipse cx="${cx}" cy="46" rx="17" ry="5" fill="#EDF1F5" stroke="#B9C2CC" stroke-width="1.3"/>
        <path d="M${cx - 17} 46 V116 Q${cx - 17} 130 ${cx} 130 Q${cx + 17} 130 ${cx + 17} 116 V46" fill="#F7FAFC" stroke="#B9C2CC" stroke-width="1.4"/>
        <path d="M${cx - 15} 86 V116 Q${cx - 15} 128 ${cx} 128 Q${cx + 15} 128 ${cx + 15} 116 V86 Z" fill="${fill}" opacity="${hidden ? 1 : 0.92}"/>
        ${hidden ? `<text x="${cx}" y="${112}" text-anchor="middle" font-size="15" font-weight="800" fill="#8B95A1">?</text>` : ""}
        <path d="M${cx - 12} 58 q7 -4 14 -2" stroke="#FFFFFF" stroke-width="2.6" opacity=".7" stroke-linecap="round" fill="none"/>
        ${g2u6T(cx, 168, t.label, { size: Math.max(9, Math.min(13, (gap - 8) / Math.max(1, t.label.length))), weight: 900, fill: "#191F28" })}
        ${rlines(t.reagent).map((ln, k, a) => g2u6T(cx, 185 + k * 13, ln, { size: rsize(a), weight: 700, fill: "#6B7684" })).join("")}
      </g>`;
    })
    .join("");
  const obs = o.tubes
    .map((t, i) => `${t.label}${g2u6Josa(t.label, "은/는")} ${o.hideTint === i ? "결과를 가려 두었다" : (G2U6_TINT[t.tint] ?? G2U6_TINT.none)[1]}${t.heated ? "이고 따뜻한 물에 담가 두었다" : ""}`)
    .join(", ");
  // 긴 시약 설명은 줄바꿈되므로 줄 수만큼 그림 높이를 늘린다(라벨 겹침·잘림 방지 · 파일럿 검수 적발).
  const maxLines = Math.max(1, ...o.tubes.map((t) => rlines(t.reagent).length));
  const H = 183 + maxLines * 13;
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="시험관 ${n}개를 나란히 둔 그림. ${obs}">
    <rect x="8" y="8" width="328" height="${H - 16}" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    ${body}
  </svg>`;
}

/** NC 영양소 분류 도표(파라미터형) · 칸 일부를 기호로 가린다.
 *  cols = 분류 축(기능 등) · 각 열의 items 중 mask 인덱스를 ㉠㉡㉢으로 대체한다. */
export function nutrientChartFig(o: { title?: string; cols: { head: string; items: string[] }[]; masks?: { col: number; row: number; sym: string }[] }): string {
  const n = o.cols.length;
  const W = 344;
  const cw = (W - 24 - (n - 1) * 8) / n;
  const maxRows = Math.max(...o.cols.map((c) => c.items.length));
  const H = 46 + maxRows * 30 + 16;
  const body = o.cols
    .map((c, ci) => {
      const x = 12 + ci * (cw + 8);
      const cells = c.items
        .map((it, ri) => {
          const m = o.masks?.find((k) => k.col === ci && k.row === ri);
          const y = 46 + ri * 30;
          return `<rect x="${x}" y="${y}" width="${cw}" height="26" rx="7" fill="${m ? "#FFFFFF" : "#F7F8FA"}" stroke="${m ? "#3182F6" : "#DCE0E6"}" stroke-width="${m ? 1.7 : 1.1}"${m ? ' stroke-dasharray="5 4"' : ""}/>
            ${g2u6T(x + cw / 2, y + 17.5, m ? m.sym : it, { size: m ? 12 : Math.max(9.5, Math.min(12, (cw - 8) / it.length)), weight: m ? 800 : 700, fill: m ? "#1B64DA" : "#333D4B" })}`;
        })
        .join("");
      const hs = Math.max(9, Math.min(12, (cw - 8) / c.head.length));
      return `<rect x="${x}" y="12" width="${cw}" height="28" rx="8" fill="#EEF4FF" stroke="#C7DBFA" stroke-width="1.2"/>
        ${g2u6T(x + cw / 2, 31, c.head, { size: hs, weight: 800, fill: "#1B64DA" })}${cells}`;
    })
    .join("");
  const maskDesc = o.masks?.length ? `, ${o.masks.map((m) => m.sym).join("·")} 자리는 비어 있다` : "";
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="${o.title ?? "영양소를 갈래별로 묶은 표"}. 갈래는 ${o.cols.map((c) => c.head).join(", ")}이다${maskDesc}">
    ${body}
  </svg>`;
}

/** 표 계열 공용 래퍼 · svgTable의 고정 aria("자료 표")를 머리글·행 이름에서 파생한 문구로 바꾼다
 *  (§5-2 "aria는 파라미터 파생" · 검산 A 3-11). 값 자체는 낭독하지 않아 판독 과제를 지운다. */
const g2u6TableAria = (svg: string, head: string[], rows: string[][], what: string): string =>
  svg.replace(
    'aria-label="자료 표"',
    `aria-label="${what}. 세로줄은 ${head.join(", ")}이다. ${rows
      .map((r) => `${r[0]} 줄은 ${head.slice(1).map((h, i) => `${h} ${r[i + 1]}`).join(", ")}`)
      .join(". ")}"`,
  );

/** FT 식품 성분 자료 표 · svgTable 래핑(2열 한글 ≤13자 · 3열 ≤8자 준수). */
export function foodTableFig(head: string[], rows: string[][]): string {
  return g2u6TableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "식품에 들어 있는 성분을 정리한 표");
}

// ══════════════════ L2 소화와 소화효소 ══════════════════

/** EG 영양소 × 소화 장소 격자(파라미터형).
 *  cells[r][c] = "" 없음 · "arrow" 분해 일어남 · 기호 문자열이면 그 칸에 기호 배지.
 *  행 = 소화 장소 · 열 = 영양소. 효소 이름은 인쇄하지 않는 것이 기본. */
export function enzymeGridFig(o: { cols: string[]; rows: string[]; cells: string[][]; note?: string }): string {
  const W = 344;
  const LW = 76;
  const cw = (W - 24 - LW) / o.cols.length;
  const rh = 40;
  const H = 44 + o.rows.length * rh + (o.note ? 26 : 10);
  let body = "";
  o.cols.forEach((c, ci) => {
    const x = 12 + LW + ci * cw;
    body += `<rect x="${x}" y="12" width="${cw}" height="28" rx="7" fill="#EEF4FF" stroke="#C7DBFA" stroke-width="1.2"/>${g2u6T(x + cw / 2, 30.5, c, { size: 12, weight: 800, fill: "#1B64DA" })}`;
  });
  o.rows.forEach((r, ri) => {
    const y = 44 + ri * rh;
    body += `<rect x="12" y="${y}" width="${LW}" height="${rh - 4}" rx="7" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1.1"/>${g2u6T(12 + LW / 2, y + rh / 2 + 2, r, { size: 12, weight: 800 })}`;
    o.cols.forEach((_, ci) => {
      const x = 12 + LW + ci * cw;
      const v = o.cells[ri]?.[ci] ?? "";
      body += `<rect x="${x}" y="${y}" width="${cw}" height="${rh - 4}" rx="7" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.1"/>`;
      if (v === "arrow") {
        body += `<path d="M${x + cw / 2 - 15} ${y + rh / 2} h26 m-6 -5 l6 5 l-6 5" fill="none" stroke="#37A446" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (v) {
        body += g2u6Mark(x + cw / 2, y + rh / 2 - 2, v, 11);
      }
    });
  });
  if (o.note) body += g2u6T(W / 2, H - 10, o.note, { size: 10.8, weight: 700, fill: "#6B7684" });
  const syms = o.cells.flat().filter((v) => v && v !== "arrow");
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="세로는 ${o.rows.join("·")}, 가로는 ${o.cols.join("·")}으로 나눈 표. 분해가 일어나는 칸에는 화살표가 있고${syms.length ? ` ${syms.join("·")} 기호가 붙은 칸이 있다` : " 나머지 칸은 비어 있다"}">
    ${body}
  </svg>`;
}

/** DF 소화·흡수 흐름도(파라미터형 · 가로 사슬) · blank 칸은 ㉠ 점선.
 *  arrowLabels가 있으면 화살표 위에 조건을 적는다(상자 밖 배치 · 겹침 방지). */
export function digestFlowFig(o: { steps: string[]; blank?: number; arrowLabels?: (string | null)[]; caption?: string }): string {
  const W = 344;
  const n = o.steps.length;
  // 칸이 적을수록 간격을 줄여 상자 폭을 확보한다(글자 하한 11px 보장 · 검산 A 3-1).
  const GAP = n <= 3 ? 20 : 28;
  const bw = (W - 24 - GAP * (n - 1)) / n;
  const y = o.arrowLabels ? 46 : 30;
  const H = y + 46 + (o.caption ? 26 : 12);
  let body = "";
  o.steps.forEach((s, i) => {
    const x = 12 + i * (bw + GAP);
    const bl = o.blank === i;
    const lines = g2u6WrapKo(s, 6);
    // 띄어쓰기가 없는 긴 낱말(모노글리세라이드 등)은 줄바꿈이 안 되므로 글자 크기로 상자 안에 맞춘다.
    const maxLen = Math.max(...lines.map((l) => l.length), 1);
    const fs = Math.max(11, Math.min(11.5, (bw - 8) / maxLen));
    body += `<rect x="${x}" y="${y}" width="${bw}" height="42" rx="10" fill="${bl ? "#FFFFFF" : "#F2F4F7"}" stroke="${bl ? "#3182F6" : "#C9D0D8"}" stroke-width="${bl ? 1.8 : 1.3}"${bl ? ' stroke-dasharray="5 4"' : ""}/>`;
    if (bl) body += g2u6T(x + bw / 2, y + 27, "㉠", { size: 15, weight: 800, fill: "#1B64DA" });
    else lines.forEach((ln, k) => (body += g2u6T(x + bw / 2, y + (lines.length === 1 ? 26 : 20 + k * (fs + 3)), ln, { size: fs, weight: 700 })));
    if (i < n - 1) {
      const ax = x + bw + 5;
      body += `<path d="M${ax} ${y + 21} h${GAP - 10} m-6 -5 l6 5 l-6 5" fill="none" stroke="#8B95A1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
      const al = o.arrowLabels?.[i];
      if (al) body += g2u6T(ax + (GAP - 10) / 2, y - 8, al, { size: 10.5, weight: 800, fill: "#B4690E" });
    }
  });
  if (o.caption) body += g2u6T(W / 2, H - 9, o.caption, { size: 10.8, weight: 700, fill: "#6B7684" });
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="왼쪽에서 오른쪽으로 이어지는 흐름도. 칸은 ${n}개이고${o.blank === undefined ? " 모두 채워져 있다" : " 한 칸은 비어 있으며 기호로 표시되어 있다"}">
    ${body}
  </svg>`;
}

// ══════════════════ L3 순환계 ══════════════════

/** CP 두 순환 경로 도해(기호판) · 심장을 가운데 두고 위 고리·아래 고리.
 *  loopSyms = [위 고리, 아래 고리] · vesselSyms = [왼위, 오른위, 오른아래, 왼아래] 혈관 기호.
 *  showColor:false면 색 단서를 지운다(색이 곧 답이 되는 문항에서 쓴다). */
export function circulationPathFig(o: { loopSyms?: (string | null)[]; vesselSyms?: (string | null)[]; showColor?: boolean }): string {
  const [up, down] = o.loopSyms ?? [null, null];
  const [v1, v2, v3, v4] = o.vesselSyms ?? [null, null, null, null];
  const red = o.showColor === false ? "#9AA3AD" : "#D9525F";
  const blue = o.showColor === false ? "#9AA3AD" : "#4A6FA5";
  // 방향 화살촉은 항상 그린다. 색을 지운 판(showColor:false)에서 화살촉까지 없으면 어느 쪽으로
  // 흐르는지 판독할 근거가 사라져 문항이 성립하지 않는다(파일럿 검수 적발 · 정보 미제시는 치명).
  const tipUp = (x: number, y: number): string => `<path d="M${x - 6} ${y + 5} L${x} ${y - 3} L${x + 6} ${y + 5}" fill="none" stroke="#333D4B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const tipDown = (x: number, y: number): string => `<path d="M${x - 6} ${y - 5} L${x} ${y + 3} L${x + 6} ${y - 5}" fill="none" stroke="#333D4B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  // aria는 파라미터에서 파생한다. 이 그림에서는 **화살촉의 방향**만이 혈관 이름의 판독 근거라
  // 방향을 낭독하지 않으면 스크린리더 경로에서 문항이 성립하지 않는다(검산 A S17).
  const WHERE = ["왼쪽 위", "오른쪽 위", "오른쪽 아래", "왼쪽 아래"];
  const TOWARD = ["허파 쪽인 위", "심장 쪽인 아래", "조직세포 쪽인 아래", "심장 쪽인 위"];
  const vDesc = [v1, v2, v3, v4]
    .map((v, i) => `${WHERE[i]} 혈관은 화살촉이 ${TOWARD[i]}를 향하고${v ? ` ${v} 기호가 붙어 있다` : " 기호는 붙어 있지 않다"}`)
    .join(", ");
  const lDesc = [up, down].filter(Boolean).length
    ? `. 점선 고리로 묶은 자리에 ${[up ? "위쪽 고리에 " + up : "", down ? "아래쪽 고리에 " + down : ""].filter(Boolean).join(", ")} 기호가 붙어 있다`
    : "";
  const cDesc = o.showColor === false ? ". 혈관은 모두 같은 회색으로 그려져 색 단서는 없다" : ". 혈관은 붉은색과 푸른색으로 나누어 그려져 있다";
  return `<svg viewBox="0 0 344 250" ${NS} role="img" aria-label="심장을 가운데 두고 위쪽 고리는 허파로, 아래쪽 고리는 조직세포로 이어진 혈액 순환 경로 도해. ${vDesc}${lDesc}${cDesc}">
    <rect x="8" y="8" width="328" height="234" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <path d="M126 52 C104 50 96 76 108 98 C118 116 132 124 142 128" fill="none" stroke="${blue}" stroke-width="7" stroke-linecap="round"/>
    <path d="M202 128 C214 124 228 114 238 96 C250 74 240 50 218 52" fill="none" stroke="${red}" stroke-width="7" stroke-linecap="round"/>
    <path d="M202 152 C216 158 232 176 226 198" fill="none" stroke="${red}" stroke-width="7" stroke-linecap="round"/>
    <path d="M118 198 C112 176 128 158 142 152" fill="none" stroke="${blue}" stroke-width="7" stroke-linecap="round"/>
    ${tipUp(100, 80)}${tipDown(245, 82)}${tipDown(227, 178)}${tipUp(117, 176)}
    <rect x="128" y="28" width="88" height="40" rx="12" fill="#E8F1FB" stroke="#7FA8D8" stroke-width="1.5"/>
    ${g2u6T(172, 53, "허파", { size: 13, weight: 900, fill: "#2E5D93" })}
    <rect x="132" y="112" width="80" height="56" rx="13" fill="#F0C9CE" stroke="#A83744" stroke-width="1.7"/>
    ${g2u6T(172, 145, "심장", { size: 13, weight: 900, fill: "#8C3540" })}
    <rect x="122" y="192" width="100" height="40" rx="12" fill="#EAF6EC" stroke="#7FB77E" stroke-width="1.5"/>
    ${g2u6T(172, 217, "조직세포", { size: 12.5, weight: 900, fill: "#3B7A44" })}
    ${up ? `<path d="M118 34 C74 44 62 96 92 128" fill="none" stroke="#3182F6" stroke-width="1.6" stroke-dasharray="5 4"/>${g2u6Mark(74, 62, up)}` : ""}
    ${down ? `<path d="M226 222 C270 212 282 160 252 128" fill="none" stroke="#3182F6" stroke-width="1.6" stroke-dasharray="5 4"/>${g2u6Mark(270, 192, down)}` : ""}
    ${v1 ? g2u6Mark(108, 58, v1, 11) : ""}${v2 ? g2u6Mark(238, 58, v2, 11) : ""}
    ${v3 ? g2u6Mark(234, 192, v3, 11) : ""}${v4 ? g2u6Mark(110, 192, v4, 11) : ""}
  </svg>`;
}

// ══════════════════ L4 호흡계와 호흡운동 ══════════════════

/** BM 병 호흡 모형(파라미터형) · 부품에 기호를 붙이고 이름은 인쇄하지 않는다.
 *  pull = 고무막을 아래로 당긴 상태 · syms = [유리관, 고무풍선, 병, 고무막]. */
export function breathModelFig(o: { pull: boolean; syms?: (string | null)[]; hand?: boolean }): string {
  const [tube, balloon, jar, sheet] = o.syms ?? [null, null, null, null];
  // 병의 크기는 고정하고 고무막만 병 안에서 오르내린다(병 바닥선이 함께 움직이면 병이 줄어든 것처럼 읽힌다).
  const memY = o.pull ? 200 : 168;
  const bal = o.pull ? 1 : 0.66;
  const bw = 34 * bal;
  const bh = 40 * bal;
  return `<svg viewBox="0 0 344 244" ${NS} role="img" aria-label="투명한 병 안에 고무풍선을 매단 호흡 모형 그림. 병 아래를 막은 고무 막이 ${o.pull ? "아래로 당겨져 풍선이 크게 부풀어" : "위로 올라와 풍선이 쪼그라들어"} 있다. ${[[tube, "병 위쪽에 꽂힌 유리관"], [balloon, "병 안에 매달린 고무풍선"], [jar, "바깥을 이루는 병"], [sheet, "병 아래를 막은 고무 막"]].filter((x) => x[0]).map((x) => `${x[1]}에 ${x[0]} 기호가 붙어 있다`).join(", ") || "부품에 기호는 붙어 있지 않다"}">
    <rect x="8" y="8" width="328" height="228" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <rect x="164" y="26" width="16" height="46" rx="6" fill="#E8F1FB" stroke="#7FA8D8" stroke-width="1.6"/>
    <path d="M104 72 H240 V212 H104 Z" fill="#F2F8FD" stroke="none" opacity=".9"/>
    <path d="M104 72 V212 M240 72 V212" fill="none" stroke="#9BB9DC" stroke-width="2.4"/>
    <path d="M120 62 H224 a10 10 0 0 1 10 10 H110 a10 10 0 0 1 10 -10 Z" fill="#DCE9F7" stroke="#9BB9DC" stroke-width="1.5"/>
    <ellipse cx="172" cy="${96 + bh * 0.5}" rx="${bw}" ry="${bh}" fill="#F0C9CE" stroke="#A83744" stroke-width="1.6"/>
    <path d="M172 72 V${96}" stroke="#A83744" stroke-width="3"/>
    <path d="M104 ${memY - 24} Q172 ${memY} 240 ${memY - 24}" fill="none" stroke="#C2606C" stroke-width="7" stroke-linecap="round"/>
    ${o.hand ? `<path d="M166 ${memY + 4} q6 -8 12 0 v22 h-12 Z" fill="#F3C7B4" stroke="#D89C82" stroke-width="1.4"/>` : ""}
    ${tube ? g2u6Mark(200, 40, tube, 11) : ""}
    ${balloon ? g2u6Mark(172, 96 + bh, balloon, 11) : ""}
    ${jar ? g2u6Mark(120, 92, jar, 11) : ""}
    ${sheet ? g2u6Mark(218, memY - 8, sheet, 11) : ""}
  </svg>`;
}

/** AL 허파꽈리 기체 교환(기호판) · 기체 기호를 허파꽈리 쪽과 모세혈관 쪽 **양쪽에** 배치한다
 *  (한쪽만 보고 정하면 뒤집히는 천재 02 구조 계승). dirs = 화살표 방향 [위쪽, 아래쪽]. */
export function alveoliQuizFig(o: { symA?: string | null; symB?: string | null; showArrows?: boolean; showWall?: boolean }): string {
  const arr = o.showArrows
    ? `<path d="M152 96 h44 m-8 -5.5 l8 5.5 l-8 5.5" fill="none" stroke="#3182F6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M196 148 h-44 m8 -5.5 l-8 5.5 l8 5.5" fill="none" stroke="#7C6BFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
    : "";
  // aria는 파라미터에서 파생한다. 화살표가 있으면 그 방향까지 관찰 서술로 말해야 이 그림으로만
  // 풀리는 문항(방향 판정)이 스크린리더에서도 성립한다. 기체의 정체는 여전히 학생 몫이라 유출이 아니다.
  const marks = o.symA && o.symB
    ? `기체 두 가지에 ${o.symA}·${o.symB} 기호가 붙어 있고 같은 기호가 벽 양쪽에 각각 놓여 있다`
    : "기체에 기호는 붙어 있지 않다";
  const arrows = o.showArrows
    ? `. ${o.symA}는 왼쪽에서 오른쪽으로, ${o.symB}는 오른쪽에서 왼쪽으로 향하는 화살표와 함께 그려져 있다`
    : "";
  const wall = o.showWall ? ". 두 자리를 가르는 벽은 한 겹으로 얇게 그려져 있다" : "";
  return `<svg viewBox="0 0 344 220" ${NS} role="img" aria-label="허파꽈리와 그것을 감싼 모세혈관을 얇은 벽 하나를 사이에 두고 그린 그림. ${marks}${arrows}${wall}">
    <rect x="8" y="8" width="328" height="204" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <path d="M26 122 C58 122 60 88 84 88" fill="none" stroke="#9BB9DC" stroke-width="12" stroke-linecap="round"/>
    <g fill="#E8F1FB" stroke="#7FA8D8" stroke-width="1.8">
      <circle cx="104" cy="72" r="30"/><circle cx="98" cy="132" r="30"/><circle cx="140" cy="102" r="26"/>
    </g>
    <path d="M212 42 C238 62 244 104 232 140 C222 172 208 186 196 194" fill="none" stroke="#D9525F" stroke-width="13" stroke-linecap="round"/>
    <path d="M212 42 C238 62 244 104 232 140 C222 172 208 186 196 194" fill="none" stroke="#4A6FA5" stroke-width="6" stroke-linecap="round" opacity=".55"/>
    <path d="M172 40 V196" stroke="#B9C2CC" stroke-width="2" stroke-dasharray="6 5"/>
    ${g2u6T(172, 32, "얇은 벽", { size: 10.8, weight: 700, fill: "#8B95A1" })}
    ${arr}
    ${o.symA ? `${g2u6Mark(132, 96, o.symA, 11)}${g2u6Mark(216, 96, o.symA, 11)}` : ""}
    ${o.symB ? `${g2u6Mark(216, 148, o.symB, 11)}${g2u6Mark(132, 150, o.symB, 11)}` : ""}
    ${o.showWall ? `<path d="M164 108 h16 M164 108 l4 -4 M164 108 l4 4 M180 108 l-4 -4 M180 108 l-4 4" fill="none" stroke="#4E5968" stroke-width="1.6" stroke-linecap="round"/>${g2u6T(172, 124, "한 겹", { size: 10, weight: 800, fill: "#4E5968", halo: "#FFFFFF" })}` : ""}
    ${g2u6T(90, 206, "허파꽈리 쪽", { size: 10.8, weight: 800, fill: "#2E5D93" })}
    ${g2u6T(262, 206, "모세혈관 쪽", { size: 10.8, weight: 800, fill: "#8C3540" })}
  </svg>`;
}

/** GT 들숨·날숨 성분 자료 표 · svgTable 래핑(3열 한글 ≤8자 준수). */
export function gasTableFig(head: string[], rows: string[][]): string {
  return g2u6TableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "들숨과 날숨에 든 기체의 양을 견준 표");
}

// ══════════════════ L5 배설계 ══════════════════

/** UT 혈액·여과액·오줌 성분 표 · svgTable 래핑(3열 한글 ≤8자). */
export function urineTableFig(head: string[], rows: string[][]): string {
  return g2u6TableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "여과액과 오줌에 든 물질을 견준 표");
}

/** HC 검사 결과지(항목 | 결과 | 정상 범위) · svgTable 래핑(천재 10 구조 계승 · 대소 비교만). */
export function checkupFig(rows: string[][]): string {
  const head = ["검사 항목", "결과", "정상 범위"];
  return g2u6TableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "건강 검진 결과지의 일부");
}

// ══════════════════ L6 세포호흡과 기관계의 통합 ══════════════════

/** CR 세포호흡 도해(기호판) · 재료 칸·결과 칸을 기호로 가릴 수 있다.
 *  hide = "in" 재료 가림 · "out" 결과 가림 · "none". */
export function cellRespQuizFig(o: { inItems: string[]; outItems: string[]; hide?: "in" | "out" | "none"; symIn?: string; symOut?: string }): string {
  const boxed = (x: number, y: number, w: number, title: string, items: string[], hidden: boolean, sym?: string): string => {
    const rows = items
      .map((it, i) => `<rect x="${x + 9}" y="${y + 34 + i * 32}" width="${w - 18}" height="26" rx="8" fill="#F7F8FA" stroke="#DCE0E6" stroke-width="1"/>${g2u6T(x + w / 2, y + 51 + i * 32, it, { size: 11.5, weight: 700 })}`)
      .join("");
    const masked = `<rect x="${x + 9}" y="${y + 34}" width="${w - 18}" height="${items.length * 32 - 6}" rx="8" fill="#FFFFFF" stroke="#3182F6" stroke-width="1.7" stroke-dasharray="5 4"/>${g2u6T(x + w / 2, y + 34 + (items.length * 32 - 6) / 2 + 5, sym ?? "㉠", { size: 15, weight: 800, fill: "#1B64DA" })}`;
    return `<rect x="${x}" y="${y}" width="${w}" height="${34 + items.length * 32 - 4}" rx="12" fill="#FFFFFF" stroke="#C9D0D8" stroke-width="1.3"/>
      ${g2u6T(x + w / 2, y + 22, title, { size: 12, weight: 900, fill: "#4E5968" })}${hidden ? masked : rows}`;
  };
  // 상자 폭 96 · 원 반지름 44에서는 좌우 화살표가 4~10px밖에 남지 않아 방향 단서로 기능하지 못했다
  // (검산 B 33 · 해설은 화살표 방향을 판독 근거로 든다). 상자를 좁히고 원을 줄여 ≥24px를 확보한다.
  const BW = 84;
  const RAD = 38;
  const H = 46 + Math.max(o.inItems.length, o.outItems.length) * 32 + 40;
  const midY = 24 + (34 + Math.max(o.inItems.length, o.outItems.length) * 32 - 4) / 2;
  // aria 파생: 칸에 실제로 적힌 내용과 가림 기호를 낭독해야 접근성 경로에서도 문항이 성립한다(§9-1 B13).
  const inTxt = o.hide === "in" ? `가려져 ${o.symIn ?? "㉠"} 기호로 표시되어` : o.inItems.join("와 ") + "가 적혀";
  const outTxt = o.hide === "out" ? `가려져 ${o.symOut ?? "㉠"} 기호로 표시되어` : o.outItems.join("와 ") + "가 적혀";
  return `<svg viewBox="0 0 344 ${H}" ${NS} role="img" aria-label="조직세포를 가운데 두고 왼쪽에 들어가는 물질 칸, 오른쪽에 생기는 물질 칸을 놓은 도해. 왼쪽 칸에는 ${inTxt} 있고 오른쪽 칸에는 ${outTxt} 있다. 화살표는 왼쪽 칸에서 조직세포로, 조직세포에서 오른쪽 칸으로 향한다">
    <rect x="8" y="8" width="328" height="${H - 16}" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    ${boxed(14, 24, BW, "들어가는 물질", o.inItems, o.hide === "in", o.symIn)}
    ${boxed(344 - 14 - BW, 24, BW, "생기는 물질", o.outItems, o.hide === "out", o.symOut)}
    <circle cx="172" cy="${midY}" r="${RAD}" fill="#EAF6EC" stroke="#7FB77E" stroke-width="1.8"/>
    ${g2u6T(172, midY + 5, "조직세포", { size: 12.5, weight: 900, fill: "#3B7A44" })}
    <path d="M${14 + BW + 6} ${midY} h${172 - RAD - (14 + BW + 6) - 4} m-6 -5 l6 5 l-6 5" fill="none" stroke="#37A446" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${172 + RAD + 4} ${midY} h${344 - 14 - BW - 6 - (172 + RAD + 4) - 4} m-6 -5 l6 5 l-6 5" fill="none" stroke="#7C6BFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    ${g2u6T(172, H - 14, "에너지는 이 과정에서 생명 활동에 쓰여요", { size: 10.5, weight: 700, fill: "#6B7684" })}
  </svg>`;
}

/** SI 기관계 상자 + 물질 화살표(기호판) · 상자 이름을 기호로 가리고 화살표 라벨만으로 역산시킨다
 *  (천재 08 구조 계승). boxes = [왼위, 왼아래, 오른위, 오른아래] · center는 고정 표기. */
export function systemsQuizFig(o: { boxes: { sym: string; label?: string; inLabel?: string; outLabel?: string; dir?: "toCenter" | "fromCenter" | "both" }[]; center?: string }): string {
  // 가운데 순환계는 **세로 막대**로 그린다. 네 상자를 모서리에 두고 중앙에 작은 상자를 놓으면
  // 화살표가 그 상자를 비껴가거나(직결로 오독) 상자에 덮여 사라진다(사용자 검수 36·37번 적발).
  // 막대로 두면 두 줄 모두 같은 높이에서 막대 변에 정확히 닿는다.
  const BW = 92;
  const BH = 54;
  const LX = 8;
  const RX = 244;
  const CX = 136;
  const CW = 72;
  const ROW = [28, 124];
  const POS: [number, number][] = [
    [LX, ROW[0]],
    [LX, ROW[1]],
    [RX, ROW[0]],
    [RX, ROW[1]],
  ];
  const body = o.boxes
    .map((b, i) => {
      const [x, y] = POS[i] ?? POS[0];
      const cxm = x + BW / 2;
      const ay = y + BH / 2;
      const left = x < 172;
      const dir = b.dir ?? "toCenter";
      // 화살표는 바깥 상자 변 ↔ 가운데 막대 변 사이 빈 구간에만 그린다(어디에도 덮이지 않는다).
      const a1 = left ? x + BW + 4 : x - 4;
      const a2 = left ? CX - 4 : CX + CW + 4;
      const head = (px: number, sign: number): string => `M${px} ${ay} l${-7 * sign} -5 M${px} ${ay} l${-7 * sign} 5`;
      const toCenter = dir === "toCenter";
      const tip = dir === "both" ? "" : toCenter ? head(a2, left ? 1 : -1) : head(a1, left ? -1 : 1);
      const both = dir === "both" ? `${head(a2, left ? 1 : -1)} ${head(a1, left ? -1 : 1)}` : "";
      return `<rect x="${x}" y="${y}" width="${BW}" height="${BH}" rx="12" fill="#FFFFFF" stroke="#C9D0D8" stroke-width="1.4"/>
        ${b.label ? g2u6T(cxm, y + BH / 2 + 5, b.label, { size: 12, weight: 900 }) : g2u6Mark(cxm, y + BH / 2, b.sym)}
        ${b.inLabel ? `<path d="M${cxm} ${y - 6} V${y - 1}" stroke="#B4690E" stroke-width="1.2" stroke-linecap="round"/>${g2u6T(cxm, y - 8, b.inLabel, { size: 10.8, weight: 800, fill: "#B4690E" })}` : ""}
        ${b.outLabel ? `<path d="M${cxm} ${y + BH + 2} V${y + BH + 7} " stroke="#B4690E" stroke-width="1.2" stroke-linecap="round"/>${g2u6T(cxm, y + BH + 17, b.outLabel, { size: 10.8, weight: 800, fill: "#B4690E" })}` : ""}
        <path d="M${a1} ${ay} H${a2} ${tip}${both}" fill="none" stroke="#3182F6" stroke-width="2.2" stroke-linecap="round"/>`;
    })
    .join("");
  // aria 파생: 상자마다 무엇이 붙어 있고 화살표가 어느 쪽을 향하는지까지 관찰 서술한다.
  const WHERE = ["왼쪽 위", "왼쪽 아래", "오른쪽 위", "오른쪽 아래"];
  const desc = o.boxes
    .map((b, i) => {
      const who = b.label ? `${b.label}이라고 적힌 상자` : `${b.sym} 기호가 붙은 상자`;
      const io2 = [b.inLabel ? `위에 ${b.inLabel}` : "", b.outLabel ? `아래에 ${b.outLabel}` : ""].filter(Boolean).join(", ");
      const d = b.dir === "fromCenter" ? "가운데에서 이 상자 쪽으로" : b.dir === "both" ? "양쪽으로" : "이 상자에서 가운데 쪽으로";
      return `${WHERE[i]}는 ${who}이고${io2 ? ` ${io2}가 적혀 있으며` : ""} 화살표는 ${d} 향한다`;
    })
    .join(". ");
  return `<svg viewBox="0 0 344 206" ${NS} role="img" aria-label="가운데에 ${o.center ?? "순환계"} 상자를 세로로 길게 두고 그 양옆에 상자 네 개를 놓은 관계 도해. ${desc}">
    <rect x="8" y="8" width="328" height="190" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <rect x="${CX}" y="22" width="${CW}" height="158" rx="14" fill="#EEF4FF" stroke="#3182F6" stroke-width="1.7"/>
    ${g2u6T(CX + CW / 2, 96, o.center ?? "순환계", { size: 12.5, weight: 900, fill: "#1B64DA" })}
    ${g2u6T(CX + CW / 2, 114, "혈액", { size: 11, weight: 700, fill: "#4E5968" })}
    ${body}
  </svg>`;
}

/** AT 활동 강도별 지표 표 · svgTable 래핑(천재 09 구조 계승 · 한 지표만 추세가 반대). */
export function activityTableFig(head: string[], rows: string[][]): string {
  return g2u6TableAria(svgTable(head, rows, { firstColHead: true }), head, rows, "활동에 따른 몸의 변화를 견준 표");
}

// ══════════════════ 확대 120 신작(파일럿 문항은 건드리지 않는 append) ══════════════════
// 사용자 검수로 "해부 구조도는 발주 라스터가 정본"이 확정됐다(§5-1). 라스터는 장당 2문항이 상한이라
// 확대분의 시각 조달은 **해부가 아닌 자료**(표·성질 카드·이동 도해)로 채운다. 셋 다 파라미터형이고
// aria는 파라미터에서 파생한다.

/** 표 범용 래퍼 · what은 이 표가 무엇을 정리한 것인지만 적는다(판정 결과·해석은 적지 않는다). */
export function dataTableFig(what: string, head: string[], rows: string[][]): string {
  return g2u6TableAria(svgTable(head, rows, { firstColHead: true }), head, rows, what);
}

/** 정체 역동정 카드 · 기호 배지 + 성질 줄을 가로 카드로 쌓는다.
 *  같은 해부 그림을 반복하지 않고도 "순서 없이 나타낸 것" 아키타입을 만들 수 있다.
 *  성질 줄에는 이름을 적지 않는 것이 원칙이다(이름을 적으면 정체가 인쇄된다). */
export function factCardsFig(o: { cards: { sym: string; lines: string[] }[]; caption?: string }): string {
  const W = 344;
  const LH = 17;
  let y = 14;
  const parts: string[] = [];
  for (const c of o.cards) {
    const wrapped = c.lines.flatMap((ln) => g2u6WrapKo(ln, 20));
    const h = 14 + wrapped.length * LH;
    parts.push(`<rect x="12" y="${y}" width="${W - 24}" height="${h}" rx="11" fill="#FFFFFF" stroke="#DCE0E6" stroke-width="1.2"/>`);
    parts.push(g2u6Mark(38, y + h / 2, c.sym, 12.5));
    wrapped.forEach((ln, k) => parts.push(g2u6T(66, y + 22 + k * LH, ln, { size: 12, anchor: "start", weight: 700, fill: "#333D4B" })));
    y += h + 8;
  }
  const H = y + (o.caption ? 22 : 4);
  if (o.caption) parts.push(g2u6T(W / 2, H - 8, o.caption, { size: 10.8, weight: 700, fill: "#6B7684" }));
  const desc = o.cards.map((c) => `${c.sym} 카드에는 ${c.lines.join(", ")}${g2u6Josa(c.lines[c.lines.length - 1] ?? "", "이라고/라고")} 적혀 있다`).join(". ");
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="성질을 적은 카드 ${o.cards.length}장을 위아래로 늘어놓은 그림. 이름은 적혀 있지 않다. ${desc}">
    <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    ${parts.join("")}
  </svg>`;
}

/** 두 자리 사이 물질 이동 도해 · 이름 상자 둘과 그 사이 화살표.
 *  dir "right"면 왼쪽에서 오른쪽으로 간다. 방향 판정이 정답인 문항에서는 물질 이름을 기호로 가린다. */
export function transferFig(o: { left: string; right: string; arrows: { sym: string; dir: "right" | "left" }[]; caption?: string; note?: string }): string {
  const W = 344;
  const BX = 20;
  const BW = 96;
  const RX = W - BX - BW;
  const n = o.arrows.length;
  const boxH = n * 46 + 18;
  // 상자 아래에 note·caption 자리를 따로 확보한다(초판은 두 줄이 상자 안으로 파고들었다 · 갤러리 적발).
  const boxBottom = 46 + boxH;
  const noteY = boxBottom + 18;
  const capY = boxBottom + (o.note ? 40 : 18);
  const H = boxBottom + (o.note ? 26 : 0) + (o.caption ? 28 : 0) + 12;
  const body = o.arrows
    .map((a, i) => {
      const y = 60 + i * 46;
      const x1 = a.dir === "right" ? BX + BW + 10 : RX - 10;
      const x2 = a.dir === "right" ? RX - 10 : BX + BW + 10;
      const s = a.dir === "right" ? 1 : -1;
      return `<path d="M${x1} ${y} H${x2} M${x2} ${y} l${-9 * s} -5.5 M${x2} ${y} l${-9 * s} 5.5" fill="none" stroke="#3182F6" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        ${g2u6Mark((x1 + x2) / 2, y - 17, a.sym, 12)}`;
    })
    .join("");
  const desc = o.arrows.map((a) => `${a.sym}${g2u6Josa(a.sym, "은/는")} ${a.dir === "right" ? `${o.left} 쪽에서 ${o.right} 쪽으로` : `${o.right} 쪽에서 ${o.left} 쪽으로`} 향하는 화살표와 함께 그려져 있다`).join(", ");
  return `<svg viewBox="0 0 ${W} ${H}" ${NS} role="img" aria-label="왼쪽에 ${o.left}, 오른쪽에 ${o.right} 상자를 두고 그 사이에 물질이 옮겨 가는 화살표를 그린 그림. ${desc}${o.note ? `. ${o.note}` : ""}">
    <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="14" fill="#FBFCFD" stroke="#DCE0E6" stroke-width="1.3"/>
    <rect x="${BX}" y="46" width="${BW}" height="${boxH}" rx="12" fill="#E8F1FB" stroke="#7FA8D8" stroke-width="1.5"/>
    <rect x="${RX}" y="46" width="${BW}" height="${boxH}" rx="12" fill="#FADFE3" stroke="#C2606C" stroke-width="1.5"/>
    ${g2u6T(BX + BW / 2, 34, o.left, { size: 12.5, weight: 900, fill: "#2E5D93" })}
    ${g2u6T(RX + BW / 2, 34, o.right, { size: 12.5, weight: 900, fill: "#8C3540" })}
    ${body}
    ${o.note ? g2u6T(W / 2, noteY, o.note, { size: 10.8, weight: 700, fill: "#6B7684" }) : ""}
    ${o.caption ? g2u6T(W / 2, capY, o.caption, { size: 10.8, weight: 700, fill: "#6B7684" }) : ""}
  </svg>`;
}

// -- g2u6 v2 섹션 끝 --

/* ============== g2u5 v2 신작(파일럿 승격 · 신규 출제 14호) ============== */
// 물질 출입 도해·잎 단면·아이오딘 잎·기체 센서 곡선·밀폐 용기 패널·요인 곡선·낮밤 출입·
// 광합성량 호흡량 막대·물관 체관 경로. 전부 파라미터형 · aria는 파라미터에서 파생.
// 수정은 qa/g2u5v2-pilot.ts에서 한 뒤 qa/build-g2u5v2-lessons.mjs를 다시 돌린다.
// ── g2u5 v2 공용 팔레트(examFigures 관행대로 하드 헥스 · 토큰 미로드 환경에서도 색이 산다) ──
const C = {
  ink: "#333D4B", sub: "#4E5968", line: "#C9D0D8", panel: "#F2F4F7", white: "#FFFFFF",
  leafHi: "#7FD66D", leaf: "#39A85A", leafLo: "#17643A", vein: "#8FCB6B",
  xylem: "#3C93E8", phloem: "#DC4B86", sun: "#F0A422", sunHi: "#FFD97A",
  co2: "#7A8798", o2: "#17958F", o2Fill: "#7FD5D0", glucose: "#7A5FCB", starch: "#B08FE0",
  soil: "#8A6440", night: "#1E2C4A", blue: "#1B64DA", tint: "#EAF7EF", warn: "#C43A2E",
};

// ── 발주 도해 베이스(public/exam/g2u5fig · 글자·기호·화살표 0의 일러스트) ──────────────
// 하이브리드 방침: 라스터는 그림만 담고, 기호(㉠㉡)·물질 이름 칩·화살표는 아래 헬퍼가 SVG로 얹는다.
// 오버레이 좌표는 눈대중이 아니라 qa/shot-g2u5fig-grid.mjs로 격자를 얹어 실측한 원본 비율에서 역산했다.
const G5_IMG_BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";
const g5fig = (file: string): string => `${G5_IMG_BASE}exam/g2u5fig/${file}`;

/** 문서 안에서 유일한 id(리뷰 화면이 같은 그림을 여러 번 렌더해도 clipPath가 충돌하지 않게). */
let uidSeed = Math.floor(Math.random() * 1679616);
const uid = (): string => `g5${(uidSeed++).toString(36)}`;

/** 기호 배지(원 + 기호) + 지시선. 지시선 없는 라벨은 무엇을 가리키는지 모호해진다(plantFigures 결함). */
const g5badge = (bx: number, by: number, tx: number, ty: number, sym: string, color: string): string =>
  `<line x1="${bx}" y1="${by}" x2="${tx}" y2="${ty}" stroke="${color}" stroke-width="1.4"/>
   <circle cx="${bx}" cy="${by}" r="12" fill="#FFFFFF" stroke="${color}" stroke-width="1.6"/>
   <text x="${bx}" y="${by + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${color}">${sym}</text>`;

const g5chip = (x: number, y: number, w: number, text: string, color: string, dashed = false): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="24" rx="12" fill="#FFFFFF" stroke="${color}" stroke-width="${dashed ? 1.8 : 1.5}"${dashed ? ' stroke-dasharray="5 4"' : ""}/>
   <text x="${x + w / 2}" y="${y + 16.5}" text-anchor="middle" font-size="12" font-weight="${dashed ? 800 : 700}" fill="${color}">${text}</text>`;

/** 화살촉 크기는 **선 굵기와 분리**한다(markerUnits="userSpaceOnUse").
 *  기본값(strokeWidth)이면 굵기 4.6짜리 화살에 29px 화살촉이 붙어 몸통이 안 보인다(사용자 지적). */
const arrowDefs = (id: string, color: string, size = 12): string =>
  `<marker id="${id}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="${size}" markerHeight="${size}" markerUnits="userSpaceOnUse" orient="auto"><path d="M1 1 L9 5 L1 9 Z" fill="${color}"/></marker>`;

// ══════════════════════════════════════════════════════════════════════════════
// PS · 광합성·호흡 물질/에너지 출입 도해 (파라미터 가림판)
// 구 respirationCycleFig은 "포도당·산소"·"이산화 탄소·물"·"에너지"를 전부 글자로 인쇄해
// 물질 방향을 묻는 문항에 쓰면 정답 인쇄였다. 이 판은 슬롯별 가림(㉠㉡㉢㉣)을 지원한다.
// ══════════════════════════════════════════════════════════════════════════════
type PsSlot = "in1" | "in2" | "out1" | "out2" | "site" | "energy";
const PS_TEXT: Record<"photo" | "resp", Record<PsSlot, string>> = {
  photo: { in1: "이산화 탄소", in2: "물", out1: "포도당", out2: "산소", site: "엽록체", energy: "빛에너지" },
  resp: { in1: "포도당", in2: "산소", out1: "이산화 탄소", out2: "물", site: "마이토콘드리아", energy: "에너지" },
};
/** o.hide 순서대로 ㉠㉡㉢㉣를 배정한다. o.reverse에 든 화살표는 방향이 뒤집힌다(오류 찾기 문항용).
 *  o.arrowSyms가 참이면 네 화살표에 ㉠~㉣ 기호를 단다(가림과 동시에 쓰지 않는다). */
/** o.materials === false면 물질 칩·화살표를 아예 그리지 않는다(에너지 방향만 묻는 문항용 ·
 *  같은 도해를 두 문항이 나눠 쓰면 한쪽이 다른 쪽의 정답을 인쇄한다). */
export function psExchangeFig(o: { mode: "photo" | "resp"; hide?: PsSlot[]; reverse?: PsSlot[]; arrowSyms?: boolean; materials?: false }): string {
  const T = PS_TEXT[o.mode];
  const SYM = ["㉠", "㉡", "㉢", "㉣"];
  const hidden = new Map<PsSlot, string>();
  (o.hide ?? []).forEach((k, i) => hidden.set(k, SYM[i] ?? "㉠"));
  const rev = new Set(o.reverse ?? []);
  const label = (k: PsSlot): string => hidden.get(k) ?? T[k];
  const isHid = (k: PsSlot): boolean => hidden.has(k);
  const CY = 112, RY = 32;
  // 화살표·칩 색은 물질마다 고정한다(한 색이 두 물질을 뜻하면 색이 오독의 단서가 된다).
  const MAT_COL: Record<"photo" | "resp", Record<"in1" | "in2" | "out1" | "out2", string>> = {
    photo: { in1: C.co2, in2: C.xylem, out1: C.glucose, out2: C.o2 },
    resp: { in1: C.glucose, in2: C.o2, out1: C.co2, out2: C.xylem },
  };
  const mIn = uid(), mOut = uid(), mE = uid();

  // 소기관은 발주 일러스트를 얹는다. 임베드 사각형은 "그림 속 소기관 몸통"이 (CX,CY) 중심의
  // 가로 128 상자에 오도록 실측 비율에서 역산했다(엽록체 몸통 = 원본 폭 87%·높이 41%·중심 48.5/49.5%,
  // 마이토콘드리아 = 84%·43%·중심 50/47.5%). 결과는 두 모드 모두 몸통이 x 108~236 · y 80~144.
  const EMB = o.mode === "photo"
    ? { file: "chloroplast.webp", x: 100.7, y: 39.2, w: 147.1 }
    : { file: "mitochondrion.webp", x: 95.8, y: 39.6, w: 152.4 };
  const organelle = `<image href="${g5fig(EMB.file)}" x="${EMB.x}" y="${EMB.y}" width="${EMB.w}" height="${EMB.w}" preserveAspectRatio="xMidYMid meet"/>`;

  // 물질 화살표 4개 · in은 기본 오른쪽(들어감), out은 기본 오른쪽(나감). reverse면 뒤집는다.
  const hArrow = (x1: number, x2: number, y: number, color: string, marker: string, flip: boolean): string =>
    flip
      ? `<path d="M${x2} ${y} H${x1}" stroke="${color}" stroke-width="3.2" marker-end="url(#${marker})" fill="none"/>`
      : `<path d="M${x1} ${y} H${x2}" stroke="${color}" stroke-width="3.2" marker-end="url(#${marker})" fill="none"/>`;

  // 화살표 높이는 소기관 몸통(y 80~144)의 위·아래 어깨에 닿는 96과 128로 잡는다.
  const rows: { k: "in1" | "in2" | "out1" | "out2"; y: number; side: "L" | "R" }[] = [
    { k: "in1", y: 96, side: "L" },
    { k: "in2", y: 128, side: "L" },
    { k: "out1", y: 96, side: "R" },
    { k: "out2", y: 128, side: "R" },
  ];
  const markers = new Map<string, string>();
  let body = "";
  let ai = 0;
  for (const r of o.materials === false ? [] : rows) {
    const hid = isHid(r.k);
    const col = hid ? C.blue : MAT_COL[o.mode][r.k];
    const mk = `${r.side === "L" ? mIn : mOut}${r.k}`;
    markers.set(mk, col);
    if (r.side === "L") {
      body += g5chip(8, r.y - 12, 84, label(r.k), col, hid);
      body += hArrow(94, 126, r.y, col, mk, rev.has(r.k));
    } else {
      body += g5chip(252, r.y - 12, 84, label(r.k), col, hid);
      body += hArrow(218, 250, r.y, col, mk, rev.has(r.k));
    }
    if (o.arrowSyms) {
      const bx = r.side === "L" ? 104 : 240;
      body += `<circle cx="${bx}" cy="${r.y - 18}" r="10.5" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.4"/>
        <text x="${bx}" y="${r.y - 13.8}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${C.sub}">${SYM[ai]}</text>`;
    }
    ai += 1;
  }

  // 에너지(세로) · 광합성은 들어오고, 호흡은 나간다.
  const eHid = isHid("energy");
  const eCol = eHid ? C.blue : C.sun;
  markers.set(mE, eCol);
  const eFlip = rev.has("energy");
  const down = o.mode === "photo" ? !eFlip : eFlip;
  body += down
    ? `<path d="M172 40 V72" stroke="${eCol}" stroke-width="3.2" marker-end="url(#${mE})" fill="none"/>`
    : `<path d="M172 72 V40" stroke="${eCol}" stroke-width="3.2" marker-end="url(#${mE})" fill="none"/>`;
  body += `<text x="172" y="30" text-anchor="middle" font-size="12.5" font-weight="800" fill="${eCol}">${label("energy")}</text>`;

  const sHid = isHid("site");
  body += `<rect x="106" y="${CY + RY + 8}" width="132" height="26" rx="13" fill="${sHid ? "#FFFFFF" : C.tint}" stroke="${sHid ? C.blue : C.leafLo}" stroke-width="${sHid ? 1.8 : 1.4}"${sHid ? ' stroke-dasharray="5 4"' : ""}/>
    <text x="172" y="${CY + RY + 25}" text-anchor="middle" font-size="13" font-weight="800" fill="${sHid ? C.blue : C.leafLo}">${label("site")}</text>`;

  const hidNames = (o.hide ?? []).map((_k, i) => SYM[i]).join("·");
  const aria = o.materials === false
    ? "한 세포 소기관과, 그 위쪽으로 이어진 에너지 화살표만 그린 그림"
    : `한 세포 소기관을 가운데 두고 왼쪽과 오른쪽에 물질 이름 칸이 두 개씩 있고 각 칸에 화살표가 이어진 그림${o.hide?.length ? `. ${hidNames} 자리는 이름이 가려져 있다` : ""}${o.arrowSyms ? ". 화살표마다 기호가 붙어 있다" : ""}`;
  const defs = [...markers].map(([id, col]) => arrowDefs(id, col)).join("");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="${aria}"><defs>${defs}</defs>${organelle}${body}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// LF · 잎 단면 + 부위 기호 (지시선 필수 · 인셋에도 연결선)
// 구 leafRouteFig은 기공 인셋이 지시선 없이 잎 바깥에 떠 있고 (가)(나)(다) 배정이 레슨에 3중 소진.
// ══════════════════════════════════════════════════════════════════════════════
type LfPart = "chloro" | "stoma" | "xylem" | "phloem" | "cell";
/** 발주 일러스트(leaf-section.webp) 위에 기호 배지와 지시선만 얹는다.
 *  지시선 끝점은 qa/shot-g2u5fig-grid.mjs로 격자를 얹어 실측한 원본 비율에서 역산했다:
 *  물관 다발 (23.5%, 40%) · 체관 다발 (23%, 55%) · 엽록체 알갱이 (52%, 28%) ·
 *  해면 세포 (48.5%, 57%) · 기공 틈 (74.5%, 71.5%). 그림은 4:3이므로 x% x 3.44, y% x 2.58. */
export function leafPartsFig(o: { marks: { part: LfPart; sym: string }[] }): string {
  const IW = 344, IH = 258;
  const px = (f: number): number => Math.round(f * IW / 100) / 100;   // f = 만분율(2350 = 23.50%)
  const py = (f: number): number => Math.round(f * IH / 100) / 100;   // f = 만분율(7150 = 71.50%)
  const art = `<image href="${g5fig("leaf-section.webp")}" x="0" y="0" width="${IW}" height="${IH}" preserveAspectRatio="xMidYMid meet"/>`;
  // 배지는 그림의 흰 여백(위 0~45 · 아래 191~258)에만 둔다.
  const POS: Record<LfPart, { bx: number; by: number; tx: number; ty: number; col: string }> = {
    xylem: { bx: 36, by: 24, tx: px(2350), ty: py(4000), col: C.xylem },
    chloro: { bx: 180, by: 22, tx: px(5200), ty: py(2800), col: C.leafLo },
    phloem: { bx: 40, by: 234, tx: px(2300), ty: py(5500), col: C.phloem },
    cell: { bx: 152, by: 234, tx: px(4850), ty: py(5700), col: C.sub },
    stoma: { bx: 302, by: 234, tx: px(7450), ty: py(7150), col: C.leafLo },
  };
  let badges = "";
  for (const m of o.marks) {
    const p = POS[m.part];
    badges += g5badge(p.bx, p.by, p.tx, p.ty, m.sym, p.col);
  }
  const syms = o.marks.map((m) => m.sym).join("·");
  return `<svg viewBox="0 0 ${IW} ${IH}" ${NS} fill="none" role="img" aria-label="잎을 세로로 자른 단면 그림. 위아래에 납작한 세포가 한 줄씩 있고 그 사이를 길쭉한 세포와 둥근 세포가 채우고 있으며, 아래쪽 한 곳에는 세포 두 개가 감싼 틈이 있다. ${syms} 기호가 각각 서로 다른 부분을 가리킨다">${art}${badges}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// ST · 아이오딘 반응 잎 (조건 라벨 기본 미인쇄 · 부위 기호 ㉠㉡)
// 구 starchTestFig은 "햇빛 받은 잎 / 햇빛 가린 잎" 조건을 인쇄해 판정 과제가 붕괴했다.
// ══════════════════════════════════════════════════════════════════════════════
/** regions는 왼쪽부터(ring이면 [바깥 테두리, 안쪽]).
 *  result "blue" = 청람색 · "none" = 반응 없음(탈색된 옅은 빛깔) · "green" = 아직 반응 전 초록 ·
 *  "white" = 엽록소가 없는 흰 부분. */
export function starchLeafFig(o: {
  regions: { result: "blue" | "none" | "green" | "white"; sym?: string }[];
  cover?: number;   // 이 구간을 은박 띠로 덮는다(인덱스 · ring 모드에서는 무시)
  ring?: boolean;   // 얼룩무늬 잎 문법 · 바깥 테두리와 안쪽을 나눈다
}): string {
  const id = uid(), idIn = uid();
  const n = o.regions.length;
  const LX = 34, RX = 310, TY = 46, BY = 168;
  const CXm = (LX + RX) / 2, CYm = (TY + BY) / 2;
  const seg = (RX - LX) / n;
  const FILL: Record<string, string> = { blue: "#2E4E9E", none: "#EDE4CE", green: "#49AE63", white: "#F7F7F2" };
  const leafPath = (s: number): string => {
    const lx = CXm + (LX - CXm) * s, rx = CXm + (RX - CXm) * s;
    const ty = CYm + (TY - CYm) * s, by = CYm + (BY - CYm) * s;
    return `M${lx} ${CYm} C${lx + (rx - lx) * 0.09} ${ty - 6 * s} ${rx - (rx - lx) * 0.15} ${ty - 2 * s} ${rx} ${CYm} C${rx - (rx - lx) * 0.15} ${by + 2 * s} ${lx + (rx - lx) * 0.09} ${by + 6 * s} ${lx} ${CYm} Z`;
  };
  const leaf = leafPath(1);
  let fills = "";
  let marks = "";
  if (o.ring) {
    fills += `<path d="${leaf}" fill="${FILL[o.regions[0].result]}"/>`;
    fills += `<path d="${leafPath(0.6)}" fill="${FILL[o.regions[1]?.result ?? "none"]}" stroke="${C.leafLo}" stroke-width="1.4" stroke-dasharray="5 4"/>`;
    const at: [number, number][] = [[LX + 30, CYm], [CXm, CYm]];
    o.regions.slice(0, 2).forEach((r, i) => {
      if (!r.sym) return;
      marks += `<circle cx="${at[i][0]}" cy="${at[i][1]}" r="14" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.6"/>
        <text x="${at[i][0]}" y="${at[i][1] + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="${C.ink}">${r.sym}</text>`;
    });
  } else {
    o.regions.forEach((r, i) => {
      fills += `<rect x="${LX + seg * i}" y="${TY - 12}" width="${seg + 0.6}" height="${BY - TY + 24}" fill="${FILL[r.result]}" clip-path="url(#${id})"/>`;
      if (!r.sym) return;
      const cx = LX + seg * (i + 0.5);
      marks += `<circle cx="${cx}" cy="${CYm}" r="14" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.6"/>
        <text x="${cx}" y="${CYm + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="${C.ink}">${r.sym}</text>`;
    });
  }
  let cover = "";
  if (o.cover !== undefined && !o.ring) {
    const x = LX + seg * o.cover;
    cover = `<rect x="${x}" y="${TY - 8}" width="${seg}" height="${BY - TY + 16}" rx="7" fill="#C6CDD6" stroke="#8B95A1" stroke-width="1.6" opacity=".95"/>
      <path d="M${x + 7} ${TY + 12} l${seg - 14} 0 M${x + 7} ${TY + 44} l${seg - 14} 0 M${x + 7} ${TY + 76} l${seg - 14} 0 M${x + 7} ${TY + 108} l${seg - 14} 0" stroke="#FFFFFF" stroke-width="1.2" opacity=".7"/>`;
  }
  const plate = `<ellipse cx="172" cy="${CYm + 26}" rx="152" ry="44" fill="#FFFFFF" stroke="${C.line}" stroke-width="2"/>`;
  const shapeTxt = o.ring ? "잎의 바깥 테두리와 안쪽의 빛깔이 서로 다르다" : `잎이 ${n}개 구역으로 나뉘어 서로 다른 빛깔로 보인다`;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="접시 위에 놓인 잎 한 장을 위에서 본 그림. ${shapeTxt}${o.cover !== undefined && !o.ring ? ". 한 구역은 은박으로 덮여 있다" : ""}">
    <defs><clipPath id="${id}"><path d="${leaf}"/></clipPath><clipPath id="${idIn}"><path d="${leafPath(0.6)}"/></clipPath></defs>
    ${plate}<path d="${leaf}" fill="#EDE4CE" stroke="${C.leafLo}" stroke-width="2"/>${fills}
    <path d="${leaf}" fill="none" stroke="${C.leafLo}" stroke-width="2"/>
    ${o.ring ? "" : `<path d="M${LX + 8} ${CYm} H${RX - 10}" stroke="${C.leafLo}" stroke-width="1.6" opacity=".45"/>`}${cover}${marks}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// SP · 기체 농도 시간 곡선 (정성 · 눈금 수치 없음 · 가이드 점선 금지)
// 구 sensorGraphFig의 고정 aria "이산화 탄소 감소와 산소 증가"는 정답 낭독이었다.
// ══════════════════════════════════════════════════════════════════════════════
type SpShape = "up" | "down" | "flat" | "flat-up" | "flat-down" | "up-flat" | "down-flat" | "down-up" | "up-down";
export function gasSensorFig(o: {
  series: { name: string; shape: SpShape; color?: string }[];
  changeAt?: number;                          // 0~1 · flat/꺾임 지점
  marks?: { frac: number; sym: string }[];    // 세로 점선 + 기호
  xLabel?: string; yLabel?: string;
}): string {
  const L = 54, R = 328, TOP = 30, BASE = 156;
  const k = o.changeAt ?? 0.45;
  const px = (f: number): number => L + f * (R - L);
  const HI = TOP + 10, LO = BASE - 12, MID = (HI + LO) / 2;
  const path = (shape: SpShape): string => {
    const kx = px(k);
    switch (shape) {
      // flat은 "변화가 없는 대조군"이라 다른 곡선과 **같은 높이에서 출발**해야 한다.
      // MID에서 시작하던 초판은 247(똑같이 밀폐한 두 용기)에서 두 용기의 처음 농도가 다르게 그려졌다
      // (갤러리 눈검수 자가 적발). down도 HI에서 출발하므로 왼쪽 끝에서 만났다가 갈라진다.
      case "flat": return `M${L} ${HI} H${R}`;
      case "up": return `M${L} ${LO} C${px(0.35)} ${LO - 6} ${px(0.6)} ${HI + 22} ${R} ${HI}`;
      case "down": return `M${L} ${HI} C${px(0.35)} ${HI + 6} ${px(0.6)} ${LO - 22} ${R} ${LO}`;
      case "flat-up": return `M${L} ${LO} H${kx} C${px(k + 0.18)} ${LO - 8} ${px(k + 0.4)} ${HI + 18} ${R} ${HI}`;
      case "flat-down": return `M${L} ${HI} H${kx} C${px(k + 0.18)} ${HI + 8} ${px(k + 0.4)} ${LO - 18} ${R} ${LO}`;
      case "up-flat": return `M${L} ${LO} C${px(k * 0.5)} ${LO - 10} ${px(k * 0.8)} ${HI + 16} ${kx} ${HI} H${R}`;
      // V자 · Λ자 · 하루 동안의 농도 변화처럼 방향이 한 번 바뀌는 곡선(꺾이는 지점 = changeAt).
      case "down-up": return `M${L} ${MID + 24} C${px(k * 0.55)} ${LO} ${px(k * 0.8)} ${LO} ${kx} ${LO} C${px(k + (1 - k) * 0.3)} ${LO} ${px(k + (1 - k) * 0.6)} ${MID + 6} ${R} ${MID - 6}`;
      case "up-down": return `M${L} ${MID - 24} C${px(k * 0.55)} ${HI} ${px(k * 0.8)} ${HI} ${kx} ${HI} C${px(k + (1 - k) * 0.3)} ${HI} ${px(k + (1 - k) * 0.6)} ${MID - 6} ${R} ${MID + 6}`;
      default: return `M${L} ${HI} C${px(k * 0.5)} ${HI + 10} ${px(k * 0.8)} ${LO - 16} ${kx} ${LO} H${R}`;
    }
  };
  const COLORS = [C.co2, C.o2, C.glucose];
  let curves = "";
  o.series.forEach((s, i) => {
    const col = s.color ?? COLORS[i % 3];
    curves += `<path d="${path(s.shape)}" stroke="${col}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`;
  });
  let marks = "";
  for (const m of o.marks ?? []) {
    const x = px(m.frac);
    marks += `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${BASE}" stroke="${C.line}" stroke-width="1.4" stroke-dasharray="4 4"/>
      <circle cx="${x}" cy="${TOP - 12}" r="11" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.5"/>
      <text x="${x}" y="${TOP - 7.6}" text-anchor="middle" font-size="12" font-weight="800" fill="${C.ink}">${m.sym}</text>`;
  }
  let legend = "";
  o.series.forEach((s, i) => {
    const col = s.color ?? COLORS[i % 3];
    const x = 54 + i * 132;
    legend += `<rect x="${x}" y="${BASE + 22}" width="18" height="4" rx="2" fill="${col}"/>
      <text x="${x + 24}" y="${BASE + 30}" font-size="12" font-weight="700" fill="${C.sub}">${s.name}</text>`;
  });
  const yTxt = o.yLabel ?? "기체 농도";
  const xTxt = o.xLabel ?? "시간";
  const aria = `가로축이 ${xTxt}, 세로축이 ${yTxt}인 그래프에 곡선 ${o.series.length}개가 그려져 있다. 눈금 수치는 표시되어 있지 않다${o.marks?.length ? `. ${o.marks.map((m) => m.sym).join("·")} 위치에 세로 점선이 있다` : ""}`;
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="${aria}">
    <path d="M${L} ${TOP} V${BASE} H${R}" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    <path d="M${L} ${TOP} l-4.5 7 M${L} ${TOP} l4.5 7 M${R} ${BASE} l-7 -4.5 M${R} ${BASE} l-7 4.5" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    ${marks}${curves}
    <text x="6" y="${TOP - 8}" font-size="11.5" font-weight="700" fill="${C.sub}">${yTxt}</text>
    <text x="${R}" y="${BASE + 16}" text-anchor="end" font-size="11.5" font-weight="700" fill="${C.sub}">${xTxt}</text>${legend}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// EX · 밀폐 용기 실험 패널 (조건 이름 미인쇄 · 라벨은 (가)(나)(다)뿐)
// ══════════════════════════════════════════════════════════════════════════════
export function sealedPlantFig(o: {
  panels: { plant: "live" | "boiled" | "none"; cover: "none" | "foil" | "dark"; label: string; probe?: boolean }[];
  lime?: boolean;   // 용기 바닥에 석회수 접시를 둔다(뿌옇게 변한 상태는 그리지 않는다 · 결과 인쇄 금지)
}): string {
  const n = o.panels.length;
  const PW = n === 2 ? 156 : 106;
  const GAP = n === 2 ? 20 : 12;
  const startX = (344 - (PW * n + GAP * (n - 1))) / 2;
  let body = "";
  o.panels.forEach((p, i) => {
    const x = startX + i * (PW + GAP);
    const cx = x + PW / 2;
    const jarTop = 34, jarBot = 168;
    const jw = PW - 22;
    const jx = x + 11;
    const dark = p.cover === "dark";
    body += `<rect x="${jx}" y="${jarTop}" width="${jw}" height="${jarBot - jarTop}" rx="10" fill="${dark ? "#3A4356" : "#EAF4FA"}" stroke="${C.sub}" stroke-width="1.8"/>
      <rect x="${jx - 4}" y="${jarTop - 12}" width="${jw + 8}" height="14" rx="5" fill="#B9C2CC" stroke="${C.sub}" stroke-width="1.6"/>`;
    if (p.plant !== "none") {
      const leafCol = p.plant === "live" ? C.leaf : "#9A9A6E";
      const leafHi = p.plant === "live" ? C.leafHi : "#B4B48A";
      body += `<path d="M${cx} 148 V108" stroke="${p.plant === "live" ? C.leafLo : "#7A7A58"}" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M${cx} 116 C${cx - 26} 100 ${cx - 34} 112 ${cx - 30} 122 C${cx - 16} 130 ${cx - 4} 126 ${cx} 116 Z" fill="${leafCol}" stroke="${p.plant === "live" ? C.leafLo : "#7A7A58"}" stroke-width="1.4"/>
        <path d="M${cx} 110 C${cx + 26} 94 ${cx + 34} 106 ${cx + 30} 116 C${cx + 16} 124 ${cx + 4} 120 ${cx} 110 Z" fill="${leafHi}" stroke="${p.plant === "live" ? C.leafLo : "#7A7A58"}" stroke-width="1.4"/>
        <path d="M${cx - 16} 148 h32 l-4 16 h-24 Z" fill="#C0724A" stroke="#8A4E2F" stroke-width="1.4"/>`;
    }
    if (o.lime) body += `<ellipse cx="${cx}" cy="${jarBot - 8}" rx="${jw / 3}" ry="6" fill="#FFFFFF" stroke="${C.line}" stroke-width="1.4"/>`;
    if (p.cover === "foil") {
      body += `<rect x="${jx - 2}" y="${jarTop + 4}" width="${jw + 4}" height="${jarBot - jarTop - 8}" rx="8" fill="#C6CDD6" stroke="#8B95A1" stroke-width="1.6" opacity=".95"/>
        <path d="M${jx + 6} ${jarTop + 24} h${jw - 12} M${jx + 6} ${jarTop + 56} h${jw - 12} M${jx + 6} ${jarTop + 88} h${jw - 12}" stroke="#FFFFFF" stroke-width="1.2" opacity=".65"/>`;
    }
    if (p.probe !== false) {
      body += `<path d="M${cx + jw / 2 - 12} ${jarTop - 6} V54" stroke="${C.sub}" stroke-width="2.2" fill="none"/>
        <rect x="${cx + jw / 2 - 20}" y="54" width="16" height="22" rx="4" fill="#DDE3EA" stroke="${C.sub}" stroke-width="1.4"/>
        <path d="M${cx + jw / 2 - 12} ${jarTop - 6} C${cx + jw / 2 + 4} ${jarTop - 22} ${x + PW - 2} ${jarTop - 20} ${x + PW - 2} ${jarTop - 6}" stroke="${C.sub}" stroke-width="1.6" fill="none"/>`;
    }
    body += `<text x="${cx}" y="190" text-anchor="middle" font-size="13.5" font-weight="800" fill="${C.ink}">${p.label}</text>`;
  });
  // aria는 "무엇이 보이는가"까지만 서술한다(가려짐·식물 상태는 관찰 · 어느 쪽이 대조군인지는 판정이라 제외).
  const seen = o.panels.map((p) => {
    const cov = p.cover === "foil" ? "겉면이 불투명한 것으로 감싸여 있고" : p.cover === "dark" ? "속이 어둡고" : "속이 훤히 들여다보이고";
    const pl = p.plant === "live" ? "안에 푸른 잎의 화분이 있다" : p.plant === "boiled" ? "안에 빛깔이 바랜 화분이 있다" : "안이 비어 있다";
    return `${p.label} 용기는 ${cov} ${pl}`;
  }).join(", ");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="뚜껑을 덮은 용기 ${n}개를 나란히 놓은 실험 그림. ${seen}${o.lime ? ". 각 용기 바닥에는 얕은 접시가 하나씩 놓여 있다" : ""}">${body}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// FC · 요인–광합성량 곡선 (정성 · 축 라벨 생략 = 역추론 문항)
// ══════════════════════════════════════════════════════════════════════════════
export function factorGraphFig(o: {
  kind: "sat" | "peak";
  curves: { label?: string; scale?: number; color?: string }[];
  xLabel?: string; yLabel?: string;
  marks?: { frac: number; sym: string }[];
}): string {
  const L = 54, R = 322, TOP = 28, BASE = 152;
  const px = (f: number): number => L + f * (R - L);
  const COLORS = [C.leafLo, C.sun, C.xylem];
  // sat 다중 곡선은 "같은 상승 경로를 공유하고 각자의 높이에서 먼저 평평해진다"(교과서 표준 도해).
  // scale로 곡선 전체를 비례 축소하면 저광도 구간의 기울기까지 달라져 "빛이 부족할 땐 두 조건이
  // 거의 같다"는 판정 근거가 사라진다(검산 A 적발). 공유 상승 곡선을 샘플링해 각자 plateau로 클램프한다.
  const TOP1 = BASE - (BASE - TOP - 8);
  const bez = (t: number, p0: number, p1: number, p2: number, p3: number): number => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  const sharedSat = (n: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([bez(t, L + 2, px(0.16), px(0.36), px(0.58)), bez(t, BASE - 4, BASE - (BASE - TOP1) * 0.5, TOP1 + 4, TOP1)]);
    }
    return pts;
  };
  let curves = "";
  o.curves.forEach((c, i) => {
    const s = c.scale ?? 1;
    const top = BASE - (BASE - TOP - 8) * s;
    const col = c.color ?? COLORS[i % 3];
    let d;
    if (o.kind === "sat") {
      const pts = sharedSat(48).map(([x, y]) => [x, Math.max(top, y)] as [number, number]);
      d = `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")} L${R} ${top.toFixed(1)}`;
    } else {
      d = `M${L + 2} ${BASE - 4} C${px(0.2)} ${BASE - (BASE - top) * 0.55} ${px(0.34)} ${top} ${px(0.48)} ${top} C${px(0.66)} ${top} ${px(0.76)} ${BASE - (BASE - top) * 0.45} ${R} ${BASE - 6}`;
    }
    curves += `<path d="${d}" stroke="${col}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    // 라벨 자리: sat는 곡선이 오른쪽에서 평평해지므로 오른쪽 끝 위에 건다.
    // peak는 오른쪽에서 곡선들이 한데 모여 내려오므로 거기에 걸면 라벨이 곡선에 겹친다
    // (봉우리 2곡선 데뷔 슬롯 281에서 실제로 겹쳤다 · 갤러리 눈검수 자가 적발).
    // → 각 곡선의 **자기 봉우리 바로 위**에 건다. scale이 다르면 높이가 갈리므로 라벨끼리도 안 겹친다.
    if (c.label) {
      curves += o.kind === "sat"
        ? `<text x="${R - 4}" y="${top - 6}" text-anchor="end" font-size="11.5" font-weight="700" fill="${col}">${c.label}</text>`
        : `<text x="${px(0.57)}" y="${top - 7}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${col}">${c.label}</text>`;
    }
  });
  let marks = "";
  for (const m of o.marks ?? []) {
    const x = px(m.frac);
    marks += `<line x1="${x}" y1="${TOP}" x2="${x}" y2="${BASE}" stroke="${C.line}" stroke-width="1.3" stroke-dasharray="4 4"/>
      <circle cx="${x}" cy="${BASE + 18}" r="11" fill="#FFFFFF" stroke="${C.sub}" stroke-width="1.5"/>
      <text x="${x}" y="${BASE + 22.6}" text-anchor="middle" font-size="12" font-weight="800" fill="${C.ink}">${m.sym}</text>`;
  }
  const yTxt = o.yLabel ?? "광합성량";
  const xTxt = o.xLabel ?? "?";
  const aria = `가로축이 ${o.xLabel ?? "이름이 적혀 있지 않은 조건"}, 세로축이 ${yTxt}인 그래프에 곡선 ${o.curves.length}개가 그려져 있다. 눈금 수치는 표시되어 있지 않다`;
  return `<svg viewBox="0 0 344 202" ${NS} fill="none" role="img" aria-label="${aria}">
    <path d="M${L} ${TOP} V${BASE} H${R}" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    <path d="M${L} ${TOP} l-4.5 7 M${L} ${TOP} l4.5 7 M${R} ${BASE} l-7 -4.5 M${R} ${BASE} l-7 4.5" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    ${marks}${curves}
    <text x="6" y="${TOP - 8}" font-size="11.5" font-weight="700" fill="${C.sub}">${yTxt}</text>
    <text x="${R}" y="${BASE + (o.marks?.length ? 46 : 18)}" text-anchor="end" font-size="11.5" font-weight="700" fill="${C.sub}">${xTxt}</text></svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// DN · 낮/밤 겉보기 기체 출입 2패널 (기체 이름 칩 인쇄 · 결론 캡션 없음)
// 구 dayNightFlowFig은 범례 없이 색으로만 기체를 구분했고 캡션이 결론을 인쇄했다.
// ══════════════════════════════════════════════════════════════════════════════
type DnGas = "co2" | "o2" | null;
const DN_NAME: Record<"co2" | "o2", string> = { co2: "이산화 탄소", o2: "산소" };
/** 패널을 세로로 쌓는다 · 좌우 배치로는 기체 이름 칩 두 개(각 88px)가 폭 344 안에서 겹친다
 *  (첫 렌더에서 실제로 겹쳤다). 세로 쌓기면 칸마다 칩이 좌우로 넉넉히 떨어진다. */
export function dayNightGasFig(o: {
  panels: { light: "bright" | "dim" | "none"; inGas: DnGas; outGas: DnGas; label: string; inSym?: string; outSym?: string }[];
}): string {
  const PX = 8, PW = 328, PH = 142, GAP = 12;
  const mCo2 = uid(), mO2 = uid(), mMask = uid();
  let body = "";
  o.panels.forEach((p, i) => {
    const y = 10 + i * (PH + GAP);
    const cx = PX + 150;
    const night = p.light === "none";
    body += `<rect x="${PX}" y="${y}" width="${PW}" height="${PH}" rx="14" fill="${night ? C.night : "#F3FAF2"}" stroke="${night ? "#0F1A31" : C.leafLo}" stroke-width="1.6"/>`;
    body += night
      ? `<circle cx="${PX + 296}" cy="${y + 30}" r="13" fill="#F3EFC0"/><circle cx="${PX + 301}" cy="${y + 27}" r="11" fill="${C.night}"/>`
      : `<circle cx="${PX + 296}" cy="${y + 30}" r="${p.light === "bright" ? 14 : 10}" fill="${p.light === "bright" ? C.sun : "#E6D6A8"}"/>${p.light === "bright"
        ? `<path d="M${PX + 296} ${y + 8} v-6 M${PX + 296} ${y + 52} v6 M${PX + 274} ${y + 30} h-6 M${PX + 318} ${y + 30} h6" stroke="${C.sun}" stroke-width="2.4" stroke-linecap="round"/>`
        : `<ellipse cx="${PX + 282}" cy="${y + 34}" rx="20" ry="9" fill="#DDE3EA"/>`}`;
    // 식물
    body += `<path d="M${cx} ${y + 118} V${y + 74}" stroke="${night ? "#2C5B3C" : C.leafLo}" stroke-width="5" stroke-linecap="round"/>
      <path d="M${cx} ${y + 86} C${cx - 30} ${y + 68} ${cx - 40} ${y + 82} ${cx - 34} ${y + 94} C${cx - 18} ${y + 104} ${cx - 5} ${y + 98} ${cx} ${y + 86} Z" fill="${night ? "#2F7A4B" : C.leaf}" stroke="${night ? "#1B4A2C" : C.leafLo}" stroke-width="1.4"/>
      <path d="M${cx} ${y + 78} C${cx + 30} ${y + 60} ${cx + 40} ${y + 74} ${cx + 34} ${y + 86} C${cx + 18} ${y + 96} ${cx + 5} ${y + 90} ${cx} ${y + 78} Z" fill="${night ? "#3B8F58" : C.leafHi}" stroke="${night ? "#1B4A2C" : C.leafLo}" stroke-width="1.4"/>
      <path d="M${cx - 18} ${y + 118} h36 l-5 16 h-26 Z" fill="#C0724A" stroke="#8A4E2F" stroke-width="1.4"/>`;
    // inSym·outSym이 오면 기체 이름 대신 기호를 점선 칩으로 인쇄한다(기체 동정 문항 · 정답 인쇄 차단).
    if (p.inGas) {
      const hid = !!p.inSym;
      const col = hid ? C.blue : p.inGas === "co2" ? C.co2 : C.o2;
      body += `<path d="M${PX + 18} ${y + 92} H${cx - 40}" stroke="${col}" stroke-width="3.6" marker-end="url(#${hid ? mMask : p.inGas === "co2" ? mCo2 : mO2})" fill="none"/>`;
      body += g5chip(PX + 12, y + 52, 92, p.inSym ?? DN_NAME[p.inGas], col, hid);
    }
    if (p.outGas) {
      const hid = !!p.outSym;
      const col = hid ? C.blue : p.outGas === "co2" ? C.co2 : C.o2;
      body += `<path d="M${cx + 40} ${y + 92} H${PX + 236}" stroke="${col}" stroke-width="3.6" marker-end="url(#${hid ? mMask : p.outGas === "co2" ? mCo2 : mO2})" fill="none"/>`;
      body += g5chip(PX + 156, y + 52, 92, p.outSym ?? DN_NAME[p.outGas], col, hid);
    }
    body += `<text x="${PX + 22}" y="${y + 26}" font-size="14" font-weight="800" fill="${night ? "#FFFFFF" : C.ink}">${p.label}</text>`;
  });
  const desc = o.panels.map((p) => `${p.label} 칸은 ${p.light === "none" ? "빛이 없고" : p.light === "bright" ? "해가 밝게 떠 있고" : "빛이 약하고"} 왼쪽과 오른쪽에 이름표가 붙은 화살표가 하나씩 있다${p.inSym || p.outSym ? `. 이름표 가운데 ${[p.inSym, p.outSym].filter(Boolean).join("·")}는 기호로 가려져 있다` : ""}`).join(", ");
  const H = 10 + o.panels.length * (PH + GAP);
  return `<svg viewBox="0 0 344 ${H}" ${NS} fill="none" role="img" aria-label="같은 식물을 서로 다른 빛 조건에서 그린 ${o.panels.length}개 칸. ${desc}"><defs>${arrowDefs(mCo2, C.co2, 14)}${arrowDefs(mO2, C.o2, 14)}${arrowDefs(mMask, C.blue, 14)}</defs>${body}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// GB · 광합성량 / 호흡량 막대 쌍 (값 라벨 미인쇄 · 높이 판독이 과제)
// ══════════════════════════════════════════════════════════════════════════════
export function rateBarsFig(o: { groups: { label: string; photo: number; resp: number }[]; yLabel?: string }): string {
  const BASE = 156, TOP = 34;
  const maxV = Math.max(...o.groups.flatMap((g) => [g.photo, g.resp]), 1);
  const h = (v: number): number => (v / maxV) * (BASE - TOP - 6);
  const BW = 22, INNER = 7;
  const gw = BW * 2 + INNER;
  const span = 322 - 58;
  const step = span / o.groups.length;
  let body = "";
  o.groups.forEach((g, i) => {
    const gx = 58 + step * i + (step - gw) / 2;
    // 값이 0인 막대는 아무것도 안 그리면 "빠뜨린 것"으로 읽힌다 → 점선 빈 자리로 표시한다.
    const bar = (bx: number, v: number, fill: string, stroke: string): string =>
      v > 0
        ? `<rect x="${bx}" y="${BASE - h(v)}" width="${BW}" height="${h(v)}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`
        : `<rect x="${bx}" y="${BASE - 9}" width="${BW}" height="9" rx="3" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-dasharray="4 3"/>`;
    body += bar(gx, g.photo, C.leaf, C.leafLo);
    body += bar(gx + BW + INNER, g.resp, "#C86AA0", "#8E3E6C");
    body += `<text x="${gx + gw / 2}" y="${BASE + 18}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${C.ink}">${g.label}</text>`;
  });
  const legend = `<rect x="58" y="${BASE + 30}" width="14" height="10" rx="2" fill="${C.leaf}" stroke="${C.leafLo}" stroke-width="1.1"/>
    <text x="78" y="${BASE + 39}" font-size="12" font-weight="700" fill="${C.sub}">광합성량</text>
    <rect x="176" y="${BASE + 30}" width="14" height="10" rx="2" fill="#C86AA0" stroke="#8E3E6C" stroke-width="1.1"/>
    <text x="196" y="${BASE + 39}" font-size="12" font-weight="700" fill="${C.sub}">호흡량</text>`;
  // 세로축 이름을 x 46 오른끝맞춤으로만 두면 축 왼쪽 38px를 넘는 긴 이름이 화면 밖으로 잘린다
  // (318 "하루 동안의 양"이 "동안의 양"으로 보였다). 폭을 재서 넘치면 축 위 왼끝맞춤으로 돌린다.
  const yl = o.yLabel ?? "양";
  const ylw = [...yl].reduce((a, c) => a + (c === " " ? 3.4 : 11.5), 0);
  const ylTag =
    ylw > 38
      ? `<text x="8" y="20" font-size="11.5" font-weight="700" fill="${C.sub}">${yl}</text>`
      : `<text x="46" y="${TOP - 2}" text-anchor="end" font-size="11.5" font-weight="700" fill="${C.sub}">${yl}</text>`;
  return `<svg viewBox="0 0 344 206" ${NS} fill="none" role="img" aria-label="${o.groups.map((g) => g.label).join("·")}에서 잰 두 가지 양을 막대 두 개씩 짝지어 나타낸 그래프. 막대에 값은 적혀 있지 않다">
    <path d="M54 ${TOP - 4} V${BASE} H326" stroke="${C.sub}" stroke-width="1.8" fill="none"/>
    ${ylTag}
    ${body}${legend}</svg>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// TR · 물관·체관 이동 경로도 (물관은 반드시 뿌리 끝에서 시작 · 라벨은 지시선 배지)
// 구 transportFig은 물관 화살표가 줄기 중간에서 시작했고 라벨 (나)가 줄기에 겹쳐 뭉갰다.
// ══════════════════════════════════════════════════════════════════════════════
type TrRoute = "xylem" | "phloem-up" | "phloem-down" | "phloem-fruit";
/** 발주 일러스트(plant-vessels.webp) 위에 이동 화살표와 기호 배지만 얹는다.
 *  격자 실측(qa/shot-g2u5fig-grid.mjs): 줄기는 x 49.5%의 곧은 수직선 · 흙 선 y 71% ·
 *  뿌리 71~95% · 왼쪽 잎 y 27~44% · 오른쪽 잎 y 20~40% · 어린 순 y 5~17% · 열매 (62.5%, 45%).
 *  그림은 3:4이므로 x% x 3.44, y% x 4.59. 화살표는 줄기를 가리지 않도록 양옆으로 나란히 둔다
 *  (물관 x 46% · 체관 x 53%). 뷰박스는 420이라 아래 흙 일부가 잘린다. */
export function transportRouteFig(o: {
  routes: TrRoute[];
  syms?: { route: TrRoute; sym: string }[];
  reverse?: TrRoute[];
}): string {
  const IW = 344, IH = 459, VH = 420;
  const px = (f: number): number => Math.round(f * IW / 100) / 100;   // f = 만분율(2350 = 23.50%)
  const py = (f: number): number => Math.round(f * IH / 100) / 100;   // f = 만분율(7150 = 71.50%)
  const mX = uid(), mP = uid();
  const rev = new Set(o.reverse ?? []);
  const XV = px(4600), PH = px(5300);
  const art = `<image href="${g5fig("plant-vessels.webp")}" x="0" y="0" width="${IW}" height="${IH}" preserveAspectRatio="xMidYMid meet"/>`;
  const P: Record<TrRoute, { d: string; rd: string; col: string; m: string; bx: number; by: number; tx: number; ty: number }> = {
    xylem: {
      d: `M${XV} ${py(8600)} V${py(2700)}`, rd: `M${XV} ${py(2700)} V${py(8600)}`,
      col: C.xylem, m: mX, bx: 44, by: 250, tx: XV - 1, ty: 252,
    },
    "phloem-up": {
      d: `M${PH} ${py(3300)} V${py(1200)}`, rd: `M${PH} ${py(1200)} V${py(3300)}`,
      col: C.phloem, m: mP, bx: 300, by: 62, tx: PH + 2, ty: 68,
    },
    "phloem-down": {
      d: `M${PH} ${py(3800)} V${py(8400)}`, rd: `M${PH} ${py(8400)} V${py(3800)}`,
      col: C.phloem, m: mP, bx: 300, by: 292, tx: PH + 2, ty: 294,
    },
    // 열매 갈래 · 확대 격자 실측(qa/shot-g2u5fig-zoom.mjs plant-vessels.webp 42 34 76 54):
    // 열매 가지는 줄기의 마디 (50.5%, 42.3%)에서 갈라져 **위로 올라가** 열매 꼭지(x 57~68%, y 38~43%)에
    // 닿는다. 2차 수리본은 (53%, 35.3%) 허공에서 시작해 아래로 내려가 방향이 반대였다(사용자 3차 지적).
    // 이제 마디 오른쪽 끝(51.2%, 42.4%)에서 출발해 가지 곡선을 따라 오르며 체관 줄기와 교차한다.
    "phloem-fruit": {
      d: `M${px(5120)} ${py(4240)} C${px(5400)} ${py(4060)} ${px(5620)} ${py(3940)} ${px(6020)} ${py(3950)}`,
      rd: `M${px(6020)} ${py(3950)} C${px(5620)} ${py(3940)} ${px(5400)} ${py(4060)} ${px(5120)} ${py(4240)}`,
      col: C.phloem, m: mP, bx: 300, by: 258, tx: px(6020), ty: py(3950),
    },
  };
  let arrows = "";
  for (const r of o.routes) {
    const p = P[r];
    arrows += `<path d="${rev.has(r) ? p.rd : p.d}" stroke="${p.col}" stroke-width="3.8" marker-end="url(#${p.m})" fill="none" stroke-linecap="round"/>`;
  }
  let badges = "";
  for (const sm of o.syms ?? []) {
    const p = P[sm.route];
    badges += g5badge(p.bx, p.by, p.tx, p.ty, sm.sym, p.col);
  }
  const syms = (o.syms ?? []).map((sm) => sm.sym).join("·");
  return `<svg viewBox="0 0 ${IW} ${VH}" ${NS} fill="none" role="img" aria-label="흙에 뿌리를 내린 식물 한 그루를 옆에서 그린 그림. 곧은 줄기에 잎 두 장과 붉은 열매 하나가 달려 있고, 줄기 양옆에 이동 방향을 나타낸 화살표가 그려져 있다${syms ? `. ${syms} 기호가 각각 한 화살표를 가리킨다` : ""}"><defs>${arrowDefs(mX, C.xylem, 14)}${arrowDefs(mP, C.phloem, 14)}</defs>${art}${arrows}${badges}</svg>`;
}
/* ============== g2u5 v2 end ============== */
