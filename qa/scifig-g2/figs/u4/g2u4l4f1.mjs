// g2u4l4f1 주기율표: 원소 118가지를 원자 번호 차례로 놓은 표(본표 7줄 + 아래로 뗀 두 줄). 위에 족 1~18, 왼쪽에 주기 1~7.
// 칸 색은 실온(25 ℃, 1기압)에서의 상태: 기체 11, 액체 2, 나머지 고체, 104~118번은 확인되지 않음. 색과 함께 무늬로도 가른다.
// 글자는 모두 13.5 px 이상이라 칸에는 원소 기호만 쓴다(넓은 기호는 가로로만 살짝 눌러 칸에 맞춘다). 검산 메모는 g2u4l4f1.md
export const meta = {
  key: "g2u4l4f1",
  w: 340,
  h: 308,
  alt: "원소 118가지를 원자 번호 차례로 늘어놓은 주기율표예요. 세로줄은 1족부터 18족까지, 가로줄은 1주기부터 7주기까지 있어요. 칸의 색은 실온에서의 상태로, 기체는 수소와 18족 등 11가지, 액체는 브로민과 수은 2가지, 나머지는 고체이고 104번부터 118번은 확인되지 않았어요.",
};

// 주기별 원소 기호(본표). 6, 7주기의 3족 자리는 아래 두 줄(란타넘족 57~71, 악티늄족 89~103)
const ROWS = [
  [[1, "H"], [18, "He"]],
  [[1, "Li"], [2, "Be"], [13, "B"], [14, "C"], [15, "N"], [16, "O"], [17, "F"], [18, "Ne"]],
  [[1, "Na"], [2, "Mg"], [13, "Al"], [14, "Si"], [15, "P"], [16, "S"], [17, "Cl"], [18, "Ar"]],
  "K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr".split(" ").map((s, i) => [i + 1, s]),
  "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe".split(" ").map((s, i) => [i + 1, s]),
  "Cs Ba * Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn".split(" ").map((s, i) => [i + 1, s]),
  "Fr Ra ** Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ").map((s, i) => [i + 1, s]),
];
const LANTH = "La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu".split(" ");
const ACTIN = "Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr".split(" ");
const GAS = new Set(["H", "He", "N", "O", "F", "Ne", "Cl", "Ar", "Kr", "Xe", "Rn"]);
const LIQ = new Set(["Br", "Hg"]);
const UNK = new Set("Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" "));

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(61);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.01 });

  // ── 원자 번호를 차례로 매겨 개수를 검산한다 ──
  const cells = [];
  let z = 0;
  ROWS.forEach((row, pi) => {
    for (const [g, sym] of row) {
      if (sym === "*") {
        cells.push({ p: pi + 1, g, sym, ph: "L" });
        for (const s of LANTH) z++, void s;
        continue;
      }
      if (sym === "**") {
        cells.push({ p: pi + 1, g, sym, ph: "A" });
        for (const s of ACTIN) z++, void s;
        continue;
      }
      cells.push({ p: pi + 1, g, sym, z: ++z });
    }
  });
  // 번호를 바른 차례로 다시 매긴다(란타넘족, 악티늄족 포함)
  {
    let n = 0;
    const order = [];
    ROWS.forEach((row) => {
      for (const [, sym] of row) {
        if (sym === "*") LANTH.forEach((s) => order.push(s));
        else if (sym === "**") ACTIN.forEach((s) => order.push(s));
        else order.push(sym);
      }
    });
    const zOf = Object.fromEntries(order.map((s) => [s, ++n]));
    if (n !== 118) throw new Error("원소가 118가지가 아니에요: " + n);
    if (zOf.La !== 57 || zOf.Lu !== 71 || zOf.Ac !== 89 || zOf.Lr !== 103 || zOf.Rf !== 104 || zOf.Og !== 118 || zOf.Na !== 11 || zOf.F !== 9) throw new Error("원자 번호 차례가 어긋났어요");
    for (const c of cells) if (c.z) c.z = zOf[c.sym];
  }
  const stateOf = (s) => (UNK.has(s) ? "unk" : GAS.has(s) ? "gas" : LIQ.has(s) ? "liq" : "sol");
  const all = [...cells.filter((c) => c.z).map((c) => c.sym), ...LANTH, ...ACTIN];
  const cnt = { gas: 0, liq: 0, sol: 0, unk: 0 };
  for (const s of all) cnt[stateOf(s)]++;
  if (all.length !== 118 || cnt.gas !== 11 || cnt.liq !== 2 || cnt.unk !== 15 || cnt.sol !== 90) throw new Error("상태 개수가 맞지 않아요 " + JSON.stringify(cnt));

  // ── 판 치수 ──
  const MX = 14, PX = (w - MX - 2) / 18, CW = PX - 1.1;
  const RH = 21, CH = 19.6;
  const Y0 = 22;
  const cx = (g) => MX + (g - 1) * PX;
  const cy = (p) => Y0 + (p - 1) * RH;
  const YF = Y0 + 7 * RH + 23, YA = YF + RH + 9;
  const FX = MX + 3 * PX; // 아래 두 줄은 4족 자리부터

  // 상태 색(실온): 고체 파랑, 액체 초록, 기체 살구, 확인되지 않음 회색 빗금
  const ST = {
    sol: { top: "#E2EEFB", bot: "#BCD6F2", edge: "#8FB1D6", ink: "#1D3A5C" },
    liq: { top: "#DDF6DF", bot: "#AEE3B4", edge: "#7FC18A", ink: "#1E5130" },
    gas: { top: "#FFE6DC", bot: "#FFC3AE", edge: "#E59B80", ink: "#6B2A16" },
    unk: { top: "#F1F3F5", bot: "#DDE1E6", edge: "#ADB5BD", ink: "#495057" },
  };
  const tile = (x, y, wd, ht, st, o = {}) => {
    const c = ST[st];
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x, y, wd, ht, 2.6);
    ctx.save();
    ctx.shadowColor = "rgba(30,44,70,.2)";
    ctx.shadowBlur = 2.2 * t.dpr;
    ctx.shadowOffsetY = 1.1 * t.dpr;
    ctx.fillStyle = P.lg(ctx, x, y, x + wd * 0.4, y + ht, [[0, c.top], [1, c.bot]]);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.clip();
    // 무늬: 기체 점, 액체 물결, 확인되지 않음 빗금(고체는 무늬 없음)
    if (st === "gas") {
      ctx.fillStyle = "rgba(196,84,52,.32)";
      for (let yy = y + 2.5; yy < y + ht; yy += 4.4)
        for (let xx = x + 2.5 + ((yy - y) % 8.8 > 4 ? 2.2 : 0); xx < x + wd; xx += 4.4) {
          ctx.beginPath();
          ctx.arc(xx, yy, 0.62, 0, Math.PI * 2);
          ctx.fill();
        }
    } else if (st === "liq") {
      ctx.strokeStyle = "rgba(47,140,70,.38)";
      ctx.lineWidth = 0.7;
      for (let yy = y + 3.5; yy < y + ht; yy += 4.2) {
        ctx.beginPath();
        for (let xx = x - 1; xx <= x + wd + 1; xx += 1) ctx.lineTo(xx, yy + Math.sin((xx - x) * 0.9) * 0.9);
        ctx.stroke();
      }
    } else if (st === "unk") {
      ctx.strokeStyle = "rgba(120,128,138,.42)";
      ctx.lineWidth = 0.8;
      for (let k = -ht; k < wd + ht; k += 3.6) {
        ctx.beginPath();
        ctx.moveTo(x + k, y + ht);
        ctx.lineTo(x + k + ht, y);
        ctx.stroke();
      }
    }
    ctx.restore();
    // 입체감: 왼쪽 위 밝은 테, 오른쪽 아래 그늘
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + ht - 2);
    ctx.lineTo(x + 1, y + 1.2);
    ctx.lineTo(x + wd - 2, y + 1.2);
    ctx.stroke();
    ctx.strokeStyle = o.frame ?? c.edge;
    ctx.lineWidth = o.frame ? 1.3 : 0.8;
    ctx.beginPath();
    P.rrect(ctx, x + 0.4, y + 0.4, wd - 0.8, ht - 0.8, 2.4);
    ctx.stroke();
    ctx.restore();
  };


  // ── 강조: 1족 세로줄, 2주기 가로줄(옅은 테두리) ──
  const HL = "#F08C00";
  const band = (x, y, wd, ht) => {
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x, y, wd, ht, 4);
    ctx.fillStyle = "rgba(255,212,59,.16)";
    ctx.fill();
    ctx.restore();
  };
  band(cx(1) - 2, cy(1) - 2, CW + 4, 7 * RH + 2);
  band(cx(1) - 2, cy(2) - 2, 18 * PX + 2, RH + 2);

  // ── 칸 ──
  const sv = S.svgLayer(root, w, h);
  const symText = (x, y, wd, sym, st) => {
    const e = S.el(sv, "text", {
      x: x + wd / 2, y, "text-anchor": "middle", "font-size": 13.5, "font-weight": 700, fill: ST[st].ink,
      "letter-spacing": "-0.03em", "font-family": "'Pretendard Variable', Pretendard, sans-serif",
    }, sym);
    const L = e.getComputedTextLength();
    if (L > wd - 2.2) {
      e.setAttribute("textLength", (wd - 2.2).toFixed(2));
      e.setAttribute("lengthAdjust", "spacingAndGlyphs");
    }
    return L;
  };
  const tileY = (p) => cy(p) + (RH - CH) / 2;
  for (const c of cells) {
    const x = cx(c.g), y = tileY(c.p);
    if (c.ph) {
      // 6, 7주기 3족: 아래 두 줄로 이어진다는 표시(그 줄과 같은 빛깔, 아래 화살)
      const col = c.ph === "L" ? ["#EFE7FF", "#D9C9FF", "#845EF7"] : ["#E3FAF2", "#B2EBD6", "#0CA678"];
      ctx.save();
      ctx.beginPath();
      P.rrect(ctx, x, y, CW, CH, 2.6);
      ctx.fillStyle = P.lg(ctx, x, y, x, y + CH, [[0, col[0]], [1, col[1]]]);
      ctx.fill();
      ctx.strokeStyle = col[2];
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = col[2];
      ctx.beginPath();
      const mx = x + CW / 2, my = y + CH / 2 + 1;
      ctx.moveTo(mx - 4.5, my - 3);
      ctx.lineTo(mx + 4.5, my - 3);
      ctx.lineTo(mx, my + 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      continue;
    }
    const st = stateOf(c.sym);
    tile(x, y, CW, CH, st);
    c.w = symText(x, y + CH / 2 + 4.9, CW, c.sym, st);
  }
  // 아래 두 줄
  const fRow = (list, y, frame) => {
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, FX - 2, y - 2, 15 * PX + 2.4, RH + 1, 4);
    ctx.strokeStyle = frame;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();
    list.forEach((sym, i) => {
      const x = FX + i * PX, yy = y + (RH - CH) / 2 - 0.5;
      tile(x, yy, CW, CH, "sol");
      symText(x, yy + CH / 2 + 4.9, CW, sym, "sol");
    });
  };
  fRow(LANTH, YF, "#845EF7");
  fRow(ACTIN, YA, "#0CA678");

  // 강조 테두리는 칸 위에(옅게)
  const outline = (x, y, wd, ht) => {
    S.el(sv, "rect", { x, y, width: wd, height: ht, rx: 4, fill: "none", stroke: HL, "stroke-width": 1.6, opacity: 0.85 });
  };
  outline(cx(1) - 2, cy(1) - 1.5, CW + 4, 7 * RH + 1);
  outline(cx(1) - 2, cy(2) - 1.5, 18 * PX + 2, RH + 1);

  // ── 족 번호, 주기 번호 ──
  const num = (x, y, s, o = {}) => S.label(sv, x, y, s, { anchor: "middle", size: 13.5, weight: 700, color: o.color ?? "#5B6676", haloW: 3 });
  for (let g = 1; g <= 18; g++) num(cx(g) + CW / 2, Y0 - 6, String(g));
  for (let p = 1; p <= 7; p++) num(MX / 2 - 0.5, tileY(p) + CH / 2 + 4.8, String(p));
  S.label(sv, 0.5, Y0 - 6, "족", { size: 13.5, color: "#C2410C", haloW: 3 });
  S.label(sv, 0.5, cy(7) + RH + 12, "주기", { size: 13.5, color: "#C2410C", haloW: 3 });

  // ── 아래 두 줄 이름 ──
  S.label(sv, FX - 6, YF + 8, "란타넘족", { anchor: "end", size: 13.5, color: "#5F3DC4" });
  S.label(sv, FX - 6, YF + 23, "57~71", { anchor: "end", size: 13.5, color: "#5F3DC4" });
  S.label(sv, FX - 6, YA + 7, "악티늄족", { anchor: "end", size: 13.5, color: "#087F5B" });
  S.label(sv, FX - 6, YA + 22, "89~103", { anchor: "end", size: 13.5, color: "#087F5B" });

  // ── 보기: 크게 그린 칸(원자 번호, 원소 기호)과 상태 색 ──
  const LY = YA + RH + 12;
  {
    const x = 8, y = LY, wd = 36, ht = 44;
    tile(x, y, wd, ht, "gas");
    S.el(sv, "text", { x: x + 4, y: y + 15, "font-size": 13.5, "font-weight": 700, fill: ST.gas.ink, "font-family": "'Pretendard Variable', Pretendard, sans-serif" }, "1");
    S.el(sv, "text", { x: x + wd / 2, y: y + 37, "text-anchor": "middle", "font-size": 21, "font-weight": 800, fill: ST.gas.ink, "font-family": "'Pretendard Variable', Pretendard, sans-serif" }, "H");
    S.leader(sv, [[56, LY + 10], [x + 13, LY + 10]], { dotR: 1.8 });
    S.label(sv, 58, LY + 15, "원자 번호", { size: 13.5 });
    S.leader(sv, [[56, LY + 32], [x + 26, LY + 31]], { dotR: 1.8 });
    S.label(sv, 58, LY + 37, "원소 기호", { size: 13.5 });
  }
  const key = (x, y, st, text) => {
    tile(x, y, 17, 15, st);
    S.label(sv, x + 22, y + 12, text, { size: 13.5, color: ST[st].ink });
  };
  key(136, LY + 2, "sol", "고체");
  key(196, LY + 2, "liq", "액체");
  key(136, LY + 24, "gas", "기체");
  key(196, LY + 24, "unk", "확인되지 않음");
}
