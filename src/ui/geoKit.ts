// geoKit, 수학 Ⅳ 기본 도형 공용 킷. 각 호·점·라벨·직각 표시·극좌표의 단일 진실 공급원.
// 랩 12종(traceLab~congLab)과 mathFigures의 기하 그림이 같은 문법을 쓴다.
// 좌표 관례: SVG 픽셀 좌표계 위에서 "수학 각도"(반시계 양의 방향, 0°=오른쪽)를 쓰되
// y축 뒤집힘은 polar()가 처리한다(호출부는 수학 각도만 생각하면 된다).

/** 기하 팔레트, 각 하이라이트는 순서대로 쓴다(각1 앰버 → 각2 시안 → 각3 로즈 → 각4 그린). */
export const GEO = {
  ink: "#334155", // 주 선(직선·변)
  faint: "#C6D2DE", // 보조선·모눈
  soft: "#8093A8", // 라벨 회색
  hlA: "#F08C00", // 각 하이라이트 1(앰버, 단원 테마색)
  hlB: "#0DA5C6", // 각 하이라이트 2(시안)
  hlC: "#E8547E", // 각 하이라이트 3(로즈)
  hlD: "#12B886", // 각 하이라이트 4(그린)
  pt: "#334155", // 점
  ok: "#04B45F",
  no: "#F04452",
} as const;

export const rad = (d: number): number => (d * Math.PI) / 180;
export const deg = (r: number): number => (r * 180) / Math.PI;

/** 각도를 [0, 360)로 정규화. */
export const normDeg = (d: number): number => ((d % 360) + 360) % 360;

/** 극좌표 → SVG 픽셀 점. aDeg는 수학 각도(반시계 +), SVG y 반전을 여기서 처리. */
export function polar(cx: number, cy: number, r: number, aDeg: number): { x: number; y: number } {
  return { x: cx + r * Math.cos(rad(aDeg)), y: cy - r * Math.sin(rad(aDeg)) };
}

/** 픽셀 점 → 수학 각도(도). atan2 기반, [0, 360). */
export function angleOf(cx: number, cy: number, x: number, y: number): number {
  return normDeg(deg(Math.atan2(cy - y, x - cx)));
}

/** a0에서 a1까지 반시계로 도는 호의 path d. sweep은 반시계 방향(수학 +)이 기본. */
export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const span = normDeg(a1 - a0);
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = span > 180 ? 1 : 0;
  // SVG sweep-flag 0 = 반시계(수학 +, y 반전 때문)
  return `M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${r} ${r} 0 ${large} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
}

/** 각 호 + (선택) 각도 라벨. a0→a1 반시계. 라벨은 호 중간 각도의 바깥에 자동 배치. */
export function angleArc(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  color: string,
  label?: string,
  o: { width?: number; fill?: boolean; labelR?: number; fontSize?: number } = {},
): string {
  const w = o.width ?? 2.4;
  const span = normDeg(a1 - a0);
  let s = "";
  if (o.fill) {
    const p0 = polar(cx, cy, r, a0);
    const p1 = polar(cx, cy, r, a1);
    const large = span > 180 ? 1 : 0;
    s += `<path d="M${cx} ${cy} L${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A${r} ${r} 0 ${large} 0 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Z" fill="${color}" opacity=".16"/>`;
  }
  s += `<path d="${arcPath(cx, cy, r, a0, a1)}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  if (label) {
    const mid = polar(cx, cy, o.labelR ?? r + 13, a0 + span / 2);
    s += `<text x="${mid.x.toFixed(1)}" y="${(mid.y + 4).toFixed(1)}" text-anchor="middle" font-size="${o.fontSize ?? 11.5}" font-weight="800" fill="${color}">${label}</text>`;
  }
  return s;
}

/** 직각 표시(작은 사각 꺾쇠). aDeg = 첫 변의 수학 각도, 둘째 변은 +90°. */
export function rightMark(cx: number, cy: number, aDeg: number, size = 10, color: string = GEO.ink): string {
  const p1 = polar(cx, cy, size, aDeg);
  const p2 = polar(cx, cy, size * Math.SQRT2, aDeg + 45);
  const p3 = polar(cx, cy, size, aDeg + 90);
  return `<path d="M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)} L${p3.x.toFixed(1)} ${p3.y.toFixed(1)}" stroke="${color}" stroke-width="1.8" fill="none"/>`;
}

/** 점(작은 원). */
export function dot(x: number, y: number, color: string = GEO.pt, r = 4): string {
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${color}"/>`;
}

/** 점 이름 라벨(A, B, O ...). dx·dy로 점에서 살짝 밀어 배치. */
export function ptLabel(x: number, y: number, name: string, dx = 0, dy = -9, color: string = GEO.ink): string {
  return `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${color}">${name}</text>`;
}

/** (cx, cy)를 지나고 수학 각도 aDeg 방향인 직선의 두 끝점(길이 2·half). */
export function lineThrough(
  cx: number,
  cy: number,
  aDeg: number,
  half: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const p = polar(cx, cy, half, aDeg);
  const q = polar(cx, cy, half, aDeg + 180);
  return { x1: q.x, y1: q.y, x2: p.x, y2: p.y };
}

/** 선 svg 문자열. */
export function lineSvg(
  x1: number, y1: number, x2: number, y2: number,
  color: string = GEO.ink, w = 2.6, dash = "",
): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ""} stroke-linecap="round"/>`;
}

/** 반직선/직선 끝 화살촉(진행 방향 aDeg). */
export function arrowHead(x: number, y: number, aDeg: number, color: string = GEO.ink, size = 7): string {
  const l = polar(x, y, size, aDeg + 152);
  const r = polar(x, y, size, aDeg - 152);
  return `<path d="M${l.x.toFixed(1)} ${l.y.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)} L${r.x.toFixed(1)} ${r.y.toFixed(1)}" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** 같은 길이 표시 틱(선분 중점에 수직 짧은 획, n개). */
export function tickMark(x1: number, y1: number, x2: number, y2: number, n = 1, color: string = GEO.ink): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const a = angleOf(x1, y1, x2, y2);
  let s = "";
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * 5;
    const c = polar(mx, my, off, a);
    const p = polar(c.x, c.y, 5.5, a + 90);
    const q = polar(c.x, c.y, 5.5, a - 90);
    s += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
  }
  return s;
}

/** 합성 이벤트 안전 포인터 캡처(lightKit 선례 — 실패해도 리스너가 죽지 않게). */
export function capturePointer(elm: Element, id: number): void {
  try {
    elm.setPointerCapture(id);
  } catch {
    /* 합성 이벤트의 pointerId는 캡처가 거부될 수 있다 */
  }
}

/** 도형 기호 HTML — 문자 위에 마크를 얹는 교과서 표기.
 *  line: 직선 AB(양방향 화살) · ray: 반직선 AB(오른쪽 화살) · seg: 선분 AB(윗줄) ·
 *  angle: ∠ABC · tri: △ABC. HTML 문자열(퀴즈 prompt·랩 라벨 공용, CSS는 math.css의 .gsym). */
export function gsym(letters: string, kind: "line" | "ray" | "seg" | "angle" | "tri"): string {
  if (kind === "angle") return `<span class="gsym">∠${letters}</span>`;
  if (kind === "tri") return `<span class="gsym">△${letters}</span>`;
  const mark = kind === "line" ? "↔" : kind === "ray" ? "→" : "―";
  return `<span class="gsym over"><span class="gsym-m">${mark}</span>${letters}</span>`;
}
