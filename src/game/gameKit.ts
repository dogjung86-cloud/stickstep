// gameKit — 미니게임 공용 게임필 도구(스텝 러시 M2에서 신설, 다음 게임들이 재사용).
// 파티클(캔버스 풀)·셰이크(감쇠 오프셋)·SFX(WebAudio 소형 신스). 전부 실패 안전:
// AudioContext가 없거나 suspended(합성 이벤트 = 사용자 활성화 없음)면 조용히 무음.
// 게인 규율은 soundLab 계승 — 마스터 캡 0.2, 개별 비프는 그 아래.

// ── 파티클 ──────────────────────────────────────────────
interface Particle {
  x: number; y: number; vx: number; vy: number;
  age: number; life: number; size: number; color: string;
}

export class Particles {
  private pool: Particle[] = [];

  burst(x: number, y: number, o: { n: number; color: string; speed?: number; up?: number; life?: number; size?: number }): void {
    const speed = o.speed ?? 60;
    for (let i = 0; i < o.n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.4 + Math.random() * 0.6);
      this.pool.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - (o.up ?? 40),
        age: 0,
        life: (o.life ?? 420) * (0.7 + Math.random() * 0.6),
        size: (o.size ?? 2.4) * (0.7 + Math.random() * 0.7),
        color: o.color,
      });
    }
    if (this.pool.length > 220) this.pool.splice(0, this.pool.length - 220); // 폭주 캡
  }

  /** dtMs만큼 적분 — 중력 완만, 수명 지난 입자 제거. */
  update(dtMs: number): void {
    const dt = dtMs / 1000;
    for (let i = this.pool.length - 1; i >= 0; i--) {
      const p = this.pool[i];
      p.age += dtMs;
      if (p.age >= p.life) {
        this.pool.splice(i, 1);
        continue;
      }
      p.vy += 260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  /** 월드 좌표계 컨텍스트에 그린다(호출부가 translate를 소유). */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.pool) {
      const k = 1 - p.age / p.life;
      ctx.globalAlpha = k * 0.9;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.6 + k * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.pool.length = 0;
  }
}

// ── 셰이크 ──────────────────────────────────────────────
export class Shake {
  private mag = 0;

  kick(m: number): void {
    this.mag = Math.max(this.mag, m);
  }

  /** 프레임마다 호출 — 감쇠하며 랜덤 오프셋 반환. */
  offset(dtNorm: number): { x: number; y: number } {
    if (this.mag < 0.15) {
      this.mag = 0;
      return { x: 0, y: 0 };
    }
    const o = {
      x: (Math.random() * 2 - 1) * this.mag,
      y: (Math.random() * 2 - 1) * this.mag,
    };
    this.mag *= Math.pow(0.82, dtNorm);
    return o;
  }
}

// ── SFX(WebAudio 소형 신스 + 이벤트 샘플) ───────────────
// 신스 비프가 기본(지연 0·스텝 사다리음은 게임 디자인), 굵직한 이벤트(낙하·신기록·피버·
// 세이브·프리즈·장비)는 발주 샘플(mp3)이 있으면 그걸 쓰고 없으면 신스로 폴백한다.
export class Sfx {
  enabled = true;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private samples = new Map<string, AudioBuffer>();
  private samplesRequested = false;

  /** Bgm 등 외부 공유용 컨텍스트 — init 후에만 값이 있다. */
  get context(): AudioContext | null {
    return this.ctx;
  }

  /** 반드시 사용자 제스처 핸들러 안에서 호출(soundLab 규율). 실패해도 게임은 무음 진행. */
  init(): void {
    if (this.ctx) {
      void this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.2; // 마스터 캡
      this.master.connect(this.ctx.destination);
      void this.ctx.resume().catch(() => {});
    } catch {
      this.ctx = null;
    }
  }

  private get ready(): boolean {
    return this.enabled && !!this.ctx && this.ctx.state === "running" && !!this.master;
  }

  /** 이벤트 샘플(mp3) 지연 로드 — init 뒤 1회만 유효. 실패 항목은 신스 폴백이 대신 운다. */
  loadSamples(urls: Record<string, string>): void {
    if (this.samplesRequested || !this.ctx) return;
    this.samplesRequested = true;
    for (const [name, url] of Object.entries(urls)) {
      void fetch(url)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((ab) => this.ctx!.decodeAudioData(ab))
        .then((buf) => {
          this.samples.set(name, buf);
        })
        .catch(() => {
          /* 없으면 신스 폴백 */
        });
    }
  }

  /** 샘플 1회 재생 — 성공 시 true(호출부가 신스 폴백을 건너뛴다). */
  private sample(name: string, gain = 0.8): boolean {
    if (!this.ready) return false;
    const buf = this.samples.get(name);
    if (!buf) return false;
    try {
      const src = this.ctx!.createBufferSource();
      src.buffer = buf;
      const g = this.ctx!.createGain();
      g.gain.value = gain;
      src.connect(g).connect(this.master!);
      src.start();
      return true;
    } catch {
      return false;
    }
  }

  private beep(freq: number, durMs: number, o: { type?: OscillatorType; gain?: number; slideTo?: number; delayMs?: number } = {}): void {
    if (!this.ready) return;
    try {
      const ctx = this.ctx!;
      const t0 = ctx.currentTime + (o.delayMs ?? 0) / 1000;
      const t1 = t0 + durMs / 1000;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = o.type ?? "square";
      osc.frequency.setValueAtTime(freq, t0);
      if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.slideTo), t1);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(o.gain ?? 0.5, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t1);
      osc.connect(g).connect(this.master!);
      osc.start(t0);
      osc.stop(t1 + 0.02);
    } catch {
      /* 무음 폴백 */
    }
  }

  /** 오르기 — 30계단 주기로 음이 올라가는 사다리 틱. */
  step(p: number): void {
    this.beep(500 + (p % 30) * 9, 55, { type: "square", gain: 0.28 });
  }

  gold(): void {
    this.beep(880, 90, { type: "triangle", gain: 0.5 });
    this.beep(1318, 130, { type: "triangle", gain: 0.5, delayMs: 70 });
  }

  fall(): void {
    if (this.sample("fall", 0.9)) return;
    this.beep(220, 320, { type: "sawtooth", gain: 0.45, slideTo: 60 });
  }

  best(): void {
    if (this.sample("best", 0.9)) return;
    this.beep(523, 110, { type: "triangle", gain: 0.5 });
    this.beep(659, 110, { type: "triangle", gain: 0.5, delayMs: 100 });
    this.beep(784, 200, { type: "triangle", gain: 0.55, delayMs: 200 });
  }

  /** 별 계단 — 피버 시작(빠른 상승 3연음). */
  fever(): void {
    if (this.sample("fever", 0.85)) return;
    this.beep(660, 80, { type: "triangle", gain: 0.5 });
    this.beep(880, 80, { type: "triangle", gain: 0.5, delayMs: 70 });
    this.beep(1174, 170, { type: "triangle", gain: 0.55, delayMs: 140 });
  }

  /** 고도 변신(목도리·고글·헬멧) 장착 — 샘플 우선, 폴백은 짧은 휙. */
  gear(): void {
    if (this.sample("gear", 0.7)) return;
    this.beep(620, 90, { type: "triangle", gain: 0.35, slideTo: 980 });
  }

  /** "지난 나"를 넘는 순간 — 두 음 도약. */
  pass(): void {
    this.beep(523, 90, { type: "square", gain: 0.32 });
    this.beep(784, 150, { type: "square", gain: 0.38, delayMs: 80 });
  }

  /** 방패 픽업 — 묵직한 두 음. */
  shield(): void {
    this.beep(392, 70, { type: "triangle", gain: 0.45 });
    this.beep(523, 100, { type: "triangle", gain: 0.5, delayMs: 60 });
  }

  /** 모래시계 픽업(= 프리즈 시작) — 얼음빛. */
  glass(): void {
    if (this.sample("freeze", 0.8)) return;
    this.beep(1046, 60, { type: "triangle", gain: 0.4 });
    this.beep(1318, 90, { type: "triangle", gain: 0.42, delayMs: 55 });
  }

  /** 방패 파열(세이브) — 버블 팝. */
  save(): void {
    if (this.sample("save", 0.85)) return;
    this.beep(340, 180, { type: "sawtooth", gain: 0.4, slideTo: 150 });
  }

  /** 한붓그리기 — 선 하나 켜짐(진행할수록 음이 오르는 네온 틱). */
  neon(i: number): void {
    this.beep(430 + Math.min(i, 24) * 26, 70, { type: "triangle", gain: 0.3 });
  }

  /** 한붓그리기 — 한 선 되돌리기(짧은 하강). */
  neonUndo(): void {
    this.beep(380, 80, { type: "triangle", gain: 0.24, slideTo: 240 });
  }

  /** 한붓그리기 — 홀수점 힌트 점등(비밀 발견 차임). 샘플 우선, 폴백은 3연 벨. */
  neonHint(): void {
    if (this.sample("hint", 0.8)) return;
    this.beep(988, 90, { type: "triangle", gain: 0.32 });
    this.beep(1318, 140, { type: "triangle", gain: 0.36, delayMs: 85 });
    this.beep(1568, 210, { type: "triangle", gain: 0.32, delayMs: 175 });
  }

  /** 레이저 미로 — 거울 회전 클릭(짧은 기계음 더블 틱). 고빈도라 신스 고정(지연 0). */
  flip(): void {
    this.beep(640, 45, { type: "square", gain: 0.22 });
    this.beep(880, 35, { type: "square", gain: 0.14, delayMs: 42 });
  }

  /** 레이저 미로 — 보석 점등(유리 차임). 샘플 우선, 폴백은 골드 두 음. */
  gemLit(): void {
    if (this.sample("gem", 0.85)) return;
    this.gold();
  }

  /** 레이저 미로 — 처음 배치로 리셋(되감기 휘릭). */
  resetWhoosh(): void {
    if (this.sample("reset", 0.7)) return;
    this.beep(700, 180, { type: "triangle", gain: 0.28, slideTo: 230 });
  }

  // ── 코스모 머지(천체 합체 퍼즐) 전용 — 전부 신스(샘플 발주는 추후) ──
  /** 드롭 — 짧은 톡. */
  drop(): void {
    this.beep(360, 40, { type: "sine", gain: 0.2 });
  }

  /** 착지 — 낮은 퍽. */
  thud(): void {
    this.beep(150, 70, { type: "sine", gain: 0.26, slideTo: 88 });
  }

  /** 합체 팝 — 티어가 오를수록 높고 풍성하게. */
  pop(k: number): void {
    const f = 320 * Math.pow(1.09, k);
    this.beep(f, 85, { type: "triangle", gain: 0.42 });
    this.beep(f * 1.5, 120, { type: "triangle", gain: 0.32, delayMs: 60 });
  }

  /** 태양 탄생 — 샘플 우선(코스모 발주), 폴백 4음 팡파르. */
  sunborn(): void {
    if (this.sample("sunborn", 0.9)) return;
    this.beep(523, 100, { type: "triangle", gain: 0.5 });
    this.beep(659, 100, { type: "triangle", gain: 0.5, delayMs: 90 });
    this.beep(784, 110, { type: "triangle", gain: 0.52, delayMs: 180 });
    this.beep(1046, 220, { type: "triangle", gain: 0.55, delayMs: 280 });
  }

  /** 연쇄 콤보 — 단수가 오를수록 높아지는 2음 아르페지오. */
  combo(n: number): void {
    const f = 660 + Math.min(n, 8) * 70;
    this.beep(f, 60, { type: "square", gain: 0.22 });
    this.beep(f * 1.34, 90, { type: "square", gain: 0.26, delayMs: 55 });
  }

  /** 초신성 — 샘플 우선(코스모 발주), 폴백 내려앉는 붐 + 반짝 여운. */
  nova(): void {
    if (this.sample("nova", 0.95)) return;
    this.beep(420, 500, { type: "sawtooth", gain: 0.5, slideTo: 48 });
    this.beep(90, 420, { type: "sine", gain: 0.5, slideTo: 40, delayMs: 40 });
    this.beep(1568, 160, { type: "triangle", gain: 0.3, delayMs: 420 });
    this.beep(2093, 220, { type: "triangle", gain: 0.26, delayMs: 540 });
  }

  dispose(): void {
    try {
      void this.ctx?.close();
    } catch {
      /* noop */
    }
    this.ctx = null;
    this.master = null;
    this.samples.clear();
  }
}

// ── BGM(존 크로스페이드 루프) ───────────────────────────
/** 배경음악 — 고도 존마다 다른 트랙을 크로스페이드로 잇는 루프 플레이어(스텝 러시가 1호,
 *  게임 공용). AudioContext는 Sfx의 것을 공유(init에서 주입 — 오디오 기동 지점 단일화).
 *  fetch/decode 실패·컨텍스트 부재는 전부 무음 무해(no-op) — 게임은 소리 없이도 완주 가능. */
export class Bgm {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bufs: (AudioBuffer | "loading" | "failed" | undefined)[] = [];
  private cur: { src: AudioBufferSourceNode; gain: GainNode; zone: number } | null = null;
  private zone = -1;
  private muted = false;
  private ducked = false;

  constructor(
    private urls: string[],
    private vol = 0.16, // 마스터 캡 0.2 아래(soundLab 규율) — 효과음보다 한 겹 뒤
  ) {}

  /** 사용자 제스처 안에서 Sfx.init() 직후 호출(같은 컨텍스트 공유). 반복 호출 무해. */
  init(ctx: AudioContext | null): void {
    if (this.master || !ctx) return;
    try {
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.target();
      this.master.connect(ctx.destination);
    } catch {
      this.ctx = null;
      this.master = null;
      return;
    }
    // init 전에 setZone이 먼저 왔다면(입력 전 루프가 존을 정함) 이제 로드를 시작한다
    if (this.zone >= 0) {
      const z = this.zone;
      this.zone = -1;
      this.setZone(z);
    }
  }

  private target(): number {
    return this.muted ? 0 : this.vol * (this.ducked ? 0.25 : 1);
  }

  private applyGain(rampS: number): void {
    if (!this.ctx || !this.master) return;
    try {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(this.master.gain.value, t);
      this.master.gain.linearRampToValueAtTime(this.target(), t + rampS);
    } catch {
      /* noop */
    }
  }

  setMuted(m: boolean): void {
    this.muted = m;
    this.applyGain(0.25);
  }

  /** 게임오버 시트 동안 살짝 가라앉힘(끄지 않는다 — 재도전 복귀가 이어지게). */
  duck(d: boolean): void {
    this.ducked = d;
    this.applyGain(0.6);
  }

  /** 존 전환 — 트랙 지연 로드 후 크로스페이드. 같은 존이면 no-op, 다음 존은 프리페치. */
  setZone(z: number): void {
    if (z === this.zone || z < 0 || z >= this.urls.length) return;
    this.zone = z;
    this.load(z);
    if (z + 1 < this.urls.length) this.load(z + 1);
  }

  private load(z: number): void {
    if (!this.ctx) return;
    const st = this.bufs[z];
    if (st === "failed" || st === "loading") return;
    if (st) {
      if (this.zone === z) this.play(z);
      return;
    }
    this.bufs[z] = "loading";
    void fetch(this.urls[z])
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((ab) => this.ctx!.decodeAudioData(ab))
      .then((buf) => {
        this.bufs[z] = buf;
        if (this.zone === z && this.cur?.zone !== z) this.play(z);
      })
      .catch(() => {
        this.bufs[z] = "failed";
      });
  }

  private play(z: number): void {
    if (!this.ctx || !this.master) return;
    const buf = this.bufs[z];
    if (!buf || buf === "loading" || buf === "failed" || this.cur?.zone === z) return;
    try {
      const t = this.ctx.currentTime;
      const fade = this.cur ? 2.4 : 0.9; // 첫 시작은 짧게(트랙 자체에 페이드인이 구워져 있다)
      if (this.cur) {
        const old = this.cur;
        old.gain.gain.cancelScheduledValues(t);
        old.gain.gain.setValueAtTime(old.gain.gain.value, t);
        old.gain.gain.linearRampToValueAtTime(0, t + fade);
        old.src.stop(t + fade + 0.1);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(1, t + fade);
      src.connect(g).connect(this.master);
      src.start(t);
      this.cur = { src, gain: g, zone: z };
    } catch {
      /* 무음 무해 */
    }
  }

  /** 정지·해제 — 컨텍스트는 소유자(Sfx)가 닫는다. */
  dispose(): void {
    try {
      this.cur?.src.stop();
      this.cur?.src.disconnect();
      this.master?.disconnect();
    } catch {
      /* noop */
    }
    this.cur = null;
    this.master = null;
    this.ctx = null;
  }
}
