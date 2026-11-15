// @ts-nocheck
// 중2 Ⅶ 전기와 자기 단원 종합 평가(v3, 2026-11) 그림. 전부 코드로 그린 SVG이고 수치와 방향은 인자로 받는다.
// 캔버스는 폭 380 이하로 잡아, 폰의 그림 칸(.q-figure-art, 높이 220 제한)과 넓은 화면의 왼쪽 칸에 한 벌로 쓴다.
// 방향이 답인 그림(코일의 극, 도선이 받는 힘, 전동기)은 인자에서 계산한다. 눈대중으로 좌표를 고치지 않는다.
// 앞부분은 공용 부품과 공용 그림(FIG.kit, FIG.circuit 등), 뒷부분은 레슨별 그림(FIG.l1_… ~ FIG.l8_…)이다.
// 타입 검사를 끈 까닭: 판정용 페이지에서 쓰던 자바스크립트 그림 코드를 그대로 옮겨 왔다. 바깥에 내놓는 함수 셋만 타입을 단다.
const FIG: any = (function () {
  'use strict';
  const INK = '#2b3545', SUB = '#667085', POS = '#e5484d', NEG = '#2f7fe0', COPPER = '#cf7a3c', CUR = '#e8590c';
  const FONT = "'Pretendard','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif";
  const r2 = n => Math.round(n * 100) / 100;

  const DEFS = `<defs>
<linearGradient id="g-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset=".45" stop-color="#d5dbe3"/><stop offset="1" stop-color="#9ea8b5"/></linearGradient>
<linearGradient id="g-rod" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ddd4ff"/><stop offset=".5" stop-color="#b9a7f5"/><stop offset="1" stop-color="#9580e0"/></linearGradient>
<radialGradient id="g-ball" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#d6dce4"/><stop offset="1" stop-color="#939eac"/></radialGradient>
<radialGradient id="g-foam" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef2f7"/><stop offset="1" stop-color="#c7d0dc"/></radialGradient>
<radialGradient id="g-bulb" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fffef4"/><stop offset="1" stop-color="#ffe38a"/></radialGradient>
<linearGradient id="g-n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f47a7d"/><stop offset="1" stop-color="#d93a40"/></linearGradient>
<linearGradient id="g-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6aa6f5"/><stop offset="1" stop-color="#2b6fd6"/></linearGradient>
<linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfe9f9" stop-opacity=".8"/><stop offset=".5" stop-color="#f3fafe" stop-opacity=".5"/><stop offset="1" stop-color="#bfe0f5" stop-opacity=".85"/></linearGradient>
<linearGradient id="g-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6c79a"/><stop offset="1" stop-color="#b98d55"/></linearGradient>
<linearGradient id="g-batt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#667286"/><stop offset=".5" stop-color="#3b4556"/><stop offset="1" stop-color="#242c39"/></linearGradient>
<linearGradient id="g-battcap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdb8f"/><stop offset="1" stop-color="#e09a2b"/></linearGradient>
<linearGradient id="g-kettle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef2f6"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd7e0"/></linearGradient>
</defs>`;

  function svg(W, H, body, label) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}" role="img" aria-label="${label || '문항 그림'}">${DEFS}${body}</svg>`;
  }
  function T(x, y, s, o = {}) {
    const halo = o.halo === false ? '' : ` stroke="#fff" stroke-width="${o.haloW || 4}" stroke-linejoin="round" paint-order="stroke"`;
    return `<text x="${r2(x)}" y="${r2(y)}" font-size="${o.size || 15}" font-weight="${o.weight || 600}" fill="${o.fill || INK}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="central"${halo}>${s}</text>`;
  }
  function arrow(x1, y1, x2, y2, o = {}) {
    const c = o.color || INK, w = o.w || 2.4, h = o.head || (w * 3.4 + 3);
    const a = Math.atan2(y2 - y1, x2 - x1), ca = Math.cos(a), sa = Math.sin(a);
    const bx = x2 - h * ca, by = y2 - h * sa, px = -sa * h * 0.52, py = ca * h * 0.52;
    return `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(bx + ca)}" y2="${r2(by + sa)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>` +
      `<polygon points="${r2(x2)},${r2(y2)} ${r2(bx + px)},${r2(by + py)} ${r2(bx - px)},${r2(by - py)}" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/>`;
  }
  function plus(x, y, r = 8) {
    return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${POS}" stroke="#fff" stroke-width="1.3"/><path d="M${r2(x - r * 0.52)} ${r2(y)}H${r2(x + r * 0.52)}M${r2(x)} ${r2(y - r * 0.52)}V${r2(y + r * 0.52)}" stroke="#fff" stroke-width="${r2(r * 0.28)}" stroke-linecap="round"/>`;
  }
  function minus(x, y, r = 8) {
    return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${NEG}" stroke="#fff" stroke-width="1.3"/><path d="M${r2(x - r * 0.52)} ${r2(y)}H${r2(x + r * 0.52)}" stroke="#fff" stroke-width="${r2(r * 0.28)}" stroke-linecap="round"/>`;
  }
  const sign = (k, x, y, r) => (k === '+' ? plus(x, y, r) : minus(x, y, r));
  function rows(arr, cx, cy, dx, dy, r) {
    let s = '';
    arr.forEach((row, ri) => {
      const y = cy + (ri - (arr.length - 1) / 2) * dy;
      [...row].forEach((ch, i) => { s += sign(ch, cx + (i - (row.length - 1) / 2) * dx, y, r); });
    });
    return s;
  }
  function poly(pts, fill, o = {}) {
    return `<polygon points="${pts.map(p => r2(p[0]) + ',' + r2(p[1])).join(' ')}" fill="${fill}" stroke="${o.stroke || INK}" stroke-width="${o.sw || 2}" stroke-linejoin="round"/>`;
  }
  function line2(pts, color, w, o = {}) {
    return `<polyline points="${pts.map(p => r2(p[0]) + ',' + r2(p[1])).join(' ')}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="${o.cap || 'round'}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
  }
  const copperLine = (pts, w = 4.2) => line2(pts, INK, w + 2.6) + line2(pts, COPPER, w);

  /* ---------- 정전기 부품 ---------- */
  function rod(cx, cy, len, ang, o = {}) {
    const h = o.h || 22;
    let s = `<g transform="rotate(${ang} ${cx} ${cy})"><rect x="${cx - len / 2}" y="${cy - h / 2}" width="${len}" height="${h}" rx="${h / 2}" fill="url(#g-rod)" stroke="${INK}" stroke-width="2"/>`;
    if (o.sign) {
      const n = o.n || 4;
      for (let i = 0; i < n; i++) s += sign(o.sign, cx - len / 2 + len * (i + 0.8) / (n + 0.6), cy, 7);
    }
    return s + '</g>';
  }
  function fur(cx, cy, rx, ry) {
    const n = 24; let d = '';
    for (let i = 0; i <= n; i++) {
      const a = i / n * Math.PI * 2, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
      if (i === 0) { d += `M${r2(x)} ${r2(y)}`; continue; }
      const am = (i - 0.5) / n * Math.PI * 2;
      d += `Q${r2(cx + (rx + 11) * Math.cos(am))} ${r2(cy + (ry + 11) * Math.sin(am))} ${r2(x)} ${r2(y)}`;
    }
    return `<path d="${d}Z" fill="#e3c39a" stroke="#8a6238" stroke-width="2" stroke-linejoin="round"/>`;
  }
  function support(x0, x1, y) {
    return `<rect x="${x0}" y="${y - 6}" width="${x1 - x0}" height="12" rx="6" fill="url(#g-wood)" stroke="${INK}" stroke-width="2"/>`;
  }
  const string = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#7b8696" stroke-width="1.8"/>`;
  function electroscope(cx, py, o = {}) {
    const la = o.leaf == null ? 7 : o.leaf, top = py + 26, bc = py + 112, s = [];
    s.push(`<path d="M${cx - 15} ${top}V${top + 20}C${cx - 15} ${top + 38} ${cx - 64} ${top + 44} ${cx - 64} ${bc + 6}C${cx - 64} ${bc + 50} ${cx - 34} ${bc + 62} ${cx} ${bc + 62}C${cx + 34} ${bc + 62} ${cx + 64} ${bc + 50} ${cx + 64} ${bc + 6}C${cx + 64} ${top + 44} ${cx + 15} ${top + 38} ${cx + 15} ${top + 20}V${top}Z" fill="url(#g-glass)" stroke="#6f9dbd" stroke-width="2"/>`);
    s.push(`<rect x="${cx - 3.5}" y="${py}" width="7" height="${bc - py - 18}" fill="url(#g-metal)" stroke="${INK}" stroke-width="1.6"/>`);
    s.push(`<path d="M${cx - 18} ${top - 5}H${cx + 18}L${cx + 14} ${top + 16}H${cx - 14}Z" fill="#4a5362" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`);
    s.push(`<ellipse cx="${cx}" cy="${py + 4}" rx="38" ry="8.5" fill="#9ea8b5" stroke="${INK}" stroke-width="1.8"/><ellipse cx="${cx}" cy="${py}" rx="38" ry="8.5" fill="url(#g-metal)" stroke="${INK}" stroke-width="1.8"/>`);
    const ly = bc - 18, L = 52, a = la * Math.PI / 180;
    for (const sg of [-1, 1]) {
      const x2 = r2(cx + sg * L * Math.sin(a)), y2 = r2(ly + L * Math.cos(a));
      s.push(`<line x1="${cx}" y1="${ly}" x2="${x2}" y2="${y2}" stroke="#8a6a12" stroke-width="6" stroke-linecap="round"/><line x1="${cx}" y1="${ly}" x2="${x2}" y2="${y2}" stroke="#f2c230" stroke-width="3.6" stroke-linecap="round"/>`);
    }
    return s.join('');
  }
  const leader = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${SUB}" stroke-width="1.3"/>`;

  /* ---------- 회로 부품 ---------- */
  const wire = pts => line2(pts, INK, 2.6);
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="3.8" fill="${INK}"/>`;
  function battery(x, y, o = {}) {
    const w = 60, h = 26, pl = !o.plusRight, bx = x - w / 2, by = y - h / 2;
    const capx = pl ? bx : bx + w - 20, nubx = pl ? bx - 6 : bx + w;
    let s = `<rect x="${nubx}" y="${y - 6}" width="6" height="12" rx="2" fill="#c9ced6" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="5" fill="url(#g-batt)" stroke="${INK}" stroke-width="2"/>`;
    s += `<rect x="${capx}" y="${by}" width="20" height="${h}" rx="5" fill="url(#g-battcap)" stroke="${INK}" stroke-width="2"/>`;
    s += `<rect x="${bx + 5}" y="${by + 4.5}" width="${w - 10}" height="3" rx="1.5" fill="#fff" opacity=".35"/>`;
    if (o.labels !== false) {
      const ly = o.labelBelow ? by + h + 13 : by - 12;
      s += T(pl ? bx + 2 : bx + w - 2, ly, '(+)', { size: 13.5 }) + T(pl ? bx + w - 2 : bx + 2, ly, '(−)', { size: 13.5 });
    }
    return s;
  }
  function bulb(x, y, o = {}) {
    const r = o.r || 17;
    let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g-bulb)" stroke="${INK}" stroke-width="2"/>`;
    s += `<path d="M${x - r} ${y}H${x - 8}q4 -13 8 0q4 -13 8 0H${x + r}" fill="none" stroke="#b7791f" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (o.label) s += T(x, y - r - 13, o.label, { size: 14.5, weight: 700 });
    return s;
  }
  function resistor(x, y, o = {}) {
    let s = `<rect x="${x - 30}" y="${y - 11}" width="60" height="22" rx="5" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    s += line2([[x - 30, y], [x - 22, y], [x - 17, y - 6], [x - 9, y + 6], [x - 1, y - 6], [x + 7, y + 6], [x + 15, y - 6], [x + 20, y], [x + 30, y]], COPPER, 2.2);
    if (o.label) s += T(x, y - 26, o.label, { size: 14 });
    return s;
  }
  function meter(x, y, ch, o = {}) {
    let s = `<circle cx="${x}" cy="${y}" r="17" fill="#fff" stroke="${INK}" stroke-width="2"/>` + T(x, y + 0.5, ch, { size: 17, weight: 800, halo: false });
    if (o.read) {
      const rx = o.rx == null ? x : o.rx, ry = o.ry == null ? y + 34 : o.ry, w = o.rw || 58;
      s += `<rect x="${rx - w / 2}" y="${ry - 12}" width="${w}" height="24" rx="6" fill="#eef4ff" stroke="#9db7e0" stroke-width="1.4"/>` + T(rx, ry, o.read, { size: 14, halo: false, fill: '#1f4e96', weight: 700 });
    }
    if (o.label) s += T(o.lx == null ? x : o.lx, o.ly == null ? y - 30 : o.ly, o.label, { size: 13.5 });
    return s;
  }
  function sw(x, y, o = {}) {
    let s = `<rect x="${x - 18}" y="${y - 5}" width="36" height="10" fill="#fff"/>`;
    s += o.open ? `<line x1="${x - 18}" y1="${y}" x2="${x + 13}" y2="${y - 17}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`
      : `<line x1="${x - 18}" y1="${y}" x2="${x + 18}" y2="${y}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    s += `<circle cx="${x - 18}" cy="${y}" r="4.2" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${x + 18}" cy="${y}" r="4.2" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    if (o.label) s += T(x, y - 28, o.label, { size: 14.5, weight: 700 });
    return s;
  }
  const loop = (l, t, r, b) => wire([[l, t], [r, t], [r, b], [l, b], [l, t]]);
  const caption = (x, y, s) => T(x, y, s, { size: 15, weight: 700 });

  /* ---------- 그래프 ---------- */
  function graph(o) {
    const W = o.W || 430, H = o.H || 330, L = 62, R = 46, Tm = 46, B = 54, pw = W - L - R, ph = H - Tm - B;
    const X = v => L + v / o.xmax * pw, Y = v => Tm + ph - v / o.ymax * ph;
    let s = `<rect x="${L}" y="${Tm}" width="${pw}" height="${ph}" fill="#fbfcfe"/>`;
    const nx = Math.round(o.xmax / o.xstep), ny = Math.round(o.ymax / o.ystep);
    for (let i = 1; i <= nx; i++) { const v = i * o.xstep; s += `<line x1="${r2(X(v))}" y1="${Tm}" x2="${r2(X(v))}" y2="${Tm + ph}" stroke="#dbe2ea" stroke-width="1"/>` + T(X(v), Tm + ph + 16, v.toFixed(o.xdec || 0), { size: 13, weight: 500, halo: false }); }
    for (let i = 1; i <= ny; i++) { const v = i * o.ystep; s += `<line x1="${L}" y1="${r2(Y(v))}" x2="${L + pw}" y2="${r2(Y(v))}" stroke="#dbe2ea" stroke-width="1"/>` + T(L - 9, Y(v), v.toFixed(o.ydec || 0), { size: 13, weight: 500, halo: false, anchor: 'end' }); }
    s += T(L - 10, Tm + ph + 15, '0', { size: 13, weight: 500, halo: false });
    s += arrow(L, Tm + ph, L + pw + 22, Tm + ph, { w: 2 }) + arrow(L, Tm + ph, L, Tm - 22, { w: 2 });
    s += T(L, Tm - 34, o.ylabel, { size: 14 }) + T(L + pw + 24, Tm + ph + 36, o.xlabel, { size: 14, anchor: 'end' });
    (o.lines || []).forEach(ln => {
      const k = ln.to[1] / ln.to[0], xe = Math.min(o.xmax, o.ymax / k), ye = k * xe;
      s += `<line x1="${L}" y1="${Tm + ph}" x2="${r2(X(xe))}" y2="${r2(Y(ye))}" stroke="${ln.color}" stroke-width="3.2" stroke-linecap="round"/>`;
      if (ln.label) { const top = ye >= o.ymax - 1e-9; s += T(X(xe) + (top ? 14 : 15), Y(ye) + (top ? -2 : 0), ln.label, { size: 15.5, weight: 800, fill: ln.color }); }
    });
    return svg(W, H, s, o.aria || '전압과 전류의 관계 그래프');
  }
  function miniGraph(shape, o = {}) {
    const W = 176, H = 164, L = 34, Bm = 30, pw = 118, ph = 96, x0 = L, y0 = H - Bm;
    let s = `<rect x="${x0}" y="${y0 - ph}" width="${pw}" height="${ph}" fill="#f6f8fb"/>`;
    s += arrow(x0, y0, x0 + pw + 12, y0, { w: 1.8 }) + arrow(x0, y0, x0, y0 - ph - 12, { w: 1.8 });
    s += T(x0 - 9, y0 + 11, '0', { size: 12, weight: 500, halo: false });
    s += T(x0 - 2, y0 - ph - 22, o.ylabel || '전류', { size: 12.5, anchor: 'middle' }) + T(x0 + pw + 12, y0 + 16, o.xlabel || '저항', { size: 12.5, anchor: 'end' });
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40; let x, y;
      if (shape === 'prop') { x = t * 0.92; y = t * 0.9; }
      else if (shape === 'inv') { x = 0.1 + t * 0.86; y = 0.092 / x; }
      else if (shape === 'const') { x = t * 0.94; y = 0.55; }
      else if (shape === 'down') { x = t * 0.9; y = 0.9 - t * 0.9; }
      else { x = t * 0.92; y = 0.9 * Math.pow(t, 2.6); }
      pts.push([x0 + x * pw, y0 - y * ph]);
    }
    s += line2(pts, CUR, 3);
    return svg(W, H, s, '그래프 보기');
  }

  /* ---------- 자기 부품 ---------- */
  function barMagnet(cx, cy, w, h, nLeft) {
    const lf = nLeft ? 'url(#g-n)' : 'url(#g-s)', rf = nLeft ? 'url(#g-s)' : 'url(#g-n)';
    return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="${lf}" stroke="${INK}" stroke-width="2"/><rect x="${cx}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="${rf}" stroke="${INK}" stroke-width="2"/>` +
      T(cx - w / 4, cy + 1, nLeft ? 'N' : 'S', { fill: '#fff', halo: false, size: 19, weight: 800 }) + T(cx + w / 4, cy + 1, nLeft ? 'S' : 'N', { fill: '#fff', halo: false, size: 19, weight: 800 });
  }
  function compass(x, y, r, ang) {
    let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2.2"/><circle cx="${x}" cy="${y}" r="${r - 4}" fill="none" stroke="#d3dae3" stroke-width="1.4"/>`;
    if (ang == null) return s + T(x, y + 1, '?', { size: r * 0.9, fill: SUB, halo: false, weight: 700 });
    const a = ang * Math.PI / 180, dx = Math.cos(a), dy = -Math.sin(a), L = r - 7, b = r * 0.2;
    const tipN = [x + dx * L, y + dy * L], tipS = [x - dx * L, y - dy * L], p1 = [x - dy * b, y + dx * b], p2 = [x + dy * b, y - dx * b];
    s += poly([tipN, p1, p2], POS, { sw: 1.4 }) + poly([tipS, p1, p2], NEG, { sw: 1.4 });
    return s + `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`;
  }
  // 코일을 옆에서 본 모습. 앞쪽 반 바퀴는 굵게, 뒤쪽 반 바퀴는 옅게 그린다.
  // 앞쪽 선은 왼쪽 아래에서 오른쪽 위로 올라가므로, 전류가 왼쪽 끝으로 들어오면 앞쪽에서 위로 흐른다.
  function coil(x0, x1, cy, r, n, frontUp) {
    const p = (x1 - x0) / n, back = [], front = [];
    for (let i = 0; i < n; i++) {
      const xs = x0 + i * p, fa = [], ba = [];
      for (let k = 0; k <= 14; k++) {
        const th = k / 14 * Math.PI;
        fa.push([xs + p * th / (2 * Math.PI), cy + r * Math.cos(th)]);
        ba.push([xs + p * (th + Math.PI) / (2 * Math.PI), cy + r * Math.cos(th + Math.PI)]);
      }
      back.push(line2(ba, '#b7c0cc', 5.2) + line2(ba, '#ecd3bd', 3));
      front.push(copperLine(fa, 4.4));
    }
    let s = back.join('') + front.join('');
    for (let i = 0; i < n; i += 2) {
      const xm = x0 + i * p + p / 4, vx = p / (2 * Math.PI), vy = -r, m = Math.hypot(vx, vy), sg = frontUp ? 1 : -1;
      const ux = sg * vx / m, uy = sg * vy / m, tip = [xm + ux * 11, cy + uy * 11], bx = xm - ux * 8, by = cy - uy * 8;
      s += poly([tip, [bx - uy * 10, by + ux * 10], [bx + uy * 10, by - ux * 10]], CUR, { stroke: '#fff', sw: 2 });
    }
    return s;
  }
  function coilCircuit(o) {
    // o: x0,x1,cy,r,n, plusLeft(전지 (+)극이 왼쪽), by(전지 높이), sw(스위치)
    const { x0, x1, cy, r, n, by } = o, bx = (x0 + x1) / 2, up = !!o.plusLeft;
    let s = wire([[x0, cy + r], [x0, by], [x1, by], [x1, cy + r]]);
    s += copperLine([[x0, cy + r - 1], [x0, cy + r + 26]], 4.4) + copperLine([[x1, cy + r - 1], [x1, cy + r + 26]], 4.4);
    s += coil(x0, x1, cy, r, n, up);
    s += battery(bx - (o.sw ? 34 : 0), by, { plusRight: !up, labelBelow: true });
    if (o.sw) s += sw(bx + 52, by, {});
    const ya = cy + r + 44, yb = cy + r + 74;
    s += up ? arrow(x0 - 12, yb, x0 - 12, ya, { color: CUR, w: 2.8 }) + arrow(x1 + 12, ya, x1 + 12, yb, { color: CUR, w: 2.8 })
      : arrow(x0 - 12, ya, x0 - 12, yb, { color: CUR, w: 2.8 }) + arrow(x1 + 12, yb, x1 + 12, ya, { color: CUR, w: 2.8 });
    s += T(up ? x0 - 36 : x1 + 36, (ya + yb) / 2, '전류', { size: 13.5, fill: CUR });
    return s;
  }

  /* ---------- 입체 투영 ---------- */
  const P3 = (ox, oy, sc, dx, dy) => (x, y, w) => [ox + sc * (x + dx * w), oy - sc * (y + dy * w)];
  const RED = { front: 'url(#g-n)', top: '#f9aeb0', side: '#c8363b' }, BLUE = { front: 'url(#g-s)', top: '#a9cbfa', side: '#2660c0' };
  function box3(pr, x0, x1, y0, y1, w0, w1, c) {
    return poly([pr(x0, y1, w0), pr(x1, y1, w0), pr(x1, y1, w1), pr(x0, y1, w1)], c.top) +
      poly([pr(x1, y0, w0), pr(x1, y0, w1), pr(x1, y1, w1), pr(x1, y1, w0)], c.side) +
      poly([pr(x0, y0, w0), pr(x1, y0, w0), pr(x1, y1, w0), pr(x0, y1, w0)], c.front);
  }
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  /* ======================================================================
   * 그림 규격(폰과 PC 공용 한 벌)
   * 앱의 그림 칸: 폰은 폭 약 318px에 높이 220px 제한, 넓은 화면은 왼쪽 큰 칸(폭을 채움).
   * 그래서 캔버스는 폭 380 이하, 높이 256 이하로 잡고 글자는 14 이상으로 쓴다(폰에서 11px 이상).
   * 옆으로 긴 띠 모양은 쓰지 않는다. 패널이 둘이면 좁게 나란히, 셋이면 더 좁게 나란히 놓는다.
   * ====================================================================== */
  const scaleAt = (x, y, k, body) => `<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${body}</g>`;

  // 회로 한 판. o = { w, top:[부품], bottom:[부품] | rungs:[[부품],[부품]], left, right, vm, cap, small, padL, dy, gap }
  // 부품: {t:'bat',plusRight,labels} {t:'bulb',label} {t:'res',label} {t:'sw',open,label} {t:'A'|'V',read,label} {t:'pt',label} {t:'box',label}
  // 부품마다 fx(0~1)로 가로 자리를 직접 줄 수 있다. 주지 않으면 고르게 나눈다.
  function comp(c, x, y, small) {
    if (c.t === 'bat') {
      const lab = c.labels !== false, body = battery(x, y, { plusRight: c.plusRight, labels: lab && !small, labelBelow: c.labelBelow });
      if (!small) return body;
      const ly = c.labelBelow ? y + 24 : y - 22, pl = !c.plusRight;
      return scaleAt(x, y, 0.82, body) + (lab ? T(x + (pl ? -22 : 22), ly, '(+)', { size: 14 }) + T(x + (pl ? 22 : -22), ly, '(−)', { size: 14 }) : '');
    }
    if (c.t === 'bulb') return bulb(x, y, { r: small ? 13 : 15, label: c.label });
    if (c.t === 'res') return resistor(x, y, { label: c.label });
    if (c.t === 'sw') return sw(x, y, { open: c.open, label: c.label });
    if (c.t === 'A' || c.t === 'V') {
      const m = meter(x, y, c.t, {});
      let s = small ? scaleAt(x, y, 0.82, m) : m;
      if (c.label) s += T(c.lx != null ? c.lx : x, c.ly != null ? c.ly : y - 30, c.label, { size: 14 });
      if (c.read) { const ry = c.ry != null ? c.ry : y + 34, rw = c.rw || 58; s += `<rect x="${x - rw / 2}" y="${ry - 12}" width="${rw}" height="24" rx="6" fill="#eef4ff" stroke="#9db7e0" stroke-width="1.4"/>` + T(x, ry, c.read, { size: 14.5, halo: false, fill: '#1f4e96', weight: 700 }); }
      return s;
    }
    if (c.t === 'pt') return dot(x, y) + T(x, y + (c.above ? -18 : 20), c.label, { size: 15.5, weight: 800 });
    if (c.t === 'box') { const bw = c.bw || 74; return `<rect x="${x - bw / 2}" y="${y - 19}" width="${bw}" height="38" rx="9" fill="#fff" stroke="${INK}" stroke-width="2"/>` + T(x, y, c.label, { size: 14.5, halo: false }); }
    return '';
  }
  function circuitPanel(o) {
    const w = o.w, l = 16 + (o.padL || 0), r = w - 16, t = o.t || 34, small = !!o.small, rungs = o.rungs || null, gap = o.gap || 58;
    const ys = rungs ? rungs.map((_, i) => t + gap * (i + 1)) : [t + (o.dy || 92)], b = ys[ys.length - 1];
    const place = (list, y) => (list || []).map((c, k) => [c, c.fx != null ? l + (r - l) * c.fx : l + (r - l) * (k + 1) / (list.length + 1), y]);
    let s = loop(l, t, r, b), items = place(o.top, t), extra = 0;
    if (rungs) rungs.forEach((rg, i) => { if (i < rungs.length - 1) s += wire([[l, ys[i]], [r, ys[i]]]) + dot(l, ys[i]) + dot(r, ys[i]); items = items.concat(place(rg, ys[i])); });
    else items = items.concat(place(o.bottom, b));
    if (o.left) items.push([Object.assign({ lx: l - 40, ly: (t + b) / 2 }, o.left), l, (t + b) / 2]);
    if (o.right) items.push([o.right, r, (t + b) / 2]);
    if (o.vm) {
      const x = place(o.bottom, b)[o.vm.over][1], hw = o.vm.hw || 54, y2 = b + 54;
      s += wire([[x - hw, b], [x - hw, y2], [x + hw, y2], [x + hw, b]]) + dot(x - hw, b) + dot(x + hw, b);
      items.push([{ t: 'V', read: o.vm.read, label: o.vm.label, ly: b + 25 }, x, y2]); extra = 54 + (o.vm.read ? 42 : 20);
    }
    items.forEach(([c, x, y]) => { s += comp(c, x, y, small); });
    const last = rungs ? rungs[rungs.length - 1] : (o.bottom || []);
    // 맨 아래 줄에 값 상자가 달린 전류계나 전압계가 있으면 그만큼 아래 여백을 더 준다
    let h = b + 22 + extra + (last.some(c => c.t === 'pt' && !c.above) ? 14 : 0) + (last.some(c => (c.t === 'A' || c.t === 'V') && c.read && c.ry == null) ? 30 : 0);
    if (o.cap) { s += caption(w / 2, h + 10, o.cap); h += 26; }
    return { w, h, body: s };
  }
  function rowOf(panels, gap) {
    const g = gap == null ? 8 : gap; let x = 0, h = 0, s = '';
    panels.forEach(p => { s += `<g transform="translate(${x} 0)">${p.body}</g>`; x += p.w + g; h = Math.max(h, p.h); });
    return { w: x - g, h, body: s };
  }
  function miniGraph2(shape, o = {}) {
    const W = 168, H = 150, x0 = 34, y0 = H - 28, pw = 112, ph = 86;
    let s = `<rect x="${x0}" y="${y0 - ph}" width="${pw}" height="${ph}" fill="#f6f8fb"/>` + arrow(x0, y0, x0 + pw + 12, y0, { w: 1.8 }) + arrow(x0, y0, x0, y0 - ph - 12, { w: 1.8 });
    s += T(x0 - 10, y0 + 12, '0', { size: 13, weight: 500, halo: false }) + T(x0 + 4, y0 - ph - 23, o.ylabel || '전류', { size: 14 }) + T(x0 + pw + 12, y0 + 16, o.xlabel || '저항', { size: 14, anchor: 'end' });
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40; let x, y;
      if (shape === 'prop') { x = t * 0.92; y = t * 0.9; } else if (shape === 'inv') { x = 0.1 + t * 0.86; y = 0.092 / x; } else if (shape === 'const') { x = t * 0.94; y = 0.55; }
      else if (shape === 'down') { x = t * 0.9; y = 0.9 - t * 0.9; } else if (shape === 'sat') { x = t * 0.94; y = 0.86 * (1 - Math.exp(-4 * t)); } else { x = t * 0.92; y = 0.9 * Math.pow(t, 2.6); }
      pts.push([x0 + x * pw, y0 - y * ph]);
    }
    return svg(W, H, s + line2(pts, CUR, 3), '그래프 보기');
  }

  const FIG = {};
  FIG.defs = DEFS; // 페이지 맨 위에 한 번 넣어 두면, 숨겨진 카드 안의 정의에 기대지 않는다
  FIG.kit = { INK, SUB, POS, NEG, COPPER, CUR, RED, BLUE, r2, svg, T, arrow, plus, minus, sign, rows, poly, line2, copperLine, scaleAt, rod, fur, support, string, electroscope, leader, wire, dot, battery, bulb, resistor, meter, sw, loop, caption, comp, circuitPanel, rowOf, graph, miniGraph2, barMagnet, compass, coil, coilCircuit, P3, box3, cross };

  /* 회로: 판 하나 또는 여러 판을 나란히 */
  FIG.circuit = p => { const pn = rowOf(p.panels.map(circuitPanel), p.gap); return svg(pn.w, pn.h, pn.body, p.aria || '전기 회로'); };

  /* 마찰 전후 전하 모형: 위 줄은 마찰 전, 아래 줄은 마찰 후 */
  FIG.rubCharges = p => {
    const names = p.names || ['플라스틱 막대', '털가죽'];
    let s = T(140, 14, names[0], { size: 14 }) + T(300, 14, names[1], { size: 14 });
    [['마찰 전', p.rodBefore, p.furBefore, 70], ['마찰 후', p.rodAfter, p.furAfter, 162]].forEach(([cap, rr, fr, cy]) => {
      s += `<rect x="4" y="${cy - 42}" width="370" height="84" rx="12" fill="#f4f6f9"/>` + T(31, cy, cap, { size: 14, weight: 700, halo: false });
      s += `<rect x="62" y="${cy - 24}" width="156" height="48" rx="24" fill="url(#g-rod)" stroke="${INK}" stroke-width="2"/>` + rows(rr, 140, cy, 26, 22, 8);
      s += fur(300, cy, 60, 25) + rows(fr, 300, cy, 26, 21, 8);
    });
    return svg(378, 208, s, '마찰 전과 후의 전하 모형');
  };

  /* 서로 밀어내는 두 풍선 */
  FIG.balloons = () => {
    let s = support(40, 280, 22) + string(160, 28, 98, 104) + string(160, 28, 222, 104);
    const bal = (x, c1, c2, lab) => `<ellipse cx="${x}" cy="154" rx="40" ry="50" fill="${c1}" stroke="${INK}" stroke-width="2"/><ellipse cx="${x - 14}" cy="134" rx="8" ry="14" fill="#fff" opacity=".5" transform="rotate(24 ${x - 14} 134)"/><path d="M${x - 7} 105L${x} 96L${x + 7} 105Z" fill="${c2}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>` + T(x, 158, lab, { size: 20, weight: 800, fill: '#fff', halo: false });
    s += bal(84, '#f58aa0', '#e96884', 'A') + bal(236, '#62b6f0', '#3d9be0', 'B');
    s += arrow(128, 218, 92, 218, { color: SUB, w: 2.2 }) + arrow(192, 218, 228, 218, { color: SUB, w: 2.2 });
    return svg(320, 232, s, '실에 매단 두 풍선이 벌어진 모습');
  };

  /* 공 두 개씩의 밀고 당김(세 판) */
  FIG.ballPairs = p => {
    let s = '';
    p.pairs.forEach((pr, i) => {
      const cx = 60 + i * 122, rep = pr.act === 'repel', topd = rep ? 8 : 26, bd = rep ? 32 : 17;
      s += `<rect x="${cx - 57}" y="4" width="114" height="124" rx="12" fill="#f4f6f9"/>` + support(cx - 40, cx + 40, 20);
      [-1, 1].forEach((sg, k) => { s += string(cx + sg * topd, 26, cx + sg * bd, 84) + `<circle cx="${cx + sg * bd}" cy="99" r="16" fill="url(#g-foam)" stroke="${INK}" stroke-width="2"/>` + T(cx + sg * bd, 100, pr.names[k], { size: 15.5, weight: 800, halo: false }); });
      s += T(cx, 146, rep ? '밀어낸다' : '끌어당긴다', { size: 14.5, weight: 700 });
    });
    return svg(364, 162, s, '대전된 공 두 개씩을 가까이 했을 때의 모습');
  };

  /* 금속 막대의 전하 분포(그림 보기용) */
  FIG.inductionBar = p => {
    let s = rod(46, 36, 78, 0, { sign: p.rodSign, n: 3 }) + `<rect x="104" y="14" width="150" height="44" rx="8" fill="url(#g-metal)" stroke="${INK}" stroke-width="2"/>`;
    [...p.pattern].forEach((ch, i) => { s += sign(ch, 122 + i * 22.8, 36, 8.5); });
    return svg(264, 72, s, '금속 막대 안의 전하 분포');
  };

  /* 검전기와 대전체. p.leaf(금속박 벌어진 각도), p.note(막대 이름) */
  FIG.electroscopeRod = p => {
    const sg = p.rodSign === '+' ? '+' : '−';
    let s = scaleAt(168, 78, 0.85, electroscope(168, 78, { leaf: p.leaf == null ? 1.6 : p.leaf }));
    if (p.rodSign) s += rod(102, 42, 132, -14, { sign: p.rodSign, n: 5 }) + T(8, 4, p.note || `(${sg})전하로 대전된 막대`, { size: 14, anchor: 'start' });
    s += leader(201, 78, 236, 78) + T(240, 78, '금속판', { size: 14.5, anchor: 'start' }) + leader(182, 180, 236, 180) + T(240, 180, '금속박', { size: 14.5, anchor: 'start' });
    return svg(300, 246, '<g transform="translate(0 12)">' + s + '</g>', '검전기의 금속판에 대전체를 가까이 가져가는 모습');
  };

  /* 실에 매단 금속 공 */
  FIG.ballInduction = p => {
    const sg = p.rodSign === '+' ? '+' : '−';
    let s = support(196, 320, 18) + string(258, 24, 258, 92) + `<circle cx="258" cy="126" r="34" fill="url(#g-ball)" stroke="${INK}" stroke-width="2"/>`;
    s += rod(104, 126, 156, 0, { sign: p.rodSign, n: 5 }) + T(104, 98, `(${sg})전하로 대전된 막대`, { size: 14 });
    s += T(236, 126, 'A', { size: 16, weight: 800, halo: false }) + T(280, 126, 'B', { size: 16, weight: 800, halo: false });
    s += leader(284, 152, 300, 172) + T(302, 184, '금속 공', { size: 14.5, anchor: 'start' });
    return svg(352, 200, s, '실에 매단 금속 공에 대전된 막대를 가까이 가져간 모습');
  };

  /* 절연 받침대 위의 금속 공 두 개 */
  FIG.twoSpheres = p => {
    const sg = p.rodSign === '+' ? '+' : '−'; let s = '';
    [[204, 'X', 'a', 'b'], [296, 'Y', 'c', 'd']].forEach(([x, name, a, b]) => {
      s += `<rect x="${x - 5}" y="138" width="10" height="62" fill="#eef1f5" stroke="${INK}" stroke-width="1.8"/><rect x="${x - 34}" y="198" width="68" height="12" rx="5" fill="#dfe4ea" stroke="${INK}" stroke-width="1.8"/>`;
      s += `<circle cx="${x}" cy="104" r="36" fill="url(#g-ball)" stroke="${INK}" stroke-width="2"/>` + T(x - 21, 104, a, { size: 17, weight: 800, halo: false }) + T(x + 21, 104, b, { size: 17, weight: 800, halo: false }) + T(x, 52, name, { size: 17, weight: 800 });
    });
    s += rod(72, 104, 128, 0, { sign: p.rodSign, n: 4 }) + T(72, 76, `(${sg})전하로 대전된 막대`, { size: 14 });
    return svg(348, 218, s, '절연 받침대 위에 놓인 금속 공 두 개와 대전된 막대');
  };

  /* 도선 속 전자 모형 */
  FIG.wireElectrons = p => {
    const dir = p.toward === 'B' ? 1 : -1;
    let s = `<rect x="36" y="22" width="300" height="124" rx="18" fill="#fbead9" stroke="${INK}" stroke-width="2"/>`;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) s += plus(78 + c * 72, 62 + r * 46, 12);
    (p.random ? [[60, 40], [150, 44], [250, 38], [114, 85], [222, 88], [300, 84], [96, 130], [186, 128], [280, 132]] : [[114, 40], [258, 40], [58, 85], [186, 85], [298, 85], [114, 130], [258, 130]]).forEach(([x, y], i) => {
      const a = p.random ? [20, 200, 95, 310, 150, 250, 60, 180, 330][i] * Math.PI / 180 : (dir > 0 ? 0 : Math.PI);
      s += minus(x, y, 6.5) + arrow(x + Math.cos(a) * 9, y - Math.sin(a) * 9, x + Math.cos(a) * 26, y - Math.sin(a) * 26, { color: NEG, w: 2, head: 7 });
    });
    s += T(16, 85, 'A', { size: 18, weight: 800 }) + T(356, 85, 'B', { size: 18, weight: 800 });
    s += plus(128, 172, 9) + T(142, 172, '원자', { size: 14, anchor: 'start' }) + minus(214, 172, 6.5) + T(226, 172, '전자', { size: 14, anchor: 'start' });
    return svg(372, 190, s, '도선 속에서 전자가 이동하는 모습');
  };

  /* 전압과 전류 그래프. 인자는 graph와 같다(xmax, xstep, ymax, ystep, ydec, xlabel, ylabel, lines) */
  FIG.viGraph = p => graph(Object.assign({ W: 360, H: 250 }, p));
  FIG.miniGraph = p => miniGraph2(p.shape, p);

  /* 니크롬선, 전류계, 전압계 회로 */
  FIG.ohmCircuit = p => FIG.circuit({ panels: [{ w: 330, padL: 54, dy: 86, top: [{ t: 'bat' }], left: { t: 'A', label: '전류계', read: p.A }, bottom: [{ t: 'res', label: p.R == null ? '니크롬선' : `니크롬선 ${p.R} Ω` }], vm: { over: 0, read: p.V == null ? null : `${p.V} V`, label: '전압계' } }], aria: '니크롬선에 전류계와 전압계를 연결한 회로' });

  /* 멀티탭 */
  FIG.multitap = p => {
    const n = p.items.length, xs = p.items.map((_, i) => 144 + i * 88), xl = xs[n - 1];
    let s = wire([[34, 84], [34, 58], [xl, 58]]) + wire([[34, 132], [34, 158], [xl, 158]]);
    s += `<rect x="6" y="84" width="56" height="48" rx="9" fill="#eef1f5" stroke="${INK}" stroke-width="2"/>` + T(34, 108, '전원', { size: 14.5, halo: false });
    p.items.forEach((name, i) => { s += wire([[xs[i], 58], [xs[i], 158]]) + (i < n - 1 ? dot(xs[i], 58) + dot(xs[i], 158) : '') + comp({ t: 'box', label: name, bw: 78 }, xs[i], 108); });
    s += dot(84, 58) + T(84, 36, 'P', { size: 16, weight: 800 });
    s += `<rect x="98" y="24" width="${xl - 98 + 46}" height="156" rx="12" fill="none" stroke="#a8b3c2" stroke-width="1.6" stroke-dasharray="6 5"/>` + T(98 + (xl - 52) / 2, 196, '멀티탭', { size: 14, fill: SUB });
    return svg(xl + 54, 210, s, '멀티탭에 전기 기구를 연결한 회로');
  };

  /* 전기 기구 표시 */
  FIG.ratingLabel = p => {
    let k = `<path d="M148 84C186 84 186 168 150 172" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M148 84C186 84 186 168 150 172" fill="none" stroke="#596373" stroke-width="8.5" stroke-linecap="round"/>`;
    k += `<path d="M62 92L34 78L40 70L72 80Z" fill="url(#g-kettle)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M64 70H148L158 184H54Z" fill="url(#g-kettle)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    k += `<path d="M62 70C62 56 150 56 150 70Z" fill="#596373" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><rect x="98" y="48" width="16" height="10" rx="4" fill="#596373" stroke="${INK}" stroke-width="2"/>`;
    k += `<rect x="92" y="96" width="12" height="62" rx="6" fill="#cfe9f9" stroke="#6f9dbd" stroke-width="1.6"/><rect x="92" y="122" width="12" height="36" rx="6" fill="#7cc0ee"/><rect x="46" y="184" width="120" height="16" rx="7" fill="#3b4556" stroke="${INK}" stroke-width="2"/>`;
    let s = p.icon === false ? '' : `<g transform="translate(-16 2) scale(.76)">${k}</g>` + `<line x1="86" y1="148" x2="150" y2="34" stroke="${SUB}" stroke-width="1.2" stroke-dasharray="4 4"/><line x1="86" y1="152" x2="150" y2="160" stroke="${SUB}" stroke-width="1.2" stroke-dasharray="4 4"/>`;
    const x0 = p.icon === false ? 10 : 150, w = 214;
    s += `<rect x="${x0}" y="24" width="${w}" height="140" rx="12" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M${x0} 60V36a12 12 0 0 1 12 -12H${x0 + w - 12}a12 12 0 0 1 12 12V60Z" fill="#eef1f5" stroke="${INK}" stroke-width="2"/>`;
    s += T(x0 + w / 2, 43, p.name, { size: 15, weight: 700, halo: false });
    s += T(x0 + 18, 88, '정격 전압', { size: 14.5, anchor: 'start', halo: false, weight: 500 }) + T(x0 + w - 18, 88, `${p.V} V`, { size: 16, anchor: 'end', halo: false, weight: 800 });
    s += `<line x1="${x0 + 16}" y1="111" x2="${x0 + w - 16}" y2="111" stroke="#dbe2ea" stroke-width="1.2"/>`;
    s += T(x0 + 18, 136, '소비 전력', { size: 14.5, anchor: 'start', halo: false, weight: 500 }) + T(x0 + w - 18, 136, `${p.P} W`, { size: 16, anchor: 'end', halo: false, weight: 800 });
    return svg(x0 + w + 8, 178, s, '전기 기구에 붙어 있는 정격 전압과 소비 전력 표시');
  };

  /* 전기 기구의 에너지 전환. items: [{title, led, inJ, out:[{name, J, color}]}] 또는 light/heat */
  FIG.energyFlow = p => {
    const th = J => 7 + 20 * Math.sqrt(Math.min(J, 60) / 60);
    const block = (x1, y1, x2, y2, t, fill) => {
      const a = Math.atan2(y2 - y1, x2 - x1), ca = Math.cos(a), sa = Math.sin(a), hd = Math.min(18, t * 0.8 + 7), L = Math.hypot(x2 - x1, y2 - y1) - hd;
      const pt = (u, v) => [x1 + ca * u - sa * v, y1 + sa * u + ca * v];
      return poly([pt(0, -t / 2), pt(L, -t / 2), pt(L, -t / 2 - 6), pt(L + hd, 0), pt(L, t / 2 + 6), pt(L, t / 2), pt(0, t / 2)], fill, { sw: 1.8 });
    };
    const lamp = (x, y, led) => {
      let g = `<rect x="${x - 10}" y="${y + 20}" width="20" height="15" rx="3" fill="#aab3bf" stroke="${INK}" stroke-width="1.8"/><line x1="${x - 10}" y1="${y + 27}" x2="${x + 10}" y2="${y + 27}" stroke="${INK}" stroke-width="1.2"/>`;
      if (led) g += `<path d="M${x - 21} ${y - 2}A21 21 0 0 1 ${x + 21} ${y - 2}Z" fill="url(#g-bulb)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M${x - 21} ${y - 2}H${x + 21}L${x + 11} ${y + 21}H${x - 11}Z" fill="#eef1f5" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
      else g += `<path d="M${x - 9} ${y + 21}C${x - 9} ${y + 10} ${x - 22} ${y + 7} ${x - 22} ${y - 7}A22 22 0 0 1 ${x + 22} ${y - 7}C${x + 22} ${y + 7} ${x + 9} ${y + 10} ${x + 9} ${y + 21}Z" fill="url(#g-bulb)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M${x - 5} ${y + 19}V${y + 4}q2.5 -8 5 0q2.5 -8 5 0V${y + 19}" fill="none" stroke="#b7791f" stroke-width="1.6" stroke-linejoin="round"/>`;
      return g;
    };
    let s = '';
    p.items.forEach((it, i) => {
      const y0 = 4 + i * 128, cy = y0 + 68, tin = th(it.inJ), outs = it.out || [{ name: '빛에너지', J: it.light, color: '#ffd95a' }, { name: '열에너지', J: it.heat, color: '#ff9d70' }];
      s += `<rect x="4" y="${y0}" width="366" height="120" rx="12" fill="#f4f6f9"/>` + T(14, y0 + 17, it.title, { size: 14.5, weight: 700, halo: false, anchor: 'start' });
      s += block(14, cy, 112, cy, tin, '#8fc2f7') + T(62, cy + tin / 2 + 19, `전기 에너지 <tspan font-weight="800">${it.inJ} J</tspan>`, { size: 14, halo: false });
      s += block(176, cy - 12, 252, cy - 32, th(outs[0].J), outs[0].color) + T(312, cy - 34, `${outs[0].name} <tspan font-weight="800">${outs[0].J} J</tspan>`, { size: 14, halo: false });
      s += block(176, cy + 12, 252, cy + 28, th(outs[1].J), outs[1].color) + T(312, cy + 32, `${outs[1].name} <tspan font-weight="800">${outs[1].J} J</tspan>`, { size: 14, halo: false });
      s += it.icon === false ? '' : lamp(146, cy - 8, it.led);
    });
    return svg(374, 4 + p.items.length * 128, s, '전기 기구가 1초 동안 사용하는 전기 에너지와 전환되는 에너지');
  };

  /* 막대자석과 점. p.nLeft, p.points: [{k(1~3번째 선), pos:'top'|'bottom'|'left'|'right', label}] 기본은 위쪽 P */
  FIG.barMagnetPoint = p => {
    const cx = 180, cy = 122, w = 140, h = 38, xe = cx + w / 2, xs = cx - w / 2; let s = '';
    for (let k = 1; k <= 3; k++) for (const sg of [-1, 1]) {
      const y0 = cy + sg * (16 - 5 * k), yt = cy + sg * (32 * k + 6);
      s += `<path d="M${xe} ${y0}C${xe + 30 * k} ${y0 + sg * 7 * k} ${xe + 26 * k} ${yt} ${cx} ${yt}C${xs - 26 * k} ${yt} ${xs - 30 * k} ${y0 + sg * 7 * k} ${xs} ${y0}" fill="none" stroke="#aab5c4" stroke-width="1.7" stroke-dasharray="5 5"/>`;
    }
    s += `<line x1="${xe}" y1="${cy}" x2="${xe + 76}" y2="${cy}" stroke="#aab5c4" stroke-width="1.7" stroke-dasharray="5 5"/><line x1="${xs - 76}" y1="${cy}" x2="${xs}" y2="${cy}" stroke="#aab5c4" stroke-width="1.7" stroke-dasharray="5 5"/>`;
    s += barMagnet(cx, cy, w, h, p.nLeft);
    (p.points || [{ pos: 'top', label: 'P' }]).forEach(q => {
      const xy = { top: [cx, cy - 70, 0, -19], bottom: [cx, cy + 70, 0, 19], left: [xs - 52, cy, 0, -19], right: [xe + 52, cy, 0, -19] }[q.pos];
      s += `<circle cx="${xy[0]}" cy="${xy[1]}" r="5" fill="${INK}"/>` + T(xy[0] + xy[2], xy[1] + xy[3], q.label, { size: 16.5, weight: 800 });
    });
    return svg(360, 244, s, '막대자석과 그 주위의 점');
  };
  FIG.compassChoice = p => svg(92, 92, compass(46, 46, 36, p.ang), '나침반 바늘');

  /* 코일과 나침반. p.plusLeft, p.compass: {P: 각도|null, Q: 각도|null}(기본은 둘 다 가림), p.arrows(false면 전류 화살표 없음) */
  FIG.coilCompass = p => {
    const cp = p.compass || {};
    let s = coilCircuit({ x0: 106, x1: 266, cy: 78, r: 30, n: 5, by: 196, plusLeft: p.plusLeft, sw: p.sw });
    s += compass(40, 78, 24, cp.P == null ? null : cp.P) + T(40, 118, 'P', { size: 16, weight: 800 }) + compass(332, 78, 24, cp.Q == null ? null : cp.Q) + T(332, 118, 'Q', { size: 16, weight: 800 });
    s += T(106, 30, 'A', { size: 17, weight: 800 }) + T(266, 30, 'B', { size: 17, weight: 800 });
    return svg(372, 232, s, '전류가 흐르는 코일과 양쪽에 놓인 나침반');
  };

  /* 코일과 막대자석 */
  FIG.coilMagnet = p => {
    let s = coilCircuit({ x0: 52, x1: 202, cy: 78, r: 30, n: 5, by: 196, plusLeft: p.plusLeft, sw: true });
    s += barMagnet(314, 78, 112, 38, p.nLeft) + T(314, 44, '막대자석', { size: 14.5 }) + T(52, 30, 'A', { size: 17, weight: 800 }) + T(202, 30, 'B', { size: 17, weight: 800 });
    return svg(376, 232, s, '전류가 흐르는 코일과 그 옆에 놓인 막대자석');
  };

  /* 말굽자석 사이의 도선. p.top('N'|'S'), p.current('toward'|'away'), p.dirs(네 방향 기호), p.swing(전기 그네), p.showMove */
  FIG.magnetForce = p => {
    const swing = !!p.swing, H = swing ? 276 : 232, pr = P3(72, H - 34, 40, 0.42, 0.30);
    const ct = p.top === 'N' ? RED : BLUE, cb = p.top === 'N' ? BLUE : RED;
    const X0 = -0.9, X1 = 4.2, D = 3, b1 = 0.9, t0 = 3.0, t1 = 3.9, ym = 1.95, xw = 2.5, w0 = -2.7, w1 = 4.6, top = 4.4;
    let s = '';
    if (swing) s += copperLine([pr(xw, ym, 4.2), pr(xw, top, 4.2)], 2.4);
    s += poly([pr(0, b1, 0), pr(X1, b1, 0), pr(X1, b1, D), pr(0, b1, D)], cb.top) + poly([pr(0, b1, 0), pr(0, b1, D), pr(0, ym, D), pr(0, ym, 0)], cb.side);
    s += poly([pr(X1, 0, 0), pr(X1, 0, D), pr(X1, b1, D), pr(X1, b1, 0)], cb.side) + poly([pr(X0, 0, 0), pr(X1, 0, 0), pr(X1, b1, 0), pr(0, b1, 0), pr(0, ym, 0), pr(X0, ym, 0)], cb.front);
    s += poly([pr(0, ym, 0), pr(0, ym, D), pr(0, t0, D), pr(0, t0, 0)], ct.side) + copperLine([pr(xw, ym, w0), pr(xw, ym, w1)], 4.4);
    s += poly([pr(X1, t0, 0), pr(X1, t0, D), pr(X1, t1, D), pr(X1, t1, 0)], ct.side) + poly([pr(X0, t1, 0), pr(X1, t1, 0), pr(X1, t1, D), pr(X0, t1, D)], ct.top);
    s += poly([pr(X0, ym, 0), pr(0, ym, 0), pr(0, t0, 0), pr(X1, t0, 0), pr(X1, t1, 0), pr(X0, t1, 0)], ct.front);
    const nt = pr(3.5, (t0 + t1) / 2, 0), nb = pr(3.5, b1 / 2, 0);
    s += T(nt[0], nt[1] + 1, p.top, { fill: '#fff', halo: false, size: 21, weight: 800 }) + T(nb[0], nb[1] + 1, p.top === 'N' ? 'S' : 'N', { fill: '#fff', halo: false, size: 21, weight: 800 });
    if (swing) { s += copperLine([pr(xw, ym, -2.4), pr(xw, top, -2.4)], 2.4); const a = pr(xw, top, -2.9), b = pr(xw, top, 4.7); s += line2([a, b], INK, 10) + line2([a, b], '#d9b17c', 6.4); }
    const c1 = pr(xw + 0.55, ym - 0.24, -2.5), c2 = pr(xw + 0.55, ym - 0.24, -1.0);
    s += p.current === 'toward' ? arrow(c2[0], c2[1], c1[0], c1[1], { color: CUR, w: 3.4 }) : arrow(c1[0], c1[1], c2[0], c2[1], { color: CUR, w: 3.4 });
    const cl = pr(xw + 1.2, ym - 0.52, -2.2); s += T(cl[0], cl[1], '전류', { size: 14.5, fill: CUR });
    const wl = pr(xw - 0.62, ym + 0.14, w0); s += T(wl[0], wl[1], '도선', { size: 14.5 });
    const I = [0, 0, p.current === 'toward' ? 1 : -1], B = [0, p.top === 'N' ? -1 : 1, 0], F = cross(I, B);
    if (p.dirs) [['㉠', 0, 0.72], ['㉡', 1.0, 0], ['㉢', 0, -0.72], ['㉣', -1.0, 0]].forEach(([lab, dx, dy]) => {
      const a = pr(xw + dx * 0.16, ym + dy * 0.16, 1), b = pr(xw + dx, ym + dy, 1), t = pr(xw + dx + (dx ? Math.sign(dx) * 0.36 : -0.38), ym + dy + (dy ? Math.sign(dy) * -0.1 : 0), 1);
      s += arrow(a[0], a[1], b[0], b[1], { color: INK, w: 2.6 }) + T(t[0], t[1], lab, { size: 17, weight: 700 });
    });
    if (p.showMove) { const a = pr(xw + F[0] * 0.3, ym, 1), b = pr(xw + F[0] * 1.4, ym, 1), t = pr(xw + F[0] * 1.2, ym + (F[0] < 0 ? 0.5 : -0.5), 1); s += arrow(a[0], a[1], b[0], b[1], { color: '#12a150', w: 4.5 }) + T(t[0], t[1], '움직인 방향', { size: 14, fill: '#0b7a3b' }); }
    return svg(310, H, s, '말굽자석 사이에 놓인 도선에 전류가 흐르는 모습');
  };
  FIG.magnetForce.force = p => cross([0, 0, p.current === 'toward' ? 1 : -1], [0, p.top === 'N' ? -1 : 1, 0]);

  /* 전동기. p.nLeft, p.plusLeft, p.labels(꼭짓점 이름 넷), p.field(true면 자기장 방향 화살표) */
  FIG.motor = p => {
    const pr = P3(178, 100, 33, 0.25, 0.45), nL = p.nLeft, nm = p.labels || ['A', 'B', 'C', 'D'];
    let s = box3(pr, -4.6, -2.8, -1.1, 1.1, 0, 3.6, nL ? RED : BLUE) + box3(pr, 2.8, 4.6, -1.1, 1.1, 0, 3.6, nL ? BLUE : RED);
    const ln = pr(-3.7, 0, 0), rn = pr(3.7, 0, 0);
    s += T(ln[0], ln[1] + 1, nL ? 'N' : 'S', { fill: '#fff', halo: false, size: 23, weight: 800 }) + T(rn[0], rn[1] + 1, nL ? 'S' : 'N', { fill: '#fff', halo: false, size: 23, weight: 800 });
    s += line2([pr(0, 0, -1.2), pr(0, 0, 4.2)], '#a8b3c2', 1.6, { dash: '6 5' });
    const A = pr(-1.6, 0, 0.3), Bp = pr(-1.6, 0, 3.3), C = pr(1.6, 0, 3.3), Dp = pr(1.6, 0, 0.3);
    s += copperLine([pr(-0.26, 0, -2.0), pr(-0.26, 0, 0.3), A, Bp, C, Dp, pr(0.26, 0, 0.3), pr(0.26, 0, -2.0)], 4.4);
    const c = pr(0, 0, -2.0), cx = c[0], cy = c[1] + 6, hw = 82, dp = 78;
    s += wire([[cx - 20, cy], [cx - hw, cy], [cx - hw, cy + dp], [cx + hw, cy + dp], [cx + hw, cy], [cx + 20, cy]]);
    s += `<rect x="${r2(cx - 36)}" y="${r2(cy - 6.5)}" width="19" height="13" rx="3" fill="#596373" stroke="${INK}" stroke-width="1.8"/><rect x="${r2(cx + 17)}" y="${r2(cy - 6.5)}" width="19" height="13" rx="3" fill="#596373" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<path d="M${r2(cx - 2.5)} ${r2(cy - 17)}A17 17 0 0 0 ${r2(cx - 2.5)} ${r2(cy + 17)}Z" fill="#f2c230" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M${r2(cx + 2.5)} ${r2(cy - 17)}A17 17 0 0 1 ${r2(cx + 2.5)} ${r2(cy + 17)}Z" fill="#f2c230" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += battery(cx, cy + dp, { plusRight: !p.plusLeft, labelBelow: true });
    const ab = p.plusLeft, a1 = pr(-2.1, 0, 0.8), a2 = pr(-2.1, 0, 2.8), d1 = pr(2.1, 0, 2.8), d2 = pr(2.1, 0, 0.8), o = { color: CUR, w: 3 };
    s += ab ? arrow(a1[0], a1[1], a2[0], a2[1], o) + arrow(d1[0], d1[1], d2[0], d2[1], o) : arrow(a2[0], a2[1], a1[0], a1[1], o) + arrow(d2[0], d2[1], d1[0], d1[1], o);
    s += ab ? arrow(cx - hw - 13, cy + 58, cx - hw - 13, cy + 22, o) + arrow(cx + hw + 13, cy + 22, cx + hw + 13, cy + 58, o) : arrow(cx - hw - 13, cy + 22, cx - hw - 13, cy + 58, o) + arrow(cx + hw + 13, cy + 58, cx + hw + 13, cy + 22, o);
    s += T(cx - hw - 40, cy + 40, '전류', { size: 14.5, fill: CUR });
    s += T(A[0] - 5, A[1] + 18, nm[0], { size: 16.5, weight: 800 }) + T(Bp[0] - 8, Bp[1] - 16, nm[1], { size: 16.5, weight: 800 }) + T(C[0] + 8, C[1] - 16, nm[2], { size: 16.5, weight: 800 }) + T(Dp[0] + 5, Dp[1] + 18, nm[3], { size: 16.5, weight: 800 });
    s += leader(cx, cy + 20, cx, cy + 34) + T(cx, cy + 45, '정류자', { size: 14 });
    if (p.field) { const f1 = pr(-1.1, 1.5, 3.6), f2 = pr(1.1, 1.5, 3.6); s += arrow(f1[0], f1[1], f2[0], f2[1], { color: SUB, w: 2, dash: '5 4' }) + T((f1[0] + f2[0]) / 2, f1[1] - 13, '자기장', { size: 14, fill: SUB }); }
    return svg(372, 252, s, '자석 사이에 놓인 전동기의 코일');
  };
  FIG.motor.forces = p => {
    const B = [p.nLeft ? 1 : -1, 0, 0], iab = [0, 0, p.plusLeft ? -1 : 1], icd = [0, 0, p.plusLeft ? 1 : -1];
    return { AB: cross(iab, B)[1], CD: cross(icd, B)[1] };
  };

  return FIG;
})();

/* ====================== 레슨 1 마찰 전기 ====================== */
(function (FIG: any) {
  const K = FIG.kit;
  const { INK, SUB, POS, NEG, r2, svg, T, arrow, sign } = K;

  // 이 파일에서만 쓰는 채움(물체 A~D의 바탕, 유리 막대, 이름 없는 막대, 빗)
  const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const DEFS = '<defs>' + grad('l1-ta', '#f3eeff', '#cdbff6') + grad('l1-tb', '#fff4de', '#f2d199') + grad('l1-tc', '#e8f7ee', '#b3dec3') + grad('l1-td', '#e6f2fd', '#b1d2f3') +
    grad('l1-glass', '#f7fcff', '#a6d4ef') + grad('l1-plain', '#fafbfc', '#c6cdd8') + grad('l1-comb', '#63d2bf', '#289a88') +
    '<radialGradient id="l1-nuc" cx=".36" cy=".32" r=".8"><stop offset="0" stop-color="#fff0c2"/><stop offset="1" stop-color="#e79f1c"/></radialGradient>' +
    '<radialGradient id="l1-el" cx=".36" cy=".32" r=".8"><stop offset="0" stop-color="#d9fff6"/><stop offset="1" stop-color="#2aa08d"/></radialGradient></defs>';
  const TINT = { a: 'url(#l1-ta)', b: 'url(#l1-tb)', c: 'url(#l1-tc)', d: 'url(#l1-td)' };

  // 전하 줄. '+'와 '-'만 그리고 다른 글자는 빈자리로 둔다.
  function chg(arr, cx, cy, dx, dy, r) {
    let s = '';
    arr.forEach((row, ri) => {
      const y = cy + (ri - (arr.length - 1) / 2) * dy;
      [...row].forEach((ch, i) => { if (ch === '+' || ch === '-') s += sign(ch, cx + (i - (row.length - 1) / 2) * dx, y, r); });
    });
    return s;
  }
  const block = (cx, cy, w, h, fill) => `<rect x="${r2(cx - w / 2)}" y="${r2(cy - h / 2)}" width="${w}" height="${h}" rx="${Math.min(18, h / 2)}" fill="${fill}" stroke="${INK}" stroke-width="2"/>`;
  const pill = (cx, cy, w, h, fill) => `<rect x="${r2(cx - w / 2)}" y="${r2(cy - h / 2)}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${INK}" stroke-width="2"/>`;
  // 막대(플라스틱, 유리, 이름 없는 막대). 전하 기호를 줄 수 있다.
  function bar(cx, cy, len, ang, kind, o = {}) {
    const h = 22, fill = kind === 'glass' ? 'url(#l1-glass)' : kind === 'plain' ? 'url(#l1-plain)' : 'url(#g-rod)';
    let s = `<g transform="rotate(${ang} ${cx} ${cy})">` + pill(cx, cy, len, h, fill);
    if (kind === 'glass') s += `<rect x="${cx - len / 2 + 11}" y="${cy - h / 2 + 4}" width="${len - 22}" height="3" rx="1.5" fill="#fff" opacity=".9"/>`;
    if (o.sign) { const n = o.n || 4; for (let i = 0; i < n; i++) s += sign(o.sign, cx - len / 2 + len * (i + 0.8) / (n + 0.6), cy, 7.5); }
    return s + '</g>';
  }

  /* 전하의 이동(그림 보기). 왼쪽은 플라스틱 막대, 오른쪽은 털가죽.
   * p.moves: [{what:'e'|'p', to:'rod'|'fur'}] 한 개 또는 두 개 */
  FIG.l1_move = p => {
    const cy = 50, two = p.moves.length > 1;
    let s = pill(31, cy, 54, 24, 'url(#g-rod)') + K.fur(138, cy, 19, 12);
    s += T(31, 101, '막대', { size: 14 }) + T(138, 101, '털가죽', { size: 14 });
    p.moves.forEach((m, i) => {
      const y = two ? cy + (i ? 11 : -11) : cy, toRod = m.to === 'rod', e = m.what === 'e', col = e ? NEG : POS;
      s += arrow(toRod ? 110 : 62, y, toRod ? 62 : 110, y, { color: col, w: 2.6 });
      const ly = two && i ? y + 18 : y - 19, tw = e ? 28 : 50, x0 = 86 - (15 + 3 + tw) / 2;
      s += sign(e ? '-' : '+', x0 + 7.5, ly, 7) + T(x0 + 18, ly, e ? '전자' : '(+)전하', { size: 14, anchor: 'start' });
    });
    return svg(168, 112, s, '플라스틱 막대와 털가죽 사이에서 전하가 이동하는 방향');
  };

  /* 원자 모형. 가운데 A, 둘레 B */
  FIG.l1_atom = () => {
    const cx = 96, cy = 98, R = 68;
    let s = DEFS + `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#a8b3c2" stroke-width="1.8" stroke-dasharray="5 5"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="21" fill="url(#l1-nuc)" stroke="${INK}" stroke-width="2"/>`;
    const el = [100, 215, 335].map(a => [cx + R * Math.cos(a * Math.PI / 180), cy - R * Math.sin(a * Math.PI / 180)]);
    el.forEach(([x, y]) => { s += `<circle cx="${r2(x)}" cy="${r2(y)}" r="9" fill="url(#l1-el)" stroke="${INK}" stroke-width="2"/>`; });
    s += K.leader(cx + 16, cy - 13, 184, 50) + T(196, 46, 'A', { size: 18, weight: 800 });
    s += K.leader(r2(el[2][0] + 8), r2(el[2][1] + 4), 186, 146) + T(198, 150, 'B', { size: 18, weight: 800 });
    return svg(216, 190, s, '원자의 구조 모형');
  };

  /* 마찰 전과 후의 전자 수 막대그래프. p.groups: [{name, before, after}] */
  FIG.l1_eBars = p => {
    const L = 50, Tm = 44, pw = 262, ph = 150, ymax = p.ymax || 10, Y = v => Tm + ph - v / ymax * ph, bw = 36;
    const C0 = '#b4bdca', C1 = '#4f93e8';
    let s = `<rect x="${L}" y="${Tm}" width="${pw}" height="${ph}" fill="#fbfcfe"/>`;
    for (let v = 1; v <= ymax; v++) {
      s += `<line x1="${L}" y1="${r2(Y(v))}" x2="${L + pw}" y2="${r2(Y(v))}" stroke="${v % 2 ? '#e7ebf0' : '#cfd7e1'}" stroke-width="1"/>`;
      if (v % 2 === 0) s += T(L - 9, Y(v), v, { size: 14, weight: 500, halo: false, anchor: 'end' });
    }
    s += T(L - 9, Y(0), '0', { size: 14, weight: 500, halo: false, anchor: 'end' });
    p.groups.forEach((g, i) => {
      const cx = L + pw * (i + 0.5) / p.groups.length;
      [[g.before, C0, -1], [g.after, C1, 1]].forEach(([v, c, sg]) => {
        const x = cx + (sg < 0 ? -bw - 3 : 3);
        s += `<rect x="${r2(x)}" y="${r2(Y(v))}" width="${bw}" height="${r2(Y(0) - Y(v))}" fill="${c}" stroke="${INK}" stroke-width="1.8"/>`;
      });
      s += T(cx, Tm + ph + 18, g.name, { size: 16.5, weight: 800, halo: false });
    });
    s += `<path d="M${L} ${Tm - 8}V${Tm + ph}H${L + pw + 8}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += T(6, 18, '전자의 수(개)', { size: 14, anchor: 'start' });
    s += `<rect x="158" y="11" width="14" height="14" fill="${C0}" stroke="${INK}" stroke-width="1.6"/>` + T(177, 18, '마찰 전', { size: 14, anchor: 'start', weight: 500 });
    s += `<rect x="240" y="11" width="14" height="14" fill="${C1}" stroke="${INK}" stroke-width="1.6"/>` + T(259, 18, '마찰 후', { size: 14, anchor: 'start', weight: 500 });
    return svg(L + pw + 14, Tm + ph + 34, s, '마찰 전과 후에 두 물체가 가진 전자의 수');
  };

  /* 물체 여러 개가 가진 전하. p.objs: [{name, tint, rows, dx, note}], p.w(물체 폭), p.gap */
  FIG.l1_objs = p => {
    const n = p.objs.length, w = p.w || 112, gap = p.gap == null ? 12 : p.gap, h = p.h || 84, top = 30, hasNote = p.objs.some(o => o.note);
    let s = DEFS;
    p.objs.forEach((o, i) => {
      const cx = 4 + w / 2 + i * (w + gap), cy = top + h / 2;
      s += T(cx, 13, o.name, { size: 17, weight: 800 }) + block(cx, cy, w, h, TINT[o.tint]) + chg(o.rows, cx, cy, o.dx || 21, o.dy || 28, o.r || 8);
      if (o.note) s += T(cx, top + h + 17, o.note, { size: 14, fill: SUB });
    });
    return svg(n * w + (n - 1) * gap + 8, top + h + (hasNote ? 30 : 5), s, p.aria || '물체가 가진 전하를 나타낸 모형');
  };

  /* 마찰 실험 두 가지. p.panels: [{cap, objs:[{name, tint, rows}]}] 물체는 위아래로 놓는다 */
  FIG.l1_twoRubs = p => {
    const pw = 176, gap = 8;
    let s = DEFS;
    p.panels.forEach((pn, i) => {
      const x0 = i * (pw + gap);
      s += `<rect x="${x0}" y="0" width="${pw}" height="150" rx="12" fill="#f4f6f9"/>`;
      pn.objs.forEach((o, k) => {
        const cy = 41 + k * 68, cx = x0 + 101;
        s += T(x0 + 18, cy, o.name, { size: 17, weight: 800, halo: false }) + block(cx, cy, 136, 56, TINT[o.tint]) + chg(o.rows, cx, cy, 20.5, 23, 7.5);
      });
      s += T(x0 + pw / 2, 166, pn.cap, { size: 15, weight: 700 });
    });
    return svg(2 * pw + gap, 178, s, '두 가지 마찰 실험 뒤 물체가 가진 전하를 나타낸 모형');
  };

  /* 플라스틱 막대와 털가죽의 전하 모형. p.rod, p.fur(전하 줄), p.stack(그림 보기용: 위 막대, 아래 털가죽) */
  FIG.l1_rodFur = p => {
    if (p.stack) {
      const s = pill(80, 29, 144, 46, 'url(#g-rod)') + chg(p.rod, 80, 29, 25, 20, 8) + K.fur(80, 100, 62, 25) + chg(p.fur, 80, 100, 22, 20, 8);
      return svg(160, 133, s, '마찰 후 플라스틱 막대와 털가죽이 가진 전하를 나타낸 모형');
    }
    let s = `<rect x="4" y="26" width="336" height="84" rx="12" fill="#f4f6f9"/>` + T(96, 13, '플라스틱 막대', { size: 14.5 }) + T(258, 13, '털가죽', { size: 14.5 });
    s += pill(96, 68, 160, 50, 'url(#g-rod)') + chg(p.rod, 96, 68, 27, 22, 8.5) + K.fur(258, 68, 60, 24) + chg(p.fur, 258, 68, 27, 22, 8.5);
    return svg(344, 114, s, '마찰 전 플라스틱 막대와 털가죽이 가진 전하를 나타낸 모형');
  };

  /* 실에 매단 대전된 공 두 개(그림 보기). p.signs: ['+','-'], p.act: 'repel' | 'attract' | 'straight' */
  FIG.l1_hang = p => {
    const cx = 75, ty = 20, L = 74, g = { repel: [9, 37], attract: [27, 19.5], straight: [21.5, 21.5] }[p.act];
    let s = K.support(cx - 46, cx + 46, 14);
    [-1, 1].forEach((sg, k) => {
      const bx = r2(cx + sg * g[1]), by = r2(ty + Math.sqrt(L * L - (g[1] - g[0]) * (g[1] - g[0])));
      s += K.string(cx + sg * g[0], ty, bx, by) + `<circle cx="${bx}" cy="${by}" r="18" fill="url(#g-foam)" stroke="${INK}" stroke-width="2"/>` + sign(p.signs[k], bx, by, 9.5);
    });
    return svg(150, 118, s, '실에 매단 대전된 공 두 개');
  };

  /* 실에 매단 막대 A에 다른 막대를 가까이 한 모습.
   * p.aKind, p.bKind: 'plastic' | 'glass' | 'plain', p.aSign, p.bSign(전하 기호, 없으면 그리지 않는다), p.bName, p.move: 'toward' | 'away' */
  FIG.l1_swing = p => {
    const bn = p.bName || 'B';
    let s = DEFS + K.support(66, 214, 16) + K.string(126, 22, 100, 112) + K.string(154, 22, 180, 112);
    s += bar(140, 122, 152, 0, p.aKind, { sign: p.aSign, n: 5 }) + bar(290, 102, 104, -22, p.bKind, { sign: p.bSign, n: 3 });
    s += T(48, 122, 'A', { size: 18, weight: 800 }) + T(312, 124, bn, { size: 18, weight: 800 });
    s += p.move === 'toward' ? arrow(112, 158, 172, 158, { w: 2.8 }) : arrow(168, 158, 108, 158, { w: 2.8 });
    s += T(140, 180, 'A가 움직인 방향', { size: 14 });
    return svg(346, 196, s, `실에 매단 막대 A에 막대 ${bn}를 가까이 한 모습`);
  };

  /* 빗에 끌려오는 머리카락. p.sign: 빗에 그릴 전하 기호 */
  FIG.l1_comb = p => {
    const HAIR = '#4e3b2e';
    let s = DEFS;
    [78, 242].forEach(x => { s += `<ellipse cx="${x}" cy="214" rx="9" ry="14" fill="#f2c7a2" stroke="${INK}" stroke-width="2"/>`; });
    s += `<path d="M80 230C80 126 240 126 240 230Z" fill="${HAIR}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    for (let i = 0; i < 9; i++) {
      const x0 = 112 + i * 12, xe = 98 + i * 15.5 + (i % 2 ? 3 : -3), ye = 93 + (i % 3) * 4;
      s += `<path d="M${x0} 172Q${r2((x0 + xe) / 2 + (i - 4) * 5)} 138 ${r2(xe)} ${ye}" fill="none" stroke="${HAIR}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 15; i++) s += `<rect x="${r2(79 + i * 11.2)}" y="50" width="5.2" height="30" rx="2.6" fill="url(#l1-comb)" stroke="${INK}" stroke-width="1.6"/>`;
    s += `<rect x="70" y="30" width="180" height="26" rx="8" fill="url(#l1-comb)" stroke="${INK}" stroke-width="2"/>`;
    for (let i = 0; i < 5; i++) s += sign(p.sign || '-', 94 + i * 33, 43, 7.5);
    s += T(160, 13, '플라스틱 빗', { size: 14.5 });
    s += K.leader(222, 128, 258, 114) + T(262, 110, '머리카락', { size: 14.5, anchor: 'start' });
    return svg(330, 228, s, '플라스틱 빗에 머리카락이 끌려오는 모습');
  };

  /* 여러 가닥으로 찢은 비닐 끈. p.order: ['spread', 'together'] 순서대로 (가), (나) */
  FIG.l1_strings = p => {
    const pw = 164, gap = 8;
    let s = '';
    p.order.forEach((kind, i) => {
      const x0 = i * (pw + gap), cx = x0 + pw / 2;
      s += `<rect x="${x0}" y="0" width="${pw}" height="186" rx="12" fill="#f4f6f9"/>` + K.support(cx - 54, cx + 54, 16) + K.string(cx, 22, cx, 40);
      for (let k = -3; k <= 3; k++) {
        const d = kind === 'spread'
          ? `M${cx + k * 1.6} 48Q${cx + k * 19} ${70 - Math.abs(k) * 3} ${cx + k * 23} ${166 - Math.abs(k) * 15}`
          : `M${cx + k * 1.6} 48Q${cx + k * 3} 110 ${cx + k * 4.4} ${170 - Math.abs(k) * 2}`;
        s += `<path d="${d}" fill="none" stroke="#a97a0c" stroke-width="6.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffd24d" stroke-width="3.8" stroke-linecap="round"/>`;
      }
      s += `<rect x="${cx - 10}" y="37" width="20" height="15" rx="5" fill="#f0b429" stroke="${INK}" stroke-width="2"/>`;
      s += T(cx, 203, i ? '(나)' : '(가)', { size: 15, weight: 700 });
    });
    return svg(2 * pw + gap, 216, s, '비닐 끈을 문지르기 전과 후의 모습');
  };
})(FIG);

/* ====================== 레슨 2 정전기 유도 ====================== */
(function (FIG: any) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, plus, minus, sign, rod, support, string, electroscope, leader, scaleAt, caption } = K;
  const sgn = k => (k === '+' ? '+' : '−');
  const metalBar = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#g-metal)" stroke="${INK}" stroke-width="2"/>`;
  // 절연 받침대: 기둥(y0~y1)과 바닥판
  const stand = (x, y0, y1) => `<rect x="${x - 5}" y="${y0}" width="10" height="${y1 - y0}" fill="#eef1f5" stroke="${INK}" stroke-width="1.8"/><rect x="${x - 34}" y="${y1 - 2}" width="68" height="12" rx="5" fill="#dfe4ea" stroke="${INK}" stroke-width="1.8"/>`;
  const name = (x, y, s) => T(x, y, s, { size: 16, weight: 800, halo: false });

  /* 절연 받침대 위의 금속 막대와 옆에서 가까이 한 대전된 막대.
   * p.rodSide 'L'|'R', p.rodSign '+'|'-'(없으면 부호를 그리지 않고 이름 P만 붙인다), p.pattern(금속 막대 안의 전하, 왼쪽부터. 없으면 그리지 않는다) */
  FIG.l2_bar = p => {
    const right = p.rodSide === 'R', bw = 180, bh = 44, by = 42, bx = right ? 26 : 150, cy = by + bh / 2, rcx = right ? 284 : 72, ends = p.ends || ['A', 'B'];
    let s = stand(bx + bw / 2, by + bh - 2, by + bh + 50) + metalBar(bx, by, bw, bh);
    if (p.pattern) {
      [...p.pattern].forEach((ch, i) => { s += sign(ch, bx + 22 + i * (bw - 44) / (p.pattern.length - 1), cy, 8.5); });
      s += T(bx + 14, by - 16, ends[0], { size: 16, weight: 800 }) + T(bx + bw - 14, by - 16, ends[1], { size: 16, weight: 800 });
    } else s += name(bx + 20, cy, ends[0]) + name(bx + bw - 20, cy, ends[1]);
    s += rod(rcx, cy, 128, 0, p.rodSign ? { sign: p.rodSign, n: 4 } : {});
    s += T(rcx, cy - 27, p.rodSign ? `(${sgn(p.rodSign)})전하로 대전된 막대` : (p.rodName || '대전된 막대 P'), { size: 14 });
    s += T(bx + bw - 44, by + bh + 20, '금속 막대', { size: 14 });
    return svg(356, by + bh + 64, s, '절연 받침대 위에 놓인 금속 막대의 한쪽 끝에 대전된 막대를 가까이 한 모습');
  };

  /* 금속 막대의 가운데 위에서 대전된 막대를 가까이 한 모습. A, B, C는 왼쪽 끝, 가운데, 오른쪽 끝 */
  FIG.l2_barTop = p => {
    const cx = 132, bw = 216, bh = 44, by = 124, bx = cx - bw / 2;
    let s = stand(cx, by + bh - 2, by + bh + 42) + metalBar(bx, by, bw, bh);
    ['A', 'B', 'C'].forEach((n, i) => { s += name(bx + 22 + i * (bw - 44) / 2, by + bh / 2, n); });
    s += rod(cx, 58, 100, 90, {});
    for (let i = 0; i < 4; i++) s += sign(p.rodSign, cx, 8 + 100 * (i + 0.8) / 4.6, 7); // 세운 막대라서 부호는 돌리지 않고 따로 그린다
    s += T(cx + 22, 42, `(${sgn(p.rodSign)})전하로`, { size: 14, anchor: 'start' }) + T(cx + 22, 61, '대전된 막대', { size: 14, anchor: 'start' });
    s += T(bx + bw - 40, by + bh + 20, '금속 막대', { size: 14 });
    return svg(264, by + bh + 58, s, '절연 받침대 위에 놓인 금속 막대의 가운데 위에 대전된 막대를 가까이 한 모습');
  };

  /* 금속 막대 안의 전하 모형 두 판. (가)는 대전체가 없을 때, (나)는 왼쪽에 대전된 막대를 가까이 했을 때.
   * (+)전하 6개는 제자리에 있고 전자 6개만 한쪽으로 옮겨 간다. */
  FIG.l2_model = p => {
    const away = p.rodSign !== '+', bx = 150, bw = 204, n = 6;
    let s = '';
    [['(가)', 50, false], ['(나)', 146, true]].forEach(([cap, cy, near]) => {
      s += `<rect x="4" y="${cy - 44}" width="364" height="88" rx="12" fill="#f4f6f9"/>` + T(26, cy, cap, { size: 15, weight: 700, halo: false });
      s += metalBar(bx, cy - 31, bw, 62);
      for (let i = 0; i < n; i++) {
        const x = bx + bw * (i + 0.5) / n;
        s += plus(x, cy - 14, 7.5) + minus(!near ? x : away ? bx + bw - 14 - (n - 1 - i) * 19 : bx + 14 + i * 19, cy + 14, 7.5);
      }
      if (near) s += rod(94, cy, 92, 0, { sign: p.rodSign, n: 3 });
    });
    s += plus(124, 206, 7.5) + T(136, 206, '(+)전하', { size: 14, anchor: 'start' }) + minus(214, 206, 7.5) + T(226, 206, '전자', { size: 14, anchor: 'start' });
    return svg(372, 220, s, '대전된 막대를 가까이 하기 전과 가까이 했을 때 금속 막대 안의 전하 모형');
  };

  /* 책상 위에 눕혀 놓은 알루미늄 캔과 대전된 풍선. P는 풍선과 가까운 쪽, Q는 먼 쪽 */
  FIG.l2_can = p => {
    const sg = p.sign || '-', bx = 72, by = 98, fx = 226, fy = 124, R = 40, dx = 26, dy = -12, ty = fy + R + 2;
    // 책상
    let s = `<polygon points="118,${ty} 304,${ty} 343,${ty - 18} 157,${ty - 18}" fill="#f1dcbb" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><rect x="118" y="${ty}" width="186" height="11" fill="url(#g-wood)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><polygon points="304,${ty} 343,${ty - 18} 343,${ty - 7} 304,${ty + 11}" fill="#b98d55" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    // 풍선
    s += `<path d="M${bx} ${by + 64}q-8 20 -24 34" fill="none" stroke="#7b8696" stroke-width="1.8"/>`;
    s += `<ellipse cx="${bx}" cy="${by}" rx="46" ry="56" fill="#f58aa0" stroke="${INK}" stroke-width="2"/><ellipse cx="${bx - 19}" cy="${by - 25}" rx="8" ry="15" fill="#fff" opacity=".5" transform="rotate(24 ${bx - 19} ${by - 25})"/>`;
    s += `<path d="M${bx - 7} ${by + 65}L${bx} ${by + 55}L${bx + 7} ${by + 65}Z" fill="#e96884" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
    [[8, -36], [27, -14], [28, 14], [10, 36], [-15, 27], [-23, 3]].forEach(([x, y]) => { s += sign(sg, bx + x, by + y, 7); });
    // 캔: 뒤쪽 면까지 이어지는 몸통, 앞쪽 면
    const m = Math.hypot(dx, dy), px = -dy / m * R, py = dx / m * R;
    s += `<path d="M${r2(fx - px)} ${r2(fy - py)}L${r2(fx + dx - px)} ${r2(fy + dy - py)}A${R} ${R} 0 0 1 ${r2(fx + dx + px)} ${r2(fy + dy + py)}L${r2(fx + px)} ${r2(fy + py)}Z" fill="url(#g-metal)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<circle cx="${fx}" cy="${fy}" r="${R}" fill="#eef1f5" stroke="${INK}" stroke-width="2"/><circle cx="${fx}" cy="${fy}" r="${R - 6}" fill="none" stroke="#9ea8b5" stroke-width="1.6"/>`;
    s += name(fx - 20, fy, 'P') + name(fx + 20, fy, 'Q');
    s += T(bx, by - 72, '풍선', { size: 14.5 }) + T(fx + 14, fy - 68, '알루미늄 캔', { size: 14.5 });
    return svg(348, ty + 16, s, '책상 위에 눕혀 놓은 알루미늄 캔에 대전된 풍선을 가까이 가져간 모습');
  };

  /* 실에 매단 금속 공의 전하 분포와 기울어진 모습(그림 보기용). 막대는 오른쪽에 있다.
   * p.near: 막대와 가까운 오른쪽의 전하('+'|'-', 없으면 고르게 섞임), p.tilt: 1 막대 쪽, -1 반대쪽, 0 그대로 */
  FIG.l2_ballChoice = p => {
    const px = 64, py = 20, L = 80, R = 26, dx = (p.tilt || 0) * 16, bx = px + dx, by = py + Math.sqrt(L * L - dx * dx);
    let s = support(22, 106, 14) + `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + L + R + 8}" stroke="${SUB}" stroke-width="1.3" stroke-dasharray="4 4"/>`;
    s += string(px, py, r2(bx - dx / L * R), r2(by - (by - py) / L * R)) + `<circle cx="${r2(bx)}" cy="${r2(by)}" r="${R}" fill="url(#g-ball)" stroke="${INK}" stroke-width="2"/>`;
    const far = p.near === '+' ? '-' : '+';
    [[-12, -13], [-15, 0], [-12, 13], [12, -13], [15, 0], [12, 13]].forEach(([x, y], i) => {
      const k = p.near ? (x > 0 ? p.near : far) : '+-+-+-'[i];
      s += sign(k, bx + x, by + y, 5.8);
    });
    s += rod(141, py + L, 46, 0, { sign: p.rodSign || '+', n: 2, h: 20 });
    return svg(168, py + L + R + 14, s, '실에 매단 금속 공 안의 전하 분포와 금속 공이 움직인 모습');
  };

  /* 검전기의 구조. A 금속판, B 금속 막대, C 금속박 */
  FIG.l2_scopeParts = () => {
    const cx = 84, py = 20;
    let s = electroscope(cx, py, { leaf: 1.6 });
    [['A', py, cx + 40], ['B', py + 66, cx + 6], ['C', py + 128, cx + 6]].forEach(([n, y, x]) => { s += leader(x, y, 164, y) + T(176, y, n, { size: 16, weight: 800 }); });
    return svg(204, py + 184, s, '대전되지 않은 검전기의 구조');
  };

  /* 검전기 여러 개를 나란히. 금속판 위에 막대(물체)를 가까이 한 모습.
   * p.items: [{ label(막대 위 이름), sign(막대의 전하, 없으면 그리지 않는다), leaf(금속박 각도), cap }] 둘이면 폭 176씩, 셋이면 120씩 */
  FIG.l2_scopes = p => {
    const three = p.items.length >= 3, pw = three ? 120 : 176, k = three ? 0.74 : 0.8, py = 72, bottom = py + 176 * k;
    let s = '';
    p.items.forEach((o, i) => {
      const cx = i * (pw + 8) + pw / 2;
      s += T(cx, 13, o.label, { size: 14 }) + rod(cx, 39, three ? 92 : 124, 0, o.sign ? { sign: o.sign, n: 4, h: 20 } : { h: 20 });
      s += scaleAt(cx, py, k, electroscope(cx, py, { leaf: o.leaf == null ? 1.6 : o.leaf })) + caption(cx, bottom + 16, o.cap);
    });
    return svg(p.items.length * (pw + 8) - 8, bottom + 28, s, '검전기의 금속판에 물체를 가까이 했을 때 금속박의 모습');
  };

  /* 검전기의 전하 분포와 금속박(그림 보기용). 막대는 금속판 바로 위에 있다.
   * p.rodSign, p.plate(금속판의 전하), p.leafSign(금속박의 전하), p.leaf(각도) */
  FIG.l2_scopeChoice = p => {
    const cx = 78, py = 52, k = 0.85, la = p.leaf, a = la * Math.PI / 180, ly = py + 94 * k, L = 52 * k;
    let s = rod(cx, 19, 104, 0, { sign: p.rodSign, n: 3, h: 20 }) + scaleAt(cx, py, k, electroscope(cx, py, { leaf: la }));
    [-1, 0, 1].forEach(i => { s += sign(p.plate, cx + i * 19, py - 1, 6); });
    [-1, 1].forEach(sd => [0.36, 0.82].forEach(t => { s += sign(p.leafSign, cx + sd * (L * t * Math.sin(a) + 11 * Math.cos(a)), ly + L * t * Math.cos(a) - 11 * Math.sin(a), 6); }));
    return svg(156, py + 176 * k + 6, s, '검전기의 전하 분포와 금속박의 모습');
  };

  /* 대전된 막대, 절연 받침대 위의 금속 막대(A, B), 실에 매단 금속 공을 한 줄로 놓은 모습 */
  FIG.l2_chain = p => {
    const cy = 104;
    let s = stand(192, cy + 20, cy + 76) + metalBar(122, cy - 22, 140, 44) + name(142, cy, 'A') + name(242, cy, 'B');
    s += rod(60, cy, 104, 0, { sign: p.rodSign, n: 4 }) + T(72, cy - 38, `(${sgn(p.rodSign)})전하로 대전된 막대`, { size: 14 }) + T(204, cy - 38, '금속 막대', { size: 14 });
    s += support(274, 352, 16) + string(313, 22, 313, cy - 23) + `<circle cx="313" cy="${cy}" r="24" fill="url(#g-ball)" stroke="${INK}" stroke-width="2"/>` + T(313, cy + 42, '금속 공', { size: 14 });
    return svg(360, cy + 92, s, '대전된 막대, 금속 막대, 실에 매단 금속 공이 한 줄로 놓인 모습');
  };

  /* 수도꼭지에서 흘러내리는 가는 물줄기와 대전된 빗 */
  FIG.l2_water = p => {
    const sg = p.sign || '-', wx = 176;
    // 물줄기
    let s = `<rect x="${wx - 3.5}" y="62" width="7" height="170" fill="#9fd6f7" stroke="#4a9bd4" stroke-width="1.4"/><line x1="${wx - 1}" y1="66" x2="${wx - 1}" y2="228" stroke="#fff" stroke-width="1.2" opacity=".7"/>`;
    // 수도꼭지
    s += `<rect x="232" y="8" width="8" height="18" fill="#9ea8b5" stroke="${INK}" stroke-width="1.8"/><rect x="216" y="2" width="40" height="10" rx="5" fill="#596373" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<path d="M292 24H${wx + 6}a16 16 0 0 0 -16 16V58h20V48a6 6 0 0 1 6 -6H292Z" fill="url(#g-metal)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><rect x="${wx - 13}" y="56" width="26" height="8" rx="2.5" fill="#9ea8b5" stroke="${INK}" stroke-width="1.8"/>`;
    // 빗
    for (let i = 0; i < 12; i++) s += `<rect x="${32 + i * 7.3}" y="134" width="3.8" height="22" rx="1.9" fill="#b9a7f5" stroke="${INK}" stroke-width="1.2"/>`;
    s += `<rect x="26" y="116" width="96" height="21" rx="7" fill="url(#g-rod)" stroke="${INK}" stroke-width="2"/>`;
    for (let i = 0; i < 4; i++) s += sign(sg, 44 + i * 20, 126.5, 6.5);
    s += arrow(128, 126, 156, 126, { color: SUB, w: 2.2 });
    s += T(74, 98, '대전된 빗', { size: 14.5 }) + leader(wx + 6, 190, 204, 190) + T(208, 190, '물줄기', { size: 14.5, anchor: 'start' });
    return svg(292, 232, s, '수도꼭지에서 흘러내리는 가는 물줄기에 대전된 빗을 가까이 가져가는 모습');
  };
})(FIG);

/* ====================== 레슨 3 전류와 전압 ====================== */
(function (FIG: any) {
  const K = FIG.kit;
  const { INK, SUB, POS, NEG, r2, svg, T, arrow, plus, minus, poly, line2, wire, dot, loop, battery, bulb, meter, caption, scaleAt, circuitPanel } = K;
  const WATER = '#93cff5', WATER_D = '#1c6fc4', WOOD_D = '#8a6238', ATOM_ARROW = '#c2333a';

  /* ---------- 물의 흐름 모형 ----------
   * 펌프가 아래 물받이의 물을 위 물탱크로 끌어 올리고, 물은 밸브가 달린 관을 지나 떨어지면서 물레방아를 돌린 뒤 물받이로 돌아온다.
   * o.x0 물탱크 왼쪽 x, o.T 물탱크 윗변 y(작을수록 높다), o.wx 물레방아 중심 x. 돌려주는 at에는 이름표를 붙일 자리가 들어 있다. */
  function waterWheel(cx, cy, r) {
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff8ec"/>`, pads = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * 45 + 22.5) * Math.PI / 180, c = Math.cos(a), n = Math.sin(a);
      const q = (rad, tan) => [cx + c * rad - n * tan, cy + n * rad + c * tan];
      s += line2([[cx, cy], q(r - 1, 0)], WOOD_D, 2.6);
      pads += poly([q(r - 2.5, -5.5), q(r + 6.5, -5.5), q(r + 6.5, 5.5), q(r - 2.5, 5.5)], 'url(#g-wood)', { sw: 1.6 });
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="6.4"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#d9b27c" stroke-width="3.6"/>`;
    return s + pads + `<circle cx="${cx}" cy="${cy}" r="5" fill="#596373" stroke="${INK}" stroke-width="1.8"/>`;
  }
  function pump(x, y) {
    let s = `<rect x="${x - 24}" y="${y + 15}" width="48" height="8" rx="3" fill="#596373" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<rect x="${x - 20}" y="${y - 20}" width="40" height="38" rx="9" fill="url(#g-metal)" stroke="${INK}" stroke-width="2"/>`;
    s += `<circle cx="${x}" cy="${y - 1}" r="12.5" fill="#eef8ff" stroke="${INK}" stroke-width="1.8"/>`;
    for (let i = 0; i < 3; i++) {
      const a = (i * 120 - 90) * Math.PI / 180, b = a + 0.9;
      s += `<path d="M${x} ${y - 1}Q${r2(x + 6 * Math.cos(b))} ${r2(y - 1 + 6 * Math.sin(b))} ${r2(x + 9.5 * Math.cos(a))} ${r2(y - 1 + 9.5 * Math.sin(a))}" fill="none" stroke="${WATER_D}" stroke-width="3" stroke-linecap="round"/>`;
    }
    return s + `<circle cx="${x}" cy="${y - 1}" r="2.6" fill="${INK}"/>`;
  }
  function waterModel(o) {
    const x0 = o.x0, T0 = o.T, wx = o.wx, wy = 146, R = 20, yb = 200, yw = 182, br = wx + 34;
    const tr = x0 + 68, rx = x0 + 26, sx = wx + 10, py = T0 + 26, vx = Math.round((tr + sx - 6) / 2), lv = T0 + 11, pcx = x0 + 33, pcy = 164;
    const flow = (x1, y1, x2, y2) => arrow(x1, y1, x2, y2, { color: WATER_D, w: 2.6 });
    // 아래 물받이
    let s = `<rect x="${x0}" y="${yw}" width="${br - x0}" height="${yb - yw}" fill="${WATER}"/>`;
    s += `<path d="M${x0} 168V${yb}H${br}V168" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    // 물레방아: 받침, 떨어지는 물, 바퀴, 바퀴에서 흘러내리는 물
    s += poly([[wx - 4, wy], [wx + 4, wy], [wx + 8, yb - 1], [wx - 8, yb - 1]], '#c9ced6', { sw: 1.8 });
    s += `<rect x="${sx - 4}" y="${py + 20}" width="8" height="${wy - R - 5 - py - 20}" fill="${WATER}"/>`;
    s += `<path d="M${wx + R + 5} ${wy + 6}q7 12 3 ${yw - wy - 5}" fill="none" stroke="${WATER}" stroke-width="5" stroke-linecap="round"/>`;
    s += waterWheel(wx, wy, R);
    // 올림관과 펌프
    s += `<rect x="${rx}" y="${T0 + 42}" width="14" height="${pcy - 20 - T0 - 42}" fill="${WATER}" stroke="${INK}" stroke-width="2"/>`;
    s += pump(pcx, pcy);
    // 물탱크
    s += `<rect x="${x0}" y="${T0}" width="68" height="42" fill="#f3fafe"/><rect x="${x0}" y="${lv}" width="68" height="${T0 + 42 - lv}" fill="${WATER}"/>`;
    s += `<line x1="${x0 + 8}" y1="${lv + 5}" x2="${x0 + 24}" y2="${lv + 5}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M${x0} ${T0}V${T0 + 42}H${tr}V${T0}" fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += `<rect x="${rx + 1}" y="${T0 + 40.5}" width="12" height="3" fill="${WATER}"/>`;
    // 가로관과 밸브
    s += `<path d="M${tr} ${py}H${sx + 6}V${py + 20}H${sx - 6}V${py + 12}H${tr}Z" fill="${WATER}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="${tr - 1.5}" y="${py + 1}" width="3" height="10" fill="${WATER}"/>`;
    s += `<line x1="${vx}" y1="${py - 2}" x2="${vx}" y2="${py - 11}" stroke="${INK}" stroke-width="3.4"/>`;
    s += `<rect x="${vx - 7.5}" y="${py - 4}" width="15" height="20" rx="3.5" fill="#dfe4ea" stroke="${INK}" stroke-width="2"/>`;
    s += `<rect x="${vx - 12}" y="${py - 17}" width="24" height="7.5" rx="3.6" fill="${POS}" stroke="${INK}" stroke-width="1.8"/>`;
    // 물의 흐름
    const upTop = T0 + 49, upBot = pcy - 27;
    s += flow(rx + 26, upBot, rx + 26, upTop);
    s += flow(tr + 6, py + 24, sx - 20, py + 24);
    if (!o.noDown && wy - R - 14 - (py + 26) > 16) s += flow(sx + 13, py + 26, sx + 13, wy - R - 14);
    s += flow(wx - 14, yw + 9, pcx + 32, yw + 9);
    // 물의 높이 차
    const mx = x0 - 13, mid = (lv + yw) / 2;
    s += `<path d="M${x0 - 22} ${lv}H${x0 - 3}M${x0 - 22} ${yw}H${x0 - 3}" stroke="${SUB}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
    s += arrow(mx, mid, mx, lv + 2, { w: 1.8, head: 8 }) + arrow(mx, mid, mx, yw - 2, { w: 1.8, head: 8 });
    return { body: s, at: { pump: [pcx, pcy], valve: [vx, py - 17], wheel: [wx, wy], mark: [mx, mid], flow: [(tr + sx - 14) / 2, py + 24], right: br, R } };
  }
  const tag = (x, y, s) => T(x, y, s, { size: 16, weight: 800 });

  /* 물의 흐름 모형과 전기 회로를 나란히. p.letters: [펌프, 밸브, 물레방아]에 붙일 글자 */
  FIG.l3_waterCircuit = p => {
    const L = p.letters || ['A', 'B', 'C'], m = waterModel({ x0: 26, T: 30, wx: 156 }), a = m.at;
    let s = m.body;
    s += tag(a.pump[0] + 36, a.pump[1] - 2, L[0]) + tag(a.valve[0], a.valve[1] - 12, L[1]) + tag(a.wheel[0] - 42, a.wheel[1] - 26, L[2]);
    s += K.leader(a.wheel[0] - 34, a.wheel[1] - 21, a.wheel[0] - 25, a.wheel[1] - 15);
    s += caption(108, 222, '물의 흐름 모형');
    const pn = circuitPanel({ w: 168, t: 70, dy: 82, small: true, top: [{ t: 'bat' }], bottom: [{ t: 'sw', fx: 0.27 }, { t: 'bulb', fx: 0.76 }] });
    s += `<g transform="translate(202 0)">${pn.body}</g>` + caption(286, 222, '전기 회로');
    return svg(372, 236, s, '펌프, 밸브, 물레방아로 이루어진 물의 흐름 모형과 전지, 스위치, 전구로 이루어진 전기 회로');
  };

  /* 물의 흐름 모형 하나에 이름을 붙인 것. p.height, p.flow: 물의 높이 차와 물의 흐름에 붙일 글자 */
  FIG.l3_water = p => {
    const m = waterModel({ x0: 62, T: 34, wx: 204 }), a = m.at;
    let s = m.body;
    s += T(a.pump[0] + 44, a.pump[1] - 2, '펌프', { size: 15 }) + T(a.valve[0], a.valve[1] - 12, '밸브', { size: 15 });
    s += T(a.right + 8, a.wheel[1], '물레방아', { size: 15, anchor: 'start' });
    if (p.height) s += tag(a.mark[0] - 22, a.mark[1], p.height);
    if (p.flow) s += T(a.flow[0], a.flow[1] + 16, p.flow, { size: 16, weight: 800, fill: WATER_D });
    return svg(308, 210, s, '펌프, 밸브, 물레방아로 이루어진 물의 흐름 모형');
  };

  /* 물을 끌어 올리는 높이만 다른 두 모형. p.tops: [(가)의 물탱크 높이, (나)의 물탱크 높이] */
  FIG.l3_water2 = p => {
    const tops = p.tops || [58, 14]; let s = '';
    tops.forEach((T0, i) => {
      const m = waterModel({ x0: 26, T: T0, wx: 144, noDown: true });
      s += `<g transform="translate(${i * 192} 0)">${m.body}${caption(102, 220, i ? '(나)' : '(가)')}</g>`;
    });
    return svg(374, 234, s, '펌프가 물을 끌어 올리는 높이만 다른 두 물의 흐름 모형');
  };

  /* ---------- 도선 속 모형(작은 칸) ----------
   * o.e 전자: right | left | random | still | none,  o.a 원자: (없음) | right | left | random */
  const ATOMS = [[36, 29], [84, 29], [132, 29], [36, 63], [84, 63], [132, 63]];
  const ELEC = [[58, 12], [112, 12], [40, 46], [84, 46], [128, 46], [58, 80], [112, 80]];
  const RAND_E = [350, 185, 45, 215, 135, 180, 0], RAND_A = [150, 0, 30, 210, 180, 330];
  const ang = (mode, i, tbl) => (mode === 'right' ? 0 : mode === 'left' ? 180 : tbl[i]) * Math.PI / 180;
  function wireBody(ox, oy, o) {
    let s = `<rect x="${ox + 6}" y="${oy}" width="156" height="92" rx="15" fill="#fbead9" stroke="${INK}" stroke-width="2"/>`;
    ATOMS.forEach(([x, y], i) => {
      if (o.a) { const a = ang(o.a, i, RAND_A), c = Math.cos(a), n = -Math.sin(a); s += arrow(ox + x + c * 11, oy + y + n * 11, ox + x + c * 25, oy + y + n * 25, { color: ATOM_ARROW, w: 2, head: 7 }); }
      s += plus(ox + x, oy + y, 8.5);
    });
    if (o.e !== 'none') ELEC.forEach(([x, y], i) => {
      if (o.e !== 'still') { const a = ang(o.e, i, RAND_E), c = Math.cos(a), n = -Math.sin(a); s += arrow(ox + x + c * 8, oy + y + n * 8, ox + x + c * 22, oy + y + n * 22, { color: NEG, w: 2, head: 7 }); }
      s += minus(ox + x, oy + y, 6);
    });
    return s;
  }
  /* 그림 보기용 한 칸. p.ends: [왼쪽 끝 이름, 오른쪽 끝 이름] */
  FIG.l3_wire = p => {
    const e = p.ends, oy = e ? 24 : 4;
    let s = wireBody(0, oy, p);
    if (e) s += T(16, 11, e[0], { size: 16, weight: 800 }) + T(152, 11, e[1], { size: 16, weight: 800 });
    return svg(168, oy + 96, s, '도선 속 원자와 전자의 모습 보기');
  };
  /* (가)와 (나) 두 칸. p.panels: [{e, a}, {e, a}], 양 끝은 A와 B */
  FIG.l3_wires = p => {
    let s = '';
    p.panels.forEach((o, i) => {
      const ox = i * 186;
      s += wireBody(ox, 24, o) + T(ox + 16, 11, 'A', { size: 16, weight: 800 }) + T(ox + 152, 11, 'B', { size: 16, weight: 800 }) + caption(ox + 84, 132, i ? '(나)' : '(가)');
    });
    s += plus(118, 158, 8.5) + T(131, 158, '원자', { size: 14, anchor: 'start' }) + minus(206, 158, 6) + T(217, 158, '전자', { size: 14, anchor: 'start' });
    return svg(354, 174, s, '같은 도선의 한 부분에서 전류가 흐를 때와 흐르지 않을 때 전자가 움직이는 모습');
  };

  /* 극을 가린 전지와 전구를 연결한 회로. 도선의 P와 Q 사이를 넓혀 전자가 이동하는 방향을 보여 준다. p.dir: right | left */
  FIG.l3_loop = p => {
    const l = 26, r = 314, t = 44, b = 136, d = p.dir === 'left' ? -1 : 1, x1 = 56, x2 = 198;
    let s = loop(l, t, r, b);
    s += `<rect x="126" y="${t - 18}" width="88" height="36" rx="9" fill="#fff" stroke="${INK}" stroke-width="2"/>` + T(170, t, '전지', { size: 15.5, halo: false, weight: 700 });
    s += tag(112, t - 17, 'X') + tag(228, t - 17, 'Y');
    s += bulb(258, b, { r: 17 });
    s += `<rect x="${x1}" y="${b - 21}" width="${x2 - x1}" height="42" rx="13" fill="#fbead9" stroke="${INK}" stroke-width="2"/>`;
    [[0, -9], [42, 9], [84, -9]].forEach(([dx, dy]) => {
      const x = (d > 0 ? 76 : 94) + dx, y = b + dy;
      s += arrow(x + d * 9, y, x + d * 26, y, { color: NEG, w: 2, head: 7 }) + minus(x, y, 6.5);
    });
    s += tag(x1, b + 36, 'P') + tag(x2, b + 36, 'Q');
    s += minus(146, b + 58, 6.5) + T(158, b + 58, '전자', { size: 14, anchor: 'start' });
    return svg(340, b + 72, s, '전지에 전구를 연결한 회로에서 도선의 한 부분 속 전자가 이동하는 방향');
  };

  /* 전구에 전류계(A)와 전압계(V)를 연결하는 방법 보기. p.mode: ok | swap | series | parallel | acrossA */
  FIG.l3_meterPick = p => {
    const l = 16, r = 152, t = 24, b = 100, yv = 146, m = p.mode;
    const M = (x, y, ch) => scaleAt(x, y, 0.82, meter(x, y, ch, {}));
    const branch = (x, hw, y, ch) => wire([[x - hw, b], [x - hw, y], [x + hw, y], [x + hw, b]]) + dot(x - hw, b) + dot(x + hw, b) + M(x, y, ch);
    let s = loop(l, t, r, b) + scaleAt(84, t, 0.82, battery(84, t, { labels: false }));
    if (m === 'series') s += M(44, b, 'A') + bulb(84, b, { r: 13 }) + M(124, b, 'V');
    else if (m === 'parallel') s += bulb(84, b, { r: 13 }) + branch(84, 32, 60, 'A') + branch(84, 32, yv, 'V');
    else {
      const a = m === 'swap' ? 'V' : 'A', v = m === 'swap' ? 'A' : 'V';
      s += M(52, b, a) + bulb(110, b, { r: 13 }) + (m === 'acrossA' ? branch(52, 27, yv, v) : branch(110, 28, yv, v));
    }
    return svg(168, 166, s, '전구에 전류계와 전압계를 연결한 회로 보기');
  };
})(FIG);

/* ====================== 레슨 4 저항과 옴의 법칙 ====================== */
(function (FIG: any) {
  const K = FIG.kit;
  const { INK, SUB, NEG, COPPER, r2, svg, T, arrow, plus, minus, line2, leader, wire, dot, loop, battery, resistor, sw, caption, circuitPanel, rowOf } = K;
  const RED = '#e5484d', BLUE = '#2f7fe0';

  /* 도선 속에서 전자 한 개가 원자와 충돌하며 지나가는 길(두 판).
   * 왼쪽 (가)는 원자가 성기게 놓여 충돌이 2번, 오른쪽 (나)는 촘촘하게 놓여 충돌이 7번이다. */
  const WIRE_MODEL = {
    sparse: {
      atoms: [[48, 38], [112, 34], [150, 44], [80, 104], [144, 102], [26, 106]],
      path: [[24, 72], [74, 96], [106, 43], [162, 74]]
    },
    dense: {
      atoms: [[30, 34], [70, 34], [110, 34], [150, 34], [50, 69], [90, 69], [130, 69], [30, 104], [70, 104], [110, 104], [150, 104]],
      path: [[24, 54], [44, 61], [65, 43], [71, 94], [84, 78], [104, 96], [124, 78], [144, 96], [163, 83]]
    }
  };
  function spark(x, y) {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8, r = i % 2 ? 2.6 : 6.2; pts.push(r2(x + r * Math.cos(a)) + ',' + r2(y + r * Math.sin(a))); }
    return `<polygon points="${pts.join(' ')}" fill="#ffd24a" stroke="#b7791f" stroke-width="1" stroke-linejoin="round"/>`;
  }
  function wireModel(ox, set, name) {
    const mv = ([x, y]) => [ox + x, y], pts = set.path.map(mv), n = pts.length;
    let s = `<rect x="${ox + 8}" y="14" width="160" height="110" rx="14" fill="#fbead9" stroke="${INK}" stroke-width="2"/>`;
    s += line2(pts.slice(0, n - 1), NEG, 2.2) + arrow(pts[n - 2][0], pts[n - 2][1], pts[n - 1][0], pts[n - 1][1], { color: NEG, w: 2.2, head: 9 });
    pts.slice(1, n - 1).forEach(q => { s += spark(q[0], q[1]); });
    set.atoms.forEach(a => { s += plus(ox + a[0], a[1], 9); });
    s += minus(pts[0][0], pts[0][1], 6.5) + caption(ox + 88, 142, name);
    return s;
  }
  FIG.l4_atoms = () => {
    let s = wireModel(0, WIRE_MODEL.sparse, '(가)') + wireModel(184, WIRE_MODEL.dense, '(나)');
    s += plus(116, 172, 8) + T(129, 172, '원자', { size: 14, anchor: 'start' }) + minus(204, 172, 6.5) + T(215, 172, '전자', { size: 14, anchor: 'start' });
    return svg(360, 188, s, '물질이 다른 두 도선 속에서 전자가 원자와 충돌하며 지나가는 길');
  };

  /* 끝을 벗겨 낸 전선. 속(A)은 구리선, 겉(B)은 고무 */
  FIG.l4_cable = () => {
    const cy = 98, x1 = 196, x2 = 322;
    // 겉
    let s = `<path d="M-8 ${cy - 25}H${x1}V${cy + 25}H-8Z" fill="#3f4959" stroke="${INK}" stroke-width="2"/>`;
    s += `<rect x="-8" y="${cy + 9}" width="${x1 + 8}" height="15" fill="#262e3b" opacity=".55"/>`;
    s += `<rect x="-8" y="${cy - 19}" width="${x1 - 2}" height="5" rx="2.5" fill="#fff" opacity=".3"/>`;
    s += `<ellipse cx="${x1}" cy="${cy}" rx="9" ry="25" fill="#596373" stroke="${INK}" stroke-width="2"/>`;
    // 속
    s += `<path d="M${x1} ${cy - 11}H${x2}a4 11 0 0 1 0 22H${x1}a4 11 0 0 1 0 -22Z" fill="${COPPER}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    for (let x = x1 + 10; x < x2 - 6; x += 13) s += `<path d="M${x} ${cy + 10}q3 -10 9 -20" fill="none" stroke="#8a4a1c" stroke-width="1.4" stroke-linecap="round"/>`;
    s += `<rect x="${x1 + 6}" y="${cy - 8}" width="${x2 - x1 - 10}" height="3.6" rx="1.8" fill="#fff" opacity=".45"/>`;
    s += `<ellipse cx="${x2}" cy="${cy}" rx="4" ry="11" fill="#e9ad78" stroke="${INK}" stroke-width="2"/>`;
    // 이름
    s += leader(262, cy - 14, 262, 44) + T(262, 30, 'A(구리)', { size: 16, weight: 700 });
    s += leader(96, cy - 28, 96, 44) + T(96, 30, 'B(고무)', { size: 16, weight: 700 });
    return svg(340, 140, s, '끝부분의 겉을 벗겨 내어 속의 구리선이 드러난 전선');
  };

  /* 전지 1개 회로와 전지 2개 회로(같은 니크롬선). p.reads: [왼쪽 전류계 값, 오른쪽 전류계 값] */
  FIG.l4_cells = p => {
    const reads = p.reads || ['0.2 A', '?'];
    const mk = (n, read, name) => {
      const top = n === 1 ? [{ t: 'bat', labels: false }] : [{ t: 'bat', labels: false, fx: 0.29 }, { t: 'bat', labels: false, fx: 0.71 }];
      const pn = circuitPanel({ w: 176, t: 40, dy: 84, small: true, top, bottom: [{ t: 'res', label: '니크롬선', fx: 0.33 }, { t: 'A', read, fx: 0.83 }] });
      const xl = n === 1 ? 88 - 24 : 16 + 144 * 0.29 - 24, xr = n === 1 ? 88 + 24 : 16 + 144 * 0.71 + 24;
      pn.body += T(xl, 17, '(+)', { size: 14 }) + T(xr, 17, '(−)', { size: 14 }) + caption(88, 190, name);
      pn.h = 202;
      return pn;
    };
    const row = rowOf([mk(1, reads[0], '(가)'), mk(2, reads[1], '(나)')], 8);
    return svg(row.w, row.h, row.body, '전지 1개에 니크롬선을 연결한 회로와 전지 2개를 한 줄로 이어 같은 니크롬선을 연결한 회로');
  };

  /* 니크롬선, 전류계, 전압계 회로에서 전류계의 값만 보여 주는 판(전압계의 값을 묻는다).
   * 공용 ohmCircuit은 전류계 값 상자가 도선 모서리를 덮어서, 값 상자를 전류계 왼쪽 이름 아래에 둔다. p.R, p.A */
  FIG.l4_ohmA = p => {
    const padL = 78, t = 34, dy = 86, l = 16 + padL, mid = t + dy / 2;
    const pn = circuitPanel({ w: 340, padL, dy, top: [{ t: 'bat' }], left: { t: 'A', label: '전류계', lx: l - 54, ly: mid - 15 }, bottom: [{ t: 'res', label: `니크롬선 ${p.R} Ω` }], vm: { over: 0, read: '?', label: '전압계' } });
    const bx = l - 54, by = mid + 11, bw = 64;
    pn.body += `<rect x="${bx - bw / 2}" y="${by - 12}" width="${bw}" height="24" rx="6" fill="#eef4ff" stroke="#9db7e0" stroke-width="1.4"/>` + T(bx, by, p.A, { size: 14.5, halo: false, fill: '#1f4e96', weight: 700 });
    return svg(pn.w, pn.h, pn.body, '니크롬선에 전류계와 전압계를 연결한 회로와 전류계가 나타내는 값');
  };

  /* 모눈이 있는 작은 그래프에 직선 A, B. p.lines: [{from:[x,y], to:[x,y], label, at:[x,y]}] (모눈 단위 0~4) */
  FIG.l4_miniAB = p => {
    const W = 168, H = 170, x0 = 34, y0 = H - 28, u = 26, n = 4, pw = u * n;
    const X = v => x0 + v * u, Y = v => y0 - v * u;
    let s = `<rect x="${x0}" y="${y0 - pw}" width="${pw}" height="${pw}" fill="#fbfcfe"/>`;
    for (let i = 1; i <= n; i++) s += `<line x1="${X(i)}" y1="${y0}" x2="${X(i)}" y2="${Y(n)}" stroke="#d5dde7" stroke-width="1"/><line x1="${x0}" y1="${Y(i)}" x2="${X(n)}" y2="${Y(i)}" stroke="#d5dde7" stroke-width="1"/>`;
    s += arrow(x0, y0, x0 + pw + 13, y0, { w: 1.8 }) + arrow(x0, y0, x0, y0 - pw - 13, { w: 1.8 });
    s += T(x0 - 10, y0 + 12, '0', { size: 13, weight: 500, halo: false }) + T(x0 + 4, y0 - pw - 24, '전류', { size: 14 }) + T(x0 + pw + 13, y0 + 16, '전압', { size: 14, anchor: 'end' });
    (p.lines || []).forEach(ln => {
      const a = ln.from || [0, 0], b = ln.to, c = ln.label === 'A' ? RED : BLUE;
      s += `<line x1="${r2(X(a[0]))}" y1="${r2(Y(a[1]))}" x2="${r2(X(b[0]))}" y2="${r2(Y(b[1]))}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    });
    (p.lines || []).forEach(ln => { s += T(X(ln.at[0]), Y(ln.at[1]), ln.label, { size: 15, weight: 800, fill: ln.label === 'A' ? RED : BLUE }); });
    return svg(W, H, s, '니크롬선 A와 B의 전압과 전류 그래프 보기');
  };

  /* 니크롬선 실험 회로. 기구 자리 두 곳을 (가)(나)로 비워 둔다. (가)는 니크롬선과 한 줄로, (나)는 니크롬선의 양 끝에 나란히 */
  FIG.l4_setup = () => {
    const l = 36, r = 296, t = 42, b = 126, xr = 166, hw = 60, y2 = 184;
    const slot = (x, y, name) => `<circle cx="${x}" cy="${y}" r="20" fill="#fff" stroke="${INK}" stroke-width="2"/>` + T(x, y + 0.5, name, { size: 15, weight: 800, halo: false });
    let s = loop(l, t, r, b) + wire([[xr - hw, b], [xr - hw, y2], [xr + hw, y2], [xr + hw, b]]) + dot(xr - hw, b) + dot(xr + hw, b);
    s += battery(126, t, {}) + sw(232, t, { label: '스위치' });
    s += resistor(xr, b, { label: '니크롬선' });
    s += slot(l, (t + b) / 2, '(가)') + slot(xr, y2, '(나)');
    return svg(332, 212, s, '전지, 스위치, 니크롬선을 연결하고 기구 자리 두 곳을 비워 둔 회로');
  };
})(FIG);

/* ====================== 레슨 5 저항의 연결 ====================== */
(function (FIG: any) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, poly, leader, wire, dot, loop, battery, bulb, sw, scaleAt, comp, circuitPanel, rowOf } = K;

  // 세로 도선 위에 놓인 전구(필라멘트가 도선을 따라 선다)
  const vbulb = (x, y, r) => `<g transform="rotate(90 ${x} ${y})">${bulb(x, y, { r })}</g>`;

  /* 공용 circuit과 같되, 판 아래로 값 상자가 내려오는 만큼 높이를 더 준다. p.extra */
  FIG.l5_circuit = p => { const pn = rowOf(p.panels.map(circuitPanel), p.gap); return svg(pn.w, pn.h + (p.extra || 0), pn.body, p.aria || '전기 회로'); };

  /* 그림 보기용 작은 회로: 전구 하나를 빼내도 나머지가 켜지는 회로 고르기.
   * kind: ser2(아래에 2개), sides(양옆 세로 도선에 1개씩), ser3(양옆과 아래에 3개), par2(두 갈래), topbottom(위와 아래에 1개씩)
   * par2만 병렬이고 나머지는 모두 길이 하나인 직렬이다. */
  FIG.l5_pick = p => {
    const W = 160, H = 150, l = 20, r = 140, t = 30, b = 126, cx = 80, my = (t + b) / 2, R = 13;
    const bat = x => scaleAt(x, t, 0.8, battery(x, t, { labels: false }));
    let s = loop(l, t, r, b);
    if (p.kind === 'ser2') s += bat(cx) + bulb(54, b, { r: R }) + bulb(106, b, { r: R });
    else if (p.kind === 'sides') s += bat(cx) + vbulb(l, my, R) + vbulb(r, my, R);
    else if (p.kind === 'ser3') s += bat(cx) + vbulb(l, my, R) + vbulb(r, my, R) + bulb(cx, b, { r: R });
    else if (p.kind === 'par2') s += wire([[l, my], [r, my]]) + dot(l, my) + dot(r, my) + bat(cx) + bulb(cx, my, { r: R }) + bulb(cx, b, { r: R });
    else s += bat(52) + bulb(112, t, { r: R }) + bulb(cx, b, { r: R });
    return svg(W, H, s, '전지에 전구를 연결한 회로 보기');
  };

  /* 그림 보기용 작은 회로: 전구 P, Q와 스위치 S의 자리 고르기.
   * kind: parP(병렬, S가 P 갈래), parQ(병렬, S가 Q 갈래), parMain(병렬, S가 갈라지기 전), serTop(직렬, S가 전지 옆), serMid(직렬, S가 P와 Q 사이) */
  FIG.l5_sw = p => {
    const B = fx => ({ t: 'bat', labels: false, fx }), P = fx => ({ t: 'bulb', label: 'P', fx }), Q = fx => ({ t: 'bulb', label: 'Q', fx }), S = fx => ({ t: 'sw', label: 'S', fx });
    const kinds = {
      parP: { top: [B(0.5)], rungs: [[P(0.3), S(0.72)], [Q(0.3)]] },
      parQ: { top: [B(0.5)], rungs: [[P(0.3)], [Q(0.3), S(0.72)]] },
      parMain: { top: [B(0.3), S(0.78)], rungs: [[P(0.5)], [Q(0.5)]] },
      serTop: { top: [B(0.3), S(0.78)], bottom: [P(0.3), Q(0.7)] },
      serMid: { top: [B(0.5)], bottom: [P(0.17), S(0.5), Q(0.83)] }
    };
    const pn = circuitPanel(Object.assign({ w: 166, t: 40, gap: 54, dy: 108, small: true }, kinds[p.kind]));
    return svg(pn.w, pn.h, pn.body, '전지에 전구 P, Q와 스위치 S를 연결한 회로 보기');
  };

  /* 전지 여러 개를 한 줄로 이어 전구 A, B를 병렬로 연결한 회로. 전지마다 전압을 적는다. p.volt, p.n(전지 수, 기본 3) */
  FIG.l5_cells3 = p => {
    const n = p.n || 3, w = 300, t = 46, gap = 60, cx = w / 2, xs = [];
    for (let i = 0; i < n; i++) xs.push(cx + (i - (n - 1) / 2) * 66);
    const pn = circuitPanel({ w, t, gap, top: [], rungs: [[{ t: 'bulb', label: 'A' }], [{ t: 'bulb', label: 'B' }]] });
    let s = pn.body;
    xs.forEach(x => { s += battery(x, t, { labels: false }) + T(x, t - 27, p.volt || '1.5 V', { size: 14 }); });
    s += T(xs[0] - 46, t - 27, '(+)', { size: 14 }) + T(xs[n - 1] + 44, t - 27, '(−)', { size: 14 });
    return svg(pn.w, pn.h, s, '전지 여러 개와 전구 두 개를 연결한 회로');
  };

  /* (가) 전지 1개와 전구 P, (나) 전지 2개를 한 줄로 잇고 전구 Q, R을 직렬로 연결한 회로 */
  FIG.l5_cellsPQR = () => {
    const mk = (n, names, cap) => {
      const f = 27.05 / 144, top = n === 1 ? [{ t: 'bat', labels: false }] : [{ t: 'bat', labels: false, fx: 0.5 - f }, { t: 'bat', labels: false, fx: 0.5 + f }];
      const pn = circuitPanel({ w: 176, t: 40, dy: 96, small: true, top, bottom: names.map(b => ({ t: 'bulb', label: b })), cap });
      const hw = n === 1 ? 24 : 51;
      pn.body += T(88 - hw, 17, '(+)', { size: 14 }) + T(88 + hw, 17, '(−)', { size: 14 });
      return pn;
    };
    const row = rowOf([mk(1, ['P'], '(가)'), mk(2, ['Q', 'R'], '(나)')], 8);
    return svg(row.w, row.h, row.body, '전지 1개에 전구 1개를 연결한 회로와 전지 2개를 한 줄로 이어 전구 2개를 직렬로 연결한 회로');
  };

  /* 가정의 전기 배선: 전원(220 V)에서 나온 두 전선 사이에 전기 기구 셋이 스위치와 함께 갈래마다 놓인다. p.items */
  FIG.l5_home = p => {
    const names = (p && p.items) || ['전등', '냉장고', '텔레비전'];
    const yt = 82, yb = 200, xs = [142, 226, 310], xl = xs[xs.length - 1], ysw = 112, ybox = 160, LN = '#a8b3c2';
    let s = `<rect x="94" y="62" width="264" height="156" fill="#f8fafc" stroke="${LN}" stroke-width="1.6"/>` + poly([[80, 63], [226, 8], [372, 63]], '#eef1f5', { stroke: LN, sw: 1.6 });
    s += wire([[34, 120], [34, yt], [xl, yt]]) + wire([[34, 172], [34, yb], [xl, yb]]);
    s += `<rect x="4" y="120" width="60" height="52" rx="9" fill="#eef1f5" stroke="${INK}" stroke-width="2"/>` + T(34, 136, '전원', { size: 14.5, halo: false }) + T(34, 156, '220 V', { size: 14, halo: false, weight: 700 });
    names.forEach((name, i) => {
      const x = xs[i];
      s += wire([[x, yt], [x, yb]]) + (i < names.length - 1 ? dot(x, yt) + dot(x, yb) : '');
      s += `<line x1="${x}" y1="${ysw - 17}" x2="${x}" y2="${ysw + 17}" stroke="#f8fafc" stroke-width="7"/><line x1="${x}" y1="${ysw - 17}" x2="${x}" y2="${ysw + 17}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
      s += `<circle cx="${x}" cy="${ysw - 17}" r="4.2" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="${ysw + 17}" r="4.2" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
      s += comp({ t: 'box', label: name, bw: 76 }, x, ybox);
    });
    s += leader(xs[0] + 8, ysw, xs[0] + 18, ysw) + T(xs[0] + 21, ysw, '스위치', { size: 14, anchor: 'start', fill: SUB, halo: false });
    return svg(376, 224, s, '가정에서 전기 기구 세 개를 전원에 연결한 전기 배선');
  };

  /* 장식용 전구 줄. p.rows: [{name, lit:[0|1 ×5], broken:끊어진 전구 번호}] 판을 위아래로 놓는다. */
  FIG.l5_lights = p => {
    const ph = 104, gap = 8, xs = [100, 156, 212, 268, 324];
    const lamp = (x, yc, lit) => {
      const cy = yc + 25;
      let g = '';
      if (lit) [22, 56, 90, 124, 158].forEach(a => { const c = Math.cos(a * Math.PI / 180), sn = Math.sin(a * Math.PI / 180); g += `<line x1="${r2(x + c * 18)}" y1="${r2(cy + sn * 21)}" x2="${r2(x + c * 24)}" y2="${r2(cy + sn * 27.5)}" stroke="#f2a900" stroke-width="2.4" stroke-linecap="round"/>`; });
      g += `<ellipse cx="${x}" cy="${cy}" rx="12" ry="15" fill="${lit ? 'url(#g-bulb)' : '#dde2e9'}" stroke="${INK}" stroke-width="2"/>`;
      g += `<path d="M${x - 4} ${yc + 11}V${cy - 2}q2 7 4 0q2 7 4 0V${yc + 11}" fill="none" stroke="${lit ? '#b7791f' : '#8a94a3'}" stroke-width="1.5" stroke-linejoin="round"/>`;
      g += `<rect x="${x - 6.5}" y="${yc - 2}" width="13" height="13" rx="2.5" fill="#596373" stroke="${INK}" stroke-width="1.8"/>`;
      return g;
    };
    let s = '';
    p.rows.forEach((row, i) => {
      const y0 = 4 + i * (ph + gap), yc = y0 + 24;
      s += `<rect x="4" y="${y0}" width="356" height="${ph}" rx="12" fill="#f4f6f9"/>` + T(24, y0 + ph / 2, row.name, { size: 15, weight: 700, halo: false });
      let d = `M62 ${yc}`, px = 62;
      xs.forEach(x => { d += `Q${(px + x) / 2} ${yc + 10} ${x} ${yc}`; px = x; });
      s += `<path d="${d}" fill="none" stroke="#3f4959" stroke-width="3" stroke-linecap="round"/>`;
      s += `<line x1="41" y1="${yc - 4}" x2="50" y2="${yc - 4}" stroke="#8a94a3" stroke-width="3" stroke-linecap="round"/><line x1="41" y1="${yc + 4}" x2="50" y2="${yc + 4}" stroke="#8a94a3" stroke-width="3" stroke-linecap="round"/>`;
      s += `<rect x="48" y="${yc - 9}" width="15" height="18" rx="4" fill="#596373" stroke="${INK}" stroke-width="1.8"/>`;
      xs.forEach((x, k) => { s += lamp(x, yc, row.lit[k]); });
      s += T(xs[row.broken], yc + 66, '끊어진 전구', { size: 14, halo: false, weight: 700 });
    });
    return svg(364, 8 + p.rows.length * ph + (p.rows.length - 1) * gap, s, '전구 한 개가 끊어진 장식용 전구 줄 두 가지');
  };
})(FIG);

/* ====================== 레슨 6 전기 에너지와 소비 전력 ====================== */
(function (FIG: any) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly } = K;
  const DARK = '#596373', DEEP = '#3b4556', SKY = '#8fc2f7', GLASS = '#cfe9f9', PINK = '#f58aa0';
  const HEAT = '#ff9d70', LIGHT = '#ffd95a', MOVE = '#8fd6a4';

  /* ---------- 전기 기구 그림. 저마다 원점 둘레에 그리고, ICON에 그림이 차지하는 범위를 적어 둔다 ---------- */
  const fan = () => {
    let s = `<path d="M-5 14H5L8 40H-8Z" fill="#aab3bf" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="-27" y="38" width="54" height="11" rx="5.5" fill="${DARK}" stroke="${INK}" stroke-width="2"/>`;
    s += `<circle cx="0" cy="-12" r="33" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="-12" r="27.5" fill="none" stroke="#c9d1dc" stroke-width="1.3"/>`;
    [90, 210, 330].forEach(a => { s += `<ellipse cx="0" cy="-26" rx="9" ry="13" fill="${SKY}" stroke="${INK}" stroke-width="1.7" transform="rotate(${a} 0 -12)"/>`; });
    return s + `<circle cx="0" cy="-12" r="6" fill="${DARK}" stroke="${INK}" stroke-width="1.7"/>`;
  };
  const dryer = () => {
    let s = `<path d="M8 0L28 3L24 40Q16 47 8 40Z" fill="${PINK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="13" y="15" width="7" height="13" rx="3.5" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
    s += `<path d="M-34 -24L4 -30.25A23 23 0 1 1 4 6.25L-34 0Z" fill="${PINK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<path d="M-45 -22.4L-33 -24.2V0.2L-45 -1.6Z" fill="${DARK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<circle cx="19" cy="-12" r="11.5" fill="#fbd3da" stroke="${INK}" stroke-width="1.6"/><path d="M12 -16.5H26M11 -12H27M12 -7.5H26" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>`;
    [-21, -12, -3].forEach(y => { s += `<path d="M-51 ${y}q-4 -3.5 -8 0t-8 0" fill="none" stroke="#8a97a8" stroke-width="2" stroke-linecap="round"/>`; });
    return s;
  };
  const iron = () => {
    let s = `<path d="M43 6q13 2 13 17" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<path d="M-8 -3C-8 -31 40 -31 40 -3" fill="none" stroke="${INK}" stroke-width="12.5"/><path d="M-8 -3C-8 -31 40 -31 40 -3" fill="none" stroke="${DARK}" stroke-width="8.5"/>`;
    s += `<path d="M-50 24Q-42 -2 -6 -4H32Q44 -4 44 8V24Z" fill="${SKY}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<path d="M-52 31L-50 24H44V31Z" fill="url(#g-metal)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<circle cx="12" cy="10" r="6.5" fill="#fff" stroke="${INK}" stroke-width="1.6"/><line x1="12" y1="10" x2="15.5" y2="6.5" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`;
    return s;
  };
  const cooker = () => {
    let s = `<path d="M19 -34q-4 -5 0 -10t0 -10M27 -36q-4 -5 0 -10" fill="none" stroke="#9aa5b3" stroke-width="2" stroke-linecap="round"/>`;
    s += `<rect x="-30" y="32" width="12" height="7" rx="2" fill="${DEEP}"/><rect x="18" y="32" width="12" height="7" rx="2" fill="${DEEP}"/>`;
    s += `<rect x="-46" y="-6" width="8" height="15" rx="3.5" fill="${DARK}" stroke="${INK}" stroke-width="1.8"/><rect x="38" y="-6" width="8" height="15" rx="3.5" fill="${DARK}" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<path d="M-40 -12H40V20Q40 35 25 35H-25Q-40 35 -40 20Z" fill="url(#g-kettle)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<path d="M-40 -12C-40 -40 40 -40 40 -12Z" fill="#f58a8a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="-9" y="-39" width="18" height="7.5" rx="3.5" fill="${DARK}" stroke="${INK}" stroke-width="1.8"/><circle cx="22" cy="-24" r="3" fill="${DEEP}"/>`;
    s += `<rect x="-17" y="-2" width="34" height="27" rx="6" fill="${DEEP}" stroke="${INK}" stroke-width="1.8"/><rect x="-11" y="3" width="22" height="8" rx="2" fill="#bfe8cc"/>`;
    s += `<circle cx="-6" cy="18" r="3" fill="${LIGHT}"/><circle cx="6" cy="18" r="3" fill="#fff"/>`;
    return s;
  };
  const heater = () => {
    let s = '';
    [-15, 0, 15].forEach(x => { s += `<path d="M${x} -47q-4 -4 0 -8t0 -8" fill="none" stroke="#ff8a4c" stroke-width="2.2" stroke-linecap="round"/>`; });
    s += `<rect x="-9" y="24" width="18" height="8" fill="${DARK}" stroke="${INK}" stroke-width="2"/><rect x="-36" y="30" width="72" height="10" rx="5" fill="${DEEP}" stroke="${INK}" stroke-width="2"/>`;
    s += `<rect x="-31" y="-42" width="62" height="68" rx="9" fill="${DARK}" stroke="${INK}" stroke-width="2"/><rect x="-25" y="-36" width="50" height="46" rx="5" fill="#ffe7c4" stroke="${INK}" stroke-width="1.6"/>`;
    [-27, -7].forEach(y => { s += `<rect x="-22" y="${y - 3}" width="44" height="14" rx="7" fill="#ffb37a" opacity=".6"/><rect x="-19" y="${y}" width="38" height="8" rx="4" fill="#ff6b3d" stroke="#b93815" stroke-width="1.4"/>`; });
    [-15, -5, 5, 15].forEach(x => { s += `<line x1="${x}" y1="-36" x2="${x}" y2="10" stroke="#6b7686" stroke-width="1.2"/>`; });
    return s + `<circle cx="-14" cy="18" r="3.6" fill="#fff" stroke="${INK}" stroke-width="1.4"/><circle cx="14" cy="18" r="2.6" fill="#ff6b3d"/>`;
  };
  const toaster = () => {
    const bread = x => `<path d="M${x} 0V-26Q${x} -36 ${x + 10} -36H${x + 16}Q${x + 26} -36 ${x + 26} -26V0Z" fill="#f6d9a5" stroke="#9a6a22" stroke-width="2" stroke-linejoin="round"/>`;
    let s = bread(-31) + bread(5);
    s += `<rect x="-32" y="31" width="11" height="5" rx="1.5" fill="${DEEP}"/><rect x="21" y="31" width="11" height="5" rx="1.5" fill="${DEEP}"/>`;
    s += `<rect x="-42" y="-12" width="84" height="44" rx="11" fill="url(#g-kettle)" stroke="${INK}" stroke-width="2"/>`;
    s += `<path d="M-42 19H42V21Q42 32 31 32H-31Q-42 32 -42 21Z" fill="${DARK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<line x1="31" y1="-5" x2="31" y2="12" stroke="#9aa5b3" stroke-width="2.4" stroke-linecap="round"/><rect x="25.5" y="-4" width="11" height="7" rx="2.5" fill="${DEEP}" stroke="${INK}" stroke-width="1.5"/>`;
    s += `<circle cx="-26" cy="4" r="6.5" fill="#fff" stroke="${INK}" stroke-width="1.6"/><line x1="-26" y1="4" x2="-22.5" y2="0.5" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`;
    return s;
  };
  const washer = () => {
    let s = `<rect x="-30" y="38" width="11" height="5" rx="1.5" fill="${DEEP}"/><rect x="19" y="38" width="11" height="5" rx="1.5" fill="${DEEP}"/>`;
    s += `<rect x="-36" y="-44" width="72" height="83" rx="7" fill="url(#g-kettle)" stroke="${INK}" stroke-width="2"/><line x1="-36" y1="-26" x2="36" y2="-26" stroke="${INK}" stroke-width="1.6"/>`;
    s += `<rect x="-29" y="-39" width="22" height="8" rx="2" fill="${GLASS}" stroke="#6f9dbd" stroke-width="1.3"/><circle cx="22" cy="-35" r="5" fill="${DARK}" stroke="${INK}" stroke-width="1.6"/><circle cx="6" cy="-35" r="2.4" fill="#9aa5b3"/>`;
    s += `<circle cx="0" cy="7" r="25" fill="#dfe4ea" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="7" r="18" fill="${GLASS}" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<path d="M-17.3 12q5.8 -5 11.6 0t11.5 0t11.5 0A18 18 0 0 1 -17.3 12Z" fill="#7cc0ee"/><circle cx="0" cy="7" r="18" fill="none" stroke="${INK}" stroke-width="1.8"/>`;
    return s + `<path d="M-11 -3a14 14 0 0 1 9 -6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;
  };
  const tv = () => {
    let s = `<rect x="-6" y="24" width="12" height="9" fill="${DARK}" stroke="${INK}" stroke-width="2"/><rect x="-26" y="31" width="52" height="7" rx="3.5" fill="${DEEP}" stroke="${INK}" stroke-width="2"/>`;
    s += `<rect x="-50" y="-36" width="100" height="62" rx="6" fill="${DEEP}" stroke="${INK}" stroke-width="2"/><rect x="-45" y="-31" width="90" height="52" rx="2.5" fill="${GLASS}"/>`;
    s += `<circle cx="24" cy="-15" r="7" fill="${LIGHT}"/><path d="M-45 21V8Q-28 -10 -10 6Q6 -6 22 4Q34 10 45 2V18.5a2.5 2.5 0 0 1 -2.5 2.5Z" fill="${MOVE}"/>`;
    return s;
  };
  // 전구는 공용 에너지 전환 그림(energyFlow)의 전구와 같은 모양이다
  const lamp = led => {
    let g = `<rect x="-10" y="20" width="20" height="15" rx="3" fill="#aab3bf" stroke="${INK}" stroke-width="1.8"/><line x1="-10" y1="27" x2="10" y2="27" stroke="${INK}" stroke-width="1.2"/>`;
    if (led) g += `<path d="M-21 -2A21 21 0 0 1 21 -2Z" fill="url(#g-bulb)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M-21 -2H21L11 21H-11Z" fill="#eef1f5" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    else g += `<path d="M-9 21C-9 10 -22 7 -22 -7A22 22 0 0 1 22 -7C22 7 9 10 9 21Z" fill="url(#g-bulb)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M-5 19V4q2.5 -8 5 0q2.5 -8 5 0V19" fill="none" stroke="#b7791f" stroke-width="1.6" stroke-linejoin="round"/>`;
    return g;
  };
  // [그리는 함수, 왼쪽, 위, 오른쪽, 아래]
  const ICON = {
    fan: [fan, -33, -45, 33, 49], dryer: [dryer, -67, -35, 41, 46], iron: [iron, -52, -31, 57, 31], cooker: [cooker, -46, -56, 46, 39],
    heater: [heater, -36, -63, 36, 40], toaster: [toaster, -42, -36, 42, 36], washer: [washer, -36, -44, 36, 43], tv: [tv, -50, -36, 50, 38],
    led: [() => lamp(true), -22, -23, 22, 35], bulb: [() => lamp(false), -22, -29, 22, 35]
  };
  // 그림의 한가운데가 (cx, cy)에 오도록 k배로 놓는다
  const icon = (name, cx, cy, k = 1) => {
    const [f, x0, y0, x1, y1] = ICON[name];
    return `<g transform="translate(${r2(cx - k * (x0 + x1) / 2)} ${r2(cy - k * (y0 + y1) / 2)}) scale(${k})">${f()}</g>`;
  };
  const iconW = name => ICON[name][3] - ICON[name][1], iconH = name => ICON[name][4] - ICON[name][2];

  /* 그림 보기: 전기 기구 하나와 이름. p.icon, p.name */
  FIG.l6_appliance = p => {
    const W = 160, H = 132, k = Math.min(1, 96 / iconH(p.icon));
    return svg(W, H, icon(p.icon, W / 2, 54, k) + T(W / 2, H - 13, p.name, { size: 15, weight: 700 }), p.name);
  };

  /* 표시판 한 장. (x, y)는 왼쪽 위, w는 폭. 높이는 140 */
  const plate = (x, y, w, p) => {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="140" rx="12" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M${x} ${y + 36}V${y + 12}a12 12 0 0 1 12 -12H${x + w - 12}a12 12 0 0 1 12 12V${y + 36}Z" fill="#eef1f5" stroke="${INK}" stroke-width="2"/>`;
    s += T(x + w / 2, y + 19, p.name, { size: 15, weight: 700, halo: false });
    s += T(x + 16, y + 64, '정격 전압', { size: 14.5, anchor: 'start', halo: false, weight: 500 }) + T(x + w - 16, y + 64, `${p.V} V`, { size: 16, anchor: 'end', halo: false, weight: 800 });
    s += `<line x1="${x + 14}" y1="${y + 87}" x2="${x + w - 14}" y2="${y + 87}" stroke="#dbe2ea" stroke-width="1.2"/>`;
    s += T(x + 16, y + 112, '소비 전력', { size: 14.5, anchor: 'start', halo: false, weight: 500 }) + T(x + w - 16, y + 112, `${p.P} W`, { size: 16, anchor: 'end', halo: false, weight: 800 });
    return s;
  };

  /* 전기 기구와 거기에 붙어 있는 표시. p.icon, p.name, p.V, p.P */
  FIG.l6_rating = p => {
    const x0 = 166, w = 198, cx = 70, cy = 94, k = Math.min(1.15, 116 / iconW(p.icon), 132 / iconH(p.icon)), tip = cx + k * iconW(p.icon) / 2 + 6;
    let s = icon(p.icon, cx, cy, k);
    s += `<line x1="${r2(tip)}" y1="${cy}" x2="${x0}" y2="32" stroke="${SUB}" stroke-width="1.2" stroke-dasharray="4 4"/><line x1="${r2(tip)}" y1="${cy}" x2="${x0}" y2="156" stroke="${SUB}" stroke-width="1.2" stroke-dasharray="4 4"/>`;
    s += plate(x0, 24, w, p);
    return svg(x0 + w + 8, 178, s, `${p.name}와 거기에 붙어 있는 정격 전압과 소비 전력 표시`);
  };

  /* 전기 기구 두 가지와 저마다의 표시를 나란히. p.items: [{icon, name, V, P, cap}] */
  FIG.l6_labels = p => {
    const pw = 176, gap = 8; let s = '';
    p.items.forEach((it, i) => {
      const x = i * (pw + gap), k = Math.min(1.2, 84 / iconH(it.icon), 110 / iconW(it.icon));
      s += `<rect x="${x}" y="0" width="${pw}" height="250" rx="14" fill="#f4f6f9"/>`;
      s += T(x + 14, 19, it.cap, { size: 15, weight: 700, halo: false, anchor: 'start' });
      s += icon(it.icon, x + pw / 2, 56, k) + plate(x + 10, 102, pw - 20, it);
    });
    return svg(pw * p.items.length + gap * (p.items.length - 1), 250, s, '전기 기구 두 가지와 저마다 붙어 있는 정격 전압과 소비 전력 표시');
  };

  /* 전기 기구 하나의 에너지 전환. p.icon, p.title, p.inJ, p.out: [{name, J, color}] 둘. 화살표 굵기는 들어온 전기 에너지에 견준 양이다 */
  FIG.l6_flow = p => {
    const th = J => 7 + 20 * Math.sqrt(J / p.inJ);
    const block = (x1, y1, x2, y2, t, fill) => {
      const a = Math.atan2(y2 - y1, x2 - x1), ca = Math.cos(a), sa = Math.sin(a), hd = Math.min(18, t * 0.8 + 7), L = Math.hypot(x2 - x1, y2 - y1) - hd;
      const pt = (u, v) => [x1 + ca * u - sa * v, y1 + sa * u + ca * v];
      return poly([pt(0, -t / 2), pt(L, -t / 2), pt(L, -t / 2 - 6), pt(L + hd, 0), pt(L, t / 2 + 6), pt(L, t / 2), pt(0, t / 2)], fill, { sw: 1.8 });
    };
    const H = 176, cy = 90, tin = th(p.inJ), o = p.out, k = Math.min(0.9, 84 / iconW(p.icon), 88 / iconH(p.icon));
    let s = `<rect x="4" y="4" width="366" height="${H - 8}" rx="12" fill="#f4f6f9"/>` + T(14, 22, p.title, { size: 14.5, weight: 700, halo: false, anchor: 'start' });
    s += block(14, cy, 96, cy, tin, SKY) + T(55, cy + tin / 2 + 21, '전기 에너지', { size: 14, halo: false }) + T(55, cy + tin / 2 + 40, `${p.inJ} J`, { size: 15.5, weight: 800, halo: false });
    s += icon(p.icon, 148, cy, k);
    [[cy - 14, cy - 36], [cy + 14, cy + 34]].forEach(([y1, y2], i) => {
      s += block(200, y1, 264, y2, th(o[i].J), o[i].color);
      s += T(272, y2 - 9, o[i].name, { size: 14, halo: false, anchor: 'start' }) + T(272, y2 + 10, `${o[i].J} J`, { size: 15.5, weight: 800, halo: false, anchor: 'start' });
    });
    return svg(374, H, s, `${p.title}가 1초 동안 사용하는 전기 에너지와 전환되는 에너지`);
  };
  FIG.l6_flow.color = { heat: HEAT, light: LIGHT, move: MOVE };

  /* 전기 기구별 소비 전력 막대그래프. p.items: [{name, W}], p.ymax, p.ystep */
  FIG.l6_bars = p => {
    const W = 360, H = 246, L = 56, R = 14, Tm = 42, B = 40, pw = W - L - R, ph = H - Tm - B, n = p.items.length, slot = pw / n, bw = Math.min(42, slot * 0.5);
    const Y = v => Tm + ph - v / p.ymax * ph;
    let s = `<rect x="${L}" y="${Tm}" width="${pw}" height="${ph}" fill="#fbfcfe"/>`;
    for (let v = p.ystep; v <= p.ymax + 1e-9; v += p.ystep) s += `<line x1="${L}" y1="${r2(Y(v))}" x2="${L + pw}" y2="${r2(Y(v))}" stroke="#dbe2ea" stroke-width="1"/>` + T(L - 9, Y(v), v, { size: 14, weight: 500, halo: false, anchor: 'end' });
    s += T(L - 9, Y(0), '0', { size: 14, weight: 500, halo: false, anchor: 'end' });
    p.items.forEach((it, i) => {
      const xc = L + slot * (i + 0.5);
      s += `<rect x="${r2(xc - bw / 2)}" y="${r2(Y(it.W))}" width="${r2(bw)}" height="${r2(Y(0) - Y(it.W))}" fill="${SKY}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` + T(xc, Tm + ph + 19, it.name, { size: 14.5, weight: 700, halo: false });
    });
    s += `<line x1="${L}" y1="${Tm + ph}" x2="${L + pw}" y2="${Tm + ph}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>` + arrow(L, Tm + ph, L, Tm - 16, { w: 2 });
    s += T(8, 12, p.ylabel || '소비 전력(W)', { size: 14, anchor: 'start' });
    return svg(W, H, s, '전기 기구별 소비 전력을 나타낸 막대그래프');
  };

  /* 그림 보기: 작은 막대그래프. p.vals: [A, B, C의 소비 전력], p.names, p.ymax(기본 40), p.ystep(기본 10) */
  FIG.l6_miniBars = p => {
    const W = 164, H = 152, x0 = 38, y0 = 122, ph = 84, pw = 118, ymax = p.ymax || 40, step = p.ystep || 10, names = p.names || ['A', 'B', 'C'], slot = pw / names.length, bw = 22;
    const Y = v => y0 - v / ymax * ph;
    let s = `<rect x="${x0}" y="${y0 - ph}" width="${pw}" height="${ph}" fill="#f6f8fb"/>`;
    for (let v = step; v <= ymax + 1e-9; v += step) s += `<line x1="${x0}" y1="${r2(Y(v))}" x2="${x0 + pw}" y2="${r2(Y(v))}" stroke="#d5dde7" stroke-width="1"/>` + T(x0 - 7, Y(v), v, { size: 14, weight: 500, halo: false, anchor: 'end' });
    s += T(x0 - 7, y0, '0', { size: 14, weight: 500, halo: false, anchor: 'end' });
    p.vals.forEach((v, i) => {
      const xc = x0 + slot * (i + 0.5);
      s += `<rect x="${r2(xc - bw / 2)}" y="${r2(Y(v))}" width="${bw}" height="${r2(y0 - Y(v))}" fill="${SKY}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>` + T(xc, y0 + 16, names[i], { size: 14.5, weight: 700, halo: false });
    });
    s += `<line x1="${x0}" y1="${y0}" x2="${x0 + pw}" y2="${y0}" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>` + arrow(x0, y0, x0, y0 - ph - 12, { w: 1.8 });
    s += T(4, 12, p.ylabel || '소비 전력(W)', { size: 14, anchor: 'start' });
    return svg(W, H, s, '전기 기구 A, B, C의 소비 전력을 나타낸 막대그래프');
  };
})(FIG);

/* ====================== 레슨 7 전류와 자기장 ====================== */
(function (FIG: any) {
  const K = FIG.kit;
  const { INK, SUB, CUR, T, arrow, poly, line2, copperLine, svg, r2, wire, comp, sw, barMagnet, compass, coilCircuit, leader } = K;
  const LINE = '#8794a8', HEAD = '#56657c';

  /* ---------- 자기력선 계산 ---------- */
  const facePoles = (x, cy, half, q, m = 9) => Array.from({ length: m }, (_, i) => ({ x, y: cy + (i / (m - 1) * 2 - 1) * half, q: q / m }));
  function fieldAt(x, y, poles) {
    let bx = 0, by = 0;
    for (const p of poles) { const dx = x - p.x, dy = y - p.y, d3 = Math.pow(dx * dx + dy * dy + 1, 1.5); bx += p.q * dx / d3; by += p.q * dy / d3; }
    return [bx, by];
  }
  // (x, y)에서 자기장의 방향으로 선을 따라간다. stop이 참이 되면 멈춘다.
  function trace(x, y, poles, stop, h = 2) {
    const pts = [[x, y]];
    for (let i = 0; i < 1500; i++) {
      let [bx, by] = fieldAt(x, y, poles), m = Math.hypot(bx, by); if (m < 1e-12) break;
      [bx, by] = fieldAt(x + bx / m * h / 2, y + by / m * h / 2, poles); m = Math.hypot(bx, by); if (m < 1e-12) break;
      x += bx / m * h; y += by / m * h; pts.push([x, y]);
      if (stop(x, y)) break;
    }
    return pts;
  }
  // pts[i] 자리에 선이 나아가는 방향으로 화살촉을 붙인다. rev면 반대 방향
  function head(pts, i, o = {}) {
    i = Math.max(0, Math.min(pts.length - 1, Math.round(i)));
    const a = pts[Math.max(0, i - 2)], b = pts[Math.min(pts.length - 1, i + 2)], m = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, sg = o.rev ? -1 : 1;
    const ux = sg * (b[0] - a[0]) / m, uy = sg * (b[1] - a[1]) / m, z = o.size || 8, [x, y] = pts[i];
    return poly([[x + ux * z * 0.62, y + uy * z * 0.62], [x - ux * z * 0.5 - uy * z * 0.5, y - uy * z * 0.5 + ux * z * 0.5], [x - ux * z * 0.5 + uy * z * 0.5, y - uy * z * 0.5 - ux * z * 0.5]], HEAD, { stroke: HEAD, sw: 1 });
  }
  const fline = (pts, w) => line2(pts, LINE, w || 1.6);

  // 막대자석(또는 코일) 둘레의 자기력선. 두 끝 가까이에 N극(xN)과 S극(xS)을 한 점씩 두고, N극에서 여러 각도로 나온 선을 따라간다.
  // 좌우가 대칭이므로 N극 쪽 절반만 계산하고 뒤집어 붙인다. 가운데를 넘는 선은 닫힌 고리가 되고, 그림 밖으로 나가는 선은 두 토막이 된다.
  // o: xN, xS, cy, angs(N극에서 바깥쪽 축과 이루는 각도), box, hide([x0, y0, x1, y1] 안쪽은 그리지 않는다), hs(화살촉 크기)
  function dipoleLines(o) {
    const out = Math.sign(o.xN - o.xS), xm = (o.xN + o.xS) / 2, [bx0, by0, bx1, by1] = o.box, hd = o.hide;
    const poles = [{ x: o.xN, y: o.cy, q: 1 }, { x: o.xS, y: o.cy, q: -1 }];
    const vis = q => !hd || q[0] < hd[0] || q[0] > hd[2] || q[1] < hd[1] || q[1] > hd[3];
    const runs = pts => { const rs = []; let cur = null; pts.forEach(q => { if (vis(q)) { if (!cur) rs.push(cur = []); cur.push(q); } else cur = null; }); return rs.filter(r => r.length > 3); };
    let s = ''; const tops = {};
    for (const ang of o.angs) {
      const al = ang * Math.PI / 180;
      const hf = trace(o.xN + out * 3 * Math.cos(al), o.cy - 3 * Math.sin(al), poles, (x, y) => (x - xm) * out <= 0 || x < bx0 || x > bx1 || y < by0 || y > by1, 1.5);
      const n = hf.length, last = hf[n - 1], prev = hf[n - 2];
      if ((last[0] - xm) * out <= 0) {
        const t = (xm - prev[0]) / (last[0] - prev[0]); hf[n - 1] = [xm, prev[1] + t * (last[1] - prev[1])];
        const all = hf.concat(hf.slice(0, n - 1).reverse().map(q => [2 * xm - q[0], q[1]]));
        // 고리 꼭대기에 점을 찍을 선(o.split)은 화살촉을 꼭대기 대신 양쪽 어깨에 붙인다
        runs(all).forEach(r => { s += fline(r) + (o.split === Math.abs(ang) ? head(r, r.length * 0.3, { size: o.hs }) + head(r, r.length * 0.7, { size: o.hs }) : head(r, (r.length - 1) / 2, { size: o.hs })); });
        tops[ang] = hf[n - 1][1];
      } else {
        const mir = hf.slice().reverse().map(q => [2 * xm - q[0], q[1]]);
        runs(hf).forEach(r => { s += fline(r) + head(r, r.length * 0.56, { size: o.hs }); });
        runs(mir).forEach(r => { s += fline(r) + head(r, r.length * 0.44, { size: o.hs }); });
      }
    }
    return { s, tops };
  }
  const ANGS = [0, 20, -20, 40, -40, 60, -60, 80, -80, 100, -100, 120, -120];

  /* ---------- 코일(공용 K.coil과 같은 모양, 앞뒤를 따로 돌려준다) ---------- */
  // up: true면 전류가 앞쪽에서 위로, false면 아래로, null이면 전류 표시 없음
  function coilParts(x0, x1, cy, r, n, up, o = {}) {
    const p = (x1 - x0) / n, back = [], front = [], w = o.w || 4.4;
    for (let i = 0; i < n; i++) {
      const xs = x0 + i * p, fa = [], ba = [];
      for (let k = 0; k <= 14; k++) {
        const th = k / 14 * Math.PI;
        fa.push([xs + p * th / (2 * Math.PI), cy + r * Math.cos(th)]);
        ba.push([xs + p * (th + Math.PI) / (2 * Math.PI), cy + r * Math.cos(th + Math.PI)]);
      }
      back.push(line2(ba, '#b7c0cc', w + 0.8) + line2(ba, '#ecd3bd', w - 1.4));
      front.push(copperLine(fa, w));
    }
    let arrows = '';
    if (up != null) for (let i = 0; i < n; i += 2) {
      const xm = x0 + i * p + p / 4, vx = p / (2 * Math.PI), vy = -r, m = Math.hypot(vx, vy), sg = up ? 1 : -1, k = o.ak || 1;
      const ux = sg * vx / m, uy = sg * vy / m, tip = [xm + ux * 11 * k, cy + uy * 11 * k], bx = xm - ux * 8 * k, by = cy - uy * 8 * k;
      arrows += poly([tip, [bx - uy * 10 * k, by + ux * 10 * k], [bx + uy * 10 * k, by - ux * 10 * k]], CUR, { stroke: '#fff', sw: 2 });
    }
    return { back: back.join(''), front: front.join(''), arrows };
  }
  const northEnd = up => (up ? 'left' : 'right'); // 오른손 규칙의 결과

  /* ---------- 02. 막대자석 주위의 자기력선과 두 점 ---------- */
  // p.nLeft(기본 true). A는 N극 바깥쪽 가까이, B는 자석 가운데 위쪽의 먼 자기력선 위
  FIG.l7_magLines = p => {
    const W = 360, H = 236, cx = 180, cy = 118, w = 124, h = 34, nL = p.nLeft !== false;
    const out = nL ? -1 : 1, xe = cx + out * w / 2, xN = xe - out * 12, xS = 2 * cx - xN;
    const L = dipoleLines({ xN, xS, cy, angs: ANGS.concat([140, -140]), box: [-8, -8, W + 8, H + 8], split: 100 });
    let s = L.s + barMagnet(cx, cy, w, h, nL);
    const ax = xe + out * 26, by = L.tops[100];
    s += `<circle cx="${ax}" cy="${cy}" r="5" fill="${INK}"/>` + T(ax, cy - 19, 'A', { size: 16.5, weight: 800 });
    s += `<circle cx="${cx}" cy="${r2(by)}" r="5" fill="${INK}"/>` + T(cx + 17, by - 13, 'B', { size: 16.5, weight: 800 });
    return svg(W, H, s, '막대자석 주위의 자기력선과 두 점 A, B');
  };

  /* ---------- 04. 마주 보는 두 극 사이의 자기력선(그림 보기) ---------- */
  // p.poles: [왼쪽 극, 오른쪽 극], p.shape: 'join'(이어진다) | 'repel'(휘어져 나간다) | 'cross'(엇갈린다)
  // p.dir: join과 cross는 'LR' | 'RL', repel은 'out'(극에서 나온다) | 'in'(극으로 들어간다)
  FIG.l7_gap = p => {
    const W = 164, H = 112, cy = 56, xl = 40, xr = 124, hh = 17, [pl, pr] = p.poles, box = [-6, -6, W + 6, H + 6];
    const outBox = (x, y) => x < box[0] || x > box[2] || y < box[1] || y > box[3];
    let s = '';
    if (p.shape === 'join') {
      const poles = facePoles(xl, cy, hh - 1, 1).concat(facePoles(xr, cy, hh - 1, -1));
      [-14, -7, 0, 7, 14].forEach(off => {
        const pts = trace(xl + 2, cy + off, poles, (x, y) => x >= xr - 2 || outBox(x, y));
        s += fline(pts) + head(pts, pts.length / 2, { rev: p.dir === 'RL', size: 8 });
      });
    } else if (p.shape === 'repel') {
      const poles = facePoles(xl, cy, hh - 1, 1).concat(facePoles(xr, cy, hh - 1, 1));
      // 선 사이가 붙지 않게 두 가닥씩만 그리고, 화살촉은 엇갈려 놓는다
      [[15, 30], [9.5, 42]].forEach(([d, dyAt]) => [-1, 1].forEach(sg => {
        const pts = trace(xl + 2, cy + sg * d, poles, outBox), mir = pts.map(q => [W - q[0], q[1]]);
        const at = Math.max(2, pts.findIndex(q => Math.abs(q[1] - cy) >= dyAt)), o = { rev: p.dir === 'in', size: 8 };
        s += fline(pts) + head(pts, at, o) + fline(mir) + head(mir, at, o);
      }));
    } else {
      [-13, 0, 13].forEach(off => {
        const pts = Array.from({ length: 21 }, (_, i) => [xl + (xr - xl) * i / 20, cy + off - 2 * off * i / 20]);
        s += fline(pts) + head(pts, 4, { rev: p.dir === 'RL', size: 8 }) + head(pts, 16, { rev: p.dir === 'RL', size: 8 });
      });
    }
    const mag = (x0, ch) => `<rect x="${x0}" y="${cy - hh}" width="48" height="${hh * 2}" fill="url(#g-${ch === 'N' ? 'n' : 's'})" stroke="${INK}" stroke-width="2"/>` + T(x0 + (x0 < 0 ? 29 : 19), cy + 1, ch, { fill: '#fff', halo: false, size: 18, weight: 800 });
    s += mag(xl - 48, pl) + mag(xr, pr);
    return svg(W, H, s, '마주 보는 두 자석의 극 사이에 그린 자기력선');
  };
  FIG.l7_gap.ok = p => (p.shape === 'join' && p.poles[0] !== p.poles[1] && p.dir === (p.poles[0] === 'N' ? 'LR' : 'RL')) ||
    (p.shape === 'repel' && p.poles[0] === p.poles[1] && p.dir === (p.poles[0] === 'N' ? 'out' : 'in'));

  /* ---------- 05. 극을 가린 막대자석과 나침반 ---------- */
  // p.ang(P에 놓은 나침반 바늘의 각도), p.names(자석 두 쪽의 이름). 점 Q는 오른쪽 바깥, R은 가운데 아래
  FIG.l7_mystery = p => {
    const cx = 180, cy = 122, w = 140, h = 38, xe = cx + w / 2, xs = cx - w / 2, nm = p.names || ['(가)', '(나)']; let s = '';
    for (let k = 1; k <= 3; k++) for (const sg of [-1, 1]) {
      const y0 = cy + sg * (16 - 5 * k), yt = cy + sg * (32 * k + 6);
      s += `<path d="M${xe} ${y0}C${xe + 30 * k} ${y0 + sg * 7 * k} ${xe + 26 * k} ${yt} ${cx} ${yt}C${xs - 26 * k} ${yt} ${xs - 30 * k} ${y0 + sg * 7 * k} ${xs} ${y0}" fill="none" stroke="#aab5c4" stroke-width="1.7" stroke-dasharray="5 5"/>`;
    }
    s += `<line x1="${xe}" y1="${cy}" x2="${xe + 76}" y2="${cy}" stroke="#aab5c4" stroke-width="1.7" stroke-dasharray="5 5"/><line x1="${xs - 76}" y1="${cy}" x2="${xs}" y2="${cy}" stroke="#aab5c4" stroke-width="1.7" stroke-dasharray="5 5"/>`;
    s += `<rect x="${xs}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="url(#g-metal)" stroke="${INK}" stroke-width="2"/><rect x="${cx}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="url(#g-metal)" stroke="${INK}" stroke-width="2"/>`;
    s += T(cx - w / 4, cy + 1, nm[0], { halo: false, size: 16.5, weight: 800 }) + T(cx + w / 4, cy + 1, nm[1], { halo: false, size: 16.5, weight: 800 });
    s += compass(cx, cy - 70, 24, p.ang) + T(cx + 40, cy - 70, 'P', { size: 16.5, weight: 800 });
    s += `<circle cx="${xe + 52}" cy="${cy}" r="5" fill="${INK}"/>` + T(xe + 52, cy - 19, 'Q', { size: 16.5, weight: 800 });
    s += `<circle cx="${cx}" cy="${cy + 70}" r="5" fill="${INK}"/>` + T(cx, cy + 89, 'R', { size: 16.5, weight: 800 });
    return svg(360, 244, s, '극을 알 수 없는 막대자석과 그 위쪽에 놓인 나침반');
  };

  /* ---------- 06. 막대자석과 코일 주위의 자기력선을 나란히 ---------- */
  // p.nLeft(막대자석의 N극이 왼쪽), p.plusLeft(코일에 연결한 전지의 (+)극이 왼쪽: 전류가 앞쪽에서 위로 흐른다)
  FIG.l7_twoFields = p => {
    const cy = 96, len = 88, inset = 10, angs = [0, 30, -30, 60, -60, 90, -90, 120, -120]; let s = '';
    // (가) 막대자석
    {
      const cx = 88, nL = p.nLeft !== false, xN = nL ? cx - len / 2 + inset : cx + len / 2 - inset;
      s += dipoleLines({ xN, xS: 2 * cx - xN, cy, angs, box: [2, 6, 174, 186], hs: 8 }).s + barMagnet(cx, cy, len, 30, nL);
      s += T(cx, 208, '(가)', { size: 16, weight: 700 });
    }
    // (나) 코일
    {
      const ox = 184, x0 = ox + 44, x1 = x0 + len, r = 17, up = !!p.plusLeft, xN = northEnd(up) === 'left' ? x0 + inset : x1 - inset, xS = x0 + x1 - xN;
      const cp = coilParts(x0, x1, cy, r, 4, up, { w: 4, ak: 0.9 });
      s += dipoleLines({ xN, xS, cy, angs, box: [ox + 2, 6, ox + 174, 186], hide: [x0, cy - r, x1, cy + r], hs: 8 }).s;
      // 코일 안쪽에서는 자기력선이 코일의 축과 나란하게 지나간다(양 끝에서 바깥의 선과 이어진다)
      s += cp.back + [0, 30, -30].map(a => { const y = cy + inset * Math.tan(a * Math.PI / 180); return fline([[x0, y], [x1, y]]); }).join('');
      // 도선은 짧게 끊어 그린다(전류의 방향은 코일 위의 화살표로 나타낸다)
      s += copperLine([[x0, cy + r - 1], [x0, cy + r + 40]], 3.6) + copperLine([[x1, cy + r - 1], [x1, cy + r + 40]], 3.6) + cp.front + cp.arrows;
      s += T((x0 + x1) / 2, 208, '(나)', { size: 16, weight: 700 });
    }
    return svg(360, 220, s, '막대자석 주위의 자기력선과 전류가 흐르는 코일 주위의 자기력선');
  };
  FIG.l7_twoFields.north = p => northEnd(!!p.plusLeft);

  /* ---------- 07, 11, 13. 코일과 전지(공용 coilCircuit) + 위쪽 나침반 또는 극을 가린 막대자석 ---------- */
  // p.plusLeft, p.sw, p.top({label, ang}: 코일 가운데 위쪽의 나침반. ang가 없으면 가린 나침반), p.magnet({names:[왼쪽, 오른쪽]}: 코일 왼쪽의 막대자석)
  FIG.l7_coil = p => {
    const dy = p.top ? 18 : 0, cy = 78 + dy, by = 196 + dy, mg = p.magnet, x0 = mg ? 172 : 106, x1 = mg ? 322 : 266;
    let s = coilCircuit({ x0, x1, cy, r: 30, n: 5, by, plusLeft: p.plusLeft, sw: p.sw });
    s += T(x0, cy - 48, 'A', { size: 17, weight: 800 }) + T(x1, cy - 48, 'B', { size: 17, weight: 800 });
    if (p.top) { const x = (x0 + x1) / 2, y = cy - 62; s += compass(x, y, 20, p.top.ang == null ? null : p.top.ang) + T(x + 34, y, p.top.label || 'R', { size: 16.5, weight: 800 }); }
    if (mg) {
      const cx = 64, w = 112, h = 38;
      s += `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="url(#g-metal)" stroke="${INK}" stroke-width="2"/><rect x="${cx}" y="${cy - h / 2}" width="${w / 2}" height="${h}" fill="url(#g-metal)" stroke="${INK}" stroke-width="2"/>`;
      s += T(cx - w / 4, cy + 1, mg.names[0], { halo: false, size: 18, weight: 800 }) + T(cx + w / 4, cy + 1, mg.names[1], { halo: false, size: 18, weight: 800 }) + T(cx, cy - 34, '막대자석', { size: 14.5 });
    }
    return svg(mg ? 376 : 372, 232 + dy, s, '전류가 흐르는 코일');
  };
  FIG.l7_coil.north = p => (northEnd(!!p.plusLeft) === 'left' ? 'A' : 'B');

  /* ---------- 12. 같은 코일에 세기가 다른 전류가 흐르는 두 회로 ---------- */
  // p.plusLeft, p.amps: [(가)의 전류계 값, (나)의 전류계 값]
  FIG.l7_coilAmp = p => {
    const up = !!p.plusLeft, pw = 180; let s = '';
    ['(가)', '(나)'].forEach((cap, i) => {
      const ox = i * (pw + 8), x0 = ox + 28, x1 = ox + 152, cy = 56, r = 22, by = 148, cp = coilParts(x0, x1, cy, r, 4, up, { w: 4.2 });
      s += wire([[x0, cy + r], [x0, by], [x1, by], [x1, cy + r]]) + copperLine([[x0, cy + r - 1], [x0, cy + r + 22]], 4.2) + copperLine([[x1, cy + r - 1], [x1, cy + r + 22]], 4.2);
      s += cp.back + cp.front + cp.arrows;
      s += comp({ t: 'bat', plusRight: !up, labelBelow: true }, ox + 62, by, true) + comp({ t: 'A' }, ox + 118, by, true);
      s += `<rect x="${ox + 91}" y="${by - 45}" width="54" height="23" rx="6" fill="#eef4ff" stroke="#9db7e0" stroke-width="1.4"/>` + T(ox + 118, by - 33.5, p.amps[i], { size: 14.5, halo: false, fill: '#1f4e96', weight: 700 });
      const ya = cy + r + 30, yb = by - 8, o = { color: CUR, w: 2.6 };
      s += up ? arrow(x0 - 11, yb, x0 - 11, ya, o) + arrow(x1 + 11, ya, x1 + 11, yb, o) : arrow(x0 - 11, ya, x0 - 11, yb, o) + arrow(x1 + 11, yb, x1 + 11, ya, o);
      s += T(ox + pw / 2, by + 50, cap, { size: 16, weight: 700 });
    });
    return svg(pw * 2 + 8, 212, s, '같은 코일에 세기가 다른 전류가 흐르는 두 회로');
  };
  FIG.l7_coilAmp.north = p => northEnd(!!p.plusLeft);

  /* ---------- 17. 쇠못에 코일을 감아 만든 전자석과 클립 ---------- */
  // p.on: [(가)의 스위치가 닫혔는가, (나)의 스위치가 닫혔는가]. 닫힌 쪽에만 클립이 붙는다.
  const clip = (x, y, ang) => `<g transform="translate(${x} ${y}) rotate(${ang})"><rect x="-4.5" y="0" width="9" height="23" rx="4.5" fill="none" stroke="#566273" stroke-width="1.7"/><path d="M-1.6 19V7a1.6 1.6 0 0 1 3.2 0V15" fill="none" stroke="#566273" stroke-width="1.5" stroke-linecap="round"/></g>`;
  FIG.l7_nail = p => {
    const pw = 180; let s = '';
    ['(가)', '(나)'].forEach((cap, i) => {
      const ox = i * (pw + 8), on = !!p.on[i], x0 = ox + 26, x1 = ox + 134, cy = 50, r = 15, by = 142, cp = coilParts(x0, x1, cy, r, 6, null, { w: 3.8 });
      s += wire([[x0, cy + r], [x0, by], [x1, by], [x1, cy + r]]) + copperLine([[x0, cy + r - 1], [x0, cy + r + 18]], 3.8) + copperLine([[x1, cy + r - 1], [x1, cy + r + 18]], 3.8);
      s += cp.back;
      s += `<rect x="${ox + 11}" y="${cy - 5.5}" width="149" height="11" fill="url(#g-metal)" stroke="${INK}" stroke-width="1.8"/>` + poly([[ox + 160, cy - 5.5], [ox + 176, cy], [ox + 160, cy + 5.5]], 'url(#g-metal)', { sw: 1.8 });
      s += `<rect x="${ox + 4}" y="${cy - 13}" width="8" height="26" rx="2.5" fill="url(#g-metal)" stroke="${INK}" stroke-width="1.8"/>`;
      s += cp.front;
      s += comp({ t: 'bat', plusRight: true, labelBelow: true }, ox + 56, by, true) + sw(ox + 108, by, { open: !on });
      s += T(ox + 108, by - 26, '스위치', { size: 14 });
      s += on ? clip(ox + 171, cy + 2, 5) + clip(ox + 169, cy + 22, -8) + clip(ox + 172, cy + 42, 7) + clip(ox + 164, cy + 4, 36)
        : clip(ox + 152, by + 14, 74) + clip(ox + 172, by + 9, 18) + clip(ox + 154, by + 28, 98) + clip(ox + 176, by + 32, 64);
      if (i === 0) s += T(ox + 24, 14, '쇠못', { size: 14 }) + leader(ox + 14, 23, ox + 9, cy - 15) + T(ox + 158, on ? cy + 80 : by - 8, '클립', { size: 14 });
      s += T(ox + 84, by + 50, cap, { size: 16, weight: 700 });
    });
    return svg(pw * 2 + 8, 206, s, '쇠못에 코일을 감아 만든 전자석과 클립');
  };

  /* ---------- 18. 전지의 수에 따라 전자석에 붙은 클립의 수(막대그래프) ---------- */
  // p.vals: 전지 1개, 2개, 3개일 때 붙은 클립의 수
  FIG.l7_clipBars = p => {
    const W = 336, H = 236, L = 50, R = 18, Tm = 44, B = 62, pw = W - L - R, ph = H - Tm - B, ymax = p.ymax || 12, step = p.step || 2, Y = v => Tm + ph - v / ymax * ph;
    let s = `<rect x="${L}" y="${Tm}" width="${pw}" height="${ph}" fill="#fbfcfe"/>`;
    for (let v = step; v <= ymax; v += step) s += `<line x1="${L}" y1="${r2(Y(v))}" x2="${L + pw}" y2="${r2(Y(v))}" stroke="#dbe2ea" stroke-width="1"/>` + T(L - 9, Y(v), v, { size: 14, weight: 500, halo: false, anchor: 'end' });
    s += T(L - 9, Y(0), '0', { size: 14, weight: 500, halo: false, anchor: 'end' });
    const slot = pw / p.vals.length, bw = 46;
    p.vals.forEach((v, i) => {
      const x = L + slot * (i + 0.5);
      s += `<rect x="${r2(x - bw / 2)}" y="${r2(Y(v))}" width="${bw}" height="${r2(Y(0) - Y(v))}" fill="#8fc2f7" stroke="${INK}" stroke-width="2"/>` + T(x, Tm + ph + 17, `${i + 1}개`, { size: 14.5, halo: false });
    });
    s += arrow(L, Tm + ph, L, Tm - 16, { w: 2 }) + line2([[L, Tm + ph], [L + pw, Tm + ph]], INK, 2);
    s += T(8, Tm - 30, '붙은 클립의 수(개)', { size: 14, anchor: 'start' }) + T(L + pw / 2, H - 14, '직렬로 연결한 전지의 수', { size: 14 });
    return svg(W, H, s, '직렬로 연결한 전지의 수에 따라 전자석에 붙은 클립의 수');
  };

  /* ---------- 20. 전자석 기중기 ---------- */
  // p.hold: [(가)에서 고철이 붙어 있는가, (나)에서 고철이 붙어 있는가]
  const M = 'url(#g-metal)';
  const SHAPE = {
    bar: `<rect x="-17" y="-4.5" width="34" height="9" rx="1.5" fill="${M}" stroke="${INK}" stroke-width="1.7"/>`,
    nut: `<polygon points="${[0, 1, 2, 3, 4, 5].map(k => r2(9.5 * Math.cos(k * Math.PI / 3)) + ',' + r2(9.5 * Math.sin(k * Math.PI / 3))).join(' ')}" fill="${M}" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/><circle r="3.8" fill="#fff" stroke="${INK}" stroke-width="1.4"/>`,
    bolt: `<rect x="-5" y="-3.2" width="24" height="6.4" fill="${M}" stroke="${INK}" stroke-width="1.6"/><rect x="-15" y="-7" width="10" height="14" rx="1.8" fill="${M}" stroke="${INK}" stroke-width="1.7"/>`,
    ring: `<circle r="9" fill="${M}" stroke="${INK}" stroke-width="1.7"/><circle r="4.4" fill="#fff" stroke="${INK}" stroke-width="1.4"/>`,
    plate: `<polygon points="-15,-7 13,-9 16,6 -12,9" fill="${M}" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/>`
  };
  const put = (ox, list) => list.map(([k, x, y, a]) => `<g transform="translate(${ox + x} ${y}) rotate(${a || 0})">${SHAPE[k]}</g>`).join('');
  FIG.l7_crane = p => {
    const pw = 176, gy = 190; let s = '';
    ['(가)', '(나)'].forEach((cap, i) => {
      const ox = i * (pw + 8), hold = !!p.hold[i], mx = ox + 84;
      s += `<line x1="${ox + 6}" y1="${gy}" x2="${ox + pw - 6}" y2="${gy}" stroke="${SUB}" stroke-width="2" stroke-linecap="round"/>`;
      // 팔, 줄, 고리, 전자석
      s += `<rect x="${mx - 36}" y="2" width="72" height="11" rx="3" fill="#596373" stroke="${INK}" stroke-width="1.8"/>`;
      s += `<line x1="${mx - 5}" y1="13" x2="${mx - 5}" y2="34" stroke="${INK}" stroke-width="2"/><line x1="${mx + 5}" y1="13" x2="${mx + 5}" y2="34" stroke="${INK}" stroke-width="2"/>`;
      s += `<path d="M${mx - 9} 32H${mx + 9}L${mx + 22} 50H${mx - 22}Z" fill="#aab3bf" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
      s += `<rect x="${mx - 50}" y="50" width="100" height="24" rx="6" fill="#f2c230" stroke="${INK}" stroke-width="2"/><rect x="${mx - 54}" y="70" width="108" height="10" rx="3" fill="#596373" stroke="${INK}" stroke-width="1.8"/>`;
      if (i === 0) s += leader(mx + 44, 52, mx + 52, 36) + T(mx + 60, 26, '전자석', { size: 14.5 });
      const load = [['bar', 54, 87, 6], ['plate', 90, 90, -5], ['nut', 122, 91, 12], ['ring', 42, 100, 0], ['bolt', 68, 104, 22], ['bar', 108, 107, -24], ['nut', 86, 113, 0]];
      const base = [['bar', 30, gy - 6, 3], ['plate', 146, gy - 9, 4]];
      const heap = [['nut', 62, gy - 11, 10], ['bar', 96, gy - 7, -4], ['ring', 124, gy - 11, 0], ['bolt', 76, gy - 25, 16], ['plate', 108, gy - 25, -7], ['bar', 92, gy - 39, 12], ['nut', 58, gy - 31, 0]];
      s += put(ox, base) + (hold ? put(ox, load) : put(ox, heap));
      s += T(ox + pw / 2, gy + 22, cap, { size: 16, weight: 700 });
    });
    return svg(pw * 2 + 8, 224, s, '전자석 기중기로 고철을 옮기는 두 장면');
  };
})(FIG);

/* ====================== 레슨 8 자기장 속 전류가 받는 힘과 전동기 ====================== */
(function (FIG: any) {
  const K = FIG.kit;
  const { INK, SUB, CUR, RED, BLUE, T, arrow, poly, line2, copperLine, P3, box3, cross, svg, r2, leader, barMagnet } = K;
  const GREEN = '#12a150', GREEN_T = '#0b7a3b', FIELD = '#2f6fd0';
  const GRAY = { front: 'url(#g-metal)', top: '#eef1f5', side: '#98a3b2' };
  const DIR = { right: [1, 0, 0], left: [-1, 0, 0], up: [0, 1, 0], down: [0, -1, 0], front: [0, 0, 1], back: [0, 0, -1] };
  const nameOf = v => Object.keys(DIR).find(k => DIR[k].every((c, i) => c === v[i])) || 'none';
  const force = (cur, field) => nameOf(cross(DIR[cur], DIR[field]));

  /* ---------- 말굽자석 사이의 도선(작은 칸용) ---------- */
  // 공용 magnetForce와 같은 배치(자석의 트인 쪽이 오른쪽, 도선은 앞뒤 방향)를 작은 칸에 맞게 줄여 그린다.
  // o: ox, oy(자석 앞면의 왼쪽 아래), sc, top('N'|'S'), hide([위 이름, 아래 이름]이면 극을 가린다), current('toward'|'away'),
  //    move('right'|'left'|'auto'|없음: 초록색 힘 화살표), fs(극 글자 크기), curLabel, moveLabel
  const hsForce = p => force(p.current === 'toward' ? 'front' : 'back', p.top === 'N' ? 'down' : 'up');
  function horseshoe(o) {
    const sc = o.sc, pr = P3(o.ox, o.oy, sc, 0.42, 0.30), hide = !!o.hide;
    const ct = hide ? GRAY : o.top === 'N' ? RED : BLUE, cb = hide ? GRAY : o.top === 'N' ? BLUE : RED;
    const X0 = -0.9, X1 = 4.2, D = 3, b1 = 0.9, t0 = 3.0, t1 = 3.9, ym = 1.95, xw = 2.5, w0 = -2.7, w1 = 4.6;
    let s = poly([pr(0, b1, 0), pr(X1, b1, 0), pr(X1, b1, D), pr(0, b1, D)], cb.top) + poly([pr(0, b1, 0), pr(0, b1, D), pr(0, ym, D), pr(0, ym, 0)], cb.side);
    s += poly([pr(X1, 0, 0), pr(X1, 0, D), pr(X1, b1, D), pr(X1, b1, 0)], cb.side) + poly([pr(X0, 0, 0), pr(X1, 0, 0), pr(X1, b1, 0), pr(0, b1, 0), pr(0, ym, 0), pr(X0, ym, 0)], cb.front);
    s += poly([pr(0, ym, 0), pr(0, ym, D), pr(0, t0, D), pr(0, t0, 0)], ct.side) + copperLine([pr(xw, ym, w0), pr(xw, ym, w1)], o.wireW || 3.4);
    s += poly([pr(X1, t0, 0), pr(X1, t0, D), pr(X1, t1, D), pr(X1, t1, 0)], ct.side) + poly([pr(X0, t1, 0), pr(X1, t1, 0), pr(X1, t1, D), pr(X0, t1, D)], ct.top);
    s += poly([pr(X0, ym, 0), pr(0, ym, 0), pr(0, t0, 0), pr(X1, t0, 0), pr(X1, t1, 0), pr(X0, t1, 0)], ct.front);
    const names = hide ? o.hide : [o.top, o.top === 'N' ? 'S' : 'N'], lo = { fill: hide ? INK : '#fff', halo: false, size: o.fs || 17, weight: 800 };
    const nt = pr(3.6, (t0 + t1) / 2, 0), nb = pr(3.6, b1 / 2, 0);
    s += T(nt[0], nt[1] + 1, names[0], lo) + T(nb[0], nb[1] + 1, names[1], lo);
    const sg = o.current === 'toward' ? -1 : 1, c1 = pr(xw + 0.55, ym - 0.24, -1.3 - sg * 1.3), c2 = pr(xw + 0.55, ym - 0.24, -1.3 + sg * 1.3);
    s += arrow(c1[0], c1[1], c2[0], c2[1], { color: CUR, w: o.aw || 3 });
    if (o.curLabel) { const q = pr(1.35, b1 / 2, 0); s += T(q[0], q[1] + 1, '전류', { size: o.ls || 14, fill: CUR }); }
    const mv = o.move === 'auto' ? hsForce(o) : o.move;
    if (mv) {
      const d = DIR[mv][0], a = pr(xw + d * 0.32, ym, 1), b = pr(xw + d * 1.5, ym, 1);
      s += arrow(a[0], a[1], b[0], b[1], { color: GREEN, w: o.mw || 4 });
      if (o.moveLabel) s += T(b[0] + d * 15, b[1], '힘', { size: o.ls || 14, fill: GREEN_T });
    }
    return s;
  }

  /* 그림 보기: 말굽자석 사이의 도선과 힘 화살표. p.top, p.current, p.move('right'|'left') */
  FIG.l8_pick = p => {
    const W = 160, H = 144;
    let s = horseshoe({ ox: 28, oy: 114, sc: 22, top: p.top, current: p.current, move: p.move, fs: 16, wireW: 3, aw: 2.8, mw: 3.8 });
    s += T(W / 2, H - 11, p.current === 'toward' ? '전류: 뒤쪽 → 앞쪽' : '전류: 앞쪽 → 뒤쪽', { size: 14, fill: CUR });
    return svg(W, H, s, '말굽자석 사이에 놓인 도선과 힘의 방향을 나타낸 화살표');
  };
  FIG.l8_pick.force = hsForce;
  FIG.l8_pick.ok = p => p.move === hsForce(p);

  /* 말굽자석 두 벌을 나란히. p.panels: [{top, current, hide:[위 이름, 아래 이름], cap}] 힘 화살표는 계산해서 그린다 */
  FIG.l8_forcePair = p => {
    const pw = 182, sc = 26; let s = '';
    p.panels.forEach((pn, i) => {
      const x = i * (pw + 8);
      s += horseshoe({ ox: x + 8 + 0.9 * sc, oy: 134, sc, top: pn.top, current: pn.current, hide: pn.hide, move: 'auto', fs: 19, ls: 16, curLabel: true, moveLabel: true });
      s += T(x + pw / 2, 157, pn.cap, { size: 16.5, weight: 700 });
    });
    return svg(pw * p.panels.length + 8 * (p.panels.length - 1), 170, s, '말굽자석 사이에 놓인 도선이 힘을 받는 두 경우');
  };
  FIG.l8_forcePair.force = hsForce;

  /* 그림 보기: 마주 보는 두 자석 사이의 도선. p.nLeft(기본 true), p.cur(전류의 방향 이름: front, back, left, right, up, down) */
  const gapForce = p => force(p.cur, p.nLeft === false ? 'left' : 'right');
  FIG.l8_gapWire = p => {
    const W = 168, H = 108, pr = P3(84, 54, 19, 0.45, 0.32), nL = p.nLeft !== false, v = DIR[p.cur];
    const pt = (x, y, z) => pr(x, y, -z);
    const mag = (x0, x1, c, ch) => { const q = pr((x0 + x1) / 2, 0, -1.3); return box3(pr, x0, x1, -1, 1, -1.3, 1.3, c) + T(q[0], q[1] + 1, ch, { fill: '#fff', halo: false, size: 16, weight: 800 }); };
    const half = v[0] ? 1.55 : v[1] ? 2.5 : 3.3, off = v[0] ? [0, 0.5, 0] : v[1] ? [0.5, 0, 0] : [0.55, -0.12, 0], al = v[0] ? 0.95 : v[1] ? 1.15 : 1.7;
    let s = mag(-3.6, -2.3, nL ? RED : BLUE, nL ? 'N' : 'S');
    s += copperLine([pt(-v[0] * half, -v[1] * half, -v[2] * half), pt(v[0] * half, v[1] * half, v[2] * half)], 3.4);
    s += mag(2.3, 3.6, nL ? BLUE : RED, nL ? 'S' : 'N');
    const a = pt(off[0] - v[0] * al, off[1] - v[1] * al, off[2] - v[2] * al), b = pt(off[0] + v[0] * al, off[1] + v[1] * al, off[2] + v[2] * al);
    s += arrow(a[0], a[1], b[0], b[1], { color: CUR, w: 2.8 });
    return svg(W, H, s, '두 자석 사이에 놓인 도선에 전류가 흐르는 모습');
  };
  FIG.l8_gapWire.force = gapForce;

  /* 그림 보기: 전류, 자기장, 힘의 방향을 세 화살표로. p.I, p.B, p.F(방향 이름) */
  FIG.l8_axes = p => {
    const W = 164, H = 128, pr = P3(76, 90, 40, 0.6, 0.42), pt = v => pr(v[0], v[1], -v[2]);
    let s = poly([[-1.05, 0, 1], [1.05, 0, 1], [1.05, 0, -1], [-1.05, 0, -1]].map(pt), '#eef1f5', { stroke: '#b9c3d0', sw: 1.4 });
    const O = pt([0, 0, 0]);
    const lab = { right: [0, 16], left: [-2, -13], up: [0, -13], down: [0, 13], back: [18, -9], front: [-18, 9] };
    [['B', '자기장', FIELD], ['I', '전류', CUR], ['F', '힘', GREEN_T]].forEach(([k, name, color]) => {
      const v = DIR[p[k]], L = v[2] ? 1.3 : 1.15, tip = pt(v.map(c => c * L)), d = lab[p[k]];
      s += arrow(O[0], O[1], tip[0], tip[1], { color: k === 'F' ? GREEN : color, w: 3.2 }) + T(tip[0] + d[0], tip[1] + d[1], name, { size: 14.5, fill: color });
    });
    s += `<circle cx="${r2(O[0])}" cy="${r2(O[1])}" r="3.6" fill="${INK}"/>`;
    return svg(W, H, s, '전류, 자기장, 힘의 방향을 나타낸 세 화살표');
  };
  FIG.l8_axes.ok = p => p.F === force(p.I, p.B);
  FIG.l8_axes.force = p => force(p.I, p.B);

  /* 스피커의 구조. A 자석, B 코일, C 진동판(이름은 그림에 쓰지 않는다) */
  FIG.l8_speaker = () => {
    const cy = 116, r = 33, x0 = 168, x1 = 212, n = 4, pch = (x1 - x0) / n, back = [], front = [];
    for (let i = 0; i < n; i++) {
      const xs = x0 + i * pch, fa = [], ba = [];
      for (let k = 0; k <= 14; k++) { const th = k / 14 * Math.PI; fa.push([xs + pch * th / (2 * Math.PI), cy + r * Math.cos(th)]); ba.push([xs + pch * (th + Math.PI) / (2 * Math.PI), cy + r * Math.cos(th + Math.PI)]); }
      back.push(line2(ba, '#9aa5b3', 5.2) + line2(ba, '#e6c4a6', 3)); front.push(copperLine(fa, 4.2));
    }
    let s = '';
    // 진동판(원뿔 모양 종이)
    s += `<path d="M220 ${cy - 27}L306 ${cy - 88}V${cy + 88}L220 ${cy + 27}Z" fill="#e3e8ef" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<path d="M226 ${cy - 27}L304 ${cy - 82}L304 ${cy - 31}Z" fill="#f4f6f9" opacity=".85"/>`;
    s += `<ellipse cx="306" cy="${cy}" rx="13" ry="88" fill="#f6f8fb" stroke="${INK}" stroke-width="2"/>`;
    // 소리
    [0, 1, 2].forEach(i => { const x = 328 + i * 13, h = 30 + i * 12; s += `<path d="M${x} ${cy - h}Q${x + 12} ${cy} ${x} ${cy + h}" fill="none" stroke="${SUB}" stroke-width="2" stroke-linecap="round"/>`; });
    // 자석, 코일을 감은 통, 코일(뒤쪽 반은 옅게)
    s += barMagnet(98, cy, 164, 44, false);
    s += `<rect x="160" y="${cy - 28}" width="62" height="56" rx="3" fill="#fff8e8" fill-opacity=".72" stroke="${INK}" stroke-width="1.8"/>`;
    s += back.join('') + copperLine([[x0, cy + r - 1], [x0, 196]], 4.2) + copperLine([[x1, cy + r - 1], [x1, 196]], 4.2) + front.join('');
    s += `<circle cx="${x0}" cy="199" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${x1}" cy="199" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    s += T(x0 - 12, 199, '전류', { size: 14.5, fill: CUR, anchor: 'end' });
    s += leader(57, cy - 22, 57, cy - 52) + T(57, cy - 64, 'A', { size: 17, weight: 800 });
    s += leader(190, cy - r - 2, 190, cy - 66) + T(190, cy - 78, 'B', { size: 17, weight: 800 });
    s += leader(270, cy - 58, 258, cy - 86) + T(254, cy - 98, 'C', { size: 17, weight: 800 });
    return svg(370, 216, s, '스피커의 구조');
  };

  /* 선풍기(전동기)의 에너지 전환. p.inJ, p.out: [{name, J, color}] 둘 */
  FIG.l8_fanEnergy = p => {
    const th = J => 7 + 20 * Math.sqrt(Math.min(J, 60) / 60);
    const block = (x1, y1, x2, y2, t, fill) => {
      const a = Math.atan2(y2 - y1, x2 - x1), ca = Math.cos(a), sa = Math.sin(a), hd = Math.min(18, t * 0.8 + 7), L = Math.hypot(x2 - x1, y2 - y1) - hd;
      const pt = (u, v) => [x1 + ca * u - sa * v, y1 + sa * u + ca * v];
      return poly([pt(0, -t / 2), pt(L, -t / 2), pt(L, -t / 2 - 6), pt(L + hd, 0), pt(L, t / 2 + 6), pt(L, t / 2), pt(0, t / 2)], fill, { sw: 1.8 });
    };
    const cy = 84, fx = 150, fy = 74, tin = th(p.inJ), o = p.out;
    let s = `<rect x="4" y="4" width="366" height="152" rx="12" fill="#f4f6f9"/>` + T(14, 22, p.title || '선풍기', { size: 14.5, weight: 700, halo: false, anchor: 'start' });
    s += block(14, cy, 104, cy, tin, '#8fc2f7') + T(58, cy + tin / 2 + 21, `전기 에너지 <tspan font-weight="800">${p.inJ} J</tspan>`, { size: 14, halo: false });
    // 선풍기
    s += `<path d="M${fx - 5} ${fy + 20}H${fx + 5}L${fx + 7} ${fy + 52}H${fx - 7}Z" fill="#aab3bf" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><rect x="${fx - 24}" y="${fy + 50}" width="48" height="11" rx="5" fill="#596373" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<circle cx="${fx}" cy="${fy}" r="30" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    [90, 210, 330].forEach(a => { s += `<ellipse cx="${fx}" cy="${fy - 14}" rx="8.5" ry="13" fill="#8fc2f7" stroke="${INK}" stroke-width="1.6" transform="rotate(${a} ${fx} ${fy})"/>`; });
    s += `<circle cx="${fx}" cy="${fy}" r="5.5" fill="#596373" stroke="${INK}" stroke-width="1.6"/>`;
    s += block(196, cy - 14, 266, cy - 34, th(o[0].J), o[0].color) + T(318, cy - 36, `${o[0].name} <tspan font-weight="800">${o[0].J} J</tspan>`, { size: 14, halo: false });
    s += block(196, cy + 14, 266, cy + 30, th(o[1].J), o[1].color) + T(318, cy + 34, `${o[1].name} <tspan font-weight="800">${o[1].J} J</tspan>`, { size: 14, halo: false });
    return svg(374, 160, s, '선풍기가 1초 동안 사용하는 전기 에너지와 전환되는 에너지');
  };
})(FIG);

/** 그림 한 장(SVG 문자열). kind는 그림 이름, p는 인자. */
export function g2u7Fig(kind: string, p: Record<string, unknown> = {}): string {
  return FIG[kind](p);
}
/** 보기 칸에 넣는 그림(그림 고르기 문항). */
export function g2u7OptFig(kind: string, p: Record<string, unknown> = {}): string {
  return `<span class="ex-optfig">${FIG[kind](p)}</span>`;
}
/** 문항 그림 칸에 넣는 표. 첫 줄은 머리, 각 줄의 첫 칸도 머리로 그린다. */
export function g2u7Table(head: string[], rows: string[][]): string {
  const tr = (cells: string[], allHead: boolean): string =>
    `<tr>${cells.map((c, i) => (allHead || i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`;
  return `<table class="ex-table">${tr(head, true)}${rows.map((r) => tr(r, false)).join("")}</table>`;
}
