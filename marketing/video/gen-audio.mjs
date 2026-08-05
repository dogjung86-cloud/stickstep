// 마케팅 영상 오디오 발주 — 일레븐랩스 음악(/v1/music)·효과음(/v1/sound-generation).
// XI_KEY=<키> node gen-audio.mjs [--force]
// 키는 환경변수로만 받는다(리포 저장 금지 — 게임 오디오 규칙 동일). 산출물: audio/*.mp3
// 발주 파이프라인은 qa/gen-cosmo-audio.mjs 계승. 단 BGM은 게임과 달리 루프가 아니라
// 영상 길이(47.9s)에 맞춘 48초 원샷 곡이라 루프 이음매 굽기가 없다(afade 아웃은 assemble2 몫).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY = process.env.XI_KEY;
if (!KEY) {
  console.error("XI_KEY 환경변수 필요(키는 리포에 저장하지 않는다)");
  process.exit(1);
}
const FORCE = process.argv.includes("--force");
const OUT = path.join(__dirname, "audio");
const TMP = path.join(__dirname, "tmp-audio");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

/** BGM 후보 — 게임 정체성인 8비트 치프튠 금지(코스모 머지 곡 유용이 "음악이 이상하다" 피드백의
 *  원인, 2026-08-06). ⚠ a·b(마림바·글로켄슈필·우쿨렐레·'kids' 계열 어휘)는 **유아틱 판정으로 폐기**
 *  (2026-08-06 사용자 — 파일은 보존하되 재발주·기본값 금지). 중학생 대상은 모던 테크 프로모/신스팝
 *  톤이 정답: 기본은 C, D는 BGM=audio/bgm-edu-d.mp3 node assemble2.mjs 로 교체 시청용. */
const BGM = [
  {
    name: "bgm-edu-c",
    ms: 48000,
    prompt:
      "Modern uplifting pop-electronic background music for a tech product promo video, bright felt piano and clean synth pluck melody, smooth electric bass groove, crisp light drums with a confident driving beat, fresh youthful energetic mood for teenagers, sleek stylish polished sound like a startup app launch film, 112 BPM, instrumental only, no vocals, starts immediately with a catchy hook, builds momentum steadily, ends with a clean confident resolution",
  },
  {
    name: "bgm-edu-d",
    ms: 48000,
    prompt:
      "Bright energetic modern synth-pop instrumental for a mobile app advertisement, catchy synth lead hook over punchy drums and bouncy bass, sparkling polished electronic pop production, upbeat driving rhythm, cool youthful confident vibe for teens, clean commercial sound, 120 BPM, instrumental only, no vocals, immediate catchy opening, dynamic build, finishes on a strong bright final chord",
  },
  // E = C 계열(테크 프로모 결) 유지 + 템포·리듬 업(사용자 2026-08-06 "조금 더 신나는 템포나 리듬").
  {
    name: "bgm-edu-e",
    ms: 48000,
    prompt:
      "Upbeat energetic modern pop-electronic track for a tech app promo video, driving four-on-the-floor beat with punchy tight drums, groovy syncopated electric bass, bright felt piano stabs and clean synth pluck hooks, sparkling accents, fast confident momentum, sleek polished startup launch film energy, fun and exciting but not childish, 124 BPM, instrumental only, no vocals, kicks off instantly with energy, keeps driving throughout, big bright final resolution",
  },
];

/** 효과음 5종 — 배치는 assemble2.mjs EVENTS 표가 정본(전환 시각은 xfade 오프셋에서 파생). */
const SFX = [
  { name: "sfx-swish", dur: 0.7, prompt: "short soft airy whoosh, smooth phone app screen swipe transition, gentle clean swish, no impact, subtle" },
  { name: "sfx-rise",  dur: 0.9, prompt: "quick soft upward whoosh with a light bright shimmer tail, app screen sliding up transition sound, smooth and gentle" },
  { name: "sfx-pop",   dur: 0.6, prompt: "cute soft round bubble pop with a tiny bright sparkle, friendly app UI element reveal sound, warm pleasant, single pop" },
  { name: "sfx-steps", dur: 1.0, prompt: "six very fast light tiny footstep taps in a quick run, cute cartoon pitter patter on wood, dry close no reverb, rapid tapping" },
  { name: "sfx-tada",  dur: 1.6, prompt: "short warm cheerful success chime, bright glockenspiel arpeggio flourish with soft sparkle shimmer, gentle achievement fanfare for a kids education app, not loud, no drums" },
];

function ff(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

function probeDur(file) {
  return Number(
    execFileSync("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim(),
  );
}

async function call(url, body, outFile) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
      return;
    }
    const err = await res.text();
    console.error(`  HTTP ${res.status} (시도 ${attempt}/3):`, err.slice(0, 240));
    if (res.status === 429 || res.status >= 500) await new Promise((r) => setTimeout(r, 4000 * attempt));
    else throw new Error(`API 실패: ${res.status}`);
  }
  throw new Error("3회 재시도 실패");
}

// ── BGM: 발주 → 라우드니스 정규화 → mp3 160k (원샷 곡 — 루프 굽기 없음) ──
for (const t of BGM) {
  const out = path.join(OUT, `${t.name}.mp3`);
  if (!FORCE && fs.existsSync(out)) {
    console.log(`skip ${t.name} (있음 — --force로 재발주)`);
    continue;
  }
  console.log(`music ${t.name} ...`);
  const raw = path.join(TMP, `${t.name}-raw.mp3`);
  await call("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", { prompt: t.prompt, music_length_ms: t.ms }, raw);
  ff(["-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "libmp3lame", "-b:a", "160k", out]);
  console.log(`  → ${out} (${probeDur(out).toFixed(1)}s, ${(fs.statSync(out).size / 1024).toFixed(0)}KB)`);
}

// ── SFX: 발주 → 라우드니스 정규화 → mp3 96k ──
for (const s of SFX) {
  const out = path.join(OUT, `${s.name}.mp3`);
  if (!FORCE && fs.existsSync(out)) {
    console.log(`skip ${s.name} (있음 — --force로 재발주)`);
    continue;
  }
  console.log(`sfx ${s.name} ...`);
  const raw = path.join(TMP, `${s.name}-raw.mp3`);
  await call(
    "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",
    { text: s.prompt, duration_seconds: s.dur, prompt_influence: 0.55 },
    raw,
  );
  ff(["-i", raw, "-af", "loudnorm=I=-16:TP=-1.5", "-c:a", "libmp3lame", "-b:a", "96k", out]);
  console.log(`  → ${out} (${probeDur(out).toFixed(2)}s, ${(fs.statSync(out).size / 1024).toFixed(0)}KB)`);
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log("DONE");
