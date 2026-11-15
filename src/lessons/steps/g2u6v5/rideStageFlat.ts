// [중2 Ⅵ v5] 순환 여행 랩의 평면 무대(SVG). WebGL2를 쓸 수 없거나 입체를 켜다 실패했을 때 뜬다.
// 입체 무대(rideStage3d.ts)와 같은 상태를 받아 같은 뜻으로 그린다: 같은 길, 같은 구도(viewBox를 옮긴다), 같은 교환 차례.
// 움직임은 setTimeout으로만 돌린다(그리기 루프가 멈춘 환경에서도 그림이 따라간다). 움직일 것이 없으면 멈춘다.

import {
  AIRWAY, ALV_MACRO, ALV_O2, BED_BODY, BED_LUNG, BODY_FLIGHTS, BREATH_DUR, BREATH_FROM, BREATH_IN, CELLS_MACRO, CELL_CO2, CELL_WASTE,
  FRAMES, HEART_OUT, LOBES, LUNG_FLIGHTS, MACRO_R, MICRO_AIRWAY, MICRO_ALV, MICRO_AT, MICRO_CELLS, MICRO_WALL,
  PATHS, RC, RH, ROOM, RW, SLOT, VALVES,
  along, beatAmt, cargoAt, clamp01, ease, followFrame, isMicro, lerp, makeOverlay, mixHex, oxygen, poly, progress, smooth, startState, tagAnchor, toStage,
  type FillKey, type Flight, type Frame, type FrameKey, type Gas, type MacroSeg, type MicroSeg, type Pick, type Poly, type Pt, type RideStage, type RideStageOpts, type RideState, type Room, type Slot, type TagKey,
} from "./rideStage";

const NS = "http://www.w3.org/2000/svg";
const GAS: Record<Gas, string> = { o2: RC.o2, co2: RC.co2, nut: RC.nut, waste: RC.waste };
const d = (pts: Pt[]): string => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

export function flatRideStage(box: HTMLElement, o: RideStageOpts): RideStage {
  box.classList.add("g2u6x-rd-flat");
  const mk = (cls: string, vb = `0 0 ${RW} ${RH}`): SVGSVGElement => {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("class", `g2u6x-rd-svg ${cls}`);
    s.setAttribute("viewBox", vb);
    s.setAttribute("aria-hidden", "true");
    return s;
  };
  const macro = mk("macro");
  macro.setAttribute("role", "img");
  macro.setAttribute("aria-hidden", "false");
  macro.setAttribute("aria-label", "위에 허파, 가운데에 심장, 아래에 온몸의 조직세포가 있고 혈관이 이들을 잇는 혈액 순환 모식도");
  const mBody = mk("micro");
  const mLung = mk("micro");
  box.prepend(macro, mBody, mLung);
  const ov = makeOverlay(box, o.onPick);

  // ── 큰 그림 ──
  const gradDefs = `<defs>
    <linearGradient id="rdf-bed" gradientUnits="userSpaceOnUse" x1="262" y1="0" x2="100" y2="0"><stop offset="0" stop-color="${RC.rich}"/><stop offset="1" stop-color="${RC.poor}"/></linearGradient>
    <linearGradient id="rdf-lbed" gradientUnits="userSpaceOnUse" x1="112" y1="0" x2="234" y2="0"><stop offset="0" stop-color="${RC.poor}"/><stop offset="1" stop-color="${RC.rich}"/></linearGradient>
    <radialGradient id="rdf-gb"><stop offset="0" stop-color="${RC.body}" stop-opacity=".42"/><stop offset="1" stop-color="${RC.body}" stop-opacity="0"/></radialGradient>
    <radialGradient id="rdf-gl"><stop offset="0" stop-color="${RC.lungLoop}" stop-opacity=".4"/><stop offset="1" stop-color="${RC.lungLoop}" stop-opacity="0"/></radialGradient>
  </defs>`;
  let h = gradDefs;
  h += `<ellipse class="rdf-loop b" cx="150" cy="330" rx="230" ry="150" fill="url(#rdf-gb)" opacity="0"/><ellipse class="rdf-loop l" cx="173" cy="100" rx="215" ry="135" fill="url(#rdf-gl)" opacity="0"/>`;
  LOBES.forEach((l) => (h += `<ellipse cx="${l.c[0]}" cy="${l.c[1]}" rx="${l.rx}" ry="${l.ry}" fill="${RC.lung}" fill-opacity=".14" stroke="${RC.lung}" stroke-opacity=".55" stroke-width="2"/>`));
  AIRWAY.forEach((pts, i) => (h += `<path d="${d(smooth(pts, 6))}" fill="none" stroke="${RC.air}" stroke-width="${i ? 5 : 7}" stroke-linecap="round"/>`));
  ALV_MACRO.forEach((a) => (h += `<circle cx="${a.c[0]}" cy="${a.c[1]}" r="${a.r}" fill="#FFD6DF" fill-opacity=".25" stroke="#FFD6DF" stroke-opacity=".7" stroke-width="1.4"/>`));
  CELLS_MACRO.forEach((c) => (h += `<circle cx="${c.c[0]}" cy="${c.c[1]}" r="${c.r}" fill="${RC.cell}" fill-opacity=".2" stroke="${RC.cell}" stroke-width="1.6"/><circle cx="${c.c[0] + 3}" cy="${c.c[1] - 2}" r="${c.r * 0.34}" fill="#C46A3C"/>`));
  // 혈관: 아래에 아직 지나지 않은 길, 위에 혈액의 색(지나온 만큼 그린다)
  const vessel: Partial<Record<FillKey, { el: SVGPathElement[]; len: number[]; t0: number; t1: number }>> = {};
  const vesselPath = (key: FillKey, pts: Pt[][], color: string, w: number, t0 = 0, t1 = 1): void => {
    const els: SVGPathElement[] = [];
    const lens: number[] = [];
    pts.forEach((p) => {
      const dd = d(p);
      h += `<path class="rdf-base" data-v="${key}" d="${dd}" fill="none" stroke="${RC.empty}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>`;
      h += `<path class="rdf-v" data-v="${key}" d="${dd}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
      lens.push(poly(p).len);
    });
    vessel[key] = { el: els, len: lens, t0, t1 };
  };
  const sub = (seg: MacroSeg, a: number, b: number): Pt[] => {
    const pts = PATHS[seg].pts;
    const n = pts.length;
    return pts.slice(Math.floor(a * (n - 1)), Math.ceil(b * (n - 1)) + 1);
  };
  vesselPath("bed", BED_BODY.map((s) => smooth(s, 6)), "url(#rdf-bed)", 4.6);
  vesselPath("lbed", BED_LUNG.map((s) => smooth(s, 6)), "url(#rdf-lbed)", 4.2);
  // 폐정맥을 먼저 그린다: 대동맥 활과 엇갈리는 자리에서 대동맥 아래로 지나간다(같은 층이면 대동맥의 가지처럼 보였다)
  vesselPath("pv", [sub("pv", 0, 0.88)], RC.rich, MACRO_R.pv * 2, 0, 0.88);
  vesselPath("ao", [sub("ao", 0.115, 1)], RC.rich, MACRO_R.ao * 2, 0.115, 1);
  vesselPath("vc", [sub("vc", 0, 0.9)], RC.poor, MACRO_R.vc * 2, 0, 0.9);
  vesselPath("pa", [sub("pa", 0.17, 1)], RC.poor, MACRO_R.pa * 2, 0.17, 1);
  // 심장: 근육(윤곽) 속에 네 방과 판막
  h += `<path d="${d(smooth([...HEART_OUT, HEART_OUT[0]], 6))}Z" fill="${RC.muscle}" fill-opacity=".22" stroke="${RC.muscle}" stroke-width="5" stroke-linejoin="round"/>`;
  (Object.keys(ROOM) as Room[]).forEach((k) => {
    const r = ROOM[k];
    h += `<ellipse class="rdf-room" data-r="${k}" cx="${r.c[0]}" cy="${r.c[1]}" rx="${r.rx}" ry="${r.ry}" fill="${r.rich ? RC.rich : RC.poor}" stroke="#2A1820" stroke-opacity=".35" stroke-width="1.2"/>`;
  });
  VALVES.forEach((v) => {
    [-1, 1].forEach((side) => {
      const px = v.c[0] + (side * v.w) / 2;
      h += `<line class="rdf-flap" data-up="${v.up ? 1 : 0}" data-side="${side}" data-px="${px}" data-py="${v.c[1]}" data-len="${v.w / 2}" x1="${px}" y1="${v.c[1]}" x2="${px - (side * v.w) / 2}" y2="${v.c[1]}" stroke="${RC.valve}" stroke-width="2.6" stroke-linecap="round"/>`;
    });
  });
  // 폐정맥의 흐르는 방향(틀렸을 때)
  [0.32, 0.52, 0.72].forEach((t) => {
    const p = along(PATHS.pv, t);
    const q = along(PATHS.pv, t + 0.03);
    const a = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;
    h += `<path class="rdf-arrow" d="M-6 -5 L6 0 L-6 5 Z" transform="translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${a.toFixed(1)})" fill="#fff" opacity="0"/>`;
  });
  // 정리: 두 순환이 심장 안에서 이어지는 곳(우심방 → 우심실, 좌심방 → 좌심실)
  VALVES.filter((v) => !v.up).forEach((v) => (h += `<path class="rdf-link" d="M-7 -6 L7 -6 L0 7 Z" transform="translate(${v.c[0]} ${v.c[1] + 2})" fill="#fff" stroke="#2A1820" stroke-width="1" opacity="0"/>`));
  // 대정맥이 닿는 곳을 깜빡일 선(틀렸을 때)
  h += `<path class="rdf-hint" d="${d(sub("vc", 0, 1))}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0"/>`;
  // 혈액 한 방울
  h += `<g class="rdf-hero"><circle r="12" fill="#FFE3E8" opacity=".28"/><circle class="rdf-heroc" r="5.6" stroke="#fff" stroke-width="1.6"/><g class="rdf-cargo"></g></g>`;
  macro.innerHTML = h;
  const vEls = Array.from(macro.querySelectorAll<SVGPathElement>(".rdf-v"));
  (Object.keys(vessel) as FillKey[]).forEach((k) => (vessel[k]!.el = vEls.filter((e) => e.dataset.v === k)));
  vEls.forEach((e) => {
    const len = e.getTotalLength?.() || 300;
    e.setAttribute("stroke-dasharray", `0 ${len + 2}`);
    e.dataset.len = String(len);
  });
  const rooms = Array.from(macro.querySelectorAll<SVGEllipseElement>(".rdf-room"));
  const linkEls = Array.from(macro.querySelectorAll<SVGPathElement>(".rdf-link"));
  const baseEls = Array.from(macro.querySelectorAll<SVGPathElement>(".rdf-base"));
  const flapsEl = Array.from(macro.querySelectorAll<SVGLineElement>(".rdf-flap"));
  const arrows = Array.from(macro.querySelectorAll<SVGPathElement>(".rdf-arrow"));
  const hint = macro.querySelector(".rdf-hint") as SVGPathElement;
  const hero = macro.querySelector(".rdf-hero") as SVGGElement;
  const heroC = macro.querySelector(".rdf-heroc") as SVGCircleElement;
  const cargoG = macro.querySelector(".rdf-cargo") as SVGGElement;
  const loopB = macro.querySelector(".rdf-loop.b") as SVGEllipseElement;
  const loopL = macro.querySelector(".rdf-loop.l") as SVGEllipseElement;

  // ── 확대 판 ──
  const microVessel = (seg: MicroSeg, wallC: string, core: string): string => {
    const w = MICRO_WALL[seg];
    const dd = d(PATHS[seg].pts);
    return `<path d="${dd}" fill="none" stroke="${wallC}" stroke-opacity=".38" stroke-width="${w.wall * 2}" stroke-linecap="round"/><path d="${dd}" fill="none" stroke="${wallC}" stroke-width="${(w.wall - w.r) * 0.9 + 1}" stroke-linecap="round" opacity="0"/><path class="rdf-core" data-s="${seg}" d="${dd}" fill="none" stroke="${core}" stroke-width="${w.r * 2}" stroke-linecap="round"/>`;
  };
  let b = `<defs><linearGradient id="rdf-mcap" gradientUnits="userSpaceOnUse" x1="262" y1="126" x2="128" y2="330"><stop class="s0" offset="0" stop-color="${RC.rich}"/><stop class="s1" offset="1" stop-color="${RC.poor}"/></linearGradient>
    <linearGradient id="rdf-lcap" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="346" y2="0"><stop class="s0" offset="0" stop-color="${RC.poor}"/><stop class="s1" offset="1" stop-color="${RC.poor}"/></linearGradient></defs>`;
  MICRO_CELLS.forEach((c) => (b += `<circle cx="${c.c[0]}" cy="${c.c[1]}" r="${c.r}" fill="${RC.cell}" fill-opacity=".16" stroke="${RC.cell}" stroke-width="2.4"/><circle cx="${c.c[0] - 10}" cy="${c.c[1] - 8}" r="${c.r * 0.3}" fill="#C46A3C" opacity=".85"/>`));
  b += microVessel("mart", "#F2A3AE", RC.rich) + microVessel("mcap", "#F6C9D0", "url(#rdf-mcap)") + microVessel("mven", "#C9A4D6", RC.poor);
  // 벽의 두께를 선으로도 보인다(동맥 두꺼움, 정맥 중간, 모세혈관 얇음)
  b += `<g class="rdf-wallglow"><path class="w-art" d="${d(PATHS.mart.pts)}" fill="none" stroke="#fff" stroke-width="${MICRO_WALL.mart.wall * 2}" stroke-linecap="round" opacity="0"/><path class="w-ven" d="${d(PATHS.mven.pts)}" fill="none" stroke="#fff" stroke-width="${MICRO_WALL.mven.wall * 2}" stroke-linecap="round" opacity="0"/></g>`;
  CELL_CO2.forEach((p) => (b += `<circle class="rdf-cco2" cx="${p[0]}" cy="${p[1]}" r="4.4" fill="${RC.co2}"/>`));
  CELL_WASTE.forEach((p) => (b += `<circle class="rdf-cwaste" cx="${p[0]}" cy="${p[1]}" r="4.4" fill="${RC.waste}"/>`));
  BODY_FLIGHTS.forEach((fl) => (b += `<circle class="rdf-fly" r="4.6" fill="${GAS[fl.g]}" opacity="0"/>`));
  b += `<circle class="rdf-bump" r="4.6" fill="${RC.o2}" opacity="0"/>`;
  b += `<g class="rdf-mhero"><ellipse rx="17" ry="13" stroke="#fff" stroke-width="1.4"/><ellipse class="rdf-dimple" rx="7" ry="5" fill="#000" opacity=".16"/><g class="rdf-mcargo"></g></g>`;
  mBody.innerHTML = b;
  let l = `<defs><linearGradient id="rdf-lcap2" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="380" y2="0"><stop class="s0" offset="0" stop-color="${RC.poor}"/><stop class="s1" offset="1" stop-color="${RC.rich}"/></linearGradient></defs>`;
  MICRO_AIRWAY.forEach((pts, i) => (l += `<path d="${d(smooth(pts, 6))}" fill="none" stroke="${RC.air}" stroke-width="${i ? 16 : 22}" stroke-linecap="round"/>`));
  MICRO_ALV.forEach((a) => (l += `<circle class="rdf-alv" cx="${a.c[0]}" cy="${a.c[1]}" r="${a.r}" fill="#BFE3FF" fill-opacity=".12" stroke="#BFE3FF" stroke-width="2.4"/>`));
  l += microVessel("lcap", "#F6C9D0", "url(#rdf-lcap2)");
  ALV_O2.forEach((p) => (l += `<circle cx="${p[0]}" cy="${p[1]}" r="4.6" fill="${RC.o2}"/>`));
  BREATH_IN.forEach(() => (l += `<circle class="rdf-breath" r="4.6" fill="${RC.o2}" opacity="0"/>`));
  LUNG_FLIGHTS.forEach((fl) => (l += `<circle class="rdf-fly" r="4.6" fill="${GAS[fl.g]}" opacity="0"/>`));
  l += `<g class="rdf-mhero"><ellipse rx="17" ry="13" stroke="#fff" stroke-width="1.4"/><ellipse class="rdf-dimple" rx="7" ry="5" fill="#000" opacity=".16"/><g class="rdf-mcargo"></g></g>`;
  mLung.innerHTML = l;

  const q = <K extends Element>(root: Element, sel: string): K[] => Array.from(root.querySelectorAll<K>(sel) as unknown as ArrayLike<K>);
  const bodyFly = q<SVGCircleElement>(mBody, ".rdf-fly");
  const lungFly = q<SVGCircleElement>(mLung, ".rdf-fly");
  const breathEls = q<SVGCircleElement>(mLung, ".rdf-breath");
  const cellCo2 = q<SVGCircleElement>(mBody, ".rdf-cco2");
  const cellWaste = q<SVGCircleElement>(mBody, ".rdf-cwaste");
  const bump = mBody.querySelector(".rdf-bump") as SVGCircleElement;
  const wArt = mBody.querySelector(".w-art") as SVGPathElement;
  const wVen = mBody.querySelector(".w-ven") as SVGPathElement;
  const mHeroB = mBody.querySelector(".rdf-mhero") as SVGGElement;
  const mHeroL = mLung.querySelector(".rdf-mhero") as SVGGElement;

  const alvEls = q<SVGCircleElement>(mLung, ".rdf-alv");

  let st: RideState = startState();
  let dead = false;
  let running = false;
  let lastFollow: Pt = [205, 264];
  let camFrom: Frame = FRAMES.all;
  let cam: Frame = { c: [...FRAMES.all.c] as Pt, z: 1 };
  let camKey = "";
  let prevMicro: "" | "body" | "lung" = "";
  let lastFrame: FrameKey = "all";

  const goal = (f: FrameKey, now: number): Frame => {
    if (f === "body" || f === "lung") return { c: MICRO_AT[f].at, z: MICRO_AT[f].k };
    if (f === "follow") {
      if (!isMicro(st.seg)) lastFollow = along(PATHS[st.seg as MacroSeg], progress(st, now));
      return followFrame(lastFollow);
    }
    return FRAMES[f];
  };
  const dot = (p: Pt, c: string, r = 4.4): string => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${c}"/>`;
  /** 실은 것: 산소는 적혈구에 붙고, 혈장의 알갱이(이산화 탄소, 노폐물, 영양소)는 길을 따라 적혈구 앞뒤에 있다(혈관 안). 자리는 적혈구에서 잰다. */
  const cargo = (g: SVGGElement, path: Poly, t: number, k: number, n: { beads: number; co2: number; nut: number; plasma?: (string | null)[] }): void => {
    const h0 = along(path, t);
    const rel = (sl: Slot): Pt => {
      const c = cargoAt(path, t, sl, k);
      return [c[0] - h0[0], c[1] - h0[1]];
    };
    const r = Math.max(1.6, 4.6 * k);
    let s = "";
    (["b0", "b1", "b2", "b3"] as const).forEach((sl, i) => i < n.beads && (s += dot(rel(sl), RC.o2, r)));
    (["p0", "p1", "p2"] as const).forEach((sl, i) => {
      const c = n.plasma ? n.plasma[i] : i < n.co2 ? RC.co2 : null;
      if (c) s += dot(rel(sl), c, r);
    });
    (["n0", "n1"] as const).forEach((sl, i) => i < n.nut && (s += dot(rel(sl), RC.nut, r)));
    if (g.innerHTML !== s) g.innerHTML = s;
  };
  const fly = (list: Flight[], els: SVGCircleElement[], exT: number, slotAtT: (t: number, slot: Slot) => Pt, on: boolean): Set<string> => {
    const onHero = new Set<string>();
    list.forEach((fl, i) => {
      const e = els[i];
      const hp = (t: number): Pt => slotAtT(t, fl.slot);
      if (!on) {
        e.setAttribute("opacity", "0");
        if (fl.from === "hero") onHero.add(fl.slot);
        return;
      }
      const k = clamp01((exT - fl.t0) / (fl.t1 - fl.t0));
      if (k <= 0 || k >= 1) {
        const end = k <= 0 ? fl.from : fl.to;
        if (end === "hero") {
          onHero.add(fl.slot);
          e.setAttribute("opacity", "0");
        } else {
          e.setAttribute("cx", String(end[0]));
          e.setAttribute("cy", String(end[1]));
          e.setAttribute("opacity", "1");
        }
        return;
      }
      const a = fl.from === "hero" ? hp(fl.t0) : fl.from;
      const bb = fl.to === "hero" ? hp(exT) : fl.to;
      const ee = ease(k);
      e.setAttribute("cx", lerp(a[0], bb[0], ee).toFixed(1));
      e.setAttribute("cy", lerp(a[1], bb[1], ee).toFixed(1));
      e.setAttribute("opacity", "1");
    });
    return onHero;
  };

  const draw = (): boolean => {
    const now = performance.now();
    // 구도
    const key = `${st.frame}:${st.ft0}`;
    if (key !== camKey) {
      camKey = key;
      camFrom = { c: [...cam.c] as Pt, z: cam.z };
      prevMicro = lastFrame === "body" || lastFrame === "lung" ? lastFrame : "";
      lastFrame = st.frame;
    }
    const g = goal(st.frame, now);
    const fk = ease(clamp01((now - st.ft0) / Math.max(1, st.fdur)));
    cam = { c: [lerp(camFrom.c[0], g.c[0], fk), lerp(camFrom.c[1], g.c[1], fk)], z: Math.exp(lerp(Math.log(camFrom.z), Math.log(g.z), fk)) };
    const vw = RW / cam.z;
    const vh = RH / cam.z;
    macro.setAttribute("viewBox", `${(cam.c[0] - vw / 2).toFixed(2)} ${(cam.c[1] - vh / 2).toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`);
    const kk = clamp01((now - st.ft0) / Math.max(1, st.fdur));
    const inn = clamp01((kk - 0.45) / 0.5);
    const out = 1 - clamp01(kk / 0.5);
    const aB = st.frame === "body" ? inn : prevMicro === "body" ? out : 0;
    const aL = st.frame === "lung" ? inn : prevMicro === "lung" ? out : 0;
    mBody.style.opacity = aB.toFixed(3);
    mLung.style.opacity = aL.toFixed(3);
    mBody.style.visibility = aB > 0.01 ? "visible" : "hidden";
    mLung.style.visibility = aL > 0.01 ? "visible" : "hidden";
    macro.style.opacity = (1 - Math.max(aB, aL)).toFixed(3);

    // 지나온 길
    const pr = progress(st, now);
    (Object.keys(vessel) as FillKey[]).forEach((fk2) => {
      const v = vessel[fk2]!;
      let f = st.done.includes(fk2) ? 1 : 0;
      if (st.seg === fk2) f = clamp01((pr - v.t0) / (v.t1 - v.t0));
      v.el.forEach((e) => {
        const len = Number(e.dataset.len);
        e.setAttribute("stroke-dasharray", `${(len * f).toFixed(1)} ${len + 2}`);
        e.style.display = f > 0.002 ? "" : "none";
        e.style.opacity = st.dim.includes(fk2) ? "0.28" : "";
      });
    });
    hint.setAttribute("opacity", st.hint === "vc" && now - st.ht0 < 2400 ? (0.35 + 0.35 * Math.sin(now / 130)).toFixed(2) : "0");
    arrows.forEach((a, i) => a.setAttribute("opacity", st.hint === "pvdir" && now - st.ht0 < 2600 ? (0.5 + 0.5 * Math.sin(((now - st.ht0) / 700 + i * 0.33) * Math.PI * 2)).toFixed(2) : "0"));
    loopB.setAttribute("opacity", st.loops >= 1 ? "1" : "0");
    loopL.setAttribute("opacity", st.loops >= 2 ? "1" : "0");
    baseEls.forEach((e) => (e.style.opacity = st.dim.includes(e.dataset.v as FillKey) ? "0.22" : ""));
    linkEls.forEach((e) => e.setAttribute("opacity", st.links ? "1" : "0"));

    // 박동과 판막
    const sq = beatAmt(st, now);
    rooms.forEach((e) => {
      const k = e.dataset.r as Room;
      const atr = k === "ra" || k === "la";
      const on = (st.beat === "atria" && atr) || (st.beat === "vent" && !atr);
      const s = 1 - (on ? 0.14 * sq : 0);
      const r = ROOM[k];
      e.setAttribute("rx", (r.rx * s).toFixed(2));
      e.setAttribute("ry", (r.ry * s).toFixed(2));
    });
    const ventOn = st.beat === "vent" ? sq : 0;
    flapsEl.forEach((e) => {
      const up = e.dataset.up === "1";
      const side = Number(e.dataset.side);
      const px = Number(e.dataset.px);
      const py = Number(e.dataset.py);
      const open = up ? ventOn : 1 - ventOn;
      const ang = (up ? 1.25 : 1.05) * open;
      const len = Number(e.dataset.len);
      // 막은 바깥 끝에 붙어 가운데 쪽으로 뻗는다. 방실판막은 열리면 아래로, 동맥 쪽 판막은 열리면 위로 젖혀진다(화면 좌표는 아래가 +)
      const x2 = px - side * Math.cos(ang) * len;
      const y2 = py + (up ? -1 : 1) * Math.sin(ang) * len;
      e.setAttribute("x2", x2.toFixed(1));
      e.setAttribute("y2", y2.toFixed(1));
    });

    // 혈액 한 방울(큰 그림). 이름표가 덮지 않게 보이는 자리를 기억해 둔다
    let heroAt: Pt | null = null;
    const o2 = oxygen(st, now);
    const color = mixHex(RC.poor, RC.rich, o2);
    const macroOn = !isMicro(st.seg);
    hero.style.display = macroOn ? "" : "none";
    if (macroOn) {
      const p = along(PATHS[st.seg as MacroSeg], pr);
      hero.setAttribute("transform", `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
      heroC.setAttribute("fill", color);
      const rich = o2 > 0.5;
      cargo(cargoG, PATHS[st.seg as MacroSeg], pr, 0.38, { beads: rich ? 4 : 0, co2: rich ? 0 : 3, nut: 0 });
      heroAt = toStage(p, cam);
    }

    // 확대 판: 온몸
    const exT = now - st.et0;
    if (aB > 0.01) {
      const inBody = st.seg === "mart" || st.seg === "mcap" || st.seg === "mven";
      const exOn = st.ex === "body" && st.seg === "mcap";
      const hp: Pt = inBody ? along(PATHS[st.seg as MicroSeg], pr) : PATHS.mart.pts[PATHS.mart.pts.length - 1];
      const after = st.seg === "mven" || st.done.includes("bed");
      const onHero = fly(BODY_FLIGHTS, bodyFly, exT, (t, sl) => cargoAt(PATHS.mcap, progress(st, st.et0 + t), sl), exOn);
      mHeroB.style.display = inBody ? "" : "none";
      mHeroB.setAttribute("transform", `translate(${hp[0].toFixed(1)} ${hp[1].toFixed(1)})`);
      if (inBody) heroAt = hp;
      (mHeroB.firstElementChild as SVGEllipseElement).setAttribute("fill", color);
      const plasma = (["p0", "p1", "p2"] as const).map((sl) => {
        if (exOn) {
          const fl = BODY_FLIGHTS.find((f) => f.slot === sl);
          return onHero.has(sl) && fl ? GAS[fl.g] : null;
        }
        return after ? (sl === "p2" ? RC.waste : RC.co2) : null;
      });
      cargo(mHeroB.querySelector(".rdf-mcargo") as SVGGElement, inBody ? PATHS[st.seg as MicroSeg] : PATHS.mart, inBody ? pr : 1, 1, exOn ? { beads: ["b0", "b1", "b2", "b3"].filter((s) => onHero.has(s)).length, co2: 0, nut: ["n0", "n1"].filter((s) => onHero.has(s)).length, plasma } : after ? { beads: 0, co2: 3, nut: 0, plasma } : { beads: 4, co2: 0, nut: 2 });
      cellCo2.forEach((e, i) => e.setAttribute("opacity", (exOn && exT > 1100 + i * 220) || after ? "0" : "1"));
      cellWaste.forEach((e, i) => e.setAttribute("opacity", (exOn && exT > 1500 + i * 600) || after ? "0" : "1"));
      const bumpOn = st.ex === "bumpArt" && exT < 1300;
      bump.setAttribute("opacity", bumpOn ? "1" : "0");
      if (bumpOn) {
        const k = exT < 650 ? exT / 650 : 1 - (exT - 650) / 650;
        bump.setAttribute("cx", lerp(hp[0] + SLOT.b1[0], hp[0] + 30, ease(k)).toFixed(1));
        bump.setAttribute("cy", lerp(hp[1] + SLOT.b1[1], hp[1] + 4, ease(k)).toFixed(1));
      }
      wArt.setAttribute("opacity", st.ex === "bumpArt" && exT < 1500 ? (0.18 + 0.14 * Math.sin(exT / 90)).toFixed(2) : "0");
      wVen.setAttribute("opacity", st.ex === "bumpVen" && exT < 1500 ? (0.18 + 0.14 * Math.sin(exT / 90)).toFixed(2) : "0");

    }
    // 확대 판: 허파
    if (aL > 0.01) {
      const inLung = st.seg === "lcap";
      const lungOn = st.ex === "lung" && inLung;
      const lp: Pt = inLung ? along(PATHS.lcap, pr) : PATHS.lcap.pts[0];
      const onHero = fly(LUNG_FLIGHTS, lungFly, exT, (t, sl) => cargoAt(PATHS.lcap, progress(st, st.et0 + t), sl), lungOn);
      mHeroL.style.display = inLung ? "" : "none";
      mHeroL.setAttribute("transform", `translate(${lp[0].toFixed(1)} ${lp[1].toFixed(1)})`);
      if (inLung) heroAt = lp;
      (mHeroL.firstElementChild as SVGEllipseElement).setAttribute("fill", color);
      cargo(mHeroL.querySelector(".rdf-mcargo") as SVGGElement, PATHS.lcap, inLung ? pr : 0, 1, lungOn ? { beads: ["b0", "b1", "b2", "b3"].filter((s) => onHero.has(s)).length, co2: ["p0", "p1", "p2"].filter((s) => onHero.has(s)).length, nut: 0 } : st.done.includes("lbed") ? { beads: 4, co2: 0, nut: 0 } : { beads: 0, co2: 3, nut: 0 });
      const breathOn = st.ex === "breath" || st.ex === "lung";
      const bt = st.ex === "breath" ? exT : st.ex === "lung" ? BREATH_DUR : -1;
      breathEls.forEach((e, i) => {
        const bi = BREATH_IN[i];
        const vis = breathOn && bt >= bi.t0;
        e.setAttribute("opacity", vis ? "1" : "0");
        if (!vis) return;
        const k = ease(clamp01((bt - bi.t0) / 800));
        e.setAttribute("cx", lerp(BREATH_FROM[0], bi.to[0], k).toFixed(1));
        e.setAttribute("cy", lerp(BREATH_FROM[1], bi.to[1], k).toFixed(1));
      });
      const swell = st.ex === "breath" && exT < BREATH_DUR ? Math.sin(Math.PI * clamp01(exT / BREATH_DUR)) : 0;
      alvEls.forEach((e, i) => e.setAttribute("r", (MICRO_ALV[i].r * (1 + 0.06 * swell)).toFixed(1)));

    }

    // 이름표와 단추
    const micNow = st.frame === "body" || st.frame === "lung" ? st.frame : "";
    const settled = kk >= 1;
    ov.layout(
      (k: TagKey) => {
        const a = tagAnchor(k);
        if (!a) return null;
        if ((a.micro ?? "") !== micNow) return null;
        if (!settled && (micNow !== "" || prevMicro !== "")) return null;
        const p = a.micro ? a.p : toStage(a.p, cam);
        return [p[0] + (a.dx ?? 0), p[1] + (a.dy ?? 0)];
      },
      (pk: Pick) => {
        if (pk.at) return pk.at;
        const r = ROOM[pk.key as Room];
        return r ? toStage(r.c, goal(st.frame, st.ft0 + st.fdur + 1)) : [RW / 2, RH / 2];
      },
      heroAt,
    );
    // 아직 움직이는 것이 있는가
    return (
      now - st.t0 < st.dur + 80 ||
      now - st.ft0 < st.fdur + 80 ||
      now - st.ot0 < st.odur + 80 ||
      (!!st.ex && now - st.et0 < 4600) ||
      (!!st.beat && now - st.bt0 < st.bhold + 500) ||
      (!!st.hint && now - st.ht0 < 2700) ||
      st.frame === "follow"
    );
  };
  const run = (): void => {
    if (dead) return;
    const more = draw();
    if (more) o.tm.later(run, 33);
    else running = false;
  };
  const kick = (): void => {
    if (running || dead) return;
    running = true;
    run();
  };
  kick();
  box.classList.add("ready");

  return {
    kind: "flat",
    set(next) {
      st = next;
      ov.sync(next);
      kick();
    },
    dispose() {
      dead = true;
      ov.dispose();
      macro.remove();
      mBody.remove();
      mLung.remove();
      box.classList.remove("g2u6x-rd-flat", "ready");
    },
  };
}
