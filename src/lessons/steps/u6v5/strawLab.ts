// u6StrawLab (u6l1 첫 랩): 「같은 힘인데 왜 한쪽만 뚫릴까?」
// 나온 곳: 소단원 첫머리의 빨대와 요구르트병(같은 힘을 줘도 뾰족한 쪽이 잘 꽂힌다 → 압력의 뜻).
// 학생이 정하는 것: 빨대의 어느 끝으로 누를지, 얼마나 세게 누를지. 정한 뒤 '꾹 누르기'로 직접 눌러 본다.
// 실패하는 길: 편평한 쪽은 가장 세게 눌러도 뚜껑이 움푹 들어갔다 되돌아온다. 뾰족한 쪽도 힘이 너무 약하면 안 뚫린다.
// 무대의 오른쪽 그림은 빨대 끝이 뚜껑에 닿는 면적을 칸으로 보여 준다(뾰족한 쪽 1칸, 편평한 쪽 6칸). 화살표의 길이는 한 칸이 받는 힘이다.
// 판정: 같은 힘인데 뾰족한 쪽만 뚫린 까닭. 결론에서 '압력'이라는 이름을 붙인다.
// 옛 판에는 이 개념을 손으로 해 보는 랩이 없었다(훅의 북극곰 예측과 정리 카드뿐이었다).
import { haptic, HAPTIC } from "../../../core/haptics";
import { bvBtn, bvCard, bvCards, bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, clamp01 } from "./u6Kit";

type End = "sharp" | "flat";
const AREA: Record<End, number> = { sharp: 1, flat: 6 };
const NAME: Record<End, string> = { sharp: "뾰족한 쪽", flat: "편평한 쪽" };
const NEED = 2; // 한 칸이 이만큼의 힘을 받으면 뚫린다
const LID = 128;

export const strawLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-straw", label: "요구르트병 뚜껑을 빨대로 누르는 모습", wait: "빨대로 뚜껑을 눌러 보세요" });
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
  let minPierce = Infinity; // 뾰족한 쪽으로 뚫은 가장 작은 힘
  let flatMax = 0; // 편평한 쪽으로 눌러 본 가장 큰 힘

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
    frame.say("오른쪽 그림을 보세요. 화살표의 길이가 <b>한 칸이 받는 힘</b>이에요.");
    frame.slot.ask(
      "같은 힘으로 눌렀는데 <b>뾰족한 쪽만</b> 뚫린 까닭은?",
      [{ t: "힘을 받는 면적이 좁아서", ok: true }, { t: "누르는 힘이 더 커져서" }, { t: "빨대가 더 무거워져서" }],
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
    haptic(ok ? HAPTIC.correct : HAPTIC.wrong);
    host.dataset.u6Tries = String(Number(host.dataset.u6Tries ?? 0) + 1);
    if (animEnd === "sharp" && ok) minPierce = Math.min(minPierce, animForce);
    if (animEnd === "flat") flatMax = Math.max(flatMax, animForce);
    if (minPierce <= flatMax) {
      frame.pips(1);
      push.disabled = true;
      api.setCTA("기록을 견줘 보세요", { enabled: false });
      frame.say(ok ? "뚫렸어요! 같은 힘으로 누른 <b>편평한 쪽</b>의 기록과 견줘 보세요." : "같은 힘인데 편평한 쪽은 안 뚫려요. <b>뾰족한 쪽</b>의 기록과 견줘 보세요.");
      tm.later(ask, 1500);
    } else if (animEnd === "flat") frame.say("뚜껑이 움푹 들어갔다 되돌아왔어요. 이번에는 <b>뾰족한 쪽</b>으로 눌러 보세요.");
    else if (!ok) frame.say("힘이 너무 약했어요. 조금 더 <b>세게</b> 눌러 보세요.");
    else frame.say(`힘 ${animForce}로 뚫렸어요. <b>편평한 쪽</b>도 같은 힘(${animForce} 이상)으로 눌러 견줘 보세요.`);
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
  frame.say("요구르트병에 빨대를 꽂아요. <b>어느 끝</b>으로 <b>얼마나 세게</b> 누를지 정하고 눌러 보세요.");
  sync();

  lab.run((ctx, dt) => {
    if (anim) {
      anim = Math.min(1, anim + 0.03 * dt);
      if (anim >= 1) {
        anim = 0;
        hole = animHole;
        settle();
      }
    }
    const e = anim ? animEnd : end;
    // 누르는 동작: 0~0.4 내려와 닿는다, 0.4~0.7 누른다(뚫리거나 움푹), 0.7~1 뚫렸으면 그대로, 아니면 되돌아온다
    let tip = LID - 30;
    let dent = 0;
    if (anim) {
      const a = anim;
      if (a < 0.4) tip = LID - 30 + (30 * a) / 0.4;
      else if (animHole) tip = LID + 46 * clamp01((a - 0.4) / 0.25);
      else {
        dent = 7 * (a < 0.7 ? clamp01((a - 0.4) / 0.3) : 1 - clamp01((a - 0.7) / 0.3));
        tip = a < 0.7 ? LID + dent : LID + dent - 30 * clamp01((a - 0.7) / 0.3) * 0.5;
      }
    } else if (hole) tip = LID + 46;
    const cx = 128;
    // 병
    rr(ctx, cx - 44, LID, 88, 94, 14);
    ctx.fillStyle = "#F4F7FB";
    ctx.fill();
    rr(ctx, cx - 44, LID + 32, 88, 32, 0);
    ctx.fillStyle = "#FF9F5A";
    ctx.fill();
    // 뚜껑(은박): 눌리면 가운데가 움푹 들어간다
    ctx.strokeStyle = "#B9C6D8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 48, LID);
    if (hole || (anim > 0.4 && animHole)) {
      ctx.lineTo(cx - 9, LID);
      ctx.lineTo(cx - 6, LID + 8);
      ctx.moveTo(cx + 6, LID + 8);
      ctx.lineTo(cx + 9, LID);
    } else {
      ctx.lineTo(cx - 14, LID);
      ctx.quadraticCurveTo(cx, LID + dent * 2, cx + 14, LID);
    }
    ctx.lineTo(cx + 48, LID);
    ctx.stroke();
    // 빨대
    const w = 7;
    ctx.beginPath();
    ctx.moveTo(cx - w, tip - 70);
    ctx.lineTo(cx + w, tip - 70);
    if (e === "sharp") {
      ctx.lineTo(cx + w, tip - 16);
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
    // 누르는 힘 화살표(빨대 위)
    const f = anim ? animForce : force;
    ctx.strokeStyle = "#FFD68A";
    ctx.fillStyle = "#FFD68A";
    ctx.lineWidth = 3;
    const ay = tip - 74;
    ctx.beginPath();
    ctx.moveTo(cx, ay - 8 - f * 5);
    ctx.lineTo(cx, ay - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 6, ay - 8);
    ctx.lineTo(cx + 6, ay - 8);
    ctx.lineTo(cx, ay);
    ctx.fill();
    pill(ctx, `누르는 힘 ${f}`, 12, 7, { dot: "#FFD68A" });

    // 오른쪽: 뚜껑에 닿는 면적과 한 칸이 받는 힘
    txt(ctx, "뚜껑에 닿는 면적", 268, 22, { align: "center", color: "#9FB2D0" });
    const n = AREA[e];
    const cols = n === 1 ? 1 : 3;
    const rows = n === 1 ? 1 : 2;
    const cell = 20;
    const gx = 268 - (cols * cell) / 2;
    const gy = 86;
    const per = f / n;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gx + c * cell;
        const y = gy + r * cell;
        ctx.fillStyle = per >= NEED ? "rgba(255,159,90,.5)" : "rgba(125,211,252,.28)";
        ctx.fillRect(x + 1, y + 1, cell - 2, cell - 2);
        ctx.strokeStyle = "rgba(255,255,255,.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
        if (r === 0) {
          // 칸마다 받는 힘의 화살표
          const len = Math.max(4, per * 9);
          const ax = x + cell / 2;
          ctx.strokeStyle = "#FFD68A";
          ctx.fillStyle = "#FFD68A";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(ax, gy - 6 - len);
          ctx.lineTo(ax, gy - 8);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ax - 4, gy - 9);
          ctx.lineTo(ax + 4, gy - 9);
          ctx.lineTo(ax, gy - 3);
          ctx.fill();
        }
      }
    }
    txt(ctx, `${n}칸`, 268, gy + rows * cell + 14, { align: "center", color: "#E8EEF9", size: 13, weight: 800 });
    txt(ctx, per >= NEED ? "한 칸이 세게 눌려요" : "한 칸이 약하게 눌려요", 268, gy + rows * cell + 32, { align: "center", color: per >= NEED ? "#FFB37A" : "#9FB2D0" });

    // 기록
    logs.forEach((l, i) => {
      const y = 178 + i * 19;
      txt(ctx, `${NAME[l.end]} · 힘 ${l.force}`, 196, y, { size: 12.5, color: "#C9D6EC" });
      txt(ctx, l.ok ? "뚫림" : "안 뚫림", 336, y, { size: 12.5, align: "right", color: l.ok ? "#7EE2A8" : "#FF9C9C", weight: 800 });
    });
  });

  return () => lab.cleanup();
};
