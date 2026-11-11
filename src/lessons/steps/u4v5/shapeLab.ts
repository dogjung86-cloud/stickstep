// [중1 Ⅳ v5] u4l2 그릇 랩: 「그릇을 바꾸면 모양이 변할까요?」
// 메타볼 무대(물리 수치 불변)에 그릇 벽을 세운다. 얼음, 물, 수증기를 컵과 접시에 번갈아 담아 모양과 부피를 본다.
// 조작: 상태 카드 셋(고체, 액체, 기체)과 '그릇 바꾸기' 버튼. 세 상태를 모두 두 그릇에 담아 보면 판정 하나.
// 통찰 하나: 고체는 모양과 부피가 그대로, 액체는 모양만, 기체는 모양과 부피가 모두 그릇을 따른다.
// 기체의 그릇에는 뚜껑(점선)이 있다고 본다(열린 그릇이면 밖으로 퍼져 나간다).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { SimBounds } from "../../../engine/matterSim";
import { colFor } from "../../../renderers/palette";
import { contactShadow, glassStrokeStyle } from "../../../ui/labProps";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import { u4Lab, u4Matter, type U4Step } from "./u4Kit";

const PRESET = {
  sol: { T: -12, name: "고체", word: "얼음" },
  liq: { T: 24, name: "액체", word: "물" },
  gas: { T: 112, name: "기체", word: "수증기" },
} as const;
type Key = keyof typeof PRESET;
type Shape = "cup" | "dish";

const cupWalls = (w: number, h: number): SimBounds => {
  const cw = Math.min(w * 0.44, 160);
  return { x0: (w - cw) / 2, y0: h * 0.25, x1: (w + cw) / 2, y1: h - 16 };
};
const dishWalls = (w: number, h: number): SimBounds => {
  const cw = w * 0.84;
  return { x0: (w - cw) / 2, y0: h * 0.6, x1: (w + cw) / 2, y1: h - 16 };
};

/** 그릇 벽: 유리(그라데이션 벽, 반사, 가장자리), 열린 윗면은 점선. */
function drawContainer(ctx: CanvasRenderingContext2D, b: SimBounds): void {
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
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = "rgba(178,204,238,.4)";
  ctx.beginPath();
  ctx.moveTo(b.x0 + 4, b.y0);
  ctx.lineTo(b.x1 - 4, b.y0);
  ctx.stroke();
  ctx.setLineDash([]);
}

export const u4ShapeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as U4Step;
  const lab = u4Lab(host, api, s, { steps: 3, cls: "u4x-shape" });
  const { f, tm } = lab;

  let cur: Key = "sol";
  let shape: Shape = "cup";
  const tried: Record<Key, Set<Shape>> = { sol: new Set(["cup"]), liq: new Set(), gas: new Set() };
  let asked = false;

  const dot = el("span", { class: "pdot" });
  const name = el("span", { text: "" });
  const m = u4Matter(lab, {
    sim: { count: 40, r: 6, temp: PRESET.sol.T, cols: 8, walls: cupWalls },
    overlay: (ctx) => drawContainer(ctx, m.ms.sim.bounds()),
    onReady: () => refresh(),
  });
  m.pill.append(dot, name);

  const cards = {} as Record<Key, ReturnType<typeof bvCard>>;
  (Object.keys(PRESET) as Key[]).forEach((k) => {
    cards[k] = bvCard("col u4x-shape-card", { name: PRESET[k].name, sub: PRESET[k].word, key: k });
    cards[k].el.addEventListener("click", () => {
      if (cur === k) return;
      haptic(HAPTIC.tap);
      cur = k;
      refresh();
    });
  });
  const swap = bvBtn("main u4x-shape-swap", "");
  swap.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    shape = shape === "cup" ? "dish" : "cup";
    m.ms.sim.setWalls(shape === "cup" ? cupWalls : dishWalls);
    refresh();
  });
  f.slot.setControls(bvCards(3, cards.sol, cards.liq, cards.gas), swap);

  const SAY: Record<Key, Record<Shape, string>> = {
    sol: { cup: "얼음을 컵에 담았어요. <b>그릇 바꾸기</b>를 눌러 접시로 옮겨 보세요.", dish: "접시로 옮겨도 얼음은 <b>모양도 부피도 그대로</b>예요." },
    liq: { cup: "물은 <b>컵 모양대로</b> 담겨요. 접시로 옮기면 어떻게 될까요?", dish: "물이 <b>접시 모양대로</b> 퍼졌어요. 양(부피)은 그대로예요." },
    gas: { cup: "수증기는 컵 안을 <b>가득</b> 채워요. 접시로 옮겨 보세요.", dish: "수증기는 접시 안도 <b>가득</b> 채워요. 모양도 부피도 그릇대로예요." },
  };

  function refresh(): void {
    const p = PRESET[cur];
    m.ms.setTemp(p.T);
    name.textContent = `${p.name}(${p.word})`;
    m.read.textContent = shape === "cup" ? "컵" : "접시";
    dot.style.background = colFor(p.T, 66, 1);
    dot.style.boxShadow = `0 0 8px ${colFor(p.T, 60, 0.8)}`;
    swap.textContent = shape === "cup" ? "그릇 바꾸기: 컵에서 접시로" : "그릇 바꾸기: 접시에서 컵으로";
    (Object.keys(cards) as Key[]).forEach((k) => cards[k].on(k === cur));
    host.dataset.u4Shape = `${cur}:${shape}`;
    if (asked) return;
    tried[cur].add(shape);
    let n = 0;
    (Object.keys(tried) as Key[]).forEach((k) => {
      if (tried[k].size === 2) {
        n += 1;
        if (!cards[k].isDone()) cards[k].done();
      }
    });
    f.pips(n);
    f.say(SAY[cur][shape]);
    if (n === 3) {
      asked = true;
      tm.later(judge, 1300);
    }
  }

  function judge(): void {
    f.slot.ask(
      "그릇을 바꿨을 때 <b>모양만</b> 달라지고 부피는 그대로인 것은?",
      [{ t: "액체(물)", ok: true }, { t: "고체(얼음)" }, { t: "기체(수증기)" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "물은 그릇 모양대로 담기지만 <b>양은 그대로</b>였어요.",
        onNext: () => lab.finish("고체는 <b>모양과 부피</b>가 일정해요. 액체는 <b>모양만</b>, 기체는 <b>모양과 부피</b> 모두 그릇에 따라 달라져요."),
      },
    );
  }

  api.setCTA("세 가지 상태를 두 그릇에 담아 보세요", { enabled: false });
  return lab.cleanup;
};
