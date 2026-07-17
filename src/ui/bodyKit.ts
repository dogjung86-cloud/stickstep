// bodyKit — 중2 VI 동물과 에너지 공용 벡터 문법.
// 혈액·기체·영양소·요소와 혈관/판막 표현은 이 파일의 토큰과 헬퍼를 공유한다.

export type BodyColor =
  | "oxygenated" | "deoxygenated" | "oxygen" | "carbon"
  | "nutrient" | "protein" | "fat" | "urea"
  | "organHi" | "organ" | "organLo" | "vesselHi" | "vessel" | "vesselLo"
  | "airwayHi" | "airway" | "airwayLo" | "kidneyHi" | "kidney" | "kidneyLo"
  | "cellHi" | "cell" | "cellLo";

const VAR: Record<BodyColor, string> = {
  oxygenated: "--body-oxygenated",
  deoxygenated: "--body-deoxygenated",
  oxygen: "--body-oxygen",
  carbon: "--body-carbon",
  nutrient: "--body-nutrient",
  protein: "--body-protein",
  fat: "--body-fat",
  urea: "--body-urea",
  organHi: "--body-organ-hi",
  organ: "--body-organ",
  organLo: "--body-organ-lo",
  vesselHi: "--body-vessel-hi",
  vessel: "--body-vessel",
  vesselLo: "--body-vessel-lo",
  airwayHi: "--body-airway-hi",
  airway: "--body-airway",
  airwayLo: "--body-airway-lo",
  kidneyHi: "--body-kidney-hi",
  kidney: "--body-kidney",
  kidneyLo: "--body-kidney-lo",
  cellHi: "--body-cell-hi",
  cell: "--body-cell",
  cellLo: "--body-cell-lo",
};

export function bodyColor(name: BodyColor): string {
  return getComputedStyle(document.documentElement).getPropertyValue(VAR[name]).trim();
}

export function safePointerCapture(el: Element, pointerId: number): void {
  try {
    (el as Element & { setPointerCapture(id: number): void }).setPointerCapture(pointerId);
  } catch {
    // 합성 PointerEvent에는 활성 포인터가 없어 throw할 수 있다.
  }
}

export type BodyMaterial = "oxygen" | "carbon" | "nutrient" | "protein" | "fat" | "urea";

export function drawMaterialToken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  kind: BodyMaterial,
  label?: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  const glow = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.08, 0, 0, r);
  glow.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue("--n0").trim());
  glow.addColorStop(0.32, bodyColor(kind));
  glow.addColorStop(1, bodyColor(kind));
  ctx.fillStyle = glow;
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--stage").trim();
  ctx.lineWidth = Math.max(1.1, r * 0.12);
  ctx.beginPath();
  if (kind === "nutrient") {
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 3;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (kind === "fat") {
    ctx.ellipse(0, 0, r * 1.18, r * 0.82, -0.35, 0, Math.PI * 2);
  } else {
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
  if (label) {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--n0").trim();
    ctx.font = `850 ${Math.max(8, r * 0.66)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 0.5);
  }
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
  ctx.lineTo(x1 - Math.cos(a - 0.5) * head, y1 - Math.sin(a - 0.5) * head);
  ctx.lineTo(x1 - Math.cos(a + 0.5) * head, y1 - Math.sin(a + 0.5) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawVesselTube(
  ctx: CanvasRenderingContext2D,
  points: readonly [number, number][],
  kind: "oxygenated" | "deoxygenated",
  width = 20,
): void {
  if (points.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.strokeStyle = bodyColor("vesselLo");
  ctx.lineWidth = width + 5;
  ctx.stroke();
  ctx.strokeStyle = bodyColor(kind);
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.strokeStyle = bodyColor("vesselHi");
  ctx.globalAlpha = 0.38;
  ctx.lineWidth = Math.max(2, width * 0.16);
  ctx.translate(-width * 0.13, -width * 0.13);
  ctx.stroke();
  ctx.restore();
}

export function drawValve(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle = 0,
  size = 12,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const g = ctx.createLinearGradient(0, -size, 0, size);
  g.addColorStop(0, bodyColor("organHi"));
  g.addColorStop(0.55, bodyColor("organ"));
  g.addColorStop(1, bodyColor("organLo"));
  ctx.fillStyle = g;
  ctx.strokeStyle = bodyColor("organLo");
  ctx.lineWidth = 1.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * size, -size * 0.75, side * size * 0.74, size * 0.8);
    ctx.quadraticCurveTo(side * size * 0.3, size * 0.22, 0, 0);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function drawOrganBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  kind: "organ" | "kidney" | "cell" = "organ",
): void {
  const hi = kind === "organ" ? "organHi" : kind === "kidney" ? "kidneyHi" : "cellHi";
  const mid = kind === "organ" ? "organ" : kind === "kidney" ? "kidney" : "cell";
  const lo = kind === "organ" ? "organLo" : kind === "kidney" ? "kidneyLo" : "cellLo";
  ctx.save();
  const g = ctx.createRadialGradient(x - rx * 0.35, y - ry * 0.4, 2, x, y, Math.max(rx, ry));
  g.addColorStop(0, bodyColor(hi));
  g.addColorStop(0.55, bodyColor(mid));
  g.addColorStop(1, bodyColor(lo));
  ctx.fillStyle = g;
  ctx.strokeStyle = bodyColor(lo);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ── DOM/SVG 도해 공용 헬퍼 ───────────────────────────────────
export type BodyMatter = "oxygen" | "carbon" | "glucose" | "amino" | "fat" | "urea" | "water";
export type BodyOrgan = "stomach" | "heart" | "lungs" | "kidneys" | "cell";
export type BloodTone = "oxygenated" | "deoxygenated";

/** SVG용 공용 3스톱 재질. id는 같은 문서 안에서 고유해야 한다. */
export function bodyDefs(id: string): string {
  return `<linearGradient id="${id}-organ" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-organ-hi)"/><stop offset=".54" stop-color="var(--body-organ)"/><stop offset="1" stop-color="var(--body-organ-lo)"/></linearGradient>
  <linearGradient id="${id}-tissue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-tissue-hi)"/><stop offset=".56" stop-color="var(--body-tissue)"/><stop offset="1" stop-color="var(--body-tissue-lo)"/></linearGradient>
  <linearGradient id="${id}-airway" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-airway-hi)"/><stop offset=".58" stop-color="var(--body-airway)"/><stop offset="1" stop-color="var(--body-airway-lo)"/></linearGradient>
  <linearGradient id="${id}-kidney" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-kidney-hi)"/><stop offset=".55" stop-color="var(--body-kidney)"/><stop offset="1" stop-color="var(--body-kidney-lo)"/></linearGradient>
  <radialGradient id="${id}-cell" cx=".3" cy=".24" r=".94"><stop stop-color="var(--body-cell-hi)"/><stop offset=".58" stop-color="var(--body-cell)"/><stop offset="1" stop-color="var(--body-cell-lo)"/></radialGradient>`;
}

export function bodyArrow(id: string, color: string): string {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9 Z" fill="${color}"/></marker>`;
}

/** 외곽선→혈액면→키라이트의 3겹 혈관 튜브. */
export function bloodTube(id: string, d: string, tone: BloodTone, width = 14): string {
  const fill = tone === "oxygenated" ? "var(--body-oxygenated)" : "var(--body-deoxygenated)";
  return `<path id="${id}" d="${d}" fill="none" stroke="var(--body-vessel-lo)" stroke-width="${width + 4}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${fill}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="var(--n0)" stroke-width="${Math.max(1.4, width * 0.16)}" stroke-linecap="round" opacity=".28"/>`;
}

export function valveSvg(x: number, y: number, rotation = 0, open = true, size = 14, id = "body"): string {
  const spread = open ? 0.72 : 0.2;
  return `<g transform="translate(${x} ${y}) rotate(${rotation})" fill="url(#${id}-tissue)" stroke="var(--body-tissue-lo)" stroke-width="1.4">
    <path d="M0 0 Q${size * 0.52} ${-size * 0.34} ${size * spread} ${size * 0.5} Q${size * 0.3} ${size * 0.26} 0 0Z"/>
    <path d="M0 0 Q${-size * 0.52} ${-size * 0.34} ${-size * spread} ${size * 0.5} Q${-size * 0.3} ${size * 0.26} 0 0Z"/>
  </g>`;
}

export function bodyMatterSvg(kind: BodyMatter, x: number, y: number, r = 7, label = ""): string {
  const fill: Record<BodyMatter, string> = {
    oxygen: "var(--body-oxygen)", carbon: "var(--body-carbon)", glucose: "var(--body-nutrient)",
    amino: "var(--body-protein)", fat: "var(--body-fat)", urea: "var(--body-urea)", water: "var(--body-airway-hi)",
  };
  const stroke = kind === "water" ? "var(--body-airway-lo)" : "var(--body-organ-lo)";
  let shape = `<circle r="${r}"/>`;
  if (kind === "oxygen") shape = `<circle cx="${-r * 0.42}" r="${r * 0.72}"/><circle cx="${r * 0.42}" r="${r * 0.72}"/>`;
  else if (kind === "carbon") shape = `<circle cx="${-r * 0.8}" r="${r * 0.56}"/><circle r="${r * 0.64}"/><circle cx="${r * 0.8}" r="${r * 0.56}"/>`;
  else if (kind === "glucose") shape = `<path d="M0 ${-r} L${r * 0.87} ${-r * 0.5} L${r * 0.87} ${r * 0.5} L0 ${r} L${-r * 0.87} ${r * 0.5} L${-r * 0.87} ${-r * 0.5}Z"/>`;
  else if (kind === "urea") shape = `<path d="M0 ${-r} L${r} 0 L0 ${r} L${-r} 0Z"/>`;
  else if (kind === "fat" || kind === "water") shape = `<path d="M0 ${-r * 1.12} C${r * 0.92} ${-r * 0.1} ${r * 0.72} ${r} 0 ${r} C${-r * 0.72} ${r} ${-r * 0.92} ${-r * 0.1} 0 ${-r * 1.12}Z"/>`;
  return `<g transform="translate(${x} ${y})" fill="${fill[kind]}" stroke="${stroke}" stroke-width="1.2">${shape}${label ? `<text y="3" text-anchor="middle" fill="var(--n0)" stroke="none" font-size="${Math.max(7, r * 0.72)}" font-weight="850">${label}</text>` : ""}</g>`;
}

/** 지도·랩·도해에서 같은 실루엣을 쓰기 위한 소형 기관 글리프. */
export function organSilhouette(kind: BodyOrgan, x: number, y: number, scale = 1, id = "body"): string {
  const t = `translate(${x} ${y}) scale(${scale})`;
  if (kind === "stomach") return `<g transform="${t}"><path d="M-5 -22 C-10 -10 -6 -2 -13 5 C-22 14 -18 28 -5 30 C10 33 23 20 18 6 C14 -4 6 0 3 -10 C1 -16 3 -20 4 -25Z" fill="url(#${id}-organ)" stroke="var(--body-organ-lo)" stroke-width="1.6"/><path d="M-4 -15 C-7 -6 -2 2 -9 10" fill="none" stroke="var(--n0)" stroke-width="2" opacity=".38" stroke-linecap="round"/></g>`;
  if (kind === "heart") return `<g transform="${t}"><path d="M0 27 C-8 17 -22 9 -21 -5 C-20 -17 -7 -20 0 -9 C8 -21 22 -16 21 -4 C20 9 9 18 0 27Z" fill="url(#${id}-organ)" stroke="var(--body-organ-lo)" stroke-width="1.6"/><path d="M0 -8 C-2 -17 0 -23 5 -27 M8 -8 C12 -16 15 -19 20 -18" fill="none" stroke="var(--body-vessel-lo)" stroke-width="4" stroke-linecap="round"/></g>`;
  if (kind === "lungs") return `<g transform="${t}"><path d="M-3 -15 C-15 -22 -26 -10 -25 8 C-25 22 -16 28 -7 22 C-3 17 -3 8 -3 -15Z" fill="url(#${id}-tissue)" stroke="var(--body-airway-lo)" stroke-width="1.5"/><path d="M3 -15 C15 -22 26 -10 25 8 C25 22 16 28 7 22 C3 17 3 8 3 -15Z" fill="url(#${id}-tissue)" stroke="var(--body-airway-lo)" stroke-width="1.5"/><path d="M0 -29 V-6 M0 -10 L-11 1 M0 -10 L11 1" fill="none" stroke="var(--body-airway-lo)" stroke-width="4" stroke-linecap="round"/></g>`;
  if (kind === "kidneys") return `<g transform="${t}"><path d="M-8 -21 C-24 -24 -28 -7 -24 8 C-20 23 -9 28 -3 18 C1 11 -6 4 -7 -2 C-9 -11 2 -16 -8 -21Z M8 -21 C24 -24 28 -7 24 8 C20 23 9 28 3 18 C-1 11 6 4 7 -2 C9 -11 -2 -16 8 -21Z" fill="url(#${id}-kidney)" stroke="var(--body-kidney-lo)" stroke-width="1.6"/><path d="M-4 14 L-3 30 M4 14 L3 30" stroke="var(--body-urea)" stroke-width="2.4" stroke-linecap="round"/></g>`;
  return `<g transform="${t}"><path d="M-28 0 C-29 -17 -15 -28 1 -26 C18 -29 29 -14 27 2 C29 18 13 28 -2 25 C-18 28 -30 16 -28 0Z" fill="url(#${id}-cell)" stroke="var(--body-cell-lo)" stroke-width="1.6"/><circle cx="-4" r="9" fill="var(--body-protein)" stroke="var(--body-organ-lo)" stroke-width="1.4"/><path d="M9 -10 C18 -15 23 -5 16 -1 C8 2 4 -6 9 -10Z M8 9 C17 4 23 14 15 18 C7 21 3 13 8 9Z" fill="var(--body-organ)" stroke="var(--body-organ-lo)" stroke-width="1.2"/></g>`;
}
