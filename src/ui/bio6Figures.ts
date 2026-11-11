// bio6Figures: 중1 Ⅱ v5 문제 그림(2026-11-11). 개념과 정리의 그림은 v3(bio4Figures)를 그대로 쓴다.
// 그림 안 글자는 12px 이상, 정답을 드러내는 이름표는 넣지 않는다.

import { cellPartsQuizFig } from "./bio4Figures";
import { ONION_TILE_MM, bvSrc } from "./bio6Kit";
import { webGroup } from "./bio6Web";

/** 식물세포 도해에 (가)~(마)를 붙인 문제 그림. v3의 그림(cellPartsQuizFig)을 쓰되 (라) 세포막의 지시선만 주황 선(세포막)까지 잇는다.
 *  v3 그림은 (라)의 선이 갈색 세포벽의 바깥 가장자리에서 끝나, (나) 세포벽과 같은 곳을 가리키는 것처럼 보인다(v3 그림은 정본이라 건드리지 않는다).
 *  새 끝점은 꼬리표에서 오던 방향 그대로 늘여 세포막 선과 만나는 자리다.
 *  v3 그림(bio4Figures)이 바뀌어 바꿀 곳을 못 찾으면 그 그림을 그대로 돌려주고 콘솔에 알린다. 이 함수는 단원 파일이 읽히는 순간
 *  불리므로 여기서 던지면 앱이 뜨지 않는다. 바뀐 그림이 (라)의 선을 이미 고쳤다면 이 감싸기는 지워도 된다(e2e-u2v5의 C가 이 선을 본다). */
export function cellPartsFigV5(): string {
  const from = `x1="53" y1="182"`;
  const fig = cellPartsQuizFig();
  const end = fig.lastIndexOf("</svg>");
  if (!fig.includes(from) || end < 0) {
    console.error("[u2v5] 식물세포 도해에서 (라)의 지시선을 찾지 못했어요. bio4Figures.cellPartsQuizFig가 바뀌었는지 보고 bio6Figures.cellPartsFigV5를 맞춰 주세요.");
    return fig;
  }
  // 지시선이 닿는 자리에 점을 찍는다. 세포벽(갈색 띠)과 세포막(주황 선)은 붙어 있어서 선 끝만으로는 어느 쪽인지 헷갈린다.
  const dots = [[105, 92], [268, 92], [150, 148], [60, 169], [243, 158]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#4E5968" stroke="#fff" stroke-width="1"/>`).join("");
  const out = fig.replace(from, `x1="60" y1="169"`);
  return out.slice(0, out.lastIndexOf("</svg>")) + dots + "</svg>";
}

/** 세 세포 그림(u2l4 문제): 신경세포, 적혈구, 상피세포를 나란히 놓고 (가)~(다)를 붙인다.
 *  v3의 세 폭 그림은 상피세포가 연두색이라 식물의 세포처럼 보여서, 랩(cellFitLab)에서 본 분홍 상피세포와 같은 그림으로 맞춘다.
 *  이름표에 세포 이름을 쓰지 않는다(정답이 드러난다). 바탕은 구작 두 장의 종이색(#FCF6ED)에 맞춘다.
 *  img로 넣는다(실플레이 검사가 문제 그림의 img가 떴는지 본다). lazy 로딩은 쓰지 않는다. */
export function cellTrioFig(): string {
  const cell = (path: string, lab: string): string =>
    `<figure style="margin:0"><img src="${bvSrc(path)}" alt="세포 그림 ${lab}" draggable="false" style="display:block;width:100%;aspect-ratio:1;object-fit:contain;border-radius:12px;background:#FCF6ED"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">${lab}</figcaption></figure>`;
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${cell("bio3/figs/cell-nerve.webp", "(가)")}${cell("bio3/figs/cell-rbc.webp", "(나)")}${cell("bio6/levels/epi-tissue.webp", "(다)")}</div>`;
}

/** 양파 껍질 현미경 사진 + 0.1 mm 눈금자(문제용). 세포 한 칸의 양 끝에서 점선을 내려 눈금자로 읽게 한다.
 *  축척은 랩(magnifyLab)과 같은 자다(거울 타일 한 장 = ONION_TILE_MM). 여기서는 1 mm = 460px(눈금 한 칸 0.1 mm = 46px).
 *  사진 칸에는 거울 타일의 오른쪽 위 한 장(원본의 좌우 뒤집힘)만 보인다. 타일 한 장을 넘지 않으니 거울 이음매가 안 보인다.
 *  표시한 세포는 그 장의 가로 7.7%에서 63.2%까지 뻗은 칸이다(양 끝 벽과 테두리의 자리는 그림에서 쟀다). 칸을 옅게 칠해 표시한다.
 *  타일 폭의 55.5%이므로 138px, 눈금 세 칸에 꼭 맞는다.
 *  사진과 눈금을 폭 284px의 한 상자 안에 px로 놓아서 문제 그림 칸의 폭이 달라져도(폰 폭 360~430) 둘의 비율이 어긋나지 않는다.
 *  주의: 문제 그림 칸의 svg는 폭 100%로 늘어나는 규칙을 받는다(.q-figure-art svg). 눈금 svg에는 px 크기를 style로 박아 둔다. */
export function onionRulerFig(): string {
  const PX_MM = 460;
  const T = ONION_TILE_MM * PX_MM; // 타일 한 장의 화면 크기(약 248px)
  const BOX = { x: 18, y: 10, w: 248, h: 132 };
  const step = PX_MM / 10;
  const xL = BOX.x + 0.077 * T; // 세포의 왼쪽 끝
  const xR = BOX.x + 0.632 * T; // 세포의 오른쪽 끝
  const yL = BOX.y + 0.174 * T; // 왼쪽 끝 벽의 가운데 높이
  const yR = BOX.y + 0.11 * T; // 오른쪽 끝 벽의 가운데 높이
  const RY = 168; // 눈금자 높이
  const ticks = [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${(xL + i * step).toFixed(1)} ${RY}v-${i === 0 || i === 5 ? 14 : 9}"/>`).join("");
  const guides = `M${xL.toFixed(1)} ${yL.toFixed(1)}V${RY}M${xR.toFixed(1)} ${yR.toFixed(1)}V${RY}`;
  // 표시한 세포의 테두리(타일의 %: 그림에서 잰 다섯 꼭짓점). 어느 칸인지 한눈에 보이게 옅게 칠한다.
  const cell = [[61.5, 6.8], [50.5, 6.9], [7.8, 13.7], [7.5, 21.0], [64.5, 15.5]]
    .map(([x, y]) => `${(BOX.x + (x / 100) * T).toFixed(1)},${(BOX.y + (y / 100) * T).toFixed(1)}`)
    .join(" ");
  const halo = `stroke="#0A1322" stroke-width="3.6" paint-order="stroke" stroke-linejoin="round"`;
  return `<div role="img" aria-label="양파 껍질을 크게 본 사진. 하얗게 표시한 세포 한 칸의 양 끝에서 눈금자로 점선이 내려와 있다" style="border-radius:12px;background:#0E1A2B">
    <div style="position:relative;width:284px;height:204px;margin:0 auto">
      <div style="position:absolute;left:${BOX.x}px;top:${BOX.y}px;width:${BOX.w}px;height:${BOX.h}px;border-radius:10px;background:url('${bvSrc("bio6/micro/onion-mirror.webp")}') ${(-T).toFixed(1)}px 0px / ${(2 * T).toFixed(1)}px ${(2 * T).toFixed(1)}px no-repeat;filter:saturate(.62) brightness(1.08)"></div>
      <svg viewBox="0 0 284 204" style="position:absolute;left:0;top:0;width:284px;height:204px;max-width:none;max-height:none" xmlns="http://www.w3.org/2000/svg" fill="none">
        <polygon points="${cell}" fill="#fff" fill-opacity=".26" stroke="#0A1322" stroke-width="4.4" stroke-opacity=".45" stroke-linejoin="round"/>
        <polygon points="${cell}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
        <path d="${guides}" stroke="#0A1322" stroke-width="3.6" stroke-linecap="round" opacity=".5"/>
        <path d="${guides}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="4 4"/>
        <text x="${(xL + 50).toFixed(1)}" y="${(yL - 12).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" ${halo}>세포 한 칸</text>
        <path d="M${xL.toFixed(1)} ${RY}H${(xL + step * 5).toFixed(1)}" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
        <g stroke="#fff" stroke-width="2.2" stroke-linecap="round">${ticks}</g>
        <text x="${(xL + (step * 5) / 2).toFixed(1)}" y="${RY + 24}" text-anchor="middle" font-size="13" font-weight="800" fill="#EAF0FA">눈금 한 칸 = 0.1 mm</text>
      </svg>
    </div>
  </div>`;
}

/** (나) 생태계의 먹이 관계 그림(u2l10 문제). 랩의 무대와 같은 자리, 같은 화살표를 밝은 바탕에 그린다.
 *  화살표는 먹히는 생물에서 먹는 생물 쪽을 가리킨다. 그림 칸에서 폭에 맞춰 늘어나도 비율은 그대로다. */
export function foodWebFig(): string {
  return `<svg class="fwb-fig" viewBox="96 38 248 186" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="아홉 가지 생물의 먹이 관계. 화살표는 먹히는 생물에서 먹는 생물 쪽을 가리킨다">${webGroup("B")}</svg>`;
}

