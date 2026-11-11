// bio6Web: 중1 Ⅱ v5 u2l10의 먹이 관계 그림과 규칙(2026-11-11). 랩의 무대(foodWebLab)와 문제 그림(bio6Figures)이 함께 쓴다.
// 관계는 원전 그림 그대로다. (가) 생물 4종류의 외길, (나) 생물 9종류의 먹이 관계 15갈래.
// 화살표는 먹히는 생물에서 먹는 생물 쪽을 가리킨다.

export type WebId = "rice" | "corn" | "cabbage" | "hopper" | "moth" | "frog" | "sparrow" | "snake" | "hawk";
export const WEB_NAME: Record<WebId, string> = {
  rice: "벼", corn: "옥수수", cabbage: "배추", hopper: "메뚜기", moth: "배추흰나비", frog: "개구리", sparrow: "참새", snake: "뱀", hawk: "매",
};
export interface Web {
  nodes: Partial<Record<WebId, [number, number]>>;
  /** [먹히는 생물, 먹는 생물, 휘는 정도(선의 왼쪽이 +)] */
  edges: [WebId, WebId, number?][];
}
export const FOOD_WEBS: Record<"A" | "B", Web> = {
  A: {
    nodes: { hawk: [46, 66], frog: [46, 112], hopper: [46, 158], rice: [46, 204] },
    edges: [["rice", "hopper"], ["hopper", "frog"], ["frog", "hawk"]],
  },
  B: {
    nodes: {
      hawk: [130, 62], snake: [302, 58], frog: [204, 104], sparrow: [304, 112],
      moth: [142, 146], hopper: [228, 154], cabbage: [150, 206], rice: [234, 206], corn: [310, 206],
    },
    edges: [
      ["cabbage", "moth"], ["cabbage", "hopper"], ["cabbage", "sparrow", -34], ["rice", "hopper"], ["rice", "sparrow", -10],
      ["corn", "hopper", 10], ["corn", "sparrow"], ["hopper", "frog"], ["hopper", "sparrow"], ["moth", "frog"],
      ["frog", "hawk"], ["frog", "snake"], ["sparrow", "snake"], ["sparrow", "hawk", 16], ["snake", "hawk", 14],
    ],
  },
};

/** 한 생물을 뺐을 때 잇달아 위험해지는 생물을 물결(차례)별로 돌려준다. */
export function cascade(web: Web, off: WebId): WebId[][] {
  const prey: Partial<Record<WebId, WebId[]>> = {};
  web.edges.forEach(([a, b]) => (prey[b] = [...(prey[b] ?? []), a]));
  const dead = new Set<WebId>([off]);
  const waves: WebId[][] = [];
  for (;;) {
    const next = (Object.keys(prey) as WebId[]).filter((n) => !dead.has(n) && (prey[n] ?? []).every((p) => dead.has(p)));
    if (!next.length) break;
    next.forEach((n) => dead.add(n));
    waves.push(next);
  }
  return waves;
}

const f1 = (v: number): string => v.toFixed(1);
const pillW = (id: WebId): number => WEB_NAME[id].length * 12.4 + 14;
const PILL_H = 22;

/** 중심에서 (dx, dy) 방향으로 알약 테두리까지의 거리(여유 포함). */
function reach(id: WebId, dx: number, dy: number, pad: number): number {
  const hw = pillW(id) / 2 + pad;
  const hh = PILL_H / 2 + pad;
  const len = Math.hypot(dx, dy) || 1;
  const ux = Math.abs(dx / len);
  const uy = Math.abs(dy / len);
  return Math.min(ux > 1e-6 ? hw / ux : Infinity, uy > 1e-6 ? hh / uy : Infinity);
}

/** 먹이 관계 그림 한 장(랩의 무대와 문제 그림이 함께 쓴다). ox, oy는 그림을 놓을 자리. */
export function webGroup(key: "A" | "B", ox = 0, oy = 0): string {
  const web = FOOD_WEBS[key];
  const edges = web.edges
    .map(([a, b, bend = 0]) => {
      const A = web.nodes[a] as [number, number];
      const B = web.nodes[b] as [number, number];
      const dx = B[0] - A[0];
      const dy = B[1] - A[1];
      const len = Math.hypot(dx, dy);
      // 휘는 선: 중점에서 수직으로 bend만큼 밀어 낸 점을 조절점으로 쓴다
      const cx = (A[0] + B[0]) / 2 + (-dy / len) * bend;
      const cy = (A[1] + B[1]) / 2 + (dx / len) * bend;
      const ra = reach(a, cx - A[0], cy - A[1], 2);
      const rb = reach(b, cx - B[0], cy - B[1], 3.5);
      const la = Math.hypot(cx - A[0], cy - A[1]) || 1;
      const lb = Math.hypot(cx - B[0], cy - B[1]) || 1;
      const x1 = A[0] + ((cx - A[0]) / la) * ra;
      const y1 = A[1] + ((cy - A[1]) / la) * ra;
      const x2 = B[0] + ((cx - B[0]) / lb) * rb;
      const y2 = B[1] + ((cy - B[1]) / lb) * rb;
      // 화살촉: 끝점에서 조절점 쪽으로 6.5만큼 물러난 두 갈래
      const ux = (x2 - cx) / (Math.hypot(x2 - cx, y2 - cy) || 1);
      const uy = (y2 - cy) / (Math.hypot(x2 - cx, y2 - cy) || 1);
      const head = [0.5, -0.5].map((t) => `M${f1(x2)} ${f1(y2)}l${f1((-ux * Math.cos(t) + uy * Math.sin(t)) * 6.5)} ${f1((-uy * Math.cos(t) - ux * Math.sin(t)) * 6.5)}`).join("");
      return `<g class="fwb-edge" data-a="${a}" data-b="${b}"><path d="M${f1(x1)} ${f1(y1)}Q${f1(cx)} ${f1(cy)} ${f1(x2)} ${f1(y2)}"/><path d="${head}"/></g>`;
    })
    .join("");
  const nodes = (Object.keys(web.nodes) as WebId[])
    .map((id) => {
      const [x, y] = web.nodes[id] as [number, number];
      const w = pillW(id);
      return `<g class="fwb-node" data-n="${id}"><rect x="${f1(x - w / 2)}" y="${y - PILL_H / 2}" width="${f1(w)}" height="${PILL_H}" rx="11"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="12.5" font-weight="800">${WEB_NAME[id]}</text></g>`;
    })
    .join("");
  return `<g class="fwb-web" data-w="${key}" transform="translate(${ox} ${oy})">${edges}${nodes}</g>`;
}
