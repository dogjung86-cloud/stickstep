// chemKit — 중2 IV(물질의 구성) 랩 공용 킷(다크 무대 캔버스).
// 원자·전자·이온·결합을 "과학적으로 틀리지 않게" 그리기 위한 단일 진실 공급원:
//   · 원소 색은 CPK 관례(H 흰/O 빨강/C 짙은회색/N 파랑/Cl 초록/S 노랑/Na 보라 등)
//   · 상대 크기: H가 가장 작고, 음이온(Cl⁻)은 원자보다 크고 양이온(Na⁺)은 작다
//   · 원자 모형: 원자핵(+N 라벨) + 전자(−) — 양성자수 = 전자수면 중성
// 모든 화학 랩(elementLab·moleculeLab·atomLab·ionLab·ionMoveLab)이 이것만 쓴다.

export const TAU = Math.PI * 2;

export interface ElemStyle {
  name: string; // 한글 이름
  sym: string; // 원소 기호
  rgb: string; // CPK 본색 "r,g,b"
  hi: string; // 키라이트 색
  r: number; // 기준 반지름(px, 상대 크기 관례 반영)
}

// CPK 색 + 상대 크기(정확한 비율은 아니어도 대소 관계는 지킨다: H < C≈N≈O < Cl·S < 금속)
export const ELEMS: Record<string, ElemStyle> = {
  H: { name: "수소", sym: "H", rgb: "232,238,246", hi: "#FFFFFF", r: 9 },
  C: { name: "탄소", sym: "C", rgb: "84,94,108", hi: "#AEB8C6", r: 13 },
  N: { name: "질소", sym: "N", rgb: "62,110,196", hi: "#9CC2FF", r: 12.5 },
  O: { name: "산소", sym: "O", rgb: "230,58,44", hi: "#FFA894", r: 12 },
  Cl: { name: "염소", sym: "Cl", rgb: "62,186,88", hi: "#A8ECB8", r: 14.5 },
  S: { name: "황", sym: "S", rgb: "228,196,52", hi: "#FFF0A8", r: 14.5 },
  Na: { name: "나트륨", sym: "Na", rgb: "150,98,224", hi: "#D6BCFF", r: 15 },
  Cu: { name: "구리", sym: "Cu", rgb: "216,132,74", hi: "#FFD2A8", r: 15 },
  Fe: { name: "철", sym: "Fe", rgb: "168,120,88", hi: "#E0C0A8", r: 15 },
  Mg: { name: "마그네슘", sym: "Mg", rgb: "106,196,96", hi: "#C8F0C0", r: 14 },
  He: { name: "헬륨", sym: "He", rgb: "150,222,236", hi: "#E0F8FF", r: 10 },
};

/** 원자 공(파운드리 재질: 근-동조 radial + 좌상단 키라이트 + 최암색 외곽 + 기호 라벨). */
export function drawAtomBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  el: ElemStyle,
  scale = 1,
  o: { label?: boolean; alpha?: number; ghost?: boolean } = {},
): void {
  const r = el.r * scale;
  const [cr, cg, cb] = el.rgb.split(",").map(Number);
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  if (o.ghost) ctx.setLineDash([4, 4]);
  const g = ctx.createRadialGradient(x - r * 0.34, y - r * 0.36, r * 0.15, x, y, r);
  g.addColorStop(0, el.hi);
  g.addColorStop(0.55, `rgb(${cr},${cg},${cb})`);
  g.addColorStop(1, `rgb(${Math.round(cr * 0.55)},${Math.round(cg * 0.55)},${Math.round(cb * 0.55)})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(${Math.round(cr * 0.32)},${Math.round(cg * 0.32)},${Math.round(cb * 0.32)},.9)`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  if (o.label !== false && r >= 8) {
    const dark = cr * 0.299 + cg * 0.587 + cb * 0.114 > 150;
    ctx.font = `800 ${Math.max(9, r * 0.86)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = dark ? "rgba(30,40,54,.92)" : "rgba(255,255,255,.95)";
    ctx.fillText(el.sym, x, y + 0.5);
  }
  ctx.restore();
}

/** 결합 막대 — 두 원자 사이(원자 뒤에 먼저 그린다). */
export function drawBond(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w = 5): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(150,168,192,.85)";
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = "rgba(226,238,252,.5)";
  ctx.lineWidth = Math.max(1.2, w * 0.34);
  ctx.beginPath();
  ctx.moveTo(x0, y0 - w * 0.22);
  ctx.lineTo(x1, y1 - w * 0.22);
  ctx.stroke();
  ctx.restore();
}

/** 원자핵 — (+양성자수) 라벨이 붙는 붉은 핵(양성자·중성자 알갱이 질감). */
export function drawNucleus(ctx: CanvasRenderingContext2D, x: number, y: number, protons: number, neutrons: number, r = 20): void {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.34, r * 0.2, x, y, r);
  g.addColorStop(0, "#FFB09A");
  g.addColorStop(0.55, "#E85B40");
  g.addColorStop(1, "#9E2E1A");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  // 알갱이(양성자=밝음, 중성자=회색) — 개수 그대로, 12개 초과는 질감 점으로
  const total = protons + neutrons;
  const shown = Math.min(total, 12);
  for (let i = 0; i < shown; i++) {
    const a = (i / shown) * TAU + 0.7;
    const rr = r * (i % 2 ? 0.42 : 0.6);
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    const isP = i < Math.round((protons / total) * shown);
    ctx.fillStyle = isP ? "rgba(255,214,190,.85)" : "rgba(150,120,120,.8)";
    ctx.beginPath();
    ctx.arc(px, py, r * 0.16, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = "#6E1E10";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  // +N 라벨(교과서 표기)
  ctx.font = `800 ${Math.max(11, r * 0.62)}px Pretendard, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(60,12,4,.7)";
  ctx.strokeText(`+${protons}`, x, y + 0.5);
  ctx.fillStyle = "#FFF4EE";
  ctx.fillText(`+${protons}`, x, y + 0.5);
}

/** 전자 — (−) 라벨의 파란 알갱이. */
export function drawElectron(ctx: CanvasRenderingContext2D, x: number, y: number, r = 7, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.34, r * 0.15, x, y, r);
  g.addColorStop(0, "#B8DCFF");
  g.addColorStop(0.6, "#4A90E0");
  g.addColorStop(1, "#1E4E94");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#122E5C";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = "rgba(240,248,255,.95)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.42, y);
  ctx.lineTo(x + r * 0.42, y);
  ctx.stroke();
  ctx.restore();
}

/** 이온식 라벨("Na⁺", "O²⁻") — 위 첨자 렌더. baseline 중앙. */
export function drawIonLabel(ctx: CanvasRenderingContext2D, x: number, y: number, sym: string, charge: number, size = 15): void {
  if (charge === 0) return;
  const supRaw = `${Math.abs(charge) > 1 ? Math.abs(charge) : ""}${charge > 0 ? "+" : "-"}`;
  ctx.font = `800 ${size}px Pretendard, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const w = ctx.measureText(sym).width;
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = "rgba(7,14,26,.85)";
  ctx.strokeText(sym, x, y);
  ctx.fillStyle = "#EAF1FA";
  ctx.fillText(sym, x, y);
  ctx.font = `800 ${size * 0.72}px Pretendard, sans-serif`;
  ctx.strokeText(supRaw, x + w + 1, y - size * 0.42);
  ctx.fillText(supRaw, x + w + 1, y - size * 0.42);
}

/** 화학식 HTML(H_2O → H<sub>2</sub>O, 이온 Na^+ → Na<sup>+</sup>). content·DOM용. */
export function formulaHtml(f: string): string {
  return f
    .replace(/_(\d+)/g, "<sub>$1</sub>")
    .replace(/\^(\d*[+-])/g, "<sup>$1</sup>");
}
