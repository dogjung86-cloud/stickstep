// gen-worldmap.mjs — 사회 트랙 세계지도 데이터 생성 (1회 실행 → 산출물 커밋)
//   입력: tmp/worldmap/land-110m.json  (Natural Earth 110m land, world-atlas@2 — 퍼블릭 도메인)
//         tmp/worldmap/land-50m.json   (Natural Earth 50m — 태평양 섬 선별 병합용, 사회 Ⅵ)
//         tmp/worldmap/kg/Koeppen-Geiger-ASCII.txt (Kottek et al. 2006, 0.5° 격자 — 인용 조건 무료)
//   출력: src/ui/worldMap.generated.ts  (육지 SVG path + 1° 기후 판정 격자 + 극중심 원판 path)
//         public/soc/climate.webp       (기후 색 오버레이 — SVG에서 육지 path로 클립해서 쓴다)
//   기후 6분류(교과서): 1 열대(A) · 2 건조(B) · 3 온대(C) · 4 냉대(D) · 5 한대(E) · 6 고산
//   고산 규칙: ① |위도|≤25°의 Cfb/Cwb/ET/EF(적도 부근 고산 — 안데스·동아프리카·뉴기니)
//              ② 티베트 상자(lon 75~103, lat 27~38)의 ET/EF(시짱고원 — 사회과부도 관행)
//   사회 Ⅵ(오세아니아) 확장 3종(2026-07-19):
//   ① 태평양 밴드 +360° 복제 — 서경에 통째로 있는 링(사모아·통가·하와이 등)은 기존 규칙
//      (±180° "걸침" 링만 복제)으로는 x>1000 사본이 없어 날짜변경선 동쪽 크롭에서 안 보인다.
//      maxLon≤−90 링을 +360°로도 그린다(추가분은 x 1000~1250 — 기존 소비처 크롭 밖·무해).
//   ② 50m 태평양 섬 병합 — 110m에는 피지·솔로몬·바누아투·뉴칼레도니아 말고 태평양 섬이
//      없다(사모아·통가·투발루·미크로네시아 전무 — 실측). 50m에서 태평양 상자(lon 128~215
//      언랩·lat −25~15) 안 링만 골라 병합한다. 110m 육지 위 중복 링(피지 바누아레부 등)은
//      **정밀 pip(evenodd)** 로 걸러낸다 — bbox 검사는 언랩 유라시아 링(−377~−170°)이 서태평양을
//      통째로 덮어 사모아·통가를 오탐 제거하는 함정(실측)이 있다.
//   ③ 극중심 원판 베이크 — 미래엔 122쪽 도법 그대로(방위 정거: r = 콜래티튜드 × 4px/°,
//      북극 0°가 아래·남극 0°가 위, 공용 x = r·sin(λ)). 손그리기 금지 원칙의 극지방판.
// 다운로드가 없으면: land → https://unpkg.com/world-atlas@2/land-110m.json (50m도 같은 곳)
//                    kg → https://koeppen-geiger.vu-wien.ac.at/data/Koeppen-Geiger-ASCII.zip
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VIEW_W = 1000;
const VIEW_H = 500;

// ── 1. 육지 벡터: topojson 디코드 → equirect path ───────────────
/** topojson → 언랩 링 목록([[lon,lat],…][]) — 110m·50m 공용 디코더. */
function decodeRings(path) {
  const topo = JSON.parse(readFileSync(join(ROOT, path), "utf8"));
  const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
  const arcs = topo.arcs.map((arc) => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * sx + tx, y * sy + ty]; // [lon, lat]
    });
  });
  const obj = topo.objects.land;
  const geoms = obj.type === "GeometryCollection" ? obj.geometries : [obj];
  const rings = [];
  for (const g of geoms) {
    const polys = g.type === "MultiPolygon" ? g.arcs : [g.arcs];
    for (const poly of polys) {
      for (const ring of poly) {
        const pts = [];
        for (const idx of ring) {
          const a = idx >= 0 ? arcs[idx] : [...arcs[~idx]].reverse();
          // 이웃 아크의 접점(첫 점)은 직전 아크의 끝 점과 같다 — 중복 제거
          const start = pts.length ? 1 : 0;
          for (let i = start; i < a.length; i++) pts.push([a[i][0], a[i][1]]);
        }
        // 날짜변경선을 가로지르는 링은 경도를 연속화(unwrap)해 둔다.
        for (let i = 1; i < pts.length; i++) {
          while (pts[i][0] - pts[i - 1][0] > 180) pts[i][0] -= 360;
          while (pts[i][0] - pts[i - 1][0] < -180) pts[i][0] += 360;
        }
        rings.push(pts);
      }
    }
  }
  return rings;
}
const projX = (lon) => ((lon + 180) / 360) * VIEW_W;
const projY = (lat) => ((90 - lat) / 180) * VIEW_H;
function ringPath(pts) {
  let minLon = Infinity, maxLon = -Infinity;
  for (const p of pts) {
    if (p[0] < minLon) minLon = p[0];
    if (p[0] > maxLon) maxLon = p[0];
  }
  // ±180°를 "걸치는" 링(축치·남극·피지)은 넘친 만큼 ±360° 복제 링을 함께 그린다.
  // (SVG는 viewBox 밖을 잘라내므로 복제분의 넘침은 자동으로 사라진다.)
  const emit = (shift) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${projX(p[0] + shift).toFixed(1)} ${projY(p[1]).toFixed(1)}`)
      .join("") + "Z";
  let d = emit(0);
  if (maxLon > 180) d += emit(-360);
  if (minLon < -180) d += emit(360);
  // 태평양 밴드 +360° 복제(사회 Ⅵ) — 서경에 "통째로" 있는 링도 날짜변경선 동쪽 크롭(x>1000)에
  // 보이게 한다. 추가분은 x 1000~1250이라 기존 소비처 크롭(전부 x<1000) 밖 — 무해.
  if (maxLon <= -90 && minLon >= -180) d += emit(360);
  return d;
}
const rings110 = decodeRings("tmp/worldmap/land-110m.json");

// 50m 태평양 섬 선별 병합(사회 Ⅵ) — 110m에 없는 산호섬·화산섬만 추가한다.
/** 점(lon,lat)이 언랩 링 안인가 — 링의 경도 프레임에 맞춰 ±360° 정규화 후 레이캐스트. */
function pointInRing(lon, lat, pts, bb) {
  let lo = lon;
  while (lo < bb.minLon - 1e-9 && lo + 360 <= bb.maxLon + 1e-9) lo += 360;
  while (lo > bb.maxLon + 1e-9 && lo - 360 >= bb.minLon - 1e-9) lo -= 360;
  if (lo < bb.minLon || lo > bb.maxLon || lat < bb.minLat || lat > bb.maxLat) return false;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > lat !== yj > lat && lo < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const bboxOf = (pts) => {
  let minLon = 1e9, maxLon = -1e9, minLat = 1e9, maxLat = -1e9;
  for (const p of pts) {
    if (p[0] < minLon) minLon = p[0];
    if (p[0] > maxLon) maxLon = p[0];
    if (p[1] < minLat) minLat = p[1];
    if (p[1] > maxLat) maxLat = p[1];
  }
  return { minLon, maxLon, minLat, maxLat };
};
const bb110 = rings110.map(bboxOf);
const on110Land = (lon, lat) => {
  let n = 0;
  for (let i = 0; i < rings110.length; i++) if (pointInRing(lon, lat, rings110[i], bb110[i])) n++;
  return n % 2 === 1; // evenodd — 110m 육지 위면 true(중복 그리기 = evenodd 구멍 사고 방지)
};
const rings50 = decodeRings("tmp/worldmap/land-50m.json");
const pacificRings = [];
for (const pts of rings50) {
  const bb = bboxOf(pts);
  const shift = bb.maxLon < 0 ? 360 : 0; // 서경 통째 링은 +360 프레임으로 판정
  const lo = bb.minLon + shift, hi = bb.maxLon + shift;
  if (lo < 128 || hi > 215 || bb.minLat < -25 || bb.maxLat > 15) continue;
  const c = [(bb.minLon + bb.maxLon) / 2, (bb.minLat + bb.maxLat) / 2];
  if (on110Land(c[0], c[1])) continue; // 110m이 이미 그리는 섬(피지 본섬 등)은 제외
  pacificRings.push(pts);
}
let landPath = "";
for (const pts of rings110) landPath += ringPath(pts);
for (const pts of pacificRings) landPath += ringPath(pts);
console.log(`land path: ${rings110.length} rings(110m) + ${pacificRings.length} pacific rings(50m), ${landPath.length} chars`);

// ── 1b. 극중심 원판 베이크(방위 정거 도법 — 사회 Ⅵ 극지방) ──────
// 미래엔 122쪽 도법: 북극 원판은 0° 자오선이 화면 아래(유럽 아래쪽), 남극 원판은 0°가 위
// (아프리카 위쪽) — 두 원판 공통 x = r·sin(λ), y만 부호가 갈린다(북 +cos·남 −cos).
// r = 콜래티튜드(극에서 떨어진 각) × POLAR_SCALE(px/°). 소비처는 원형 clipPath로 잘라 쓴다.
const POLAR_SCALE = 4;
function polarPath(south) {
  const px = (lon, lat) => {
    const co = south ? 90 + lat : 90 - lat; // 콜래티튜드
    const r = co * POLAR_SCALE;
    const a = (lon * Math.PI) / 180;
    return [r * Math.sin(a), (south ? -1 : 1) * r * Math.cos(a)];
  };
  let d = "";
  for (const pts of rings110) {
    const bb = bboxOf(pts);
    if (south ? bb.minLat > -5 : bb.maxLat < 5) continue; // 반대 반구 전용 링은 생략(path 절약)
    d += pts.map((p, i) => {
      const [x, y] = px(p[0], p[1]);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join("") + "Z";
  }
  return d;
}
const polarNorth = polarPath(false);
const polarSouth = polarPath(true);
console.log(`polar paths: N ${(polarNorth.length / 1024).toFixed(0)}KB · S ${(polarSouth.length / 1024).toFixed(0)}KB`);

// ── 2. 기후 격자: Kottek ASCII(0.5°) → 6분류 ────────────────────
const KG_COLS = 720, KG_ROWS = 360;
const kg = new Uint8Array(KG_COLS * KG_ROWS); // 0 = 바다/자료 없음
const clsOf = (code) => {
  const c = code[0];
  return c === "A" ? 1 : c === "B" ? 2 : c === "C" ? 3 : c === "D" ? 4 : c === "E" ? 5 : 0;
};
const txt = readFileSync(join(ROOT, "tmp/worldmap/kg/Koeppen-Geiger-ASCII.txt"), "utf8");
const lines = txt.split(/\r?\n/);
for (let i = 1; i < lines.length; i++) {
  const m = lines[i].trim().split(/\s+/);
  if (m.length < 3) continue;
  const lat = parseFloat(m[0]), lon = parseFloat(m[1]), code = m[2];
  const row = Math.round((89.75 - lat) / 0.5);
  const col = Math.round((lon + 179.75) / 0.5);
  if (row < 0 || row >= KG_ROWS || col < 0 || col >= KG_COLS) continue;
  let cls = clsOf(code);
  // 고산 규칙 ①: 적도 부근(|lat|≤25)의 서늘한 기후 = 고산(안데스·동아프리카 고원·뉴기니)
  if (Math.abs(lat) <= 25 && (code === "Cfb" || code === "Cwb" || code === "ET" || code === "EF")) cls = 6;
  // 고산 규칙 ②: 티베트 상자의 한대(ET/EF) = 고산(시짱고원)
  if (lat >= 27 && lat <= 38 && lon >= 75 && lon <= 103 && (code === "ET" || code === "EF")) cls = 6;
  kg[row * KG_COLS + col] = cls;
}
const filled = kg.reduce((n, v) => n + (v ? 1 : 0), 0);
console.log(`kg cells: ${filled} land cells`);

// ── 3. 팽창(dilation) — 해안 경계 보정: 빈 셀을 이웃 다수결로 채움 ──
function dilate(grid, cols, rows, passes) {
  let cur = grid;
  for (let p = 0; p < passes; p++) {
    const next = new Uint8Array(cur);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (cur[r * cols + c]) continue;
        const cnt = new Map();
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const rr = r + dr, cc = (c + dc + cols) % cols; // 경도는 순환
            if (rr < 0 || rr >= rows) continue;
            const v = cur[rr * cols + cc];
            if (v) cnt.set(v, (cnt.get(v) ?? 0) + 1);
          }
        }
        if (cnt.size) next[r * cols + c] = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0];
      }
    }
    cur = next;
  }
  return cur;
}
const kgImg = dilate(kg, KG_COLS, KG_ROWS, 3); // 이미지용(클립이 해안을 자르므로 넉넉히)

// ── 4. 판정 격자: 1°(360×180)로 다운샘플 + 1패스 팽창 ───────────
const HIT_COLS = 360, HIT_ROWS = 180;
let hit = new Uint8Array(HIT_COLS * HIT_ROWS);
for (let r = 0; r < HIT_ROWS; r++) {
  for (let c = 0; c < HIT_COLS; c++) {
    const cnt = new Map();
    for (let dr = 0; dr < 2; dr++) {
      for (let dc = 0; dc < 2; dc++) {
        const v = kg[(r * 2 + dr) * KG_COLS + (c * 2 + dc)];
        if (v) cnt.set(v, (cnt.get(v) ?? 0) + 1);
      }
    }
    if (cnt.size) hit[r * HIT_COLS + c] = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
}
hit = dilate(hit, HIT_COLS, HIT_ROWS, 1);
const hitStr = Array.from(hit).join("");

// ── 5. 기후 오버레이 이미지(720×360 셀 → 1440×720 webp, Chrome 캔버스) ──
const PAL = {
  1: "#1E9E50", // 열대 — 진초록
  2: "#E8B93C", // 건조 — 모래 노랑
  3: "#A5D65C", // 온대 — 연두
  4: "#3FA7C8", // 냉대 — 청록
  5: "#8E9EC8", // 한대 — 회보라
  6: "#B0672A", // 고산 — 갈색
};
const imgStr = Array.from(kgImg).join("");
mkdirSync(join(ROOT, "public/soc"), { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const dataUrl = await page.evaluate(
  ({ grid, cols, rows, pal }) => {
    const cv = document.createElement("canvas");
    cv.width = cols * 2;
    cv.height = rows * 2;
    const ctx = cv.getContext("2d");
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = grid.charCodeAt(r * cols + c) - 48;
        if (!v) continue;
        ctx.fillStyle = pal[v];
        ctx.fillRect(c * 2, r * 2, 2, 2);
      }
    }
    return cv.toDataURL("image/webp", 0.9);
  },
  { grid: imgStr, cols: KG_COLS, rows: KG_ROWS, pal: PAL },
);
await browser.close();
writeFileSync(join(ROOT, "public/soc/climate.webp"), Buffer.from(dataUrl.split(",")[1], "base64"));
console.log("wrote public/soc/climate.webp");

// ── 6. 생성 TS ───────────────────────────────────────────────────
const ts = `// worldMap.generated.ts — qa/gen-worldmap.mjs가 생성(손대지 말 것).
// 좌표계: 정거원통(equirect) viewBox 0 0 ${VIEW_W} ${VIEW_H} — x=(lon+180)/360*${VIEW_W}, y=(90-lat)/180*${VIEW_H}.
// 출처: Natural Earth 110m land(퍼블릭 도메인, world-atlas@2) ·
//       기후 = Kottek et al. 2006 쾨펜-가이거 0.5° 격자(교과서 6분류로 단순화, photos/CREDITS.md).

export const WORLD_W = ${VIEW_W};
export const WORLD_H = ${VIEW_H};

/** 육지 실루엣 path(equirect). fill-rule="evenodd"로 그린다. */
export const WORLD_LAND_PATH =
  ${JSON.stringify(landPath)};

/** 기후 판정 격자 — 1° 셀(360×180), 위도 90→-90(위→아래)·경도 -180→180. 문자 = 기후 코드.
 *  0 바다/자료 없음 · 1 열대 · 2 건조 · 3 온대 · 4 냉대 · 5 한대 · 6 고산 */
export const CLIMATE_COLS = ${HIT_COLS};
export const CLIMATE_ROWS = ${HIT_ROWS};
export const CLIMATE_GRID =
  ${JSON.stringify(hitStr)};

export const CLIMATE_LABEL: Record<number, string> = {
  1: "열대 기후", 2: "건조 기후", 3: "온대 기후", 4: "냉대 기후", 5: "한대 기후", 6: "고산 기후",
};

/** 경도·위도 → 기후 코드(0~6). 경도는 내부에서 ±180° 범위로 정규화한다 — 날짜변경선을
 *  넘는 크롭(사회 Ⅵ)의 언랩 경도(>180)를 호출부가 wrap할 필요 없이 그대로 넣으면 된다. */
export function climateAt(lon: number, lat: number): number {
  const lw = ((((lon + 180) % 360) + 360) % 360) - 180;
  const c = Math.floor(((lw + 180) / 360) * CLIMATE_COLS);
  const r = Math.floor(((90 - lat) / 180) * CLIMATE_ROWS);
  if (r < 0 || r >= CLIMATE_ROWS || c < 0 || c >= CLIMATE_COLS) return 0;
  return CLIMATE_GRID.charCodeAt(r * CLIMATE_COLS + c) - 48;
}

/** 지도 좌표(viewBox px) → 경도·위도. x>1000(날짜변경선 동쪽 복제 밴드)이면 lon>180(언랩)을
 *  그대로 돌려준다 — 폴리곤·앵커와 같은 언랩 규약. 기후 판정은 climateAt이 내부 wrap. */
export function lonLatOf(x: number, y: number): { lon: number; lat: number } {
  return { lon: (x / ${VIEW_W}) * 360 - 180, lat: 90 - (y / ${VIEW_H}) * 180 };
}

/* ---------- 극중심 원판(방위 정거 도법 — 사회 Ⅵ 극지방) ---------- */
/** px per 콜래티튜드 1°. r = (90−|lat|) × POLAR_SCALE — 원점(0,0)이 극점. */
export const POLAR_SCALE = ${POLAR_SCALE};

/** 북극 원판 육지 path — 0° 자오선이 아래(+y), 90°E가 오른쪽(+x). 미래엔 122쪽 구도. */
export const POLAR_NORTH_PATH =
  ${JSON.stringify(polarNorth)};

/** 남극 원판 육지 path — 0° 자오선이 위(−y), 90°E가 오른쪽(+x). 미래엔 122쪽 구도. */
export const POLAR_SOUTH_PATH =
  ${JSON.stringify(polarSouth)};

/** 극 원판 투영 — 소비처(socFigures6 등)가 라벨·항로 좌표를 같은 식으로 얹는다. */
export function polarXY(lon: number, lat: number, south: boolean): { x: number; y: number } {
  const co = south ? 90 + lat : 90 - lat;
  const r = co * POLAR_SCALE;
  const a = (lon * Math.PI) / 180;
  return { x: r * Math.sin(a), y: (south ? -1 : 1) * r * Math.cos(a) };
}
`;
writeFileSync(join(ROOT, "src/ui/worldMap.generated.ts"), ts);
console.log(`wrote src/ui/worldMap.generated.ts (${(ts.length / 1024).toFixed(0)} KB)`);
