// elecKit — 중2 VII(전기와 자기) 랩 공용 킷(다크 무대 캔버스).
// 회로 소품(전지·전구·전선·스위치)과 전하 표현의 단일 진실 공급원 — 하드코딩 금지.
//   · 전자(−)는 chemKit의 파란 알갱이와 같은 표현(IV 단원과 연계 — "그때 그 전자").
//   · (+)전하는 붉은 알갱이. 전류 흐름은 전선 위 앰버 점 흐름(lightKit drawBeam 문법 계승).
//   · 전구 밝기는 0~1 — 글로우 반경·필라멘트 색이 함께 변한다.

import { drawElectron } from "./chemKit";

export { drawElectron }; // 전자(−) — chemKit과 동일 표현을 그대로 쓴다

export const TAU = Math.PI * 2;
export const ELEC = {
  amber: "255,196,90", // 전류 흐름 점·양(+) 계열
  cyan: "126,214,255", // 보조 하이라이트
  plusBody: "#E8836B",
  plusLine: "#A8442E",
  wire: "#8FA4C2",
  wireDark: "#4E5E78",
};

/** (+)전하 알갱이 — 붉은 톤(chemKit 원자핵 톤과 동조). */
export function drawPlus(ctx: CanvasRenderingContext2D, x: number, y: number, r = 7, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.34, r * 0.15, x, y, r);
  g.addColorStop(0, "#FFC0AE");
  g.addColorStop(0.6, "#E8836B");
  g.addColorStop(1, "#9E3A24");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#6E2114";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,244,238,.95)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.42, y);
  ctx.lineTo(x + r * 0.42, y);
  ctx.moveTo(x, y - r * 0.42);
  ctx.lineTo(x, y + r * 0.42);
  ctx.stroke();
  ctx.restore();
}

/** 전선 — 폴리라인. on이면 앰버 전류 점이 흐른다(flow 0~1 위상). dir=-1이면 역방향. */
export function drawWire(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  o: { on?: boolean; flow?: number; dir?: 1 | -1; width?: number } = {},
): void {
  if (pts.length < 2) return;
  const w = o.width ?? 4;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = ELEC.wireDark;
  ctx.lineWidth = w + 2.4;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.strokeStyle = ELEC.wire;
  ctx.lineWidth = w;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  if (o.on) {
    // 경로 길이 파라미터화 후 등간격 점 흐름
    const segs: { a: { x: number; y: number }; b: { x: number; y: number }; len: number }[] = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      segs.push({ a: pts[i], b: pts[i + 1], len });
      total += len;
    }
    const gap = 26;
    const n = Math.max(2, Math.floor(total / gap));
    const phase = ((o.flow ?? 0) % 1) * gap * (o.dir ?? 1);
    ctx.fillStyle = `rgba(${ELEC.amber},.95)`;
    ctx.shadowColor = `rgba(${ELEC.amber},.9)`;
    ctx.shadowBlur = 7;
    for (let k = 0; k < n; k++) {
      let d = (k * gap + phase + total * 2) % total;
      for (const sgm of segs) {
        if (d <= sgm.len) {
          const t = sgm.len ? d / sgm.len : 0;
          ctx.beginPath();
          ctx.arc(sgm.a.x + (sgm.b.x - sgm.a.x) * t, sgm.a.y + (sgm.b.y - sgm.a.y) * t, 2.6, 0, TAU);
          ctx.fill();
          break;
        }
        d -= sgm.len;
      }
    }
  }
  ctx.restore();
}

/** 전지 — 가로형(왼쪽 −, 오른쪽 + 기본). 파운드리 재질 + (+)(−) 라벨. */
export function drawBattery(ctx: CanvasRenderingContext2D, x: number, y: number, w = 74, h = 30, flip = false): void {
  ctx.save();
  const g = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
  g.addColorStop(0, "#B8C6DA");
  g.addColorStop(0.5, "#8FA0B8");
  g.addColorStop(1, "#5E7090");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 7);
  ctx.fill();
  // (+)극 캡
  const capX = flip ? x - w / 2 - 7 : x + w / 2;
  ctx.fillStyle = "#D8B04A";
  ctx.beginPath();
  ctx.roundRect(capX, y - h * 0.22, 7, h * 0.44, 2.5);
  ctx.fill();
  ctx.strokeStyle = "#25324A";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 7);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.55)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 7, y - h / 2 + 5);
  ctx.lineTo(x + w / 2 - 10, y - h / 2 + 5);
  ctx.stroke();
  ctx.font = "800 14px Pretendard, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#F2F7FF";
  // (+) 라벨은 언제나 캡 쪽에 — flip이면 캡이 왼쪽이므로 라벨도 함께 이동
  ctx.fillText("+", x + (flip ? -1 : 1) * w * 0.3, y + 0.5);
  ctx.fillText("−", x + (flip ? 1 : -1) * w * 0.3, y + 0.5);
  ctx.restore();
}

/** 전구 — brightness 0~1(글로우·필라멘트·유리 톤 연동). */
export function drawBulb(ctx: CanvasRenderingContext2D, x: number, y: number, r = 20, brightness = 0): void {
  const b = Math.max(0, Math.min(1, brightness));
  ctx.save();
  if (b > 0.02) {
    const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * (1.6 + b * 1.6));
    glow.addColorStop(0, `rgba(255,214,120,${0.5 * b})`);
    glow.addColorStop(1, "rgba(255,214,120,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * (1.6 + b * 1.6), 0, TAU);
    ctx.fill();
  }
  // 유리구
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.34, r * 0.2, x, y, r);
  g.addColorStop(0, b > 0.05 ? "#FFF6D8" : "#E8F0FA");
  g.addColorStop(0.6, b > 0.05 ? `rgba(255,${200 + Math.round(30 * b)},120,${0.55 + 0.3 * b})` : "rgba(190,208,230,.5)");
  g.addColorStop(1, "rgba(120,140,170,.35)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(160,184,214,.8)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  // 필라멘트
  ctx.strokeStyle = b > 0.05 ? `rgba(255,${170 + Math.round(70 * b)},70,.95)` : "rgba(140,160,190,.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.42, y + r * 0.28);
  ctx.lineTo(x - r * 0.2, y - r * 0.12);
  for (let i = 0; i < 4; i++) {
    const px = x - r * 0.2 + (i + 0.5) * (r * 0.4 / 4);
    ctx.lineTo(px, y - r * 0.12 + (i % 2 ? -1 : 1) * r * 0.14);
  }
  ctx.lineTo(x + r * 0.2, y - r * 0.12);
  ctx.lineTo(x + r * 0.42, y + r * 0.28);
  ctx.stroke();
  // 베이스
  ctx.fillStyle = "#7E8CA4";
  ctx.beginPath();
  ctx.roundRect(x - r * 0.42, y + r * 0.78, r * 0.84, r * 0.55, 3);
  ctx.fill();
  ctx.strokeStyle = "#3A4660";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x - r * 0.42, y + r * 0.78, r * 0.84, r * 0.55, 3);
  ctx.stroke();
  ctx.restore();
}

/** 스위치 — closed면 닫힌 막대, 아니면 들린 막대. 히트 판정은 호출부 몫. */
export function drawSwitch(ctx: CanvasRenderingContext2D, x: number, y: number, closed: boolean, w = 44): void {
  ctx.save();
  ctx.fillStyle = "#8FA4C2";
  for (const px of [x - w / 2, x + w / 2]) {
    ctx.beginPath();
    ctx.arc(px, y, 4.5, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = closed ? "#C9D8EE" : "#AEBDD6";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  const ang = closed ? 0 : -0.62;
  ctx.lineTo(x - w / 2 + Math.cos(ang) * w, y + Math.sin(ang) * w);
  ctx.stroke();
  ctx.restore();
}

/** 정전기 스파크(장식) — 노란 지그재그 번쩍. */
export function drawSpark(ctx: CanvasRenderingContext2D, x: number, y: number, len = 16, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = `rgba(${ELEC.amber},.95)`;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.shadowColor = `rgba(${ELEC.amber},.9)`;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(x, y - len);
  ctx.lineTo(x - len * 0.28, y - len * 0.2);
  ctx.lineTo(x + len * 0.2, y - len * 0.1);
  ctx.lineTo(x - len * 0.12, y + len * 0.65);
  ctx.stroke();
  ctx.restore();
}
