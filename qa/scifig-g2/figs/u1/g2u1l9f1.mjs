// g2u1l9f1 원유의 증류탑: 왼쪽 아래 원통형 가열로(속에 나선 코일과 버너 불꽃)에서 데운 원유가 증류탑 아래쪽으로 들어간다.
// 탑은 세로로 잘라 속을 보인다(선반, 덮개, 선반 위 액체, 넘친 액체가 내려가는 관, 위로 가는 기체와 아래로 가는 액체).
// 탑 속 뒷벽은 아래가 붉고 위가 푸르며, 탑 왼쪽 온도 띠도 같다. 오른쪽에는 높이마다 뽑아내는 관 끝에 그 산물을 담은 작은 병,
// 산물 이름, 끓는점 범위 태그(한국석유공사, 2024)를 둔다. 검산 메모는 g2u1l9f1.md
export const meta = {
  key: "g2u1l9f1",
  w: 340,
  h: 408,
  alt: "왼쪽 아래 가열로의 나선 관을 지나며 데워진 원유가 증류탑 아래쪽으로 들어가요. 탑을 세로로 자른 속에는 여러 층의 선반이 있어 기체는 위로, 액체는 아래로 움직여요. 탑은 아래가 뜨겁고 위로 갈수록 온도가 낮아서 탑 속과 왼쪽 띠를 아래는 붉게, 위는 푸르게 칠했어요. 오른쪽 관 끝의 병에는 위에서부터 액화 석유 가스, 휘발유, 등유, 경유, 중유가 모이고 맨 아래로 찌꺼기가 빠지며, 아래로 갈수록 끓는점이 높고 색이 짙어요.",
};

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(91);
  const rnd = N.rng(13);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF2F6", grain: 0.012 });

  // ── 탑 기하 ──
  const TX = 116, TR = 31; // 탑 가운데, 반지름(폭 62)
  const TL = TX - TR, TRt = TX + TR;
  const WIN0 = 46, WIN1 = 374; // 잘라 낸 창(위, 아래)
  const DOME = 30; // 지붕 꼭대기
  const SHELL0 = 44; // 몸통 위 끝
  const BASE = 388; // 받침
  const WALL = 3;
  const trays = [];
  for (let k = 0; k < 10; k++) trays.push(64 + k * 28); // 선반 높이(64 ~ 316)
  const FEED = 336; // 원유가 들어오는 높이(맨 아래 선반 밑)
  const POOL = 358; // 탑 바닥에 고인 찌꺼기 수면
  const IL = TL + WALL, IR = TRt - WALL;
  // 산물: 뽑는 높이(그 선반의 액체), 병에 담긴 색
  const prod = [
    { y: 18, name: "액화 석유 가스", range: "−42~1 ℃", col: "#D0EBFF", gas: true },
    { y: trays[1] - 4, name: "휘발유", range: "30~120 ℃", col: "#FFF3BF" },
    { y: trays[3] - 4, name: "등유", range: "150~280 ℃", col: "#FFE08A" },
    { y: trays[5] - 4, name: "경유", range: "230~350 ℃", col: "#F4B34A" },
    { y: trays[7] - 4, name: "중유", range: "300 ℃ 이상", col: "#8A5226" },
    { y: 366, name: "찌꺼기", range: "아스팔트 원료", col: "#2B211A", bottom: true },
  ];
  // 선반 위 액체 색: 높이에 따라 옅은 노랑 → 짙은 갈색
  const trayCol = (k) => ["#FFF6CC", "#FFF0B0", "#FFE48A", "#FFDA70", "#F8C45A", "#F1AE45", "#E2913A", "#C97733", "#AE6230", "#94512B"][k];
  // 온도 색(아래 붉음, 위 푸름): s = 0(위) ~ 1(아래)
  const tempStops = [[0, "#1C7ED6"], [0.3, "#74C0FC"], [0.55, "#FFD43B"], [0.78, "#FD7E14"], [1, "#E03131"]];

  // ── 관 그리기 ──
  const pipe = (pts, wd = 4.2, cols = ["#8C96A3", "#EEF1F5", "#6E7885"]) => {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const path = () => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
    };
    path();
    ctx.strokeStyle = "rgba(60,70,82,.9)";
    ctx.lineWidth = wd + 1;
    ctx.stroke();
    path();
    ctx.strokeStyle = cols[0];
    ctx.lineWidth = wd;
    ctx.stroke();
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0] - 0.4, p[1] - wd * 0.22) : ctx.moveTo(p[0] - 0.4, p[1] - wd * 0.22)));
    ctx.strokeStyle = cols[1];
    ctx.lineWidth = wd * 0.32;
    ctx.stroke();
    ctx.restore();
  };
  const HOT = ["#C2552F", "#F7C2A0", "#7A3A22"]; // 데운 원유가 지나는 관

  // ── 왼쪽: 온도 띠 ──
  const BAR = { x: 64, y0: 54, y1: 246, bw: 8 };
  {
    const { x, y0, y1, bw } = BAR;
    P.dropShadow(t, (c) => P.rrect(c, x, y0, bw, y1 - y0, 4), { dx: 1, dy: 2, blur: 4, a: 0.18 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x, y0, bw, y1 - y0, 4);
    ctx.fillStyle = P.lg(ctx, 0, y0, 0, y1, tempStops);
    ctx.fill();
    ctx.fillStyle = P.lg(ctx, x, 0, x + bw, 0, [[0, "rgba(255,255,255,.45)"], [0.4, "rgba(255,255,255,.1)"], [1, "rgba(0,0,0,.12)"]]);
    ctx.fill();
    ctx.restore();
  }

  // ── 왼쪽 아래: 원통형 가열로(앞을 잘라 속의 나선 관과 버너 불꽃을 보인다) ──
  const FUR = { cx: 33, x0: 10, x1: 56, y0: 292, y1: 364, ry: 5 };
  const COIL = { cx: 33, rx: 11.5, ry: 3.2, yTop: 310, yBot: 346, turns: 3.5 };
  const coilPt = (s) => {
    const th = Math.PI * 2 * COIL.turns * s + Math.PI; // s = 0(아래 왼쪽) → 1(위)
    return [COIL.cx + COIL.rx * Math.cos(th), COIL.yBot - (COIL.yBot - COIL.yTop) * s + COIL.ry * Math.sin(th), Math.sin(th)];
  };
  // 원유가 들어오는 관(아래에서 가열로 바닥으로)과 나가는 관(가열로 위에서 탑 아래쪽으로)
  pipe([[2, 384], [COIL.cx - COIL.rx, 384], [COIL.cx - COIL.rx, FUR.y1 + 2]], 4.4);
  const OUT = [[FUR.x1 - 2, 300], [74, 300], [74, FEED], [TL + 1, FEED]];
  pipe(OUT, 4.6, HOT);
  {
    const { x0, x1, y0, y1, ry, cx } = FUR;
    const rx = (x1 - x0) / 2;
    P.softShadow(t, cx + 3, y1 + 3, rx * 1.25, 4, 0.22);
    ctx.save();
    // 몸통(철판 원통)
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y1);
    ctx.ellipse(cx, y1, rx, ry, 0, Math.PI, 0, true);
    ctx.lineTo(x1, y0);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, x0, 0, x1, 0, [[0, "#7F8A97"], [0.24, "#EEF2F6"], [0.5, "#C9D1DA"], [1, "#6A7582"]]);
    ctx.fill();
    // 이음 띠
    ctx.strokeStyle = "rgba(70,82,96,.5)";
    ctx.lineWidth = 0.7;
    for (const yy of [y0 + 5, y1 - 3]) {
      ctx.beginPath();
      ctx.ellipse(cx, yy, rx, ry, 0, 0, Math.PI);
      ctx.stroke();
    }
    // 윗면
    ctx.beginPath();
    ctx.ellipse(cx, y0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, x0, y0 - ry, x1, y0 + ry, [[0, "#FFFFFF"], [1, "#A9B3BF"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(70,82,96,.55)";
    ctx.stroke();
    // 앞을 잘라 낸 창
    const wx0 = x0 + 5, wx1 = x1 - 5, wy0 = y0 + 9, wy1 = y1 - 4;
    ctx.beginPath();
    P.rrect(ctx, wx0, wy0, wx1 - wx0, wy1 - wy0, 3);
    ctx.fillStyle = "#2A1712";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = P.rg(ctx, cx, wy1, 1, cx, wy1, (wy1 - wy0) * 1.05, [[0, "rgba(255,190,90,.85)"], [0.45, "rgba(235,95,40,.55)"], [1, "rgba(120,30,20,0)"]]);
    ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    // 나선 관: 뒤쪽 반 바퀴 먼저(어둡게)
    const N1 = 220;
    const seg = (front) => {
      for (let i = 0; i < N1; i++) {
        const a = coilPt(i / N1), b = coilPt((i + 1) / N1);
        if ((a[2] > 0) !== front) continue;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.strokeStyle = front ? "#5A1E10" : "#3A1A12";
        ctx.lineWidth = 3.6;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.strokeStyle = front ? P.css(P.hex("#FF8A3D"), 0.95) : "rgba(150,60,30,.85)";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        if (front) {
          ctx.beginPath();
          ctx.moveTo(a[0] - 0.3, a[1] - 0.8);
          ctx.lineTo(b[0] - 0.3, b[1] - 0.8);
          ctx.strokeStyle = "rgba(255,226,170,.8)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    };
    ctx.lineCap = "round";
    seg(false);
    // 버너 불꽃(바닥)
    for (const fx of [cx - 11, cx, cx + 11]) {
      const fy = wy1, fh = 8 + rnd() * 2;
      ctx.beginPath();
      ctx.moveTo(fx - 3.2, fy);
      ctx.quadraticCurveTo(fx - 2.6, fy - fh * 0.6, fx, fy - fh);
      ctx.quadraticCurveTo(fx + 2.6, fy - fh * 0.6, fx + 3.2, fy);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, fy - fh, 0, fy, [[0, "rgba(255,235,160,.25)"], [0.45, "rgba(255,170,60,.95)"], [1, "rgba(70,140,255,.95)"]]);
      ctx.fill();
    }
    seg(true);
    ctx.restore();
    // 창 테두리(잘린 철판)
    ctx.beginPath();
    P.rrect(ctx, wx0, wy0, wx1 - wx0, wy1 - wy0, 3);
    ctx.strokeStyle = "rgba(225,230,236,.95)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.strokeStyle = "rgba(60,70,82,.8)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
  }
  // 나선 관의 들어오는 끝과 나가는 끝(창 밖 몸통 위로 짧게 보이는 관)
  {
    const a = coilPt(0), b = coilPt(1);
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "#7A3A22";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(a[0], FUR.y1 + 1);
    ctx.moveTo(b[0], b[1]);
    ctx.lineTo(b[0], 300);
    ctx.lineTo(FUR.x1 - 1, 300);
    ctx.stroke();
    ctx.restore();
  }

  // ── 증류탑 ──
  P.softShadow(t, TX + 4, BASE + 3, TR * 1.5, 5, 0.22);
  // 받침(기둥 아래 치마)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(TL - 3, WIN1);
  ctx.lineTo(TL - 6, BASE);
  ctx.lineTo(TRt + 6, BASE);
  ctx.lineTo(TRt + 3, WIN1);
  ctx.closePath();
  ctx.fillStyle = P.lg(ctx, TL - 6, 0, TRt + 6, 0, [[0, "#7D8794"], [0.3, "#D9DFE6"], [1, "#6A7480"]]);
  ctx.fill();
  ctx.restore();
  // 몸통 바깥(창 위아래로 보이는 둥근 철판)
  const shellFill = (y0, y1) => {
    ctx.fillStyle = P.lg(ctx, TL, 0, TRt, 0, [[0, "#8D97A3"], [0.22, "#F2F5F8"], [0.45, "#D7DDE4"], [1, "#747E8B"]]);
    ctx.fillRect(TL, y0, 2 * TR, y1 - y0);
  };
  ctx.save();
  shellFill(SHELL0, WIN0 + 2);
  shellFill(WIN1 - 2, WIN1 + 1);
  // 지붕(반구)
  ctx.beginPath();
  ctx.moveTo(TL, SHELL0);
  ctx.bezierCurveTo(TL, DOME + 1, TRt, DOME + 1, TRt, SHELL0);
  ctx.closePath();
  ctx.fillStyle = P.rg(ctx, TX - 12, DOME + 3, 2, TX, SHELL0, TR * 1.1, [[0, "#FFFFFF"], [0.5, "#D9DFE6"], [1, "#8C96A2"]]);
  ctx.fill();
  ctx.restore();
  // 잘라 낸 속: 뒷벽은 아래가 붉게 달아 있고 위로 갈수록 식어 푸르다
  ctx.save();
  ctx.beginPath();
  ctx.rect(IL, WIN0, IR - IL, WIN1 - WIN0);
  ctx.clip();
  ctx.fillStyle = P.lg(ctx, 0, WIN0, 0, WIN1, [[0, "#1F4E80"], [0.28, "#2F5D86"], [0.55, "#5A4E5C"], [0.8, "#80392C"], [1, "#8E2A20"]]);
  ctx.fillRect(IL, WIN0, IR - IL, WIN1 - WIN0);
  // 둥근 뒷벽의 그늘(가운데 밝고 양옆 어둡게)
  ctx.fillStyle = P.lg(ctx, IL, 0, IR, 0, [[0, "rgba(0,0,0,.38)"], [0.45, "rgba(255,255,255,.06)"], [0.8, "rgba(0,0,0,.08)"], [1, "rgba(0,0,0,.34)"]]);
  ctx.fillRect(IL, WIN0, IR - IL, WIN1 - WIN0);
  // 탑 바닥에 고인 찌꺼기(짙은 액체)
  ctx.fillStyle = P.lg(ctx, 0, POOL, 0, WIN1, [[0, "#4A3626"], [1, "#22180F"]]);
  ctx.fillRect(IL, POOL, IR - IL, WIN1 - POOL);
  ctx.strokeStyle = "rgba(255,200,150,.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(IL, POOL);
  ctx.lineTo(IR, POOL);
  ctx.stroke();
  // 선반: 판 + 판 위 액체 + 덮개(거품 뚜껑) + 넘친 액체가 내려가는 관(양쪽 번갈아)
  const vaporArrows = [], liquidArrows = [];
  trays.forEach((ty, k) => {
    const dcLeft = k % 2 === 0; // 내려가는 관이 왼쪽(짝수 선반)
    const dcW = 10;
    const plateL = dcLeft ? IL + dcW : IL, plateR = dcLeft ? IR : IR - dcW;
    const nextY = k < trays.length - 1 ? trays[k + 1] : FEED - 6;
    const bx = dcLeft ? IL + dcW : IR - dcW;
    const lc = trayCol(k);
    ctx.fillStyle = P.css(P.hex(lc), 0.78);
    if (dcLeft) ctx.fillRect(IL, ty - 1, dcW - 0.6, nextY - ty - 3);
    else ctx.fillRect(IR - dcW + 0.6, ty - 1, dcW - 0.6, nextY - ty - 3);
    liquidArrows.push([[dcLeft ? IL + dcW / 2 - 0.5 : IR - dcW / 2 + 0.5, ty + 3], [dcLeft ? IL + dcW / 2 - 0.5 : IR - dcW / 2 + 0.5, nextY - 6]]);
    // 칸막이
    ctx.fillStyle = "#C3CBD4";
    ctx.fillRect(bx - 0.7, ty - 4, 1.4, nextY - ty);
    // 판 위 액체(얕게 고인다, 넘침 둑 높이까지)
    ctx.fillStyle = P.lg(ctx, 0, ty - 4, 0, ty, [[0, P.css(P.hex(lc), 0.92)], [1, P.css(P.srgb(P.mixc(P.lin(P.hex(lc)), [0, 0, 0], 0.25)), 0.96)]]);
    ctx.fillRect(plateL, ty - 4, plateR - plateL, 4);
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(plateL, ty - 4);
    ctx.lineTo(plateR, ty - 4);
    ctx.stroke();
    // 판(잘린 면)
    ctx.fillStyle = P.lg(ctx, 0, ty, 0, ty + 2.2, [[0, "#EEF2F6"], [1, "#9AA5B2"]]);
    ctx.fillRect(plateL, ty, plateR - plateL, 2.2);
    // 덮개: 판 구멍 위의 뒤집힌 컵. 위 선반의 내려가는 관이 내려앉는 자리에는 덮개도 기체 화살표도 두지 않는다.
    const nCap = 3;
    const inlet = k === 0 ? null : (k - 1) % 2 === 0 ? [IL, IL + dcW] : [IR - dcW, IR];
    for (let c = 0; c < nCap; c++) {
      const cx = plateL + ((plateR - plateL) * (c + 0.5)) / nCap;
      if (inlet && cx + 6 > inlet[0] && cx - 6 < inlet[1]) {
        rnd();
        rnd();
        continue;
      }
      ctx.fillStyle = P.lg(ctx, cx - 4, ty - 8, cx + 4, ty - 3, [[0, "#F4F6F8"], [0.5, "#B9C2CC"], [1, "#7D8794"]]);
      ctx.beginPath();
      ctx.moveTo(cx - 4, ty - 2.2);
      ctx.lineTo(cx - 4, ty - 5.5);
      ctx.quadraticCurveTo(cx - 4, ty - 8.4, cx, ty - 8.4);
      ctx.quadraticCurveTo(cx + 4, ty - 8.4, cx + 4, ty - 5.5);
      ctx.lineTo(cx + 4, ty - 2.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.85)";
      for (const dx of [-5.4, 5.4]) {
        ctx.beginPath();
        ctx.arc(cx + dx, ty - 2.6 - rnd() * 1.2, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      if (k > 0) vaporArrows.push([[cx, ty - 10], [cx, trays[k - 1] + 6]]);
    }
  });
  {
    const lastY = trays[trays.length - 1];
    for (const c of [0.3, 0.7]) vaporArrows.push([[IL + (IR - IL) * c, FEED - 4], [IL + (IR - IL) * c, lastY + 6]]);
    liquidArrows.push([[TX + 4, FEED + 4], [TX + 4, POOL - 3]]);
    vaporArrows.push([[TX, trays[0] - 10], [TX, WIN0 + 3]]);
  }
  ctx.restore();
  // 잘린 철판 테두리(양옆 두께)와 창의 위아래 자른 선
  ctx.save();
  ctx.fillStyle = "#E1E6EC";
  ctx.strokeStyle = "rgba(70,80,92,.8)";
  ctx.lineWidth = 0.6;
  for (const x of [TL, IR]) {
    ctx.fillRect(x, WIN0, WALL, WIN1 - WIN0);
    ctx.strokeRect(x, WIN0, WALL, WIN1 - WIN0);
  }
  ctx.beginPath();
  ctx.moveTo(TL, WIN0);
  ctx.lineTo(TRt, WIN0);
  ctx.moveTo(TL, WIN1);
  ctx.lineTo(TRt, WIN1);
  ctx.stroke();
  ctx.restore();

  // ── 오른쪽: 뽑아내는 관과 산물 병 ──
  const BX = 172; // 병 가운데(관은 여기서 아래로 꺾여 병 입구에 닿는다)
  const SPOUT = 5; // 꺾인 끝의 길이
  for (const p of prod) {
    const x0 = p.gas ? TX : p.bottom ? IR - 2 : TRt - 1;
    const head = p.gas ? [[TX, DOME + 2], [TX, p.y]] : [[x0, p.y]];
    pipe([...head, [BX, p.y], [BX, p.y + SPOUT]], p.bottom ? 4.4 : 4);
    // 관 속 산물 색 띠
    ctx.save();
    ctx.strokeStyle = P.css(P.hex(p.col), 0.95);
    ctx.lineWidth = 1.6;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.gas ? TX + 6 : TRt + 2, p.y);
    ctx.lineTo(BX, p.y);
    ctx.lineTo(BX, p.y + SPOUT - 1);
    ctx.stroke();
    ctx.restore();
  }
  // 산물 병(가스는 작은 가스통, 액체는 유리병, 찌꺼기는 검은 덩이). 입구는 꺾인 관 끝 바로 아래(y + SPOUT + 1)
  const bottle = (p) => {
    const top = p.y + SPOUT + 1;
    ctx.save();
    if (p.gas) {
      // 가스통: 꼭지(관이 닿는 곳), 둥근 어깨, 띠
      const x0 = BX - 7, y0 = top + 4, bw = 14, bh = 21;
      P.softShadow(t, BX + 1, y0 + bh + 1.5, 8.5, 2, 0.2);
      ctx.fillStyle = "#59636E";
      ctx.fillRect(BX - 3.6, top, 7.2, 1.8);
      ctx.fillRect(BX - 1.8, top + 1.6, 3.6, 2.6);
      ctx.beginPath();
      P.rrect(ctx, x0, y0, bw, bh, 5.5);
      ctx.fillStyle = P.lg(ctx, x0, 0, x0 + bw, 0, [[0, "#8FA0B3"], [0.32, "#FFFFFF"], [0.62, "#D5DDE6"], [1, "#7C8B9C"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(70,82,96,.75)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = "#3D8FE8";
      ctx.fillRect(x0 + 0.4, y0 + 8, bw - 0.8, 3);
    } else if (p.bottom) {
      // 굳은 찌꺼기 덩이(아스팔트)
      const y = top + 6;
      P.softShadow(t, BX + 1, y + 7, 10.5, 2.2, 0.22);
      ctx.beginPath();
      ctx.moveTo(BX - 10.5, y + 6);
      ctx.quadraticCurveTo(BX - 11, y - 2, BX - 5, y - 4);
      ctx.quadraticCurveTo(BX + 1, y - 7, BX + 6, y - 3);
      ctx.quadraticCurveTo(BX + 11, y, BX + 10.5, y + 6);
      ctx.closePath();
      ctx.fillStyle = P.rg(ctx, BX - 4, y - 2, 1, BX, y + 2, 12, [[0, "#5A4A3E"], [1, "#1A1410"]]);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.beginPath();
      ctx.ellipse(BX - 4, y - 2.5, 2.6, 1, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 유리병: 목, 몸통, 담긴 액체(몸통의 3분의 2쯤)
      const x0 = BX - 7.5, bw = 15, y0 = top + 4, bh = 19;
      P.softShadow(t, BX + 1, y0 + bh + 1.5, 9, 2, 0.2);
      const body = () => {
        ctx.beginPath();
        ctx.moveTo(BX - 2.8, top);
        ctx.lineTo(BX - 2.8, y0);
        ctx.quadraticCurveTo(x0, y0 + 0.5, x0, y0 + 4);
        ctx.lineTo(x0, y0 + bh - 3);
        ctx.quadraticCurveTo(x0, y0 + bh, x0 + 3, y0 + bh);
        ctx.lineTo(x0 + bw - 3, y0 + bh);
        ctx.quadraticCurveTo(x0 + bw, y0 + bh, x0 + bw, y0 + bh - 3);
        ctx.lineTo(x0 + bw, y0 + 4);
        ctx.quadraticCurveTo(x0 + bw, y0 + 0.5, BX + 2.8, y0);
        ctx.lineTo(BX + 2.8, top);
      };
      body();
      ctx.closePath();
      ctx.fillStyle = "rgba(232,240,248,.9)";
      ctx.fill();
      ctx.save();
      ctx.clip();
      const ly = y0 + 6;
      ctx.fillStyle = P.lg(ctx, x0, 0, x0 + bw, 0, [[0, P.tone(p.col, -0.2)], [0.4, P.tone(p.col, 0.06)], [1, P.tone(p.col, -0.28)]]);
      ctx.fillRect(x0, ly, bw, y0 + bh - ly);
      ctx.strokeStyle = "rgba(255,255,255,.8)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(x0, ly);
      ctx.lineTo(x0 + bw, ly);
      ctx.stroke();
      ctx.restore();
      body();
      ctx.strokeStyle = "rgba(78,92,108,.95)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // 유리 반짝임
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x0 + 2.6, y0 + 5);
      ctx.lineTo(x0 + 2.6, y0 + bh - 4);
      ctx.stroke();
    }
    ctx.restore();
  };
  for (const p of prod) bottle(p);

  // ── 겹층: 화살표와 라벨 ──
  const sv = S.svgLayer(root, w, h);
  for (const [a, b] of vaporArrows) S.rayArrow(sv, a, b, { color: "#F1F6FB", w: 1.3, hl: 4.6, hw: 2.8 });
  for (const [a, b] of liquidArrows) S.rayArrow(sv, a, b, { color: "#7A4A1C", w: 1.3, hl: 4.6, hw: 2.8 });
  // 데운 원유가 탑으로 들어가는 화살표, 원유가 가열로로 들어가는 화살표
  S.rayArrow(sv, [TL - 11, FEED], [TL + 2, FEED], { color: "#C2410C", w: 1.6, hl: 5, hw: 3.2 });
  S.rayArrow(sv, [4, 384], [14, 384], { color: "#4E5968", w: 1.5, hl: 4.6, hw: 3 });
  // 산물: 이름(굵게)과 그 아래 끓는점 태그
  const TXL = 190;
  const FONT = "'Pretendard Variable', Pretendard, sans-serif";
  for (const p of prod) {
    const ny = p.y + 4;
    S.label(sv, TXL, ny, p.name, { size: 14.5, weight: 800 });
    // 끓는점 태그(흰 바탕 알약)
    const fs = 13.5;
    const tw = p.range.length * fs * 0.62 + 12;
    const ty = ny + 5;
    S.el(sv, "rect", { x: TXL - 1, y: ty, width: tw, height: 18, rx: 9, fill: "#FFFFFF", stroke: p.bottom ? "#B8C0CA" : "#F0B48C", "stroke-width": 1.1 });
    S.el(sv, "text", { x: TXL + 5, y: ty + 13.4, "font-size": fs, "font-weight": 700, fill: p.bottom ? "#4E5968" : "#B4380D", "letter-spacing": "-0.01em", "font-family": FONT }, p.range);
  }
  // 왼쪽 라벨
  S.label(sv, 6, 22, "증류탑", { size: 14 });
  S.leader(sv, [[50, 18], [TL + 4, 36]], { dot: false });
  S.label(sv, 6, 66, "온도가\n낮아요", { size: 13.5, lh: 16, color: "#1864AB" });
  S.label(sv, 6, 228, "온도가\n높아요", { size: 13.5, lh: 16, color: "#C92A2A" });
  S.label(sv, 6, 150, "선반", { size: 13.5 });
  S.leader(sv, [[36, 146], [IL + 26, trays[3] + 1]]);
  S.label(sv, 6, 284, "가열로", { size: 13.5 });
  S.label(sv, 2, 402, "원유", { size: 13.5 });
}
