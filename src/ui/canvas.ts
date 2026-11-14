// 캔버스 공용 헬퍼 — 고해상도(DPR) 대응 크기 설정.
import { stageDpr } from "../core/wide";

export interface Fitted { ctx: CanvasRenderingContext2D; w: number; h: number; dpr: number; }

/** 랩 무대(넓은 화면에서 CSS zoom으로 키우는 .bv-stage) 안 캔버스용 fitCanvas.
 *  fitCanvas는 getBoundingClientRect(확대된 크기)로 폭을 재서, 키운 무대에서는 폭만 배율만큼 커지고 높이(cssH)는 그대로라
 *  그림이 위아래로 늘어나고 흐려졌다(2026-11-15, 중1 Ⅶ 하늘·태양 랩). 이것은 확대 전 CSS 폭(clientWidth)으로 그리는 판을 잡고
 *  해상도만 stageDpr()로 올린다. 이 캔버스의 포인터 좌표는 localPt(core/wide)로 얻는다. */
export function fitStageCanvas(cv: HTMLCanvasElement, cssH?: number): Fitted {
  const dpr = stageDpr();
  const w = cv.clientWidth || 320;
  const h = cssH ?? (cv.clientHeight || 200);
  cv.width = Math.max(1, Math.round(w * dpr));
  cv.height = Math.max(1, Math.round(h * dpr));
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h, dpr };
}

export function fitCanvas(cv: HTMLCanvasElement, cssH?: number, maxDpr = 2): Fitted {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const rect = cv.getBoundingClientRect();
  const w = rect.width || cv.clientWidth || 320;
  const h = cssH ?? rect.height ?? 200;
  cv.width = Math.max(1, Math.round(w * dpr));
  cv.height = Math.max(1, Math.round(h * dpr));
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h, dpr };
}
