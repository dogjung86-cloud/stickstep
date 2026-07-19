// bodyFigures — 중2 VI 동물과 에너지 개념·퀴즈 SVG와 recap 미니아트.
// 채점에 필요한 구조·방향·물질 이동은 모두 코드 벡터로 정확하게 그린다.

import {
  bodyArrow, bodyDefs, bodyMatterSvg, bloodTube, organSilhouette, valveSvg,
  type BodyOrgan,
} from "./bodyKit";

const svg = (inner: string, defs = "", label = "동물과 에너지 도해", viewBox = "0 0 360 220"): string =>
  `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="${label}"><title>${label}</title><defs>${defs}</defs>${inner}</svg>`;

const panel = (tone = "var(--subj-body-tint)"): string =>
  `<rect x="8" y="8" width="344" height="204" rx="18" fill="${tone}"/>`;

const labelBox = (x: number, y: number, w: number, text: string, fill = "var(--n0)"): string =>
  `<g transform="translate(${x} ${y})"><rect width="${w}" height="24" rx="12" fill="${fill}" stroke="var(--n200)"/><text x="${w / 2}" y="16" text-anchor="middle" font-size="12" font-weight="850" fill="var(--n800)">${text}</text></g>`;

export type BodyMiniKind =
  | "nutrients" | "tests" | "digest" | "absorb" | "heart" | "vessels" | "blood"
  | "circulation" | "breath" | "alveoli" | "kidney" | "nephron" | "cellResp" | "integrate";

const MINI_LABEL: Record<BodyMiniKind, string> = {
  nutrients: "여러 영양소 미니 그림",
  tests: "영양소 검출 시험관 미니 그림",
  digest: "소화계 미니 그림",
  absorb: "융털 흡수 미니 그림",
  heart: "심장 미니 그림",
  vessels: "혈관 미니 그림",
  blood: "혈액 성분 미니 그림",
  circulation: "이중 순환 미니 그림",
  breath: "호흡운동 미니 그림",
  alveoli: "허파꽈리 미니 그림",
  kidney: "콩팥 미니 그림",
  nephron: "콩팥단위 미니 그림",
  cellResp: "세포호흡 미니 그림",
  integrate: "기관계 통합 미니 그림",
};

export function bodyMiniArt(kind: BodyMiniKind): string {
  const defs = `${bodyDefs("bm")}${bodyArrow("bm-a", "var(--subj-body)")}${bodyArrow("bm-o", "var(--body-oxygen)")}`;
  if (kind === "nutrients") return svg(
    `${bodyMatterSvg("glucose", 18, 22, 7)}${bodyMatterSvg("amino", 42, 21, 7)}${bodyMatterSvg("fat", 31, 44, 8)}
     <path d="M11 55 H53" stroke="var(--body-shadow)" stroke-width="5" opacity=".1" stroke-linecap="round"/>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "tests") return svg(
    `<path d="M10 10 V43 Q10 54 20 54 Q30 54 30 43 V10 M34 10 V43 Q34 54 44 54 Q54 54 54 43 V10" fill="url(#bm-airway)" stroke="var(--body-airway-lo)" stroke-width="1.5"/>
     <path d="M12 35 V44 Q12 51 20 51 Q28 51 28 44 V35Z" fill="var(--body-protein)"/><path d="M36 35 V44 Q36 51 44 51 Q52 51 52 44 V35Z" fill="var(--body-nutrient)"/>
     <path d="M14 15 C17 12 20 12 23 14" stroke="var(--n0)" stroke-width="2" opacity=".6"/>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "digest") return svg(
    `${organSilhouette("stomach", 34, 33, 0.72, "bm")}<path d="M29 7 C24 14 25 22 27 28" stroke="var(--body-airway-lo)" stroke-width="4" stroke-linecap="round"/>
     <path d="M25 52 C16 48 14 57 25 57 C38 58 48 52 44 45" fill="none" stroke="var(--body-nutrient)" stroke-width="3" stroke-linecap="round"/>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "absorb") return svg(
    `<path d="M9 54 C12 43 12 13 23 9 C34 13 33 42 36 54 M28 54 C31 42 34 19 45 15 C56 19 53 45 56 54" fill="url(#bm-tissue)" stroke="var(--body-tissue-lo)" stroke-width="1.4"/>
     <path d="M23 17 C20 29 20 42 21 53 M45 23 C42 34 43 45 44 54" stroke="var(--body-oxygenated)" stroke-width="2.2"/>
     ${bodyMatterSvg("glucose", 13, 21, 4)}`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "heart") return svg(
    `${organSilhouette("heart", 32, 34, 0.82, "bm")}`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "vessels") return svg(
    `${bloodTube("bm-v1", "M10 15 C25 8 38 10 54 16", "oxygenated", 8)}${bloodTube("bm-v2", "M10 49 C25 55 39 54 54 47", "deoxygenated", 8)}
     <path d="M10 30 C22 24 42 37 54 29" stroke="var(--body-vessel)" stroke-width="3" stroke-linecap="round"/>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "blood") return svg(
    `<circle cx="19" cy="24" r="10" fill="var(--body-oxygenated)" stroke="var(--body-vessel-lo)" stroke-width="1.4"/><circle cx="19" cy="24" r="4" fill="var(--subj-body-tint)" opacity=".8"/>
     <circle cx="44" cy="25" r="12" fill="url(#bm-airway)" stroke="var(--body-airway-lo)" stroke-width="1.4"/><circle cx="45" cy="25" r="5" fill="var(--body-protein)"/>
     <g fill="var(--body-fat)" stroke="var(--body-cell-lo)" stroke-width="1">${[[13,48],[25,45],[38,49],[51,45]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join("")}</g>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "circulation") return svg(
    `${organSilhouette("heart", 32, 34, 0.43, "bm")}<path d="M30 25 C8 16 7 48 29 43" stroke="var(--body-deoxygenated)" stroke-width="4" marker-end="url(#bm-a)"/><path d="M35 25 C57 15 58 49 36 43" stroke="var(--body-oxygenated)" stroke-width="4" marker-end="url(#bm-a)"/>
     <circle cx="9" cy="31" r="5" fill="var(--body-airway)"/><circle cx="55" cy="31" r="5" fill="var(--body-cell)"/>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "breath") return svg(
    `${organSilhouette("lungs", 32, 35, 0.75, "bm")}<path d="M11 54 Q32 43 53 54" stroke="var(--body-protein)" stroke-width="3" stroke-linecap="round"/><path d="M32 4 V13" stroke="var(--body-oxygen)" stroke-width="3" marker-end="url(#bm-o)"/>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "alveoli") return svg(
    `<path d="M8 30 C18 30 18 21 24 21" stroke="var(--body-airway-lo)" stroke-width="4"/><g fill="url(#bm-tissue)" stroke="var(--body-tissue-lo)" stroke-width="1.2"><circle cx="31" cy="20" r="9"/><circle cx="42" cy="24" r="9"/><circle cx="34" cy="34" r="9"/><circle cx="47" cy="37" r="9"/></g>
     <path d="M22 48 C33 56 52 53 56 40" stroke="var(--body-deoxygenated)" stroke-width="4"/><path d="M25 45 C33 50 47 49 52 41" stroke="var(--body-oxygenated)" stroke-width="2"/>
     ${bodyMatterSvg("oxygen", 33, 42, 3.5)}`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "kidney") return svg(
    `${organSilhouette("kidneys", 32, 32, 0.78, "bm")}`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "nephron") return svg(
    `<circle cx="19" cy="20" r="11" fill="url(#bm-kidney)" stroke="var(--body-kidney-lo)" stroke-width="1.4"/><path d="M12 20 C15 11 24 29 27 17 C30 9 32 26 25 29" stroke="var(--body-oxygenated)" stroke-width="2.2"/>
     <path d="M28 25 C43 20 49 28 40 34 C29 42 52 42 51 53" stroke="var(--body-urea)" stroke-width="4" stroke-linecap="round"/><path d="M30 19 C47 12 57 23 53 36" stroke="var(--body-deoxygenated)" stroke-width="2.5"/>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  if (kind === "cellResp") return svg(
    `${organSilhouette("cell", 35, 33, 0.72, "bm")}${bodyMatterSvg("glucose", 9, 19, 5)}${bodyMatterSvg("oxygen", 10, 42, 4)}
     <path d="M15 20 L23 25 M15 41 L23 37" stroke="var(--subj-body)" stroke-width="2.4" marker-end="url(#bm-a)"/>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
  const organs: BodyOrgan[] = ["stomach", "lungs", "kidneys"];
  return svg(
    `${organs.map((o, i) => organSilhouette(o, 12 + i * 20, 18, 0.25, "bm")).join("")}${organSilhouette("cell", 32, 48, 0.35, "bm")}
     <path d="M12 28 C15 37 22 40 28 43 M32 28 V40 M52 28 C49 37 42 40 36 43" stroke="var(--subj-body)" stroke-width="2" marker-end="url(#bm-a)"/>`,
    defs, MINI_LABEL[kind], "0 0 64 64",
  );
}

export function digestiveSystemFig(): string {
  return svg(
    `${panel()}<path d="M109 31 C79 46 70 83 78 119 C84 154 72 181 55 203 H210 C194 178 184 153 191 116 C199 76 179 42 148 30Z" fill="var(--n0)" stroke="var(--body-tissue-lo)" stroke-width="1.5" opacity=".82"/>
     <circle cx="129" cy="34" r="14" fill="url(#dig-tissue)" stroke="var(--body-tissue-lo)" stroke-width="1.5"/><path d="M129 46 C126 67 132 82 132 95" stroke="var(--body-airway-lo)" stroke-width="6" stroke-linecap="round"/>
     <path d="M129 48 C141 52 145 45 149 41" stroke="var(--body-protein)" stroke-width="5" stroke-linecap="round"/><path d="M103 86 C122 72 154 76 168 91 C151 104 119 103 103 86Z" fill="var(--body-urea)" stroke="var(--body-cell-lo)" stroke-width="1.5"/>
     ${organSilhouette("stomach", 135, 111, 0.58, "dig")}<path d="M105 130 C89 132 89 178 108 183 C127 188 163 187 176 174 C188 161 183 132 167 128" stroke="var(--body-organ-lo)" stroke-width="8" stroke-linecap="round" fill="none"/>
     <path d="M116 139 C145 127 174 140 151 151 C126 162 116 173 157 177" stroke="var(--body-nutrient)" stroke-width="5" stroke-linecap="round" fill="none"/>
     <path d="M177 99 C199 91 204 105 192 115" stroke="var(--body-fat)" stroke-width="5" stroke-linecap="round"/><path d="M145 184 V199" stroke="var(--body-organ-lo)" stroke-width="6" stroke-linecap="round"/>
     ${[[247,30,"입"],[247,58,"침샘"],[247,86,"식도"],[247,114,"위"],[247,142,"간·쓸개·이자"],[247,170,"작은창자"],[247,198,"큰창자·항문"]].map(([x,y,t],i) => `<path d="M${i < 3 ? 145 : i === 3 ? 157 : i === 4 ? 181 : i === 5 ? 151 : 179} ${i < 3 ? 34 + i * 18 : i === 3 ? 110 : i === 4 ? 103 : i === 5 ? 154 : 168} H${Number(x)-8}" stroke="var(--n400)" stroke-width="1.2"/><text x="${x}" y="${Number(y)+4}" font-size="12.5" font-weight="800" fill="var(--n800)">${t}</text>`).join("")}`,
    bodyDefs("dig"), "입에서 항문까지 이어진 소화계 구조 도해",
  );
}

export function nutrientTestFig(): string {
  const tests = [
    ["녹말", "아이오딘 용액", "var(--blue-press)"],
    ["단백질", "뷰렛 용액", "var(--body-protein)"],
    ["지방", "수단 III 용액", "var(--body-oxygenated)"],
    ["당류", "베네딕트·가열", "var(--body-nutrient)"],
  ];
  return svg(
    `${panel()}${tests.map(([food, reagent, color], i) => {
      const x = 28 + i * 82;
      return `<g transform="translate(${x} 28)"><ellipse cx="30" cy="12" rx="23" ry="7" fill="var(--body-airway-hi)" stroke="var(--body-airway-lo)" stroke-width="1.5"/><path d="M7 12 V105 Q7 124 30 124 Q53 124 53 105 V12" fill="url(#nt-glass)" stroke="var(--body-airway-lo)" stroke-width="1.5"/>
      <path d="M10 72 V105 Q10 119 30 119 Q50 119 50 105 V72Z" fill="${color}" opacity=".92"/><path d="M14 24 C22 19 31 19 38 21" stroke="var(--n0)" stroke-width="3" opacity=".64" stroke-linecap="round"/>
      <text x="30" y="146" text-anchor="middle" font-size="13" font-weight="900" fill="var(--n800)">${food}</text><text x="30" y="163" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--n600)">${reagent}</text></g>`;
    }).join("")}<text x="180" y="207" text-anchor="middle" font-size="11.5" font-weight="750" fill="var(--n600)">시약마다 확인하는 영양소와 반응색이 달라요</text>`,
    `<linearGradient id="nt-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--n0)" stop-opacity=".88"/><stop offset=".5" stop-color="var(--body-airway-hi)" stop-opacity=".42"/><stop offset="1" stop-color="var(--body-airway)" stop-opacity=".22"/></linearGradient>`,
    "네 가지 영양소 검출 반응을 비교한 도해",
  );
}

export function enzymeFlowFig(): string {
  const box = (x: number, y: number, w: number, text: string, fill: string): string =>
    `<g transform="translate(${x} ${y})"><rect width="${w}" height="38" rx="12" fill="${fill}" stroke="var(--n300)"/><text x="${w / 2}" y="24" text-anchor="middle" font-size="12.5" font-weight="850" fill="var(--n800)">${text}</text></g>`;
  return svg(
    `${panel()}${box(20,24,68,"녹말","var(--body-cell-hi)")}${box(144,24,68,"엿당","var(--body-cell-hi)")}${box(272,24,68,"포도당","var(--body-cell-hi)")}
     <path d="M90 43 H140 M214 43 H268" stroke="var(--body-nutrient)" stroke-width="4" marker-end="url(#ef-n)"/><text x="115" y="30" text-anchor="middle" font-size="10.5" font-weight="800" fill="var(--n700)">아밀레이스</text><text x="241" y="30" text-anchor="middle" font-size="10.5" font-weight="800" fill="var(--n700)">작은창자</text>
     ${box(20,91,82,"단백질","var(--subj-body-tint)")}${box(252,91,88,"아미노산","var(--subj-body-tint)")}<path d="M106 110 H248" stroke="var(--body-protein)" stroke-width="4" marker-end="url(#ef-p)"/><text x="177" y="99" text-anchor="middle" font-size="10.5" font-weight="800" fill="var(--n700)">펩신·트립신</text>
     ${box(20,158,68,"지방","var(--body-fat)")}${box(235,151,105,"지방산 +","var(--body-fat)")}<text x="288" y="199" text-anchor="middle" font-size="11.5" font-weight="850" fill="var(--n800)">모노글리세라이드</text><path d="M92 177 H231" stroke="var(--body-cell-lo)" stroke-width="4" marker-end="url(#ef-f)"/><text x="160" y="166" text-anchor="middle" font-size="10.5" font-weight="800" fill="var(--n700)">라이페이스</text>`,
    `${bodyArrow("ef-n", "var(--body-nutrient)")}${bodyArrow("ef-p", "var(--body-protein)")}${bodyArrow("ef-f", "var(--body-cell-lo)")}`,
    "세 영양소가 소화효소에 의해 작은 물질로 분해되는 흐름도",
  );
}

export function villusAbsorptionFig(): string {
  return svg(
    `${panel()}<path d="M30 187 C36 160 37 47 86 29 C133 48 131 159 139 187 M112 187 C119 158 125 58 174 40 C223 58 217 158 226 187 M207 187 C214 160 221 50 270 31 C319 52 315 161 329 187" fill="url(#va-tissue)" stroke="var(--body-tissue-lo)" stroke-width="2"/>
     <path d="M86 55 C70 86 69 142 75 182 M86 55 C103 86 105 143 98 182" stroke="var(--body-oxygenated)" stroke-width="4"/><path d="M86 65 V184" stroke="var(--body-fat)" stroke-width="6" stroke-linecap="round"/>
     ${bodyMatterSvg("glucose", 49, 83, 6)}${bodyMatterSvg("amino", 118, 91, 6)}${bodyMatterSvg("fat", 54, 126, 7)}
     <path d="M54 84 C64 91 67 105 70 119 M115 92 C103 101 101 116 99 129" stroke="var(--body-nutrient)" stroke-width="3" marker-end="url(#va-b)"/><path d="M59 127 C72 132 78 144 83 155" stroke="var(--body-fat)" stroke-width="3" marker-end="url(#va-l)"/>
     ${labelBox(235,72,82,"모세혈관")}${labelBox(235,112,82,"암죽관")}<path d="M232 84 H104 M232 124 H91" stroke="var(--n400)" stroke-width="1.2"/><text x="180" y="207" text-anchor="middle" font-size="12" font-weight="800" fill="var(--n700)">주름과 융털이 흡수할 표면적을 넓혀요</text>`,
    `<linearGradient id="va-tissue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-tissue-hi)"/><stop offset=".55" stop-color="var(--body-tissue)"/><stop offset="1" stop-color="var(--body-tissue-lo)"/></linearGradient>${bodyArrow("va-b", "var(--body-nutrient)")}${bodyArrow("va-l", "var(--body-fat)")}`,
    "작은창자 융털 속 모세혈관과 암죽관의 흡수 도해",
  );
}

function heartCore(id: string): string {
  return `<path d="M104 45 C72 53 67 93 78 124 C88 154 108 177 142 190 C173 174 199 151 206 117 C215 79 190 45 158 46 C143 47 132 54 123 66 C118 54 113 48 104 45Z" fill="url(#${id}-organ)" stroke="var(--body-organ-lo)" stroke-width="2"/>
  <path d="M123 66 V174" stroke="var(--body-organ-lo)" stroke-width="3"/><path d="M77 107 H205" stroke="var(--body-organ-lo)" stroke-width="3"/>
  <path d="M83 84 C61 77 51 63 50 43 M88 142 C64 149 52 164 49 183" stroke="var(--body-deoxygenated)" stroke-width="12" stroke-linecap="round"/>
  <path d="M180 82 C205 72 219 54 218 34 M174 142 C204 151 223 169 226 190" stroke="var(--body-oxygenated)" stroke-width="12" stroke-linecap="round"/>
  ${valveSvg(102,107,0,true,12,id)}${valveSvg(158,107,0,true,12,id)}`;
}

export function heartFourChamberFig(): string {
  return svg(
    `${panel()}<g transform="translate(10 2) scale(.82)">${heartCore("hf")}</g>
     ${labelBox(224,35,76,"우심방")}${labelBox(224,69,76,"우심실")}${labelBox(224,113,76,"좌심방")}${labelBox(224,147,76,"좌심실")}<path d="M220 47 H98 M220 81 H95 M220 125 H155 M220 159 H153" stroke="var(--n400)" stroke-width="1.2"/>
     <text x="55" y="208" font-size="11" font-weight="800" fill="var(--body-deoxygenated)">산소가 적은 피</text><text x="230" y="208" font-size="11" font-weight="800" fill="var(--body-oxygenated)">산소가 많은 피</text>`,
    bodyDefs("hf"), "두 심방과 두 심실, 판막과 큰 혈관을 나타낸 심장 도해",
  );
}

export function vesselCompareFig(): string {
  const art = (x: number, kind: "artery" | "capillary" | "vein", name: string): string => {
    if (kind === "capillary") return `<g transform="translate(${x} 28)"><rect width="96" height="150" rx="16" fill="var(--n0)" stroke="var(--n200)"/><path d="M17 70 C32 48 64 91 80 63" stroke="var(--body-oxygenated)" stroke-width="7" stroke-linecap="round"/><g fill="var(--body-oxygenated)" opacity=".9">${[[27,62],[47,71],[67,67]].map(([cx,cy]) => `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="4"/>`).join("")}</g><text x="48" y="126" text-anchor="middle" font-size="12" font-weight="800" fill="var(--n600)">한 겹의 얇은 벽</text><text x="48" y="143" text-anchor="middle" font-size="12" font-weight="900" fill="var(--n800)">${name}</text></g>`;
    const blood = kind === "artery" ? "var(--body-oxygenated)" : "var(--body-deoxygenated)";
    return `<g transform="translate(${x} 28)"><rect width="96" height="150" rx="16" fill="var(--n0)" stroke="var(--n200)"/><ellipse cx="48" cy="66" rx="35" ry="31" fill="url(#vc-tissue)" stroke="var(--body-vessel-lo)" stroke-width="2"/><ellipse cx="48" cy="66" rx="${kind === "artery" ? 15 : 24}" ry="${kind === "artery" ? 13 : 21}" fill="${blood}"/>
      ${kind === "vein" ? `<path d="M35 48 Q47 61 48 68 Q49 61 61 48" fill="var(--body-tissue-hi)" stroke="var(--body-tissue-lo)" stroke-width="1.5"/>` : ""}<text x="48" y="126" text-anchor="middle" font-size="12" font-weight="800" fill="var(--n600)">${kind === "artery" ? "두껍고 탄력 있는 벽" : "넓은 속공간·판막"}</text><text x="48" y="143" text-anchor="middle" font-size="12" font-weight="900" fill="var(--n800)">${name}</text></g>`;
  };
  return svg(
    `${panel()}${art(20,"artery","동맥")}${art(132,"capillary","모세혈관")}${art(244,"vein","정맥")}<text x="180" y="205" text-anchor="middle" font-size="11.5" font-weight="750" fill="var(--n600)">혈액의 이동 방향과 압력에 맞게 벽 구조가 달라요</text>`,
    `<linearGradient id="vc-tissue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-tissue-hi)"/><stop offset=".54" stop-color="var(--body-tissue)"/><stop offset="1" stop-color="var(--body-tissue-lo)"/></linearGradient>`,
    "동맥과 모세혈관, 정맥의 벽 구조 비교 도해",
  );
}

export function bloodComponentsFig(): string {
  const cellCard = (x: number, name: string, art: string, sub: string): string =>
    `<g transform="translate(${x} 30)"><rect width="76" height="145" rx="15" fill="var(--n0)" stroke="var(--n200)"/>${art}<text x="38" y="111" text-anchor="middle" font-size="12.5" font-weight="900" fill="var(--n800)">${name}</text><text x="38" y="130" text-anchor="middle" font-size="10.5" font-weight="750" fill="var(--n600)">${sub}</text></g>`;
  return svg(
    `${panel()}${cellCard(18,"혈장",`<path d="M14 35 Q38 17 62 35 V77 Q38 91 14 77Z" fill="var(--body-fat)" opacity=".72" stroke="var(--body-cell-lo)" stroke-width="1.5"/>`,"물질 운반")}
     ${cellCard(102,"적혈구",`<ellipse cx="38" cy="55" rx="25" ry="18" fill="var(--body-oxygenated)" stroke="var(--body-vessel-lo)" stroke-width="1.6"/><ellipse cx="38" cy="55" rx="10" ry="6" fill="var(--subj-body-tint)" opacity=".8"/>`,"산소 운반")}
     ${cellCard(186,"백혈구",`<circle cx="38" cy="55" r="26" fill="url(#bc-white)" stroke="var(--body-airway-lo)" stroke-width="1.6"/><path d="M28 47 C38 37 52 46 49 59 C45 71 27 70 25 58Z" fill="var(--body-protein)"/>`,"몸 보호")}
     ${cellCard(270,"혈소판",`<g fill="var(--body-fat)" stroke="var(--body-cell-lo)" stroke-width="1.2">${[[22,44],[43,39],[55,57],[29,67],[45,72]].map(([x,y]) => `<path d="M${x} ${y-5} l5 4 -3 6 -7 -1 -2 -6Z"/>`).join("")}</g>`,"혈액응고")}<text x="180" y="205" text-anchor="middle" font-size="11.5" font-weight="750" fill="var(--n600)">혈액은 액체 성분과 세포 성분이 함께 움직여요</text>`,
    `<linearGradient id="bc-white" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--n0)"/><stop offset=".58" stop-color="var(--body-airway-hi)"/><stop offset="1" stop-color="var(--body-airway)"/></linearGradient>`,
    "혈장과 적혈구, 백혈구, 혈소판의 모양과 기능 도해",
  );
}

export function doubleCirculationFig(): string {
  return svg(
    `${panel("var(--n0)")}<g transform="translate(106 2) scale(.62)">${heartCore("dc")}</g>${organSilhouette("lungs", 67, 51, 0.62, "dc")}${organSilhouette("cell", 292, 150, 0.62, "dc")}
     <path d="M125 73 C98 57 91 52 82 52" stroke="var(--body-deoxygenated)" stroke-width="7" marker-end="url(#dc-v)"/><path d="M83 66 C99 84 112 88 134 91" stroke="var(--body-oxygenated)" stroke-width="7" marker-end="url(#dc-r)"/>
     <path d="M169 92 C221 88 263 110 282 134" stroke="var(--body-oxygenated)" stroke-width="7" marker-end="url(#dc-r)"/><path d="M279 170 C228 190 176 172 151 139" stroke="var(--body-deoxygenated)" stroke-width="7" marker-end="url(#dc-v)"/>
     ${labelBox(20,95,94,"허파순환")}${labelBox(238,38,94,"온몸순환")}<text x="180" y="210" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--n600)">두 순환은 심장에서 이어져 한 흐름을 만들어요</text>`,
    `${bodyDefs("dc")}${bodyArrow("dc-v", "var(--body-deoxygenated)")}${bodyArrow("dc-r", "var(--body-oxygenated)")}`,
    "심장과 허파, 온몸을 잇는 두 혈액 순환 경로 도해",
  );
}

export function respiratorySystemFig(): string {
  return svg(
    `${panel()}<path d="M83 29 C65 43 64 70 75 83 C87 98 87 118 83 194 H213 C209 151 210 116 220 86 C227 62 203 32 178 27Z" fill="var(--n0)" opacity=".82" stroke="var(--body-tissue-lo)" stroke-width="1.5"/>
     <path d="M126 32 C111 32 104 41 104 50 C105 59 116 62 128 60" fill="url(#rs-airway)" stroke="var(--body-airway-lo)" stroke-width="2"/><path d="M128 58 V102" stroke="var(--body-airway-lo)" stroke-width="9" stroke-linecap="round"/><path d="M128 94 L100 122 M128 94 L158 122" stroke="var(--body-airway-lo)" stroke-width="7" stroke-linecap="round"/>
     ${organSilhouette("lungs", 129, 143, 1.02, "rs")}<g fill="url(#rs-tissue)" stroke="var(--body-tissue-lo)" stroke-width="1.2"><circle cx="244" cy="95" r="12"/><circle cx="261" cy="103" r="13"/><circle cx="246" cy="118" r="12"/><circle cx="268" cy="125" r="12"/></g><path d="M160 124 C194 108 212 105 234 106" stroke="var(--body-airway-lo)" stroke-width="4"/>
     ${labelBox(270,35,58,"코")}${labelBox(270,68,58,"숨관")}${labelBox(270,151,70,"허파꽈리")}<path d="M265 47 H126 M265 80 H129 M265 163 L258 131" stroke="var(--n400)" stroke-width="1.2"/>`,
    `${bodyDefs("rs")}<linearGradient id="rs-airway" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-airway-hi)"/><stop offset=".55" stop-color="var(--body-airway)"/><stop offset="1" stop-color="var(--body-airway-lo)"/></linearGradient><linearGradient id="rs-tissue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-tissue-hi)"/><stop offset=".56" stop-color="var(--body-tissue)"/><stop offset="1" stop-color="var(--body-tissue-lo)"/></linearGradient>`,
    "코와 숨관, 숨관가지, 허파와 허파꽈리의 호흡계 도해",
  );
}

export function breathCompareFig(): string {
  const chest = (x: number, inhale: boolean): string => {
    const diaphragm = inhale ? "M20 119 Q74 139 128 119" : "M20 107 Q74 82 128 107";
    return `<g transform="translate(${x} 27)"><rect width="148" height="157" rx="17" fill="var(--n0)" stroke="var(--n200)"/>
      <path d="M24 28 C15 58 15 101 24 132 M124 28 C133 58 133 101 124 132" stroke="var(--body-cell-lo)" stroke-width="7" stroke-linecap="round"/>
      ${organSilhouette("lungs", 74, 77, inhale ? 0.9 : 0.68, "br")}<path d="${diaphragm}" stroke="var(--body-protein)" stroke-width="5" stroke-linecap="round"/>
      <path d="M74 12 V31" stroke="var(--body-oxygen)" stroke-width="4" marker-end="url(#${inhale ? "br-in" : "br-out"})" ${inhale ? "" : `transform="rotate(180 74 22)"`}/>
      <text x="74" y="149" text-anchor="middle" font-size="13" font-weight="900" fill="var(--n800)">${inhale ? "들숨" : "날숨"}</text></g>`;
  };
  return svg(
    `${panel()}${chest(22,true)}${chest(190,false)}<text x="96" y="207" text-anchor="middle" font-size="11" font-weight="750" fill="var(--n600)">가로막 아래·흉강 넓어짐</text><text x="264" y="207" text-anchor="middle" font-size="11" font-weight="750" fill="var(--n600)">가로막 위·흉강 좁아짐</text>`,
    `${bodyDefs("br")}${bodyArrow("br-in", "var(--body-oxygen)")}${bodyArrow("br-out", "var(--body-oxygen)")}`,
    "들숨과 날숨 때 갈비뼈와 가로막, 허파 부피를 비교한 도해",
  );
}

export function alveoliExchangeFig(): string {
  return svg(
    `${panel("var(--n0)")}<path d="M31 108 C62 108 63 75 87 75" stroke="var(--body-airway-lo)" stroke-width="11" stroke-linecap="round"/><g fill="url(#ae-tissue)" stroke="var(--body-tissue-lo)" stroke-width="2">${[[113,58,30],[155,68,32],[104,104,32],[151,113,34],[122,151,31]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
     <path d="M64 185 C117 206 185 177 196 119 C204 73 243 45 323 52" stroke="var(--body-deoxygenated)" stroke-width="13" stroke-linecap="round"/><path d="M68 181 C119 194 177 168 185 117 C195 61 252 57 323 64" stroke="var(--body-oxygenated)" stroke-width="6" stroke-linecap="round"/>
     ${bodyMatterSvg("oxygen", 170, 78, 6)}${bodyMatterSvg("oxygen", 205, 87, 6)}${bodyMatterSvg("carbon", 189, 137, 6)}${bodyMatterSvg("carbon", 160, 152, 6)}
     <path d="M166 86 C176 98 181 106 184 116 M202 94 C211 104 218 108 226 110" stroke="var(--body-oxygen)" stroke-width="3" marker-end="url(#ae-o)"/><path d="M187 132 C179 120 170 113 160 107 M158 147 C149 135 142 126 135 115" stroke="var(--body-carbon)" stroke-width="3" marker-end="url(#ae-c)"/>
     ${labelBox(232,146,92,"모세혈관")}${labelBox(25,24,92,"허파꽈리")}<text x="180" y="210" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--n600)">얇은 벽을 사이에 두고 기체가 서로 반대 방향으로 이동해요</text>`,
    `<linearGradient id="ae-tissue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-tissue-hi)"/><stop offset=".55" stop-color="var(--body-tissue)"/><stop offset="1" stop-color="var(--body-tissue-lo)"/></linearGradient>${bodyArrow("ae-o", "var(--body-oxygen)")}${bodyArrow("ae-c", "var(--body-carbon)")}`,
    "허파꽈리와 모세혈관 사이 산소와 이산화 탄소 이동 도해",
  );
}

export function excretorySystemFig(): string {
  return svg(
    `${panel()}<path d="M122 24 C89 39 73 70 78 111 C84 151 77 180 61 203 H232 C216 178 209 145 215 108 C220 67 195 34 164 23Z" fill="var(--n0)" stroke="var(--body-tissue-lo)" stroke-width="1.5" opacity=".84"/>
     ${organSilhouette("kidneys", 147, 90, 1.03, "ex")}<path d="M119 106 C119 132 126 148 136 166 M174 106 C174 132 167 148 158 166" stroke="var(--body-urea)" stroke-width="5" stroke-linecap="round"/>
     <path d="M135 163 Q147 151 159 163 V184 Q147 198 135 184Z" fill="url(#ex-airway)" stroke="var(--body-airway-lo)" stroke-width="2"/><path d="M147 190 V207" stroke="var(--body-urea)" stroke-width="5" stroke-linecap="round"/>
     ${labelBox(255,50,64,"콩팥")}${labelBox(255,88,72,"오줌관")}${labelBox(255,129,64,"방광")}${labelBox(255,169,56,"요도")}<path d="M250 62 H176 M250 100 H174 M250 141 L160 177 M250 181 H149" stroke="var(--n400)" stroke-width="1.2"/>`,
    bodyDefs("ex"), "콩팥과 오줌관, 방광, 요도로 이어진 배설계 도해",
  );
}

export function nephronProcessFig(): string {
  return svg(
    `${panel("var(--n0)")}<circle cx="77" cy="72" r="42" fill="url(#np-kidney)" stroke="var(--body-kidney-lo)" stroke-width="2"/><path d="M42 74 C46 39 82 102 108 56 C118 38 127 75 103 94 C76 115 51 94 42 74" stroke="var(--body-oxygenated)" stroke-width="6" fill="none" stroke-linecap="round"/>
     <path d="M111 61 C139 49 151 67 139 87 C125 111 178 108 168 137 C158 166 217 153 219 190" stroke="var(--body-urea)" stroke-width="12" fill="none" stroke-linecap="round"/>
     <path d="M110 49 C170 23 247 42 260 88 C273 134 236 166 207 169" stroke="var(--body-deoxygenated)" stroke-width="7" fill="none" stroke-linecap="round"/>
     <path d="M102 83 C119 90 126 97 132 108" stroke="var(--body-nutrient)" stroke-width="3" marker-end="url(#np-f)"/><path d="M164 117 C185 99 211 89 245 88" stroke="var(--body-oxygen)" stroke-width="3" marker-end="url(#np-r)"/><path d="M248 126 C222 129 199 139 177 151" stroke="var(--body-carbon)" stroke-width="3" marker-end="url(#np-s)"/>
     ${labelBox(18,147,72,"여과")}${labelBox(112,20,72,"재흡수")}${labelBox(260,145,72,"분비")}<text x="180" y="211" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--n600)">토리·보먼주머니·세뇨관에서 물질의 이동 방향이 달라요</text>`,
    `<linearGradient id="np-kidney" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--body-kidney-hi)"/><stop offset=".55" stop-color="var(--body-kidney)"/><stop offset="1" stop-color="var(--body-kidney-lo)"/></linearGradient>${bodyArrow("np-f", "var(--body-nutrient)")}${bodyArrow("np-r", "var(--body-oxygen)")}${bodyArrow("np-s", "var(--body-carbon)")}`,
    "콩팥단위에서 여과와 재흡수, 분비가 일어나는 도해",
  );
}

export function cellRespirationFig(): string {
  return svg(
    `<rect x="8" y="8" width="344" height="234" rx="18" fill="var(--subj-body-tint)"/>
     <g transform="translate(18 49)"><rect width="94" height="126" rx="15" fill="var(--n0)" stroke="var(--n200)"/><text x="47" y="23" text-anchor="middle" font-size="12" font-weight="900" fill="var(--n800)">필요한 물질</text>
       <g transform="translate(10 37)"><rect width="74" height="31" rx="10" fill="var(--body-cell-hi)"/><circle cx="16" cy="15.5" r="7" fill="var(--body-nutrient)"/><text x="48" y="20" text-anchor="middle" font-size="12" font-weight="850" fill="var(--n800)">영양소</text></g>
       <g transform="translate(10 78)"><rect width="74" height="31" rx="10" fill="var(--body-airway-hi)"/><circle cx="16" cy="15.5" r="7" fill="var(--body-oxygen)"/><text x="48" y="20" text-anchor="middle" font-size="12" font-weight="850" fill="var(--n800)">산소</text></g>
     </g>
     <path d="M116 101 H137 M116 143 H137" stroke="var(--subj-body)" stroke-width="4" marker-end="url(#cr-in)"/>
     <g><circle cx="180" cy="117" r="55" fill="var(--body-tissue-hi)" stroke="var(--body-tissue-lo)" stroke-width="2"/><circle cx="180" cy="117" r="46" fill="var(--n0)" opacity=".42"/>
       <path d="M155 109 C165 88 197 89 205 108 C211 127 190 146 165 138 C148 133 145 120 155 109Z" fill="var(--body-cell)" stroke="var(--body-cell-lo)" stroke-width="1.8"/>
       <path d="M163 112 C173 103 185 126 197 113 M161 128 C174 116 184 138 199 125" stroke="var(--body-cell-lo)" stroke-width="2"/>
       <text x="180" y="171" text-anchor="middle" font-size="12" font-weight="900" fill="var(--n800)">조직세포</text><text x="180" y="187" text-anchor="middle" font-size="10.5" font-weight="800" fill="var(--n600)">마이토콘드리아</text>
     </g>
     <g transform="translate(151 16)"><path d="M29 0 L37 17 L55 20 L41 32 L45 50 L29 40 L13 50 L17 32 L3 20 L21 17Z" fill="var(--body-nutrient)" stroke="var(--body-cell-lo)" stroke-width="1.4"/><text x="29" y="29" text-anchor="middle" font-size="10" font-weight="900" fill="var(--n800)">에너지</text></g>
     <path d="M223 101 H244 M223 143 H244" stroke="var(--body-carbon)" stroke-width="4" marker-end="url(#cr-out)"/>
     <g transform="translate(248 49)"><rect width="94" height="126" rx="15" fill="var(--n0)" stroke="var(--n200)"/><text x="47" y="23" text-anchor="middle" font-size="12" font-weight="900" fill="var(--n800)">생긴 물질</text>
       <g transform="translate(8 37)"><rect width="78" height="31" rx="10" fill="#EEE9FA"/><circle cx="14" cy="15.5" r="7" fill="var(--body-carbon)"/><text x="51" y="20" text-anchor="middle" font-size="11" font-weight="850" fill="var(--n800)">이산화 탄소</text></g>
       <g transform="translate(8 78)"><rect width="78" height="31" rx="10" fill="var(--body-airway-hi)"/><path d="M14 7 C23 18 20 25 14 25 C8 25 5 18 14 7Z" fill="var(--body-oxygen)"/><text x="51" y="20" text-anchor="middle" font-size="12" font-weight="850" fill="var(--n800)">물</text></g>
     </g>
     <g transform="translate(21 204)"><rect width="318" height="28" rx="14" fill="var(--n0)" stroke="var(--n200)"/><text x="159" y="18.5" text-anchor="middle" font-size="11.3" font-weight="900" fill="var(--n700)">영양소 + 산소 → 에너지 + 이산화 탄소 + 물</text></g>`,
    `${bodyDefs("cr")}${bodyArrow("cr-in", "var(--subj-body)")}${bodyArrow("cr-out", "var(--body-carbon)")}`,
    "조직세포의 마이토콘드리아에서 영양소와 산소로 에너지, 이산화 탄소, 물을 만드는 세포호흡 도해",
    "0 0 360 250",
  );
}

export function bodySystemsIntegrationFig(): string {
  const row = (y: number, matter: string, color: string, source: string, target: string, id: string): string => `
    <g transform="translate(0 ${y})">
      <rect x="14" y="5" width="63" height="30" rx="15" fill="${color}" opacity=".16" stroke="${color}"/><text x="45.5" y="24.5" text-anchor="middle" font-size="10.5" font-weight="900" fill="${color}">${matter}</text>
      <rect x="84" y="0" width="72" height="40" rx="12" fill="var(--n0)" stroke="var(--n300)"/><text x="120" y="25" text-anchor="middle" font-size="12" font-weight="900" fill="var(--n800)">${source}</text>
      <path d="M159 20 H173" stroke="${color}" stroke-width="4" marker-end="url(#${id})"/>
      <rect x="176" y="0" width="72" height="40" rx="12" fill="var(--subj-body-tint)" stroke="var(--subj-body)"/><text x="212" y="25" text-anchor="middle" font-size="12" font-weight="900" fill="var(--subj-body-press)">순환계</text>
      <path d="M251 20 H265" stroke="${color}" stroke-width="4" marker-end="url(#${id})"/>
      <rect x="268" y="0" width="78" height="40" rx="12" fill="var(--n0)" stroke="var(--n300)"/><text x="307" y="25" text-anchor="middle" font-size="12" font-weight="900" fill="var(--n800)">${target}</text>
    </g>`;
  return svg(
    `<rect x="8" y="8" width="344" height="264" rx="18" fill="var(--n0)" stroke="var(--n200)"/>
     <text x="180" y="29" text-anchor="middle" font-size="13" font-weight="900" fill="var(--n800)">네 기관계와 조직세포 사이 물질의 길</text>
     ${row(42,"영양소","var(--body-nutrient)","소화계","조직세포","bi-n")}
     ${row(101,"산소","var(--body-oxygen)","호흡계","조직세포","bi-o")}
     ${row(160,"이산화 탄소","var(--body-carbon)","조직세포","호흡계","bi-c")}
     ${row(219,"요소","var(--body-urea)","조직세포","배설계","bi-u")}`,
    `${bodyArrow("bi-n", "var(--body-nutrient)")}${bodyArrow("bi-o", "var(--body-oxygen)")}${bodyArrow("bi-u", "var(--body-urea)")}${bodyArrow("bi-c", "var(--body-carbon)")}`,
    "소화계와 순환계, 호흡계, 배설계가 조직세포와 연결된 통합 도해",
    "0 0 360 280",
  );
}
