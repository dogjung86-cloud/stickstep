// g2u7l2f1 정전기 유도로 깡통이 끌려오는 까닭: (가) (−)전기를 띤 막대, (나) (+)전기를 띤 막대를 왼쪽에서 닿지 않게 가까이 했을 때.
// 깡통은 둥근 바닥 쪽에서 본 모습(랩과 같은 구도). 원자핵(+) 12개는 두 칸 모두 같은 자리에 그대로 있고, 전자 12개만 자리를 옮긴다.
// 전자 자리는 겹치지 않게 계산해 둔 표(ELEC)를 쓰고, (나)는 좌우를 뒤집는다. 검산 메모는 g2u7l2f1.md
import { COL, charge, fat } from "./_lib.mjs";

export const meta = {
  key: "g2u7l2f1",
  w: 340,
  h: 390,
  alt: "왼쪽에서 (−)전기를 띤 막대를 가까이 하면 깡통 속 전자가 먼 오른쪽으로 몰리고, (+)전기를 띤 막대를 가까이 하면 전자가 가까운 왼쪽으로 몰려요. 두 경우 모두 가까운 쪽이 받는 끌어당기는 힘이 먼 쪽이 받는 밀어내는 힘보다 커서 깡통이 막대 쪽으로 굴러가요.",
};

// 원자핵 12개(깡통 가운데 기준, px). 두 칸 모두 같다.
const NUC = [[-13, -13], [13, -13], [-13, 13], [13, 13], [-37, 0], [37, 0], [0, -37], [0, 37], [-27, -27], [27, -27], [-27, 27], [27, 27]];
// (−)막대일 때 전자 12개: 먼 쪽(오른쪽) 둘레 8개(반지름 43.5, ±14°, ±31°, ±59°, ±76°), 오른쪽 안 3개, 가운데 1개.
// 서로 11.9 px 이상, 원자핵과 11.3 px 이상 떨어진다(알갱이 반지름 5).
const ELEC = [[42.2, 10.5], [37.3, 22.4], [22.4, 37.3], [10.5, 42.2], [42.2, -10.5], [37.3, -22.4], [22.4, -37.3], [10.5, -42.2], [25, 0], [13, -30], [13, 30], [-6, 0]];

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(23);

  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  const R = 52; // 깡통 반지름
  const CX = 194;
  const rows = [
    { y0: 0, rod: -1, tag: "(가)" },
    { y0: 196, rod: 1, tag: "(나)" },
  ];
  const s = S.svgLayer(root, w, h);
  const info = [];
  const LGT = P.LIGHT;

  for (const row of rows) {
    const y0 = row.y0;
    const cy = y0 + 84;
    const deskY = cy + R;
    const tipX = CX - R - 22; // 막대 끝(깡통에서 22 px 떨어짐, 닿지 않음)
    const away = -row.rod; // 전자가 몰리는 쪽: (−)막대면 오른쪽(+1), (+)막대면 왼쪽(−1)

    // ── 책상(밝은 나무) ──
    ctx.save();
    ctx.fillStyle = P.lg(ctx, 0, deskY, 0, deskY + 11, [[0, "#EBD8B8"], [0.3, "#DCC29A"], [1, "#BB9A6C"]]);
    ctx.fillRect(0, deskY, w, 11);
    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.fillRect(0, deskY, w, 1.1);
    ctx.restore();
    P.shade(t, { x: 0, y: deskY, w, h: 11 }, (x, y) => {
      const n = nz.fbm(x * 0.045, y * 0.8, 3);
      return n > 0 ? [120, 82, 40, n * 0.2] : [255, 240, 220, -n * 0.12];
    });
    ctx.save();
    ctx.fillStyle = P.lg(ctx, 0, deskY + 11, 0, deskY + 16, [[0, "rgba(60,40,20,.2)"], [1, "rgba(60,40,20,0)"]]);
    ctx.fillRect(0, deskY + 11, w, 5);
    ctx.restore();

    // ── 막대(왼쪽에서, 깡통 가운데 높이) ──
    const rodR = 8;
    P.dropShadow(t, (c) => P.rrect(c, -20, cy - rodR, tipX + 20, rodR * 2, rodR), { dx: 2, dy: 4, blur: 6, a: 0.25 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, -20, cy - rodR, tipX + 20, rodR * 2, rodR);
    if (row.rod < 0) {
      ctx.fillStyle = P.lg(ctx, 0, cy - rodR, 0, cy + rodR, [[0, "#8A929E"], [0.18, "#4A515C"], [0.55, "#2C3138"], [1, "#16191D"]]);
      ctx.fill();
      ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,.42)";
      ctx.fillRect(-20, cy - rodR + 2.2, tipX + 14, 1.6);
    } else {
      ctx.fillStyle = P.lg(ctx, 0, cy - rodR, 0, cy + rodR, [[0, "rgba(220,243,248,.96)"], [0.25, "rgba(192,228,238,.8)"], [0.6, "rgba(160,206,222,.74)"], [1, "rgba(112,166,190,.94)"]]);
      ctx.fill();
      ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,.88)";
      ctx.fillRect(-20, cy - rodR + 2, tipX + 14, 1.8);
      ctx.fillStyle = "rgba(255,255,255,.45)";
      ctx.fillRect(-20, cy + rodR - 4.2, tipX + 14, 1.2);
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = row.rod < 0 ? "rgba(10,12,16,.6)" : "rgba(70,120,140,.65)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    P.rrect(ctx, -20, cy - rodR + 0.4, tipX + 20 - 0.4, rodR * 2 - 0.8, rodR);
    ctx.stroke();
    ctx.restore();
    for (let k = 0; k < 5; k++) charge(P, t, tipX - 9 - k * 15.5, cy, 4.6, row.rod > 0);

    // ── 깡통(둥근 바닥 쪽, 알루미늄): 높이 함수에서 법선을 구해 음영 ──
    P.softShadow(t, CX + 5, deskY + 1, R * 0.9, 5, 0.3);
    P.dropShadow(t, (c) => c.arc(CX, cy, R, 0, Math.PI * 2), { dx: 3, dy: 4, blur: 8, a: 0.22 });
    const hgt = (r) => {
      const dome = r < 0.72 ? -0.2 * (1 - (r / 0.72) ** 2) : 0;
      const stand = 0.07 * Math.exp(-(((r - 0.79) / 0.04) ** 2));
      const rim = 0.11 * Math.exp(-(((r - 0.955) / 0.032) ** 2));
      return dome + stand + rim;
    };
    const Hh = P.norm3([LGT[0], LGT[1], LGT[2] + 1]);
    P.shade(t, { x: CX - R - 1, y: cy - R - 1, w: 2 * R + 2, h: 2 * R + 2 }, (x, y) => {
      const dx = (x - CX) / R, dy = (y - cy) / R;
      const r = Math.sqrt(dx * dx + dy * dy);
      const cov = P.clamp((1 - r) * R + 0.5);
      if (cov <= 0) return null;
      const sl = (hgt(r + 0.003) - hgt(r - 0.003)) / 0.006; // 기울기
      const ux = r > 1e-4 ? dx / r : 0, uy = r > 1e-4 ? dy / r : 0;
      const n = P.norm3([-sl * ux, -sl * uy, 1]);
      const ndl = n[0] * LGT[0] + n[1] * LGT[1] + n[2] * LGT[2];
      const diff = P.clamp((ndl + 0.3) / 1.3);
      const sp = 0.55 * Math.pow(P.clamp(n[0] * Hh[0] + n[1] * Hh[1] + n[2] * Hh[2]), 28);
      const brush = nz.n2(Math.atan2(dy, dx) * 60, r * 3) * 0.03 + nz.n2(x * 0.7, y * 0.7) * 0.01;
      const base = [0.6, 0.64, 0.7];
      const out = base.map((b) => b * (0.32 + 0.78 * diff) + sp + brush);
      const c = P.srgb(out);
      return [c[0], c[1], c[2], cov];
    });
    ctx.save();
    ctx.strokeStyle = "rgba(46,54,68,.65)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(CX, cy, R - 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // ── 깡통 속 전하: 원자핵은 제자리, 전자만 몰린 자리 ──
    for (const [x, y] of NUC) charge(P, t, CX + x, cy + y, 5, true);
    const E = ELEC.map(([x, y]) => [x * away, y]);
    for (const [x, y] of E) charge(P, t, CX + x, cy + y, 5, false);
    info.push({ rod: row.rod, nuc: NUC.length, el: E.length, near: E.filter((p) => p[0] * row.rod > 6).length, far: E.filter((p) => p[0] * row.rod < -6).length });

    // ── 겹층 ──
    S.tag(s, 22, y0 + 16, row.tag);
    S.label(s, 40, y0 + 21, row.rod < 0 ? "(−)전기를 띤 막대" : "(+)전기를 띤 막대", { size: 14, color: row.rod < 0 ? "#1D5FB8" : "#C2361F" });
    S.leader(s, [[50, y0 + 30], [50, cy - rodR - 7], [54, cy - rodR + 1]]);
    // 힘: 깡통 위쪽 둘레에서. 가까운 쪽(왼쪽)은 막대 쪽으로 길게, 먼 쪽(오른쪽)은 바깥쪽으로 짧게
    const ay = cy - R * 0.62;
    const half = Math.sqrt(R * R - (cy - ay) * (cy - ay));
    const axL = CX - half, axR = CX + half;
    fat(S, s, [[axL + 3, ay], [axL - 70, ay]], { fill: COL.force, w: 6, head: 12, hw: 8.5 });
    fat(S, s, [[axR - 3, ay], [axR + 30, ay]], { fill: COL.force, w: 6, head: 12, hw: 8.5 });
    S.label(s, axL - 36, ay - 12, "끌어당기는 힘", { size: 13.5, anchor: "middle", color: "#0B6E63" });
    S.label(s, axR + 14, ay - 12, "밀어내는 힘", { size: 13.5, anchor: "middle", color: "#0B6E63" });
    // 가까운 쪽, 먼 쪽: 깡통 아래 반쪽마다 괄호
    const nearCol = row.rod < 0 ? "#C2361F" : "#1D5FB8";
    const farCol = row.rod < 0 ? "#1D5FB8" : "#C2361F";
    const by = deskY + 17;
    for (const [xa, xb, col] of [[CX - R + 2, CX - 4, nearCol], [CX + 4, CX + R - 2, farCol]]) {
      S.el(s, "path", { d: `M${xa} ${by - 4} L${xa} ${by} L${xb} ${by} L${xb} ${by - 4}`, fill: "none", stroke: col, "stroke-width": 1.4, opacity: 0.75, "stroke-linejoin": "round" });
    }
    S.label(s, CX - R / 2, by + 15, "가까운 쪽", { size: 13.5, anchor: "middle", color: nearCol });
    S.label(s, CX + R / 2, by + 15, "먼 쪽", { size: 13.5, anchor: "middle", color: farCol });
    // 두 힘을 견준 결과: 막대 쪽으로 굴러간다
    const ry = deskY + 47;
    fat(S, s, [[CX + 18, ry], [CX - 84, ry]], { fill: "#7048E8", w: 7, head: 13, hw: 9.5 });
    S.label(s, CX + 25, ry + 5, "깡통이 굴러가는 쪽", { size: 13.5, color: "#5F3DC4" });
    if (row.rod < 0) {
      S.leader(s, [[CX + R + 22, cy - 10], [CX + R + 12, cy - 10], [CX + R - 2.5, cy - 18]]);
      S.label(s, CX + R + 25, cy - 5, "알루미늄\n깡통", { size: 13.5 });
      // 전자(먼 쪽 둘레의 하나), 원자핵(왼쪽의 하나)
      const eT = [CX + E[1][0], cy + E[1][1]];
      S.leader(s, [[CX + R + 22, cy + 38], [CX + R + 12, cy + 38], [eT[0] + 3.2, eT[1] + 3.2]]);
      S.label(s, CX + R + 25, cy + 43, "전자", { size: 13.5, color: "#1D5FB8" });
      S.leader(s, [[CX - R - 34, cy + 36], [CX - R - 20, cy + 36], [CX - 27 - 3, cy + 27 + 2.5]]);
      S.label(s, CX - R - 37, cy + 41, "원자핵", { size: 13.5, anchor: "end", color: "#C2361F" });
    }
  }
  // 두 칸 사이 가는 금
  S.el(s, "line", { x1: 14, y1: 193, x2: w - 14, y2: 193, stroke: "#C9D0DA", "stroke-width": 1, "stroke-dasharray": "3 3" });
  window.__l2 = info;
}
