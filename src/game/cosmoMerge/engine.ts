// 코스모 머지 엔진 — matter-js 강체 물리 + 머지 규칙(DOM·캔버스 없음, 렌더러는 상태를 읽기만).
// 수박게임 문법의 천체판: 같은 티어끼리 닿으면 다음 천체로 합체, 티어 순서 = 실제 크기 순서.
//
// 물리 손맛 튜닝 노트(수박게임 대조):
//  · 반발 낮게(거의 안 튐) + 질량 ∝ 면적(균일 밀도) — 큰 천체가 더미를 비집고 가라앉는다.
//  · 합체 결과물은 55% 크기로 태어나 6틱에 걸쳐 자란다 — 즉시 풀사이즈로 밀어내는 "팝콘 튐" 방지.
//  · 게임오버는 라인 위 체류 1.15초 지속 시에만 — 합체 반동으로 잠깐 튀는 건 봐준다.
//  · 프레임 적분은 16.7ms 고정 스텝(최대 4스텝) — 프레임 급락 시 터널링 방지.
// 드롭 순서는 mulberry32 시드(DEV sessionStorage.cmxSeed 고정 가능 — e2e 결정성). 물리 자체는
// 부동소수점 연산이라 기기 간 완전 결정성은 보장하지 않는다(리더보드 서버 검증은 후속 과제).
// 태양+태양 = 초신성: 보드 전체 소거 + 66점 + 우주먼지 비(별의 죽음이 새 먼지를 만든다).

import * as Matter from "matter-js";
import { DROP_TIERS, TIERS } from "./sprites";

const { Bodies, Body, Composite, Engine, Events } = Matter;

/** 보드 논리 좌표. 가로는 원본 수박게임의 타이트함에 맞춰 330(실기기 피드백 "통이 좁아야" —
 *  360은 화면을 꽉 채워 상자 느낌이 없었다). 렌더러가 양옆 거터를 남기고 유리 통으로 그린다. */
export const CMX_W = 330;
export const CMX_H = 520;
/** 게임오버 라인 — 이 위에 천체가 머물면 위험. */
export const LINE_Y = 96;
/** 드롭 대기 천체가 떠 있는 높이. */
export const HOLD_Y = 50;

/** 합성 점수 — 수박게임의 삼각수 커브 그대로(만들어진 티어 기준). */
export const TRI = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55];
export const NOVA_SCORE = 66;

// ── 밸런스 상수(실플레이 감상 후 이 블록만 튜닝) ────────────────
const GRAVITY = 1.12; // matter 기본 1.0보다 약간 묵직하게
const STEP = 1000 / 60;
const DROP_MS = 430; // 연속 드롭 쿨다운
const GRACE_MS = 950; // 갓 떨어진 천체는 라인 판정 제외
const OVER_SUSTAIN = 1150; // 라인 위 체류가 이만큼 지속돼야 게임오버
const GROW_START = 0.55; // 합체 결과물의 시작 크기 비율
const GROW_RATE = 1.14; // 틱당 성장 배율(6틱이면 풀사이즈)
const SPEED_CAP = 24; // 순간 폭주 속도 캡(터널링·팝콘 보험)
// 근접 합체(실기기 피드백 2026-07-18): 글로우 때문에 "붙어 보이는" 쌍이 몇 px 간격으로 안 합쳐지는
// 문제 — 마찰이 커 바닥에서 스스로 못 다가가므로, 표면 간격이 합반경의 6%(최소 3px) 이내면
// 충돌 없이도 합친다. 자석 힘 방식은 기각(정지 마찰을 못 이겨 무의미하거나, 이기면 더미가 미끄러짐).
const MERGE_GAP_MIN = 3;
const MERGE_GAP_K = 0.06;
const NOVA_DUST = 4; // 초신성 뒤 떨어지는 우주먼지 수
const RESTITUTION = 0.14; // 잔반동이 살짝 느껴지는 정도(실기기 피드백) — 크면 조준 배신·더미 출렁
const FRICTION = 0.38;
const DENSITY = 0.0012;

export type CmxPhase = "ready" | "run" | "over";

export interface CmxEvent {
  type: "merge" | "nova" | "drop" | "land";
  x: number;
  y: number;
  tier: number;
  /** land 전용 — 착지한 바디 id(렌더러의 스쿼시&스트레치 대상 지목). */
  id?: number;
}

export interface CmxBodyView {
  id: number;
  x: number;
  y: number;
  angle: number;
  tier: number;
  r: number;
}

interface Meta {
  tier: number;
  born: number;
  grow: number;
  landed: boolean;
}

/** mulberry32 — 스텝 러시와 같은 시드 RNG(드롭 순서 결정성). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export class CosmoEngine {
  phase: CmxPhase = "ready";
  score = 0;
  heldTier: number;
  nextTier: number;
  aimX = CMX_W / 2;
  cooldown = 0;
  /** 게임오버 위험도 0~1(라인 체류 누적 / 문턱). */
  danger = 0;
  maxTier = 0;
  sunBorn = 0;
  novaCount = 0;
  /** 이번 판에 합성으로 태어난 티어(첫 탄생 토스트·체인 하이라이트 근거). */
  readonly seen = new Set<number>();
  /** 화면이 프레임마다 비워 가는 이벤트 큐(연출·소리·토스트). */
  events: CmxEvent[] = [];
  /** 초신성 직전의 보드 스냅샷 — 렌더러가 증발 연출에 쓴다. */
  novaVictims: CmxBodyView[] = [];
  time = 0;

  private readonly eng: Matter.Engine;
  private readonly rng: () => number;
  private readonly meta = new Map<number, Meta>();
  private pending: Array<[Matter.Body, Matter.Body]> = [];
  private readonly consumed = new Set<number>();
  private drawn = 0;
  private overMs = 0;
  private acc = 0;
  private dustRainAt = -1;
  private readonly onCollide: (e: Matter.IEventCollision<Matter.Engine>) => void;
  private readonly onActive: (e: Matter.IEventCollision<Matter.Engine>) => void;

  constructor(seed: number) {
    this.rng = mulberry32(seed);
    this.eng = Engine.create({ enableSleeping: false, positionIterations: 10, velocityIterations: 8 });
    this.eng.gravity.y = GRAVITY;
    const wallOpt = { isStatic: true, friction: 0.3, restitution: 0.1 };
    Composite.add(this.eng.world, [
      Bodies.rectangle(CMX_W / 2, CMX_H + 24, CMX_W + 400, 48, wallOpt), // 바닥
      Bodies.rectangle(-24, 0, 48, CMX_H * 6, wallOpt), // 왼벽(위로 넉넉히)
      Bodies.rectangle(CMX_W + 24, 0, 48, CMX_H * 6, wallOpt), // 오른벽
    ]);
    // 충돌 시작 = 착지 감지 + 머지 후보 / 지속 접촉 = 머지 후보(성장 완료 후 맞닿은 쌍)
    this.onCollide = (e) => {
      for (const p of e.pairs) {
        this.markLand(p.bodyA);
        this.markLand(p.bodyB);
        this.queuePair(p.bodyA, p.bodyB);
      }
    };
    this.onActive = (e) => {
      for (const p of e.pairs) this.queuePair(p.bodyA, p.bodyB);
    };
    Events.on(this.eng, "collisionStart", this.onCollide);
    Events.on(this.eng, "collisionActive", this.onActive);
    this.heldTier = this.pick();
    this.nextTier = this.pick();
  }

  /** 첫 두 개는 우주먼지 보장(첫 합체를 바로 배우는 온보딩 — 스텝 러시 "첫 두 계단 직진" 문법). */
  private pick(): number {
    const t = this.drawn < 2 ? 0 : Math.floor(this.rng() * DROP_TIERS);
    this.drawn++;
    return t;
  }

  aim(x: number): void {
    const r = TIERS[this.heldTier].r;
    this.aimX = clamp(x, r + 3, CMX_W - r - 3);
  }

  drop(): boolean {
    if (this.phase === "over" || this.cooldown > 0) return false;
    const t = this.heldTier;
    const r = TIERS[t].r;
    const x = clamp(this.aimX, r + 3, CMX_W - r - 3);
    const b = this.spawnBody(t, x, HOLD_Y, 1, false);
    Body.setVelocity(b, { x: 0, y: 2.2 });
    this.heldTier = this.nextTier;
    this.nextTier = this.pick();
    this.aim(this.aimX); // 새 천체 반경으로 조준 범위 재클램프
    this.cooldown = DROP_MS;
    if (this.phase === "ready") this.phase = "run";
    this.events.push({ type: "drop", x, y: HOLD_Y, tier: t });
    return true;
  }

  /** DEV·e2e 훅 — 지정 티어를 풀사이즈로 즉시 소환(쿨다운 무시).
   *  still=true면 제자리 고정(정적 바디) — 실플레이로는 초신성이 보드를 계속 구조해
   *  게임오버 도달이 비결정적이라, 라인 판정(유예·지속) 검증용 핀으로 쓴다. */
  spawn(tier: number, x: number, y: number, still = false): void {
    const t = clamp(Math.round(tier), 0, TIERS.length - 1);
    const r = TIERS[t].r;
    const b = this.spawnBody(t, clamp(x, r + 3, CMX_W - r - 3), clamp(y, r + 2, CMX_H - r - 2), 1, true);
    if (still) Body.setStatic(b, true);
    if (this.phase === "ready") this.phase = "run";
  }

  tick(dtMs: number): void {
    if (this.phase === "over") return;
    const dt = Math.min(dtMs, 80); // 탭 전환 스파이크 캡
    this.time += dt;
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < 4) {
      Engine.update(this.eng, STEP);
      this.acc -= STEP;
      steps++;
      this.growPass();
      this.proximityPass();
      this.processMerges();
      this.clampSpeeds();
    }
    if (this.acc >= STEP) this.acc = 0; // 못 따라간 잔여는 버린다(고정 스텝 유지)
    // 초신성 뒤 우주먼지 비 — 별의 잔해가 새 재료가 된다
    if (this.dustRainAt > 0 && this.time >= this.dustRainAt) {
      this.dustRainAt = -1;
      for (let i = 0; i < NOVA_DUST; i++) {
        const x = 62 + (i * (CMX_W - 124)) / (NOVA_DUST - 1) + (this.rng() - 0.5) * 26;
        this.spawnBody(0, x, 34 + i * 7, 1, true);
      }
    }
    this.checkOverline(dt);
  }

  /** 조준 x에서 놓았을 때 멈출 중심 y(가이드 고스트용) — 원끼리 접촉하는 접선 높이 계산. */
  landingY(): number {
    const hr = TIERS[this.heldTier].r;
    let y = CMX_H - hr;
    for (const b of this.dynamicBodies()) {
      const m = this.meta.get(b.id);
      if (!m) continue;
      const br = TIERS[m.tier].r * m.grow;
      const dx = Math.abs(b.position.x - this.aimX);
      const reach = br + hr;
      if (dx >= reach) continue;
      const cy = b.position.y - Math.sqrt(reach * reach - dx * dx);
      if (cy < y) y = cy;
    }
    return Math.max(y, HOLD_Y + hr);
  }

  renderBodies(): CmxBodyView[] {
    const out: CmxBodyView[] = [];
    for (const b of this.dynamicBodies()) {
      const m = this.meta.get(b.id);
      if (!m) continue;
      out.push({ id: b.id, x: b.position.x, y: b.position.y, angle: b.angle, tier: m.tier, r: TIERS[m.tier].r * m.grow });
    }
    return out;
  }

  get bodyCount(): number {
    return this.meta.size;
  }

  destroy(): void {
    Events.off(this.eng, "collisionStart", this.onCollide);
    Events.off(this.eng, "collisionActive", this.onActive);
    Composite.clear(this.eng.world, false);
    Engine.clear(this.eng);
    this.meta.clear();
    this.pending = [];
  }

  // ── 내부 ─────────────────────────────────────────────────────
  /** 게임 천체 = meta에 등록된 바디(벽 제외) — 정적 핀(DEV)도 포함해 라인 판정이 일관된다. */
  private dynamicBodies(): Matter.Body[] {
    return Composite.allBodies(this.eng.world).filter((b) => this.meta.has(b.id));
  }

  private spawnBody(tier: number, x: number, y: number, grow: number, landed: boolean): Matter.Body {
    const b = Bodies.circle(x, y, TIERS[tier].r * grow, {
      restitution: RESTITUTION,
      friction: FRICTION,
      frictionStatic: 0.7,
      frictionAir: 0.012,
      density: DENSITY,
    });
    this.meta.set(b.id, { tier, born: this.time, grow, landed });
    Composite.add(this.eng.world, b);
    return b;
  }

  private removeBody(b: Matter.Body): void {
    this.meta.delete(b.id);
    Composite.remove(this.eng.world, b);
  }

  private markLand(b: Matter.Body): void {
    const m = this.meta.get(b.id);
    if (!m || m.landed) return;
    if (this.time - m.born > 1400) {
      m.landed = true; // 늦은 첫 충돌은 소리 없이 소진
      return;
    }
    m.landed = true;
    this.events.push({ type: "land", x: b.position.x, y: b.position.y, tier: m.tier, id: b.id });
  }

  private queuePair(a: Matter.Body, b: Matter.Body): void {
    const ma = this.meta.get(a.id);
    const mb = this.meta.get(b.id);
    if (!ma || !mb || ma.tier !== mb.tier) return;
    if (ma.grow < 1 || mb.grow < 1) return; // 성장 중엔 합체 유예(연쇄 폭주 방지)
    if (this.consumed.has(a.id) || this.consumed.has(b.id)) return;
    this.pending.push([a, b]);
  }

  private growPass(): void {
    for (const b of this.dynamicBodies()) {
      const m = this.meta.get(b.id);
      if (!m || m.grow >= 1) continue;
      const next = Math.min(1, m.grow * GROW_RATE);
      const f = next / m.grow;
      Body.scale(b, f, f);
      m.grow = next;
    }
  }

  /** 같은 티어 근접 스윕 — 시각적으로 붙은(간격 ≤ 여유) 쌍을 충돌 이벤트 없이도 합체 큐에 넣는다.
   *  n≤수십이라 n² 전수 비교도 스텝당 수천 회 수준 — 성능 무해. */
  private proximityPass(): void {
    const bodies = this.dynamicBodies();
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      const ma = this.meta.get(a.id);
      if (!ma || ma.grow < 1) continue;
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        const mb = this.meta.get(b.id);
        if (!mb || mb.tier !== ma.tier || mb.grow < 1) continue;
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const sumR = TIERS[ma.tier].r * 2;
        const allow = sumR + Math.max(MERGE_GAP_MIN, MERGE_GAP_K * sumR);
        if (dx * dx + dy * dy <= allow * allow) this.pending.push([a, b]);
      }
    }
  }

  private clampSpeeds(): void {
    for (const b of this.dynamicBodies()) {
      const sp = b.speed;
      if (sp > SPEED_CAP) {
        Body.setVelocity(b, { x: (b.velocity.x * SPEED_CAP) / sp, y: (b.velocity.y * SPEED_CAP) / sp });
      }
    }
  }

  private processMerges(): void {
    while (this.pending.length > 0) {
      const [a, b] = this.pending.shift() as [Matter.Body, Matter.Body];
      const ma = this.meta.get(a.id);
      const mb = this.meta.get(b.id);
      if (!ma || !mb || ma.tier !== mb.tier) continue;
      if (this.consumed.has(a.id) || this.consumed.has(b.id)) continue;
      this.consumed.add(a.id);
      this.consumed.add(b.id);
      const t = ma.tier;
      const mx = (a.position.x + b.position.x) / 2;
      const my = (a.position.y + b.position.y) / 2;
      const vx = (a.velocity.x + b.velocity.x) * 0.35;
      const vy = (a.velocity.y + b.velocity.y) * 0.35 - 1.4;
      this.removeBody(a);
      this.removeBody(b);
      if (t >= TIERS.length - 1) {
        this.supernova(mx, my);
        continue;
      }
      const nt = t + 1;
      const nr = TIERS[nt].r;
      const nb = this.spawnBody(nt, clamp(mx, nr + 3, CMX_W - nr - 3), Math.min(my, CMX_H - nr * GROW_START - 1), GROW_START, true);
      Body.setVelocity(nb, { x: vx, y: vy });
      this.score += TRI[nt];
      this.seen.add(nt);
      if (nt > this.maxTier) this.maxTier = nt;
      if (nt === TIERS.length - 1) this.sunBorn++;
      this.events.push({ type: "merge", x: mx, y: my, tier: nt });
    }
    this.consumed.clear();
  }

  /** 태양+태양 — 초신성 폭발: 보드 전체 소거 + 잠시 뒤 우주먼지 비. */
  private supernova(x: number, y: number): void {
    this.score += NOVA_SCORE;
    this.novaCount++;
    this.novaVictims = this.renderBodies();
    for (const b of this.dynamicBodies()) this.removeBody(b);
    this.pending = [];
    this.overMs = 0;
    this.danger = 0;
    this.dustRainAt = this.time + 650;
    this.events.push({ type: "nova", x, y, tier: TIERS.length - 1 });
  }

  private checkOverline(dt: number): void {
    let hot = false;
    for (const b of this.dynamicBodies()) {
      const m = this.meta.get(b.id);
      if (!m || this.time - m.born < GRACE_MS) continue;
      if (b.position.y - TIERS[m.tier].r * m.grow < LINE_Y) {
        hot = true;
        break;
      }
    }
    this.overMs = hot ? this.overMs + dt : Math.max(0, this.overMs - dt * 2);
    this.danger = Math.min(1, this.overMs / OVER_SUSTAIN);
    if (this.overMs >= OVER_SUSTAIN) this.phase = "over";
  }
}
