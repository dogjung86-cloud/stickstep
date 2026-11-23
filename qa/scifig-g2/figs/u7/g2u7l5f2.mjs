// g2u7l5f2 멀티탭 속 모습: 위에서 내려다보며 덮개를 비쳐 본 콘센트 넷짜리 멀티탭.
// 몸통을 따라 금속 띠 두 줄(뒤쪽 빨강, 앞쪽 파랑)이 지나고, 콘센트마다 왼쪽 구멍의 집게는 빨간 띠에, 오른쪽 구멍의 집게는 파란 띠에 팔로 이어진다.
// 그래서 꽂힌 기구는 모두 같은 두 띠 사이에 놓인다(병렬, 모두 220 V). 셋째 콘센트의 가습기 플러그를 뽑아도 나머지 셋은 그대로 두 띠에 물려 켜져 있다.
// 흐름은 화살촉 없이 노란 띠 굵기로만(집의 전기는 방향이 쉬지 않고 바뀐다): 노트북 3, 휴대 전화 1, 스피커 1 눈금, 멀티탭 전선 5 눈금(합).
// 검산 메모는 g2u7l5f2.md
import { COL, tube } from "./_lib.mjs";

export const meta = {
  key: "g2u7l5f2",
  w: 340,
  h: 386,
  alt: "위에서 덮개를 비쳐 본 콘센트 넷짜리 멀티탭 속에 빨간 금속 띠와 파란 금속 띠가 길게 지나고, 콘센트마다 왼쪽 구멍은 빨간 띠에, 오른쪽 구멍은 파란 띠에 이어져 있어요. 노트북, 휴대 전화, 스피커가 모두 같은 두 띠 사이에 이어져 220 V가 걸리고, 가습기 플러그를 뽑아도 나머지는 그대로 켜져 있어요. 멀티탭 전선에는 켜진 기구들의 전류를 더한 만큼 흘러요.",
};

const UNIT = 1.7; // 흐름 띠 한 눈금(px)

export default async function draw(root, kit) {
  const { paint: P, svg: S, noise: N } = kit;
  const { w, h } = meta;
  const t = P.canvas(w, h);
  root.appendChild(t.c);
  const ctx = t.ctx;
  const nz = N.makeNoise(91);
  const s = S.svgLayer(root, w, h);
  P.plate(t, nz, { top: "#FBFCFD", bottom: "#EEF1F5", grain: 0.012 });

  // ── 자리 ──
  const CX = [52, 128, 204, 280]; // 콘센트 가운데(왼쪽부터)
  const BODY = { x0: 14, x1: 318, y0: 214, y1: 286, r: 14 }; // 멀티탭 몸통(위에서 본 모습)
  const SY = 250; // 콘센트 가운데 높이
  const SR = 21; // 콘센트 오목 자리 반지름
  const HD = 8.5; // 구멍이 가운데에서 떨어진 거리
  const RED = 226, BLUE = 274; // 빨간 띠, 파란 띠
  const PLUG_R = 17;
  const DEV_Y = 58; // 기구 그림 아래 끝
  const dev = [
    { kind: "laptop", name: "노트북", on: true, amp: 3 },
    { kind: "phone", name: "휴대 전화", on: true, amp: 1 },
    { kind: "humid", name: "가습기", on: false, amp: 0 },
    { kind: "speaker", name: "스피커", on: true, amp: 1 },
  ];
  const total = dev.reduce((a, d) => a + (d.on ? d.amp : 0), 0); // 5 눈금
  if (total !== 5) throw new Error("흐름 합이 어긋남");

  // ── 그리기 도구 ──
  const rr = (x, y, ww, hh, r) => {
    ctx.beginPath();
    P.rrect(ctx, x, y, ww, hh, r);
  };
  const brass = (x0, y0, x1, y1, edge) => {
    // 놋쇠 띠(위에서 본 면) + 색 테두리
    ctx.save();
    rr(x0, y0, x1 - x0, y1 - y0, 1.6);
    ctx.fillStyle = P.lg(ctx, 0, y0, 0, y1, [[0, "#F6E09A"], [0.5, "#D4AA4A"], [1, "#9C7522"]]);
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  };
  const band = (pts, wd) => {
    // 흐름 띠(노랑, 진갈색 테두리, 화살촉 없음)
    if (wd <= 0) return;
    tube(ctx, pts, { w: wd + 1.6, edge: COL.curEdge, base: COL.cur, hi: "rgba(255,250,210,.9)", hiW: Math.max(0.5, wd * 0.25), cap: "round" });
  };
  const cord = (pts, col = "#E9ECEF") => tube(ctx, pts, { w: 4.2, edge: "#7B8794", base: col, hi: "rgba(255,255,255,.95)", cap: "round" });

  // ── 몸통 ──
  P.dropShadow(t, (c) => P.rrect(c, BODY.x0, BODY.y0, BODY.x1 - BODY.x0, BODY.y1 - BODY.y0, BODY.r), { dx: 2, dy: 4, blur: 7, a: 0.2 });
  ctx.save();
  rr(BODY.x0, BODY.y0, BODY.x1 - BODY.x0, BODY.y1 - BODY.y0, BODY.r);
  ctx.fillStyle = P.lg(ctx, 0, BODY.y0, 0, BODY.y1, [[0, "#FFFFFF"], [0.6, "#EEF1F5"], [1, "#D6DCE3"]]);
  ctx.fill();
  ctx.strokeStyle = "rgba(96,108,124,.7)";
  ctx.lineWidth = 1.1;
  ctx.stroke();
  // 비쳐 보이는 속(덮개 안쪽 바닥): 옅은 회청색
  rr(BODY.x0 + 6, BODY.y0 + 6, BODY.x1 - BODY.x0 - 12, BODY.y1 - BODY.y0 - 12, BODY.r - 6);
  ctx.fillStyle = "rgba(208,218,230,.55)";
  ctx.fill();
  ctx.restore();

  // ── 속: 금속 띠 두 줄, 콘센트마다 팔과 집게 ──
  const BX0 = BODY.x0 + 10, BX1 = BODY.x1 - 4; // 띠는 오른쪽 끝에서 전선 가닥과 만난다
  brass(BX0, RED - 3.5, BX1, RED + 3.5, "#E8604A");
  brass(BX0, BLUE - 3.5, BX1, BLUE + 3.5, "#3D86E0");
  for (const cx of CX) {
    // 왼쪽 구멍 → 빨간 띠(위로), 오른쪽 구멍 → 파란 띠(아래로)
    brass(cx - HD - 2.6, RED, cx - HD + 2.6, SY - 2, "#E8604A");
    brass(cx + HD - 2.6, SY + 2, cx + HD + 2.6, BLUE, "#3D86E0");
    // 집게(구멍 밑의 두 잎)
    for (const [hx, edge] of [[cx - HD, "#E8604A"], [cx + HD, "#3D86E0"]]) {
      ctx.save();
      for (const d of [-1, 1]) {
        rr(hx + d * 3.4 - 1.5, SY - 5, 3, 10, 1.2);
        ctx.fillStyle = P.lg(ctx, 0, SY - 5, 0, SY + 5, [[0, "#F6E09A"], [1, "#B8902E"]]);
        ctx.fill();
        ctx.strokeStyle = edge;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  // 멀티탭 전선 속 두 가닥이 띠 끝에 물린다(오른쪽 끝)
  {
    const ex = BODY.x1 - 2;
    tube(ctx, [[BX1 - 2, RED], [ex - 6, RED], [ex, SY - 3]], { w: 3, edge: "#8F2E1E", base: "#E8604A", hi: "rgba(255,220,210,.8)" });
    tube(ctx, [[BX1 - 2, BLUE], [ex - 6, BLUE], [ex, SY + 3]], { w: 3, edge: "#1F4F98", base: "#3D86E0", hi: "rgba(220,236,255,.8)" });
    for (const y of [RED, BLUE]) {
      ctx.beginPath();
      ctx.arc(BX1 - 6, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "#ADB5BD";
      ctx.fill();
      ctx.strokeStyle = "#495057";
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }

  // ── 덮개의 콘센트(비쳐 보이는 오목 자리, 접지 날개, 두 구멍) ──
  for (const cx of CX) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, SY, SR, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.42)";
    ctx.fill();
    ctx.strokeStyle = "rgba(104,118,136,.85)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(cx, SY, SR - 2, Math.PI * 1.05, Math.PI * 1.6);
    ctx.stroke();
    // 접지 날개(위아래 회색 금속)
    for (const d of [-1, 1]) {
      rr(cx - 5, SY + d * (SR - 3) - 2, 10, 4, 1.5);
      ctx.fillStyle = "#C3CAD2";
      ctx.fill();
      ctx.strokeStyle = "rgba(80,90,104,.7)";
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
    // 구멍 둘
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + d * HD, SY, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(40,46,56,.55)";
      ctx.fill();
    }
    ctx.restore();
  }

  // ── 플러그: 꽂힌 것은 콘센트 위에 투명하게(핀이 구멍에 든 모습), 뽑은 것은 위로 떨어져 있다 ──
  const plug = (cx, cy, inserted) => {
    ctx.save();
    if (!inserted) P.softShadow(t, cx + 2, cy + PLUG_R - 2, PLUG_R * 0.9, 3, 0.18);
    ctx.beginPath();
    ctx.arc(cx, cy, PLUG_R, 0, Math.PI * 2);
    ctx.fillStyle = inserted ? "rgba(255,255,255,.5)" : P.rg(ctx, cx - 5, cy - 5, 2, cx, cy, PLUG_R, [[0, "#FFFFFF"], [1, "#D9DFE6"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(84,96,112,.9)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, PLUG_R - 5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(84,96,112,.45)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // 핀 둘(꽂혔으면 구멍 속 회색 점, 뽑았으면 은색 원기둥 끝)
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + d * HD, cy, inserted ? 2.4 : 2.8, 0, Math.PI * 2);
      ctx.fillStyle = P.rg(ctx, cx + d * HD - 0.8, cy - 0.8, 0.2, cx + d * HD, cy, 3, [[0, "#FFFFFF"], [1, "#868E96"]]);
      ctx.fill();
      ctx.strokeStyle = "#495057";
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    ctx.restore();
  };

  // ── 기구 ──
  const devX = (i) => CX[i];
  const laptop = (cx, by, on) => {
    // 화면(뒤로 열린 판) + 자판 바닥
    const sw = 46, sh = 30, bw = 54, bh = 7;
    P.softShadow(t, cx + 2, by + 1, bw * 0.55, 3, 0.18);
    ctx.save();
    rr(cx - sw / 2, by - bh - sh, sw, sh, 3);
    ctx.fillStyle = P.lg(ctx, 0, by - bh - sh, 0, by - bh, [[0, "#3A4250"], [1, "#22272F"]]);
    ctx.fill();
    rr(cx - sw / 2 + 3, by - bh - sh + 3, sw - 6, sh - 6, 1.5);
    ctx.fillStyle = on ? P.lg(ctx, cx - sw / 2, by - bh - sh, cx + sw / 2, by - bh, [[0, "#9AD4FF"], [1, "#3D8FE8"]]) : "#111418";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2, by);
    ctx.lineTo(cx - sw / 2, by - bh);
    ctx.lineTo(cx + sw / 2, by - bh);
    ctx.lineTo(cx + bw / 2, by);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, 0, by - bh, 0, by, [[0, "#E9ECEF"], [1, "#ADB5BD"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(73,80,87,.7)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  };
  const phone = (cx, by, on) => {
    const pw = 22, ph = 40;
    P.softShadow(t, cx + 2, by + 1, pw * 0.7, 2.6, 0.18);
    ctx.save();
    rr(cx - pw / 2, by - ph, pw, ph, 5);
    ctx.fillStyle = P.lg(ctx, cx - pw / 2, 0, cx + pw / 2, 0, [[0, "#495057"], [1, "#212529"]]);
    ctx.fill();
    rr(cx - pw / 2 + 2.5, by - ph + 4, pw - 5, ph - 8, 2.5);
    ctx.fillStyle = on ? P.lg(ctx, 0, by - ph, 0, by, [[0, "#D3F9D8"], [1, "#8CE99A"]]) : "#111418";
    ctx.fill();
    if (on) {
      // 충전 중 번개 표시
      ctx.beginPath();
      ctx.moveTo(cx + 2, by - ph + 10);
      ctx.lineTo(cx - 4, by - ph / 2 + 2);
      ctx.lineTo(cx, by - ph / 2 + 2);
      ctx.lineTo(cx - 2, by - 10);
      ctx.lineTo(cx + 4, by - ph / 2 - 2);
      ctx.lineTo(cx, by - ph / 2 - 2);
      ctx.closePath();
      ctx.fillStyle = "#2B8A3E";
      ctx.fill();
    }
    ctx.restore();
  };
  const humid = (cx, by, on) => {
    // 둥근 통 + 뿜는 꼭지(꺼져 있어 김이 없다)
    const bw = 30, bh = 34;
    P.softShadow(t, cx + 2, by + 1, bw * 0.62, 3, 0.18);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2 + 2, by);
    ctx.lineTo(cx - bw / 2, by - bh + 8);
    ctx.quadraticCurveTo(cx - bw / 2, by - bh, cx - bw / 2 + 8, by - bh);
    ctx.lineTo(cx + bw / 2 - 8, by - bh);
    ctx.quadraticCurveTo(cx + bw / 2, by - bh, cx + bw / 2, by - bh + 8);
    ctx.lineTo(cx + bw / 2 - 2, by);
    ctx.closePath();
    ctx.fillStyle = P.lg(ctx, cx - bw / 2, 0, cx + bw / 2, 0, [[0, "#C5CDD6"], [0.3, "#F8F9FA"], [1, "#AEB7C2"]]);
    ctx.fill();
    ctx.strokeStyle = "rgba(73,80,87,.65)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    // 물통 창(물이 든 모습)
    rr(cx - 8, by - 20, 16, 13, 3);
    ctx.fillStyle = "rgba(116,192,252,.55)";
    ctx.fill();
    // 꼭지
    rr(cx - 5, by - bh - 6, 10, 7, 2.5);
    ctx.fillStyle = "#DEE2E6";
    ctx.fill();
    ctx.strokeStyle = "rgba(73,80,87,.6)";
    ctx.stroke();
    // 꺼진 불(회색 점)
    ctx.beginPath();
    ctx.arc(cx + 8, by - 26, 2, 0, Math.PI * 2);
    ctx.fillStyle = on ? "#40C057" : "#ADB5BD";
    ctx.fill();
    ctx.restore();
  };
  const speaker = (cx, by, on) => {
    const bw = 30, bh = 38;
    P.softShadow(t, cx + 2, by + 1, bw * 0.62, 3, 0.18);
    ctx.save();
    rr(cx - bw / 2, by - bh, bw, bh, 5);
    ctx.fillStyle = P.lg(ctx, cx - bw / 2, 0, cx + bw / 2, 0, [[0, "#5C677D"], [0.35, "#3B4456"], [1, "#232A36"]]);
    ctx.fill();
    for (const [yy, r] of [[by - bh + 10, 4.5], [by - 13, 9]]) {
      ctx.beginPath();
      ctx.arc(cx, yy, r, 0, Math.PI * 2);
      ctx.fillStyle = P.rg(ctx, cx - r * 0.3, yy - r * 0.3, 0.5, cx, yy, r, [[0, "#868E96"], [1, "#1B1F26"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(200,208,218,.6)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.restore();
    if (on) {
      // 소리 결(오른쪽 호 둘)
      ctx.save();
      ctx.strokeStyle = "rgba(61,134,224,.75)";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      for (const r of [7, 12]) {
        ctx.beginPath();
        ctx.arc(cx + bw / 2 + 1, by - 13, r, -0.6, 0.6);
        ctx.stroke();
      }
      ctx.restore();
    }
  };
  const DRAW = { laptop, phone, humid, speaker };

  // 전선과 흐름 띠(기구 → 플러그). 뽑은 플러그는 콘센트 위로 들려 있다.
  const LIFT = 178; // 뽑은 플러그 가운데 높이
  dev.forEach((d, i) => {
    const cx = devX(i);
    const py = d.on ? SY : LIFT;
    const top = DEV_Y + 50; // 이름표와 알약 아래에서 전선이 내려온다
    cord([[cx, top], [cx, py - PLUG_R + 1]]);
    if (d.on) band([[cx + 9, top + 6], [cx + 9, BODY.y0 - 8]], d.amp * UNIT);
  });
  // 플러그(뽑은 것은 덮개 위에 떠 있지 않게 몸통 위쪽 공중에)
  dev.forEach((d, i) => plug(devX(i), d.on ? SY : LIFT, d.on));
  // 기구 그림
  dev.forEach((d, i) => DRAW[d.kind](devX(i), DEV_Y, d.on));

  // ── 멀티탭 전선(오른쪽 끝에서 아래로)과 합친 흐름 ──
  const CORD = [[BODY.x1 - 1, SY], [BODY.x1 + 8, SY], [BODY.x1 + 12, SY + 14], [BODY.x1 + 12, h - 6]];
  // 고무 부싱
  ctx.save();
  rr(BODY.x1 - 3, SY - 6, 9, 12, 3);
  ctx.fillStyle = "#495057";
  ctx.fill();
  ctx.restore();
  tube(ctx, CORD.slice(1), { w: 6, edge: "#6C7682", base: "#F1F3F5", hi: "rgba(255,255,255,.95)", cap: "round" });
  band([[BODY.x1 + 3, SY + 30], [BODY.x1 + 3, h - 10]], total * UNIT);

  // ── 겹층: 알약, 이름, 화살표, 라벨 ──
  const FONT = "'Pretendard Variable', Pretendard, sans-serif";
  dev.forEach((d, i) => {
    const cx = devX(i);
    S.label(s, cx, DEV_Y + 18, d.name, { size: 13.5, anchor: "middle" });
    const txt = d.on ? "220 V" : "꺼짐";
    const pw = d.on ? 52 : 40;
    S.el(s, "rect", { x: cx - pw / 2, y: DEV_Y + 24, width: pw, height: 20, rx: 10, fill: d.on ? "#FFF3BF" : "#F1F3F5", stroke: d.on ? "#C99700" : "#ADB5BD", "stroke-width": 1.2 });
    S.el(s, "text", { x: cx, y: DEV_Y + 38.8, "text-anchor": "middle", "font-size": 13.5, "font-weight": 800, fill: d.on ? "#5C4300" : "#6C757D", "font-family": FONT }, txt);
  });
  // 뽑은 플러그: 위로 뺀 화살표
  {
    const cx = devX(2);
    S.rayArrow(s, [cx + PLUG_R + 6, SY - 4], [cx + PLUG_R + 6, LIFT + 8], { color: "#495057", w: 1.5, hl: 6, hw: 3.4 });
    S.label(s, cx + PLUG_R + 11, (SY + LIFT) / 2 + 4, "뽑음", { size: 13.5, color: "#495057" });
  }
  // 이름표
  S.label(s, 14, BODY.y1 + 24, "금속 띠", { size: 13.5 });
  S.leader(s, [[30, BODY.y1 + 11], [BX0 + 6, BLUE + 2]]);
  S.leader(s, [[16, BODY.y1 + 11], [7, BODY.y1 - 4], [7, RED], [BX0 + 4, RED]]);
  S.label(s, devX(2) - 34, BODY.y1 + 22, "콘센트", { size: 13.5, anchor: "middle" });
  S.leader(s, [[devX(2) - 34, BODY.y1 + 10], [devX(2) - 12, SY + 14]]);
  S.label(s, devX(1) - 40, SY - 30, "플러그", { size: 13.5, anchor: "end" });
  S.leader(s, [[devX(1) - 38, SY - 34], [devX(1) - 12, SY - 10]]);
  S.label(s, BODY.x1 + 2, h - 72, "멀티탭\n전선", { size: 13.5, anchor: "end", lh: 16 });
  S.label(s, BODY.x0, h - 34, "멀티탭 전선에는 켜진 기구들의\n전류를 더한 만큼 흘러요.", { size: 13.5, lh: 18, color: "#5C4300" });
  S.label(s, devX(0) + 14, DEV_Y + 74, "전류", { size: 13.5, color: "#8A5A00" });
}
