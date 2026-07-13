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

/** 프레파라트를 움직이는 방향만 제시하는 그림 — 시야 속 상의 이동 방향은 숨긴다. */
export function bioSlideMoveFig(dir: "left" | "right" | "up" | "down"): string {
  const d = { left: [-34, 0], right: [58, 0], up: [0, -28], down: [0, 28] }[dir];
  const [dx, dy] = d;
  const x2 = 172 + dx, y2 = 126 + dy;
  const angle = Math.atan2(dy, dx), ah = 10;
  const p1 = `${x2},${y2}`;
  const p2 = `${x2 - ah * Math.cos(angle - .55)},${y2 - ah * Math.sin(angle - .55)}`;
  const p3 = `${x2 - ah * Math.cos(angle + .55)},${y2 - ah * Math.sin(angle + .55)}`;
  return `<svg viewBox="0 0 344 190" ${NS} fill="none" role="img" aria-label="현미경 재물대 위 프레파라트를 화살표 방향으로 움직이는 그림">
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

/** 같은 표본을 서로 다른 배율로 본 두 시야 — 수·크기 비교용. */
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
  return `<svg viewBox="0 0 344 184" ${NS} fill="none" role="img" aria-label="같은 표본을 서로 다른 배율로 관찰한 두 원형 시야">
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
    ["E", "×", "○", "×", "흡수"],
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
  dots?: [number, number][];
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
      ([v, m]) => `<circle cx="${gx(v)}" cy="${gy(m)}" r="4.5" fill="#E64980"/>
      <line x1="${gx(v)}" y1="${gy(m)}" x2="${gx(v)}" y2="186" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>
      <line x1="52" y1="${gy(m)}" x2="${gx(v)}" y2="${gy(m)}" stroke="#B9C2CE" stroke-width="1.2" stroke-dasharray="3 4"/>`,
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

/** 세계 지진 발생 지점 점 지도 — 판 경계 띠를 따라 몰린 분포(라이트).
 *  aria는 중립("점으로 나타냈다")로 — 띠 모양 여부가 문항 정답이다. */
export function geoQuakeBeltFig(): string {
  // 간이 대륙 실루엣(비율 왜곡한 교육용 지도) — 정밀 지도가 아니라 분포 파악용
  const land = `fill="#E7DFC8" stroke="#C9BFA0" stroke-width="1"`;
  // 환태평양 + 알프스-히말라야 + 대서양 중앙 해령 띠의 점들
  const belts: [number, number][] = [
    // 남북 아메리카 서해안(환태평양 동쪽)
    [64, 54], [60, 66], [58, 78], [62, 90], [68, 102], [74, 114], [80, 128], [86, 142], [90, 156], [94, 170],
    // 알류샨~일본~필리핀~뉴질랜드(환태평양 서쪽)
    [116, 44], [136, 40], [158, 44], [176, 52], [186, 64], [192, 78], [198, 92], [206, 106], [214, 122], [222, 138], [230, 154], [238, 168],
    // 알프스-히말라야 벨트
    [128, 78], [142, 82], [156, 86], [170, 88], [184, 92],
    // 대서양 중앙 해령
    [96, 60], [100, 76], [104, 92], [102, 110], [106, 128], [110, 146],
  ];
  const dots = belts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.3" fill="#F04452"/>`).join("");
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="세계 지도 위에 지진이 발생한 지점들이 점으로 찍혀 있어요. 점들이 어떻게 분포하는지 살펴보세요">
    <rect x="8" y="8" width="328" height="184" rx="10" fill="#DDF0FB" stroke="#B8D6EC" stroke-width="1.4"/>
    <!-- 북아메리카 -->
    <path d="M42 36 q30 -10 52 4 q10 8 4 20 q-14 6 -12 18 q-2 14 -14 18 q-16 2 -22 -10 q-12 -22 -8 -50z" ${land}/>
    <!-- 남아메리카 -->
    <path d="M78 106 q16 -6 24 6 q6 14 0 30 q-4 20 -14 30 q-10 4 -14 -8 q-6 -30 4 -58z" ${land}/>
    <!-- 유라시아 -->
    <path d="M120 34 q46 -14 96 -2 q26 6 30 22 q2 14 -14 20 q-24 8 -48 6 q-30 -2 -52 -12 q-16 -10 -12 -34z" ${land}/>
    <!-- 아프리카 -->
    <path d="M124 92 q20 -8 34 2 q10 12 6 30 q-6 20 -20 26 q-14 2 -18 -12 q-8 -24 -2 -46z" ${land}/>
    <!-- 오스트레일리아 -->
    <path d="M226 134 q18 -8 32 2 q8 10 2 20 q-12 10 -26 6 q-12 -6 -8 -28z" ${land}/>
    ${dots}
  </svg>`;
}

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
  return `<svg viewBox="0 0 344 200" ${NS} fill="none" role="img" aria-label="두 판 사이가 벌어진 거리를 시간에 따라 나타낸 그래프예요. 가로축은 시간, 세로축은 벌어진 거리이고 원점을 지나는 직선이 그려져 있어요">
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

/** 남아메리카-아프리카 해안선 맞물림 + 같은 화석 발견 띠 — 대륙 이동 증거 문항용.
 *  두 대륙을 살짝 벌려 두고 화석 띠가 이어짐을 점선으로 표시. */
export function geoCoastFitFig(): string {
  return `<svg viewBox="0 0 344 210" ${NS} fill="none" role="img" aria-label="바다를 사이에 둔 두 대륙이 그려져 있어요. 왼쪽 대륙의 오른쪽 해안과 오른쪽 대륙의 왼쪽 해안 모양이 서로 닮았고, 양쪽 해안의 같은 무늬 구역이 점선으로 이어져 있어요">
    <rect x="8" y="8" width="328" height="194" rx="10" fill="#DDF0FB" stroke="#B8D6EC" stroke-width="1.4"/>
    <!-- 왼쪽: 남아메리카풍 -->
    <path d="M52 40 q28 -10 46 2 q14 10 10 26 q-4 12 4 22 q8 12 2 26 q-8 22 -24 34 q-14 8 -22 -4 q-10 -18 -8 -40 q2 -20 -4 -34 q-6 -18 -4 -32z" fill="#C9A26A" stroke="#8E6A34" stroke-width="1.6"/>
    <!-- 오른쪽: 아프리카풍(서해안 굴곡이 왼쪽과 상보) -->
    <path d="M206 44 q30 -14 58 -2 q18 8 16 28 q-2 18 -10 32 q-10 18 -26 26 q-16 6 -26 -6 q-8 -12 -2 -26 q6 -12 -2 -22 q-10 -14 -8 -30z" fill="#DDB868" stroke="#8E6A24" stroke-width="1.6"/>
    <!-- 같은 화석 발견 구역(양 대륙 해안의 마주 보는 띠) -->
    <path d="M96 96 q8 8 6 20 q-2 10 -8 16" stroke="#D6336C" stroke-width="7" opacity=".45" stroke-linecap="round"/>
    <path d="M212 92 q-8 8 -6 20 q2 10 8 16" stroke="#D6336C" stroke-width="7" opacity=".45" stroke-linecap="round"/>
    <path d="M104 112 h100" stroke="#D6336C" stroke-width="1.8" stroke-dasharray="5 4"/>
    <circle cx="100" cy="112" r="3" fill="#D6336C"/>
    <circle cx="208" cy="112" r="3" fill="#D6336C"/>
    <!-- 바다 물결 -->
    <path d="M140 60 q8 4 16 0 M150 160 q8 4 16 0 M136 132 q7 4 14 0" stroke="#8FBBF2" stroke-width="1.6"/>
    <text x="70" y="182" text-anchor="middle" font-size="11.5" font-weight="800" fill="#8E6A34">(가)</text>
    <text x="252" y="182" text-anchor="middle" font-size="11.5" font-weight="800" fill="#8E6A24">(나)</text>
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

/** 물 전기 분해 장치 — (가) 시험관은 전원 (−)극 쪽, (나)는 (+)극 쪽. 모인 기체는 (가)가 더 많다.
 *  aria는 장치·연결만 말하고 기체의 정체와 부피 비율 수치는 말하지 않는다(해석이 과제). */
export function atomElectrolysisFig(): string {
  const tube = (x: number, gasH: number, label: string): string => `
    <rect x="${x}" y="36" width="44" height="134" rx="10" fill="#EAF3FC" stroke="#8B99AC" stroke-width="2"/>
    <rect x="${x + 3}" y="40" width="38" height="${gasH}" rx="7" fill="#FDFEFF"/>
    <rect x="${x + 3}" y="${40 + gasH}" width="38" height="${126 - gasH}" fill="#C9DFF6"/>
    <text x="${x + 22}" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#4E5968">${label}</text>
    ${[0, 1, 2, 3].map((i) => `<circle cx="${x + 12 + (i % 2) * 20}" cy="${152 - i * 9}" r="${1.6 + (i % 2) * 0.6}" fill="#AACCEE"/>`).join("")}`;
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="물 전기 분해 장치 — 물이 든 용기에 전극 두 개가 있고 그 위에 시험관 (가)와 (나)가 거꾸로 세워져 있어요. (가)는 전원의 (−)극과, (나)는 (+)극과 연결되어 있어요. 두 시험관에 모인 기체의 양을 비교해 보세요">
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

/** 마찰 전/후 두 물체 (가)(나)의 전하 분포(파라미터형) — moved = (가)→(나)로 이동한 전자 수.
 *  전하 보존: (+)는 양쪽 3개 불변, (−)만 이동(마찰 전 각 3개). 위 줄이 마찰 전, 아래 줄이 마찰 후. */
export function elecRubExamFig(o: { moved: number }): string {
  const rod = (x: number, y: number): string =>
    `<rect x="${x - 62}" y="${y - 15}" width="124" height="30" rx="14" fill="#C8DCEC" stroke="#7A94AC" stroke-width="1.8"/>
     <path d="M${x - 48} ${y - 8}h34" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  const cloth = (x: number, y: number): string =>
    `<path d="M${x - 60} ${y - 17}q14 -8 30 0t30 0t30 0v30q-14 8 -30 0t-30 0t-30 0z" fill="#E8C9A0" stroke="#A87A44" stroke-width="1.8"/>
     ${[0, 1, 2].map((i) => `<path d="M${x - 34 + i * 30} ${y - 10}v22" stroke="#C79A66" stroke-width="1.2"/>`).join("")}`;
  const charges = (x: number, y: number, p: number, m: number): string => {
    const both = [...Array.from({ length: p }, () => "p"), ...Array.from({ length: m }, () => "m")];
    return both
      .map((k, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const cx = x - 39 + col * 26;
        const cy = y - 6 + row * 15;
        return k === "p" ? eplus(cx, cy, 5.8) : eminus(cx, cy, 5.8);
      })
      .join("");
  };
  const P = 3;
  const M0 = 3;
  return `<svg viewBox="0 0 344 236" ${NS} fill="none" role="img" aria-label="서로 다른 두 물체 (가)와 (나)를 마찰하기 전과 후의 전하 분포 모형 — 알갱이의 종류와 개수를 비교해 읽어요">
    <text x="30" y="42" font-size="12" font-weight="800" fill="#4E5968">마찰 전</text>
    ${rod(120, 66)}${charges(120, 66, P, M0)}
    ${cloth(258, 66)}${charges(258, 66, P, M0)}
    <text x="120" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(가)</text>
    <text x="258" y="26" text-anchor="middle" font-size="12.5" font-weight="800" fill="#4E5968">(나)</text>
    <path d="M172 106v18M167 118l5 7 5-7" stroke="#8B95A1" stroke-width="2" fill="none"/>
    <text x="30" y="170" font-size="12" font-weight="800" fill="#4E5968">마찰 후</text>
    ${rod(120, 192)}${charges(120, 192, P, M0 - o.moved)}
    ${cloth(258, 192)}${charges(258, 192, P, M0 + o.moved)}
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
        `${xstar(s.x, 102, 6 - i * 0.8, "#EDE2BE")}
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

/** 색(가로 7단) × 겉보기 등급(세로) 산점도(다크) — 별 점은 그 색으로 칠한다.
 *  mag: 1(위, 밝음)~5(아래, 어둠). col: 0(청)~6(적). */
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
    .map(
      (p) => `${xstar(gx(p.col), gy(p.mag), 6, HEX[p.col])}
      <text x="${gx(p.col) + 15}" y="${gy(p.mag) - 8}" font-size="12" font-weight="800" fill="#DCE8FF">${p.label}</text>`,
    )
    .join("");
  return `<svg viewBox="0 0 344 196" ${NS} fill="none" role="img" aria-label="가로축은 별의 색(청색에서 적색까지 일곱 단계), 세로축은 겉보기 등급인 그래프에 여러 별의 위치가 점으로 표시된 그림">
    ${axis}
    <line x1="46" y1="18" x2="46" y2="168" stroke="#3D5378" stroke-width="1.6"/>
    <line x1="46" y1="168" x2="330" y2="168" stroke="#3D5378" stroke-width="1.6"/>
    <text x="14" y="14" font-size="10" fill="#7E93B8">겉보기 등급</text>
    <text x="330" y="196" text-anchor="end" font-size="10" fill="#7E93B8">← 표면 온도 높음 · 낮음 →</text>
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
    <text x="316" y="96" font-size="13" font-weight="800" fill="#7ED6FF">㉮</text>
    <line x1="312" y1="93" x2="268" y2="93" stroke="#3D5378" stroke-width="1.1"/>
    <text x="316" y="34" font-size="13" font-weight="800" fill="#FFC45A">㉯</text>
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
