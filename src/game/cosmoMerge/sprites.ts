// 코스모 머지 — 천체 11종 절차적 스프라이트 페인터.
// NASA 실사(public/textures/ — jupiter·moon·mars 등)를 눈으로 대조해 색·지형 배치를 잡았다:
//   달 = 북반구 바다(어두운 현무암) 군집 + 티코 광조, 화성 = 녹슨 주황 + 시르티스 검갈 얼룩 + 흰 극관,
//   목성 = 크림 존 + 녹슨 주황 벨트(물결 경계) + 대적점 + 회녹색 극지, 명왕성 = 스푸트니크 하트 등.
// 실제 비율(태양=달의 400배)은 게임이 안 되므로 반경은 게임 스케일 — 단 "크기 순서"는 실제 그대로다
// (달<수성<화성<금성<지구<토성<목성<태양, 명왕성<달). 광원은 좌상단 고정(파운드리 키라이트 문법).
// 베이크: 티어×해상도별 오프스크린 캐시 — 반경이 상수 튜닝으로 바뀌어도 그림은 자동 추종한다.

export interface CmxTier {
  id: string;
  name: string;
  /** 물리 반경(논리 px, 보드 360 기준) — 수박게임 반경 커브 이식. */
  r: number;
  /** 첫 합성 토스트에 붙는 한 줄 과학 사실(짧게 — 토스트 한 줄). */
  fact: string;
  /** 합체 파티클·링 색. */
  glow: string;
}

export const TIERS: CmxTier[] = [
  { id: "dust", name: "우주먼지", r: 9, fact: "모든 천체의 시작이에요", glow: "#9FD4FF" },
  { id: "aster", name: "소행성", r: 13, fact: "먼지가 뭉친 우주 돌덩이", glow: "#C9B8A6" },
  { id: "pluto", name: "명왕성", r: 18, fact: "달보다 작은 왜소행성", glow: "#E8C9A2" },
  { id: "moon", name: "달", r: 23, fact: "지구의 하나뿐인 위성", glow: "#D8D4CC" },
  { id: "mercury", name: "수성", r: 29, fact: "태양과 가장 가까운 행성", glow: "#C4B4A2" },
  { id: "mars", name: "화성", r: 36, fact: "지구 절반 크기의 붉은 행성", glow: "#F08A54" },
  { id: "venus", name: "금성", r: 44, fact: "지구와 크기가 쌍둥이", glow: "#F2DFA4" },
  { id: "earth", name: "지구", r: 53, fact: "물과 생명의 푸른 행성", glow: "#7FC4FF" },
  { id: "saturn", name: "토성", r: 64, fact: "얼음 고리를 두른 행성", glow: "#F0DFAC" },
  { id: "jupiter", name: "목성", r: 77, fact: "태양계에서 가장 큰 행성", glow: "#F0C088" },
  { id: "sun", name: "태양", r: 92, fact: "드디어 별! 스스로 빛나요", glow: "#FFD24A" },
];

/** 드롭으로 주어지는 앞 5티어(수박게임과 동일한 구성). */
export const DROP_TIERS = 5;

/** 베이크 캔버스 반경 배수 — 고리(토성)·코로나(태양)·대기 글로우가 몸통 밖으로 나간다. */
const EXTK = [1.6, 1.12, 1.12, 1.12, 1.12, 1.2, 1.16, 1.3, 1.92, 1.14, 1.72];

export function tierExt(tier: number): number {
  return EXTK[tier];
}

/** mulberry32 — 티어별 고정 시드라 같은 천체는 언제나 같은 무늬다. */
function rngOf(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── 공용 페인트 도구(광원 좌상단 고정) ─────────────────────────
type Ctx = CanvasRenderingContext2D;

function clipBall(ctx: Ctx, R: number): void {
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.clip();
}

/** 구체 베이스 — 좌상단 하이라이트 중심의 3스톱 라디얼(근-동조 그라데이션 문법). */
function ball(ctx: Ctx, R: number, hi: string, mid: string, lo: string): void {
  const g = ctx.createRadialGradient(-R * 0.38, -R * 0.38, R * 0.1, 0, 0, R * 1.12);
  g.addColorStop(0, hi);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, lo);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
}

/** 명암 경계 — 우하단으로 갈수록 어두워지는 터미네이터. */
function terminator(ctx: Ctx, R: number, a: number): void {
  const g = ctx.createRadialGradient(-R * 0.42, -R * 0.42, R * 0.35, -R * 0.1, -R * 0.1, R * 1.65);
  g.addColorStop(0, "rgba(6,10,22,0)");
  g.addColorStop(0.62, "rgba(6,10,22,0)");
  g.addColorStop(1, `rgba(6,10,22,${a})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
}

/** 좌상단 림 하이라이트. */
function rim(ctx: Ctx, R: number, color: string, a: number): void {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, R * 0.05);
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.94, Math.PI * 0.82, Math.PI * 1.62);
  ctx.stroke();
  ctx.restore();
}

/** 점묘 노이즈 — 표면 질감. */
function speckle(ctx: Ctx, R: number, rng: () => number, n: number, color: string, aMax: number, rMax: number): void {
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng()) * R * 0.94;
    ctx.globalAlpha = 0.25 * aMax + rng() * 0.75 * aMax;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, Math.max(0.6, rng() * rMax), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** 크레이터 — 접시(어둠) + 좌상단 안그림자 + 우하단 밝은 턱. */
function crater(ctx: Ctx, x: number, y: number, cr: number, dark: string, lite: string): void {
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(x, y, cr, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.38;
  ctx.strokeStyle = dark;
  ctx.lineWidth = cr * 0.34;
  ctx.beginPath();
  ctx.arc(x, y, cr * 0.72, Math.PI * 0.72, Math.PI * 1.8);
  ctx.stroke();
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = lite;
  ctx.lineWidth = cr * 0.24;
  ctx.beginPath();
  ctx.arc(x, y, cr * 0.9, -Math.PI * 0.2, Math.PI * 0.55);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** 부드러운 얼룩(바다·지형) — 중심 진하고 가장자리 투명한 2패스 블롭. */
function patch(ctx: Ctx, x: number, y: number, rx: number, ry: number, rot: number, color: string, a: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = a * 0.55;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = a * 0.7;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 0.66, ry * 0.66, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** 위아래 경계가 물결치는 위도 밴드(목성 벨트) — 경계 난류가 실사의 인상을 만든다. */
function wavyBand(ctx: Ctx, R: number, y0: number, y1: number, color: string, a: number, rng: () => number): void {
  const amp = R * 0.028;
  const f1 = 2 + rng() * 2;
  const f2 = 2 + rng() * 2;
  const p1 = rng() * Math.PI * 2;
  const p2 = rng() * Math.PI * 2;
  ctx.globalAlpha = a;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const x = -R + (i / 24) * 2 * R;
    const y = y0 * R + Math.sin((x / R) * f1 + p1) * amp;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = 24; i >= 0; i--) {
    const x = -R + (i / 24) * 2 * R;
    ctx.lineTo(x, y1 * R + Math.sin((x / R) * f2 + p2) * amp);
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ── 천체별 페인터 ──────────────────────────────────────────────
function paintDust(ctx: Ctx, R: number, rng: () => number): void {
  // 성운 티끌 — 푸른 글로우에 감싸인 불규칙 알갱이 뭉치
  const g = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.55);
  g.addColorStop(0, "rgba(150,200,255,0.5)");
  g.addColorStop(0.55, "rgba(110,160,230,0.18)");
  g.addColorStop(1, "rgba(90,140,220,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.55, 0, Math.PI * 2);
  ctx.fill();
  const blobs: Array<[number, number, number, string]> = [
    [-R * 0.3, -R * 0.22, R * 0.52, "#8FA6C6"],
    [R * 0.3, -R * 0.05, R * 0.48, "#7488AA"],
    [-R * 0.02, R * 0.32, R * 0.5, "#9DB2D2"],
    [R * 0.05, -R * 0.05, R * 0.42, "#C3D3EC"],
  ];
  for (const [x, y, r, c] of blobs) {
    const bg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    bg.addColorStop(0, c);
    bg.addColorStop(1, "rgba(90,110,150,0)");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  speckle(ctx, R * 0.9, rng, 14, "#3E4E6E", 0.5, R * 0.07);
  // 반짝이 티끌
  ctx.fillStyle = "#FFFFFF";
  for (let i = 0; i < 6; i++) {
    const a = rng() * Math.PI * 2;
    const d = rng() * R * 0.85;
    ctx.globalAlpha = 0.5 + rng() * 0.5;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, R * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function paintAster(ctx: Ctx, R: number, rng: () => number): void {
  // 울퉁불퉁한 감자꼴 암석(충돌원 안쪽으로 요철) — 크레이터 2~3개
  ctx.save();
  ctx.beginPath();
  const pts = 11;
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const rr = R * (0.84 + rng() * 0.14);
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R * 1.05);
  g.addColorStop(0, "#A79684");
  g.addColorStop(0.55, "#77685A");
  g.addColorStop(1, "#453A30");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.clip();
  crater(ctx, -R * 0.22, R * 0.18, R * 0.3, "#2E2118", "#D9CBB8");
  crater(ctx, R * 0.32, -R * 0.2, R * 0.22, "#2E2118", "#D9CBB8");
  crater(ctx, R * 0.1, R * 0.52, R * 0.16, "#2E2118", "#D9CBB8");
  speckle(ctx, R, rng, 26, "#2C2118", 0.4, R * 0.05);
  speckle(ctx, R, rng, 14, "#C9BBA6", 0.3, R * 0.04);
  terminator(ctx, R * 1.02, 0.5);
  ctx.restore();
}

function paintPluto(ctx: Ctx, R: number, rng: () => number): void {
  // 뉴허라이즌스의 명왕성 — 황갈색 몸 + 스푸트니크 평원(하얀 하트) + 크툴루 검붉은 띠
  ctx.save();
  clipBall(ctx, R);
  ball(ctx, R, "#EBCFA6", "#C79E6C", "#8A5C38");
  for (let i = 0; i < 6; i++) {
    patch(ctx, (rng() * 1.5 - 0.75) * R, (rng() * 1.5 - 0.75) * R, R * (0.14 + rng() * 0.2), R * (0.1 + rng() * 0.14), rng() * 3, "#7A4A2E", 0.14);
  }
  // 크툴루 마쿨라 — 왼쪽 적도를 따라 검붉은 고래 등
  patch(ctx, -R * 0.62, R * 0.1, R * 0.42, R * 0.26, 0.18, "#5C3222", 0.6);
  patch(ctx, -R * 0.86, R * 0.02, R * 0.3, R * 0.2, -0.1, "#4E2A1C", 0.5);
  // 스푸트니크 평원 — 두 갈래 하트(오른쪽 아래), 얼음 평원이라 가장 밝다
  ctx.save();
  ctx.translate(R * 0.24, R * 0.12);
  ctx.rotate(-0.12);
  ctx.scale(1.22, 1.22);
  ctx.beginPath();
  ctx.moveTo(0, R * 0.42);
  ctx.bezierCurveTo(-R * 0.34, R * 0.16, -R * 0.32, -R * 0.18, -R * 0.08, -R * 0.2);
  ctx.bezierCurveTo(R * 0.02, -R * 0.21, R * 0.08, -R * 0.16, R * 0.1, -R * 0.1);
  ctx.bezierCurveTo(R * 0.14, -R * 0.2, R * 0.22, -R * 0.26, R * 0.32, -R * 0.22);
  ctx.bezierCurveTo(R * 0.5, -R * 0.14, R * 0.42, R * 0.14, 0, R * 0.42);
  ctx.closePath();
  const hg = ctx.createRadialGradient(-R * 0.06, -R * 0.08, R * 0.05, 0.04 * R, 0.06 * R, R * 0.52);
  hg.addColorStop(0, "#F7F1E4");
  hg.addColorStop(0.7, "#EDE2CC");
  hg.addColorStop(1, "#D9C7A8");
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.restore();
  speckle(ctx, R, rng, 20, "#6E4326", 0.22, R * 0.045);
  terminator(ctx, R, 0.5);
  ctx.restore();
  rim(ctx, R, "#FFE9C4", 0.35);
}

function paintMoon(ctx: Ctx, R: number, rng: () => number): void {
  // NASA 달 텍스처 대조 — 바다(어두운 현무암)는 북반구에 몰려 있고, 남쪽 티코가 흰 광조를 뿌린다
  ctx.save();
  clipBall(ctx, R);
  ball(ctx, R, "#D8D4CB", "#B9B5AC", "#83807A");
  const seas: Array<[number, number, number, number, number]> = [
    [-R * 0.32, -R * 0.34, R * 0.3, R * 0.26, 0.2], // 비의 바다
    [R * 0.04, -R * 0.32, R * 0.22, R * 0.2, -0.1], // 맑음의 바다
    [R * 0.26, -R * 0.1, R * 0.2, R * 0.17, 0.4], // 고요의 바다
    [-R * 0.55, -R * 0.02, R * 0.24, R * 0.18, -0.3], // 폭풍의 대양
    [R * 0.55, -R * 0.3, R * 0.11, R * 0.09, 0], // 위난의 바다(외딴 점)
    [R * 0.12, R * 0.14, R * 0.14, R * 0.1, 0.2],
  ];
  for (const [x, y, rx, ry, rot] of seas) {
    patch(ctx, x, y, rx, ry, rot, "#6E6C68", 0.78);
    patch(ctx, x + rx * 0.15, y + ry * 0.15, rx * 0.6, ry * 0.6, rot, "#585755", 0.5);
  }
  for (let i = 0; i < 7; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng()) * R * 0.8;
    crater(ctx, Math.cos(a) * d, Math.sin(a) * d, R * (0.045 + rng() * 0.06), "#5E5C58", "#EDEAE2");
  }
  // 티코 — 남쪽 밝은 크레이터 + 광조
  const tx = -R * 0.08;
  const ty = R * 0.6;
  ctx.strokeStyle = "#F4F1E9";
  ctx.lineWidth = R * 0.03;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.46 + rng() * 0.2;
    ctx.globalAlpha = 0.24 + rng() * 0.12;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - Math.cos(a + Math.PI) * R * (0.5 + rng() * 0.5), ty - Math.sin(a + Math.PI) * R * (0.5 + rng() * 0.5));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#F2EFE8";
  ctx.beginPath();
  ctx.arc(tx, ty, R * 0.07, 0, Math.PI * 2);
  ctx.fill();
  crater(ctx, tx, ty, R * 0.07, "#8A8880", "#FFFFFF");
  speckle(ctx, R, rng, 40, "#6E6C68", 0.25, R * 0.035);
  speckle(ctx, R, rng, 24, "#EAE7DF", 0.25, R * 0.03);
  terminator(ctx, R, 0.52);
  ctx.restore();
  rim(ctx, R, "#FFFFFF", 0.3);
}

function paintMercury(ctx: Ctx, R: number, rng: () => number): void {
  // 달보다 갈색기 도는 잿빛 + 훨씬 촘촘한 크레이터, 칼로리스 분지(밝은 원)
  ctx.save();
  clipBall(ctx, R);
  ball(ctx, R, "#C3B3A2", "#9C8D7E", "#645A50");
  patch(ctx, R * 0.3, -R * 0.26, R * 0.34, R * 0.3, 0, "#D8C6AE", 0.22); // 칼로리스 분지
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = "#D8C6AE";
  ctx.lineWidth = R * 0.03;
  ctx.beginPath();
  ctx.arc(R * 0.3, -R * 0.26, R * 0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  for (let i = 0; i < 13; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng()) * R * 0.85;
    crater(ctx, Math.cos(a) * d, Math.sin(a) * d, R * (0.04 + rng() * 0.075), "#453C33", "#E4D6C2");
  }
  speckle(ctx, R, rng, 60, "#4E463D", 0.3, R * 0.032);
  speckle(ctx, R, rng, 30, "#DCCDB9", 0.24, R * 0.026);
  terminator(ctx, R, 0.58); // 대기가 없어 명암이 칼같이 어둡다
  ctx.restore();
}

function paintMars(ctx: Ctx, R: number, rng: () => number): void {
  // NASA 화성 텍스처 대조 — 녹슨 주황, 시르티스 검갈 웨지, 흐릿한 협곡, 림에 붙은 부드러운 극관.
  // 주의: 어두운 얼룩 2개 + 가로 협곡이 대칭으로 놓이면 "감은 눈+입" 얼굴로 읽힌다(1차 도감 실사고)
  // — 얼룩은 비대칭 사선 웨지 하나 중심으로, 협곡은 가늘고 비스듬하게.
  ctx.save();
  clipBall(ctx, R);
  ball(ctx, R, "#E4763C", "#C2542A", "#8A3A1C");
  // 시르티스 대지 — 오른쪽으로 쏠린 큰 사선 웨지(단일 주인공)
  patch(ctx, R * 0.3, -R * 0.06, R * 0.42, R * 0.2, 0.45, "#6E3522", 0.5);
  patch(ctx, R * 0.12, R * 0.18, R * 0.3, R * 0.14, 0.2, "#7A3A24", 0.38);
  // 남반구 고지 어스름 + 북쪽 아키달리아(전부 비대칭 배치)
  patch(ctx, -R * 0.34, R * 0.42, R * 0.3, R * 0.15, -0.2, "#8A4326", 0.34);
  patch(ctx, -R * 0.22, -R * 0.52, R * 0.28, R * 0.12, 0.15, "#9C4A28", 0.3);
  // 밝은 고원(타르시스·아라비아 테라)
  patch(ctx, -R * 0.4, -R * 0.12, R * 0.28, R * 0.22, 0.2, "#E08544", 0.4);
  patch(ctx, R * 0.12, R * 0.56, R * 0.3, R * 0.15, 0, "#D9773E", 0.32);
  // 매리너 협곡 — 가는 이중 획, 비스듬(입처럼 안 보이게)
  ctx.strokeStyle = "#7A3418";
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = R * 0.026;
  ctx.beginPath();
  ctx.moveTo(-R * 0.5, R * 0.06);
  ctx.quadraticCurveTo(-R * 0.24, R * 0.14, -R * 0.02, R * 0.12);
  ctx.stroke();
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = R * 0.016;
  ctx.beginPath();
  ctx.moveTo(-R * 0.44, R * 0.12);
  ctx.quadraticCurveTo(-R * 0.22, R * 0.18, -R * 0.06, R * 0.16);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // 올림푸스 화산 — 좌상단 옅은 점 하나
  patch(ctx, -R * 0.5, -R * 0.32, R * 0.09, R * 0.075, 0, "#EFA26B", 0.45);
  // 남반구 크레이터 몇 개(고지 질감)
  crater(ctx, R * 0.4, R * 0.4, R * 0.06, "#5C2B16", "#E8935C");
  crater(ctx, -R * 0.12, R * 0.32, R * 0.045, "#5C2B16", "#E8935C");
  crater(ctx, R * 0.58, R * 0.14, R * 0.04, "#5C2B16", "#E8935C");
  // 극관 — 림을 감싸는 부드러운 모자(붕 뜬 붕대 금지: 중심을 림 밖에 두고 그라데이션 페이드)
  const capN = ctx.createRadialGradient(0, -R * 1.06, R * 0.05, 0, -R * 1.06, R * 0.55);
  capN.addColorStop(0, "rgba(247,242,230,0.98)");
  capN.addColorStop(0.7, "rgba(247,242,230,0.85)");
  capN.addColorStop(1, "rgba(247,242,230,0)");
  ctx.fillStyle = capN;
  ctx.beginPath();
  ctx.arc(0, -R * 1.06, R * 0.55, 0, Math.PI * 2);
  ctx.fill();
  const capS = ctx.createRadialGradient(R * 0.06, R * 1.08, R * 0.04, R * 0.06, R * 1.08, R * 0.4);
  capS.addColorStop(0, "rgba(247,242,230,0.9)");
  capS.addColorStop(1, "rgba(247,242,230,0)");
  ctx.fillStyle = capS;
  ctx.beginPath();
  ctx.arc(R * 0.06, R * 1.08, R * 0.4, 0, Math.PI * 2);
  ctx.fill();
  speckle(ctx, R, rng, 44, "#7A3418", 0.22, R * 0.04);
  speckle(ctx, R, rng, 22, "#F0975C", 0.18, R * 0.035);
  terminator(ctx, R, 0.5);
  ctx.restore();
  rim(ctx, R, "#FFB27A", 0.3); // 얇은 대기의 주황 테
}

function paintVenus(ctx: Ctx, R: number, rng: () => number): void {
  // 두꺼운 황산 구름 — 가시광 금성은 거의 민무늬 진주빛(실사 부합). 줄무늬는 아주 은은하게만 —
  // 진하면 미니 크기에서 목성과 헷갈린다("목성 다음 지구야?" 실사용 피드백). 미니는 완전 민무늬.
  // 문턱 R<20은 기기 픽셀 기준 — 체인 아이콘은 rDisp 8~9 × dpr 2 = 16~18px로 베이크된다.
  ctx.save();
  clipBall(ctx, R);
  ball(ctx, R, "#F7ECC8", "#E6D29C", "#B69460");
  if (R >= 20) {
    ctx.lineCap = "round";
    const bands: Array<[number, number, string, number]> = [
      [-0.52, 0.34, "#C9A96A", 0.13],
      [-0.2, 0.3, "#F9F0D8", 0.2],
      [0.08, 0.36, "#C4A363", 0.13],
      [0.4, 0.3, "#F4EAC8", 0.16],
      [0.66, 0.26, "#BE9C5C", 0.11],
    ];
    for (const [yy, w, c, a] of bands) {
      ctx.globalAlpha = a;
      ctx.strokeStyle = c;
      ctx.lineWidth = R * w * 0.5;
      ctx.beginPath();
      // 왼쪽 아래에서 오른쪽 위로 쓸려 올라가는 완만한 호(자전 방향의 초고속 바람)
      ctx.moveTo(-R * 1.05, R * (yy + 0.24));
      ctx.bezierCurveTo(-R * 0.3, R * (yy + 0.1 + rng() * 0.06), R * 0.3, R * (yy - 0.12), R * 1.05, R * (yy - 0.22));
      ctx.stroke();
    }
    // 중앙의 V(옆으로 누운 Y 무늬의 절반) — 금성 자외선 사진의 인상, 흔적만
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#B28E50";
    ctx.lineWidth = R * 0.1;
    ctx.beginPath();
    ctx.moveTo(-R * 0.9, -R * 0.34);
    ctx.quadraticCurveTo(R * 0.1, -R * 0.05, -R * 0.85, R * 0.4);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  terminator(ctx, R, 0.42); // 구름이 빛을 산란해 명암이 순하다
  ctx.restore();
  rim(ctx, R, "#FFF8DE", 0.5);
}

function paintEarth(ctx: Ctx, R: number, rng: () => number): void {
  // 블루 마블(아프리카·유럽 구도) — 바다·대륙·구름·빙원·대기 글로우.
  // 1차 도감 실사고: 대륙이 초록 물방울 하나 + 빙원이 흰 막대로 떠 보임 → 실루엣 굴곡(서아프리카
  // 불룩·아프리카의 뿔·남쪽 테이퍼)과 림을 감싸는 그라데이션 빙원으로 재작업.
  ctx.save();
  clipBall(ctx, R);
  ball(ctx, R, "#5EA0E8", "#2E6AC4", "#153C86");
  // 아프리카 — 서쪽 불룩 + 기니만 홈 + 뿔 + 남쪽 테이퍼(실제 실루엣의 4특징)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-R * 0.12, -R * 0.36); // 북서 모서리(모로코)
  ctx.bezierCurveTo(R * 0.08, -R * 0.44, R * 0.24, -R * 0.34, R * 0.26, -R * 0.16); // 지중해 연안→이집트
  ctx.bezierCurveTo(R * 0.27, -R * 0.08, R * 0.33, -R * 0.02, R * 0.38, R * 0.0); // 아프리카의 뿔(동쪽 돌출)
  ctx.bezierCurveTo(R * 0.3, R * 0.06, R * 0.24, R * 0.1, R * 0.2, R * 0.2); // 케냐 해안 안쪽
  ctx.bezierCurveTo(R * 0.16, R * 0.34, R * 0.1, R * 0.48, R * 0.0, R * 0.54); // 남쪽 테이퍼(희망봉)
  ctx.bezierCurveTo(-R * 0.08, R * 0.5, -R * 0.1, R * 0.38, -R * 0.08, R * 0.26); // 남서 해안
  ctx.bezierCurveTo(-R * 0.06, R * 0.16, -R * 0.1, R * 0.12, -R * 0.2, R * 0.08); // 기니만 홈(안쪽 파임)
  ctx.bezierCurveTo(-R * 0.32, R * 0.04, -R * 0.34, -R * 0.06, -R * 0.28, -R * 0.16); // 서아프리카 불룩
  ctx.bezierCurveTo(-R * 0.24, -R * 0.26, -R * 0.2, -R * 0.32, -R * 0.12, -R * 0.36);
  ctx.closePath();
  const ag = ctx.createLinearGradient(0, -R * 0.44, 0, R * 0.54);
  ag.addColorStop(0, "#C9A55E"); // 사하라
  ag.addColorStop(0.36, "#B09A52");
  ag.addColorStop(0.6, "#5D9147"); // 열대 초록
  ag.addColorStop(1, "#6FA055");
  ctx.fillStyle = ag;
  ctx.fill();
  // 사헬 경계 살짝 어둡게(사막↔초원 전이)
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#7A6A38";
  ctx.beginPath();
  ctx.ellipse(0, -R * 0.1, R * 0.26, R * 0.06, 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
  // 유럽(이베리아·본토 조각)·아라비아·마다가스카르·남미 동해안 힌트
  patch(ctx, -R * 0.14, -R * 0.5, R * 0.07, R * 0.045, 0.4, "#6F9B52", 0.9);
  patch(ctx, R * 0.0, -R * 0.54, R * 0.12, R * 0.055, 0.15, "#6F9B52", 0.85);
  patch(ctx, R * 0.34, -R * 0.2, R * 0.1, R * 0.08, -0.55, "#C2A15C", 0.95);
  patch(ctx, R * 0.32, R * 0.3, R * 0.035, R * 0.07, 0.3, "#5D9147", 0.9);
  patch(ctx, -R * 0.76, R * 0.14, R * 0.12, R * 0.18, 0.15, "#5D9147", 0.75);
  // 빙원 — 림을 감싸는 그라데이션 모자(막대 금지 — 화성 극관과 같은 문법)
  const capN = ctx.createRadialGradient(-R * 0.06, -R * 1.05, R * 0.05, -R * 0.06, -R * 1.05, R * 0.52);
  capN.addColorStop(0, "rgba(246,250,253,0.95)");
  capN.addColorStop(0.72, "rgba(246,250,253,0.8)");
  capN.addColorStop(1, "rgba(246,250,253,0)");
  ctx.fillStyle = capN;
  ctx.beginPath();
  ctx.arc(-R * 0.06, -R * 1.05, R * 0.52, 0, Math.PI * 2);
  ctx.fill();
  const capS = ctx.createRadialGradient(0, R * 1.06, R * 0.04, 0, R * 1.06, R * 0.42);
  capS.addColorStop(0, "rgba(246,250,253,0.9)");
  capS.addColorStop(1, "rgba(246,250,253,0)");
  ctx.fillStyle = capS;
  ctx.beginPath();
  ctx.arc(0, R * 1.06, R * 0.42, 0, Math.PI * 2);
  ctx.fill();
  // 구름 — 가는 스트릭 여러 가닥(대륙을 가리지 않게 바다 위주) + 소용돌이 하나
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineCap = "round";
  const clouds: Array<[number, number, number, number, number]> = [
    [-R * 0.62, -R * 0.24, R * 0.34, -0.3, 0.055],
    [R * 0.34, R * 0.14, R * 0.4, 0.42, 0.05],
    [-R * 0.42, R * 0.5, R * 0.36, 0.1, 0.05],
    [R * 0.06, -R * 0.66, R * 0.34, -0.12, 0.045],
    [R * 0.5, -R * 0.44, R * 0.3, 0.2, 0.04],
  ];
  for (const [x, y, len, tilt, w] of clouds) {
    ctx.globalAlpha = 0.42 + rng() * 0.18;
    ctx.lineWidth = R * w;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.5, y + tilt * R - R * 0.08, x + len, y + tilt * R);
    ctx.stroke();
  }
  // 태풍 소용돌이(남대서양)
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = R * 0.04;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2.3; a += 0.22) {
    const rr = R * 0.025 + a * R * 0.03;
    const x = -R * 0.4 + Math.cos(a + 1.2) * rr;
    const y = R * 0.3 + Math.sin(a + 1.2) * rr * 0.82;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  terminator(ctx, R, 0.46);
  ctx.restore();
  // 대기 글로우 — 몸 밖 하늘색 링(파운드리 근-동조)
  ctx.save();
  const atm = ctx.createRadialGradient(0, 0, R * 0.94, 0, 0, R * 1.26);
  atm.addColorStop(0, "rgba(140,206,255,0)");
  atm.addColorStop(0.35, "rgba(140,206,255,0.4)");
  atm.addColorStop(1, "rgba(120,190,255,0)");
  ctx.fillStyle = atm;
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  rim(ctx, R, "#E8F4FF", 0.5);
}

function paintSaturnGlobe(ctx: Ctx, R: number, rng: () => number): void {
  ctx.save();
  clipBall(ctx, R);
  ball(ctx, R, "#F3E4B4", "#E0CA90", "#B79A62");
  const bands: Array<[number, number, string, number]> = [
    [-0.72, -0.55, "#C3A468", 0.3],
    [-0.42, -0.28, "#F8EFCC", 0.4],
    [-0.16, 0.0, "#CFB176", 0.3],
    [0.1, 0.3, "#F4E8C2", 0.36],
    [0.44, 0.6, "#C3A468", 0.3],
    [0.72, 0.9, "#A98C54", 0.28],
  ];
  for (const [y0, y1, c, a] of bands) wavyBand(ctx, R, y0, y1, c, a, rng);
  patch(ctx, 0, -R * 0.86, R * 0.5, R * 0.16, 0, "#B29050", 0.35); // 북극 육각 폭풍의 어스름
  terminator(ctx, R, 0.44);
  ctx.restore();
  rim(ctx, R, "#FFF6D8", 0.4);
}

/** 토성 고리 — B·A 고리와 카시니 간극, 앞쪽 절반은 본체를 가린다. */
function paintSaturn(ctx: Ctx, R: number, rng: () => number): void {
  const TILT = -0.42;
  const SQUASH = 0.34;
  const ringAnnulus = (r0: number, r1: number, color: string, a: number): void => {
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r1, 0, Math.PI * 2);
    ctx.arc(0, 0, r0, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  const drawRings = (): void => {
    ringAnnulus(R * 1.22, R * 1.4, "#AE9468", 0.4); // C 고리(어두운 안쪽)
    ringAnnulus(R * 1.4, R * 1.6, "#EBD9A8", 0.85); // B 고리(가장 밝다)
    // 카시니 간극(1.6~1.65)은 비워 둔다
    ringAnnulus(R * 1.65, R * 1.86, "#D6C08A", 0.6); // A 고리
    ringAnnulus(R * 1.77, R * 1.79, "#8A744A", 0.4); // 엥케 간극 힌트
  };
  // 1) 뒤쪽 고리 전체
  ctx.save();
  ctx.rotate(TILT);
  ctx.scale(1, SQUASH);
  drawRings();
  ctx.restore();
  // 2) 본체
  paintSaturnGlobe(ctx, R, rng);
  // 3) 본체에 드리운 고리 그림자(위쪽 반) — 본체 클립 안에서만
  ctx.save();
  clipBall(ctx, R * 0.995);
  ctx.rotate(TILT);
  ctx.scale(1, SQUASH);
  ctx.translate(0, -R * 0.34);
  ringAnnulus(R * 1.2, R * 1.62, "#4E3C20", 0.3);
  ctx.restore();
  // 4) 앞쪽 고리(본체를 가로지르는 아래 절반) — 본체 위에 덮어 그린다
  ctx.save();
  clipBall(ctx, R * 0.998);
  ctx.rotate(TILT);
  ctx.scale(1, SQUASH);
  ctx.beginPath();
  ctx.rect(-R * 2.2, R * 0.1, R * 4.4, R * 2.4);
  ctx.clip();
  drawRings();
  ctx.restore();
}

function paintJupiter(ctx: Ctx, R: number, rng: () => number): void {
  // NASA 목성 텍스처 대조 — 크림 존/녹슨 벨트의 물결 경계, 대적점, 회녹색 극지, 흰 폭풍 알갱이.
  // 미니(체인 아이콘 — 기기 픽셀 16~18px 베이크라 문턱 R<20)는 굵은 벨트 2줄+대적점만 —
  // 금성과의 구분이 목적(실사용 피드백).
  ctx.save();
  clipBall(ctx, R);
  ball(ctx, R, "#F2E7CE", "#E0CFA8", "#B39468");
  if (R < 20) {
    wavyBand(ctx, R, -0.34, -0.1, "#B06A38", 0.95, rng);
    wavyBand(ctx, R, 0.12, 0.36, "#A8602F", 0.95, rng);
    wavyBand(ctx, R, -0.1, 0.12, "#F6EDD8", 0.7, rng);
    ctx.fillStyle = "#C06038";
    ctx.beginPath();
    ctx.ellipse(-R * 0.3, R * 0.24, R * 0.2, R * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    terminator(ctx, R, 0.48);
    ctx.restore();
    rim(ctx, R, "#FFF4DA", 0.4);
    return;
  }
  // 극지 — 회녹색 반점 지대
  wavyBand(ctx, R, -1.05, -0.62, "#9BA79B", 0.75, rng);
  wavyBand(ctx, R, 0.66, 1.05, "#9FA99C", 0.7, rng);
  // 중위도 황갈 존
  wavyBand(ctx, R, -0.62, -0.3, "#DCC094", 0.55, rng);
  wavyBand(ctx, R, 0.28, 0.44, "#DFC59A", 0.5, rng);
  wavyBand(ctx, R, 0.5, 0.66, "#CBAD7C", 0.45, rng);
  // 북적도 벨트(NEB)·남적도 벨트(SEB) — 녹슨 주황, 경계 난류
  wavyBand(ctx, R, -0.3, -0.12, "#BC7A42", 0.8, rng);
  wavyBand(ctx, R, 0.1, 0.28, "#B06A38", 0.8, rng);
  // 적도 존은 가장 밝게
  wavyBand(ctx, R, -0.12, 0.1, "#F6EDD8", 0.55, rng);
  // 페스툰 — 벨트에서 적도 존으로 흘러내리는 청회색 갈고리
  ctx.strokeStyle = "#8A98A8";
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const x0 = -R * 0.6 + i * R * 0.55 + rng() * R * 0.1;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = R * 0.035;
    ctx.beginPath();
    ctx.moveTo(x0, -R * 0.14);
    ctx.quadraticCurveTo(x0 + R * 0.12, R * 0.0, x0 + R * 0.24, -R * 0.03);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // 대적점 — SEB 남쪽에 걸린 주황 타원 + 크림 칼라
  const gx = -R * 0.3;
  const gy = R * 0.2;
  patch(ctx, gx, gy, R * 0.2, R * 0.13, -0.06, "#EFE3C8", 0.9); // 칼라
  const grs = ctx.createRadialGradient(gx - R * 0.03, gy - R * 0.02, R * 0.01, gx, gy, R * 0.15);
  grs.addColorStop(0, "#D98A54");
  grs.addColorStop(0.7, "#C06A3C");
  grs.addColorStop(1, "#A85830");
  ctx.fillStyle = grs;
  ctx.beginPath();
  ctx.ellipse(gx, gy, R * 0.145, R * 0.095, -0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "#8A4A28";
  ctx.lineWidth = R * 0.014;
  ctx.beginPath();
  ctx.ellipse(gx, gy, R * 0.1, R * 0.06, -0.06, 0.4, Math.PI * 1.8);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // 남반구 흰 폭풍 알갱이 줄
  ctx.fillStyle = "#F6EFDE";
  for (let i = 0; i < 4; i++) {
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(R * (0.16 + i * 0.17), R * 0.4, R * 0.032, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, R * 0.98, rng, 30, "#C9B28A", 0.2, R * 0.03);
  terminator(ctx, R, 0.48);
  ctx.restore();
  rim(ctx, R, "#FFF4DA", 0.4);
}

function paintSun(ctx: Ctx, R: number, rng: () => number): void {
  // 코로나 — 몸 밖으로 뻗는 빛 + 8줄 광선
  const cor = ctx.createRadialGradient(0, 0, R * 0.9, 0, 0, R * 1.66);
  cor.addColorStop(0, "rgba(255,214,110,0.55)");
  cor.addColorStop(0.4, "rgba(255,158,58,0.2)");
  cor.addColorStop(1, "rgba(255,140,40,0)");
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.68, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFC96A";
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i / 8) * Math.PI * 2 + 0.35);
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.moveTo(R * 1.0, 0);
    ctx.lineTo(R * 1.55, -R * 0.05);
    ctx.lineTo(R * 1.55, R * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // 광구 — 흰노랑 심 → 주황 가장자리(림 다크닝)
  const g = ctx.createRadialGradient(-R * 0.2, -R * 0.2, R * 0.05, 0, 0, R);
  g.addColorStop(0, "#FFFBE6");
  g.addColorStop(0.45, "#FFE07A");
  g.addColorStop(0.82, "#FBAD32");
  g.addColorStop(1, "#E2820F");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  clipBall(ctx, R);
  // 쌀알 무늬(광구 대류 세포)
  for (let i = 0; i < 110; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng()) * R * 0.96;
    ctx.globalAlpha = 0.05 + rng() * 0.06;
    ctx.fillStyle = rng() > 0.5 ? "#FFEFB2" : "#E8912C";
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, R * (0.02 + rng() * 0.035), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // 흑점 무리 — 본그림자(진갈)+반그림자(중간톤), 주변 백반
  const spot = (x: number, y: number, sr: number): void => {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#C87A18";
    ctx.beginPath();
    ctx.ellipse(x, y, sr * 1.8, sr * 1.3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#7A3A08";
    ctx.beginPath();
    ctx.ellipse(x, y, sr, sr * 0.75, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#FFF2C4";
    ctx.beginPath();
    ctx.arc(x + sr * 2.4, y - sr, sr * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  spot(-R * 0.28, R * 0.18, R * 0.055);
  spot(-R * 0.16, R * 0.26, R * 0.03);
  spot(R * 0.34, -R * 0.22, R * 0.035);
  ctx.restore();
  // 홍염 — 림에 바짝 붙은 나지막한 불꽃 아치("냄비 손잡이"처럼 돌출 금지 — 1차 도감 보정)
  const prom = (ang: number, len: number): void => {
    ctx.save();
    ctx.rotate(ang);
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,150,60,0.3)";
    ctx.lineWidth = R * 0.055;
    ctx.beginPath();
    ctx.moveTo(R * 0.985, -R * 0.02);
    ctx.bezierCurveTo(R * (1 + len), -R * 0.1, R * (1 + len), R * 0.08, R * 0.98, R * 0.07);
    ctx.stroke();
    ctx.strokeStyle = "#FF9540";
    ctx.lineWidth = R * 0.026;
    ctx.stroke();
    ctx.restore();
  };
  prom(-0.5, 0.11);
  prom(2.4, 0.085);
  prom(1.1, 0.07);
}

// ── 베이크 캐시 ────────────────────────────────────────────────
const PAINTERS: Array<(ctx: Ctx, R: number, rng: () => number) => void> = [
  paintDust,
  paintAster,
  paintPluto,
  paintMoon,
  paintMercury,
  paintMars,
  paintVenus,
  paintEarth,
  paintSaturn,
  paintJupiter,
  paintSun,
];

const cache = new Map<string, HTMLCanvasElement>();

/** 티어 스프라이트를 rPx(화면 px) 해상도로 베이크해 반환 — 같은 해상도는 캐시 히트. */
export function sprite(tier: number, rPx: number): HTMLCanvasElement {
  const R = Math.max(6, Math.round(rPx));
  const key = `${tier}@${R}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const ext = Math.ceil(R * EXTK[tier]);
  const cv = document.createElement("canvas");
  cv.width = ext * 2;
  cv.height = ext * 2;
  const ctx = cv.getContext("2d");
  if (ctx) {
    ctx.translate(ext, ext);
    PAINTERS[tier](ctx, R, rngOf(tier * 7919 + 13));
  }
  if (cache.size > 64) cache.clear(); // 리사이즈 반복 대비 폭주 캡
  cache.set(key, cv);
  return cv;
}
