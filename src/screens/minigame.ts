// minigame — "단열 디펜스: 아이스크림을 지켜라" (대단원 III 보너스 게임)
// 열 공격이 다가오면 어떤 방식의 열 이동인지(전도·대류·복사) 판단해
// 알맞은 방어(나무 받침·바람막이·은박 반사판)를 탭해서 막는다.
// 배운 분류 감각을 반사신경 게임으로 복습 — XP 입장료를 내고 도전, 점수만큼 보상.

import { el, clamp, lerp } from "../core/dom";
import { icon } from "../core/icons";
import { haptic, HAPTIC } from "../core/haptics";
import { createLoop, type Loop } from "../core/anim";
import { fitCanvas } from "../ui/canvas";
import { getState, spendXp, awardXp, bestScore, submitScore } from "../core/store";
import type { Screen } from "../core/router";

export const GAME_ID = "u3-insulation";
const ENTRY_XP = 30;
const MAX_REWARD = 60;

type AtkType = "cond" | "conv" | "rad";
interface Attack {
  type: AtkType;
  side: -1 | 1; // 좌/우 (rad는 위 좌/우 모서리)
  t: number; // 0(등장)..1(명중)
  dur: number; // 접근 시간(초)
}
interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string; }

const ATK_NAME: Record<AtkType, string> = { cond: "전도", conv: "대류", rad: "복사" };
const DEF_META: { key: AtkType; name: string; sub: string; svg: string }[] = [
  {
    key: "cond",
    name: "나무 받침",
    sub: "맞닿는 열을 끊어요",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="9" width="18" height="7" rx="2.5"/><path d="M6.5 12.5h4M13.5 12.5h4"/></svg>',
  },
  {
    key: "conv",
    name: "바람막이",
    sub: "뜨거운 바람을 막아요",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 3.5c4 2 6 5 6 8.5s-2 6.5-6 8.5"/><path d="M3 8c2.5-1.5 5 1.5 3 3M3.5 12.5c2.5-1.5 5 1.5 3 3"/></svg>',
  },
  {
    key: "rad",
    name: "은박 반사판",
    sub: "빛(복사열)을 반사해요",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 4l10 5-10 5z" transform="rotate(18 12 9)"/><path d="M4 20h16M4 9l4 3M3 14l4 2"/></svg>',
  },
];

export function minigameScreen(onExit: () => void): Screen {
  // ---- DOM ----
  const xbtn = el("button", { class: "xbtn", attrs: { "aria-label": "나가기" }, html: icon("x", 20, { sw: 2.4 }) });
  const bestPill = el("div", { class: "pill mg-best", text: `최고 ${bestScore(GAME_ID)}점` });
  const header = el(
    "div",
    { class: "lheader" },
    xbtn,
    el("div", { class: "mg-title", text: "단열 디펜스" }),
    bestPill,
  );

  const canvas = el("canvas", { class: "mg-canvas" });
  const scoreVal = el("b", { text: "0" });
  const comboEl = el("span", { class: "mg-combo", text: "" });
  const hudScore = el("div", { class: "pill" }, el("span", { text: "점수 " }), scoreVal, comboEl);
  const hud = el("div", { class: "stage-hud" }, hudScore, el("div", {}));
  const stage = el("div", { class: "stage mg-stage" }, canvas, hud);

  const coach = el("div", { class: "mg-coach", attrs: { role: "status", "aria-live": "polite" } });

  const defRow = el("div", { class: "mg-defs" });
  for (const d of DEF_META) {
    const b = el(
      "button",
      { class: "mg-def", attrs: { type: "button", "aria-label": `${d.name} — ${d.sub}` } },
      el("span", { class: "mg-def-ic", html: d.svg }),
      el("span", { class: "mg-def-name", text: d.name }),
      el("span", { class: "mg-def-sub", text: d.sub }),
    );
    b.addEventListener("click", () => defend(d.key, b));
    defRow.appendChild(b);
  }
  const footer = el("div", { class: "footer mg-footer" }, coach, defRow);

  const overlay = el("div", { class: "mg-overlay" });
  const section = el("section", { class: "screen mg-screen" }, header, stage, footer, overlay);

  const snackEl = el("div", { class: "snack" });
  section.appendChild(snackEl);
  let snackTimer = 0;
  function snack(msg: string): void {
    snackEl.textContent = msg;
    snackEl.classList.add("show");
    window.clearTimeout(snackTimer);
    snackTimer = window.setTimeout(() => snackEl.classList.remove("show"), 2000);
  }

  // ---- 게임 상태 ----
  type Phase = "intro" | "play" | "over";
  let phase: Phase = "intro";
  let hp = 3;
  let score = 0;
  let combo = 1;
  let spawned = 0;
  let spawnIn = 1.6; // 첫 공격까지(초)
  let spawnInterval = 3.0;
  let atkDur = 2.8;
  let attacks: Attack[] = [];
  let sparks: Spark[] = [];
  let meltT = 0; // 스쿱 녹는 연출(0..1 진행 후 감소)
  let shield: { key: AtkType; side: -1 | 1; t: number } | null = null; // 방어 아이템 잔상
  let shake = 0;

  function resetGame(): void {
    hp = 3;
    score = 0;
    combo = 1;
    spawned = 0;
    spawnIn = 1.6;
    spawnInterval = 3.0;
    atkDur = 2.8;
    attacks = [];
    sparks = [];
    meltT = 0;
    shield = null;
    shake = 0;
    scoreVal.textContent = "0";
    comboEl.textContent = "";
    coach.innerHTML = "공격이 오면 <b>어떤 방식의 열 이동인지</b> 보고 알맞은 방어를 탭!";
  }

  // ---- 오버레이(시작/종료) ----
  function showIntro(): void {
    phase = "intro";
    overlay.classList.add("show");
    overlay.innerHTML = "";
    const rules = el("div", { class: "mg-card" });
    rules.appendChild(el("div", { class: "mg-card-title", text: "아이스크림을 지켜라" }));
    rules.appendChild(
      el("p", {
        class: "mg-card-p",
        html: "열 공격이 3가지 방식으로 몰려와요. <b>공격을 보고 어떤 열의 이동인지 판단</b>해서 알맞은 방어를 탭하세요. 아이스크림 세 스쿱이 다 녹으면 끝!",
      }),
    );
    const table = el("div", { class: "mg-rules" });
    const ROWS: [string, string, string][] = [
      ["뜨거운 철판이 스르륵", "전도 — 맞닿아 전달", "나무 받침"],
      ["뜨거운 바람이 훅", "대류 — 공기가 나름", "바람막이"],
      ["이글이글 광선", "복사 — 직진으로 도달", "은박 반사판"],
    ];
    for (const [a, b, c] of ROWS) {
      table.appendChild(
        el("div", { class: "mg-rule" }, el("span", { html: a }), el("span", { class: "mg-rule-mid", html: b }), el("b", { text: c })),
      );
    }
    rules.appendChild(table);
    const xp = getState().totalXp;
    rules.appendChild(el("p", { class: "mg-card-p dim", html: `입장료 <b>${ENTRY_XP} XP</b> · 점수만큼 XP 보상(최대 ${MAX_REWARD}) · 보유 <b>${xp} XP</b>` }));
    const startBtn = el("button", { class: "btn", text: `도전 시작 (-${ENTRY_XP} XP)` });
    startBtn.addEventListener("click", () => {
      if (!spendXp(ENTRY_XP)) {
        snack("XP가 부족해요. 레슨을 복습하면 XP를 모을 수 있어요!");
        return;
      }
      haptic(HAPTIC.ctaUnlock);
      resetGame();
      phase = "play";
      overlay.classList.remove("show");
    });
    rules.appendChild(startBtn);
    overlay.appendChild(rules);
  }

  function showOver(): void {
    phase = "over";
    const isBest = submitScore(GAME_ID, score);
    const reward = Math.min(MAX_REWARD, Math.round(score / 5));
    awardXp(reward);
    bestPill.textContent = `최고 ${bestScore(GAME_ID)}점`;
    haptic(HAPTIC.done);
    overlay.classList.add("show");
    overlay.innerHTML = "";
    const card = el("div", { class: "mg-card" });
    card.appendChild(el("div", { class: "mg-card-title", text: "아이스크림이 다 녹았어요" }));
    card.appendChild(el("div", { class: "mg-score" }, el("b", { text: String(score) }), el("span", { text: "점" })));
    if (isBest) card.appendChild(el("div", { class: "mg-newbest", text: "새 기록!" }));
    card.appendChild(el("p", { class: "mg-card-p", html: `보상 <b>+${reward} XP</b>` }));
    const retry = el("button", { class: "btn", text: `다시 도전 (-${ENTRY_XP} XP)` });
    retry.addEventListener("click", () => {
      if (!spendXp(ENTRY_XP)) {
        snack("XP가 부족해요!");
        return;
      }
      haptic(HAPTIC.ctaUnlock);
      resetGame();
      phase = "play";
      overlay.classList.remove("show");
    });
    const leave = el("button", { class: "btn-ghost", text: "지도로 돌아가기" });
    leave.addEventListener("click", exit);
    card.append(retry, leave);
    overlay.appendChild(card);
  }

  // ---- 게임 규칙 ----
  function spawnAttack(): void {
    const types: AtkType[] = ["cond", "conv", "rad"];
    const type = types[Math.floor(Math.random() * 3)];
    const side: -1 | 1 = Math.random() < 0.5 ? -1 : 1;
    attacks.push({ type, side, t: 0, dur: atkDur });
    spawned += 1;
    spawnInterval = Math.max(1.4, spawnInterval * 0.94);
    atkDur = Math.max(1.5, atkDur * 0.95);
    if (spawned <= 4) {
      coach.innerHTML = `<b>${ATK_NAME[type]}</b> 공격이 와요! 알맞은 방어는?`;
    } else if (spawned === 5) {
      coach.innerHTML = "이제부터는 <b>그림만 보고</b> 판단! 속도도 점점 빨라져요.";
    }
  }

  function defend(key: AtkType, btn: HTMLElement): void {
    if (phase !== "play") return;
    // 같은 유형 중 가장 임박한 공격을 막는다
    let target: Attack | null = null;
    for (const a of attacks) {
      if (a.type === key && (!target || a.t > target.t)) target = a;
    }
    if (target) {
      attacks = attacks.filter((a) => a !== target);
      score += 10 * combo;
      scoreVal.textContent = String(score);
      combo = Math.min(4, combo + 1);
      comboEl.textContent = combo > 1 ? ` x${combo}` : "";
      shield = { key, side: target.side, t: 0 };
      burst(target, "#7BE3A0");
      haptic(HAPTIC.correct);
      coach.innerHTML = ["막았다!", "완벽한 판단!", "그거예요!", "단열 성공!"][Math.floor(Math.random() * 4)] + (combo >= 3 ? ` <b>콤보 x${combo}</b>` : "");
    } else {
      combo = 1;
      comboEl.textContent = "";
      btn.classList.remove("miss");
      void (btn as HTMLElement).offsetWidth;
      btn.classList.add("miss");
      haptic(HAPTIC.wrong);
      const active = attacks[0];
      coach.innerHTML = active
        ? `지금 공격은 <b>${ATK_NAME[active.type]}</b>! 다시 골라 보세요.`
        : "아직 공격이 없어요. 침착하게 기다려요.";
    }
  }

  function hit(a: Attack): void {
    attacks = attacks.filter((x) => x !== a);
    hp -= 1;
    combo = 1;
    comboEl.textContent = "";
    meltT = 1;
    shake = 1;
    haptic(HAPTIC.wrong);
    coach.innerHTML = hp > 0 ? `앗, <b>${ATK_NAME[a.type]}</b>에 당했어요! 스쿱이 녹았어요.` : "다 녹아 버렸어요…";
    if (hp <= 0) window.setTimeout(showOver, 650);
  }

  function burst(a: Attack, color: string): void {
    const p = atkPos(a, 320, 240);
    for (let i = 0; i < 10; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 2.4;
      sparks.push({ x: p.x, y: p.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, life: 1, color });
    }
  }

  // ---- 좌표(그리기와 판정 공용, 정규화 없이 현재 캔버스 크기 기준) ----
  let W = 320;
  let H = 240;
  function icePos(): { x: number; y: number } {
    return { x: W / 2, y: H - 46 };
  }
  function atkPos(a: Attack, w = W, h = H): { x: number; y: number } {
    const ice = { x: w / 2, y: h - 46 };
    const e = a.t;
    if (a.type === "cond") {
      const x0 = a.side === -1 ? -30 : w + 30;
      return { x: lerp(x0, ice.x + a.side * 34, e), y: h - 18 };
    }
    if (a.type === "conv") {
      const x0 = a.side === -1 ? -36 : w + 36;
      return { x: lerp(x0, ice.x + a.side * 52, e), y: h * 0.42 };
    }
    // rad: 위 모서리 램프는 고정, 빔이 자란다 — 위치는 램프 기준
    return { x: a.side === -1 ? 34 : w - 34, y: 34 };
  }

  // ---- 그리기 ----
  function drawIceCream(ctx: CanvasRenderingContext2D, tMs: number): void {
    const { x, y } = icePos();
    const wob = Math.sin(tMs / 700) * 1.4 + (shake > 0 ? Math.sin(tMs / 30) * 3 * shake : 0);
    ctx.save();
    ctx.translate(x + wob, y);
    // 콘
    ctx.fillStyle = "#E8B36A";
    ctx.strokeStyle = "#B9834A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, -8);
    ctx.lineTo(20, -8);
    ctx.lineTo(0, 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12, 4);
    ctx.lineTo(14, 4);
    ctx.moveTo(-6, 18);
    ctx.lineTo(9, 18);
    ctx.moveTo(-14, -2);
    ctx.lineTo(-2, 12);
    ctx.moveTo(2, -4);
    ctx.lineTo(12, 8);
    ctx.strokeStyle = "rgba(150,100,50,.55)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 스쿱(HP)
    const scoops = [
      { r: 22, dy: -26, c: "#FBE3E7" },
      { r: 19, dy: -56, c: "#FDF3D8" },
      { r: 16.5, dy: -82, c: "#DCEFE6" },
    ];
    for (let i = 0; i < hp; i++) {
      const s = scoops[i];
      let r = s.r;
      let dy = s.dy;
      if (i === hp - 1 && meltT > 0) {
        r = s.r * (0.55 + 0.45 * (1 - meltT));
        dy = s.dy + 6 * meltT;
      }
      ctx.fillStyle = s.c;
      ctx.strokeStyle = "rgba(70,84,100,.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, dy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    // 녹은 물방울
    if (meltT > 0) {
      ctx.fillStyle = "rgba(190,220,240,.8)";
      ctx.beginPath();
      ctx.ellipse(10, -4 + (1 - meltT) * 14, 3.4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAttack(ctx: CanvasRenderingContext2D, a: Attack, tMs: number): void {
    const ice = icePos();
    const p = atkPos(a);
    const urgent = a.t > 0.72;
    if (a.type === "cond") {
      // 시뻘건 철판이 바닥을 타고 접근
      ctx.save();
      ctx.translate(p.x, p.y);
      const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 42);
      glow.addColorStop(0, "rgba(240,68,46,.5)");
      glow.addColorStop(1, "rgba(240,68,46,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(-44, -30, 88, 44);
      ctx.fillStyle = urgent ? "#FF5D3A" : "#E8542F";
      ctx.strokeStyle = "#FFB03A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-26, -7, 52, 12, 5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,233,168,.9)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(a.side === -1 ? -26 : 26, -1);
      ctx.lineTo(a.side === -1 ? -44 : 44, -1);
      ctx.stroke();
      // 지글지글 김
      for (let i = -1; i <= 1; i++) {
        const sx = i * 14 + Math.sin(tMs / 130 + i) * 2;
        ctx.strokeStyle = "rgba(255,159,67,.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, -10);
        ctx.quadraticCurveTo(sx - 3, -18, sx + 2, -26);
        ctx.stroke();
      }
      ctx.restore();
    } else if (a.type === "conv") {
      // 헤어드라이어 + 뜨거운 바람
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(a.side === -1 ? 1 : -1, 1);
      ctx.fillStyle = "#31435F";
      ctx.strokeStyle = "#8CA2C0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-30, -13, 34, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(2, -8, 16, 16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-22, 13, 12, 14, 4);
      ctx.fill();
      ctx.stroke();
      // 바람 물결(아이스크림 쪽으로)
      for (let i = 0; i < 3; i++) {
        const f = ((tMs / 420 + i / 3) % 1);
        const wx = 20 + f * 46;
        ctx.strokeStyle = `rgba(255,138,92,${(0.85 - f * 0.6).toFixed(2)})`;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(wx, -10);
        ctx.quadraticCurveTo(wx + 7, 0, wx, 10);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      // 열 램프 + 자라나는 광선
      const target = { x: ice.x, y: ice.y - 82 };
      ctx.save();
      // 램프
      ctx.translate(p.x, p.y);
      ctx.fillStyle = "#F5A623";
      ctx.strokeStyle = "#FFD873";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + tMs / 900;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 17, Math.sin(ang) * 17);
        ctx.lineTo(Math.cos(ang) * 23, Math.sin(ang) * 23);
        ctx.stroke();
      }
      ctx.restore();
      // 빔
      const bx = lerp(p.x, target.x, a.t);
      const by = lerp(p.y, target.y, a.t);
      const grad = ctx.createLinearGradient(p.x, p.y, bx, by);
      grad.addColorStop(0, "rgba(245,166,35,.95)");
      grad.addColorStop(1, urgent ? "rgba(255,93,58,.95)" : "rgba(245,166,35,.4)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  }

  function drawShield(ctx: CanvasRenderingContext2D): void {
    if (!shield) return;
    const ice = icePos();
    const a = 1 - shield.t;
    ctx.save();
    ctx.globalAlpha = clamp(a * 1.6, 0, 1);
    if (shield.key === "cond") {
      // 나무 받침 — 콘 아래
      ctx.translate(ice.x, H - 14);
      ctx.fillStyle = "#B9834A";
      ctx.strokeStyle = "#8A5F33";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-46, -7, 92, 13, 6);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-12, 0);
      ctx.moveTo(6, -2);
      ctx.lineTo(26, -2);
      ctx.strokeStyle = "rgba(90,60,30,.6)";
      ctx.stroke();
    } else if (shield.key === "conv") {
      // 바람막이 — 공격 쪽 반투명 가림막
      ctx.translate(ice.x + shield.side * 58, ice.y - 60);
      ctx.fillStyle = "rgba(12,166,192,.22)";
      ctx.strokeStyle = "rgba(12,166,192,.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-8, -52, 16, 116, 8);
      ctx.fill();
      ctx.stroke();
    } else {
      // 은박 반사판 — 위쪽 기울어진 판 + 반사 화살
      ctx.translate(ice.x + shield.side * 34, ice.y - 118);
      ctx.rotate(shield.side * -0.5);
      const grd = ctx.createLinearGradient(-30, 0, 30, 0);
      grd.addColorStop(0, "#9FB3CD");
      grd.addColorStop(0.5, "#F2F7FF");
      grd.addColorStop(1, "#9FB3CD");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.roundRect(-32, -6, 64, 12, 5);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,216,115,.9)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(shield.side * 26, -30);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ---- 메인 루프 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const dtSec = (dt * 16.7) / 1000;
    const { ctx, w, h } = fitCanvas(canvas);
    W = w;
    H = h;

    if (phase === "play") {
      spawnIn -= dtSec;
      const maxConcurrent = score >= 120 ? 2 : 1;
      if (spawnIn <= 0 && attacks.length < maxConcurrent) {
        spawnAttack();
        spawnIn = spawnInterval * (attacks.length > 0 ? 0.6 : 1);
      }
      for (const a of [...attacks]) {
        a.t += dtSec / a.dur;
        if (a.t >= 1) hit(a);
      }
    }
    if (meltT > 0) meltT = Math.max(0, meltT - dtSec * 1.6);
    if (shake > 0) shake = Math.max(0, shake - dtSec * 2.2);
    if (shield) {
      shield.t += dtSec / 0.7;
      if (shield.t >= 1) shield = null;
    }

    // 배경 — 바닥
    ctx.strokeStyle = "rgba(140,170,215,.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, h - 12);
    ctx.lineTo(w - 10, h - 12);
    ctx.stroke();

    drawIceCream(ctx, tMs);
    for (const a of attacks) drawAttack(ctx, a, tMs);
    drawShield(ctx);

    // 스파크
    for (const s of [...sparks]) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 0.06 * dt;
      s.life -= dtSec * 1.8;
      if (s.life <= 0) {
        sparks = sparks.filter((x) => x !== s);
        continue;
      }
      ctx.globalAlpha = clamp(s.life, 0, 1);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  function exit(): void {
    loop.stop();
    window.clearTimeout(snackTimer);
    onExit();
  }
  xbtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    exit();
  });

  showIntro();
  requestAnimationFrame(() => loop.start());

  return { el: section };
}
