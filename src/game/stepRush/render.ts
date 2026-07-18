// 스텝 러시 렌더러 — 캔버스 2D(M2 게임필판). 엔진 상태를 읽기만 하고, 파티클·셰이크는
// gameKit을 조합해 렌더러가 소유한다(index는 onStep/onGold/onFall 통지만). Pixi 교체 여지는
// 이 파일 격리가 근거. 좌표: 계단 i = (posX[i]·DX, −i·DY) 월드, 카메라 러너 추적.
//
// M2 바이옴: 고도(계단 수)에 따라 배경 그라데이션이 연속 보간되고(맑은 낮→노을→밤→구름 바다→
// 성층권→우주), 구름 시차 레이어와 실고도 팻말(1계단=2m 위트)이 지나간다. 시작 지점엔 지면에
// 뿌리내린 낮 도시 스카이라인(파사드·창·옥상 소품은 스프라이트 1회 베이크 — buildCity 주석 참조).
import { fitCanvas, type Fitted } from "../../ui/canvas";
import { BOOT_RAINBOW } from "../../ui/boots";
import { Particles, Shake } from "../gameKit";
import type { RushEngine } from "./engine";

const DX = 44; // 계단 가로 간격(px)
const DY = 34; // 계단 세로 간격(px)
const TREAD_W = 58; // 윗면 폭
const TREAD_H = 13; // 윗면 두께
const FACE_H = 11; // 앞면(입체 옆면) 두께

/** 고도 팻말 — 라벨은 실제 높이 순(1계단 = 2 m 재미 단위, 팻말에만 사용). */
const SIGNS = new Map<number, string>([
  [15, "번지점프대"],
  [40, "자이로드롭"],
  [80, "대관람차 꼭대기"],
  [125, "63빌딩"],
  [166, "도쿄타워"],
  [278, "롯데월드타워"],
  [414, "부르즈 할리파"],
  [970, "한라산"],
  [1372, "백두산"],
  [4425, "에베레스트"],
  [10000, "성층권"],
]);

/** 고도 변신 단계 — 러너에게 장비가 하나씩 붙는다(순수 연출, 규칙 없음).
 *  index.ts가 토스트 문구로도 쓰는 단일 정본. */
export const GEAR_STAGES = [
  { at: 80, msg: "바람이 차요! 목도리 장착" },
  { at: 300, msg: "구름 위예요! 고글 장착" },
  { at: 800, msg: "성층권! 헬멧 장착" },
] as const;

/** 바이옴 색 정거장 — 고도(계단)로 이웃 정거장을 연속 보간(경계 없는 크로스페이드).
 *  M4.1 재설계(사용자 피드백 "낮에서 시작해야 밤 전환이 확 보인다"): 여정 =
 *  맑은 낮 도시 → 노을 → 밤(달·별) → 달빛 구름 바다 → 오로라 → 성층권 → 우주.
 *  낮→밤이 가장 큰 대비 카드라 첫 150계단 안에 몰아넣는다. */
const STOPS: Array<{ alt: number; top: [number, number, number]; bot: [number, number, number] }> = [
  { alt: 0, top: [96, 160, 226], bot: [173, 211, 245] }, // 맑은 낮
  { alt: 65, top: [110, 130, 205], bot: [244, 168, 110] }, // 노을 시작(지평선 주황)
  { alt: 120, top: [58, 58, 120], bot: [216, 110, 120] }, // 노을 절정(보라·분홍)
  { alt: 175, top: [18, 33, 60], bot: [13, 24, 44] }, // 밤
  { alt: 300, top: [34, 54, 96], bot: [48, 72, 118] }, // 달빛 구름 바다
  { alt: 520, top: [16, 40, 62], bot: [12, 28, 50] }, // 오로라 밤
  { alt: 950, top: [8, 16, 36], bot: [6, 12, 28] }, // 성층권
  { alt: 1900, top: [4, 8, 18], bot: [3, 6, 14] }, // 우주
];

function ramp(v: number, a: number, b: number): number {
  return Math.min(1, Math.max(0, (v - a) / (b - a)));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mixRgb(a: [number, number, number], b: [number, number, number], t: number): string {
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;
}

/** 결정적 해시(0~1) — 장식 배치용. */
function frac(n: number, salt: number): number {
  const q = Math.sin(n * 127.1 + salt * 311.7) * 43758.5453;
  return q - Math.floor(q);
}

/** 렌더러에 넘기는 연출 타임스탬프 — 엔진 밖의 순수 시각 상태. */
export interface RushFx {
  hopAt: number; // 마지막 오르기 시각(performance.now)
  goldAt: number; // 마지막 골드 밟은 시각
  overAt: number; // 게임 오버 시각(0이면 진행 중)
}

export class RushRenderer {
  reducedMotion = false; // index가 매체 질의로 세팅 — 셰이크만 끈다(파티클은 소량 유지)
  /** 러너 장화 실착(M3) — index가 장화 티어(core/level)에서 색을 뽑아 세팅. */
  bootColor = "#3D8BFF";
  bootRainbow = false;
  /** "지난 나" 고스트가 서 있는 계단(= 직전 최고 기록). 0이면 없음. */
  ghostAt = 0;

  private fit: Fitted;
  private camX = 0;
  private camY = 0;
  private snapped = false;
  private parts = new Particles();
  private shakeFx = new Shake();
  private ghostGoneAt = 0; // 고스트를 넘은 시각 — 600ms 페이드
  private nightF = 0; // 0=낮 ~ 1=밤(115~175계단 사이 전환) — 별·러너 선색·고스트 색의 근거
  // 낮 도시 스프라이트(buildCity가 리사이즈 때만 굽는다) — 매 프레임 비용은 drawImage 3장뿐
  private cityW = 0;
  private cityH = 0;
  private cityFar: HTMLCanvasElement | null = null;
  private citySideL: HTMLCanvasElement | null = null;
  private citySideR: HTMLCanvasElement | null = null;
  private cityGroundPx = 0; // 사이드 스프라이트 안 지면 y(위에서부터) — 월드 정렬 기준

  constructor(private cv: HTMLCanvasElement) {
    this.fit = fitCanvas(cv);
  }

  resize(): void {
    this.fit = fitCanvas(this.cv);
  }

  /** 새 판 시작 시 카메라 스냅 + 잔여 파티클·고스트 페이드 정리. */
  reset(): void {
    this.snapped = false;
    this.parts.clear();
    this.ghostGoneAt = 0;
  }

  // ── 게임 이벤트 통지(연출 소유는 렌더러) — 좌표는 엔진 월드 그대로 ──
  onStep(eng: RushEngine): void {
    const wx = eng.posX[eng.p] * DX;
    const wy = -eng.p * DY;
    const fever = eng.feverLeft > 0;
    this.parts.burst(wx, wy + 2, {
      n: fever ? 4 : 3,
      color: fever ? "#F5C445" : "#C9D6EA",
      speed: fever ? 60 : 34,
      up: 26,
      life: fever ? 380 : 300,
      size: fever ? 2.2 : 1.8,
    });
  }

  /** 별 계단 밟음(피버 시작·연장) — 시안 스파크. */
  onStar(eng: RushEngine): void {
    const wx = eng.posX[eng.p] * DX;
    const wy = -eng.p * DY;
    this.parts.burst(wx, wy - 12, { n: 14, color: "#3BC9DB", speed: 130, up: 100, life: 560, size: 2.6 });
    if (!this.reducedMotion) this.shakeFx.kick(3.5);
  }

  /** 방패 픽업 — 파란 스파크. */
  onShield(eng: RushEngine): void {
    const wx = eng.posX[eng.p] * DX;
    const wy = -eng.p * DY;
    this.parts.burst(wx, wy - 12, { n: 9, color: "#7DB0FF", speed: 100, up: 80, life: 480, size: 2.4 });
  }

  /** 모래시계 픽업 — 얼음빛 스파크. */
  onGlass(eng: RushEngine): void {
    const wx = eng.posX[eng.p] * DX;
    const wy = -eng.p * DY;
    this.parts.burst(wx, wy - 12, { n: 9, color: "#CDEBFF", speed: 90, up: 70, life: 500, size: 2.2 });
  }

  /** 방패가 헛디딤을 막아준 순간 — 버블 파열. */
  onShieldBreak(eng: RushEngine): void {
    const wx = eng.posX[eng.p] * DX;
    const wy = -eng.p * DY;
    this.parts.burst(wx, wy - 16, { n: 14, color: "#7DB0FF", speed: 140, up: 60, life: 460, size: 2.4 });
    if (!this.reducedMotion) this.shakeFx.kick(5);
  }

  /** 고도 변신(목도리·고글·헬멧) 순간 — 흰 반짝. */
  onGear(eng: RushEngine): void {
    const wx = eng.posX[eng.p] * DX;
    const wy = -eng.p * DY;
    this.parts.burst(wx, wy - 20, { n: 10, color: "#FFFFFF", speed: 90, up: 80, life: 460, size: 2 });
  }

  /** "지난 나"를 넘는 순간 — 고스트 자리 반짝 + 페이드 시작. */
  passGhost(eng: RushEngine, now: number): void {
    this.ghostGoneAt = now;
    if (this.ghostAt > 0 && this.ghostAt < eng.posX.length) {
      const wx = eng.posX[this.ghostAt] * DX;
      const wy = -this.ghostAt * DY;
      this.parts.burst(wx, wy - 16, { n: 12, color: "#A8C4EC", speed: 90, up: 70, life: 520, size: 2.2 });
    }
  }

  onGold(eng: RushEngine): void {
    const wx = eng.posX[eng.p] * DX;
    const wy = -eng.p * DY;
    this.parts.burst(wx, wy - 10, { n: 10, color: "#F5C445", speed: 110, up: 90, life: 520, size: 2.6 });
    if (!this.reducedMotion) this.shakeFx.kick(2.5);
  }

  onFall(eng: RushEngine): void {
    const wx = eng.posX[eng.p] * DX;
    const wy = -eng.p * DY;
    this.parts.burst(wx, wy - 14, { n: 12, color: "#FFFFFF", speed: 120, up: 60, life: 480, size: 2.2 });
    this.parts.burst(wx, wy - 14, { n: 6, color: "#F04452", speed: 90, up: 50, life: 520, size: 2.8 });
    if (!this.reducedMotion) this.shakeFx.kick(9);
  }

  draw(eng: RushEngine, fx: RushFx, now: number, dtNorm: number): void {
    const { ctx, w, h } = this.fit;
    const px = eng.posX[eng.p] * DX;
    const py = -eng.p * DY;

    if (!this.snapped) {
      this.camX = px;
      this.camY = py;
      this.snapped = true;
    }
    const ease = Math.min(1, 0.12 * dtNorm);
    this.camX += (px - this.camX) * ease;
    this.camY += (py - this.camY) * ease;
    this.parts.update(dtNorm * 16.7);

    const alt = Math.max(0, -this.camY / DY); // 고도(계단 단위, 카메라 기준 연속값)

    // 배경 — 바이옴 연속 보간
    let hi = STOPS.length - 1;
    for (let k = 1; k < STOPS.length; k++) if (alt <= STOPS[k].alt) { hi = k; break; }
    const lo = Math.max(0, hi - 1);
    const span = STOPS[hi].alt - STOPS[lo].alt || 1;
    const t = Math.min(1, Math.max(0, (alt - STOPS[lo].alt) / span));
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, mixRgb(STOPS[lo].top, STOPS[hi].top, t));
    bg.addColorStop(1, mixRgb(STOPS[lo].bot, STOPS[hi].bot, t));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 셰이크 — 배경 이후 전 레이어에 적용
    const sh = this.shakeFx.offset(dtNorm);
    ctx.save();
    ctx.translate(sh.x, sh.y);

    // 밤 정도(0=낮, 1=밤) — 별·러너 선색·고스트 색이 이 값으로 보간된다
    this.nightF = ramp(alt, 115, 175);
    const starK = (0.8 + Math.min(1, alt / 2500) * 1.1) * this.nightF;
    if (starK > 0.02) this.drawStars(ctx, w, h, starK);

    const ox = w / 2 - this.camX;
    const oy = h * 0.6 - this.camY;

    this.drawSun(ctx, w, h, alt);
    this.drawMoon(ctx, w, h, alt);
    this.drawAurora(ctx, w, h, alt, now);
    this.drawEarth(ctx, w, h, alt);
    this.drawDayClouds(ctx, w, h, alt); // 구름은 건물 "뒤" 상공 — 반드시 도시보다 먼저
    this.drawCity(ctx, w, h, oy, alt);
    this.drawClouds(ctx, w, h, alt);

    // 계단 + 팻말
    const iLo = Math.max(0, eng.p - 9);
    const iHi = Math.min(eng.dirs.length - 1, eng.p + 16);
    for (let i = iLo; i <= iHi; i++) {
      const sx = eng.posX[i] * DX + ox;
      const sy = -i * DY + oy;
      if (sy < -80 || sy > h + 80) continue;
      this.drawStair(ctx, sx, sy, eng.gold.has(i), eng.star.has(i), eng.shieldStairs.has(i), eng.glassStairs.has(i), i === eng.p, now);
      const label = SIGNS.get(i);
      if (label) this.drawSign(ctx, sx, sy, -(eng.dirs[i + 1] ?? eng.dirs[i]), i, label);
    }
    if (iLo === 0) this.drawBase(ctx, eng.posX[0] * DX + ox, oy + 1);

    // "지난 나" 고스트(직전 최고 계단 위) — 넘으면 600ms 페이드
    if (this.ghostAt > 0 && this.ghostAt >= iLo && this.ghostAt <= iHi && this.ghostAt < eng.posX.length) {
      const a = this.ghostGoneAt ? Math.max(0, 1 - (now - this.ghostGoneAt) / 600) : 1;
      if (a > 0.01) this.drawGhost(ctx, eng.posX[this.ghostAt] * DX + ox, -this.ghostAt * DY + oy, a);
    }

    // 파티클(월드 좌표) → 러너
    ctx.save();
    ctx.translate(ox, oy);
    this.parts.draw(ctx);
    ctx.restore();
    this.drawPlayer(ctx, eng, fx, px + ox, py + oy, now);

    ctx.restore(); // 셰이크 해제
  }

  /** 반투명 "지난 나" — 서 있는 자세, 라벨 한 줄. 러너와 헷갈리지 않게 푸른 회백 톤(낮엔 어둡게). */
  private drawGhost(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number): void {
    const gc = mixRgb([74, 100, 140], [168, 196, 236], this.nightF);
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = gc;
    ctx.fillStyle = gc;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, -27);
    ctx.lineTo(0, -13);
    ctx.moveTo(0, -22.5);
    ctx.lineTo(5.5, -16.5);
    ctx.moveTo(0, -22.5);
    ctx.lineTo(-5.5, -16.5);
    ctx.moveTo(0, -13);
    ctx.lineTo(4.5, 0);
    ctx.moveTo(0, -13);
    ctx.lineTo(-4.5, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -33.5, 6.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha * 0.66;
    ctx.textAlign = "center";
    ctx.font = "700 9.5px Pretendard, system-ui, sans-serif";
    ctx.fillText("지난 최고", 0, -46);
    ctx.restore();
  }

  private drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, k: number): void {
    ctx.save();
    const par = this.camY * 0.25;
    for (let s = 0; s < 46; s++) {
      const fx = frac(s, 1);
      const fy = frac(s, 2);
      const y = (((fy * 1400 - par) % (h + 40)) + (h + 40)) % (h + 40) - 20;
      ctx.globalAlpha = Math.min(0.5, (0.05 + fx * 0.11) * k);
      ctx.fillStyle = "#FFFFFF";
      const r = 0.8 + fy * 1.2;
      ctx.fillRect(fx * w, y, r, r);
    }
    ctx.restore();
  }

  /** 태양 — 낮 구간의 주인공. 노을 구간(45~115)에서 주황으로 물들며 내려가 사라진다. */
  private drawSun(ctx: CanvasRenderingContext2D, w: number, h: number, alt: number): void {
    const f = 1 - ramp(alt, 55, 115);
    if (f <= 0.01) return;
    const setT = ramp(alt, 45, 115); // 노을 진행도
    const x = w * 0.24;
    const y = h * 0.16 + setT * h * 0.14;
    ctx.save();
    ctx.globalAlpha = f;
    ctx.shadowColor = `rgba(255,${Math.round(236 - setT * 90)},140,.85)`;
    ctx.shadowBlur = 44;
    ctx.fillStyle = mixRgb([255, 243, 196], [255, 164, 94], setT);
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** 커다란 달 — 해가 진 뒤(150계단~) 떠올라 밤 구간의 이정표가 된다. */
  private drawMoon(ctx: CanvasRenderingContext2D, w: number, h: number, alt: number): void {
    const f = ramp(alt, 150, 185) * (1 - ramp(alt, 290, 335));
    if (f <= 0.01) return;
    const x = w * 0.76;
    const y = h * 0.2;
    ctx.save();
    ctx.globalAlpha = f;
    ctx.shadowColor = "rgba(245,238,200,.85)";
    ctx.shadowBlur = 36;
    ctx.fillStyle = "#F2ECC8";
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(190,182,150,.35)";
    ctx.beginPath();
    ctx.arc(x - 9, y - 4, 5.2, 0, Math.PI * 2);
    ctx.arc(x + 7, y + 9, 3.6, 0, Math.PI * 2);
    ctx.arc(x + 11, y - 11, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** 오로라 커튼(470~880계단) — 청록·보라 리본이 흔들린다. 물리 고도는 아니지만 밤 여정의 하이라이트. */
  private drawAurora(ctx: CanvasRenderingContext2D, w: number, h: number, alt: number, now: number): void {
    const f = ramp(alt, 470, 540) * (1 - ramp(alt, 790, 890));
    if (f <= 0.01) return;
    ctx.save();
    for (let r = 0; r < 3; r++) {
      const width = 38 + r * 14;
      const grad = ctx.createLinearGradient(0, 0, 0, h * 0.72);
      grad.addColorStop(0, `rgba(96,235,180,${0.16 * f})`);
      grad.addColorStop(0.55, `rgba(150,120,255,${0.1 * f})`);
      grad.addColorStop(1, "rgba(150,120,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      const xc = (y: number): number =>
        w * (0.2 + 0.3 * r) + Math.sin(y * 0.007 + now / 1100 + r * 2.1) * 46 + Math.sin(now / 1700 + r) * 18;
      for (let k = 0; k <= 8; k++) {
        const y = (h * 0.72 * k) / 8;
        const x = xc(y) - width / 2;
        if (k === 0) ctx.moveTo(x, -12);
        else ctx.lineTo(x, y);
      }
      for (let k = 8; k >= 0; k--) {
        const y = (h * 0.72 * k) / 8;
        ctx.lineTo(xc(y) + width / 2, k === 0 ? -12 : y);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  /** 우주 직전(1700계단~) — 화면 아래로 지구의 곡률과 대기 글로우가 보인다. */
  private drawEarth(ctx: CanvasRenderingContext2D, w: number, h: number, alt: number): void {
    const f = ramp(alt, 1700, 2300);
    if (f <= 0.01) return;
    const R = w * 1.7;
    const cy = h - 40 - f * 40 + R;
    ctx.save();
    ctx.globalAlpha = f;
    ctx.fillStyle = "#071122";
    ctx.beginPath();
    ctx.arc(w / 2, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(110,190,255,.6)";
    ctx.lineWidth = 9;
    ctx.shadowColor = "rgba(110,190,255,.8)";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(w / 2, cy, R, -Math.PI * 0.72, -Math.PI * 0.28);
    ctx.stroke();
    ctx.restore();
  }

  /** 도시 구간(0~약 110계단) — 지면에 뿌리내린 낮 스카이라인. 원경(전폭 지평선 띠+지상 안개,
   *  시차 0.25)은 천천히, 근경(양옆 타워 클러스터, 월드 고정)은 계단과 같은 속도로 발밑에
   *  가라앉아 자연 퇴장한다. 공중에 매달린 슬래브 금지 — 모든 건물은 지면에서 솟는다. */
  private drawCity(ctx: CanvasRenderingContext2D, w: number, h: number, oy: number, alt: number): void {
    const fadeN = 1 - ramp(alt, 84, 116);
    const fadeF = 1 - ramp(alt, 58, 90);
    if (fadeN <= 0.01 && fadeF <= 0.01) return;
    if (this.cityW !== w || this.cityH !== h || !this.cityFar) this.buildCity(w, h);
    ctx.save();
    if (fadeF > 0.01 && this.cityFar) {
      const fy = h * 0.62 - this.camY * 0.25 - 205; // 지평선(h·0.62)이 시차 0.25로 가라앉는다
      if (fy < h) {
        ctx.globalAlpha = fadeF;
        ctx.drawImage(this.cityFar, 0, fy);
      }
    }
    if (fadeN > 0.01 && this.citySideL && this.citySideR) {
      const yTop = oy + 46 - this.cityGroundPx; // 지면 = 시작 발판 바로 아래
      if (yTop < h) {
        ctx.globalAlpha = fadeN;
        ctx.drawImage(this.citySideL, 0, yTop);
        ctx.drawImage(this.citySideR, w - this.citySideR.width, yTop);
      }
    }
    ctx.restore();
  }

  /** 도시 스프라이트 베이크 — 파운드리 재질 문법의 캔버스판(근-동조 그라데이션 면·좌상단
   *  키라이트 모서리·파라펫·옥상 소품·창 그리드). 가장 높은 타워는 62계단(124 m)이라
   *  63빌딩 팻말(125계단)이 "실제 마천루보다 높이 올라왔다"는 랜드마크로 남는다. */
  private buildCity(w: number, h: number): void {
    this.cityW = w;
    this.cityH = h;
    this.cityFar = this.bakeFarCity(w, h);
    const tallest = 62;
    const roofPad = 40; // 안테나 여유
    const belowPx = Math.ceil(h * 0.42) + 20; // 시작 화면 하단까지 몸통이 이어지게(잘린 슬래브 방지)
    this.cityGroundPx = tallest * DY + roofPad;
    const spriteH = this.cityGroundPx + belowPx;
    const cw = Math.min(170, Math.round(w * 0.4));
    this.citySideL = this.bakeSideCity(0, cw, spriteH);
    this.citySideR = this.bakeSideCity(1, cw, spriteH);
  }

  /** 원경 — 지평선 위 잔건물 두 줄(뒷줄이 더 옅다) + 아래로 스러지는 지상 안개. */
  private bakeFarCity(w: number, h: number): HTMLCanvasElement {
    const HOR = 205;
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(w));
    cv.height = HOR + Math.ceil(h * 0.38) + 12; // 시작 시 화면 하단까지 안개가 닿는다
    const c = cv.getContext("2d")!;
    for (let row = 0; row < 2; row++) {
      c.fillStyle = row === 0 ? "rgba(186,204,227,.6)" : "rgba(158,181,210,.8)";
      let x = -8 - row * 11;
      let i = row * 57;
      while (x < w + 10) {
        const bw = 15 + frac(i, 31) * 28;
        const bh = 24 + frac(i, 32) * (row === 0 ? 70 : 122);
        c.fillRect(x, HOR - bh, bw, bh);
        if (row === 1 && frac(i, 33) > 0.74) c.fillRect(x + bw / 2 - 1, HOR - bh - 8, 2, 8);
        x += bw + 3 + frac(i, 34) * 9;
        i++;
      }
    }
    const mist = c.createLinearGradient(0, HOR, 0, cv.height);
    mist.addColorStop(0, "rgba(170,190,216,.5)");
    mist.addColorStop(1, "rgba(170,190,216,0)");
    c.fillStyle = mist;
    c.fillRect(0, HOR, cv.width, cv.height - HOR);
    return cv;
  }

  /** 근경 타워 클러스터(한쪽) — 뒤(안쪽·옅음)→앞(모서리·진함) 3동, 전부 지면에서 솟는다. */
  private bakeSideCity(side: 0 | 1, cw: number, spriteH: number): HTMLCanvasElement {
    const cv = document.createElement("canvas");
    cv.width = cw;
    cv.height = spriteH;
    const c = cv.getContext("2d")!;
    const specs: Array<{ inset: number; bw: number; h: number; tone: [number, number, number]; roof: "tank" | "antenna" | "ac" }> = [
      { inset: 46, bw: 82, h: Math.round(26 + frac(side, 41) * 9), tone: [151, 171, 201], roof: "tank" },
      { inset: 8, bw: 94, h: Math.round(50 + frac(side, 42) * 12), tone: [127, 150, 183], roof: "antenna" },
      { inset: -14, bw: 84, h: Math.round(15 + frac(side, 43) * 7), tone: [110, 134, 169], roof: "ac" },
    ];
    for (let bi = 0; bi < specs.length; bi++) {
      const sp = specs[bi];
      const x = side === 0 ? sp.inset : cw - sp.inset - sp.bw;
      this.bakeBuilding(c, x, this.cityGroundPx - sp.h * DY, sp.bw, spriteH, sp.tone, sp.roof, side * 13 + bi * 7);
    }
    return cv;
  }

  /** 건물 한 동 — 세로 3스톱 그라데이션 파사드 + 키라이트/그늘 모서리 + 파라펫 + 옥상 소품 +
   *  창 그리드(7%만 점등). 몸통은 스프라이트 바닥까지 이어 그려 바닥 잘림이 없다. */
  private bakeBuilding(
    c: CanvasRenderingContext2D,
    x: number,
    top: number,
    bw: number,
    bot: number,
    tone: [number, number, number],
    roof: "tank" | "antenna" | "ac",
    seed: number,
  ): void {
    const dk: [number, number, number] = [22, 38, 64];
    const g = c.createLinearGradient(0, top, 0, bot);
    g.addColorStop(0, mixRgb(tone, [255, 255, 255], 0.16));
    g.addColorStop(0.24, `rgb(${tone[0]},${tone[1]},${tone[2]})`);
    g.addColorStop(1, mixRgb(tone, dk, 0.16));
    c.fillStyle = g;
    c.fillRect(x, top, bw, bot - top);
    c.fillStyle = "rgba(255,255,255,.2)"; // 좌상단 광원 키라이트 모서리
    c.fillRect(x, top, 4, bot - top);
    c.fillStyle = "rgba(24,40,66,.2)";
    c.fillRect(x + bw - 4, top, 4, bot - top);
    c.fillStyle = mixRgb(tone, dk, 0.3); // 파라펫(옥상 테두리)
    c.fillRect(x - 2, top - 6, bw + 4, 7);
    if (roof === "antenna") {
      const ax = x + bw * 0.52;
      c.fillStyle = mixRgb(tone, dk, 0.42);
      c.fillRect(ax - 1, top - 32, 2, 26);
      c.fillStyle = "rgba(240,110,110,.9)"; // 항공 장애등
      c.beginPath();
      c.arc(ax, top - 33, 2.2, 0, Math.PI * 2);
      c.fill();
    } else if (roof === "tank") {
      const tx = x + bw * (0.24 + frac(seed, 51) * 0.3);
      c.fillStyle = mixRgb(tone, dk, 0.24);
      c.fillRect(tx + 2, top - 10, 2, 4);
      c.fillRect(tx + 12, top - 10, 2, 4);
      c.fillStyle = mixRgb(tone, [255, 255, 255], 0.06); // 물탱크 몸통
      c.fillRect(tx, top - 20, 16, 10);
      c.fillStyle = mixRgb(tone, dk, 0.3);
      c.fillRect(tx + 3, top - 22, 10, 3);
    } else {
      c.fillStyle = mixRgb(tone, dk, 0.22); // 실외기
      c.fillRect(x + bw * 0.2, top - 12, 11, 6);
      c.fillRect(x + bw * 0.58, top - 11, 9, 5);
    }
    const cols = Math.max(2, Math.floor((bw - 18) / 15));
    const x0 = x + (bw - (cols * 15 - 8)) / 2;
    for (let row = 0; top + 15 + row * 19 + 10 < bot - 6; row++) {
      const wy = top + 15 + row * 19;
      for (let col = 0; col < cols; col++) {
        const lit = frac(seed * 97 + row * 31 + col, 44) < 0.07;
        c.fillStyle = lit ? "rgba(255,240,198,.6)" : "rgba(34,52,84,.3)";
        c.fillRect(x0 + col * 15, wy, 7, 10);
      }
    }
  }

  /** 낮 뭉게구름(0~110계단) — 도시 "뒤" 상공을 지나는 배경 구름. 화면 위 58% 띠에만 두어
   *  지붕 아래로 내려오지 않는다(구름 위에 건물이 떠 보이던 사고의 구조적 차단). */
  private drawDayClouds(ctx: CanvasRenderingContext2D, w: number, h: number, alt: number): void {
    const fade = 1 - ramp(alt, 70, 120);
    if (fade <= 0.01) return;
    const scroll = -this.camY * 0.38; // 멀리 있는 구름 — 계단보다 천천히 가라앉는다
    const jLo = Math.floor((scroll - h * 0.55 - 90) / 185);
    const jHi = Math.ceil((scroll + h * 0.45 + 90) / 185);
    ctx.save();
    for (let j = jLo; j <= jHi; j++) {
      const sy = h * 0.55 + (scroll - j * 185);
      if (sy < -80 || sy > h * 0.58) continue;
      const cx = frac(j, 18) * (w + 180) - 90;
      const s = 30 + frac(j, 19) * 30;
      ctx.fillStyle = `rgba(255,255,255,${(0.42 + frac(j, 20) * 0.22) * fade})`;
      ctx.beginPath();
      ctx.ellipse(cx, sy, s * 1.6, s * 0.55, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - s * 0.9, sy + s * 0.16, s * 0.9, s * 0.4, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + s * 0.95, sy + s * 0.12, s, s * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** 달빛 구름 바다 시차 레이어 — 240~470계단, 경계는 알파 페이드. */
  private drawClouds(ctx: CanvasRenderingContext2D, w: number, h: number, alt: number): void {
    if (alt < 240 || alt > 470) return;
    const fade = Math.min(ramp(alt, 240, 300), (470 - alt) / 110, 1);
    const scroll = -this.camY * 0.72;
    const jLo = Math.floor((scroll - h * 0.55 - 90) / 120);
    const jHi = Math.ceil((scroll + h * 0.45 + 90) / 120);
    ctx.save();
    for (let j = jLo; j <= jHi; j++) {
      const sy = h * 0.55 + (scroll - j * 120);
      if (sy < -80 || sy > h + 80) continue;
      const cx = frac(j, 8) * (w + 160) - 80;
      const s = 26 + frac(j, 9) * 32;
      ctx.fillStyle = `rgba(196,214,244,${(0.12 + frac(j, 10) * 0.07) * fade})`;
      ctx.beginPath();
      ctx.ellipse(cx, sy, s * 1.6, s * 0.55, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - s * 0.9, sy + s * 0.16, s * 0.9, s * 0.4, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + s * 0.95, sy + s * 0.12, s, s * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawStair(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isGold: boolean,
    isStar: boolean,
    isShield: boolean,
    isGlass: boolean,
    current: boolean,
    now: number,
  ): void {
    const hw = TREAD_W / 2;
    const special = isGold || isStar || isShield || isGlass;
    ctx.save();
    if (special) {
      const pulse = 0.55 + 0.25 * Math.sin(now / 260);
      ctx.shadowColor = isStar
        ? `rgba(59,201,219,${pulse})`
        : isShield
          ? `rgba(110,160,255,${pulse})`
          : isGlass
            ? `rgba(210,235,255,${pulse * 0.9})`
            : `rgba(240,180,41,${pulse})`;
      ctx.shadowBlur = 16;
    }
    ctx.fillStyle = isStar ? "#1F7A8C" : isGold ? "#B47D0E" : "#1E3050";
    this.rr(ctx, x - hw, y + TREAD_H - 5, TREAD_W, FACE_H + 5, 5);
    ctx.fill();
    ctx.fillStyle = isStar ? "#3BC9DB" : isGold ? "#F0B429" : current ? "#3E5E92" : "#33507E";
    this.rr(ctx, x - hw, y, TREAD_W, TREAD_H, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isStar || isGlass ? "rgba(220,250,255,.6)" : isGold ? "rgba(255,240,200,.55)" : "rgba(255,255,255,.14)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x - hw + 6, y + 1.2);
    ctx.lineTo(x + hw - 6, y + 1.2);
    ctx.stroke();
    if (isStar) this.drawStarGlyph(ctx, x, y + TREAD_H / 2 + 0.5, 5.2);
    if (isShield) this.drawShieldGlyph(ctx, x, y + TREAD_H / 2 + 0.5);
    if (isGlass) this.drawGlassGlyph(ctx, x, y + TREAD_H / 2 + 0.5);
    ctx.restore();
  }

  /** 방패 계단 글리프 — 파란 방패(픽업 예고 도상). */
  private drawShieldGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5.4);
    ctx.lineTo(cx + 4.6, cy - 3.6);
    ctx.quadraticCurveTo(cx + 4.6, cy + 2.2, cx, cy + 5.6);
    ctx.quadraticCurveTo(cx - 4.6, cy + 2.2, cx - 4.6, cy - 3.6);
    ctx.closePath();
    ctx.fillStyle = "#7DB0FF";
    ctx.fill();
    ctx.strokeStyle = "#2E5FBE";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /** 모래시계 계단 글리프 — 얼음빛 모래시계. */
  private drawGlassGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.fillStyle = "#EAF4FF";
    ctx.beginPath();
    ctx.moveTo(cx - 3.6, cy - 4.6);
    ctx.lineTo(cx + 3.6, cy - 4.6);
    ctx.lineTo(cx, cy - 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 3.6, cy + 4.8);
    ctx.lineTo(cx + 3.6, cy + 4.8);
    ctx.lineTo(cx, cy + 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#9FC4E8";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx - 4.4, cy - 5);
    ctx.lineTo(cx + 4.4, cy - 5);
    ctx.moveTo(cx - 4.4, cy + 5.2);
    ctx.lineTo(cx + 4.4, cy + 5.2);
    ctx.stroke();
  }

  /** 별 계단 윗면의 흰 별 글리프(5각) — "밟으면 아는 효과"의 예고 도상. */
  private drawStarGlyph(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const ang = -Math.PI / 2 + (k * Math.PI) / 5;
      const rr = k % 2 === 0 ? r : r * 0.46;
      const px = cx + Math.cos(ang) * rr;
      const py = cy + Math.sin(ang) * rr;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
  }

  /** 고도 팻말 — 다음 계단의 반대편에 세워 오름길을 가리지 않는다. */
  private drawSign(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    side: number,
    idx: number,
    label: string,
  ): void {
    const cx = sx + side * (TREAD_W / 2 + 46);
    const cy = sy - 12;
    ctx.save();
    // 기둥
    ctx.strokeStyle = "#4A3722";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 14);
    ctx.lineTo(cx, sy + TREAD_H + 6);
    ctx.stroke();
    // 판자
    ctx.fillStyle = "#6E5233";
    ctx.strokeStyle = "#3F2E1D";
    ctx.lineWidth = 1.6;
    this.rr(ctx, cx - 44, cy - 16, 88, 30, 6);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFE1A1";
    ctx.font = "800 11px Pretendard, system-ui, sans-serif";
    ctx.fillText(`${idx * 2} m`, cx, cy - 3);
    ctx.fillStyle = "#FFF3DF";
    ctx.font = "600 9.5px Pretendard, system-ui, sans-serif";
    ctx.fillText(label, cx, cy + 9);
    ctx.restore();
  }

  private drawBase(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = "#16253F";
    this.rr(ctx, x - 92, y + DY, 184, 30, 8);
    ctx.fill();
  }

  private drawPlayer(
    ctx: CanvasRenderingContext2D,
    eng: RushEngine,
    fx: RushFx,
    x: number,
    y: number,
    now: number,
  ): void {
    const hopT = now - fx.hopAt;
    const lift = hopT < 140 ? Math.sin((hopT / 140) * Math.PI) * 9 : 0;
    // 스쿼시&스트레치 — 뜰 때 길쭉, 내려앉을 때 납작(저빈도 아님이지만 미세량이라 멀미 無)
    let sqX = 1;
    let sqY = 1;
    if (hopT < 70) {
      sqX = 0.94;
      sqY = 1.07;
    } else if (hopT < 140) {
      sqX = 1.05;
      sqY = 0.95;
    }

    let fallX = 0;
    let fallY = 0;
    let rot = 0;
    if (eng.phase === "over" && fx.overAt) {
      const t = Math.min(900, now - fx.overAt);
      if (eng.reason === "miss") {
        fallX = eng.facing * Math.min(1, t / 220) * 30;
        fallY = (t / 420) ** 2 * 300;
        rot = eng.facing * t * 0.0038;
      } else {
        fallY = (t / 460) ** 2 * 240;
        rot = -eng.facing * t * 0.0016;
      }
    }

    ctx.save();
    ctx.translate(x + fallX, y - lift + fallY);
    if (eng.phase !== "over") {
      ctx.fillStyle = "rgba(0,0,0,.32)";
      ctx.beginPath();
      ctx.ellipse(0, 1.6, 13 - lift * 0.35, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.rotate(rot);
    ctx.scale(eng.facing * sqX, sqY);
    if (eng.phase === "run") ctx.rotate(-0.1); // 진행 방향 앞기울임(러닝 느낌)

    const run = eng.phase !== "ready";
    const sw = eng.p % 2 === 0 ? 1 : -1;
    if (eng.feverLeft > 0) {
      ctx.shadowColor = "rgba(59,201,219,.85)"; // 피버 = 별빛 오라
      ctx.shadowBlur = 16;
    }

    // 고도 변신 ① 목도리(80계단~) — 몸 뒤로 휘날린다(몸통보다 먼저 그려 뒤에 깔림)
    if (eng.p >= GEAR_STAGES[0].at) {
      const fl = Math.sin(now / 130) * (run ? 2.6 : 1);
      ctx.strokeStyle = "#E8543F";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-1, -25.5);
      ctx.quadraticCurveTo(-7, -24.5 + fl, -12, -23 + fl * 1.4);
      ctx.quadraticCurveTo(-15, -22 + fl * 1.8, -18, -20 + fl * 2.2);
      ctx.stroke();
    }
    // 관절 좌표 — 달릴 땐 무릎·팔꿈치가 접히고, 대기 자세는 곧게 선다
    const legs = run
      ? sw > 0
        ? [[6, -7, 9.5, -0.5], [-5, -7.5, -8.5, -1]]
        : [[4, -8, 2.5, -0.5], [-6.5, -7, -4, -0.5]]
      : [[3.5, -6.5, 4.5, 0], [-3.5, -6.5, -4.5, 0]];
    const arms = run
      ? [[8.5, -18.5 + sw * 2.2], [-7.5, -20 - sw * 2.2]]
      : [[5.5, -16.5], [-5.5, -16.5]];

    // 낮엔 잉크색, 밤엔 흰색 — 배경 여정과 함께 러너 선색도 보간(낮 하늘 위 흰 스틱맨 실종 방지)
    const inkC = mixRgb([32, 48, 66], [255, 255, 255], this.nightF);
    ctx.strokeStyle = inkC;
    ctx.fillStyle = inkC;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, -27.4);
    ctx.lineTo(0, -13);
    for (const [hx, hy] of arms) {
      ctx.moveTo(0, -23);
      ctx.lineTo(hx, hy);
    }
    for (const [kx, ky, fxp, fyp] of legs) {
      ctx.moveTo(0, -13);
      ctx.lineTo(kx, ky);
      ctx.lineTo(fxp, fyp);
    }
    ctx.stroke();
    // 손 점 + 장화 실착(M3 — 내 장화 티어 색, 무지개는 걸음마다 순환)
    for (const [hx, hy] of arms) {
      ctx.beginPath();
      ctx.arc(hx, hy, 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = this.bootRainbow ? BOOT_RAINBOW[eng.p % BOOT_RAINBOW.length] : this.bootColor;
    for (const [, , fxp, fyp] of legs) {
      ctx.beginPath();
      ctx.arc(fxp, fyp, 2.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = inkC;
    ctx.beginPath();
    ctx.arc(0, -34, 6.6, 0, Math.PI * 2);
    ctx.fill();

    // 고도 변신 ② 고글(300~799) ③ 헬멧(800~) — 헬멧이 생기면 고글은 그 안이므로 생략
    if (eng.p >= GEAR_STAGES[2].at) {
      ctx.strokeStyle = "#DCE9FF";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -33.4, 9.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, -33.4, 7, -0.7, 1.2);
      ctx.stroke();
    } else if (eng.p >= GEAR_STAGES[1].at) {
      ctx.strokeStyle = "rgba(158,230,255,.9)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-6.4, -34);
      ctx.lineTo(6.4, -34);
      ctx.stroke();
      ctx.fillStyle = "rgba(158,230,255,.28)";
      ctx.beginPath();
      ctx.arc(2.6, -34, 2.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#9EE6FF";
      ctx.stroke();
    }

    // 장착한 방패 — 파란 버블(깨지는 순간이 곧 설명)
    if (eng.shield > 0) {
      ctx.strokeStyle = "rgba(125,176,255,.85)";
      ctx.fillStyle = "rgba(125,176,255,.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -18, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, -18, 17, now / 300, now / 300 + 0.9);
      ctx.stroke();
    }
    ctx.restore();

    const gt = now - fx.goldAt;
    if (gt < 320 && fx.goldAt > 0) {
      const k = gt / 320;
      ctx.save();
      ctx.strokeStyle = `rgba(240,180,41,${(1 - k) * 0.8})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(x, y - 16, 10 + k * 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  private rr(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
