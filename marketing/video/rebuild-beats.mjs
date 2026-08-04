// 자막 없는 캡처(cap/)를 원속(1.0x) mp4로 빌드 → beats-raw/ (컴포지터 v3 소스)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CAP = path.join(__dirname, "cap");
const RAW = path.join(__dirname, "beats-raw");
fs.mkdirSync(RAW, { recursive: true });

const ff = (args, tag) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error("ffmpeg 실패: " + tag);
};

// [폴더, 시작 트림(s), 꼬리 홀드(s)]
const SEQ = [
  ["b0b-enter", 0.0, 0.5],
  ["bE-exam", 0.0, 0.6],
  ["bN-note", 0.0, 0.6],
  ["b1-heat", 0.35, 0.8],
  ["b2-matter", 0.3, 0.7],
  ["b3-boyle", 0.35, 0.7],
  ["b4-moon", 0.3, 0.7],
  ["b5-laser", 0.35, 0.7],
  ["b6-color", 0.3, 0.6],
  ["b7-comic", 0.1, 0.9],
  ["b8-quiz", 0.1, 1.2],
];

const FPS = 30;
for (const [name, trim, tail] of SEQ) {
  const dir = path.join(CAP, name);
  const times = JSON.parse(fs.readFileSync(path.join(dir, "times.json"), "utf8"));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort();
  const t0 = times[0];
  const seqDir = path.join(dir, "seq");
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
      "-c:v", "libx264", "-crf", "16", "-preset", "medium",
      path.join(RAW, `${name}.mp4`)], name);
  console.log(name, "OK");
}
console.log("RAW BEATS DONE");
