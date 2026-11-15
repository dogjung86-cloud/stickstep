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
  /** 주사기를 그린다. cx 가운데, bot 바닥, vol 부피(mL), temp 속 기체의 온도. capped면 끝에 마개가 있다. marks면 눈금(28~36 mL)과 숫자 36, 28. */
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
      // 통: 37 mL 눈금 조금 위까지(가장 큰 부피 36 mL의 피스톤이 통 안에 든다)
      const top = bot - 37 * pxPerMl - 10;
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
          ctx.lineWidth = 1.2;
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
      ctx.fillRect(cx - 4, b.y0 - 8 - 24, 8, 24);
      rr(ctx, cx - halfW + 4, b.y0 - 8 - 30, halfW * 2 - 8, 7, 3);
      ctx.fill();
    },
  };
}

/** 물이 든 비커. 물은 맑은 물빛이고, 뜨거우면 바닥의 주황 기운과 오르는 물결, 물결 모양의 김, 차가우면 수면에 뜬 얼음 조각이 보인다.
 *  얼음은 주사기 눈금(오른쪽 위)을 가리지 않게 수면의 양 끝에만 둔다. */
export function beaker(ctx: CanvasRenderingContext2D, x: number, top: number, w: number, bot: number, temp: number, tMs: number): void {
  const k = Math.max(0, Math.min(1, temp / 80));
  const surf = top + 14;
  const lerp = (a: number, c: number): number => Math.round(a + (c - a) * k);
  // 물은 온도와 상관없이 맑은 물빛이다(어두운 무대에서 주황을 칠하면 흙탕물이나 국물처럼 보인다).
  // 뜨거운 물은 바닥의 옅은 주황 기운과 물속에서 일렁이며 오르는 주황 물결, 수면 위의 김으로 알린다.
  const water = ctx.createLinearGradient(0, surf, 0, bot);
  water.addColorStop(0, "rgba(160, 205, 250, .13)");
  water.addColorStop(1, "rgba(100, 165, 240, .27)");
  rr(ctx, x + 2, surf, w - 4, bot - surf - 2, 9);
  ctx.fillStyle = water;
  ctx.fill();
  if (temp > 40) {
    const hk = (temp - 40) / 40;
    ctx.save();
    rr(ctx, x + 2, surf, w - 4, bot - surf - 2, 9);
    ctx.clip();
    const glow = ctx.createLinearGradient(0, bot - 40, 0, bot);
    glow.addColorStop(0, "rgba(255,170,100,0)");
    glow.addColorStop(1, `rgba(255,170,100,${(0.22 * hk).toFixed(3)})`);
    ctx.fillStyle = glow;
    ctx.fillRect(x, bot - 40, w, 40);
    ctx.strokeStyle = `rgba(255,190,130,${(0.45 * hk).toFixed(3)})`;
    ctx.lineWidth = 1.3;
    for (const fx of [0.12, 0.88]) {
      const ox = x + w * fx;
      const ph = (tMs / 1400 + fx) % 1;
      const y0 = bot - 6 - ph * (bot - surf - 20);
      ctx.beginPath();
      ctx.moveTo(ox, y0);
      ctx.bezierCurveTo(ox - 4, y0 - 6, ox + 4, y0 - 12, ox, y0 - 18);
      ctx.stroke();
    }
    ctx.restore();
  }
  // 수면
  ctx.strokeStyle = `rgba(${lerp(190, 255)}, ${lerp(225, 214)}, ${lerp(255, 170)}, .55)`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x + 3, surf);
  ctx.lineTo(x + w - 3, surf);
  ctx.stroke();
  // 유리 벽
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
    ctx.fillStyle = `rgba(232,246,255,${((0.85 * (8 - temp)) / 8).toFixed(3)})`;
    ctx.strokeStyle = `rgba(255,255,255,${((0.9 * (8 - temp)) / 8).toFixed(3)})`;
    ctx.lineWidth = 1;
    for (const [dx, dy, s] of [[4, -4, 10], [w - 14, -3, 10], [5, 6, 8]] as [number, number, number][]) {
      rr(ctx, x + dx, surf + dy + Math.sin(tMs / 600 + dx) * 0.8, s, s - 1, 2.5);
      ctx.fill();
      ctx.stroke();
    }
  }
  if (temp > 60) {
    // 김: 수면 위로 피어오르는 물결 모양의 선
    ctx.strokeStyle = `rgba(255,255,255,${(((temp - 60) / 20) * 0.45).toFixed(3)})`;
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    for (const dx of [7, w - 7]) {
      const ph = Math.sin(tMs / 500 + dx) * 2;
      ctx.beginPath();
      ctx.moveTo(x + dx, surf - 4);
      ctx.bezierCurveTo(x + dx - 5 + ph, surf - 10, x + dx + 5 + ph, surf - 16, x + dx + ph, surf - 24);
      ctx.stroke();
    }
  }
}
