// v7 최종 조립 — 인트로(cap) + 컴포지팅 비트(cap2) → 밴드 분할 전환 → BGM
//
// 전환 문법(2026-08-05 사용자 확정 — "장면마다 위로 스와이프" 단조로움 교체):
//  · 카드↔카드 = 밴드 분할 이중 전환. 프레임을 y=1280에서 수평 분할해
//    위 밴드(다크 무대+폰 목업, 0..1280)는 옆으로 휙 slideleft,
//    아래 밴드(칩·헤드라인·서브 카피, 1280..1920)는 제자리 블러 디졸브 hblur.
//    → "폰 화면은 옆으로 넘어가고, 글씨는 초점이 바뀌듯" 두 레이어가 따로 논다.
//    경계 1136은 컴포지터(405×720 × 8/3) 실측: 폰 하단 1116 < 1136 < 칩 상단 1158 —
//    빈 무대를 지나므로 이음선이 안 보인다(무대 배경은 수직 그라데이션이라 밴드별
//    전환 차이가 티 나지 않음). 컴포지터 레이아웃(폰 width 230·margin 22·카피 margin 16 —
//    인스타 세이프 존 배치)을 바꾸면 이 경계를 재실측할 것.
//  · 인트로→첫 카드, 마지막 카드→엔드카드 = 풀프레임 slideup(쇼츠 스와이프) 유지 —
//    인트로·엔드카드는 풀프레임 연출이라 밴드를 가르면 반 토막 난다.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BEATS_DIR = path.join(__dirname, "beats2");
const OUT = path.join(__dirname, "out");
fs.mkdirSync(BEATS_DIR, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const ff = (args, tag) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error("ffmpeg 실패: " + tag);
};
const probeDur = (f) => {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" });
  return parseFloat(r.stdout.trim());
};

// [캡처 루트, 폴더, 시작 트림(s), 꼬리 홀드(s)]
const SEQ = [
  ["cap", "b0-intro", 0.2, 0.35],
  ["cap2", "c-enter", 0.1, 0.15],
  ["cap2", "c-heat", 0.1, 0.15],
  ["cap2", "c-lab2", 0.1, 0.15], // 구 c-matter+c-boyle 통합 카드(두 랩 연속 재생)
  ["cap2", "c-moon", 0.1, 0.15],
  ["cap2", "c-laser", 0.1, 0.15],
  ["cap2", "c-quiz", 0.1, 0.15],
  ["cap2", "c-exam", 0.1, 0.15],
  ["cap2", "c-notebook", 0.1, 0.15],
  ["cap2", "c-end", 0.0, 2.2],
];

const FPS = 30;
for (const [root, name, trim, tail] of SEQ) {
  const dir = path.join(__dirname, root, name);
  const times = JSON.parse(fs.readFileSync(path.join(dir, "times.json"), "utf8"));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort();
  const t0 = times[0];
  const seqDir = path.join(dir, "seq2");
  fs.rmSync(seqDir, { recursive: true, force: true });
  fs.mkdirSync(seqDir);
  const end = times[times.length - 1] - t0 + tail;
  let src = 0, n = 0;
  for (let t = trim; t < end; t += 1 / FPS) {
    while (src < times.length - 1 && times[src + 1] - t0 <= t) src++;
    n++;
    fs.linkSync(path.join(dir, files[src]), path.join(seqDir, `s${String(n).padStart(6, "0")}.jpg`));
  }
  ff(["-framerate", String(FPS), "-i", path.join(seqDir, "s%06d.jpg"),
      "-vf", "scale=1080:1920:flags=lanczos,format=yuv420p", "-r", String(FPS),
      "-c:v", "libx264", "-crf", "17", "-preset", "medium",
      path.join(BEATS_DIR, `${name}.mp4`)], name);
  console.log(name, "→", probeDur(path.join(BEATS_DIR, `${name}.mp4`)).toFixed(2) + "s");
}

const XF_CARD = 0.38; // 카드 사이 밴드 분할 전환
const XF_EDGE = 0.3;  // 인트로 진입·엔드카드 진출(slideup)
const SPLIT_Y = 1136; // 밴드 경계(짝수 필수 — yuv420) : 위 1080×1136 / 아래 1080×784

// ── 1) 카드 묶음: 밴드 분할 xfade 체인 ──
const CARDS = ["c-enter", "c-heat", "c-lab2", "c-moon", "c-laser", "c-quiz", "c-exam", "c-notebook"];
const cardDurs = CARDS.map((n) => probeDur(path.join(BEATS_DIR, `${n}.mp4`)));
const cardInputs = CARDS.flatMap((n) => ["-i", path.join(BEATS_DIR, `${n}.mp4`)]);
let f = "";
for (let i = 0; i < CARDS.length; i++) {
  f += `[${i}:v]split=2[ts${i}][bs${i}];`
     + `[ts${i}]crop=1080:${SPLIT_Y}:0:0[t${i}];`
     + `[bs${i}]crop=1080:${1920 - SPLIT_Y}:0:${SPLIT_Y}[b${i}];`;
}
// 위·아래 체인은 offset·duration이 완전히 같아야 vstack에서 길이가 맞는다 — 전환 종류만 다르게.
let top = "[t0]", bot = "[b0]", acc = cardDurs[0];
for (let i = 1; i < CARDS.length; i++) {
  const off = (acc - XF_CARD).toFixed(3);
  const tOut = i === CARDS.length - 1 ? "[tv]" : `[tx${i}]`;
  const bOut = i === CARDS.length - 1 ? "[bv]" : `[bx${i}]`;
  f += `${top}[t${i}]xfade=transition=slideleft:duration=${XF_CARD}:offset=${off}${tOut};`;
  f += `${bot}[b${i}]xfade=transition=hblur:duration=${XF_CARD}:offset=${off}${bOut};`;
  acc = acc - XF_CARD + cardDurs[i];
  top = tOut; bot = bOut;
}
f += `[tv][bv]vstack=inputs=2,format=yuv420p[vout]`;
const CARDS_MP4 = path.join(OUT, "cards.mp4");
ff([...cardInputs, "-filter_complex", f, "-map", "[vout]",
    "-c:v", "libx264", "-crf", "17", "-preset", "medium", CARDS_MP4], "cards");
console.log("카드 묶음:", probeDur(CARDS_MP4).toFixed(2) + "s");

// ── 2) 북엔드: 인트로 → 카드 → 엔드카드 (풀프레임 slideup) ──
const INTRO = path.join(BEATS_DIR, "b0-intro.mp4");
const END = path.join(BEATS_DIR, "c-end.mp4");
const dIntro = probeDur(INTRO), dCards = probeDur(CARDS_MP4);
const off1 = (dIntro - XF_EDGE).toFixed(3);
const off2 = (dIntro - XF_EDGE + dCards - XF_EDGE).toFixed(3);
const NOAUDIO = path.join(OUT, "v7-noaudio.mp4");
ff(["-i", INTRO, "-i", CARDS_MP4, "-i", END, "-filter_complex",
    `[0:v][1:v]xfade=transition=slideup:duration=${XF_EDGE}:offset=${off1}[x1];` +
    `[x1][2:v]xfade=transition=slideup:duration=${XF_EDGE}:offset=${off2}[vout]`,
    "-map", "[vout]", "-c:v", "libx264", "-crf", "17", "-preset", "medium",
    "-movflags", "+faststart", NOAUDIO], "edges");
const total = probeDur(NOAUDIO);
console.log("본편 길이:", total.toFixed(2) + "s");

// ── 3) BGM = 코스모 머지 '행성 시대'(일레븐랩스 자체 발주 자산) — BGM 환경변수로 교체 가능 ──
const BGM = process.env.BGM || path.join(__dirname, "..", "..", "public", "game", "cosmo", "bgm-planets.mp3");
const FINAL = path.join(OUT, "stickstep-marketing-9x16.mp4");
ff(["-i", NOAUDIO, "-stream_loop", "-1", "-i", BGM,
    "-filter_complex", `[1:a]volume=0.85,afade=t=in:d=0.9,afade=t=out:st=${(total - 3.0).toFixed(2)}:d=3.0,loudnorm=I=-15:TP=-1.5:LRA=11[aout]`,
    "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart",
    FINAL], "bgm");
console.log("최종 →", FINAL, probeDur(FINAL).toFixed(2) + "s");
