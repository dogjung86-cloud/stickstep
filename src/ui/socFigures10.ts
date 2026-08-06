// socFigures10 — 사회 Ⅹ(정치과정과 시민 참여) 그림 모듈. socFigures9 문법 계승 —
// 개념 도해(벡터)+스틱맨 장면, 파운드리 문법 준수, 스틱맨만 손그림 라인.
//   · 퀴즈 그림 라벨은 (가)(나)·㉠㉡식 중립 라벨만 — 정답 유출 금지(aria에도 개념 이름 대신 묘사만).
//   · 민감 가드: 무성별 스틱맨, 현실 정당·정치인·언론사·국기 0, 쟁점 장면은 가상 "스틱 시".
//     선거 관리 위원회 등 공적 기관 이름만 허용(교과서가 드는 제도·기구).
const STICK = `stroke="#3C4654" stroke-width="2" stroke-linecap="round" fill="none"`;

function shell(vw: number, vh: number, inner: string, aria: string, defs = ""): string {
  return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${aria}">
    <defs>
      <linearGradient id="s10-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFF"/><stop offset="1" stop-color="#EEF2F8"/></linearGradient>
      ${defs}
    </defs>
    <rect x="2" y="2" width="${vw - 4}" height="${vh - 4}" rx="14" fill="url(#s10-paper)" stroke="#D3DCE8" stroke-width="1.6"/>
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

/* ---------- L1: 선거의 기능 — 일 못한 대표를 다음 선거에서 바꾸는 장면 ---------- */
export function voteControlFig(): string {
  const inner = `
    <line x1="150" y1="14" x2="150" y2="146" stroke="#C9D2E0" stroke-width="1.2" stroke-dasharray="5 5"/>
    ${pill(76, 26, "(가)")}
    ${pill(224, 26, "(나)")}
    <!-- (가) 약속을 안 지킨 대표: 구겨진 약속 문서 + 시무룩한 시민들 -->
    ${tinyMan(76, 52, { arm: "down", r: 6.4 })}
    <rect x="60" y="72" width="32" height="10" rx="5" fill="#8A93A6"/>
    <text x="76" y="79.4" text-anchor="middle" font-size="7.2" font-weight="800" fill="#FFF">대표</text>
    <g transform="rotate(-12 44 66)"><rect x="34" y="58" width="20" height="15" rx="2" fill="#FFFFFF" stroke="#B8C2CE" stroke-width="1.2"/><path d="M38 63h12M38 67h8" stroke="#C9D2DC" stroke-width="1.2"/><path d="M36 60l16 11M52 60l-16 11" stroke="#C0392E" stroke-width="1.4" opacity=".8"/></g>
    ${tinyMan(48, 112, { mood: "sad", r: 5.2 })}${tinyMan(76, 116, { mood: "sad", r: 5.2 })}${tinyMan(104, 112, { mood: "sad", r: 5.2 })}
    <text x="76" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">약속을 지키지 않은 대표</text>
    <!-- (나) 다음 선거: 투표함에 표가 쌓이고 새 대표 등장 -->
    <rect x="196" y="60" width="40" height="28" rx="5" fill="#4A86C8" stroke="#124F86" stroke-width="1.6"/>
    <rect x="208" y="56" width="16" height="4" rx="2" fill="#124F86"/>
    <g transform="rotate(-14 216 48)"><rect x="209" y="40" width="14" height="17" rx="2" fill="#FFFFFF" stroke="#8A93A6" stroke-width="1.3"/><circle cx="216" cy="50" r="2.2" fill="none" stroke="#1864AB" stroke-width="1.3"/></g>
    ${tinyMan(184, 116, { arm: "up", mood: "joy", r: 5.2 })}${tinyMan(216, 120, { arm: "up", mood: "joy", r: 5.2 })}${tinyMan(248, 116, { arm: "up", mood: "joy", r: 5.2 })}
    <text x="224" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">다음 선거에서 표로 답하다</text>`;
  return shell(300, 158, inner, "두 장면 비교 — 왼쪽은 찢어진 약속 문서와 시무룩한 사람들, 오른쪽은 투표함에 표를 넣으며 웃는 사람들");
}

/* ---------- L2: 네 가지 제안 카드 — 원칙 위반 판별(라벨형) ---------- */
export function ruleCardsFig(): string {
  const card = (x: number, y: number, label: string, icon: string): string => `
    <g>
      <rect x="${x - 62}" y="${y - 24}" width="124" height="48" rx="8" fill="#FFFFFF" stroke="#B8C2CE" stroke-width="1.4"/>
      ${pill(x - 41, y, label)}
      <g transform="translate(${x - 8} ${y})">${icon}</g>
    </g>`;
  const inner = `
    ${card(82, 44, "(가)", `<circle cx="0" cy="-2" r="6" fill="#E8746A" stroke="#B84434" stroke-width="1.3"/><text x="22" y="4" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5A6478">스티커 공개 투표</text>`)}
    ${card(218, 44, "(나)", `<path d="M-6 -6l5 8 7-10" stroke="#3E8EC4" stroke-width="2" fill="none" stroke-linecap="round"/><text x="24" y="4" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5A6478">짝꿍 대리 투표</text>`)}
    ${card(82, 112, "(다)", `<text x="-2" y="3" text-anchor="middle" font-size="11" font-weight="900" fill="#C0871C">x2</text><text x="24" y="4" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5A6478">성적 우수 두 표</text>`)}
    ${card(218, 112, "(라)", `<path d="M-6 -5l10 10M4 -5l-10 10" stroke="#B84434" stroke-width="2" stroke-linecap="round"/><text x="24" y="4" text-anchor="middle" font-size="8.4" font-weight="700" fill="#5A6478">지각 3회 투표 금지</text>`)}
    <text x="150" y="150" text-anchor="middle" font-size="9.6" fill="#7E8AA0">학급 회의에 나온 선거 규칙 제안들</text>`;
  return shell(300, 160, inner, "네 장의 제안 카드 — 스티커 붙이기, 대신 투표하기, 두 표 주기, 투표 금지하기");
}

/* ---------- L3: 선거 과정 6단계 흐름도(㉠ 빈칸) ---------- */
export function electFlowFig(): string {
  const steps = ["선거인 명부 작성", "후보자 등록", "선거 운동", "투표", "㉠", "당선인 결정"];
  const nodes = steps
    .map((t, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 62 + col * 88;
      const y = 46 + row * 62;
      const blank = t === "㉠";
      return `<g>
      <rect x="${x - 38}" y="${y - 17}" width="76" height="34" rx="8" fill="${blank ? "#FFF8E4" : "#FFFFFF"}" stroke="${blank ? "#C0871C" : "#8FA86A"}" stroke-width="1.6"${blank ? ` stroke-dasharray="5 4"` : ""}/>
      <circle cx="${x - 26}" cy="${y - 8}" r="7" fill="#5C940D"/>
      <text x="${x - 26}" y="${y - 5}" text-anchor="middle" font-size="8" font-weight="900" fill="#FFF">${i + 1}</text>
      <text x="${x + 4}" y="${y + 3.4}" text-anchor="middle" font-size="${blank ? 12 : 8.2}" font-weight="800" fill="${blank ? "#8A5A14" : "#3E5228"}">${t}</text>
    </g>`;
    })
    .join("");
  const arrows = `
    <path d="M104 46h8M192 46h8" stroke="#8FA86A" stroke-width="2"/>
    <path d="M110 42l7 4-7 4zM198 42l7 4-7 4z" fill="#8FA86A"/>
    <path d="M238 64v14" stroke="#8FA86A" stroke-width="2"/><path d="M234 74l4 7 4-7z" fill="#8FA86A"/>
    <path d="M196 108h-8M108 108h-8" stroke="#8FA86A" stroke-width="2"/>
    <path d="M190 104l-7 4 7 4zM102 104l-7 4 7 4z" fill="#8FA86A"/>`;
  const inner = `${nodes}${arrows}
    <text x="150" y="146" text-anchor="middle" font-size="9.6" fill="#7E8AA0">선거가 진행되는 순서</text>`;
  return shell(300, 156, inner, "여섯 칸 흐름도 — 명단 만들기부터 당선 결정까지 이어지는 화살표, 다섯 번째 칸은 빈칸");
}

/* ---------- L4: 스틱 시 쟁점 관계도 — 네 주체(라벨형) ---------- */
export function actorMapFig(): string {
  const box = (x: number, y: number, label: string, desc1: string, desc2: string, c: string): string => `
    <g>
      <rect x="${x - 64}" y="${y - 26}" width="128" height="52" rx="9" fill="#FFFFFF" stroke="${c}" stroke-width="1.6"/>
      ${pill(x - 43, y - 10, label)}
      <text x="${x + 12}" y="${y - 6}" text-anchor="middle" font-size="8.2" font-weight="700" fill="#5A6478">${desc1}</text>
      <text x="${x}" y="${y + 12}" text-anchor="middle" font-size="8.2" font-weight="700" fill="#5A6478">${desc2}</text>
    </g>`;
  const inner = `
    <circle cx="150" cy="82" r="26" fill="#EAF2FB" stroke="#7E9EC2" stroke-width="1.6"/>
    <text x="150" y="79" text-anchor="middle" font-size="8.6" font-weight="800" fill="#39455C">케이블카</text>
    <text x="150" y="91" text-anchor="middle" font-size="8.6" font-weight="800" fill="#39455C">지을까?</text>
    ${box(78, 38, "(가)", "상인들의 단체:", "“우리 가게들의 희망!”", "#C0871C")}
    ${box(222, 38, "(나)", "시민들의 자발적 모임:", "“자연 훼손이 걱정돼요”", "#2E8A4C")}
    ${box(78, 128, "(다)", "방송:", "“찬반 의견을 전합니다”", "#8A5EC0")}
    ${box(222, 128, "(라)", "정치인 모임:", "“공약으로 해결하겠습니다”", "#2E8AC0")}
    <path d="M100 56l22 14M200 56l-22 14M100 112l22-14M200 112l-22-14" stroke="#C9D2E0" stroke-width="1.6" stroke-dasharray="4 4"/>`;
  return shell(300, 160, inner, "가운데 쟁점 원을 둘러싼 네 개의 말풍선 상자 — 상인 단체, 시민 모임, 방송, 정치인 모임");
}

/* ---------- L5: 정치과정 순환 도해(가~마 + 환류 화살표) ---------- */
export function processCycleFig(): string {
  const steps = [
    { label: "(가)", desc: "요구를 자유롭게 표현", x: 60, y: 40 },
    { label: "(나)", desc: "모아서 요약·대안 제시", x: 150, y: 40 },
    { label: "(다)", desc: "법률 제정·정책 결정", x: 240, y: 40 },
    { label: "(라)", desc: "정책을 실제로 실행", x: 105, y: 104 },
    { label: "(마)", desc: "시민이 성적표 매기기", x: 195, y: 104 },
  ];
  const nodes = steps
    .map(
      (s) => `<g>
    <rect x="${s.x - 42}" y="${s.y - 22}" width="84" height="44" rx="8" fill="#FFFFFF" stroke="#8FA86A" stroke-width="1.5"/>
    ${pill(s.x - 22, s.y - 8, s.label)}
    <text x="${s.x}" y="${s.y + 12}" text-anchor="middle" font-size="7.6" font-weight="700" fill="#5A6478">${s.desc}</text>
  </g>`,
    )
    .join("");
  const arrows = `
    <path d="M102 40h6M192 40h6" stroke="#8FA86A" stroke-width="2"/>
    <path d="M106 36l7 4-7 4zM196 36l7 4-7 4z" fill="#8FA86A"/>
    <path d="M232 62q-6 20-38 22M148 84h-1" stroke="#8FA86A" stroke-width="2" fill="none"/>
    <path d="M198 82l-8 3 6 6z" fill="#8FA86A"/>
    <path d="M147 104h6" stroke="#8FA86A" stroke-width="2"/><path d="M151 100l7 4-7 4z" fill="#8FA86A"/>
    <path d="M195 126q-2 14-60 14q-84 0-76-92" stroke="#C0871C" stroke-width="2" fill="none" stroke-dasharray="6 5"/>
    <path d="M55 52l4-8 5 7z" fill="#C0871C"/>
    <text x="128" y="152" text-anchor="middle" font-size="8.4" font-weight="800" fill="#8A5A14">평가는 다시 처음으로</text>`;
  const inner = `${nodes}${arrows}`;
  return shell(300, 162, inner, "다섯 칸이 화살표로 이어진 흐름도 — 마지막 칸에서 첫 칸으로 굽어 돌아가는 노란 점선 화살표");
}

/* ---------- L6: 지방 자치 단체 조직도(㉠·㉡) ----------
   주의: ㉠·㉡은 "각 단체마다" 있는 의결·집행 기관 — 광역/기초 어느 한쪽 전유로 읽히지 않게
   두 단체 상자에서 ㉠·㉡ 양쪽 모두로 점선을 내린다(눈검수 1차에서 오독 구도 적발·재작도). */
export function localOrgFig(): string {
  const inner = `
    <rect x="96" y="14" width="108" height="26" rx="8" fill="#5C940D"/>
    <text x="150" y="31" text-anchor="middle" font-size="10" font-weight="800" fill="#FFF">지방 자치 단체</text>
    <path d="M150 40v8M88 48h124M88 48v8M212 48v8" stroke="#8FA86A" stroke-width="1.8" fill="none"/>
    <rect x="34" y="56" width="108" height="24" rx="7" fill="#EFF4E4" stroke="#8FA86A" stroke-width="1.5"/>
    <text x="88" y="72" text-anchor="middle" font-size="9" font-weight="800" fill="#3E5228">광역 자치 단체</text>
    <rect x="158" y="56" width="108" height="24" rx="7" fill="#EFF4E4" stroke="#8FA86A" stroke-width="1.5"/>
    <text x="212" y="72" text-anchor="middle" font-size="9" font-weight="800" fill="#3E5228">기초 자치 단체(시·군·구)</text>
    <text x="150" y="94" text-anchor="middle" font-size="8.4" font-weight="800" fill="#5A6478" stroke="#FFFFFF" stroke-width="3" paint-order="stroke">어느 단체든 두 기관이 짝을 이뤄요</text>
    <path d="M70 80q-10 14 0 20M106 80q22 14 88 20M194 80q-22 14-88 20M230 80q10 14 0 20" stroke="#C9D2E0" stroke-width="1.5" fill="none" stroke-dasharray="4 3"/>
    <rect x="24" y="100" width="120" height="46" rx="8" fill="#FFF8E4" stroke="#C0871C" stroke-width="1.6" stroke-dasharray="5 4"/>
    <text x="84" y="118" text-anchor="middle" font-size="12" font-weight="900" fill="#8A5A14">㉠</text>
    <text x="84" y="134" text-anchor="middle" font-size="8" font-weight="700" fill="#8A6A2E">조례를 만들고 예산을 심의</text>
    <rect x="156" y="100" width="120" height="46" rx="8" fill="#FFF8E4" stroke="#C0871C" stroke-width="1.6" stroke-dasharray="5 4"/>
    <text x="216" y="118" text-anchor="middle" font-size="12" font-weight="900" fill="#8A5A14">㉡</text>
    <text x="216" y="134" text-anchor="middle" font-size="8" font-weight="700" fill="#8A6A2E">행정을 처리하고 예산을 집행</text>
    <text x="150" y="158" text-anchor="middle" font-size="9.4" fill="#7E8AA0">우리나라 지방 자치의 짜임</text>`;
  return shell(300, 166, inner, "조직도 — 지방 자치 단체가 광역과 기초로 나뉘고, 두 단체 모두에서 두 개의 빈칸 기관 상자로 점선이 이어짐");
}

/* ---------- L7: 주민 참여 제도 절차도 — 제안이 예산이 되기까지 ---------- */
export function participFlowFig(): string {
  const inner = `
    ${tinyMan(46, 42, { arm: "up", mood: "joy" })}
    <rect x="24" y="74" width="64" height="20" rx="7" fill="#FFFFFF" stroke="#8FA86A" stroke-width="1.5"/>
    <text x="56" y="87.5" text-anchor="middle" font-size="8.4" font-weight="800" fill="#3E5228">주민의 제안</text>
    <path d="M92 84h22" stroke="#8FA86A" stroke-width="2"/><path d="M110 80l7 4-7 4z" fill="#8FA86A"/>
    <rect x="120" y="60" width="64" height="48" rx="8" fill="#FFFFFF" stroke="#8FA86A" stroke-width="1.5"/>
    <text x="152" y="78" text-anchor="middle" font-size="8.4" font-weight="800" fill="#3E5228">주민 투표로</text>
    <text x="152" y="92" text-anchor="middle" font-size="8.4" font-weight="800" fill="#3E5228">우선순위 뽑기</text>
    <path d="M188 84h22" stroke="#8FA86A" stroke-width="2"/><path d="M206 80l7 4-7 4z" fill="#8FA86A"/>
    <rect x="216" y="66" width="66" height="36" rx="8" fill="#EFF4E4" stroke="#5C940D" stroke-width="1.7"/>
    <text x="249" y="81" text-anchor="middle" font-size="8.4" font-weight="800" fill="#3E5228">지역 예산에</text>
    <text x="249" y="94" text-anchor="middle" font-size="8.4" font-weight="800" fill="#3E5228">반영·실행</text>
    <g transform="translate(150 28)"><rect x="-52" y="-12" width="104" height="22" rx="10" fill="#39455C"/><text x="0" y="3" text-anchor="middle" font-size="9" font-weight="800" fill="#FFF">지역 예산의 쓰임 정하기</text></g>
    ${tinyMan(250, 42, { mood: "joy" })}
    <path d="M56 96v18q42 18 96 12" stroke="#C9D2E0" stroke-width="1.4" fill="none" stroke-dasharray="4 4"/>
    <text x="150" y="146" text-anchor="middle" font-size="9.6" fill="#7E8AA0">주민이 예산 결정에 직접 참여하는 길</text>`;
  return shell(300, 156, inner, "흐름도 — 주민의 제안이 투표를 거쳐 지역 예산에 반영되는 세 단계");
}

/* ================= recap 미니아트(64×64 플랫 — socFigures 관례) ================= */

const MA: Record<string, string> = {
  // L1 — 선거의 의미·기능·한 표
  ballot: `<rect x="14" y="28" width="36" height="24" rx="4" fill="#8FBE3A" stroke="#47730A" stroke-width="1.6"/>
    <rect x="24" y="24" width="16" height="4" rx="2" fill="#47730A"/>
    <g transform="rotate(-14 32 16)"><rect x="26" y="9" width="12" height="15" rx="2" fill="#FFFFFF" stroke="#5C940D" stroke-width="1.3"/><circle cx="32" cy="18" r="2.2" fill="none" stroke="#5C940D" stroke-width="1.2"/></g>
    <path d="M20 40h24" stroke="#47730A" stroke-width="1.4" opacity=".5"/>`,
  func4: `${[
    [18, 18],
    [46, 18],
    [18, 46],
    [46, 46],
  ].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="10.5" fill="${["#EFF4E4", "#EAF2FB", "#FFF4E4", "#F6EDFB"][i]}" stroke="${["#5C940D", "#2E8AC0", "#C0871C", "#8A5EC0"][i]}" stroke-width="1.5"/>`).join("")}
    <path d="M14 18h8M42 14l4 5 6-7M14 44l4 4 6-6M42 46h9" stroke="#3C4654" stroke-width="1.7" stroke-linecap="round" fill="none"/>`,
  onevote: `<g transform="rotate(-8 32 30)"><rect x="22" y="18" width="20" height="26" rx="2.6" fill="#FFFFFF" stroke="#5C940D" stroke-width="1.6"/><circle cx="32" cy="30" r="3.4" fill="none" stroke="#C0392E" stroke-width="1.6"/><circle cx="32" cy="30" r="1.2" fill="#C0392E"/></g>
    <path d="M14 12l2 4 4 2-4 2-2 4-2-4-4-2 4-2zM52 14l1.6 3.2 3.2 1.4-3.2 1.4-1.6 3.2-1.6-3.2-3.2-1.4 3.2-1.4z" fill="#F2C24E"/>
    <path d="M18 52q14 6 28 0" stroke="#5C940D" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  // L2 — 원칙 4종
  univeq: `<circle cx="18" cy="20" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <circle cx="32" cy="18" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <circle cx="46" cy="20" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    ${[18, 32, 46].map((x) => `<rect x="${x - 5}" y="32" width="10" height="13" rx="2" fill="#FFFFFF" stroke="#5C940D" stroke-width="1.3"/>`).join("")}
    <path d="M13 52h38" stroke="#5C940D" stroke-width="2" stroke-linecap="round"/>`,
  dirsec: `<path d="M14 14h16v36H14z" fill="#A4CE52" stroke="#47730A" stroke-width="1.6"/>
    <path d="M30 14h4v36h-4z" fill="#7CB024" stroke="#47730A" stroke-width="1.2"/>
    <circle cx="45" cy="26" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <path d="M45 31v9M45 34l-5 5M45 34l5 5" stroke="#3C4654" stroke-width="1.5" stroke-linecap="round"/>
    <g transform="rotate(12 50 48)"><rect x="45" y="44" width="10" height="8" rx="1.6" fill="#FFFFFF" stroke="#5C940D" stroke-width="1.2"/></g>`,
  fairvote: `<rect x="12" y="12" width="40" height="40" rx="7" fill="#EFF4E4" stroke="#5C940D" stroke-width="1.6"/>
    <path d="M22 32l7 7 13-15" stroke="#5C940D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    ${[18, 30, 42].map((x) => `<circle cx="${x + 2}" cy="58" r="2.2" fill="#8FBE3A"/>`).join("")}`,
  // L3 — 과정·유권자·정당
  sixsteps: `${[0, 1, 2, 3, 4, 5].map((i) => {
    const x = 14 + (i % 3) * 18;
    const y = i < 3 ? 20 : 44;
    return `<circle cx="${x}" cy="${y}" r="7" fill="${i === 5 ? "#5C940D" : "#EFF4E4"}" stroke="#5C940D" stroke-width="1.4"/><text x="${x}" y="${y + 3}" text-anchor="middle" font-size="7.4" font-weight="900" fill="${i === 5 ? "#FFF" : "#47730A"}">${i + 1}</text>`;
  }).join("")}
    <path d="M22 20h2M40 20h2M50 26q4 6-2 10M42 44h-2M24 44h-2" stroke="#8FA86A" stroke-width="1.5"/>`,
  voter: `<circle cx="24" cy="20" r="6.4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.7"/>
    <path d="M24 26v12M24 38l-6 9M24 38l6 9M24 30l-8 4M24 30l8 4" stroke="#3C4654" stroke-width="1.7" stroke-linecap="round"/>
    <circle cx="44" cy="34" r="10" fill="none" stroke="#5C940D" stroke-width="2"/>
    <path d="M51 42l6 6" stroke="#5C940D" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M40 33h8M40 37h6" stroke="#8FA86A" stroke-width="1.4"/>`,
  partyrole: `<circle cx="20" cy="18" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <circle cx="34" cy="14" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <circle cx="48" cy="18" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>
    <path d="M12 30q22-8 44 0" stroke="#2E8AC0" stroke-width="1.8" fill="none"/>
    <rect x="22" y="36" width="20" height="14" rx="3" fill="#FFFFFF" stroke="#2E8AC0" stroke-width="1.5"/>
    <path d="M26 41h12M26 45h8" stroke="#9EC2E8" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M46 40l8 8M54 40l-8 8" stroke="#EAF2FB" stroke-width="0"/>`,
  // L4 — 주체·국가기관·세 단체
  actors: `${[
    [16, 16],
    [32, 12],
    [48, 16],
    [16, 40],
    [32, 44],
    [48, 40],
  ].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="6.4" fill="${["#EAF2FB", "#EFF4E4", "#FFF4E4", "#F6EDFB", "#FBEDF3", "#EDF6F8"][i]}" stroke="${["#2E8AC0", "#5C940D", "#C0871C", "#8A5EC0", "#C0508A", "#3E8EA0"][i]}" stroke-width="1.4"/>`).join("")}
    <circle cx="32" cy="28" r="5" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.5"/>`,
  threeorgans: `${[
    ["법", 14],
    ["집", 32],
    ["재", 50],
  ].map(([t, x], i) => `<rect x="${Number(x) - 8}" y="18" width="16" height="26" rx="3" fill="${["#EAF2FB", "#EFF4E4", "#FFF4E4"][i]}" stroke="${["#2E8AC0", "#5C940D", "#C0871C"][i]}" stroke-width="1.5"/><text x="${x}" y="35" text-anchor="middle" font-size="9" font-weight="900" fill="#39455C">${t}</text>`).join("")}
    <path d="M8 52h48" stroke="#8A93A6" stroke-width="2" stroke-linecap="round"/>`,
  groupcompare: `<circle cx="22" cy="26" r="13" fill="#EFF4E4" stroke="#2E8A4C" stroke-width="1.6" opacity=".9"/>
    <circle cx="42" cy="26" r="13" fill="#FFF4E4" stroke="#C0871C" stroke-width="1.6" opacity=".9"/>
    <text x="18" y="30" text-anchor="middle" font-size="8.6" font-weight="900" fill="#237040">공</text>
    <text x="46" y="30" text-anchor="middle" font-size="8.6" font-weight="900" fill="#8A5A14">이</text>
    <path d="M14 50h36" stroke="#8A93A6" stroke-width="1.8" stroke-linecap="round"/>`,
  // L5 — 정치과정
  procmean: `${[14, 32, 50].map((x) => `<path d="M${x - 4} 14q4-4 8 0" stroke="#3C4654" stroke-width="1.5" fill="none"/>`).join("")}
    <path d="M18 22q14 8 28 0" stroke="#8A93A6" stroke-width="1.5" fill="none" stroke-dasharray="3 3"/>
    <rect x="20" y="30" width="24" height="16" rx="3" fill="#FFFFFF" stroke="#5C940D" stroke-width="1.5"/>
    <path d="M25 36h14M25 41h10" stroke="#8FA86A" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M32 46v8M28 50l4 5 4-5" stroke="#5C940D" stroke-width="1.7" fill="none" stroke-linecap="round"/>`,
  fivesteps: `${[0, 1, 2, 3, 4].map((i) => {
    const x = 12 + i * 10;
    return `<circle cx="${x}" cy="${26 + (i % 2) * 8}" r="4.4" fill="${i === 4 ? "#5C940D" : "#EFF4E4"}" stroke="#5C940D" stroke-width="1.3"/>`;
  }).join("")}
    <path d="M12 44q20 12 40 0" stroke="#8FA86A" stroke-width="1.6" fill="none"/>
    <text x="32" y="58" text-anchor="middle" font-size="8" font-weight="800" fill="#47730A">1→5</text>`,
  feedback: `<path d="M46 18a18 18 0 1 0 6 14" stroke="#5C940D" stroke-width="2.4" fill="none"/>
    <path d="M46 12l8 8-11 2z" fill="#5C940D"/>
    <circle cx="32" cy="32" r="6" fill="#EFF4E4" stroke="#47730A" stroke-width="1.4"/>`,
  // L6 — 지방 자치
  grassroot: `<path d="M12 44q20-6 40 0v6q-20 5-40 0z" fill="#B88848" stroke="#6E4E26" stroke-width="1.4"/>
    <path d="M32 44V30" stroke="#5C940D" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M32 33q-9-1-11-10 9-1 11 7zM32 30q9-2 11-10-9-1-11 7z" fill="#8FBE3A" stroke="#47730A" stroke-width="1.3"/>
    <path d="M22 50v4M42 50v4M32 52v5" stroke="#B99B66" stroke-width="1.3" stroke-linecap="round"/>`,
  localorg: `<rect x="18" y="10" width="28" height="12" rx="4" fill="#5C940D"/>
    <path d="M32 22v6M20 28h24M20 28v6M44 28v6" stroke="#8FA86A" stroke-width="1.5" fill="none"/>
    <rect x="10" y="34" width="20" height="18" rx="3.6" fill="#EFF4E4" stroke="#5C940D" stroke-width="1.4"/>
    <rect x="34" y="34" width="20" height="18" rx="3.6" fill="#FFF4E4" stroke="#C0871C" stroke-width="1.4"/>`,
  counciltask: `<rect x="10" y="16" width="20" height="26" rx="3" fill="#FFFFFF" stroke="#5C940D" stroke-width="1.5"/>
    <path d="M14 23h12M14 29h12M14 35h8" stroke="#8FA86A" stroke-width="1.4" stroke-linecap="round"/>
    <g transform="rotate(-24 44 28)"><rect x="36" y="24" width="16" height="7" rx="3" fill="#A87838" stroke="#6E4E26" stroke-width="1.2"/><rect x="42" y="31" width="3.4" height="11" rx="1.7" fill="#C89A5E" stroke="#6E4E26" stroke-width="1"/></g>
    <path d="M14 52h36" stroke="#8A93A6" stroke-width="1.8" stroke-linecap="round"/>`,
  // L7 — 참여
  fourways: `${[
    [17, 17],
    [47, 17],
    [17, 47],
    [47, 47],
  ].map(([x, y], i) => `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="5" fill="${["#EFF4E4", "#EAF2FB", "#FFF4E4", "#F6EDFB"][i]}" stroke="${["#5C940D", "#2E8AC0", "#C0871C", "#8A5EC0"][i]}" stroke-width="1.4"/>`).join("")}
    <path d="M13 17l3 3 5-6M43 14v6M40 17h6M13 46l8 1M43 44l3 3 5-6" stroke="#3C4654" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,
  morepart: `<rect x="12" y="20" width="24" height="30" rx="3" fill="#FFFFFF" stroke="#5C940D" stroke-width="1.5"/>
    <path d="M17 28h14M17 34h14M17 40h9" stroke="#8FA86A" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M40 26q8 0 10 8-8 2-10-8z" fill="#8FBE3A" stroke="#47730A" stroke-width="1.2"/>
    <circle cx="46" cy="46" r="7" fill="#EFF4E4" stroke="#5C940D" stroke-width="1.4"/>
    <path d="M43 46l2.4 2.6 4-4.8" stroke="#47730A" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  activecit: `<circle cx="32" cy="18" r="6.4" fill="#F6EFE4" stroke="#3C4654" stroke-width="1.7"/>
    <path d="M32 24v13M32 37l-7 10M32 37l7 10M32 28l-9-6M32 28l9 5" stroke="#3C4654" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M20 10l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#F2C24E"/>
    <path d="M12 56q20 8 40 0" stroke="#5C940D" stroke-width="2" stroke-linecap="round" fill="none"/>`,
};

/** recap 카드 미니아트 — 64×64 플랫(soc 관례) */
export function soc10MiniArt(key: string): string {
  const body = MA[key] ?? `<circle cx="32" cy="32" r="16" fill="#EFF4E4" stroke="#5C940D" stroke-width="2"/>`;
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">${body}</svg>`;
}
