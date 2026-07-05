// 캔버스 공용 헬퍼 — 고해상도(DPR) 대응 크기 설정.
export interface Fitted { ctx: CanvasRenderingContext2D; w: number; h: number; dpr: number; }

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
