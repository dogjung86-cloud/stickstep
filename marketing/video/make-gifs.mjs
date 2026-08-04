// 유튜브 커뮤니티용 GIF 짤 — beats-raw/의 원속 랩 영상에서 다크 무대만 크롭해 루프 GIF로.
// 선행: node rebuild-beats.mjs (beats-raw/*.mp4 생성)
// 실행: node make-gifs.mjs   → out/gifs/*.gif
//
// crop은 1080x1920 기준 "w:h:x:y". 랩 화면 구성이 바뀌면 좌표를 다시 잡아야 하므로,
// 생성 후 반드시 out/gifs/chk-*.jpg(중간 프레임)를 눈으로 확인할 것.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, "beats-raw");
const OUT = path.join(__dirname, "out", "gifs");
fs.mkdirSync(OUT, { recursive: true });

const ff = (args, tag) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error("ffmpeg 실패: " + tag);
};

const JOBS = [
  { name: "gif-boyle-syringe", src: "b3-boyle.mp4", ss: 0.7, t: 8.6, crop: "968:1140:56:500" },
  { name: "gif-moon-phase", src: "b4-moon.mp4", ss: 0.8, t: 8.5, crop: "968:990:56:650" },
  { name: "gif-laser-reflect", src: "b5-laser.mp4", ss: 0.7, t: 7.8, crop: "968:890:56:235" },
  { name: "gif-ice-boil", src: "b2-matter.mp4", ss: 0.6, t: 8.8, crop: "968:900:56:610" },
];

for (const j of JOBS) {
  const dst = path.join(OUT, `${j.name}.gif`);
  ff(
    ["-ss", String(j.ss), "-t", String(j.t), "-i", path.join(RAW, j.src),
     "-vf", `crop=${j.crop},scale=480:-2:flags=lanczos,fps=14,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`,
     dst],
    j.name,
  );
  ff(["-ss", "4", "-i", dst, "-frames:v", "1", path.join(OUT, `chk-${j.name}.jpg`)], `chk-${j.name}`);
  console.log(j.name, "→", (fs.statSync(dst).size / 1024 / 1024).toFixed(2) + "MB");
}
console.log("GIFS DONE — out/gifs/chk-*.jpg 눈검수 필수");
