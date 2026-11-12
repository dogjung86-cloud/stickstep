// [중2 Ⅱ v5] g2u2l8 랩 1, 2: 대륙 이동설.
//
// 랩 1 「두 대륙의 해안선은 맞물릴까요?」(g2u2FitLab)
//   책의 해 보기(대륙의 해안선 맞추기: 해안선 모양과 화석 분포로 대륙 조각을 맞춘다)를 남아메리카와 아프리카 두 조각으로 한다.
//   학생이 정하는 것: 남아메리카 조각을 옮기는 거리와 돌리는 각도(막대 둘). '맞춰 보기'로 확인한다.
//   실패가 보이는 길: 덜 옮기면 틈이 남고, 방향이 어긋나면 해안선이 겹치거나 벌어진다(어긋난 채로 보인다).
//   판정 하나: 두 대륙에서 같은 화석이 나오는 띠가 맞춘 뒤 어떻게 됐는가. 통찰 하나: 해안선도, 화석의 분포도 이어진다.
//   두 조각의 모양은 지금 단원의 도입 그림(맞물리는 해안선 곡선)을 도구로 가져왔다.
//
// 랩 2 「더운 인도에 왜 빙하의 흔적이 있을까요?」(g2u2IceLab)
//   책의 그림(대륙 이동설의 증거: 빙하의 흔적)과 스스로 확인하기(열대인 인도 남부의 빙하 흔적)를 손으로 한다.
//   학생이 정하는 것: 대륙을 모으는 정도(막대). 먼저 예측한다(정오를 매기지 않는다).
//   판정 하나: 대륙을 모으자 빙하의 흔적이 어떻게 됐는가. 통찰 하나: 대륙이 한곳에 모여 있다가 이동했다.
//   대륙의 모양은 실제 해안선이다(Natural Earth 110m, gondwanaData.ts). 대륙을 모으는 움직임은 곤드와나 대륙의 맞춤 회전을 따른다.

import type { StepRenderer } from "../../types";
import { bvRange } from "../bio6/b6Lab";
import { G, gBtn, gLab, gPredict, haptic, HAPTIC, label, svgOpen, type GStep } from "./kit";
import { GONDWANA, type GondwanaLand } from "./gondwanaData";

/* ══════════ 랩 1: 해안선 맞추기 ══════════ */
const EDGE = "C98 44 98 50 100 56 C106 62 120 64 126 72 C130 80 118 86 112 94 C106 104 100 118 96 134";
const EDGE_REV = "C100 118 106 104 112 94 C118 86 130 80 126 72 C120 64 106 62 100 56 C98 50 98 44 106 38";
const SA = `M106 38 ${EDGE} Q94 144 88 151 Q81 156 79 148 Q76 140 78 131 Q73 114 69 98 Q63 78 67 62 Q72 46 86 40 Q98 34 106 38 Z`;
const AF = `M96 134 ${EDGE_REV} Q120 32 138 33 Q157 35 163 47 Q167 54 171 59 Q163 67 157 75 Q152 96 142 112 Q131 129 119 137 Q104 144 96 134 Z`;

export const g2u2FitLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-fit" });
  const { f, tm } = lab;
  f.stage.innerHTML = `${svgOpen}
    <rect width="346" height="230" fill="#12325C"/>
    <g transform="translate(64 -24) scale(1.36)">
      <g class="g2u2x-ft-af"><path d="${AF}" fill="#D9B45F" stroke="#8E6A24" stroke-width="1.4"/><path d="M110 97 L142 88" stroke="#12A594" stroke-width="11" stroke-linecap="round" opacity=".85"/></g>
      <g class="g2u2x-ft-sa"><path d="${SA}" fill="#86C06C" stroke="#4E7A38" stroke-width="1.4"/><path d="M80 105 L110 97" stroke="#12A594" stroke-width="11" stroke-linecap="round" opacity=".85"/></g>
      <path class="g2u2x-ft-seam" d="M106 38 ${EDGE}" stroke="#fff" stroke-width="2.2" fill="none"/>
    </g>
    ${label(258, 208, "아프리카", { size: 13, cls: "g2u2x-halo" })}
    ${label(0, 0, "남아메리카", { size: 13, cls: "g2u2x-ft-sn g2u2x-halo" })}
    <rect x="10" y="10" width="14" height="10" rx="3" fill="#12A594"/>${label(30, 20, "같은 화석이 나오는 곳", { anchor: "start", size: 12.5, cls: "g2u2x-halo" })}
  </svg>`;
  const sa = lab.q<SVGGElement>(".g2u2x-ft-sa"), sn = lab.q<SVGTextElement>(".g2u2x-ft-sn");
  let mv = 8, rot = 8, locked = false;
  const paint = (): void => {
    const dx = -(1 - mv / 100) * 72, deg = locked ? 0 : rot - 30;
    sa.setAttribute("transform", `translate(${dx.toFixed(1)} ${((1 - mv / 100) * 10).toFixed(1)}) rotate(${deg} 88 95)`);
    sn.setAttribute("x", (64 + (84 + dx) * 1.36).toFixed(1));
    sn.setAttribute("y", "208");
    host.dataset.g2Fit = `${mv},${rot}`;
  };
  const rMv = bvRange({ cls: "g2u2x-ft-mv", min: 0, max: 100, value: mv, label: "남아메리카를 아프리카 쪽으로 옮기기", onInput: (v) => { if (!locked) { mv = v; paint(); hintNow(); } } });
  const rRot = bvRange({ cls: "g2u2x-ft-rot", min: 0, max: 60, value: rot, label: "남아메리카 돌리기", onInput: (v) => { if (!locked) { rot = v; paint(); hintNow(); } } });
  rMv.input.dataset.k = "mv";
  rRot.input.dataset.k = "rot";
  const check = gBtn("check", "해안선 맞춰 보기");
  function hintNow(): void {
    lab.hint(Math.abs(rot - 30) > 4 ? "range:rot=30" : mv < 94 ? "range:mv=100" : "check");
  }
  check.addEventListener("click", () => {
    if (locked) return;
    const badRot = Math.abs(rot - 30) > 4, far = mv < 94;
    if (badRot || far) {
      haptic(HAPTIC.wrong);
      host.dataset.g2Miss = String(Number(host.dataset.g2Miss ?? 0) + 1);
      f.say(far ? "두 대륙 사이에 아직 <b>틈</b>이 남아 있어요. 더 가까이 옮겨 보세요." : "방향이 어긋나서 해안선이 <b>맞물리지 않아요</b>. 조각을 돌려 보세요.");
      return;
    }
    haptic(HAPTIC.correct);
    locked = true;
    mv = 100;
    paint();
    f.stage.classList.add("fit");
    rMv.input.disabled = rRot.input.disabled = check.disabled = true;
    f.pips(2);
    f.say("남아메리카의 동쪽 해안선과 아프리카의 서쪽 해안선이 <b>맞물렸어요</b>. 초록 띠도 살펴보세요.");
    tm.later(() => lab.ask("두 대륙에서 <b>같은 화석</b>이 나오는 띠는 어떻게 됐나요?", ["하나로 이어졌다", "여전히 어긋나 있다", "한쪽 대륙에만 남았다"], "해안선을 맞추자 화석이 나오는 곳도 <b>한 줄로</b> 이어졌어요.", () =>
      lab.finish("바다를 사이에 둔 두 대륙의 <b>해안선 모양</b>이 잘 맞물리고, 같은 화석이 나오는 곳도 <b>이어져요</b>. 두 대륙이 과거에 붙어 있었다고 생각할 만한 까닭이에요."),
    ), 1100);
  });
  paint();
  f.slot.setControls(rMv.el, rRot.el, check);
  f.say("남아메리카와 아프리카가 바다를 사이에 두고 떨어져 있어요. 조각을 <b>옮기고 돌려서</b> 해안선을 맞춰 보세요.");
  api.setCTA("해안선을 맞춰 보세요", { enabled: false });
  hintNow();
  return lab.cleanup;
};

/* ══════════ 랩 2: 빙하의 흔적 모으기 ══════════ */
// 지도는 남극을 가운데에 둔 그림이다. 대륙의 자리는 남극에서 잰 거리(위도)와 방향(경도)으로 놓고,
// 대륙의 모양은 저마다 제 가운데를 기준으로 펼쳐서(방위 정거) 눈에 익은 모양 그대로 보이게 한다.
// 막대를 밀면 대륙마다 정해진 회전(gondwanaData.ts, 남극 고정)의 일부만큼 지구 위에서 돌려 옮긴다.
const RAD = Math.PI / 180;
const PX = 1.15; // 1도 = 1.15px
const POLE: [number, number] = [173, 166]; // 무대에서 남극점의 자리
const LON0 = 37; // 이 경도가 위쪽을 향한다
type V3 = [number, number, number];
const vec = (lon: number, lat: number): V3 => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
/** 극 k를 축으로 ang도 돌린다(로드리게스 회전). */
function spin(v: V3, k: V3, ang: number): V3 {
  const c = Math.cos(ang * RAD), s = Math.sin(ang * RAD), d = dot(k, v), cr = cross(k, v);
  return [v[0] * c + cr[0] * s + k[0] * d * (1 - c), v[1] * c + cr[1] * s + k[1] * d * (1 - c), v[2] * c + cr[2] * s + k[2] * d * (1 - c)];
}
interface Land {
  d: GondwanaLand;
  pts: V3[];
  ice: V3[];
  mid: V3;
  pole: V3;
}
const LANDS: Land[] = GONDWANA.map((d) => {
  const pts = d.outline.map(([lon, lat]) => vec(lon, lat));
  const mid = norm(pts.reduce<V3>((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]));
  // 빙하의 흔적: 가운데에서 반지름만큼 떨어진 점들을 이은 둥근 테두리(대륙 윤곽으로 잘라 보인다)
  const c = vec(d.ice[0], d.ice[1]);
  const side = norm(cross(c, Math.abs(c[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1]));
  const rim = spin(c, side, d.ice[2]);
  const ice = Array.from({ length: 20 }, (_, i) => spin(rim, c, i * 18));
  return { d, pts, ice, mid, pole: vec(d.rot[1], d.rot[0]) };
});
/** 대륙 하나를 t(0 지금, 1 먼 옛날)만큼 옮겨 무대 좌표로 펼친다. */
function place(l: Land, t: number): { path: string; ice: string; at: [number, number]; top: number } {
  const ang = l.d.rot[2] * t;
  const m = spin(l.mid, l.pole, ang);
  const lat = Math.asin(Math.max(-1, Math.min(1, m[2]))) / RAD, th = (Math.atan2(m[1], m[0]) / RAD - LON0) * RAD;
  const r = (90 + lat) * PX;
  const at: [number, number] = [POLE[0] + r * Math.sin(th), POLE[1] - r * Math.cos(th)];
  const u: [number, number] = [Math.sin(th), -Math.cos(th)], e: [number, number] = [Math.cos(th), Math.sin(th)]; // 북쪽(남극에서 멀어지는 쪽)과 동쪽
  const north = norm([-m[0] * m[2], -m[1] * m[2], 1 - m[2] * m[2]]), east = norm(cross([0, 0, 1], m));
  let top = at[1];
  const flat = (list: V3[]): string => list.map((p0) => {
    const p = spin(p0, l.pole, ang);
    const dist = Math.acos(Math.max(-1, Math.min(1, dot(m, p))));
    const k = (dist < 1e-6 ? 1 : dist / Math.sin(dist)) / RAD * PX;
    const pn = dot(p, north) * k, pe = dot(p, east) * k;
    const x = at[0] + pn * u[0] + pe * e[0], y = at[1] + pn * u[1] + pe * e[1];
    if (y < top) top = y;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" L");
  const path = `M${flat(l.pts)} Z`;
  return { path, ice: `M${flat(l.ice)} Z`, at, top };
}

export const g2u2IceLab: StepRenderer = (host, step, api) => {
  const lab = gLab(host, api, step as unknown as GStep, { steps: 3, cls: "g2u2x-icel" });
  const { f, tm } = lab;
  const eq = 90 * PX;
  f.stage.innerHTML = `${svgOpen}
    <rect width="346" height="230" fill="#12325C"/>
    <circle cx="${POLE[0]}" cy="${POLE[1]}" r="${eq}" stroke="#FFD43B" stroke-width="1.4" stroke-dasharray="6 5" opacity=".8"/>
    <defs>${LANDS.map((l) => `<clipPath id="g2ic-${l.d.k}"><path class="g2u2x-ic-c c-${l.d.k}"/></clipPath>`).join("")}</defs>
    ${LANDS.map((l) => `<path class="g2u2x-ic-l l-${l.d.k}" fill="${l.d.color}" stroke="rgba(0,0,0,.45)" stroke-width="1" stroke-linejoin="round"/>
      <path class="g2u2x-ic-i i-${l.d.k}" clip-path="url(#g2ic-${l.d.k})" fill="#F4FAFF" stroke="#8FB6D6" stroke-width="1.2"/>`).join("")}
    <circle class="g2u2x-ic-cap" cx="${POLE[0] - 4}" cy="${POLE[1] - 14}" r="52" stroke="#fff" stroke-width="2" stroke-dasharray="5 5" fill="none"/>
    ${LANDS.map((l) => label(0, 0, l.d.name, { size: 12, cls: `g2u2x-halo n-${l.d.k}` })).join("")}
    ${label(POLE[0] + eq * Math.sin(62 * RAD) + 5, POLE[1] - eq * Math.cos(62 * RAD), "적도(더운 곳)", { anchor: "start", size: 12, fill: G.gold, cls: "g2u2x-halo" })}
    <rect x="10" y="9" width="14" height="10" rx="3" fill="#F4FAFF"/>${label(30, 19, "빙하의 흔적", { anchor: "start", size: 12.5 })}
    ${label(336, 19, "남극을 가운데에 둔 지도", { anchor: "end", size: 12, fill: G.dim, weight: 600 })}
  </svg>`;
  const q = (c: string): SVGElement[] => LANDS.map((l) => lab.q<SVGElement>(`.${c}-${l.d.k}`));
  const land = q("l"), clip = q("c"), ice = q("i"), names = q("n");
  let g = 0, pred = "", locked = false;
  const paint = (): void => {
    const t = g / 100;
    LANDS.forEach((l, i) => {
      const p = place(l, t);
      land[i].setAttribute("d", p.path);
      clip[i].setAttribute("d", p.path);
      ice[i].setAttribute("d", p.ice);
      // 이름표는 맨 위 겹에 둔다. 남극은 대륙 아래쪽, 나머지는 대륙 위쪽에 붙인다.
      names[i].setAttribute("x", Math.max(34, Math.min(300, p.at[0])).toFixed(1));
      names[i].setAttribute("y", (l.d.k === "an" ? p.at[1] + 40 : Math.max(34, p.top - 4)).toFixed(1));
    });
    host.dataset.g2G = String(g);
  };
  const range = bvRange({ cls: "g2u2x-ic-r", min: 0, max: 100, value: 0, label: "떨어진 대륙을 하나로 모으기", ticks: ["지금", "먼 옛날"], onInput: (v) => {
    if (locked) return;
    g = v;
    paint();
    if (g < 97) return;
    locked = true;
    g = 100;
    range.set(100);
    range.input.disabled = true;
    paint();
    haptic(HAPTIC.correct);
    f.stage.classList.add("joined");
    f.pips(2);
    f.say(`${pred.startsWith("옛날에는 인도") ? "예측대로" : "예측과 달리"} 인도가 <b>남극 가까이</b>로 옮겨 갔어요. 흰 빙하의 흔적을 살펴보세요.`);
    tm.later(() => lab.ask("대륙을 모으자 <b>빙하의 흔적</b>은 어떻게 됐나요?", ["남극 둘레에 하나로 모였다", "더 멀리 흩어졌다", "적도 쪽으로 옮겨 갔다"], "흩어져 있던 빙하의 흔적이 <b>한 덩어리</b>로 이어졌어요.", () =>
      lab.finish("여러 대륙에 흩어져 있는 <b>빙하의 흔적</b>은 대륙을 하나로 모으면 한곳에 모여요. 지금은 더운 인도도 먼 옛날에는 남극 가까이에 붙어 있다가 지금의 자리로 <b>이동</b>한 거예요."),
    ), 1100);
  } });
  range.input.dataset.k = "g";
  paint();
  f.say("지금은 더운 <b>인도</b>와 아프리카에도 먼 옛날 빙하가 덮였던 흔적이 있어요. 먼저 까닭을 예측해 보세요.");
  gPredict(lab, "더운 인도에 <b>빙하의 흔적</b>이 있는 까닭은 무엇일까요?", ["옛날에는 인도가 추운 곳에 있었다", "옛날에는 지구 전체가 얼어 있었다", "빙하가 바다를 건너 떠내려왔다"], (picked) => {
    pred = picked;
    f.pips(1);
    f.slot.setControls(range.el);
    f.say("막대를 밀어 떨어진 대륙들을 <b>하나로 모아</b> 보세요. 빙하의 흔적이 어떻게 되는지 지켜봐요.");
    api.setCTA("대륙을 끝까지 모아 보세요", { enabled: false });
    lab.hint("range:g=100");
  });
  return lab.cleanup;
};
