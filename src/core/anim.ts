// 애니메이션 루프 매니저. 화면을 떠날 때 모든 캔버스 루프를 멈춘다.
// (프로토타입의 liveSims/stopSims를 일반화.)

type LoopFn = (dtNorm: number, tMs: number) => void;

const active = new Set<Loop>();

export class Loop {
  private raf = 0;
  private last = 0;
  constructor(private fn: LoopFn) {}

  start(): this {
    if (this.raf) return this;
    active.add(this);
    this.last = performance.now();
    const tick = (t: number) => {
      // 하한을 아주 낮게 둬서 고주사율(120Hz+) 기기에서도 실제 경과 시간대로 적분되게 한다.
      // 상한 2.4는 탭 전환·프레임 급락 시 순간 폭주를 막는 스파이크 캡.
      const dt = Math.max(0.01, Math.min(2.4, (t - this.last) / 16.7));
      this.last = t;
      this.fn(dt, t);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
    return this;
  }

  stop(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    active.delete(this);
  }
}

export function createLoop(fn: LoopFn): Loop {
  return new Loop(fn);
}

export function stopAllLoops(): void {
  for (const loop of Array.from(active)) loop.stop();
}
