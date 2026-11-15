// 중2 Ⅴ v5의 문제 그림(밝은 카드 위의 SVG). 랩의 무대와 같은 장면을 문제에서 다시 묻는 데 쓴다. 좌표는 계산으로 놓는다.
// 그림의 aria에는 답을 적지 않는다.
// 잎, 줄기, 뿌리, 페트리 접시와 잎 조각은 랩 무대(steps/g2u5v5/art.ts, iodineLabs.ts)의 그리는 법을 밝은 카드 색으로 옮겼다
// (이 파일은 내용 파일이 부르므로 랩 모듈을 불러오지 않고 필요한 계산만 따로 둔다).

const svg = (h: number, body: string, aria: string): string =>
  `<svg viewBox="0 0 340 ${h}" role="img" aria-label="${aria}" style="display:block;width:100%;height:auto;font-family:inherit"><rect x="1" y="1" width="338" height="${h - 2}" rx="14" fill="#FFFFFF" stroke="#E1EBE4" stroke-width="2"/>${body}</svg>`;
const t = (x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: string; weight?: number; halo?: string } = {}): string =>
  `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? "middle"}" font-size="${o.size ?? 13}" font-weight="${o.weight ?? 700}" fill="${o.fill ?? "#333D4B"}"${o.halo ? ` stroke="${o.halo}" stroke-width="3.6" stroke-linejoin="round" paint-order="stroke"` : ""}>${s}</text>`;

type Pt = [number, number];
const f1 = (v: number): string => (Math.round(v * 10) / 10).toString();
const pt = (p: Pt): string => `${f1(p[0])} ${f1(p[1])}`;
// 이 파일의 그림은 그라데이션, 자르기 같은 id 참조를 쓰지 않는다(평면 색). 내용 파일이 그림 글을 한 번만 만들어 두고
// 문제와 오답노트가 같은 글을 다시 싣기 때문에, id가 있으면 화면에 두 벌이 생겨 숨은 쪽을 잡고 색이 빠질 수 있다.
/** 씨앗이 같으면 같은 수열(그릴 때마다 모양이 바뀌지 않게). 랩 무대 art.ts의 rng와 같다. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
/** 점들을 지나는 매끈한 곡선(캣멀롬을 3차 베지어로). art.ts의 smooth와 같다. */
function smooth(pts: Pt[], closed = false, tension = 1): string {
  const n = pts.length;
  const at = (i: number): Pt => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pt(pts[0])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const k = tension / 6;
    d += ` C${pt([p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k])} ${pt([p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k])} ${pt(p2)}`;
  }
  return closed ? d + " Z" : d;
}

/** 전등을 켠 측정과 끈 측정의 농도 그래프. 이산화 탄소: (가) 조금 오름, (나) 내려감. 산소: (다) 오름, (라) 조금 내려감.
 *  네 선의 색과 굵기를 모두 다르게 두어, 선의 생김새로 같은 측정끼리 짝지을 수 없게 한다.
 *  이름표는 선 끝 위(오르는 선)나 아래(내려가는 선)에 두되, 아래에 두면 가로축에 걸리는 선((나))은 선 끝 위로 올린다.
 *  이름표에는 칸 바탕색 테두리(할로)를 둘러 선과 축 위에서도 읽히게 한다. */
export function gasLinesFig(): string {
  const panel = (x: number, title: string, a: [string, number, string], b: [string, number, string]): string => {
    const y0 = 34;
    const h = 96;
    const axisY = y0 + h - 10;
    const py = (v: number): number => y0 + h - 10 - (h - 24) * v;
    const line = (end: number, col: string, dash: boolean): string =>
      `<polyline points="${Array.from({ length: 11 }, (_, i) => `${x + 16 + i * 11.6},${py(0.5 + (end - 0.5) * (1 - Math.pow(1 - i / 10, 1.6))).toFixed(1)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"${dash ? ' stroke-dasharray="6 5"' : ""}/>`;
    const tag = ([name, end, col]: [string, number, string]): string => {
      const yEnd = py(end);
      let y = end > 0.5 ? yEnd - 7 : yEnd + 16;
      if (y > axisY - 5) y = yEnd - 9; // 아래에 두면 가로축 선이 글자를 지난다
      return t(x + 138, +y.toFixed(1), name, { size: 13, anchor: "end", fill: col, weight: 800, halo: "#F6FAF7" });
    };
    return `<rect x="${x}" y="${y0}" width="150" height="${h}" rx="10" fill="#F6FAF7" stroke="#DCE7DF"/>${t(x + 75, 24, title, { size: 13, weight: 800 })}
      <line x1="${x + 16}" y1="${y0 + 10}" x2="${x + 16}" y2="${axisY}" stroke="#A9B6A9" stroke-width="2"/><line x1="${x + 16}" y1="${axisY}" x2="${x + 140}" y2="${axisY}" stroke="#A9B6A9" stroke-width="2"/>
      ${line(a[1], a[2], false)}${line(b[1], b[2], false)}
      ${tag(a)}${tag(b)}
      ${t(x + 78, y0 + h + 16, "시간(분)", { size: 12, fill: "#8B95A1" })}`;
  };
  return svg(156, panel(14, "이산화 탄소 농도", ["(가)", 0.64, "#5F4BE8"], ["(나)", 0.16, "#C46A00"]) + panel(176, "산소 농도", ["(다)", 0.86, "#0B7285"], ["(라)", 0.38, "#C2255C"]), "시간에 따른 이산화 탄소 농도 그래프의 두 선 (가), (나)와 산소 농도 그래프의 두 선 (다), (라)");
}

/** 켠 전등의 수에 따라 5분 동안 늘어난 산소의 양(막대 넷). */
export function lampBarsFig(): string {
  const vals = [2, 4, 5, 5];
  let body = t(170, 24, "5분 동안 늘어난 산소의 양", { weight: 800 });
  body += `<line x1="52" y1="36" x2="52" y2="136" stroke="#A9B6A9" stroke-width="2"/><line x1="52" y1="136" x2="310" y2="136" stroke="#A9B6A9" stroke-width="2"/>`;
  vals.forEach((v, i) => {
    const x = 84 + i * 60;
    body += `<rect x="${x - 17}" y="${136 - v * 18}" width="34" height="${v * 18}" rx="5" fill="#4DABF7" stroke="#1C7ED6" stroke-width="1.5"/>${t(x, 154, `${i + 1}개`, { size: 13 })}`;
  });
  body += t(170, 174, "켠 전등의 수", { size: 12, fill: "#8B95A1" });
  return svg(184, body, "켠 전등의 수가 1개에서 4개일 때 늘어난 산소의 양을 나타낸 막대 그래프");
}

/** 아이오딘 용액을 떨어뜨린 잎 조각 둘. 랩(iodineLabs.ts)의 페트리 접시와 잎 조각(약 1 cm로 자른 잎, 잎맥이 지난다, 접시에 놓여 비스듬히 보임)을
 *  밝은 카드 색으로 옮겼다. (가)는 조각 전체가 청람색(#2B2F8A, 랩과 같은 색), (나)는 탈색된 연노랑 조각 위에 갈색 용액 방울만 남았다. */
export function leafPiecesFig(): string {
  const IODINE = "#C58A2E";
  /** 비스듬히 본 유리 접시. (cx, cy)는 바닥 가운데. back은 조각보다 먼저, front는 나중에 그린다. */
  const petri = (cx: number, cy: number, rx: number, ry: number): { back: string; front: string } => ({
    back:
      `<ellipse cx="${cx}" cy="${cy + 5}" rx="${rx + 2}" ry="${ry + 2}" fill="#2A3A5E" opacity=".08"/>` +
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#EFF5FB" stroke="#9DB2CA" stroke-width="1.5"/>` +
      `<ellipse cx="${cx}" cy="${cy + 1.5}" rx="${rx - 6}" ry="${ry - 4}" fill="#E5EDF6"/>`,
    front:
      `<path d="M${cx - rx} ${cy} L${cx - rx} ${cy - 6} M${cx + rx} ${cy} L${cx + rx} ${cy - 6}" stroke="#A9BBD0" stroke-width="1.2"/>` +
      `<path d="M${cx - rx} ${cy - 6} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy - 6}" fill="none" stroke="#B9CADD" stroke-width="1.5"/>` +
      `<path d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}" fill="none" stroke="#9DB2CA" stroke-width="1.3"/>` +
      `<path d="M${f1(cx - rx * 0.7)} ${f1(cy + ry * 0.55 - 6)} A${rx} ${ry} 0 0 0 ${f1(cx - rx * 0.12)} ${f1(cy + ry * 0.98 - 6)}" stroke="#FFFFFF" stroke-width="2" fill="none" opacity=".9"/>`,
  });
  /** 잎 조각(랩의 leafPiece와 같은 모양: 가장자리가 조금 들쭉날쭉한 네모, 비스듬한 굵은 맥과 곁맥). */
  const piece = (cx: number, cy: number, blue: boolean, seed: number): string => {
    const r = rng(seed);
    const w = 58;
    const h = 50;
    const k = 0.6;
    const pts: Pt[] = [];
    const corners: Pt[] = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
    corners.forEach((c, i) => {
      const d = corners[(i + 1) % 4];
      for (let j = 0; j < 4; j++) {
        const u = j / 4;
        pts.push([c[0] + (d[0] - c[0]) * u + (r() - 0.5) * 2, (c[1] + (d[1] - c[1]) * u + (r() - 0.5) * 2) * k]);
      }
    });
    const c = blue ? { fill: "#2B2F8A", edge: "#14164A", vein: "#4A50B8" } : { fill: "#F1EDCB", edge: "#B5AE7A", vein: "#FFFFFF" };
    let s = `<path d="${smooth(pts, true, 0.35)}" fill="${c.fill}" stroke="${c.edge}" stroke-width="1.2"/>`;
    if (blue) s += `<ellipse cx="-9" cy="-4" rx="16" ry="7" fill="#3E44B0" opacity=".45"/>`;
    s += `<path d="M${-w / 2 + 3} ${f1(h * 0.2 * k)} L${w / 2 - 3} ${f1(-h * 0.24 * k)}" stroke="${c.vein}" stroke-width="2.4" opacity=".75"/>`;
    for (let i = 0; i < 4; i++) {
      const u = -0.36 + i * 0.24;
      const x = u * w;
      const y = -u * h * 0.44 * k;
      s += `<path d="M${f1(x)} ${f1(y)} l-8 ${f1(-13 * k)} M${f1(x)} ${f1(y)} l9 ${f1(12 * k)}" stroke="${c.vein}" stroke-width="1" opacity=".6"/>`;
    }
    if (blue) for (let i = 0; i < 9; i++) s += `<circle cx="${f1((r() - 0.5) * w * 0.8)}" cy="${f1((r() - 0.5) * h * 0.7 * k)}" r="${f1(1.4 + r() * 2.2)}" fill="#0E1040" opacity=".5"/>`;
    else
      // 녹말이 없어 색이 변하지 않은 자리: 갈색 용액 방울이 그대로 남고 둘레에 옅게 번진다
      s +=
        `<ellipse cx="2" cy="1" rx="17" ry="9.5" fill="#E3C27A" opacity=".55"/>` +
        `<ellipse cx="2" cy="2.2" rx="10.5" ry="6.2" fill="#2A3A5E" opacity=".16"/>` +
        `<ellipse cx="2" cy="1" rx="10" ry="6" fill="${IODINE}" stroke="#7A4E0E" stroke-width=".8"/>` +
        `<ellipse cx="-1.2" cy="-1.4" rx="3" ry="1.6" fill="#FFF3D6" opacity=".75"/>`;
    return `<g transform="translate(${cx} ${cy})">${s}</g>`;
  };
  // 비스듬히 본 접시는 납작해서 위가 비기 쉽다. 그림 높이를 110으로 줄여 빈 띠를 없앴다(예전 142).
  const d1 = petri(92, 46, 68, 22);
  const d2 = petri(248, 46, 68, 22);
  const body =
    d1.back + d2.back + piece(92, 42, true, 3) + piece(248, 42, false, 8) + d1.front + d2.front + t(92, 96, "(가)", { weight: 800 }) + t(248, 96, "(나)", { weight: 800 });
  return svg(110, body, "아이오딘 용액을 떨어뜨린 뒤 페트리 접시에 놓인 잎 조각 (가)와 (나)");
}

/** 광합성과 호흡을 잇는 그림. 위 화살표의 물질 칸은 ㉠, 아래 화살표의 물질 칸은 ㉡으로 가린다. */
export function cycleBlankFig(): string {
  const box = (x: number, name: string, sub: string, fill: string): string => `<rect x="${x}" y="62" width="108" height="56" rx="12" fill="${fill}"/>${t(x + 54, 86, name, { size: 15, fill: "#fff", weight: 800 })}${t(x + 54, 106, sub, { size: 12, fill: "#fff" })}`;
  const pill = (x: number, y: number, s: string): string => `<rect x="${x - 38}" y="${y - 14}" width="76" height="28" rx="14" fill="#fff" stroke="#8B95A1" stroke-width="2"/>${t(x, y + 5, s, { weight: 800 })}`;
  const body = `
    ${box(20, "광합성", "엽록체", "#2F9450")}${box(212, "호흡", "마이토콘드리아", "#B5683A")}
    <path d="M92 62 L92 30 L248 30 L248 52" fill="none" stroke="#2F9450" stroke-width="3"/><polygon points="248,62 241,49 255,49" fill="#2F9450"/>
    <path d="M248 118 L248 150 L92 150 L92 128" fill="none" stroke="#B5683A" stroke-width="3"/><polygon points="92,118 85,131 99,131" fill="#B5683A"/>
    ${pill(170, 30, "㉠")}${pill(170, 150, "㉡")}`;
  return svg(180, body, "광합성에서 호흡으로 가는 화살표의 빈칸 ㉠과 호흡에서 광합성으로 가는 화살표의 빈칸 ㉡");
}

/** 쌍떡잎식물의 잎(랩 art.ts의 leafBlade와 같은 모양: 톱니 가장자리, 깃 모양 그물맥). (x, y) 잎자루 밑동, ang 방향(도, 0이면 오른쪽). */
function leafBlade(x: number, y: number, ang: number, len: number, wid: number, o: { pet?: number; teeth?: number; seed?: number } = {}): string {
  const pet = o.pet ?? len * 0.18;
  const teeth = o.teeth ?? Math.max(8, Math.round(len / 7));
  const r = rng(o.seed ?? 3);
  const hw = (u: number): number => wid * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.82)), 0.85) * (1 - 0.08 * u);
  const n = teeth * 4;
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const tooth = u > 0.12 && u < 0.97 ? (i % 4 === 1 ? 1 : i % 4 === 2 ? 0.35 : 0) * Math.min(2.2, wid * 0.11) : 0;
    top.push([pet + u * len, -(hw(u) + tooth)]);
    bot.push([pet + u * len, hw(u) + tooth]);
  }
  const d = "M" + [...top, ...bot.slice(1, n).reverse()].map(pt).join(" L") + " Z";
  // 빛 받는 위쪽 절반(왼쪽 위 빛): 위 가장자리와 가운데 맥 사이를 조금 밝게
  const lit = "M" + [...top, [pet + len, 0] as Pt, [pet, 0] as Pt].map(pt).join(" L") + " Z";
  let v = `<path d="M${f1(pet - 1)} -1.2 L${f1(pet + len * 0.96)} -.3 L${f1(pet + len * 0.96)} .3 L${f1(pet - 1)} 1.2 Z" fill="#DDF2CB" opacity=".9"/>`;
  const pairs = Math.max(4, Math.round(len / 13));
  for (let k = 1; k <= pairs; k++) {
    const u = 0.08 + (k / (pairs + 0.6)) * 0.84;
    const x0 = pet + u * len;
    [-1, 1].forEach((sgn) => {
      const uu = Math.min(0.98, u + 0.14);
      const ex = pet + uu * len;
      const ey = sgn * hw(uu) * 0.9;
      v += `<path d="M${f1(x0)} 0 Q${f1(x0 + len * 0.05)} ${f1(sgn * hw(u) * 0.55)} ${f1(ex)} ${f1(ey)}" stroke="#CDEBB6" stroke-width=".9" fill="none" opacity=".8"/>`;
      for (let j = 0; j < 2; j++) {
        const q = 0.3 + j * 0.3 + r() * 0.1;
        const px = x0 + (ex - x0) * q;
        const py = sgn * hw(u) * 0.55 * q * 1.2;
        v += `<path d="M${f1(px)} ${f1(py)} l${f1(len * 0.06)} ${f1(-sgn * wid * 0.12)}" stroke="#A9D894" stroke-width=".5" fill="none" opacity=".6"/>`;
      }
    });
  }
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})"><path d="M0 0 L${f1(pet + 2)} 0" stroke="#3E8A3A" stroke-width="2.6" stroke-linecap="round"/><path d="${d}" fill="#3E9E4C" stroke="#1B5A28" stroke-width="1.1" stroke-linejoin="round"/><path d="${lit}" fill="#6CC070" opacity=".28"/>${v}</g>`;
}

/** 뿌리 한 가닥(랩 art.ts의 rootStrand와 같은 모양: 끝으로 가늘어지고 끝 가까이에 뿌리털). pts는 위에서 아래로, w0는 밑동 굵기. */
function rootStrand(pts: Pt[], w0: number, o: { hairs?: number; seed?: number; hairLen?: number } = {}): string {
  const r = rng(o.seed ?? 11);
  const n = pts.length;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const w = (w0 / 2) * (1 - (i / (n - 1)) * 0.82);
    L.push([pts[i][0] + (-dy / len) * w, pts[i][1] + (dx / len) * w]);
    R.push([pts[i][0] - (-dy / len) * w, pts[i][1] - (dx / len) * w]);
  }
  let hairs = "";
  const hn = o.hairs ?? 0;
  const hl = o.hairLen ?? 5;
  for (let k = 0; k < hn; k++) {
    const fi = (0.55 + (k / Math.max(1, hn)) * 0.35) * (n - 1);
    const i = Math.floor(fi);
    const u = fi - i;
    const p0 = pts[i];
    const p1 = pts[Math.min(n - 1, i + 1)];
    const x = p0[0] + (p1[0] - p0[0]) * u;
    const y = p0[1] + (p1[1] - p0[1]) * u;
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const len = Math.hypot(dx, dy) || 1;
    const side = k % 2 ? 1 : -1;
    const nx = (-dy / len) * side;
    const ny = (dx / len) * side;
    const l = hl * (0.6 + r() * 0.6);
    hairs += `<path d="M${f1(x)} ${f1(y)} q${f1(nx * l * 0.5 + dx / len)} ${f1(ny * l * 0.5 + dy / len)} ${f1(nx * l)} ${f1(ny * l + 1)}" stroke="#A48A5C" stroke-width=".6" fill="none" opacity=".85"/>`;
  }
  return `${hairs}<path d="${smooth([...L, ...R.reverse()], true, 0.8)}" fill="#F2E6C8" stroke="#8E7448" stroke-width=".7"/>`;
}

/** 식물 한 포기의 줄기 속 두 관. 랩(routeLab.ts)처럼 굵은 줄기 왼쪽에 창을 내어 두 관을 보인다.
 *  쌍떡잎식물의 줄기라 잎이 붙은 바깥쪽에 (나)(체관), 줄기 가운데 쪽에 (가)(물관). 잎맥이 줄기로 들어와 두 관에 닿는다.
 *  (가)는 뿌리 쪽에서 위로만 올라가는 화살표, (나)는 잎이 붙은 마디에서 위와 아래로 가는 화살표.
 *  관 속에 물이나 설탕을 그리지 않고 두 관의 색도 같게 둔다(무엇이 흐르는지가 답이라, 화살표 방향만 남긴다). */
export function tubesFig(): string {
  const SX = 178; // 줄기 가운데
  const HW = 24; // 줄기 반폭
  const TOP = 34; // 줄기 꼭대기
  const GROUND = 150; // 땅
  const NODE = 98; // 잎이 붙은 마디
  const PHL = 166; // (나) 체관: 바깥쪽(잎 쪽)
  const XYL = 181; // (가) 물관: 안쪽(줄기 가운데 쪽)
  const TW = 12; // 관 폭
  const WX0 = SX - 20; // 창 왼쪽
  const WX1 = SX + 12; // 창 오른쪽
  const WY0 = 44;
  const WY1 = 146;
  const INK = "#3D4B5C";
  /** 화살표(같은 색, 관 속 가운데 줄). from에서 to로. */
  const arrow = (x: number, from: number, to: number): string => {
    const dir = Math.sign(to - from);
    const hy = to - dir * 10;
    return `<line x1="${x}" y1="${from}" x2="${x}" y2="${hy}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M${x} ${to} L${x - 5.5} ${hy} L${x + 5.5} ${hy} Z" fill="${INK}" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>`;
  };
  // 흙(카드의 둥근 아래 모서리 안쪽으로만)과 흙 알갱이
  const sr = rng(19);
  let soil = `<path d="M2 ${GROUND} H338 V175 A13 13 0 0 1 325 188 H15 A13 13 0 0 1 2 175 Z" fill="#EADCC6"/>`;
  for (let i = 0; i < 30; i++) {
    const x = 10 + sr() * 320;
    const y = GROUND + 6 + sr() * 30;
    const rr = 1 + sr() * 1.8;
    soil += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr)}" ry="${f1(rr * 0.7)}" fill="#D2BB98" opacity=".75"/>`;
  }
  soil += `<line x1="2" y1="${GROUND}" x2="338" y2="${GROUND}" stroke="#B8966C" stroke-width="1.6"/>`;
  // 뿌리: 원뿌리, 곁뿌리, 뿌리털
  const roots =
    rootStrand([[SX, GROUND - 2], [SX - 1, 162], [SX - 3, 175], [SX - 2, 186]], 11, { hairs: 14, seed: 3, hairLen: 4 }) +
    rootStrand([[SX - 3, 158], [SX - 18, 165], [SX - 34, 171], [SX - 50, 174]], 4, { hairs: 8, seed: 5, hairLen: 3.5 }) +
    rootStrand([[SX + 2, 161], [SX + 18, 168], [SX + 34, 175], [SX + 48, 179]], 4, { hairs: 8, seed: 7, hairLen: 3.5 }) +
    rootStrand([[SX - 2, 172], [SX - 13, 179], [SX - 25, 184]], 2.6, { hairs: 4, seed: 9, hairLen: 3 }) +
    rootStrand([[SX - 1, 177], [SX + 11, 182], [SX + 22, 185]], 2.6, { hairs: 4, seed: 13, hairLen: 3 });
  // 줄기: 둥근 기둥(음영)과 왼쪽의 창, 창 속 두 관(같은 색)
  let stem = `<path d="M${SX - HW} ${GROUND} C${SX - HW} 120, ${SX - HW + 1} 80, ${SX - HW + 2} ${TOP + 10} Q${SX - HW + 4} ${TOP - 1} ${SX} ${TOP - 3} Q${SX + HW - 4} ${TOP - 1} ${SX + HW - 2} ${TOP + 10} C${SX + HW - 1} 80, ${SX + HW} 120, ${SX + HW} ${GROUND} Z" fill="#4E9A43" stroke="#1F4F1F" stroke-width="1.1"/>`;
  // 둥근 기둥의 음영(왼쪽 위 빛): 오른쪽 가장자리를 어둡게, 왼쪽 가장자리를 밝게
  stem += `<path d="M${SX + HW - 8} ${TOP + 12} L${SX + HW - 1.2} ${TOP + 12} L${SX + HW - 0.6} ${GROUND - 0.6} L${SX + HW - 8} ${GROUND - 0.6} Z" fill="#2A5F2A" opacity=".45"/><path d="M${SX - HW + 1.2} ${TOP + 12} L${SX - 20} ${TOP + 12} L${SX - 20} ${GROUND - 0.6} L${SX - HW + 0.6} ${GROUND - 0.6} Z" fill="#7CC36A" opacity=".55"/>`;
  stem += `<rect x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" rx="4" fill="#F1F7EA" stroke="#2F6F2F" stroke-width="1"/>`;
  [PHL, XYL].forEach((cx) => (stem += `<rect x="${cx - TW / 2}" y="${WY0 + 2}" width="${TW}" height="${WY1 - WY0 - 4}" rx="3" fill="#FFFFFF" stroke="#7E9C7A" stroke-width="1.1"/>`));
  // 새순(꼭대기의 눈과 어린잎 둘)
  const shoot =
    leafBlade(SX - 1, TOP - 2, -128, 18, 6.5, { pet: 2, seed: 2, teeth: 6 }) +
    leafBlade(SX + 1, TOP - 2, -52, 18, 6.5, { pet: 2, seed: 4, teeth: 6 }) +
    `<ellipse cx="${SX}" cy="${TOP - 6}" rx="4.6" ry="7" fill="#86D68F" stroke="#2F6F2F" stroke-width=".9"/>`;
  // 잎(마디에서 왼쪽으로)과 줄기 안으로 들어와 두 관에 닿는 잎맥
  const leaf = leafBlade(SX - HW, NODE, 184, 100, 29, { pet: 10, seed: 6 }) + t(92, 106, "잎", { fill: "#FFFFFF", weight: 800, halo: "#2F7A3A" });
  const trace = `<path d="M${SX - HW - 1} ${NODE} L${XYL} ${NODE}" stroke="#5FA84E" stroke-width="2.6" stroke-linecap="round"/>`;
  // 화살표: (가) 물관은 아래에서 위로만, (나) 체관은 마디에서 위와 아래로
  const arrows = arrow(XYL, WY1 - 5, WY0 + 5) + arrow(PHL, NODE - 6, WY0 + 5) + arrow(PHL, NODE + 6, WY1 - 5);
  // 이름표: (나)는 바깥쪽(왼쪽 위), (가)는 안쪽에서 줄기 오른쪽 밖으로
  const call = (from: Pt, to: Pt): string =>
    `<path d="M${pt(from)} L${pt(to)}" stroke="#8B95A1" stroke-width="1.2" fill="none"/><circle cx="${f1(from[0])}" cy="${f1(from[1])}" r="2" fill="#8B95A1"/>`;
  const labels =
    call([PHL - TW / 2 - 1, 62], [138, 48]) + t(134, 52, "(나)", { weight: 800, anchor: "end" }) +
    call([XYL + TW / 2 + 1, 72], [222, 62]) + t(226, 66, "(가)", { weight: 800, anchor: "start" }) +
    t(236, 182, "뿌리", { size: 13, fill: "#6B7684", anchor: "start" });
  const body = soil + roots + stem + shoot + leaf + trace + arrows + labels + `<rect x="1" y="1" width="338" height="188" rx="14" fill="none" stroke="#E1EBE4" stroke-width="2"/>`;
  return `<svg viewBox="0 0 340 190" role="img" aria-label="잎, 줄기, 뿌리가 있는 식물의 줄기 속 두 관. 잎이 붙은 바깥쪽 관 (나)에는 잎이 붙은 마디에서 위와 아래로 가는 화살표, 안쪽 관 (가)에는 뿌리 쪽에서 위로만 가는 화살표가 있다" style="display:block;width:100%;height:auto;font-family:inherit"><rect x="1" y="1" width="338" height="188" rx="14" fill="#FFFFFF"/>${body}</svg>`;
}
