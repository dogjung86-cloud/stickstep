// gen-worldmap.mjs — 사회 트랙 세계지도 데이터 생성 (1회 실행 → 산출물 커밋)
//   입력: tmp/worldmap/land-110m.json  (Natural Earth 110m land, world-atlas@2 — 퍼블릭 도메인)
//         tmp/worldmap/kg/Koeppen-Geiger-ASCII.txt (Kottek et al. 2006, 0.5° 격자 — 인용 조건 무료)
//   출력: src/ui/worldMap.generated.ts  (육지 SVG path + 1° 기후 판정 격자)
//         public/soc/climate.webp       (기후 색 오버레이 — SVG에서 육지 path로 클립해서 쓴다)
//   기후 6분류(교과서): 1 열대(A) · 2 건조(B) · 3 온대(C) · 4 냉대(D) · 5 한대(E) · 6 고산
//   고산 규칙: ① |위도|≤25°의 Cfb/Cwb/ET/EF(적도 부근 고산 — 안데스·동아프리카·뉴기니)
//              ② 티베트 상자(lon 75~103, lat 27~38)의 ET/EF(시짱고원 — 사회과부도 관행)
// 다운로드가 없으면: land → https://unpkg.com/world-atlas@2/land-110m.json
//                    kg → https://koeppen-geiger.vu-wien.ac.at/data/Koeppen-Geiger-ASCII.zip
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VIEW_W = 1000;
const VIEW_H = 500;

// ── 1. 육지 벡터: topojson 디코드 → equirect path ───────────────
const topo = JSON.parse(readFileSync(join(ROOT, "tmp/worldmap/land-110m.json"), "utf8"));
const { scale: [sx, sy], translate: [tx, ty] } = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => {
    x += dx; y += dy;
    return [x * sx + tx, y * sy + ty]; // [lon, lat]
  });
});
const projX = (lon) => ((lon + 180) / 360) * VIEW_W;
const projY = (lat) => ((90 - lat) / 180) * VIEW_H;
function ringPath(arcIdxs) {
  const pts = [];
  for (const idx of arcIdxs) {
    const a = idx >= 0 ? arcs[idx] : [...arcs[~idx]].reverse();
    // 이웃 아크의 접점(첫 점)은 직전 아크의 끝 점과 같다 — 중복 제거
    const start = pts.length ? 1 : 0;
    for (let i = start; i < a.length; i++) pts.push([a[i][0], a[i][1]]);
  }
  // 날짜변경선을 가로지르는 링(유라시아 본토의 축치반도, 남극, 피지 등)은
  // 경도를 연속화(unwrap)한 뒤, 지도 밖으로 넘친 만큼 ±360° 복제 링을 함께 그린다.
  // (SVG는 viewBox 밖을 잘라내므로 복제분의 넘침은 자동으로 사라진다.)
  for (let i = 1; i < pts.length; i++) {
    while (pts[i][0] - pts[i - 1][0] > 180) pts[i][0] -= 360;
    while (pts[i][0] - pts[i - 1][0] < -180) pts[i][0] += 360;
  }
  let minLon = Infinity, maxLon = -Infinity;
  for (const p of pts) {
    if (p[0] < minLon) minLon = p[0];
    if (p[0] > maxLon) maxLon = p[0];
  }
  const emit = (shift) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${projX(p[0] + shift).toFixed(1)} ${projY(p[1]).toFixed(1)}`)
      .join("") + "Z";
  let d = emit(0);
  if (maxLon > 180) d += emit(-360);
  if (minLon < -180) d += emit(360);
  return d;
}
const landObj = topo.objects.land;
const geoms = landObj.type === "GeometryCollection" ? landObj.geometries : [landObj];
let landPath = "";
let polyCount = 0;
for (const g of geoms) {
  const polys = g.type === "MultiPolygon" ? g.arcs : [g.arcs];
  polyCount += polys.length;
  for (const poly of polys) for (const ring of poly) landPath += ringPath(ring);
}
console.log(`land path: ${polyCount} polys, ${landPath.length} chars`);

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

/** 경도·위도 → 기후 코드(0~6). */
export function climateAt(lon: number, lat: number): number {
  const c = Math.floor(((lon + 180) / 360) * CLIMATE_COLS);
  const r = Math.floor(((90 - lat) / 180) * CLIMATE_ROWS);
  if (r < 0 || r >= CLIMATE_ROWS || c < 0 || c >= CLIMATE_COLS) return 0;
  return CLIMATE_GRID.charCodeAt(r * CLIMATE_COLS + c) - 48;
}

/** 지도 좌표(viewBox px) → 경도·위도. */
export function lonLatOf(x: number, y: number): { lon: number; lat: number } {
  return { lon: (x / ${VIEW_W}) * 360 - 180, lat: 90 - (y / ${VIEW_H}) * 180 };
}
`;
writeFileSync(join(ROOT, "src/ui/worldMap.generated.ts"), ts);
console.log(`wrote src/ui/worldMap.generated.ts (${(ts.length / 1024).toFixed(0)} KB)`);
