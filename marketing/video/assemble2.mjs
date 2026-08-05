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
// cardOffs = 카드 체인 로컬 기준 각 밴드 전환 시작 시각(초) — 아래 효과음 배치가 재사용한다.
const cardOffs = [];
let top = "[t0]", bot = "[b0]", acc = cardDurs[0];
for (let i = 1; i < CARDS.length; i++) {
  const off = (acc - XF_CARD).toFixed(3);
  cardOffs.push(acc - XF_CARD);
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
// 끝의 format=yuv420p는 필수 — xfade 체인만 두면 필터 협상이 4:4:4로 승격해 최종본이
// yuvj444p가 되고, 윈도우 기본 플레이어(하드웨어 디코더)에서 녹색 글리치가 난다(2026-08-06 실사고.
// beats·cards가 420이어도 이 단계에서 새로 샌다 — 지우지 말 것).
ff(["-i", INTRO, "-i", CARDS_MP4, "-i", END, "-filter_complex",
    `[0:v][1:v]xfade=transition=slideup:duration=${XF_EDGE}:offset=${off1}[x1];` +
    `[x1][2:v]xfade=transition=slideup:duration=${XF_EDGE}:offset=${off2},format=yuv420p[vout]`,
    "-map", "[vout]", "-c:v", "libx264", "-crf", "17", "-preset", "medium",
    "-movflags", "+faststart", NOAUDIO], "edges");
const total = probeDur(NOAUDIO);
console.log("본편 길이:", total.toFixed(2) + "s");

// ── 3) 오디오 = 전용 BGM + 효과음(둘 다 일레븐랩스 발주 — gen-audio.mjs, audio/) ──
// BGM 기본값은 audio/bgm-edu-c.mp3(모던 테크 프로모 톤 48초 전용곡 — 구 코스모 머지 '행성 시대'
// 유용 폐기(2026-08-06), a·b는 유아틱 판정 폐기(같은 날 — gen-audio.mjs 주석 참조)).
// 후보 D로 바꿔 보려면 BGM=audio/bgm-edu-d.mp3 node assemble2.mjs.
const AUDIO = path.join(__dirname, "audio");
const BGM = process.env.BGM || path.join(AUDIO, "bgm-edu-c.mp3");

// 효과음 배치표. 전환 시각은 위 xfade 오프셋 계산에서 그대로 파생(절대 초) — 눈대중 금지.
//  · off1/off2 = 풀프레임 slideup 시작, cardOffs = 밴드 분할 전환 시작(카드 체인 로컬 → +off1)
//  · 인트로·엔드카드 내부 연출 시각은 intro.html/endcard2.html의 animation-delay 실측값.
//    LAT 0.1 = rec.start 뒤 body.go 게이트가 붙기까지의 캡처 지연 보정(함정 ③ 참조),
//    인트로는 SEQ 시작 트림 0.2초도 빼야 한다.
// 볼륨(2026-08-06 사용자 "BGM 소리 너무 큼" 2회 하향): BGM 라우드니스 −15→−19→−22 LUFS,
// 효과음은 상대 균형 유지를 위해 ×0.75→×0.85 누적 동반 하향. 더 줄일 땐 loudnorm I만 내리면 된다.
const LAT = 0.1;
const EVENTS = [
  { f: "sfx-swish", t: 1.02 - 0.2 + LAT, vol: 0.26 },           // 인트로: 빨간 취소선
  { f: "sfx-pop",   t: 1.36 - 0.2 + LAT, vol: 0.38 },           // 인트로: "만져 보는 과학" 팝
  { f: "sfx-rise",  t: parseFloat(off1), vol: 0.32 },           // 인트로 → 첫 카드 slideup
  ...cardOffs.map((t) => ({ f: "sfx-swish", t: t + parseFloat(off1), vol: 0.32 })), // 밴드 분할 ×7
  { f: "sfx-rise",  t: parseFloat(off2), vol: 0.32 },           // 마지막 카드 → 엔드카드 slideup
  { f: "sfx-steps", t: parseFloat(off2) + 1.84 + LAT, vol: 0.35 }, // 엔드카드: 발자국 타타닥
  { f: "sfx-tada",  t: parseFloat(off2) + 2.44 + LAT, vol: 0.42 }, // 엔드카드: 깃발 팝
];
for (const e of EVENTS) {
  if (!fs.existsSync(path.join(AUDIO, `${e.f}.mp3`))) throw new Error(`효과음 없음: audio/${e.f}.mp3 — XI_KEY=<키> node gen-audio.mjs 먼저`);
}

const FINAL = path.join(OUT, "stickstep-marketing-9x16.mp4");
const aIn = ["-i", NOAUDIO, "-stream_loop", "-1", "-i", BGM];
for (const e of EVENTS) aIn.push("-i", path.join(AUDIO, `${e.f}.mp3`));
let af = `[1:a]loudnorm=I=-22:TP=-1.5:LRA=11,volume=0.9,afade=t=in:d=0.6,afade=t=out:st=${(total - 3.0).toFixed(2)}:d=3.0[bg];`;
EVENTS.forEach((e, i) => {
  const ms = Math.round(e.t * 1000);
  af += `[${i + 2}:a]volume=${e.vol},adelay=${ms}|${ms}[s${i}];`;
});
af += `[bg]${EVENTS.map((_, i) => `[s${i}]`).join("")}amix=inputs=${EVENTS.length + 1}:duration=first:normalize=0,alimiter=limit=0.89[aout]`;
ff([...aIn, "-filter_complex", af,
    "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart",
    FINAL], "audio");
console.log("최종 →", FINAL, probeDur(FINAL).toFixed(2) + "s",
  "· 전환 효과음", EVENTS.length + "개 · BGM", path.basename(BGM));
