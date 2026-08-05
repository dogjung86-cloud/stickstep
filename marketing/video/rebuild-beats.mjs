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

// [폴더, 시작 트림(s), 꼬리 홀드(s), 최대 길이(s, 선택)]
// 최대 길이 = 산출 영상 기준. b4-moon은 6.1s에 마지막 목표(상현)를 달성하면서 안내문이 2줄→5줄로
// 늘어나 무대가 115px 아래로 밀린다(스크롤 아님, 텍스트 리플로우) — 궤도 드래그는 6.0s에 이미
// 완주하므로 그 직전에서 끊는다. 사용자 지적 "우주 3d 막판에 화면이 살짝 내려간다"(2026-08-05).
const SEQ = [
  ["b0b-enter", 0.0, 0.5],
  ["bE-exam", 0.0, 0.6],
  ["bN-note", 0.0, 0.6],
  ["b1-heat", 0.35, 0.8],
  ["b2-matter", 0.3, 0.7],
  ["b3-boyle", 0.35, 0.7],
  ["b4-moon", 0.3, 0.7, 5.9],
  ["b5-laser", 0.35, 0.7],
  ["b8-quiz", 0.1, 1.2],
  // GIF 전용 비트(make-gifs.mjs만 사용 — 본편 조립에는 안 들어간다)
  ["b1r-heat", 0.3, 0.5],
  ["b2r-matter", 0.3, 0.5],
  ["b6r-color", 0.2, 0.5],
  ["b7r-mol", 0.2, 0.5],
  ["b8r-atom", 0.2, 0.5],
  ["b9r-wave", 0.2, 0.5],
  ["b10r-leaf", 0.2, 0.3],
];

const FPS = 30;
for (const [name, trim, tail, cap] of SEQ) {
  const dir = path.join(CAP, name);
  if (!fs.existsSync(dir)) { console.log(name, "SKIP(캡처 없음)"); continue; }
  const times = JSON.parse(fs.readFileSync(path.join(dir, "times.json"), "utf8"));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort();
  const t0 = times[0];
  const seqDir = path.join(dir, "seq");
  fs.rmSync(seqDir, { recursive: true, force: true });
  fs.mkdirSync(seqDir);
  const end = Math.min(times[times.length - 1] - t0 + tail, cap ? trim + cap : Infinity);
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
