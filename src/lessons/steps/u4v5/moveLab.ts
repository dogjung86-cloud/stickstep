// [중1 Ⅳ v5] u4l2 옮겨 담기 랩: 「옮겨 담으면 무엇이 달라질까요?」
// 책의 세 상태의 성질(모양과 부피가 일정한가, 그릇에 따라 달라지는가)을 학생이 관찰하고 직접 기록한다.
// 무대는 메타볼(물리 수치 불변)에 그릇 벽을 세운 것. 얼음, 물, 공기를 컵과 접시에 옮겨 담으면 모양이 보이고 부피 눈금이 읽힌다.
// 조작: 물질 카드, '그릇 바꾸기' → 두 그릇에 다 담아 본 물질은 '관찰한 것 기록하기'가 열린다 → 모양과 부피를 "그대로다 / 달라졌다"로 적는다.
// 기록이 관찰과 다르면 그 자리에서 무엇이 달랐는지 알려 주고 다시 옮겨 보게 한다(판정 질문은 따로 없다. 기록이 곧 판정이다).
// 공기의 그릇에는 뚜껑을 그린다(열린 그릇이면 밖으로 퍼져 나간다). 부피의 값(100 mL, 300 mL, 200 mL)은 이 랩에서 정한 값이다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { SimBounds } from "../../../engine/matterSim";
import { colFor } from "../../../renderers/palette";
import { contactShadow, glassStrokeStyle } from "../../../ui/labProps";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import { u4Lab, u4Matter, type U4Step } from "./u4Kit";

type Key = "sol" | "liq" | "gas";
type Shape = "cup" | "dish";
const SUB: Record<Key, { T: number; word: string; eun: string; eul: string; state: string; shape: boolean; vol: boolean; ml: Record<Shape, number> }> = {
  sol: { T: -12, word: "얼음", eun: "은", eul: "을", state: "고체", shape: false, vol: false, ml: { cup: 100, dish: 100 } },
  liq: { T: 24, word: "물", eun: "은", eul: "을", state: "액체", shape: true, vol: false, ml: { cup: 100, dish: 100 } },
  gas: { T: 112, word: "공기", eun: "는", eul: "를", state: "기체", shape: true, vol: true, ml: { cup: 300, dish: 200 } },
};
const KEYS: Key[] = ["sol", "liq", "gas"];
const BOWL: Record<Shape, string> = { cup: "컵", dish: "접시" };

const cupWalls = (w: number, h: number): SimBounds => {
  const cw = Math.min(w * 0.44, 160);
  return { x0: (w - cw) / 2, y0: h * 0.27, x1: (w + cw) / 2, y1: h - 16 };
};
const dishWalls = (w: number, h: number): SimBounds => {
  const cw = w * 0.84;
  return { x0: (w - cw) / 2, y0: h * 0.62, x1: (w + cw) / 2, y1: h - 16 };
};

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
    sim: { count: 40, r: 6, temp: SUB.sol.T, cols: 8, walls: cupWalls },
    overlay: (ctx) => drawBowl(ctx, m.ms.sim.bounds(), cur === "gas"),
    onReady: () => refresh(),
  });
  m.pill.append(dot, name);

  const cards = {} as Record<Key, ReturnType<typeof bvCard>>;
  KEYS.forEach((k) => {
    cards[k] = bvCard("col u4x-move-card", { name: SUB[k].word, sub: "아직 기록 전", key: k });
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
    m.ms.sim.setWalls(shape === "cup" ? cupWalls : dishWalls);
    refresh();
  });
  const rec = bvBtn("main u4x-move-rec", "관찰한 것 기록하기");
  rec.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    form();
  });
  const controls = (): void => f.slot.setControls(bvCards(3, cards.sol, cards.liq, cards.gas), swap, rec);

  const SAY: Record<Key, Record<Shape, string>> = {
    sol: { cup: "얼음을 컵에 담았어요. <b>그릇 바꾸기</b>를 눌러 접시로 옮겨 보세요.", dish: "얼음을 접시로 옮겼어요. 모양과 <b>부피 눈금</b>을 컵일 때와 견줘 보세요." },
    liq: { cup: "물을 컵에 담았어요. 모양과 <b>부피 눈금</b>을 보고 접시로 옮겨 보세요.", dish: "물을 접시로 옮겼어요. 모양과 <b>부피 눈금</b>을 컵일 때와 견줘 보세요." },
    gas: { cup: "공기를 <b>뚜껑 덮은</b> 컵에 담았어요. 어디까지 차 있는지 보세요.", dish: "공기를 <b>뚜껑 덮은</b> 접시로 옮겼어요. 컵일 때와 견줘 보세요." },
  };

  function refresh(): void {
    const p = SUB[cur];
    m.ms.setTemp(p.T);
    name.textContent = `${p.word} · ${BOWL[shape]}`;
    m.read.innerHTML = `${p.ml[shape]}<small>mL</small>`;
    dot.style.background = colFor(p.T, 66, 1);
    swap.textContent = shape === "cup" ? "그릇 바꾸기: 컵에서 접시로" : "그릇 바꾸기: 접시에서 컵으로";
    KEYS.forEach((k) => cards[k].on(k === cur));
    tried[cur].add(shape);
    rec.disabled = done.has(cur) || tried[cur].size < 2;
    host.dataset.u4Move = `${cur}:${shape}`;
    if (lab.finished()) return;
    if (done.has(cur)) f.say(`${p.word}${p.eun} 기록을 마쳤어요. <b>다른 물질</b>을 골라 옮겨 담아 보세요.`);
    else if (tried[cur].size === 2 && shape === "cup") f.say(`${p.word}${p.eul} 두 그릇에 다 담아 봤어요. 본 것을 <b>기록</b>해 보세요.`);
    else f.say(SAY[cur][shape]);
  }

  // 기록 칸: 모양과 부피를 "그대로다 / 달라졌다"로 적는다
  function form(): void {
    const p = SUB[cur];
    const pick: { shape: boolean | null; vol: boolean | null } = { shape: null, vol: null };
    const ok = bvBtn("main u4x-move-ok", "기록하기");
    ok.disabled = true;
    const row = (label: string, key: "shape" | "vol"): HTMLElement => {
      const mk = (text: string, v: boolean): HTMLButtonElement => {
        const b = el("button", { class: "u4x-seg-b", text, attrs: { type: "button" } }) as HTMLButtonElement;
        b.dataset.v = v ? "diff" : "same";
        b.addEventListener("click", () => {
          haptic(HAPTIC.tap);
          pick[key] = v;
          Array.from(seg.children).forEach((x) => x.classList.toggle("on", x === b));
          ok.disabled = pick.shape === null || pick.vol === null;
        });
        return b;
      };
      const seg = el("div", { class: "u4x-seg" }, mk("그대로다", false), mk("달라졌다", true));
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
        cards[cur].sub(p.shape && p.vol ? "둘 다 달라짐" : p.shape ? "모양만 달라짐" : "둘 다 그대로");
        f.pips(done.size);
        controls();
        refresh();
        if (done.size === KEYS.length) {
          api.recordQuiz(slips === 0);
          tm.later(() => lab.finish("고체는 <b>모양과 부피</b>가 일정해요. 액체는 <b>모양만</b>, 기체는 <b>모양과 부피</b>가 모두 담는 그릇에 따라 달라져요."), 900);
        }
        return;
      }
      slips += 1;
      haptic(HAPTIC.wrong);
      controls();
      refresh();
      f.say(
        !okShape
          ? `${p.word}의 <b>모양</b>을 다시 보세요. 컵과 접시에 번갈아 담아 견줘 보세요.`
          : cur === "gas"
            ? "공기는 그릇 안을 <b>가득</b> 채웠어요. 부피 눈금이 컵과 접시에서 같았나요?"
            : `${p.word}의 <b>부피 눈금</b>을 다시 보세요. 컵에서도 접시에서도 ${p.ml.cup} mL였어요.`,
      );
    });
    f.say(`${p.word}${p.eul} 컵에서 접시로 옮겼을 때 <b>본 대로</b> 골라 기록하세요.`);
    f.slot.setControls(el("div", { class: "u4x-rec" }, row("모양은", "shape"), row("부피는", "vol"), ok));
  }

  controls();
  api.setCTA("세 물질을 옮겨 담고 기록하세요", { enabled: false });
  return lab.cleanup;
};
