// 세로로 세운 주사기와 물이 든 비커(u6l4의 두 랩이 함께 쓴다). 입자는 ui/gasKit의 GasBox가 그린다.
import { GasBox, type GasBounds } from "../../../ui/gasKit";
import { rr, txt } from "./u6Kit";

export const volOf = (t: number): number => 28 + t * 0.1; // 0 ℃ 28.0 mL, 20 ℃ 30.0 mL, 80 ℃ 36.0 mL
/** 온도에 따른 색상(파랑에서 보라를 거쳐 주황으로) */
export const hueOf = (t: number): number => 205 + (t / 80) * 180;
/** 온도에 따른 입자의 빠르기(차이가 눈에 보이게 벌렸다: 0 ℃ 0.55배, 80 ℃ 1.35배쯤) */
export const speedOf = (t: number): number => 0.55 + (Math.sqrt((273 + t) / 293) - 0.965) * 6.2;

export interface VSyringe {
  box: GasBox;
  /** 주사기를 그린다. cx 가운데, bot 바닥, vol 부피(mL), temp 속 기체의 온도. capped면 끝에 마개가 있다. */
  draw: (ctx: CanvasRenderingContext2D, dt: number, o: { cx: number; bot: number; vol: number; temp: number; capped: boolean; marks?: boolean }) => void;
}

export function vSyringe(n: number, pxPerMl: number, halfW = 20): VSyringe {
  const box = new GasBox(1.5);
  let lastCx = NaN;
  return {
    box,
    draw(ctx, dt, { cx, bot, vol, temp, capped, marks }) {
      const b: GasBounds = { x0: cx - halfW, y0: bot - vol * pxPerMl, x1: cx + halfW, y1: bot };
      if (box.parts.length !== n) box.setCount(n, b);
      if (!Number.isNaN(lastCx) && lastCx !== cx) for (const p of box.parts) p.x += cx - lastCx; // 주사기를 옮기면 입자도 함께 간다
      lastCx = cx;
      for (const p of box.parts) {
        if (p.y < b.y0 + 5) {
          p.y = b.y0 + 5;
          p.vy = Math.abs(p.vy); // 내려오는 피스톤에 밀린 입자는 아래로 튕긴다
        }
        p.x = Math.max(b.x0 + 5, Math.min(b.x1 - 5, p.x));
      }
      const sp = speedOf(temp);
      box.step(dt, b, sp);
      const top = bot - 38 * pxPerMl - 14;
      rr(ctx, cx - halfW - 4, top, halfW * 2 + 8, bot - top + 4, 6);
      ctx.fillStyle = "rgba(200,220,250,.10)";
      ctx.fill();
      ctx.strokeStyle = "rgba(205,224,252,.6)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // 끝(아래): 마개 또는 열린 구멍
      if (capped) {
        rr(ctx, cx - 9, bot + 3, 18, 9, 3);
        ctx.fillStyle = "#E8794A";
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(205,224,252,.6)";
        ctx.fillRect(cx - 3, bot + 3, 6, 8);
      }
      if (marks) {
        for (const mv of [28, 30, 32, 34, 36]) {
          const y = bot - mv * pxPerMl;
          ctx.strokeStyle = "rgba(205,224,252,.55)";
          ctx.beginPath();
          ctx.moveTo(cx + halfW - 8, y);
          ctx.lineTo(cx + halfW + 4, y);
          ctx.stroke();
        }
        txt(ctx, "36", cx + halfW + 8, bot - 36 * pxPerMl, { color: "#C9D6EC" });
        txt(ctx, "28", cx + halfW + 8, bot - 28 * pxPerMl, { color: "#C9D6EC" });
      }
      box.draw(ctx, hueOf(temp), sp);
      // 피스톤과 손잡이
      rr(ctx, cx - halfW - 1, b.y0 - 8, halfW * 2 + 2, 8, 3);
      ctx.fillStyle = "#A9BCDB";
      ctx.fill();
      ctx.fillStyle = "#7F95B9";
      ctx.fillRect(cx - 4, b.y0 - 8 - 26, 8, 26);
      rr(ctx, cx - halfW + 4, b.y0 - 8 - 32, halfW * 2 - 8, 7, 3);
      ctx.fill();
    },
  };
}

/** 물이 든 비커. temp에 따라 물빛이 달라지고, 차가우면 얼음 조각이, 뜨거우면 김이 보인다. */
export function beaker(ctx: CanvasRenderingContext2D, x: number, top: number, w: number, bot: number, temp: number, tMs: number): void {
  const k = temp / 80;
  rr(ctx, x + 2, top + 14, w - 4, bot - top - 16, 9);
  ctx.fillStyle = `rgba(${Math.round(60 + 170 * k)}, ${Math.round(150 - 30 * k)}, ${Math.round(235 - 150 * k)}, .34)`;
  ctx.fill();
  ctx.strokeStyle = "rgba(190,214,250,.55)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bot - 10);
  ctx.quadraticCurveTo(x, bot, x + 10, bot);
  ctx.lineTo(x + w - 10, bot);
  ctx.quadraticCurveTo(x + w, bot, x + w, bot - 10);
  ctx.lineTo(x + w, top);
  ctx.stroke();
  if (temp < 8) {
    ctx.fillStyle = `rgba(225,242,255,${(0.8 * (8 - temp)) / 8})`;
    for (const [dx, dy] of [[6, 18], [w - 20, 22], [8, 46]]) {
      rr(ctx, x + dx, top + dy + Math.sin(tMs / 500 + dx) * 1.5, 13, 11, 3);
      ctx.fill();
    }
  }
  if (temp > 60) {
    ctx.strokeStyle = `rgba(255,255,255,${((temp - 60) / 20) * 0.4})`;
    ctx.lineWidth = 2;
    for (const dx of [14, w - 14]) {
      const ph = tMs / 400 + dx;
      ctx.beginPath();
      ctx.moveTo(x + dx, top + 8);
      ctx.quadraticCurveTo(x + dx + Math.sin(ph) * 6, top - 4, x + dx, top - 14);
      ctx.stroke();
    }
  }
}
