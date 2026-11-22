// [중1 Ⅳ v5] u4l2 옮겨 담기 랩: 「옮겨 담으면 무엇이 달라질까요?」
// 세 상태의 성질(모양과 부피가 일정한가, 그릇에 따라 달라지는가)을 학생이 관찰하고 직접 기록한다.
// 무대는 메타볼(물리 수치 불변)에 그릇 벽을 세운 것. 얼음, 물, 공기를 컵과 접시에 옮겨 담으면 모양이 보이고 부피 눈금이 읽힌다.
// 조작: 물질 카드, '접시로(컵으로) 옮겨 담기' → 두 그릇에 다 담아 본 물질은 '관찰 결과 기록하기'가 열린다 → 모양과 부피를 "일정하다 / 변한다"로 적는다.
// 기록이 관찰과 다르면 그 자리에서 무엇이 달랐는지 알려 주고 다시 옮겨 보게 한다(판정 질문은 따로 없다. 기록이 곧 판정이다).
// 공기의 그릇에는 뚜껑을 그린다(열린 그릇이면 밖으로 퍼져 나간다). 부피의 값(100 mL, 300 mL, 200 mL)은 이 랩에서 정한 값이다.
// 부피 읽기(2026-11-15 다시 그림, 감사 중 후보): 두 그릇에 눈금(컵 100·200·300, 접시 100·200)을 그리고 읽은 값은 그 그림 옆에 둔다(무대 구석의 숫자를 걷었다).
//   그릇 크기는 숫자대로다(컵 안쪽 넓이 : 접시 안쪽 넓이 = 3 : 2, 공기가 가득 찬 부피). 물은 두 그릇에서 100 눈금 높이에 닿고,
//   얼음은 둘레의 점선 윤곽이 두 그릇에서 같은 크기다. 물질의 색은 숨은 온도를 따르지 않고 물질마다 하나다(얼음과 물은 같은 물빛, 공기는 옅은 회청색).
//   색은 이 랩의 캔버스에 거는 CSS 필터로만 바꾼다(공용 메타볼 렌더러와 입자 엔진은 그대로).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { MatterSim, SimBounds } from "../../../engine/matterSim";
import { contactShadow, glassStrokeStyle } from "../../../ui/labProps";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import { u4Lab, u4Matter, type U4Step } from "./u4Kit";

type Key = "sol" | "liq" | "gas";
type Shape = "cup" | "dish";
const SUB: Record<Key, { T: number; word: string; eun: string; eul: string; state: string; shape: boolean; vol: boolean; ml: Record<Shape, number>; tint: string; dot: string }> = {
  sol: { T: -12, word: "얼음", eun: "은", eul: "을", state: "고체", shape: false, vol: false, ml: { cup: 100, dish: 100 }, tint: "hue-rotate(-7deg)", dot: "#B8DBF7" },
  liq: { T: 24, word: "물", eun: "은", eul: "을", state: "액체", shape: true, vol: false, ml: { cup: 100, dish: 100 }, tint: "hue-rotate(-48deg)", dot: "#5FA2EA" },
  gas: { T: 112, word: "공기", eun: "는", eul: "를", state: "기체", shape: true, vol: true, ml: { cup: 300, dish: 200 }, tint: "hue-rotate(-150deg) saturate(.22) brightness(1.1)", dot: "#C9D3DE" },
};
const KEYS: Key[] = ["sol", "liq", "gas"];
const BOWL: Record<Shape, string> = { cup: "컵", dish: "접시" };
const FULL: Record<Shape, number> = { cup: 300, dish: 200 }; // 그릇에 가득 찬 부피(눈금 맨 위)

// 그릇 크기(안쪽): 컵 112×129, 접시 220×44(넓이 9680). 넓이가 3 : 2라 가득 찬 공기가 300 mL, 200 mL이고,
// 물(입자 40개)은 컵에서 높이 약 43(눈금 100 = 높이의 3분의 1), 접시에서 약 22(눈금 100 = 높이의 2분의 1)이라 두 그릇 모두 100 눈금에 닿는다.
// 얼음 덩어리(높이 약 63)는 얕은 접시 위로 솟아 있게 접시일 때 얼음의 벽만 위로 늘린다(그리는 접시는 그대로).
// 좁은 폰(무대 폭 330 안팎)에서는 접시 오른쪽의 읽은 값이 무대 밖으로 나가지 않게 접시를 좁히고 넓이(9680)는 그대로 둔다.
const bowlWH = (shape: Shape, w: number): { w: number; h: number } => {
  if (shape === "cup") return { w: 112, h: 129 };
  const dw = Math.min(220, w - 136);
  return { w: dw, h: 9680 / dw };
};
const bowlRect = (shape: Shape, w: number, h: number): SimBounds => {
  const d = bowlWH(shape, w);
  return { x0: (w - d.w) / 2, y0: h - 16 - d.h, x1: (w + d.w) / 2, y1: h - 16 };
};
const wallsFor = (shape: Shape, key: Key) => (w: number, h: number): SimBounds => {
  const b = bowlRect(shape, w, h);
  return key === "sol" && shape === "dish" ? { ...b, y0: b.y1 - 80 } : b;
};

/** 눈금과 읽은 값. 읽은 값은 그 물질 옆에 크게(물은 100 눈금, 공기는 뚜껑 높이, 얼음은 점선 윤곽 옆). */
function drawScale(ctx: CanvasRenderingContext2D, b: SimBounds, shape: Shape, key: Key, sim: MatterSim, W: number): void {
  const H = b.y1 - b.y0;
  const full = FULL[shape];
  const read = SUB[key].ml[shape];
  const xw = b.x1 + 4; // 오른쪽 벽
  ctx.lineCap = "round";
  ctx.textBaseline = "middle";
  for (let v = 100; v <= full; v += 100) {
    const y = b.y1 - (H * v) / full;
    const hot = key === "liq" ? v === 100 : key === "gas" ? v === full : false;
    ctx.strokeStyle = hot ? "rgba(236,244,255,.95)" : "rgba(196,214,238,.6)";
    ctx.lineWidth = hot ? 2.2 : 1.4;
    ctx.beginPath();
    ctx.moveTo(xw - 1, y);
    ctx.lineTo(xw - (hot ? 16 : 11), y);
    ctx.stroke();
    if (!hot) {
      ctx.fillStyle = "rgba(170,190,216,.9)";
      ctx.font = "700 12px Pretendard, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(String(v), xw + 6, y);
    }
  }
  // 읽은 값: 물과 공기는 눈금 높이에(오른쪽 벽 바깥), 얼음은 점선 윤곽 바로 위 가운데
  let ly: number;
  let lx = xw + (key === "gas" ? 14 : 6);
  let mid = false;
  if (key === "sol") {
    // 얼음 윤곽: 격자 자리(homes)로 잡아 떨림에 흔들리지 않게 한다
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of sim.homes) {
      x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    }
    const m = sim.o.r * 1.5;
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "rgba(240,248,255,.95)";
    ctx.lineWidth = 1.8;
    const rx = x0 - m, ry = y0 - m, rw = x1 - x0 + m * 2, rh = Math.min(y1 + m, b.y1 - 1) - ry, rr = 9;
    ctx.beginPath();
    ctx.moveTo(rx + rr, ry);
    ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rr);
    ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rr);
    ctx.arcTo(rx, ry + rh, rx, ry, rr);
    ctx.arcTo(rx, ry, rx + rw, ry, rr);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    ly = y0 - m - 17;
    lx = (x0 + x1) / 2;
    mid = true;
  } else ly = b.y1 - (H * read) / full;
  const num = String(read);
  ctx.font = "800 15px Pretendard, system-ui, sans-serif";
  const nw = ctx.measureText(num).width;
  ctx.font = "700 12px Pretendard, system-ui, sans-serif";
  const uw = ctx.measureText("mL").width;
  let x = mid ? lx - (nw + 2 + uw) / 2 : lx;
  if (!mid && x + nw + 2 + uw > W - 4) {
    // 좁은 폰에서 무대 밖으로 나가면 눈금 위쪽, 오른쪽 끝에 맞춘다
    x = W - 4 - (nw + 2 + uw);
    ly -= 15;
  }
  if (mid) {
    // 얼음의 빛 번짐 위에서도 읽히게 어두운 바탕을 깐다
    ctx.fillStyle = "rgba(11,21,36,.78)";
    const bw = nw + 2 + uw + 14, bh = 22, bx = x - 7, by = ly - 11, br = 11;
    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.arcTo(bx + bw, by, bx + bw, by + bh, br);
    ctx.arcTo(bx + bw, by + bh, bx, by + bh, br);
    ctx.arcTo(bx, by + bh, bx, by, br);
    ctx.arcTo(bx, by, bx + bw, by, br);
    ctx.closePath();
    ctx.fill();
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "#F4F8FD";
  ctx.font = "800 15px Pretendard, system-ui, sans-serif";
  ctx.fillText(num, x, ly);
  ctx.font = "700 12px Pretendard, system-ui, sans-serif";
  ctx.fillStyle = "#AFC3DE";
  ctx.fillText("mL", x + nw + 2, ly + 1);
  ctx.textBaseline = "alphabetic";
}

/** 그릇 벽(유리). lid가 참이면 윗면을 뚜껑(실선)으로 덮는다. */
function drawBowl(ctx: CanvasRenderingContext2D, b: SimBounds, lid: boolean): void {
  contactShadow(ctx, (b.x0 + b.x1) / 2, b.y1 + 11, (b.x1 - b.x0) * 0.6, 0.26);
  const r = 8;
  ctx.strokeStyle = glassStrokeStyle(ctx, b.y0, b.y1 + 4);
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(b.x0 - 4, b.y0);
  ctx.lineTo(b.x0 - 4, b.y1 + 4 - r);
  ctx.quadraticCurveTo(b.x0 - 4, b.y1 + 4, b.x0 - 4 + r, b.y1 + 4);
  ctx.lineTo(b.x1 + 4 - r, b.y1 + 4);
  ctx.quadraticCurveTo(b.x1 + 4, b.y1 + 4, b.x1 + 4, b.y1 + 4 - r);
  ctx.lineTo(b.x1 + 4, b.y0);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(b.x0 + 1, b.y0 + 8);
  ctx.lineTo(b.x0 + 1, b.y1 - 8);
  ctx.stroke();
  if (lid) {
    ctx.strokeStyle = "rgba(226,240,255,.95)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(b.x0 - 10, b.y0 - 2);
    ctx.lineTo(b.x1 + 10, b.y0 - 2);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo((b.x0 + b.x1) / 2 - 9, b.y0 - 8);
    ctx.lineTo((b.x0 + b.x1) / 2 + 9, b.y0 - 8);
    ctx.stroke();
  }
}

export const u4MoveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-move" });
  const { f, tm } = lab;

  let cur: Key = "sol";
  let shape: Shape = "cup";
  let slips = 0;
  const tried: Record<Key, Set<Shape>> = { sol: new Set(["cup"]), liq: new Set(), gas: new Set() };
  const done = new Set<Key>();

  const dot = el("span", { class: "pdot" });
  const name = el("span", { text: "" });
  const m = u4Matter(lab, {
    sim: { count: 40, r: 6, temp: SUB.sol.T, cols: 8, walls: wallsFor("cup", "sol") },
    overlay: (ctx, w, h) => {
      const b = bowlRect(shape, w, h);
      drawBowl(ctx, b, cur === "gas");
      drawScale(ctx, b, shape, cur, m.ms.sim, w);
    },
    onReady: () => refresh(),
  });
  m.pill.append(dot, name);
  m.read.style.display = "none"; // 읽은 값은 무대 구석이 아니라 그릇 옆에 쓴다
  const cvs = Array.from(m.ms.el.querySelectorAll<HTMLCanvasElement>("canvas.mstage-cv:not(.mstage-overlay)"));

  const cards = {} as Record<Key, ReturnType<typeof bvCard>>;
  KEYS.forEach((k) => {
    // 카드 이름에만 상태를 붙인다(SUB.word는 도움말과 무대 알약의 글에도 쓰여 그대로 둔다)
    cards[k] = bvCard("col u4x-move-card", { name: `${SUB[k].word}(${SUB[k].state})`, sub: "관찰 전", key: k });
    cards[k].el.addEventListener("click", () => {
      if (cur === k) return;
      haptic(HAPTIC.tap);
      cur = k;
      refresh();
    });
  });
  const swap = bvBtn("u4x-move-swap", "");
  swap.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    shape = shape === "cup" ? "dish" : "cup";
    refresh();
  });
  const rec = bvBtn("main u4x-move-rec", "관찰 결과 기록하기");
  rec.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    form();
  });
  const controls = (): void => f.slot.setControls(bvCards(3, cards.sol, cards.liq, cards.gas), swap, rec);

  // 부피의 값은 무대의 읽은 값과 같아야 한다(SUB.ml, FULL: 얼음과 물 100 mL, 공기는 컵 300 mL, 접시 200 mL)
  const SAY: Record<Key, Record<Shape, string>> = {
    sol: {
      cup: "얼음(100 mL)을 컵에 담았어요. <b>접시로 옮겨 담기</b>를 눌러 모양과 부피가 달라지는지 살펴보세요.",
      dish: "얼음을 넓은 접시로 옮겼어요! 얼음의 모양과 <b>부피(100 mL)</b>가 컵에 있을 때와 달라졌는지 비교해 보세요.",
    },
    liq: {
      cup: "물(100 mL)을 컵에 담았어요. 물의 모양과 <b>부피 눈금</b>을 확인한 뒤 접시로 옮겨 담아 보세요.",
      dish: "물을 넓은 접시로 옮겼어요! 물의 모양과 <b>부피 눈금(100 mL)</b>이 컵에 있을 때와 달라졌는지 비교해 보세요.",
    },
    gas: {
      cup: "공기를 <b>뚜껑을 덮은</b> 컵(300 mL)에 가득 담았어요. 접시로 옮기면 어떻게 될지 눌러 보세요.",
      dish: "공기를 <b>뚜껑 덮인</b> 접시(200 mL)로 옮겼어요! 공기가 차지하는 모양과 부피가 어떻게 달라졌는지 비교해 보세요.",
    },
  };

  function refresh(): void {
    const p = SUB[cur];
    m.ms.sim.setWalls(wallsFor(shape, cur));
    m.ms.setTemp(p.T);
    name.textContent = `${p.word} · ${BOWL[shape]}`;
    cvs.forEach((c) => (c.style.filter = p.tint));
    dot.style.background = p.dot;
    swap.textContent = shape === "cup" ? "접시로 옮겨 담기" : "컵으로 옮겨 담기";
    KEYS.forEach((k) => cards[k].on(k === cur));
    tried[cur].add(shape);
    rec.disabled = done.has(cur) || tried[cur].size < 2;
    host.dataset.u4Move = `${cur}:${shape}`;
    if (lab.finished()) return;
    if (done.has(cur)) f.say(`${p.word}${p.eun} 기록을 마쳤어요. <b>다른 물질</b>을 골라 옮겨 담아 보세요.`);
    else if (tried[cur].size === 2 && shape === "cup") f.say(`${p.word}${p.eul} 두 그릇에 다 담아 봤어요. 본 것을 <b>기록</b>해 보세요.`);
    else f.say(SAY[cur][shape]);
  }

  // 기록 칸: 모양과 부피를 "일정하다(그대로다) / 변한다(달라졌다)"로 적는다
  function form(): void {
    const p = SUB[cur];
    const pick: { shape: boolean | null; vol: boolean | null } = { shape: null, vol: null };
    const ok = bvBtn("main u4x-move-ok", "기록 완료");
    ok.disabled = true;
    const row = (label: string, key: "shape" | "vol"): HTMLElement => {
      // 괄호 앞에 <wbr>: 버튼이 좁으면 괄호 앞에서만 줄을 바꾼다(390 폭에서는 한 줄)
      const mk = (html: string, v: boolean): HTMLButtonElement => {
        const b = el("button", { class: "u4x-seg-b", html, attrs: { type: "button" } }) as HTMLButtonElement;
        b.dataset.v = v ? "diff" : "same";
        b.addEventListener("click", () => {
          haptic(HAPTIC.tap);
          pick[key] = v;
          Array.from(seg.children).forEach((x) => x.classList.toggle("on", x === b));
          ok.disabled = pick.shape === null || pick.vol === null;
        });
        return b;
      };
      const seg = el("div", { class: "u4x-seg" }, mk("일정하다<wbr>(그대로다)", false), mk("변한다<wbr>(달라졌다)", true));
      seg.dataset.k = key;
      return el("div", { class: "u4x-rec-row" }, el("span", { class: "u4x-rec-l", text: label }), seg);
    };
    ok.addEventListener("click", () => {
      const okShape = pick.shape === p.shape;
      const okVol = pick.vol === p.vol;
      if (okShape && okVol) {
        haptic(HAPTIC.correct);
        done.add(cur);
        cards[cur].done();
        cards[cur].sub(p.shape && p.vol ? "모양·부피 모두 변함" : p.shape ? "모양만 변함" : "모양·부피 일정함");
        f.pips(done.size);
        controls();
        refresh();
        if (done.size === KEYS.length) {
          api.recordQuiz(slips === 0);
          // '모양은 변하지만'은 단원 평가 보기(u4l2)와 16자가 겹쳐(qa/u4v5-docs.mjs 겹침 검사) '바뀌지만'으로 쓴다
          tm.later(() => lab.finish("고체는 담는 그릇이 바뀌어도 <b>모양과 부피</b>가 일정해요. 액체는 담는 그릇에 따라 <b>모양은 바뀌지만 부피는 일정</b>하고, 기체는 <b>모양과 부피</b>가 모두 담는 그릇에 따라 달라져요."), 900);
        }
        return;
      }
      slips += 1;
      haptic(HAPTIC.wrong);
      controls();
      refresh();
      f.say(
        !okShape
          ? `${p.word}의 <b>모양</b>을 다시 보세요. 컵과 접시에 번갈아 담아 비교해 보세요.`
          : cur === "gas"
            ? "공기는 그릇 안을 <b>가득</b> 채웠어요. 부피 눈금이 컵과 접시에서 같았나요?"
            : `${p.word}의 <b>부피 눈금</b>을 다시 보세요. 컵에서도 접시에서도 ${p.ml.cup} mL였어요.`,
      );
    });
    f.say(`${p.word}${p.eul} 컵에서 접시로 옮겨 담았을 때 <b>모양과 부피</b>가 어떠했는지 각각 골라 보세요.`);
    f.slot.setControls(el("div", { class: "u4x-rec" }, row("모양", "shape"), row("부피", "vol"), ok));
  }

  controls();
  api.setCTA("세 물질을 옮겨 담고 기록하세요", { enabled: false });
  return lab.cleanup;
};
