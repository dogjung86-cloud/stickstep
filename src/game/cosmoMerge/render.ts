// 코스모 머지 렌더러 — 캔버스 격리(스텝 러시 render.ts 문법). 엔진 상태를 읽어 그리기만 한다.
// 배경(심우주 그라데이션+별밭+성운)은 리사이즈 때 오프스크린에 1회 베이크(도시 스프라이트 베이크 계보),
// 매 프레임은 drawImage 1장 + 반짝이 별 40개만. 천체는 sprites.ts 베이크를 회전·스케일로 찍는다.
// "내 은하"(우상단 나선)는 태양을 만들 때마다 별이 하나씩 박히는 기기 누적 메타 진행도다.

import { Particles, Shake } from "../gameKit";
import { CMX_H, CMX_W, HOLD_Y, LINE_Y, TRI, type CosmoEngine } from "./engine";
import { TIERS, sprite, tierExt } from "./sprites";

interface Ring {
  x: number;
  y: number;
  t0: number;
  r0: number;
  color: string;
}

interface Popup {
  x: number;
  y: number;
  t0: number;
  txt: string;
  color: string;
  size: number;
}

/** 콤보 단수별 팝업 색 — 오를수록 뜨거워진다. */
function comboColor(n: number): string {
  if (n >= 5) return "#FF7EA8";
  if (n === 4) return "#FF9F5A";
  if (n === 3) return "#FFC46A";
  return "#FFE9A8";
}

interface Star {
  x: number;
  y: number;
  r: number;
  ph: number;
  sp: number;
}

/** 태양 → 은하 별 비행(적립 연출). 시작점은 월드 좌표, 목적지는 은하(화면 좌표). */
interface Flight {
  x0: number;
  y0: number;
  t0: number;
  done?: () => void;
}
const FLIGHT_MS = 780;

function rng32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class CosmoRenderer {
  /** 은하에 박힌 별 수(= 지금까지 만든 태양, 기기 누적) — index가 갱신한다. */
  galaxyN = 0;
  reducedMotion = false;
  /** 스프라이트 도감 모드(QA 눈검수 — DEV 훅으로 토글). */
  gallery = false;

  private readonly cv: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly dpr = Math.min(window.devicePixelRatio || 1, 2);
  private cw = 0;
  private ch = 0;
  private s = 1;
  private ox = 0;
  private oy = 0;
  private bg: HTMLCanvasElement | null = null;
  private readonly twinkles: Star[] = [];
  private readonly particles = new Particles();
  private readonly shake = new Shake();
  private rings: Ring[] = [];
  private popups: Popup[] = [];
  private novaT = -1e9;
  private novaX = CMX_W / 2;
  private novaY = CMX_H / 2;
  /** 착지 스쿼시&스트레치(id → 시작 tMs) — 반발 물리 대신 '보이는 탄성'이 손맛을 만든다. */
  private readonly squash = new Map<number, number>();
  /** 내 은하 중심(화면 좌표) — 매 프레임 drawGalaxy가 갱신, 별 비행의 목적지. */
  private gx = 0;
  private gy = 0;
  private galaxyPopT = -1e9;
  private galaxyNewT = -1e9;
  /** 진행 중인 별 비행 — retry로도 비우지 않는다(은하는 판과 무관한 영구 메타). */
  private flights: Flight[] = [];

  constructor(cv: HTMLCanvasElement) {
    this.cv = cv;
    const ctx = cv.getContext("2d");
    if (!ctx) throw new Error("no 2d ctx");
    this.ctx = ctx;
    const r = rng32(20260718);
    for (let i = 0; i < 42; i++) {
      this.twinkles.push({ x: r(), y: r(), r: 0.6 + r() * 1.3, ph: r() * Math.PI * 2, sp: 0.8 + r() * 1.6 });
    }
  }

  resize(): void {
    const rect = this.cv.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return;
    this.cw = rect.width;
    this.ch = rect.height;
    this.cv.width = Math.round(rect.width * this.dpr);
    this.cv.height = Math.round(rect.height * this.dpr);
    // 양옆 거터 + 바닥 리프트 — 통이 화면에 꽉 차지 않고 "우주 유리 통" 객체로 떠 보이게(수박게임 상자 문법)
    const gut = Math.max(18, this.cw * 0.05);
    const lift = 14;
    this.s = Math.min((this.cw - gut * 2) / CMX_W, (this.ch - lift - 4) / CMX_H);
    this.ox = (this.cw - CMX_W * this.s) / 2;
    this.oy = this.ch - lift - CMX_H * this.s;
    this.bakeBg();
  }

  reset(): void {
    this.particles.clear();
    this.rings = [];
    this.popups = [];
    this.squash.clear();
    this.novaT = -1e9;
  }

  /** 캔버스 CSS 좌표 → 보드 월드 x(입력 조준용). */
  worldX(px: number): number {
    return (px - this.ox) / this.s;
  }

  // ── 이벤트 연출(엔진 이벤트 큐를 index가 중계) ────────────────
  /** combo = 1.6초 창 안의 연쇄 순번(index가 계산) — 오를수록 파티클·링·흔들림이 커진다(점수 불변). */
  onMerge(x: number, y: number, tier: number, tMs: number, combo = 1): void {
    const g = TIERS[tier].glow;
    const k = Math.min(1 + (combo - 1) * 0.4, 2.6);
    this.rings.push({ x, y, t0: tMs, r0: TIERS[tier].r * 0.75, color: g });
    if (combo >= 2) this.rings.push({ x, y, t0: tMs + 80, r0: TIERS[tier].r * 0.5, color: comboColor(combo) });
    if (combo >= 4) this.rings.push({ x, y, t0: tMs + 160, r0: TIERS[tier].r * 0.3, color: "#FFFFFF" });
    this.particles.burst(x, y, { n: Math.round((10 + tier * 3) * k), color: g, speed: 46 + tier * 8 + combo * 6, up: 26, life: 500, size: 2.3 });
    if (combo >= 3) this.particles.burst(x, y, { n: 8 + combo * 2, color: comboColor(combo), speed: 90, up: 34, life: 560, size: 1.9 });
    this.popups.push({ x, y: y - TIERS[tier].r - 8, t0: tMs, txt: `+${TRI[tier]}`, color: "#FFE9A8", size: 13 });
    if (combo >= 2) {
      // 같은 지점 연쇄에서 팝업이 겹치지 않게 단수만큼 계단 상승
      this.popups.push({
        x,
        y: y - TIERS[tier].r - 26 - (combo - 2) * 14,
        t0: tMs + 60,
        txt: `콤보 ×${combo}`,
        color: comboColor(combo),
        size: Math.min(15 + combo, 21),
      });
    }
    if (tier >= 7) this.shake.kick(2.4 + (tier - 7) * 1.6);
    if (combo >= 3) this.shake.kick(Math.min(1.6 + combo * 0.7, 6));
  }

  onSun(x: number, y: number, tMs: number): void {
    this.rings.push({ x, y, t0: tMs, r0: 46, color: "#FFD24A" });
    this.rings.push({ x, y, t0: tMs + 90, r0: 30, color: "#FFF2C0" });
    this.particles.burst(x, y, { n: 46, color: "#FFD24A", speed: 120, up: 30, life: 760, size: 2.8 });
    this.shake.kick(7);
  }

  /** 태양 탄생 → 은하로 별 하나 비행. 카운트 반영은 착지 시 done 콜백(index가 이때 동기화). */
  flyStar(x: number, y: number, tMs: number, done?: () => void): void {
    if (this.reducedMotion) {
      this.galaxyPopT = tMs;
      this.galaxyNewT = tMs;
      done?.();
      return;
    }
    this.flights.push({ x0: x, y0: y, t0: tMs + 260, done }); // 탄생 버스트가 먼저 읽히게 잠깐 대기
  }

  onNova(x: number, y: number, victims: Array<{ x: number; y: number; tier: number }>, tMs: number): void {
    this.novaT = tMs;
    this.novaX = x;
    this.novaY = y;
    for (const v of victims) {
      this.particles.burst(v.x, v.y, { n: 7 + v.tier * 2, color: TIERS[v.tier].glow, speed: 90, up: 20, life: 720, size: 2.5 });
    }
    this.rings.push({ x, y, t0: tMs, r0: 60, color: "#FFE9A8" });
    this.shake.kick(this.reducedMotion ? 4 : 15);
  }

  onLand(x: number, y: number, tier: number, tMs: number, id?: number): void {
    this.particles.burst(x, y + TIERS[tier].r * 0.6, { n: 5, color: "#8FA0B8", speed: 22, up: 8, life: 300, size: 1.5 });
    if (id !== undefined && !this.reducedMotion) this.squash.set(id, tMs);
  }

  // ── 메인 드로우 ──────────────────────────────────────────────
  draw(eng: CosmoEngine, tMs: number, dtNorm: number): void {
    const { ctx, dpr } = this;
    if (this.cw < 4) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.cw, this.ch);
    if (this.bg) ctx.drawImage(this.bg, 0, 0, this.cw, this.ch);
    // 반짝이 별(라이브 레이어)
    ctx.fillStyle = "#DFEBFF";
    for (const st of this.twinkles) {
      const a = 0.22 + 0.5 * Math.abs(Math.sin(st.ph + (tMs / 1000) * st.sp));
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(st.x * this.cw, st.y * this.ch, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (this.gallery) {
      this.drawGallery();
      return;
    }

    // 통 밖 허공은 어둡게 — 별이 담긴 유리 통이 화면의 주인공이 된다(수박게임 상자 문법)
    const jl = this.ox - 9 * this.s;
    const jr = this.ox + (CMX_W + 9) * this.s;
    const jb = this.oy + (CMX_H + 13) * this.s;
    ctx.fillStyle = "rgba(2,4,10,0.45)";
    ctx.fillRect(0, 0, jl, this.ch);
    ctx.fillRect(jr, 0, this.cw - jr, this.ch);
    ctx.fillRect(jl, jb, jr - jl, this.ch - jb);

    // 은하는 화면 좌표 — 통·셰이크와 분리된 "먼 하늘"(영구 메타는 초신성에도 흔들리지 않는다)
    this.drawGalaxy(tMs);

    const off = this.shake.offset(dtNorm);
    ctx.save();
    ctx.translate(this.ox + off.x, this.oy + off.y);
    ctx.scale(this.s, this.s);

    this.drawFrame(eng);

    // 조준 가이드 + 착지 고스트(놓으면 어디서 멈추는지)
    if (eng.phase !== "over") {
      const hr = TIERS[eng.heldTier].r;
      const landY = eng.landingY();
      ctx.strokeStyle = "rgba(159,212,255,0.3)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(eng.aimX, HOLD_Y + hr + 4);
      ctx.lineTo(eng.aimX, landY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = "#9FD4FF";
      ctx.beginPath();
      ctx.arc(eng.aimX, landY, hr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 천체들(착지 직후엔 세로로 눌렸다 팅 — 스쿼시&스트레치, 월드 수직축 기준)
    for (const b of eng.renderBodies()) {
      const img = sprite(b.tier, TIERS[b.tier].r * this.s * this.dpr);
      const half = b.r * tierExt(b.tier);
      ctx.save();
      ctx.translate(b.x, b.y);
      const sq = this.squash.get(b.id);
      if (sq !== undefined) {
        const k = (tMs - sq) / 180;
        if (k >= 1) {
          this.squash.delete(b.id);
        } else {
          const w = Math.sin(Math.min(1, Math.max(0, k)) * Math.PI);
          ctx.scale(1 + 0.16 * w, 1 - 0.2 * w);
        }
      }
      ctx.rotate(b.angle);
      ctx.drawImage(img, -half, -half, half * 2, half * 2);
      ctx.restore();
    }

    // 드롭 대기 천체(둥실 보브) + 이름 라벨(천체 바로 위, 조준을 따라다님 — 사용자 피드백)
    if (eng.phase !== "over") {
      const t = eng.heldTier;
      const bob = this.reducedMotion ? 0 : Math.sin(tMs / 340) * 2.4;
      const img = sprite(t, TIERS[t].r * this.s * this.dpr);
      const half = TIERS[t].r * tierExt(t);
      ctx.save();
      ctx.translate(eng.aimX, HOLD_Y + bob);
      ctx.drawImage(img, -half, -half, half * 2, half * 2);
      ctx.restore();
      const lx = Math.min(CMX_W - 26, Math.max(26, eng.aimX)); // 벽 근처 클램프
      const ly = HOLD_Y + bob - half - 7;
      ctx.font = "800 11px Pretendard, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(5,9,20,0.72)";
      ctx.strokeText(TIERS[t].name, lx, ly);
      ctx.fillStyle = "#DCE8FA";
      ctx.fillText(TIERS[t].name, lx, ly);
    }

    // 합체 링
    this.rings = this.rings.filter((r) => tMs - r.t0 < 430);
    for (const r of this.rings) {
      const k = Math.max(0, (tMs - r.t0) / 430);
      ctx.globalAlpha = (1 - k) * 0.8;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2.6 * (1 - k) + 0.6;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r0 + k * 46, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    this.particles.update(dtNorm * 16.7);
    this.particles.draw(ctx);

    // 점수·콤보 팝업
    this.popups = this.popups.filter((p) => tMs - p.t0 < 760);
    ctx.textAlign = "center";
    for (const p of this.popups) {
      const k = Math.max(0, (tMs - p.t0) / 760);
      ctx.globalAlpha = 1 - k;
      ctx.font = `800 ${p.size}px Pretendard, system-ui, sans-serif`;
      ctx.fillStyle = p.color;
      ctx.fillText(p.txt, p.x, p.y - k * 28);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // 태양 → 은하 별 비행(화면 좌표, 모든 것 위로) — 착지 순간 팝·카운트 갱신(done)
    if (this.flights.length > 0) {
      const keep: Flight[] = [];
      for (const f of this.flights) {
        const k = (tMs - f.t0) / FLIGHT_MS;
        if (k >= 1) {
          this.galaxyPopT = tMs;
          this.galaxyNewT = tMs;
          f.done?.();
          continue;
        }
        keep.push(f);
        if (k < 0) continue;
        const sx = this.ox + f.x0 * this.s;
        const sy = this.oy + f.y0 * this.s;
        const mx = (sx + this.gx) / 2 - 30;
        const my = Math.min(sy, this.gy) - 64;
        for (let j = 4; j >= 0; j--) {
          const kk = Math.max(0, k - j * 0.035);
          const e = kk * kk * (3 - 2 * kk);
          const u = 1 - e;
          const px = u * u * sx + 2 * u * e * mx + e * e * this.gx;
          const py = u * u * sy + 2 * u * e * my + e * e * this.gy;
          ctx.globalAlpha = j === 0 ? 1 : Math.max(0.08, 0.5 - j * 0.1);
          ctx.fillStyle = "#FFE9A8";
          ctx.beginPath();
          ctx.arc(px, py, j === 0 ? 2.8 : Math.max(0.7, 2.2 - j * 0.35), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      this.flights = keep;
    }

    // 초신성 섬광(화면 좌표) — 흰 플래시 + 충격파 링
    const nk = (tMs - this.novaT) / 760;
    if (nk >= 0 && nk < 1) {
      const cx = this.ox + this.novaX * this.s;
      const cy = this.oy + this.novaY * this.s;
      ctx.globalAlpha = (1 - nk) * (this.reducedMotion ? 0.45 : 0.82);
      ctx.fillStyle = "#FFF7E6";
      ctx.fillRect(0, 0, this.cw, this.ch);
      ctx.globalAlpha = (1 - nk) * 0.9;
      ctx.strokeStyle = "#FFD98A";
      ctx.lineWidth = 7 * (1 - nk) + 1;
      ctx.beginPath();
      ctx.arc(cx, cy, nk * Math.max(this.cw, this.ch) * 1.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 위험 경고 — 상단 붉은 베일
    if (eng.danger > 0.03 && eng.phase !== "over") {
      const g = ctx.createLinearGradient(0, 0, 0, this.oy + LINE_Y * this.s + 30);
      g.addColorStop(0, `rgba(240,68,82,${0.3 * eng.danger})`);
      g.addColorStop(1, "rgba(240,68,82,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, this.cw, this.oy + LINE_Y * this.s + 30);
    }
  }

  // ── 배경·보드 프레임 ─────────────────────────────────────────
  private bakeBg(): void {
    const cv = document.createElement("canvas");
    cv.width = Math.max(4, Math.round(this.cw * this.dpr));
    cv.height = Math.max(4, Math.round(this.ch * this.dpr));
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(this.dpr, this.dpr);
    const g = ctx.createLinearGradient(0, 0, 0, this.ch);
    g.addColorStop(0, "#050914");
    g.addColorStop(0.45, "#0A1224");
    g.addColorStop(1, "#111B33");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.cw, this.ch);
    // 성운 워시 — 인디고·틸(아주 옅게, 근-동조)
    const washes: Array<[number, number, number, string]> = [
      [0.24, 0.3, 0.52, "rgba(96,74,190,0.11)"],
      [0.78, 0.58, 0.46, "rgba(52,150,168,0.09)"],
      [0.5, 0.95, 0.6, "rgba(88,56,150,0.08)"],
    ];
    for (const [x, y, r, c] of washes) {
      const w = ctx.createRadialGradient(x * this.cw, y * this.ch, 4, x * this.cw, y * this.ch, r * this.cw);
      w.addColorStop(0, c);
      w.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = w;
      ctx.fillRect(0, 0, this.cw, this.ch);
    }
    // 정적 별밭 2층
    const r = rng32(777);
    for (let i = 0; i < 130; i++) {
      const a = 0.12 + r() * 0.4;
      ctx.globalAlpha = a;
      ctx.fillStyle = r() > 0.86 ? "#BFD6FF" : "#8FA6CC";
      ctx.beginPath();
      ctx.arc(r() * this.cw, r() * this.ch, 0.4 + r() * 1.0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    this.bg = cv;
  }

  /** 우주 유리 통 — 수박게임의 '상자'를 코스모 문법으로: 유리 벽·받침·벌어진 입구.
   *  입구 높이 = 게임오버 라인(넘치면 끝이 통의 물리로 읽힌다). */
  private drawFrame(eng: CosmoEngine): void {
    const { ctx } = this;
    const RIM = LINE_Y;
    const wallW = 7;
    // 뒷유리 틴트 — 통 안 우주가 미묘하게 차오른 듯
    const back = ctx.createLinearGradient(0, RIM, 0, CMX_H);
    back.addColorStop(0, "rgba(120,178,255,0.04)");
    back.addColorStop(1, "rgba(132,186,255,0.11)");
    ctx.fillStyle = back;
    ctx.fillRect(0, RIM, CMX_W, CMX_H - RIM);
    // 옆벽 유리 기둥(바깥쪽) — 안쪽 면이 밝다
    for (const side of [-1, 1] as const) {
      const x0 = side < 0 ? -wallW : CMX_W;
      const g = ctx.createLinearGradient(x0, 0, x0 + wallW, 0);
      if (side < 0) {
        g.addColorStop(0, "rgba(150,200,255,0.06)");
        g.addColorStop(1, "rgba(160,210,255,0.26)");
      } else {
        g.addColorStop(0, "rgba(160,210,255,0.26)");
        g.addColorStop(1, "rgba(150,200,255,0.06)");
      }
      ctx.fillStyle = g;
      ctx.fillRect(x0, RIM, wallW, CMX_H - RIM + 8);
    }
    // 유리 스펙큘러 — 왼벽 안쪽 세로 하이라이트 한 줄
    ctx.fillStyle = "rgba(220,240,255,0.1)";
    ctx.fillRect(3, RIM + 16, 2.2, (CMX_H - RIM) * 0.38);
    // 받침 슬래브
    const base = ctx.createLinearGradient(0, CMX_H, 0, CMX_H + 13);
    base.addColorStop(0, "rgba(150,200,255,0.32)");
    base.addColorStop(1, "rgba(90,130,200,0.05)");
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.roundRect(-wallW - 4, CMX_H, CMX_W + wallW * 2 + 8, 13, 6);
    ctx.fill();
    // 바닥 글로우(안쪽)
    const fg = ctx.createLinearGradient(0, CMX_H - 26, 0, CMX_H);
    fg.addColorStop(0, "rgba(120,160,235,0)");
    fg.addColorStop(1, "rgba(130,175,245,0.2)");
    ctx.fillStyle = fg;
    ctx.fillRect(0, CMX_H - 26, CMX_W, 26);
    // 입구 립 — 양쪽 바깥으로 살짝 벌어진 밝은 입술(여기가 곧 게임오버 라인)
    ctx.fillStyle = "rgba(175,218,255,0.55)";
    ctx.beginPath();
    ctx.roundRect(-wallW - 6, RIM - 2.5, wallW + 7, 4.4, 2.2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(CMX_W - 1, RIM - 2.5, wallW + 7, 4.4, 2.2);
    ctx.fill();
    // 게임오버 라인 — 위험할수록 붉게(입구 높이와 일치)
    const d = eng.danger;
    const lc = d > 0.03 ? `rgba(${Math.round(110 + 130 * d)},${Math.round(127 - 60 * d)},${Math.round(163 - 90 * d)},${0.35 + 0.5 * d})` : "rgba(110,127,163,0.32)";
    ctx.strokeStyle = lc;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.moveTo(4, LINE_Y);
    ctx.lineTo(CMX_W - 4, LINE_Y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /** 내 은하 — 우상단 나선. 태양 하나 = 별 하나(기기 누적, 장기 목표).
   *  화면 좌표: "다음" 칩·★ 필 아래 스택(y178)이 기본, 무대가 짧으면 통 위 하늘(월드 y44)로 클램프.
   *  크기·팝 스케일을 바꿀 땐 만렙(48별) 원반이 통 입구(라인 y96)와 토스트 밴드를 침범하지 않는지 검산. */
  private drawGalaxy(tMs: number): void {
    const { ctx } = this;
    this.gx = this.cw - 66;
    this.gy = Math.min(this.oy + 44 * this.s, 178);
    ctx.save();
    ctx.translate(this.gx, this.gy);
    // 별 착지 팝 — 스케일 바운스 + 확산 링(적립 순간을 시선으로 학습)
    const pk = (tMs - this.galaxyPopT) / 460;
    if (pk >= 0 && pk < 1) {
      const w = Math.sin(Math.min(1, pk) * Math.PI);
      ctx.scale(1 + 0.26 * w, 1 + 0.26 * w);
      ctx.globalAlpha = (1 - pk) * 0.7;
      ctx.strokeStyle = "#FFE9A8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16 + pk * 40, (16 + pk * 40) * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.rotate(this.reducedMotion ? 0 : tMs / 26000);
    // 중심 벌지
    const core = ctx.createRadialGradient(0, 0, 0.5, 0, 0, 13);
    core.addColorStop(0, "rgba(255,238,190,0.9)");
    core.addColorStop(1, "rgba(255,220,150,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    const n = Math.min(this.galaxyN, 48);
    if (n === 0) {
      // 빈 은하 — 첫 태양을 기다리는 점선 원반
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = "#9FB4DC";
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      const fresh = tMs - this.galaxyNewT < 1600;
      for (let i = 0; i < n; i++) {
        const t = i * 0.5;
        const ang = (i % 2) * Math.PI + t * 0.62;
        // 성장은 로그형 캡 — 별이 늘수록 원반이 커지되 48별에서도 반경 46을 넘지 않는다
        const rr = 9 + 37 * (1 - Math.exp(-i / 13));
        const x = Math.cos(ang) * rr;
        const y = Math.sin(ang) * rr * 0.52;
        const isNew = fresh && i === n - 1;
        ctx.globalAlpha = isNew ? 1 : 0.45 + 0.45 * Math.abs(Math.sin(i * 1.7 + tMs / 900));
        ctx.fillStyle = i % 3 === 0 ? "#FFE9A8" : "#DCE9FF";
        ctx.beginPath();
        ctx.arc(x, y, (i % 3 === 0 ? 2.1 : 1.7) + (isNew ? 1.3 : 0), 0, Math.PI * 2);
        ctx.fill();
        if (isNew) {
          // 갓 박힌 별 — 십자 스파클
          const sp = 6 + 2 * Math.sin(tMs / 120);
          ctx.strokeStyle = "#FFF6DC";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - sp, y);
          ctx.lineTo(x + sp, y);
          ctx.moveTo(x, y - sp);
          ctx.lineTo(x, y + sp);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /** 스프라이트 도감(QA) — 11천체를 격자로, 이름과 함께. */
  private drawGallery(): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(this.ox, this.oy);
    ctx.scale(this.s, this.s);
    ctx.font = "800 13px Pretendard, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#DCE6F4";
    ctx.fillText("태양 만들기 — 천체 도감(크기 순서는 실제 그대로)", CMX_W / 2, 22);
    const disp = [16, 18, 22, 26, 30, 32, 34, 34, 28, 34, 32];
    for (let t = 0; t < TIERS.length; t++) {
      const col = t % 3;
      const row = Math.floor(t / 3);
      const cx = 56 + col * 109; // 보드 폭 330 기준(통 좁힘에 맞춰 그리드도 축소)
      const cy = 86 + row * 116;
      const rD = disp[t];
      const img = sprite(t, rD * this.s * this.dpr);
      const half = rD * tierExt(t);
      ctx.drawImage(img, cx - half, cy - half, half * 2, half * 2);
      ctx.fillStyle = "#C7D4E8";
      ctx.font = "800 12px Pretendard, system-ui, sans-serif";
      ctx.fillText(TIERS[t].name, cx, cy + 58);
    }
    ctx.restore();
  }
}
