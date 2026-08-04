// v3 최종 조립 — 인트로(cap) + 컴포지팅 비트(cap2) → xfade → BGM
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
  ["cap2", "c-matter", 0.1, 0.15],
  ["cap2", "c-boyle", 0.1, 0.15],
  ["cap2", "c-moon", 0.1, 0.15],
  ["cap2", "c-laser", 0.1, 0.15],
  ["cap2", "c-color", 0.1, 0.15],
  ["cap2", "c-comic", 0.1, 0.15],
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

const XF = 0.3; // 쇼츠 스와이프 전환(slideup) — 위로 샥샥
const durs = SEQ.map(([, n]) => probeDur(path.join(BEATS_DIR, `${n}.mp4`)));
const inputs = SEQ.flatMap(([, n]) => ["-i", path.join(BEATS_DIR, `${n}.mp4`)]);
let filter = "";
let prev = "[0:v]";
let acc = durs[0];
for (let i = 1; i < SEQ.length; i++) {
  const out = i === SEQ.length - 1 ? "[vout]" : `[x${i}]`;
  filter += `${prev}[${i}:v]xfade=transition=slideup:duration=${XF}:offset=${(acc - XF).toFixed(3)}${out};`;
  acc = acc - XF + durs[i];
  prev = out;
}
filter = filter.slice(0, -1);
console.log("본편 길이:", acc.toFixed(2) + "s");
ff([...inputs, "-filter_complex", filter, "-map", "[vout]", "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-movflags", "+faststart", path.join(OUT, "v3-noaudio.mp4")], "xfade");

// BGM = 코스모 머지 '행성 시대'(일레븐랩스 자체 발주 자산) — BGM 환경변수로 교체 가능
const BGM = process.env.BGM || path.join(__dirname, "..", "..", "public", "game", "cosmo", "bgm-planets.mp3");
ff(["-i", path.join(OUT, "v3-noaudio.mp4"), "-stream_loop", "-1", "-i", BGM,
    "-filter_complex", `[1:a]volume=0.85,afade=t=in:d=0.9,afade=t=out:st=${(acc - 3.0).toFixed(2)}:d=3.0,loudnorm=I=-15:TP=-1.5:LRA=11[aout]`,
    "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart",
    path.join(OUT, "stickstep-marketing-9x16-v3.mp4")], "bgm");
console.log("최종 →", path.join(OUT, "stickstep-marketing-9x16-v3.mp4"), probeDur(path.join(OUT, "stickstep-marketing-9x16-v3.mp4")).toFixed(2) + "s");
