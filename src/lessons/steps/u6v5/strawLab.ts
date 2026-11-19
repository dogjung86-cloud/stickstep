// u6StrawLab (u6l1 첫 랩): 「같은 힘인데 왜 한쪽만 뚫릴까?」
// 나온 곳: 소단원 첫머리의 빨대와 요구르트병(같은 힘을 줘도 뾰족한 쪽이 잘 꽂힌다 → 압력의 뜻).
// 학생이 정하는 것: 빨대의 어느 끝으로 누를지, 얼마나 세게 누를지. 정한 뒤 '꾹 누르기'로 직접 눌러 본다.
// 실패하는 길: 편평한 쪽은 가장 세게 눌러도 뚜껑이 움푹 들어갔다 되돌아온다. 뾰족한 쪽도 힘이 너무 약하면 안 뚫린다.
// 무대의 오른쪽 동그라미는 빨대 끝이 뚜껑에 닿는 자리를 크게 본 것이다. 닿는 면적을 칸으로 보여 준다(뾰족한 쪽 1칸, 편평한 쪽 6칸).
//   칸 위의 화살표 길이는 한 칸이 받는 힘이다(누르는 힘 ÷ 칸 수).
// 판정: 같은 힘인데 뾰족한 쪽만 뚫린 까닭. 판정과 결론 때 무대는 두 끝을 같은 힘으로 누른 모습을 나란히 둔 비교판으로 바뀐다
//   (같은 길이의 누르는 힘 아래 편평한 쪽 6칸과 짧은 화살 여섯, 뾰족한 쪽 1칸과 긴 화살 하나). 결론에서 '압력'이라는 이름을 붙인다.
// 옛 판에는 이 개념을 손으로 해 보는 랩이 없었다(훅의 북극곰 예측과 정리 카드뿐이었다).
import { haptic, HAPTIC } from "../../../core/haptics";
import { bvBtn, bvCard, bvCards, bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, clamp01, ease, FONT } from "./u6Kit";

type End = "sharp" | "flat";
const AREA: Record<End, number> = { sharp: 1, flat: 6 };
const NAME: Record<End, string> = { sharp: "뾰족한 쪽", flat: "편평한 쪽" };
const NEED = 2; // 한 칸이 이만큼의 힘을 받으면 뚫린다
const LID = 152; // 왼쪽 병의 뚜껑 높이
const BX = 92; // 왼쪽 병의 가운데
const ZX = 262; // 오른쪽 확대 동그라미
const ZY = 88;
const ZR = 56;
const GOLD = "#FFD68A";
/** 누르는 힘(1~5)의 화살 길이(상수 오프셋 없이 힘에 정비례) */
const forceLen = (f: number): number => f * 9;
/** 숫자 뒤의 '(으)로': 영, 삼, 육, 십처럼 ㄹ이 아닌 받침이면 '으로', 받침이 없거나 ㄹ받침(일, 칠, 팔)이면 '로' */
const ro = (n: number): string => ([0, 3, 6].includes(n % 10) ? "으로" : "로");
/** 한 칸이 받는 힘의 화살 길이(상수 오프셋 없이 1:6 비율 그대로) */
const perLen = (per: number): number => per * 12;

function arrowDown(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number, w: number, head: number, color: string): void {
  const span = Math.max(0.5, y1 - y0);
  const hd = Math.min(head, span * 0.72);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.min(w, Math.max(1.4, hd * 0.52));
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y1 - hd * 0.78);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - hd * 0.75, y1 - hd);
  ctx.lineTo(x + hd * 0.75, y1 - hd);
  ctx.lineTo(x, y1);
  ctx.closePath();
  ctx.fill();
}

/** 빨대 끝이 뚜껑에 닿는 자리를 크게 본 동그라미. 칸(닿는 면적)과 칸마다 받는 힘의 화살을 그린다.
 *  burst면 뾰족한 끝이 닿은 칸 아래로 은박이 갈라지는 금을 그린다(뚫림). dent는 편평한 쪽에 눌려 움푹 들어간 깊이. */
function zoomEnd(ctx: CanvasRenderingContext2D, e: End, cx: number, cy: number, r: number, f: number, o: { dent: number; cell: number; burst?: boolean }): void {
  const n = AREA[e];
  const per = f / n;
  const strong = per >= NEED;
  const cell = o.cell;
  const W = cell * 6;
  const x0 = cx - W / 2;
  const x1 = cx + W / 2;
  const bt = cy + r * 0.42; // 뚜껑(은박) 윗면
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#13223A";
  ctx.fill();
  ctx.clip();
  // 뚜껑: 두꺼운 은박 띠(칸의 높이). 편평한 쪽으로 누르는 동안 가운데가 움푹 들어간다
  const dip = (x: number): number => (x > x0 - 6 && x < x1 + 6 ? o.dent * Math.sin((Math.PI * (x - x0 + 6)) / (W + 12)) : 0);
  ctx.beginPath();
  for (let x = cx - r - 4; x <= cx + r + 4; x += 3) ctx.lineTo(x, bt + dip(x));
  for (let x = cx + r + 4; x >= cx - r - 4; x -= 3) ctx.lineTo(x, bt + cell + dip(x));
  ctx.closePath();
  ctx.fillStyle = "#7D8FAE";
  ctx.fill();
  // 닿는 면적의 칸(뚜껑 윗면)
  const cells = e === "flat" ? Array.from({ length: 6 }, (_, i) => x0 + i * cell) : [x0];
  for (const x of cells) {
    const y = bt + dip(x + cell / 2);
    ctx.fillStyle = strong ? "rgba(255,159,90,.95)" : "rgba(125,211,252,.55)";
    ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
  }
  // 빨대 끝(크게 본 모습): 편평한 쪽은 곧게 잘린 끝, 뾰족한 쪽은 비스듬히 잘려 한 칸만 닿는 끝
  const tipW = cell;
  const sh = (W - tipW) * 0.62;
  const down = dip(cx);
  const top = cy - r - 4;
  const straw = new Path2D();
  straw.moveTo(x0, top);
  straw.lineTo(x1, top);
  if (e === "sharp") {
    straw.lineTo(x1, bt - sh);
    straw.lineTo(x0 + tipW, bt);
    straw.lineTo(x0, bt);
  } else {
    straw.lineTo(x1, bt + down);
    straw.lineTo(x0, bt + down);
  }
  straw.closePath();
  ctx.fillStyle = "rgba(125,211,252,.28)";
  ctx.fill(straw);
  // 칸마다 받는 힘(화살 길이 = 한 칸이 받는 힘)
  const len = perLen(per);
  for (const x of cells) {
    const y = bt + dip(x + cell / 2);
    arrowDown(ctx, x + cell / 2, y - 3 - len, y - 3, 2.6, 5.5, GOLD);
  }
  ctx.strokeStyle = "#E0F2FE";
  ctx.lineWidth = 1.8;
  ctx.lineJoin = "round";
  ctx.stroke(straw);
  if (o.burst) {
    // 뚫리는 자리: 칸 아래로 은박이 갈라지는 금
    const tx = x0 + tipW / 2;
    const ty = bt + cell;
    ctx.strokeStyle = "#FFB37A";
    ctx.lineWidth = 2;
    for (const a of [0.6, 1.2, 1.9, 2.5]) {
      ctx.beginPath();
      ctx.moveTo(tx + Math.cos(a) * 4, ty + Math.sin(a) * 4);
      ctx.lineTo(tx + Math.cos(a) * 11, ty + Math.sin(a) * 11);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(205,224,252,.75)";
  ctx.lineWidth = 2.4;
  ctx.stroke();
}

/** 확대 표시: 작은 원(빨대 끝이 닿는 자리)에서 확대 동그라미의 왼쪽으로 이어지는 점선 두 줄 */
function zoomLines(ctx: CanvasRenderingContext2D, ax: number, ay: number, ar: number, bx: number, by: number, br: number): void {
  ctx.strokeStyle = "rgba(205,224,252,.45)";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  for (const [a0, a1] of [[-0.95, Math.PI + 0.62], [0.35, Math.PI - 0.62]]) {
    ctx.beginPath();
    ctx.moveTo(ax + ar * Math.cos(a0), ay + ar * Math.sin(a0));
    ctx.lineTo(bx + br * Math.cos(a1), by + br * Math.sin(a1));
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(ax, ay, ar, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(205,224,252,.8)";
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

export const strawLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-straw", label: "요구르트병 뚜껑을 빨대로 누르는 모습", wait: "빨대 끝과 힘을 골라 뚜껑을 눌러 보세요" });
  const { frame, tm } = lab;
  let end: End = "flat";
  let force = 3;
  let phase: "play" | "ask" | "done" = "play";
  let anim = 0; // 0 쉬는 중, 그 밖에는 누르는 동작의 진행(0~1)
  let animEnd: End = "flat";
  let animHole = false;
  let animForce = 3;
  let hole = false; // 지금 뚜껑에 구멍이 나 있는가(다음에 누를 때 새 병으로 바뀐다)
  const logs: { end: End; force: number; ok: boolean }[] = [];
  const tried = new Map<string, boolean>(); // "끝|힘" → 뚫렸는가
  let minPierce = Infinity; // 뾰족한 쪽으로 뚫은 가장 작은 힘
  let flatMax = 0; // 편평한 쪽으로 눌러 본 가장 큰 힘
  let board = 0; // 비교판이 나타난 정도(0~1)
  let same = 3; // 비교판에서 두 끝을 누른 같은 힘

  const cards = { sharp: bvCard("u6x-end", { name: "뾰족한 쪽", sub: "닿는 면적 1칸", key: "sharp" }), flat: bvCard("u6x-end", { name: "편평한 쪽", sub: "닿는 면적 6칸", key: "flat" }) };
  const range = bvRange({ cls: "u6x-rg", min: 1, max: 5, value: force, label: "누르는 힘", onInput: (v) => ((force = v), sync()) });
  const push = bvBtn("main", "꾹 누르기");
  frame.slot.setControls(bvCards(2, cards.flat, cards.sharp), range.el, push);
  const sync = (): void => {
    cards.sharp.on(end === "sharp");
    cards.flat.on(end === "flat");
    push.textContent = `${NAME[end]}으로 힘 ${force}만큼 꾹 누르기`;
    host.dataset.u6End = end;
  };
  (["sharp", "flat"] as End[]).forEach((k) =>
    cards[k].el.addEventListener("click", () => {
      if (phase !== "play" || anim) return;
      end = k;
      haptic(HAPTIC.tap);
      sync();
    }),
  );

  const ask = (): void => {
    phase = "ask";
    lab.phase("ask");
    frame.pips(2);
    frame.say("무대의 두 그림을 비교해 보세요. 칸 위 화살표 길이가 <b>한 칸이 받는 힘</b>이에요.");
    frame.slot.ask(
      "같은 힘으로 눌렀는데 <b>뾰족한 쪽만</b> 뚫린 까닭은?",
      [{ t: "힘을 받는 면적이 좁아서", ok: true }, { t: "뾰족한 쪽을 더 세게 눌러서" }, { t: "빨대가 더 무거워져서" }],
      (ok) => lab.grade(ok),
      {
        why: "같은 힘이 좁은 면적에 몰려 그 자리를 세게 눌러요.",
        onNext: () => {
          phase = "done";
          lab.phase("done");
          frame.pips(3);
          frame.say("누르는 힘은 같았어요. 달라진 것은 힘을 받는 면적이에요.");
          frame.slot.conclude("힘이 같아도 힘을 받는 <b>면적이 좁으면</b> 그 자리가 더 세게 눌려요. 일정한 면적이 받는 힘의 크기를 <b>압력</b>이라고 해요.");
          api.enableCTA(s.cta ?? "다음 실험");
        },
      },
    );
  };

  const settle = (): void => {
    const ok = animHole;
    logs.push({ end: animEnd, force: animForce, ok });
    if (logs.length > 3) logs.shift();
    tried.set(`${animEnd}|${animForce}`, ok);
    haptic(ok ? HAPTIC.correct : HAPTIC.wrong);
    host.dataset.u6Tries = String(Number(host.dataset.u6Tries ?? 0) + 1);
    if (animEnd === "sharp" && ok) minPierce = Math.min(minPierce, animForce);
    if (animEnd === "flat") flatMax = Math.max(flatMax, animForce);
    if (minPierce <= flatMax) {
      // 비교판의 같은 힘: 두 끝을 모두 눌러 본 힘 가운데 가장 큰 것(없으면 뾰족한 쪽이 뚫린 가장 작은 힘. 편평한 쪽은 그보다 센 힘에도 안 뚫렸다)
      same = minPierce;
      for (let f = 5; f >= 1; f--) {
        if (tried.has(`flat|${f}`) && tried.get(`sharp|${f}`)) {
          same = f;
          break;
        }
      }
      frame.pips(1);
      push.disabled = true;
      api.setCTA("기록을 비교해 보세요", { enabled: false });
      frame.say(ok ? "뚫렸어요! 같은 힘으로 누른 <b>편평한 쪽</b>의 기록과 비교해 보세요." : "같은 힘인데 편평한 쪽은 안 뚫려요. <b>뾰족한 쪽</b>의 기록과 비교해 보세요.");
      tm.later(ask, 1500);
    } else if (animEnd === "flat") frame.say("뚜껑이 움푹 들어갔다 되돌아왔어요. 이번에는 <b>뾰족한 쪽</b>으로 눌러 보세요.");
    else if (!ok) frame.say("힘 1은 너무 약해서 안 뚫렸어요. 누르는 힘을 <b>2 이상</b>으로 높여 눌러 보세요."); // 뾰족한 쪽이 안 뚫리는 힘은 1뿐이다(NEED 2)
    else frame.say(`힘 ${animForce}${ro(animForce)} 뚫렸어요. <b>편평한 쪽</b>도 같은 힘(${animForce} 이상)으로 눌러 비교해 보세요.`);
  };

  push.addEventListener("click", () => {
    if (phase !== "play" || anim) return;
    haptic(HAPTIC.tap);
    animEnd = end;
    animForce = force;
    animHole = force / AREA[end] >= NEED;
    hole = false;
    anim = 0.001;
  });

  lab.phase("play");
  frame.say("요구르트병 뚜껑을 빨대로 눌러 봐요. <b>편평한 쪽</b>과 <b>뾰족한 쪽</b>을 같은 힘으로 눌러 비교해 보세요.");
  sync();

  // ── 조작하는 동안의 무대: 왼쪽 병과 빨대, 오른쪽 확대 동그라미, 기록 ──
  const drawPlay = (ctx: CanvasRenderingContext2D): void => {
    const e = anim ? animEnd : end;
    // 누르는 동작: 0~0.4 내려와 닿는다, 0.4~0.7 누른다(뚫리거나 움푹), 0.7~1 뚫렸으면 그대로, 아니면 되돌아온다
    let tip = LID - 22;
    let dent = 0;
    if (anim) {
      const a = anim;
      if (a < 0.4) tip = LID - 22 + (22 * a) / 0.4;
      else if (animHole) tip = LID + 40 * clamp01((a - 0.4) / 0.25);
      else {
        dent = 6 * (a < 0.7 ? clamp01((a - 0.4) / 0.3) : 1 - clamp01((a - 0.7) / 0.3));
        tip = a < 0.7 ? LID + dent : LID + dent - 22 * clamp01((a - 0.7) / 0.3) * 0.5;
      }
    } else if (hole) tip = LID + 40;
    const pierced = hole || (anim > 0.4 && animHole);
    const cx = BX;
    // 병(작게): 흰 몸통과 주황 띠, 바닥 그림자
    ctx.fillStyle = "rgba(0,0,0,.22)";
    ctx.beginPath();
    ctx.ellipse(cx, LID + 66, 42, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    const body = ctx.createLinearGradient(cx - 36, 0, cx + 36, 0);
    body.addColorStop(0, "#E4EBF5");
    body.addColorStop(0.35, "#FFFFFF");
    body.addColorStop(1, "#D3DDEB");
    rr(ctx, cx - 36, LID, 72, 64, 12);
    ctx.fillStyle = body;
    ctx.fill();
    rr(ctx, cx - 36, LID + 22, 72, 22, 0);
    ctx.fillStyle = "#FF9F5A";
    ctx.fill();
    rr(ctx, cx - 36, LID, 72, 64, 12);
    ctx.strokeStyle = "#B4C2D6";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 뚜껑(은박): 눌리면 가운데가 움푹 들어간다
    ctx.strokeStyle = "#B9C6D8";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 40, LID);
    if (pierced) {
      ctx.lineTo(cx - 9, LID);
      ctx.lineTo(cx - 6, LID + 7);
      ctx.moveTo(cx + 6, LID + 7);
      ctx.lineTo(cx + 9, LID);
    } else {
      ctx.lineTo(cx - 14, LID);
      ctx.quadraticCurveTo(cx, LID + dent * 2, cx + 14, LID);
    }
    ctx.lineTo(cx + 40, LID);
    ctx.stroke();
    // 빨대
    const w = 7;
    const top = tip - 64;
    ctx.beginPath();
    ctx.moveTo(cx - w, top);
    ctx.lineTo(cx + w, top);
    if (e === "sharp") {
      ctx.lineTo(cx + w, tip - 14);
      ctx.lineTo(cx - w, tip);
    } else {
      ctx.lineTo(cx + w, tip);
      ctx.lineTo(cx - w, tip);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(125,211,252,.85)";
    ctx.fill();
    ctx.strokeStyle = "#E0F2FE";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 누르는 힘 화살표(빨대 위, 길이가 힘. 무대 안에 다 들어온다)
    const f = anim ? animForce : force;
    const L = forceLen(f);
    arrowDown(ctx, cx, top - 4 - L, top - 3, 4, 8, GOLD);
    txt(ctx, `누르는 힘 ${f}`, cx + 14, top - 4 - L / 2, { size: 13, weight: 800, color: GOLD });
    // 확대 표시(빨대 끝)와 오른쪽 확대 동그라미
    zoomLines(ctx, cx, LID, 11, ZX, ZY, ZR);
    txt(ctx, "뚜껑에 닿는 면적", ZX, 14, { align: "center", color: "#9FB2D0" });
    zoomEnd(ctx, e, ZX, ZY, ZR, f, { burst: pierced && e === "sharp", dent, cell: 13 });
    const n = AREA[e];
    const per = f / n;
    // 캡션: 한 칸이면 나눌 것이 없으므로 "1칸"만 쓴다. 긴 캡션(6칸, 약 189px)은 확대 동그라미 가운데(ZX)에 두면 무대 오른쪽 끝을 넘으므로
    // 오른쪽 끝(336, 무대 테두리에서 10px) 안으로 당긴다(짧은 캡션은 그대로 가운데). 왼쪽 끝 147이라 병과 뚜껑(x 134까지)에는 닿지 않는다.
    const cap = `${n === 1 ? "1칸" : `${n}칸에 나뉨`} · ${per >= NEED ? "한 칸에 힘이 집중돼요!" : "한 칸이 받는 힘이 약해요"}`;
    ctx.font = `700 12.5px ${FONT}`;
    const capX = Math.min(ZX, 336 - ctx.measureText(cap).width / 2);
    txt(ctx, cap, capX, ZY + ZR + 14, { align: "center", size: 12.5, color: per >= NEED ? "#FFB37A" : "#9FB2D0" });
    // 기록(색은 중립: 뚫림은 흰색, 안 뚫림은 회색)
    logs.forEach((l, i) => {
      const y = 182 + i * 17;
      txt(ctx, `${NAME[l.end]} · 힘 ${l.force}`, 196, y, { size: 12.5, color: "#C9D6EC" });
      txt(ctx, l.ok ? "뚫림" : "안 뚫림", 336, y, { size: 12.5, align: "right", color: l.ok ? "#FFFFFF" : "#8FA3C4", weight: 800 });
    });
  };

  // ── 판정과 결론의 무대: 같은 힘으로 누른 두 끝을 나란히 ──
  const drawBoard = (ctx: CanvasRenderingContext2D): void => {
    txt(ctx, `누르는 힘은 둘 다 ${same}`, 173, 14, { align: "center", size: 13, weight: 800, color: GOLD });
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(173, 30);
    ctx.lineTo(173, 222);
    ctx.stroke();
    const cols: [End, number][] = [["flat", 88], ["sharp", 258]];
    for (const [e, x] of cols) {
      const L = forceLen(same);
      arrowDown(ctx, x, 72 - L, 72, 4.5, 9, GOLD);
      zoomEnd(ctx, e, x, 138, 62, same, { burst: e === "sharp", dent: e === "flat" ? 4 : 0, cell: 15 });
      const ok = same / AREA[e] >= NEED;
      ctx.font = `800 13.5px ${FONT}`;
      const a = `${NAME[e]} ${AREA[e]}칸`;
      const b = ok ? "뚫림" : "안 뚫림";
      const wa = ctx.measureText(a).width;
      const wb = ctx.measureText(b).width;
      const x0 = x - (wa + 8 + wb) / 2;
      txt(ctx, a, x0, 216, { size: 13.5, weight: 800, color: "#E8EEF9" });
      txt(ctx, b, x0 + wa + 8, 216, { size: 13.5, weight: 800, color: ok ? "#FFB37A" : "#8FA3C4" });
    }
  };

  lab.run((ctx, dt) => {
    if (anim) {
      anim = Math.min(1, anim + 0.03 * dt);
      if (anim >= 1) {
        anim = 0;
        hole = animHole;
        settle();
      }
    }
    board = ease(board, phase === "play" ? 0 : 1, 0.2, dt);
    if (board < 0.98) {
      ctx.globalAlpha = 1 - board;
      drawPlay(ctx);
    }
    if (board > 0.02) {
      ctx.globalAlpha = board;
      drawBoard(ctx);
    }
    ctx.globalAlpha = 1;
  });

  return () => lab.cleanup();
};
