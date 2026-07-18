// 스텝 러시 엔진 — 순수 게임 로직(DOM·캔버스 없음). 시드 RNG라 같은 시드+같은 입력이면
// 계단 배열·골드 위치가 완전히 재현된다(e2e 결정성). 렌더러는 이 상태를 읽기만 한다.
//
// 규칙(복잡도 가드레일 3원칙, 2026-07-17 확정):
//  ① 조작은 끝까지 2버튼(오르기 / 방향 전환+오르기) ② 읽는 규칙 금지 — 밟으면 아는 효과만
//  ③ 낙하 조건은 "방향 실수"와 "스태미나 0" 둘로 고정. 다양성은 전부 보상 층에만.
// M1 = 일반+골드 계단만(별·아이템은 최고기록 해금으로 점진 공개 — M3).

export type Phase = "ready" | "run" | "over";
export type OverReason = "miss" | "tired";

/** 밸런스 상수 — M4에서 실플레이 튜닝 예정. */
const DRAIN_BASE = 9; // 시작 소모(%/s) — 초반은 초당 1.5스텝이면 유지된다
const DRAIN_RAMP = 0.09; // 계단당 소모 증가(%/s)
const DRAIN_CAP = 34; // 소모 상한(%/s) — 상급자 리듬(~5.7탭/s) 한계선
const REFILL = 6; // 한 계단 회복량(%)
const GOLD_REFILL = 30; // 골드 계단 추가 회복(%) — "밟으면 게이지가 확 찬다"로 즉시 읽히는 효과
const GOLD_MIN = 12; // 골드 간격 최소
const GOLD_SPAN = 9; // 골드 간격 랜덤 폭(12~20)
const STAR_MIN = 40; // 별 계단 간격 최소(골드보다 훨씬 희귀)
const STAR_SPAN = 30; // 별 계단 간격 랜덤 폭(40~69)
const FEVER_STEPS = 10; // 별 하나 = 자동 등반 계단 수
const FEVER_TICK = 110; // 자동 등반 리듬(ms/계단)
const SHIELD_MIN = 90; // 방패 간격 최소(첫 등장은 60~99)
const SHIELD_SPAN = 60;
const GLASS_MIN = 110; // 모래시계 간격 최소(첫 등장은 90~149)
const GLASS_SPAN = 70;
const FREEZE_MS = 5000; // 모래시계 = 스태미나 정지 시간

/** mulberry32 — 가볍고 결정적인 시드 RNG. */
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

export class RushEngine {
  /** dirs[i] = 계단 i−1 → i의 좌우 방향(+1 오른쪽/−1 왼쪽). dirs[0]은 시작 발판 → 첫 계단.
   *  첫 두 입력(dirs[1..2])은 항상 직진(+1) — 첫 조작이 "오르기"가 되게 하는 온보딩 보장
   *  (시드에 따라 첫 계단이 반대쪽이면 직감대로 누른 첫 입력이 즉사하는 억울함 방지). */
  readonly dirs: number[] = [1, 1, 1];
  /** posX[i] = 계단 i의 가로 위치(계단 단위 누적합). 렌더러의 월드 좌표 근거. */
  readonly posX: number[] = [0, 1, 2];
  /** 골드 계단 인덱스 집합. */
  readonly gold = new Set<number>();
  /** 별 계단(피버) 인덱스 집합 — 최고기록 해금(옵션 star) 후에만 생성된다. */
  readonly star = new Set<number>();
  /** 방패 계단(밟으면 헛디딤 1회 방어) — 옵션 shield 해금 후 생성. */
  readonly shieldStairs = new Set<number>();
  /** 모래시계 계단(밟으면 5초 스태미나 정지) — 옵션 glass 해금 후 생성. */
  readonly glassStairs = new Set<number>();

  p = 0; // 현재 밟고 선 계단(= 점수 = 오른 계단 수)
  facing: 1 | -1 = 1;
  stamina = 100;
  phase: Phase = "ready";
  reason: OverReason | null = null;
  /** 남은 피버 자동 등반 계단 수(별 밟으면 +10, 피버 중 별을 또 밟으면 연장). */
  feverLeft = 0;
  /** 장착한 방패(0/1) — 헛디딤 한 번을 흡수한다(스태미나 소진은 못 막음, 벌 축 직교). */
  shield = 0;
  /** 남은 스태미나 정지 시간(ms). */
  freezeMs = 0;
  /** 이번 판 방패가 막아준 횟수 — 화면이 변화 감지로 연출을 잇는다. */
  saved = 0;

  private rnd: () => number;
  private nextGold: number;
  private nextStar = 0;
  private nextShield = 0;
  private nextGlass = 0;
  private readonly starOn: boolean;
  private readonly shieldOn: boolean;
  private readonly glassOn: boolean;
  private feverT = 0;

  constructor(seed: number, opts: { star?: boolean; shield?: boolean; glass?: boolean } = {}) {
    this.rnd = mulberry32(seed);
    this.starOn = !!opts.star;
    this.shieldOn = !!opts.shield;
    this.glassOn = !!opts.glass;
    this.nextGold = GOLD_MIN + Math.floor(this.rnd() * GOLD_SPAN);
    // 해금 요소의 간격 rnd는 해금 시에만 뽑는다 — 미해금 판의 난수열이 기존과 동일하게 유지된다(결정성).
    if (this.starOn) this.nextStar = STAR_MIN + Math.floor(this.rnd() * STAR_SPAN);
    if (this.shieldOn) this.nextShield = 60 + Math.floor(this.rnd() * 40);
    if (this.glassOn) this.nextGlass = 90 + Math.floor(this.rnd() * 60);
    this.ensure(40);
  }

  /** 다음 계단이 정면인지 — true면 "오르기", false면 "방향 전환"이 정답. */
  nextIsAhead(): boolean {
    return this.dirs[this.p + 1] === this.facing;
  }

  /** 현재 계단 수 기준 스태미나 소모율(%/s). */
  drainRate(): number {
    return Math.min(DRAIN_CAP, DRAIN_BASE + this.p * DRAIN_RAMP);
  }

  /** [오르기] — 보던 방향 그대로 한 칸. */
  up(): boolean {
    return this.tryClimb(false);
  }

  /** [방향 전환] — 돌아서면서 한 칸(무한의 계단 문법: 전환도 곧 오르기). */
  turn(): boolean {
    return this.tryClimb(true);
  }

  /** 시간 경과 — run 중에만 스태미나가 준다. dt는 ms.
   *  피버 중엔 스태미나가 얼고(=100) FEVER_TICK 리듬으로 자동 등반한다(입력 무시 — 벌 조건 불변). */
  tick(dtMs: number): void {
    if (this.phase !== "run") return;
    if (this.freezeMs > 0) this.freezeMs = Math.max(0, this.freezeMs - dtMs);
    if (this.feverLeft > 0) {
      this.stamina = 100;
      this.feverT += dtMs;
      while (this.feverT >= FEVER_TICK && this.feverLeft > 0) {
        this.feverT -= FEVER_TICK;
        this.autoStep();
      }
      return;
    }
    if (this.freezeMs > 0) return; // 모래시계 — 숨이 얼어 있는 동안은 드레인 없음
    this.stamina -= this.drainRate() * (dtMs / 1000);
    if (this.stamina <= 0) {
      this.stamina = 0;
      this.phase = "over";
      this.reason = "tired";
    }
  }

  /** 피버 자동 등반 — 항상 옳은 방향(자동이라 낙하 없음, 순수 보상 층). 픽업도 그대로 줍는다. */
  private autoStep(): void {
    this.facing = this.dirs[this.p + 1] as 1 | -1;
    this.p += 1;
    this.feverLeft -= 1;
    if (this.star.has(this.p)) this.feverLeft += FEVER_STEPS; // 피버 중 별 = 연장
    this.collect();
    this.ensure(this.p + 30);
  }

  /** 현재 계단의 아이템 픽업(방패·모래시계) — 수동/자동 등반 공용. */
  private collect(): void {
    if (this.shieldStairs.has(this.p)) this.shield = 1;
    if (this.glassStairs.has(this.p)) this.freezeMs = FREEZE_MS;
  }

  private tryClimb(flip: boolean): boolean {
    if (this.phase === "over") return false;
    if (this.feverLeft > 0) return false; // 자동 질주 중엔 입력이 끼어들 자리가 없다
    if (this.phase === "ready") this.phase = "run";
    const before = this.facing;
    if (flip) this.facing = (this.facing === 1 ? -1 : 1) as 1 | -1;
    if (this.dirs[this.p + 1] !== this.facing) {
      if (this.shield > 0) {
        // 방패 — 헛디딤 1회 흡수: 제자리 복구(방향도 원상), 낙하 없음. 스태미나 소진은 못 막는다.
        this.shield = 0;
        this.saved += 1;
        this.facing = before;
        return false;
      }
      this.phase = "over";
      this.reason = "miss";
      return false;
    }
    this.p += 1;
    const bonus = this.gold.has(this.p) ? GOLD_REFILL : 0;
    this.stamina = Math.min(100, this.stamina + REFILL + bonus);
    if (this.star.has(this.p)) {
      this.feverLeft += FEVER_STEPS;
      this.feverT = 0;
    }
    this.collect();
    this.ensure(this.p + 30);
    return true;
  }

  /** 계단 배열을 upto까지 미리 생성(런 길이 1~4 가중, 런마다 방향 교대). */
  private ensure(upto: number): void {
    while (this.dirs.length <= upto) {
      const r = this.rnd();
      const len = r < 0.34 ? 1 : r < 0.68 ? 2 : r < 0.88 ? 3 : 4;
      const sign = -this.dirs[this.dirs.length - 1];
      for (let k = 0; k < len; k++) {
        this.dirs.push(sign);
        this.posX.push(this.posX[this.posX.length - 1] + sign);
      }
      while (this.nextGold < this.dirs.length) {
        this.gold.add(this.nextGold);
        this.nextGold += GOLD_MIN + Math.floor(this.rnd() * GOLD_SPAN);
      }
      while (this.starOn && this.nextStar < this.dirs.length) {
        if (this.gold.has(this.nextStar)) this.nextStar += 1; // 골드와 같은 칸 회피(간격 12+라 한 칸이면 충분)
        this.star.add(this.nextStar);
        this.nextStar += STAR_MIN + Math.floor(this.rnd() * STAR_SPAN);
      }
      while (this.shieldOn && this.nextShield < this.dirs.length) {
        while (this.gold.has(this.nextShield) || this.star.has(this.nextShield)) this.nextShield += 1;
        this.shieldStairs.add(this.nextShield);
        this.nextShield += SHIELD_MIN + Math.floor(this.rnd() * SHIELD_SPAN);
      }
      while (this.glassOn && this.nextGlass < this.dirs.length) {
        while (this.gold.has(this.nextGlass) || this.star.has(this.nextGlass) || this.shieldStairs.has(this.nextGlass)) this.nextGlass += 1;
        this.glassStairs.add(this.nextGlass);
        this.nextGlass += GLASS_MIN + Math.floor(this.rnd() * GLASS_SPAN);
      }
    }
  }
}
