// @ts-nocheck
// 중1 Ⅱ 생물의 구성과 다양성 단원 종합 평가(v3, 2026-11) 그림. 전부 코드로 그린 SVG이고 기호, 가린 칸, 수는 인자로 받는다.
// 캔버스는 폭 380 이하로 잡아, 폰의 그림 칸(.q-figure-art, 높이 220 제한)과 넓은 화면의 왼쪽 칸에 한 벌로 쓴다.
// 앞부분은 바탕 부품(FIG.kit), 그다음 공용 생물 그림(FIG.scope, cell, prep, lineup, regions, levels, taxa, flow, cards, bars),
// 뒷부분은 레슨별 그림(FIG.l1_… ~ FIG.l10…)이다. 레슨 그림은 조각을 이어 붙인 것이라 뒤에 오는 정의가 앞의 것을 바꾼다.
// 그라데이션과 자르기 정의는 K.addDefs로 모아 두고 그림마다 svg 안에 함께 넣는다.
// 타입 검사를 끈 까닭: 판정용 페이지에서 쓰던 자바스크립트 그림 코드를 그대로 옮겨 왔다. 바깥에 내놓는 함수 셋만 타입을 단다.
// 출처: 리포 밖 output/exam-pilot/g1u2(출제 지침과 판정 페이지). 옮긴 뒤에는 이 파일이 정본이다.
const FIG: any = (function () {
  'use strict';
  const INK = '#2b3545', SUB = '#667085', RED = '#e5484d', BLUE = '#2f7fe0', GREEN = '#2f9e5b', ORANGE = '#e8590c', PURPLE = '#7a5af5', BROWN = '#a9743b';
  const FONT = "'Pretendard','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif";
  const r2 = n => Math.round(n * 100) / 100;

  // 그라데이션, 무늬 정의. figs 파일에서 K.addDefs('<linearGradient id="g-..."> ... ')로 보탠다(id는 g-로 시작, 겹치지 않게).
  const DEF_ITEMS = [
    '<linearGradient id="g-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f3f6fa"/></linearGradient>',
    '<linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfe9f9" stop-opacity=".8"/><stop offset=".5" stop-color="#f3fafe" stop-opacity=".5"/><stop offset="1" stop-color="#bfe0f5" stop-opacity=".85"/></linearGradient>',
    '<linearGradient id="g-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset=".45" stop-color="#d5dbe3"/><stop offset="1" stop-color="#9ea8b5"/></linearGradient>',
  ];
  const defs = () => `<defs>${DEF_ITEMS.join('')}</defs>`;
  function addDefs(s) { if (!DEF_ITEMS.includes(s)) DEF_ITEMS.push(s); }

  function svg(W, H, body, label) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT}" role="img" aria-label="${label || '문항 그림'}">${defs()}<svg x="0" y="0" width="${W}" height="${H}">${body}</svg></svg>`; // 안쪽 svg가 캔버스 밖으로 나간 그림을 잘라 준다(칸이 그림보다 넓을 때 옆으로 새어 보이지 않게)
  }
  // 글자. 기본 크기 15, 흰 테두리(halo)가 붙어 선 위에 놓여도 읽힌다. o: size, weight, fill, anchor('start'|'middle'|'end'), halo(false면 테두리 없음)
  function T(x, y, s, o = {}) {
    const halo = o.halo === false ? '' : ` stroke="#fff" stroke-width="${o.haloW || 4}" stroke-linejoin="round" paint-order="stroke"`;
    return `<text x="${r2(x)}" y="${r2(y)}" font-size="${o.size || 15}" font-weight="${o.weight || 600}" fill="${o.fill || INK}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="central"${halo}>${s}</text>`;
  }
  // 화살표. o: color, w(두께), head(촉 크기), dash
  function arrow(x1, y1, x2, y2, o = {}) {
    const c = o.color || INK, w = o.w || 2.4, h = o.head || (w * 3.4 + 3);
    const a = Math.atan2(y2 - y1, x2 - x1), ca = Math.cos(a), sa = Math.sin(a);
    const bx = x2 - h * ca, by = y2 - h * sa, px = -sa * h * 0.52, py = ca * h * 0.52;
    return `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(bx + ca)}" y2="${r2(by + sa)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>` +
      `<polygon points="${r2(x2)},${r2(y2)} ${r2(bx + px)},${r2(by + py)} ${r2(bx - px)},${r2(by - py)}" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/>`;
  }
  function poly(pts, fill, o = {}) {
    return `<polygon points="${pts.map(p => r2(p[0]) + ',' + r2(p[1])).join(' ')}" fill="${fill}" stroke="${o.stroke || INK}" stroke-width="${o.sw == null ? 2 : o.sw}" stroke-linejoin="round"/>`;
  }
  function line2(pts, color, w, o = {}) {
    return `<polyline points="${pts.map(p => r2(p[0]) + ',' + r2(p[1])).join(' ')}" fill="none" stroke="${color || INK}" stroke-width="${w || 2}" stroke-linejoin="round" stroke-linecap="${o.cap || 'round'}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
  }
  // 이름표를 잇는 가는 지시선
  const leader = (x1, y1, x2, y2) => `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${SUB}" stroke-width="1.3"/>`;
  // 판 아래에 붙이는 굵은 이름((가), (나), A 지역 등)
  const caption = (x, y, s) => T(x, y, s, { size: 15, weight: 700 });
  // 둥근 사각 상자. o: fill, stroke, sw, r
  const box = (x, y, w, h, o = {}) => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${o.r == null ? 8 : o.r}" fill="${o.fill || '#fff'}" stroke="${o.stroke || INK}" stroke-width="${o.sw == null ? 2 : o.sw}"/>`;
  // 기호 배지(A, B, ㉠ 등): 흰 원 안에 굵은 글자
  const badge = (x, y, s, o = {}) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${o.r || 11}" fill="${o.fill || '#fff'}" stroke="${o.stroke || INK}" stroke-width="1.6"/>` + T(x, y + 0.5, s, { size: o.size || 14, weight: 800, halo: false, fill: o.color || INK });
  const scaleAt = (x, y, k, body) => `<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${body}</g>`;
  const move = (x, y, body) => `<g transform="translate(${r2(x)} ${r2(y)})">${body}</g>`;
  // 판 여러 개를 옆으로 나란히 놓는다. panels: [{w, h, body}] → {w, h, body}
  function rowOf(panels, gap) {
    const g = gap == null ? 8 : gap; let x = 0, h = 0, s = '';
    panels.forEach(p => { s += `<g transform="translate(${x} 0)">${p.body}</g>`; x += p.w + g; h = Math.max(h, p.h); });
    return { w: x - g, h, body: s };
  }

  const FIG = {};
  Object.defineProperty(FIG, 'defs', { get: defs, enumerable: false }); // 페이지 맨 위에 한 번 넣어 둔다
  FIG.kit = { INK, SUB, RED, BLUE, GREEN, ORANGE, PURPLE, BROWN, FONT, r2, addDefs, svg, T, arrow, poly, line2, leader, caption, box, badge, scaleAt, move, rowOf };

  return FIG;
})();

/* ====================== 공용 생물 그림 ====================== */
// 공용 생물 그림. 묶음 파일(common-a.js, common-b.js, common-c.js)을 tools/assemble-common.cjs로 이은 것이다. 직접 고치지 않는다.

/* ===== common-a.js ===== */
// figs/common-a.js : 여러 레슨이 함께 쓰는 그림 가운데 FIG.scope, FIG.cell
//
// ■ FIG.scope(p) : 현미경으로 본 둥근 관찰 화면
//   kind   : 'onion'(기본. 벽돌처럼 늘어선 길쭉한 칸, 칸마다 둥근 핵)
//            'cheek'(둥글고 납작한 세포가 흩어져 있고 가운데 핵)
//            'leaf' (각진 칸에 초록 알갱이 여러 개와 핵)
//   stain  : 'none'(기본) | 'blue'(핵이 푸른색) | 'red'(핵이 붉은색)
//   hl     : 붉은 표시. 'cell'(가운데 세포 하나) | 'nucleus'(핵 하나) | 'row'(세포 둘을 한꺼번에)
//            | 'wall'(경계 선만. cheek에서는 무시) | 'all'(화면 전체)
//   marks  : 기호(1~2글자)를 붙일 곳. {cell:'A', nucleus:'B', chloro:'C', wall:'D'}
//            chloro는 leaf에서만, wall은 onion과 leaf에서만 그린다. 기호를 쓰면 w는 300 이상을 권한다.
//   bar    : 축척 막대 {t, cells}. 문항에는 쓰지 않는다(단위는 묻지 않는다, 사용자 결정 2026-11-20). 코드만 남아 있다.
//   w      : 판의 폭. 170(그림 보기용) 또는 300(기본). 높이는 자동(막대가 있으면 최대 250).
//   bubble : 공기 방울 개수(0~4)
//   예) FIG.scope({kind:'onion', w:170, hl:'cell'})
//       FIG.scope({kind:'onion', w:300, marks:{cell:'A'}})
//       FIG.scope({kind:'leaf', stain:'red', w:170})
//
// ■ FIG.cell(p) : 동물세포, 식물세포 단면
//   kind   : 'animal'(기본) | 'plant'
//   marks  : {membrane, nucleus, mito, chloro, wall} 가운데 표시할 구조와 글자.
//            값이 1~2글자면 기호 배지, 더 길면 이름표(이름표를 쓰면 한 판으로, w는 비워 두거나 380).
//            동물세포에는 chloro, wall이 없으므로 무시한다.
//   hide   : 빼고 그릴 구조 배열. 예) ['chloro'], ['mito'], ['wall'], ['nucleus'], ['membrane']
//   w      : 판의 폭. 기본 300(이름표가 있으면 380). 그림 보기용은 170.
//   cap    : 판 아래 이름. 예) '(가)'
//   panels : [{kind, cap, marks, hide, w}] 두 판(폭 176씩) 또는 세 판(폭 120씩)을 나란히 놓는다.
//   예) FIG.cell({kind:'animal', marks:{mito:'A', nucleus:'B', membrane:'C'}})
//       FIG.cell({panels:[{kind:'plant', cap:'(가)', marks:{wall:'A', chloro:'B', mito:'C'}},
//                         {kind:'animal', cap:'(나)', marks:{nucleus:'D', membrane:'E'}}]})
//       FIG.cell({kind:'plant', w:170, hide:['chloro']})
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, RED, r2, svg, T, poly, line2, leader, caption, badge, rowOf } = K;

  K.addDefs('<radialGradient id="g-ca-cytoA" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#fbdcc2"/></radialGradient>');
  K.addDefs('<radialGradient id="g-ca-cytoP" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#fbfdee"/><stop offset="1" stop-color="#e3f0c2"/></radialGradient>');
  K.addDefs('<linearGradient id="g-ca-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd88e"/><stop offset="1" stop-color="#8db45a"/></linearGradient>');
  K.addDefs('<radialGradient id="g-ca-nuc" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#efe0fb"/><stop offset="1" stop-color="#b18fdc"/></radialGradient>');
  K.addDefs('<linearGradient id="g-ca-mito" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0b5"/><stop offset="1" stop-color="#f09a4c"/></linearGradient>');
  K.addDefs('<linearGradient id="g-ca-chl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e07f"/><stop offset="1" stop-color="#3f9e48"/></linearGradient>');

  const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  // 씨앗 값 계산(난수 대신). 같은 (i, j)면 늘 같은 0~1 값
  const hash = (i, j) => { const v = Math.sin(i * 12.9898 + j * 78.233 + 1.7) * 43758.5453; return v - Math.floor(v); };
  // 점들을 부드럽게 잇는 닫힌 곡선
  const blob = pts => {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s0 = mid(pts[n - 1], pts[0]);
    let d = `M${r2(s0[0])},${r2(s0[1])}`;
    for (let i = 0; i < n; i++) { const q = mid(pts[i], pts[(i + 1) % n]); d += ` Q${r2(pts[i][0])},${r2(pts[i][1])} ${r2(q[0])},${r2(q[1])}`; }
    return d + 'Z';
  };
  const dot = (x, y) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="2.2" fill="${SUB}"/>`;
  // 기호 배지와 지시선(지시선 끝에 작은 점)
  function tag(bx, by, tx, ty, s) {
    const d = Math.hypot(tx - bx, ty - by) || 1, k = 11.5 / d;
    return leader(bx + (tx - bx) * k, by + (ty - by) * k, tx, ty) + dot(tx, ty) + badge(bx, by, String(s));
  }

  // ───────────────────────── FIG.scope ─────────────────────────
  const NUC = {
    none: ['#d9d3c3', '#9a917d', '#b5ac96'],
    blue: ['#5a8fee', '#1f4fa8', '#1a3d88'],
    red: ['#ec6c7b', '#a8263b', '#8c1c2f'],
  };
  const CH = [[0.15, 0.25], [0.4, 0.2], [0.68, 0.24], [0.87, 0.42], [0.8, 0.76], [0.52, 0.8], [0.25, 0.75], [0.12, 0.55]];
  const CK = [[-0.05, 0], [-0.55, -0.42], [0.5, -0.5], [0.58, 0.3], [-0.5, 0.48], [0.05, 0.68], [-0.02, -0.72]];
  const BB = [[0.52, -0.5], [-0.58, 0.38], [0.3, 0.62], [-0.4, -0.6]];

  FIG.scope = p => {
    p = p || {};
    const kind = ['onion', 'cheek', 'leaf'].includes(p.kind) ? p.kind : 'onion';
    const stain = p.stain === 'blue' || p.stain === 'red' ? p.stain : 'none';
    const marks = obj(p.marks);
    const W = Math.max(120, Math.min(380, +p.w || 300));
    const mk = ['cell', 'nucleus', 'chloro', 'wall'].filter(k => marks[k] != null && marks[k] !== '' &&
      !(k === 'chloro' && kind !== 'leaf') && !(k === 'wall' && kind === 'cheek'));
    const side = mk.length ? 40 : 6;
    const R = Math.min((W - 2 * side) / 2, 100), cx = W / 2, cy = R + 4, s = R / 100;
    const bar = p.bar && typeof p.bar === 'object' ? p.bar : null;
    const H = 2 * R + 8 + (bar ? 42 : 0);
    const nc = NUC[stain];
    const nuc = (x, y, r) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${nc[0]}" stroke="${nc[1]}" stroke-width="1.3"/>` +
      `<circle cx="${r2(x + r * 0.2)}" cy="${r2(y - r * 0.15)}" r="${r2(r * 0.32)}" fill="${nc[2]}"/>`;
    const red = (d, sw) => `<path d="${d}" fill="none" stroke="${RED}" stroke-width="${sw || 3.4}" stroke-linejoin="round"/>`;
    const tint = stain === 'blue' ? '#edf3fc' : stain === 'red' ? '#fcefee' : null;

    let body = '', hl = '', longLen, tCell, tNuc, nR, tChl, tWall;
    if (kind === 'cheek') {
      body += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${tint || '#f8f5ef'}"/>`;
      const rc = 0.22 * R; nR = 0.055 * R; longLen = 0.44 * R;
      const shape = (k, f) => {
        const c = CK[k], ph = hash(k, 1) * 6.283, ps = hash(k, 2) * 6.283, pts = [];
        for (let i = 0; i < 16; i++) {
          const t = i / 16 * 6.283, r = rc * f * (1 + 0.12 * Math.sin(2 * t + ph) + 0.08 * Math.sin(3 * t + ps));
          pts.push([cx + c[0] * R + r * Math.cos(t), cy + c[1] * R + r * Math.sin(t)]);
        }
        return blob(pts);
      };
      CK.forEach((c, k) => {
        const x = cx + c[0] * R, y = cy + c[1] * R;
        body += `<path d="${shape(k, 1)}" fill="#efe2d0" fill-opacity=".85" stroke="#8a7b69" stroke-width="1.6"/>`;
        for (let g = 0; g < 5; g++) {
          const t = hash(k, g + 20) * 6.283, d = (0.09 + 0.05 * hash(k, g + 40)) * R;
          body += `<circle cx="${r2(x + d * Math.cos(t))}" cy="${r2(y + d * Math.sin(t))}" r="1" fill="#b8a48c"/>`;
        }
        const nx = k === 0 ? x : x + (hash(k, 5) - 0.5) * 0.05 * R, ny = k === 0 ? y : y + (hash(k, 6) - 0.5) * 0.05 * R;
        body += nuc(nx, ny, nR);
      });
      const x0 = cx + CK[0][0] * R, y0 = cy + CK[0][1] * R;
      tCell = [x0 - 0.12 * R, y0 + 0.02 * R]; tNuc = [x0, y0];
      if (p.hl === 'cell') hl = red(shape(0, 1.13));
      if (p.hl === 'row') hl = `<ellipse cx="${r2(cx + 0.265 * R)}" cy="${r2(cy + 0.15 * R)}" rx="${r2(0.65 * R)}" ry="${r2(0.29 * R)}" transform="rotate(25.5 ${r2(cx + 0.265 * R)} ${r2(cy + 0.15 * R)})" fill="none" stroke="${RED}" stroke-width="3.4"/>`;
    } else {
      const onion = kind === 'onion';
      const L = (onion ? 80 : 54) * s, Hc = (onion ? 30 : 36) * s, amp = (onion ? 5 : 3) * s;
      const fill = onion ? (tint || '#f8f3e2') : '#eef7dc', wallC = onion ? '#7d7358' : '#4f7a3a', wallW = onion ? 2 : 2.6;
      nR = (onion ? 6 : 5.5) * s; longLen = L;
      const off = i => ((((i % 2) + 2) % 2) ? 0.5 : 0) * L + ((i === 0 || i === 1) ? 0 : (hash(i, 7) - 0.5) * 0.24 * L);
      const bx = (i, j) => cx - L / 2 + off(i) + j * L, dd = (i, j) => (hash(i, j) - 0.5) * 2 * amp;
      const cellPts = (i, j) => {
        const y0 = cy + (i - 0.5) * Hc, y1 = y0 + Hc;
        return [[bx(i, j) + dd(i, j), y0], [bx(i, j + 1) + dd(i, j + 1), y0], [bx(i, j + 1) - dd(i, j + 1), y1], [bx(i, j) - dd(i, j), y1]];
      };
      body += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${fill}"/>`;
      const nr = Math.ceil(R / Hc) + 1, ncol = Math.ceil(R / L) + 2;
      for (let i = -nr; i <= nr; i++) for (let j = -ncol; j <= ncol; j++) {
        const mid = i === 0 && j === 0, x0 = bx(i, j), y0 = cy + (i - 0.5) * Hc;
        body += poly(cellPts(i, j), fill, { stroke: wallC, sw: wallW });
        if (!onion) CH.forEach((c, k) => {
          if (!mid && hash(i * 3 + k, j + 5) < 0.2) return;
          const x = x0 + c[0] * L, y = y0 + c[1] * Hc;
          body += `<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r2(4.6 * s)}" ry="${r2(3.2 * s)}" transform="rotate(${Math.round(hash(i + k, j + 9) * 180)} ${r2(x)} ${r2(y)})" fill="#5cb85c" stroke="#2b7a36" stroke-width="1"/>`;
        });
        const fx = onion ? (mid ? 0.6 : 0.3 + 0.4 * hash(i + 11, j)) : (mid ? 0.5 : 0.44 + 0.12 * hash(i + 11, j));
        const fy = onion ? (mid ? 0.5 : 0.4 + 0.2 * hash(i, j + 11)) : 0.5;
        body += nuc(x0 + fx * L, y0 + fy * Hc, nR);
      }
      const x0 = bx(0, 0), c0 = cellPts(0, 0);
      tCell = [x0 + (onion ? 0.22 : 0.3) * L, cy];
      tNuc = [x0 + (onion ? 0.6 : 0.5) * L, cy];
      tChl = [x0 + 0.25 * L, cy + 0.25 * Hc];
      tWall = [x0 + 0.75 * L, cy - 0.5 * Hc];
      if (p.hl === 'cell') hl = poly(c0, 'none', { stroke: RED, sw: 3.4 });
      if (p.hl === 'row') { const c1 = cellPts(1, -1), c2 = cellPts(1, 0); hl = poly([c1[0], c2[1], c2[2], c1[3]], 'none', { stroke: RED, sw: 3.4 }); }
      if (p.hl === 'wall') hl = line2([c0[0], c0[1]], RED, 4.6);
    }
    if (p.hl === 'nucleus') hl = `<circle cx="${r2(tNuc[0])}" cy="${r2(tNuc[1])}" r="${r2(nR + 4.5 * s)}" fill="none" stroke="${RED}" stroke-width="3"/>`;

    const nb = Math.max(0, Math.min(4, Math.floor(+p.bubble || 0)));
    for (let k = 0; k < nb; k++) {
      const x = cx + BB[k][0] * R, y = cy + BB[k][1] * R, r = 0.13 * R;
      body += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="#fff" fill-opacity=".9" stroke="#1f2937" stroke-width="3.5"/>` +
        `<circle cx="${r2(x - r * 0.3)}" cy="${r2(y - r * 0.3)}" r="${r2(r * 0.22)}" fill="#dbe7f3"/>`;
    }
    body += hl;
    // 둥근 화면 바깥은 그리지 않는다(흰색으로 덮으면 캔버스 가장자리에 세포 경계가 흐린 세로줄로 비친다)
    const cid = `g-scope-${Math.round(cx * 10)}-${Math.round(cy * 10)}-${Math.round(R * 10)}`;
    K.addDefs(`<clipPath id="${cid}"><circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R)}"/></clipPath>`);
    body = `<g clip-path="url(#${cid})">${body}</g>`;
    body += `<circle cx="${cx}" cy="${r2(cy)}" r="${R}" fill="none" stroke="${INK}" stroke-width="3"/>`;
    if (p.hl === 'all') body += `<circle cx="${cx}" cy="${r2(cy)}" r="${r2(R - 6)}" fill="none" stroke="${RED}" stroke-width="3.4"/>`;

    const slot = { cell: [cx - R - 22, cy - 0.45 * R, tCell], chloro: [cx - R - 22, cy + 0.45 * R, tChl], wall: [cx + R + 22, cy - 0.45 * R, tWall], nucleus: [cx + R + 22, cy + 0.3 * R, tNuc] };
    mk.forEach(k => { const q = slot[k]; if (q[2]) body += tag(q[0], q[1], q[2][0], q[2][1], marks[k]); });

    if (bar) {
      const len = Math.min(W - 20, (bar.cells > 0 ? +bar.cells : 0.5) * longLen), y = 2 * R + 21, x1 = cx - len / 2, x2 = cx + len / 2;
      body += line2([[x1, y], [x2, y]], INK, 2.6, { cap: 'butt' }) + line2([[x1, y - 5], [x1, y + 5]], INK, 2.2) + line2([[x2, y - 5], [x2, y + 5]], INK, 2.2);
      if (bar.t) body += T(cx, y + 18, String(bar.t), { size: 14 });
    }
    return svg(W, r2(H), body, '현미경 관찰 화면');
  };

  // ───────────────────────── FIG.cell ─────────────────────────
  const ORDER = ['membrane', 'nucleus', 'mito', 'chloro', 'wall'];
  const OCT = [[-0.82, -1], [0.82, -1], [1, -0.7], [1, 0.7], [0.82, 1], [-0.82, 1], [-1, 0.7], [-1, -0.7]];

  function cellPanel(q, pw) {
    q = obj(q);
    const kind = q.kind === 'plant' ? 'plant' : 'animal', plant = kind === 'plant';
    const marks = obj(q.marks), hide = Array.isArray(q.hide) ? q.hide : [];
    const has = k => !hide.includes(k) && (plant || (k !== 'chloro' && k !== 'wall'));
    const keys = ORDER.filter(k => has(k) && marks[k] != null && marks[k] !== '');
    const longN = Math.max(0, ...keys.map(k => (String(marks[k]).length > 2 ? String(marks[k]).length : 0)));
    pw = Math.max(100, Math.min(380, pw || (longN ? 380 : 300)));
    const m = longN ? Math.min(108, longN * 14.5 + 12) : keys.length ? 28 : 6;
    const a = Math.max(30, Math.min(100, (pw - 2 * m) / 2)), b = 0.78 * a, u = a / 100;
    const cx = pw / 2, cy = 8 + b;
    const P = c => [cx + c[0] * a, cy + c[1] * a];
    let s = '';

    // 바깥 경계
    const mp = t => { const f = 0.93 * (1 + 0.04 * Math.sin(3 * t + 0.5) + 0.03 * Math.sin(5 * t + 1.2)); return [cx + a * f * Math.cos(t), cy + b * f * Math.sin(t)]; };
    const ring = d => OCT.map(c => [cx + c[0] * (a - d), cy + c[1] * (b - d)]);
    if (plant) {
      const wall = has('wall'), mem = has('membrane');
      if (wall) s += poly(ring(0), 'url(#g-ca-wall)') + poly(ring(9 * u), mem ? '#fdfef6' : 'url(#g-ca-cytoP)', { sw: 1.4 });
      if (mem) s += poly(ring(12.5 * u), 'url(#g-ca-cytoP)', { stroke: '#c2571a', sw: 1.8 });
      if (!wall && !mem) s += poly(ring(12.5 * u), 'url(#g-ca-cytoP)', { stroke: 'none', sw: 0 });
    } else {
      const pts = []; for (let k = 0; k < 24; k++) pts.push(mp(k / 24 * 2 * Math.PI));
      s += `<path d="${blob(pts)}" fill="url(#g-ca-cytoA)" stroke="${has('membrane') ? INK : 'none'}" stroke-width="2"/>`;
    }

    // 세포 속 구조(좌표는 세포 반폭 a를 1로 한 값)
    const N = plant ? [-0.38, -0.16, 0.24] : [-0.12, -0.04, 0.27];
    const MT = plant ? [[0.12, 0, -20], [-0.1, 0.48, 0]] : [[0.5, -0.3, -25], [0.45, 0.33, 30], [-0.48, 0.33, -20]];
    const CL = [[0.3, -0.44, 10], [0.62, 0.04, 80], [0.42, 0.46, -12], [-0.6, 0.4, 15]];
    if (has('chloro')) CL.forEach(c => {
      const [x, y] = P(c); let st = '';
      [-8, -2.7, 2.7, 8].forEach(dx => { const h = 8.5 * u * Math.sqrt(1 - (dx / 15) * (dx / 15)) * 0.72; st += line2([[dx * u, -h], [dx * u, h]], '#1d6b31', 1.5); });
      s += `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${c[2]})"><ellipse rx="${r2(15 * u)}" ry="${r2(8.5 * u)}" fill="url(#g-ca-chl)" stroke="${INK}" stroke-width="1.8"/>${st}</g>`;
    });
    if (has('mito')) MT.forEach(c => {
      const [x, y] = P(c), zig = [];
      for (let k = 0; k < 8; k++) zig.push([(-11 + k * 22 / 7) * u, (k % 2 ? 1 : -1) * 3.6 * u]);
      s += `<g transform="translate(${r2(x)} ${r2(y)}) rotate(${c[2]})"><ellipse rx="${r2(16 * u)}" ry="${r2(7.5 * u)}" fill="url(#g-ca-mito)" stroke="${INK}" stroke-width="1.8"/>${line2(zig, '#b4531a', 1.3)}</g>`;
    });
    if (has('nucleus')) {
      const [x, y] = P(N), r = N[2] * a;
      s += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="url(#g-ca-nuc)" stroke="${INK}" stroke-width="2"/>` +
        `<circle cx="${r2(x + r * 0.22)}" cy="${r2(y - r * 0.18)}" r="${r2(r * 0.33)}" fill="#6b46b0"/>`;
      [[-0.5, -0.4], [-0.1, 0.55], [0.5, 0.4], [-0.55, 0.2]].forEach(d => { s += `<circle cx="${r2(x + d[0] * r)}" cy="${r2(y + d[1] * r)}" r="${r2(Math.max(1, 2 * u))}" fill="#8f6fc8"/>`; });
    }

    // 기호, 이름표
    const tg = {
      membrane: plant ? [cx + a - 12.5 * u, cy + 0.28 * a] : mp(35 * Math.PI / 180),
      nucleus: plant ? P([-0.47, -0.09]) : P([-0.22, 0.04]),
      mito: P(MT[0]), chloro: P(CL[1]), wall: [cx - a + 4.5 * u, cy + 0.12 * a],
    };
    const sides = { L: [], R: [] };
    keys.forEach(k => sides[tg[k][0] < cx ? 'L' : 'R'].push(k));
    ['L', 'R'].forEach(sd => {
      const list = sides[sd].sort((k1, k2) => tg[k1][1] - tg[k2][1]), n = list.length, left = sd === 'L';
      list.forEach((k, i) => {
        const by = cy - b + (i + 0.5) * 2 * b / n, t = tg[k], txt = String(marks[k]);
        if (txt.length <= 2) s += tag(left ? cx - a - 15 : cx + a + 15, by, t[0], t[1], txt);
        else {
          const x0 = left ? cx - a - 8 : cx + a + 8;
          s += leader(x0, by, t[0], t[1]) + dot(t[0], t[1]) + T(x0 + (left ? -4 : 4), by, txt, { size: 14, anchor: left ? 'end' : 'start' });
        }
      });
    });
    let h = 16 + 2 * b;
    if (q.cap) { s += caption(cx, h + 12, String(q.cap)); h += 26; }
    return { w: pw, h: r2(h), body: s };
  }

  FIG.cell = p => {
    p = p || {};
    const list = Array.isArray(p.panels) && p.panels.length ? p.panels.slice(0, 3) : null;
    if (!list) { const c = cellPanel(p, +p.w || 0); return svg(c.w, c.h, c.body, '세포 단면'); }
    const pw = list.length === 3 ? 120 : list.length === 2 ? 176 : 0;
    const row = rowOf(list.map(q => cellPanel(q, +(q && q.w) || pw)), 8);
    return svg(row.w, row.h, row.body, '세포 단면');
  };
})(FIG);

/* ===== common-b.js ===== */
// figs/common-b.js : 여러 레슨이 함께 쓰는 그림 (prep, lineup, regions)
//
// ■ FIG.prep(p) : 현미경표본을 만드는 과정의 단계 그림
//   p.steps: [{k, tag, liquid}]
//     k      'smear'(면봉으로 받침 유리에 문지르기) | 'drop'(스포이트로 용액 떨어뜨리기)
//            | 'cover'(핀셋으로 덮개 유리를 비스듬히 덮기) | 'blot'(거름종이로 여분의 용액 없애기)
//            | 'leaf'(핀셋으로 검정말잎을 받침 유리에 올리기). 모르는 k는 건너뛴다.
//     tag    판 왼쪽 위에 붙는 이름('(가)' 등). 없으면 붙이지 않는다.
//     liquid 'blue' | 'red' | 'water'(기본) 용액 색
//   판 1~2개는 한 줄(폭 176씩), 3~4개는 2칸 격자(2×2), 5~6개는 3칸 격자(폭 120씩).
//   예) { kind: 'prep', p: { steps: [{ k: 'cover', tag: '(가)', liquid: 'blue' }, { k: 'smear', tag: '(나)' },
//                                    { k: 'blot', tag: '(다)', liquid: 'blue' }, { k: 'drop', tag: '(라)', liquid: 'blue' }] } }
//
// ■ FIG.lineup(p) : 생물 작은 그림을 묶음별로 줄지어 놓는 그림
//   p.rows: [{tag, label, items: [{k, n, c, pat, sc}]}]  묶음 하나가 상자 하나
//     tag   묶음 왼쪽에 붙는 이름('(가)' 등), label 묶음 아래 이름표(답을 알려 주는 말은 넣지 않는다)
//     k     'ladybug'(n 점 개수 0~9, c 겉날개 색, sc 점 색) | 'clam'(pat 'stripe'|'zig'|'dot', c 색)
//           | 'rabbit'(c 털색) | 'cat'(c 털색, pat 'stripe'|'spot') | 'grasshopper' | 'butterfly'(c) | 'frog'
//           | 'bird'(c) | 'fish'(c) | 'tree' | 'pine' | 'flower'(c 꽃 색) | 'mushroom'(c) | 'beetle'(c 몸 색)
//           | 'reed' | 'lily' | 'duck' | 'crab'. 모르는 k는 건너뛴다.
//   p.cols: 묶음을 놓을 칸 수(기본 1). p.per: 묶음 안에서 한 줄에 놓는 생물 수(기본 3, 넘으면 다음 줄).
//   예) { kind: 'lineup', p: { rows: [{ items: [{ k: 'ladybug', n: 2 }, { k: 'ladybug', n: 7 }, { k: 'ladybug', n: 4, c: '#f2a23a' }] }] } }
//   예) { kind: 'lineup', p: { cols: 2, rows: [{ tag: '(가)', label: '바지락', items: [{ k: 'clam', pat: 'stripe' }, { k: 'clam', pat: 'zig' }] }, ...] } }
//
// ■ FIG.regions(p) : 지역별 생물 분포(종류와 마릿수를 셀 수 있는 그림)
//   p.regions: [{name, zones: [{type, label, items: [[k, 개수, {c, n, pat}], ...]}]}]
//     name  지역 판 아래 이름('(가)', 'A 지역' 등)
//     type  'forest' | 'pond' | 'field' | 'tidal'(갯벌). 구역 배경색과 바닥 무늬가 달라진다. 구역은 위아래로 쌓인다.
//     label 구역 왼쪽 위 이름(선택, 기본은 없음). k는 lineup과 같다. 셋째 칸은 색 등 선택 인자.
//   p.h: 지역 판 높이(기본 210). 지역 2곳이면 판 폭 176, 3곳이면 120.
//   생물은 격자 칸에 하나씩 놓여 겹치지 않는다(폭 176 판은 한 줄에 4마리, 한 구역에 20마리쯤까지 제 크기).
//   예) { kind: 'regions', p: { regions: [{ name: '(가)', zones: [{ type: 'forest', items: [['tree', 6], ['bird', 5]] }] },
//        { name: '(나)', zones: [{ type: 'forest', items: [['tree', 2]] }, { type: 'pond', items: [['fish', 2], ['duck', 1]] }] }] } }
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<linearGradient id="g-b-forest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f5dc"/><stop offset="1" stop-color="#cfe8ba"/></linearGradient>');
  K.addDefs('<linearGradient id="g-b-pond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcf0fb"/><stop offset="1" stop-color="#b3daf3"/></linearGradient>');
  K.addDefs('<linearGradient id="g-b-field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f3d3"/><stop offset="1" stop-color="#e8e0a6"/></linearGradient>');
  K.addDefs('<linearGradient id="g-b-tidal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ebe3d4"/><stop offset="1" stop-color="#cfc2ab"/></linearGradient>');

  // ───────── 생물 작은 그림(중심 (0,0), 가로 세로 ±17 안) ─────────
  const ST = `stroke="${INK}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
  const E = (cx, cy, rx, ry, f, x) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${ST}${x ? ' ' + x : ''}/>`;
  const D = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
  const P = (d, f) => `<path d="${d}" fill="${f}" ${ST}/>`;
  const L = (d, c, w) => `<path d="${d}" fill="none" stroke="${c || INK}" stroke-width="${w || 1.4}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const mir = s => s + `<g transform="scale(-1 1)">${s}</g>`;
  const GRN = '#6fbf5a', DGRN = '#2f8f57', BRN = '#8a5a2b';

  const CRE = {
    ladybug(o) {
      const c = o.c || '#e5484d', sc = o.sc || INK, n = Math.max(0, Math.min(9, o.n == null ? 7 : (o.n | 0)));
      const PR = [[6, -3], [5, 7], [9, 3], [3, 12]], pts = [];
      if (n % 2) pts.push([0, -5]);
      for (let i = 0; i < Math.floor(n / 2); i++) pts.push([PR[i][0], PR[i][1]], [-PR[i][0], PR[i][1]]);
      return mir(L('M9,-4 L15,-8 M11,3 L17,3 M9,10 L14,15') + L('M2,-14 L5,-17', INK, 1.1)) + E(0, -11, 6, 4, INK) + E(0, 2, 12, 13, c) +
        L('M0,-11 L0,15', INK, 1.2) + pts.map(q => D(q[0], q[1], 2.5, sc)).join('');
    },
    beetle(o) {
      const c = o.c || '#5b4636';
      return mir(L('M7,-5 L14,-9 L16,-6 M9,3 L16,4 L17,8 M7,10 L13,14 L13,17')) + L('M0,-10 L0,-15 M0,-15 L-3,-17 M0,-15 L3,-17', INK, 2.2) +
        E(0, -9, 4, 3, c) + E(0, 6, 9, 10.5, c) + E(0, -4, 7.5, 4.5, c) + L('M0,0 L0,16', INK, 1.2) + L('M-5,3 Q-6.5,7 -5,11', '#ffffff', 1.3);
    },
    clam(o) {
      const c = o.c || '#e3cfae', d = '#7a5a3a';
      let s = P('M0,-12 C10,-12 16,-2 15,5 C13,13 -13,13 -15,5 C-16,-2 -10,-12 0,-12Z', c);
      if (o.pat === 'stripe') s += L('M0,-9 L-10,6 M0,-9 L-5,9 M0,-9 L0,10 M0,-9 L5,9 M0,-9 L10,6', d, 1.5);
      else if (o.pat === 'zig') s += L('M-10,-1 L-6,-5 L-2,-1 L2,-5 L6,-1 L10,-5 M-10,6 L-6,2 L-2,6 L2,2 L6,6 L10,2', d, 1.5);
      else if (o.pat === 'dot') s += [[-7, -2], [0, -5], [7, -2], [-4, 5], [4, 5], [0, 0], [-9, 5], [9, 5]].map(q => D(q[0], q[1], 1.5, d)).join('');
      return s + E(0, -11.5, 2.6, 1.6, c);
    },
    rabbit(o) {
      const c = o.c || '#f6f3ee';
      return E(-4, -10, 3, 7, c, 'transform="rotate(-12 -4 -10)"') + E(4, -10, 3, 7, c, 'transform="rotate(12 4 -10)"') +
        E(0, 9, 9.5, 7.5, c) + E(-5, 15, 4, 2, c) + E(5, 15, 4, 2, c) + E(0, -1, 7.5, 7, c) +
        D(-3, -2, 1.2, INK) + D(3, -2, 1.2, INK) + D(0, 1.5, 1.1, '#e58a9b');
    },
    cat(o) {
      const c = o.c || '#f0b46a', d = BRN;
      let s = L('M8,13 Q17,12 15,3', INK, 5) + L('M8,13 Q17,12 15,3', c, 2.2) + E(0, 9, 8.5, 8, c) +
        P('M-8,-9 L-7.5,-16 L-2.5,-12Z', c) + P('M8,-9 L7.5,-16 L2.5,-12Z', c) + E(0, -6, 8.5, 7.5, c);
      if (o.pat === 'stripe') s += L('M-3,-13 L-3,-10.5 M0,-13.5 L0,-10.5 M3,-13 L3,-10.5 M-8,6 L-5,7 M-8.3,10 L-5,10.5 M8,6 L5,7', d, 1.5);
      else if (o.pat === 'spot') s += `<ellipse cx="-4" cy="-9.5" rx="3.4" ry="2.8" fill="${d}"/><ellipse cx="3" cy="10" rx="4" ry="3.2" fill="${d}"/>`;
      return s + D(-3, -6, 1.2, INK) + D(3, -6, 1.2, INK) + D(0, -3.5, 1, '#e58a9b') + mir(L('M4,-3 L11,-4 M4,-2 L11,-1', INK, 0.8));
    },
    grasshopper() {
      return L('M14,-4 Q17,-10 13,-13', INK, 1.1) + L('M6,4 L5,10 L8,12 M1,4 L-1,10 L2,12') + P('M-15,2 Q-6,-5 10,-3 L12,4 Q0,7 -15,2Z', '#7cb342') +
        E(12.5, -1, 3.8, 5, '#7cb342') + D(13.5, -2.5, 1.2, INK) + L('M-13,1.5 Q-2,-2 8,-1', INK, 1) +
        P('M-1,2 L-9,-11 L-6,-11 L3,1Z', '#9ccc65') + L('M-8,-11 L-13,10 L-10,11');
    },
    butterfly(o) {
      const c = o.c || '#f2a23a';
      return mir(P('M0,-2 C-5,-15 -17,-14 -15,-4 C-14,1 -6,1 0,0Z', c) + P('M0,0 C-8,1 -14,6 -10,12 C-6,15 -2,8 0,3Z', c) + D(-10, -7, 2, '#fff') + D(-8, 8, 1.5, '#fff') +
        L('M-0.5,-7 Q-4,-12 -6,-15', INK, 1.1)) + E(0, 0, 1.8, 8, INK);
    },
    frog(o) {
      const g = o.c || GRN;
      return mir(E(-11, 10, 5, 4, g)) + E(0, 5, 12, 9.5, g) + `<ellipse cx="0" cy="8.5" rx="7" ry="4.5" fill="#e6f2c4"/>` +
        mir(E(-6, -6, 4.5, 4.5, g) + D(-6, -6, 2, INK)) + L('M-7,2 Q0,6 7,2', INK, 1.3);
    },
    bird(o) {
      const c = o.c || '#c58a52';
      return L('M-1,9 L-1,15 M3,9 L3,15', INK, 1.3) + P('M-8,1 L-16,-4 L-15,4Z', c) + E(0, 3, 10, 7.5, c) + E(8, -6, 5.5, 5.5, c) +
        P('M13,-7.5 L17,-5.5 L13,-4Z', '#f2a23a') + D(9.5, -7, 1.2, INK) + P('M-6,2 Q0,-3 6,3 Q0,8 -6,2Z', '#a56c3a');
    },
    fish(o) {
      const c = o.c || '#9db7cf';
      return P('M-7,0 L-16,-7 L-13,0 L-16,7Z', c) + P('M0,-7 L4,-12 L8,-6Z', c) + P('M-8,0 C-2,-10 10,-9 15,0 C10,9 -2,10 -8,0Z', c) +
        D(10, -2, 1.4, INK) + L('M6,-5 Q3,0 6,5', INK, 1.1);
    },
    tree() {
      const g = '#58b368';
      return P('M-2.5,5 L-3,16 L3,16 L2.5,5Z', '#a9743b') + E(-7, -1, 7, 7, g) + E(7, -1, 7, 7, g) + E(0, -9, 8, 8, g) + D(0, -2, 7.5, g);
    },
    pine() {
      return P('M-2,10 L-2,16 L2,16 L2,10Z', '#a9743b') + P('M0,-3 L-12,11 L12,11Z', DGRN) + P('M0,-10 L-10,3 L10,3Z', DGRN) + P('M0,-17 L-7,-5 L7,-5Z', DGRN);
    },
    flower(o) {
      const c = o.c || '#f27aa5'; let s = L('M0,0 L0,16', '#2f9e5b', 2) + E(4.5, 9, 4.5, 2.2, GRN, 'transform="rotate(-25 4.5 9)"');
      for (let i = 0; i < 5; i++) { const a = (-90 + 72 * i) * Math.PI / 180; s += E(r2(6 * Math.cos(a)), r2(-7 + 6 * Math.sin(a)), 4.3, 4.3, c); }
      return s + E(0, -7, 3, 3, '#f2c94c');
    },
    mushroom(o) {
      return P('M-4,2 L-5,14 Q0,17 5,14 L4,2Z', '#f3ead7') + P('M-14,3 C-14,-15 14,-15 14,3 Q0,-1 -14,3Z', o.c || '#c0703a') +
        D(-5, -5, 1.8, '#f6e7c8') + D(4, -7, 1.6, '#f6e7c8') + D(7, -1.5, 1.4, '#f6e7c8');
    },
    reed() {
      return L('M-2,16 Q-10,2 -13,-8', DGRN, 1.8) + L('M2,16 Q10,4 12,-5', DGRN, 1.8) + L('M-3,16 L-4,-8', DGRN, 1.6) + L('M4,16 L5,-3', DGRN, 1.6) +
        E(-4, -10, 2.6, 6.5, BRN) + E(5, -6, 2.4, 5.5, BRN);
    },
    lily() {
      const pk = '#f7a8c4';
      return E(0, 8, 14, 7, GRN) + L('M0,8 L11,4', INK, 1.2) + mir(P('M0,6 Q-12,1 -9,-6 Q-4,-2 0,6Z', pk)) + P('M0,6 Q-6,-4 0,-11 Q6,-4 0,6Z', '#fbd0df');
    },
    duck(o) {
      const c = o.c || '#f7f3e8';
      return P('M-12,2 L-16,-3 L-9,0Z', c) + P('M4,2 Q5,-4 5,-6 L10,-4 Q9,0 9,3Z', c) + E(-2, 5, 12, 6.5, c) + E(8, -7, 5, 5, c) +
        P('M12.5,-8 L17,-6 L12.5,-4.5Z', '#f2a23a') + D(9, -8, 1.1, INK) + L('M-8,5 Q-2,1 4,5', INK, 1.1) +
        L('M-15,13 Q-11,11 -7,13 M-2,13.5 Q2,11.5 6,13.5 M9,13 Q12,11.5 15,13', '#5a9bd4', 1.2);
    },
    crab(o) {
      const c = o.c || '#e07a5f';
      return mir(L('M-8,4 L-15,2 M-8,7 L-15,8 M-7,10 L-13,13') + L('M-8,-1 L-12,-7', INK, 1.6) + E(-12, -10, 3.5, 3, c)) + E(0, 4, 10, 7, c) +
        mir(L('M-3,-2 L-3,-6', INK, 1.2) + D(-3, -7, 1.4, INK));
    },
  };
  const has = k => Object.prototype.hasOwnProperty.call(CRE, k);
  const cre = (it, x, y, k) => `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(k)})">${CRE[it.k](it)}</g>`;

  // ───────── FIG.lineup ─────────
  FIG.lineup = p => {
    p = p || {};
    let rows = Array.isArray(p.rows) ? p.rows : null;
    if (!rows || !rows.length) rows = [{ items: [{ k: 'ladybug', n: 2 }, { k: 'ladybug', n: 7 }, { k: 'ladybug', n: 0, c: '#f2c94c' }] }];
    const groups = rows.map(g => ({ tag: g && g.tag, label: g && g.label, items: ((g && g.items) || []).filter(it => it && has(it.k)) }));
    const cols = Math.max(1, Math.min(3, p.cols | 0 || 1)), per = Math.max(1, p.per | 0 || 3), GAP = 6;
    const anyTag = groups.some(g => g.tag);
    const maxN = Math.max(1, ...groups.map(g => Math.min(per, g.items.length)));
    const cw = cols === 1 ? Math.min(372, maxN * 72 + (anyTag ? 34 : 0) + 12) : Math.floor((376 - (cols - 1) * GAP) / cols);
    // 묶음 하나의 배치 계산
    const cells = groups.map(g => {
      const tagW = g.tag ? 34 : 0, ax = 6 + tagW, aw = cw - 12 - tagW, n = g.items.length;
      const pl = Math.max(1, Math.min(per, n)), slot = Math.min(72, aw / pl), k = Math.min(1.7, slot / 40);
      const lh = 36 * k + 6, lines = Math.max(1, Math.ceil(n / pl));
      let s = '';
      g.items.forEach((it, i) => {
        const j = Math.floor(i / pl), m = j === lines - 1 ? n - j * pl : pl;
        const x = ax + (aw - m * slot) / 2 + slot * (i - j * pl + 0.5);
        s += cre(it, x, 4 + lh * (j + 0.5), k);
      });
      if (g.tag) s += T(21, 4 + lines * lh / 2, g.tag, { size: 15, weight: 700 });
      if (g.label) s += T(ax + aw / 2, 4 + lines * lh + 11, g.label, { size: 14 });
      return { s, h: 4 + lines * lh + (g.label ? 22 : 0) + 4 };
    });
    let body = '', y = 2;
    for (let r = 0; r * cols < cells.length; r++) {
      const rowCells = cells.slice(r * cols, r * cols + cols), rh = Math.max(...rowCells.map(c => c.h));
      rowCells.forEach((c, i) => {
        const x = 2 + i * (cw + GAP);
        body += box(x, y, cw, rh, { fill: 'url(#g-paper)', stroke: '#b8c2d0', sw: 1.4, r: 8 }) + K.move(x, y, c.s);
      });
      y += rh + GAP;
    }
    return svg(Math.min(cols, cells.length) * (cw + GAP) - GAP + 4, r2(y - GAP + 2), body, '생물을 묶음별로 나타낸 그림');
  };

  // ───────── FIG.regions ─────────
  const ZBG = { forest: 'url(#g-b-forest)', pond: 'url(#g-b-pond)', field: 'url(#g-b-field)', tidal: 'url(#g-b-tidal)' };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function zoneDeco(type, x, y) {
    if (type === 'pond') return L(`M${r2(x - 5)},${r2(y)} q5,-3 10,0`, '#86bfe8', 1.3);
    if (type === 'forest') return L(`M${r2(x - 3)},${r2(y + 2)} l1,-5 M${r2(x)},${r2(y + 2)} l0,-6 M${r2(x + 3)},${r2(y + 2)} l-1,-5`, '#8cc47a', 1.2);
    if (type === 'field') return L(`M${r2(x - 3)},${r2(y + 2)} l1,-5 M${r2(x)},${r2(y + 2)} l0,-6 M${r2(x + 3)},${r2(y + 2)} l-1,-5`, '#c2b65e', 1.2);
    if (type === 'tidal') return L(`M${r2(x - 5)},${r2(y)} q2.5,-2.5 5,0 q2.5,2.5 5,0`, '#a8977b', 1.2);
    return '';
  }
  FIG.regions = p => {
    p = p || {};
    let regions = Array.isArray(p.regions) && p.regions.length ? p.regions : [{ zones: [{ type: 'forest', items: [['tree', 3], ['bird', 2], ['rabbit', 2]] }] }];
    regions = regions.slice(0, 4);
    const n = regions.length, G = 8;
    const pw = n === 1 ? 240 : n === 2 ? 176 : Math.floor((376 - G * (n - 1)) / n);
    const ph = Math.max(100, Math.min(240, +p.h || 210));
    const anyName = regions.some(r => r && r.name);
    let body = '';
    regions.forEach((rg, ri) => {
      rg = rg || {};
      const x0 = 2 + ri * (pw + G), y0 = 2;
      const zones = Array.isArray(rg.zones) && rg.zones.length ? rg.zones : [{ type: 'forest', items: [] }];
      const zh = ph / zones.length;
      zones.forEach((z, zi) => {
        z = z || {};
        const zy = y0 + zi * zh;
        body += `<rect x="${x0}" y="${r2(zy)}" width="${pw}" height="${r2(zh)}" fill="${ZBG[z.type] || 'url(#g-paper)'}"/>`;
        if (zi > 0) body += line2([[x0, zy], [x0 + pw, zy]], INK, 1.5);
        const list = [];
        (z.items || []).forEach(it => {
          if (!it) return;
          const k = Array.isArray(it) ? it[0] : it.k, cnt = Array.isArray(it) ? it[1] : (it.count == null ? 1 : it.count);
          const o = Array.isArray(it) ? (it[2] || {}) : it;
          if (!has(k)) return;
          for (let i = 0; i < Math.max(0, cnt | 0); i++) list.push(Object.assign({}, o, { k }));
        });
        const top = zy + 3 + (z.label ? 20 : 0), ah = zy + zh - 3 - top, aw = pw - 8, N = list.length;
        if (z.label) body += T(x0 + 8, zy + 13, z.label, { size: 14, anchor: 'start' });
        let cols = Math.max(1, Math.floor(aw / 40)), rws = Math.max(1, Math.ceil(N / cols));
        while (ah / rws < 30 && aw / (cols + 1) >= 26) { cols++; rws = Math.max(1, Math.ceil(N / cols)); }
        const cwid = aw / cols, chei = ah / rws, k = Math.min(1, cwid / 40, chei / 38), slots = cols * rws;
        // 바닥 무늬는 칸과 칸 사이 모서리에만 놓아 생물과 겹치지 않게 한다.
        for (let r = 1; r < rws; r++) for (let c = 1; c < cols; c++) if ((r + c) % 2 === 0) body += zoneDeco(z.type, x0 + 4 + c * cwid, top + r * chei);
        let step = Math.max(1, Math.round(slots * 0.38)); while (gcd(step, slots) !== 1) step++;
        const jx = Math.max(0, Math.min(1.5, (cwid - 36 * k) / 4)), jy = Math.max(0, Math.min(1.5, (chei - 36 * k) / 4));
        list.forEach((it, i) => {
          const sl = (i * step + 1) % slots, c = sl % cols, r = Math.floor(sl / cols);
          body += cre(it, x0 + 4 + (c + 0.5) * cwid + ((i * 7) % 5 - 2) * jx, top + (r + 0.5) * chei + ((i * 3) % 5 - 2) * jy, k);
        });
      });
      body += `<rect x="${x0}" y="${y0}" width="${pw}" height="${ph}" fill="none" stroke="${INK}" stroke-width="2"/>`;
      if (rg.name) body += caption(x0 + pw / 2, y0 + ph + 17, rg.name);
    });
    return svg(n * (pw + G) - G + 4, ph + (anyName ? 34 : 4), body, '지역별 생물 분포');
  };

  // ───────── FIG.prep ─────────
  const LIQ = { blue: '#3f6fd8', red: '#c9375a', water: '#a9d6f2' };
  const slide = () => poly([[20, 94], [128, 94], [156, 68], [48, 68]], 'url(#g-glass)');
  const puddle = (c, cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" fill-opacity=".8" stroke="${INK}" stroke-width="1.2"/>`;
  const tweezers = (tx, ty) => poly([[tx, ty], [tx + 50, ty - 46], [tx + 55, ty - 42]], 'url(#g-metal)', { sw: 1.5 }) +
    poly([[tx, ty], [tx + 56, ty - 36], [tx + 59, ty - 30]], 'url(#g-metal)', { sw: 1.5 });
  const SCENE = {
    smear() {
      return slide() + `<ellipse cx="86" cy="81" rx="20" ry="6" fill="#fff" fill-opacity=".6" stroke="${SUB}" stroke-width="1" stroke-dasharray="3 3"/>` +
        line2([[150, 16], [98, 74]], INK, 6) + line2([[150, 16], [98, 74]], '#e8cfa5', 3.2) +
        `<ellipse cx="95" cy="77" rx="7.5" ry="4.8" fill="#fff" stroke="${INK}" stroke-width="1.6" transform="rotate(-48 95 77)"/>` +
        arrow(96, 104, 118, 104, { w: 1.6, color: SUB }) + arrow(84, 104, 62, 104, { w: 1.6, color: SUB });
    },
    drop(lc) {
      return slide() + puddle(lc, 88, 81, 10, 4) + `<ellipse cx="88" cy="14" rx="8" ry="10" fill="#e58a6a" stroke="${INK}" stroke-width="2"/>` +
        `<polygon points="83,22 93,22 93,46 89.5,58 86.5,58 83,46" fill="#fff"/>` +
        `<polygon points="84.5,34 91.5,34 91.5,46 89,56.5 87,56.5 84.5,46" fill="${lc}"/>` +
        poly([[83, 22], [93, 22], [93, 46], [89.5, 58], [86.5, 58], [83, 46]], 'url(#g-glass)', { sw: 1.6 }) +
        `<path d="M88,61 q4.5,6 0,9.5 q-4.5,-3.5 0,-9.5Z" fill="${lc}" stroke="${INK}" stroke-width="1"/>`;
    },
    cover(lc) {
      return slide() + puddle(lc, 92, 82, 13, 5) + `<polygon points="72,90 86,76 118,56 104,70" fill="#fff" fill-opacity=".55"/>` +
        poly([[72, 90], [86, 76], [118, 56], [104, 70]], 'url(#g-glass)', { sw: 1.6 }) + tweezers(111, 63);
    },
    blot(lc) {
      return slide() + `<polygon points="66,90 96,90 112,74 82,74" fill="${lc}" fill-opacity=".4"/>` +
        poly([[66, 90], [96, 90], [112, 74], [82, 74]], 'url(#g-glass)', { sw: 1.6 }) +
        poly([[100, 92], [146, 96], [166, 70], [118, 70]], '#fffdf3', { sw: 1.6 }) +
        `<polygon points="101,91.5 113,92.6 129,71 119,71" fill="${lc}" fill-opacity=".6"/>` +
        line2([[124, 94], [142, 70]], '#d8d2c0', 1.2, { dash: '3 3' });
    },
    leaf(lc) {
      return slide() + puddle(lc, 88, 81, 11, 4.5) +
        `<ellipse cx="96" cy="68" rx="10" ry="3.4" fill="#58b368" stroke="${INK}" stroke-width="1.5" transform="rotate(-40 96 68)"/>` +
        line2([[90, 73], [102, 63]], '#2f8f57', 1) + tweezers(103, 62);
    },
  };
  FIG.prep = p => {
    p = p || {};
    let steps = (Array.isArray(p.steps) ? p.steps : []).filter(s => s && Object.prototype.hasOwnProperty.call(SCENE, s.k)).slice(0, 6);
    if (!steps.length) steps = [{ k: 'smear' }, { k: 'drop' }, { k: 'cover' }, { k: 'blot' }];
    const n = steps.length, cols = n <= 2 ? n : n <= 4 ? 2 : 3, G = 8;
    const pw = cols === 3 ? 120 : 176, k = pw / 176, ph = r2(112 * k);
    let body = '';
    steps.forEach((st, i) => {
      const x = 2 + (i % cols) * (pw + G), y = 2 + Math.floor(i / cols) * (ph + G);
      const lc = LIQ[st.liquid] || LIQ.water;
      body += box(x, y, pw, ph, { fill: 'url(#g-paper)', sw: 1.6, r: 8 }) +
        `<g transform="translate(${x} ${y}) scale(${r2(k)})">${SCENE[st.k](lc)}</g>`;
      if (st.tag) body += T(x + 20, y + 15, st.tag, { size: 15, weight: 700 });
    });
    const rws = Math.ceil(n / cols);
    return svg(cols * (pw + G) - G + 4, r2(rws * (ph + G) - G + 4), body, '현미경표본을 만드는 과정');
  };
})(FIG);

/* ===== common-c.js ===== */
// figs/common-c.js : 여러 레슨이 함께 쓰는 그림 (구성 단계, 분류 단계, 순서도, 글 카드, 막대그래프)
// 모든 그림은 인자가 비어도 기본 그림이 나오고, 모르는 인자는 무시한다. 난수는 쓰지 않는다.
//
// ■ FIG.levels(p) : 생물의 구성 단계를 상자와 화살표로 나타낸다. (폭 380, 높이 92 또는 186)
//   kind  : 'animal'(기본) | 'plant' | 'both'(동물 줄 위, 식물 줄 아래)
//           동물: 세포, 조직, 기관, 기관계, 개체 / 식물: 세포, 조직, 조직계, 기관, 개체
//   mask  : {animal:{2:'A',3:'B'}, plant:{2:'C'}} 처럼 칸 번호(0~4)를 기호로 가린다.
//           한 줄만 그릴 때는 {2:'A'}처럼 줄 이름 없이 써도 된다.
//   label : false면 줄 머리의 '동물', '식물' 글자를 그리지 않는다.
//   예) { kind: 'levels', p: { kind: 'plant', mask: { plant: { 2: 'A' } } } }
//       { kind: 'levels', p: { kind: 'both', mask: { animal: { 2: 'A', 3: 'B' }, plant: { 2: 'C', 3: 'D' } } } }
//
// ■ FIG.taxa(p) : 분류 단계의 포함 관계(겹친 둥근 사각형, 가장 안쪽이 levels[0]). (폭 380, 높이 220 또는 250)
//   levels  : 안쪽부터 바깥쪽 순서의 칸 이름. 기본 ['종','속','과','목','강','문','계']. 최대 8칸.
//             가릴 칸은 '(가)'처럼 바꿔 쓴다. ''이면 이름 없는 칸이 된다.
//   members : [{t:'A', lv:0}, ...] 생물 기호를 "처음 놓이는 가장 좁은 칸"에 놓는다.
//             lv 0은 가장 안쪽 칸 안, lv 1은 둘째 칸 안이면서 첫째 칸 밖(오른쪽 띠). 같은 lv에 3개까지 권장.
//   예) { kind: 'taxa', p: { levels: ['종','속','(가)','목','강','문','(나)'] } }
//       { kind: 'taxa', p: { levels: ['종','속','과','목','강'], members: [{t:'A',lv:0},{t:'B',lv:1},{t:'C',lv:2},{t:'D',lv:3}] } }
//
// ■ FIG.flow(p) : 예, 아니요 순서도. 질문을 위에서 아래로 차례로 놓는다. (폭 380, 질문 4개일 때 높이 250)
//   start : 맨 위 상자 글(기본 '생물'). 길면 자동으로 줄을 나눈다.
//   nodes : [{q, yes, no}] 질문 목록(최대 5개).
//           마지막이 아닌 질문은 yes, no 가운데 하나만 쓴다. 쓴 쪽이 오른쪽 끝 칸이 되고, 다른 쪽이 다음 질문으로 내려간다.
//           마지막 질문은 yes가 왼쪽 끝 칸, no가 오른쪽 끝 칸이 된다.
//           q와 끝 칸 글은 'X', '(가)'처럼 기호로 가릴 수 있다. 질문 글이 길면 상자 안에서 두 줄로 나뉜다.
//   기본값은 5계 분류 순서도(질문 넷)이고 끝 칸 다섯 개는 A~E로 가려져 있다.
//           (첫 질문의 아니요 A, 둘째 질문의 예 B, 셋째 질문의 예 C, 넷째 질문의 예 D, 아니요 E)
//   예) { kind: 'flow', p: {} }
//       { kind: 'flow', p: { start: '소나무, 우산이끼, 송이버섯, 푸른곰팡이, 오징어, 지렁이',
//           nodes: [{ q: '(가)', yes: '소나무, 우산이끼' }, { q: '세포벽이 있는가?', yes: 'X', no: 'Y' }] } }
//
// ■ FIG.cards(p) : 글 카드 여러 장. (폭 380, 높이는 글 양에 따라 정해진다. 280을 넘지 않게 글 양을 조절한다.)
//   cards : [{tag:'(가)', lines:['글 한 줄', ...]}] 최대 6장. 긴 줄은 카드 폭에 맞춰 자동으로 나뉜다.
//   cols  : 1(기본, 위아래로 쌓고 이름은 왼쪽) | 2 | 3(옆으로 놓고 이름은 위쪽)
//   w     : 캔버스 폭(170~380, 기본 380)
//   예) { kind: 'cards', p: { cols: 1, cards: [{ tag: '(가)', lines: ['한 지역에 숲, 습지, 갯벌이 함께 있다.'] }, { tag: '(나)', lines: ['...'] }] } }
//
// ■ FIG.bars(p) : 막대그래프. (w 200 이하면 높이 170, 그보다 크면 높이 230)
//   cats   : 범주 이름 배열(좁으면 띄어쓰기에서 두 줄로 나뉜다)
//   values : 값 배열(0 이상). 0이면 막대를 그리지 않는다.
//   ylabel : 세로축 이름(그래프 왼쪽 위에 가로로 쓴다)
//   ymax   : 세로축 최댓값. 그림 보기 여러 개를 견줄 때는 반드시 같은 값을 준다. 없으면 값에 맞춰 정한다.
//   w      : 폭(150~380, 기본 300). 170이면 그림 보기용으로 눈금 숫자를 줄인다.
//   color  : 막대 색(한 계열일 때)
//   series : [{name, values, color}] 두 계열 이상이면 values 대신 쓴다(최대 4계열, 범례가 붙는다).
//   showValues : true면 막대 위에 값을 쓴다(기본은 쓰지 않는다).
//   예) { kind: 'bars', p: { cats: ['밝은 색','중간 색','어두운 색'], values: [10,12,10], ylabel: '개체 수(마리)', ymax: 35 } }
//       { kind: 'bars', p: { w: 170, cats: ['밝은 색','중간 색','어두운 색'], values: [2,8,22], ymax: 35 } }
//       { kind: 'bars', p: { cats: ['봄','가을'], series: [{ name: 'A 지역', values: [4,6] }, { name: 'B 지역', values: [7,3] }] } }
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<linearGradient id="g-cc-step" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6faff"/><stop offset="1" stop-color="#d7e7fa"/></linearGradient>');
  K.addDefs('<linearGradient id="g-cc-mask" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#ffe7a3"/></linearGradient>');
  const STEP = 'url(#g-cc-step)', MASK = 'url(#g-cc-mask)', PAPER = 'url(#g-paper)';

  // ---------- 글자 폭 어림과 줄 나눔 ----------
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function tw(s, size) {
    let w = 0;
    for (const ch of String(s == null ? '' : s)) {
      const c = ch.charCodeAt(0);
      w += c > 0x2000 ? 1 : ch === ' ' ? 0.3 : /[,.'!:;]/.test(ch) ? 0.3 : /[A-Z]/.test(ch) ? 0.7 : 0.58;
    }
    return w * size;
  }
  function wrap(s, maxW, size) {
    const ws = String(s == null ? '' : s).split(' ').filter(x => x !== '');
    if (!ws.length) return [''];
    const out = []; let cur = ws[0];
    for (let i = 1; i < ws.length; i++) {
      const t = cur + ' ' + ws[i];
      if (tw(t, size) <= maxW) cur = t; else { out.push(cur); cur = ws[i]; }
    }
    out.push(cur);
    if (out.length === 2) { // 두 줄이면 길이가 고르게 나눈다
      let best = null;
      for (let i = 1; i < ws.length; i++) {
        const a = ws.slice(0, i).join(' '), b = ws.slice(i).join(' ');
        const m = Math.max(tw(a, size), tw(b, size));
        if (!best || m < best.m) best = { m, a, b };
      }
      if (best && best.m <= maxW) return [best.a, best.b];
    }
    return out;
  }
  const widest = (lines, size) => Math.max.apply(null, lines.map(l => tw(l, size)));
  const textLines = (x, cy, lines, lh, o) => lines.map((t, i) => T(x, cy + (i - (lines.length - 1) / 2) * lh, esc(t), o)).join('');
  const has = v => v != null && v !== false;

  // ---------- 구성 단계 ----------
  const SEQ = { animal: ['세포', '조직', '기관', '기관계', '개체'], plant: ['세포', '조직', '조직계', '기관', '개체'] };
  const ROWNAME = { animal: '동물', plant: '식물' };
  FIG.levels = p => {
    p = p || {};
    const kinds = p.kind === 'both' ? ['animal', 'plant'] : [p.kind === 'plant' ? 'plant' : 'animal'];
    const mask = p.mask && typeof p.mask === 'object' ? p.mask : {};
    const flat = kinds.length === 1 && mask.animal == null && mask.plant == null;
    const showLabel = p.label !== false;
    const W = 380, BW = 58, BH = 52, GAP = 18, X0 = (W - (5 * BW + 4 * GAP)) / 2, RG = 14;
    let s = '', y = 6;
    kinds.forEach(k => {
      const m = mask[k] && typeof mask[k] === 'object' ? mask[k] : (flat ? mask : {});
      if (showLabel) { s += T(X0, y + 12, ROWNAME[k], { size: 15, weight: 800, anchor: 'start' }); y += 28; }
      SEQ[k].forEach((name, i) => {
        const x = X0 + i * (BW + GAP), hid = has(m[i]), cy = y + BH / 2;
        s += box(x, y, BW, BH, { fill: hid ? MASK : STEP, r: 10 });
        s += hid ? T(x + BW / 2, cy, esc(m[i]), { size: 17, weight: 800, halo: false })
          : T(x + BW / 2, cy, name, { size: 15, weight: 700, halo: false });
        if (i < 4) s += arrow(x + BW + 3, cy, x + BW + GAP - 3, cy, { w: 2, head: 7 });
      });
      y += BH + RG;
    });
    return svg(W, y - RG + 6, s, '생물의 구성 단계');
  };

  // ---------- 분류 단계의 포함 관계 ----------
  FIG.taxa = p => {
    p = p || {};
    const lv = (Array.isArray(p.levels) && p.levels.length ? p.levels : ['종', '속', '과', '목', '강', '문', '계']).slice(0, 8);
    const n = lv.length, W = 380, H = n >= 6 ? 250 : 220, IN = 5;
    const sx = n > 1 ? Math.min(48, (W - 8 - IN * (n - 1) - 104) / (n - 1)) : 0;
    const sy = n > 1 ? Math.min(32, (H - 8 - IN * (n - 1) - 56) / (n - 1)) : 0;
    const band = sy || 28, fs = band < 24 ? 14 : 15;
    const R = i => { const j = n - 1 - i; return { l: 4 + IN * j, t: 4 + sy * j, r: W - 4 - sx * j, b: H - 4 - IN * j }; };
    let s = '';
    const o0 = R(n - 1);
    s += box(o0.l, o0.t, o0.r - o0.l, o0.b - o0.t, { r: 12, sw: 0, stroke: 'none' });
    for (let i = n - 1; i >= 0; i--) {
      const b = R(i);
      s += `<rect x="${r2(b.l)}" y="${r2(b.t)}" width="${r2(b.r - b.l)}" height="${r2(b.b - b.t)}" rx="10" fill="#2f7fe0" fill-opacity=".08" stroke="${INK}" stroke-width="2"/>`;
    }
    for (let i = 0; i < n; i++) {
      const b = R(i);
      if (has(lv[i]) && lv[i] !== '') s += T(b.l + 10, b.t + band / 2, esc(lv[i]), { size: fs, weight: 700, anchor: 'start' });
    }
    const mark = (x, y, t) => {
      const w = tw(t, 14);
      if (w <= 16) return badge(x, y, esc(t));
      return box(x - w / 2 - 6, y - 11, w + 12, 22, { r: 11, sw: 1.6 }) + T(x, y + 0.5, esc(t), { size: 14, weight: 800, halo: false });
    };
    const groups = {};
    (Array.isArray(p.members) ? p.members : []).forEach(m => {
      if (!m || !has(m.t)) return;
      const k = Math.round(+m.lv || 0);
      if (k < 0 || k >= n) return;
      (groups[k] = groups[k] || []).push(String(m.t));
    });
    Object.keys(groups).forEach(key => {
      const k = +key, g = groups[k], b = R(k);
      if (k === 0) {
        const y = (b.t + band + b.b) / 2;
        g.forEach((t, i) => { s += mark(b.l + (b.r - b.l) * (i + 1) / (g.length + 1), y, t); });
      } else {
        const x = b.r - sx / 2, mid = (b.t + b.b) / 2;
        g.forEach((t, i) => { s += mark(x, mid + (i - (g.length - 1) / 2) * 26, t); });
      }
    });
    return svg(W, H, s, '분류 단계의 포함 관계');
  };

  // ---------- 예, 아니요 순서도 ----------
  const FLOW_DEF = [
    { q: '유전물질이 핵막으로 싸여 있는가?', no: 'A' },
    { q: '균계, 식물계, 동물계가 아닌 무리인가?', yes: 'B' },
    { q: '광합성을 하는가?', yes: 'C' },
    { q: '세포벽이 없고 운동성이 있는가?', yes: 'D', no: 'E' },
  ];
  FIG.flow = p => {
    p = p || {};
    let nodes = (Array.isArray(p.nodes) ? p.nodes : []).filter(nd => nd && typeof nd === 'object').slice(0, 5);
    if (!nodes.length) nodes = FLOW_DEF;
    const W = 380, AR = 50, FS = 14, LH = 16, n = nodes.length, M = 3;
    const term = t => {
      const lines = wrap(t, 84, FS);
      return { lines, w: Math.max(36, widest(lines, FS) + 14), h: lines.length * LH + 8, one: lines.length === 1 && tw(lines[0], FS) <= 14 };
    };
    const rows = nodes.map((nd, i) => {
      const row = { q: has(nd.q) ? String(nd.q) : '', L: null, R: null, side: '', down: '' };
      if (i === n - 1) {
        if (has(nd.yes)) row.L = term(nd.yes);
        if (has(nd.no)) { row.R = term(nd.no); row.side = '아니요'; }
      } else if (has(nd.yes)) { row.R = term(nd.yes); row.side = '예'; row.down = '아니요'; }
      else if (has(nd.no)) { row.R = term(nd.no); row.side = '아니요'; row.down = '예'; }
      return row;
    });
    const leftW = Math.max.apply(null, rows.map(r => r.L ? r.L.w : 0));
    const rightW = Math.max.apply(null, rows.map(r => r.R ? r.R.w : 0));
    const qx0 = 4 + (leftW ? leftW + AR : 0), qx1 = W - 4 - (rightW ? rightW + AR : 0);
    const QW = qx1 - qx0, cx = (qx0 + qx1) / 2;
    rows.forEach(r => {
      r.ql = wrap(r.q, QW - 14, FS);
      r.qh = Math.max(28, r.ql.length * LH + 4);
      r.h = Math.max(r.qh, r.L ? r.L.h : 0, r.R ? r.R.h : 0);
    });
    const sl = wrap(has(p.start) ? p.start : '생물', 2 * Math.min(cx - M, W - M - cx) - 24, FS);
    const sw = Math.max(70, widest(sl, FS) + 24), sh = sl.length * LH + 8;
    const gap = n >= 4 ? 19 : 24;
    const tbox = (x, cy, t) => box(x, cy - t.h / 2, t.w, t.h, { fill: MASK, r: 6 }) +
      textLines(x + t.w / 2, cy, t.lines, LH, { size: t.one ? 15 : FS, weight: t.one ? 800 : 600, halo: false });
    let s = '', y = M;
    s += box(cx - sw / 2, y, sw, sh, { fill: PAPER, r: 12 }) + textLines(cx, y + sh / 2, sl, LH, { size: FS, weight: 700, halo: false });
    y += sh;
    rows.forEach((r, i) => {
      s += arrow(cx, y + 1, cx, y + gap - 2, { w: 2, head: 8 });
      if (i > 0 && rows[i - 1].down) s += T(cx + 9, y + gap / 2, rows[i - 1].down, { size: FS, anchor: 'start', haloW: 3 });
      y += gap;
      const cy = y + r.h / 2;
      s += box(qx0, cy - r.qh / 2, QW, r.qh, { fill: STEP, r: 8 }) + textLines(cx, cy, r.ql, LH, { size: FS, weight: 600, halo: false });
      if (r.R) {
        s += arrow(qx1 + 2, cy, qx1 + AR - 2, cy, { w: 2, head: 8 });
        s += T(qx1 + AR / 2, cy - 12, r.side, { size: FS, haloW: 3 });
        s += tbox(qx1 + AR, cy, r.R);
      }
      if (r.L) {
        s += arrow(qx0 - 2, cy, qx0 - AR + 2, cy, { w: 2, head: 8 });
        s += T(qx0 - AR / 2, cy - 12, '예', { size: FS, haloW: 3 });
        s += tbox(qx0 - AR - r.L.w, cy, r.L);
      }
      y += r.h;
    });
    return svg(W, r2(y + M), s, '예, 아니요로 나누는 순서도');
  };

  // ---------- 글 카드 ----------
  FIG.cards = p => {
    p = p || {};
    let cards = (Array.isArray(p.cards) ? p.cards : []).filter(c => c && typeof c === 'object').slice(0, 6);
    if (!cards.length) cards = [{ tag: '(가)', lines: [''] }, { tag: '(나)', lines: [''] }, { tag: '(다)', lines: [''] }];
    const W = Math.max(170, Math.min(380, +p.w || 380));
    const cols = Math.max(1, Math.min(3, Math.round(+p.cols || 1)));
    const G = 8, cw = (W - 8 - (cols - 1) * G) / cols, FS = 14, LH = 19;
    const anyTag = cards.some(c => has(c.tag) && c.tag !== '');
    const tagW = cols === 1 && anyTag ? 50 : 0, tagH = cols > 1 && anyTag ? 30 : 0;
    const maxW = cw - tagW - 20;
    const info = cards.map(c => {
      const src = Array.isArray(c.lines) ? c.lines : (has(c.lines) ? [c.lines] : []);
      const lines = [];
      src.forEach(l => wrap(l, maxW, FS).forEach(x => lines.push(x)));
      if (!lines.length) lines.push('');
      return { tag: has(c.tag) ? String(c.tag) : '', lines, h: Math.max(36, tagH + lines.length * LH + 16) };
    });
    let s = '', y = 4;
    for (let r = 0; r * cols < info.length; r++) {
      const row = info.slice(r * cols, r * cols + cols);
      const h = Math.max.apply(null, row.map(c => c.h));
      row.forEach((c, i) => {
        const x = 4 + i * (cw + G);
        s += box(x, y, cw, h, { fill: PAPER, r: 10 });
        if (cols === 1) {
          if (tagW) {
            s += T(x + tagW / 2 + 1, y + h / 2, esc(c.tag), { size: 15, weight: 800, halo: false });
            s += leader(x + tagW, y + 7, x + tagW, y + h - 7);
          }
          s += textLines(x + tagW + 10, y + h / 2, c.lines, LH, { size: FS, weight: 500, anchor: 'start', halo: false });
        } else {
          if (tagH) {
            s += T(x + cw / 2, y + 16, esc(c.tag), { size: 15, weight: 800, halo: false });
            s += leader(x + 8, y + tagH, x + cw - 8, y + tagH);
          }
          s += textLines(x + cw / 2, y + tagH + (h - tagH) / 2, c.lines, LH, { size: FS, weight: 500, halo: false });
        }
      });
      y += h + G;
    }
    return svg(W, r2(y - G + 4), s, '글 카드');
  };

  // ---------- 막대그래프 ----------
  const PAL = ['#6ea8e8', '#f2a65a', '#6cc08b', '#a895f5'];
  const nice = raw => {
    const pw = Math.pow(10, Math.floor(Math.log10(raw)));
    for (const m of [1, 2, 5, 10]) if (m * pw >= raw - 1e-9) return m * pw;
    return 10 * pw;
  };
  FIG.bars = p => {
    p = p || {};
    const W = Math.max(150, Math.min(380, +p.w || 300)), small = W <= 200, H = small ? 170 : 230;
    const num = a => (Array.isArray(a) ? a : []).map(v => Math.max(0, +v || 0));
    let series = (Array.isArray(p.series) ? p.series : []).filter(o => o && typeof o === 'object').slice(0, 4)
      .map((o, i) => ({ name: has(o.name) ? String(o.name) : '', values: num(o.values), color: o.color || PAL[i] }));
    if (!series.length) series = [{ name: '', values: num(p.values), color: p.color || PAL[0] }];
    let catsIn = Array.isArray(p.cats) ? p.cats : [];
    if (!catsIn.length && !series.some(o => o.values.length)) { catsIn = ['(가)', '(나)', '(다)']; series[0].values = [3, 5, 2]; }
    const nc = Math.max.apply(null, [1, catsIn.length].concat(series.map(o => o.values.length)));
    const cats = Array.from({ length: nc }, (_, i) => has(catsIn[i]) ? String(catsIn[i]) : '');
    const ns = series.length, FS = 14;
    const vmax = Math.max.apply(null, [0].concat(...series.map(o => o.values)));
    const div = small ? 2 : 4;
    let ymax = +p.ymax > 0 ? +p.ymax : 0;
    if (!ymax) { const st = nice((vmax || 10) / div); ymax = Math.ceil((vmax || 10) / st - 1e-9) * st; }
    const step = nice(ymax / div), ticks = [];
    for (let v = 0; v <= ymax + 1e-9; v += step) ticks.push(r2(v));
    const ML = Math.max(24, widest(ticks.map(String), FS) + 12), MR = 8;
    const ylabel = has(p.ylabel) ? String(p.ylabel) : '';
    const legend = ns > 1 ? series.filter(o => o.name) : [];
    const LW = legend.reduce((a, o) => a + 18 + tw(o.name, FS) + 12, 0) - (legend.length ? 12 : 0);
    let top = 10, legY = 0;
    if (ylabel) top = 30;
    if (legend.length) {
      if (ylabel && tw(ylabel, FS) + LW + 16 > W - 8) { legY = 32; top = 50; } else { legY = 12; top = 30; }
    }
    const slot = (W - ML - MR) / nc;
    const catL = cats.map(c => c === '' ? [] : (tw(c, FS) <= slot - 4 ? [c] : wrap(c, slot - 4, FS).slice(0, 2)));
    const nl = Math.max.apply(null, catL.map(l => l.length));
    const MB = nl * 16 + 10, x0 = ML, y0 = H - MB, ph = y0 - top;
    const yv = v => y0 - ph * Math.min(v, ymax) / ymax;
    let s = '';
    if (ylabel) s += T(4, 12, esc(ylabel), { size: FS, weight: 600, anchor: 'start' });
    if (legend.length) {
      let lx = W - 6 - LW;
      legend.forEach(o => {
        s += `<rect x="${r2(lx)}" y="${legY - 6}" width="12" height="12" fill="${o.color}" stroke="${INK}" stroke-width="1.5"/>`;
        s += T(lx + 17, legY, esc(o.name), { size: FS, weight: 600, anchor: 'start' });
        lx += 18 + tw(o.name, FS) + 12;
      });
    }
    ticks.forEach(v => {
      const y = yv(v);
      if (v > 0) s += `<line x1="${r2(x0)}" y1="${r2(y)}" x2="${r2(W - MR)}" y2="${r2(y)}" stroke="#d8dee8" stroke-width="1"/>`;
      s += T(x0 - 6, y, String(v), { size: FS, weight: 500, anchor: 'end' });
    });
    const gw = slot * (ns > 1 ? 0.72 : 0.5), bw = gw / ns;
    for (let i = 0; i < nc; i++) {
      series.forEach((o, k) => {
        const v = o.values[i] || 0;
        if (v <= 0) return;
        const x = x0 + slot * i + (slot - gw) / 2 + k * bw, y = yv(v), h = y0 - y;
        s += `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(bw)}" height="${r2(h)}" fill="${o.color}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
        if (h > 8) s += `<rect x="${r2(x + 3)}" y="${r2(y + 3)}" width="${r2(bw * 0.28)}" height="${r2(h - 4)}" fill="#fff" opacity=".3"/>`;
        if (p.showValues) s += T(x + bw / 2, y - 9, String(r2(v)), { size: FS, weight: 700 });
      });
      catL[i].forEach((t, j) => { s += T(x0 + slot * (i + 0.5), y0 + 13 + j * 16, esc(t), { size: FS, weight: 600 }); });
    }
    s += line2([[x0, top - 5], [x0, y0], [W - MR + 2, y0]], INK, 2);
    return svg(W, H, s, '막대그래프');
  };
})(FIG);

/* ====================== 레슨 1 세포, 생명의 기본 단위 ====================== */
// 레슨 1 그림. tools/build.cjs가 src-figs/l1/의 00-pilot.js, 10-a.js, 20-b.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l1.js : 레슨 1 전용 그림
//
// ■ FIG.l1_onion(p) : 양파 표피세포를 현미경으로 본 둥근 관찰 화면
//   공용 FIG.scope(kind 'onion')와 세포 배치가 같다. 다른 점은 세포를 둥근 화면의 바깥 사각형 안에서만 그린다는 것이다
//   (공용 그림은 캔버스 가장자리까지 그린 뒤 흰색으로 덮어서, 폰 크기로 줄이면 캔버스 좌우 끝에 흐린 점선이 비친다).
//   w    : 판의 폭. 170(그림 보기용) 또는 300(기본)
//   hl   : 붉은 표시. 'cell'(가운데 세포 하나) | 'nucleus'(칸 안의 둥근 것 하나) | 'row'(세포 둘을 한꺼번에)
//          | 'wall'(경계선 한 부분) | 'all'(화면 전체)
//   mark : 가운데 세포에 붙일 기호(1~2글자). 쓰면 w는 300 이상
//   예) FIG.l1_onion({w:170, hl:'cell'})
//       FIG.l1_onion({w:300, mark:'A'})
//
// ■ FIG.l1_views(p) : 현미경 관찰 화면 두 판(폭 176씩)을 나란히 놓는다. (폭 360, 높이 196)
//   panels : [{kind, cap}] 최대 2판. 기본은 [{kind:'one', cap:'(가)'}, {kind:'onion', cap:'(나)'}]
//     kind 'one'   : 몸 전체가 세포 하나인 생물 한 마리(길쭉한 몸, 둘레의 짧은 털, 가운데 둥근 핵). 안쪽에 칸을 나누는 선이 없다.
//          'onion' : 경계선으로 나뉜 세포 여러 개(l1_onion과 같은 그림)
//     cap  판 아래 이름
//   예) FIG.l1_views({panels:[{kind:'one', cap:'(가)'}, {kind:'onion', cap:'(나)'}]})
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, RED, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  const hash = (i, j) => { const v = Math.sin(i * 12.9898 + j * 78.233 + 1.7) * 43758.5453; return v - Math.floor(v); };

  K.addDefs('<radialGradient id="g-l1-one" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#f6fcf3"/><stop offset="1" stop-color="#cfe6cf"/></radialGradient>');

  const nucAt = (x, y, r) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="#d9d3c3" stroke="#9a917d" stroke-width="1.3"/>` +
    `<circle cx="${r2(x + r * 0.2)}" cy="${r2(y - r * 0.15)}" r="${r2(r * 0.32)}" fill="#b5ac96"/>`;

  // 양파 표피세포 화면 한 판
  function onionPanel(p, W) {
    const mark = p.mark != null && p.mark !== '' ? String(p.mark) : '';
    const side = mark ? 40 : 6, R = Math.min((W - 2 * side) / 2, 100), cx = W / 2, cy = R + 4, s = R / 100;
    const L = 80 * s, Hc = 30 * s, amp = 5 * s, nR = 6 * s, H = 2 * R + 8;
    const FILL = '#f8f3e2', WALL = '#7d7358';
    const off = i => ((((i % 2) + 2) % 2) ? 0.5 : 0) * L + ((i === 0 || i === 1) ? 0 : (hash(i, 7) - 0.5) * 0.24 * L);
    const bx = (i, j) => cx - L / 2 + off(i) + j * L, dd = (i, j) => (hash(i, j) - 0.5) * 2 * amp;
    const cellPts = (i, j) => {
      const y0 = cy + (i - 0.5) * Hc, y1 = y0 + Hc;
      return [[bx(i, j) + dd(i, j), y0], [bx(i, j + 1) + dd(i, j + 1), y0], [bx(i, j + 1) - dd(i, j + 1), y1], [bx(i, j) - dd(i, j), y1]];
    };

    // 둥근 화면 안쪽(바깥 사각형으로 잘라 그린다)
    let g = `<rect x="${r2(cx - R)}" y="${r2(cy - R)}" width="${r2(2 * R)}" height="${r2(2 * R)}" fill="${FILL}"/>`;
    const nr = Math.ceil(R / Hc) + 1, ncol = Math.ceil(R / L) + 2;
    for (let i = -nr; i <= nr; i++) for (let j = -ncol; j <= ncol; j++) {
      const mid = i === 0 && j === 0, x0 = bx(i, j), y0 = cy + (i - 0.5) * Hc;
      if (x0 > cx + R + L || x0 + L < cx - R - L) continue;
      g += poly(cellPts(i, j), FILL, { stroke: WALL, sw: 2 });
      const fx = mid ? 0.6 : 0.3 + 0.4 * hash(i + 11, j), fy = mid ? 0.5 : 0.4 + 0.2 * hash(i, j + 11);
      g += nucAt(x0 + fx * L, y0 + fy * Hc, nR);
    }
    const x00 = bx(0, 0), c0 = cellPts(0, 0);
    if (p.hl === 'cell') g += poly(c0, 'none', { stroke: RED, sw: 3.4 });
    if (p.hl === 'row') { const c1 = cellPts(1, -1), c2 = cellPts(1, 0); g += poly([c1[0], c2[1], c2[2], c1[3]], 'none', { stroke: RED, sw: 3.4 }); }
    if (p.hl === 'wall') g += line2([c0[0], c0[1]], RED, 4.6);
    if (p.hl === 'nucleus') g += `<circle cx="${r2(x00 + 0.6 * L)}" cy="${r2(cy)}" r="${r2(nR + 4.5 * s)}" fill="none" stroke="${RED}" stroke-width="3"/>`;

    let body = `<svg x="${r2(cx - R)}" y="${r2(cy - R)}" width="${r2(2 * R)}" height="${r2(2 * R)}" viewBox="${r2(cx - R)} ${r2(cy - R)} ${r2(2 * R)} ${r2(2 * R)}">${g}</svg>`;
    // 사각형과 원 사이의 네 귀퉁이를 흰색으로 덮고 테두리를 그린다
    body += `<path d="M${r2(cx - R - 2)},${r2(cy - R - 2)}h${r2(2 * R + 4)}v${r2(2 * R + 4)}h${r2(-2 * R - 4)}Z M${r2(cx - R)},${r2(cy)}a${R},${R} 0 1,0 ${2 * R},0a${R},${R} 0 1,0 ${-2 * R},0Z" fill="#fff" fill-rule="evenodd"/>`;
    body += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${R}" fill="none" stroke="${INK}" stroke-width="3"/>`;
    if (p.hl === 'all') body += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R - 6)}" fill="none" stroke="${RED}" stroke-width="3.4"/>`;

    if (mark) {
      const ax = cx - R - 22, ay = cy - 0.45 * R, tx = x00 + 0.22 * L, ty = cy;
      const d = Math.hypot(tx - ax, ty - ay) || 1, k = 11.5 / d;
      body += leader(ax + (tx - ax) * k, ay + (ty - ay) * k, tx, ty) + `<circle cx="${r2(tx)}" cy="${r2(ty)}" r="2.2" fill="${SUB}"/>` + badge(ax, ay, mark);
    }
    return { w: W, h: r2(H), body };
  }

  FIG.l1_onion = p => {
    p = p || {};
    const W = Math.max(120, Math.min(380, +p.w || 300));
    const o = onionPanel(p, W);
    return svg(o.w, o.h, o.body, '양파 표피세포를 현미경으로 관찰한 모습');
  };

  // 몸 전체가 세포 하나인 생물 한 마리가 보이는 화면 한 판
  function onePanel(W) {
    const R = Math.min((W - 12) / 2, 100), cx = W / 2, cy = R + 4, s = R / 100;
    const a = 52 * s, b = 20 * s, rot = -25 * Math.PI / 180, co = Math.cos(rot), si = Math.sin(rot);
    const loc = (x, y) => [cx + x * co - y * si, cy + x * si + y * co];
    const at = t => loc(a * Math.cos(t), b * Math.sin(t) * (1 + 0.28 * Math.cos(t)));
    let body = `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${R}" fill="#eef6f8"/>`;
    // 몸 둘레의 짧은 털
    const N = 40;
    for (let k = 0; k < N; k++) {
      const t = k / N * 2 * Math.PI, p0 = at(t), p1 = at(t + 0.02);
      let tx = p1[0] - p0[0], ty = p1[1] - p0[1]; const d = Math.hypot(tx, ty) || 1; tx /= d; ty /= d;
      let nx = ty, ny = -tx; if (nx * (p0[0] - cx) + ny * (p0[1] - cy) < 0) { nx = -nx; ny = -ny; }
      body += line2([p0, [p0[0] + nx * 5.5 * s + tx * 2 * s, p0[1] + ny * 5.5 * s + ty * 2 * s]], '#6b8f80', 1.1);
    }
    // 몸(경계선 하나로 둘러싸여 있고, 안쪽에 칸을 나누는 선이 없다)
    const pts = []; for (let k = 0; k < 60; k++) pts.push(at(k / 60 * 2 * Math.PI));
    body += poly(pts, 'url(#g-l1-one)', { stroke: '#4f7a6a', sw: 2 });
    [[-0.55, 0.1], [-0.3, -0.35], [0.15, 0.6], [0.35, -0.3], [0.6, 0.2], [0.7, -0.15], [-0.7, -0.2], [0.45, 0.5], [-0.1, -0.5]].forEach(q => {
      const c = loc(q[0] * a, q[1] * b);
      body += `<circle cx="${r2(c[0])}" cy="${r2(c[1])}" r="${r2(Math.max(1, 1.3 * s))}" fill="#9dbfa6"/>`;
    });
    const n0 = loc(0.05 * a, 0);
    body += nucAt(n0[0], n0[1], 7 * s);
    body += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${R}" fill="none" stroke="${INK}" stroke-width="3"/>`;
    return { w: W, h: r2(2 * R + 8), body };
  }

  FIG.l1_views = p => {
    p = p || {};
    const list = (Array.isArray(p.panels) && p.panels.length ? p.panels : [{ kind: 'one', cap: '(가)' }, { kind: 'onion', cap: '(나)' }]).slice(0, 2);
    const PW = 176, G = 8;
    let s = '', h = 0;
    list.forEach((q, i) => {
      q = q || {};
      const o = q.kind === 'onion' ? onionPanel({}, PW) : onePanel(PW);
      let b = o.body;
      if (q.cap) b += caption(PW / 2, o.h + 10, String(q.cap));
      s += K.move(i * (PW + G), 0, b);
      h = Math.max(h, o.h + (q.cap ? 24 : 0));
    });
    return svg(list.length * (PW + G) - G, r2(h), s, '두 생물을 현미경으로 관찰한 모습');
  };
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<radialGradient id="g-l1a-body" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#f7fcf2"/><stop offset="1" stop-color="#c9e3c6"/></radialGradient>');
  const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  const dot = (x, y) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="2.2" fill="${SUB}"/>`;

  // ■ FIG.l1a_blocks(p) : 작은 블록을 끼워 만든 모형
  //   kind   : 'flower'(기본. 블록 여러 개로 만든 모형 꽃) | 'single'(블록 하나만으로 된 모형)
  //   marks  : {block:'A', whole:'B'} block은 블록 하나에 지시선, whole은 모형 전체를 묶는 괄호. 쓰면 w는 300
  //   w      : 판의 폭(기본 300). cap : 판 아래 이름
  //   panels : [{kind, cap}] 두 판을 폭 176씩 나란히 놓는다(기호 없이 쓴다)
  //   예) FIG.l1a_blocks({w:300, marks:{block:'A', whole:'B'}})
  //       FIG.l1a_blocks({panels:[{kind:'flower', cap:'(가)'}, {kind:'single', cap:'(나)'}]})
  const BC = { r: ['#f58aa0', '#c94c66'], y: ['#f7d154', '#c79a1a'], g: ['#7cc76a', '#3f8f3d'], b: ['#c99a62', '#8a5a2b'], u: ['#7fb2ee', '#2f6fc2'] };
  const FLOWER = [[1, 0, 'r'], [2, 0, 'r'], [3, 0, 'r'], [0, 1, 'r'], [1, 1, 'r'], [2, 1, 'y'], [3, 1, 'r'], [4, 1, 'r'], [1, 2, 'r'], [2, 2, 'r'], [3, 2, 'r'],
    [2, 3, 'g'], [2, 4, 'g'], [3, 4, 'g'], [4, 4, 'g'], [0, 5, 'g'], [1, 5, 'g'], [2, 5, 'g'], [2, 6, 'g'], [2, 7, 'g'], [1, 8, 'b'], [2, 8, 'b'], [3, 8, 'b']];
  function blockPanel(q, pw) {
    q = obj(q);
    const marks = obj(q.marks), mA = marks.block ? String(marks.block) : '', mB = marks.whole ? String(marks.whole) : '';
    const list = q.kind === 'single' ? [[2, 4, 'u']] : FLOWER;
    const bw = (mA || mB) ? Math.min(32, (pw - 140) / 5) : Math.min(26, (pw - 30) / 5), bh = bw * 0.7, sh = bh * 0.24;
    const gx = pw / 2 - 2.5 * bw, top = 10 + sh;
    const at = (c, r) => list.some(b => b[0] === c && b[1] === r);
    let s = '';
    list.forEach(b => {
      const x = gx + b[0] * bw, y = top + b[1] * bh, c = BC[b[2]];
      if (!at(b[0], b[1] - 1)) [0.14, 0.6].forEach(f => { s += `<rect x="${r2(x + bw * f)}" y="${r2(y - sh)}" width="${r2(bw * 0.26)}" height="${r2(sh + 2)}" rx="1.5" fill="${c[0]}" stroke="${INK}" stroke-width="1.6"/>`; });
      s += `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(bw)}" height="${r2(bh)}" rx="2.5" fill="${c[0]}" stroke="${INK}" stroke-width="2"/>` +
        `<rect x="${r2(x + 3)}" y="${r2(y + bh - 5.5)}" width="${r2(bw - 6)}" height="2.6" fill="${c[1]}" opacity=".55"/>` +
        `<rect x="${r2(x + 3)}" y="${r2(y + 3)}" width="${r2(bw * 0.3)}" height="2.2" fill="#fff" opacity=".6"/>`;
    });
    const rmin = Math.min(...list.map(b => b[1])), rmax = Math.max(...list.map(b => b[1]));
    if (mA) {
      const t = q.kind === 'single' ? [2, 4] : [0, 5], tx = gx + (t[0] + 0.5) * bw, ty = top + (t[1] + 0.5) * bh, ax = gx - 36;
      s += leader(ax + 11.5, ty, tx, ty) + dot(tx, ty) + badge(ax, ty, mA);
    }
    if (mB) {
      const x = gx + 5 * bw + 12, y1 = top + rmin * bh - sh, y2 = top + (rmax + 1) * bh, ym = (y1 + y2) / 2;
      s += line2([[x - 7, y1], [x, y1], [x, y2], [x - 7, y2]], SUB, 1.8) + leader(x, ym, x + 12, ym) + badge(x + 23, ym, mB);
    }
    let h = top + 9 * bh + 8;
    if (q.cap) { s += caption(pw / 2, h + 10, String(q.cap)); h += 24; }
    return { w: pw, h: r2(h), body: s };
  }
  FIG.l1a_blocks = p => {
    p = p || {};
    if (Array.isArray(p.panels) && p.panels.length) {
      const row = K.rowOf(p.panels.slice(0, 2).map(q => blockPanel(Object.assign({}, q, { marks: null }), 176)), 8);
      return svg(row.w, row.h, row.body, '블록으로 만든 모형');
    }
    const o = blockPanel(p, Math.max(170, Math.min(380, +p.w || 300)));
    return svg(o.w, o.h, o.body, '블록으로 만든 모형');
  };

  // ■ FIG.l1a_naked(p) : 같은 양파 표피 조각을 맨눈으로 본 모습(왼쪽)과 현미경으로 본 모습(오른쪽) (폭 360, 높이 196)
  //   왼쪽은 핀셋으로 든 얇고 매끈한 반투명 조각(칸 구분 없음), 오른쪽은 FIG.l1_onion과 같은 화면이다.
  //   caps : 판 아래 이름 두 개(기본 ['(가)', '(나)'])
  //   예) FIG.l1a_naked({caps:['(가)', '(나)']})
  FIG.l1a_naked = p => {
    p = p || {};
    const caps = Array.isArray(p.caps) ? p.caps : ['(가)', '(나)'], PW = 176;
    let a = box(4, 4, 168, 164, { fill: 'url(#g-paper)', sw: 1.6, r: 10 });
    // 양파 비늘잎 한 조각
    a += `<path d="M22,150 Q88,84 154,150 Q88,118 22,150Z" fill="#fbf4e0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M40,141 Q88,100 136,141" fill="none" stroke="#d9cba6" stroke-width="1.3"/>`;
    // 핀셋으로 든 얇은 표피 조각(칸이 구분되어 보이지 않는다)
    a += `<path d="M50,58 Q76,46 104,54 Q110,78 106,98 Q80,108 52,100 Q46,78 50,58Z" fill="#efe4c4" fill-opacity=".72" stroke="#8a7b55" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M60,66 Q74,60 88,62" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>` +
      `<path d="M62,92 Q72,95 82,94" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
    a += poly([[100, 58], [150, 14], [155, 19]], 'url(#g-metal)', { sw: 1.5 }) + poly([[100, 58], [156, 25], [159, 31]], 'url(#g-metal)', { sw: 1.5 });
    if (caps[0]) a += caption(PW / 2, 184, String(caps[0]));
    let b = (FIG.l1_onion ? FIG.l1_onion({ w: PW }) : FIG.scope({ kind: 'onion', w: PW }));
    if (caps[1]) b += caption(PW / 2, 184, String(caps[1]));
    return svg(2 * PW + 8, 196, a + K.move(PW + 8, 0, b), '양파 표피 조각을 맨눈과 현미경으로 본 모습');
  };

  // ■ FIG.l1a_drop(p) : 물 한 방울을 현미경으로 본 둥근 화면 속의 둥근 생물
  //   n      : 둥근 몸의 개수 1~4(기본 4). 서로 떨어져 놓인다.
  //   split  : 몸 하나의 안쪽을 나눈 칸 수(0이면 나누지 않음, 2~6)
  //   joined : true면 큰 몸 하나를 그리고 안쪽을 n칸으로 나눈다(세포 n개가 붙은 한 몸)
  //   w      : 판의 폭(그림 보기용 170, 기본 300)
  //   panels : [{n, split, joined, cap}] 두 판을 폭 176씩 나란히 놓는다
  //   예) FIG.l1a_drop({w:170, n:4})  FIG.l1a_drop({w:170, n:4, split:4})  FIG.l1a_drop({w:170, n:4, joined:true})
  //       FIG.l1a_drop({panels:[{n:4, cap:'(가)'}, {n:4, joined:true, cap:'(나)'}]})
  const POS = [[-0.42, -0.38], [0.45, -0.3], [-0.3, 0.45], [0.42, 0.42]];
  const GR = [[-0.5, 0.3], [0.45, 0.4], [0.5, -0.35], [-0.35, -0.5], [0.05, 0.62]];
  const nuc = (x, y, r) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="#d9d3c3" stroke="#9a917d" stroke-width="1.3"/>` +
    `<circle cx="${r2(x + r * 0.2)}" cy="${r2(y - r * 0.15)}" r="${r2(r * 0.34)}" fill="#b5ac96"/>`;
  function dropPanel(q, W) {
    q = obj(q);
    const R = Math.min((W - 12) / 2, 100), cx = W / 2, cy = R + 4;
    const n = Math.max(1, Math.min(4, Math.round(+q.n || 4))), k = Math.max(0, Math.min(6, Math.round(+q.split || 0)));
    const one = (x, y, r, parts, rot) => {
      let b = `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="url(#g-l1a-body)" stroke="#4f7a6a" stroke-width="2"/>`;
      if (parts >= 2) {
        for (let i = 0; i < parts; i++) {
          const a = rot + i * 2 * Math.PI / parts, m = a + Math.PI / parts;
          b += line2([[x, y], [x + r * Math.cos(a), y + r * Math.sin(a)]], '#4f7a6a', 1.8);
          b += nuc(x + 0.56 * r * Math.cos(m), y + 0.56 * r * Math.sin(m), Math.max(2.4, r * 0.15));
        }
      } else {
        GR.forEach(g => { b += `<circle cx="${r2(x + g[0] * r)}" cy="${r2(y + g[1] * r)}" r="${r2(Math.max(1, r * 0.06))}" fill="#9dbfa6"/>`; });
        b += nuc(x + 0.08 * r, y - 0.05 * r, r * 0.24);
      }
      return b;
    };
    let s = `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${R}" fill="#eef6f8"/>`;
    if (q.joined) s += one(cx, cy, 0.52 * R, Math.max(2, n), 0.5);
    else (n === 1 ? [[0, 0]] : POS.slice(0, n)).forEach((c, i) => { s += one(cx + c[0] * R, cy + c[1] * R, 0.24 * R, k, 0.4 + i); });
    s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${R}" fill="none" stroke="${INK}" stroke-width="3"/>`;
    let h = 2 * R + 8;
    if (q.cap) { s += caption(cx, h + 10, String(q.cap)); h += 24; }
    return { w: W, h: r2(h), body: s };
  }
  FIG.l1a_drop = p => {
    p = p || {};
    if (Array.isArray(p.panels) && p.panels.length) {
      const row = K.rowOf(p.panels.slice(0, 2).map(q => dropPanel(q, 176)), 8);
      return svg(row.w, row.h, row.body, '물 한 방울을 현미경으로 관찰한 모습');
    }
    const o = dropPanel(p, Math.max(120, Math.min(380, +p.w || 300)));
    return svg(o.w, o.h, o.body, '물 한 방울을 현미경으로 관찰한 모습');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 번호 11~16은 공용 그림(FIG.scope)과 이미 있는 레슨 그림(FIG.l1a_drop, FIG.l1a_blocks)의 인자만 바꿔 쓴다. 새 그림은 없다.
})(FIG);

/* ====================== 레슨 2 세포의 구조 ====================== */
// 레슨 2 그림. tools/build.cjs가 src-figs/l2/의 00-pilot.js, 10-a.js, 20-b.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l2.js : 레슨 2 전용 그림
//
// ■ FIG.l2_two(p) : 동물세포와 식물세포 두 판을 나란히 놓은 단면(폭 360, 높이 136). 공용 FIG.cell과 같은 화풍.
//   공용 그림과 달리 구조마다 기호 배지 자리와 지시선 끝점을 따로 정해 두어,
//   지시선이 다른 구조 위를 지나거나 서로 엇갈리지 않는다.
//   panels : [{kind:'animal'|'plant', cap:'(가)', marks:{membrane, nucleus, mito, chloro, wall}}] 두 판(폭 176씩)
//            marks 값은 기호 1~2글자. 동물세포의 chloro, wall은 무시한다.
//   기본값은 동물세포(가), 식물세포(나)이고 기호는 없다.
//   예) FIG.l2_two({panels:[{kind:'animal', cap:'(가)', marks:{nucleus:'A', membrane:'B'}},
//                           {kind:'plant', cap:'(나)', marks:{wall:'C', mito:'D', chloro:'E'}}]})
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<radialGradient id="g-l2-cytoA" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#fbdcc2"/></radialGradient>');
  K.addDefs('<radialGradient id="g-l2-cytoP" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#fbfdee"/><stop offset="1" stop-color="#e3f0c2"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l2-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd88e"/><stop offset="1" stop-color="#8db45a"/></linearGradient>');
  K.addDefs('<radialGradient id="g-l2-nuc" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#efe0fb"/><stop offset="1" stop-color="#b18fdc"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l2-mito" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0b5"/><stop offset="1" stop-color="#f09a4c"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l2-chl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e07f"/><stop offset="1" stop-color="#3f9e48"/></linearGradient>');

  // 한 판의 치수: 폭 176, 세포 중심 (88, 56), 반폭 58, 반높이 45
  const PW = 176, CX = 88, CY = 56, A = 58, B = 45, U = 0.58, BL = 14, BR = 162;
  const OCT = [[-0.82, -1], [0.82, -1], [1, -0.7], [1, 0.7], [0.82, 1], [-0.82, 1], [-1, 0.7], [-1, -0.7]];
  const blob = pts => {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s0 = mid(pts[n - 1], pts[0]);
    let d = `M${r2(s0[0])},${r2(s0[1])}`;
    for (let i = 0; i < n; i++) { const q = mid(pts[i], pts[(i + 1) % n]); d += ` Q${r2(pts[i][0])},${r2(pts[i][1])} ${r2(q[0])},${r2(q[1])}`; }
    return d + 'Z';
  };
  const dot = (x, y) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="2.2" fill="${SUB}"/>`;
  function tag(bx, by, tx, ty, s) {
    const d = Math.hypot(tx - bx, ty - by) || 1, k = 11.5 / d;
    return leader(bx + (tx - bx) * k, by + (ty - by) * k, tx, ty) + dot(tx, ty) + badge(bx, by, String(s));
  }
  // 세포 속 구조
  const mito = c => {
    const zig = [];
    for (let k = 0; k < 8; k++) zig.push([(-11 + k * 22 / 7) * U, (k % 2 ? 1 : -1) * 3.6 * U]);
    return `<g transform="translate(${c[0]} ${c[1]}) rotate(${c[2]})"><ellipse rx="${r2(16 * U)}" ry="${r2(7.5 * U)}" fill="url(#g-l2-mito)" stroke="${INK}" stroke-width="1.8"/>${line2(zig, '#b4531a', 1.3)}</g>`;
  };
  const chl = c => {
    let st = '';
    [-8, -2.7, 2.7, 8].forEach(dx => { const h = 8.5 * U * Math.sqrt(1 - (dx / 15) * (dx / 15)) * 0.72; st += line2([[dx * U, -h], [dx * U, h]], '#1d6b31', 1.5); });
    return `<g transform="translate(${c[0]} ${c[1]}) rotate(${c[2]})"><ellipse rx="${r2(15 * U)}" ry="${r2(8.5 * U)}" fill="url(#g-l2-chl)" stroke="${INK}" stroke-width="1.8"/>${st}</g>`;
  };
  const nucleus = (x, y, r) => {
    let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g-l2-nuc)" stroke="${INK}" stroke-width="2"/>` +
      `<circle cx="${r2(x + r * 0.22)}" cy="${r2(y - r * 0.18)}" r="${r2(r * 0.33)}" fill="#6b46b0"/>`;
    [[-0.5, -0.4], [-0.1, 0.55], [0.5, 0.4], [-0.55, 0.2]].forEach(d => { s += `<circle cx="${r2(x + d[0] * r)}" cy="${r2(y + d[1] * r)}" r="1.2" fill="#8f6fc8"/>`; });
    return s;
  };
  // 동물세포의 세포막(굴곡이 있는 닫힌 곡선)
  const mp = t => { const f = 0.93 * (1 + 0.04 * Math.sin(3 * t + 0.5) + 0.03 * Math.sin(5 * t + 1.2)); return [CX + A * f * Math.cos(t), CY + B * f * Math.sin(t)]; };
  const ring = d => OCT.map(c => [CX + c[0] * (A - d), CY + c[1] * (B - d)]);

  function panel(q) {
    q = q && typeof q === 'object' ? q : {};
    const plant = q.kind === 'plant', marks = q.marks && typeof q.marks === 'object' ? q.marks : {};
    const on = k => marks[k] != null && marks[k] !== '';
    let s = '';
    if (plant) {
      s += poly(ring(0), 'url(#g-l2-wall)') + poly(ring(5.2), '#fdfef6', { sw: 1.4 }) + poly(ring(7.3), 'url(#g-l2-cytoP)', { stroke: '#c2571a', sw: 1.8 });
      [[90, 29, 8], [118, 77, -12], [57, 79, 15], [87, 83, -6]].forEach(c => { s += chl(c); });
      [[117, 35, -22], [93, 58, -20]].forEach(c => { s += mito(c); });
      s += nucleus(66, 47, 13.5);
      // 배지 자리와 끝점(지시선이 다른 구조를 지나지 않게 정해 둔 값)
      if (on('nucleus')) s += tag(BL, 34, 60, 44, marks.nucleus);
      if (on('wall')) s += tag(BL, 60, CX - A + 2.7, 62, marks.wall);
      if (on('mito')) s += tag(BR, 30, 117, 35, marks.mito);
      if (on('membrane')) s += tag(BR, 56, CX + A - 7.3, 56, marks.membrane);
      if (on('chloro')) s += tag(BR, 80, 118, 77, marks.chloro);
    } else {
      const pts = []; for (let k = 0; k < 24; k++) pts.push(mp(k / 24 * 2 * Math.PI));
      s += `<path d="${blob(pts)}" fill="url(#g-l2-cytoA)" stroke="${INK}" stroke-width="2"/>`;
      [[117, 39, -25], [114, 75, 30], [62, 74, -20]].forEach(c => { s += mito(c); });
      s += nucleus(81, 54, 15.5);
      if (on('nucleus')) s += tag(BL, 48, 74, 55, marks.nucleus);
      if (on('mito')) s += tag(BR, 30, 117, 39, marks.mito);
      if (on('membrane')) { const m = mp(0.12); s += tag(BR, r2(m[1] + 7), r2(m[0]), r2(m[1]), marks.membrane); }
    }
    let h = CY + B + 8;
    if (q.cap) { s += caption(CX, h + 12, String(q.cap)); h += 27; }
    return { w: PW, h, body: s };
  }

  FIG.l2_two = p => {
    p = p || {};
    let list = Array.isArray(p.panels) && p.panels.length ? p.panels.slice(0, 2) : [{ kind: 'animal', cap: '(가)' }, { kind: 'plant', cap: '(나)' }];
    const row = K.rowOf(list.map(panel), 8);
    return svg(row.w, row.h, row.body, '동물세포와 식물세포의 단면');
  };
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<radialGradient id="g-l2a-cyto" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#fbfdee"/><stop offset="1" stop-color="#e3f0c2"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l2a-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bcd88e"/><stop offset="1" stop-color="#8db45a"/></linearGradient>');
  K.addDefs('<radialGradient id="g-l2a-nuc" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#efe0fb"/><stop offset="1" stop-color="#b18fdc"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l2a-mito" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0b5"/><stop offset="1" stop-color="#f09a4c"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l2a-chl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e07f"/><stop offset="1" stop-color="#3f9e48"/></linearGradient>');

  // 마이토콘드리아(안쪽 주름), 엽록체(줄무늬). u는 크기 배율
  const mito = (x, y, rot, u) => {
    const zig = [];
    for (let k = 0; k < 8; k++) zig.push([(-11 + k * 22 / 7) * u, (k % 2 ? 1 : -1) * 3.6 * u]);
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="${r2(16 * u)}" ry="${r2(7.5 * u)}" fill="url(#g-l2a-mito)" stroke="${INK}" stroke-width="1.8"/>${line2(zig, '#b4531a', 1.3)}</g>`;
  };
  const chl = (x, y, rot, u) => {
    let st = '';
    [-8, -2.7, 2.7, 8].forEach(dx => { const h = 8.5 * u * Math.sqrt(1 - (dx / 15) * (dx / 15)) * 0.72; st += line2([[dx * u, -h], [dx * u, h]], '#1d6b31', 1.5); });
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="${r2(15 * u)}" ry="${r2(8.5 * u)}" fill="url(#g-l2a-chl)" stroke="${INK}" stroke-width="1.8"/>${st}</g>`;
  };
  const tag = (bx, by, tx, ty, s) => {
    const d = Math.hypot(tx - bx, ty - by) || 1, k = 11.5 / d;
    return leader(bx + (tx - bx) * k, by + (ty - by) * k, tx, ty) + `<circle cx="${r2(tx)}" cy="${r2(ty)}" r="2.2" fill="${SUB}"/>` + badge(bx, by, String(s));
  };

  // ■ FIG.l2a_pick(p) : 식물세포 단면에서 구조 하나에만 기호를 붙인 그림 보기용 그림(폭 170, 높이 108)
  //   mark : 'mito'(기본) | 'chloro' | 'nucleus' | 'membrane' | 'wall'  기호를 붙일 구조
  //   t    : 기호 글자(기본 'X')
  //   구조마다 배지 자리와 지시선 끝점을 따로 정해 두어 지시선이 다른 구조 위를 지나지 않는다.
  //   예) FIG.l2a_pick({mark:'chloro'})
  const OCT = [[-0.82, -1], [0.82, -1], [1, -0.7], [1, 0.7], [0.82, 1], [-0.82, 1], [-1, 0.7], [-1, -0.7]];
  const SPOT = { mito: [157, 30, 114, 35], chloro: [157, 80, 115, 77], nucleus: [13, 34, 57, 44], membrane: [157, 56, 133, 56], wall: [13, 66, 30.5, 64] };
  FIG.l2a_pick = p => {
    p = p || {};
    const CX = 85, CY = 56, A = 58, B = 46;
    const ring = d => OCT.map(c => [CX + c[0] * (A - d), CY + c[1] * (B - d)]);
    let s = poly(ring(0), 'url(#g-l2a-wall)') + poly(ring(7), '#fdfef6', { sw: 1.4 }) + poly(ring(10), 'url(#g-l2a-cyto)', { stroke: '#c2571a', sw: 1.8 });
    [[87, 29, 8], [115, 77, -12], [54, 79, 15], [84, 83, -6]].forEach(c => { s += chl(c[0], c[1], c[2], 0.58); });
    [[114, 35, -22], [90, 58, -20]].forEach(c => { s += mito(c[0], c[1], c[2], 0.58); });
    s += `<circle cx="63" cy="47" r="13.5" fill="url(#g-l2a-nuc)" stroke="${INK}" stroke-width="2"/><circle cx="66" cy="44.5" r="4.5" fill="#6b46b0"/>`;
    [[56, 42], [62, 54], [70, 52], [56, 50]].forEach(d => { s += `<circle cx="${d[0]}" cy="${d[1]}" r="1.2" fill="#8f6fc8"/>`; });
    const q = SPOT[p.mark] || SPOT.mito;
    s += tag(q[0], q[1], q[2], q[3], p.t == null ? 'X' : p.t);
    return svg(170, 108, s, '식물세포의 단면');
  };

  // ■ FIG.l2a_edge(p) : 식물세포의 가장자리 일부를 확대한 그림(폭 300, 높이 222)
  //   왼쪽이 세포 밖, 오른쪽이 세포 안. 바깥의 두꺼운 층과 그 안쪽의 얇은 막에 기호를 붙인다.
  //   a : 바깥의 두꺼운 층에 붙일 기호(기본 'A'), b : 안쪽의 얇은 막에 붙일 기호(기본 'B')
  //   구조 이름은 쓰지 않고 '세포 밖', '세포 안' 글자만 넣는다.
  //   예) FIG.l2a_edge({a:'A', b:'B'})
  FIG.l2a_edge = p => {
    p = p || {};
    const X0 = 40, Y0 = 30, X1 = 260, Y1 = 190;
    const mx = y => 135 + 1.6 * Math.sin(y / 13);
    const mem = [];
    for (let y = Y0; y <= Y1; y += 4) mem.push([mx(y), y]);
    let s = `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="#f4f7fb"/>` +
      `<rect x="128" y="${Y0}" width="${X1 - 128}" height="${Y1 - Y0}" fill="#fdfef6"/>` +
      poly(mem.concat([[X1, Y1], [X1, Y0]]), 'url(#g-l2a-cyto)', { stroke: 'none', sw: 0 }) +
      `<rect x="100" y="${Y0}" width="28" height="${Y1 - Y0}" fill="url(#g-l2a-wall)"/>` +
      line2([[109, Y0 + 4], [109, Y1 - 4]], '#7fa552', 1, { dash: '10 7' }) + line2([[119, Y0 + 10], [119, Y1 - 4]], '#7fa552', 1, { dash: '10 7' }) +
      line2([[100, Y0], [100, Y1]], INK, 2) + line2([[128, Y0], [128, Y1]], INK, 1.6) +
      line2(mem, '#c2571a', 2.8);
    s += chl(176, 78, 75, 1.5) + chl(172, 142, 100, 1.5) + chl(232, 150, -15, 1.5) + mito(222, 94, 20, 1.5);
    s += `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="none" stroke="${INK}" stroke-width="2"/>`;
    s += T(70, 46, '세포 밖', { size: 14, weight: 700 }) + T(222, 46, '세포 안', { size: 14, weight: 700 });
    s += tag(114, 208, 114, 176, p.a == null ? 'A' : p.a) + tag(160, 208, mx(174), 174, p.b == null ? 'B' : p.b);
    return svg(300, 222, s, '식물세포의 가장자리를 확대한 그림');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 새 그림 없음. 번호 11~16은 공용 FIG.cell과 기존 FIG.l2_two, 표만 쓴다.
})(FIG);

/* ====================== 레슨 3 현미경으로 직접 보기 ====================== */
// 레슨 3 그림. tools/build.cjs가 src-figs/l3/의 00-pilot.js, 10-a.js, 20-b.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l3.js : 레슨 3 전용 그림
//
// ■ FIG.l3_steps(p) : 현미경표본을 만드는 과정의 단계 그림(기구가 한눈에 구별되게 다시 그린 것)
//   p.steps: [{k, tag, liquid}]
//     k      'smear'(면봉으로 받침 유리에 문지르기) | 'drop'(스포이트로 용액 떨어뜨리기)
//            | 'cover'(핀셋으로 덮개 유리를 비스듬히 덮기) | 'blot'(거름종이로 감싸고 눌러 여분의 용액 없애기)
//            | 'leaf'(핀셋으로 검정말잎을 받침 유리에 올리기). 모르는 k는 건너뛴다.
//     tag    판 왼쪽 위 이름('(가)' 등), liquid 'blue' | 'red' | 'water'(기본)
//   판 1~2개는 한 줄(폭 176씩), 3~4개는 2×2(캔버스 364×236), 5~6개는 3칸(폭 120씩).
//   예) { kind: 'l3_steps', p: { steps: [{ k: 'cover', tag: '(가)', liquid: 'blue' }, { k: 'smear', tag: '(나)' }] } }
//
// ■ FIG.l3_view(p) : 그림 보기용 현미경 관찰 화면(폭 170 고정). 인자는 FIG.scope와 같다(kind, stain, hl, bubble).
//   공용 FIG.scope를 안쪽에 놓고 가장자리를 흰 띠로 덮어, 좁은 칸에서 캔버스 가장자리에 세로줄이 비치지 않게 한다.
//   예) { kind: 'l3_view', p: { kind: 'leaf', stain: 'red' } }
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<clipPath id="g-l3-pan"><rect x="1" y="1" width="174" height="110" rx="7"/></clipPath>');

  const LIQ = { blue: '#3f6fd8', red: '#c9375a', water: '#a9d6f2' };
  // 받침 유리 윗면의 점. u는 긴 쪽(0~1), v는 안쪽 깊이(0~1)
  const S = (u, v) => [16 + 108 * u + 32 * v, 94 - 30 * v];
  const TOP = [S(0, 0), S(1, 0), S(1, 1), S(0, 1)];
  const slide = () => poly([[16, 94], [124, 94], [124, 99], [16, 99]], '#b5d9f0', { sw: 1.6 }) +
    poly([[124, 94], [156, 64], [156, 69], [124, 99]], '#9fcbe8', { sw: 1.6 }) +
    poly(TOP, '#fff') + poly(TOP, 'url(#g-glass)');
  const puddle = (c, cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" fill-opacity=".85" stroke="${INK}" stroke-width="1.2"/>`;
  const smearMark = (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="21" ry="6" fill="#fff" fill-opacity=".6" stroke="${SUB}" stroke-width="1.1" stroke-dasharray="3 3"/>`;
  // 핀셋. 끝이 (tx, ty)에 닿고 a도만큼 기운다.
  const tweezers = (tx, ty, a) => `<g transform="translate(${tx} ${ty}) rotate(${a})">` +
    poly([[-3, -58], [0, -58], [-3.5, -28], [-0.4, 0], [-2.4, 0], [-7.5, -28]], 'url(#g-metal)', { sw: 1.4 }) +
    poly([[3, -58], [0, -58], [3.5, -28], [0.4, 0], [2.4, 0], [7.5, -28]], 'url(#g-metal)', { sw: 1.4 }) +
    poly([[-3.2, -60], [3.2, -60], [3.2, -50], [-3.2, -50]], 'url(#g-metal)', { sw: 1.4 }) + '</g>';
  // 덮개 유리가 놓일 자리(받침 유리 위)
  const CV = [[66.2, 89.5], [96.4, 89.5], [118.8, 68.5], [88.6, 68.5]];

  const SCENE = {
    smear() {
      return slide() + smearMark(86, 80) +
        line2([[160, 10], [99, 70]], INK, 6) + line2([[160, 10], [99, 70]], '#e8cfa5', 3.2) +
        `<ellipse cx="95" cy="74" rx="10" ry="6.5" fill="#fff" stroke="${INK}" stroke-width="1.8" transform="rotate(-45 95 74)"/>` +
        arrow(98, 105.5, 122, 105.5, { w: 1.6, color: SUB }) + arrow(82, 105.5, 58, 105.5, { w: 1.6, color: SUB });
    },
    drop(lc) {
      return slide() + smearMark(100, 80) + puddle(lc, 100, 80, 11, 4) +
        `<ellipse cx="100" cy="15" rx="9" ry="11" fill="#e58a6a" stroke="${INK}" stroke-width="2"/>` +
        box(93, 24, 14, 5, { fill: '#c96f52', sw: 1.6, r: 2 }) +
        `<polygon points="95,29 105,29 105,48 101.6,60 98.4,60 95,48" fill="#fff"/>` +
        `<polygon points="96.4,37 103.6,37 103.6,48 100.9,58.6 99.1,58.6 96.4,48" fill="${lc}"/>` +
        poly([[95, 29], [105, 29], [105, 48], [101.6, 60], [98.4, 60], [95, 48]], 'url(#g-glass)', { sw: 1.6 }) +
        `<path d="M100,63 q4.5,6 0,9.5 q-4.5,-3.5 0,-9.5Z" fill="${lc}" stroke="${INK}" stroke-width="1"/>`;
    },
    cover(lc) {
      // 덮개 유리의 오른쪽 변을 받침 유리에 대고 왼쪽 변을 든 모습
      const G = [[96.4, 89.5], [118.8, 68.5], [95.8, 49.5], [73.4, 70.5]];
      return slide() + puddle(lc, 94, 80, 13, 5) +
        `<polygon points="${G.map(q => q.join(',')).join(' ')}" fill="#fff" fill-opacity=".5"/>` +
        poly(G, 'url(#g-glass)', { sw: 1.8 }) + line2([[80, 70], [96, 55]], '#fff', 1.6) +
        tweezers(84.6, 60, -20) + arrow(63, 68, 59, 84, { w: 1.6, color: SUB });
    },
    blot(lc) {
      // 덮개 유리를 덮은 받침 유리를 거름종이로 감싸고 손가락으로 누르는 모습
      const dots = [[58, 93], [74, 95], [60, 88], [100, 64], [92, 63], [78, 76], [108, 92]].map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="1" fill="#d5cdb6"/>`).join('');
      const pts = CV.map(q => q.join(',')).join(' ');
      return slide() +
        poly([[44.6, 97.6], [100.7, 97.6], [100.7, 106], [44.6, 106]], '#ece5d0', { sw: 1.6 }) +
        poly([[44.6, 97.6], [100.7, 97.6], [140.4, 60.4], [84.2, 60.4]], '#fffdf3', { sw: 1.8 }) + dots +
        `<polygon points="${pts}" fill="${lc}" fill-opacity=".12" stroke="${lc}" stroke-opacity=".45" stroke-width="6" stroke-linejoin="round"/>` +
        line2(CV.concat([CV[0]]), SUB, 1.3, { dash: '4 3' }) +
        line2([[186, -8], [108, 68]], INK, 19) + line2([[186, -8], [108, 68]], '#f6c9a8', 15.8) +
        `<ellipse cx="113" cy="63" rx="5.5" ry="4" transform="rotate(-44 113 63)" fill="#fde9dc" stroke="#c98f6c" stroke-width="1.2"/>`;
    },
    leaf(lc) {
      return slide() + puddle(lc, 96, 80, 12, 4.5) +
        `<ellipse cx="100" cy="71" rx="13" ry="4.2" fill="#58b368" stroke="${INK}" stroke-width="1.5" transform="rotate(-35 100 71)"/>` +
        line2([[91, 77], [109, 65]], '#2f8f57', 1) + tweezers(110, 64, 25);
    },
  };

  FIG.l3_steps = p => {
    p = p || {};
    let steps = (Array.isArray(p.steps) ? p.steps : []).filter(s => s && Object.prototype.hasOwnProperty.call(SCENE, s.k)).slice(0, 6);
    if (!steps.length) steps = [{ k: 'smear' }, { k: 'drop', liquid: 'blue' }, { k: 'cover', liquid: 'blue' }, { k: 'blot', liquid: 'blue' }];
    const n = steps.length, cols = n <= 2 ? n : n <= 4 ? 2 : 3, G = 8;
    const pw = cols === 3 ? 120 : 176, k = pw / 176, ph = r2(112 * k);
    let body = '';
    steps.forEach((st, i) => {
      const x = 2 + (i % cols) * (pw + G), y = 2 + Math.floor(i / cols) * (ph + G);
      const lc = LIQ[st.liquid] || LIQ.water;
      body += box(x, y, pw, ph, { fill: 'url(#g-paper)', sw: 1.6, r: 8 }) +
        `<g transform="translate(${x} ${y}) scale(${r2(k)})"><g clip-path="url(#g-l3-pan)">${SCENE[st.k](lc)}</g></g>`;
      if (st.tag) body += T(x + 22, y + 16, st.tag, { size: 15, weight: 700 });
    });
    const rws = Math.ceil(n / cols);
    return svg(cols * (pw + G) - G + 4, r2(rws * (ph + G) - G + 4), body, '현미경표본을 만드는 과정');
  };

  FIG.l3_view = p => {
    const q = Object.assign({}, p || {}, { w: 162, marks: null, bar: null });
    const W = 170, H = 166;
    const inner = typeof FIG.scope === 'function' ? K.move(4, 4, FIG.scope(q)) : '';
    const frame = `<path d="M-2,-2H${W + 2}V${H + 2}H-2Z M6,5.5H${W - 6}V${H - 5.5}H6Z" fill="#fff" fill-rule="evenodd"/>`;
    return svg(W, H, inner + frame, '현미경 관찰 화면');
  };
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  // ■ FIG.l3a_cover(p) : 받침 유리 위의 용액에 덮개 유리를 덮는 여러 방법을 옆에서 본 모습(그림 보기용, 170×126)
  //   way    : 'tilt'(기본. 한쪽 끝을 받침 유리에 대고 핀셋으로 비스듬히 기울여 내림)
  //            | 'flat'(수평으로 든 채 위에서 내려놓음) | 'press'(덮은 뒤 손가락으로 세게 누름)
  //            | 'slide'(용액 옆 마른 곳에 놓고 밀어 옮김) | 'none'(덮개 유리 없이 거름종이를 용액에 바로 댐)
  //   liquid : 'blue'(기본) | 'red' | 'water'
  //   예) { kind: 'l3a_cover', p: { way: 'tilt' } }
  const LIQ = { blue: '#3f6fd8', red: '#c9375a', water: '#a9d6f2' };
  FIG.l3a_cover = p => {
    p = p || {};
    const way = ['tilt', 'flat', 'press', 'slide', 'none'].includes(p.way) ? p.way : 'tilt';
    const lc = LIQ[p.liquid] || LIQ.blue, W = 170, H = 126;
    const slide = box(12, 96, 146, 9, { fill: '#fff', sw: 1.8, r: 1.5 }) + box(12, 96, 146, 9, { fill: 'url(#g-glass)', sw: 1.8, r: 1.5 });
    const drop = cx => `<path d="M${cx - 15},96 Q${cx},78 ${cx + 15},96Z" fill="${lc}" fill-opacity=".85" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
    const glass = (x1, y1, x2, y2) => line2([[x1, y1], [x2, y2]], INK, 5) + line2([[x1, y1], [x2, y2]], '#d6ecfa', 2.2, { cap: 'butt' });
    // 핀셋. 끝이 (tx, ty)에 닿고 a도만큼 기운다.
    const twz = (tx, ty, a) => `<g transform="translate(${tx} ${ty}) rotate(${a})">` +
      poly([[-1.5, 0], [-6, -30], [-2.5, -52], [0, -52], [-2, -30], [0, -3]], 'url(#g-metal)', { sw: 1.3 }) +
      poly([[1.5, 0], [6, -30], [2.5, -52], [0, -52], [2, -30], [0, -3]], 'url(#g-metal)', { sw: 1.3 }) + '</g>';
    let s = box(1, 1, W - 2, H - 2, { fill: 'url(#g-paper)', stroke: '#b8c2d0', sw: 1.4, r: 8 });
    if (way === 'tilt') {
      s += slide + drop(85) + glass(110, 93.5, 66, 70) + twz(68, 71, -30) + arrow(55, 76, 55, 91, { w: 1.6, color: SUB });
    } else if (way === 'flat') {
      s += slide + drop(85) + glass(62, 64, 108, 64) + twz(63, 64, -30) + arrow(124, 58, 124, 86, { w: 1.6, color: SUB });
    } else if (way === 'press') {
      s += slide + `<rect x="58" y="93" width="54" height="3" fill="${lc}"/>` +
        `<path d="M51,96 Q56.5,87 62,96Z" fill="${lc}" stroke="${INK}" stroke-width="1.2"/><path d="M108,96 Q113.5,87 119,96Z" fill="${lc}" stroke="${INK}" stroke-width="1.2"/>` +
        `<circle cx="44" cy="89" r="2" fill="${lc}"/><circle cx="127" cy="89" r="2" fill="${lc}"/>` +
        glass(62, 91, 108, 91) +
        line2([[142, 8], [90, 79]], INK, 19) + line2([[142, 8], [90, 79]], '#f6c9a8', 15.8) +
        `<ellipse cx="95" cy="73" rx="5.5" ry="4" transform="rotate(-54 95 73)" fill="#fde9dc" stroke="#c98f6c" stroke-width="1.2"/>` +
        arrow(50, 44, 50, 76, { w: 3.2 });
    } else if (way === 'slide') {
      s += slide + drop(52) + glass(100, 93.5, 146, 93.5) + twz(144, 91, 20) + arrow(116, 80, 78, 80, { w: 1.6, color: SUB });
    } else {
      s += slide + drop(70) + poly([[66, 93], [80, 93], [136, 34], [122, 34]], '#fffdf3', { sw: 1.6 }) +
        `<polygon points="66,93 80,93 92,80.4 78,80.4" fill="${lc}" fill-opacity=".5"/>` +
        leader(74, 44, 103, 60) + T(46, 36, '거름종이', { size: 14 });
    }
    return svg(W, H, s, '받침 유리 위의 용액과 덮개 유리를 옆에서 본 모습');
  };

  // ■ FIG.l3a_views(p) : 현미경 관찰 화면 여러 개를 나란히 놓는다.
  //   panels : [{kind, stain, hl, bubble, cap}] 1~3판. kind, stain, hl, bubble은 FIG.scope와 같고 cap은 판 아래 이름.
  //            2판이면 폭 176씩(캔버스 360×194), 3판이면 폭 120씩(캔버스 376×146).
  //   예) { kind: 'l3a_views', p: { panels: [{ kind: 'cheek', stain: 'blue', cap: '(가)' }, { kind: 'leaf', stain: 'red', cap: '(나)' }] } }
  FIG.l3a_views = p => {
    p = p || {};
    let list = (Array.isArray(p.panels) ? p.panels : []).filter(q => q && typeof q === 'object').slice(0, 3);
    if (!list.length) list = [{ kind: 'cheek', stain: 'blue', cap: '(가)' }, { kind: 'leaf', stain: 'red', cap: '(나)' }];
    const n = list.length, pw = n === 3 ? 120 : n === 2 ? 176 : 240, G = 8;
    const vw = Math.max(120, pw - 8), R = Math.min((vw - 12) / 2, 100), vh = 2 * R + 8;
    const anyCap = list.some(q => q.cap);
    let s = '';
    list.forEach((q, i) => {
      const x = i * (pw + G);
      if (typeof FIG.scope === 'function') s += K.move(x + (pw - vw) / 2, 2, FIG.scope({ kind: q.kind, stain: q.stain, hl: q.hl, bubble: q.bubble, w: vw }));
      if (q.cap) s += caption(x + pw / 2, vh + 17, String(q.cap));
    });
    return svg(n * (pw + G) - G, r2(vh + 4 + (anyCap ? 28 : 0)), s, '현미경 관찰 화면 비교');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 번호 11~16은 공용 그림(scope)과 이미 있는 레슨 그림(l3_steps, l3a_views)만 쓴다. 새 그림은 없다.
})(FIG);

/* ====================== 레슨 4 모양이 다른 세포들 ====================== */
// 레슨 4 그림. tools/build.cjs가 src-figs/l4/의 00-pilot.js, 10-a.js, 20-b.js, 41-fixt1.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l4.js : 레슨 4 전용 그림
//
// ■ FIG.l4_cells(p) : 모양이 다른 세포 그림(이름표, 축척 없음)
//   kind   : 'neuron'(가늘고 길게 뻗은 세포) | 'rbc'(가운데가 오목한 원반 모양. 비스듬히 본 것 세 개)
//            | 'epi'(납작하고 편평한 세포. 얇은 판을 비스듬히 본 모습) | 'onion'(벽돌 모양 세포) | 'leaf'(초록 알갱이가 든 길쭉한 세포)
//   w      : 판의 폭(기본 170, 그림 보기용). 높이는 자동(폭 170이면 148).
//   cap    : 판 아래 이름('A' 등)
//   panels : [{kind, cap}] 두 판(폭 176씩) 또는 세 판(폭 120씩)을 나란히 놓는다.
//   예) FIG.l4_cells({kind:'neuron', w:170})
//       FIG.l4_cells({panels:[{kind:'epi', cap:'A'}, {kind:'rbc', cap:'B'}, {kind:'neuron', cap:'C'}]})
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<radialGradient id="g-l4-nerve" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff6d6"/><stop offset="1" stop-color="#f4d27c"/></radialGradient>');
  K.addDefs('<radialGradient id="g-l4-rbc" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f58a84"/><stop offset="1" stop-color="#d63a3f"/></radialGradient>');
  K.addDefs('<radialGradient id="g-l4-rbcIn" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#ef7a76"/><stop offset="1" stop-color="#b3262e"/></radialGradient>');
  K.addDefs('<radialGradient id="g-l4-epi" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#fff5ec"/><stop offset="1" stop-color="#f6cfb8"/></radialGradient>');
  K.addDefs('<radialGradient id="g-l4-nuc" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#efe0fb"/><stop offset="1" stop-color="#b18fdc"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l4-onion" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbea"/><stop offset="1" stop-color="#f3e9c4"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l4-leaf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6fbe6"/><stop offset="1" stop-color="#e3f0c2"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l4-chl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e07f"/><stop offset="1" stop-color="#3f9e48"/></linearGradient>');

  const S = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const P = (d, f, c, w) => `<path d="${d}" fill="${f}" stroke="${c || INK}" stroke-width="${w == null ? 2 : w}" stroke-linejoin="round"/>`;
  const C = (x, y, r, f, c, w) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${c ? ` stroke="${c}" stroke-width="${w || 2}"` : ''}/>`;
  const E = (x, y, rx, ry, f, c, w) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"${c ? ` stroke="${c}" stroke-width="${w || 2}"` : ''}/>`;
  const nucleus = (x, y, r) => C(x, y, r, 'url(#g-l4-nuc)', INK, 1.8) + C(r2(x + r * 0.22), r2(y - r * 0.18), r2(r * 0.34), '#6b46b0');
  const blob = pts => {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], s0 = mid(pts[n - 1], pts[0]);
    let d = `M${r2(s0[0])},${r2(s0[1])}`;
    for (let i = 0; i < n; i++) { const q = mid(pts[i], pts[(i + 1) % n]); d += ` Q${r2(pts[i][0])},${r2(pts[i][1])} ${r2(q[0])},${r2(q[1])}`; }
    return d + 'Z';
  };

  // 장면은 모두 중심 (0,0), 가로 ±60, 세로 ±52 안에 그린다.
  const SC = {
    neuron() {
      const main = ['M-36,-14 Q-42,-26 -50,-34', 'M-24,-16 Q-20,-30 -22,-42', 'M-41,-4 Q-50,-2 -57,-8', 'M-36,4 Q-42,16 -48,22', 'M-21,-11 Q-12,-16 -6,-26',
        'M-19,-2 C-4,4 4,20 18,22 C28,24 34,22 40,22'];
      const twig = ['M-43,-26 Q-40,-36 -42,-44', 'M-46,-30 L-56,-30', 'M-21,-30 Q-14,-36 -10,-44', 'M-50,-3 Q-54,4 -58,6', 'M-42,15 Q-40,26 -44,34', 'M-13,-17 L-3,-15',
        'M40,22 Q48,16 54,10', 'M40,22 Q50,24 57,22', 'M40,22 Q46,32 52,38'];
      const ends = [[54, 10], [57, 22], [52, 38]], col = '#f4d27c';
      let s = main.map(d => S(d, INK, 6.8)).join('') + twig.map(d => S(d, INK, 5.6)).join('') + C(-30, -6, 13.8, INK) + ends.map(e => C(e[0], e[1], 3.6, INK)).join('');
      s += main.map(d => S(d, col, 3.6)).join('') + twig.map(d => S(d, col, 2.4)).join('') + C(-30, -6, 12.2, 'url(#g-l4-nerve)') + ends.map(e => C(e[0], e[1], 2, col)).join('');
      // 가지 끝이 판 테두리에 닿지 않게 조금 줄여서 놓는다.
      return `<g transform="translate(1 2) scale(.9)">${s + nucleus(-30, -6, 5.2)}</g>`;
    },
    rbc() {
      // 가운데가 오목한 원반 하나. (x, y) 중심, rx·ry 윗면 타원, rot 기울기, t 두께
      const disc = (x, y, rx, ry, rot, t) => `<g transform="translate(${x} ${y}) rotate(${rot})">` +
        E(0, t, rx, ry, '#a8232c', INK, 2) + E(0, 0, rx, ry, 'url(#g-l4-rbc)', INK, 2) +
        E(0, r2(ry * 0.06), r2(rx * 0.5), r2(ry * 0.46), 'url(#g-l4-rbcIn)') +
        S(`M${r2(-rx * 0.44)},${r2(-ry * 0.1)} Q0,${r2(-ry * 0.62)} ${r2(rx * 0.44)},${r2(-ry * 0.1)}`, '#8f1d26', 1.5) +
        S(`M${r2(-rx * 0.36)},${r2(ry * 0.26)} Q0,${r2(ry * 0.62)} ${r2(rx * 0.36)},${r2(ry * 0.26)}`, '#ffb9b4', 1.3) +
        S(`M${r2(-rx * 0.78)},${r2(-ry * 0.42)} Q${r2(-rx * 0.5)},${r2(-ry * 0.8)} ${r2(-rx * 0.15)},${r2(-ry * 0.86)}`, '#ffd0cc', 1.4) + '</g>';
      // 기울기가 다른 원반 세 개(많이 누운 것, 중간, 위에서 비스듬히 본 것)
      return disc(-24, 32, 20, 7, -10, 4) + disc(30, 18, 24, 12, 20, 4.5) + disc(-18, -16, 30, 19, -8, 5);
    },
    epi() {
      // 얇고 넓은 판을 비스듬히 내려다본 모습(가로로 넓고 두께는 얇게)
      const d = blob([[-54, 2], [-40, -16], [-10, -23], [26, -21], [52, -9], [46, 11], [16, 23], [-22, 22], [-48, 14]]);
      let s = `<g transform="translate(0 4.5)">${P(d, '#d9b49b', INK, 1.6)}</g>` + P(d, 'url(#g-l4-epi)') + S('M30,-11 Q37,-4 33,5', '#cfa58b', 1.3) + S('M-36,-6 Q-40,1 -35,8', '#cfa58b', 1.1);
      [[-22, -9], [-26, 6], [-8, 12], [18, 11], [22, -10], [-4, -14], [16, -1], [-12, 2]].forEach(q => { s += C(q[0], q[1], 1.1, '#c79f85'); });
      return s + `<g transform="translate(2 -1) scale(1 .66)">${nucleus(0, 0, 8)}</g>`;
    },
    onion() {
      let s = poly([[-52, -18], [50, -21], [53, 17], [-50, 20]], '#cdbd8a') + poly([[-48, -14], [46, -17], [49, 13], [-46, 16]], 'url(#g-l4-onion)', { stroke: '#7d7358', sw: 1.3 });
      [[-30, -4], [-12, 6], [-36, 8], [0, -8], [38, 6]].forEach(q => { s += C(q[0], q[1], 1.1, '#bfb089'); });
      return s + nucleus(22, -2, 7);
    },
    leaf() {
      let s = `<rect x="-24" y="-48" width="48" height="96" rx="12" fill="#b4d486" stroke="${INK}" stroke-width="2"/>` +
        `<rect x="-19" y="-43" width="38" height="86" rx="8" fill="url(#g-l4-leaf)" stroke="#4f7a3a" stroke-width="1.3"/>`;
      [[-9, -34, 15], [9, -28, -25], [-10, -14, 75], [10, -8, 80], [-9, 6, -80], [-10, 24, 75], [9, 29, -20], [-5, 39, 5]].forEach(c => {
        s += `<g transform="translate(${c[0]} ${c[1]}) rotate(${c[2]})">${E(0, 0, 7, 4.2, 'url(#g-l4-chl)', INK, 1.3)}${S('M-3,-2.6 L-3,2.6 M0,-3 L0,3 M3,-2.6 L3,2.6', '#1d6b31', 1)}</g>`;
      });
      return s + nucleus(4, 12, 6.5);
    },
  };

  function panel(q, pw) {
    q = q && typeof q === 'object' ? q : {};
    const kind = Object.prototype.hasOwnProperty.call(SC, q.kind) ? q.kind : 'neuron';
    pw = Math.max(100, Math.min(300, pw || 170));
    const k = (pw - 8) / 120, h = r2(104 * k + 8);
    let s = box(2, 2, pw - 4, h - 4, { fill: 'url(#g-paper)', stroke: '#b8c2d0', sw: 1.4, r: 8 }) +
      `<g transform="translate(${r2(pw / 2)} ${r2(h / 2)}) scale(${r2(k)})">${SC[kind]()}</g>`;
    let H = h;
    if (q.cap != null && q.cap !== '') { s += caption(pw / 2, h + 13, String(q.cap)); H = h + 26; }
    return { w: pw, h: H, body: s };
  }

  FIG.l4_cells = p => {
    p = p || {};
    const list = Array.isArray(p.panels) && p.panels.length ? p.panels.slice(0, 3) : null;
    if (!list) { const c = panel(p, +p.w || 170); return svg(c.w, c.h, c.body, '세포의 모습'); }
    const pw = list.length === 3 ? 120 : 176;
    const row = K.rowOf(list.map(q => panel(q, pw)), 8);
    return svg(row.w, row.h, row.body, '세포의 모습');
  };
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  // ■ FIG.l4a_body(p) : 사람 윗몸 윤곽과 몸의 세 곳을 확대한 원(폭 380, 높이 250). 세포는 그리지 않고 위치만 보인다.
  //   marks : {skin:'A', vessel:'B', stomach:'C'} 가운데 준 것만 확대 원과 기호를 그린다.
  //           skin    피부 단면의 바깥 표면(지시선 끝의 점), 이름표 '피부'
  //           vessel  혈관 안(기호가 혈관 속에 놓인다), 이름표 '혈관'
  //           stomach 위벽의 안쪽 표면(지시선 끝의 점), 이름표 '위'
  //   예) FIG.l4a_body({marks:{skin:'A', vessel:'B', stomach:'C'}})   FIG.l4a_body({marks:{vessel:'X'}})
  K.addDefs('<clipPath id="g-l4a-c0"><circle cx="52" cy="52" r="40"/></clipPath>');
  K.addDefs('<clipPath id="g-l4a-c1"><circle cx="328" cy="52" r="40"/></clipPath>');
  K.addDefs('<clipPath id="g-l4a-c2"><circle cx="52" cy="190" r="40"/></clipPath>');
  K.addDefs('<linearGradient id="g-l4a-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdeee0"/><stop offset="1" stop-color="#f6d3b8"/></linearGradient>');
  const R = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${INK}"/>`;
  const ring = (x, y) => `<circle cx="${x}" cy="${y}" r="40" fill="none" stroke="${INK}" stroke-width="2"/>`;

  FIG.l4a_body = p => {
    p = p || {};
    const m = p.marks && typeof p.marks === 'object' ? p.marks : {};
    const on = k => m[k] != null && m[k] !== '';
    let s = '';
    // 윗몸 윤곽(머리, 목, 몸통과 두 팔)
    s += `<path d="M150,72 Q190,64 230,72 Q262,78 266,110 L272,246 L246,246 L242,130 L240,246 L140,246 L138,130 L134,246 L108,246 L114,110 Q118,78 150,72Z" fill="url(#g-l4a-skin)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="181" y="54" width="18" height="18" fill="#f8dcc6" stroke="${INK}" stroke-width="2"/>`;
    s += `<circle cx="190" cy="36" r="22" fill="url(#g-l4a-skin)" stroke="${INK}" stroke-width="2"/>`;
    if (on('vessel')) {
      s += `<path d="M200,118 Q244,100 255,140 L259,236" fill="none" stroke="#d63a3f" stroke-width="3.4" stroke-linecap="round"/>`;
      s += `<g clip-path="url(#g-l4a-c1)">` + R(288, 12, 80, 80, '#f8ead9') + R(288, 28, 80, 48, '#e58f8f') + R(288, 35, 80, 34, '#fde4e1') +
        line2([[288, 28], [368, 28]], INK, 1.6) + line2([[288, 35], [368, 35]], INK, 1.6) + line2([[288, 69], [368, 69]], INK, 1.6) + line2([[288, 76], [368, 76]], INK, 1.6) + '</g>';
      s += ring(328, 52) + badge(328, 52, String(m.vessel)) + T(328, 106, '혈관', { size: 14 }) + leader(300, 81, 256, 170) + dot(256, 170);
    }
    if (on('stomach')) {
      s += `<path d="M190,150 Q206,146 210,160 Q212,178 196,180 Q184,180 186,166 Q190,160 190,150Z" fill="#f2b9a0" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
      s += `<g clip-path="url(#g-l4a-c2)">` + R(12, 150, 80, 80, '#fff7e6') + R(12, 150, 30, 80, '#f2b9a0') + line2([[42, 150], [42, 230]], INK, 2) + '</g>';
      s += ring(52, 190) + leader(59, 182, 42, 182) + dot(42, 182) + badge(70, 182, String(m.stomach)) + T(66, 212, '안쪽', { size: 14 }) + T(52, 242, '위', { size: 14 }) +
        leader(92, 190, 190, 166) + dot(190, 166);
    }
    if (on('skin')) {
      s += `<g clip-path="url(#g-l4a-c0)">` + R(12, 12, 80, 80, '#f3f6fa') + R(12, 46, 80, 12, '#f8d9c4') + R(12, 58, 80, 34, '#f2b9a0') +
        line2([[12, 46], [92, 46]], INK, 2) + line2([[12, 58], [92, 58]], '#c98a70', 1.2) + '</g>';
      s += ring(52, 52) + leader(52, 37, 52, 46) + dot(52, 46) + badge(52, 26, String(m.skin)) + T(52, 106, '피부', { size: 14 }) + leader(84, 76, 113, 128) + dot(113, 128);
    }
    return svg(380, 250, s, '사람의 몸과 확대한 세 곳');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 새 그림 없음(l4_cells, l4a_body를 인자만 바꿔 썼다).
})(FIG);

/* ===== 41-fixt1.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  // ■ FIG.l4a_body(p) : 사람 윗몸 윤곽과 몸의 세 곳을 확대한 원(폭 380, 높이 250). 세포는 그리지 않고 위치만 보인다.
  //   marks : {skin:'A', vessel:'B', blood:'B', stomach:'C'} 가운데 준 것만 확대 원과 기호를 그린다.
  //           skin    피부 단면의 바깥 표면(지시선 끝의 점), 이름표 '피부'
  //           vessel  혈관 안(혈관 벽과 속이 보이는 단면, 기호가 혈관 속에 놓인다), 이름표 '혈관'
  //           blood   혈관 속을 흐르는 혈액만 확대한 모습(벽과 세포를 그리지 않는다), 이름표 '혈액'
  //                   vessel과 같은 자리를 쓰므로 둘을 함께 주면 blood만 그린다.
  //           stomach 위벽의 안쪽 표면(지시선 끝의 점), 이름표 '위'
  //   예) FIG.l4a_body({marks:{skin:'A', blood:'B', stomach:'C'}})   FIG.l4a_body({marks:{vessel:'X'}})
  K.addDefs('<clipPath id="g-l4a-c0"><circle cx="52" cy="52" r="40"/></clipPath>');
  K.addDefs('<clipPath id="g-l4a-c1"><circle cx="328" cy="52" r="40"/></clipPath>');
  K.addDefs('<clipPath id="g-l4a-c2"><circle cx="52" cy="190" r="40"/></clipPath>');
  K.addDefs('<linearGradient id="g-l4a-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdeee0"/><stop offset="1" stop-color="#f6d3b8"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l4f-blood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef8a88"/><stop offset="1" stop-color="#d9484d"/></linearGradient>');
  const R = (x, y, w, h, f) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${INK}"/>`;
  const ring = (x, y) => `<circle cx="${x}" cy="${y}" r="40" fill="none" stroke="${INK}" stroke-width="2"/>`;
  const wave = (y, c, w) => `<path d="M284,${y} q11,-6 22,0 t22,0 t22,0 t22,0" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

  FIG.l4a_body = p => {
    p = p || {};
    const m = p.marks && typeof p.marks === 'object' ? p.marks : {};
    const on = k => m[k] != null && m[k] !== '';
    let s = '';
    // 윗몸 윤곽(머리, 목, 몸통과 두 팔)
    s += `<path d="M150,72 Q190,64 230,72 Q262,78 266,110 L272,246 L246,246 L242,130 L240,246 L140,246 L138,130 L134,246 L108,246 L114,110 Q118,78 150,72Z" fill="url(#g-l4a-skin)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<rect x="181" y="54" width="18" height="18" fill="#f8dcc6" stroke="${INK}" stroke-width="2"/>`;
    s += `<circle cx="190" cy="36" r="22" fill="url(#g-l4a-skin)" stroke="${INK}" stroke-width="2"/>`;
    if (on('blood')) {
      // 몸 그림의 혈관 줄은 그대로 두고, 확대 원에는 흐르는 혈액만 그린다(혈관 벽, 세포 없음).
      s += `<path d="M200,118 Q244,100 255,140 L259,236" fill="none" stroke="#d63a3f" stroke-width="3.4" stroke-linecap="round"/>`;
      s += `<g clip-path="url(#g-l4a-c1)">` + R(288, 12, 80, 80, 'url(#g-l4f-blood)') +
        wave(24, '#f6b3b0', 1.8) + wave(36, '#c9373d', 1.4) + wave(70, '#f6b3b0', 1.8) + wave(82, '#c9373d', 1.4) + '</g>';
      s += ring(328, 52) + badge(328, 52, String(m.blood)) + T(328, 106, '혈액', { size: 14 }) + leader(300, 81, 256, 170) + dot(256, 170);
    } else if (on('vessel')) {
      s += `<path d="M200,118 Q244,100 255,140 L259,236" fill="none" stroke="#d63a3f" stroke-width="3.4" stroke-linecap="round"/>`;
      s += `<g clip-path="url(#g-l4a-c1)">` + R(288, 12, 80, 80, '#f8ead9') + R(288, 28, 80, 48, '#e58f8f') + R(288, 35, 80, 34, '#fde4e1') +
        line2([[288, 28], [368, 28]], INK, 1.6) + line2([[288, 35], [368, 35]], INK, 1.6) + line2([[288, 69], [368, 69]], INK, 1.6) + line2([[288, 76], [368, 76]], INK, 1.6) + '</g>';
      s += ring(328, 52) + badge(328, 52, String(m.vessel)) + T(328, 106, '혈관', { size: 14 }) + leader(300, 81, 256, 170) + dot(256, 170);
    }
    if (on('stomach')) {
      s += `<path d="M190,150 Q206,146 210,160 Q212,178 196,180 Q184,180 186,166 Q190,160 190,150Z" fill="#f2b9a0" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
      s += `<g clip-path="url(#g-l4a-c2)">` + R(12, 150, 80, 80, '#fff7e6') + R(12, 150, 30, 80, '#f2b9a0') + line2([[42, 150], [42, 230]], INK, 2) + '</g>';
      s += ring(52, 190) + leader(59, 182, 42, 182) + dot(42, 182) + badge(70, 182, String(m.stomach)) + T(66, 212, '안쪽', { size: 14 }) + T(52, 242, '위', { size: 14 }) +
        leader(92, 190, 190, 166) + dot(190, 166);
    }
    if (on('skin')) {
      s += `<g clip-path="url(#g-l4a-c0)">` + R(12, 12, 80, 80, '#f3f6fa') + R(12, 46, 80, 12, '#f8d9c4') + R(12, 58, 80, 34, '#f2b9a0') +
        line2([[12, 46], [92, 46]], INK, 2) + line2([[12, 58], [92, 58]], '#c98a70', 1.2) + '</g>';
      s += ring(52, 52) + leader(52, 37, 52, 46) + dot(52, 46) + badge(52, 26, String(m.skin)) + T(52, 106, '피부', { size: 14 }) + leader(84, 76, 113, 128) + dot(113, 128);
    }
    return svg(380, 250, s, '사람의 몸과 확대한 세 곳');
  };
})(FIG);

/* ====================== 레슨 5 생물의 구성 단계 ====================== */
// 레슨 5 그림. tools/build.cjs가 src-figs/l5/의 00-pilot.js, 10-a.js, 20-b.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l5.js : 레슨 5 전용 그림. 시범 3문항은 공용 그림 FIG.levels와 표만 쓰므로 전용 그림이 없다(틀만 둔다).
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 160문항으로 넓힐 때 잎 단면, 위와 소화계 그림 등을 FIG.l5_이름으로 여기에 보탠다.
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<linearGradient id="g-l5a-step" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6faff"/><stop offset="1" stop-color="#d7e7fa"/></linearGradient>');
  K.addDefs('<radialGradient id="g-l5a-sto" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#fde6e1"/><stop offset="1" stop-color="#f0a399"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l5a-mus" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6b3a8"/><stop offset="1" stop-color="#e58b80"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l5a-chl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e07f"/><stop offset="1" stop-color="#3f9e48"/></linearGradient>');
  K.addDefs('<radialGradient id="g-l5a-nuc" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#efe0fb"/><stop offset="1" stop-color="#b18fdc"/></radialGradient>');

  const dot = (x, y) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="2.2" fill="${SUB}"/>`;
  const pth = (d, fill, stroke, sw) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const circ = (x, y, r, fill, stroke, sw) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${sw || 0}"/>`;

  // 위(밥통) 모양. 중심 (x, y), 배율 k. 원래 크기는 가로 -34~30, 세로 -38~32.
  const STO = 'M-10,-38 L-2,-38 L-2,-24 C4,-36 26,-32 28,-10 C30,12 14,32 -8,32 C-18,32 -24,28 -30,26 L-34,18 C-26,20 -20,20 -14,16 C-8,10 -10,-6 -10,-22 Z';
  const stomach = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})">` + pth(STO, 'url(#g-l5a-sto)', INK, r2(2 / k)) +
    pth('M2,-18 C12,-16 16,-4 12,8 M-3,-6 C5,0 4,14 -6,20 M-20,23 C-13,27 -4,27 3,22', 'none', '#d98a80', r2(1.3 / k)) + '</g>';

  // ■ FIG.l5a_chain(p) : 단계 이름 상자를 주어진 순서대로 화살표로 이은 사슬(그림 보기용, 폭 300, 높이 56)
  //   order : 상자 글 배열(최대 5개). 기본 ['세포','조직','기관','기관계','개체']
  //   w     : 폭(280~300, 기본 300)
  FIG.l5a_chain = p => {
    p = p || {};
    const order = (Array.isArray(p.order) && p.order.length ? p.order : ['세포', '조직', '기관', '기관계', '개체']).slice(0, 5).map(String);
    const W = Math.max(280, Math.min(300, +p.w || 300)), n = order.length, BW = 50, BH = 36;
    const gap = n > 1 ? (W - 8 - n * BW) / (n - 1) : 0;
    let s = '';
    order.forEach((t, i) => {
      const x = 4 + i * (BW + gap), cy = 10 + BH / 2;
      s += box(x, 10, BW, BH, { fill: 'url(#g-l5a-step)', r: 9 }) + T(x + BW / 2, cy, t, { size: 14, weight: 700, halo: false });
      if (i < n - 1) s += arrow(x + BW + 1.5, cy, x + BW + gap - 1.5, cy, { w: 1.8, head: 6 });
    });
    return svg(W, 56, s, '구성 단계를 이은 사슬');
  };

  // ■ FIG.l5a_body(p) : 사람 몸의 구성 단계 예시(상피세포 → 상피조직 → 위 → 소화계 → 사람). 폭 380, 높이 250
  //   윗줄은 왼쪽에서 오른쪽으로 셋, 아랫줄은 오른쪽에서 왼쪽으로 둘(화살표로 이어진다).
  //   marks : 기호 다섯 개 배열(기본 ['A','B','C','D','E']). ''이면 그 기호를 붙이지 않는다.
  //   names : false면 그림 아래의 예 이름(상피세포 등)을 쓰지 않는다. 단계 이름은 어느 경우에도 쓰지 않는다.
  FIG.l5a_body = p => {
    p = p || {};
    const marks = Array.isArray(p.marks) ? p.marks : ['A', 'B', 'C', 'D', 'E'];
    const NM = ['상피세포', '상피조직', '위', '소화계', '사람'];
    const POS = [[66, 46], [192, 46], [318, 46], [318, 181], [192, 181]], BY = [14, 14, 14, 140, 140], NY = [100, 100, 100, 240, 240];
    const SKIN = '#f6cfae', CELL = '#f9d5cf';
    let s = '';
    // 상피세포 하나
    {
      const [x, y] = POS[0];
      s += poly([[-26, -6], [-10, -20], [14, -18], [27, -2], [12, 19], [-14, 17]].map(q => [x + q[0], y + q[1]]), CELL);
      s += circ(x + 1, y - 1, 6.5, 'url(#g-l5a-nuc)', INK, 1.5) + circ(x + 2.5, y - 2, 2.2, '#6b46b0');
    }
    // 상피조직(납작한 세포가 빈틈없이 붙은 모습)
    {
      const [x, y] = POS[1], r = 9.5, h = Math.sqrt(3) * r;
      for (let c = 0; c < 5; c++) for (let w = 0; w < 3; w++) {
        const hx = x - 28.5 + c * 14.25, hy = y + (w - 1) * h + (c % 2 ? h / 2 : 0) - h / 4, pts = [];
        for (let a = 0; a < 6; a++) pts.push([hx + r * Math.cos(a * Math.PI / 3), hy + r * Math.sin(a * Math.PI / 3)]);
        s += poly(pts, CELL, { sw: 1.5 }) + circ(hx + 0.5, hy, 2.4, '#8f6fc8');
      }
    }
    // 위
    s += stomach(POS[2][0], POS[2][1], 1);
    // 소화계(몸 윤곽 속의 소화 기관들)
    {
      const [x, y] = POS[3];
      let g = circ(0, -38, 9, '#f3f5f8', '#98a2b3', 1.5);
      g += pth('M-8,-30 L-28,-25 Q-36,-23 -36,-12 L-33,46 L33,46 L36,-12 Q36,-23 28,-25 L8,-30 Z', '#f3f5f8', '#98a2b3', 1.5);
      const LI = 'M-19,40 L-19,12 Q-19,8 -15,8 L15,8 Q19,8 19,12 L19,32 Q19,36 14,36 L6,36 Q2,36 2,40 L2,44';
      const SI = 'M10,16 Q-12,13 -11,18 Q-10,23 9,21 Q13,25 -9,26 Q-12,30 8,30';
      const ES = 'M0,-34 L0,-24 Q0,-17 9,-14.5';
      g += pth(LI, 'none', INK, 8.5) + pth(LI, 'none', '#e8a48a', 5.5);
      g += pth(SI, 'none', INK, 5.5) + pth(SI, 'none', '#f7cdb2', 3);
      g += pth(ES, 'none', INK, 4.4) + pth(ES, 'none', '#f2a59b', 2.2);
      g += `<g transform="translate(11 -3) scale(.3)">` + pth(STO, '#f6b4aa', INK, 5) + '</g>';
      g += pth('M-25,-8 Q-10,-15 4,-9 L-2,2 Q-14,5 -25,3 Z', '#b9684e', INK, 1.5);
      s += `<g transform="translate(${x} ${y})">${g}</g>`;
    }
    // 사람
    {
      const [x, y] = POS[4];
      let g = `<ellipse cx="-6" cy="43" rx="6" ry="3.5" fill="#5b4636" stroke="${INK}" stroke-width="1.4"/><ellipse cx="6" cy="43" rx="6" ry="3.5" fill="#5b4636" stroke="${INK}" stroke-width="1.4"/>`;
      g += `<rect x="-9.5" y="6" width="8.5" height="35" rx="2" fill="#4a6fa5" stroke="${INK}" stroke-width="1.6"/><rect x="1" y="6" width="8.5" height="35" rx="2" fill="#4a6fa5" stroke="${INK}" stroke-width="1.6"/>`;
      g += pth('M-12,-23 L-18,4 M12,-23 L18,4', 'none', INK, 7.5) + pth('M-12,-23 L-18,4 M12,-23 L18,4', 'none', SKIN, 4.5);
      g += `<rect x="-12" y="-28" width="24" height="38" rx="5" fill="#6ea8e8" stroke="${INK}" stroke-width="1.8"/>`;
      g += circ(0, -38, 8.5, SKIN, INK, 1.8) + pth('M-8.5,-39 Q-8,-48 0,-47.5 Q8,-48 8.5,-39 Q3,-43.5 -8.5,-39Z', '#4a3b2a', INK, 1.2);
      g += circ(-3, -36.5, 1, INK) + circ(3, -36.5, 1, INK) + pth('M-2.5,-33.5 Q0,-31.8 2.5,-33.5', 'none', INK, 1);
      s += `<g transform="translate(${x} ${y})">${g}</g>`;
    }
    // 화살표(순서)
    s += arrow(110, 46, 148, 46, { w: 2.2, head: 9 }) + arrow(236, 46, 274, 46, { w: 2.2, head: 9 });
    s += arrow(318, 111, 318, 128, { w: 2.2, head: 8 }) + arrow(274, 181, 236, 181, { w: 2.2, head: 9 });
    POS.forEach((q, i) => {
      if (marks[i] != null && marks[i] !== '') s += badge(q[0] - 52, BY[i], String(marks[i]));
      if (p.names !== false) s += T(q[0], NY[i], NM[i], { size: 14, weight: 600 });
    });
    return svg(380, 250, s, '사람 몸의 구성 단계 예시');
  };

  // ■ FIG.l5a_stomach(p) : 위 전체(왼쪽)와 위벽 일부를 확대한 단면(오른쪽). 폭 380, 높이 234
  //   확대 그림은 왼쪽이 위의 안쪽이다. 안쪽 표면의 세포 한 층(상피조직), 얇은 층, 바깥쪽의 두꺼운 층(근육조직) 순이다.
  //   labels : {epi, muscle, inside} 이름표 글. 1~2글자면 기호 배지로, ''이면 그리지 않는다.
  //            기본 {epi:'상피조직', muscle:'근육조직', inside:'위의 안쪽'}
  FIG.l5a_stomach = p => {
    p = p || {};
    const lb = Object.assign({ epi: '상피조직', muscle: '근육조직', inside: '위의 안쪽' }, p.labels && typeof p.labels === 'object' ? p.labels : {});
    const X = 180, Y = 44, PH = 152;
    let s = stomach(72, 118, 1.9);
    s += line2([[129, 92], [X, Y]], SUB, 1.3, { dash: '4 3' }) + line2([[129, 106], [X, Y + PH]], SUB, 1.3, { dash: '4 3' });
    s += `<rect x="115" y="92" width="14" height="14" fill="#fff" fill-opacity=".35" stroke="${INK}" stroke-width="1.8"/>`;
    // 확대 판: 위의 안쪽 공간, 상피조직, 얇은 층, 근육조직
    s += `<rect x="${X}" y="${Y}" width="46" height="${PH}" fill="#fffaf5"/>`;
    s += `<rect x="250" y="${Y}" width="16" height="${PH}" fill="#fbe6d2"/>`;
    for (let i = 0; i < 8; i++) {
      const y = Y + i * 19;
      s += pth(`M250,${y} L227,${y} Q220,${y + 9.5} 227,${y + 19} L250,${y + 19} Z`, '#f9cfc8', INK, 1.4);
      s += circ(241, y + 9.5, 3.4, '#8f6fc8', '#5b3f99', 1);
    }
    let m = `<rect x="0" y="0" width="64" height="${PH}" fill="url(#g-l5a-mus)"/>`;
    for (let c = 0; c < 6; c++) for (let j = 0; j < 4; j++) {
      const x = 2 + c * 12, y = (c % 2 ? 0 : 31) + j * 62;
      m += pth(`M${x},${y - 30} Q${x + 6},${y} ${x},${y + 30} Q${x - 6},${y} ${x},${y - 30}Z`, '#ee968a', '#a8443c', 1.1);
      m += `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="5" fill="#8a3f5a"/>`;
    }
    s += `<svg x="266" y="${Y}" width="64" height="${PH}">${m}</svg>`;
    s += line2([[250, Y], [250, Y + PH]], INK, 1.4) + line2([[266, Y], [266, Y + PH]], INK, 1.4);
    s += `<rect x="${X}" y="${Y}" width="150" height="${PH}" fill="none" stroke="${INK}" stroke-width="2"/>`;
    const lab = (t, x, y, tx, ty, up) => {
      if (t == null || t === '') return '';
      t = String(t);
      const y1 = up ? y + 11 : y - 11;
      return leader(x, y1, tx, ty) + dot(tx, ty) + (t.length <= 2 ? badge(x, y, t) : T(x, y, t, { size: 14, weight: 600 }));
    };
    s += lab(lb.inside, 205, 24, 201, 62, true);
    s += lab(lb.epi, 232, 218, 238, 186, false);
    s += lab(lb.muscle, 300, 218, 298, 186, false);
    return svg(380, 234, s, '위와 위벽을 확대한 그림');
  };

  // ■ FIG.l5a_leaf(p) : 잎 단면의 윗부분(표피조직 한 층과 울타리조직)과 울타리조직의 세포 하나를 확대한 그림. 폭 380, 높이 230
  //   울타리조직 아래쪽은 잘라 내어 그리지 않는다.
  //   marks : {epi:'A', pal:'B', cell:'C'} 기호. 비우면 그 기호를 붙이지 않는다.
  //   names : false면 '표피조직', '울타리조직' 이름표를 쓰지 않고 기호만 붙인다.
  FIG.l5a_leaf = p => {
    p = p || {};
    const mk = p.marks && typeof p.marks === 'object' ? p.marks : { epi: 'A', pal: 'B', cell: 'C' };
    const names = p.names !== false, X0 = 116, WALL = '#4f7a3a';
    let s = '';
    // 잘린 아래쪽 가장자리
    const cut = [[116, 171], [128, 177], [140, 169], [152, 176], [164, 170], [176, 177], [188, 169], [200, 176], [212, 170], [224, 177], [236, 169], [248, 176], [260, 170]];
    s += poly([[116, 160], [260, 160]].concat(cut.slice().reverse()), '#eef6dd', { stroke: 'none', sw: 0 }) + line2(cut, SUB, 1.3, { dash: '4 3' });
    // 울타리조직: 길쭉한 세포 8개
    for (let i = 0; i < 8; i++) {
      const x = X0 + i * 18, xc = x + 9, ny = 71 + ((i * 3) % 5 + 1) * 14;
      s += `<rect x="${x}" y="54" width="18" height="106" rx="5" fill="#e6f3c9" stroke="${WALL}" stroke-width="1.6"/>`;
      for (let k = 0; k < 7; k++) {
        const cx = xc + ((k + i) % 2 ? 4.3 : -4.3), cy = 64 + k * 14;
        s += `<ellipse cx="${r2(cx)}" cy="${cy}" rx="2.4" ry="3.6" fill="#5cb85c" stroke="#2b7a36" stroke-width="1"/>`;
      }
      s += circ(xc, ny, 3, '#b18fdc', '#6b46b0', 1);
    }
    // 표피조직: 납작한 세포 한 층
    for (let i = 0; i < 6; i++) {
      const x = X0 + i * 24;
      s += `<rect x="${x}" y="30" width="24" height="24" rx="4" fill="#f5f9ea" stroke="${WALL}" stroke-width="1.6"/>` + circ(x + 16, 43, 2.8, '#b18fdc', '#6b46b0', 1);
    }
    s += line2([[X0, 30], [X0 + 144, 30]], WALL, 3);
    // 확대할 세포 표시와 확대 그림
    s += `<rect x="242" y="54" width="18" height="106" rx="5" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
    s += line2([[260, 56], [310, 38]], SUB, 1.3, { dash: '4 3' }) + line2([[260, 158], [310, 194]], SUB, 1.3, { dash: '4 3' });
    s += `<rect x="310" y="36" width="50" height="160" rx="11" fill="#a9cc78" stroke="${INK}" stroke-width="2"/>`;
    s += `<rect x="315" y="41" width="40" height="150" rx="8" fill="#f1f8dc" stroke="#c2571a" stroke-width="1.5"/>`;
    [[335, 52, 0], [324, 74, 85], [346, 92, 95], [324, 112, 80], [346, 128, 100], [337, 177, 10]].forEach(c => {
      let st = '';
      [-4.5, -1.5, 1.5, 4.5].forEach(dx => { const h = 5 * Math.sqrt(1 - (dx / 9) * (dx / 9)) * 0.7; st += line2([[dx, -h], [dx, h]], '#1d6b31', 1.1); });
      s += `<g transform="translate(${c[0]} ${c[1]}) rotate(${c[2]})"><ellipse rx="9" ry="5" fill="url(#g-l5a-chl)" stroke="${INK}" stroke-width="1.5"/>${st}</g>`;
    });
    s += circ(332, 152, 10, 'url(#g-l5a-nuc)', INK, 1.8) + circ(334.5, 150, 3.4, '#6b46b0');
    // 기호와 이름표
    const side = (m, name, y, tx) => {
      const hasM = m != null && m !== '';
      let o = '', x1 = 4;
      if (hasM) { o += badge(16, y, String(m)); x1 = 29; }
      if (names) { o += T(x1 + 2, y, name, { size: 14, weight: 600, anchor: 'start' }); x1 += 4 + name.length * 14; }
      if (hasM || names) o += leader(x1 + 2, y, tx, y) + dot(tx, y);
      return o;
    };
    s += side(mk.epi, '표피조직', 42, 124) + side(mk.pal, '울타리조직', 107, 125);
    if (mk.cell != null && mk.cell !== '') s += leader(335, 203, 335, 188) + dot(335, 188) + badge(335, 214, String(mk.cell));
    return svg(380, 230, s, '잎 단면의 윗부분과 세포 하나를 확대한 그림');
  };

  // ■ FIG.l5a_blocks(p) : 블록으로 모형 꽃을 만드는 네 단계(2×2 판, 폭 364, 높이 236)
  //   panels : [{k, tag}] 최대 4개. 놓는 순서대로 왼쪽 위, 오른쪽 위, 왼쪽 아래, 오른쪽 아래.
  //     k  'one'(블록 한 개) | 'bundle'(모양이 같은 블록 넷을 이은 묶음) | 'part'(빨간 묶음 여섯과 노란 묶음으로 만든 꽃 부품)
  //        | 'whole'(꽃 부품, 줄기, 잎, 화분 부품을 모아 완성한 모형 꽃)
  //     tag 판 왼쪽 위 이름('(가)' 등)
  FIG.l5a_blocks = p => {
    p = p || {};
    const RED = '#e8635c', YEL = '#f5c84c', GRN = '#58b368', BRN = '#b07a45';
    const brick = (x, y, w, h, c, sw) => `<rect x="${r2(x + w * 0.28)}" y="${r2(y - h * 0.24)}" width="${r2(w * 0.44)}" height="${r2(h * 0.3)}" fill="${c}" stroke="${INK}" stroke-width="${r2(sw * 0.85)}"/>` +
      `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="1.2" fill="${c}" stroke="${INK}" stroke-width="${sw}"/>` +
      `<rect x="${r2(x + w * 0.12)}" y="${r2(y + h * 0.14)}" width="${r2(w * 0.76)}" height="${r2(h * 0.2)}" fill="#fff" opacity=".35"/>`;
    const strip = (n, w, h, c, sw) => { let o = ''; for (let i = 0; i < n; i++) o += brick(i * w, -h / 2, w, h, c, sw); return o; };
    const head = (cx, cy, k) => {
      const sw = r2(1.4 / k); let o = '';
      for (let a = 0; a < 360; a += 60) o += `<g transform="rotate(${a}) translate(9 0)">${strip(4, 10, 8, RED, sw)}</g>`;
      o += brick(-8, -7, 8, 7, YEL, sw) + brick(0, -7, 8, 7, YEL, sw) + brick(-8, 0, 8, 7, YEL, sw) + brick(0, 0, 8, 7, YEL, sw);
      return `<g transform="translate(${cx} ${cy}) scale(${k})">${o}</g>`;
    };
    const SC = {
      one: () => brick(76, 50, 24, 18, RED, 1.6),
      bundle: () => `<g transform="translate(40 59)">${strip(4, 24, 18, RED, 1.6)}</g>`,
      part: () => head(88, 58, 1),
      whole: () => {
        let o = '';
        for (let i = 3; i >= 0; i--) o += brick(83, 50 + i * 9, 10, 9, GRN, 1.3);
        o += `<g transform="translate(93 76) rotate(-30)">${strip(3, 9, 6, GRN, 1.2)}</g><g transform="translate(83 76) rotate(210)">${strip(3, 9, 6, GRN, 1.2)}</g>`;
        o += brick(76, 96, 12, 10, BRN, 1.3) + brick(88, 96, 12, 10, BRN, 1.3);
        o += brick(70, 86, 12, 10, BRN, 1.3) + brick(82, 86, 12, 10, BRN, 1.3) + brick(94, 86, 12, 10, BRN, 1.3);
        return o + head(88, 30, 0.5);
      },
    };
    let list = (Array.isArray(p.panels) ? p.panels : []).filter(q => q && Object.prototype.hasOwnProperty.call(SC, q.k)).slice(0, 4);
    if (!list.length) list = [{ k: 'one', tag: '(가)' }, { k: 'bundle', tag: '(나)' }, { k: 'part', tag: '(다)' }, { k: 'whole', tag: '(라)' }];
    const PW = 176, PH = 112, G = 8, cols = list.length === 1 ? 1 : 2;
    let s = '';
    list.forEach((q, i) => {
      const x = 2 + (i % cols) * (PW + G), y = 2 + Math.floor(i / cols) * (PH + G);
      s += box(x, y, PW, PH, { fill: 'url(#g-paper)', sw: 1.6, r: 8 }) + K.move(x, y, SC[q.k]());
      if (q.tag) s += T(x + 21, y + 15, String(q.tag), { size: 15, weight: 700 });
    });
    const rows = Math.ceil(list.length / cols);
    return svg(cols * (PW + G) - G + 4, rows * (PH + G) - G + 4, s, '블록으로 모형 꽃을 만드는 단계');
  };

  // ■ FIG.l5a_plant(p) : 식물 한 포기(뿌리, 줄기, 잎)에서 일부를 색으로 칠한 그림(그림 보기용, 폭 170, 높이 200)
  //   paint : 색칠할 부분 배열. 'root' | 'stem' | 'leaf' | 'all'. 칠하지 않은 부분은 흰색이다.
  //   예) FIG.l5a_plant({paint:['root','stem','leaf']}), FIG.l5a_plant({paint:['leaf']})
  FIG.l5a_plant = p => {
    p = p || {};
    const list = Array.isArray(p.paint) ? p.paint : (p.paint ? [p.paint] : []);
    const on = k => list.includes(k) || list.includes('all');
    const f = k => (on(k) ? '#ef7d57' : '#ffffff'), v = k => (on(k) ? '#a8401f' : '#98a2b3');
    let s = `<rect x="0" y="120" width="170" height="80" fill="#efe4d2"/>` + line2([[0, 120], [170, 120]], '#8a6d4b', 2, { cap: 'butt' });
    ['M83,134 Q70,140 58,153', 'M87,141 Q104,149 114,163', 'M84,156 Q73,165 67,179', 'M86,164 Q98,172 103,186'].forEach(d => {
      s += pth(d, 'none', INK, 6.5) + pth(d, 'none', f('root'), 3);
    });
    s += poly([[81, 120], [89, 120], [85, 193]], f('root'));
    s += poly([[81, 121], [89, 121], [87.5, 28], [82.5, 28]], f('stem'));
    [[88, 96, -25, 52], [82, 82, 205, 52], [88, 62, -35, 44], [82, 50, 215, 40], [85, 29, -90, 26]].forEach(q => {
      const L = q[3];
      s += `<g transform="translate(${q[0]} ${q[1]}) rotate(${q[2]})">` +
        pth(`M0,0 Q${r2(L * 0.35)},${r2(-L * 0.36)} ${L},0 Q${r2(L * 0.35)},${r2(L * 0.36)} 0,0Z`, f('leaf'), INK, 2) +
        pth(`M4,0 L${r2(L * 0.82)},0`, 'none', v('leaf'), 1.3) + '</g>';
    });
    return svg(170, 200, s, '식물의 몸에서 일부를 색칠한 그림');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<radialGradient id="g-l5b-sto" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#fde6e1"/><stop offset="1" stop-color="#f0a399"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l5b-liv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9805f"/><stop offset="1" stop-color="#a85a40"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l5b-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f8fa"/><stop offset="1" stop-color="#eceff4"/></linearGradient>');

  // ■ FIG.l5b_digest(p) : 사람의 소화계(몸통 윤곽 속의 식도, 간, 위, 이자, 작은창자, 큰창자, 항문). 폭 380, 높이 250
  //   이름표는 몸통 바깥 양쪽 여백에 두고 지시선으로 잇는다. '소화계'라는 말과 단계 이름은 그림에 쓰지 않는다.
  //   labels : {eso, liver, large, stomach, pancreas, small, anus} 이름표 글을 바꾼다.
  //            1~2글자면 기호 배지, ''이면 그 이름표를 그리지 않는다. 기본은 기관 이름 그대로.
  //   예) FIG.l5b_digest({}), FIG.l5b_digest({labels:{liver:'A', pancreas:'B', stomach:''}})
  FIG.l5b_digest = p => {
    p = p || {};
    const lb = Object.assign({ eso: '식도', liver: '간', large: '큰창자', stomach: '위', pancreas: '이자', small: '작은창자', anus: '항문' },
      p.labels && typeof p.labels === 'object' ? p.labels : {});
    const pth = (d, fill, stroke, sw) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
    const tube = (d, w, c) => pth(d, 'none', INK, w) + pth(d, 'none', c, w - 3.6);
    const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${SUB}"/>`;
    let s = '';
    // 몸통 윤곽과 머리
    s += `<circle cx="190" cy="20" r="14" fill="url(#g-l5b-body)" stroke="#98a2b3" stroke-width="1.6"/>`;
    s += pth('M178,34 L150,44 Q134,48 134,66 L140,246 L240,246 L246,66 Q246,48 230,44 L202,34 Z', 'url(#g-l5b-body)', '#98a2b3', 1.6);
    // 식도
    s += tube('M190,26 L190,72 Q191,86 210,90', 7, '#f2a59b');
    // 간
    s += pth('M144,100 Q164,86 186,94 L180,114 Q160,122 144,116 Z', 'url(#g-l5b-liv)', INK, 1.8);
    s += pth('M166,93 Q164,104 168,116', 'none', '#8a4630', 1.2);
    // 이자(위의 아래 뒤쪽)
    s += `<ellipse cx="200" cy="137" rx="22" ry="5.5" transform="rotate(-6 200 137)" fill="#f4d98a" stroke="${INK}" stroke-width="1.6"/>`;
    // 위
    const STO = 'M-10,-38 L-2,-38 L-2,-24 C4,-36 26,-32 28,-10 C30,12 14,32 -8,32 C-18,32 -24,28 -30,26 L-34,18 C-26,20 -20,20 -14,16 C-8,10 -10,-6 -10,-22 Z';
    s += `<g transform="translate(214 112) scale(.62)">` + pth(STO, 'url(#g-l5b-sto)', INK, 3) +
      pth('M2,-18 C12,-16 16,-4 12,8 M-3,-6 C5,0 4,14 -6,20', 'none', '#d98a80', 2) + '</g>';
    // 큰창자(바깥을 두르는 굵은 관)와 항문
    const LI = 'M160,226 L160,160 Q160,152 168,152 L220,152 Q228,152 228,160 L228,214 Q228,222 220,222 L198,222 Q190,222 190,230 L190,240';
    s += tube(LI, 13, '#e8a48a');
    [172, 190, 208].forEach(y => { s += line2([[155.5, y], [164.5, y]], '#c47f66', 1.2) + line2([[223.5, y - 6], [232.5, y - 6]], '#c47f66', 1.2); });
    [180, 196, 212].forEach(x => { s += line2([[x, 147.5], [x, 156.5]], '#c47f66', 1.2); });
    // 작은창자(안쪽의 구불구불한 가는 관)
    s += tube('M210,170 Q174,165 175,174 Q176,183 208,181 Q215,190 177,191 Q172,200 207,201 Q213,208 182,209', 8, '#f7cdb2');
    // 이름표
    const lab = (t, left, y, tx, ty) => {
      if (t == null || t === '') return '';
      t = String(t);
      if (t.length <= 2 && !/[가-힣]/.test(t)) {
        const bx = left ? 106 : 274;
        return leader(left ? bx + 12 : bx - 12, y, tx, ty) + dot(tx, ty) + badge(bx, y, t);
      }
      return leader(left ? 122 : 258, y, tx, ty) + dot(tx, ty) + T(left ? 118 : 262, y, t, { size: 14, weight: 600, anchor: left ? 'end' : 'start' });
    };
    s += lab(lb.eso, true, 50, 188, 50) + lab(lb.liver, true, 104, 154, 106) + lab(lb.large, true, 196, 158, 196);
    s += lab(lb.stomach, false, 104, 222, 108) + lab(lb.pancreas, false, 140, 216, 136) + lab(lb.small, false, 180, 205, 181) + lab(lb.anus, false, 236, 193, 240);
    return svg(380, 250, s, '사람의 소화계');
  };
})(FIG);

/* ====================== 레슨 6 생물다양성, 세 가지 눈금 ====================== */
// 레슨 6 그림. tools/build.cjs가 src-figs/l6/의 00-pilot.js, 10-a.js, 20-b.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l6.js : 레슨 6 전용 그림. 시범 3문항은 공용 그림(lineup, regions, cards)만 쓰므로 틀만 둔다.
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 레슨 6 전용 그림은 FIG.l6_이름 = p => svg(...) 꼴로 여기에 보탠다.
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  K.addDefs('<linearGradient id="g-l6a-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff1fb"/><stop offset="1" stop-color="#b3daf3"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l6a-forest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#edf7e1"/><stop offset="1" stop-color="#cfe8ba"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l6a-mud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eee7d9"/><stop offset="1" stop-color="#cfc2ab"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l6a-bank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f3d6"/><stop offset="1" stop-color="#c9e2ae"/></linearGradient>');

  // 작은 생물 그림(중심 (0,0), 가로 세로 ±17 안). 공용 그림 lineup과 같은 화풍이다.
  const ST = `stroke="${INK}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
  const E = (cx, cy, rx, ry, f, x) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${ST}${x ? ' ' + x : ''}/>`;
  const D = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
  const P = (d, f) => `<path d="${d}" fill="${f}" ${ST}/>`;
  const L = (d, c, w) => `<path d="${d}" fill="none" stroke="${c || INK}" stroke-width="${w || 1.4}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const mir = s => s + `<g transform="scale(-1 1)">${s}</g>`;
  const GRN = '#6fbf5a', DGRN = '#2f8f57', BRN = '#8a5a2b';
  const IC = {
    fish: () => P('M-7,0 L-16,-7 L-13,0 L-16,7Z', '#9db7cf') + P('M0,-7 L4,-12 L8,-6Z', '#9db7cf') + P('M-8,0 C-2,-10 10,-9 15,0 C10,9 -2,10 -8,0Z', '#9db7cf') + D(10, -2, 1.4, INK) + L('M6,-5 Q3,0 6,5', INK, 1.1),
    duck: () => P('M-12,2 L-16,-3 L-9,0Z', '#f7f3e8') + P('M4,2 Q5,-4 5,-6 L10,-4 Q9,0 9,3Z', '#f7f3e8') + E(-2, 5, 12, 6.5, '#f7f3e8') + E(8, -7, 5, 5, '#f7f3e8') +
      P('M12.5,-8 L17,-6 L12.5,-4.5Z', '#f2a23a') + D(9, -8, 1.1, INK) + L('M-8,5 Q-2,1 4,5', INK, 1.1) + L('M-15,13 Q-11,11 -7,13 M-2,13.5 Q2,11.5 6,13.5 M9,13 Q12,11.5 15,13', '#5a9bd4', 1.2),
    frog: () => mir(E(-11, 10, 5, 4, GRN)) + E(0, 5, 12, 9.5, GRN) + `<ellipse cx="0" cy="8.5" rx="7" ry="4.5" fill="#e6f2c4"/>` + mir(E(-6, -6, 4.5, 4.5, GRN) + D(-6, -6, 2, INK)) + L('M-7,2 Q0,6 7,2', INK, 1.3),
    lily: () => E(0, 8, 14, 7, GRN) + L('M0,8 L11,4', INK, 1.2) + mir(P('M0,6 Q-12,1 -9,-6 Q-4,-2 0,6Z', '#f7a8c4')) + P('M0,6 Q-6,-4 0,-11 Q6,-4 0,6Z', '#fbd0df'),
    reed: () => L('M-2,16 Q-10,2 -13,-8', DGRN, 1.8) + L('M2,16 Q10,4 12,-5', DGRN, 1.8) + L('M-3,16 L-4,-8', DGRN, 1.6) + L('M4,16 L5,-3', DGRN, 1.6) + E(-4, -10, 2.6, 6.5, BRN) + E(5, -6, 2.4, 5.5, BRN),
    tree: () => P('M-2.5,5 L-3,16 L3,16 L2.5,5Z', '#a9743b') + E(-7, -1, 7, 7, '#58b368') + E(7, -1, 7, 7, '#58b368') + E(0, -9, 8, 8, '#58b368') + D(0, -2, 7.5, '#58b368'),
    crab: () => mir(L('M-8,4 L-15,2 M-8,7 L-15,8 M-7,10 L-13,13') + L('M-8,-1 L-12,-7', INK, 1.6) + E(-12, -10, 3.5, 3, '#e07a5f')) + E(0, 4, 10, 7, '#e07a5f') + mir(L('M-3,-2 L-3,-6', INK, 1.2) + D(-3, -7, 1.4, INK)),
    clam: o => P('M0,-12 C10,-12 16,-2 15,5 C13,13 -13,13 -15,5 C-16,-2 -10,-12 0,-12Z', '#e3cfae') +
      (o.pat === 'zig' ? L('M-10,-1 L-6,-5 L-2,-1 L2,-5 L6,-1 L10,-5 M-10,6 L-6,2 L-2,6 L2,2 L6,6 L10,2', '#7a5a3a', 1.5) : L('M0,-9 L-10,6 M0,-9 L-5,9 M0,-9 L0,10 M0,-9 L5,9 M0,-9 L10,6', '#7a5a3a', 1.5)),
    ladybug: o => {
      const c = o.c || '#e5484d', sc = o.sc || INK, n = o.n == null ? 7 : o.n, PR = [[6, -3], [5, 7], [9, 3]], pts = [];
      if (n % 2) pts.push([0, -5]);
      for (let i = 0; i < Math.floor(n / 2) && i < 3; i++) pts.push(PR[i], [-PR[i][0], PR[i][1]]);
      return mir(L('M9,-4 L15,-8 M11,3 L17,3 M9,10 L14,15') + L('M2,-14 L5,-17', INK, 1.1)) + E(0, -11, 6, 4, INK) + E(0, 2, 12, 13, c) + L('M0,-11 L0,15', sc, 1.2) + pts.map(q => D(q[0], q[1], 2.5, sc)).join('');
    },
  };
  const at = (k, x, y, sc, o) => `<g transform="translate(${r2(x)} ${r2(y)}) scale(${sc})">${IC[k](o || {})}</g>`;
  const rect = (x, y, w, h, f, rx) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx == null ? 8 : rx}" fill="${f}" stroke="${INK}" stroke-width="2"/>`;
  const dash = (x1, y1, x2, y2) => line2([[x1, y1], [x2, y2]], SUB, 1.4, { dash: '5 4' });

  // ■ FIG.l6a_layers(p) : 한 지역의 생물다양성을 세 줄로 나타낸 그림(폭 360, 높이 244)
  //   윗줄: 숲, 습지, 갯벌 세 장면 / 가운뎃줄: 습지를 확대한 판(서로 다른 생물) / 아랫줄: 같은 종류의 무당벌레 네 마리를 확대한 판
  //   tags : [윗줄, 가운뎃줄, 아랫줄]에 붙일 기호. 기본 ['(가)', '(나)', '(다)']
  //   예) { kind: 'l6a_layers', p: { tags: ['(나)', '(가)', '(다)'] } }
  FIG.l6a_layers = p => {
    p = p || {};
    const tg = Array.isArray(p.tags) && p.tags.length === 3 ? p.tags : ['(가)', '(나)', '(다)'];
    let s = '';
    // 윗줄: 세 장면
    const sc = [[40, 'url(#g-l6a-forest)', '숲', ['tree', 'tree', 'tree']], [148, 'url(#g-l6a-water)', '습지', ['reed', 'lily', 'duck']], [256, 'url(#g-l6a-mud)', '갯벌', ['crab', 'clam', 'clam']]];
    sc.forEach(c => {
      s += rect(c[0], 4, 100, 68, c[1]) + T(c[0] + 8, 16, c[2], { size: 14, anchor: 'start' });
      c[3].forEach((k, i) => { s += at(k, c[0] + 22 + 28 * i, 50, 0.8, i === 2 ? { pat: 'zig' } : {}); });
    });
    s += L('M262,66 q3,-3 6,0 q3,3 6,0 M318,30 q3,-3 6,0 q3,3 6,0', '#a8977b', 1.2);
    // 가운뎃줄: 습지 확대
    s += dash(148, 73, 40, 85) + dash(248, 73, 356, 85);
    s += rect(40, 86, 316, 74, 'url(#g-l6a-water)');
    s += L('M92,96 q5,-3 10,0 M246,98 q5,-3 10,0 M300,152 q5,-3 10,0 M190,153 q5,-3 10,0', '#86bfe8', 1.3);
    ['reed', 'duck', 'fish', 'lily', 'frog'].forEach((k, i) => { s += at(k, 116 + 52 * i, 121, 1.1); });
    s += L('M46,159 Q50,146 82,143', DGRN, 3) + at('ladybug', 66, 138, 0.5, { n: 7 });
    s += `<circle cx="66" cy="138" r="11.5" fill="none" stroke="${SUB}" stroke-width="1.4"/>`;
    // 아랫줄: 무당벌레 확대
    s += dash(57, 146, 41, 173) + dash(76, 144.5, 355, 173);
    s += rect(40, 174, 316, 66, 'url(#g-paper)');
    [{ n: 7 }, { n: 2 }, { n: 4, c: '#f2a23a' }, { n: 6, c: INK, sc: '#e5484d' }].forEach((o, i) => { s += at('ladybug', 79.5 + 79 * i, 207, 1.3, o); });
    [38, 123, 207].forEach((y, i) => { s += T(20, y, String(tg[i]), { size: 15, weight: 800 }); });
    return svg(360, 244, s, '한 지역의 생물다양성을 세 부분으로 나타낸 그림');
  };

  // ■ FIG.l6a_pond(p) : 작은 연못 판(그림 보기용, 폭 170, 높이 140). 생물을 격자로 놓아 겹치지 않는다.
  //   items : [[k, 개수], ...] k는 'fish' | 'duck' | 'frog' | 'lily' | 'reed'. 모두 합쳐 8까지 그린다.
  //   예) { kind: 'l6a_pond', p: { items: [['fish', 4], ['duck', 3]] } }
  FIG.l6a_pond = p => {
    p = p || {};
    const W = 170, H = 140, list = [];
    (Array.isArray(p.items) && p.items.length ? p.items : [['fish', 3]]).forEach(it => {
      if (!it || !['fish', 'duck', 'frog', 'lily', 'reed'].includes(it[0])) return;
      for (let i = 0; i < Math.max(0, it[1] | 0) && list.length < 8; i++) list.push(it[0]);
    });
    let s = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="url(#g-l6a-bank)" stroke="${INK}" stroke-width="2"/>` +
      `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="38" fill="url(#g-l6a-water)" stroke="${INK}" stroke-width="1.6"/>` +
      L('M56,20 q5,-3 10,0 M108,21 q5,-3 10,0 M50,123 q5,-3 10,0 M104,122 q5,-3 10,0', '#86bfe8', 1.3);
    const n = list.length, top = n <= 3 ? n : Math.ceil(n / 2);
    list.forEach((k, i) => {
      const first = i < top, m = first ? top : n - top, j = first ? i : i - top;
      s += at(k, W / 2 + (j - (m - 1) / 2) * 32, n <= 3 ? 70 : first ? 46 : 96, 0.8);
    });
    return svg(W, H, s, '연못에 사는 생물');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 번호 11~16은 공용 그림(regions, bars)과 표만 쓰므로 새 그림이 없다.
})(FIG);

/* ====================== 레슨 7 변이, 그리고 살아남는 것들 ====================== */
// 레슨 7 그림. tools/build.cjs가 src-figs/l7/의 00-pilot.js, 10-a.js, 20-b.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l7.js : 레슨 7 전용 그림
//
// ■ FIG.l7_groups(p) : 생물 묶음 상자. 앞의 세 묶음은 윗줄, 나머지(최대 3개)는 아랫줄에 놓는다. 폭 380, 두 줄이면 높이 232.
//   groups : [{tag, label, items: [{k, c, pat}]}] 최대 6묶음, 묶음마다 생물 최대 3개
//     tag   상자 왼쪽 위 이름('(가)' 등), label 상자 아래쪽 생물 이름
//     k     'clam'(pat 'stripe'|'zig'|'dot', c 색) | 'rabbit'(c 털색) | 'grasshopper' | 'butterfly'(c)
//           | 'fish'(c) | 'frog'(c) | 'pine' | 'mushroom'(c). 모르는 k는 건너뛴다.
//   예) { kind: 'l7_groups', p: { groups: [{ tag: '(가)', label: '바지락', items: [{ k: 'clam', pat: 'stripe' }, { k: 'clam', pat: 'zig' }] }, ...] } }
//
// ■ FIG.l7_islands(p) : 처음 무리(위 상자)와 매우 오랜 시간 뒤 두 섬의 무리(아래 두 판). 폭 380, 높이 250.
//   first : 처음 무리의 부리 모양 배열(최대 5마리). 'thick'(크고 두꺼움) | 'mid'(중간) | 'long'(가늘고 김)
//   a, b  : 왼쪽 섬, 오른쪽 섬 무리의 부리 모양 배열(최대 3마리씩)
//   foodA, foodB : 섬의 먹이 그림. 'seed'(큰 씨앗) | 'bark'(나무껍질 틈의 작은 벌레) | 'none'. 기본은 'seed', 'bark'
//   caps  : 섬 이름. 기본 ['(가)', '(나)']
//   time  : 화살표 사이 글. 기본 '매우 오랜 시간 뒤'
//   부리를 설명하는 글자는 넣지 않는다(부리 모양은 그림에서 읽는다).
//   예) { kind: 'l7_islands', p: { first: ['long','thick','mid','long','thick'], a: ['thick','thick','mid'], b: ['long','long','mid'] } }
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<linearGradient id="g-l7-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2f2fb"/><stop offset="1" stop-color="#b9dcf2"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l7-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f3d2"/><stop offset="1" stop-color="#c6e2a8"/></linearGradient>');
  K.addDefs('<radialGradient id="g-l7-bird" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f6e3cb"/><stop offset="1" stop-color="#c99866"/></radialGradient>');
  K.addDefs('<radialGradient id="g-l7-seed" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#dcab70"/><stop offset="1" stop-color="#96602d"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l7-bark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bd8a55"/><stop offset="1" stop-color="#8a5a2b"/></linearGradient>');

  // ───────── 생물 작은 그림(중심 (0,0), 가로 세로 ±17 안) ─────────
  const ST = `stroke="${INK}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;
  const E = (cx, cy, rx, ry, f, x) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${ST}${x ? ' ' + x : ''}/>`;
  const D = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
  const P = (d, f) => `<path d="${d}" fill="${f}" ${ST}/>`;
  const L = (d, c, w) => `<path d="${d}" fill="none" stroke="${c || INK}" stroke-width="${w || 1.4}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const mir = s => s + `<g transform="scale(-1 1)">${s}</g>`;
  const CRE = {
    clam(o) {
      const c = o.c || '#e3cfae', d = '#7a5a3a';
      let s = P('M0,-12 C10,-12 16,-2 15,5 C13,13 -13,13 -15,5 C-16,-2 -10,-12 0,-12Z', c);
      if (o.pat === 'stripe') s += L('M0,-9 L-10,6 M0,-9 L-5,9 M0,-9 L0,10 M0,-9 L5,9 M0,-9 L10,6', d, 1.5);
      else if (o.pat === 'zig') s += L('M-10,-1 L-6,-5 L-2,-1 L2,-5 L6,-1 L10,-5 M-10,6 L-6,2 L-2,6 L2,2 L6,6 L10,2', d, 1.5);
      else if (o.pat === 'dot') s += [[-7, -2], [0, -5], [7, -2], [-4, 5], [4, 5], [0, 0], [-9, 5], [9, 5]].map(q => D(q[0], q[1], 1.5, d)).join('');
      return s + E(0, -11.5, 2.6, 1.6, c);
    },
    rabbit(o) {
      const c = o.c || '#f6f3ee';
      return E(-4, -10, 3, 7, c, 'transform="rotate(-12 -4 -10)"') + E(4, -10, 3, 7, c, 'transform="rotate(12 4 -10)"') +
        E(0, 9, 9.5, 7.5, c) + E(-5, 15, 4, 2, c) + E(5, 15, 4, 2, c) + E(0, -1, 7.5, 7, c) +
        D(-3, -2, 1.2, INK) + D(3, -2, 1.2, INK) + D(0, 1.5, 1.1, '#e58a9b');
    },
    grasshopper() {
      return L('M14,-4 Q17,-10 13,-13', INK, 1.1) + L('M6,4 L5,10 L8,12 M1,4 L-1,10 L2,12') + P('M-15,2 Q-6,-5 10,-3 L12,4 Q0,7 -15,2Z', '#7cb342') +
        E(12.5, -1, 3.8, 5, '#7cb342') + D(13.5, -2.5, 1.2, INK) + L('M-13,1.5 Q-2,-2 8,-1', INK, 1) +
        P('M-1,2 L-9,-11 L-6,-11 L3,1Z', '#9ccc65') + L('M-8,-11 L-13,10 L-10,11');
    },
    butterfly(o) {
      const c = o.c || '#f2a23a';
      return mir(P('M0,-2 C-5,-15 -17,-14 -15,-4 C-14,1 -6,1 0,0Z', c) + P('M0,0 C-8,1 -14,6 -10,12 C-6,15 -2,8 0,3Z', c) + D(-10, -7, 2, '#fff') + D(-8, 8, 1.5, '#fff') +
        L('M-0.5,-7 Q-4,-12 -6,-15', INK, 1.1)) + E(0, 0, 1.8, 8, INK);
    },
    fish(o) {
      const c = o.c || '#9db7cf';
      return P('M-7,0 L-16,-7 L-13,0 L-16,7Z', c) + P('M0,-7 L4,-12 L8,-6Z', c) + P('M-8,0 C-2,-10 10,-9 15,0 C10,9 -2,10 -8,0Z', c) +
        D(10, -2, 1.4, INK) + L('M6,-5 Q3,0 6,5', INK, 1.1);
    },
    frog(o) {
      const g = o.c || '#6fbf5a';
      return mir(E(-11, 10, 5, 4, g)) + E(0, 5, 12, 9.5, g) + `<ellipse cx="0" cy="8.5" rx="7" ry="4.5" fill="#e6f2c4"/>` +
        mir(E(-6, -6, 4.5, 4.5, g) + D(-6, -6, 2, INK)) + L('M-7,2 Q0,6 7,2', INK, 1.3);
    },
    pine() {
      const g = '#2f8f57';
      return P('M-2,10 L-2,16 L2,16 L2,10Z', '#a9743b') + P('M0,-3 L-12,11 L12,11Z', g) + P('M0,-10 L-10,3 L10,3Z', g) + P('M0,-17 L-7,-5 L7,-5Z', g);
    },
    mushroom(o) {
      return P('M-4,2 L-5,14 Q0,17 5,14 L4,2Z', '#f3ead7') + P('M-14,3 C-14,-15 14,-15 14,3 Q0,-1 -14,3Z', o.c || '#c0703a') +
        D(-5, -5, 1.8, '#f6e7c8') + D(4, -7, 1.6, '#f6e7c8') + D(7, -1.5, 1.4, '#f6e7c8');
    },
  };
  const hasK = k => Object.prototype.hasOwnProperty.call(CRE, k);

  // ───────── FIG.l7_groups ─────────
  FIG.l7_groups = p => {
    p = p || {};
    let gs = (Array.isArray(p.groups) ? p.groups : []).filter(g => g && typeof g === 'object').slice(0, 6);
    if (!gs.length) gs = [{ tag: '(가)', items: [{ k: 'clam', pat: 'stripe' }, { k: 'clam', pat: 'zig' }, { k: 'clam', pat: 'dot' }] }];
    const BH = 108, G = 6, RG = 8;
    const rows = [gs.slice(0, 3), gs.slice(3)].filter(r => r.length);
    let s = '';
    rows.forEach((row, ri) => {
      const n = row.length, bw = (372 - G * (n - 1)) / n, y = 4 + ri * (BH + RG);
      row.forEach((g, i) => {
        const x = 4 + i * (bw + G);
        const items = (Array.isArray(g.items) ? g.items : []).filter(it => it && hasK(it.k)).slice(0, 3);
        const m = Math.max(1, items.length), slot = Math.min(70, (bw - 12) / m), k = Math.min(1.5, slot / 35);
        s += box(x, y, bw, BH, { fill: 'url(#g-paper)', stroke: '#9aa6b8', sw: 1.6, r: 10 });
        items.forEach((it, j) => {
          s += `<g transform="translate(${r2(x + bw / 2 + (j - (m - 1) / 2) * slot)} ${y + 51}) scale(${r2(k)})">${CRE[it.k](it)}</g>`;
        });
        if (g.tag) s += T(x + 21, y + 16, String(g.tag), { size: 15, weight: 700 });
        if (g.label) s += T(x + bw / 2, y + 92, String(g.label), { size: 14, weight: 600 });
      });
    });
    return svg(380, rows.length * (BH + RG), s, '생물을 묶음별로 나타낸 그림');
  };

  // ───────── FIG.l7_islands ─────────
  // 부리: [길이(머리 속에 묻힌 4 포함), 뿌리 쪽 반높이]
  const BEAK = { thick: [17, 7.5], mid: [13, 3.2], long: [26, 2.4] };
  // 새 한 마리(오른쪽을 본다). 원점 기준 가로 -23 ~ +40, 세로 -18 ~ +20
  function bird(x, y, kind) {
    const b = BEAK[kind] || BEAK.mid, len = b[0], hh = b[1], bx = 14, cy = -7;
    let s = line2([[-5, 11], [-5, 20], [-1.5, 20]], INK, 1.6) + line2([[2, 11], [2, 20], [5.5, 20]], INK, 1.6);
    s += poly([[-13, 2], [-23, -3], [-22, 8]], '#b98c5e', { sw: 1.6 });
    s += `<ellipse cx="-3" cy="4" rx="13" ry="9.5" fill="url(#g-l7-bird)" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<path d="M-10,3 Q-3,-3 5,4 Q-2,10 -10,3Z" fill="#a8774a" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`;
    s += `<path d="M${bx},${r2(cy - hh)} Q${r2(bx + len * 0.65)},${r2(cy - hh)} ${r2(bx + len)},${r2(cy + 0.5)} Q${r2(bx + len * 0.6)},${r2(cy + hh * 0.9)} ${bx},${r2(cy + hh)}Z" fill="#f4b23e" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += `<circle cx="8" cy="-8" r="10" fill="url(#g-l7-bird)" stroke="${INK}" stroke-width="1.8"/>`;
    s += line2([[19, cy + 0.4], [bx + len * 0.82, cy + 0.5]], '#8a5a14', 1.1);
    s += `<circle cx="10" cy="-10.5" r="1.8" fill="${INK}"/>`;
    return K.move(x, y, s);
  }
  // 큰 씨앗
  const seed = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="7.5" ry="5.5" fill="url(#g-l7-seed)" stroke="${INK}" stroke-width="1.6"/>` +
    `<path d="M-5.5,0 Q0,-2.5 5.5,0" fill="none" stroke="#6b4420" stroke-width="1.2"/><ellipse cx="-2.5" cy="-2.6" rx="2" ry="1" fill="#fff" opacity=".5"/></g>`;
  const FOOD = {
    seed: () => [[30, 30, -20], [35, 48, 25], [28, 66, 10], [35, 84, -30]].map(c => seed(c[0], c[1], c[2])).join(''),
    bark: () => {
      let s = poly([[19, 94], [22, 36], [40, 36], [43, 94]], 'url(#g-l7-bark)');
      s += line2([[25.5, 42], [24, 90]], '#7a4f22', 1.1) + line2([[36.5, 42], [38, 90]], '#7a4f22', 1.1);
      [[27.5, 48], [34, 60], [27.5, 72], [34, 84]].forEach(c => {
        s += `<path d="M${c[0] - 5.5},${c[1]} Q${c[0]},${c[1] - 4.5} ${c[0] + 5.5},${c[1]} Q${c[0]},${c[1] + 4.5} ${c[0] - 5.5},${c[1]}Z" fill="#4a2f15"/>` +
          `<ellipse cx="${c[0]}" cy="${c[1]}" rx="3.2" ry="1.7" fill="#f7e9c6" stroke="${INK}" stroke-width="1"/><circle cx="${c[0] + 2.4}" cy="${c[1]}" r=".9" fill="${INK}"/>`;
      });
      [[22, 30, 9], [38, 30, 9], [30, 22, 10]].forEach(c => { s += `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="#58b368" stroke="${INK}" stroke-width="1.6"/>`; });
      return s + `<circle cx="30" cy="29" r="8" fill="#58b368"/>`;
    },
    none: () => '',
  };
  const POS = [[75, 33], [130, 56], [75, 80]];
  // 섬 한 판(182×114)
  function island(food, kinds) {
    let s = `<rect x="0" y="0" width="182" height="114" rx="10" fill="url(#g-l7-sea)" stroke="${INK}" stroke-width="2"/>`;
    [[5, 9], [163, 9], [5, 105], [163, 105]].forEach(c => { s += `<path d="M${c[0]},${c[1]} q3,-3 6,0 q3,3 6,0" fill="none" stroke="#86bfe8" stroke-width="1.3" stroke-linecap="round"/>`; });
    s += `<rect x="8" y="8" width="166" height="98" rx="30" fill="#f3e4b8" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<rect x="14" y="14" width="154" height="86" rx="25" fill="url(#g-l7-land)"/>`;
    s += (Object.prototype.hasOwnProperty.call(FOOD, food) ? FOOD[food] : FOOD.none)();
    kinds.slice(0, 3).forEach((k, i) => { s += bird(POS[i][0], POS[i][1], k); });
    return s;
  }

  FIG.l7_islands = p => {
    p = p || {};
    const pick = (a, d) => (Array.isArray(a) && a.length ? a : d);
    const first = pick(p.first, ['long', 'thick', 'mid', 'long', 'thick']).slice(0, 5);
    const ka = pick(p.a, ['thick', 'thick', 'mid']), kb = pick(p.b, ['long', 'long', 'mid']);
    const caps = pick(p.caps, ['(가)', '(나)']);
    let s = box(4, 4, 372, 82, { fill: 'url(#g-paper)', r: 10 });
    s += T(190, 18, '처음 무리', { size: 14, weight: 700 });
    const slot = 368 / first.length;
    first.forEach((k, i) => { s += bird(r2(6 + slot * (i + 0.5) - 8.5), 52, k); });
    s += arrow(112, 89, 95, 110) + arrow(268, 89, 285, 110);
    s += T(190, 100, p.time || '매우 오랜 시간 뒤', { size: 14 });
    s += K.move(4, 114, island(p.foodA || 'seed', ka)) + K.move(194, 114, island(p.foodB || 'bark', kb));
    s += caption(95, 240, String(caps[0] || '')) + caption(285, 240, String(caps[1] || ''));
    return svg(380, 250, s, '처음 무리와 오랜 시간 뒤 두 섬의 새 무리');
  };
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // ■ FIG.l7a_leaves(p) : 잎의 두께가 다른 한 종류의 풀 세 포기와 잎의 단면. 폭 380, 높이 236.
  //   thick : 세 포기의 잎 단면 반두께 배열(2~14). 기본 [13, 7.5, 3]
  //   tags  : 기호 배열. 기본 ['A', 'B', 'C']
  K.addDefs('<linearGradient id="g-l7a-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e07f"/><stop offset="1" stop-color="#4aa552"/></linearGradient>');
  FIG.l7a_leaves = p => {
    p = p || {};
    const th = Array.isArray(p.thick) && p.thick.length ? p.thick : [13, 7.5, 3];
    const tags = Array.isArray(p.tags) && p.tags.length ? p.tags : ['A', 'B', 'C'];
    let s = '';
    for (let i = 0; i < 3; i++) {
      const x = 4 + i * 126, cx = x + 60, t = Math.max(2, Math.min(14, +th[i] || 5));
      s += box(x, 4, 120, 228, { fill: 'url(#g-paper)', stroke: '#9aa6b8', sw: 1.6, r: 10 });
      s += line2([[x + 14, 134], [x + 106, 134]], '#a9743b', 3);
      s += line2([[cx, 134], [cx, 44]], '#2f8f57', 3);
      [[112, 1], [92, -1], [72, 1], [54, -1]].forEach(q => {
        const lx = cx + q[1] * 22, ly = q[0] - 8;
        s += `<ellipse cx="${lx}" cy="${ly}" rx="20" ry="7.5" transform="rotate(${-q[1] * 25} ${lx} ${ly})" fill="url(#g-l7a-leaf)" stroke="${INK}" stroke-width="1.8"/>`;
      });
      s += `<ellipse cx="${cx}" cy="36" rx="7" ry="13" fill="url(#g-l7a-leaf)" stroke="${INK}" stroke-width="1.8"/>`;
      s += badge(x + 18, 20, String(tags[i] == null ? '' : tags[i]));
      s += T(cx, 160, '잎의 단면', { size: 14 });
      s += `<ellipse cx="${cx}" cy="198" rx="42" ry="${r2(t)}" fill="url(#g-l7a-leaf)" stroke="${INK}" stroke-width="2"/>`;
      s += line2([[cx - 34, 198], [cx + 34, 198]], '#2f8f57', 1.2);
    }
    return svg(380, 236, s, '잎의 두께가 다른 한 종류의 풀 세 포기');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<linearGradient id="g-l7b-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff1fa"/><stop offset="1" stop-color="#b5d9f0"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l7b-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf5d8"/><stop offset="1" stop-color="#cbe5ae"/></linearGradient>');
  K.addDefs('<radialGradient id="g-l7b-bird" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#e3edf7"/><stop offset="1" stop-color="#8fa9c6"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l7b-dry" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf4df"/><stop offset="1" stop-color="#eedcb0"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l7b-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6e07f"/><stop offset="1" stop-color="#4aa552"/></linearGradient>');

  // ■ FIG.l7b_isles(p) : 처음 무리(위 상자)와 매우 오랜 시간 뒤 두 섬의 새 무리(아래 두 판). 먹이는 그리지 않는다. 폭 380, 높이 250.
  //   first : 처음 무리의 부리 모양 배열(최대 5마리). 'short'(짧고 굵음) | 'long'(가늘고 김)
  //   a, b  : 왼쪽 섬, 오른쪽 섬 무리의 부리 모양 배열(최대 4마리씩)
  //   caps  : 섬 이름. 기본 ['(가)', '(나)']
  //   부리를 설명하는 글자는 넣지 않는다.
  //   예) { kind: 'l7b_isles', p: { first: ['long','short','long','short','short'], a: ['long','long','short','long'], b: ['short','short','short','long'] } }
  // 새 한 마리(오른쪽을 본다). 원점 기준 가로 -22 ~ +41, 세로 -18 ~ +19
  function bird(x, y, kind) {
    let s = line2([[-4, 10], [-4, 19], [-1, 19]], INK, 1.6) + line2([[3, 10], [3, 19], [6, 19]], INK, 1.6);
    s += poly([[-12, 1], [-22, -5], [-21, 7]], '#7f98b5', { sw: 1.6 });
    s += `<ellipse cx="-2" cy="3" rx="13" ry="9" fill="url(#g-l7b-bird)" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<path d="M-9,2 Q-2,-4 6,3 Q-1,9 -9,2Z" fill="#6f8bab" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`;
    const bk = kind === 'long' ? 'M15,-10 Q30,-9.5 41,-4 Q29,-5.5 15,-5.5Z' : 'M15,-13.5 Q22,-13 26,-6.5 Q21,-1.5 15,-1Z';
    s += `<path d="${bk}" fill="#f4b23e" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += `<circle cx="8" cy="-8" r="9.5" fill="url(#g-l7b-bird)" stroke="${INK}" stroke-width="1.8"/>`;
    if (kind !== 'long') s += line2([[18, -7], [24, -6.8]], '#8a5a14', 1.1);
    s += `<circle cx="10.5" cy="-10.5" r="1.8" fill="${INK}"/>`;
    return K.move(x, y, s);
  }
  const BPOS = [[48, 34], [118, 34], [48, 76], [118, 76]];
  function isle(kinds) {
    let s = `<rect x="0" y="0" width="182" height="112" rx="10" fill="url(#g-l7b-sea)" stroke="${INK}" stroke-width="2"/>`;
    [[4, 8], [164, 8], [4, 104], [164, 104]].forEach(c => { s += `<path d="M${c[0]},${c[1]} q3,-3 6,0 q3,3 6,0" fill="none" stroke="#86bfe8" stroke-width="1.3" stroke-linecap="round"/>`; });
    s += `<rect x="8" y="8" width="166" height="96" rx="30" fill="#f3e4b8" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<rect x="14" y="14" width="154" height="84" rx="25" fill="url(#g-l7b-land)"/>`;
    [[20, 57], [161, 59]].forEach(c => { s += `<path d="M${c[0] - 3},${c[1]} l1,-6 M${c[0]},${c[1]} l0,-7 M${c[0] + 3},${c[1]} l-1,-6" fill="none" stroke="#7fb86a" stroke-width="1.3" stroke-linecap="round"/>`; });
    kinds.slice(0, 4).forEach((k, i) => { s += bird(BPOS[i][0], BPOS[i][1], k); });
    return s;
  }
  FIG.l7b_isles = p => {
    p = p || {};
    const pick = (a, d) => (Array.isArray(a) && a.length ? a : d);
    const first = pick(p.first, ['long', 'short', 'long', 'short', 'short']).slice(0, 5);
    const ka = pick(p.a, ['long', 'long', 'short', 'long']), kb = pick(p.b, ['short', 'short', 'short', 'long']);
    const caps = pick(p.caps, ['(가)', '(나)']);
    let s = box(4, 4, 372, 78, { fill: 'url(#g-paper)', r: 10 });
    s += T(190, 17, '처음 무리', { size: 14, weight: 700 });
    const slot = 364 / first.length;
    first.forEach((k, i) => { s += bird(r2(8 + slot * (i + 0.5) - 9), 51, k); });
    s += arrow(112, 86, 96, 108) + arrow(268, 86, 284, 108);
    s += T(190, 97, '매우 오랜 시간 뒤', { size: 14 });
    s += K.move(4, 112, isle(ka)) + K.move(194, 112, isle(kb));
    s += caption(95, 238, String(caps[0] || '')) + caption(285, 238, String(caps[1] || ''));
    return svg(380, 250, s, '처음 무리와 오랜 시간 뒤 두 섬의 새 무리');
  };

  // ■ FIG.l7b_meadow(p) : 잎의 두께가 다른 한 종류의 풀 무리(포기 수를 셀 수 있다)와 범례. 폭 380, 높이 186(한 줄이면 120).
  //   plants : 풀 배열(최대 12포기, 한 줄에 6포기). 'thick'(잎이 두꺼움) | 'thin'(잎이 얇음)
  //   예) { kind: 'l7b_meadow', p: { plants: ['thick','thick','thick','thick','thin','thick','thick','thick','thick','thin','thick','thick'] } }
  function plant(x, y, kind) {
    const t = kind === 'thin' ? 1.9 : 6.2, tw = kind === 'thin' ? 2 : 5.5;
    let s = line2([[-18, 22], [18, 22]], '#b08a55', 2.2) + line2([[0, 22], [0, -14]], '#2f8f57', 2.6);
    [[12, 1], [1, -1], [-9, 1]].forEach(q => {
      const lx = q[1] * 13, ly = q[0] - 3;
      s += `<ellipse cx="${lx}" cy="${ly}" rx="13" ry="${t}" transform="rotate(${-q[1] * 22} ${lx} ${ly})" fill="url(#g-l7b-leaf)" stroke="${INK}" stroke-width="1.6"/>`;
    });
    s += `<ellipse cx="0" cy="-20" rx="${tw}" ry="9" fill="url(#g-l7b-leaf)" stroke="${INK}" stroke-width="1.6"/>`;
    return K.move(x, y, s);
  }
  FIG.l7b_meadow = p => {
    p = p || {};
    let list = (Array.isArray(p.plants) ? p.plants : []).slice(0, 12);
    if (!list.length) list = ['thick', 'thick', 'thick', 'thick', 'thin', 'thick', 'thick', 'thick', 'thick', 'thin', 'thick', 'thick'];
    const rows = Math.ceil(list.length / 6), ph = rows * 66 + 6;
    let s = box(4, 4, 372, ph, { fill: 'url(#g-l7b-dry)', r: 10 });
    list.forEach((k, i) => {
      const r = Math.floor(i / 6), c = i % 6, m = r === rows - 1 ? list.length - r * 6 : 6;
      s += plant(r2(190 + (c - (m - 1) / 2) * 61), 41 + r * 66, k === 'thin' ? 'thin' : 'thick');
    });
    const ky = ph + 26;
    s += `<ellipse cx="56" cy="${ky}" rx="16" ry="7" fill="url(#g-l7b-leaf)" stroke="${INK}" stroke-width="1.8"/>`;
    s += T(80, ky, '잎이 두꺼운 풀', { size: 14, anchor: 'start' });
    s += `<ellipse cx="226" cy="${ky}" rx="16" ry="2.2" fill="url(#g-l7b-leaf)" stroke="${INK}" stroke-width="1.8"/>`;
    s += T(250, ky, '잎이 얇은 풀', { size: 14, anchor: 'start' });
    return svg(380, ph + 44, s, '잎의 두께가 다른 한 종류의 풀 무리');
  };
})(FIG);

/* ====================== 레슨 8 생물을 나누는 기준 ====================== */
// 레슨 8 그림. tools/build.cjs가 src-figs/l8/의 00-pilot.js, 10-a.js, 20-b.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l8.js : 레슨 8 전용 그림. 시범 3문항은 공용 그림(FIG.taxa)과 표만 쓰므로 틀만 둔다.
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 레슨 전용 그림이 필요해지면 FIG.l8_이름 = p => svg(...) 꼴로 여기에 보탠다.
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<linearGradient id="g-l8a-q" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6faff"/><stop offset="1" stop-color="#d7e7fa"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l8a-mask" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#ffe7a3"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l8a-kid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6fcf2"/><stop offset="1" stop-color="#d9efcf"/></linearGradient>');

  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // 글자 폭 어림(한글 1, 영문 대문자 0.7, 그 밖 0.58, 빈칸 0.3)
  const tw = (s, size) => {
    let w = 0;
    for (const ch of String(s == null ? '' : s)) {
      const c = ch.charCodeAt(0);
      w += c > 0x2000 ? 1 : ch === ' ' ? 0.3 : /[,.'!:;]/.test(ch) ? 0.3 : /[A-Z]/.test(ch) ? 0.7 : 0.58;
    }
    return w * size;
  };
  const list = a => (Array.isArray(a) ? a : []).filter(v => v != null && v !== '').map(String);

  // ■ FIG.l8a_split(p) : 질문 상자 아래에서 '예', '아니요' 두 묶음으로 갈리는 그림
  //   q   : 질문 글. '(가)'처럼 짧은 기호를 쓰면 가린 칸(노란 상자)으로 그린다. 기본 '(가)'.
  //   yes : '예' 쪽 묶음에 놓을 생물 이름 배열(위에서 아래로 한 줄에 하나)
  //   no  : '아니요' 쪽 묶음에 놓을 생물 이름 배열
  //   w   : 캔버스 폭(150~380). 그림 보기용은 170, 본문 그림은 300(기본). 이름은 4글자쯤까지 쓴다.
  //   높이는 묶음에 든 이름 수(많은 쪽)에 따라 정해진다(이름 4개일 때 폭 170에서 174).
  //   예) FIG.l8a_split({ w: 170, q: '광합성을 하는가?', yes: ['벚나무', '보리'], no: ['개', '붕어'] })
  //       FIG.l8a_split({ w: 300, q: '(가)', yes: ['고래', '박쥐', '다람쥐'], no: ['붕어', '갈매기'] })
  FIG.l8a_split = p => {
    p = p || {};
    const W = Math.max(150, Math.min(380, +p.w || 300));
    const q = p.q == null || p.q === '' ? '(가)' : String(p.q);
    const yes = list(p.yes), no = list(p.no);
    const small = W <= 200, FS = 14, NS = small ? 14 : 15, LH = small ? 20 : 22;
    const cx = W / 2, xL = r2(W * 0.27), xR = r2(W * 0.73), cw = Math.min(W * 0.46 - 6, 124);
    const masked = tw(q, FS) <= 34;
    const qw = Math.min(W - 8, Math.max(masked ? 76 : 90, tw(q, FS) + 24));
    let s = '';
    // 질문 상자
    s += box(cx - qw / 2, 4, qw, 30, { fill: masked ? 'url(#g-l8a-mask)' : 'url(#g-l8a-q)', r: 9 });
    s += T(cx, 19, esc(q), { size: masked ? 16 : FS, weight: masked ? 800 : 700, halo: false });
    // 갈림 선과 화살표
    s += line2([[cx, 34], [cx, 46]], INK, 2) + line2([[xL, 46], [xR, 46]], INK, 2);
    s += arrow(xL, 46, xL, 74, { w: 2, head: 8 }) + arrow(xR, 46, xR, 74, { w: 2, head: 8 });
    s += T(xL - 8, 61, '예', { size: FS, anchor: 'end' }) + T(xR - 8, 61, '아니요', { size: FS, anchor: 'end' });
    // 두 묶음 상자(높이는 같게)
    const n = Math.max(1, yes.length, no.length), bh = n * LH + 14, y0 = 76;
    [[xL, yes], [xR, no]].forEach(pr => {
      const x = pr[0], arr = pr[1];
      s += box(x - cw / 2, y0, cw, bh, { fill: 'url(#g-paper)', r: 9 });
      arr.forEach((t, i) => { s += T(x, y0 + 7 + (i + 0.5) * LH, esc(t), { size: NS, weight: 600, halo: false }); });
    });
    return svg(W, r2(y0 + bh + 4), s, '기준에 따라 예와 아니요로 나눈 그림');
  };

  // ■ FIG.l8a_cross(p) : 어버이 둘 사이에서 자손이 태어나는 것과 그 자손의 번식 능력을 나타낸 도식
  //   parents      : 어버이 두 칸의 글. 예) ['A(수컷)', 'B(암컷)'], ['당나귀', '말']
  //   child        : 자손 칸의 글. 예) 'C', '노새', '자손'(기본)
  //   childFertile : true면 자손 아래에 '자손을 낳을 수 있음', false면 '자손을 낳지 못함'을 쓴다. 비우면 쓰지 않는다.
  //   note         : childFertile 글을 다른 말로 바꿔 쓸 때(선택)
  //   cap          : 판 아래 이름. 예) '(가)'
  //   w            : 한 판일 때 폭(150~380, 기본 300)
  //   panels       : [{parents, child, childFertile, note, cap}] 두 판(폭 176씩)을 나란히 놓는다.
  //   예) FIG.l8a_cross({ parents: ['A(수컷)', 'B(암컷)'], child: 'C', childFertile: false })
  //       FIG.l8a_cross({ panels: [{ cap: '(가)', parents: ['진돗개', '삽살개'], child: '자손', childFertile: true },
  //                                { cap: '(나)', parents: ['당나귀', '말'], child: '노새', childFertile: false }] })
  function crossPanel(q, pw) {
    q = q && typeof q === 'object' ? q : {};
    const par = list(q.parents), a = par[0] || 'A', b = par[1] || 'B';
    const child = q.child == null || q.child === '' ? '자손' : String(q.child);
    const m = 6, gap = pw >= 260 ? 44 : 16, bw = (pw - 2 * m - gap) / 2;
    const xa = m + bw / 2, xb = pw - m - bw / 2, cx = pw / 2;
    const card = (x, y, w, t, fill) => box(x - w / 2, y, w, 36, { fill, r: 9 }) +
      T(x, y + 18, esc(t), { size: tw(t, 15) <= w - 10 ? 15 : 14, weight: 700, halo: false });
    let s = '';
    // 어버이 두 칸
    s += card(xa, 6, bw, a, 'url(#g-l8a-q)') + card(xb, 6, bw, b, 'url(#g-l8a-q)');
    // 두 칸을 잇는 선과 자손으로 내려가는 화살표
    s += line2([[xa, 43], [xa, 58], [xb, 58], [xb, 43]], INK, 2);
    s += arrow(cx, 58, cx, 84, { w: 2, head: 8 });
    // 자손 칸
    const kw = Math.min(pw - 2 * m, Math.max(bw, tw(child, 15) + 24));
    s += card(cx, 86, kw, child, 'url(#g-l8a-kid)');
    let h = 128;
    if (q.childFertile === true || q.childFertile === false) {
      const t = q.note ? String(q.note) : q.childFertile ? '자손을 낳을 수 있음' : '자손을 낳지 못함';
      const w2 = Math.min(pw - 4, tw(t, 14) + 22);
      s += leader(cx, 123, cx, 134);
      s += box(cx - w2 / 2, 134, w2, 28, { fill: '#fff', stroke: SUB, sw: 1.4, r: 14 });
      s += T(cx, 148, esc(t), { size: 14, weight: 600, halo: false });
      h = 166;
    }
    if (q.cap) { s += caption(cx, h + 12, esc(q.cap)); h += 26; }
    return { w: pw, h, body: s };
  }
  FIG.l8a_cross = p => {
    p = p || {};
    const ps = Array.isArray(p.panels) && p.panels.length ? p.panels.slice(0, 2) : null;
    if (!ps || ps.length === 1) {
      const c = crossPanel(ps ? ps[0] : p, Math.max(150, Math.min(380, +p.w || 300)));
      return svg(c.w, c.h, c.body, '어버이와 자손의 관계를 나타낸 도식');
    }
    const row = K.rowOf(ps.map(q => crossPanel(q, 176)), 8);
    return svg(row.w, row.h, row.body, '어버이와 자손의 관계를 나타낸 도식');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  // ■ FIG.l8b_nest(p) : 분류 단계 두세 겹의 포함 관계를 작은 겹친 칸으로 나타내고 그 위에 생물 기호를 놓는다(그림 보기용).
  //   levels  : 안쪽부터 바깥쪽 순서의 칸 이름. 기본 ['속','과','목']. 폭 170에서는 3칸까지 쓴다(최대 4칸, 4칸은 w 220 이상).
  //   members : [{t:'P', lv:0}, ...] 기호(1~2글자)를 놓을 칸.
  //             lv 0은 가장 안쪽 칸 안(4개까지, 한 줄에 2개씩),
  //             lv 1은 둘째 칸 안이면서 첫째 칸 밖(오른쪽 띠, 3개까지), lv 2는 셋째 칸의 오른쪽 띠.
  //   w       : 캔버스 폭(150~300, 기본 170). 높이는 칸 수로 정해진다(3칸일 때 150).
  //   예) FIG.l8b_nest({ w: 170, levels: ['속','과','목'], members: [{t:'P',lv:0},{t:'Q',lv:0},{t:'R',lv:1},{t:'S',lv:2}] })
  FIG.l8b_nest = p => {
    p = p || {};
    const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const lv = (Array.isArray(p.levels) && p.levels.length ? p.levels : ['속', '과', '목']).slice(0, 4).map(v => (v == null ? '' : String(v)));
    const n = lv.length, W = Math.max(150, Math.min(300, +p.w || 170));
    const IN = 5, SY = 26;
    const sx = n > 1 ? Math.max(30, Math.min(40, (W - 6 - IN * (n - 1) - 80) / (n - 1))) : 0;
    const H = 6 + 82 + (SY + IN) * (n - 1);
    const R = i => { const j = n - 1 - i; return { l: 3 + IN * j, t: 3 + SY * j, r: W - 3 - sx * j, b: H - 3 - IN * j }; };
    let s = '';
    const o = R(n - 1);
    s += box(o.l, o.t, o.r - o.l, o.b - o.t, { r: 11, sw: 0, stroke: 'none' });
    for (let i = n - 1; i >= 0; i--) {
      const b = R(i);
      s += `<rect x="${r2(b.l)}" y="${r2(b.t)}" width="${r2(b.r - b.l)}" height="${r2(b.b - b.t)}" rx="9" fill="#2f7fe0" fill-opacity=".09" stroke="${INK}" stroke-width="2"/>`;
    }
    for (let i = 0; i < n; i++) {
      const b = R(i);
      if (lv[i] !== '') s += T(b.l + 8, b.t + SY / 2, esc(lv[i]), { size: 14, weight: 700, anchor: 'start' });
    }
    const groups = {};
    (Array.isArray(p.members) ? p.members : []).forEach(m => {
      if (!m || m.t == null || m.t === '') return;
      const k = Math.round(+m.lv || 0);
      if (k < 0 || k >= n) return;
      (groups[k] = groups[k] || []).push(String(m.t));
    });
    Object.keys(groups).forEach(key => {
      const k = +key, b = R(k);
      if (k === 0) {
        const g = groups[k].slice(0, 4), rows = Math.ceil(g.length / 2), cy = b.t + SY + (b.b - b.t - SY) / 2;
        for (let r = 0; r < rows; r++) {
          const part = g.slice(r * 2, r * 2 + 2), y = cy + (r - (rows - 1) / 2) * 26;
          part.forEach((t, i) => { s += badge(b.l + (b.r - b.l) * (i + 1) / (part.length + 1), y, esc(t)); });
        }
      } else {
        const g = groups[k].slice(0, 3), x = b.r - sx / 2, mid = (b.t + b.b) / 2;
        g.forEach((t, i) => { s += badge(x, mid + (i - (g.length - 1) / 2) * 26, esc(t)); });
      }
    });
    return svg(W, H, s, '분류 단계의 포함 관계 위에 생물 기호를 놓은 그림');
  };
})(FIG);

/* ====================== 레슨 9 다섯 개의 왕국, 5계 ====================== */
// 레슨 9 그림. tools/build.cjs가 src-figs/l9/의 00-pilot.js, 10-a.js, 20-b.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l9.js : 레슨 9 전용 그림. 시범 3문항은 공용 그림 FIG.flow만 쓰므로 틀만 둔다.
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<linearGradient id="g-l9a-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9e08a"/><stop offset="1" stop-color="#4ea653"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l9a-kelp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6f2c"/><stop offset=".5" stop-color="#b3964a"/><stop offset="1" stop-color="#7a6126"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l9a-rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d5d9df"/><stop offset="1" stop-color="#9aa3af"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l9a-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f9fe"/><stop offset="1" stop-color="#d3ebf9"/></linearGradient>');
  K.addDefs('<radialGradient id="g-l9a-mold" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2f7f86"/><stop offset=".65" stop-color="#5fb0a6"/><stop offset="1" stop-color="#cfeee3"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l9a-anem" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ef8f8a"/><stop offset=".5" stop-color="#f9bdb6"/><stop offset="1" stop-color="#e57f7b"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l9a-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dfe8"/><stop offset="1" stop-color="#aab4c2"/></linearGradient>');
  K.addDefs('<radialGradient id="g-l9a-cyto" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#f8e3c8"/></radialGradient>');
  K.addDefs('<radialGradient id="g-l9a-nuc" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#faf4ff"/><stop offset="1" stop-color="#dcc8f3"/></radialGradient>');

  const P = (d, fill, sw, stroke) => `<path d="${d}" fill="${fill}" stroke="${stroke || INK}" stroke-width="${sw == null ? 2 : sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const S = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const tube = (d, c, w) => S(d, INK, w + 3) + S(d, c, w);
  const dotAt = (x, y) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="2.2" fill="${SUB}"/>`;
  const blob = pts => {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s0 = mid(pts[n - 1], pts[0]);
    let d = `M${r2(s0[0])},${r2(s0[1])}`;
    for (let i = 0; i < n; i++) { const q = mid(pts[i], pts[(i + 1) % n]); d += ` Q${r2(pts[i][0])},${r2(pts[i][1])} ${r2(q[0])},${r2(q[1])}`; }
    return d + 'Z';
  };

  // ■ FIG.l9a_life(p) : 생물 한 가지를 그린 작은 판(폭 170, 높이 150). 그림 보기용.
  //   k    : 'fern'(고사리 잎과 어린 순) | 'kelp'(바위에 붙은 다시마) | 'mold'(빵에 핀 푸른곰팡이)
  //          | 'anemone'(바위에 붙은 말미잘) | 'liverwort'(우산이끼). 모르는 k는 'fern'으로 그린다.
  //   name : 판 아래에 쓰는 생물 이름(없으면 쓰지 않는다). 계 이름은 넣지 않는다.
  //   예) { kind: 'l9a_life', p: { k: 'mold', name: '푸른곰팡이' } }
  const LIFE = {
    fern() {
      let s = S('M22,116 H148', '#a9743b', 2.4);
      for (let i = 0; i < 9; i++) {
        const t = i / 8, y = 96 - 74 * t, x = 84 + 3.6 * t, len = 9 + 43 * Math.pow(1 - t, 0.85), w = 1.8 + len * 0.07;
        const leaf = P(`M0,0 Q${r2(len * 0.35)},${r2(-w)} ${r2(len)},0 Q${r2(len * 0.35)},${r2(w)} 0,0Z`, 'url(#g-l9a-leaf)', 1.5) + S(`M2,0 H${r2(len - 3)}`, '#2f7a3a', 1.1);
        s += `<g transform="translate(${r2(x)} ${r2(y)}) rotate(-22)">${leaf}</g><g transform="translate(${r2(x)} ${r2(y)}) scale(-1 1) rotate(-22)">${leaf}</g>`;
      }
      s += tube('M84,116 Q83,64 88,15', '#3f8f46', 2.4);
      s += tube('M126,116 Q122,108 124,102 a5,5 0 1,1 7,3 a3,3 0 1,1 -4,-2', '#5fae54', 2.4);
      return s;
    },
    kelp() {
      let s = S('M12,22 q5,-3 10,0 q5,3 10,0 M136,30 q5,-3 10,0 q5,3 10,0 M16,70 q5,-3 10,0 q5,3 10,0', '#86bfe8', 1.6);
      s += P('M46,118 Q58,103 85,105 Q114,103 124,118Z', 'url(#g-l9a-rock)');
      const hold = 'M85,98 Q76,102 70,108 M85,98 Q82,104 79,110 M85,98 Q88,104 91,110 M85,98 Q94,102 100,108';
      s += S(hold, INK, 4.8) + S(hold, '#8a6a2a', 2.2) + tube('M85,99 L85,84', '#8a6a2a', 3.4);
      const R = [], Lf = [], mid = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12, y = 85 - 74 * u, c = 85 + 5 * Math.sin(u * 3.2), hw = 3 + 19 * Math.pow(Math.sin(Math.PI * (0.06 + 0.9 * u)), 0.7);
        R.push([c + hw + 2.4 * Math.sin(i * 1.9), y]); Lf.push([c - hw + 2.4 * Math.sin(i * 1.9 + 1), y]); mid.push([c, y]);
      }
      s += P(blob(R.concat(Lf.reverse())), 'url(#g-l9a-kelp)');
      s += line2(mid.slice(1, 12), '#d9c27a', 1.8);
      return s;
    },
    mold() {
      let s = P('M40,108 L40,56 Q30,50 34,36 Q40,16 85,16 Q130,16 136,36 Q140,50 130,56 L130,108 Q85,112 40,108Z', '#c98a4a');
      s += P('M46,103 L46,54 Q37,48 40,38 Q46,22 85,22 Q124,22 130,38 Q133,48 124,54 L124,103 Q85,106 46,103Z', '#f7e7c4', 1.2, '#b07a3e');
      [[94, 36], [112, 44], [56, 70], [88, 58], [100, 94], [56, 96]].forEach(q => { s += `<ellipse cx="${q[0]}" cy="${q[1]}" rx="2.6" ry="1.8" fill="#e3cd9c"/>`; });
      [[66, 48, 13], [104, 70, 15], [70, 86, 10]].forEach(q => {
        s += `<circle cx="${q[0]}" cy="${q[1]}" r="${q[2]}" fill="url(#g-l9a-mold)" stroke="#3b7f7b" stroke-width="1.4" stroke-dasharray="2 2.4"/>`;
        for (let i = 0; i < 6; i++) { const a = i * 1.05 + q[2], d = q[2] * 0.42; s += `<circle cx="${r2(q[0] + d * Math.cos(a))}" cy="${r2(q[1] + d * Math.sin(a))}" r="1.2" fill="#1f5f66"/>`; }
      });
      return s;
    },
    anemone() {
      let s = P('M34,118 Q46,100 85,102 Q124,100 136,118Z', 'url(#g-l9a-rock)');
      [0, 8, 1, 7, 2, 6, 3, 5, 4].forEach(i => {
        const bx = 71 + i * 3.5, tx = 85 + (i - 4) * 12.5, ty = 18 + Math.abs(i - 4) * 5 + (i % 2) * 4;
        const qx = bx + (tx - bx) * 0.25 + (i % 2 ? 4 : -4), qy = (62 + ty) / 2 - 4;
        s += tube(`M${r2(bx)},63 Q${r2(qx)},${r2(qy)} ${r2(tx)},${r2(ty)}`, '#f6a5a0', 4.2);
      });
      s += P('M67,104 Q63,82 70,63 L100,63 Q107,82 103,104 Q85,109 67,104Z', 'url(#g-l9a-anem)');
      s += S('M76,68 Q73,86 75,102 M85,68 V104 M94,68 Q97,86 95,102', '#d9706f', 1.2);
      s += `<ellipse cx="85" cy="63" rx="15.5" ry="4.5" fill="#e9807c" stroke="${INK}" stroke-width="1.8"/>`;
      return s;
    },
    liverwort() {
      let s = S('M16,117 H154', '#a9743b', 2.4);
      s += P('M26,106 Q30,94 48,96 Q58,90 70,96 Q84,92 96,97 Q110,91 124,96 Q142,94 146,104 Q140,112 128,108 Q122,114 112,109 Q98,115 86,110 Q70,116 58,110 Q44,115 36,110 Q28,112 26,106Z', 'url(#g-l9a-leaf)');
      s += S('M40,104 Q60,100 84,103 Q108,100 136,102 M58,101 L50,98 M100,102 L110,96', '#2f7a3a', 1.3);
      s += tube('M62,99 L62,48', '#7fbf63', 2.2) + tube('M112,99 L112,62', '#7fbf63', 2.2);
      [[-22, 8], [22, 8], [-20, -3], [20, -3], [-11, -10], [11, -10], [0, -12]].forEach(e => {
        s += tube(`M62,46 Q${r2(62 + e[0] * 0.5)},${r2(46 + e[1] * 0.5 - 6)} ${62 + e[0]},${46 + e[1]}`, '#6fbf5a', 3.6);
      });
      s += `<circle cx="62" cy="46" r="5" fill="#4ea653" stroke="${INK}" stroke-width="1.6"/>`;
      s += `<ellipse cx="112" cy="60" rx="17" ry="6" fill="url(#g-l9a-leaf)" stroke="${INK}" stroke-width="2"/>`;
      s += S('M100,60 Q112,56 124,60 M106,63 L104,65 M118,63 L120,65', '#2f7a3a', 1.2);
      return s;
    },
  };
  FIG.l9a_life = p => {
    p = p || {};
    const k = Object.prototype.hasOwnProperty.call(LIFE, p.k) ? p.k : 'fern';
    const sea = k === 'kelp' || k === 'anemone';
    let s = box(3, 3, 164, 119, { fill: sea ? 'url(#g-l9a-sea)' : 'url(#g-paper)', sw: 1.6, r: 8 });
    s += LIFE[k]();
    if (p.name) s += T(85, 137, String(p.name), { size: 15, weight: 700 });
    return svg(170, 150, s, '생물 그림');
  };

  // ■ FIG.l9a_nuc(p) : 핵막이 없는 세포와 핵막으로 둘러싸인 핵이 있는 세포를 나란히 그린 두 판(폭 364, 높이 176).
  //   order  : ['no', 'yes'](기본. 왼쪽이 핵막이 없는 세포) 또는 ['yes', 'no']
  //   tags   : 판 아래 이름. 기본 ['(가)', '(나)']
  //   labels : false면 '유전물질', '핵막' 이름표를 그리지 않는다(기본은 그린다). 계 이름은 그리지 않는다.
  //   예) { kind: 'l9a_nuc', p: {} }   { kind: 'l9a_nuc', p: { order: ['yes', 'no'] } }
  const GM = '#6b46b0';
  const grains = pts => pts.map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="2" fill="#c7a66f"/>`).join('');
  const CELLS = {
    no(lab) {
      let s = `<rect x="18" y="26" width="140" height="72" rx="36" fill="url(#g-l9a-wall)" stroke="${INK}" stroke-width="2"/>`;
      s += `<rect x="25" y="33" width="126" height="58" rx="29" fill="url(#g-l9a-cyto)" stroke="#c2571a" stroke-width="1.8"/>`;
      s += grains([[40, 50], [42, 74], [134, 52], [136, 72], [126, 84]]);
      s += S('M60,62 C62,44 78,48 76,60 S92,78 96,62 S84,44 100,50 S118,56 112,68 S96,80 88,72 S70,80 66,70', GM, 2.6);
      if (lab) s += leader(88, 124, 88, 72) + dotAt(88, 72) + T(88, 135, '유전물질', { size: 14 });
      return s;
    },
    yes(lab) {
      let s = `<ellipse cx="88" cy="62" rx="66" ry="50" fill="url(#g-l9a-wall)" stroke="${INK}" stroke-width="2"/>`;
      s += `<ellipse cx="88" cy="62" rx="59" ry="43" fill="url(#g-l9a-cyto)" stroke="#c2571a" stroke-width="1.8"/>`;
      s += grains([[52, 40], [120, 44], [126, 74], [112, 90]]);
      s += `<circle cx="80" cy="58" r="24" fill="url(#g-l9a-nuc)" stroke="${INK}" stroke-width="2.2"/>`;
      s += S('M66,58 C68,46 78,48 78,58 S88,70 90,58 S82,44 92,50 M70,66 C76,74 86,72 92,66', GM, 2.4);
      if (lab) {
        s += leader(46, 124, 63, 75) + dotAt(63, 75) + T(44, 135, '핵막', { size: 14 });
        s += leader(118, 124, 86.9, 69.7) + dotAt(86.9, 69.7) + T(124, 135, '유전물질', { size: 14 });
      }
      return s;
    },
  };
  FIG.l9a_nuc = p => {
    p = p || {};
    const order = Array.isArray(p.order) && p.order.length === 2 && p.order.every(k => k === 'no' || k === 'yes') ? p.order : ['no', 'yes'];
    const tags = Array.isArray(p.tags) && p.tags.length === 2 ? p.tags : ['(가)', '(나)'];
    const lab = p.labels !== false;
    let s = '';
    order.forEach((k, i) => {
      const x = 2 + i * 184;
      s += box(x, 2, 176, 144, { fill: 'url(#g-paper)', stroke: '#b8c2d0', sw: 1.4, r: 8 });
      s += K.move(x, 0, CELLS[k](lab) + caption(88, 161, String(tags[i])));
    });
    return svg(364, 176, s, '핵막이 없는 세포와 핵막으로 둘러싸인 핵이 있는 세포');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 번호 11~16은 공용 그림(FIG.lineup, FIG.flow)과 표만 쓰므로 새 그림이 없다.
})(FIG);

/* ====================== 레슨 10 생물다양성을 지켜라 ====================== */
// 레슨 10 그림. tools/build.cjs가 src-figs/l10/의 00-pilot.js, 10-a.js, 20-b.js를 차례로 이은 것이다(뒤에 오는 정의가 앞의 것을 바꾼다). 직접 고치지 않는다.

/* ===== 00-pilot.js ===== */
// figs/l10.js : 레슨 10 전용 그림
//
// ■ FIG.l10_web(p) : 생물 사이의 먹이 관계 그림(이름 칸과 화살표). 화살표는 먹히는 생물에서 먹는 생물 쪽.
//   panels : [{cap, nodes, edges, gone}] 한 판(폭 240), 두 판(폭 176씩), 세 판(폭 120씩)
//     nodes : [{id, t, row, x}] row 0이 맨 아래 줄. t는 칸에 쓸 이름(기호도 된다).
//             같은 줄의 칸은 적힌 순서대로 왼쪽부터 놓인다. x(0~1)를 주면 그 가로 위치에 놓는다.
//     edges : [[먹히는 생물 id, 먹는 생물 id], ...]
//     gone  : 사라진 생물 id 배열(회색 칸에 붉은 가위표, 이어진 화살표는 회색 점선). 기본은 없음.
//     cap   : 판 아래 이름('(가)' 등)
//   h : 판 높이(기본 218, 최대 220). 폭 176 판에서는 한 줄에 칸 2개, 이름 5글자까지 권한다.
//   이름 칸의 폭은 52 이상이고, 한 칸에 화살표가 둘 닿으면 화살촉 사이를 24만큼 벌린다.
//   예) { kind: 'l10_web', p: { panels: [{ cap: '(가)', nodes: [{ id: 'a', t: '벼', row: 0 }, { id: 'b', t: '메뚜기', row: 1 }], edges: [['a', 'b']] }] } }
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, RED, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<linearGradient id="g-l10-plant" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6fcec"/><stop offset="1" stop-color="#cde8b0"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l10-animal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f8dcb0"/></linearGradient>');

  const tw = (s, size) => { let w = 0; for (const ch of String(s)) w += ch.charCodeAt(0) > 0x2000 ? 1 : 0.6; return w * size; };
  const GRAY = '#aab2bf';

  function webPanel(q, pw, ph) {
    q = q || {};
    const FS = 14, NH = 28;
    const nodes = (Array.isArray(q.nodes) ? q.nodes : []).filter(n => n && n.id != null)
      .map(n => ({ id: String(n.id), t: String(n.t == null ? n.id : n.t), row: Math.max(0, n.row | 0), x: +n.x, out: [], in: [] }));
    const gone = Array.isArray(q.gone) ? q.gone.map(String) : [];
    const R = Math.max(1, ...nodes.map(n => n.row + 1));
    const yb = ph - 20, yt = 20, byId = {}; // 줄 사이를 넓혀 엇갈리는 화살표가 눕지 않게 한다
    for (let r = 0; r < R; r++) {
      const row = nodes.filter(n => n.row === r), m = row.length;
      row.forEach((n, i) => {
        n.w = Math.max(52, tw(n.t, FS) + 14); // 화살촉 둘이 나란히 닿아도 붙지 않을 폭
        const f = n.x > 0 && n.x < 1 ? n.x : m === 1 ? 0.5 : m === 2 ? [0.25, 0.71][i] : (i + 0.5) / m;
        n.cx = Math.max(5 + n.w / 2, Math.min(pw - 5 - n.w / 2, pw * f));
        n.cy = R === 1 ? ph / 2 : yb - r * (yb - yt) / (R - 1);
        byId[n.id] = n;
      });
    }
    const edges = (Array.isArray(q.edges) ? q.edges : []).filter(e => Array.isArray(e) && byId[e[0]] && byId[e[1]]).map(e => ({ a: byId[e[0]], b: byId[e[1]] }));
    edges.forEach(e => { e.a.out.push(e); e.b.in.push(e); });
    // 한 칸에 화살표가 여럿 닿으면 상대 칸의 좌우 순서대로 벌려서 붙인다(칸의 곧은 변 안에서 최대 24 간격).
    const at = (n, list, e, key) => {
      const s = list.slice().sort((p1, p2) => p1[key].cx - p2[key].cx);
      const sp = s.length > 1 ? Math.min(24, (n.w - 28) / (s.length - 1)) : 0;
      return n.cx + (s.indexOf(e) - (s.length - 1) / 2) * sp;
    };
    let s = box(1, 1, pw - 2, ph - 2, { fill: 'url(#g-paper)', stroke: '#b8c2d0', sw: 1.4, r: 10 });
    edges.forEach(e => {
      const dead = gone.includes(e.a.id) || gone.includes(e.b.id), up = e.b.cy <= e.a.cy ? -1 : 1;
      s += arrow(at(e.a, e.a.out, e, 'b'), e.a.cy + up * (NH / 2 + 2), at(e.b, e.b.in, e, 'a'), e.b.cy - up * (NH / 2 + 3),
        dead ? { w: 1.6, head: 7, color: GRAY, dash: '4 4' } : { w: 2, head: 8 });
    });
    nodes.forEach(n => {
      const dead = gone.includes(n.id), x = n.cx - n.w / 2, y = n.cy - NH / 2;
      s += box(x, y, n.w, NH, { fill: dead ? '#f1f3f6' : n.row === 0 ? 'url(#g-l10-plant)' : 'url(#g-l10-animal)', stroke: dead ? GRAY : INK, r: 14 });
      s += T(n.cx, n.cy + 0.5, n.t, { size: FS, weight: 700, halo: false, fill: dead ? '#8d97a6' : INK });
      if (dead) s += line2([[x + 5, y + 4], [x + n.w - 5, y + NH - 4]], RED, 2.4) + line2([[x + n.w - 5, y + 4], [x + 5, y + NH - 4]], RED, 2.4);
    });
    let h = ph;
    if (q.cap) { s += caption(pw / 2, ph + 14, String(q.cap)); h += 28; }
    return { w: pw, h, body: s };
  }

  FIG.l10_web = p => {
    p = p || {};
    let panels = (Array.isArray(p.panels) ? p.panels : []).filter(q => q && typeof q === 'object').slice(0, 3);
    if (!panels.length) panels = [{ nodes: [{ id: 'a', t: 'A', row: 0 }, { id: 'b', t: 'B', row: 1 }, { id: 'c', t: 'C', row: 2 }], edges: [['a', 'b'], ['b', 'c']] }];
    const n = panels.length, pw = n === 1 ? 240 : n === 2 ? 176 : 120;
    const ph = Math.max(120, Math.min(220, +p.h || 218));
    const row = K.rowOf(panels.map(q => webPanel(q, pw, ph)), 8);
    return svg(row.w + 4, r2(row.h + 4), K.move(2, 2, row.body), '생물 사이의 먹이 관계');
  };
})(FIG);

/* ===== 10-a.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;

  K.addDefs('<linearGradient id="g-l10a-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f4d3"/><stop offset="1" stop-color="#c4e1a6"/></linearGradient>');
  K.addDefs('<radialGradient id="g-l10a-leaf" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#93d67e"/><stop offset="1" stop-color="#3f9950"/></radialGradient>');
  K.addDefs('<linearGradient id="g-l10a-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6eefb"/><stop offset="1" stop-color="#9fcdee"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l10a-soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9cfa2"/><stop offset="1" stop-color="#c9a36c"/></linearGradient>');
  K.addDefs('<linearGradient id="g-l10a-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf5fd"/><stop offset="1" stop-color="#ffffff"/></linearGradient>');

  const LEAF = 'url(#g-l10a-leaf)';
  const tree = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-2" y="6" width="4" height="9" fill="#a9743b" stroke="${INK}" stroke-width="1.4"/>` +
    `<circle cx="-5" cy="2" r="6" fill="${LEAF}" stroke="${INK}" stroke-width="1.5"/><circle cx="5" cy="2" r="6" fill="${LEAF}" stroke="${INK}" stroke-width="1.5"/>` +
    `<circle cx="0" cy="-4" r="7" fill="${LEAF}" stroke="${INK}" stroke-width="1.5"/><circle cx="0" cy="1.5" r="5" fill="#5fb764"/></g>`;
  const car = (x, y, c, rot) => `<g transform="translate(${x} ${y}) rotate(${rot || 0})"><rect x="-11" y="-6" width="22" height="12" rx="4" fill="${c}" stroke="${INK}" stroke-width="1.5"/>` +
    `<rect x="-2" y="-4" width="8" height="8" rx="2" fill="#dff1fb" stroke="${INK}" stroke-width="1"/></g>`;
  const stump = (x, y) => `<rect x="${x - 5}" y="${y}" width="10" height="7" fill="#a9743b" stroke="${INK}" stroke-width="1.4"/><ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" fill="#ecd0a4" stroke="${INK}" stroke-width="1.4"/>`;

  // ■ FIG.l10a_road(p) : 숲을 가로지르는 도로 장면(위에서 본 모습). 그림 보기용, 폭 170, 높이 150. 글자 없음.
  //   kind : 'bridge'(풀과 나무로 덮인 다리가 도로 위로 양쪽 숲을 잇는다) | 'fence'(도로 양옆 울타리)
  //          | 'lamp'(가로등) | 'wide'(넓힌 도로) | 'park'(숲 한쪽을 깎아 만든 주차장) | 그 밖(도로만)
  //   예) { kind: 'l10a_road', p: { kind: 'bridge' } }
  FIG.l10a_road = p => {
    p = p || {};
    const kind = p.kind, wide = kind === 'wide', y1 = wide ? 44 : 58, y2 = wide ? 106 : 92;
    let s = `<rect x="1" y="1" width="168" height="148" fill="url(#g-l10a-grass)"/>`;
    s += `<rect x="1" y="${y1}" width="168" height="${y2 - y1}" fill="#9aa3af"/>` + line2([[1, y1], [169, y1]], INK, 2) + line2([[1, y2], [169, y2]], INK, 2);
    (wide ? [64.5, 85.5] : [75]).forEach(y => { s += line2([[6, y], [164, y]], '#fff', 2, { dash: '10 8', cap: 'butt' }); });
    if (kind === 'lamp') [40, 120].forEach(x => { s += `<ellipse cx="${x + 10}" cy="67" rx="15" ry="8" fill="#fff3b0" fill-opacity=".75"/>`; });
    if (wide) s += car(34, 54, '#e5676b', 0) + car(86, 75, '#f2c94c', 0) + car(140, 96, '#6ea8e8', 180);
    else s += car(34, 66.5, '#e5676b', 0) + car(140, 83.5, '#6ea8e8', 180);
    [[20, 22], [58, 20], [98, 24], [146, 21]].forEach(q => { s += tree(q[0], q[1], 1.1); });
    [[24, 126], [62, 124], [104, 127], [148, 125]].forEach(q => { if (!(kind === 'park' && q[0] > 80)) s += tree(q[0], q[1], 1.1); });
    if (kind === 'bridge') {
      s += `<rect x="112" y="58" width="6" height="34" fill="#6f7884"/>`;
      s += poly([[60, 42], [120, 42], [112, 58], [112, 92], [120, 108], [60, 108], [68, 92], [68, 58]], '#a9d98a');
      s += line2([[68, 58], [68, 92]], INK, 3.6) + line2([[112, 58], [112, 92]], INK, 3.6);
      [[80, 52, 5], [100, 98, 5], [97, 67, 4.5], [82, 84, 4.5]].forEach(q => { s += `<circle cx="${q[0]}" cy="${q[1]}" r="${q[2]}" fill="${LEAF}" stroke="${INK}" stroke-width="1.3"/>`; });
      [[90, 50], [80, 68], [98, 82], [86, 100], [90, 76]].forEach(q => { s += line2([[q[0] - 3, q[1] + 2], [q[0] - 2, q[1] - 3]], '#4f9a48', 1.3) + line2([[q[0], q[1] + 2], [q[0], q[1] - 4]], '#4f9a48', 1.3) + line2([[q[0] + 3, q[1] + 2], [q[0] + 2, q[1] - 3]], '#4f9a48', 1.3); });
    }
    if (kind === 'fence') [54, 101].forEach(fy => {
      s += line2([[4, fy], [166, fy]], '#8a5a2b', 1.8) + line2([[4, fy - 5], [166, fy - 5]], '#8a5a2b', 1.8);
      for (let x = 8; x <= 162; x += 14) s += line2([[x, fy - 8], [x, fy + 1]], '#6b4423', 2.6);
    });
    if (kind === 'lamp') [40, 120].forEach(x => {
      s += line2([[x, 57], [x, 40], [x + 8, 40]], INK, 2.4) + `<ellipse cx="${x + 10}" cy="41.5" rx="4" ry="2.6" fill="#ffd84d" stroke="${INK}" stroke-width="1.4"/>`;
    });
    if (kind === 'park') {
      s += `<rect x="90" y="93" width="79" height="56" fill="#b3bbc6"/>` + line2([[90, 92], [90, 149]], INK, 2);
      [108, 128, 148].forEach(x => { s += line2([[x, 116], [x, 148]], '#fff', 2, { cap: 'butt' }); });
      s += car(118, 133, '#f2c94c', 90) + car(158, 133, '#8fd0a0', 90) + stump(80, 112) + stump(78, 136);
    }
    s += `<rect x="1" y="1" width="168" height="148" fill="none" stroke="${INK}" stroke-width="2"/>`;
    return svg(170, 150, s, '숲을 가로지르는 도로');
  };

  // ■ FIG.l10a_causes(p) : 생물다양성 감소와 관련된 장면 판(폭 120씩 나란히, 판 높이 130). 원인 이름표는 그리지 않는다.
  //   panels : [{k, cap, big, small}] 최대 3판. 기본은 dig, lake, dry 세 판.
  //     k   'dig'(굴착기가 숲의 나무를 베고 땅을 깎는 모습) | 'lake'(호수 속 큰 물고기와 작은 물고기) | 'dry'(갈라진 땅과 마른 풀)
  //     cap 판 아래 이름('(가)' 등). big(1~4, 기본 4), small(0~2, 기본 1)은 lake의 큰 물고기, 작은 물고기 수.
  //   예) { kind: 'l10a_causes', p: { panels: [{ k: 'dig', cap: '(가)' }, { k: 'lake', cap: '(나)' }, { k: 'dry', cap: '(다)' }] } }
  const fish = (x, y, k, flip, c, stripe) => `<g transform="translate(${x} ${y}) scale(${flip ? -k : k} ${k})">` +
    `<path d="M-16,0 L-24,-7 L-21,0 L-24,7Z" fill="${c}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<path d="M-6,-6 L1,-12 L7,-6Z" fill="${c}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<path d="M-18,0 C-10,-9 8,-9 16,-3 L16,3 C8,9 -10,9 -18,0Z" fill="${c}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
    (stripe ? `<path d="M-13,0 L7,0" stroke="#3d5a2c" stroke-width="2.2" stroke-dasharray="4 2" fill="none"/>` : '') +
    `<circle cx="10" cy="-2.5" r="1.6" fill="${INK}"/><path d="M16,1 L10,2.5" stroke="${INK}" stroke-width="1.3" fill="none"/></g>`;
  const SC = {
    dig() {
      let s = `<rect x="0" y="0" width="120" height="80" fill="url(#g-l10a-sky)"/><rect x="0" y="78" width="120" height="52" fill="url(#g-l10a-soil)"/>` + line2([[0, 78], [120, 78]], INK, 1.6);
      s += tree(13, 60, 1.3) + tree(31, 60, 1.3) + stump(30, 104) + stump(56, 96);
      s += `<g transform="rotate(-12 88 114)"><rect x="70" y="110" width="36" height="8" rx="4" fill="#a9743b" stroke="${INK}" stroke-width="1.5"/></g>`;
      s += `<rect x="72" y="86" width="42" height="10" rx="5" fill="#4a5362" stroke="${INK}" stroke-width="1.6"/>`;
      s += `<rect x="78" y="70" width="32" height="16" rx="2" fill="#f2c94c" stroke="${INK}" stroke-width="1.8"/><rect x="92" y="54" width="16" height="16" rx="2" fill="#f2c94c" stroke="${INK}" stroke-width="1.8"/><rect x="95" y="57" width="10" height="9" fill="#dff1fb" stroke="${INK}" stroke-width="1.2"/>`;
      s += line2([[82, 72], [64, 46], [51, 68]], INK, 7.5) + line2([[82, 72], [64, 46], [51, 68]], '#f2c94c', 4);
      s += poly([[44, 67], [57, 67], [55, 79], [47, 81]], '#8b95a3', { sw: 1.6 });
      return s;
    },
    lake(q) {
      const nb = Math.max(1, Math.min(4, q.big == null ? 4 : q.big | 0)), ns = Math.max(0, Math.min(2, q.small == null ? 1 : q.small | 0));
      let s = `<rect x="0" y="0" width="120" height="130" fill="url(#g-l10a-water)"/><rect x="0" y="0" width="120" height="16" fill="url(#g-l10a-sky)"/>`;
      s += `<path d="M0,16 q10,-5 20,0 t20,0 t20,0 t20,0 t20,0 t20,0" fill="none" stroke="#5a9bd4" stroke-width="1.8"/>`;
      [[34, 44, 0], [84, 64, 1], [38, 90, 1], [86, 110, 0]].slice(0, nb).forEach(b => { s += fish(b[0], b[1], 1, b[2], '#9bb873', true); });
      [[18, 116, 0], [102, 34, 1]].slice(0, ns).forEach(b => { s += fish(b[0], b[1], 0.45, b[2], '#f2b36a', false); });
      return s;
    },
    dry() {
      let s = `<rect x="0" y="0" width="120" height="58" fill="#fdf3e3"/><rect x="0" y="56" width="120" height="74" fill="url(#g-l10a-soil)"/>` + line2([[0, 56], [120, 56]], INK, 1.6);
      s += `<circle cx="98" cy="24" r="10" fill="#ffd84d" stroke="${INK}" stroke-width="1.6"/>`;
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; s += line2([[98 + 13 * Math.cos(a), 24 + 13 * Math.sin(a)], [98 + 18 * Math.cos(a), 24 + 18 * Math.sin(a)]], '#e8a020', 2); }
      const C = '#6b4a2b';
      [[[0, 74], [22, 70], [40, 80], [66, 72], [90, 82], [120, 76]], [[0, 104], [18, 98], [44, 106], [70, 98], [96, 108], [120, 102]],
        [[30, 57], [22, 70], [18, 98], [14, 130]], [[40, 80], [44, 106], [50, 130]], [[60, 57], [66, 72], [70, 98], [76, 130]], [[98, 57], [90, 82], [96, 108], [100, 130]]]
        .forEach(l => { s += line2(l, C, 2); });
      [12, 44, 76].forEach(x => {
        s += `<path d="M${x},57 Q${x - 1},45 ${x + 6},41 Q${x + 11},40 ${x + 11},47 M${x},52 Q${x - 7},47 ${x - 8},54" fill="none" stroke="#a08a4a" stroke-width="2.2" stroke-linecap="round"/>`;
      });
      return s;
    },
  };
  FIG.l10a_causes = p => {
    p = p || {};
    let panels = (Array.isArray(p.panels) ? p.panels : []).filter(q => q && SC[q.k]).slice(0, 3);
    if (!panels.length) panels = [{ k: 'dig', cap: '(가)' }, { k: 'lake', cap: '(나)' }, { k: 'dry', cap: '(다)' }];
    const anyCap = panels.some(q => q.cap);
    const row = K.rowOf(panels.map(q => ({ w: 120, h: 130, body: SC[q.k](q) + `<rect x="0" y="0" width="120" height="130" fill="none" stroke="${INK}" stroke-width="2"/>` + (q.cap ? caption(60, 146, String(q.cap)) : '') })), 8);
    return svg(row.w + 4, 134 + (anyCap ? 26 : 0), K.move(2, 2, row.body), '생물다양성 감소와 관련된 세 장면');
  };
})(FIG);

/* ===== 20-b.js ===== */
(function (FIG) {
  const K = FIG.kit;
  const { INK, SUB, r2, svg, T, arrow, poly, line2, leader, caption, box, badge } = K;
  // 번호 11~16은 공용 그림(cards, bars)과 이미 있는 l10_web만 쓴다. 새 그림 없음.
})(FIG);

/** 그림 한 장(SVG 문자열). kind는 그림 이름, p는 인자. */
export function u2Fig(kind: string, p: Record<string, unknown> = {}): string {
  return FIG[kind](p);
}
/** 보기 칸에 넣는 그림(그림 고르기 문항). */
export function u2OptFig(kind: string, p: Record<string, unknown> = {}): string {
  return `<span class="ex-optfig">${FIG[kind](p)}</span>`;
}
/** 문항 그림 칸에 넣는 표. 첫 줄은 머리, 각 줄의 첫 칸도 머리로 그린다. */
export function u2Table(head: string[], rows: string[][]): string {
  const tr = (cells: string[], allHead: boolean): string =>
    `<tr>${cells.map((c, i) => (allHead || i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`;
  return `<table class="ex-table">${tr(head, true)}${rows.map((r) => tr(r, false)).join("")}</table>`;
}
