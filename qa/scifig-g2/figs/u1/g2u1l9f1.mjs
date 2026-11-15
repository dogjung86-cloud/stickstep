// g2u1l9f1 원유의 증류탑: 원유 탱크 → 가열로(약 350 ℃) → 증류탑 아래쪽으로 들어간다. 탑은 세로로 잘라 속을 보인다(선반, 덮개,
// 선반 위 액체, 넘친 액체가 내려가는 관, 위로 가는 기체와 아래로 가는 액체). 탑 옆 온도 띠는 아래가 붉고 위가 푸르다.
// 오른쪽에 높이마다 뽑아내는 관, 산물 이름, 끓는점 범위(한국석유공사, 2024), 작은 쓰임 그림. 검산 메모는 g2u1l9f1.md
export const meta = {
  key: "g2u1l9f1",
  w: 340,
  h: 412,
  alt: "가열로에서 데운 원유가 증류탑 아래쪽으로 들어가요. 탑을 세로로 자른 속에는 여러 층의 선반이 있어 기체는 위로, 액체는 아래로 움직여요. 탑은 아래가 뜨겁고 위로 갈수록 온도가 낮아서, 위에서부터 액화 석유 가스, 휘발유, 등유, 경유, 중유가 나오고 맨 아래로 찌꺼기가 빠져요.",
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
  const TX = 128, TR = 33; // 탑 가운데, 반지름(폭 66)
  const TL = TX - TR, TRt = TX + TR;
  const WIN0 = 44, WIN1 = 376; // 잘라 낸 창(위, 아래)
  const DOME = 26; // 지붕 꼭대기
  const SHELL0 = 40; // 몸통 위 끝
  const BASE = 388; // 받침
  const WALL = 3;
  const trays = [];
  for (let k = 0; k < 10; k++) trays.push(62 + k * 28); // 선반 높이(62 ~ 314)
  const FEED = 334; // 원유가 들어오는 높이(맨 아래 선반 밑)
  const POOL = 356; // 탑 바닥에 고인 찌꺼기 수면
  // 산물: 뽑는 높이(그 선반의 액체), 액체 색
  const prod = [
    { y: 32, name: "액화 석유 가스", range: "−42~1 ℃", use: "가정용, 자동차 연료", icon: "lpg", col: "#E7F5FF", gas: true },
    { y: trays[1] - 4, name: "휘발유", range: "30~120 ℃", use: "자동차 연료", icon: "car", col: "#FFF3BF" },
    { y: trays[3] - 4, name: "등유", range: "150~280 ℃", use: "항공기 연료", icon: "plane", col: "#FFE08A" },
    { y: trays[5] - 4, name: "경유", range: "230~350 ℃", use: "디젤 엔진 연료", icon: "truck", col: "#F6B94B" },
    { y: trays[7] - 4, name: "중유", range: "300 ℃ 이상", use: "공장, 배 연료", icon: "ship", col: "#B7702A" },
    { y: 368, name: "찌꺼기", range: "(아스팔트 원료)", use: "도로 포장", icon: "road", col: "#3A2A1E" },
  ];
  // 선반 위 액체 색: 높이에 따라 옅은 노랑 → 짙은 갈색
  const trayCol = (k) => ["#FFF6CC", "#FFF0B0", "#FFE48A", "#FFDA70", "#F8C45A", "#F1AE45", "#E2913A", "#C97733", "#AE6230", "#94512B"][k];
  // 온도 색(아래 붉음, 위 푸름): s = 0(위) ~ 1(아래)
  const tempStops = [[0, "#1C7ED6"], [0.3, "#74C0FC"], [0.55, "#FFD43B"], [0.78, "#FD7E14"], [1, "#E03131"]];

  // ── 왼쪽: 온도 띠 ──
  {
    const x = 78, y0 = 50, y1 = 372, bw = 9;
    P.dropShadow(t, (c) => P.rrect(c, x, y0, bw, y1 - y0, 4.5), { dx: 1, dy: 2, blur: 4, a: 0.18 });
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x, y0, bw, y1 - y0, 4.5);
    ctx.fillStyle = P.lg(ctx, 0, y0, 0, y1, tempStops);
    ctx.fill();
    ctx.fillStyle = P.lg(ctx, x, 0, x + bw, 0, [[0, "rgba(255,255,255,.45)"], [0.4, "rgba(255,255,255,.1)"], [1, "rgba(0,0,0,.12)"]]);
    ctx.fill();
    ctx.restore();
  }

  // ── 원유 탱크와 가열로(왼쪽 아래) ──
  const tank = { x: 4, y: 314, w: 46, h: 46 };
  {
    const { x, y, w: tw, h: th } = tank;
    P.softShadow(t, x + tw / 2 + 3, y + th + 2, tw * 0.62, 4, 0.22);
    ctx.save();
    // 몸통(흰 원통)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + th);
    ctx.ellipse(x + tw / 2, y + th, tw / 2, 4, 0, Math.PI, 0, true);
    ctx.lineTo(x + tw, y);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, x, 0, x + tw, 0, [[0, "#C5CDD6"], [0.3, "#F7F9FB"], [0.7, "#DDE3EA"], [1, "#A7B1BD"]]);
    ctx.fill();
    // 띠와 사다리
    ctx.strokeStyle = "rgba(110,122,138,.55)";
    ctx.lineWidth = 0.6;
    for (const yy of [y + 14, y + 30]) {
      ctx.beginPath();
      ctx.ellipse(x + tw / 2, yy, tw / 2, 4, 0, 0, Math.PI);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(80,92,108,.8)";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(x + tw - 9, y - 2);
    ctx.lineTo(x + tw - 9, y + th + 2);
    ctx.moveTo(x + tw - 5, y - 2);
    ctx.lineTo(x + tw - 5, y + th + 3);
    for (let yy = y + 2; yy < y + th; yy += 4) {
      ctx.moveTo(x + tw - 9, yy);
      ctx.lineTo(x + tw - 5, yy + 0.4);
    }
    ctx.stroke();
    // 지붕(얕은 원뿔)
    ctx.beginPath();
    ctx.ellipse(x + tw / 2, y, tw / 2, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = P.lg(ctx, x, y - 4, x + tw, y + 4, [[0, "#FFFFFF"], [1, "#B9C3CE"]]);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + tw / 2, y - 12, x + tw, y);
    ctx.ellipse(x + tw / 2, y, tw / 2, 4, 0, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, x, y - 10, x + tw, y, [[0, "#FFFFFF"], [0.6, "#DCE2E9"], [1, "#9EA9B6"]]);
    ctx.fill();
    // 원유 방울 표시
    const dx = x + tw / 2 - 4, dy = y + 24;
    ctx.beginPath();
    ctx.moveTo(dx, dy - 7);
    ctx.bezierCurveTo(dx + 3, dy - 3, dx + 5, dy, dx + 5, dy + 2);
    ctx.arc(dx, dy + 2, 5, 0, Math.PI);
    ctx.bezierCurveTo(dx - 5, dy, dx - 3, dy - 3, dx, dy - 7);
    ctx.fillStyle = P.rg(ctx, dx - 2, dy, 0.3, dx, dy + 1, 6, [[0, "#6B5040"], [1, "#1E1612"]]);
    ctx.fill();
    ctx.restore();
  }
  const fur = { x: 52, y: 344, w: 38, h: 34 };
  // 탱크 → 가열로 → 탑으로 가는 관
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
  pipe([[tank.x + tank.w - 2, tank.y + 36], [fur.x + 4, tank.y + 36], [fur.x + 4, fur.y + 8]]);
  // 가열로: 벽돌 상자, 앞 창 속에 불꽃과 구불구불한 관
  {
    const { x, y, w: fw, h: fh } = fur;
    P.softShadow(t, x + fw / 2 + 2, y + fh + 2, fw * 0.62, 3.5, 0.22);
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, x, y, fw, fh, 3);
    ctx.fillStyle = P.lg(ctx, x, y, x + fw, y + fh, [[0, "#B4583F"], [0.5, "#96432F"], [1, "#6F3020"]]);
    ctx.fill();
    // 벽돌 줄눈
    ctx.strokeStyle = "rgba(255,220,200,.22)";
    ctx.lineWidth = 0.5;
    for (let r = 1; r < 6; r++) {
      const yy = y + r * (fh / 6);
      ctx.beginPath();
      ctx.moveTo(x + 1, yy);
      ctx.lineTo(x + fw - 1, yy);
      ctx.stroke();
      for (let cI = 0; cI < 5; cI++) {
        const xx = x + ((cI + (r % 2) * 0.5) * fw) / 4.5;
        ctx.beginPath();
        ctx.moveTo(xx, yy - fh / 6);
        ctx.lineTo(xx, yy);
        ctx.stroke();
      }
    }
    // 불 창
    const wx = x + 6, wy = y + 9, ww = fw - 12, wh = fh - 13;
    ctx.beginPath();
    P.rrect(ctx, wx, wy, ww, wh, 2);
    ctx.fillStyle = "#2A1410";
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = P.rg(ctx, wx + ww / 2, wy + wh, 1, wx + ww / 2, wy + wh, wh * 1.1, [[0, "rgba(255,210,90,.95)"], [0.5, "rgba(255,120,40,.7)"], [1, "rgba(160,40,20,0)"]]);
    ctx.fillRect(wx, wy, ww, wh);
    for (let k = 0; k < 5; k++) {
      const fx = wx + 3 + k * (ww - 6) / 4, fh2 = wh * (0.55 + rnd() * 0.35);
      ctx.beginPath();
      ctx.moveTo(fx - 2.6, wy + wh);
      ctx.quadraticCurveTo(fx - 2, wy + wh - fh2 * 0.6, fx, wy + wh - fh2);
      ctx.quadraticCurveTo(fx + 2, wy + wh - fh2 * 0.6, fx + 2.6, wy + wh);
      ctx.fillStyle = P.lg(ctx, 0, wy + wh - fh2, 0, wy + wh, [[0, "rgba(255,240,170,.2)"], [0.5, "rgba(255,190,70,.95)"], [1, "rgba(255,120,40,1)"]]);
      ctx.fill();
    }
    // 불 위를 지나는 관(구불구불)
    ctx.strokeStyle = "#5E6772";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= 30; k++) {
      const s = k / 30, xx = wx + 1 + s * (ww - 2), yy = wy + 4 + Math.sin(s * Math.PI * 4) * 2;
      k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();
    ctx.restore();
  }
  // 가열로 → 탑 아래쪽
  pipe([[fur.x + fur.w - 4, fur.y + 8], [fur.x + fur.w - 4, FEED], [TL + 1, FEED]], 4.6, ["#B65E3C", "#F6C8A8", "#7A3A22"]);

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
  // 잘라 낸 속: 안쪽 뒷벽(아래는 붉게 달아 있고 위로 갈수록 식는다)
  const IL = TL + WALL, IR = TRt - WALL;
  ctx.save();
  ctx.beginPath();
  ctx.rect(IL, WIN0, IR - IL, WIN1 - WIN0);
  ctx.clip();
  ctx.fillStyle = P.lg(ctx, IL, 0, IR, 0, [[0, "#2C333B"], [0.5, "#49525D"], [0.85, "#5D6772"], [1, "#3B434C"]]);
  ctx.fillRect(IL, WIN0, IR - IL, WIN1 - WIN0);
  ctx.fillStyle = P.lg(ctx, 0, WIN0, 0, WIN1, [[0, "rgba(80,150,230,.30)"], [0.45, "rgba(255,210,90,.10)"], [0.8, "rgba(255,120,40,.26)"], [1, "rgba(240,60,40,.38)"]]);
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
    const dcW = 11;
    const plateL = dcLeft ? IL + dcW : IL, plateR = dcLeft ? IR : IR - dcW;
    // 내려가는 관(칸막이와 벽 사이로 액체가 떨어진다): 이 선반에서 아래 선반 바로 위까지
    const nextY = k < trays.length - 1 ? trays[k + 1] : FEED - 6;
    const bx = dcLeft ? IL + dcW : IR - dcW;
    const lc = trayCol(k);
    ctx.fillStyle = P.css(P.hex(lc), 0.75);
    if (dcLeft) ctx.fillRect(IL, ty - 1, dcW - 0.6, nextY - ty - 3);
    else ctx.fillRect(IR - dcW + 0.6, ty - 1, dcW - 0.6, nextY - ty - 3);
    liquidArrows.push([[dcLeft ? IL + dcW / 2 - 0.5 : IR - dcW / 2 + 0.5, ty + 3], [dcLeft ? IL + dcW / 2 - 0.5 : IR - dcW / 2 + 0.5, nextY - 6]]);
    // 칸막이
    ctx.fillStyle = "#C3CBD4";
    ctx.fillRect(bx - 0.7, ty - 4, 1.4, nextY - ty);
    // 판 위 액체(얕게 고인다, 넘침 둑 높이까지)
    ctx.fillStyle = P.lg(ctx, 0, ty - 4, 0, ty, [[0, P.css(P.hex(lc), 0.9)], [1, P.css(P.srgb(P.mixc(P.lin(P.hex(lc)), [0, 0, 0], 0.25)), 0.95)]]);
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
    // 덮개: 판 구멍 위의 뒤집힌 컵, 가장자리로 기체가 거품이 되어 액체를 뚫는다.
    // 위 선반에서 액체가 내려오는 관(내려가는 관)의 아래 자리에는 덮개도 기체 화살표도 두지 않는다(그 관으로는 액체만 내려간다)
    const nCap = 3;
    const inlet = k === 0 ? null : (k - 1) % 2 === 0 ? [IL, IL + dcW] : [IR - dcW, IR]; // 위 선반의 내려가는 관이 차지한 가로 자리
    for (let c = 0; c < nCap; c++) {
      const cx = plateL + ((plateR - plateL) * (c + 0.5)) / nCap;
      if (inlet && cx + 6.5 > inlet[0] && cx - 6.5 < inlet[1]) {
        rnd();
        rnd(); // 거품 자리 난수 몫은 넘겨 다른 덮개의 거품을 그대로 둔다
        continue;
      }
      ctx.fillStyle = P.lg(ctx, cx - 4, ty - 8, cx + 4, ty - 3, [[0, "#F4F6F8"], [0.5, "#B9C2CC"], [1, "#7D8794"]]);
      ctx.beginPath();
      ctx.moveTo(cx - 4.2, ty - 2.2);
      ctx.lineTo(cx - 4.2, ty - 5.5);
      ctx.quadraticCurveTo(cx - 4.2, ty - 8.6, cx, ty - 8.6);
      ctx.quadraticCurveTo(cx + 4.2, ty - 8.6, cx + 4.2, ty - 5.5);
      ctx.lineTo(cx + 4.2, ty - 2.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.85)";
      for (const dx of [-5.6, 5.6]) {
        ctx.beginPath();
        ctx.arc(cx + dx, ty - 2.6 - rnd() * 1.2, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      if (k > 0) vaporArrows.push([[cx, ty - 10], [cx, trays[k - 1] + 6]]);
    }
  });
  // 맨 아래 선반 밑: 원유가 들어오는 곳(일부는 기체로 위로, 일부는 액체로 아래로)
  {
    const lastY = trays[trays.length - 1];
    for (const c of [0.3, 0.7]) vaporArrows.push([[IL + (IR - IL) * c, FEED - 4], [IL + (IR - IL) * c, lastY + 6]]);
    liquidArrows.push([[TX + 4, FEED + 4], [TX + 4, POOL - 3]]);
    // 맨 위 선반 위: 남은 기체가 지붕 출구로
    vaporArrows.push([[TX, trays[0] - 10], [TX, WIN0 + 3]]);
  }
  ctx.restore();
  // 잘린 철판 테두리(양옆 두께)
  ctx.save();
  ctx.fillStyle = "#E1E6EC";
  ctx.strokeStyle = "rgba(70,80,92,.8)";
  ctx.lineWidth = 0.6;
  for (const x of [TL, IR]) {
    ctx.fillRect(x, WIN0, WALL, WIN1 - WIN0);
    ctx.strokeRect(x, WIN0, WALL, WIN1 - WIN0);
  }
  // 창의 위아래 자른 선
  ctx.strokeStyle = "rgba(70,80,92,.8)";
  ctx.beginPath();
  ctx.moveTo(TL, WIN0);
  ctx.lineTo(TRt, WIN0);
  ctx.moveTo(TL, WIN1);
  ctx.lineTo(TRt, WIN1);
  ctx.stroke();
  ctx.restore();

  // ── 오른쪽: 뽑아내는 관 ──
  const PX1 = 184; // 관 끝
  for (const p of prod) {
    let pts;
    if (p.gas) pts = [[TX, DOME + 1], [TX, 20], [TX + 8, 16], [PX1 - 6, 16], [PX1 - 6, p.y]];
    else if (p.icon === "road") pts = [[IR - 2, p.y], [PX1, p.y]];
    else pts = [[TRt - 1, p.y], [PX1, p.y]];
    if (p.gas) pipe([[TX, DOME + 2], [TX, 18], [PX1, 18]], 4);
    else pipe(pts, 4);
    // 관 끝 이음매(밸브)
    const ey = p.gas ? 18 : p.y;
    ctx.save();
    ctx.beginPath();
    P.rrect(ctx, PX1 - 2, ey - 4.2, 4.4, 8.4, 1.2);
    ctx.fillStyle = P.lg(ctx, 0, ey - 4, 0, ey + 4, [[0, "#C3CBD4"], [0.4, "#F4F6F8"], [1, "#6C7682"]]);
    ctx.fill();
    ctx.restore();
    // 관 속 산물 색 띠(무엇이 나오는지)
    ctx.save();
    ctx.strokeStyle = P.css(P.hex(p.col), p.gas ? 0.9 : 0.95);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    if (p.gas) {
      ctx.moveTo(TX + 6, 18);
      ctx.lineTo(PX1 - 5, 18);
    } else {
      ctx.moveTo(TRt + 2, p.y);
      ctx.lineTo(PX1 - 5, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ── 쓰임 그림(작은 그림) ──
  const icon = (kind, x, y) => {
    ctx.save();
    ctx.translate(x, y);
    const wheel = (wx, wy, r) => {
      ctx.beginPath();
      ctx.arc(wx, wy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#24292F";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(wx, wy, r * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = "#AEB6C0";
      ctx.fill();
    };
    if (kind === "lpg") {
      // 가스통
      ctx.beginPath();
      P.rrect(ctx, 6, -9, 10, 15, 3.5);
      ctx.fillStyle = P.lg(ctx, 6, 0, 16, 0, [[0, "#9AA4B0"], [0.35, "#FFFFFF"], [1, "#8C96A2"]]);
      ctx.fill();
      ctx.fillStyle = "#E8590C";
      ctx.fillRect(6, -3, 10, 2.4);
      ctx.fillStyle = "#59636E";
      ctx.fillRect(9.6, -12, 2.8, 3);
      ctx.fillRect(8.2, -12.8, 5.6, 1.4);
    } else if (kind === "car") {
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(1, -2);
      ctx.lineTo(6, -3);
      ctx.lineTo(9, -7);
      ctx.lineTo(17, -7);
      ctx.lineTo(21, -3);
      ctx.lineTo(24, -2);
      ctx.lineTo(24, 2);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, -7, 0, 2, [[0, "#74C0FC"], [0.5, "#339AF0"], [1, "#1864AB"]]);
      ctx.fill();
      ctx.fillStyle = "rgba(230,245,255,.95)";
      ctx.beginPath();
      ctx.moveTo(9.6, -6);
      ctx.lineTo(12.6, -6);
      ctx.lineTo(12.6, -3.2);
      ctx.lineTo(7.4, -3.2);
      ctx.closePath();
      ctx.moveTo(13.6, -6);
      ctx.lineTo(16.6, -6);
      ctx.lineTo(19.4, -3.2);
      ctx.lineTo(13.6, -3.2);
      ctx.closePath();
      ctx.fill();
      wheel(5.5, 2.4, 2.6);
      wheel(18.5, 2.4, 2.6);
    } else if (kind === "plane") {
      ctx.fillStyle = P.lg(ctx, 0, -5, 0, 2, [[0, "#FFFFFF"], [1, "#B9C3CE"]]);
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.quadraticCurveTo(2, -4, 6, -4);
      ctx.lineTo(20, -4);
      ctx.lineTo(24, -10);
      ctx.lineTo(26, -10);
      ctx.lineTo(25, -3);
      ctx.quadraticCurveTo(25, 0.5, 21, 0.5);
      ctx.lineTo(5, 0.5);
      ctx.quadraticCurveTo(1, 0.5, 0, -1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(90,105,125,.7)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.fillStyle = "#8C96A2";
      ctx.beginPath();
      ctx.moveTo(10, -1.4);
      ctx.lineTo(16, -1.4);
      ctx.lineTo(11, 4);
      ctx.lineTo(8.4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4DABF7";
      for (let k = 0; k < 5; k++) ctx.fillRect(6 + k * 2.6, -3, 1.4, 1.2);
    } else if (kind === "truck") {
      ctx.fillStyle = P.lg(ctx, 0, -9, 0, 1, [[0, "#F8F9FA"], [1, "#BAC3CD"]]);
      ctx.fillRect(0, -9, 16, 10);
      ctx.strokeStyle = "rgba(90,105,125,.6)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(0, -9, 16, 10);
      ctx.beginPath();
      ctx.moveTo(17, 1);
      ctx.lineTo(17, -6);
      ctx.lineTo(21.5, -6);
      ctx.lineTo(24, -2);
      ctx.lineTo(24, 1);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, -6, 0, 1, [[0, "#FF8787"], [1, "#C92A2A"]]);
      ctx.fill();
      ctx.fillStyle = "rgba(230,245,255,.95)";
      ctx.fillRect(18.4, -5, 3, 2.4);
      wheel(4, 2, 2.3);
      wheel(11, 2, 2.3);
      wheel(20.5, 2, 2.3);
    } else if (kind === "ship") {
      ctx.fillStyle = P.lg(ctx, 0, -8, 0, -3, [[0, "#FFFFFF"], [1, "#C5CDD6"]]);
      ctx.fillRect(11, -8, 9, 5);
      ctx.strokeStyle = "rgba(80,92,108,.7)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(11, -8, 9, 5);
      ctx.fillStyle = "#4DABF7";
      for (let k = 0; k < 3; k++) ctx.fillRect(12.4 + k * 2.6, -6.6, 1.4, 1.3);
      ctx.fillStyle = P.lg(ctx, 15, 0, 18, 0, [[0, "#E03131"], [1, "#A51D1D"]]);
      ctx.fillRect(15, -11.6, 2.8, 3.8);
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(25, -3);
      ctx.lineTo(22, 2.5);
      ctx.lineTo(2.5, 2.5);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, -3, 0, 2.5, [[0, "#495057"], [1, "#212529"]]);
      ctx.fill();
      ctx.fillStyle = "#C92A2A";
      ctx.fillRect(1.4, 0.6, 22, 1.4);
      ctx.strokeStyle = "rgba(77,171,247,.8)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-1, 4);
      ctx.quadraticCurveTo(3, 3, 7, 4);
      ctx.quadraticCurveTo(11, 5, 15, 4);
      ctx.quadraticCurveTo(19, 3, 26, 4);
      ctx.stroke();
    } else if (kind === "road") {
      ctx.beginPath();
      ctx.moveTo(2, 3);
      ctx.lineTo(9, -7);
      ctx.lineTo(16, -7);
      ctx.lineTo(25, 3);
      ctx.closePath();
      ctx.fillStyle = P.lg(ctx, 0, -7, 0, 3, [[0, "#5C636B"], [1, "#2F343A"]]);
      ctx.fill();
      ctx.strokeStyle = "#FFE066";
      ctx.lineWidth = 0.9;
      for (const [a, b] of [[-6, -3.6], [-2.2, 0.6]]) {
        ctx.beginPath();
        ctx.moveTo(12.5, a);
        ctx.lineTo(12.6, b);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // ── 겹층: 화살표와 라벨 ──
  const sv = S.svgLayer(root, w, h);
  for (const [a, b] of vaporArrows) S.rayArrow(sv, a, b, { color: "#F1F6FB", w: 1.3, hl: 4.6, hw: 2.8 });
  for (const [a, b] of liquidArrows) S.rayArrow(sv, a, b, { color: "#7A4A1C", w: 1.3, hl: 4.6, hw: 2.8 });
  // 원유가 들어가는 화살표
  S.rayArrow(sv, [TL - 14, FEED], [TL + 2, FEED], { color: "#C2410C", w: 1.6, hl: 5, hw: 3.2 });
  // 산물 줄
  const TXL = 190;
  const FONT = "'Pretendard Variable', Pretendard, sans-serif";
  for (const p of prod) {
    const y = p.gas ? 30 : p.y + 4.5;
    const tx = S.el(sv, "text", { x: TXL, y, "font-size": 14, "font-weight": 800, fill: "#26303D", "letter-spacing": "-0.01em", "font-family": FONT, "paint-order": "stroke", stroke: "#fff", "stroke-width": 3.4, "stroke-linejoin": "round" });
    S.el(tx, "tspan", {}, p.name + " ");
    S.el(tx, "tspan", { "font-size": 13.5, "font-weight": 700, fill: "#B4380D" }, p.range);
    S.label(sv, TXL + 30, y + 17, p.use, { size: 13.5, weight: 600, color: "#4E5968" });
  }
  // 왼쪽 라벨
  S.label(sv, 6, 20, "증류탑", { size: 14 });
  S.leader(sv, [[50, 15], [TL - 2, 30]], { dot: false });
  S.label(sv, 6, 62, "온도가\n낮아요", { size: 13.5, lh: 16, color: "#1864AB" });
  S.label(sv, 6, 252, "온도가\n높아요", { size: 13.5, lh: 16, color: "#C92A2A" });
  S.label(sv, 6, 166, "선반", { size: 13.5 });
  S.leader(sv, [[34, 162], [IL + 22, trays[4] + 1]]);
  S.label(sv, tank.x + tank.w / 2, 384, "원유", { size: 13.5, anchor: "middle" });
  S.label(sv, fur.x + fur.w / 2, 398, "가열로", { size: 13.5, anchor: "middle" });
  // 쓰임 그림은 글자 옆 캔버스 위에(라벨 뒤 할로와 겹치지 않게 미리 계산한 자리)
  for (const p of prod) icon(p.icon, TXL - 1, (p.gas ? 30 : p.y + 4.5) + 15);
}
