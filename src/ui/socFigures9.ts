// socFigures9 — 사회 Ⅸ(민주주의와 시민) 그림 모듈. socFigures8 문법 계승 —
// 개념 도해(벡터)+스틱맨 장면, 파운드리 문법 준수, 스틱맨만 손그림 라인.
//   · 퀴즈 그림 라벨은 (가)(나)식 중립 라벨만 — 정답 유출 금지(aria에도 개념 이름 대신 묘사만).
//   · 민감 가드: 무성별 스틱맨, 현실 정당·정치인·국기 0, 무기·전투 0. 투표율 그래프는
//     가상의 "스틱 나라" 수치(시사 통계 비노출 — 하락 추세라는 원리만 전달).
//   · 헌법 제1조 인용은 대한민국헌법 원문(법령 사실)이라 허용.
const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

function shell(vw: number, vh: number, inner: string, aria: string, defs = ""): string {
  return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${aria}">
    <defs>
      <linearGradient id="s9-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#EEF2F8"/></linearGradient>
      ${defs}
    </defs>
    <rect x="2" y="2" width="${vw - 4}" height="${vh - 4}" rx="14" fill="url(#s9-paper)" stroke="#D3DCE8" stroke-width="1.6"/>
    ${inner}
  </svg>`;
}

/** (가)(나) 라벨 필 */
function pill(x: number, y: number, label: string): string {
  return `<rect x="${x - 17}" y="${y - 11}" width="34" height="19" rx="9.5" fill="#39455C"/>
    <text x="${x}" y="${y + 3}" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">${label}</text>`;
}

/** 미니 스틱맨(정면·팔 포즈 옵션) */
function tinyMan(x: number, y: number, opts: { arm?: "up" | "down" | "out"; mood?: "ok" | "sad" | "joy"; r?: number } = {}): string {
  const r = opts.r ?? 6;
  const arm = opts.arm ?? "out";
  const arms =
    arm === "up"
      ? `M${x} ${y + r + 4}l-${r + 2} -6M${x} ${y + r + 4}l${r + 2} -8`
      : arm === "down"
        ? `M${x} ${y + r + 4}l-${r + 1} ${r}M${x} ${y + r + 4}l${r + 1} ${r}`
        : `M${x} ${y + r + 4}l-${r + 2} 4M${x} ${y + r + 4}l${r + 2} 4`;
  const mood = opts.mood ?? "ok";
  const face =
    mood === "sad"
      ? `<circle cx="${x - 2}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 1.8} ${y + 3.4}q1.8-1.5 3.6 0" stroke="#3C4654" stroke-width="1.1" fill="none"/>`
      : mood === "joy"
        ? `<path d="M${x - 3} ${y - 1}q1.2-1.4 2.4 0M${x + 0.6} ${y - 1}q1.2-1.4 2.4 0" stroke="#3C4654" stroke-width="1.1" fill="none"/><path d="M${x - 2} ${y + 2.6}q2 1.8 4 0" stroke="#3C4654" stroke-width="1.2" fill="none"/>`
        : `<circle cx="${x - 2}" cy="${y - 1}" r="1" fill="#3C4654"/><circle cx="${x + 2}" cy="${y - 1}" r="1" fill="#3C4654"/><path d="M${x - 1.6} ${y + 2.8}q1.6 1.2 3.2 0" stroke="#3C4654" stroke-width="1.1" fill="none"/>`;
  return `<g ${STICK}><circle cx="${x}" cy="${y}" r="${r}" fill="#F6EFE4"/>
    <path d="M${x} ${y + r}v${r + 6}M${x} ${y + r * 2 + 6}l-${r - 1} ${r + 3}M${x} ${y + r * 2 + 6}l${r - 1} ${r + 3}${arms}"/></g>${face}`;
}

/* ---------- L1: 정치의 두 얼굴 — (가) 학급 회의 vs (나) 국회 ---------- */
export function polMeanFig(): string {
  const inner = `
    <line x1="150" y1="14" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 26, "(가)")}
    ${pill(224, 26, "(나)")}
    <!-- (가) 학급 회의: 칠판 + 손 든 학생들 -->
    <rect x="34" y="44" width="84" height="30" rx="4" fill="#3E5A48" stroke="#2A4034" stroke-width="1.6"/>
    <path d="M44 54h32M44 62h24" stroke="#DDEBB8" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>
    ${tinyMan(52, 98, { arm: "up", mood: "joy" })}
    ${tinyMan(78, 102, { arm: "up" })}
    ${tinyMan(104, 98, { arm: "out" })}
    <text x="76" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">교실의 회의, 함께 정해요</text>
    <!-- (나) 국회 의사당: 돔 + 단상 -->
    <path d="M188 74a36 22 0 0 1 72 0z" fill="#DCE8F2" stroke="#7E9EC2" stroke-width="1.8"/>
    <circle cx="224" cy="49" r="4" fill="#7E9EC2"/>
    <rect x="182" y="74" width="84" height="34" rx="3" fill="#EDF3FA" stroke="#7E9EC2" stroke-width="1.6"/>
    ${[196, 212, 228, 244].map((x) => `<rect x="${x - 3.4}" y="80" width="6.8" height="22" rx="2.2" fill="#FFFFFF" stroke="#9EB4CE" stroke-width="1.2"/>`).join("")}
    <rect x="196" y="114" width="56" height="10" rx="3" fill="#D8E4F0" stroke="#9EB4CE" stroke-width="1.2"/>
    <text x="224" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">법을 만드는 곳, 나라의 활동</text>`;
  return shell(300, 158, inner, "두 장면 비교, 왼쪽은 칠판 앞에서 손을 들고 회의하는 교실, 오른쪽은 돔 지붕의 큰 건물");
}

/* ---------- L2: 두 마을의 결정 — (가) 일방 통보 vs (나) 토론 합의 ---------- */
export function decideFig(): string {
  const inner = `
    <line x1="150" y1="14" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 26, "(가)")}
    ${pill(224, 26, "(나)")}
    <!-- (가) 일방 통보: 높은 단상 + 두루마리 -->
    <rect x="56" y="48" width="40" height="14" rx="3" fill="#E2D2A8" stroke="#8A7648" stroke-width="1.4"/>
    ${tinyMan(76, 36, { arm: "down", r: 5.4 })}
    <g transform="rotate(-14 60 74)"><rect x="52" y="69" width="16" height="10" rx="2" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="1.2"/><path d="M56 72.6h8M56 75.4h5" stroke="#B99B66" stroke-width="1"/></g>
    <g transform="rotate(10 94 76)"><rect x="86" y="71" width="16" height="10" rx="2" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="1.2"/><path d="M90 74.6h8M90 77.4h5" stroke="#B99B66" stroke-width="1"/></g>
    ${tinyMan(48, 106, { arm: "down", mood: "sad", r: 5.4 })}
    ${tinyMan(76, 110, { arm: "down", mood: "sad", r: 5.4 })}
    ${tinyMan(104, 106, { arm: "down", mood: "sad", r: 5.4 })}
    <text x="76" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">위에서 아래로, 통보</text>
    <!-- (나) 토론 합의: 원탁 + 체크 문서 -->
    <ellipse cx="224" cy="92" rx="42" ry="14" fill="#EDE0C8" stroke="#B8A278" stroke-width="1.4"/>
    ${tinyMan(190, 66, { arm: "out", mood: "joy", r: 5.4 })}
    ${tinyMan(224, 58, { arm: "up", mood: "joy", r: 5.4 })}
    ${tinyMan(258, 66, { arm: "out", mood: "ok", r: 5.4 })}
    <rect x="214" y="84" width="20" height="14" rx="2.4" fill="#FFFFFF" stroke="#1864AB" stroke-width="1.4"/>
    <path d="M218 91l3 3 5.4-6" stroke="#1864AB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="224" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">둘러앉아 함께, 합의</text>`;
  return shell(300, 158, inner, "두 장면 비교, 왼쪽은 높은 단 위에서 종이를 내려보내는 모습과 시무룩한 사람들, 오른쪽은 둥근 탁자에 둘러앉아 웃으며 합의 문서를 만든 사람들");
}

/* ---------- L3: 클레로테리온 도해 — 추첨 기계의 작동 ---------- */
export function kleroterionFig(): string {
  const slots = [0, 1, 2, 3].map((r) =>
    [0, 1, 2].map((c) => {
      const x = 74 + c * 34;
      const y = 46 + r * 20;
      return `<rect x="${x}" y="${y}" width="26" height="12" rx="2" fill="#F6EFE0" stroke="#8A7648" stroke-width="1.1"/>
        <path d="M${x + 4} ${y + 6}h18" stroke="#B8A472" stroke-width="1.6" stroke-linecap="round"/>`;
    }).join(""),
  ).join("");
  const inner = `
    <rect x="60" y="32" width="120" height="98" rx="6" fill="#E8DCC0" stroke="#8A7648" stroke-width="2"/>
    <path d="M60 32q60-10 120 0" stroke="#8A7648" stroke-width="1.2" fill="none" opacity=".5"/>
    ${slots}
    <rect x="196" y="30" width="12" height="100" rx="6" fill="#D8CCAC" stroke="#8A7648" stroke-width="1.6"/>
    <circle cx="202" cy="44" r="4" fill="#FFFFFF" stroke="#8A7648" stroke-width="1.2"/>
    <circle cx="202" cy="56" r="4" fill="#3C4654"/>
    <circle cx="202" cy="68" r="4" fill="#FFFFFF" stroke="#8A7648" stroke-width="1.2"/>
    <circle cx="202" cy="80" r="4" fill="#3C4654"/>
    <path d="M202 118v8" stroke="#8A7648" stroke-width="1.6"/>
    <circle cx="202" cy="132" r="5" fill="#FFFFFF" stroke="#1864AB" stroke-width="1.8"/>
    <path d="M216 132h18" stroke="#1864AB" stroke-width="1.6" stroke-dasharray="4 3"/>
    <rect x="234" y="120" width="52" height="24" rx="8" fill="#EAF2FB" stroke="#1864AB" stroke-width="1.4"/>
    <text x="260" y="130" text-anchor="middle" font-size="8.6" font-weight="800" fill="#124F86">흰 돌이 서면</text>
    <text x="260" y="140" text-anchor="middle" font-size="8.6" font-weight="800" fill="#124F86">그 줄이 당첨!</text>
    <rect x="14" y="42" width="42" height="24" rx="8" fill="#F6EFE0" stroke="#8A7648" stroke-width="1.3"/>
    <text x="35" y="52" text-anchor="middle" font-size="8.6" font-weight="800" fill="#6E5A28">홈마다</text>
    <text x="35" y="62" text-anchor="middle" font-size="8.6" font-weight="800" fill="#6E5A28">이름표</text>
    <path d="M56 52q6 2 14 2" stroke="#8A7648" stroke-width="1.2" fill="none" stroke-dasharray="3 3"/>
    <text x="120" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">시민의 이름표를 꽂고 돌을 뽑아 일할 사람을 정했어요</text>`;
  return shell(300, 158, inner, "돌판에 가로 홈이 줄지어 있고 이름표가 꽂혀 있으며, 옆의 관에서 흰 돌과 검은 돌을 뽑는 추첨 기계 도해");
}

/* ---------- L4: 선거권 확대 계단 — 다섯 단의 연도 ---------- */
export function suffStepFig(): string {
  const steps = [
    { year: "1832", n: 1 },
    { year: "1867", n: 2 },
    { year: "1884", n: 3 },
    { year: "1918", n: 4 },
    { year: "1928", n: 5 },
  ];
  const stepW = 52;
  const inner = steps
    .map((st, i) => {
      const x = 16 + i * stepW;
      const topY = 118 - (i + 1) * 17;
      const men = Array.from({ length: st.n }, (_, k) => {
        const mx = x + 10 + (k % 3) * 15;
        const my = topY - 12 - Math.floor(k / 3) * 20;
        return tinyMan(mx, my, { arm: k === st.n - 1 ? "up" : "out", mood: "joy", r: 4.2 });
      }).join("");
      return `
      <rect x="${x}" y="${topY}" width="${stepW}" height="${136 - topY}" rx="3" fill="${i % 2 ? "#E4EEF9" : "#EDF3FA"}" stroke="#9EC2E8" stroke-width="1.3"/>
      <text x="${x + stepW / 2}" y="${132}" text-anchor="middle" font-size="9.4" font-weight="800" fill="#124F86">${st.year}</text>
      ${men}`;
    })
    .join("");
  return shell(
    300,
    158,
    `${inner}
    <path d="M24 34 Q150 6 280 22" stroke="#1864AB" stroke-width="1.8" fill="none" stroke-dasharray="6 5" opacity=".6"/>
    <path d="M276 18l7 3-5 5z" fill="#1864AB" opacity=".7"/>`,
    "다섯 단의 계단, 연도가 오를수록 계단 위에 서서 손을 든 사람이 한 명씩 늘어난다",
  );
}

/* ---------- L5: 원리 신전 — (가)~(라) 기둥 판별 ---------- */
export function pillarFig(): string {
  const labels = ["(가)", "(나)", "(다)", "(라)"];
  const cols = labels
    .map((lb, i) => {
      const x = 52 + i * 66;
      return `
      <rect x="${x - 20}" y="72" width="40" height="52" rx="4" fill="#F1E9D2" stroke="#B8A472" stroke-width="1.5"/>
      <path d="M${x - 10} 78v40M${x} 78v40M${x + 10} 78v40" stroke="#CBBB90" stroke-width="1" opacity=".7"/>
      ${pill(x, 98, lb)}`;
    })
    .join("");
  const inner = `
    <path d="M22 52 L150 14 L278 52 v8 H22z" fill="#F5EBD2" stroke="#B8A472" stroke-width="1.8" stroke-linejoin="round"/>
    <text x="150" y="46" text-anchor="middle" font-size="10.5" font-weight="800" fill="#6E5A28">인간의 존엄성 · 자유 · 평등</text>
    ${cols}
    <rect x="18" y="124" width="264" height="10" rx="4" fill="#E2D2A8" stroke="#B8A472" stroke-width="1.3"/>
    <text x="150" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">이념의 지붕을 받치는 네 개의 기둥</text>`;
  return shell(300, 158, inner, "삼각 지붕을 네 개의 기둥이 받치는 신전 도해, 각 기둥에 가나다라 라벨");
}

/* ---------- L5: 헌법 제1조 카드 ---------- */
export function article1Fig(): string {
  const inner = `
    <rect x="30" y="22" width="240" height="114" rx="10" fill="#FFFFFF" stroke="#1864AB" stroke-width="2"/>
    <rect x="30" y="22" width="240" height="26" rx="10" fill="#EAF2FB"/>
    <path d="M30 48h240" stroke="#9EC2E8" stroke-width="1.2"/>
    <text x="150" y="40" text-anchor="middle" font-size="12" font-weight="900" fill="#124F86">대한민국헌법 제1조</text>
    <text x="46" y="70" font-size="10.5" font-weight="700" fill="#39455C">① 대한민국은 민주 공화국이다.</text>
    <text x="46" y="92" font-size="10.5" font-weight="700" fill="#39455C">② 대한민국의 주권은 국민에게 있고,</text>
    <text x="58" y="108" font-size="10.5" font-weight="700" fill="#39455C">모든 권력은 국민으로부터 나온다.</text>
    <path d="M244 100l2 4.4 4.4 2-4.4 2-2 4.4-2-4.4-4.4-2 4.4-2z" fill="#F2C24E"/>
    <text x="150" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">나라의 최고법, 그 첫 조항</text>`;
  return shell(300, 158, inner, "헌법 제1조가 적힌 카드, 1항 대한민국은 민주 공화국이다, 2항 주권은 국민에게 있다");
}

/* ---------- L6: 스틱 나라 투표율 그래프(가상 수치 — 하락 추세) ---------- */
export function turnoutFig(): string {
  const data = [
    { label: "1번째", v: 78 },
    { label: "2번째", v: 71 },
    { label: "3번째", v: 62 },
    { label: "4번째", v: 54 },
  ];
  const base = 122;
  const maxH = 76;
  const bars = data
    .map((d, i) => {
      const x = 58 + i * 54;
      const h = (d.v / 100) * maxH;
      return `
      <rect x="${x - 15}" y="${base - h}" width="30" height="${h}" rx="4" fill="${i === data.length - 1 ? "#C0871C" : "#4A86C8"}" opacity="${0.55 + i * 0.15}"/>
      <text x="${x}" y="${base - h - 5}" text-anchor="middle" font-size="9.6" font-weight="800" fill="#39455C">${d.v}%</text>
      <text x="${x}" y="${base + 12}" text-anchor="middle" font-size="9" font-weight="700" fill="#7E8AA0">${d.label}</text>`;
    })
    .join("");
  const inner = `
    <text x="150" y="26" text-anchor="middle" font-size="11" font-weight="900" fill="#39455C">스틱 나라 대표 선거 투표율</text>
    <path d="M36 122h230" stroke="#C9D2E0" stroke-width="1.4"/>
    <path d="M36 122V38" stroke="#C9D2E0" stroke-width="1.4"/>
    ${bars}
    <path d="M70 58 Q150 66 238 92" stroke="#C0392E" stroke-width="1.8" fill="none" stroke-dasharray="5 4" opacity=".8"/>
    <path d="M234 88l7 4-6 4z" fill="#C0392E" opacity=".9"/>
    <text x="150" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">선거를 거듭할수록 투표함 앞이 한산해져요</text>`;
  return shell(300, 158, inner, "네 번의 선거 투표율 막대그래프, 78, 71, 62, 54퍼센트로 점점 낮아진다");
}

/* ---------- L7: 공론장 흐름도 — 토론에서 정책까지 ---------- */
export function forumFig(): string {
  const inner = `
    <ellipse cx="76" cy="72" rx="46" ry="30" fill="#EAF2FB" stroke="#4A86C8" stroke-width="1.6"/>
    ${tinyMan(56, 58, { arm: "out", mood: "joy", r: 4.6 })}
    ${tinyMan(78, 52, { arm: "up", mood: "ok", r: 4.6 })}
    ${tinyMan(98, 60, { arm: "out", mood: "joy", r: 4.6 })}
    <path d="M60 88q16 8 32 0" stroke="#4A86C8" stroke-width="1.4" fill="none" opacity=".7"/>
    <text x="76" y="116" text-anchor="middle" font-size="9.6" font-weight="800" fill="#124F86">합리적 토론</text>
    <path d="M128 72h34" stroke="#8A93A6" stroke-width="2"/>
    <path d="M158 68l8 4-8 4z" fill="#8A93A6"/>
    <rect x="168" y="52" width="46" height="40" rx="8" fill="#FFFFFF" stroke="#2E8A4C" stroke-width="1.6"/>
    <path d="M177 66h28M177 74h28M177 82h18" stroke="#9CC8AA" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M198 60l2.6 2.6 4.8-5.2" stroke="#2E8A4C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="191" y="106" text-anchor="middle" font-size="9.6" font-weight="800" fill="#237040">사회적 합의</text>
    <path d="M218 72h26" stroke="#8A93A6" stroke-width="2"/>
    <path d="M240 68l8 4-8 4z" fill="#8A93A6"/>
    <rect x="250" y="50" width="38" height="44" rx="6" fill="#EDF3FA" stroke="#7E9EC2" stroke-width="1.5"/>
    <rect x="256" y="58" width="10" height="8" rx="1.6" fill="#FFFFFF" stroke="#9EB4CE" stroke-width="1"/>
    <rect x="272" y="58" width="10" height="8" rx="1.6" fill="#FFFFFF" stroke="#9EB4CE" stroke-width="1"/>
    <rect x="256" y="72" width="10" height="8" rx="1.6" fill="#FFFFFF" stroke="#9EB4CE" stroke-width="1"/>
    <rect x="272" y="72" width="10" height="8" rx="1.6" fill="#FFFFFF" stroke="#9EB4CE" stroke-width="1"/>
    <text x="269" y="108" text-anchor="middle" font-size="9.6" font-weight="800" fill="#39455C">정책 반영</text>
    <text x="150" y="146" text-anchor="middle" font-size="9.6" fill="#7E8AA0">시민의 뜻이 정책까지 닿는 길</text>`;
  return shell(300, 158, inner, "흐름도, 사람들이 둘러앉아 토론하는 원, 화살표, 확정된 합의 문서, 화살표, 건물");
}

/* ================= recap 미니아트(64×64 플랫 — socFigures 관례) ================= */

const MA: Record<string, string> = {
  // L1
  widepol: `<ellipse cx="32" cy="40" rx="22" ry="9" fill="#EDE0C8" stroke="#B8A278" stroke-width="1.5"/>
    <circle cx="20" cy="24" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.6"/>
    <circle cx="44" cy="24" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.6"/>
    <path d="M14 36q-4-6 2-9M50 36q4-6-2-9" stroke="#1864AB" stroke-width="1.8" fill="none"/>
    <rect x="26" y="34" width="12" height="9" rx="1.8" fill="#FFFFFF" stroke="#1864AB" stroke-width="1.3"/>`,
  narrowpol: `<path d="M12 34a20 13 0 0 1 40 0z" fill="#DCE8F2" stroke="#7E9EC2" stroke-width="1.8"/>
    <circle cx="32" cy="19" r="2.6" fill="#7E9EC2"/>
    <rect x="10" y="34" width="44" height="18" rx="2.4" fill="#EDF3FA" stroke="#7E9EC2" stroke-width="1.6"/>
    ${[18, 28, 38, 48].map((x) => `<rect x="${x - 2.4}" y="38" width="4.8" height="11" rx="1.6" fill="#FFFFFF" stroke="#9EB4CE" stroke-width="1"/>`).join("")}
    <rect x="16" y="52" width="32" height="5" rx="2" fill="#D8E4F0"/>`,
  polrole: `<path d="M32 12v8" stroke="#B8860E" stroke-width="2" stroke-linecap="round"/>
    <path d="M18 20h28" stroke="#B8860E" stroke-width="2" stroke-linecap="round"/>
    <path d="M18 20l-5 10q5 4 10 0zM46 20l5 10q-5 4-10 0z" fill="#F2CE7E" stroke="#B8860E" stroke-width="1.3"/>
    <path d="M32 20v24" stroke="#B8860E" stroke-width="2"/>
    <path d="M22 50h20l-3 6H25z" fill="#E2D2A8" stroke="#8A7648" stroke-width="1.3"/>`,
  // L2
  demomean: `${[16, 32, 48].map((x) => `<path d="M${x - 6} 30l2 3.6 4-3 4 3 2-3.6v4.6h-12z" fill="#F2C24E" stroke="#B8860E" stroke-width="1" stroke-linejoin="round"/><circle cx="${x}" cy="44" r="5.4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.6"/>`).join("")}
    <path d="M12 18q20-8 40 0" stroke="#1864AB" stroke-width="1.8" fill="none" stroke-dasharray="4 3"/>`,
  demoneed: `<rect x="16" y="14" width="32" height="38" rx="4" fill="#FFFFFF" stroke="#1864AB" stroke-width="1.8"/>
    <path d="M22 24h20M22 31h20M22 38h13" stroke="#9EC2E8" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="42" cy="46" r="9" fill="#EAF2FB" stroke="#1864AB" stroke-width="1.6"/>
    <path d="M38 46l3 3 5-6" stroke="#1864AB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  demoway3: `<circle cx="18" cy="22" r="7" fill="#E4F2E8" stroke="#2E8A4C" stroke-width="1.6"/>
    <path d="M15 22q3 2.6 6 0" stroke="#2E8A4C" stroke-width="1.5" fill="none"/>
    <path d="M30 18h10M30 24h10" stroke="#1864AB" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="22" r="7" fill="#EAF2FB" stroke="#1864AB" stroke-width="1.6"/>
    <path d="M26 44l6 8 6-8M44 44l6 8" stroke="#C0871C" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M12 44h40" stroke="#C0871C" stroke-width="1.6" stroke-dasharray="4 3"/>`,
  // L3
  athensdirect: `<path d="M8 48q24-18 48 0z" fill="#E8DCC0" stroke="#8A7648" stroke-width="1.6"/>
    ${[20, 32, 44].map((x) => `<path d="M${x} 34v-8M${x} 26l-4-5M${x} 26l4-6" stroke="#3C4654" stroke-width="1.6" stroke-linecap="round"/><circle cx="${x}" cy="20" r="3.6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.4"/>`).join("")}
    <circle cx="54" cy="14" r="5" fill="#F2C24E" opacity=".8"/>`,
  kleroterion: `<rect x="14" y="10" width="28" height="44" rx="3" fill="#E8DCC0" stroke="#8A7648" stroke-width="1.6"/>
    ${[16, 26, 36, 46].map((y) => `<rect x="19" y="${y}" width="18" height="6" rx="1.4" fill="#F6EFE0" stroke="#8A7648" stroke-width=".9"/>`).join("")}
    <rect x="46" y="8" width="8" height="48" rx="4" fill="#D8CCAC" stroke="#8A7648" stroke-width="1.3"/>
    <circle cx="50" cy="18" r="2.6" fill="#FFFFFF" stroke="#8A7648" stroke-width="1"/>
    <circle cx="50" cy="27" r="2.6" fill="#3C4654"/>
    <circle cx="50" cy="50" r="3.4" fill="#FFFFFF" stroke="#1864AB" stroke-width="1.6"/>`,
  athenslimit: `<rect x="12" y="16" width="40" height="36" rx="4" fill="#EDF3FA" stroke="#7E9EC2" stroke-width="1.6"/>
    <path d="M32 16v36" stroke="#7E9EC2" stroke-width="1.3"/>
    <circle cx="22" cy="30" r="4.6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <path d="M22 35v7M22 38l-4 5M22 38l4 5" stroke="#3C4654" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M38 24l8 8M46 24l-8 8" stroke="#C0392E" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M36 44h12" stroke="#C0392E" stroke-width="2" stroke-linecap="round"/>`,
  // L4
  civilrev: `<path d="M14 52q18-8 36 0" stroke="#8A7648" stroke-width="1.6" fill="none"/>
    <rect x="22" y="14" width="20" height="26" rx="2.6" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="1.5"/>
    <path d="M26 22h12M26 28h12M26 34h8" stroke="#B99B66" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M48 20l2 4.4 4.4 2-4.4 2-2 4.4-2-4.4-4.4-2 4.4-2z" fill="#F2C24E"/>
    <path d="M14 30l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" fill="#F2C24E"/>`,
  univsuff: `<rect x="18" y="26" width="28" height="20" rx="3.6" fill="#4A86C8" stroke="#124F86" stroke-width="1.5"/>
    <rect x="26" y="23" width="12" height="3.4" rx="1.7" fill="#124F86"/>
    <g transform="rotate(-14 32 16)"><rect x="27" y="10" width="10" height="12" rx="1.6" fill="#FFFFFF" stroke="#1864AB" stroke-width="1.2"/></g>
    <path d="M12 52q20 8 40 0" stroke="#1864AB" stroke-width="1.8" fill="none"/>
    <path d="M24 43l3 3 5-6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  krdemo: `${[18, 32, 46].map((x, i) => `<path d="M${x} 54V${34 - i * 4}" stroke="${i === 1 ? "#C0871C" : "#1864AB"}" stroke-width="3.6" stroke-linecap="round"/><circle cx="${x}" cy="${28 - i * 4}" r="4" fill="#F8E8CE" stroke="#B06A2E" stroke-width="1.2"/>`).join("")}
    <path d="M50 12l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="#F2C24E"/>`,
  // L5
  ideal: `<path d="M8 34 L32 12 L56 34 v6 H8z" fill="#F5EBD2" stroke="#B8A472" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="32" cy="28" r="4" fill="#F2C24E"/>
    <path d="M16 46h32M16 52h32" stroke="#C8B482" stroke-width="2.6" stroke-linecap="round"/>`,
  sovself: `<path d="M22 16l2.4 4.4 5-3.6 5 3.6 2.4-4.4v6h-14.8z" fill="#F2C24E" stroke="#B8860E" stroke-width="1.1" stroke-linejoin="round"/>
    <circle cx="29.5" cy="34" r="6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.6"/>
    <path d="M46 26a16 16 0 1 1-8 22" stroke="#1864AB" stroke-width="2" fill="none"/>
    <path d="M36 50l3 5 5-4z" fill="#1864AB"/>`,
  constsep: `<rect x="14" y="10" width="36" height="16" rx="3.6" fill="#4A86C8" stroke="#124F86" stroke-width="1.5"/>
    <path d="M32 13v10M20 17h8M36 17h8" stroke="#EAF2FB" stroke-width="1.3" stroke-linecap="round"/>
    ${[20, 32, 44].map((x) => `<rect x="${x - 4.6}" y="32" width="9.2" height="20" rx="2" fill="#F1E9D2" stroke="#B8A472" stroke-width="1.3"/>`).join("")}
    <path d="M24 42h4M36 42h4" stroke="#C0871C" stroke-width="1.6" stroke-linecap="round"/>`,
  // L6
  represent: `<circle cx="18" cy="20" r="4.6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <circle cx="18" cy="38" r="4.6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <circle cx="18" cy="56" r="4.6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <path d="M26 20q10 0 12 14M26 56q10 0 12-14M26 38h12" stroke="#1864AB" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/>
    <rect x="40" y="30" width="16" height="12" rx="2.6" fill="#E2D2A8" stroke="#8A7648" stroke-width="1.4"/>
    <circle cx="48" cy="22" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.6"/>`,
  replimit: `<path d="M10 44h18M36 44h18" stroke="#8A7648" stroke-width="3" stroke-linecap="round"/>
    <path d="M28 44q4-6 8 0" stroke="#C0392E" stroke-width="2" stroke-dasharray="3 3" fill="none"/>
    <circle cx="14" cy="28" r="4.6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <circle cx="50" cy="28" r="4.6" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <path d="M46 16l8 8M54 16l-8 8" stroke="#C0392E" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`,
  apathy: `<path d="M10 40q0-8 8-8h28q8 0 8 8v10H10z" fill="#DCE6F0" stroke="#7E9EC2" stroke-width="1.6"/>
    <rect x="6" y="38" width="8" height="14" rx="3" fill="#C8D8E8" stroke="#7E9EC2" stroke-width="1.3"/>
    <rect x="50" y="38" width="8" height="14" rx="3" fill="#C8D8E8" stroke="#7E9EC2" stroke-width="1.3"/>
    <circle cx="30" cy="24" r="5.4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.6"/>
    <path d="M30 29q-6 4-10 3" stroke="#3C4654" stroke-width="1.6" fill="none"/>
    <path d="M44 14a6 6 0 1 1-6 8" stroke="#A8B2C2" stroke-width="1.8" fill="none"/>
    <path d="M41 24h5" stroke="#A8B2C2" stroke-width="1.6"/>`,
  // L7
  krroad: `<path d="M14 54 Q32 34 24 12" stroke="#C8B482" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M14 54 Q32 34 24 12" stroke="#FFFFFF" stroke-width="1.4" fill="none" stroke-dasharray="4 5"/>
    <rect x="34" y="18" width="20" height="12" rx="2.4" fill="#EAF2FB" stroke="#1864AB" stroke-width="1.4"/>
    <path d="M34 30v12" stroke="#8A7648" stroke-width="2"/>
    <path d="M40 24h8" stroke="#1864AB" stroke-width="1.6" stroke-linecap="round"/>`,
  institution: `<rect x="10" y="30" width="20" height="16" rx="3" fill="#4A86C8" stroke="#124F86" stroke-width="1.4"/>
    <rect x="16" y="27" width="8" height="3" rx="1.5" fill="#124F86"/>
    <rect x="36" y="26" width="18" height="22" rx="2.6" fill="#FFFFFF" stroke="#2E8A4C" stroke-width="1.5"/>
    <path d="M40 33h10M40 39h10" stroke="#9CC8AA" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M14 18q6-6 12 0M40 14q6-6 12 0" stroke="#C0871C" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  forum: `<ellipse cx="32" cy="36" rx="22" ry="12" fill="#EAF2FB" stroke="#4A86C8" stroke-width="1.6"/>
    <circle cx="20" cy="22" r="4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.4"/>
    <circle cx="32" cy="18" r="4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.4"/>
    <circle cx="44" cy="22" r="4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.4"/>
    <rect x="26" y="32" width="12" height="9" rx="1.8" fill="#FFFFFF" stroke="#1864AB" stroke-width="1.3"/>
    <path d="M29 36.5l2 2 4-4.5" stroke="#1864AB" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 52q18 8 36 0" stroke="#2E8A4C" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
};

/** recap 카드 미니아트 — 64×64 플랫(soc 관례) */
export function soc9MiniArt(key: string): string {
  const body = MA[key] ?? `<circle cx="32" cy="32" r="16" fill="#EAF2FB" stroke="#1864AB" stroke-width="2"/>`;
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">${body}</svg>`;
}
