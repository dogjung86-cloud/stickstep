// plantKit — 중2 V 식물과 에너지 공용 그림 문법.
// 채점되는 과학 정보(기공·엽록체·물관·체관·물질 토큰)는 발주 이미지가 아니라 이 벡터 킷으로 그린다.

export type PlantColor =
  | "leafHi" | "leaf" | "leafLo" | "vein" | "xylem" | "phloem" | "sun"
  | "water" | "carbon" | "oxygen" | "glucose" | "starch" | "soil";

const VAR: Record<PlantColor, string> = {
  leafHi: "--plant-leaf-hi",
  leaf: "--plant-leaf",
  leafLo: "--plant-leaf-lo",
  vein: "--plant-vein",
  xylem: "--plant-xylem",
  phloem: "--plant-phloem",
  sun: "--plant-sun",
  water: "--plant-water",
  carbon: "--plant-carbon",
  oxygen: "--plant-oxygen",
  glucose: "--plant-glucose",
  starch: "--plant-starch",
  soil: "--plant-soil",
};

export function plantColor(name: PlantColor): string {
  return getComputedStyle(document.documentElement).getPropertyValue(VAR[name]).trim();
}

export function plantAsset(path: string): string {
  const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
  return `${base}plant/${path}`;
}

export function safePointerCapture(el: Element, pointerId: number): void {
  try {
    (el as Element & { setPointerCapture(id: number): void }).setPointerCapture(pointerId);
  } catch {
    // 합성 PointerEvent에는 브라우저의 활성 포인터가 없어 throw할 수 있다.
  }
}

export function drawLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rot = 0,
  alpha = 1,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(-w * 0.5, -h * 0.45, w * 0.55, h * 0.45);
  g.addColorStop(0, plantColor("leafHi"));
  g.addColorStop(0.52, plantColor("leaf"));
  g.addColorStop(1, plantColor("leafLo"));
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, 0);
  ctx.bezierCurveTo(-w * 0.22, -h * 0.62, w * 0.28, -h * 0.62, w * 0.52, 0);
  ctx.bezierCurveTo(w * 0.26, h * 0.58, -w * 0.24, h * 0.58, -w * 0.5, 0);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = plantColor("leafLo");
  ctx.lineWidth = Math.max(1.2, w * 0.018);
  ctx.stroke();
  ctx.strokeStyle = plantColor("vein");
  ctx.lineWidth = Math.max(1.1, w * 0.015);
  ctx.beginPath();
  ctx.moveTo(-w * 0.42, 0);
  ctx.quadraticCurveTo(0, -h * 0.03, w * 0.42, 0);
  ctx.stroke();
  for (const t of [-0.24, -0.08, 0.08, 0.24]) {
    const vx = t * w;
    ctx.beginPath();
    ctx.moveTo(vx, 0);
    ctx.lineTo(vx + w * 0.11, -h * 0.23);
    ctx.moveTo(vx, 0);
    ctx.lineTo(vx + w * 0.11, h * 0.23);
    ctx.stroke();
  }
  ctx.restore();
}
export function drawChloroplast(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot = 0,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, 2, 0, 0, rx);
  g.addColorStop(0, plantColor("leafHi"));
  g.addColorStop(0.6, plantColor("leaf"));
  g.addColorStop(1, plantColor("leafLo"));
  ctx.fillStyle = g;
  ctx.strokeStyle = plantColor("vein");
  ctx.lineWidth = Math.max(1.5, rx * 0.055);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 0.78;
  for (const gx of [-0.42, 0, 0.42]) {
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath();
      ctx.ellipse(gx * rx, k * ry * 0.2, rx * 0.16, ry * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = plantColor("leafLo");
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawStoma(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, open: number): void {
  const gap = size * (0.08 + Math.max(0, Math.min(1, open)) * 0.18);
  ctx.save();
  ctx.translate(x, y);
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * gap, 0);
    ctx.scale(side, 1);
    const g = ctx.createLinearGradient(0, -size * 0.4, 0, size * 0.4);
    g.addColorStop(0, plantColor("leafHi"));
    g.addColorStop(1, plantColor("leaf"));
    ctx.fillStyle = g;
    ctx.strokeStyle = plantColor("leafLo");
    ctx.lineWidth = Math.max(1.2, size * 0.035);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.48);
    ctx.bezierCurveTo(size * 0.42, -size * 0.34, size * 0.42, size * 0.34, 0, size * 0.48);
    ctx.bezierCurveTo(size * 0.18, size * 0.2, size * 0.18, -size * 0.2, 0, -size * 0.48);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export function drawSun(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, phase = 0): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(phase);
  ctx.strokeStyle = plantColor("sun");
  ctx.lineWidth = Math.max(2, r * 0.1);
  ctx.lineCap = "round";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25);
    ctx.lineTo(Math.cos(a) * r * 1.58, Math.sin(a) * r * 1.58);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.08, 0, 0, r);
  g.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue("--n0").trim());
  g.addColorStop(0.3, plantColor("sun"));
  g.addColorStop(1, plantColor("sun"));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawFlowArrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
  width = 4,
): void {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const head = Math.max(8, width * 2.4);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(a - 0.52) * head, y1 - Math.sin(a - 0.52) * head);
  ctx.lineTo(x1 - Math.cos(a + 0.52) * head, y1 - Math.sin(a + 0.52) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawMaterialToken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  kind: "water" | "carbon" | "oxygen" | "glucose" | "starch",
  label?: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = plantColor(kind);
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--n0").trim();
  ctx.lineWidth = Math.max(1.2, r * 0.14);
  ctx.beginPath();
  if (kind === "water") {
    ctx.moveTo(0, -r * 1.15);
    ctx.bezierCurveTo(r * 0.85, -r * 0.15, r * 0.72, r, 0, r);
    ctx.bezierCurveTo(-r * 0.72, r, -r * 0.85, -r * 0.15, 0, -r * 1.15);
  } else if (kind === "glucose" || kind === "starch") {
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
  if (label) {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--n0").trim();
    ctx.font = `800 ${Math.max(9, r * 0.72)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 0.5);
  }
  ctx.restore();
}
