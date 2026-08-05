// 유튜브 커뮤니티·SNS용 GIF 짤 — beats-raw/의 원속 랩 영상에서 **다크 무대(.stage)만** 잘라 루프 GIF로.
// 선행: node rebuild-beats.mjs (beats-raw/*.mp4 생성)
// 실행: node make-gifs.mjs   → out/gifs/*.gif (+ chk-*.jpg 눈검수 샷)
//
// 크롭은 **자동 검출**한다(2026-08-05 — 손으로 적어 둔 좌표가 전부 어긋나 있었다:
// 얼음/끓음은 무대 아래 흰 앱 UI가 172px 딸려 들어와 4.2MB가 됐고, 레이저는 반대로 무대
// 하단이 21px 잘려 있었다). 중간 프레임에서 어두운 사각형의 경계를 찾고, 둥근 모서리 때문에
// 생기는 흰 삼각형이 사라질 때까지 안쪽으로 인셋해 "테두리 없는 무대"만 남긴다.
// 랩 레이아웃이 바뀌어도 좌표를 다시 적을 필요가 없다.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, "beats-raw");
const OUT = path.join(__dirname, "out", "gifs");
const TMP = path.join(__dirname, ".gif-tmp");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const W = 1080, H = 1920;
const ff = (args, tag) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error("ffmpeg 실패: " + tag);
};
const probeDur = (f) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" });
  return parseFloat(r.stdout.trim());
};

// [이름, 소스, 시작(s), 길이(s), 폭(px), fps, controls]
// 왕복 비트(b1r·b2r)는 GIF 전용 캡처 — 본편 비트는 한 방향 그대로 둔다(capture.mjs 참조).
//
// controls: true = **무대 아래 조작부(슬라이더)까지 포함**(2026-08-05 사용자 지시 "아래 조작하는
//   버튼 나오는 부분도 살려야 한다"). 분자 운동·상태 변화는 슬라이더가 다크 무대 바깥(흰 영역)에
//   있어 무대만 자르면 "뭘 움직여서 저렇게 됐는지"가 사라진다. 이때는 둥근 모서리를 살린 채
//   얇은 흰 프레임(pad)으로 감싼다 — 무대를 하드컷하면 모서리가 잘려 어색하다.
// controls 생략 = 조작이 캔버스 안에서 일어나는 랩(주사기 피스톤·달 궤도·레이저 각도) — 무대만
//   꽉 채워 자르는 게 가장 깔끔하다.
const JOBS = [
  { name: "gif-heat-particles", src: "b1r-heat.mp4", ss: 0.5, t: 6.4, w: 460, fps: 13, controls: true },
  { name: "gif-ice-boil", src: "b2r-matter.mp4", ss: 0.5, t: 7.4, w: 460, fps: 13, controls: true },
  { name: "gif-boyle-syringe", src: "b3-boyle.mp4", ss: 0.7, t: 8.6, w: 440, fps: 13 },
  { name: "gif-moon-phase", src: "b4-moon.mp4", ss: 0.8, t: 8.5, w: 460, fps: 13 },
  { name: "gif-laser-reflect", src: "b5-laser.mp4", ss: 0.7, t: 7.8, w: 460, fps: 13 },
  { name: "gif-color-mix", src: "b6r-color.mp4", ss: 0.5, t: 9.5, w: 460, fps: 13 },
  // ctrlH = 무대 아래로 포함할 최대 높이(px). 분자·원자 조립소는 조작부 **바로 밑에 호기심 카드**가
  // 붙어 있는데 그 사이 간격(44px)이 조작부 내부 간격(45px)보다 오히려 좁아 간격 규칙으로는 못 가른다
  // → 잡별 하한선으로 끊는다. 값은 "버튼 마지막 줄까지"이고 여유가 넉넉해 레이아웃이 조금 변해도 안전.
  { name: "gif-molecule", src: "b7r-mol.mp4", ss: 0.4, t: 9.5, w: 460, fps: 13, controls: true, ctrlH: 380 },
  { name: "gif-atom", src: "b8r-atom.mp4", ss: 0.4, t: 9.5, w: 460, fps: 13, controls: true, ctrlH: 450 },
  { name: "gif-wave", src: "b9r-wave.mp4", ss: 0.4, t: 7.5, w: 460, fps: 13 },
  // 밸브를 하나씩 여는 전 과정을 담아 길다 — 폭·fps를 조금 낮춰 용량을 잡는다
  { name: "gif-photosynthesis", src: "b10r-leaf.mp4", ss: 0.3, t: 9.4, w: 450, fps: 13, controls: true },
];
const PAD = 24; // 조작부 포함 크롭의 흰 프레임 두께(device px — 버튼 아랫변이 잘리지 않게)

const even = (n) => n - (n % 2);

// 무대 세로 위치(top)만 빠르게 재기 — 흔들림 감지용
function stageTop(mp4, at) {
  const gray = path.join(TMP, "top.gray");
  ff(["-ss", String(at), "-i", mp4, "-frames:v", "1", "-pix_fmt", "gray", "-f", "rawvideo", gray], "top");
  const d = fs.readFileSync(gray);
  for (let y = 0; y < H; y++) {
    let n = 0;
    for (let x = 0; x < W; x += 2) if (d[y * W + x] < 70) n++;
    if (n / (W / 2) > 0.5) return y;
  }
  return -1;
}

// 랩이 목표를 달성하면 안내문이 한 줄 늘었다 줄었다 하거나(리플로우) 판정 질문이 뜨며
// 스크롤돼(scrollIntoView) 무대가 통째로 위아래로 밀린다. 그대로 GIF를 만들면 "막판에 화면이
// 살짝 내려가는" 결함이 된다(2026-08-05 사용자 지적 — 달 위상. 검사를 붙이니 레이저·분자·열도
// 같은 결함이 있었다: 레이저 −470px 스크롤, 분자 ±59px 리플로우 3회, 열 +56px).
//
// 해법 = **구간을 버리지 않고 크롭 y를 시간에 따라 보정**한다. 밀림은 계단형(순간 이동)이라
// ffmpeg crop의 y를 `if(lt(t,T),y0,y1)` 중첩식으로 주면 프레임마다 무대를 따라가 완전히 고정된다.
// 전환 시각은 이분 탐색으로 ~30ms까지 좁힌다(0.25s 격자만 쓰면 그 사이에 한 번 튄다).
const PROBE = 0.25, TOL = 4, MINSEG = 0.3;
function stageTrack(mp4, ss, t) {
  const times = [], tops = [];
  for (let at = ss + 0.05; at <= ss + t; at += PROBE) { times.push(at); tops.push(stageTop(mp4, at)); }

  // 계단 경계 찾기 → 이분 탐색으로 정밀화
  const segs = [{ at: ss, top: tops[0] }];
  for (let i = 1; i < tops.length; i++) {
    if (Math.abs(tops[i] - segs[segs.length - 1].top) <= TOL) continue;
    let lo = times[i - 1], hi = times[i];
    const before = segs[segs.length - 1].top;
    for (let k = 0; k < 4; k++) {
      const mid = (lo + hi) / 2;
      if (Math.abs(stageTop(mp4, mid) - before) <= TOL) lo = mid; else hi = mid;
    }
    segs.push({ at: hi, top: tops[i] });
  }
  // 너무 짧은 구간(노이즈)은 앞 구간에 흡수
  const out = [segs[0]];
  for (let i = 1; i < segs.length; i++) {
    const next = i + 1 < segs.length ? segs[i + 1].at : ss + t;
    if (next - segs[i].at < MINSEG) continue;
    out.push(segs[i]);
  }
  return out;
}

// 크롭 영역 계산 — 다크 무대(.stage)를 찾고, controls면 그 아래 조작 블록까지 확장한다.
function detectCrop(mp4, at, withControls, ctrlH) {
  const gray = path.join(TMP, "probe.gray");
  ff(["-ss", String(at), "-i", mp4, "-frames:v", "1", "-pix_fmt", "gray", "-f", "rawvideo", gray], "probe");
  const d = fs.readFileSync(gray);
  const dark = (x, y) => d[y * W + x] < 70;

  // ── 무대 세로 범위: 어두운 픽셀이 행의 절반을 넘는 구간 ──
  let top = -1, bot = -1;
  for (let y = 0; y < H; y++) {
    let n = 0;
    for (let x = 0; x < W; x += 2) if (dark(x, y)) n++;
    if (n / (W / 2) > 0.5) { if (top < 0) top = y; bot = y; }
  }
  if (top < 0) throw new Error("무대를 못 찾음: " + path.basename(mp4));

  let left = W, right = 0;
  for (let y = top; y <= bot; y += 4) {
    for (let x = 0; x < W; x++) if (dark(x, y)) { if (x < left) left = x; break; }
    for (let x = W - 1; x >= 0; x--) if (dark(x, y)) { if (x > right) right = x; break; }
  }

  if (!withControls) {
    // 둥근 모서리 인셋: 네 귀퉁이가 모두 무대 안(어두움)이 되는 최소 인셋 = 흰 삼각형 0.
    let i = 0;
    const okAt = (k) =>
      dark(left + k, top + k) && dark(right - k, top + k) && dark(left + k, bot - k) && dark(right - k, bot - k);
    while (i < 90 && !okAt(i)) i += 2;
    i += 2; // 안티에일리어싱 여유
    const x = left + i, y = top + i;
    return { x, y, w: even(right - i - x + 1), h: even(bot - i - y + 1), note: `무대만 · inset ${i}` };
  }

  // ── 조작 블록: 무대 아래 첫 콘텐츠 덩어리(슬라이더+라벨). 큰 공백이 나오면 거기서 끊는다
  //    — 더 내려가면 화면 맨 아래 안내 문구까지 딸려 들어온다. ──
  const bgRow = (y) => {
    let n = 0;
    for (let x = left; x <= right; x += 2) if (d[y * W + x] < 238) n++;
    return n <= 10;
  };
  const limit = Math.min(H - 1, bot + (ctrlH || 460));
  let cBot = -1, cLeft = W, cRight = 0, gap = 0;
  for (let y = bot + 3; y < limit; y++) {
    if (!bgRow(y)) {
      cBot = y; gap = 0;
      for (let x = 0; x < W; x++) if (d[y * W + x] < 238) { if (x < cLeft) cLeft = x; break; }
      for (let x = W - 1; x >= 0; x--) if (d[y * W + x] < 238) { if (x > cRight) cRight = x; break; }
    } else if (cBot > 0 && ++gap > 45) break;
  }
  if (cBot < 0) throw new Error("조작부를 못 찾음(controls 플래그 재검토): " + path.basename(mp4));

  // 아래 여백은 "다음 요소를 물지 않는 만큼"만 준다 — 하한선이 조금 어긋나도 카드가 반쯤 잘리지 않는다.
  // 다음 요소 탐지는 **임계를 250까지 올린다**: 호기심 카드 같은 크림색 면(회색값 ~248)은 238 검사에
  // 안 걸려 얇은 띠로 남는다(실사고). 순백 배경(255)과는 구분된다.
  const nearBgRow = (y) => {
    let n = 0;
    for (let x = left; x <= right; x += 2) if (d[y * W + x] < 252) n++;
    return n <= 20;
  };
  let nextY = H;
  for (let y = cBot + 4; y < Math.min(H, cBot + PAD + 40); y++) if (!nearBgRow(y)) { nextY = y; break; }
  const padBot = Math.max(0, Math.min(PAD, nextY - cBot - 6)); // 0까지 허용 — 카드가 바짝 붙어 있으면 여백을 포기한다

  const x = Math.max(0, Math.min(left, cLeft) - PAD);
  const y = Math.max(0, top - PAD);
  const x2 = Math.min(W - 1, Math.max(right, cRight) + PAD);
  const y2 = Math.min(H - 1, cBot + padBot);
  return { x, y, w: even(x2 - x + 1), h: even(y2 - y + 1), note: `무대+조작부 · 조작 ${bot + 1}~${cBot}` };
}

for (const j of JOBS) {
  const src = path.join(RAW, j.src);
  if (!fs.existsSync(src)) { console.log(`SKIP ${j.name} — ${j.src} 없음(해당 비트를 먼저 캡처·빌드할 것)`); continue; }
  const dur = probeDur(src);
  const t = Math.min(j.t, Math.max(1.5, dur - j.ss - 0.05));
  const segs = stageTrack(src, j.ss, t);
  const box = detectCrop(src, j.ss + 0.1, !!j.controls, j.ctrlH); // 기준 = 첫 구간

  // 크롭 y를 구간마다 보정해 무대를 고정. h는 전 구간이 화면 안에 들어오도록 줄인다.
  const deltas = segs.map((s) => s.top - segs[0].top);
  const dMin = Math.min(...deltas), dMax = Math.max(...deltas);
  const y0 = Math.max(0, box.y + dMin), yEnd = Math.min(H, box.y + dMax + box.h);
  const h = even(Math.min(box.h, yEnd - y0 - Math.max(0, dMax - dMin)));
  let yExpr = String(box.y + deltas[deltas.length - 1]);
  for (let i = segs.length - 1; i >= 1; i--) {
    yExpr = `if(lt(t\\,${(segs[i].at - j.ss).toFixed(2)})\\,${box.y + deltas[i - 1]}\\,${yExpr})`;
  }
  if (segs.length > 1) {
    console.log(`  ${j.name}: 무대 밀림 ${segs.length - 1}회(${deltas.join("/")}px) → 크롭 추적으로 고정`);
  }

  const dst = path.join(OUT, `${j.name}.gif`);
  ff(
    ["-ss", String(j.ss), "-t", String(t), "-i", src,
     "-vf", `crop=${box.w}:${h}:${box.x}:'${yExpr}',scale=${j.w}:-2:flags=lanczos,fps=${j.fps},` +
            `split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
     dst],
    j.name,
  );
  const win = { ss: j.ss, t };
  ff(["-ss", String(win.t / 2), "-i", dst, "-frames:v", "1", path.join(OUT, `chk-${j.name}.jpg`)], `chk-${j.name}`);
  console.log(
    `${j.name.padEnd(20)} ${win.t.toFixed(1)}s  crop ${box.w}x${h} @(${box.x},${box.y})  ${box.note.padEnd(24)}  ` +
    `${(fs.statSync(dst).size / 1024 / 1024).toFixed(2)}MB`,
  );
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log("GIFS DONE — out/gifs/chk-*.jpg 눈검수 필수(무대 밖 흰 테두리 0이어야 한다)");
