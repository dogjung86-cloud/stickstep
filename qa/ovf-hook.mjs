// 글 넘침·가림 검사 훅(2026-11-16, 도입과 랩 글 다듬기). 단원 검사(qa/check-*.mjs)에 얹어 돌린다.
// 검사가 화면을 걷는 동안 지금 화면(.screen.active)에서 다음을 찾아 OVF_OUT 파일(JSON 줄)에 모은다.
//   clip      글이 자기 상자에서 잘림(overflow hidden, 말줄임)
//   anc       글이 overflow hidden인 조상(무대 등) 밖으로 나가 잘림
//   spill     글이 자기 상자 밖으로 삐져나옴(nowrap 등, 잘리지는 않지만 상자를 넘음)
//   overlap   보이는 글 두 개가 서로 겹침(HTML 글과 SVG 글 모두)
//   svgpill   SVG 글이 바로 앞의 알약 rect를 넘음
//   svgclip   SVG 글이 svg 그림 영역 밖으로 나감
//   cvclip    캔버스 글이 캔버스 밖으로 나감
//   cvover    한 프레임 캔버스 글끼리 겹침
//   cvpill    캔버스 글이 바로 앞에 그린 둥근 상자를 넘음
//   fit       공용 틀(b6Lab)의 글 맞춤 경고 [bv-fit]
// 쓰는 법(dist-hook과 함께):
//   DIST_HOOK=<개발 번들> PORT=5781 OVF_OUT=<결과.jsonl> node --import ./qa/dist-hook.mjs --import ./qa/ovf-hook.mjs qa/check-u3v5.mjs <캡처>
// 결과 비교: node qa/ovf-diff.mjs <기준.jsonl> <새.jsonl>
import { createRequire } from "node:module";
import { appendFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const pw = require("playwright-core");
const OUT = process.env.OVF_OUT;
const TAG = process.env.OVF_TAG || "";

const SCAN = () => {
  if (window.__ovfOn) return;
  window.__ovfOn = true;
  const seen = new Set();
  const emit = (o) => {
    const key = o.kind + "|" + o.ctx + "|" + o.path + "|" + (o.path2 || "") + "|" + (o.text || "").slice(0, 40);
    if (seen.has(key)) return;
    seen.add(key);
    console.debug("__OVF__" + JSON.stringify(o));
  };
  const ctxOf = () => {
    const sc = document.querySelector(".screen.active");
    const t = sc?.querySelector(".bv-title, .opn-title, .stepWrap h1, .stepWrap h2");
    const open = new URLSearchParams(location.search).get("open") || "";
    return (open ? open + " " : "") + (t ? t.textContent.trim().slice(0, 30) : sc?.id || "");
  };
  const pathOf = (e) => {
    const parts = [];
    for (let n = e, i = 0; n && i < 5 && !(n.classList && n.classList.contains("screen")); n = n.parentElement, i++) {
      const cls = n.classList ? [...n.classList].filter((c) => !/^(on|off|show|done|sel|dim|ok|miss|gone|two|fs18|small|dense|hide|hidden|active|lit|now)$/.test(c)).slice(0, 2).join(".") : "";
      parts.unshift(n.tagName.toLowerCase() + (cls ? "." + cls : ""));
    }
    return parts.join(">");
  };
  const visible = (e) => {
    if (!e.getClientRects().length) return false;
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.05) return false;
      if (n.classList && n.classList.contains("screen")) break;
    }
    return true;
  };
  // 자기 글(자식 글 마디)의 줄 상자들. 겹침은 줄 상자끼리 본다(문단 전체를 한 상자로 묶으면 같은 문단 안의 굵은 글씨와 겹쳐 보인다).
  const ownLines = (e) => {
    const out = [];
    for (const c of e.childNodes) {
      if (c.nodeType !== 3 || !c.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(c);
      for (const b of rg.getClientRects()) {
        if (b.width < 1 || b.height < 1) continue;
        out.push({ l: b.left, t: b.top, r: b.right, b: b.bottom });
      }
    }
    return out;
  };
  const union = (rs) => rs.reduce((r, b) => (r ? { l: Math.min(r.l, b.l), t: Math.min(r.t, b.t), r: Math.max(r.r, b.r), b: Math.max(r.b, b.b) } : { ...b }), null);
  const inter = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
  const area = (a) => Math.max(0, a.r - a.l) * Math.max(0, a.b - a.t);

  // ── 캔버스 글 기록 ──
  const CV = new WeakMap();
  const P = CanvasRenderingContext2D.prototype;
  const rec = (ctx) => {
    let s = CV.get(ctx.canvas);
    if (!s) {
      s = { texts: [], boxes: [] };
      CV.set(ctx.canvas, s);
      (window.__ovfCanvases ||= new Set()).add(ctx.canvas);
    }
    return s;
  };
  const origClear = P.clearRect;
  P.clearRect = function (x, y, w, h) {
    if (x <= 0 && y <= 0 && w >= this.canvas.width - 1 && h >= this.canvas.height - 1) {
      const s = rec(this);
      s.last = { texts: s.texts, boxes: s.boxes };
      s.texts = [];
      s.boxes = [];
    }
    return origClear.call(this, x, y, w, h);
  };
  const tx = (ctx, x, y) => {
    const m = ctx.getTransform();
    return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f };
  };
  const origRR = P.roundRect;
  if (origRR) {
    P.roundRect = function (x, y, w, h, r) {
      const a = tx(this, x, y);
      const b = tx(this, x + w, y + h);
      rec(this).boxes.push({ l: Math.min(a.x, b.x), t: Math.min(a.y, b.y), r: Math.max(a.x, b.x), b: Math.max(a.y, b.y) });
      return origRR.call(this, x, y, w, h, r);
    };
  }
  const textBox = (ctx, text, x, y) => {
    const mt = ctx.measureText(text);
    const w = mt.width;
    const al = ctx.textAlign;
    let l = al === "center" ? x - w / 2 : al === "right" || al === "end" ? x - w : x;
    const asc = mt.actualBoundingBoxAscent || 0;
    const desc = mt.actualBoundingBoxDescent || 0;
    const a = tx(ctx, l, y - asc);
    const b = tx(ctx, l + w, y + desc);
    return { l: Math.min(a.x, b.x), t: Math.min(a.y, b.y), r: Math.max(a.x, b.x), b: Math.max(a.y, b.y) };
  };
  for (const fn of ["fillText", "strokeText"]) {
    const orig = P[fn];
    P[fn] = function (text, x, y, maxW) {
      try {
        const s = String(text);
        if (s.trim() && /[가-힣A-Za-z0-9]/.test(s) && this.globalAlpha > 0.05) {
          const box = textBox(this, s, x, y);
          const st = rec(this);
          const prev = st.texts[st.texts.length - 1];
          if (!(prev && prev.text === s && Math.abs(prev.box.l - box.l) < 1 && Math.abs(prev.box.t - box.t) < 1)) st.texts.push({ text: s, box, boxIdx: st.boxes.length - 1 });
        }
      } catch {}
      return maxW === undefined ? orig.call(this, text, x, y) : orig.call(this, text, x, y, maxW);
    };
  }

  const scan = () => {
    // 도입(opn-step)과 랩(bv-step) 스텝만 본다. 문제 해설 시트, 맨 아래 버튼, 알림은 일부러 겹치는 것이라 뺀다.
    const sc = document.querySelector(".screen.active .stepWrap .step.bv-step, .screen.active .stepWrap .step.opn-step");
    if (!sc) return;
    const ctx = ctxOf();
    const items = [];
    const all = sc.querySelectorAll("*");
    for (const e of all) {
      if (e instanceof SVGElement) continue;
      const own = [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      if (!own) continue;
      if (!visible(e)) continue;
      const cs = getComputedStyle(e);
      const text = e.textContent.trim().slice(0, 60);
      const ox = cs.overflowX;
      const oy = cs.overflowY;
      if ((ox === "hidden" || ox === "clip" || cs.textOverflow === "ellipsis") && e.scrollWidth > e.clientWidth + 1) emit({ kind: "clip", ctx, path: pathOf(e), text, d: e.scrollWidth - e.clientWidth });
      else if ((oy === "hidden" || oy === "clip") && e.scrollHeight > e.clientHeight + 2) emit({ kind: "clip", ctx, path: pathOf(e), text, d: e.scrollHeight - e.clientHeight, v: 1 });
      else if (cs.textOverflow === "ellipsis" && cs.whiteSpace === "nowrap" && e.scrollWidth >= e.clientWidth) {
        // 1px 안쪽 넘침도 말줄임이 된다(scrollWidth는 정수라 못 본다): 글의 실제 폭(소수점)을 잰다. 2026-11-16 u2l9·g2u1 제목에서 찾음
        // 상자 폭도 소수점으로(clientWidth는 소수점을 버려 글에 꼭 맞춘 상자를 넘친다고 잘못 본다)
        const rg = document.createRange();
        rg.selectNodeContents(e);
        const box = e.getBoundingClientRect().width;
        const z = e.offsetWidth ? box / e.offsetWidth : 1;
        const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) + (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(cs.borderRightWidth) || 0);
        const over = rg.getBoundingClientRect().width - (box - pad * (z || 1));
        if (over > 0.05) emit({ kind: "clip", ctx, path: pathOf(e), text, d: Math.round(over * 10) / 10, sub: 1 });
      }
      const lines = ownLines(e);
      const tr = union(lines);
      if (!tr) continue;
      const br = e.getBoundingClientRect();
      if (ox === "visible" && (tr.r > br.right + 2 || tr.l < br.left - 2)) emit({ kind: "spill", ctx, path: pathOf(e), text, d: Math.round(Math.max(tr.r - br.right, br.left - tr.l)) });
      // overflow hidden인 조상 밖으로 나가는지
      for (let n = e.parentElement; n && n !== sc; n = n.parentElement) {
        const ncs = getComputedStyle(n);
        if (ncs.overflowX === "hidden" || ncs.overflowX === "clip" || ncs.overflowY === "hidden") {
          const nr = n.getBoundingClientRect();
          const out = Math.max(tr.r - nr.right, nr.left - tr.l, tr.b - nr.bottom, nr.top - tr.t);
          if (out > 2) emit({ kind: "anc", ctx, path: pathOf(e), path2: pathOf(n), text, d: Math.round(out) });
          break;
        }
      }
      items.push({ e, rs: lines, text, path: pathOf(e) });
    }
    // SVG 글
    for (const t of sc.querySelectorAll("svg text")) {
      if (!t.textContent.trim() || !visible(t)) continue;
      const b = t.getBoundingClientRect();
      if (b.width < 1) continue;
      const r = { l: b.left, t: b.top, r: b.right, b: b.bottom };
      const text = t.textContent.trim().slice(0, 60);
      items.push({ e: t, rs: [r], text, path: pathOf(t) });
      const svg = t.ownerSVGElement;
      if (svg) {
        const sr = svg.getBoundingClientRect();
        const ov = getComputedStyle(svg).overflow;
        const out = Math.max(r.r - sr.right, sr.left - r.l, r.b - sr.bottom, sr.top - r.t);
        if (ov !== "visible" && out > 2) emit({ kind: "svgclip", ctx, path: pathOf(t), text, d: Math.round(out) });
      }
      let p = t.previousElementSibling;
      while (p && p.tagName.toLowerCase() === "text") p = p.previousElementSibling;
      if (p && p.tagName.toLowerCase() === "rect") {
        const pb = p.getBoundingClientRect();
        const cx = (r.l + r.r) / 2;
        const cy = (r.t + r.b) / 2;
        if (cx > pb.left && cx < pb.right && cy > pb.top && cy < pb.bottom && pb.height < 60) {
          const out = Math.max(r.r - pb.right, pb.left - r.l);
          if (out > 1) emit({ kind: "svgpill", ctx, path: pathOf(t), text, d: Math.round(out) });
        }
      }
    }
    // 글끼리 겹침(조상과 자손 사이는 빼고)
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const A = items[i];
        const B = items[j];
        if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
        let best = 0;
        for (const a of A.rs)
          for (const b of B.rs) {
            const I = inter(a, b);
            if (I <= 0) continue;
            const m = Math.min(area(a), area(b));
            if (m > 0) best = Math.max(best, I / m);
          }
        if (best > 0.18) emit({ kind: "overlap", ctx, path: A.path, path2: B.path, text: A.text + " ⟂ " + B.text, d: Math.round(best * 100) });
      }
    }
    // 캔버스 글
    for (const cv of window.__ovfCanvases || []) {
      if (!cv.isConnected || !sc.contains(cv) || !visible(cv)) continue;
      const s = CV.get(cv);
      const fr = s && (s.texts.length ? s : s.last);
      if (!fr) continue;
      const W = cv.width;
      const H = cv.height;
      const cpath = pathOf(cv);
      fr.texts.forEach((a, i) => {
        const out = Math.max(a.box.r - W, -a.box.l, a.box.b - H, -a.box.t);
        if (out > 2) emit({ kind: "cvclip", ctx, path: cpath, text: a.text, d: Math.round(out) });
        if (a.boxIdx >= 0) {
          const bx = fr.boxes[a.boxIdx];
          const cx = (a.box.l + a.box.r) / 2;
          const cy = (a.box.t + a.box.b) / 2;
          if (bx && cx > bx.l && cx < bx.r && cy > bx.t && cy < bx.b) {
            const o = Math.max(a.box.r - bx.r, bx.l - a.box.l);
            if (o > 1.5) emit({ kind: "cvpill", ctx, path: cpath, text: a.text, d: Math.round(o) });
          }
        }
        for (let j = i + 1; j < fr.texts.length; j++) {
          const b = fr.texts[j];
          if (b.text === a.text) continue;
          const I = inter(a.box, b.box);
          const m = Math.min(area(a.box), area(b.box));
          if (m > 0 && I / m > 0.18) emit({ kind: "cvover", ctx, path: cpath, text: a.text + " ⟂ " + b.text, d: Math.round((I / m) * 100) });
        }
      });
    }
  };
  let pend = 0;
  const kick = () => {
    if (pend) return;
    pend = setTimeout(() => {
      pend = 0;
      try {
        scan();
      } catch (e) {
        console.debug("__OVF_ERR__" + e.message);
      }
    }, 160);
  };
  const start = () => {
    new MutationObserver(kick).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
    setInterval(kick, 900);
  };
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
};

if (OUT) {
  const origLaunch = pw.chromium.launch.bind(pw.chromium);
  pw.chromium.launch = async (...args) => {
    const browser = await origLaunch(...args);
    const origNewContext = browser.newContext.bind(browser);
    browser.newContext = async (...a) => {
      const ctx = await origNewContext(...a);
      await ctx.addInitScript(SCAN);
      const vw = a[0]?.viewport?.width ?? 0;
      ctx.on("console", (m) => {
        const t = m.text();
        if (t.startsWith("__OVF__")) {
          try {
            const o = JSON.parse(t.slice(7));
            appendFileSync(OUT, JSON.stringify({ tag: TAG, vw, ...o }) + "\n");
          } catch {}
        } else if (t.startsWith("[bv-fit]") || t.startsWith("[opn-fit]")) {
          appendFileSync(OUT, JSON.stringify({ tag: TAG, vw, kind: "fit", text: t.replace(/^\[[a-z-]+\] /, "").slice(0, 160) }) + "\n");
        } else if (t.startsWith("__OVF_ERR__")) {
          appendFileSync(OUT, JSON.stringify({ tag: TAG, vw, kind: "scanerr", text: t.slice(11, 200) }) + "\n");
        }
      });
      return ctx;
    };
    return browser;
  };
  console.log(`[ovf-hook] → ${OUT}`);
}
