// [중2 Ⅵ v5] 소화기관 랩(g2u6EnzymeLab)의 몸 그림. 무대 346×230의 왼쪽 0~108 칸에 그린다.
//
// 앞에서 본 모습이다. 그래서 화면 왼쪽이 몸의 오른쪽이다(책의 그림 Ⅵ-3과 같다).
//   간: 몸의 오른쪽(화면 왼쪽) 윗배, 쓸개는 간 아래. 위: 몸의 왼쪽(화면 오른쪽) 윗배.
//   이자: 위 아래에 가로로 눕고, 머리는 샘창자(작은창자의 첫 부분)가 C자로 감싼다.
//   큰창자: 화면 왼쪽 아래에서 올라가(오름) 위를 가로질러(가로) 화면 오른쪽으로 내려간다(내림). 작은창자는 그 안에 똬리를 튼다.
//   쓸개즙관과 이자관은 샘창자의 한 점(PAPILLA)에서 만난다. 음식물은 간, 쓸개, 이자를 지나지 않는다.
// 줄(y)은 오른쪽 영양소 칸의 줄과 맞춘다: 입 32, 위 78, 쓸개즙 118, 이자액 140(digestLabs.ts의 ROW).
// 색은 어두운 무대용 도해 색이다(손그림 아님). 좌표는 전부 손으로 정한 상수이고, 바꾸면 qa 캡처로 다시 본다.

export type Pt = [number, number];
export type Organ = "mouth" | "gland" | "eso" | "stomach" | "liver" | "gall" | "pancreas" | "small" | "large";

const C = {
  skin: "rgba(200,225,255,.07)",
  skinLine: "#3B5273",
  tract: "#E58F97",
  tractLine: "#A9505C",
  small: "#EBA4A9",
  large: "#D9727C",
  largeLine: "#9E3F4A",
  liver: "#A34C45",
  liverLine: "#6E2C28",
  gall: "#79B84C",
  gallLine: "#41702A",
  panc: "#E8BE5C",
  pancLine: "#9C7529",
  gland: "#E9B49E",
  glandLine: "#A5705C",
  glow: "#FFE3A3",
};

/** 샘창자에서 쓸개즙관과 이자관이 만나는 점. 소화액 방울이 여기로 들어간다. */
export const PAPILLA: Pt = [40, 106];

/** 음식물 덩어리가 지나는 길. 멈추는 곳마다 끊는다. */
export const ROUTE: Record<string, Pt[]> = {
  toStomach: [[54, 31], [54, 40], [55, 50], [57, 60], [61, 70], [63, 83]],
  toDuo: [[63, 83], [56, 89], [47, 92], [40, 99], [41, 108], [48, 112]],
  coil: [[48, 112], [62, 113], [76, 122], [72, 130], [36, 131], [36, 140], [76, 141], [76, 150], [36, 151], [36, 160], [76, 161], [76, 170], [30, 171], [21, 170]],
  toRectum: [[21, 170], [19, 150], [19, 124], [30, 116], [56, 120], [82, 116], [93, 124], [93, 150], [93, 166], [80, 182], [62, 186], [55, 196], [55, 212]],
};

/** 길 위의 t(0~1) 자리. 마디 길이에 비례해 나눈다. */
export function along(path: Pt[], t: number): Pt {
  const seg = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const u = seg[i] ? Math.min(1, d / seg[i]) : 0;
      return [path[i][0] + (path[i + 1][0] - path[i][0]) * u, path[i][1] + (path[i + 1][1] - path[i][1]) * u];
    }
    d -= seg[i];
  }
  return path[path.length - 1];
}

// ── 기관의 모양(좌표 상수) ─────────────────────────────────────────
const BODY =
  "M47 40 L47 48 C36 50, 16 52, 9 60 C4 66, 5 92, 8 118 C10 136, 11 150, 9 168 C7 186, 4 206, 3 232 L105 232 C104 206, 101 186, 99 168 C97 150, 98 136, 100 118 C103 92, 104 66, 99 60 C92 52, 72 50, 61 48 L61 40 Z";
const STOMACH = "M57 64 C55 56, 66 51, 76 53 C87 56, 93 66, 91 78 C89 90, 79 98, 65 98 C58 98, 52 96, 47 93 L48 87 C54 89, 60 89, 64 85 C68 80, 68 72, 63 68 C61 66, 59 65, 57 64 Z";
const LIVER = "M10 66 C18 58, 44 54, 66 58 C69 62, 65 66, 58 68 C46 74, 35 86, 25 96 C17 99, 11 93, 9 83 C8 76, 9 70, 10 66 Z";
const DUO = "M48 91 C42 92, 38 98, 38 104 C38 110, 43 114, 50 114 C55 114, 59 112, 62 110";
const PANC = "M42 105 C50 108, 62 106, 72 103 C78 101, 83 99, 87 99";
const COIL =
  "M62 111 C70 114, 80 120, 78 126 C76 131, 66 128, 56 130 C46 132, 38 128, 34 131 C29 135, 31 140, 37 140 C48 139, 60 143, 72 140 C80 138, 82 146, 76 150 C68 153, 50 148, 38 151 C30 153, 30 160, 37 160 C50 159, 62 163, 74 160 C82 158, 83 167, 76 170 C66 173, 46 168, 34 171 C28 172, 24 171, 21 169";
const COLON = "M20 172 L19 124 C19 117, 25 114, 33 116 C47 120, 66 121, 82 116 C89 114, 93 117, 93 124 L93 166 C93 178, 84 182, 72 184 C63 186, 56 189, 55 197 L55 213";
const ESO = "M54 37 C54 47, 55 55, 58 64";

/** 기관마다 이름표 자리(가운데). 화면 왼쪽이 몸의 오른쪽인 것에 맞춰 놓았다. */
const LABEL: Record<Organ, { x: number; y: number; t: string }> = {
  mouth: { x: 27, y: 33, t: "입" },
  gland: { x: 21, y: 48, t: "침샘" },
  eso: { x: 38, y: 58, t: "식도" },
  stomach: { x: 98, y: 61, t: "위" },
  liver: { x: 22, y: 80, t: "간" },
  gall: { x: 14, y: 106, t: "쓸개" },
  pancreas: { x: 98, y: 101, t: "이자" },
  small: { x: 50, y: 164, t: "작은창자" },
  large: { x: 26, y: 196, t: "큰창자" },
};

export interface BodyOpts {
  /** 빛을 두르는 기관(지금 음식물이 있는 곳, 소화액을 내는 곳). */
  focus?: Organ[];
  /** 이름표를 붙일 기관. */
  labels?: Organ[];
  /** 음식물 덩어리의 자리(없으면 그리지 않는다). size는 반지름. */
  bolus?: { at: Pt; r?: number } | null;
  /** 소화액 방울(관을 따라 흐르는 중). */
  drops?: { at: Pt; color: string }[];
  /** 큰창자에서 빠져나가는 물방울의 진행(0~1, 없으면 그리지 않는다). */
  water?: number;
}

const halo = (d: string, w: number): string => `<path d="${d}" fill="none" stroke="${C.glow}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>`;
const tube = (d: string, w: number, fill: string, line: string): string =>
  `<path d="${d}" fill="none" stroke="${line}" stroke-width="${w + 2.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** 이름표: 흰 글자에 무대 바탕색 테두리(할로). 12.5px. */
export function organTag(x: number, y: number, t: string, color = "#FFFFFF"): string {
  return `<text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${color}" stroke="#0B1524" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke">${t}</text>`;
}

/** 몸 그림 한 장(SVG 조각). */
export function bodyFig(o: BodyOpts = {}): string {
  const on = new Set(o.focus ?? []);
  let s = "";
  s += `<defs>
    <radialGradient id="g6o-st" cx="38%" cy="30%" r="78%"><stop offset="0" stop-color="#F8C6CA"/><stop offset=".55" stop-color="${C.tract}"/><stop offset="1" stop-color="#C46A75"/></radialGradient>
    <radialGradient id="g6o-lv" cx="30%" cy="28%" r="85%"><stop offset="0" stop-color="#CB7068"/><stop offset=".55" stop-color="${C.liver}"/><stop offset="1" stop-color="#7A332E"/></radialGradient>
    <linearGradient id="g6o-gb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A6D877"/><stop offset=".5" stop-color="${C.gall}"/><stop offset="1" stop-color="#4E8A31"/></linearGradient>
  </defs>`;
  // 몸의 윤곽과 머리(앞모습)
  s += `<path d="${BODY}" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="1.4"/>`;
  s += `<ellipse cx="54" cy="21" rx="16" ry="20" fill="${C.skin}" stroke="${C.skinLine}" stroke-width="1.4"/>`;
  s += `<path d="M42 7 C46 1, 62 1, 66 7" fill="none" stroke="${C.skinLine}" stroke-width="1.2" opacity=".7"/>`;
  // 침샘(턱 아래 양쪽)과 침샘관
  const gland = (x: number): string =>
    `<path d="M${x - 3.6} 40 c0 -2.8, 2.8 -4.2, 5 -2.8 c2.2 -1.4, 5 .7, 3.6 3.6 c1.4 2.2, -.7 5, -3.6 4.2 c-2.2 1.4, -5 0, -5 -2.2 Z" fill="${C.gland}" stroke="${C.glandLine}" stroke-width=".9"/>`;
  if (on.has("gland")) s += `<circle cx="43" cy="40.5" r="6.5" fill="${C.glow}" opacity=".3"/><circle cx="65" cy="40.5" r="6.5" fill="${C.glow}" opacity=".3"/>`;
  s += `<path d="M44.5 38 L49 33 M63.5 38 L59 33" stroke="${C.glandLine}" stroke-width="1"/>`;
  s += gland(43) + gland(65);
  // 입(벌린 입과 혀)
  if (on.has("mouth")) s += `<ellipse cx="54" cy="31" rx="10" ry="6.5" fill="${C.glow}" opacity=".35"/>`;
  s += `<path d="M47 30 C50 28, 58 28, 61 30 C59 35, 49 35, 47 30 Z" fill="#6B1F2A" stroke="#C9737E" stroke-width="1.2"/><path d="M50 32.6 C52 31.2, 56 31.2, 58 32.6 C56 34, 52 34, 50 32.6 Z" fill="#E07A86"/>`;
  // 식도
  if (on.has("eso")) s += halo(ESO, 9);
  s += tube(ESO, 4.6, C.tract, C.tractLine);
  // 작은창자(큰창자보다 뒤에 있어 먼저 그린다)
  if (on.has("small")) s += halo(COIL, 11);
  s += tube(COIL, 6.4, C.small, "#B45C68");
  s += `<path d="${COIL}" fill="none" stroke="#F7CACD" stroke-width="1.4" stroke-linecap="round" opacity=".55" transform="translate(-0.6 -1.2)"/>`;
  // 샘창자(C자)
  s += tube(DUO, 5.4, C.small, "#B45C68");
  // 이자(누운 잎 모양, 오돌토돌한 겉)
  if (on.has("pancreas")) s += halo(PANC, 14);
  s += `<path d="${PANC}" fill="none" stroke="${C.pancLine}" stroke-width="10.4" stroke-linecap="round"/><path d="${PANC}" fill="none" stroke="${C.panc}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<path d="${PANC}" fill="none" stroke="#F6DA92" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="2.4 3.2" opacity=".8"/>`;
  s += `<path d="M86 99.5 C76 101.5, 60 106, 41 106" fill="none" stroke="#B88A2E" stroke-width="1.1" opacity=".9"/>`;
  // 간
  if (on.has("liver")) s += halo(LIVER, 6);
  s += `<path d="${LIVER}" fill="url(#g6o-lv)" stroke="${C.liverLine}" stroke-width="1.5"/>`;
  s += `<path d="M44 58 C41 68, 38 77, 33 86" fill="none" stroke="${C.liverLine}" stroke-width="1.1" opacity=".8"/>`;
  // 쓸개와 쓸개즙관(간 → 쓸개 → 샘창자)
  if (on.has("gall")) s += `<circle cx="31" cy="96" r="9" fill="${C.glow}" opacity=".3"/>`;
  s += `<path d="M36 88 C35 92, 34 96, 35 99 C36 102, 38 104, ${PAPILLA[0]} ${PAPILLA[1]}" fill="none" stroke="#9BD15F" stroke-width="1.6"/>`;
  s += `<ellipse cx="30.5" cy="95.5" rx="4.2" ry="6.6" transform="rotate(-28 30.5 95.5)" fill="url(#g6o-gb)" stroke="${C.gallLine}" stroke-width="1.1"/>`;
  // 위(주름 세 줄)
  if (on.has("stomach")) s += halo(STOMACH, 6);
  s += `<path d="${STOMACH}" fill="url(#g6o-st)" stroke="${C.tractLine}" stroke-width="1.5"/>`;
  s += `<path d="M67 60 C76 63, 82 70, 83 80 M64 74 C70 78, 76 84, 74 92 M60 92 C66 92, 72 90, 78 86" fill="none" stroke="#C86E78" stroke-width="1" opacity=".75"/>`;
  // 큰창자(주머니 마디)와 막창자꼬리, 곧창자, 항문
  if (on.has("large")) s += halo(COLON, 15);
  s += `<path d="M20 172 C20 178, 22 183, 26 187" fill="none" stroke="${C.largeLine}" stroke-width="3.4" stroke-linecap="round"/><path d="M20 172 C20 178, 22 183, 26 187" fill="none" stroke="${C.large}" stroke-width="1.8" stroke-linecap="round"/>`;
  s += tube(COLON, 8.6, C.large, C.largeLine);
  s += `<path d="${COLON}" fill="none" stroke="${C.largeLine}" stroke-width="8.6" stroke-dasharray="1.3 5.2" opacity=".9"/>`;
  s += `<path d="M51 216 C53 218, 57 218, 59 216" fill="none" stroke="${C.largeLine}" stroke-width="1.6" stroke-linecap="round"/>`;
  // 큰창자의 물(빠져나가는 물방울)
  if (o.water !== undefined && o.water >= 0) {
    const w = o.water;
    const spots: Pt[] = [[93, 140], [93, 156], [19, 150], [56, 120]];
    spots.forEach(([x, y], i) => {
      const dx = x < 40 ? -1 : x > 70 ? 1 : 0;
      const dy = dx === 0 ? -1 : 0;
      const k = Math.min(1, Math.max(0, w * 1.3 - i * 0.1));
      s += `<circle cx="${(x + (dx * 9 + 0) * k).toFixed(1)}" cy="${(y + dy * 9 * k).toFixed(1)}" r="2.4" fill="#5AB0F2" stroke="#0B1524" stroke-width=".8" opacity="${(1 - k * 0.6).toFixed(2)}"/>`;
    });
  }
  // 소화액 방울
  (o.drops ?? []).forEach((d) => (s += `<circle cx="${d.at[0].toFixed(1)}" cy="${d.at[1].toFixed(1)}" r="2.6" fill="${d.color}" stroke="#0B1524" stroke-width=".9"/>`));
  // 음식물 덩어리(세 영양소가 섞인 알)
  if (o.bolus) {
    const [x, y] = o.bolus.at;
    const r = o.bolus.r ?? 5;
    s += `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r + 2.2}" fill="${C.glow}" opacity=".35"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#C79A62" stroke="#5A3A16" stroke-width="1.2"/>`;
    if (r >= 4) s += `<circle cx="${(x - 1.6).toFixed(1)}" cy="${(y - 1.4).toFixed(1)}" r="1.3" fill="#8E8EF5"/><circle cx="${(x + 1.8).toFixed(1)}" cy="${(y - 0.6).toFixed(1)}" r="1.3" fill="#F08C5A"/><circle cx="${(x - 0.2).toFixed(1)}" cy="${(y + 1.9).toFixed(1)}" r="1.3" fill="#F2D15C"/>`;
    s += `</g>`;
  }
  // 이름표
  (o.labels ?? []).forEach((k) => (s += organTag(LABEL[k].x, LABEL[k].y, LABEL[k].t)));
  return s;
}
